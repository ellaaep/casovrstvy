(() => {
  'use strict';
  document.documentElement.dataset.theme = 'light';
  localStorage.setItem('casovrstvy-theme-v13','light');

  const svg = {
    person:'<svg viewBox="0 0 24 24"><path d="M4 20c0-3.3 3.1-5.5 8-5.5s8 2.2 8 5.5M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/></svg>',
    book:'<svg viewBox="0 0 24 24"><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v17H7.5A3.5 3.5 0 0 0 4 22V5.5Zm16 0A3.5 3.5 0 0 0 16.5 2H13v17h3.5A3.5 3.5 0 0 1 20 22V5.5Z"/></svg>',
    czech:'<svg viewBox="0 0 24 24"><path d="M3 9h18M5 9v9m4-9v9m6-9v9m4-9v9M3 20h18M12 3l9 5H3l9-5Z"/></svg>',
    world:'<svg viewBox="0 0 24 24"><path d="M12 22s7-3.5 7-10V5l-7-3-7 3v7c0 6.5 7 10 7 10Z"/></svg>',
    tech:'<svg viewBox="0 0 24 24"><path d="M9 18h6m-5 3h4m3-11a5 5 0 1 0-10 0c0 2 1.1 3.2 2.2 4.2.6.6.8 1.1.8 1.8h4c0-.7.2-1.2.8-1.8C15.9 13.2 17 12 17 10Z"/></svg>'
  };

  const ensureActive = () => {
    ['maturity','authors','works','events','czech','world','wars','politics','culture','tech','periods','czech-periods','world-periods','other-authors'].forEach(id=>active.add(id));
    active.delete('movements');
    updateVisibilityClasses();
  };
  ensureActive();

  const relabelFilters = () => {
    const map = {
      authors:['Autoři','#6d55f7'],
      works:['Díla','#6d55f7'],
      czech:['České dějiny','#1aa1e8'],
      world:['Svět & války','#f04444'],
      tech:['Vynálezy','#ff9800']
    };
    Object.entries(map).forEach(([id,[label,color]])=>{
      const row=document.querySelector(`.filter[data-id="${id}"]`);
      if(!row)return;
      const text=row.querySelector('.filter-label');if(text)text.textContent=label;
      row.style.setProperty('--c',color);
    });
    const worldRow=document.querySelector('.filter[data-id="world"]');
    if(worldRow&&!worldRow.dataset.v25Bound){
      worldRow.dataset.v25Bound='1';
      worldRow.addEventListener('click',()=>setTimeout(()=>{
        const on=active.has('world');
        ['wars','politics','culture'].forEach(id=>on?active.add(id):active.delete(id));
        updateVisibilityClasses();render();
      },0));
    }
  };
  relabelFilters();

  const topbar=document.querySelector('.topbar');
  let yearControl=document.getElementById('v25YearControl');
  if(!yearControl){
    yearControl=document.createElement('div');
    yearControl.id='v25YearControl';
    yearControl.className='v25-year-control';
    yearControl.innerHTML='<span>Rok</span><strong>1915</strong>';
    topbar.appendChild(yearControl);
  }

  const fit=document.getElementById('fit');
  fit?.setAttribute('title','Zobrazit celou časovou osu');
  const rangeSpan=document.querySelector('#rangeBtn span');if(rangeSpan)rangeSpan.textContent='Období';

  const timeline=document.getElementById('timeline');
  const focusBand=document.createElement('div');focusBand.className='v25-focus-band';
  const crosshair=document.createElement('div');crosshair.className='v25-crosshair';
  const crosshairTag=document.createElement('div');crosshairTag.className='v25-crosshair-tag';crosshairTag.textContent='1915';
  timeline.append(focusBand,crosshair,crosshairTag);
  let crosshairRatio=.5;

  const updateCrosshair = ratio => {
    crosshairRatio=Math.max(0,Math.min(1,ratio));
    const x=crosshairRatio*timeline.clientWidth;
    const year=Math.round(viewStart+(viewEnd-viewStart)*crosshairRatio);
    focusBand.style.left=x+'px';crosshair.style.left=x+'px';crosshairTag.style.left=x+'px';
    crosshairTag.textContent=year;
    const strong=yearControl.querySelector('strong');if(strong)strong.textContent=year;
  };
  timeline.addEventListener('pointermove',e=>{
    if(e.target.closest('a,button,input,.timeline-scrollbar,.info-panel,.range-popover'))return;
    const r=timeline.getBoundingClientRect();updateCrosshair((e.clientX-r.left)/r.width);
  });
  timeline.addEventListener('pointerenter',()=>updateCrosshair(crosshairRatio));

  let selectedAuthorId='capek';
  const personByName = name => DATA.people.find(p=>p.name.toLowerCase().includes(name.toLowerCase()));
  const capek=personByName('Karel Čapek');if(capek)selectedAuthorId=capek.id;

  const intervalRow=(items,maxRows,gap=8)=>{
    const rows=Array.from({length:maxRows},()=>[]);
    for(const item of items){
      let chosen=-1;
      for(let i=0;i<rows.length;i++)if(!rows[i].some(r=>!(item.right+gap<=r.left||r.right+gap<=item.left))){chosen=i;break}
      if(chosen<0)chosen=rows.reduce((best,row,i)=>row.length<rows[best].length?i:best,0);
      rows[chosen].push(item);item.row=chosen;
    }
    return items;
  };

  const label = (host,top,text,icon,color) => {
    const el=document.createElement('div');el.className='v25-section-label';el.style.cssText=`top:${top}px;--lane:${color}`;el.innerHTML=icon+`<span>${text}</span>`;host.appendChild(el);return el;
  };

  renderLiterature=function(w){
    const authorHost=document.getElementById('authorLayer'),workHost=document.getElementById('workLayer'),literature=document.getElementById('literature');
    authorHost.innerHTML='';workHost.innerHTML='';
    const h=literature.clientHeight,authorTop=48,authorHeight=Math.max(118,h*.56-authorTop),worksTop=Math.max(authorTop+110,h*.58),worksHeight=Math.max(70,h-worksTop-7);
    label(authorHost,12,'Autoři',svg.person,'#6d55f7');label(workHost,worksTop+5,'Díla',svg.book,'#6d55f7');
    const groups=new Set(['maturity']);if(active.has('other-authors'))groups.add('other');
    let people=DATA.people.filter(p=>groups.has(p.group||'maturity')&&p.end>=viewStart&&p.start<=viewEnd&&active.has('authors'));
    if(searchTerm)people=people.filter(p=>(p.name+' '+(p.keywords||[]).join(' ')).toLowerCase().includes(searchTerm));
    const authorItems=people.map(p=>{
      const exactLeft=xFor(Math.max(p.start,viewStart),w),exactRight=xFor(Math.min(p.end,viewEnd),w),natural=Math.max(136,exactRight-exactLeft),width=Math.min(330,natural),left=clamp(exactLeft,44,w-width-18);
      return {p,left,right:left+width,width};
    }).sort((a,b)=>a.left-b.left||a.p.start-b.p.start);
    const maxAuthorRows=Math.max(3,Math.min(7,Math.floor(authorHeight/37)));
    intervalRow(authorItems,maxAuthorRows,7);
    const authorGap=Math.max(34,authorHeight/maxAuthorRows);
    const authorPositions=new Map();
    for(const item of authorItems){
      const top=authorTop+item.row*authorGap;
      const p=item.p,a=document.createElement('a');a.className='v25-author-card'+(p.id===selectedAuthorId?' is-selected':'');a.href=p.wiki;a.target='_blank';a.rel='noopener noreferrer';a.dataset.kind='person';a.dataset.id=p.id;a.style.cssText=`left:${item.left}px;top:${top}px;width:${item.width}px;--author:${p.color}`;
      a.innerHTML=`<span class="avatar"></span><b>${p.name}</b><small>${p.start}–${p.end}</small>`;wikiImage(p,a.querySelector('.avatar'),p.name);
      a.onmouseenter=e=>showTip(e,p,`${p.start}–${p.end}`,(p.keywords||[]).join(' · '));a.onmousemove=moveTip;a.onmouseleave=hideTip;
      a.addEventListener('click',()=>{selectedAuthorId=p.id;requestAnimationFrame(()=>renderLiterature(w))});
      authorHost.appendChild(a);authorPositions.set(p.id,{x:item.left+item.width/2,y:top+32});
    }

    let works=DATA.works.filter(b=>active.has('works')&&b.year>=viewStart&&b.year<=viewEnd&&groups.has((DATA.people.find(p=>p.id===b.authorId)?.group)||'maturity'));
    if(searchTerm)works=works.filter(b=>(b.title+' '+b.year).toLowerCase().includes(searchTerm));
    const workItems=works.map(b=>{const width=clamp(74+b.title.length*5.3,92,210),x=xFor(b.year,w),left=clamp(x-width/2,44,w-width-18);return {b,left,right:left+width,width,x}}).sort((a,b)=>a.left-b.left||a.b.year-b.b.year);
    const maxWorkRows=Math.max(2,Math.min(4,Math.floor((worksHeight-35)/39)));
    intervalRow(workItems,maxWorkRows,8);
    const workBase=worksTop+42,workGap=Math.max(37,(worksHeight-40)/Math.max(1,maxWorkRows));
    const workPositions=new Map();
    for(const item of workItems){
      const top=workBase+item.row*workGap,b=item.b,related=b.authorId===selectedAuthorId,c=document.createElement('a');
      c.className='v25-work-card'+(related?' is-related':'');c.href=b.wiki;c.target='_blank';c.rel='noopener noreferrer';c.dataset.kind='work';c.dataset.id=b.id;c.style.cssText=`left:${item.left}px;top:${top}px;width:${item.width}px`;
      c.innerHTML=`<span class="work-thumb"></span><b>${b.title}</b><time>${b.year}</time>`;wikiImage(b,c.querySelector('.work-thumb'),b.title);
      c.onmouseenter=e=>showTip(e,b,String(b.year),'Literární dílo');c.onmousemove=moveTip;c.onmouseleave=hideTip;
      workHost.appendChild(c);workPositions.set(b.id,{x:item.left+item.width/2,y:top});
    }
    const selected=DATA.people.find(p=>p.id===selectedAuthorId),source=selected&&authorPositions.get(selected.id);
    if(source){
      const related=DATA.works.filter(b=>b.authorId===selected.id&&workPositions.has(b.id));
      if(related.length){
        const ns='http://www.w3.org/2000/svg',svgEl=document.createElementNS(ns,'svg');svgEl.classList.add('v25-connectors');
        related.forEach(b=>{const target=workPositions.get(b.id),path=document.createElementNS(ns,'path'),bend=(source.y+target.y)/2;path.setAttribute('d',`M ${source.x} ${source.y} C ${source.x} ${bend}, ${target.x} ${bend}, ${target.x} ${target.y}`);svgEl.appendChild(path)});
        workHost.prepend(svgEl);
      }
    }
  };

  const laneLabel=(host,top,text,icon,color)=>{const el=document.createElement('div');el.className='v25-lane-label';el.style.cssText=`top:${top}px;--lane:${color}`;el.innerHTML=icon+`<span>${text}</span>`;host.appendChild(el)};
  const overlaps=(a,b,gap=7)=>!(a.right+gap<=b.left||b.right+gap<=a.left);
  renderHistory=function(w){
    const host=document.getElementById('eventLayer');host.innerHTML='';const h=host.clientHeight,list=DATA.events.filter(eventVisible);document.getElementById('empty').style.display=list.length?'none':'grid';
    const third=h/3,configs={czech:{top:0,height:third,axis:third-9,color:'#1aa1e8',label:'České dějiny',icon:svg.czech},world:{top:third,height:third,axis:third*2-9,color:'#f04444',label:'Svět & války',icon:svg.world},tech:{top:third*2,height:third,axis:h-9,color:'#ff9800',label:'Vynálezy',icon:svg.tech}};
    Object.entries(configs).forEach(([scope,cfg])=>{const lane=document.createElement('div');lane.className=`history-lane ${scope}`;lane.style.cssText=`top:${cfg.top}px;height:${cfg.height}px;--lane-color:${cfg.color}`;host.appendChild(lane);laneLabel(host,cfg.top+7,cfg.label,cfg.icon,cfg.color)});
    list.forEach(event=>{const scope=eventScope(event),cfg=configs[scope],x=xFor((event.start+event.end)/2,w),dot=document.createElement('a'),size=event.importance>=5?11:event.importance===4?9:7;dot.className='event-dot';dot.href=event.wiki;dot.target='_blank';dot.rel='noopener noreferrer';dot.dataset.kind='event';dot.dataset.id=event.id;dot.style.cssText=`left:${x}px;top:${cfg.axis}px;width:${size}px;height:${size}px;--event:${cfg.color}`;dot.onmouseenter=e=>showTip(e,event,event.display,event.summary);dot.onmousemove=moveTip;dot.onmouseleave=hideTip;host.appendChild(dot)});
    const threshold=span()>600?5:span()>300?4:3;
    Object.entries(configs).forEach(([scope,cfg])=>{
      const rowCount=3,cardH=36,rowTop=[cfg.top+43,cfg.top+82,cfg.top+121],occupied=Array.from({length:rowCount},()=>[]);
      list.filter(e=>eventScope(e)===scope&&e.importance>=threshold).sort((a,b)=>b.importance-a.importance||a.start-b.start).forEach(event=>{
        const x=xFor((event.start+event.end)/2,w),width=clamp(80+event.title.length*4.4,118,event.importance>=5?210:176),left=clamp(x-width/2,44,w-width-18),interval={left,right:left+width};let row=-1;
        for(let i=0;i<rowCount;i++)if(!occupied[i].some(o=>overlaps(interval,o))){row=i;break}
        if(row<0)return;occupied[row].push(interval);const top=rowTop[row];if(top+cardH>cfg.axis-4)return;
        const card=document.createElement('a');card.className=`event-card scope-${scope}`;card.href=event.wiki;card.target='_blank';card.rel='noopener noreferrer';card.dataset.kind='event';card.dataset.id=event.id;card.style.cssText=`left:${left}px;top:${top}px;width:${width}px;--event:${cfg.color}`;card.innerHTML=`<span class="event-image"></span><span class="event-text"><b>${event.title}</b><time>${event.display}</time></span>`;wikiImage(event,card.querySelector('.event-image'),event.title);card.onmouseenter=e=>showTip(e,event,event.display,event.summary);card.onmousemove=moveTip;card.onmouseleave=hideTip;host.appendChild(card);
        const stem=document.createElement('i');stem.className='event-stem';stem.style.cssText=`left:${x}px;top:${top+cardH}px;height:${Math.max(1,cfg.axis-top-cardH)}px;--event:${cfg.color}`;host.insertBefore(stem,card);
      });
    });
  };

  renderPeriods=function(w){
    const host=document.getElementById('periodLayer');host.innerHTML='';
    const visible=DATA.periods.filter(p=>p.scope==='czech'&&p.end>=viewStart&&p.start<=viewEnd&&active.has('czech-periods')).sort((a,b)=>a.start-b.start);
    visible.forEach(p=>{
      const x1=clamp(xFor(Math.max(p.start,viewStart),w),2,w-2),x2=clamp(xFor(Math.min(p.end,viewEnd),w),2,w-2),width=Math.max(4,x2-x1),seg=document.createElement('div');seg.className='period-segment';seg.style.cssText=`left:${x1}px;width:${width}px;--period:${p.color}`;host.appendChild(seg);
      if(width>72){const a=document.createElement('a');a.className='period-label';a.href=p.wiki;a.target='_blank';a.rel='noopener noreferrer';a.dataset.kind='period';a.dataset.id=p.id;a.style.cssText=`left:${x1}px;width:${width}px;--period:${p.color}`;a.innerHTML=`<b>${p.title}</b>`;a.onmouseenter=e=>showTip(e,p,`${p.start}–${p.end}`,'Historické období');a.onmousemove=moveTip;a.onmouseleave=hideTip;host.appendChild(a)}
    });
  };

  const oldRender=render;
  render=function(){oldRender();requestAnimationFrame(()=>{updateCrosshair(crosshairRatio);const label=document.getElementById('rangeButtonLabel');if(label)label.textContent=`${Math.round(viewStart)}–${Math.round(viewEnd)}`})};
  window.addEventListener('resize',()=>requestAnimationFrame(()=>updateCrosshair(crosshairRatio)));
  requestAnimationFrame(()=>{relabelFilters();render();updateCrosshair(.5)});
})();
