// quickpools.jsx — Express Pools live feed + posting + push notifications

class JobDetailBoundary extends React.Component {
  constructor(props) { super(props); this.state = { err: null }; }
  static getDerivedStateFromError(e) { return { err: e }; }
  render() {
    if (this.state.err) {
      return React.createElement('div', { style: { padding: '24px 18px' } },
        React.createElement('div', { style: { fontWeight: 700, color: '#DC2626', marginBottom: 8 } }, 'Erro ao carregar detalhes'),
        React.createElement('pre', { style: { fontSize: 11, color: '#7F1D1D', whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: '#FEF2F2', padding: 10, borderRadius: 8 } },
          this.state.err && (this.state.err.message + '\n' + (this.state.err.stack || ''))
        ),
        React.createElement('button', { onClick: this.props.onClose, style: { marginTop: 12, padding: '8px 16px', borderRadius: 8, border: 'none', background: '#DC2626', color: '#fff', cursor: 'pointer' } }, 'Fechar')
      );
    }
    return this.props.children;
  }
}

function QuickPoolsScreen({ ctx }) {
  const { lang, user, openPaywall, openChat, openPost, openRegionEditor, regionsByDay, county, hasUnreadChat, openNotifications, hasUnreadNotif, darkMode=false } = ctx;
  const t = STRINGS[lang];
  const [selected,    setSelected]    = React.useState(null);
  const [highlighted, setHighlighted] = React.useState(null);
  const [applied,     setApplied]     = React.useState({});
  const [isDesktop,   setIsDesktop]   = React.useState(() => window.innerWidth >= 900);

  // Live jobs from Supabase
  const [jobs, setJobs] = React.useState(QUICK_POOLS);
  const [jobsLoading, setJobsLoading] = React.useState(false);

  // Post job sheet
  const [postOpen, setPostOpen] = React.useState(false);

  // Push notification status: 'checking' | 'needed' | 'active' | 'denied' | 'unsupported'
  const [notifStatus, setNotifStatus] = React.useState('checking');

  const checkNotifStatus = React.useCallback(async () => {
    if (typeof Notification === 'undefined' || !('PushManager' in window)) {
      setNotifStatus('unsupported'); return;
    }
    const perm = Notification.permission;
    if (perm === 'denied') { setNotifStatus('denied'); return; }
    if (perm === 'default') { setNotifStatus('needed'); return; }
    // Permission granted — verify an actual push subscription exists
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        setNotifStatus(sub ? 'active' : 'needed');
      } else { setNotifStatus('active'); }
    } catch { setNotifStatus('active'); }
  }, []);

  React.useEffect(() => { checkNotifStatus(); }, [checkNotifStatus]);

  const activatePush = React.useCallback(async () => {
    if (ctx.registerPush) await ctx.registerPush();
    await checkNotifStatus();
  }, [ctx.registerPush, checkNotifStatus]);

  // Auto-prompt when tab opens and permission not yet decided
  const autoPromptedRef = React.useRef(false);
  React.useEffect(() => {
    if (notifStatus === 'needed' && !autoPromptedRef.current) {
      autoPromptedRef.current = true;
      setTimeout(() => activatePush(), 700);
    }
  }, [notifStatus, activatePush]);

  const loadJobs = React.useCallback(async () => {
    if (!window.sb) return;
    setJobsLoading(true);
    try {
      const { data } = await window.sb.from('quick_pool_jobs')
        .select('*').in('status',['open','filled']).order('created_at',{ ascending:false }).limit(50);
      if (data && data.length > 0) {
        // Expire jobs older than 24h
        const now = Date.now();
        const expiredIds = [];
        const active = data.filter(j => {
          if (j.status === 'open' && (now - new Date(j.created_at).getTime()) > 24*60*60*1000) {
            expiredIds.push(j.id); return false;
          }
          return true;
        });
        if (expiredIds.length > 0)
          window.sb.from('quick_pool_jobs').update({ status:'expired' }).in('id', expiredIds).then(()=>{});
        setJobs(active.map(j => ({
          id: j.id, _live: true,
          title: { en: j.title || `Pool job in ${j.city}`, pt: j.title || `Vaga em ${j.city}`, es: j.title || `Vaga en ${j.city}` },
          loc: j.city, dist: { en:'', pt:'', es:'' },
          price: j.price_negotiable ? 'neg' : j.price_per_pool,
          type: j.pool_type || 'residential',
          urgency: 'new',
          poster: j.poster_name,
          poster_phone: j.poster_phone,
          pool_address: j.pool_address,
          poster_id: j.poster_id,
          when: { en: j.when_label||'', pt: j.when_label||'', es: j.when_label||'' },
          pools: j.pools_count || 1,
          day_of_week: j.day_of_week,
          time_slot: j.time_slot || '',
          extras: j.extras || null,
          body: { en: j.description||'', pt: j.description||'', es: j.description||'' },
          created_at: j.created_at,
        })));
      }
    } catch {}
    setJobsLoading(false);
  }, []);

  React.useEffect(() => { loadJobs(); }, [loadJobs]);

  // Capture deep-link job ID from URL on first render, before hash is overwritten by tab sync
  const deepLinkJobId = React.useMemo(() => {
    try {
      const hash = window.location.hash;
      const qs = hash.includes('?') ? hash.split('?')[1] : '';
      return new URLSearchParams(qs).get('job') || null;
    } catch { return null; }
  }, []);

  // Open deep-linked job once jobs list is loaded
  React.useEffect(() => {
    if (!deepLinkJobId || !jobs.length) return;
    const j = jobs.find(x => String(x.id) === String(deepLinkJobId));
    if (j) setSelected(j);
  }, [jobs, deepLinkJobId]);

  // Open job requested via chat listing-card click (ctx.pendingQuickJobId set by app.jsx)
  React.useEffect(() => {
    const id = ctx.pendingQuickJobId;
    if (!id || !jobs.length) return;
    const j = jobs.find(x => String(x.id) === String(id));
    if (j) { setSelected(j); ctx.clearPendingQuickJob(); }
  }, [ctx.pendingQuickJobId, jobs]);

  React.useEffect(() => {
    const h = () => setIsDesktop(window.innerWidth >= 900);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  const notifCities = React.useMemo(() => {
    const set = new Set();
    Object.values(regionsByDay || {}).forEach(arr => (arr||[]).forEach(c => set.add(c)));
    return [...set];
  }, [regionsByDay]);
  const activeDayCount = React.useMemo(
    () => Object.values(regionsByDay || {}).filter(arr => (arr||[]).length > 0).length,
    [regionsByDay]
  );

  const cardRefs = React.useRef({});

  const scrollToJob = (id) => {
    setHighlighted(id);
    const el = cardRefs.current[id];
    if (el) el.scrollIntoView({behavior:'smooth', block:'center'});
    setTimeout(()=>setHighlighted(null), 1800);
  };

  // ── Delete a live job ─────────────────────────────────────────
  const deleteJob = async (jobId, e) => {
    e && e.stopPropagation();
    if (!window.sb) return;
    await window.sb.from('quick_pool_jobs').update({ status:'cancelled' }).eq('id', jobId);
    setJobs(prev => prev.filter(j => String(j.id) !== String(jobId)));
    if (selected && String(selected.id) === String(jobId)) setSelected(null);
  };

  // ── Finalize a filled job (owner marks complete → removed) ──
  const finalizeJob = async (jobId) => {
    if (!window.sb) return;
    await window.sb.from('quick_pool_jobs').update({ status: 'completed' }).eq('id', jobId);
    setJobs(prev => prev.filter(j => String(j.id) !== String(jobId)));
    setSelected(null);
  };

  // ── Apply to a live job ───────────────────────────────────────
  const applyToJob = async (jobId, sharePhone = false) => {
    if (!window.sb || !user?.uid) return;
    setApplied(prev => ({ ...prev, [jobId]: true }));
    try {
      await window.sb.from('quick_pool_applications').insert({
        job_id: jobId, applicant_id: user.uid,
        applicant_name: user.name || user.email || 'Pool Guy',
        applicant_phone: sharePhone ? (user.phone || null) : null,
        status: 'pending',
      });
    } catch {}
  };

  // ── Shared job card (used on mobile + desktop) ────────────────
  const JobCard = ({ j, compact=false }) => {
    const isApplied    = !!applied[j.id];
    const isHighlighted = highlighted === j.id;
    const locked       = user.tier === 'free';
    const isOwn        = j._live && user?.uid && j.poster_id === user.uid;

    return (
      <article key={j.id}
        ref={el => { cardRefs.current[j.id] = el; }}
        onClick={()=>setSelected(j)}
        style={{
          background:'var(--pg-white)', borderRadius:16, cursor:'pointer',
          border: isHighlighted
            ? '1.5px solid var(--pg-blue-400)'
            : '1px solid var(--pg-ink-200)',
          boxShadow: isHighlighted
            ? '0 0 0 3px rgba(0,119,182,0.12), 0 6px 20px rgba(0,119,182,0.15)'
            : '0 2px 8px rgba(0,0,0,0.05)',
          transition:'all .2s ease',
          overflow:'hidden',
        }}>

        {/* Top accent strip */}
        <div style={{
          height:3, width:'100%',
          background: j.status==='filled'
            ? 'linear-gradient(90deg,#D97706,#F59E0B)'
            : isApplied
              ? 'linear-gradient(90deg,#16A34A,#22C55E)'
              : locked
                ? 'linear-gradient(90deg,#6B7280,#9CA3AF)'
                : 'linear-gradient(90deg,#0077B6,#38BDF8)',
        }}/>

        <div style={{padding: compact ? '14px 16px' : '16px 18px'}}>
          {/* Row 1: time + pools + price */}
          <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:10}}>
            <div style={{flex:1, minWidth:0}}>
              {/* When + applied badge */}
              <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:6, flexWrap:'wrap'}}>
                <span style={{
                  display:'inline-flex', alignItems:'center', gap:4,
                  fontSize:11, fontWeight:600, color:'var(--pg-ink-500)',
                }}>
                  {Icon.clock(11,'var(--pg-ink-400)')} {tr(j.when,lang)}
                </span>
                {j.status==='filled' && !isOwn && (
                  <span style={{
                    fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:999,
                    background:'#FEF3C7', color:'#92400E', letterSpacing:'0.04em',
                    display:'inline-flex', alignItems:'center', gap:3,
                  }}>⏳ {lang==='pt'?'Em curso':lang==='es'?'En curso':'In progress'}</span>
                )}
                {isApplied && j.status!=='filled' && (
                  <span style={{
                    fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:999,
                    background:'#DCFCE7', color:'#15803D', letterSpacing:'0.04em',
                  }}>✓ {t.applied}</span>
                )}
                {locked && (
                  <span style={{
                    fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:999,
                    background:'var(--pg-ink-100)', color:'var(--pg-ink-500)', letterSpacing:'0.04em',
                    display:'inline-flex', alignItems:'center', gap:3,
                  }}>
                    {Icon.lock(9,'var(--pg-ink-400)')} Premium
                  </span>
                )}
              </div>
              {/* Title */}
              <h3 style={{
                margin:'0 0 6px', fontFamily:'var(--pg-font-display)',
                fontSize: compact?15:17, fontWeight:800, letterSpacing:'-0.02em', lineHeight:1.2,
                color:'var(--pg-ink-900)',
              }}>{tr(j.title,lang)}</h3>
              {/* Location */}
              <div style={{display:'flex', alignItems:'center', gap:5, fontSize:12, color:'var(--pg-ink-500)'}}>
                {Icon.pin(12,'var(--pg-blue-400)')}
                <span>{j.loc}</span>
                <span style={{color:'var(--pg-ink-300)'}}>·</span>
                <span>{tr(j.dist,lang)}</span>
              </div>
            </div>

            {/* Price block */}
            <div style={{
              flexShrink:0, textAlign:'right', padding:'8px 12px',
              borderRadius:12, background:'var(--pg-ink-50)', border:'1px solid var(--pg-ink-100)',
              minWidth:72,
            }}>
              <div style={{fontSize:10, fontWeight:600, color:'var(--pg-ink-400)', letterSpacing:'0.04em', marginBottom:2}}>
                {j.pools} {j.pools>1?t.poolsWord:(lang==='pt'?'piscina':'pool')}
              </div>
              {j.price === 'neg' ? (
                <div style={{fontSize:13, fontWeight:700, color:'var(--pg-ink-700)'}}>{t.negotiable}</div>
              ) : (
                <>
                  <div style={{fontFamily:'var(--pg-font-display)', fontSize:22, fontWeight:800,
                    color: locked?'var(--pg-ink-400)':'var(--pg-blue-500)',
                    letterSpacing:'-0.03em', lineHeight:1,
                    filter: locked ? 'blur(4px)' : 'none',
                  }}>${j.price}</div>
                  <div style={{fontSize:9.5, color:'var(--pg-ink-400)', marginTop:1}}>{t.perPool}</div>
                </>
              )}
            </div>
          </div>

          {/* Divider */}
          <div style={{height:1, background:'var(--pg-ink-100)', margin:'0 0 12px'}}/>

          {/* Row 2: poster + action */}
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:10}}>
            <div style={{display:'flex', alignItems:'center', gap:10, minWidth:0}}>
              <Avatar name={j.poster} size={32}/>
              <div>
                <div style={{fontSize:13, fontWeight:600, color:'var(--pg-ink-800)', lineHeight:1.2}}>{j.poster}</div>
                <div style={{display:'flex', alignItems:'center', gap:4, marginTop:2}}>
                  <Stars rating={j.rating} size={10}/>
                  <span style={{fontSize:11, color:'var(--pg-ink-500)', fontWeight:500}}>{j.rating}</span>
                </div>
              </div>
            </div>

            {isOwn ? (
              <button onClick={(e)=>deleteJob(j.id, e)} style={{
                width:36, height:36, borderRadius:10, border:'1px solid #FECACA',
                background:'#FEF2F2', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
              </button>
            ) : locked ? (
              <button onClick={(e)=>{e.stopPropagation();openPaywall();}} style={{
                height:36, padding:'0 16px', borderRadius:999, border:'none', cursor:'pointer',
                background:'linear-gradient(135deg, var(--pg-blue-700), oklch(0.45 0.15 230))',
                color:'#fff', fontFamily:'inherit',
                fontSize:12, fontWeight:700, display:'flex', alignItems:'center', gap:6,
                boxShadow:'0 3px 10px rgba(0,119,182,0.35)',
              }}>
                {Icon.lock(12,'#fff')} {t.unlock}
              </button>
            ) : j.status==='filled' && !isOwn ? (
              <div style={{
                height:36, padding:'0 16px', borderRadius:999,
                background:'#FEF3C7', border:'1px solid #FCD34D',
                color:'#92400E', fontSize:12, fontWeight:700,
                display:'flex', alignItems:'center', gap:6,
              }}>
                ⏳ {lang==='pt'?'Em curso':lang==='es'?'En curso':'In progress'}
              </div>
            ) : isApplied ? (
              <div style={{
                height:36, padding:'0 16px', borderRadius:999,
                background:'#DCFCE7', border:'1px solid #86EFAC',
                color:'#15803D', fontSize:12, fontWeight:700,
                display:'flex', alignItems:'center', gap:6,
              }}>
                {Icon.check(13,'#15803D')} {t.applied}
              </div>
            ) : (
              <button onClick={(e)=>{e.stopPropagation();setSelected(j);}} style={{
                height:36, padding:'0 18px', borderRadius:999, border:'none', cursor:'pointer',
                background:'linear-gradient(135deg,#0077B6,#023E8A)',
                color:'#fff', fontFamily:'inherit', fontSize:13, fontWeight:700,
                boxShadow:'0 3px 10px rgba(0,119,182,0.30)', transition:'all .15s',
              }}>{t.apply}</button>
            )}
          </div>
        </div>
      </article>
    );
  };

  // ── Sheet (mobile + desktop share the same) ───────────────────
  const JobPage = () => selected ? (
    <div style={{
      position:'fixed', inset:0, zIndex:500,
      background:'var(--pg-bg)', overflowY:'auto',
      display:'flex', flexDirection:'column',
    }}>
      <JobDetailBoundary onClose={()=>setSelected(null)}>
        <QuickPoolDetails job={selected} user={user} t={t} lang={lang}
          applied={!!applied[selected.id]}
          onApply={(sharePhone)=>applyToJob(selected.id, sharePhone)}
          onUnlock={openPaywall}
          onChat={openChat}
          onClose={()=>setSelected(null)}
          onDelete={deleteJob}
          onComplete={finalizeJob}
          onStatusChange={(status) => {
            setJobs(prev => prev.map(j => String(j.id)===String(selected.id) ? {...j, status} : j));
            setSelected(prev => prev ? {...prev, status} : prev);
          }}
        />
      </JobDetailBoundary>
    </div>
  ) : null;

  // ══════════════════════════════════════════════════════════════
  // ── DESKTOP LAYOUT ────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════
  if (isDesktop) {
    return (
      <div style={{position:'relative', width:'100%', height:'100%', overflow:'hidden'}}>
      <div style={{height:'100%', overflowY:'auto', background:'var(--pg-ink-50)'}}>

        {/* ── HERO ─────────────────────────────────────────────── */}
        {(function(){
          const _tx  = darkMode ? '#fff'                     : '#0A2840';
          const _sub = darkMode ? 'rgba(255,255,255,0.50)'   : 'rgba(10,40,64,0.50)';
          const _sub2= darkMode ? 'rgba(255,255,255,0.55)'   : 'rgba(10,40,64,0.55)';
          const _ib  = darkMode ? 'rgba(255,255,255,0.12)'   : 'rgba(10,40,64,0.08)';
          const _ibr = darkMode ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(10,40,64,0.12)';
          const _cb  = darkMode ? 'rgba(255,255,255,0.08)'   : 'rgba(10,40,64,0.05)';
          const _cbr = darkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(10,40,64,0.10)';
          const _bg  = darkMode
            ? 'linear-gradient(135deg, #011B5A 0%, #0077B6 55%, #0096C7 100%)'
            : 'linear-gradient(135deg, #e8f5ff 0%, #cfe9f8 60%, #b8dff5 100%)';
          return (
            <div style={{background:_bg, padding:'28px 40px 28px', position:'relative', overflow:'hidden'}}>
              <div style={{position:'absolute', top:-80, right:-80, width:280, height:280,
                borderRadius:'50%', background: darkMode?'rgba(255,255,255,0.03)':'rgba(10,40,64,0.03)', pointerEvents:'none'}}/>
              <div style={{position:'absolute', bottom:-50, left:160, width:200, height:200,
                borderRadius:'50%', background: darkMode?'rgba(255,255,255,0.03)':'rgba(10,40,64,0.02)', pointerEvents:'none'}}/>
              {/* Centered icon watermark */}
              <div style={{position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none', zIndex:0}}>
                <img src="icone.png" alt="" style={{position:'absolute', left:'50%', top:'63%', transform:'translate(-50%,-50%)', height:235, objectFit:'contain', opacity:0.60, userSelect:'none'}}/>
              </div>

              {/* Single compact row */}
              <div style={{display:'flex', alignItems:'center', gap:20}}>
                {/* Brand */}
                <div style={{display:'flex', alignItems:'center', gap:12, flexShrink:0}}>
                  <div style={{width:42,height:42,borderRadius:13,flexShrink:0,background:_ib,border:_ibr,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={_tx} strokeWidth="1.75" strokeLinecap="round">
                      <path d="M2 12 Q6 8 10 12 Q14 16 18 12 Q20 10 22 12"/>
                      <path d="M2 17 Q6 13 10 17 Q14 21 18 17 Q20 15 22 17"/>
                      <circle cx="12" cy="5" r="2"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{fontSize:9.5,fontWeight:700,color:_sub,letterSpacing:'0.13em',textTransform:'uppercase',marginBottom:2}}>
                      QUICK POOLS · {(county||'BROWARD').toUpperCase()}
                    </div>
                    <div style={{fontFamily:'var(--pg-font-display)',fontSize:20,fontWeight:800,color:_tx,letterSpacing:'-0.025em',lineHeight:1}}>
                      {lang==='pt'?'Piscinas Rápidas':lang==='es'?'Piscinas Rápidas':'Express Pools'}
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div style={{width:1, height:32, background: darkMode?'rgba(255,255,255,0.12)':'rgba(10,40,64,0.10)', flexShrink:0}}/>

                {/* Stats inline */}
                <div style={{display:'flex', alignItems:'center', gap:16, flex:1}}>
                  <div style={{display:'flex', alignItems:'center', gap:6}}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={_sub2} strokeWidth="1.75" strokeLinecap="round">
                      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3 8 3"/><path d="M12 3v4"/>
                    </svg>
                    <span style={{fontFamily:'var(--pg-font-display)',fontSize:15,fontWeight:800,color:_tx,letterSpacing:'-0.02em'}}>{jobs.length}</span>
                    <span style={{fontSize:11,color:_sub,fontWeight:500}}>{lang==='pt'?'vagas':'jobs'}</span>
                  </div>
                  <div style={{width:1,height:18,background:darkMode?'rgba(255,255,255,0.12)':'rgba(10,40,64,0.10)'}}/>
                  <div style={{display:'flex', alignItems:'center', gap:6}}>
                    {Icon.cal(13,_sub2)}
                    <span style={{fontFamily:'var(--pg-font-display)',fontSize:15,fontWeight:800,color:'#34D399',letterSpacing:'-0.02em'}}>{activeDayCount}/7</span>
                    <span style={{fontSize:11,color:_sub,fontWeight:500}}>{lang==='pt'?'dias ativos':'active days'}</span>
                  </div>
                  <div style={{width:1,height:18,background:darkMode?'rgba(255,255,255,0.12)':'rgba(10,40,64,0.10)'}}/>
                  <div style={{display:'flex', alignItems:'center', gap:6, flex:1, minWidth:0}}>
                    {Icon.bell(13,_sub2)}
                    <span style={{fontSize:12,color:_sub,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                      {notifCities.length > 0
                        ? notifCities.slice(0,3).join(' · ') + (notifCities.length>3?` +${notifCities.length-3}`:'')
                        : (lang==='pt'?'Sem cidades':'No cities')}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{display:'flex', alignItems:'center', gap:8, flexShrink:0}}>
                  <button onClick={()=>setPostOpen(true)} style={{height:38,padding:'0 16px',borderRadius:11,border:'none',background:'linear-gradient(135deg,#0077B6,#023E8A)',color:'#fff',fontFamily:'inherit',fontSize:13,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:6,boxShadow:'0 3px 10px rgba(0,119,182,0.35)',transition:'all .15s'}}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    {lang==='pt'?'Publicar':lang==='es'?'Publicar':'Post'}
                  </button>
                  <button onClick={openRegionEditor} style={{height:38,padding:'0 14px',borderRadius:11,border:_ibr,background:_ib,color:_tx,fontFamily:'inherit',fontSize:12,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:6,transition:'all .15s'}}>
                    {Icon.cal(13,_tx)} {lang==='pt'?'Editar':'Edit'}
                  </button>
                  <button onClick={()=>openChat&&openChat()} style={{width:38,height:38,borderRadius:11,background:_ib,border:_ibr,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
                    {Icon.msg(18,_tx)}
                    {hasUnreadChat && <span style={{position:'absolute',top:7,right:7,width:7,height:7,borderRadius:'50%',background:'#FF3B30',border:`2px solid ${darkMode?'#011B5A':'#c5e4f5'}`}}/>}
                  </button>
                  <button onClick={()=>openNotifications&&openNotifications()} style={{width:38,height:38,borderRadius:11,background:_ib,border:_ibr,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
                    {Icon.bell(18,_tx)}
                    {hasUnreadNotif && <span style={{position:'absolute',top:7,right:7,width:7,height:7,borderRadius:'50%',background:'#FF3B30',border:`2px solid ${darkMode?'#011B5A':'#c5e4f5'}`}}/>}
                  </button>
                </div>
              </div>
            </div>
          );
        }())}

        {/* ── CONTENT: Map left + Jobs right ───────────────────── */}
        <div style={{display:'grid', gridTemplateColumns:'420px 1fr', gap:0, minHeight:'calc(100vh - 300px)'}}>

          {/* Left: sticky map */}
          <div style={{
            position:'sticky', top:0, height:'calc(100vh - 0px)',
            borderRight:'1px solid var(--pg-ink-200)',
            background:'var(--pg-white)', overflow:'hidden', flexShrink:0,
          }}>
            <LeafletMapBlock jobs={jobs} highlighted={highlighted} onPinClick={(j)=>scrollToJob(j.id)} fullHeight/>

            {/* Info overlay */}
            <div style={{
              position:'absolute', top:16, left:16, right:16, zIndex:400,
              background:'rgba(255,255,255,0.95)', backdropFilter:'blur(12px)',
              borderRadius:12, padding:'10px 14px',
              border:'1px solid rgba(255,255,255,0.8)',
              boxShadow:'0 4px 16px rgba(0,0,0,0.12)',
              display:'flex', alignItems:'center', gap:8,
            }}>
              {Icon.bell(13,'var(--pg-blue-600)')}
              <div style={{fontSize:11.5, color:'var(--pg-blue-700)', lineHeight:1.4, flex:1}}>
                {lang==='pt'
                  ? <><b>{county} County</b> — clique nos pins para ver detalhes</>
                  : <><b>{county} County</b> — click pins to jump to job details</>}
              </div>
            </div>
          </div>

          {/* Right: job list */}
          <div style={{padding:'28px 32px 60px', background:'var(--pg-ink-50)'}}>

            {/* Push notification banner — only when not active */}
            {(notifStatus === 'needed' || notifStatus === 'denied') && (
              <div style={{
                marginBottom:20, padding:'12px 16px', borderRadius:13,
                background:'#FEFCE8', border:'1px solid #FDE68A',
                display:'flex', alignItems:'center', gap:10,
              }}>
                <div style={{fontSize:18, flexShrink:0}}>🔔</div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:13, fontWeight:700, color:'#92400E', marginBottom:2}}>
                    {lang==='pt' ? 'Ative as notificações para receber vagas em tempo real' : lang==='es' ? 'Activa las notificaciones para recibir trabajos en tiempo real' : 'Enable notifications to receive real-time job alerts'}
                  </div>
                  <div style={{fontSize:12, color:'#A16207', lineHeight:1.4}}>
                    {lang==='pt'
                      ? 'Sem notificações ativas você pode perder vagas urgentes.'
                      : lang==='es'
                      ? 'Sin notificaciones activas puedes perder trabajos urgentes.'
                      : 'Without notifications enabled you may miss urgent jobs.'}
                  </div>
                </div>
                {notifStatus === 'denied' ? (
                  <div style={{fontSize:11, fontWeight:600, color:'#DC2626', flexShrink:0, maxWidth:100, textAlign:'center', lineHeight:1.3}}>
                    {lang==='pt' ? 'Bloqueado — habilite nas configurações do navegador' : 'Blocked — enable in browser settings'}
                  </div>
                ) : (
                  <button onClick={activatePush} style={{
                    flexShrink:0, height:36, padding:'0 18px', borderRadius:9,
                    border:'none', cursor:'pointer', fontSize:13, fontWeight:700, fontFamily:'inherit',
                    background:'#D97706', color:'#fff',
                    boxShadow:'0 2px 8px rgba(217,119,6,0.3)',
                  }}>
                    {lang==='pt' ? 'Ativar notificações' : lang==='es' ? 'Activar notificaciones' : 'Enable notifications'}
                  </button>
                )}
              </div>
            )}

            {/* Header */}
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20}}>
              <div>
                <div style={{fontSize:20, fontWeight:800, color:'var(--pg-ink-900)',
                  fontFamily:'var(--pg-font-display)', letterSpacing:'-0.02em', lineHeight:1}}>
                  {lang==='pt'?`${jobs.length} vagas disponíveis`:lang==='es'?`${jobs.length} trabajos disponibles`:`${jobs.length} jobs available`}
                </div>
                <div style={{fontSize:13, color:'var(--pg-ink-500)', marginTop:4}}>
                  {lang==='pt'?`Broward County · ordenado por proximidade`:`${county} County · sorted by proximity`}
                </div>
              </div>
              {user.tier==='free' && (
                <div style={{
                  display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:999,
                  background:'linear-gradient(135deg,var(--pg-blue-50),#E0F2FE)',
                  border:'1px solid var(--pg-blue-100)',
                }}>
                  {Icon.lock(12,'var(--pg-blue-600)')}
                  <span style={{fontSize:12, fontWeight:700, color:'var(--pg-blue-700)'}}>
                    {lang==='pt'?'Premium para se candidatar':'Premium to apply'}
                  </span>
                </div>
              )}
            </div>

            {/* Cards */}
            <div style={{display:'flex', flexDirection:'column', gap:12}}>
              {jobs.map(j => <JobCard key={j.id} j={j}/>)}
            </div>
          </div>
        </div>
      </div>
      <JobPage/>
      <PostJobSheet open={postOpen} onClose={()=>setPostOpen(false)} lang={lang} user={user} darkMode={darkMode}
        onPosted={j=>{ loadJobs(); }}/>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // ── MOBILE LAYOUT ─────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════
  return (
    <div style={{position:'relative', width:'100%', height:'100%', overflow:'hidden'}}>
    <div className="pg-screen" style={{paddingBottom:110, height:'100%', overflowY:'auto', background:'var(--pg-bg)'}}>
      {/* Express Pools header — adapts to dark/light mode */}
      {(()=>{
        const _bg   = darkMode
          ? 'linear-gradient(155deg, #010E1F 0%, #012044 40%, #013B78 80%, #004E9A 100%)'
          : 'linear-gradient(155deg, #daeeff 0%, #c2e4f8 40%, #a8d8f5 80%, #8ec8f0 100%)';
        const _tx   = darkMode ? '#fff'               : '#0A2840';
        const _sub  = darkMode ? 'rgba(255,255,255,0.55)' : 'rgba(10,40,64,0.50)';
        const _btnBg= darkMode ? 'rgba(0,180,216,0.28)'  : 'rgba(0,100,180,0.13)';
        const _btnBd= darkMode ? 'rgba(0,200,240,0.5)'   : 'rgba(0,100,180,0.30)';
        const _btnC = darkMode ? '#fff'               : '#004A8F';
        const _icBg = darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(10,40,64,0.08)';
        const _icBd = darkMode ? 'rgba(255,255,255,0.18)' : 'rgba(10,40,64,0.14)';
        const _notifBg = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(10,40,64,0.07)';
        const _notifBd = darkMode ? 'rgba(255,255,255,0.13)' : 'rgba(10,40,64,0.13)';
        const _orb1 = darkMode ? 'rgba(0,200,240,0.32)'  : 'rgba(0,120,200,0.18)';
        const _orb2 = darkMode ? 'rgba(56,189,248,0.18)' : 'rgba(0,100,180,0.10)';
        const _orb3 = darkMode ? 'rgba(0,120,210,0.22)'  : 'rgba(0,80,160,0.10)';
        const _waveFill = darkMode ? '#F4F8FB' : '#F4F8FB';
        const _dotColor = '#34D399';
        const _dotBorder = darkMode ? '#010E1F' : '#a8d8f5';
        return (
          <div style={{background:_bg, padding:`calc(env(safe-area-inset-top, 0px) + 14px) 18px 28px`, position:'relative', overflow:'hidden'}}>
            {/* Diagonal light streaks */}
            <div style={{position:'absolute',inset:0,pointerEvents:'none',
              backgroundImage:`repeating-linear-gradient(118deg, transparent, transparent 38px, ${darkMode?'rgba(255,255,255,0.028)':'rgba(255,255,255,0.45)'} 38px, ${darkMode?'rgba(255,255,255,0.028)':'rgba(255,255,255,0.45)'} 39px)`,
            }}/>
            {/* Glow orbs */}
            <div style={{position:'absolute',top:-55,right:-35,width:190,height:190,borderRadius:'50%',background:`radial-gradient(circle,${_orb1} 0%,transparent 65%)`,pointerEvents:'none'}}/>
            <div style={{position:'absolute',top:10,right:55,width:70,height:70,borderRadius:'50%',background:`radial-gradient(circle,${_orb2} 0%,transparent 70%)`,pointerEvents:'none'}}/>
            <div style={{position:'absolute',bottom:14,left:-25,width:110,height:110,borderRadius:'50%',background:`radial-gradient(circle,${_orb3} 0%,transparent 70%)`,pointerEvents:'none'}}/>
            {/* Bottom wave */}
            <svg viewBox="0 0 375 28" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"
              style={{position:'absolute',bottom:0,left:0,width:'100%',height:28,display:'block',pointerEvents:'none'}}>
              <path d="M0,14 C55,2 110,22 165,12 C220,2 275,20 330,10 C348,6 362,14 375,10 L375,28 L0,28 Z" fill={darkMode?'rgba(255,255,255,0.06)':'rgba(255,255,255,0.4)'}/>
              <path d="M0,20 C70,8 140,26 210,16 C265,8 320,22 375,18 L375,28 L0,28 Z" fill={_waveFill}/>
            </svg>

            {/* Row 1: title + action buttons */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8,position:'relative',zIndex:1}}>
              <h1 style={{margin:0,fontFamily:'var(--pg-font-display)',fontSize:24,fontWeight:800,color:_tx,letterSpacing:'-0.025em',lineHeight:1}}>
                {lang==='pt'?'Piscinas Rápidas':lang==='es'?'Piscinas Rápidas':'Express Pools'}
              </h1>
              <div style={{display:'flex',gap:6}}>
                <div style={{position:'relative'}}>
                  <button onClick={()=>openChat&&openChat()} style={{width:36,height:36,borderRadius:11,background:_icBg,border:`0.5px solid ${_icBd}`,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    {Icon.msg(17,_tx)}
                  </button>
                  {hasUnreadChat&&<span style={{position:'absolute',top:6,right:6,width:7,height:7,borderRadius:'50%',background:'#FF3B30',border:`1.5px solid ${_dotBorder}`,pointerEvents:'none'}}/>}
                </div>
                <div style={{position:'relative'}}>
                  <button onClick={()=>openNotifications&&openNotifications()} style={{width:36,height:36,borderRadius:11,background:_icBg,border:`0.5px solid ${_icBd}`,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    {Icon.bell(17,_tx)}
                  </button>
                  {hasUnreadNotif&&<span style={{position:'absolute',top:6,right:6,width:7,height:7,borderRadius:'50%',background:'#FF3B30',border:`1.5px solid ${_dotBorder}`,pointerEvents:'none'}}/>}
                </div>
              </div>
            </div>

            {/* Row 2: notification info + edit button */}
            <div style={{position:'relative',zIndex:1,display:'flex',alignItems:'center',gap:8,background:_notifBg,border:`0.5px solid ${_notifBd}`,borderRadius:12,padding:'8px 12px'}}>
              {Icon.bell(12,_sub)}
              <span style={{flex:1,minWidth:0,fontSize:12,fontWeight:500,color:_sub,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                {notifCities.length > 0
                  ? notifCities.slice(0,3).join(' · ')+(notifCities.length>3?` +${notifCities.length-3}`:'')
                  : (lang==='pt'?'Nenhuma cidade':lang==='es'?'Ninguna ciudad':'No cities')}
              </span>
              {activeDayCount > 0 && (
                <span style={{fontSize:11,fontWeight:700,color:_dotColor,flexShrink:0}}>{activeDayCount}/7</span>
              )}
              <div style={{width:1,height:14,background:_notifBd,flexShrink:0}}/>
              <button onClick={openRegionEditor} style={{background:'transparent',border:'none',color:_sub,fontSize:12,fontWeight:600,cursor:'pointer',padding:0,flexShrink:0,display:'flex',alignItems:'center',gap:4}}>
                {Icon.cal(12,_sub)} {lang==='pt'?'Editar':lang==='es'?'Editar':'Edit'}
              </button>
            </div>
          </div>
        );
      })()}

      {/* Push notification banner — only when not active */}
      {(notifStatus === 'needed' || notifStatus === 'denied') && (
        <div style={{padding:'12px 18px 0'}}>
          <div style={{
            padding:'12px 14px', borderRadius:13,
            background: darkMode ? 'rgba(234,179,8,0.14)' : '#FEFCE8',
            border: `1px solid ${darkMode ? 'rgba(234,179,8,0.35)' : '#FDE68A'}`,
            display:'flex', alignItems:'center', gap:10,
          }}>
            <div style={{fontSize:18, flexShrink:0}}>🔔</div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:13, fontWeight:700, color: darkMode ? '#FDE68A' : '#92400E', marginBottom:2}}>
                {lang==='pt' ? 'Ative as notificações' : lang==='es' ? 'Activa las notificaciones' : 'Enable notifications'}
              </div>
              <div style={{fontSize:11.5, color: darkMode ? 'rgba(253,230,138,0.75)' : '#A16207', lineHeight:1.4}}>
                {lang==='pt'
                  ? 'Você só receberá vagas em tempo real se as notificações estiverem ativas.'
                  : lang==='es'
                  ? 'Solo recibirás trabajos en tiempo real si las notificaciones están activas.'
                  : 'You\'ll only receive real-time job alerts if notifications are enabled.'}
              </div>
            </div>
            {notifStatus === 'denied' ? (
              <div style={{fontSize:10, fontWeight:600, color: darkMode ? '#FCA5A5' : '#DC2626', flexShrink:0, maxWidth:80, textAlign:'center', lineHeight:1.3}}>
                {lang==='pt' ? 'Bloqueado nas config. do navegador' : 'Blocked in browser settings'}
              </div>
            ) : (
              <button onClick={activatePush} style={{
                flexShrink:0, height:34, padding:'0 14px', borderRadius:9,
                border:'none', cursor:'pointer', fontSize:12, fontWeight:700, fontFamily:'inherit',
                background: darkMode ? '#CA8A04' : '#D97706', color:'#fff',
                boxShadow:'0 2px 8px rgba(217,119,6,0.35)',
              }}>
                {lang==='pt' ? 'Ativar' : lang==='es' ? 'Activar' : 'Enable'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Map */}
      <div style={{padding:'14px 18px 0'}}>
        <LeafletMapBlock jobs={jobs} highlighted={highlighted} onPinClick={(j)=>scrollToJob(j.id)}/>
      </div>

      {/* Info banner */}
      <div style={{padding:'12px 18px 0'}}>
        <div style={{
          padding:'10px 12px', borderRadius:11, background:'var(--pg-blue-50)',
          border:'0.5px solid var(--pg-blue-100)',
          display:'flex', alignItems:'flex-start', gap:9,
        }}>
          <div style={{flexShrink:0, marginTop:1}}>{Icon.bell(14,'var(--pg-blue-700)')}</div>
          <div style={{fontSize:11.5, color:'var(--pg-blue-700)', lineHeight:1.4}}>
            {lang==='pt'
              ? <>Mostrando <b>todos os trabalhos do condado de {county}</b>. Você só será <b>notificado</b> dos trabalhos nas cidades e dias configurados.</>
              : <>Showing <b>all jobs in {county} County</b>. You're only <b>notified</b> for jobs in your configured cities and days.</>}
          </div>
        </div>
      </div>

      {/* Count row */}
      <div style={{padding:'12px 18px 0', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <div style={{fontFamily:'var(--pg-font-display)', fontSize:15, fontWeight:800,
          color:'var(--pg-ink-900)', letterSpacing:'-0.01em'}}>
          {lang==='pt'?`${jobs.length} vagas disponíveis`:lang==='es'?`${jobs.length} trabajos disponibles`:`${jobs.length} jobs available`}
        </div>
        {user.tier==='free' && (
          <span style={{fontSize:11, color:'var(--pg-blue-600)', display:'inline-flex', alignItems:'center', gap:4, fontWeight:700}}>
            {Icon.lock(11,'var(--pg-blue-600)')} Premium
          </span>
        )}
      </div>

      {/* Job list */}
      <div style={{padding:'10px 18px 0', display:'flex', flexDirection:'column', gap:10}}>
        {jobs.map(j => <JobCard key={j.id} j={j} compact/>)}
      </div>

    </div>
    <JobPage/>
    <PostJobSheet open={postOpen} onClose={()=>setPostOpen(false)} lang={lang} user={user} darkMode={darkMode}
      onPosted={j=>{ loadJobs(); }}/>
    </div>
  );
}

// ── Real interactive map with Leaflet ────────────────────────
function LeafletMapBlock({ jobs, highlighted, onPinClick, fullHeight=false }) {
  const containerRef = React.useRef(null);
  const mapRef       = React.useRef(null);
  const markersRef   = React.useRef({});

  // Real Broward County / South Florida geocoordinates
  const COORDS = {
    'Boca Raton':      [26.3683, -80.1289],
    'Coral Springs':   [26.2712, -80.2706],
    'Davie':           [26.0765, -80.2521],
    'Plantation':      [26.1276, -80.2331],
    'Weston':          [26.1003, -80.3997],
    'Fort Lauderdale': [26.1224, -80.1373],
    'Pompano Beach':   [26.2379, -80.1248],
    'Hollywood':       [26.0112, -80.1495],
  };

  React.useEffect(() => {
    if (!containerRef.current || typeof L === 'undefined') return;

    const map = L.map(containerRef.current, {
      center: [26.19, -80.22],
      zoom: 10,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      keyboard: false,        // ← prevents Leaflet from setting tabindex + calling container.focus()
      tap: false,             // ← prevents iOS tap handler that triggers focus
    });

    // CartoDB light tiles — clean, Apple Maps-like aesthetic
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Attribution (small) bottom-left
    L.control.attribution({ position:'bottomleft', prefix:false })
      .addAttribution('© <a href="https://carto.com">CartoDB</a> © <a href="https://www.openstreetmap.org/copyright">OSM</a>')
      .addTo(map);

    // Your-location pulse dot
    L.circleMarker([26.15, -80.22], {
      radius:9, fillColor:'#4285F4', color:'#fff', weight:2.5, fillOpacity:1,
    }).addTo(map);

    // Job price pins
    jobs.forEach(job => {
      const coords = COORDS[job.loc];
      if (!coords) return;
      const isNeg = job.price === 'neg';
      const lbl   = isNeg ? 'NEG' : `$${job.price}`;
      const bg    = isNeg ? '#f59e0b' : '#2563eb';
      const icon  = L.divIcon({
        html:`<div style="background:${bg};color:#fff;font-size:11px;font-weight:700;padding:5px 9px;border-radius:14px;white-space:nowrap;box-shadow:0 3px 10px rgba(0,0,0,0.28);border:2.5px solid rgba(255,255,255,0.95);font-family:Inter,system-ui,sans-serif;line-height:1;">${lbl}</div>`,
        className:'',
        iconAnchor:[22,14],
      });
      const marker = L.marker(coords, { icon })
        .addTo(map)
        .on('click', () => onPinClick(job));
      markersRef.current[job.id] = marker;
    });

    mapRef.current = map;

    // Prevent Leaflet's map container from stealing focus and triggering scroll-into-view
    const container = map.getContainer();
    container.setAttribute('tabindex', '-1');
    container.addEventListener('focus', () => container.blur(), true);

    // Force recalc after layout settles
    setTimeout(() => { if (mapRef.current) mapRef.current.invalidateSize(); }, 120);

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
      markersRef.current = {};
    };
  }, []);

  // Pan to highlighted job
  React.useEffect(() => {
    if (!highlighted || !mapRef.current || !markersRef.current[highlighted]) return;
    mapRef.current.panTo(markersRef.current[highlighted].getLatLng(), { animate:true, duration:0.4 });
  }, [highlighted]);

  return (
    <div style={{
      height: fullHeight ? '100%' : 200, overflow:'hidden', padding:0,
      border: fullHeight ? 'none' : '0.5px solid var(--pg-ink-200)',
      borderRadius: fullHeight ? 0 : 14,
      background:'var(--pg-ink-100)',
      isolation: 'isolate',
    }}>
      <div ref={containerRef} style={{ height:'100%', width:'100%' }}/>
    </div>
  );
}

// ── Detail view ──────────────────────────────────────────────
function QuickPoolDetails({ job, user, t, lang, applied, onApply, onUnlock, onChat, onClose, onDelete, onComplete, onStatusChange }) {
  const locked  = user.tier === 'free';
  const isOwn   = job._live && user?.uid && job.poster_id === user.uid;
  const [applicants,     setApplicants]     = React.useState([]);
  const [loadingApps,    setLoadingApps]    = React.useState(false);
  const [showApplicants, setShowApplicants] = React.useState(false);
  const [myApp,          setMyApp]          = React.useState(null);
  const [showConsent,    setShowConsent]    = React.useState(false);
  const [sharePhone,     setSharePhone]     = React.useState(false);
  const [showRating,     setShowRating]     = React.useState(false);
  const [ratingStars,    setRatingStars]    = React.useState(0);
  const [ratingComment,  setRatingComment]  = React.useState('');
  const [ratingSubmitting, setRatingSubmitting] = React.useState(false);

  // Load all applicants (owner) or own application (others)
  React.useEffect(() => {
    if (!window.sb || !job._live) return;
    if (isOwn) {
      setLoadingApps(true);
      window.sb.from('quick_pool_applications')
        .select('*').eq('job_id', job.id).order('created_at', { ascending: true })
        .then(({ data }) => { setApplicants(data || []); setLoadingApps(false); });
    } else if (user?.uid) {
      window.sb.from('quick_pool_applications')
        .select('id,status,applicant_phone').eq('job_id', job.id).eq('applicant_id', user.uid)
        .limit(1)
        .then(({ data }) => { setMyApp((data && data[0]) || null); });
    }
  }, [isOwn, job.id, user?.uid]);

  const acceptApplicant = async (appId, applicantId) => {
    if (!window.sb) return;
    await window.sb.from('quick_pool_applications').update({ status: 'accepted' }).eq('id', appId);
    await window.sb.from('quick_pool_applications').update({ status: 'rejected' }).neq('id', appId).eq('job_id', job.id);
    await window.sb.from('quick_pool_jobs').update({ status: 'filled' }).eq('id', job.id);
    // Notify rejected applicants
    applicants.forEach(a => {
      if (a.id === appId) return;
      window.sendPush && window.sendPush(a.applicant_id,
        lang==='pt' ? '❌ Candidatura não selecionada' : '❌ Application not selected',
        lang==='pt' ? `Outra pessoa foi escolhida para "${tr(job.title,lang)}". Continue tentando!` : `Someone else was chosen for "${tr(job.title,lang)}". Keep trying!`,
        '/#express-pools'
      );
    });
    setApplicants(prev => prev.map(a => ({ ...a, status: a.id === appId ? 'accepted' : 'rejected' })));
    onStatusChange && onStatusChange('filled');
    // Notify accepted applicant
    window.sendPush && window.sendPush(applicantId,
      lang==='pt' ? '🎉 Candidatura aceita!' : '🎉 Application accepted!',
      lang==='pt' ? `Sua candidatura para "${tr(job.title,lang)}" foi aceita.` : `Your application for "${tr(job.title,lang)}" was accepted.`,
      '/#express-pools'
    );
  };

  const withdrawApp = async () => {
    if (!window.sb || !myApp) return;
    await window.sb.from('quick_pool_applications').update({ status: 'withdrawn' }).eq('id', myApp.id);
    setMyApp(null);
  };

  const acceptedApp = applicants.find(a => a.status === 'accepted');

  const submitRatingAndFinalize = async () => {
    setRatingSubmitting(true);
    if (ratingStars > 0 && acceptedApp && window.sb) {
      await window.sb.from('ratings').insert({
        listing_id: job.id,
        listing_name: tr(job.title, lang),
        from_id: user.uid,
        to_id: acceptedApp.applicant_id,
        from_name: user.name || user.email || 'Pool Owner',
        stars: ratingStars,
        comment: ratingComment.trim() || null,
        pending: false,
      }).then(()=>{});
    }
    setRatingSubmitting(false);
    setShowRating(false);
    onComplete && onComplete(job.id);
  };

  return (
    <div style={{display:'flex', flexDirection:'column', minHeight:'100%'}}>
      {/* Sticky top bar with back arrow */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'calc(env(safe-area-inset-top, 0px) + 12px) 18px 12px',
        borderBottom:'0.5px solid var(--pg-ink-200)',
        position:'sticky', top:0, background:'var(--pg-bg)', zIndex:10,
      }}>
        <button onClick={onClose} style={{
          display:'flex', alignItems:'center', gap:4,
          border:'none', background:'transparent', cursor:'pointer',
          color:'var(--pg-blue-500)', fontSize:14, fontWeight:600, padding:0, fontFamily:'inherit',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          {lang==='pt'?'Piscinas Rápidas':lang==='es'?'Piscinas Rápidas':'Express Pools'}
        </button>
        {isOwn && (
          <button onClick={()=>{ onDelete && onDelete(job.id); onClose(); }} style={{
            display:'flex', alignItems:'center', gap:5, height:32, padding:'0 12px', borderRadius:9,
            border:'1px solid #FECACA', background:'#FEF2F2', cursor:'pointer', fontSize:12, fontWeight:600, color:'#DC2626',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
            {lang==='pt'?'Excluir':lang==='es'?'Eliminar':'Delete'}
          </button>
        )}
      </div>

      <div style={{padding:'16px 18px 100px', flex:1}}>
        <h2 style={{margin:0, fontFamily:'var(--pg-font-display)', fontSize:22, fontWeight:700, letterSpacing:'-0.02em', lineHeight:1.2}}>{tr(job.title, lang)}</h2>
        <div style={{display:'flex', alignItems:'center', gap:6, marginTop:8, fontSize:13, color:'var(--pg-ink-700)'}}>
          {Icon.pin(14)} {job.loc} · {tr(job.dist, lang)}
        </div>

        <div style={{
          marginTop:14, padding:'14px 16px', borderRadius:14,
          background:'var(--pg-blue-50)', border:'0.5px solid var(--pg-blue-100)',
          display:'flex', justifyContent:'space-between', alignItems:'center',
        }}>
          <div>
            <div style={{fontSize:11, color:'var(--pg-ink-500)', letterSpacing:'0.05em', fontWeight:600}}>{t.offer}</div>
            {job.price === 'neg' ? (
              <div style={{fontSize:22, fontWeight:700, marginTop:2, fontFamily:'var(--pg-font-display)'}}>{t.negotiable}</div>
            ) : (
              <div style={{fontFamily:'var(--pg-font-display)', fontSize:26, fontWeight:700, color:'var(--pg-blue-500)', letterSpacing:'-0.02em', marginTop:2}}>
                ${job.price} <span style={{fontSize:13, color:'var(--pg-ink-500)', fontWeight:500}}>· {t.perPool}</span>
              </div>
            )}
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:11, color:'var(--pg-ink-500)', letterSpacing:'0.05em', fontWeight:600}}>{t.pools}</div>
            <div style={{fontFamily:'var(--pg-font-display)', fontSize:26, fontWeight:700, letterSpacing:'-0.02em', marginTop:2}}>{job.pools}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:11, color:'var(--pg-ink-500)', letterSpacing:'0.05em', fontWeight:600}}>{t.whenLabel}</div>
            <div style={{fontSize:13, fontWeight:600, marginTop:2, maxWidth:90}}>{tr(job.when, lang)}</div>
          </div>
        </div>

        {/* Condo extras (only if condo) */}
        {job.type === 'condo' && job.extras && (
          <div className="pg-card" style={{padding:'12px 14px', marginTop:14}}>
            <div style={{fontSize:11, color:'var(--pg-ink-500)', fontWeight:600, letterSpacing:'0.05em', marginBottom:8}}>{t.accessDetails}</div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
              {job.extras.gate_code && (
                <DetailPill icon={Icon.key(14, 'var(--pg-blue-700)')} label={t.gateCode}
                  value={locked ? '••••' : job.extras.gate_code}/>
              )}
              <DetailPill icon={Icon.user(14, 'var(--pg-blue-700)')} label={t.doorman} value={job.extras.doorman ? t.yes : t.no}/>
              <DetailPill icon={Icon.dog(14, 'var(--pg-blue-700)')} label={t.dogLbl} value={job.extras.dog ? t.yes : t.no}/>
              <DetailPill icon={Icon.pool(14, 'var(--pg-blue-700)')} label={t.saltwater} value={job.extras.saltwater ? t.yes : t.no}/>
            </div>
          </div>
        )}

        <div style={{marginTop:14}}>
          <div style={{fontSize:11, color:'var(--pg-ink-500)', fontWeight:600, letterSpacing:'0.05em', marginBottom:6}}>{t.description}</div>
          <p style={{margin:0, fontSize:14, lineHeight:1.5, color:'var(--pg-ink-700)'}}>{tr(job.body, lang)}</p>
        </div>

        <div className="pg-card" style={{padding:14, marginTop:14, display:'flex', alignItems:'center', gap:12}}>
          <Avatar name={job.poster} size={48}/>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontSize:15, fontWeight:600}}>{job.poster}</div>
            <div style={{display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--pg-ink-500)', marginTop:2}}>
              <Stars rating={job.rating} size={11}/> {job.rating} · 26 {t.completedJobs}
            </div>
          </div>
          <span className="pg-chip pg-chip-aqua" style={{fontSize:11}}>{Icon.shield(11, 'var(--pg-aqua-700)')} {t.verified}</span>
        </div>

        {/* Phone + address — visible to poster OR accepted applicant */}
        {(isOwn || myApp?.status === 'accepted') && (job.poster_phone || job.pool_address) && (
          <div className="pg-card" style={{padding:'12px 14px', marginTop:12, display:'flex', flexDirection:'column', gap:10}}>
            {job.poster_phone && (
              <div style={{display:'flex', alignItems:'center', gap:10}}>
                {Icon.phone ? Icon.phone(14,'var(--pg-blue-700)') : null}
                <div style={{minWidth:0}}>
                  <div style={{fontSize:10, fontWeight:700, color:'var(--pg-ink-500)', letterSpacing:'0.05em', textTransform:'uppercase', marginBottom:2}}>
                    {lang==='pt'?'Telefone':lang==='es'?'Teléfono':'Phone'}
                  </div>
                  <a href={`tel:${job.poster_phone}`} style={{fontSize:14, fontWeight:600, color:'var(--pg-blue-600)', textDecoration:'none'}}>
                    {job.poster_phone}
                  </a>
                </div>
              </div>
            )}
            {job.pool_address && (
              <div style={{display:'flex', alignItems:'flex-start', gap:10}}>
                {Icon.pin(14,'var(--pg-blue-700)')}
                <div style={{minWidth:0}}>
                  <div style={{fontSize:10, fontWeight:700, color:'var(--pg-ink-500)', letterSpacing:'0.05em', textTransform:'uppercase', marginBottom:2}}>
                    {lang==='pt'?'Endereço':lang==='es'?'Dirección':'Address'}
                  </div>
                  <div style={{fontSize:14, fontWeight:600, color:'var(--pg-ink-900)'}}>{job.pool_address}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {locked && (
          <div style={{
            marginTop:14, padding:16, borderRadius:14, color:'#fff',
            background:'linear-gradient(135deg, var(--pg-blue-700), oklch(0.45 0.15 230))',
            display:'flex', gap:12, alignItems:'flex-start',
          }}>
            {Icon.crown(22, 'oklch(0.85 0.15 90)')}
            <div style={{flex:1}}>
              <div style={{fontFamily:'var(--pg-font-display)', fontSize:14, fontWeight:700}}>{t.premiumUnlocks}</div>
              <div style={{fontSize:12, opacity:0.85, marginTop:3, lineHeight:1.4}}>
                {t.premiumUnlocksDesc}
              </div>
              <button onClick={onUnlock} className="pg-btn pg-btn-aqua" style={{height:36, padding:'0 14px', fontSize:13, marginTop:10, borderRadius:999}}>
                {t.unlockPrice}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Applicants panel — visible to owner */}
      {isOwn && showApplicants && (
        <div style={{margin:'0 18px 16px', borderRadius:14, border:'1px solid var(--pg-ink-200)', overflow:'hidden'}}>
          <div style={{padding:'12px 14px 8px', fontSize:11, fontWeight:700, color:'var(--pg-ink-500)', letterSpacing:'0.06em', textTransform:'uppercase', background:'var(--pg-ink-50)'}}>
            {lang==='pt'?'Candidatos':lang==='es'?'Candidatos':'Applicants'} ({applicants.length})
          </div>
          {loadingApps && <div style={{padding:'14px', fontSize:13, color:'var(--pg-ink-400)', textAlign:'center'}}>...</div>}
          {!loadingApps && applicants.length === 0 && (
            <div style={{padding:'14px 14px', fontSize:13, color:'var(--pg-ink-400)'}}>
              {lang==='pt'?'Nenhuma candidatura ainda.':lang==='es'?'Ninguna candidatura aún.':'No applicants yet.'}
            </div>
          )}
          {applicants.map(a => (
            <div key={a.id} style={{
              display:'flex', alignItems:'center', gap:10, padding:'10px 14px',
              borderTop:'0.5px solid var(--pg-ink-100)',
              background: a.status==='accepted' ? '#F0FDF4' : a.status==='rejected' ? '#FFF1F1' : '#fff',
            }}>
              <Avatar name={a.applicant_name} size={34}/>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:13, fontWeight:600, color:'var(--pg-ink-900)'}}>{a.applicant_name}</div>
                {a.applicant_phone && (
                  <a href={`tel:${a.applicant_phone}`} style={{fontSize:11, color:'var(--pg-blue-600)', fontWeight:500, textDecoration:'none'}}>
                    {a.applicant_phone}
                  </a>
                )}
              </div>
              {a.status === 'accepted' ? (
                <span style={{fontSize:11, fontWeight:700, color:'#16A34A', background:'#DCFCE7', padding:'3px 8px', borderRadius:8}}>
                  {lang==='pt'?'Aceito':lang==='es'?'Aceptado':'Accepted'}
                </span>
              ) : a.status === 'rejected' ? (
                <span style={{fontSize:11, fontWeight:700, color:'#DC2626', background:'#FEE2E2', padding:'3px 8px', borderRadius:8}}>
                  {lang==='pt'?'Recusado':lang==='es'?'Rechazado':'Rejected'}
                </span>
              ) : (
                <button onClick={()=>acceptApplicant(a.id, a.applicant_id)} style={{
                  height:30, padding:'0 12px', borderRadius:8, border:'none', cursor:'pointer',
                  background:'linear-gradient(135deg,#16A34A,#22C55E)', color:'#fff', fontSize:12, fontWeight:700,
                }}>
                  {lang==='pt'?'Aceitar':lang==='es'?'Aceptar':'Accept'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Rating modal — shown to owner when marking complete */}
      {showRating && (
        <div style={{
          position:'fixed', inset:0, zIndex:9999,
          background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'flex-end',
        }}>
          <div style={{
            width:'100%', maxWidth:520, margin:'0 auto',
            background:'var(--pg-white)', borderRadius:'20px 20px 0 0',
            padding:'20px 18px 32px', boxShadow:'0 -8px 32px rgba(0,0,0,0.18)',
          }}>
            <div style={{width:40, height:4, borderRadius:4, background:'var(--pg-ink-200)', margin:'0 auto 18px'}}/>
            <h3 style={{margin:'0 0 4px', fontSize:17, fontWeight:700, textAlign:'center'}}>
              {lang==='pt'?'Como foi o serviço?':'How was the service?'}
            </h3>
            {acceptedApp && (
              <div style={{textAlign:'center', fontSize:13, color:'var(--pg-ink-500)', marginBottom:16}}>
                {acceptedApp.applicant_name}
              </div>
            )}
            <div style={{display:'flex', justifyContent:'center', gap:10, marginBottom:14}}>
              {[1,2,3,4,5].map(s=>(
                <button key={s} onClick={()=>setRatingStars(s)} style={{
                  fontSize:32, background:'transparent', border:'none', cursor:'pointer',
                  opacity: s<=ratingStars ? 1 : 0.25, transform: s<=ratingStars ? 'scale(1.1)' : 'scale(1)',
                  transition:'all 0.15s',
                }}>★</button>
              ))}
            </div>
            <textarea value={ratingComment} onChange={e=>setRatingComment(e.target.value)}
              placeholder={lang==='pt'?'Comentário opcional...':'Optional comment...'}
              style={{width:'100%',minHeight:64,borderRadius:10,border:'1px solid var(--pg-ink-200)',padding:'10px 12px',fontSize:14,fontFamily:'inherit',resize:'none',outline:'none',boxSizing:'border-box',marginBottom:12}}/>
            <div style={{display:'flex', gap:8}}>
              <button onClick={()=>{ setShowRating(false); onComplete && onComplete(job.id); }} style={{
                flex:1, height:46, borderRadius:12, border:'1px solid var(--pg-ink-200)',
                background:'var(--pg-ink-50)', color:'var(--pg-ink-600)', fontSize:13, fontWeight:600, cursor:'pointer',
              }}>
                {lang==='pt'?'Pular':'Skip'}
              </button>
              <button onClick={submitRatingAndFinalize} disabled={ratingStars===0||ratingSubmitting} style={{
                flex:2, height:46, borderRadius:12, border:'none', cursor:ratingStars===0?'default':'pointer',
                background: ratingStars>0 ? 'linear-gradient(135deg,#16A34A,#22C55E)' : 'var(--pg-ink-200)',
                color:'#fff', fontSize:14, fontWeight:700,
              }}>
                {ratingSubmitting ? '...' : (lang==='pt'?'Avaliar e finalizar':'Rate & complete')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{
        position:'sticky', bottom:0, padding:'12px 18px 16px',
        background:'linear-gradient(180deg, transparent, var(--pg-white) 25%)',
        display:'flex', flexDirection:'column', gap:8, marginTop:14,
      }}>
        {isOwn ? (
          /* Owner actions */
          <div style={{display:'flex', flexDirection:'column', gap:8}}>
            {job.status === 'filled' ? (
              <button onClick={()=>setShowRating(true)} style={{
                height:50, borderRadius:14, border:'none', cursor:'pointer',
                background:'linear-gradient(135deg,#16A34A,#22C55E)',
                color:'#fff', fontSize:15, fontWeight:700,
                display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                boxShadow:'0 4px 14px rgba(22,163,74,0.35)',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {lang==='pt'?'Finalizar e remover vaga':lang==='es'?'Finalizar y eliminar':'Mark complete & remove'}
              </button>
            ) : (
              <button onClick={()=>setShowApplicants(v=>!v)} style={{
                height:50, borderRadius:14, border:'1.5px solid var(--pg-blue-400)',
                background: showApplicants ? 'var(--pg-blue-500)' : '#fff',
                color: showApplicants ? '#fff' : 'var(--pg-blue-600)',
                fontSize:15, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                {lang==='pt'
                  ? `${showApplicants?'Fechar':'Ver'} candidatos${applicants.length>0?' ('+applicants.length+')':''}`
                  : `${showApplicants?'Close':'View'} applicants${applicants.length>0?' ('+applicants.length+')':''}`}
              </button>
            )}
          </div>
        ) : (
          /* Non-owner actions */
          <>
            {/* Address + Phone: only shown to accepted applicant */}
            {job._live && job.pool_address && myApp?.status === 'accepted' && (
              <div style={{
                display:'flex', alignItems:'flex-start', gap:10,
                padding:'12px 14px', borderRadius:12,
                background:'#F0FDF4', border:'1px solid #86EFAC',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,marginTop:1}}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <div>
                  <div style={{fontSize:11, fontWeight:700, color:'#15803D', letterSpacing:'0.04em', textTransform:'uppercase', marginBottom:2}}>
                    {lang==='pt'?'Endereço da piscina':lang==='es'?'Dirección':'Pool address'}
                  </div>
                  <div style={{fontSize:14, fontWeight:600, color:'#14532D'}}>{job.pool_address}</div>
                  <a href={`https://maps.google.com/?q=${encodeURIComponent(job.pool_address)}`} target="_blank" rel="noreferrer"
                    style={{fontSize:11, color:'#16A34A', fontWeight:600, textDecoration:'none', marginTop:2, display:'inline-block'}}>
                    {lang==='pt'?'Ver no mapa →':lang==='es'?'Ver en mapa →':'Open in Maps →'}
                  </a>
                </div>
              </div>
            )}
            {job._live && job.poster_phone && myApp?.status === 'accepted' && (
              <a href={`tel:${job.poster_phone}`} style={{
                display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                height:46, borderRadius:999, textDecoration:'none',
                background:'linear-gradient(135deg,#16A34A,#22C55E)',
                color:'#fff', fontSize:14, fontWeight:700,
              }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12 19.79 19.79 0 0 1 1.97 3.4 2 2 0 0 1 3.94 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z"/>
                </svg>
                {job.poster_phone}
              </a>
            )}

            {/* Phone consent panel — shown before applying */}
            {showConsent && (
              <div style={{
                background:'var(--pg-ink-50)', border:'1px solid var(--pg-ink-200)',
                borderRadius:14, padding:'14px 16px', marginBottom:4,
              }}>
                <p style={{margin:'0 0 12px', fontSize:13, fontWeight:600, color:'var(--pg-ink-800)', lineHeight:1.4}}>
                  {lang==='pt'
                    ? 'O dono pode ver seu número de telefone?'
                    : lang==='es'
                      ? '¿El propietario puede ver tu número?'
                      : 'Can the owner see your phone number?'}
                </p>
                <div style={{display:'flex', gap:8, marginBottom:4}}>
                  <button onClick={()=>setSharePhone(true)} style={{
                    flex:1, height:38, borderRadius:10, border: sharePhone?'2px solid #0077B6':'1px solid var(--pg-ink-200)',
                    background: sharePhone?'var(--pg-blue-50)':'var(--pg-white)',
                    color: sharePhone?'var(--pg-blue-700)':'var(--pg-ink-600)',
                    fontSize:13, fontWeight:700, cursor:'pointer',
                  }}>
                    {lang==='pt'?'Sim, compartilhar':lang==='es'?'Sí':'Yes, share'}
                  </button>
                  <button onClick={()=>setSharePhone(false)} style={{
                    flex:1, height:38, borderRadius:10, border: !sharePhone?'2px solid #0077B6':'1px solid var(--pg-ink-200)',
                    background: !sharePhone?'var(--pg-blue-50)':'var(--pg-white)',
                    color: !sharePhone?'var(--pg-blue-700)':'var(--pg-ink-600)',
                    fontSize:13, fontWeight:700, cursor:'pointer',
                  }}>
                    {lang==='pt'?'Não, só chat':lang==='es'?'No, solo chat':'No, chat only'}
                  </button>
                </div>
                <p style={{margin:'8px 0 12px', fontSize:11, color:'var(--pg-ink-400)', lineHeight:1.4}}>
                  {lang==='pt'
                    ? 'Seu número só fica visível para o dono se você escolher compartilhar.'
                    : 'Your number is only visible to the owner if you choose to share.'}
                </p>
                <button onClick={()=>{ onApply(sharePhone); setShowConsent(false); }} className="pg-btn pg-btn-primary" style={{width:'100%', height:42, borderRadius:11, fontSize:14}}>
                  {lang==='pt'?'Confirmar candidatura':lang==='es'?'Confirmar':'Confirm application'}
                </button>
              </div>
            )}

            <div style={{display:'flex', gap:8}}>
              <button onClick={()=>onChat(job.poster_id ? { id: job.poster_id, name: job.poster, listingId: 'qp_' + job.id, listingContext: { name: tr(job.title, lang) + ' · ' + job.loc, price: job.price !== 'neg' ? job.price : null, priceMode: job.price === 'neg' ? 'neg' : 'fixed', type: 'quick_pool' } } : job.poster)} disabled={locked} className="pg-btn pg-btn-ghost" style={{flex:1, opacity:locked?0.5:1, borderRadius:999}}>
                {Icon.msg(16, 'var(--pg-blue-700)')} {t.contact}
              </button>
              {job.status === 'filled' ? (
                myApp && (myApp.status === 'accepted' || myApp.status === 'rejected') ? (
                  <div style={{
                    flex:2, height:46, borderRadius:999, display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                    background: myApp.status==='accepted' ? '#F0FDF4' : '#FEF2F2',
                    border: myApp.status==='accepted' ? '1px solid #86EFAC' : '1px solid #FECACA',
                    color: myApp.status==='accepted' ? '#15803D' : '#DC2626',
                    fontSize:14, fontWeight:700,
                  }}>
                    {myApp.status==='accepted'
                      ? (lang==='pt'?'✓ Aceito':'✓ Accepted')
                      : (lang==='pt'?'Não selecionado':'Not selected')}
                  </div>
                ) : (
                  <div style={{
                    flex:2, height:46, borderRadius:999, display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                    background:'#FEF3C7', border:'1px solid #FCD34D', color:'#92400E', fontSize:14, fontWeight:700,
                  }}>
                    ⏳ {lang==='pt'?'Em curso':lang==='es'?'En curso':'In progress'}
                  </div>
                )
              ) : job._live ? (
                myApp && myApp.status === 'pending' ? (
                  <button onClick={withdrawApp} style={{
                    flex:2, height:46, borderRadius:999, border:'1px solid #FECACA',
                    background:'#FEF2F2', color:'#DC2626', fontSize:13, fontWeight:700, cursor:'pointer',
                  }}>
                    {lang==='pt'?'Retirar candidatura':'Withdraw'}
                  </button>
                ) : (
                  <button
                    onClick={locked ? onUnlock : (applied ? undefined : ()=>setShowConsent(v=>!v))}
                    disabled={applied && !locked}
                    className={`pg-btn ${applied?'pg-btn-ghost':'pg-btn-primary'}`}
                    style={{flex:2, borderRadius:999, opacity: applied?0.7:1}}
                  >
                    {locked ? <>{Icon.lock(14,'#fff')} {t.unlockApply}</> :
                     applied ? <>{Icon.check(15,'var(--pg-blue-700)')} {lang==='pt'?'Candidatado':t.applied}</> :
                     <>{lang==='pt'?'Candidatar':t.apply}</>}
                  </button>
                )
              ) : (
                <button onClick={locked ? onUnlock : ()=>setShowConsent(v=>!v)} className={`pg-btn ${applied?'pg-btn-ghost':'pg-btn-primary'}`} style={{flex:2, borderRadius:999}}>
                  {locked ? <>{Icon.lock(14, '#fff')} {t.unlockApply}</> :
                   applied ? <>{Icon.check(15, 'var(--pg-blue-700)')} {t.applied}</> :
                   <>{t.apply} — {t.fastTrack}</>}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DetailPill({ icon, label, value }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:10, background:'var(--pg-blue-50)'}}>
      {icon}
      <div style={{minWidth:0}}>
        <div style={{fontSize:10, color:'var(--pg-ink-500)', textTransform:'uppercase', letterSpacing:'0.04em'}}>{label}</div>
        <div style={{fontSize:13, fontWeight:600, marginTop:1}}>{value}</div>
      </div>
    </div>
  );
}

function PostJobSheet({ open, onClose, lang, user, darkMode=false, onPosted }) {
  const DAY_KEYS = ['mon','tue','wed','thu','fri','sat','sun'];
  const DAY_LABELS_PT = ['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'];
  const DAY_LABELS_EN = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const dayLabels = lang==='pt' ? DAY_LABELS_PT : DAY_LABELS_EN;
  const TIME_SLOTS = [
    { key:'morning',   label: lang==='pt'?'Manhã':'Morning'   },
    { key:'afternoon', label: lang==='pt'?'Tarde':'Afternoon' },
    { key:'evening',   label: lang==='pt'?'Noite':'Evening'   },
  ];

  const [title,      setTitle]      = React.useState('');
  const [city,       setCity]       = React.useState('');
  const [day,        setDay]        = React.useState('');
  const [timeSlot,   setTimeSlot]   = React.useState('');
  const [poolType,   setPoolType]   = React.useState('residential');
  const [gateCode,   setGateCode]   = React.useState('');
  const [hasDoorman, setHasDoorman] = React.useState(false);
  const [hasDog,     setHasDog]     = React.useState(false);
  const [saltwater,  setSaltwater]  = React.useState(false);
  const [desc,       setDesc]       = React.useState('');
  const [price,      setPrice]      = React.useState('');
  const [neg,        setNeg]        = React.useState(false);
  const [showPhone,  setShowPhone]  = React.useState(false);
  const [phone,      setPhone]      = React.useState(user?.phone || '');
  const [address,    setAddress]    = React.useState('');
  const [saving,     setSaving]     = React.useState(false);
  const [err,        setErr]        = React.useState('');

  const allCities = React.useMemo(() => {
    return [].concat.apply([], Object.values(window.FL_COUNTIES||{})).filter((c,i,a)=>a.indexOf(c)===i).sort();
  }, []);
  const [cityQ, setCityQ] = React.useState('');
  const filteredCities = cityQ ? allCities.filter(c=>c.toLowerCase().includes(cityQ.toLowerCase())) : allCities;

  const reset = () => {
    setTitle(''); setCity(''); setDay(''); setTimeSlot(''); setPoolType('residential');
    setGateCode(''); setHasDoorman(false); setHasDog(false); setSaltwater(false);
    setDesc(''); setPrice(''); setNeg(false); setShowPhone(false); setPhone(user?.phone||'');
    setAddress(''); setErr(''); setCityQ('');
  };

  const submit = async () => {
    if (!title.trim()) return setErr(lang==='pt'?'Adicione um título':'Add a title');
    if (!city) return setErr(lang==='pt'?'Escolha a cidade':'Choose city');
    if (!day)  return setErr(lang==='pt'?'Escolha o dia':'Choose day');
    if (!window.sb || !user?.uid) return setErr('Login required');
    setSaving(true);
    const timeLabel = timeSlot ? (' · ' + (TIME_SLOTS.find(t=>t.key===timeSlot)||{}).label||'') : '';
    const job = {
      poster_id: user.uid, poster_name: user.name || user.email || 'Pool Guy',
      poster_phone: showPhone ? (phone||null) : null, pool_address: address.trim()||null, city, day_of_week: day,
      when_label: dayLabels[DAY_KEYS.indexOf(day)] + timeLabel,
      time_slot: timeSlot || null,
      pools_count: 1, price_per_pool: neg ? null : (parseFloat(price)||null),
      price_negotiable: neg, title: title.trim(), description: desc.trim()||null,
      pool_type: poolType,
      extras: poolType==='condo' ? { gate_code: gateCode.trim()||null, doorman: hasDoorman, dog: hasDog, saltwater } : null,
      status:'open',
    };
    const { data, error } = await window.sb.from('quick_pool_jobs').insert(job).select().single();
    if (error) { setSaving(false); return setErr(error.message); }
    // Trigger push notifications for matching pool guys
    try {
      await fetch('https://xiszfqghizqzlwyrfjol.supabase.co/functions/v1/notify-quick-pool', {
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':'Bearer '+(window._pgGetTok?window._pgGetTok():'')},
        body: JSON.stringify({ job: data }),
      });
    } catch {}
    setSaving(false);
    reset();
    onClose();
    onPosted && onPosted(data);
  };

  const dm = darkMode;
  const inkBg   = dm ? 'rgba(255,255,255,0.08)' : 'var(--pg-ink-50)';
  const inkBdr   = dm ? 'rgba(255,255,255,0.12)' : 'var(--pg-ink-200)';
  const inkText  = dm ? '#fff' : 'var(--pg-ink-900)';
  const inkSub   = dm ? 'rgba(255,255,255,0.45)' : 'var(--pg-ink-500)';
  const cardBg   = dm ? 'rgba(255,255,255,0.05)' : 'var(--pg-white)';
  const inp = { width:'100%', height:44, borderRadius:10, border:`1.5px solid ${dm ? 'rgba(255,255,255,0.25)' : 'var(--pg-ink-200)'}`, background: dm ? 'rgba(255,255,255,0.14)' : 'var(--pg-ink-50)', padding:'0 12px', fontSize:16, fontFamily:'inherit', color:inkText, outline:'none', boxSizing:'border-box' };

  return (
    <Sheet open={open} onClose={()=>{ reset(); onClose(); }} height="92%">
      <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
        {/* Header */}
        <div style={{padding:'4px 18px 14px', borderBottom:`0.5px solid ${inkBdr}`}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
            <h2 style={{margin:0,fontSize:18,fontWeight:700,letterSpacing:'-0.02em',color:inkText}}>
              {lang==='pt'?'Publicar vaga':lang==='es'?'Publicar trabajo':'Post a job'}
            </h2>
            <button onClick={()=>{ reset(); onClose(); }} style={{border:'none',background:inkBg,width:30,height:30,borderRadius:'50%',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
              {Icon.x(16,inkText)}
            </button>
          </div>
          <p style={{margin:0,fontSize:12,color:inkSub,lineHeight:1.4}}>
            {lang==='pt'?'Pool guys com essa cidade e dia configurados serão notificados na hora.':'Pool guys with this city and day configured will be notified instantly.'}
          </p>
        </div>

        {/* Body */}
        <div style={{flex:1,overflow:'auto',padding:'16px 18px',display:'flex',flexDirection:'column',gap:14}}>

          {/* Title */}
          <div>
            <label style={{fontSize:12,fontWeight:700,color:inkSub,letterSpacing:'0.04em',textTransform:'uppercase',display:'block',marginBottom:6}}>
              {lang==='pt'?'Título':'Title'}
            </label>
            <input value={title} onChange={e=>setTitle(e.target.value)}
              placeholder={lang==='pt'?'Ex: Limpeza em Davie':'E.g. Pool cleaning in Davie'}
              style={inp}/>
          </div>

          {/* City */}
          <div>
            <label style={{fontSize:12,fontWeight:700,color:inkSub,letterSpacing:'0.04em',textTransform:'uppercase',display:'block',marginBottom:6}}>
              {lang==='pt'?'Cidade':'City'}
            </label>
            {city ? (
              <div style={{display:'flex',alignItems:'center',gap:8,height:44,borderRadius:10,border:'1.5px solid var(--pg-blue-500)',background:dm?'rgba(0,119,182,0.18)':'var(--pg-blue-50)',padding:'0 12px'}}>
                <span style={{flex:1,fontSize:14,fontWeight:600,color:dm?'#60BBFF':'var(--pg-blue-700)'}}>{city}</span>
                <button onClick={()=>setCity('')} style={{border:'none',background:'transparent',cursor:'pointer',padding:2}}>{Icon.x(14,inkSub)}</button>
              </div>
            ) : (
              <>
                <input value={cityQ} onChange={e=>setCityQ(e.target.value)} placeholder={lang==='pt'?'Buscar cidade...':'Search city...'} style={{...inp,marginBottom:6}}/>
                <div style={{maxHeight:140,overflow:'auto',border:`1px solid ${inkBdr}`,borderRadius:10,background:cardBg}}>
                  {filteredCities.slice(0,30).map(c=>(
                    <button key={c} onClick={()=>{ setCity(c); setCityQ(''); }} style={{display:'block',width:'100%',textAlign:'left',padding:'9px 12px',border:'none',background:'transparent',cursor:'pointer',fontSize:13,fontWeight:500,color:inkText,borderBottom:`0.5px solid ${inkBdr}`}}>
                      {c}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Day */}
          <div>
            <label style={{fontSize:12,fontWeight:700,color:inkSub,letterSpacing:'0.04em',textTransform:'uppercase',display:'block',marginBottom:6}}>
              {lang==='pt'?'Dia da semana':'Day of week'}
            </label>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6}}>
              {DAY_KEYS.map((dk,i)=>{
                const on = dk===day;
                return (
                  <button key={dk} onClick={()=>setDay(dk)} style={{
                    padding:'8px 4px',borderRadius:9,border:'1px solid '+(on?'var(--pg-blue-500)':inkBdr),
                    background:on?'var(--pg-blue-500)':inkBg,
                    color:on?'#fff':inkText,fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit',
                  }}>{dayLabels[i].slice(0,3)}</button>
                );
              })}
            </div>
          </div>

          {/* Time slot */}
          <div>
            <label style={{fontSize:12,fontWeight:700,color:inkSub,letterSpacing:'0.04em',textTransform:'uppercase',display:'block',marginBottom:6}}>
              {lang==='pt'?'Horário':'Time'}
            </label>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}}>
              {TIME_SLOTS.map(ts=>{
                const on = ts.key===timeSlot;
                return (
                  <button key={ts.key} onClick={()=>setTimeSlot(on?'':ts.key)} style={{
                    padding:'9px 4px',borderRadius:9,border:'1px solid '+(on?'var(--pg-blue-500)':inkBdr),
                    background:on?'var(--pg-blue-500)':inkBg,
                    color:on?'#fff':inkText,fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit',
                  }}>{ts.label}</button>
                );
              })}
            </div>
          </div>

          {/* Pool type */}
          <div>
            <label style={{fontSize:12,fontWeight:700,color:inkSub,letterSpacing:'0.04em',textTransform:'uppercase',display:'block',marginBottom:6}}>
              {lang==='pt'?'Tipo':'Type'}
            </label>
            <div style={{display:'flex',gap:6}}>
              {['residential','condo'].map(pt=>{
                const on = poolType===pt;
                const lbl = pt==='residential'?(lang==='pt'?'Residencial':'Residential'):(lang==='pt'?'Condomínio':'Condo');
                return (
                  <button key={pt} onClick={()=>setPoolType(pt)} style={{
                    flex:1,padding:'10px 4px',borderRadius:9,
                    border:'1px solid '+(on?'var(--pg-blue-500)':inkBdr),
                    background:on?'var(--pg-blue-500)':inkBg,
                    color:on?'#fff':inkText,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit',
                  }}>{lbl}</button>
                );
              })}
            </div>
          </div>

          {/* Condo extras */}
          {poolType==='condo' && (
            <div style={{borderRadius:12,border:`1px solid ${inkBdr}`,padding:'12px 14px',background:inkBg,display:'flex',flexDirection:'column',gap:10}}>
              <div style={{fontSize:11,fontWeight:700,color:inkSub,letterSpacing:'0.04em',textTransform:'uppercase',marginBottom:2}}>
                {lang==='pt'?'Detalhes do condomínio':'Condo details'}
              </div>
              <input value={gateCode} onChange={e=>setGateCode(e.target.value)}
                placeholder={lang==='pt'?'Código do portão (opcional)':'Gate code (optional)'}
                style={{...inp,height:40,fontSize:13}}/>
              {[
                { key:'doorman', state:hasDoorman, set:setHasDoorman, label:lang==='pt'?'Tem porteiro':'Has doorman' },
                { key:'dog',     state:hasDog,     set:setHasDog,     label:lang==='pt'?'Tem cachorro':'Has dog'     },
                { key:'salt',    state:saltwater,  set:setSaltwater,  label:lang==='pt'?'Água salgada':'Saltwater'   },
              ].map(item=>(
                <label key={item.key} style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:13,color:inkText,fontWeight:500}}>
                  <input type="checkbox" checked={item.state} onChange={e=>item.set(e.target.checked)} style={{width:16,height:16,accentColor:'var(--pg-blue-500)'}}/>
                  {item.label}
                </label>
              ))}
            </div>
          )}

          {/* Description */}
          <div>
            <label style={{fontSize:12,fontWeight:700,color:inkSub,letterSpacing:'0.04em',textTransform:'uppercase',display:'block',marginBottom:6}}>
              {lang==='pt'?'Descrição':'Description'}
            </label>
            <textarea value={desc} onChange={e=>setDesc(e.target.value)}
              placeholder={lang==='pt'?'Ex: Piscina residencial, produto no local, portão com código...':'E.g. Residential pool, chemicals on site, gate code required...'}
              style={{width:'100%',minHeight:80,borderRadius:10,border:`1px solid ${inkBdr}`,background:inkBg,padding:'10px 12px',fontSize:14,fontFamily:'inherit',resize:'none',outline:'none',color:inkText,boxSizing:'border-box'}}/>
          </div>

          {/* Price */}
          <div>
            <label style={{fontSize:12,fontWeight:700,color:inkSub,letterSpacing:'0.04em',textTransform:'uppercase',display:'block',marginBottom:6}}>
              {lang==='pt'?'$/piscina':'$/pool'}
            </label>
            <div style={{position:'relative'}}>
              <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontSize:14,color:neg?inkSub:inkText,fontWeight:600}}>$</span>
              <input type="number" value={price} onChange={e=>setPrice(e.target.value)} disabled={neg}
                placeholder="45" style={{...inp,paddingLeft:24,opacity:neg?0.4:1}}/>
            </div>
            <label style={{display:'flex',alignItems:'center',gap:6,marginTop:6,cursor:'pointer',fontSize:12,color:inkSub}}>
              <input type="checkbox" checked={neg} onChange={e=>setNeg(e.target.checked)} style={{width:14,height:14}}/>
              {lang==='pt'?'A combinar':'Negotiable'}
            </label>
          </div>

          {/* Phone visibility toggle */}
          <div style={{borderRadius:14,border:`1px solid ${inkBdr}`,overflow:'hidden'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 16px',cursor:'pointer',background:cardBg}}
              onClick={()=>setShowPhone(v=>!v)}>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:inkText,marginBottom:2}}>
                  {lang==='pt'?'Mostrar telefone para candidato aceito?':lang==='es'?'¿Mostrar teléfono al candidato aceptado?':'Show phone to accepted candidate?'}
                </div>
                <div style={{fontSize:11,color:inkSub}}>
                  {lang==='pt'?'Apenas quem você aceitar terá acesso ao seu número.':'Only the candidate you accept will see your number.'}
                </div>
              </div>
              {/* Toggle */}
              <div style={{
                width:44,height:26,borderRadius:999,flexShrink:0,marginLeft:12,
                background:showPhone?'#0077B6':inkBdr,
                position:'relative',transition:'background .2s',
              }}>
                <div style={{
                  position:'absolute',top:3,left:showPhone?18:3,width:20,height:20,
                  borderRadius:'50%',background:'#fff',transition:'left .2s',
                  boxShadow:'0 1px 4px rgba(0,0,0,0.2)',
                }}/>
              </div>
            </div>
            {showPhone && (
              <div style={{padding:'0 16px 14px',borderTop:`0.5px solid ${inkBdr}`,background:inkBg}}>
                <label style={{fontSize:11,fontWeight:700,color:inkSub,letterSpacing:'0.04em',textTransform:'uppercase',display:'block',margin:'12px 0 6px'}}>
                  {lang==='pt'?'Seu telefone':'Your phone'}
                </label>
                <input value={phone} onChange={e=>setPhone(e.target.value)} type="tel"
                  placeholder="(954) 000-0000" style={inp}/>
              </div>
            )}
          </div>

          {/* Address — revealed only to accepted candidate */}
          <div style={{borderRadius:14,border:`1px solid ${inkBdr}`,overflow:'hidden',background:cardBg}}>
            <div style={{padding:'14px 16px'}}>
              <div style={{fontSize:13,fontWeight:700,color:inkText,marginBottom:2}}>
                {lang==='pt'?'Endereço da piscina':lang==='es'?'Dirección de la piscina':'Pool address'}
              </div>
              <div style={{fontSize:11,color:inkSub,marginBottom:10}}>
                {lang==='pt'?'Visível apenas para o candidato que você aceitar.':'Only visible to the candidate you accept.'}
              </div>
              <input value={address} onChange={e=>setAddress(e.target.value)} type="text"
                placeholder={lang==='pt'?'Ex: 123 Palm Ave, Davie, FL 33325':'E.g. 123 Palm Ave, Davie, FL 33325'}
                style={inp}/>
            </div>
          </div>

          {err && <div style={{background:'#FEE2E2',borderRadius:9,padding:'9px 12px',fontSize:13,color:'#DC2626',fontWeight:500}}>{err}</div>}
        </div>

        {/* Submit */}
        <div style={{padding:'12px 18px 18px',borderTop:`0.5px solid ${inkBdr}`}}>
          <button onClick={submit} disabled={saving} className="pg-btn pg-btn-primary" style={{width:'100%',height:50,fontSize:15,borderRadius:14}}>
            {saving
              ? (lang==='pt'?'Publicando...':'Posting...')
              : (lang==='pt'?'Publicar agora':'Post now')}
          </button>
        </div>
      </div>
    </Sheet>
  );
}

Object.assign(window, { QuickPoolsScreen });
