(() => {
  'use strict';

  const MATURITY_START=1500;
  const MATURITY_END=Math.max(2026,typeof ALL_END==='number'?ALL_END:2026);
  const MIN_SPAN=12;
  const MAX_SPAN=MATURITY_END-MATURITY_START;
  const icons={
    person:'<svg viewBox="0 0 24 24"><path d="M4 20c0-3.3 3.1-5.5 8-5.5s8 2.2 8 5.5M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/></svg>',
    book:'<svg viewBox="0 0 24 24"><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v17H7.5A3.5 3.5 0 0 0 4 22V5.5Zm16 0A3.5 3.5 0 0 0 16.5 2H13v17h3.5A3.5 3.5 0 0 1 20 22V5.5Z"/></svg>',
    czech:'<svg viewBox="0 0 24 24"><path d="M3 9h18M5 9v9m4-9v9m6-9v9m4-9v9M3 20h18M12 3l9 5H3l9-5Z"/></svg>',
    world:'<svg viewBox="0 0 24 24"><path d="M12 22s7-3.5 7-10V5l-7-3-7 3v7c0 6.5 7 10 7 10Z"/></svg>',
    tech:'<svg viewBox="0 0 24 24"><path d="M9 18h6m-5 3h4m3-11a5 5 0 1 0-10 0c0 2 1.1 3.2 2.2 4.2.6.6.8 1.1.8 1.8h4c0-.7.2-1.2.8-1.8C15.9 13.2 17 12 17 10Z"/></svg>'
  };

  const essentialEvents=[
    ['v29-defenestration','Pražská defenestrace a stavovské povstání',1618,'czech',['czech-history','war'],5,'Pražská defenestrace zahájila české stavovské povstání a stala se jedním z počátků třicetileté války.','Pražská defenestrace (1618)'],
    ['v29-white-mountain','Bitva na Bílé hoře',1620,'czech',['czech-history','war'],5,'Porážka českých stavů zásadně ovlivnila další politický, náboženský a kulturní vývoj českých zemí.','Bitva na Bílé hoře'],
    ['v29-toleration','Toleranční patent a zrušení nevolnictví',1781,'czech',['czech-history','politics'],5,'Reformy Josefa II. rozšířily náboženskou toleranci a zásadně změnily postavení venkovského obyvatelstva.','Toleranční patent'],
    ['v29-french-revolution','Francouzská revoluce',1789,'world',['world-history','politics'],5,'Francouzská revoluce proměnila evropskou politiku a rozšířila ideje občanství, rovnosti a národního státu.','Velká francouzská revoluce'],
    ['v29-vienna','Vídeňský kongres',1815,'world',['world-history','politics'],4,'Evropské mocnosti po napoleonských válkách obnovily politickou rovnováhu a uspořádání Evropy.','Vídeňský kongres'],
    ['v29-revolution-1848','Revoluční rok 1848',1848,'czech',['czech-history','politics'],5,'Revoluce roku 1848 přinesla zrušení poddanství a posílila české národní a politické hnutí.','Revoluce v Rakouském císařství 1848–1849'],
    ['v29-austria-hungary','Vznik Rakouska-Uherska',1867,'czech',['czech-history','politics'],4,'Rakousko-uherské vyrovnání vytvořilo dualistickou monarchii, jejíž součástí zůstaly české země.','Rakousko-uherské vyrovnání'],
    ['v29-ww1','Začátek první světové války',1914,'world',['world-history','war'],5,'První světová válka zásadně změnila Evropu a vedla k rozpadu několika říší.','První světová válka'],
    ['v29-czechoslovakia','Vznik Československa',1918,'czech',['czech-history','politics'],5,'Dne 28. října 1918 vznikl samostatný československý stát.','Vznik Československa'],
    ['v29-munich','Mnichovská dohoda',1938,'czech',['czech-history','war','politics'],5,'Mnichovská dohoda vedla k odstoupení československého pohraničí nacistickému Německu.','Mnichovská dohoda'],
    ['v29-ww2','Začátek druhé světové války',1939,'world',['world-history','war'],5,'Napadení Polska nacistickým Německem zahájilo druhou světovou válku v Evropě.','Druhá světová válka'],
    ['v29-end-ww2','Konec druhé světové války',1945,'world',['world-history','war'],5,'Porážka nacistického Německa a Japonska ukončila nejničivější konflikt moderních dějin.','Konec druhé světové války v Evropě'],
    ['v29-february','Komunistický převrat v Československu',1948,'czech',['czech-history','politics'],5,'Únorový převrat přivedl Komunistickou stranu Československa k úplné moci.','Únor 1948'],
    ['v29-prague-spring','Pražské jaro a invaze vojsk Varšavské smlouvy',1968,'czech',['czech-history','war','politics'],5,'Reformní proces Pražského jara ukončila srpnová invaze vojsk Varšavské smlouvy.','Invaze vojsk Varšavské smlouvy do Československa'],
    ['v29-velvet','Sametová revoluce',1989,'czech',['czech-history','politics'],5,'Nenásilná revoluce ukončila komunistický režim v Československu.','Sametová revoluce'],
    ['v29-berlin-wall','Pád Berlínské zdi',1989,'world',['world-history','politics'],5,'Pád Berlínské zdi se stal symbolem konce studené války a rozdělení Evropy.','Pád Berlínské zdi'],
    ['v29-czech-republic','Vznik České republiky',1993,'czech',['czech-history','politics'],5,'Po zániku Československa vznikla 1. ledna 1993 samostatná Česká republika.','Vznik České republiky'],
    ['v29-eu','Vstup České republiky do Evropské unie',2004,'czech',['czech-history','politics'],4,'Česká republika se 1. května 2004 stala členem Evropské unie.','Vstup Česka do Evropské unie'],
    ['v29-covid','Pandemie covidu-19',2020,'world',['world-history','science'],5,'Celosvětová pandemie zásadně ovlivnila zdraví, ekonomiku, školství i každodenní život.','Pandemie covidu-19'],
    ['v29-ukraine','Ruská invaze na Ukrajinu',2022,'world',['world-history','war','politics'],5,'Rozsáhlá ruská invaze zahájená v únoru 2022 vyvolala největší evropský konflikt od druhé světové války.','Ruská invaze na Ukrajinu']
  ];
  const normalized=s=>String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  essentialEvents.forEach(([id,title,year,scope,categories,importance,summary,wikiTitle])=>{
    const exists=DATA.events.some(e=>Math.abs(e.start-year)<=1&&(normalized(e.title).includes(normalized(title).slice(0,12))||normalized(title).includes(normalized(e.title).slice(0,12))));
    if(!exists)DATA.events.push({id,title,start:year,end:year,display:String(year),scope,categories,importance,summary,wikiTitle,wiki:`https://cs.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(wikiTitle)}`,image:null});
  });

  let generation=0,thumbIndex=0,relationTimer=null;
  const scheduleThumb=(item,host,alt,gen)=>{
    const delay=110+Math.min(360,thumbIndex++*11);
    setTimeout(()=>{if(gen===generation&&host?.isConnected)wikiImage(item,host,alt)},delay);
  };
  const sectionLabel=(host,top,text,icon,color,cls='v29-section-label')=>{const el=document.createElement('div');el.className=cls;el.style.cssText=`top:${top}px;--lane:${color}`;el.innerHTML=icon+`<span>${text}</span>`;host.appendChild(el)};
  const overlaps=(a,b,g=7)=>!(a.right+g<=b.left||b.right+g<=a.left);
  const pack=(items,maxRows,gap=7)=>{
    const rows=Array.from({length:Math.max(1,maxRows)},()=>[]);
    items.forEach(item=>{
      let row=rows.findIndex(list=>list.every(x=>!overlaps(item,x,gap)));
      if(row<0)row=rows.reduce((best,list,i)=>list.length<rows[best].length?i:best,0);
      item.row=row;rows[row].push(item);
    });
    return items;
  };

  const clearRelations=(authorHost,workHost)=>{
    authorHost.querySelectorAll('.v29-author-card').forEach(el=>el.classList.remove('is-selected','is-dimmed'));
    workHost.querySelectorAll('.v29-work-card').forEach(el=>el.classList.remove('is-related','is-dimmed'));
    workHost.querySelector('.v29-connectors')?.remove();
  };
  const showRelations=(authorId,authorHost,workHost)=>{
    clearTimeout(relationTimer);clearRelations(authorHost,workHost);
    const source=authorHost.querySelector(`.v29-author-card[data-author-id="${CSS.escape(authorId)}"]`),targets=[...workHost.querySelectorAll(`.v29-work-card[data-author-id="${CSS.escape(authorId)}"]`)];
    if(!source)return;
    authorHost.querySelectorAll('.v29-author-card').forEach(el=>el.classList.toggle('is-dimmed',el!==source));source.classList.add('is-selected');
    workHost.querySelectorAll('.v29-work-card').forEach(el=>{const related=el.dataset.authorId===authorId;el.classList.toggle('is-related',related);el.classList.toggle('is-dimmed',!related)});
    if(!targets.length)return;
    const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.classList.add('v29-connectors');
    const sx=source.offsetLeft+source.offsetWidth/2,sy=source.offsetTop+source.offsetHeight;
    targets.forEach(target=>{const tx=target.offsetLeft+target.offsetWidth/2,ty=target.offsetTop,bend=sy+(ty-sy)*.52,path=document.createElementNS(ns,'path');path.setAttribute('d',`M ${sx} ${sy} C ${sx} ${bend}, ${tx} ${bend}, ${tx} ${ty}`);svg.appendChild(path);const dot=document.createElementNS(ns,'circle');dot.setAttribute('cx',tx);dot.setAttribute('cy',ty);dot.setAttribute('r','2.4');svg.appendChild(dot)});
    workHost.prepend(svg);
  };
  const scheduleClearRelations=(authorHost,workHost)=>{clearTimeout(relationTimer);relationTimer=setTimeout(()=>clearRelations(authorHost,workHost),120)};

  renderLiterature=function(w){
    const gen=++generation;thumbIndex=0;
    const authorHost=document.getElementById('authorLayer'),workHost=document.getElementById('workLayer'),literature=document.getElementById('literature');authorHost.innerHTML='';workHost.innerHTML='';
    const h=literature.clientHeight,s=span(),overview=s>360,authorsTop=46,worksTop=Math.round(h*(overview?.66:.62)),authorsHeight=Math.max(120,worksTop-authorsTop-10),worksHeight=Math.max(88,h-worksTop-6);
    sectionLabel(authorHost,10,'Autoři',icons.person,'#6d55f7');sectionLabel(workHost,worksTop+4,'Díla',icons.book,'#6d55f7');
    const people=DATA.people.filter(p=>(p.group||'maturity')==='maturity'&&p.end>=viewStart&&p.start<=viewEnd&&active.has('authors')&&(!searchTerm||(p.name+' '+(p.keywords||[]).join(' ')).toLowerCase().includes(searchTerm))).sort((a,b)=>a.start-b.start||a.end-b.end);
    const authorItems=people.map(p=>{const lifeLeft=xFor(Math.max(p.start,viewStart),w),lifeRight=xFor(Math.min(p.end,viewEnd),w),nameWidth=Math.min(overview?205:280,Math.max(148,72+p.name.length*5.7)),width=overview?nameWidth:Math.min(310,Math.max(nameWidth,lifeRight-lifeLeft)),left=clamp(lifeLeft,44,w-width-18);return {p,left,right:left+width,width}});
    const authorRows=Math.max(5,Math.min(7,Math.floor(authorsHeight/(overview?30:34))));pack(authorItems,authorRows,6);const authorGap=Math.max(29,authorsHeight/authorRows),afrag=document.createDocumentFragment();
    authorItems.forEach(item=>{const p=item.p,top=authorsTop+item.row*authorGap,a=document.createElement('a');a.className='v29-author-card';a.href=p.wiki;a.target='_blank';a.rel='noopener noreferrer';a.dataset.kind='person';a.dataset.id=p.id;a.dataset.authorId=p.id;a.style.cssText=`left:${item.left}px;top:${top}px;width:${item.width}px`;a.innerHTML=`<span class="avatar"></span><b>${p.name}</b><small>${p.start}–${p.end}</small>`;scheduleThumb(p,a.querySelector('.avatar'),p.name,gen);const works=DATA.works.filter(x=>x.authorId===p.id).map(x=>x.title).join(' · '),kw=(p.keywords||[]).join(' · ');a.onmouseenter=e=>{showTip(e,p,`${p.start}–${p.end}`,[kw,works&&`Díla: ${works}`].filter(Boolean).join('\n'));showRelations(p.id,authorHost,workHost)};a.onmousemove=moveTip;a.onmouseleave=()=>{hideTip();scheduleClearRelations(authorHost,workHost)};afrag.appendChild(a)});authorHost.appendChild(afrag);

    const authorMap=new Map(DATA.people.map(p=>[p.id,p])),works=DATA.works.filter(b=>active.has('works')&&b.year>=viewStart&&b.year<=viewEnd&&(authorMap.get(b.authorId)?.group||'maturity')==='maturity'&&(!searchTerm||(b.title+' '+b.year+' '+(authorMap.get(b.authorId)?.name||'')).toLowerCase().includes(searchTerm))).sort((a,b)=>a.year-b.year||a.title.localeCompare(b.title));
    const workItems=works.map(b=>{const width=Math.min(overview?176:240,Math.max(94,66+b.title.length*5.4)),x=xFor(b.year,w),left=clamp(x-width/2,44,w-width-18);return {b,left,right:left+width,width}}),workRows=Math.max(2,Math.min(4,Math.floor((worksHeight-37)/35)));pack(workItems,workRows,7);const workBase=worksTop+39,workGap=Math.max(34,(worksHeight-39)/Math.max(1,workRows)),wfrag=document.createDocumentFragment();
    workItems.forEach(item=>{const b=item.b,top=workBase+item.row*workGap,c=document.createElement('a');c.className='v29-work-card';c.href=b.wiki;c.target='_blank';c.rel='noopener noreferrer';c.dataset.kind='work';c.dataset.id=b.id;c.dataset.authorId=b.authorId;c.style.cssText=`left:${item.left}px;top:${top}px;width:${item.width}px`;c.innerHTML=`<span class="work-thumb"></span><b>${b.title}</b><time>${b.year}</time>`;scheduleThumb(b,c.querySelector('.work-thumb'),b.title,gen);const author=authorMap.get(b.authorId);c.onmouseenter=e=>{showTip(e,b,String(b.year),`${author?.name||''}${(b.keywords||[]).length?' · '+b.keywords.join(' · '):''}`);showRelations(b.authorId,authorHost,workHost)};c.onmousemove=moveTip;c.onmouseleave=()=>{hideTip();scheduleClearRelations(authorHost,workHost)};wfrag.appendChild(c)});workHost.appendChild(wfrag);
  };

  const eventVisibleV29=e=>{
    if(e.end<viewStart||e.start>viewEnd||!active.has('events'))return false;
    if(searchTerm&&!(`${e.title} ${e.display||''} ${e.summary||''}`.toLowerCase().includes(searchTerm)))return false;
    const scope=eventScope(e),cats=e.categories||[];
    if(scope==='czech')return active.has('czech');if(scope==='tech')return active.has('tech');if(cats.includes('war'))return active.has('wars')||active.has('war')||active.has('world');return active.has('world')||active.has('politics')||active.has('culture');
  };
  renderHistory=function(w){
    const gen=++generation;thumbIndex=0;
    const host=document.getElementById('eventLayer');host.innerHTML='';const h=host.clientHeight,list=DATA.events.filter(eventVisibleV29),empty=document.getElementById('empty');empty.style.display=list.length?'none':'grid';if(!list.length)return;
    const third=h/3,s=span(),overview=s>360,medium=s>150,configs={czech:{top:0,height:third,color:'#1aa1e8',label:'České dějiny',icon:icons.czech},world:{top:third,height:third,color:'#f04444',label:'Svět & války',icon:icons.world},tech:{top:third*2,height:third,color:'#ff9800',label:'Vynálezy',icon:icons.tech}};
    Object.values(configs).forEach(cfg=>cfg.axis=cfg.top+cfg.height/2);
    Object.entries(configs).forEach(([scope,cfg])=>{const lane=document.createElement('div');lane.className='v29-lane';lane.style.cssText=`top:${cfg.top}px;height:${cfg.height}px;--lane:${cfg.color}`;const axis=document.createElement('i');axis.className='v29-axis';axis.style.top=(cfg.axis-cfg.top)+'px';lane.appendChild(axis);host.appendChild(lane);sectionLabel(host,cfg.top+5,cfg.label,cfg.icon,cfg.color,'v29-lane-label')});
    const dotThreshold=overview?5:medium?3:1,dots=document.createDocumentFragment();list.filter(e=>e.importance>=dotThreshold).forEach(e=>{const scope=eventScope(e),cfg=configs[scope];if(!cfg)return;const x=xFor((e.start+e.end)/2,w),d=document.createElement('a'),size=e.importance>=5?10:e.importance===4?8:6;d.className='event-dot v29-event-dot';d.href=e.wiki;d.target='_blank';d.rel='noopener noreferrer';d.dataset.kind='event';d.dataset.id=e.id;d.style.cssText=`left:${x}px;top:${cfg.axis}px;width:${size}px;height:${size}px;--event:${cfg.color}`;d.onmouseenter=ev=>showTip(ev,e,e.display,e.summary);d.onmousemove=moveTip;d.onmouseleave=hideTip;dots.appendChild(d)});host.appendChild(dots);
    const threshold=overview?5:medium?4:2,maxPerScope=overview?9:medium?16:28;
    Object.entries(configs).forEach(([scope,cfg])=>{const candidates=list.filter(e=>eventScope(e)===scope&&e.importance>=threshold).sort((a,b)=>b.importance-a.importance||a.start-b.start).slice(0,maxPerScope).sort((a,b)=>a.start-b.start),rowTop=[cfg.top+5,cfg.axis+7],occupied=[[],[]],frag=document.createDocumentFragment();
      candidates.forEach(e=>{const x=xFor((e.start+e.end)/2,w),width=Math.min(overview?184:220,Math.max(overview?128:118,78+e.title.length*(overview?4.2:4.6))),left=clamp(x-width/2,112,w-width-18),interval={left,right:left+width};let row=-1;for(let i=0;i<2;i++)if(!occupied[i].some(o=>overlaps(interval,o,6))){row=i;break}if(row<0)return;const cardH=overview?43:38,top=rowTop[row];if(top+cardH>cfg.top+cfg.height-3)return;occupied[row].push(interval);const card=document.createElement('a');card.className='v29-event-card'+(overview?' is-overview':'');card.href=e.wiki;card.target='_blank';card.rel='noopener noreferrer';card.dataset.kind='event';card.dataset.id=e.id;card.style.cssText=`left:${left}px;top:${top}px;width:${width}px;--event:${cfg.color}`;card.innerHTML=`<span class="event-image"></span><span class="event-text"><b>${e.title}</b><time>${e.display}</time></span>`;scheduleThumb(e,card.querySelector('.event-image'),e.title,gen);card.onmouseenter=ev=>showTip(ev,e,e.display,e.summary);card.onmousemove=moveTip;card.onmouseleave=hideTip;frag.appendChild(card);const stem=document.createElement('i');stem.className='v29-event-stem';stem.style.setProperty('--event',cfg.color);stem.style.left=x+'px';if(row===0){stem.style.top=(top+cardH)+'px';stem.style.height=Math.max(1,cfg.axis-top-cardH)+'px'}else{stem.style.top=cfg.axis+'px';stem.style.height=Math.max(1,top-cfg.axis)+'px'}frag.appendChild(stem)});host.appendChild(frag);
    });
  };

  const timeline=document.getElementById('timeline'),shell=document.querySelector('.timeline-shell');
  const panel=document.createElement('div');panel.className='v29-zoom-panel';panel.innerHTML='<button type="button" data-z="out" aria-label="Oddálit">−</button><input type="range" min="0" max="100" step="1" aria-label="Přiblížení časové osy"><button type="button" data-z="in" aria-label="Přiblížit">+</button><span class="v29-zoom-label"></span>';
  const help=document.createElement('div');help.className='v29-zoom-help';help.textContent='Kolečko / trackpad = přiblížení · tažením posuneš osu';timeline.append(panel,help);
  const slider=panel.querySelector('input'),zoomLabel=panel.querySelector('.v29-zoom-label');
  const spanToSlider=s=>Math.round(100*Math.log(MAX_SPAN/Math.max(MIN_SPAN,Math.min(MAX_SPAN,s)))/Math.log(MAX_SPAN/MIN_SPAN));
  const sliderToSpan=v=>MAX_SPAN*Math.pow(MIN_SPAN/MAX_SPAN,Number(v)/100);
  const updateZoomUI=()=>{const s=span();slider.value=String(spanToSlider(s));zoomLabel.textContent=s<25?`${s.toFixed(1)} roku`:`${Math.round(s)} let`;shell.classList.toggle('zoom-overview',s>360);shell.classList.toggle('zoom-medium',s<=360&&s>150);shell.classList.toggle('zoom-detail',s<=150)};

  let pendingRange=null,rangeTimer=null;
  const commitRange=()=>{rangeTimer=null;if(!pendingRange)return;({start:viewStart,end:viewEnd}=pendingRange);pendingRange=null;render()};
  const scheduleRange=(start,end)=>{let s=end-start;s=Math.max(MIN_SPAN,Math.min(MAX_SPAN,s));let center=(start+end)/2;start=center-s/2;end=center+s/2;if(start<MATURITY_START){end+=MATURITY_START-start;start=MATURITY_START}if(end>MATURITY_END){start-=end-MATURITY_END;end=MATURITY_END}pendingRange={start,end};if(!rangeTimer)rangeTimer=setTimeout(commitRange,32)};
  const zoomAt=(factor,ratio=.5)=>{const current=span(),next=Math.max(MIN_SPAN,Math.min(MAX_SPAN,current*factor)),anchor=viewStart+current*ratio;let start=anchor-next*ratio,end=start+next;scheduleRange(start,end)};
  slider.addEventListener('input',()=>{const center=(viewStart+viewEnd)/2,next=sliderToSpan(slider.value);scheduleRange(center-next/2,center+next/2)});
  panel.querySelector('[data-z="in"]').onclick=()=>zoomAt(.68,.5);panel.querySelector('[data-z="out"]').onclick=()=>zoomAt(1.47,.5);
  document.getElementById('zoomIn').onclick=()=>zoomAt(.68,.5);document.getElementById('zoomOut').onclick=()=>zoomAt(1.47,.5);document.getElementById('fit').onclick=()=>scheduleRange(MATURITY_START,MATURITY_END);

  timeline.addEventListener('wheel',e=>{if(e.target.closest('input,button,.timeline-scrollbar,.info-panel,.range-popover'))return;e.preventDefault();const rect=timeline.getBoundingClientRect(),ratio=Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width));if(e.shiftKey||Math.abs(e.deltaX)>Math.abs(e.deltaY)*.7){const delta=(e.deltaX+(e.shiftKey?e.deltaY:0))/Math.max(1,rect.width)*span();scheduleRange(viewStart+delta,viewEnd+delta)}else{zoomAt(Math.exp(e.deltaY*.00135),ratio)}},{passive:false});
  timeline.addEventListener('dblclick',e=>{if(e.target.closest('a,button,input'))return;const r=timeline.getBoundingClientRect();zoomAt(.48,(e.clientX-r.left)/r.width)});
  let drag=null;
  timeline.addEventListener('pointerdown',e=>{if(e.button!==0||e.target.closest('a,button,input,.timeline-scrollbar,.info-panel,.range-popover'))return;drag={x:e.clientX,start:viewStart,end:viewEnd,moved:false};timeline.setPointerCapture(e.pointerId);shell.classList.add('v29-panning')});
  timeline.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x;if(Math.abs(dx)>2)drag.moved=true;const years=-dx/Math.max(1,timeline.clientWidth)*(drag.end-drag.start);scheduleRange(drag.start+years,drag.end+years)});
  const endDrag=e=>{if(!drag)return;drag=null;shell.classList.remove('v29-panning');try{timeline.releasePointerCapture(e.pointerId)}catch(_){}};timeline.addEventListener('pointerup',endDrag);timeline.addEventListener('pointercancel',endDrag);

  const previousRender=render;
  render=function(){generation++;previousRender();requestAnimationFrame(updateZoomUI)};
  requestAnimationFrame(()=>{viewStart=MATURITY_START;viewEnd=MATURITY_END;render();updateZoomUI()});
})();
