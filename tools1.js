/* ============================================================
   ANIME ZAKI TOOLS — tools1.js  (tools 1..30 + shared builders)
   ============================================================ */

/* ---------- shared: paginated result list ---------- */
function makeList(mount,{kind='anime',rank=false,emptyMsg}={}){
  const out=h('div'); mount.appendChild(out);
  let params=null;
  const go=(page=1,p)=>{
    if(p) params=p;
    if(!params) return;
    withBusy(out,async r=>{
      const j=await japi('/'+kind,Object.assign({},params,{page}));
      const items=(j.data||[]).filter(Boolean);
      clear(r);
      if(j.notfound||!items.length){ r.appendChild(emptyBox(emptyMsg)); return; }
      const g=h('div.results');
      items.forEach(m=>g.appendChild(mediaCard(m,{kind,rank,snip:true})));
      r.appendChild(g);
      const pg=pager(j.pagination,np=>go(np)); if(pg) r.appendChild(pg);
    });
  };
  return {out,go};
}

/* ---------- shared: genres ---------- */
let GENRES_CACHE=null;
async function getGenres(){
  if(GENRES_CACHE) return GENRES_CACHE;
  const j=await japi('/genres/anime');
  GENRES_CACHE=(j.data||[]).filter(x=>x.mal_id&&x.name).sort((a,b)=>(b.count||0)-(a.count||0));
  return GENRES_CACHE;
}

/* ---------- shared: dub index ---------- */
let _dubMap=null;
function dubMap(){
  if(!_dubMap){ _dubMap={}; for(const k in DUBS){ const nk=norm(k); if(nk) _dubMap[nk]=DUBS[k]; } }
  return _dubMap;
}
function matchDub(title){
  const M=dubMap();
  const n=norm(title); if(!n||n.length<3) return null;
  if(M[n]) return M[n];
  /* strip season/part/cour/arc/movie markers + years so "Season 3 Part 2" hits the base show */
  const strip=s=>s.replace(/\b(season|part|cour|chapter|arc|movie|ova)\b \d+\b/g,' ')
                  .replace(/\bfinal season\b/g,' ')
                  .replace(/\bs\d+\b/g,' ')
                  .replace(/\b(19|20)\d\d\b/g,' ')
                  .replace(/[^a-z0-9 ]+/g,' ')
                  .replace(/\s+/g,' ').trim();
  const b=strip(n)||n;
  if(M[b]) return M[b];
  /* fuzzy: word-boundary prefix either way, or key contained in the query — longest match wins */
  let best=null,bestLen=0;
  for(const k in M){
    const kb=strip(k);
    const hit=kb&&kb.length>=3&&(
      b.startsWith(kb+' ')||kb.startsWith(b+' ')||
      b.endsWith(' '+kb)||kb.endsWith(' '+b)||
      (kb.length>=9&&b.indexOf(kb)>=0));
    if(hit&&kb.length>bestLen){ best=M[k]; bestLen=kb.length; }
  }
  return best;
}

/* ---------- shared: OP/ED lookup (AnimeThemes API, official video links) ---------- */
async function fetchThemes(animeTitle){
  const found={songs:[],src:null};
  const get=async u=>{ const r=await xfetch(u,{cache:'no-store'},8000); if(!r.ok) throw new Error('status '+r.status); return r.json(); };
  try{
    /* AnimeThemes retired filter[search] — q= + page[size] is the live shape */
    const j=await get('https://api.animethemes.moe/anime?q='+encodeURIComponent(animeTitle)+'&page[size]=6');
    const list=(Array.isArray(j.anime)?j.anime:[]).slice(0,2);
    /* both detail lookups in parallel — halves the wait */
    const details=await Promise.all(list.map(async a=>{
      try{
        /* detail responses are an object (not an array); the include chain brings
           entries + videos + song in one shot, with a simpler retry if it 422s */
        let j2=await get('https://api.animethemes.moe/anime/'+(a.slug||a.id)+'?include=animethemes.animethemeentries.videos,animethemes.song');
        if(j2.errors) j2=await get('https://api.animethemes.moe/anime/'+(a.slug||a.id)+'?include=animethemes.animethemeentries.videos');
        const an=Array.isArray(j2.anime)?j2.anime[0]:j2.anime;
        return {a,th:(an&&an.animethemes)||[]};
      }catch(e){ return {a,th:[]}; }
    }));
    for(const {a,th} of details){
      th.slice(0,8).forEach(t=>{
        const artists=((t.song&&t.song.artists)||[]).map(x=>x.name).filter(Boolean);
        let links=[];
        (t.animethemeentries||[]).forEach(e=>{ (e.videos||[e.video]).filter(Boolean).forEach(v=>{ if(v&&v.link) links.push(v.link); }); });
        found.songs.push({name:(t.song&&t.song.name)||((t.type||'OP/ED')+' — '+(a.name||'')),artist:artists.join(', '),type:t.type||'OP/ED',links:[...new Set(links)].slice(0,2),anime:a.name});
      });
    }
    if(found.songs.length) found.src='AnimeThemes (official PV links)';
  }catch(e){}
  if(!found.songs.length){
    SONGS.filter(s=>norm(s.an).includes(norm(animeTitle).slice(0,10))||norm(animeTitle).includes(norm(s.an).slice(0,10)))
      .forEach(s=>found.songs.push({name:s.t,artist:s.a,type:s.tag.toUpperCase(),links:[ytmLink(s)],anime:s.an}));
    if(found.songs.length) found.src='curated index';
  }
  return found;
}
const ytmLink = s=>'https://music.youtube.com/search?q='+encodeURIComponent(s.t+' '+s.a);
const spLink  = s=>'https://open.spotify.com/search/'+encodeURIComponent(s.t+' '+s.a);
const amLink  = s=>'https://music.apple.com/us/search?term='+encodeURIComponent(s.t+' '+s.a);
function songLinks(s){
  const q=encodeURIComponent((s.name||s.t)+' '+(s.artist||s.a||''));
  return h('div.row.tight',
    h('a.btn.small.gold',{href:'https://music.youtube.com/search?q='+q,target:'_blank',rel:'noopener',html:ico('play')+' YouTube Music'}),
    h('a.btn.small',{href:'https://open.spotify.com/search/'+q,target:'_blank',rel:'noopener'},'Spotify'),
    h('a.btn.small',{href:'https://music.apple.com/us/search?term='+q,target:'_blank',rel:'noopener'},'Apple Music')
  );
}

