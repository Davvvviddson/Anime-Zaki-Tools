/* ============================================================
   ANIME ZAKI TOOLS — app.js (core)
   ============================================================ */
const $  = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
const sleep = ms=>new Promise(r=>setTimeout(r,ms));
const ri = (a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const pick = a=>a[Math.floor(Math.random()*a.length)];
const shuffle = a=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b};
const norm = s=>(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const esc = s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
window.TOOLS_IMPL = window.TOOLS_IMPL || {};

/* ---------------- storage (safe on file://) ---------------- */
const _mem = {};
const store = {
  get(k,d){ try{const v=localStorage.getItem(k); return v?JSON.parse(v):(k in _mem?_mem[k]:d)}catch(e){return k in _mem?_mem[k]:d} },
  set(k,v){ _mem[k]=v; try{localStorage.setItem(k,JSON.stringify(v))}catch(e){} }
};

/* ---------------- i18n ---------------- */
let LANG = store.get('azt_lang','en');
const L = o => typeof o==='string' ? o : (LANG==='ja' && o.ja ? o.ja : o.en);
const S = {
  searchPh:{en:'Search 68 tools…',ja:'68ツールを検索…'},
  heroSub:{en:'68 working anime & manga tools in one page — generators, finders, charts, music and manga utilities. Free, no key, no sign-up.',ja:'68の実用ツールを1ページに。生成・検索・ランキング・音楽・漫画ユーティリティ。無料・キー不要・登録不要。'},
  stFree:{en:'Free · keyless APIs',ja:'無料・キー不要API'},
  stSign:{en:'No sign-up',ja:'登録不要'},
  stLegal:{en:'Legal links only — no piracy',ja:'海賊版禁止・正規リンクのみ'},
  stOne:{en:'Single page',ja:'シングルページ'},
  randomTool:{en:'Random tool',ja:'ランダムツール'},
  openPalette:{en:'Command palette',ja:'コマンドパレット'},
  myWatchlist:{en:'My watchlist',ja:'マイ視聴リスト'},
  r1t:{en:'No piracy',ja:'海賊版禁止'},
  r1d:{en:'Every media link points to official / legal sources — MAL, Crunchyroll, Viz, MANGA Plus, YouTube official channels, Spotify search.',ja:'すべてのリンクは公式・正規配信先（MAL、Crunchyroll、Viz、MANGA Plus、公式YouTube、Spotify検索など）へ向かいます。'},
  r2t:{en:'Free & keyless',ja:'無料・キー不要'},
  r2d:{en:'Jikan (MyAnimeList) first, then automatic free fallbacks — AniList, MangaDex, your Manga Scraper API, Kitsu, nekos.life. A circuit breaker remembers unreachable hosts, so a dead API costs one fast probe, not a timeout on every click. Every source is keyless: no accounts, no tracking.',ja:'Jikan（MAL）を主軸に、AniList・MangaDex・指定の漫画スクレイパー・Kitsu・nekos.lifeへ自動切替。遮断器が応答不能ホストを記憶するため、停止中も待つのは初回のみ。全ソースがキー不要：アカウント・トラッキングなし。'},
  r3t:{en:'Verified tools',ja:'動作検証済み'},
  r3d:{en:'Each tool does exactly what its card says — open the Info card on any tool to see what it does and where its data comes from.',ja:'各ツールはカードの説明どおりに動作。Info を開くと機能とデータソースが確認できます。'},
  r4t:{en:'Alive & cool',ja:'エフェクト重視'},
  r4d:{en:'Falling sakura, paper cards, hanko seals, a ⌘K command palette, live search, category filters and a Connection Doctor.',ja:'桜の花びら、和紙カード、判子、⌘Kパレット、ライブ検索、カテゴリーフィルター、接続診断を搭載。'},
  apiTitle:{en:'The free APIs behind these tools',ja:'利用している無料API'},
  apiLead:{en:'Every tool runs on these public APIs — all free, all keyless, no sign-up and no tracking. Click a card to open each API\u2019s own page.',ja:'すべてのツールはこの公開APIで動作します。すべて無料・キー不要・登録不要・トラッキングなし。カードをクリックすると各APIのページが開きます。'},
  apiFoot:{en:'If a source is unreachable the Connection Doctor automatically switches to the fallback APIs — the site keeps working without any key or server of ours.',ja:'一部のソースに接続できない場合、接続診断が自動でフォールバックAPIに切り替えます。当サイト独自のキーやサーバーは一切ありません。'},
  footNote:{en:'Not affiliated with MyAnimeList / AniList / any studio. Music & video tools open official sources only.',ja:'MyAnimeList / AniList / 各スタジオとは無関係。音楽・映像ツールは公式ソースのみを開きます。'},
  loading:{en:'Summoning data…',ja:'データを召喚中…'},
  retry:{en:'Retry',ja:'再試行'},
  err:{en:'Something went wrong',ja:'エラーが発生しました'},
  noRes:{en:'No results',ja:'結果がありません'},
  noResD:{en:'Try another keyword.',ja:'別のキーワードでお試しください。'},
  open:{en:'Open',ja:'開く'},
  prev:{en:'Prev',ja:'前へ'},
  next:{en:'Next',ja:'次へ'},
  page:{en:'Page',ja:'ページ'},
  watch:{en:'Watch',ja:'視聴予定'},
  info:{en:'Info',ja:'情報'},
  source:{en:'Source',ja:'出典'},
  similar:{en:'Similar',ja:'類似'},
  add:{en:'Add',ja:'追加'},
  added:{en:'Added to watchlist',ja:'視聴リストに追加しました'},
  search:{en:'Search…',ja:'検索…'},
  offline:{en:'Could not reach the API. Check your connection — the Connection Doctor has details.',ja:'APIに接続できませんでした。接続診断で状況を確認してください。'},
  langChanged:{en:'Language switched — reopen the current tool to translate it.',ja:'言語を切り替えました。開いているツールを開き直すと翻訳されます。'},
  doctor:{en:'Connection Doctor',ja:'接続診断'},
  copied:{en:'Copied!',ja:'コピーしました！'},
  run:{en:'Run',ja:'実行'},
  clear:{en:'Clear',ja:'クリア'},
  save:{en:'Save',ja:'保存'},
  remove:{en:'Remove',ja:'削除'},
  download:{en:'Download PNG',ja:'PNG保存'},
  again:{en:'Again',ja:'もう一度'},
  legal:{en:'Opens official source',ja:'公式ソースを開きます'},
  fxLab:{en:'Effects',ja:'エフェクト'},
  wpLab:{en:'Wallpaper',ja:'壁紙'},
  fxTitle:{en:'Background effects',ja:'背景エフェクト'},
  eOff:{en:'Off',ja:'オフ'},
  eSakura:{en:'Sakura petals',ja:'桜の花びら'},
  eSnow:{en:'Snow',ja:'雪'},
  eFly:{en:'Fireflies',ja:'螢火'},
  eRain:{en:'Rain',ja:'雨'},
  eEmber:{en:'Embers',ja:'火の粉'},
  eStar:{en:'Starfield',ja:'星空'},
  eFire:{en:'Fireworks',ja:'花火'},
  eAura:{en:'Energy aura',ja:'オーラ'},
  eBubble:{en:'Bubbles',ja:'泡'},
  eZap:{en:'Electric surge',ja:'電撃'},
  eGalaxy:{en:'Galaxy',ja:'銀河'},
  eHole:{en:'Black hole',ja:'ブラックホール'},
  wpTitle:{en:'Wallpaper gallery',ja:'壁紙ギャラリー'},
  wpDim:{en:'Wallpaper visibility',ja:'壁紙の表示度'},
  wpBlur:{en:'Soft focus',ja:'ぼかし'},
  wpEyeOff:{en:'Wallpaper hidden',ja:'壁紙を非表示にしました'},
  wpEyeOn:{en:'Wallpaper shown',ja:'壁紙を表示しました'},
  accTitle:{en:'Appearance',ja:'テーマ設定'},
  accCards:{en:'Cards',ja:'カード'},
  accLayout:{en:'Layout',ja:'レイアウト'},
  wpAnime:{en:'Anime key art',ja:'アニメのキービジュアル'},
  wpManga:{en:'Manga banners',ja:'マンガバナー'},
  wpJapan:{en:'Japan photos',ja:'日本の写真'},
  wpArt:{en:'Wallpaper art',ja:'アニメアート'},
  wpSearchAny:{en:'Search any title for a wallpaper…',ja:'作品名で壁紙を検索…'},
  wpLive:{en:'Live wallpapers',ja:'ライブ壁紙'},
  wpLiveOn:{en:'Live wallpaper on',ja:'ライブ壁紙を適用'},
  wpLiveFallback:{en:'Video unavailable — showing its still frame',ja:'動画を再生できないため、静止画を表示します'},
  wpSrcPage:{en:'source page',ja:'配信元ページ'},
  wpNew:{en:'New picture',ja:'別の画像'},
  wpNewLive:{en:'Next live',ja:'次のライブ'},
  wpHint:{en:'Sets a background for the whole site',ja:'サイト全体の背景を設定します'},
  fsTosTitle:{en:'Terms of use — read before opening',ja:'ご利用条件 — 開く前に必読'},
  fsTosA:{en:'Every entry is a third-party website run by other people — nothing here is hosted by this site.',ja:'各サイトは第三者が運営する外部サイトです。当サイトがホストしたものはありません。'},
  fsTosB:{en:'Use an adblocker (uBlock Origin is recommended). Many of these sites carry heavy advertising and pop-ups.',ja:'アドブロッカー（uBlock Origin推奨）をご使用ください。広告やポップアップが多い場合があります。'},
  fsTosC:{en:'Be careful with fake download buttons and “allow notifications” prompts — never enter personal information.',ja:'偽のダウンロードボタンや通知許可の表示に注意し、個人情報は入力しないでください。'},
  fsTosD:{en:'This tool only opens links in a new tab — it does not host, upload, download or distribute any content.',ja:'本ツールは新しいタブでリンクを開くだけです。コンテンツのホスト・アップロード・ダウンロード・配布は一切行いません。'},
  fsTosE:{en:'Everything here is used at your own discretion — follow your local laws.',ja:'すべてご自身の責任でご利用ください。現地の法律に従ってください。'},
  fsAgree:{en:'I understand — show the links',ja:'理解しました — リンクを表示'},
  fsCancel:{en:'Cancel',ja:'キャンセル'},
  fsOpen:{en:'Open',ja:'開く'},
  fsCopy:{en:'Copy link',ja:'リンクをコピー'},
  fsExt:{en:'Extension',ja:'拡張機能'},
  fsNote:{en:'Links open in a new tab. Nothing is ever downloaded through this site.',ja:'リンクは新しいタブで開きます。このサイトから何もダウンロードされません。'},
  fsDir:{en:'Link directory',ja:'リンク集'},
  legalTitle:{en:'Privacy Policy & Terms of Service',ja:'プライバシーポリシー＆利用規約'},
  ppTitle:{en:'Privacy Policy',ja:'プライバシーポリシー'},
  pp1:{en:'No accounts, no cookies, no analytics and no tracking — this site runs entirely in your browser.',ja:'アカウント・Cookie・アクセス解析・トラッキングは一切ありません。すべてブラウザ内で動作します。'},
  pp2:{en:'Your settings (language, effects, wallpaper, watchlist, recently opened tools) are saved only in your browser\u2019s local storage — they never leave your device and are deleted when you clear site data.',ja:'設定（言語・エフェクト・壁紙・視聴リスト・履歴）はブラウザのローカルストレージにのみ保存されます。端末外には送信されず、サイトデータの消去で削除されます。'},
  pp3:{en:'Tools query free public APIs (Jikan/MyAnimeList, AniList, MangaDex, Kitsu and others) directly from your browser — those services may receive standard request data (your IP address and browser user agent) under their own privacy policies.',ja:'ツールは無料の公開API（Jikan/MyAnimeList、AniList、MangaDex、Kitsuなど）にブラウザから直接接続します。各サービスは独自の方針に基づき標準的なリクエスト情報（IPアドレス・ブラウザー情報）を受け取る場合があります。'},
  pp4:{en:'Wallpaper and cover images load directly from official CDNs (AniList, Flickr/Openverse), and live wallpapers stream from MotionBGs / MoeWalls — those hosts see normal image and video requests.',ja:'壁紙・カバー画像は公式CDN（AniList、Flickr/Openverse）から、ライブ壁紙は MotionBGs / MoeWalls から直接読み込まれ、各ホストは通常の画像・動画リクエストを受け取ります。'},
  pp5:{en:'External links open third-party websites with their own privacy practices — review them before use.',ja:'外部リンクは独自のプライバシーポリシーを持つ第三者サイトを開きます。利用前にご確認ください。'},
  tsTitle:{en:'Terms of Service',ja:'利用規約'},
  ts1:{en:'This site is provided free "as is" with no warranty of any kind — use it at your own risk.',ja:'本サイトは無償・無保証で提供されます。ご自身の責任でご利用ください。'},
  ts2:{en:'Fan-made project, not affiliated with or endorsed by MyAnimeList, AniList, MangaDex, Kitsu or any studio.',ja:'ファンによる非公式プロジェクトです。MyAnimeList・AniList・MangaDex・Kitsu・各スタジオとは無関係で、一切の推奨を受けているものではありません。'},
  ts3:{en:'The Free Streaming directory only links to third-party sites — we host, upload, download and distribute nothing; respect your local laws.',ja:'Free Streamingは第三者サイトへのリンク集です。当サイトはコンテンツのホスト・アップロード・ダウンロード・配布を一切行いません。現地の法令に従ってください。'},
  ts4:{en:'The original code, design, text and artwork of this site are protected — do not copy, scrape, mirror or rehost them without written permission.',ja:'本サイトのオリジナルコード・デザイン・文章・アートは保護されています。許可なく複製・スクレイピング・ミラーリング・再ホストしないでください。'},
  ts5:{en:'Using this site means you accept these terms, which may be updated at any time. Liability is limited to the maximum extent permitted by law.',ja:'ご利用により本規約に同意したものとみなします。予告なく更新される場合があります。責任は法律で許される最大限の範囲に限定されます。'},
  legalCopy:{en:'© 2026 Anime Zaki Tools — original design, code & artwork · All rights reserved.',ja:'© 2026 Anime Zaki Tools — オリジナルデザイン・コード・アート · 無断複製・転載を禁じます。'},
  gbTitle:{en:'Rate, Comment & Suggest',ja:'評価＆コメント'},
  gbRate:{en:'Your rating',ja:'あなたの評価'},
  gbNamePh:{en:'Name (optional — blank = anonymous)',ja:'名前（任意・空欄は匿名）'},
  gbMsgPh:{en:'Write a comment or suggestion… (blank = rating only)',ja:'コメントや提案を書く…（空欄で評価のみ）'},
  gbPost:{en:'Post',ja:'投稿する'},
  gbNoEmail:{en:'No email, no account — post with a name or stay anonymous.',ja:'メール・アカウント不要 — 名前を付けても匿名でも。'},
  gbNote:{en:'Everything you post is saved only in this browser (no server, no account) — use the copy button on any note to send it to the owner from anywhere.',ja:'投稿はこのブラウザ内にのみ保存されます（サーバー・アカウントなし）。各ノートのコピー機能でいつでもオーナーへ送れます。'},
  gbPosted:{en:'Posted — thank you!',ja:'投稿しました — ありがとう！'},
  gbAnonymous:{en:'Anonymous',ja:'匿名'},
  gbCopySend:{en:'Copy note',ja:'ノートをコピー'},
  gbDel:{en:'Delete',ja:'削除'},
  gbNoEntries:{en:'No notes yet — say hello below.',ja:'まだコメントはありません — 最初の1件をどうぞ。'},
  /* --- cursor picker --- */
  curLab:{en:'Cursor',ja:'カーソル'},
  curTitle:{en:'Cursor picker',ja:'カーソル選択'},
  curCustom:{en:'My image',ja:'マイ画像'},
  curUpload:{en:'Upload GIF / PNG',ja:'GIF/PNGをアップロード'},
  curPastePh:{en:'…or paste a GIF / PNG URL',ja:'…またはGIF/PNGのURLを貼り付け'},
  curCustomNote:{en:'Stays on this device only — saved in your browser, never uploaded anywhere.',ja:'この端末だけに保存されます。ブラウザ内のみ・どこにも送信されません。'},
  curSites:{en:'Gallery websites',ja:'ギャラリーサイト'},
  curCount:{en:'cursors',ja:'カーソル'},
  curBack:{en:'All websites',ja:'サイト一覧'},
  curOpenPage:{en:'Open website',ja:'サイトを開く'},
  curLinkNote:{en:'This gallery only hands out its cursors on its own site — open the page, grab the cursor, then upload it above.',ja:'このサイトのカーソルは配布ページでのみ入手できます。ページを開いて保存し、上でアップロードしてください。'},
  curLinkTag:{en:'Download on site',ja:'配布ページで入手'},
  curApplyTag:{en:'Tap to apply',ja:'タップで適用'},
  curApplied:{en:'Cursor applied',ja:'カーソルを適用しました'},
  curCustomOn:{en:'Custom cursor applied',ja:'カスタムカーソルを適用しました'},
  curOffToast:{en:'Default cursor restored',ja:'既定のカーソルに戻しました'},
  curTooBig:{en:'Image is over 400 KB — pick a smaller file.',ja:'画像が400KBを超えています。小さいファイルを選んでください。'},
  curBadImg:{en:'Could not load that image.',ja:'画像を読み込めませんでした。'},
  curSaving:{en:'Saving cursor…',ja:'カーソルを準備中…'},
  curByUrl:{en:'Apply URL',ja:'URLを適用'},
  curRemove:{en:'Remove custom cursor',ja:'カスタムカーソルを解除'},
  curReplace:{en:'Replace image',ja:'画像を変更'},
  curAnimTag:{en:'Animated',ja:'動く'},
  curDot:{en:'Tip dot',ja:'先端ドット'},
  curDotHint:{en:'Shows a small dot exactly where you are clicking — handy when a cursor image hides its own tip.',
    ja:'クリック位置を正確に示す小さなドット。カーソル画像の先端が見えにくいときに便利です。'},
  curDotOn:{en:'Tip dot on',ja:'先端ドット オン'},
  curDotOff:{en:'Tip dot off',ja:'先端ドット オフ'},
  curDotSize:{en:'Size',ja:'サイズ'},
  curDotColor:{en:'Color',ja:'色'},
  curSize:{en:'Size',ja:'サイズ'},
  curStretch:{en:'Stretch',ja:'幅を伸ばす'},
  curScaleHint:{en:'Resize and stretch the cursor you have on. Applies at once.',
    ja:'カーソルの寸法を調整します。すぐに反映されます。'},
  curDotFill:{en:'Filled',ja:'塗りつぶし'},
  curDotHollow:{en:'Outlined',ja:'枠線のみ'},
  /* --- liquid glass surface --- */
  accSurface:{en:'Surface',ja:'表面'},
  surfPaper:{en:'Paper',ja:'ペーパー'},
  surfMidnight:{en:'Midnight',ja:'ミッドナイト'},
  surfGlass:{en:'Liquid glass',ja:'リキッドグラス'},
  accTint:{en:'Glass tint',ja:'ガラスの色'},
  tintAccent:{en:'Accent',ja:'アクセント'},
  tintCustom:{en:'Custom',ja:'カスタム'},
  glassAmt:{en:'Glass amount',ja:'ガラスの濃さ'},
  toolTrans:{en:'Tool transparency',ja:'ツールの透明度'}
};

/* ---------------- DOM builders ---------------- */
function h(sel, ...kids){
  const parts=String(sel).split(/\s+/).filter(Boolean);
  const e=document.createElement((parts[0]||'div').replace(/[.#].*$/,'')||'div');
  const apply=s=>s.replace(/([.#])([\w-]+)/g,(_,c,v)=>{ c==='.'?e.classList.add(v):e.id=v; return '' });
  parts.forEach((p,i)=>{ if(i===0||/^[.#]/.test(p)) apply(p); else e.classList.add(p); });
  if(kids.length && kids[0] && typeof kids[0]==='object' && !(kids[0] instanceof Node) && !Array.isArray(kids[0])){
    const p = kids.shift();
    for(const k in p){
      const v = p[k];
      if(v==null||v===false) continue;
      if(k==='class') e.className = v;
      else if(k==='html') e.innerHTML = v;
      else if(k.slice(0,2)==='on') e.addEventListener(k.slice(2).toLowerCase(), v);
      else e.setAttribute(k, v===true?'':v);
    }
  }
  for(const c of kids.flat(9)){
    if(c==null||c===false) continue;
    e.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return e;
}
function clear(node){ while(node.firstChild) node.removeChild(node.firstChild); return node; }

/* ============================================================
   ICON SYSTEM — inline SVG, no emoji stickers
   ============================================================ */
const ICONS={
  dice:'<rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><circle cx="8.6" cy="8.6" r="1.35" fill="currentColor" stroke="none"/><circle cx="15.4" cy="15.4" r="1.35" fill="currentColor" stroke="none"/><circle cx="15.4" cy="8.6" r="1.35" fill="currentColor" stroke="none"/><circle cx="8.6" cy="15.4" r="1.35" fill="currentColor" stroke="none"/>',
  search:'<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
  compass:'<circle cx="12" cy="12" r="8.5"/><path d="M15.5 8.5l-2.1 5-5 2.1 2.1-5z" fill="currentColor" stroke="none"/>',
  target:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/>',
  shuffle:'<path d="M16 4l4 3.5-4 3.5"/><path d="M16 13l4 3.5-4 3.5"/><path d="M4 7.5h3.5c5 0 4 9 9 9H20"/><path d="M4 16.5h3.5c1.7 0 2.7-1 3.5-2.3"/><path d="M12.5 9.8c.9-1.4 2-2.3 4-2.3H20"/>',
  music:'<path d="M9 18V6.5l10-2v11"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="15.5" r="2.5"/>',
  note:'<path d="M9 17.5V6l9-2v11.5"/><circle cx="6.5" cy="17.5" r="2.5"/><circle cx="15.5" cy="15.5" r="2.5"/><path d="M9 9.5l9-2"/>',
  disc:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2.2"/>',
  radio:'<rect x="3" y="9" width="18" height="11.5" rx="2.5"/><path d="M7 9L17 4"/><circle cx="8.5" cy="14.7" r="2.6"/><path d="M14 13h4.2M14 16.5h4.2"/>',
  headphones:'<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="13.5" width="4.5" height="7" rx="2.2"/><rect x="16.5" y="13.5" width="4.5" height="7" rx="2.2"/>',
  ear:'<path d="M7 9a5 5 0 1 1 10 0c0 3-3 3.6-3 6.5a2.7 2.7 0 0 1-5.4.6"/><path d="M9.8 9.6a2.3 2.3 0 0 1 4.5.6"/><circle cx="17.5" cy="17.5" r="3.2"/><path d="M19.8 19.8L22 22"/>',
  mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0"/><path d="M12 18v3M9 21h6"/>',
  piano:'<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M8 5.5v8M12 5.5v8M16 5.5v8"/><path d="M6.4 13.5h3.2M10.4 13.5h3.2M14.4 13.5h3.2" stroke-width="2.4"/>',
  film:'<rect x="3" y="4.5" width="18" height="15" rx="2.5"/><path d="M7.5 4.5v15M16.5 4.5v15M3 9.5h4.5M3 14.5h4.5M16.5 9.5H21M16.5 14.5H21"/>',
  clapper:'<rect x="3" y="9.5" width="18" height="10" rx="2"/><path d="M3.6 9.5L4.7 5.1l15.4-1.6-.9 4.4z"/><path d="M8.7 8.6l-1.6-3.9M13.4 8.1l-1.6-3.9M18.1 7.6l-1.6-3.9"/>',
  tv:'<rect x="3" y="6" width="18" height="12.5" rx="2.5"/><path d="M8.5 21.5h7"/><path d="M9.5 3l2.5 3 2.5-3"/>',
  image:'<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="M4.5 17l5-4.5 4 3.4 3-2.6 4 3.7"/>',
  camera:'<path d="M4 8h3l1.6-2.5h6.8L17 8h3a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 20 19H4a1.5 1.5 0 0 1-1.5-1.5v-8A1.5 1.5 0 0 1 4 8z"/><circle cx="12" cy="13" r="3.4"/>',
  brush:'<path d="M14.5 4.5l5 5L10 19H5v-5z"/><path d="M12.5 6.5l5 5"/><path d="M5 19c-1.5.5-2 1.8-2 3 1.7.2 3-.4 3.4-1.6"/>',
  palette:'<path d="M12 3.5a8.5 8.5 0 1 0 .2 17c1.6 0 2-1 1.4-2-.7-1.2.1-2.5 1.6-2.5h1.6c2.3 0 3.7-1.7 3.7-4C21 7.2 17 3.5 12 3.5z"/><circle cx="7.8" cy="10" r="1.15" fill="currentColor" stroke="none"/><circle cx="11.4" cy="7.4" r="1.15" fill="currentColor" stroke="none"/><circle cx="15.6" cy="9" r="1.15" fill="currentColor" stroke="none"/>',
  pen:'<path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19z"/><path d="M14.5 6.5l3 3"/><path d="M4 20l4-.5"/>',
  feather:'<path d="M19.5 4.5c-4-1-9 1-11.5 5.5L5 18l1 1 8-3c4.5-2.5 6.5-7.5 5.5-11.5z"/><path d="M5 19L14 10"/><path d="M9 15H5.5M13 11V7"/>',
  book:'<path d="M5 4.5h9a4 4 0 0 1 4 4V20H9a4 4 0 0 1-4-4z"/><path d="M9 8.5h5M9 12h5"/>',
  bookOpen:'<path d="M12 6.5C10.5 5 8 4.3 4.5 4.5v13C8 17.3 10.5 18 12 19.5"/><path d="M12 6.5c1.5-1.5 4-2.2 7.5-2v13c-3.5-.2-6 .5-7.5 2"/><path d="M12 6.5v13"/>',
  news:'<rect x="3.5" y="5" width="17" height="14.5" rx="2"/><path d="M6.5 8.5h6v4h-6z"/><path d="M15.5 8.5h3M15.5 11.5h3M6.5 15.5h12"/>',
  file:'<path d="M6 3.5h7.5L19 9v11.5H6z"/><path d="M13 3.5V9h5.5"/><path d="M9 13h6M9 16.5h6"/>',
  fileText:'<path d="M6 3.5h7.5L19 9v11.5H6z"/><path d="M13 3.5V9h5.5"/><path d="M9 12.5h6M9 16h4"/>',
  folder:'<path d="M3.5 6.5A2 2 0 0 1 5.5 4.5H10l2 2.5h6.5a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/>',
  archive:'<rect x="3.5" y="4.5" width="17" height="4.5" rx="1.5"/><path d="M5 9v9.5a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5V9"/><path d="M10 13h4"/>',
  chart:'<path d="M4 20h16"/><rect x="5" y="11" width="3.6" height="6" rx="1"/><rect x="10.2" y="7" width="3.6" height="10" rx="1"/><rect x="15.4" y="13" width="3.6" height="4" rx="1"/>',
  chartUp:'<path d="M4 19h16"/><path d="M4.5 15.5l4.5-4.5 3.5 3 6-6.5"/><path d="M14.5 7.5h4v4"/>',
  chartDown:'<path d="M4 19h16"/><path d="M4.5 8.5l4.5 4.5 3.5-3 6 6.5"/><path d="M14.5 16.5h4v-4"/>',
  calc:'<rect x="5" y="3.5" width="14" height="17" rx="2.5"/><rect x="8" y="6.5" width="8" height="3.4" rx="1"/><circle cx="9" cy="13.4" r="1.1" fill="currentColor" stroke="none"/><circle cx="12" cy="13.4" r="1.1" fill="currentColor" stroke="none"/><circle cx="15" cy="13.4" r="1.1" fill="currentColor" stroke="none"/><circle cx="9" cy="17" r="1.1" fill="currentColor" stroke="none"/><circle cx="12" cy="17" r="1.1" fill="currentColor" stroke="none"/><circle cx="15" cy="17" r="1.1" fill="currentColor" stroke="none"/>',
  calendar:'<rect x="3.5" y="5.5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3.5v4M16 3.5v4"/><path d="M7.5 14h3M13.5 14h3M7.5 17.5h3"/>',
  clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5.3l3.4 2"/>',
  hash:'<path d="M9.5 4l-2 16M16.5 4l-2 16M4.5 9h15M3.5 15h15"/>',
  users:'<circle cx="9" cy="8.5" r="3.5"/><path d="M3 19.5c.5-3.6 3-5.5 6-5.5s5.5 1.9 6 5.5"/><path d="M15.5 5.6a3.5 3.5 0 0 1 0 6.3"/><path d="M17.5 14.4c1.9.8 3.2 2.5 3.5 5.1"/>',
  user:'<circle cx="12" cy="8.5" r="3.9"/><path d="M4.5 20c.8-4 3.8-6.2 7.5-6.2s6.7 2.2 7.5 6.2"/>',
  star:'<path d="M12 3.8l2.5 5.2 5.7.7-4.2 4 1.1 5.6L12 16.5l-5.1 2.8 1.1-5.6-4.2-4 5.7-.7z"/>',
  trophy:'<path d="M7.5 4h9v5a4.5 4.5 0 0 1-9 0z"/><path d="M7.5 5.5H5a2.5 2.5 0 0 0 2.6 4M16.5 5.5H19a2.5 2.5 0 0 1-2.6 4"/><path d="M12 13.5V17M8.5 20h7M9.5 17h5c0 1.4-.9 2.4-2 3h-1c-1.1-.6-2-1.6-2-3z"/>',
  medal:'<circle cx="12" cy="14.5" r="5"/><path d="M9 10L6.5 3.5h11L15 10"/><path d="M12 12.2l.9 1.8 2 .3-1.4 1.4.3 2-1.8-.9-1.8.9.3-2-1.4-1.4 2-.3z"/>',
  award:'<circle cx="12" cy="9" r="5.5"/><path d="M9 13.8L7.5 21l4.5-2.4 4.5 2.4-1.5-7.2"/>',
  heart:'<path d="M12 20s-7.5-4.6-7.5-10A4.2 4.2 0 0 1 12 7.4 4.2 4.2 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>',
  sparkles:'<path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6z"/><path d="M18.5 15l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9z"/>',
  eye:'<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  eyeoff:'<path d="M9.9 5.2A10.6 10.6 0 0 1 12 5c6.4 0 10 7 10 7a18.4 18.4 0 0 1-3.2 4.2M6.4 6.5A18.4 18.4 0 0 0 2 12s3.6 7 10 7c1.9 0 3.5-.6 4.9-1.4M10 10a3 3 0 0 0 4 4M3 3l18 18"/>',
  blur:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.4"/>',
  wave:'<path d="M3 9c2 0 2-2.4 4.5-2.4S10 9 12 9s2-2.4 4.5-2.4S19 9 21 9"/><path d="M3 14c2 0 2-2.4 4.5-2.4S10 14 12 14s2-2.4 4.5-2.4S19 14 21 14"/><path d="M3 19c2 0 2-2.4 4.5-2.4S10 19 12 19s2-2.4 4.5-2.4S19 19 21 19"/>',
  torii:'<path d="M3 6.5c3-.9 15-.9 18 0M4.5 9.5h15M5.5 6.5L6.5 21M18.5 6.5L17.5 21M4 4.5h16"/><path d="M12 6.5V9.5"/>',
  spiral:'<path d="M12 12a2.4 2.4 0 1 1 2.4 2.4A4.4 4.4 0 0 1 10 10a6.4 6.4 0 0 1 6.4-6.4A8.4 8.4 0 0 1 8 14.8 10.4 10.4 0 0 1 4.2 8"/>',
  tool:'<path d="M14.5 6.5a4.5 4.5 0 0 0 5.8 5.8L21 13l-8 8-2-2 1-5.5-5-5L11.5 5z"/><path d="M6.5 12.5L3 16l4 4 3.5-3.5"/>',
  newsCat:'<rect x="3.5" y="5" width="17" height="14.5" rx="2"/>',
  layers:'<path d="M12 3.5l9 4.8-9 4.8-9-4.8z"/><path d="M4 13l8 4.3 8-4.3"/><path d="M4 16.8l8 4.2 8-4.2"/>',
  grid:'<rect x="4" y="4" width="7" height="7" rx="1.8"/><rect x="13" y="4" width="7" height="7" rx="1.8"/><rect x="4" y="13" width="7" height="7" rx="1.8"/><rect x="13" y="13" width="7" height="7" rx="1.8"/>',
  pin:'<path d="M12 21s-6.5-6-6.5-11A6.5 6.5 0 0 1 18.5 10c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>',
  message:'<path d="M4 5.5h16v10.5H10l-4.5 4v-4H4z"/><path d="M8 9.5h8M8 12.5h5"/>',
  chat:'<path d="M4 5.5h12.5v9H9l-3.5 3.5v-3.5H4z"/><path d="M19 8.5h1v9h-1.5l-3 3v-3"/>',
  radar:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><path d="M12 12l6-6"/>',
  flame:'<path d="M12 21c-3.9 0-6.5-2.4-6.5-6 0-3 2-4.8 3.4-6.6C10.5 6.5 11 4 11 2.5c2.6 1.6 3.4 4 3.4 6 1 .8 1.6 2 1.6 3.4 0 1.7-.7 2.9-1.5 3.8.5-1.4.2-3-1-4.2 0 2-1.4 3.2-2.6 4.4-1 1-1.4 2-1.4 3.1 0 1.5 1.1 2.4 2.5 2.4 1.8 0 3-1.2 3-3.4 1.2-.6 1.9-1.7 1.9-3.2C18.9 17.4 16 21 12 21z"/>',
  cloud:'<path d="M7.5 18.5a4.5 4.5 0 0 1-.4-9A6 6 0 0 1 18.6 11a3.8 3.8 0 0 1-.6 7.5z"/><path d="M9 21l.8-1.6M13 21l.8-1.6M17 21l.8-1.6"/>',
  snow:'<path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9"/><path d="M9.5 4.5L12 3l2.5 1.5M9.5 19.5L12 21l2.5-1.5M5 10l-.8-2.5L6.5 6M19 14l.8 2.5L17.5 18M19 10l.8-2.5L17.5 6M5 14l-.8 2.5L6.5 18"/>',
  flower:'<circle cx="12" cy="12" r="2.4"/><path d="M12 9.6c0-3 1.2-5.6 0-5.6s0 2.6 0 5.6zM14.4 12c3 0 5.6 1.2 5.6 0s-2.6 0-5.6 0zM12 14.4c0 3-1.2 5.6 0 5.6s0-2.6 0-5.6zM9.6 12c-3 0-5.6-1.2-5.6 0s2.6 0 5.6 0z"/>',
  moon:'<path d="M19.5 14.5A8.5 8.5 0 0 1 9.5 4.5a8.5 8.5 0 1 0 10 10z"/>',
  shield:'<path d="M12 3l7.5 2.8v5.4c0 4.6-3.1 8.1-7.5 9.5-4.4-1.4-7.5-4.9-7.5-9.5V5.8z"/><path d="M8.8 12l2.2 2.2 4.2-4.4"/>',
  lightbulb:'<path d="M9 17.5h6"/><path d="M10 20.5h4"/><path d="M12 3.5a5.8 5.8 0 0 0-3.2 10.6c.6.4 1 1 1 1.7v.2h4.4v-.2c0-.7.4-1.3 1-1.7A5.8 5.8 0 0 0 12 3.5z"/>',
  bug:'<ellipse cx="12" cy="13" rx="4.5" ry="5.5"/><path d="M9.5 8.2a2.5 2.5 0 0 1 5 0"/><path d="M4 12h3.2M16.8 12H20M4.6 18l3-1.7M19.4 18l-3-1.7M5.5 7l2.4 1.8M18.5 7l-2.4 1.8M12 19.5V22"/>',
  send:'<path d="M20.5 3.5L10.5 13.5"/><path d="M20.5 3.5l-6.5 17-3.5-7-7-3.5z"/>',
  globe:'<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17"/><path d="M12 3.5c2.6 2.4 3.9 5.2 3.9 8.5s-1.3 6.1-3.9 8.5c-2.6-2.4-3.9-5.2-3.9-8.5S9.4 5.9 12 3.5z"/>',
  link:'<path d="M9.5 14.5l5-5"/><path d="M8 11l-2.5 2.5a3.5 3.5 0 0 0 5 5L13 16"/><path d="M16 13l2.5-2.5a3.5 3.5 0 0 0-5-5L11 8"/>',
  copy:'<rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2.2"/><path d="M15.5 8.5v-2a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5"/>',
  trash:'<path d="M4.5 6.5h15"/><path d="M8 6.5V4.8A1.3 1.3 0 0 1 9.3 3.5h5.4A1.3 1.3 0 0 1 16 4.8v1.7"/><path d="M6 6.5l1 13.2a1.5 1.5 0 0 0 1.5 1.3h7a1.5 1.5 0 0 0 1.5-1.3l1-13.2"/><path d="M10 10.5v6M14 10.5v6"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  alert:'<path d="M12 4.5L21 19.5H3z"/><path d="M12 10v4.2"/><circle cx="12" cy="16.8" r="1.1" fill="currentColor" stroke="none"/>',
  info:'<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.2"/><circle cx="12" cy="8" r="1.1" fill="currentColor" stroke="none"/>',
  play:'<path d="M8 5.5l10 6.5-10 6.5z"/>',
  playCircle:'<circle cx="12" cy="12" r="8.5"/><path d="M10 8.5l6 3.5-6 3.5z"/>',
  pause:'<rect x="7.5" y="5.5" width="3.4" height="13" rx="1.2"/><rect x="13.1" y="5.5" width="3.4" height="13" rx="1.2"/>',
  download:'<path d="M12 4v10.5"/><path d="M7.5 10.5L12 15l4.5-4.5"/><path d="M4.5 18.5h15"/>',
  refresh:'<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.8 4.5v4.4h-4.4"/>',
  skip:'<path d="M6 6.5l7 5.5-7 5.5z"/><path d="M15 6.5l4.5 5.5L15 17.5"/>',
  check:'<path d="M5 12.5l4.8 4.8L19 7"/>',
  key:'<circle cx="8" cy="14.5" r="4.2"/><path d="M11 11.5L20 3.5"/><path d="M16.5 6.5l2.5 2.5M14 9l2 2"/>',
  scale:'<path d="M12 4v16M7 20h10"/><path d="M4 9l3-5 3 5a3 3 0 0 1-6 0zM14 9l3-5 3 5a3 3 0 0 1-6 0z"/>',
  tag:'<path d="M4 4.5h7l9 9-6.5 6.5-9-9z"/><circle cx="8.4" cy="8.9" r="1.4"/>',
  circle:'<circle cx="12" cy="12" r="8.5"/>',
  wheel:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3"/><path d="M12 3.5V9M12 15v5.5M3.5 12H9M15 12h5.5M6 6l3.6 3.6M14.4 14.4L18 18M18 6l-3.6 3.6M9.6 14.4L6 18"/>',
  sliders:'<path d="M5 20V13M5 9V4M12 20v-9M12 7V4M19 20v-4M19 12V4"/><circle cx="5" cy="11" r="2"/><circle cx="12" cy="9" r="2"/><circle cx="19" cy="14" r="2"/>',
  eye:'<path d="M2.8 12S6.5 5.8 12 5.8 21.2 12 21.2 12 17.5 18.2 12 18.2 2.8 12 2.8 12z"/><circle cx="12" cy="12" r="2.8"/>',
  external:'<path d="M14 4.5h5.5V10"/><path d="M19.5 4.5L11 13"/><path d="M18 14v5.5H4.5V6H10"/>',
  spark:'<path d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9z"/>',
  cup:'<path d="M5.5 8h11v5.5A5.5 5.5 0 0 1 11 19h0a5.5 5.5 0 0 1-5.5-5.5z"/><path d="M16.5 9.5H18a2.5 2.5 0 0 1 0 5h-1.5"/><path d="M8 3.5c0 1-1 1.5-1 2.5M11.5 3.5c0 1-1 1.5-1 2.5"/>',
  bird:'<path d="M4 16.5c3.5.5 5.5-1 7-3.5 1.4-2.2 3.4-3.7 6-4l2.5-.4-.8 2.3c-.2.7-1 1-1.6.8-.5-.1-.8-.7-.6-1.2-1.8.7-3.2 1.9-4.3 3.6-1.5 2.3-4 3.7-8.2 3.7z"/><circle cx="16.4" cy="9.6" r=".9" fill="currentColor" stroke="none"/><path d="M8.5 17c-.6 1.4-1.8 2.5-3.5 3"/>',
  pulse:'<path d="M3.5 12.5h4L10 6.5l3.5 11 2.5-5h4.5"/>',
  percent:'<path d="M19 5L5 19"/><circle cx="7.8" cy="7.8" r="2.6"/><circle cx="16.2" cy="16.2" r="2.6"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.4 5.4l1.9 1.9M16.7 16.7l1.9 1.9M18.6 5.4l-1.9 1.9M7.3 16.7l-1.9 1.9"/>',
  x:'<path d="M6 6l12 12M18 6L6 18"/>',
  minus:'<path d="M5 12h14"/>',
  help:'<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.3 2.6c-.7.3-.9.8-.9 1.6"/><circle cx="12" cy="16.6" r="1.05" fill="currentColor" stroke="none"/>',
  map:'<path d="M3.5 6.5l5.5-2 6 2 5.5-2v13l-5.5 2-6-2-5.5 2z"/><path d="M9 4.5v13M15 6.5v13"/>',
  door:'<rect x="6" y="3.5" width="12" height="17" rx="1.5"/><circle cx="14.6" cy="12" r="1.1" fill="currentColor" stroke="none"/><path d="M4 20.5h16"/>',
  mail:'<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="M4.5 7.5L12 13l7.5-5.5"/>',
  coins:'<ellipse cx="12" cy="7" rx="7" ry="3"/><path d="M5 7v5c0 1.7 3.1 3 7 3s7-1.3 7-3V7"/><path d="M5 12v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"/>',
  crown:'<path d="M4.5 17.5L3.5 7l5 3.5L12 4.5l3.5 6 5-3.5-1 10.5z"/><path d="M5 20h14"/>',
  home:'<path d="M4 11l8-7 8 7"/><path d="M6.5 9.5V20h11V9.5"/><path d="M10 20v-5.5h4V20"/>',
  burst:'<path d="M12 3.4v3.9M12 16.7v3.9M4.6 12h3.9M15.5 12h3.9M6.6 6.6l2.8 2.8M14.6 14.6l2.8 2.8M17.4 6.6l-2.8 2.8M9.4 14.6l-2.8 2.8"/><circle cx="12" cy="12" r="2.6"/>',
  aura:'<circle cx="12" cy="12" r="2.6"/><ellipse cx="12" cy="12" rx="9" ry="4.3" transform="rotate(-24 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="4.3" transform="rotate(36 12 12)"/>',
  bubble:'<circle cx="10" cy="13.6" r="6.4"/><path d="M6.9 10.5c.6-1.1 1.6-2 2.9-2.5"/><circle cx="18" cy="6.6" r="2.8"/>',
  zap:'<path d="M13.2 2.5L4.8 13.4h5.6L9.4 21.5l8.6-11.2h-5.6z"/>',
  galaxy:'<circle cx="12" cy="12" r="2.2"/><path d="M12 5.2c-3.8 0-6.8 3-6.8 6.8s3 6.8 6.8 6.8c2.9 0 5.3-2.4 5.3-5.3s-2.4-5.3-5.3-5.3c-1.8 0-3.3 1.5-3.3 3.3"/><path d="M14.1 4.9c3.1.8 5.4 3.4 5.4 6.5"/>',
  blackhole:'<ellipse cx="12" cy="12" rx="9.3" ry="3.7" transform="rotate(-18 12 12)"/><circle cx="12" cy="12" r="3.3" fill="currentColor" stroke="none"/>',
  speaker:'<path d="M4 9.3h3.3L11.8 5.5v13L7.3 14.7H4z"/><path d="M15.3 9.4a3.9 3.9 0 0 1 0 5.2"/><path d="M17.7 6.9a7.3 7.3 0 0 1 0 10.2"/>',
  mute:'<path d="M4 9.3h3.3L11.8 5.5v13L7.3 14.7H4z"/><path d="M15.5 9.5l5 5m0-5l-5 5"/>',
  expand:'<path d="M8.5 4.5H5.5a1 1 0 0 0-1 1v3"/><path d="M15.5 4.5h3a1 1 0 0 1 1 1v3"/><path d="M19.5 15.5v3a1 1 0 0 1-1 1h-3"/><path d="M4.5 15.5v3a1 1 0 0 0 1 1h3"/>',
  chevd:'<path d="M6 9.5l6 6 6-6"/>',
  chevdd:'<path d="M6 7l6 5 6-5"/><path d="M6 13l6 5 6-5"/>',
  chevu:'<path d="M6 14.5l6-6 6 6"/>',
  loop:'<path d="M17 4.2l3 3-3 3"/><path d="M20 7.2H8.5A4.5 4.5 0 0 0 4 11.7v.8"/><path d="M7 19.8l-3-3 3-3"/><path d="M4 16.8h11.5a4.5 4.5 0 0 0 4.5-4.5v-.8"/>',
  full:'<path d="M4.5 9.5h5v-5"/><path d="M14.5 4.5v5h5"/><path d="M19.5 14.5h-5v5"/><path d="M9.5 19.5v-5h-5"/>',
  cursor:'<path d="M5.5 3.5l6.2 15.2 2.2-6.6 6.6-2.2z"/><path d="M13.2 12.4l6.3 6.1"/>',
  upload:'<path d="M12 16.5V7.5"/><path d="M8 11L12 7l4 4"/><path d="M4.5 18.5h15"/>'
};
function ico(name,cls){
  const d=ICONS[name]||ICONS.sparkles;
  return '<svg class="ico'+(cls?' '+cls:'')+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+d+'</svg>';
}
const iconForTool=id=>TOOL_ICON[id]||CAT_ICON[((typeof TOOLS!=='undefined'&&TOOLS.find(t=>t.id===id))||{}).cat]||'sparkles';
const iconForCat=id=>CAT_ICON[id]||'sparkles';
/* emoji → icon name (legacy strings in old labels/toasts/modal headers) */
const EMOJI2ICO={
 '🎲':'dice','📖':'book','🔎':'search','🔍':'search','▶':'play','▶️':'play','📋':'copy','⬇️':'download','⬇':'download',
 '🗑️':'trash','🗑':'trash','⭐':'star','➕':'plus','＋':'plus','⚠️':'alert','⚠':'alert','ℹ️':'info','ℹ':'info','🔗':'link',
 '🎧':'headphones','💿':'disc','🌙':'moon','🎵':'music','🎶':'note','🖼️':'image','🖼':'image','📷':'camera','🌄':'image',
 '⏭️':'skip','💬':'chat','📡':'radar','🔥':'flame','✨':'sparkles','🌟':'sparkles','🌀':'spiral','🌸':'flower','🌸':'flower',
 '❄️':'snow','🌧️':'cloud','🌊':'wave','⛩️':'torii','⛩':'torii','🍵':'cup','✍️':'pen','🧹':'sliders','🥇':'award','📚':'book',
 '👥':'users','📄':'file','🕊️':'bird','📺':'tv','🎞️':'clapper','🎞':'clapper','🎬':'film','📻':'radio','🎹':'piano','🎤':'mic',
 '📈':'chartUp','📉':'chartDown','🧮':'calc','🪙':'circle','🗓️':'calendar','✒️':'pen','🧩':'layers','🗃️':'archive','🏆':'trophy',
 '🗂️':'folder','🗂':'folder','⏱️':'clock','❓':'help','❔':'help','✅':'check','❌':'x','🔑':'key','⚖️':'scale','🛠️':'tool',
 '🛠':'tool','📰':'news','📕':'bookOpen','📗':'bookOpen','🎯':'target','🔭':'compass','🪞':'eye','🧬':'spiral','♥':'heart',
 '❤️':'heart','♻️':'refresh','🔁':'refresh','🗺️':'map','🗺':'map','📌':'pin','📍':'pin','🗣️':'mic','🩺':'pulse','🧾':'fileText',
 '🎲':'dice','🎥':'film','📼':'film','🔊':'speaker','🎚️':'sliders','🎛️':'sliders','🎁':'gift','🎉':'sparkles','🎊':'sparkles',
 '💛':'heart','🖤':'heart','🤍':'heart','🥈':'medal','🥉':'medal','🏅':'medal','🎖️':'medal','🔖':'star','❗':'alert','❕':'alert',
 '🚪':'door','💾':'disk','🐛':'bug','🧱':'grid','🔒':'key','🔓':'key','💡':'bulb','📧':'mail','✉️':'mail','📮':'mail','📞':'phone',
 '🍺':'cup','🍶':'cup','🍜':'cup','🍓':'flower','🍃':'leaf','🍂':'leaf','🍁':'leaf','🐈':'bird','🐕':'bird','🦊':'bird','🐰':'bird',
 '🧑':'user','👩':'user','👨':'user','🧑‍🎨':'pen','👑':'crown','💎':'sparkle','🔮':'circle','🎲':'dice','🎯':'target','%':'percent',
 '⛩':'torii','💵':'coins','💰':'coins','🔊':'speaker','📼':'film','🎵':'music','🎼':'music','🎹':'piano','🎺':'mic','🎻':'music',
 '🏯':'torii','⛩️':'torii','🗺️':'map','🌅':'image','🏞️':'image','🌄':'image','📷':'camera','🔍':'search','🔎':'search',
 '❓':'info','🗒️':'file','📜':'file','🗓':'calendar','🧮':'calc','⏱':'clock','💡':'sparkles','🔑':'key',
 '⏹':'pause','⏹️':'pause','⏩':'skip','⏪':'skip','⏯':'play','⬛':'pause','▶':'play','🎡':'wheel','🍵':'cup','🏠':'home','🍥':'spiral',
 '⏸':'pause','⏸️':'pause','🕯️':'clock','🟡':'circle','❤':'heart',
 '■':'pause','📝':'pen','📭':'mail'
};
const LEAD_EMOJI_RE=/^(?:\s| )*(?:[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2100}-\u{214F}\u{2190}-\u{21FF}\u{2300}-\u{23FF}\u{25A0}-\u{25FF}\u{FE0F}\u{200D}])+\s*/u;
/* split a legacy "emoji + text" label → [iconName|null, remainingText] */
function splitLabel(s){
  const str=String(s??'');
  const m=str.match(LEAD_EMOJI_RE);
  if(!m) return [null,str];
  const run=m[0].trim();
  return [EMOJI2ICO[run]||EMOJI2ICO[run.replace(/\s/g,'')]||null,str.slice(m[0].length)];
}
/* html-safe label: leading emoji becomes an SVG icon, rest escaped */
function labelHTML(s){
  const [ic,rest]=splitLabel(s);
  return (ic?ico(ic):'')+esc(rest.replace(/^(?:\s| )+/,''));
}
function icoh(e,cls){ return ico(EMOJI2ICO[e]||(ICONS[e]?e:'sparkles'),cls); }

function copyText(t){
  const done=()=>toast('📋 <b>'+L(S.copied)+'</b>');
  if(navigator.clipboard&&window.isSecureContext) navigator.clipboard.writeText(t).then(done).catch(()=>fallback());
  else fallback();
  function fallback(){ const ta=document.createElement('textarea'); ta.value=t; ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select(); try{document.execCommand('copy'); done()}catch(e){} ta.remove(); }
}
function toast(msg){
  const s=String(msg), m=s.match(LEAD_EMOJI_RE);
  const ic=m?EMOJI2ICO[m[0].trim()]||null:null;
  const t=h('div.toast',{html:(ic?ico(ic):'')+(m?s.slice(m[0].length):s)});
  $('#toastRoot').appendChild(t);
  setTimeout(()=>{ t.style.transition='.4s'; t.style.opacity='0'; t.style.transform='translateX(30px)'; setTimeout(()=>t.remove(),400); },2600);
}
const cdn = {
  a:(u)=>u,
  onerr(img){ img.style.background='linear-gradient(160deg,#cbbfa0,#a2957a)'; img.removeAttribute('src'); }
};

/* ============================================================
   API LAYER — Jikan (free, keyless) with queue + cache
   ============================================================ */
const JIKAN='https://api.jikan.moe/v4';
let CACHE_OK=true;
try{ sessionStorage.setItem('__t','1'); sessionStorage.removeItem('__t'); }catch(e){ CACHE_OK=false }
const TTL=20*60*1000;
const memCache={};
function cget(k){
  if(CACHE_OK){ try{ const raw=sessionStorage.getItem(k); if(raw){ const o=JSON.parse(raw); if(Date.now()-o.t<TTL) return o.d; sessionStorage.removeItem(k); } }catch(e){} }
  return memCache[k];
}
function cset(k,v){
  memCache[k]=v;
  if(CACHE_OK){ try{
    sessionStorage.setItem(k,JSON.stringify({t:Date.now(),d:v}));
    const keys=Object.keys(sessionStorage);
    if(keys.length>260){ for(let i=0;i<20;i++){ const kk=keys[i]; if(kk!=='__t') sessionStorage.removeItem(kk); } }
  }catch(e){} }
}
let reqCount=0, cacheHits=0;
const Q=[]; let busy=false, lastAt=0;

/* circuit breakers — once a host is known unreachable, stop charging it the
   timeout price on every request. Tools answer in ~0.5s instead of 6s+. */
let jikanDownUntil=0;   /* skip Jikan entirely while inside this window */
let alCoolUntil=0;      /* AniList rate-limit cooldown */

function japi(path, params={}, opts={}){
  const url = JIKAN+path+'?'+new URLSearchParams(Object.assign({sfw:'true'},params));
  return new Promise((res,rej)=>{
    if(opts.cache!==false){ const hit=cget(url); if(hit){ cacheHits++; res(hit); return; } }
    if(Date.now()<jikanDownUntil){
      /* Jikan is known-unreachable → skip the queue and the timeout, answer from the fallback APIs */
      netState('fb');
      fallbackFor(path,params||{}).then(f=>{
        if(f&&f.data!=null){ cset(url,f); reqCount++; res(f); }
        else rej(new Error(L(S.offline)));
      },()=>rej(new Error(L(S.offline))));
      return;
    }
    Q.push({url,path,params,res,rej,tries:0,cache:opts.cache!==false,fb:opts.fallback!==false});
    pump();
  });
}
/* last provider that actually served a request (shown in the Doctor) */
let lastSource='jikan';
async function pump(){
  if(busy) return;
  const job=Q.shift(); if(!job) return;
  busy=true;
  try{
    const wait=Math.max(0,400-(Date.now()-lastAt));
    if(wait) await sleep(wait);
    if(job.cache){ const hit=cget(job.url); if(hit){ cacheHits++; job.res(hit); busy=false; return pump(); } }
    lastAt=Date.now(); reqCount++;
    const ctl=new AbortController(); const to=setTimeout(()=>ctl.abort(),3500);
    let r; try{ r=await fetch(job.url,{cache:'no-store',signal:ctl.signal}); }finally{ clearTimeout(to); }
    if(r.status===429){
      if(++job.tries<=2){ await sleep(1200); Q.unshift(job); }
      else { jikanDownUntil=Date.now()+20000; netState('slow'); await settle(job,'Rate limited by the free API — wait a second and retry.'); }
    } else if(r.status===404){
      const j=await r.json().catch(()=>({}));
      jikanDownUntil=0;
      job.res({data:null,pagination:null,notfound:true,message:j.error||'Not found'});
    } else if(!r.ok){
      if(++job.tries<=1){ await sleep(500); Q.unshift(job); }
      else { jikanDownUntil=Date.now()+60000; await settle(job,'API error '+r.status); }
    } else {
      const j=await r.json(); cset(job.url,j); netState('ok'); lastSource='jikan'; jikanDownUntil=0; job.res(j);
    }
  }catch(e){ jikanDownUntil=Date.now()+90000; netState('down'); await settle(job, L(S.offline)); }
  finally{ busy=false; setTimeout(pump,0); }
}
/* Resolve a failed job: try the free fallback APIs first, only then reject. */
async function settle(job, errMsg){
  if(job.fb && job.path){
    try{
      const f=await fallbackFor(job.path, job.params||{});
      if(f && f.data!=null){ cset(job.url,f); netState('fb'); job.res(f); return; }
    }catch(e2){ /* fallback also unreachable → fall through */ }
  }
  job.rej(new Error(errMsg));
}

/* ============================================================
   MULTI-API FALLBACK LAYER — every source below is free & keyless
   Primary: Jikan (MyAnimeList REST)
   Auto-fallbacks when Jikan is unreachable / rate-limited:
     • AniList GraphQL  — anime & manga, returns idMal (real MAL links)
     • MangaDex REST    — manga metadata, exposes MAL links
     • Scrape API       — manga-scrape-api.vercel.app (metadata only)
     • Kitsu REST       — anime metadata (last resort)
   Everything is normalized to Jikan's {data, pagination} shape so all
   60 tools keep working untouched.  News / reviews / user content has
   no keyless equivalent → returned as a clean empty list instead.
   ============================================================ */
const ALI='https://graphql.anilist.co';
const KITSU='https://kitsu.io/api/edge';
const MDX='https://api.mangadex.org';
const SCRAPE='https://manga-scrape-api.vercel.app/api/scrape';

const AL_MEDIA=`id idMal type format status description(asHtml:false) averageScore meanScore popularity favourites episodes chapters volumes source season seasonYear duration isAdult siteUrl title{romaji english native} coverImage{extraLarge large medium} bannerImage genres tags{name} startDate{year month day} endDate{year month day} studios(isMain:true){nodes{name}}`;

/* every fallback request is abort-bounded so a blocked host can never hang a tool */
function xfetch(url,opts,ms){
  const ctl=new AbortController();
  const t=setTimeout(()=>ctl.abort(),ms||8000);
  return fetch(url,Object.assign({},opts,{signal:ctl.signal})).finally(()=>clearTimeout(t));
}

function alStatus(s,kind){
  const A={RELEASING:'Currently Airing',FINISHED:'Finished Airing',NOT_YET_RELEASED:'Not yet aired',CANCELLED:'Cancelled',HIATUS:'On Hiatus'};
  const M={RELEASING:'Publishing',FINISHED:'Finished',NOT_YET_RELEASED:'Not yet published',CANCELLED:'Cancelled',HIATUS:'On Hiatus'};
  return (kind==='manga'?M:A)[s]||s||null;
}
function alToJikan(m,kind){
  if(!m) return null;
  const y=m.seasonYear||m.startDate?.year||null;
  const d=m.description?String(m.description).replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#039;|&apos;/g,"'"):null;
  return {
    mal_id:m.idMal||null,
    title:m.title?.romaji||m.title?.english||null,
    title_english:m.title?.english||null,
    title_japanese:m.title?.native||null,
    title_synonyms:[],
    images:{jpg:{image_url:m.coverImage?.large||null,large_image_url:m.coverImage?.extraLarge||m.coverImage?.large||null}},
    synopsis:d,
    type:m.format||null,
    episodes:m.episodes??null,
    chapters:m.chapters??null,
    volumes:m.volumes??null,
    status:alStatus(m.status,kind),
    score:m.averageScore?Math.round(m.averageScore)/10:null,
    scored_by:m.meanScore||null,
    rank:null,
    popularity:m.popularity||null,
    members:m.popularity||null,
    favorites:m.favourites||null,
    year:y,
    season:m.season?String(m.season).toLowerCase():null,
    source:m.source||null,
    duration:m.duration?m.duration+' min per ep':null,
    rating:m.isAdult?'R+ - Mild Nudity':null,
    url:m.idMal?('https://myanimelist.net/'+(kind==='manga'?'manga':'anime')+'/'+m.idMal):(m.siteUrl||null),
    genres:(m.genres||[]).map(g=>({name:g})),
    themes:(m.tags||[]).slice(0,6).map(t=>({name:t.name})),
    studios:(m.studios?.nodes||[]).map(s=>({name:s.name})),
    aired:{prop:{from:{year:m.startDate?.year||null,month:m.startDate?.month||null,day:m.startDate?.day||null}}},
    published:{prop:{from:{year:m.startDate?.year||null,month:m.startDate?.month||null,day:m.startDate?.day||null}}},
    trailer:m.trailer?.id?{youtube_id:m.trailer.id,url:'https://www.youtube.com/watch?v='+m.trailer.id}:null
  };
}
function alPageInfo(pi){
  return {current_page:pi.currentPage||1,last_visible_page:pi.lastPage||1,has_next_page:!!pi.hasNextPage,
    items:{count:pi.perPage||0,total:pi.total||0,per_page:pi.perPage||0}};
}
async function alGql(query,variables={}){
  if(Date.now()<alCoolUntil) throw new Error('AniList cooling down');
  const send=()=>xfetch(ALI,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({query,variables})},7000);
  let r=await send();
  /* AniList masks rate-limits as 404/429 — one calm retry, then back off for a while */
  if(r.status===404||r.status===429){ await new Promise(res=>setTimeout(res,1200)); r=await send(); }
  if(r.status===404||r.status===429){ alCoolUntil=Date.now()+15000; throw new Error('AniList busy'); }
  if(!r.ok) throw new Error('AniList '+r.status);
  const j=await r.json();
  if(j.errors&&j.errors.length) throw new Error(j.errors[0].message);
  lastSource='anilist';
  return j;
}
const alType=k=>k==='manga'?'MANGA':'ANIME';
const alSeasonOf=s=>({winter:'WINTER',spring:'SPRING',summer:'SUMMER',fall:'FALL'})[s]||'SPRING';
const alFormatOf=t=>({tv:'TV',movie:'MOVIE',ova:'OVA',special:'SPECIAL',ona:'ONA',music:'MUSIC'})[String(t||'').toLowerCase()]||null;

async function alSearch(kind,q,page=1,perPage=20){
  const query=`query($s:String,$t:MediaType,$p:Int,$pp:Int){Page(page:$p,perPage:$pp){pageInfo{currentPage hasNextPage lastPage total perPage}media(search:$s,type:$t,sort:SEARCH_MATCH){${AL_MEDIA}}}}`;
  const j=await alGql(query,{s:q,t:alType(kind),p:page,pp:perPage});
  const data=(j.data.Page.media||[]).map(m=>alToJikan(m,kind)).filter(x=>x&&x.title);
  return {data,pagination:alPageInfo(j.data.Page.pageInfo)};
}
async function alInfo(kind,id){
  const query=`query($m:Int,$t:MediaType){Media(idMal:$m,type:$t){${AL_MEDIA}}}`;
  const j=await alGql(query,{m:+id,t:alType(kind)});
  if(!j.data.Media) return {data:null,pagination:null,notfound:true};
  return {data:alToJikan(j.data.Media,kind),pagination:null};
}
async function alList(kind,sort,page=1,perPage=25,extra={}){
  const query=`query($t:MediaType,$p:Int,$pp:Int,$sort:[MediaSort],$g:[String],$f:MediaFormat,$ms:Int){Page(page:$p,perPage:$pp){pageInfo{currentPage hasNextPage lastPage total perPage}media(type:$t,sort:$sort,genre_in:$g,format:$f,averageScore_greater:$ms,isAdult:false){${AL_MEDIA}}}}`;
  /* null filter operators are illegal on AniList — omit unset variables entirely */
  const vars={t:alType(kind),p:page,pp:perPage,sort:[sort]};
  if(extra.g) vars.g=extra.g;
  if(extra.f) vars.f=extra.f;
  if(extra.ms!=null) vars.ms=extra.ms;
  const j=await alGql(query,vars);
  const data=(j.data.Page.media||[]).map(m=>alToJikan(m,kind)).filter(x=>x&&x.mal_id);
  return {data,pagination:alPageInfo(j.data.Page.pageInfo)};
}
async function alSeasonList(year,season,page=1,perPage=24){
  const query=`query($y:Int,$s:MediaSeason,$p:Int,$pp:Int){Page(page:$p,perPage:$pp){pageInfo{currentPage hasNextPage lastPage total perPage}media(type:ANIME,season:$s,seasonYear:$y,sort:POPULARITY_DESC,isAdult:false){${AL_MEDIA}}}}`;
  const j=await alGql(query,{y:+year,s:alSeasonOf(season),p:page,pp:perPage});
  const data=(j.data.Page.media||[]).map(m=>alToJikan(m,'anime')).filter(x=>x&&x.mal_id);
  return {data,pagination:alPageInfo(j.data.Page.pageInfo)};
}
async function alChars(kind,id){
  const query=`query($m:Int,$t:MediaType){Media(idMal:$m,type:$t){characters(perPage:40){edges{role node{id name{full native} image{large medium} favourites}}}}}`;
  const j=await alGql(query,{m:+id,t:alType(kind)});
  const edges=(j.data.Media&&j.data.Media.characters&&j.data.Media.characters.edges)||[];
  const data=edges.map(e=>({
    mal_id:e.node.id,
    character:{mal_id:e.node.id,name:e.node.name?.full,name_kanji:e.node.name?.native,
      images:{jpg:{image_url:e.node.image?.large||null}},favorites:e.node.favourites||0},
    role:e.role||null, favorites:e.node.favourites||0
  })).filter(x=>x.mal_id);
  return {data,pagination:null};
}
async function alRecs(kind,id){
  const query=`query($m:Int,$t:MediaType){Media(idMal:$m,type:$t){recommendations(perPage:24,sort:RATING_DESC){nodes{mediaRecommendation{${AL_MEDIA}}}}}}`;
  const j=await alGql(query,{m:+id,t:alType(kind)});
  const nodes=(j.data.Media&&j.data.Media.recommendations&&j.data.Media.recommendations.nodes)||[];
  const data=nodes.map(n=>n.mediaRecommendation).filter(x=>x&&x.idMal).map(x=>({entry:alToJikan(x,kind)}));
  return {data,pagination:null};
}
async function alCharSearch(q,perPage=12){
  const query=`query($s:String,$pp:Int){Page(perPage:$pp){pageInfo{currentPage hasNextPage lastPage total perPage}characters(search:$s){id name{full native} image{large} favourites}}}`;
  const j=await alGql(query,{s:q,pp:perPage});
  const data=((j.data.Page&&j.data.Page.characters)||[]).map(c=>({
    mal_id:c.id,name:c.name?.full,name_kanji:c.name?.native,favorites:c.favourites||0,
    images:{jpg:{image_url:c.image?.large||null}},url:'https://myanimelist.net/character/'+c.id
  })).filter(x=>x.mal_id);
  return {data,pagination:alPageInfo(j.data.Page.pageInfo)};
}
async function alExternal(kind,id){
  const query=`query($m:Int,$t:MediaType){Media(idMal:$m,type:$t){externalLinks{site url type}}}`;
  const j=await alGql(query,{m:+id,t:alType(kind)});
  const data=((j.data.Media&&j.data.Media.externalLinks)||[]).map(l=>({name:l.site,url:l.url}));
  return {data,pagination:null};
}
async function alStreaming(id){
  /* AniList retired streamingLinks — streamingEpisodes carries the licensed site names */
  const query=`query($m:Int){Media(idMal:$m,type:ANIME){streamingEpisodes{site title}}}`;
  const j=await alGql(query,{m:+id});
  const eps=(j.data.Media&&j.data.Media.streamingEpisodes)||[];
  const seen={}; const data=[];
  eps.forEach(e=>{ if(e&&e.site&&!seen[e.site]){ seen[e.site]=1; data.push({name:e.site,url:null,country:null}); } });
  return {data,pagination:null};
}
async function alPictures(id){
  const query=`query($m:Int){Media(idMal:$m,type:ANIME){bannerImage coverImage{extraLarge large medium}}}`;
  const j=await alGql(query,{m:+id});
  const m=j.data.Media||{};
  const imgs=[];
  [m.coverImage?.extraLarge,m.coverImage?.large,m.coverImage?.medium].filter(Boolean)
    .forEach(u=>imgs.push({jpg:{image_url:u,large_image_url:u},webp:{image_url:u,large_image_url:u}}));
  if(m.bannerImage) imgs.push({jpg:{image_url:m.bannerImage,large_image_url:m.bannerImage},webp:{image_url:m.bannerImage,large_image_url:m.bannerImage}});
  return {data:imgs,pagination:null};
}
/* AniList trailer as Jikan-shaped /videos payload → hub can embed without Jikan */
async function alVideos(id){
  const query=`query($m:Int){Media(idMal:$m,type:ANIME){id title{romaji english} trailer{id site}}}`;
  const j=await alGql(query,{m:+id});
  const M=j.data&&j.data.Media;
  if(!M) return {data:null,pagination:null,notfound:true};
  const promo=[];
  if(M.trailer&&M.trailer.id&&String(M.trailer.site||'youtube').toLowerCase()==='youtube'){
    promo.push({trailer_id:M.trailer.id,title:L({en:'Official trailer',ja:'公式予告編'}),
      url:'https://www.youtube.com/watch?v='+M.trailer.id});
  }
  return {data:{promo,filler:[],episode:[],music:[]},pagination:null};
}
async function alSchedule(filter,page=1){
  const days=['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
  const now=new Date(); const target=new Date(now);
  const idx=days.indexOf(String(filter||'').toLowerCase());
  if(idx>=0){ const cur=(now.getDay()+6)%7; target.setDate(now.getDate()+((idx-cur+7)%7)); }
  const start=new Date(target); start.setHours(0,0,0,0);
  const end=new Date(target); end.setHours(23,59,59,999);
  const query=`query($gt:Int,$lt:Int,$p:Int,$pp:Int){Page(page:$p,perPage:$pp){pageInfo{currentPage hasNextPage lastPage total perPage}airingSchedules(airingAt_greater:$gt,airingAt_lesser:$lt,sort:TIME){id airingAt episode media{id idMal title{romaji english native} format coverImage{large}}}}}`;
  const j=await alGql(query,{gt:Math.floor(start.getTime()/1000),lt:Math.floor(end.getTime()/1000),p:page,pp:50});
  const nodes=(j.data.Page&&j.data.Page.airingSchedules)||[];
  const data=nodes.filter(n=>n.media&&n.media.idMal).map(n=>({
    mal_id:n.media.idMal, title:n.media.title?.romaji, url:'https://myanimelist.net/anime/'+n.media.idMal,
    images:{jpg:{image_url:n.media.coverImage?.large||null}},
    aired:new Date(n.airingAt*1000).toISOString(), episode:n.episode,
    score:null, filler:false, promo:false, sponsored:false
  }));
  return {data,pagination:alPageInfo(j.data.Page.pageInfo)};
}
/* MAL's live genre taxonomy (ids verified against myanimelist.net/anime/genre/N).
   Used for the offline fallback list and to translate MAL ids → AniList genre names
   (AniList's genre_in only accepts its own string enum). Adult tags excluded. */
const MAL_GENRES=[[1,'Action'],[2,'Adventure'],[3,'Racing'],[4,'Comedy'],[5,'Avant Garde'],[6,'Mythology'],[7,'Mystery'],[8,'Drama'],[9,'Ecchi'],[10,'Fantasy'],[11,'Strategy Game'],[13,'Historical'],[14,'Horror'],[15,'Kids'],[17,'Martial Arts'],[18,'Mecha'],[19,'Music'],[20,'Parody'],[21,'Samurai'],[22,'Romance'],[23,'School'],[24,'Sci-Fi'],[25,'Shoujo'],[26,'Girls Love'],[27,'Shounen'],[28,'Boys Love'],[29,'Space'],[30,'Sports'],[31,'Super Power'],[32,'Vampire'],[35,'Harem'],[36,'Slice of Life'],[37,'Supernatural'],[38,'Military'],[39,'Detective'],[40,'Psychological'],[41,'Suspense'],[42,'Seinen'],[43,'Josei'],[46,'Award Winning'],[47,'Gourmet'],[48,'Workplace'],[50,'Adult Cast'],[51,'Anthropomorphic'],[52,'CGDCT'],[53,'Childcare'],[54,'Combat Sports'],[55,'Delinquents'],[56,'Educational'],[57,'Gag Humor'],[58,'Gore'],[59,'High Stakes Game'],[60,'Idols (Female)'],[61,'Idols (Male)'],[62,'Isekai'],[63,'Iyashikei'],[64,'Love Polygon'],[65,'Magical Sex Shift'],[66,'Mahou Shoujo'],[67,'Medical'],[68,'Organized Crime'],[69,'Otaku Culture'],[70,'Performing Arts'],[71,'Pets'],[72,'Reincarnation']];
/* AniList's MediaGenre enum — only these strings are safe to send */
const AL_GENRES=new Set(['Action','Adventure','Comedy','Drama','Ecchi','Fantasy','Horror','Mahou Shoujo','Mecha','Music','Mystery','Psychological','Romance','Sci-Fi','Slice of Life','Sports','Supernatural','Thriller']);
const MAL2AL={1:'Action',2:'Adventure',4:'Comedy',7:'Mystery',8:'Drama',9:'Ecchi',10:'Fantasy',14:'Horror',18:'Mecha',19:'Music',24:'Sci-Fi',30:'Sports',36:'Slice of Life',37:'Supernatural',40:'Psychological',41:'Thriller',66:'Mahou Shoujo'};
function alGenresParam(raw){
  const parts=String(raw||'').split(',').map(s=>s.trim()).filter(Boolean);
  const names=[];
  parts.forEach(s=>{
    if(/^\d+$/.test(s)){ const n=MAL2AL[+s]; if(n) names.push(n); }
    else if(AL_GENRES.has(s)) names.push(s);
  });
  return names.length?[...new Set(names)]:null;   /* unknown/adult tags drop cleanly */
}
function genresFallback(kind){
  lastSource='static';
  return {data:MAL_GENRES.map(([mal_id,name])=>({mal_id,name,count:0})),pagination:null};
}
/* --- MangaDex (MANGA ONLY, metadata) --- */
async function mdxSearch(q,page=1,perPage=20){
  const url=MDX+'/manga?title='+encodeURIComponent(q)+'&limit='+perPage+'&offset='+(page-1)*perPage+'&includes[]=cover_art&order[relevance]=desc&contentRating[]=safe&contentRating[]=suggestive';
  const r=await xfetch(url,{headers:{'Accept':'application/json'}},8000);
  if(!r.ok) throw new Error('MangaDex '+r.status);
  const j=await r.json(); lastSource='mangadex';
  const data=(j.data||[]).map(mdxToJikan).filter(Boolean);
  const total=j.total||data.length, last=Math.max(1,Math.ceil(total/perPage));
  return {data,pagination:{current_page:page,last_visible_page:last,has_next_page:page<last,items:{count:data.length,total,per_page:perPage}}};
}
function mdxMalId(links){
  if(!links) return null;
  let v=null;
  if(Array.isArray(links)){ const e=links.filter(x=>x&&x.type==='mal')[0]; v=e&&(e.url||e.id); }
  else if(typeof links==='object') v=links.mal;
  if(v==null) return null;
  const mm=String(v).match(/\/manga\/(\d+)/)||String(v).match(/^(\d+)$/);
  return mm?+mm[1]:null;
}
function mdxToJikan(m){
  if(!m) return null; const a=m.attributes||{};
  const title=a.title?.en||a.title?.['ja-ro']||Object.values(a.title||{})[0]||null;
  const desc=a.description?(typeof a.description==='string'?a.description:Object.values(a.description)[0]):null;
  const malId=mdxMalId(a.links);
  const cr=(m.relationships||[]).find(x=>x.type==='cover_art');
  const cover=cr?('https://uploads.mangadex.org/covers/'+m.id+'/'+cr.attributes?.fileName+'.512.jpg'):null;
  return {mal_id:malId,title,title_japanese:a.title?.ja||null,
    images:{jpg:{image_url:cover,large_image_url:cover}},
    synopsis:desc?String(desc).replace(/<[^>]+>/g,''):null,
    type:a.originalFormat?String(a.originalFormat).toLowerCase():'manga',
    status:a.status||null,chapters:null,volumes:null,year:a.year||null,
    genres:(a.tags||[]).slice(0,8).map(t=>({name:t.attributes?.name?.en})).filter(g=>g.name),
    members:null,score:null,published:{prop:{from:{year:a.year||null}}},
    url:malId?('https://myanimelist.net/manga/'+malId):(m.id?('https://mangadex.org/title/'+m.id):null)};
}
/* --- Scrape API (MANGA ONLY, metadata — never serves pages/streams) --- */
async function scrapeSearch(q){
  const url=SCRAPE+'/search?query='+encodeURIComponent(q)+'&provider=mangadex';
  const r=await xfetch(url,{headers:{'Accept':'application/json'}},8000);
  if(!r.ok) throw new Error('Scrape '+r.status);
  const j=await r.json(); lastSource='scrape';
  const data=(j.results||[]).slice(0,20).map(scrapeToJikan).filter(Boolean);
  return {data,pagination:{current_page:1,last_visible_page:1,has_next_page:false,items:{count:data.length,total:data.length,per_page:20}}};
}
function scrapeToJikan(s){
  if(!s) return null;
  return {mal_id:null,title:s.title||s.name||null,
    images:{jpg:{image_url:s.image||null,large_image_url:s.image||null}},
    synopsis:s.description?String(s.description).replace(/<[^>]+>/g,''):null,
    type:s.subtype||'manga',status:s.status||null,chapters:null,volumes:null,
    genres:(s.genres||[]).map(g=>({name:typeof g==='string'?g:(g.name||g.title||'')})).filter(g=>g.name),
    members:null,score:null,published:{prop:{from:{}}},
    url:s.url||null,_scrapeId:s.id||null,_provider:s.provider||null};
}
/* --- Kitsu (ANIME metadata, last resort — no MAL id, card falls back to MAL search) --- */
async function kitsuSearch(q,page=1,perPage=20){
  /* Kitsu caps page[limit] at 20 — larger requests are rejected with a 400 */
  const lim=Math.min(20,+perPage||20);
  const url=KITSU+'/anime?filter[text]='+encodeURIComponent(q)+'&page[limit]='+lim+'&page[offset]='+((page-1)*lim)+'&sort=-favoritesCount';
  const r=await xfetch(url,{headers:{'Accept':'application/vnd.api+json'}},8000);
  if(!r.ok) throw new Error('Kitsu '+r.status);
  const j=await r.json(); lastSource='kitsu';
  const data=(j.data||[]).map(kitsuToJikan).filter(Boolean);
  const total=(j.meta&&j.meta.count)||data.length, last=Math.max(1,Math.ceil(total/lim));
  return {data,pagination:{current_page:page,last_visible_page:last,has_next_page:page<last,items:{count:data.length,total,per_page:lim}}};
}
/* browse / charts / season fallback — Kitsu is CORS-friendly and not rate-limited */
async function kitsuList(kind,sort='top',page=1,perPage=25,status){
  const lim=Math.min(20,+perPage||20);   /* Kitsu rejects page[limit] above 20 */
  const edge=kind==='manga'?'/manga':'/anime';
  const s=sort==='old'?'startDate':sort==='new'?'-startDate':sort==='pop'?'-favoritesCount':'-averageRating';
  const st=status?'&filter[status]='+status:'';
  const url=KITSU+edge+'?sort='+s+st+'&page[limit]='+lim+'&page[offset]='+((page-1)*lim);
  const r=await xfetch(url,{headers:{'Accept':'application/vnd.api+json'}},7000);
  if(!r.ok) throw new Error('Kitsu '+r.status);
  const j=await r.json(); lastSource='kitsu';
  const data=(j.data||[]).map(kitsuToJikan).filter(Boolean);
  const total=(j.meta&&j.meta.count)||data.length, last=Math.max(1,Math.ceil(total/lim));
  return {data,pagination:{current_page:page,last_visible_page:last,has_next_page:page<last,items:{count:data.length,total,per_page:lim}}};
}
function kitsuToJikan(k){
  if(!k) return null; const a=k.attributes||{};
  const title=a.canonicalTitle||a.titles?.en_jp||a.titles?.en||null;
  const poster=a.posterImage?.original||a.posterImage?.large||a.posterImage?.medium||null;
  const syn=(a.synopsis||a.description||'')?String(a.synopsis||a.description).replace(/<[^>]+>/g,''):null;
  const y=a.startDate?Number(String(a.startDate).slice(0,4)):null;
  const st={current:'Currently Airing',finished:'Finished Airing',tba:'Not yet aired'}[a.status]||a.status||null;
  return {mal_id:null,title,title_japanese:a.titles?.ja_jp||null,
    images:{jpg:{image_url:poster,large_image_url:poster}},synopsis:syn,
    type:a.showType||null,episodes:a.episodeCount||null,status:st,
    score:a.averageRating?Math.round(a.averageRating)/10:null,
    members:a.userCount||null,favorites:a.favoritesCount||null,year:y,
    genres:[],studios:[],url:null,
    aired:{prop:{from:{year:y}}},published:{prop:{from:{year:y}}}};
}
/* --- Kitsu characters (browser-friendly; used when AniList is cooling down) --- */
async function kitsuCharSearch(q,perPage=12){
  const lim=Math.min(20,+perPage||12);   /* Kitsu rejects page[limit] above 20 */
  const url=KITSU+'/characters?filter[name]='+encodeURIComponent(q)+'&page[limit]='+lim;
  const r=await xfetch(url,{headers:{'Accept':'application/vnd.api+json'}},7000);
  if(!r.ok) throw new Error('Kitsu '+r.status);
  const j=await r.json(); lastSource='kitsu';
  const data=(j.data||[]).map(c=>{ const a=c.attributes||{};
    const img=a.image&&(a.image.original||a.image.large||a.image.medium)||null;
    return {mal_id:null,name:a.name||((a.names||{}).en)||null,name_kanji:(a.names||{}).ja||null,
      favorites:null,url:null,images:{jpg:{image_url:img}}};
  }).filter(x=>x&&x.name);
  const total=(j.meta&&j.meta.count)||data.length;
  return {data,pagination:{current_page:1,last_visible_page:1,has_next_page:false,items:{count:data.length,total,per_page:perPage}}};
}
/* first source that answers wins; null when every source fails */
async function firstOf(fns){
  for(const fn of fns){
    try{ const r=await fn(); if(r&&r.data!=null) return r; }catch(e){}
  }
  return null;
}
/* run fn over arr with bounded concurrency — keeps fallback storms polite */
async function mapLimit(arr, limit, fn){
  const out=new Array(arr.length); let i=0;
  const worker=async()=>{ for(;;){ const k=i++; if(k>=arr.length) return;
    try{ out[k]=await fn(arr[k],k); }catch(e){ out[k]=null; } } };
  await Promise.all(Array.from({length:Math.max(1,Math.min(limit,arr.length))},worker));
  return out;
}
/* --- dispatcher --- */
async function fallbackFor(path,params={}){
  const seg=String(path).split('/').filter(Boolean);
  const page=+(params.page||1), limit=+(params.limit||24);
  if(!seg.length) return null;
  if(seg[0]==='genres') return genresFallback(seg[1]||'anime');
  if(seg[0]==='top'){
    const k=seg[1]==='manga'?'manga':'anime';
    const flt=params.filter;
    return (await firstOf([
      ()=>alList(k,'SCORE_DESC',page,+(params.limit||25)),
      ()=>kitsuList(k,flt==='upcoming'?'new':'top',page,+(params.limit||25),flt==='upcoming'?'tba':null)
    ]))||{data:[],pagination:null};
  }
  if(seg[0]==='seasons'){
    if(seg[1]==='now') return (await firstOf([
        ()=>alList('anime','TRENDING_DESC',page,limit),
        ()=>kitsuList('anime','pop',page,limit,'current')
      ]))||{data:[],pagination:null};
    return alSeasonList(+seg[1],seg[2],page,limit);
  }
  if(seg[0]==='characters'){
    const q=params.q||'', lim=+(params.limit||12);
    return (await firstOf([()=>alCharSearch(q,lim),()=>kitsuCharSearch(q,lim)]))||{data:[],pagination:null};
  }
  if(seg[0]==='schedules') return alSchedule(params.filter,page);
  if(seg[0]==='watch') return {data:[],pagination:null};
  if(seg[0]==='anime'||seg[0]==='manga'){
    const kind=seg[0];
    if(seg.length===1){
      if(params.q) return fbList(kind,params,page,limit);
      /* every browse shape gets Kitsu as a live second opinion */
      /* Jikan's popularity ASC is useless for cards (least-popular first) and
         AniList rejects POPULARITY_ASC outright — always browse from the popular end */
      if(params.order_by==='popularity') return (await firstOf([
          ()=>alList(kind,'POPULARITY_DESC',page,limit),
          ()=>kitsuList(kind,'pop',page,limit)
        ]))||{data:[],pagination:null};
      if(params.genres||params.type||params.min_score) return (await firstOf([
          ()=>alList(kind,'SCORE_DESC',page,limit,{
            g:alGenresParam(params.genres),
            f:alFormatOf(params.type),
            ms:params.min_score?Math.round(+params.min_score*10):null
          }),
          ()=>kitsuList(kind,'top',page,limit)
        ]))||{data:[],pagination:null};
      return (await firstOf([
          ()=>alList(kind,'SCORE_DESC',page,limit),
          ()=>kitsuList(kind,'top',page,limit)
        ]))||{data:[],pagination:null};
    }
    const id=+seg[1], sub=seg[2];
    if(!sub||sub==='full') return alInfo(kind,id);
    if(sub==='characters') return alChars(kind,id);
    if(sub==='recommendations') return alRecs(kind,id);
    if(sub==='external') return alExternal(kind,id);
    if(sub==='streaming') return alStreaming(id);
    if(sub==='pictures') return alPictures(id);
    if(sub==='videos') return alVideos(id);                          /* trailer embed (AniList) */
    return {data:[],pagination:null};  /* news · reviews · episodes · stats → clean empty */
  }
  return null;   /* unknown shape → reject with the normal error box */
}
async function fbList(kind,params,page,limit){
  if(Date.now()>=alCoolUntil){ try{ return await alSearch(kind,params.q,page,limit); }catch(e){} }
  if(kind==='manga'){
    try{ return await mdxSearch(params.q,page,limit); }catch(e){}
    try{ return await scrapeSearch(params.q); }catch(e){}
  }
  try{ return await kitsuSearch(params.q,page,limit); }catch(e){}
  return {data:[],pagination:null};
}

/* ---------------- Connection Doctor ---------------- */
let docState='ok', docMs=0;
function netState(s){
  docState=s;
  const d=$('#doctorDot'); if(d) d.className='dot '+s;
  paintDoctor();
}
function paintDoctor(){
  const t=$('#doctorTxt'); if(!t) return;
  t.textContent = L(S.doctor) + (docState==='ok'&&docMs? ' · '+docMs+'ms'
    : docState==='down'?' · '+L({en:'offline',ja:'切断'})
    : docState==='slow'?' · '+L({en:'slow',ja:'低速'})
    : docState==='fb'?' · '+L({en:'fallback API',ja:'代替API使用'}):'');
}
/* ---- free, keyless APIs wired into the site (pinged by the Doctor) ---- */
function pingTo(p,ms){
  return Promise.race([
    p.catch(e=>({ok:false,ms:-1,err:String((e&&e.message)||e)})),
    new Promise(r=>setTimeout(()=>r({ok:false,ms:-2,err:'timeout'}),ms||7000))
  ]);
}
const API_SOURCES=[
  {id:'jikan',name:'Jikan API (MyAnimeList)',host:'api.jikan.moe',group:'primary',note:{en:'primary data source · 3 req/s',ja:'主要データソース · 3req/秒'},
   ping:()=>{ const ctl=new AbortController(); const t=setTimeout(()=>ctl.abort(),2500); const t0=performance.now();
     return fetch(JIKAN+'/anime/1?sfw=true',{cache:'no-store',signal:ctl.signal})
       .then(r=>{ jikanDownUntil=0; return {ok:r.ok,ms:Math.round(performance.now()-t0)}; })
       .catch(()=>{ jikanDownUntil=Date.now()+90000; return {ok:false,ms:-1}; })
       .finally(()=>clearTimeout(t)); }},
  {id:'anilist',name:'AniList GraphQL',host:'graphql.anilist.co',group:'fallback',note:{en:'anime + manga · search, info, cast, recs',ja:'アニメ＋漫画 · 検索/詳細/声優/類似'},
   ping:()=>{const t=performance.now();return fetch(ALI,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:'{Media(id:1){id idMal}}'}),cache:'no-store'}).then(r=>r.json().catch(()=>({})).then(j=>({ok:r.ok&&!!j.data,ms:Math.round(performance.now()-t)})))}},
  {id:'mangadex',name:'MangaDex',host:'api.mangadex.org',group:'fallback',note:{en:'manga metadata · official MAL links',ja:'漫画メタデータ · MAL正規リンク'},
   ping:()=>{const t=performance.now();return fetch(MDX+'/manga?limit=1',{cache:'no-store'}).then(r=>({ok:r.ok,ms:Math.round(performance.now()-t)}))}},
  {id:'scrape',name:'Manga Scraper API',host:'manga-scrape-api.vercel.app',group:'fallback',note:{en:'your fallback · metadata only, no pages',ja:'ご指定の代替 · メタデータのみ'},
   ping:()=>{const t=performance.now();return fetch(SCRAPE+'/search?query=a&provider=mangadex',{cache:'no-store'}).then(r=>({ok:r.ok,ms:Math.round(performance.now()-t)}))}},
  {id:'kitsu',name:'Kitsu',host:'kitsu.io/api/edge',group:'fallback',note:{en:'anime search · final safety net',ja:'アニメ検索 · 最終保险'},
   ping:()=>{const t=performance.now();return fetch(KITSU+'/anime?filter[text]=a&page[limit]=1',{cache:'no-store'}).then(r=>({ok:r.ok,ms:Math.round(performance.now()-t)}))}},
  {id:'animethemes',name:'AnimeThemes',host:'api.animethemes.moe',group:'asset',note:{en:'opening / ending theme lookup',ja:'OP/EDテーマ検索'},
   ping:()=>{const t=performance.now();return fetch('https://api.animethemes.moe/anime?q=Frieren',{cache:'no-store'}).then(r=>({ok:r.ok,ms:Math.round(performance.now()-t)}))}},
  {id:'ghibli',name:'Studio Ghibli API',host:'ghibliapi.vercel.app',group:'asset',note:{en:'Ghibli film metadata',ja:'ジブリ作品データ'},
   ping:()=>{const t=performance.now();return fetch('https://ghibliapi.vercel.app/films?limit=1',{cache:'no-store'}).then(r=>({ok:r.ok,ms:Math.round(performance.now()-t)}))}},
  {id:'nekosbest',name:'NekosBest',host:'nekos.best',group:'asset',note:{en:'neko images + GIFs',ja:'ネコ画像＋GIF'},
   ping:()=>{const t=performance.now();return fetch('https://nekos.best/api/v2/neko',{cache:'no-store'}).then(r=>({ok:r.ok,ms:Math.round(performance.now()-t)}))}},
  {id:'nekoslife',name:'NekosLife',host:'nekos.life',group:'asset',note:{en:'SFW artwork · works without CORS issues',ja:'イラスト · CORS問題なし'},
   ping:()=>{const t=performance.now();return fetch('https://nekos.life/api/v2/img/neko',{cache:'no-store'}).then(r=>({ok:r.ok,ms:Math.round(performance.now()-t)}))}},
  {id:'malcdn',name:'MAL Image CDN',host:'cdn.myanimelist.net',group:'asset',note:{en:'cover art delivery',ja:'カバー画像配信'},
   ping:()=>new Promise(res=>{const t=performance.now();const im=new Image();im.onload=()=>res({ok:true,ms:Math.round(performance.now()-t)});im.onerror=()=>res({ok:false,ms:-1});im.src='https://cdn.myanimelist.net/images/anime/10/18793.jpg';setTimeout(()=>res({ok:false,ms:-2}),6000)})},
  {id:'openverse',name:'Openverse',host:'api.openverse.org',group:'asset',to:12000,note:{en:'wallpaper photos · CC, commercial use',ja:'壁紙写真 · CC・商用可'},
   ping:()=>{const t=performance.now();return fetch('https://api.openverse.org/v1/images/?q=Japan&page_size=1',{cache:'no-store'}).then(r=>({ok:r.ok,ms:Math.round(performance.now()-t)}))}}
];
/* human-facing docs links for the credits footer */
API_SOURCES.forEach(s=>{ s.url=s.url||({
  jikan:'https://jikan.moe/docs/v4',anilist:'https://docs.anilist.co',mangadex:'https://api.mangadex.org/docs',
  scrape:'https://manga-scrape-api.vercel.app',kitsu:'https://kitsu.io/docs/api',animethemes:'https://animethemes.moe',
  ghibli:'https://ghibliapi.vercel.app',nekosbest:'https://nekos.best',
  nekoslife:'https://nekos.life',malcdn:'https://myanimelist.net',
  openverse:'https://openverse.org/developers'
})[s.id]||('https://'+s.host); });
async function pingAll(){
  const out={};
  await Promise.all(API_SOURCES.map(async s=>{ out[s.id]=await pingTo(Promise.resolve().then(()=>s.ping()),s.to||7500); }));
  return out;
}
async function doctorCheck(){
  const t0=performance.now();
  let jikanDown=false;
  try{
    /* short probe — it also primes the circuit breaker so tools never wait on a dead Jikan */
    const ctl=new AbortController(); const to=setTimeout(()=>ctl.abort(),2500);
    let r; try{ r=await fetch(JIKAN+'/anime/1?sfw=true',{cache:'no-store',signal:ctl.signal}); }finally{ clearTimeout(to); }
    docMs=Math.round(performance.now()-t0);
    netState(r.ok ? (docMs<900?'ok':'slow') : 'down');
    if(!r.ok){ jikanDown=true; jikanDownUntil=Date.now()+90000; }
    else { lastSource='jikan'; jikanDownUntil=0; }
  }catch(e){ netState('down'); jikanDown=true; jikanDownUntil=Date.now()+90000; }
  if(jikanDown){
    /* if any fallback layer is alive, the site still works — report 'fb', not 'down' */
    let ok=false;
    const probe=async(url,opts)=>{ const ctl=new AbortController(); const to=setTimeout(()=>ctl.abort(),3000);
      try{ const r=await fetch(url,Object.assign({cache:'no-store',signal:ctl.signal},opts||{})); return !!r.ok; }catch(e){ return false; }finally{ clearTimeout(to); } };
    ok=await probe(ALI,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:'{Media(id:1){id}}'})});
    if(!ok) ok=await probe(MDX+'/manga?limit=1');
    if(!ok) ok=await probe(KITSU+'/anime/1');
    if(ok) netState('fb');
  }
  paintDoctor();
  return {ms:docMs,state:docState};
}
function openDoctor(){
  const {open}=openModal({emoji:'🩺',title:L({en:'Connection Doctor',ja:'接続診断'}),sub:L({en:'Free API health check',ja:'無料APIヘルスチェック'})});
  const grid=h('div.doc-grid');
  const foot=h('div.row',
    btn(L({en:'Re-check now',ja:'再チェック'}),'gold',async e=>{ e.target.disabled=true; await render(); e.target.disabled=false; }),
    btn(L({en:'Clear cache',ja:'キャッシュ削除'}),'',()=>{ try{sessionStorage.clear()}catch(e){} for(const k in memCache) delete memCache[k]; toast('🧹 <b>Cache cleared</b>'); })
  );
  open([h('p.hint',{html:L({en:'Pings every free, keyless API this site uses. When the primary Jikan API fails, AniList → MangaDex → Scrape API → Kitsu take over automatically — no keys, no sign-up.',ja:'サイトが使う全の無料・キー不要APIにping。主要Jikanが落ちると AniList → MangaDex → Scrape API → Kitsu が自動で代役。キー・登録不要。'})}), grid], foot);
  render();
  async function render(){
    clear(grid);
    grid.appendChild(h('div.busy',h('div.spinner'),L({en:'Scanning all APIs…',ja:'全APIをスキャン中…'})));
    const res=await doctorCheck();
    const st=await pingAll();
    clear(grid);
    const badge=(r)=>{
      if(!r) return h('span.st.badge',L({en:'…',ja:'…'}));
      if(r.ok) return h('span.st.badge '+(r.ms<900?'green':r.ms<2500?'gold':'red'),r.ms+'ms');
      return h('span.st.badge red',L({en:'unreachable',ja:'応答なし'}));
    };
    const grp=(title,sub)=>{
      grid.appendChild(h('div.doc-row',{style:'margin-top:8px'},
        h('span',{html:'<b>'+title+'</b>'+(sub?' <span class="hint" style="font-weight:400">· '+sub+'</span>':'')})));
    };
    const line=(s)=>{
      const live=s.id==='jikan'?(res.state==='ok'?{ok:true,ms:res.ms}:st.jikan):st[s.id];
      grid.appendChild(h('div.doc-row',
        h('span',{html:'<b>'+s.name+'</b> <span class="hint">· '+s.host+'</span><br><span class="hint">'+L(s.note)+'</span>'}),
        badge(live)));
    };
    grp(L({en:'PRIMARY',ja:'主要'}), null);
    API_SOURCES.filter(s=>s.group==='primary').forEach(line);
    grp(L({en:'AUTOMATIC FALLBACKS',ja:'自動フォールバック'}), L({en:'used when Jikan is down',ja:'Jikan停止時に使用'}));
    API_SOURCES.filter(s=>s.group==='fallback').forEach(line);
    grp(L({en:'SUPPORTING FREE APIs',ja:'補助無料API'}), null);
    API_SOURCES.filter(s=>s.group==='asset').forEach(line);

    const okCount=API_SOURCES.filter(s=>(s.id==='jikan'?res.state!=='down':st[s.id]&&st[s.id].ok)).length;
    grid.appendChild(h('div.doc-row',{style:'margin-top:10px'},
      h('span',{html:'<b>'+L({en:'Currently serving',ja:'現在の稼働ソース'})+'</b>'}),
      h('span.st.badge blue',(lastSource==='jikan'&&docState==='fb')
        ? L({en:'Auto fallbacks (Jikan unreachable)',ja:'自動フォールバック（Jikan応答不能）'})
        : ({jikan:'Jikan',anilist:'AniList',mangadex:'MangaDex',scrape:'Scrape API',kitsu:'Kitsu',nekoslife:'nekos.life',static:'Built-in'})[lastSource]||lastSource)));
    grid.appendChild(h('div.doc-row',
      h('span',{html:'<b>'+L({en:'APIs reachable',ja:'到達可能なAPI'})+'</b>'}),
      h('span.st.badge '+(okCount>=(API_SOURCES.length-3)?'green':'gold'),okCount+' / '+API_SOURCES.length)));
    /* plain-language verdict so a blocked host never reads as a site outage */
    const dataIds=['jikan','anilist','mangadex','scrape','kitsu'];
    const dataOk=dataIds.some(id=>id==='jikan'?res.state!=='down':st[id]&&st[id].ok);
    if(okCount<API_SOURCES.length) grid.appendChild(h('div.doc-row',{style:'margin-top:6px'},
      h('span',{html: dataOk
        ? '<b style="color:#8fd48a">'+L({en:'Core data is healthy',ja:'主要データは正常'})+'</b> <span class="hint">· '+L({en:'the unreachable hosts above are usually blocked by strict Wi-Fi or an adblocker — every tool keeps working through the fallbacks.',ja:'上記の応答なしホストは、厳格なWi-Fiや広告ブロックによる遮断がほとんどです。全ツールは代替経路で動作し続けます。'})+'</span>'
        : '<b style="color:#ff9d8a">'+L({en:'All core APIs unreachable',ja:'主要APIが全て応答なし'})+'</b> <span class="hint">· '+L({en:'check your connection or VPN, then press Re-check.',ja:'接続やVPNを確認して「再チェック」を押してください。'})+'</span>'})));
    grid.appendChild(h('div.doc-row',h('span',{html:'<b>'+L({en:'Cached responses',ja:'キャッシュ済レスポンス'})+'</b>'}),h('span.st.badge',String(cacheHits))));
    grid.appendChild(h('div.doc-row',h('span',{html:'<b>'+L({en:'Live requests this session',ja:'今回セッションの実リクエスト'})+'</b>'}),h('span.st.badge',String(reqCount))));
    grid.appendChild(h('div.doc-row',h('span',{html:'<b>'+L({en:'Queue depth',ja:'キュー'})+'</b>'}),h('span.st.badge',String(Q.length))));
    grid.appendChild(h('div.doc-row',h('span',{html:'<b>'+L({en:'Rate limit',ja:'レート制限'})+'</b>'}),h('span.st.badge blue',L({en:'3/s · 60/min (auto-throttled)',ja:'3/秒・60/分（自動制御）'}))));
    if(res.state==='down') grid.appendChild(h('div.errbox',
      L({en:'Jikan is unreachable right now — the fallback APIs above will carry every tool. Nothing is broken.',ja:'Jikanに接続できません — 上記の代替APIが全ツールを担います。破損はありません。'}),
      btn(L(S.retry),'primary',()=>{clear(grid);render()})));
  }
}

/* ============================================================
   MODAL SYSTEM
   ============================================================ */
const modalStack=[];
function openModal({emoji,title,sub,foot}){
  const bd=h('div.modal-backdrop');
  const body=h('div.modal-body');
  const titleEl=h('div.m-title',title);
  const closeBtn=h('button.m-close',{title:L({en:'Close',ja:'閉じる'}),'aria-label':'Close',html:ico('x'),onclick:close});
  const head=h('div.modal-head', h('span.m-emoji',{html:icoh(emoji||'')}), h('div',titleEl, sub?h('div.m-sub',sub):null), closeBtn);
  const modal=h('div.modal',head,body);
  if(foot) modal.appendChild(h('div.modal-foot',foot));
  bd.appendChild(modal);
  bd.addEventListener('mousedown',e=>{ if(e.target===bd) close(); });
  $('#modalRoot').appendChild(bd);
  const rec={bd,close};
  modalStack.push(rec);
  document.body.style.overflow='hidden';
  function close(){
    if(typeof MDK!=='undefined') MDK.reattach(bd);
    bd.style.animation='fadeIn .15s reverse';
    setTimeout(()=>bd.remove(),130);
    document.querySelectorAll('.canvas-fs').forEach(e=>e.remove());
    const i=modalStack.indexOf(rec); if(i>-1) modalStack.splice(i,1);
    if(!modalStack.length) document.body.style.overflow='';
  }
  return {open(nodes,footEl){ (Array.isArray(nodes)?nodes.flat():[nodes]).forEach(n=>n&&body.appendChild(n)); if(footEl){ let f=modal.querySelector('.modal-foot'); if(!f){f=h('div.modal-foot'); modal.appendChild(f);} clear(f); (Array.isArray(footEl)?footEl.flat():[footEl]).forEach(n=>n&&f.appendChild(n)); } },body,close,setTitle(t,ju){titleEl.textContent=t; if(sub) head.querySelector('.m-sub').textContent=ju||sub;}};
}
function closeTop(){ if(modalStack.length) modalStack[modalStack.length-1].close(); }

/* ============================================================
   WATCHLIST STORE
   ============================================================ */
const WL={
  d:store.get('azt_wl',{}),
  save(){ store.set('azt_wl',this.d); paintWatchBtn(); },
  add(m,st='planned'){
    if(!m||!m.mal_id) return;
    this.d[m.mal_id]={id:m.mal_id,t:m.title,r:m.title_romaji,jp:m.title_japanese,img:m.images?.jpg?.image_url||m.image_url,st,score:null,mal:m.score||null,ep:0,eps:m.episodes||null,added:Date.now()};
    this.save(); toast('＋ <b>'+esc(m.title)+'</b> → '+L({en:'watchlist',ja:'視聴リスト'}));
  },
  rm(id){ delete this.d[id]; this.save(); },
  has(id){ return !!this.d[id]; },
  list(){ return Object.values(this.d).sort((a,b)=>b.added-a.added); },
  patch(id,p){ if(this.d[id]){ Object.assign(this.d[id],p); this.save(); } }
};
function paintWatchBtn(){ const b=$('#heroWatch'); if(b) b.innerHTML=ico('plus')+' <span>'+L(S.myWatchlist)+'</span> <b>('+WL.list().length+')</b>'; }

/* ============================================================
   SHARED UI WIDGETS (used by tools1.js / tools2.js)
   ============================================================ */
function btn(label,cls,onclick){ return h('button.btn.'+(cls||''),{type:'button',onclick,html:labelHTML(label)}); }
function btnI(label,title,cls,onclick){ return h('button.btn.small.'+(cls||''),{type:'button',title,html:labelHTML(label),onclick}); }
function panel(title,...nodes){ return h('div.panel', h('div.panel-title',title), ...nodes); }
function field(label,node,hint){ return h('div.field', h('label.label',label), node, hint?h('div.hint',hint):null); }
function inp(attrs){ return h('input.inp',Object.assign({type:'text'},attrs)); }
function selEl(options,value){ const s=h('select.inp'); options.forEach(o=>{ const v=typeof o==='string'?o:o.v; const t=typeof o==='string'?o:o.t; s.appendChild(h('option',{value:v,selected:String(value)===String(v)},t)); }); return s; }
function chipset(items,{multi=false,onchange}={}){
  const state=new Set();
  const el=h('div.chipset');
  items.forEach(it=>{
    const c=h('button.tchip',{type:'button',html:labelHTML(it.t),onclick:()=>{
      if(multi){ state.has(it.v)?state.delete(it.v):state.add(it.v); c.classList.toggle('on'); }
      else{ state.clear(); state.add(it.v); [...el.children].forEach(x=>x.classList.remove('on')); c.classList.add('on'); }
      onchange&&onchange([...state]);
    }});
    if(it.on){ state.add(it.v); c.classList.add('on'); }
    el.appendChild(c);
  });
  return {el,state,get:()=>[...state],clear(){ state.clear(); [...el.children].forEach(x=>x.classList.remove('on')); }};
}
function spinner(){ return h('div.spinner'); }
function busyBox(msg){ return h('div.busy',spinner(),msg||L(S.loading)); }
function skelGrid(n=6){ const g=h('div.skel-grid'); for(let i=0;i<n;i++) g.appendChild(h('div.skel')); return g; }
function errBox(msg,retry){
  return h('div.errbox', h('div',{html:icoh('⚠️')+' '+esc(msg||L(S.err))}), retry?btn(L(S.retry),'primary',retry):null);
}
function emptyBox(msg,big){ return h('div.empty', h('div.big',{html:icoh(big||'')}), h('div',msg||L(S.noRes)), h('div.hint',L(S.noResD))); }
async function withBusy(region,fn){
  clear(region); region.appendChild(busyBox());
  try{ await fn(region); }
  catch(e){ clear(region); region.appendChild(errBox(e&&e.message,()=>withBusy(region,fn))); }
}
function pager(pagi,onGo){
  if(!pagi) return null;
  const cur=pagi.current_page||1, last=pagi.last_visible_page||pagi.total_pages||1;
  if(last<=1 && !pagi.has_next_page) return null;
  const bar=h('div.pager');
  const info=h('span.pinfo',L(S.page)+' '+cur+' / '+last);
  const prev=btn('‹ '+L(S.prev),'',()=>onGo(cur-1));
  const next=btn(L(S.next)+' ›','',()=>onGo(cur+1));
  prev.disabled=cur<=1; next.disabled=!pagi.has_next_page;
  bar.append(prev,info,next);
  return bar;
}
function scoreBadge(m){
  const s=m.score||m.rank;
  if(!s) return null;
  return h('span.badge.gold',{html:'★ '+(Math.round(s*10)/10)});
}

/* ---------------- media card (anime / manga) ---------------- */
function mediaCard(m,opts={}){
  const kind=opts.kind||'anime';
  /* highest resolution first — extraLarge covers are never pixelated */
  const img=m.images?.jpg?.large_image_url||m.images?.webp?.large_image_url||m.images?.jpg?.image_url||m.image_url;
  const title=m.title||m.name||'—';
  const year=m.year||m.aired?.prop?.from?.year||m.published?.prop?.from?.year||'';
  const meta=[m.type,year,m.episodes?m.episodes+' ep':'',m.status].filter(Boolean);
  const card=h('article.acard');
  if(opts.rank) card.appendChild(h('span.rank-num',opts.rank>999?'★':String(opts.rank)));
  if(img) card.appendChild(h('img.ac-thumb.zoomable',{src:img,loading:'lazy',alt:title,decoding:'async',onerror(){this.style.visibility='hidden'}}));
  const acts=h('div.ac-actions');
  const actions=opts.actions||['info','watch','similar','source'];
  if(actions.includes('info'))  acts.appendChild(btnI('ℹ️',L(S.info),'',()=>openInfo(m,kind)));
  if(actions.includes('watch')&&m.mal_id) acts.appendChild(btnI('＋ '+L(S.watch),L(S.watch), WL.has(m.mal_id)?'gold':'', ()=>WL.add(m)));
  if(actions.includes('similar')&&m.mal_id) acts.appendChild(btnI('⇄ '+L(S.similar),L(S.similar),'',()=>openTool(kind==='manga'?'sim-manga':'similar',{q:title,id:m.mal_id})));
  if(actions.includes('source')) acts.appendChild(btnI('🔗',L(S.source),'',()=>window.open(
    m.mal_id?('https://myanimelist.net/'+kind+'/'+m.mal_id):('https://myanimelist.net/'+kind)+'/?q='+encodeURIComponent(title||''),
    '_blank','noopener')));
  if(opts.extraActions) opts.extraActions(m,acts);
  card.appendChild(h('div.ac-body',
    h('div.ac-title',title),
    LANG==='ja'&&m.title_japanese?h('div.ac-ja',m.title_japanese):(m.title_romaji&&m.title_romaji!==title?h('div.ac-ja',m.title_romaji):null),
    h('div.ac-meta',meta.join(' · '),scoreBadge(m)),
    opts.snip!==false&&m.synopsis?h('div.ac-snip',m.synopsis.replace(/\[Written by MAL Rewrite\]/g,'').slice(0,180)+'…'):null,
    acts
  ));
  return card;
}
function renderList(container,items,opts={}){
  clear(container);
  if(!items||!items.length){ container.appendChild(emptyBox(opts.emptyMsg)); return; }
  const g=h('div.results');
  items.forEach((m,i)=>g.appendChild(m?mediaCard(m,opts):null));
  container.appendChild(g);
}

/* ---------------- generic info popover ---------------- */
function openInfo(m,kind='anime'){
  const {open}=openModal({emoji:kind==='manga'?'📕':'📄',title:m.title||m.name,sub:L({en:'quick info',ja:'クイック情報'})});
  const stats=h('div.dl',
    h('div',h('dt',L({en:'Type',ja:'形式'})),h('dd',m.type||'—')),
    h('div',h('dt',L({en:'Score',ja:'スコア'})),h('dd','★ '+(m.score||'—'))),
    h('div',h('dt',L({en:'Episodes',ja:'話数'})),h('dd',m.episodes||m.chapters||'—')),
    h('div',h('dt',L({en:'Status',ja:'状態'})),h('dd',m.status||'—')),
    h('div',h('dt',L({en:'Rank',ja:'順位'})),h('dd',m.rank?('#'+m.rank):'—')),
    h('div',h('dt',L({en:'Members',ja:'メンバー'})),h('dd',m.members?m.members.toLocaleString():'—'))
  );
  const genres=h('div.chipset',...(m.genres||[]).map(g=>h('span.tchip',g.name)));
  open([
    stats,
    h('div.panel-title',{style:'margin-top:14px'},L({en:'Synopsis',ja:'あらすじ'})),
    h('p.syn',m.synopsis?m.synopsis.replace(/\[Written by MAL Rewrite\]/g,''):L({en:'No synopsis available.',ja:'あらすじはありません。'})),
    genres?h('div.panel',h('div.panel-title',L({en:'Genres',ja:'ジャンル'})),genres):null,
    m.members?h('p.hint',L({en:'Data: Jikan API (MyAnimeList). Images © their owners.',ja:'データ: Jikan API（MAL）。画像は権利者に帰属。'})):null
  ],[
    btn('＋ '+L(S.watch),'primary',()=>WL.add(m)),
    btn('⇄ '+L(S.similar),'',()=>openTool(kind==='manga'?'sim-manga':'similar',{q:m.title,id:m.mal_id})),
    m.mal_id?btn('🔗 '+L(S.source),'gold',()=>window.open('https://myanimelist.net/'+kind+'/'+m.mal_id,'_blank','noopener')):null
  ]);
}

/* ---------------- anime search box (shared) ---------------- */
function searchBox({kind='anime',placeholder,onPick,limit=12,initial=''}){
  const input=inp({value:initial,placeholder:placeholder||L({en:'Type a title…',ja:'作品名を入力…'}),autocomplete:'off'});
  const out=h('div');
  let tmr=null, seq=0;
  const go=async()=>{
    const q=input.value.trim(); clear(out);
    if(q.length<2){ out.appendChild(emptyBox(L({en:'Type at least 2 characters.',ja:'2文字以上入力してください。'}),'🔎')); return; }
    const my=++seq;
    out.appendChild(skelGrid(4));
    try{
      const j=await japi('/'+kind,{q,limit,order_by:'members',sort:'desc'});
      if(my!==seq) return;
      const items=(j.data||[]).filter(Boolean);
      if(!items.length){ clear(out); out.appendChild(emptyBox()); return; }
      clear(out);
      items.forEach(m=>{
        const row=mediaCard(m,{kind,actions:['info','source'],snip:false,extraActions:(mm,acts)=>{
          acts.appendChild(btnI('✅ '+L(S.pick||{en:'Pick',ja:'選択'}),'','primary',()=>onPick&&onPick(mm)));
        }});
        out.appendChild(row);
      });
    }catch(e){ clear(out); out.appendChild(errBox(e.message,go)); }
  };
  input.addEventListener('input',()=>{ clearTimeout(tmr); tmr=setTimeout(go,420); });
  input.addEventListener('keydown',e=>{ if(e.key==='Enter'){ clearTimeout(tmr); go(); } });
  const box=h('div',h('div.row',input,btn(L(S.run||'Go'),'gold',go)),h('div',{style:'margin-top:10px;display:grid;gap:9px'},out));
  setTimeout(()=>{ if(initial) go(); },60);
  return box;
}

/* ============================================================
   OPEN TOOL
   ============================================================ */
function recent(){ return store.get('azt_rec',[]); }
function pushRecent(id){ const r=recent().filter(x=>x!==id); r.unshift(id); store.set('azt_rec',r.slice(0,8)); }
function openTool(id,preset){
  const t=TOOLS.find(x=>x.id===id); if(!t) return;
  pushRecent(id);
  const {open,close}=openModal({emoji:iconForTool(id),title:L({en:t.en,ja:t.ja}),sub:L({en:catName(t.cat),ja:catName(t.cat)})});
  const foot=h('div.row',
    h('span.hint',{html:'◈ '+esc(L({en:t.dEn,ja:t.dJa}))}),
    h('span.spacer',{style:'flex:1'}),
    t.api?(t.apiL?btn('🔗 '+t.apiL,'small',()=>window.open(t.apiU,'_blank','noopener')):btn('🔗 Jikan / MAL','small',()=>window.open('https://jikan.moe/docs/v4','_blank','noopener'))):btn('◈ '+L(S.source),'small',()=>openInfo({title:L({en:t.en,ja:t.ja}),synopsis:L({en:t.dEn,ja:t.dJa})+'\n\n'+L({en:'Runs entirely in your browser (no API needed). Data source: local generator.',ja:'ブラウザ内で完全動作（API不要）。データソース：ローカル生成。'})})),
    btn('＋ '+L(S.watch),'small gold',()=>quickAdd())
  );
  const impl=window.TOOLS_IMPL[id];
  const body=h('div');
  open([body],foot);
  if(impl){ try{ impl(body,preset||{},{close,L,LANG}) }catch(e){ clear(body); body.appendChild(errBox(e.message)); console.error(e); } }
  else clear(body).appendChild(emptyBox(L({en:'Tool not loaded.',ja:'ツールが未ロードです。'})));
}
function catName(cid){ const c=CATS.find(x=>x.id===cid); return c?L(c):cid; }
function randomTool(){ openTool(pick(TOOLS).id); }

/* quick add anime to watchlist */
function quickAdd(){
  const {open}=openModal({emoji:'＋',title:L({en:'Add to watchlist',ja:'視聴リストに追加'}),sub:L({en:'quick search',ja:'クイック検索'})});
  open([searchBox({placeholder:L({en:'Search anime to add…',ja:'追加するアニメを検索…'}),onPick:m=>{ WL.add(m); }})]);
}
function quickPick({kind='anime',title,onPick}){
  const {open}=openModal({emoji:'🎯',title:title||L({en:'Pick an anime',ja:'アニメを選択'}),sub:L({en:'search & select',ja:'検索して選択'})});
  open([searchBox({kind,placeholder:L({en:'Type a title…',ja:'作品名を入力…'}),onPick:m=>{ onPick(m); }})]);
}

/* ============================================================
   GRID + FILTERS
   ============================================================ */
let activeCat='all', query='';
function paintChips(){
  const wrap=clear($('#chips'));
  CATS.forEach(c=>{
    const n=c.id==='all'?TOOLS.length:TOOLS.filter(t=>t.cat===c.id).length;
    const chip=h('button.chip',{type:'button',onclick:()=>{ activeCat=c.id; paintChips(); paintGrid(); }});
    chip.className='chip'+(activeCat===c.id?' active':'');
    chip.innerHTML=ico(iconForCat(c.id))+' <span>'+esc(L(c))+'</span><span class="n">'+n+'</span>';
    wrap.appendChild(chip);
  });
}
function matchTool(t){
  if(activeCat!=='all'&&t.cat!==activeCat) return false;
  if(!query) return true;
  const q=query.toLowerCase();
  return (t.en+' '+t.ja+' '+t.dEn+' '+t.dJa+' '+t.kw+' '+catName(t.cat)).toLowerCase().includes(q);
}
function paintGrid(){
  const g=clear($('#grid'));
  const list=TOOLS.filter(matchTool);
  $('#gridCount').textContent = query
    ? list.length+' / '+TOOLS.length+' '+L({en:'tools match',ja:'件のツール'})
    : L({en:TOOLS.length+' tools · '+(CATS.length-1)+' categories · click any card to launch',ja:TOOLS.length+'ツール · '+(CATS.length-1)+'カテゴリー · カードをクリックで起動'});
  if(!list.length){ g.appendChild(emptyBox(L({en:'No tool matches that search.',ja:'該当するツールがありません。'}),'🍥')); return; }
  list.forEach((t,i)=>{
    const card=h('article.card',{tabindex:'0',onclick:()=>openTool(t.id),onkeydown:e=>{ if(e.key==='Enter') openTool(t.id); }});
    card.appendChild(h('span.num',String(t.n).padStart(2,'0')));
    card.appendChild(h('div.card-top',
      h('div.cseal',{html:ico(iconForTool(t.id))}),
      h('div',
        h('div.card-name',L({en:t.en,ja:t.ja})),
        h('div.card-ja',LANG==='en'?t.ja:t.en),
        h('div',{style:'margin-top:5px'},h('span.tag.'+t.cat,catName(t.cat)))
      )
    ));
    card.appendChild(h('div.card-desc',L({en:t.dEn,ja:t.dJa})));
    const acts=h('div.card-actions');
    acts.appendChild(h('button.iconbtn',{type:'button',title:L(S.info),html:ico('info'),onclick:e=>{e.stopPropagation(); openInfoCard(t)}}));
    acts.appendChild(h('button.iconbtn',{type:'button',title:L(S.source),html:ico('link'),onclick:e=>{e.stopPropagation(); sourceFor(t)}}));
    acts.appendChild(h('button.iconbtn',{type:'button',title:L(S.similar),html:ico('shuffle'),onclick:e=>{e.stopPropagation(); const rel=(t.rel&&TOOLS.find(x=>x.id===t.rel))||TOOLS.find(x=>x.cat===t.cat&&x.id!==t.id)||t; openTool(rel.id)}}));
    acts.appendChild(h('button.iconbtn',{type:'button',title:L(S.watch),html:ico('plus'),onclick:e=>{e.stopPropagation(); quickAdd()}}));
    acts.appendChild(h('span.grow'),h('span.mini',L({en:'Launch',ja:'起動'})));
    card.appendChild(acts);
    g.appendChild(card);
    setTimeout(()=>card.classList.add('in'),Math.min(i*22,500));
  });
}
function openInfoCard(t){
  const {open}=openModal({emoji:iconForTool(t.id),title:L({en:t.en,ja:t.ja}),sub:catName(t.cat)});
  open([
    h('div.dl',
      h('div',h('dt','#'),h('dd',String(t.n))),
      h('div',h('dt',L({en:'Category',ja:'カテゴリー'})),h('dd',catName(t.cat))),
      h('div',h('dt',L({en:'Data source',ja:'データソース'})),h('dd',t.api?'Jikan API (MAL)':'Local / browser')),
      h('div',h('dt',L({en:'Works offline',ja:'オフライン動作'})),h('dd',t.api?'No':'Yes'))
    ),
    h('div.panel',h('div.panel-title',L({en:'What it does',ja:'機能'})),h('p.syn',L({en:t.dEn,ja:t.dJa}))),
    h('div.panel',h('div.panel-title',L({en:'Rules honored',ja:'遵守ルール'})),
      h('div.chipset',
        h('span.tchip',t.api?L({en:'Legal source links',ja:'正規リンク'}):L({en:'No external links needed',ja:'外部リンク不要'})),
        h('span.tchip',L({en:'No API key',ja:'キー不要'})),
        h('span.tchip',L({en:'Verified behavior',ja:'動作検証済み'}))
      )
    )
  ],[ btn(L({en:'Launch tool',ja:'ツールを開く'}),'primary',()=>{ closeAllModals(); openTool(t.id); }) ]);
}
function sourceFor(t){
  if(t.api) window.open('https://jikan.moe/docs/v4','_blank','noopener');
  else openInfoCard(t);
}
function closeAllModals(){ while(modalStack.length) modalStack[modalStack.length-1].close(); }

/* ============================================================
   COMMAND PALETTE
   ============================================================ */
const ACTIONS=[
 {id:'act-random',pe:'🎲',t:{en:'Open a random tool',ja:'ランダムツールを開く'},run:randomTool},
 {id:'act-watch',pe:'＋',t:{en:'Add anime to watchlist',ja:'視聴リストに追加'},run:quickAdd},
 {id:'act-wl',pe:'🗂️',t:{en:'Watchlist Manager',ja:'視聴リスト管理'},run:()=>openTool('wl-manager')},
 {id:'act-lang',pe:'日/EN',t:{en:'Switch language (日英)',ja:'言語切替（日英）'},run:()=>setLang(LANG==='en'?'ja':'en')},
 {id:'act-doc',pe:'🩺',t:{en:'Connection Doctor',ja:'接続診断'},run:openDoctor},
 {id:'act-cache',pe:'🧹',t:{en:'Clear API cache',ja:'APIキャッシュ削除'},run:()=>{ try{sessionStorage.clear()}catch(e){} for(const k in memCache) delete memCache[k]; toast('🧹 <b>Cache cleared</b>'); }},
 {id:'act-home',pe:'🏠',t:{en:'Back to top',ja:'トップへ'},run:()=>window.scrollTo({top:0,behavior:'smooth'})}
];
let palIdx=0, palItems=[];
function openPalette(){
  const root=clear($('#paletteRoot'));
  const input=h('input',{placeholder:L({en:'Summon a tool or action…',ja:'ツールやアクションを召喚…'}),autocomplete:'off'});
  const list=h('div.p-list');
  const ov=h('div.palette-overlay',h('div.palette',input,list,h('div.p-foot',
    h('span','↑↓ '+L({en:'navigate',ja:'移動'})),h('span','↵ '+L({en:'open',ja:'開く'})),h('span','ESC '+L({en:'close',ja:'閉じる'})),h('span',''))));
  root.appendChild(ov);
  document.body.style.overflow='hidden';
  const close=()=>{ root.innerHTML=''; document.body.style.overflow=modalStack.length?'hidden':''; document.removeEventListener('keydown',key); };
  ov.addEventListener('mousedown',e=>{ if(e.target===ov) close(); });
  const build=()=>{
    const q=input.value.trim().toLowerCase();
    clear(list); palItems=[]; palIdx=0;
    const rec=recent().map(id=>TOOLS.find(t=>t.id===id)).filter(Boolean)
      .filter(t=>!q||matchStr(t,q));
    const acts=ACTIONS.filter(a=>!q||L(a.t).toLowerCase().includes(q));
    const tools=TOOLS.filter(t=>!rec.includes(t)&&matchStr(t,q));
    if(q===''){ if(rec.length){ sec(L({en:'Recently summoned',ja:'最近使ったツール'})); rec.forEach(addTool); } sec(L({en:'Actions',ja:'アクション'})); acts.forEach(addAct); }
    else{ if(acts.length){ sec(L({en:'Actions',ja:'アクション'})); acts.forEach(addAct); } if(rec.length){ sec(L({en:'Recently summoned',ja:'最近使ったツール'})); rec.forEach(addTool); } }
    if(tools.length){ sec(L({en:'Tools',ja:'ツール'})); tools.slice(0,40).forEach(addTool); }
    if(!palItems.length) list.appendChild(emptyBox(L({en:'Nothing summoned.',ja:'該当なし。'}),'🍥'));
    mark();
    function sec(t){ list.appendChild(h('div.p-sec',t)); }
    function addTool(t){ const it=h('div.p-item',{html:'<span class="pe">'+ico(iconForTool(t.id))+'</span><span>'+esc(L({en:t.en,ja:t.ja}))+'</span><span class="pc">'+esc(catName(t.cat))+'</span>',onclick:()=>{ close(); openTool(t.id); }}); list.appendChild(it); palItems.push(it); }
    function addAct(a){ const ic=ICONS[a.pe]?ico(a.pe):(EMOJI2ICO[a.pe]?ico(EMOJI2ICO[a.pe]):'<span class="pe-txt">'+esc(a.pe)+'</span>');
      const it=h('div.p-item',{html:'<span class="pe">'+ic+'</span><span>'+esc(L(a.t))+'</span><span class="pc">'+L({en:'action',ja:'操作'})+'</span>',onclick:()=>{ close(); a.run(); }}); list.appendChild(it); palItems.push(it); }
  };
  const matchStr=(t,q)=>(t.en+' '+t.ja+' '+t.kw).toLowerCase().includes(q);
  const mark=()=>palItems.forEach((el,i)=>el.classList.toggle('active',i===palIdx)) || (palItems[palIdx]&&palItems[palIdx].scrollIntoView({block:'nearest'}));
  const key=e=>{
    if(e.key==='Escape'){ e.preventDefault(); close(); }
    else if(e.key==='ArrowDown'){ e.preventDefault(); palIdx=Math.min(palIdx+1,palItems.length-1); mark(); }
    else if(e.key==='ArrowUp'){ e.preventDefault(); palIdx=Math.max(palIdx-1,0); mark(); }
    else if(e.key==='Enter'){ e.preventDefault(); palItems[palIdx]&&palItems[palIdx].click(); }
  };
  input.addEventListener('input',build);
  document.addEventListener('keydown',key);
  build(); input.focus();
}

/* ============================================================
   LANGUAGE
   ============================================================ */
function setLang(l){
  LANG=l; store.set('azt_lang',l);
  document.documentElement.lang=l==='ja'?'ja':'en';
  $('#langBtn').textContent = l==='en' ? 'EN / 日' : '日 / EN';
  $$('[data-i18n]').forEach(el=>{ const k=el.dataset.i18n; if(S[k]) el.innerHTML=L(S[k]); });
  $$('[data-i18n-ph]').forEach(el=>{ const k=el.dataset.i18nPh; if(S[k]) el.placeholder=L(S[k]); });
  $('#brandSub').textContent = l==='en' ? 'アニメザキ道具 · '+TOOLS.length+' tools' : 'Anime Zaki Tools · '+TOOLS.length+'ツール';
  paintDoctor(); paintChips(); paintGrid(); paintWatchBtn(); paintGuestbook();
}

/* ============================================================
   PICTURE VIEWER (lightbox) — click any photo to inspect it close up
   ============================================================ */
const LB={nodes:[],i:0,z:1,x:0,y:0};
function openLightbox(list,idx){
  LB.nodes=list; LB.i=idx||0; LB.z=1; LB.x=0; LB.y=0;
  const bd=h('div.lb');
  const img=h('img.lb-img',{alt:''});
  const cap=h('div.lb-cap');
  const cnt=h('div.lb-count');
  const bar=h('div.lb-bar',
    h('button.iconbtn.flip',{type:'button',title:L({en:'Previous',ja:'前へ'}),html:ico('skip'),onclick:e=>{e.stopPropagation();step(-1)}}),
    h('button.iconbtn',{type:'button',title:L({en:'Play / pause slide',ja:'スライド'}),html:ico('pause'),onclick:e=>{e.stopPropagation();auto(e.currentTarget)}}),
    h('button.iconbtn',{type:'button',title:L({en:'Next',ja:'次へ'}),html:ico('skip'),onclick:e=>{e.stopPropagation();step(1)}}),
    h('span.lb-sep'),
    h('button.iconbtn',{type:'button',title:L({en:'Zoom in',ja:'拡大'}),html:ico('plus'),onclick:e=>{e.stopPropagation();zoom(1.35)}}),
    h('button.iconbtn',{type:'button',title:L({en:'Zoom out',ja:'縮小'}),html:ico('minus'),onclick:e=>{e.stopPropagation();zoom(1/1.35)}}),
    h('button.iconbtn',{type:'button',title:L({en:'Fit',ja:'全体'}),html:ico('compass'),onclick:e=>{e.stopPropagation();fit()}}),
    h('span.lb-sep'),
    h('a.iconbtn',{title:L({en:'Open original',ja:'原本を開く'}),html:ico('external'),target:'_blank',rel:'noopener',onclick:e=>e.stopPropagation()}),
    h('button.iconbtn',{title:L({en:'Download',ja:'保存'}),html:ico('download'),onclick:e=>{e.stopPropagation();const a=document.createElement('a');a.href=img.src;a.download='anime-zaki-art.jpg';a.click();}}),
    h('button.iconbtn',{title:L({en:'Close',ja:'閉じる'}),html:ico('x'),onclick:e=>{e.stopPropagation();closeLB()}})
  );
  const stage=h('div.lb-stage',img);
  const top=h('div.lb-top',cap,cnt);
  bd.appendChild(top); bd.appendChild(stage); bd.appendChild(bar);
  const openA=bar.querySelector('a');
  function paint(){
    const n=LB.nodes[LB.i]; if(!n) return;
    const hi=n.getAttribute('data-hi')||n.currentSrc||n.src;
    img.src=hi||n.src; img.alt=n.alt||'';
    cap.textContent=n.alt||n.title||('image '+(LB.i+1));
    cnt.textContent=(LB.i+1)+' / '+LB.nodes.length;
    openA.href=n.src;
    fit();
    /* preload neighbours */
    [LB.i+1,LB.i-1].forEach(k=>{ const m=LB.nodes[k]; if(m){ const p=new Image(); p.src=m.getAttribute('data-hi')||m.src; } });
  }
  function fit(){ LB.z=1; LB.x=0; LB.y=0; apply(true); }
  function zoom(f){ LB.z=Math.max(.4,Math.min(7,LB.z*f)); apply(); }
  function step(d){ LB.i=(LB.i+d+LB.nodes.length)%LB.nodes.length; paint(); }
  function apply(anim){ img.style.transition=anim?'transform .3s cubic-bezier(.2,.8,.3,1)':'none';
    img.style.transform='translate('+LB.x+'px,'+LB.y+'px) scale('+LB.z+')'; }
  let autoT=null;
  function auto(btn){ if(autoT){ clearInterval(autoT); autoT=null; btn.innerHTML=ico('pause'); }
    else { btn.innerHTML=ico('play'); autoT=setInterval(()=>step(1),3800); } }
  bd.addEventListener('wheel',e=>{ e.preventDefault(); zoom(e.deltaY<0?1.18:1/1.18); },{passive:false});
  bd.addEventListener('click',e=>{ if(e.target===bd||e.target===stage) closeLB(); });
  bd.addEventListener('dblclick',e=>{ if(e.target===img){ LB.z=LB.z>1?1:2.6; if(LB.z===1){LB.x=0;LB.y=0;} apply(); } });
  let drag=null;
  img.addEventListener('pointerdown',e=>{ if(LB.z<=1) return; drag={sx:e.clientX,sy:e.clientY,ox:LB.x,oy:LB.y}; img.setPointerCapture(e.pointerId); img.style.cursor='grabbing'; });
  img.addEventListener('pointermove',e=>{ if(!drag) return; LB.x=drag.ox+(e.clientX-drag.sx); LB.y=drag.oy+(e.clientY-drag.sy); apply(); });
  img.addEventListener('pointerup',()=>{ drag=null; img.style.cursor='zoom-in'; });
  const key=e=>{
    if(e.key==='Escape'){ e.preventDefault(); closeLB(); }
    else if(e.key==='ArrowRight') step(1);
    else if(e.key==='ArrowLeft') step(-1);
    else if(e.key==='+'||e.key==='=') zoom(1.35);
    else if(e.key==='-') zoom(1/1.35);
    else if(e.key==='0') fit();
  };
  document.addEventListener('keydown',key);
  document.body.appendChild(bd); document.body.style.overflow='hidden';
  requestAnimationFrame(()=>bd.classList.add('in'));
  function closeLB(){ clearInterval(autoT); document.removeEventListener('keydown',key); bd.classList.remove('in');
    setTimeout(()=>bd.remove(),180); if(!modalStack.length&&!$('#paletteRoot').firstChild) document.body.style.overflow=''; }
  LB.close=closeLB;
  paint();
}
function closeLB(){ LB.close&&LB.close(); }
function initLightbox(){
  document.addEventListener('click',e=>{
    const im=e.target.closest&&e.target.closest('img');
    if(!im||!im.src||im.closest('a,button,.m-emoji,.lb,.iconbtn')) return;
    if(im.closest('#paletteRoot,#toastRoot')) return;
    /* only "content" photos: cards, galleries, wallpapers, banners */
    const scope=im.closest('.modal-body, .results, .canvas-wrap, .gal, .pl-art')||im.closest('.page');
    if(!scope) return;
    const isGallery=x=>x.classList.contains('zoomable')||x.classList.contains('ac-thumb')||x.naturalWidth>=150;
    const list=[...scope.querySelectorAll('img')].filter(x=>x.src&&!x.closest('a,button,.m-emoji,.iconbtn')&&isGallery(x));
    if(!list.length||!im.naturalWidth) return;
    const i=Math.max(0,list.indexOf(im));
    openLightbox(list,i);
  });
}

/* ============================================================
   INLINE MUSIC / VIDEO PLAYER — watch & listen inside the tool
   ============================================================ */
const ytID=u=>{ const s=String(u||'');
  const m=s.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  return m?m[1]:null; };
const isMediaFile=u=>/\.(webm|mp4|mp3|m4a|ogg|opus)(\?|#|$)/i.test(String(u||''));
const _themeCache={};
async function resolveSongMedia(s){
  /* 1 — direct media link (AnimeThemes serves official OP/ED video files) */
  const l0=(s.links&&s.links[0])||s.link||'';
  if(isMediaFile(l0)) return {kind:'file',src:l0};
  const yid=ytID(l0); if(yid) return {kind:'yt',id:yid};
  /* 2 — resolve through AnimeThemes by the song's anime, match the title */
  const anime=s.an||s.anime||'';
  if(!anime) return null;
  try{
    const th=_themeCache[anime]||(_themeCache[anime]=await fetchThemes(anime));
    const want=norm(s.t||s.name||''), wa=s.a||s.artist||'';
    const pool=(th&&th.songs)||[];
    const hit=pool.find(x=>want&&(norm(x.name)===want||(norm(x.name).includes(want)&&want.length>4)))
      ||pool.find(x=>wa&&norm(x.artist||'').includes(norm(wa)))
      ||pool.find(x=>s.tag&&String(x.type||'').toLowerCase().startsWith(String(s.tag).toLowerCase()));
    if(hit){
      const fl=(hit.links||[]).find(isMediaFile), yl=(hit.links||[]).map(ytID).find(Boolean);
      if(fl) return {kind:'file',src:fl};
      if(yl) return {kind:'yt',id:yl};
    }
  }catch(e){}
  return null;
}
/* mount a stylish player at the top of `host`; opt={title,sub,art,media:{kind,src|id},links} */
function mountPlayer(host,opt){
  const prev=host._player; if(prev){ try{ if(prev._mdkEl&&prev._mdkEl.pause) prev._mdkEl.pause(); }catch(e){} if(prev.parentNode) prev.remove(); }
  const stage=h('div.pl-stage');
  const prog=h('i');
  const bar=h('div.pl-bar',prog);
  const time=h('span.pl-time','0:00');
  const play=h('button.iconbtn.pl-play',{type:'button',html:ico('play'),title:L({en:'Play / Pause',ja:'再生 / 一時停止'})});
  const eq=h('div.eq',h('i'),h('i'),h('i'),h('i'));
  const pl=h('div.pl',
    h('div.pl-art',opt.art?h('img',{src:opt.art,alt:opt.title||'',onerror(){this.style.display='none'}}):h('span.mono','♪'),
      h('div.vinyl')),
    h('div.pl-main',
      h('div.pl-title',opt.title||L({en:'Now playing',ja:'再生中'})),
      h('div.pl-sub',opt.sub||''),
      stage,
      h('div.pl-ctrl',play,eq,h('span.spacer'),time),
      bar
    )
  );
  let media=null;
  if(opt.media&&opt.media.kind==='file'){
    media=h('video',{src:opt.media.src,playsinline:true,preload:'metadata'});
    stage.appendChild(media);
    play.onclick=()=>{ media.paused?media.play():media.pause(); };
    media.addEventListener('play',()=>{ pl.classList.add('playing'); play.innerHTML=ico('pause'); });
    media.addEventListener('pause',()=>{ pl.classList.remove('playing'); play.innerHTML=ico('play'); });
    media.addEventListener('timeupdate',()=>{ const d=media.duration||0;
      prog.style.width=(d?(media.currentTime/d*100):0)+'%';
      time.textContent=fmtT(media.currentTime)+' / '+(d?fmtT(d):'—'); });
    media.addEventListener('ended',()=>{ pl.classList.remove('playing'); play.innerHTML=ico('play'); });
    bar.onclick=e=>{ const r=bar.getBoundingClientRect(); if(media.duration) media.currentTime=((e.clientX-r.left)/r.width)*media.duration; };
    setTimeout(()=>{ media&&media.play&&media.play().catch(()=>{}); },120);
  } else if(opt.media&&opt.media.kind==='yt'){
    media=h('iframe',{src:'https://www.youtube-nocookie.com/embed/'+opt.media.id+'?autoplay=1&rel=0&modestbranding=1',
      allow:'accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture; fullscreen',
      allowfullscreen:true,title:opt.title||'video'});
    stage.appendChild(media); pl.classList.add('yt'); play.style.display='none'; bar.style.display='none';
  } else {
    play.style.display='none'; bar.style.display='none'; eq.style.display='none';
    stage.appendChild(h('div.pl-links',
      h('span.pl-hint',L({en:'No free inline stream for this track — pick an official service (opens their page):',ja:'この曲の無料インラインストリームはありません。公式サービスを選択（外部ページが開きます）：'})),
      h('div.row.tight',(opt.links||[]).map(l=>h('a.btn.small'+(l.gold?'.gold':''),{href:l.href,target:'_blank',rel:'noopener',html:labelHTML(l.label)})))
    ));
  }
  host._player=pl;
  host.insertBefore(pl,host.firstChild||null);
  pl.classList.add('pl-enter');
  if(typeof MDK!=='undefined') MDK.note(pl,media,{title:opt.title,sub:opt.sub});
  return pl;
}
const fmtT=s=>{ s=Math.max(0,Math.floor(s||0)); return Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); };
/* shared entry: play a curated / themed song inside `host` */
function playSong(s,host,queue){
  if(typeof MDK!=='undefined'){
    if(Array.isArray(queue)&&queue.length) MDK.setQueue(queue,s);
    else MDK.setQueue(null,null);
  }
  const links=[
    {label:'▶ YouTube Music',href:ytmLink(s),gold:true},
    {label:'Spotify',href:spLink(s)},
    {label:'Apple Music',href:amLink(s)}
  ];
  const opts={title:s.t||s.name,sub:[s.a||s.artist,s.an||s.anime].filter(Boolean).join(' · '),art:s.art||null,links};
  /* fast path — AnimeThemes rows already carry official media files: play instantly */
  const l0=(s.links&&s.links[0])||'';
  const quick=isMediaFile(l0)?{kind:'file',src:l0}:(ytID(l0)?{kind:'yt',id:ytID(l0)}:null);
  if(quick){ mountPlayer(host,Object.assign({media:quick},opts)); host._player.classList.add('playing'); return; }
  /* otherwise: mount immediately (shows official services), resolve a stream in the background */
  mountPlayer(host,Object.assign({media:null},opts));
  const st=host._player;
  st.classList.add('loading');
  resolveSongMedia(s).then(med=>{
    if(!st.isConnected) return;
    st.classList.remove('loading');
    if(!med) return;
    mountPlayer(host,Object.assign({media:med},opts));
    host._player.classList.add('playing');
  }).catch(()=>st.classList.remove('loading'));
}

/* ============================================================
   MEDIA DOCK — persistent bottom bar for music & video
   Shows what is playing, survives tool close, skips, volume,
   sound settings & resizable video (Spotify-style).
   ============================================================ */
const MDK={
  vol:store.get('azt_mdkvol',.8), mute:store.get('azt_mdkmute',0)?1:0,
  rate:store.get('azt_mdkrate',1), size:store.get('azt_mdksize','md'),
  kind:null, el:null, widget:null, vid:null, meta:null, host:null, min:0,
  glass:store.get('azt_mdkglass',1), loop:store.get('azt_mdkloop',0),
  accent:store.get('azt_mdkcolor',null),
  queue:null, qi:-1, vitems:null, vidx:-1, vplay:null, ui:null
};
function initMediaDock(){ if(typeof MDK!=='undefined') MDK.init(); }

MDK.init=function(){
  if(MDK.ui) return;
  const slot=h('div.mdk-media',{hidden:true});
  const vidWrap=h('div.mdk-vid.mdk-'+(MDK.size==='sm'||MDK.size==='lg'?MDK.size:'md'),{hidden:true});
  /* corner grip — drag to resize the docked video freely (rides inside the wrap, so it
     only exists while a video does) */
  const grip=h('div.mdk-grip',{title:L({en:'Drag to resize the video — double-click to reset',ja:'ドラッグで動画サイズ調整 — ダブルクリックでリセット'}),'aria-label':'resize video'});
  vidWrap.appendChild(grip);
  slot.appendChild(vidWrap);
  const disc=h('div.mdk-disc',h('span','♪'));
  const eq=h('div.mdk-eq',h('i'),h('i'),h('i'),h('i'));
  const art=h('div.mdk-art',disc,eq);
  const title=h('div.mdk-title'), sub=h('div.mdk-sub');
  const info=h('div.mdk-info',title,sub);
  const prev=h('button.mdk-b.mdk-prev',{type:'button',html:ico('skip'),title:L({en:'Previous / switch station',ja:'前へ / スタジオ切替'})});
  const play=h('button.mdk-b.mdk-play',{type:'button',html:ico('play'),title:L({en:'Play',ja:'再生'})});
  const next=h('button.mdk-b.mdk-next',{type:'button',html:ico('skip'),title:L({en:'Next',ja:'次へ'})});
  const tr=h('div.mdk-tr',prev,play,next);
  const muteB=h('button.mdk-b.mdk-mute',{type:'button',html:ico(MDK.mute?'mute':'speaker'),title:L({en:'Mute',ja:'ミュート'})});
  const volS=h('input.mdk-vol',{type:'range',min:'0',max:'100',value:String(Math.round(MDK.vol*100)),title:L({en:'Volume',ja:'音量'}),'aria-label':'volume'});
  const vr=h('div.mdk-vr',muteB,volS);
  const sizeB=h('button.mdk-b.mdk-sizeB',{type:'button',html:ico('expand'),title:L({en:'Video size',ja:'動画サイズ'}),hidden:true});
  const setB=h('button.mdk-b.mdk-setB',{type:'button',html:ico('sliders'),title:L({en:'Player & style settings',ja:'プレイヤー＆スタイル設定'})});
  const loopB=h('button.mdk-b.mdk-loopB',{type:'button',html:ico('loop'),title:L({en:'Loop this track',ja:'この曲をループ'}),hidden:true});
  const fullB=h('button.mdk-b.mdk-fullB',{type:'button',html:ico('full'),title:L({en:'Fullscreen video',ja:'動画を全画面表示'}),hidden:true});
  const minB=h('button.mdk-b.mdk-minB',{type:'button',html:ico('chevd'),title:L({en:'Minimize — hide the video, keep the music',ja:'最小化 — 動画を隠して音楽だけ'})});
  const stopB=h('button.mdk-b.mdk-stop',{type:'button',html:ico('x'),title:L({en:'Stop & close',ja:'停止して閉じる'})});
  const pop=h('div.mdk-pop',{hidden:true});
  const row=h('div.mdk-row',art,info,tr,vr,loopB,fullB,sizeB,setB,minB,stopB,pop);
  /* Apple-Music-style ambient album glow + Spotify-style progress line */
  const amb=h('div.mdk-amb',{'aria-hidden':'true'});
  const tCur=h('span.mdk-time.mdk-cur','0:00'), tTot=h('span.mdk-time.mdk-tot','0:00');
  const barFill=h('i');
  const bar=h('div.mdk-bar',{title:L({en:'Seek',ja:'シーク'}),'aria-label':'seek'},barFill);
  const prog=h('div.mdk-prog',{hidden:true},tCur,bar,tTot);
  const dom=h('div.mdk#mdk',{hidden:true},amb,slot,prog,row);
  document.body.appendChild(dom);
  MDK.ui={dom,slot,vidWrap,title,sub,art,eq,play,prev,next,tr,vr,muteB,volS,loopB,fullB,sizeB,setB,minB,stopB,pop,amb,prog,bar,barFill,tCur,tTot};
  prev.onclick=()=>MDK.jump(-1);
  next.onclick=()=>MDK.jump(1);
  play.onclick=()=>MDK.toggle();
  stopB.onclick=()=>MDK.stop();
  muteB.onclick=()=>{ MDK.mute=MDK.mute?0:1; store.set('azt_mdkmute',MDK.mute); MDK.apply(); };
  volS.addEventListener('input',()=>{ MDK.setVol(parseInt(volS.value,10)/100); });
  bar.addEventListener('pointerdown',e=>{ const el=MDK._mediaEl(); if(!el) return;
    const r=bar.getBoundingClientRect(); const p=Math.min(1,Math.max(0,(e.clientX-r.left)/Math.max(1,r.width)));
    try{ el.currentTime=p*el.duration; }catch(err){}
    MDK._tick(); });
  sizeB.onclick=()=>{
    const ord=['sm','md','lg'];
    MDK.size=ord[(ord.indexOf(MDK.size)+1)%3]||'md';
    store.set('azt_mdksize',MDK.size);
    vidWrap.className='mdk-vid mdk-'+MDK.size;
    vidWrap.style.width=''; store.set('azt_mdkvidw',0); /* cycling resets a custom drag size */
  };
  /* --- drag the corner grip to resize the docked video (mouse + touch;
         tracking lives on window so a fast drag can never lose the pointer) --- */
  let rgDrag=0,rgX=0,rgW=0;
  const rgMove=e=>{ if(!rgDrag) return;
    vidWrap.style.width=Math.max(160,Math.min(MDK._maxVidW(),Math.round(rgW+(e.clientX-rgX))))+'px';
    MDK.keepOnScreen(); /* a taller video grows the bar — keep its grip within reach */ };
  const rgEnd=()=>{ if(!rgDrag) return; rgDrag=0; vidWrap.style.transition='';
    window.removeEventListener('pointermove',rgMove);
    window.removeEventListener('pointerup',rgEnd);
    window.removeEventListener('pointercancel',rgEnd);
    store.set('azt_mdkvidw',parseInt(vidWrap.style.width,10)||0); };
  grip.addEventListener('pointerdown',e=>{
    if(!MDK.vid&&!(MDK.el&&MDK.el.tagName==='VIDEO')) return;
    e.preventDefault(); e.stopPropagation();
    rgDrag=1; rgX=e.clientX; rgW=vidWrap.getBoundingClientRect().width||320;
    vidWrap.style.transition='none';
    window.addEventListener('pointermove',rgMove);
    window.addEventListener('pointerup',rgEnd);
    window.addEventListener('pointercancel',rgEnd);
    try{ grip.setPointerCapture(e.pointerId); }catch(err){}
  });
  grip.addEventListener('dblclick',e=>{ e.stopPropagation(); vidWrap.style.width=''; store.set('azt_mdkvidw',0); });
  /* --- drag the whole bar anywhere (grab art / title / empty row space) and resize
         it with the corner grip — double-click either to reset (saved across visits) --- */
  const bgrip=h('div.mdk-bgrip',{title:L({en:'Drag to resize the bar — double-click to reset',ja:'ドラッグでバーをリサイズ — ダブルクリックでリセット'}),'aria-label':'resize player bar'});
  dom.appendChild(bgrip);
  const clampBar=(x,y)=>{ const r=dom.getBoundingClientRect();
    return [Math.max(8,Math.min(Math.max(8,innerWidth-r.width-8),x)),
            Math.max(8,Math.min(Math.max(8,innerHeight-r.height-8),y))]; };
  let mvDrag=0,mvX=0,mvY=0,mvL=0,mvT=0,mvMoved=0;
  const mvMove=e=>{ if(!mvDrag) return; mvMoved=1;
    const c=clampBar(mvL+(e.clientX-mvX),mvT+(e.clientY-mvY));
    dom.style.left=Math.round(c[0])+'px'; dom.style.top=Math.round(c[1])+'px'; };
  const mvEnd=()=>{ if(!mvDrag) return; mvDrag=0; dom.style.transition='';
    window.removeEventListener('pointermove',mvMove); window.removeEventListener('pointerup',mvEnd); window.removeEventListener('pointercancel',mvEnd);
    if(mvMoved){ MDK._dragEnd=Date.now(); /* suppress the tap-to-expand click after a real drag */
      store.set('azt_mdkpos',Math.round(parseFloat(dom.style.left)||0)+','+Math.round(parseFloat(dom.style.top)||0)); } };
  const mvStart=e=>{ if(e.button!=null&&e.button!==0) return;
    if(e.target.closest('button,input,a,video,iframe,.mdk-bar,.mdk-pop,.mdk-bgrip')) return;
    e.preventDefault();
    const r=dom.getBoundingClientRect();
    dom.classList.add('mdk-float');
    mvDrag=1; mvMoved=0; mvX=e.clientX; mvY=e.clientY; mvL=r.left; mvT=r.top;
    dom.style.left=Math.round(r.left)+'px'; dom.style.top=Math.round(r.top)+'px'; dom.style.transition='none';
    window.addEventListener('pointermove',mvMove); window.addEventListener('pointerup',mvEnd); window.addEventListener('pointercancel',mvEnd); };
  art.addEventListener('pointerdown',mvStart); info.addEventListener('pointerdown',mvStart);
  row.addEventListener('pointerdown',e=>{ if(e.pointerType!=='touch') mvStart(e); }); /* mouse-only on the row, so touch scrolling stays */
  [art,info].forEach(el=>el.addEventListener('dblclick',e=>{ e.stopPropagation(); MDK._dragEnd=Date.now();
    dom.style.left=''; dom.style.top=''; dom.classList.remove('mdk-float'); store.set('azt_mdkpos',''); }));
  let bgDrag=0,bgX=0,bgW=0;
  const bgMove=e=>{ if(!bgDrag) return;
    dom.style.width=Math.max(240,Math.min(Math.min(1200,innerWidth-24),Math.round(bgW+(e.clientX-bgX))))+'px';
    MDK.keepOnScreen(); /* widening near an edge slides the bar back so the grip stays reachable */
    MDK.fitControls(); /* controls shrink, then drop off as the bar narrows */ };
  const bgEnd=()=>{ if(!bgDrag) return; bgDrag=0; dom.style.transition='';
    window.removeEventListener('pointermove',bgMove); window.removeEventListener('pointerup',bgEnd); window.removeEventListener('pointercancel',bgEnd);
    store.set('azt_mdkbarw',parseInt(dom.style.width,10)||0); };
  bgrip.addEventListener('pointerdown',e=>{
    e.preventDefault(); e.stopPropagation();
    dom.classList.add('mdk-float');
    bgDrag=1; bgX=e.clientX; bgW=dom.getBoundingClientRect().width||420;
    dom.style.transition='none';
    window.addEventListener('pointermove',bgMove); window.addEventListener('pointerup',bgEnd); window.addEventListener('pointercancel',bgEnd);
    try{ bgrip.setPointerCapture(e.pointerId); }catch(err){}
  });
  bgrip.addEventListener('dblclick',e=>{ e.stopPropagation(); MDK._dragEnd=Date.now();
    dom.style.width=''; store.set('azt_mdkbarw',0); });
  window.addEventListener('resize',()=>{ MDK.keepOnScreen(); MDK.fitControls(); });
  setB.onclick=()=>{ pop.hidden=!pop.hidden; if(!pop.hidden) MDK.buildPop(); };
  loopB.onclick=()=>MDK.setLoop(MDK.loop?0:1);
  fullB.onclick=()=>MDK.fullscreen();
  minB.onclick=()=>MDK.setMode(((MDK.mode||0)+1)%3); /* full → compact → minimal → full */
  /* tapping the slim pill body expands it back */
  dom.addEventListener('click',e=>{ if(MDK._dragEnd&&Date.now()-MDK._dragEnd<300) return; /* a drag just ended — not a tap */
    if(MDK.mode&&!e.target.closest('button,input,a,video,iframe,.mdk-bar,.mdk-pop,.mdk-bgrip')) MDK.setMode(0); });
  document.addEventListener('click',e=>{ if(!pop.hidden&&!dom.contains(e.target)) pop.hidden=true; });
  MDK.setMode(MDK.mode); /* sync icon + classes */
  /* restore a saved custom size + position of the bar */
  const bpw=+store.get('azt_mdkbarw',0)||0;
  if(bpw) dom.style.width=Math.min(Math.max(240,bpw),innerWidth-24)+'px';
  const bpos=String(store.get('azt_mdkpos','')||'');
  if(/^\d+,-?\d+$/.test(bpos)){ const p=bpos.split(',');
    dom.classList.add('mdk-float');
    dom.style.left=(+p[0])+'px'; dom.style.top=(+p[1])+'px';
    const c=clampBar(+p[0],+p[1]); /* keep it on screen if the window changed */
    dom.style.left=Math.round(c[0])+'px'; dom.style.top=Math.round(c[1])+'px'; }
  MDK.setGlass(MDK.glass); MDK.setAccent(MDK.accent); MDK.setLoop(MDK.loop);
  MDK.apply();
  MDK.fitControls(); /* controls adapt to the restored bar width */
};

MDK.buildPop=function(){
  const u=MDK.ui; if(!u) return;
  clear(u.pop);
  u.pop.appendChild(h('div.mdk-pop-t',L({en:'Player & style settings',ja:'プレイヤー＆スタイル設定'})));
  /* --- speed: chips apply to songs AND videos --- */
  const rowS=h('div.mdk-pop-row',h('span.mdk-pop-lbl',L({en:'Speed',ja:'再生速度'})));
  [.75,1,1.25,1.5,2].forEach(v=>{
    rowS.appendChild(h('button.mdk-chip'+(v===MDK.rate?'.on':''),{type:'button','data-v':String(v),onclick:function(){
      MDK.rate=v; store.set('azt_mdkrate',v); MDK.apply();
      rowS.querySelectorAll('.mdk-chip').forEach(x=>x.classList.toggle('on',parseFloat(x.dataset.v)===v));
    }},String(v)+'×'));
  });
  u.pop.appendChild(rowS);
  /* --- loop: mirrors the row button --- */
  const lp=h('button.mdk-chip'+(MDK.loop?'.on':''),{type:'button',onclick:function(){
    MDK.setLoop(MDK.loop?0:1); lp.classList.toggle('on',!!MDK.loop);
  }},L({en:'Loop track/video',ja:'曲/動画をループ'}));
  u.pop.appendChild(h('div.mdk-pop-row',h('span.mdk-pop-lbl',L({en:'Loop',ja:'ループ'})),lp));
  /* --- liquid-glass clarity: live slider --- */
  const gv=Math.round(MDK.glass*100);
  const gr=h('input.mdk-rng',{type:'range',min:'10',max:'100',value:String(gv),title:L({en:'Glass clarity',ja:'ガラスの濃さ'}),'aria-label':'glass clarity'});
  gr.style.setProperty('--fill',gv+'%');
  gr.addEventListener('input',()=>{ MDK.setGlass(parseInt(gr.value,10)/100); gr.style.setProperty('--fill',gr.value+'%'); });
  u.pop.appendChild(h('div.mdk-pop-row',h('span.mdk-pop-lbl',L({en:'Glass',ja:'ガラス'})),gr));
  /* --- accent color: presets + custom picker + reset --- */
  const cRow=h('div.mdk-pop-row',h('span.mdk-pop-lbl',L({en:'Color',ja:'色'})));
  const clearSw=()=>cRow.querySelectorAll('.mdk-sw').forEach(x=>x.classList.remove('on'));
  ['#d8a94a','#e2607a','#9d7ae0','#4aa3e0','#3fc79a','#e0763f'].forEach(c=>{
    const sw=h('button.mdk-sw'+(String(MDK.accent||'').toLowerCase()===c?'.on':''),{type:'button',title:c,onclick:function(){
      MDK.setAccent(c); clearSw(); sw.classList.add('on'); ci.value=c;
    }});
    sw.style.background=c;
    cRow.appendChild(sw);
  });
  const ci=h('input.mdk-color',{type:'color',value:MDK.accent||'#d8a94a',title:L({en:'Custom color',ja:'カスタム色'}),'aria-label':'accent color'});
  ci.addEventListener('input',()=>{ MDK.setAccent(ci.value); clearSw(); });
  cRow.appendChild(ci);
  cRow.appendChild(h('button.mdk-chip',{type:'button',onclick:function(){ MDK.setAccent(null); clearSw(); ci.value='#d8a94a'; }},L({en:'Reset',ja:'リセット'})));
  u.pop.appendChild(cRow);
  u.pop.appendChild(h('div.mdk-pop-note',L({en:'Speed & loop repeat the current song or video. Glass: 10 = nearly clear, 100 = thick frost. Volume & mute live on the bar.',ja:'再生速度とループは曲・動画に適用。ガラス: 10 =澄み切った透明、100 = 濃いフロスト。音量・ミュートはバーで操作。'})));
};

/* apply volume / mute / speed to every live element */
MDK.apply=function(){
  const setEl=el=>{ if(!el||el.tagName==='IFRAME') return; try{ el.volume=MDK.vol; el.muted=!!MDK.mute; }catch(e){} };
  setEl(MDK.el); setEl(MDK.vid);
  if(typeof AZ_RADIO!=='undefined'&&AZ_RADIO.audio) setEl(AZ_RADIO.audio);
  [MDK.vid,MDK.el].forEach(el=>{
    if(!el||el.tagName==='IFRAME') return;
    const live=MDK.kind==='radio'&&el===((typeof AZ_RADIO!=='undefined'&&AZ_RADIO.audio)||null);
    if(live) return; /* live stream: natural speed, no loop */
    try{ el.loop=!!MDK.loop; }catch(e){}
    try{ el.playbackRate=MDK.rate; }catch(e){}
  });
  if(typeof AZ_MM!=='undefined'&&AZ_MM&&AZ_MM.setVol&&MDK.kind==='gen') AZ_MM.setVol(MDK.vol);
  if(typeof AZ_RADIO!=='undefined'&&AZ_RADIO.volIn&&AZ_RADIO.volIn.isConnected) AZ_RADIO.volIn.value=MDK.vol;
  const u=MDK.ui; if(!u) return;
  u.muteB.innerHTML=ico(MDK.mute?'mute':'speaker');
  u.muteB.title=L(MDK.mute?{en:'Unmute',ja:'ミュート解除'}:{en:'Mute',ja:'ミュート'});
  u.volS.value=String(Math.round(MDK.vol*100));
  u.volS.style.setProperty('--fill',Math.round(MDK.vol*100)+'%');
};
MDK.setVol=function(v){ MDK.vol=Math.max(0,Math.min(1,v||0)); store.set('azt_mdkvol',MDK.vol); MDK.apply(); };
MDK.mirrorVol=function(v){ MDK.vol=Math.max(0,Math.min(1,v||0)); store.set('azt_mdkvol',MDK.vol);
  const u=MDK.ui; if(u){ u.volS.value=String(Math.round(MDK.vol*100)); u.volS.style.setProperty('--fill',Math.round(MDK.vol*100)+'%'); } };

/* stop whatever is currently active (source + visuals) */
MDK._teardown=function(){
  const k=MDK.kind, el=MDK.el, wd=MDK.widget, vd=MDK.vid;
  MDK.kind=null; MDK.el=null; MDK.widget=null; MDK.vid=null;
  MDK._ticker(false); MDK.setArt('');
  if(k==='radio'){ if(typeof AZ_RADIO!=='undefined'&&AZ_RADIO.stop) AZ_RADIO.stop(); }
  else if(k==='gen'){ if(typeof AZ_MM!=='undefined'&&AZ_MM&&AZ_MM.stop) AZ_MM.stop(); }
  else if(el&&el.pause&&el.tagName!=='IFRAME'){ try{ el.pause(); }catch(e){} }
  if(wd&&wd.parentNode) wd.remove();
  /* a clip video returns to its tool slot (controls restored) if that tool is still open */
  if(vd&&vd.parentNode){ const home=vd._mdkHome;
    if(home){ if(home.isConnected&&vd._mdkCtl) vd.setAttribute('controls','');
      home.appendChild(vd); } /* back to its tool card — even a closed tool's — so skip-back still finds it */
    else vd.remove(); }
  const u=MDK.ui;
  if(u){ if(el&&el!==vd&&el.parentNode===u.vidWrap) el.remove(); u.vidWrap.hidden=true; }
};
MDK.detach=function(k){ if(MDK.kind!==k) return; MDK._teardown(); MDK._reset(); MDK.meta=null; MDK.render(); MDK.hide(); };
MDK.stop=function(){ MDK._teardown(); MDK._reset(); MDK.meta=null; MDK.render(); MDK.hide(); };
MDK._reset=function(){ MDK.queue=null; MDK.qi=-1; MDK.vitems=null; MDK.vidx=-1; MDK.vplay=null; };

/* --- song widget (mountPlayer) --- */
MDK.note=function(pl,media,meta){
  const u=MDK.ui; if(!u) return;
  if(MDK.kind&&MDK.kind!=='song'){ MDK._teardown(); }
  else if(MDK.widget&&MDK.widget!==pl){
    const pe=MDK.widget._mdkEl;
    try{ if(pe&&pe.pause) pe.pause(); }catch(e){}
    if(MDK.widget.parentNode) MDK.widget.remove();
    MDK.widget=null; MDK.el=null;
  }
  MDK.widget=pl; pl._mdkEl=media; MDK.el=media; MDK.kind='song';
  MDK.vitems=null; MDK.vidx=-1; MDK.vplay=null;
  MDK.meta={title:(meta&&meta.title)||'',sub:(meta&&meta.sub)||''};
  if(media){
    media.addEventListener('play',()=>MDK.sync());
    media.addEventListener('pause',()=>MDK.sync());
    media.addEventListener('ended',()=>MDK.sync());
    media.addEventListener('loadedmetadata',()=>MDK.apply());
    MDK.apply();
  }
  MDK.host=pl.parentNode||u.slot;
  /* the tool may have closed before the media resolved — rehome into the dock, compact */
  if(!MDK.host.isConnected){ u.slot.insertBefore(pl,u.vidWrap); MDK.host=u.slot; MDK.setMin(1); }
  MDK.render(); MDK.show(); MDK.sync();
};
MDK.setQueue=function(arr,cur){
  if(!Array.isArray(arr)||!arr.length){ MDK.queue=null; MDK.qi=-1; MDK.render(); return; }
  MDK.queue=arr;
  let i=-1;
  for(let k=0;k<MDK.queue.length;k++){
    const x=MDK.queue[k];
    if(x===cur||(x&&cur&&String(x.t||x.name||'')===String(cur.t||cur.name||'')&&String(x.a||x.artist||'')===String(cur.a||cur.artist||''))){ i=k; break; }
  }
  MDK.qi=i; MDK.render();
};

/* --- intro/outro theme video --- */
MDK.attachVideo=function(o){
  const u=MDK.ui; if(!u||!o||!o.el) return;
  const el=o.el;
  if(!el._mdk){
    el._mdk=1;
    el.addEventListener('play',()=>MDK.sync());
    el.addEventListener('pause',()=>MDK.sync());
    el.addEventListener('ended',()=>MDK.sync());
    el.addEventListener('loadedmetadata',()=>MDK.apply());
  }
  /* remember the tool slot the video came from, then dock it right away — the grip
     resize / fullscreen / loop keep working even while its tool stays open */
  if(!el._mdkHome) el._mdkHome=el.parentNode||null;
  if(el.parentNode!==u.vidWrap) u.vidWrap.appendChild(el);
  if(el.hasAttribute('controls')){ el._mdkCtl=1; el.removeAttribute('controls'); } /* dock transport replaces native controls */
  if(MDK.vid===el){
    MDK.vitems=o.items||null; MDK.vidx=(o.idx==null?-1:o.idx); MDK.vplay=o.play||null;
    MDK.setInfo(o.title||'',o.sub||''); MDK.show(); MDK.sync();
    return;
  }
  MDK._teardown();
  MDK.vid=el; MDK.el=el; MDK.kind='video';
  MDK.vitems=o.items||null; MDK.vidx=(o.idx==null?-1:o.idx); MDK.vplay=o.play||null;
  MDK.queue=null; MDK.qi=-1;
  MDK.meta={title:o.title||'',sub:o.sub||''};
  MDK.apply(); MDK.render(); MDK.show(); MDK.sync();
};
MDK.setVideoInfo=function(t,s){ if(MDK.kind==='video') MDK.setInfo(t,s); };

/* --- listen.moe radio --- */
MDK.attachRadio=function(){
  if(!MDK.ui) return;
  if(MDK.kind==='radio'){ MDK._radioMeta(); MDK.render(); MDK.show(); MDK.sync(); return; }
  MDK._teardown();
  MDK.kind='radio'; MDK.el=(typeof AZ_RADIO!=='undefined'&&AZ_RADIO.audio)||null;
  if(MDK.el&&!MDK.el._mdkR){
    MDK.el._mdkR=1;
    MDK.el.addEventListener('play',()=>MDK.sync());
    MDK.el.addEventListener('pause',()=>MDK.sync());
  }
  MDK._reset();
  MDK._radioMeta();
  MDK.apply(); MDK.render(); MDK.show(); MDK.sync();
};
MDK._radioMeta=function(){
  const st=(typeof AZ_RADIO!=='undefined'&&AZ_RADIO.station)==='kpop'?'K-POP':'J-POP';
  const m=typeof AZ_RADIO!=='undefined'&&AZ_RADIO.meta;
  MDK.meta={title:(m&&m.t)||L({en:'listen.moe live radio',ja:'listen.moe ライブラジオ'}),sub:st+' · listen.moe'};
};

/* --- music maker (generative) --- */
MDK.attachGen=function(){
  if(!MDK.ui) return;
  if(MDK.kind==='gen'){ MDK.show(); MDK.sync(); return; }
  MDK._teardown();
  MDK.kind='gen'; MDK.el=null;
  MDK._reset();
  if(typeof AZ_MM!=='undefined'&&AZ_MM&&AZ_MM.getVol) MDK.mirrorVol(AZ_MM.getVol());
  MDK.meta={title:L({en:'Anime Music Maker',ja:'アニメミュージックメーカー'}),sub:L({en:'generative Web Audio loop',ja:'Web Audio 生成ループ'})};
  MDK.apply(); MDK.render(); MDK.show(); MDK.sync();
};

/* --- transport --- */
MDK.toggle=function(){
  const k=MDK.kind;
  if(k==='radio'&&typeof AZ_RADIO!=='undefined'&&AZ_RADIO.toggle){ AZ_RADIO.toggle(); setTimeout(()=>MDK.sync(),140); return; }
  if(k==='gen'&&typeof AZ_MM!=='undefined'&&AZ_MM&&AZ_MM.toggle){ AZ_MM.toggle(); MDK.sync(); return; }
  if(k==='yt') return;
  const el=MDK.el; if(!el||!el.play) return;
  if(el.paused){ const p=el.play(); if(p&&p.catch) p.catch(()=>{}); } else el.pause();
};
MDK.jump=function(dir){
  const k=MDK.kind;
  if(k==='radio'){
    if(typeof AZ_RADIO!=='undefined'&&AZ_RADIO.switchTo){ AZ_RADIO.switchTo(AZ_RADIO.station==='kpop'?'jpop':'kpop'); MDK.attachRadio(); }
    return;
  }
  if(k==='gen') return;
  if(k==='video'){
    if(MDK.vitems&&MDK.vitems.length>1&&MDK.vplay){
      let i=MDK.vidx+dir; i=(i+MDK.vitems.length)%MDK.vitems.length;
      MDK.vplay(i);
    }
    return;
  }
  if(!MDK.queue||MDK.queue.length<2) return;
  let i=(MDK.qi<0?0:MDK.qi+dir); i=(i+MDK.queue.length)%MDK.queue.length;
  const u=MDK.ui;
  const host=(MDK.host&&MDK.host.isConnected)?MDK.host:(u?u.slot:null);
  if(!host) return;
  MDK.qi=i;
  playSong(MDK.queue[i],host,MDK.queue);
};

/* --- move media out of a closing modal into the dock (keeps playing) --- */
MDK.reattach=function(scope){
  const u=MDK.ui; if(!u||!MDK.kind) return;
  if(MDK.widget&&scope.contains(MDK.widget)){ u.slot.insertBefore(MDK.widget,u.vidWrap); MDK.host=u.slot; }
  if(MDK.vid&&scope.contains(MDK.vid)){ u.vidWrap.appendChild(MDK.vid); }
  MDK.render();
};

/* --- view --- */
MDK.setInfo=function(t,s){ if(!MDK.kind) return; MDK.meta={title:t||'',sub:s||''}; MDK.render(); };
/* --- ambient album glow (Spotify / Apple Music style) --- */
MDK.setArt=function(url){ const u=MDK.ui; if(!u) return;
  u.dom.style.setProperty('--mdk-art',url?'url("'+url+'")':'none');
  u.dom.classList.toggle('mdk-hasart',!!url); };
/* --- dock size modes: full → compact (small bar while browsing) → minimal (audio-only pill) --- */
MDK.setMode=function(m){
  MDK.mode=Math.max(0,Math.min(2,(m==null?0:+m)|0));
  MDK.min=MDK.mode===2?1:0; /* legacy flag: 1 only in the audio-only pill */
  const u=MDK.ui; if(!u) return;
  u.dom.classList.toggle('mdk-compact',MDK.mode===1);
  u.dom.classList.toggle('mdk-min',MDK.mode===2);
  u.minB.innerHTML=ico(['chevd','chevdd','chevu'][MDK.mode]);
  u.minB.title=L(MDK.mode===2?{en:'Expand the player',ja:'プレイヤーを展開'}
    :MDK.mode===1?{en:'Collapse further — audio-only pill',ja:'さらに縮小 — 音楽だけのピル'}
    :{en:'Shrink the bar — compact while you browse',ja:'バーを縮小 — 閲覧中はコンパクト'});
  MDK.keepOnScreen(); /* the pill changes size — pull it back into view if needed */
  MDK.fitControls(); setTimeout(()=>MDK.fitControls(),300); /* re-check after the width transition settles */
};
/* --- minimal mode: hide the video/visuals, keep the music playing --- */
MDK.setMin=function(v){ MDK.setMode(v?2:0); };
/* --- nothing may leave the screen: size caps + position clamp (used by every resize path) --- */
MDK._maxVidW=function(){
  return Math.max(160,Math.min(720,innerWidth-40,Math.round((innerHeight-125)*16/9)));
};
MDK.keepOnScreen=function(){
  const u=MDK.ui; if(!u) return; const dom=u.dom;
  if(dom.hidden||!dom.classList.contains('mdk-float')) return;
  const r=dom.getBoundingClientRect();
  const x=Math.max(8,Math.min(Math.max(8,innerWidth-r.width-8),parseFloat(dom.style.left)||8));
  const y=Math.max(8,Math.min(Math.max(8,innerHeight-r.height-8),parseFloat(dom.style.top)||8));
  dom.style.left=Math.round(x)+'px'; dom.style.top=Math.round(y)+'px';
};
/* --- the bar adapts to its own width: buttons shrink, then drop off (essentials stay) --- */
MDK.fitControls=function(){
  const u=MDK.ui; if(!u) return; const dom=u.dom;
  if(dom.hidden) return;
  const w=Math.round(dom.getBoundingClientRect().width)||0;
  if(!w) return; /* hidden — decide on the next render */
  dom.classList.toggle('mdk-w1',w<660);
  dom.classList.toggle('mdk-w2',w<580);
  dom.classList.toggle('mdk-w3',w<500);
  dom.classList.toggle('mdk-w4',w<430);
  /* overflow guard: the width buckets are an estimate — measure the real row and keep
     tightening (gaps → extras → keep-critical) until nothing hangs off the bar's edge */
  const row=dom.querySelector('.mdk-row');
  dom.classList.remove('mdk-x1','mdk-x2','mdk-x3');
  let tier=0;
  while(row&&row.scrollWidth>row.clientWidth+1&&tier<3) dom.classList.add('mdk-x'+(++tier));
};
/* --- loop: repeat the current song / video --- */
MDK.setLoop=function(v){
  MDK.loop=v?1:0; store.set('azt_mdkloop',MDK.loop);
  [MDK.vid,MDK.el].forEach(el=>{ if(el&&el.tagName!=='IFRAME'){ try{ el.loop=!!MDK.loop; }catch(e){} } });
  const u=MDK.ui; if(!u) return;
  u.loopB.classList.toggle('on',!!MDK.loop);
  u.loopB.title=L(MDK.loop?{en:'Looping — click to stop',ja:'ループ中 — クリックで解除'}:{en:'Loop this track',ja:'この曲をループ'});
  if(!u.pop.hidden) MDK.buildPop();
};
/* --- fullscreen: blow the current video up to fill the screen --- */
MDK.fullscreen=function(){
  const el=MDK.vid||(MDK.el&&MDK.el.tagName==='VIDEO'?MDK.el:null);
  if(!el) return;
  try{
    if(document.fullscreenElement||document.webkitFullscreenElement){ (document.exitFullscreen||document.webkitExitFullscreen).call(document); }
    else if(el.requestFullscreen) el.requestFullscreen();
    else if(el.webkitRequestFullscreen) el.webkitRequestFullscreen(); /* iOS Safari */
  }catch(e){}
};
/* --- liquid-glass clarity: 1 = thick frost (default) … .1 = nearly clear --- */
MDK.setGlass=function(v){
  MDK.glass=Math.max(.1,Math.min(1,+v||1)); store.set('azt_mdkglass',MDK.glass);
  const u=MDK.ui; if(u) u.dom.style.setProperty('--mdk-glass',String(MDK.glass));
};
/* --- accent color: tints ring, glow, progress, EQ, play button, sliders --- */
MDK.setAccent=function(hex){
  MDK.accent=hex||null; store.set('azt_mdkcolor',MDK.accent);
  const u=MDK.ui; if(!u) return;
  if(hex){ u.dom.style.setProperty('--mdk-ac',hex); u.dom.style.setProperty('--mdk-ac2',MDK._lighten(hex,.4)); }
  else { u.dom.style.removeProperty('--mdk-ac'); u.dom.style.removeProperty('--mdk-ac2'); }
};
MDK._lighten=function(hex,w){
  const m=String(hex).match(/^#?([0-9a-f]{6})$/i); if(!m) return hex;
  const n=parseInt(m[1],16), f=c=>Math.round(c+(255-c)*w);
  return 'rgb('+f((n>>16)&255)+','+f((n>>8)&255)+','+f(n&255)+')';
};
/* does the title overflow? (duplicated track scrolls only when it does) */
MDK._measureTitle=function(){
  const u=MDK.ui; if(!u) return;
  try{
    const track=u.title.querySelector('.mdk-track'), t1=track&&track.firstElementChild;
    const w=t1?t1.getBoundingClientRect().width:0;
    const over=w>u.title.clientWidth-4;
    u.title.classList.toggle('over',over);
    if(over) u.title.style.setProperty('--mdw',Math.round(w+34)+'px');
  }catch(e){}
};
/* --- progress bar: real time when the media knows it, indeterminate shimmer for live sources --- */
MDK._fmt=function(s){ s=Math.max(0,s||0); const m=Math.floor(s/60), x=Math.floor(s%60); return m+':'+(x<10?'0':'')+x; };
MDK._mediaEl=function(){
  const v=MDK.vid; if(v&&isFinite(v.duration)&&v.duration>0) return v;
  const e=MDK.el; if(e&&e.tagName!=='IFRAME'&&isFinite(e.duration)&&e.duration>0) return e;
  return null;
};
MDK._pt=null;
MDK._tick=function(){
  const u=MDK.ui; if(!u) return;
  const el=MDK._mediaEl();
  if(el){ u.bar.classList.remove('ind');
    const d=el.duration||0, c=el.currentTime||0;
    u.barFill.style.width=(d?Math.min(100,c/d*100):0)+'%';
    u.tCur.textContent=MDK._fmt(c); u.tTot.textContent=MDK._fmt(d);
  } else if(MDK.kind){
    /* live radio / generative loops have no duration — shimmer until real time appears */
    u.bar.classList.add('ind'); u.barFill.style.width='';
    u.tCur.textContent='';
    u.tTot.textContent=(MDK.kind==='radio'||MDK.kind==='gen')?L({en:'LIVE',ja:'ライブ'}):'';
  } else { u.bar.classList.remove('ind'); u.barFill.style.width='0%'; u.tCur.textContent='0:00'; u.tTot.textContent='0:00'; }
};
MDK._ticker=function(on){
  if(MDK._pt){ clearInterval(MDK._pt); MDK._pt=null; }
  if(on) MDK._pt=setInterval(()=>{ try{ MDK._tick(); }catch(e){} },500);
};
MDK.render=function(){
  const u=MDK.ui; if(!u) return;
  const k=MDK.kind;
  const t=(MDK.meta&&MDK.meta.title)||'', s=(MDK.meta&&MDK.meta.sub)||'';
  if(u.title.dataset.t!==t){
    u.title.dataset.t=t;
    clear(u.title);
    const track=h('div.mdk-track',h('span.mdk-t1',t),h('span.mdk-t2',{'aria-hidden':'true'},t));
    u.title.appendChild(track);
    u.dom.classList.remove('mdk-swap'); void u.dom.offsetWidth; u.dom.classList.add('mdk-swap');
    MDK._measureTitle();
  }
  u.sub.textContent=s;
  const inW=!!(MDK.widget&&MDK.widget.isConnected&&MDK.widget.parentNode===u.slot);
  /* music files are real videos — dock the video itself so the grip / fullscreen work,
     instead of showing the pl widget card while it plays */
  if(MDK.kind==='song'&&MDK.el&&MDK.el.tagName==='VIDEO'&&MDK.el.isConnected&&MDK.el.parentNode!==u.vidWrap){
    if(!MDK.el._mdkHome) MDK.el._mdkHome=MDK.el.parentNode||null;
    u.vidWrap.appendChild(MDK.el);
  }
  const songVid=!!(MDK.kind==='song'&&MDK.el&&MDK.el.tagName==='VIDEO'&&MDK.el.isConnected&&MDK.el.parentNode===u.vidWrap);
  if(songVid&&inW) MDK.widget.classList.add('mdk-off'); /* the dock shows the video now, not the card */
  const inV=!!((MDK.vid&&MDK.vid.isConnected&&MDK.vid.parentNode===u.vidWrap)||songVid);
  /* native controls sit on top of the grip — the dock's own transport replaces them */
  if(inV){ const nv=songVid?MDK.el:MDK.vid;
    if(nv&&nv.hasAttribute('controls')) nv.removeAttribute('controls'); }
  u.slot.hidden=!(inW||inV);
  u.vidWrap.hidden=!inV;
  if(inV){ const w=+store.get('azt_mdkvidw',0)||0; /* restore a saved custom drag size */
    if(w) u.vidWrap.style.width=Math.min(w,MDK._maxVidW())+'px'; }
  u.dom.classList.toggle('has-widget',inW&&!songVid);
  u.prog.hidden=!k; if(k) MDK._tick();
  /* ambient glow follows the current cover art (inline in its tool, or rehomed in the dock) */
  let artUrl='';
  if(MDK.widget&&MDK.widget.isConnected){ const im=MDK.widget.querySelector('.pl-art img');
    if(im){ artUrl=im.currentSrc||im.getAttribute('src')||'';
      if(!im._mdkA){ im._mdkA=1; im.addEventListener('load',()=>{ if(MDK.widget&&MDK.widget.contains(im)) MDK.setArt(im.currentSrc||im.src||''); }); } } }
  else if(inV&&MDK.vid) artUrl=MDK.vid.getAttribute('poster')||'';
  MDK.setArt(artUrl);
  const isRadio=k==='radio', isGen=k==='gen';
  let showNav=false;
  if(isRadio) showNav=true;
  else if(k==='video') showNav=!!(MDK.vitems&&MDK.vitems.length>1);
  else if(k==='song') showNav=!!(MDK.queue&&MDK.queue.length>1);
  u.prev.hidden=u.next.hidden=!showNav;
  u.prev.title=u.next.title=L(isRadio?{en:'Switch station (J-POP / K-POP)',ja:'スタジオ切替（J-POP / K-POP）'}:{en:'Skip track',ja:'スキップ'});
  u.play.hidden=(k==='yt');
  u.sizeB.hidden=!((k==='video'||k==='song')&&inV);
  u.setB.hidden=false;   /* speed / loop / glass / color — for every kind */
  u.loopB.hidden=!((k==='song'||k==='video')&&!!(MDK.el&&MDK.el.tagName!=='IFRAME'));
  u.fullB.hidden=!((k==='video'||k==='song')&&!!(MDK.el&&MDK.el.tagName==='VIDEO'));
  u.loopB.classList.toggle('on',!!MDK.loop);
  u.vr.hidden=(k==='yt');
  u.sizeB.title=L({en:'Video size — compact ↔ big',ja:'動画サイズ — コンパクト ↔ 大'});
  u.setB.title=L({en:'Player & style settings',ja:'プレイヤー＆スタイル設定'});
  u.stopB.title=L({en:'Stop & close',ja:'停止して閉じる'});
  MDK.keepOnScreen(); /* media shown/hidden changes the bar's size — stay within the screen */
  MDK.fitControls(); /* controls adapt to the bar's current width */
};
MDK.sync=function(){
  const u=MDK.ui; if(!u) return;
  const k=MDK.kind;
  let playing=false;
  if(k==='radio') playing=!!(typeof AZ_RADIO!=='undefined'&&AZ_RADIO.audio&&!AZ_RADIO.audio.paused);
  else if(k==='gen') playing=!!(typeof AZ_MM!=='undefined'&&AZ_MM&&AZ_MM.isPlaying&&AZ_MM.isPlaying());
  else if(k==='yt') playing=!!(MDK.widget&&MDK.widget.classList.contains('playing'));
  else if(MDK.el&&MDK.el.tagName!=='IFRAME') playing=!!(MDK.el&&!MDK.el.paused&&!MDK.el.ended);
  u.dom.classList.toggle('live',playing);
  u.play.innerHTML=playing?ico('pause'):ico('play');
  u.play.title=L(playing?{en:'Pause',ja:'一時停止'}:{en:'Play',ja:'再生'});
  MDK._ticker(playing); MDK._tick();
};
MDK.show=function(){
  const u=MDK.ui; if(!u) return;
  if(u.dom.hidden||u.dom.classList.contains('mdk-out')){
    u.dom.hidden=false; u.dom.classList.remove('mdk-out');
    u.dom.classList.remove('mdk-in'); void u.dom.offsetWidth; u.dom.classList.add('mdk-in');
  }
  MDK._measureTitle(); /* visible now — real width for the marquee check */
};
MDK.hide=function(){
  const u=MDK.ui; if(!u||u.dom.hidden) return;
  u.dom.classList.add('mdk-out');
  setTimeout(()=>{ if(u.dom.classList.contains('mdk-out')){ u.dom.hidden=true; u.dom.classList.remove('mdk-out','mdk-in'); } },260);
};

/* ============================================================
   API CREDITS FOOTER — every source, free & keyless, with links
   ============================================================ */
function renderApiFooter(){
  const box=$('#apiCred'); if(!box||box.dataset.done) return;
  box.dataset.done='1';
  const GN={primary:{en:'Primary',ja:'主要'},fallback:{en:'Automatic fallbacks',ja:'自動フォールバック'},asset:{en:'Supporting APIs',ja:'補助API'}};
  const wrap=h('div.api-grid');
  API_SOURCES.forEach((s,i)=>{
    const url=s.url||('https://'+s.host);
    const card=h('a.api-card',{href:url,target:'_blank',rel:'noopener',style:'animation-delay:'+(i*45)+'ms'},
      h('div.api-head',
        h('span.api-dot.'+s.group),
        h('b',s.name),
        h('span.badge.green.api-free',L({en:'Free · No key',ja:'無料 · キー不要'}))),
      h('div.api-host',s.host),
      h('div.api-note',L(s.note)),
      h('div.api-go',L({en:'Visit API ↗',ja:'APIを開く ↗'}))
    );
    wrap.appendChild(card);
  });
  box.appendChild(wrap);
}
/* reveal-on-scroll for sections */
function initReveal(){
  if(!('IntersectionObserver' in window)){ $$('.reveal').forEach(el=>el.classList.add('in')); return; }
  const io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }),{threshold:.15});
  $$('.reveal').forEach(el=>io.observe(el));
}

/* ============================================================
   SAKURA PETALS CANVAS
   ============================================================ */
/* ============================================================
   BACKGROUND VFX ENGINE — 12 switchable ambient effects
   ============================================================ */
const VFX_ITEMS=[
  {k:'off',      ico:'x',        t:'eOff'},
  {k:'sakura',   ico:'flower',   t:'eSakura'},
  {k:'snow',     ico:'snow',     t:'eSnow'},
  {k:'firefly',  ico:'sparkles', t:'eFly'},
  {k:'rain',     ico:'cloud',    t:'eRain'},
  {k:'ember',    ico:'flame',    t:'eEmber'},
  {k:'star',     ico:'star',     t:'eStar'},
  {k:'firework', ico:'burst',    t:'eFire'},
  {k:'aura',     ico:'aura',     t:'eAura'},
  {k:'bubble',   ico:'bubble',   t:'eBubble'},
  {k:'zap',      ico:'zap',      t:'eZap'},
  {k:'galaxy',   ico:'galaxy',   t:'eGalaxy'},
  {k:'hole',     ico:'blackhole',t:'eHole'}
];
let vfxMode=store.get('azt_vfx','sakura');
let vfxApply=null;

function setVFX(k){
  if(!VFX_ITEMS.some(i=>i.k===k)) k='sakura';
  vfxMode=k; store.set('azt_vfx',k);
  if(vfxApply) vfxApply(k);
  const c=$('#petals');
  if(c&&k!=='off'&&c.style.display!=='none'){
    c.classList.remove('bloom'); void c.offsetWidth; c.classList.add('bloom');
  }
  paintFxPops(); paintDockState();
  if(k!=='off') toast('✨ '+L(S[VFX_ITEMS.find(i=>i.k===k).t]));
}

/* wallpaper visibility — dims the fixed background layer without touching the
   dock art. Independent from the wallpaper choice, so a bright photo can stay
   on while the UI remains readable. Persisted as azt_wpd (percent). */
const WP_DIM=store.get('azt_wpd',95);
const WP_BLUR=store.get('azt_wpbl',0);
function setWallpaperDim(v){
  v=Math.max(30,Math.min(100,+v||95));
  store.set('azt_wpd',v);
  const el=$('#wallpaper');
  if(el&&el.dataset.eye!=='off') el.style.opacity=String(v/100);
}
function setWallpaperBlur(v){
  v=Math.max(0,Math.min(20,+v||0));
  store.set('azt_wpbl',v);
  const el=$('#wallpaper');
  if(el) el.style.filter=v>0?'blur('+v+'px)':'';
}

/* one-tap wallpaper visibility — the eye button next to Wallpaper in the dock.
   Works even when the gallery pop can't fit on a small screen. */
function toggleWallpaperEye(){
  const el=$('#wallpaper'); if(!el) return;
  const off=el.dataset.eye==='off';
  if(off){ el.dataset.eye='on'; el.style.opacity=String(WP_DIM/100); }
  else { el.dataset.eye='off'; el.style.opacity='0'; }
  store.set('azt_wpeye',el.dataset.eye);
  const we=$('#wpEye');
  if(we){
    const d=we.querySelector('.dico');
    if(d) d.innerHTML=ico(off?'eye':'eyeoff');
    we.classList.toggle('on',off);
  }
  toast((off?ico('eye')+' '+L(S.wpEyeOn):ico('eyeoff')+' '+L(S.wpEyeOff)));
}
function syncWallpaperEye(){
  const el=$('#wallpaper'); if(!el) return;
  const off=store.get('azt_wpeye','on')==='off';
  el.dataset.eye=off?'off':'on';
  el.style.opacity=off?'0':String(WP_DIM/100);
  const we=$('#wpEye');
  if(we){
    const d=we.querySelector('.dico');
    if(d) d.innerHTML=ico(off?'eyeoff':'eye');
    we.classList.toggle('on',!off);
  }
}

function initVFX(){
  const c=$('#petals'); if(!c) return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){
    c.style.display='none';
    vfxApply=function(){};
    return;
  }
  const ctx=c.getContext('2d');
  let W=0,H=0,t=0,running=true,cur=null,last=performance.now(),rid=0;
  const small=innerWidth<700;
  const rnd=(a,b)=>a+Math.random()*(b-a);
  const N=k=>small?Math.ceil(k*.55):k;

  const BUILD={
    sakura(){
      const mk=y=>({x:rnd(0,W),y:y??rnd(-H,0),r:rnd(5,11),sp:rnd(.3,1.1),
        dr:rnd(-1,1),a:rnd(0,6.28),va:rnd(-.015,.015),
        col:pick(['#f7c6cf','#f3a7b6','#ffe3ea','#e8b4c8','#ffd9c2']),o:rnd(.35,.8)});
      const ps=Array.from({length:N(42)},()=>mk());
      return {frame(){
        for(const p of ps){
          p.y+=p.sp; p.x+=p.dr+Math.sin(p.y/70)*.5; p.a+=p.va;
          if(p.y>H+20) Object.assign(p,mk(-20));
          ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.a); ctx.globalAlpha=p.o;
          ctx.fillStyle=p.col; ctx.beginPath();
          ctx.moveTo(0,-p.r);
          ctx.bezierCurveTo(p.r*.9,-p.r*.6,p.r*.7,p.r*.7,0,p.r);
          ctx.bezierCurveTo(-p.r*.7,p.r*.7,-p.r*.9,-p.r*.6,0,-p.r);
          ctx.fill(); ctx.restore();
        }
        ctx.globalAlpha=1;
      }};
    },
    snow(){
      const mk=y=>({x:rnd(0,W),y:y??rnd(-H,0),r:rnd(1.4,4.2),sp:rnd(.35,1.2),ph:rnd(0,6.28),o:rnd(.3,.9)});
      const ps=Array.from({length:N(85)},()=>mk());
      return {frame(){
        ctx.fillStyle='#fff';
        for(const p of ps){
          p.y+=p.sp; p.x+=Math.sin(t*.9+p.ph)*.5;
          if(p.y>H+6) Object.assign(p,mk(-6));
          ctx.globalAlpha=p.o;
          ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,6.283); ctx.fill();
        }
        ctx.globalAlpha=1;
      }};
    },
    firefly(){
      const mk=()=>({x:rnd(0,W),y:rnd(0,H),vx:rnd(-.3,.3),vy:rnd(-.25,.25),
        r:rnd(1.2,2.6),ph:rnd(0,6.28),hu:pick([52,66,84,44])});
      const ps=Array.from({length:N(26)},mk);
      return {frame(){
        ctx.globalCompositeOperation='lighter';
        for(const p of ps){
          p.vx=Math.max(-.5,Math.min(.5,p.vx+rnd(-.05,.05)));
          p.vy=Math.max(-.45,Math.min(.45,p.vy+rnd(-.05,.05)));
          p.x+=p.vx; p.y+=p.vy;
          if(p.x<-10)p.x=W+10; if(p.x>W+10)p.x=-10;
          if(p.y<-10)p.y=H+10; if(p.y>H+10)p.y=-10;
          const a=.2+.65*(.5+.5*Math.sin(t*2.4+p.ph));
          const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*6);
          g.addColorStop(0,'hsla('+p.hu+',95%,72%,'+a+')');
          g.addColorStop(1,'hsla('+p.hu+',95%,60%,0)');
          ctx.fillStyle=g; ctx.beginPath(); ctx.arc(p.x,p.y,p.r*6,0,6.283); ctx.fill();
          ctx.globalAlpha=Math.min(1,a+.2); ctx.fillStyle='#fff';
          ctx.beginPath(); ctx.arc(p.x,p.y,p.r*.9,0,6.283); ctx.fill();
          ctx.globalAlpha=1;
        }
        ctx.globalCompositeOperation='source-over';
      }};
    },
    rain(){
      const mk=y=>({x:rnd(-40,W+40),y:y??rnd(-H,0),len:rnd(9,24),sp:rnd(7,13),sl:rnd(.5,1.6)});
      const ps=Array.from({length:N(130)},()=>mk());
      return {frame(){
        ctx.strokeStyle='rgba(165,205,255,.5)'; ctx.lineWidth=1;
        ctx.beginPath();
        for(const p of ps){
          p.y+=p.sp; p.x+=p.sl;
          if(p.y>H+p.len) Object.assign(p,mk(-p.len));
          ctx.moveTo(p.x,p.y); ctx.lineTo(p.x-p.sl*2,p.y-p.len);
        }
        ctx.stroke();
      }};
    },
    ember(){
      const mk=y=>({x:rnd(0,W),y:y??H+rnd(4,50),vx:rnd(-.35,.35),vy:rnd(-1.5,-.35),
        r:rnd(1.2,3),ph:rnd(0,6.28),hu:pick([16,26,38,6,44])});
      const ps=Array.from({length:N(52)},()=>mk());
      return {frame(){
        ctx.globalCompositeOperation='lighter';
        for(const p of ps){
          p.y+=p.vy; p.x+=p.vx+Math.sin(t*2.6+p.ph)*.45;
          if(p.y<-12){ p.y=H+rnd(4,50); p.x=rnd(0,W); }
          const a=.35+.5*(.5+.5*Math.sin(t*3+p.ph));
          const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*4);
          g.addColorStop(0,'hsla('+p.hu+',100%,64%,'+a+')');
          g.addColorStop(1,'hsla('+p.hu+',100%,50%,0)');
          ctx.fillStyle=g; ctx.beginPath(); ctx.arc(p.x,p.y,p.r*4,0,6.283); ctx.fill();
        }
        ctx.globalCompositeOperation='source-over';
      }};
    },
    star(){
      const mk=()=>({x:rnd(0,W),y:rnd(0,H),r:rnd(.6,2.2),ph:rnd(0,6.28),
        sp:rnd(.5,1.8),c:pick(['#fff','#cfe1ff','#ffe9c9','#e7d6ff','#bfeaff'])});
      const ps=Array.from({length:N(150)},mk);
      return {frame(){
        for(const p of ps){
          p.y+=p.sp*.05;
          if(p.y>H+3){ p.y=-3; p.x=rnd(0,W); }
          ctx.globalAlpha=.2+.75*Math.abs(Math.sin(t*p.sp+p.ph));
          ctx.fillStyle=p.c;
          ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,6.283); ctx.fill();
        }
        ctx.globalAlpha=1;
      }};
    },
    firework(){
      const rockets=[],sparks=[];
      let next=0;
      const HUE=()=>pick([0,18,42,130,175,200,265,300,330]);
      const launch=()=>rockets.push({x:rnd(W*.12,W*.88),y:H,vx:rnd(-.6,.6),vy:-rnd(6.4,9),hu:HUE()});
      return {frame(){
        if(t>next){
          launch(); if(Math.random()<.4) launch();
          next=t+rnd(.7,1.6);
        }
        ctx.globalCompositeOperation='lighter';
        for(let i=rockets.length-1;i>=0;i--){
          const r=rockets[i];
          r.x+=r.vx; r.y+=r.vy; r.vy+=.12;
          ctx.fillStyle='hsla('+r.hu+',95%,70%,.9)';
          ctx.beginPath(); ctx.arc(r.x,r.y,2.2,0,6.283); ctx.fill();
          if(r.vy>=-1.2){
            const n=N(70);
            for(let j=0;j<n;j++){
              const a=(j/n)*6.283+rnd(-.08,.08), sp=rnd(1.4,4.4);
              sparks.push({x:r.x,y:r.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,hu:r.hu,life:1});
            }
            rockets.splice(i,1);
          }
        }
        for(let i=sparks.length-1;i>=0;i--){
          const s=sparks[i];
          s.x+=s.vx; s.y+=s.vy; s.vy+=.045; s.vx*=.985; s.vy*=.985; s.life-=.014;
          if(s.life<=0){ sparks.splice(i,1); continue; }
          ctx.globalAlpha=Math.max(0,s.life);
          ctx.fillStyle='hsla('+s.hu+',95%,65%,1)';
          ctx.beginPath(); ctx.arc(s.x,s.y,1.7,0,6.283); ctx.fill();
        }
        ctx.globalAlpha=1;
        ctx.globalCompositeOperation='source-over';
      }};
    },
    aura(){
      const mk=()=>({x:rnd(W*.15,W*.85),y:rnd(H*.15,H*.85),vx:rnd(-.16,.16),
        vy:rnd(-.13,.13),r:rnd(34,88),hu:pick([186,198,262,286,316]),ph:rnd(0,6.28)});
      const ps=Array.from({length:N(7)},mk);
      return {frame(){
        ctx.globalCompositeOperation='lighter';
        for(const p of ps){
          p.x+=p.vx; p.y+=p.vy;
          if(p.x<-p.r)p.x=W+p.r; if(p.x>W+p.r)p.x=-p.r;
          if(p.y<-p.r)p.y=H+p.r; if(p.y>H+p.r)p.y=-p.r;
          const pulse=.75+.25*Math.sin(t*1.6+p.ph);
          const rr=p.r*pulse;
          const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,rr);
          g.addColorStop(0,'hsla('+p.hu+',90%,62%,.12)');
          g.addColorStop(.6,'hsla('+p.hu+',90%,58%,.05)');
          g.addColorStop(1,'hsla('+p.hu+',90%,55%,0)');
          ctx.fillStyle=g; ctx.beginPath(); ctx.arc(p.x,p.y,rr,0,6.283); ctx.fill();
          for(let k=0;k<3;k++){
            const a=t*(1.1+k*.35)+p.ph+k*2.09, orb=rr*.72;
            ctx.fillStyle='hsla('+p.hu+',95%,78%,.75)';
            ctx.beginPath();
            ctx.arc(p.x+Math.cos(a)*orb,p.y+Math.sin(a)*orb,1.6,0,6.283);
            ctx.fill();
          }
        }
        ctx.globalCompositeOperation='source-over';
      }};
    },
    bubble(){
      const mk=y=>({x:rnd(0,W),y:y??H+rnd(4,60),r:rnd(3,14),sp:rnd(.3,1.1),
        ph:rnd(0,6.28),o:rnd(.14,.36)});
      const ps=Array.from({length:N(46)},()=>mk());
      return {frame(){
        for(const p of ps){
          p.y-=p.sp; p.x+=Math.sin(t*1.4+p.ph)*.6;
          if(p.y<-p.r-4) Object.assign(p,mk(H+p.r+4));
          ctx.globalAlpha=p.o+.1;
          ctx.strokeStyle='rgba(235,250,255,.9)'; ctx.lineWidth=1;
          ctx.fillStyle='rgba(195,232,255,'+(p.o*.55)+')';
          ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,6.283); ctx.fill(); ctx.stroke();
          ctx.globalAlpha=Math.min(1,p.o+.42);
          ctx.fillStyle='#fff';
          ctx.beginPath();
          ctx.arc(p.x-p.r*.34,p.y-p.r*.36,Math.max(1,p.r*.22),0,6.283);
          ctx.fill();
        }
        ctx.globalAlpha=1;
      }};
    },
    zap(){
      const mk=()=>({x:rnd(0,W),y:rnd(0,H),a:pick([-.55,-.38,.38,.55]),
        len:rnd(26,95),sp:rnd(5,11),hu:pick([186,200,196,278,52]),w:rnd(1,2.1)});
      const ps=Array.from({length:N(58)},mk);
      return {frame(){
        ctx.globalCompositeOperation='lighter';
        ctx.lineCap='round';
        for(const p of ps){
          p.x+=Math.cos(p.a)*p.sp; p.y+=Math.sin(p.a)*p.sp;
          if(p.x<-120||p.x>W+120||p.y<-120||p.y>H+120){ Object.assign(p,mk()); }
          const dx=Math.cos(p.a)*p.len, dy=Math.sin(p.a)*p.len;
          ctx.strokeStyle='hsla('+p.hu+',95%,66%,.55)'; ctx.lineWidth=p.w;
          ctx.beginPath(); ctx.moveTo(p.x-dx,p.y-dy); ctx.lineTo(p.x,p.y); ctx.stroke();
          ctx.strokeStyle='hsla('+p.hu+',100%,86%,.85)'; ctx.lineWidth=p.w*.45;
          ctx.beginPath(); ctx.moveTo(p.x-dx*.4,p.y-dy*.4); ctx.lineTo(p.x,p.y); ctx.stroke();
        }
        ctx.globalCompositeOperation='source-over';
      }};
    },
    galaxy(){
      const mk=()=>({r:rnd(16,Math.min(W,H)*.46),ang:rnd(0,6.28),sz:rnd(.5,1.9),
        c:pick(['#e9d6ff','#cfe1ff','#fff','#ffd9e8','#bfeaff','#ffe9c9'])});
      const ps=Array.from({length:N(320)},mk);
      return {frame(){
        const X=W/2,Y=H*.44,M=Math.min(W,H)*.46;
        ctx.globalCompositeOperation='lighter';
        const g=ctx.createRadialGradient(X,Y,0,X,Y,Math.max(30,M*.17));
        g.addColorStop(0,'rgba(255,244,225,.85)');
        g.addColorStop(.25,'rgba(214,178,255,.35)');
        g.addColorStop(1,'rgba(140,110,220,0)');
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(X,Y,Math.max(30,M*.17),0,6.283); ctx.fill();
        for(const p of ps){
          const r=Math.min(p.r,M);
          p.ang+=.0009+.06/(r*.03+1);
          const arm=Math.sin(p.ang*2-r*.032);
          const a=.12+.8*Math.pow((arm+1)/2,2);
          ctx.globalAlpha=a; ctx.fillStyle=p.c;
          ctx.beginPath();
          ctx.arc(X+Math.cos(p.ang)*r,Y+Math.sin(p.ang)*r*.55,p.sz,0,6.283);
          ctx.fill();
        }
        ctx.globalAlpha=1;
        ctx.globalCompositeOperation='source-over';
      }};
    },
    hole(){
      const mk=()=>{ const lo=Math.max(46,Math.min(W,H)*.07), hi=Math.max(lo+40,Math.min(W,H)*.44);
        return {r:rnd(lo,hi),ang:rnd(0,6.28),sz:rnd(.8,2.4),hu:pick([18,30,44,268,256,196])}; };
      const ps=Array.from({length:N(150)},mk);
      return {frame(){
        const X=W/2,Y=H*.46,core=Math.max(24,Math.min(W,H)*.055);
        ctx.globalCompositeOperation='lighter';
        for(const p of ps){
          p.r-=(.18+46/(p.r+10))*.55;
          p.ang+=.004+.19/(p.r*.02+1);
          if(p.r<core*.95){ Object.assign(p,mk()); continue; }
          const a=.15+Math.min(1,(p.r-core)/(Math.min(W,H)*.18))*.75;
          ctx.globalAlpha=a; ctx.fillStyle='hsla('+p.hu+',95%,62%,1)';
          ctx.beginPath();
          ctx.arc(X+Math.cos(p.ang)*p.r,Y+Math.sin(p.ang)*p.r*.58,p.sz,0,6.283);
          ctx.fill();
        }
        ctx.globalAlpha=1;
        ctx.globalCompositeOperation='source-over';
        ctx.strokeStyle='rgba(255,196,120,.42)'; ctx.lineWidth=2;
        ctx.beginPath();
        ctx.ellipse(X,Y,core*1.35,core*1.35*.58,0,0,6.283);
        ctx.stroke();
        ctx.fillStyle='#020207';
        ctx.beginPath(); ctx.arc(X,Y,core,0,6.283); ctx.fill();
        ctx.strokeStyle='rgba(255,170,90,.5)'; ctx.lineWidth=1.4;
        ctx.beginPath(); ctx.arc(X,Y,core+1.5,0,6.283); ctx.stroke();
      }};
    }
  };

  function size(){ W=c.width=innerWidth; H=c.height=innerHeight; }
  function apply(k){
    if(k==='off'||!BUILD[k]){ cur=null; ctx.clearRect(0,0,W,H); return; }
    try{ cur=BUILD[k](); }catch(e){ cur=null; }
    ctx.clearRect(0,0,W,H);
  }
  vfxApply=apply;
  size(); apply(vfxMode);
  addEventListener('resize',()=>{ size(); apply(vfxMode); });
  document.addEventListener('visibilitychange',()=>{
    running=!document.hidden;
    if(running){ last=performance.now(); cancelAnimationFrame(rid); rid=requestAnimationFrame(frame); }
  });
  function frame(now){
    if(!running) return;
    rid=requestAnimationFrame(frame);
    const n=now||performance.now();
    t+=Math.min(.05,Math.max(0,(n-last)/1000)); last=n;
    ctx.clearRect(0,0,W,H);
    if(cur){ try{ cur.frame(); }catch(e){ cur=null; } }
  }
  rid=requestAnimationFrame(frame);
}

