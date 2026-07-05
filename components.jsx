// components.jsx — shared atoms, icons, nav, header

// ── Icons ─────────────────────────────────────────────────────
const Icon = {
  home: (s=22, c="currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>
    </svg>
  ),
  cart: (s=22, c="currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4h2l2.5 12h11L21 7H6"/><circle cx="9" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/>
    </svg>
  ),
  bolt: (s=24, c="currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
      <path d="M13.5 2 4 14h6l-1.5 8L20 10h-6.5z"/>
    </svg>
  ),
  briefcase: (s=22, c="currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/>
    </svg>
  ),
  user: (s=22, c="currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 5-7 8-7s7 2 8 7"/>
    </svg>
  ),
  bell: (s=20, c="currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 17V11a6 6 0 0 1 12 0v6"/><path d="M4 17h16"/><path d="M10 21a2 2 0 0 0 4 0"/>
    </svg>
  ),
  search: (s=18, c="currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>
    </svg>
  ),
  chev: (s=16, c="currentColor", dir='right') => {
    const r = { right: 0, left: 180, up: -90, down: 90 }[dir];
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{transform:`rotate(${r}deg)`}}>
        <path d="m9 6 6 6-6 6"/>
      </svg>
    );
  },
  plus: (s=20, c="currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  ),
  star: (s=14, c="currentColor", filled=true) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={filled?c:"none"} stroke={c} strokeWidth="1.5" strokeLinejoin="round">
      <path d="m12 3 2.7 6 6.3.5-4.8 4.2 1.5 6.3L12 16.8 6.3 20l1.5-6.3L3 9.5l6.3-.5z"/>
    </svg>
  ),
  pin: (s=16, c="currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/>
    </svg>
  ),
  clock: (s=14, c="currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
    </svg>
  ),
  filter: (s=18, c="currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 5h18"/><path d="M6 12h12"/><path d="M10 19h4"/>
    </svg>
  ),
  msg: (s=22, c="currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a8 8 0 0 1-11.4 7.3L4 21l1.7-5.6A8 8 0 1 1 21 12Z"/>
    </svg>
  ),
  share: (s=18, c="currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/>
      <path d="m8 11 8-4"/><path d="m8 13 8 4"/>
    </svg>
  ),
  heart: (s=18, c="currentColor", filled=false) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={filled?c:"none"} stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z"/>
    </svg>
  ),
  lock: (s=14, c="currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>
    </svg>
  ),
  globe: (s=18, c="currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18"/><path d="M12 3a14 14 0 0 0 0 18"/>
    </svg>
  ),
  check: (s=16, c="currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5 10 17l9-10"/>
    </svg>
  ),
  x: (s=18, c="currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round">
      <path d="M6 6l12 12M6 18 18 6"/>
    </svg>
  ),
  cal: (s=18, c="currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 3v4M16 3v4"/>
    </svg>
  ),
  pool: (s=18, c="currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17c1.5 1 3 1 4.5 0s3-1 4.5 0 3 1 4.5 0 3-1 4.5 0"/>
      <path d="M3 20c1.5 1 3 1 4.5 0s3-1 4.5 0 3 1 4.5 0 3-1 4.5 0"/>
      <path d="M7 14V6a2 2 0 0 1 2-2"/><path d="M17 14V6a2 2 0 0 0-2-2"/>
      <path d="M7 9h10"/>
    </svg>
  ),
  crown: (s=14, c="currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
      <path d="M3 8l4 4 5-7 5 7 4-4v10H3z"/>
    </svg>
  ),
  shield: (s=14, c="currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 4 6v6c0 4.5 3.5 8 8 9 4.5-1 8-4.5 8-9V6z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  ),
  dog: (s=16, c="currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9c0-2 2-4 4-2l3-1 3 1c2-2 4 0 4 2v6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z"/>
      <circle cx="9" cy="12" r=".7" fill={c}/><circle cx="15" cy="12" r=".7" fill={c}/>
      <path d="M11 15h2"/>
    </svg>
  ),
  key: (s=16, c="currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="14" r="4"/><path d="m11 11 9-9"/><path d="m17 5 3 3"/><path d="m15 7 3 3"/>
    </svg>
  ),
  more: (s=18, c="currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
      <circle cx="6" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="18" cy="12" r="1.6"/>
    </svg>
  ),
  arrow: (s=18, c="currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>
    </svg>
  ),
  edit: (s=16, c="currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
};

// ── Module-level photo cache (uid → url) ──────────────────────
const _pgPhotoCache = new Map();

// ── AvatarFetch — auto-fetches photo by uid, falls back to initials ──
function AvatarFetch({ uid, name="?", size=40 }) {
  const [src, setSrc] = React.useState(() => {
    const cached = uid ? _pgPhotoCache.get(uid) : undefined;
    return cached || undefined;
  });
  React.useEffect(() => {
    if (!uid || !window.sb) return;
    if (_pgPhotoCache.has(uid)) {
      setSrc(_pgPhotoCache.get(uid) || undefined);
      return;
    }
    window.sb.from('profiles_public').select('photo_url').eq('id', uid).single()
      .then(({ data }) => {
        const url = data?.photo_url || '';
        _pgPhotoCache.set(uid, url);
        if (url) setSrc(url);
      })
      .catch(() => { _pgPhotoCache.set(uid, ''); });
  }, [uid]);
  return <Avatar name={name} size={size} src={src} />;
}

// ── Avatar (deterministic color from initials, or photo) ─────
function Avatar({ name="?", size=40, src }) {
  const initials = name.split(' ').slice(0,2).map(p => p[0]).join('').toUpperCase();
  const hue = [...name].reduce((a,c)=>a+c.charCodeAt(0),0) % 360;
  if (src) {
    return (
      <div className="pg-avatar" style={{
        width:size, height:size, padding:0, overflow:'hidden', flexShrink:0,
        background: `linear-gradient(155deg, oklch(0.68 0.12 ${hue}), oklch(0.45 0.16 ${(hue+30)%360}))`,
      }}>
        <img src={src} alt={name}
          style={{width:'100%', height:'100%', objectFit:'cover', display:'block', borderRadius:'50%'}}
          onError={e=>{ e.currentTarget.style.display='none'; }}
        />
      </div>
    );
  }
  return (
    <div className="pg-avatar" style={{
      width:size, height:size, fontSize:size*0.36,
      background: `linear-gradient(155deg, oklch(0.68 0.12 ${hue}), oklch(0.45 0.16 ${(hue+30)%360}))`
    }}>{initials}</div>
  );
}

// ── Star rating ───────────────────────────────────────────────
function Stars({ rating=5, size=12 }) {
  const full = Math.floor(rating);
  return (
    <span className="pg-stars">
      {[0,1,2,3,4].map(i => (
        <span key={i} style={{display:'inline-flex'}}>
          {Icon.star(size, i < full ? "currentColor" : "oklch(0.85 0.04 80)", true)}
        </span>
      ))}
    </span>
  );
}

// ── Reputation badge (based on completed jobs) ───────────────
function ReputationBadge({ jobs=0, lang='en', size='sm' }) {
  const levels = [
    { min:0,   label:{en:'Rookie',      pt:'Iniciante',    es:'Novato'}    },
    { min:25,  label:{en:'Reliable',    pt:'Confiável',    es:'Confiable'} },
    { min:76,  label:{en:'Expert',      pt:'Especialista', es:'Experto'}   },
    { min:151, label:{en:'Master',      pt:'Mestre',       es:'Maestro'}   },
    { min:301, label:{en:'Elite',       pt:'Elite',        es:'Elite'}     },
  ];
  const palette = [
    { color:'oklch(0.52 0.13 80)',  bg:'oklch(0.95 0.05 80)'  },
    { color:'oklch(0.48 0.14 210)', bg:'oklch(0.94 0.04 210)' },
    { color:'oklch(0.44 0.17 245)', bg:'oklch(0.93 0.06 245)' },
    { color:'oklch(0.42 0.17 178)', bg:'oklch(0.93 0.06 178)' },
    { color:'oklch(0.42 0.19 310)', bg:'oklch(0.94 0.07 310)' },
  ];
  const idx = levels.reduce((best, lv, i) => (jobs >= lv.min ? i : best), 0);
  const { color, bg } = palette[idx];
  const lbl = tr(levels[idx].label, lang);
  const isLg = size === 'lg';
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:4,
      fontSize: isLg ? 11 : 9.5, fontWeight:700, letterSpacing:'0.05em',
      padding: isLg ? '4px 10px' : '2px 7px', borderRadius:6,
      background:'transparent', color,
      border: `1px solid ${color}`,
    }}>
      {isLg && <span style={{fontSize:12}}>{'⭐'}</span>}
      {lbl.toUpperCase()}
    </span>
  );
}

