(() => {
  const body = document.body;
  const header = document.querySelector('#site-header');
  const menuToggle = document.querySelector('#menu-toggle');
  const siteNav = document.querySelector('#site-nav');
  const navScrim = document.querySelector('#nav-scrim');
  const navLinks = [...document.querySelectorAll('#site-nav a[href^="#"]')];
  const sections = [...document.querySelectorAll('main > section[id]')];
  const mobileQuery = window.matchMedia('(max-width: 820px)');
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  const setMenu = (open, { restoreFocus = false } = {}) => {
    if (!menuToggle || !siteNav || !navScrim) return;

    const shouldOpen = Boolean(open && mobileQuery.matches);
    body.classList.toggle('menu-open', shouldOpen);
    menuToggle.setAttribute('aria-expanded', String(shouldOpen));
    menuToggle.setAttribute('aria-label', shouldOpen ? '关闭导航菜单' : '打开导航菜单');
    navScrim.hidden = !shouldOpen;
    navScrim.setAttribute('aria-hidden', String(!shouldOpen));

    if (shouldOpen) {
      window.requestAnimationFrame(() => navLinks[0]?.focus());
    } else if (restoreFocus) {
      menuToggle.focus();
    }
  };

  menuToggle?.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    setMenu(!isOpen, { restoreFocus: isOpen });
  });

  navScrim?.addEventListener('click', () => setMenu(false, { restoreFocus: true }));

  navLinks.forEach((link) => {
    link.addEventListener('click', () => setMenu(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && body.classList.contains('menu-open')) {
      setMenu(false, { restoreFocus: true });
    }
  });

  const handleViewportChange = (event) => {
    if (!event.matches) setMenu(false);
  };

  if (typeof mobileQuery.addEventListener === 'function') {
    mobileQuery.addEventListener('change', handleViewportChange);
  } else {
    mobileQuery.addListener(handleViewportChange);
  }

  const revealElements = [...document.querySelectorAll('.reveal')];
  const revealImmediately = reducedMotionQuery.matches || !('IntersectionObserver' in window);

  if (revealImmediately) {
    revealElements.forEach((element) => element.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -8% 0px',
    });

    revealElements.forEach((element) => revealObserver.observe(element));
  }

  if ('IntersectionObserver' in window && sections.length && navLinks.length) {
    const activeSectionObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      navLinks.forEach((link) => {
        const active = link.getAttribute('href') === `#${visible.target.id}`;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });
    }, {
      rootMargin: '-36% 0px -52% 0px',
      threshold: [0, .12, .35],
    });

    sections.forEach((section) => activeSectionObserver.observe(section));
  }

  const syncHeaderState = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 16);
  };

  syncHeaderState();
  window.addEventListener('scroll', syncHeaderState, { passive: true });
})();