/* ============================================================
   WALLPAPER CONTROLLER + FX DOCK
   ============================================================ */
const WP_ITEMS=[
  {k:'off',  ico:'x',       t:'eOff'},
  {k:'anime',ico:'film',    t:'wpAnime'},
  {k:'manga',ico:'bookOpen',t:'wpManga'},
  {k:'japan',ico:'torii',   t:'wpJapan'},
  {k:'art',  ico:'star',    t:'wpArt'},
  {k:'live', ico:'play',    t:'wpLive'}
];
const WP_SRC={anime:'AniList',manga:'AniList',japan:'Openverse / Flickr',art:'Wallhaven / Konachan (SFW)',live:'MotionBGs / MoeWalls'};
const WP={cat:store.get('azt_wp','off'),last:{},curTitle:'',liveIdx:store.get('azt_wpl',0),seq:0};

function wpPick(cat){
  const list=(typeof WP_SETS!=='undefined'&&WP_SETS[cat])||[];
  if(!list.length) return null;
  for(let i=0;i<10;i++){
    const it=pick(list);
    if(list.length<2||it.u!==WP.last[cat]) return it;
  }
  return pick(list);
}

/* ---- live (video) wallpaper engine ---- */
function wpVideoEl(){ const el=$('#wallpaper'); return el?el.querySelector('video.wp-live'):null; }
function wpStopVideo(){
  const v=wpVideoEl(); if(!v) return;
  try{ v.pause(); v.removeAttribute('src'); v.load(); }catch(e){}
  v.remove();
}
function wpReduceMotion(){ return matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches; }
function wpLiveNext(){
  const n=(typeof WP_LIVE!=='undefined')?WP_LIVE.length:0;
  if(!n) return 0;
  for(let g=0;g<10;g++){ const j=Math.floor(Math.random()*n); if(j!==WP.liveIdx) return j; }
  return (WP.liveIdx+1)%n;
}
function setLiveWallpaper(opts){
  opts=opts||{};
  const el=$('#wallpaper');
  const list=(typeof WP_LIVE!=='undefined')?WP_LIVE:[];
  if(!list.length){ toast(L(S.err)); return; }
  let idx=(typeof opts.idx==='number')?opts.idx:(opts.silent?WP.liveIdx:wpLiveNext());
  if(idx<0||idx>=list.length) idx=0;
  const item=list[idx];
  wpStopVideo();
  WP.cat='live'; WP.liveIdx=idx; WP.curTitle=item.t; WP.seq++;
  store.set('azt_wp','live'); store.set('azt_wpl',idx);
  if(!el) return;
  el.style.backgroundImage='';
  document.body.classList.add('wp-on');
  paintWPPop(); paintDockState();
  if(!opts.silent) toast(L(S.wpLiveOn)+' · '+esc(item.t)+' · '+esc(item.src));
  /* reduced motion (or no video element support): keep the still frame */
  if(wpReduceMotion()||typeof document.createElement('video').canPlayType!=='function'){
    if(item.p) el.style.backgroundImage='url("'+item.p+'")';
    return;
  }
  const v=document.createElement('video');
  v.className='wp-live'; v.muted=true; v.defaultMuted=true; v.loop=true;
  v.playsInline=true; v.setAttribute('playsinline',''); v.preload='auto'; v.autoplay=true;
  v.setAttribute('aria-hidden','true');
  if(item.p) v.poster=item.p;
  let failed=false;
  v.addEventListener('error',()=>{
    if(failed) return; failed=true;
    wpStopVideo();
    if(item.p) el.style.backgroundImage='url("'+item.p+'")';
    toast(L(S.wpLiveFallback));
  });
  v.src=item.u;
  el.appendChild(v);
  const pr=v.play&&v.play();
  if(pr&&pr.catch) pr.catch(()=>{ /* poster shows until/unless playback is allowed */ });
}

