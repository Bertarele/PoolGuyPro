// brand.jsx — wordmark, illustrative product imagery, region editor

// ── Flood Level icon — shared brand icon (inline SVG, no img dependency) ──
function FloodMark({ size = 36 }) {
  const u = 'bm';
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"
      style={{display:'block', flexShrink:0}}>
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
}

// ── Brand wordmark ────────────────────────────────────────────
function Wordmark({ size='md', onDark=false, subtitle }) {
  const h = size === 'lg' ? 160 : size === 'sm' ? 85 : size === 'nav' ? 130 : 120;
  const subtitleSize = size === 'lg' ? 11 : size === 'sm' ? 9 : size === 'nav' ? 9 : 10;

  return (
    <div style={{display:'flex', flexDirection:'column', alignItems:'flex-start', gap:3}}>
      <img
        src={onDark ? 'wordmarkwhite.png' : 'pgx-logo.png'}
        alt="PoolGuyX"
        style={{
          height: h,
          width: 'auto',
          display: 'block',
          filter: onDark
            ? 'drop-shadow(0 2px 12px rgba(0,0,0,0.35))'
            : 'drop-shadow(0 2px 6px rgba(0,0,0,0.12))',
        }}
      />
      {subtitle && (
        <div style={{
          fontSize: subtitleSize,
          fontWeight: 500,
          color: onDark ? 'rgba(255,255,255,0.65)' : 'var(--pg-ink-500)',
          letterSpacing: '0.005em',
          lineHeight: 1.3,
          paddingLeft: 2,
        }}>{subtitle}</div>
      )}
    </div>
  );
}

// ── Header theme helper (shared by all screen headers) ────────
function headerTheme(dark) {
  return dark ? {
    text:    '#ffffff',
    sub:     'rgba(255,255,255,0.50)',
    mid:     'rgba(255,255,255,0.80)',
    faint:   'rgba(255,255,255,0.55)',
    iconBg:  'rgba(255,255,255,0.12)',
    iconC:   'rgba(255,255,255,0.88)',
    border:  'rgba(255,255,255,0.12)',
    divider: 'rgba(255,255,255,0.15)',
    cntyBg:  'rgba(0,119,182,0.25)',
    cntyBdr: '1px solid rgba(0,119,182,0.40)',
    cntyTxt: 'rgba(255,255,255,0.85)',
    cntyIc:  'rgba(255,255,255,0.70)',
    editIc:  'rgba(255,255,255,0.55)',
    wave1:   'rgba(255,255,255,0.12)',
    wave2:   'rgba(255,255,255,0.06)',
    glow:    'radial-gradient(circle, rgba(14,186,199,0.10) 0%, transparent 70%)',
    ring1:   'rgba(14,186,199,0.08)',
    ring2:   'rgba(14,186,199,0.05)',
    blob:    'rgba(14,186,199,0.05)',
    backBtn: 'rgba(255,255,255,0.13)',
    activeBg:'rgba(255,255,255,0.15)',
    activeBdr:'1px solid rgba(255,255,255,0.25)',
    activeTxt:'rgba(255,255,255,0.90)',
  } : {
    text:    '#0A2840',
    sub:     'rgba(10,40,64,0.50)',
    mid:     'rgba(10,40,64,0.82)',
    faint:   'rgba(10,40,64,0.58)',
    iconBg:  'rgba(10,40,64,0.09)',
    iconC:   'rgba(10,40,64,0.72)',
    border:  'rgba(10,40,64,0.10)',
    divider: 'rgba(10,40,64,0.12)',
    cntyBg:  'rgba(0,119,182,0.11)',
    cntyBdr: '1px solid rgba(0,119,182,0.28)',
    cntyTxt: '#0A2840',
    cntyIc:  'rgba(0,119,182,0.65)',
    editIc:  'rgba(10,40,64,0.38)',
    wave1:   'rgba(10,40,64,0.06)',
    wave2:   'rgba(10,40,64,0.03)',
    glow:    'radial-gradient(circle, rgba(0,119,182,0.10) 0%, transparent 70%)',
    ring1:   'rgba(0,119,182,0.09)',
    ring2:   'rgba(0,119,182,0.05)',
    blob:    'rgba(0,119,182,0.05)',
    backBtn: 'rgba(10,40,64,0.10)',
    activeBg:'rgba(0,119,182,0.10)',
    activeBdr:'1px solid rgba(0,119,182,0.22)',
    activeTxt:'#0A2840',
  };
}

