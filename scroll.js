(() => {
  const { clamp, lerp, damp, interpolateKeyframes, sequenceWeights, chapterData, smootherstep } = window.TaidianStoryMath;
  const story=document.getElementById('scrollStory');
  const canvas=document.getElementById('architecture-canvas');
  const context=canvas.getContext('2d',{alpha:true,desynchronized:true});
  const panel=document.getElementById('modelPanel');
  const copyStates=[...document.querySelectorAll('[data-copy-state]')];
  const tabs=[...document.querySelectorAll('.state-tab')];
  const topButtons=[...document.querySelectorAll('.topnav [data-state]')];
  const code=document.getElementById('chapterCode');
  const progressFill=document.getElementById('progressFill');
  const modelLabel=document.getElementById('modelLabel');
  const nextButton=document.getElementById('nextState');
  const root=document.documentElement;
  const labels=['MODEL / COMMUNITY','MODEL / EXPERIENCE','MODEL / EXISTING FABRIC','MODEL / SERVICE PATH','MODEL / LONG TERM'];
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const imageSequence=[0,0,1,2,3];
  const imageIntensity=[.16,.42,.72,.38,.52];
  const contentEnd=.78, finaleStart=.80, finaleEnd=.985, handoffStart=.992;
  let width=1,height=1,ratio=1,storyStart=0,storyDistance=1,targetProgress=0,displayProgress=0;
  let pointerTargetX=0,pointerTargetY=0,pointerX=0,pointerY=0,animationFrame=0,measureFrame=0,lastFrameTime=0,activeState=-1;
  const noise=(i,s=0)=>{const v=Math.sin(i*91.37+s*241.19)*43758.5453;return v-Math.floor(v)};
  const base=Array.from({length:28},(_,i)=>({seed:noise(i,2),x:(i%7)-3,z:Math.floor(i/7)-1.5,w:.42+noise(i,4)*.28,d:.42+noise(i,5)*.25,h:.55+noise(i,6)*1.8}));
  function transform(building,state){const b={...building};if(state===0){b.x*=.86;b.z*=.8;b.h=.55+building.h*.72}if(state===1){const ring=Math.floor(building.seed*4),angle=(building.x+building.z*2)*.62;b.x=Math.cos(angle)*(1.1+ring*.48);b.z=Math.sin(angle)*(1+ring*.38);b.h=.7+ring*.48+building.seed*.5}if(state===2){b.x=building.x*.62+Math.sin(building.z*2.4)*.34;b.z=building.z*.65;b.h=.55+building.seed*2.25;b.w*=.78;b.d*=.78}if(state===3){b.x=(building.x<0?-1:1)*(1.05+Math.abs(building.x)*.44);b.z=building.z*.74;b.h=.48+building.seed*1.35}if(state===4){const a=(building.x+3+building.z*7)*.43,r=1.2+Math.abs(building.z)*.48;b.x=Math.cos(a)*r;b.z=Math.sin(a)*r*.72;b.h=.72+building.seed*1.65}return b}
  const states=Array.from({length:5},(_,state)=>base.map(b=>transform(b,state)));
  const createGlow=()=>{const sprite=document.createElement('canvas');sprite.width=48;sprite.height=48;const ctx=sprite.getContext('2d'),g=ctx.createRadialGradient(24,24,0,24,24,24);g.addColorStop(0,'rgba(255,191,89,.9)');g.addColorStop(.25,'rgba(255,191,89,.28)');g.addColorStop(1,'rgba(255,191,89,0)');ctx.fillStyle=g;ctx.fillRect(0,0,48,48);return sprite};
  const glow=createGlow();

  function applyImageState(progress){const imageWeights=sequenceWeights(progress,imageSequence,4),intensity=interpolateKeyframes(progress,imageIntensity);imageWeights.forEach((weight,index)=>{root.style.setProperty(`--image-${index}-opacity`,(weight*intensity).toFixed(4));root.style.setProperty(`--image-${index}-x`,`${((index-1.5)*6+progress*(index%2?-8:10)).toFixed(2)}px`);root.style.setProperty(`--image-${index}-scale`,(1.035+progress*.04+index*.003).toFixed(4))})}
  function rotate(point,yaw,pitch){const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);const x=point.x*cy-point.z*sy,z=point.x*sy+point.z*cy,y=point.y*cp-z*sp;return{x,y,z:y*sp+z*cp}}
  function project(point,yaw,pitch){const p=rotate(point,yaw,pitch),perspective=1/(5.9-p.z*.22),scale=Math.min(width,height)*1.58;return{x:width*.70+(p.x+pointerX*.12)*scale*perspective,y:height*.73-(p.y+pointerY*.08)*scale*perspective,z:p.z,scale:perspective}}
  function line(a,b,color='rgba(213,177,116,.24)',size=.65){context.strokeStyle=color;context.lineWidth=size;context.beginPath();context.moveTo(a.x,a.y);context.lineTo(b.x,b.y);context.stroke()}
  function drawBuilding(b,yaw,pitch,alpha){const x=b.x*.82,z=b.z*.82,w=b.w,d=b.d,h=b.h;const pts=[[-w/2,0,-d/2],[w/2,0,-d/2],[w/2,0,d/2],[-w/2,0,d/2],[-w/2,h,-d/2],[w/2,h,-d/2],[w/2,h,d/2],[-w/2,h,d/2]].map(([dx,dy,dz])=>project({x:x+dx,y:dy,z:z+dz},yaw,pitch));[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]].forEach(([a,c])=>line(pts[a],pts[c],`rgba(222,187,128,${alpha})`,.7));for(let floor=.28;floor<h;floor+=.32){line(project({x:x-w/2,y:floor,z:z-d/2},yaw,pitch),project({x:x+w/2,y:floor,z:z-d/2},yaw,pitch),`rgba(220,187,130,${alpha*.42})`,.45)}}
  function updateCopy(state){const{from,to,mix}=state;copyStates.forEach(el=>{el.style.opacity='0';el.style.transform='translate3d(0,20px,0)'});const blend=from===to?0:smootherstep(clamp((mix-.3)/.4));copyStates[from].style.opacity=(1-blend).toFixed(3);copyStates[from].style.transform=`translate3d(0,${(-14*blend).toFixed(2)}px,0)`;if(to!==from){copyStates[to].style.opacity=blend.toFixed(3);copyStates[to].style.transform=`translate3d(0,${(18*(1-blend)).toFixed(2)}px,0)`}const next=blend<.5?from:to;if(next!==activeState){activeState=next;code.textContent=`${String(activeState+1).padStart(3,'0')} / 005`;modelLabel.textContent=labels[activeState];nextButton.innerHTML=activeState===4?'进入品牌收束 <span>↓</span>':'继续滚动 <span>↓</span>';[...tabs,...topButtons].forEach(btn=>{const active=Number(btn.dataset.state)===activeState;btn.classList.toggle('is-active',active);btn.setAttribute('aria-current',active?'step':'false')});copyStates.forEach((el,i)=>el.setAttribute('aria-hidden',i===activeState?'false':'true'))}}
  function draw(progress){const state=chapterData(progress,5);context.clearRect(0,0,width,height);const yaw=-.55+progress*1.05+pointerX*.12,pitch=-.22+pointerY*.04;for(let i=-7;i<=7;i++){line(project({x:i*.42,y:0,z:-4},yaw,pitch),project({x:i*.42,y:0,z:4},yaw,pitch),'rgba(105,119,115,.12)',.5);line(project({x:-4,y:0,z:i*.42},yaw,pitch),project({x:4,y:0,z:i*.42},yaw,pitch),'rgba(105,119,115,.12)',.5)}const buildings=states[state.from].map((source,i)=>{const target=states[state.to][i];return{x:lerp(source.x,target.x,state.mix),z:lerp(source.z,target.z,state.mix),w:lerp(source.w,target.w,state.mix),d:lerp(source.d,target.d,state.mix),h:lerp(source.h,target.h,state.mix),seed:source.seed}});buildings.map(b=>({b,depth:rotate({x:b.x,y:0,z:b.z},yaw,pitch).z})).sort((a,b)=>b.depth-a.depth).forEach(({b},i)=>drawBuilding(b,yaw,pitch,.18+(i/buildings.length)*.30));const route=buildings.filter((_,i)=>i%4===0).map(b=>project({x:b.x*.82,y:.08,z:b.z*.82},yaw,pitch));route.forEach((p,i)=>{if(i)line(route[i-1],p,'rgba(235,177,81,.52)',1.1)});if(route.length>1){const t=(progress*4.8)%1,segment=(route.length-1)*t,index=Math.min(route.length-2,Math.floor(segment)),local=segment-index,x=lerp(route[index].x,route[index+1].x,local),y=lerp(route[index].y,route[index+1].y,local);context.globalAlpha=.9;context.drawImage(glow,x-17,y-17,34,34);context.globalAlpha=1}updateCopy(state);progressFill.style.transform=`scaleX(${progress.toFixed(5)})`}
  function applyFinaleState(rawProgress) {
    const progress = clamp((rawProgress - finaleStart) / (finaleEnd - finaleStart));
    const enter = smootherstep(clamp(progress / .08));
    const reveal = smootherstep(clamp((progress - .02) / .78));
    const fieldFade = 1 - smootherstep(clamp((progress - .05) / .30));
    const blendIn = smootherstep(clamp((progress - .10) / .38));
    const solid = smootherstep(clamp((progress - .76) / .22));
    const scale = lerp(32, 1, reveal);
    const storyFade = 1 - smootherstep(clamp((progress - .02) / .20));
    root.style.setProperty('--finale-opacity', enter.toFixed(4));
    root.style.setProperty('--finale-word-scale', scale.toFixed(4));
    root.style.setProperty('--finale-field-opacity', (enter * fieldFade).toFixed(4));
    root.style.setProperty('--finale-blend-opacity', (enter * blendIn * (1 - solid)).toFixed(4));
    root.style.setProperty('--finale-solid-opacity', solid.toFixed(4));
    root.style.setProperty('--finale-solid-text-opacity', solid.toFixed(4));
    root.style.setProperty('--finale-media-opacity', (1 - solid).toFixed(4));
    root.style.setProperty('--finale-kicker-opacity', smootherstep(clamp((progress - .82) / .16)).toFixed(4));
    root.style.setProperty('--story-copy-opacity', storyFade.toFixed(4));
    root.style.setProperty('--story-ui-opacity', storyFade.toFixed(4));
    root.style.setProperty('--geometry-opacity', storyFade.toFixed(4));
  }

  function renderFrame(now){const delta=lastFrameTime?Math.min(.05,Math.max(.001,(now-lastFrameTime)/1000)):1/60;lastFrameTime=now;if(reducedMotion){displayProgress=targetProgress;pointerX=pointerTargetX;pointerY=pointerTargetY}else{displayProgress=damp(displayProgress,targetProgress,17,delta);pointerX=damp(pointerX,pointerTargetX,12,delta);pointerY=damp(pointerY,pointerTargetY,12,delta)}const content=clamp(displayProgress/contentEnd),handoff=smootherstep(clamp((displayProgress-handoffStart)/(1-handoffStart)));applyFinaleState(displayProgress);applyImageState(content);draw(content);root.style.setProperty('--handoff',handoff.toFixed(5));root.style.setProperty('--shell-y',`${(-handoff*18).toFixed(2)}px`);const moving=Math.abs(displayProgress-targetProgress)>.00012||Math.abs(pointerX-pointerTargetX)>.0005||Math.abs(pointerY-pointerTargetY)>.0005;if(moving)animationFrame=requestAnimationFrame(renderFrame);else{displayProgress=targetProgress;animationFrame=0}}
  function scheduleRender(){if(animationFrame)return;lastFrameTime=performance.now();animationFrame=requestAnimationFrame(renderFrame)}
  function updateTargetFromScroll(){targetProgress=clamp((scrollY-storyStart)/storyDistance)}function onScroll(){updateTargetFromScroll();scheduleRender()}
  function resizeCanvas(){const rect=canvas.getBoundingClientRect(),limit=innerWidth<=720?1.2:1.45;ratio=Math.min(devicePixelRatio||1,limit);width=Math.max(1,rect.width);height=Math.max(1,rect.height);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);context.setTransform(ratio,0,0,ratio,0,0)}
  function measure(){measureFrame=0;const rect=story.getBoundingClientRect();storyStart=scrollY+rect.top;storyDistance=Math.max(1,story.offsetHeight-innerHeight);resizeCanvas();updateTargetFromScroll();if(!displayProgress)displayProgress=targetProgress;scheduleRender()}function scheduleMeasure(){if(measureFrame)return;measureFrame=requestAnimationFrame(measure)}
  function scrollToState(index){const normalized=clamp(index/4)*contentEnd;scrollTo({top:storyStart+storyDistance*normalized,behavior:reducedMotion?'auto':'smooth'})}
  tabs.forEach(btn=>btn.addEventListener('click',()=>scrollToState(Number(btn.dataset.state))));topButtons.forEach(btn=>btn.addEventListener('click',()=>scrollToState(Number(btn.dataset.state))));nextButton.addEventListener('click',()=>activeState<4?scrollToState(activeState+1):scrollTo({top:storyStart+storyDistance*(finaleStart+(finaleEnd-finaleStart)*.72),behavior:reducedMotion?'auto':'smooth'}));panel.addEventListener('pointermove',e=>{const rect=panel.getBoundingClientRect();pointerTargetX=((e.clientX-rect.left)/rect.width-.5)*2;pointerTargetY=((e.clientY-rect.top)/rect.height-.5)*2;scheduleRender()});panel.addEventListener('pointerleave',()=>{pointerTargetX=0;pointerTargetY=0;scheduleRender()});addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',scheduleMeasure,{passive:true});new ResizeObserver(scheduleMeasure).observe(story);measure();
})();