function setWallpaper(cat,opts){
  opts=opts||{};
  const el=$('#wallpaper');
  if(cat==='off'){
    WP.cat='off'; store.set('azt_wp','off'); WP.seq++;
    wpStopVideo();
    document.body.classList.remove('wp-on');
    if(el) el.style.backgroundImage='';
    WP.curTitle='';
    paintWPPop(); paintDockState();
    return;
  }
  if(cat==='live'){ setLiveWallpaper(opts); return; }
  wpStopVideo();
  const list=(typeof WP_SETS!=='undefined'&&WP_SETS[cat])||[];
  if(!list.length){ toast(L(S.err)); return; }
  const item=opts.item||wpPick(cat); if(!item) return;
  WP.cat=cat; store.set('azt_wp',cat); WP.last[cat]=item.u;
  if(!el) return;
  let tries=0;
  const seq=++WP.seq;
  (function attempt(it){
    const im=new Image();
    im.onload=()=>{
      if(WP.seq!==seq) return; /* superseded by a newer selection */
      el.style.backgroundImage='url("'+it.u+'")';
      document.body.classList.add('wp-on');
      WP.curTitle=it.t||'';
      paintWPPop(); paintDockState();
      if(!opts.silent){
        const it2=WP_ITEMS.find(w=>w.k===cat);
        const name=it.t||L(S[it2.t]);
        toast('🖼️ '+esc(name)+(it.t?' · '+esc(WP_SRC[cat]||''):''));
      }
    };
    im.onerror=()=>{
      if(WP.seq!==seq) return;
      tries++;
      const next=tries<3?(opts.item||wpPick(cat)):null;
      if(next) attempt(next);
      else if(!opts.silent) toast(L(S.err));
    };
    im.src=it.u;
  })(item);
}

