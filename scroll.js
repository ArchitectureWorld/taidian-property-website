(() => {
  const { clamp, lerp, damp, interpolateKeyframes, sequenceWeights, chapterData, smootherstep } = window.TaidianStoryMath;
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
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const labels = ['SYSTEM / CONNECTED','EXPERIENCE / STRUCTURED','COMMUNITY / UNDERSTOOD','VALUE / OPTIMIZED','PARTNERSHIP / LONG TERM'];
  const imageSequence = [0, 0, 1, 2, 3];
  const imageIntensity = [0.08, 0.28, 0.60, 0.34, 0.56];
  const particleCount = 82;
  const openingRange = 0.18;
  const contentEnd = 0.84;
  const handoffStart = 0.88;

  let width = 1, height = 1, ratio = 1;
  let storyStart = 0, storyDistance = 1;
  let targetProgress = 0, displayProgress = 0;
  let pointerTargetX = 0, pointerTargetY = 0, pointerX = 0, pointerY = 0;
  let animationFrame = 0, measureFrame = 0, lastFrameTime = 0, activeState = -1;

  const noise = (index, salt = 0) => {
    const value = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
    return value - Math.floor(value);
  };
  const createGlowSprite = (size, inner, mid) => {
    const sprite = document.createElement('canvas');
    sprite.width = size; sprite.height = size;
    const ctx = sprite.getContext('2d');
    const center = size / 2;
    const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
    gradient.addColorStop(0, inner); gradient.addColorStop(.25, mid); gradient.addColorStop(1, 'rgba(210,139,39,0)');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, size, size);
    return sprite;
  };
  const flowGlow = createGlowSprite(36, 'rgba(224,151,50,.82)', 'rgba(224,151,50,.28)');
  const hubGlow = createGlowSprite(52, 'rgba(206,132,32,.62)', 'rgba(206,132,32,.2)');

  function targetFor(index, state) {
    const normalized = index / particleCount;
    const golden = Math.PI * (3 - Math.sqrt(5));
    const angle = index * golden;
    if (state === 0) {
      const radius = .18 + .43 * Math.sqrt(normalized);
      return { x: Math.cos(angle) * radius, y: Math.sin(angle * 1.06) * radius * .76, z: Math.sin(angle * .84) * .32 };
    }
    if (state === 1) {
      const layer = index % 5, radius = .12 + layer * .105, local = index * .48 + layer * .32;
      return { x: Math.cos(local) * radius, y: Math.sin(local) * radius * .7, z: (layer - 2) * .105 };
    }
    if (state === 2) {
      const hubs = [[-.34,-.2],[.28,-.26],[.35,.23],[-.18,.3],[0,.02]];
      const hub = hubs[index % hubs.length], radius = .035 + (index % 11) * .012, local = angle * 1.65;
      return { x: hub[0] + Math.cos(local) * radius, y: hub[1] + Math.sin(local) * radius, z: Math.sin(local) * .13 };
    }
    if (state === 3) {
      const columns = 12, row = Math.floor(index / columns), column = index % columns;
      return { x: (column - 5.5) * .074, y: (row - 3) * .087, z: Math.sin(column * .72 + row * .5) * .11 };
    }
    const ring = index % 4, local = normalized * Math.PI * 8 + ring * .35, radius = .12 + ring * .12;
    return { x: Math.cos(local) * radius, y: Math.sin(local) * radius * .66, z: Math.cos(local * 1.3) * .12 };
  }

  const targets = Array.from({ length: 5 }, (_, state) => Array.from({ length: particleCount }, (_, index) => targetFor(index, state)));
  const particles = Array.from({ length: particleCount }, (_, index) => ({ radius: .72 + noise(index, 2) * 1.18, hub: index % 17 === 0 }));
  const edges = Array.from({ length: particleCount }, (_, index) => [index, (index + 1 + (index % 4)) % particleCount]);
  const projected = Array.from({ length: particleCount }, () => ({ x: 0, y: 0, z: 0, scale: 1 }));

  function applyImageState(progress) {
    const imageWeights = sequenceWeights(progress, imageSequence, 4);
    const intensity = interpolateKeyframes(progress, imageIntensity);
    imageWeights.forEach((weight, index) => {
      root.style.setProperty(`--image-${index}-opacity`, (weight * intensity).toFixed(4));
      root.style.setProperty(`--image-${index}-x`, `${((index - 1.5) * 7 + progress * (index % 2 ? -10 : 8)).toFixed(2)}px`);
      root.style.setProperty(`--image-${index}-scale`, (1.035 + progress * .035 + index * .004).toFixed(4));
    });
  }

  function projectInto(x, y, z, rotation, output) {
    const cosine = Math.cos(rotation), sine = Math.sin(rotation);
    const rotatedX = x * cosine - z * sine, rotatedZ = x * sine + z * cosine;
    const perspective = 1 / (1.64 - rotatedZ * .36), scale = Math.min(width, height) * .92;
    output.x = width * .70 + (rotatedX + pointerX * .025) * scale * perspective;
    output.y = height * .51 + (y + pointerY * .018) * scale * perspective;
    output.z = rotatedZ; output.scale = perspective;
  }

  function updateCopy(state) {
    const { from, to, mix } = state;
    copyStates.forEach((element) => { element.style.opacity = '0'; element.style.transform = 'translate3d(0,20px,0)'; });
    const blend = from === to ? 0 : window.TaidianStoryMath.smootherstep(clamp((mix - .3) / .4));
    copyStates[from].style.opacity = (1 - blend).toFixed(3);
    copyStates[from].style.transform = `translate3d(0,${(-14 * blend).toFixed(2)}px,0)`;
    if (to !== from) {
      copyStates[to].style.opacity = blend.toFixed(3);
      copyStates[to].style.transform = `translate3d(0,${(18 * (1 - blend)).toFixed(2)}px,0)`;
    }
    const nextState = blend < .5 ? from : to;
    if (nextState !== activeState) {
      activeState = nextState;
      code.textContent = `${String(activeState + 1).padStart(3,'0')} / 005`;
      modelLabel.textContent = labels[activeState];
      nextButton.innerHTML = activeState === 4 ? '进入合作 <span>↓</span>' : '继续滚动 <span>↓</span>';
      [...tabs, ...topButtons].forEach((button) => {
        const active = Number(button.dataset.state) === activeState;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-current', active ? 'step' : 'false');
      });
      copyStates.forEach((element, index) => element.setAttribute('aria-hidden', index === activeState ? 'false' : 'true'));
    }
  }

  function drawNetwork(progress) {
    const state = chapterData(progress, 5);
    const rotation = progress * Math.PI * 2.05 + pointerX * .12;
    const breath = 1 + Math.sin(progress * Math.PI * 8) * .012;
    for (let index = 0; index < particleCount; index += 1) {
      const source = targets[state.from][index], target = targets[state.to][index];
      projectInto(lerp(source.x,target.x,state.mix)*breath, lerp(source.y,target.y,state.mix)*breath, lerp(source.z,target.z,state.mix), rotation, projected[index]);
    }
    context.clearRect(0,0,width,height);
    context.lineCap = 'round'; context.strokeStyle = '#303332'; context.lineWidth = .65;
    for (let edgeIndex = 0; edgeIndex < edges.length; edgeIndex += 1) {
      const [a,b] = edges[edgeIndex], start = projected[a], end = projected[b];
      const distance = Math.hypot(start.x-end.x,start.y-end.y);
      if (distance > Math.min(width,height)*.27) continue;
      context.globalAlpha = clamp(.24 - distance/Math.min(width,height)*.4,.025,.15);
      context.beginPath(); context.moveTo(start.x,start.y); context.lineTo(end.x,end.y); context.stroke();
      if (edgeIndex % 8 === 0) {
        const flow=(progress*3.25+edgeIndex*.117)%1, x=lerp(start.x,end.x,flow), y=lerp(start.y,end.y,flow);
        context.globalAlpha=.82; context.drawImage(flowGlow,x-13,y-13,26,26);
      }
    }
    for (let index=0;index<projected.length;index+=1) {
      const point=projected[index], particle=particles[index];
      if (particle.hub) { context.globalAlpha=.72; context.drawImage(hubGlow,point.x-20,point.y-20,40,40); }
      context.globalAlpha=clamp(.44+point.scale*.3,.38,.86); context.fillStyle=particle.hub?'#a96912':'#242827';
      context.beginPath(); context.arc(point.x,point.y,Math.max(.7,particle.radius*point.scale),0,Math.PI*2); context.fill();
    }
    context.globalAlpha=1;
    updateCopy(state);
    progressFill.style.transform=`scaleX(${progress.toFixed(5)})`;
  }

  function updateGlobalVisuals(rawProgress, handoff) {
    root.style.setProperty('--handoff', handoff.toFixed(5));
    root.style.setProperty('--shell-y', `${(-handoff * 18).toFixed(2)}px`);
  }

  function applyOpeningState(progress) {
    const opening = clamp(progress / openingRange);
    const mask = smootherstep ? smootherstep(clamp((opening - 0.10) / 0.48)) : clamp((opening - 0.10) / 0.48);
    const solid = smootherstep ? smootherstep(clamp((opening - 0.62) / 0.24)) : clamp((opening - 0.62) / 0.24);
    const stage = 1 - (smootherstep ? smootherstep(clamp((opening - 0.78) / 0.18)) : clamp((opening - 0.78) / 0.18));
    root.style.setProperty('--opening-overlay-opacity', (mask * (1 - solid * 0.1)).toFixed(4));
    root.style.setProperty('--opening-fill-opacity', (mask * (1 - solid)).toFixed(4));
    root.style.setProperty('--opening-solid-opacity', solid.toFixed(4));
    root.style.setProperty('--opening-word-scale', (1.48 - mask * 0.58).toFixed(4));
    root.style.setProperty('--opening-stage-opacity', stage.toFixed(4));
    root.style.setProperty('--story-copy-opacity', clamp((progress - openingRange * 0.66) / (openingRange * 0.34)).toFixed(4));
    root.style.setProperty('--story-ui-opacity', clamp((progress - openingRange * 0.72) / (openingRange * 0.28)).toFixed(4));
  }

  function renderFrame(now) {
    const delta = lastFrameTime ? Math.min(.05, Math.max(.001,(now-lastFrameTime)/1000)) : 1/60;
    lastFrameTime = now;
    if (reducedMotion) { displayProgress=targetProgress; pointerX=pointerTargetX; pointerY=pointerTargetY; }
    else { displayProgress=damp(displayProgress,targetProgress,17,delta); pointerX=damp(pointerX,pointerTargetX,12,delta); pointerY=damp(pointerY,pointerTargetY,12,delta); }
    const contentProgress = clamp((displayProgress - openingRange) / (contentEnd - openingRange));
    const handoff = window.TaidianStoryMath.smootherstep(clamp((displayProgress-handoffStart)/(1-handoffStart)));
    applyOpeningState(displayProgress);
    applyImageState(contentProgress);
    drawNetwork(contentProgress);
    updateGlobalVisuals(displayProgress,handoff);
    const moving=Math.abs(displayProgress-targetProgress)>.00012||Math.abs(pointerX-pointerTargetX)>.0005||Math.abs(pointerY-pointerTargetY)>.0005;
    if (moving) animationFrame=requestAnimationFrame(renderFrame); else { displayProgress=targetProgress; animationFrame=0; }
  }
  function scheduleRender(){ if(animationFrame) return; lastFrameTime=performance.now(); animationFrame=requestAnimationFrame(renderFrame); }
  function updateTargetFromScroll(){ targetProgress=clamp((scrollY-storyStart)/storyDistance); }
  function onScroll(){ updateTargetFromScroll(); scheduleRender(); }
  function resizeCanvas(){ const rect=canvas.getBoundingClientRect(); const limit=innerWidth<=720?1.25:1.5; ratio=Math.min(devicePixelRatio||1,limit); width=Math.max(1,rect.width); height=Math.max(1,rect.height); canvas.width=Math.round(width*ratio); canvas.height=Math.round(height*ratio); context.setTransform(ratio,0,0,ratio,0,0); }
  function measure(){ measureFrame=0; const rect=story.getBoundingClientRect(); storyStart=scrollY+rect.top; storyDistance=Math.max(1,story.offsetHeight-innerHeight); resizeCanvas(); updateTargetFromScroll(); if (!displayProgress) displayProgress=targetProgress; scheduleRender(); }
  function scheduleMeasure(){ if(measureFrame) return; measureFrame=requestAnimationFrame(measure); }
  function scrollToState(index){ const normalized=openingRange+clamp(index/4)*(contentEnd-openingRange); scrollTo({top:storyStart+storyDistance*normalized,behavior:reducedMotion?'auto':'smooth'}); }

  tabs.forEach((button)=>button.addEventListener('click',()=>scrollToState(Number(button.dataset.state))));
  topButtons.forEach((button)=>button.addEventListener('click',()=>scrollToState(Number(button.dataset.state))));
  nextButton.addEventListener('click',()=> activeState<4 ? scrollToState(activeState+1) : scrollTo({top:storyStart+storyDistance,behavior:reducedMotion?'auto':'smooth'}));
  visual.addEventListener('pointermove',(event)=>{ const rect=visual.getBoundingClientRect(); pointerTargetX=((event.clientX-rect.left)/rect.width-.5)*2; pointerTargetY=((event.clientY-rect.top)/rect.height-.5)*2; scheduleRender(); });
  visual.addEventListener('pointerleave',()=>{pointerTargetX=0;pointerTargetY=0;scheduleRender();});
  addEventListener('scroll',onScroll,{passive:true}); addEventListener('resize',scheduleMeasure,{passive:true});
  new ResizeObserver(scheduleMeasure).observe(story); measure();
})();