// ── Scroll lock (prevents background scroll while any sheet is open) ──
let _sheetDepth = 0;
let _savedOverflow = null;
function _lockScreen() {
  _sheetDepth++;
  const el = document.querySelector('[data-pg-screen]');
  if (el) {
    if (_sheetDepth === 1) _savedOverflow = el.style.overflow;
    el.style.overflow = 'hidden';
  }
}
function _unlockScreen() {
  _sheetDepth = Math.max(0, _sheetDepth - 1);
  if (_sheetDepth === 0) {
    const el = document.querySelector('[data-pg-screen]');
    if (el) {
      el.style.overflow = _savedOverflow !== null ? _savedOverflow : 'auto';
      _savedOverflow = null;
    }
  }
}

// ── Full-screen page (replaces Sheet for tall forms to avoid iOS pull-to-refresh) ──
function FullPage({ open, onClose, children }) {
  const [mounted, setMounted] = React.useState(open);
  const [closing, setClosing] = React.useState(false);
  const pageRef = React.useRef(null);

  React.useEffect(() => {
    if (open) { setMounted(true); setClosing(false); }
    else if (mounted) {
      setClosing(true);
      const t = setTimeout(() => { setMounted(false); setClosing(false); }, 300);
      return () => clearTimeout(t);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Block iOS native pull-to-refresh on downward drags, same approach as Sheet:
  // imperative listener with { passive: false } so preventDefault actually works.
  React.useEffect(() => {
    const el = pageRef.current;
    if (!el) return;
    let startY = 0;

    const onStart = (e) => { startY = e.touches[0].clientY; };
    const onMove = (e) => {
      const dy = e.touches[0].clientY - startY;
      if (dy <= 0) return; // upward — allow normal scroll
      // If touching scrollable content that is scrolled down, let it scroll normally
      let node = e.target;
      while (node && node !== el) {
        if (node.scrollTop > 0 && node.scrollHeight > node.clientHeight) return;
        node = node.parentElement;
      }
      e.preventDefault();
    };

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove',  onMove,  { passive: false });
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove',  onMove);
    };
  }, [mounted]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted) return null;

  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 540;
  const desktopW  = isDesktop ? Math.min(520, Math.round(window.innerWidth * 0.96)) : null;
  const style = {
    position: 'fixed',
    bottom: 0,
    top: 0,
    left:  isDesktop ? `calc(50% - ${Math.floor(desktopW / 2)}px)` : 0,
    right: isDesktop ? 'auto' : 0,
    width: isDesktop ? desktopW : '100%',
    zIndex: 1002,
    background: 'var(--pg-bg)',
    overflow: 'hidden',
    overscrollBehavior: 'none',
    display: 'flex',
    flexDirection: 'column',
    animation: closing
      ? 'pg-sheet-down 0.28s cubic-bezier(.36,0,.66,0) forwards'
      : 'pg-sheet-up 0.34s cubic-bezier(.22,1,.36,1)',
  };

  return <div ref={pageRef} data-pg-fullpage style={style}>{children}</div>;
}

// ── Bottom Sheet ──────────────────────────────────────────────
function Sheet({ open, onClose, children, height='auto' }) {
  const [mounted, setMounted]   = React.useState(open);
  const [closing, setClosing]   = React.useState(false);
  const lockedRef    = React.useRef(false);
  const sheetRef     = React.useRef(null);
  const backdropRef  = React.useRef(null);
  const skipAnimRef  = React.useRef(false); // true when drag already animated the exit

  React.useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
      skipAnimRef.current = false;
      if (!lockedRef.current) { lockedRef.current = true; _lockScreen(); }
    } else if (mounted) {
      if (skipAnimRef.current) {
        // Drag already handled the exit animation — unmount immediately
        skipAnimRef.current = false;
        setMounted(false);
        setClosing(false);
        if (lockedRef.current) { lockedRef.current = false; _unlockScreen(); }
      } else {
        setClosing(true);
        const t = setTimeout(() => {
          setMounted(false);
          setClosing(false);
          if (lockedRef.current) { lockedRef.current = false; _unlockScreen(); }
        }, 260);
        return () => clearTimeout(t);
      }
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    return () => { if (lockedRef.current) { lockedRef.current = false; _unlockScreen(); } };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Swipe-to-dismiss on the entire sheet.
  // Uses imperative addEventListener with { passive: false } so preventDefault works on iOS.
  React.useEffect(() => {
    const el = sheetRef.current;
    if (!el) return;
    let startY = 0, dragging = false, offset = 0;

    const onStart = (e) => {
      startY = e.touches[0].clientY;
      dragging = false;
      offset = 0;
    };
    const onMove = (e) => {
      const dy = e.touches[0].clientY - startY;
      if (dy <= 0) { dragging = false; return; }
      // If touching scrollable content that is scrolled down, let browser scroll normally
      let node = e.target;
      while (node && node !== el) {
        if (node.scrollTop > 0 && node.scrollHeight > node.clientHeight) return;
        node = node.parentElement;
      }
      // Prevent pull-to-refresh as soon as downward drag is detected (before threshold)
      e.preventDefault();
      if (!dragging && dy > 10) dragging = true;
      if (dragging) {
        offset = dy;
        el.style.transform = `translateY(${dy}px)`;
        el.style.transition = 'none';
      }
    };
    const onEnd = () => {
      if (dragging && offset > 80) {
        // Animate sheet off-screen from current position, then close (no CSS class glitch)
        const fullH = el.offsetHeight;
        el.style.transition = 'transform 0.22s cubic-bezier(.36,0,.66,0)';
        el.style.transform = `translateY(${fullH}px)`;
        skipAnimRef.current = true;
        setTimeout(() => onClose(), 220);
      } else {
        // Snap back smoothly
        el.style.transition = 'transform 0.28s cubic-bezier(.22,1,.36,1)';
        el.style.transform = '';
        setTimeout(() => { if (el) el.style.transition = ''; }, 280);
      }
      dragging = false;
      offset = 0;
    };

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove',  onMove,  { passive: false });
    el.addEventListener('touchend',   onEnd,   { passive: true });
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove',  onMove);
      el.removeEventListener('touchend',   onEnd);
    };
  }, [mounted, onClose]); // eslint-disable-line react-hooks/exhaustive-deps

  // Backdrop has no scrollable content — always block native pull-to-refresh on it.
  // Must be a real (non-passive) listener: React's onTouchMove prop is passive by
  // default and can't call preventDefault, which let drags on the backdrop fall
  // through to iOS's native pull-to-refresh.
  React.useEffect(() => {
    const el = backdropRef.current;
    if (!el) return;
    const onMove = (e) => e.preventDefault();
    el.addEventListener('touchmove', onMove, { passive: false });
    return () => el.removeEventListener('touchmove', onMove);
  }, [mounted]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted) return null;

  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 540;
  const desktopW  = isDesktop ? Math.min(520, Math.round(window.innerWidth * 0.96)) : null;
  const desktopStyle = isDesktop ? {
    left:  `calc(50% - ${Math.floor(desktopW / 2)}px)`,
    right: 'auto',
    width: desktopW,
    borderRadius: '20px 20px 0 0',
  } : {};

  return (
    <>
      <div
        ref={backdropRef}
        className={`pg-sheet-backdrop${closing ? ' pg-sheet-backdrop-out' : ''}`}
        onClick={onClose}
        onWheel={e => e.stopPropagation()}
      />
      <div
        ref={sheetRef}
        className={`pg-sheet${closing ? ' pg-sheet-down' : ''}`}
        style={{height, ...desktopStyle}}
        onWheel={e => e.stopPropagation()}
      >
        <div style={{padding:'10px 0 6px', cursor:'ns-resize'}}>
          <div className="pg-sheet-grabber" style={{margin:'0 auto'}}/>
        </div>
        {children}
      </div>
    </>
  );
}

// ── Top App Header (for screens) ──────────────────────────────
function TopBar({ title, left, right, subtitle }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'8px 18px 10px', minHeight:48,
    }}>
      <div style={{display:'flex', alignItems:'center', gap:10, minWidth:0}}>
        {left}
        <div style={{minWidth:0}}>
          <div style={{fontSize:20, fontWeight:700, letterSpacing:'-0.02em', color:'var(--pg-ink-900)'}}>{title}</div>
          {subtitle && <div style={{fontSize:12, color:'var(--pg-ink-500)', marginTop:1}}>{subtitle}</div>}
        </div>
      </div>
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        {right}
      </div>
    </div>
  );
}

