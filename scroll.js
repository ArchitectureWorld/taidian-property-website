(() => {
  const story = document.getElementById('scrollStory');
  const canvas = document.getElementById('architecture-canvas');
  const context = canvas.getContext('2d', { alpha: true, desynchronized: true });
  const panel = document.getElementById('modelPanel');
  const copyStates = [...document.querySelectorAll('[data-copy-state]')];
  const tabs = [...document.querySelectorAll('.state-tab')];
  const topButtons = [...document.querySelectorAll('.topnav [data-state]')];
  const code = document.getElementById('chapterCode');
  const progressFill = document.getElementById('progressFill');
  const modelLabel = document.getElementById('modelLabel');
  const nextButton = document.getElementById('nextState');
  const root = document.documentElement;

  const labels = [
    'MODEL / COMMUNITY',
    'MODEL / EXPERIENCE',
    'MODEL / EXISTING FABRIC',
    'MODEL / SERVICE PATH',
    'MODEL / LONG TERM',
  ];
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
  const noise = (index, salt = 0) => {
    const value = Math.sin(index * 91.37 + salt * 241.19) * 43758.5453;
    return value - Math.floor(value);
  };

  function createGlowSprite(size) {
    const sprite = document.createElement('canvas');
    sprite.width = size;
    sprite.height = size;
    const spriteContext = sprite.getContext('2d');
    const center = size / 2;
    const gradient = spriteContext.createRadialGradient(center, center, 0, center, center, center);
    gradient.addColorStop(0, 'rgba(255,191,89,.9)');
    gradient.addColorStop(0.24, 'rgba(255,191,89,.28)');
    gradient.addColorStop(1, 'rgba(255,191,89,0)');
    spriteContext.fillStyle = gradient;
    spriteContext.fillRect(0, 0, size, size);
    return sprite;
  }

  const routeGlow = createGlowSprite(44);
  const base = Array.from({ length: 28 }, (_, index) => ({
    seed: noise(index, 2),
    x: (index % 7) - 3,
    z: Math.floor(index / 7) - 1.5,
    w: 0.42 + noise(index, 4) * 0.28,
    d: 0.42 + noise(index, 5) * 0.25,
    h: 0.55 + noise(index, 6) * 1.8,
  }));

  function transformBuilding(building, state) {
    const transformed = { ...building };
    if (state === 0) {
      transformed.x *= 0.86;
      transformed.z *= 0.8;
      transformed.h = 0.55 + building.h * 0.72;
    } else if (state === 1) {
      const ring = Math.floor(building.seed * 4);
      const angle = (building.x + building.z * 2) * 0.62;
      transformed.x = Math.cos(angle) * (1.1 + ring * 0.48);
      transformed.z = Math.sin(angle) * (1 + ring * 0.38);
      transformed.h = 0.7 + ring * 0.48 + building.seed * 0.5;
    } else if (state === 2) {
      transformed.x = building.x * 0.62 + Math.sin(building.z * 2.4) * 0.34;
      transformed.z = building.z * 0.65;
      transformed.h = 0.55 + building.seed * 2.25;
      transformed.w *= 0.78;
      transformed.d *= 0.78;
    } else if (state === 3) {
      transformed.x = (building.x < 0 ? -1 : 1) * (1.05 + Math.abs(building.x) * 0.44);
      transformed.z = building.z * 0.74;
      transformed.h = 0.48 + building.seed * 1.35;
    } else {
      const angle = (building.x + 3 + building.z * 7) * 0.43;
      const radius = 1.2 + Math.abs(building.z) * 0.48;
      transformed.x = Math.cos(angle) * radius;
      transformed.z = Math.sin(angle) * radius * 0.72;
      transformed.h = 0.72 + building.seed * 1.65;
    }
    return transformed;
  }

  const states = Array.from({ length: 5 }, (_, state) => base.map(building => transformBuilding(building, state)));
  const buildings = base.map(building => ({ ...building }));
  const order = buildings.map((_, index) => index);
  const depths = new Float32Array(buildings.length);
  const corners = Array.from({ length: 8 }, () => ({ x: 0, y: 0, z: 0 }));
  const cornerSigns = [[-1,0,-1],[1,0,-1],[1,0,1],[-1,0,1],[-1,1,-1],[1,1,-1],[1,1,1],[-1,1,1]];
  const buildingEdges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
  const routePoints = Array.from({ length: 7 }, () => ({ x: 0, y: 0, z: 0 }));
  const tempA = { x: 0, y: 0, z: 0 };
  const tempB = { x: 0, y: 0, z: 0 };

  function stateData(progress) {
    const scaled = progress * 4;
    const from = Math.min(4, Math.floor(scaled));
    const to = Math.min(4, from + 1);
    const mix = smoothstep(0, 1, scaled - from);
    return { scaled, from, to, mix };
  }

  function rotateInto(x, y, z, yaw, pitch, output) {
    const cosineYaw = Math.cos(yaw);
    const sineYaw = Math.sin(yaw);
    const cosinePitch = Math.cos(pitch);
    const sinePitch = Math.sin(pitch);
    const rotatedX = x * cosineYaw - z * sineYaw;
    const rotatedZ = x * sineYaw + z * cosineYaw;
    const rotatedY = y * cosinePitch - rotatedZ * sinePitch;
    output.x = rotatedX;
    output.y = rotatedY;
    output.z = rotatedY * sinePitch + rotatedZ * cosinePitch;
  }

  function projectInto(x, y, z, yaw, pitch, output) {
    rotateInto(x, y, z, yaw, pitch, output);
    const perspective = 1 / (5.9 - output.z * 0.22);
    const scale = Math.min(width, height) * 1.55;
    output.x = width * 0.53 + (output.x + pointerX * 0.12) * scale * perspective;
    output.y = height * 0.72 - (output.y + pointerY * 0.08) * scale * perspective;
  }

  function drawLine(start, end, alpha, lineWidth = 0.65, color = '#d9b879') {
    context.globalAlpha = alpha;
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
  }

  function drawBuilding(building, yaw, pitch, alpha) {
    const x = building.x * 0.82;
    const z = building.z * 0.82;
    const halfWidth = building.w / 2;
    const halfDepth = building.d / 2;
    const h = building.h;

    for (let index = 0; index < 8; index += 1) {
      const sign = cornerSigns[index];
      projectInto(
        x + sign[0] * halfWidth,
        sign[1] * h,
        z + sign[2] * halfDepth,
        yaw,
        pitch,
        corners[index],
      );
    }

    for (const [start, end] of buildingEdges) drawLine(corners[start], corners[end], alpha, 0.68);

    for (let floor = 0.32; floor < h; floor += 0.42) {
      projectInto(x - halfWidth, floor, z - halfDepth, yaw, pitch, tempA);
      projectInto(x + halfWidth, floor, z - halfDepth, yaw, pitch, tempB);
      drawLine(tempA, tempB, alpha * 0.36, 0.42);
    }
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

  function drawModel(contentProgress) {
    const { scaled, from, to, mix } = stateData(contentProgress);
    const yaw = -0.55 + contentProgress * 1.02 + pointerX * 0.12;
    const pitch = -0.22 + pointerY * 0.04;
    context.clearRect(0, 0, width, height);
    context.lineCap = 'round';

    for (let index = -5; index <= 5; index += 1) {
      projectInto(index * 0.56, 0, -4, yaw, pitch, tempA);
      projectInto(index * 0.56, 0, 4, yaw, pitch, tempB);
      drawLine(tempA, tempB, 0.11, 0.48, '#697773');
      projectInto(-4, 0, index * 0.56, yaw, pitch, tempA);
      projectInto(4, 0, index * 0.56, yaw, pitch, tempB);
      drawLine(tempA, tempB, 0.11, 0.48, '#697773');
    }

    for (let index = 0; index < buildings.length; index += 1) {
      const source = states[from][index];
      const target = states[to][index];
      const building = buildings[index];
      building.x = lerp(source.x, target.x, mix);
      building.z = lerp(source.z, target.z, mix);
      building.w = lerp(source.w, target.w, mix);
      building.d = lerp(source.d, target.d, mix);
      building.h = lerp(source.h, target.h, mix);
      rotateInto(building.x, 0, building.z, yaw, pitch, tempA);
      depths[index] = tempA.z;
    }

    order.sort((left, right) => depths[right] - depths[left]);
    for (let rank = 0; rank < order.length; rank += 1) {
      drawBuilding(buildings[order[rank]], yaw, pitch, 0.18 + (rank / order.length) * 0.28);
    }

    let routeCount = 0;
    for (let index = 0; index < buildings.length; index += 4) {
      const building = buildings[index];
      projectInto(building.x * 0.82, 0.08, building.z * 0.82, yaw, pitch, routePoints[routeCount]);
      routeCount += 1;
    }
    for (let index = 1; index < routeCount; index += 1) drawLine(routePoints[index - 1], routePoints[index], 0.52, 1.05, '#e6ae52');

    if (routeCount > 1) {
      const travel = (contentProgress * 4.6) % 1;
      const segment = (routeCount - 1) * travel;
      const index = Math.min(routeCount - 2, Math.floor(segment));
      const local = segment - index;
      const x = lerp(routePoints[index].x, routePoints[index + 1].x, local);
      const y = lerp(routePoints[index].y, routePoints[index + 1].y, local);
      context.globalAlpha = 0.9;
      context.drawImage(routeGlow, x - 17, y - 17, 34, 34);
    }
    context.globalAlpha = 1;

    updateCopy({ scaled, from, to, mix });
    progressFill.style.transform = `scaleX(${contentProgress.toFixed(5)})`;
    panel.style.setProperty('--model-progress', contentProgress.toFixed(5));
    panel.style.setProperty('--model-sweep', `${(-4 + contentProgress * 8).toFixed(3)}%`);
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
    drawModel(contentProgress);
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
    const dprLimit = innerWidth <= 720 ? 1.2 : 1.5;
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
  panel.addEventListener('pointermove', event => {
    const rect = panel.getBoundingClientRect();
    pointerTargetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    pointerTargetY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    scheduleRender();
  });
  panel.addEventListener('pointerleave', () => {
    pointerTargetX = 0;
    pointerTargetY = 0;
    scheduleRender();
  });
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', scheduleMeasure, { passive: true });
  new ResizeObserver(scheduleMeasure).observe(story);
  measure();
})();
