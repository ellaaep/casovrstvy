(() => {
  'use strict';

  document.title='Časovrstvy';
  const heading=document.querySelector('.heading h1');if(heading)heading.textContent='Časovrstvy';

  const CURRENT=Math.max(2026,typeof ALL_END==='number'?ALL_END:2026);
  const curatedPeriods=[
    {id:'v27-habsburg',title:'Habsburská monarchie',start:1526,end:1804,color:'#6c96d8',scope:'czech',row:'state',wikiTitle:'Habsburská monarchie',wiki:'https://cs.wikipedia.org/wiki/Habsbursk%C3%A1_monarchie'},
    {id:'v27-national-revival',title:'Národní obrození',start:1775,end:1850,color:'#55b89b',scope:'czech',row:'movement',wikiTitle:'České národní obrození',wiki:'https://cs.wikipedia.org/wiki/%C4%8Cesk%C3%A9_n%C3%A1rodn%C3%AD_obrozen%C3%AD'},
    {id:'v27-austrian-empire',title:'Rakouské císařství',start:1804,end:1867,color:'#8a72c9',scope:'czech',row:'state',wikiTitle:'Rakouské císařství',wiki:'https://cs.wikipedia.org/wiki/Rakousk%C3%A9_c%C3%ADsa%C5%99stv%C3%AD'},
    {id:'v27-revolution-1848',title:'Revoluční rok 1848',start:1848,end:1849,color:'#e98272',scope:'czech',row:'movement',wikiTitle:'Revoluce v Rakouském císařství 1848–1849',wiki:'https://cs.wikipedia.org/wiki/Revoluce_v_Rakousk%C3%A9m_c%C3%ADsa%C5%99stv%C3%AD_1848%E2%80%931849'},
    {id:'v27-bach',title:'Bachův absolutismus',start:1849,end:1859,color:'#a89572',scope:'czech',row:'movement',wikiTitle:'Bachův absolutismus',wiki:'https://cs.wikipedia.org/wiki/Bach%C5%AFv_absolutismus'},
    {id:'v27-austria-hungary',title:'Rakousko-Uhersko',start:1867,end:1918,color:'#efc84c',scope:'czech',row:'state',wikiTitle:'Rakousko-Uhersko',wiki:'https://cs.wikipedia.org/wiki/Rakousko-Uhersko'},
    {id:'v27-first-republic',title:'První republika',start:1918,end:1938,color:'#8fc1ee',scope:'czech',row:'state',wikiTitle:'První republika',wiki:'https://cs.wikipedia.org/wiki/Prvn%C3%AD_%C4%8Ceskoslovensk%C3%A1_republika'},
    {id:'v27-second-republic',title:'Druhá republika',start:1938,end:1939,color:'#d99a8f',scope:'czech',row:'state',wikiTitle:'Druhá republika',wiki:'https://cs.wikipedia.org/wiki/Druh%C3%A1_%C4%8Ceskoslovensk%C3%A1_republika'},
    {id:'v27-protectorate',title:'Protektorát Čechy a Morava',start:1939,end:1945,color:'#c6a5df',scope:'czech',row:'state',wikiTitle:'Protektorát Čechy a Morava',wiki:'https://cs.wikipedia.org/wiki/Protektor%C3%A1t_%C4%8Cechy_a_Morava'},
    {id:'v27-postwar',title:'Poválečné Československo',start:1945,end:1948,color:'#8fc8ab',scope:'czech',row:'state',wikiTitle:'Třetí Československá republika',wiki:'https://cs.wikipedia.org/wiki/T%C5%99et%C3%AD_%C4%8Ceskoslovensk%C3%A1_republika'},
    {id:'v27-communism',title:'Komunistické Československo',start:1948,end:1989,color:'#e79ab0',scope:'czech',row:'state',wikiTitle:'Komunistický režim v Československu',wiki:'https://cs.wikipedia.org/wiki/Komunistick%C3%BD_re%C5%BEim_v_%C4%8Ceskoslovensku'},
    {id:'v27-prague-spring-normalization',title:'Pražské jaro a normalizace',start:1968,end:1989,color:'#ad96cf',scope:'czech',row:'movement',wikiTitle:'Pražské jaro',wiki:'https://cs.wikipedia.org/wiki/Pra%C5%BEsk%C3%A9_jaro'},
    {id:'v27-csfr',title:'ČSFR a rozdělení Československa',start:1989,end:1992,color:'#d5c3f2',scope:'czech',row:'state',wikiTitle:'Česká a Slovenská Federativní Republika',wiki:'https://cs.wikipedia.org/wiki/%C4%8Cesk%C3%A1_a_Slovensk%C3%A1_Federativn%C3%AD_Republika'},
    {id:'v27-czech-republic',title:'Česká republika',start:1993,end:CURRENT,color:'#9bd3ae',scope:'czech',row:'state',wikiTitle:'Česko',wiki:'https://cs.wikipedia.org/wiki/%C4%8Cesko'}
  ].map(p=>({...p,image:null}));
  curatedPeriods.forEach(p=>{if(!DATA.periods.some(x=>x.id===p.id))DATA.periods.push(p)});

  if(!DATA.events.some(e=>/revoluční rok 1848/i.test(e.title))){
    DATA.events.push({id:'v27-event-1848',title:'Revoluční rok 1848 v českých zemích',start:1848,end:1848,display:'1848',scope:'czech',category:'politics',importance:5,summary:'Revoluční události roku 1848 přinesly zrušení poddanství, politické požadavky a výrazné posílení českého národního hnutí.',wikiTitle:'Revoluce v Rakouském císařství 1848–1849',wiki:'https://cs.wikipedia.org/wiki/Revoluce_v_Rakousk%C3%A9m_c%C3%ADsa%C5%99stv%C3%AD_1848%E2%80%931849',image:null});
  }

  const imageCache=new Map(),pending=new Map();
  const normalizeTitle=item=>{
    if(item.wikiTitle)return item.wikiTitle;
    try{
      const u=new URL(item.wiki||'',location.href),search=u.searchParams.get('search');
      if(search)return search;
      const marker='/wiki/';const i=u.pathname.indexOf(marker);if(i>=0)return decodeURIComponent(u.pathname.slice(i+marker.length)).replace(/_/g,' ');
    }catch(_){ }
    return item.title||item.name||'';
  };
  const summary=async(title,lang)=>{
    try{
      const slug=encodeURIComponent(String(title).trim().replace(/\s+/g,'_'));
      const r=await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${slug}`,{mode:'cors',credentials:'omit',cache:'force-cache',headers:{accept:'application/json'}});
      if(!r.ok)return null;const j=await r.json();
      return {image:j.thumbnail?.source||j.originalimage?.source,url:j.content_urls?.desktop?.page,title:j.title,extract:j.extract,qid:j.wikibase_item};
    }catch(_){return null}
  };
  const search=async(title,lang)=>{
    try{
      const u=new URL(`https://${lang}.wikipedia.org/w/api.php`);
      const params={action:'query',generator:'search',gsrsearch:title,gsrnamespace:'0',gsrlimit:'6',prop:'pageimages|info|pageprops|extracts',inprop:'url',piprop:'thumbnail|original',pilicense:'any',pithumbsize:'800',exintro:'1',explaintext:'1',exsentences:'4',format:'json',formatversion:'2',origin:'*'};
      Object.entries(params).forEach(([k,v])=>u.searchParams.set(k,v));
      const r=await fetch(u,{mode:'cors',credentials:'omit',cache:'force-cache'});if(!r.ok)return null;
      const j=await r.json(),pages=j.query?.pages||[],p=pages.find(x=>x.thumbnail?.source||x.original?.source)||pages[0];
      return p?{image:p.thumbnail?.source||p.original?.source,url:p.fullurl,title:p.title,extract:p.extract,qid:p.pageprops?.wikibase_item}:null;
    }catch(_){return null}
  };
  const wikidata=async qid=>{
    if(!qid)return null;
    try{
      const u=new URL('https://www.wikidata.org/w/api.php');Object.entries({action:'wbgetclaims',entity:qid,property:'P18',format:'json',origin:'*'}).forEach(([k,v])=>u.searchParams.set(k,v));
      const r=await fetch(u,{mode:'cors',credentials:'omit',cache:'force-cache'});if(!r.ok)return null;const j=await r.json(),file=j.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
      return file?`https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=900`:null;
    }catch(_){return null}
  };
  const resolveMeta=item=>{
    const key=normalizeTitle(item);
    if(imageCache.has(key))return Promise.resolve(imageCache.get(key));
    if(pending.has(key))return pending.get(key);
    const promise=(async()=>{
      let result={url:item.wiki,title:key,image:item.image||null};
      if(!result.image){for(const lang of ['cs','en']){const x=await summary(key,lang);if(x){result={...result,...x,url:x.url||result.url};if(result.image)break}}}
      if(!result.image){for(const lang of ['cs','en']){const x=await search(key,lang);if(x){result={...result,...x,url:x.url||result.url};if(result.image)break}}}
      if(!result.image&&result.qid)result.image=await wikidata(result.qid);
      imageCache.set(key,result);return result;
    })().finally(()=>pending.delete(key));
    pending.set(key,promise);return promise;
  };
  window.fetchWiki=(item,cb)=>resolveMeta(item).then(cb).catch(()=>cb({url:item.wiki}));
  window.fetchWikiExtract=async item=>{try{return await resolveMeta(item)}catch(_){return null}};
  window.wikiImage=(item,host,alt)=>{
    if(!host)return;
    host.replaceChildren();host.classList.remove('wiki-v27-loaded','wiki-v27-failed');host.classList.add('wiki-v27-loading');
    const fallback=document.createElement('span');fallback.textContent=(item.title||item.name||'?').trim().slice(0,1);host.appendChild(fallback);
    resolveMeta(item).then(meta=>{
      const anchor=host.closest('a');if(anchor&&meta?.url)anchor.href=meta.url;
      if(!meta?.image){host.classList.remove('wiki-v27-loading');host.classList.add('wiki-v27-failed');return}
      const img=new Image();img.alt=alt||item.title||item.name||'';img.referrerPolicy='no-referrer';img.decoding='async';img.loading='eager';
      img.onload=()=>{if(host.isConnected){host.replaceChildren(img);host.classList.remove('wiki-v27-loading','wiki-v27-failed');host.classList.add('wiki-v27-loaded')}};
      img.onerror=()=>{host.classList.remove('wiki-v27-loading');host.classList.add('wiki-v27-failed')};img.src=meta.image;
    }).catch(()=>{host.classList.remove('wiki-v27-loading');host.classList.add('wiki-v27-failed')});
  };

  const timeline=document.getElementById('timeline');
  const eraContext=document.createElement('div');eraContext.className='v27-era-context';timeline.appendChild(eraContext);
  const updateEraContext=(ratio=.5)=>{
    const x=Math.max(0,Math.min(1,ratio))*timeline.clientWidth,year=Math.round(viewStart+(viewEnd-viewStart)*Math.max(0,Math.min(1,ratio)));
    const activeEras=curatedPeriods.filter(p=>p.start<=year&&p.end>=year).sort((a,b)=>(a.row==='state'?0:1)-(b.row==='state'?0:1));
    eraContext.style.left=x+'px';eraContext.textContent=activeEras.length?activeEras.slice(0,2).map(p=>p.title).join(' · '):`Rok ${year}`;
  };
  timeline.addEventListener('pointermove',e=>{if(e.target.closest('button,input,.timeline-scrollbar,.info-panel,.range-popover'))return;const r=timeline.getBoundingClientRect();updateEraContext((e.clientX-r.left)/r.width)});

  renderPeriods=function(w){
    const host=document.getElementById('periodLayer');host.innerHTML='';
    if(!active.has('czech-periods'))return;
    const h=host.clientHeight||80,rowTop={state:5,movement:42};
    curatedPeriods.filter(p=>p.end>=viewStart&&p.start<=viewEnd).sort((a,b)=>a.start-b.start).forEach(p=>{
      const x1=clamp(xFor(Math.max(p.start,viewStart),w),2,w-2),x2=clamp(xFor(Math.min(p.end,viewEnd),w),2,w-2),width=Math.max(0,x2-x1);
      if(width<34)return;
      const top=rowTop[p.row]??5;if(top+32>h)return;
      const a=document.createElement('a');a.className='v27-era'+(width<132?' compact':'');a.href=p.wiki;a.target='_blank';a.rel='noopener noreferrer';a.dataset.kind='period';a.dataset.id=p.id;a.style.cssText=`left:${x1+2}px;top:${top}px;width:${Math.max(30,width-4)}px;--era:${p.color}`;
      a.innerHTML=`<span class="v27-era-thumb"></span><b>${p.title}</b><time>${p.start}–${p.end}</time>`;wikiImage(p,a.querySelector('.v27-era-thumb'),p.title);
      a.onmouseenter=e=>showTip(e,p,`${p.start}–${p.end}`,'Historické období');a.onmousemove=moveTip;a.onmouseleave=hideTip;host.appendChild(a);
    });
  };

  const previousRender=render;
  render=function(){previousRender();requestAnimationFrame(()=>{
    const h=document.querySelector('.heading h1');if(h)h.textContent='Časovrstvy';
    const range=document.getElementById('rangeButtonLabel');if(range)range.textContent=`${Math.round(viewStart)}–${Math.round(viewEnd)}`;
    updateEraContext(.5);
  })};

  requestAnimationFrame(()=>{render();updateEraContext(.5)});
})();
