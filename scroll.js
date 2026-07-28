(() => {
  const story = document.getElementById('scrollStory');
  const canvas = document.getElementById('community-network');
  const context = canvas.getContext('2d', { alpha: true, desynchronized: true });
  const visual = document.getElementById('visualPanel');
  const copyStates = [...document.querySelectorAll('[data-copy-state]')];
  const tabs = [...document.querySelectorAll('.state-tab')];
  const topButtons = [...document.querySelectorAll('.topnav [data-state]')];
  const nextButton = document.getElementById('nextState');
  const code = document.getElementById('chapterCode');
  const progressFill = document.getElementById('progressFill');
  const modelLabel = document.getElementById('modelLabel');
  const root = document.documentElement;

  const labels = [
    'SYSTEM / CONNECTED',
    'EXPERIENCE / STRUCTURED',
    'COMMUNITY / UNDERSTOOD',
    'VALUE / OPTIMIZED',
    'PARTNERSHIP / LONG TERM',
  ];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const particleCount = 84;
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
  const noise = (index, salt = 0) => {
    const value = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
    return value - Math.floor(value);
  };

  function createGlowSprite(size, innerColor, midColor) {
    const sprite = document.createElement('canvas');
    sprite.width = size;
    sprite.height = size;
    const spriteContext = sprite.getContext('2d');
    const center = size / 2;
    const gradient = spriteContext.createRadialGradient(center, center, 0, center, center, center);
    gradient.addColorStop(0, innerColor);
    gradient.addColorStop(0.24, midColor);
    gradient.addColorStop(1, 'rgba(210,139,39,0)');
    spriteContext.fillStyle = gradient;
    spriteContext.fillRect(0, 0, size, size);
    return sprite;
  }

  const flowGlow = createGlowSprite(36, 'rgba(224,151,50,.82)', 'rgba(224,151,50,.28)');
  const hubGlow = createGlowSprite(52, 'rgba(206,132,32,.62)', 'rgba(206,132,32,.2)');

  function targetFor(index, state) {
    const normalized = index / particleCount;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const angle = index * goldenAngle;

    if (state === 0) {
      const radius = 0.18 + 0.43 * Math.sqrt(normalized);
      return { x: Math.cos(angle) * radius, y: Math.sin(angle * 1.06) * radius * 0.76, z: Math.sin(angle * 0.84) * 0.32 };
    }
    if (state === 1) {
      const layer = index % 5;
      const radius = 0.12 + layer * 0.105;
      const localAngle = index * 0.48 + layer * 0.32;
      return { x: Math.cos(localAngle) * radius, y: Math.sin(localAngle) * radius * 0.7, z: (layer - 2) * 0.105 };
    }
    if (state === 2) {
      const hubs = [[-0.34, -0.2], [0.28, -0.26], [0.35, 0.23], [-0.18, 0.3], [0, 0.02]];
      const hub = hubs[index % hubs.length];
      const radius = 0.035 + (index % 11) * 0.012;
      const localAngle = angle * 1.65;
      return { x: hub[0] + Math.cos(localAngle) * radius, y: hub[1] + Math.sin(localAngle) * radius, z: Math.sin(localAngle) * 0.13 };
    }
    if (state === 3) {
      const columns = 12;
      const row = Math.floor(index / columns);
      const column = index % columns;
      return { x: (column - 5.5) * 0.074, y: (row - 3) * 0.087, z: Math.sin(column * 0.72 + row * 0.5) * 0.11 };
    }

    const ring = index % 4;
    const localAngle = normalized * Math.PI * 8 + ring * 0.35;
    const radius = 0.12 + ring * 0.12;
    return { x: Math.cos(localAngle) * radius, y: Math.sin(localAngle) * radius * 0.66, z: Math.cos(localAngle * 1.3) * 0.12 };
  }

  const targets = Array.from({ length: 5 }, (_, state) => (
    Array.from({ length: particleCount }, (_, index) => targetFor(index, state))
  ));
  const particles = Array.from({ length: particleCount }, (_, index) => ({
    radius: 0.75 + noise(index, 2) * 1.2,
    phase: noise(index, 7) * Math.PI * 2,
    hub: index % 17 === 0,
  }));
  const edges = Array.from({ length: particleCount }, (_, index) => [index, (index + 1 + (index % 4)) % particleCount]);
  const projected = Array.from({ length: particleCount }, () => ({ x: 0, y: 0, z: 0, scale: 1 }));

  function stateData(progress) {
    const scaled = progress * 4;
    const from = Math.min(4, Math.floor(scaled));
    const to = Math.min(4, from + 1);
    const mix = smoothstep(0, 1, scaled - from);
    return { scaled, from, to, mix };
  }

  function projectInto(x, y, z, rotation, output) {
    const cosine = Math.cos(rotation);
    const sine = Math.sin(rotation);
    const rotatedX = x * cosine - z * sine;
    const rotatedZ = x * sine + z * cosine;
    const perspective = 1 / (1.62 - rotatedZ * 0.36);
    const scale = Math.min(width, height) * 0.9;
    output.x = width * 0.53 + (rotatedX + pointerX * 0.025) * scale * perspective;
    output.y = height * 0.5 + (y + pointerY * 0.018) * scale * perspective;
    output.z = rotatedZ;
    output.scale = perspective;
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

  function drawNetwork(contentProgress) {
    const { scaled, from, to, mix } = stateData(contentProgress);
    const rotation = contentProgress * Math.PI * 2.05 + pointerX * 0.12;
    const breath = 1 + Math.sin(contentProgress * Math.PI * 8) * 0.012;

    for (let index = 0; index < particleCount; index += 1) {
      const source = targets[from][index];
      const target = targets[to][index];
      projectInto(
        lerp(source.x, target.x, mix) * breath,
        lerp(source.y, target.y, mix) * breath,
        lerp(source.z, target.z, mix),
        rotation,
        projected[index],
      );
    }

    context.clearRect(0, 0, width, height);
    context.lineCap = 'round';
    context.strokeStyle = '#303332';
    context.lineWidth = 0.65;

    for (let edgeIndex = 0; edgeIndex < edges.length; edgeIndex += 1) {
      const [a, b] = edges[edgeIndex];
      const start = projected[a];
      const end = projected[b];
      const distance = Math.hypot(start.x - end.x, start.y - end.y);
      if (distance > Math.min(width, height) * 0.27) continue;

      context.globalAlpha = clamp(0.24 - distance / Math.min(width, height) * 0.4, 0.025, 0.15);
      context.beginPath();
      context.moveTo(start.x, start.y);
      context.lineTo(end.x, end.y);
      context.stroke();

      if (edgeIndex % 8 === 0) {
        const flow = (contentProgress * 3.25 + edgeIndex * 0.117) % 1;
        const flowX = lerp(start.x, end.x, flow);
        const flowY = lerp(start.y, end.y, flow);
        context.globalAlpha = 0.82;
        context.drawImage(flowGlow, flowX - 13, flowY - 13, 26, 26);
      }
    }

    for (let index = 0; index < projected.length; index += 1) {
      const point = projected[index];
      const particle = particles[index];
      if (particle.hub) {
        context.globalAlpha = 0.72;
        context.drawImage(hubGlow, point.x - 20, point.y - 20, 40, 40);
      }
      context.globalAlpha = clamp(0.44 + point.scale * 0.3, 0.38, 0.86);
      context.fillStyle = particle.hub ? '#a96912' : '#242827';
      context.beginPath();
      context.arc(point.x, point.y, Math.max(0.7, particle.radius * point.scale), 0, Math.PI * 2);
      context.fill();
    }
    context.globalAlpha = 1;

    updateCopy({ scaled, from, to, mix });
    progressFill.style.transform = `scaleX(${contentProgress.toFixed(5)})`;
    visual.style.setProperty('--network-progress', contentProgress.toFixed(5));
    visual.style.setProperty('--network-scale', (1 + contentProgress * 0.04).toFixed(5));
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
    drawNetwork(contentProgress);
    updateGlobalVisuals(displayProgress, handoff);

    const stillMoving = (
      Math.abs(displayProgress - targetProgress) > 0.00012
      || Math.abs(pointerX - pointerTargetX) > 0.0005
      || Math.abs(pointerY - pointerTargetY) > 0.0005
    );

    if (stillMoving) {
      animationFrame = requestAnimationFrame(renderFrame);
    } else {
      displayProgress = targetProgress;
      animationFrame = 0;
    }
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
    if (!initialized) {
      displayProgress = targetProgress;
      initialized = true;
    }
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
  visual.addEventListener('pointermove', event => {
    const rect = visual.getBoundingClientRect();
    pointerTargetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    pointerTargetY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    scheduleRender();
  });
  visual.addEventListener('pointerleave', () => {
    pointerTargetX = 0;
    pointerTargetY = 0;
    scheduleRender();
  });
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', scheduleMeasure, { passive: true });
  new ResizeObserver(scheduleMeasure).observe(story);
  measure();
})();
