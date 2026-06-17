// brand.jsx — wordmark, illustrative product imagery, region editor

// ── Flood Level icon — shared brand icon (inline SVG, no img dependency) ──
function FloodMark({
  size = 36
}) {
  const u = 'bm';
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 100 100",
    xmlns: "http://www.w3.org/2000/svg",
    style: {
      display: 'block',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("radialGradient", {
    id: `${u}bg`,
    cx: "50%",
    cy: "48%",
    r: "66%"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "#0B1F32"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#040D18"
  })), /*#__PURE__*/React.createElement("clipPath", {
    id: `${u}wc`
  }, /*#__PURE__*/React.createElement("path", {
    d: "M-5,59 Q13,51 28,59 Q43,67 58,59 Q73,51 88,59 Q97,63 105,59 L105,105 L-5,105Z"
  })), /*#__PURE__*/React.createElement("linearGradient", {
    id: `${u}wf`,
    x1: "0%",
    y1: "0%",
    x2: "0%",
    y2: "100%"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "#0AB8C8",
    stopOpacity: "0.28"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#065068",
    stopOpacity: "0.55"
  })), /*#__PURE__*/React.createElement("filter", {
    id: `${u}g1`
  }, /*#__PURE__*/React.createElement("feGaussianBlur", {
    stdDeviation: "2.5",
    result: "b"
  }), /*#__PURE__*/React.createElement("feMerge", null, /*#__PURE__*/React.createElement("feMergeNode", {
    in: "b"
  }), /*#__PURE__*/React.createElement("feMergeNode", {
    in: "SourceGraphic"
  }))), /*#__PURE__*/React.createElement("linearGradient", {
    id: `${u}gl`,
    x1: "0%",
    y1: "0%",
    x2: "55%",
    y2: "100%"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "white",
    stopOpacity: "0.13"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "white",
    stopOpacity: "0"
  })), /*#__PURE__*/React.createElement("clipPath", {
    id: `${u}rnd`
  }, /*#__PURE__*/React.createElement("rect", {
    width: "100",
    height: "100",
    rx: "24"
  }))), /*#__PURE__*/React.createElement("rect", {
    width: "100",
    height: "100",
    rx: "24",
    fill: `url(#${u}bg)`
  }), /*#__PURE__*/React.createElement("g", {
    clipPath: `url(#${u}rnd)`
  }, /*#__PURE__*/React.createElement("text", {
    x: "5",
    y: "72",
    fontFamily: "Poppins,sans-serif",
    fontWeight: "800",
    fontSize: "66",
    fill: "rgba(255,255,255,0.95)"
  }, "P"), /*#__PURE__*/React.createElement("text", {
    x: "53",
    y: "72",
    fontFamily: "Poppins,sans-serif",
    fontWeight: "800",
    fontSize: "66",
    fill: "rgba(255,255,255,0.95)"
  }, "X"), /*#__PURE__*/React.createElement("text", {
    clipPath: `url(#${u}wc)`,
    x: "5",
    y: "72",
    fontFamily: "Poppins,sans-serif",
    fontWeight: "800",
    fontSize: "66",
    fill: "#18DAEA",
    filter: `url(#${u}g1)`
  }, "P"), /*#__PURE__*/React.createElement("text", {
    clipPath: `url(#${u}wc)`,
    x: "53",
    y: "72",
    fontFamily: "Poppins,sans-serif",
    fontWeight: "800",
    fontSize: "66",
    fill: "#18DAEA",
    filter: `url(#${u}g1)`
  }, "X"), /*#__PURE__*/React.createElement("path", {
    d: "M-5,59 Q13,51 28,59 Q43,67 58,59 Q73,51 88,59 Q97,63 105,59 L105,105 L-5,105Z",
    fill: `url(#${u}wf)`
  }), /*#__PURE__*/React.createElement("path", {
    d: "M-5,59 Q13,51 28,59 Q43,67 58,59 Q73,51 88,59 Q97,63 105,59",
    stroke: "#0EBAC7",
    strokeWidth: "2.8",
    fill: "none",
    strokeLinecap: "round",
    filter: `url(#${u}g1)`
  }), /*#__PURE__*/React.createElement("path", {
    d: "M-5,59 Q13,51 28,59 Q43,67 58,59 Q73,51 88,59 Q97,63 105,59",
    stroke: "rgba(255,255,255,0.50)",
    strokeWidth: "1",
    fill: "none",
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "20",
    cy: "46",
    r: "2.2",
    fill: "none",
    stroke: "rgba(14,186,199,0.55)",
    strokeWidth: "1.2",
    filter: `url(#${u}g1)`
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "34",
    cy: "40",
    r: "1.5",
    fill: "none",
    stroke: "rgba(14,186,199,0.40)",
    strokeWidth: "1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "70",
    cy: "43",
    r: "2.5",
    fill: "none",
    stroke: "rgba(14,186,199,0.50)",
    strokeWidth: "1.2",
    filter: `url(#${u}g1)`
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "83",
    cy: "37",
    r: "1.6",
    fill: "none",
    stroke: "rgba(14,186,199,0.35)",
    strokeWidth: "1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "47",
    cy: "50",
    r: "1.2",
    fill: "none",
    stroke: "rgba(14,186,199,0.30)",
    strokeWidth: "0.8"
  }), /*#__PURE__*/React.createElement("rect", {
    width: "100",
    height: "100",
    rx: "24",
    fill: `url(#${u}gl)`
  }), /*#__PURE__*/React.createElement("ellipse", {
    cx: "26",
    cy: "17",
    rx: "20",
    ry: "9",
    fill: "white",
    opacity: "0.07",
    transform: "rotate(-14,26,17)"
  })), /*#__PURE__*/React.createElement("rect", {
    x: "1",
    y: "1",
    width: "98",
    height: "98",
    rx: "23.5",
    fill: "none",
    stroke: "rgba(14,186,199,0.25)",
    strokeWidth: "1.5"
  }));
}