function paintDockState(){
  const vb=$('#vfxBtn'), wb=$('#wpBtn'), cb=$('#curBtn');
  if(vb) vb.classList.toggle('on',vfxMode!=='off');
  if(wb) wb.classList.toggle('on',WP.cat!=='off');
  if(cb) cb.classList.toggle('on',!!CUR);
}

function closeFxPops(){
  let closed=false;
  ['#vfxPop','#wpPop','#curPop'].forEach(sel=>{
    const p=$(sel);
    if(p&&!p.hidden){ p.hidden=true; closed=true; }
  });
  ['#vfxBtn','#wpBtn','#curBtn'].forEach(sel=>{ const b=$(sel); if(b) b.setAttribute('aria-expanded','false'); });
  return closed;
}

function toggleFxPop(which){
  const pop=$(which==='vfx'?'#vfxPop':(which==='wp'?'#wpPop':'#curPop'));
  const wasOpen=pop&&!pop.hidden;
  closeFxPops();
  if(wasOpen||!pop) return;
  if(which==='vfx') paintFxPops(); else if(which==='wp') paintWPPop(); else paintCurPop();
  pop.hidden=false;
  const b=$(which==='vfx'?'#vfxBtn':(which==='wp'?'#wpBtn':'#curBtn'));
  if(b) b.setAttribute('aria-expanded','true');
}

