(function attachStoryMath(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.TaidianStoryMath = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function storyMathFactory() {
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const lerp = (a, b, amount) => a + (b - a) * amount;
  const smootherstep = (value) => {
    const t = clamp(value);
    return t * t * t * (t * (t * 6 - 15) + 10);
  };
  const damp = (current, target, lambda, deltaSeconds) => (
    current + (target - current) * (1 - Math.exp(-lambda * deltaSeconds))
  );

  function interpolateKeyframes(progress, values) {
    if (!Array.isArray(values) || values.length === 0) return 0;
    if (values.length === 1) return values[0];
    const scaled = clamp(progress) * (values.length - 1);
    const from = Math.min(values.length - 1, Math.floor(scaled));
    const to = Math.min(values.length - 1, from + 1);
    const mix = smootherstep(scaled - from);
    return lerp(values[from], values[to], mix);
  }

  function sequenceWeights(progress, sequence, assetCount) {
    const safeCount = Math.max(1, Number(assetCount) || 1);
    const weights = Array.from({ length: safeCount }, () => 0);
    if (!Array.isArray(sequence) || sequence.length === 0) {
      weights[0] = 1;
      return weights;
    }
    if (sequence.length === 1) {
      weights[clamp(Math.round(sequence[0]), 0, safeCount - 1)] = 1;
      return weights;
    }

    const scaled = clamp(progress) * (sequence.length - 1);
    const from = Math.min(sequence.length - 1, Math.floor(scaled));
    const to = Math.min(sequence.length - 1, from + 1);
    const mix = smootherstep(scaled - from);
    const fromIndex = clamp(Math.round(sequence[from]), 0, safeCount - 1);
    const toIndex = clamp(Math.round(sequence[to]), 0, safeCount - 1);

    if (fromIndex === toIndex) {
      weights[fromIndex] = 1;
    } else {
      weights[fromIndex] = 1 - mix;
      weights[toIndex] = mix;
    }
    return weights;
  }

  function chapterData(progress, count = 5) {
    const safeCount = Math.max(2, count);
    const scaled = clamp(progress) * (safeCount - 1);
    const from = Math.min(safeCount - 1, Math.floor(scaled));
    const to = Math.min(safeCount - 1, from + 1);
    return { scaled, from, to, mix: smootherstep(scaled - from) };
  }

  return { clamp, lerp, smootherstep, damp, interpolateKeyframes, sequenceWeights, chapterData };
});
