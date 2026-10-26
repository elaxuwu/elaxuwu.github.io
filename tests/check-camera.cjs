const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Exercise the actual frame code with scroll already settled at the top,
// while the camera and singularity still have momentum to ease out.
const source = fs.readFileSync(path.join(__dirname, '../hero-scene.js'), 'utf8');
const start = source.indexOf('        // Camera Physical Momentum Damping');
const end = source.indexOf('        // Singularity position and spin', start);
assert(start >= 0 && end > start, 'Camera update must be present');
const update = new vm.Script('{' + source.slice(start, end) + '}');

for (const fps of [30, 60, 144]) {
    for (const pointer of [0, 1]) {
        const state = vm.createContext({
            delta: 1 / fps, clockTime: 5, targetProgress: 0, currentProgress: 0,
            cosmosTransition: 0,
            currentPointerX: pointer, currentPointerY: -pointer,
            flight: { rotX: 0, rotY: 0, rotZ: 0 },
            targetCamX: pointer * 0.45, targetCamY: -pointer * 0.3, targetCamZ: 16,
            targetSingX: 3.6, targetSingY: 0.2, targetSingZ: 0,
            currentCamX: 0.7, currentCamY: -0.5, currentCamZ: 16.03,
            currentSingX: 3.9, currentSingY: 0.4, currentSingZ: -0.2,
            currentRotX: 0.08, currentRotY: -0.07, currentRotZ: 0.06,
            currentLookAt: { lerp() {} }, targetLookAt: {},
            camera: { position: { set() {} }, rotation: { set() {} } }
        });
        const targets = {
            currentCamX: state.targetCamX, currentCamY: state.targetCamY,
            currentCamZ: 16, currentSingX: 3.6, currentSingY: 0.2, currentSingZ: 0,
            currentRotX: -pointer * 0.04, currentRotY: pointer * 0.06,
            currentRotZ: Math.sin(state.clockTime * 0.15) * 0.015
        };
        for (let frame = 0; frame < fps * 3; frame++) {
            const before = Object.fromEntries(Object.keys(targets).map(key => [key, state[key]]));
            update.runInContext(state);
            for (const [key, target] of Object.entries(targets)) {
                const expected = before[key] + (target - before[key]) * (1 - Math.exp(-state.delta * 6.5));
                assert(Math.abs(state[key] - expected) < 1e-12,
                    `${key} must ease continuously at ${fps} fps (pointer ${pointer}, frame ${frame})`);
            }
        }
        for (const [key, target] of Object.entries(targets)) {
            assert(Math.abs(state[key] - target) < 1e-8, `${key} must settle at its target`);
        }
    }
}
console.log('Passed: Classic camera return eases without resets at 30/60/144 fps, preserving pointer offsets and idle roll.');
