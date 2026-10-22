/* ============================================================
   ANIME ZAKI TOOLS — tools2.js  (tools 31..60)
   ============================================================ */

/* ============================================================
   31 — ANIME MUSIC PLAYER (curated stations)
   ============================================================ */
TOOLS_IMPL['player']=(m)=>{
  const STATIONS=[
    {v:'op',t:'💿 '+L({en:'Openings',ja:'オープニング'})},
    {v:'ed',t:'🌙 '+L({en:'Endings',ja:'エンディング'})},
    {v:'jpop',t:'J-pop'},
    {v:'kpop',t:'K-pop'},
    {v:'all',t:'🎵 '+L({en:'Everything',ja:'すべて'})}
  ];
  const np=h('div.np',h('div.grow',h('div.a',L({en:'Select a track — it plays right here in the tool.',ja:'曲を選択。このツール内でそのまま再生。'}))));
  const listEl=h('div');
  let curHits=[];
  const paint=(tag)=>{
    clear(listEl);
    const hits=SONGS.filter(s=>tag==='all'||s.tag===tag);
    curHits=hits;
    if(!hits.length){ listEl.appendChild(emptyBox()); return; }
    hits.forEach(s=>{
      const row=h('div.track');
      row.appendChild(btnI('▶',L({en:'Play in tool',ja:'ツール内で再生'}),'',
        ()=>{ setNP(s); playSong(s,listEl,hits); }));
      row.appendChild(h('div.grow',h('div.t',s.t),h('div.a',s.a+' · '+s.an)));
      row.appendChild(h('span.badge.'+(s.tag==='op'?'red':s.tag==='ed'?'green':'gold'),{html:s.tag.toUpperCase()}));
      row.appendChild(h('div.row.tight',
        h('a.btn.small',{href:spLink(s),target:'_blank',rel:'noopener'},'Spotify'),
        h('a.btn.small',{href:amLink(s),target:'_blank',rel:'noopener'},'Apple'),
        btnI('📋','','small',()=>copyText(s.t+' — '+s.a))));
      listEl.appendChild(row);
    });
  };
  function setNP(s){
    clear(np);
    np.appendChild(h('div.eq',h('i'),h('i'),h('i'),h('i')));
    np.appendChild(h('div.grow',h('div.t',s.t),h('div.a',s.a+' · '+s.an)));
    np.appendChild(btn('▶ '+L({en:'Play here',ja:'ここで再生'}),'small gold',()=>playSong(s,listEl,curHits)));
    np.appendChild(h('a.btn.small',{href:spLink(s),target:'_blank',rel:'noopener'},'Spotify'));
  }
  const chips=chipset(STATIONS,{onchange:v=>paint(v[0]||'op')});
  m.appendChild(panel(L({en:'Stations',ja:'ステーション'}),chips.el));
  m.appendChild(np); m.appendChild(listEl);
  paint('op');
};

/* ============================================================
   32 — ANIME MUSIC MAKER (Web Audio)
   ============================================================ */
let AZ_MM=null;
TOOLS_IMPL['music-maker']=(m)=>{
  const SCALES={
    hirajoshi:{n:'Hirajoshi',s:[0,2,3,7,8]},
    insen:{n:'Insen',s:[0,1,5,7,10]},
    yo:{n:'Yo',s:[0,2,5,7,9]},
    majp:{n:'Major pentatonic',s:[0,2,4,7,9]},
    minp:{n:'Minor pentatonic',s:[0,3,5,7,10]},
    major:{n:'Major',s:[0,2,4,5,7,9,11]},
    minor:{n:'Minor',s:[0,2,3,5,7,8,10]}
  };
  const cfg={bpm:96,scale:'hirajoshi',vol:.6,root:220,seed:randSeed()};
  let ac=null,analyser=null,playing=false,lookahead=null,nextT=0,step=0,walk=4;
  const {wrap,c,ctx2}=(()=>{ const k=mkCanvas(640,110); return {wrap:k.wrap,c:k.c,ctx2:k.ctx}; })();
  const bpmIn=h('input.inp',{type:'range',min:'60',max:'160',value:cfg.bpm,style:'padding:0'});
  const volIn=h('input.inp',{type:'range',min:'0',max:'100',value:'60',style:'padding:0'});
  const scSel=selEl(Object.keys(SCALES).map(k=>({v:k,t:SCALES[k].n})),cfg.scale);
  function ensureAudio(){
    if(ac) return;
    ac=new (window.AudioContext||window.webkitAudioContext)();
    const master=ac.createGain(); master.gain.value=cfg.vol;
    analyser=ac.createAnalyser(); analyser.fftSize=128;
    master.connect(analyser); analyser.connect(ac.destination);
    ac._master=master;
    const buf=ac.createBuffer(1,ac.sampleRate*.3,ac.sampleRate);
    const d=buf.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
    ac._noise=buf;
    drawViz();
  }
  const R=()=>mulberry(cfg.seed+step)();
  function tone(t,freq,dur,type='triangle',gain=.16,filterHz=2200){
    const o=ac.createOscillator(),g=ac.createGain(),f=ac.createBiquadFilter();
    o.type=type; o.frequency.value=freq; f.type='lowpass'; f.frequency.value=filterHz;
    g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(gain,t+.012);
    g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.connect(f); f.connect(g); g.connect(ac._master); o.start(t); o.stop(t+dur+.05);
  }
  function kick(t){
    const o=ac.createOscillator(),g=ac.createGain();
    o.frequency.setValueAtTime(150,t); o.frequency.exponentialRampToValueAtTime(44,t+.14);
    g.gain.setValueAtTime(.5,t); g.gain.exponentialRampToValueAtTime(.0001,t+.2);
    o.connect(g); g.connect(ac._master); o.start(t); o.stop(t+.25);
  }
  function hat(t){
    const s=ac.createBufferSource(); s.buffer=ac._noise;
    const f=ac.createBiquadFilter(); f.type='highpass'; f.frequency.value=7000;
    const g=ac.createGain(); g.gain.setValueAtTime(.12,t); g.gain.exponentialRampToValueAtTime(.0001,t+.05);
    s.connect(f); f.connect(g); g.connect(ac._master); s.start(t); s.stop(t+.06);
  }
  function playStep(i,t){
    const sc=SCALES[cfg.scale].s;
    if(i%4===0) kick(t);
    if(i%2===1) hat(t);
    if(i%8===0){
      const deg=sc[(Math.floor(R()*sc.length))%sc.length];
      tone(t,cfg.root/2*Math.pow(2,deg/12),1.4,'sine',.12,700);
      tone(t,cfg.root/2*Math.pow(2,(deg+7)/12),1.4,'sine',.07,700);
    }
    if(R()<.5){
      walk+=(R()<.5?-1:1)*(R()<.25?2:1);
      walk=Math.max(0,Math.min(sc.length*2-1,walk));
      const oct=Math.floor(walk/sc.length), deg=sc[walk%sc.length];
      tone(t,cfg.root*Math.pow(2,(deg+oct*12)/12),.34,'triangle',.14,3000);
    }
    if(i%16===14) tone(t,cfg.root*2*Math.pow(2,(sc[sc.length-1])/12),.6,'sine',.1,4000);
  }
  function schedule(){
    if(!playing) return;
    const spb=(60/cfg.bpm)/2;
    while(nextT<ac.currentTime+.14){ playStep(step,nextT); nextT+=spb; step++; }
  }
  function drawViz(){
    if(!analyser) return;
    const arr=new Uint8Array(analyser.frequencyBinCount);
    const loop=()=>{
      if(!ctx2) return;
      analyser.getByteFrequencyData(arr);
      ctx2.clearRect(0,0,c.width,c.height);
      const bw=c.width/arr.length;
      for(let i=0;i<arr.length;i++){
        const v=arr[i]/255, bh=v*c.height*.9;
        ctx2.fillStyle=playing?accRGBA(0.35+v*.65):accRGBA(.18);
        ctx2.fillRect(i*bw+1,c.height-bh,bw-2,bh||2);
      }
      requestAnimationFrame(loop);
    };
    loop();
  }
  const playBtn=btn('▶ '+L({en:'Play',ja:'再生'}),'primary',()=>{
    ensureAudio(); if(ac.state==='suspended') ac.resume();
    playing=!playing;
    if(playing){ nextT=ac.currentTime+.06; step=0; cfg.seed=randSeed(); lookahead=setInterval(schedule,30); playBtn.innerHTML=labelHTML('⏹ '+L({en:'Stop',ja:'停止'})); playBtn.className='btn danger'; }
    else{ clearInterval(lookahead); playBtn.innerHTML=labelHTML('▶ '+L({en:'Play',ja:'再生'})); playBtn.className='btn primary'; }
    if(typeof MDK!=='undefined'){ if(playing) MDK.attachGen(); else MDK.sync(); }
  });
  bpmIn.addEventListener('input',()=>cfg.bpm=+bpmIn.value);
  volIn.addEventListener('input',()=>{ cfg.vol=+volIn.value/100; if(ac) ac._master.gain.value=cfg.vol; if(typeof MDK!=='undefined') MDK.mirrorVol(cfg.vol); });
  scSel.addEventListener('change',()=>cfg.scale=scSel.value);
  m.appendChild(panel(L({en:'Compose',ja:'作曲'}),
    h('div.row',field(L({en:'Scale',ja:'スケール'}),scSel),
      field(L({en:'Tempo: ',ja:'テンポ: '})+cfg.bpm,bpmIn),
      field(L({en:'Volume',ja:'音量'}),volIn)),
    h('div.row',{style:'margin-top:10px'},playBtn,
      btn('🎲 '+L({en:'New seed',ja:'新しいシード'}),'',()=>{ cfg.seed=randSeed(); toast('🎲 seed → <b>'+cfg.seed+'</b>'); }),
      btn('📖 '+L({en:'How to use',ja:'使い方'}),'',()=>toast('🎧 '+L({en:'Pick a scale, press Play — a generative melody loops live.',ja:'スケールを選んで再生。生成メロディがループします。'}))))));
  m.appendChild(h('p.hint',{html:L({en:'Runs 100% locally with the Web Audio API — no downloads, no accounts.',ja:'Web Audio APIで100%ローカル動作。DLも登録も不要。'})}));
  AZ_MM={
    toggle:()=>playBtn.click(),
    isPlaying:()=>playing,
    getVol:()=>cfg.vol,
    setVol:v=>{ cfg.vol=Math.max(0,Math.min(1,v)); volIn.value=Math.round(cfg.vol*100); if(ac&&ac._master) ac._master.gain.value=cfg.vol; },
    stop:()=>{ if(playing) playBtn.click(); }
  };
  m.appendChild(wrap);
};

/* ============================================================
   33 — RANDOM ANIME MUSIC
   ============================================================ */
TOOLS_IMPL['rand-music']=(m)=>{
  const out=h('div');
  const roll=()=>{
    const s=pick(SONGS);
    clear(out);
    out.appendChild(h('div.quote-card',h('div.quote-mark','♪'),
      h('div.q',s.t),h('div.who',s.a+' · '+s.an+' · ['+s.tag.toUpperCase()+']'),
      h('div.row',{style:'margin-top:12px'},
        btn('▶ '+L({en:'Play here',ja:'ここで再生'}),'primary',()=>playSong(s,out)),
        btn('Spotify','',()=>window.open(spLink(s),'_blank','noopener')),
        btn('Apple Music','',()=>window.open(amLink(s),'_blank','noopener')),
        btn('♻️ '+L(S.again),'',roll))));
    out.appendChild(h('p.hint',{html:L({en:'▶ plays inside this tool — Spotify / Apple open official search results. No pirated audio, ever.',ja:'▶はこのツール内で再生。Spotify / Appleは公式検索結果を開きます。違法音源は扱いません。'})}));
  };
  m.appendChild(h('div.row',btn('📻 '+L({en:'Roll a track',ja:'曲を抽選'}),'primary',roll),btn('🎵 '+L({en:'Open the player',ja:'プレイヤー'}),'',()=>openTool('player'))));
  m.appendChild(out); roll();
};

/* ============================================================
   34 — J-POP / K-POP LISTENER
   ============================================================ */
TOOLS_IMPL['jkpop']=(m)=>{
  const stations=[
    {v:'jpop',t:'J-pop',q:'Japanese city pop playlist'},
    {v:'kpop',t:'K-pop',q:'K-pop hits playlist'}
  ];
  const out=h('div');
  const paint=(tag,q)=>{
    clear(out);
    const hits=SONGS.filter(s=>s.tag===tag);
    out.appendChild(h('div.row',btn('▶ '+L({en:'Full playlist search',ja:'フル再生リスト検索'}),'primary',()=>window.open('https://music.youtube.com/search?q='+encodeURIComponent(q),'_blank','noopener')),
      h('a.btn.gold',{href:'https://open.spotify.com/search/'+encodeURIComponent(q),target:'_blank',rel:'noopener'},'Spotify'),
      h('a.btn',{href:'https://music.apple.com/us/search?term='+encodeURIComponent(q),target:'_blank',rel:'noopener'},'Apple Music')));
    hits.forEach(s=>out.appendChild(h('div.track',
      btnI('▶',L({en:'Play in tool',ja:'ツール内で再生'}),'',()=>playSong(s,out,hits)),
      h('div.grow',h('div.t',s.t),h('div.a',s.a)),
      btnI('📋','','small',()=>copyText(s.t+' — '+s.a)))));
    out.appendChild(h('p.hint',{html:L({en:'▶ plays inside this tool — the playlist search and official services are for full albums. Full-length audio only via official services.',ja:'▶はこのツール内で再生。フル音源は公式サービス経由のみ。'})}));
  };
  const chips=chipset(stations.map(s=>({t:s.t,v:s.v})),{onchange:v=>{ const st=stations.find(x=>x.v===(v[0]||'jpop')); paint(st.v,st.q); }});
  m.appendChild(panel(L({en:'Choose a station',ja:'ステーションを選択'}),chips.el));
  m.appendChild(out); paint('jpop',stations[0].q);
};

/* ============================================================
   35 — RANDOM ANIME WALLPAPER
   ============================================================ */
/* --- free, keyless artwork fallbacks (nekos.life → NekosBest → AniList banners) --- */
async function randomArt(n=6){
  const tries=[
    /* nekos.life — one image per call, CORS-friendly everywhere, so fan out in parallel */
    async()=>{
      const jobs=[];
      for(let i=0;i<Math.min(n,8);i++)
        jobs.push(xfetch('https://nekos.life/api/v2/img/neko',{cache:'no-store'},6000)
          .then(r=>r.ok?r.json():null).catch(()=>null));
      const rs=await Promise.all(jobs);
      return rs.map(x=>x&&x.url).filter(Boolean);
    },
    async()=>{ const r=await xfetch('https://nekos.best/api/v2/neko?amount='+Math.min(n,20),{cache:'no-store'},7000);
      if(!r.ok) throw new Error('nekos.best '+r.status); const j=await r.json(); return (j.results||[]).map(x=>x.url).filter(Boolean); },
    /* AniList banner art — waifu.im now requires an API key, so banners replace it */
    async()=>{ const q='query($p:Int){Page(page:$p,perPage:30){media(type:ANIME,sort:POPULARITY_DESC,isAdult:false){bannerImage}}}';
      const r=await xfetch('https://graphql.anilist.co',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:q,variables:{p:ri(1,20)}}),cache:'no-store'},7000);
      if(!r.ok) throw new Error('anilist '+r.status); const j=await r.json();
      return ((((j.data||{}).Page||{}).media||[]).map(x=>x.bannerImage).filter(Boolean)); }
  ];
  for(const t of tries){ try{ const u=await t(); if(u&&u.length) return u; }catch(e){} }
  return [];
}
async function randomPictures(n=1){
  const out=[];
  try{
    const j=await japi('/anime',{order_by:'popularity',sort:'asc',limit:25,page:ri(1,50)});
    const items=(j.data||[]).filter(Boolean).slice(0,n);
    /* fetch the picture groups concurrently — 4 at a time instead of one-by-one */
    const groups=await mapLimit(items,4,async a=>{
      const p=await japi('/anime/'+a.mal_id+'/pictures');
      const pics=(p.data||[]).map(x=>x.jpg?.large_image_url||x.jpg?.image_url||x.webp?.large_image_url).filter(Boolean);
      return pics.length?{anime:a,pics,src:{en:'official cover gallery',ja:'公式カバーギャラリー'}}:null;
    });
    groups.filter(Boolean).forEach(g=>out.push(g));
  }catch(e){}
  if(out.length) return out;
  /* MAL unreachable → free keyless image APIs keep the art tools alive */
  const urls=await randomArt(9);
  if(urls.length) out.push({anime:{title:'nekos.life · NekosBest · AniList'},pics:urls,src:{en:'free artwork APIs',ja:'フリー画像API'}});
  return out;
}
TOOLS_IMPL['wallpaper']=(m)=>{
  const bar=h('div.chipset');
  const wrapEl=h('div');
  const SOURCES=[
    {k:'cover',i:'image',t:{en:'Cover gallery',ja:'カバー'}},
    {k:'art',  i:'star', t:{en:'Art · Wallhaven / Konachan',ja:'アート · Wallhaven/Konachan'}},
    {k:'live', i:'play', t:{en:'Live · MotionBGs / MoeWalls',ja:'ライブ · MotionBGs/MoeWalls'}}
  ];
  let src=store.get('azt_wpsrc','cover'), tok=0;
  const row=(label,open)=>h('div.row',{style:'margin-top:10px'},
    btn('🌄 '+L({en:'New wallpaper',ja:'新しい壁紙'}),'primary',load),
    btn('⬇️ '+L({en:'Open full size',ja:'フルサイズ'}),'gold',open),
    h('span.hint',{style:'margin-left:auto',html:'◈ '+label}));
  /* tok guards against a slow earlier load clobbering a newer source switch */
  const load=async()=>{const my=++tok; return withBusy(wrapEl,async r=>{
    if(my!==tok) return;
    /* ---- live video wallpapers (MotionBGs · MoeWalls) ---- */
    if(src==='live'){
      clear(r);
      const list=(typeof WP_LIVE!=='undefined')?WP_LIVE:[];
      if(!list.length){ r.appendChild(emptyBox(L({en:'Live wallpapers unavailable — try another source.',ja:'ライブ壁紙を取得できません。別のソースへ。'}),'🎞️')); return; }
      const it=pick(list);
      const vid=h('video.clip-vid',{src:it.u,poster:it.p||'',muted:true,loop:true,playsinline:true,controls:true,preload:'metadata',
        onerror(){ const w=this.parentElement; if(w) w.innerHTML='<img src="'+(it.p||'')+'" style="display:block;width:100%;height:auto" alt="'+esc(it.t)+'">'; }});
      r.appendChild(h('div.canvas-wrap',vid));
      r.appendChild(row(esc(it.t)+' · '+esc(it.src),()=>window.open(it.page||it.u,'_blank','noopener')));
      return;
    }
    /* ---- static art wallpapers (Wallhaven · Konachan, SFW) ---- */
    if(src==='art'){
      clear(r);
      const list=(typeof WP_ART!=='undefined')?WP_ART:[];
      if(!list.length){ r.appendChild(emptyBox(L({en:'Art wallpapers unavailable — try another source.',ja:'アート壁紙を取得できません。別のソースへ。'}),'🌄')); return; }
      const it=pick(list);
      const host=/wallhaven/.test(it.u)?'Wallhaven':'Konachan';
      const img=h('img',{src:it.u,style:'display:block;width:100%;height:auto',alt:(it.t||'wallpaper'),
        onerror(){ /* flaky host — swap in a clear retry state, keep the buttons below */
          const w=this.parentElement;
          if(w) w.innerHTML='<p class="hint" style="margin:0;padding:22px 14px;text-align:center">'+esc(L({en:'That host didn’t answer — hit “New wallpaper” to roll again.',ja:'サーバー応答なし。「新しい壁紙」で再ロール。'}))+'</p>';
        }});
      r.appendChild(h('div.canvas-wrap',img));
      r.appendChild(row(esc(it.t||'wallpaper')+' · '+host,
        ()=>window.open(it.u,'_blank','noopener')));
      return;
    }
    /* ---- cover gallery (original) ---- */
    clear(r); r.appendChild(busyBox(L({en:'Fetching artwork…',ja:'アートワーク取得中…'})));
    const groups=await randomPictures(3);
    if(my!==tok) return;
    const cands=groups.flatMap(g=>g.pics.map(u=>({u,a:g.anime,src:g.src})));
    clear(r);
    if(!cands.length){ r.appendChild(emptyBox(L({en:'No artwork found — roll again.',ja:'画像が見つかりません。もう一度。'}),'🌄')); return; }
    // prefer landscape by probing natural size
    const measured=await Promise.all(cands.slice(0,12).map(c=>new Promise(res=>{
      const im=new Image(); let done=false;
      const fin=v=>{ if(!done){ done=true; res(v); } };
      im.onload=()=>fin({c,w:im.naturalWidth,h:im.naturalHeight});
      im.onerror=()=>fin(null);
      setTimeout(()=>fin(null),4500); /* some hosts hang — never block the roll */
      im.src=c.u;
    })));
    if(my!==tok) return;
    const ok=measured.filter(Boolean);
    if(!ok.length){ r.appendChild(emptyBox(L({en:'Images failed to load — roll again.',ja:'画像の読込に失敗。もう一度。'}),'🌄')); return; }
    const land=ok.filter(x=>x.w>=x.h);
    const chosen=pick(land.length?land:ok).c;
    clear(r);
    r.appendChild(h('div.canvas-wrap',h('img',{src:chosen.u,style:'display:block;width:100%;height:auto',alt:chosen.a.title+' — wallpaper'})));
    r.appendChild(h('div.row',{style:'margin-top:10px'},
      btn('🌄 '+L({en:'New wallpaper',ja:'新しい壁紙'}),'primary',load),
      btn('⬇️ '+L({en:'Open full size',ja:'フルサイズ'}),'gold',()=>window.open(chosen.u,'_blank','noopener')),
      h('span.hint',{style:'margin-left:auto',html:'◈ '+esc(chosen.a.title)+' · '+L(chosen.src||{en:'official cover gallery',ja:'公式カバーギャラリー'})})));
  });};
  SOURCES.forEach(o=>{
    bar.appendChild(h('button.tchip'+(o.k===src?'.on':''),{type:'button','data-k':o.k,html:ico(o.i)+' '+esc(L(o.t)),onclick:()=>{
      src=o.k; store.set('azt_wpsrc',src);
      [...bar.children].forEach(b=>b.classList.toggle('on',b.dataset.k===src));
      load();
    }}));
  });
  m.appendChild(bar); m.appendChild(wrapEl); load();
};

