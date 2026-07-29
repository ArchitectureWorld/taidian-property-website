const assert = require('node:assert/strict');
const math = require('../story-math.js');

for (const p of [0, 0.001, 0.24, 0.25, 0.499, 0.5, 0.75, 0.999, 1]) {
  const weights = math.sequenceWeights(p, [0, 0, 1, 2, 3], 4);
  assert.equal(weights.length, 4);
  assert.ok(weights.every((value) => value >= -1e-9 && value <= 1 + 1e-9));
  assert.ok(Math.abs(weights.reduce((sum, value) => sum + value, 0) - 1) < 1e-7);
}

const before = math.sequenceWeights(0.4999, [0, 0, 1, 2, 3], 4);
const after = math.sequenceWeights(0.5001, [0, 0, 1, 2, 3], 4);
const jump = before.reduce((sum, value, index) => sum + Math.abs(value - after[index]), 0);
assert.ok(jump < 0.01, `image blend discontinuity: ${jump}`);

assert.equal(math.interpolateKeyframes(0, [0.1, 0.3, 0.7, 0.2, 0.6]), 0.1);
assert.equal(math.interpolateKeyframes(1, [0.1, 0.3, 0.7, 0.2, 0.6]), 0.6);
assert.ok(math.interpolateKeyframes(0.5, [0.1, 0.3, 0.7, 0.2, 0.6]) > 0.69);

const damped = math.damp(0, 1, 14, 1 / 60);
assert.ok(damped > 0 && damped < 1);
console.log('story math ok');