function IconButton({ children, onClick, badge, dark=false }) {
  return (
    <button onClick={onClick} className="pg-press" style={{
      width:38, height:38, borderRadius:12,
      background: dark ? 'rgba(255,255,255,0.14)' : 'rgba(10,40,64,0.09)',
      border: dark ? 'none' : '0.5px solid rgba(10,40,64,0.18)',
      color: dark ? '#fff' : '#0A2840',
      display:'flex', alignItems:'center', justifyContent:'center',
      cursor:'pointer', position:'relative',
    }}>
      {children}
      {badge && <span style={{
        position:'absolute', top:6, right:6, width:8, height:8, borderRadius:'50%',
        background:'var(--pg-danger)', border:'1.5px solid '+ (dark?'#0b1530':'#fff'),
      }} />}
    </button>
  );
}

// ── Tab bar (5 tabs, center elevated) ─────────────────────────
function TabBar({ tab, setTab, lang='en' }) {
  const t = STRINGS[lang];
  const tabs = [
    { id:'home',   label:t.home,        icon:Icon.home },
    { id:'market', label:t.marketplace, icon:Icon.cart },
    { id:'quick',  label:t.quickPools,  icon:Icon.bolt, center:true },
    { id:'work',   label:t.work,        icon:Icon.briefcase },
    { id:'profile',label:t.profile,     icon:Icon.user },
  ];
  return (
    <div className="pg-tabbar" style={{padding:'0px 6px 0px'}}>
      {tabs.map(tb => {
        const on = tb.id === tab;
        if (tb.center) {
          return (
            <button key={tb.id} className="pg-tab pg-tab-center" onClick={()=>setTab(tb.id)} style={{padding:'0px 0', gap:3}}>
              <div className={`pg-tab-center-dot ${on?'on':''}`}>
                {tb.icon(26, '#fff')}
              </div>
              <span className="pg-tab-label" style={{color: on ? 'var(--pg-aqua-700)' : 'var(--pg-ink-700)', fontWeight:700}}>
                {tb.label.split(' ')[0]}<br/>{tb.label.split(' ').slice(1).join(' ')}
              </span>
            </button>
          );
        }
        return (
          <button key={tb.id} className={`pg-tab ${on?'pg-tab-on':''}`} onClick={()=>setTab(tb.id)} style={{padding:'0px 0', gap:3, marginTop:15}}>
            {tb.icon(24, on ? 'var(--pg-blue-500)' : 'var(--pg-ink-500)')}
            <span className="pg-tab-label">{tb.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Language selector pill ────────────────────────────────────
function LangPill({ lang, setLang, onDark=false }) {
  const [open, setOpen] = React.useState(false);
  const [pos,  setPos]  = React.useState({ top:0, right:0 });
  const btnRef      = React.useRef(null);
  const dropdownRef = React.useRef(null);

  const LANGS = [
    { code:'en', label:'EN', flag:'🇺🇸', name:'English'   },
    { code:'pt', label:'PT', flag:'🇧🇷', name:'Português' },
    { code:'es', label:'ES', flag:'🇪🇸', name:'Español'   },
  ];
  const current = LANGS.find(l => l.code === lang) || LANGS[0];

  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
    }
    setOpen(o => !o);
  };

  React.useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (btnRef.current && btnRef.current.contains(e.target)) return;
      if (dropdownRef.current && dropdownRef.current.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('touchstart', close); };
  }, [open]);

  const dropdown = open ? ReactDOM.createPortal(
    <div style={{
      position:'fixed', top: pos.top, right: pos.right, zIndex:999999,
      background:'rgba(30,32,38,0.72)',
      WebkitBackdropFilter:'blur(20px) saturate(160%)',
      backdropFilter:'blur(20px) saturate(160%)',
      borderRadius:14, overflow:'hidden',
      boxShadow:'0 8px 28px rgba(0,0,0,0.32), 0 1px 0 rgba(255,255,255,0.08) inset',
      border:'0.5px solid rgba(255,255,255,0.13)',
      minWidth:148,
      transformOrigin:'top right',
      animation:'_lpIn .18s cubic-bezier(0.34,1.56,0.64,1)',
    }} ref={dropdownRef}>
      <style>{`@keyframes _lpIn{from{opacity:0;transform:scale(0.88)}to{opacity:1;transform:scale(1)}}`}</style>
      {LANGS.map((l, i) => {
        const active = l.code === lang;
        return (
          <button key={l.code} onClick={()=>{ setLang(l.code); setOpen(false); }} style={{
            display:'flex', alignItems:'center', gap:9,
            width:'100%', padding:'10px 13px', border:'none', cursor:'pointer',
            borderBottom: i < LANGS.length-1 ? '0.5px solid rgba(255,255,255,0.07)' : 'none',
            background: active ? 'rgba(14,186,199,0.15)' : 'transparent',
          }}>
            <span style={{fontSize:18, lineHeight:1}}>{l.flag}</span>
            <span style={{flex:1, textAlign:'left', fontSize:13, fontWeight: active ? 700 : 400,
              color: active ? '#0EBAC7' : 'rgba(255,255,255,0.85)'}}>{l.name}</span>
            {active && (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="#0EBAC7" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}
          </button>
        );
      })}
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button ref={btnRef} className="pg-press" onClick={toggle} style={{
        display:'inline-flex', alignItems:'center', gap:5,
        height:32, padding:'0 9px 0 7px', borderRadius:10,
        background: onDark ? 'rgba(255,255,255,0.14)' : 'rgba(10,40,64,0.09)',
        border: onDark ? '0.5px solid rgba(255,255,255,0.18)' : '0.5px solid rgba(10,40,64,0.18)',
        color: onDark ? '#fff' : '#0A2840',
        fontSize:12, fontWeight:600, cursor:'pointer',
      }}>
        <span style={{fontSize:15, lineHeight:1}}>{current.flag}</span>
        <span style={{letterSpacing:'0.04em'}}>{current.label}</span>
      </button>
      {dropdown}
    </>
  );
}

// ── PhotoPicker — camera / gallery + Supabase Storage upload ────────────────
// Defined here (components.jsx) so it's available in ALL screen files.
function PhotoPicker({ photos=[], onAdd, onRemove, max=5, lang='en', title }) {
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [uploading,  setUploading]  = React.useState(false);
  const camRef = React.useRef(null);
  const galRef = React.useRef(null);

  const titleLbl = title || (lang==='pt'?'Fotos':lang==='es'?'Fotos':'Photos');
  const hintLbl  = lang==='pt'?`Até ${max} fotos · a primeira é a capa`
                 : lang==='es'?`Hasta ${max} fotos · la primera es la portada`
                 : `Up to ${max} photos · first is the cover`;
  const canAdd = photos.length < max;

  const compress = (file) => new Promise(resolve => {
    const img = new Image();
    const src = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 1200;
      let w = img.width, h = img.height;
      if (w > MAX || h > MAX) {
        if (w >= h) { h = Math.round(h * MAX / w); w = MAX; }
        else        { w = Math.round(w * MAX / h); h = MAX; }
      }
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(src);
      c.toBlob(b => resolve(b), 'image/jpeg', 0.78);
    };
    img.src = src;
  });

  const handleFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file || !canAdd) return;
    setPickerOpen(false);
    setUploading(true);
    try {
      const blob = await compress(file);
      let url = null;
      if (window.sb && window.sb.storage) {
        const path = 'posts/' + Date.now() + '-' + Math.random().toString(36).slice(2) + '.jpg';
        const { data, error } = await window.sb.storage.from('post-images').upload(path, blob, { contentType:'image/jpeg' });
        if (!error && data) {
          const { data: ud } = window.sb.storage.from('post-images').getPublicUrl(path);
          url = ud.publicUrl;
        }
      }
      if (!url) {
        url = await new Promise(res => {
          const r = new FileReader();
          r.onload = ev => res(ev.target.result);
          r.readAsDataURL(blob);
        });
      }
      onAdd && onAdd(url);
    } catch(err) { console.warn('[PhotoPicker]', err); }
    finally { setUploading(false); }
  };

  const SZ = 88;
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10}}>
        <div>
          <div style={{fontSize:13, fontWeight:700, color:'var(--pg-ink-900)'}}>{titleLbl}</div>
          <div style={{fontSize:11, color:'var(--pg-ink-400)', marginTop:2}}>{hintLbl}</div>
        </div>
        <span style={{
          fontSize:11, fontWeight:700, padding:'3px 9px', borderRadius:6,
          background: photos.length===max ? 'var(--pg-blue-500)' : 'var(--pg-ink-100)',
          color: photos.length===max ? '#fff' : 'var(--pg-ink-500)',
        }}>{photos.length}/{max}</span>
      </div>

      <div style={{display:'flex', gap:8, overflowX:'auto', paddingBottom:4, scrollbarWidth:'none'}}>
        {photos.map((url, i) => (
          <div key={i} style={{position:'relative', flexShrink:0, width:SZ, height:SZ}}>
            <img src={url} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:10,display:'block'}}/>
            {i===0 && (
              <div style={{
                position:'absolute',bottom:0,left:0,right:0,
                background:'linear-gradient(transparent,rgba(0,0,0,0.6))',
                borderRadius:'0 0 10px 10px',
                fontSize:8,fontWeight:700,color:'#fff',textAlign:'center',
                letterSpacing:'0.07em',padding:'3px 0 5px',
              }}>{lang==='pt'?'CAPA':lang==='es'?'PORTADA':'COVER'}</div>
            )}
            <button onClick={()=>onRemove && onRemove(url)} style={{
              position:'absolute',top:-6,right:-6,
              width:22,height:22,borderRadius:'50%',
              background:'var(--pg-danger,#ff3b30)',border:'2.5px solid #fff',
              cursor:'pointer',padding:0,
              display:'flex',alignItems:'center',justifyContent:'center',
            }}>{Icon.x(9,'#fff')}</button>
          </div>
        ))}
        {canAdd && !uploading && (
          <button onClick={()=>setPickerOpen(true)} style={{
            flexShrink:0,width:SZ,height:SZ,borderRadius:10,cursor:'pointer',
            border:'2px dashed var(--pg-ink-300)',
            background:'var(--pg-ink-50,#f7f9fb)',
            display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:6,
          }}>
            <span style={{fontSize:24}}>📷</span>
            <span style={{fontSize:9.5,color:'var(--pg-ink-400)',fontWeight:600}}>
              {lang==='pt'?'Adicionar':lang==='es'?'Agregar':'Add photo'}
            </span>
          </button>
        )}
        {uploading && (
          <div style={{flexShrink:0,width:SZ,height:SZ,borderRadius:10,background:'var(--pg-ink-100)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <span style={{fontSize:22}}>⏳</span>
          </div>
        )}
      </div>

      {pickerOpen && (
        <div onClick={()=>setPickerOpen(false)} style={{
          position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',
          zIndex:9999,display:'flex',alignItems:'flex-end',justifyContent:'center',
        }}>
          <div onClick={e=>e.stopPropagation()} style={{
            background:'var(--pg-white)',borderRadius:'20px 20px 0 0',
            padding:'16px 16px 40px',width:'100%',maxWidth:480,
            boxShadow:'0 -8px 40px rgba(0,0,0,0.18)',
          }}>
            <div style={{width:40,height:4,borderRadius:2,background:'var(--pg-ink-200)',margin:'0 auto 18px'}}/>
            <div style={{fontWeight:700,fontSize:16,textAlign:'center',marginBottom:18,color:'var(--pg-ink-900)'}}>
              {lang==='pt'?'Adicionar foto':lang==='es'?'Agregar foto':'Add photo'}
            </div>
            <button onClick={()=>camRef.current&&camRef.current.click()} style={{
              width:'100%',padding:'15px 18px',marginBottom:10,borderRadius:14,
              border:'1.5px solid var(--pg-ink-200)',background:'var(--pg-white)',
              display:'flex',alignItems:'center',gap:14,cursor:'pointer',fontFamily:'inherit',
            }}>
              <span style={{fontSize:28}}>📷</span>
              <div style={{textAlign:'left'}}>
                <div style={{fontWeight:700,fontSize:15,color:'var(--pg-ink-900)'}}>
                  {lang==='pt'?'Tirar foto':lang==='es'?'Tomar foto':'Take photo'}
                </div>
                <div style={{fontSize:12,color:'var(--pg-ink-500)',marginTop:2}}>
                  {lang==='pt'?'Usar câmera do celular':lang==='es'?'Usar cámara del celular':'Use your phone camera'}
                </div>
              </div>
            </button>
            <button onClick={()=>galRef.current&&galRef.current.click()} style={{
              width:'100%',padding:'15px 18px',marginBottom:16,borderRadius:14,
              border:'1.5px solid var(--pg-ink-200)',background:'var(--pg-white)',
              display:'flex',alignItems:'center',gap:14,cursor:'pointer',fontFamily:'inherit',
            }}>
              <span style={{fontSize:28}}>🖼️</span>
              <div style={{textAlign:'left'}}>
                <div style={{fontWeight:700,fontSize:15,color:'var(--pg-ink-900)'}}>
                  {lang==='pt'?'Escolher da galeria':lang==='es'?'Elegir de la galería':'Choose from gallery'}
                </div>
                <div style={{fontSize:12,color:'var(--pg-ink-500)',marginTop:2}}>
                  {lang==='pt'?'Acessar fotos salvas':lang==='es'?'Acceder a fotos guardadas':'Access saved photos'}
                </div>
              </div>
            </button>
            <button onClick={()=>setPickerOpen(false)} style={{
              width:'100%',padding:'14px',borderRadius:14,border:'none',
              background:'var(--pg-ink-100)',color:'var(--pg-ink-700)',
              fontWeight:600,fontSize:15,cursor:'pointer',fontFamily:'inherit',
            }}>{lang==='pt'?'Cancelar':lang==='es'?'Cancelar':'Cancel'}</button>
          </div>
        </div>
      )}
      <input ref={camRef} type="file" accept="image/*" capture="environment" style={{display:'none',position:'absolute'}} onChange={handleFile}/>
      <input ref={galRef} type="file" accept="image/*" style={{display:'none',position:'absolute'}} onChange={handleFile}/>
    </div>
  );
}