/* ---------- shared: canvas ---------- */
function mkCanvas(w,hh){
  const wrap=h('div.canvas-wrap');
  const c=h('canvas'); c.width=w; c.height=hh;
  wrap.appendChild(c);
  return {wrap,c,ctx:c.getContext('2d')};
}
function dlCanvas(c,name='anime-zaki.png'){
  try{ const a=document.createElement('a'); a.href=c.toDataURL('image/png'); a.download=name; a.click(); toast('⬇️ <b>PNG saved</b>'); }
  catch(e){ toast('⚠️ export blocked by the browser'); }
}
function randSeed(){ return Math.floor(Math.random()*1e9); }
function mulberry(seed){ return function(){ seed|=0; seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }

/* ============================================================
   1 — RANDOM ANIME GENERATOR
   ============================================================ */
TOOLS_IMPL['rand-anime']=(m)=>{
  m.appendChild(h('p.hint',{html:L({en:'Picks a random title from MyAnimeList. Roll until something surprises you.',ja:'MALからランダム抽選。驚くまで回してください。'})}));
  const out=h('div'); m.appendChild(out);
  const roll=()=>withBusy(out,async r=>{
    const pg=ri(1,60);
    const j=await japi('/anime',{order_by:'popularity',sort:'asc',limit:25,page:pg});
    const items=(j.data||[]).filter(Boolean);
    clear(r);
    if(!items.length){ r.appendChild(emptyBox()); return; }
    const a=pick(items);
    r.appendChild(h('div.panel',h('div.panel-title',L({en:'Your roll',ja:'抽選結果'})),mediaCard(a)));
    r.appendChild(h('div.row',btn('🎲 '+L(S.again),'primary',roll),
      btn('🎡 '+L({en:'Try the roulette instead',ja:'ルーレットで選ぶ'}),'',()=>openTool('roulette')),
      btn('⛩️ '+L({en:'Fortune version',ja:'おみくじ版'}),'',()=>openTool('omikuji'))));
  });
  roll();
};

/* ============================================================
   2 / 7 — SIMILAR ANIME & ANIME LIKE…
   ============================================================ */
function similarImpl(m,preset={}){
  const out=h('div'); m.appendChild(out);
  const render=(item)=>withBusy(out,async r=>{
    const j=await japi('/anime/'+item.mal_id+'/recommendations');
    const recs=(j.data||[]).map(x=>x.entry||x).filter(Boolean);
    clear(r);
    r.appendChild(h('div.panel',h('div.panel-title',L({en:'Because you liked',ja:'好きな作品：'})+' · '+item.title,
      h('span.badge.gold',{style:'margin-left:auto',html:'★ '+(item.score||'—')}))));
    if(!recs.length){ r.appendChild(emptyBox(L({en:'No recommendations indexed yet — try another title.',ja:'推薦が未登録です。別の作品でお試しください。'}),'🍥')); return; }
    const g=h('div.results');
    recs.slice(0,30).forEach(x=>{
      const card=h('article.acard');
      const img=x.images&&x.images.jpg&&x.images.jpg.image_url;
      if(img) card.appendChild(h('img.ac-thumb',{src:img,loading:'lazy',onerror(){this.style.visibility='hidden'}}));
      const acts=h('div.ac-actions');
      acts.appendChild(btnI('ℹ️',L(S.info),'',()=>window.open('https://myanimelist.net/anime/'+x.mal_id,'_blank','noopener')));
      acts.appendChild(btnI('＋ '+L(S.watch),'',()=>WL.add({mal_id:x.mal_id,title:x.title,images:{jpg:{image_url:img}},score:null})));
      acts.appendChild(btnI('⇄ '+L(S.similar),'',()=>render({mal_id:x.mal_id,title:x.title})));
      card.appendChild(h('div.ac-body',h('div.ac-title',x.title),h('div.ac-meta',(x.type||''),x.type?' · MAL':''),acts));
      g.appendChild(card);
    });
    r.appendChild(g);
    r.appendChild(h('div.row',btn('🔎 '+L({en:'Find another title',ja:'別の作品を探す'}),'',()=>searchHere()),
      btn('🔗 '+L(S.source),'gold',()=>window.open('https://myanimelist.net/anime/'+item.mal_id+'/recommendations','_blank','noopener'))));
  });
  function searchHere(){
    clear(out);
    out.appendChild(panel(L({en:'Which anime?',ja:'どのアニメ？'}),searchBox({initial:preset.q||'',onPick:a=>render(a)})));
  }
  if(preset.id||preset.q){
    if(preset.id) render({mal_id:preset.id,title:preset.q||L({en:'this title',ja:'この作品'})});
    else (async()=>{
      const j=await japi('/anime',{q:preset.q,limit:1,order_by:'members',sort:'desc'});
      const first=(j.data||[])[0];
      if(first) render(first); else searchHere();
    })().catch(()=>searchHere());
  } else searchHere();
}
TOOLS_IMPL['similar']=similarImpl;
TOOLS_IMPL['like']=similarImpl;

/* ============================================================
   3 — ANIME FINDER
   ============================================================ */
TOOLS_IMPL['finder']=(m,preset={})=>{
  const qIn=inp({value:preset.q||'',placeholder:L({en:'Title keyword…',ja:'タイトル…'})});
  const typeS=selEl([{v:'',t:L({en:'Any type',ja:'全形式'})},'tv','movie','ova','ona','special','music'],preset.type||'');
  const stS=selEl([{v:'',t:L({en:'Any status',ja:'全状態'})},{v:'airing',t:L({en:'Airing',ja:'放送中'})},{v:'complete',t:L({en:'Finished',ja:'完結'})},{v:'upcoming',t:L({en:'Upcoming',ja:'放送予定'})}],preset.status||'');
  const ordS=selEl([{v:'members',t:L({en:'Popularity',ja:'人気順'})},{v:'score',t:L({en:'Score',ja:'スコア順'})},{v:'start_date',t:L({en:'Newest',ja:'新着順'})}],preset.order_by||'members');
  const minIn=inp({type:'number',value:preset.min_score||'',placeholder:'0–10'});
  let genres=new Set(preset.genres||[]);
  const genreSlot=h('div'); const gChip=chipset([],{multi:true,onchange:v=>genres=new Set(v)});
  getGenres().then(gs=>{ const built=chipset(gs.map(x=>({t:x.name,v:x.mal_id,on:genres.has(x.mal_id)})),{multi:true,onchange:v=>genres=new Set(v)}); clear(genreSlot); genreSlot.appendChild(built.el); })
    .catch(()=>genreSlot.appendChild(emptyBox(L({en:'Genre list unavailable.',ja:'ジャンル一覧を取得できません。'}))));
  const list=makeList(m);
  const run=(page=1)=>list.go(page,{q:qIn.value.trim(),type:typeS.value,status:stS.value,order_by:ordS.value,min_score:minIn.value||undefined,genres:[...genres].join(',')||undefined,sort:'desc'});
  m.appendChild(panel(L({en:'Filters',ja:'フィルター'}),
    h('div.row',field(L({en:'Keyword',ja:'キーワード'}),qIn),field(L({en:'Type',ja:'形式'}),typeS),field(L({en:'Status',ja:'状態'}),stS),field(L({en:'Sort',ja:'並び'}),ordS),field(L({en:'Min score',ja:'最低スコア'}),minIn)),
    h('div',{style:'margin-top:10px'},h('label.label',L({en:'Genres',ja:'ジャンル'})),genreSlot),
    h('div.row',{style:'margin-top:12px'},btn('🔎 '+L(S.run),'primary',()=>run(1)),btn('🎲 '+L({en:'Surprise me',ja:'おまかせ'}),'',()=>{ const gs=getGenresSync(); if(gs.length) genres=new Set([pick(gs).mal_id]); run(1); }))
  ));
  run(1);
};
function getGenresSync(){ return GENRES_CACHE||[]; }

/* ============================================================
   4 — ANIME RECOMMENDER
   ============================================================ */
TOOLS_IMPL['recommender']=(m,preset={})=>{
  const state={genres:new Set(preset.genres||[])};
  const slot=h('div');
  const minIn=inp({type:'number',value:'7',placeholder:'7'});
  const typeS=selEl([{v:'',t:L({en:'Any type',ja:'全形式'})},'tv','movie','ova'],'');
  const list=makeList(m);
  const run=(page=1,shuffleRes=false)=>withBusy(list.out,async r=>{
    const j=await japi('/anime',{genres:[...state.genres].join(',')||undefined,type:typeS.value||undefined,min_score:minIn.value||undefined,order_by:'score',sort:'desc',page,limit:24});
    let items=(j.data||[]).filter(Boolean);
    if(shuffleRes) items=shuffle(items).slice(0,12);
    clear(r);
    if(!items.length){ r.appendChild(emptyBox(L({en:'Nothing matched — loosen the filters.',ja:'条件が厳しすぎます。'}),'🍥')); return; }
    const g=h('div.results');
    items.forEach(x=>g.appendChild(mediaCard(x,{snip:true})));
    r.appendChild(g);
    const pg=pager(j.pagination,np=>run(np)); if(pg) r.appendChild(pg);
  });
  getGenres().then(gs=>{
    const chip=chipset(gs.map(x=>({t:x.name+' ',v:x.mal_id,on:state.genres.has(x.mal_id)})),{multi:true,onchange:v=>state.genres=new Set(v)});
    clear(slot); slot.appendChild(chip.el);
  }).catch(()=>slot.appendChild(emptyBox()));
  m.appendChild(panel(L({en:'What are you in the mood for?',ja:'どんなジャンルが気分？'}),
    slot,
    h('div.row',{style:'margin-top:12px'},field(L({en:'Min score',ja:'最低スコア'}),minIn),field(L({en:'Type',ja:'形式'}),typeS)),
    h('div.row',{style:'margin-top:12px'},
      btn('🎯 '+L({en:'Recommend me',ja:'おすすめ！'}),'primary',()=>run(1)),
      btn('🎲 '+L({en:'Shuffle picks',ja:'シャッフル'}),'',()=>run(1,true)),
      btn('⛩️ '+L({en:'Omikuji style',ja:'おみくじ風'}),'',()=>openTool('omikuji')))
  ));
  run(1);
};

/* ============================================================
   5 — ANIME THEMES (OP/ED)
   ============================================================ */
TOOLS_IMPL['themes']=(m,preset={})=>{
  const out=h('div');
  m.appendChild(panel(L({en:'Find the OP / ED of any anime',ja:'任意のアニメのOP/EDを検索'}),
    searchBox({placeholder:L({en:'Anime title…',ja:'アニメ名…'}),onPick:a=>show(a)})));
  m.appendChild(out);
  function show(a){
    if(!a||!a.mal_id){ clear(out); out.appendChild(emptyBox(L({en:'Search again above to summon songs.',ja:'上から検索して曲を召喚。'}),'🔎')); return; }
    withBusy(out,async r=>{
      const th=await fetchThemes(a.title||'');
      clear(r);
      const head=h('div.row');
      const img=a.images&&a.images.jpg&&(a.images.jpg.large_image_url||a.images.jpg.image_url);
      if(img) head.appendChild(h('img.zoomable',{src:img,loading:'lazy',style:'width:52px;height:74px;object-fit:cover;border-radius:6px',onerror(){this.style.visibility='hidden'}}));
      head.appendChild(h('div.grow',h('div.panel-title',a.title||'—'),
        h('span.badge.gold',{html:'★ '+(a.score||'—')})));
      r.appendChild(h('div.panel',head));
      if(!th.songs.length){
        r.appendChild(emptyBox(L({en:'No songs found in the free indexes for this title. Open the official page below.',ja:'無料インデックスに曲が見つかりません。下の公式ページを開いてください。'}),'🎼'));
      } else {
        r.appendChild(h('p.hint',{html:ico('play')+' '+L({en:'Press ▶ on any row — the official video plays right here in the tool.',ja:'行の▶を押すと公式動画がツール内で再生されます。'})}));
        th.songs.forEach(s=>{
          r.appendChild(h('div.track',
            btnI('▶',L({en:'Play in tool',ja:'ツール内で再生'}),'',()=>playSong({t:s.name,a:s.artist,an:s.anime,links:s.links,art:img},out)),
            h('div',h('div.t',s.name),h('div.a',(s.artist||L({en:'artist unknown',ja:'アーティスト不明'}))+' · '+s.anime)),
            h('span.badge.gold',{style:'margin-left:auto',html:s.type}),
            songLinks(s)));
        });
        r.appendChild(h('p.hint',{html:'◈ '+L({en:'Source:',ja:'ソース：'})+' '+th.src+' · '+L({en:'row buttons play inline; the service buttons open official search results (never pirated audio).',ja:'行ボタンはインライン再生。サービスボタンは公式検索結果を開きます（違法音源は扱いません）。'})}));
      }
      r.appendChild(h('div.row',btn('🔗 '+L({en:'Official theme list on MAL',ja:'MAL公式の主題歌ページ'}),'gold',()=>window.open('https://myanimelist.net/anime/'+a.mal_id+'/song','_blank','noopener')),
        btn('🔎 '+L({en:'Another anime',ja:'別のアニメ'}),'',()=>{ clear(out); out.appendChild(emptyBox(L({en:'Search above for another title.','ja':'上でもう一度検索してください。'}),'🔎')); })));
    });
  }
  if(preset.q){
    (async()=>{ try{ const j=await japi('/anime',{q:preset.q,limit:1,order_by:'members',sort:'desc'}); const first=(j.data||[])[0]; if(first) show(first); }catch(e){} })();
  }
};

/* ============================================================
   6 — DUB CHECKER
   ============================================================ */
TOOLS_IMPL['dub']=(m,preset={})=>{
  const out=h('div');
  m.appendChild(panel(L({en:'Does it have an official dub?',ja:'吹き替えはある？'}),
    h('p.hint',{html:L({en:'Checks our community index of officially dubbed titles (language codes: EN ES FR IT DE PT AR RU PL TR HI).',ja:'公式吹き替えのコミュニティ索引を照合します（EN ES FR IT DE PT AR RU PL TR HI）。'})}),
    searchBox({initial:preset.q||'',placeholder:L({en:'Anime title…',ja:'アニメ名…'}),onPick:a=>check(a)})));
  m.appendChild(out);
  function check(a){
    clear(out);
    const langs=matchDub(a.title)||matchDub(a.title_english||'')||matchDub((a.title||'').split(':')[0]);
    const box=h('div.panel');
    box.appendChild(h('div.panel-title',a.title));
    if(langs){
      box.appendChild(h('div.row',h('span.badge.green',{html:labelHTML('✅ '+L({en:'Official dub found',ja:'公式吹き替えあり'}))})));
      box.appendChild(h('div.chipset',{style:'margin-top:8px'},...langs.split(' ').map(l=>h('span.tchip.on',l))));
      box.appendChild(h('p.hint',L({en:'Verified in our index — availability varies by region.',ja:'索引で確認済み。配信状況は地域により異なります。'})));
    } else {
      box.appendChild(h('div.row',h('span.badge.gold',{html:labelHTML('❓ '+L({en:'Not in our index yet',ja:'索引に未収録（不明）'}))})));
      box.appendChild(h('p.hint',L({en:'Our index covers popular titles only and we never guess — try a different spelling (romaji works), or check the legal streaming directory below.',ja:'索引は人気作品中心で推測はしません — 別の表記（ローマ字OK）を試すか、下の正規配信ディレクトリでご確認ください。'})));
    }
    box.appendChild(h('div.row',{style:'margin-top:10px'},
      btn('📺 '+L({en:'Where to watch (legal)',ja:'正規配信先'}),'primary',()=>openTool('watch',{q:a.title,id:a.mal_id})),
      btn('🗣️ '+L({en:'Browse dubbed list',ja:'吹き替え一覧'}),'',()=>openTool('dub-anime')),
      btn('🔗 '+L(S.source),'',()=>window.open('https://myanimelist.net/anime/'+a.mal_id,'_blank','noopener'))));
    out.appendChild(box);
  }
  if(preset.q) out.appendChild(h('p.hint',{html:L({en:'Title auto-searched above — press <b>Pick</b> to check it.',ja:'上で自動検索済み。「選択」を押して確認してください。'})}));
};

/* ============================================================
   8 — ANIME SONG SEARCH
   ============================================================ */
TOOLS_IMPL['song-search']=(m)=>{
  const stage=h('div');                       /* one inline player for the whole tool */
  const qIn=inp({placeholder:L({en:'Song, artist or anime…',ja:'曲名・アーティスト・アニメ名…'}),autocomplete:'off'});
  const local=h('div');
  const paint=()=>{
    const q=norm(qIn.value);
    const hits=SONGS.filter(s=>!q||norm(s.t+' '+s.a+' '+s.an).includes(q));
    clear(local);
    if(!hits.length){ local.appendChild(emptyBox(L({en:'No song matches that.',ja:'該当する曲がありません。'}),'🎶')); return; }
    hits.slice(0,40).forEach(s=>local.appendChild(h('div.track',
      btnI('▶',L({en:'Play in tool',ja:'ツール内で再生'}),'',()=>playSong(s,stage)),
      h('div',h('div.t',s.t),h('div.a',s.a+' · '+s.an)),
      h('span.badge.'+(s.tag==='op'?'red':s.tag==='ed'?'green':'gold'),{style:'margin-left:auto',html:s.tag.toUpperCase()}),
      songLinks(s))));
  };
  qIn.addEventListener('input',paint);
  m.appendChild(stage);
  m.appendChild(panel(L({en:'Song index (instant)',ja:'楽曲インデックス（即時）'}),
    h('div.row',qIn), h('div',{style:'margin-top:10px'},local)));
  const apiOut=h('div');
  m.appendChild(panel(L({en:'Official OP/ED lookup by anime',ja:'作品名から公式OP/EDを検索'}),
    searchBox({placeholder:L({en:'Anime title…',ja:'アニメ名…'}),onPick:a=>withBusy(apiOut,async r=>{
      const th=await fetchThemes(a.title); clear(r);
      if(!th.songs.length){ r.appendChild(emptyBox(L({en:'Nothing found in free indexes — try the song index above.',ja:'無料索引に見つかりません。上のインデックスをどうぞ。'}),'🎼')); return; }
      r.appendChild(h('p.hint',{html:ico('play')+' '+L({en:'▶ plays the official video inside this tool.',ja:'▶で公式動画をこのツール内で再生。'})}));
      th.songs.forEach(s=>r.appendChild(h('div.track',
        btnI('▶',L({en:'Play in tool',ja:'ツール内で再生'}),'',()=>playSong({t:s.name,a:s.artist,an:s.anime,links:s.links},stage)),
        h('div',h('div.t',s.name),h('div.a',(s.artist||'')+' · '+s.anime)),
        h('span.badge.gold',{style:'margin-left:auto',html:s.type}),songLinks(s))));
    })}),apiOut));
  paint();
};

/* ============================================================
   9 — ANIME NEWS
   ============================================================ */
TOOLS_IMPL['news']=(m,preset={})=>{
  const out=h('div');
  m.appendChild(panel(L({en:'News feed for a title',ja:'作品ごとのニュース'}),
    searchBox({initial:preset.q||'',placeholder:L({en:'Anime title…',ja:'アニメ名…'}),onPick:a=>load(a)})));
  m.appendChild(out);
  function load(a){
    withBusy(out,async r=>{
      const j=await japi('/anime/'+a.mal_id+'/news');
      const items=(j.data||[]).filter(Boolean);
      clear(r);
      r.appendChild(h('div.panel',h('div.panel-title',a.title)));
      if(!items.length){
        r.appendChild(emptyBox(L({en:'No news indexed for this title yet — open the official news page.',ja:'この作品のニュースは未収録です。公式ニュースページへ。'}),'📰'));
      } else {
        items.slice(0,20).forEach(n=>{
          const url=n.url||('https://myanimelist.net/anime/'+a.mal_id+'/news');
          r.appendChild(h('div.track',
            h('div',h('div.t',n.title||L({en:'Untitled',ja:'無題'})),
              h('div.a',(n.date||'')+(n.author?' · '+n.author:'')),
              n.content?h('div.a',{style:'margin-top:4px'},String(n.content).replace(/<[^>]+>/g,'').slice(0,180)+'…'):null),
            h('a.btn.small.gold',{style:'margin-left:auto',href:url,target:'_blank',rel:'noopener'},L({en:'Read',ja:'読む'}))));
        });
      }
      r.appendChild(h('div.row',btn('🔗 '+L({en:'Official MAL news page',ja:'MAL公式ニュース'}),'',()=>window.open('https://myanimelist.net/anime/'+a.mal_id+'/news','_blank','noopener')),
        btn('🔎 '+L({en:'Another title',ja:'別の作品'}),'',()=>clear(out))));
    });
  }
};

/* ============================================================
   10 — ANIME TIER LIST
   ============================================================ */
TOOLS_IMPL['tierlist']=(m)=>{
  const TIERS=[{k:'S',c:'#d8432b'},{k:'A',c:'#e07b28'},{k:'B',c:'#c9a227'},{k:'C',c:'#4f9d5d'},{k:'D',c:'#3a6ea8'},{k:'F',c:'#5a5f6b'}];
  const KEY='azt_tier';
  let data=store.get(KEY,null);
  if(!data||!Array.isArray(data)) data=TIERS.map(t=>({k:t.k,items:[]}));
  const save=()=>store.set(KEY,data);
  const rows=h('div.tier-rows');
  let dragged=null;
  function paint(){
    clear(rows);
    TIERS.forEach((T,i)=>{
      const bucket=data[i];
      const row=h('div.tier-row');
      row.appendChild(h('div.tier-lbl',{style:'background:'+T.c},T.k));
      const items=h('div.tier-items');
      bucket.items.forEach((it,j)=>{
        const el=h('div.tier-item',{draggable:'true'});
        if(it.img) el.appendChild(h('img',{src:it.img,onerror(){this.style.visibility='hidden'}}));
        el.appendChild(h('span',it.t));
        el.appendChild(h('span.x',{title:L({en:'Remove',ja:'削除'}),'aria-label':'remove',onclick:e=>{e.stopPropagation(); bucket.items.splice(j,1); save(); paint(); }}));
        el.addEventListener('dragstart',e=>{ dragged={i,j}; e.dataTransfer.effectAllowed='move'; });
        el.addEventListener('dragend',()=>{ dragged=null; rows.querySelectorAll('.tier-items').forEach(x=>x.classList.remove('over')); });
        items.appendChild(el);
      });
      items.addEventListener('dragover',e=>{ e.preventDefault(); items.classList.add('over'); });
      items.addEventListener('dragleave',()=>items.classList.remove('over'));
      items.addEventListener('drop',e=>{ e.preventDefault(); items.classList.remove('over');
        if(dragged){ const [it]=data[dragged.i].items.splice(dragged.j,1); bucket.items.push(it); save(); paint(); } });
      row.appendChild(items);
      rows.appendChild(row);
    });
  }
  const addBtn=btn('＋ '+L({en:'Add anime',ja:'アニメを追加'}),'primary',()=>quickPick({title:L({en:'Add to tier list',ja:'Tierに追加'}),onPick:a=>{
    let target=data.findIndex(d=>d.k==='B'); if(target<0) target=0;
    data[target].items.push({id:a.mal_id,t:a.title,img:a.images&&a.images.jpg&&a.images.jpg.image_url}); save(); paint();
    toast('🏅 <b>'+esc(a.title)+'</b> → B');
  }}));
  const loadTop=btn('🏆 '+L({en:'Load top 10',ja:'TOP10を読込'}),'',()=>withBusy(rows,async r=>{
    const j=await japi('/top/anime',{limit:10});
    (j.data||[]).forEach((a,i)=>{ const t=data[Math.min(i<3?i:i<6?3:i<9?4:5,5)]; t.items.push({id:a.mal_id,t:a.title,img:a.images&&a.images.jpg&&a.images.jpg.image_url}); });
    save(); paint(); }));
  const exportBtn=btn('⬇️ '+L({en:'Export PNG',ja:'PNG書き出し'}),'gold',()=>{
    const W=900,rh=86,c=document.createElement('canvas'); c.width=W; c.height=40+TIERS.length*rh;
    const x=c.getContext('2d');
    x.fillStyle='#f5eeda'; x.fillRect(0,0,c.width,c.height);
    x.fillStyle='#15181f'; x.font='800 26px Georgia,serif'; x.fillText('Anime Zaki — Tier List',18,30);
    TIERS.forEach((T,i)=>{
      const y=40+i*rh;
      x.fillStyle=T.c; x.fillRect(10,y+6,64,rh-12);
      x.fillStyle='#fff'; x.font='800 34px Georgia,serif'; x.textAlign='center'; x.fillText(T.k,42,y+6+ (rh-12)/2+12); x.textAlign='left';
      x.strokeStyle='rgba(20,22,29,.35)'; x.lineWidth=2; x.strokeRect(84,y+6,W-96,rh-12);
      x.fillStyle='#15181f'; x.font='600 17px Helvetica,Arial,sans-serif';
      const items=data[i].items.map(it=>it.t);
      let cx=96,cy=y+6+28;
      items.forEach(t=>{
        const w=x.measureText(t).width+18;
        if(cx+w>W-10){ cx=96; cy+=0; }
        x.fillStyle='rgba(20,22,29,.08)'; x.fillRect(cx-6,cy-18,w,26);
        x.fillStyle='#15181f'; x.fillText(t,cx,cy); cx+=w+8;
        if(cy>y+6+rh-24){ cy=y+6+28; }
      });
    });
    dlCanvas(c,'anime-tier-list.png');
  });
  m.appendChild(h('div.row',addBtn,loadTop,exportBtn,
    btn('🗑️ '+L(S.clear),'danger',()=>{ data=TIERS.map(t=>({k:t.k,items:[]})); save(); paint(); })));
  m.appendChild(h('p.hint',{html:L({en:'Drag items between rows. Saved to your browser automatically.',ja:'行間でドラッグ移動可能。ブラウザに自動保存。'})}));
  m.appendChild(rows);
  paint();
};

/* ============================================================
   11 — PROFILE PICTURE MAKER
   ============================================================ */
/* ---------- shared: download a remote image (falls back to a new tab) ---------- */
async function dlRemote(url,name){
  try{
    const r=await fetch(url,{mode:'cors'}); if(!r.ok) throw new Error('http');
    const b=await r.blob();
    const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=name||'image.png'; a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),5000);
    toast(L({en:'⬇️ PNG saved',ja:'⬇️ PNG保存'}));
  }catch(e){ window.open(url,'_blank','noopener'); toast(L({en:'Opened in a new tab — right-click to save.',ja:'新しいタブで開きました — 右クリックで保存。'})); }
}
function charImg(ch){ const i=ch&&ch.images&&ch.images.jpg; return (i&&(i.large_image_url||i.image_url))||''; }