/* ============================================================
   36 — RANDOM ANIME PICS
   ============================================================ */
TOOLS_IMPL['pics']=(m)=>{
  const MODES=[{k:'clips',i:'film',t:{en:'Random clips (OP/ED)',ja:'ランダムクリップ（OP/ED）'}},
               {k:'scenes',i:'image',t:{en:'Scene pictures',ja:'シーン画像'}}];
  const bar=h('div.chipset');
  const wrapEl=h('div');
  let mode=store.get('azt_picsmode','clips'), tok=0;
  const azF=async(url,opts)=>{ const r=await fetch(url,opts); if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); };

  /* --- AnimeThemes: real opening / ending clips (one paged request) --- */
  async function randomClips(n=6){
    let list=[];
    for(let t=0;t<3&&!list.length;t++){
      try{
        const j=await azF('https://api.animethemes.moe/anime?page[number]='+ri(1,120)+'&include=animethemes.animethemeentries.videos,animethemes.song');
        (j.anime||[]).forEach(a=>{
          if(!a||!a.slug) return;
          (a.animethemes||[]).forEach(th=>{
            const tag=(th.type==='ED'?'ED':'OP');
            const st=th.song&&th.song.title;
            const song=(typeof st==='string')?st:((st&&(st.romaji||st.english))||'');
            (th.animethemeentries||[]).forEach(e=>((e.videos)||[]).forEach(v=>{
              if(v&&v.link) list.push({u:v.link,tag:tag+(song?' · '+song:''),t:a.name||'Anime',site:'https://animethemes.moe/anime/'+a.slug});
            }));
          });
        });
      }catch(e){}
    }
    if(!list.length) return [];
    return shuffle(list).slice(0,n);
  }

  /* --- AniList banners: wide scene artwork from popular shows (not cover art) --- */
  async function randomScenes(n=9){
    const q='query($p:Int,$pp:Int){Page(page:$p,perPage:$pp){media(type:ANIME,sort:POPULARITY_DESC,isAdult:false){'+AL_MEDIA+'}}}';
    const j=await alGql(q,{p:ri(1,14),pp:30});
    const items=(((j.data&&j.data.Page&&j.data.Page.media)||[]).filter(x=>x&&x.bannerImage));
    return shuffle(items).slice(0,n).map(x=>({u:x.bannerImage,t:(x.title&&(x.title.romaji||x.title.english))||'',site:x.siteUrl}));
  }

  /* tok guards against a slow earlier load clobbering a newer mode switch */
  const load=()=>{const my=++tok; return withBusy(wrapEl,async r=>{
    if(my!==tok) return;
    if(mode==='scenes'){
      const list=await randomScenes(9);
      if(my!==tok) return;
      clear(r);
      if(!list.length){ r.appendChild(emptyBox(L({en:'No scenes found — roll again.',ja:'画像が見つかりません。'}),'📷')); return; }
      const g=h('div.results');
      list.forEach(c=>{
        g.appendChild(h('div.canvas-wrap',h('img',{src:c.u,loading:'lazy',style:'display:block;width:100%;height:auto',alt:(c.t||'anime')+' — scene',
          onerror(){ this.parentElement.style.display='none' }})));
      });
      r.appendChild(g);
      r.appendChild(h('div.row',{style:'margin-top:10px'},btn('📷 '+L({en:'Shuffle',ja:'シャッフル'}),'primary',load)));
      r.appendChild(h('p.hint',L({en:'Wide scene artwork from AniList’s most popular shows — never cover art.',ja:'人気作のシーンアート（カバー画像ではない）。'})));
      return;
    }
    const list=await randomClips(6);
    if(my!==tok) return;
    clear(r);
    if(!list.length){ r.appendChild(emptyBox(L({en:'No clips loaded — roll again, or switch to Scene pictures.',ja:'クリップが取得できません。再ロール、またはシーン画像へ。'}),'🎞️')); return; }
    const g=h('div.results');
    list.forEach((c,i)=>{
      const vid=h('video.clip-vid',{src:c.u,loop:true,playsinline:true,controls:true,preload:'metadata',
        onplay(){
          [...g.querySelectorAll('video')].forEach(v=>{ if(v!==this){ try{ v.pause(); }catch(e){} } });
          if(typeof MDK!=='undefined'&&MDK.attachVideo){
            try{ MDK.attachVideo({el:this,title:c.t,sub:'AnimeThemes · '+c.tag,items:list.map(x=>x.u),idx:i,
              play:k=>{ const nv=g.querySelector('[data-clip="'+k+'"] video'); if(nv) nv.play().catch(()=>{}); } }); }catch(e){}
          }
        }
      });
      g.appendChild(h('article.clip-card',{'data-clip':i},vid,
        h('div.clip-meta',
          h('div.clip-t',c.t),
          h('span.clip-tag',c.tag),
          h('a.clip-lnk',{href:c.site,target:'_blank',rel:'noopener',title:'AnimeThemes'},'↗'))));
    });
    r.appendChild(g);
    r.appendChild(h('div.row',{style:'margin-top:10px'},btn('🎞 '+L({en:'More clips',ja:'他のクリップ'}),'primary',load)));
    r.appendChild(h('p.hint',L({en:'Real OP/ED clips streamed from AnimeThemes — use each player’s controls for sound. A clip keeps playing in the Media Dock after you close this tool.',ja:'AnimeThemesのOP/ED動画。各プレイヤーで音声操作可。閉じてもメディアドックで再生継続。'})));
  });};

  MODES.forEach(o=>{
    bar.appendChild(h('button.tchip'+(o.k===mode?'.on':''),{type:'button','data-k':o.k,html:ico(o.i)+' '+esc(L(o.t)),onclick:()=>{
      mode=o.k; store.set('azt_picsmode',mode);
      [...bar.children].forEach(b=>b.classList.toggle('on',b.dataset.k===mode));
      load();
    }}));
  });
  m.appendChild(bar);
  m.appendChild(wrapEl); load();
};

/* ============================================================
   37 — UPCOMING ANIME
   ============================================================ */
TOOLS_IMPL['upcoming']=(m)=>{
  const bar=h('div.chipset');
  const out=h('div'); let cur=0;
  const tabs=[{t:L({en:'Next season',ja:'来期予定'}),p:'/seasons/upcoming',q:{}},{t:L({en:'Top upcoming',ja:'期待順'}),p:'/top/anime',q:{filter:'upcoming'}}];
  function sel(i,page=1){
    cur=i; [...bar.children].forEach((c,j)=>c.className=j===i?'tchip on':'tchip');
    withBusy(out,async r=>{
      const j=await japi(tabs[i].p,Object.assign({limit:24},tabs[i].q,{page}));
      const items=(j.data||[]).filter(Boolean);
      clear(r);
      if(!items.length){ r.appendChild(emptyBox(L({en:'Nothing announced yet.',ja:'まだ発表がありません。'}),'⏭️')); return; }
      const g=h('div.results'); items.forEach(x=>g.appendChild(mediaCard(x,{snip:true}))); r.appendChild(g);
      const pg=pager(j.pagination,np=>sel(i,np)); if(pg) r.appendChild(pg);
    });
  }
  tabs.forEach((t,i)=>bar.appendChild(h('button.tchip',{type:'button',html:t.t,onclick:()=>sel(i)})));
  m.appendChild(panel(L({en:'What is coming',ja:'これから放送'}),bar));
  m.appendChild(out); sel(0);
};

/* ============================================================
   38 — SUB ANIME EPISODES
   ============================================================ */
TOOLS_IMPL['sub']=(m)=>{
  const out=h('div');
  const flatten=(data)=>{
    const rows=[];
    (data||[]).forEach(x=>{
      if(x.entry&&x.videos){ x.videos.forEach(v=>rows.push({title:v.title||v.entry?.title,ep:v.episode,a:x.entry.title,url:v.url||v.source,img:x.entry.images?.jpg?.image_url,id:x.entry.mal_id})); }
      else if(x.title||x.episode){ rows.push({title:x.title,ep:x.episode,url:x.url,img:x.images?.jpg?.image_url,id:x.mal_id||(x.entry&&x.entry.mal_id)}); }
      else if(x.entry){ rows.push({title:x.entry.title,url:x.url,id:x.entry.mal_id,img:x.entry.images?.jpg?.image_url}); }
    });
    return rows;
  };
  const load=(page=1)=>withBusy(out,async r=>{
    const j=await japi('/watch/episodes',{page,ep:1});
    const rows=flatten(j.data);
    clear(r);
    if(!rows.length){ r.appendChild(emptyBox(L({en:'Feed unavailable right now — check the Connection Doctor.',ja:'フィードを取得できません。接続診断を確認。'}),'💬')); return; }
    rows.slice(0,40).forEach(x=>r.appendChild(h('div.track',
      x.img?h('img',{src:x.img,style:'width:44px;height:60px;object-fit:cover;border-radius:5px',onerror(){this.style.visibility='hidden'}}):null,
      h('div.grow',h('div.t',x.ep?('EP '+x.ep+' — '):'')+(x.title||'—'),h('div.a',x.a||'')),
      x.url?h('a.btn.small.gold',{href:x.url,target:'_blank',rel:'noopener'},L({en:'Watch legally',ja:'正規視聴'})):null)));
    const pg=pager(j.pagination,np=>load(np)); if(pg) r.appendChild(pg);
    r.appendChild(h('p.hint',{html:L({en:'Feed lists episodes from licensed services (Crunchyroll, bilibili, Muse, etc.) — never pirate sites.',ja:'正規配信サービス（Crunchyroll等）のエピソードのみ掲載。海賊版サイトは扱いません。'})}));
  });
  const pickOut=h('div');
  const allOut=h('div');
  const loadAll=(page=1)=>withBusy(allOut,async r=>{
    const j=await japi('/anime',{page,limit:25,order_by:'members',sort:'desc'});
    const items=(j.data||[]).filter(Boolean);
    clear(r);
    if(!items.length){ r.appendChild(emptyBox(L({en:'Database unreachable — check the Connection Doctor.',ja:'取得できません。接続診断を確認。'}),'📚')); return; }
    const g=h('div.results');
    items.forEach(x=>g.appendChild(mediaCard(x,{kind:'anime',snip:true})));
    r.appendChild(g);
    const pg=pager(j.pagination,np=>loadAll(np)); if(pg) r.appendChild(pg);
    r.appendChild(h('p.hint',L({en:'Every anime ships subtitles — this pages through the whole database, most popular first.',ja:'全作品が字幕対象。人気順にデータベース全体をページ送り。'})));
  });
  m.appendChild(panel(L({en:'All anime (subbed)',ja:'全アニメ（字幕）'}),allOut));
  m.appendChild(panel(L({en:'Latest subbed feed',ja:'最新字幕フィード'}),out));
  m.appendChild(panel(L({en:'Episodes of a specific anime',ja:'特定作品の話数'}),
    searchBox({placeholder:L({en:'Anime title…',ja:'アニメ名…'}),onPick:a=>withBusy(pickOut,async r=>{
      const j=await japi('/anime/'+a.mal_id+'/episodes',{page:1});
      const eps=(j.data||[]).filter(Boolean);
      clear(r);
      if(!eps.length){ r.appendChild(emptyBox()); return; }
      eps.forEach(e=>r.appendChild(h('div.track',
        h('div',h('div.t','EP '+(e.episode||'?')+' — '+(e.title||'—')),h('div.a',(e.aired||'')+(e.filler?' · Filler':'')+(e.recap?' · Recap':''))),
        h('a.btn.small.gold',{style:'margin-left:auto',href:'https://myanimelist.net/anime/'+a.mal_id+'/episode/'+(e.mal_id||e.episode),target:'_blank',rel:'noopener'},'MAL'))));
    })}),pickOut));
  load(); loadAll();
};

/* ============================================================
   39 — ANIME AIRING TRACKER
   ============================================================ */
TOOLS_IMPL['tracker']=(m)=>{
  const DAYS=[['mon',L({en:'Mon',ja:'月'})],['tue',L({en:'Tue',ja:'火'})],['wed',L({en:'Wed',ja:'水'})],['thu',L({en:'Thu',ja:'木'})],['fri',L({en:'Fri',ja:'金'})],['sat',L({en:'Sat',ja:'土'})],['sun',L({en:'Sun',ja:'日'})]];
  const KEY='azt_air';
  let mine=store.get(KEY,[]);
  const out=h('div'), mineBox=h('div');
  const today=['sun','mon','tue','wed','thu','fri','sat'][new Date().getDay()];
  const load=(day='mon',page=1)=>withBusy(out,async r=>{
    const j=await japi('/schedules',{filter:day,page});
    const items=(j.data||[]).filter(Boolean);
    clear(r);
    if(!items.length){ r.appendChild(emptyBox(L({en:'Nothing scheduled that day.',ja:'この日の放送予定はありません。'}),'📡')); return;
    }
    items.forEach(a=>{
      const b=a.broadcast;
      const bTxt=typeof b==='string'?b:(b&&(b.string||[b.day,b.time].filter(Boolean).join(' ')))||'';
      const row=h('div.track');
      if(a.images&&a.images.jpg) row.appendChild(h('img',{src:a.images.jpg.image_url,style:'width:44px;height:60px;object-fit:cover;border-radius:5px',onerror(){this.style.visibility='hidden'}}));
      row.appendChild(h('div.grow',h('div.t',a.title),h('div.a',bTxt||a.type||'')));
      row.appendChild(h('div.row.tight',{style:'margin-left:auto'},
        btnI('＋ '+L({en:'Track',ja:'追跡'}),'','small',()=>{
          if(mine.find(x=>x.id===a.mal_id)) return toast(L({en:'Already tracked',ja:'追跡済み'}));
          mine.push({id:a.mal_id,t:a.title,img:a.images&&a.images.jpg&&a.images.jpg.image_url,day,time:bTxt}); store.set(KEY,mine); paintMine();
          toast('📡 <b>'+esc(a.title)+'</b> → '+L({en:'tracked',ja:'追跡開始'}));
        }),
        btnI('ℹ️','','small',()=>openInfo(a,'anime'))));
      r.appendChild(row);
    });
    const pg=pager(j.pagination,np=>load(day,np)); if(pg) r.appendChild(pg);
  });
  function paintMine(){
    clear(mineBox);
    if(!mine.length){ mineBox.appendChild(emptyBox(L({en:'Track shows to build your weekly grid.',ja:'作品を追跡して週間グリッドを作りましょう。'}),'📡')); return; }
    const grid=h('div');
    DAYS.forEach(([d,label])=>{
      const items=mine.filter(x=>(x.day||'').toLowerCase().includes(d)||['mon','tue','wed','thu','fri','sat','sun'].some(dd=>(x.day||'').toLowerCase().includes(dd)&&dd===d));
      if(!items.length) return;
      grid.appendChild(h('div.panel',
        h('div.panel-title',label+(d===today?' · '+L({en:'TODAY',ja:'今日'}):'')),
        ...items.map(it=>h('div.track',it.img?h('img',{src:it.img,style:'width:34px;height:46px;object-fit:cover;border-radius:5px',onerror(){this.style.visibility='hidden'}}):null,
          h('div.grow',h('div.t',it.t),h('div.a',it.time||'')),
          h('button.iconbtn',{title:L(S.remove),html:ico('x'),onclick:()=>{ mine=mine.filter(x=>x.id!==it.id); store.set(KEY,mine); paintMine(); }})))));
    });
    mineBox.appendChild(grid);
    mineBox.appendChild(h('div.row',btn('🗑️ '+L({en:'Clear tracker',ja:'追跡をクリア'}),'danger',()=>{ mine=[]; store.set(KEY,mine); paintMine(); })));
  }
  const chips=chipset(DAYS.map(([v,t])=>({t,v,on:v==='mon'})),{onchange:v=>load(v[0]||'mon')});
  m.appendChild(panel(L({en:'Weekly schedule',ja:'週間スケジュール'}),chips.el,out));
  m.appendChild(panel(L({en:'My tracked shows',ja:'追跡中の作品'})));
  m.appendChild(mineBox);
  load('mon'); paintMine();
};

/* ============================================================
   40 — ANIME EFFECTS STUDIO
   ============================================================ */
