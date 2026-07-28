(() => {
  const story = document.getElementById('scrollStory');
  const canvas = document.getElementById('community-network');
  const ctx = canvas.getContext('2d');
  const visual = document.getElementById('visualPanel');
  const copyStates = [...document.querySelectorAll('[data-copy-state]')];
  const tabs = [...document.querySelectorAll('.state-tab')];
  const topButtons = [...document.querySelectorAll('.topnav [data-state]')];
  const nextButton = document.getElementById('nextState');
  const code = document.getElementById('chapterCode');
  const progressFill = document.getElementById('progressFill');
  const modelLabel = document.getElementById('modelLabel');
  const labels = ['SYSTEM / CONNECTED','EXPERIENCE / STRUCTURED','COMMUNITY / UNDERSTOOD','VALUE / OPTIMIZED','PARTNERSHIP / LONG TERM'];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const count = 96;
  let width = 1, height = 1, ratio = 1, pointerX = 0, pointerY = 0;
  let storyProgress = 0, segmentProgress = 0, activeState = 0, raf = 0;

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const lerp = (a, b, amount) => a + (b - a) * amount;
  const ease = value => value * value * (3 - 2 * value);
  const noise = (index, salt = 0) => {
    const value = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
    return value - Math.floor(value);
  };

  function targetFor(index, state) {
    const t = index / count;
    const golden = Math.PI * (3 - Math.sqrt(5));
    const angle = index * golden;
    if (state === 0) {
      const radius = .18 + .43 * Math.sqrt(t);
      return { x: Math.cos(angle) * radius, y: Math.sin(angle * 1.06) * radius * .76, z: Math.sin(angle * .84) * .32 };
    }
    if (state === 1) {
      const layer = index % 5;
      const radius = .12 + layer * .105;
      const a = index * .48 + layer * .32;
      return { x: Math.cos(a) * radius, y: Math.sin(a) * radius * .7, z: (layer - 2) * .105 };
    }
    if (state === 2) {
      const hubs = [[-.34,-.2],[.28,-.26],[.35,.23],[-.18,.3],[0,.02]];
      const hub = hubs[index % hubs.length];
      const radius = .035 + (index % 11) * .012;
      const a = angle * 1.65;
      return { x: hub[0] + Math.cos(a) * radius, y: hub[1] + Math.sin(a) * radius, z: Math.sin(a) * .13 };
    }
    if (state === 3) {
      const columns = 12, row = Math.floor(index / columns), column = index % columns;
      return { x: (column - 5.5) * .074, y: (row - 3.5) * .087, z: Math.sin(column * .72 + row * .5) * .11 };
    }
    const ring = index % 4, a = t * Math.PI * 8 + ring * .35, radius = .12 + ring * .12;
    return { x: Math.cos(a) * radius, y: Math.sin(a) * radius * .66, z: Math.cos(a * 1.3) * .12 };
  }

  const targets = Array.from({ length: 5 }, (_, state) => Array.from({ length: count }, (_, index) => targetFor(index, state)));
  const particles = Array.from({ length: count }, (_, index) => ({ radius: .75 + noise(index, 2) * 1.3, phase: noise(index, 7) * Math.PI * 2, hub: index % 19 === 0 }));
  const edges = Array.from({ length: count }, (_, index) => [index, (index + 1 + (index % 4)) % count]);

  function resize() {
    const rect = canvas.getBoundingClientRect();
    ratio = Math.min(devicePixelRatio || 1, 2);
    width = Math.max(1, rect.width); height = Math.max(1, rect.height);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    scheduleRender();
  }

  function currentScrollProgress() {
    const start = story.offsetTop;
    const distance = Math.max(1, story.offsetHeight - innerHeight);
    return clamp((scrollY - start) / distance);
  }

  function stateData(progress) {
    const scaled = progress * 4;
    const from = Math.floor(scaled);
    const to = Math.min(4, from + 1);
    const mix = ease(scaled - from);
    return { scaled, from, to, mix };
  }

  function project(point, rotation) {
    const cos = Math.cos(rotation), sin = Math.sin(rotation);
    const x = point.x * cos - point.z * sin;
    const z = point.x * sin + point.z * cos;
    const perspective = 1 / (1.62 - z * .36);
    const scale = Math.min(width, height) * .9;
    return { x: width * .53 + (x + pointerX * .025) * scale * perspective, y: height * .5 + (point.y + pointerY * .018) * scale * perspective, z, scale: perspective };
  }

  function updateCopy(scaled) {
    copyStates.forEach((element, index) => {
      const distance = Math.abs(scaled - index);
      const opacity = clamp(1 - distance * 1.45);
      element.style.opacity = opacity.toFixed(3);
      element.style.transform = `translateY(${(index - scaled) * 22}px)`;
      element.setAttribute('aria-hidden', opacity < .45 ? 'true' : 'false');
    });
    activeState = Math.round(scaled);
    code.textContent = `${String(activeState + 1).padStart(3, '0')} / 005`;
    modelLabel.textContent = labels[activeState];
    [...tabs, ...topButtons].forEach(button => {
      const active = Number(button.dataset.state) === activeState;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-current', active ? 'step' : 'false');
    });
  }

  function drawNetwork() {
    const { scaled, from, to, mix } = stateData(storyProgress);
    segmentProgress = mix;
    const rotation = storyProgress * Math.PI * 2.15 + pointerX * .12;
    const points = targets[from].map((source, index) => {
      const target = targets[to][index];
      const scrollBreath = 1 + Math.sin(storyProgress * Math.PI * 9 + particles[index].phase) * .016;
      return project({ x: lerp(source.x, target.x, mix) * scrollBreath, y: lerp(source.y, target.y, mix) * scrollBreath, z: lerp(source.z, target.z, mix) }, rotation);
    });
    ctx.clearRect(0, 0, width, height);
    const halo = ctx.createRadialGradient(width * .53, height * .5, 0, width * .53, height * .5, Math.min(width, height) * .35);
    halo.addColorStop(0, `rgba(255,184,63,${.18 + Math.sin(storyProgress * Math.PI) * .08})`);
    halo.addColorStop(.34, 'rgba(255,214,145,.08)'); halo.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = halo; ctx.fillRect(0, 0, width, height);

    edges.forEach(([a,b], edgeIndex) => {
      const pa = points[a], pb = points[b];
      const distance = Math.hypot(pa.x - pb.x, pa.y - pb.y);
      if (distance > Math.min(width, height) * .27) return;
      const alpha = clamp(.22 - distance / Math.min(width, height) * .36, .025, .16);
      ctx.strokeStyle = `rgba(45,47,46,${alpha})`; ctx.lineWidth = .65;
      ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();
      if (edgeIndex % 7 === 0) {
        const flow = (storyProgress * 3.4 + edgeIndex * .117) % 1;
        const x = lerp(pa.x, pb.x, flow), y = lerp(pa.y, pb.y, flow);
        const glow = ctx.createRadialGradient(x,y,0,x,y,14);
        glow.addColorStop(0,'rgba(210,139,39,.72)'); glow.addColorStop(1,'rgba(210,139,39,0)');
        ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(x,y,14,0,Math.PI*2); ctx.fill();
      }
    });

    points.map((point,index)=>({point,index})).sort((a,b)=>a.point.z-b.point.z).forEach(({point,index}) => {
      const particle = particles[index];
      if (particle.hub) {
        const glow = ctx.createRadialGradient(point.x,point.y,0,point.x,point.y,18);
        glow.addColorStop(0,'rgba(200,128,28,.45)'); glow.addColorStop(1,'rgba(200,128,28,0)');
        ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(point.x,point.y,18,0,Math.PI*2); ctx.fill();
      }
      ctx.fillStyle = particle.hub ? 'rgba(174,105,15,.94)' : `rgba(36,39,39,${.35 + point.scale * .25})`;
      ctx.beginPath(); ctx.arc(point.x,point.y,Math.max(.75,particle.radius * point.scale),0,Math.PI*2); ctx.fill();
    });
    updateCopy(scaled);
    progressFill.style.transform = `scaleX(${storyProgress})`;
    visual.style.setProperty('--network-progress', storyProgress.toFixed(4));
  }

  function render() { raf = 0; drawNetwork(); }
  function scheduleRender() { if (!raf) raf = requestAnimationFrame(render); }
  function onScroll() { storyProgress = reducedMotion ? Math.round(currentScrollProgress() * 4) / 4 : currentScrollProgress(); scheduleRender(); }
  function scrollToState(index) {
    const target = story.offsetTop + (story.offsetHeight - innerHeight) * clamp(index / 4);
    scrollTo({ top: target, behavior: reducedMotion ? 'auto' : 'smooth' });
  }

  tabs.forEach(button => button.addEventListener('click', () => scrollToState(Number(button.dataset.state))));
  topButtons.forEach(button => button.addEventListener('click', () => scrollToState(Number(button.dataset.state))));
  nextButton.addEventListener('click', () => scrollToState(Math.min(4, activeState + 1)));
  visual.addEventListener('pointermove', event => { const rect = visual.getBoundingClientRect(); pointerX = ((event.clientX - rect.left) / rect.width - .5) * 2; pointerY = ((event.clientY - rect.top) / rect.height - .5) * 2; scheduleRender(); });
  visual.addEventListener('pointerleave', () => { pointerX = 0; pointerY = 0; scheduleRender(); });
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', resize);
  resize(); onScroll();
})();