function paintFxPops(){
  const pop=$('#vfxPop'); if(!pop) return;
  clear(pop);
  pop.appendChild(h('div.pop-title',{html:ico('sparkles')+esc(L(S.fxTitle))}));
  const grid=h('div.fx-grid');
  VFX_ITEMS.forEach(it=>{
    grid.appendChild(h('button'+(vfxMode===it.k?'.fx-opt.on':'.fx-opt'),{
      type:'button',html:ico(it.ico)+'<span>'+esc(L(S[it.t]))+'</span>',
      onclick:()=>{ setVFX(it.k); closeFxPops(); }
    }));
  });
  pop.appendChild(grid);
}

function paintWPPop(){
  const pop=$('#wpPop'); if(!pop) return;
  clear(pop);
  pop.appendChild(h('div.pop-title',{html:ico('image')+esc(L(S.wpTitle))}));
  /* visibility slider — first row so it is never pushed off short screens */
  const dimIn=h('input',{type:'range',min:'30',max:'100',step:'5',value:String(WP_DIM)});
  const dimVal=h('span.wp-dim-val',WP_DIM+'%');
  const paintDim=()=>{ dimIn.style.setProperty('--wpdf',((+dimIn.value-30)/70*100)+'%'); dimVal.textContent=dimIn.value+'%'; };
  paintDim();
  dimIn.oninput=()=>{ setWallpaperDim(dimIn.value); paintDim(); };
  pop.appendChild(h('div.wp-dim',{html:ico('eye')},dimIn,dimVal));
  /* soft-focus (blur) slider */
  const blIn=h('input',{type:'range',min:'0',max:'20',step:'1',value:String(WP_BLUR)});
  const blVal=h('span.wp-dim-val',WP_BLUR+'px');
  const paintBl=()=>{ blIn.style.setProperty('--wpdf',((+blIn.value)/20*100)+'%'); blVal.textContent=blIn.value+'px'; };
  paintBl();
  blIn.oninput=()=>{ setWallpaperBlur(blIn.value); paintBl(); };
  pop.appendChild(h('div.wp-dim',{html:ico('blur')},blIn,blVal));
  const list=h('div.wp-list');
  WP_ITEMS.forEach(it=>{
    list.appendChild(h('button'+(WP.cat===it.k?'.wp-opt.on':'.wp-opt'),{
      type:'button',html:ico(it.ico)+'<span>'+esc(L(S[it.t]))+'</span>',
      onclick:()=>{ setWallpaper(it.k,{}); closeFxPops(); }
    }));
  });
  if(WP.cat!=='off'){
    list.appendChild(h('button.wp-opt.roll',{
      type:'button',html:ico('refresh')+'<span>'+esc(L(WP.cat==='live'?S.wpNewLive:S.wpNew))+'</span>',
      onclick:()=>{ setWallpaper(WP.cat,{}); closeFxPops(); }
    }));
  }
  pop.appendChild(list);
  /* static categories: pick a specific picture from a thumbnail grid */
  if(WP.cat!=='off'&&WP.cat!=='live'&&typeof WP_SETS!=='undefined'&&WP_SETS[WP.cat]){
    const set=WP_SETS[WP.cat];
    const grid=h('div.wp-live-grid');
    set.forEach(it=>{
      grid.appendChild(h('button'+((WP.curTitle&&WP.curTitle===it.t)?'.wp-live-opt.on':'.wp-live-opt'),{
        type:'button',title:it.t,
        html:'<img src="'+esc(it.th||it.u)+'" alt="" loading="lazy"><span>'+esc(it.t)+'</span>',
        onclick:()=>{ setWallpaper(WP.cat,{item:it}); }
      }));
    });
    pop.appendChild(grid);
  }
  /* anime / manga: search ANY title via AniList and use its key art */
  if(WP.cat==='anime'||WP.cat==='manga'){
    const kind=WP.cat;
    const inpEl=h('input.wp-search',{type:'search',placeholder:L(S.wpSearchAny),autocomplete:'off'});
    const row=h('div.wp-live-grid');
    let tmr=null,seq=0;
    const go=async()=>{
      const q=inpEl.value.trim(); clear(row);
      if(q.length<2) return;
      const my=++seq;
      row.appendChild(h('div.hint',{style:'grid-column:1/-1',html:esc(L({en:'Searching…',ja:'検索中…'}))}));
      try{
        const res=await fetch('https://graphql.anilist.co',{method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify({query:'query($s:String,$t:MediaType){Page(page:1,perPage:12){media(search:$s,type:$t){title{romaji english} bannerImage}}}',
            variables:{s:q,t:kind.toUpperCase()}})});
        const j=await res.json();
        if(my!==seq) return;
        const items=(j.data&&j.data.Page&&j.data.Page.media||[]).filter(x=>x&&x.bannerImage);
        clear(row);
        if(!items.length){ row.appendChild(h('div.hint',{style:'grid-column:1/-1',html:esc(L({en:'No results.',ja:'結果なし。'}))})); return; }
        items.forEach(m=>{
          const t=m.title.romaji||m.title.english||'';
          row.appendChild(h('button.wp-live-opt',{type:'button',title:t,
            html:'<img src="'+esc(m.bannerImage)+'" alt="" loading="lazy"><span>'+esc(t)+'</span>',
            onclick:()=>{ setWallpaper(kind,{item:{u:m.bannerImage,t:t}}); }
          }));
        });
      }catch(e){ if(my===seq){ clear(row); row.appendChild(h('div.hint',{style:'grid-column:1/-1',html:esc(L(S.err))})); } }
    };
    inpEl.addEventListener('input',()=>{ clearTimeout(tmr); tmr=setTimeout(go,500); });
    pop.appendChild(h('div.wp-search-row',inpEl));
    pop.appendChild(row);
  }
  if(WP.cat==='live'&&typeof WP_LIVE!=='undefined'&&WP_LIVE.length){
    const grid=h('div.wp-live-grid');
    WP_LIVE.forEach((it,i)=>{
      grid.appendChild(h('button'+(WP.liveIdx===i?'.wp-live-opt.on':'.wp-live-opt'),{
        type:'button',title:it.t+' — '+it.src,
        html:(it.p?'<img src="'+esc(it.p)+'" alt="" loading="lazy">':'')+'<span>'+esc(it.t)+'</span>',
        onclick:()=>{ setWallpaper('live',{idx:i}); closeFxPops(); }
      }));
    });
    pop.appendChild(grid);
  }
  const note=h('div.wp-note');
  if(WP.cat==='off'){
    note.textContent=L(S.wpHint);
  }else if(WP.cat==='live'){
    const it=(typeof WP_LIVE!=='undefined'&&WP_LIVE[WP.liveIdx])||null;
    if(it){
      note.innerHTML='<b>'+esc(it.t)+'</b> · '+esc(it.src)+
        (it.page?' · <a href="'+esc(it.page)+'" target="_blank" rel="noopener">'+esc(L(S.wpSrcPage))+'</a>':'');
    }
  }else{
    const it2=WP_ITEMS.find(w=>w.k===WP.cat);
    const name=L(S[it2.t]);
    note.innerHTML='<b>'+esc(WP.curTitle||name)+'</b> · '+esc(WP_SRC[WP.cat]||'');
  }
  pop.appendChild(note);
}