// ── Brand wordmark ────────────────────────────────────────────
function Wordmark({
  size = 'md',
  onDark = false,
  subtitle
}) {
  const h = size === 'lg' ? 160 : size === 'sm' ? 85 : size === 'nav' ? 178 : 120;
  const subtitleSize = size === 'lg' ? 11 : size === 'sm' ? 9 : size === 'nav' ? 9 : 10;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 3
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: onDark ? 'wordmarkwhite.png' : 'pgx-logo.png',
    alt: "PoolGuyX",
    style: {
      height: h,
      width: 'auto',
      display: 'block',
      filter: onDark ? 'drop-shadow(0 2px 12px rgba(0,0,0,0.35))' : 'drop-shadow(0 2px 6px rgba(0,0,0,0.12))'
    }
  }), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: subtitleSize,
      fontWeight: 500,
      color: onDark ? 'rgba(255,255,255,0.65)' : 'var(--pg-ink-500)',
      letterSpacing: '0.005em',
      lineHeight: 1.3,
      paddingLeft: 2
    }
  }, subtitle));
}

// ── Header theme helper (shared by all screen headers) ────────
function headerTheme(dark) {
  return dark ? {
    text: '#ffffff',
    sub: 'rgba(255,255,255,0.50)',
    mid: 'rgba(255,255,255,0.80)',
    faint: 'rgba(255,255,255,0.55)',
    iconBg: 'rgba(255,255,255,0.12)',
    iconC: 'rgba(255,255,255,0.88)',
    border: 'rgba(255,255,255,0.12)',
    divider: 'rgba(255,255,255,0.15)',
    cntyBg: 'rgba(0,119,182,0.25)',
    cntyBdr: '1px solid rgba(0,119,182,0.40)',
    cntyTxt: 'rgba(255,255,255,0.85)',
    cntyIc: 'rgba(255,255,255,0.70)',
    editIc: 'rgba(255,255,255,0.55)',
    wave1: 'rgba(255,255,255,0.12)',
    wave2: 'rgba(255,255,255,0.06)',
    glow: 'radial-gradient(circle, rgba(14,186,199,0.10) 0%, transparent 70%)',
    ring1: 'rgba(14,186,199,0.08)',
    ring2: 'rgba(14,186,199,0.05)',
    blob: 'rgba(14,186,199,0.05)',
    backBtn: 'rgba(255,255,255,0.13)',
    activeBg: 'rgba(255,255,255,0.15)',
    activeBdr: '1px solid rgba(255,255,255,0.25)',
    activeTxt: 'rgba(255,255,255,0.90)'
  } : {
    text: '#0A2840',
    sub: 'rgba(10,40,64,0.50)',
    mid: 'rgba(10,40,64,0.82)',
    faint: 'rgba(10,40,64,0.58)',
    iconBg: 'rgba(10,40,64,0.09)',
    iconC: 'rgba(10,40,64,0.72)',
    border: 'rgba(10,40,64,0.10)',
    divider: 'rgba(10,40,64,0.12)',
    cntyBg: 'rgba(0,119,182,0.11)',
    cntyBdr: '1px solid rgba(0,119,182,0.28)',
    cntyTxt: '#0A2840',
    cntyIc: 'rgba(0,119,182,0.65)',
    editIc: 'rgba(10,40,64,0.38)',
    wave1: 'rgba(10,40,64,0.06)',
    wave2: 'rgba(10,40,64,0.03)',
    glow: 'radial-gradient(circle, rgba(0,119,182,0.10) 0%, transparent 70%)',
    ring1: 'rgba(0,119,182,0.09)',
    ring2: 'rgba(0,119,182,0.05)',
    blob: 'rgba(0,119,182,0.05)',
    backBtn: 'rgba(10,40,64,0.10)',
    activeBg: 'rgba(0,119,182,0.10)',
    activeBdr: '1px solid rgba(0,119,182,0.22)',
    activeTxt: '#0A2840'
  };
}

// ── App bar (light/dark responsive) ───────────────────────────
function NavyBar({
  title,
  leftBack,
  onBack,
  right,
  children,
  wave = true,
  darkMode = true,
  bgOverride = null,
  centerDecor = null,
  compact = false
}) {
  const H = headerTheme(darkMode);
  const bg = bgOverride || (darkMode ? 'linear-gradient(145deg, #040D18 0%, #071A2E 52%, #0A2840 100%)' : 'linear-gradient(145deg, #f0f9ff 0%, #dff0fb 52%, #cce8f5 100%)');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: bg,
      color: H.text,
      padding: compact ? '6px 18px 6px' : wave ? '2px 18px 14px' : '12px 18px 10px',
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: -60,
      right: -60,
      width: 200,
      height: 200,
      borderRadius: '50%',
      background: H.glow,
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: -55,
      right: -55,
      width: 190,
      height: 190,
      borderRadius: '50%',
      border: `1px solid ${H.ring1}`,
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 12,
      right: 22,
      width: 108,
      height: 108,
      borderRadius: '50%',
      border: `1px solid ${H.ring2}`,
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: -35,
      left: -35,
      width: 130,
      height: 130,
      borderRadius: '50%',
      background: H.blob,
      pointerEvents: 'none'
    }
  }), centerDecor && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
      zIndex: 0
    }
  }, centerDecor), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      minHeight: 44
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flex: 1,
      minWidth: 0
    }
  }, leftBack && /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      border: 'none',
      background: H.backBtn,
      width: 36,
      height: 36,
      borderRadius: '50%',
      cursor: 'pointer',
      color: H.text,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      backdropFilter: 'blur(8px)'
    }
  }, Icon.chev(18, H.text, 'left')), typeof title === 'string' ? /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontFamily: 'var(--pg-font-display)',
      fontSize: 22,
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: H.text
    }
  }, title) : title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      position: 'relative',
      zIndex: 2
    }
  }, right)), children && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 1
    }
  }, children), wave && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      lineHeight: 0,
      pointerEvents: 'none',
      zIndex: 0
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 402 20",
    width: "100%",
    height: "20",
    preserveAspectRatio: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M0 14 Q80 5 160 14 Q240 23 320 14 Q368 8 402 16 L402 20 L0 20 Z",
    fill: H.wave1
  }), /*#__PURE__*/React.createElement("path", {
    d: "M0 17 Q120 11 240 17 Q320 21 402 18 L402 20 L0 20 Z",
    fill: H.wave2
  }))));
}