TOOLS_IMPL['effects']=(m)=>{
  const W=900,H=520;
  const {wrap,c,ctx}=mkCanvas(W,H);
  const PRESETS={
    sakura:{n:L({en:'Sakura petals',ja:'桜の花びら'}),color:'#f7b7c4'},
    snow:{n:L({en:'Snow',ja:'雪'}),color:'#ffffff'},
    firefly:{n:L({en:'Fireflies',ja:'螢火'}),color:'#ffe37a'},
    rain:{n:L({en:'Rain',ja:'雨'}),color:'#a9d6ff'},
    ember:{n:L({en:'Embers',ja:'火の粉'}),color:'#ff8a3d'},
    stars:{n:L({en:'Starfield',ja:'星空'}),color:'#cfe1ff'},
    aura:{n:L({en:'Energy aura',ja:'オーラ'}),color:'#7fd8ff'},
    bubbles:{n:L({en:'Bubbles',ja:'泡'}),color:'#bfeaff'}
  };
  let preset='sakura',count=60,speed=1,mouse={x:W/2,y:H/2},follow=false,run=true,parts=[];
  function seed(n=count){ parts=Array.from({length:n},()=>spawn(true)); }
  function spawn(any){
    const p={x:Math.random()*W,y:any?Math.random()*H:-10,vx:Math.random()-.5,vy:.5+Math.random()*2,r:2+Math.random()*5,a:Math.random()*6.3,va:(Math.random()-.5)*.06,life:1};
    if(preset==='rain'){ p.vy=6+Math.random()*6; p.vx=1.2; p.r=1; }
    if(preset==='ember'){ p.vy=-(0.6+Math.random()*1.6); p.y=any?p.y:H; }
    if(preset==='aura'){ const ang=Math.random()*6.3; p.x=W/2; p.y=H/2; p.vx=Math.cos(ang)*(1+Math.random()*2); p.vy=Math.sin(ang)*(1+Math.random()*2); p.life=1; }
    if(preset==='stars'){ p.vy=0; p.vx=0; p.r=.8+Math.random()*2; }
    if(preset==='bubbles'){ p.vy=-(0.5+Math.random()*1.4); p.y=any?p.y:H+10; }
    return p;
  }
  function loop(){
    if(!run) return;
    const col=PRESETS[preset].color;
    ctx.fillStyle='rgba(8,11,17,.35)'; ctx.fillRect(0,0,W,H);
    ctx.save();
    parts.forEach((p,i)=>{
      p.x+=p.vx*speed; p.y+=p.vy*speed; p.a+=p.va;
      if(follow&&preset!=='aura'){ p.vx+=(mouse.x-W/2)*.0004; }
      ctx.translate(0,0);
      if(preset==='sakura'){
        ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.a); ctx.fillStyle=col; ctx.globalAlpha=.85;
        ctx.beginPath(); ctx.moveTo(0,-p.r); ctx.bezierCurveTo(p.r,-p.r*.5,p.r*.6,p.r*.7,0,p.r); ctx.bezierCurveTo(-p.r*.6,p.r*.7,-p.r,-p.r*.5,0,-p.r); ctx.fill(); ctx.restore();
      } else if(preset==='rain'){
        ctx.strokeStyle=col; ctx.globalAlpha=.5; ctx.lineWidth=1.4; ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.x-4,p.y-13); ctx.stroke();
      } else if(preset==='aura'){
        ctx.globalAlpha=Math.max(0,p.life-=.012); ctx.fillStyle=col; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,7); ctx.fill();
      } else if(preset==='firefly'||preset==='ember'){
        const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*4);
        g.addColorStop(0,col); g.addColorStop(1,'rgba(0,0,0,0)');
        ctx.globalAlpha=.9; ctx.fillStyle=g; ctx.beginPath(); ctx.arc(p.x,p.y,p.r*4,0,7); ctx.fill();
      } else if(preset==='stars'){
        ctx.globalAlpha=.4+.6*Math.abs(Math.sin(p.a)); ctx.fillStyle=col; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,7); ctx.fill();
      } else if(preset==='bubbles'){
        ctx.globalAlpha=.5; ctx.strokeStyle=col; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(p.x,p.y,p.r*2,0,7); ctx.stroke();
      } else { // snow
        ctx.globalAlpha=.9; ctx.fillStyle=col; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,7); ctx.fill();
      }
      const out=p.y>H+30||p.y<-60||p.x>W+40||p.x<-40||p.life<=0;
      if(out) parts[i]=spawn(false);
      if(p.y<-50) parts[i].y=H+20;
    });
    ctx.restore();
    ctx.globalAlpha=1;
    requestAnimationFrame(loop);
  }
  seed(); loop();
  const presetSel=selEl(Object.keys(PRESETS).map(k=>({v:k,t:PRESETS[k].n})),'sakura');
  const cnt=h('input.inp',{type:'range',min:'10',max:'220',value:String(count),style:'padding:0'});
  const spd=h('input.inp',{type:'range',min:'20',max:'300',value:'100',style:'padding:0'});
  const followChk=h('input',{type:'checkbox'});
  presetSel.addEventListener('change',()=>{ preset=presetSel.value; seed(); });
  cnt.addEventListener('input',()=>{ count=+cnt.value; seed(); });
  spd.addEventListener('input',()=>speed=+spd.value/100);
  followChk.addEventListener('change',()=>follow=followChk.checked);
  c.addEventListener('mousemove',e=>{ const r=c.getBoundingClientRect(); mouse.x=(e.clientX-r.left)*(W/r.width); mouse.y=(e.clientY-r.top)*(H/r.height); });
  m.appendChild(h('div.row',field(L({en:'Effect',ja:'エフェクト'}),presetSel),
    field(L({en:'Count',ja:'数'}),cnt),field(L({en:'Speed',ja:'速度'}),spd),
    h('label.row.tight',{style:'font-size:13px;align-self:flex-end;padding-bottom:8px'},followChk,L({en:'Mouse drift',ja:'マウス追従'}))));
  m.appendChild(h('div.row',{style:'margin:10px 0'},
    btn('⛶ '+L({en:'Fullscreen',ja:'全画面'}),'primary',()=>{
      const fs=h('div.canvas-fs');
      const clone=c.cloneNode(true);
      fs.appendChild(clone); document.body.appendChild(fs);
      const ctx3=clone.getContext('2d');
      const draw=()=>{ ctx3.drawImage(c,0,0,clone.width,clone.height); if(fs.parentElement) requestAnimationFrame(draw); };
      clone.width=W; clone.height=H; draw();
      fs.addEventListener('click',()=>fs.remove());
      toast('⛶ '+L({en:'Click anywhere to exit',ja:'クリックで終了'}));
    }),
    btn('⏸ '+L({en:'Pause / resume',ja:'一時停止'}),'',()=>{ run=!run; if(run) loop(); }),
    btn('♻️ '+L({en:'Respawn',ja:'再生成'}),'',()=>seed())));
  m.appendChild(wrap);
};

/* ============================================================
   41 — RECOMMENDATION OMIKUJI
   ============================================================ */
TOOLS_IMPL['omikuji']=(m)=>{
  const out=h('div');
  const roll=()=>withBusy(out,async r=>{
    const j=await japi('/anime',{order_by:'popularity',sort:'asc',limit:25,page:ri(1,40)});
    const items=(j.data||[]).filter(Boolean);
    clear(r);
    if(!items.length){ r.appendChild(emptyBox()); return; }
    const a=pick(items);
    const pool=[['大吉',.18],['吉',.3],['中吉',.27],['小吉',.17],['凶',.08]];
    let x=Math.random(),fortune='小吉';
    for(const [name,p] of pool){ if((x-=p)<=0){ fortune=name; break; } }
    const good=fortune!=='凶';
    const box=h('div.fortune');
    box.appendChild(h('div.stick'+(good?'':'.bad'),fortune));
    box.appendChild(h('div.hint',good?L({en:'Fortune favours you — ride it.',ja:'運気上昇中。この運に乗れ。'}):L({en:'A curse! Defuse it with a comfort watch.',ja:'凶…！心地よい作品で気を紛らわせよう。'})));
    box.appendChild(mediaCard(a));
    box.appendChild(h('div.row',btn('⛩️ '+L({en:'Re-roll',ja:'もう一度'}),'primary',roll),
      good?btn('➕ '+L({en:'Keep it',ja:'この運を保存'}),'gold',()=>WL.add(a)):
        btn('🍵 '+L({en:'Comfort re-roll',ja:'癒やしの再抽選'}),'gold',()=>comfort()),
      btn('🔗 '+L(S.source),'',()=>window.open('https://myanimelist.net/anime/'+a.mal_id,'_blank','noopener'))));
    r.appendChild(box);
  });
  async function comfort(){
    withBusy(out,async r=>{
      const j=await japi('/anime',{genres:'36',order_by:'score',sort:'desc',min_score:8,limit:24});
      const items=(j.data||[]).filter(Boolean); clear(r);
      if(!items.length){ r.appendChild(emptyBox()); return; }
      r.appendChild(h('div.panel',h('div.panel-title',{html:ico('cup')+' '+esc(L({en:'Comfort picks (Slice of Life)',ja:'癒やし作品（日常系）'}))})));
      const g=h('div.results'); shuffle(items).slice(0,6).forEach(x=>g.appendChild(mediaCard(x,{snip:false}))); r.appendChild(g);
      r.appendChild(h('div.row',{style:'margin-top:10px'},btn('⛩️ '+L({en:'Back to fortune',ja:'おみくじに戻る'}),'primary',roll)));
    });
  }
  m.appendChild(h('div.row',btn('⛩️ '+L({en:'Draw a fortune',ja:'おみくじを引く'}),'primary',roll)));
  m.appendChild(out); roll();
};

/* ============================================================
   42 — MANGA FINDER
   ============================================================ */
TOOLS_IMPL['manga-finder']=(m,preset={})=>{
  const qIn=inp({value:preset.q||'',placeholder:L({en:'Manga title…',ja:'漫画タイトル…'})});
  const typeS=selEl([{v:'',t:L({en:'Any type',ja:'全形式'})},'manga','manhwa','manhua','novel','lightnovel','oneshot','doujinshi'],preset.type||'');
  const stS=selEl([{v:'',t:L({en:'Any status',ja:'全状態'})},{v:'publishing',t:L({en:'Publishing',ja:'連載中'})},{v:'complete',t:L({en:'Finished',ja:'完結'})},{v:'upcoming',t:L({en:'Upcoming',ja:'予定'})}],preset.status||'');
  const ordS=selEl([{v:'members',t:L({en:'Popularity',ja:'人気順'})},{v:'score',t:L({en:'Score',ja:'スコア順'})},{v:'start_date',t:L({en:'Newest',ja:'新着順'})}],preset.order_by||'members');
  let genres=new Set(); const genreSlot=h('div');
  getMangaGenres().then(gs=>{ const ch=chipset(gs.map(x=>({t:x.name,v:x.mal_id})),{multi:true,onchange:v=>genres=new Set(v)}); clear(genreSlot); genreSlot.appendChild(ch.el); }).catch(()=>{});
  const list=makeList(m,{kind:'manga'});
  const run=(page=1)=>list.go(page,{q:qIn.value.trim(),type:typeS.value,status:stS.value,order_by:ordS.value,sort:'desc',genres:[...genres].join(',')||undefined});
  m.appendChild(panel(L({en:'Manga filters',ja:'漫画フィルター'}),
    h('div.row',field(L({en:'Keyword',ja:'キーワード'}),qIn),field(L({en:'Type',ja:'形式'}),typeS),field(L({en:'Status',ja:'状態'}),stS),field(L({en:'Sort',ja:'並び'}),ordS)),
    h('div',{style:'margin-top:10px'},h('label.label',L({en:'Genres',ja:'ジャンル'})),genreSlot),
    h('div.row',{style:'margin-top:12px'},btn('📖 '+L(S.run),'primary',()=>run(1)))));
  run(1);
};
let MGENRES=null;
async function getMangaGenres(){
  if(MGENRES) return MGENRES;
  const j=await japi('/genres/manga');
  MGENRES=(j.data||[]).filter(x=>x.mal_id).sort((a,b)=>(b.count||0)-(a.count||0));
  return MGENRES;
}

/* ============================================================
   43 — MANGA READING TRACKER
   ============================================================ */
TOOLS_IMPL['manga-tracker']=(m)=>{
  const KEY='azt_mt';
  let rows=store.get(KEY,[]);
  const out=h('div'); const save=()=>store.set(KEY,rows);
  const tIn=inp({placeholder:L({en:'Manga title',ja:'漫画タイトル'})});
  const rIn=inp({type:'number',value:'0',min:'0'});
  const totIn=inp({type:'number',value:'100',min:'1'});
  const paint=()=>{
    clear(out);
    if(!rows.length){ out.appendChild(emptyBox(L({en:'No manga tracked yet.',ja:'追跡中の漫画はまだありません。'}),'📖')); return; }
    let readT=0,allT=0;
    rows.forEach((x,i)=>{
      readT+=x.read; allT+=x.total;
      const pct=Math.min(100,Math.round(x.read/Math.max(1,x.total)*100));
      const row=h('div.track');
      row.appendChild(h('div.grow',h('div.t',x.title),
        h('div.a',x.read+' / '+x.total+' · '+pct+'%'),
        h('div.meter',{style:'margin-top:5px'},h('i',{style:'width:'+pct+'%'}))));
      const step=inp({type:'number',value:String(x.read),min:'0',max:String(x.total),style:'width:86px',onchange:e=>{ x.read=Math.max(0,Math.min(x.total,+e.target.value||0)); save(); paint(); }});
      row.appendChild(step);
      row.appendChild(h('button.iconbtn',{title:'+1',html:'＋',style:'width:34px;height:34px',onclick:()=>{ x.read=Math.min(x.total,x.read+1); save(); paint(); }}));
      row.appendChild(h('button.iconbtn',{title:L(S.remove),html:ico('x'),onclick:()=>{ rows.splice(i,1); save(); paint(); }}));
      out.appendChild(row);
    });
    const pct=Math.round(readT/Math.max(1,allT)*100);
    out.appendChild(h('div.stat-row',{style:'margin-top:10px'},
      h('div.stat-box',h('small',L({en:'Chapters read',ja:'読済み話数'})),h('div.big-num',readT)),
      h('div.stat-box',h('small',L({en:'Remaining',ja:'残り'})),h('div.big-num',allT-readT)),
      h('div.stat-box',h('small',L({en:'Overall',ja:'全体進捗'})),h('div.big-num',pct+'%'))));
  };
  m.appendChild(panel(L({en:'Add a manga',ja:'漫画を追加'}),
    h('div.row',field(L({en:'Title',ja:'タイトル'}),tIn),field(L({en:'Read',ja:'読済み'}),rIn),field(L({en:'Total',ja:'全話'}),totIn),
      btn('＋ '+L(S.add),'primary',()=>{ const t=tIn.value.trim(); if(!t) return; rows.push({title:t,read:+rIn.value||0,total:+totIn.value||1}); save(); paint(); tIn.value=''; }))));
  m.appendChild(h('div.row',btn('🗑️ '+L(S.clear),'danger',()=>{ rows=[]; save(); paint(); })));
  m.appendChild(out); paint();
};

/* ============================================================
   44 — WATCHLIST MANAGER
   ============================================================ */
TOOLS_IMPL['wl-manager']=(m)=>{
  const out=h('div'); let filter='all', query='';
  const paint=()=>{
    clear(out);
    let items=WL.list();
    if(filter!=='all') items=items.filter(i=>(i.st||'planned')===filter);
    if(query) items=items.filter(i=>norm((i.t||'')+' '+(i.r||'')).includes(norm(query)));
    const counts={planned:0,watching:0,watched:0};
    WL.list().forEach(i=>counts[(i.st||'planned')]=(counts[(i.st||'planned')]||0)+1);
    out.appendChild(h('div.stat-row',
      h('div.stat-box',h('small',L({en:'Total',ja:'合計'})),h('div.big-num',WL.list().length)),
      h('div.stat-box',h('small',L({en:'Planned',ja:'予定'})),h('div.big-num',counts.planned||0)),
      h('div.stat-box',h('small',L({en:'Watching',ja:'視聴中'})),h('div.big-num',counts.watching||0)),
      h('div.stat-box',h('small',L({en:'Watched',ja:'完了'})),h('div.big-num',counts.watched||0))));
    if(!items.length){ out.appendChild(emptyBox(L({en:'Nothing here yet.',ja:'まだ何もありません。'}),'🗂️')); return; }
    items.forEach(it=>{
      const row=h('div.track');
      if(it.img) row.appendChild(h('img',{src:it.img,style:'width:40px;height:56px;object-fit:cover;border-radius:6px',onerror(){this.style.visibility='hidden'}}));
      row.appendChild(h('div.grow',h('div.t',it.t||it.r),h('div.a','★ '+(it.mal||'—')+' · '+L({en:'personal',ja:'個人'})+' '+(it.score||'—'))));
      const st=selEl([{v:'planned',t:L({en:'Planned',ja:'予定'})},{v:'watching',t:L({en:'Watching',ja:'視聴中'})},{v:'watched',t:L({en:'Watched',ja:'完了'})},{v:'dropped',t:L({en:'Dropped',ja:'中止'})}],it.st||'planned',
      ); st.addEventListener('change',()=>WL.patch(it.id,{st:st.value}));
      row.appendChild(st);
      const ep=inp({type:'number',value:String(it.ep||0),min:'0',style:'width:84px',title:L({en:'Episodes watched',ja:'視聴済み話数'}),onchange:e=>WL.patch(it.id,{ep:+e.target.value||0})});
      row.appendChild(ep);
      row.appendChild(h('button.iconbtn',{title:L(S.remove),html:ico('x'),onclick:()=>{ WL.rm(it.id); paint(); }}));
      out.appendChild(row);
    });
  };
  const fChips=chipset([{t:L({en:'All',ja:'すべて'}),v:'all',on:1},{t:L({en:'Planned',ja:'予定'}),v:'planned'},{t:L({en:'Watching',ja:'視聴中'}),v:'watching'},{t:L({en:'Watched',ja:'完了'}),v:'watched'}],
    {onchange:v=>{ filter=v[0]||'all'; paint(); }});
  const qIn=inp({placeholder:L({en:'Filter…',ja:'絞り込み…'}),style:'width:190px'});
  qIn.addEventListener('input',()=>{ query=qIn.value; paint(); });
  m.appendChild(h('div.row',
    btn('＋ '+L({en:'Add title',ja:'タイトル追加'}),'primary',quickAdd),
    btn('⭐ '+L({en:'Rank them',ja:'ランキング'}),'gold',()=>openTool('wl-rank')),
    btn('📋 '+L({en:'Board view',ja:'看板表示'}),'',()=>openTool('board')),
    btn('⬇️ '+L({en:'Export',ja:'書き出し'}),'',()=>{ const a=document.createElement('a'); a.href='data:application/json,'+encodeURIComponent(JSON.stringify(WL.list(),null,2)); a.download='anime-zaki-watchlist.json'; a.click(); }),
    qIn));
  m.appendChild(fChips.el); m.appendChild(out); paint();
};

/* ============================================================
   45 — EPISODE PROGRESS CALCULATOR
   ============================================================ */
TOOLS_IMPL['ep-calc']=(m)=>{
  const watched=inp({type:'number',value:'120',min:'0'});
  const total=inp({type:'number',value:'75',min:'1'});
  const mins=inp({type:'number',value:'24',min:'1'});
  const out=h('div');
  const calc=()=>{
    const w=Math.max(0,+watched.value||0), t=Math.max(1,+total.value||1), mn=Math.max(1,+mins.value||1);
    const pct=Math.min(100,Math.round(w/t*100)), rem=Math.max(0,t-w);
    clear(out);
    out.appendChild(h('div.panel',
      h('div.panel-title',L({en:'Progress',ja:'進捗'})),
      h('div.meter',h('i',{style:'width:'+pct+'%'})),
      h('div.stat-row',{style:'margin-top:10px'},
        h('div.stat-box',h('small',L({en:'Watched',ja:'視聴済み'})),h('div.big-num',pct+'%')),
        h('div.stat-box',h('small',L({en:'Remaining ep',ja:'残り話数'})),h('div.big-num',rem)),
        h('div.stat-box',h('small',L({en:'Remaining time',ja:'残り時間'})),h('div.big-num',{style:'font-size:24px'},Math.round(rem*mn/60*10)/10+'h')),
        h('div.stat-box',h('small',L({en:'Status',ja:'状態'})),h('div.big-num',{style:'font-size:24px;color:'+(pct===100?'#4f9d5d':'#31507d')},pct===100?'DONE':pct>0?'GOING':'NEW')))));
  };
  [watched,total,mins].forEach(i=>['input','change'].forEach(ev=>i.addEventListener(ev,calc)));
  m.appendChild(panel(L({en:'Inputs',ja:'入力'}),
    h('div.row',field(L({en:'Episodes watched',ja:'視聴済み'}),watched),field(L({en:'Total episodes',ja:'全話数'}),total),field(L({en:'Minutes / ep',ja:'1話分'}),mins))));
  m.appendChild(out); calc();
};

/* ============================================================
   46 — WATCH TIME CALCULATOR
   ============================================================ */
TOOLS_IMPL['time-calc']=(m)=>{
  const eps=inp({type:'number',value:'24',min:'0'});
  const mn=inp({type:'number',value:'24',min:'1'});
  const perDay=inp({type:'number',value:'4',min:'1'});
  const extra=inp({type:'number',value:'0',min:'0',placeholder:'OVAs/movies'});
  const out=h('div');
  const calc=()=>{
    const E=Math.max(0,+eps.value||0)+Math.max(0,+extra.value||0), M=Math.max(1,+mn.value||1), D=Math.max(1,+perDay.value||1);
    const minutes=E*M, hours=minutes/60, days=Math.ceil(E/D), sessions=Math.ceil(E/ (D||1) );
    clear(out);
    out.appendChild(h('div.stat-row',
      h('div.stat-box',h('small',L({en:'Total runtime',ja:'合計時間'})),h('div.big-num',Math.round(hours*10)/10+'h')),
      h('div.stat-box',h('small',L({en:'Minutes',ja:'分'})),h('div.big-num',minutes)),
      h('div.stat-box',h('small',L({en:'Days at this pace',ja:'この速さで'})),h('div.big-num',days)),
      h('div.stat-box',h('small',L({en:'≈ weeks',ja:'約週数'})),h('div.big-num',Math.max(1,Math.ceil(days/7))))));
    out.appendChild(h('p.hint',{html:L({en:'Equivalent to',ja:'体感例：'})+' <b>'+(hours>=24?(Math.round(hours/24*10)/10+' '+L({en:'full days',ja:'日間'})):hours+' '+L({en:'hours straight',ja:'時間連続'}))+'</b>'}));
  };
  [eps,mn,perDay,extra].forEach(i=>['input','change'].forEach(ev=>i.addEventListener(ev,calc)));
  m.appendChild(panel(L({en:'Series length',ja:'作品の長さ'}),
    h('div.row',field(L({en:'Episodes',ja:'話数'}),eps),field(L({en:'Min / episode',ja:'1話分'}),mn),field(L({en:'Extra (OVA/movie)',ja:'追加（OVA/劇場）'}),extra),field(L({en:'Episodes / day',ja:'1日あたり'}),perDay))));
  m.appendChild(out); calc();
};