/* ============================================================
   CURSOR PICKER - one-tap custom cursor + apply-style gallery sites
   CUR=null -> default. Otherwise one of:
     {img, hx, hy}          static cursor, prepared 48px dataURL (survives
                            reload on file:// and GitHub Pages)
     {raw, hx, hy}          remote URL used directly (Neon: no CORS needed)
     {anim, delay, hx, hy}  ANIMATED: prepared frame dataURLs stepped by the
                            engine below (Sweezy animated packs ship every
                            frame as its own PNG; GIF uploads are decoded with
                            WebCodecs ImageDecoder when supported)
   ============================================================ */
const CUR_CAP=400*1024, CUR_SIZE=48, CUR_FRAMES_MAX=20;
const CUR_SCALE_MIN=.5, CUR_SCALE_MAX=2.5, CUR_STRETCH_MIN=.5, CUR_STRETCH_MAX=2, CUR_ART_MAX=96;
let CUR=store.get('azt_cur',null);
let curPopZone='';                 /* '' = site list root, else CURSOR_SITES id */
if(!CUR||typeof CUR!=='object'||(!CUR.img&&!CUR.raw&&!CUR.anim)) CUR=null;
/* cursor scale: s = overall size, st = horizontal stretch (fattens thin art).
   Applied at prep time; stored so every cursor (incl. after reload) keeps it */
