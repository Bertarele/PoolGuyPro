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
  const [phone,         setPhone]        = React.useState('');
  const [region,        setRegion]       = React.useState('');
  const [regionSearch,  setRegionSearch] = React.useState('');
  const [regionOpen,    setRegionOpen]   = React.useState(false);

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

  const passMatch = pass.length >= 4 && passConfirm.length >= 4 && pass === passConfirm;
  const canStep1 = name.trim().length > 1 && email.trim().length > 3 && pass.trim().length >= 4 && passMatch;
  const canStep2 = phone.trim().length >= 9 && region !== '';

  const handleSignup = async () => {
    if (!canStep2 || loading) return;
    setLoading(true);
    setError('');
    try {
      if (!window.supabase) throw new Error('SDK not loaded (check CDN)');
      if (!window.sb) throw new Error('createClient failed — check console');
      const { data, error: err } = await window.sb.auth.signUp({ email: email.trim(), password: pass });
      if (err) throw err;
      await window.sb.from('profiles').insert({ id: data.user.id, name, phone, region, role: 'user' });
      onLogin(data.user);
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

  return (
    <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', overflow:'hidden', position:'relative' }}>

      {/* ── Hero background — brand navy ── */}
      <div style={{
        position:'absolute', inset:0,
        background:'linear-gradient(160deg, #040D18 0%, #071A2E 50%, #0A2840 100%)',
        zIndex:0,
      }}/>
      {/* Subtle aqua glow top-right */}
      <div style={{position:'absolute', top:-40, right:-40, width:280, height:280, borderRadius:'50%',
        background:'radial-gradient(circle, rgba(14,186,199,0.10) 0%, transparent 70%)', zIndex:1}}/>

      {/* Decorative circles */}
      <div style={{position:'absolute', top:-60, right:-60, width:200, height:200, borderRadius:'50%', background:'rgba(14,186,199,0.06)', zIndex:1}}/>
      <div style={{position:'absolute', top:40, left:-80, width:220, height:220, borderRadius:'50%', background:'rgba(255,255,255,0.03)', zIndex:1}}/>
      <div style={{position:'absolute', top:160, right:-30, width:120, height:120, borderRadius:'50%', background:'rgba(14,186,199,0.05)', zIndex:1}}/>

      {/* ── Language switcher ── */}
      <div style={{position:'absolute', top:18, right:16, display:'flex', gap:5, zIndex:10}}>
        {langs.map(l => (
          <button key={l.id} onClick={()=>setLang(l.id)} style={{
            padding:'4px 9px', borderRadius:8, border:'none', cursor:'pointer',
            fontFamily:'inherit', fontSize:10.5, fontWeight:700, letterSpacing:'0.05em',
            background: lang===l.id ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.07)',
            color: lang===l.id ? '#fff' : 'rgba(255,255,255,0.45)',
            transition:'all .15s',
          }}>{l.flag} {l.short}</button>
        ))}
      </div>

      {/* ── Hero section ── */}
      <div style={{
        position:'relative', zIndex:2,
        flex:'0 0 auto', paddingTop:60, paddingBottom:0,
        display:'flex', flexDirection:'column', alignItems:'center', gap:0,
      }}>
        {/* Logo icon — Flood Level */}
        <div style={{
          marginBottom:18,
          filter:'drop-shadow(0 8px 28px rgba(14,186,199,0.45)) drop-shadow(0 2px 8px rgba(0,0,0,0.30))',
        }}>
          <FloodIcon size={88}/>
        </div>

        {/* PoolGuyX wordmark */}
        <div style={{display:'flex', alignItems:'baseline', gap:0, marginBottom:6}}>
          <span style={{
            fontFamily:'"Poppins", system-ui, sans-serif',
            fontSize:38, fontWeight:800, letterSpacing:'-0.025em',
            color:'#fff',
          }}>Pool</span>
          <span style={{
            fontFamily:'"Poppins", system-ui, sans-serif',
            fontSize:38, fontWeight:800, letterSpacing:'-0.025em',
            background:'linear-gradient(135deg, #4BA8E8 0%, #B8E4FA 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          }}>Guy</span>
          <span style={{
            fontFamily:'"Raleway", system-ui, sans-serif',
            fontSize:44, fontWeight:800, letterSpacing:'-0.02em', lineHeight:1,
            background:'linear-gradient(135deg, #0EBAC7 0%, #6DD8F0 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          }}>X</span>
        </div>

        {/* Tagline with decorative lines */}
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:6}}>
          <div style={{width:32, height:1.5, background:'rgba(255,255,255,0.45)', borderRadius:2}}/>
          <span style={{
            fontSize:12, fontWeight:500, color:'rgba(255,255,255,0.72)',
            letterSpacing:'0.06em', textTransform:'uppercase',
          }}>Your Pool. Our Priority.</span>
          <div style={{width:32, height:1.5, background:'rgba(255,255,255,0.45)', borderRadius:2}}/>
        </div>

        {/* Subtitle */}
        <p style={{
          margin:'8px 0 0', fontSize:13, color:'rgba(255,255,255,0.55)',
          textAlign:'center', lineHeight:1.5, maxWidth:240, padding:'0 20px',
        }}>{t.loginSub}</p>
      </div>

      {/* ── Wave SVG — aqua tones ── */}
      <div style={{position:'relative', zIndex:2, marginTop:24, flexShrink:0, lineHeight:0}}>
        <svg viewBox="0 0 402 56" width="100%" height="56" preserveAspectRatio="none">
          <path d="M0 30 Q50 5 100 30 Q150 55 200 30 Q250 5 300 30 Q350 55 402 30 L402 56 L0 56 Z"
            fill="rgba(14,186,199,0.12)"/>
          <path d="M0 38 Q60 14 120 38 Q180 62 240 38 Q300 14 360 38 Q385 48 402 42 L402 56 L0 56 Z"
            fill="rgba(14,186,199,0.08)"/>
          <path d="M0 46 Q80 28 160 46 Q240 64 320 46 Q365 36 402 48 L402 56 L0 56 Z"
            fill="white"/>
        </svg>
      </div>

      {/* ── Form card ── */}
      <div style={{
        position:'relative', zIndex:2, flex:1,
        background:'#fff', padding:'20px 24px 24px',
        display:'flex', flexDirection:'column', gap:12,
        overflowY:'auto',
      }}>

        {/* ══ LOGIN MODE ══ */}
        {mode === 'login' && (<>

          {/* Email */}
          <div>
            <div style={{fontSize:10, fontWeight:700, letterSpacing:'0.08em', color:'var(--pg-ink-500)', marginBottom:6}}>EMAIL</div>
            <input className="pg-field" type="email" value={email}
              onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()}
              placeholder="you@email.com" style={{height:48, fontSize:14}}/>
          </div>

          {/* Password */}
          <div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:6}}>
              <div style={{fontSize:10, fontWeight:700, letterSpacing:'0.08em', color:'var(--pg-ink-500)'}}>{t.passLbl.toUpperCase()}</div>
              <button style={{border:'none', background:'transparent', color:'var(--pg-blue-500)',
                fontSize:12, fontWeight:600, cursor:'pointer', padding:0, fontFamily:'inherit'}}>{t.forgotPw}</button>
            </div>
            <div style={{position:'relative'}}>
              <input className="pg-field" type={showPass?'text':'password'} value={pass}
                onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()}
                placeholder="••••••••" style={{height:48, fontSize:14, paddingRight:46}}/>
              <button onClick={()=>setShowPass(p=>!p)} style={{
                position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
                border:'none', background:'transparent', cursor:'pointer', padding:4,
                color:'var(--pg-ink-400)', display:'flex', alignItems:'center',
              }}>
                {showPass
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
              </button>
            </div>
          </div>

          {error ? <div style={{fontSize:12.5, color:'#ef4444', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, padding:'9px 12px', fontWeight:500}}>{error}</div> : null}

          <button onClick={handleLogin} disabled={!canSubmit||loading} style={{
            width:'100%', height:50, borderRadius:14, border:'none', cursor:'pointer',
            fontFamily:'inherit', fontSize:15, fontWeight:700, letterSpacing:'-0.01em',
            background: canSubmit ? 'linear-gradient(135deg, #0EBAC7 0%, #0D7280 100%)' : 'var(--pg-ink-200)',
            color: canSubmit ? '#fff' : 'var(--pg-ink-400)',
            boxShadow: canSubmit ? '0 6px 20px rgba(14,186,199,0.38)' : 'none',
            transition:'all .2s', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          }}>
            {loading ? <><span style={{width:16, height:16, borderRadius:'50%', border:'2.5px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', animation:'pgSpin .7s linear infinite', display:'inline-block'}}/>{t.loginBtn}</> : t.loginBtn}
          </button>

          <div style={{display:'flex', alignItems:'center', gap:10, margin:'2px 0'}}>
            <div style={{flex:1, height:1, background:'var(--pg-ink-200)'}}/>
            <span style={{fontSize:11, color:'var(--pg-ink-400)', fontWeight:500}}>{t.orLbl}</span>
            <div style={{flex:1, height:1, background:'var(--pg-ink-200)'}}/>
          </div>

          <button style={{width:'100%', height:48, borderRadius:12, border:'1.5px solid var(--pg-ink-200)',
            background:'var(--pg-white)', cursor:'pointer', fontFamily:'inherit', fontWeight:600, fontSize:13.5,
            color:'var(--pg-ink-900)', display:'flex', alignItems:'center', justifyContent:'center', gap:9}}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            {t.withApple}
          </button>

          <button onClick={()=>onLogin()} style={{border:'none', background:'transparent', color:'var(--pg-ink-500)',
            fontSize:13, cursor:'pointer', padding:'2px 0', fontFamily:'inherit',
            textDecoration:'underline', textDecorationColor:'var(--pg-ink-300)'}}>{t.continueGuest}</button>

          <div style={{textAlign:'center', marginTop:'auto', paddingBottom:4}}>
            <span style={{fontSize:12.5, color:'var(--pg-ink-500)'}}>{t.noAccount} </span>
            <button onClick={goSignup} style={{border:'none', background:'transparent', color:'var(--pg-blue-500)',
              fontSize:12.5, fontWeight:700, cursor:'pointer', padding:0, fontFamily:'inherit'}}>{t.signUp}</button>
          </div>
        </>)}

        {/* ══ SIGNUP MODE ══ */}
        {mode === 'signup' && (<>

          {/* Header */}
          <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:4}}>
            <button onClick={step===1 ? goLogin : ()=>setStep(1)} style={{border:'none', background:'var(--pg-ink-100)', width:32, height:32,
              borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
              {Icon.chev(16,'var(--pg-ink-700)','left')}
            </button>
            <div>
              <div style={{fontFamily:'var(--pg-font-display)', fontSize:17, fontWeight:700, color:'var(--pg-ink-900)'}}>
                {lang==='pt'?'Criar conta':lang==='es'?'Crear cuenta':'Create account'}
              </div>
              <div style={{fontSize:11, color:'var(--pg-ink-400)'}}>
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
              <div style={{fontSize:10, fontWeight:700, letterSpacing:'0.08em', color:'var(--pg-ink-500)', marginBottom:6}}>
                {lang==='pt'?'NOME COMPLETO':lang==='es'?'NOMBRE COMPLETO':'FULL NAME'}
              </div>
              <input className="pg-field" type="text" value={name} onChange={e=>setName(e.target.value)}
                placeholder={lang==='pt'?'Seu nome completo':lang==='es'?'Tu nombre completo':'Your full name'}
                style={{height:48, fontSize:14}}/>
            </div>
            <div>
              <div style={{fontSize:10, fontWeight:700, letterSpacing:'0.08em', color:'var(--pg-ink-500)', marginBottom:6}}>EMAIL</div>
              <input className="pg-field" type="email" value={email} onChange={e=>setEmail(e.target.value)}
                placeholder="you@email.com" style={{height:48, fontSize:14}}/>
            </div>
            <div>
              <div style={{fontSize:10, fontWeight:700, letterSpacing:'0.08em', color:'var(--pg-ink-500)', marginBottom:6}}>
                {t.passLbl.toUpperCase()}
              </div>
              <div style={{position:'relative'}}>
                <input className="pg-field" type={showPass?'text':'password'} value={pass} onChange={e=>setPass(e.target.value)}
                  placeholder={lang==='pt'?'Mín. 4 caracteres':lang==='es'?'Mín. 4 caracteres':'Min. 4 characters'}
                  style={{height:48, fontSize:14, paddingRight:46}}/>
                <button onClick={()=>setShowPass(p=>!p)} style={{position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
                  border:'none', background:'transparent', cursor:'pointer', padding:4, color:'var(--pg-ink-400)', display:'flex', alignItems:'center'}}>
                  {showPass
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                </button>
              </div>
            </div>
            {/* Confirm password */}
            <div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:6}}>
                <div style={{fontSize:10, fontWeight:700, letterSpacing:'0.08em', color:'var(--pg-ink-500)'}}>
                  {lang==='pt'?'CONFIRMAR SENHA':lang==='es'?'CONFIRMAR CONTRASEÑA':'CONFIRM PASSWORD'}
                </div>
                {passConfirm.length >= 4 && (
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
                    borderColor: passConfirm.length >= 4
                      ? (passMatch ? 'var(--pg-green-500,#22c55e)' : 'var(--pg-red-400,#f87171)')
                      : undefined,
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
              width:'100%', height:50, borderRadius:14, border:'none', cursor: canStep1?'pointer':'not-allowed',
              fontFamily:'inherit', fontSize:15, fontWeight:700,
              background: canStep1 ? 'linear-gradient(135deg, #0EBAC7 0%, #0D7280 100%)' : 'var(--pg-ink-200)',
              color: canStep1 ? '#fff' : 'var(--pg-ink-400)',
              boxShadow: canStep1 ? '0 6px 20px rgba(14,186,199,0.38)' : 'none', transition:'all .2s',
            }}>{lang==='pt'?'Continuar →':lang==='es'?'Continuar →':'Continue →'}</button>
          </>)}

          {/* ── Step 2: Phone + Region (searchable) ── */}
          {step === 2 && (<>
            <div>
              <div style={{fontSize:10, fontWeight:700, letterSpacing:'0.08em', color:'var(--pg-ink-500)', marginBottom:6}}>
                {lang==='pt'?'TELEFONE':lang==='es'?'TELÉFONO':'PHONE'}
              </div>
              <input className="pg-field" type="tel" value={phone}
                onChange={e => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                  let fmt = digits;
                  if (digits.length >= 7) fmt = '(' + digits.slice(0,3) + ') ' + digits.slice(3,6) + '-' + digits.slice(6);
                  else if (digits.length >= 4) fmt = '(' + digits.slice(0,3) + ') ' + digits.slice(3);
                  else if (digits.length > 0) fmt = '(' + digits;
                  setPhone(fmt);
                }}
                placeholder="(954) 000-0000" style={{height:48, fontSize:14}}/>
            </div>

            {/* Searchable region picker */}
            <div>
              <div style={{fontSize:10, fontWeight:700, letterSpacing:'0.08em', color:'var(--pg-ink-500)', marginBottom:8}}>
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
                    background:'#fff', border:'1.5px solid var(--pg-ink-200)',
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
              width:'100%', height:50, borderRadius:14, border:'none', cursor: canStep2?'pointer':'not-allowed',
              fontFamily:'inherit', fontSize:15, fontWeight:700,
              background: canStep2 ? 'linear-gradient(135deg, #0EBAC7 0%, #0D7280 100%)' : 'var(--pg-ink-200)',
              color: canStep2 ? '#fff' : 'var(--pg-ink-400)',
              boxShadow: canStep2 ? '0 6px 20px rgba(14,186,199,0.38)' : 'none',
              transition:'all .2s', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            }}>
              {loading ? <><span style={{width:16, height:16, borderRadius:'50%', border:'2.5px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', animation:'pgSpin .7s linear infinite', display:'inline-block'}}/></> : null}
              {lang==='pt'?'Criar minha conta':lang==='es'?'Crear mi cuenta':'Create my account'}
            </button>
          </>)}

          <div style={{textAlign:'center', marginTop:'auto', paddingBottom:4}}>
            <span style={{fontSize:12.5, color:'var(--pg-ink-500)'}}>{lang==='pt'?'Já tem conta? ':lang==='es'?'¿Ya tienes cuenta? ':'Already have an account? '}</span>
            <button onClick={goLogin} style={{border:'none', background:'transparent', color:'var(--pg-blue-500)',
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