// ── No-photo placeholder — shown when a listing has no uploaded image ──
function NoPhotoPlaceholder({
  height = 108,
  small = false
}) {
  const iconSize = small ? 22 : 32;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: small ? 4 : 7,
      background: 'linear-gradient(135deg, var(--pg-blue-600,#2563eb) 0%, var(--pg-blue-800,#1e3a6e) 100%)',
      userSelect: 'none',
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 200 60",
    style: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      width: '100%',
      opacity: 0.12
    },
    preserveAspectRatio: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M0 30 Q50 0 100 30 Q150 60 200 30 L200 60 L0 60 Z",
    fill: "#fff"
  })), /*#__PURE__*/React.createElement("svg", {
    width: iconSize,
    height: iconSize,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "rgba(255,255,255,0.75)",
    strokeWidth: "1.6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "7",
    width: "18",
    height: "13",
    rx: "2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "13.5",
    r: "3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "17",
    y1: "11",
    x2: "17.01",
    y2: "11"
  })), !small && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      fontWeight: 700,
      color: 'rgba(255,255,255,0.45)',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      position: 'relative'
    }
  }, "No photo"));
}

// ── Equipment imagery — real pool-equipment photos via loremflickr ──
function EquipImg({
  category,
  height = 108
}) {
  const [loaded, setLoaded] = React.useState(false);

  // loremflickr returns real Flickr CC photos matched to keywords.
  // ?lock=N makes the result deterministic (same photo every load).
  const photoUrls = {
    Pumps: 'https://loremflickr.com/800/480/pool,pump,motor?lock=11',
    Filters: 'https://loremflickr.com/800/480/pool,filter,sand?lock=22',
    Vacuum: 'https://loremflickr.com/800/480/pool,vacuum,cleaner?lock=33',
    Heaters: 'https://loremflickr.com/800/480/pool,heater?lock=44',
    Tools: 'https://loremflickr.com/800/480/pool,maintenance,pole?lock=55',
    Routes: 'https://loremflickr.com/800/480/swimming,pool?lock=66'
  };
  const tints = {
    Pumps: 'oklch(0.30 0.16 245 / 0.15)',
    Filters: 'oklch(0.28 0.13 178 / 0.14)',
    Vacuum: 'oklch(0.22 0.12 250 / 0.15)',
    Heaters: 'oklch(0.38 0.15 45  / 0.14)',
    Tools: 'oklch(0.28 0.04 240 / 0.10)',
    Routes: 'oklch(0.28 0.13 200 / 0.14)'
  };
  const url = photoUrls[category] || photoUrls.Tools;
  const tint = tints[category] || tints.Tools;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height,
      position: 'relative',
      overflow: 'hidden',
      background: '#d6dfe8'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: url,
    alt: category,
    onLoad: () => setLoaded(true),
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block',
      transition: 'opacity .45s ease',
      opacity: loaded ? 1 : 0
    }
  }), !loaded && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(110deg, #d0d9e2 30%, #dde5ec 50%, #d0d9e2 70%)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: tint,
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(180deg, transparent 45%, rgba(0,0,0,0.28) 100%)',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      bottom: 7,
      right: 10,
      fontSize: 9,
      fontWeight: 700,
      color: 'rgba(255,255,255,0.88)',
      letterSpacing: '0.10em',
      fontFamily: 'ui-monospace,"SF Mono",monospace',
      textShadow: '0 1px 3px rgba(0,0,0,0.5)'
    }
  }, category.toUpperCase()));
}

