(() => {
  const story=document.getElementById('scrollStory'),canvas=document.getElementById('architecture-canvas'),ctx=canvas.getContext('2d'),panel=document.getElementById('modelPanel');
  const copyStates=[...document.querySelectorAll('[data-copy-state]')],tabs=[...document.querySelectorAll('.state-tab')],topButtons=[...document.querySelectorAll('.topnav [data-state]')];
  const code=document.getElementById('chapterCode'),progressFill=document.getElementById('progressFill'),modelLabel=document.getElementById('modelLabel'),nextButton=document.getElementById('nextState');
  const labels=['MODEL / COMMUNITY','MODEL / EXPERIENCE','MODEL / EXISTING FABRIC','MODEL / SERVICE PATH','MODEL / LONG TERM'];
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let width=1,height=1,ratio=1,pointerX=0,pointerY=0,storyProgress=0,segmentProgress=0,activeState=0,raf=0;
  const clamp=(v,min=0,max=1)=>Math.min(max,Math.max(min,v)),lerp=(a,b,t)=>a+(b-a)*t,ease=t=>t*t*(3-2*t);
  const noise=(i,s=0)=>{const v=Math.sin(i*91.37+s*241.19)*43758.5453;return v-Math.floor(v)};
  const base=Array.from({length:28},(_,i)=>({seed:noise(i,2),x:(i%7)-3,z:Math.floor(i/7)-1.5,w:.42+noise(i,4)*.28,d:.42+noise(i,5)*.25,h:.55+noise(i,6)*1.8}));

  function transform(building,state){const b={...building};
    if(state===0){b.x*=.86;b.z*=.8;b.h=.55+building.h*.72;}
    if(state===1){const ring=Math.floor(building.seed*4),angle=(building.x+building.z*2)*.62;b.x=Math.cos(angle)*(1.1+ring*.48);b.z=Math.sin(angle)*(1+ring*.38);b.h=.7+ring*.48+building.seed*.5;}
    if(state===2){b.x=building.x*.62+Math.sin(building.z*2.4)*.34;b.z=building.z*.65;b.h=.55+building.seed*2.25;b.w*=.78;b.d*=.78;}
    if(state===3){b.x=(building.x<0?-1:1)*(1.05+Math.abs(building.x)*.44);b.z=building.z*.74;b.h=.48+building.seed*1.35;}
    if(state===4){const a=(building.x+3+building.z*7)*.43,r=1.2+Math.abs(building.z)*.48;b.x=Math.cos(a)*r;b.z=Math.sin(a)*r*.72;b.h=.72+building.seed*1.65;}
    return b;
  }
  const states=Array.from({length:5},(_,state)=>base.map(b=>transform(b,state)));
  function resize(){const rect=canvas.getBoundingClientRect();ratio=Math.min(devicePixelRatio||1,2);width=Math.max(1,rect.width);height=Math.max(1,rect.height);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);scheduleRender();}
  function currentScrollProgress(){return clamp((scrollY-story.offsetTop)/Math.max(1,story.offsetHeight-innerHeight));}
  function stateData(progress){const scaled=progress*4,from=Math.floor(scaled),to=Math.min(4,from+1),mix=ease(scaled-from);return{scaled,from,to,mix};}
  function rotate(point,yaw,pitch){const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);const x=point.x*cy-point.z*sy,z=point.x*sy+point.z*cy,y=point.y*cp-z*sp;return{x,y,z:y*sp+z*cp};}
  function project(point,yaw,pitch){const p=rotate(point,yaw,pitch),perspective=1/(5.9-p.z*.22),scale=Math.min(width,height)*1.55;return{x:width*.53+(p.x+pointerX*.12)*scale*perspective,y:height*.72-(p.y+pointerY*.08)*scale*perspective,z:p.z,scale:perspective};}
  function line(a,b,color='rgba(203,169,111,.22)',size=.65){ctx.strokeStyle=color;ctx.lineWidth=size;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
  function drawBuilding(b,yaw,pitch,alpha){const x=b.x*.82,z=b.z*.82,w=b.w,d=b.d,h=b.h;const pts=[[-w/2,0,-d/2],[w/2,0,-d/2],[w/2,0,d/2],[-w/2,0,d/2],[-w/2,h,-d/2],[w/2,h,-d/2],[w/2,h,d/2],[-w/2,h,d/2]].map(([dx,dy,dz])=>project({x:x+dx,y:dy,z:z+dz},yaw,pitch));const edges=[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];edges.forEach(([a,c])=>line(pts[a],pts[c],`rgba(219,184,123,${alpha})`,.7));for(let floor=.28;floor<h;floor+=.32){const p1=project({x:x-w/2,y:floor,z:z-d/2},yaw,pitch),p2=project({x:x+w/2,y:floor,z:z-d/2},yaw,pitch);line(p1,p2,`rgba(220,187,130,${alpha*.42})`,.45);}}
  function updateCopy(scaled){copyStates.forEach((el,i)=>{const d=Math.abs(scaled-i),opacity=clamp(1-d*1.45);el.style.opacity=opacity.toFixed(3);el.style.transform=`translateY(${(i-scaled)*22}px)`;el.setAttribute('aria-hidden',opacity<.45?'true':'false')});activeState=Math.round(scaled);code.textContent=`${String(activeState+1).padStart(3,'0')} / 005`;modelLabel.textContent=labels[activeState];[...tabs,...topButtons].forEach(btn=>{const active=Number(btn.dataset.state)===activeState;btn.classList.toggle('is-active',active);btn.setAttribute('aria-current',active?'step':'false')});}
  function draw(){const {scaled,from,to,mix}=stateData(storyProgress);segmentProgress=mix;ctx.clearRect(0,0,width,height);const yaw=-.55+storyProgress*1.05+pointerX*.12,pitch=-.22+pointerY*.04;
    for(let i=-7;i<=7;i++){line(project({x:i*.42,y:0,z:-4},yaw,pitch),project({x:i*.42,y:0,z:4},yaw,pitch),'rgba(105,119,115,.12)',.5);line(project({x:-4,y:0,z:i*.42},yaw,pitch),project({x:4,y:0,z:i*.42},yaw,pitch),'rgba(105,119,115,.12)',.5)}
    const buildings=states[from].map((source,i)=>{const target=states[to][i];return{x:lerp(source.x,target.x,mix),z:lerp(source.z,target.z,mix),w:lerp(source.w,target.w,mix),d:lerp(source.d,target.d,mix),h:lerp(source.h,target.h,mix),seed:source.seed}});
    buildings.map(b=>({b,depth:rotate({x:b.x,y:0,z:b.z},yaw,pitch).z})).sort((a,b)=>b.depth-a.depth).forEach(({b},i)=>drawBuilding(b,yaw,pitch,.19+(i/buildings.length)*.28));
    const route=buildings.filter((_,i)=>i%4===0).map(b=>project({x:b.x*.82,y:.08,z:b.z*.82},yaw,pitch));route.forEach((p,i)=>{if(i)line(route[i-1],p,'rgba(230,174,82,.48)',1.1)});if(route.length>1){const t=(storyProgress*4.8)%1,segment=(route.length-1)*t,index=Math.min(route.length-2,Math.floor(segment)),local=segment-index,x=lerp(route[index].x,route[index+1].x,local),y=lerp(route[index].y,route[index+1].y,local),g=ctx.createRadialGradient(x,y,0,x,y,18);g.addColorStop(0,'rgba(255,191,89,.85)');g.addColorStop(1,'rgba(255,191,89,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,18,0,Math.PI*2);ctx.fill();}
    updateCopy(scaled);progressFill.style.transform=`scaleX(${storyProgress})`;panel.style.setProperty('--model-progress',storyProgress.toFixed(4));}
  function render(){raf=0;draw()}function scheduleRender(){if(!raf)raf=requestAnimationFrame(render)}function onScroll(){storyProgress=reducedMotion?Math.round(currentScrollProgress()*4)/4:currentScrollProgress();scheduleRender()}
  function scrollToState(index){scrollTo({top:story.offsetTop+(story.offsetHeight-innerHeight)*clamp(index/4),behavior:reducedMotion?'auto':'smooth'})}
  tabs.forEach(b=>b.addEventListener('click',()=>scrollToState(Number(b.dataset.state))));topButtons.forEach(b=>b.addEventListener('click',()=>scrollToState(Number(b.dataset.state))));nextButton.addEventListener('click',()=>scrollToState(Math.min(4,activeState+1)));panel.addEventListener('pointermove',e=>{const r=panel.getBoundingClientRect();pointerX=((e.clientX-r.left)/r.width-.5)*2;pointerY=((e.clientY-r.top)/r.height-.5)*2;scheduleRender()});panel.addEventListener('pointerleave',()=>{pointerX=0;pointerY=0;scheduleRender()});addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',resize);resize();onScroll();
})();