/* ============================================================
   11 — ANIME PROFILE PICTURE GENERATOR (name art + official PFPs)
   ============================================================ */
TOOLS_IMPL['pfp']=(m)=>{
  const bar=h('div.chipset');
  const prev=h('div');
  const root=h('div');
  const MODES=[
    {k:'name', i:'brush',   t:{en:'Name art',ja:'ネームアート'}},
    {k:'anime',i:'play',    t:{en:'Character from an anime',ja:'アニメのキャラ'}},
    {k:'manga',i:'bookOpen',t:{en:'Character from a manga',ja:'漫画のキャラ'}},
    {k:'find', i:'search',  t:{en:'Find a character',ja:'キャラ検索'}}
  ];
  const show=k=>{
    clear(prev); clear(root);
    [...bar.children].forEach(b=>b.classList.toggle('on',b.dataset.k===k));
    if(k==='name') nameArt(root);
    else if(k==='find') findMode(root);
    else seriesMode(root,k);
  };
  MODES.forEach(o=>{
    bar.appendChild(h('button.tchip'+(o.k==='name'?'.on':''),{type:'button','data-k':o.k,html:ico(o.i)+' '+esc(L(o.t)),onclick:()=>show(o.k)}));
  });

  /* --- shared full-size preview panel --- */
  const preview=(c,media)=>{
    clear(prev);
    const img=charImg(c);
    prev.appendChild(h('div.panel',
      h('div.panel-title',c.name||'—'),
      h('div.pfp-prev',
        img?h('img',{src:img,alt:c.name||'',onerror(){this.style.visibility='hidden'}}):null,
        h('div.pfp-meta',
          h('p.hint',{html:esc(media?((media.type||'')+' · '+(media.title||'')):L({en:'Official character art',ja:'公式キャラアート'}))}),
          h('p.hint',L({en:'Download it, copy the image link, or right-click the picture.',ja:'ダウンロード、リンクコピー、または画像を右クリック。'})),
          h('div.row',{style:'margin-top:8px'},
            img?btnI('⬇️ '+L(S.download),'','small gold',()=>dlRemote(img,(c.name||'pfp').replace(/\s+/g,'-').toLowerCase()+'-pfp.png')):null,
            img?btnI('🔗 '+L({en:'Copy image link',ja:'画像リンクをコピー'}),'','small',()=>copyText(img)):null,
            btnI('🔗 '+L({en:'Open on MAL',ja:'MALで開く'}),'','small',()=>window.open(c.url||('https://myanimelist.net/character/'+c.mal_id),'_blank','noopener')))))));
    prev.scrollIntoView({block:'nearest',behavior:'smooth'});
  };

  /* --- character grid from a picked anime / manga --- */
  const seriesMode=(root,kind)=>{
    const grid=h('div');
    root.appendChild(panel(L({en:kind==='manga'?'Pick a manga':'Pick an anime',ja:kind==='manga'?'漫画を選択':'アニメを選択'}),
      searchBox({kind,placeholder:L({en:(kind==='manga'?'Manga':'Anime')+' title…',ja:(kind==='manga'?'漫画':'アニメ')+'名…'}),
        onPick:a=>withBusy(grid,async r=>{
          /* collapse the stale search list so only the character grid remains */
          const sbH=root.firstElementChild&&root.firstElementChild.lastElementChild&&root.firstElementChild.lastElementChild.lastElementChild;
          if(sbH&&sbH!==grid) clear(sbH);
          const j=await japi('/'+kind+'/'+a.mal_id+'/characters');
          const chars=(j.data||[]).filter(Boolean).slice(0,60);
          clear(r);
          r.appendChild(h('div.panel',
            h('div.panel-title',a.title+' · '+chars.length+' '+L({en:'characters',ja:'キャラクター'})),
            h('p.hint',L({en:'Click a character for a full-size PFP — download it or copy the image link.',ja:'キャラをクリックでフルサイズPFP — ダウンロードやリンクコピーが可能。'}))));
          if(!chars.length){ r.appendChild(emptyBox()); return; }
          const g=h('div.results');
          chars.forEach(ch=>{
            const c=ch.character||{};
            const img=charImg(c);
            const card=h('article.acard');
            if(img) card.appendChild(h('img.ac-thumb',{src:img,loading:'lazy',onerror(){this.style.visibility='hidden'}}));
            card.appendChild(h('div.ac-body',
              h('div.ac-title',c.name||'—'),
              h('div.ac-meta',esc(ch.role||'')),
              h('div.ac-actions',btnI('🖼️ '+L({en:'PFP',ja:'PFP'}),'','small primary',()=>preview(c,a)))));
            g.appendChild(card);
          });
          r.appendChild(g);
        })})));
    root.appendChild(grid);
  };

  /* --- global character search --- */
  const findMode=(root)=>{
    const input=inp({placeholder:L({en:'Character name…',ja:'キャラ名…'}),autocomplete:'off'});
    const list=h('div');
    const go=async()=>{
      clear(list); list.appendChild(skelGrid(4));
      try{
        const j=await japi('/characters',{q:input.value.trim(),limit:12,order_by:'favorites',sort:'desc'});
        const items=(j.data||[]).filter(Boolean);
        clear(list);
        if(!items.length){ list.appendChild(emptyBox()); return; }
        const g=h('div.results');
        items.forEach(c=>{
          const img=charImg(c);
          const card=h('article.acard');
          if(img) card.appendChild(h('img.ac-thumb',{src:img,loading:'lazy',onerror(){this.style.visibility='hidden'}}));
          card.appendChild(h('div.ac-body',
            h('div.ac-title',c.name||'—'),
            h('div.ac-actions',btnI('🖼️ '+L({en:'PFP',ja:'PFP'}),'','small primary',()=>preview(c,null)))));
          g.appendChild(card);
        });
        list.appendChild(g);
      }catch(e){ clear(list); list.appendChild(errBox(e.message,go)); }
    };
    input.addEventListener('keydown',e=>{ if(e.key==='Enter') go(); });
    root.appendChild(panel(L({en:'Search any character',ja:'キャラを検索'}),
      h('div.row',input,btn(L(S.run||'Go'),'gold',go))));
    root.appendChild(list);
  };

  /* --- name-art canvas (original styles + neon night) --- */
  const nameArt=(root)=>{
    const {wrap,c,ctx}=mkCanvas(512,512);
    const nameIn=inp({value:'Zaki',maxlength:'12',placeholder:L({en:'Name / nickname',ja:'名前・ニックネーム'})});
    const styleSel=selEl([{v:'0',t:'Sakura gradient'},{v:'1',t:'Seigaiha waves'},{v:'2',t:'Ukiyo-e sun'},{v:'3',t:'Ink brush'},{v:'4',t:'Neon night'}],'0');
    let seed=randSeed();
    function draw(){
      const R=mulberry(seed); const w=c.width;
      const pal=[['#f7c1cf','#d8452b'],['#8ed0e0','#2f6f6a'],['#ffd98a','#d8452b'],['#1c2230','#d8a94a'],['#2a1b45','#7b3fa0']][+styleSel.value];
      const g=ctx.createLinearGradient(0,0,w,w); g.addColorStop(0,pal[0]); g.addColorStop(1,pal[1]);
      ctx.fillStyle=g; ctx.fillRect(0,0,w,w);
      if(+styleSel.value===1){ ctx.strokeStyle='rgba(255,255,255,.28)'; ctx.lineWidth=3;
        for(let y=40;y<w;y+=52) for(let x=20;x<w;x+=60){ ctx.beginPath(); ctx.arc(x,y,26,Math.PI,0); ctx.stroke(); ctx.beginPath(); ctx.arc(x,y,16,Math.PI,0); ctx.stroke(); } }
      if(+styleSel.value===2){ ctx.fillStyle='#c1341f'; ctx.beginPath(); ctx.arc(w*0.5,w*0.36,110,0,7); ctx.fill(); ctx.fillStyle='rgba(20,22,29,.85)';
        ctx.beginPath(); ctx.moveTo(0,w*0.78); ctx.quadraticCurveTo(w*0.3,w*0.6,w*0.55,w*0.75); ctx.quadraticCurveTo(w*0.8,w*0.88,w,w*0.7); ctx.lineTo(w,w); ctx.lineTo(0,w); ctx.fill(); }
      if(+styleSel.value===3){ ctx.strokeStyle='rgba(20,22,29,.75)';
        for(let i=0;i<9;i++){ ctx.lineWidth=1+R()*7; ctx.beginPath(); const y=R()*w; ctx.moveTo(-10,y); ctx.bezierCurveTo(w*.3,y-60+R()*120,w*.7,y-60+R()*120,w+10,y); ctx.stroke(); } }
      if(+styleSel.value===4){ ctx.strokeStyle='rgba(120,220,255,.35)'; ctx.lineWidth=2;
        for(let y=w*.62;y<w;y+=26){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }
        for(let x=-w;x<w*2;x+=54){ ctx.beginPath(); ctx.moveTo(w/2,w*.62); ctx.lineTo(x,w); ctx.stroke(); }
        for(let i=0;i<10;i++){ ctx.strokeStyle='rgba(255,110,220,'+(0.25+R()*0.4)+')'; ctx.lineWidth=1+R()*2;
          const y=R()*w*.55; ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y+R()*30-15); ctx.stroke(); } }
      for(let i=0;i<26;i++){ ctx.fillStyle='rgba(255,255,255,'+(0.15+R()*0.5)+')'; ctx.beginPath(); ctx.arc(R()*w,R()*w,1.5+R()*3.5,0,7); ctx.fill(); }
      ctx.strokeStyle='rgba(255,255,255,.85)'; ctx.lineWidth=10; ctx.beginPath(); ctx.arc(w/2,w/2,w/2-8,0,7); ctx.stroke();
      const txt=(nameIn.value||'A').trim().charAt(0).toUpperCase();
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.font='800 230px Georgia,serif'; ctx.fillStyle='rgba(0,0,0,.28)'; ctx.fillText(txt,w/2+5,w/2+6);
      ctx.fillStyle='#fff'; ctx.fillText(txt,w/2,w/2);
      ctx.font='700 26px Helvetica,Arial'; ctx.fillStyle='rgba(255,255,255,.92)'; ctx.fillText((nameIn.value||'').toUpperCase(),w/2,w-52);
      ctx.textAlign='left';
      ctx.fillStyle='rgba(216,69,43,.95)'; ctx.fillRect(w-96,26,70,70);
      ctx.fillStyle='#fff'; ctx.font='800 34px Georgia,serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('技',w-61,61); ctx.textAlign='left'; ctx.textBaseline='alphabetic';
    }
    nameIn.addEventListener('input',draw); styleSel.addEventListener('change',()=>{ seed=randSeed(); draw(); });
    root.appendChild(h('div.row',field(L({en:'Name',ja:'名前'}),nameIn),field(L({en:'Style',ja:'スタイル'}),styleSel)));
    root.appendChild(h('div.row',{style:'margin:12px 0'},
      btn('🎲 '+L({en:'Randomize',ja:'ランダム'}),'primary',()=>{ seed=randSeed(); draw(); }),
      btn('⬇️ '+L(S.download),'gold',()=>dlCanvas(c,'anime-profile-pic.png'))));
    root.appendChild(wrap); draw();
  };

  m.appendChild(bar);
  m.appendChild(prev);
  m.appendChild(root);
  show('name');
};

