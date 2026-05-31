// quickpools.jsx — Google-Maps-style map with clickable pins + premium gate

function QuickPoolsScreen({ ctx }) {
  const { lang, user, openPaywall, openChat, openPost, openRegionEditor, regionsByDay, county } = ctx;
  const t = STRINGS[lang];
  const [selected, setSelected] = React.useState(null);
  const [highlighted, setHighlighted] = React.useState(null);
  const [applied, setApplied] = React.useState({});

  // Union of all selected cities across days (for the notif summary chip strip)
  const notifCities = React.useMemo(() => {
    const set = new Set();
    Object.values(regionsByDay || {}).forEach(arr => (arr||[]).forEach(c => set.add(c)));
    return [...set];
  }, [regionsByDay]);
  const activeDayCount = React.useMemo(
    () => Object.values(regionsByDay || {}).filter(arr => (arr||[]).length > 0).length,
    [regionsByDay]
  );

  const jobs = QUICK_POOLS;
  const cardRefs = React.useRef({});

  const scrollToJob = (id) => {
    setHighlighted(id);
    const el = cardRefs.current[id];
    if (el) el.scrollIntoView({behavior:'smooth', block:'center'});
    setTimeout(()=>setHighlighted(null), 1800);
  };

  return (
    <div style={{position:'relative', width:'100%', height:'100%', overflow:'hidden'}}>
    <div className="pg-screen" style={{paddingBottom:110, height:'100%', overflowY:'auto', background:'var(--pg-bg)'}}>
      {/* Navy header */}
      <NavyBar
        title={
          <div>
            <h1 style={{margin:0, fontFamily:'var(--pg-font-display)', fontSize:22, fontWeight:700, letterSpacing:'-0.02em'}}>{t.quickPools}</h1>
            <div style={{fontSize:11.5, opacity:0.75, marginTop:3}}>
              {lang==='pt'
                ? `Todos os trabalhos em ${county}`
                : lang==='es'
                  ? `Todos los trabajos en ${county}`
                  : `All jobs in ${county} County`}
            </div>
          </div>
        }
        right={
          <div style={{position:'relative', display:'inline-flex'}}>
            <IconButton dark onClick={() => openChat && openChat()}>
              {Icon.msg(20, '#fff')}
            </IconButton>
            <span style={{position:'absolute', top:5, right:5, width:8, height:8, borderRadius:'50%', background:'#FF3B30', border:'1.5px solid #011B5A', pointerEvents:'none'}}/>
          </div>
        }
      >
        {/* Notification regions indicator */}
        <div style={{
          marginTop:12, display:'flex', alignItems:'center', justifyContent:'space-between',
          background:'rgba(255,255,255,0.10)', borderRadius:12, padding:'10px 14px',
          backdropFilter:'blur(8px)', gap:10,
        }}>
          <div style={{minWidth:0, flex:1}}>
            <div style={{fontSize:10, opacity:0.7, letterSpacing:'0.06em', fontWeight:700, display:'flex', alignItems:'center', gap:5}}>
              {Icon.bell(11, 'rgba(255,255,255,0.85)')}
              {lang==='pt' ? 'NOTIFIC. POR DIA' : lang==='es' ? 'NOTIF. POR DÍA' : 'NOTIF. BY DAY'}
            </div>
            <div style={{fontSize:12.5, fontWeight:600, marginTop:3, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
              {notifCities.length > 0
                ? notifCities.slice(0,3).join(' · ') + (notifCities.length > 3 ? ` +${notifCities.length-3}` : '')
                : (lang==='pt'?'Nenhuma cidade configurada':lang==='es'?'Sin ciudades configuradas':'No cities set')}
            </div>
            <div style={{fontSize:10, opacity:0.6, marginTop:2}}>
              {activeDayCount}/7 {lang==='pt'?'dias ativos':lang==='es'?'días activos':'days active'}
            </div>
          </div>
          <button onClick={openRegionEditor} style={{
            border:'0.5px solid rgba(52,205,216,0.55)', background:'rgba(14,186,199,0.28)', color:'#fff',
            height:30, padding:'0 12px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer',
            display:'inline-flex', alignItems:'center', gap:5, flexShrink:0,
          }}>{Icon.cal(13, '#fff')} {t.edit}</button>
        </div>
      </NavyBar>

      {/* Real Leaflet map */}
      <div style={{padding:'14px 18px 0'}}>
        <LeafletMapBlock jobs={jobs} highlighted={highlighted} onPinClick={(j)=>scrollToJob(j.id)}/>
      </div>

      {/* Job list */}
      <div style={{padding:'14px 18px 0', display:'flex', flexDirection:'column', gap:10}}>
        <div style={{
          padding:'10px 12px', borderRadius:11, background:'var(--pg-blue-50)',
          border:'0.5px solid var(--pg-blue-100)',
          display:'flex', alignItems:'flex-start', gap:9,
        }}>
          <div style={{flexShrink:0, marginTop:1}}>{Icon.bell(14, 'var(--pg-blue-700)')}</div>
          <div style={{fontSize:11.5, color:'var(--pg-blue-700)', lineHeight:1.4}}>
            {lang==='pt'
              ? <>Mostrando <b>todos os trabalhos do condado de {county}</b>. Você só será <b>notificado</b> dos trabalhos nas cidades e dias configurados.</>
              : lang==='es'
                ? <>Mostrando <b>todos los trabajos del condado de {county}</b>. Solo recibirás <b>notificaciones</b> de trabajos en las ciudades y días configurados.</>
                : <>Showing <b>all jobs in {county} County</b>. You're only <b>notified</b> for jobs in your configured cities and days.</>}
          </div>
        </div>

        <div style={{
          fontFamily:'var(--pg-font-display)', fontSize:14, fontWeight:700,
          color:'var(--pg-ink-700)', letterSpacing:'-0.01em',
          display:'flex', alignItems:'center', justifyContent:'space-between',
        }}>
          <span>{lang==='pt'?`${jobs.length} trabalhos disponíveis`:lang==='es'?`${jobs.length} trabajos disponibles`:`${jobs.length} jobs available`}</span>
          {user.tier === 'free' && (
            <span style={{fontSize:11, color:'var(--pg-aqua-700)', display:'inline-flex', alignItems:'center', gap:4, fontWeight:600}}>
              {Icon.lock(11, 'var(--pg-aqua-700)')} {lang==='pt'?'Premium aplica':lang==='es'?'Premium postula':'Premium applies'}
            </span>
          )}
        </div>

        {jobs.map(j => {
          const isApplied = !!applied[j.id];
          const isHighlighted = highlighted === j.id;
          return (
            <article key={j.id}
              ref={el => { cardRefs.current[j.id] = el; }}
              className="pg-card pg-card-tap" onClick={()=>setSelected(j)}
              style={{
                padding:14,
                transition: 'box-shadow .25s ease, transform .25s ease',
                boxShadow: isHighlighted ? '0 0 0 2px var(--pg-aqua-500), 0 8px 20px oklch(0.72 0.14 178 / 0.25)' : 'var(--pg-shadow-1)',
              }}>
              <div style={{display:'flex', justifyContent:'space-between', gap:10, alignItems:'flex-start'}}>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:6, flexWrap:'wrap'}}>
                    {isApplied && <span className="pg-badge pg-badge-applied">✓ {t.applied}</span>}
                    <span style={{fontSize:11, color:'var(--pg-ink-500)', display:'inline-flex', alignItems:'center', gap:4}}>
                      {Icon.clock(11, 'var(--pg-ink-500)')} {tr(j.when, lang)}
                    </span>
                  </div>
                  <h3 style={{margin:0, fontFamily:'var(--pg-font-display)', fontSize:16, fontWeight:700, letterSpacing:'-0.015em', lineHeight:1.25}}>{tr(j.title, lang)}</h3>
                  <div style={{display:'flex', alignItems:'center', gap:6, marginTop:5, fontSize:12, color:'var(--pg-ink-500)'}}>
                    {Icon.pin(12, 'var(--pg-ink-500)')} {j.loc} · {tr(j.dist, lang)}
                  </div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:11, color:'var(--pg-ink-500)'}}>{j.pools} {j.pools>1?t.poolsWord:(lang==='pt'?'piscina':lang==='es'?'piscina':'pool')}</div>
                  {j.price === 'neg' ? (
                    <div style={{fontSize:14, fontWeight:700, color:'var(--pg-ink-700)', marginTop:2}}>{t.negotiable}</div>
                  ) : (
                    <>
                      <div style={{fontFamily:'var(--pg-font-display)', fontSize:20, fontWeight:700, color:'var(--pg-blue-500)', letterSpacing:'-0.02em', marginTop:2}}>${j.price}</div>
                      <div style={{fontSize:10, color:'var(--pg-ink-500)'}}>{t.perPool}</div>
                    </>
                  )}
                </div>
              </div>

              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:12}}>
                <div style={{display:'flex', alignItems:'center', gap:8, minWidth:0}}>
                  <Avatar name={j.poster} size={26}/>
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:12, fontWeight:600, color:'var(--pg-ink-700)'}}>{j.poster}</div>
                    <div style={{display:'flex', alignItems:'center', gap:3, fontSize:11, color:'var(--pg-ink-500)'}}>
                      <Stars rating={j.rating} size={9}/> {j.rating}
                    </div>
                  </div>
                </div>
                {user.tier === 'free' ? (
                  <button onClick={(e)=>{e.stopPropagation(); openPaywall();}} className="pg-btn pg-btn-outline" style={{height:34, padding:'0 12px', fontSize:12, borderRadius:999}}>
                    {Icon.lock(12, 'var(--pg-ink-700)')} {t.unlock}
                  </button>
                ) : isApplied ? (
                  <button className="pg-btn pg-btn-ghost" style={{height:34, padding:'0 14px', fontSize:13, borderRadius:999}}>
                    {Icon.check(14, 'var(--pg-blue-700)')} {t.applied}
                  </button>
                ) : (
                  <button onClick={(e)=>{e.stopPropagation(); setApplied({...applied,[j.id]:true});}}
                          className="pg-btn pg-btn-primary" style={{height:34, padding:'0 14px', fontSize:13, borderRadius:999}}>
                    {t.apply}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

    </div>{/* end .pg-screen */}

      <Sheet open={!!selected} onClose={()=>setSelected(null)} height="86%">
        {selected && (
          <QuickPoolDetails job={selected} user={user} t={t} lang={lang}
            applied={!!applied[selected.id]}
            onApply={()=>setApplied({...applied,[selected.id]:true})}
            onUnlock={openPaywall}
            onChat={openChat}
            onClose={()=>setSelected(null)}
          />
        )}
      </Sheet>
    </div>
  );
}

// ── Real interactive map with Leaflet ────────────────────────
function LeafletMapBlock({ jobs, highlighted, onPinClick }) {
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
    <div className="pg-card" style={{ height:200, overflow:'hidden', padding:0, border:'0.5px solid var(--pg-ink-200)', borderRadius:14 }}>
      <div ref={containerRef} style={{ height:'100%', width:'100%' }}/>
    </div>
  );
}

