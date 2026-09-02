// app.jsx — root, tab routing, overlays

// ── Referral link capture ─────────────────────────────────────
// Runs at module load, before React mounts and before any auth
// redirect rewrites the URL — someone opening ?ref=ABC123 usually
// still has to sign up (and may bounce through Google/Apple OAuth)
// before the code can be claimed, so it has to be parked somewhere
// that survives that round-trip.
(function capturePendingReferral() {
  try {
    const params = new URLSearchParams(window.location.search);
    let code = params.get('ref');
    if (!code && window.location.hash.includes('ref=')) {
      code = new URLSearchParams(window.location.hash.split('?')[1] || '').get('ref');
    }
    if (!code) return;
    localStorage.setItem('pg_pending_ref', code.trim().toUpperCase());
    // Strip it from the URL so a reload (or a shared screenshot of the
    // address bar) can't re-trigger an attribution attempt later.
    params.delete('ref');
    const qs = params.toString();
    window.history.replaceState({}, '', window.location.pathname + (qs ? '?' + qs : '') + window.location.hash);
  } catch (e) {}
})();

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
    window.open(`mailto:feedback@poolguyx.com?subject=${subject}&body=${body}`, '_blank');
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

// ── "Ride request" style alert — new QuickPool job matching the user's
// city/day, broadcast to every matching poolguy at once (see notify-quick-pool
// edge function). Slides down from the top like a driver-app trip request.
function RideRequestCard({ alert, lang='pt', onView, onApply, onDismiss, applying }) {
  if (!alert) return null;
  // Structured shape (from the poll) has city/dayLabel/poolsCount/price; the
  // postMessage path (app backgrounded, push arrives) only has flat title/body
  // strings — fall back to those when structured fields aren't present.
  const hasStructured = !!alert.city;
  // Price is what a pool guy actually decides on — the 70/30 split (when this
  // is a Rota Rápida job) is secondary context, shown small next to it rather
  // than as the headline number.
  const priceLabel = alert.price ? `$${alert.price}` : (lang==='pt'?'Negociável':lang==='es'?'Negociable':'Negotiable');
  const splitLabel = alert.splitTakerPct ? `${alert.splitTakerPct}/${100-alert.splitTakerPct}` : null;
  const poolsLabel = `${alert.poolsCount ?? 1} ${(alert.poolsCount??1) > 1 ? (lang==='pt'?'piscinas':lang==='es'?'piscinas':'pools') : (lang==='pt'?'piscina':lang==='es'?'piscina':'pool')}`;
  // Everything the pool guy needs to decide without opening the job — property
  // type + access/hazard flags — instead of the day of week, which they
  // already implicitly know (this alert only fires for days they cover).
  const infoChips = hasStructured ? [
    { label: alert.isCondo ? (lang==='pt'?'🏢 Condomínio':lang==='es'?'🏢 Condominio':'🏢 Condo') : (lang==='pt'?'🏠 Casa':lang==='es'?'🏠 Casa':'🏠 House') },
    { label: poolsLabel },
    alert.saltwater && { label: lang==='pt'?'🧂 Piscina de sal':lang==='es'?'🧂 Piscina de sal':'🧂 Saltwater' },
    alert.hasDog && { label: lang==='pt'?'🐕 Tem cachorro':lang==='es'?'🐕 Hay perro':'🐕 Dog on property' },
    alert.gateCode && { label: lang==='pt'?'🔑 Código do portão':lang==='es'?'🔑 Código del portón':'🔑 Gate code' },
    alert.doorman && { label: lang==='pt'?'🛎️ Portaria':lang==='es'?'🛎️ Portería':'🛎️ Doorman' },
  ].filter(Boolean) : [];
  return (
    <div style={{
      position:'fixed', top:0, left:0, right:0, zIndex:10000,
      display:'flex', justifyContent:'center',
      paddingTop:'max(12px, env(safe-area-inset-top))',
      pointerEvents:'none',
    }}>
      <div style={{
        pointerEvents:'auto',
        width:'calc(100% - 24px)', maxWidth:440, margin:'0 12px',
        borderRadius:20, overflow:'hidden',
        background:'linear-gradient(160deg,#0A2840 0%,#0D5C8C 55%,#0EBAC7 130%)',
        boxShadow:'0 16px 40px rgba(4,13,24,0.45), 0 0 0 1px rgba(255,255,255,0.08) inset',
        animation:'pg-ride-drop 0.4s cubic-bezier(.22,1,.36,1)',
      }}>
        <div style={{padding:'16px 16px 14px', display:'flex', alignItems:'flex-start', gap:13}}>
          <div style={{position:'relative', width:60, height:60, flexShrink:0}}>
            <div style={{position:'absolute', inset:0, borderRadius:'50%', background:'rgba(14,186,199,0.35)', animation:'pg-ride-pulse 1.6s ease-out infinite'}}/>
            <img src="/icone-192.png" alt="" style={{
              position:'relative', width:60, height:60, borderRadius:'50%', objectFit:'cover',
              boxShadow:'0 4px 14px rgba(4,13,24,0.4), 0 0 0 2px rgba(255,255,255,0.25)'}}/>
          </div>
          <div style={{flex:1, minWidth:0, paddingTop:1}}>
            <div style={{display:'flex', alignItems:'center', gap:5, marginBottom:3}}>
              <span style={{width:6, height:6, borderRadius:'50%', background:'#4ADE80', flexShrink:0, animation:'pg-ride-blink 1.2s ease-in-out infinite'}}/>
              <span style={{fontSize:10.5, fontWeight:800, color:'rgba(255,255,255,0.75)', letterSpacing:'0.08em', textTransform:'uppercase'}}>
                {alert.isRoute
                  ? (lang==='pt'?'🚨 Rota disponível':lang==='es'?'🚨 Ruta disponible':'🚨 Route available')
                  : (lang==='pt'?'Nova vaga disponível':lang==='es'?'Nuevo trabajo disponible':'New job available')}
              </span>
            </div>
            <div style={{fontSize:17, fontWeight:800, color:'#fff', lineHeight:1.2, fontFamily:'var(--pg-font-display)'}}>
              {hasStructured ? alert.city : alert.title}
            </div>
            {!hasStructured && (
              <div style={{fontSize:12.5, color:'rgba(255,255,255,0.80)', marginTop:3, lineHeight:1.4}}>
                {alert.body}
              </div>
            )}
          </div>
          {hasStructured && (
            <div style={{textAlign:'right', flexShrink:0}}>
              <div style={{fontSize:24, fontWeight:800, color:'#4ADE80', lineHeight:1, fontFamily:'var(--pg-font-display)'}}>
                {priceLabel}
              </div>
              {alert.price && (
                <div style={{fontSize:9.5, fontWeight:700, color:'rgba(74,222,128,0.75)', textTransform:'uppercase', letterSpacing:'0.05em', marginTop:2}}>
                  {lang==='pt'?'por piscina':lang==='es'?'por piscina':'per pool'}
                </div>
              )}
              {splitLabel && (
                <div style={{fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.45)', marginTop:2}}>
                  {splitLabel} split
                </div>
              )}
            </div>
          )}
        </div>
        {hasStructured && infoChips.length > 0 && (
          <div style={{display:'flex', flexWrap:'wrap', gap:6, padding:'0 16px 14px'}}>
            {infoChips.map((chip, i) => (
              <span key={i} style={{fontSize:11.5, fontWeight:700, padding:'3px 9px', borderRadius:999, background:'rgba(255,255,255,0.16)', color:'#fff'}}>
                {chip.label}
              </span>
            ))}
          </div>
        )}
        <div style={{display:'flex', gap:0, borderTop:'1px solid rgba(255,255,255,0.15)'}}>
          <button onClick={onDismiss} style={{
            flex:1, padding:'13px 6px', border:'none', cursor:'pointer', fontFamily:'inherit',
            background:'rgba(0,0,0,0.12)', color:'rgba(255,255,255,0.75)', fontSize:12.5, fontWeight:700,
            borderRight:'1px solid rgba(255,255,255,0.15)',
          }}>
            {lang==='pt'?'Ignorar':lang==='es'?'Ignorar':'Ignore'}
          </button>
          <button onClick={onView} style={{
            flex:1.1, padding:'13px 6px', border:'none', cursor:'pointer', fontFamily:'inherit',
            background:'rgba(255,255,255,0.10)', color:'#fff', fontSize:12.5, fontWeight:700,
            borderRight:'1px solid rgba(255,255,255,0.15)',
          }}>
            {lang==='pt'?'Ver anúncio':lang==='es'?'Ver anuncio':'View listing'}
          </button>
          <button onClick={onApply} disabled={applying} style={{
            flex:1.3, padding:'13px 6px', border:'none', cursor:applying?'default':'pointer', fontFamily:'inherit',
            background:'linear-gradient(135deg,#22C55E,#16A34A)', color:'#fff', fontSize:12.5, fontWeight:800,
            display:'flex', alignItems:'center', justifyContent:'center', gap:5, opacity:applying?0.7:1,
          }}>
            {applying ? (lang==='pt'?'Enviando…':lang==='es'?'Enviando…':'Sending…') : (lang==='pt'?'Candidatar-se':lang==='es'?'Postularme':'Apply')}
          </button>
        </div>
        {/* Auto-dismiss progress bar */}
        <div style={{height:3, background:'rgba(255,255,255,0.15)'}}>
          <div style={{height:'100%', background:'linear-gradient(90deg,#0EBAC7,#4ADE80)', animation:'pg-ride-drain 18s linear forwards'}}/>
        </div>
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
  // Also handles deep links from notification clicks on iOS (openWindow triggers hashchange)
  React.useEffect(() => {
    const onHash = () => {
      const raw  = window.location.hash; // e.g. '#chat?user=UID&name=Name'
      const hash = raw.replace(/^#\/?/, '');
      const base = hash.split(/[/?]/)[0];
      if (base === 'chat') {
        const qs     = raw.includes('?') ? raw.slice(raw.indexOf('?') + 1) : '';
        const params = new URLSearchParams(qs);
        const userId   = params.get('user') || null;
        const userName = params.get('name') || null;
        if (userId) {
          window.history.replaceState(null, '', '#home');
          setChatConvoTarget({ id: userId, name: userName || undefined });
          setChatOpen(true);
        }
        return;
      }
      const VALID = ['home','market','quick','work','profile'];
      if (VALID.includes(base)) setTab(base);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const screenRef = React.useRef(null);

  // ── Pull-to-refresh (main tabs only — disabled when any sheet/overlay is open) ──
  const pullStartY  = React.useRef(null);
  const [pullDist,  setPullDist]  = React.useState(0);
  const [refreshing,setRefreshing]= React.useState(false);
  const PULL_THRESHOLD = 64;

  const pullStartX  = React.useRef(null);
  const pullLocked  = React.useRef(false); // true once a gesture is confirmed vertical-only

  const onPTRTouchStart = React.useCallback((e) => {
    // Disable PTR when any sheet or full-page overlay is open
    if (document.querySelector('.pg-sheet-backdrop')) return;
    if (document.querySelector('[data-pg-fullpage]')) return;
    // Leaflet maps (QuickPools) pan via internal drag handling, not native
    // scrollTop, so the scrollable-ancestor check below never catches them —
    // dragging the map down to reveal what's further north/south was
    // indistinguishable from a real pull-to-refresh and reloaded the page.
    if (e.target.closest && e.target.closest('.leaflet-container')) return;
    if (!screenRef.current || screenRef.current.scrollTop !== 0) return;
    let el = e.target;
    while (el && el !== screenRef.current) {
      if (el.scrollTop > 0) return;
      el = el.parentElement;
    }
    pullStartY.current = e.touches[0].clientY;
    pullStartX.current = e.touches[0].clientX;
    pullLocked.current = false;
  }, []);

  const onPTRTouchMove = React.useCallback((e) => {
    if (pullStartY.current === null) return;
    const dy = e.touches[0].clientY - pullStartY.current;
    const dx = e.touches[0].clientX - (pullStartX.current ?? e.touches[0].clientX);
    // A horizontal (or diagonal-leaning-horizontal) drag — e.g. swiping the "Meus
    // Anúncios" carousel — should never engage pull-to-refresh. Bail out for good
    // once we detect that, rather than re-checking every move (which would let a
    // late vertical correction re-trigger PTR mid-swipe).
    if (!pullLocked.current) {
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
        pullStartY.current = null; pullStartX.current = null; setPullDist(0); return;
      }
      if (Math.abs(dy) > 10) pullLocked.current = true; // confirmed vertical intent
    }
    if (dy > 0) {
      if (screenRef.current && screenRef.current.scrollTop > 0) {
        pullStartY.current = null; setPullDist(0); return;
      }
      setPullDist(Math.min(dy * 0.55, 80));
    } else {
      pullStartY.current = null; setPullDist(0);
    }
  }, []);

  const onPTRTouchEnd = React.useCallback(() => {
    if (pullDist >= PULL_THRESHOLD) {
      setRefreshing(true);
      setPullDist(PULL_THRESHOLD);
      setTimeout(() => window.location.reload(), 950);
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
  const [isLoggedIn,    setIsLoggedIn]    = React.useState(false);
  const [sessionExpired, setSessionExpired] = React.useState(false);
  const [user, setUser] = React.useState({
    name:'', email:'', uid:'', role:'user', tier: t.tier, rating: null, reviews: 0,
    regions:['Broward','Weston','Plantation'],
    // Profile fields — start empty; each user fills these in themselves
    age: null,
    region: '',
    hasCar: false,
    hasLicense: false,
    hasEquipment: false,
    equipment: null,
    experience: [],
    notifyPools: true,
    notifyRoutes: true,
    notifyService: true,
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
      notifPrefs:           profile?.notif_prefs || { chat: true, quick: true, market: true, work: true },
      age:                  profile?.age           ?? null,
      hasCar:                !!profile?.has_car,
      hasLicense:            !!profile?.has_license,
      hasEquipment:          !!profile?.has_equipment,
      equipment:             profile?.equipment    ?? null,
      experience:            profile?.experience   ?? [],
      notifyPools:           profile?.notify_pools  !== false,
      notifyRoutes:          profile?.notify_routes !== false,
      notifyService:         profile?.notify_service  !== false,
      tier:                  profile?.tier || 'free',
    }));
    // The tweaks panel mirrors tier into user state on change, so push the
    // real value into it too — otherwise the locally-remembered preview
    // tier would immediately overwrite what the database just told us.
    if (profile?.tier) { try { setTweak('tier', profile.tier); } catch (e) {} }
    // Load regionsByDay from profile if saved
    if (profile?.regions_by_day && Object.keys(profile.regions_by_day).length > 0) {
      setRegionsByDay(profile.regions_by_day);
    }
    // Live rating/review count — computed from real ratings received, never cached/hardcoded.
    // Only counts ratings that are actually revealed (both sides rated, or the 7-day blind
    // window expired) — otherwise a seller could see their own score the instant they rate
    // a buyer, before the buyer has had a chance to rate back.
    window.sb.from('ratings').select('stars').eq('to_id', sbUser.id)
      .or('pending.eq.false,expires_at.lt.' + new Date().toISOString())
      .then(({ data }) => {
        const stars = (data || []).map(r => r.stars).filter(s => s != null);
        const avg = stars.length ? Math.round(stars.reduce((a, b) => a + b, 0) / stars.length * 10) / 10 : null;
        setUser(u => ({ ...u, rating: avg, reviews: stars.length }));
      })
      .catch(() => {});
  }, []);

  // authReady gates the data fetch — ensures profile is loaded before querying DB
  const [authReady, setAuthReady] = React.useState(false);
  // False until the first full data fetch resolves — lets the splash screen
  // (and HomeScreen's "Meus Anúncios") tell "genuinely no listings yet"
  // apart from "still loading", instead of flashing an empty state.
  const [liveDataLoaded, setLiveDataLoaded] = React.useState(false);

  // ── Wallet + referral ────────────────────────────────────────
  const [wallet,   setWallet]   = React.useState(null); // my_referral_summary()
  const [walletTx, setWalletTx] = React.useState([]);   // ledger rows, newest first

  const loadWallet = React.useCallback(async () => {
    if (!window.sb) return;
    try {
      // Deliberately does NOT read the user id from state: this runs inside
      // the first data fetch, which can land before the effect that syncs
      // userRef, and gating on it silently skipped the load. Both calls
      // already scope themselves to the caller server-side —
      // my_referral_summary() via auth.uid(), and wallet_transactions via
      // its own RLS policy — so an explicit user filter added nothing but
      // a race.
      //
      // The session, though, is worth checking: that same first data fetch
      // also runs on the login screen, where both calls can only 401. Read
      // it from the auth client rather than from React state — it is the
      // thing the requests authenticate with, so it is already correct by
      // the time they would fire, and gating on it reintroduces no race.
      const { data: { session } } = await window.sb.auth.getSession();
      if (!session) return;
      const [sum, tx] = await Promise.all([
        window.sb.rpc('my_referral_summary'),
        window.sb.from('wallet_transactions').select('*')
          .order('created_at', { ascending: false }).limit(50),
      ]);
      if (sum?.data?.ok) setWallet(sum.data);
      if (tx?.data) setWalletTx(tx.data);
    } catch (e) {}
  }, []);

  // Hide splash screen once auth AND the first data fetch are both done —
  // hiding on authReady alone let the app shell show through with jobs/
  // marketplace/"Meus Anúncios" still empty for a beat before they filled
  // in. isLoggedIn false skips straight to the login screen either way, so
  // this only holds the splash a little longer for an actual logged-in load.
  React.useEffect(() => {
    if (authReady && (!isLoggedIn || liveDataLoaded) && window.__pgHideSplash) window.__pgHideSplash();
  }, [authReady, isLoggedIn, liveDataLoaded]);

  const [showOnboarding, setShowOnboarding] = React.useState(false);

  const handleAuthLogin = React.useCallback(async (sbUser) => {
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
      setUser(u => ({ ...u, name:'', email:'', uid:'', role:'user' }));
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
      } catch(e) {}
    };
    const _expiryTimer = setInterval(_checkTokenExpiry, 120_000);
    if (!window.sb) { setAuthReady(true); return () => clearInterval(_expiryTimer); }
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
    return () => clearInterval(_expiryTimer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [lang, setLangState] = React.useState(() => {
    try { return localStorage.getItem('pg_lang') || t.lang; } catch(e) { return t.lang; }
  });
  // Per-weekday region preferences for notifications (loaded from Supabase on login)
  const [regionsByDay, setRegionsByDay] = React.useState({mon:[],tue:[],wed:[],thu:[],fri:[],sat:[],sun:[]});
  // Refs so the realtime effect below (which only mounts once, on authReady) can
  // always read the LATEST user/regionsByDay instead of a stale closure from
  // whatever they were at initial mount (regionsByDay loads async, after login).
  const userRef = React.useRef(user);
  React.useEffect(() => { userRef.current = user; }, [user]);
  const regionsByDayRef = React.useRef(regionsByDay);
  React.useEffect(() => { regionsByDayRef.current = regionsByDay; }, [regionsByDay]);

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
      // Find people who rated ME but I haven't rated back yet.
      // NOTE: `pending` stays true even after the rater submits — it means "still in the
      // 7-day blind window", not "not yet submitted". So we must check stars IS NOT NULL
      // (valid stars are 1-5, never 0) to know the OTHER side actually rated me, instead
      // of filtering on `pending` here.
      const { data: received } = await window.sb.from('ratings')
        .select('id,listing_id,listing_name,from_id,from_name,to_id,connection_type,connection_id,created_at,expires_at')
        .eq('to_id', user.uid)
        .neq('stars', 0)
        .order('created_at', { ascending: true });
      if (!received || received.length === 0) { setPendingRatings([]); return; }
      const now = Date.now();
      const notExpired = received.filter(r => !r.expires_at || new Date(r.expires_at).getTime() > now);
      if (notExpired.length === 0) { setPendingRatings([]); return; }
      // Filter out ones I already rated back — my own reciprocal row always exists as an
      // empty placeholder from the moment the sale closes, so check it has real stars too,
      // not just that a row exists.
      const { data: myRatings } = await window.sb.from('ratings')
        .select('to_id').eq('from_id', user.uid).neq('stars', 0).in('to_id', notExpired.map(r => r.from_id));
      const alreadyRated = new Set((myRatings || []).map(r => r.to_id));
      setPendingRatings(notExpired.filter(r => !alreadyRated.has(r.from_id)));
    } catch(e) {}
  }, [user?.uid]);

  React.useEffect(() => {
    if (isLoggedIn && user?.uid) {
      loadPendingRatings();
      loadLiveApplications(user.uid); // load immediately on login, not just on 30s poll
    }
  }, [isLoggedIn, user?.uid, loadPendingRatings]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Poll: someone rated me → surface the rating popup, on whatever tab I'm
  // on, instead of waiting for the next Home-tab visit. window.sb.channel()
  // (see index.html) is a hand-rolled stub with no real WebSocket connection —
  // .on()/.subscribe() never actually fire — so this has to be a poll, not a
  // realtime subscription, to actually work.
  const pendingRatingIdsRef = React.useRef(new Set());
  React.useEffect(() => {
    if (!isLoggedIn || !user?.uid || !window.sb) return;
    const check = async () => {
      if (!window.sb || !user?.uid) return;
      const { data: received } = await window.sb.from('ratings')
        .select('id').eq('to_id', user.uid).neq('stars', 0).catch(() => ({ data: null }));
      if (!received) return;
      const newOnes = received.some(r => !pendingRatingIdsRef.current.has(r.id));
      pendingRatingIdsRef.current = new Set(received.map(r => r.id));
      if (newOnes) { loadPendingRatings(); setRatingPromptOpen(true); }
    };
    check();
    const timer = setInterval(check, 20000);
    return () => clearInterval(timer);
  }, [isLoggedIn, user?.uid, loadPendingRatings]);

  // ── Push notification subscription ─────────────────────────────
  const VAPID_PUBLIC = 'BC5W23IjAHOReRjCYC3MtRac1YMPSaodjgrhXXwWWCzHHCvAm7KgZG8_eeDcKK2w_wqbsVBHgHpbdcxZtors-5g';

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(base64);
    return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
  }

  // Global helper: fire-and-forget push to another user via Edge Function
  window.sendPush = async function(userId, title, body, url, notifType, convoId) {
    try {
      // getSession() reads a cached token with no freshness check — if it's stale,
      // the platform's verify_jwt gate 401s the request before our function code
      // (or even its logging) ever runs, so every push call silently no-ops with
      // zero trace anywhere. Refresh first, same fix already applied to the other
      // authenticated Edge Function calls in this file.
      if (window.sb.auth.refresh) await window.sb.auth.refresh().catch(()=>{});
      const { data: { session } } = await window.sb.auth.getSession();
      const token = session?.access_token || '';
      const res = await fetch('https://xiszfqghizqzlwyrfjol.supabase.co/functions/v1/send-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ user_id: userId, title, body, url, notif_type: notifType, convo_id: convoId || null }),
      });
      if (!res.ok) console.error('[sendPush] failed', res.status, await res.text().catch(()=>''));
    } catch(e) { console.error('[sendPush] error', e); }
  };

  // Play a short notification beep using Web Audio API (in-app only)
  window.playNotifSound = function() {
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = 'sine'; o.frequency.value = 880;
      g.gain.setValueAtTime(0, ac.currentTime);
      g.gain.linearRampToValueAtTime(0.25, ac.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.25);
      o.start(ac.currentTime); o.stop(ac.currentTime + 0.25);
    } catch(e) {}
  };

  // Distinct two-tone chime for the "ride request" style QuickPool alert —
  // more attention-grabbing than the single-beep generic notification sound.
  window.playRideAlertSound = function() {
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      [[660, 0], [880, 0.11]].forEach(([freq, delay]) => {
        const o = ac.createOscillator();
        const g = ac.createGain();
        o.connect(g); g.connect(ac.destination);
        o.type = 'sine'; o.frequency.value = freq;
        const t0 = ac.currentTime + delay;
        g.gain.setValueAtTime(0, t0);
        g.gain.linearRampToValueAtTime(0.28, t0 + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.22);
        o.start(t0); o.stop(t0 + 0.22);
      });
    } catch(e) {}
  };

  const [pushLog, setPushLog] = React.useState(() => {
    try {
      const stored = localStorage.getItem('pg_push_log') || '';
      // Only restore final states (✅ or ❌) — never restore intermediate "aguardando..." messages
      return (stored.startsWith('✅') || stored.startsWith('❌')) ? stored : '';
    } catch { return ''; }
  });
  const _setPushLog = (msg) => { setPushLog(msg); try { localStorage.setItem('pg_push_log', msg); } catch{} };

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
      if (!reg) reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });

      // pushManager.subscribe() requires an *active* SW — wait for it if needed
      if (!reg.active) {
        reg = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise((_, reject) => setTimeout(() => reject(new Error('SW não ativou a tempo')), 20000)),
        ]);
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
          user_id: user.uid, endpoint: j.endpoint, p256dh: j.keys.p256dh, auth: j.keys.auth,
        }, { onConflict: 'user_id,endpoint' });
        _setPushLog('✅ notificações ativas');
        return;
      }

      // Manual path: subscribe (existing or new)
      _setPushLog('ativando...');
      const existing = await reg.pushManager.getSubscription();
      const sub = existing || await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
      });
      const j = sub.toJSON();
      const { error } = await window.sb.from('push_subscriptions').upsert({
        user_id: user.uid, endpoint: j.endpoint, p256dh: j.keys.p256dh, auth: j.keys.auth,
      }, { onConflict: 'user_id,endpoint' });
      if (error) { _setPushLog('❌ erro ao salvar: ' + error.message); return; }
      _setPushLog('✅ notificações ativas');
    } catch(e) {
      if (manual) _setPushLog('❌ ' + (e.message || String(e)));
    }
  }, [user?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  // Separate on/off switches for Piscinas Rápidas vs Rotas Rápidas push —
  // some pool guys only want to hear about nearby single pools while already
  // employed, others (between routes) only want route openings. Turning a
  // switch on when the browser hasn't granted push yet asks for permission
  // right there, same flow as the existing "ativar notificações" button.
  const setNotifyPref = React.useCallback(async (key, value) => {
    if (!user?.uid) return;
    setUser(u => ({ ...u, [key]: value }));
    const col = { notifyPools:'notify_pools', notifyRoutes:'notify_routes', notifyService:'notify_service' }[key];
    try { await window.sb.from('profiles').update({ [col]: value }).eq('id', user.uid); } catch {}
    if (value && Notification?.permission !== 'granted') {
      _registerPush(true);
    }
  }, [user?.uid, _registerPush]);

  // Auto-register silently on login (no permission prompt — only refreshes existing sub)
  React.useEffect(() => {
    if (!isLoggedIn || !user?.uid) return;
    const t = setTimeout(() => _registerPush(false), 2000);
    return () => clearTimeout(t);
  }, [isLoggedIn, user?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  // Overlays
  const [chatOpen,         setChatOpen]        = React.useState(false);
  const [chatConvoTarget,  setChatConvoTarget]  = React.useState(null); // string | { id, name }

  // Opening chat from a push-notification deep link only tells us WHO sent the
  // message, not which conversation thread it belongs to (general vs tied to a
  // specific listing) — conversations are keyed by makeConvoId(me, other, listingId),
  // so guessing listingId=null here would land in the wrong (often brand-new) thread
  // whenever the real conversation was scoped to a listing. Look up the most recently
  // active real conversation between the two of us first, and reuse its listing scope.
  const openChatFromDeepLink = React.useCallback(async (userId, userName) => {
    let listingId = null, listingContext = null, name = userName || undefined;
    try {
      if (window.sb && user?.uid && userId) {
        const q = `and(participant_1.eq.${user.uid},participant_2.eq.${userId}),and(participant_1.eq.${userId},participant_2.eq.${user.uid})`;
        const { data } = await window.sb.from('conversations').select('*').or(q)
          .order('last_message_at', { ascending: false }).limit(1);
        const row = data && data[0];
        if (row) {
          listingId = row.listing_id || null;
          if (listingId) listingContext = { name: row.listing_name || null, photoUrl: row.listing_photo_url || null };
          const amP1 = row.participant_1 === user.uid;
          name = (amP1 ? row.name_2 : row.name_1) || name;
        }
      }
    } catch {}
    setChatConvoTarget({ id: userId, name, listingId, listingContext });
    setChatOpen(true);
  }, [user?.uid]);
  const [pendingQuickJobId, setPendingQuickJobId] = React.useState(() => {
    try {
      const hash = window.location.hash; // e.g. "#quick?job=uuid"
      const qs = hash.includes('?') ? hash.slice(hash.indexOf('?') + 1) : '';
      const jobId = new URLSearchParams(qs).get('job') || null;
      if (jobId) window.history.replaceState(null, '', '#quick');
      return jobId;
    } catch { return null; }
  });
  const [pendingHandoffId, setPendingHandoffId] = React.useState(null);
  const [pendingJobCardId, setPendingJobCardId] = React.useState(null);
  const [pendingVacId, setPendingVacId] = React.useState(null);
  // Parse deep link from URL on startup (e.g. notification click when app was closed)
  const [pendingDeepLink, setPendingDeepLink] = React.useState(() => {
    try {
      const hash = window.location.hash;
      if (hash.startsWith('#chat')) {
        const qs = hash.includes('?') ? hash.slice(hash.indexOf('?') + 1) : '';
        const params = new URLSearchParams(qs);
        const userId = params.get('user') || null;
        const userName = params.get('name') || null;
        if (userId) { window.history.replaceState(null, '', '#home'); return { type: 'chat', userId, userName }; }
      } else if (hash.startsWith('#market')) {
        const qs = hash.includes('?') ? hash.slice(hash.indexOf('?') + 1) : '';
        const listingId = new URLSearchParams(qs).get('listing') || null;
        window.history.replaceState(null, '', '#home');
        return listingId ? { type: 'listing', id: listingId } : { type: 'tab', tab: 'market' };
      } else if (hash.startsWith('#work')) {
        const qs = hash.includes('?') ? hash.slice(hash.indexOf('?') + 1) : '';
        const params = new URLSearchParams(qs);
        const handoffId = params.get('handoff') || null;
        const jobId = params.get('job') || null;
        const vacId = params.get('vac') || null;
        // Only consume the hash (reset to #home) when it's carrying a specific
        // deep-linked item to open. A bare "#work/<sub>" (e.g. from reloading
        // while on the Férias/Técnicos sub-tab) must be left alone — WorkScreen
        // reads that segment itself to restore the sub-tab, and wiping it here
        // was sending every reload back to the default "Vagas" sub-tab.
        if (handoffId || jobId || vacId) window.history.replaceState(null, '', '#home');
        if (handoffId) return { type: 'handoff', id: handoffId };
        if (jobId) return { type: 'jobcard', id: jobId };
        if (vacId) return { type: 'vac', id: vacId };
      } else if (hash.startsWith('#home')) {
        const qs = hash.includes('?') ? hash.slice(hash.indexOf('?') + 1) : '';
        window.history.replaceState(null, '', '#home');
        if (new URLSearchParams(qs).get('rate') === '1') return { type: 'rate' };
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
    } else if (pendingDeepLink.type === 'listing') {
      setDeepLinkListingId(pendingDeepLink.id);
      setTab('market');
    } else if (pendingDeepLink.type === 'handoff') {
      setPendingHandoffId(pendingDeepLink.id);
      setTab('work');
    } else if (pendingDeepLink.type === 'jobcard') {
      setPendingJobCardId(pendingDeepLink.id);
      setTab('work');
    } else if (pendingDeepLink.type === 'vac') {
      setPendingVacId(pendingDeepLink.id);
      setTab('work');
    } else if (pendingDeepLink.type === 'rate') {
      loadPendingRatings();
      setRatingPromptOpen(true);
    }
  }, [pendingDeepLink, user?.uid, openChatFromDeepLink, loadPendingRatings]);
  // Shared deep-link navigation — used both when a notification is tapped
  // (OPEN_JOB) and from the in-app toast shown while the app is foregrounded
  // (PUSH_RECEIVED, see below).
  const navigateFromDeepLinkUrl = React.useCallback((url) => {
    const hashIdx = url.indexOf('#');
    const hash = hashIdx >= 0 ? url.slice(hashIdx) : '';
    if (hash.startsWith('#chat')) {
      const qs = hash.includes('?') ? hash.slice(hash.indexOf('?') + 1) : '';
      const params = new URLSearchParams(qs);
      const userId = params.get('user') || null;
      const userName = params.get('name') || null;
      if (userId) { openChatFromDeepLink(userId, userName); }
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
      const qs = hash.includes('?') ? hash.slice(hash.indexOf('?') + 1) : '';
      const listingId = new URLSearchParams(qs).get('listing') || null;
      if (listingId) ctx.openListingById(listingId);
      else setTab('market');
    } else if (hash.startsWith('#work')) {
      const qs = hash.includes('?') ? hash.slice(hash.indexOf('?') + 1) : '';
      const params = new URLSearchParams(qs);
      const handoffId = params.get('handoff') || null;
      const jobId = params.get('job') || null;
      const vacId = params.get('vac') || null;
      if (handoffId) ctx.openListingById('handoff_' + handoffId);
      else if (jobId) ctx.openListingById('job_' + jobId);
      else if (vacId) ctx.openListingById('vac_' + vacId);
      else setTab('work');
    } else if (hash.startsWith('#home')) {
      const qs = hash.includes('?') ? hash.slice(hash.indexOf('?') + 1) : '';
      if (new URLSearchParams(qs).get('rate') === '1') {
        loadPendingRatings();
        setRatingPromptOpen(true);
      }
      setTab('home');
    }
  }, [openChatFromDeepLink, loadPendingRatings]);

  // Listen for service worker postMessage — either a notification tap while
  // the app was already open (OPEN_JOB, navigates right away since the user
  // already expressed intent by tapping), or a push arriving while the app
  // is foregrounded (PUSH_RECEIVED — tapping the OS banner is unreliable on
  // iOS PWAs in that state, so show a clickable in-app toast instead).
  React.useEffect(() => {
    if (!navigator.serviceWorker) return;
    const handler = (event) => {
      if (event.data?.type === 'OPEN_JOB') {
        window.playNotifSound && window.playNotifSound();
        navigateFromDeepLinkUrl(event.data.url || '');
      } else if (event.data?.type === 'PUSH_RECEIVED') {
        const url = event.data.url || '';
        const title = event.data.title || '';
        const body  = event.data.body || '';
        if (url.includes('#quick?job=')) {
          // New pool job broadcast, matching-city poolguys only — full-screen
          // "ride request" style alert instead of a small toast, same idea as
          // the driver-request card on Uber (see rideAlert state below).
          window.playRideAlertSound && window.playRideAlertSound();
          if (navigator.vibrate) try { navigator.vibrate([120, 60, 120]); } catch(e) {}
          setRideAlert({ title, body, url });
          return;
        }
        if (!url.includes('#chat')) return; // other types already surface via the bell/realtime
        window.playNotifSound && window.playNotifSound();
        showToast(`${title}${body ? ': ' + body : ''}`, () => navigateFromDeepLinkUrl(url));
      }
    };
    navigator.serviceWorker.addEventListener('message', handler);
    return () => navigator.serviceWorker.removeEventListener('message', handler);
  }, [navigateFromDeepLinkUrl]);

  // ── "Ride request" style alert for new matching QuickPool jobs ─────────
  const [rideAlert, setRideAlert] = React.useState(null); // {title, body, url} | null
  const [rideApplying, setRideApplying] = React.useState(false);
  React.useEffect(() => {
    if (!rideAlert) return;
    const timer = setTimeout(() => setRideAlert(null), 18000);
    return () => clearTimeout(timer);
  }, [rideAlert]);

  // Apply directly from the alert card — mirrors quickpools.jsx's applyToJob,
  // duplicated here (small and self-contained) since that function lives
  // inside the QuickPools screen component, not reachable from the app shell.
  const handleRideApply = React.useCallback(async () => {
    const jobId = rideAlert?.jobId;
    const posterId = rideAlert?.posterId;
    if (!jobId || !user?.uid || !window.sb || rideApplying) return;
    setRideApplying(true);
    try {
      await window.sb.from('quick_pool_applications').insert({
        job_id: jobId, applicant_id: user.uid,
        applicant_name: user.name || user.email || 'Pool Guy',
        status: 'pending',
      });
      window.dispatchEvent(new CustomEvent('pgQuickPoolApplied', { detail: { jobId } }));
      if (posterId && posterId !== user.uid) {
        const applicantName = user.name || user.email || 'Pool Guy';
        const title = lang==='pt'?'👤 Novo candidato':lang==='es'?'👤 Nuevo candidato':'👤 New applicant';
        const body = `${applicantName} — ${rideAlert.city || ''}`;
        window.sb.from('notifications').insert({
          user_id: posterId, type: 'quick_pool_application', title, body,
          link_id: String(jobId), read: false,
        }).catch(()=>{});
        window.sendPush && window.sendPush(posterId, title, body, `/#quick?job=${jobId}`, 'quick_pool_application');
      }
      showToast(lang==='pt'?'✓ Candidatura enviada!':lang==='es'?'✓ ¡Postulación enviada!':'✓ Application sent!');
    } catch(e) {
      showToast('❌ ' + (e?.message || (lang==='pt'?'Erro ao candidatar':'Error applying')));
    }
    setRideApplying(false);
    setRideAlert(null);
  }, [rideAlert, user?.uid, user?.name, user?.email, lang]);

  const [notifOpen,      setNotifOpen]      = React.useState(false);
  // Unread badges — derived from real Supabase data
  const [hasUnreadChat,  setHasUnreadChat]  = React.useState(false);
  const [hasUnreadNotif, setHasUnreadNotif] = React.useState(false);
  const [payOpen,        setPayOpen]        = React.useState(false);
  const [payContext,     setPayContext]     = React.useState(null);
  const [postMenuOpen,   setPostMenuOpen]   = React.useState(false);
  const [postQPOpen,     setPostQPOpen]     = React.useState(false);
  const [editQPJob,      setEditQPJob]      = React.useState(null);
  const [regionOpen,     setRegionOpen]     = React.useState(false);
  const [langPickerOpen, setLangPickerOpen] = React.useState(false);
  const [applicantsPost, setApplicantsPost] = React.useState(null);
  const [verifyOpen,     setVerifyOpen]     = React.useState(false);
  const [pushNotifOpen,  setPushNotifOpen]  = React.useState(false);
  const [toast,          setToast]          = React.useState(null);
  const [toastClick,     setToastClick]     = React.useState(null);
  const [walletOpen,     setWalletOpen]     = React.useState(false);
  const [feedbackOpen,   setFeedbackOpen]   = React.useState(false);
  const [jobDetailApp,   setJobDetailApp]   = React.useState(null);
  const [reviewApp,      setReviewApp]      = React.useState(null);
  const [marketPostOpen, setMarketPostOpen] = React.useState(false);
  const [vacSheetOpen,   setVacSheetOpen]   = React.useState(false);
  const [editingVac,     setEditingVac]     = React.useState(null); // vac object being edited
  const [hiringSheetOpen,setHiringSheetOpen]= React.useState(false);
  const [handoffSheetOpen,setHandoffSheetOpen]= React.useState(false);
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
  const [liveJobs,         setLiveJobs]         = React.useState([]);
  const [liveTechs,        setLiveTechs]        = React.useState([]);
  const [liveVacations,    setLiveVacations]    = React.useState([]);
  const [liveMarket,       setLiveMarket]       = React.useState([]);
  const [liveHandoffs,     setLiveHandoffs]     = React.useState([]); // "Repasse de Piscina" postings
  const [liveMyQuickJobs,  setLiveMyQuickJobs]  = React.useState([]); // current user's own open/filled Quick Pool postings
  const [liveApplications, setLiveApplications] = React.useState([]); // current user's job applications
  // { [job_id]: { total, pending, withInterview } } — applicant counts for jobs the current user owns
  const [jobApplicantCounts, setJobApplicantCounts] = React.useState({});
  // Ref keeps the latest job IDs accessible in event callbacks without stale closure
  const liveJobIdsRef = React.useRef([]);
  React.useEffect(() => { liveJobIdsRef.current = liveJobs.map(j => j._id); }, [liveJobs]);
  // Vacation applications reuse the same job_applications table (job_id column
  // holds the vacation's id there too) — folding vacation ids into the same
  // counts query/ref means jobApplicantCounts[vac._id] just works, no
  // parallel vacation-specific counts machinery needed.
  const liveVacIdsRef = React.useRef([]);
  React.useEffect(() => { liveVacIdsRef.current = liveVacations.map(v => v._id); }, [liveVacations]);

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
    const normVac = (r, ratingMap) => {
      const wr = r.weekday_regions || {};
      const allCities = [...new Set(Object.values(wr).flat())];
      const region = allCities.slice(0, 3).join(' / ') || '';
      const rm = ratingMap && r.author_id ? ratingMap[r.author_id] : null;
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
        addressesByWeekday: r.addresses || {},
        price: r.price,
        pricePerPool: r.price,
        priceMode: r.price_mode,
        note: r.note || null,
        requiredPhotos: r.required_photos || [],
        region,
        author: r.author, author_id: r.author_id || null,
        ownerId: r.author_id || null,
        ownerRating: rm ? Math.round(rm.sum / rm.count * 10) / 10 : null,
        ownerJobs: rm ? rm.count : 0,
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
      soldAt: r.sold_at || null,
      boostedUntil: r.boosted_until || null,
      expiresAt: r.expires_at || null,
      lastReminderAt: r.last_reminder_at || null });

    // Clean up sold listings older than 1 day (fire-and-forget)
    window.sb.rpc('cleanup_old_sold_listings').then(() => {}).catch(() => {});
    // Expire marketplace listings past their 30-day window (fire-and-forget)
    window.sb.rpc('cleanup_expired_marketplace').then(() => {}).catch(() => {});

    // Data fetch — runs AFTER auth is ready (authReady gate above)
    const normHandoff = (r, ratingMap) => {
      const rm = ratingMap && r.poster_id ? ratingMap[r.poster_id] : null;
      return { _id:r.id, _live:true, poster_id:r.poster_id, poster:r.poster_name || 'Pool Guy',
      poster_phone:r.poster_phone, pools:r.pools||null, cities:r.cities||[], daysOfWeek:r.days_of_week||[], poolsCount:r.pools_count||1,
      splitTakerPct:r.split_taker_pct||70, pricePerPool:r.price_per_pool||null, poolType:r.pool_type||'residential', extras:r.extras||{}, photoUrls:r.photo_urls||[],
      description:r.description||'', status:r.status||'open', createdAt:r.created_at,
      posterRating: rm ? Math.round(rm.sum / rm.count * 10) / 10 : null, posterJobs: rm ? rm.count : 0 };
    };
    const doFetch = async () => {
      const [j, tc, v, m, ho, mqp] = await Promise.all([
        window.sb.from('jobs').select('*').order('created_at', { ascending: false }),
        window.sb.from('techs_public').select('*').order('created_at', { ascending: false }),
        // vacations_feed redacts `addresses` to everyone except the owner and
        // an applicant already accepted for this listing — same pattern as
        // quick_pool_jobs_feed for pool addresses/phone numbers.
        window.sb.from('vacations_feed').select('*').order('created_at', { ascending: false }),
        window.sb.from('marketplace').select('*').order('created_at', { ascending: false }),
        window.sb.from('pool_handoffs').select('*').eq('status', 'open').order('created_at', { ascending: false }),
        // Poster's own open/filled Quick Pool postings — feeds HomeScreen's
        // "Meus Anúncios". Folded into the same fetch/poll cycle as
        // everything else so it shares one loading gate instead of a
        // separate effect that could resolve at a different time.
        user?.uid
          ? window.sb.from('quick_pool_jobs').select('*').eq('poster_id', user.uid).in('status', ['open','filled']).order('created_at', { ascending: false })
          : Promise.resolve({ data: [] }),
      ]);
      if (ho.data) {
        const hoPosterIds = [...new Set(ho.data.map(r => r.poster_id).filter(Boolean))];
        if (hoPosterIds.length > 0) {
          const { data: hoRatingRows } = await window.sb.from('ratings').select('to_id, stars').in('to_id', hoPosterIds).eq('pending', false);
          const hoRatingMap = {};
          (hoRatingRows || []).forEach(r => {
            if (!hoRatingMap[r.to_id]) hoRatingMap[r.to_id] = { sum: 0, count: 0 };
            hoRatingMap[r.to_id].sum += r.stars;
            hoRatingMap[r.to_id].count++;
          });
          setLiveHandoffs(ho.data.map(r => normHandoff(r, hoRatingMap)));
        } else {
          setLiveHandoffs(ho.data.map(r => normHandoff(r)));
        }
      }
      if (j.data)  setLiveJobs(j.data.map(normJob));
      if (tc.data) {
        const techAuthorIds = tc.data.map(r => r.author_id).filter(Boolean);
        if (techAuthorIds.length > 0) {
          const { data: ratingRows } = await window.sb.from('ratings').select('to_id, stars').in('to_id', techAuthorIds).eq('pending', false);
          const ratingMap = {};
          (ratingRows || []).forEach(r => {
            if (!ratingMap[r.to_id]) ratingMap[r.to_id] = { sum: 0, count: 0 };
            ratingMap[r.to_id].sum += r.stars;
            ratingMap[r.to_id].count++;
          });
          setLiveTechs(tc.data.map(r => {
            const rm = ratingMap[r.author_id];
            return { ...normTech(r), rating: rm ? Math.round(rm.sum / rm.count * 10) / 10 : null, reviewCount: rm ? rm.count : 0 };
          }));
        } else {
          setLiveTechs(tc.data.map(normTech));
        }
      }
      if (v.data)  {
        const vacAuthorIds = [...new Set(v.data.map(r => r.author_id).filter(Boolean))];
        if (vacAuthorIds.length > 0) {
          const { data: vacRatingRows } = await window.sb.from('ratings').select('to_id, stars').in('to_id', vacAuthorIds).eq('pending', false);
          const vacRatingMap = {};
          (vacRatingRows || []).forEach(r => {
            if (!vacRatingMap[r.to_id]) vacRatingMap[r.to_id] = { sum: 0, count: 0 };
            vacRatingMap[r.to_id].sum += r.stars;
            vacRatingMap[r.to_id].count++;
          });
          setLiveVacations(v.data.map(r => normVac(r, vacRatingMap)));
        } else {
          setLiveVacations(v.data.map(r => normVac(r)));
        }
      }
      if (m.data)  setLiveMarket(m.data.map(normMkt));
      if (m.error) console.warn('[Supabase] marketplace fetch error:', m.error.message);
      if (mqp.data) setLiveMyQuickJobs(mqp.data.map(qj => ({
        _id: qj.id, _isQuickPool: true, status: 'approved',
        name: qj.title || qj.city || '—', type: 'quick', loc: qj.city || '',
        price: qj.price_negotiable ? null : qj.price_per_pool,
        priceMode: qj.price_negotiable ? 'neg' : 'fixed',
      })));
      // Awaited so the Home wallet card has its balance before the splash
      // lifts, rather than rendering "$0" and correcting itself a beat later.
      await loadWallet();
      setLiveDataLoaded(true);
      // Load applicant counts in background — non-blocking, doesn't delay UI render.
      // Includes vacation ids too (same job_applications table) so vacation
      // owners see applicant counts/the same "view applicants" flow.
      const vacIdsForCounts = v.data ? v.data.map(r => r.id) : [];
      liveVacIdsRef.current = vacIdsForCounts;
      if ((j.data && j.data.length > 0) || vacIdsForCounts.length > 0) {
        const jobIds = [...(j.data ? j.data.map(r => r.id) : []), ...vacIdsForCounts];
        liveJobIdsRef.current = j.data ? j.data.map(r => r.id) : [];
        window.sb.from('job_applications').select('job_id, status, interview_day')
          .in('job_id', jobIds)
          .then(({ data: appRows }) => {
            if (!appRows) return;
            const counts = {};
            appRows.forEach(row => {
              if (!counts[row.job_id]) counts[row.job_id] = { total: 0, pending: 0, withInterview: 0, accepted: 0 };
              counts[row.job_id].total++;
              if (row.status === 'pending') counts[row.job_id].pending++;
              if (row.interview_day) counts[row.job_id].withInterview++;
              if (row.status === 'accepted') counts[row.job_id].accepted++;
            });
            setJobApplicantCounts(counts);
          });
      }
    };
    doFetch().catch(e => console.warn('[Supabase] fetch:', e.message));

    // Helper: refresh applicant counts for all known jobs (+ vacations)
    const doCountsRefresh = async () => {
      const ids = [...(liveJobIdsRef.current || []), ...(liveVacIdsRef.current || [])];
      if (!window.sb || ids.length === 0) return;
      const { data: appRows } = await window.sb
        .from('job_applications').select('job_id, status, interview_day').in('job_id', ids);
      if (!appRows) return;
      const counts = {};
      appRows.forEach(row => {
        if (!counts[row.job_id]) counts[row.job_id] = { total: 0, pending: 0, withInterview: 0, completed: 0, accepted: 0 };
        counts[row.job_id].total++;
        if (row.status === 'pending') counts[row.job_id].pending++;
        if (row.interview_day) counts[row.job_id].withInterview++;
        if (row.status === 'completed') counts[row.job_id].completed++;
        if (row.status === 'accepted') counts[row.job_id].accepted++;
      });
      setJobApplicantCounts(counts);
    };

    // Refresh jobs/techs/vacations/marketplace when tab regains focus (catches
    // inserts/updates/deletes from other devices/tabs) and on a plain interval —
    // window.sb.channel() (see index.html) is a hand-rolled stub with no real
    // WebSocket connection, so the postgres_changes handlers below never fire;
    // doFetch() (the same full refetch used on mount) is the only thing that
    // actually keeps these lists current while the app stays open.
    // iOS home-screen PWAs are the reason this isn't just visibilitychange:
    // WebKit's Page Visibility API is well documented as unreliable in
    // standalone mode — reopening the app from the home screen after it was
    // backgrounded often never fires visibilitychange at all, which reads
    // as "the app doesn't refresh unless I pull-to-refresh" (it's actually
    // just never re-running doFetch on resume). pageshow — especially with
    // event.persisted, which means the page came from the OS/WebKit's
    // suspended-page cache rather than a fresh load — and window focus are
    // both more reliable resume signals on iOS, so all three feed the same
    // refresh. The dedupe window collapses the common case where a couple
    // of these legitimately fire together (e.g. a normal desktop tab
    // switch) into a single refetch instead of two or three redundant ones.
    let lastRefreshAt = 0;
    const refreshIfVisible = () => {
      if (document.visibilityState !== 'visible') return;
      const now = Date.now();
      if (now - lastRefreshAt < 1500) return;
      lastRefreshAt = now;
      doFetch().catch(()=>{});
      doCountsRefresh(); // also refresh applicant counts on tab focus
      if (user?.uid) loadLiveApplications(user.uid); // refresh candidate application statuses
    };
    const onVisible = refreshIfVisible;
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('pageshow', refreshIfVisible);
    window.addEventListener('focus', refreshIfVisible);

    // Poll jobs/techs/vacations/marketplace every 60s + applicant counts every 30s + applications every 30s
    const pollTimer  = setInterval(() => doFetch().catch(()=>{}), 60000);
    const countTimer = setInterval(doCountsRefresh, 30000);
    const appsTimer  = setInterval(() => { if (user?.uid) loadLiveApplications(user.uid); }, 30000);

    // (No realtime subscription here — window.sb.channel() is a stub, see the
    // comment above the poll timers. doFetch()/doCountsRefresh() polling above
    // is what actually keeps jobs/techs/vacations/marketplace/counts current.)

    // ── QuickPool "ride request" alert — polling, not realtime ──────────
    // window.sb.channel() (see index.html) is a hand-rolled stub with no real
    // WebSocket connection — .on()/.subscribe() never actually fire, and it
    // has no .send() at all. Every table in this app that looked "realtime"
    // relies on that same stub and is therefore inert. Polling against the
    // real REST client (.from(), which genuinely works) is the only thing
    // that can actually deliver this while the app is open.
    let qpLastCheck = new Date().toISOString();
    const dayLabels = { mon:'Segunda', tue:'Terça', wed:'Quarta', thu:'Quinta', fri:'Sexta', sat:'Sábado', sun:'Domingo' };
    const pollNewQuickPools = async () => {
      const uid = userRef.current?.uid;
      const rbd = regionsByDayRef.current;
      if (!uid || !rbd || !window.sb) return;
      const since = qpLastCheck;
      qpLastCheck = new Date().toISOString();
      // The lightweight REST shim (see index.html) only supports eq/neq/in/or —
      // no gt/lt — so the "since" cutoff is applied client-side below instead
      // of as a query filter.
      const { data } = await window.sb.from('quick_pool_jobs_feed')
        .select('id,city,day_of_week,poster_id,pools_count,price_per_pool,status,created_at,pool_type,extras,pools,source_route_id,split_taker_pct,job_category')
        .eq('status', 'open')
        .catch(() => ({ data: null }));
      if (!data || !data.length) return;
      // Rotas Rápidas can span more than one city — match if the tech covers
      // ANY of the route's cities that day, not just the job's primary city.
      const jobCitiesOf = (job) => (job.pools && job.pools.length > 0)
        ? [...new Set(job.pools.map(p => p.city).filter(Boolean))]
        : [job.city];
      const notifyPools   = userRef.current?.notifyPools   !== false;
      const notifyRoutes  = userRef.current?.notifyRoutes  !== false;
      const notifyService = userRef.current?.notifyService !== false;
      // Piscinas Rápidas IS the cleaning category — there's no separate
      // "cleaning" switch. A route is always cleaning too (routes are a
      // pool guy's own recurring route), so only a non-route job's category
      // decides between the Pools and Service switches.
      const match = data.find(job =>
        job.poster_id !== uid && job.created_at > since &&
        (job.source_route_id ? notifyRoutes : (job.job_category === 'service' ? notifyService : notifyPools)) &&
        jobCitiesOf(job).some(c => (rbd[job.day_of_week] || []).includes(c))
      );
      if (!match) return;
      const poolsCount = match.pools_count ?? 1;
      const extras = match.extras || {};
      const isRoute = !!match.source_route_id;
      const jobCities = jobCitiesOf(match);
      window.playRideAlertSound && window.playRideAlertSound();
      if (navigator.vibrate) try { navigator.vibrate([120, 60, 120]); } catch(e) {}
      setRideAlert({
        jobId: match.id,
        posterId: match.poster_id,
        city: jobCities.slice(0,2).join(', ') + (jobCities.length>2 ? ` +${jobCities.length-2}` : ''),
        dayLabel: dayLabels[match.day_of_week] || match.day_of_week,
        poolsCount,
        price: match.price_per_pool || null,
        isRoute,
        splitTakerPct: match.split_taker_pct || null,
        isCondo: match.pool_type === 'condo',
        saltwater: !!extras.saltwater,
        hasDog: !!extras.dog,
        gateCode: !!extras.gate_code,
        doorman: !!extras.doorman,
        url: `/#quick?job=${match.id}`,
      });
    };
    const qpPollTimer = setInterval(pollNewQuickPools, 15000);

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('pageshow', refreshIfVisible);
      window.removeEventListener('focus', refreshIfVisible);
      clearInterval(pollTimer);
      clearInterval(countTimer);
      clearInterval(appsTimer);
      clearInterval(qpPollTimer);
    };
  }, [authReady]); // runs once authReady flips true — guaranteed after token refresh + loadProfile

  // ── Online presence heartbeat ────────────────────────────────
  React.useEffect(() => {
    if (!authReady || !user?.uid || !window.sb) return;
    const uid = user.uid;
    const setOnline = (online) =>
      window.sb.from('profiles')
        .update({ is_online: online, last_seen: new Date().toISOString() })
        .eq('id', uid).then(() => {});
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

  // Notifications unread badge — fetch count + poll (window.sb.channel() is a
  // stub with no real WebSocket connection, see comment near pollTimer above)
  React.useEffect(() => {
    if (!authReady || !user?.uid || !window.sb) return;
    const check = () => window.sb.from('notifications').select('id').eq('user_id', user.uid).eq('read', false)
      .then(({ data }) => { if (data) setHasUnreadNotif(data.length > 0); }).catch(()=>{});
    check();
    const timer = setInterval(check, 30000);
    return () => clearInterval(timer);
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

  const loadLiveHandoffs = React.useCallback(async () => {
    if (!window.sb) return;
    const { data } = await window.sb.from('pool_handoffs').select('*').eq('status', 'open').order('created_at', { ascending: false });
    if (data) setLiveHandoffs(data.map(r => ({ _id:r.id, _live:true, poster_id:r.poster_id, poster:r.poster_name || 'Pool Guy',
      poster_phone:r.poster_phone, cities:r.cities||[], daysOfWeek:r.days_of_week||[], poolsCount:r.pools_count||1,
      splitTakerPct:r.split_taker_pct||70, pricePerPool:r.price_per_pool||null, poolType:r.pool_type||'residential', extras:r.extras||{}, photoUrls:r.photo_urls||[],
      description:r.description||'', status:r.status||'open', createdAt:r.created_at })));
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
    // Kept current via appsTimer (30s poll, see above) + onVisible — no realtime
    // subscription here, window.sb.channel() is a stub with no real connection.
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
      addresses: data.addresses || {},
      price: data.price, price_mode: data.priceMode,
      note: data.note || null,
      required_photos: data.requiredPhotos || [],
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
      expires_at: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
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

  const showToast = (msg, onClick) => {
    setToast(msg);
    setToastClick(() => onClick || null);
    setTimeout(()=>{ setToast(null); setToastClick(null); }, onClick ? 5000 : 2400);
  };

  // Redeem a referral code parked by capturePendingReferral() once the
  // user actually exists. The server decides whether the code is valid —
  // this only decides when to stop asking.
  React.useEffect(() => {
    if (!authReady || !isLoggedIn || !user?.uid || !window.sb) return;
    const code = localStorage.getItem('pg_pending_ref');
    if (!code) return;
    window.sb.rpc('claim_referral', { p_code: code }).then(({ data, error }) => {
      // A transport error may be a passing network blip, so keep the code
      // for the next launch. Any server verdict is final — an invalid,
      // self, or duplicate code will never become valid on a retry.
      if (error || !data) return;
      localStorage.removeItem('pg_pending_ref');
      if (data.ok) {
        showToast(lang==='pt'
          ? `🎁 Indicação aplicada! ${data.discount_monthly_pct}% de desconto no mensal, ${data.discount_annual_pct}% no anual.`
          : lang==='es'
          ? `🎁 ¡Referido aplicado! ${data.discount_monthly_pct}% de descuento mensual, ${data.discount_annual_pct}% anual.`
          : `🎁 Referral applied! ${data.discount_monthly_pct}% off monthly, ${data.discount_annual_pct}% off annual.`);
        loadWallet();
      }
    }).catch(() => {});
  }, [authReady, isLoggedIn, user?.uid, lang, loadWallet]);

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
      } else if (typeof id === 'string' && id.startsWith('handoff_')) {
        setPendingHandoffId(id.slice(8));
        switchTab('work');
      } else if (typeof id === 'string' && id.startsWith('job_')) {
        setPendingJobCardId(id.slice(4));
        switchTab('work');
      } else if (typeof id === 'string' && id.startsWith('vac_')) {
        setPendingVacId(id.slice(4));
        switchTab('work');
      } else {
        setDeepLinkListingId(id);
        switchTab('market');
      }
    },
    pendingQuickJobId,
    clearPendingQuickJob: () => setPendingQuickJobId(null),
    openQuickJobById: (id) => { setPendingQuickJobId(String(id)); switchTab('quick'); },
    pendingHandoffId,
    clearPendingHandoff: () => setPendingHandoffId(null),
    pendingJobCardId,
    clearPendingJobCard: () => setPendingJobCardId(null),
    pendingVacId,
    clearPendingVac: () => setPendingVacId(null),
    goTab:              switchTab,
    openChat:           (target=null) => { setChatConvoTarget(target); setChatOpen(true); },
    openNotifications:  () => { setNotifOpen(true); setHasUnreadNotif(false); },
    hasUnreadChat, hasUnreadNotif: hasUnreadNotif || pendingRatings.length > 0,
    registerPush:       _registerPush,
    openPaywall:        (ctx='') => { setPayContext(ctx||null); setPayOpen(true); },
    openPostMenu:       () => setPostMenuOpen(true),
    openPost:           async () => {
      // Free accounts: max 5 Piscinas Rápidas postings per week, resetting
      // every Sunday 6am (same cadence as Claude's own credit resets) — PRO
      // and above post unlimited.
      if (user.tier === 'free') {
        try {
          const now = new Date();
          const weekStart = new Date(now);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          weekStart.setHours(6, 0, 0, 0);
          if (weekStart > now) weekStart.setDate(weekStart.getDate() - 7);
          const { data } = await window.sb.from('quick_pool_jobs')
            .select('id').eq('poster_id', user.uid).gte('created_at', weekStart.toISOString());
          if ((data || []).length >= 5) {
            setPayContext('qp_weekly_limit');
            setPayOpen(true);
            return;
          }
        } catch(e) {}
      }
      setPostQPOpen(true);
    },
    openEditPost:       (job) => setEditQPJob(job),
    openMarketPost:     async () => {
      // Count active listings vs tier limit before opening post form
      const limits = { free: 2, pro: 5, premium: 10 };
      const limit = limits[user.tier] || 2;
      try {
        const { data } = await window.sb.from('marketplace').select('id').eq('author_id', user.uid);
        const count = (data || []).length;
        if (count >= limit) {
          setPayContext('listings');
          setPayOpen(true);
          return;
        }
      } catch(e) {}
      switchTab('market'); setMarketPostOpen(true);
    },
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
    retryPush: () => _registerPush(true),
    pushLog,
    openWallet:         () => setWalletOpen(true),
    openJobDetail:      (app) => setJobDetailApp(app),
    openReview:         (app) => setReviewApp(app),
    openVacSheet:       () => { if (user.tier === 'free') { setPayContext('vac'); setPayOpen(true); return; } setEditingVac(null); setVacSheetOpen(true); },
    openEditVacSheet:   (vac) => { setEditingVac(vac); setVacSheetOpen(true); },
    openHiringSheet:    () => setHiringSheetOpen(true),
    openHandoffSheet:   () => setHandoffSheetOpen(true),
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
    notifPrefs: user.notifPrefs || { chat: true, quick: true, market: true, work: true },
    saveNotifPrefs: async (prefs) => {
      if (!window.sb || !user.uid) return;
      await window.sb.from('profiles').update({ notif_prefs: prefs }).eq('id', user.uid);
      setUser(u => ({ ...u, notifPrefs: prefs }));
    },
    pendingRatings,
    openRating: (r) => setActiveRating(r),
    // Use this — not openRating — for items from `pendingRatings`. Those rows have
    // to_id === me (someone rated ME); openRating/RatingSheet expects to_id === the
    // person being rated, so passing a pendingRatings row into it submits a
    // self-rating. BuyerRatingPromptModal correctly targets rating.from_id instead.
    openBuyerRatingPrompt: () => setRatingPromptOpen(true),
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
    liveJobs, liveTechs, liveVacations, liveMarket, liveHandoffs, loadLiveHandoffs, liveDataLoaded, liveMyQuickJobs,
    wallet, walletTx, loadWallet,
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
          setTimeout(()=>{
            if (type==='chat') {
              if (linkId) openChatFromDeepLink(linkId, null);
              else setChatOpen(true);
            } else if (type==='warning') {
              switchTab('profile');
            } else if (type==='quick_pool_new' || type==='quick_pool_done' || type==='quick_pool_application') {
              // Open the specific quick pool job if we have an ID, else just go to tab
              if (linkId) ctx.openQuickJobById(linkId);
              else switchTab('quick');
            } else if (type==='job_new_application' || type==='job_accepted' || type==='job_rejected') {
              switchTab('work');
            } else if (type==='vacation_new_application' || type==='vacation_confirmed' || type==='vacation_photos_submitted' || type==='vacation_cancelled' || type==='vacation_day_today' || type==='vacation_day_missed' || type==='vacation_day_reminder') {
              if (linkId) ctx.openListingById('vac_'+linkId);
              else switchTab('work');
            } else if (type==='rental_request') {
              // link_id is the requester's uid here (not a listing id) — the
              // actionable next step is the chat, where the proposal was
              // auto-posted and where approve/decline happens from.
              if (linkId) openChatFromDeepLink(linkId, null);
              else switchTab('market');
            } else if (type==='rental_approved' || type==='rental_declined' || type==='rental_cancelled' || type==='rental_completed' || type==='rental_resolved') {
              if (linkId) ctx.openListingById(linkId);
              else switchTab('market');
            } else if (type==='market') {
              if (linkId) ctx.openListingById(linkId);
              else switchTab('market');
            } else if (type==='rating') {
              switchTab('home');
              loadPendingRatings();
              setRatingPromptOpen(true);
            } else if (type==='rating_revealed') {
              switchTab('home');
            } else if (linkId) {
              ctx.openListingById(linkId);
            } else {
              switchTab('market');
            }
          }, 280);
        }}/>
      <PaywallSheet open={payOpen} onClose={()=>setPayOpen(false)} setUser={ctx.setUser} lang={lang} context={payContext}
        wallet={wallet} showToast={showToast}/>
      {showOnboarding && (() => {
        const slides = {
          en: [
            { icon:'🏊', title:'Welcome to PoolGuyPro', desc:'The marketplace built for Florida pool professionals. Find jobs, post routes, and connect with other pool guys.' },
            { icon:'📅', title:'Vacation Coverage', desc:'Going on vacation? Post your route so another pool pro can cover it. Or apply to cover someone else\'s route and earn extra.' },
            { icon:'⚡', title:'Quick Pools & Routes', desc:'Upgrade to PRO for vacation coverage and Routes tab, or PREMIUM for real-time Quick Pools emergency alerts.' },
          ],
          pt: [
            { icon:'🏊', title:'Bem-vindo ao PoolGuyPro', desc:'O marketplace feito para profissionais de piscina na Flórida. Encontre trabalhos, publique rotas e conecte-se com outros pool guys.' },
            { icon:'📅', title:'Cobertura de Férias', desc:'Indo de férias? Publique sua rota para outro profissional cobrir. Ou aplique para cobrir a rota de alguém e ganhar extra.' },
            { icon:'⚡', title:'Quick Pools e Rotas', desc:'Faça upgrade para PRO para cobertura de férias e aba de rotas, ou PREMIUM para alertas em tempo real de Quick Pools.' },
          ],
          es: [
            { icon:'🏊', title:'Bienvenido a PoolGuyPro', desc:'El marketplace para profesionales de piscinas en Florida. Encuentra trabajos, publica rutas y conéctate con otros pool guys.' },
            { icon:'📅', title:'Cobertura de Vacaciones', desc:'¿De vacaciones? Publica tu ruta para que otro profesional la cubra. O aplica para cubrir la ruta de alguien y ganar extra.' },
            { icon:'⚡', title:'Quick Pools y Rutas', desc:'Mejora a PRO para cobertura de vacaciones y pestaña de Rutas, o PREMIUM para alertas en tiempo real de Quick Pools.' },
          ],
        };
        const sl = slides[lang] || slides.en;
        const btnLabel = { en:'Get Started', pt:'Começar', es:'Empezar' }[lang] || 'Get Started';
        const nextLabel = { en:'Next', pt:'Próximo', es:'Siguiente' }[lang] || 'Next';
        const skipLabel = { en:'Skip', pt:'Pular', es:'Omitir' }[lang] || 'Skip';
        const dismiss = () => { localStorage.setItem('pg_onboarded','1'); setShowOnboarding(false); };
        const OnboardInner = () => {
          const [slide, setSlide] = React.useState(0);
          const isLast = slide === sl.length - 1;
          return (
            <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.88)', zIndex:5000, display:'flex', alignItems:'flex-end', justifyContent:'center'}}>
              <div style={{background:'#111827', borderRadius:'24px 24px 0 0', width:'100%', maxWidth:480, padding:'32px 28px 40px', border:'1px solid rgba(255,255,255,0.08)', borderBottom:'none'}}>
                {/* Dots */}
                <div style={{display:'flex', justifyContent:'center', gap:7, marginBottom:32}}>
                  {sl.map((_,i) => (
                    <div key={i} style={{width:i===slide?24:7, height:7, borderRadius:99, transition:'width .3s',
                      background:i===slide?'#0077B6':'rgba(255,255,255,0.2)'}}/>
                  ))}
                </div>
                {/* Slide content */}
                <div style={{textAlign:'center', marginBottom:32}}>
                  <div style={{fontSize:48, marginBottom:16}}>{sl[slide].icon}</div>
                  <div style={{fontSize:20, fontWeight:800, color:'#e8edf2', marginBottom:12, letterSpacing:'-0.02em'}}>{sl[slide].title}</div>
                  <div style={{fontSize:14, color:'rgba(255,255,255,0.5)', lineHeight:1.7}}>{sl[slide].desc}</div>
                </div>
                {/* Buttons */}
                <div style={{display:'flex', gap:10}}>
                  {!isLast && (
                    <button onClick={dismiss} style={{flex:1, height:48, borderRadius:12, border:'1px solid rgba(255,255,255,0.12)',
                      background:'transparent', color:'rgba(255,255,255,0.45)', fontFamily:'inherit', fontSize:14, fontWeight:600, cursor:'pointer'}}>
                      {skipLabel}
                    </button>
                  )}
                  <button onClick={isLast ? dismiss : () => setSlide(s=>s+1)}
                    style={{flex:2, height:48, borderRadius:12, border:'none', background:'linear-gradient(135deg,#0c4a6e,#0077B6)',
                      color:'#fff', fontFamily:'inherit', fontSize:15, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 16px rgba(0,119,182,0.4)'}}>
                    {isLast ? btnLabel : nextLabel}
                  </button>
                </div>
              </div>
            </div>
          );
        };
        return <OnboardInner key="onboard"/>;
      })()}
      <PostMenuSheet open={postMenuOpen} onClose={()=>setPostMenuOpen(false)}
        onPickQuickPool={()=>ctx.openPost()} lang={lang}/>
      <Sheet open={postQPOpen} onClose={()=>setPostQPOpen(false)} height="92%">
        <PostQuickPool
          lang={lang}
          onClose={()=>setPostQPOpen(false)}
          onSubmit={async (formData)=>{
            if (formData.priceMode === 'fixed') {
              const p = parseFloat(formData.price);
              if (!formData.price || isNaN(p) || p <= 0) {
                showToast(lang==='pt'?'❌ Informe um preço válido ou marque como negociável':'❌ Enter a valid price or mark as negotiable');
                return;
              }
            }
            setPostQPOpen(false);
            setTab('quick');
            if (!window.sb || !user?.uid) return;
            try {
              const scheduledFor = formData.scheduled_for
                ? new Date(formData.scheduled_for).toISOString()
                : null;
              let notifyAt = null;
              let outsideNotifyWindow = false;
              // "Agora" jobs and jobs scheduled for a future day both notify the
              // instant they're posted — a future-day job is an advance heads-up
              // ("there's a job in Deerfield tomorrow"), not a same-day ping, so
              // it isn't held back by the 6am–7pm window and can go out at night.
              // Only a job scheduled for LATER TODAY gets clamped into that
              // window, since that's the one case where it's actually urgent/
              // same-day and pinging at 2am would be genuinely disruptive.
              let notifyNow = !scheduledFor;
              if (scheduledFor) {
                const d = new Date(formData.scheduled_for);
                const now = new Date();
                const isSameDay = d.getFullYear()===now.getFullYear() && d.getMonth()===now.getMonth() && d.getDate()===now.getDate();
                if (isSameDay) {
                  const hr = d.getHours();
                  if (hr < 6) {
                    d.setHours(6, 0, 0, 0);
                    notifyAt = d.toISOString();
                  } else if (hr >= 19) {
                    outsideNotifyWindow = true;
                  } else {
                    notifyAt = d.toISOString();
                  }
                } else {
                  notifyNow = true;
                }
              }
              const firstPool = formData.pools?.[0] || {};
              const isCondo = firstPool.poolType === 'condo';
              const jobCategory = formData.jobCategory === 'service' ? 'service' : 'cleaning';
              const serviceType = jobCategory === 'service'
                ? (formData.serviceType === 'other' ? 'custom:' + (formData.serviceTypeCustom || '').trim() : formData.serviceType || null)
                : null;
              const job = {
                poster_id: user.uid, poster_name: user.name || user.email || 'Pool Guy',
                poster_phone: formData.showPhone ? (formData.phone || user.phone || null) : null,
                pool_address: formData.pool_address?.trim() || null,
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
                job_category: jobCategory,
                service_type: serviceType,
              };
              // Proactively refresh a possibly-stale session before writing — a stale
              // token here fails the insert's RLS check silently (see notify refresh below).
              if (window.sb.auth.refresh) await window.sb.auth.refresh().catch(()=>{});
              const { data: inserted, error: insertErr } = await window.sb.from('quick_pool_jobs').insert(job).select().single();
              if (insertErr || !inserted) {
                console.error('[QuickPools] insert failed', insertErr);
                showToast(lang==='pt'?'❌ Erro ao publicar a vaga':lang==='es'?'❌ Error al publicar el trabajo':'❌ Error posting the job');
                return;
              }
              window.dispatchEvent(new CustomEvent('pgQuickPoolPosted', { detail: inserted }));
              let notifyCount = 0;
              let notifyFailed = false;
              let throttled = false, retryAfterSeconds = 0;
              if (notifyNow) {
                try {
                  // getSession() reads a cached token with no freshness check — if it's
                  // stale, the Edge Function's platform-level JWT check 401s before our
                  // code even runs. Proactively refresh first so this doesn't silently
                  // no-op (which used to show "0 notified" even when it wasn't true).
                  if (window.sb.auth.refresh) await window.sb.auth.refresh().catch(()=>{});
                  const { data: { session } } = await window.sb.auth.getSession();
                  const token = session?.access_token || '';
                  const res = await fetch('https://xiszfqghizqzlwyrfjol.supabase.co/functions/v1/notify-quick-pool', {
                    method:'POST',
                    headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
                    body: JSON.stringify({ job: inserted }),
                  });
                  if (res.ok) {
                    const result = await res.json().catch(()=>({}));
                    // "matched" = users who got the (guaranteed) in-app notification;
                    // "sent" only counts best-effort push deliveries, which can be 0
                    // even when everyone was notified in-app (e.g. stale push subs).
                    notifyCount = result?.matched ?? result?.sent ?? 0;
                    // Server-side anti-spam cooldown (shared with Rotas Rápidas) — skips
                    // sending when this poster already triggered a notify blast recently,
                    // so deleting+reposting (or a trivial edit+republish) can't be used to
                    // re-spam the same pool guys.
                    if (result?.throttled) { throttled = true; retryAfterSeconds = result.retryAfterSeconds || 0; }
                  } else {
                    notifyFailed = true;
                    console.error('[QuickPools] notify-quick-pool failed', res.status, await res.text().catch(()=>''));
                  }
                } catch(e) { notifyFailed = true; console.error('[QuickPools] notify-quick-pool error', e); }
              }
              const retryMin = Math.ceil(retryAfterSeconds / 60);
              const toastMsg = outsideNotifyWindow
                ? (lang==='pt'?'✅ Vaga publicada — esse horário já passou da janela de notificação do app (6h–19h), então ninguém será avisado. Ela continua aparecendo normalmente na lista.':lang==='es'?'✅ Vacante publicada — ese horario ya pasó la ventana de notificación de la app (6am–7pm), así que nadie será avisado. Sigue apareciendo normalmente en la lista.':"✅ Job posted — that time is outside the app's notification window (6am–7pm), so no one will be alerted. It still shows up normally in the list.")
                : throttled
                ? (lang==='pt'?`✅ Vaga publicada — alerta pulado (você já notificou há pouco, tente de novo em ${retryMin} min)`:lang==='es'?`✅ Vacante publicada — alerta omitida (ya notificaste hace poco, intenta de nuevo en ${retryMin} min)`:`✅ Job posted — alert skipped (you already notified recently, try again in ${retryMin} min)`)
                : notifyFailed
                ? (lang==='pt'?'⚠️ Vaga publicada, mas o alerta pode não ter chegado a todos':lang==='es'?'⚠️ Vacante publicada, pero la alerta puede no haber llegado a todos':'⚠️ Job posted, but the alert may not have reached everyone')
                : lang==='pt'
                  ? `Piscina Rápida publicada — ${notifyCount} piscineiros notificados`
                  : lang==='es'
                    ? `Piscina Rápida publicada — ${notifyCount} técnicos notificados`
                    : `Quick Pool posted — ${notifyCount} pool guys notified`;
              showToast(toastMsg);
            } catch(e) {
              console.error('[QuickPools] post error', e);
              showToast('❌ ' + (e?.message || (lang==='pt'?'Erro ao publicar':'Error posting')));
            }
          }}
        />
      </Sheet>
      <Sheet open={!!editQPJob} onClose={()=>setEditQPJob(null)} height="92%">
        {editQPJob && <PostQuickPool
          lang={lang}
          initialData={editQPJob}
          onClose={()=>setEditQPJob(null)}
          onSubmit={async (formData)=>{
            if (formData.priceMode === 'fixed') {
              const p = parseFloat(formData.price);
              if (!formData.price || isNaN(p) || p <= 0) {
                showToast(lang==='pt'?'❌ Informe um preço válido ou marque como negociável':'❌ Enter a valid price or mark as negotiable');
                return;
              }
            }
            const jobId = editQPJob.id;
            setEditQPJob(null);
            if (!window.sb || !user?.uid) return;
            try {
              const firstPool = formData.pools?.[0] || {};
              const isCondo = firstPool.poolType === 'condo';
              const patch = {
                poster_phone: formData.showPhone ? (formData.phone || user.phone || null) : null,
                pool_address: formData.pool_address?.trim() || null,
                city: firstPool.location || 'Florida',
                price_per_pool: formData.priceMode==='fixed' ? parseFloat(formData.price||0)||null : null,
                price_negotiable: formData.priceMode==='neg',
                title: formData.title?.trim() || null,
                description: formData.notes?.trim() || null,
                pool_type: isCondo ? 'condo' : 'residential',
                extras: isCondo
                  ? { gate_code: firstPool.gateCodeVal||null, doorman: firstPool.doorman||false, dog: firstPool.dog||false, saltwater: firstPool.saltwater||false }
                  : { dog: firstPool.dog||false, saltwater: firstPool.saltwater||false },
                required_photos: formData.requiredPhotos || [],
              };
              const { data: updated } = await window.sb.from('quick_pool_jobs').update(patch).eq('id', jobId).select().single();
              if (!updated) { showToast(lang==='pt'?'❌ Não foi possível salvar — tente novamente':lang==='es'?'❌ No se pudo guardar — inténtalo de nuevo':'❌ Could not save — please try again'); return; }
              window.dispatchEvent(new CustomEvent('pgQuickPoolPosted', { detail: updated }));
              showToast(lang==='pt'?'✅ Vaga atualizada':lang==='es'?'✅ Vaga actualizada':'✅ Job updated');
            } catch { showToast(lang==='pt'?'❌ Erro ao salvar':'❌ Error saving'); }
          }}
        />}
      </Sheet>
      <Toast message={toast} onClick={toastClick ? () => { toastClick(); setToast(null); setToastClick(null); } : undefined}/>
      <RideRequestCard alert={rideAlert} lang={lang} applying={rideApplying}
        onView={()=>{ const url = rideAlert?.url; setRideAlert(null); if (url) navigateFromDeepLinkUrl(url); }}
        onApply={handleRideApply}
        onDismiss={()=>setRideAlert(null)}/>
      <RegionEditorSheet
        open={regionOpen} onClose={()=>setRegionOpen(false)} lang={lang}
        regionsByDay={regionsByDay} setRegionsByDay={setRegionsByDay}
        saveRegionsByDay={saveRegionsByDay} county={county}
        notifyPools={user.notifyPools} notifyRoutes={user.notifyRoutes}
        notifyService={user.notifyService} setNotifyPref={setNotifyPref}
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
        showToast={showToast}
        onChat={(name)=>{ setApplicantsPost(null); setChatConvoTarget(name); setChatOpen(true); }}
        openRating={(r)=>setActiveRating(r)}
        onOpenProfile={(applicant) => setPublicProfileUser({
          uid:     applicant.applicant_id || null,
          name:    applicant.name,
          rating:  applicant.rating || null,
          reviews: applicant.jobs   || 0,
          jobs:    applicant.jobs   || 0,
          loc:     applicant.profile?.region || '',
          photo:   applicant.profile?.photoUrl || null,
        })}
      />
      <VerificationSheet open={verifyOpen} onClose={()=>setVerifyOpen(false)} lang={lang}/>
      <WalletSheet open={walletOpen} onClose={()=>setWalletOpen(false)} lang={lang}
        wallet={wallet} walletTx={walletTx} loadWallet={loadWallet} showToast={showToast}/>
      <WorkLifecycleSheet
        open={!!jobDetailApp} onClose={()=>setJobDetailApp(null)}
        app={jobDetailApp} lang={lang}
        onReview={(app)=>{ setJobDetailApp(null); setReviewApp(app); }}/>
      <ReviewSheet
        open={!!reviewApp} onClose={()=>setReviewApp(null)}
        app={reviewApp} lang={lang}
        onSubmitDone={()=>{ setReviewApp(null); showToast(lang==='pt'?'Avaliação enviada ✓':lang==='es'?'Reseña enviada ✓':'Review submitted ✓'); }}/>
      <FullPage open={vacSheetOpen} onClose={()=>{ setVacSheetOpen(false); setEditingVac(null); }}>
        <PostVacationSheet
          lang={lang}
          initialData={editingVac}
          onClose={()=>{ setVacSheetOpen(false); setEditingVac(null); }}
          onSubmit={(data)=>{
            setVacSheetOpen(false);
            if (!data) { setEditingVac(null); return; }
            const overlap = liveVacations.some(v =>
              v.author_id === user.uid &&
              (!editingVac || v._id !== editingVac._id) &&
              v.monthIdx === data.monthIdx && v.year === data.year &&
              (v.selectedDays || []).some(d => (data.selectedDays || []).includes(d))
            );
            if (overlap) {
              setEditingVac(null);
              showToast(lang==='pt'?'Você já tem férias publicadas com dias sobrepostos':lang==='es'?'Ya tienes vacaciones publicadas con días superpuestos':'You already have a vacation posted with overlapping days');
              return;
            }
            if (editingVac) {
              const row = {
                month_idx: data.monthIdx, year: data.year,
                selected_days: data.selectedDays, weekday_regions: data.weekdayRegions,
                pools_per_weekday: data.poolsPerWeekday,
                addresses: data.addresses || {},
                price: data.price, price_mode: data.priceMode,
                note: data.note || null,
                required_photos: data.requiredPhotos || [],
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
                  addressesByWeekday: data.addresses || {},
                  price: data.price, pricePerPool: data.price, priceMode: data.priceMode,
                  note: data.note || null, region,
                  requiredPhotos: data.requiredPhotos || [],
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
      </FullPage>
      <FullPage open={!!dayPickerVac} onClose={()=>setDayPickerVac(null)}>
        <VacationDayPickerSheet
          vac={dayPickerVac} lang={lang}
          confirmedDays={confirmedDays}
          myAppliedDays={dayPickerVac ? liveApplications
            .filter(a => String(a.job_id) === String(dayPickerVac._id) && a.status === 'pending')
            .flatMap(a => a.vacation_days?.selectedDays || []) : []}
          onClose={()=>setDayPickerVac(null)}
          onSubmit={async (data)=>{
            const vac = dayPickerVac;
            setDayPickerVac(null);
            if (!window.sb || !user?.uid || !vac?._id) return;
            // Only an active (pending/accepted) application blocks reapplying —
            // a past rejection shouldn't permanently lock someone out of ever
            // applying to the same listing again (e.g. for different days).
            const { data: existing } = await window.sb.from('job_applications')
              .select('id').eq('job_id', vac._id).eq('applicant_id', user.uid).in('status', ['pending','accepted']);
            if (existing && existing.length > 0) {
              showToast(lang==='pt'?'Você já tem uma candidatura ativa para esta rota':lang==='es'?'Ya tienes una postulación activa para esta ruta':'You already have an active application for this route');
              return;
            }
            const { error } = await window.sb.from('job_applications').insert({
              job_id:         vac._id,
              job_company:    vac.author || '',
              job_role:       lang==='pt'?'Cobertura de rota':lang==='es'?'Cobertura de ruta':'Route coverage',
              job_loc:        vac.region || '',
              job_author_id:  vac.author_id || null,
              applicant_id:   user.uid,
              applicant_name: user.name || '',
              applicant_rating: user.rating || null,
              applicant_jobs: user.reviews || 0,
              note:           data?.note || null,
              status:         'pending',
              vacation_days:  data?.selectedDays ? { selectedDays: data.selectedDays } : null,
            });
            if (error) { showToast('❌ ' + (lang==='pt'?'Erro ao enviar candidatura':'Failed to submit application')); return; }
            // Notify the vacation poster (in-app + push) — was missing entirely,
            // unlike regular job applications (see ApplyJobSheet) and Quick Pool
            // applications, which both already notify the poster on apply.
            const ownerId = vac.author_id || null;
            if (ownerId && ownerId !== user.uid) {
              window.sb.from('notifications').insert({
                user_id: ownerId,
                type:    'vacation_new_application',
                title:   JSON.stringify({ en:'New application received', pt:'Nova candidatura recebida', es:'Nueva postulación recibida' }),
                body:    JSON.stringify({
                  en: `${user.name || 'Someone'} applied to cover your vacation.`,
                  pt: `${user.name || 'Alguém'} se candidatou para cobrir suas férias.`,
                  es: `${user.name || 'Alguien'} se postuló para cubrir tus vacaciones.`,
                }),
                link_id: String(vac._id),
                read:    false,
              }).catch(()=>{});
              window.sendPush && window.sendPush(
                ownerId,
                lang==='pt' ? '📬 Nova candidatura' : lang==='es' ? '📬 Nueva postulación' : '📬 New application',
                lang==='pt'
                  ? `${user.name || 'Alguém'} se candidatou para cobrir suas férias.`
                  : lang==='es'
                  ? `${user.name || 'Alguien'} se postuló para cubrir tus vacaciones.`
                  : `${user.name || 'Someone'} applied to cover your vacation.`,
                '/#work',
                'work'
              );
            }
            showToast(lang==='pt'?'✓ Candidatura enviada':lang==='es'?'✓ Postulación enviada':'✓ Application sent');
            loadLiveApplications(user.uid);
          }}
        />
      </FullPage>
      <FullPage open={hiringSheetOpen} onClose={()=>setHiringSheetOpen(false)}>
        <PostHiringSheet
          lang={lang}
          onClose={()=>setHiringSheetOpen(false)}
          onSubmit={(data)=>{ setHiringSheetOpen(false); if(data) dbWrite('jobs', data).then(()=>loadLiveJobs()); showToast(lang==='pt'?'Vaga publicada ✓':lang==='es'?'Empleo publicado ✓':'Job posted ✓'); }}
        />
      </FullPage>
      <FullPage open={handoffSheetOpen} onClose={()=>setHandoffSheetOpen(false)}>
        <PostPoolHandoffSheet
          lang={lang}
          onClose={()=>setHandoffSheetOpen(false)}
          onSubmit={async (data)=>{
            setHandoffSheetOpen(false);
            if (!data || !window.sb || !user?.uid) return;
            if (window.sb.auth.refresh) await window.sb.auth.refresh().catch(()=>{});
            const { error } = await window.sb.from('pool_handoffs').insert({
              poster_id: user.uid, poster_name: user.name || user.email || 'Pool Guy',
              poster_phone: user.phone || null,
              pools: data.pools, cities: data.cities, days_of_week: data.daysOfWeek, pools_count: data.poolsCount,
              split_taker_pct: data.splitTakerPct, description: data.description || null, status: 'open',
              photo_urls: data.photoUrls && data.photoUrls.length > 0 ? data.photoUrls : null,
            });
            if (error) { console.error('[Handoff] insert failed', error); showToast('❌ ' + (error.message||'Error')); return; }
            loadLiveHandoffs();
            showToast(lang==='pt'?'Repasse publicado ✓':lang==='es'?'Traspaso publicado ✓':'Handoff posted ✓');
          }}
        />
      </FullPage>
      <FullPage open={techSheetOpen} onClose={()=>setTechSheetOpen(false)}>
        <PostTechSheet
          lang={lang}
          user={user}
          onClose={()=>setTechSheetOpen(false)}
          onSubmit={(data)=>{ setTechSheetOpen(false); if(data) dbWrite('techs', data); showToast(lang==='pt'?'Perfil publicado ✓':lang==='es'?'Perfil publicado ✓':'Profile posted ✓'); }}
        />
      </FullPage>
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
                src="wordmarkwhite.webp"
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
          <LoginScreen onLogin={(u)=>{ setSessionExpired(false); handleAuthLogin(u); }} lang={lang} setLang={setLang}/>
        </div>
      )}

      {/* ── Session expired overlay ── */}
      {sessionExpired && !isLoggedIn && (
        <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.7)',zIndex:5000,
          display:'flex',alignItems:'center',justifyContent:'center',padding:'24px'}}>
          <div style={{background:'var(--pg-white)',borderRadius:20,padding:'28px 24px',
            width:'100%',maxWidth:340,textAlign:'center',boxShadow:'0 24px 64px rgba(0,0,0,0.4)'}}>
            <div style={{fontSize:36,marginBottom:12}}>🔒</div>
            <div style={{fontSize:17,fontWeight:700,color:'var(--pg-ink-900)',marginBottom:8}}>
              {lang==='pt'?'Sessão expirada':lang==='es'?'Sesión expirada':'Session expired'}
            </div>
            <div style={{fontSize:13,color:'var(--pg-ink-400)',lineHeight:1.6,marginBottom:20}}>
              {lang==='pt'?'Por segurança, faça login novamente para continuar.':lang==='es'?'Por seguridad, inicia sesión nuevamente para continuar.':'For security, please sign in again to continue.'}
            </div>
            <button onClick={()=>setSessionExpired(false)}
              style={{width:'100%',padding:'13px',borderRadius:14,border:'none',
                background:'linear-gradient(135deg,var(--pg-blue-500),var(--pg-blue-700))',
                color:'#fff',fontWeight:700,fontSize:15,cursor:'pointer',fontFamily:'inherit'}}>
              {lang==='pt'?'Entrar novamente':lang==='es'?'Iniciar sesión':'Sign in again'}
            </button>
          </div>
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
            <br/><strong>support@poolguyx.com</strong>
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
          {/* Pull-to-refresh indicator */}
          {(pullDist > 4 || refreshing) && (() => {
            const progress = Math.min(pullDist / PULL_THRESHOLD, 1);
            return (
            <div style={{
              position:'fixed', top:0, left:0, right:0, zIndex:9999,
              display:'flex', justifyContent:'center',
              paddingTop:'max(8px, env(safe-area-inset-top, 8px))',
              pointerEvents:'none',
              transform:`translateY(${Math.min(pullDist, PULL_THRESHOLD) - PULL_THRESHOLD}px) scale(${refreshing ? 1 : 0.8 + progress * 0.2})`,
              opacity: refreshing ? 1 : 0.4 + progress * 0.6,
              transition: pullDist === 0 || refreshing ? 'transform .3s cubic-bezier(.34,1.56,.64,1), opacity .2s ease' : 'none',
            }}>
              {(() => {
                // Water level rises with pull progress; once released and
                // refreshing, it settles at a half-full level and the wave
                // itself flows sideways (translateX loop) to read as "alive"
                // instead of a generic spinner.
                const waveY = refreshing ? 11 : 26 - progress * 19;
                const wavePath = `M-13,${waveY} Q-9.75,${waveY-3.2} -6.5,${waveY} T0,${waveY} T6.5,${waveY} T13,${waveY} T19.5,${waveY} T26,${waveY} T32.5,${waveY} T39,${waveY} L39,28 L-13,28 Z`;
                return (
                  <div style={{
                    width:26, height:26, borderRadius:'50%', position:'relative', overflow:'hidden',
                    background: 'rgba(14,186,199,0.14)',
                    boxShadow:'0 1px 6px rgba(4,20,40,0.14)',
                  }}>
                    <svg width="26" height="26" viewBox="0 0 26 26" style={{position:'absolute', inset:0}}>
                      <defs>
                        <linearGradient id="pgWaveGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#18DAEA"/>
                          <stop offset="100%" stopColor="#0077B6"/>
                        </linearGradient>
                      </defs>
                      {/* Circular mask comes from the wrapping div's overflow:hidden +
                          border-radius, not an SVG clipPath — some WebKit builds stop
                          repainting a clip-path's clipped content after the first cycle
                          of an animated child transform, which read as the wave
                          flowing once and then freezing. */}
                      <g style={refreshing ? {animation:'pg-wave-flow 0.45s linear infinite', willChange:'transform'} : {}}>
                        <path d={wavePath} fill="url(#pgWaveGrad)"/>
                      </g>
                    </svg>
                  </div>
                );
              })()}
            </div>
            );
          })()}

          {/* Screen content */}
          <div ref={screenRef} data-pg-screen
            onTouchStart={onPTRTouchStart}
            onTouchMove={onPTRTouchMove}
            onTouchEnd={onPTRTouchEnd}
            style={{position:'absolute', inset:0, paddingBottom:'calc(68px + env(safe-area-inset-bottom, 0px))', overflow:'auto', overscrollBehavior:'none'}}>
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
              onClick={tab === 'market' ? ()=>ctx.openMarketPost() : ()=>ctx.openPost()}
              className="pg-press"
              style={{
                position:'absolute', bottom:'calc(96px + env(safe-area-inset-bottom, 0px))', right:18, zIndex:35,
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

// ── Error Boundary ────────────────────────────────────────────
class AppErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  componentDidCatch(e, info) { console.error('[AppErrorBoundary]', e, info); }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
        height:'100dvh',padding:'32px 20px',background:'var(--pg-bg)',textAlign:'center',gap:16}}>
        <div style={{fontSize:40}}>⚠️</div>
        <div style={{fontSize:17,fontWeight:700,color:'var(--pg-ink-900)',maxWidth:300}}>
          Algo deu errado
        </div>
        <div style={{fontSize:13,color:'var(--pg-ink-400)',maxWidth:280,lineHeight:1.6}}>
          {this.state.error?.message || 'Erro inesperado no aplicativo.'}
        </div>
        <button onClick={()=>{ this.setState({error:null}); window.location.reload(); }}
          style={{marginTop:8,padding:'12px 28px',borderRadius:14,border:'none',
            background:'linear-gradient(135deg,var(--pg-blue-500),var(--pg-blue-700))',
            color:'#fff',fontWeight:700,fontSize:14,cursor:'pointer',fontFamily:'inherit'}}>
          Recarregar
        </button>
      </div>
    );
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <AppErrorBoundary><App/></AppErrorBoundary>
);
