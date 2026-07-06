// app.jsx — root, tab routing, overlays

// ── Feedback Sheet ────────────────────────────────────────────
function FeedbackSheet({
  open,
  onClose,
  lang
}) {
  React.useEffect(() => {
    if (open) {
      _lockScreen();
      return () => _unlockScreen();
    }
  }, [open]);
  const [rating, setRating] = React.useState(0);
  const [hovered, setHovered] = React.useState(0);
  const [category, setCategory] = React.useState('');
  const [text, setText] = React.useState('');
  const [sent, setSent] = React.useState(false);
  const cats = lang === 'pt' ? [{
    id: 'bug',
    label: '🐛 Bug'
  }, {
    id: 'sugestao',
    label: '💡 Sugestão'
  }, {
    id: 'elogio',
    label: '👏 Elogio'
  }] : lang === 'es' ? [{
    id: 'bug',
    label: '🐛 Bug'
  }, {
    id: 'sugestao',
    label: '💡 Sugerencia'
  }, {
    id: 'elogio',
    label: '👏 Cumplido'
  }] : [{
    id: 'bug',
    label: '🐛 Bug'
  }, {
    id: 'sugestao',
    label: '💡 Suggestion'
  }, {
    id: 'elogio',
    label: '👏 Compliment'
  }];
  const title = lang === 'pt' ? 'Enviar Feedback' : lang === 'es' ? 'Enviar Feedback' : 'Send Feedback';
  const subLbl = lang === 'pt' ? 'Como está sendo sua experiência?' : lang === 'es' ? '¿Cómo es tu experiencia?' : 'How is your experience so far?';
  const catLbl = lang === 'pt' ? 'Tipo de feedback' : lang === 'es' ? 'Tipo de feedback' : 'Feedback type';
  const commentLbl = lang === 'pt' ? 'Comentário (opcional)' : lang === 'es' ? 'Comentario (opcional)' : 'Comment (optional)';
  const placeholder = lang === 'pt' ? 'O que você achou? Algo que não funcionou?' : lang === 'es' ? '¿Qué te pareció? ¿Algo que no funcionó?' : 'What did you think? Anything that didn\'t work?';
  const sendLbl = lang === 'pt' ? 'Enviar Feedback' : lang === 'es' ? 'Enviar Feedback' : 'Send Feedback';
  const thankLbl = lang === 'pt' ? '🎉 Obrigado pelo feedback!' : lang === 'es' ? '🎉 ¡Gracias por tu feedback!' : '🎉 Thanks for your feedback!';
  const thankSub = lang === 'pt' ? 'Sua opinião ajuda a melhorar o app.' : lang === 'es' ? 'Tu opinión ayuda a mejorar la app.' : 'Your input helps improve the app.';
  const closeLbl = lang === 'pt' ? 'Fechar' : lang === 'es' ? 'Cerrar' : 'Close';
  const handleSend = () => {
    const subject = encodeURIComponent(`[PoolGuyX Beta] ${category || 'Feedback'} — ${rating}⭐`);
    const body = encodeURIComponent(`Rating: ${'⭐'.repeat(rating)} (${rating}/5)\nType: ${category || 'general'}\n\n${text || '(no comment)'}`);
    window.open(`mailto:feedback@poolguyx.com?subject=${subject}&body=${body}`, '_blank');
    setSent(true);
  };
  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setRating(0);
      setCategory('');
      setText('');
      setSent(false);
      setHovered(0);
    }, 400);
  };
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "pg-sheet-backdrop",
    onClick: handleClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "pg-sheet",
    style: {
      padding: '0 0 32px'
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "pg-sheet-grabber"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 20px 16px',
      borderBottom: '0.5px solid var(--pg-ink-200)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--pg-font-display)',
      fontSize: 17,
      fontWeight: 700,
      color: 'var(--pg-ink-900)'
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--pg-ink-500)',
      marginTop: 3
    }
  }, subLbl)), sent ?
  /*#__PURE__*/
  /* ── Thank you state ── */
  React.createElement("div", {
    style: {
      padding: '40px 24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 12,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 52
    }
  }, "\uD83C\uDF89"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--pg-font-display)',
      fontSize: 18,
      fontWeight: 700,
      color: 'var(--pg-ink-900)'
    }
  }, thankLbl), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--pg-ink-500)',
      maxWidth: 240
    }
  }, thankSub), /*#__PURE__*/React.createElement("button", {
    onClick: handleClose,
    style: {
      marginTop: 16,
      height: 46,
      padding: '0 32px',
      borderRadius: 12,
      border: 'none',
      background: 'var(--pg-blue-500)',
      color: '#fff',
      fontSize: 14,
      fontWeight: 700,
      cursor: 'pointer',
      fontFamily: 'inherit'
    }
  }, closeLbl)) : /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 20px 8px',
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.07em',
      color: 'var(--pg-ink-500)',
      marginBottom: 10,
      textTransform: 'uppercase'
    }
  }, "Rating"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6
    }
  }, [1, 2, 3, 4, 5].map(n => /*#__PURE__*/React.createElement("button", {
    key: n,
    onClick: () => setRating(n),
    onMouseEnter: () => setHovered(n),
    onMouseLeave: () => setHovered(0),
    style: {
      fontSize: 34,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '0 2px',
      lineHeight: 1,
      filter: n <= (hovered || rating) ? 'none' : 'grayscale(1) opacity(0.35)',
      transform: n <= (hovered || rating) ? 'scale(1.15)' : 'scale(1)',
      transition: 'all .12s ease'
    }
  }, "\u2B50")))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.07em',
      color: 'var(--pg-ink-500)',
      marginBottom: 10,
      textTransform: 'uppercase'
    }
  }, catLbl), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, cats.map(c => /*#__PURE__*/React.createElement("button", {
    key: c.id,
    onClick: () => setCategory(c.id),
    style: {
      padding: '7px 14px',
      borderRadius: 999,
      border: '1.5px solid',
      borderColor: category === c.id ? 'var(--pg-blue-500)' : 'var(--pg-ink-200)',
      background: category === c.id ? 'var(--pg-blue-50)' : 'var(--pg-white)',
      color: category === c.id ? 'var(--pg-blue-700)' : 'var(--pg-ink-700)',
      fontSize: 13,
      fontWeight: 600,
      cursor: 'pointer',
      fontFamily: 'inherit',
      transition: 'all .12s'
    }
  }, c.label)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.07em',
      color: 'var(--pg-ink-500)',
      marginBottom: 8,
      textTransform: 'uppercase'
    }
  }, commentLbl), /*#__PURE__*/React.createElement("textarea", {
    className: "pg-textarea",
    value: text,
    onChange: e => setText(e.target.value),
    placeholder: placeholder,
    style: {
      minHeight: 90,
      fontSize: 14
    }
  })), /*#__PURE__*/React.createElement("button", {
    onClick: handleSend,
    disabled: rating === 0,
    style: {
      width: '100%',
      height: 50,
      borderRadius: 14,
      border: 'none',
      cursor: rating > 0 ? 'pointer' : 'not-allowed',
      fontFamily: 'inherit',
      fontSize: 15,
      fontWeight: 700,
      background: rating > 0 ? 'linear-gradient(135deg, #007AFF 0%, #0056CC 100%)' : 'var(--pg-ink-200)',
      color: rating > 0 ? '#fff' : 'var(--pg-ink-400)',
      boxShadow: rating > 0 ? '0 6px 20px rgba(0,122,255,0.30)' : 'none',
      transition: 'all .2s'
    }
  }, sendLbl))));
}
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "tier": "free",
  "lang": "en",
  "density": "regular",
  "showDevControls": true
} /*EDITMODE-END*/;
function DiagBar2() {
  const [info, setInfo] = React.useState(null);
  React.useEffect(() => {
    const measure = () => {
      const tb = document.querySelector('.pg-tabbar');
      const tbRect = tb ? tb.getBoundingClientRect() : null;
      const envDiv = document.createElement('div');
      envDiv.style.cssText = 'position:fixed;bottom:0;left:0;right:0;height:env(safe-area-inset-bottom,0px);pointer-events:none;visibility:hidden';
      document.body.appendChild(envDiv);
      const envPx = envDiv.offsetHeight;
      document.body.removeChild(envDiv);
      setInfo({
        innerH: window.innerHeight,
        innerW: window.innerWidth,
        screenH: screen.height,
        screenW: screen.width,
        docClientH: document.documentElement.clientHeight,
        vvH: window.visualViewport ? Math.round(window.visualViewport.height) : 'n/a',
        dpr: window.devicePixelRatio,
        env: envPx,
        tbBottom: tbRect ? Math.round(tbRect.bottom) : 'n/a',
        tbTop: tbRect ? Math.round(tbRect.top) : 'n/a',
        htmlBg: getComputedStyle(document.documentElement).backgroundColor,
        bodyBg: getComputedStyle(document.body).backgroundColor,
        stageBg: (() => {
          const s = document.getElementById('stage');
          return s ? getComputedStyle(s).backgroundColor : 'n/a';
        })()
      });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);
  if (!info) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      background: 'rgba(255,0,0,0.9)',
      color: '#fff',
      fontSize: 9,
      fontFamily: 'monospace',
      padding: '4px 6px',
      lineHeight: 1.4,
      pointerEvents: 'none',
      whiteSpace: 'pre-wrap'
    }
  }, `innerH=${info.innerH} innerW=${info.innerW} screenH=${info.screenH} screenW=${info.screenW}\ndocClientH=${info.docClientH} vvH=${info.vvH} dpr=${info.dpr} env=${info.env}px\ntbTop=${info.tbTop} tbBottom=${info.tbBottom} (gap below tb = ${info.innerH - info.tbBottom}px)\nhtmlBg=${info.htmlBg} bodyBg=${info.bodyBg} stageBg=${info.stageBg}`);
}
function App() {
  const _savedTier = typeof localStorage !== 'undefined' && localStorage.getItem('pg_tier') || null;
  const [t, setTweak] = useTweaks({
    ...TWEAK_DEFAULTS,
    ...(_savedTier ? {
      tier: _savedTier
    } : {})
  });
  // If launched via a listing deep link, start on market tab; otherwise restore from URL hash
  // Hash format: #tab  OR  #tab/sub  (e.g. #work/vac, #market/routes)
  const [tab, setTab] = React.useState(() => {
    try {
      const hash = window.location.hash.replace(/^#\/?/, '');
      const base = hash.split(/[/?]/)[0];
      const VALID = ['home', 'market', 'quick', 'work', 'profile'];
      if (VALID.includes(base)) return base;
      return new URLSearchParams(window.location.search).get('listing') ? 'market' : 'home';
    } catch (e) {
      return 'home';
    }
  });

  // Keep URL hash in sync with active tab — preserve sub-segment when already on same base
  React.useEffect(() => {
    try {
      const cur = window.location.hash.replace(/^#\/?/, '');
      const curBase = cur.split(/[/?]/)[0];
      // If already on this tab and has a sub-segment or query params, preserve it
      if (curBase === tab && (cur.includes('/') || cur.includes('?'))) return;
      window.history.replaceState(null, '', '#' + tab);
    } catch (e) {}
  }, [tab]);

  // Sync tab when user navigates with browser back/forward buttons
  // Also handles deep links from notification clicks on iOS (openWindow triggers hashchange)
  React.useEffect(() => {
    const onHash = () => {
      const raw = window.location.hash; // e.g. '#chat?user=UID&name=Name'
      const hash = raw.replace(/^#\/?/, '');
      const base = hash.split(/[/?]/)[0];
      if (base === 'chat') {
        const qs = raw.includes('?') ? raw.slice(raw.indexOf('?') + 1) : '';
        const params = new URLSearchParams(qs);
        const userId = params.get('user') || null;
        const userName = params.get('name') || null;
        if (userId) {
          window.history.replaceState(null, '', '#home');
          setChatConvoTarget({
            id: userId,
            name: userName || undefined
          });
          setChatOpen(true);
        }
        return;
      }
      const VALID = ['home', 'market', 'quick', 'work', 'profile'];
      if (VALID.includes(base)) setTab(base);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const screenRef = React.useRef(null);

  // ── Pull-to-refresh (main tabs only — disabled when any sheet/overlay is open) ──
  const pullStartY = React.useRef(null);
  const [pullDist, setPullDist] = React.useState(0);
  const [refreshing, setRefreshing] = React.useState(false);
  const PULL_THRESHOLD = 64;
  const onPTRTouchStart = React.useCallback(e => {
    // Disable PTR when any sheet or full-page overlay is open
    if (document.querySelector('.pg-sheet-backdrop')) return;
    if (document.querySelector('[data-pg-fullpage]')) return;
    if (!screenRef.current || screenRef.current.scrollTop !== 0) return;
    let el = e.target;
    while (el && el !== screenRef.current) {
      if (el.scrollTop > 0) return;
      el = el.parentElement;
    }
    pullStartY.current = e.touches[0].clientY;
  }, []);
  const onPTRTouchMove = React.useCallback(e => {
    if (pullStartY.current === null) return;
    const dy = e.touches[0].clientY - pullStartY.current;
    if (dy > 0) {
      if (screenRef.current && screenRef.current.scrollTop > 0) {
        pullStartY.current = null;
        setPullDist(0);
        return;
      }
      setPullDist(Math.min(dy * 0.55, 80));
    } else {
      pullStartY.current = null;
      setPullDist(0);
    }
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
  const switchTab = React.useCallback(newTab => {
    setTab(prev => {
      // Double-tap Home → reload page
      if (prev === 'home' && newTab === 'home') {
        window.location.reload();
        return prev;
      }
      return newTab;
    });
    // Scroll to top whenever a new tab is selected
    requestAnimationFrame(() => {
      if (screenRef.current) screenRef.current.scrollTop = 0;
    });
  }, []);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [sessionExpired, setSessionExpired] = React.useState(false);
  const [user, setUser] = React.useState({
    name: '',
    email: '',
    uid: '',
    role: 'user',
    tier: t.tier,
    rating: null,
    reviews: 0,
    regions: ['Broward', 'Weston', 'Plantation'],
    // Profile fields — start empty; each user fills these in themselves
    age: null,
    region: '',
    hasCar: false,
    hasLicense: false,
    hasEquipment: false,
    equipment: null,
    experience: []
  });
  const loadProfile = React.useCallback(async sbUser => {
    if (!sbUser || !window.sb) return;
    // Set uid+email immediately — doesn't need DB, ensures isMyPost() works even if query fails
    setUser(u => ({
      ...u,
      uid: sbUser.id,
      email: sbUser.email
    }));
    let {
      data: profile,
      error: pErr
    } = await window.sb.from('profiles').select('*').eq('id', sbUser.id).single();
    if (pErr) {
      console.warn('[loadProfile] DB error:', pErr.message, '— using cached role');
      // Use last known role from localStorage as fallback (set on successful login)
      const cachedRole = (() => {
        try {
          return localStorage.getItem('pg_role') || 'user';
        } catch (e) {
          return 'user';
        }
      })();
      setUser(u => ({
        ...u,
        role: cachedRole
      }));
      return;
    }
    // If no profile row exists, create a minimal one so the app works correctly
    if (!profile) {
      const fallbackName = sbUser.email ? sbUser.email.split('@')[0] : '';
      await window.sb.from('profiles').insert({
        id: sbUser.id,
        name: fallbackName,
        role: 'user'
      });
      profile = {
        name: fallbackName,
        role: 'user',
        phone: '',
        region: '',
        photo_url: ''
      };
    }
    // Cache role for future sessions (used as fallback if DB is unreachable on page reload)
    if (profile?.role) {
      try {
        localStorage.setItem('pg_role', profile.role);
      } catch (e) {}
    }
    // Sanitize: never use an email address as a display name
    const rawName = profile?.name || '';
    const cleanName = rawName && !rawName.includes('@') ? rawName : '';
    setUser(u => ({
      ...u,
      name: cleanName,
      phone: profile?.phone || '',
      region: profile?.region || '',
      role: profile?.role || 'user',
      photoUrl: profile?.photo_url || '',
      email: sbUser.email,
      uid: sbUser.id,
      verified: profile?.verified || false,
      verificationRequested: profile?.verification_requested || false,
      phoneVerified: profile?.phone_verified || false,
      banned: profile?.banned || false,
      notifPrefs: profile?.notif_prefs || {
        chat: true,
        quick: true,
        market: true,
        work: true
      }
    }));
    // Load regionsByDay from profile if saved
    if (profile?.regions_by_day && Object.keys(profile.regions_by_day).length > 0) {
      setRegionsByDay(profile.regions_by_day);
    }
    // Live rating/review count — computed from real ratings received, never cached/hardcoded.
    // Only counts ratings that are actually revealed (both sides rated, or the 7-day blind
    // window expired) — otherwise a seller could see their own score the instant they rate
    // a buyer, before the buyer has had a chance to rate back.
    window.sb.from('ratings').select('stars').eq('to_id', sbUser.id).or('pending.eq.false,expires_at.lt.' + new Date().toISOString()).then(({
      data
    }) => {
      const stars = (data || []).map(r => r.stars).filter(s => s != null);
      const avg = stars.length ? Math.round(stars.reduce((a, b) => a + b, 0) / stars.length * 10) / 10 : null;
      setUser(u => ({
        ...u,
        rating: avg,
        reviews: stars.length
      }));
    }).catch(() => {});
  }, []);

  // authReady gates the data fetch — ensures profile is loaded before querying DB
  const [authReady, setAuthReady] = React.useState(false);

  // Hide splash screen once auth is resolved (app is ready to show UI)
  React.useEffect(() => {
    if (authReady && window.__pgHideSplash) window.__pgHideSplash();
  }, [authReady]);
  const [showOnboarding, setShowOnboarding] = React.useState(false);
  const handleAuthLogin = React.useCallback(async sbUser => {
    setIsLoggedIn(true);
    await loadProfile(sbUser);
    if (!localStorage.getItem('pg_onboarded')) {
      setShowOnboarding(true);
    }
  }, [loadProfile]);

  // ── Boot sequence: getSession → refresh token → loadProfile → signal ready ──
  // Must complete BEFORE data fetch runs (authReady gates it)
  React.useEffect(() => {
    // Force logout hook — called by Supabase client when token refresh fails (deleted account)
    window.__pgForceLogout = () => {
      setIsLoggedIn(false);
      setSessionExpired(true);
      setTab('home');
      setUser(u => ({
        ...u,
        name: '',
        email: '',
        uid: '',
        role: 'user'
      }));
    };

    // Check token expiry every 2 minutes; show re-login modal if expired mid-session
    const _checkTokenExpiry = () => {
      try {
        const s = JSON.parse(localStorage.getItem('pg_s') || 'null');
        if (!s?.t) return;
        const payload = JSON.parse(atob(s.t.split('.')[1]));
        const expiresAt = payload.exp * 1000;
        if (Date.now() > expiresAt) {
          setIsLoggedIn(false);
          setSessionExpired(true);
          localStorage.removeItem('pg_s');
        }
      } catch (e) {}
    };
    const _expiryTimer = setInterval(_checkTokenExpiry, 120_000);
    if (!window.sb) {
      setAuthReady(true);
      return () => clearInterval(_expiryTimer);
    }
    (async () => {
      try {
        const {
          data: {
            session
          }
        } = await window.sb.auth.getSession();
        if (session) {
          // Fire-and-forget: token refresh + profile load run in background
          // so data fetch (jobs/market) starts immediately without waiting for them
          window.sb.auth.refresh && window.sb.auth.refresh().catch(() => {});
          handleAuthLogin(session.user); // non-blocking — sets user + isLoggedIn when done
        }
      } catch (e) {
        console.warn('[Auth] Session restore failed:', e.message);
      } finally {
        setAuthReady(true); // ungate data fetch immediately — public tables need no auth
      }
    })();
    return () => clearInterval(_expiryTimer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [lang, setLangState] = React.useState(() => {
    try {
      return localStorage.getItem('pg_lang') || t.lang;
    } catch (e) {
      return t.lang;
    }
  });
  // Per-weekday region preferences for notifications (loaded from Supabase on login)
  const [regionsByDay, setRegionsByDay] = React.useState({
    mon: [],
    tue: [],
    wed: [],
    thu: [],
    fri: [],
    sat: [],
    sun: []
  });
  const saveRegionsByDay = React.useCallback(async rbd => {
    if (!window.sb || !user?.uid) return;
    try {
      await window.sb.from('profiles').update({
        regions_by_day: rbd
      }).eq('id', user.uid);
    } catch {}
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
      const {
        data
      } = await window.sb.rpc('get_my_unread_count', {});
      setHasUnreadChat(typeof data === 'number' ? data > 0 : false);
    } catch (e) {}
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
      // Find people who rated ME but I haven't rated back yet.
      // NOTE: `pending` stays true even after the rater submits — it means "still in the
      // 7-day blind window", not "not yet submitted". So we must check stars IS NOT NULL
      // (valid stars are 1-5, never 0) to know the OTHER side actually rated me, instead
      // of filtering on `pending` here.
      const {
        data: received
      } = await window.sb.from('ratings').select('id,listing_id,listing_name,from_id,from_name,to_id,connection_type,connection_id,created_at,expires_at').eq('to_id', user.uid).neq('stars', 0).order('created_at', {
        ascending: true
      });
      if (!received || received.length === 0) {
        setPendingRatings([]);
        return;
      }
      const now = Date.now();
      const notExpired = received.filter(r => !r.expires_at || new Date(r.expires_at).getTime() > now);
      if (notExpired.length === 0) {
        setPendingRatings([]);
        return;
      }
      // Filter out ones I already rated back — my own reciprocal row always exists as an
      // empty placeholder from the moment the sale closes, so check it has real stars too,
      // not just that a row exists.
      const {
        data: myRatings
      } = await window.sb.from('ratings').select('to_id').eq('from_id', user.uid).neq('stars', 0).in('to_id', notExpired.map(r => r.from_id));
      const alreadyRated = new Set((myRatings || []).map(r => r.to_id));
      setPendingRatings(notExpired.filter(r => !alreadyRated.has(r.from_id)));
    } catch (e) {}
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
  window.sendPush = async function (userId, title, body, url, notifType, convoId) {
    try {
      const {
        data: {
          session
        }
      } = await window.sb.auth.getSession();
      const token = session?.access_token || '';
      await fetch('https://xiszfqghizqzlwyrfjol.supabase.co/functions/v1/send-push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: userId,
          title,
          body,
          url,
          notif_type: notifType,
          convo_id: convoId || null
        })
      });
    } catch (e) {}
  };

  // Play a short notification beep using Web Audio API (in-app only)
  window.playNotifSound = function () {
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.connect(g);
      g.connect(ac.destination);
      o.type = 'sine';
      o.frequency.value = 880;
      g.gain.setValueAtTime(0, ac.currentTime);
      g.gain.linearRampToValueAtTime(0.25, ac.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.25);
      o.start(ac.currentTime);
      o.stop(ac.currentTime + 0.25);
    } catch (e) {}
  };
  const [pushLog, setPushLog] = React.useState(() => {
    try {
      const stored = localStorage.getItem('pg_push_log') || '';
      // Only restore final states (✅ or ❌) — never restore intermediate "aguardando..." messages
      return stored.startsWith('✅') || stored.startsWith('❌') ? stored : '';
    } catch {
      return '';
    }
  });
  const _setPushLog = msg => {
    setPushLog(msg);
    try {
      localStorage.setItem('pg_push_log', msg);
    } catch {}
  };

  // manual=true: called from user tap (shows steps, requests permission)
  // manual=false: silent auto-check on login (only refreshes existing sub)
  const _registerPush = React.useCallback(async (manual = false) => {
    if (!user?.uid) return;
    if (!('serviceWorker' in navigator)) {
      if (manual) _setPushLog('❌ serviceWorker não suportado');
      return;
    }
    if (!('PushManager' in window)) {
      if (manual) _setPushLog('❌ PushManager indisponível — abra pelo ícone da Home Screen');
      return;
    }

    // iOS requires Notification.requestPermission() to be called BEFORE any await
    // so it stays within the user gesture context. Do it first on manual tap.
    if (manual) {
      _setPushLog('pedindo permissão...');
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        _setPushLog('❌ permissão negada — ative em Configurações > ' + (window.navigator.userAgent.includes('iPhone') ? 'PoolGuyPro' : 'Notificações'));
        return;
      }
    }
    try {
      let reg = await navigator.serviceWorker.getRegistration('/');
      if (!reg) reg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      // pushManager.subscribe() requires an *active* SW — wait for it if needed
      if (!reg.active) {
        reg = await Promise.race([navigator.serviceWorker.ready, new Promise((_, reject) => setTimeout(() => reject(new Error('SW não ativou a tempo')), 20000))]);
      }
      if (!reg || !reg.pushManager) {
        if (manual) _setPushLog('❌ push não disponível neste dispositivo');
        return;
      }
      if (!manual) {
        // Silent path: only refresh if subscription already exists
        const existing = await reg.pushManager.getSubscription();
        if (!existing) return;
        const j = existing.toJSON();
        await window.sb.from('push_subscriptions').upsert({
          user_id: user.uid,
          endpoint: j.endpoint,
          p256dh: j.keys.p256dh,
          auth: j.keys.auth
        }, {
          onConflict: 'user_id,endpoint'
        });
        _setPushLog('✅ notificações ativas');
        return;
      }

      // Manual path: subscribe (existing or new)
      _setPushLog('ativando...');
      const existing = await reg.pushManager.getSubscription();
      const sub = existing || (await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC)
      }));
      const j = sub.toJSON();
      const {
        error
      } = await window.sb.from('push_subscriptions').upsert({
        user_id: user.uid,
        endpoint: j.endpoint,
        p256dh: j.keys.p256dh,
        auth: j.keys.auth
      }, {
        onConflict: 'user_id,endpoint'
      });
      if (error) {
        _setPushLog('❌ erro ao salvar: ' + error.message);
        return;
      }
      _setPushLog('✅ notificações ativas');
    } catch (e) {
      if (manual) _setPushLog('❌ ' + (e.message || String(e)));
    }
  }, [user?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-register silently on login (no permission prompt — only refreshes existing sub)
  React.useEffect(() => {
    if (!isLoggedIn || !user?.uid) return;
    const t = setTimeout(() => _registerPush(false), 2000);
    return () => clearTimeout(t);
  }, [isLoggedIn, user?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  // Overlays
  const [chatOpen, setChatOpen] = React.useState(false);
  const [chatConvoTarget, setChatConvoTarget] = React.useState(null); // string | { id, name }

  // Opening chat from a push-notification deep link only tells us WHO sent the
  // message, not which conversation thread it belongs to (general vs tied to a
  // specific listing) — conversations are keyed by makeConvoId(me, other, listingId),
  // so guessing listingId=null here would land in the wrong (often brand-new) thread
  // whenever the real conversation was scoped to a listing. Look up the most recently
  // active real conversation between the two of us first, and reuse its listing scope.
  const openChatFromDeepLink = React.useCallback(async (userId, userName) => {
    let listingId = null,
      listingContext = null,
      name = userName || undefined;
    try {
      if (window.sb && user?.uid && userId) {
        const q = `and(participant_1.eq.${user.uid},participant_2.eq.${userId}),and(participant_1.eq.${userId},participant_2.eq.${user.uid})`;
        const {
          data
        } = await window.sb.from('conversations').select('*').or(q).order('last_message_at', {
          ascending: false
        }).limit(1);
        const row = data && data[0];
        if (row) {
          listingId = row.listing_id || null;
          if (listingId) listingContext = {
            name: row.listing_name || null,
            photoUrl: row.listing_photo_url || null
          };
          const amP1 = row.participant_1 === user.uid;
          name = (amP1 ? row.name_2 : row.name_1) || name;
        }
      }
    } catch {}
    setChatConvoTarget({
      id: userId,
      name,
      listingId,
      listingContext
    });
    setChatOpen(true);
  }, [user?.uid]);
  const [pendingQuickJobId, setPendingQuickJobId] = React.useState(() => {
    try {
      const hash = window.location.hash; // e.g. "#quick?job=uuid"
      const qs = hash.includes('?') ? hash.slice(hash.indexOf('?') + 1) : '';
      const jobId = new URLSearchParams(qs).get('job') || null;
      if (jobId) window.history.replaceState(null, '', '#quick');
      return jobId;
    } catch {
      return null;
    }
  });
  // Parse deep link from URL on startup (e.g. notification click when app was closed)
  const [pendingDeepLink, setPendingDeepLink] = React.useState(() => {
    try {
      const hash = window.location.hash;
      if (hash.startsWith('#chat')) {
        const qs = hash.includes('?') ? hash.slice(hash.indexOf('?') + 1) : '';
        const params = new URLSearchParams(qs);
        const userId = params.get('user') || null;
        const userName = params.get('name') || null;
        if (userId) {
          window.history.replaceState(null, '', '#home');
          return {
            type: 'chat',
            userId,
            userName
          };
        }
      } else if (hash.startsWith('#market')) {
        return {
          type: 'tab',
          tab: 'market'
        };
      }
    } catch {}
    return null;
  });
  // Execute pending deep link once user is logged in
  React.useEffect(() => {
    if (!pendingDeepLink || !user?.uid) return;
    setPendingDeepLink(null);
    if (pendingDeepLink.type === 'chat') {
      openChatFromDeepLink(pendingDeepLink.userId, pendingDeepLink.userName);
    } else if (pendingDeepLink.type === 'tab') {
      setTab(pendingDeepLink.tab);
    }
  }, [pendingDeepLink, user?.uid, openChatFromDeepLink]);
  // Listen for service worker postMessage (notification click while app is open)
  React.useEffect(() => {
    if (!navigator.serviceWorker) return;
    const handler = event => {
      if (event.data?.type !== 'OPEN_JOB') return;
      window.playNotifSound && window.playNotifSound();
      const url = event.data.url || '';
      const hashIdx = url.indexOf('#');
      const hash = hashIdx >= 0 ? url.slice(hashIdx) : '';
      if (hash.startsWith('#chat')) {
        const qs = hash.includes('?') ? hash.slice(hash.indexOf('?') + 1) : '';
        const params = new URLSearchParams(qs);
        const userId = params.get('user') || null;
        const userName = params.get('name') || null;
        if (userId) {
          openChatFromDeepLink(userId, userName);
        }
      } else if (hash.startsWith('#quick')) {
        const qs = hash.includes('?') ? hash.slice(hash.indexOf('?') + 1) : '';
        const jobId = new URLSearchParams(qs).get('job') || null;
        if (jobId) {
          window.history.replaceState(null, '', '#quick');
          setPendingQuickJobId(jobId);
          setTab('quick');
        } else {
          setTab('quick');
        }
      } else if (hash.startsWith('#market')) {
        setTab('market');
      } else if (hash.startsWith('#work')) {
        setTab('work');
      }
    };
    navigator.serviceWorker.addEventListener('message', handler);
    return () => navigator.serviceWorker.removeEventListener('message', handler);
  }, [openChatFromDeepLink]);
  const [notifOpen, setNotifOpen] = React.useState(false);
  // Unread badges — derived from real Supabase data
  const [hasUnreadChat, setHasUnreadChat] = React.useState(false);
  const [hasUnreadNotif, setHasUnreadNotif] = React.useState(false);
  const [payOpen, setPayOpen] = React.useState(false);
  const [payContext, setPayContext] = React.useState(null);
  const [postMenuOpen, setPostMenuOpen] = React.useState(false);
  const [postQPOpen, setPostQPOpen] = React.useState(false);
  const [editQPJob, setEditQPJob] = React.useState(null);
  const [regionOpen, setRegionOpen] = React.useState(false);
  const [langPickerOpen, setLangPickerOpen] = React.useState(false);
  const [applicantsPost, setApplicantsPost] = React.useState(null);
  const [verifyOpen, setVerifyOpen] = React.useState(false);
  const [pushNotifOpen, setPushNotifOpen] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const [walletOpen, setWalletOpen] = React.useState(false);
  const [feedbackOpen, setFeedbackOpen] = React.useState(false);
  const [jobDetailApp, setJobDetailApp] = React.useState(null);
  const [reviewApp, setReviewApp] = React.useState(null);
  const [marketPostOpen, setMarketPostOpen] = React.useState(false);
  const [vacSheetOpen, setVacSheetOpen] = React.useState(false);
  const [editingVac, setEditingVac] = React.useState(null); // vac object being edited
  const [hiringSheetOpen, setHiringSheetOpen] = React.useState(false);
  const [techSheetOpen, setTechSheetOpen] = React.useState(false);
  const [dayPickerVac, setDayPickerVac] = React.useState(null);
  const [scheduleApp, setScheduleApp] = React.useState(null);
  const [hiringAppDetail, setHiringAppDetail] = React.useState(null);
  const [applyJob, setApplyJob] = React.useState(null);
  const [editProfileOpen, setEditProfileOpen] = React.useState(false);
  const [publicProfileUser, setPublicProfileUser] = React.useState(null);
  const [helpOpen, setHelpOpen] = React.useState(false);
  const [privacyOpen, setPrivacyOpen] = React.useState(false);
  const [pendingRatings, setPendingRatings] = React.useState([]); // ratings to submit
  const [activeRating, setActiveRating] = React.useState(null); // current RatingSheet
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
    try {
      return new URLSearchParams(window.location.search).get('listing') || null;
    } catch (e) {
      return null;
    }
  });

  // ── Dark mode ─────────────────────────────────────────────────
  const [darkMode, setDarkModeState] = React.useState(() => {
    try {
      return localStorage.getItem('pg_dark') === '1';
    } catch (e) {
      return false;
    }
  });
  React.useEffect(() => {
    const stage = document.getElementById('stage');
    if (stage) stage.setAttribute('data-pg-dark', darkMode ? '1' : '0');
    try {
      localStorage.setItem('pg_dark', darkMode ? '1' : '0');
    } catch (e) {}
    // iOS safe-area strip (home indicator) below the CSS viewport is painted by the
    // CANVAS, which per CSS spec takes the ROOT (<html>) background — but only while
    // <body> stays transparent. A fixed <body> with its own background does NOT
    // propagate, leaving the strip black. So set ONLY <html>, never <body>.
    // Must match --pg-bg from tokens.css exactly, or the strip shows a visibly
    // different shade than the rest of the app (e.g. FullPage screens).
    const bg = darkMode ? '#0D1117' : '#F4F8FB';
    document.documentElement.style.background = bg;
    document.body.style.background = 'transparent';
  }, [darkMode]);
  const toggleDark = React.useCallback(() => setDarkModeState(v => !v), []);

  // ── Live Firestore data ────────────────────────────────────
  const [liveJobs, setLiveJobs] = React.useState([]);
  const [liveTechs, setLiveTechs] = React.useState([]);
  const [liveVacations, setLiveVacations] = React.useState([]);
  const [liveMarket, setLiveMarket] = React.useState([]);
  const [liveApplications, setLiveApplications] = React.useState([]); // current user's job applications
  // { [job_id]: { total, pending, withInterview } } — applicant counts for jobs the current user owns
  const [jobApplicantCounts, setJobApplicantCounts] = React.useState({});
  // Ref keeps the latest job IDs accessible in event callbacks without stale closure
  const liveJobIdsRef = React.useRef([]);
  React.useEffect(() => {
    liveJobIdsRef.current = liveJobs.map(j => j._id);
  }, [liveJobs]);
  React.useEffect(() => {
    if (!window.sb || !authReady) return;

    // Normalizers — Supabase uses snake_case columns
    const normJob = r => ({
      _id: r.id,
      _live: true,
      role: r.role,
      loc: r.loc,
      desc: r.description,
      contract: r.contract,
      payMode: r.pay_mode,
      pay: r.pay,
      carReq: r.car_req,
      licenseReq: r.license_req,
      equipReq: r.equip_req,
      author: r.author,
      author_id: r.author_id || null,
      hiredAt: r.hired_at || null
    });
    const normTech = r => ({
      _id: r.id,
      _live: true,
      name: r.name,
      specialty: r.specialty,
      photoUrl: r.photo_url || null,
      loc: r.loc,
      phone: r.phone,
      email: r.email,
      rateMode: r.rate_mode,
      rate: r.rate,
      author: r.author,
      author_id: r.author_id || null
    });
    const normVac = r => {
      const wr = r.weekday_regions || {};
      const allCities = [...new Set(Object.values(wr).flat())];
      const region = allCities.slice(0, 3).join(' / ') || '';
      return {
        _id: r.id,
        _live: true,
        monthIdx: r.month_idx,
        year: r.year,
        yearMonth: {
          year: r.year,
          month: r.month_idx
        },
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
        author: r.author,
        author_id: r.author_id || null,
        ownerId: r.author_id || null
      };
    };
    const normMkt = r => ({
      _id: r.id,
      _live: true,
      type: r.type,
      name: r.name,
      cat: r.cat,
      condition: r.condition,
      price: r.price,
      priceMode: r.price_mode,
      loc: r.loc,
      routeName: r.route_name,
      clients: r.clients,
      revenue: r.revenue,
      asking: r.asking,
      area: r.area,
      description: r.description || '',
      address: r.address || null,
      system: r.pool_system || null,
      sizeFt: r.size_ft || null,
      gallons: r.gallons || null,
      freq: r.freq_week || null,
      warranty: r.warranty || null,
      warrantyMonths: r.warranty_months || null,
      author: r.author,
      author_id: r.author_id || null,
      photoUrl: r.photo_url || null,
      photoUrls: r.photo_urls && r.photo_urls.length > 0 ? r.photo_urls : r.photo_url ? [r.photo_url] : [],
      rentPeriod: r.rent_period || null,
      rentPrices: r.rent_prices || null,
      status: r.status || 'pending',
      createdAt: r.created_at || null,
      soldAt: r.sold_at || null,
      boostedUntil: r.boosted_until || null
    });

    // Clean up sold listings older than 1 day (fire-and-forget)
    window.sb.rpc('cleanup_old_sold_listings').then(() => {}).catch(() => {});

    // Data fetch — runs AFTER auth is ready (authReady gate above)
    const doFetch = async () => {
      const [j, tc, v, m] = await Promise.all([window.sb.from('jobs').select('*').order('created_at', {
        ascending: false
      }), window.sb.from('techs_public').select('*').order('created_at', {
        ascending: false
      }), window.sb.from('vacations').select('*').order('created_at', {
        ascending: false
      }), window.sb.from('marketplace').select('*').order('created_at', {
        ascending: false
      })]);
      if (j.data) setLiveJobs(j.data.map(normJob));
      if (tc.data) {
        const techAuthorIds = tc.data.map(r => r.author_id).filter(Boolean);
        if (techAuthorIds.length > 0) {
          const {
            data: ratingRows
          } = await window.sb.from('ratings').select('to_id, stars').in('to_id', techAuthorIds);
          const ratingMap = {};
          (ratingRows || []).forEach(r => {
            if (!ratingMap[r.to_id]) ratingMap[r.to_id] = {
              sum: 0,
              count: 0
            };
            ratingMap[r.to_id].sum += r.stars;
            ratingMap[r.to_id].count++;
          });
          setLiveTechs(tc.data.map(r => {
            const rm = ratingMap[r.author_id];
            return {
              ...normTech(r),
              rating: rm ? Math.round(rm.sum / rm.count * 10) / 10 : null,
              reviewCount: rm ? rm.count : 0
            };
          }));
        } else {
          setLiveTechs(tc.data.map(normTech));
        }
      }
      if (v.data) setLiveVacations(v.data.map(normVac));
      if (m.data) setLiveMarket(m.data.map(normMkt));
      if (m.error) console.warn('[Supabase] marketplace fetch error:', m.error.message);
      // Load applicant counts in background — non-blocking, doesn't delay UI render
      if (j.data && j.data.length > 0) {
        const jobIds = j.data.map(r => r.id);
        liveJobIdsRef.current = jobIds;
        window.sb.from('job_applications').select('job_id, status, interview_day').in('job_id', jobIds).then(({
          data: appRows
        }) => {
          if (!appRows) return;
          const counts = {};
          appRows.forEach(row => {
            if (!counts[row.job_id]) counts[row.job_id] = {
              total: 0,
              pending: 0,
              withInterview: 0
            };
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
      const {
        data: appRows
      } = await window.sb.from('job_applications').select('job_id, status, interview_day').in('job_id', ids);
      if (!appRows) return;
      const counts = {};
      appRows.forEach(row => {
        if (!counts[row.job_id]) counts[row.job_id] = {
          total: 0,
          pending: 0,
          withInterview: 0,
          completed: 0
        };
        counts[row.job_id].total++;
        if (row.status === 'pending') counts[row.job_id].pending++;
        if (row.interview_day) counts[row.job_id].withInterview++;
        if (row.status === 'completed') counts[row.job_id].completed++;
      });
      setJobApplicantCounts(counts);
    };

    // Refresh marketplace when tab regains focus (catches deletes/updates from other devices/tabs)
    const doMarketRefresh = async () => {
      if (!window.sb) return;
      const {
        data
      } = await window.sb.from('marketplace').select('*').order('created_at', {
        ascending: false
      });
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
    const pollTimer = setInterval(doMarketRefresh, 60000);
    const countTimer = setInterval(doCountsRefresh, 30000);
    const appsTimer = setInterval(() => {
      if (user?.uid) loadLiveApplications(user.uid);
    }, 30000);

    // Real-time subscriptions
    const channel = window.sb.channel('app-realtime').on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'jobs'
    }, p => setLiveJobs(prev => [normJob(p.new), ...prev])).on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'jobs'
    }, p => setLiveJobs(prev => prev.map(j => j._id === p.new.id ? normJob(p.new) : j))).on('postgres_changes', {
      event: 'DELETE',
      schema: 'public',
      table: 'jobs'
    }, p => setLiveJobs(prev => prev.filter(j => j._id !== p.old.id))).on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'techs'
    }, p => setLiveTechs(prev => [normTech(p.new), ...prev])).on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'vacations'
    }, p => setLiveVacations(prev => [normVac(p.new), ...prev])).on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'marketplace'
    }, p => setLiveMarket(prev => [normMkt(p.new), ...prev])).on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'marketplace'
    }, p => setLiveMarket(prev => prev.map(m => m._id === p.new.id ? normMkt(p.new) : m))).on('postgres_changes', {
      event: 'DELETE',
      schema: 'public',
      table: 'marketplace'
    }, p => setLiveMarket(prev => prev.filter(m => m._id !== p.old.id)))
    // Update applicant counts in real-time when someone applies to (or updates) a job
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'job_applications'
    }, p => {
      if (!p.new || !p.new.job_id) return;
      setJobApplicantCounts(prev => {
        const curr = prev[p.new.job_id] || {
          total: 0,
          pending: 0,
          withInterview: 0
        };
        return {
          ...prev,
          [p.new.job_id]: {
            total: curr.total + 1,
            pending: p.new.status === 'pending' ? curr.pending + 1 : curr.pending,
            withInterview: p.new.interview_day ? curr.withInterview + 1 : curr.withInterview
          }
        };
      });
    }).on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'job_applications'
    }, p => {
      if (!p.new || !p.new.job_id || !window.sb) return;
      // Re-query counts for this job to get accurate state after status change
      window.sb.from('job_applications').select('job_id, status, interview_day').eq('job_id', p.new.job_id).then(({
        data
      }) => {
        if (!data) return;
        setJobApplicantCounts(prev => ({
          ...prev,
          [p.new.job_id]: {
            total: data.length,
            pending: data.filter(r => r.status === 'pending').length,
            withInterview: data.filter(r => r.interview_day).length
          }
        }));
      });
    }).subscribe(status => {
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

  // ── Online presence heartbeat ────────────────────────────────
  React.useEffect(() => {
    if (!authReady || !user?.uid || !window.sb) return;
    const uid = user.uid;
    const setOnline = online => window.sb.from('profiles').update({
      is_online: online,
      last_seen: new Date().toISOString()
    }).eq('id', uid).then(() => {});
    setOnline(true);
    const heartbeat = setInterval(() => {
      if (document.visibilityState === 'visible') setOnline(true);
    }, 25000);
    const onVis = () => setOnline(document.visibilityState === 'visible');
    const onUnload = () => setOnline(false);
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('beforeunload', onUnload);
    return () => {
      clearInterval(heartbeat);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('beforeunload', onUnload);
      setOnline(false);
    };
  }, [authReady, user?.uid]);

  // Notifications unread badge — fetch count + real-time
  React.useEffect(() => {
    if (!authReady || !user?.uid || !window.sb) return;
    window.sb.from('notifications').select('id').eq('user_id', user.uid).eq('read', false).then(({
      data
    }) => {
      if (data) setHasUnreadNotif(data.length > 0);
    });
    const ch = window.sb.channel('notif-badge-' + user.uid).on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${user.uid}`
    }, () => setHasUnreadNotif(true)).subscribe();
    return () => window.sb.removeChannel(ch);
  }, [authReady, user?.uid]);
  const loadLiveJobs = React.useCallback(async () => {
    if (!window.sb) return;
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const {
      data
    } = await window.sb.from('jobs').select('*').or(`hired_at.is.null,hired_at.gte.${oneDayAgo}`).order('created_at', {
      ascending: false
    });
    if (data) setLiveJobs(data.map(r => ({
      _id: r.id,
      _live: true,
      role: r.role,
      loc: r.loc,
      desc: r.description,
      contract: r.contract,
      payMode: r.pay_mode,
      pay: r.pay,
      carReq: r.car_req,
      licenseReq: r.license_req,
      equipReq: r.equip_req,
      author: r.author,
      author_id: r.author_id || null,
      hiredAt: r.hired_at || null
    })));
  }, []);

  // Live job applications — current user's applications + real-time status updates
  const loadLiveApplications = React.useCallback(async uid => {
    if (!window.sb || !uid) return;
    const {
      data
    } = await window.sb.from('job_applications').select('*').eq('applicant_id', uid).order('created_at', {
      ascending: false
    });
    if (data) setLiveApplications(data.map(r => ({
      ...r,
      _live: true,
      rejectReason: r.reject_reason || null
    })));
  }, []);
  React.useEffect(() => {
    if (!authReady || !user?.uid || !window.sb) return;
    loadLiveApplications(user.uid);
    // Real-time: refresh whenever a status update arrives for our applications
    const ch = window.sb.channel('my-apps-' + user.uid).on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'job_applications',
      filter: `applicant_id=eq.${user.uid}`
    }, () => loadLiveApplications(user.uid)).on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'job_applications',
      filter: `applicant_id=eq.${user.uid}`
    }, () => loadLiveApplications(user.uid)).subscribe();
    return () => window.sb.removeChannel(ch);
  }, [authReady, user?.uid]);

  // Helper: insert row into Supabase
  const dbWrite = React.useCallback((col, data) => {
    if (!window.sb) return;
    // Always use profile name; never leak email as author
    const authorName = user.name && !user.name.includes('@') ? user.name : user.email ? user.email.split('@')[0] : 'User';
    const row = col === 'jobs' ? {
      role: data.role,
      loc: data.loc,
      contract: data.contract,
      pay_mode: data.payMode,
      pay: data.pay,
      car_req: data.carReq,
      license_req: data.licenseReq,
      equip_req: data.equipReq,
      description: data.desc,
      author: data.company && data.company.trim() ? data.company.trim() : authorName,
      author_id: user.uid || null
    } : col === 'techs' ? {
      name: data.name,
      specialty: data.specialty,
      loc: data.loc,
      phone: data.phone,
      email: data.email,
      rate_mode: data.rateMode,
      rate: data.rate,
      photo_url: user.photoUrl || data.photoUrl || null,
      author: authorName,
      author_id: user.uid || null
    } : col === 'vacations' ? {
      month_idx: data.monthIdx,
      year: data.year,
      selected_days: data.selectedDays,
      weekday_regions: data.weekdayRegions,
      pools_per_weekday: data.poolsPerWeekday,
      price: data.price,
      price_mode: data.priceMode,
      note: data.note || null,
      author: authorName,
      author_id: user.uid || null
    } : col === 'marketplace' ? {
      type: data.type,
      name: data.name,
      cat: data.cat,
      condition: data.condition,
      price: data.price,
      price_mode: data.priceMode,
      loc: data.loc,
      description: data.description || data.desc || null,
      route_name: data.routeName,
      clients: data.clients,
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
      author: authorName,
      author_id: user.uid || null,
      photo_url: data.photoUrl || null,
      photo_urls: data.photoUrls && data.photoUrls.length > 0 ? data.photoUrls : data.photoUrl ? [data.photoUrl] : [],
      rent_period: data.rentPeriod || null,
      rent_prices: data.rentPrices || null,
      status: 'pending'
    } : {
      ...data,
      author: authorName
    };
    return window.sb.from(col).insert(row).then(({
      error
    }) => {
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
  React.useEffect(() => {
    setUser(u => ({
      ...u,
      tier: t.tier
    }));
    try {
      localStorage.setItem('pg_tier', t.tier);
    } catch {}
  }, [t.tier]);
  const setLang = l => {
    setLangState(l);
    setTweak('lang', l);
    try {
      localStorage.setItem('pg_lang', l);
    } catch (e) {}
  };
  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
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
    setUser: u => {
      const next = typeof u === 'function' ? u(user) : u;
      setUser(next);
      if (next.tier !== t.tier) setTweak('tier', next.tier);
    },
    lang,
    setLang,
    regionsByDay,
    setRegionsByDay,
    saveRegionsByDay,
    county,
    deepLinkListingId,
    clearDeepLink: () => setDeepLinkListingId(null),
    openListingById: id => {
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
    openQuickJobById: id => {
      setPendingQuickJobId(String(id));
      switchTab('quick');
    },
    goTab: switchTab,
    openChat: (target = null) => {
      setChatConvoTarget(target);
      setChatOpen(true);
    },
    openNotifications: () => {
      setNotifOpen(true);
      setHasUnreadNotif(false);
    },
    hasUnreadChat,
    hasUnreadNotif: hasUnreadNotif || pendingRatings.length > 0,
    registerPush: _registerPush,
    openPaywall: (ctx = '') => {
      setPayContext(ctx || null);
      setPayOpen(true);
    },
    openPostMenu: () => setPostMenuOpen(true),
    openPost: () => setPostQPOpen(true),
    openEditPost: job => setEditQPJob(job),
    openMarketPost: async () => {
      // Count active listings vs tier limit before opening post form
      const limits = {
        free: 2,
        pro: 5,
        premium: 10
      };
      const limit = limits[user.tier] || 2;
      try {
        const {
          data
        } = await window.sb.from('marketplace').select('id').eq('author_id', user.uid);
        const count = (data || []).length;
        if (count >= limit) {
          setPayContext('listings');
          setPayOpen(true);
          return;
        }
      } catch (e) {}
      switchTab('market');
      setMarketPostOpen(true);
    },
    closeMarketPost: () => setMarketPostOpen(false),
    marketPostOpen,
    openRegionEditor: () => setRegionOpen(true),
    openLanguagePicker: () => setLangPickerOpen(true),
    openApplicants: post => setApplicantsPost(post),
    openVerification: () => setVerifyOpen(true),
    requestVerification: async () => {
      if (!window.sb || !user.uid) return;
      const {
        error
      } = await window.sb.from('profiles').update({
        verification_requested: true
      }).eq('id', user.uid);
      if (error) {
        showToast && showToast('❌ ' + error.message);
        return;
      }
      setUser(u => ({
        ...u,
        verificationRequested: true
      }));
      showToast && showToast('✓ Verificação solicitada! Nossa equipe vai analisar em breve.');
    },
    openPushNotif: () => setPushNotifOpen(true),
    retryPush: () => _registerPush(true),
    pushLog,
    openWallet: () => setWalletOpen(true),
    openJobDetail: app => setJobDetailApp(app),
    openReview: app => setReviewApp(app),
    openVacSheet: () => {
      if (user.tier === 'free') {
        setPayContext('vac');
        setPayOpen(true);
        return;
      }
      setEditingVac(null);
      setVacSheetOpen(true);
    },
    openEditVacSheet: vac => {
      setEditingVac(vac);
      setVacSheetOpen(true);
    },
    openHiringSheet: () => setHiringSheetOpen(true),
    openTechSheet: () => setTechSheetOpen(true),
    openDayPicker: vac => setDayPickerVac(vac),
    openSchedule: app => setScheduleApp(app),
    openHiringAppDetail: app => setHiringAppDetail(app),
    openApplyJob: job => setApplyJob(job),
    openEditProfile: () => setEditProfileOpen(true),
    openFeedback: () => setFeedbackOpen(true),
    openPublicProfile: u => setPublicProfileUser(u),
    openHelp: () => setHelpOpen(true),
    openPrivacy: () => setPrivacyOpen(true),
    notifPrefs: user.notifPrefs || {
      chat: true,
      quick: true,
      market: true,
      work: true
    },
    saveNotifPrefs: async prefs => {
      if (!window.sb || !user.uid) return;
      await window.sb.from('profiles').update({
        notif_prefs: prefs
      }).eq('id', user.uid);
      setUser(u => ({
        ...u,
        notifPrefs: prefs
      }));
    },
    pendingRatings,
    openRating: r => setActiveRating(r),
    loadPendingRatings,
    darkMode,
    toggleDark,
    isDesktop: !isMobile,
    onLogout: () => {
      if (window.sb) window.sb.auth.signOut();
      setIsLoggedIn(false);
      setTab('home');
      setUser(u => ({
        ...u,
        name: '',
        email: '',
        uid: '',
        role: 'user'
      }));
    },
    // Live Firestore data
    liveJobs,
    liveTechs,
    liveVacations,
    liveMarket,
    liveApplications,
    jobApplicantCounts,
    refreshLiveApplications: () => loadLiveApplications(user?.uid),
    dbWrite,
    showToast,
    // Admin: remove items from local state immediately (fallback if realtime is slow)
    removeMarketItem: id => setLiveMarket(prev => prev.filter(m => m._id !== id)),
    // Update item in local state (e.g. mark as sold without waiting for realtime)
    updateMarketItem: (id, patch) => setLiveMarket(prev => prev.map(m => m._id === id ? {
      ...m,
      ...patch
    } : m)),
    removeJob: id => setLiveJobs(prev => prev.filter(j => j._id !== id)),
    loadLiveJobs,
    removeTech: id => setLiveTechs(prev => prev.filter(t => t._id !== id)),
    removeVacation: id => setLiveVacations(prev => prev.filter(v => v._id !== id))
  };

  // Build confirmed-day map from accepted vacation applications (for conflict detection)
  const confirmedDays = React.useMemo(() => {
    return VACATIONS_APPLIED.filter(v => v.status === 'accepted' && v.yearMonth).flatMap(v => (v.selectedDays || v.days).map(d => ({
      key: `${v.yearMonth.year}-${v.yearMonth.month}-${d}`,
      owner: v.owner
    })));
  }, []);

  // Build initial convo from target — target can be a string (name only) or { id, name }
  // NOTE: chatOpen intentionally NOT in deps — it's irrelevant to the convo object shape
  // and caused double-recompute (triggering the ChatSheet effect twice) when open changed.
  const initialConvo = React.useMemo(() => {
    if (!chatConvoTarget) return null;
    const isObj = typeof chatConvoTarget === 'object' && chatConvoTarget !== null;
    const receiverName = isObj ? chatConvoTarget.name : String(chatConvoTarget);
    const receiverId = isObj ? chatConvoTarget.id || null : null;
    return {
      receiverId,
      name: receiverName,
      context: {
        en: 'Direct message',
        pt: 'Mensagem direta',
        es: 'Mensaje directo'
      },
      listingId: isObj ? chatConvoTarget.listingId || null : null,
      listingContext: isObj ? chatConvoTarget.listingContext || null : null
    };
  }, [chatConvoTarget]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Desktop sidebar nav items ─────────────────────────────────
  const desktopNavItems = [{
    id: 'home',
    emoji: '🏠',
    label: lang === 'pt' ? 'Início' : lang === 'es' ? 'Inicio' : 'Home'
  }, {
    id: 'market',
    emoji: '🏪',
    label: lang === 'pt' ? 'Mercado' : lang === 'es' ? 'Mercado' : 'Marketplace'
  }, {
    id: 'quick',
    emoji: '🏊',
    label: lang === 'pt' ? 'Piscinas Rápidas' : lang === 'es' ? 'Piscinas Rápidas' : 'Express Pools'
  }, {
    id: 'work',
    emoji: '💼',
    label: lang === 'pt' ? 'Trabalho' : lang === 'es' ? 'Trabajo' : 'Work'
  }, {
    id: 'profile',
    emoji: '👤',
    label: lang === 'pt' ? 'Perfil' : lang === 'es' ? 'Perfil' : 'Profile'
  }];
  const desktopTabLabel = desktopNavItems.find(n => n.id === tab);

  // ── Shared overlays (used in both mobile and desktop) ─────────
  const OverlayBundle = () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(ChatSheet, {
    open: chatOpen,
    onClose: () => {
      setChatOpen(false);
      setChatConvoTarget(null);
      recheckUnread();
    },
    lang: lang,
    initialConvo: initialConvo,
    currentUser: user,
    onUnreadChange: recheckUnread,
    onOpenListing: ctx.openListingById,
    openPublicProfile: ctx.openPublicProfile
  }), /*#__PURE__*/React.createElement(NotificationsSheet, {
    open: notifOpen,
    onClose: () => setNotifOpen(false),
    lang: lang,
    user: user,
    onUnreadChange: c => setHasUnreadNotif(c > 0),
    onNavigate: (type, linkId) => {
      setNotifOpen(false);
      setTimeout(() => {
        if (type === 'warning') {
          switchTab('profile');
        } else if (type === 'quick_pool_new' || type === 'quick_pool_done') {
          // Open the specific quick pool job if we have an ID, else just go to tab
          if (linkId) ctx.openQuickJobById(linkId);else switchTab('quick');
        } else if (type === 'job_new_application' || type === 'job_accepted' || type === 'job_rejected') {
          switchTab('work');
        } else if (type === 'rental_request' || type === 'rental_approved' || type === 'rental_declined' || type === 'rental_cancelled' || type === 'rental_completed' || type === 'rental_resolved') {
          if (linkId) ctx.openListingById(linkId);else switchTab('market');
        } else if (type === 'market') {
          if (linkId) ctx.openListingById(linkId);else switchTab('market');
        } else if (linkId) {
          ctx.openListingById(linkId);
        } else {
          switchTab('market');
        }
      }, 280);
    }
  }), /*#__PURE__*/React.createElement(PaywallSheet, {
    open: payOpen,
    onClose: () => setPayOpen(false),
    setUser: ctx.setUser,
    lang: lang,
    context: payContext
  }), showOnboarding && (() => {
    const slides = {
      en: [{
        icon: '🏊',
        title: 'Welcome to PoolGuyPro',
        desc: 'The marketplace built for Florida pool professionals. Find jobs, post routes, and connect with other pool guys.'
      }, {
        icon: '📅',
        title: 'Vacation Coverage',
        desc: 'Going on vacation? Post your route so another pool pro can cover it. Or apply to cover someone else\'s route and earn extra.'
      }, {
        icon: '⚡',
        title: 'Quick Pools & Routes',
        desc: 'Upgrade to PRO for vacation coverage and Routes tab, or PREMIUM for real-time Quick Pools emergency alerts.'
      }],
      pt: [{
        icon: '🏊',
        title: 'Bem-vindo ao PoolGuyPro',
        desc: 'O marketplace feito para profissionais de piscina na Flórida. Encontre trabalhos, publique rotas e conecte-se com outros pool guys.'
      }, {
        icon: '📅',
        title: 'Cobertura de Férias',
        desc: 'Indo de férias? Publique sua rota para outro profissional cobrir. Ou aplique para cobrir a rota de alguém e ganhar extra.'
      }, {
        icon: '⚡',
        title: 'Quick Pools e Rotas',
        desc: 'Faça upgrade para PRO para cobertura de férias e aba de rotas, ou PREMIUM para alertas em tempo real de Quick Pools.'
      }],
      es: [{
        icon: '🏊',
        title: 'Bienvenido a PoolGuyPro',
        desc: 'El marketplace para profesionales de piscinas en Florida. Encuentra trabajos, publica rutas y conéctate con otros pool guys.'
      }, {
        icon: '📅',
        title: 'Cobertura de Vacaciones',
        desc: '¿De vacaciones? Publica tu ruta para que otro profesional la cubra. O aplica para cubrir la ruta de alguien y ganar extra.'
      }, {
        icon: '⚡',
        title: 'Quick Pools y Rutas',
        desc: 'Mejora a PRO para cobertura de vacaciones y pestaña de Rutas, o PREMIUM para alertas en tiempo real de Quick Pools.'
      }]
    };
    const sl = slides[lang] || slides.en;
    const btnLabel = {
      en: 'Get Started',
      pt: 'Começar',
      es: 'Empezar'
    }[lang] || 'Get Started';
    const nextLabel = {
      en: 'Next',
      pt: 'Próximo',
      es: 'Siguiente'
    }[lang] || 'Next';
    const skipLabel = {
      en: 'Skip',
      pt: 'Pular',
      es: 'Omitir'
    }[lang] || 'Skip';
    const dismiss = () => {
      localStorage.setItem('pg_onboarded', '1');
      setShowOnboarding(false);
    };
    const OnboardInner = () => {
      const [slide, setSlide] = React.useState(0);
      const isLast = slide === sl.length - 1;
      return /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.88)',
          zIndex: 5000,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          background: '#111827',
          borderRadius: '24px 24px 0 0',
          width: '100%',
          maxWidth: 480,
          padding: '32px 28px 40px',
          border: '1px solid rgba(255,255,255,0.08)',
          borderBottom: 'none'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          justifyContent: 'center',
          gap: 7,
          marginBottom: 32
        }
      }, sl.map((_, i) => /*#__PURE__*/React.createElement("div", {
        key: i,
        style: {
          width: i === slide ? 24 : 7,
          height: 7,
          borderRadius: 99,
          transition: 'width .3s',
          background: i === slide ? '#0077B6' : 'rgba(255,255,255,0.2)'
        }
      }))), /*#__PURE__*/React.createElement("div", {
        style: {
          textAlign: 'center',
          marginBottom: 32
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 48,
          marginBottom: 16
        }
      }, sl[slide].icon), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 20,
          fontWeight: 800,
          color: '#e8edf2',
          marginBottom: 12,
          letterSpacing: '-0.02em'
        }
      }, sl[slide].title), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 14,
          color: 'rgba(255,255,255,0.5)',
          lineHeight: 1.7
        }
      }, sl[slide].desc)), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          gap: 10
        }
      }, !isLast && /*#__PURE__*/React.createElement("button", {
        onClick: dismiss,
        style: {
          flex: 1,
          height: 48,
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.12)',
          background: 'transparent',
          color: 'rgba(255,255,255,0.45)',
          fontFamily: 'inherit',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer'
        }
      }, skipLabel), /*#__PURE__*/React.createElement("button", {
        onClick: isLast ? dismiss : () => setSlide(s => s + 1),
        style: {
          flex: 2,
          height: 48,
          borderRadius: 12,
          border: 'none',
          background: 'linear-gradient(135deg,#0c4a6e,#0077B6)',
          color: '#fff',
          fontFamily: 'inherit',
          fontSize: 15,
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,119,182,0.4)'
        }
      }, isLast ? btnLabel : nextLabel))));
    };
    return /*#__PURE__*/React.createElement(OnboardInner, {
      key: "onboard"
    });
  })(), /*#__PURE__*/React.createElement(PostMenuSheet, {
    open: postMenuOpen,
    onClose: () => setPostMenuOpen(false),
    onPickQuickPool: () => setPostQPOpen(true),
    lang: lang
  }), /*#__PURE__*/React.createElement(Sheet, {
    open: postQPOpen,
    onClose: () => setPostQPOpen(false),
    height: "92%"
  }, /*#__PURE__*/React.createElement(PostQuickPool, {
    lang: lang,
    onClose: () => setPostQPOpen(false),
    onSubmit: async formData => {
      setPostQPOpen(false);
      setTab('quick');
      if (!window.sb || !user?.uid) return;
      try {
        const scheduledFor = formData.scheduled_for ? new Date(formData.scheduled_for).toISOString() : null;
        let notifyAt = null;
        if (scheduledFor) {
          const d = new Date(formData.scheduled_for);
          d.setHours(7, 0, 0, 0);
          notifyAt = d.toISOString();
        }
        const firstPool = formData.pools?.[0] || {};
        const isCondo = firstPool.poolType === 'condo';
        const job = {
          poster_id: user.uid,
          poster_name: user.name || user.email || 'Pool Guy',
          poster_phone: formData.showPhone ? formData.phone || user.phone || null : null,
          pool_address: (() => {
            const addr = formData.pool_address?.trim() || '';
            const zip = formData.pool_zip?.trim() || '';
            if (!addr && !zip) return null;
            if (zip && addr) return `${addr}, FL ${zip}`;
            return addr || zip;
          })(),
          city: firstPool.location || 'Florida',
          day_of_week: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][(scheduledFor ? new Date(formData.scheduled_for) : new Date()).getDay()],
          when_label: scheduledFor ? new Date(scheduledFor).toLocaleDateString(lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es' : 'en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) : lang === 'pt' ? 'Agora' : 'Now',
          pools_count: 1,
          price_per_pool: formData.priceMode === 'fixed' ? parseFloat(formData.price || 0) || null : null,
          price_negotiable: formData.priceMode === 'neg',
          title: formData.title?.trim() || null,
          description: formData.notes?.trim() || null,
          pool_type: isCondo ? 'condo' : 'residential',
          extras: isCondo ? {
            gate_code: firstPool.gateCodeVal || null,
            doorman: firstPool.doorman || false,
            dog: firstPool.dog || false,
            saltwater: firstPool.saltwater || false
          } : {
            dog: firstPool.dog || false,
            saltwater: firstPool.saltwater || false
          },
          required_photos: formData.requiredPhotos || [],
          status: 'open',
          notify_at: notifyAt
        };
        const {
          data: inserted
        } = await window.sb.from('quick_pool_jobs').insert(job).select().single();
        if (inserted) window.dispatchEvent(new CustomEvent('pgQuickPoolPosted', {
          detail: inserted
        }));
        let notifyCount = 0;
        if (inserted && !scheduledFor) {
          try {
            const {
              data: {
                session
              }
            } = await window.sb.auth.getSession();
            const token = session?.access_token || '';
            const res = await fetch('https://xiszfqghizqzlwyrfjol.supabase.co/functions/v1/notify-quick-pool', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
              },
              body: JSON.stringify({
                job: inserted
              })
            });
            if (res.ok) {
              const result = await res.json().catch(() => ({}));
              notifyCount = result?.sent ?? result?.matched ?? 0;
            }
          } catch {}
        }
        const toastMsg = lang === 'pt' ? `Piscina Rápida publicada — ${notifyCount} piscineiros notificados` : lang === 'es' ? `Piscina Rápida publicada — ${notifyCount} técnicos notificados` : `Quick Pool posted — ${notifyCount} pool guys notified`;
        showToast(toastMsg);
      } catch {
        showToast(lang === 'pt' ? '❌ Erro ao publicar' : '❌ Error posting');
      }
    }
  })), /*#__PURE__*/React.createElement(Sheet, {
    open: !!editQPJob,
    onClose: () => setEditQPJob(null),
    height: "92%"
  }, editQPJob && /*#__PURE__*/React.createElement(PostQuickPool, {
    lang: lang,
    initialData: editQPJob,
    onClose: () => setEditQPJob(null),
    onSubmit: async formData => {
      const jobId = editQPJob.id;
      setEditQPJob(null);
      if (!window.sb || !user?.uid) return;
      try {
        const firstPool = formData.pools?.[0] || {};
        const isCondo = firstPool.poolType === 'condo';
        const patch = {
          poster_phone: formData.showPhone ? formData.phone || user.phone || null : null,
          pool_address: (() => {
            const addr = formData.pool_address?.trim() || '';
            const zip = formData.pool_zip?.trim() || '';
            if (!addr && !zip) return null;
            if (zip && addr) return `${addr}, FL ${zip}`;
            return addr || zip;
          })(),
          city: firstPool.location || 'Florida',
          price_per_pool: formData.priceMode === 'fixed' ? parseFloat(formData.price || 0) || null : null,
          price_negotiable: formData.priceMode === 'neg',
          title: formData.title?.trim() || null,
          description: formData.notes?.trim() || null,
          pool_type: isCondo ? 'condo' : 'residential',
          extras: isCondo ? {
            gate_code: firstPool.gateCodeVal || null,
            doorman: firstPool.doorman || false,
            dog: firstPool.dog || false,
            saltwater: firstPool.saltwater || false
          } : {
            dog: firstPool.dog || false,
            saltwater: firstPool.saltwater || false
          },
          required_photos: formData.requiredPhotos || []
        };
        const {
          data: updated
        } = await window.sb.from('quick_pool_jobs').update(patch).eq('id', jobId).select().single();
        if (updated) window.dispatchEvent(new CustomEvent('pgQuickPoolPosted', {
          detail: updated
        }));
        showToast(lang === 'pt' ? '✅ Vaga atualizada' : lang === 'es' ? '✅ Vaga actualizada' : '✅ Job updated');
      } catch {
        showToast(lang === 'pt' ? '❌ Erro ao salvar' : '❌ Error saving');
      }
    }
  })), /*#__PURE__*/React.createElement(Toast, {
    message: toast
  }), /*#__PURE__*/React.createElement(RegionEditorSheet, {
    open: regionOpen,
    onClose: () => setRegionOpen(false),
    lang: lang,
    regionsByDay: regionsByDay,
    setRegionsByDay: setRegionsByDay,
    saveRegionsByDay: saveRegionsByDay,
    county: county
  }), /*#__PURE__*/React.createElement(LanguagePickerSheet, {
    open: langPickerOpen,
    onClose: () => setLangPickerOpen(false),
    lang: lang,
    setLang: setLang
  }), /*#__PURE__*/React.createElement(ApplicantsSheet, {
    open: !!applicantsPost,
    onClose: () => setApplicantsPost(null),
    post: applicantsPost,
    lang: lang,
    user: user,
    onChat: name => {
      setApplicantsPost(null);
      setChatConvoTarget(name);
      setChatOpen(true);
    },
    onOpenProfile: applicant => setPublicProfileUser({
      uid: applicant.applicant_id || null,
      name: applicant.name,
      rating: applicant.rating || null,
      reviews: applicant.jobs || 0,
      jobs: applicant.jobs || 0,
      loc: applicant.profile?.region || '',
      photo: applicant.profile?.photoUrl || null
    })
  }), /*#__PURE__*/React.createElement(VerificationSheet, {
    open: verifyOpen,
    onClose: () => setVerifyOpen(false),
    lang: lang
  }), /*#__PURE__*/React.createElement(WalletSheet, {
    open: walletOpen,
    onClose: () => setWalletOpen(false),
    lang: lang
  }), /*#__PURE__*/React.createElement(WorkLifecycleSheet, {
    open: !!jobDetailApp,
    onClose: () => setJobDetailApp(null),
    app: jobDetailApp,
    lang: lang,
    onReview: app => {
      setJobDetailApp(null);
      setReviewApp(app);
    }
  }), /*#__PURE__*/React.createElement(ReviewSheet, {
    open: !!reviewApp,
    onClose: () => setReviewApp(null),
    app: reviewApp,
    lang: lang,
    onSubmitDone: () => {
      setReviewApp(null);
      showToast(lang === 'pt' ? 'Avaliação enviada ✓' : lang === 'es' ? 'Reseña enviada ✓' : 'Review submitted ✓');
    }
  }), /*#__PURE__*/React.createElement(FullPage, {
    open: vacSheetOpen,
    onClose: () => {
      setVacSheetOpen(false);
      setEditingVac(null);
    }
  }, /*#__PURE__*/React.createElement(PostVacationSheet, {
    lang: lang,
    initialData: editingVac,
    onClose: () => {
      setVacSheetOpen(false);
      setEditingVac(null);
    },
    onSubmit: data => {
      setVacSheetOpen(false);
      if (!data) {
        setEditingVac(null);
        return;
      }
      if (editingVac) {
        const row = {
          month_idx: data.monthIdx,
          year: data.year,
          selected_days: data.selectedDays,
          weekday_regions: data.weekdayRegions,
          pools_per_weekday: data.poolsPerWeekday,
          price: data.price,
          price_mode: data.priceMode,
          note: data.note || null
        };
        window.sb.from('vacations').update(row).eq('id', editingVac._id).then(({
          error
        }) => {
          if (error) {
            showToast('❌ ' + error.message);
            return;
          }
          const wr = data.weekdayRegions || {};
          const allCities = [...new Set(Object.values(wr).flat())];
          const region = allCities.slice(0, 3).join(' / ') || editingVac.region;
          setLiveVacations(prev => prev.map(v => v._id !== editingVac._id ? v : {
            ...v,
            monthIdx: data.monthIdx,
            year: data.year,
            yearMonth: {
              year: data.year,
              month: data.monthIdx
            },
            days: data.selectedDays || [],
            selectedDays: data.selectedDays,
            weekdayRegions: wr,
            poolsByWeekday: data.poolsPerWeekday || {},
            poolsPerWeekday: data.poolsPerWeekday,
            price: data.price,
            pricePerPool: data.price,
            priceMode: data.priceMode,
            note: data.note || null,
            region
          }));
          showToast(lang === 'pt' ? 'Férias atualizadas ✓' : lang === 'es' ? 'Vacaciones actualizadas ✓' : 'Vacation updated ✓');
        });
        setEditingVac(null);
      } else {
        dbWrite('vacations', data);
        showToast(lang === 'pt' ? 'Férias publicadas ✓' : lang === 'es' ? 'Vacaciones publicadas ✓' : 'Vacation posted ✓');
      }
    }
  })), /*#__PURE__*/React.createElement(FullPage, {
    open: !!dayPickerVac,
    onClose: () => setDayPickerVac(null)
  }, /*#__PURE__*/React.createElement(VacationDayPickerSheet, {
    vac: dayPickerVac,
    lang: lang,
    confirmedDays: confirmedDays,
    onClose: () => setDayPickerVac(null),
    onSubmit: () => setDayPickerVac(null)
  })), /*#__PURE__*/React.createElement(FullPage, {
    open: hiringSheetOpen,
    onClose: () => setHiringSheetOpen(false)
  }, /*#__PURE__*/React.createElement(PostHiringSheet, {
    lang: lang,
    onClose: () => setHiringSheetOpen(false),
    onSubmit: data => {
      setHiringSheetOpen(false);
      if (data) dbWrite('jobs', data).then(() => loadLiveJobs());
      showToast(lang === 'pt' ? 'Vaga publicada ✓' : lang === 'es' ? 'Empleo publicado ✓' : 'Job posted ✓');
    }
  })), /*#__PURE__*/React.createElement(FullPage, {
    open: techSheetOpen,
    onClose: () => setTechSheetOpen(false)
  }, /*#__PURE__*/React.createElement(PostTechSheet, {
    lang: lang,
    user: user,
    onClose: () => setTechSheetOpen(false),
    onSubmit: data => {
      setTechSheetOpen(false);
      if (data) dbWrite('techs', data);
      showToast(lang === 'pt' ? 'Perfil publicado ✓' : lang === 'es' ? 'Perfil publicado ✓' : 'Profile posted ✓');
    }
  })), /*#__PURE__*/React.createElement(ApplyJobSheet, {
    open: !!applyJob,
    onClose: () => setApplyJob(null),
    job: applyJob,
    user: user,
    lang: lang,
    onEditProfile: () => setEditProfileOpen(true),
    onSubmit: () => {
      setApplyJob(null);
      showToast(lang === 'pt' ? 'Candidatura enviada ✓' : lang === 'es' ? 'Postulación enviada ✓' : 'Application sent ✓');
      loadLiveApplications(user.uid);
    }
  }), /*#__PURE__*/React.createElement(EditProfileSheet, {
    open: editProfileOpen,
    onClose: () => setEditProfileOpen(false),
    user: user,
    setUser: ctx.setUser,
    lang: lang
  }), /*#__PURE__*/React.createElement(PublicProfileSheet, {
    open: !!publicProfileUser,
    onClose: () => setPublicProfileUser(null),
    profile: publicProfileUser,
    lang: lang,
    onChat: target => {
      setPublicProfileUser(null);
      setChatConvoTarget(target);
      setChatOpen(true);
    }
  }), /*#__PURE__*/React.createElement(HelpSheet, {
    open: helpOpen,
    onClose: () => setHelpOpen(false),
    lang: lang
  }), /*#__PURE__*/React.createElement(PrivacySheet, {
    open: privacyOpen,
    onClose: () => setPrivacyOpen(false),
    lang: lang
  }), /*#__PURE__*/React.createElement(HiringAppDetailSheet, {
    open: !!hiringAppDetail,
    onClose: () => setHiringAppDetail(null),
    app: hiringAppDetail,
    lang: lang,
    onChat: target => {
      setChatConvoTarget(target || null);
      setChatOpen(true);
    },
    onWithdraw: appId => {
      setHiringAppDetail(null);
      loadLiveApplications(user?.uid);
    }
  }), /*#__PURE__*/React.createElement(Sheet, {
    open: !!scheduleApp,
    onClose: () => setScheduleApp(null),
    height: "95%"
  }, /*#__PURE__*/React.createElement(ScheduleSheet, {
    app: scheduleApp,
    lang: lang,
    onClose: () => setScheduleApp(null)
  })), /*#__PURE__*/React.createElement(PushNotifSheet, {
    open: pushNotifOpen,
    onClose: () => setPushNotifOpen(false),
    lang: lang,
    onEnabled: () => {
      setPushNotifOpen(false);
      showToast(lang === 'pt' ? 'Notificações ativadas ✓' : lang === 'es' ? 'Notificaciones activadas ✓' : 'Notifications enabled ✓');
    }
  }), /*#__PURE__*/React.createElement(FeedbackSheet, {
    open: feedbackOpen,
    onClose: () => setFeedbackOpen(false),
    lang: lang
  }), /*#__PURE__*/React.createElement(RatingSheet, {
    open: !!activeRating,
    rating: activeRating,
    lang: lang,
    currentUser: user,
    showToast: showToast,
    onClose: () => setActiveRating(null),
    onDone: id => {
      setPendingRatings(prev => prev.filter(r => r.id !== id));
      setActiveRating(null);
    }
  }), /*#__PURE__*/React.createElement(BuyerRatingPromptModal, {
    open: ratingPromptOpen,
    pendingRatings: pendingRatings,
    lang: lang,
    currentUser: user,
    showToast: showToast,
    onRateNow: rating => {
      // rating=null means submitted inline; just close + refresh pending list
      setRatingPromptOpen(false);
      if (loadPendingRatings) setTimeout(loadPendingRatings, 300);
    },
    onClose: () => setRatingPromptOpen(false)
  }));

  // ════════════════════════════════════════════════════════════════
  // DESKTOP LAYOUT — professional sidebar, no top header bar
  // ════════════════════════════════════════════════════════════════
  if (!isMobile) {
    const displayName = user.name && !user.name.includes('@') ? user.name : user.email ? user.email.split('@')[0] : 'User';
    const avatarLetter = (displayName[0] || '?').toUpperCase();

    // SVG icon set — consistent 1.75 stroke, Lucide style
    const NavIcon = ({
      id,
      active
    }) => {
      const c = active ? '#fff' : 'rgba(255,255,255,0.45)';
      const w = 1.75;
      switch (id) {
        case 'home':
          return /*#__PURE__*/React.createElement("svg", {
            width: "18",
            height: "18",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: c,
            strokeWidth: w,
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }, /*#__PURE__*/React.createElement("path", {
            d: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
          }), /*#__PURE__*/React.createElement("polyline", {
            points: "9 22 9 12 15 12 15 22"
          }));
        case 'market':
          return /*#__PURE__*/React.createElement("svg", {
            width: "18",
            height: "18",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: c,
            strokeWidth: w,
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }, /*#__PURE__*/React.createElement("circle", {
            cx: "9",
            cy: "21",
            r: "1"
          }), /*#__PURE__*/React.createElement("circle", {
            cx: "20",
            cy: "21",
            r: "1"
          }), /*#__PURE__*/React.createElement("path", {
            d: "M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
          }));
        case 'quick':
          return /*#__PURE__*/React.createElement("svg", {
            width: "18",
            height: "18",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: c,
            strokeWidth: w,
            strokeLinecap: "round"
          }, /*#__PURE__*/React.createElement("path", {
            d: "M2 12 Q6 8 10 12 Q14 16 18 12 Q20 10 22 12"
          }), /*#__PURE__*/React.createElement("path", {
            d: "M2 17 Q6 13 10 17 Q14 21 18 17 Q20 15 22 17"
          }), /*#__PURE__*/React.createElement("circle", {
            cx: "12",
            cy: "5",
            r: "2"
          }));
        case 'work':
          return /*#__PURE__*/React.createElement("svg", {
            width: "18",
            height: "18",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: c,
            strokeWidth: w,
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }, /*#__PURE__*/React.createElement("rect", {
            x: "2",
            y: "7",
            width: "20",
            height: "14",
            rx: "2"
          }), /*#__PURE__*/React.createElement("path", {
            d: "M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"
          }));
        case 'profile':
          return /*#__PURE__*/React.createElement("svg", {
            width: "18",
            height: "18",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: c,
            strokeWidth: w,
            strokeLinecap: "round"
          }, /*#__PURE__*/React.createElement("path", {
            d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
          }), /*#__PURE__*/React.createElement("circle", {
            cx: "12",
            cy: "7",
            r: "4"
          }));
        default:
          return null;
      }
    };
    const navItems = [{
      id: 'home',
      label: lang === 'pt' ? 'Início' : lang === 'es' ? 'Inicio' : 'Home'
    }, {
      id: 'market',
      label: lang === 'pt' ? 'Mercado' : lang === 'es' ? 'Mercado' : 'Marketplace'
    }, {
      id: 'quick',
      label: lang === 'pt' ? 'Piscinas Rápidas' : lang === 'es' ? 'Piscinas Rápidas' : 'Express Pools'
    }, {
      id: 'work',
      label: lang === 'pt' ? 'Trabalho' : lang === 'es' ? 'Trabajo' : 'Work'
    }, {
      id: 'profile',
      label: lang === 'pt' ? 'Perfil' : lang === 'es' ? 'Perfil' : 'Profile'
    }];

    // Post button removed from sidebar — each screen has its own inline post button

    // ── Desktop page meta ─────────────────────────────────────
    const pagesMeta = {
      home: {
        label: lang === 'pt' ? 'Início' : lang === 'es' ? 'Inicio' : 'Home',
        icon: /*#__PURE__*/React.createElement("svg", {
          width: "16",
          height: "16",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }, /*#__PURE__*/React.createElement("path", {
          d: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
        }), /*#__PURE__*/React.createElement("polyline", {
          points: "9 22 9 12 15 12 15 22"
        }))
      },
      market: {
        label: lang === 'pt' ? 'Mercado' : lang === 'es' ? 'Mercado' : 'Marketplace',
        icon: /*#__PURE__*/React.createElement("svg", {
          width: "16",
          height: "16",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }, /*#__PURE__*/React.createElement("circle", {
          cx: "9",
          cy: "21",
          r: "1"
        }), /*#__PURE__*/React.createElement("circle", {
          cx: "20",
          cy: "21",
          r: "1"
        }), /*#__PURE__*/React.createElement("path", {
          d: "M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
        }))
      },
      quick: {
        label: lang === 'pt' ? 'Piscinas Rápidas' : lang === 'es' ? 'Piscinas Rápidas' : 'Express Pools',
        icon: /*#__PURE__*/React.createElement("svg", {
          width: "16",
          height: "16",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round"
        }, /*#__PURE__*/React.createElement("path", {
          d: "M2 12 Q6 8 10 12 Q14 16 18 12 Q20 10 22 12"
        }), /*#__PURE__*/React.createElement("path", {
          d: "M2 17 Q6 13 10 17 Q14 21 18 17 Q20 15 22 17"
        }), /*#__PURE__*/React.createElement("circle", {
          cx: "12",
          cy: "5",
          r: "2"
        }))
      },
      work: {
        label: lang === 'pt' ? 'Trabalho' : lang === 'es' ? 'Trabajo' : 'Work',
        icon: /*#__PURE__*/React.createElement("svg", {
          width: "16",
          height: "16",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }, /*#__PURE__*/React.createElement("rect", {
          x: "2",
          y: "7",
          width: "20",
          height: "14",
          rx: "2"
        }), /*#__PURE__*/React.createElement("path", {
          d: "M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"
        }))
      },
      profile: {
        label: lang === 'pt' ? 'Perfil' : lang === 'es' ? 'Perfil' : 'Profile',
        icon: /*#__PURE__*/React.createElement("svg", {
          width: "16",
          height: "16",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round"
        }, /*#__PURE__*/React.createElement("path", {
          d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
        }), /*#__PURE__*/React.createElement("circle", {
          cx: "12",
          cy: "7",
          r: "4"
        }))
      }
    };
    const pageMeta = pagesMeta[tab] || pagesMeta.home;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        overflow: 'hidden',
        background: 'var(--pg-bg)',
        position: 'relative'
      }
    }, isLoggedIn && /*#__PURE__*/React.createElement("nav", {
      style: {
        width: 264,
        flexShrink: 0,
        zIndex: 10,
        background: 'linear-gradient(180deg, #050E1C 0%, #081628 55%, #0A1C33 100%)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        overflowX: 'hidden',
        boxShadow: '3px 0 28px rgba(0,0,0,0.40)',
        borderRight: '1px solid rgba(255,255,255,0.035)',
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 1,
        background: 'linear-gradient(90deg, transparent 0%, #0EA5E9 30%, #06B6D4 65%, transparent 100%)',
        opacity: 0.75,
        pointerEvents: 'none'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '6px 16px 4px',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        overflow: 'visible',
        height: 70
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: "wordmarkwhite.png",
      alt: "PoolGuyX",
      style: {
        width: 220,
        height: 200,
        objectFit: 'contain',
        objectPosition: 'left center',
        display: 'block',
        marginTop: 20,
        filter: 'drop-shadow(0 3px 14px rgba(14,186,199,0.30))',
        pointerEvents: 'none'
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 1,
        background: 'rgba(255,255,255,0.055)',
        margin: '0 16px 18px'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        margin: '0 12px 20px',
        padding: '13px 14px',
        borderRadius: 14,
        background: 'linear-gradient(135deg, rgba(0,119,182,0.14) 0%, rgba(14,186,199,0.07) 100%)',
        border: '1px solid rgba(14,186,199,0.14)',
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        cursor: 'pointer',
        transition: 'all .18s',
        boxShadow: '0 4px 18px rgba(0,0,0,0.20)'
      },
      onClick: () => switchTab('profile'),
      onMouseEnter: e => {
        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,119,182,0.22) 0%, rgba(14,186,199,0.12) 100%)';
      },
      onMouseLeave: e => {
        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,119,182,0.14) 0%, rgba(14,186,199,0.07) 100%)';
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 40,
        height: 40,
        borderRadius: 12,
        flexShrink: 0,
        background: 'linear-gradient(135deg,#0077B6,#0EA5E9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: 15,
        fontWeight: 700,
        boxShadow: '0 4px 12px rgba(0,119,182,0.45)',
        overflow: 'hidden'
      }
    }, user.photoUrl ? /*#__PURE__*/React.createElement("img", {
      src: user.photoUrl,
      alt: displayName,
      style: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block'
      },
      onError: e => {
        e.currentTarget.style.display = 'none';
      }
    }) : avatarLetter), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: '#fff',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        lineHeight: 1.25
      }
    }, displayName), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        marginTop: 3
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: '#34D399',
        boxShadow: '0 0 6px rgba(52,211,153,0.65)',
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.38)',
        fontWeight: 500,
        lineHeight: 1
      }
    }, user.role === 'admin' ? 'Administrator' : 'Pool Guy', user.tier === 'premium' && ' · Premium', user.tier === 'pro' && ' · Pro'))), /*#__PURE__*/React.createElement("svg", {
      width: "13",
      height: "13",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "rgba(255,255,255,0.22)",
      strokeWidth: "2.2",
      strokeLinecap: "round"
    }, /*#__PURE__*/React.createElement("polyline", {
      points: "9 18 15 12 9 6"
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '0 22px 7px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 9,
        fontWeight: 700,
        color: 'rgba(255,255,255,0.20)',
        letterSpacing: '0.16em',
        textTransform: 'uppercase'
      }
    }, lang === 'pt' ? 'Navegação' : lang === 'es' ? 'Navegación' : 'Navigation')), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '0 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }
    }, navItems.map(item => {
      const active = tab === item.id;
      return /*#__PURE__*/React.createElement("button", {
        key: item.id,
        onClick: () => switchTab(item.id),
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 14px',
          borderRadius: 12,
          border: 'none',
          cursor: 'pointer',
          background: active ? 'linear-gradient(135deg, rgba(14,165,233,0.22) 0%, rgba(6,182,212,0.12) 100%)' : 'transparent',
          fontFamily: 'inherit',
          textAlign: 'left',
          transition: 'all .15s',
          position: 'relative'
        },
        onMouseEnter: e => {
          if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
        },
        onMouseLeave: e => {
          if (!active) e.currentTarget.style.background = 'transparent';
        }
      }, active && /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'absolute',
          left: 0,
          top: '18%',
          bottom: '18%',
          width: 3,
          borderRadius: '0 4px 4px 0',
          background: 'linear-gradient(180deg, #38BDF8 0%, #06B6D4 100%)',
          boxShadow: '0 0 8px rgba(56,189,248,0.60)'
        }
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          width: 36,
          height: 36,
          borderRadius: 11,
          flexShrink: 0,
          background: active ? 'linear-gradient(135deg, rgba(14,165,233,0.35) 0%, rgba(6,182,212,0.22) 100%)' : 'rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all .15s',
          border: active ? '1px solid rgba(56,189,248,0.25)' : '1px solid rgba(255,255,255,0.05)',
          boxShadow: active ? '0 3px 10px rgba(14,165,233,0.25)' : 'none'
        }
      }, /*#__PURE__*/React.createElement(NavIcon, {
        id: item.id,
        active: active
      })), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 13.5,
          fontWeight: active ? 700 : 500,
          color: active ? '#E0F2FE' : 'rgba(255,255,255,0.42)',
          letterSpacing: '-0.01em',
          transition: 'all .15s'
        }
      }, item.label), item.id === 'home' && (hasUnreadChat || hasUnreadNotif) && /*#__PURE__*/React.createElement("div", {
        style: {
          marginLeft: 'auto',
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: '#38BDF8',
          boxShadow: '0 0 7px rgba(56,189,248,0.70)'
        }
      }));
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '0 10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: 1,
        background: 'rgba(255,255,255,0.06)',
        margin: '0 4px 10px'
      }
    }), /*#__PURE__*/React.createElement("button", {
      onClick: () => setNotifOpen(true),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        padding: '9px 14px',
        borderRadius: 11,
        border: 'none',
        cursor: 'pointer',
        background: 'transparent',
        fontFamily: 'inherit',
        textAlign: 'left',
        transition: 'background .15s',
        position: 'relative'
      },
      onMouseEnter: e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
      },
      onMouseLeave: e => {
        e.currentTarget.style.background = 'transparent';
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 32,
        height: 32,
        borderRadius: 9,
        flexShrink: 0,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "15",
      height: "15",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "rgba(255,255,255,0.38)",
      strokeWidth: "1.75",
      strokeLinecap: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M13.73 21a2 2 0 0 1-3.46 0"
    })), (hasUnreadNotif || pendingRatings.length > 0) && /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: 3,
        right: 3,
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: '#FF3B30',
        border: '1.5px solid #081628'
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12.5,
        fontWeight: 500,
        color: 'rgba(255,255,255,0.38)',
        letterSpacing: '-0.01em'
      }
    }, lang === 'pt' ? 'Notificações' : lang === 'es' ? 'Notificaciones' : 'Notifications'), (hasUnreadNotif || pendingRatings.length > 0) && /*#__PURE__*/React.createElement("div", {
      style: {
        marginLeft: 'auto',
        background: 'rgba(255,59,48,0.18)',
        borderRadius: 6,
        padding: '1px 7px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        fontWeight: 700,
        color: '#FF6B6B'
      }
    }, pendingRatings.length > 0 ? pendingRatings.length : '•'))), /*#__PURE__*/React.createElement("button", {
      onClick: () => setChatOpen(true),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        padding: '9px 14px',
        borderRadius: 11,
        border: 'none',
        cursor: 'pointer',
        background: 'transparent',
        fontFamily: 'inherit',
        textAlign: 'left',
        transition: 'background .15s'
      },
      onMouseEnter: e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
      },
      onMouseLeave: e => {
        e.currentTarget.style.background = 'transparent';
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 32,
        height: 32,
        borderRadius: 9,
        flexShrink: 0,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "15",
      height: "15",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "rgba(255,255,255,0.38)",
      strokeWidth: "1.75",
      strokeLinecap: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
    })), hasUnreadChat && /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: 3,
        right: 3,
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: '#38BDF8',
        border: '1.5px solid #081628'
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12.5,
        fontWeight: 500,
        color: 'rgba(255,255,255,0.38)',
        letterSpacing: '-0.01em'
      }
    }, lang === 'pt' ? 'Mensagens' : lang === 'es' ? 'Mensajes' : 'Messages'), hasUnreadChat && /*#__PURE__*/React.createElement("div", {
      style: {
        marginLeft: 'auto',
        background: 'rgba(56,189,248,0.15)',
        borderRadius: 6,
        padding: '1px 7px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        fontWeight: 700,
        color: '#38BDF8'
      }
    }, "New"))), /*#__PURE__*/React.createElement("button", {
      onClick: toggleDark,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        padding: '9px 14px',
        borderRadius: 11,
        border: 'none',
        cursor: 'pointer',
        background: darkMode ? 'rgba(245,158,11,0.07)' : 'transparent',
        fontFamily: 'inherit',
        textAlign: 'left',
        transition: 'all .15s'
      },
      onMouseEnter: e => {
        if (!darkMode) e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
      },
      onMouseLeave: e => {
        if (!darkMode) e.currentTarget.style.background = 'transparent';
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 32,
        height: 32,
        borderRadius: 9,
        flexShrink: 0,
        background: darkMode ? 'rgba(245,158,11,0.14)' : 'rgba(255,255,255,0.05)',
        border: darkMode ? '1px solid rgba(245,158,11,0.22)' : '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, darkMode ? /*#__PURE__*/React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "#F59E0B",
      strokeWidth: "1.75",
      strokeLinecap: "round"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "5"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "1",
      x2: "12",
      y2: "3"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "21",
      x2: "12",
      y2: "23"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "4.22",
      y1: "4.22",
      x2: "5.64",
      y2: "5.64"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "18.36",
      y1: "18.36",
      x2: "19.78",
      y2: "19.78"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "1",
      y1: "12",
      x2: "3",
      y2: "12"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "21",
      y1: "12",
      x2: "23",
      y2: "12"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "4.22",
      y1: "19.78",
      x2: "5.64",
      y2: "18.36"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "18.36",
      y1: "5.64",
      x2: "19.78",
      y2: "4.22"
    })) : /*#__PURE__*/React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "rgba(255,255,255,0.38)",
      strokeWidth: "1.75",
      strokeLinecap: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
    }))), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12.5,
        fontWeight: 500,
        color: darkMode ? '#F59E0B' : 'rgba(255,255,255,0.38)',
        letterSpacing: '-0.01em'
      }
    }, darkMode ? lang === 'pt' ? 'Modo claro' : lang === 'es' ? 'Modo claro' : 'Light mode' : lang === 'pt' ? 'Modo escuro' : lang === 'es' ? 'Modo oscuro' : 'Dark mode')), /*#__PURE__*/React.createElement("button", {
      onClick: () => setFeedbackOpen(true),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        padding: '9px 14px',
        borderRadius: 11,
        border: 'none',
        cursor: 'pointer',
        background: 'transparent',
        fontFamily: 'inherit',
        textAlign: 'left',
        transition: 'background .15s'
      },
      onMouseEnter: e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
      },
      onMouseLeave: e => {
        e.currentTarget.style.background = 'transparent';
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 32,
        height: 32,
        borderRadius: 9,
        flexShrink: 0,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "rgba(255,255,255,0.32)",
      strokeWidth: "1.75",
      strokeLinecap: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "9",
      y1: "10",
      x2: "15",
      y2: "10"
    }))), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12.5,
        fontWeight: 500,
        color: 'rgba(255,255,255,0.32)',
        letterSpacing: '-0.01em'
      }
    }, "Feedback")), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 1,
        background: 'rgba(255,255,255,0.055)',
        margin: '8px 4px'
      }
    }), /*#__PURE__*/React.createElement("button", {
      onClick: ctx.onLogout,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        padding: '9px 14px',
        borderRadius: 11,
        border: 'none',
        cursor: 'pointer',
        background: 'transparent',
        fontFamily: 'inherit',
        textAlign: 'left',
        transition: 'all .15s'
      },
      onMouseEnter: e => {
        e.currentTarget.style.background = 'rgba(239,68,68,0.07)';
      },
      onMouseLeave: e => {
        e.currentTarget.style.background = 'transparent';
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 32,
        height: 32,
        borderRadius: 9,
        flexShrink: 0,
        background: 'rgba(239,68,68,0.07)',
        border: '1px solid rgba(239,68,68,0.10)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "rgba(239,68,68,0.55)",
      strokeWidth: "1.75",
      strokeLinecap: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "16 17 21 12 16 7"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "21",
      y1: "12",
      x2: "9",
      y2: "12"
    }))), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12.5,
        fontWeight: 500,
        color: 'rgba(239,68,68,0.52)',
        letterSpacing: '-0.01em'
      }
    }, lang === 'pt' ? 'Sair' : lang === 'es' ? 'Salir' : 'Log out')), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '8px 14px 2px',
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        height: 1,
        background: 'rgba(255,255,255,0.04)'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 9,
        color: 'rgba(255,255,255,0.13)',
        letterSpacing: '0.06em',
        whiteSpace: 'nowrap'
      }
    }, "v1.3.0 \xB7 Beta"), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        height: 1,
        background: 'rgba(255,255,255,0.04)'
      }
    })))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--pg-bg)'
      }
    }, !isLoggedIn ? window.innerWidth >= 1024 ?
    /*#__PURE__*/
    /* Desktop: login full-screen */
    React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement(LoginScreen, {
      onLogin: handleAuthLogin,
      lang: lang,
      setLang: setLang
    })) : /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        overflowY: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg,#eef2f7 0%,#e8f0fe 100%)',
        padding: '40px 24px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'var(--pg-white)',
        borderRadius: 24,
        boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
        overflow: 'hidden',
        width: '100%',
        maxWidth: 420
      }
    }, /*#__PURE__*/React.createElement(LoginScreen, {
      onLogin: handleAuthLogin,
      lang: lang,
      setLang: setLang
    }))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      ref: screenRef,
      "data-pg-screen": true,
      style: {
        flex: 1,
        position: 'relative',
        overflowY: 'auto',
        overflowX: 'hidden'
      }
    }, tab === 'home' && /*#__PURE__*/React.createElement(HomeScreen, {
      ctx: ctx
    }), tab === 'market' && /*#__PURE__*/React.createElement(MarketplaceScreen, {
      ctx: ctx
    }), tab === 'quick' && /*#__PURE__*/React.createElement(QuickPoolsScreen, {
      ctx: ctx
    }), tab === 'work' && /*#__PURE__*/React.createElement(WorkScreen, {
      ctx: ctx
    }), tab === 'profile' && /*#__PURE__*/React.createElement(ProfileScreen, {
      ctx: ctx
    })))), OverlayBundle(), /*#__PURE__*/React.createElement(TweaksPanel, null, /*#__PURE__*/React.createElement(TweakSection, {
      label: "Subscription tier"
    }), /*#__PURE__*/React.createElement(TweakRadio, {
      value: t.tier,
      options: ['free', 'premium', 'pro'],
      onChange: v => setTweak('tier', v)
    }), /*#__PURE__*/React.createElement(TweakSection, {
      label: "Language"
    }), /*#__PURE__*/React.createElement(TweakRadio, {
      value: lang,
      options: ['en', 'pt', 'es'],
      onChange: v => setLang(v)
    }), /*#__PURE__*/React.createElement(TweakSection, {
      label: "Quick jumps"
    }), /*#__PURE__*/React.createElement(TweakButton, {
      onClick: () => setIsLoggedIn(false)
    }, "Show login screen"), /*#__PURE__*/React.createElement(TweakButton, {
      onClick: () => setChatOpen(true)
    }, "Open chat"), /*#__PURE__*/React.createElement(TweakButton, {
      onClick: () => setPayOpen(true)
    }, "Open paywall"), /*#__PURE__*/React.createElement(TweakButton, {
      onClick: () => setNotifOpen(true)
    }, "Open notifications")));
  }

  // ════════════════════════════════════════════════════════════════
  // MOBILE LAYOUT
  // ════════════════════════════════════════════════════════════════
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      background: 'var(--pg-bg)'
    }
  }, !isLoggedIn && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      overflow: 'auto'
    }
  }, /*#__PURE__*/React.createElement(LoginScreen, {
    onLogin: u => {
      setSessionExpired(false);
      handleAuthLogin(u);
    },
    lang: lang,
    setLang: setLang
  })), sessionExpired && !isLoggedIn && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      zIndex: 5000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--pg-white)',
      borderRadius: 20,
      padding: '28px 24px',
      width: '100%',
      maxWidth: 340,
      textAlign: 'center',
      boxShadow: '0 24px 64px rgba(0,0,0,0.4)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 36,
      marginBottom: 12
    }
  }, "\uD83D\uDD12"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 700,
      color: 'var(--pg-ink-900)',
      marginBottom: 8
    }
  }, lang === 'pt' ? 'Sessão expirada' : lang === 'es' ? 'Sesión expirada' : 'Session expired'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--pg-ink-400)',
      lineHeight: 1.6,
      marginBottom: 20
    }
  }, lang === 'pt' ? 'Por segurança, faça login novamente para continuar.' : lang === 'es' ? 'Por seguridad, inicia sesión nuevamente para continuar.' : 'For security, please sign in again to continue.'), /*#__PURE__*/React.createElement("button", {
    onClick: () => setSessionExpired(false),
    style: {
      width: '100%',
      padding: '13px',
      borderRadius: 14,
      border: 'none',
      background: 'linear-gradient(135deg,var(--pg-blue-500),var(--pg-blue-700))',
      color: '#fff',
      fontWeight: 700,
      fontSize: 15,
      cursor: 'pointer',
      fontFamily: 'inherit'
    }
  }, lang === 'pt' ? 'Entrar novamente' : lang === 'es' ? 'Iniciar sesión' : 'Sign in again'))), isLoggedIn && user.banned && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 24px',
      background: 'var(--pg-white)',
      zIndex: 200,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 72,
      height: 72,
      borderRadius: '50%',
      background: 'rgba(239,68,68,0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "34",
    height: "34",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#EF4444",
    strokeWidth: "1.8",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "4.93",
    y1: "4.93",
    x2: "19.07",
    y2: "19.07"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 800,
      color: 'var(--pg-ink-900)',
      marginBottom: 8,
      fontFamily: 'var(--pg-font-display)'
    }
  }, lang === 'pt' ? 'Conta suspensa' : lang === 'es' ? 'Cuenta suspendida' : 'Account suspended'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: 'var(--pg-ink-500)',
      lineHeight: 1.6,
      maxWidth: 320,
      marginBottom: 28
    }
  }, lang === 'pt' ? 'Sua conta foi suspensa pela equipe de suporte devido a uma violação dos termos de uso.' : lang === 'es' ? 'Tu cuenta fue suspendida por el equipo de soporte debido a una violación de los términos de uso.' : 'Your account has been suspended by the support team due to a violation of our terms of use.'), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 20px',
      borderRadius: 14,
      background: 'rgba(239,68,68,0.06)',
      border: '1px solid rgba(239,68,68,0.2)',
      fontSize: 13,
      color: '#EF4444',
      maxWidth: 320,
      lineHeight: 1.6,
      marginBottom: 28
    }
  }, lang === 'pt' ? 'Se você acredita que isso foi um erro, entre em contato com o suporte pelo e-mail:' : lang === 'es' ? 'Si crees que esto fue un error, contacta al soporte en:' : 'If you believe this was a mistake, contact support at:', /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("strong", null, "support@poolguyx.com")), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      window.sb && window.sb.auth.signOut();
      setIsLoggedIn(false);
    },
    style: {
      padding: '12px 28px',
      borderRadius: 12,
      border: '1.5px solid var(--pg-ink-200)',
      background: 'transparent',
      color: 'var(--pg-ink-600)',
      fontSize: 14,
      fontWeight: 600,
      cursor: 'pointer',
      fontFamily: 'inherit'
    }
  }, lang === 'pt' ? 'Sair da conta' : lang === 'es' ? 'Cerrar sesión' : 'Sign out')), isLoggedIn && !user.banned && /*#__PURE__*/React.createElement(React.Fragment, null, (pullDist > 4 || refreshing) && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      display: 'flex',
      justifyContent: 'center',
      paddingTop: 'max(10px, env(safe-area-inset-top, 10px))',
      pointerEvents: 'none',
      transform: `translateY(${Math.min(pullDist, PULL_THRESHOLD) - PULL_THRESHOLD}px)`,
      transition: pullDist === 0 || refreshing ? 'transform .25s ease' : 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 34,
      height: 34,
      borderRadius: '50%',
      background: 'var(--pg-white)',
      boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--pg-blue-500)",
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      animation: refreshing ? 'pg-spin .7s linear infinite' : 'none',
      transform: !refreshing ? `rotate(${pullDist / PULL_THRESHOLD * 270}deg)` : undefined,
      transition: !refreshing ? 'none' : undefined
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M21 12a9 9 0 1 1-6.219-8.56"
  })))), /*#__PURE__*/React.createElement("div", {
    ref: screenRef,
    "data-pg-screen": true,
    onTouchStart: onPTRTouchStart,
    onTouchMove: onPTRTouchMove,
    onTouchEnd: onPTRTouchEnd,
    style: {
      position: 'absolute',
      inset: 0,
      paddingBottom: 'calc(68px + env(safe-area-inset-bottom, 0px))',
      overflow: 'auto',
      overscrollBehavior: 'none'
    }
  }, tab === 'home' && /*#__PURE__*/React.createElement(HomeScreen, {
    ctx: ctx
  }), tab === 'market' && /*#__PURE__*/React.createElement(MarketplaceScreen, {
    ctx: ctx
  }), tab === 'quick' && /*#__PURE__*/React.createElement(QuickPoolsScreen, {
    ctx: ctx
  }), tab === 'work' && /*#__PURE__*/React.createElement(WorkScreen, {
    ctx: ctx
  }), tab === 'profile' && /*#__PURE__*/React.createElement(ProfileScreen, {
    ctx: ctx
  })), /*#__PURE__*/React.createElement(TabBar, {
    tab: tab,
    setTab: switchTab,
    lang: lang
  }), /*#__PURE__*/React.createElement(DiagBar2, null), (tab === 'market' || tab === 'quick') && /*#__PURE__*/React.createElement("button", {
    onClick: tab === 'market' ? () => setMarketPostOpen(true) : () => setPostQPOpen(true),
    className: "pg-press",
    style: {
      position: 'absolute',
      bottom: 'calc(96px + env(safe-area-inset-bottom, 0px))',
      right: 18,
      zIndex: 35,
      width: 56,
      height: 56,
      borderRadius: '50%',
      padding: 0,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0EBAC7 0%, #0D7280 100%)',
      border: 'none',
      cursor: 'pointer',
      boxShadow: '0 6px 20px rgba(14,186,199,0.45), 0 2px 8px rgba(0,0,0,0.18)'
    }
  }, Icon.plus(24, '#fff'))), OverlayBundle(), /*#__PURE__*/React.createElement(TweaksPanel, null, /*#__PURE__*/React.createElement(TweakSection, {
    label: "Subscription tier"
  }), /*#__PURE__*/React.createElement(TweakRadio, {
    value: t.tier,
    options: ['free', 'premium', 'pro'],
    onChange: v => {
      setTweak('tier', v);
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: 'rgba(41,38,27,.55)',
      lineHeight: 1.4,
      marginTop: -4
    }
  }, "Free = Express Pools locked. Premium/PRO unlock apply + contact."), /*#__PURE__*/React.createElement(TweakSection, {
    label: "Language"
  }), /*#__PURE__*/React.createElement(TweakRadio, {
    value: lang,
    options: ['en', 'pt', 'es'],
    onChange: v => setLang(v)
  }), /*#__PURE__*/React.createElement(TweakSection, {
    label: "Quick jumps"
  }), /*#__PURE__*/React.createElement(TweakButton, {
    onClick: () => setIsLoggedIn(false)
  }, "Show login screen"), /*#__PURE__*/React.createElement(TweakButton, {
    onClick: () => {
      setTab('quick');
    }
  }, "Open Express Pools"), /*#__PURE__*/React.createElement(TweakButton, {
    onClick: () => setPostMenuOpen(true)
  }, "Open post menu"), /*#__PURE__*/React.createElement(TweakButton, {
    onClick: () => setPostQPOpen(true)
  }, "Open Post Quick Pool form"), /*#__PURE__*/React.createElement(TweakButton, {
    onClick: () => setChatOpen(true)
  }, "Open chat"), /*#__PURE__*/React.createElement(TweakButton, {
    onClick: () => setPayOpen(true)
  }, "Open paywall"), /*#__PURE__*/React.createElement(TweakButton, {
    onClick: () => setNotifOpen(true)
  }, "Open notifications"), /*#__PURE__*/React.createElement(TweakButton, {
    onClick: () => setLangPickerOpen(true)
  }, "Open language picker"), /*#__PURE__*/React.createElement(TweakButton, {
    onClick: () => setApplicantsPost(MY_POSTS[0])
  }, "Open applicants"), /*#__PURE__*/React.createElement(TweakButton, {
    onClick: () => setWalletOpen(true)
  }, "Open wallet"), /*#__PURE__*/React.createElement(TweakButton, {
    onClick: () => setJobDetailApp(MY_APPLICATIONS[0])
  }, "Job lifecycle (hired)"), /*#__PURE__*/React.createElement(TweakButton, {
    onClick: () => setJobDetailApp(MY_APPLICATIONS[1])
  }, "Job lifecycle (in progress)"), /*#__PURE__*/React.createElement(TweakButton, {
    onClick: () => setReviewApp(MY_APPLICATIONS[3])
  }, "Open review sheet")));
}

// ── Error Boundary ────────────────────────────────────────────
class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null
    };
  }
  static getDerivedStateFromError(e) {
    return {
      error: e
    };
  }
  componentDidCatch(e, info) {
    console.error('[AppErrorBoundary]', e, info);
  }
  render() {
    if (!this.state.error) return this.props.children;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100dvh',
        padding: '32px 20px',
        background: 'var(--pg-bg)',
        textAlign: 'center',
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40
      }
    }, "\u26A0\uFE0F"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 17,
        fontWeight: 700,
        color: 'var(--pg-ink-900)',
        maxWidth: 300
      }
    }, "Algo deu errado"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: 'var(--pg-ink-400)',
        maxWidth: 280,
        lineHeight: 1.6
      }
    }, this.state.error?.message || 'Erro inesperado no aplicativo.'), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        this.setState({
          error: null
        });
        window.location.reload();
      },
      style: {
        marginTop: 8,
        padding: '12px 28px',
        borderRadius: 14,
        border: 'none',
        background: 'linear-gradient(135deg,var(--pg-blue-500),var(--pg-blue-700))',
        color: '#fff',
        fontWeight: 700,
        fontSize: 14,
        cursor: 'pointer',
        fontFamily: 'inherit'
      }
    }, "Recarregar"));
  }
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(AppErrorBoundary, null, /*#__PURE__*/React.createElement(App, null)));