/* ============================================================
   47 — ANIME RANDOMIZER ROULETTE
   ============================================================ */
TOOLS_IMPL['roulette']=(m)=>{
  const SIZE=640;
  const {wrap,c,ctx}=mkCanvas(SIZE,SIZE);
  wrap.style.width='min(360px,90%)'; wrap.style.margin='0 auto'; wrap.style.borderRadius='50%'; wrap.style.border='none';
  c.className='wheel'; c.style.width='100%'; c.style.height='100%'; c.style.display='block'; c.style.borderRadius='50%';
  let list=[],angle=0,spinning=false;
  const COLORS=['#d8452b','#d8a94a','#2f6f6a','#31507d','#7c3a96','#c9556f','#4f9d5d','#e07b28'];
  const wrapOuter=h('div.wheel-wrap');
  const pointer=h('div.wheel-pointer');
  const hub=h('div.wheel-hub','運');
  wrapOuter.append(c,pointer,hub);
  function drawWheel(){
    const R2=SIZE/2; ctx.clearRect(0,0,SIZE,SIZE);
    if(!list.length){
      ctx.fillStyle='rgba(255,255,255,.06)'; ctx.beginPath(); ctx.arc(R2,R2,R2-4,0,7); ctx.fill();
      ctx.fillStyle='#d8a94a'; ctx.font='600 24px Georgia,serif'; ctx.textAlign='center'; ctx.fillText('Load 8 anime →',R2,R2-6); ctx.fillText('then SPIN',R2,R2+24); ctx.textAlign='left';
      return;
    }
    const seg=(Math.PI*2)/list.length;
    list.forEach((a,i)=>{
      const s=-Math.PI/2+i*seg, e=s+seg;
      ctx.beginPath(); ctx.moveTo(R2,R2); ctx.arc(R2,R2,R2-6,s,e); ctx.closePath();
      ctx.fillStyle=COLORS[i%COLORS.length]; ctx.fill();
      ctx.strokeStyle='rgba(0,0,0,.35)'; ctx.lineWidth=3; ctx.stroke();
      ctx.save(); ctx.translate(R2,R2); ctx.rotate(s+seg/2);
      ctx.fillStyle='#fff'; ctx.font='800 26px Helvetica,Arial'; ctx.textAlign='right';
      ctx.fillText(String(i+1),R2-30,9);
      ctx.restore();
    });
    ctx.beginPath(); ctx.arc(R2,R2,44,0,7); ctx.fillStyle='#14161d'; ctx.fill();
  }
  const loadBtn=btn('🎲 '+L({en:'Load 8 random anime',ja:'ランダム8作品'}),'',()=>withBusy(info,async r=>{
    const j=await japi('/anime',{order_by:'popularity',sort:'asc',limit:25,page:ri(1,35)});
    const items=(j.data||[]).filter(Boolean);
    list=shuffle(items).slice(0,8);
    clear(r); drawWheel(); paintList();
    r.appendChild(h('p.hint',{html:L({en:'8 contenders loaded — hit SPIN.',ja:'8作品をロード。SPINを押せ。'})}));
  }));
  const spinBtn=btn('🎡 '+L({en:'SPIN',ja:'回す'}),'primary',()=>{
    if(spinning||!list.length) return;
    spinning=true; spinBtn.disabled=true;
    const winner=ri(0,list.length-1);
    const turns=ri(4,6)*360;
    angle=turns+(360-winner*45);
    c.style.transform='rotate('+angle+'deg)';
    setTimeout(()=>{
      spinning=false; spinBtn.disabled=false;
      const w=list[winner];
      clear(info);
      info.appendChild(h('div.panel',h('div.panel-title',{html:ico('wheel')+' '+esc(L({en:'The wheel has spoken',ja:'ルーレットが決めた'}))}),mediaCard(w)));
      info.appendChild(h('div.row',btn('🎡 '+L({en:'Spin again',ja:'もう一度'}),'primary',()=>{ clear(info); drawWheel(); paintList(); }),
        btn('▶ '+L({en:'Load next 8',ja:'次の8作品'}),'',()=>loadBtn.click())));
      toast('🎉 <b>'+esc(w.title)+'</b>');
    },4500);
  });
  const info=h('div'); const listBox=h('div');
  function paintList(){
    clear(listBox);
    if(!list.length) return;
    const g=h('div.chipset');
    list.forEach((a,i)=>g.appendChild(h('button.tchip',{type:'button',html:(i+1)+'. '+esc(a.title),onclick:()=>openInfo(a)})));
    listBox.appendChild(g);
  }
  m.appendChild(h('div.row',loadBtn,spinBtn));
  m.appendChild(wrapOuter); m.appendChild(info); m.appendChild(listBox);
  drawWheel();
};

/* ============================================================
   48 — ANIME STORY MAKER
   ============================================================ */
TOOLS_IMPL['story']=(m)=>{
  const out=h('div');
  const gen=()=>{
    const s=pick(STORY.settings),hero=pick(STORY.heroes),pw=pick(STORY.powers),v=pick(STORY.villains),st=pick(STORY.stakes);
    const text=`In ${s}, ${hero} discovers ${pw}. Standing in the way is ${v} — and unless someone acts, ${st}. What starts as an ordinary day becomes the season everyone will remember.`;
    clear(out);
    out.appendChild(h('div.quote-card',h('div.quote-mark','§'),h('div.q',text),
      h('div.row',{style:'margin-top:12px'},
        btn('📋 '+L(S.copied),'',()=>copyText(text)),
        btn('✍️ '+L({en:'New story',ja:'新しく作る'}),'primary',gen),
        btn('🌀 '+L({en:'Make it isekai',ja:'異世界化'}),'',()=>openTool('isekai')),
        btn('📛 '+L({en:'Name a hero',ja:'名前を付ける'}),'',()=>openTool('name-gen')))));
    out.appendChild(h('div.chipset',{style:'margin-top:10px'},
      h('span.tchip.on',{html:labelHTML('🏙 '+s)}),h('span.tchip.on',{html:labelHTML('🧑 '+hero)}),h('span.tchip.on',{html:labelHTML('⚡ '+pw)})));
  };
  m.appendChild(h('p.hint',{html:L({en:'Generates an original, shareable anime-style premise.',ja:'オリジナルのアニメ風プロットを生成します。'})}));
  m.appendChild(h('div.row',btn('✍️ '+L({en:'Write my story',ja:'あらすじを作る'}),'primary',gen)));
  m.appendChild(out); gen();
};

/* ============================================================
   49 — UKIYO-E ART GENERATOR
   ============================================================ */
TOOLS_IMPL['ukiyoe']=(m)=>{
  const W=960,Hh=660;
  const {wrap,c,ctx}=mkCanvas(W,Hh);
  const PALS=[
    {n:{en:'Sumi ink',ja:'墨'},   sky:['#f2e9d4','#e4d6b8'],sea:'#2f5f73',ink:'#20242c',red:'#c1341f',gold:'#c9a227',mist:'#fdfbf3'},
    {n:{en:'Indigo night',ja:'藍夜'},sky:['#24344d','#3f5673'],sea:'#16283c',ink:'#101820',red:'#e05c3a',gold:'#d8a94a',mist:'#cfd8e6'},
    {n:{en:'Crimson dusk',ja:'紅夕'},sky:['#f4d3ad','#e0896a'],sea:'#2a3f56',ink:'#2a1b18',red:'#b7332a',gold:'#d8a94a',mist:'#fdf3e2'},
    {n:{en:'Jade spring',ja:'翡翠'}, sky:['#e9ecd8','#cfdcc6'],sea:'#2f5f55',ink:'#24352b',red:'#c1341f',gold:'#c9a227',mist:'#fbfdf2'}
  ];
  const SCENES=[
    {k:'mountains',en:'Mist Mountains',ja:'山水雲霧',kanji:['山','水','雲','霧','峰','嵐']},
    {k:'torii',    en:'Torii at Sunset',ja:'夕の鳥居',kanji:['夕','陽','鳥','居','霞','空']},
    {k:'bamboo',   en:'Bamboo Grove',   ja:'竹林',   kanji:['竹','林','風','葉','青','雨']},
    {k:'wave',     en:'Great Wave',     ja:'風濤',   kanji:['波','濤','海','風','潮','礁']}
  ];
  const SEAL=['雅','風','濤','竹','鶴','龍','虎','月'];
  let seed=randSeed(),si=0,pi=0;
  function draw(){
    const R=mulberry(seed), P=PALS[pi%PALS.length], SC=SCENES[si%SCENES.length];
    /* ---------- helpers ---------- */
    const disc=(x,y,r,col,a)=>{ ctx.globalAlpha=a==null?0.92:a; ctx.fillStyle=col; ctx.beginPath(); ctx.arc(x,y,r,0,7); ctx.fill(); ctx.globalAlpha=1; };
    const mist=(y,h,a)=>{ const g=ctx.createLinearGradient(0,y,0,y+h);
      g.addColorStop(0,'rgba(255,255,255,0)'); g.addColorStop(.5,'rgba(255,255,255,'+a+')'); g.addColorStop(1,'rgba(255,255,255,0)');
      ctx.fillStyle=g; ctx.fillRect(0,y,W,h); };
    const ridge=(yBase,alpha,pk)=>{ ctx.fillStyle=P.ink; ctx.globalAlpha=alpha;
      const n=5+Math.floor(R()*4), pts=[];
      for(let i=0;i<=n;i++) pts.push([(W/n)*i, yBase-pk*(0.3+R()*0.7)]);
      ctx.beginPath(); ctx.moveTo(0,Hh); pts.forEach(p=>ctx.lineTo(p[0],p[1])); ctx.lineTo(W,Hh); ctx.closePath(); ctx.fill();
      ctx.globalAlpha=alpha*0.45; ctx.strokeStyle=P.mist; ctx.lineWidth=2.2;
      for(let i=0;i<9;i++){ const p=pts[Math.floor(R()*pts.length)];
        ctx.beginPath(); ctx.moveTo(p[0]+R()*40-20,p[1]+8); ctx.lineTo(p[0]+R()*60-30,p[1]+50+R()*60); ctx.stroke(); }
      ctx.globalAlpha=1; return pts; };
    const pagoda=(x,gy,s,floors)=>{ ctx.fillStyle=P.ink;
      for(let f=0;f<floors;f++){
        const bw=(46-f*6)*s, top=gy-(f+1)*40*s, rw=bw*0.5+15*s;
        ctx.fillRect(x-bw*0.45,top+8*s,bw*0.9,34*s);
        ctx.beginPath();
        ctx.moveTo(x-rw-8*s,top);
        ctx.quadraticCurveTo(x-rw*0.3,top-11*s,x,top-11*s);
        ctx.quadraticCurveTo(x+rw*0.3,top-11*s,x+rw+8*s,top);
        ctx.lineTo(x+rw*0.55,top+9*s);
        ctx.quadraticCurveTo(x,top+2*s,x-rw*0.55,top+9*s);
        ctx.closePath(); ctx.fill();
      }
      const ty=gy-floors*40*s;
      ctx.fillRect(x-2.5*s,ty-40*s,5*s,34*s);
      ctx.beginPath(); ctx.arc(x,ty-43*s,5.5*s,0,7); ctx.fill(); };
    const torii=(x,gy,s)=>{ ctx.fillStyle=P.red;
      const h=130*s, w=116*s, tw=14*s;
      ctx.fillRect(x-w/2-tw/2,gy-h,tw,h);
      ctx.fillRect(x+w/2-tw/2,gy-h,tw,h);
      ctx.fillRect(x-w/2-10*s,gy-h+36*s,w+20*s,13*s);
      ctx.fillRect(x-6*s,gy-h+20*s,12*s,17*s);
      ctx.beginPath();
      ctx.moveTo(x-w/2-30*s,gy-h+6*s);
      ctx.quadraticCurveTo(x,gy-h-18*s,x+w/2+30*s,gy-h+6*s);
      ctx.lineTo(x+w/2+24*s,gy-h+20*s);
      ctx.quadraticCurveTo(x,gy-h+2*s,x-w/2-24*s,gy-h+20*s);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle=P.ink; ctx.lineWidth=2.6*s; ctx.stroke(); };
    const pine=(x,y,s)=>{ ctx.fillStyle=P.ink; ctx.fillRect(x-2.4*s,y-20*s,4.8*s,20*s);
      for(let i=0;i<3;i++){ ctx.beginPath(); ctx.ellipse(x,y-16*s-i*11*s,(27-i*6)*s,7*s,0,0,7); ctx.fill(); } };
    const bamboo=(x,top,bot)=>{ const w=9+R()*13;
      ctx.globalAlpha=.9; ctx.fillStyle=P.ink; ctx.fillRect(x,top,w,bot-top); ctx.globalAlpha=1;
      for(let y=top+46;y<bot;y+=58+R()*16){ ctx.fillStyle=P.mist; ctx.fillRect(x-1,y,w+2,4);
        ctx.fillStyle=P.ink; ctx.fillRect(x-1,y+4,w+2,2); }
      ctx.fillStyle=P.ink;
      for(let i=0;i<6;i++){ const ly=top+R()*(bot-top)*0.72, dir=R()<.5?-1:1, ll=26+R()*34, lx=x+w/2;
        ctx.beginPath(); ctx.moveTo(lx,ly);
        ctx.quadraticCurveTo(lx+dir*ll*.5,ly-15,lx+dir*ll,ly-7);
        ctx.quadraticCurveTo(lx+dir*ll*.55,ly+5,lx,ly); ctx.fill(); } };
    const crane=(x,y,s,flap)=>{ ctx.strokeStyle=P.ink; ctx.lineWidth=3*s; ctx.lineCap='round';
      ctx.fillStyle=P.mist;
      ctx.beginPath(); ctx.ellipse(x,y,16*s,7*s,-.2,0,7); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x+10*s,y-4*s); ctx.quadraticCurveTo(x+26*s,y-15*s,x+34*s,y-24*s); ctx.stroke();
      ctx.beginPath(); ctx.arc(x+35*s,y-25*s,3.6*s,0,7); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x+38*s,y-26*s); ctx.lineTo(x+47*s,y-24*s); ctx.stroke();
      ctx.fillStyle=P.red; ctx.beginPath(); ctx.arc(x+35*s,y-28.5*s,1.7*s,0,7); ctx.fill();
      ctx.strokeStyle=P.ink;
      ctx.beginPath(); ctx.moveTo(x-8*s,y+5*s); ctx.lineTo(x-22*s,y+14*s);
      ctx.moveTo(x-5*s,y+6*s); ctx.lineTo(x-19*s,y+17*s); ctx.stroke();
      ctx.beginPath();
      if(flap){ ctx.moveTo(x,y); ctx.quadraticCurveTo(x-6*s,y-27*s,x-27*s,y-35*s);
                ctx.moveTo(x,y); ctx.quadraticCurveTo(x+8*s,y-25*s,x+25*s,y-31*s); }
      else    { ctx.moveTo(x,y); ctx.quadraticCurveTo(x-9*s,y-19*s,x-31*s,y-23*s);
                ctx.moveTo(x,y); ctx.quadraticCurveTo(x+7*s,y-17*s,x+27*s,y-21*s); }
      ctx.stroke(); };
    const bird=(bx,by,s)=>{ ctx.strokeStyle=P.ink; ctx.lineWidth=3.4; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(bx-s,by); ctx.quadraticCurveTo(bx-s*.4,by-s*.75,bx,by);
      ctx.quadraticCurveTo(bx+s*.4,by-s*.75,bx+s,by); ctx.stroke(); };
    const ruyun=(x,y,s)=>{ /* stacked cloud-band puffs */
      ctx.fillStyle=P.mist; ctx.globalAlpha=.5;
      for(let i=0;i<5;i++){ ctx.beginPath(); ctx.ellipse(x+i*s*.9,y+Math.sin(i)*4,s*(1.1-i*.12),s*.4,0,0,7); ctx.fill(); }
      ctx.globalAlpha=1; };

    /* ---------- sky + paper ---------- */
    const g=ctx.createLinearGradient(0,0,0,Hh); g.addColorStop(0,P.sky[0]); g.addColorStop(1,P.sky[1]);
    ctx.fillStyle=g; ctx.fillRect(0,0,W,Hh);
    for(let i=0;i<650;i++){ ctx.fillStyle='rgba(120,90,40,'+(0.02+R()*.05)+')'; ctx.fillRect(R()*W,R()*Hh,2,2); }
    for(let i=0;i<110;i++){ ctx.fillStyle='rgba(201,162,39,'+(0.14+R()*.46)+')';
      ctx.fillRect(R()*W,R()*Hh,1.5+R()*4,1.5+R()*4); }

    /* ---------- scenes ---------- */
    if(SC.k==='mountains'){
      disc(W*(.2+R()*.6),Hh*(.13+R()*.15),60+R()*46,P.red,.9);
      for(let i=0;i<3;i++) ruyun(W*(.06+R()*.66),Hh*(.1+R()*.24),50+R()*40);
      ridge(Hh*.5,0.15,80);  mist(Hh*.47,Hh*.1,0.5);
      ridge(Hh*.6,0.3,110);  mist(Hh*.57,Hh*.1,0.55);
      ridge(Hh*.76,0.55,130);mist(Hh*.7,Hh*.09,0.5);
      pagoda(W*(.14+R()*.72)|0,Hh*.66,0.85+R()*0.4,3+Math.floor(R()*2));
      pine(W*(.1+R()*.8),Hh*.84,1+R()*.8); pine(W*(.1+R()*.8),Hh*.9,0.8+R()*.7); pine(W*(.1+R()*.8),Hh*.87,0.7+R()*.5);
      crane(W*(.18+R()*.2),Hh*(.22+R()*.14),1.1,true); crane(W*(.3+R()*.2),Hh*(.3+R()*.1),0.85,false); crane(W*(.6+R()*.2),Hh*(.18+R()*.1),1,false);
    } else if(SC.k==='torii'){
      disc(W*.5,Hh*(.3+R()*.08),150+R()*40,P.red,.95);
      for(let i=0;i<4;i++) ruyun(W*(.05+R()*.7)|0,Hh*(.42+R()*.18),60+R()*50);
      ridge(Hh*.62,0.2,90); mist(Hh*.58,Hh*.1,0.4);
      ridge(Hh*.84,0.7,150);
      torii(W*(.32+R()*.36)|0,Hh*.86,1.15+R()*.4);
      pine(W*(.08+R()*.1),Hh*.95,1.1); pine(W*(.82+R()*.1),Hh*.96,1.2); pine(W*(.7+R()*.14),Hh*.9,0.8);
      crane(W*(.14+R()*.1),Hh*(.16+R()*.1),0.9,true); bird(W*(.6+R()*.25),Hh*(.14+R()*.1),14);
    } else if(SC.k==='bamboo'){
      disc(W*(.3+R()*.4),Hh*(.16+R()*.12),54+R()*34,P.mist,.65);
      mist(Hh*.4,Hh*.16,0.5); mist(Hh*.66,Hh*.12,0.4);
      const n=7+Math.floor(R()*4);
      for(let i=0;i<n;i++){ const x=40+R()*(W-80); bamboo(x,-20-R()*40,Hh*(.8+R()*.2)); }
      ridge(Hh*.9,0.4,60);
      pine(W*(.84+R()*.1),Hh*.96,1);
      crane(W*(.6+R()*.2),Hh*(.62+R()*.1),0.95,false);
      for(let i=0;i<4;i++) bird(W*(.2+R()*.6),Hh*(.1+R()*.18),10+R()*8);
    } else { /* wave */
      disc(W*(.66+R()*.2),Hh*(.14+R()*.1),70+R()*40,P.red,.92);
      /* sacred-mountain silhouette */
      ctx.fillStyle=P.ink; ctx.globalAlpha=.4;
      ctx.beginPath(); ctx.moveTo(W*.08,Hh*.62); ctx.lineTo(W*.34,Hh*.3); ctx.lineTo(W*.6,Hh*.62); ctx.closePath(); ctx.fill();
      ctx.globalAlpha=1; ctx.fillStyle=P.mist;
      ctx.beginPath(); ctx.moveTo(W*.27,Hh*.42); ctx.lineTo(W*.34,Hh*.3); ctx.lineTo(W*.41,Hh*.42);
      ctx.quadraticCurveTo(W*.37,Hh*.47,W*.34,Hh*.43); ctx.quadraticCurveTo(W*.31,Hh*.47,W*.27,Hh*.42); ctx.closePath(); ctx.fill();
      mist(Hh*.56,Hh*.1,0.5);
      /* sea */
      const base=Hh*.64;
      ctx.fillStyle=P.sea;
      ctx.beginPath(); ctx.moveTo(0,Hh);
      for(let x=0;x<=W;x+=8){ const y=base+Math.sin((x/W)*Math.PI*(2.6+R()*.06)+seed%7)*44+Math.sin(x/46)*16; ctx.lineTo(x,y); }
      ctx.lineTo(W,Hh); ctx.closePath(); ctx.fill();
      /* curling claw wave (right) */
      const cxW=W*(.6+R()*.2), cyW=base-40;
      ctx.fillStyle=P.sea;
      ctx.beginPath(); ctx.moveTo(cxW-160,Hh);
      ctx.quadraticCurveTo(cxW-140,cyW+40,cxW-40,cyW-60);
      ctx.quadraticCurveTo(cxW+40,cyW-130,cxW+90,cyW-40);
      ctx.quadraticCurveTo(cxW+140,cyW+60,cxW+170,Hh);
      ctx.closePath(); ctx.fill();
      /* foam */
      ctx.strokeStyle=P.mist; ctx.lineWidth=5;
      for(let k=0;k<6;k++){ const px=cxW-60+R()*140, py=cyW-70+R()*60;
        ctx.beginPath();
        for(let i=0;i<4;i++){ const qx=px+i*15, qy=py-i*8;
          ctx.moveTo(qx,qy+16); ctx.quadraticCurveTo(qx+8,qy-6,qx+15,qy+12); }
        ctx.stroke(); }
      ctx.fillStyle=P.gold;
      for(let i=0;i<40;i++){ const fx=cxW-120+R()*260, fy=base-90+R()*160;
        ctx.globalAlpha=.5+R()*.5; ctx.beginPath(); ctx.arc(fx,fy,1.5+R()*3,0,7); ctx.fill(); }
      ctx.globalAlpha=1;
      /* secondary swell lines */
      ctx.strokeStyle='rgba(253,251,243,.5)'; ctx.lineWidth=3;
      for(let i=0;i<12;i++){ const y=base+50+i*24+R()*10;
        ctx.beginPath(); ctx.moveTo(0,y);
        for(let x=0;x<=W;x+=60) ctx.quadraticCurveTo(x+30,y-9+R()*16,x+60,y);
        ctx.stroke(); }
      for(let i=0;i<4;i++) bird(W*(.1+R()*.3),Hh*(.1+R()*.16),11+R()*9);
      /* little boat */
      ctx.strokeStyle=P.ink; ctx.lineWidth=4;
      const bxx=W*(.12+R()*.16), byy=base+34;
      ctx.beginPath(); ctx.moveTo(bxx-34,byy); ctx.quadraticCurveTo(bxx,byy+16,bxx+34,byy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bxx,byy); ctx.lineTo(bxx,byy-36); ctx.stroke();
      ctx.fillStyle=P.mist; ctx.beginPath(); ctx.moveTo(bxx,byy-34); ctx.lineTo(bxx+26,byy-12); ctx.lineTo(bxx,byy-12); ctx.closePath(); ctx.fill();
    }

    /* ---------- dry-brush texture + gold accents ---------- */
    ctx.lineCap='round';
    for(let i=0;i<16;i++){ ctx.strokeStyle='rgba(30,30,40,'+(0.03+R()*0.06)+')'; ctx.lineWidth=1+R()*5;
      const y=R()*Hh; ctx.beginPath(); ctx.moveTo(-10,y); ctx.bezierCurveTo(W*.3,y-40+R()*80,W*.7,y-40+R()*80,W+10,y); ctx.stroke(); }
    for(let i=0;i<3;i++){ ctx.fillStyle='rgba(201,162,39,'+(0.5+R()*.4)+')';
      const x=40+R()*(W-80), y=Hh*.5+R()*Hh*.4; ctx.beginPath(); ctx.arc(x,y,3+R()*5,0,7); ctx.fill(); }

    /* ---------- frame, calligraphy, seal ---------- */
    ctx.strokeStyle=P.ink; ctx.lineWidth=10; ctx.strokeRect(14,14,W-28,Hh-28);
    ctx.strokeStyle=P.gold; ctx.lineWidth=3;   ctx.strokeRect(26,26,W-52,Hh-52);
    [[30,30],[W-30,30],[30,Hh-30],[W-30,Hh-30]].forEach(([x,y])=>{ ctx.fillStyle=P.gold; ctx.fillRect(x-5,y-5,10,10); });
    ctx.font='700 46px "Yu Mincho","Hiragino Mincho ProN","Noto Serif JP",serif';
    ctx.fillStyle=P.ink; ctx.textAlign='center';
    SC.kanji.slice(0,4).forEach((ch,i)=>ctx.fillText(ch,W-74,92+i*58));
    ctx.fillStyle=P.red; ctx.fillRect(W-100,Hh-152,54,54);
    ctx.fillStyle='#fff'; ctx.font='800 28px Georgia,serif';
    ctx.fillText(SEAL[(seed>>>3)%SEAL.length],W-73,Hh-115);
    ctx.textAlign='left'; ctx.fillStyle=P.ink; ctx.font='italic 25px Georgia,serif';
    ctx.fillText(L(SC.en===undefined?{en:'',ja:''}:{en:SC.en,ja:SC.ja})+' · '+P.n.en+' · '+new Date().toLocaleDateString(),44,Hh-44);
  }
  m.appendChild(h('div.row',
    btn('🎨 '+L({en:'New artwork',ja:'新規生成'}),'primary',()=>{ seed=randSeed(); si=Math.floor(Math.random()*SCENES.length); pi=Math.floor(Math.random()*PALS.length); draw(); }),
    btn('🏞 '+L({en:'Next scene',ja:'次の画題'}),'',()=>{ si=(si+1)%SCENES.length; seed=randSeed(); draw(); }),
    btn('🖌 '+L({en:'Next palette',ja:'パレット変更'}),'',()=>{ pi=(pi+1)%PALS.length; seed=randSeed(); draw(); }),
    btn('⬇️ '+L(S.download),'gold',()=>dlCanvas(c,'dynasty-art.png'))));
  m.appendChild(h('p.hint',{html:L({en:'Dynastic Japanese & Chinese artwork — mist mountains, torii, bamboo groves and great waves, painted in ink & gold on canvas. Every piece is unique.',ja:'王朝様式の日本・中国風アート — 山水雲霧・鳥居・竹林・風濤を墨と金でcanvasに。毎回ユニークな一枚。'})}));
  m.appendChild(wrap); draw();
};

