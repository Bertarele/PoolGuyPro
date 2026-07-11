// home.jsx — navy header + Meus Anúncios hero + sections

function HomeScreen({ ctx }) {
  const { user, lang, setLang, openNotifications, openPaywall, openPostMenu, goTab, openWallet, openPublicProfile, liveMarket=[], liveJobs=[], liveVacations=[], hasUnreadChat, hasUnreadNotif, openListingById, openMarketPost, darkMode=false, isDesktop=false, county='Broward' } = ctx;
  // Desktop detection via CSS (.pg-mobile-only / .pg-desktop-only) — no JS needed
  const t = STRINGS[lang];
  const isPremium = user.tier === 'premium';

  const subtitle = lang==='pt'
    ? 'Compre, venda e alugue equipamentos de piscina'
    : lang==='es'
      ? 'Compra, vende y renta equipo de piscina'
      : 'Buy, sell and rent pool equipment';

  const premiumLbls = lang==='pt'
    ? { be:'Seja Premium', desc:'Anúncios ilimitados, posição prioritária e acesso exclusivo a trabalhos.', cta:'Assine Agora →', tag:'Mais popular' }
    : lang==='es'
      ? { be:'Hazte Premium', desc:'Anuncios ilimitados, posición prioritaria y acceso exclusivo a trabajos.', cta:'Suscríbete Ahora →', tag:'Más popular' }
      : { be:'Go Premium', desc:'Unlimited listings, priority placement & exclusive job access.', cta:'Subscribe Now →', tag:'Most popular' };

  // ── Resolve author name (same logic as dbWrite) ──────────────
  const myAuthor = (user.name && !user.name.includes('@'))
    ? user.name
    : (user.email ? user.email.split('@')[0] : null);

  // My real posts from Supabase liveMarket — active only (exclude sold)
  // UID is the only reliable check — name fallbacks only for legacy posts without author_id
  // (prevents false-match when two users share the same display name)
  const myMarketPosts = liveMarket.filter(m =>
    m.status !== 'sold' &&
    (
      (user.uid && m.author_id && m.author_id === user.uid) ||
      (!m.author_id && myAuthor && m.author === myAuthor) ||
      (!m.author_id && user.name && m.author === user.name) ||
      (!m.author_id && user.email && m.author === user.email.split('@')[0])
    )
  );

  // My own job postings (from liveJobs in the Work tab)
  const myOwnJobs = liveJobs
    .filter(j => j.author_id && user.uid && j.author_id === user.uid)
    .map(j => ({
      _id: j._id,
      _isJob: true,
      status: 'approved',
      name: j.role || '—',
      type: 'job',
      loc: j.loc || '',
      price: j.pay || null,
      priceMode: j.payMode || 'fixed',
      payMode: j.payMode,
    }));

  // My own Quick Pool postings
  const [myQuickJobs, setMyQuickJobs] = React.useState([]);
  React.useEffect(() => {
    if (!window.sb || !user?.uid) { setMyQuickJobs([]); return; }
    window.sb.from('quick_pool_jobs').select('*')
      .eq('poster_id', user.uid).in('status', ['open','filled'])
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setMyQuickJobs((data||[]).map(j => ({
          _id: j.id,
          _isQuickPool: true,
          status: 'approved',
          name: j.title || j.city || '—',
          type: 'quick',
          loc: j.city || '',
          price: j.price_negotiable ? null : j.price_per_pool,
          priceMode: j.price_negotiable ? 'neg' : 'fixed',
        })));
      });
  }, [user?.uid]);

  const myPosts = [...myMarketPosts, ...myOwnJobs, ...myQuickJobs];

  const [selectedFeatured, setSelectedFeatured] = React.useState(null);
  const [selectedJob,      setSelectedJob]      = React.useState(null);

  // Track whether the app is currently in the foreground
  const [isAppVisible, setIsAppVisible] = React.useState(
    () => document.visibilityState === 'visible'
  );
  React.useEffect(() => {
    const update = () => setIsAppVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  // Sponsored card — active, not expired
  const [sponsoredCard, setSponsoredCard] = React.useState(null);
  React.useEffect(() => {
    if (!window.sb) return;
    window.sb.from('sponsored_cards').select('*').eq('active', true)
      .or('expires_at.is.null,expires_at.gte.' + new Date().toISOString())
      .order('created_at', { ascending: false }).limit(1)
      .then(({ data }) => { if (data && data.length > 0) setSponsoredCard(data[0]); });
  }, []);

  // Featured marketplace listings — admin-picked (featured=true) OR user-paid boost still active
  const [featuredListings, setFeaturedListings] = React.useState([]);
  React.useEffect(() => {
    if (!window.sb) return;
    window.sb.from('marketplace').select('*')
      .eq('status', 'approved')
      .or('featured.eq.true,boosted_until.gt.' + new Date().toISOString())
      .order('created_at', { ascending: false }).limit(10)
      .then(({ data }) => { if (data && data.length > 0) setFeaturedListings(data); });
  }, []);

  // Quick pool jobs posted today (live from Supabase)
  const [todayQuick, setTodayQuick] = React.useState([]);
  React.useEffect(() => {
    if (!window.sb) return;
    const cutoff = Date.now() - 24*60*60*1000;
    window.sb.from('quick_pool_jobs').select('*').eq('status','open')
      .order('created_at', { ascending: false }).limit(30)
      .then(({ data }) => {
        if (!data) return;
        setTodayQuick(data.filter(j => new Date(j.created_at).getTime() > cutoff));
      });
  }, []);

  // Vacation listings that have today as an available (unbooked) day
  const todayItems = React.useMemo(() => {
    const now = new Date();
    const todayDay = now.getDate();
    const todayMonth = now.getMonth(); // 0-indexed
    const todayYear = now.getFullYear();
    const todayDow = now.getDay(); // 0=Sun

    const quick = todayQuick.map(j => ({
      id: j.id, _type: 'quick',
      title: { en: j.title, pt: j.title, es: j.title },
      loc: j.city,
      dist: { en:'', pt:'', es:'' },
      price: j.price_negotiable ? 'neg' : j.price_per_pool,
      urgency: 'new',
      pools: j.pools_count || 1,
      when: { en: j.when_label||'Today', pt: j.when_label||'Hoje', es: j.when_label||'Hoy' },
      body: { en: j.description||'', pt: j.description||'', es: j.description||'' },
      type: j.pool_type || '',
    }));

    const vacas = liveVacations
      .filter(v =>
        v.monthIdx === todayMonth &&
        v.year === todayYear &&
        (v.days||[]).includes(todayDay) &&
        !(v.bookedDays||[]).includes(todayDay)
      )
      .map(v => {
        const pools = (v.poolsByWeekday||{})[todayDow] ||
          (Object.values(v.poolsByWeekday||{}).find(n=>n>0)) || '?';
        return {
          id: v._id, _type: 'vacation',
          _vacRef: v,
          title: {
            en: `Vacation cover — ${v.region}`,
            pt: `Cobertura de férias — ${v.region}`,
            es: `Cobertura de vacaciones — ${v.region}`,
          },
          loc: v.region,
          dist: { en:'', pt:'', es:'' },
          price: v.price,
          urgency: 'urgent',
          pools,
          when: { en:'Today', pt:'Hoje', es:'Hoy' },
          body: { en: v.note||'', pt: v.note||'', es: v.note||'' },
          type: 'vacation',
        };
      });

    return [...vacas, ...quick].slice(0, 5);
  }, [todayQuick, liveVacations]);

  const catLabel = (cat) => {
    const map = {
      Routes:  {pt:'Rotas',    es:'Rutas',      en:'Routes'},
      Heaters: {pt:'Aquecedor',es:'Calentador', en:'Heaters'},
      Pole:    {pt:'Vara',     es:'Vara',        en:'Pole'},
      Pumps:   {pt:'Bombas',   es:'Bombas',      en:'Pumps'},
      Filters: {pt:'Filtros',  es:'Filtros',     en:'Filters'},
      Vacuum:  {pt:'Aspirador',es:'Aspirador',   en:'Vacuum'},
      Robot:   {pt:'Robô',     es:'Robot',       en:'Robot'},
    };
    return (map[cat] || {})[lang] || cat;
  };

  const greetWord = lang==='pt' ? 'Bem-vindo' : lang==='es' ? 'Bienvenido' : 'Welcome';

  // Type label
  const typeLabel = (m) => {
    if (m.type === 'sell') return lang==='pt'?'À venda':lang==='es'?'En venta':'For sale';
    if (m.type === 'rent') return lang==='pt'?'Aluguel':lang==='es'?'Renta':'Rental';
    if (m.type === 'route') return lang==='pt'?'Rota':lang==='es'?'Ruta':'Route';
    if (m.type === 'pool') return lang==='pt'?'Piscina':lang==='es'?'Piscina':'Pool';
    if (m.type === 'job') return lang==='pt'?'Vaga de Emprego':lang==='es'?'Oferta de Trabajo':'Job Opening';
    return m.type || '';
  };

  const adsSectionTitle = lang==='pt'?'Meus Anúncios':lang==='es'?'Mis Anuncios':'My Listings';
  const adsCountLbl = myPosts.length === 1
    ? (lang==='pt'?`${myPosts.length} anúncio`:lang==='es'?`${myPosts.length} anuncio`:`${myPosts.length} listing`)
    : (lang==='pt'?`${myPosts.length} anúncios`:lang==='es'?`${myPosts.length} anuncios`:`${myPosts.length} listings`);

  return (
    <div style={{position:'relative', width:'100%', height:'100%', overflow:'hidden'}}>
    <div className="pg-screen pg-screen-body" style={{paddingBottom:110, height:'100%', overflowY:'auto', background:'var(--pg-bg)'}}>

      {/* Header — desktop vs mobile, checked directly at render time */}
      {(function(){
        const H = headerTheme(darkMode);
        const ic = H.text;
        const firstName = myAuthor ? myAuthor.split(' ')[0] : (user.email ? user.email.split('@')[0] : '');
        const onDesktop = window.innerWidth > 768;

        if (onDesktop) {
          // ── Desktop: full banner with logo centred ───────────────
          return (
            <div style={{
              background: darkMode
                ? 'linear-gradient(135deg, #071729 0%, #0A2240 55%, #071D38 100%)'
                : 'linear-gradient(135deg, #e8f5ff 0%, #d4ecfa 55%, #c5e4f5 100%)',
              borderBottom: darkMode ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(10,40,64,0.09)',
              position:'relative', overflow:'visible',
            }}>
              {/* Decorative glow blobs */}
              <div style={{position:'absolute', top:-60, left:'30%', width:300, height:300, borderRadius:'50%',
                background: darkMode ? 'radial-gradient(circle, rgba(14,186,199,0.06) 0%, transparent 65%)' : 'radial-gradient(circle, rgba(0,119,182,0.07) 0%, transparent 65%)',
                pointerEvents:'none'}}/>
              <div style={{position:'absolute', bottom:-80, right:'10%', width:260, height:260, borderRadius:'50%',
                background: darkMode ? 'radial-gradient(circle, rgba(0,122,255,0.05) 0%, transparent 65%)' : 'radial-gradient(circle, rgba(14,186,199,0.06) 0%, transparent 65%)',
                pointerEvents:'none'}}/>

              {/* Main row */}
              <div style={{display:'flex', alignItems:'center', padding:'22px 36px', gap:0}}>

                {/* LEFT — greeting + location */}
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:17, fontWeight:700, color:H.text, letterSpacing:'-0.02em', lineHeight:1.2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                    {greetWord}, {firstName}! 👋
                  </div>
                  <div style={{display:'flex', alignItems:'center', gap:5, marginTop:4}}>
                    <span style={{fontSize:11, color:H.faint, fontWeight:400}}>{subtitle}</span>
                  </div>
                </div>

                {/* CENTRE — logo (absolute so it doesn't push header height) */}
                <div style={{flex:'0 0 200px', position:'relative', display:'flex', justifyContent:'center'}}>
                  <img
                    src={darkMode ? 'wordmarkwhite.png' : 'pgx-logo.png'}
                    alt="PoolGuyX"
                    style={{
                      height:190, objectFit:'contain',
                      position:'absolute', top:'calc(58% + 10px)', transform:'translateY(-50%)',
                      filter: darkMode ? 'drop-shadow(0 2px 12px rgba(14,186,199,0.30))' : 'drop-shadow(0 2px 10px rgba(0,90,160,0.18))',
                      zIndex:2,
                    }}
                  />
                </div>

                {/* RIGHT — lang / chat / notif */}
                <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'flex-end', gap:8}}>
                  <LangPill lang={lang} setLang={setLang} onDark={darkMode}/>

                  {/* Chat */}
                  <div style={{position:'relative'}}>
                    <button onClick={() => ctx.openChat && ctx.openChat()} style={{
                      width:38, height:38, borderRadius:11, border:'none', cursor:'pointer',
                      background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(10,40,64,0.07)',
                      display:'flex', alignItems:'center', justifyContent:'center', transition:'background .15s',
                    }}>
                      {Icon.msg(18, darkMode ? 'rgba(255,255,255,0.70)' : H.text)}
                    </button>
                    {hasUnreadChat && <div style={{position:'absolute', top:5, right:5, width:7, height:7, borderRadius:'50%', background:'#38BDF8', pointerEvents:'none'}}/>}
                  </div>

                  {/* Notifications */}
                  <div style={{position:'relative'}}>
                    <button onClick={openNotifications} style={{
                      width:38, height:38, borderRadius:11, border:'none', cursor:'pointer',
                      background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(10,40,64,0.07)',
                      display:'flex', alignItems:'center', justifyContent:'center', transition:'background .15s',
                    }}>
                      {Icon.bell(18, darkMode ? 'rgba(255,255,255,0.70)' : H.text)}
                    </button>
                    {hasUnreadNotif && <div style={{position:'absolute', top:5, right:5, width:7, height:7, borderRadius:'50%', background:'#FF3B30', pointerEvents:'none'}}/>}
                  </div>
                </div>
              </div>
            </div>
          );
        }

        // ── Mobile: custom header (full control over layout) ─────
        const _bg = darkMode
          ? 'linear-gradient(145deg, #040D18 0%, #071A2E 52%, #0A2840 100%)'
          : 'linear-gradient(145deg, #f0f9ff 0%, #dff0fb 52%, #cce8f5 100%)';
        return (
          <div style={{background:_bg, position:'relative', overflow:'hidden', paddingBottom:16}}>
            {/* Decorative circles */}
            <div style={{position:'absolute', top:-60, right:-60, width:200, height:200, borderRadius:'50%', background:H.glow, pointerEvents:'none'}}/>
            <div style={{position:'absolute', top:-55, right:-55, width:190, height:190, borderRadius:'50%', border:`1px solid ${H.ring1}`, pointerEvents:'none'}}/>

            {/* Top row: logo + buttons */}
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0px 18px 0', position:'relative', zIndex:1, marginTop:-18}}>
              <div style={{height:118, overflow:'hidden', transform:'translateY(-14px) translateX(-22px)', width:'calc(100vw - 160px)', flexShrink:1, minWidth:0}}>
                <img
                  src={darkMode ? 'wordmarkwhite.png' : 'pgx-logo.png'}
                  alt="PoolGuyX"
                  className="pg-home-logo"
                  style={{filter: darkMode ? 'drop-shadow(0 2px 12px rgba(0,0,0,0.35))' : 'drop-shadow(0 2px 6px rgba(0,0,0,0.12))'}}
                />
              </div>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <LangPill lang={lang} setLang={setLang} onDark={darkMode}/>
                <div style={{position:'relative', display:'inline-flex'}}>
                  <IconButton dark={darkMode} onClick={() => ctx.openChat && ctx.openChat()}>
                    {Icon.msg(20, ic)}
                  </IconButton>
                  {hasUnreadChat && <span style={{
                    position:'absolute', top:5, right:5,
                    width:8, height:8, borderRadius:'50%',
                    background:'#FF3B30', border:`1.5px solid ${darkMode?'#011B5A':'#d0e8f5'}`,
                    pointerEvents:'none',
                  }}/>}
                </div>
                <IconButton dark={darkMode} onClick={openNotifications} badge={!!hasUnreadNotif}>{Icon.bell(20, ic)}</IconButton>
              </div>
            </div>

            {/* Bottom row: greeting + active */}
            <div style={{padding:'0px 18px 8px 23px', marginTop:-28, display:'flex', alignItems:'center', justifyContent:'space-between', position:'relative', zIndex:1}}>
              <div>
                <div style={{fontSize:13, fontWeight:600, color:H.mid, letterSpacing:'-0.01em'}}>
                  {greetWord}, {firstName}! 👋
                </div>
              </div>
              {isAppVisible && (
                <div style={{
                  background:H.activeBg, border:H.activeBdr,
                  borderRadius:999, padding:'5px 11px', display:'flex', alignItems:'center', gap:5,
                }}>
                  <div style={{width:7, height:7, borderRadius:'50%', background:'var(--pg-aqua-500)'}}/>
                  <span style={{fontSize:10.5, fontWeight:700, color:H.activeTxt, letterSpacing:'0.03em'}}>
                    {lang==='pt' ? 'ATIVO' : lang==='es' ? 'ACTIVO' : 'ACTIVE'}
                  </span>
                </div>
              )}
            </div>

            {/* Wave accent */}
            <div style={{position:'absolute', bottom:0, left:0, right:0, lineHeight:0, pointerEvents:'none', zIndex:0}}>
              <svg viewBox="0 0 402 20" width="100%" height="20" preserveAspectRatio="none">
                <path d="M0 14 Q80 5 160 14 Q240 23 320 14 Q368 8 402 16 L402 20 L0 20 Z" fill={H.wave1}/>
                <path d="M0 17 Q120 11 240 17 Q320 21 402 18 L402 20 L0 20 Z" fill={H.wave2}/>
              </svg>
            </div>
          </div>
        );
      }())}

      {/* ── Meus Anúncios card ── */}
      <div style={{padding:'0 18px', marginTop: window.innerWidth > 768 ? 18 : -18, position:'relative', zIndex:2}}>
        <div className="pg-card" style={{padding:'16px 16px 18px', position:'relative'}}>

          {/* Header row */}
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14}}>
            <div style={{display:'flex', alignItems:'center', gap:10}}>
              <div style={{
                width:34, height:34, borderRadius:10, background:'var(--pg-blue-100)',
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
              }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--pg-blue-700)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.6 11.4 13 3.7c-.4-.4-1-.7-1.6-.7H5C3.9 3 3 3.9 3 5v6.4c0 .6.2 1.2.7 1.6l7.7 7.7c.8.8 2 .8 2.8 0l6.4-6.4c.8-.8.8-2 0-2.9Z"/>
                  <circle cx="8" cy="8" r="1.5"/>
                </svg>
              </div>
              <div>
                <h3 style={{margin:0, fontFamily:'var(--pg-font-display)', fontSize:16, fontWeight:700, letterSpacing:'-0.01em'}}>{adsSectionTitle}</h3>
                <div style={{fontSize:11.5, color:'var(--pg-ink-500)', marginTop:1}}>
                  {myPosts.length === 0
                    ? (lang==='pt'?'Nenhum anúncio ativo ainda':lang==='es'?'Sin anuncios activos aún':'No active listings yet')
                    : (lang==='pt'?'Seus anúncios ativos':lang==='es'?'Tus anuncios activos':'Your active listings')}
                </div>
              </div>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              {myPosts.length > 0 && (
                <span className="pg-chip" style={{padding:'4px 10px', fontSize:11, background:'var(--pg-blue-50)', color:'var(--pg-blue-700)', borderColor:'transparent'}}>
                  {adsCountLbl}
                </span>
              )}
              <button onClick={()=>openMarketPost && openMarketPost()} style={{
                border:'none', background:'var(--pg-blue-500)', color:'#fff',
                width:30, height:30, borderRadius:'50%', cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 3px 8px rgba(0,119,182,0.35)',
                flexShrink:0,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
            </div>
          </div>

          {/* No posts state */}
          {myPosts.length === 0 && (
            <button onClick={()=>openMarketPost && openMarketPost()} style={{
              width:'100%', padding:'20px 16px', borderRadius:14, cursor:'pointer',
              border:'2px dashed var(--pg-ink-200)', background:'var(--pg-ink-50, #F7F9FB)',
              display:'flex', flexDirection:'column', alignItems:'center', gap:10,
              fontFamily:'inherit', transition:'all .15s',
            }}>
              <div style={{
                width:52, height:52, borderRadius:16,
                background:'linear-gradient(135deg, var(--pg-blue-100), var(--pg-blue-50))',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                {Icon.cart(24, 'var(--pg-blue-500)')}
              </div>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:14, fontWeight:700, color:'var(--pg-ink-800)', letterSpacing:'-0.01em'}}>
                  {lang==='pt'?'Criar primeiro anúncio':lang==='es'?'Crear primer anuncio':'Create your first listing'}
                </div>
                <div style={{fontSize:12, color:'var(--pg-ink-400)', marginTop:3}}>
                  {lang==='pt'?'Venda equipamentos, aluguéis ou rotas':lang==='es'?'Vende equipos, alquileres o rutas':'Sell equipment, rentals or routes'}
                </div>
              </div>
              <div style={{
                padding:'8px 20px', borderRadius:10, fontSize:13, fontWeight:700,
                background:'var(--pg-blue-500)', color:'#fff',
                boxShadow:'0 3px 10px rgba(0,119,182,0.30)',
              }}>
                {lang==='pt'?'Publicar agora →':lang==='es'?'Publicar ahora →':'Post now →'}
              </div>
            </button>
          )}

          {/* User posts list */}
          {myPosts.length > 0 && (
            <div style={{display:'flex', overflowX:'auto', gap:10, paddingBottom:2, scrollSnapType:'x mandatory', WebkitOverflowScrolling:'touch', msOverflowStyle:'none', scrollbarWidth:'none', touchAction:'pan-x'}}>
              {myPosts.map(item => {
                const isPending = item.status === 'pending';
                const isJob = item._isJob === true;
                const isQuick = item._isQuickPool === true;
                const priceStr = (item.priceMode === 'neg' || item.payMode === 'neg')
                  ? (lang==='pt'?'Negociável':lang==='es'?'Negociable':'Negotiable')
                  : item.asking
                    ? `$${Number(item.asking).toLocaleString()}`
                    : item.price
                      ? `$${item.price}${isJob?(item.payMode==='weekly'?'/sem':'/pool'):isQuick?'/pool':''}`
                      : '—';
                return (
                  <button key={item._id} onClick={()=>{
                    if (isQuick) { ctx.openQuickJobById ? ctx.openQuickJobById(item._id) : goTab('quick'); }
                    else if (isJob) { window.__pgOpenJobId = item._id; goTab('work'); }
                    else { openListingById ? openListingById(item._id) : goTab('market'); }
                  }} className="pg-press" style={{
                    display:'flex', flexDirection:'column', alignItems:'flex-start',
                    padding:'11px 11px 11px', borderRadius:14, flexShrink:0,
                    width:150,
                    scrollSnapAlign:'start',
                    touchAction:'pan-x',
                    border: isPending ? '1px solid var(--pg-ink-200)' : '1px solid var(--pg-blue-100)',
                    background: isPending ? 'var(--pg-ink-50, #F7F9FB)' : 'var(--pg-blue-50)',
                    cursor:'pointer', fontFamily:'inherit', textAlign:'left',
                  }}>
                    {/* Thumbnail */}
                    <div style={{
                      width:72, height:72, borderRadius:9, overflow:'hidden', flexShrink:0, marginBottom:9,
                    }}>
                      {isQuick ? (
                        <div style={{width:'100%', height:'100%', background:'linear-gradient(135deg,#0EBAC7,#0077B6)', display:'flex', alignItems:'center', justifyContent:'center'}}>
                          <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff"><path d="M13.5 2 4 14h6l-1.5 8L20 10h-6.5z"/></svg>
                        </div>
                      ) : item.photoUrl
                        ? <img src={item.photoUrl} alt={item.name} style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                        : <NoPhotoPlaceholder height={72} small/>
                      }
                    </div>
                    {/* Status + type badge */}
                    <div style={{display:'flex', alignItems:'center', gap:5, marginBottom:5, flexWrap:'wrap'}}>
                      <span style={{
                        fontSize:9.5, fontWeight:700, padding:'2px 7px', borderRadius:5,
                        letterSpacing:'0.04em',
                        background: isPending ? '#FFF3CD' : isQuick ? 'rgba(14,186,199,0.15)' : isJob ? 'rgba(14,186,199,0.15)' : 'var(--pg-blue-100)',
                        color: isPending ? '#856404' : isQuick ? '#0A7A88' : isJob ? '#0A7A88' : 'var(--pg-blue-700)',
                      }}>
                        {isPending ? (lang==='pt'?'REVISÃO':lang==='es'?'REVISIÓN':'REVIEW') : isQuick ? (lang==='pt'?'RÁPIDA':lang==='es'?'RÁPIDA':'QUICK') : isJob ? (lang==='pt'?'VAGA':lang==='es'?'OFERTA':'JOB') : 'ATIVO'}
                      </span>
                    </div>
                    {/* Name */}
                    <div style={{
                      fontSize:12.5, fontWeight:700, letterSpacing:'-0.01em', lineHeight:1.25,
                      color: isPending ? 'var(--pg-ink-600)' : 'var(--pg-ink-900)',
                      overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical',
                      marginBottom:5,
                    }}>{item.name || item.routeName || '—'}</div>
                    {/* Price */}
                    <div style={{
                      fontFamily:'var(--pg-font-display)', fontSize:17, fontWeight:700,
                      letterSpacing:'-0.02em', lineHeight:1,
                      color: isPending ? 'var(--pg-ink-400)' : 'var(--pg-blue-500)',
                      marginTop:'auto',
                    }}>{priceStr}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div style={{padding:'16px 18px 16px', display:'flex', flexDirection:'column', gap:18}}>

        {/* ── Premium banner ── */}
        {!isPremium && (
          <button onClick={openPaywall} className="pg-press" style={{
            textAlign:'left', border:'1px solid rgba(14,186,199,0.22)', cursor:'pointer',
            padding:0, borderRadius:22, overflow:'hidden', width:'100%',
            background:'linear-gradient(135deg, #040d1f 0%, #07193d 20%, #0e3070 40%, #1558b0 50%, #0e3070 65%, #07193d 82%, #040d1f 100%)',
            boxShadow:'0 10px 36px rgba(0,0,0,0.50), 0 0 0 1px rgba(14,186,199,0.12)',
            position:'relative',
          }}>
            {/* Aqua shimmer bar */}
            <div style={{
              height:2,
              background:'linear-gradient(90deg, transparent 0%, rgba(14,186,199,0.18) 20%, rgba(160,240,255,0.75) 50%, rgba(14,186,199,0.18) 80%, transparent 100%)',
            }}/>
            {/* Radial glow */}
            <div style={{
              position:'absolute', width:280, height:280, borderRadius:'50%',
              background:'radial-gradient(circle, rgba(14,186,199,0.14) 0%, transparent 60%)',
              top:-90, right:-60, pointerEvents:'none',
            }}/>
            <div style={{position:'relative', padding:'20px 20px 20px', display:'flex', gap:16, alignItems:'flex-start'}}>
              {/* Crown icon */}
              <div style={{
                width:54, height:54, borderRadius:16, flexShrink:0,
                background:'linear-gradient(135deg, rgba(14,186,199,0.22), rgba(0,119,182,0.14))',
                border:'1px solid rgba(14,186,199,0.38)',
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 4px 16px rgba(0,0,0,0.35)',
              }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="url(#aquaGrad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <defs>
                    <linearGradient id="aquaGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#A8EEFF"/>
                      <stop offset="50%" stopColor="#0EC8D8"/>
                      <stop offset="100%" stopColor="#0077B6"/>
                    </linearGradient>
                  </defs>
                  <path d="M2 20h20M5 20l2-8 5 4 5-4 2 8"/>
                  <circle cx="12" cy="8" r="2" fill="#0EC8D8" stroke="none"/>
                  <circle cx="4" cy="12" r="1.5" fill="#0EC8D8" stroke="none"/>
                  <circle cx="20" cy="12" r="1.5" fill="#0EC8D8" stroke="none"/>
                </svg>
              </div>

              <div style={{flex:1, minWidth:0}}>
                {/* Title */}
                <h3 style={{
                  margin:'0 0 6px', fontFamily:'var(--pg-font-display)', fontSize:21, fontWeight:800,
                  letterSpacing:'-0.02em', lineHeight:1.1,
                  background:'linear-gradient(135deg, #A8EEFF 0%, #5DDCF0 35%, #FFFFFF 52%, #5DDCF0 68%, #7EC8E3 100%)',
                  WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
                }}>
                  {premiumLbls.be}
                </h3>
                <p style={{margin:'0 0 13px', fontSize:12.5, color:'rgba(255,255,255,0.58)', lineHeight:1.45}}>
                  {premiumLbls.desc}
                </p>

                {/* Feature pills */}
                <div style={{display:'flex', gap:6, flexWrap:'wrap', marginBottom:16}}>
                  {(lang==='pt'
                    ? ['Anúncios ilimitados', 'Prioridade', 'Jobs exclusivos']
                    : lang==='es'
                      ? ['Anuncios ilimitados', 'Prioridad', 'Trabajos exclusivos']
                      : ['Unlimited listings', 'Priority', 'Exclusive jobs']
                  ).map(feat => (
                    <span key={feat} style={{
                      display:'inline-flex', alignItems:'center', gap:4,
                      fontSize:10.5, fontWeight:600, padding:'3px 9px', borderRadius:999,
                      background:'rgba(14,186,199,0.10)', border:'0.5px solid rgba(14,186,199,0.28)',
                      color:'rgba(255,255,255,0.82)',
                    }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#0EC8D8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      {feat}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <div style={{
                  display:'inline-flex', alignItems:'center', gap:7,
                  background:'linear-gradient(135deg, #004d8a, #006ab4, #009ec4, #006ab4, #004d8a)',
                  border:'1px solid rgba(14,186,199,0.45)',
                  color:'#B8F0FF', padding:'10px 22px', borderRadius:12,
                  fontSize:13, fontWeight:800, letterSpacing:'-0.01em',
                  boxShadow:'0 4px 16px rgba(0,0,0,0.38)',
                }}>
                  {premiumLbls.cta}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              </div>
            </div>
          </button>
        )}

        {/* Featured */}
        <section>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:10}}>
            <h3 style={{margin:0, fontFamily:'var(--pg-font-display)', fontSize:17, fontWeight:700, letterSpacing:'-0.015em'}}>
              {lang==='pt'?'Anúncios em Destaque':lang==='es'?'Anuncios Destacados':'Featured Listings'}
            </h3>
            <button onClick={()=>goTab('market')} style={{border:'none', background:'transparent', color:'var(--pg-blue-500)', fontSize:13, fontWeight:600, cursor:'pointer'}}>{t.seeAllOpps}</button>
          </div>
          <div className="pg-scroll-x" style={{display:'flex', gap:10, marginLeft:-18, marginRight:-18, padding:'2px 18px 8px'}}>
            {(featuredListings.length > 0 ? featuredListings.map(f => {
              // Real DB item
              const typeTag = f.type==='sell'?'SALE':f.type==='rent'?'RENT':f.type==='route'?'ROUTE':'NEW';
              const tagBg    = typeTag==='SALE'||typeTag==='RENT' ? '#EFF6FF' : typeTag==='ROUTE' ? '#F0FDF4' : '#F0FDF4';
              const tagColor = typeTag==='SALE'||typeTag==='RENT' ? '#1D4ED8' : '#16A34A';
              const tagLabel = typeTag==='SALE'  ? (lang==='pt'?'🏷 VENDA':'🏷 SALE')
                             : typeTag==='RENT'  ? (lang==='pt'?'🔑 ALUGUEL':'🔑 RENT')
                             : typeTag==='ROUTE' ? (lang==='pt'?'🗺 ROTA':'🗺 ROUTE')
                             : '⭐ DESTAQUE';
              const photos = (f.photo_urls&&f.photo_urls.length>0)?f.photo_urls:(f.photo_url?[f.photo_url]:[]);
              const priceStr = f.price_mode==='neg'?'🤝 Neg.':(f.price?'$'+f.price:'—');
              return (
                <div key={f.id} onClick={()=>openListingById(f.id)}
                  style={{
                    minWidth:170, maxWidth:170, flexShrink:0, cursor:'pointer',
                    borderRadius:16, overflow:'hidden', background:'var(--pg-white)',
                    boxShadow:'0 2px 8px rgba(0,0,0,0.08)', border:'1px solid var(--pg-ink-100)',
                    display:'flex', flexDirection:'column', transition:'transform .12s, box-shadow .12s',
                  }}
                  onMouseDown={e=>e.currentTarget.style.transform='scale(0.97)'}
                  onMouseUp={e=>e.currentTarget.style.transform=''}
                  onTouchStart={e=>e.currentTarget.style.transform='scale(0.97)'}
                  onTouchEnd={e=>e.currentTarget.style.transform=''}
                >
                  <div style={{position:'relative', paddingTop:'66%', background:'var(--pg-ink-200)', overflow:'hidden', flexShrink:0}}>
                    <div style={{position:'absolute', inset:0}}>
                      {photos.length > 0
                        ? <img src={photos[0]} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                        : <EquipImg category={f.cat||f.type} height={'100%'}/>
                      }
                    </div>
                    <div style={{position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 40%, rgba(0,0,0,0.25) 100%)', pointerEvents:'none'}}/>
                    <span style={{position:'absolute', bottom:8, right:8, fontSize:8.5, fontWeight:700, padding:'2px 7px', borderRadius:5, background:'rgba(0,0,0,0.55)', color:'#fff', letterSpacing:'0.07em', backdropFilter:'blur(3px)', textTransform:'uppercase'}}>
                      {f.cat||f.type||''}
                    </span>
                  </div>
                  <div style={{padding:'10px 11px 12px', display:'flex', flexDirection:'column', flex:1}}>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:4, marginBottom:6}}>
                      <span style={{fontSize:9, fontWeight:800, padding:'3px 7px', borderRadius:5, background:tagBg, color:tagColor, letterSpacing:'0.04em', flexShrink:0, whiteSpace:'nowrap'}}>{tagLabel}</span>
                      <span style={{fontFamily:'var(--pg-font-display)', fontSize:13, fontWeight:800, color:'var(--pg-blue-500)', letterSpacing:'-0.01em', flexShrink:0, whiteSpace:'nowrap'}}>{priceStr}</span>
                    </div>
                    <div style={{fontSize:13, fontWeight:700, lineHeight:1.3, letterSpacing:'-0.01em', color:'var(--pg-ink-900)', flex:1, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'}}>{f.name||f.route_name||'—'}</div>
                    <div style={{fontSize:11, color:'var(--pg-ink-500)', marginTop:5, lineHeight:1.3, display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical', overflow:'hidden'}}>{f.loc||f.area||f.description||''}</div>
                  </div>
                </div>
              );
            }) : FEATURED.map(f => {
              // Fallback static data (shown while no featured items are configured)
              const isUrgent  = f.tag === 'URGENT';
              const isHiring  = f.tag === 'HIRING';
              const isSale    = f.tag === 'SALE';
              const isRent    = f.tag === 'RENT';
              const tagBg    = isUrgent ? '#FEE2E2' : isHiring ? '#ECFDF5' : isSale || isRent ? '#EFF6FF' : '#F0FDF4';
              const tagColor = isUrgent ? '#DC2626' : isHiring ? '#059669' : isSale || isRent ? '#1D4ED8' : '#16A34A';
              const tagLabel = isUrgent ? (lang==='pt'?'🔥 URGENTE':lang==='es'?'🔥 URGENTE':'🔥 URGENT')
                             : isHiring ? (lang==='pt'?'✦ CONTRATANDO':lang==='es'?'✦ CONTRATANDO':'✦ HIRING')
                             : isSale   ? (lang==='pt'?'🏷 VENDA':lang==='es'?'🏷 VENTA':'🏷 SALE')
                             : isRent   ? (lang==='pt'?'🔑 ALUGUEL':lang==='es'?'🔑 ALQUILER':'🔑 RENT')
                             : '✦ NEW';
              return (
                <div key={f.id} onClick={()=>setSelectedFeatured(f)}
                  style={{minWidth:170, maxWidth:170, flexShrink:0, cursor:'pointer', borderRadius:16, overflow:'hidden', background:'var(--pg-white)', boxShadow:'0 2px 8px rgba(0,0,0,0.08)', border:'1px solid var(--pg-ink-100)', display:'flex', flexDirection:'column', transition:'transform .12s, box-shadow .12s'}}
                  onMouseDown={e=>e.currentTarget.style.transform='scale(0.97)'} onMouseUp={e=>e.currentTarget.style.transform=''} onTouchStart={e=>e.currentTarget.style.transform='scale(0.97)'} onTouchEnd={e=>e.currentTarget.style.transform=''}>
                  <div style={{position:'relative', paddingTop:'66%', background:'var(--pg-ink-200)', overflow:'hidden', flexShrink:0}}>
                    <div style={{position:'absolute', inset:0}}><EquipImg category={f.category} height={'100%'}/></div>
                    <div style={{position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 40%, rgba(0,0,0,0.25) 100%)', pointerEvents:'none'}}/>
                    <span style={{position:'absolute', bottom:8, right:8, fontSize:8.5, fontWeight:700, padding:'2px 7px', borderRadius:5, background:'rgba(0,0,0,0.55)', color:'#fff', letterSpacing:'0.07em', backdropFilter:'blur(3px)', textTransform:'uppercase'}}>{catLabel(f.category)}</span>
                  </div>
                  <div style={{padding:'10px 11px 12px', display:'flex', flexDirection:'column', flex:1}}>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:4, marginBottom:6}}>
                      <span style={{fontSize:9, fontWeight:800, padding:'3px 7px', borderRadius:5, background:tagBg, color:tagColor, letterSpacing:'0.04em', flexShrink:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:90}}>{tagLabel}</span>
                      <span style={{fontFamily:'var(--pg-font-display)', fontSize:13, fontWeight:800, color:'var(--pg-blue-500)', letterSpacing:'-0.01em', flexShrink:0, whiteSpace:'nowrap'}}>{tr(f.price, lang)}</span>
                    </div>
                    <div style={{fontSize:13, fontWeight:700, lineHeight:1.3, letterSpacing:'-0.01em', color:'var(--pg-ink-900)', flex:1, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'}}>{tr(f.title, lang)}</div>
                    <div style={{fontSize:11, color:'var(--pg-ink-500)', marginTop:5, lineHeight:1.3, display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical', overflow:'hidden'}}>{tr(f.sub, lang)}</div>
                  </div>
                </div>
              );
            }))}
          </div>
        </section>

        {/* Sponsored card */}
        {sponsoredCard && (
          <div onClick={() => { if (sponsoredCard.link_url) window.open(sponsoredCard.link_url, '_blank'); }}
            style={{
              background: sponsoredCard.bg_color || '#001f4d',
              borderRadius: 14,
              padding: '13px 15px',
              display: 'flex', alignItems: 'center', gap: 12,
              border: '1px solid rgba(0,119,182,0.35)',
              cursor: sponsoredCard.link_url ? 'pointer' : 'default',
              boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
              transition: 'opacity .15s',
            }}
            onTouchStart={e => { if (sponsoredCard.link_url) e.currentTarget.style.opacity = '0.82'; }}
            onTouchEnd={e => { e.currentTarget.style.opacity = '1'; }}>
            {(sponsoredCard.logo_url || sponsoredCard.logo_text) && (
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3,flexShrink:0}}>
                {sponsoredCard.logo_url && (
                  <img src={sponsoredCard.logo_url} alt={sponsoredCard.company_name}
                    style={{width:44, height:44, objectFit:'contain', borderRadius:9}}/>
                )}
                {sponsoredCard.logo_text && (
                  <div style={{
                    background: '#fff', borderRadius: 5, padding: '2px 8px',
                    fontWeight: 900, fontSize: 10, color: sponsoredCard.bg_color || '#003d7a',
                    whiteSpace: 'nowrap', letterSpacing: '0.02em',
                  }}>{sponsoredCard.logo_text}</div>
                )}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.38)', marginBottom: 2, fontWeight: 700, letterSpacing: '0.07em' }}>
                {lang === 'pt' ? 'PATROCINADO' : lang === 'es' ? 'PATROCINADO' : 'SPONSORED'}
              </div>
              <div style={{ fontSize: 13, color: '#fff', fontWeight: 700, lineHeight: 1.3 }}>{sponsoredCard.headline}</div>
              {sponsoredCard.subtext && (
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 3, lineHeight: 1.3 }}>{sponsoredCard.subtext}</div>
              )}
            </div>
            {sponsoredCard.link_url && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            )}
          </div>
        )}

        {/* Today's pool jobs */}
        <section>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:8}}>
            <div style={{minWidth:0}}>
              <div style={{display:'flex', alignItems:'center', gap:7}}>
                <h3 style={{margin:0, fontFamily:'var(--pg-font-display)', fontSize:17, fontWeight:700, letterSpacing:'-0.015em'}}>{t.todayJobs}</h3>
                {!isPremium && (
                  <span style={{
                    display:'inline-flex', alignItems:'center', gap:3,
                    padding:'2px 7px', borderRadius:6, fontSize:9.5, fontWeight:700,
                    background:'linear-gradient(110deg, var(--pg-aqua-500), var(--pg-blue-500))',
                    color:'#fff', letterSpacing:'0.05em',
                  }}>{Icon.crown(10, '#fff')} PREMIUM</span>
                )}
              </div>
              <div style={{fontSize:11, color:'var(--pg-ink-500)', marginTop:1}}>
                {isPremium
                  ? t.todayJobsSub
                  : (lang==='pt'
                    ? 'Apenas usuários Premium podem aplicar'
                    : lang==='es'
                      ? 'Solo usuarios Premium pueden postular'
                      : 'Only Premium users can apply')}
              </div>
            </div>
            {isPremium ? (
              <button onClick={()=>goTab('quick')} style={{border:'none', background:'transparent', color:'var(--pg-blue-500)', fontSize:13, fontWeight:600, cursor:'pointer'}}>
                {t.seeAllOpps}
              </button>
            ) : null}
          </div>

          {!isPremium && (
            <button onClick={openPaywall} style={{
              width:'100%', textAlign:'left', border:'0.5px solid var(--pg-aqua-400)',
              cursor:'pointer', padding:'10px 12px', marginBottom:8, borderRadius:11,
              background:'linear-gradient(110deg, oklch(0.97 0.04 178), oklch(0.97 0.04 235))',
              display:'flex', alignItems:'center', gap:10, fontFamily:'inherit',
            }}>
              <div style={{
                width:32, height:32, borderRadius:'50%', flexShrink:0,
                background:'linear-gradient(150deg, var(--pg-aqua-500), var(--pg-blue-500))',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>{Icon.crown(16, '#fff')}</div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:12.5, fontWeight:700, color:'var(--pg-blue-700)', letterSpacing:'-0.005em'}}>
                  {lang==='pt'
                    ? 'Assine Premium para aplicar e contactar'
                    : lang==='es'
                      ? 'Suscríbete Premium para postular y contactar'
                      : 'Subscribe to Premium to apply & contact'}
                </div>
                <div style={{fontSize:10.5, color:'var(--pg-ink-500)', marginTop:1, lineHeight:1.3}}>
                  {lang==='pt'
                    ? 'Você vê os trabalhos, mas não pode aplicar nem falar com o anunciante'
                    : lang==='es'
                      ? 'Ves los trabajos, pero no puedes postular ni contactar al anunciante'
                      : 'You can see jobs, but not apply or contact the poster'}
                </div>
              </div>
              {Icon.chev(14, 'var(--pg-blue-700)')}
            </button>
          )}

          <div style={{display:'flex', flexDirection:'column', gap:8}}>
            {todayItems.length === 0 ? (
              <div style={{
                textAlign:'center', padding:'24px 16px',
                color:'var(--pg-ink-400)', fontSize:13,
              }}>
                <div style={{fontSize:28, marginBottom:8}}>🏊</div>
                {lang==='pt'
                  ? 'Nenhuma piscina disponível para hoje'
                  : lang==='es'
                    ? 'No hay piscinas disponibles para hoy'
                    : 'No pools available for today'}
              </div>
            ) : todayItems.map(j => (
              <button key={j.id}
                onClick={() => {
                  if (!isPremium) { openPaywall(); return; }
                  if (j._type === 'quick') {
                    ctx.openQuickJobById ? ctx.openQuickJobById(j.id) : goTab('quick');
                  } else {
                    j._vacRef && ctx.openDayPicker ? ctx.openDayPicker(j._vacRef) : goTab('work');
                  }
                }}
                className="pg-card pg-card-tap" style={{
                  padding:'12px 14px', border:'none', cursor:'pointer', textAlign:'left',
                  display:'flex', alignItems:'center', gap:12, background:'var(--pg-white)',
                  position:'relative', opacity: isPremium ? 1 : 0.92,
                }}>
                <div style={{
                  width:44, height:44, borderRadius:12, flexShrink:0, position:'relative',
                  background: !isPremium
                    ? 'var(--pg-ink-100)'
                    : j._type==='vacation' ? 'oklch(0.95 0.05 25)' : 'var(--pg-aqua-100)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  {!isPremium
                    ? Icon.lock(18, 'var(--pg-ink-500)')
                    : j._type==='vacation'
                      ? <span style={{fontSize:20}}>🌴</span>
                      : Icon.bolt(20, 'var(--pg-aqua-700)')}
                </div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:13.5, fontWeight:600, letterSpacing:'-0.01em', lineHeight:1.25,
                    display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical', overflow:'hidden',
                    color: isPremium ? 'var(--pg-ink-900)' : 'var(--pg-ink-700)'}}>{tr(j.title, lang)}</div>
                  <div style={{fontSize:11.5, color:'var(--pg-ink-500)', marginTop:3, display:'flex', alignItems:'center', gap:4, flexWrap:'wrap'}}>
                    {Icon.pin(11, 'var(--pg-ink-500)')} {j.loc}
                    {j.pools ? <><span style={{color:'var(--pg-ink-300)'}}>·</span> {j.pools} {lang==='pt'?'piscinas':lang==='es'?'piscinas':'pools'}</> : null}
                    <span style={{color:'var(--pg-ink-300)'}}>·</span>
                    {Icon.clock(11, 'var(--pg-ink-500)')} {tr(j.when, lang)}
                  </div>
                </div>
                <div style={{textAlign:'right', flexShrink:0}}>
                  {!isPremium ? (
                    <div style={{
                      fontSize:10, fontWeight:700, color:'var(--pg-blue-700)',
                      background:'var(--pg-blue-100)', padding:'4px 8px', borderRadius:7,
                      letterSpacing:'0.03em',
                    }}>Premium</div>
                  ) : j.price === 'neg' ? (
                    <div style={{fontSize:12, fontWeight:700, color:'var(--pg-ink-700)'}}>{t.negotiable}</div>
                  ) : j.price ? (
                    <>
                      <div style={{fontFamily:'var(--pg-font-display)', fontSize:18, fontWeight:700, color:'var(--pg-blue-500)', letterSpacing:'-0.02em', lineHeight:1}}>${j.price}</div>
                      <div style={{fontSize:9.5, color:'var(--pg-ink-500)', marginTop:2}}>{t.perPool}</div>
                    </>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

    </div>{/* end .pg-screen */}

      {/* ── Featured listing detail sheet ── */}
      <Sheet open={!!selectedFeatured} onClose={()=>setSelectedFeatured(null)} height="auto">
        {selectedFeatured && (() => {
          const f = selectedFeatured;
          const tagColor = f.tag==='URGENT' ? 'pg-badge-urgent' : f.tag==='HIRING' ? 'pg-badge-new' : 'pg-badge-applied';
          const isRoute = f.category === 'Routes';
          return (
            <div style={{padding:'0 0 36px'}}>
              <div style={{position:'relative'}}>
                <EquipImg category={f.category} height={180}/>
                <div style={{position:'absolute', top:12, left:16}}>
                  <span className={`pg-badge ${tagColor}`}>{f.tag==='URGENT' ? t.urgent : f.tag}</span>
                </div>
              </div>
              <div style={{padding:'16px 20px 0'}}>
                <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:12}}>
                  <div>
                    <h2 style={{margin:'0 0 4px', fontFamily:'var(--pg-font-display)', fontSize:19, fontWeight:700, letterSpacing:'-0.02em', lineHeight:1.2}}>
                      {tr(f.title, lang)}
                    </h2>
                    <p style={{margin:0, fontSize:13.5, color:'var(--pg-ink-600)', lineHeight:1.4}}>{tr(f.sub, lang)}</p>
                  </div>
                  <div style={{textAlign:'right', flexShrink:0}}>
                    <div style={{fontFamily:'var(--pg-font-display)', fontSize:24, fontWeight:800, color:'var(--pg-blue-500)', letterSpacing:'-0.02em', lineHeight:1}}>
                      {tr(f.price, lang)}
                    </div>
                    {isRoute && <div style={{fontSize:10.5, color:'var(--pg-ink-400)', marginTop:2}}>
                      {lang==='pt'?'preço pedido':lang==='es'?'precio pedido':'asking price'}
                    </div>}
                  </div>
                </div>
                <div style={{display:'flex', gap:10, flexWrap:'wrap', marginBottom:16}}>
                  {f.loc && <span style={{display:'flex', alignItems:'center', gap:4, fontSize:12, color:'var(--pg-ink-600)'}}>
                    {Icon.pin(11,'var(--pg-ink-400)')} {f.loc}
                  </span>}
                  {f.pools && <span style={{display:'flex', alignItems:'center', gap:4, fontSize:12, color:'var(--pg-ink-600)'}}>
                    🏊 {f.pools} {lang==='pt'?'piscinas':lang==='es'?'piscinas':'pools'}
                  </span>}
                  {f.type && <span className="pg-chip" style={{fontSize:11, padding:'3px 9px'}}>{f.type}</span>}
                </div>
                <div className="pg-divider" style={{margin:'0 0 16px'}}/>
                <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:16}}>
                  <button onClick={()=>openPublicProfile && openPublicProfile({ uid:f.author_id||undefined, name:f.seller||f.author||'Verified Seller', loc:'South Florida' })}
                    style={{display:'flex', alignItems:'center', gap:10, flex:1, minWidth:0, background:'none', border:'none', cursor:'pointer', padding:0, fontFamily:'inherit', textAlign:'left'}} className="pg-press">
                    <Avatar name={f.seller || 'Seller'} size={38}/>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontSize:13.5, fontWeight:700, color:'var(--pg-ink-900)'}}>{f.seller || 'Verified Seller'}</div>
                      <div style={{fontSize:11.5, color:'var(--pg-ink-500)'}}>
                        {lang==='pt'?'Vendedor verificado ✓':lang==='es'?'Vendedor verificado ✓':'Verified seller ✓'}
                      </div>
                    </div>
                  </button>
                  <button onClick={()=>{ctx.openChat && ctx.openChat(f.seller || 'Seller'); setSelectedFeatured(null);}}
                    className="pg-btn pg-btn-ghost" style={{height:36, padding:'0 14px', fontSize:12.5, borderRadius:999, flexShrink:0}}>
                    {Icon.msg(13,'var(--pg-blue-700)')}
                    <span style={{marginLeft:5}}>{lang==='pt'?'Mensagem':lang==='es'?'Mensaje':'Message'}</span>
                  </button>
                </div>
                <button onClick={()=>{ setSelectedFeatured(null); goTab('market'); }}
                  className="pg-btn pg-btn-primary" style={{width:'100%', height:50, fontSize:15, borderRadius:14}}>
                  {lang==='pt'?'Ver anúncio completo →':lang==='es'?'Ver anuncio completo →':'View full listing →'}
                </button>
              </div>
            </div>
          );
        })()}
      </Sheet>

      {/* ── Today's pool job detail sheet ── */}
      <Sheet open={!!selectedJob} onClose={()=>setSelectedJob(null)} height="auto">
        {selectedJob && (() => {
          const j = selectedJob;
          const isUrgent = j.urgency === 'urgent';
          return (
            <div style={{padding:'0 0 36px'}}>
              <div style={{
                padding:'24px 20px 20px',
                background: isUrgent
                  ? 'linear-gradient(135deg, oklch(0.30 0.20 25), oklch(0.50 0.22 25))'
                  : 'linear-gradient(135deg, var(--pg-blue-900), var(--pg-blue-500))',
                color:'#fff',
              }}>
                <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
                  <span style={{
                    padding:'3px 9px', borderRadius:999, fontSize:10.5, fontWeight:700,
                    background: isUrgent ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.15)',
                    border:'0.5px solid rgba(255,255,255,0.30)', letterSpacing:'0.05em',
                  }}>{isUrgent ? (lang==='pt'?'🔥 URGENTE':lang==='es'?'🔥 URGENTE':'🔥 URGENT') : '⚡ QUICK JOB'}</span>
                </div>
                <h2 style={{margin:'0 0 6px', fontFamily:'var(--pg-font-display)', fontSize:20, fontWeight:700, letterSpacing:'-0.02em', lineHeight:1.2}}>
                  {tr(j.title, lang)}
                </h2>
                <div style={{display:'flex', alignItems:'center', gap:6, fontSize:12, opacity:0.80}}>
                  {Icon.pin(11,'rgba(255,255,255,0.8)')} {j.loc}
                  <span style={{opacity:0.5}}>·</span>
                  {Icon.clock(11,'rgba(255,255,255,0.8)')} {tr(j.when, lang)}
                  <span style={{opacity:0.5}}>·</span>
                  {tr(j.dist, lang)}
                </div>
              </div>
              <div style={{padding:'16px 20px 0'}}>
                <div style={{display:'flex', gap:10, marginBottom:16}}>
                  <div className="pg-card" style={{flex:1, padding:'10px 12px', textAlign:'center'}}>
                    <div style={{fontFamily:'var(--pg-font-display)', fontSize:22, fontWeight:700, color:'var(--pg-blue-500)'}}>
                      {j.price === 'neg' ? t.negotiable : `$${j.price}`}
                    </div>
                    <div style={{fontSize:10.5, color:'var(--pg-ink-500)', marginTop:2}}>{t.perPool}</div>
                  </div>
                  {j.pools && <div className="pg-card" style={{flex:1, padding:'10px 12px', textAlign:'center'}}>
                    <div style={{fontFamily:'var(--pg-font-display)', fontSize:22, fontWeight:700, color:'var(--pg-ink-900)'}}>{j.pools}</div>
                    <div style={{fontSize:10.5, color:'var(--pg-ink-500)', marginTop:2}}>{lang==='pt'?'piscinas':lang==='es'?'piscinas':'pools'}</div>
                  </div>}
                  {j.type && <div className="pg-card" style={{flex:1, padding:'10px 12px', textAlign:'center'}}>
                    <div style={{fontSize:13, fontWeight:700, color:'var(--pg-ink-800)', lineHeight:1.2}}>{j.type}</div>
                    <div style={{fontSize:10.5, color:'var(--pg-ink-500)', marginTop:2}}>{lang==='pt'?'tipo':lang==='es'?'tipo':'type'}</div>
                  </div>}
                </div>
                <div style={{display:'flex', gap:10}}>
                  <button onClick={()=>{ ctx.openChat && ctx.openChat('Pool Owner'); setSelectedJob(null); }}
                    className="pg-btn pg-btn-ghost" style={{height:50, padding:'0 18px', fontSize:13.5, borderRadius:14}}>
                    {Icon.msg(14,'var(--pg-blue-700)')}
                  </button>
                  <button onClick={()=>{ setSelectedJob(null); goTab('quick'); }}
                    className="pg-btn pg-btn-primary" style={{flex:1, height:50, fontSize:14, borderRadius:14}}>
                    {lang==='pt'?'Aplicar para este job':lang==='es'?'Postular a este trabajo':'Apply for this job'}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </Sheet>
    </div>
  );
}

Object.assign(window, { HomeScreen });