// ── Region editor sheet ───────────────────────────────────────
const FL_COUNTIES = {
  'Broward': ['Coconut Creek', 'Cooper City', 'Coral Springs', 'Dania Beach', 'Davie', 'Deerfield Beach', 'Fort Lauderdale', 'Hallandale Beach', 'Hillsboro Beach', 'Hollywood', 'Lauderdale Lakes', 'Lauderdale-by-the-Sea', 'Lauderhill', 'Lighthouse Point', 'Margate', 'Miramar', 'North Lauderdale', 'Oakland Park', 'Parkland', 'Pembroke Park', 'Pembroke Pines', 'Plantation', 'Pompano Beach', 'Sea Ranch Lakes', 'Southwest Ranches', 'Sunrise', 'Tamarac', 'Weston', 'Wilton Manors'],
  'Miami-Dade': ['Aventura', 'Bal Harbour', 'Bay Harbor Islands', 'Biscayne Park', 'Coral Gables', 'Cutler Bay', 'Doral', 'El Portal', 'Florida City', 'Golden Beach', 'Hialeah', 'Hialeah Gardens', 'Homestead', 'Indian Creek', 'Islandia', 'Key Biscayne', 'Medley', 'Miami', 'Miami Beach', 'Miami Gardens', 'Miami Lakes', 'Miami Shores', 'Miami Springs', 'North Bay Village', 'North Miami', 'North Miami Beach', 'Opa-locka', 'Palmetto Bay', 'Pinecrest', 'South Miami', 'Sunny Isles Beach', 'Surfside', 'Sweetwater', 'Virginia Gardens', 'West Miami', 'Kendall', 'Westchester', 'Dade City'],
  'Palm Beach': ['Atlantis', 'Belle Glade', 'Boca Raton', 'Boynton Beach', 'Briny Breezes', 'Cloud Lake', 'Delray Beach', 'Glen Ridge', 'Golf', 'Greenacres', 'Gulf Stream', 'Haverhill', 'Highland Beach', 'Hypoluxo', 'Juno Beach', 'Jupiter', 'Jupiter Inlet Colony', 'Lake Clarke Shores', 'Lake Park', 'Lake Worth Beach', 'Lantana', 'Manalapan', 'Mangonia Park', 'North Palm Beach', 'Ocean Ridge', 'Pahokee', 'Palm Beach', 'Palm Beach Gardens', 'Palm Beach Shores', 'Palm Springs', 'Riviera Beach', 'Royal Palm Beach', 'South Bay', 'South Palm Beach', 'Tequesta', 'Wellington', 'West Palm Beach'],
  'Orange': ['Apopka', 'Bay Lake', 'Belle Isle', 'Eatonville', 'Edgewood', 'Lake Buena Vista', 'Maitland', 'Oakland', 'Ocoee', 'Orlando', 'Orlovista', 'Pine Castle', 'Windermere', 'Winter Garden', 'Winter Park', 'Zellwood', 'Kissimmee', 'St. Cloud', 'Celebration'],
  'Hillsborough': ['Brandon', 'Carrollwood', 'Citrus Park', 'Dover', 'Egypt Lake-Leto', 'Gibsonton', 'Keystone', 'Lutz', 'Mango', 'Northdale', 'Plant City', 'Riverview', 'Ruskin', 'Sun City Center', 'Tampa', 'Temple Terrace', 'Town N Country', 'Valrico', 'Westchase', 'Wimauma'],
  'Pinellas': ['Bellair Beach', 'Bellair Bluffs', 'Clearwater', 'Dunedin', 'Gulfport', 'Indian Rocks Beach', 'Indian Shores', 'Kenneth City', 'Largo', 'Madeira Beach', 'North Redington Beach', 'Oldsmar', 'Pinellas Park', 'Redington Beach', 'Redington Shores', 'Safety Harbor', 'St. Pete Beach', 'St. Petersburg', 'Seminole', 'South Pasadena', 'Tarpon Springs', 'Treasure Island', 'Tierra Verde'],
  'Collier': ['Ave Maria', 'Everglades City', 'Marco Island', 'Naples', 'Golden Gate'],
  'Lee': ['Bonita Springs', 'Cape Coral', 'Estero', 'Fort Myers', 'Fort Myers Beach', 'Sanibel', 'Captiva', 'Lehigh Acres'],
  'Sarasota': ['Englewood', 'Longboat Key', 'North Port', 'Osprey', 'Sarasota', 'Venice'],
  'Manatee': ['Anna Maria', 'Bradenton', 'Bradenton Beach', 'Holmes Beach', 'Palmetto', 'Longboat Key'],
  'Volusia': ['Daytona Beach', 'Daytona Beach Shores', 'DeBary', 'DeLand', 'Deltona', 'Edgewater', 'Holly Hill', 'Lake Helen', 'New Smyrna Beach', 'Orange City', 'Ormond Beach', 'Pierson', 'Port Orange', 'Ponce Inlet', 'South Daytona'],
  'Brevard': ['Cape Canaveral', 'Cocoa', 'Cocoa Beach', 'Indialantic', 'Indian Harbour Beach', 'Melbourne', 'Melbourne Beach', 'Mims', 'Palm Bay', 'Rockledge', 'Satellite Beach', 'Titusville', 'West Melbourne'],
  'Seminole': ['Altamonte Springs', 'Casselberry', 'Lake Mary', 'Longwood', 'Oviedo', 'Sanford', 'Winter Springs'],
  'Duval': ['Atlantic Beach', 'Baldwin', 'Jacksonville', 'Jacksonville Beach', 'Neptune Beach'],
  'Alachua': ['Alachua', 'Archer', 'Gainesville', 'High Springs', 'Hawthorne', 'Micanopy', 'Waldo'],
  'Leon': ['Tallahassee'],
  'Escambia': ['Century', 'Pensacola', 'Cantonment'],
  'Okaloosa': ['Crestview', 'Destin', 'Fort Walton Beach', 'Niceville', 'Shalimar', 'Valparaiso', 'Mary Esther'],
  'Bay': ['Callaway', 'Lynn Haven', 'Mexico Beach', 'Panama City', 'Panama City Beach', 'Parker', 'Springfield'],
  'St. Johns': ['Hastings', 'Ponte Vedra Beach', 'St. Augustine', 'St. Augustine Beach'],
  'Polk': ['Auburndale', 'Bartow', 'Davenport', 'Dundee', 'Haines City', 'Lake Alfred', 'Lake Hamilton', 'Lake Wales', 'Lakeland', 'Mulberry', 'Winter Haven'],
  'Lake': ['Clermont', 'Eustis', 'Groveland', 'Howey-in-the-Hills', 'Lady Lake', 'Leesburg', 'Mascotte', 'Minneola', 'Montverde', 'Mount Dora', 'Tavares', 'Umatilla'],
  'Marion': ['Belleview', 'Dunnellon', 'McIntosh', 'Ocala', 'Reddick'],
  'St. Lucie': ['Fort Pierce', 'Port St. Lucie', 'St. Lucie Village'],
  'Indian River': ['Fellsmere', 'Indian River Shores', 'Orchid', 'Sebastian', 'Vero Beach'],
  'Martin': ['Jupiter Island', 'Ocean Breeze', 'Palm City', 'Sewall\'s Point', 'Stuart'],
  'Monroe': ['Key Largo', 'Key West', 'Islamorada', 'Marathon', 'Big Pine Key', 'Tavernier'],
  'Charlotte': ['Punta Gorda'],
  'Hernando': ['Brooksville', 'Weeki Wachee'],
  'Pasco': ['Dade City', 'New Port Richey', 'Port Richey', 'San Antonio', 'Zephyrhills'],
  'Citrus': ['Crystal River', 'Inverness'],
  'Flagler': ['Bunnell', 'Flagler Beach', 'Marineland'],
  'Putnam': ['Crescent City', 'Interlachen', 'Palatka'],
  'Clay': ['Green Cove Springs', 'Keystone Heights', 'Orange Park'],
  'Nassau': ['Callahan', 'Fernandina Beach', 'Hilliard', 'Yulee'],
  'Osceola': ['Kissimmee', 'St. Cloud', 'Celebration', 'Poinciana'],
  'Sumter': ['Bushnell', 'Coleman', 'Center Hill', 'Webster', 'The Villages'],
  'Gilchrist': ['Trenton'],
  'Levy': ['Cedar Key', 'Chiefland', 'Inglis', 'Williston', 'Yankeetown'],
  'Columbia': ['Fort White', 'Lake City'],
  'Suwannee': ['Branford', 'Live Oak'],
  'Hamilton': ['Jasper', 'White Springs']
};

