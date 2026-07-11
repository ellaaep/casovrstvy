(() => {
  'use strict';

  const MATURITY_START=1500;
  const MATURITY_END=Math.max(2026,typeof ALL_END==='number'?ALL_END:2026);
  const icons={
    person:'<svg viewBox="0 0 24 24"><path d="M4 20c0-3.3 3.1-5.5 8-5.5s8 2.2 8 5.5M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/></svg>',
    book:'<svg viewBox="0 0 24 24"><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v17H7.5A3.5 3.5 0 0 0 4 22V5.5Zm16 0A3.5 3.5 0 0 0 16.5 2H13v17h3.5A3.5 3.5 0 0 1 20 22V5.5Z"/></svg>',
    czech:'<svg viewBox="0 0 24 24"><path d="M3 9h18M5 9v9m4-9v9m6-9v9m4-9v9M3 20h18M12 3l9 5H3l9-5Z"/></svg>',
    world:'<svg viewBox="0 0 24 24"><path d="M12 22s7-3.5 7-10V5l-7-3-7 3v7c0 6.5 7 10 7 10Z"/></svg>',
    tech:'<svg viewBox="0 0 24 24"><path d="M9 18h6m-5 3h4m3-11a5 5 0 1 0-10 0c0 2 1.1 3.2 2.2 4.2.6.6.8 1.1.8 1.8h4c0-.7.2-1.2.8-1.8C15.9 13.2 17 12 17 10Z"/></svg>'
  };

  ['maturity','authors','works','events','czech','world','wars','war','politics','culture','tech','periods','czech-periods'].forEach(id=>active.add(id));
  active.delete('other-authors');
  active.delete('world-periods');
  updateVisibilityClasses();
  document.querySelectorAll('.filter').forEach(row=>row.classList.toggle('active',active.has(row.dataset.id)));

  const otherRow=document.querySelector('.filter[data-id="other-authors"]');if(otherRow)otherRow.style.display='none';
  const fit=document.getElementById('fit');if(fit)fit.onclick=()=>animateExact(MATURITY_START,MATURITY_END);
  const allPreset=document.querySelector('[data-preset="all"]');if(allPreset)allPreset.onclick=()=>{animateExact(MATURITY_START,MATURITY_END);document.getElementById('rangePopover')?.classList.remove('open')};

  let thumbIndex=0;
  const queueThumb=(item,host,alt)=>{
    const delay=Math.min(520,thumbIndex++*14);
    setTimeout(()=>{if(host?.isConnected)wikiImage(item,host,alt)},delay);
  };
  const sectionLabel=(host,top,text,icon,color,cls='v28-section-label')=>{
    const el=document.createElement('div');el.className=cls;el.style.cssText=`top:${top}px;--lane:${color}`;el.innerHTML=icon+`<span>${text}</span>`;host.appendChild(el);return el;
  };
  const pack=(items,maxRows,gap=7)=>{
    const rows=Array.from({length:Math.max(1,maxRows)},()=>[]);
    for(const item of items){
      let row=rows.findIndex(list=>list.every(x=>item.right+gap<=x.left||x.right+gap<=item.left));
      if(row<0)row=rows.reduce((best,list,i)=>list.length<rows[best].length?i:best,0);
      item.row=row;rows[row].push(item);
    }
    return items;
  };

  let focusedAuthorId=DATA.people.find(p=>p.name==='Karel Čapek')?.id||DATA.people.find(p=>(p.group||'maturity')==='maturity')?.id;
  const drawRelationships=(authorId,authorHost,workHost)=>{
    focusedAuthorId=authorId;
    authorHost.querySelectorAll('.v28-author-card').forEach(el=>{const yes=el.dataset.authorId===authorId;el.classList.toggle('is-selected',yes);el.classList.toggle('is-dimmed',!yes)});
    workHost.querySelectorAll('.v28-work-card').forEach(el=>{const yes=el.dataset.authorId===authorId;el.classList.toggle('is-related',yes);el.classList.toggle('is-dimmed',!yes)});
    workHost.querySelector('.v28-connectors')?.remove();
    const source=authorHost.querySelector(`.v28-author-card[data-author-id="${CSS.escape(authorId)}"]`),targets=[...workHost.querySelectorAll(`.v28-work-card[data-author-id="${CSS.escape(authorId)}"]`)];
    if(!source||!targets.length)return;
    const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.classList.add('v28-connectors');
    const sx=source.offsetLeft+source.offsetWidth/2,sy=source.offsetTop+source.offsetHeight;
    targets.forEach(target=>{
      const tx=target.offsetLeft+target.offsetWidth/2,ty=target.offsetTop,bend=sy+(ty-sy)*.54,path=document.createElementNS(ns,'path');
      path.setAttribute('d',`M ${sx} ${sy} C ${sx} ${bend}, ${tx} ${bend}, ${tx} ${ty}`);svg.appendChild(path);
      const c=document.createElementNS(ns,'circle');c.setAttribute('cx',tx);c.setAttribute('cy',ty);c.setAttribute('r','2.4');svg.appendChild(c);
    });
    workHost.prepend(svg);
  };

  renderLiterature=function(w){
    thumbIndex=0;
    const authorHost=document.getElementById('authorLayer'),workHost=document.getElementById('workLayer'),literature=document.getElementById('literature');authorHost.innerHTML='';workHost.innerHTML='';
    const h=literature.clientHeight,authorsTop=47,worksTop=Math.max(180,Math.round(h*.60)),authorsHeight=Math.max(112,worksTop-authorsTop-12),worksHeight=Math.max(78,h-worksTop-7);
    sectionLabel(authorHost,11,'Autoři',icons.person,'#6d55f7');sectionLabel(workHost,worksTop+4,'Díla',icons.book,'#6d55f7');
    const people=DATA.people.filter(p=>(p.group||'maturity')==='maturity'&&p.end>=viewStart&&p.start<=viewEnd&&active.has('authors')&&(!searchTerm||(p.name+' '+(p.keywords||[]).join(' ')).toLowerCase().includes(searchTerm))).sort((a,b)=>a.start-b.start||a.end-b.end);
    const authorItems=people.map(p=>{
      const lifeLeft=xFor(Math.max(p.start,viewStart),w),lifeRight=xFor(Math.min(p.end,viewEnd),w),nameWidth=Math.min(238,Math.max(142,68+p.name.length*5.4)),lifeWidth=Math.max(nameWidth,lifeRight-lifeLeft),width=Math.min(285,lifeWidth),left=clamp(lifeLeft,44,w-width-18);return {p,left,right:left+width,width};
    });
    const authorRows=Math.max(4,Math.min(8,Math.floor(authorsHeight/34)));pack(authorItems,authorRows,6);const authorGap=Math.max(31,authorsHeight/authorRows);
    const afrag=document.createDocumentFragment();
    authorItems.forEach(item=>{
      const p=item.p,top=authorsTop+item.row*authorGap,a=document.createElement('a');a.className='v28-author-card';a.href=p.wiki;a.target='_blank';a.rel='noopener noreferrer';a.dataset.kind='person';a.dataset.id=p.id;a.dataset.authorId=p.id;a.style.cssText=`left:${item.left}px;top:${top}px;width:${item.width}px`;
      a.innerHTML=`<span class="avatar"></span><b>${p.name}</b><small>${p.start}–${p.end}</small>`;queueThumb(p,a.querySelector('.avatar'),p.name);
      const works=DATA.works.filter(x=>x.authorId===p.id).map(x=>x.title).join(' · '),kw=(p.keywords||[]).join(' · ');
      a.onmouseenter=e=>{showTip(e,p,`${p.start}–${p.end}`,[kw,works&&`Díla: ${works}`].filter(Boolean).join('\n'));requestAnimationFrame(()=>drawRelationships(p.id,authorHost,workHost))};a.onmousemove=moveTip;a.onmouseleave=hideTip;afrag.appendChild(a);
    });authorHost.appendChild(afrag);

    const authorMap=new Map(DATA.people.map(p=>[p.id,p]));
    const works=DATA.works.filter(b=>active.has('works')&&b.year>=viewStart&&b.year<=viewEnd&&(authorMap.get(b.authorId)?.group||'maturity')==='maturity'&&(!searchTerm||(b.title+' '+b.year+' '+(authorMap.get(b.authorId)?.name||'')).toLowerCase().includes(searchTerm))).sort((a,b)=>a.year-b.year||a.title.localeCompare(b.title));
    const workItems=works.map(b=>{const width=Math.min(230,Math.max(92,64+b.title.length*5.4)),x=xFor(b.year,w),left=clamp(x-width/2,44,w-width-18);return {b,left,right:left+width,width}});
    const workRows=Math.max(2,Math.min(5,Math.floor((worksHeight-36)/35)));pack(workItems,workRows,7);const workBase=worksTop+39,workGap=Math.max(34,(worksHeight-38)/workRows),wfrag=document.createDocumentFragment();
    workItems.forEach(item=>{const b=item.b,top=workBase+item.row*workGap,c=document.createElement('a');c.className='v28-work-card';c.href=b.wiki;c.target='_blank';c.rel='noopener noreferrer';c.dataset.kind='work';c.dataset.id=b.id;c.dataset.authorId=b.authorId;c.style.cssText=`left:${item.left}px;top:${top}px;width:${item.width}px`;c.innerHTML=`<span class="work-thumb"></span><b>${b.title}</b><time>${b.year}</time>`;queueThumb(b,c.querySelector('.work-thumb'),b.title);const author=authorMap.get(b.authorId);c.onmouseenter=e=>showTip(e,b,String(b.year),`${author?.name||''}${(b.keywords||[]).length?' · '+b.keywords.join(' · '):''}`);c.onmousemove=moveTip;c.onmouseleave=hideTip;wfrag.appendChild(c)});workHost.appendChild(wfrag);
    const visibleFocus=authorItems.some(x=>x.p.id===focusedAuthorId)?focusedAuthorId:authorItems[0]?.p.id;if(visibleFocus)requestAnimationFrame(()=>drawRelationships(visibleFocus,authorHost,workHost));
  };

  const eventIsVisible=e=>{
    if(e.end<viewStart||e.start>viewEnd||!active.has('events'))return false;
    if(searchTerm&&!(`${e.title} ${e.display||''} ${e.summary||''}`.toLowerCase().includes(searchTerm)))return false;
    const scope=eventScope(e);
    if(scope==='czech')return active.has('czech');
    if(scope==='tech')return active.has('tech');
    const cats=e.categories||[];if(cats.includes('war'))return active.has('wars')||active.has('war')||active.has('world');
    return active.has('world')||active.has('politics')||active.has('culture');
  };
  const overlap=(a,b,g=6)=>!(a.right+g<=b.left||b.right+g<=a.left);

  renderHistory=function(w){
    thumbIndex=0;
    const host=document.getElementById('eventLayer');host.innerHTML='';const h=host.clientHeight,list=DATA.events.filter(eventIsVisible),empty=document.getElementById('empty');empty.style.display=list.length?'none':'grid';if(!list.length)return;
    const third=h/3,configs={czech:{top:0,height:third,axis:third-9,color:'#1aa1e8',label:'České dějiny',icon:icons.czech},world:{top:third,height:third,axis:third*2-9,color:'#f04444',label:'Svět & války',icon:icons.world},tech:{top:third*2,height:third,axis:h-9,color:'#ff9800',label:'Vynálezy',icon:icons.tech}};
    Object.entries(configs).forEach(([scope,cfg])=>{const lane=document.createElement('div');lane.className='v28-lane';lane.style.cssText=`top:${cfg.top}px;height:${cfg.height}px;--lane:${cfg.color}`;const axis=document.createElement('i');axis.className='v28-axis';axis.style.top=(cfg.axis-cfg.top)+'px';lane.appendChild(axis);host.appendChild(lane);sectionLabel(host,cfg.top+6,cfg.label,cfg.icon,cfg.color,'v28-lane-label')});
    const dots=document.createDocumentFragment();list.forEach(e=>{const scope=eventScope(e),cfg=configs[scope];if(!cfg)return;const x=xFor((e.start+e.end)/2,w),d=document.createElement('a'),size=e.importance>=5?10:e.importance===4?8:6;d.className='event-dot v28-event-dot';d.href=e.wiki;d.target='_blank';d.rel='noopener noreferrer';d.dataset.kind='event';d.dataset.id=e.id;d.style.cssText=`left:${x}px;top:${cfg.axis}px;width:${size}px;height:${size}px;--event:${cfg.color}`;d.onmouseenter=ev=>showTip(ev,e,e.display,e.summary);d.onmousemove=moveTip;d.onmouseleave=hideTip;dots.appendChild(d)});host.appendChild(dots);
    const threshold=span()>700?4:3;
    Object.entries(configs).forEach(([scope,cfg])=>{
      const candidates=list.filter(e=>eventScope(e)===scope&&e.importance>=threshold).sort((a,b)=>b.importance-a.importance||a.start-b.start).slice(0,span()>700?14:24).sort((a,b)=>a.start-b.start),rowCount=cfg.height>132?3:2,rowTop=Array.from({length:rowCount},(_,i)=>cfg.top+39+i*35),occupied=Array.from({length:rowCount},()=>[]),frag=document.createDocumentFragment();
      candidates.forEach(e=>{const x=xFor((e.start+e.end)/2,w),width=Math.min(205,Math.max(116,74+e.title.length*4.15)),left=clamp(x-width/2,44,w-width-18),interval={left,right:left+width};let row=-1;for(let i=0;i<rowCount;i++)if(!occupied[i].some(o=>overlap(interval,o))){row=i;break}if(row<0)return;const top=rowTop[row];if(top+34>cfg.axis-3)return;occupied[row].push(interval);const card=document.createElement('a');card.className=`event-card v28-event-card scope-${scope}`;card.href=e.wiki;card.target='_blank';card.rel='noopener noreferrer';card.dataset.kind='event';card.dataset.id=e.id;card.style.cssText=`left:${left}px;top:${top}px;width:${width}px;--event:${cfg.color}`;card.innerHTML=`<span class="event-image"></span><span class="event-text"><b>${e.title}</b><time>${e.display}</time></span>`;queueThumb(e,card.querySelector('.event-image'),e.title);card.onmouseenter=ev=>showTip(ev,e,e.display,e.summary);card.onmousemove=moveTip;card.onmouseleave=hideTip;frag.appendChild(card);const stem=document.createElement('i');stem.className='event-stem';stem.style.cssText=`left:${x}px;top:${top+34}px;height:${Math.max(1,cfg.axis-top-34)}px;--event:${cfg.color}`;frag.appendChild(stem)});host.appendChild(frag);
    });
  };

  renderPeriods=function(w){
    const host=document.getElementById('periodLayer');host.innerHTML='';if(!active.has('czech-periods'))return;const periods=DATA.periods.filter(p=>String(p.id).startsWith('v27-')&&p.end>=viewStart&&p.start<=viewEnd).sort((a,b)=>a.start-b.start),h=host.clientHeight||94,frag=document.createDocumentFragment();
    periods.forEach(p=>{const x1=clamp(xFor(Math.max(p.start,viewStart),w),2,w-2),x2=clamp(xFor(Math.min(p.end,viewEnd),w),2,w-2),width=x2-x1;if(width<30)return;const row=p.row==='movement'?1:0,top=row?43:6;if(top+32>h)return;const a=document.createElement('a');a.className='v28-period'+(width<120?' compact':'')+(width<30?' tiny':'');a.href=p.wiki;a.target='_blank';a.rel='noopener noreferrer';a.dataset.kind='period';a.dataset.id=p.id;a.style.cssText=`left:${x1+2}px;top:${top}px;width:${Math.max(28,width-4)}px;--era:${p.color}`;a.innerHTML=`<b>${p.title}</b><time>${p.start}–${p.end}</time>`;a.onmouseenter=e=>showTip(e,p,`${p.start}–${p.end}`,'Historické období');a.onmousemove=moveTip;a.onmouseleave=hideTip;frag.appendChild(a)});host.appendChild(frag);
  };

  viewStart=MATURITY_START;viewEnd=MATURITY_END;
  requestAnimationFrame(()=>render());
})();
