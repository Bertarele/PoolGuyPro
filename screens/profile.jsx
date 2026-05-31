// profile.jsx — personal info, subscription, my posts, settings

function ProfileScreen({ ctx }) {
  const { lang, user, setUser, openPaywall, regions, openRegionEditor,
          openLanguagePicker, openApplicants, openVerification, openPushNotif, openFeedback,
          openEditProfile, onLogout, openHelp, openPrivacy,
          darkMode, toggleDark, openChat } = ctx;
  const t = STRINGS[lang];

  const typeIcon = (type) => {
    if (type==='quickpool') return Icon.bolt(13,'var(--pg-blue-600)');
    if (type==='vacation')  return Icon.cal(13,'var(--pg-blue-600)');
    return Icon.cart(13,'var(--pg-blue-600)');
  };
  const typeLabel = (type) => {
    if (type==='quickpool') return lang==='pt'?'Piscina Rápida':lang==='es'?'Piscina Rápida':'Quick Pool';
    if (type==='vacation')  return lang==='pt'?'Férias':lang==='es'?'Vacaciones':'Vacation';
    return lang==='pt'?'Mercado':lang==='es'?'Mercado':'Marketplace';
  };

  return (
    <div style={{position:'relative', width:'100%', height:'100%', overflow:'hidden'}}>
    <div className="pg-screen" style={{paddingBottom:110, height:'100%', overflowY:'auto'}}>
      {/* Navy hero */}
      <NavyBar title={
        <div>
          <div style={{fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.50)', letterSpacing:'0.10em', textTransform:'uppercase', marginBottom:3}}>{t.myProfile}</div>
          {(() => {
            const dn = (user.name && !user.name.includes('@')) ? user.name : (user.email ? user.email.split('@')[0] : '');
            const parts = dn.split(' ');
            return (
              <div style={{fontFamily:'var(--pg-font-display)', fontSize:21, fontWeight:700, letterSpacing:'-0.025em', lineHeight:1.1}}>
                {parts[0]} <span style={{fontWeight:400, opacity:0.70}}>{parts.slice(1).join(' ')}</span>
              </div>
            );
          })()}
        </div>
      } right={
        <div style={{display:'flex', alignItems:'center', gap:6}}>
          {/* Chat */}
          <div style={{position:'relative', display:'inline-flex'}}>
            <IconButton dark onClick={() => openChat && openChat()}>
              {Icon.msg(20, '#fff')}
            </IconButton>
            <span style={{position:'absolute', top:5, right:5, width:8, height:8, borderRadius:'50%', background:'#FF3B30', border:'1.5px solid #011B5A', pointerEvents:'none'}}/>
          </div>
          {/* Dark mode toggle — always visible on mobile */}
          <button onClick={toggleDark} style={{
            width:36, height:36, borderRadius:10, border:'none', cursor:'pointer',
            background:'rgba(255,255,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center',
            transition:'background .15s',
          }} title={darkMode ? 'Light mode' : 'Dark mode'}>
            {darkMode
              ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFD60A" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            }
          </button>
          <IconButton dark onClick={openEditProfile}>{Icon.more(16,'#fff')}</IconButton>
        </div>
      }>

        {/* Avatar + info row */}
        <div style={{display:'flex', alignItems:'center', gap:14, marginTop:10}}>
          <div style={{position:'relative', flexShrink:0}}>
            <button onClick={openEditProfile} style={{
              border:'none', background:'none', padding:0, cursor:'pointer',
              borderRadius:'50%', display:'block',
            }}>
              <div style={{width:72, height:72, borderRadius:'50%', padding:3,
                background:'linear-gradient(135deg, var(--pg-aqua-500) 0%, #0077B6 100%)', position:'relative'}}>
                <Avatar name={user.name} size={66} src={user.photoUrl}/>
                {/* Camera overlay hint */}
                <div style={{
                  position:'absolute', inset:3, borderRadius:'50%',
                  background:'rgba(0,0,0,0.28)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  opacity:0, transition:'opacity .15s',
                }}
                  onMouseEnter={e=>e.currentTarget.style.opacity=1}
                  onMouseLeave={e=>e.currentTarget.style.opacity=0}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                </div>
              </div>
            </button>
            <div style={{position:'absolute', bottom:1, right:1, width:22, height:22, borderRadius:'50%',
              background:'var(--pg-aqua-500)', border:'2.5px solid #011B5A',
              display:'flex', alignItems:'center', justifyContent:'center'}}>
              {Icon.check(12,'#fff')}
            </div>
          </div>
          <div style={{flex:1, minWidth:0}}>
            <div style={{display:'flex', alignItems:'center', gap:7, flexWrap:'wrap'}}>
              {user.tier==='pro'     && <span className="pg-badge pg-badge-pro" style={{fontSize:10}}>PRO</span>}
              {user.tier==='premium' && <span className="pg-badge pg-badge-premium" style={{fontSize:10}}>{Icon.crown(10,'#92400E')} PREMIUM</span>}
              <ReputationBadge jobs={user.reviews} lang={lang} size="lg"/>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:6, marginTop:6}}>
              <Stars rating={user.rating} size={13}/>
              <span style={{fontSize:13, fontWeight:600, opacity:0.90}}>{user.rating}</span>
              <span style={{fontSize:12, opacity:0.55}}>({user.reviews} {lang==='pt'?'avaliações':lang==='es'?'reseñas':'reviews'})</span>
            </div>
            <div style={{marginTop:5, display:'flex', alignItems:'center', gap:5, opacity:0.55}}>
              {Icon.pin(10,'rgba(255,255,255,0.7)')}
              <span style={{fontSize:11}}>Broward County, FL</span>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{display:'flex', marginTop:14, paddingTop:13, borderTop:'1px solid rgba(255,255,255,0.12)'}}>
          {[
            { val: user.rating, lbl: lang==='pt'?'Avaliação':lang==='es'?'Calificación':'Rating' },
            { val: user.reviews, lbl: lang==='pt'?'Trabalhos':lang==='es'?'Trabajos':'Jobs Done' },
            { val: EQUIPMENT.filter(e=>e).length + POOL_ROUTES.length, lbl: lang==='pt'?'Anúncios':lang==='es'?'Anuncios':'Listings' },
          ].map((s, i, arr) => (
            <React.Fragment key={i}>
              <div style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3}}>
                <div style={{fontFamily:'var(--pg-font-display)', fontSize:20, fontWeight:700, lineHeight:1, color:'#fff', letterSpacing:'-0.02em'}}>
                  {s.val}
                </div>
                <div style={{fontSize:9.5, color:'rgba(255,255,255,0.50)', fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase'}}>
                  {s.lbl}
                </div>
              </div>
              {i < arr.length - 1 && <div style={{width:1, background:'rgba(255,255,255,0.15)', margin:'0 4px'}}/>}
            </React.Fragment>
          ))}
        </div>
      </NavyBar>

      <div style={{padding:'0 18px', marginTop:-2, display:'flex', flexDirection:'column', gap:14}}>
        {/* Subscription */}
        <SubscriptionCard user={user} setUser={setUser} openPaywall={openPaywall} t={t}/>

        {/* Regions */}
        <Section title={t.workRegions} action={t.edit} onAction={openRegionEditor}>
          <div className="pg-card" style={{padding:'12px 14px'}}>
            {regions && regions.length > 0 ? (
              <div style={{display:'flex', flexWrap:'wrap', gap:6}}>
                {regions.slice(0,8).map(r => (
                  <span key={r} className="pg-chip pg-chip-aqua" style={{padding:'5px 10px', fontSize:12}}>
                    {Icon.pin(11,'var(--pg-aqua-700)')} {r}
                  </span>
                ))}
                {regions.length>8 && <span className="pg-chip" style={{padding:'5px 10px', fontSize:12}}>+{regions.length-8}</span>}
              </div>
            ) : (
              <button onClick={openRegionEditor} style={{border:'none', background:'transparent', color:'var(--pg-blue-500)', fontSize:13, fontWeight:600, cursor:'pointer', padding:0}}>
                {Icon.plus(13,'var(--pg-blue-500)')} {t.add}
              </button>
            )}
          </div>
        </Section>

        {/* My Posts */}
        <Section title={t.myPosts}>
          <div className="pg-card" style={{padding:0, overflow:'hidden'}}>
            {MY_POSTS.length === 0 ? (
              <div style={{padding:'16px 14px', fontSize:13, color:'var(--pg-ink-500)'}}>{t.noPostsYet}</div>
            ) : MY_POSTS.map((post, idx) => {
              const pendingCount = post.applicants.filter(a=>a.status==='pending').length;
              const isLast = idx === MY_POSTS.length - 1;
              return (
                <div key={post.id} style={{
                  display:'flex', alignItems:'center', gap:12, padding:'12px 14px',
                  borderBottom: isLast ? 'none' : '0.5px solid var(--pg-ink-100)',
                }}>
                  <div style={{
                    width:36, height:36, borderRadius:9, background:'var(--pg-blue-100)',
                    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                  }}>{typeIcon(post.type)}</div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', letterSpacing:'-0.01em'}}>
                      {tr(post.title, lang)}
                    </div>
                    <div style={{fontSize:11, color:'var(--pg-ink-500)', marginTop:2, display:'flex', alignItems:'center', gap:6}}>
                      <span style={{background:'var(--pg-ink-100)', borderRadius:5, padding:'1px 6px', fontSize:10, fontWeight:600, color:'var(--pg-ink-600)'}}>
                        {typeLabel(post.type)}
                      </span>
                      {Icon.pin(10,'var(--pg-ink-400)')} {post.loc}
                    </div>
                  </div>
                  <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:5, flexShrink:0}}>
                    {pendingCount > 0 && (
                      <span style={{fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:8, background:'var(--pg-blue-500)', color:'#fff'}}>
                        {pendingCount} new
                      </span>
                    )}
                    <button onClick={()=>openApplicants && openApplicants(post)} style={{
                      border:'none', background:'var(--pg-blue-100)', color:'var(--pg-blue-700)',
                      fontSize:11, fontWeight:700, padding:'5px 10px', borderRadius:8, cursor:'pointer',
                      fontFamily:'inherit', display:'flex', alignItems:'center', gap:4,
                    }}>
                      {t.applicantsPanelTitle} {Icon.chev(11,'var(--pg-blue-600)')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* Settings */}
        <Section title={t.settings}>
          <div className="pg-card" style={{padding:0}}>
            {/* Dark Mode — first row, most visible */}
            <SettingRow
              icon={darkMode
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--pg-blue-500)" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              }
              label={lang==='pt'?'Modo Escuro':lang==='es'?'Modo Oscuro':'Dark Mode'}
              right={
                <div
                  onClick={e=>{ e.stopPropagation(); toggleDark && toggleDark(); }}
                  className={'pg-toggle' + (darkMode ? ' on' : '')}
                  style={{flexShrink:0}}
                />
              }
              onClick={toggleDark}
            />
            <SettingRow icon={Icon.bell(18,'var(--pg-blue-500)')} label={t.notifications} detail={t.on} chev onClick={openPushNotif}/>
            <SettingRow icon={Icon.globe(18,'var(--pg-blue-500)')} label={t.languageLbl}
              detail={({en:t.english, pt:t.portuguese, es:t.spanish})[lang]} chev
              onClick={openLanguagePicker}/>
            <SettingRow icon={Icon.shield(18,'var(--pg-blue-500)')} label={t.verification} detail={t.verified} chev onClick={openVerification}/>
            <SettingRow icon={Icon.msg(18,'var(--pg-blue-500)')} label={t.helpSupport} chev onClick={openHelp}/>
            <SettingRow
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--pg-blue-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
              label={lang==='pt'?'Enviar Feedback':lang==='es'?'Enviar Feedback':'Send Feedback'}
              detail={lang==='pt'?'Beta':'Beta'}
              chev onClick={openFeedback}/>
            <SettingRow icon={Icon.lock(18,'var(--pg-blue-500)')} label={t.privacy} chev last onClick={openPrivacy}/>
          </div>
        </Section>

        {/* Admin Panel button — only for admins */}
        {user.role === 'admin' && (
          <button onClick={() => window.open('admin.html', '_blank')} style={{
            width:'100%', padding:'13px 14px', borderRadius:12, marginBottom:10,
            border:'1px solid rgba(14,186,199,0.35)',
            background:'linear-gradient(135deg, rgba(14,186,199,0.12), rgba(13,114,128,0.08))',
            color:'#0EBAC7', fontWeight:700, fontSize:14,
            cursor:'pointer', fontFamily:'inherit',
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            {lang==='pt' ? 'Painel Admin' : lang==='es' ? 'Panel Admin' : 'Admin Panel'}
          </button>
        )}

        <button onClick={onLogout} style={{
          width:'100%', padding:'13px 14px', borderRadius:12, border:'1px solid var(--pg-ink-200)',
          background:'transparent', color:'var(--pg-danger)', fontWeight:600, fontSize:14,
          cursor:'pointer', fontFamily:'inherit',
        }}>{t.logout}</button>

        <div style={{textAlign:'center', fontSize:11, color:'var(--pg-ink-400)', marginTop:4}}>
          PoolGuyPro · v2.5.0
        </div>
      </div>
    </div>
    </div>
  );
}

function SubscriptionCard({ user, setUser, openPaywall, t }) {
  const tiers = [
    { id:'free',    name:t.free },
    { id:'premium', name:t.premium },
    { id:'pro',     name:'PRO' },
  ];
  return (
    <div className="pg-card" style={{padding:14, background:'linear-gradient(135deg,var(--pg-navy-900),var(--pg-blue-600))', color:'#fff', border:'none', position:'relative', overflow:'hidden'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
        <div>
          <div style={{fontSize:11, opacity:0.7, letterSpacing:'0.08em', fontWeight:600}}>{t.subscription}</div>
          <div style={{fontFamily:'var(--pg-font-display)', fontSize:18, fontWeight:700, marginTop:4, letterSpacing:'-0.01em', display:'flex', alignItems:'center', gap:8}}>
            {user.tier==='pro'     && <>{Icon.crown(18,'var(--pg-aqua-400)')} {t.poolguyPro}</>}
            {user.tier==='premium' && <>{Icon.crown(16,'var(--pg-aqua-400)')} {t.premium}</>}
            {user.tier==='free'    && <>{t.free}</>}
          </div>
          <div style={{fontSize:12, opacity:0.7, marginTop:4}}>
            {user.tier==='free' ? t.upgradeQp : `${t.renews} 26/05 · $9.99/mo`}
          </div>
        </div>
        {user.tier!=='free' && Icon.crown(28,'oklch(0.85 0.15 90)')}
      </div>
      <div style={{display:'flex', gap:6, marginTop:14}}>
        {tiers.map(tier => (
          <button key={tier.id} onClick={()=>setUser(u=>({...u,tier:tier.id}))} style={{
            flex:1, padding:'8px 6px', borderRadius:10,
            background:user.tier===tier.id?'rgba(255,255,255,0.18)':'rgba(255,255,255,0.06)',
            border:'1px solid '+(user.tier===tier.id?'rgba(255,255,255,0.35)':'transparent'),
            color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
          }}>{tier.name}</button>
        ))}
      </div>
      {user.tier==='free' && (
        <button onClick={openPaywall} className="pg-btn pg-btn-aqua" style={{width:'100%', height:42, fontSize:14, marginTop:10}}>
          {t.comparePlans}
        </button>
      )}
    </div>
  );
}

function Section({ title, action, onAction, children }) {
  return (
    <section>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:8}}>
        <h3 style={{margin:0, fontWeight:700, color:'var(--pg-ink-700)', letterSpacing:'-0.01em', textTransform:'uppercase', fontSize:11}}>{title}</h3>
        {action && <button onClick={onAction} style={{border:'none', background:'transparent', color:'var(--pg-blue-500)', fontSize:13, fontWeight:600, cursor:'pointer'}}>{action}</button>}
      </div>
      {children}
    </section>
  );
}

function SettingRow({ icon, label, detail, chev, last, onClick, right }) {
  return (
    <div onClick={onClick} style={{
      display:'flex', alignItems:'center', gap:12, padding:'13px 14px',
      borderBottom: last ? 'none' : '0.5px solid var(--pg-ink-200)',
      cursor: onClick ? 'pointer' : 'default',
    }}>
      <div style={{width:32, height:32, borderRadius:8, background:'var(--pg-blue-100)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>{icon}</div>
      <div style={{flex:1, fontSize:14, fontWeight:500, color:'var(--pg-ink-900)'}}>{label}</div>
      {detail && <div style={{fontSize:13, color:'var(--pg-ink-500)'}}>{detail}</div>}
      {right}
      {chev && Icon.chev(14,'var(--pg-ink-400)')}
    </div>
  );
}

Object.assign(window, { ProfileScreen });