let CURS=(function(){
  const v=store.get('azt_cscl',null);
  const cl=(x,lo,hi)=>isNaN(+x)?1:Math.max(lo,Math.min(hi,+x));
  if(!v||typeof v!=='object') return {s:1,st:1};
  return {s:cl(v.s,CUR_SCALE_MIN,CUR_SCALE_MAX),st:cl(v.st,CUR_STRETCH_MIN,CUR_STRETCH_MAX)};
})();
function curSetScale(s,st){
  CURS={s:isNaN(+s)?CURS.s:Math.max(CUR_SCALE_MIN,Math.min(CUR_SCALE_MAX,+s)),
        st:isNaN(+st)?CURS.st:Math.max(CUR_STRETCH_MIN,Math.min(CUR_STRETCH_MAX,+st))};
  try{ store.set('azt_cscl',CURS); }catch(e){}
}

function curReduce(){ return matchMedia('(prefers-reduced-motion: reduce)').matches; }
function applyCursor(){
  const de=document.documentElement;
  curGhostKill();
  if(CUR&&!curReduce()&&CUR.anim&&CUR.anim.length>1) return curGhostStart(); /* animated = virtual pointer */
  let u=CUR&&(CUR.img||CUR.raw)||(CUR&&CUR.anim&&CUR.anim[0]); /* reduced motion: one still frame natively */
  if(u){
    de.setAttribute('data-cur','on');
    de.style.setProperty('--cur','url("'+u+'") '+(CUR.hx|0)+' '+(CUR.hy|0)+', auto');
  }else{
    de.removeAttribute('data-cur');
    de.style.removeProperty('--cur');
  }
  paintCurPop(); paintDockState();
}
/* ------------------------------------------------------------
   VIRTUAL POINTER for animated cursors (#curGhost).
   Native CSS cursors cannot animate in Chromium, so the old engine swapped
   a custom property used by EVERY element - a full-document style recalc
   every frame step (the "website lag"). Now: cursor:none is applied once
   (static rule), and this one tiny fixed element swaps its background
   image per frame - cost of one element, not thousands.
   ------------------------------------------------------------ */
const CUR_TEXT_SEL='input,textarea,select,[contenteditable]';
let curGhost=null, curGhostRAF=0, curGhostFrame=0, curGhostLast=0, curGhostImgs=null;
function curGhostKill(){
  if(curGhostRAF){ cancelAnimationFrame(curGhostRAF); curGhostRAF=0; }
  curGhostImgs=null;
  if(curGhost){ curGhost.remove(); curGhost=null; }
  document.documentElement.removeAttribute('data-cga');
}
function curGhostStart(){
  const de=document.documentElement, anim=CUR.anim, hx=CUR.hx|0, hy=CUR.hy||0;
  curGhostKill();
  de.removeAttribute('data-cur');
  de.style.removeProperty('--cur');
  de.setAttribute('data-cga','on');
  curGhost=h('div#curGhost');
  document.body.appendChild(curGhost);
  /* natural frame size incl. the baked shadow padding */
  const probe=new Image();
  probe.onload=()=>{
    if(!curGhost) return;
    curGhost.style.width=probe.naturalWidth+'px';
    curGhost.style.height=probe.naturalHeight+'px';
    curGhost.style.backgroundImage='url("'+anim[0]+'")';
  };
  probe.src=anim[0];
  /* decode all frames up-front so ticks never decode */
  curGhostImgs=anim.map(u=>{ const im=new Image(); im.src=u; return im; });
  curGhostFrame=0; curGhostLast=0;
  const delay=Math.max(40,Math.min(400,+CUR.delay||90));
  const step=ts=>{
    if(!curGhost){ curGhostRAF=0; return; }
    /* rAF pauses by itself in hidden tabs (battery friendly) */
    if(!curGhostLast) curGhostLast=ts;
    if(ts-curGhostLast>=delay){
      curGhostLast=ts;
      curGhostFrame=(curGhostFrame+1)%anim.length;
      curGhost.style.backgroundImage='url("'+anim[curGhostFrame]+'")';
    }
    curGhostRAF=requestAnimationFrame(step);
  };
  curGhostRAF=requestAnimationFrame(step);
  paintCurPop(); paintDockState();
}
/* single passive pointer tracker: drives ghost alignment (and stays idle
   for cursors without animation) */
if(!window.__aztCurTrack){
  window.__aztCurTrack=true;
  addEventListener('pointermove',ev=>{
    if(!curGhost||ev.pointerType==='touch') return;
    const t=ev.target;
    if(t&&t.closest&&t.closest(CUR_TEXT_SEL)){ curGhost.style.opacity=0; return; }
    curGhost.style.opacity=1;
    curGhost.style.transform='translate3d('+(ev.clientX-(CUR.hx|0))+'px,'+(ev.clientY-(CUR.hy||0))+'px,0)';
  },{passive:true});
  document.documentElement.addEventListener('mouseleave',()=>{ if(curGhost) curGhost.style.opacity=0; });
  document.documentElement.addEventListener('mouseenter',()=>{ if(curGhost) curGhost.style.opacity=1; });
}
function setCursor(state,opts){
  opts=opts||{};
  CUR=state&&((state.img||state.raw||(state.anim&&state.anim.length))?state:null);
  try{ store.set('azt_cur',CUR); }catch(e){ toast(L(S.curTooBig)); CUR=null; applyCursor(); return; }
  applyCursor();
  if(!opts.silent){
    if(CUR) toast(ico('cursor')+' '+L(CUR.custom?S.curCustomOn:S.curApplied));
    else toast(ico('cursor')+' '+L(S.curOffToast));
  }
}

/* draw a CORS-readable image into a small square canvas -> dataURL that
   survives reloads on file:// (remote URLs can't be used as CSS cursors there).
   High-quality resampling + a soft drop shadow so the pointer reads well on
   any wallpaper. */
function curPaint(im,cx,w,h,pad){
  /* render at 2x then downscale: much crisper anti-aliased edges than a
     direct draw, especially for small pointer art scaled up from web PNGs */
  const SS=2, F=(w+pad*2)*SS, G=(h+pad*2)*SS, A=w*SS, B=h*SS, P=pad*SS;
  const tmp=document.createElement('canvas'); tmp.width=F; tmp.height=G;
  const t=tmp.getContext('2d');
  t.imageSmoothingEnabled=true; t.imageSmoothingQuality='high';
  /* dark silhouette for the rim */
  const sil=document.createElement('canvas'); sil.width=w; sil.height=h;
  const s2=sil.getContext('2d');
  s2.drawImage(im,0,0,w,h);
  s2.globalCompositeOperation='source-in';
  s2.fillStyle='#10131b'; s2.fillRect(0,0,w,h);
  /* soft two-layer shadow (close contact + ambient) */
  try{ t.filter='drop-shadow(0 2px 2.5px rgba(0,0,0,.42)) drop-shadow(0 3.5px 6px rgba(0,0,0,.22))'; }catch(e){}
  t.drawImage(im,P,P,A,B);
  try{ t.filter='none'; }catch(e){}
  /* thin dark rim so the art stays readable on light AND dark backgrounds */
  t.globalAlpha=.6;
  const o=Math.max(1,Math.round(SS*.75));
  [[-o,0],[o,0],[0,-o],[0,o],[-o,-o],[o,o],[-o,o],[o,-o]].forEach(d=>t.drawImage(sil,P+d[0],P+d[1],A,B));
  t.globalAlpha=1;
  /* art on top */
  t.drawImage(im,P,P,A,B);
  cx.drawImage(tmp,0,0,F,G,0,0,F/SS,G/SS);
}
/* CORS-friendly image proxy (keyless) for hosts that don't send CORS headers
   (neoncursor.com, cursors-4u.com CDN). weserv re-encodes + adds CORS, so
   canvas prep / frame decoding works there too; n=-1 keeps all animation
   frames. Falls back to the raw URL wherever the proxy fails. */