// Simple shimmer line
function Shimmer({ w=80, h=10 }) {
  return <div style={{width:w, height:h, borderRadius:4, background:'var(--pg-ink-100)'}}/>;
}

// ── Tx — auto-translate user-generated text to the viewer's language ──
// Uses MyMemory free API (no key needed). Results cached in window._txCache.
// Assumes source content is Portuguese (default for this app/community).
// Shows original text immediately, replaces with translation asynchronously.
window._txCache = window._txCache || new Map();
function Tx({ children, lang, src }) {
  const srcLang = src || 'pt';
  const txt = String(children || '').trim();
  const [out, setOut] = React.useState(txt);
  React.useEffect(() => {
    if (!txt || lang === srcLang) { setOut(txt); return; }
    const key = `${srcLang}|${lang}|${txt}`;
    if (window._txCache.has(key)) { setOut(window._txCache.get(key)); return; }
    let live = true;
    fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(txt.slice(0, 500))}&langpair=${srcLang}|${lang}&de=felipelwo@gmail.com`)
      .then(r => r.json())
      .then(d => {
        if (!live) return;
        const t = d?.responseData?.translatedText;
        const res = (t && d.responseStatus === 200) ? t : txt;
        window._txCache.set(key, res);
        setOut(res);
      })
      .catch(() => {});
    return () => { live = false; };
  }, [txt, lang]);
  return out;
}

Object.assign(window, { Icon, Avatar, Stars, ReputationBadge, Sheet, FullPage, TopBar, IconButton, TabBar, LangPill, Shimmer, Tx, _lockScreen, _unlockScreen });