// City → [lat, lng] for South Florida (used by radius filter)
const FL_CITY_COORDS = {
  // Broward
  'Coconut Creek': [26.2656, -80.1786],
  'Cooper City': [26.0551, -80.2717],
  'Coral Springs': [26.2709, -80.2706],
  'Dania Beach': [26.0523, -80.1439],
  'Davie': [26.0765, -80.2521],
  'Deerfield Beach': [26.3182, -80.0998],
  'Fort Lauderdale': [26.1224, -80.1373],
  'Hallandale Beach': [25.9812, -80.1481],
  'Hillsboro Beach': [26.3148, -80.0775],
  'Hollywood': [26.0112, -80.1495],
  'Lauderdale Lakes': [26.1671, -80.2095],
  'Lauderdale-by-the-Sea': [26.1940, -80.0956],
  'Lauderhill': [26.1681, -80.2131],
  'Lighthouse Point': [26.2765, -80.0898],
  'Margate': [26.2448, -80.2065],
  'Miramar': [25.9874, -80.2323],
  'North Lauderdale': [26.2150, -80.2290],
  'Oakland Park': [26.1723, -80.1320],
  'Parkland': [26.3173, -80.2323],
  'Pembroke Park': [25.9935, -80.1737],
  'Pembroke Pines': [26.0073, -80.2962],
  'Plantation': [26.1256, -80.2331],
  'Pompano Beach': [26.2379, -80.1248],
  'Sea Ranch Lakes': [26.1779, -80.0902],
  'Southwest Ranches': [26.0404, -80.2967],
  'Sunrise': [26.1667, -80.2561],
  'Tamarac': [26.2130, -80.2499],
  'Weston': [26.1003, -80.3998],
  'Wilton Manors': [26.1612, -80.1331],
  // Miami-Dade
  'Aventura': [25.9565, -80.1393],
  'Bal Harbour': [25.9017, -80.1223],
  'Bay Harbor Islands': [25.8880, -80.1297],
  'Biscayne Park': [25.8959, -80.1754],
  'Coral Gables': [25.7215, -80.2684],
  'Cutler Bay': [25.5772, -80.3459],
  'Doral': [25.8195, -80.3536],
  'El Portal': [25.8654, -80.1846],
  'Florida City': [25.4478, -80.4790],
  'Golden Beach': [25.9737, -80.1276],
  'Hialeah': [25.8576, -80.2781],
  'Hialeah Gardens': [25.8776, -80.3376],
  'Homestead': [25.4687, -80.4776],
  'Indian Creek': [25.8869, -80.1249],
  'Key Biscayne': [25.6911, -80.1626],
  'Medley': [25.8213, -80.3460],
  'Miami': [25.7617, -80.1918],
  'Miami Beach': [25.7907, -80.1300],
  'Miami Gardens': [25.9420, -80.2456],
  'Miami Lakes': [25.9099, -80.3115],
  'Miami Shores': [25.8654, -80.1820],
  'Miami Springs': [25.8232, -80.2926],
  'North Bay Village': [25.8489, -80.1514],
  'North Miami': [25.8899, -80.1864],
  'North Miami Beach': [25.9326, -80.1626],
  'Opa-locka': [25.8993, -80.2498],
  'Palmetto Bay': [25.6268, -80.3320],
  'Pinecrest': [25.6651, -80.3051],
  'South Miami': [25.7083, -80.2924],
  'Sunny Isles Beach': [25.9376, -80.1224],
  'Surfside': [25.8759, -80.1229],
  'Sweetwater': [25.7742, -80.3722],
  'Virginia Gardens': [25.8087, -80.3135],
  'West Miami': [25.7623, -80.3117],
  'Kendall': [25.6751, -80.3568],
  'Westchester': [25.7503, -80.3476],
  'Islandia': [25.7617, -80.1918],
  // Palm Beach
  'Atlantis': [26.5840, -80.0959],
  'Belle Glade': [26.6893, -80.6693],
  'Boca Raton': [26.3683, -80.1289],
  'Boynton Beach': [26.5317, -80.0905],
  'Briny Breezes': [26.5357, -80.0595],
  'Cloud Lake': [26.6801, -80.1140],
  'Delray Beach': [26.4615, -80.0728],
  'Glen Ridge': [26.6801, -80.1104],
  'Golf': [26.6802, -80.1140],
  'Greenacres': [26.6251, -80.1334],
  'Gulf Stream': [26.4926, -80.0676],
  'Haverhill': [26.6890, -80.1428],
  'Highland Beach': [26.4084, -80.0704],
  'Hypoluxo': [26.5584, -80.0540],
  'Juno Beach': [26.8784, -80.0553],
  'Jupiter': [26.9342, -80.0942],
  'Jupiter Inlet Colony': [26.9523, -80.0748],
  'Lake Clarke Shores': [26.6429, -80.0914],
  'Lake Park': [26.8012, -80.0637],
  'Lake Worth Beach': [26.6151, -80.0598],
  'Lantana': [26.5859, -80.0529],
  'Manalapan': [26.5515, -80.0487],
  'Mangonia Park': [26.7473, -80.0900],
  'North Palm Beach': [26.8198, -80.0681],
  'Ocean Ridge': [26.5218, -80.0537],
  'Pahokee': [26.8201, -80.6657],
  'Palm Beach': [26.7046, -80.0366],
  'Palm Beach Gardens': [26.8234, -80.1384],
  'Palm Beach Shores': [26.7782, -80.0378],
  'Palm Springs': [26.6397, -80.1003],
  'Riviera Beach': [26.7754, -80.0586],
  'Royal Palm Beach': [26.7109, -80.2265],
  'South Bay': [26.6678, -80.7165],
  'South Palm Beach': [26.5776, -80.0489],
  'Tequesta': [26.9690, -80.1036],
  'Wellington': [26.6590, -80.2673],
  'West Palm Beach': [26.7153, -80.0534]
};
window.FL_CITY_COORDS = FL_CITY_COORDS;
function haversine(lat1, lng1, lat2, lng2) {
  const R = 3958.8; // miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
window.haversine = haversine;
function nearestCity(lat, lng) {
  const coords = FL_CITY_COORDS;
  let best = null,
    bestDist = Infinity;
  for (const [city, [clat, clng]] of Object.entries(coords)) {
    const d = haversine(lat, lng, clat, clng);
    if (d < bestDist) {
      bestDist = d;
      best = city;
    }
  }
  return best;
}
window.nearestCity = nearestCity;

// Shared location/radius filter sheet (used in marketplace + work)
function LocationFilterSheet({
  open,
  onClose,
  userLocation,
  setUserLocation,
  radiusMiles,
  setRadiusMiles,
  lang
}) {
  const [locError, setLocError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  if (!open) return null;
  const radii = [10, 25, 50, 100];
  const t = {
    title: lang === 'pt' ? 'Filtro por localização' : lang === 'es' ? 'Filtro por ubicación' : 'Location filter',
    useBtn: lang === 'pt' ? 'Usar minha localização' : lang === 'es' ? 'Usar mi ubicación' : 'Use my location',
    disable: lang === 'pt' ? 'Desativar filtro de distância' : lang === 'es' ? 'Desactivar filtro de distancia' : 'Disable distance filter',
    radius: lang === 'pt' ? 'Raio de busca' : lang === 'es' ? 'Radio de búsqueda' : 'Search radius',
    active: lang === 'pt' ? 'Localização ativa — mostrando anúncios dentro de' : lang === 'es' ? 'Ubicación activa — mostrando en' : 'Location active — showing listings within',
    miles: lang === 'pt' ? 'milhas' : lang === 'es' ? 'millas' : 'miles',
    noLoc: lang === 'pt' ? 'Ativar localização para ver anúncios perto de você.' : lang === 'es' ? 'Activa la ubicación para ver anuncios cerca de ti.' : 'Enable location to see listings near you.',
    errDenied: lang === 'pt' ? 'Permissão de localização negada. Verifique as configurações do navegador.' : lang === 'es' ? 'Permiso de ubicación denegado.' : 'Location permission denied. Check browser settings.',
    errFail: lang === 'pt' ? 'Não foi possível obter a localização. Tente novamente.' : lang === 'es' ? 'No se pudo obtener la ubicación.' : 'Could not get location. Try again.',
    done: lang === 'pt' ? 'Pronto' : lang === 'es' ? 'Listo' : 'Done'
  };
  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocError(t.errFail);
      return;
    }
    setLoading(true);
    setLocError('');
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude,
        lng = pos.coords.longitude;
      const city = nearestCity(lat, lng) || '';
      setUserLocation({
        lat,
        lng,
        city
      });
      setLocError('');
      setLoading(false);
    }, err => {
      setLocError(err.code === 1 ? t.errDenied : t.errFail);
      setLoading(false);
    }, {
      timeout: 15000,
      enableHighAccuracy: false
    });
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.50)',
      zIndex: 6000,
      display: 'flex',
      alignItems: 'flex-end'
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: '100%',
      maxWidth: 520,
      margin: '0 auto',
      background: 'var(--pg-white)',
      borderRadius: '20px 20px 0 0',
      padding: '20px 20px 36px',
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 4,
      borderRadius: 2,
      background: 'var(--pg-ink-200)',
      margin: '-6px auto 20px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 800,
      color: 'var(--pg-ink-900)',
      fontFamily: 'var(--pg-font-display)',
      marginBottom: 18
    }
  }, "\uD83D\uDCCD ", t.title), userLocation ? /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--pg-aqua-100)',
      border: '1px solid var(--pg-aqua-400)',
      borderRadius: 14,
      padding: '12px 14px',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--pg-aqua-700)',
      marginBottom: 4
    }
  }, "\u2713 ", userLocation.city && /*#__PURE__*/React.createElement("span", null, userLocation.city, " \xB7 "), t.active, " ", /*#__PURE__*/React.createElement("strong", null, radiusMiles, " ", t.miles)), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setUserLocation(null);
    },
    style: {
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      padding: 0,
      fontSize: 12,
      color: 'var(--pg-ink-400)',
      fontFamily: 'inherit',
      textDecoration: 'underline'
    }
  }, t.disable)) : /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--pg-ink-50)',
      borderRadius: 14,
      padding: '12px 14px',
      marginBottom: 16,
      fontSize: 13,
      color: 'var(--pg-ink-500)'
    }
  }, t.noLoc), locError && !userLocation && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: '#DC2626',
      marginBottom: 12,
      padding: '8px 12px',
      background: '#FEF2F2',
      borderRadius: 10
    }
  }, locError), !userLocation && /*#__PURE__*/React.createElement("button", {
    onClick: requestLocation,
    disabled: loading,
    style: {
      width: '100%',
      padding: '13px',
      borderRadius: 14,
      border: 'none',
      cursor: loading ? 'default' : 'pointer',
      background: 'var(--pg-blue-500)',
      color: '#fff',
      fontSize: 14,
      fontWeight: 700,
      fontFamily: 'inherit',
      marginBottom: 16,
      opacity: loading ? 0.7 : 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8
    }
  }, loading ? /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5",
    strokeLinecap: "round",
    style: {
      animation: 'spin 1s linear infinite'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M21 12a9 9 0 1 1-6.219-8.56"
  })) : /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 2v3m0 14v3M2 12h3m14 0h3"
  })), t.useBtn), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: 'var(--pg-ink-500)',
      letterSpacing: '0.06em',
      marginBottom: 10,
      textTransform: 'uppercase'
    }
  }, t.radius), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, radii.map(r => {
    const on = r === radiusMiles;
    return /*#__PURE__*/React.createElement("button", {
      key: r,
      onClick: () => setRadiusMiles(r),
      style: {
        flex: 1,
        padding: '10px 4px',
        borderRadius: 11,
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 13,
        fontWeight: 700,
        transition: 'all .12s',
        background: on ? 'var(--pg-blue-500)' : 'var(--pg-ink-100)',
        color: on ? '#fff' : 'var(--pg-ink-600)',
        boxShadow: on ? '0 4px 10px oklch(0.58 0.16 235 / 0.25)' : 'none'
      }
    }, r, " ", lang === 'pt' ? 'mi' : lang === 'es' ? 'mi' : 'mi');
  }))), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    className: "pg-btn pg-btn-primary",
    style: {
      width: '100%',
      height: 48
    }
  }, t.done)), /*#__PURE__*/React.createElement("style", null, `@keyframes spin{to{transform:rotate(360deg)}}`));
}
window.LocationFilterSheet = LocationFilterSheet;
function RegionEditorSheet({
  open,
  onClose,
  lang = 'en',
  regionsByDay,
  setRegionsByDay,
  county
}) {
  const t = STRINGS[lang];
  const [openDay, setOpenDay] = React.useState('mon');
  const [activeCounty, setActiveCounty] = React.useState(county || 'Broward');
  const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const dayShort = lang === 'pt' ? ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'] : lang === 'es' ? ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayFull = lang === 'pt' ? ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'] : lang === 'es' ? ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const toggleCityForDay = (day, city) => {
    setRegionsByDay(prev => {
      const cur = prev[day] || [];
      const next = cur.includes(city) ? cur.filter(c => c !== city) : [...cur, city];
      return {
        ...prev,
        [day]: next
      };
    });
  };
  const clearDay = day => {
    setRegionsByDay(prev => ({
      ...prev,
      [day]: []
    }));
  };
  const head = {
    title: lang === 'pt' ? 'Regiões por dia' : lang === 'es' ? 'Regiones por día' : 'Regions by day',
    desc: lang === 'pt' ? 'Para cada dia da semana, escolha as cidades onde você quer receber notificações de trabalho.' : lang === 'es' ? 'Para cada día de la semana, elige las ciudades donde quieres recibir notificaciones de trabajo.' : 'For each weekday, choose the cities where you want to receive job notifications.',
    countyT: lang === 'pt' ? 'Condado' : lang === 'es' ? 'Condado' : 'County',
    citiesT: lang === 'pt' ? 'Cidades' : lang === 'es' ? 'Ciudades' : 'Cities',
    selected: lang === 'pt' ? 'cidades' : lang === 'es' ? 'ciudades' : 'cities',
    none: lang === 'pt' ? 'Nenhuma — sem notificações' : lang === 'es' ? 'Ninguna — sin notificaciones' : 'None — no notifications',
    save: lang === 'pt' ? 'Salvar' : lang === 'es' ? 'Guardar' : 'Save',
    clearLbl: lang === 'pt' ? 'Limpar' : lang === 'es' ? 'Limpiar' : 'Clear',
    pickCities: lang === 'pt' ? 'Escolha as cidades' : lang === 'es' ? 'Elige las ciudades' : 'Pick cities'
  };
  return /*#__PURE__*/React.createElement(Sheet, {
    open: open,
    onClose: onClose,
    height: "92%"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 18px 14px',
      borderBottom: '0.5px solid var(--pg-ink-200)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 18,
      fontWeight: 700,
      letterSpacing: '-0.02em'
    }
  }, head.title), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      border: 'none',
      background: 'var(--pg-ink-100)',
      width: 30,
      height: 30,
      borderRadius: '50%',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, Icon.x(16, 'var(--pg-ink-700)'))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--pg-ink-500)',
      lineHeight: 1.4
    }
  }, head.desc)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: '12px 18px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, dayKeys.map((dk, i) => {
    const cities = regionsByDay[dk] || [];
    const isOpen = openDay === dk;
    return /*#__PURE__*/React.createElement("div", {
      key: dk,
      className: "pg-card",
      style: {
        padding: 0,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setOpenDay(isOpen ? null : dk),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 14px',
        border: 'none',
        background: 'transparent',
        width: '100%',
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 42,
        height: 42,
        borderRadius: 11,
        background: cities.length > 0 ? 'linear-gradient(135deg, var(--pg-aqua-500), var(--pg-aqua-700))' : 'var(--pg-ink-100)',
        color: cities.length > 0 ? '#fff' : 'var(--pg-ink-500)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontFamily: 'var(--pg-font-display)',
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: '-0.01em',
        transition: 'all .15s ease',
        boxShadow: cities.length > 0 ? '0 3px 8px rgba(14,186,199,0.35)' : 'none'
      }
    }, dayShort[i]), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        fontWeight: 600,
        color: 'var(--pg-ink-900)'
      }
    }, dayFull[i]), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: cities.length > 0 ? 'var(--pg-aqua-700)' : 'var(--pg-ink-500)',
        marginTop: 2,
        lineHeight: 1.35,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }
    }, cities.length === 0 ? head.none : cities.join(' · '))), /*#__PURE__*/React.createElement("div", {
      style: {
        transform: isOpen ? 'rotate(90deg)' : 'rotate(0)',
        transition: 'transform .2s ease',
        flexShrink: 0
      }
    }, Icon.chev(16, 'var(--pg-ink-500)'))), isOpen && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '4px 14px 14px',
        borderTop: '0.5px solid var(--pg-ink-200)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: '10px 0 8px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: 'var(--pg-ink-500)',
        fontWeight: 700,
        letterSpacing: '0.06em'
      }
    }, head.pickCities.toUpperCase()), cities.length > 0 && /*#__PURE__*/React.createElement("button", {
      onClick: () => clearDay(dk),
      style: {
        border: 'none',
        background: 'transparent',
        color: 'var(--pg-ink-500)',
        fontSize: 11,
        fontWeight: 600,
        cursor: 'pointer',
        padding: '2px 6px'
      }
    }, head.clearLbl)), /*#__PURE__*/React.createElement("div", {
      className: "pg-scroll-x",
      style: {
        display: 'flex',
        gap: 6,
        marginLeft: -14,
        marginRight: -14,
        padding: '0 14px 6px'
      }
    }, Object.keys(FL_COUNTIES).map(c => /*#__PURE__*/React.createElement("button", {
      key: c,
      onClick: () => setActiveCounty(c),
      className: `pg-chip ${activeCounty === c ? 'pg-chip-on' : ''}`,
      style: {
        fontSize: 11,
        padding: '5px 10px'
      }
    }, c))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 6,
        marginTop: 8
      }
    }, FL_COUNTIES[activeCounty].map(city => {
      const on = cities.includes(city);
      return /*#__PURE__*/React.createElement("button", {
        key: city,
        onClick: () => toggleCityForDay(dk, city),
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          padding: '9px 10px',
          background: on ? 'var(--pg-aqua-100)' : 'var(--pg-white)',
          border: '1px solid ' + (on ? 'var(--pg-aqua-400)' : 'var(--pg-ink-200)'),
          borderRadius: 9,
          cursor: 'pointer',
          textAlign: 'left',
          fontFamily: 'inherit',
          transition: 'all .12s ease',
          minWidth: 0
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: 16,
          height: 16,
          borderRadius: 4,
          flexShrink: 0,
          background: on ? 'var(--pg-aqua-500)' : 'transparent',
          border: '1.5px solid ' + (on ? 'var(--pg-aqua-500)' : 'var(--pg-ink-300)'),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }
      }, on && Icon.check(10, '#fff')), /*#__PURE__*/React.createElement("span", {
        style: {
          flex: 1,
          fontSize: 12,
          fontWeight: on ? 600 : 500,
          color: on ? 'var(--pg-aqua-700)' : 'var(--pg-ink-900)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }
      }, city));
    }))));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 14
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 18px 18px',
      borderTop: '0.5px solid var(--pg-ink-200)',
      background: '#fff'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    className: "pg-btn pg-btn-primary",
    style: {
      width: '100%',
      height: 50,
      fontSize: 15
    }
  }, head.save))));
}
Object.assign(window, {
  Wordmark,
  NavyBar,
  EquipImg,
  FL_COUNTIES,
  RegionEditorSheet
});