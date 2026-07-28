(() => {
      const states = [
        { kicker: 'SPACE / ORDER / SERVICE', title: '让空间，<br><span class="accent">被更精确地管理</span>', copy: '从楼栋、设施到公共空间，把复杂社区转化成清晰、可持续的运营结构。', label: 'MODEL / COMMUNITY CORE' },
        { kicker: 'EXPERIENCE / STRUCTURE', title: '经验，<br><span class="accent">让体系更稳定</span>', copy: '长期住宅物业经验形成清晰的判断顺序、协作关系与服务标准，让复杂工作保持稳定。', label: 'MODEL / EXPERIENCE LAYERS' },
        { kicker: 'OLDER COMMUNITIES / RENEWAL', title: '理解原有结构，<br><span class="accent">再逐步更新</span>', copy: '尊重老旧社区原有生活肌理，从真实问题出发，修复设施、空间与居民体验之间的断点。', label: 'MODEL / RENEWAL MAP' },
        { kicker: 'BETTER VALUE / EFFICIENCY', title: '把资源，<br><span class="accent">放在最有效的位置</span>', copy: '高性价比来自更短的响应路径、更合理的优先级和更稳定的执行，让有限投入产生长期价值。', label: 'MODEL / VALUE OPTIMIZATION' },
        { kicker: 'PARTNERSHIP / LONG TERM', title: '共同建立，<br><span class="accent">可持续的社区秩序</span>', copy: '泰典物业期待与业委会、社区和合作伙伴一起，把数字化服务体系落实到每一天。', label: 'MODEL / PARTNERSHIP GATE' }
      ];

      const canvas = document.getElementById('wireframe-stage');
      const ctx = canvas.getContext('2d');
      const title = document.getElementById('stateTitle');
      const copy = document.getElementById('stateCopy');
      const kicker = document.getElementById('stateKicker');
      const code = document.getElementById('chapterCode');
      const modelLabel = document.getElementById('modelLabel');
      const tabs = [...document.querySelectorAll('.state-tab')];
      const topButtons = [...document.querySelectorAll('.topnav [data-state]')];
      const nextButton = document.getElementById('nextState');
      const motionToggle = document.getElementById('motionToggle');
      const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

      const sourceBuildings = [
        [-4.2,-2.0,1.5,1.4,3.4,.08],[-2.3,-2.6,1.3,1.3,5.2,.14],[-.6,-2.8,1.7,1.5,7.6,.22],[1.6,-2.5,1.4,1.2,5.8,.3],[3.5,-1.9,1.6,1.4,4.1,.38],
        [-4.5,.3,1.2,1.4,2.7,.46],[-2.8,.1,1.5,1.3,3.7,.54],[-.8,.2,1.9,1.6,4.8,.62],[1.7,.1,1.6,1.4,3.9,.7],[3.8,.4,1.3,1.5,2.9,.78],
        [-3.5,2.5,1.8,1.4,2.2,.84],[-1.1,2.4,1.5,1.5,2.8,.9],[1.2,2.5,1.6,1.5,2.4,.96],[3.5,2.3,1.7,1.4,2.0,.99]
      ].map(([x,z,w,d,h,seed]) => ({x,z,w,d,h,seed}));

      let width = 1, height = 1, ratio = 1, currentState = 0, previousState = 0, blend = 1, paused = reducedMotion, pointerX = 0, pointerY = 0, last = performance.now(), raf = 0;

      function resize() {
        const rect = canvas.getBoundingClientRect();
        ratio = Math.min(devicePixelRatio || 1, 2);
        width = Math.max(1, rect.width); height = Math.max(1, rect.height);
        canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
        ctx.setTransform(ratio,0,0,ratio,0,0);
      }
      function ease(value) { value = Math.min(1, Math.max(0, value)); return 1 - Math.pow(1 - value, 4); }

      function transformBuilding(building, state, time) {
        const b = {...building};
        if (state === 1) { b.h *= 1.08 + (1 - Math.abs(b.x) / 5) * .18; b.x *= .96; b.z *= .92; }
        if (state === 2) { b.h *= .58 + b.seed * .55; b.x += Math.sin((b.seed+1)*17.2)*.45; b.z += Math.cos(b.seed*23)*.35; b.w *= .82 + b.seed*.2; }
        if (state === 3) { b.x *= .82; b.z *= .72; b.h *= .9; }
        if (state === 4) { b.x *= .72; b.z *= .72; b.h = b.seed > .76 ? 1.6 : b.h * .34; }
        b.h *= .92 + Math.sin(time*.35 + b.seed*8)*.012;
        return b;
      }
      function mix(a,b,t) { const r={seed:b.seed}; ['x','z','w','d','h'].forEach(k => r[k]=a[k]+(b[k]-a[k])*t); return r; }
      function rotatePoint(p,yaw,pitch) {
        const cy=Math.cos(yaw), sy=Math.sin(yaw), x=p.x*cy-p.z*sy, z=p.x*sy+p.z*cy;
        const cx=Math.cos(pitch), sx=Math.sin(pitch); return {x,y:p.y*cx-z*sx,z:p.y*sx+z*cx};
      }
      function projectPoint(p,yaw,pitch) {
        const r=rotatePoint(p,yaw,pitch), scale=Math.min(width,height)*.064, camera=12, depth=camera+r.z, perspective=camera/Math.max(3.5,depth);
        return {x:width*.52+r.x*scale*perspective,y:height*.63-r.y*scale*perspective,depth,perspective};
      }
      const edges=[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
      function vertices(b) { const x0=b.x-b.w/2,x1=b.x+b.w/2,z0=b.z-b.d/2,z1=b.z+b.d/2; return [{x:x0,y:0,z:z0},{x:x1,y:0,z:z0},{x:x1,y:0,z:z1},{x:x0,y:0,z:z1},{x:x0,y:b.h,z:z0},{x:x1,y:b.h,z:z0},{x:x1,y:b.h,z:z1},{x:x0,y:b.h,z:z1}]; }

      function drawGrid(yaw,pitch) {
        ctx.lineWidth=.55;
        for(let n=-8;n<=8;n++) {
          const a=projectPoint({x:n,y:0,z:-7},yaw,pitch), b=projectPoint({x:n,y:0,z:7},yaw,pitch);
          ctx.strokeStyle=`rgba(154,166,160,${n%2===0?.085:.04})`; ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
          const c=projectPoint({x:-8,y:0,z:n},yaw,pitch), d=projectPoint({x:8,y:0,z:n},yaw,pitch); ctx.beginPath(); ctx.moveTo(c.x,c.y); ctx.lineTo(d.x,d.y); ctx.stroke();
        }
      }
      function drawConnections(buildings,yaw,pitch,time) {
        for(let i=0;i<buildings.length-1;i++) {
          const a=buildings[i],b=buildings[(i+3)%buildings.length]; if(Math.abs(a.x-b.x)+Math.abs(a.z-b.z)>5.4) continue;
          const pa=projectPoint({x:a.x,y:.08,z:a.z},yaw,pitch),pb=projectPoint({x:b.x,y:.08,z:b.z},yaw,pitch),pulse=.12+(.5+Math.sin(time*1.2+i)*.5)*.26;
          ctx.strokeStyle=`rgba(217,169,91,${pulse})`; ctx.lineWidth=.85; ctx.beginPath(); ctx.moveTo(pa.x,pa.y); ctx.lineTo(pb.x,pb.y); ctx.stroke();
          const t=(time*.13+i*.19)%1,x=pa.x+(pb.x-pa.x)*t,y=pa.y+(pb.y-pa.y)*t,g=ctx.createRadialGradient(x,y,0,x,y,9); g.addColorStop(0,'rgba(242,194,113,.8)'); g.addColorStop(1,'rgba(242,194,113,0)'); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,9,0,Math.PI*2); ctx.fill();
        }
      }
      function drawBuilding(b,yaw,pitch,progress) {
        const v=vertices({...b,h:b.h*progress}), p=v.map(point=>projectPoint(point,yaw,pitch)), alpha=.14+b.seed*.27;
        ctx.lineWidth=b.seed>.72?1.05:.72;
        edges.forEach(([a,c])=>{ const warm=b.seed>.7&&(a>=4||c>=4); ctx.strokeStyle=warm?`rgba(227,181,104,${alpha+.2})`:`rgba(173,187,179,${alpha})`; ctx.beginPath(); ctx.moveTo(p[a].x,p[a].y); ctx.lineTo(p[c].x,p[c].y); ctx.stroke(); });
        const floors=Math.max(2,Math.round(b.h*1.2)); for(let f=1;f<floors;f++){ const y=b.h*progress*f/floors,a=projectPoint({x:b.x-b.w/2,y,z:b.z-b.d/2},yaw,pitch),c=projectPoint({x:b.x+b.w/2,y,z:b.z-b.d/2},yaw,pitch); ctx.strokeStyle=`rgba(151,165,158,${alpha*.46})`; ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(c.x,c.y); ctx.stroke(); }
      }

      function render(timestamp=0) {
        const time=timestamp*.001,dt=Math.min(44,timestamp-last); last=timestamp; if(!paused) blend=Math.min(1,blend+dt/1150); const amount=ease(blend);
        ctx.clearRect(0,0,width,height);
        const yaw=-.52+pointerX*.12+(paused?0:Math.sin(time*.17)*.035),pitch=-.22+pointerY*.05; drawGrid(yaw,pitch);
        const buildings=sourceBuildings.map(b=>mix(transformBuilding(b,previousState,paused?0:time),transformBuilding(b,currentState,paused?0:time),amount));
        drawConnections(buildings,yaw,pitch,time);
        buildings.map(b=>({b,depth:rotatePoint({x:b.x,y:0,z:b.z},yaw,pitch).z})).sort((a,b)=>b.depth-a.depth).forEach(({b})=>{ const rise=Math.max(0,Math.min(1,blend*1.45-b.seed*.38)); drawBuilding(b,yaw,pitch,paused?1:ease(rise)); });
        if(!paused) raf=requestAnimationFrame(render);
      }

      function setState(index) {
        const next=(index+states.length)%states.length; if(next===currentState) return; previousState=currentState; currentState=next; blend=paused?1:0;
        const state=states[currentState]; title.innerHTML=state.title; copy.textContent=state.copy; kicker.textContent=state.kicker; code.textContent=`${String(currentState+1).padStart(3,'0')} / 005`; modelLabel.textContent=state.label;
        tabs.forEach((tab,i)=>{ const active=i===currentState; tab.classList.toggle('is-active',active); tab.setAttribute('aria-current',active?'step':'false'); });
        topButtons.forEach((button,i)=>button.classList.toggle('is-active',i===currentState)); if(paused) render(0);
      }
      function toggleMotion(){ paused=!paused; motionToggle.textContent=paused?'继续动态':'暂停动态'; motionToggle.setAttribute('aria-pressed',String(paused)); if(paused){cancelAnimationFrame(raf);render(0);}else{last=performance.now();raf=requestAnimationFrame(render);} }

      tabs.forEach(tab=>tab.addEventListener('click',()=>setState(Number(tab.dataset.state))));
      topButtons.forEach(button=>button.addEventListener('click',()=>setState(Number(button.dataset.state))));
      nextButton.addEventListener('click',()=>setState(currentState+1)); motionToggle.addEventListener('click',toggleMotion);
      canvas.addEventListener('pointermove',event=>{ const rect=canvas.getBoundingClientRect(); pointerX=((event.clientX-rect.left)/rect.width-.5)*2; pointerY=((event.clientY-rect.top)/rect.height-.5)*2; });
      canvas.addEventListener('pointerleave',()=>{pointerX=0;pointerY=0;});
      addEventListener('keydown',event=>{if(event.key==='ArrowRight')setState(currentState+1);if(event.key==='ArrowLeft')setState(currentState-1);});
      addEventListener('resize',resize); resize(); render();
    })();