// ── Detail view ──────────────────────────────────────────────
function QuickPoolDetails({ job, user, t, lang, applied, onApply, onUnlock, onChat, onClose }) {
  const locked = user.tier === 'free';

  return (
    <div style={{padding:'8px 0 100px'}}>
      <div style={{padding:'4px 18px 0', display:'flex', justifyContent:'flex-end'}}>
        <button onClick={onClose} style={{border:'none', background:'var(--pg-ink-100)', width:30, height:30, borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
          {Icon.x(16, 'var(--pg-ink-700)')}
        </button>
      </div>

      <div style={{padding:'4px 18px 0'}}>
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
        {job.type === 'condo' && (
          <div className="pg-card" style={{padding:'12px 14px', marginTop:14, background:'#fff'}}>
            <div style={{fontSize:11, color:'var(--pg-ink-500)', fontWeight:600, letterSpacing:'0.05em', marginBottom:8}}>{t.accessDetails}</div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
              <DetailPill icon={Icon.key(14, 'var(--pg-blue-700)')} label={t.gateCode} value={locked ? '••••' : '8472*'}/>
              <DetailPill icon={Icon.user(14, 'var(--pg-blue-700)')} label={t.doorman} value={job.doorman ? t.yes : t.no}/>
              <DetailPill icon={Icon.dog(14, 'var(--pg-blue-700)')} label={t.dogLbl} value={job.dog ? t.yes : t.no}/>
              <DetailPill icon={Icon.pool(14, 'var(--pg-blue-700)')} label={t.saltwater} value={t.yes}/>
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

      <div style={{
        position:'sticky', bottom:0, padding:'12px 18px',
        background:'linear-gradient(180deg, transparent, var(--pg-white) 25%)',
        display:'flex', gap:10, marginTop:14,
      }}>
        <button onClick={()=>onChat()} disabled={locked} className="pg-btn pg-btn-ghost" style={{flex:1, opacity:locked?0.5:1, borderRadius:999}}>
          {Icon.msg(16, 'var(--pg-blue-700)')} {t.contact}
        </button>
        <button onClick={locked ? onUnlock : onApply} className={`pg-btn ${applied?'pg-btn-ghost':'pg-btn-primary'}`} style={{flex:2, borderRadius:999}}>
          {locked ? <>{Icon.lock(14, '#fff')} {t.unlockApply}</> :
           applied ? <>{Icon.check(15, 'var(--pg-blue-700)')} {t.applied}</> :
           <>{t.apply} — {t.fastTrack}</>}
        </button>
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

Object.assign(window, { QuickPoolsScreen });
