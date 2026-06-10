// home.jsx — navy header + Meus Anúncios hero + sections

function HomeScreen({ ctx }) {
  const { user, lang, setLang, openNotifications, openPaywall, openPostMenu, goTab, openWallet, openPublicProfile, liveMarket=[], liveJobs=[], hasUnreadChat, hasUnreadNotif, openListingById, openMarketPost, darkMode=false, isDesktop=false } = ctx;
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

  const myPosts = [...myMarketPosts, ...myOwnJobs];

  const [selectedFeatured, setSelectedFeatured] = React.useState(null);
  const [selectedJob,      setSelectedJob]      = React.useState(null);

  const hour = new Date().getHours();
  const greetWord = hour < 12
    ? (lang==='pt'?'Bom dia':lang==='es'?'Buenos días':'Good morning')
    : hour < 18
      ? (lang==='pt'?'Boa tarde':lang==='es'?'Buenas tardes':'Good afternoon')
      : (lang==='pt'?'Boa noite':lang==='es'?'Buenas noches':'Good evening');

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
                    {Icon.pin(10, darkMode ? 'var(--pg-aqua-400)' : '#0077B6')}
                    <span style={{fontSize:11.5, color:H.faint, fontWeight:500}}>Broward County, FL</span>
                    <span style={{color:H.faint, fontSize:11, margin:'0 3px'}}>·</span>
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
          <div style={{background:_bg, position:'relative', overflow:'hidden'}}>
            {/* Decorative circles */}
            <div style={{position:'absolute', top:-60, right:-60, width:200, height:200, borderRadius:'50%', background:H.glow, pointerEvents:'none'}}/>
            <div style={{position:'absolute', top:-55, right:-55, width:190, height:190, borderRadius:'50%', border:`1px solid ${H.ring1}`, pointerEvents:'none'}}/>

            {/* Top row: logo + buttons */}
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0px 18px 0', position:'relative', zIndex:1, marginTop:-18}}>
              <div style={{height:118, overflow:'hidden', marginTop:-10}}>
                <Wordmark size="nav" onDark={darkMode}/>
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
            <div style={{padding:'0px 18px 8px', marginTop:-28, display:'flex', alignItems:'center', justifyContent:'space-between', position:'relative', zIndex:1}}>
              <div>
                <div style={{fontSize:13, fontWeight:600, color:H.mid, letterSpacing:'-0.01em'}}>
                  {greetWord}, {firstName}! 👋
                </div>
                <div style={{display:'flex', alignItems:'center', gap:5, marginTop:2}}>
                  {Icon.pin(10,'var(--pg-aqua-400)')}
                  <span style={{fontSize:11, color:H.faint, fontWeight:500}}>Broward County, FL</span>
                </div>
              </div>
              <div style={{
                background:H.activeBg, border:H.activeBdr,
                borderRadius:999, padding:'5px 11px', display:'flex', alignItems:'center', gap:5,
              }}>
                <div style={{width:7, height:7, borderRadius:'50%', background:'var(--pg-aqua-500)'}}/>
                <span style={{fontSize:10.5, fontWeight:700, color:H.activeTxt, letterSpacing:'0.03em'}}>ACTIVE</span>
              </div>
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
            <div style={{display:'flex', flexDirection:'column', gap:10}}>
              {myPosts.slice(0, 4).map(item => {
                const isPending = item.status === 'pending';
                const isJob = item._isJob === true;
                const priceStr = (item.priceMode === 'neg' || item.payMode === 'neg')
                  ? (lang==='pt'?'Negociável':lang==='es'?'Negociable':'Negotiable')
                  : item.asking
                    ? `$${Number(item.asking).toLocaleString()}`
                    : item.price
                      ? `$${item.price}${isJob?(item.payMode==='weekly'?'/sem':'/pool'):''}`
                      : '—';
                return (
                  <button key={item._id} onClick={()=>isJob ? goTab('work') : openListingById ? openListingById(item._id) : goTab('market')} className="pg-press" style={{
                    display:'flex', alignItems:'center', gap:12,
                    padding:'10px 12px', borderRadius:14,
                    border: isPending ? '1px solid var(--pg-ink-200)' : '1px solid var(--pg-blue-100)',
                    background: isPending ? 'var(--pg-ink-50, #F7F9FB)' : 'var(--pg-blue-50)',
                    cursor:'pointer', fontFamily:'inherit', textAlign:'left',
                  }}>
                    {/* Square thumbnail */}
                    <div style={{
                      width:58, height:58, borderRadius:12, overflow:'hidden', flexShrink:0,
                      background:'linear-gradient(135deg, var(--pg-blue-100), var(--pg-ink-100))',
                    }}>
                      {item.photoUrl
                        ? <img src={item.photoUrl} alt={item.name} style={{width:58, height:58, objectFit:'cover', borderRadius:12}}/>
                        : <EquipImg category={item.cat || (item.type==='route'?'Routes':'Tools')} height={58}/>
                      }
                    </div>
                    {/* Info */}
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{display:'flex', alignItems:'center', gap:7, marginBottom:2}}>
                        <span style={{
                          fontSize:9.5, fontWeight:700, padding:'2px 7px', borderRadius:5,
                          letterSpacing:'0.04em',
                          background: isPending ? '#FFF3CD' : 'var(--pg-blue-100)',
                          color: isPending ? '#856404' : 'var(--pg-blue-700)',
                        }}>
                          {isPending ? (lang==='pt'?'⏳ REVISÃO':lang==='es'?'⏳ REVISIÓN':'⏳ REVIEW') : '✓ ATIVO'}
                        </span>
                        <span style={{fontSize:10.5, color:'var(--pg-ink-400)', fontWeight:500}}>{typeLabel(item)}</span>
                      </div>
                      <div style={{
                        fontSize:13.5, fontWeight:700, letterSpacing:'-0.01em', lineHeight:1.25,
                        color: isPending ? 'var(--pg-ink-600)' : 'var(--pg-ink-900)',
                        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:180,
                      }}>{item.name || item.routeName || '—'}</div>
                      <div style={{fontSize:11.5, color:'var(--pg-ink-400)', marginTop:2}}>{item.loc || item.area || ''}</div>
                    </div>
                    {/* Price */}
                    <div style={{textAlign:'right', flexShrink:0}}>
                      <div style={{
                        fontFamily:'var(--pg-font-display)', fontSize:17, fontWeight:700,
                        letterSpacing:'-0.02em', lineHeight:1,
                        color: isPending ? 'var(--pg-ink-400)' : 'var(--pg-blue-500)',
                      }}>{priceStr}</div>
                      {item.type==='rent' && (
                        <div style={{fontSize:9.5, color:'var(--pg-ink-400)', marginTop:2}}>/dia</div>
                      )}
                      {Icon.chev(13, 'var(--pg-ink-300)')}
                    </div>
                  </button>
                );
              })}
              {myPosts.length > 4 && (
                <button onClick={()=>goTab('market')} style={{
                  width:'100%', padding:'10px', borderRadius:10, border:'none',
                  background:'var(--pg-ink-100)', color:'var(--pg-blue-600)', fontWeight:700,
                  fontSize:13, cursor:'pointer', fontFamily:'inherit',
                }}>
                  {lang==='pt'?`Ver todos os ${myPosts.length} anúncios →`:lang==='es'?`Ver los ${myPosts.length} anuncios →`:`View all ${myPosts.length} listings →`}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{padding:'16px 18px 16px', display:'flex', flexDirection:'column', gap:18}}>

        {/* ── Premium banner — redesigned ── */}
        {!isPremium && (
          <button onClick={openPaywall} className="pg-press" style={{
            textAlign:'left', border:'none', cursor:'pointer',
            padding:0, borderRadius:20, overflow:'hidden',
            background:'linear-gradient(135deg, #011B5A 0%, #023EBA 50%, #0077B6 100%)',
            boxShadow:'0 8px 32px rgba(0,30,100,0.35), 0 2px 8px rgba(0,0,0,0.15)',
            position:'relative',
          }}>
            {/* Decorative glow orbs */}
            <div style={{
              position:'absolute', width:140, height:140, borderRadius:'50%',
              background:'radial-gradient(circle, rgba(0,200,255,0.18) 0%, transparent 70%)',
              top:-40, right:-20, pointerEvents:'none',
            }}/>
            <div style={{
              position:'absolute', width:100, height:100, borderRadius:'50%',
              background:'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
              bottom:-20, left:60, pointerEvents:'none',
            }}/>
            {/* Subtle grid pattern */}
            <div style={{
              position:'absolute', inset:0, opacity:0.04,
              backgroundImage:'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
              backgroundSize:'32px 32px',
              pointerEvents:'none',
            }}/>

            <div style={{position:'relative', padding:'20px 20px 18px', display:'flex', gap:16, alignItems:'flex-start'}}>
              {/* Crown */}
              <div style={{
                width:54, height:54, borderRadius:16, flexShrink:0,
                background:'linear-gradient(135deg, rgba(255,215,0,0.20), rgba(255,180,0,0.10))',
                border:'1px solid rgba(255,215,0,0.30)',
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 4px 12px rgba(0,0,0,0.20)',
              }}>
                <span style={{fontSize:28}}>👑</span>
              </div>

              <div style={{flex:1, minWidth:0}}>
                {/* Tag */}
                <div style={{
                  display:'inline-flex', alignItems:'center', gap:5, marginBottom:8,
                  background:'linear-gradient(135deg, rgba(255,215,0,0.22), rgba(255,180,0,0.12))',
                  border:'1px solid rgba(255,215,0,0.35)',
                  borderRadius:999, padding:'3px 10px',
                }}>
                  <div style={{width:5, height:5, borderRadius:'50%', background:'#FFD700'}}/>
                  <span style={{fontSize:10, fontWeight:800, color:'#FFD700', letterSpacing:'0.08em'}}>{premiumLbls.tag.toUpperCase()}</span>
                </div>

                <h3 style={{margin:'0 0 6px', fontFamily:'var(--pg-font-display)', fontSize:22, fontWeight:800, color:'#fff', letterSpacing:'-0.02em', lineHeight:1.1}}>
                  {premiumLbls.be}
                </h3>
                <p style={{margin:'0 0 14px', fontSize:13, color:'rgba(255,255,255,0.78)', lineHeight:1.5}}>
                  {premiumLbls.desc}
                </p>

                {/* Feature pills */}
                <div style={{display:'flex', gap:7, flexWrap:'wrap', marginBottom:16}}>
                  {(lang==='pt'
                    ? ['✓ Anúncios ilimitados', '✓ Prioridade', '✓ Jobs exclusivos']
                    : lang==='es'
                      ? ['✓ Anuncios ilimitados', '✓ Prioridad', '✓ Trabajos exclusivos']
                      : ['✓ Unlimited listings', '✓ Priority', '✓ Exclusive jobs']
                  ).map(feat => (
                    <span key={feat} style={{
                      fontSize:11, fontWeight:600, padding:'4px 10px', borderRadius:999,
                      background:'rgba(255,255,255,0.10)', border:'0.5px solid rgba(255,255,255,0.20)',
                      color:'rgba(255,255,255,0.88)',
                    }}>{feat}</span>
                  ))}
                </div>

                {/* CTA button */}
                <div style={{
                  display:'inline-flex', alignItems:'center', gap:8,
                  background:'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                  color:'#011B5A', padding:'11px 22px', borderRadius:12,
                  fontSize:14, fontWeight:800, letterSpacing:'-0.01em',
                  boxShadow:'0 4px 16px rgba(255,180,0,0.40)',
                }}>
                  {premiumLbls.cta}
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
            {FEATURED.map(f => {
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
                  style={{
                    minWidth:170, maxWidth:170, flexShrink:0, cursor:'pointer',
                    borderRadius:16, overflow:'hidden', background:'var(--pg-white)',
                    boxShadow:'0 2px 8px rgba(0,0,0,0.08)', border:'1px solid var(--pg-ink-100)',
                    display:'flex', flexDirection:'column',
                    transition:'transform .12s, box-shadow .12s',
                  }}
                  onMouseDown={e=>e.currentTarget.style.transform='scale(0.97)'}
                  onMouseUp={e=>e.currentTarget.style.transform=''}
                  onTouchStart={e=>e.currentTarget.style.transform='scale(0.97)'}
                  onTouchEnd={e=>e.currentTarget.style.transform=''}
                >
                  {/* Image — 3:2 aspect ratio */}
                  <div style={{position:'relative', paddingTop:'66%', background:'var(--pg-ink-200)', overflow:'hidden', flexShrink:0}}>
                    <div style={{position:'absolute', inset:0}}>
                      <EquipImg category={f.category} height={'100%'}/>
                    </div>
                    {/* Dark gradient overlay */}
                    <div style={{position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 40%, rgba(0,0,0,0.25) 100%)', pointerEvents:'none'}}/>
                    {/* Category label bottom-right */}
                    <span style={{
                      position:'absolute', bottom:8, right:8,
                      fontSize:8.5, fontWeight:700, padding:'2px 7px', borderRadius:5,
                      background:'rgba(0,0,0,0.55)', color:'#fff',
                      letterSpacing:'0.07em', backdropFilter:'blur(3px)', textTransform:'uppercase',
                    }}>{f.category}</span>
                  </div>

                  {/* Content */}
                  <div style={{padding:'10px 11px 12px', display:'flex', flexDirection:'column', flex:1}}>
                    {/* Tag + Price */}
                    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:4, marginBottom:6}}>
                      <span style={{
                        fontSize:9, fontWeight:800, padding:'3px 7px', borderRadius:5,
                        background:tagBg, color:tagColor, letterSpacing:'0.04em', flexShrink:0,
                        whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:90,
                      }}>{tagLabel}</span>
                      <span style={{
                        fontFamily:'var(--pg-font-display)', fontSize:13, fontWeight:800,
                        color:'var(--pg-blue-500)', letterSpacing:'-0.01em', flexShrink:0,
                        whiteSpace:'nowrap',
                      }}>{tr(f.price, lang)}</span>
                    </div>

                    {/* Title */}
                    <div style={{
                      fontSize:13, fontWeight:700, lineHeight:1.3, letterSpacing:'-0.01em',
                      color:'var(--pg-ink-900)', flex:1,
                      display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden',
                    }}>{tr(f.title, lang)}</div>

                    {/* Sub */}
                    <div style={{
                      fontSize:11, color:'var(--pg-ink-500)', marginTop:5, lineHeight:1.3,
                      display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical', overflow:'hidden',
                    }}>{tr(f.sub, lang)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

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
            {QUICK_POOLS.slice(0,3).map(j => (
              <button key={j.id}
                onClick={()=> isPremium ? setSelectedJob(j) : openPaywall()}
                className="pg-card pg-card-tap" style={{
                  padding:'12px 14px', border:'none', cursor:'pointer', textAlign:'left',
                  display:'flex', alignItems:'center', gap:12, background:'var(--pg-white)',
                  position:'relative', opacity: isPremium ? 1 : 0.92,
                }}>
                <div style={{
                  width:44, height:44, borderRadius:12, flexShrink:0, position:'relative',
                  background: !isPremium
                    ? 'var(--pg-ink-100)'
                    : j.urgency==='urgent' ? 'oklch(0.95 0.05 25)' : 'var(--pg-aqua-100)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  {!isPremium
                    ? Icon.lock(18, 'var(--pg-ink-500)')
                    : Icon.bolt(20, j.urgency==='urgent'?'var(--pg-danger)':'var(--pg-aqua-700)')}
                </div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:13.5, fontWeight:600, letterSpacing:'-0.01em', lineHeight:1.25,
                    display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical', overflow:'hidden',
                    color: isPremium ? 'var(--pg-ink-900)' : 'var(--pg-ink-700)'}}>{tr(j.title, lang)}</div>
                  <div style={{fontSize:11.5, color:'var(--pg-ink-500)', marginTop:3, display:'flex', alignItems:'center', gap:4, flexWrap:'wrap'}}>
                    {Icon.pin(11, 'var(--pg-ink-500)')} {j.loc} · {tr(j.dist, lang)}
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
                  ) : (
                    <>
                      <div style={{fontFamily:'var(--pg-font-display)', fontSize:18, fontWeight:700, color:'var(--pg-blue-500)', letterSpacing:'-0.02em', lineHeight:1}}>${j.price}</div>
                      <div style={{fontSize:9.5, color:'var(--pg-ink-500)', marginTop:2}}>{t.perPool}</div>
                    </>
                  )}
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
                  <button onClick={()=>openPublicProfile && openPublicProfile({ name:f.seller||'Verified Seller', rating:4.9, reviews:58, jobs:58, loc:'South Florida' })}
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
