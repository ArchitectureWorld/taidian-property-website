(() => {
  const root = document.documentElement;
  const story = document.getElementById('scrollStory');
  const stage = document.querySelector('.viewport-stage');
  if (!story || !stage) return;

  const concept = root.dataset.concept || '';
  const themes = {
    'community-life-network': {
      bg: '#ebe8e1',
      text: '#1d2020',
      muted: '#6f7471',
      line: 'rgba(29,32,31,.18)',
      gold: '#b67b24',
      kicker: '让科技进入管理，让服务回到生活。',
    },
    'architectural-spatial-model': {
      bg: '#080c0d',
      text: '#f0ede6',
      muted: '#969b98',
      line: 'rgba(240,237,230,.18)',
      gold: '#d5ad67',
      kicker: '空间有结构，服务才有长期价值。',
    },
    'community-digital-layer': {
      bg: '#173c33',
      text: '#f4f1e9',
      muted: '#b7c4bd',
      line: 'rgba(244,241,233,.20)',
      gold: '#d2a45b',
      kicker: '科技看见细节，服务守住日常。',
    },
  };
  const theme = themes[concept] || themes['community-life-network'];

  root.style.setProperty('--finale-bg', theme.bg);
  root.style.setProperty('--finale-text', theme.text);
  root.style.setProperty('--finale-muted', theme.muted);
  root.style.setProperty('--finale-line', theme.line);
  story.style.height = '780vh';

  const style = document.createElement('style');
  style.textContent = `
    .viewport-stage{opacity:1!important;transform:none!important}
    .after-story{display:none!important}
    .finale-layer{position:absolute!important;inset:0!important;z-index:90!important;overflow:hidden!important;pointer-events:none!important;background:transparent!important}
    .finale-layer .finale-media,.finale-layer .finale-solid,.finale-layer .finale-blend-field,.finale-layer .finale-title-wrap{display:none!important}
    .finale-mask-canvas{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
    .finale-contact{position:absolute;z-index:3;left:clamp(24px,6vw,104px);right:clamp(24px,6vw,104px);bottom:clamp(32px,6vh,74px);display:grid;grid-template-columns:minmax(280px,1.2fr) minmax(520px,1fr);gap:clamp(36px,8vw,150px);align-items:end;color:var(--finale-text);opacity:0;transform:translate3d(0,36px,0);will-change:opacity,transform;pointer-events:none}
    .finale-contact__lead{max-width:760px}
    .finale-contact__eyebrow{margin:0 0 15px;color:var(--finale-muted);font-size:11px;letter-spacing:.16em;text-transform:uppercase}
    .finale-contact__lead h2{margin:0;font-size:clamp(28px,3.5vw,58px);font-weight:520;line-height:1.12;letter-spacing:-.045em}
    .finale-contact__grid{display:grid;grid-template-columns:repeat(2,minmax(170px,1fr));border-top:1px solid var(--finale-line);border-left:1px solid var(--finale-line)}
    .finale-contact__item{min-height:86px;padding:16px 18px;border-right:1px solid var(--finale-line);border-bottom:1px solid var(--finale-line);display:flex;flex-direction:column;justify-content:space-between;gap:10px}
    .finale-contact__item small{color:var(--finale-muted);font-size:10px;letter-spacing:.12em}
    .finale-contact__item strong{font-size:14px;font-weight:520;line-height:1.45}
    .finale-contact__legal{grid-column:1/-1;min-height:74px}
    @media(max-width:900px){
      .finale-contact{grid-template-columns:1fr;gap:24px;bottom:30px}
      .finale-contact__lead h2{font-size:clamp(26px,7vw,44px)}
      .finale-contact__grid{grid-template-columns:1fr 1fr}
      .finale-contact__item{min-height:72px;padding:12px 14px}
    }
    @media(max-width:560px){
      .finale-contact{left:18px;right:18px;bottom:18px;gap:18px}
      .finale-contact__lead h2{font-size:28px}
      .finale-contact__eyebrow{margin-bottom:9px;font-size:9px}
      .finale-contact__item{min-height:62px;padding:10px 11px}
      .finale-contact__item small{font-size:8px}
      .finale-contact__item strong{font-size:11px}
    }
  `;
  document.head.appendChild(style);

  let layer = document.getElementById('finaleLayer');
  if (!layer) {
    layer = document.createElement('div');
    layer.id = 'finaleLayer';
    layer.className = 'finale-layer';
    stage.appendChild(layer);
  }
  layer.innerHTML = `
    <canvas id="finaleMaskCanvas" class="finale-mask-canvas" aria-hidden="true"></canvas>
    <section class="finale-contact" id="finaleContact" aria-label="泰典物业联系信息">
      <div class="finale-contact__lead">
        <p class="finale-contact__eyebrow">TAIDIAN PROPERTY · CONTACT</p>
        <h2>${theme.kicker}</h2>
      </div>
      <div class="finale-contact__grid">
        <div class="finale-contact__item"><small>项目合作</small><strong>业务电话待补充</strong></div>
        <div class="finale-contact__item"><small>企业邮箱</small><strong>企业邮箱待补充</strong></div>
        <div class="finale-contact__item"><small>办公地址</small><strong>武汉市 · 详细地址待补充</strong></div>
        <div class="finale-contact__item"><small>服务方向</small><strong>住宅物业 · 老旧社区</strong></div>
        <div class="finale-contact__item finale-contact__legal"><small>企业信息</small><strong>武汉泰典物业管理有限公司 · 成立于2014年</strong></div>
      </div>
    </section>
  `;

  const canvas = layer.querySelector('#finaleMaskCanvas');
  const contact = layer.querySelector('#finaleContact');
  const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });

  const uiElements = [...document.querySelectorAll('.story-copy,.topbar,.statebar,.visual-meta,.visual-caption,.model-meta,.coordinates,.hud')];
  const geometryElements = [...document.querySelectorAll('.network-canvas,.orbit,#architecture-canvas,.wireframe-grid,#service-overlay,.scan-line')];

  const finaleStart = 0.76;
  const maskEnd = 0.91;
  const contactStart = 0.90;
  const contactEnd = 0.995;
  const text = '泰典物业';
  const maskFontSize = 128;
  const maskWidth = 900;
  const maskHeight = 260;

  let width = 1;
  let height = 1;
  let ratio = 1;
  let storyStart = 0;
  let storyDistance = 1;
  let targetProgress = 0;
  let displayProgress = 0;
  let raf = 0;
  let lastTime = 0;
  let interiorAnchor = null;

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const lerp = (a, b, amount) => a + (b - a) * amount;
  const smootherstep = (value) => {
    const t = clamp(value);
    return t * t * t * (t * (t * 6 - 15) + 10);
  };
  const damp = (current, target, lambda, dt) => current + (target - current) * (1 - Math.exp(-lambda * dt));

  function setFont(context, fontSize) {
    context.font = `750 ${fontSize}px "PingFang SC","Microsoft YaHei",system-ui,sans-serif`;
    context.textAlign = 'left';
    context.textBaseline = 'middle';
  }

  function textMetrics(context, fontSize, tracking) {
    setFont(context, fontSize);
    let total = tracking * (text.length - 1);
    for (const character of text) total += context.measureText(character).width;
    return total;
  }

  function drawTrackedText(context, centerX, centerY, fontSize, tracking) {
    setFont(context, fontSize);
    let x = centerX - textMetrics(context, fontSize, tracking) / 2;
    for (const character of text) {
      context.fillText(character, x, centerY);
      x += context.measureText(character).width + tracking;
    }
  }

  function findLargestInteriorAnchor() {
    const mask = document.createElement('canvas');
    mask.width = maskWidth;
    mask.height = maskHeight;
    const maskContext = mask.getContext('2d', { willReadFrequently: true });
    maskContext.clearRect(0, 0, maskWidth, maskHeight);
    maskContext.fillStyle = '#fff';
    drawTrackedText(maskContext, maskWidth / 2, maskHeight / 2, maskFontSize, -maskFontSize * 0.075);

    const pixels = maskContext.getImageData(0, 0, maskWidth, maskHeight).data;
    const count = maskWidth * maskHeight;
    const distance = new Float32Array(count);
    const inside = new Uint8Array(count);
    const inf = 1e6;

    for (let index = 0; index < count; index += 1) {
      const isInside = pixels[index * 4 + 3] > 150;
      inside[index] = isInside ? 1 : 0;
      distance[index] = isInside ? inf : 0;
    }

    const diagonal = Math.SQRT2;
    for (let y = 0; y < maskHeight; y += 1) {
      for (let x = 0; x < maskWidth; x += 1) {
        const index = y * maskWidth + x;
        if (!inside[index]) continue;
        let value = distance[index];
        if (x > 0) value = Math.min(value, distance[index - 1] + 1);
        if (y > 0) value = Math.min(value, distance[index - maskWidth] + 1);
        if (x > 0 && y > 0) value = Math.min(value, distance[index - maskWidth - 1] + diagonal);
        if (x + 1 < maskWidth && y > 0) value = Math.min(value, distance[index - maskWidth + 1] + diagonal);
        distance[index] = value;
      }
    }
    for (let y = maskHeight - 1; y >= 0; y -= 1) {
      for (let x = maskWidth - 1; x >= 0; x -= 1) {
        const index = y * maskWidth + x;
        if (!inside[index]) continue;
        let value = distance[index];
        if (x + 1 < maskWidth) value = Math.min(value, distance[index + 1] + 1);
        if (y + 1 < maskHeight) value = Math.min(value, distance[index + maskWidth] + 1);
        if (x + 1 < maskWidth && y + 1 < maskHeight) value = Math.min(value, distance[index + maskWidth + 1] + diagonal);
        if (x > 0 && y + 1 < maskHeight) value = Math.min(value, distance[index + maskWidth - 1] + diagonal);
        distance[index] = value;
      }
    }

    let bestIndex = 0;
    let bestDistance = 0;
    for (let index = 0; index < count; index += 1) {
      if (distance[index] > bestDistance && distance[index] < inf) {
        bestDistance = distance[index];
        bestIndex = index;
      }
    }
    return {
      offsetX: bestIndex % maskWidth - maskWidth / 2,
      offsetY: Math.floor(bestIndex / maskWidth) - maskHeight / 2,
      clearance: Math.max(1, bestDistance),
    };
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dprLimit = innerWidth <= 720 ? 1.2 : 1.45;
    ratio = Math.min(devicePixelRatio || 1, dprLimit);
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    interiorAnchor = findLargestInteriorAnchor();

    const storyRect = story.getBoundingClientRect();
    storyStart = scrollY + storyRect.top;
    storyDistance = Math.max(1, story.offsetHeight - innerHeight);
    targetProgress = clamp((scrollY - storyStart) / storyDistance);
    if (!displayProgress) displayProgress = targetProgress;
    schedule();
  }

  function restoreStory() {
    layer.style.opacity = '0';
    ctx.clearRect(0, 0, width, height);
    for (const element of uiElements) element.style.opacity = '';
    for (const element of geometryElements) element.style.opacity = '';
    contact.style.opacity = '0';
    contact.style.transform = 'translate3d(0,36px,0)';
    contact.setAttribute('aria-hidden', 'true');
  }

  function draw(progress) {
    if (progress <= finaleStart) {
      restoreStory();
      return;
    }

    const maskProgress = clamp((progress - finaleStart) / (maskEnd - finaleStart));
    const contactProgress = clamp((progress - contactStart) / (contactEnd - contactStart));
    const reveal = smootherstep(maskProgress);
    const contactReveal = smootherstep(contactProgress);
    const goldReveal = smootherstep(clamp((contactProgress - 0.02) / 0.55));

    const baseFont = Math.min(width / 5.15, height * 0.255);
    const finalClearance = interiorAnchor.clearance * (baseFont / maskFontSize);
    const startScale = Math.max(64, (Math.hypot(width, height) * 0.64) / Math.max(1, finalClearance));
    const maskScale = Math.exp(lerp(Math.log(startScale), 0, reveal));
    const contactScale = lerp(1, 0.78, contactReveal);
    const scale = maskScale * contactScale;
    const fontSize = baseFont * scale;
    const tracking = -fontSize * 0.075;
    const anchorScale = (baseFont / maskFontSize) * maskScale;
    const anchorBlend = 1 - reveal;
    const initialCenterX = width / 2 - interiorAnchor.offsetX * anchorScale * anchorBlend;
    const initialCenterY = height / 2 - interiorAnchor.offsetY * anchorScale * anchorBlend;
    const centerX = initialCenterX;
    const centerY = lerp(initialCenterY, height * 0.265, contactReveal);

    const overlayAlpha = smootherstep(clamp((maskProgress - 0.06) / 0.34));
    ctx.clearRect(0, 0, width, height);
    if (overlayAlpha > 0.0001) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = overlayAlpha;
      ctx.fillStyle = theme.bg;
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#000';
      drawTrackedText(ctx, centerX, centerY, fontSize, tracking);

      if (goldReveal > 0.0001) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = goldReveal;
        ctx.fillStyle = theme.gold;
        drawTrackedText(ctx, centerX, centerY, fontSize, tracking);
      }

      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }

    layer.style.opacity = '1';
    const storyFade = 1 - smootherstep(clamp((maskProgress - 0.03) / 0.32));
    for (const element of uiElements) element.style.opacity = String(storyFade);
    for (const element of geometryElements) element.style.opacity = String(storyFade);

    contact.style.opacity = String(contactReveal);
    contact.style.transform = `translate3d(0,${lerp(36, 0, contactReveal).toFixed(2)}px,0)`;
    contact.setAttribute('aria-hidden', contactReveal < 0.5 ? 'true' : 'false');
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
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(resize);
  else resize();
})();
