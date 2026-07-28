(() => {
  const story = document.getElementById('scrollStory');
  const scene = document.getElementById('scene');
  const canvas = document.getElementById('service-overlay');
  const context = canvas.getContext('2d', { alpha: true, desynchronized: true });
  const scanLine = document.getElementById('scanLine');
  const copyStates = [...document.querySelectorAll('[data-copy-state]')];
  const tabs = [...document.querySelectorAll('.state-tab')];
  const topButtons = [...document.querySelectorAll('.topnav [data-state]')];
  const code = document.getElementById('chapterCode');
  const progressFill = document.getElementById('progressFill');
  const modelLabel = document.getElementById('modelLabel');
  const nextButton = document.getElementById('nextState');
  const root = document.documentElement;

  const labels = [
    'LAYER / DAILY SERVICE',
    'LAYER / EXPERIENCE SIGNAL',
    'LAYER / RENEWAL TRACE',
    'LAYER / VALUE PATH',
    'LAYER / PARTNERSHIP',
  ];
  const focuses = [
    [0, 1, 2, 4, 6],
    [1, 3, 5, 7, 8],
    [0, 2, 3, 6, 9],
    [2, 4, 5, 8, 9],
    [0, 1, 4, 7, 9],
  ];
  const focusSets = focuses.map(items => new Set(items));
  const positions = [
    [[.13,.24],[.31,.18],[.52,.25],[.74,.18],[.88,.34],[.22,.48],[.43,.44],[.63,.47],[.81,.56],[.56,.72]],
    [[.18,.19],[.37,.22],[.55,.17],[.78,.25],[.9,.4],[.25,.44],[.46,.49],[.67,.42],[.8,.62],[.55,.76]],
    [[.12,.31],[.28,.16],[.49,.32],[.7,.2],[.87,.3],[.2,.55],[.4,.47],[.62,.55],[.84,.51],[.54,.75]],
    [[.1,.23],[.3,.23],[.5,.23],[.7,.23],[.9,.23],[.2,.51],[.4,.51],[.6,.51],[.8,.51],[.5,.76]],
    [[.15,.2],[.34,.17],[.52,.23],[.72,.17],[.87,.33],[.24,.49],[.44,.43],[.64,.49],[.82,.58],[.56,.7]],
  ];
  const edges = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[6,9],[2,6],[4,8],[7,9]];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const contentEnd = 0.82;
  const handoffStart = 0.86;

  let width = 1;
  let height = 1;
  let ratio = 1;
  let storyStart = 0;
  let storyDistance = 1;
  let targetProgress = 0;
  let displayProgress = 0;
  let pointerTargetX = 0;
  let pointerTargetY = 0;
  let pointerX = 0;
  let pointerY = 0;
  let animationFrame = 0;
  let measureFrame = 0;
  let lastFrameTime = 0;
  let activeState = -1;
  let initialized = false;

  const frameTimes = [];
  window.__TAIDIAN_SCROLL_DEBUG__ = {
    frameTimes,
    get targetProgress() { return targetProgress; },
    get displayProgress() { return displayProgress; },
  };

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const lerp = (a, b, amount) => a + (b - a) * amount;
  const smoothstep = (start, end, value) => {
    const normalized = clamp((value - start) / Math.max(0.0001, end - start));
    return normalized * normalized * (3 - 2 * normalized);
  };
  const damp = (current, target, lambda, deltaSeconds) => (
    current + (target - current) * (1 - Math.exp(-lambda * deltaSeconds))
  );

  function createGlowSprite(size, strong = false) {
    const sprite = document.createElement('canvas');
    sprite.width = size;
    sprite.height = size;
    const spriteContext = sprite.getContext('2d');
    const center = size / 2;
    const gradient = spriteContext.createRadialGradient(center, center, 0, center, center, center);
    gradient.addColorStop(0, strong ? 'rgba(255,207,133,.9)' : 'rgba(242,188,98,.5)');
    gradient.addColorStop(0.28, strong ? 'rgba(255,207,133,.25)' : 'rgba(242,188,98,.14)');
    gradient.addColorStop(1, 'rgba(242,188,98,0)');
    spriteContext.fillStyle = gradient;
    spriteContext.fillRect(0, 0, size, size);
    return sprite;
  }

  const flowGlow = createGlowSprite(36, true);
  const nodeGlow = createGlowSprite(50, false);
  const projected = Array.from({ length: 10 }, () => ({ x: 0, y: 0 }));

  function stateData(progress) {
    const scaled = progress * 4;
    const from = Math.min(4, Math.floor(scaled));
    const to = Math.min(4, from + 1);
    const mix = smoothstep(0, 1, scaled - from);
    return { scaled, from, to, mix };
  }

  function updateCopy(state) {
    const { scaled, from, to, mix } = state;
    for (const element of copyStates) {
      element.style.opacity = '0';
      element.style.transform = 'translate3d(0, 20px, 0)';
    }

    const blend = from === to ? 0 : smoothstep(0.36, 0.64, mix);
    const fromElement = copyStates[from];
    const toElement = copyStates[to];
    fromElement.style.opacity = (1 - blend).toFixed(3);
    fromElement.style.transform = `translate3d(0, ${(-14 * blend).toFixed(2)}px, 0)`;
    if (to !== from) {
      toElement.style.opacity = blend.toFixed(3);
      toElement.style.transform = `translate3d(0, ${(18 * (1 - blend)).toFixed(2)}px, 0)`;
    }

    const nextState = blend < 0.5 ? from : to;
    if (nextState === activeState) return;
    activeState = nextState;
    code.textContent = `${String(activeState + 1).padStart(3, '0')} / 005`;
    modelLabel.textContent = labels[activeState];
    nextButton.textContent = activeState === 4 ? '进入合作 ↓' : '继续滚动 ↓';
    for (const button of [...tabs, ...topButtons]) {
      const isActive = Number(button.dataset.state) === activeState;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-current', isActive ? 'step' : 'false');
    }
    copyStates.forEach((element, index) => element.setAttribute('aria-hidden', index === activeState ? 'false' : 'true'));
  }

  function drawOverlay(contentProgress) {
    const { scaled, from, to, mix } = stateData(contentProgress);
    const focusFrom = focusSets[from];
    const focusTo = focusSets[to];

    context.clearRect(0, 0, width, height);
    context.lineCap = 'round';

    for (let index = 0; index < projected.length; index += 1) {
      const source = positions[from][index];
      const target = positions[to][index];
      projected[index].x = lerp(source[0], target[0], mix) * width + pointerX * 7 * (source[0] - 0.5);
      projected[index].y = lerp(source[1], target[1], mix) * height + pointerY * 4 * (source[1] - 0.5);
    }

    for (let edgeIndex = 0; edgeIndex < edges.length; edgeIndex += 1) {
      const [a, b] = edges[edgeIndex];
      const start = projected[a];
      const end = projected[b];
      const fromWeight = focusFrom.has(a) || focusFrom.has(b) ? 1 : 0;
      const toWeight = focusTo.has(a) || focusTo.has(b) ? 1 : 0;
      const weight = lerp(fromWeight, toWeight, mix);

      context.globalAlpha = 0.15 + weight * 0.3;
      context.strokeStyle = '#e6eee9';
      context.lineWidth = 0.55 + weight * 0.42;
      context.beginPath();
      context.moveTo(start.x, start.y);
      context.lineTo(end.x, end.y);
      context.stroke();

      if (weight > 0.28) {
        const flow = (contentProgress * 4 + edgeIndex * 0.13) % 1;
        const x = lerp(start.x, end.x, flow);
        const y = lerp(start.y, end.y, flow);
        context.globalAlpha = 0.55 + weight * 0.35;
        context.drawImage(flowGlow, x - 13, y - 13, 26, 26);
      }
    }

    for (let index = 0; index < projected.length; index += 1) {
      const point = projected[index];
      const weight = lerp(focusFrom.has(index) ? 1 : 0, focusTo.has(index) ? 1 : 0, mix);
      if (weight > 0.15) {
        context.globalAlpha = weight * 0.72;
        context.drawImage(nodeGlow, point.x - 18, point.y - 18, 36, 36);
      }
      context.globalAlpha = 0.55 + weight * 0.42;
      context.fillStyle = weight > 0.35 ? '#f6c677' : '#e1ebe5';
      context.beginPath();
      context.arc(point.x, point.y, 1.35 + weight * 1.25, 0, Math.PI * 2);
      context.fill();
      context.globalAlpha = 0.18 + weight * 0.38;
      context.strokeStyle = '#ecf2ee';
      context.lineWidth = 0.68;
      context.beginPath();
      context.arc(point.x, point.y, 5 + weight * 4, 0, Math.PI * 2);
      context.stroke();
    }
    context.globalAlpha = 1;

    const scanX = contentProgress * width;
    scanLine.style.setProperty('--scan-x', `${scanX.toFixed(2)}px`);
    scene.style.setProperty('--image-x', `${(pointerX * -4 + contentProgress * -7).toFixed(2)}px`);
    scene.style.setProperty('--image-y', `${(pointerY * -2.5).toFixed(2)}px`);
    scene.style.setProperty('--image-scale', (1.025 + contentProgress * 0.032).toFixed(5));
    scene.style.setProperty('--scene-progress', contentProgress.toFixed(5));
    scene.style.setProperty('--scene-overlay-opacity', (0.72 + contentProgress * 0.12).toFixed(5));
    updateCopy({ scaled, from, to, mix });
    progressFill.style.transform = `scaleX(${contentProgress.toFixed(5)})`;
  }

  function updateGlobalVisuals(rawProgress, handoff) {
    root.style.setProperty('--story-progress', rawProgress.toFixed(5));
    root.style.setProperty('--handoff', handoff.toFixed(5));
    root.style.setProperty('--shell-scale', (1 - handoff * 0.038).toFixed(5));
    root.style.setProperty('--shell-y', `${(-handoff * 18).toFixed(2)}px`);
  }

  function renderFrame(now) {
    const deltaSeconds = lastFrameTime ? Math.min(0.05, Math.max(0.001, (now - lastFrameTime) / 1000)) : 1 / 60;
    lastFrameTime = now;
    frameTimes.push(deltaSeconds * 1000);
    if (frameTimes.length > 180) frameTimes.shift();

    if (reducedMotion) {
      displayProgress = targetProgress;
      pointerX = pointerTargetX;
      pointerY = pointerTargetY;
    } else {
      displayProgress = damp(displayProgress, targetProgress, 17, deltaSeconds);
      pointerX = damp(pointerX, pointerTargetX, 12, deltaSeconds);
      pointerY = damp(pointerY, pointerTargetY, 12, deltaSeconds);
    }

    const contentProgress = clamp(displayProgress / contentEnd);
    const handoff = smoothstep(handoffStart, 0.995, displayProgress);
    drawOverlay(contentProgress);
    updateGlobalVisuals(displayProgress, handoff);

    const stillMoving = (
      Math.abs(displayProgress - targetProgress) > 0.00012
      || Math.abs(pointerX - pointerTargetX) > 0.0005
      || Math.abs(pointerY - pointerTargetY) > 0.0005
    );
    if (stillMoving) animationFrame = requestAnimationFrame(renderFrame);
    else { displayProgress = targetProgress; animationFrame = 0; }
  }

  function scheduleRender() {
    if (animationFrame) return;
    lastFrameTime = performance.now();
    animationFrame = requestAnimationFrame(renderFrame);
  }

  function updateTargetFromScroll() {
    targetProgress = clamp((scrollY - storyStart) / storyDistance);
  }

  function onScroll() {
    updateTargetFromScroll();
    scheduleRender();
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dprLimit = innerWidth <= 720 ? 1.25 : 1.5;
    ratio = Math.min(devicePixelRatio || 1, 1.5, dprLimit);
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function measure() {
    measureFrame = 0;
    const rect = story.getBoundingClientRect();
    storyStart = scrollY + rect.top;
    storyDistance = Math.max(1, story.offsetHeight - innerHeight);
    resizeCanvas();
    updateTargetFromScroll();
    if (!initialized) { displayProgress = targetProgress; initialized = true; }
    scheduleRender();
  }

  function scheduleMeasure() {
    if (measureFrame) return;
    measureFrame = requestAnimationFrame(measure);
  }

  function scrollToState(index) {
    const normalized = clamp(index / 4) * contentEnd;
    scrollTo({ top: storyStart + storyDistance * normalized, behavior: reducedMotion ? 'auto' : 'smooth' });
  }

  tabs.forEach(button => button.addEventListener('click', () => scrollToState(Number(button.dataset.state))));
  topButtons.forEach(button => button.addEventListener('click', () => scrollToState(Number(button.dataset.state))));
  nextButton.addEventListener('click', () => {
    if (activeState < 4) scrollToState(activeState + 1);
    else scrollTo({ top: storyStart + storyDistance, behavior: reducedMotion ? 'auto' : 'smooth' });
  });
  scene.addEventListener('pointermove', event => {
    const rect = scene.getBoundingClientRect();
    pointerTargetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    pointerTargetY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    scheduleRender();
  });
  scene.addEventListener('pointerleave', () => {
    pointerTargetX = 0;
    pointerTargetY = 0;
    scheduleRender();
  });
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', scheduleMeasure, { passive: true });
  new ResizeObserver(scheduleMeasure).observe(story);
  measure();
})();