/* ============================================================
   12 — MANGA READING CALCULATOR
   ============================================================ */
TOOLS_IMPL['manga-calc']=(m)=>{
  const total=inp({type:'number',value:'250',min:'1'});
  const perDay=inp({type:'number',value:'10',min:'1'});
  const perMin=inp({type:'number',value:'4',min:'1'});
  const out=h('div');
  const calc=()=>{
    const t=Math.max(1,+total.value||1), d=Math.max(1,+perDay.value||1), mn=Math.max(1,+perMin.value||1);
    const days=Math.ceil(t/d), hours=(t*mn)/60, perSession=(d*mn);
    clear(out);
    out.appendChild(h('div.stat-row',
      h('div.stat-box',h('small',L({en:'Days to finish',ja:'読了まで'})),h('div.big-num',days),h('small',L({en:'days',ja:'日'}))),
      h('div.stat-box',h('small',L({en:'Total reading',ja:'総読書時間'})),h('div.big-num',Math.round(hours*10)/10),h('small',L({en:'hours',ja:'時間'}))),
      h('div.stat-box',h('small',L({en:'Per session',ja:'1回あたり'})),h('div.big-num',perSession),h('small',L({en:'minutes',ja:'分'}))),
      h('div.stat-box',h('small',L({en:'Finish date',ja:'完了予定'})),h('div.big-num',{style:'font-size:22px'},new Date(Date.now()+days*864e5).toLocaleDateString(LANG==='ja'?'ja-JP':'en-US')))));
  };
  ['input','change'].forEach(ev=>[total,perDay,perMin].forEach(i=>i.addEventListener(ev,calc)));
  m.appendChild(panel(L({en:'Inputs',ja:'入力'}),
    h('div.row',field(L({en:'Total chapters',ja:'全話数'}),total),field(L({en:'Chapters / day',ja:'1日の話数'}),perDay),field(L({en:'Minutes / chapter',ja:'1話あたり分'}),perMin))));
  m.appendChild(out); calc();
};

/* ============================================================
   13 — ANIME NAME GENERATOR
   ============================================================ */
TOOLS_IMPL['name-gen']=(m)=>{
  const out=h('div');
  const gen=()=>{
    clear(out);
    const names=[];
    for(let i=0;i<12;i++){ const s=pick(NAMES.s1)+pick(NAMES.s2); const g=pick(NAMES.g1)+pick(NAMES.g2); names.push({s,g}); }
    const gBox=h('div.chipset');
    names.forEach(n=>gBox.appendChild(h('button.tchip',{type:'button',onclick:e=>copyText(n.s+' '+n.g),html:'<b>'+n.s+'</b> '+n.g+' <span style="opacity:.5">⧉</span>'})));
    out.appendChild(h('div.panel',h('div.panel-title',L({en:'Character names (click to copy)',ja:'キャラ名（クリックでコピー）'})),gBox));
    const titles=[];
    for(let i=0;i<5;i++) titles.push(pick(NAMES.titleAdj)+' '+pick(NAMES.titleNoun)+' '+pick(['of the','of','no'])+' '+pick(NAMES.titleNoun));
    const tBox=h('div.chipset');
    titles.forEach(t=>tBox.appendChild(h('button.tchip',{type:'button',onclick:e=>copyText(t),html:esc(t)+' <span style="opacity:.5">⧉</span>'})));
    out.appendChild(h('div.panel',h('div.panel-title',L({en:'Series titles',ja:'シリーズタイトル'})),tBox));
  };
  m.appendChild(h('div.row',btn('📛 '+L({en:'Generate names',ja:'名前を生成'}),'primary',gen),btn('♻️ '+L(S.again),'',gen)));
  m.appendChild(out); gen();
};

/* ============================================================
   14 — RANDOM ANIME PICKER
   ============================================================ */
TOOLS_IMPL['picker']=(m)=>{
  const ta=h('textarea.inp',{placeholder:L({en:'One option per line…',ja:'1行に1つ…'}),style:'min-height:120px'});
  const out=h('div');
  const fromList=()=>{
    const list=ta.value.split('\n').map(s=>s.trim()).filter(Boolean);
    if(!list.length){ out.appendChild(emptyBox(L({en:'Add at least one option.',ja:'候補を1つ以上入力。'}),'🪙')); return; }
    spin(list, w=>h('div.tier-item',w));
  };
  const fromApi=async()=>{ try{
    const j=await japi('/anime',{order_by:'popularity',sort:'asc',limit:25,page:ri(1,40)});
    const list=(j.data||[]).filter(Boolean).map(a=>a.title);
    if(!list.length) return;
    ta.value=list.join('\n');
    spin(list,(w)=>{ const a=(j.data||[]).find(x=>x.title===w); return h('div.tier-item',a?h('img',{src:a.images.jpg.image_url,onerror(){this.style.visibility='hidden'}}):null,w); });
  }catch(e){ clear(out); out.appendChild(errBox(e.message)); } };
  function spin(list,onItem){
    const winner=pick(list);
    clear(out);
    const show=h('div.chipset',{style:'justify-content:center'});
    out.appendChild(busyBox(L({en:'Deciding your fate…',ja:'運命を抽選中…'})));
    out.appendChild(show);
    let n=0; const total=ri(14,22);
    const iv=setInterval(()=>{
      clear(show); show.appendChild(onItem(pick(list)));
      if(++n>=total){ clearInterval(iv); clear(show); show.appendChild(onItem(winner));
        clear(out);
        out.appendChild(h('div.panel',h('div.panel-title',L({en:'Fate has decided',ja:'運命は決まった'})),show));
        out.appendChild(h('div.row',btn('🪙 '+L(S.again),'primary',()=>fromList()),btn('🎲 '+L({en:'Roll from API',ja:'APIから抽選'}),'',fromApi)));
      }
    },110);
  }
  m.appendChild(panel(L({en:'Your options',ja:'候補リスト'}),ta,
    h('div.row',{style:'margin-top:10px'},btn('🪙 '+L({en:'Pick one',ja:'1つ選ぶ'}),'primary',fromList),
      btn('🎲 '+L({en:'Fill with 10 random anime',ja:'ランダム10件で埋める'}),'',fromApi))));
  m.appendChild(out);
};

/* ============================================================
   15 — WATCHLIST & RANKING
   ============================================================ */
TOOLS_IMPL['wl-rank']=(m)=>{
  const out=h('div'); let mode='mal';
  const paint=()=>{
    clear(out);
    const items=WL.list();
    if(!items.length){ out.appendChild(emptyBox(L({en:'Your watchlist is empty — add titles with the ＋ button on any card.',ja:'視聴リストは空です。カードの＋で追加できます。'}),'🗂️')); return; }
    const sorted=[...items].sort((a,b)=>{
      if(mode==='title') return (a.t||'').localeCompare(b.t||'');
      if(mode==='personal') return (b.score||0)-(a.score||0);
      if(mode==='added') return b.added-a.added;
      return (b.mal||0)-(a.mal||0);
    });
    const maxMal=Math.max(...sorted.map(x=>x.mal||0),1);
    sorted.forEach((it,i)=>{
      const row=h('div.track');
      row.appendChild(h('span.rank-num',{style:'position:static;flex:0 0 auto'},String(i+1)));
      if(it.img) row.appendChild(h('img',{src:it.img,style:'width:34px;height:48px;object-fit:cover;border-radius:5px',onerror(){this.style.visibility='hidden'}}));
      row.appendChild(h('div.grow',
        h('div.t',it.t||it.r),
        h('div.a',(it.st||'planned')+' · '+(it.eps?it.ep||0+'/'+it.eps+' '+L({en:'ep',ja:'話'}):L({en:'no ep data',ja:'話数不明'}))),
        h('div.meter',{style:'margin-top:5px'},h('i',{style:'width:'+Math.round(((it.mal||0)/maxMal)*100)+'%'}))));
      row.appendChild(h('span.badge.gold','★ '+(it.mal||'—')));
      const sc=inp({type:'number',min:'0',max:'10',value:it.score||'',placeholder:'★',style:'width:70px',
        onchange:e=>WL.patch(it.id,{score:+e.target.value||null})});
      row.appendChild(sc);
      out.appendChild(row);
    });
    out.appendChild(h('p.hint',{html:L({en:'Personal ★ is saved per title. Bar = MAL score vs your top title.',ja:'個人★はタイトルごとに保存。バーは最高作品比のMALスコア。'})}));
  };
  const modes=chipset([{t:L({en:'By MAL score',ja:'MALスコア'}),v:'mal',on:1},{t:L({en:'By personal ★',ja:'個人★'}),v:'personal'},{t:L({en:'Newest',ja:'新着'}),v:'added'},{t:L({en:'A–Z',ja:'名前順'}),v:'title'}],
    {onchange:v=>{ mode=v[0]||'mal'; paint(); }});
  m.appendChild(h('div.row',modes.el,
    btn('＋ '+L({en:'Add',ja:'追加'}),'primary',quickAdd),
    btn('⬇️ '+L({en:'Export JSON',ja:'JSON書き出し'}),'gold',()=>{ const a=document.createElement('a'); a.href='data:application/json,'+encodeURIComponent(JSON.stringify(WL.list(),null,2)); a.download='anime-zaki-watchlist.json'; a.click(); })));
  m.appendChild(out); paint();
};

/* ============================================================
   16 — CHARACTER CREATOR
   ============================================================ */
