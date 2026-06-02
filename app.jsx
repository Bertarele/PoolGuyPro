// app.jsx — root, tab routing, overlays

// ── Feedback Sheet ────────────────────────────────────────────
function FeedbackSheet({ open, onClose, lang }) {
  React.useEffect(() => {
    if (open) { _lockScreen(); return () => _unlockScreen(); }
  }, [open]);
  const [rating,   setRating]   = React.useState(0);
  const [hovered,  setHovered]  = React.useState(0);
  const [category, setCategory] = React.useState('');
  const [text,     setText]     = React.useState('');
  const [sent,     setSent]     = React.useState(false);

  const cats = lang === 'pt'
    ? [{ id:'bug', label:'🐛 Bug' }, { id:'sugestao', label:'💡 Sugestão' }, { id:'elogio', label:'👏 Elogio' }]
    : lang === 'es'
    ? [{ id:'bug', label:'🐛 Bug' }, { id:'sugestao', label:'💡 Sugerencia' }, { id:'elogio', label:'👏 Cumplido' }]
    : [{ id:'bug', label:'🐛 Bug' }, { id:'sugestao', label:'💡 Suggestion' }, { id:'elogio', label:'👏 Compliment' }];

  const title = lang==='pt' ? 'Enviar Feedback' : lang==='es' ? 'Enviar Feedback' : 'Send Feedback';
  const subLbl = lang==='pt' ? 'Como está sendo sua experiência?' : lang==='es' ? '¿Cómo es tu experiencia?' : 'How is your experience so far?';
  const catLbl = lang==='pt' ? 'Tipo de feedback' : lang==='es' ? 'Tipo de feedback' : 'Feedback type';
  const commentLbl = lang==='pt' ? 'Comentário (opcional)' : lang==='es' ? 'Comentario (opcional)' : 'Comment (optional)';
  const placeholder = lang==='pt' ? 'O que você achou? Algo que não funcionou?' : lang==='es' ? '¿Qué te pareció? ¿Algo que no funcionó?' : 'What did you think? Anything that didn\'t work?';
  const sendLbl = lang==='pt' ? 'Enviar Feedback' : lang==='es' ? 'Enviar Feedback' : 'Send Feedback';
  const thankLbl = lang==='pt' ? '🎉 Obrigado pelo feedback!' : lang==='es' ? '🎉 ¡Gracias por tu feedback!' : '🎉 Thanks for your feedback!';
  const thankSub = lang==='pt' ? 'Sua opinião ajuda a melhorar o app.' : lang==='es' ? 'Tu opinión ayuda a mejorar la app.' : 'Your input helps improve the app.';
  const closeLbl = lang==='pt' ? 'Fechar' : lang==='es' ? 'Cerrar' : 'Close';

  const handleSend = () => {
    const subject = encodeURIComponent(`[PoolGuyX Beta] ${category || 'Feedback'} — ${rating}⭐`);
    const body = encodeURIComponent(
      `Rating: ${'⭐'.repeat(rating)} (${rating}/5)\nType: ${category || 'general'}\n\n${text || '(no comment)'}`
    );
    window.open(`mailto:feedback@usapoolmarket.com?subject=${subject}&body=${body}`, '_blank');
    setSent(true);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => { setRating(0); setCategory(''); setText(''); setSent(false); setHovered(0); }, 400);
  };

  if (!open) return null;

  return (
    <div className="pg-sheet-backdrop" onClick={handleClose}>
      <div className="pg-sheet" style={{padding:'0 0 32px'}} onClick={e=>e.stopPropagation()}>
        <div className="pg-sheet-grabber"/>

        {/* Header */}
        <div style={{padding:'12px 20px 16px', borderBottom:'0.5px solid var(--pg-ink-200)'}}>
          <div style={{fontFamily:'var(--pg-font-display)', fontSize:17, fontWeight:700, color:'var(--pg-ink-900)'}}>
            {title}
          </div>
          <div style={{fontSize:13, color:'var(--pg-ink-500)', marginTop:3}}>{subLbl}</div>
        </div>

        {sent ? (
          /* ── Thank you state ── */
          <div style={{padding:'40px 24px', display:'flex', flexDirection:'column', alignItems:'center', gap:12, textAlign:'center'}}>
            <div style={{fontSize:52}}>🎉</div>
            <div style={{fontFamily:'var(--pg-font-display)', fontSize:18, fontWeight:700, color:'var(--pg-ink-900)'}}>{thankLbl}</div>
            <div style={{fontSize:13, color:'var(--pg-ink-500)', maxWidth:240}}>{thankSub}</div>
            <button onClick={handleClose} style={{
              marginTop:16, height:46, padding:'0 32px', borderRadius:12, border:'none',
              background:'var(--pg-blue-500)', color:'#fff', fontSize:14, fontWeight:700,
              cursor:'pointer', fontFamily:'inherit',
            }}>{closeLbl}</button>
          </div>
        ) : (
          <div style={{padding:'20px 20px 8px', display:'flex', flexDirection:'column', gap:20}}>

            {/* Star rating */}
            <div>
              <div style={{fontSize:11, fontWeight:700, letterSpacing:'0.07em', color:'var(--pg-ink-500)', marginBottom:10, textTransform:'uppercase'}}>
                Rating
              </div>
              <div style={{display:'flex', gap:6}}>
                {[1,2,3,4,5].map(n => (
                  <button key={n}
                    onClick={()=>setRating(n)}
                    onMouseEnter={()=>setHovered(n)}
                    onMouseLeave={()=>setHovered(0)}
                    style={{
                      fontSize:34, background:'none', border:'none', cursor:'pointer',
                      padding:'0 2px', lineHeight:1,
                      filter: n <= (hovered || rating) ? 'none' : 'grayscale(1) opacity(0.35)',
                      transform: n <= (hovered || rating) ? 'scale(1.15)' : 'scale(1)',
                      transition:'all .12s ease',
                    }}>⭐</button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <div style={{fontSize:11, fontWeight:700, letterSpacing:'0.07em', color:'var(--pg-ink-500)', marginBottom:10, textTransform:'uppercase'}}>
                {catLbl}
              </div>
              <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                {cats.map(c => (
                  <button key={c.id} onClick={()=>setCategory(c.id)} style={{
                    padding:'7px 14px', borderRadius:999, border:'1.5px solid',
                    borderColor: category===c.id ? 'var(--pg-blue-500)' : 'var(--pg-ink-200)',
                    background: category===c.id ? 'var(--pg-blue-50)' : 'var(--pg-white)',
                    color: category===c.id ? 'var(--pg-blue-700)' : 'var(--pg-ink-700)',
                    fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
                    transition:'all .12s',
                  }}>{c.label}</button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <div style={{fontSize:11, fontWeight:700, letterSpacing:'0.07em', color:'var(--pg-ink-500)', marginBottom:8, textTransform:'uppercase'}}>
                {commentLbl}
              </div>
              <textarea
                className="pg-textarea"
                value={text}
                onChange={e=>setText(e.target.value)}
                placeholder={placeholder}
                style={{minHeight:90, fontSize:14}}
              />
            </div>

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={rating === 0}
              style={{
                width:'100%', height:50, borderRadius:14, border:'none', cursor: rating>0 ? 'pointer' : 'not-allowed',
                fontFamily:'inherit', fontSize:15, fontWeight:700,
                background: rating > 0 ? 'linear-gradient(135deg, #007AFF 0%, #0056CC 100%)' : 'var(--pg-ink-200)',
                color: rating > 0 ? '#fff' : 'var(--pg-ink-400)',
                boxShadow: rating > 0 ? '0 6px 20px rgba(0,122,255,0.30)' : 'none',
                transition:'all .2s',
              }}
            >{sendLbl}</button>
          </div>
        )}
      </div>
    </div>
  );
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "tier": "free",
  "lang": "en",
  "density": "regular",
  "showDevControls": true
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [tab, setTab] = React.useState('home');
  const screenRef = React.useRef(null);

  const switchTab = React.useCallback((newTab) => {
    setTab(newTab);
    // Scroll to top whenever a new tab is selected
    requestAnimationFrame(() => {
      if (screenRef.current) screenRef.current.scrollTop = 0;
    });
  }, []);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [user, setUser] = React.useState({
    name:'', email:'', uid:'', role:'user', tier: t.tier, rating: 4.9, reviews: 128,
    regions:['Broward','Weston','Plantation'],
    // Profile fields — pre-filled on job applications
    age: 31,
    region: 'Fort Lauderdale, FL',
    hasCar: true,
    hasLicense: true,
    hasEquipment: true,
    equipment: {
      en: ['Pentair VS pump', 'Pool vacuum robot', 'Chemical test kit'],
      pt: ['Bomba Pentair VS', 'Robô aspirador', 'Kit de teste químico'],
      es: ['Bomba Pentair VS', 'Robot aspiradora', 'Kit de prueba química'],
    },
    experience: [
      { company: 'Self-employed',
        role: {en:'Independent Pool Technician', pt:'Técnico de Piscinas Autônomo', es:'Técnico de Piscinas Independiente'},
        duration: {en:'4+ yrs', pt:'4+ anos', es:'4+ años'},
        desc: {en:'Managed my own service route with 30+ regular clients across Broward County. Chemical balancing, equipment repair, client relations.',
               pt:'Gerenciei minha própria rota com 30+ clientes fixos no Broward County. Balanceamento químico, reparos e atendimento ao cliente.',
               es:'Gestioné mi propia ruta con 30+ clientes fijos en el Condado de Broward. Balance químico, reparaciones y atención al cliente.'} },
    ],
  });
  const loadProfile = React.useCallback(async (sbUser) => {
    if (!sbUser || !window.sb) return;
    // Set uid+email immediately — doesn't need DB, ensures isMyPost() works even if query fails
    setUser(u => ({ ...u, uid: sbUser.id, email: sbUser.email }));

    let { data: profile, error: pErr } = await window.sb.from('profiles').select('*').eq('id', sbUser.id).single();
    if (pErr) {
      console.warn('[loadProfile] DB error:', pErr.message, '— using cached role');
      // Use last known role from localStorage as fallback (set on successful login)
      const cachedRole = (() => { try { return localStorage.getItem('pg_role') || 'user'; } catch(e) { return 'user'; } })();
      setUser(u => ({ ...u, role: cachedRole }));
      return;
    }
    // If no profile row exists, create a minimal one so the app works correctly
    if (!profile) {
      const fallbackName = sbUser.email ? sbUser.email.split('@')[0] : '';
      await window.sb.from('profiles').insert({ id: sbUser.id, name: fallbackName, role: 'user' });
      profile = { name: fallbackName, role: 'user', phone: '', region: '', photo_url: '' };
    }
    // Cache role for future sessions (used as fallback if DB is unreachable on page reload)
    if (profile?.role) { try { localStorage.setItem('pg_role', profile.role); } catch(e) {} }
    // Sanitize: never use an email address as a display name
    const rawName = profile?.name || '';
    const cleanName = (rawName && !rawName.includes('@')) ? rawName : '';
    setUser(u => ({
      ...u,
      name:     cleanName,
      phone:    profile?.phone    || '',
      region:   profile?.region   || '',
      role:     profile?.role     || 'user',
      photoUrl: profile?.photo_url || '',
      email:    sbUser.email,
      uid:      sbUser.id,
    }));
  }, []);

  // authReady gates the data fetch — ensures profile is loaded before querying DB
  const [authReady, setAuthReady] = React.useState(false);

  const handleAuthLogin = React.useCallback(async (sbUser) => {
    setIsLoggedIn(true);
    await loadProfile(sbUser);
  }, [loadProfile]);

  // ── Boot sequence: getSession → refresh token → loadProfile → signal ready ──
  // Must complete BEFORE data fetch runs (authReady gates it)
  React.useEffect(() => {
    // Force logout hook — called by Supabase client when token refresh fails (deleted account)
    window.__pgForceLogout = () => {
      setIsLoggedIn(false);
      setTab('home');
      setUser(u => ({ ...u, name:'', email:'', uid:'', role:'user' }));
    };
    if (!window.sb) { setAuthReady(true); return; }
    (async () => {
      try {
        const { data: { session } } = await window.sb.auth.getSession();
        if (session) {
          // Refresh token before anything else
          if (window.sb.auth.refresh) await window.sb.auth.refresh().catch(() => {});
          // Load profile — sets user.name, uid, role
          await handleAuthLogin(session.user);
        }
      } catch(e) {
        console.warn('[Auth] Session restore failed:', e.message);
      } finally {
        setAuthReady(true); // always ungate, even if no session
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [lang, setLangState] = React.useState(t.lang);
  // Per-weekday region preferences for notifications
  const [regionsByDay, setRegionsByDay] = React.useState({
    mon: ['Pompano Beach','Fort Lauderdale'],
    tue: ['Deerfield Beach','Boca Raton'],
    wed: ['Pompano Beach','Fort Lauderdale'],
    thu: ['Plantation','Davie'],
    fri: ['Weston','Plantation'],
    sat: [],
    sun: [],
  });
  const [county] = React.useState('Broward');

  // Overlays
  const [chatOpen,         setChatOpen]        = React.useState(false);
  const [chatConvoTarget,  setChatConvoTarget]  = React.useState(null); // string | { id, name }
  const [notifOpen,      setNotifOpen]      = React.useState(false);
  const [payOpen,        setPayOpen]        = React.useState(false);
  const [postMenuOpen,   setPostMenuOpen]   = React.useState(false);
  const [postQPOpen,     setPostQPOpen]     = React.useState(false);
  const [regionOpen,     setRegionOpen]     = React.useState(false);
  const [langPickerOpen, setLangPickerOpen] = React.useState(false);
  const [applicantsPost, setApplicantsPost] = React.useState(null);
  const [verifyOpen,     setVerifyOpen]     = React.useState(false);
  const [pushNotifOpen,  setPushNotifOpen]  = React.useState(false);
  const [toast,          setToast]          = React.useState(null);
  const [walletOpen,     setWalletOpen]     = React.useState(false);
  const [feedbackOpen,   setFeedbackOpen]   = React.useState(false);
  const [jobDetailApp,   setJobDetailApp]   = React.useState(null);
  const [reviewApp,      setReviewApp]      = React.useState(null);
  const [marketPostOpen, setMarketPostOpen] = React.useState(false);
  const [vacSheetOpen,   setVacSheetOpen]   = React.useState(false);
  const [hiringSheetOpen,setHiringSheetOpen]= React.useState(false);
  const [techSheetOpen,  setTechSheetOpen]  = React.useState(false);
  const [dayPickerVac,   setDayPickerVac]   = React.useState(null);
  const [scheduleApp,    setScheduleApp]    = React.useState(null);
  const [hiringAppDetail,setHiringAppDetail]= React.useState(null);
  const [applyJob,       setApplyJob]       = React.useState(null);
  const [editProfileOpen,setEditProfileOpen]= React.useState(false);
  const [publicProfileUser, setPublicProfileUser] = React.useState(null);
  const [helpOpen,       setHelpOpen]        = React.useState(false);
  const [privacyOpen,    setPrivacyOpen]     = React.useState(false);

  // ── Dark mode ─────────────────────────────────────────────────
  const [darkMode, setDarkModeState] = React.useState(() => {
    try { return localStorage.getItem('pg_dark') === '1'; } catch(e) { return false; }
  });
  React.useEffect(() => {
    const stage = document.getElementById('stage');
    if (stage) stage.setAttribute('data-pg-dark', darkMode ? '1' : '0');
    try { localStorage.setItem('pg_dark', darkMode ? '1' : '0'); } catch(e) {}
  }, [darkMode]);
  const toggleDark = React.useCallback(() => setDarkModeState(v => !v), []);

  // ── Live Firestore data ────────────────────────────────────
  const [liveJobs,      setLiveJobs]      = React.useState([]);
  const [liveTechs,     setLiveTechs]     = React.useState([]);
  const [liveVacations, setLiveVacations] = React.useState([]);
  const [liveMarket,    setLiveMarket]    = React.useState([]);

  React.useEffect(() => {
    if (!window.sb || !authReady) return;

    // Normalizers — Supabase uses snake_case columns
    const normJob = r => ({ _id:r.id, _live:true, role:r.role, loc:r.loc, desc:r.description,
      contract:r.contract, payMode:r.pay_mode, pay:r.pay,
      carReq:r.car_req, equipReq:r.equip_req, author:r.author, author_id:r.author_id||null });
    const normTech = r => ({ _id:r.id, _live:true, name:r.name, specialty:r.specialty,
      loc:r.loc, phone:r.phone, email:r.email,
      rateMode:r.rate_mode, rate:r.rate, author:r.author, author_id:r.author_id||null });
    const normVac = r => ({ _id:r.id, _live:true, monthIdx:r.month_idx, year:r.year,
      selectedDays:r.selected_days, weekdayRegions:r.weekday_regions,
      poolsPerWeekday:r.pools_per_weekday, price:r.price,
      priceMode:r.price_mode, author:r.author, author_id:r.author_id||null });
    const normMkt = r => ({ _id:r.id, _live:true, type:r.type, name:r.name, cat:r.cat,
      condition:r.condition, price:r.price, priceMode:r.price_mode,
      loc:r.loc, routeName:r.route_name, clients:r.clients,
      revenue:r.revenue, asking:r.asking, area:r.area,
      description: r.description || '',
      author:r.author, author_id:r.author_id || null,
      photoUrl: r.photo_url || null,
      photoUrls: (r.photo_urls && r.photo_urls.length > 0) ? r.photo_urls : (r.photo_url ? [r.photo_url] : []),
      rentPeriod: r.rent_period || 'day',
      status: r.status || 'pending',
      createdAt: r.created_at || null });

    // Data fetch — runs AFTER auth is ready (authReady gate above)
    // Token was already refreshed in the boot sequence, so this should always work
    const doFetch = async () => {
      const [j, tc, v, m] = await Promise.all([
        window.sb.from('jobs').select('*').order('created_at', { ascending: false }),
        window.sb.from('techs').select('*').order('created_at', { ascending: false }),
        window.sb.from('vacations').select('*').order('created_at', { ascending: false }),
        window.sb.from('marketplace').select('*').order('created_at', { ascending: false }),
      ]);
      if (j.data)  setLiveJobs(j.data.map(normJob));
      if (tc.data) setLiveTechs(tc.data.map(normTech));
      if (v.data)  setLiveVacations(v.data.map(normVac));
      if (m.data)  setLiveMarket(m.data.map(normMkt));
      // Log errors but never call signOut here — auth layer manages sessions
      if (m.error) console.warn('[Supabase] marketplace fetch error:', m.error.message);
    };
    doFetch().catch(e => console.warn('[Supabase] fetch:', e.message));

    // Real-time subscriptions
    const channel = window.sb.channel('app-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'jobs' },
        p => setLiveJobs(prev => [normJob(p.new), ...prev]))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'techs' },
        p => setLiveTechs(prev => [normTech(p.new), ...prev]))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'vacations' },
        p => setLiveVacations(prev => [normVac(p.new), ...prev]))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'marketplace' },
        p => setLiveMarket(prev => [normMkt(p.new), ...prev]))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'marketplace' },
        p => setLiveMarket(prev => prev.map(m => m._id === p.new.id ? normMkt(p.new) : m)))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'marketplace' },
        p => setLiveMarket(prev => prev.filter(m => m._id !== p.old.id)))
      .subscribe(status => {
        if (status === 'SUBSCRIBED') console.log('[Supabase] real-time ativo ✓');
      });

    return () => { window.sb.removeChannel(channel); };
  }, [authReady]); // runs once authReady flips true — guaranteed after token refresh + loadProfile

  // Helper: insert row into Supabase
  const dbWrite = React.useCallback((col, data) => {
    if (!window.sb) return;
    // Always use profile name; never leak email as author
    const authorName = (user.name && !user.name.includes('@')) ? user.name : (user.email ? user.email.split('@')[0] : 'User');
    const row = col === 'jobs' ? {
      role: data.role, loc: data.loc, contract: data.contract,
      pay_mode: data.payMode, pay: data.pay, car_req: data.carReq,
      equip_req: data.equipReq, description: data.desc,
      author: authorName, author_id: user.uid || null,
    } : col === 'techs' ? {
      name: data.name, specialty: data.specialty, loc: data.loc,
      phone: data.phone, email: data.email,
      rate_mode: data.rateMode, rate: data.rate,
      author: authorName, author_id: user.uid || null,
    } : col === 'vacations' ? {
      month_idx: data.monthIdx, year: data.year,
      selected_days: data.selectedDays, weekday_regions: data.weekdayRegions,
      pools_per_weekday: data.poolsPerWeekday,
      price: data.price, price_mode: data.priceMode,
      author: authorName, author_id: user.uid || null,
    } : col === 'marketplace' ? {
      type: data.type, name: data.name, cat: data.cat,
      condition: data.condition, price: data.price,
      price_mode: data.priceMode, loc: data.loc,
      description: data.description || null,
      route_name: data.routeName, clients: data.clients,
      revenue: data.revenue, asking: data.asking, area: data.area,
      author: authorName, author_id: user.uid || null,
      photo_url: data.photoUrl || null,
      photo_urls: (data.photos && data.photos.length > 0) ? data.photos : (data.photoUrl ? [data.photoUrl] : []),
      rent_period: data.rentPeriod || null,
      status: 'pending',
    } : { ...data, author: authorName };

    return window.sb.from(col).insert(row)
      .then(({ error }) => {
        if (error) {
          console.error('[Supabase] insert error:', error.message);
          setToast('❌ ' + (error.message || 'Erro ao publicar'));
          setTimeout(() => setToast(null), 3000);
          return false;
        }
        return true;
      });
  }, [user.name]);

  // Sync tier tweak → user state
  React.useEffect(()=>{ setUser(u=>({...u, tier:t.tier})); }, [t.tier]);

  const setLang = (l) => {
    setLangState(l);
    setTweak('lang', l);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(()=>setToast(null), 2400);
  };

  const ctx = {
    user,
    setUser: (u) => {
      const next = typeof u === 'function' ? u(user) : u;
      setUser(next);
      if (next.tier !== t.tier) setTweak('tier', next.tier);
    },
    lang, setLang,
    regionsByDay, setRegionsByDay, county,
    goTab:              switchTab,
    openChat:           (target=null) => { setChatConvoTarget(target); setChatOpen(true); },
    openNotifications:  () => setNotifOpen(true),
    openPaywall:        () => setPayOpen(true),
    openPostMenu:       () => setPostMenuOpen(true),
    openPost:           () => setPostQPOpen(true),
    openMarketPost:     () => setMarketPostOpen(true),
    closeMarketPost:    () => setMarketPostOpen(false),
    marketPostOpen,
    openRegionEditor:   () => setRegionOpen(true),
    openLanguagePicker: () => setLangPickerOpen(true),
    openApplicants:     (post) => setApplicantsPost(post),
    openVerification:   () => setVerifyOpen(true),
    openPushNotif:      () => setPushNotifOpen(true),
    openWallet:         () => setWalletOpen(true),
    openJobDetail:      (app) => setJobDetailApp(app),
    openReview:         (app) => setReviewApp(app),
    openVacSheet:       () => setVacSheetOpen(true),
    openHiringSheet:    () => setHiringSheetOpen(true),
    openTechSheet:      () => setTechSheetOpen(true),
    openDayPicker:      (vac) => setDayPickerVac(vac),
    openSchedule:       (app) => setScheduleApp(app),
    openHiringAppDetail:(app) => setHiringAppDetail(app),
    openApplyJob:       (job) => setApplyJob(job),
    openEditProfile:    ()    => setEditProfileOpen(true),
    openFeedback:       ()    => setFeedbackOpen(true),
    openPublicProfile:  (u)   => setPublicProfileUser(u),
    openHelp:           ()    => setHelpOpen(true),
    openPrivacy:        ()    => setPrivacyOpen(true),
    darkMode, toggleDark,
    onLogout: () => {
      if (window.sb) window.sb.auth.signOut();
      setIsLoggedIn(false);
      setTab('home');
      setUser(u => ({ ...u, name:'', email:'', uid:'', role:'user' }));
    },
    // Live Firestore data
    liveJobs, liveTechs, liveVacations, liveMarket,
    dbWrite, showToast,
    // Admin: remove items from local state immediately (fallback if realtime is slow)
    removeMarketItem:  (id) => setLiveMarket(prev    => prev.filter(m => m._id !== id)),
    removeJob:         (id) => setLiveJobs(prev      => prev.filter(j => j._id !== id)),
    removeTech:        (id) => setLiveTechs(prev     => prev.filter(t => t._id !== id)),
    removeVacation:    (id) => setLiveVacations(prev => prev.filter(v => v._id !== id)),
  };

  // Build confirmed-day map from accepted vacation applications (for conflict detection)
  const confirmedDays = React.useMemo(() => {
    return VACATIONS_APPLIED
      .filter(v => v.status === 'accepted' && v.yearMonth)
      .flatMap(v => (v.selectedDays || v.days).map(d => ({
        key: `${v.yearMonth.year}-${v.yearMonth.month}-${d}`,
        owner: v.owner,
      })));
  }, []);

  // Build initial convo from target — target can be a string (name only) or { id, name }
  const initialConvo = React.useMemo(() => {
    if (!chatConvoTarget) return null;
    const isObj = typeof chatConvoTarget === 'object' && chatConvoTarget !== null;
    const receiverName = isObj ? chatConvoTarget.name : String(chatConvoTarget);
    const receiverId   = isObj ? (chatConvoTarget.id || null) : null;
    return {
      receiverId,
      name: receiverName,
      context: { en:'Direct message', pt:'Mensagem direta', es:'Mensaje directo' },
    };
  }, [chatConvoTarget, chatOpen]);

  // ── Responsive: detect desktop vs mobile ─────────────────────
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);
  React.useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // ── Desktop sidebar nav items ─────────────────────────────────
  const desktopNavItems = [
    { id:'home',    emoji:'🏠', label: lang==='pt'?'Início':lang==='es'?'Inicio':'Home' },
    { id:'market',  emoji:'🏪', label: lang==='pt'?'Mercado':lang==='es'?'Mercado':'Marketplace' },
    { id:'quick',   emoji:'🏊', label: 'Quick Pools' },
    { id:'work',    emoji:'💼', label: lang==='pt'?'Trabalho':lang==='es'?'Trabajo':'Work' },
    { id:'profile', emoji:'👤', label: lang==='pt'?'Perfil':lang==='es'?'Perfil':'Profile' },
  ];
  const desktopTabLabel = desktopNavItems.find(n=>n.id===tab);

  // ── Shared overlays (used in both mobile and desktop) ─────────
  const OverlayBundle = () => (
    <>
      <ChatSheet open={chatOpen}
        onClose={()=>{ setChatOpen(false); setChatConvoTarget(null); }}
        lang={lang} initialConvo={initialConvo} currentUser={user}/>
      <NotificationsSheet open={notifOpen} onClose={()=>setNotifOpen(false)} lang={lang}/>
      <PaywallSheet open={payOpen} onClose={()=>setPayOpen(false)} setUser={ctx.setUser} lang={lang}/>
      <PostMenuSheet open={postMenuOpen} onClose={()=>setPostMenuOpen(false)}
        onPickQuickPool={()=>setPostQPOpen(true)} lang={lang}/>
      <Sheet open={postQPOpen} onClose={()=>setPostQPOpen(false)} height="92%">
        <PostQuickPool
          lang={lang}
          onClose={()=>setPostQPOpen(false)}
          onSubmit={()=>{
            setPostQPOpen(false);
            showToast(STRINGS[lang].toastPosted);
            setTab('quick');
          }}
        />
      </Sheet>
      <Toast message={toast}/>
      <RegionEditorSheet
        open={regionOpen} onClose={()=>setRegionOpen(false)} lang={lang}
        regionsByDay={regionsByDay} setRegionsByDay={setRegionsByDay}
        county={county}
      />
      <LanguagePickerSheet
        open={langPickerOpen} onClose={()=>setLangPickerOpen(false)}
        lang={lang} setLang={setLang}
      />
      <ApplicantsSheet
        open={!!applicantsPost}
        onClose={()=>setApplicantsPost(null)}
        post={applicantsPost}
        lang={lang}
        onChat={(name)=>{ setApplicantsPost(null); setChatConvoName(name); setChatOpen(true); }}
      />
      <VerificationSheet open={verifyOpen} onClose={()=>setVerifyOpen(false)} lang={lang}/>
      <WalletSheet open={walletOpen} onClose={()=>setWalletOpen(false)} lang={lang}/>
      <WorkLifecycleSheet
        open={!!jobDetailApp} onClose={()=>setJobDetailApp(null)}
        app={jobDetailApp} lang={lang}
        onReview={(app)=>{ setJobDetailApp(null); setReviewApp(app); }}/>
      <ReviewSheet
        open={!!reviewApp} onClose={()=>setReviewApp(null)}
        app={reviewApp} lang={lang}
        onSubmitDone={()=>{ setReviewApp(null); showToast(lang==='pt'?'Avaliação enviada ✓':lang==='es'?'Reseña enviada ✓':'Review submitted ✓'); }}/>
      <Sheet open={vacSheetOpen} onClose={()=>setVacSheetOpen(false)} height="92%">
        <PostVacationSheet
          lang={lang}
          onClose={()=>setVacSheetOpen(false)}
          onSubmit={(data)=>{ setVacSheetOpen(false); if(data) dbWrite('vacations', data); showToast(lang==='pt'?'Férias publicadas ✓':lang==='es'?'Vacaciones publicadas ✓':'Vacation posted ✓'); }}
        />
      </Sheet>
      <Sheet open={!!dayPickerVac} onClose={()=>setDayPickerVac(null)} height="88%">
        <VacationDayPickerSheet
          vac={dayPickerVac} lang={lang}
          confirmedDays={confirmedDays}
          onClose={()=>setDayPickerVac(null)}
          onSubmit={()=>setDayPickerVac(null)}
        />
      </Sheet>
      <Sheet open={hiringSheetOpen} onClose={()=>setHiringSheetOpen(false)} height="80%">
        <PostHiringSheet
          lang={lang}
          onClose={()=>setHiringSheetOpen(false)}
          onSubmit={(data)=>{ setHiringSheetOpen(false); if(data) dbWrite('jobs', data); showToast(lang==='pt'?'Vaga publicada ✓':lang==='es'?'Empleo publicado ✓':'Job posted ✓'); }}
        />
      </Sheet>
      <Sheet open={techSheetOpen} onClose={()=>setTechSheetOpen(false)} height="80%">
        <PostTechSheet
          lang={lang}
          onClose={()=>setTechSheetOpen(false)}
          onSubmit={(data)=>{ setTechSheetOpen(false); if(data) dbWrite('techs', data); showToast(lang==='pt'?'Perfil publicado ✓':lang==='es'?'Perfil publicado ✓':'Profile posted ✓'); }}
        />
      </Sheet>
      <ApplyJobSheet
        open={!!applyJob} onClose={()=>setApplyJob(null)}
        job={applyJob} user={user} lang={lang}
        onEditProfile={()=>setEditProfileOpen(true)}
        onSubmit={()=>{ setApplyJob(null); showToast(lang==='pt'?'Candidatura enviada ✓':lang==='es'?'Postulación enviada ✓':'Application sent ✓'); }}/>
      <EditProfileSheet
        open={editProfileOpen} onClose={()=>setEditProfileOpen(false)}
        user={user} setUser={ctx.setUser} lang={lang}/>
      <PublicProfileSheet
        open={!!publicProfileUser}
        onClose={()=>setPublicProfileUser(null)}
        profile={publicProfileUser}
        lang={lang}
        onChat={(name)=>{ setPublicProfileUser(null); setChatConvoName(name); setChatOpen(true); }}
      />
      <HelpSheet open={helpOpen} onClose={()=>setHelpOpen(false)} lang={lang}/>
      <PrivacySheet open={privacyOpen} onClose={()=>setPrivacyOpen(false)} lang={lang}/>
      <HiringAppDetailSheet
        open={!!hiringAppDetail} onClose={()=>setHiringAppDetail(null)}
        app={hiringAppDetail} lang={lang}/>
      <Sheet open={!!scheduleApp} onClose={()=>setScheduleApp(null)} height="95%">
        <ScheduleSheet
          app={scheduleApp} lang={lang}
          onClose={()=>setScheduleApp(null)}
        />
      </Sheet>
      <PushNotifSheet
        open={pushNotifOpen} onClose={()=>setPushNotifOpen(false)} lang={lang}
        onEnabled={()=>{ setPushNotifOpen(false); showToast(lang==='pt'?'Notificações ativadas ✓':lang==='es'?'Notificaciones activadas ✓':'Notifications enabled ✓'); }}/>
      <FeedbackSheet open={feedbackOpen} onClose={()=>setFeedbackOpen(false)} lang={lang}/>
    </>
  );

  // ════════════════════════════════════════════════════════════════
  // DESKTOP LAYOUT
  // ════════════════════════════════════════════════════════════════
  if (!isMobile) {
    // Display name: never show raw email — use name from profile, fallback to username part of email
  const displayName = (user.name && !user.name.includes('@'))
    ? user.name
    : (user.email ? user.email.split('@')[0] : 'User');
  const avatarLetter = (displayName[0] || '?').toUpperCase();
    return (
      <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',background:'var(--pg-bg)',position:'relative',overflow:'hidden'}}>

        {/* ── Top header bar ── */}
        <header style={{
          height:56, flexShrink:0, zIndex:20,
          background:'linear-gradient(90deg,#0a1628 0%,#0d1f3c 220px,#fff 220px)',
          borderBottom:'1px solid rgba(0,0,0,0.10)',
          display:'flex', alignItems:'center', gap:0,
          boxShadow:'0 2px 8px rgba(0,0,0,0.10)',
        }}>
          {/* Logo — aligned with sidebar */}
          <div style={{
            width:220, flexShrink:0, padding:'0 20px',
            display:'flex', alignItems:'center', gap:10,
          }}>
            <div style={{
              width:32, height:32, borderRadius:9,
              background:'linear-gradient(135deg,#007AFF 0%,#38bdf8 100%)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:18, boxShadow:'0 2px 8px rgba(0,122,255,0.45)',
            }}>🌊</div>
            <div>
              <div style={{fontFamily:'var(--pg-font-display)',fontSize:15,fontWeight:800,color:'#fff',lineHeight:1.1,letterSpacing:'-0.02em'}}>PoolGuyX</div>
              <div style={{fontSize:8.5,color:'rgba(255,255,255,0.45)',letterSpacing:'0.08em',textTransform:'uppercase',lineHeight:1}}>Florida Pool Network</div>
            </div>
          </div>

          {/* Page title */}
          <div style={{flex:1, padding:'0 28px', display:'flex', alignItems:'center', gap:12}}>
            {isLoggedIn && desktopTabLabel && (
              <span style={{fontSize:16,fontWeight:700,color:'#1C1C1E',letterSpacing:'-0.01em'}}>
                {desktopTabLabel.label}
              </span>
            )}
          </div>

          {/* Right actions */}
          <div style={{padding:'0 16px', display:'flex', alignItems:'center', gap:8}}>
            {isLoggedIn && (
              <>
                {/* Post button */}
                {(tab==='market'||tab==='quick'||tab==='work') && (
                  <button onClick={tab==='market'?()=>setMarketPostOpen(true):tab==='quick'?()=>setPostQPOpen(true):()=>setPostMenuOpen(true)} style={{
                    height:34, padding:'0 16px', borderRadius:9, border:'none',
                    background:'linear-gradient(135deg,#007AFF 0%,#0056CC 100%)',
                    color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer',
                    fontFamily:'inherit', display:'flex', alignItems:'center', gap:6,
                    boxShadow:'0 2px 8px rgba(0,122,255,0.30)',
                  }}>
                    <span style={{fontSize:14}}>+</span>
                    {lang==='pt'?'Publicar':lang==='es'?'Publicar':'Post'}
                  </button>
                )}
                {/* Notifications */}
                <button onClick={()=>setNotifOpen(true)} style={{
                  width:34, height:34, borderRadius:9, border:'1px solid rgba(0,0,0,0.09)',
                  background:'#f5f5f5', display:'flex', alignItems:'center', justifyContent:'center',
                  cursor:'pointer', fontSize:16,
                }}>🔔</button>
                {/* User avatar + name */}
                <div style={{display:'flex',alignItems:'center',gap:8,padding:'4px 10px',borderRadius:9,border:'1px solid rgba(0,0,0,0.09)',background:'#f5f5f5',cursor:'pointer'}}
                  onClick={()=>switchTab('profile')}>
                  <div style={{
                    width:26,height:26,borderRadius:'50%',
                    background:'linear-gradient(135deg,#007AFF,#0056CC)',
                    display:'flex',alignItems:'center',justifyContent:'center',
                    color:'#fff',fontSize:11,fontWeight:700,flexShrink:0,
                  }}>{avatarLetter}</div>
                  <span style={{fontSize:12,fontWeight:600,color:'#1C1C1E',maxWidth:120,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                    {displayName}
                  </span>
                </div>
                {/* Logout */}
                <button onClick={ctx.onLogout} style={{
                  height:34, padding:'0 12px', borderRadius:9,
                  border:'1px solid rgba(0,0,0,0.09)', background:'#f5f5f5',
                  color:'#8E8E93', fontSize:12, cursor:'pointer', fontFamily:'inherit',
                }}>
                  {lang==='pt'?'Sair':lang==='es'?'Salir':'Logout'}
                </button>
              </>
            )}
          </div>
        </header>

        {/* ── Body: sidebar + content ── */}
        <div style={{flex:1, display:'flex', overflow:'hidden', position:'relative'}}>

          {/* Sidebar */}
          {isLoggedIn && (
            <nav style={{
              width:220, flexShrink:0,
              background:'linear-gradient(180deg,#0a1628 0%,#0d1f3c 100%)',
              display:'flex', flexDirection:'column',
              padding:'20px 10px 16px',
              overflowY:'auto', zIndex:5,
            }}>
              {desktopNavItems.map(item => (
                <button key={item.id} onClick={()=>switchTab(item.id)} style={{
                  display:'flex', alignItems:'center', gap:11,
                  padding:'11px 14px', borderRadius:11, border:'none', cursor:'pointer',
                  background: tab===item.id ? 'rgba(0,122,255,0.22)' : 'transparent',
                  color: tab===item.id ? '#fff' : 'rgba(255,255,255,0.55)',
                  fontWeight: tab===item.id ? 700 : 500,
                  fontSize:14, fontFamily:'inherit',
                  textAlign:'left', marginBottom:3,
                  transition:'all .14s',
                  borderLeft: tab===item.id ? '3px solid #007AFF' : '3px solid transparent',
                }}>
                  <span style={{fontSize:18,lineHeight:1}}>{item.emoji}</span>
                  <span>{item.label}</span>
                </button>
              ))}

              <div style={{flex:1}}/>

              {/* Dark mode toggle */}
              <button onClick={toggleDark} style={{
                display:'flex', alignItems:'center', gap:11,
                padding:'10px 14px', borderRadius:11, border:'none', cursor:'pointer',
                background: darkMode ? 'rgba(245,158,11,0.12)' : 'transparent',
                color: darkMode ? '#F59E0B' : 'rgba(255,255,255,0.35)',
                fontSize:13, fontFamily:'inherit', textAlign:'left', transition:'all .15s',
              }}>
                {darkMode
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                }
                <span>{darkMode ? 'Light mode' : 'Dark mode'}</span>
              </button>

              <button onClick={()=>setFeedbackOpen(true)} style={{
                display:'flex', alignItems:'center', gap:11,
                padding:'10px 14px', borderRadius:11, border:'none', cursor:'pointer',
                background:'transparent', color:'rgba(255,255,255,0.35)',
                fontSize:13, fontFamily:'inherit', textAlign:'left',
              }}>
                <span style={{fontSize:16}}>💬</span>
                <span>Feedback</span>
              </button>

              {/* Divider */}
              <div style={{height:'1px', background:'rgba(255,255,255,0.08)', margin:'6px 4px'}}/>

              {/* Logout */}
              <button onClick={ctx.onLogout} style={{
                display:'flex', alignItems:'center', gap:11,
                padding:'10px 14px', borderRadius:11, border:'none', cursor:'pointer',
                background:'transparent', color:'rgba(239,68,68,0.55)',
                fontSize:13, fontFamily:'inherit', textAlign:'left', transition:'all .15s',
              }}
                onMouseEnter={e=>{ e.currentTarget.style.background='rgba(239,68,68,0.10)'; e.currentTarget.style.color='#EF4444'; }}
                onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(239,68,68,0.55)'; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                <span>{lang==='pt'?'Sair':lang==='es'?'Salir':'Log out'}</span>
              </button>
            </nav>
          )}

          {/* Main content — position:relative so screens can use position:absolute inside */}
          <div style={{flex:1, position:'relative', overflow:'hidden', background:'var(--pg-bg)'}}>
            {!isLoggedIn ? (
              /* Login — centered card */
              <div style={{
                position:'absolute', inset:0, overflowY:'auto',
                display:'flex', alignItems:'center', justifyContent:'center',
                background:'linear-gradient(135deg,#eef2f7 0%,#e8f0fe 100%)',
                padding:'40px 24px',
              }}>
                <div style={{
                  background:'var(--pg-white)', borderRadius:24,
                  boxShadow:'0 20px 60px rgba(0,0,0,0.12)',
                  overflow:'hidden', width:'100%', maxWidth:420,
                }}>
                  <LoginScreen onLogin={handleAuthLogin} lang={lang} setLang={setLang}/>
                </div>
              </div>
            ) : (
              /* Screens — position:absolute so height:100% inside screens resolves correctly,
                 fixing scroll. ref goes here so switchTab scrolls to top. */
              <div ref={screenRef} data-pg-screen style={{
                position:'absolute', inset:0, overflowY:'auto', overflowX:'hidden',
              }}>
                {tab==='home'    && <HomeScreen ctx={ctx}/>}
                {tab==='market'  && <MarketplaceScreen ctx={ctx}/>}
                {tab==='quick'   && <QuickPoolsScreen ctx={ctx}/>}
                {tab==='work'    && <WorkScreen ctx={ctx}/>}
                {tab==='profile' && <ProfileScreen ctx={ctx}/>}
              </div>
            )}
          </div>
        </div>

        {/* Overlays */}
        <OverlayBundle/>

        {/* Tweaks panel */}
        <TweaksPanel>
          <TweakSection label="Subscription tier"/>
          <TweakRadio value={t.tier} options={['free','premium','pro']}
            onChange={v=>{ setTweak('tier', v); }}/>
          <TweakSection label="Language"/>
          <TweakRadio value={lang} options={['en','pt','es']}
            onChange={v=>setLang(v)}/>
          <TweakSection label="Quick jumps"/>
          <TweakButton onClick={()=>setIsLoggedIn(false)}>Show login screen</TweakButton>
          <TweakButton onClick={()=>setChatOpen(true)}>Open chat</TweakButton>
          <TweakButton onClick={()=>setPayOpen(true)}>Open paywall</TweakButton>
          <TweakButton onClick={()=>setNotifOpen(true)}>Open notifications</TweakButton>
        </TweaksPanel>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // MOBILE LAYOUT
  // ════════════════════════════════════════════════════════════════
  return (
    <div style={{
      width:'100%', height:'100%', position:'relative', overflow:'hidden',
      background:'var(--pg-bg)',
    }}>

      {/* ── Login screen ── */}
      {!isLoggedIn && (
        <div style={{position:'absolute', inset:0, overflow:'auto'}}>
          <LoginScreen onLogin={handleAuthLogin} lang={lang} setLang={setLang}/>
        </div>
      )}

      {/* ── Main app ── */}
      {isLoggedIn && (
        <>
          {/* Screen content */}
          <div ref={screenRef} data-pg-screen style={{position:'absolute', inset:0, paddingBottom:72, overflow:'auto'}}>
            {tab === 'home'    && <HomeScreen ctx={ctx}/>}
            {tab === 'market'  && <MarketplaceScreen ctx={ctx}/>}
            {tab === 'quick'   && <QuickPoolsScreen ctx={ctx}/>}
            {tab === 'work'    && <WorkScreen ctx={ctx}/>}
            {tab === 'profile' && <ProfileScreen ctx={ctx}/>}
          </div>

          {/* Tab bar */}
          <TabBar tab={tab} setTab={switchTab} lang={lang}/>

          {/* Floating action button */}
          {(tab === 'market' || tab === 'quick') && (
            <button
              onClick={tab === 'market' ? ()=>setMarketPostOpen(true) : ()=>setPostQPOpen(true)}
              className="pg-press"
              style={{
                position:'absolute', bottom:86, right:18, zIndex:35,
                width:56, height:56, borderRadius:'50%', padding:0,
                display:'inline-flex', alignItems:'center', justifyContent:'center',
                background:'linear-gradient(135deg, #0EBAC7 0%, #0D7280 100%)',
                border:'none', cursor:'pointer',
                boxShadow:'0 6px 20px rgba(14,186,199,0.45), 0 2px 8px rgba(0,0,0,0.18)',
              }}>
              {Icon.plus(24,'#fff')}
            </button>
          )}
        </>
      )}

      {/* Overlays */}
      <OverlayBundle/>

      {/* Tweaks */}
      <TweaksPanel>
        <TweakSection label="Subscription tier"/>
        <TweakRadio value={t.tier} options={['free','premium','pro']}
          onChange={v=>{ setTweak('tier', v); }}/>
        <div style={{fontSize:10, color:'rgba(41,38,27,.55)', lineHeight:1.4, marginTop:-4}}>
          Free = Quick Pools locked. Premium/PRO unlock apply + contact.
        </div>

        <TweakSection label="Language"/>
        <TweakRadio value={lang} options={['en','pt','es']}
          onChange={v=>setLang(v)}/>

        <TweakSection label="Quick jumps"/>
        <TweakButton onClick={()=>setIsLoggedIn(false)}>Show login screen</TweakButton>
        <TweakButton onClick={()=>{ setTab('quick'); }}>Open Quick Pools</TweakButton>
        <TweakButton onClick={()=>setPostMenuOpen(true)}>Open post menu</TweakButton>
        <TweakButton onClick={()=>setPostQPOpen(true)}>Open Post Quick Pool form</TweakButton>
        <TweakButton onClick={()=>setChatOpen(true)}>Open chat</TweakButton>
        <TweakButton onClick={()=>setPayOpen(true)}>Open paywall</TweakButton>
        <TweakButton onClick={()=>setNotifOpen(true)}>Open notifications</TweakButton>
        <TweakButton onClick={()=>setLangPickerOpen(true)}>Open language picker</TweakButton>
        <TweakButton onClick={()=>setApplicantsPost(MY_POSTS[0])}>Open applicants</TweakButton>
        <TweakButton onClick={()=>setWalletOpen(true)}>Open wallet</TweakButton>
        <TweakButton onClick={()=>setJobDetailApp(MY_APPLICATIONS[0])}>Job lifecycle (hired)</TweakButton>
        <TweakButton onClick={()=>setJobDetailApp(MY_APPLICATIONS[1])}>Job lifecycle (in progress)</TweakButton>
        <TweakButton onClick={()=>setReviewApp(MY_APPLICATIONS[3])}>Open review sheet</TweakButton>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
