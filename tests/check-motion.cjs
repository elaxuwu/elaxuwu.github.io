const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const events = {}, windowEvents = {}, ticker = new Set(), frames = new Map();
let reduced = false, frameId = 0, refreshes = 0, scrolls = 0, destructions = 0;
const clicks = [];
const anchor = { addEventListener(type, callback) { if (type === 'click') clicks.push(callback); }, getAttribute() { return '#work'; } };
const section = {};
const document = {
    body: {}, documentElement: { scrollHeight: 2000 }, readyState: 'complete', fonts: { ready: Promise.resolve() },
    querySelector(selector) { return selector === '#work' ? section : null; },
    getElementById() { return null; },
    querySelectorAll(selector) { return selector === 'a[href^="#"]' ? [anchor] : []; },
    addEventListener(type, callback) { (events[type] ||= []).push(callback); }
};
const gsap = {
    registerPlugin() {}, context(callback) { callback(); return { revert() {} }; }, killTweensOf() {},
    ticker: { add(callback) { ticker.add(callback); }, remove(callback) { ticker.delete(callback); }, lagSmoothing() {} }
};
const ScrollTrigger = {
    addEventListener() {}, removeEventListener() {}, update() {}, refresh() { refreshes++; }, getAll() { return []; }
};
class Lenis {
    on() {} raf() {} destroy() { destructions++; } scrollTo(target) { assert.equal(target, section); scrolls++; }
}
class HTMLImageElement {}
const window = { innerHeight: 800, motionIsReduced: () => reduced, addEventListener(type, callback) { windowEvents[type] = callback; } };
const context = { document, window, gsap, ScrollTrigger, Lenis, AbortController, HTMLImageElement,
    requestAnimationFrame(callback) { frames.set(++frameId, callback); return frameId; }, cancelAnimationFrame(id) { frames.delete(id); }, setTimeout() {} };
const source = fs.readFileSync(require('node:path').join(__dirname, '../motion.js'), 'utf8').replace(/^import .+;\r?\n/gm, '');
vm.runInNewContext(source, context);
function flushFrames() { const pending = [...frames.values()]; frames.clear(); pending.forEach(callback => callback()); }
assert.equal(ticker.size, 1);
assert.equal(clicks.length, 1);
for (let i = 0; i < 10; i++) {
    reduced = true; events.motionchange.forEach(callback => callback()); assert.equal(ticker.size, 0);
    reduced = false; events.motionchange.forEach(callback => callback()); assert.equal(ticker.size, 1);
}
assert.equal(clicks.length, 1, 'Anchor listener must not accumulate');
clicks[0]({ preventDefault() {} }); assert.equal(scrolls, 1);
flushFrames();
const previous = refreshes;
events.languagechange.forEach(callback => { callback(); callback(); });
events.load.forEach(callback => { callback({ target: new HTMLImageElement() }); callback({ target: new HTMLImageElement() }); });
flushFrames(); assert.equal(refreshes, previous + 1, 'Coalesce refreshes in the same frame');
windowEvents.pagehide({ persisted: false }); assert.equal(ticker.size, 0); assert.equal(frames.size, 0);
assert.equal(destructions, 11);
console.log('Passed: 10 motion toggles keep one ticker/listener, one scroll per click, batched layout refresh and cleanup.');
