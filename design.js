(() => {
  'use strict';

  const app = document.getElementById('app') || document.querySelector('.app');
  if (!app) return;

  app.dataset.ui = 'literary-atlas';
  document.querySelector('.sidebar')?.setAttribute('aria-label', 'Obsah a filtry časové osy');
  document.querySelector('.topbar')?.setAttribute('aria-label', 'Nástroje časové osy');
  document.querySelector('.timeline-shell')?.setAttribute('aria-label', 'Interaktivní časová osa literatury a dějin');

  const brand = document.querySelector('.brand');
  if (brand && !brand.querySelector('.brand-copy')) {
    const title = brand.querySelector('strong');
    if (title) {
      const copy = document.createElement('span');
      copy.className = 'brand-copy';
      copy.innerHTML = '<strong>Časovrstvy</strong><small>literární atlas</small>';
      title.replaceWith(copy);
    }
  }

  document.querySelectorAll('.filter').forEach(filter => {
    filter.dataset.testid = `timeline-filter-${filter.dataset.id || 'unknown'}`;
    filter.setAttribute('aria-pressed', String(filter.classList.contains('active')));
    filter.addEventListener('click', () => {
      requestAnimationFrame(() => filter.setAttribute('aria-pressed', String(filter.classList.contains('active'))));
    });
  });

  const search = document.getElementById('search');
  if (search) search.dataset.testid = 'timeline-search';
  document.getElementById('fit')?.setAttribute('data-testid', 'timeline-fit');
  document.getElementById('authorMenuToggle')?.setAttribute('data-testid', 'sidebar-toggle');

  /* ---- off-canvas drawer wiring ---- */
  const isMobile = () => window.matchMedia('(max-width:820px)').matches;
  const openDrawer = () => { app.classList.add('drawer-open'); app.classList.remove('sidebar-collapsed'); };
  const closeDrawer = () => app.classList.remove('drawer-open');
  const toggleDrawer = () => app.classList.contains('drawer-open') ? closeDrawer() : openDrawer();

  // default: hide sidebar (it lives in the drawer)
  app.classList.add('sidebar-collapsed');

  const menuToggle = document.getElementById('authorMenuToggle');
  if (menuToggle) {
    menuToggle.setAttribute('aria-label', 'Otevřít filtry a obsah');
    menuToggle.dataset.testid = 'drawer-open';
    menuToggle.addEventListener('click', toggleDrawer);
  }
  document.addEventListener('click', (event) => {
    if (!app.classList.contains('drawer-open')) return;
    if (event.target.closest('.sidebar') || event.target.closest('#authorMenuToggle') || event.target.closest('.author-menu-reopen')) return;
    if (isMobile()) return; // mobile keeps its own overlay/menu behaviour
    closeDrawer();
  });

  // drawer backdrop closes it
  app.addEventListener('click', (event) => {
    if (event.target === app && app.classList.contains('drawer-open')) closeDrawer();
  });

  // reopen floating button — clean drawer toggle (don't call the old onclick
  // from authors.js, which references out-of-scope appRoot and throws)
  const reopen = document.getElementById('authorMenuReopen');
  if (reopen) {
    reopen.removeAttribute('onclick');
    reopen.setAttribute('aria-label', 'Otevřít filtry a obsah');
    reopen.dataset.testid = 'drawer-reopen';
    reopen.onclick = () => toggleDrawer();
  }
})();
