(() => {
  'use strict';

  const CURRENT = Math.max(2026, typeof ALL_END === 'number' ? ALL_END : 2026);
  const normalize = value => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  const crownIcon = '<svg viewBox="0 0 24 24"><path d="m3 7 4 4 5-7 5 7 4-4-2 11H5L3 7Zm3 14h12"/></svg>';
  const laneIcons = {
    ruler: crownIcon,
    czech: '<svg viewBox="0 0 24 24"><path d="M3 9h18M5 9v9m4-9v9m6-9v9m4-9v9M3 20h18M12 3l9 5H3l9-5Z"/></svg>',
    world: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 4.5 6 4.5 9S15 18 12 21M12 3c-3 3-4.5 6-4.5 9S9 18 12 21"/></svg>',
    tech: '<svg viewBox="0 0 24 24"><path d="M9 18h6m-5 3h4m3-11a5 5 0 1 0-10 0c0 2 1.1 3.2 2.2 4.2.6.6.8 1.1.8 1.8h4c0-.7.2-1.2.8-1.8C15.9 13.2 17 12 17 10Z"/></svg>'
  };

  const leaderRows = [
    ['Karel IV.',1346,1378,'Země Koruny české','český král a římský císař',5,'Karel IV.'],
    ['Václav IV.',1378,1419,'České království','český král',4,'Václav IV.'],
    ['Zikmund Lucemburský',1419,1437,'České království','český král a římský císař',5,'Zikmund Lucemburský'],
    ['Albrecht II. Habsburský',1437,1439,'České království','český král',3,'Albrecht II. Habsburský'],
    ['Fridrich III. Habsburský',1440,1452,'střední Evropa','římský král a poručník Ladislava Pohrobka',4,'Fridrich III. Habsburský',true],
    ['Jiří z Poděbrad',1452,1471,'České země','zemský správce, poté český král',5,'Jiří z Poděbrad'],
    ['Ladislav Pohrobek',1453,1457,'České království','český král',3,'Ladislav Pohrobek'],
    ['Matyáš Korvín',1469,1490,'Morava, Slezsko a Lužice','protikrál a uherský král',4,'Matyáš Korvín'],
    ['Vladislav II. Jagellonský',1471,1516,'České království','český a uherský král',4,'Vladislav Jagellonský'],
    ['Ludvík Jagellonský',1516,1526,'České království','český a uherský král',3,'Ludvík Jagellonský'],
    ['Ferdinand I. Habsburský',1526,1564,'České země','český král',4,'Ferdinand I. Habsburský'],
    ['Maxmilián II.',1564,1576,'České země','český král a římský císař',3,'Maxmilián II. Habsburský'],
    ['Rudolf II.',1576,1611,'České země','český král a římský císař',5,'Rudolf II.'],
    ['Matyáš Habsburský',1611,1619,'České země','český král a římský císař',3,'Matyáš Habsburský'],
    ['Ferdinand II.',1617,1637,'České země','český král a římský císař',4,'Ferdinand II. Štýrský'],
    ['Fridrich Falcký',1619,1620,'České království','zvolený český král',4,'Fridrich Falcký'],
    ['Ferdinand III.',1637,1657,'České země','český král a římský císař',3,'Ferdinand III. Habsburský'],
    ['Ferdinand IV.',1646,1654,'České země','korunovaný spolukrál',2,'Ferdinand IV. Habsburský'],
    ['Leopold I.',1657,1705,'České země','český král a římský císař',4,'Leopold I.'],
    ['Josef I.',1705,1711,'České země','český král a římský císař',3,'Josef I. Habsburský'],
    ['Karel VI.',1711,1740,'České země','český král a římský císař',4,'Karel VI.'],
    ['Marie Terezie',1740,1780,'České země','česká a uherská královna',5,'Marie Terezie'],
    ['Karel Albrecht',1741,1743,'České země','protikrál během války o rakouské dědictví',3,'Karel VII. Bavorský'],
    ['Josef II.',1780,1790,'České země','český král a reformátor',5,'Josef II.'],
    ['Leopold II.',1790,1792,'České země','český král a římský císař',3,'Leopold II.'],
    ['František I.',1792,1835,'České země','český král a rakouský císař',4,'František I. Rakouský'],
    ['Ferdinand V.',1835,1848,'České země','český král a rakouský císař',3,'Ferdinand I. Dobrotivý'],
    ['František Josef I.',1848,1916,'Rakousko-Uhersko','rakouský císař a český král',5,'František Josef I.'],
    ['Karel I.',1916,1918,'Rakousko-Uhersko','rakouský císař a český král',4,'Karel I. Rakouský'],
    ['Tomáš Garrigue Masaryk',1918,1935,'Československo','prezident republiky',5,'Tomáš Garrigue Masaryk'],
    ['Edvard Beneš',1935,1938,'Československo','prezident republiky',5,'Edvard Beneš'],
    ['Emil Hácha',1938,1945,'Česko-Slovensko a Protektorát','prezident a státní prezident',4,'Emil Hácha'],
    ['Edvard Beneš',1940,1948,'exil a Československo','prezident v exilu, poté prezident republiky',5,'Edvard Beneš'],
    ['Klement Gottwald',1948,1953,'Československo','prezident republiky',5,'Klement Gottwald'],
    ['Antonín Zápotocký',1953,1957,'Československo','prezident republiky',3,'Antonín Zápotocký'],
    ['Antonín Novotný',1957,1968,'Československo','prezident republiky',4,'Antonín Novotný'],
    ['Ludvík Svoboda',1968,1975,'Československo','prezident republiky',4,'Ludvík Svoboda'],
    ['Gustáv Husák',1975,1989,'Československo','prezident republiky',5,'Gustáv Husák'],
    ['Václav Havel',1989,1992,'Československo','prezident republiky',5,'Václav Havel'],
    ['Jan Stráský',1992.55,1992.99,'ČSFR','předseda vlády vykonávající část prezidentských pravomocí',2,'Jan Stráský',true],
    ['Václav Havel',1993,2003,'Česká republika','prezident republiky',5,'Václav Havel'],
    ['Václav Klaus',2003,2013,'Česká republika','prezident republiky',4,'Václav Klaus'],
    ['Miloš Zeman',2013,2023,'Česká republika','prezident republiky',4,'Miloš Zeman'],
    ['Petr Pavel',2023,CURRENT,'Česká republika','současný prezident republiky',5,'Petr Pavel']
  ];

  const leaders = leaderRows.map(([title,start,end,region,role,importance,wikiTitle,fallback],index) => ({
    id:`cz-leader-${index}`, title, start, end, display:title === 'Petr Pavel' ? '2023–dnes' : `${Math.floor(start)}–${Math.floor(end)}`,
    scope:'ruler', categories:['ruler'], region, role, importance, wikiTitle, fallback:Boolean(fallback),
    summary:`${title}: ${role}, ${region}.`, wiki:`https://cs.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(wikiTitle)}`
  }));

  active.add('rulers');
  DATA.events = DATA.events.filter(event => !(event.categories || []).includes('ruler'));
  leaders.forEach(leader => DATA.events.push(leader));

  const style = document.createElement('style');
  style.textContent = `
    .ruler-filter{margin-top:7px!important;padding-top:8px!important;border-top:1px solid var(--line)!important;border-radius:0!important}
    .leader-card-live{position:absolute;z-index:30;height:31px;padding:3px 9px 3px 4px;border:1px solid color-mix(in srgb,var(--leader) 55%,var(--line));border-left:3px solid var(--leader);border-radius:999px;background:color-mix(in srgb,var(--leader) 10%,var(--panel));display:flex;align-items:center;gap:7px;color:var(--ink);box-shadow:0 4px 13px rgba(75,53,20,.08);overflow:hidden;transition:.14s ease}
    .leader-card-live:hover{z-index:70;transform:translateY(-1px);background:var(--panel);border-color:var(--leader);box-shadow:0 10px 24px color-mix(in srgb,var(--leader) 22%,transparent)}
    .leader-card-live.fallback{border-style:dashed;opacity:.82}
    .leader-image{width:24px;height:24px;flex:0 0 24px;border-radius:50%;overflow:hidden;background:color-mix(in srgb,var(--leader) 15%,var(--panel-soft))}
    .leader-image img,.leader-pin-live img{width:100%;height:100%;display:block;object-fit:cover}
    .leader-copy{min-width:0;display:flex;flex-direction:column;line-height:1.02}
    .leader-copy b{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:9.5px;font-weight:770}
    .leader-copy small{margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:7.4px;color:var(--muted)}
    .leader-pin-live{position:absolute;z-index:24;transform:translate(-50%,-50%);width:25px;height:25px;border:2px solid var(--panel);border-radius:50%;overflow:hidden;background:color-mix(in srgb,var(--leader) 18%,var(--panel));box-shadow:0 0 0 1px var(--leader),0 4px 11px rgba(35,28,18,.16)}
    .leader-pin-live.important{width:29px;height:29px;box-shadow:0 0 0 2px var(--leader),0 6px 15px rgba(35,28,18,.2)}
    .leader-pin-live.fallback{border-radius:8px;opacity:.78}
    html[data-theme="dark"] .leader-card-live{background:color-mix(in srgb,var(--leader) 14%,var(--panel))}
    @media(max-width:1180px){.leader-copy small{display:none}.leader-card-live{height:29px}.leader-image{width:22px;height:22px;flex-basis:22px}}
  `;
  document.head.appendChild(style);

  const filterList = document.querySelector('.filter-list');
  if (filterList) {
    filterList.querySelector('[data-id="rulers"]')?.remove();
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'filter active ruler-filter';
    row.dataset.id = 'rulers';
    row.style.setProperty('--c','#b8872f');
    row.innerHTML = `<span class="filter-icon">${crownIcon}</span><span class="filter-label">Vládci a prezidenti</span><span class="switch"><i></i></span>`;
    row.onclick = () => { active.has('rulers') ? active.delete('rulers') : active.add('rulers'); row.classList.toggle('active',active.has('rulers')); render(); };
    filterList.appendChild(row);
  }

  const aliases = new Map(Object.entries({
    'prvni prima volba prezidenta cr':'Prezidentské volby v Česku 2013',
    'ceska republika vstupuje do evropske unie':'Vstup Česka do Evropské unie',
    'vstup ceske republiky do evropske unie':'Vstup Česka do Evropské unie',
    'globalni financni krize':'Světová finanční krize 2008',
    'genove editovani crispr cas9':'CRISPR',
    'nastup modernich smartphonu':'Smartphone',
    'prvni nouzovy stav kvuli covidu 19':'Pandemie covidu-19 v Česku',
    'pandemie covidu 19':'Pandemie covidu-19',
    'teroristicke utoky 11 zari':'Teroristické útoky 11. září 2001',
    'predstaveni prvniho iphonu':'iPhone (1. generace)',
    'hana':'Hana (román)',
    'alchymista':'Alchymista (román)'
  }));
  const cacheKey = 'casovrstvy-smart-images-v2';
  let disk = {};
  try { disk = JSON.parse(localStorage.getItem(cacheKey) || '{}'); } catch (_) { disk = {}; }
  const memory = new Map(Object.entries(disk));
  const pending = new Map();
  const keyFor = item => aliases.get(normalize(item.title || item.name || item.wikiTitle)) || item.wikiTitle || item.title || item.name || item.id;

  const queryImage = async (title,lang,searchMode) => {
    try {
      const url = new URL(`https://${lang}.wikipedia.org/w/api.php`);
      const params = searchMode
        ? {action:'query',generator:'search',gsrsearch:title,gsrnamespace:'0',gsrlimit:'7',prop:'pageimages|pageprops',piprop:'thumbnail|original',pithumbsize:'900',format:'json',formatversion:'2',origin:'*'}
        : {action:'query',titles:title,redirects:'1',prop:'pageimages|pageprops',piprop:'thumbnail|original',pithumbsize:'900',format:'json',formatversion:'2',origin:'*'};
      Object.entries(params).forEach(([key,value]) => url.searchParams.set(key,value));
      const response = await fetch(url,{mode:'cors',credentials:'omit',cache:'force-cache'});
      if (!response.ok) return null;
      const pages = (await response.json()).query?.pages || [];
      const page = pages.find(item => item.thumbnail?.source || item.original?.source) || pages[0];
      return page && !page.missing ? page.thumbnail?.source || page.original?.source || null : null;
    } catch (_) { return null; }
  };

  const fallbackImage = item => {
    const isLeader = (item.categories || []).includes('ruler');
    const color = isLeader ? '#b8872f' : item.scope === 'tech' ? '#f39a18' : item.scope === 'czech' ? '#159ee5' : item.scope === 'world' ? '#ef4545' : '#6f54f6';
    const glyph = isLeader ? '♛' : item.scope === 'tech' ? '✦' : item.scope === 'czech' ? '⌂' : item.scope === 'world' ? '◎' : '▤';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><defs><linearGradient id="g"><stop stop-color="${color}"/><stop offset="1" stop-color="#252b3c"/></linearGradient></defs><rect width="120" height="120" rx="18" fill="url(#g)"/><text x="60" y="74" text-anchor="middle" font-size="48" fill="white">${glyph}</text></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };

  const resolveImage = item => {
    const key = keyFor(item);
    if (memory.has(key)) return Promise.resolve(memory.get(key));
    if (pending.has(key)) return pending.get(key);
    const promise = (async () => {
      let source = item.image || null;
      const candidates = [...new Set([key,item.wikiTitle,item.title,item.name].filter(Boolean))];
      for (const candidate of candidates) {
        for (const lang of ['cs','en']) {
          source ||= await queryImage(candidate,lang,false);
          source ||= await queryImage(candidate,lang,true);
          if (source) break;
        }
        if (source) break;
      }
      source ||= fallbackImage(item);
      memory.set(key,source); disk[key] = source;
      try { localStorage.setItem(cacheKey,JSON.stringify(disk)); } catch (_) { }
      return source;
    })().finally(() => pending.delete(key));
    pending.set(key,promise);
    return promise;
  };

  const smartImage = (item,host,alt='') => {
    if (!item || !host) return;
    const key = keyFor(item);
    if (host.dataset.smartKey === key && host.querySelector('img')) return;
    host.dataset.smartKey = key;
    host.classList.add('image-loading');
    resolveImage(item).then(source => {
      if (!host.isConnected || host.dataset.smartKey !== key) return;
      const image = new Image(); image.alt = alt; image.decoding = 'async'; image.referrerPolicy = 'no-referrer';
      image.onload = () => { if (host.isConnected) { host.replaceChildren(image); host.classList.remove('image-loading'); host.classList.add('image-loaded'); } };
      image.src = source;
    });
  };

  const findItem = host => {
    const card = host.closest('[data-kind][data-id]');
    if (!card) return null;
    if (card.dataset.kind === 'person') return DATA.people.find(item => item.id === card.dataset.id);
    if (card.dataset.kind === 'work') return DATA.works.find(item => item.id === card.dataset.id);
    if (card.dataset.kind === 'event') return DATA.events.find(item => item.id === card.dataset.id);
    return null;
  };
  const hydrate = () => document.querySelectorAll('.author-card-live .avatar,.work-card-live .work-thumb,.event-card-live .event-image,.event-pin-live,.leader-image,.leader-pin-live').forEach(host => { const item = findItem(host); if (item) smartImage(item,host,item.title || item.name || ''); });

  const overlaps = (a,b,gap=6) => !(a.right+gap <= b.left || b.right+gap <= a.left);
  const addLabel = (host,top,text,icon,color) => { const label = document.createElement('div'); label.className = 'lane-label'; label.style.cssText = `top:${top}px;--lane:${color}`; label.innerHTML = icon + `<span>${text}</span>`; host.appendChild(label); };
  const visibleEvent = event => {
    if ((event.categories || []).includes('ruler')) return false;
    if (event.end < viewStart || event.start > viewEnd || !active.has('events')) return false;
    if (searchTerm && !`${event.title} ${event.display || ''} ${event.summary || ''}`.toLowerCase().includes(searchTerm)) return false;
    const scope = eventScope(event), categories = event.categories || [];
    if (scope === 'czech') return active.has('czech');
    if (scope === 'tech') return active.has('tech');
    if (categories.includes('war')) return active.has('wars') || active.has('world');
    return active.has('world') || active.has('politics') || active.has('culture');
  };

  renderHistory = function renderHistoryWithLeaders(width) {
    const host = document.getElementById('eventLayer'); host.innerHTML = '';
    const height = host.clientHeight;
    const events = DATA.events.filter(visibleEvent).sort((a,b) => a.start-b.start || b.importance-a.importance);
    document.getElementById('empty').style.display = events.length || active.has('rulers') ? 'none' : 'grid';
    const laneCount = active.has('rulers') ? 4 : 3;
    const laneHeight = height / laneCount;
    const configs = {};
    let index = 0;
    if (active.has('rulers')) configs.ruler = {top:laneHeight*index++,height:laneHeight,color:'#b8872f',label:'Vládci a prezidenti',icon:laneIcons.ruler};
    configs.czech = {top:laneHeight*index++,height:laneHeight,color:'#159ee5',label:'České dějiny',icon:laneIcons.czech};
    configs.world = {top:laneHeight*index++,height:laneHeight,color:'#ef4545',label:'Svět & války',icon:laneIcons.world};
    configs.tech = {top:laneHeight*index,height:laneHeight,color:'#f39a18',label:'Vynálezy',icon:laneIcons.tech};

    Object.values(configs).forEach(config => {
      config.axis = config.top + config.height/2;
      const lane = document.createElement('div'); lane.className = 'history-lane'; lane.style.cssText = `top:${config.top}px;height:${config.height}px;--lane:${config.color}`;
      const axis = document.createElement('i'); axis.className = 'history-axis'; axis.style.top = `${config.axis-config.top}px`; lane.appendChild(axis); host.appendChild(lane);
      addLabel(host,config.top+4,config.label,config.icon,config.color);
    });

    if (configs.ruler) {
      const config = configs.ruler;
      const scoped = leaders.filter(leader => leader.end >= viewStart && leader.start <= viewEnd);
      const pinOffsets = [0,-20,20,-39,39];
      const pinEnds = pinOffsets.map(() => -Infinity);
      scoped.forEach(leader => {
        const point = xFor((Math.max(leader.start,viewStart)+Math.min(leader.end,viewEnd))/2,width);
        const size = leader.importance >= 5 ? 29 : 25;
        let row = pinEnds.findIndex(end => point-end >= size+4); if (row < 0) row = pinEnds.indexOf(Math.min(...pinEnds)); pinEnds[row] = point;
        const pin = document.createElement('a');
        pin.className = `leader-pin-live${leader.importance >= 5 ? ' important' : ''}${leader.fallback ? ' fallback' : ''}`;
        pin.href = leader.wiki; pin.target = '_blank'; pin.rel = 'noopener noreferrer'; pin.dataset.kind = 'event'; pin.dataset.id = leader.id;
        pin.style.cssText = `left:${point}px;top:${config.axis+pinOffsets[row]}px;--leader:${leader.fallback ? '#7f8ca5' : '#b8872f'}`;
        smartImage(leader,pin,leader.title); pin.onmouseenter = event => showTip(event,leader,leader.display,`${leader.role} · ${leader.region}`); pin.onmousemove = moveTip; pin.onmouseleave = hideTip;
        host.appendChild(pin);
      });

      const currentSpan = span();
      const threshold = currentSpan > 500 ? 5 : currentSpan > 300 ? 4 : currentSpan > 150 ? 3 : 1;
      const cards = scoped.filter(leader => leader.importance >= threshold).sort((a,b) => a.start-b.start || b.importance-a.importance);
      const tops = [config.top+29,config.top+62];
      const occupied = [[],[]];
      cards.forEach(leader => {
        const startX = xFor(Math.max(leader.start,viewStart),width), endX = xFor(Math.min(leader.end,viewEnd),width);
        const cardWidth = Math.min(245,Math.max(122,endX-startX,76+leader.title.length*5.2));
        const left = clamp(startX,112,width-cardWidth-16), interval = {left,right:left+cardWidth};
        const row = occupied.findIndex(items => items.every(other => !overlaps(interval,other,5))); if (row < 0) return;
        const top = tops[row]; if (top+31 > config.top+config.height-2) return; occupied[row].push(interval);
        const card = document.createElement('a');
        card.className = `leader-card-live${leader.fallback ? ' fallback' : ''}`; card.href = leader.wiki; card.target = '_blank'; card.rel = 'noopener noreferrer'; card.dataset.kind = 'event'; card.dataset.id = leader.id;
        card.style.cssText = `left:${left}px;top:${top}px;width:${cardWidth}px;--leader:${leader.fallback ? '#7f8ca5' : '#b8872f'}`;
        card.innerHTML = `<span class="leader-image"></span><span class="leader-copy"><b>${leader.title}</b><small>${leader.display} · ${leader.region}</small></span>`;
        smartImage(leader,card.querySelector('.leader-image'),leader.title); card.onmouseenter = event => showTip(event,leader,leader.display,`${leader.role} · ${leader.region}`); card.onmousemove = moveTip; card.onmouseleave = hideTip;
        host.appendChild(card);
      });
    }

    ['czech','world','tech'].forEach(scope => {
      const config = configs[scope], scoped = events.filter(event => eventScope(event) === scope);
      const offsets = [0,-20,20,-38,38], ends = offsets.map(() => -Infinity);
      scoped.forEach(event => {
        const point = xFor((event.start+event.end)/2,width), size = event.importance >= 5 ? 29 : 23;
        let row = ends.findIndex(end => point-end >= size+4); if (row < 0) row = ends.indexOf(Math.min(...ends)); ends[row] = point;
        const pin = document.createElement('a'); pin.className = `event-pin-live${event.importance >= 5 ? ' major' : ''}`; pin.href = event.wiki; pin.target = '_blank'; pin.rel = 'noopener noreferrer'; pin.dataset.kind = 'event'; pin.dataset.id = event.id;
        pin.style.cssText = `left:${point}px;top:${config.axis+offsets[row]}px;--event:${config.color}`; smartImage(event,pin,event.title); pin.onmouseenter = mouseEvent => showTip(mouseEvent,event,event.display,event.summary); pin.onmousemove = moveTip; pin.onmouseleave = hideTip; host.appendChild(pin);
      });
      const currentSpan = span(), threshold = currentSpan > 500 ? 5 : currentSpan > 300 ? 4 : currentSpan > 150 ? 3 : 1;
      const cards = scoped.filter(event => event.importance >= threshold).sort((a,b) => a.start-b.start);
      const tops = [config.top+3,config.axis+23], occupied = [[],[]];
      cards.forEach(event => {
        const point = xFor((event.start+event.end)/2,width), overview = currentSpan > 500;
        const cardWidth = Math.min(overview ? 170 : 225,Math.max(overview ? 116 : 126,76+event.title.length*(overview ? 3.8 : 4.5)));
        const left = clamp(point-cardWidth/2,112,width-cardWidth-16), interval = {left,right:left+cardWidth};
        const row = occupied.findIndex(items => items.every(other => !overlaps(interval,other,overview ? 4 : 7))); if (row < 0) return;
        const top = tops[row]; if (top+38 > config.top+config.height-2) return; occupied[row].push(interval);
        const card = document.createElement('a'); card.className = 'event-card-live'; card.href = event.wiki; card.target = '_blank'; card.rel = 'noopener noreferrer'; card.dataset.kind = 'event'; card.dataset.id = event.id;
        card.style.cssText = `left:${left}px;top:${top}px;width:${cardWidth}px;--event:${config.color}`; card.innerHTML = '<span class="event-image"></span><span class="event-text"><b></b><time></time></span>';
        card.querySelector('b').textContent = event.title; card.querySelector('time').textContent = event.display; smartImage(event,card.querySelector('.event-image'),event.title); card.onmouseenter = mouseEvent => showTip(mouseEvent,event,event.display,event.summary); card.onmousemove = moveTip; card.onmouseleave = hideTip; host.appendChild(card);
      });
    });
  };

  const previousRender = render;
  render = function renderWithCompleteLeaders() { previousRender(); requestAnimationFrame(hydrate); setTimeout(hydrate,700); };
  requestAnimationFrame(() => { render(); hydrate(); });
})();