/* ============================================================
   50 — ANIME FILTER (power search)
   ============================================================ */
TOOLS_IMPL['filter']=(m,preset={})=>{
  const qIn=inp({value:preset.q||'',placeholder:L({en:'Keyword',ja:'キーワード'})});
  const typeS=selEl([{v:'',t:L({en:'Any type',ja:'全形式'})},'tv','movie','ova','ona','special'],'');
  const stS=selEl([{v:'',t:L({en:'Any status',ja:'全状態'})},{v:'airing',t:L({en:'Airing',ja:'放送中'})},{v:'complete',t:L({en:'Finished',ja:'完結'})},{v:'upcoming',t:L({en:'Upcoming',ja:'予定'})}],'');
  const minY=selEl(Array.from({length:60},(_,i)=>String(new Date().getFullYear()-i)),'');
  const maxY=selEl(Array.from({length:60},(_,i)=>String(new Date().getFullYear()-i)),'');
  minY.value=''; maxY.value='';
  const minS=inp({type:'number',min:'0',max:'10',placeholder:'0'});
  const maxS=inp({type:'number',min:'0',max:'10',placeholder:'10'});
  const ordS=selEl([{v:'members',t:L({en:'Popularity',ja:'人気'})},{v:'score',t:L({en:'Score',ja:'スコア'})},{v:'start_date',t:L({en:'Start date',ja:'開始日'})},{v:'title',t:L({en:'Title',ja:'タイトル'})}],'members');
  let genres=new Set(); const genreSlot=h('div');
  getGenres().then(gs=>{ const ch=chipset(gs.map(x=>({t:x.name,v:x.mal_id})),{multi:true,onchange:v=>genres=new Set(v)}); clear(genreSlot); genreSlot.appendChild(ch.el); }).catch(()=>{});
  const list=makeList(m,{rank:true});
  const run=(page=1)=>{
    const q={q:qIn.value.trim(),type:typeS.value||undefined,status:stS.value||undefined,order_by:ordS.value,sort:'desc',
      min_score:minS.value||undefined,max_score:maxS.value||undefined,
      start_date:minY.value?minY.value+'-01-01':undefined,end_date:maxY.value?maxY.value+'-12-31':undefined,
      genres:[...genres].join(',')||undefined};
    list.go(page,q);
  };
  m.appendChild(panel(L({en:'Advanced filters',ja:'詳細フィルター'}),
    h('div.row',field(L({en:'Keyword',ja:'キーワード'}),qIn),field(L({en:'Type',ja:'形式'}),typeS),field(L({en:'Status',ja:'状態'}),stS),field(L({en:'Sort',ja:'並び'}),ordS)),
    h('div.row',{style:'margin-top:10px'},field(L({en:'From year',ja:'開始年'}),minY),field(L({en:'To year',ja:'終了年'}),maxY),field(L({en:'Min score',ja:'最低'}),minS),field(L({en:'Max score',ja:'最高'}),maxS)),
    h('div',{style:'margin-top:10px'},h('label.label',L({en:'Genres',ja:'ジャンル'})),genreSlot),
    h('div.row',{style:'margin-top:12px'},btn('🧹 '+L(S.run),'primary',()=>run(1)),
      btn('♻️ '+L(S.clear),'',()=>{ qIn.value=''; minY.value=''; maxY.value=''; minS.value=''; maxS.value=''; genres.clear(); $$('.tchip.on',genreSlot).forEach(x=>x.classList.remove('on')); run(1); }))));
  run(1);
};

/* ============================================================
   51 — JAPAN FACTS
   ============================================================ */
TOOLS_IMPL['facts']=(m)=>{
  const card=h('div');
  const streakBox=h('div');
  let filterCat=null;
  const paintStreak=()=>{
    const d=new Date().toDateString();
    let s=store.get('azt_fact_streak',{d:null,c:0,seen:0});
    if(s.d!==d){ s={d,c:(new Date(s.d)!=='Invalid Date'&&Date.now()-new Date(s.d).getTime()<1728e5)?s.c+1:1,seen:0}; store.set('azt_fact_streak',s); }
    clear(streakBox);
    streakBox.appendChild(h('div.stat-row',
      h('div.stat-box',h('small',L({en:'Day streak',ja:'連続閲覧'})),h('div.big-num',s.c)),
      h('div.stat-box',h('small',L({en:'Facts seen today',ja:'今日見た豆知識'})),h('div.big-num',s.seen||0)),
      h('div.stat-box',h('small',L({en:'Total facts',ja:'総豆知識数'})),h('div.big-num',FACTS.length))));
  };
  const bump=()=>{ const d=new Date().toDateString(); let s=store.get('azt_fact_streak',{d,c:0,seen:0}); if(s.d!==d) s={d,c:1,seen:0}; s.seen=(s.seen||0)+1; store.set('azt_fact_streak',s); paintStreak(); };
  const show=()=>{
    clear(card);
    const pool=filterCat?FACTS.filter(f=>f.c===filterCat):FACTS;
    const f=pick(pool);
    card.appendChild(h('div.facts-card',
      h('div.tag.red',{style:'display:inline-block;margin-bottom:10px',html:labelHTML('🗾 '+f.c)}),
      h('div.f',f.f),
      h('div.row',{style:'justify-content:center;margin-top:14px'},
        btn('📋 '+L(S.copied),'',()=>copyText(f.f)),
        btn('♻️ '+L({en:'Next fact',ja:'次の豆知識'}),'primary',()=>{ show(); bump(); }),
        btn('🎌 '+L({en:'About Japan',ja:'日本について'}),'',()=>openTool('news')))));
    bump();
  };
  const cats=[null,...new Set(FACTS.map(f=>f.c))];
  const chips=chipset(cats.map(c=>({t:c?c:'✦ '+L({en:'All',ja:'すべて'}),v:c})),{onchange:v=>{ filterCat=v[0]||null; show(); }});
  m.appendChild(panel(L({en:'Category',ja:'カテゴリー'}),chips.el));
  m.appendChild(card); m.appendChild(streakBox);
  paintStreak(); show();
};

/* ============================================================
   52 — BEST ANIME FINDER
   ============================================================ */
TOOLS_IMPL['best']=(m)=>{
  const genreSlot=h('div'); let gsel=null;
  const decade=selEl([{v:'',t:L({en:'Any decade',ja:'全年代'})},...Array.from({length:11},(_,i)=>{ const y=2020-i*10; return {v:y+'-01-01|'+(y+9)+'-12-31',t:y+'s'} }),{v:'1980-01-01|1989-12-31',t:'1980s'},{v:'1970-01-01|1979-12-31',t:'1970s'}],'');
  const typeS=selEl([{v:'',t:L({en:'Any type',ja:'全形式'})},'tv','movie','ova'],'');
  const minS=inp({type:'number',value:'8',min:'0',max:'10',step:'.1'});
  getGenres().then(gs=>{
    const ch=chipset(gs.slice(0,30).map(x=>({t:x.name,v:x.mal_id})),{onchange:v=>{ gsel=v[0]||null; run(1); }});
    clear(genreSlot); genreSlot.appendChild(ch.el);
  }).catch(()=>{});
  const out=h('div');
  const run=(page=1)=>withBusy(out,async r=>{
    const [sd,ed]=(decade.value||'|').split('|');
    const j=await japi('/anime',{genres:gsel||undefined,start_date:sd||undefined,end_date:ed||undefined,type:typeS.value||undefined,
      min_score:minS.value||undefined,order_by:'score',sort:'desc',page,limit:14});
    const items=(j.data||[]).filter(Boolean);
    clear(r);
    if(!items.length){ r.appendChild(emptyBox(L({en:'No titles pass that bar — lower the min score.',ja:'条件を満たす作品なし。最低スコアを下げて。'}),'🥇')); return; }
    r.appendChild(h('div.panel',h('div.panel-title',L({en:'Verdict',ja:'判定'})),
      h('p.hint',L({en:'Best-rated titles matching your genre + era, with the stats that justify them.',ja:'ジャンル×年代で最高評価。根拠となる統計付き。'})+' '+items.length+'/page')));
    const g=h('div.results');
    items.forEach((a,i)=>{
      const card=mediaCard(a,{rank:page===1?i+1:undefined,snip:true});
      const why=h('div.chipset',{style:'margin-top:6px'});
      if(a.score) why.appendChild(h('span.tchip.on','★ '+a.score));
      if(a.members) why.appendChild(h('span.tchip',{html:labelHTML('👥 '+(a.members/1000).toFixed(0)+'k')}));
      if(a.rank) why.appendChild(h('span.tchip','#'+a.rank+' '+L({en:'overall',ja:'総合'})));
      card.querySelector('.ac-body').appendChild(why);
      g.appendChild(card);
    });
    r.appendChild(g);
    const pg=pager(j.pagination,np=>run(np)); if(pg) r.appendChild(pg);
  });
  m.appendChild(panel(L({en:'Define "best"',ja:'「ベスト」の定義'},
    ),
    h('div',h('label.label',L({en:'Genre',ja:'ジャンル'})),genreSlot),
    h('div.row',{style:'margin-top:10px'},field(L({en:'Era',ja:'年代'}),decade),field(L({en:'Type',ja:'形式'}),typeS),field(L({en:'Min score',ja:'最低スコア'}),minS)),
    h('div.row',{style:'margin-top:12px'},btn('🥇 '+L({en:'Find the best',ja:'ベストを探す'}),'primary',()=>run(1)))));
  m.appendChild(out); run(1);
};

/* ============================================================
   53 — SIMILAR MANGA
   ============================================================ */
TOOLS_IMPL['sim-manga']=(m,preset={})=>{
  const out=h('div'); m.appendChild(out);
  const render=(item)=>withBusy(out,async r=>{
    const j=await japi('/manga/'+item.mal_id+'/recommendations');
    const recs=(j.data||[]).map(x=>x.entry||x).filter(Boolean);
    clear(r);
    r.appendChild(h('div.panel',h('div.panel-title',L({en:'Because you liked',ja:'好きな作品：'})+' · '+item.title)));
    if(!recs.length){ r.appendChild(emptyBox(L({en:'No manga recommendations indexed — try another title.',ja:'推薦が未登録。別作品をどうぞ。'}),'📚')); return; }
    const g=h('div.results');
    recs.slice(0,30).forEach(x=>{
      const card=h('article.acard');
      const img=x.images&&x.images.jpg&&x.images.jpg.image_url;
      if(img) card.appendChild(h('img.ac-thumb',{src:img,loading:'lazy',onerror(){this.style.visibility='hidden'}}));
      const acts=h('div.ac-actions');
      acts.appendChild(btnI('ℹ️','','',()=>window.open('https://myanimelist.net/manga/'+x.mal_id,'_blank','noopener')));
      acts.appendChild(btnI('⇄ ','','',()=>render({mal_id:x.mal_id,title:x.title})));
      card.appendChild(h('div.ac-body',h('div.ac-title',x.title),acts));
      g.appendChild(card);
    });
    r.appendChild(g);
    r.appendChild(h('div.row',btn('🔎 '+L({en:'Another manga',ja:'別の漫画'}),'',()=>searchHere())));
  });
  function searchHere(){ clear(out); out.appendChild(panel(L({en:'Which manga?',ja:'どの漫画？'}),searchBox({kind:'manga',initial:preset.q||'',onPick:a=>render(a)}))); }
  if(preset.q){
    (async()=>{ try{ const j=await japi('/manga',{q:preset.q,limit:1,order_by:'members',sort:'desc'}); const first=(j.data||[])[0]; first?render(first):searchHere(); }catch(e){ searchHere(); } })();
  } else searchHere();
};

/* ============================================================
   54 — ANIME CHARACTERS
   ============================================================ */
