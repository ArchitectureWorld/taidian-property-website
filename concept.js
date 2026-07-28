(()=>{
      const states=[
        {kicker:'REAL COMMUNITY / DIGITAL CARE',title:'真实社区，<br><span class="accent">需要长期在场</span>',copy:'把真实社区场景作为主角，以克制的数字化标注呈现泰典物业的服务路径、响应节点与日常在场。',label:'LAYER / DAILY SERVICE',focus:[0,1,2,4,6]},
        {kicker:'EXPERIENCE / FASTER JUDGEMENT',title:'经验，<br><span class="accent">让判断更早一步</span>',copy:'长期住宅物业经验，让我们更快识别设施、环境与沟通问题，在事情扩大之前安排服务。',label:'LAYER / EXPERIENCE SIGNAL',focus:[1,3,5,7,8]},
        {kicker:'OLDER COMMUNITIES / RENEWAL',title:'老旧社区，<br><span class="accent">先理解再更新</span>',copy:'尊重社区原有生活肌理，以数字化记录连接巡查、问题、处理与复盘，持续修复日常体验。',label:'LAYER / RENEWAL TRACE',focus:[0,2,3,6,9]},
        {kicker:'BETTER VALUE / CLEAR PATHS',title:'路径更清晰，<br><span class="accent">投入才更高性价比</span>',copy:'减少重复、等待和无效动作，用更清楚的服务路径把人员与资源放到真正影响居民感受的位置。',label:'LAYER / VALUE PATH',focus:[2,4,5,8,9]},
        {kicker:'PARTNERSHIP / LONG TERM',title:'与泰典一起，<br><span class="accent">让社区长期变好</span>',copy:'从真实场景开始，把数字化效率与有温度的服务结合起来，建立可持续的社区合作关系。',label:'LAYER / PARTNERSHIP',focus:[0,1,4,7,9]}
      ];
      const canvas=document.getElementById('service-overlay'),ctx=canvas.getContext('2d'),scene=document.getElementById('scene'),scanLine=document.getElementById('scanLine');
      const title=document.getElementById('stateTitle'),copy=document.getElementById('stateCopy'),kicker=document.getElementById('stateKicker'),code=document.getElementById('chapterCode'),modelLabel=document.getElementById('modelLabel');
      const tabs=[...document.querySelectorAll('.state-tab')],topButtons=[...document.querySelectorAll('.topnav [data-state]')],nextButton=document.getElementById('nextState'),motionToggle=document.getElementById('motionToggle');
      const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
      const nodes=[
        [.13,.24],[.31,.18],[.52,.25],[.74,.18],[.88,.34],[.22,.48],[.43,.44],[.63,.47],[.81,.56],[.56,.72]
      ].map((point,index)=>({x:point[0],y:point[1],phase:index*.79+1.3,active:1}));
      const edges=[[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[6,9],[2,6],[4,8],[7,9]];
      let width=1,height=1,ratio=1,currentState=0,paused=reducedMotion,pointerX=0,pointerY=0,time=0,raf=0,scanProgress=0;

      function resize(){const rect=canvas.getBoundingClientRect();ratio=Math.min(devicePixelRatio||1,2);width=Math.max(1,rect.width);height=Math.max(1,rect.height);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);}
      function point(node){return{x:node.x*width+pointerX*8*(node.x-.5),y:node.y*height+pointerY*5*(node.y-.5)};}
      function render(timestamp=0){time=timestamp*.001;ctx.clearRect(0,0,width,height);if(!paused)scanProgress=(scanProgress+.0017)%1;const focus=new Set(states[currentState].focus),points=nodes.map(point);
        edges.forEach(([a,b],index)=>{const pa=points[a],pb=points[b],active=focus.has(a)||focus.has(b),pulse=.2+(.5+Math.sin(time*1.2+index)*.5)*.27;ctx.strokeStyle=active?`rgba(237,193,118,${pulse})`:`rgba(225,235,228,.15)`;ctx.lineWidth=active?.9:.55;ctx.beginPath();ctx.moveTo(pa.x,pa.y);ctx.lineTo(pb.x,pb.y);ctx.stroke();if(active){const t=(scanProgress+index*.12)%1,x=pa.x+(pb.x-pa.x)*t,y=pa.y+(pb.y-pa.y)*t,g=ctx.createRadialGradient(x,y,0,x,y,13);g.addColorStop(0,'rgba(255,210,132,.82)');g.addColorStop(.25,'rgba(255,210,132,.25)');g.addColorStop(1,'rgba(255,210,132,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,13,0,Math.PI*2);ctx.fill();}}
        );
        points.forEach((p,index)=>{const active=focus.has(index),r=active?2.5:1.35,pulse=reducedMotion?1:.7+Math.sin(time*1.6+nodes[index].phase)*.3;if(active){const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,22);g.addColorStop(0,'rgba(243,192,107,.38)');g.addColorStop(1,'rgba(243,192,107,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,22,0,Math.PI*2);ctx.fill();}ctx.fillStyle=active?'rgba(242,192,108,.96)':'rgba(229,236,231,.55)';ctx.beginPath();ctx.arc(p.x,p.y,r*pulse,0,Math.PI*2);ctx.fill();ctx.strokeStyle=active?'rgba(242,192,108,.55)':'rgba(229,236,231,.18)';ctx.lineWidth=.65;ctx.beginPath();ctx.arc(p.x,p.y,active?8:5,0,Math.PI*2);ctx.stroke();});
        scanLine.style.setProperty('--scan-x',`${scanProgress*width}px`);scene.style.setProperty('--image-x',`${pointerX*-5}px`);scene.style.setProperty('--image-y',`${pointerY*-3}px`);if(!paused)raf=requestAnimationFrame(render);
      }
      function setState(index){currentState=(index+states.length)%states.length;const state=states[currentState];title.innerHTML=state.title;copy.textContent=state.copy;kicker.textContent=state.kicker;code.textContent=`${String(currentState+1).padStart(3,'0')} / 005`;modelLabel.textContent=state.label;tabs.forEach((tab,i)=>{const active=i===currentState;tab.classList.toggle('is-active',active);tab.setAttribute('aria-current',active?'step':'false');});topButtons.forEach((button,i)=>button.classList.toggle('is-active',i===currentState));if(paused)render(0);}
      function toggleMotion(){paused=!paused;motionToggle.textContent=paused?'继续动态':'暂停动态';motionToggle.setAttribute('aria-pressed',String(paused));if(paused){cancelAnimationFrame(raf);render(0);}else{raf=requestAnimationFrame(render);}}
      tabs.forEach(tab=>tab.addEventListener('click',()=>setState(Number(tab.dataset.state))));topButtons.forEach(button=>button.addEventListener('click',()=>setState(Number(button.dataset.state))));nextButton.addEventListener('click',()=>setState(currentState+1));motionToggle.addEventListener('click',toggleMotion);
      scene.addEventListener('pointermove',event=>{const rect=scene.getBoundingClientRect();pointerX=((event.clientX-rect.left)/rect.width-.5)*2;pointerY=((event.clientY-rect.top)/rect.height-.5)*2;});scene.addEventListener('pointerleave',()=>{pointerX=0;pointerY=0;});
      addEventListener('keydown',event=>{if(event.key==='ArrowRight')setState(currentState+1);if(event.key==='ArrowLeft')setState(currentState-1);});addEventListener('resize',resize);resize();render();
    })();