// ── App bar (light/dark responsive) ───────────────────────────
function NavyBar({ title, leftBack, onBack, right, children, wave=true, darkMode=true, bgOverride=null, centerDecor=null }) {
  const H = headerTheme(darkMode);
  const bg = bgOverride || (darkMode
    ? 'linear-gradient(145deg, #040D18 0%, #071A2E 52%, #0A2840 100%)'
    : 'linear-gradient(145deg, #f0f9ff 0%, #dff0fb 52%, #cce8f5 100%)');

  return (
    <div style={{
      background: bg,
      color: H.text,
      padding: wave ? '2px 18px 4px' : '12px 18px 10px', position:'relative', overflow:'hidden',
    }}>
      {/* Aqua glow top-right */}
      <div style={{position:'absolute', top:-60, right:-60, width:200, height:200, borderRadius:'50%',
        background:H.glow, pointerEvents:'none'}}/>
      {/* Decorative circles — subtle brand texture */}
      <div style={{position:'absolute', top:-55, right:-55, width:190, height:190, borderRadius:'50%', border:`1px solid ${H.ring1}`, pointerEvents:'none'}}/>
      <div style={{position:'absolute', top:12, right:22, width:108, height:108, borderRadius:'50%', border:`1px solid ${H.ring2}`, pointerEvents:'none'}}/>
      <div style={{position:'absolute', bottom:-35, left:-35, width:130, height:130, borderRadius:'50%', background:H.blob, pointerEvents:'none'}}/>

      {/* Center decoration */}
      {centerDecor && <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none', zIndex:0}}>{centerDecor}</div>}

      {/* Title row */}
      <div style={{position:'relative', zIndex:1, display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, minHeight:44}}>
        <div style={{display:'flex', alignItems:'center', gap:10, flex:1, minWidth:0}}>
          {leftBack && (
            <button onClick={onBack} style={{
              border:'none', background:H.backBtn, width:36, height:36,
              borderRadius:'50%', cursor:'pointer', color:H.text,
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
              backdropFilter:'blur(8px)',
            }}>{Icon.chev(18, H.text, 'left')}</button>
          )}
          {typeof title === 'string'
            ? <h1 style={{margin:0, fontFamily:'var(--pg-font-display)', fontSize:22, fontWeight:700, letterSpacing:'-0.02em', color:H.text}}>{title}</h1>
            : title}
        </div>
        <div style={{display:'flex', alignItems:'center', gap:8, position:'relative', zIndex:2}}>{right}</div>
      </div>

      {/* Children content */}
      {children && <div style={{position:'relative', zIndex:1}}>{children}</div>}

      {/* Wave accent at the bottom */}
      {wave && (
        <div style={{position:'absolute', bottom:0, left:0, right:0, lineHeight:0, pointerEvents:'none', zIndex:0}}>
          <svg viewBox="0 0 402 20" width="100%" height="20" preserveAspectRatio="none">
            <path d="M0 14 Q80 5 160 14 Q240 23 320 14 Q368 8 402 16 L402 20 L0 20 Z" fill={H.wave1}/>
            <path d="M0 17 Q120 11 240 17 Q320 21 402 18 L402 20 L0 20 Z" fill={H.wave2}/>
          </svg>
        </div>
      )}
    </div>
  );
}

// ── No-photo placeholder — shown when a listing has no uploaded image ──
function NoPhotoPlaceholder({ height = 108, small = false }) {
  const iconSize = small ? 22 : 32;
  return (
    <div style={{
      height, display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', gap: small ? 4 : 7,
      background:'linear-gradient(135deg, var(--pg-blue-600,#2563eb) 0%, var(--pg-blue-800,#1e3a6e) 100%)',
      userSelect:'none', position:'relative', overflow:'hidden',
    }}>
      {/* Subtle wave decoration */}
      <svg viewBox="0 0 200 60" style={{position:'absolute',bottom:0,left:0,right:0,width:'100%',opacity:0.12}} preserveAspectRatio="none">
        <path d="M0 30 Q50 0 100 30 Q150 60 200 30 L200 60 L0 60 Z" fill="#fff"/>
      </svg>
      {/* Pool / camera icon */}
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none"
        stroke="rgba(255,255,255,0.75)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="7" width="18" height="13" rx="2"/>
        <circle cx="12" cy="13.5" r="3"/>
        <path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7"/>
        <line x1="17" y1="11" x2="17.01" y2="11"/>
      </svg>
      {!small && (
        <div style={{fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.45)', letterSpacing:'0.08em', textTransform:'uppercase', position:'relative'}}>
          No photo
        </div>
      )}
    </div>
  );
}

// ── Equipment imagery — real pool-equipment photos via loremflickr ──
function EquipImg({ category, height=108 }) {
  const [loaded, setLoaded] = React.useState(false);

  // loremflickr returns real Flickr CC photos matched to keywords.
  // ?lock=N makes the result deterministic (same photo every load).
  const photoUrls = {
    Pumps:   'https://loremflickr.com/800/480/pool,pump,motor?lock=11',
    Filters: 'https://loremflickr.com/800/480/pool,filter,sand?lock=22',
    Vacuum:  'https://loremflickr.com/800/480/pool,vacuum,cleaner?lock=33',
    Heaters: 'https://loremflickr.com/800/480/pool,heater?lock=44',
    Tools:   'https://loremflickr.com/800/480/pool,maintenance,pole?lock=55',
    Routes:  'https://loremflickr.com/800/480/swimming,pool?lock=66',
  };
  const tints = {
    Pumps:   'oklch(0.30 0.16 245 / 0.15)',
    Filters: 'oklch(0.28 0.13 178 / 0.14)',
    Vacuum:  'oklch(0.22 0.12 250 / 0.15)',
    Heaters: 'oklch(0.38 0.15 45  / 0.14)',
    Tools:   'oklch(0.28 0.04 240 / 0.10)',
    Routes:  'oklch(0.28 0.13 200 / 0.14)',
  };

  const url  = photoUrls[category] || photoUrls.Tools;
  const tint = tints[category]     || tints.Tools;

  return (
    <div style={{ height, position:'relative', overflow:'hidden', background:'#d6dfe8' }}>
      <img
        src={url}
        alt={category}
        onLoad={() => setLoaded(true)}
        style={{
          width:'100%', height:'100%', objectFit:'cover', display:'block',
          transition:'opacity .45s ease', opacity: loaded ? 1 : 0,
        }}
      />
      {!loaded && (
        <div style={{
          position:'absolute', inset:0,
          background:'linear-gradient(110deg, #d0d9e2 30%, #dde5ec 50%, #d0d9e2 70%)',
        }}/>
      )}
      <div style={{ position:'absolute', inset:0, background:tint, pointerEvents:'none' }}/>
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg, transparent 45%, rgba(0,0,0,0.28) 100%)', pointerEvents:'none' }}/>
      <span style={{
        position:'absolute', bottom:7, right:10, fontSize:9, fontWeight:700,
        color:'rgba(255,255,255,0.88)', letterSpacing:'0.10em',
        fontFamily:'ui-monospace,"SF Mono",monospace',
        textShadow:'0 1px 3px rgba(0,0,0,0.5)',
      }}>{category.toUpperCase()}</span>
    </div>
  );
}

// ── Region editor sheet ───────────────────────────────────────
const FL_COUNTIES = {
  'Broward':      ['Coconut Creek','Cooper City','Coral Springs','Dania Beach','Davie','Deerfield Beach','Fort Lauderdale','Hallandale Beach','Hillsboro Beach','Hollywood','Lauderdale Lakes','Lauderdale-by-the-Sea','Lauderhill','Lighthouse Point','Margate','Miramar','North Lauderdale','Oakland Park','Parkland','Pembroke Park','Pembroke Pines','Plantation','Pompano Beach','Sea Ranch Lakes','Southwest Ranches','Sunrise','Tamarac','Weston','Wilton Manors'],
  'Miami-Dade':   ['Aventura','Bal Harbour','Bay Harbor Islands','Biscayne Park','Coral Gables','Cutler Bay','Doral','El Portal','Florida City','Golden Beach','Hialeah','Hialeah Gardens','Homestead','Indian Creek','Islandia','Key Biscayne','Medley','Miami','Miami Beach','Miami Gardens','Miami Lakes','Miami Shores','Miami Springs','North Bay Village','North Miami','North Miami Beach','Opa-locka','Palmetto Bay','Pinecrest','South Miami','Sunny Isles Beach','Surfside','Sweetwater','Virginia Gardens','West Miami','Kendall','Westchester','Dade City'],
  'Palm Beach':   ['Atlantis','Belle Glade','Boca Raton','Boynton Beach','Briny Breezes','Cloud Lake','Delray Beach','Glen Ridge','Golf','Greenacres','Gulf Stream','Haverhill','Highland Beach','Hypoluxo','Juno Beach','Jupiter','Jupiter Inlet Colony','Lake Clarke Shores','Lake Park','Lake Worth Beach','Lantana','Manalapan','Mangonia Park','North Palm Beach','Ocean Ridge','Pahokee','Palm Beach','Palm Beach Gardens','Palm Beach Shores','Palm Springs','Riviera Beach','Royal Palm Beach','South Bay','South Palm Beach','Tequesta','Wellington','West Palm Beach'],
  'Orange':       ['Apopka','Bay Lake','Belle Isle','Eatonville','Edgewood','Lake Buena Vista','Maitland','Oakland','Ocoee','Orlando','Orlovista','Pine Castle','Windermere','Winter Garden','Winter Park','Zellwood','Kissimmee','St. Cloud','Celebration'],
  'Hillsborough': ['Brandon','Carrollwood','Citrus Park','Dover','Egypt Lake-Leto','Gibsonton','Keystone','Lutz','Mango','Northdale','Plant City','Riverview','Ruskin','Sun City Center','Tampa','Temple Terrace','Town N Country','Valrico','Westchase','Wimauma'],
  'Pinellas':     ['Bellair Beach','Bellair Bluffs','Clearwater','Dunedin','Gulfport','Indian Rocks Beach','Indian Shores','Kenneth City','Largo','Madeira Beach','North Redington Beach','Oldsmar','Pinellas Park','Redington Beach','Redington Shores','Safety Harbor','St. Pete Beach','St. Petersburg','Seminole','South Pasadena','Tarpon Springs','Treasure Island','Tierra Verde'],
  'Collier':      ['Ave Maria','Everglades City','Marco Island','Naples','Golden Gate'],
  'Lee':          ['Bonita Springs','Cape Coral','Estero','Fort Myers','Fort Myers Beach','Sanibel','Captiva','Lehigh Acres'],
  'Sarasota':     ['Englewood','Longboat Key','North Port','Osprey','Sarasota','Venice'],
  'Manatee':      ['Anna Maria','Bradenton','Bradenton Beach','Holmes Beach','Palmetto','Longboat Key'],
  'Volusia':      ['Daytona Beach','Daytona Beach Shores','DeBary','DeLand','Deltona','Edgewater','Holly Hill','Lake Helen','New Smyrna Beach','Orange City','Ormond Beach','Pierson','Port Orange','Ponce Inlet','South Daytona'],
  'Brevard':      ['Cape Canaveral','Cocoa','Cocoa Beach','Indialantic','Indian Harbour Beach','Melbourne','Melbourne Beach','Mims','Palm Bay','Rockledge','Satellite Beach','Titusville','West Melbourne'],
  'Seminole':     ['Altamonte Springs','Casselberry','Lake Mary','Longwood','Oviedo','Sanford','Winter Springs'],
  'Duval':        ['Atlantic Beach','Baldwin','Jacksonville','Jacksonville Beach','Neptune Beach'],
  'Alachua':      ['Alachua','Archer','Gainesville','High Springs','Hawthorne','Micanopy','Waldo'],
  'Leon':         ['Tallahassee'],
  'Escambia':     ['Century','Pensacola','Cantonment'],
  'Okaloosa':     ['Crestview','Destin','Fort Walton Beach','Niceville','Shalimar','Valparaiso','Mary Esther'],
  'Bay':          ['Callaway','Lynn Haven','Mexico Beach','Panama City','Panama City Beach','Parker','Springfield'],
  'St. Johns':    ['Hastings','Ponte Vedra Beach','St. Augustine','St. Augustine Beach'],
  'Polk':         ['Auburndale','Bartow','Davenport','Dundee','Haines City','Lake Alfred','Lake Hamilton','Lake Wales','Lakeland','Mulberry','Winter Haven'],
  'Lake':         ['Clermont','Eustis','Groveland','Howey-in-the-Hills','Lady Lake','Leesburg','Mascotte','Minneola','Montverde','Mount Dora','Tavares','Umatilla'],
  'Marion':       ['Belleview','Dunnellon','McIntosh','Ocala','Reddick'],
  'St. Lucie':    ['Fort Pierce','Port St. Lucie','St. Lucie Village'],
  'Indian River': ['Fellsmere','Indian River Shores','Orchid','Sebastian','Vero Beach'],
  'Martin':       ['Jupiter Island','Ocean Breeze','Palm City','Sewall\'s Point','Stuart'],
  'Monroe':       ['Key Largo','Key West','Islamorada','Marathon','Big Pine Key','Tavernier'],
  'Charlotte':    ['Punta Gorda'],
  'Hernando':     ['Brooksville','Weeki Wachee'],
  'Pasco':        ['Dade City','New Port Richey','Port Richey','San Antonio','Zephyrhills'],
  'Citrus':       ['Crystal River','Inverness'],
  'Flagler':      ['Bunnell','Flagler Beach','Marineland'],
  'Putnam':       ['Crescent City','Interlachen','Palatka'],
  'Clay':         ['Green Cove Springs','Keystone Heights','Orange Park'],
  'Nassau':       ['Callahan','Fernandina Beach','Hilliard','Yulee'],
  'Osceola':      ['Kissimmee','St. Cloud','Celebration','Poinciana'],
  'Sumter':       ['Bushnell','Coleman','Center Hill','Webster','The Villages'],
  'Gilchrist':    ['Trenton'],
  'Levy':         ['Cedar Key','Chiefland','Inglis','Williston','Yankeetown'],
  'Columbia':     ['Fort White','Lake City'],
  'Suwannee':     ['Branford','Live Oak'],
  'Hamilton':     ['Jasper','White Springs'],
};

function RegionEditorSheet({ open, onClose, lang='en', regionsByDay, setRegionsByDay, county }) {
  const t = STRINGS[lang];
  const [openDay, setOpenDay] = React.useState('mon');
  const [activeCounty, setActiveCounty] = React.useState(county || 'Broward');

  const dayKeys   = ['mon','tue','wed','thu','fri','sat','sun'];
  const dayShort  = lang==='pt'?['Seg','Ter','Qua','Qui','Sex','Sáb','Dom']
                  : lang==='es'?['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']
                  : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const dayFull   = lang==='pt'?['Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado','Domingo']
                  : lang==='es'?['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo']
                  : ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

  const toggleCityForDay = (day, city) => {
    setRegionsByDay(prev => {
      const cur = prev[day] || [];
      const next = cur.includes(city) ? cur.filter(c => c !== city) : [...cur, city];
      return { ...prev, [day]: next };
    });
  };
  const clearDay = (day) => {
    setRegionsByDay(prev => ({ ...prev, [day]: [] }));
  };

  const head = {
    title: lang==='pt'?'Regiões por dia':lang==='es'?'Regiones por día':'Regions by day',
    desc: lang==='pt'
      ? 'Para cada dia da semana, escolha as cidades onde você quer receber notificações de trabalho.'
      : lang==='es'
        ? 'Para cada día de la semana, elige las ciudades donde quieres recibir notificaciones de trabajo.'
        : 'For each weekday, choose the cities where you want to receive job notifications.',
    countyT: lang==='pt'?'Condado':lang==='es'?'Condado':'County',
    citiesT: lang==='pt'?'Cidades':lang==='es'?'Ciudades':'Cities',
    selected: lang==='pt'?'cidades':lang==='es'?'ciudades':'cities',
    none: lang==='pt'?'Nenhuma — sem notificações':lang==='es'?'Ninguna — sin notificaciones':'None — no notifications',
    save: lang==='pt'?'Salvar':lang==='es'?'Guardar':'Save',
    clearLbl: lang==='pt'?'Limpar':lang==='es'?'Limpiar':'Clear',
    pickCities: lang==='pt'?'Escolha as cidades':lang==='es'?'Elige las ciudades':'Pick cities',
  };

  return (
    <Sheet open={open} onClose={onClose} height="92%">
      <div style={{display:'flex', flexDirection:'column', height:'100%'}}>
        {/* Header */}
        <div style={{padding:'4px 18px 14px', borderBottom:'0.5px solid var(--pg-ink-200)'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6}}>
            <h2 style={{margin:0, fontSize:18, fontWeight:700, letterSpacing:'-0.02em'}}>{head.title}</h2>
            <button onClick={onClose} style={{
              border:'none', background:'var(--pg-ink-100)', width:30, height:30,
              borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
            }}>{Icon.x(16, 'var(--pg-ink-700)')}</button>
          </div>
          <div style={{fontSize:12, color:'var(--pg-ink-500)', lineHeight:1.4}}>{head.desc}</div>
        </div>

        {/* Scroll body */}
        <div style={{flex:1, overflow:'auto', padding:'12px 18px 0'}}>
          <div style={{display:'flex', flexDirection:'column', gap:8}}>
            {dayKeys.map((dk, i) => {
              const cities = regionsByDay[dk] || [];
              const isOpen = openDay === dk;
              return (
                <div key={dk} className="pg-card" style={{padding:0, overflow:'hidden'}}>
                  <button onClick={()=>setOpenDay(isOpen ? null : dk)} style={{
                    display:'flex', alignItems:'center', gap:12, padding:'12px 14px',
                    border:'none', background:'transparent', width:'100%', cursor:'pointer',
                    textAlign:'left', fontFamily:'inherit',
                  }}>
                    <div style={{
                      width:42, height:42, borderRadius:11,
                      background: cities.length>0
                        ? 'linear-gradient(135deg, var(--pg-aqua-500), var(--pg-aqua-700))'
                        : 'var(--pg-ink-100)',
                      color: cities.length>0 ? '#fff' : 'var(--pg-ink-500)',
                      display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                      fontFamily:'var(--pg-font-display)', fontSize:13, fontWeight:700, letterSpacing:'-0.01em',
                      transition:'all .15s ease',
                      boxShadow: cities.length>0 ? '0 3px 8px rgba(14,186,199,0.35)' : 'none',
                    }}>{dayShort[i]}</div>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontSize:14, fontWeight:600, color:'var(--pg-ink-900)'}}>{dayFull[i]}</div>
                      <div style={{fontSize:12, color: cities.length>0 ? 'var(--pg-aqua-700)' : 'var(--pg-ink-500)', marginTop:2, lineHeight:1.35,
                        display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'}}>
                        {cities.length === 0 ? head.none : cities.join(' · ')}
                      </div>
                    </div>
                    <div style={{transform: isOpen ? 'rotate(90deg)' : 'rotate(0)', transition:'transform .2s ease', flexShrink:0}}>
                      {Icon.chev(16, 'var(--pg-ink-500)')}
                    </div>
                  </button>

                  {isOpen && (
                    <div style={{padding:'4px 14px 14px', borderTop:'0.5px solid var(--pg-ink-200)'}}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', margin:'10px 0 8px'}}>
                        <div style={{fontSize:10, color:'var(--pg-ink-500)', fontWeight:700, letterSpacing:'0.06em'}}>
                          {head.pickCities.toUpperCase()}
                        </div>
                        {cities.length > 0 && (
                          <button onClick={()=>clearDay(dk)} style={{
                            border:'none', background:'transparent', color:'var(--pg-ink-500)',
                            fontSize:11, fontWeight:600, cursor:'pointer', padding:'2px 6px',
                          }}>{head.clearLbl}</button>
                        )}
                      </div>
                      <div className="pg-scroll-x" style={{display:'flex', gap:6, marginLeft:-14, marginRight:-14, padding:'0 14px 6px'}}>
                        {Object.keys(FL_COUNTIES).map(c => (
                          <button key={c} onClick={()=>setActiveCounty(c)} className={`pg-chip ${activeCounty===c?'pg-chip-on':''}`} style={{fontSize:11, padding:'5px 10px'}}>
                            {c}
                          </button>
                        ))}
                      </div>
                      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginTop:8}}>
                        {FL_COUNTIES[activeCounty].map(city => {
                          const on = cities.includes(city);
                          return (
                            <button key={city} onClick={()=>toggleCityForDay(dk, city)} style={{
                              display:'flex', alignItems:'center', gap:7, padding:'9px 10px',
                              background: on ? 'var(--pg-aqua-100)' : 'var(--pg-white)',
                              border:'1px solid ' + (on ? 'var(--pg-aqua-400)' : 'var(--pg-ink-200)'),
                              borderRadius:9, cursor:'pointer', textAlign:'left', fontFamily:'inherit',
                              transition:'all .12s ease', minWidth:0,
                            }}>
                              <div style={{
                                width:16, height:16, borderRadius:4, flexShrink:0,
                                background: on ? 'var(--pg-aqua-500)' : 'transparent',
                                border:'1.5px solid ' + (on ? 'var(--pg-aqua-500)' : 'var(--pg-ink-300)'),
                                display:'flex', alignItems:'center', justifyContent:'center',
                              }}>
                                {on && Icon.check(10, '#fff')}
                              </div>
                              <span style={{flex:1, fontSize:12, fontWeight: on?600:500,
                                color: on?'var(--pg-aqua-700)':'var(--pg-ink-900)',
                                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                                {city}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{height:14}}/>
        </div>

        {/* Save */}
        <div style={{padding:'12px 18px 18px', borderTop:'0.5px solid var(--pg-ink-200)', background:'#fff'}}>
          <button onClick={onClose} className="pg-btn pg-btn-primary" style={{width:'100%', height:50, fontSize:15}}>
            {head.save}
          </button>
        </div>
      </div>
    </Sheet>
  );
}

Object.assign(window, { Wordmark, NavyBar, EquipImg, FL_COUNTIES, RegionEditorSheet });