TOOLS_IMPL['chars']=(m)=>{
  const out=h('div');
  const modeBar=h('div.chipset');
  const searchOut=h('div');
  const byAnime=()=>{
    clear(searchOut);
    searchOut.appendChild(panel(L({en:'Pick an anime to see its cast',ja:'作品を選んでキャスト表示'}),
      searchBox({placeholder:L({en:'Anime title…',ja:'アニメ名…'}),onPick:a=>withBusy(out,async r=>{
        const j=await japi('/anime/'+a.mal_id+'/characters');
        const chars=(j.data||[]).filter(Boolean);
        clear(r);
        r.appendChild(h('div.panel',h('div.panel-title',a.title+' · '+chars.length+' '+L({en:'characters',ja:'キャラ'}))));
        if(!chars.length){ r.appendChild(emptyBox()); return; }
        const g=h('div.results');
        chars.slice(0,40).forEach(ch=>{
          const c=ch.character||{};
          const card=h('article.acard');
          const img=c.images&&c.images.jpg&&c.images.jpg.image_url;
          if(img) card.appendChild(h('img.ac-thumb',{src:img,loading:'lazy',onerror(){this.style.visibility='hidden'}}));
          card.appendChild(h('div.ac-body',
            h('div.ac-title',c.name||'—'),
            h('div.ac-meta',{html:esc(ch.role||'')+(ch.favorites?' · '+labelHTML('❤ '+ch.favorites.toLocaleString()):'')}),
            h('div.ac-actions',btnI('🔍 '+L({en:'More like this',ja:'同キャラ検索'}),'','small',()=>mode('search',c.name)),
              btnI('🔗','','small',()=>window.open(c.url||('https://myanimelist.net/character/'+c.mal_id),'_blank','noopener')))));
          g.appendChild(card);
        });
        r.appendChild(g);
      })})));
  };
  const directSearch=(q='')=>{
    clear(searchOut);
    const input=inp({value:q,placeholder:L({en:'Character name…',ja:'キャラ名…'}),autocomplete:'off'});
    const list=h('div');
    const go=async()=>{
      clear(list); list.appendChild(skelGrid(4));
      try{
        const j=await japi('/characters',{q:input.value.trim(),limit:12,order_by:'favorites',sort:'desc'});
        const items=(j.data||[]).filter(Boolean);
        clear(list);
        if(!items.length){ list.appendChild(emptyBox()); return; }
        items.forEach(ch=>list.appendChild(h('div.track',
          ch.images&&ch.images.jpg&&ch.images.jpg.image_url?h('img',{src:ch.images.jpg.image_url,style:'width:44px;height:58px;object-fit:cover;border-radius:6px',onerror(){this.style.visibility='hidden'}}):null,
          h('div.grow',h('div.t',ch.name||'—'),h('div.a',(ch.favorites||0).toLocaleString()+' '+L({en:'favorites',ja:'フォavs'}))),
          h('a.btn.small.gold',{href:ch.url||('https://myanimelist.net/character/'+ch.mal_id),target:'_blank',rel:'noopener'},'MAL'))));
      }catch(e){ clear(list); list.appendChild(errBox(e.message,go)); }
    };
    input.addEventListener('keydown',e=>{ if(e.key==='Enter') go(); });
    searchOut.appendChild(panel(L({en:'Character search (global)',ja:'キャラ横断検索'}),h('div.row',input,btn('🔎 '+L(S.run),'gold',go)),
      h('div',{style:'margin-top:10px'},list)));
    if(q) go(); else go();
  };
  const mode=(which,q='')=>{
    [...modeBar.children].forEach(c=>c.className='tchip');
    if(which==='anime'){ modeBar.children[0].className='tchip on'; byAnime(); }
    else{ modeBar.children[1].className='tchip on'; directSearch(q); }
  };
  modeBar.appendChild(h('button.tchip.on',{type:'button',html:labelHTML('📺 '+L({en:'By anime',ja:'作品から'})),onclick:()=>mode('anime')}));
  modeBar.appendChild(h('button.tchip',{type:'button',html:labelHTML('🔍 '+L({en:'Search characters',ja:'キャラ検索'})),onclick:()=>mode('search')}));
  m.appendChild(panel(L({en:'Mode',ja:'モード'}),modeBar));
  m.appendChild(searchOut); m.appendChild(out);
  mode('anime');
};

/* ============================================================
   55 — ANIME INFO (dossier)
   ============================================================ */
TOOLS_IMPL['dossier']=(m,preset={})=>{
  const out=h('div');
  const show=async(a)=>{
    await withBusy(out,async r=>{
      const full=await japi('/anime/'+a.mal_id+'/full');
      const d=full.data||{};
      clear(r);
      const head=h('div.row',{style:'align-items:flex-start;gap:14px'});
      const img=d.images&&d.images.jpg&&d.images.jpg.large_image_url;
      if(img) head.appendChild(h('img',{src:img,style:'width:130px;border-radius:10px;border:2px solid rgba(20,22,29,.3)',onerror(){this.style.display='none'}}));
      const infoCol=h('div.grow',
        h('div.panel-title',d.title||'—'),
        d.title_japanese?h('div.ac-ja',d.title_japanese):null,
        h('div.chipset',{style:'margin-top:6px'},
          d.type?h('span.tchip.on',d.type):null,d.year?h('span.tchip',String(d.year)):null,
          h('span.tchip','★ '+(d.score||'—')),d.episodes?h('span.tchip',d.episodes+' ep'):null,
          d.status?h('span.tchip',d.status):null,d.rank?h('span.tchip','#'+d.rank):null,
          d.members?h('span.tchip',{html:labelHTML('👥 '+(d.members/1000).toFixed(0)+'k')}):null));
      head.appendChild(infoCol);
      r.appendChild(head);
      r.appendChild(h('div.panel',h('div.panel-title',L({en:'Synopsis',ja:'あらすじ'})),
        h('p.syn',(d.synopsis||L({en:'No synopsis.',ja:'あらすじなし。'})).replace(/\[Written by MAL Rewrite\]/g,''))));
      r.appendChild(h('div.panel',h('div.panel-title',L({en:'Details',ja:'詳細'})),
        h('div.dl',
          h('div',h('dt',L({en:'Source',ja:'原作'})),h('dd',d.source||'—')),
          h('div',h('dt',L({en:'Studio',ja:'制作'})),h('dd',(d.studios||[]).map(s=>s.name).join(', ')||'—')),
          h('div',h('dt',L({en:'Season',ja:'放送季'})),h('dd',d.season?d.season+' '+d.year:'—')),
          h('div',h('dt',L({en:'Duration',ja:'尺'})),h('dd',d.duration||'—')),
          h('div',h('dt',L({en:'Rating',ja:'区分'})),h('dd',d.rating||'—')),
          h('div',h('dt',L({en:'Favorites',ja:'お気に入り'})),h('dd',d.favorites?d.favorites.toLocaleString():'—')))));
      const rel=h('div.chipset');
      (d.genres||[]).forEach(g=>rel.appendChild(h('span.tchip.on',g.name)));
      (d.themes||[]).forEach(g=>rel.appendChild(h('span.tchip',g.name)));
      (d.demographics||[]).forEach(g=>rel.appendChild(h('span.tchip',g.name)));
      if(rel.childNodes.length) r.appendChild(h('div.panel',h('div.panel-title',L({en:'Classification',ja:'分類'})),rel));
      const relations=(d.relations||[]).slice(0,6);
      if(relations.length){
        const rg=h('div.chipset');
        relations.forEach(rr=>(rr.entry||[]).slice(0,4).forEach(e=>rg.appendChild(h('button.tchip',{type:'button',html:(rr.relation||'')+' · '+e.name,
          onclick:()=>{ if(e.type==='anime') show({mal_id:e.mal_id}); else window.open(e.url,'_blank','noopener'); }}))));
        r.appendChild(h('div.panel',h('div.panel-title',L({en:'Related works',ja:'関連作品'})),rg));
      }
      const ext=(d.external||[]).slice(0,8);
      if(ext.length){ const eg=h('div.chipset'); ext.forEach(e=>eg.appendChild(h('a.tchip',{href:e.url,target:'_blank',rel:'noopener'},e.name))); r.appendChild(h('div.panel',h('div.panel-title',L({en:'Official links',ja:'公式リンク'})),eg)); }
    });
  };
  m.appendChild(panel(L({en:'Open a dossier',ja:'ファイルを開く'}),searchBox({initial:preset.q||'',placeholder:L({en:'Anime title…',ja:'アニメ名…'}),onPick:show})));
  m.appendChild(out);
  if(preset.id&&preset.q) show({mal_id:preset.id,title:preset.q});
};

/* ============================================================
   56 — GHIBLI COLLECTION
   ============================================================ */
TOOLS_IMPL['ghibli']=(m)=>{
  const out=h('div');
  const prog=h('p.hint');
  m.appendChild(h('p.hint',{html:L({en:'All Studio Ghibli theatrical films, resolved live from MAL — the free Studio Ghibli API runs alongside as a safety net.',ja:'ジブリ全劇場作品をMALからライブ解決。無料のStudio Ghibli APIを並走させ、接続失敗時は代替表示。'})}));
  m.appendChild(prog); m.appendChild(out);
  (async()=>{
    /* Studio Ghibli API (free · keyless) — parallel source for facts + fallback */
    let ghib=[];
    try{ const r=await xfetch('https://ghibliapi.vercel.app/films?limit=250',{cache:'no-store'},8000); if(r.ok) ghib=await r.json()||[]; }catch(e){}
    const byName={}; ghib.forEach(f=>{ if(f&&f.title) byName[norm(f.title)]=f; });
    /* 22 lookups in parallel (5 at a time) — a few seconds instead of a minute */
    let done=0;
    const rows=await mapLimit(GHIBLI,5,async(title)=>{
      prog.innerHTML=labelHTML('🕯️ '+L({en:'Loading',ja:'読込中'})+' '+(++done)+'/'+GHIBLI.length+' …');
      let cand=[];
      try{ const j=await japi('/anime',{q:title,type:'movie',limit:6,order_by:'members',sort:'desc'}); cand=(j.data||[]).filter(Boolean); }catch(e){}
      const nt=norm(title), n=nt.slice(0,5);
      const match=cand.find(x=>norm(x.title)===nt)||cand.find(x=>norm(x.title).includes(nt))||
                  cand.find(x=>nt.includes(norm(x.title)))||
                  cand.find(x=>norm(x.title_english||'')===nt)||cand[0];
      /* guard must accept romaji when the ENGLISH title matched
         ("Tonari no Totoro" ↔ "My Neighbor Totoro") */
      const ok=match&&(norm(match.title).slice(0,5)===n||norm(match.title_english||'').slice(0,5)===n);
      return ok?{a:match,g:byName[nt]||null}:null;
    });
    const found=rows.filter(Boolean);
    clear(out);
    prog.innerHTML=labelHTML('🕊️ '+found.length+' / '+GHIBLI.length+' '+L({en:'films resolved',ja:'作品を解決'}))+
      (ghib.length?' · Ghibli API '+ghib.length:'');
    if(!found.length){
      if(ghib.length){ renderGhib(ghib); return; }
      out.appendChild(emptyBox(L({en:'Could not reach MAL — check the Connection Doctor.',ja:'MALに接続できません。接続診断をどうぞ。'}),'🕊️')); return;
    }
    const g=h('div.results');
    found.sort((p,q)=>(q.a.score||0)-(p.a.score||0)).forEach((row,i)=>{
      const a=row.a;
      const card=mediaCard(a,{rank:i+1,actions:['info','watch','source']});
      const f=row.g;
      card.querySelector('.ac-body').appendChild(h('div.chipset',{style:'margin-top:6px'},
        h('span.tchip.on',{html:labelHTML('🕊️ Studio Ghibli')}),
        f&&f.director?h('span.tchip',{html:labelHTML('🎬 '+f.director)}):null,
        f&&f.release_date?h('span.tchip',{html:labelHTML('🗓️ '+String(f.release_date).slice(0,4))}):null,
        a.members?h('span.tchip',{html:labelHTML('👥 '+(a.members/1000).toFixed(0)+'k')}):null));
      g.appendChild(card);
    });
    out.appendChild(g);
    if(ghib.length) out.appendChild(h('p.hint',{html:L({en:'Director / year chips: Studio Ghibli API (free, keyless). Card data & actions: MyAnimeList.',ja:'監督・年号チップ: Studio Ghibli API（無料）。カード・操作: MyAnimeList。'})}));
  })();
  /* Shown only when MAL itself is unreachable — the tool still works */
  function renderGhib(films){
    const g=h('div.results');
    films.forEach(f=>{
      const card=h('article.acard');
      card.appendChild(h('div.ac-body',
        h('div.ac-title',f.title||'—'),
        h('div.ac-meta',[f.director,String(f.release_date||'').slice(0,4),f.rt_score?('RT '+f.rt_score):''].filter(Boolean).join(' · ')),
        f.description?h('div.ac-snip',String(f.description).slice(0,180)+'…'):null,
        h('div.ac-actions',
          h('a.btn.small.gold',{href:'https://www.justwatch.com/us/search?q='+encodeURIComponent(f.title||''),target:'_blank',rel:'noopener',html:labelHTML('📺 '+L({en:'Where to watch',ja:'視聴先'}))}))));
      g.appendChild(card);
    });
    out.appendChild(g);
    out.appendChild(h('p.hint',{html:L({en:'Source: Studio Ghibli API (free · keyless). MyAnimeList is unreachable right now — availability search links go through JustWatch (licensed services only).',ja:'出典: Studio Ghibli API（無料）。MAL未到達 — 視聴先検索はJustWatch経由（正規サービスのみ）。'})}));
  }
};

/* ============================================================
   57 — WHERE TO WATCH
   ============================================================ */
TOOLS_IMPL['watch']=(m,preset={})=>{
  const out=h('div');
  const show=(a)=>withBusy(out,async r=>{
    const j=await japi('/anime/'+a.mal_id+'/streaming');
    const links=(j.data||[]).filter(Boolean);
    clear(r);
    r.appendChild(h('div.panel',h('div.panel-title',a.title)));
    if(!links.length){
      r.appendChild(emptyBox(L({en:'No streaming links indexed for your region — check the official site.',ja:'地域の配信情報が未登録です。公式サイトを確認してください。'}),'📺'));
    } else {
      links.forEach(s=>r.appendChild(h('div.track',
        h('div',h('div.t',s.name||s.url),h('div.a',(s.country?String(s.country).toUpperCase():L({en:'official source',ja:'正規サービス'})))),
        h('a.btn.small.gold',{style:'margin-left:auto',
          href:s.url||('https://www.justwatch.com/us/search?q='+encodeURIComponent(a.title||'')),
          target:'_blank',rel:'noopener'},L({en:'Open',ja:'開く'})))));
      r.appendChild(h('p.hint',{html:L({en:'Directory data: MyAnimeList official streaming list — licensed services only.',ja:'出典: MAL公式配信リスト。ライセンス済みサービスのみ。'})}));
    }
    r.appendChild(h('div.row',btn('🗣️ '+L({en:'Dub check',ja:'吹き替え確認'}),'',()=>openTool('dub',{q:a.title})),
      btn('🎞️ '+L({en:'Trailers & episodes',ja:'予告編・話数'}),'',()=>openTool('hub',{q:a.title}))));
  });
  m.appendChild(panel(L({en:'Where can I watch it legally?',ja:'どこで正規視聴できる？'}),
    searchBox({initial:preset.q||'',placeholder:L({en:'Anime title…',ja:'アニメ名…'}),onPick:show})));
  m.appendChild(out);
};

/* ============================================================
   58 — TRAILER & EPISODE HUB
   ============================================================ */
TOOLS_IMPL['hub']=(m,preset={})=>{
  const out=h('div');
  const show=(a)=>withBusy(out,async r=>{
    const vid=await japi('/anime/'+a.mal_id+'/videos');
    const promos=((vid.data||{}).promo||[]).filter(Boolean);
    clear(r);
    r.appendChild(h('div.panel',h('div.panel-title',a.title)));
    const vids=promos.filter(p=>p&&p.trailer_id).slice(0,6);
    if(vids.length){
      const frame=h('iframe',{src:'https://www.youtube-nocookie.com/embed/'+vids[0].trailer_id+'?rel=0',
        style:'width:100%;aspect-ratio:16/9;border:0',
        allow:'accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture; fullscreen',
        allowfullscreen:true,title:L({en:'Trailer',ja:'予告編'})});
      r.appendChild(h('div.canvas-wrap',frame));
      if(vids.length>1){
        const g=h('div.chipset',{style:'margin-top:10px'});
        vids.forEach((p,i)=>{
          const c=h('button.tchip'+(i===0?'.on':''),{type:'button',
            html:ico('play')+' '+esc(p.title||(L({en:'PV',ja:'PV'})+' '+(i+1))),
            onclick:()=>{
              frame.src='https://www.youtube-nocookie.com/embed/'+p.trailer_id+'?autoplay=1&rel=0';
              [...g.children].forEach(x=>x.classList.remove('on'));
              c.classList.add('on');
            }});
          g.appendChild(c);
        });
        r.appendChild(g);
        r.appendChild(h('p.hint',{html:L({en:'Every trailer plays inline — nothing opens in a new tab.',ja:'すべての予告編をインライン再生。新しいタブは開きません。'})}));
      }
    } else {
      r.appendChild(emptyBox(L({en:'No promo indexed — open the official video page.',ja:'予告編未収録。公式動画ページへ。'}),'🎞️'));
    }
    // episodes
    const epsWrap=h('div');
    r.appendChild(h('div.panel',h('div.panel-title',L({en:'Episode listing',ja:'エピソード一覧'})),epsWrap));
    await renderEps(epsWrap,a,1,(p)=>renderEps(epsWrap,a,p));
  });
  async function renderEps(box,a,page,go){
    withBusy(box,async r=>{
      const j=await japi('/anime/'+a.mal_id+'/episodes',{page});
      const eps=(j.data||[]).filter(Boolean);
      clear(r);
      if(!eps.length){ r.appendChild(emptyBox(L({en:'No episode data.',ja:'話数データなし。'}),'🎬')); return; }
      eps.forEach(e=>r.appendChild(h('div.track',
        h('div',h('div.t','EP '+(e.episode||'?')+' — '+(e.title||L({en:'Untitled',ja:'無題'}))),
          h('div.a',{html:esc(e.aired||'')+(e.filler?' · '+labelHTML('🟡 '+L({en:'Filler',ja:'フリー'})):'')+(e.recap?' · '+labelHTML('🔁 recap'):'')}),
          e.title_japanese?h('div.a',e.title_japanese):null),
        h('a.btn.small.gold',{style:'margin-left:auto',href:'https://myanimelist.net/anime/'+a.mal_id+'/episode/'+(e.mal_id||e.episode),target:'_blank',rel:'noopener'},'MAL'))));
      const pg=pager(j.pagination,np=>go(np)); if(pg) r.appendChild(pg);
      r.appendChild(h('div.row',{style:'margin-top:8px'},
        btn('📺 '+L({en:'Where to watch legally',ja:'正規視聴先'}),'primary',()=>openTool('watch',{q:a.title,id:a.mal_id})),
        btn('💬 '+L({en:'Sub episode feed',ja:'字幕フィード'}),'',()=>openTool('sub'))));
    });
  }
  m.appendChild(panel(L({en:'Trailers & episodes',ja:'予告編と話数'}),
    searchBox({initial:preset.q||'',placeholder:L({en:'Anime title…',ja:'アニメ名…'}),onPick:show})));
  m.appendChild(out);
};

/* ============================================================
   59 — FULL SONG LISTENER
   ============================================================ */
TOOLS_IMPL['songs']=(m)=>{
  const qIn=inp({placeholder:L({en:'Any song, artist, anime…',ja:'曲名・歌手・アニメ…'}),autocomplete:'off'});
  const list=h('div');
  const paint=()=>{
    const q=norm(qIn.value);
    clear(list);
    const hits=q?SONGS.filter(s=>norm(s.t+' '+s.a+' '+s.an).includes(q)):[...SONGS].sort(()=>Math.random()-.5).slice(0,14);
    if(!hits.length){ list.appendChild(emptyBox(L({en:'Nothing in the index — use the official search below.',ja:'索引になし。下の公式検索をどうぞ。'}),'🎶')); return; }
    hits.forEach(s=>list.appendChild(h('div.track',
      btnI('▶',L({en:'Play in tool',ja:'ツール内で再生'}),'',()=>playSong(s,list,hits)),
      h('div.grow',h('div.t',s.t),h('div.a',s.a+' · '+s.an)),
      h('span.badge.'+(s.tag==='op'?'red':s.tag==='ed'?'green':'gold'),{html:s.tag.toUpperCase()}),
      h('div.row.tight',
        h('a.btn.small',{href:spLink(s),target:'_blank',rel:'noopener'},'Spotify'),
        h('a.btn.small',{href:amLink(s),target:'_blank',rel:'noopener'},'Apple'),
        btnI('📋','','small',()=>copyText(s.t+' — '+s.a))))));
    list.appendChild(h('p.hint',{html:L({en:'▶ plays inside this tool when an official stream exists — otherwise pick a service below (official search results, never pirated audio).',ja:'▶は公式ストリームがあればツール内で再生。無ければ各サービスを選択（公式検索結果のみ・違法音源なし）。'})}));
  };
  qIn.addEventListener('input',paint);
  const anyIn=inp({placeholder:L({en:'Song not in the index? Search anywhere…',ja:'索引外の曲はどこかで探す…'}),autocomplete:'off'});
  m.appendChild(panel(L({en:'Full song listener',ja:'フル楽曲リスナー'}),
    h('div.row',qIn),
    h('div.row',{style:'margin-top:8px'},
      h('a.btn.primary',{href:'https://music.youtube.com/search?q=',id:'ytAny',target:'_blank',rel:'noopener',onclick:e=>{ e.preventDefault(); window.open('https://music.youtube.com/search?q='+encodeURIComponent(anyIn.value||'anime songs'),'_blank','noopener'); },html:ico('play')+' '+L({en:'YouTube Music',ja:'YTミュージック'})}),
      h('a.btn',{href:'#',onclick:e=>{ e.preventDefault(); window.open('https://open.spotify.com/search/'+encodeURIComponent(anyIn.value||'anime songs'),'_blank','noopener'); }},'Spotify'),
      h('a.btn',{href:'#',onclick:e=>{ e.preventDefault(); window.open('https://music.apple.com/us/search?term='+encodeURIComponent(anyIn.value||'anime songs'),'_blank','noopener'); }},'Apple Music'),
      anyIn),
    h('div.row',{style:'margin-top:8px'},
      h('span.hint',L({en:'More anime-music sites:',ja:'他のアニメ音楽サイト:'})),
      h('a.btn.small',{href:'https://www.animemusic.me/',target:'_blank',rel:'noopener'},'AnimeMusic.me'),
      h('a.btn.small',{href:'https://animemusic.us/',target:'_blank',rel:'noopener'},'AnimeMusic.us'),
      h('a.btn.small',{href:'https://animusic.moe/',target:'_blank',rel:'noopener'},'Animusic.moe')),
    h('div',{style:'margin-top:10px'},list)));
  paint();
};