TOOLS_IMPL['char-creator']=(m)=>{
  const {wrap,c,ctx}=mkCanvas(460,520);
  const INK='#2a2030';
  const SKINS=['#f6d7bd','#f0c39a','#d9a06b','#a86b43','#7d4b2d'];
  const HAIRC=[{en:'Jet black',ja:'漆黒'},{en:'Silver',ja:'シルバー'},{en:'Strawberry',ja:'苺色'},{en:'Ginger',ja:'赤茶'},{en:'Ash brown',ja:'ブラウン'},{en:'Rose pink',ja:'ローズ'},{en:'Sky blue',ja:'空色'},{en:'Mint',ja:'ミント'},{en:'Violet',ja:'紫'},{en:'Crimson',ja:'紅'}].map((_,i)=>['#23222a','#cfd4dd','#e26d5c','#e8975a','#7a5a44','#ef9ab8','#7cc0e8','#8fd6b8','#a487d8','#b83a3a'][i]);
  const HAIRC_L=HAIRC.map((c,i)=>L([{en:'Jet black',ja:'漆黒'},{en:'Silver',ja:'シルバー'},{en:'Strawberry',ja:'苺色'},{en:'Ginger',ja:'赤茶'},{en:'Ash brown',ja:'ブラウン'},{en:'Rose pink',ja:'ローズ'},{en:'Sky blue',ja:'空色'},{en:'Mint',ja:'ミント'},{en:'Violet',ja:'紫'},{en:'Crimson',ja:'紅'}][i]));
  const EYES=['#2f8f85','#3a6ea8','#d99a3a','#c44a4a','#7a4b9f','#3f8f5a','#d96a94','#c9a227'];
  const EYES_L=EYES.map((c,i)=>L([{en:'Teal',ja:'青緑'},{en:'Ocean',ja:'紺碧'},{en:'Amber',ja:'琥珀'},{en:'Crimson',ja:'紅'},{en:'Violet',ja:'紫'},{en:'Emerald',ja:'翠'},{en:'Rose',ja:'桃'},{en:'Gold',ja:'金'}][i]));
  const HAIRS=[{en:'Short bob',ja:'ショート'},{en:'Spiky',ja:'スパイキー'},{en:'Twin-tails',ja:'ツインテール'},{en:'Long straight',ja:'ロング'},{en:'Hime cut',ja:'姫カット'},{en:'Space buns',ja:'お団子'},{en:'Ponytail',ja:'ポニー'},{en:'Wavy',ja:'ウェーブ'}];
  const SKIN_L=SKINS.map((c,i)=>L({en:['Fair','Light tan','Tan','Deep','Rich'][i],ja:['白肌','普通','日焼け','濃色','深色'][i]}));
  const ACCS=[{en:'None',ja:'なし'},{en:'Glasses',ja:'メガネ'},{en:'Headband',ja:'ヘアバンド'},{en:'Cat ears',ja:'猫耳'},{en:'Beret',ja:'ベレー帽'}];
  const EXPR=[{en:'Smile',ja:'笑顔'},{en:'Cool',ja:'クール'},{en:'Angry',ja:'怒り'},{en:'Cry',ja:'泣き'},{en:'Wink',ja:'ウインク'}];
  const OUTFIT=[{en:'Sailor navy',ja:'紺セーラー'},{en:'Sailor red',ja:'赤セーラー'},{en:'Gakuran',ja:'学ラン'},{en:'Hoodie',ja:'パーカー'},{en:'Kimono',ja:'着物'}];
  const st={hair:0,skin:0,hairc:0,eye:0,acc:0,expr:0,outfit:0,seed:randSeed()};
  function draw(){
    const R=mulberry(st.seed); const W=c.width,H=c.height;
    const hair=HAIRC[st.hairc], skin=SKINS[st.skin], eyeC=EYES[st.eye];
    ctx.clearRect(0,0,W,H);
    /* --- background: warm radial + seigaiha + sparkles + petals --- */
    const bg=ctx.createRadialGradient(W/2,H*0.36,40,W/2,H*0.42,H*0.9);
    bg.addColorStop(0,'#fdf6e6'); bg.addColorStop(1,'#f0dcc0');
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle='rgba(216,107,80,.12)'; ctx.lineWidth=3;
    for(let y=40;y<H;y+=46) for(let x=16;x<W;x+=54){ ctx.beginPath(); ctx.arc(x,y,24,Math.PI,0); ctx.stroke(); ctx.beginPath(); ctx.arc(x,y,14,Math.PI,0); ctx.stroke(); }
    for(let i=0;i<12;i++){ ctx.fillStyle='rgba(255,255,255,'+(0.3+R()*0.5)+')';
      const x=R()*W,y=R()*H*0.85,s=1+R()*2;
      ctx.beginPath(); ctx.moveTo(x,y-s*3); ctx.quadraticCurveTo(x+s,y-s,x+s*3,y); ctx.quadraticCurveTo(x+s,y+s,x,y+s*3); ctx.quadraticCurveTo(x-s,y+s,x-s*3,y); ctx.quadraticCurveTo(x-s,y-s,x,y-s*3); ctx.closePath(); ctx.fill(); }
    for(let i=0;i<7;i++){ ctx.fillStyle='rgba(239,154,184,.45)'; ctx.beginPath(); ctx.ellipse(R()*W,R()*H*0.8,4+R()*3,2.5+R()*2,R()*3,0,7); ctx.fill(); }
    const cx=W/2, cy=236;
    const ink=(w)=>{ ctx.strokeStyle=INK; ctx.lineWidth=w||4.5; ctx.lineJoin='round'; ctx.lineCap='round'; };
    const facePath=()=>{ ctx.beginPath();
      ctx.moveTo(cx-78,cy-30);
      ctx.bezierCurveTo(cx-82,cy+30,cx-58,cy+86,cx,cy+96);
      ctx.bezierCurveTo(cx+58,cy+86,cx+82,cy+30,cx+78,cy-30);
      ctx.bezierCurveTo(cx+74,cy-88,cx-74,cy-88,cx-78,cy-30); ctx.closePath(); };
    /* --- back hair --- */
    ctx.fillStyle=hair; ink(5);
    ctx.beginPath();
    if(st.hair===2){ [-1,1].forEach(s=>{ const sx=cx+s*104;
        ctx.moveTo(sx-26,cy-56); ctx.quadraticCurveTo(sx-42,cy+60,sx-8,cy+148); ctx.quadraticCurveTo(sx+8,cy+60,sx+26,cy-56); ctx.closePath(); }); }
    else if(st.hair===3||st.hair===7){ ctx.moveTo(cx-92,cy-40); ctx.quadraticCurveTo(cx-110,cy+110,cx-70,cy+188); ctx.lineTo(cx+70,cy+188); ctx.quadraticCurveTo(cx+110,cy+110,cx+92,cy-40); ctx.closePath(); }
    else if(st.hair===5){ ctx.arc(cx-82,cy-70,30,0,7); ctx.arc(cx+82,cy-70,30,0,7); }
    else if(st.hair===6){ ctx.moveTo(cx+52,cy-56); ctx.quadraticCurveTo(cx+132,cy-36,cx+102,cy+128); ctx.quadraticCurveTo(cx+82,cy+36,cx+40,cy-28); ctx.closePath(); }
    else ctx.ellipse(cx,cy-26,96,78,0,Math.PI,0);
    ctx.fill(); ctx.stroke();
    /* --- outfit --- */
    if(st.outfit===0||st.outfit===1){
      const uni=st.outfit===0?'#31405f':'#8a2f35';
      ctx.fillStyle=uni; ink(5);
      ctx.beginPath(); ctx.moveTo(cx-128,H); ctx.quadraticCurveTo(cx-118,cy+128,cx-44,cy+112); ctx.lineTo(cx,cy+152); ctx.lineTo(cx+44,cy+112); ctx.quadraticCurveTo(cx+118,cy+128,cx+128,H); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle='#f4efe4'; ink(4);
      ctx.beginPath(); ctx.moveTo(cx-52,cy+106); ctx.lineTo(cx,cy+166); ctx.lineTo(cx+52,cy+106); ctx.lineTo(cx+36,cy+98); ctx.lineTo(cx,cy+144); ctx.lineTo(cx-36,cy+98); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle=uni; ctx.lineWidth=2.2;
      ctx.beginPath(); ctx.moveTo(cx-45,cy+112); ctx.lineTo(cx,cy+168); ctx.moveTo(cx+45,cy+112); ctx.lineTo(cx,cy+168); ctx.stroke();
      ctx.fillStyle=st.outfit===0?'#d8452b':'#f0e4c8'; ink(3.5);
      ctx.beginPath(); ctx.moveTo(cx,cy+166); ctx.lineTo(cx-25,cy+154); ctx.lineTo(cx-21,cy+178); ctx.closePath();
      ctx.moveTo(cx,cy+166); ctx.lineTo(cx+25,cy+154); ctx.lineTo(cx+21,cy+178); ctx.closePath();
      ctx.moveTo(cx,cy+162); ctx.arc(cx,cy+168,6.5,0,7); ctx.fill(); ctx.stroke();
    } else if(st.outfit===2){
      ctx.fillStyle='#191a20'; ink(5);
      ctx.beginPath(); ctx.moveTo(cx-124,H); ctx.quadraticCurveTo(cx-112,cy+126,cx-42,cy+110); ctx.lineTo(cx,cy+148); ctx.lineTo(cx+42,cy+110); ctx.quadraticCurveTo(cx+112,cy+126,cx+124,H); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillRect(cx-33,cy+96,66,26); ctx.strokeRect(cx-33,cy+96,66,26);
      ctx.fillStyle='#c9a227'; [180,206,232].forEach(y=>{ ctx.beginPath(); ctx.arc(cx,y,4.5,0,7); ctx.fill(); });
    } else if(st.outfit===3){
      ctx.fillStyle='#5f7f6f'; ink(5);
      ctx.beginPath(); ctx.moveTo(cx-130,H); ctx.quadraticCurveTo(cx-116,cy+124,cx-46,cy+110); ctx.quadraticCurveTo(cx,cy+142,cx+46,cy+110); ctx.quadraticCurveTo(cx+116,cy+124,cx+130,H); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle='#f4efe4'; ctx.lineWidth=3.2;
      ctx.beginPath(); ctx.moveTo(cx-13,cy+134); ctx.lineTo(cx-17,H-44); ctx.moveTo(cx+13,cy+134); ctx.lineTo(cx+17,H-44); ctx.stroke();
      ink(4); ctx.beginPath(); ctx.arc(cx,cy+120,40,0.55,Math.PI-0.55); ctx.stroke();
    } else {
      ctx.fillStyle='#c96a5a'; ink(5);
      ctx.beginPath(); ctx.moveTo(cx-126,H); ctx.quadraticCurveTo(cx-114,cy+126,cx-44,cy+110); ctx.lineTo(cx,cy+154); ctx.lineTo(cx+44,cy+110); ctx.quadraticCurveTo(cx+114,cy+126,cx+126,H); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle='#f4efe4'; ink(4);
      ctx.beginPath(); ctx.moveTo(cx-44,cy+106); ctx.lineTo(cx,cy+158); ctx.lineTo(cx+44,cy+106); ctx.lineTo(cx+27,cy+98); ctx.lineTo(cx,cy+138); ctx.lineTo(cx-27,cy+98); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle='#2f4a44'; ink(4);
      ctx.fillRect(cx-68,cy+196,136,32); ctx.strokeRect(cx-68,cy+196,136,32);
      ctx.fillStyle='rgba(244,239,228,.8)';
      for(let i=0;i<9;i++){ ctx.beginPath(); ctx.arc(cx-88+R()*176,cy+182+R()*118,3.2,0,7); ctx.fill(); }
    }
    /* --- neck + shadow --- */
    ctx.fillStyle=skin; ink(4);
    ctx.beginPath(); ctx.moveTo(cx-20,cy+60); ctx.lineTo(cx-20,cy+118); ctx.lineTo(cx+20,cy+118); ctx.lineTo(cx+20,cy+60); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle='rgba(0,0,0,.16)'; ctx.fillRect(cx-19,cy+60,38,20);
    /* --- face + cel shadow (clipped) --- */
    ctx.fillStyle=skin; ink(5); facePath(); ctx.fill(); ctx.stroke();
    ctx.save(); facePath(); ctx.clip();
    ctx.fillStyle='rgba(0,0,0,.10)'; ctx.beginPath(); ctx.ellipse(cx,cy-62,80,32,0,0,Math.PI); ctx.fill();
    ctx.fillStyle='rgba(0,0,0,.04)'; ctx.fillRect(cx-90,cy+4,180,80);
    ctx.restore();
    /* --- ears --- */
    ctx.fillStyle=skin; ink(4);
    ctx.beginPath(); ctx.ellipse(cx-77,cy+14,11,19,0,0,7); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(cx+77,cy+14,11,19,0,0,7); ctx.fill(); ctx.stroke();
    /* --- anime eyes --- */
    const eyeY=cy+18;
    const eye=(x,narrow)=>{
      const ew=23, eh=narrow?13:21;
      ctx.fillStyle='#fff'; ink(3);
      ctx.beginPath();
      ctx.moveTo(x-ew,eyeY+2);
      ctx.quadraticCurveTo(x-ew*0.5,eyeY-eh-4,x,eyeY-eh);
      ctx.quadraticCurveTo(x+ew*0.6,eyeY-eh+2,x+ew,eyeY);
      ctx.quadraticCurveTo(x+ew*0.5,eyeY+13,x,eyeY+13);
      ctx.quadraticCurveTo(x-ew*0.5,eyeY+13,x-ew,eyeY+2);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.save(); ctx.clip();
      const ig=ctx.createLinearGradient(0,eyeY-eh,0,eyeY+14);
      ig.addColorStop(0,eyeC); ig.addColorStop(1,'#101219');
      ctx.fillStyle=ig; ctx.beginPath(); ctx.arc(x,eyeY+1,12,0,7); ctx.fill();
      ctx.fillStyle='#0e1016'; ctx.beginPath(); ctx.arc(x,eyeY+1.5,5.2,0,7); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,.96)'; ctx.beginPath(); ctx.arc(x-4.6,eyeY-5,4.4,0,7); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,.72)'; ctx.beginPath(); ctx.arc(x+4,eyeY+6,2.3,0,7); ctx.fill();
      ctx.restore();
      ctx.strokeStyle=INK; ctx.lineWidth=6;
      ctx.beginPath(); ctx.moveTo(x-ew,eyeY+1); ctx.quadraticCurveTo(x-ew*0.5,eyeY-eh-6,x,eyeY-eh-1); ctx.quadraticCurveTo(x+ew*0.6,eyeY-eh+1,x+ew,eyeY-1); ctx.stroke();
      ctx.lineWidth=2.4;
      ctx.beginPath(); ctx.moveTo(x-6,eyeY+12.6); ctx.lineTo(x+8,eyeY+12); ctx.stroke();
    };
    const closedEye=(x,up)=>{
      ctx.strokeStyle=INK; ctx.lineWidth=5;
      ctx.beginPath();
      if(up) ctx.arc(x,eyeY+8,14,Math.PI*1.35,Math.PI*1.65);
      else ctx.arc(x,eyeY-3,14,Math.PI*0.35,Math.PI*0.65);
      ctx.stroke();
    };
    const narrow=st.expr==='cool'||st.expr==='angry';
    if(st.expr==='cry'){
      closedEye(cx-34); closedEye(cx+34);
      ctx.fillStyle='rgba(130,190,235,.6)';
      [-34,34].forEach(ox=>{ ctx.beginPath(); ctx.ellipse(cx+ox,eyeY+22,4,8,0,0,7); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx+ox+2,eyeY+38,2.5,5,0,0,7); ctx.fill(); });
    } else if(st.expr==='wink'){ eye(cx-34,narrow); closedEye(cx+34,true); }
    else { eye(cx-34,narrow); eye(cx+34,narrow); }
    /* --- brows --- */
    ctx.strokeStyle='#3a2c22'; ctx.lineWidth=4.6;
    const byT=eyeY-36;
    if(st.expr==='angry'){
      ctx.beginPath(); ctx.moveTo(cx-56,byT-7); ctx.lineTo(cx-18,byT+5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx+56,byT-7); ctx.lineTo(cx+18,byT+5); ctx.stroke();
    } else if(st.expr==='cry'){
      ctx.beginPath(); ctx.moveTo(cx-56,byT+9); ctx.lineTo(cx-18,byT-2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx+56,byT+9); ctx.lineTo(cx+18,byT-2); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.moveTo(cx-56,byT); ctx.quadraticCurveTo(cx-37,byT-8,cx-18,byT-2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx+56,byT); ctx.quadraticCurveTo(cx+37,byT-8,cx+18,byT-2); ctx.stroke();
    }
    /* --- nose + mouth --- */
    ctx.strokeStyle='rgba(42,32,48,.5)'; ctx.lineWidth=3.2;
    ctx.beginPath(); ctx.moveTo(cx+4,cy+42); ctx.lineTo(cx-2,cy+50); ctx.lineTo(cx+5,cy+52); ctx.stroke();
    ctx.strokeStyle='#a3453c'; ctx.lineWidth=4.6;
    ctx.beginPath();
    if(st.expr==='smile'||st.expr==='wink') ctx.arc(cx,cy+68,15,0.22,Math.PI-0.22);
    else if(st.expr==='angry'){ ctx.moveTo(cx-12,cy+72); ctx.lineTo(cx+12,cy+72); }
    else if(st.expr==='cool'){ ctx.moveTo(cx-10,cy+70); ctx.lineTo(cx+12,cy+68); }
    else ctx.arc(cx,cy+76,10,Math.PI+0.25,-0.25);
    ctx.stroke();
    /* --- classic triple-line blush --- */
    if(st.expr==='smile'||st.expr==='wink'){
      ctx.strokeStyle='rgba(233,120,120,.5)'; ctx.lineWidth=3;
      [-1,1].forEach(s=>{ for(let i=0;i<3;i++){ const bx=cx+s*(50+i*8);
        ctx.beginPath(); ctx.moveTo(bx,cy+44); ctx.lineTo(bx+3.5*s,cy+56); ctx.stroke(); } });
    }
    /* --- front hair: clumped bangs + side locks + shine --- */
    const P={0:[5,14,8],1:[6,16,12],2:[5,14,8],3:[5,16,10],4:[6,8,2],5:[5,12,6],6:[5,16,10],7:[5,18,12]}[st.hair];
    ctx.fillStyle=hair; ink(5);
    ctx.beginPath();
    ctx.moveTo(cx-82,cy-16);
    ctx.quadraticCurveTo(cx-94,cy-82,cx-56,cy-106);
    ctx.quadraticCurveTo(cx,cy-134,cx+56,cy-106);
    ctx.quadraticCurveTo(cx+94,cy-82,cx+82,cy-16);
    for(let i=0;i<P[0];i++){
      const step=124/P[0], x1=cx+62-i*step;
      ctx.lineTo(x1,cy-30+(i%2)*P[2]*0.4);
      ctx.lineTo(x1-step*0.78,cy-4+P[1]+(i%2)*P[2]);
    }
    ctx.lineTo(cx-82,cy-16);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    /* side locks */
    const lock=(s,len,wave)=>{ ctx.fillStyle=hair; ink(4.5);
      const x=cx+s*74;
      ctx.beginPath();
      ctx.moveTo(x-s*8,cy-44);
      ctx.quadraticCurveTo(x+s*13,cy+12,x+s*wave,cy+len);
      ctx.quadraticCurveTo(x-s*15,cy+len*0.45,x-s*19,cy-32);
      ctx.closePath(); ctx.fill(); ctx.stroke(); };
    if(st.hair===1){ [-1,1].forEach(s=>{ ctx.fillStyle=hair; ink(4.5);
        ctx.beginPath(); ctx.moveTo(cx+s*52,cy-70); ctx.quadraticCurveTo(cx+s*100,cy-88,cx+s*114,cy-74); ctx.lineTo(cx+s*74,cy-8); ctx.closePath(); ctx.fill(); ctx.stroke(); }); }
    if(st.hair===0) { lock(-1,84,0); lock(1,84,0); }
    if(st.hair===2){ lock(-1,98,2); lock(1,98,2); }
    if(st.hair===3){ lock(-1,152,6); lock(1,152,6); }
    if(st.hair===4){ lock(-1,92,-2); lock(1,92,-2); }
    if(st.hair===5){ lock(-1,74,0); lock(1,74,0); }
    if(st.hair===6){ lock(-1,70,0); lock(1,70,0); }
    if(st.hair===7){ lock(-1,142,15); lock(1,142,15); }
    /* shine band */
    ctx.strokeStyle='rgba(255,255,255,.32)'; ctx.lineWidth=8.5;
    ctx.beginPath(); ctx.arc(cx,cy-38,62,Math.PI*1.12,Math.PI*1.52); ctx.stroke();
    ctx.lineWidth=4.5;
    ctx.beginPath(); ctx.arc(cx,cy-38,62,Math.PI*1.6,Math.PI*1.76); ctx.stroke();
    /* --- accessories --- */
    if(ACCS[st.acc]&&ACCS[st.acc].en==='Glasses'){
      ctx.strokeStyle=INK; ctx.lineWidth=4;
      ctx.beginPath(); ctx.arc(cx-34,eyeY,21,0,7); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx+34,eyeY,21,0,7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx-13,eyeY); ctx.lineTo(cx-55,eyeY-4); ctx.moveTo(cx+13,eyeY); ctx.lineTo(cx+55,eyeY-4); ctx.stroke();
    }
    if(st.acc===2){ ctx.fillStyle='#d8452b'; ink(3.5);
      ctx.beginPath(); ctx.moveTo(cx-84,cy-64); ctx.quadraticCurveTo(cx,cy-78,cx+84,cy-64); ctx.lineTo(cx+84,cy-44); ctx.quadraticCurveTo(cx,cy-58,cx-84,cy-44); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    if(st.acc===3){ [-1,1].forEach(s=>{ ctx.fillStyle=hair; ink(4.5);
        ctx.beginPath(); ctx.moveTo(cx+s*34-22,cy-96); ctx.lineTo(cx+s*52,cy-152); ctx.lineTo(cx+s*70-2,cy-88); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle='#f7a8b8'; ctx.beginPath(); ctx.moveTo(cx+s*40-11,cy-100); ctx.lineTo(cx+s*52,cy-134); ctx.lineTo(cx+s*60-1,cy-95); ctx.closePath(); ctx.fill(); }); }
    if(st.acc===4){ ctx.fillStyle='#7a2f3a'; ink(4.5);
      ctx.beginPath(); ctx.ellipse(cx+14,cy-104,74,26,-0.12,0,7); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx+66,cy-124,7,0,7); ctx.fillStyle='#f0e4c8'; ctx.fill(); ctx.stroke(); }
    /* --- seal --- */
    ctx.fillStyle='#d8452b'; ctx.fillRect(16,16,50,50);
    ctx.fillStyle='#fff'; ctx.font='800 28px Georgia,serif'; ctx.textAlign='center'; ctx.fillText('創',41,51); ctx.textAlign='left';
  }
  const mkSel=(label,opts,key)=>{ const s=selEl(opts.map((t,i)=>({v:i,t})),st[key]); s.addEventListener('change',()=>{ st[key]=+s.value; draw(); }); return field(label,s); };
  m.appendChild(h('div.row',
    mkSel(L({en:'Hair',ja:'髪型'}),HAIRS.map(o=>L(o)),'hair'),
    mkSel(L({en:'Hair color',ja:'髪色'}),HAIRC_L,'hairc'),
    mkSel(L({en:'Skin',ja:'肌'}),SKIN_L,'skin'),
    mkSel(L({en:'Eyes',ja:'瞳'}),EYES_L,'eye')));
  m.appendChild(h('div.row',
    mkSel(L({en:'Expression',ja:'表情'}),EXPR.map(o=>L(o)),'expr'),
    mkSel(L({en:'Accessory',ja:'小物'}),ACCS.map(o=>L(o)),'acc'),
    mkSel(L({en:'Outfit',ja:'服装'}),OUTFIT.map(o=>L(o)),'outfit')));
  m.appendChild(h('div.row',{style:'margin:12px 0'},
    btn('🎲 '+L({en:'Random character',ja:'ランダム生成'}),'primary',()=>{ const RN={hair:8,hairc:10,skin:5,eye:8,expr:5,acc:5,outfit:5}; Object.keys(RN).forEach(k=>st[k]=ri(0,RN[k]-1)); st.seed=randSeed(); draw(); }),
    btn('⬇️ '+L(S.download),'gold',()=>dlCanvas(c,'my-anime-character.png'))));
  m.appendChild(wrap); draw();
};

