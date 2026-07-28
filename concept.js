(() => {
      const states = [
        {
          kicker: 'Community as a living system',
          title: '让社区<br><span class="accent">更有序地运行</span>',
          copy: '泰典物业以住宅物业经验为基础，把居民、空间、设施与服务连接成一套长期运行的社区系统。'
        },
        {
          kicker: 'Experience becomes structure',
          title: '经验不是年限<br><span class="accent">而是判断力</span>',
          copy: '长期服务住宅与老旧社区，让我们更早识别问题、更准确安排优先级，也更懂得如何与居民沟通。'
        },
        {
          kicker: 'Better value, visibly',
          title: '更懂问题<br><span class="accent">才有高性价比</span>',
          copy: '高性价比不是压低价格，而是减少试错、重复劳动和无效投入，让资源真正回到服务结果。'
        },
        {
          kicker: 'Digital tools, human service',
          title: '数字化提升效率<br><span class="accent">服务依然有温度</span>',
          copy: '用数字化流程连接巡检、响应与复盘，让管理更清楚、执行更稳定，但每一次服务仍然从人出发。'
        },
        {
          kicker: 'A long-term community partner',
          title: '把社区的日常<br><span class="accent">长期认真做好</span>',
          copy: '泰典物业希望成为社区可信赖的长期伙伴，让每一处空间在稳定服务中持续焕发生机。'
        }
      ];

      const title = document.getElementById('stateTitle');
      const copy = document.getElementById('stateCopy');
      const kicker = document.getElementById('stateKicker');
      const chapterCode = document.getElementById('chapterCode');
      const tabs = [...document.querySelectorAll('.state-tab')];
      const nextButton = document.getElementById('nextState');
      const canvas = document.getElementById('community-network');
      const context = canvas.getContext('2d');
      const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
      let currentState = 0;
      let width = 1;
      let height = 1;
      let pixelRatio = 1;
      let pointerX = 0;
      let pointerY = 0;
      let time = 0;
      let animationFrame = 0;

      const seeded = (() => {
        let seed = 1847;
        return () => {
          seed = (seed * 16807) % 2147483647;
          return (seed - 1) / 2147483646;
        };
      })();

      const particles = Array.from({ length: 92 }, (_, index) => ({
        x: seeded() * 2 - 1,
        y: seeded() * 2 - 1,
        z: seeded() * 2 - 1,
        tx: 0,
        ty: 0,
        tz: 0,
        radius: .7 + seeded() * 1.7,
        phase: seeded() * Math.PI * 2,
        speed: .35 + seeded() * .65,
        hub: index % 17 === 0
      }));

      function targetFor(index, stateIndex) {
        const count = particles.length;
        const t = index / count;
        const golden = Math.PI * (3 - Math.sqrt(5));
        const angle = index * golden;
        if (stateIndex === 0) {
          const radius = .28 + .42 * Math.sqrt(t);
          return {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle * 1.07) * radius * .8,
            z: Math.sin(angle) * .36 + (seeded() - .5) * .08
          };
        }
        if (stateIndex === 1) {
          const layer = index % 4;
          const radius = .18 + layer * .14;
          const a = (index / count) * Math.PI * 8 + layer * .6;
          return { x: Math.cos(a) * radius, y: Math.sin(a) * radius * .68, z: (layer - 1.5) * .12 };
        }
        if (stateIndex === 2) {
          const hubs = [
            { x: -.38, y: -.18 }, { x: .18, y: -.33 }, { x: .38, y: .22 }, { x: -.12, y: .31 }
          ];
          const hub = hubs[index % hubs.length];
          const a = angle * 1.7;
          const radius = .05 + (index % 9) * .015;
          return { x: hub.x + Math.cos(a) * radius, y: hub.y + Math.sin(a) * radius, z: Math.sin(a) * .12 };
        }
        if (stateIndex === 3) {
          const columns = 10;
          const row = Math.floor(index / columns);
          const column = index % columns;
          return {
            x: (column - 4.5) * .095,
            y: (row - 4) * .085,
            z: Math.sin(column * .8 + row * .55) * .16
          };
        }
        const ring = index % 3;
        const a = (index / count) * Math.PI * 6;
        const radius = .14 + ring * .16;
        return { x: Math.cos(a) * radius, y: Math.sin(a) * radius * .66, z: Math.cos(a * 1.4) * .12 };
      }

      function assignTargets(stateIndex) {
        particles.forEach((particle, index) => {
          const target = targetFor(index, stateIndex);
          particle.tx = target.x;
          particle.ty = target.y;
          particle.tz = target.z;
        });
      }

      function resize() {
        const rect = canvas.getBoundingClientRect();
        pixelRatio = Math.min(devicePixelRatio || 1, 2);
        width = Math.max(1, rect.width);
        height = Math.max(1, rect.height);
        canvas.width = Math.round(width * pixelRatio);
        canvas.height = Math.round(height * pixelRatio);
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      }

      function projected(particle) {
        const breathing = reducedMotion ? 1 : 1 + Math.sin(time * .0012 + particle.phase) * .018;
        const perspective = 1 / (1.65 - particle.z * .34);
        const scale = Math.min(width, height) * .82;
        return {
          x: width * .51 + (particle.x * breathing + pointerX * .035 * perspective) * scale,
          y: height * .5 + (particle.y * breathing + pointerY * .025 * perspective) * scale,
          z: particle.z,
          scale: perspective
        };
      }

      function render(timestamp = 0) {
        time = timestamp;
        context.clearRect(0, 0, width, height);

        const centerX = width * .51;
        const centerY = height * .5;
        const halo = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.min(width, height) * .32);
        halo.addColorStop(0, 'rgba(255, 193, 88, .26)');
        halo.addColorStop(.25, 'rgba(255, 214, 143, .11)');
        halo.addColorStop(1, 'rgba(255, 255, 255, 0)');
        context.fillStyle = halo;
        context.fillRect(0, 0, width, height);

        const points = particles.map((particle) => {
          const easing = reducedMotion ? 1 : .045;
          particle.x += (particle.tx - particle.x) * easing;
          particle.y += (particle.ty - particle.y) * easing;
          particle.z += (particle.tz - particle.z) * easing;
          return projected(particle);
        });

        for (let i = 0; i < points.length; i += 1) {
          for (let j = i + 1; j < points.length; j += 1) {
            const dx = points[i].x - points[j].x;
            const dy = points[i].y - points[j].y;
            const distance = Math.hypot(dx, dy);
            const maxDistance = currentState === 3 ? 104 : 88;
            if (distance < maxDistance) {
              const alpha = (1 - distance / maxDistance) * .19;
              context.strokeStyle = `rgba(52, 55, 56, ${alpha})`;
              context.lineWidth = .6;
              context.beginPath();
              context.moveTo(points[i].x, points[i].y);
              context.lineTo(points[j].x, points[j].y);
              context.stroke();
            }
          }
        }

        points.forEach((point, index) => {
          const particle = particles[index];
          const pulse = reducedMotion ? 1 : .75 + Math.sin(time * .002 * particle.speed + particle.phase) * .25;
          const radius = particle.radius * point.scale * (particle.hub ? 2.2 : 1) * pulse;
          if (particle.hub) {
            const glow = context.createRadialGradient(point.x, point.y, 0, point.x, point.y, 18);
            glow.addColorStop(0, 'rgba(255, 185, 72, .72)');
            glow.addColorStop(.2, 'rgba(255, 185, 72, .22)');
            glow.addColorStop(1, 'rgba(255, 185, 72, 0)');
            context.fillStyle = glow;
            context.beginPath();
            context.arc(point.x, point.y, 18, 0, Math.PI * 2);
            context.fill();
          }
          context.fillStyle = particle.hub ? 'rgba(183, 122, 35, .94)' : `rgba(37, 40, 42, ${.36 + point.scale * .18})`;
          context.beginPath();
          context.arc(point.x, point.y, Math.max(.7, radius), 0, Math.PI * 2);
          context.fill();
        });

        context.strokeStyle = 'rgba(181, 132, 58, .16)';
        context.lineWidth = 1;
        for (let ring = 1; ring <= 3; ring += 1) {
          context.beginPath();
          context.ellipse(centerX, centerY, Math.min(width, height) * (.12 + ring * .085), Math.min(width, height) * (.08 + ring * .052), 0, 0, Math.PI * 2);
          context.stroke();
        }

        if (!reducedMotion) animationFrame = requestAnimationFrame(render);
      }

      function setState(index) {
        currentState = (index + states.length) % states.length;
        const state = states[currentState];
        title.innerHTML = state.title;
        copy.textContent = state.copy;
        kicker.textContent = state.kicker;
        chapterCode.textContent = `${String(currentState + 1).padStart(3, '0')} / 005`;
        tabs.forEach((tab, tabIndex) => {
          const active = tabIndex === currentState;
          tab.classList.toggle('is-active', active);
          tab.setAttribute('aria-current', active ? 'step' : 'false');
        });
        assignTargets(currentState);
        if (reducedMotion) render(performance.now());
      }

      tabs.forEach((tab) => tab.addEventListener('click', () => setState(Number(tab.dataset.state))));
      nextButton.addEventListener('click', () => setState(currentState + 1));
      window.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowRight') setState(currentState + 1);
        if (event.key === 'ArrowLeft') setState(currentState - 1);
      });

      canvas.addEventListener('pointermove', (event) => {
        const rect = canvas.getBoundingClientRect();
        pointerX = ((event.clientX - rect.left) / rect.width - .5) * 2;
        pointerY = ((event.clientY - rect.top) / rect.height - .5) * 2;
      });
      canvas.addEventListener('pointerleave', () => { pointerX = 0; pointerY = 0; });
      window.addEventListener('resize', resize);

      assignTargets(0);
      resize();
      render();
    })();
