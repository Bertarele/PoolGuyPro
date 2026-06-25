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
  const _savedTier = (typeof localStorage !== 'undefined' && localStorage.getItem('pg_tier')) || null;
  const [t, setTweak] = useTweaks({ ...TWEAK_DEFAULTS, ...(_savedTier ? { tier: _savedTier } : {}) });
  // If launched via a listing deep link, start on market tab; otherwise restore from URL hash
  // Hash format: #tab  OR  #tab/sub  (e.g. #work/vac, #market/routes)
  const [tab, setTab] = React.useState(() => {
    try {
      const hash = window.location.hash.replace(/^#\/?/, '');
      const base = hash.split(/[/?]/)[0];
      const VALID = ['home','market','quick','work','profile'];
      if (VALID.includes(base)) return base;
      return new URLSearchParams(window.location.search).get('listing') ? 'market' : 'home';
    } catch(e) { return 'home'; }
  });

  // Keep URL hash in sync with active tab — preserve sub-segment when already on same base
  React.useEffect(() => {
    try {
      const cur = window.location.hash.replace(/^#\/?/, '');
      const curBase = cur.split(/[/?]/)[0];
      // If already on this tab and has a sub-segment or query params, preserve it
      if (curBase === tab && (cur.includes('/') || cur.includes('?'))) return;
      window.history.replaceState(null, '', '#' + tab);
    } catch(e) {}
  }, [tab]);

  // Sync tab when user navigates with browser back/forward buttons
  React.useEffect(() => {
    const onHash = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      const base = hash.split('/')[0];
      const VALID = ['home','market','quick','work','profile'];
      if (VALID.includes(base)) setTab(base);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const screenRef = React.useRef(null);

  // ── Pull-to-refresh ──────────────────────────────────────────
  const pullStartY  = React.useRef(null);
  const [pullDist,  setPullDist]  = React.useState(0);  // px pulled (0-80)
  const [refreshing,setRefreshing]= React.useState(false);
  const PULL_THRESHOLD = 64;

  const onPTRTouchStart = React.useCallback((e) => {
    if (screenRef.current && screenRef.current.scrollTop === 0) {
      pullStartY.current = e.touches[0].clientY;
    }
  }, []);

  const onPTRTouchMove = React.useCallback((e) => {
    if (pullStartY.current === null) return;
    const dy = e.touches[0].clientY - pullStartY.current;
    if (dy > 0) setPullDist(Math.min(dy * 0.55, 80));
    else { pullStartY.current = null; setPullDist(0); }
  }, []);

  const onPTRTouchEnd = React.useCallback(() => {
    if (pullDist >= PULL_THRESHOLD) {
      setRefreshing(true);
      setPullDist(PULL_THRESHOLD);
      setTimeout(() => window.location.reload(), 600);
    } else {
      setPullDist(0);
    }
    pullStartY.current = null;
  }, [pullDist]);

  const switchTab = React.useCallback((newTab) => {
    setTab(prev => {
      // Double-tap Home → reload page
      if (prev === 'home' && newTab === 'home') { window.location.reload(); return prev; }
      return newTab;
    });
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
      name:                 cleanName,
      phone:                profile?.phone    || '',
      region:               profile?.region   || '',
      role:                 profile?.role     || 'user',
      photoUrl:             profile?.photo_url || '',
      email:                sbUser.email,
      uid:                  sbUser.id,
      verified:             profile?.verified             || false,
      verificationRequested:profile?.verification_requested || false,
      phoneVerified:        profile?.phone_verified        || false,
      banned:               profile?.banned                || false,
    }));
    // Load regionsByDay from profile if saved
    if (profile?.regions_by_day && Object.keys(profile.regions_by_day).length > 0) {
      setRegionsByDay(profile.regions_by_day);
    }
  }, []);

  // authReady gates the data fetch — ensures profile is loaded before querying DB
  const [authReady, setAuthReady] = React.useState(false);

  // Hide splash screen once auth is resolved (app is ready to show UI)
  React.useEffect(() => {
    if (authReady && window.__pgHideSplash) window.__pgHideSplash();
  }, [authReady]);

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
          // Fire-and-forget: token refresh + profile load run in background
          // so data fetch (jobs/market) starts immediately without waiting for them
          window.sb.auth.refresh && window.sb.auth.refresh().catch(() => {});
          handleAuthLogin(session.user); // non-blocking — sets user + isLoggedIn when done
        }
      } catch(e) {
        console.warn('[Auth] Session restore failed:', e.message);
      } finally {
        setAuthReady(true); // ungate data fetch immediately — public tables need no auth
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [lang, setLangState] = React.useState(() => {
    try { return localStorage.getItem('pg_lang') || t.lang; } catch(e) { return t.lang; }
  });
  // Per-weekday region preferences for notifications (loaded from Supabase on login)
  const [regionsByDay, setRegionsByDay] = React.useState({mon:[],tue:[],wed:[],thu:[],fri:[],sat:[],sun:[]});

  const saveRegionsByDay = React.useCallback(async (rbd) => {
    if (!window.sb || !user?.uid) return;
    try { await window.sb.from('profiles').update({ regions_by_day: rbd }).eq('id', user.uid); } catch {}
  }, [user?.uid]);
  // Derive county from user.region (city → county lookup via FL_COUNTIES)
  const county = (() => {
    const FL = window.FL_COUNTIES || {};
    const region = user.region || '';
    if (region) {
      for (const [c, cities] of Object.entries(FL)) {
        if (region === c || region === c + ' County') return c;
        if (Array.isArray(cities) && cities.includes(region)) return c;
      }
    }
    const allCities = [].concat.apply([], Object.values(regionsByDay)).filter(Boolean);
    for (const city of allCities) {
      for (const [c, cities] of Object.entries(FL)) {
        if (Array.isArray(cities) && cities.includes(city)) return c;
      }
    }
    return 'Broward';
  })();


  // ── Real unread chat count from Supabase ─────────────────────
  const recheckUnread = React.useCallback(async () => {
    if (!window.sb) return;
    try {
      const { data } = await window.sb.rpc('get_my_unread_count', {});
      setHasUnreadChat(typeof data === 'number' ? data > 0 : false);
    } catch(e) {}
  }, []);

  // Poll unread every 30s while logged in
  React.useEffect(() => {
    if (!isLoggedIn) return;
    recheckUnread();
    const timer = setInterval(recheckUnread, 30000);
    return () => clearInterval(timer);
  }, [isLoggedIn, recheckUnread]);

  // ── Load pending ratings (transactions where user needs to rate) ─────────
  const loadPendingRatings = React.useCallback(async () => {
    if (!window.sb || !user?.uid) return;
    try {
      const { data } = await window.sb.from('ratings')
        .select('id,listing_id,listing_name,from_id,from_name,to_id,stars,created_at')
        .eq('from_id', user.uid)
        .eq('pending', true)
        .order('created_at', { ascending: true });
      setPendingRatings(data || []);
    } catch(e) {}
  }, [user?.uid]);

  React.useEffect(() => {
    if (isLoggedIn && user?.uid) {
      loadPendingRatings();
      loadLiveApplications(user.uid); // load immediately on login, not just on 30s poll
    }
  }, [isLoggedIn, user?.uid, loadPendingRatings]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Push notification subscription ─────────────────────────────
  const VAPID_PUBLIC = 'BC5W23IjAHOReRjCYC3MtRac1YMPSaodjgrhXXwWWCzHHCvAm7KgZG8_eeDcKK2w_wqbsVBHgHpbdcxZtors-5g';

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(base64);
    return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
  }

  // Global helper: fire-and-forget push to another user via Edge Function
  window.sendPush = async function(userId, title, body, url) {
    try {
      await fetch('https://xiszfqghizqzlwyrfjol.supabase.co/functions/v1/send-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, title, body, url }),
      });
    } catch(e) {}
  };

  const [pushLog, setPushLog] = React.useState('');
  const _setPushLog = (msg) => { setPushLog(msg); try { localStorage.setItem('pg_push_log', msg); } catch{} };

  const _registerPush = React.useCallback(async () => {
    if (!user?.uid) return;
    _setPushLog('iniciando...');
    if (!('serviceWorker' in navigator)) { _setPushLog('❌ serviceWorker não suportado'); return; }
    if (!('PushManager' in window))      { _setPushLog('❌ PushManager indisponível — abra pelo ícone da Home Screen'); return; }
    _setPushLog('pedindo permissão...');
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') { _setPushLog('❌ permissão negada: ' + permission); return; }
    _setPushLog('aguardando service worker...');
    try {
      const reg = await navigator.serviceWorker.ready;
      _setPushLog('criando subscription...');
      const existing = await reg.pushManager.getSubscription();
      const sub = existing || await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
      });
      const j = sub.toJSON();
      _setPushLog('salvando no banco...');
      const { error } = await window.sb.from('push_subscriptions').upsert({
        user_id:  user.uid,
        endpoint: j.endpoint,
        p256dh:   j.keys.p256dh,
        auth:     j.keys.auth,
      }, { onConflict: 'user_id,endpoint' });
      if (error) { _setPushLog('❌ upsert falhou: ' + error.message); return; }
      _setPushLog('✅ notificações ativas');
    } catch(e) { _setPushLog('❌ erro: ' + (e.message || String(e))); }
  }, [user?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (!isLoggedIn || !user?.uid) return;
    const t = setTimeout(_registerPush, 2000);
    return () => clearTimeout(t);
  }, [isLoggedIn, user?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  // Overlays
  const [chatOpen,         setChatOpen]        = React.useState(false);
  const [chatConvoTarget,  setChatConvoTarget]  = React.useState(null); // string | { id, name }
  const [pendingQuickJobId, setPendingQuickJobId] = React.useState(() => {
    try {
      const hash = window.location.hash; // e.g. "#quick?job=uuid"
      const qs = hash.includes('?') ? hash.slice(hash.indexOf('?') + 1) : '';
      const jobId = new URLSearchParams(qs).get('job') || null;
      // Strip ?job= from URL so refresh doesn't re-open the job
      if (jobId) window.history.replaceState(null, '', '#quick');
      return jobId;
    } catch { return null; }
  });
  const [notifOpen,      setNotifOpen]      = React.useState(false);
  // Unread badges — derived from real Supabase data
  const [hasUnreadChat,  setHasUnreadChat]  = React.useState(false);
  const [hasUnreadNotif, setHasUnreadNotif] = React.useState(false);
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
  const [editingVac,     setEditingVac]     = React.useState(null); // vac object being edited
  const [hiringSheetOpen,setHiringSheetOpen]= React.useState(false);
  const [techSheetOpen,  setTechSheetOpen]  = React.useState(false);
  const [dayPickerVac,   setDayPickerVac]   = React.useState(null);
  const [scheduleApp,    setScheduleApp]    = React.useState(null);
  const [hiringAppDetail,setHiringAppDetail]= React.useState(null);
  const [applyJob,       setApplyJob]       = React.useState(null);
  const [editProfileOpen,setEditProfileOpen]= React.useState(false);
  const [publicProfileUser, setPublicProfileUser] = React.useState(null);
  const [helpOpen,         setHelpOpen]        = React.useState(false);
  const [privacyOpen,      setPrivacyOpen]     = React.useState(false);
  const [pendingRatings,   setPendingRatings]  = React.useState([]); // ratings to submit
  const [activeRating,     setActiveRating]    = React.useState(null); // current RatingSheet
  const [ratingPromptOpen, setRatingPromptOpen] = React.useState(false); // buyer popup
  const ratingPromptShownThisVisit = React.useRef(false); // avoid double-showing per tab visit

  // ── Buyer rating prompt: show centered popup on home tab visit ─
  // Reset "shown" flag every time user leaves home tab (so next visit shows again)
  React.useEffect(() => {
    if (tab !== 'home') {
      ratingPromptShownThisVisit.current = false;
    }
  }, [tab]);
  // Show popup when user arrives on home tab and has pending ratings
  React.useEffect(() => {
    if (tab === 'home' && pendingRatings.length > 0 && !ratingPromptShownThisVisit.current) {
      ratingPromptShownThisVisit.current = true;
      const timer = setTimeout(() => setRatingPromptOpen(true), 600);
      return () => clearTimeout(timer);
    }
  }, [tab, pendingRatings.length]); // eslint-disable-line

  // ── Deep link — ?listing=ID opens a specific listing ─────────
  const [deepLinkListingId, setDeepLinkListingId] = React.useState(() => {
    try { return new URLSearchParams(window.location.search).get('listing') || null; } catch(e) { return null; }
  });


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
  const [liveJobs,         setLiveJobs]         = React.useState([]);
  const [liveTechs,        setLiveTechs]        = React.useState([]);
  const [liveVacations,    setLiveVacations]    = React.useState([]);
  const [liveMarket,       setLiveMarket]       = React.useState([]);
  const [liveApplications, setLiveApplications] = React.useState([]); // current user's job applications
  // { [job_id]: { total, pending, withInterview } } — applicant counts for jobs the current user owns
  const [jobApplicantCounts, setJobApplicantCounts] = React.useState({});
  // Ref keeps the latest job IDs accessible in event callbacks without stale closure
  const liveJobIdsRef = React.useRef([]);
  React.useEffect(() => { liveJobIdsRef.current = liveJobs.map(j => j._id); }, [liveJobs]);

  React.useEffect(() => {
    if (!window.sb || !authReady) return;

    // Normalizers — Supabase uses snake_case columns
    const normJob = r => ({ _id:r.id, _live:true, role:r.role, loc:r.loc, desc:r.description,
      contract:r.contract, payMode:r.pay_mode, pay:r.pay,
      carReq:r.car_req, licenseReq:r.license_req, equipReq:r.equip_req, author:r.author, author_id:r.author_id||null,
      hiredAt: r.hired_at || null });
    const normTech = r => ({ _id:r.id, _live:true, name:r.name, specialty:r.specialty, photoUrl:r.photo_url||null,
      loc:r.loc, phone:r.phone, email:r.email,
      rateMode:r.rate_mode, rate:r.rate, author:r.author, author_id:r.author_id||null });
    const normVac = r => {
      const wr = r.weekday_regions || {};
      const allCities = [...new Set(Object.values(wr).flat())];
      const region = allCities.slice(0, 3).join(' / ') || '';
      return {
        _id: r.id, _live: true,
        monthIdx: r.month_idx, year: r.year,
        yearMonth: { year: r.year, month: r.month_idx },
        days: r.selected_days || [],
        selectedDays: r.selected_days,
        bookedDays: r.booked_days || [],
        weekdayRegions: wr,
        poolsByWeekday: r.pools_per_weekday || {},
        poolsPerWeekday: r.pools_per_weekday,
        price: r.price,
        pricePerPool: r.price,
        priceMode: r.price_mode,
        note: r.note || null,
        region,
        author: r.author, author_id: r.author_id || null,
        ownerId: r.author_id || null,
      };
    };
    const normMkt = r => ({ _id:r.id, _live:true, type:r.type, name:r.name, cat:r.cat,
      condition:r.condition, price:r.price, priceMode:r.price_mode,
      loc:r.loc, routeName:r.route_name, clients:r.clients,
      revenue:r.revenue, asking:r.asking, area:r.area,
      description: r.description || '',
      address: r.address || null,
      system: r.pool_system || null,
      sizeFt: r.size_ft || null,
      gallons: r.gallons || null,
      freq: r.freq_week || null,
      warranty: r.warranty || null,
      warrantyMonths: r.warranty_months || null,
      author:r.author, author_id:r.author_id || null,
      photoUrl: r.photo_url || null,
      photoUrls: (r.photo_urls && r.photo_urls.length > 0) ? r.photo_urls : (r.photo_url ? [r.photo_url] : []),
      rentPeriod: r.rent_period || null,
      rentPrices: r.rent_prices || null,
      status: r.status || 'pending',
      createdAt: r.created_at || null,
      soldAt: r.sold_at || null });

    // Clean up sold listings older than 1 day (fire-and-forget)
    window.sb.rpc('cleanup_old_sold_listings').then(() => {}).catch(() => {});

    // Data fetch — runs AFTER auth is ready (authReady gate above)
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
      if (m.error) console.warn('[Supabase] marketplace fetch error:', m.error.message);
      // Load applicant counts in background — non-blocking, doesn't delay UI render
      if (j.data && j.data.length > 0) {
        const jobIds = j.data.map(r => r.id);
        liveJobIdsRef.current = jobIds;
        window.sb.from('job_applications').select('job_id, status, interview_day')
          .in('job_id', jobIds)
          .then(({ data: appRows }) => {
            if (!appRows) return;
            const counts = {};
            appRows.forEach(row => {
              if (!counts[row.job_id]) counts[row.job_id] = { total: 0, pending: 0, withInterview: 0 };
              counts[row.job_id].total++;
              if (row.status === 'pending') counts[row.job_id].pending++;
              if (row.interview_day) counts[row.job_id].withInterview++;
            });
            setJobApplicantCounts(counts);
          });
      }
    };
    doFetch().catch(e => console.warn('[Supabase] fetch:', e.message));

    // Helper: refresh applicant counts for all known jobs
    const doCountsRefresh = async () => {
      const ids = liveJobIdsRef.current;
      if (!window.sb || !ids || ids.length === 0) return;
      const { data: appRows } = await window.sb
        .from('job_applications').select('job_id, status, interview_day').in('job_id', ids);
      if (!appRows) return;
      const counts = {};
      appRows.forEach(row => {
        if (!counts[row.job_id]) counts[row.job_id] = { total: 0, pending: 0, withInterview: 0 };
        counts[row.job_id].total++;
        if (row.status === 'pending') counts[row.job_id].pending++;
        if (row.interview_day) counts[row.job_id].withInterview++;
      });
      setJobApplicantCounts(counts);
    };

    // Refresh marketplace when tab regains focus (catches deletes/updates from other devices/tabs)
    const doMarketRefresh = async () => {
      if (!window.sb) return;
      const { data } = await window.sb.from('marketplace').select('*').order('created_at', { ascending: false });
      if (data) setLiveMarket(data.map(normMkt));
    };
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      doMarketRefresh();
      doCountsRefresh(); // also refresh applicant counts on tab focus
      if (user?.uid) loadLiveApplications(user.uid); // refresh candidate application statuses
    };
    document.addEventListener('visibilitychange', onVisible);

    // Poll marketplace every 60s + applicant counts every 30s + applications every 30s
    const pollTimer  = setInterval(doMarketRefresh, 60000);
    const countTimer = setInterval(doCountsRefresh, 30000);
    const appsTimer  = setInterval(() => { if (user?.uid) loadLiveApplications(user.uid); }, 30000);

    // Real-time subscriptions
    const channel = window.sb.channel('app-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'jobs' },
        p => setLiveJobs(prev => [normJob(p.new), ...prev]))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'jobs' },
        p => setLiveJobs(prev => prev.map(j => j._id === p.new.id ? normJob(p.new) : j)))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'jobs' },
        p => setLiveJobs(prev => prev.filter(j => j._id !== p.old.id)))
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
      // Update applicant counts in real-time when someone applies to (or updates) a job
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'job_applications' },
        p => {
          if (!p.new || !p.new.job_id) return;
          setJobApplicantCounts(prev => {
            const curr = prev[p.new.job_id] || { total: 0, pending: 0, withInterview: 0 };
            return { ...prev, [p.new.job_id]: {
              total:         curr.total + 1,
              pending:       p.new.status === 'pending' ? curr.pending + 1 : curr.pending,
              withInterview: p.new.interview_day ? curr.withInterview + 1 : curr.withInterview,
            }};
          });
        })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'job_applications' },
        p => {
          if (!p.new || !p.new.job_id || !window.sb) return;
          // Re-query counts for this job to get accurate state after status change
          window.sb.from('job_applications')
            .select('job_id, status, interview_day')
            .eq('job_id', p.new.job_id)
            .then(({ data }) => {
              if (!data) return;
              setJobApplicantCounts(prev => ({
                ...prev,
                [p.new.job_id]: {
                  total:         data.length,
                  pending:       data.filter(r => r.status === 'pending').length,
                  withInterview: data.filter(r => r.interview_day).length,
                }
              }));
            });
        })
      .subscribe(status => {
        if (status === 'SUBSCRIBED') console.log('[Supabase] real-time ativo ✓');
      });

    return () => {
      window.sb.removeChannel(channel);
      document.removeEventListener('visibilitychange', onVisible);
      clearInterval(pollTimer);
      clearInterval(countTimer);
      clearInterval(appsTimer);
    };
  }, [authReady]); // runs once authReady flips true — guaranteed after token refresh + loadProfile

  // Notifications unread badge — fetch count + real-time
  React.useEffect(() => {
    if (!authReady || !user?.uid || !window.sb) return;
    window.sb.from('notifications').select('id').eq('user_id', user.uid).eq('read', false)
      .then(({ data }) => { if (data) setHasUnreadNotif(data.length > 0); });
    const ch = window.sb.channel('notif-badge-' + user.uid)
      .on('postgres_changes', { event:'INSERT', schema:'public', table:'notifications', filter:`user_id=eq.${user.uid}` },
        () => setHasUnreadNotif(true))
      .subscribe();
    return () => window.sb.removeChannel(ch);
  }, [authReady, user?.uid]);

  const loadLiveJobs = React.useCallback(async () => {
    if (!window.sb) return;
    const oneDayAgo = new Date(Date.now() - 24*60*60*1000).toISOString();
    const { data } = await window.sb.from('jobs').select('*')
      .or(`hired_at.is.null,hired_at.gte.${oneDayAgo}`)
      .order('created_at', { ascending: false });
    if (data) setLiveJobs(data.map(r => ({ _id:r.id, _live:true, role:r.role, loc:r.loc, desc:r.description,
      contract:r.contract, payMode:r.pay_mode, pay:r.pay,
      carReq:r.car_req, licenseReq:r.license_req, equipReq:r.equip_req, author:r.author, author_id:r.author_id||null,
      hiredAt: r.hired_at || null })));
  }, []);

  // Live job applications — current user's applications + real-time status updates
  const loadLiveApplications = React.useCallback(async (uid) => {
    if (!window.sb || !uid) return;
    const { data } = await window.sb
      .from('job_applications')
      .select('*')
      .eq('applicant_id', uid)
      .order('created_at', { ascending: false });
    if (data) setLiveApplications(data.map(r => ({
      ...r,
      _live:        true,
      rejectReason: r.reject_reason || null,
    })));
  }, []);

  React.useEffect(() => {
    if (!authReady || !user?.uid || !window.sb) return;
    loadLiveApplications(user.uid);
    // Real-time: refresh whenever a status update arrives for our applications
    const ch = window.sb.channel('my-apps-' + user.uid)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'job_applications',
        filter: `applicant_id=eq.${user.uid}`,
      }, () => loadLiveApplications(user.uid))
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'job_applications',
        filter: `applicant_id=eq.${user.uid}`,
      }, () => loadLiveApplications(user.uid))
      .subscribe();
    return () => window.sb.removeChannel(ch);
  }, [authReady, user?.uid]);

  // Helper: insert row into Supabase
  const dbWrite = React.useCallback((col, data) => {
    if (!window.sb) return;
    // Always use profile name; never leak email as author
    const authorName = (user.name && !user.name.includes('@')) ? user.name : (user.email ? user.email.split('@')[0] : 'User');
    const row = col === 'jobs' ? {
      role: data.role, loc: data.loc, contract: data.contract,
      pay_mode: data.payMode, pay: data.pay, car_req: data.carReq,
      license_req: data.licenseReq, equip_req: data.equipReq, description: data.desc,
      author: (data.company && data.company.trim()) ? data.company.trim() : authorName, author_id: user.uid || null,
    } : col === 'techs' ? {
      name: data.name, specialty: data.specialty, loc: data.loc,
      phone: data.phone, email: data.email,
      rate_mode: data.rateMode, rate: data.rate,
      photo_url: user.photoUrl || data.photoUrl || null,
      author: authorName, author_id: user.uid || null,
    } : col === 'vacations' ? {
      month_idx: data.monthIdx, year: data.year,
      selected_days: data.selectedDays, weekday_regions: data.weekdayRegions,
      pools_per_weekday: data.poolsPerWeekday,
      price: data.price, price_mode: data.priceMode,
      note: data.note || null,
      author: authorName, author_id: user.uid || null,
    } : col === 'marketplace' ? {
      type: data.type, name: data.name, cat: data.cat,
      condition: data.condition, price: data.price,
      price_mode: data.priceMode, loc: data.loc,
      description: data.description || data.desc || null,
      route_name: data.routeName, clients: data.clients,
      revenue: data.revenue,
      asking: data.asking || data.est || null,
      area: data.area,
      address: data.address || null,
      pool_system: data.system || null,
      size_ft: data.sizeFt || null,
      gallons: data.gallons || null,
      freq_week: data.freq || null,
      warranty: data.warranty || null,
      warranty_months: data.warrantyMonths || null,
      author: authorName, author_id: user.uid || null,
      photo_url: data.photoUrl || null,
      photo_urls: (data.photoUrls && data.photoUrls.length > 0) ? data.photoUrls : (data.photoUrl ? [data.photoUrl] : []),
      rent_period: data.rentPeriod || null,
      rent_prices: data.rentPrices || null,
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

  // Sync tier tweak → user state + persist to localStorage
  React.useEffect(()=>{
    setUser(u=>({...u, tier:t.tier}));
    try { localStorage.setItem('pg_tier', t.tier); } catch {}
  }, [t.tier]);

  const setLang = (l) => {
    setLangState(l);
    setTweak('lang', l);
    try { localStorage.setItem('pg_lang', l); } catch(e) {}
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(()=>setToast(null), 2400);
  };

  // ── Responsive: detect desktop vs mobile (must be BEFORE ctx) ──
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);
  React.useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const ctx = {
    user,
    setUser: (u) => {
      const next = typeof u === 'function' ? u(user) : u;
      setUser(next);
      if (next.tier !== t.tier) setTweak('tier', next.tier);
    },
    lang, setLang,
    regionsByDay, setRegionsByDay, saveRegionsByDay, county,
    deepLinkListingId,
    clearDeepLink: () => setDeepLinkListingId(null),
    openListingById: (id) => {
      if (typeof id === 'string' && id.startsWith('qp_')) {
        setPendingQuickJobId(id.slice(3));
        switchTab('quick');
      } else {
        setDeepLinkListingId(id);
        switchTab('market');
      }
    },
    pendingQuickJobId,
    clearPendingQuickJob: () => setPendingQuickJobId(null),
    goTab:              switchTab,
    openChat:           (target=null) => { setChatConvoTarget(target); setChatOpen(true); },
    openNotifications:  () => { setNotifOpen(true); setHasUnreadNotif(false); },
    hasUnreadChat, hasUnreadNotif: hasUnreadNotif || pendingRatings.length > 0,
    registerPush:       _registerPush,
    openPaywall:        () => setPayOpen(true),
    openPostMenu:       () => setPostMenuOpen(true),
    openPost:           () => setPostQPOpen(true),
    openMarketPost:     () => { switchTab('market'); setMarketPostOpen(true); },
    closeMarketPost:    () => setMarketPostOpen(false),
    marketPostOpen,
    openRegionEditor:   () => setRegionOpen(true),
    openLanguagePicker: () => setLangPickerOpen(true),
    openApplicants:     (post) => setApplicantsPost(post),
    openVerification:   () => setVerifyOpen(true),
    requestVerification: async () => {
      if (!window.sb || !user.uid) return;
      const { error } = await window.sb.from('profiles').update({ verification_requested: true }).eq('id', user.uid);
      if (error) { showToast && showToast('❌ ' + error.message); return; }
      setUser(u => ({ ...u, verificationRequested: true }));
      showToast && showToast('✓ Verificação solicitada! Nossa equipe vai analisar em breve.');
    },
    openPushNotif:      () => setPushNotifOpen(true),
    retryPush: _registerPush,
    pushLog,
    openWallet:         () => setWalletOpen(true),
    openJobDetail:      (app) => setJobDetailApp(app),
    openReview:         (app) => setReviewApp(app),
    openVacSheet:       () => { setEditingVac(null); setVacSheetOpen(true); },
    openEditVacSheet:   (vac) => { setEditingVac(vac); setVacSheetOpen(true); },
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
    pendingRatings,
    openRating: (r) => setActiveRating(r),
    loadPendingRatings,
    darkMode, toggleDark,
    isDesktop: !isMobile,
    onLogout: () => {
      if (window.sb) window.sb.auth.signOut();
      setIsLoggedIn(false);
      setTab('home');
      setUser(u => ({ ...u, name:'', email:'', uid:'', role:'user' }));
    },
    // Live Firestore data
    liveJobs, liveTechs, liveVacations, liveMarket,
    liveApplications, jobApplicantCounts,
    refreshLiveApplications: () => loadLiveApplications(user?.uid),
    dbWrite, showToast,
    // Admin: remove items from local state immediately (fallback if realtime is slow)
    removeMarketItem:  (id) => setLiveMarket(prev => prev.filter(m => m._id !== id)),
    // Update item in local state (e.g. mark as sold without waiting for realtime)
    updateMarketItem:  (id, patch) => setLiveMarket(prev => prev.map(m => m._id === id ? {...m, ...patch} : m)),
    removeJob:         (id) => setLiveJobs(prev      => prev.filter(j => j._id !== id)),
    loadLiveJobs,
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
  // NOTE: chatOpen intentionally NOT in deps — it's irrelevant to the convo object shape
  // and caused double-recompute (triggering the ChatSheet effect twice) when open changed.
  const initialConvo = React.useMemo(() => {
    if (!chatConvoTarget) return null;
    const isObj = typeof chatConvoTarget === 'object' && chatConvoTarget !== null;
    const receiverName = isObj ? chatConvoTarget.name : String(chatConvoTarget);
    const receiverId   = isObj ? (chatConvoTarget.id || null) : null;
    return {
      receiverId,
      name: receiverName,
      context: { en:'Direct message', pt:'Mensagem direta', es:'Mensaje directo' },
      listingId:      isObj ? (chatConvoTarget.listingId || null) : null,
      listingContext: isObj ? (chatConvoTarget.listingContext || null) : null,
    };
  }, [chatConvoTarget]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Desktop sidebar nav items ─────────────────────────────────
  const desktopNavItems = [
    { id:'home',    emoji:'🏠', label: lang==='pt'?'Início':lang==='es'?'Inicio':'Home' },
    { id:'market',  emoji:'🏪', label: lang==='pt'?'Mercado':lang==='es'?'Mercado':'Marketplace' },
    { id:'quick',   emoji:'🏊', label: lang==='pt'?'Piscinas Rápidas':lang==='es'?'Piscinas Rápidas':'Express Pools' },
    { id:'work',    emoji:'💼', label: lang==='pt'?'Trabalho':lang==='es'?'Trabajo':'Work' },
    { id:'profile', emoji:'👤', label: lang==='pt'?'Perfil':lang==='es'?'Perfil':'Profile' },
  ];
  const desktopTabLabel = desktopNavItems.find(n=>n.id===tab);

  // ── Shared overlays (used in both mobile and desktop) ─────────
  const OverlayBundle = () => (
    <>
      <ChatSheet open={chatOpen}
        onClose={()=>{ setChatOpen(false); setChatConvoTarget(null); recheckUnread(); }}
        lang={lang} initialConvo={initialConvo} currentUser={user}
        onUnreadChange={recheckUnread}
        onOpenListing={ctx.openListingById}
        openPublicProfile={ctx.openPublicProfile}/>
      <NotificationsSheet open={notifOpen} onClose={()=>setNotifOpen(false)} lang={lang} user={user}
        onUnreadChange={(c)=>setHasUnreadNotif(c>0)}
        onNavigate={(type, linkId)=>{
          setNotifOpen(false);
          if (type==='warning') { setTimeout(()=>switchTab('profile'), 280); }
          else if (type==='quick_pool_new') { setTimeout(()=>switchTab('quick'), 280); }
          else if (type==='job_new_application' || type==='job_accepted' || type==='job_rejected') { setTimeout(()=>switchTab('work'), 280); }
          else if (linkId) { setTimeout(()=>ctx.openListingById(linkId), 280); }
          else { setTimeout(()=>switchTab('market'), 280); }
        }}/>
      <PaywallSheet open={payOpen} onClose={()=>setPayOpen(false)} setUser={ctx.setUser} lang={lang}/>
      <PostMenuSheet open={postMenuOpen} onClose={()=>setPostMenuOpen(false)}
        onPickQuickPool={()=>setPostQPOpen(true)} lang={lang}/>
      <Sheet open={postQPOpen} onClose={()=>setPostQPOpen(false)} height="92%">
        <PostQuickPool
          lang={lang}
          onClose={()=>setPostQPOpen(false)}
          onSubmit={async (formData)=>{
            setPostQPOpen(false);
            showToast(STRINGS[lang].toastPosted);
            setTab('quick');
            // Persist to Supabase and trigger notifications
            if (!window.sb || !user?.uid) return;
            try {
              const scheduledFor = formData.scheduled_for
                ? new Date(formData.scheduled_for).toISOString()
                : null;
              // Build notify_at: 7 AM on scheduled day (or null for "now")
              let notifyAt = null;
              if (scheduledFor) {
                const d = new Date(formData.scheduled_for);
                d.setHours(7, 0, 0, 0);
                notifyAt = d.toISOString();
              }
              const firstPool = formData.pools?.[0] || {};
              const isCondo = firstPool.poolType === 'condo';
              const job = {
                poster_id: user.uid, poster_name: user.name || user.email || 'Pool Guy',
                poster_phone: formData.showPhone ? (formData.phone || user.phone || null) : null,
                pool_address: (() => {
                  const addr = formData.pool_address?.trim() || '';
                  const zip  = formData.pool_zip?.trim() || '';
                  if (!addr && !zip) return null;
                  if (zip && addr) return `${addr}, FL ${zip}`;
                  return addr || zip;
                })(),
                city: firstPool.location || 'Florida',
                day_of_week: ['sun','mon','tue','wed','thu','fri','sat'][(scheduledFor ? new Date(formData.scheduled_for) : new Date()).getDay()],
                when_label: scheduledFor ? new Date(scheduledFor).toLocaleDateString(lang==='pt'?'pt-BR':lang==='es'?'es':'en-US',{weekday:'short',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}) : (lang==='pt'?'Agora':'Now'),
                pools_count: 1,
                price_per_pool: formData.priceMode==='fixed' ? parseFloat(formData.price||0)||null : null,
                price_negotiable: formData.priceMode==='neg',
                title: formData.title?.trim() || null,
                description: formData.notes?.trim() || null,
                pool_type: isCondo ? 'condo' : 'residential',
                extras: isCondo
                  ? { gate_code: firstPool.gateCodeVal||null, doorman: firstPool.doorman||false, dog: firstPool.dog||false, saltwater: firstPool.saltwater||false }
                  : { dog: firstPool.dog||false, saltwater: firstPool.saltwater||false },
                required_photos: formData.requiredPhotos || [],
                status: 'open',
                notify_at: notifyAt,
              };
              const { data: inserted } = await window.sb.from('quick_pool_jobs').insert(job).select().single();
              // Only notify immediately if "Agora" (no scheduled date)
              if (inserted && !scheduledFor) {
                fetch('https://xiszfqghizqzlwyrfjol.supabase.co/functions/v1/notify-quick-pool', {
                  method:'POST',
                  headers:{'Content-Type':'application/json','Authorization':'Bearer '+(window._pgGetTok?window._pgGetTok():'')},
                  body: JSON.stringify({ job: inserted }),
                }).catch(()=>{});
              }
            } catch {}
          }}
        />
      </Sheet>
      <Toast message={toast}/>
      <RegionEditorSheet
        open={regionOpen} onClose={()=>setRegionOpen(false)} lang={lang}
        regionsByDay={regionsByDay} setRegionsByDay={setRegionsByDay}
        saveRegionsByDay={saveRegionsByDay} county={county}
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
        user={user}
        onChat={(name)=>{ setApplicantsPost(null); setChatConvoTarget(name); setChatOpen(true); }}
        onOpenProfile={(applicant) => setPublicProfileUser({
          uid:     applicant.applicant_id || null,
          name:    applicant.name,
          rating:  applicant.rating || 4.9,
          reviews: applicant.jobs   || 0,
          jobs:    applicant.jobs   || 0,
          loc:     applicant.profile?.region || '',
          photo:   applicant.profile?.photoUrl || null,
        })}
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
      <Sheet open={vacSheetOpen} onClose={()=>{ setVacSheetOpen(false); setEditingVac(null); }} height="92%">
        <PostVacationSheet
          lang={lang}
          initialData={editingVac}
          onClose={()=>{ setVacSheetOpen(false); setEditingVac(null); }}
          onSubmit={(data)=>{
            setVacSheetOpen(false);
            if (!data) { setEditingVac(null); return; }
            if (editingVac) {
              const row = {
                month_idx: data.monthIdx, year: data.year,
                selected_days: data.selectedDays, weekday_regions: data.weekdayRegions,
                pools_per_weekday: data.poolsPerWeekday,
                price: data.price, price_mode: data.priceMode,
                note: data.note || null,
              };
              window.sb.from('vacations').update(row).eq('id', editingVac._id).then(({ error }) => {
                if (error) { showToast('❌ ' + error.message); return; }
                const wr = data.weekdayRegions || {};
                const allCities = [...new Set(Object.values(wr).flat())];
                const region = allCities.slice(0, 3).join(' / ') || editingVac.region;
                setLiveVacations(prev => prev.map(v => v._id !== editingVac._id ? v : {
                  ...v, monthIdx: data.monthIdx, year: data.year,
                  yearMonth: { year: data.year, month: data.monthIdx },
                  days: data.selectedDays || [], selectedDays: data.selectedDays,
                  weekdayRegions: wr, poolsByWeekday: data.poolsPerWeekday || {},
                  poolsPerWeekday: data.poolsPerWeekday,
                  price: data.price, pricePerPool: data.price, priceMode: data.priceMode,
                  note: data.note || null, region,
                }));
                showToast(lang==='pt'?'Férias atualizadas ✓':lang==='es'?'Vacaciones actualizadas ✓':'Vacation updated ✓');
              });
              setEditingVac(null);
            } else {
              dbWrite('vacations', data);
              showToast(lang==='pt'?'Férias publicadas ✓':lang==='es'?'Vacaciones publicadas ✓':'Vacation posted ✓');
            }
          }}
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
          onSubmit={(data)=>{ setHiringSheetOpen(false); if(data) dbWrite('jobs', data).then(()=>loadLiveJobs()); showToast(lang==='pt'?'Vaga publicada ✓':lang==='es'?'Empleo publicado ✓':'Job posted ✓'); }}
        />
      </Sheet>
      <Sheet open={techSheetOpen} onClose={()=>setTechSheetOpen(false)} height="80%">
        <PostTechSheet
          lang={lang}
          user={user}
          onClose={()=>setTechSheetOpen(false)}
          onSubmit={(data)=>{ setTechSheetOpen(false); if(data) dbWrite('techs', data); showToast(lang==='pt'?'Perfil publicado ✓':lang==='es'?'Perfil publicado ✓':'Profile posted ✓'); }}
        />
      </Sheet>
      <ApplyJobSheet
        open={!!applyJob} onClose={()=>setApplyJob(null)}
        job={applyJob} user={user} lang={lang}
        onEditProfile={()=>setEditProfileOpen(true)}
        onSubmit={()=>{ setApplyJob(null); showToast(lang==='pt'?'Candidatura enviada ✓':lang==='es'?'Postulación enviada ✓':'Application sent ✓'); loadLiveApplications(user.uid); }}/>
      <EditProfileSheet
        open={editProfileOpen} onClose={()=>setEditProfileOpen(false)}
        user={user} setUser={ctx.setUser} lang={lang}/>
      <PublicProfileSheet
        open={!!publicProfileUser}
        onClose={()=>setPublicProfileUser(null)}
        profile={publicProfileUser}
        lang={lang}
        onChat={(target)=>{ setPublicProfileUser(null); setChatConvoTarget(target); setChatOpen(true); }}
      />
      <HelpSheet open={helpOpen} onClose={()=>setHelpOpen(false)} lang={lang}/>
      <PrivacySheet open={privacyOpen} onClose={()=>setPrivacyOpen(false)} lang={lang}/>
      <HiringAppDetailSheet
        open={!!hiringAppDetail} onClose={()=>setHiringAppDetail(null)}
        app={hiringAppDetail} lang={lang}
        onChat={(target) => { setChatConvoTarget(target || null); setChatOpen(true); }}
        onWithdraw={(appId) => {
          setHiringAppDetail(null);
          loadLiveApplications(user?.uid);
        }}/>
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
      {/* ── Rating Sheet — shown when user has a pending rating to submit ── */}
      <RatingSheet
        open={!!activeRating}
        rating={activeRating}
        lang={lang}
        currentUser={user}
        showToast={showToast}
        onClose={()=>setActiveRating(null)}
        onDone={(id)=>{
          setPendingRatings(prev => prev.filter(r => r.id !== id));
          setActiveRating(null);
        }}
      />
      {/* ── Buyer Rating Prompt — centered popup with inline stars+comment ── */}
      <BuyerRatingPromptModal
        open={ratingPromptOpen}
        pendingRatings={pendingRatings}
        lang={lang}
        currentUser={user}
        showToast={showToast}
        onRateNow={(rating) => {
          // rating=null means submitted inline; just close + refresh pending list
          setRatingPromptOpen(false);
          if (loadPendingRatings) setTimeout(loadPendingRatings, 300);
        }}
        onClose={() => setRatingPromptOpen(false)}
      />
    </>
  );

  // ════════════════════════════════════════════════════════════════
  // DESKTOP LAYOUT — professional sidebar, no top header bar
  // ════════════════════════════════════════════════════════════════
  if (!isMobile) {
    const displayName = (user.name && !user.name.includes('@'))
      ? user.name
      : (user.email ? user.email.split('@')[0] : 'User');
    const avatarLetter = (displayName[0] || '?').toUpperCase();

    // SVG icon set — consistent 1.75 stroke, Lucide style
    const NavIcon = ({ id, active }) => {
      const c = active ? '#fff' : 'rgba(255,255,255,0.45)';
      const w = 1.75;
      switch(id) {
        case 'home': return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        );
        case 'market': return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
        );
        case 'quick': return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round">
            <path d="M2 12 Q6 8 10 12 Q14 16 18 12 Q20 10 22 12"/>
            <path d="M2 17 Q6 13 10 17 Q14 21 18 17 Q20 15 22 17"/>
            <circle cx="12" cy="5" r="2"/>
          </svg>
        );
        case 'work': return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2"/>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
          </svg>
        );
        case 'profile': return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        );
        default: return null;
      }
    };

    const navItems = [
      { id:'home',    label: lang==='pt'?'Início':lang==='es'?'Inicio':'Home' },
      { id:'market',  label: lang==='pt'?'Mercado':lang==='es'?'Mercado':'Marketplace' },
      { id:'quick',   label: lang==='pt'?'Piscinas Rápidas':lang==='es'?'Piscinas Rápidas':'Express Pools' },
      { id:'work',    label: lang==='pt'?'Trabalho':lang==='es'?'Trabajo':'Work' },
      { id:'profile', label: lang==='pt'?'Perfil':lang==='es'?'Perfil':'Profile' },
    ];

    // Post button removed from sidebar — each screen has its own inline post button

    // ── Desktop page meta ─────────────────────────────────────
    const pagesMeta = {
      home:    { label: lang==='pt'?'Início':lang==='es'?'Inicio':'Home',             icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
      market:  { label: lang==='pt'?'Mercado':lang==='es'?'Mercado':'Marketplace',       icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> },
      quick:   { label: lang==='pt'?'Piscinas Rápidas':lang==='es'?'Piscinas Rápidas':'Express Pools', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 12 Q6 8 10 12 Q14 16 18 12 Q20 10 22 12"/><path d="M2 17 Q6 13 10 17 Q14 21 18 17 Q20 15 22 17"/><circle cx="12" cy="5" r="2"/></svg> },
      work:    { label: lang==='pt'?'Trabalho':lang==='es'?'Trabajo':'Work',           icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> },
      profile: { label: lang==='pt'?'Perfil':lang==='es'?'Perfil':'Profile',           icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
    };
    const pageMeta = pagesMeta[tab] || pagesMeta.home;

    return (
      <div style={{width:'100%',height:'100%',display:'flex',overflow:'hidden',background:'var(--pg-bg)',position:'relative'}}>

        {/* ── SIDEBAR ────────────────────────────────────────── */}
        {isLoggedIn && (
          <nav style={{
            width:264, flexShrink:0, zIndex:10,
            background:'linear-gradient(180deg, #050E1C 0%, #081628 55%, #0A1C33 100%)',
            display:'flex', flexDirection:'column',
            overflowY:'auto', overflowX:'hidden',
            boxShadow:'3px 0 28px rgba(0,0,0,0.40)',
            borderRight:'1px solid rgba(255,255,255,0.035)',
            position:'relative',
          }}>

            {/* Top aqua accent line */}
            <div style={{
              position:'absolute', top:0, left:0, right:0, height:3, zIndex:1,
              background:'linear-gradient(90deg, transparent 0%, #0EA5E9 30%, #06B6D4 65%, transparent 100%)',
              opacity:0.75, pointerEvents:'none',
            }}/>

            {/* ── Brand logo ── */}
            <div style={{padding:'6px 16px 4px', flexShrink:0, display:'flex', alignItems:'center', overflow:'visible', height:70}}>
              <img
                src="wordmarkwhite.png"
                alt="PoolGuyX"
                style={{
                  width:220, height:200, objectFit:'contain', objectPosition:'left center', display:'block', marginTop:20,
                  filter:'drop-shadow(0 3px 14px rgba(14,186,199,0.30))',
                  pointerEvents:'none',
                }}
              />
            </div>

            {/* Separator */}
            <div style={{height:1, background:'rgba(255,255,255,0.055)', margin:'0 16px 18px'}}/>

            {/* ── User card ── */}
            <div style={{
              margin:'0 12px 20px', padding:'13px 14px', borderRadius:14,
              background:'linear-gradient(135deg, rgba(0,119,182,0.14) 0%, rgba(14,186,199,0.07) 100%)',
              border:'1px solid rgba(14,186,199,0.14)',
              display:'flex', alignItems:'center', gap:11, cursor:'pointer',
              transition:'all .18s',
              boxShadow:'0 4px 18px rgba(0,0,0,0.20)',
            }}
              onClick={()=>switchTab('profile')}
              onMouseEnter={e=>{ e.currentTarget.style.background='linear-gradient(135deg, rgba(0,119,182,0.22) 0%, rgba(14,186,199,0.12) 100%)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.background='linear-gradient(135deg, rgba(0,119,182,0.14) 0%, rgba(14,186,199,0.07) 100%)'; }}
            >
              <div style={{
                width:40, height:40, borderRadius:12, flexShrink:0,
                background:'linear-gradient(135deg,#0077B6,#0EA5E9)',
                display:'flex', alignItems:'center', justifyContent:'center',
                color:'#fff', fontSize:15, fontWeight:700,
                boxShadow:'0 4px 12px rgba(0,119,182,0.45)',
                overflow:'hidden',
              }}>
                {user.photoUrl
                  ? <img src={user.photoUrl} alt={displayName} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} onError={e=>{e.currentTarget.style.display='none';}}/>
                  : avatarLetter}
              </div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:13, fontWeight:700, color:'#fff',
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', lineHeight:1.25}}>
                  {displayName}
                </div>
                <div style={{display:'flex', alignItems:'center', gap:5, marginTop:3}}>
                  <div style={{width:6, height:6, borderRadius:'50%', background:'#34D399', boxShadow:'0 0 6px rgba(52,211,153,0.65)', flexShrink:0}}/>
                  <span style={{fontSize:10, color:'rgba(255,255,255,0.38)', fontWeight:500, lineHeight:1}}>
                    {user.role==='admin'?'Administrator':'Pool Guy'}
                    {user.tier==='premium' && ' · Premium'}
                    {user.tier==='pro' && ' · Pro'}
                  </span>
                </div>
              </div>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="2.2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </div>

            {/* ── Section label ── */}
            <div style={{padding:'0 22px 7px'}}>
              <div style={{fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.20)',
                letterSpacing:'0.16em', textTransform:'uppercase'}}>
                {lang==='pt'?'Navegação':lang==='es'?'Navegación':'Navigation'}
              </div>
            </div>

            {/* ── Nav items ── */}
            <div style={{padding:'0 10px', display:'flex', flexDirection:'column', gap:2}}>
              {navItems.map(item => {
                const active = tab === item.id;
                return (
                  <button key={item.id} onClick={()=>switchTab(item.id)} style={{
                    display:'flex', alignItems:'center', gap:12,
                    padding:'10px 14px', borderRadius:12, border:'none', cursor:'pointer',
                    background: active
                      ? 'linear-gradient(135deg, rgba(14,165,233,0.22) 0%, rgba(6,182,212,0.12) 100%)'
                      : 'transparent',
                    fontFamily:'inherit', textAlign:'left', transition:'all .15s',
                    position:'relative',
                  }}
                    onMouseEnter={e=>{ if(!active) e.currentTarget.style.background='rgba(255,255,255,0.04)'; }}
                    onMouseLeave={e=>{ if(!active) e.currentTarget.style.background='transparent'; }}
                  >
                    {/* Active left bar */}
                    {active && (
                      <div style={{
                        position:'absolute', left:0, top:'18%', bottom:'18%',
                        width:3, borderRadius:'0 4px 4px 0',
                        background:'linear-gradient(180deg, #38BDF8 0%, #06B6D4 100%)',
                        boxShadow:'0 0 8px rgba(56,189,248,0.60)',
                      }}/>
                    )}
                    {/* Icon box */}
                    <div style={{
                      width:36, height:36, borderRadius:11, flexShrink:0,
                      background: active
                        ? 'linear-gradient(135deg, rgba(14,165,233,0.35) 0%, rgba(6,182,212,0.22) 100%)'
                        : 'rgba(255,255,255,0.05)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      transition:'all .15s',
                      border: active ? '1px solid rgba(56,189,248,0.25)' : '1px solid rgba(255,255,255,0.05)',
                      boxShadow: active ? '0 3px 10px rgba(14,165,233,0.25)' : 'none',
                    }}>
                      <NavIcon id={item.id} active={active}/>
                    </div>
                    <span style={{
                      fontSize:13.5, fontWeight: active ? 700 : 500,
                      color: active ? '#E0F2FE' : 'rgba(255,255,255,0.42)',
                      letterSpacing:'-0.01em', transition:'all .15s',
                    }}>{item.label}</span>
                    {/* Unread dot */}
                    {item.id==='home' && (hasUnreadChat||hasUnreadNotif) && (
                      <div style={{marginLeft:'auto', width:7, height:7, borderRadius:'50%',
                        background:'#38BDF8', boxShadow:'0 0 7px rgba(56,189,248,0.70)'}}/>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Spacer */}
            <div style={{flex:1}}/>

            {/* ── Utilities ── */}
            <div style={{padding:'0 10px 12px', display:'flex', flexDirection:'column', gap:1}}>
              <div style={{height:1, background:'rgba(255,255,255,0.06)', margin:'0 4px 10px'}}/>

              {/* Notifications */}
              <button onClick={()=>setNotifOpen(true)} style={{
                display:'flex', alignItems:'center', gap:11,
                padding:'9px 14px', borderRadius:11, border:'none', cursor:'pointer',
                background:'transparent', fontFamily:'inherit', textAlign:'left', transition:'background .15s',
                position:'relative',
              }}
                onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.04)'; }}
                onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; }}
              >
                <div style={{
                  width:32, height:32, borderRadius:9, flexShrink:0,
                  background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.06)',
                  display:'flex', alignItems:'center', justifyContent:'center', position:'relative',
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.38)" strokeWidth="1.75" strokeLinecap="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                  {(hasUnreadNotif||pendingRatings.length>0) && (
                    <div style={{position:'absolute', top:3, right:3, width:7, height:7, borderRadius:'50%',
                      background:'#FF3B30', border:'1.5px solid #081628'}}/>
                  )}
                </div>
                <span style={{fontSize:12.5, fontWeight:500, color:'rgba(255,255,255,0.38)', letterSpacing:'-0.01em'}}>
                  {lang==='pt'?'Notificações':lang==='es'?'Notificaciones':'Notifications'}
                </span>
                {(hasUnreadNotif||pendingRatings.length>0) && (
                  <div style={{marginLeft:'auto', background:'rgba(255,59,48,0.18)', borderRadius:6, padding:'1px 7px'}}>
                    <span style={{fontSize:10, fontWeight:700, color:'#FF6B6B'}}>
                      {pendingRatings.length > 0 ? pendingRatings.length : '•'}
                    </span>
                  </div>
                )}
              </button>

              {/* Messages */}
              <button onClick={()=>setChatOpen(true)} style={{
                display:'flex', alignItems:'center', gap:11,
                padding:'9px 14px', borderRadius:11, border:'none', cursor:'pointer',
                background:'transparent', fontFamily:'inherit', textAlign:'left', transition:'background .15s',
              }}
                onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.04)'; }}
                onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; }}
              >
                <div style={{
                  width:32, height:32, borderRadius:9, flexShrink:0,
                  background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.06)',
                  display:'flex', alignItems:'center', justifyContent:'center', position:'relative',
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.38)" strokeWidth="1.75" strokeLinecap="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  {hasUnreadChat && (
                    <div style={{position:'absolute', top:3, right:3, width:7, height:7, borderRadius:'50%',
                      background:'#38BDF8', border:'1.5px solid #081628'}}/>
                  )}
                </div>
                <span style={{fontSize:12.5, fontWeight:500, color:'rgba(255,255,255,0.38)', letterSpacing:'-0.01em'}}>
                  {lang==='pt'?'Mensagens':lang==='es'?'Mensajes':'Messages'}
                </span>
                {hasUnreadChat && (
                  <div style={{marginLeft:'auto', background:'rgba(56,189,248,0.15)', borderRadius:6, padding:'1px 7px'}}>
                    <span style={{fontSize:10, fontWeight:700, color:'#38BDF8'}}>New</span>
                  </div>
                )}
              </button>

              {/* Dark mode toggle */}
              <button onClick={toggleDark} style={{
                display:'flex', alignItems:'center', gap:11,
                padding:'9px 14px', borderRadius:11, border:'none', cursor:'pointer',
                background: darkMode ? 'rgba(245,158,11,0.07)' : 'transparent',
                fontFamily:'inherit', textAlign:'left', transition:'all .15s',
              }}
                onMouseEnter={e=>{ if(!darkMode) e.currentTarget.style.background='rgba(255,255,255,0.04)'; }}
                onMouseLeave={e=>{ if(!darkMode) e.currentTarget.style.background='transparent'; }}
              >
                <div style={{
                  width:32, height:32, borderRadius:9, flexShrink:0,
                  background: darkMode ? 'rgba(245,158,11,0.14)' : 'rgba(255,255,255,0.05)',
                  border: darkMode ? '1px solid rgba(245,158,11,0.22)' : '1px solid rgba(255,255,255,0.06)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  {darkMode
                    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.75" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.38)" strokeWidth="1.75" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                  }
                </div>
                <span style={{fontSize:12.5, fontWeight:500, color: darkMode ? '#F59E0B' : 'rgba(255,255,255,0.38)', letterSpacing:'-0.01em'}}>
                  {darkMode ? (lang==='pt'?'Modo claro':lang==='es'?'Modo claro':'Light mode') : (lang==='pt'?'Modo escuro':lang==='es'?'Modo oscuro':'Dark mode')}
                </span>
              </button>

              {/* Feedback */}
              <button onClick={()=>setFeedbackOpen(true)} style={{
                display:'flex', alignItems:'center', gap:11,
                padding:'9px 14px', borderRadius:11, border:'none', cursor:'pointer',
                background:'transparent', fontFamily:'inherit', textAlign:'left', transition:'background .15s',
              }}
                onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.04)'; }}
                onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; }}
              >
                <div style={{width:32,height:32,borderRadius:9,flexShrink:0,
                  background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.06)',
                  display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="1.75" strokeLinecap="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    <line x1="9" y1="10" x2="15" y2="10"/>
                  </svg>
                </div>
                <span style={{fontSize:12.5, fontWeight:500, color:'rgba(255,255,255,0.32)', letterSpacing:'-0.01em'}}>Feedback</span>
              </button>

              <div style={{height:1, background:'rgba(255,255,255,0.055)', margin:'8px 4px'}}/>

              {/* Logout */}
              <button onClick={ctx.onLogout} style={{
                display:'flex', alignItems:'center', gap:11,
                padding:'9px 14px', borderRadius:11, border:'none', cursor:'pointer',
                background:'transparent', fontFamily:'inherit', textAlign:'left', transition:'all .15s',
              }}
                onMouseEnter={e=>{ e.currentTarget.style.background='rgba(239,68,68,0.07)'; }}
                onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; }}
              >
                <div style={{width:32,height:32,borderRadius:9,flexShrink:0,
                  background:'rgba(239,68,68,0.07)',border:'1px solid rgba(239,68,68,0.10)',
                  display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(239,68,68,0.55)" strokeWidth="1.75" strokeLinecap="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                </div>
                <span style={{fontSize:12.5, fontWeight:500, color:'rgba(239,68,68,0.52)', letterSpacing:'-0.01em'}}>
                  {lang==='pt'?'Sair':lang==='es'?'Salir':'Log out'}
                </span>
              </button>

              {/* Version */}
              <div style={{padding:'8px 14px 2px', display:'flex', alignItems:'center', gap:6}}>
                <div style={{flex:1, height:1, background:'rgba(255,255,255,0.04)'}}/>
                <span style={{fontSize:9, color:'rgba(255,255,255,0.13)', letterSpacing:'0.06em', whiteSpace:'nowrap'}}>v1.3.0 · Beta</span>
                <div style={{flex:1, height:1, background:'rgba(255,255,255,0.04)'}}/>
              </div>
            </div>
          </nav>
        )}

        {/* ── MAIN CONTENT ───────────────────────────────────── */}
        <div style={{flex:1, position:'relative', overflow:'hidden', display:'flex', flexDirection:'column', background:'var(--pg-bg)'}}>
          {!isLoggedIn ? (
            window.innerWidth >= 1024 ? (
              /* Desktop: login full-screen */
              <div style={{position:'absolute', inset:0, overflow:'hidden'}}>
                <LoginScreen onLogin={handleAuthLogin} lang={lang} setLang={setLang}/>
              </div>
            ) : (
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
            )
          ) : (
            <>
              {/* ── Screen content ── */}
              <div ref={screenRef} data-pg-screen style={{
                flex:1, position:'relative', overflowY:'auto', overflowX:'hidden',
              }}>
                {tab==='home'    && <HomeScreen ctx={ctx}/>}
                {tab==='market'  && <MarketplaceScreen ctx={ctx}/>}
                {tab==='quick'   && <QuickPoolsScreen ctx={ctx}/>}
                {tab==='work'    && <WorkScreen ctx={ctx}/>}
                {tab==='profile' && <ProfileScreen ctx={ctx}/>}
              </div>
            </>
          )}
        </div>

        {/* Overlays — called as function (not component) to avoid remount on re-render */}
        {OverlayBundle()}

        {/* Tweaks panel */}
        <TweaksPanel>
          <TweakSection label="Subscription tier"/>
          <TweakRadio value={t.tier} options={['free','premium','pro']} onChange={v=>setTweak('tier',v)}/>
          <TweakSection label="Language"/>
          <TweakRadio value={lang} options={['en','pt','es']} onChange={v=>setLang(v)}/>
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

      {/* ── Suspended screen ── */}
      {isLoggedIn && user.banned && (
        <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',
          alignItems:'center',justifyContent:'center',padding:'32px 24px',
          background:'var(--pg-white)',zIndex:200,textAlign:'center'}}>
          <div style={{width:72,height:72,borderRadius:'50%',background:'rgba(239,68,68,0.1)',
            display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20}}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
            </svg>
          </div>
          <div style={{fontSize:22,fontWeight:800,color:'var(--pg-ink-900)',marginBottom:8,fontFamily:'var(--pg-font-display)'}}>
            {lang==='pt'?'Conta suspensa':lang==='es'?'Cuenta suspendida':'Account suspended'}
          </div>
          <div style={{fontSize:14,color:'var(--pg-ink-500)',lineHeight:1.6,maxWidth:320,marginBottom:28}}>
            {lang==='pt'
              ? 'Sua conta foi suspensa pela equipe de suporte devido a uma violação dos termos de uso.'
              : lang==='es'
              ? 'Tu cuenta fue suspendida por el equipo de soporte debido a una violación de los términos de uso.'
              : 'Your account has been suspended by the support team due to a violation of our terms of use.'}
          </div>
          <div style={{padding:'14px 20px',borderRadius:14,background:'rgba(239,68,68,0.06)',
            border:'1px solid rgba(239,68,68,0.2)',fontSize:13,color:'#EF4444',maxWidth:320,lineHeight:1.6,marginBottom:28}}>
            {lang==='pt'
              ? 'Se você acredita que isso foi um erro, entre em contato com o suporte pelo e-mail:'
              : lang==='es'
              ? 'Si crees que esto fue un error, contacta al soporte en:'
              : 'If you believe this was a mistake, contact support at:'}
            <br/><strong>support@usapoolmarket.com</strong>
          </div>
          <button onClick={()=>{ window.sb && window.sb.auth.signOut(); setIsLoggedIn(false); }}
            style={{padding:'12px 28px',borderRadius:12,border:'1.5px solid var(--pg-ink-200)',
              background:'transparent',color:'var(--pg-ink-600)',fontSize:14,fontWeight:600,
              cursor:'pointer',fontFamily:'inherit'}}>
            {lang==='pt'?'Sair da conta':lang==='es'?'Cerrar sesión':'Sign out'}
          </button>
        </div>
      )}

      {/* ── Main app ── */}
      {isLoggedIn && !user.banned && (
        <>
          {/* Pull-to-refresh indicator — fixed in the safe-area zone above the header */}
          {(pullDist > 4 || refreshing) && (
            <div style={{
              position:'fixed', top:0, left:0, right:0, zIndex:9999,
              display:'flex', justifyContent:'center',
              paddingTop:'max(10px, env(safe-area-inset-top, 10px))',
              pointerEvents:'none',
              transform:`translateY(${Math.min(pullDist, PULL_THRESHOLD) - PULL_THRESHOLD}px)`,
              transition: pullDist === 0 || refreshing ? 'transform .25s ease' : 'none',
            }}>
              <div style={{
                width:34, height:34, borderRadius:'50%',
                background:'var(--pg-white)',
                boxShadow:'0 2px 12px rgba(0,0,0,0.18)',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="var(--pg-blue-500)" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round"
                  style={{
                    animation: refreshing ? 'pg-spin .7s linear infinite' : 'none',
                    transform: !refreshing ? `rotate(${(pullDist/PULL_THRESHOLD)*270}deg)` : undefined,
                    transition: !refreshing ? 'none' : undefined,
                  }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
              </div>
            </div>
          )}

          {/* Screen content */}
          <div ref={screenRef} data-pg-screen
            onTouchStart={onPTRTouchStart}
            onTouchMove={onPTRTouchMove}
            onTouchEnd={onPTRTouchEnd}
            style={{position:'absolute', inset:0, paddingBottom:68, overflow:'auto', overscrollBehaviorY:'none'}}>
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

      {/* Overlays — called as function (not component) to avoid remount on re-render */}
      {OverlayBundle()}

      {/* Tweaks */}
      <TweaksPanel>
        <TweakSection label="Subscription tier"/>
        <TweakRadio value={t.tier} options={['free','premium','pro']}
          onChange={v=>{ setTweak('tier', v); }}/>
        <div style={{fontSize:10, color:'rgba(41,38,27,.55)', lineHeight:1.4, marginTop:-4}}>
          Free = Express Pools locked. Premium/PRO unlock apply + contact.
        </div>

        <TweakSection label="Language"/>
        <TweakRadio value={lang} options={['en','pt','es']}
          onChange={v=>setLang(v)}/>

        <TweakSection label="Quick jumps"/>
        <TweakButton onClick={()=>setIsLoggedIn(false)}>Show login screen</TweakButton>
        <TweakButton onClick={()=>{ setTab('quick'); }}>Open Express Pools</TweakButton>
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