/* ============================================================
   17 — MANGA PLANNING UTILITIES
   ============================================================ */
TOOLS_IMPL['manga-plan']=(m)=>{
  const KEY='azt_plan';
  let plan=store.get(KEY,[]);
  const out=h('div');
  const tIn=inp({placeholder:L({en:'Manga title',ja:'漫画タイトル'})});
  const cIn=inp({type:'number',value:'100',min:'1',placeholder:L({en:'Chapters',ja:'話数'})});
  const sIn=inp({type:'number',value:'8',min:'1',placeholder:L({en:'Chapters/week',ja:'週あたり話数'})});
  const save=()=>store.set(KEY,plan);
  const paint=()=>{
    clear(out);
    if(!plan.length){ out.appendChild(emptyBox(L({en:'No reading plan yet.',ja:'読書計画はまだありません。'}),'🗓️')); return; }
    let totCh=0,totDays=0;
    const tbl=h('div');
    plan.forEach((p,i)=>{
      const days=Math.ceil(p.chapters/Math.max(1,p.perWeek)*7);
      totCh+=p.chapters; totDays=Math.max(totDays,days);
      const row=h('div.track');
      row.appendChild(h('div.grow',h('div.t',p.title),h('div.a',p.chapters+' '+L({en:'chapters',ja:'話'})+' · '+p.perWeek+'/wk')),
        h('div',{style:'width:170px'},h('div.a',L({en:'~',ja:'約'})+' '+days+' '+L({en:'days',ja:'日'})),
          h('div.meter',{style:'margin-top:4px'},h('i',{style:'width:'+Math.min(100,Math.round(days/90*100))+'%'}))));
      row.appendChild(h('span.badge.gold',new Date(Date.now()+days*864e5).toLocaleDateString(LANG==='ja'?'ja-JP':'en-US')));
      row.appendChild(h('button.iconbtn',{title:L(S.remove),html:ico('x'),onclick:()=>{ plan.splice(i,1); save(); paint(); }}));
      tbl.appendChild(row);
    });
    out.appendChild(tbl);
    out.appendChild(h('div.stat-row',{style:'margin-top:10px'},
      h('div.stat-box',h('small',L({en:'Total chapters',ja:'全話数'})),h('div.big-num',totCh)),
      h('div.stat-box',h('small',L({en:'Longest title',ja:'最長'})),h('div.big-num',{style:'font-size:24px'},totDays+'d')),
      h('div.stat-box',h('small',L({en:'Titles planned',ja:'計画タイトル数'})),h('div.big-num',plan.length))));
  };
  m.appendChild(panel(L({en:'Plan a title',ja:'タイトルを計画'}),
    h('div.row',field(L({en:'Title',ja:'タイトル'}),tIn),field(L({en:'Chapters',ja:'話数'}),cIn),field(L({en:'Per week',ja:'週あたり'}),sIn),
      btn('＋ '+L(S.add),'primary',()=>{ const t=tIn.value.trim(); if(!t) return; plan.push({title:t,chapters:+cIn.value||1,perWeek:+sIn.value||1}); save(); paint(); tIn.value=''; }))));
  m.appendChild(h('div.row',btn('🗑️ '+L(S.clear),'danger',()=>{ plan=[]; save(); paint(); })));
  m.appendChild(out); paint();
};

/* ============================================================
   18 — ANIME FONT GENERATOR
   ============================================================ */
const FONT_STYLES=[
 {n:'Bold',f:s=>mapU(s,0x41,0x1D400,0x61,0x1D41A,0x30,0x1D7CE)},
 {n:'Italic',f:s=>mapU(s,0x41,0x1D434,0x61,0x1D44E)},
 {n:'Bold Italic',f:s=>mapU(s,0x41,0x1D468,0x61,0x1D482)},
 {n:'Script',f:s=>mapU(s,0x41,0x1D49C,0x61,0x1D4B6,null,0,{'B':0x212C,'E':0x2130,'F':0x2131,'H':0x210B,'I':0x2111,'L':0x2112,'M':0x2133,'R':0x211B})},
 {n:'Fraktur',f:s=>mapU(s,0x41,0x1D504,0x61,0x1D51E,null,0,{'H':0x210C,'I':0x2111,'R':0x211C,'Z':0x2128})},
 {n:'Monospace',f:s=>mapU(s,0x41,0x1D670,0x61,0x1D68A,0x30,0x1D7F6)},
 {n:'Sans Bold',f:s=>mapU(s,0x41,0x1D5D4,0x61,0x1D5EE,0x30,0x1D7EC)},
 {n:'Fullwidth',f:s=>mapU(s,0x41,0xFF21,0x61,0xFF41,0x30,0xFF10)},
 {n:'Small Caps',f:s=>s.replace(/[a-z]/g,ch=>'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘQʀꜱᴛᴜᴠᴡxʏᴢ'[ch.charCodeAt(0)-97])},
 {n:'Wide',f:s=>s.split('').join('\u2009')},
 {n:'Reversed',f:s=>[...s].reverse().join('')}
];
function mapU(s,loA,upA,loa,upa,d0,upd,exc){
  return [...s].map(ch=>{
    const c=ch.charCodeAt(0);
    if(exc&&exc[ch]) return String.fromCharCode(exc[ch]);
    if(c>=65&&c<=90) return String.fromCharCode(upA+(c-65));
    if(c>=97&&c<=122) return String.fromCharCode(upa+(c-97));
    if(d0!=null&&c>=48&&c<=57) return String.fromCharCode(upd+(c-48));
    return ch;
  }).join('');
}
TOOLS_IMPL['fonts']=(m)=>{
  const tIn=inp({value:'Anime Zaki Tools',placeholder:L({en:'Your text…',ja:'テキスト…'})});
  const out=h('div');
  const paint=()=>{
    clear(out);
    const t=tIn.value||' ';
    FONT_STYLES.forEach(fs=>{
      let v=''; try{ v=fs.f(t) }catch(e){ v=t }
      out.appendChild(h('div.font-out',
        h('div.row',h('div.fname',fs.n),h('span',{style:'flex:1'}),
          btnI('⧉ '+L(S.copied),'','small',()=>copyText(v))),
        h('div.f',{style:fs.n==='Monospace'?'font-family:monospace':''},v)));
    });
  };
  tIn.addEventListener('input',paint);
  m.appendChild(panel(L({en:'Type something',ja:'入力してください'}),h('div.row',tIn),
    h('div.row',{style:'margin-top:10px'},btn('✒️ '+L({en:'Copy all styles',ja:'全スタイルをコピー'}),'',()=>copyText(FONT_STYLES.map(f=>f.n+': '+f.f(tIn.value||'')).join('\n'))))));
  m.appendChild(out); paint();
};

