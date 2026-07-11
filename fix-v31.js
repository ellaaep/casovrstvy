(() => {
  'use strict';

  const timeline = document.getElementById('timeline');
  const iconMap = {
    czech: '<svg viewBox="0 0 24 24"><path d="M3 9h18M5 9v9m4-9v9m6-9v9m4-9v9M3 20h18M12 3l9 5H3l9-5Z"/></svg>',
    world: '<svg viewBox="0 0 24 24"><path d="M12 22s7-3.5 7-10V5l-7-3-7 3v7c0 6.5 7 10 7 10Z"/></svg>',
    tech: '<svg viewBox="0 0 24 24"><path d="M9 18h6m-5 3h4m3-11a5 5 0 1 0-10 0c0 2 1.1 3.2 2.2 4.2.6.6.8 1.1.8 1.8h4c0-.7.2-1.2.8-1.8C15.9 13.2 17 12 17 10Z"/></svg>'
  };

  const imageCache = new Map();
  const imagePending = new Map();
  const imageKey = item => item.wikiTitle || item.title || item.name || item.id;
  const originalFetchWiki = window.fetchWiki;

  const resolveImage = item => {
    const key = imageKey(item);
    if (imageCache.has(key)) return Promise.resolve(imageCache.get(key));
    if (imagePending.has(key)) return imagePending.get(key);
    const promise = new Promise(resolve => {
      if (typeof originalFetchWiki !== 'function') { resolve(null); return; }
      originalFetchWiki(item, meta => resolve(meta?.image || null));
    }).then(src => {
      imageCache.set(key, src || null);
      imagePending.delete(key);
      return src || null;
    }).catch(() => {
      imageCache.set(key, null);
      imagePending.delete(key);
      return null;
    });
    imagePending.set(key, promise);
    return promise;
  };

  const mountImage = (item, host, alt) => {
    if (!host) return;
    const key = imageKey(item);
    const apply = src => {
      if (!host.isConnected) return;
      host.classList.remove('v31-thumb-loading', 'v31-thumb-failed');
      if (!src) { host.classList.add('v31-thumb-failed'); return; }
      const image = new Image();
      image.alt = alt || item.title || item.name || '';
      image.decoding = 'async';
      image.loading = 'eager';
      image.referrerPolicy = 'no-referrer';
      image.onload = () => {
        if (!host.isConnected) return;
        host.replaceChildren(image);
        host.classList.remove('v31-thumb-loading', 'v31-thumb-failed');
        host.classList.add('v31-thumb-loaded');
      };
      image.onerror = () => host.classList.add('v31-thumb-failed');
      image.src = src;
    };

    const cached = imageCache.get(key);
    if (cached) { apply(cached); return; }
    host.replaceChildren();
    const fallback = document.createElement('span');
    fallback.textContent = (item.title || item.name || '?').trim().slice(0, 1);
    host.appendChild(fallback);
    host.classList.add('v31-thumb-loading');
    resolveImage(item).then(apply);
  };

  const prefetchEvents = () => {
    const queue = [...DATA.events].sort((a, b) => b.importance - a.importance || a.start - b.start);
    let index = 0;
    const worker = () => {
      const item = queue[index++];
      if (!item) return;
      resolveImage(item).finally(() => setTimeout(worker, 20));
    };
    for (let workerIndex = 0; workerIndex < 5; workerIndex += 1) worker();
  };

  const isVisible = event => {
    if (event.end < viewStart || event.start > viewEnd || !active.has('events')) return false;
    if (searchTerm && !`${event.title} ${event.display || ''} ${event.summary || ''}`.toLowerCase().includes(searchTerm)) return false;
    const scope = eventScope(event);
    const categories = event.categories || [];
    if (scope === 'czech') return active.has('czech');
    if (scope === 'tech') return active.has('tech');
    if (categories.includes('war')) return active.has('wars') || active.has('war') || active.has('world');
    return active.has('world') || active.has('politics') || active.has('culture');
  };

  const addLaneLabel = (host, top, text, icon, color) => {
    const label = document.createElement('div');
    label.className = 'v29-lane-label';
    label.style.cssText = `top:${top}px;--lane:${color}`;
    label.innerHTML = icon + `<span>${text}</span>`;
    host.appendChild(label);
  };

  const overlaps = (first, second, gap = 6) => !(first.right + gap <= second.left || second.right + gap <= first.left);

  renderHistory = function renderHistoryV31(width) {
    const host = document.getElementById('eventLayer');
    host.innerHTML = '';
    const height = host.clientHeight;
    const list = DATA.events.filter(isVisible).sort((a, b) => a.start - b.start || b.importance - a.importance);
    const empty = document.getElementById('empty');
    empty.style.display = list.length ? 'none' : 'grid';
    if (!list.length) return;

    const third = height / 3;
    const currentSpan = span();
    const overview = currentSpan > 360;
    const medium = currentSpan > 150;
    const configs = {
      czech: { top: 0, height: third, color: '#1aa1e8', label: 'České dějiny', icon: iconMap.czech },
      world: { top: third, height: third, color: '#f04444', label: 'Svět & války', icon: iconMap.world },
      tech: { top: third * 2, height: third, color: '#ff9800', label: 'Vynálezy', icon: iconMap.tech }
    };
    Object.values(configs).forEach(config => { config.axis = config.top + config.height / 2; });

    for (const config of Object.values(configs)) {
      const lane = document.createElement('div');
      lane.className = 'v29-lane';
      lane.style.cssText = `top:${config.top}px;height:${config.height}px;--lane:${config.color}`;
      const axis = document.createElement('i');
      axis.className = 'v29-axis';
      axis.style.top = `${config.axis - config.top}px`;
      lane.appendChild(axis);
      host.appendChild(lane);
      addLaneLabel(host, config.top + 5, config.label, config.icon, config.color);
    }

    for (const [scope, config] of Object.entries(configs)) {
      const scopeEvents = list.filter(event => eventScope(event) === scope);
      const pinRows = [config.axis, config.axis - 27, config.axis + 27];
      const rowEnds = [-Infinity, -Infinity, -Infinity];
      const pins = document.createDocumentFragment();

      for (const event of scopeEvents) {
        const x = xFor((event.start + event.end) / 2, width);
        const pinSize = event.importance >= 5 ? 29 : 24;
        let row = rowEnds.findIndex(end => x - end >= pinSize + 4);
        if (row < 0) row = rowEnds.indexOf(Math.min(...rowEnds));
        rowEnds[row] = x;
        const pin = document.createElement('a');
        pin.className = `v31-event-pin${event.importance >= 5 ? ' is-major' : ''}`;
        pin.href = event.wiki;
        pin.target = '_blank';
        pin.rel = 'noopener noreferrer';
        pin.dataset.kind = 'event';
        pin.dataset.id = event.id;
        pin.style.cssText = `left:${x}px;top:${pinRows[row]}px;--event:${config.color}`;
        mountImage(event, pin, event.title);
        pin.onmouseenter = mouseEvent => showTip(mouseEvent, event, event.display, event.summary);
        pin.onmousemove = moveTip;
        pin.onmouseleave = hideTip;
        pins.appendChild(pin);
      }
      host.appendChild(pins);

      const labelThreshold = overview ? 4 : medium ? 3 : 1;
      const candidates = scopeEvents
        .filter(event => event.importance >= labelThreshold)
        .sort((a, b) => b.importance - a.importance || a.start - b.start)
        .sort((a, b) => a.start - b.start);
      const rowTop = [config.top + 4, config.axis + 34];
      const occupied = [[], []];
      const cards = document.createDocumentFragment();

      for (const event of candidates) {
        const yearX = xFor((event.start + event.end) / 2, width);
        const cardWidth = Math.min(overview ? 170 : 222, Math.max(overview ? 118 : 126, 76 + event.title.length * (overview ? 3.8 : 4.5)));
        const left = clamp(yearX - cardWidth / 2, 112, width - cardWidth - 16);
        const interval = { left, right: left + cardWidth };
        let row = -1;
        for (let rowIndex = 0; rowIndex < occupied.length; rowIndex += 1) {
          if (!occupied[rowIndex].some(other => overlaps(interval, other, overview ? 4 : 7))) { row = rowIndex; break; }
        }
        if (row < 0) continue;
        const top = rowTop[row];
        const cardHeight = overview ? 37 : 39;
        if (top + cardHeight > config.top + config.height - 3) continue;
        occupied[row].push(interval);

        const card = document.createElement('a');
        card.className = 'v31-event-card';
        card.href = event.wiki;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.dataset.kind = 'event';
        card.dataset.id = event.id;
        card.style.cssText = `left:${left}px;top:${top}px;width:${cardWidth}px;--event:${config.color}`;
        card.innerHTML = '<span class="event-image"></span><span class="event-text"><b></b><time></time></span>';
        card.querySelector('b').textContent = event.title;
        card.querySelector('time').textContent = event.display;
        mountImage(event, card.querySelector('.event-image'), event.title);
        card.onmouseenter = mouseEvent => showTip(mouseEvent, event, event.display, event.summary);
        card.onmousemove = moveTip;
        card.onmouseleave = hideTip;
        cards.appendChild(card);

        const stem = document.createElement('i');
        stem.className = 'v31-event-stem';
        stem.style.setProperty('--event', config.color);
        stem.style.left = `${yearX}px`;
        if (row === 0) {
          stem.style.top = `${top + cardHeight}px`;
          stem.style.height = `${Math.max(1, config.axis - top - cardHeight - 15)}px`;
        } else {
          stem.style.top = `${config.axis + 15}px`;
          stem.style.height = `${Math.max(1, top - config.axis - 15)}px`;
        }
        cards.appendChild(stem);
      }
      host.appendChild(cards);
    }
  };

  prefetchEvents();
  requestAnimationFrame(() => render());
})();
