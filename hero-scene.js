import * as THREE from 'three';

const canvas = document.getElementById('hero-field');

function createField() {
    const isMobile = matchMedia('(max-width: 768px)').matches;
    const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: !isMobile,
        powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.2 : 1.5));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(44, window.innerWidth / window.innerHeight, 0.1, 90);
    camera.position.set(0, 0, 16);

    const cosmicGroup = new THREE.Group();
    scene.add(cosmicGroup);

    // Singularity (Black Hole core + Accretion Disk)
    const singularity = new THREE.Group();
    cosmicGroup.add(singularity);
    singularity.position.set(3.6, 0.2, 0);

    // Core event horizon (pitch black cosmic void)
    const coreGeometry = new THREE.SphereGeometry(1.28, 24, 24);
    const coreMaterial = new THREE.MeshBasicMaterial({ color: 0x090710 });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    singularity.add(coreMesh);

    // Inner photon ring
    const photonGeometry = new THREE.TorusGeometry(1.36, 0.022, 8, 80);
    const photonMaterial = new THREE.MeshBasicMaterial({ color: 0xcfc4ff, transparent: true, opacity: 0.65 });
    const photonRing = new THREE.Mesh(photonGeometry, photonMaterial);
    photonRing.rotation.x = Math.PI * 0.42;
    singularity.add(photonRing);

    // Accretion disk rings
    const ringColor = new THREE.Color(0xa79bea);
    const ringMaterial = new THREE.MeshBasicMaterial({ color: ringColor, transparent: true, opacity: 0.35 });
    const ringGeometries = [
        new THREE.TorusGeometry(2.4, 0.03, 6, 100),
        new THREE.TorusGeometry(3.3, 0.024, 6, 120),
        new THREE.TorusGeometry(4.3, 0.018, 6, 120)
    ];
    const ringMeshes = ringGeometries.map((geo, idx) => {
        const ring = new THREE.Mesh(geo, ringMaterial);
        ring.rotation.set(0.48 + idx * 0.08, 0.32 + idx * 0.05, idx * 0.12);
        singularity.add(ring);
        return ring;
    });

    // Vertical gravitational lensing ring (Interstellar warp silhouette)
    const lensGeometry = new THREE.TorusGeometry(3.1, 0.022, 6, 110);
    const lensMaterial = new THREE.MeshBasicMaterial({ color: ringColor, transparent: true, opacity: 0.22 });
    const lensRing = new THREE.Mesh(lensGeometry, lensMaterial);
    lensRing.rotation.set(1.42, 0.2, 0.1);
    singularity.add(lensRing);

    // Pulsar energy ring (pulsates on scroll)
    const pulsarGeometry = new THREE.TorusGeometry(5.2, 0.016, 6, 90);
    const pulsarMaterial = new THREE.MeshBasicMaterial({ color: ringColor, transparent: true, opacity: 0.18 });
    const pulsarRing = new THREE.Mesh(pulsarGeometry, pulsarMaterial);
    pulsarRing.rotation.set(0.65, -0.4, 0.5);
    singularity.add(pulsarRing);

    // Volumetric Starfield with relativistic warp streaks
    const starCount = isMobile ? 320 : 760;
    const starGeometry = new THREE.CylinderGeometry(0.028, 0.028, 1, 5);
    starGeometry.rotateX(Math.PI / 2); // align along Z
    const starMaterial = new THREE.MeshBasicMaterial({ color: ringColor, transparent: true, opacity: 0.72 });
    const starField = new THREE.InstancedMesh(starGeometry, starMaterial, starCount);
    cosmicGroup.add(starField);

    const starTransform = new THREE.Object3D();
    const starData = [];

    for (let i = 0; i < starCount; i++) {
        let x, y, z;
        if (i < 160) {
            // Spiral accretion particles orbiting the singularity
            const angle = i * 0.19;
            const rad = 1.8 + Math.sqrt(i / 160) * 5.2;
            x = singularity.position.x + Math.cos(angle) * rad;
            y = singularity.position.y + Math.sin(angle) * rad * 0.45;
            z = singularity.position.z + (Math.sin(i * 0.4) * 0.8);
        } else {
            // Corridor starfield stretching from Z=+18 to Z=-52
            const spreadRadius = 4 + Math.random() * 15;
            const spreadAngle = Math.random() * Math.PI * 2;
            x = Math.cos(spreadAngle) * spreadRadius;
            y = Math.sin(spreadAngle) * spreadRadius * 0.65;
            z = 18 - (i / starCount) * 70 + (Math.random() - 0.5) * 6;
        }

        const baseScale = 0.35 + (i % 6) * 0.12;
        starData.push({ x, y, z, baseScale, seed: Math.random() * 10 });
        starTransform.position.set(x, y, z);
        starTransform.scale.set(baseScale, baseScale, 0.06);
        starTransform.updateMatrix();
        starField.setMatrixAt(i, starTransform.matrix);
    }
    starField.instanceMatrix.needsUpdate = true;

    // Flight Waypoints along the scroll corridor:
    // 0.0: Hero | 0.28: Games | 0.58: Projects | 0.82: Achievements | 1.0: Contact
    const waypoints = [
        { p: 0.00, cam: [0, 0, 16], rot: [0, 0, 0], sing: [3.6, 0.2, 0] },
        { p: 0.28, cam: [1.8, -0.6, 6.5], rot: [0.06, -0.14, 0.03], sing: [2.6, -0.4, -0.5] },
        { p: 0.58, cam: [-2.1, 0.4, -6], rot: [-0.05, 0.16, -0.02], sing: [0.6, 0.5, -4] },
        { p: 0.82, cam: [0.8, -0.7, -19], rot: [0.04, -0.07, 0.02], sing: [-1.4, -0.5, -18] },
        { p: 1.00, cam: [0, 0, -32], rot: [0, 0, 0], sing: [0, 0, -32] }
    ];

    function interpolateFlight(progress) {
        const clamped = Math.max(0, Math.min(1, progress));
        let i = 0;
        while (i < waypoints.length - 2 && waypoints[i + 1].p < clamped) {
            i++;
        }
        const w0 = waypoints[i];
        const w1 = waypoints[i + 1];
        const span = w1.p - w0.p;
        const localT = span > 0 ? (clamped - w0.p) / span : 0;
        // Smoothstep interpolation
        const smoothT = localT * localT * (3 - 2 * localT);

        return {
            camX: w0.cam[0] + (w1.cam[0] - w0.cam[0]) * smoothT,
            camY: w0.cam[1] + (w1.cam[1] - w0.cam[1]) * smoothT,
            camZ: w0.cam[2] + (w1.cam[2] - w0.cam[2]) * smoothT,
            rotX: w0.rot[0] + (w1.rot[0] - w0.rot[0]) * smoothT,
            rotY: w0.rot[1] + (w1.rot[1] - w0.rot[1]) * smoothT,
            rotZ: w0.rot[2] + (w1.rot[2] - w0.rot[2]) * smoothT,
            singX: w0.sing[0] + (w1.sing[0] - w0.sing[0]) * smoothT,
            singY: w0.sing[1] + (w1.sing[1] - w0.sing[1]) * smoothT,
            singZ: w0.sing[2] + (w1.sing[2] - w0.sing[2]) * smoothT
        };
    }

    // State & Interactive Damping
    const signal = new AbortController();
    const options = { signal: signal.signal };

    let targetProgress = 0;
    let currentProgress = 0;
    let currentCamX = 0, currentCamY = 0, currentCamZ = 16;
    let currentRotX = 0, currentRotY = 0, currentRotZ = 0;
    let currentSingX = 3.6, currentSingY = 0.2, currentSingZ = 0;
    let targetVelocity = 0;
    let currentVelocity = 0;
    let lastWarp = 0.06;
    let targetPointerX = 0, targetPointerY = 0;
    let currentPointerX = 0, currentPointerY = 0;
    let visible = true, playing = false, lastFrame = 0, clockTime = 0;

    const reduced = () => typeof window.motionIsReduced === 'function' ? window.motionIsReduced() : matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Public controller for ScrollTrigger sync
    window.cosmicFlight = {
        setProgress(progress, velocity = 0) {
            targetProgress = Math.max(0, Math.min(1, progress));
            targetVelocity = Math.min(Math.abs(velocity) / 600, 3.5);
        }
    };

    function render() {
        renderer.render(scene, camera);
    }

    function frame(now) {
        const delta = Math.min((now - lastFrame) / 1000, 0.05);
        lastFrame = now;
        clockTime += delta;

        // Progress damping (responsive convergence)
        const progressDamping = 1 - Math.exp(-delta * 6);
        currentProgress += (targetProgress - currentProgress) * progressDamping;
        if (Math.abs(currentProgress - targetProgress) < 0.0008) {
            currentProgress = targetProgress;
        }

        // Pointer damping
        const pointerDamping = 1 - Math.exp(-delta * 5);
        currentPointerX += (targetPointerX - currentPointerX) * pointerDamping;
        currentPointerY += (targetPointerY - currentPointerY) * pointerDamping;

        // Velocity damping for warp streaks
        const velocityDamping = 1 - Math.exp(-delta * 7);
        currentVelocity += (targetVelocity - currentVelocity) * velocityDamping;
        targetVelocity *= Math.exp(-delta * 4); // decay velocity

        // Interpolate target camera waypoint
        const flight = interpolateFlight(currentProgress);

        // Camera physical momentum damping
        const camDamping = 1 - Math.exp(-delta * 6.5);
        currentCamX += (flight.camX - currentCamX) * camDamping;
        currentCamY += (flight.camY - currentCamY) * camDamping;
        currentCamZ += (flight.camZ - currentCamZ) * camDamping;
        currentRotX += (flight.rotX - currentRotX) * camDamping;
        currentRotY += (flight.rotY - currentRotY) * camDamping;
        currentRotZ += (flight.rotZ - currentRotZ) * camDamping;
        currentSingX += (flight.singX - currentSingX) * camDamping;
        currentSingY += (flight.singY - currentSingY) * camDamping;
        currentSingZ += (flight.singZ - currentSingZ) * camDamping;

        // Perfect return to baseline origin when user is at page top
        if (targetProgress === 0 && currentProgress === 0) {
            if (Math.abs(currentCamZ - 16) < 0.04) {
                currentCamX = 0; currentCamY = 0; currentCamZ = 16;
                currentRotX = 0; currentRotY = 0; currentRotZ = 0;
                currentSingX = 3.6; currentSingY = 0.2; currentSingZ = 0;
            }
        }

        camera.position.set(
            currentCamX + currentPointerX * 0.45,
            currentCamY + currentPointerY * 0.3,
            currentCamZ
        );
        camera.rotation.set(
            currentRotX + currentPointerY * 0.04,
            currentRotY + currentPointerX * 0.06,
            currentRotZ + Math.sin(clockTime * 0.15) * 0.015
        );

        // Update singularity position and ambient spin
        singularity.position.set(currentSingX, currentSingY, currentSingZ);
        photonRing.rotation.z = clockTime * 0.4;
        ringMeshes[0].rotation.z = clockTime * 0.08;
        ringMeshes[1].rotation.z = -clockTime * 0.06;
        ringMeshes[2].rotation.z = clockTime * 0.04;
        lensRing.rotation.z = clockTime * 0.03;

        // Pulsar expansion
        const pulse = 1 + Math.sin(clockTime * 1.8) * 0.06;
        pulsarRing.scale.set(pulse, pulse, pulse);

        // Relativistic warp streak expansion on starfield (only when velocity changes)
        const warpFactor = Math.max(0.06, currentVelocity * 1.8);
        if (Math.abs(warpFactor - lastWarp) > 0.005 || currentVelocity > 0.02) {
            lastWarp = warpFactor;
            for (let i = 0; i < starCount; i++) {
                const data = starData[i];
                starTransform.position.set(data.x, data.y, data.z);
                starTransform.scale.set(data.baseScale, data.baseScale, warpFactor * data.baseScale);
                starTransform.updateMatrix();
                starField.setMatrixAt(i, starTransform.matrix);
            }
            starField.instanceMatrix.needsUpdate = true;
        }

        render();
    }

    function schedule() {
        const next = visible && !document.hidden && !reduced();
        if (next !== playing) {
            playing = next;
            lastFrame = performance.now();
            renderer.setAnimationLoop(next ? frame : null);
        }
        if (!next) {
            camera.position.set(0, 0, 16);
            camera.rotation.set(0, 0, 0);
            render();
        }
    }

    function resize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        render();
    }

    function theme() {
        const light = document.documentElement.dataset.theme === 'light';
        const primaryColor = light ? 0x7052b5 : 0xa79bea;
        const dimColor = light ? 0x937fc4 : 0x7660c7;

        coreMaterial.color.setHex(light ? 0xf0ecf8 : 0x090710);
        photonMaterial.color.setHex(primaryColor);
        ringMaterial.color.setHex(primaryColor);
        lensMaterial.color.setHex(dimColor);
        pulsarMaterial.color.setHex(primaryColor);
        starMaterial.color.setHex(primaryColor);

        ringMaterial.opacity = light ? 0.22 : 0.35;
        starMaterial.opacity = light ? 0.48 : 0.72;
        render();
    }

    window.addEventListener('resize', resize, options);
    window.addEventListener('pointermove', event => {
        if (reduced()) return;
        targetPointerX = (event.clientX / window.innerWidth) * 2 - 1;
        targetPointerY = -(event.clientY / window.innerHeight) * 2 + 1;
    }, options);

    window.addEventListener('pointerleave', () => {
        targetPointerX = 0;
        targetPointerY = 0;
    }, options);

    document.addEventListener('themechange', theme, options);
    document.addEventListener('motionchange', schedule, options);
    document.addEventListener('visibilitychange', schedule, options);
    window.addEventListener('pageshow', schedule, options);

    canvas.addEventListener('webglcontextlost', event => {
        event.preventDefault();
        renderer.setAnimationLoop(null);
        canvas.hidden = true;
    }, options);

    window.addEventListener('pagehide', event => {
        if (event.persisted) {
            renderer.setAnimationLoop(null);
            playing = false;
            return;
        }
        signal.abort();
        renderer.setAnimationLoop(null);
        coreGeometry.dispose();
        coreMaterial.dispose();
        photonGeometry.dispose();
        photonMaterial.dispose();
        lensGeometry.dispose();
        lensMaterial.dispose();
        pulsarGeometry.dispose();
        pulsarMaterial.dispose();
        starGeometry.dispose();
        starMaterial.dispose();
        ringMaterial.dispose();
        ringGeometries.forEach(g => g.dispose());
        renderer.dispose();
        renderer.forceContextLoss();
    }, options);

    theme();
    resize();
    schedule();
}

if (canvas) {
    try {
        createField();
    } catch (_) {
        canvas.hidden = true;
    }
}