/* ============================================================
   19 — ANIME QUOTES
   ============================================================ */
TOOLS_IMPL['quotes']=(m)=>{
  const card=h('div');
  const mood=h('div.chipset');
  let filter=null;
  const show=()=>{
    clear(card);
    const pool=filter?QUOTES.filter(q=>q.a===filter||q.c===filter):QUOTES;
    const q=pick(pool);
    card.appendChild(h('div.quote-card',
      h('div.quote-mark','”'),
      h('div.q','“'+q.q+'”'),
      h('div.who','— '+q.c+' · '+q.a),
      h('div.row',{style:'margin-top:12px'},
        btn('📋 '+L(S.copied),'',()=>copyText('“'+q.q+'” — '+q.c+', '+q.a)),
        btn('♻️ '+L(S.again),'primary',show),
        btn('🔎 '+L({en:'Find this anime',ja:'この作品を探す'}),'',()=>openTool('finder',{q:q.a})))));
  };
  mood.appendChild(h('button.tchip'+(filter?'':'.on'),{type:'button',html:'✦ '+L({en:'All',ja:'すべて'}),onclick:()=>{ filter=null; [...mood.children].forEach(c=>c.className='tchip'); mood.children[0].className='tchip on'; show(); }}));
  [...new Set(QUOTES.map(q=>q.a))].slice(0,8).forEach(a=>mood.appendChild(h('button.tchip',{type:'button',html:a,onclick:e=>{ filter=a; [...mood.children].forEach(c=>c.className='tchip'); e.currentTarget.className='tchip on'; show(); }})));
  m.appendChild(panel(L({en:'Mood / series filter',ja:'シリーズで絞り込み'}),mood));
  m.appendChild(card); show();
};

/* ============================================================
   20 — ISEKAI STORY BUILDER
   ============================================================ */
TOOLS_IMPL['isekai']=(m)=>{
  const out=h('div');
  const gen=()=>{
    const w=pick(ISEKAI.worlds),tr=pick(ISEKAI.trans),cl=pick(ISEKAI.classes),pa=pick(ISEKAI.party),st=pick(ISEKAI.stakes),tw=pick(ISEKAI.twists);
    const text='Our hero '+tr+' and ends up in '+w+'. Their class: '+cl+', joined by '+pa+'. '+st.charAt(0).toUpperCase()+st.slice(1)+'. And the twist — '+tw+'.';
    clear(out);
    out.appendChild(h('div.quote-card',h('div.q',text),
      h('div.row',{style:'margin-top:12px'},
        btn('📋 '+L(S.copied),'',()=>copyText(text)),
        btn('🌀 '+L({en:'Re-roll premise',ja:'再生成'}),'primary',gen),
        btn('✍️ '+L({en:'Continue as full story',ja:'物語に発展'}),'',()=>openTool('story',{seed:true})))));
    out.appendChild(h('div.chipset',{style:'margin-top:12px'},
      h('span.tchip.on',{html:labelHTML('🌍 '+w.slice(0,34))}),h('span.tchip.on',{html:labelHTML('⚡ '+cl)}),h('span.tchip.on',{html:labelHTML('⚠ '+st.slice(0,34))}),h('span.tchip.on',' twist')));
  };
  m.appendChild(h('p.hint',{html:L({en:'Randomly assembles a transport, world, class, party, stake and twist.',ja:'転移・世界・クラス・仲間・危机・真相をランダムに組み立てます。'})}));
  m.appendChild(h('div.row',btn('🌀 '+L({en:'Build my isekai',ja:'異世界を生成'}),'primary',gen)));
  m.appendChild(out); gen();
};

/* ============================================================
   21 — ANIME ART STYLE FINDER (quiz)
   ============================================================ */
TOOLS_IMPL['artstyle']=(m)=>{
  const out=h('div'); let qi=0; const score={};
  ART_STYLES.forEach(s=>score[s.id]=0);
  const bar=h('div');
  const render=()=>{
    clear(bar);
    bar.appendChild(h('div.quiz-bar',h('i',{style:'width:'+Math.round(qi/ART_QUIZ.length*100)+'%'})));
    if(qi>=ART_QUIZ.length){ result(); return; }
    const q=ART_QUIZ[qi];
    const box=h('div',h('h3.quiz-q',(qi+1)+'. '+q.q),h('div.quiz-opts'));
    q.o.forEach(o=>box.appendChild(h('button.quiz-opt',{type:'button',onclick:()=>{
      for(const k in o.s) score[k]=(score[k]||0)+o.s[k];
      qi++; render();
    }},o.t)));
    bar.appendChild(box);
  };
  const result=()=>{
    const ranked=ART_STYLES.map(s=>({s,v:score[s.id]||0})).sort((a,b)=>b.v-a.v);
    const best=ranked[0], second=ranked[1];
    clear(bar);
    bar.appendChild(h('div.panel',
      h('div.panel-title',L({en:'Your art style match',ja:'あなたのアートスタイル'})),
      h('div.quote-card',h('div.q',best.s.n),h('div.who',best.s.ja),
        h('p.syn',{style:'margin-top:10px'},best.s.d),
        h('div.chipset',{style:'margin-top:10px'},...best.s.pal.map(p=>h('span.tchip',{style:'background:'+p+';border-color:rgba(0,0,0,.3)',html:p}))),
        h('p.hint',{style:'margin-top:10px'},L({en:'Example works:',ja:'例：'})+' '+best.s.ex.join(' · ')),
        h('p.hint',{html:L({en:'Runner-up:',ja:'次点：'})+' <b>'+second.s.n+'</b> ('+second.v+' vs '+best.v+')'}),
        h('div.row',{style:'margin-top:12px'},
          btn('♻️ '+L({en:'Retake quiz',ja:'再診断'}),'',()=>{ qi=0; ART_STYLES.forEach(s=>score[s.id]=0); render(); }),
          btn('🔍 '+L({en:'Find anime like these',ja:'似たアニメを探す'}),'primary',()=>openTool('finder',{q:best.s.ex[0]})))))
    );
  };
  m.appendChild(bar); render();
};

/* ============================================================
   22 — ANIME BY GENRE
   ============================================================ */
TOOLS_IMPL['genre']=(m)=>{
  const slot=h('div');
  const list=makeList(m,{rank:true,emptyMsg:L({en:'No anime in this genre yet.',ja:'このジャンルの作品がありません。'})});
  getGenres().then(gs=>{
    const grid=h('div.chipset');
    gs.slice(0,44).forEach(g=>grid.appendChild(h('button.tchip',{type:'button',html:g.name+' <span style="opacity:.55">'+(g.count||'')+'</span>',
      onclick:()=>{ list.go(1,{genres:g.mal_id,order_by:'members',sort:'desc',limit:24}); window.scrollTo({top:m.offsetTop+180,behavior:'smooth'}); }})));
    clear(slot); slot.appendChild(grid);
  }).catch(()=>slot.appendChild(emptyBox()));
  m.appendChild(panel(L({en:'Pick a genre',ja:'ジャンルを選ぶ'}),slot));
  m.appendChild(h('p.hint',L({en:'Results are ranked by popularity inside that genre.',ja:'ジャンル内の人気順で表示します。'})));
  list.go(1,{order_by:'members',sort:'desc',limit:12});
};

/* ============================================================
   23 — ANIME TYPE GUIDE
   ============================================================ */
TOOLS_IMPL['type-guide']=(m)=>{
  const grid=h('div.results');
  TYPES.forEach(t=>grid.appendChild(h('article.acard',h('div.ac-body',
    h('div.ac-title','「'+t.t+'」 — '+t.n),
    h('div.ac-snip',t.d),
    h('div.ac-meta',t.nNote),
    h('div.ac-actions',btnI('🔎 '+L({en:'Browse '+t.t,ja:t.t+' を見る'}),'','primary',()=>list.go(1,{type:t.t.toLowerCase(),order_by:'members',sort:'desc',limit:24})))))));
  m.appendChild(panel(L({en:'Formats explained',ja:'形式ガイド'}),grid));
  const list=makeList(m,{rank:true});
  list.go(1,{type:'tv',order_by:'members',sort:'desc',limit:12});
};

/* ============================================================
   24 — ANIME CATALOG (seasons)
   ============================================================ */
TOOLS_IMPL['catalog']=(m)=>{
  const now=new Date();
  const years=[]; for(let y=now.getFullYear()+1;y>=1975;y--) years.push(String(y));
  const ySel=selEl(years,String(now.getFullYear()));
  const seasons=[['winter',L({en:'Winter',ja:'冬'})],['spring',L({en:'Spring',ja:'春'})],['summer',L({en:'Summer',ja:'夏'})],['fall',L({en:'Fall',ja:'秋'})]];
  const sChip=chipset(seasons.map(([v,t])=>({t,v,on:v===['winter','spring','summer','fall'][Math.floor(now.getMonth()/3)]})),{onchange:v=>run(1)});
  const list=makeList(m,{rank:true});
  const run=(page=1)=>{ const s=sChip.get()[0]||'spring'; withBusy(list.out,async r=>{
    const j=await japi('/seasons/'+ySel.value+'/'+s,{page,limit:24});
    const items=(j.data||[]).filter(Boolean);
    clear(r);
    if(!items.length){ r.appendChild(emptyBox(L({en:'No season data for that pick.',ja:'該当シーズンのデータがありません。'}),'🗃️')); return; }
    const g=h('div.results'); items.forEach(x=>g.appendChild(mediaCard(x,{snip:true}))); r.appendChild(g);
    const pg=pager(j.pagination,np=>run(np)); if(pg) r.appendChild(pg);
  }); };
  m.appendChild(panel(L({en:'Choose a season',ja:'シーズンを選ぶ'}),
    h('div.row',field(L({en:'Year',ja:'年'}),ySel),sChip.el),
    h('div.row',{style:'margin-top:10px'},btn('🗃️ '+L(S.run),'primary',()=>run(1)))));
  run(1);
};

/* ============================================================
   25 — TOP ANIME CHARTS
   ============================================================ */
TOOLS_IMPL['top']=(m)=>{
  const tabs=[
    {t:L({en:'Overall',ja:'総合'}),p:'/top/anime',q:{}},
    {t:L({en:'Airing now',ja:'放送中'}),p:'/top/anime',q:{filter:'airing'}},
    {t:L({en:'Upcoming',ja:'放送予定'}),p:'/top/anime',q:{filter:'upcoming'}},
    {t:L({en:'Most popular',ja:'人気順'}),p:'/top/anime',q:{filter:'bypopularity'}},
    {t:L({en:'Top manga',ja:'漫画'}),p:'/top/manga',q:{}}
  ];
  const bar=h('div.chipset');
  tabs.forEach((t,i)=>bar.appendChild(h('button.tchip',{type:'button',html:t.t,onclick:()=>sel(i)})));
  m.appendChild(panel(L({en:'Official charts',ja:'公式ランキング'}),bar));
  const out=h('div'); m.appendChild(out);
  let cur=0;
  function sel(i,page=1){
    cur=i; [...bar.children].forEach((c,j)=>c.className=j===i?'tchip on':'tchip');
    withBusy(out,async r=>{
      const j=await japi(tabs[i].p,Object.assign({limit:25},tabs[i].q,{page}));
      const items=(j.data||[]).filter(Boolean);
      clear(r);
      if(!items.length){ r.appendChild(emptyBox()); return; }
      const g=h('div.results');
      items.forEach((x,k)=>g.appendChild(mediaCard(x,{kind:tabs[i].p.includes('manga')?'manga':'anime',rank:((page-1)*25)+k+1,snip:true})));
      r.appendChild(g);
      const pg=pager(j.pagination,np=>sel(i,np)); if(pg) r.appendChild(pg);
    });
  }
  sel(0);
};

/* ============================================================
   26 — DUB ANIME (directory)
   ============================================================ */
TOOLS_IMPL['dub-anime']=(m)=>{
  const qIn=inp({placeholder:L({en:'Filter dubbed titles…',ja:'吹き替え作品を絞り込む…'}),autocomplete:'off'});
  const langSel=selEl([{v:'',t:L({en:'Any language',ja:'全言語'})},'EN','ES','FR','IT','DE','PT','AR','RU','PL','TR','HI'],'');
  const out=h('div');
  const paint=()=>{
    const q=norm(qIn.value), lang=langSel.value;
    clear(out);
    const rows=Object.keys(DUBS).filter(k=>(!q||k.includes(q))&&(!lang||DUBS[k].split(' ').includes(lang)));
    if(!rows.length){ out.appendChild(emptyBox(L({en:'No dubbed title matches that filter.',ja:'該当する吹き替え作品がありません。'}),'🗣️')); return; }
    out.appendChild(h('p.hint',rows.length+' '+L({en:'titles found',ja:'件'})));
    rows.slice(0,60).forEach(k=>out.appendChild(h('div.track',
      h('div',h('div.t',k.replace(/\b\w/g,c=>c.toUpperCase())),h('div.a',DUBS[k])),
      h('div.row.tight',{style:'margin-left:auto'},
        btnI('🔎 '+L({en:'Find',ja:'検索'}),'','small',()=>openTool('finder',{q:k})),
        btnI('🗣️ '+L({en:'Check',ja:'確認'}),'','small gold',()=>openTool('dub',{q:k}))))));
  };
  qIn.addEventListener('input',paint); langSel.addEventListener('change',paint);
  m.appendChild(panel(L({en:'Dubbed directory (community index)',ja:'吹き替えディレクトリ（コミュニティ索引）'}),
    h('div.row',field(L({en:'Search',ja:'検索'}),qIn),field(L({en:'Language',ja:'言語'}),langSel))));
  paint();
};

