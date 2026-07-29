(() => {
  const root = document.documentElement;
  const story = document.getElementById('scrollStory');
  const stage = document.querySelector('.viewport-stage');
  if (!story || !stage) return;

  const concept = root.dataset.concept || '';
  const themes = {
    'community-life-network': { bg: '#ebe8e1', text: '#1d2020', kicker: '泰典物业 · 长期社区伙伴' },
    'architectural-spatial-model': { bg: '#080c0d', text: '#f0ede6', kicker: '泰典物业 · 空间长期运营' },
    'community-digital-layer': { bg: '#173c33', text: '#f4f1e9', kicker: '泰典物业 · 真实社区长期服务' },
  };
  const theme = themes[concept] || themes['community-life-network'];
  root.style.setProperty('--finale-bg', theme.bg);
  root.style.setProperty('--finale-text', theme.text);

  const style = document.createElement('style');
  style.textContent = `
    .finale-layer{position:absolute!important;inset:0!important;z-index:90!important;overflow:hidden!important;pointer-events:none!important;background:transparent!important}
    .finale-layer .finale-media,.finale-layer .finale-solid,.finale-layer .finale-blend-field,.finale-layer .finale-title-wrap{display:none!important}
    .finale-mask-canvas{position:absolute;inset:0;width:100%;height:100%}
    .finale-kicker{position:absolute;z-index:2;bottom:clamp(40px,7vh,82px);left:50%;margin:0;transform:translateX(-50%);color:var(--finale-text);font-size:11px;letter-spacing:.18em;white-space:nowrap;opacity:0}
  `;
  document.head.appendChild(style);

  let layer = document.getElementById('finaleLayer');
  if (!layer) {
    layer = document.createElement('div');
    layer.id = 'finaleLayer';
    layer.className = 'finale-layer';
    stage.appendChild(layer);
  }
  layer.innerHTML = '<canvas id="finaleMaskCanvas" class="finale-mask-canvas" aria-hidden="true"></canvas><p class="finale-kicker" aria-hidden="true"></p>';
  const canvas = layer.querySelector('#finaleMaskCanvas');
  const kicker = layer.querySelector('.finale-kicker');
  kicker.textContent = theme.kicker;
  const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });

  const uiElements = [...document.querySelectorAll('.story-copy,.topbar,.statebar,.visual-meta,.visual-caption,.model-meta,.coordinates,.hud')];
  const geometryElements = [...document.querySelectorAll('.network-canvas,.orbit,#architecture-canvas,.wireframe-grid,#service-overlay,.scan-line')];

  const finaleStart = 0.78;
  const finaleEnd = 0.985;
  const finaleStartScale = 48;
  const handoffStart = 0.997;
  const text = '泰典物业';
  let width = 1;
  let height = 1;
  let ratio = 1;
  let storyStart = 0;
  let storyDistance = 1;
  let targetProgress = 0;
  let displayProgress = 0;
  let raf = 0;
  let lastTime = 0;

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const lerp = (a, b, amount) => a + (b - a) * amount;
  const smootherstep = (value) => {
    const t = clamp(value);
    return t * t * t * (t * (t * 6 - 15) + 10);
  };
  const damp = (current, target, lambda, dt) => current + (target - current) * (1 - Math.exp(-lambda * dt));

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dprLimit = innerWidth <= 720 ? 1.2 : 1.45;
    ratio = Math.min(devicePixelRatio || 1, dprLimit);
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const storyRect = story.getBoundingClientRect();
    storyStart = scrollY + storyRect.top;
    storyDistance = Math.max(1, story.offsetHeight - innerHeight);
    targetProgress = clamp((scrollY - storyStart) / storyDistance);
    if (!displayProgress) displayProgress = targetProgress;
    schedule();
  }

  function textMetrics(fontSize, tracking) {
    ctx.font = `750 ${fontSize}px "PingFang SC","Microsoft YaHei",system-ui,sans-serif`;
    let total = tracking * (text.length - 1);
    for (const character of text) total += ctx.measureText(character).width;
    return total;
  }

  function punchText(centerX, centerY, fontSize, tracking) {
    ctx.font = `750 ${fontSize}px "PingFang SC","Microsoft YaHei",system-ui,sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    let x = centerX - textMetrics(fontSize, tracking) / 2;
    for (const character of text) {
      ctx.fillText(character, x, centerY);
      x += ctx.measureText(character).width + tracking;
    }
  }

  function draw(progress) {
    const local = clamp((progress - finaleStart) / (finaleEnd - finaleStart));
    const cover = smootherstep(local / 0.16);
    const shrink = smootherstep((local - 0.015) / 0.9);
    const scale = Math.exp(lerp(Math.log(finaleStartScale), 0, shrink));
    const baseFont = Math.min(width / 5.15, height * 0.255);
    const fontSize = baseFont * scale;
    const tracking = -fontSize * 0.075;
    const focusOffset = (1 - shrink) * fontSize * 1.45;

    ctx.clearRect(0, 0, width, height);
    if (cover > 0.0001) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = cover;
      ctx.fillStyle = theme.bg;
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = cover;
      punchText(width / 2 + focusOffset, height / 2, fontSize, tracking);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }

    layer.style.opacity = String(cover);
    const storyFade = 1 - smootherstep((local - 0.015) / 0.28);
    for (const element of uiElements) element.style.opacity = String(storyFade);
    for (const element of geometryElements) element.style.opacity = String(storyFade);
    const kickerOpacity = smootherstep((local - 0.86) / 0.12);
    kicker.style.opacity = String(kickerOpacity);
    kicker.setAttribute('aria-hidden', kickerOpacity < 0.5 ? 'true' : 'false');

    const handoff = smootherstep((progress - handoffStart) / (1 - handoffStart));
    stage.style.opacity = String(1 - handoff);
  }

  function render(now) {
    const dt = lastTime ? Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000)) : 1 / 60;
    lastTime = now;
    displayProgress = damp(displayProgress, targetProgress, 17, dt);
    draw(displayProgress);
    if (Math.abs(displayProgress - targetProgress) > 0.00012) raf = requestAnimationFrame(render);
    else {
      displayProgress = targetProgress;
      draw(displayProgress);
      raf = 0;
    }
  }

  function schedule() {
    if (raf) return;
    lastTime = performance.now();
    raf = requestAnimationFrame(render);
  }

  function onScroll() {
    targetProgress = clamp((scrollY - storyStart) / storyDistance);
    schedule();
  }

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', resize, { passive: true });
  new ResizeObserver(resize).observe(story);
  resize();
})();