/* ============================================================
   60 — MANGA READER (official)
   ============================================================ */
TOOLS_IMPL['manga-reader']=(m)=>{
  const out=h('div');
  const show=async(a)=>{
    await withBusy(out,async r=>{
      const [full,ext]=await Promise.all([
        japi('/manga/'+a.mal_id+'/full'),
        japi('/manga/'+a.mal_id+'/external').catch(()=>({data:[]}))
      ]);
      const d=full.data||{};
      clear(r);
      r.appendChild(h('div.panel',
        h('div.panel-title',{html:ico('bookOpen')+' '+esc(d.title||a.title)}),
        h('div.dl',
          h('div',h('dt',L({en:'Chapters',ja:'全話数'})),h('dd',d.chapters||'—')),
          h('div',h('dt',L({en:'Volumes',ja:'巻数'})),h('dd',d.volumes||'—')),
          h('div',h('dt',L({en:'Status',ja:'状態'})),h('dd',d.status||'—')),
          h('div',h('dt',L({en:'Score',ja:'スコア'})),h('dd','★ '+(d.score||'—'))))));
      const links=(ext.data||[]).filter(Boolean);
      const official=links.filter(e=>/viz|mangaplus|shueisha|kodansha|yenpress|viz\.com|comikey|azuki|kodomocomi|bookwalker|webtoons|tapas/i.test((e.name||'')+(e.url||'')));
      r.appendChild(h('div.panel',h('div.panel-title',L({en:'Official readers',ja:'公式リーダー'}))));
      if(!official.length&&!links.length){
        r.appendChild(emptyBox(L({en:'No official reader link indexed — search the publisher site.',ja:'公式リーダー未登録。出版社サイトで検索を。'}),'📕'));
      } else {
        (official.length?official:links).slice(0,10).forEach(e=>r.appendChild(h('div.track',
          h('div',h('div.t',e.name||e.url),h('div.a',e.url?String(e.url).replace(/^https?:\/\//,'').split('/')[0]:'')),
          h('a.btn.small.gold',{style:'margin-left:auto',href:e.url,target:'_blank',rel:'noopener'},L({en:'Read official',ja:'公式で読む'})))));
        if(!official.length) r.appendChild(h('p.hint',L({en:'Publisher links only — no aggregator or pirate sites.',ja:'出版社リンクのみ。アグレゲーター・海賊版サイトは扱いません。'})));
      }
      const genres=h('div.chipset',...(d.genres||[]).map(g=>h('span.tchip.on',g.name)));
      r.appendChild(h('div.panel',h('div.panel-title',L({en:'Reading plan',ja:'読書計画'})),genres,
        h('div.row',{style:'margin-top:10px'},
          btn('🗓️ '+L({en:'Plan it',ja:'計画する'}),'primary',()=>openTool('manga-plan')),
          btn('📈 '+L({en:'Track reading',ja:'読書トラック'}),'',()=>openTool('manga-tracker')),
          btn('🧮 '+L({en:'Time to finish',ja:'読了時間計算'}),'',()=>openTool('manga-calc')))));
    });
  };
  m.appendChild(panel(L({en:'Find a manga',ja:'漫画を探す'}),searchBox({kind:'manga',placeholder:L({en:'Manga title…',ja:'漫画タイトル…'}),onPick:show})));
  m.appendChild(out);
};

/* ============================================================
   61 — FREE STREAMING (curated link directory + ToS gate)
   ============================================================ */
TOOLS_IMPL['free-streaming']=(m,preset={},ctx={})=>{
  const root=h('div');
  const tos=()=>h('div.panel',
    h('div.panel-title',{html:ico('shield')+' '+esc(L(S.fsTosTitle))}),
    h('ul.fs-tos',
      h('li',{html:esc(L(S.fsTosA))}),
      h('li',{html:esc(L(S.fsTosB))}),
      h('li',{html:esc(L(S.fsTosC))}),
      h('li',{html:esc(L(S.fsTosD))}),
      h('li',{html:esc(L(S.fsTosE))})),
    h('div.row',{style:'margin-top:12px;gap:8px;flex-wrap:wrap'},
      h('button.btn.primary.gold',{type:'button',html:ico('shield')+' '+esc(L(S.fsAgree)),onclick:showLinks}),
      h('button.btn',{type:'button',html:ico('x')+' '+esc(L(S.fsCancel)),onclick:()=>{ if(ctx&&ctx.close) ctx.close(); }})));
  const paintLinks=(box,g)=>{
    clear(box);
    const list=h('div.results');
    g.links.forEach(l=>{
      const host=l.u.replace(/^https?:\/\//,'').split(/[\/?#]/)[0];
      list.appendChild(h('article.acard',
        h('div.ac-body',
          h('div.ac-title',l.n,l.x?h('span.badge.blue',{style:'margin-left:8px'},L(S.fsExt)):null),
          h('div.ac-snip',{html:esc(host)}),
          h('div.ac-actions',
            h('a.btn.small.primary',{href:l.u,target:'_blank',rel:'noopener',html:ico('globe')+' '+esc(L(S.fsOpen))}),
            h('button.btn.small',{type:'button',html:ico('copy')+' '+esc(L(S.fsCopy)),onclick:()=>copyText(l.u)})))));
    });
    box.appendChild(list);
  };
  const showLinks=()=>{
    clear(root);
    root.appendChild(h('div.panel',
      h('div.panel-title',{html:ico('globe')+' '+esc(L(S.fsDir))}),
      h('p.hint',{html:esc(L(S.fsNote))})));
    const box=h('div');
    const bar=h('div.chipset');
    FREE_LINKS.forEach((g,i)=>{
      const c=h('button.tchip'+(i===0?'.on':''),{type:'button',html:ico(g.ico)+' '+esc(L({en:g.en,ja:g.ja})),
        onclick:()=>{ [...bar.children].forEach(x=>x.classList.remove('on')); c.classList.add('on'); paintLinks(box,g); }});
      bar.appendChild(c);
    });
    root.appendChild(bar);
    root.appendChild(box);
    root.appendChild(h('div.row',{style:'margin-top:12px'},
      h('button.btn.small',{type:'button',html:ico('shield')+' '+esc(L(S.fsTosTitle)),
        onclick:()=>{ clear(root); root.appendChild(tos()); }})));
    paintLinks(box,FREE_LINKS[0]);
  };
  root.appendChild(tos());
  m.appendChild(root);
};

/* ============================================================
   62 — INTRO & OUTRO WATCHER (AnimeThemes database)
   ============================================================ */
const AZ_AT={};
TOOLS_IMPL['intro-outro']=(m,preset={})=>{
  const out=h('div');
  m.appendChild(panel(L({en:'Every opening & ending',ja:'OP・EDをぜんぶ観る'}),
    h('p.hint',{html:L({en:'Powered by AnimeThemes — song titles, artists, episode ranges and the actual intro/outro videos.',ja:'AnimeThemes powered — 曲名・アーティスト・話数・OP/ED映像まで。'})}),
    searchBox({initial:preset.q||'',placeholder:L({en:'Anime title…',ja:'アニメ名…'}),onPick:a=>load(a)})));
  m.appendChild(out);
  const azF=async(url,opts)=>{ const r=await fetch(url,opts); if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); };
  const nrm=s=>(s||'').toLowerCase().replace(/[^a-z0-9]+/g,'');
  async function findSlug(title){
    if(title in AZ_AT) return AZ_AT[title];
    const j=await azF('https://api.animethemes.moe/anime?q='+encodeURIComponent(title)+'&include=animethemes,animethemes.song');
    const rows=(j.anime||[]).filter(Boolean);
    const want=nrm(title);
    const hit=rows.find(x=>nrm(x.name)===want)||rows.find(x=>{ const n=nrm(x.name); return n.startsWith(want)||want.startsWith(n); })||null;
    AZ_AT[title]=hit?hit.slug:null;
    return AZ_AT[title];
  }
  async function load(a){
    await withBusy(out,async r=>{
      clear(r);
      let data=null, slug=null;
      try{ slug=await findSlug(a.title); }catch(e){}
      if(slug){
        try{
          const q='{anime(slug: "'+slug+'"){title{romaji english} format siteUrl animethemes{ type sequence slug song{ title{romaji} performances{ as artist{ name{main} } } } animethemeentries{ episodes videos{ nodes{ link uncen } } } } }}';
          const g=await azF('https://graphql.animethemes.moe/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:q})});
          if(g.data&&g.data.anime) data=g.data.anime;
        }catch(e){}
      }
      clear(r);
      if(!data||!data.animethemes||!data.animethemes.length){
        let th=null;
        try{ const f=await japi('/anime/'+a.mal_id+'/full'); th=(f.data&&f.data.themes)||null; }catch(e){}
        if(th&&((th.openings||[]).length||(th.endings||[]).length)){
          r.appendChild(h('p.hint',{html:esc(L({en:'Not in AnimeThemes — showing MyAnimeList theme names. Watch opens a video search.',ja:'AnimeThemesに未収録 — MALのテーマ名を表示。視聴は動画検索を開きます。'}))}));
          const mk=(s,type)=>h('div.track',
            btnI('▶',L({en:'Search video',ja:'動画を探す'}),'primary',()=>window.open('https://www.youtube.com/results?search_query='+encodeURIComponent(a.title+' '+s),'_blank','noopener')),
            h('div.grow',h('div.t',s)),h('span.badge.'+(type==='OP'?'red':'green'),{style:'margin-left:auto',html:type}));
          (th.openings||[]).forEach(s=>r.appendChild(mk(s,'OP')));
          (th.endings||[]).forEach(s=>r.appendChild(mk(s,'ED')));
        } else {
          r.appendChild(emptyBox(L({en:'No theme data found — try the romaji title.',ja:'テーマ情報なし。ローマ字名で再検索ください。'}),'🎼'));
        }
        return;
      }
      const name=data.title.romaji||data.title.english||a.title;
      r.appendChild(h('div.panel-title',name+(data.format?' · '+data.format:'')));
      const player=h('video.at-player',{controls:true,preload:'none',playsinline:true});
      const cap=h('p.hint');
      let cur=null;
      const vitems=[];
      const playV=(url,label)=>{
        if(cur===url&&!player.paused){ player.pause(); return; }
        cur=url; player.src=url;
        const pr=player.play(); if(pr&&pr.catch) pr.catch(()=>{});
        cap.innerHTML=esc(label)+' · '+esc(L({en:'video via AnimeThemes — © their respective owners',ja:'映像提供: AnimeThemes — © 各権利者'}));
        if(typeof MDK!=='undefined') MDK.attachVideo({el:player,title:label,sub:name,items:vitems,idx:MDK.vidx,play:vgo});
      };
      const vgo=i=>{
        const it=vitems[i]; if(!it) return;
        if(typeof MDK!=='undefined') MDK.vidx=i;
        playV(it.url,it.label);
        if(typeof MDK!=='undefined') MDK.setVideoInfo(it.label,name);
      };
      r.appendChild(h('div',{style:'margin-top:8px'},player,cap));
      const ops=[],eds=[];
      data.animethemes.forEach(t=>((t.type==='OP'?ops:eds).push(t)));
      const mkRow=t=>{
        const song=(t.song&&t.song.title&&t.song.title.romaji)||t.slug||'';
        const arts=((t.song&&t.song.performances)||[]).map(p=>(p.artist&&p.artist.name&&p.artist.name.main)||(p.as||'')).filter(Boolean).join(', ');
        const eps=((t.animethemeentries||[]).map(e=>e.episodes).filter(Boolean).join(' / '))||'';
        const type=((t.type||'')+(t.sequence?' '+t.sequence:'')).trim();
        const vids=[];
        (t.animethemeentries||[]).forEach(e=>((e.videos&&e.videos.nodes)||[]).forEach(v=>{ if(v.link) vids.push(v); }));
        const vid=vids.find(v=>!v.uncen)||vids[0]||null;
        let vidx=-1;
        if(vid) vidx=vitems.push({url:vid.link,label:song+' · '+type})-1;
        return h('div.track',
          vid?btnI('▶',L({en:'Play here',ja:'この場で再生'}),'primary',()=>vgo(vidx)):null,
          h('div.grow',h('div.t',song),h('div.a',(arts?arts+' · ':'')+(eps?type+' · '+eps:type))),
          h('div.row.tight',
            h('a.btn.small',{href:'https://animethemes.moe/anime/'+slug,target:'_blank',rel:'noopener'},'AnimeThemes'),
            h('a.btn.small',{href:'https://www.youtube.com/results?search_query='+encodeURIComponent(name+' '+song+' '+type),target:'_blank',rel:'noopener'},'YouTube')));
      };
      if(ops.length){ r.appendChild(h('div.panel-title',{style:'margin-top:10px'},L({en:'Openings',ja:'オープニング（OP）'}))); ops.forEach(t=>r.appendChild(mkRow(t))); }
      if(eds.length){ r.appendChild(h('div.panel-title',{style:'margin-top:10px'},L({en:'Endings',ja:'エンディング（ED）'}))); eds.forEach(t=>r.appendChild(mkRow(t))); }
    });
  }
};

/* ============================================================
   63 — J-POP & K-POP RADIO (listen.moe live streams)
   ============================================================ */
const AZ_RADIO={audio:null,es:null,station:null,meta:null};
TOOLS_IMPL['radio']=(m)=>{
  const ST={
    jpop:{url:'https://listen.moe/stream',fb:'https://listen.moe/fallback',mount:'/stream'},
    kpop:{url:'https://listen.moe/kpop/stream',fb:'https://listen.moe/kpop/fallback',mount:'/kpop/stream'}
  };
  const nowT=h('div.t','…'), nowA=h('div.a','');
  const stBtn={};
  const playBtn=btn('▶ '+L({en:'Play',ja:'再生'}),'primary',()=>toggle());
  const stopBtn=btn('■ '+L({en:'Stop',ja:'停止'}),'',()=>stop());
  const vol=inp({type:'range',min:'0',max:'1',step:'0.05'});
  function audio(){
    if(!AZ_RADIO.audio){ const el=new Audio(); el.preload='none'; el.volume=(typeof MDK!=='undefined'?MDK.vol:.7); AZ_RADIO.audio=el; }
    return AZ_RADIO.audio;
  }
  function setSong(song){
    const title=(song&&(song.titleRomaji||song.title))||'…';
    const arts=((song&&song.artists)||[]).map(a=>a.nameRomaji||a.name).filter(Boolean).join(', ');
    AZ_RADIO.meta={t:title,a:(arts?arts+' · ':'')+'listen.moe'};
    nowT.textContent=AZ_RADIO.meta.t; nowA.textContent=AZ_RADIO.meta.a;
    if(typeof MDK!=='undefined') MDK.setInfo(AZ_RADIO.meta.t,AZ_RADIO.meta.a);
  }
  /* live now-playing via listen.moe's gateway (current song on connect) */
  function ensureNow(){
    const gw=AZ_RADIO.station==='kpop'?'wss://listen.moe/kpop/gateway_v2':'wss://listen.moe/gateway_v2';
    if(AZ_RADIO.gw&&AZ_RADIO.gwUrl===gw&&AZ_RADIO.gw.readyState<=1) return;
    try{ if(AZ_RADIO.gw) AZ_RADIO.gw.close(); }catch(e){}
    if(AZ_RADIO.hb){ clearInterval(AZ_RADIO.hb); AZ_RADIO.hb=null; }
    try{
      const ws=new WebSocket(gw);
      AZ_RADIO.gw=ws; AZ_RADIO.gwUrl=gw;
      ws.onopen=()=>{ AZ_RADIO.hb=setInterval(()=>{ try{ if(ws.readyState===1) ws.send(JSON.stringify({op:1})); }catch(e){} },30000); };
      ws.onmessage=e=>{
        try{
          const j=JSON.parse(e.data);
          if(j.op===1&&j.d&&j.d.song) setSong(j.d.song);
        }catch(err){}
      };
    }catch(e){}
  }
  function syncUI(){
    Object.keys(stBtn).forEach(k=>stBtn[k].classList.toggle('on',k===AZ_RADIO.station));
    const playing=AZ_RADIO.audio&&!AZ_RADIO.audio.paused;
    playBtn.innerHTML=labelHTML(playing?'⏸ '+L({en:'Pause',ja:'一時停止'}):'▶ '+L({en:'Play',ja:'再生'}));
  }
  async function play(st){
    const prevSt=AZ_RADIO.station;
    if(prevSt&&prevSt!==st){ AZ_RADIO.meta=null; nowT.textContent='…'; nowA.textContent=(st==='kpop'?'K-POP':'J-POP')+' · listen.moe'; }
    AZ_RADIO.station=st;
    const s=ST[st], el=audio();
    let failed=false;
    el.onerror=()=>{ if(!failed){ failed=true; el.src=s.fb; const pr=el.play(); if(pr&&pr.catch) pr.catch(()=>{}); } };
    if(el.dataset.station!==st){ el.dataset.station=st; failed=false; el.src=s.url; }
    try{ await el.play(); }catch(e){}
    ensureNow();
    syncUI();
    if(typeof MDK!=='undefined') MDK.attachRadio();
  }
  function toggle(){
    const el=audio();
    if(el.paused) play(AZ_RADIO.station||'jpop');
    else{ el.pause(); syncUI(); if(typeof MDK!=='undefined') MDK.sync(); }
  }
  function stop(){
    const el=AZ_RADIO.audio;
    if(el){ el.pause(); el.removeAttribute('src'); el.dataset.station=''; try{ el.load(); }catch(e){} }
    try{ if(AZ_RADIO.gw) AZ_RADIO.gw.close(); AZ_RADIO.gw=null; }catch(e){}
    if(AZ_RADIO.hb){ clearInterval(AZ_RADIO.hb); AZ_RADIO.hb=null; }
    syncUI();
    if(typeof MDK!=='undefined') MDK.detach('radio');
  }
  vol.addEventListener('input',()=>{ if(typeof MDK!=='undefined') MDK.setVol(parseFloat(vol.value)); else audio().volume=parseFloat(vol.value); });
  vol.value=(AZ_RADIO.audio?AZ_RADIO.audio.volume:(typeof MDK!=='undefined'?MDK.vol:.7));
  const stRow=h('div.row');
  [['jpop','J-POP'],['kpop','K-POP']].forEach(([k,label])=>{
    stBtn[k]=h('button.btn'+(k==='jpop'?'.primary':''),{type:'button',onclick:()=>play(k)},label);
    stRow.appendChild(stBtn[k]);
  });
  if(AZ_RADIO.meta){ nowT.textContent=AZ_RADIO.meta.t; nowA.textContent=AZ_RADIO.meta.a; }
  m.appendChild(panel(L({en:'Anime radio — live',ja:'アニメラジオ（ライブ）'}),
    h('p.hint',{html:L({en:'Two live streams from listen.moe with real-time now-playing. Playback keeps going while you use other tools.',ja:'listen.moeの2つのライブストリームと再生中曲情報。他のツールでも再生は続きます。'})}),
    stRow,
    h('div.rd-now',h('span.rd-dot'),h('div',nowT,nowA)),
    h('div.row',playBtn,stopBtn,h('span.hint',L({en:'VOL',ja:'音量'})),vol),
    h('p.hint',{html:L({en:'Streams and now-playing data are provided by listen.moe — please support them.',ja:'ストリームと再生中情報の提供: listen.moe — 応援をお願いします。'})+' <a href="https://listen.moe" target="_blank" rel="noopener">listen.moe</a>'})));
  AZ_RADIO.toggle=toggle; AZ_RADIO.stop=stop; AZ_RADIO.switchTo=play; AZ_RADIO.ui=syncUI; AZ_RADIO.volIn=vol;
  if(AZ_RADIO.audio&&!AZ_RADIO.audio.paused&&typeof MDK!=='undefined') MDK.attachRadio();
  syncUI();
};

/* ============================================================
   64 — SEQUEL CATCHER (public AniList lists, inspired by due.moe)
   ============================================================ */
TOOLS_IMPL['sequel-catcher']=(m)=>{
  const out=h('div');
  const uIn=inp({placeholder:L({en:'AniList username…',ja:'AniListユーザー名…'}),autocomplete:'off'});
  const go=()=>withBusy(out,async r=>{
    clear(r);
    const name=uIn.value.trim();
    if(!name){ r.appendChild(emptyBox(L({en:'Enter an AniList username first.',ja:'AniListユーザー名を入力してください。'}),'📝')); return; }
    const gql=async(q,v)=>{
      const res=await fetch('https://graphql.anilist.co',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:q,variables:v||{}})});
      const j=await res.json();
      if(j.errors) throw new Error(j.errors[0].message);
      return j.data;
    };
    const u=await gql('query($n:String){User(name:$n){id name}}',{n:name});
    clear(r);
    if(!u||!u.User){ r.appendChild(emptyBox(L({en:'No such AniList user.',ja:'そのAniListユーザーは存在しません。'}),'❌')); return; }
    const uid=u.User.id;
    const status={}, completed=[];
    let page=1, more=true;
    while(more&&page<=15){
      const d=await gql('query($id:Int,$p:Int){Page(page:$p,perPage:50){pageInfo{hasNextPage} mediaList(userId:$id,type:ANIME){status mediaId media{id format status episodes title{romaji english} relations{edges{relationType node{id format status episodes title{romaji english}}}}}}}}',{id:uid,p:page});
      const items=(d.Page&&d.Page.mediaList)||[];
      items.forEach(e=>{
        status[e.mediaId]=e.status;
        if(e.status==='COMPLETED'&&e.media) completed.push(e.media);
      });
      more=!!(d.Page&&d.Page.pageInfo&&d.Page.pageInfo.hasNextPage&&items.length);
      page++;
    }
    clear(r);
    if(!completed.length){ r.appendChild(emptyBox(L({en:'That user has no completed anime yet.',ja:'そのユーザーには視聴完了作品がまだありません。'}),'📭')); return; }
    const seen={}, finds=[];
    completed.forEach(media=>{
      ((media.relations&&media.relations.edges)||[]).forEach(ed=>{
        const n=ed&&ed.node;
        if(ed.relationType!=='SEQUEL'||!n||!n.id) return;
        if(n.format==='NOVEL'||n.format==='LIGHT_NOVEL'||n.format==='MUSIC') return;
        if(status[n.id]) return;
        if(seen[n.id]) return;
        seen[n.id]=1;
        finds.push({from:media,to:n});
      });
    });
    r.appendChild(h('div.panel-title',u.User.name+' — '+finds.length+' '+L({en:'unwatched sequel(s)',ja:'件の未視聴続編'})));
    if(!finds.length){ r.appendChild(emptyBox(L({en:'Nothing missed — every sequel is already on one of their lists.',ja:'見逃しなし。全ての続編が既にリストにあります。'}),'✨')); return; }
    finds.slice(0,60).forEach(f=>r.appendChild(h('div.track',
      h('div.grow',
        h('div.t',f.to.title.romaji||f.to.title.english||'?'),
        h('div.a',L({en:'sequel of',ja:'続編:'})+' '+(f.from.title.romaji||f.from.title.english||'?')+(f.to.episodes?' · '+f.to.episodes+'ep':''))),
      h('div.row.tight',
        f.to.status==='RELEASING'?h('span.badge.gold',L({en:'AIRING',ja:'放送中'})):null,
        h('a.btn.small.primary',{href:'https://anilist.co/anime/'+f.to.id,target:'_blank',rel:'noopener'},'AniList')))));
    r.appendChild(h('p.hint',{html:L({en:'Inspired by due.moe Sequel Catcher — powered by public AniList lists.',ja:'due.moeのSequel Catcherに着想。AniList公開リスト使用。'})+' <a href="https://due.moe/tools" target="_blank" rel="noopener">due.moe</a>'}));
  });
  m.appendChild(panel(L({en:'Which sequels did they miss?',ja:'どの続編を見逃した？'}),
    h('p.hint',{html:L({en:'Enter any public AniList username — we scan their completed anime for sequels missing from all of their lists.',ja:'公開AniListユーザー名を入力 — 視聴済み作品の続編で、どのリストにも無いものを検出します。'})}),
    h('div.row',uIn,btn('🔎 '+L({en:'Catch',ja:'調べる'}),'gold',go))));
  m.appendChild(out);
};

/* ============================================================
   65–68 — HIDDEN GEMS & BINGE WORTHY
   Multi-source discovery feeds. Each tool walks its chain —
   AniList → Jikan → MangaDex → Kitsu — and the first free,
   keyless source that answers serves the cards, so the tool
   keeps working even when a whole API is blocked or down.
   ============================================================ */
async function alDiscover(kind,filter,sort,page,perPage=24){
  const q='query($t:MediaType,$p:Int,$pp:Int){Page(page:$p,perPage:$pp){pageInfo{currentPage hasNextPage lastPage total perPage}media(type:$t,isAdult:false,'+filter+',sort:'+sort+'){'+AL_MEDIA+'}}}';
  const j=await alGql(q,{t:alType(kind),p:page,pp:perPage});
  const data=(((j.data&&j.data.Page&&j.data.Page.media)||[]).map(x=>alToJikan(x,kind)).filter(x=>x&&x.title));
  return {data,pagination:alPageInfo((j.data&&j.data.Page&&j.data.Page.pageInfo)||{hasNextPage:false})};
}
/* --- Jikan browse shapes — the same ideas expressed in MAL terms --- */
async function jDiscover(kind,gems,page){
  const path=kind==='manga'?'/manga':'/anime';
  /* gems: least popular with a strong score · binge: longest well-scored runs */
  const p=gems?{order_by:'members',sort:'asc',min_score:8}
              :(kind==='manga'?{order_by:'chapters',sort:'desc',min_score:7.5}
                              :{order_by:'episodes',sort:'desc',min_score:7.5});
  const url=JIKAN+path+'?'+new URLSearchParams(Object.assign({sfw:'true',limit:24,page:page||1},p));
  const r=await xfetch(url,{cache:'no-store'},8000);
  if(!r.ok) throw new Error('Jikan '+r.status);
  const j=await r.json(); lastSource='jikan';
  return {data:(j.data||[]).filter(Boolean),pagination:j.pagination||null};
}
/* --- MangaDex browse (manga) — deep cuts vs. the most-followed epics --- */
async function mdDiscover(gems,page){
  const per=24, off=((page||1)-1)*per;
  const url=MDX+'/manga?limit='+per+'&offset='+off+'&order[followedCount]='+(gems?'asc':'desc')
    +'&contentRating[]=safe&hasAvailableChapters=true&availableTranslatedLanguage[]=en&includes[]=cover_art';
  const r=await xfetch(url,{headers:{Accept:'application/json'}},8000);
  if(!r.ok) throw new Error('MangaDex '+r.status);
  const j=await r.json(); lastSource='mangadex';
  const data=(j.data||[]).map(mdxToJikan).filter(Boolean);
  const total=j.total||data.length, last=Math.max(1,Math.ceil(total/per));
  return {data,pagination:{current_page:page||1,last_visible_page:last,has_next_page:off+data.length<total,items:{count:data.length,total,per_page:per}}};
}
/* --- Kitsu browse (final safety net) — finished top-rated / top-rated TV --- */
async function kDiscover(kind,gems,page){
  const PER=20;  /* Kitsu's hard page-limit cap */
  const edge=kind==='manga'?'/manga':'/anime';
  const q=new URLSearchParams();
  if(gems) q.set('filter[status]','finished');
  else if(kind==='anime') q.set('filter[subtype]','TV');
  q.set('sort','-averageRating'); q.set('page[limit]',String(PER)); q.set('page[offset]',String(((page||1)-1)*PER));
  const r=await xfetch(KITSU+edge+'?'+q,{headers:{'Accept':'application/vnd.api+json'}},8000);
  if(!r.ok) throw new Error('Kitsu '+r.status);
  const j=await r.json(); lastSource='kitsu';
  const data=(j.data||[]).map(kitsuToJikan).filter(x=>x&&x.title&&x.score!=null); /* unrated fresh entries are noise */
  const total=(j.meta&&j.meta.count)||data.length, last=Math.max(1,Math.ceil(total/PER));
  return {data,pagination:{current_page:page||1,last_visible_page:last,has_next_page:(page||1)<last,items:{count:data.length,total,per_page:PER}}};
}
const SRC_NAME={anilist:'AniList',jikan:'Jikan (MyAnimeList)',mangadex:'MangaDex',kitsu:'Kitsu',scrape:'Scrape API'};
function discoverTool(m,cfg){
  const out=h('div');
  let page=1,hasNext=false,items=[],src='';
  const render=()=>{
    clear(out);
    if(!items.length){ out.appendChild(emptyBox(L(cfg.empty),'💎')); return; }
    const g=h('div.results');
    items.forEach(x=>g.appendChild(mediaCard(x,{kind:cfg.kind,snip:true})));
    out.appendChild(g);
    if(hasNext) out.appendChild(h('div.row',{style:'margin-top:12px;justify-content:center'},
      btn('… '+L({en:'Load more',ja:'さらに表示'}),'gold',()=>{ page++; go(false); })));
    out.appendChild(h('p.hint',L({en:'Source',ja:'出典'})+': <b>'+(SRC_NAME[src]||src||'—')+'</b> · '+L(cfg.foot)));
  };
  const go=(reset)=>withBusy(out,async r=>{
    if(reset){ page=1; items=[]; hasNext=false; src=''; }
    const res=await firstOf(cfg.sources.map(fn=>()=>fn(page)));
    if(!res||!res.data) throw new Error(L(S.offline));
    src=lastSource;
    items=(reset?[]:items).concat(res.data);
    hasNext=!!(res.pagination&&res.pagination.has_next_page);
    render();
  });
  m.appendChild(panel(L(cfg.title),h('p.hint',L(cfg.hint))));
  m.appendChild(out);
  go(true);
}
TOOLS_IMPL['hidden-gems']=m=>discoverTool(m,{
  kind:'anime',
  title:{en:'Anime Hidden Gems',ja:'アニメの埋もれた名作'},
  hint:{en:'Highly scored anime with popularity kept low — the gems most lists never show.',ja:'スコア上位×低人気 — 多くのリストに載らない名作を発掘。'},
  sources:[
    p=>alDiscover('anime','popularity_lesser:250000,averageScore_greater:78','SCORE_DESC',p),
    p=>jDiscover('anime',true,p),
    p=>kDiscover('anime',true,p)
  ],
  empty:{en:'No gems on this page — close and reopen to reshuffle.',ja:'このページに作品がありません。'},
  foot:{en:'score order, popularity capped on purpose. Chains: AniList → Jikan → Kitsu.',ja:'スコア順、人気は意図的に低め。AniList → Jikan → Kitsu。'}
});
TOOLS_IMPL['manga-gems']=m=>discoverTool(m,{
  kind:'manga',
  title:{en:'Manga Hidden Gems',ja:'漫画の埋もれた名作'},
  hint:{en:'Brilliant manga with small followings — deep cuts ranked by score.',ja:'高評価なのに読者が少ない漫画 — ディープな名作。'},
  sources:[
    p=>alDiscover('manga','popularity_lesser:120000,averageScore_greater:78','SCORE_DESC',p),
    p=>mdDiscover(true,p),
    p=>jDiscover('manga',true,p),
    p=>kDiscover('manga',true,p)
  ],
  empty:{en:'No gems on this page — close and reopen to reshuffle.',ja:'このページに作品がありません。'},
  foot:{en:'every card shows chapters and score. Chains: AniList → MangaDex → Jikan → Kitsu.',ja:'各カードに話数とスコア。AniList → MangaDex → Jikan → Kitsu。'}
});
TOOLS_IMPL['binge-anime']=m=>discoverTool(m,{
  kind:'anime',
  title:{en:'Binge Worthy Anime',ja:'一気見せアニメ'},
  hint:{en:'Long, highly rated series built for weekend marathons — 24+ episodes, score 74+.',ja:'週末マラソン向け — 24話以上・スコア74以上の長編。'},
  sources:[
    p=>alDiscover('anime','episodes_greater:24,averageScore_greater:74','POPULARITY_DESC',p),
    p=>jDiscover('anime',false,p),
    p=>kDiscover('anime',false,p)
  ],
  empty:{en:'Nothing matched — close and reopen to reshuffle.',ja:'該当なし。'},
  foot:{en:'popular first — every pick rewards a long sit-down. Chains: AniList → Jikan → Kitsu.',ja:'人気順。長編を気ままに。AniList → Jikan → Kitsu。'}
});
TOOLS_IMPL['binge-manga']=m=>discoverTool(m,{
  kind:'manga',
  title:{en:'Binge Worthy Manga',ja:'一気見せ漫画'},
  hint:{en:'Big chapter counts and great scores — manga you can sink into for weeks.',ja:'話数が多くスコアも高い、数週間没頭できる長編。'},
  sources:[
    p=>alDiscover('manga','chapters_greater:60,averageScore_greater:74','POPULARITY_DESC',p),
    p=>mdDiscover(false,p),
    p=>jDiscover('manga',false,p),
    p=>kDiscover('manga',false,p)
  ],
  empty:{en:'Nothing matched — close and reopen to reshuffle.',ja:'該当なし。'},
  foot:{en:'60+ chapters, fan favourites first. Chains: AniList → MangaDex → Jikan → Kitsu.',ja:'60話以上、人気作品を優先。AniList → MangaDex → Jikan → Kitsu。'}
});

/* ============================================================
   69 — COMING SOON + SUGGESTION WALL
   ============================================================ */
TOOLS_IMPL['coming-soon']=m=>{
  const KEY='azt_ideas', UN='azt_uname';
  const load=()=>{ try{ const a=store.get(KEY,null); return Array.isArray(a)?a:[]; }catch(e){ return []; } };
  const save=a=>{ try{ store.set(KEY,a.slice(0,100)); }catch(e){} };
  const ago=ts=>{ const s=Math.max(0,(Date.now()-(+ts||0))/1000);
    if(s<60) return L({en:'just now',ja:'たった今'});
    if(s<3600) return L({en:Math.floor(s/60)+'m ago',ja:Math.floor(s/60)+'分前'});
    if(s<86400) return L({en:Math.floor(s/3600)+'h ago',ja:Math.floor(s/3600)+'時間前'});
    return L({en:Math.floor(s/86400)+'d ago',ja:Math.floor(s/86400)+'日前'}); };
  const initial=s=>(String(s||'').trim()||L({en:'?',ja:'匿'})).slice(0,1).toUpperCase();

  /* --- banner --- */
  m.appendChild(h('div.cs-hero',
    h('span.cs-hero-ico',{html:ico('lightbulb')}),
    h('div',
      h('div.cs-hero-t',L({en:'The workshop',ja:'開発中の工房'})),
      h('div.cs-hero-s',L({en:'New tools are on the bench — here is what is cooking next.',ja:'新しいツールを作業台で開発中 — 次に作る予定はこちら。'})))));

  /* --- roadmap --- */
  const PLAN=[
    {ic:'ear',   t:{en:'OST Finder — hum it, match the song',ja:'OSTファインダー — 哼唱で曲を特定'},
     d:{en:'Lyric & melody matching against public song databases.',ja:'公開ソングDBと歌詞・メロディを照合。'}},
    {ic:'layers',t:{en:'Watch Order Builder — drag-and-drop seasons',ja:'視聴順ビルダー — シーズンを並べ替え'},
     d:{en:'Lay out arcs and specials in order, then export your list.',ja:'本編やOVAを含む順序を作成して書き出し。'}},
    {ic:'brush', t:{en:'Manga Cover Maker — styled spines & titles',ja:'マンガカバーメーカー — 背表紙とタイトル'},
     d:{en:'Design covers for the series on your shelf.',ja:'棚の作品用カバーをデザイン。'}},
    {ic:'users', t:{en:'Voice Actor Explorer — roles across shows',ja:'声優エクスプローラー — 作品横断の役柄'},
     d:{en:'Browse characters by seiyuu, work and year.',ja:'声優・作品・年代からキャラを一覧。'}}
  ];
  const pl=h('div.results.cs-plan');
  PLAN.forEach(x=>pl.appendChild(h('article.acard.cs-card',
    h('div.cs-card-top',
      h('span.cs-chip',{html:ico(x.ic)}),
      h('span.badge.green',L({en:'planned',ja:'予定'}))),
    h('div.cs-card-t',L(x.t)),
    h('p.cs-card-d',L(x.d)))));
  m.appendChild(pl);

  /* --- suggestion wall --- */
  m.appendChild(h('div.panel-title',{style:'margin-top:20px',html:ico('message')+' '+esc(L({en:'Suggestion wall',ja:'提案掲示板'}))}));
  m.appendChild(h('p.hint',L({en:'What should I build next? Post it below or share it with the owner — ideas are saved in this browser on your device, nothing is uploaded.',ja:'次は何を作りましょう？下に投稿するか、オーナーと共有してください。アイデアはこの端末のブラウザに保存され、アップロードはされません。'})));
  const nm=h('input.inp',{type:'text',maxlength:'24',autocomplete:'off',placeholder:L({en:'Username (optional)',ja:'ユーザー名（任意）'}),'aria-label':'username'});
  try{ nm.value=String(store.get(UN,'')||''); }catch(e){}
  const tx=h('textarea.inp',{rows:'3',maxlength:'400',style:'min-height:82px;resize:vertical',
    placeholder:L({en:'Suggest a tool… e.g. “Anime Trivia Quiz with friends”',ja:'ツールを提案… 例：「友達と遊べるアニメクイズ」'}),'aria-label':'suggestion'});
  const cnt=h('span.cs-count','0 / 400');
  const av=h('span.cs-av',initial(nm.value));
  tx.addEventListener('input',()=>{ cnt.textContent=tx.value.length+' / 400'; });
  nm.addEventListener('input',()=>{ av.textContent=initial(nm.value); });
  const wall=h('div.cs-wall');
  const paint=()=>{
    clear(wall);
    const a=load();
    if(!a.length){ wall.appendChild(emptyBox(L({en:'No ideas yet — be the first!',ja:'まだアイデアがありません。最初の投稿を！'}),'lightbulb')); return; }
    a.forEach((x,i)=>{
      wall.appendChild(h('article.acard.idea',
        h('div.idea-head',
          h('span.idea-av',initial(x.n)),
          h('b.idea-nm',x.n||L({en:'Anonymous',ja:'匿名'})),
          h('span.idea-ago',ago(x.d)),
          h('button.iconbtn',{type:'button',title:L({en:'Delete',ja:'削除'}),html:ico('x'),
            onclick:()=>{ save(load().filter((_,j)=>j!==i)); paint(); }})),
        h('p.idea-tx',x.t)));
    });
    wall.appendChild(h('p.hint',L({en:'Newest first — stored only on this device.',ja:'新しい順 — この端末にのみ保存。'})));
  };
  const post=btn(L({en:'Post idea',ja:'投稿'}),'primary',()=>{
    const t=tx.value.trim(); if(!t) return;
    const name=nm.value.trim().slice(0,24);
    try{ store.set(UN,name); }catch(e){}   /* remember the username for next time */
    const a=load(); a.unshift({n:name,t:t.slice(0,400),d:Date.now()});
    save(a); tx.value=''; cnt.textContent='0 / 400'; paint();
  });
  const sendB=btn(L({en:'Send to owner',ja:'オーナーに送る'}),'gold',()=>{
    const a=load(); if(!a.length) return;
    const who=nm.value.trim();
    const head=L({en:'Anime Zaki Tools — suggestions'+(who?' from '+who:''),
                  ja:'Anime Zaki Tools — 提案'+(who?'（'+who+'）':'')});
    copyText(head+'\n\n'+a.map(x=>'- '+(x.n?x.n+': ':'')+x.t).join('\n')
      +'\n\n'+L({en:'(sent from the Coming Soon suggestion wall)',ja:'（近日公開ツールの提案掲示板から）'}));
  });
  m.appendChild(h('div.cs-composer',
    h('div.cs-comp-head',av,h('b',L({en:'Post an idea',ja:'アイデアを投稿'})),cnt),
    nm,tx,
    h('div.row',post,sendB)));
  m.appendChild(wall);
  paint();
};
