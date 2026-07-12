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
})();
