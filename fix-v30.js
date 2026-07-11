(() => {
  'use strict';

  const START = 1500;
  const END = Math.max(2026, typeof ALL_END === 'number' ? ALL_END : 2026);
  const MIN_SPAN = 12;
  const MAX_SPAN = END - START;
  const timeline = document.getElementById('timeline');
  const shell = document.querySelector('.timeline-shell');

  const icons = {
    person: '<svg viewBox="0 0 24 24"><path d="M4 20c0-3.3 3.1-5.5 8-5.5s8 2.2 8 5.5M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/></svg>',
    book: '<svg viewBox="0 0 24 24"><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v17H7.5A3.5 3.5 0 0 0 4 22V5.5Zm16 0A3.5 3.5 0 0 0 16.5 2H13v17h3.5A3.5 3.5 0 0 1 20 22V5.5Z"/></svg>',
    czech: '<svg viewBox="0 0 24 24"><path d="M3 9h18M5 9v9m4-9v9m6-9v9m4-9v9M3 20h18M12 3l9 5H3l9-5Z"/></svg>',
    world: '<svg viewBox="0 0 24 24"><path d="M12 22s7-3.5 7-10V5l-7-3-7 3v7c0 6.5 7 10 7 10Z"/></svg>',
    tech: '<svg viewBox="0 0 24 24"><path d="M9 18h6m-5 3h4m3-11a5 5 0 1 0-10 0c0 2 1.1 3.2 2.2 4.2.6.6.8 1.1.8 1.8h4c0-.7.2-1.2.8-1.8C15.9 13.2 17 12 17 10Z"/></svg>'
  };

  const essential = [
    ['Pražská defenestrace a stavovské povstání', 1618, 'czech', ['czech-history', 'war'], 5, 'Pražská defenestrace (1618)'],
    ['Bitva na Bílé hoře', 1620, 'czech', ['czech-history', 'war'], 5, 'Bitva na Bílé hoře'],
    ['Toleranční patent a zrušení nevolnictví', 1781, 'czech', ['czech-history', 'politics'], 5, 'Toleranční patent'],
    ['Francouzská revoluce', 1789, 'world', ['world-history', 'politics'], 5, 'Velká francouzská revoluce'],
    ['Vídeňský kongres', 1815, 'world', ['world-history', 'politics'], 4, 'Vídeňský kongres'],
    ['Revoluční rok 1848', 1848, 'czech', ['czech-history', 'politics'], 5, 'Revoluce v Rakouském císařství 1848–1849'],
    ['Začátek první světové války', 1914, 'world', ['world-history', 'war'], 5, 'První světová válka'],
    ['Vznik Československa', 1918, 'czech', ['czech-history', 'politics'], 5, 'Vznik Československa'],
    ['Mnichovská dohoda', 1938, 'czech', ['czech-history', 'war'], 5, 'Mnichovská dohoda'],
    ['Začátek druhé světové války', 1939, 'world', ['world-history', 'war'], 5, 'Druhá světová válka'],
    ['Komunistický převrat v Československu', 1948, 'czech', ['czech-history', 'politics'], 5, 'Únor 1948'],
    ['Pražské jaro a invaze vojsk Varšavské smlouvy', 1968, 'czech', ['czech-history', 'war', 'politics'], 5, 'Invaze vojsk Varšavské smlouvy do Československa'],
    ['Sametová revoluce', 1989, 'czech', ['czech-history', 'politics'], 5, 'Sametová revoluce'],
    ['Pád Berlínské zdi', 1989, 'world', ['world-history', 'politics'], 5, 'Pád Berlínské zdi'],
    ['Vznik České republiky', 1993, 'czech', ['czech-history', 'politics'], 5, 'Vznik České republiky'],
    ['Vstup České republiky do Evropské unie', 2004, 'czech', ['czech-history', 'politics'], 4, 'Vstup Česka do Evropské unie'],
    ['Pandemie covidu-19', 2020, 'world', ['world-history', 'science'], 5, 'Pandemie covidu-19'],
    ['Ruská invaze na Ukrajinu', 2022, 'world', ['world-history', 'war', 'politics'], 5, 'Ruská invaze na Ukrajinu']
  ];

  const normalize = value => String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  essential.forEach(([title, year, scope, categories, importance, wikiTitle], index) => {
    const exists = DATA.events.some(event => Math.abs(event.start - year) <= 1 && (normalize(event.title).includes(normalize(title).slice(0, 12)) || normalize(title).includes(normalize(event.title).slice(0, 12))));
    if (!exists) {
      DATA.events.push({
        id: `v30-${index}`,
        title,
        start: year,
        end: year,
        display: String(year),
        scope,
        categories,
        importance,
        summary: 'Významná událost českých nebo světových dějin.',
        wikiTitle,
        wiki: `https://cs.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(wikiTitle)}`,
        image: null
      });
    }
  });

  let renderGeneration = 0;
  let thumbCounter = 0;
  let relationTimer = null;

  const scheduleThumb = (item, host, alt, generation) => {
    const delay = 120 + Math.min(340, thumbCounter++ * 10);
    setTimeout(() => {
      if (generation === renderGeneration && host && host.isConnected) wikiImage(item, host, alt);
    }, delay);
  };

  const addLabel = (host, top, text, icon, color, className = 'v29-section-label') => {
    const element = document.createElement('div');
    element.className = className;
    element.style.cssText = `top:${top}px;--lane:${color}`;
    element.innerHTML = icon + `<span>${text}</span>`;
    host.appendChild(element);
  };

  const overlaps = (a, b, gap = 7) => !(a.right + gap <= b.left || b.right + gap <= a.left);
  const pack = (items, rowCount, gap = 7) => {
    const rows = Array.from({ length: Math.max(1, rowCount) }, () => []);
    for (const item of items) {
      let row = rows.findIndex(list => list.every(other => !overlaps(item, other, gap)));
      if (row < 0) row = rows.reduce((best, list, index) => list.length < rows[best].length ? index : best, 0);
      item.row = row;
      rows[row].push(item);
    }
    return items;
  };

  const clearRelations = (authorHost, workHost) => {
    authorHost.querySelectorAll('.v29-author-card').forEach(card => card.classList.remove('is-selected', 'is-dimmed'));
    workHost.querySelectorAll('.v29-work-card').forEach(card => card.classList.remove('is-related', 'is-dimmed'));
    workHost.querySelector('.v29-connectors')?.remove();
  };

  const showRelations = (authorId, authorHost, workHost) => {
    clearTimeout(relationTimer);
    clearRelations(authorHost, workHost);
    const source = authorHost.querySelector(`.v29-author-card[data-author-id="${CSS.escape(authorId)}"]`);
    const targets = [...workHost.querySelectorAll(`.v29-work-card[data-author-id="${CSS.escape(authorId)}"]`)];
    if (!source) return;

    authorHost.querySelectorAll('.v29-author-card').forEach(card => card.classList.toggle('is-dimmed', card !== source));
    source.classList.add('is-selected');
    workHost.querySelectorAll('.v29-work-card').forEach(card => {
      const related = card.dataset.authorId === authorId;
      card.classList.toggle('is-related', related);
      card.classList.toggle('is-dimmed', !related);
    });

    if (!targets.length) return;
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.classList.add('v29-connectors');
    const sourceX = source.offsetLeft + source.offsetWidth / 2;
    const sourceY = source.offsetTop + source.offsetHeight;
    for (const target of targets) {
      const targetX = target.offsetLeft + target.offsetWidth / 2;
      const targetY = target.offsetTop;
      const bend = sourceY + (targetY - sourceY) * 0.52;
      const path = document.createElementNS(ns, 'path');
      path.setAttribute('d', `M ${sourceX} ${sourceY} C ${sourceX} ${bend}, ${targetX} ${bend}, ${targetX} ${targetY}`);
      svg.appendChild(path);
      const dot = document.createElementNS(ns, 'circle');
      dot.setAttribute('cx', targetX);
      dot.setAttribute('cy', targetY);
      dot.setAttribute('r', '2.4');
      svg.appendChild(dot);
    }
    workHost.prepend(svg);
  };

  const scheduleClearRelations = (authorHost, workHost) => {
    clearTimeout(relationTimer);
    relationTimer = setTimeout(() => clearRelations(authorHost, workHost), 140);
  };

  renderLiterature = function renderLiteratureV30(width) {
    const generation = renderGeneration;
    thumbCounter = 0;
    const authorHost = document.getElementById('authorLayer');
    const workHost = document.getElementById('workLayer');
    const literature = document.getElementById('literature');
    authorHost.innerHTML = '';
    workHost.innerHTML = '';

    const height = literature.clientHeight;
    const currentSpan = span();
    const overview = currentSpan > 360;
    const authorsTop = 46;
    const worksTop = Math.round(height * (overview ? 0.66 : 0.62));
    const authorsHeight = Math.max(120, worksTop - authorsTop - 10);
    const worksHeight = Math.max(88, height - worksTop - 6);

    addLabel(authorHost, 10, 'Autoři', icons.person, '#6d55f7');
    addLabel(workHost, worksTop + 4, 'Díla', icons.book, '#6d55f7');

    const people = DATA.people
      .filter(person => (person.group || 'maturity') === 'maturity' && person.end >= viewStart && person.start <= viewEnd && active.has('authors'))
      .filter(person => !searchTerm || `${person.name} ${(person.keywords || []).join(' ')}`.toLowerCase().includes(searchTerm))
      .sort((a, b) => a.start - b.start || a.end - b.end);

    const authorItems = people.map(person => {
      const lifeLeft = xFor(Math.max(person.start, viewStart), width);
      const lifeRight = xFor(Math.min(person.end, viewEnd), width);
      const nameWidth = Math.min(overview ? 205 : 280, Math.max(148, 72 + person.name.length * 5.7));
      const cardWidth = overview ? nameWidth : Math.min(310, Math.max(nameWidth, lifeRight - lifeLeft));
      const left = clamp(lifeLeft, 44, width - cardWidth - 18);
      return { person, left, right: left + cardWidth, width: cardWidth };
    });

    const authorRows = Math.max(5, Math.min(7, Math.floor(authorsHeight / (overview ? 30 : 34))));
    pack(authorItems, authorRows, 6);
    const authorGap = Math.max(29, authorsHeight / authorRows);
    const authorFragment = document.createDocumentFragment();

    for (const item of authorItems) {
      const person = item.person;
      const top = authorsTop + item.row * authorGap;
      const card = document.createElement('a');
      card.className = 'v29-author-card';
      card.href = person.wiki;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
      card.dataset.kind = 'person';
      card.dataset.id = person.id;
      card.dataset.authorId = person.id;
      card.style.cssText = `left:${item.left}px;top:${top}px;width:${item.width}px`;
      card.innerHTML = `<span class="avatar"></span><b>${person.name}</b><small>${person.start}–${person.end}</small>`;
      scheduleThumb(person, card.querySelector('.avatar'), person.name, generation);
      const works = DATA.works.filter(work => work.authorId === person.id).map(work => work.title).join(' · ');
      const keywords = (person.keywords || []).join(' · ');
      card.onmouseenter = event => {
        showTip(event, person, `${person.start}–${person.end}`, [keywords, works && `Díla: ${works}`].filter(Boolean).join('\n'));
        showRelations(person.id, authorHost, workHost);
      };
      card.onmousemove = moveTip;
      card.onmouseleave = () => {
        hideTip();
        scheduleClearRelations(authorHost, workHost);
      };
      authorFragment.appendChild(card);
    }
    authorHost.appendChild(authorFragment);

    const authorMap = new Map(DATA.people.map(person => [person.id, person]));
    const works = DATA.works
      .filter(work => active.has('works') && work.year >= viewStart && work.year <= viewEnd && (authorMap.get(work.authorId)?.group || 'maturity') === 'maturity')
      .filter(work => !searchTerm || `${work.title} ${work.year} ${authorMap.get(work.authorId)?.name || ''}`.toLowerCase().includes(searchTerm))
      .sort((a, b) => a.year - b.year || a.title.localeCompare(b.title));

    const workItems = works.map(work => {
      const cardWidth = Math.min(overview ? 176 : 240, Math.max(94, 66 + work.title.length * 5.4));
      const yearX = xFor(work.year, width);
      const left = clamp(yearX - cardWidth / 2, 44, width - cardWidth - 18);
      return { work, left, right: left + cardWidth, width: cardWidth };
    });

    const workRows = Math.max(2, Math.min(4, Math.floor((worksHeight - 37) / 35)));
    pack(workItems, workRows, 7);
    const workBase = worksTop + 39;
    const workGap = Math.max(34, (worksHeight - 39) / Math.max(1, workRows));
    const workFragment = document.createDocumentFragment();

    for (const item of workItems) {
      const work = item.work;
      const top = workBase + item.row * workGap;
      const card = document.createElement('a');
      card.className = 'v29-work-card';
      card.href = work.wiki;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
      card.dataset.kind = 'work';
      card.dataset.id = work.id;
      card.dataset.authorId = work.authorId;
      card.style.cssText = `left:${item.left}px;top:${top}px;width:${item.width}px`;
      card.innerHTML = `<span class="work-thumb"></span><b>${work.title}</b><time>${work.year}</time>`;
      scheduleThumb(work, card.querySelector('.work-thumb'), work.title, generation);
      const author = authorMap.get(work.authorId);
      card.onmouseenter = event => {
        showTip(event, work, String(work.year), `${author?.name || ''}${(work.keywords || []).length ? ' · ' + work.keywords.join(' · ') : ''}`);
        showRelations(work.authorId, authorHost, workHost);
      };
      card.onmousemove = moveTip;
      card.onmouseleave = () => {
        hideTip();
        scheduleClearRelations(authorHost, workHost);
      };
      workFragment.appendChild(card);
    }
    workHost.appendChild(workFragment);
  };

  const eventVisible = event => {
    if (event.end < viewStart || event.start > viewEnd || !active.has('events')) return false;
    if (searchTerm && !`${event.title} ${event.display || ''} ${event.summary || ''}`.toLowerCase().includes(searchTerm)) return false;
    const scope = eventScope(event);
    const categories = event.categories || [];
    if (scope === 'czech') return active.has('czech');
    if (scope === 'tech') return active.has('tech');
    if (categories.includes('war')) return active.has('wars') || active.has('war') || active.has('world');
    return active.has('world') || active.has('politics') || active.has('culture');
  };

  renderHistory = function renderHistoryV30(width) {
    const generation = renderGeneration;
    thumbCounter = 0;
    const host = document.getElementById('eventLayer');
    host.innerHTML = '';
    const height = host.clientHeight;
    const list = DATA.events.filter(eventVisible);
    const empty = document.getElementById('empty');
    empty.style.display = list.length ? 'none' : 'grid';
    if (!list.length) return;

    const currentSpan = span();
    const overview = currentSpan > 360;
    const medium = currentSpan > 150;
    const third = height / 3;
    const configs = {
      czech: { top: 0, height: third, color: '#1aa1e8', label: 'České dějiny', icon: icons.czech },
      world: { top: third, height: third, color: '#f04444', label: 'Svět & války', icon: icons.world },
      tech: { top: third * 2, height: third, color: '#ff9800', label: 'Vynálezy', icon: icons.tech }
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
      addLabel(host, config.top + 5, config.label, config.icon, config.color, 'v29-lane-label');
    }

    const dotThreshold = overview ? 5 : medium ? 3 : 1;
    const dotFragment = document.createDocumentFragment();
    list.filter(event => event.importance >= dotThreshold).forEach(event => {
      const config = configs[eventScope(event)];
      if (!config) return;
      const x = xFor((event.start + event.end) / 2, width);
      const dot = document.createElement('a');
      const size = event.importance >= 5 ? 10 : event.importance === 4 ? 8 : 6;
      dot.className = 'event-dot v29-event-dot';
      dot.href = event.wiki;
      dot.target = '_blank';
      dot.rel = 'noopener noreferrer';
      dot.dataset.kind = 'event';
      dot.dataset.id = event.id;
      dot.style.cssText = `left:${x}px;top:${config.axis}px;width:${size}px;height:${size}px;--event:${config.color}`;
      dot.onmouseenter = mouseEvent => showTip(mouseEvent, event, event.display, event.summary);
      dot.onmousemove = moveTip;
      dot.onmouseleave = hideTip;
      dotFragment.appendChild(dot);
    });
    host.appendChild(dotFragment);

    const threshold = overview ? 5 : medium ? 4 : 2;
    const maxPerScope = overview ? 10 : medium ? 18 : 30;

    for (const [scope, config] of Object.entries(configs)) {
      const candidates = list
        .filter(event => eventScope(event) === scope && event.importance >= threshold)
        .sort((a, b) => b.importance - a.importance || a.start - b.start)
        .slice(0, maxPerScope)
        .sort((a, b) => a.start - b.start);

      const rowTop = [config.top + 5, config.axis + 7];
      const occupied = [[], []];
      const fragment = document.createDocumentFragment();

      for (const event of candidates) {
        const yearX = xFor((event.start + event.end) / 2, width);
        const cardWidth = Math.min(overview ? 184 : 220, Math.max(overview ? 128 : 118, 78 + event.title.length * (overview ? 4.2 : 4.6)));
        const left = clamp(yearX - cardWidth / 2, 112, width - cardWidth - 18);
        const interval = { left, right: left + cardWidth };
        let row = -1;
        for (let index = 0; index < 2; index += 1) {
          if (!occupied[index].some(other => overlaps(interval, other, 6))) { row = index; break; }
        }
        if (row < 0) continue;
        const cardHeight = overview ? 43 : 38;
        const top = rowTop[row];
        if (top + cardHeight > config.top + config.height - 3) continue;
        occupied[row].push(interval);

        const card = document.createElement('a');
        card.className = `v29-event-card${overview ? ' is-overview' : ''}`;
        card.href = event.wiki;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.dataset.kind = 'event';
        card.dataset.id = event.id;
        card.style.cssText = `left:${left}px;top:${top}px;width:${cardWidth}px;--event:${config.color}`;
        card.innerHTML = `<span class="event-image"></span><span class="event-text"><b>${event.title}</b><time>${event.display}</time></span>`;
        scheduleThumb(event, card.querySelector('.event-image'), event.title, generation);
        card.onmouseenter = mouseEvent => showTip(mouseEvent, event, event.display, event.summary);
        card.onmousemove = moveTip;
        card.onmouseleave = hideTip;
        fragment.appendChild(card);

        const stem = document.createElement('i');
        stem.className = 'v29-event-stem';
        stem.style.setProperty('--event', config.color);
        stem.style.left = `${yearX}px`;
        if (row === 0) {
          stem.style.top = `${top + cardHeight}px`;
          stem.style.height = `${Math.max(1, config.axis - top - cardHeight)}px`;
        } else {
          stem.style.top = `${config.axis}px`;
          stem.style.height = `${Math.max(1, top - config.axis)}px`;
        }
        fragment.appendChild(stem);
      }
      host.appendChild(fragment);
    }
  };

  const panel = document.createElement('div');
  panel.className = 'v29-zoom-panel';
  panel.innerHTML = '<button type="button" data-z="out" aria-label="Oddálit">−</button><input type="range" min="0" max="100" step="1" aria-label="Přiblížení časové osy"><button type="button" data-z="in" aria-label="Přiblížit">+</button><span class="v29-zoom-label"></span>';
  const help = document.createElement('div');
  help.className = 'v29-zoom-help';
  help.textContent = 'Kolečko / trackpad = přiblížení · tažením posuneš osu';
  timeline.append(panel, help);

  const slider = panel.querySelector('input');
  const zoomLabel = panel.querySelector('.v29-zoom-label');
  const spanToSlider = current => Math.round(100 * Math.log(MAX_SPAN / Math.max(MIN_SPAN, Math.min(MAX_SPAN, current))) / Math.log(MAX_SPAN / MIN_SPAN));
  const sliderToSpan = value => MAX_SPAN * Math.pow(MIN_SPAN / MAX_SPAN, Number(value) / 100);

  const updateZoomUI = () => {
    const current = span();
    slider.value = String(spanToSlider(current));
    zoomLabel.textContent = current < 25 ? `${current.toFixed(1)} roku` : `${Math.round(current)} let`;
    shell.classList.toggle('zoom-overview', current > 360);
    shell.classList.toggle('zoom-medium', current <= 360 && current > 150);
    shell.classList.toggle('zoom-detail', current <= 150);
  };

  let pendingRange = null;
  let rangeTimer = null;
  const commitRange = () => {
    rangeTimer = null;
    if (!pendingRange) return;
    viewStart = pendingRange.start;
    viewEnd = pendingRange.end;
    pendingRange = null;
    render();
  };

  const scheduleRange = (start, end) => {
    let nextSpan = Math.max(MIN_SPAN, Math.min(MAX_SPAN, end - start));
    let center = (start + end) / 2;
    start = center - nextSpan / 2;
    end = center + nextSpan / 2;
    if (start < START) { end += START - start; start = START; }
    if (end > END) { start -= end - END; end = END; }
    pendingRange = { start, end };
    if (!rangeTimer) rangeTimer = setTimeout(commitRange, 32);
  };

  const zoomAt = (factor, ratio = 0.5) => {
    const current = span();
    const next = Math.max(MIN_SPAN, Math.min(MAX_SPAN, current * factor));
    const anchor = viewStart + current * ratio;
    const start = anchor - next * ratio;
    scheduleRange(start, start + next);
  };

  slider.addEventListener('input', () => {
    const center = (viewStart + viewEnd) / 2;
    const next = sliderToSpan(slider.value);
    scheduleRange(center - next / 2, center + next / 2);
  });
  panel.querySelector('[data-z="in"]').onclick = () => zoomAt(0.68, 0.5);
  panel.querySelector('[data-z="out"]').onclick = () => zoomAt(1.47, 0.5);
  document.getElementById('zoomIn').onclick = () => zoomAt(0.68, 0.5);
  document.getElementById('zoomOut').onclick = () => zoomAt(1.47, 0.5);
  document.getElementById('fit').onclick = () => scheduleRange(START, END);

  timeline.addEventListener('wheel', event => {
    if (event.target.closest('input,button,.timeline-scrollbar,.info-panel,.range-popover')) return;
    event.preventDefault();
    const rect = timeline.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    if (event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) * 0.7) {
      const delta = (event.deltaX + (event.shiftKey ? event.deltaY : 0)) / Math.max(1, rect.width) * span();
      scheduleRange(viewStart + delta, viewEnd + delta);
    } else {
      zoomAt(Math.exp(event.deltaY * 0.00135), ratio);
    }
  }, { passive: false });

  timeline.addEventListener('dblclick', event => {
    if (event.target.closest('a,button,input')) return;
    const rect = timeline.getBoundingClientRect();
    zoomAt(0.48, (event.clientX - rect.left) / rect.width);
  });

  let drag = null;
  timeline.addEventListener('pointerdown', event => {
    if (event.button !== 0 || event.target.closest('a,button,input,.timeline-scrollbar,.info-panel,.range-popover')) return;
    drag = { x: event.clientX, start: viewStart, end: viewEnd };
    timeline.setPointerCapture(event.pointerId);
    shell.classList.add('v29-panning');
  });
  timeline.addEventListener('pointermove', event => {
    if (!drag) return;
    const years = -(event.clientX - drag.x) / Math.max(1, timeline.clientWidth) * (drag.end - drag.start);
    scheduleRange(drag.start + years, drag.end + years);
  });
  const endDrag = event => {
    if (!drag) return;
    drag = null;
    shell.classList.remove('v29-panning');
    try { timeline.releasePointerCapture(event.pointerId); } catch (_) { }
  };
  timeline.addEventListener('pointerup', endDrag);
  timeline.addEventListener('pointercancel', endDrag);

  const previousRender = render;
  render = function renderV30() {
    renderGeneration += 1;
    previousRender();
    requestAnimationFrame(updateZoomUI);
  };

  requestAnimationFrame(() => {
    viewStart = START;
    viewEnd = END;
    render();
    updateZoomUI();
  });
})();
