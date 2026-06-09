// login.jsx — splash + login screen — PoolGuyX brand

function LoginScreen({ onLogin, lang='en', setLang }) {
  const t = STRINGS[lang];
  const [mode,          setMode]         = React.useState('login'); // 'login' | 'signup'
  const [step,          setStep]         = React.useState(1); // 1 | 2
  const [email,         setEmail]        = React.useState('');
  const [pass,          setPass]         = React.useState('');
  const [passConfirm,   setPassConfirm]  = React.useState('');
  const [loading,       setLoading]      = React.useState(false);
  const [error,         setError]        = React.useState('');
  const [showPass,      setShowPass]     = React.useState(false);
  const [showPassC,     setShowPassC]    = React.useState(false);
  // Signup fields
  const [name,          setName]         = React.useState('');
  const [region,        setRegion]       = React.useState('');
  const [regionSearch,  setRegionSearch] = React.useState('');
  const [regionOpen,    setRegionOpen]   = React.useState(false);

  const [isDesktop, setIsDesktop] = React.useState(() => window.innerWidth >= 1024);
  React.useEffect(() => {
    const fn = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  const FL = window.FL_COUNTIES || {};

  // Build flat list of searchable items: county names + cities
  const regionItems = React.useMemo(() => {
    const items = [];
    Object.entries(FL).forEach(([county, cities]) => {
      items.push({ label: county + ' County', value: county + ' County', isCounty: true });
      cities.forEach(city => items.push({ label: city + ', ' + county, value: city, isCounty: false }));
    });
    return items;
  }, []);

  const filteredItems = regionSearch.trim().length > 0
    ? regionItems.filter(i => i.label.toLowerCase().includes(regionSearch.toLowerCase()))
    : regionItems.slice(0, 20); // show first 20 when no search

  const canSubmit = email.trim().length > 3 && pass.trim().length >= 4;

  const handleLogin = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError('');
    try {
      if (!window.supabase) throw new Error('SDK not loaded (check CDN)');
      if (!window.sb) throw new Error('createClient failed — check console');
      const { data, error: err } = await window.sb.auth.signInWithPassword({ email: email.trim(), password: pass });
      if (err) throw err;
      onLogin(data.user);
    } catch(e) {
      setError(e.message || 'Login failed');
      setLoading(false);
    }
  };

  const goSignup = () => { setMode('signup'); setStep(1); };
  const goLogin  = () => { setMode('login'); setStep(1); };

  // ── Password strength ────────────────────────────────────────
  const passStrength = React.useMemo(() => {
    if (!pass) return { score: 0, label: '', color: '' };
    const checks = {
      length:   pass.length >= 8,
      upper:    /[A-Z]/.test(pass),
      lower:    /[a-z]/.test(pass),
      number:   /[0-9]/.test(pass),
      special:  /[^A-Za-z0-9]/.test(pass),
    };
    const score = Object.values(checks).filter(Boolean).length;
    if (score <= 2) return { score, checks, label: lang==='pt'?'Fraca':lang==='es'?'Débil':'Weak',     color:'#ef4444', pct: 20 };
    if (score === 3) return { score, checks, label: lang==='pt'?'Razoável':lang==='es'?'Regular':'Fair',   color:'#f97316', pct: 50 };
    if (score === 4) return { score, checks, label: lang==='pt'?'Boa':lang==='es'?'Buena':'Good',     color:'#eab308', pct: 75 };
    return              { score, checks, label: lang==='pt'?'Forte':lang==='es'?'Fuerte':'Strong',   color:'#22c55e', pct: 100 };
  }, [pass, lang]);

  const passValid = passStrength.score >= 5; // all 5 checks
  const passMatch = pass.length >= 8 && passConfirm.length >= 1 && pass === passConfirm;
  const canStep1 = name.trim().length > 1 && email.trim().length > 3 && passValid && passMatch;
  const canStep2 = region !== '';

  const handleSignup = async () => {
    if (!canStep2 || loading) return;
    setLoading(true);
    setError('');
    try {
      if (!window.supabase) throw new Error('SDK not loaded (check CDN)');
      if (!window.sb) throw new Error('createClient failed — check console');
      const { data, error: err } = await window.sb.auth.signUp({ email: email.trim(), password: pass });
      if (err) throw err;
      // Try inserting profile — retry once if no auth token yet (email confirmation flow)
      const userId = data.user?.id || data.id;
      const insertProfile = () => window.sb.from('profiles').insert({ id: userId, name: name.trim(), region, role: 'user', email: email.trim() });
      const { error: insertErr } = await insertProfile();
      if (insertErr) {
        // Wait briefly for token to settle, then retry
        await new Promise(r => setTimeout(r, 800));
        await insertProfile();
      }
      onLogin(data.user || data);
    } catch(e) {
      setError(e.message || 'Signup failed');
      setLoading(false);
    }
  };

  const langs = [
    { id:'en', flag:'🇺🇸', short:'EN' },
    { id:'pt', flag:'🇧🇷', short:'PT' },
    { id:'es', flag:'🇪🇸', short:'ES' },
  ];

  // ── Flood Level icon — approved brand icon v2.0 ──────────────
  const FloodIcon = ({ size = 80 }) => {
    const u = 'li';
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{display:'block'}}>
        <defs>
          <radialGradient id={`${u}bg`} cx="50%" cy="48%" r="66%">
            <stop offset="0%" stopColor="#0B1F32"/>
            <stop offset="100%" stopColor="#040D18"/>
          </radialGradient>
          <clipPath id={`${u}wc`}>
            <path d="M-5,59 Q13,51 28,59 Q43,67 58,59 Q73,51 88,59 Q97,63 105,59 L105,105 L-5,105Z"/>
          </clipPath>
          <linearGradient id={`${u}wf`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0AB8C8" stopOpacity="0.28"/>
            <stop offset="100%" stopColor="#065068" stopOpacity="0.55"/>
          </linearGradient>
          <filter id={`${u}g1`}>
            <feGaussianBlur stdDeviation="2.5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <linearGradient id={`${u}gl`} x1="0%" y1="0%" x2="55%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.13"/>
            <stop offset="100%" stopColor="white" stopOpacity="0"/>
          </linearGradient>
          <clipPath id={`${u}rnd`}><rect width="100" height="100" rx="24"/></clipPath>
        </defs>
        <rect width="100" height="100" rx="24" fill={`url(#${u}bg)`}/>
        <g clipPath={`url(#${u}rnd)`}>
          <text x="5" y="72" fontFamily="Poppins,sans-serif" fontWeight="800" fontSize="66" fill="rgba(255,255,255,0.95)">P</text>
          <text x="53" y="72" fontFamily="Poppins,sans-serif" fontWeight="800" fontSize="66" fill="rgba(255,255,255,0.95)">X</text>
          <text clipPath={`url(#${u}wc)`} x="5" y="72" fontFamily="Poppins,sans-serif" fontWeight="800" fontSize="66" fill="#18DAEA" filter={`url(#${u}g1)`}>P</text>
          <text clipPath={`url(#${u}wc)`} x="53" y="72" fontFamily="Poppins,sans-serif" fontWeight="800" fontSize="66" fill="#18DAEA" filter={`url(#${u}g1)`}>X</text>
          <path d="M-5,59 Q13,51 28,59 Q43,67 58,59 Q73,51 88,59 Q97,63 105,59 L105,105 L-5,105Z" fill={`url(#${u}wf)`}/>
          <path d="M-5,59 Q13,51 28,59 Q43,67 58,59 Q73,51 88,59 Q97,63 105,59" stroke="#0EBAC7" strokeWidth="2.8" fill="none" strokeLinecap="round" filter={`url(#${u}g1)`}/>
          <path d="M-5,59 Q13,51 28,59 Q43,67 58,59 Q73,51 88,59 Q97,63 105,59" stroke="rgba(255,255,255,0.50)" strokeWidth="1" fill="none" strokeLinecap="round"/>
          <circle cx="20" cy="46" r="2.2" fill="none" stroke="rgba(14,186,199,0.55)" strokeWidth="1.2" filter={`url(#${u}g1)`}/>
          <circle cx="34" cy="40" r="1.5" fill="none" stroke="rgba(14,186,199,0.40)" strokeWidth="1"/>
          <circle cx="70" cy="43" r="2.5" fill="none" stroke="rgba(14,186,199,0.50)" strokeWidth="1.2" filter={`url(#${u}g1)`}/>
          <circle cx="83" cy="37" r="1.6" fill="none" stroke="rgba(14,186,199,0.35)" strokeWidth="1"/>
          <circle cx="47" cy="50" r="1.2" fill="none" stroke="rgba(14,186,199,0.30)" strokeWidth="0.8"/>
          <rect width="100" height="100" rx="24" fill={`url(#${u}gl)`}/>
          <ellipse cx="26" cy="17" rx="20" ry="9" fill="white" opacity="0.07" transform="rotate(-14,26,17)"/>
        </g>
        <rect x="1" y="1" width="98" height="98" rx="23.5" fill="none" stroke="rgba(14,186,199,0.25)" strokeWidth="1.5"/>
      </svg>
    );
  };

  // ── Shared form content (used in both mobile and desktop) ──────
  const FormContent = () => (<>
    {mode === 'login' ? (<>
      {/* Email */}
      <div style={{position:'relative'}}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8aafc8" strokeWidth="2" strokeLinecap="round"
          style={{position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', zIndex:1}}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
        <input className="pg-field" type="email" value={email}
          onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()}
          placeholder={lang==='pt'?'Endereço de email':lang==='es'?'Correo electrónico':'Email address'}
          style={{height:52, fontSize:14, paddingLeft:40, background:'rgba(255,255,255,0.92)', border:'1px solid rgba(255,255,255,0.60)', color:'#0A2840', backdropFilter:'blur(8px)'}}/>
      </div>
      {/* Password */}
      <div style={{position:'relative'}}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8aafc8" strokeWidth="2" strokeLinecap="round"
          style={{position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', zIndex:1}}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <input className="pg-field" type={showPass?'text':'password'} value={pass}
          onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()}
          placeholder={lang==='pt'?'Senha':lang==='es'?'Contraseña':'Password'}
          style={{height:52, fontSize:14, paddingLeft:40, paddingRight:46, background:'rgba(255,255,255,0.92)', border:'1px solid rgba(255,255,255,0.60)', color:'#0A2840', backdropFilter:'blur(8px)'}}/>
        <button onClick={()=>setShowPass(p=>!p)} style={{position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
          border:'none', background:'transparent', cursor:'pointer', padding:4, color:'#8aafc8', display:'flex', alignItems:'center', zIndex:1}}>
          {showPass
            ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
        </button>
      </div>
      <div style={{textAlign:'right', marginTop:-4}}>
        <button style={{border:'none', background:'transparent', color: isDesktop ? 'var(--pg-blue-500)' : '#ffffff',
          fontSize:12, fontWeight:600, cursor:'pointer', padding:0, fontFamily:'inherit'}}>{t.forgotPw}</button>
      </div>
      {error && <div style={{fontSize:12.5, color:'#ef4444', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, padding:'9px 12px', fontWeight:500}}>{error}</div>}
      <button onClick={handleLogin} disabled={!canSubmit||loading} style={{
        width:'70%', alignSelf:'center', height:54, borderRadius:999, border:'none', cursor: canSubmit?'pointer':'default',
        fontFamily:'inherit', fontSize:15, fontWeight:700,
        background:'linear-gradient(90deg, #1565E8 0%, #00C2D4 100%)',
        color:'#fff', opacity: canSubmit ? 1 : 0.45,
        boxShadow: canSubmit ? '0 8px 28px rgba(21,101,232,0.35)' : 'none',
        transition:'all .2s', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
      }}>
        {loading ? <><span style={{width:16, height:16, borderRadius:'50%', border:'2.5px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', animation:'pgSpin .7s linear infinite', display:'inline-block'}}/>{t.loginBtn}</> : t.loginBtn}
      </button>
      <div style={{display:'flex', alignItems:'center', gap:10}}>
        <div style={{flex:1, height:1, background: isDesktop ? 'var(--pg-ink-200)' : 'rgba(255,255,255,0.25)'}}/>
        <span style={{fontSize:11, color: isDesktop ? 'var(--pg-ink-400)' : '#ffffff', fontWeight:500}}>{t.orLbl}</span>
        <div style={{flex:1, height:1, background: isDesktop ? 'var(--pg-ink-200)' : 'rgba(255,255,255,0.25)'}}/>
      </div>
      <button onClick={() => {
        const base = 'https://xiszfqghizqzlwyrfjol.supabase.co';
        const redirect = window.location.origin || 'https://usapoolmarket.com';
        window.location.href = base + '/auth/v1/authorize?provider=google&redirect_to=' + encodeURIComponent(redirect);
      }} style={{width:'100%', height:48, borderRadius:12,
        border: isDesktop ? '1.5px solid var(--pg-ink-200)' : '1px solid rgba(255,255,255,0.30)',
        background: isDesktop ? '#fff' : 'rgba(255,255,255,0.18)',
        backdropFilter:'blur(8px)', cursor:'pointer', fontFamily:'inherit', fontWeight:600, fontSize:13.5,
        color: isDesktop ? 'var(--pg-ink-900)' : '#fff',
        display:'flex', alignItems:'center', justifyContent:'center', gap:9}}>
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        Continue with Google
      </button>
      <button onClick={()=>onLogin()} style={{border:'none', background:'transparent',
        color: isDesktop ? 'var(--pg-ink-500)' : '#ffffff',
        fontSize:13, cursor:'pointer', padding:'2px 0', fontFamily:'inherit',
        textDecoration:'underline', textDecorationColor: isDesktop ? 'var(--pg-ink-300)' : 'rgba(255,255,255,0.60)'}}>{t.continueGuest}</button>
      <div style={{textAlign:'center', marginTop:'auto', paddingTop:4}}>
        <span style={{fontSize:12.5, color: isDesktop ? 'var(--pg-ink-500)' : '#ffffff'}}>{t.noAccount} </span>
        <button onClick={()=>{setMode('signup');setStep(1);}} style={{border:'none', background:'transparent',
          color: isDesktop ? 'var(--pg-blue-500)' : '#fff',
          fontSize:12.5, fontWeight:700, cursor:'pointer', padding:0, fontFamily:'inherit'}}>{t.signUp}</button>
      </div>
    </>) : null}
  </>);

  // ── Shared input style for desktop ─────────────────────────────
  const deskInput = {height:50, fontSize:14, background:'#fff', border:'1.5px solid #e2e8f0', color:'#0A2840', borderRadius:12};

  // ── DESKTOP layout ──────────────────────────────────────────────
  if (isDesktop) {
    return (
      <div style={{width:'100%', height:'100%', display:'flex', overflow:'hidden'}}>
        {/* Left — full photo + logo */}
        <div style={{flex:'0 0 50%', position:'relative', overflow:'hidden'}}>
          <div style={{position:'absolute', inset:0, backgroundImage:'url(login-bg.png)', backgroundSize:'cover', backgroundPosition:'center'}}/>
          <div style={{position:'absolute', inset:0, background:'linear-gradient(160deg, rgba(0,0,0,0.05) 0%, rgba(0,20,60,0.55) 100%)'}}/>
          <div style={{position:'relative', zIndex:2, height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6, padding:'40px 48px'}}>
            <img src="pgx-logo.png" alt="PoolGuyX" style={{height:160, width:'auto', filter:'drop-shadow(0 6px 32px rgba(0,0,0,0.55)) brightness(1.1)'}}/>
            <div style={{display:'flex', alignItems:'center', gap:12, marginTop:4}}>
              <div style={{width:36, height:1.5, background:'rgba(255,255,255,0.55)', borderRadius:2}}/>
              <span style={{fontSize:12, fontWeight:600, color:'#fff', letterSpacing:'0.08em', textTransform:'uppercase', textShadow:'0 1px 8px rgba(0,0,0,0.45)'}}>{t.tagline}</span>
              <div style={{width:36, height:1.5, background:'rgba(255,255,255,0.55)', borderRadius:2}}/>
            </div>
            <p style={{fontSize:13, color:'rgba(255,255,255,0.80)', textAlign:'center', lineHeight:1.6, maxWidth:280, margin:'2px 0 0', textShadow:'0 1px 6px rgba(0,0,0,0.35)'}}>{t.loginSub}</p>
          </div>
        </div>

        {/* Right — white form panel */}
        <div style={{flex:'0 0 50%', background:'#ffffff', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 48px', overflowY:'auto', position:'relative'}}>
          {/* Language switcher */}
          <div style={{position:'absolute', top:20, right:24, display:'flex', gap:6}}>
            {langs.map(l => (
              <button key={l.id} onClick={()=>setLang(l.id)} style={{
                padding:'4px 10px', borderRadius:8, border:'1.5px solid', cursor:'pointer',
                fontFamily:'inherit', fontSize:10.5, fontWeight:700, letterSpacing:'0.05em',
                background: lang===l.id ? '#EEF4FF' : 'transparent',
                borderColor: lang===l.id ? '#1565E8' : '#e2e8f0',
                color: lang===l.id ? '#1565E8' : '#94a3b8',
                transition:'all .15s',
              }}>{l.flag} {l.short}</button>
            ))}
          </div>

          <div style={{width:'100%', maxWidth:360}}>

            {/* ── LOGIN mode ── */}
            {mode === 'login' && (<>
              <div style={{marginBottom:24}}>
                <h1 style={{fontFamily:'var(--pg-font-display)', fontSize:24, fontWeight:800, color:'#0A2840', margin:'0 0 6px', letterSpacing:'-0.01em'}}>
                  {lang==='pt'?'Bem-vindo de volta':lang==='es'?'Bienvenido de nuevo':'Welcome back'} 👋
                </h1>
                <p style={{fontSize:13, color:'#64748b', margin:0, lineHeight:1.5}}>
                  {lang==='pt'?'Entre na sua conta para continuar':lang==='es'?'Inicia sesión para continuar':'Sign in to your account to continue'}
                </p>
              </div>
              <div style={{display:'flex', flexDirection:'column', gap:12}}>
                {/* Email */}
                <div style={{position:'relative'}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"
                    style={{position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none'}}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  <input className="pg-field" type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()}
                    placeholder={lang==='pt'?'Endereço de email':lang==='es'?'Correo electrónico':'Email address'}
                    style={{...deskInput, paddingLeft:40}}/>
                </div>
                {/* Password */}
                <div style={{position:'relative'}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"
                    style={{position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none'}}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input className="pg-field" type={showPass?'text':'password'} value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()}
                    placeholder={lang==='pt'?'Senha':lang==='es'?'Contraseña':'Password'}
                    style={{...deskInput, paddingLeft:40, paddingRight:46}}/>
                  <button onClick={()=>setShowPass(p=>!p)} style={{position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', border:'none', background:'transparent', cursor:'pointer', padding:4, color:'#94a3b8', display:'flex', alignItems:'center'}}>
                    {showPass ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                  </button>
                </div>
                <div style={{textAlign:'right', marginTop:-8}}>
                  <button style={{border:'none', background:'transparent', color:'#1565E8', fontSize:12, fontWeight:600, cursor:'pointer', padding:0, fontFamily:'inherit'}}>{t.forgotPw}</button>
                </div>
                {error && <div style={{fontSize:12.5, color:'#ef4444', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, padding:'9px 12px', fontWeight:500}}>{error}</div>}
                <button onClick={handleLogin} disabled={!canSubmit||loading} style={{
                  width:'100%', height:52, borderRadius:12, border:'none', cursor: canSubmit?'pointer':'default',
                  fontFamily:'inherit', fontSize:15, fontWeight:700,
                  background:'linear-gradient(90deg, #1565E8 0%, #00C2D4 100%)',
                  color:'#fff', opacity: canSubmit ? 1 : 0.45,
                  boxShadow: canSubmit ? '0 6px 24px rgba(21,101,232,0.35)' : 'none',
                  transition:'all .2s', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                }}>
                  {loading ? <><span style={{width:16, height:16, borderRadius:'50%', border:'2.5px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', animation:'pgSpin .7s linear infinite', display:'inline-block'}}/>{t.loginBtn}</> : t.loginBtn}
                </button>
                <div style={{display:'flex', alignItems:'center', gap:10}}>
                  <div style={{flex:1, height:1, background:'#e2e8f0'}}/><span style={{fontSize:11, color:'#94a3b8', fontWeight:500}}>{t.orLbl}</span><div style={{flex:1, height:1, background:'#e2e8f0'}}/>
                </div>
                <button onClick={()=>{const b='https://xiszfqghizqzlwyrfjol.supabase.co';const r=window.location.origin||'https://usapoolmarket.com';window.location.href=b+'/auth/v1/authorize?provider=google&redirect_to='+encodeURIComponent(r);}}
                  style={{width:'100%', height:50, borderRadius:12, border:'1.5px solid #e2e8f0', background:'#fff', cursor:'pointer', fontFamily:'inherit', fontWeight:600, fontSize:14, color:'#0A2840', display:'flex', alignItems:'center', justifyContent:'center', gap:10}}>
                  <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                  Continue with Google
                </button>
                <button onClick={()=>onLogin()} style={{border:'none', background:'transparent', color:'#64748b', fontSize:13, cursor:'pointer', padding:'2px 0', fontFamily:'inherit', textDecoration:'underline', textDecorationColor:'#cbd5e1'}}>{t.continueGuest}</button>
                <div style={{textAlign:'center', paddingTop:4}}>
                  <span style={{fontSize:13, color:'#64748b'}}>{t.noAccount} </span>
                  <button onClick={()=>{setMode('signup');setStep(1);}} style={{border:'none', background:'transparent', color:'#1565E8', fontSize:13, fontWeight:700, cursor:'pointer', padding:0, fontFamily:'inherit'}}>{t.signUp}</button>
                </div>
              </div>
            </>)}

            {/* ── SIGNUP mode ── */}
            {mode === 'signup' && (<>
              <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:20}}>
                <button onClick={step===1 ? ()=>setMode('login') : ()=>setStep(1)} style={{border:'1.5px solid #e2e8f0', background:'#fff', width:34, height:34, borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                  {Icon.chev(16,'#64748b','left')}
                </button>
                <div style={{flex:1}}>
                  <h1 style={{fontFamily:'var(--pg-font-display)', fontSize:22, fontWeight:800, color:'#0A2840', margin:'0 0 2px', letterSpacing:'-0.01em'}}>
                    {lang==='pt'?'Criar conta':lang==='es'?'Crear cuenta':'Create account'}
                  </h1>
                  <p style={{fontSize:13, color:'#64748b', margin:0}}>{lang==='pt'?`Passo ${step} de 2`:lang==='es'?`Paso ${step} de 2`:`Step ${step} of 2`}</p>
                </div>
                <div style={{display:'flex', gap:6}}>
                  {[1,2].map(i=><div key={i} style={{width:i===step?24:8, height:8, borderRadius:999, transition:'width .2s', background:i<=step?'#1565E8':'#e2e8f0'}}/>)}
                </div>
              </div>
              <div style={{display:'flex', flexDirection:'column', gap:14}}>
                {step===1 && (<>
                  <input className="pg-field" type="text" value={name} onChange={e=>setName(e.target.value)}
                    placeholder={lang==='pt'?'Nome completo':lang==='es'?'Nombre completo':'Full name'} style={{...deskInput}}/>
                  <input className="pg-field" type="email" value={email} onChange={e=>setEmail(e.target.value)}
                    placeholder="Email" style={{...deskInput}}/>
                  <div style={{position:'relative'}}>
                    <input className="pg-field" type={showPass?'text':'password'} value={pass} onChange={e=>setPass(e.target.value)}
                      placeholder={lang==='pt'?'Senha (mín. 8 caracteres)':lang==='es'?'Contraseña (mín. 8 caracteres)':'Password (min. 8 chars)'}
                      style={{...deskInput, paddingRight:46}}/>
                    <button onClick={()=>setShowPass(p=>!p)} style={{position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', border:'none', background:'transparent', cursor:'pointer', padding:4, color:'#94a3b8', display:'flex', alignItems:'center'}}>
                      {showPass ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                    </button>
                  </div>
                  {pass.length > 0 && (
                    <div style={{display:'flex', gap:4}}>
                      {[1,2,3,4,5].map(i=><div key={i} style={{flex:1, height:4, borderRadius:999, background:i<=passStrength.score?passStrength.color:'#e2e8f0', transition:'background .2s'}}/>)}
                    </div>
                  )}
                  <div style={{position:'relative'}}>
                    <input className="pg-field" type={showPassC?'text':'password'} value={passConfirm} onChange={e=>setPassConfirm(e.target.value)}
                      placeholder={lang==='pt'?'Confirmar senha':lang==='es'?'Confirmar contraseña':'Confirm password'}
                      style={{...deskInput, paddingRight:46, border:passConfirm.length>=4?`1.5px solid ${passMatch?'#22c55e':'#f87171'}`:'1.5px solid #e2e8f0'}}/>
                    <button onClick={()=>setShowPassC(p=>!p)} style={{position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', border:'none', background:'transparent', cursor:'pointer', padding:4, color:'#94a3b8', display:'flex', alignItems:'center'}}>
                      {showPassC ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                    </button>
                  </div>
                  <button onClick={()=>setStep(2)} disabled={!canStep1} style={{
                    width:'100%', height:52, borderRadius:12, border:'none', cursor:canStep1?'pointer':'default',
                    fontFamily:'inherit', fontSize:15, fontWeight:700,
                    background:'linear-gradient(90deg, #1565E8 0%, #00C2D4 100%)',
                    color:'#fff', opacity:canStep1?1:0.45,
                    boxShadow:canStep1?'0 6px 24px rgba(21,101,232,0.35)':'none', transition:'all .2s',
                  }}>{lang==='pt'?'Continuar →':lang==='es'?'Continuar →':'Continue →'}</button>
                </>)}
                {step===2 && (<>
                  <p style={{fontSize:13, color:'#64748b', margin:'0 0 4px'}}>{lang==='pt'?'Selecione sua região de trabalho:':lang==='es'?'Selecciona tu región:':'Select your work region:'}</p>
                  <div style={{position:'relative'}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"
                      style={{position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', pointerEvents:'none'}}>
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input className="pg-field" type="text" value={regionSearch}
                      onChange={e=>{setRegionSearch(e.target.value);setRegionOpen(true);}} onFocus={()=>setRegionOpen(true)}
                      placeholder={lang==='pt'?'Buscar cidade ou condado…':lang==='es'?'Buscar ciudad o condado…':'Search city or county…'}
                      style={{...deskInput, paddingLeft:34}}/>
                  </div>
                  {region && <div style={{display:'flex', alignItems:'center', gap:8, background:'#EEF4FF', border:'1.5px solid #93c5fd', borderRadius:999, padding:'6px 14px', alignSelf:'flex-start'}}>
                    <span style={{fontSize:13, fontWeight:600, color:'#1565E8'}}>{region}</span>
                    <button onClick={()=>{setRegion('');setRegionSearch('');setRegionOpen(true);}} style={{border:'none', background:'#bfdbfe', borderRadius:'50%', width:16, height:16, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', padding:0, color:'#1565E8'}}>
                      <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="1" y1="1" x2="9" y2="9"/><line x1="9" y1="1" x2="1" y2="9"/></svg>
                    </button>
                  </div>}
                  {regionOpen && filteredItems.length > 0 && (
                    <div style={{border:'1.5px solid #e2e8f0', borderRadius:12, maxHeight:160, overflowY:'auto', boxShadow:'0 8px 24px rgba(15,30,60,0.10)'}}>
                      {filteredItems.map((item,idx)=>(
                        <button key={idx} onMouseDown={e=>e.preventDefault()} onClick={()=>{setRegion(item.value);setRegionSearch('');setRegionOpen(false);}}
                          style={{display:'flex', alignItems:'center', gap:8, width:'100%', padding:'9px 14px', border:'none', background:item.isCounty?'#f8fafc':'#fff', cursor:'pointer', fontFamily:'inherit', textAlign:'left', borderBottom:'0.5px solid #f1f5f9'}}>
                          <span style={{fontSize:12, opacity:0.5}}>{item.isCounty?'🗺️':'📍'}</span>
                          <span style={{fontSize:item.isCounty?11:13, fontWeight:item.isCounty?700:500, color:item.isCounty?'#94a3b8':'#0A2840', textTransform:item.isCounty?'uppercase':'none', letterSpacing:item.isCounty?'0.04em':0}}>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {regionOpen && <div style={{position:'fixed', inset:0, zIndex:98}} onClick={()=>setRegionOpen(false)}/>}
                  {error && <div style={{fontSize:12.5, color:'#ef4444', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, padding:'9px 12px', fontWeight:500}}>{error}</div>}
                  <button onClick={handleSignup} disabled={!canStep2||loading} style={{
                    width:'100%', height:52, borderRadius:12, border:'none', cursor:canStep2?'pointer':'default',
                    fontFamily:'inherit', fontSize:15, fontWeight:700,
                    background:'linear-gradient(90deg, #1565E8 0%, #00C2D4 100%)',
                    color:'#fff', opacity:canStep2?1:0.45,
                    boxShadow:canStep2?'0 6px 24px rgba(21,101,232,0.35)':'none', transition:'all .2s',
                    display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                  }}>
                    {loading?<span style={{width:16,height:16,borderRadius:'50%',border:'2.5px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',animation:'pgSpin .7s linear infinite',display:'inline-block'}}/>:null}
                    {lang==='pt'?'Criar minha conta':lang==='es'?'Crear mi cuenta':'Create my account'}
                  </button>
                </>)}
                <div style={{textAlign:'center', paddingTop:4}}>
                  <span style={{fontSize:13, color:'#64748b'}}>{lang==='pt'?'Já tem conta? ':lang==='es'?'¿Ya tienes cuenta? ':'Already have an account? '}</span>
                  <button onClick={()=>setMode('login')} style={{border:'none', background:'transparent', color:'#1565E8', fontSize:13, fontWeight:700, cursor:'pointer', padding:0, fontFamily:'inherit'}}>{lang==='pt'?'Entrar':lang==='es'?'Iniciar sesión':'Sign in'}</button>
                </div>
              </div>
            </>)}

          </div>
        </div>
        <style>{`@keyframes pgSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', overflow:'hidden', position:'relative' }}>

      {/* ── Background — full screen photo ── */}
      <div style={{
        position:'absolute', inset:0,
        backgroundImage:'url(login-bg.png)',
        backgroundSize:'cover',
        backgroundPosition:'center center',
        backgroundRepeat:'no-repeat',
        zIndex:0,
      }}/>
      {/* Subtle overlay apenas na parte de baixo para legibilidade do form */}
      <div style={{position:'absolute', inset:0, background:'linear-gradient(180deg, transparent 0%, transparent 40%, rgba(0,0,0,0.30) 100%)', zIndex:1}}/>

      {/* ── Language switcher ── */}
      <div style={{position:'absolute', top:18, right:16, display:'flex', gap:5, zIndex:10}}>
        {langs.map(l => (
          <button key={l.id} onClick={()=>setLang(l.id)} style={{
            padding:'4px 9px', borderRadius:8, border:'none', cursor:'pointer',
            fontFamily:'inherit', fontSize:10.5, fontWeight:700, letterSpacing:'0.05em',
            background: lang===l.id ? 'rgba(255,255,255,0.30)' : 'rgba(255,255,255,0.12)',
            color: lang===l.id ? '#ffffff' : 'rgba(255,255,255,0.90)',
            backdropFilter:'blur(8px)',
            transition:'all .15s',
          }}>{l.flag} {l.short}</button>
        ))}
      </div>

      {/* ── Hero section ── */}
      <div style={{
        position:'relative', zIndex:2,
        flex:'0 0 auto', paddingTop:36, paddingBottom:0,
        display:'flex', flexDirection:'column', alignItems:'center', gap:0,
      }}>
        {/* PoolGuyX logo */}
        <img
          src="pgx-logo.png"
          alt="PoolGuyX"
          style={{
            height: 220,
            width: 'auto',
            display: 'block',
            marginBottom: 0,
            filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.40)) brightness(1.1)',
          }}
        />

        {/* Tagline with decorative lines */}
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:0}}>
          <div style={{width:32, height:1.5, background:'rgba(255,255,255,0.45)', borderRadius:2}}/>
          <span style={{
            fontSize:12, fontWeight:600, color:'#ffffff',
            letterSpacing:'0.06em', textTransform:'uppercase',
            textShadow:'0 1px 6px rgba(0,0,0,0.40)',
          }}>{t.tagline}</span>
          <div style={{width:32, height:1.5, background:'rgba(255,255,255,0.45)', borderRadius:2}}/>
        </div>

        {/* Subtitle */}
        <p style={{
          margin:'0', fontSize:13, color:'#ffffff',
          textAlign:'center', lineHeight:1.5, maxWidth:240, padding:'0 20px',
          textShadow:'0 1px 4px rgba(0,0,0,0.35)',
        }}>{t.loginSub}</p>
      </div>

      {/* ── Form card — glass over photo ── */}
      <div style={{
        position:'relative', zIndex:2, flex:1,
        background:'rgba(255,255,255,0.10)',
        backdropFilter:'blur(18px)',
        WebkitBackdropFilter:'blur(18px)',
        borderTop:'1px solid rgba(255,255,255,0.20)',
        padding:'24px 24px 28px',
        display:'flex', flexDirection:'column', gap:12,
        overflowY:'auto',
        marginTop:28,
      }}>

        {/* ══ LOGIN MODE ══ */}
        {mode === 'login' && (<>

          {/* Email */}
          <div style={{position:'relative'}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8aafc8" strokeWidth="2" strokeLinecap="round"
              style={{position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', zIndex:1}}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            <input className="pg-field" type="email" value={email}
              onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()}
              placeholder={lang==='pt'?'Endereço de email':lang==='es'?'Correo electrónico':'Email address'}
              style={{height:52, fontSize:14, paddingLeft:40, background:'rgba(255,255,255,0.82)', border:'1px solid rgba(255,255,255,0.60)', color:'#0A2840', backdropFilter:'blur(8px)'}}/>
          </div>

          {/* Password */}
          <div style={{position:'relative'}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8aafc8" strokeWidth="2" strokeLinecap="round"
              style={{position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', zIndex:1}}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <input className="pg-field" type={showPass?'text':'password'} value={pass}
              onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()}
              placeholder={lang==='pt'?'Senha':lang==='es'?'Contraseña':'Password'}
              style={{height:52, fontSize:14, paddingLeft:40, paddingRight:46, background:'rgba(255,255,255,0.82)', border:'1px solid rgba(255,255,255,0.60)', color:'#0A2840', backdropFilter:'blur(8px)'}}/>
            <button onClick={()=>setShowPass(p=>!p)} style={{
              position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
              border:'none', background:'transparent', cursor:'pointer', padding:4,
              color:'#8aafc8', display:'flex', alignItems:'center', zIndex:1,
            }}>
              {showPass
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
            </button>
          </div>

          {/* Esqueceu a senha */}
          <div style={{textAlign:'right', marginTop:-6}}>
            <button style={{border:'none', background:'transparent', color:'#ffffff',
              fontSize:12, fontWeight:600, cursor:'pointer', padding:0, fontFamily:'inherit'}}>{t.forgotPw}</button>
          </div>

          {error ? <div style={{fontSize:12.5, color:'#ef4444', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, padding:'9px 12px', fontWeight:500}}>{error}</div> : null}

          <button onClick={handleLogin} disabled={!canSubmit||loading} style={{
            width:'70%', alignSelf:'center', height:62, borderRadius:999, border:'none', cursor: canSubmit ? 'pointer' : 'default',
            fontFamily:'inherit', fontSize:16, fontWeight:700, letterSpacing:'0.02em',
            background: 'linear-gradient(90deg, #1565E8 0%, #00C2D4 100%)',
            color: '#fff',
            opacity: canSubmit ? 1 : 0.45,
            boxShadow: canSubmit ? '0 8px 28px rgba(21,101,232,0.45)' : 'none',
            transition:'all .2s', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          }}>
            {loading ? <><span style={{width:16, height:16, borderRadius:'50%', border:'2.5px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', animation:'pgSpin .7s linear infinite', display:'inline-block'}}/>{t.loginBtn}</> : t.loginBtn}
          </button>

          <div style={{display:'flex', alignItems:'center', gap:10, margin:'2px 0'}}>
            <div style={{flex:1, height:1, background:'rgba(255,255,255,0.25)'}}/>
            <span style={{fontSize:11, color:'#ffffff', fontWeight:500}}>{t.orLbl}</span>
            <div style={{flex:1, height:1, background:'rgba(255,255,255,0.25)'}}/>
          </div>

          <button onClick={() => {
            const base = 'https://xiszfqghizqzlwyrfjol.supabase.co';
            const redirect = window.location.origin || 'https://usapoolmarket.com';
            window.location.href = base + '/auth/v1/authorize?provider=google&redirect_to=' + encodeURIComponent(redirect);
          }} style={{width:'100%', height:48, borderRadius:12, border:'1px solid rgba(255,255,255,0.30)',
            background:'rgba(255,255,255,0.18)', backdropFilter:'blur(8px)', cursor:'pointer', fontFamily:'inherit', fontWeight:600, fontSize:13.5,
            color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', gap:9}}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          <button onClick={()=>onLogin()} style={{border:'none', background:'transparent', color:'#ffffff',
            fontSize:13, cursor:'pointer', padding:'2px 0', fontFamily:'inherit',
            textDecoration:'underline', textDecorationColor:'rgba(255,255,255,0.60)'}}>{t.continueGuest}</button>

          <div style={{textAlign:'center', marginTop:'auto', paddingBottom:4}}>
            <span style={{fontSize:12.5, color:'#ffffff'}}>{t.noAccount} </span>
            <button onClick={goSignup} style={{border:'none', background:'transparent', color:'#fff',
              fontSize:12.5, fontWeight:700, cursor:'pointer', padding:0, fontFamily:'inherit'}}>{t.signUp}</button>
          </div>
        </>)}

        {/* ══ SIGNUP MODE ══ */}
        {mode === 'signup' && (<>

          {/* Header */}
          <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:4}}>
            <button onClick={step===1 ? goLogin : ()=>setStep(1)} style={{border:'none', background:'rgba(255,255,255,0.18)', width:32, height:32,
              borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, backdropFilter:'blur(6px)'}}>
              {Icon.chev(16,'#fff','left')}
            </button>
            <div>
              <div style={{fontFamily:'var(--pg-font-display)', fontSize:17, fontWeight:700, color:'#fff'}}>
                {lang==='pt'?'Criar conta':lang==='es'?'Crear cuenta':'Create account'}
              </div>
              <div style={{fontSize:11, color:'#ffffff'}}>
                {lang==='pt'?`Passo ${step} de 2`:lang==='es'?`Paso ${step} de 2`:`Step ${step} of 2`}
              </div>
            </div>
            {/* Progress dots */}
            <div style={{display:'flex', gap:5, marginLeft:'auto'}}>
              {[1,2].map(i => (
                <div key={i} style={{width: i===step?20:6, height:6, borderRadius:999, transition:'width .2s',
                  background: i<=step ? 'var(--pg-blue-500)' : 'var(--pg-ink-200)'}}/>
              ))}
            </div>
          </div>

          {/* ── Step 1: Name + Email + Password + Confirm Password ── */}
          {step === 1 && (<>
            <div>
              <div style={{fontSize:10, fontWeight:700, letterSpacing:'0.08em', color:'#ffffff', marginBottom:6}}>
                {lang==='pt'?'NOME COMPLETO':lang==='es'?'NOMBRE COMPLETO':'FULL NAME'}
              </div>
              <input className="pg-field" type="text" value={name} onChange={e=>setName(e.target.value)}
                placeholder={lang==='pt'?'Seu nome completo':lang==='es'?'Tu nombre completo':'Your full name'}
                style={{height:48, fontSize:14, background:'rgba(255,255,255,0.82)', border:'1px solid rgba(255,255,255,0.60)', color:'#0A2840', backdropFilter:'blur(8px)'}}/>
            </div>
            <div>
              <div style={{fontSize:10, fontWeight:700, letterSpacing:'0.08em', color:'#ffffff', marginBottom:6}}>EMAIL</div>
              <input className="pg-field" type="email" value={email} onChange={e=>setEmail(e.target.value)}
                placeholder="you@email.com" style={{height:48, fontSize:14, background:'rgba(255,255,255,0.82)', border:'1px solid rgba(255,255,255,0.60)', color:'#0A2840', backdropFilter:'blur(8px)'}}/>
            </div>
            <div>
              <div style={{fontSize:10, fontWeight:700, letterSpacing:'0.08em', color:'#ffffff', marginBottom:6}}>
                {t.passLbl.toUpperCase()}
              </div>
              <div style={{position:'relative'}}>
                <input className="pg-field" type={showPass?'text':'password'} value={pass} onChange={e=>setPass(e.target.value)}
                  placeholder={lang==='pt'?'Mín. 8 caracteres':lang==='es'?'Mín. 8 caracteres':'Min. 8 characters'}
                  style={{height:48, fontSize:14, paddingRight:46, background:'rgba(255,255,255,0.82)', border:'1px solid rgba(255,255,255,0.60)', color:'#0A2840', backdropFilter:'blur(8px)'}}/>
                <button onClick={()=>setShowPass(p=>!p)} style={{position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
                  border:'none', background:'transparent', cursor:'pointer', padding:4, color:'var(--pg-ink-400)', display:'flex', alignItems:'center'}}>
                  {showPass
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                </button>
              </div>

              {/* ── Strength bar ── */}
              {pass.length > 0 && (
                <div style={{marginTop:10}}>
                  <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6}}>
                    <div style={{display:'flex', gap:4}}>
                      {[1,2,3,4,5].map(i => (
                        <div key={i} style={{
                          height:4, width:36, borderRadius:999,
                          background: i <= passStrength.score ? passStrength.color : 'var(--pg-ink-200)',
                          transition:'background .2s',
                        }}/>
                      ))}
                    </div>
                    <span style={{fontSize:11, fontWeight:700, color: passStrength.color}}>{passStrength.label}</span>
                  </div>
                  <div style={{display:'flex', flexWrap:'wrap', gap:'4px 10px'}}>
                    {[
                      { ok: passStrength.checks?.length,  txt: lang==='pt'?'8+ chars':lang==='es'?'8+ chars':'8+ chars' },
                      { ok: passStrength.checks?.upper,   txt: lang==='pt'?'Maiúscula':lang==='es'?'Mayúscula':'Uppercase' },
                      { ok: passStrength.checks?.lower,   txt: lang==='pt'?'Minúscula':lang==='es'?'Minúscula':'Lowercase' },
                      { ok: passStrength.checks?.number,  txt: lang==='pt'?'Número':lang==='es'?'Número':'Number' },
                      { ok: passStrength.checks?.special, txt: lang==='pt'?'Especial (!@#)':lang==='es'?'Especial (!@#)':'Special (!@#)' },
                    ].map((c,i) => (
                      <span key={i} style={{fontSize:10.5, fontWeight:600,
                        color: c.ok ? '#16a34a' : 'var(--pg-ink-400)',
                        display:'flex', alignItems:'center', gap:3,
                      }}>
                        {c.ok ? '✓' : '○'} {c.txt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Confirm password */}
            <div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:6}}>
                <div style={{fontSize:10, fontWeight:700, letterSpacing:'0.08em', color:'#ffffff'}}>
                  {lang==='pt'?'CONFIRMAR SENHA':lang==='es'?'CONFIRMAR CONTRASEÑA':'CONFIRM PASSWORD'}
                </div>
                {passConfirm.length >= 1 && (
                  <span style={{fontSize:10.5, fontWeight:600,
                    color: passMatch ? 'var(--pg-green-600,#16a34a)' : 'var(--pg-red-500,#ef4444)'}}>
                    {passMatch
                      ? (lang==='pt'?'✓ Senhas iguais':lang==='es'?'✓ Contraseñas iguales':'✓ Passwords match')
                      : (lang==='pt'?'✗ Senhas diferentes':lang==='es'?'✗ No coinciden':'✗ Passwords don\'t match')}
                  </span>
                )}
              </div>
              <div style={{position:'relative'}}>
                <input className="pg-field" type={showPassC?'text':'password'} value={passConfirm}
                  onChange={e=>setPassConfirm(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    height:48, fontSize:14, paddingRight:46,
                    background:'rgba(255,255,255,0.82)', color:'#0A2840', backdropFilter:'blur(8px)',
                    border: passConfirm.length >= 4
                      ? `1px solid ${passMatch ? '#22c55e' : '#f87171'}`
                      : '1px solid rgba(255,255,255,0.25)',
                  }}/>
                <button onClick={()=>setShowPassC(p=>!p)} style={{position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
                  border:'none', background:'transparent', cursor:'pointer', padding:4, color:'var(--pg-ink-400)', display:'flex', alignItems:'center'}}>
                  {showPassC
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                </button>
              </div>
            </div>
            <button onClick={()=>setStep(2)} disabled={!canStep1} style={{
              width:'72%', alignSelf:'center', height:56, borderRadius:999, border:'none', cursor: canStep1?'pointer':'not-allowed',
              fontFamily:'inherit', fontSize:15, fontWeight:700,
              background: canStep1 ? 'linear-gradient(90deg, #1565E8 0%, #00C2D4 100%)' : 'var(--pg-ink-200)',
              color: canStep1 ? '#fff' : 'var(--pg-ink-400)',
              boxShadow: canStep1 ? '0 8px 24px rgba(21,101,232,0.40)' : 'none', transition:'all .2s',
            }}>{lang==='pt'?'Continuar →':lang==='es'?'Continuar →':'Continue →'}</button>
          </>)}

          {/* ── Step 2: Region (searchable) ── */}
          {step === 2 && (<>

            {/* Searchable region picker */}
            <div>
              <div style={{fontSize:10, fontWeight:700, letterSpacing:'0.08em', color:'#ffffff', marginBottom:8}}>
                {lang==='pt'?'REGIÃO / CIDADE':lang==='es'?'REGIÓN / CIUDAD':'REGION / CITY'}
              </div>

              {/* Selected region chip */}
              {region && (
                <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:8}}>
                  <div style={{
                    display:'flex', alignItems:'center', gap:6,
                    background:'var(--pg-blue-50)', border:'1.5px solid var(--pg-blue-300,#93c5fd)',
                    borderRadius:999, padding:'5px 10px 5px 12px',
                  }}>
                    <span style={{fontSize:13, fontWeight:600, color:'var(--pg-blue-700)'}}>{region}</span>
                    <button onClick={()=>{setRegion(''); setRegionSearch(''); setRegionOpen(true);}} style={{
                      border:'none', background:'var(--pg-blue-200,#bfdbfe)', borderRadius:'50%',
                      width:16, height:16, display:'flex', alignItems:'center', justifyContent:'center',
                      cursor:'pointer', padding:0, color:'var(--pg-blue-700)', flexShrink:0,
                    }}>
                      <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="1" y1="1" x2="9" y2="9"/><line x1="9" y1="1" x2="1" y2="9"/>
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Search input */}
              <div style={{position:'relative'}}>
                <div style={{position:'relative'}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--pg-ink-400)" strokeWidth="2" strokeLinecap="round"
                    style={{position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', pointerEvents:'none'}}>
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    className="pg-field"
                    type="text"
                    value={regionSearch}
                    onChange={e=>{setRegionSearch(e.target.value); setRegionOpen(true);}}
                    onFocus={()=>setRegionOpen(true)}
                    placeholder={lang==='pt'?'Buscar cidade ou condado…':lang==='es'?'Buscar ciudad o condado…':'Search city or county…'}
                    style={{height:44, fontSize:13.5, paddingLeft:34}}
                  />
                </div>

                {/* Dropdown */}
                {regionOpen && (
                  <div style={{
                    position:'absolute', top:'calc(100% + 4px)', left:0, right:0, zIndex:99,
                    background:'var(--pg-white)', border:'1.5px solid var(--pg-ink-200)',
                    borderRadius:12, maxHeight:180, overflowY:'auto',
                    boxShadow:'0 8px 24px rgba(15,30,60,0.12)',
                  }}>
                    {filteredItems.length === 0 ? (
                      <div style={{padding:'12px 14px', fontSize:13, color:'var(--pg-ink-400)'}}>
                        {lang==='pt'?'Nenhum resultado':lang==='es'?'Sin resultados':'No results'}
                      </div>
                    ) : filteredItems.map((item, idx) => (
                      <button key={idx} onMouseDown={e=>e.preventDefault()} onClick={()=>{
                        setRegion(item.value); setRegionSearch(''); setRegionOpen(false);
                      }} style={{
                        display:'flex', alignItems:'center', gap:8,
                        width:'100%', padding:'9px 14px', border:'none',
                        background: item.isCounty ? 'var(--pg-ink-50,#f8fafc)' : '#fff',
                        cursor:'pointer', fontFamily:'inherit', textAlign:'left',
                        borderBottom:'0.5px solid var(--pg-ink-100,#f1f5f9)',
                      }}>
                        <span style={{fontSize:12, flexShrink:0, opacity:0.5}}>{item.isCounty ? '🗺️' : '📍'}</span>
                        <span style={{
                          fontSize: item.isCounty ? 12 : 13,
                          fontWeight: item.isCounty ? 700 : 500,
                          color: item.isCounty ? 'var(--pg-ink-500)' : 'var(--pg-ink-800)',
                          letterSpacing: item.isCounty ? '0.04em' : 0,
                          textTransform: item.isCounty ? 'uppercase' : 'none',
                        }}>{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Close dropdown on outside click */}
              {regionOpen && (
                <div style={{position:'fixed', inset:0, zIndex:98}} onClick={()=>setRegionOpen(false)}/>
              )}
            </div>

            {error ? <div style={{fontSize:12.5, color:'#ef4444', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, padding:'9px 12px', fontWeight:500}}>{error}</div> : null}

            <button onClick={handleSignup} disabled={!canStep2||loading} style={{
              width:'72%', alignSelf:'center', height:56, borderRadius:999, border:'none', cursor: canStep2?'pointer':'not-allowed',
              fontFamily:'inherit', fontSize:15, fontWeight:700,
              background: canStep2 ? 'linear-gradient(90deg, #1565E8 0%, #00C2D4 100%)' : 'var(--pg-ink-200)',
              color: canStep2 ? '#fff' : 'var(--pg-ink-400)',
              boxShadow: canStep2 ? '0 8px 24px rgba(21,101,232,0.40)' : 'none',
              transition:'all .2s', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            }}>
              {loading ? <><span style={{width:16, height:16, borderRadius:'50%', border:'2.5px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', animation:'pgSpin .7s linear infinite', display:'inline-block'}}/></> : null}
              {lang==='pt'?'Criar minha conta':lang==='es'?'Crear mi cuenta':'Create my account'}
            </button>
          </>)}

          <div style={{textAlign:'center', marginTop:'auto', paddingBottom:4}}>
            <span style={{fontSize:12.5, color:'#ffffff'}}>{lang==='pt'?'Já tem conta? ':lang==='es'?'¿Ya tienes cuenta? ':'Already have an account? '}</span>
            <button onClick={goLogin} style={{border:'none', background:'transparent', color:'#fff',
              fontSize:12.5, fontWeight:700, cursor:'pointer', padding:0, fontFamily:'inherit'}}>
              {lang==='pt'?'Entrar':lang==='es'?'Iniciar sesión':'Sign in'}
            </button>
          </div>
        </>)}
      </div>

      <style>{`@keyframes pgSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

Object.assign(window, { LoginScreen });