function curProxy(u,w){
  return 'https://images.weserv.nl/?url='+encodeURIComponent(String(u).replace(/^https?:\/\//,''))+'&n=-1'+
    (w?'&w='+w:'');
}
/* shave transparent margins so small pointer art fills the cursor canvas
   (pre-made 128px/96px sheets carry lots of empty padding -> art looked thin).
   Rows/columns must hold several opaque pixels (sparkle noise ignored),
   else one stray dot stretches the whole box and the art looks distorted */
function curTrim(im,sx,sy,sw,sh){
  try{
    const c=document.createElement('canvas'); c.width=sw; c.height=sh;
    const cx=c.getContext('2d');
    cx.drawImage(im,sx,sy,sw,sh,0,0,sw,sh);
    const d=cx.getImageData(0,0,sw,sh).data;
    const need=Math.max(3,Math.round((sw+sh)*0.012));
    const cols=new Uint32Array(sw), rows=new Uint32Array(sh);
    for(let y=0;y<sh;y++) for(let x=0;x<sw;x++){
      if(d[((y*sw+x)<<2)+3]>12){ cols[x]++; rows[y]++; }
    }
    let x0=sw,x1=-1,y0=sh,y1=-1;
    for(let x=0;x<sw;x++) if(cols[x]>=need){ if(x<x0)x0=x; if(x>x1)x1=x; }
    for(let y=0;y<sh;y++) if(rows[y]>=need){ if(y<y0)y0=y; if(y>y1)y1=y; }
    if(x1<0||y1<0||(x0===0&&y0===0&&x1===sw-1&&y1===sh-1)) return {sx:sx,sy:sy,sw:sw,sh:sh};
    return {sx:sx+x0,sy:sy+y0,sw:x1-x0+1,sh:y1-y0+1};
  }catch(e){ return {sx:sx,sy:sy,sw:sw,sh:sh}; }   /* tainted -> skip */
}
function curPrep(src,hx,hy,cropLeft){
  return new Promise((res,rej)=>{
    const im=new Image();
    im.crossOrigin='anonymous';
    im.onload=()=>{
      try{
        let sx=0,sy=0,sw=im.naturalWidth||im.width, sh=im.naturalHeight||im.height;
        if(cropLeft&&sw>sh){ sw=sh; }                 /* custom-cursor: pointer is the left half */
        const tr=curTrim(im,sx,sy,sw,sh);
        sx=tr.sx; sy=tr.sy; sw=tr.sw; sh=tr.sh;
        /* stored hotspots sometimes sit in cropped-away padding (custom-cursor
           16,4 while art starts at x=48) - fall back to the art's top-left,
           where a pointer's tip lives */
        let hxA=hx, hyA=hy;
        if(hx<sx||hy<sy||hx>=sx+sw||hy>=sy+sh){ hxA=sx+Math.round(sw*0.14); hyA=sy+Math.round(sh*0.07); }
        /* user scale: aspect-preserving fit by the long side; st stretches
           width only (helps naturally thin art read fuller) */
        const kF=CUR_SIZE*CURS.s/Math.max(sw,sh);
        const kx=kF*CURS.st, ky=kF;
        const w=Math.max(8,Math.min(CUR_ART_MAX,Math.round(sw*kx)));
        const ht=Math.max(8,Math.min(CUR_ART_MAX,Math.round(sh*ky)));
        const pad=3;                                   /* room for the drop shadow */
        const cv=document.createElement('canvas'); cv.width=w+pad*2; cv.height=ht+pad*2;
        curPaint(im,cv.getContext('2d'),w,ht,pad);
        res({img:cv.toDataURL('image/png'),
          hx:pad+Math.max(0,Math.min(w-1,Math.round((hxA-sx)*kx))),
          hy:pad+Math.max(0,Math.min(ht-1,Math.round((hyA-sy)*ky)))});
      }catch(e){ rej(e); }
    };
    im.onerror=()=>rej(new Error('bad image'));
    im.src=src;
  });
}
/* animated gallery cursors (Sweezy): prep each frame PNG, chunked to keep the
   network polite; delays come from the site's own cycle speed */
async function curFrames(urls,cycleMs,hx,hy){
  const out=[]; let first=null;
  const batch=4;
  for(let i=0;i<urls.length&&out.length<CUR_FRAMES_MAX;i+=batch){
    const part=await Promise.all(urls.slice(i,i+batch).map(u=>curPrep(u,hx,hy,false).catch(()=>null)));
    part.forEach(p=>{ if(p){ if(!first) first=p; out.push(p.img); } });
  }
  if(out.length<2) throw new Error('no frames');
  const delay=Math.max(50,Math.min(320,Math.round((+cycleMs||900)/Math.max(1,urls.length))));
  return {anim:out,delay:delay,hx:first.hx,hy:first.hy};
}
async function curApplyItem(site,it,silent){
  const n=it[0], u=it[1];
  const hx=site.crop?16:(it[2]||16), hy=site.crop?4:(it[3]||4);
  const idx=site.items?site.items.indexOf(it):-1;
  const src=idx>=0&&site.id?{k:'g',s:site.id,i:idx}:null;
  const ext=it.length>5?it[5]:null;
  let frames=null, cycle=0, animSrc=null;
  if(Array.isArray(ext)){ frames=ext; cycle=+(it[6]||0); }
  else if(typeof ext==='string'&&/^w:/.test(ext)){ animSrc=ext.slice(2); } /* C4U animated previews */
  if(!silent) toast(ico('cursor')+' '+L(S.curSaving));
  if(site.raw){
    /* Neon's CDN has no CORS headers, so the old path applied their 128px PNG
       raw = huge on screen. Prep through the CORS proxy at our 48px size and
       keep raw as fallback */
    try{
      const p=await curPrep(curProxy(u,128),hx,hy,false);
      setCursor(curStateWith(src,{img:p.img,hx:p.hx,hy:p.hy}),{silent:silent});
    }catch(e){ setCursor(curStateWith(src,{raw:u,hx:hx,hy:hy}),{silent:silent}); }
    return;
  }
  if(frames&&frames.length>1){
    try{
      const a=await curFrames(frames,cycle,hx,hy);
      setCursor(curStateWith(src,{anim:a.anim,delay:a.delay,hx:a.hx,hy:a.hy}),{silent:silent});
      return;
    }catch(e){ /* fall through to the static PNG */ }
  }
  if(animSrc){
    try{
      const buf=await (await fetch(curProxy(animSrc,96))).arrayBuffer();
      const a=await curGifFrames(buf,'image/webp');
      if(a&&a.anim.length>1){ setCursor(curStateWith(src,{anim:a.anim,delay:a.delay,hx:a.hx,hy:a.hy}),{silent:silent}); return; }
    }catch(e){ /* fall through to the static thumbnail */ }
  }
  try{
    const p=await curPrep(u,hx,hy,site.crop);
    setCursor(curStateWith(src,{img:p.img,hx:p.hx,hy:p.hy}),{silent:silent});
  }catch(e){ if(!silent) toast(ico('alert')+' '+L(S.curBadImg)); }
}
/* uploads: statics -> canvas prep; GIFs -> decode frames with WebCodecs
   (Chrome/Edge) so they truly animate, falling back to the raw GIF dataURL */
async function curGifFrames(buf,type){
  if(typeof ImageDecoder==='undefined') return null;
  try{
    const dec=new ImageDecoder({data:buf,type:type||'image/gif'});
    await dec.tracks.ready;
    const track=dec.tracks.selectedTrack;
    const total=Math.min(track&&track.frameCount?track.frameCount:0,CUR_FRAMES_MAX);
    if(total<2) return null;
    const images=[]; const durations=[];
    for(let i=0;i<total;i++){
      const r=await dec.decode({frameIndex:i,completeFramesOnly:true});
      images.push(r.image);
      const d=r.image.duration;   /* microseconds; may be null */
      durations.push(d>0?d/1000:0);
    }
    const out=[]; let first=null;
    images.forEach(f=>{
      const w=f.displayWidth||f.width, h=f.displayHeight||f.height;
      const kF=CUR_SIZE*CURS.s/Math.max(w,h);
      const kx=kF*CURS.st, ky=kF;
      const cw=Math.max(8,Math.min(CUR_ART_MAX,Math.round(w*kx))), ch=Math.max(8,Math.min(CUR_ART_MAX,Math.round(h*ky))), pad=3;
      const cv=document.createElement('canvas'); cv.width=cw+pad*2; cv.height=ch+pad*2;
      curPaint(f,cv.getContext('2d'),cw,ch,pad);
      const url=cv.toDataURL('image/png');
      if(!first) first={hx:Math.round(16*kx)+pad,hy:Math.round(2*ky)+pad};
      out.push(url);
      try{ f.close&&f.close(); }catch(e){}
    });
    const withD=durations.filter(d=>d>0);
    /* swap cursor ~30fps max, respecting the GIF's own pacing when present */
    let delay=90;
    if(withD.length===out.length) delay=Math.round(withD.reduce((a,b)=>a+b,0)/withD.length);
    return {anim:out,delay:Math.max(40,Math.min(400,delay)),hx:first.hx,hy:first.hy};
  }catch(e){ return null; }
}
/* remember where the applied cursor came from so resize/stretch can re-prep */
function curApplySrc(src){
  clearTimeout(curScaleT);
  curScaleT=setTimeout(()=>{
    if(!CUR||!CUR.src||!src) return;
    if(src.k==='g'){
      const site=(typeof CURSOR_SITES!=='undefined'?CURSOR_SITES:[]).find(s=>s.id===src.s);
      if(site&&site.items&&site.items[src.i]) curApplyItem(site,site.items[src.i],true);
    }else if(src.k==='up'){
      curSetCustom(src.u,src.mime||'image/png',true);
    }
  },260);
}
let curScaleT=0;
function curStateWith(src,state){
  if(src) state.src=src;
  return state;
}
async function curSetCustom(fileDataURL,mime,silent){
  mime=String(mime||'');
  const src={k:'up',u:fileDataURL,mime:mime};
  const animated=/^image\/(gif|webp|apng)/i.test(mime);
  if(animated){
    if(!silent) toast(ico('cursor')+' '+L(S.curSaving));
    try{
      const buf=await (await fetch(fileDataURL)).arrayBuffer();
      const a=await curGifFrames(buf,mime.replace(/apng/i,'png'));
      if(a&&a.anim&&a.anim.length>1){ setCursor(curStateWith(src,{anim:a.anim,delay:a.delay,hx:a.hx,hy:a.hy,custom:1}),{silent:silent}); return; }
    }catch(e){}
    setCursor(curStateWith(src,{img:fileDataURL,hx:16,hy:2,custom:1}),{silent:silent});   /* browser animates raw GIF where it can */
    return;
  }
  if(!silent) toast(ico('cursor')+' '+L(S.curSaving));
  curPrep(fileDataURL,16,2,false)
    .then(p=>setCursor(curStateWith(src,{img:p.img,hx:p.hx,hy:p.hy,custom:1}),{silent:silent}))
    .catch(()=>{ if(!silent) toast(ico('alert')+' '+L(S.curBadImg)); });
}
function curPickFile(file){
  if(!file) return;
  if(file.size>CUR_CAP){ toast(ico('alert')+' '+L(S.curTooBig)); return; }
  const r=new FileReader();
  r.onload=()=>curSetCustom(String(r.result),file.type);
  r.onerror=()=>toast(ico('alert')+' '+L(S.curBadImg));
  r.readAsDataURL(file);
}

/* ============================================================
   POINTER TIP DOT - a small circle that always sits on the true
   click point (the cursor hotspot), so a cursor image can never
   hide where you are aiming. {on, size, fill, color} color '' =
   follow the site accent. DOM only: pointer-events none, so it
   never intercepts clicks; moves on pointermove (1 dot, no loop).
   ============================================================ */
const CDOT_SIZE_MIN=6, CDOT_SIZE_MAX=40;
let CDOT=(function(){
  const d={on:false,size:14,fill:true,color:''};
  const v=store.get('azt_cdot',null);
  if(!v||typeof v!=='object') return d;
  return {on:!!v.on,
    size:Math.max(CDOT_SIZE_MIN,Math.min(CDOT_SIZE_MAX,(+v.size||d.size))),
    fill:(v.fill===undefined?d.fill:!!v.fill),
    color:/^#[0-9a-fA-F]{6}$/.test(v.color||'')?v.color:''};
})();
let curDotEl=null, curDotSeen=false;
function cdotColor(){ return CDOT.color||'var(--gold)'; }
function applyCDot(){
  if(!CDOT.on){
    if(curDotEl){ curDotEl.remove(); curDotEl=null; }
    return;
  }
  if(!curDotEl){
    curDotEl=h('div#curDot',{onclick:e=>e.preventDefault()});
    document.body.appendChild(curDotEl);
    /* move with the mouse; hidden until the first move so it never
       sits stranded in a corner after load */
    addEventListener('pointermove',ev=>{
      if(!curDotEl) return;
      curDotEl.style.transform='translate3d('+ev.clientX+'px,'+ev.clientY+'px,0) translate(-50%,-50%)';
      if(!curDotSeen){ curDotSeen=true; curDotEl.style.opacity=1; }
    },{passive:true});
    document.documentElement.addEventListener('mouseleave',()=>{ if(curDotEl) curDotEl.style.opacity=0; });
    document.documentElement.addEventListener('mouseenter',()=>{ if(curDotEl&&curDotSeen) curDotEl.style.opacity=1; });
  }
  const col=cdotColor();
  curDotEl.style.width=CDOT.size+'px';
  curDotEl.style.height=CDOT.size+'px';
  if(CDOT.fill){
    curDotEl.style.background=col;
    curDotEl.style.border='none';
  }else{
    curDotEl.style.background='transparent';
    curDotEl.style.border='2.5px solid '+col;
  }
}
function setCDot(patch){
  CDOT=Object.assign({},CDOT,patch);
  try{ store.set('azt_cdot',CDOT); }catch(e){}
  applyCDot();
}

function paintCurPop(){
  const pop=$('#curPop'); if(!pop) return;
  clear(pop);
  const isMe=curPopZone==='me';
  const site=(curPopZone&&curPopZone!=='me')?(CURSOR_SITES.find(s=>s.id===curPopZone)||null):null;
  /* title row (+ back chip inside a site view) */
  const ttl=h('div.pop-title');
  if(isMe||site) ttl.appendChild(h('button.backchip',{type:'button',html:ico('chevu')+'<span>'+esc(L(S.curBack))+'</span>',
    onclick:()=>{ curPopZone=''; paintCurPop(); }}));
  ttl.insertAdjacentHTML('beforeend',ico('cursor')+'<span>'+esc(isMe?S.curCustom:(site||S.curTitle))+'</span>');
  pop.appendChild(ttl);

  if(!site&&!isMe){
    const list=h('div.wp-list');
    /* Off */
    list.appendChild(h('button'+(!CUR?'.wp-opt.on':'.wp-opt'),{
      type:'button',html:ico('x')+'<span>'+esc(L(S.eOff))+'</span>',
      onclick:()=>{ setCursor(null); }
    }));
    /* My image slot */
    list.appendChild(h('button'+(CUR&&CUR.custom?'.wp-opt.on':'.wp-opt'),{
      type:'button',html:ico('upload')+'<span>'+esc(L(S.curCustom))+'</span>',
      onclick:()=>{ curPopZone='me'; paintCurPop(); }
    }));
    /* one row per website, with live count */
    (typeof CURSOR_SITES!=='undefined'?CURSOR_SITES:[]).forEach(s=>{
      list.appendChild(h('button.wp-opt.cur-site',{
        type:'button',title:s.src,
        html:ico('cursor')+'<span class="cur-site-name">'+esc(L(s))+'</span><b>'+s.items.length+'</b>'+ico('chevdd'),
        onclick:()=>{ curPopZone=s.id; paintCurPop(); }
      }));
    });
    pop.appendChild(list);
    /* pointer tip dot (see-through marker for the real click point) */
    const dbox=h('div.cur-dot');
    dbox.appendChild(h('button.wp-opt.cur-dot-tgl'+(CDOT.on?'.on':''),{
      type:'button',title:L(CDOT.on?S.curDotOn:S.curDotOff),
      html:ico('target')+'<span>'+esc(L(S.curDot))+'</span><b>'+esc(L(CDOT.on?{en:'On',ja:'オン'}:{en:'Off',ja:'オフ'}))+'</b>',
      onclick:()=>{ setCDot({on:!CDOT.on}); curDotSeen=false; paintCurPop(); }
    }));
    if(CDOT.on){
      const sizeIn=h('input',{type:'range',min:String(CDOT_SIZE_MIN),max:String(CDOT_SIZE_MAX),step:'2',
        value:String(CDOT.size),'aria-label':L(S.curDotSize)});
      const sizeVal=h('span.wp-dim-val',CDOT.size+'px');
      const paintSize=()=>{ sizeIn.style.setProperty('--wpdf',((CDOT.size-CDOT_SIZE_MIN)/(CDOT_SIZE_MAX-CDOT_SIZE_MIN)*100)+'%'); sizeVal.textContent=CDOT.size+'px'; };
      paintSize();
      sizeIn.oninput=()=>{ setCDot({size:+sizeIn.value}); paintSize(); };
      dbox.appendChild(h('div.wp-dim.cur-dot-size',{html:ico('target')},sizeIn,sizeVal));
      /* fill vs outline */
      const stRow=h('div.acc-row');
      stRow.appendChild(h('span.acc-row-lab',L({en:'Style',ja:'スタイル'})));
      [{k:true,s:S.curDotFill},{k:false,s:S.curDotHollow}].forEach(o=>{
        stRow.appendChild(h('button.acc-pill'+(CDOT.fill===o.k?'.on':''),{type:'button',title:L(o.s),
          onclick:ev=>{ ev.stopPropagation(); setCDot({fill:o.k});
            [...stRow.querySelectorAll('.acc-pill')].forEach(x=>x.classList.remove('on'));
            ev.currentTarget.classList.add('on'); }},
          h('span',L(o.s))));
      });
      dbox.appendChild(stRow);
      /* colour (accent-follow swatches + custom picker) */
      const cr=h('div.acc-row.acc-row-tint.cur-dot-color');
      cr.appendChild(h('span.acc-row-lab',L(S.curDotColor)));
      const colKey=v=>CDOT.color===v;
      Object.keys(GLASS_TINTS).forEach(id=>{
        const v=GLASS_TINTS[id];
        const nm=id==='acc'?S.tintAccent:(ACCENTS[id]||{en:id,ja:id});
        cr.appendChild(h('button.gt-sw'+(colKey(v)?'.on':''),{type:'button',
          style:'--sw:'+(v||'linear-gradient(135deg,#e05237,#e8a53c)'),
          title:L(nm),'aria-label':L(nm),
          onclick:ev=>{ ev.stopPropagation(); setCDot({color:v});
            [...cr.querySelectorAll('.gt-sw,.gt-cust')].forEach(x=>x.classList.remove('on'));
            ev.currentTarget.classList.add('on'); }},
          v?h('i'):h('span.gt-acc',L(S.tintAccent).slice(0,1))));
      });
      const cust=h('input.gt-cust',{type:'color',title:L(S.tintCustom),'aria-label':L(S.tintCustom),
        value:CDOT.color||'#d8a94a'});
      cust.addEventListener('input',()=>{ setCDot({color:cust.value});
        [...cr.querySelectorAll('.gt-sw,.gt-cust')].forEach(x=>x.classList.remove('on'));
        cust.classList.add('on'); });
      cr.appendChild(cust);
      dbox.appendChild(cr);
      dbox.appendChild(h('div.wp-note.cur-dot-note',{html:esc(L(S.curDotHint))}));
    }
    pop.appendChild(dbox);
    /* cursor size & stretch (works on the cursor you have on) */
    const hasSrc=!!(CUR&&CUR.src);
    const sbox=h('div.cur-scl'+(hasSrc?'':' dim'),{title:hasSrc?'':L(S.curScaleHint)});
    const mkRow=(lab,icn,el,val)=>{
      const r=h('div.wp-dim');
      r.appendChild(h('span.acc-row-lab',lab));
      r.appendChild(el); r.appendChild(val);
      return r;
    };
    if(hasSrc){
      const sIn=h('input',{type:'range',min:String(CUR_SCALE_MIN*100),max:String(CUR_SCALE_MAX*100),step:'5',
        value:String(Math.round(CURS.s*100)),'aria-label':L(S.curSize)});
      const sVal=h('span.wp-dim-val',Math.round(CURS.s*100)+'%');
      const paintS=()=>{ sIn.style.setProperty('--wpdf',((Math.round(CURS.s*100)-CUR_SCALE_MIN*100)/(CUR_SCALE_MAX*100-CUR_SCALE_MIN*100)*100)+'%'); sVal.textContent=Math.round(CURS.s*100)+'%'; };
      paintS();
      sIn.oninput=()=>{ curSetScale(+sIn.value/100,undefined); paintS(); curApplySrc(CUR.src); };
      sbox.appendChild(mkRow(L(S.curSize),ico('cursor'),sIn,sVal));
      const tIn=h('input',{type:'range',min:String(CUR_STRETCH_MIN*100),max:String(CUR_STRETCH_MAX*100),step:'5',
        value:String(Math.round(CURS.st*100)),'aria-label':L(S.curStretch)});
      const tVal=h('span.wp-dim-val',Math.round(CURS.st*100)+'%');
      const paintT=()=>{ tIn.style.setProperty('--wpdf',((Math.round(CURS.st*100)-CUR_STRETCH_MIN*100)/(CUR_STRETCH_MAX*100-CUR_STRETCH_MIN*100)*100)+'%'); tVal.textContent=Math.round(CURS.st*100)+'%'; };
      paintT();
      tIn.oninput=()=>{ curSetScale(undefined,+tIn.value/100); paintT(); curApplySrc(CUR.src); };
      sbox.appendChild(mkRow(L(S.curStretch),ico('cursor'),tIn,tVal));
    }
    if(!hasSrc) sbox.appendChild(h('div.wp-note.cur-dot-note',{html:esc(L(S.curScaleHint))}));
    pop.appendChild(sbox);
    const note=h('div.wp-note');
    note.textContent=L({en:'Applied cursors stick after reload and work on every tool.',
      ja:'適用したカーソルは再読込後も保持され、全ツールで使えます。'});
    pop.appendChild(note);
    return;
  }

  if(isMe){
    const up=h('input',{type:'file',accept:'image/gif,image/png,image/webp,image/jpeg',style:'display:none'});
    const urlIn=h('input.wp-search.curl',{type:'url',placeholder:L(S.curPastePh),autocomplete:'off'});
    const urlGo=h('button.cur-urlgo',{type:'button',html:ico('check'),title:L(S.curByUrl),
      onclick:()=>{ const v=urlIn.value.trim(); if(!v) return;
        /* remote images from this page's own or CORS-friendly hosts prep fine;
           plain hosts fail -> fall back to raw URL (works on http/Pages) */
        curPrep(v,16,2,false).then(p=>setCursor({img:p.img,hx:p.hx,hy:p.hy,custom:1}))
          .catch(()=>{ setCursor({raw:v,hx:16,hy:2,custom:1}); curPopZone='me'; paintCurPop(); });
      }});
    urlGo.classList.add('cur-urlgo');
    if(CUR&&CUR.custom){
      const card=h('div.cur-me');
      card.appendChild(h('img.cur-big',{src:(CUR.anim&&CUR.anim[0])||CUR.img||CUR.raw,alt:''}));
      const act=h('div.cur-me-act');
      const rep=h('button.cur-act',{type:'button',html:ico('refresh')+'<span>'+esc(L(S.curReplace))+'</span>',
        onclick:()=>up.click()});
      const rem=h('button.cur-act.cur-act-red',{type:'button',html:ico('trash')+'<span>'+esc(L(S.curRemove))+'</span>',
        onclick:()=>{ curPopZone=''; setCursor(null); paintCurPop(); }});
      act.appendChild(rep); act.appendChild(rem);
      card.appendChild(act);
      pop.appendChild(card);
    }else{
      pop.appendChild(h('button.cur-drop',{type:'button',html:ico('upload')+'<span>'+esc(L(S.curUpload))+'</span>',
        onclick:()=>up.click()}));
    }
    const browse=h('div.wp-search-row');
    browse.appendChild(urlIn); browse.appendChild(urlGo);
    pop.appendChild(browse);
    up.onchange=()=>{ curPickFile(up.files&&up.files[0]); up.value=''; };
    pop.appendChild(up);
    pop.appendChild(h('div.wp-note',{html:esc(L(S.curCustomNote))}));
    return;
  }

  /* website view */
  const grid=h('div.cur-grid');
  site.items.forEach(it=>{
    const animated=it.length>5&&(Array.isArray(it[5])||/^w:/.test(String(it[5])));
    const b=h('button.cur-card', {
      type:'button',title:it[0]+' — '+L(S.curApplyTag),
      onclick:()=>curApplyItem(site,it,false)
    });
    b.innerHTML='<span class="cur-th"><img src="'+esc(it[1])+'" alt="" loading="lazy" decoding="async" onerror="this.closest(\'.cur-card\').classList.add(\'dead\')"></span>'+
      '<span class="cur-name">'+esc(it[0])+'</span>'+
      '<span class="cur-tag'+(animated?' anim':'')+'">'+esc(L(animated?S.curAnimTag:S.curApplyTag))+'</span>';
    grid.appendChild(b);
  });
  pop.appendChild(grid);
  const note=h('div.wp-note');
  note.innerHTML='<b>'+esc(site.src)+'</b> · <a href="'+esc(site.page)+'" target="_blank" rel="noopener">'+esc(L(S.curOpenPage))+' '+ico('external')+'</a>';
  note.insertAdjacentHTML('beforeend','<div class="cur-linknote">'+esc(site.credit||'')+'</div>');
  pop.appendChild(note);
}


function initDock(){
  const vb=$('#vfxBtn'), wb=$('#wpBtn'), cb=$('#curBtn');
  if(vb) vb.onclick=e=>{ e.stopPropagation(); toggleFxPop('vfx'); };
  if(wb) wb.onclick=e=>{ e.stopPropagation(); toggleFxPop('wp'); };
  if(cb) cb.onclick=e=>{ e.stopPropagation(); toggleFxPop('cur'); };
  const we=$('#wpEye');
  if(we) we.onclick=e=>{ e.stopPropagation(); toggleWallpaperEye(); };
  syncWallpaperEye();
  document.addEventListener('click',e=>{
    if(!e.target.closest('#fxDock')) closeFxPops();
  });
  /* live wallpaper: pause off-screen, resume on return (battery friendly) */
  document.addEventListener('visibilitychange',()=>{
    const v=wpVideoEl(); if(!v) return;
    if(document.hidden){ try{ v.pause(); }catch(e){} }
    else if(!wpReduceMotion()){ const p=v.play&&v.play(); if(p&&p.catch) p.catch(()=>{}); }
  });
}

/* ============================================================
   BOOT
   ============================================================ */
/* ============================================================
   GUESTBOOK — local rating & comment board (browser-only)
   Entries live in localStorage (azt_guest); nothing is sent
   anywhere. Each note can be copied to send to the owner.
   ============================================================ */
let GB = store.get('azt_guest',[]);
if(!Array.isArray(GB)) GB=[];
GB = GB.filter(e=>e&&typeof e==='object').map(e=>({
  n: typeof e.n==='string'?e.n.slice(0,40):'',
  r: Math.min(5,Math.max(0,e.r|0)),
  k: ['comment','idea','bug'].includes(e.k)?e.k:'comment',
  m: typeof e.m==='string'?e.m.slice(0,1000):'',
  t: typeof e.t==='number'?e.t:Date.now()
}));
const GB_DRAFT = { name:String(store.get('azt_guest_name','')||''), r:0, k:'comment', m:'' };
const gbKindLab = k => L({en:{comment:'Comment',idea:'Suggestion',bug:'Bug report'}[k],ja:{comment:'コメント',idea:'提案',bug:'不具合報告'}[k]});
function gbStars(n,big){
  const w=h('span.gb-dstars'+(big?'.big':''));
  for(let i=0;i<5;i++) w.appendChild(h('span'+(i<n?'.on':''),{html:ico('star')}));
  return w;
}
function paintGuestbook(){
  const box=$('#gbBox'); if(!box) return;
  clear(box);
  const rat=GB.filter(e=>e.r>0);
  const avg=rat.length?(rat.reduce((s,e)=>s+e.r,0)/rat.length):0;
  const dist=[5,4,3,2,1].map(s=>rat.filter(e=>e.r===s).length);
  const maxD=Math.max(1,...dist);
  const cnt=k=>GB.filter(e=>e.k===k).length;

  /* --- rating summary --- */
  const bars=h('div.gb-bars');
  [5,4,3,2,1].forEach((s,i)=>{
    bars.appendChild(h('span.gb-blab',String(s)));
    bars.appendChild(h('div.gb-track',h('div.gb-fill',{style:'width:'+(dist[i]/maxD*100)+'%'})));
    bars.appendChild(h('span.gb-bnum',String(dist[i])));
  });
  const summary=h('div.gb-summary',
    h('div.gb-avg',
      h('div.gb-num',rat.length?avg.toFixed(1):'–'),
      gbStars(Math.round(avg),true),
      h('div.gb-based',{html:esc(rat.length
        ? L({en:'based on '+rat.length+' rating'+(rat.length===1?'':'s'),ja:rat.length+'件の評価'})
        : L({en:'No ratings yet — be the first!',ja:'まだ評価なし — 最初の1人になろう！'}))})),
    bars,
    h('div.gb-tally',{html:esc((()=>{
      const nC=cnt('comment'),nI=cnt('idea'),nB=cnt('bug');
      return L({
        en:nC+' '+(nC===1?'comment':'comments')+' · '+nI+' '+(nI===1?'suggestion':'suggestions')+' · '+nB+' '+(nB===1?'bug report':'bug reports'),
        ja:nC+'コメント · '+nI+'提案 · '+nB+'不具合報告'});
    })())}));

  /* --- compose form --- */
  const updPost=()=>{ post.disabled=!(GB_DRAFT.m.trim()||GB_DRAFT.r); };
  const starsW=h('div.gb-stars');
  const clr=h('button.gb-clear',{type:'button',title:L({en:'Clear rating',ja:'評価をクリア'}),html:ico('x')});
  let hv=0;
  const apply=()=>{ [...starsW.children].forEach((s,i)=>{ s.classList.toggle('on',i<(hv||GB_DRAFT.r)); }); clr.style.visibility=GB_DRAFT.r?'visible':'hidden'; };
  for(let i=1;i<=5;i++){
    const idx=i;
    starsW.appendChild(h('button.gb-star',{type:'button','aria-label':idx+L({en:' star'+(idx===1?'':'s'),ja:'つ星'}),
      html:ico('star'),
      onmouseenter:()=>{ hv=idx; apply(); },
      onmouseleave:()=>{ hv=0; apply(); },
      onclick:()=>{ GB_DRAFT.r=(GB_DRAFT.r===idx?0:idx); hv=0; apply(); updPost(); }}));
  }
  clr.onclick=()=>{ GB_DRAFT.r=0; hv=0; apply(); updPost(); };
  const nameIn=h('input.gb-input',{type:'text',maxlength:40,placeholder:L(S.gbNamePh),value:GB_DRAFT.name});
  nameIn.addEventListener('input',e=>{ GB_DRAFT.name=e.target.value; });
  const ta=h('textarea.gb-input',{rows:4,maxlength:1000,placeholder:L(S.gbMsgPh)});
  ta.value=GB_DRAFT.m;
  ta.addEventListener('input',e=>{ GB_DRAFT.m=e.target.value; updPost(); });
  const kinds=h('div.chipset');
  ['comment','idea','bug'].forEach(k=>{
    const c=h('button.tchip'+(GB_DRAFT.k===k?'.on':''),{type:'button',
      html:ico(k==='comment'?'message':k==='idea'?'lightbulb':'bug')+' '+esc(gbKindLab(k)),
      onclick:()=>{ GB_DRAFT.k=k; [...kinds.children].forEach(x=>x.classList.remove('on')); c.classList.add('on'); }});
    kinds.appendChild(c);
  });
  const post=h('button.btn.primary.gold.gb-post',{type:'button',html:ico('send')+' '+esc(L(S.gbPost))});
  post.onclick=()=>{
    const msg=GB_DRAFT.m.trim();
    if(!msg && !GB_DRAFT.r) return;
    GB.unshift({n:GB_DRAFT.name.trim().slice(0,40),r:GB_DRAFT.r,k:GB_DRAFT.k,m:msg,t:Date.now()});
    if(GB.length>100) GB.length=100;
    store.set('azt_guest',GB);
    if(GB_DRAFT.name.trim()) store.set('azt_guest_name',GB_DRAFT.name.trim());
    GB_DRAFT.r=0; GB_DRAFT.m=''; GB_DRAFT.k='comment';
    toast(L(S.gbPosted));
    paintGuestbook();
  };
  const form=h('div.gb-form',
    h('div.gb-flabel',{html:ico('star')+' '+esc(L(S.gbRate))}),
    h('div.gb-starrow',starsW,clr),
    nameIn, kinds, ta,
    h('div.gb-frow',post,h('span.hint',{html:esc(L(S.gbNoEmail))})));
  updPost();

  /* --- notes list --- */
  const list=h('div.gb-list');
  if(!GB.length) list.appendChild(h('div.gb-empty',{html:ico('message')+' '+esc(L(S.gbNoEntries))}));
  GB.forEach((e,i)=>{
    const d=new Date(e.t);
    const dt=d.toLocaleDateString(LANG==='ja'?'ja-JP':'en-US',{month:'short',day:'numeric',year:'numeric'})
      +' '+d.toLocaleTimeString(LANG==='ja'?'ja-JP':'en-US',{hour:'2-digit',minute:'2-digit'});
    list.appendChild(h('div.gb-entry',
      h('div.gb-ehead',
        h('span.gb-av',{html:ico(e.n?'user':'message')}),
        h('b.gb-ename',e.n||L(S.gbAnonymous)),
        h('span.gb-kind.k-'+e.k,gbKindLab(e.k)),
        e.r?gbStars(e.r):null,
        h('span.gb-espacer'),
        h('span.gb-etime',dt),
        h('button.gb-ico',{type:'button',title:L(S.gbCopySend),html:ico('copy'),
          onclick:()=>copyText([
            (e.n||L(S.gbAnonymous))+' · '+gbKindLab(e.k)+(e.r?' · '+e.r+'/5':''),
            dt, e.m,
            '— '+L({en:'Anime Zaki Tools guestbook',ja:'Anime Zaki Tools ゲストブック'})].filter(Boolean).join('\n'))}),
        h('button.gb-ico.danger',{type:'button',title:L(S.gbDel),html:ico('trash'),onclick:()=>{
          if(!confirm(L({en:'Delete this note?',ja:'このノートを削除しますか？'}))) return;
          GB.splice(i,1); store.set('azt_guest',GB); paintGuestbook();
        }})),
      e.m?h('div.gb-emsg',e.m):h('div.gb-emsg.gb-ratingonly',{html:esc(L({en:'(rating only)',ja:'（評価のみ）'}))})));
  });

  box.appendChild(summary);
  box.appendChild(h('div.gb-cols',form,list));
  box.appendChild(h('p.gb-note',{html:esc(L(S.gbNote))}));
}

/* ============================================================
   SITE ACCENT PICKER (top-bar color button)
   ============================================================ */
const ACCENTS={
  gold:{en:'Gold',ja:'ゴールド',c:'#d8a94a'},
  verm:{en:'Vermilion',ja:'朱色',c:'#d8452b'},
  sea:{en:'Sea',ja:'浅葱色',c:'#3f9d8f'},
  indigo:{en:'Indigo',ja:'藍色',c:'#6c88db'},
  plum:{en:'Plum',ja:'梅色',c:'#b06aa8'},
  sakura:{en:'Sakura',ja:'桜色',c:'#dd8fa9'},
  green:{en:'Green',ja:'若竹色',c:'#4fae5c'},
  cyan:{en:'Cyan',ja:'瑠璃色',c:'#38a9c9'},
  orange:{en:'Orange',ja:'柿色',c:'#e89133'},
  crimson:{en:'Crimson',ja:'紅色',c:'#cf4463'},
  violet:{en:'Violet',ja:'藤色',c:'#9d7adb'},
  ink:{en:'Ink',ja:'墨色',c:'#7f8794'}
};
function setSiteAccent(id){
  if(!ACCENTS[id]) id='gold';
  document.documentElement.setAttribute('data-acc',id);
  store.set('azt_acc',id);
}
/* canvas fillStyle can't parse color-mix — read the live accent back as rgba */
function accRGBA(a){
  const hx=(getComputedStyle(document.documentElement).getPropertyValue('--gold')||'').trim()||'#d8a94a';
  const n=parseInt(hx.slice(1),16);
  if(isNaN(n)) return 'rgba(216,169,74,'+(a==null?1:a)+')';
  return 'rgba('+((n>>16)&255)+','+((n>>8)&255)+','+(n&255)+','+(a==null?1:a)+')';
}
let accPop=null;
function closeAccPop(){ if(accPop){ accPop.remove(); accPop=null; document.removeEventListener('click',closeAccPop); } }

/* card look: paper (default washi) / midnight (dark glass) / liquid glass */
function setCardStyle(k){
  if(k!=='paper'&&k!=='midnight'&&k!=='glass') k='paper';
  store.set('azt_card',k);
  document.documentElement.setAttribute('data-card',k);
}
/* liquid-glass tint: '' = follow the site accent, else a #rrggbb swatch */
const GLASS_TINTS={
  acc:'',gold:'#d8a94a',verm:'#d8452b',sea:'#3f9d8f',indigo:'#6c88db',plum:'#b06aa8',
  sakura:'#dd8fa9',green:'#4fae5c',cyan:'#38a9c9',violet:'#9d7adb',ink:'#7f8794'
};
function setGlassTint(v,noStore){
  if(typeof v!=='string'||!/^#[0-9a-fA-F]{6}$/.test(v)) v='';
  if(!noStore){ try{ store.set('azt_gtt',v); }catch(e){} }
  if(v) document.documentElement.style.setProperty('--glass-tint',v);
  else document.documentElement.style.removeProperty('--glass-tint');
}
/* tool transparency: 0..100 (0 = fully opaque default). Drives --copn, which
   mixes every tool surface (cards/panels/modals/rows) toward transparent,
   so the wallpaper shows through regardless of surface mode */
function setCardTransparency(v,noStore){
  let t=+v;
  if(isNaN(t)) t=0;
  t=Math.max(0,Math.min(100,t));
  if(!noStore){ try{ store.set('azt_cop',String(Math.round(t))); }catch(e){} }
  document.documentElement.style.setProperty('--copn',(t/100).toFixed(3));
}
/* liquid-glass intensity: 0..100, default 60 (= fully original look).
   Drives one custom property: all glass surfaces derive from it in CSS. */
function setGlassAmount(v,noStore){
  let t=(+v||0);
  if(isNaN(t)) t=60;
  t=Math.max(0,Math.min(100,t))/100;
  if(!noStore){ try{ store.set('azt_gamt',String(Math.round(t*100))); }catch(e){} }
  document.documentElement.style.setProperty('--g-amount',t.toFixed(3));
}
/* layout density: roomy (default) or compact */
function setDensity(k){
  if(k!=='roomy'&&k!=='compact') k='roomy';
  store.set('azt_dens',k);
  document.documentElement.setAttribute('data-dens',k);
}

function toggleAccPop(anchor){
  if(accPop){ closeAccPop(); return; }
  const cur=store.get('azt_acc','gold')||'gold';
  accPop=h('div.acc-pop',{role:'menu','aria-label':L(S.accTitle)});
  accPop.addEventListener('click',ev=>ev.stopPropagation());   /* clicks inside never close the panel (sliders, pills) */
  accPop.appendChild(h('div.pop-title.acc-h',{html:ico('palette')+esc(L(S.accTitle))}));
  Object.keys(ACCENTS).forEach(id=>{
    const a=ACCENTS[id];
    accPop.appendChild(h('button.acc-sw'+(cur===id?'.on':''),{type:'button',title:L(a),style:'--sw:'+a.c,
      onclick:ev=>{ ev.stopPropagation(); setSiteAccent(id);
        [...accPop.querySelectorAll('.acc-sw')].forEach(x=>x.classList.remove('on'));
        ev.currentTarget.classList.add('on'); }},
      h('i'),h('span',L(a))));
  });
  /* surface (paper / midnight / liquid glass) + layout rows */
  const row=(lab,opts,curVal,apply,rename)=>{
    const w=h('div.acc-row');
    w.appendChild(h('span.acc-row-lab',lab));
    opts.forEach(o=>{
      w.appendChild(h('button.acc-pill'+(curVal===o.k?'.on':''),{type:'button',title:L(rename?rename[o.k]:o),
        onclick:ev=>{ ev.stopPropagation(); apply(o.k);
          [...w.querySelectorAll('.acc-pill')].forEach(x=>x.classList.remove('on'));
          ev.currentTarget.classList.add('on'); }},
        h('span',L(rename?rename[o.k]:o))));
    });
    return w;
  };
  accPop.appendChild(row(L(S.accSurface),
    [{k:'paper'},{k:'midnight'},{k:'glass'}],
    store.get('azt_card','paper'),setCardStyle,
    {paper:S.surfPaper,midnight:S.surfMidnight,glass:S.surfGlass}));
  /* liquid-glass tint row (swatches + custom color) */
  const gtr=h('div.acc-row.acc-row-tint');
  gtr.appendChild(h('span.acc-row-lab',L(S.accTint)));
  const gt=store.get('azt_gtt','')||'';
  Object.keys(GLASS_TINTS).forEach(id=>{
    const v=GLASS_TINTS[id];
    const nm=id==='acc'?S.tintAccent:(ACCENTS[id]||{en:id,ja:id});
    gtr.appendChild(h('button.gt-sw'+(gt===v?'.on':''),{type:'button',
      style:'--sw:'+(v||'linear-gradient(135deg,#e05237,#e8a53c)'),
      title:L(nm),
      'aria-label':L(nm),
      onclick:ev=>{ ev.stopPropagation(); setGlassTint(v);
        [...gtr.querySelectorAll('.gt-sw,.gt-cust')].forEach(x=>x.classList.remove('on'));
        ev.currentTarget.classList.add('on'); }},
      v?h('i'):h('span.gt-acc',L(S.tintAccent).slice(0,1))));
  });
  const cust=h('input.gt-cust',{type:'color',title:L(S.tintCustom),'aria-label':L(S.tintCustom),
    value:/^#[0-9a-fA-F]{6}$/.test(gt)?gt:'#d8a94a'});
  cust.addEventListener('input',()=>{ setGlassTint(cust.value);
    [...gtr.querySelectorAll('.gt-sw,.gt-cust')].forEach(x=>x.classList.remove('on'));
    cust.classList.add('on'); });
  gtr.appendChild(cust);
  accPop.appendChild(gtr);
  /* tool transparency slider (works in every surface mode) */
  {
    const CT=(function(){try{const v=+store.get('azt_cop',0);return isNaN(v)?0:Math.min(100,Math.max(0,v))}catch(e){return 0}})();
    const cIn=h('input',{type:'range',min:'0',max:'100',step:'5',value:String(CT),'aria-label':L(S.toolTrans)});
    const cVal=h('span.wp-dim-val',CT+'%');
    cIn.style.setProperty('--wpdf',CT+'%');
    cIn.oninput=()=>{ setCardTransparency(+cIn.value); cVal.textContent=cIn.value+'%'; cIn.style.setProperty('--wpdf',cIn.value+'%'); };
    accPop.appendChild(h('div.wp-dim.glass-dim',{html:ico('blur')+'<span class="acc-row-lab">'+esc(L(S.toolTrans))+'</span>'},cIn,cVal));
  }
  /* liquid-glass intensity slider (only meaningful when glass is on) */
  if(store.get('azt_card','paper')==='glass'){
    const GT=(function(){try{return Math.min(100,Math.max(0,+store.get('azt_gamt',60)||60))}catch(e){return 60}})();
    const gIn=h('input',{type:'range',min:'0',max:'100',step:'5',value:String(GT),'aria-label':L(S.glassAmt)});
    const gVal=h('span.wp-dim-val',GT+'%');
    const paintG=()=>{ gIn.style.setProperty('--wpdf',(GT)+'%'); gVal.textContent=gIn.value+'%'; };
    paintG();
    gIn.oninput=()=>{ setGlassAmount(+gIn.value); gVal.textContent=gIn.value+'%'; gIn.style.setProperty('--wpdf',gIn.value+'%'); };
    accPop.appendChild(h('div.wp-dim.glass-dim',{html:ico('blur')+'<span class="acc-row-lab">'+esc(L(S.glassAmt))+'</span>'},gIn,gVal));
  }
  accPop.appendChild(row(L(S.accLayout),
    [{k:'roomy',en:'Roomy',ja:'ゆったり'},{k:'compact',en:'Compact',ja:'コンパクト'}],
    store.get('azt_dens','roomy'),setDensity));
  document.body.appendChild(accPop);
  const r=anchor.getBoundingClientRect(), w=accPop.offsetWidth;
  accPop.style.top=(r.bottom+8)+'px';
  /* keep the pop on-screen: clamp its height to the space under the anchor
     so no theme button ever falls below the window */
  accPop.style.maxHeight=Math.max(220,innerHeight-r.bottom-16)+'px';
  accPop.style.left=Math.round(Math.min(Math.max(8,r.left+r.width/2-w/2),innerWidth-w-8))+'px';
  setTimeout(()=>document.addEventListener('click',closeAccPop),0);
}

function boot(){
  document.documentElement.setAttribute('data-acc',store.get('azt_acc','gold')||'gold'); /* sync saved accent */
  document.documentElement.setAttribute('data-card',store.get('azt_card','paper')||'paper'); /* card look */
  document.documentElement.setAttribute('data-dens',store.get('azt_dens','roomy')||'roomy'); /* layout */
  setGlassTint(store.get('azt_gtt','')||'',true); /* liquid-glass tint (set, not re-stored) */
  setGlassAmount(store.get('azt_gamt','')||60,true); /* liquid-glass intensity */
  setCardTransparency(store.get('azt_cop',0),true); /* tool transparency */
  applyCursor(); /* custom cursor (no flash when pre-painted in <head>) */
  applyCDot(); /* pointer tip dot */
  setLang(LANG);
  $$('[data-ico]').forEach(el=>el.innerHTML=ico(el.dataset.ico));
  paintChips(); paintGrid(); paintWatchBtn();
  renderApiFooter();
  initReveal();
  initLightbox();
  initVFX();
  initDock();
  paintDockState();
  initMediaDock();
  if(WP.cat!=='off') setWallpaper(WP.cat,{silent:true});
  doctorCheck();
  setInterval(doctorCheck,60000);

  $('#liveSearch').addEventListener('input',e=>{ query=e.target.value.trim(); paintGrid(); });
  $('#langBtn').onclick=()=>setLang(LANG==='en'?'ja':'en');
  $('#doctorBtn').onclick=openDoctor;
  $('#paletteBtn').onclick=openPalette;
  $('#heroPalette').onclick=openPalette;
  $('#randomBtn').onclick=randomTool;
  $('#accBtn').onclick=e=>{ e.stopPropagation(); toggleAccPop(e.currentTarget); };
  $('#heroRandom').onclick=randomTool;
  $('#heroWatch').onclick=()=>openTool('wl-manager');
  $('#brandHome').onclick=()=>{ activeCat='all'; query=''; $('#liveSearch').value=''; paintChips(); paintGrid(); scrollTo({top:0,behavior:'smooth'}); };

  document.addEventListener('keydown',e=>{
    const typing=/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName||'');
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){ e.preventDefault(); if(!$('#paletteRoot').firstChild) openPalette(); }
    else if(e.key==='/'&&!typing){ e.preventDefault(); $('#liveSearch').focus(); }
    else if(e.key==='Escape'){ if(closeFxPops()) return; if($('#paletteRoot').firstChild){ $('#paletteRoot').innerHTML=''; document.body.style.overflow=modalStack.length?'hidden':''; } else closeTop(); }
  });
}
document.addEventListener('DOMContentLoaded',boot);