/* ============================================================
   27 — MANGA PANELS GENERATOR
   ============================================================ */
TOOLS_IMPL['panels']=(m)=>{
  const {wrap,c,ctx}=mkCanvas(720,1018);
  const LAYOUTS=[[3,'top-heavy'],[4,'4-koma'],[6,'grid'],[3,'splash'],[5,'irregular']];
  const TONES=['dots','speed','sky','blank'];
  let seed=randSeed(), layout=0, tone=0;
  const caps=[];
  function rects(n,W,H){
    if(n===3) return [[0,0,W,.3],[0,.31,W,.34],[0,.66,W,.34]].map(r=>[r[0]*W,r[1]*H,r[2]*W,r[3]*H]);
    if(n===4) return [0,.25,.5,.75].map(y=>[0,y*H,W,.23*H]);
    if(n===6) return [0,.5].flatMap(y=>[0,.34,.67].map(x=>[x*W+(x?6:0),y*H+ (y?6:0),W*.33-6,H*.47-6]));
    if(n===3&&layout===3) return [[0,0,W,H*.6],[0,H*.61,W*.49,H*.39],[W*.51,H*.61,W*.49,H*.39]];
    return [[0,0,W*.6,H*.5],[W*.61,0,W*.39,H*.3],[W*.61,H*.31,W*.39,H*.19],[0,H*.51,W*.5,H*.49],[W*.51,H*.51,W*.49,H*.49]];
  }
  function draw(){
    const R=mulberry(seed), W=c.width, H=c.height;
    ctx.fillStyle='#fdfbf3'; ctx.fillRect(0,0,W,H);
    const n=LAYOUTS[layout][0];
    const rs=(layout===3&&n===3)?[[0,0,W,H*.6],[0,H*.61,W*.49,H*.39],[W*.51,H*.61,W*.49,H*.39]]:rects(n,W,H);
    rs.forEach((r,i)=>{
      const [x,y,w,hh]=r;
      ctx.fillStyle='#fff'; ctx.fillRect(x,y,w,hh);
      ctx.save(); ctx.beginPath(); ctx.rect(x,y,w,hh); ctx.clip();
      ctx.fillStyle='#fff'; ctx.fillRect(x,y,w,hh);
      if(TONES[tone]==='dots'){ ctx.fillStyle='rgba(20,22,29,.28)'; for(let yy=y;yy<y+hh;yy+=9) for(let xx=x;xx<x+w;xx+=9){ ctx.beginPath(); ctx.arc(xx,yy,2,0,7); ctx.fill(); } }
      if(TONES[tone]==='speed'){ ctx.strokeStyle='rgba(20,22,29,.5)'; ctx.lineWidth=2; for(let s=0;s<26;s++){ ctx.beginPath(); const a=R()*6.28, x0=x+w/2+Math.cos(a)*w*.2, y0=y+hh/2+Math.sin(a)*hh*.2; ctx.moveTo(x0,y0); ctx.lineTo(x0+Math.cos(a)*w, y0+Math.sin(a)*hh); ctx.stroke(); } }
      if(TONES[tone]==='sky'){ const g=ctx.createLinearGradient(0,y,0,y+hh); g.addColorStop(0,'#cfe6f5'); g.addColorStop(1,'#fff'); ctx.fillStyle=g; ctx.fillRect(x,y,w,hh);
        ctx.fillStyle='rgba(255,255,255,.9)'; for(let k=0;k<3;k++){ const cx2=x+R()*w, cy2=y+R()*hh*.5; ctx.beginPath(); ctx.ellipse(cx2,cy2,40+R()*40,16+R()*12,0,0,7); ctx.fill(); } }
      if(TONES[tone]==='blank'){ ctx.fillStyle='rgba(216,169,74,.10)'; ctx.fillRect(x,y,w,hh); }
      // scribbled figure suggestion
      ctx.strokeStyle='rgba(20,22,29,.85)'; ctx.lineWidth=3;
      const fx=x+w*(.3+R()*.4), fy=y+hh*(.55+R()*.3);
      ctx.beginPath(); ctx.arc(fx,fy-38,20,0,7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(fx,fy-18); ctx.lineTo(fx,fy+16); ctx.moveTo(fx-24,fy-4); ctx.lineTo(fx+24,fy-6); ctx.moveTo(fx,fy+16); ctx.lineTo(fx-18,fy+46); ctx.moveTo(fx,fy+16); ctx.lineTo(fx+18,fy+46); ctx.stroke();
      ctx.restore();
      ctx.strokeStyle='#14161d'; ctx.lineWidth=6; ctx.strokeRect(x,y,w,hh);
      if(caps[i]){
        ctx.fillStyle='rgba(253,251,243,.95)'; ctx.strokeStyle='#14161d'; ctx.lineWidth=3;
        const tw=Math.min(w-24,ctx.measureText(caps[i]).width+30);
        ctx.fillRect(x+10,y+10,tw,40); ctx.strokeRect(x+10,y+10,tw,40);
        ctx.fillStyle='#14161d'; ctx.font='700 21px Georgia,serif'; ctx.fillText(caps[i],x+22,y+37);
      }
    });
    ctx.fillStyle='#d8452b'; ctx.fillRect(W-72,H-72,54,54);
    ctx.fillStyle='#fff'; ctx.font='800 26px Georgia,serif'; ctx.fillText('漫',W-58,H-34);
  }
  const capInputs=h('div.chipset');
  for(let i=0;i<5;i++){ const ci=inp({placeholder:'Caption '+(i+1),value:caps[i]||'',style:'width:150px'}); ci.addEventListener('input',()=>{ caps[i]=ci.value; draw(); }); capInputs.appendChild(ci); }
  m.appendChild(h('div.row',
    btn('🗂️ '+L({en:'Shuffle layout',ja:'レイアウト変更'}),'primary',()=>{ layout=(layout+1)%LAYOUTS.length; draw(); }),
    btn('🎞️ '+L({en:'Screentone',ja:'トーン変更'}),'',()=>{ tone=(tone+1)%TONES.length; draw(); }),
    btn('🎲 '+L({en:'Randomize',ja:'ランダム'}),'',()=>{ seed=randSeed(); draw(); }),
    btn('⬇️ '+L(S.download),'gold',()=>dlCanvas(c,'manga-page.png'))));
  m.appendChild(panel(L({en:'Captions',ja:'キャプション'}),capInputs));
  m.appendChild(wrap); draw();
};

/* ============================================================
   28 — ANIME SCENE SEARCH
   ============================================================ */
TOOLS_IMPL['scenes']=(m,preset={})=>{
  const qIn=inp({value:preset.q||'',placeholder:L({en:'e.g. "final battle", "confession", "train"…',ja:'例：「決戦」「告白」…'}),autocomplete:'off'});
  const local=h('div');
  const paint=()=>{
    const q=norm(qIn.value);
    clear(local);
    const hits=SCENES.filter(s=>!q||norm(s.a+' '+s.t+' '+s.d).includes(q));
    if(!hits.length){ local.appendChild(emptyBox(L({en:'No famous scene matches — try the episode lookup below.',ja:'名シーン索引に一致なし。下の話数検索をどうぞ。'}),'🎬')); return; }
    hits.forEach(s=>local.appendChild(h('div.track',
      h('div',h('div.t',s.t),h('div.a',s.a+' · '+s.e),h('div.a',{style:'margin-top:3px'},s.d)),
      h('div.row.tight',{style:'margin-left:auto'},
        btnI('🔎 '+L({en:'Anime',ja:'作品'}),'','small',()=>openTool('finder',{q:s.a})),
        btnI('📺 '+L({en:'Episodes',ja:'話数'}),'','small gold',()=>openTool('hub',{q:s.a}))))));
  };
  qIn.addEventListener('input',paint);
  m.appendChild(panel(L({en:'Famous scenes index',ja:'名シーン索引'}),h('div.row',qIn),h('div',{style:'margin-top:10px'},local)));
  const epOut=h('div');
  m.appendChild(panel(L({en:'Episode title lookup (live)',ja:'話タイトル検索（ライブ）'}),
    h('p.hint',{html:L({en:'Picks matching anime and scans its first episode page for your keyword.',ja:'一致した作品を選び、第1話ページを照合します。'})}),
    searchBox({initial:preset.q||'',placeholder:L({en:'Anime to scan…',ja:'スキャンする作品…'}),onPick:a=>withBusy(epOut,async r=>{
      const j=await japi('/anime/'+a.mal_id+'/episodes');
      const eps=(j.data||[]).filter(Boolean);
      const q=norm(qIn.value);
      const hits=eps.filter(e=>q&&norm(e.title+' '+(e.title_japanese||'')).includes(q));
      clear(r);
      if(!hits.length){ r.appendChild(emptyBox(L({en:'No episode titles matched that keyword on page 1.',ja:'第1ページの話タイトルに一致なし。'}),'🎬')); return; }
      hits.forEach(e=>r.appendChild(h('div.track',h('div',h('div.t','EP '+(e.episode||'?')+' — '+(e.title||'Untitled')),h('div.a',(e.aired||'')+(e.filler?' · '+L({en:'filler',ja:'再放送/番外'}):'')+(e.recap?' · recap':''))),
        h('a.btn.small.gold',{style:'margin-left:auto',href:'https://myanimelist.net/anime/'+a.mal_id+'/episode/'+(e.mal_id||e.episode),target:'_blank',rel:'noopener'},L({en:'MAL',ja:'MAL'})))));
    })}),epOut));
  paint();
};

/* ============================================================
   29 — WATCHED / PLANNED BOARD
   ============================================================ */
TOOLS_IMPL['board']=(m)=>{
  const COLS=[{k:'planned',t:L({en:'Planned',ja:'見る予定'}),c:'#31507d'},{k:'watching',t:L({en:'Watching',ja:'視聴中'}),c:'#c9a227'},{k:'watched',t:L({en:'Watched',ja:'完了'}),c:'#4f9d5d'}];
  let dragId=null;
  const board=h('div.kanban');
  const paint=()=>{
    clear(board);
    const items=WL.list();
    COLS.forEach(col=>{
      const cEl=h('div.kcol');
      const mine=items.filter(i=>(i.st||'planned')===col.k);
      cEl.appendChild(h('h4',{style:'color:'+col.c},col.t+' ',h('span',String(mine.length))));
      mine.forEach(it=>{
        const card=h('div.kcard',{draggable:'true'});
        card.addEventListener('dragstart',()=>{ dragId=it.id; });
        card.addEventListener('dragend',()=>{ dragId=null; board.querySelectorAll('.kcol').forEach(x=>x.classList.remove('over')); });
        if(it.img) card.appendChild(h('img',{src:it.img,onerror(){this.style.visibility='hidden'}}));
        card.appendChild(h('span.grow',it.t||it.r));
        card.appendChild(h('span.x',{title:L(S.remove),'aria-label':'remove',onclick:e=>{ e.stopPropagation(); WL.rm(it.id); paint(); }}));
        cEl.appendChild(card);
      });
      if(!mine.length) cEl.appendChild(h('div.hint',L({en:'drop here',ja:'ここへ'})));
      cEl.addEventListener('dragover',e=>{ e.preventDefault(); cEl.classList.add('over'); });
      cEl.addEventListener('dragleave',()=>cEl.classList.remove('over'));
      cEl.addEventListener('drop',e=>{ e.preventDefault(); cEl.classList.remove('over'); if(dragId){ WL.patch(dragId,{st:col.k}); paint(); toast('📌 → <b>'+col.t+'</b>'); } });
      board.appendChild(cEl);
    });
  };
  m.appendChild(h('div.row',
    btn('＋ '+L({en:'Add title',ja:'タイトル追加'}),'primary',()=>quickPick({onPick:a=>{ WL.add(a,'planned'); paint(); }})),
    btn('🧹 '+L({en:'Remove missing',ja:'欠損を削除'}),'',()=>{ WL.list().forEach(i=>{ if(!i.t) WL.rm(i.id); }); paint(); }),
    h('span.hint',{style:'margin-left:auto',html:L({en:'Drag cards between columns — status saves instantly.',ja:'カードをドラッグで移動・即保存。'})})));
  m.appendChild(board); paint();
};

/* ============================================================
   30 — ANIME REVIEWS
   ============================================================ */
TOOLS_IMPL['reviews']=(m,preset={})=>{
  const out=h('div');
  m.appendChild(panel(L({en:'Community reviews',ja:'コミュニティレビュー'}),
    searchBox({initial:preset.q||'',placeholder:L({en:'Anime title…',ja:'アニメ名…'}),onPick:a=>load(a)})));
  m.appendChild(out);
  function load(a){
    withBusy(out,async r=>{
      const j=await japi('/anime/'+a.mal_id+'/reviews',{preliminary:false});
      const items=(j.data||[]).filter(Boolean);
      clear(r);
      r.appendChild(h('div.panel',h('div.panel-title',a.title)));
      if(!items.length){ r.appendChild(emptyBox(L({en:'No reviews indexed for this title.',ja:'この作品のレビューは未収録です。'}),'📝')); return; }
      items.slice(0,8).forEach(rv=>{
        const el=h('div.panel');
        el.appendChild(h('div.row',h('b',rv.user?rv.user.username:'—'),
          h('span.badge.gold','★ '+(rv.score||'—')),
          h('span.badge',(rv.data_created||'').slice(0,10)),
          h('span',{style:'flex:1'})));
        const text=String(rv.content||'').replace(/\s+/g,' ').trim();
        const p=h('p.syn',text.slice(0,320)+'…');
        el.appendChild(p);
        el.appendChild(h('div.row',{style:'margin-top:8px'},
          btnI('📖 '+L({en:'Read full',ja:'全文'}),'','small',()=>{ p.textContent=text; }),
          btnI('🔗 '+L({en:'On MAL',ja:'MALで'}),'','small gold',()=>window.open(rv.url||('https://myanimelist.net/anime/'+a.mal_id+'/reviews'),'_blank','noopener'))));
        r.appendChild(el);
      });
    });
  }
};
