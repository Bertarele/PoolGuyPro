function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// marketplace.jsx — navy header + dual seg + distance + categories

// ── Locale-aware number/price formatter ──────────────────────
// PT/ES use "." as thousands sep; EN uses ","
function fmtN(n, lang) {
  const s = Number(n || 0).toLocaleString('en-US');
  return lang === 'en' ? s : s.replace(/,/g, '.');
}

// ── Time ago helper ──────────────────────────────────────────
function timeAgo(iso, lang = 'en') {
  if (!iso) return '';
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return lang === 'pt' ? 'agora' : lang === 'es' ? 'ahora' : 'just now';
  if (diff < 3600) {
    const m = Math.floor(diff / 60);
    return lang === 'pt' ? `${m}min` : lang === 'es' ? `${m}min` : `${m}m ago`;
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    return lang === 'pt' ? `${h}h` : lang === 'es' ? `${h}h` : `${h}h ago`;
  }
  if (diff < 604800) {
    const d = Math.floor(diff / 86400);
    return lang === 'pt' ? `${d}d` : lang === 'es' ? `${d}d` : `${d}d ago`;
  }
  const w = Math.floor(diff / 604800);
  return lang === 'pt' ? `${w}sem` : lang === 'es' ? `${w}sem` : `${w}w ago`;
}

// ── Boost (paid listing highlight) ────────────────────────────
// NOTE: prices are placeholders — final values TBD, easy to tweak here.
const BOOST_PLANS = [{
  days: 3,
  price: 4.99
}, {
  days: 7,
  price: 8.99
}, {
  days: 14,
  price: 14.99
}];
function BoostListingSheet({
  item,
  lang,
  onClose,
  onBoosted,
  showToast
}) {
  const [planIdx, setPlanIdx] = React.useState(1); // default: 7 days
  const [buying, setBuying] = React.useState(false);
  const plan = BOOST_PLANS[planIdx];
  const alreadyBoosted = item.boostedUntil && new Date(item.boostedUntil) > new Date();
  const handleBuy = async () => {
    if (!window.sb || buying) return;
    setBuying(true);
    // Open external checkout — no Apple cut, same pattern as subscription upgrades
    window.open(`https://poolguyx.com/boost/${item._id}?days=${plan.days}`, '_blank', 'noopener');
    // NOTE: In production, remove the block below. Boost is activated server-side
    // via payment webhook once pricing is finalized. Kept here for demo/testing only.
    const until = new Date(Date.now() + plan.days * 86400000).toISOString();
    const {
      error
    } = await window.sb.from('marketplace').update({
      boosted_until: until
    }).eq('id', item._id);
    setBuying(false);
    if (error) {
      showToast && showToast('❌ ' + error.message);
      return;
    }
    showToast && showToast(lang === 'pt' ? '🚀 Anúncio destacado!' : lang === 'es' ? '🚀 ¡Anuncio destacado!' : '🚀 Listing boosted!');
    onBoosted && onBoosted(until);
    onClose && onClose();
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 18px 36px'
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
      fontSize: 18,
      fontWeight: 800,
      color: 'var(--pg-ink-900)',
      fontFamily: 'var(--pg-font-display)',
      marginBottom: 4
    }
  }, "\uD83D\uDE80 ", lang === 'pt' ? 'Destacar anúncio' : lang === 'es' ? 'Destacar anuncio' : 'Boost listing'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--pg-ink-500)',
      marginBottom: 20,
      lineHeight: 1.5
    }
  }, lang === 'pt' ? `Coloque "${item.name}" na seção de Destaques da tela inicial para mais visibilidade.` : lang === 'es' ? `Coloca "${item.name}" en la sección de Destacados de la pantalla principal para más visibilidad.` : `Get "${item.name}" placed in the Featured Listings section on Home for extra visibility.`), alreadyBoosted && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16,
      padding: '11px 14px',
      borderRadius: 12,
      background: 'rgba(14,186,199,0.10)',
      border: '1.5px solid rgba(14,186,199,0.35)',
      fontSize: 12.5,
      color: '#0EBAC7',
      fontWeight: 600
    }
  }, lang === 'pt' ? `Já está destacado até ${new Date(item.boostedUntil).toLocaleDateString('pt-BR')}. Comprar de novo estende o prazo.` : lang === 'es' ? `Ya está destacado hasta ${new Date(item.boostedUntil).toLocaleDateString('es-ES')}. Comprar de nuevo extiende el plazo.` : `Already boosted until ${new Date(item.boostedUntil).toLocaleDateString('en-US')}. Buying again extends it.`), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      marginBottom: 20
    }
  }, BOOST_PLANS.map((pl, i) => /*#__PURE__*/React.createElement("button", {
    key: pl.days,
    onClick: () => setPlanIdx(i),
    style: {
      padding: '14px 16px',
      borderRadius: 12,
      border: '1.5px solid ' + (planIdx === i ? '#0EBAC7' : 'var(--pg-ink-200)'),
      background: planIdx === i ? 'rgba(14,186,199,0.08)' : 'var(--pg-white)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
      fontFamily: 'inherit',
      textAlign: 'left',
      transition: 'all .12s'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: 'var(--pg-ink-900)'
    }
  }, pl.days, " ", lang === 'pt' ? 'dias' : lang === 'es' ? 'días' : 'days'), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      fontWeight: 800,
      color: '#0EBAC7'
    }
  }, "$", pl.price), planIdx === i && /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#0EBAC7",
    strokeWidth: "2.5",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "20 6 9 17 4 12"
  })))))), /*#__PURE__*/React.createElement("button", {
    onClick: handleBuy,
    disabled: buying,
    style: {
      width: '100%',
      padding: '15px',
      borderRadius: 14,
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'inherit',
      fontSize: 15,
      fontWeight: 700,
      color: '#fff',
      background: 'linear-gradient(135deg,#0EBAC7,#0891A0)',
      opacity: buying ? 0.7 : 1,
      transition: 'all .15s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8
    }
  }, buying ? '...' : lang === 'pt' ? `Destacar por $${plan.price}` : lang === 'es' ? `Destacar por $${plan.price}` : `Boost for $${plan.price}`), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      width: '100%',
      marginTop: 10,
      padding: '12px',
      borderRadius: 14,
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'inherit',
      fontSize: 14,
      fontWeight: 600,
      background: 'var(--pg-ink-100)',
      color: 'var(--pg-ink-600)'
    }
  }, lang === 'pt' ? 'Cancelar' : lang === 'es' ? 'Cancelar' : 'Cancel'));
}

// ── Share bottom sheet ───────────────────────────────────────
function ShareSheet({
  item,
  lang,
  onClose,
  showToast
}) {
  if (!item) return null;
  const listingUrl = item._id ? `https://poolguyx.com/?listing=${item._id}` : 'https://poolguyx.com';
  const txt = `${item.name}${item.priceMode === 'neg' ? ' — Negotiable' : item.price ? ` — $${item.price}` : ''}  📍 ${item.loc || 'Broward County, FL'}\n\nFind it on PoolGuyX 👉 ${listingUrl}`;
  const enc = encodeURIComponent(txt);
  const btn = (label, icon, href, color, onClick) => /*#__PURE__*/React.createElement("a", {
    href: href || '#',
    onClick: onClick || (e => {
      if (!href) {
        e.preventDefault();
      }
    }),
    target: href ? '_blank' : undefined,
    rel: "noreferrer",
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 7,
      textDecoration: 'none',
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 54,
      height: 54,
      borderRadius: 16,
      background: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 22,
      boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
    }
  }, icon), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      color: 'var(--pg-ink-700)'
    }
  }, label));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.45)',
      zIndex: 8000,
      display: 'flex',
      alignItems: 'flex-end'
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: '100%',
      background: 'var(--pg-white)',
      borderRadius: '22px 22px 0 0',
      padding: '20px 24px 40px',
      boxShadow: '0 -4px 32px rgba(0,0,0,0.15)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 4,
      borderRadius: 999,
      background: 'var(--pg-ink-200)',
      margin: '0 auto 18px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--pg-font-display)',
      fontSize: 16,
      fontWeight: 700,
      color: 'var(--pg-ink-900)',
      marginBottom: 4
    }
  }, lang === 'pt' ? 'Compartilhar anúncio' : lang === 'es' ? 'Compartir anuncio' : 'Share listing'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--pg-ink-500)',
      marginBottom: 20,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, item.name), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 16,
      justifyContent: 'center',
      marginBottom: 20
    }
  }, btn('WhatsApp', '💬', `https://wa.me/?text=${enc}`, '#25D366'), btn('SMS', '📱', `sms:?body=${enc}`, '#5AC8FA'), btn(lang === 'pt' ? 'Copiar' : lang === 'es' ? 'Copiar' : 'Copy', '📋', null, 'var(--pg-ink-100)', e => {
    e.preventDefault();
    navigator.clipboard && navigator.clipboard.writeText(`${item.name} — ${listingUrl}`).then(() => {
      if (showToast) showToast('✓ ' + (lang === 'pt' ? 'Link copiado!' : 'Link copied!'));
      onClose();
    });
  })), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      width: '100%',
      height: 46,
      borderRadius: 13,
      border: '1.5px solid var(--pg-ink-200)',
      background: 'transparent',
      color: 'var(--pg-ink-600)',
      fontSize: 14,
      fontWeight: 600,
      cursor: 'pointer',
      fontFamily: 'inherit'
    }
  }, lang === 'pt' ? 'Cancelar' : lang === 'es' ? 'Cancelar' : 'Cancel')));
}

// ── Fullscreen Photo Viewer ───────────────────────────────────
function PhotoViewer({
  photos,
  startIdx = 0,
  onClose
}) {
  const [idx, setIdx] = React.useState(startIdx);
  const prev = e => {
    e.stopPropagation();
    setIdx(i => (i - 1 + photos.length) % photos.length);
  };
  const next = e => {
    e.stopPropagation();
    setIdx(i => (i + 1) % photos.length);
  };

  // Fechar com ESC
  React.useEffect(() => {
    const handler = e => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Travar scroll do body
  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(0,0,0,0.96)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      padding: '14px 18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)',
      zIndex: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: 'rgba(255,255,255,0.70)'
    }
  }, photos.length > 1 ? `${idx + 1} / ${photos.length}` : ''), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      width: 36,
      height: 36,
      borderRadius: '50%',
      border: 'none',
      cursor: 'pointer',
      background: 'rgba(255,255,255,0.15)',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 20,
      lineHeight: 1
    }
  }, "\xD7")), /*#__PURE__*/React.createElement("img", {
    src: photos[idx],
    alt: "",
    onClick: e => e.stopPropagation(),
    style: {
      maxWidth: '100%',
      maxHeight: '100%',
      objectFit: 'contain',
      display: 'block',
      userSelect: 'none',
      borderRadius: 4
    }
  }), photos.length > 1 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    onClick: prev,
    style: {
      position: 'absolute',
      left: 12,
      top: '50%',
      transform: 'translateY(-50%)',
      width: 44,
      height: 44,
      borderRadius: '50%',
      border: 'none',
      cursor: 'pointer',
      background: 'rgba(255,255,255,0.15)',
      color: '#fff',
      fontSize: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(4px)'
    }
  }, "\u2039"), /*#__PURE__*/React.createElement("button", {
    onClick: next,
    style: {
      position: 'absolute',
      right: 12,
      top: '50%',
      transform: 'translateY(-50%)',
      width: 44,
      height: 44,
      borderRadius: '50%',
      border: 'none',
      cursor: 'pointer',
      background: 'rgba(255,255,255,0.15)',
      color: '#fff',
      fontSize: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(4px)'
    }
  }, "\u203A")), photos.length > 1 && /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: 'absolute',
      bottom: 24,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: 6
    }
  }, photos.map((_, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    onClick: () => setIdx(i),
    style: {
      width: i === idx ? 20 : 7,
      height: 7,
      borderRadius: 4,
      cursor: 'pointer',
      background: i === idx ? '#fff' : 'rgba(255,255,255,0.35)',
      transition: 'width .18s, background .18s'
    }
  }))));
}

// ── Photo Carousel ────────────────────────────────────────────
function PhotoCarousel({
  urls = [],
  fallbackCat = 'Tools',
  height = 220
}) {
  const photos = urls.filter(Boolean);
  const [idx, setIdx] = React.useState(0);
  const [viewerOpen, setViewerOpen] = React.useState(false);
  const prev = e => {
    e.stopPropagation();
    setIdx(i => (i - 1 + photos.length) % photos.length);
  };
  const next = e => {
    e.stopPropagation();
    setIdx(i => (i + 1) % photos.length);
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height,
      background: 'var(--pg-ink-200)',
      overflow: 'hidden',
      flexShrink: 0
    }
  }, photos.length > 0 ? /*#__PURE__*/React.createElement("img", {
    src: photos[idx],
    alt: "",
    onClick: () => setViewerOpen(true),
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block',
      cursor: 'zoom-in'
    }
  }) : /*#__PURE__*/React.createElement(NoPhotoPlaceholder, {
    height: height
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(to bottom,rgba(0,0,0,0.18) 0%,transparent 45%,rgba(0,0,0,0.25) 100%)',
      pointerEvents: 'none'
    }
  }), photos.length > 0 && /*#__PURE__*/React.createElement("div", {
    onClick: () => setViewerOpen(true),
    style: {
      position: 'absolute',
      bottom: 10,
      right: 10,
      zIndex: 2,
      width: 28,
      height: 28,
      borderRadius: 8,
      cursor: 'zoom-in',
      background: 'rgba(0,0,0,0.40)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#fff",
    strokeWidth: "2.5",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "8"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "21",
    y1: "21",
    x2: "16.65",
    y2: "16.65"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "11",
    y1: "8",
    x2: "11",
    y2: "14"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "8",
    y1: "11",
    x2: "14",
    y2: "11"
  }))), photos.length > 1 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    onClick: prev,
    style: {
      position: 'absolute',
      left: 10,
      top: '50%',
      transform: 'translateY(-50%)',
      width: 32,
      height: 32,
      borderRadius: '50%',
      border: 'none',
      cursor: 'pointer',
      background: 'rgba(0,0,0,0.45)',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, "\u2039"), /*#__PURE__*/React.createElement("button", {
    onClick: next,
    style: {
      position: 'absolute',
      right: 10,
      top: '50%',
      transform: 'translateY(-50%)',
      width: 32,
      height: 32,
      borderRadius: '50%',
      border: 'none',
      cursor: 'pointer',
      background: 'rgba(0,0,0,0.45)',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, "\u203A"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 10,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: 5
    }
  }, photos.map((_, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    onClick: e => {
      e.stopPropagation();
      setIdx(i);
    },
    style: {
      width: i === idx ? 18 : 6,
      height: 6,
      borderRadius: 3,
      cursor: 'pointer',
      background: i === idx ? '#fff' : 'rgba(255,255,255,0.5)',
      transition: 'width .2s, background .2s'
    }
  }))))), viewerOpen && photos.length > 0 && /*#__PURE__*/React.createElement(PhotoViewer, {
    photos: photos,
    startIdx: idx,
    onClose: () => setViewerOpen(false)
  }));
}

// ── Mark as Sold Sheet ───────────────────────────────────────────────────────
function MarkSoldSheet({
  item,
  lang,
  currentUser,
  onClose,
  onSold,
  showToast
}) {
  const [contacts, setContacts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [selected, setSelected] = React.useState(null);
  const [confirming, setConfirming] = React.useState(false);
  React.useEffect(() => {
    if (!window.sb || !currentUser?.uid) {
      setLoading(false);
      return;
    }
    window.sb.from('conversations').select('id,participant_1,participant_2,name_1,name_2').or(`participant_1.eq.${currentUser.uid},participant_2.eq.${currentUser.uid}`).order('last_message_at', {
      ascending: false
    }).then(({
      data
    }) => {
      if (!data) {
        setLoading(false);
        return;
      }
      const seen = new Set();
      const mapped = data.reduce((acc, c) => {
        const amP1 = c.participant_1 === currentUser.uid;
        const id = amP1 ? c.participant_2 : c.participant_1;
        const name = amP1 ? c.name_2 || '?' : c.name_1 || '?';
        if (id && id !== currentUser.uid && !seen.has(id)) {
          seen.add(id);
          acc.push({
            id,
            name
          });
        }
        return acc;
      }, []);
      setContacts(mapped);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [currentUser]);
  const handleConfirm = async () => {
    if (!selected || !window.sb || !currentUser?.uid) return;
    setConfirming(true);
    try {
      // Update listing status (silently succeeds even if already sold — idempotent)
      const {
        error: e1
      } = await window.sb.from('marketplace').update({
        status: 'sold',
        buyer_id: selected.id,
        sold_at: new Date().toISOString()
      }).eq('id', item._id);
      if (e1) throw e1;

      // Guard: check if ratings already exist for this listing to prevent duplicates on retry
      const {
        data: existing
      } = await window.sb.from('ratings').select('id, from_id, pending').eq('listing_id', item._id).limit(10);
      const hasSellerRating = (existing || []).some(r => r.from_id === currentUser.uid);
      if (!hasSellerRating) {
        // First time: insert pending ratings for both parties
        await window.sb.from('ratings').insert([{
          listing_id: item._id,
          listing_name: item.name || '',
          from_id: currentUser.uid,
          from_name: currentUser.name || currentUser.email || '',
          to_id: selected.id,
          stars: null,
          comment: '',
          pending: true
        }, {
          listing_id: item._id,
          listing_name: item.name || '',
          from_id: selected.id,
          from_name: selected.name,
          to_id: currentUser.uid,
          stars: null,
          comment: '',
          pending: true
        }]);
      }
      // If ratings already exist (retry case), skip insert — just fetch the existing one

      // Fetch the seller's own placeholder rating, only if not yet submitted (stars still
      // null) — `pending` stays true even after submitting (it means "still in the 7-day
      // blind window"), so checking it here would wrongly reopen an already-submitted rating.
      const {
        data: myRatings
      } = await window.sb.from('ratings').select('*').eq('listing_id', item._id).eq('from_id', currentUser.uid).or('stars.is.null').limit(1);
      const sellerRating = myRatings?.[0] || null;
      showToast && showToast('✅ ' + (lang === 'pt' ? 'Vendido! Avalie o comprador agora.' : 'Sold! Rate the buyer now.'));

      // Notify buyer that their purchase was confirmed
      if (selected?.id && window.sendPush) {
        window.sendPush(selected.id, lang === 'pt' ? '✅ Compra confirmada!' : '✅ Purchase confirmed!', lang === 'pt' ? `O vendedor confirmou a venda de "${item.name || ''}"` : `The seller confirmed the sale of "${item.name || ''}"`, '/#market', 'market');
      }
      onSold && onSold(sellerRating);
    } catch (e) {
      showToast && showToast('❌ ' + (e.message || 'Error'));
    } finally {
      setConfirming(false);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 18px 36px'
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
      fontSize: 18,
      fontWeight: 800,
      color: 'var(--pg-ink-900)',
      fontFamily: 'var(--pg-font-display)',
      marginBottom: 4
    }
  }, "\uD83E\uDD1D ", lang === 'pt' ? 'Marcar como vendido' : 'Mark as Sold'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--pg-ink-500)',
      marginBottom: 6
    }
  }, lang === 'pt' ? `Quem comprou "${item.name}"?` : `Who bought "${item.name}"?`), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--pg-ink-400)',
      marginBottom: 20
    }
  }, lang === 'pt' ? '⭐ Ambos receberão um pedido de avaliação após confirmação.' : '⭐ Both parties will be asked to rate each other after confirmation.'), loading ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '28px 0',
      color: 'var(--pg-ink-400)',
      fontSize: 13
    }
  }, lang === 'pt' ? 'Carregando contatos...' : 'Loading contacts...') : contacts.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '28px 0',
      color: 'var(--pg-ink-400)',
      fontSize: 13,
      lineHeight: 1.6,
      background: 'var(--pg-ink-50)',
      borderRadius: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 28,
      marginBottom: 8
    }
  }, "\uD83D\uDCAC"), lang === 'pt' ? 'Nenhuma conversa encontrada.\nA negociação foi feita fora do app.' : 'No conversations found.\nThe deal was made outside the app.') : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      marginBottom: 20,
      maxHeight: 260,
      overflowY: 'auto'
    }
  }, contacts.map(c => /*#__PURE__*/React.createElement("button", {
    key: c.id,
    onClick: () => setSelected(c),
    style: {
      padding: '12px 14px',
      borderRadius: 12,
      border: '1.5px solid ' + (selected?.id === c.id ? 'var(--pg-blue-500)' : 'var(--pg-ink-200)'),
      background: selected?.id === c.id ? 'var(--pg-blue-50)' : 'var(--pg-white)',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      cursor: 'pointer',
      fontFamily: 'inherit',
      textAlign: 'left',
      transition: 'all .12s'
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: c.name,
    size: 36
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: 'var(--pg-ink-900)',
      flex: 1
    }
  }, c.name), selected?.id === c.id && /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--pg-blue-500)",
    strokeWidth: "2.5",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "20 6 9 17 4 12"
  }))))), /*#__PURE__*/React.createElement("button", {
    onClick: handleConfirm,
    disabled: !selected || confirming,
    style: {
      width: '100%',
      padding: '15px',
      borderRadius: 14,
      border: 'none',
      cursor: selected ? 'pointer' : 'default',
      fontFamily: 'inherit',
      fontSize: 15,
      fontWeight: 700,
      color: '#fff',
      background: selected ? 'linear-gradient(135deg,#16A34A,#15803D)' : 'var(--pg-ink-200)',
      opacity: confirming ? 0.7 : 1,
      transition: 'all .15s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#fff",
    strokeWidth: "2.5",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "20 6 9 17 4 12"
  })), confirming ? '...' : lang === 'pt' ? 'Confirmar venda' : 'Confirm Sale'), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      width: '100%',
      marginTop: 10,
      padding: '12px',
      borderRadius: 14,
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'inherit',
      fontSize: 14,
      fontWeight: 600,
      background: 'var(--pg-ink-100)',
      color: 'var(--pg-ink-600)'
    }
  }, lang === 'pt' ? 'Cancelar' : 'Cancel'));
}

// ── Route hero card (no photo) ────────────────────────────────
function RouteNoPhotoHero({
  item,
  lang
}) {
  const n = Number(item.revenue || 0);
  const revFmt = n > 0 ? n % 1000 === 0 ? `${n / 1000}k` : fmtN(n, lang) : null;
  const cities = (item.area || '').split(',').map(c => c.trim()).filter(Boolean);
  const poolsLabel = lang === 'pt' ? 'Piscinas' : lang === 'es' ? 'Piscinas' : 'Pools';
  const revLabel = lang === 'pt' ? 'Receita/mês' : lang === 'es' ? 'Ingresos/mes' : 'Revenue/mo';
  const moSfx = lang === 'pt' ? '/mês' : '/mo';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      height: '100%',
      minHeight: 240,
      background: 'linear-gradient(135deg, #0b1a5c 0%, #1d3faa 55%, #2563eb 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 18,
      padding: '20px 24px'
    }
  }, (item.clients || revFmt) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center'
    }
  }, item.clients && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '0 28px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 58,
      fontWeight: 800,
      color: '#fff',
      lineHeight: 1,
      letterSpacing: '-1px'
    }
  }, item.clients), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: 'rgba(255,255,255,0.55)',
      letterSpacing: '0.14em',
      marginTop: 5,
      textTransform: 'uppercase'
    }
  }, poolsLabel)), item.clients && revFmt && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1,
      height: 60,
      background: 'rgba(255,255,255,0.22)',
      flexShrink: 0
    }
  }), revFmt && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '0 28px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: item.clients ? 34 : 46,
      fontWeight: 800,
      color: '#fff',
      lineHeight: 1,
      letterSpacing: '-0.5px'
    }
  }, "$", revFmt, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      opacity: 0.8
    }
  }, moSfx)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: 'rgba(255,255,255,0.55)',
      letterSpacing: '0.14em',
      marginTop: 5,
      textTransform: 'uppercase'
    }
  }, revLabel))), cities.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 6,
      justifyContent: 'center',
      maxWidth: 320
    }
  }, cities.map(city => /*#__PURE__*/React.createElement("div", {
    key: city,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      background: 'rgba(255,255,255,0.13)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      border: '1px solid rgba(255,255,255,0.22)',
      borderRadius: 999,
      padding: '6px 14px',
      fontSize: 13,
      fontWeight: 600,
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "11",
    height: "13",
    viewBox: "0 0 24 28",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 0C7.58 0 4 3.58 4 8c0 6 8 16 8 16s8-10 8-16c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"
  })), city))));
}

// ── View Listing Sheet (other users' posts — read-only + contact) ─────────
// canDelete = isAdmin (qualquer post) OR isAuthor (próprio post que chegou aqui sem isMyPost)
function ViewListingSheet({
  item,
  lang,
  onClose,
  openChat,
  openPublicProfile,
  isAdmin,
  canDelete,
  onEdit,
  currentUser,
  showToast,
  onDeleted,
  isSaved,
  onToggleSave,
  onShare,
  liveMarket = [],
  onOpenListing,
  onAfterSold
}) {
  if (!item) return null;
  const [deleting, setDeleting] = React.useState(false);
  const [markSoldOpen, setMarkSoldOpen] = React.useState(false);
  const [imgIdx, setImgIdx] = React.useState(0);
  const [viewerOpen, setViewerOpen] = React.useState(false);
  const [authorPhotoUrl, setAuthorPhotoUrl] = React.useState(null);
  const [authorVerified, setAuthorVerified] = React.useState(false);
  const [authorRating, setAuthorRating] = React.useState(null); // { avg, count } | null

  const [mapCoords, setMapCoords] = React.useState(null);
  const [mapLoading, setMapLoading] = React.useState(false);
  const [isDesktop, setIsDesktop] = React.useState(() => window.innerWidth >= 900);
  // Rental request state
  const isRent = item.type === 'rent';
  const [reqStatus, setReqStatus] = React.useState(null); // null|'pending'|'approved'|'declined'|'completed'|'disputed'|'resolved'
  const [resolvedMessage, setResolvedMessage] = React.useState(''); // admin's public resolution message
  const [listingOccupied, setListingOccupied] = React.useState(false); // another user has an approved rental
  const [dismissedDecisions, setDismissedDecisions] = React.useState(new Set()); // reqIds owner dismissed keep/remove prompt
  const [reqLoading, setReqLoading] = React.useState(false);
  const [cancelLoading, setCancelLoading] = React.useState(false);
  const [ownerRequests, setOwnerRequests] = React.useState([]); // for owner — list of requests
  const [reqPeriod, setReqPeriod] = React.useState(null); // 'day'|'week'|'month'
  const [reqQty, setReqQty] = React.useState(1);
  const [myRequestId, setMyRequestId] = React.useState(null); // renter's own request id
  // Rating state
  const [ratingSheet, setRatingSheet] = React.useState(null); // null | {requestId,rateeId,rateeName}
  const [ratingStars, setRatingStars] = React.useState(0);
  const [ratingComment, setRatingComment] = React.useState('');
  const [ratingLoading, setRatingLoading] = React.useState(false);
  const [ratingHover, setRatingHover] = React.useState(0);
  const [hasRated, setHasRated] = React.useState(false);
  const [ownerRatedRequests, setOwnerRatedRequests] = React.useState(new Set()); // requestIds owner already rated after resolved
  // Dispute form
  const [disputeForm, setDisputeForm] = React.useState(null); // null | {requestId, req}
  const [disputeSeverity, setDisputeSeverity] = React.useState('serious');
  const [disputeDesc, setDisputeDesc] = React.useState('');
  const [disputeLoading, setDisputeLoading] = React.useState(false);
  const [disputePhotos, setDisputePhotos] = React.useState([]); // [{file, preview}]
  // Rental photos (before/after)
  const [requestPhotos, setRequestPhotos] = React.useState({}); // {reqId:{before:[],after:[]}}
  const [addingPhotoFor, setAddingPhotoFor] = React.useState(null); // reqId being photo'd
  const [photoUploading, setPhotoUploading] = React.useState(false);
  const [afterStep, setAfterStep] = React.useState(null); // null | {requestId, req}
  const [afterPhotos, setAfterPhotos] = React.useState([]);
  const [afterUploading, setAfterUploading] = React.useState(false);
  const beforePhotoRef = React.useRef(null);
  const afterPhotoRef = React.useRef(null);

  // Compute available rental periods from item (multi-price new items, or single-period legacy)
  const availablePeriods = React.useMemo(() => {
    if (item.rentPrices && typeof item.rentPrices === 'object') {
      const order = ['day', 'week', 'month'];
      return order.filter(k => item.rentPrices[k] && Number(item.rentPrices[k]) > 0).map(k => ({
        period: k,
        price: Number(item.rentPrices[k])
      }));
    }
    // Legacy: single period from rent_period + price
    const p = item.rentPeriod || 'day';
    return [{
      period: p,
      price: Number(item.price) || 0
    }];
  }, [item.rentPrices, item.rentPeriod, item.price]);

  // Init selected period when listing changes
  React.useEffect(() => {
    if (availablePeriods.length > 0) setReqPeriod(availablePeriods[0].period);
    setReqQty(1);
  }, [item._id]); // eslint-disable-line

  // Desktop detection
  React.useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 900);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Load rental requests (for rent items)
  React.useEffect(() => {
    if (!isRent || !currentUser?.uid || !window.sb) return;
    window.sb.from('rental_requests').select('id, status, requester_id, requester_name, created_at, period, quantity, total_price, requester_verified').eq('listing_id', item._id).then(({
      data
    }) => {
      if (!data) return;
      const isOwnerLocal = item.author_id && item.author_id === currentUser.uid;
      if (isOwnerLocal) {
        setOwnerRequests(data);
        // Check which resolved requests the owner has already rated
        const resolvedIds = data.filter(r => r.status === 'resolved' || r.status === 'completed').map(r => r.id);
        if (resolvedIds.length > 0 && window.sb) {
          window.sb.from('rental_ratings').select('request_id').eq('rater_id', currentUser.uid).then(({
            data: rd
          }) => {
            if (rd) setOwnerRatedRequests(new Set(rd.map(r => r.request_id)));
          }).catch(() => {});
        }
      } else {
        const mine = data.find(r => r.requester_id === currentUser.uid);
        if (mine) {
          setReqStatus(mine.status);
          setMyRequestId(mine.id);
          if (mine.status === 'completed' && window.sb) {
            window.sb.from('rental_ratings').select('id').eq('request_id', mine.id).eq('rater_id', currentUser.uid).maybeSingle().then(({
              data: rd
            }) => {
              if (rd) setHasRated(true);
            }).catch(() => {});
          }
          if (mine.status === 'resolved' && window.sb) {
            window.sb.from('dispute_reports').select('resolution_message').eq('rental_request_id', mine.id).order('created_at', {
              ascending: false
            }).then(({
              data: dd
            }) => {
              if (dd && dd[0]) setResolvedMessage(dd[0].resolution_message || '');
            }).catch(() => {});
          }
        } else {
          // No request from this user — check if listing is occupied by someone else
          const hasActiveRental = data.some(r => r.status === 'approved');
          if (hasActiveRental) setListingOccupied(true);
        }
      }
    }).catch(() => {});
  }, [item._id, isRent, currentUser?.uid]); // eslint-disable-line

  // Compress photo helper (same as PhotoPicker)
  const compressPhoto = file => new Promise(resolve => {
    const img = new Image();
    const src = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 1200;
      let w = img.width,
        h = img.height;
      if (w > MAX || h > MAX) {
        if (w >= h) {
          h = Math.round(h * MAX / w);
          w = MAX;
        } else {
          w = Math.round(w * MAX / h);
          h = MAX;
        }
      }
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(src);
      c.toBlob(b => resolve(b), 'image/jpeg', 0.78);
    };
    img.src = src;
  });

  // Load before/after photos for owner's requests (all non-pending/declined)
  React.useEffect(() => {
    const active = ownerRequests.filter(r => ['approved', 'completed', 'disputed', 'resolved'].includes(r.status));
    if (!active.length || !window.sb) return;
    Promise.all(active.map(r => window.sb.from('rental_photos').select('type, photo_url').eq('request_id', r.id))).then(results => {
      const map = {};
      results.forEach((res, i) => {
        if (res.data && res.data.length > 0) {
          const rid = active[i].id;
          map[rid] = {
            before: res.data.filter(p => p.type === 'before').map(p => p.photo_url),
            after: res.data.filter(p => p.type === 'after').map(p => p.photo_url)
          };
        }
      });
      if (Object.keys(map).length) setRequestPhotos(prev => ({
        ...prev,
        ...map
      }));
    }).catch(() => {});
  }, [ownerRequests.length]); // eslint-disable-line

  // Fetch author profile photo when listing opens
  React.useEffect(() => {
    setAuthorPhotoUrl(null);
    setAuthorVerified(false);
    setAuthorRating(null);
    if (!item?.author_id || !window.sb) return;
    window.sb.from('profiles_public').select('photo_url, verified').eq('id', item.author_id).single().then(({
      data
    }) => {
      if (data?.photo_url) setAuthorPhotoUrl(data.photo_url);
      if (data?.verified) setAuthorVerified(true);
    }).catch(() => {});
    window.sb.from('ratings').select('stars').eq('to_id', item.author_id).then(({
      data
    }) => {
      const stars = (data || []).map(r => r.stars).filter(s => s != null);
      if (stars.length === 0) return;
      const avg = stars.reduce((s, v) => s + v, 0) / stars.length;
      setAuthorRating({
        avg: Math.round(avg * 10) / 10,
        count: stars.length
      });
    }).catch(() => {});
  }, [item?.author_id]);

  // Geocode item.loc via Nominatim (OpenStreetMap — free, no API key)
  React.useEffect(() => {
    setMapCoords(null);
    if (!item?.loc) return;
    setMapLoading(true);
    const q = encodeURIComponent(item.loc + (item.loc.toLowerCase().includes('fl') ? '' : ', FL'));
    fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&email=feedback@poolguyx.com`).then(r => r.json()).then(data => {
      if (data && data[0]) setMapCoords({
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
      });
    }).catch(() => {}).finally(() => setMapLoading(false));
  }, [item?.loc]);
  const allPhotos = item.photoUrls && item.photoUrls.length > 0 ? item.photoUrls : item.photoUrl ? [item.photoUrl] : [];

  // Helper: suffix label for a given period key
  const getPeriodSfx = p => p === 'week' ? lang === 'pt' ? '/sem' : '/wk' : p === 'month' ? lang === 'pt' ? '/mês' : '/mo' : lang === 'pt' ? '/dia' : '/day';
  const getPeriodLabel = (p, qty = 1) => {
    const n = qty > 1 ? qty + ' ' : '';
    if (p === 'week') return n + (lang === 'pt' ? qty > 1 ? 'semanas' : 'semana' : qty > 1 ? 'weeks' : 'week');
    if (p === 'month') return n + (lang === 'pt' ? qty > 1 ? 'meses' : 'mês' : qty > 1 ? 'months' : 'month');
    return n + (lang === 'pt' ? qty > 1 ? 'dias' : 'dia' : qty > 1 ? 'days' : 'day');
  };

  // For card/header price display: cheapest period if multi, else single
  const displayPrice = availablePeriods.length > 0 ? availablePeriods[0].price : item.price || 0;
  const displayPeriod = availablePeriods.length > 0 ? availablePeriods[0].period : item.rentPeriod || 'day';
  const periodSfx = item.type === 'rent' ? getPeriodSfx(displayPeriod) : '';
  const hasMultiPeriod = availablePeriods.length > 1;
  const authorDisplay = item.author ? item.author.includes('@') ? item.author.split('@')[0] : item.author : 'Unknown';
  const locationLabel = item.type === 'route' ? item.area || '' : [item.loc, item.cat].filter(Boolean).join(' · ');
  const timeAgoLabel = item.createdAt ? timeAgo(item.createdAt, lang) : '';
  const _listingCtx = () => ({
    name: item.name || '',
    photoUrl: item.photoUrls && item.photoUrls[0] || item.photoUrl || null,
    price: item.price,
    priceMode: item.priceMode,
    type: item.type
  });
  const handleContact = () => {
    if (isStatic) {
      showToast && showToast(lang === 'pt' ? '💡 Item demonstrativo — sem vendedor real.' : '💡 Demo item — no real seller to contact.');
      return;
    }
    // Open chat on top of the listing — listing stays open so user returns to it when chat closes
    if (openChat) openChat(item.author_id ? {
      id: item.author_id,
      name: item.author || 'Seller',
      listingId: item._id || null,
      listingContext: _listingCtx()
    } : item.author || 'Seller');
  };

  // Helper: insert notification silently (fire-and-forget)
  // title/body can be {en,pt,es} objects → stored as JSON for multilingual rendering
  const _notify = (userId, type, title, body, linkId = null) => {
    if (!window.sb || !userId) return;
    const titleStr = typeof title === 'object' ? JSON.stringify(title) : title;
    const bodyStr = typeof body === 'object' ? JSON.stringify(body) : body;
    const row = {
      user_id: userId,
      type,
      title: titleStr,
      body: bodyStr
    };
    if (linkId) row.link_id = linkId;
    window.sb.from('notifications').insert(row).catch(() => {});
    // Push notification (extract readable text from multilingual object)
    const pushTitle = typeof title === 'object' ? title.pt || title.en || '' : title;
    const pushBody = typeof body === 'object' ? body.pt || body.en || '' : body;
    window.sendPush && window.sendPush(userId, pushTitle, pushBody, '/#market', 'market');
  };
  const handleRequestRental = async () => {
    // Allow re-request after cancelled or declined — those are terminal but recoverable states
    const blockedStatuses = ['pending', 'approved', 'completed', 'disputed', 'resolved'];
    if (!currentUser?.uid || blockedStatuses.includes(reqStatus) || !window.sb || !reqPeriod) return;
    const periodEntry = availablePeriods.find(p => p.period === reqPeriod);
    const totalPrice = periodEntry ? periodEntry.price * reqQty : 0;
    setReqLoading(true);
    const {
      data: inserted,
      error
    } = await window.sb.from('rental_requests').insert({
      listing_id: item._id,
      listing_name: item.name || '',
      requester_id: currentUser.uid,
      requester_name: currentUser.name || (currentUser.email || '').split('@')[0] || 'User',
      owner_id: item.author_id,
      period: reqPeriod,
      quantity: reqQty,
      total_price: totalPrice,
      requester_verified: currentUser.verified || false
    }).select().single();
    setReqLoading(false);
    if (error) {
      showToast && showToast('❌ ' + (error.message || 'Error'));
      return;
    }
    if (inserted?.id) setMyRequestId(inserted.id);
    // Notify owner (multilingual — receiver sees in their own language)
    const _renterName = currentUser.name || (currentUser.email || '').split('@')[0] || 'Someone';
    _notify(item.author_id, 'rental_request', {
      en: 'New rental request',
      pt: 'Novo pedido de aluguel',
      es: 'Nueva solicitud de alquiler'
    }, {
      en: `${_renterName} wants to rent "${item.name || ''}"`,
      pt: `${_renterName} quer alugar "${item.name || ''}"`,
      es: `${_renterName} quiere alquilar "${item.name || ''}"`
    }, item._id);
    setReqStatus('pending');
    showToast && showToast(lang === 'pt' ? '✓ Pedido enviado! Converse com o dono pela inbox.' : '✓ Request sent! Chat with the owner via inbox.');
    if (openChat && item.author_id) {
      // Open chat on top — listing stays open behind it (Sheet zIndex 9999 > listing zIndex 200)
      openChat({
        id: item.author_id,
        name: item.author || 'Owner',
        listingId: item._id || null,
        listingContext: _listingCtx()
      });
    }
  };
  const handleOwnerDecision = async (requestId, newStatus) => {
    if (!window.sb) return;
    if (newStatus === 'approved' && ownerRequests.some(r => r.status === 'approved' && r.id !== requestId)) {
      showToast && showToast(lang === 'pt' ? '❌ Já existe um pedido aprovado para este item' : '❌ Another request for this item is already approved');
      return;
    }
    const {
      error
    } = await window.sb.from('rental_requests').update({
      status: newStatus,
      responded_at: new Date().toISOString()
    }).eq('id', requestId);
    if (error) {
      const msg = (error.message || '').includes('duplicate key') || (error.message || '').includes('rental_requests_one_approved_per_listing') ? lang === 'pt' ? '❌ Já existe um pedido aprovado para este item' : '❌ Another request for this item is already approved' : '❌ ' + (error.message || 'Error');
      showToast && showToast(msg);
      return;
    }
    setOwnerRequests(prev => prev.map(r => r.id === requestId ? {
      ...r,
      status: newStatus
    } : r));
    showToast && showToast(newStatus === 'approved' ? lang === 'pt' ? '✓ Aluguel aprovado!' : '✓ Rental approved!' : lang === 'pt' ? 'Pedido recusado' : 'Request declined');
    // Notify renter
    const req = ownerRequests.find(r => r.id === requestId);
    if (req?.requester_id) {
      if (newStatus === 'approved') {
        _notify(req.requester_id, 'rental_approved', {
          en: 'Rental approved! 🎉',
          pt: 'Aluguel aprovado! 🎉',
          es: '¡Alquiler aprobado! 🎉'
        }, {
          en: `The owner approved your request for "${item.name || ''}"`,
          pt: `O dono aprovou seu pedido para "${item.name || ''}"`,
          es: `El propietario aprobó tu solicitud para "${item.name || ''}"`
        }, item._id);
      } else {
        _notify(req.requester_id, 'rental_declined', {
          en: 'Rental request declined',
          pt: 'Pedido de aluguel recusado',
          es: 'Solicitud de alquiler rechazada'
        }, {
          en: `"${item.name || ''}" — The owner did not accept your request.`,
          pt: `"${item.name || ''}" — O dono não aceitou seu pedido.`,
          es: `"${item.name || ''}" — El propietario no aceptó tu solicitud.`
        }, item._id);
      }
    }
  };
  const handleCancelRequest = async () => {
    if (!window.sb || !myRequestId) return;
    const ok = window.confirm(lang === 'pt' ? 'Cancelar o pedido de aluguel? Esta ação não pode ser desfeita.' : 'Cancel the rental request? This cannot be undone.');
    if (!ok) return;
    setCancelLoading(true);
    const {
      error
    } = await window.sb.from('rental_requests').update({
      status: 'cancelled'
    }).eq('id', myRequestId);
    if (error) {
      setCancelLoading(false);
      showToast && showToast('❌ ' + (error.message || 'Error'));
      return;
    }
    // The REST client uses Prefer: return=minimal on updates, so an RLS-blocked
    // 0-row write still reports success — verify the row actually changed.
    const {
      data: verify
    } = await window.sb.from('rental_requests').select('status').eq('id', myRequestId).single();
    setCancelLoading(false);
    if (verify?.status !== 'cancelled') {
      showToast && showToast(lang === 'pt' ? '❌ Não foi possível cancelar — tente novamente' : '❌ Could not cancel — please try again');
      return;
    }
    setReqStatus('cancelled');
    setListingOccupied(false);
    showToast && showToast(lang === 'pt' ? 'Pedido cancelado.' : 'Request cancelled.');
  };
  const handleOwnerCancelRental = async requestId => {
    if (!window.sb) return;
    const ok = window.confirm(lang === 'pt' ? 'Cancelar este aluguel em andamento? O renter será notificado pelo chat.' : 'Cancel this active rental? The renter will be notified via chat.');
    if (!ok) return;
    const {
      error
    } = await window.sb.from('rental_requests').update({
      status: 'cancelled'
    }).eq('id', requestId);
    if (error) {
      showToast && showToast('❌ ' + (error.message || 'Error'));
      return;
    }
    const cancelledReq = ownerRequests.find(r => r.id === requestId);
    setOwnerRequests(prev => prev.map(r => r.id === requestId ? {
      ...r,
      status: 'cancelled'
    } : r));
    showToast && showToast(lang === 'pt' ? 'Aluguel cancelado.' : 'Rental cancelled.');
    if (cancelledReq?.requester_id) {
      _notify(cancelledReq.requester_id, 'rental_cancelled', {
        en: 'Rental cancelled by owner',
        pt: 'Aluguel cancelado pelo dono',
        es: 'Alquiler cancelado por el propietario'
      }, {
        en: `"${item.name || ''}" — The owner cancelled the active rental.`,
        pt: `"${item.name || ''}" — O dono cancelou o aluguel em andamento.`,
        es: `"${item.name || ''}" — El propietario canceló el alquiler en curso.`
      }, item._id);
    }
  };
  const handleMarkReturned = async (requestId, req) => {
    // If before photos exist → require after photos first
    const beforePics = requestPhotos[requestId]?.before || [];
    if (beforePics.length > 0) {
      setAfterPhotos([]);
      setAfterStep({
        requestId,
        req
      });
      return;
    }
    // No before photos → complete directly
    if (!window.sb) return;
    const {
      error
    } = await window.sb.from('rental_requests').update({
      status: 'completed'
    }).eq('id', requestId);
    if (error) {
      showToast && showToast('❌ ' + (error.message || 'Error'));
      return;
    }
    setOwnerRequests(prev => prev.map(r => r.id === requestId ? {
      ...r,
      status: 'completed'
    } : r));
    showToast && showToast(lang === 'pt' ? '✓ Marcado como devolvido!' : '✓ Marked as returned!');
    setRatingStars(0);
    setRatingComment('');
    setRatingSheet({
      requestId,
      rateeId: req.requester_id,
      rateeName: req.requester_name || 'Renter'
    });
  };

  // ── Before-photo upload ──────────────────────────────────────
  const handleBeforePhotoFile = async e => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file || !addingPhotoFor || !window.sb) return;
    setPhotoUploading(true);
    try {
      const blob = await compressPhoto(file);
      const path = 'rental/before-' + addingPhotoFor + '-' + Date.now() + '.jpg';
      let url = null;
      if (window.sb.storage) {
        const {
          data,
          error
        } = await window.sb.storage.from('post-images').upload(path, blob, {
          contentType: 'image/jpeg'
        });
        if (!error && data) {
          const {
            data: ud
          } = window.sb.storage.from('post-images').getPublicUrl(path);
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
      await window.sb.from('rental_photos').insert({
        request_id: addingPhotoFor,
        type: 'before',
        photo_url: url,
        uploaded_by: currentUser.uid
      });
      setRequestPhotos(prev => ({
        ...prev,
        [addingPhotoFor]: {
          before: [...(prev[addingPhotoFor]?.before || []), url],
          after: prev[addingPhotoFor]?.after || []
        }
      }));
      showToast && showToast(lang === 'pt' ? '📷 Foto adicionada!' : '📷 Photo added!');
    } catch (err) {
      console.warn('[BeforePhoto]', err);
    }
    setPhotoUploading(false);
    setAddingPhotoFor(null);
  };

  // ── After-photo upload (during Devolvido flow) ───────────────
  const handleAfterPhotoFile = async e => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file || afterPhotos.length >= 4 || !window.sb) return;
    setAfterUploading(true);
    try {
      const blob = await compressPhoto(file);
      const path = 'rental/after-' + Date.now() + '-' + Math.random().toString(36).slice(2) + '.jpg';
      let url = null;
      if (window.sb.storage) {
        const {
          data,
          error
        } = await window.sb.storage.from('post-images').upload(path, blob, {
          contentType: 'image/jpeg'
        });
        if (!error && data) {
          const {
            data: ud
          } = window.sb.storage.from('post-images').getPublicUrl(path);
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
      setAfterPhotos(prev => [...prev, url]);
    } catch (err) {
      console.warn('[AfterPhoto]', err);
    }
    setAfterUploading(false);
  };

  // ── Confirm return WITH after photos ────────────────────────
  const handleConfirmReturn = async () => {
    if (!afterStep || !window.sb) return;
    const {
      requestId,
      req
    } = afterStep;
    // Save after photos
    if (afterPhotos.length > 0) {
      await Promise.all(afterPhotos.map(url => window.sb.from('rental_photos').insert({
        request_id: requestId,
        type: 'after',
        photo_url: url,
        uploaded_by: currentUser.uid
      })));
      setRequestPhotos(prev => ({
        ...prev,
        [requestId]: {
          before: prev[requestId]?.before || [],
          after: afterPhotos
        }
      }));
    }
    const {
      error
    } = await window.sb.from('rental_requests').update({
      status: 'completed'
    }).eq('id', requestId);
    if (error) {
      showToast && showToast('❌ ' + (error.message || 'Error'));
      return;
    }
    setOwnerRequests(prev => prev.map(r => r.id === requestId ? {
      ...r,
      status: 'completed'
    } : r));
    setAfterStep(null);
    setAfterPhotos([]);
    showToast && showToast(lang === 'pt' ? '✓ Devolvido com fotos!' : '✓ Returned with photos!');
    setRatingStars(0);
    setRatingComment('');
    setRatingSheet({
      requestId,
      rateeId: req.requester_id,
      rateeName: req.requester_name || 'Renter'
    });
  };

  // ── Report problem — full flow with form ─────────────────────
  const handleReportProblemFull = async () => {
    if (!disputeForm || !disputeDesc.trim() || !window.sb || !currentUser?.uid) return;
    setDisputeLoading(true);
    const {
      requestId,
      req
    } = disputeForm;

    // 1. Upload evidence photos
    const evidenceUrls = [];
    for (const p of disputePhotos) {
      try {
        const raw = p.file.name.split('.').pop().toLowerCase();
        const ext = /^(jpg|jpeg|png|webp|gif|heic)$/.test(raw) ? raw : 'jpg';
        const path = `dispute-evidence/${currentUser.uid}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const {
          error: upErr
        } = await window.sb.storage.from('post-images').upload(path, p.file, {
          contentType: p.file.type,
          upsert: false
        });
        if (!upErr) {
          const {
            data: pub
          } = window.sb.storage.from('post-images').getPublicUrl(path);
          if (pub?.publicUrl) evidenceUrls.push(pub.publicUrl);
        }
      } catch (e) {}
    }

    // 2. Mark request as disputed
    await window.sb.from('rental_requests').update({
      status: 'disputed'
    }).eq('id', requestId);
    // 3. Insert dispute report
    await window.sb.from('dispute_reports').insert({
      rental_request_id: requestId,
      reporter_id: currentUser.uid,
      reported_user_id: req.requester_id,
      listing_id: item._id,
      listing_name: item.name || '',
      severity: disputeSeverity,
      description: disputeDesc.trim(),
      reporter_name: currentUser.name || (currentUser.email || '').split('@')[0] || 'Owner',
      reported_name: req.requester_name || 'Renter',
      status: 'pending',
      evidence_urls: evidenceUrls
    });
    setOwnerRequests(prev => prev.map(r => r.id === requestId ? {
      ...r,
      status: 'disputed'
    } : r));
    setDisputeLoading(false);
    showToast && showToast(lang === 'pt' ? '⚠ Problema reportado e enviado para análise.' : '⚠ Issue reported and sent for review.');
    setDisputeForm(null);
    setDisputePhotos([]);
  };
  const handleSubmitRating = async () => {
    if (!ratingSheet || ratingStars === 0 || ratingLoading || !window.sb || !currentUser?.uid) return;
    setRatingLoading(true);
    const {
      error
    } = await window.sb.from('rental_ratings').insert({
      request_id: ratingSheet.requestId,
      rater_id: currentUser.uid,
      ratee_id: ratingSheet.rateeId,
      listing_id: item._id,
      stars: ratingStars,
      comment: ratingComment.trim() || null
    });
    setRatingLoading(false);
    if (error) {
      showToast && showToast('❌ ' + (error.message || 'Error'));
      return;
    }
    showToast && showToast(lang === 'pt' ? '⭐ Avaliação enviada! Obrigado.' : '⭐ Rating submitted! Thank you.');
    setHasRated(true);
    // Track owner rating for resolved requests
    if (ratingSheet.requestId) {
      setOwnerRatedRequests(prev => {
        const n = new Set(prev);
        n.add(ratingSheet.requestId);
        return n;
      });
    }
    setRatingSheet(null);
  };

  // Open seller public profile — fetch real data from Supabase
  const handleAuthorClick = async () => {
    if (!openPublicProfile) return;
    const base = {
      uid: item.author_id || null,
      name: authorDisplay,
      rating: undefined,
      // undefined = no ratings yet (not 4.8 default)
      reviews: 0,
      jobs: 0,
      loc: item.loc || 'Broward County, FL'
    };
    if (item.author_id && window.sb) {
      try {
        const {
          data
        } = await window.sb.from('profiles_public').select('name, region, role, photo_url').eq('id', item.author_id).single();
        if (data) {
          if (data.name) base.name = data.name;
          if (data.region) base.loc = data.region;
          if (data.photo_url) base.photo = data.photo_url;
        }
      } catch (e) {}
    }
    openPublicProfile(base);
  };
  const handleAdminDelete = async () => {
    const confirmMsg = lang === 'pt' ? `Excluir o anúncio "${item.name}"? Não pode ser desfeito.` : `Delete listing "${item.name}"? This cannot be undone.`;
    if (!window.confirm(confirmMsg)) return;
    setDeleting(true);
    const {
      error
    } = await window.sb.from('marketplace').delete().eq('id', item._id);
    setDeleting(false);
    if (error) {
      if (showToast) showToast('❌ ' + error.message);
      return;
    }
    if (showToast) showToast(lang === 'pt' ? '🗑️ Anúncio excluído' : '🗑️ Listing deleted');
    if (onDeleted) onDeleted(item._id);
    if (onClose) onClose();
  };

  // ── Shared sub-components ─────────────────────────────────────
  const isStatic = !item._live; // demo item from EQUIPMENT array — no DB entry
  const isOwner = !isStatic && item.author_id && currentUser?.uid && item.author_id === currentUser.uid;
  const isSold = item.status === 'sold';
  const TypeBadge = () => /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      fontSize: 10,
      fontWeight: 800,
      padding: '4px 10px',
      borderRadius: 6,
      background: item.type === 'rent' ? '#0EBAC7' : 'var(--pg-blue-500)',
      color: '#fff',
      letterSpacing: '0.07em',
      textTransform: 'uppercase'
    }
  }, item.type === 'rent' ? lang === 'pt' ? 'ALUGUEL' : 'RENTAL' : lang === 'pt' ? 'VENDA' : 'FOR SALE');
  const PriceBlock = ({
    large = false
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, item.priceMode === 'neg' ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: large ? 18 : 14,
      fontWeight: 700,
      padding: '5px 14px',
      borderRadius: 999,
      background: 'var(--pg-blue-50)',
      color: 'var(--pg-blue-700)',
      border: '1.5px solid var(--pg-blue-100)'
    }
  }, "\uD83E\uDD1D ", lang === 'pt' ? 'Negociável' : lang === 'es' ? 'Negociable' : 'Negotiable') : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--pg-font-display)',
      fontSize: large ? 38 : 30,
      fontWeight: 800,
      color: 'var(--pg-blue-500)',
      letterSpacing: '-0.03em',
      lineHeight: 1
    }
  }, item.type === 'pool' || item.type === 'route' ? `$${fmtN(item.asking || 0, lang)}` : `$${fmtN(item.price, lang)}`, item.type !== 'pool' && item.type !== 'route' && periodSfx && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: large ? 16 : 13,
      fontWeight: 500,
      color: 'var(--pg-ink-400)',
      marginLeft: 3
    }
  }, periodSfx)), item.condition && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      padding: '3px 10px',
      borderRadius: 999,
      background: 'var(--pg-blue-100)',
      color: 'var(--pg-blue-700)',
      border: 'none'
    }
  }, item.condition)));
  const SellerRow = ({
    horizontal = false
  }) => /*#__PURE__*/React.createElement("button", {
    onClick: handleAuthorClick,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      width: '100%',
      border: 'none',
      background: 'transparent',
      cursor: openPublicProfile ? 'pointer' : 'default',
      textAlign: 'left',
      padding: 0,
      fontFamily: 'inherit'
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: authorDisplay,
    size: horizontal ? 48 : 44,
    src: authorPhotoUrl || undefined
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: 'var(--pg-ink-900)'
    }
  }, authorDisplay), authorVerified && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 800,
      padding: '2px 7px',
      borderRadius: 999,
      background: 'rgba(22,163,74,0.12)',
      color: '#16A34A',
      border: '1px solid rgba(22,163,74,0.3)',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 3,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "9",
    height: "9",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#16A34A",
    strokeWidth: "3.5",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "20 6 9 17 4 12"
  })), lang === 'pt' ? 'Verificado' : 'Verified')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      marginTop: 2,
      flexWrap: 'wrap'
    }
  }, authorRating ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Stars, {
    rating: authorRating.avg,
    size: 12
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--pg-ink-700)'
    }
  }, authorRating.avg), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--pg-ink-400)'
    }
  }, "(", authorRating.count, ")")) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      color: 'var(--pg-ink-400)'
    }
  }, lang === 'pt' ? 'Sem avaliações ainda' : lang === 'es' ? 'Sin calificaciones aún' : 'No ratings yet'), timeAgoLabel ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      color: 'var(--pg-ink-400)'
    }
  }, " \xB7 ", timeAgoLabel) : null)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      padding: '3px 10px',
      borderRadius: 999,
      background: 'var(--pg-blue-50)',
      color: 'var(--pg-blue-700)',
      border: '1px solid var(--pg-blue-100)',
      flexShrink: 0
    }
  }, "Pool Guy"), openPublicProfile && Icon.chev(14, 'var(--pg-ink-300)'));
  const ActionButtons = ({
    vertical = false
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: vertical ? 'column' : 'row',
      gap: 10
    }
  }, !isOwner && /*#__PURE__*/React.createElement("button", {
    onClick: handleContact,
    style: {
      flex: 1,
      height: 50,
      borderRadius: 14,
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'inherit',
      fontSize: 15,
      fontWeight: 700,
      color: '#fff',
      background: 'linear-gradient(135deg,var(--pg-blue-500),var(--pg-blue-700))',
      boxShadow: '0 4px 16px rgba(0,119,182,0.30)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      transition: 'all .15s'
    }
  }, Icon.msg(18, '#fff'), lang === 'pt' ? 'Enviar mensagem' : lang === 'es' ? 'Enviar mensaje' : 'Send Message'), isOwner && onEdit && /*#__PURE__*/React.createElement("button", {
    onClick: onEdit,
    style: {
      flex: 1,
      height: 50,
      borderRadius: 14,
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'inherit',
      fontSize: 15,
      fontWeight: 700,
      color: '#fff',
      background: 'linear-gradient(135deg,var(--pg-blue-500),var(--pg-blue-700))',
      boxShadow: '0 4px 16px rgba(0,119,182,0.30)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      transition: 'all .15s'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#fff",
    strokeWidth: "2.5",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
  })), lang === 'pt' ? 'Editar anúncio' : lang === 'es' ? 'Editar anuncio' : 'Edit listing'), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, !isOwner && /*#__PURE__*/React.createElement("button", {
    onClick: onToggleSave,
    title: isSaved ? lang === 'pt' ? 'Remover dos salvos' : 'Unsave' : lang === 'pt' ? 'Salvar' : 'Save',
    style: {
      width: 50,
      height: 50,
      borderRadius: 14,
      cursor: 'pointer',
      flexShrink: 0,
      border: isSaved ? '1.5px solid #FCA5A5' : '1.5px solid var(--pg-ink-200)',
      background: isSaved ? '#FEF2F2' : 'var(--pg-ink-50)',
      color: isSaved ? '#EF4444' : 'var(--pg-ink-500)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all .15s'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: isSaved ? 'currentColor' : 'none',
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
  }))), /*#__PURE__*/React.createElement("button", {
    onClick: onShare,
    title: lang === 'pt' ? 'Compartilhar' : 'Share',
    style: {
      width: 50,
      height: 50,
      borderRadius: 14,
      cursor: 'pointer',
      flexShrink: 0,
      border: '1.5px solid var(--pg-ink-200)',
      background: 'var(--pg-ink-50)',
      color: 'var(--pg-ink-500)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "18",
    cy: "5",
    r: "3"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "6",
    cy: "12",
    r: "3"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "18",
    cy: "19",
    r: "3"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "8.59",
    y1: "13.51",
    x2: "15.42",
    y2: "17.49"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "15.41",
    y1: "6.51",
    x2: "8.59",
    y2: "10.49"
  }))), canDelete && /*#__PURE__*/React.createElement("button", {
    onClick: handleAdminDelete,
    disabled: deleting,
    title: lang === 'pt' ? 'Excluir' : 'Delete',
    style: {
      width: 50,
      height: 50,
      borderRadius: 14,
      cursor: 'pointer',
      flexShrink: 0,
      border: '1.5px solid #FCA5A5',
      background: '#FEF2F2',
      color: '#EF4444',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: deleting ? 0.6 : 1
    }
  }, deleting ? /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10",
    strokeDasharray: "31.4",
    strokeDashoffset: "10"
  })) : /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "3 6 5 6 21 6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10 11v6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 11v6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
  })))));

  // ── Rental request block (for non-owner renters) ──────────────
  const RequestRentalBlock = () => {
    if (!isRent || isOwner || isSold) return null;

    // ── Profile completeness gate (B) ────────────────────────────
    if (currentUser?.uid && reqStatus === null) {
      const hasName = !!(currentUser?.name && !currentUser.name.includes('@') && currentUser.name.trim().length > 1);
      const hasPhone = !!currentUser?.phone?.trim();
      const hasPhoto = !!currentUser?.photoUrl;
      if (!hasName || !hasPhone || !hasPhoto) {
        const missing = [!hasPhoto && (lang === 'pt' ? '📷 Foto de perfil' : '📷 Profile photo'), !hasName && (lang === 'pt' ? '👤 Nome completo' : '👤 Full name'), !hasPhone && (lang === 'pt' ? '📞 Telefone' : '📞 Phone number')].filter(Boolean);
        return /*#__PURE__*/React.createElement("div", {
          style: {
            borderRadius: 14,
            overflow: 'hidden',
            border: '1.5px solid rgba(245,158,11,0.4)'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '13px 16px',
            background: 'rgba(245,158,11,0.08)',
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start'
          }
        }, /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 22,
            flexShrink: 0
          }
        }, "\uD83D\uDD12"), /*#__PURE__*/React.createElement("div", {
          style: {
            flex: 1
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: 13,
            fontWeight: 800,
            color: '#F59E0B',
            marginBottom: 3
          }
        }, lang === 'pt' ? 'Perfil incompleto' : 'Incomplete profile'), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: 12,
            color: '#F59E0B',
            opacity: 0.85,
            marginBottom: 8
          }
        }, lang === 'pt' ? 'Para alugar equipamentos, complete seu perfil:' : 'To rent equipment, complete your profile:'), missing.map((m, i) => /*#__PURE__*/React.createElement("div", {
          key: i,
          style: {
            fontSize: 12,
            fontWeight: 600,
            color: '#F59E0B',
            marginBottom: 3
          }
        }, "\u2022 ", m)))), /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '10px 16px',
            background: 'rgba(245,158,11,0.04)',
            borderTop: '1px solid rgba(245,158,11,0.2)',
            fontSize: 12,
            color: 'var(--pg-ink-500)',
            textAlign: 'center'
          }
        }, lang === 'pt' ? 'Vá em ⚙ Perfil no menu para completar seus dados.' : 'Go to ⚙ Profile in the menu to complete your info.'));
      }
    }

    // Listing occupied by another renter
    if (listingOccupied && !reqStatus) return /*#__PURE__*/React.createElement("div", {
      style: {
        borderRadius: 14,
        overflow: 'hidden',
        border: '1.5px solid rgba(245,158,11,0.45)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '14px 16px',
        background: 'rgba(245,158,11,0.09)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 38,
        height: 38,
        borderRadius: '50%',
        background: 'rgba(245,158,11,0.18)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontSize: 20
      }
    }, "\uD83D\uDD12"), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        fontWeight: 800,
        color: '#D97706',
        marginBottom: 3
      }
    }, lang === 'pt' ? 'Equipamento em uso' : 'Equipment in use'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: '#B45309',
        lineHeight: 1.55
      }
    }, lang === 'pt' ? 'Este equipamento está alugado no momento e não está disponível para novas solicitações.' : 'This equipment is currently rented and unavailable for new requests.'))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '10px 16px',
        background: 'rgba(245,158,11,0.05)',
        borderTop: '1px solid rgba(245,158,11,0.2)',
        fontSize: 12,
        color: 'var(--pg-ink-500)',
        textAlign: 'center'
      }
    }, lang === 'pt' ? '💡 Salve este anúncio para ser notificado quando estiver disponível.' : '💡 Save this listing to be notified when it becomes available.'));

    // Status cards (same for static/live)
    if (reqStatus === 'approved') return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '13px 16px',
        borderRadius: 14,
        background: 'rgba(14,186,199,0.10)',
        border: '1.5px solid rgba(14,186,199,0.40)',
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 30,
        height: 30,
        borderRadius: '50%',
        background: '#0EBAC7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "15",
      height: "15",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "#fff",
      strokeWidth: "2.5",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("polyline", {
      points: "1 4 1 10 7 10"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M3.51 15a9 9 0 1 0 .49-3.5"
    }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 800,
        color: '#0EBAC7'
      }
    }, lang === 'pt' ? '🔄 Em andamento!' : '🔄 In progress!'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: '#0EBAC7',
        opacity: 0.8,
        marginTop: 1
      }
    }, lang === 'pt' ? 'O dono aprovou. Aproveite!' : 'The owner approved. Enjoy!')));
    if (reqStatus === 'completed') return /*#__PURE__*/React.createElement("div", {
      style: {
        borderRadius: 14,
        overflow: 'hidden',
        border: '1.5px solid rgba(22,163,74,0.4)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '13px 16px',
        background: 'rgba(22,163,74,0.12)',
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 30,
        height: 30,
        borderRadius: '50%',
        background: '#16A34A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "#fff",
      strokeWidth: "3",
      strokeLinecap: "round"
    }, /*#__PURE__*/React.createElement("polyline", {
      points: "20 6 9 17 4 12"
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 800,
        color: '#22C55E'
      }
    }, lang === 'pt' ? 'Aluguel concluído!' : 'Rental completed!'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: '#22C55E',
        opacity: 0.8,
        marginTop: 1
      }
    }, hasRated ? lang === 'pt' ? 'Obrigado pela avaliação! ⭐' : 'Thanks for rating! ⭐' : lang === 'pt' ? 'Avalie sua experiência abaixo.' : 'Rate your experience below.'))), !hasRated && /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        setRatingStars(0);
        setRatingComment('');
        setRatingSheet({
          requestId: myRequestId,
          rateeId: item.author_id,
          rateeName: item.author || 'Owner'
        });
      },
      style: {
        width: '100%',
        padding: '11px',
        border: 'none',
        borderTop: '1px solid rgba(22,163,74,0.25)',
        cursor: 'pointer',
        fontFamily: 'inherit',
        background: '#16A34A',
        color: '#fff',
        fontSize: 13,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7
      }
    }, "\u2B50 ", lang === 'pt' ? 'Avaliar o dono' : 'Rate the owner'));
    if (reqStatus === 'disputed') return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '12px 14px',
        borderRadius: 14,
        background: 'rgba(245,158,11,0.10)',
        border: '1.5px solid rgba(245,158,11,0.40)',
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18,
        flexShrink: 0
      }
    }, "\u26A0\uFE0F"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: '#F59E0B'
      }
    }, lang === 'pt' ? 'Problema reportado' : 'Issue reported'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: '#F59E0B',
        opacity: 0.8,
        marginTop: 1
      }
    }, lang === 'pt' ? 'Nossa equipe vai analisar em breve.' : 'Our team will review this shortly.')));
    if (reqStatus === 'resolved') return /*#__PURE__*/React.createElement("div", {
      style: {
        borderRadius: 14,
        overflow: 'hidden',
        border: '1.5px solid rgba(99,102,241,0.40)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '12px 14px',
        background: 'rgba(99,102,241,0.10)',
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18,
        flexShrink: 0
      }
    }, "\u2705"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: '#818CF8'
      }
    }, lang === 'pt' ? 'Ocorrência resolvida pelo suporte' : 'Case resolved by support'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: '#818CF8',
        opacity: 0.8,
        marginTop: 1
      }
    }, lang === 'pt' ? 'Nossa equipe analisou e encerrou esta ocorrência.' : 'Our team reviewed and closed this case.'))), resolvedMessage ? /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '10px 14px',
        background: 'rgba(99,102,241,0.06)',
        borderTop: '1px solid rgba(99,102,241,0.2)',
        fontSize: 13,
        color: '#818CF8',
        lineHeight: 1.6,
        fontStyle: 'italic'
      }
    }, "\"", resolvedMessage, "\"") : null);
    if (reqStatus === 'declined') return /*#__PURE__*/React.createElement("div", {
      style: {
        borderRadius: 14,
        overflow: 'hidden',
        border: '1.5px solid rgba(239,68,68,0.35)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '12px 14px',
        background: 'rgba(239,68,68,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18,
        flexShrink: 0
      }
    }, "\u274C"), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: '#F87171'
      }
    }, lang === 'pt' ? 'Pedido não aprovado' : 'Request not approved'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: '#F87171',
        opacity: 0.8,
        marginTop: 1
      }
    }, lang === 'pt' ? 'O dono recusou este pedido.' : 'The owner declined this request.'))), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        setReqStatus(null);
        setMyRequestId(null);
      },
      style: {
        width: '100%',
        padding: '10px',
        border: 'none',
        borderTop: '1px solid rgba(239,68,68,0.15)',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 12,
        fontWeight: 700,
        background: 'rgba(14,186,199,0.06)',
        color: '#0EBAC7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "12",
      height: "12",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "3",
      strokeLinecap: "round"
    }, /*#__PURE__*/React.createElement("polyline", {
      points: "1 4 1 10 7 10"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M3.51 15a9 9 0 1 0 .49-3.5"
    })), lang === 'pt' ? 'Tentar novamente' : 'Try again'));
    if (reqStatus === 'cancelled') return /*#__PURE__*/React.createElement("div", {
      style: {
        borderRadius: 14,
        overflow: 'hidden',
        border: '1.5px solid rgba(107,114,128,0.30)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '12px 14px',
        background: 'rgba(107,114,128,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18,
        flexShrink: 0
      }
    }, "\uD83D\uDEAB"), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: 'var(--pg-ink-500)'
      }
    }, lang === 'pt' ? 'Pedido cancelado' : 'Request cancelled'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: 'var(--pg-ink-400)',
        marginTop: 1
      }
    }, lang === 'pt' ? 'Este pedido foi cancelado.' : 'This request was cancelled.'))), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        setReqStatus(null);
        setMyRequestId(null);
      },
      style: {
        width: '100%',
        padding: '10px',
        border: 'none',
        borderTop: '1px solid rgba(107,114,128,0.15)',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 12,
        fontWeight: 700,
        background: 'rgba(14,186,199,0.06)',
        color: '#0EBAC7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "12",
      height: "12",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "3",
      strokeLinecap: "round"
    }, /*#__PURE__*/React.createElement("polyline", {
      points: "1 4 1 10 7 10"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M3.51 15a9 9 0 1 0 .49-3.5"
    })), lang === 'pt' ? 'Fazer novo pedido' : 'Make a new request'));
    if (reqStatus === 'pending') return /*#__PURE__*/React.createElement("div", {
      style: {
        borderRadius: 14,
        overflow: 'hidden',
        border: '1.5px solid rgba(245,158,11,0.4)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '13px 16px',
        background: 'rgba(245,158,11,0.10)',
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 16,
        flexShrink: 0
      }
    }, "\u23F3"), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: '#F59E0B'
      }
    }, lang === 'pt' ? 'Pedido enviado!' : 'Request sent!'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: '#F59E0B',
        opacity: 0.8,
        marginTop: 1
      }
    }, lang === 'pt' ? 'Aguardando resposta do dono.' : 'Waiting for owner\'s response.'))), /*#__PURE__*/React.createElement("button", {
      onClick: handleCancelRequest,
      disabled: cancelLoading,
      style: {
        width: '100%',
        padding: '10px',
        border: 'none',
        borderTop: '1px solid rgba(245,158,11,0.2)',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 12,
        fontWeight: 700,
        background: 'rgba(239,68,68,0.06)',
        color: '#EF4444',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        opacity: cancelLoading ? 0.6 : 1
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "12",
      height: "12",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "3",
      strokeLinecap: "round"
    }, /*#__PURE__*/React.createElement("line", {
      x1: "18",
      y1: "6",
      x2: "6",
      y2: "18"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "6",
      y1: "6",
      x2: "18",
      y2: "18"
    })), cancelLoading ? lang === 'pt' ? 'Cancelando…' : 'Cancelling…' : lang === 'pt' ? 'Cancelar pedido' : 'Cancel request'));
    if (isStatic) return /*#__PURE__*/React.createElement("button", {
      onClick: () => showToast && showToast(lang === 'pt' ? '💡 Item demonstrativo — publique seu item real no marketplace!' : '💡 Demo item — post your own listing to rent it out!'),
      style: {
        width: '100%',
        height: 52,
        borderRadius: 14,
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 15,
        fontWeight: 700,
        color: '#fff',
        background: 'linear-gradient(135deg,#0EBAC7,#0891A8)',
        boxShadow: '0 4px 16px rgba(14,186,199,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 9
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "18",
      height: "18",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "#fff",
      strokeWidth: "2.5",
      strokeLinecap: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    })), lang === 'pt' ? 'Solicitar aluguel' : 'Request Rental');

    // ── Rental form card ────────────────────────────────────────
    const selPeriodEntry = availablePeriods.find(p => p.period === reqPeriod) || availablePeriods[0];
    const totalPrice = selPeriodEntry ? selPeriodEntry.price * reqQty : 0;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        borderRadius: 16,
        border: '1.5px solid var(--pg-ink-200)',
        overflow: 'hidden',
        background: 'var(--pg-white)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '11px 14px',
        background: 'var(--pg-ink-50)',
        borderBottom: '1px solid var(--pg-ink-200)',
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "15",
      height: "15",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "#0EBAC7",
      strokeWidth: "2.5",
      strokeLinecap: "round"
    }, /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "4",
      width: "18",
      height: "18",
      rx: "2"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "16",
      y1: "2",
      x2: "16",
      y2: "6"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "8",
      y1: "2",
      x2: "8",
      y2: "6"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "3",
      y1: "10",
      x2: "21",
      y2: "10"
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: 'var(--pg-ink-900)'
      }
    }, lang === 'pt' ? 'Solicitar aluguel' : 'Request Rental')), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }
    }, availablePeriods.length > 1 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        color: 'var(--pg-ink-500)',
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        marginBottom: 8
      }
    }, lang === 'pt' ? 'Escolha o período' : 'Choose period'), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8
      }
    }, availablePeriods.map(({
      period,
      price
    }) => {
      const isOn = reqPeriod === period;
      return /*#__PURE__*/React.createElement("button", {
        key: period,
        onClick: () => setReqPeriod(period),
        style: {
          flex: 1,
          padding: '10px 6px',
          borderRadius: 12,
          border: 'none',
          cursor: 'pointer',
          background: isOn ? '#0EBAC7' : 'var(--pg-ink-100)',
          fontFamily: 'inherit',
          transition: 'all .12s',
          boxShadow: isOn ? '0 3px 10px rgba(14,186,199,0.3)' : 'none'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 14,
          fontWeight: 800,
          color: isOn ? '#fff' : 'var(--pg-ink-900)'
        }
      }, getPeriodSfx(period)), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 12,
          fontWeight: 600,
          color: isOn ? 'rgba(255,255,255,0.85)' : 'var(--pg-ink-500)',
          marginTop: 2
        }
      }, "$", price));
    }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        color: 'var(--pg-ink-500)',
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        marginBottom: 8
      }
    }, lang === 'pt' ? 'Quantidade' : 'Quantity'), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setReqQty(q => Math.max(1, q - 1)),
      style: {
        width: 38,
        height: 38,
        borderRadius: 10,
        border: '1.5px solid var(--pg-ink-200)',
        background: 'var(--pg-ink-100)',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 20,
        fontWeight: 400,
        color: 'var(--pg-ink-900)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, "\u2212"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 20,
        fontWeight: 800,
        color: 'var(--pg-ink-900)',
        minWidth: 28,
        textAlign: 'center'
      }
    }, reqQty), /*#__PURE__*/React.createElement("button", {
      onClick: () => setReqQty(q => Math.min(52, q + 1)),
      style: {
        width: 38,
        height: 38,
        borderRadius: 10,
        border: '1.5px solid var(--pg-ink-200)',
        background: 'var(--pg-ink-100)',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 20,
        fontWeight: 400,
        color: 'var(--pg-ink-900)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, "+"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        color: 'var(--pg-ink-500)',
        marginLeft: 4
      }
    }, selPeriodEntry ? getPeriodLabel(selPeriodEntry.period, reqQty) : ''))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '10px 12px',
        borderRadius: 12,
        background: 'var(--pg-ink-50)',
        border: '1px solid var(--pg-ink-200)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        color: 'var(--pg-ink-500)',
        fontWeight: 600
      }
    }, lang === 'pt' ? 'Total estimado' : 'Estimated total'), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 20,
        fontWeight: 800,
        color: '#0EBAC7',
        fontFamily: 'var(--pg-font-display)'
      }
    }, "$", fmtN(totalPrice, lang))), /*#__PURE__*/React.createElement("button", {
      onClick: handleRequestRental,
      disabled: reqLoading || !reqPeriod,
      style: {
        width: '100%',
        height: 50,
        borderRadius: 13,
        border: 'none',
        cursor: reqLoading || !reqPeriod ? 'default' : 'pointer',
        fontFamily: 'inherit',
        fontSize: 15,
        fontWeight: 700,
        color: '#fff',
        background: reqLoading || !reqPeriod ? 'var(--pg-ink-300)' : 'linear-gradient(135deg,#0EBAC7,#0891A8)',
        boxShadow: '0 4px 14px rgba(14,186,199,0.30)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        transition: 'all .15s',
        opacity: reqLoading || !reqPeriod ? 0.6 : 1
      }
    }, reqLoading ? /*#__PURE__*/React.createElement("svg", {
      width: "18",
      height: "18",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "#fff",
      strokeWidth: "2"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "10",
      strokeDasharray: "31.4",
      strokeDashoffset: "10"
    })) : /*#__PURE__*/React.createElement("svg", {
      width: "18",
      height: "18",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "#fff",
      strokeWidth: "2.5",
      strokeLinecap: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    })), lang === 'pt' ? 'Enviar pedido' : 'Send Request')));
  };

  // ── Owner's rental requests panel ─────────────────────────────
  const OwnerRequestsBlock = () => {
    if (!isRent || !isOwner) return null;
    if (ownerRequests.length === 0) return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '12px 14px',
        borderRadius: 12,
        background: 'var(--pg-ink-50)',
        border: '1px solid var(--pg-ink-200)',
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 16
      }
    }, "\uD83D\uDCED"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: 'var(--pg-ink-500)'
      }
    }, lang === 'pt' ? 'Nenhum pedido de aluguel ainda.' : 'No rental requests yet.'));
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }
    }, ownerRequests.map(req => {
      const isPend = req.status === 'pending';
      const isAppr = req.status === 'approved';
      const isComp = req.status === 'completed';
      const isDisp = req.status === 'disputed';
      const isResolved = req.status === 'resolved';
      const isCancelled = req.status === 'cancelled';
      // rgba backgrounds — work in both light and dark mode
      const rowBg = isComp ? 'rgba(22,163,74,0.12)' : isAppr ? 'rgba(14,186,199,0.10)' : isPend ? 'rgba(245,158,11,0.12)' : isDisp ? 'rgba(245,158,11,0.10)' : isResolved ? 'rgba(99,102,241,0.10)' : isCancelled ? 'rgba(107,114,128,0.08)' : 'rgba(239,68,68,0.12)';
      const rowBorder = isComp ? 'rgba(22,163,74,0.40)' : isAppr ? 'rgba(14,186,199,0.40)' : isPend ? 'rgba(245,158,11,0.40)' : isDisp ? 'rgba(245,158,11,0.40)' : isResolved ? 'rgba(99,102,241,0.40)' : isCancelled ? 'rgba(107,114,128,0.25)' : 'rgba(239,68,68,0.40)';
      const statusColor = isComp ? '#22C55E' : isAppr ? '#0EBAC7' : isPend ? '#F59E0B' : isDisp ? '#F59E0B' : isResolved ? '#818CF8' : isCancelled ? 'var(--pg-ink-400)' : '#F87171';
      const statusLabel = isComp ? lang === 'pt' ? '✓ Devolvido' : '✓ Returned' : isAppr ? lang === 'pt' ? '🔄 Em andamento' : '🔄 In progress' : isPend ? lang === 'pt' ? '⏳ Pendente' : '⏳ Pending' : isDisp ? lang === 'pt' ? '⚠ Problema reportado' : '⚠ Issue reported' : isResolved ? lang === 'pt' ? '✅ Resolvido pelo suporte' : '✅ Resolved by support' : isCancelled ? lang === 'pt' ? '🚫 Cancelado' : '🚫 Cancelled' : lang === 'pt' ? '✗ Recusado' : '✗ Declined';
      return /*#__PURE__*/React.createElement("div", {
        key: req.id,
        style: {
          padding: '12px 14px',
          borderRadius: 14,
          background: rowBg,
          border: `1.5px solid ${rowBorder}`
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }
      }, /*#__PURE__*/React.createElement(Avatar, {
        name: req.requester_name || '?',
        size: 32
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          minWidth: 0
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          flexWrap: 'wrap'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 13,
          fontWeight: 700,
          color: 'var(--pg-ink-900)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }
      }, req.requester_name || 'User'), req.requester_verified && /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 9,
          fontWeight: 800,
          padding: '1px 6px',
          borderRadius: 999,
          flexShrink: 0,
          background: 'rgba(22,163,74,0.12)',
          color: '#16A34A',
          border: '1px solid rgba(22,163,74,0.3)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 2
        }
      }, /*#__PURE__*/React.createElement("svg", {
        width: "8",
        height: "8",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "#16A34A",
        strokeWidth: "3.5",
        strokeLinecap: "round"
      }, /*#__PURE__*/React.createElement("polyline", {
        points: "20 6 9 17 4 12"
      })), lang === 'pt' ? 'Verificado' : 'Verified')), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 11,
          fontWeight: 600,
          color: statusColor,
          marginTop: 1
        }
      }, statusLabel)), /*#__PURE__*/React.createElement("button", {
        onClick: () => {
          if (openChat) openChat({
            id: req.requester_id,
            name: req.requester_name || 'User'
          });
          if (onClose) onClose();
        },
        style: {
          border: 'none',
          background: 'var(--pg-ink-200)',
          cursor: 'pointer',
          borderRadius: 10,
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }
      }, Icon.msg(15, 'var(--pg-ink-700)'))), (req.period || req.quantity) && /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          gap: 6,
          marginTop: 8,
          flexWrap: 'wrap'
        }
      }, req.period && /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11,
          fontWeight: 700,
          padding: '3px 9px',
          borderRadius: 999,
          background: 'rgba(14,186,199,0.15)',
          color: '#0EBAC7',
          border: '1px solid rgba(14,186,199,0.3)'
        }
      }, getPeriodSfx(req.period)), req.quantity && /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11,
          fontWeight: 600,
          padding: '3px 9px',
          borderRadius: 999,
          background: 'var(--pg-ink-100)',
          color: 'var(--pg-ink-700)',
          border: '1px solid var(--pg-ink-200)'
        }
      }, "\xD7", req.quantity, " ", getPeriodLabel(req.period || 'day', req.quantity > 1 ? 2 : 1).replace(/^\d+\s*/, '')), req.total_price && /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11,
          fontWeight: 800,
          padding: '3px 9px',
          borderRadius: 999,
          background: 'rgba(22,163,74,0.12)',
          color: '#22C55E',
          border: '1px solid rgba(22,163,74,0.3)',
          marginLeft: 'auto'
        }
      }, "$", fmtN(req.total_price, lang))), isComp && !dismissedDecisions.has(req.id) && /*#__PURE__*/React.createElement("div", {
        style: {
          marginTop: 10,
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid rgba(22,163,74,0.30)'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          padding: '10px 13px',
          background: 'rgba(22,163,74,0.08)'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 12.5,
          fontWeight: 700,
          color: '#15803D',
          marginBottom: 2
        }
      }, lang === 'pt' ? '🎉 Aluguel concluído!' : '🎉 Rental completed!'), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 11.5,
          color: '#16A34A',
          lineHeight: 1.5
        }
      }, lang === 'pt' ? 'Deseja manter este anúncio disponível para outros aluguéis, ou prefere removê-lo?' : 'Would you like to keep this listing available for future rentals, or remove it?')), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          gap: 0
        }
      }, /*#__PURE__*/React.createElement("button", {
        onClick: () => setDismissedDecisions(prev => {
          const s = new Set(prev);
          s.add(req.id);
          return s;
        }),
        style: {
          flex: 1,
          padding: '10px 6px',
          border: 'none',
          borderTop: '1px solid rgba(22,163,74,0.20)',
          borderRight: '1px solid rgba(22,163,74,0.20)',
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontSize: 12,
          fontWeight: 700,
          background: 'rgba(22,163,74,0.10)',
          color: '#15803D',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 5
        }
      }, /*#__PURE__*/React.createElement("svg", {
        width: "13",
        height: "13",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "3",
        strokeLinecap: "round"
      }, /*#__PURE__*/React.createElement("polyline", {
        points: "20 6 9 17 4 12"
      })), lang === 'pt' ? 'Manter ativo' : 'Keep active'), /*#__PURE__*/React.createElement("button", {
        onClick: async () => {
          if (!window.sb) return;
          const ok = window.confirm(lang === 'pt' ? 'Remover o anúncio do marketplace? Não pode ser desfeito.' : 'Remove this listing from the marketplace? This cannot be undone.');
          if (!ok) return;
          const {
            error
          } = await window.sb.from('marketplace').delete().eq('id', item._id);
          if (error) {
            showToast && showToast('❌ ' + error.message);
            return;
          }
          showToast && showToast(lang === 'pt' ? '🗑️ Anúncio removido' : '🗑️ Listing removed');
          onDeleted && onDeleted(item._id);
          onClose && onClose();
        },
        style: {
          flex: 1,
          padding: '10px 6px',
          border: 'none',
          borderTop: '1px solid rgba(239,68,68,0.20)',
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontSize: 12,
          fontWeight: 700,
          background: 'rgba(239,68,68,0.06)',
          color: '#EF4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 5
        }
      }, /*#__PURE__*/React.createElement("svg", {
        width: "13",
        height: "13",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2.5",
        strokeLinecap: "round"
      }, /*#__PURE__*/React.createElement("polyline", {
        points: "3 6 5 6 21 6"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
      })), lang === 'pt' ? 'Remover anúncio' : 'Remove listing'))), isPend && /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          gap: 8,
          marginTop: 10
        }
      }, /*#__PURE__*/React.createElement("button", {
        onClick: () => handleOwnerDecision(req.id, 'approved'),
        style: {
          flex: 1,
          height: 36,
          borderRadius: 10,
          border: 'none',
          cursor: 'pointer',
          background: '#16A34A',
          color: '#fff',
          fontSize: 13,
          fontWeight: 700,
          fontFamily: 'inherit',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6
        }
      }, /*#__PURE__*/React.createElement("svg", {
        width: "14",
        height: "14",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "#fff",
        strokeWidth: "3",
        strokeLinecap: "round"
      }, /*#__PURE__*/React.createElement("polyline", {
        points: "20 6 9 17 4 12"
      })), lang === 'pt' ? 'Aprovar' : 'Approve'), /*#__PURE__*/React.createElement("button", {
        onClick: () => handleOwnerDecision(req.id, 'declined'),
        style: {
          flex: 1,
          height: 36,
          borderRadius: 10,
          border: 'none',
          cursor: 'pointer',
          background: '#EF4444',
          color: '#fff',
          fontSize: 13,
          fontWeight: 700,
          fontFamily: 'inherit',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6
        }
      }, /*#__PURE__*/React.createElement("svg", {
        width: "14",
        height: "14",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "#fff",
        strokeWidth: "3",
        strokeLinecap: "round"
      }, /*#__PURE__*/React.createElement("line", {
        x1: "18",
        y1: "6",
        x2: "6",
        y2: "18"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "6",
        y1: "6",
        x2: "18",
        y2: "18"
      })), lang === 'pt' ? 'Recusar' : 'Decline')), (isResolved || isComp) && /*#__PURE__*/React.createElement("div", {
        style: {
          marginTop: 10
        }
      }, !ownerRatedRequests.has(req.id) ? /*#__PURE__*/React.createElement("button", {
        onClick: () => {
          setRatingStars(0);
          setRatingComment('');
          setRatingSheet({
            requestId: req.id,
            rateeId: req.requester_id,
            rateeName: req.requester_name || 'Renter'
          });
        },
        style: {
          width: '100%',
          height: 36,
          borderRadius: 10,
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
          background: 'linear-gradient(135deg,#F59E0B,#D97706)',
          color: '#fff',
          fontSize: 12,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 5
        }
      }, "\u2B50 ", lang === 'pt' ? 'Avaliar o renter' : 'Rate the renter') : /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 11,
          color: '#818CF8',
          fontWeight: 600,
          textAlign: 'center',
          padding: '5px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 5
        }
      }, /*#__PURE__*/React.createElement("svg", {
        width: "12",
        height: "12",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "#818CF8",
        strokeWidth: "3",
        strokeLinecap: "round"
      }, /*#__PURE__*/React.createElement("polyline", {
        points: "20 6 9 17 4 12"
      })), lang === 'pt' ? 'Renter avaliado' : 'Renter rated')), isAppr && /*#__PURE__*/React.createElement(React.Fragment, null, (requestPhotos[req.id]?.before || []).length > 0 && /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          gap: 6,
          marginTop: 9,
          alignItems: 'center',
          flexWrap: 'wrap'
        }
      }, requestPhotos[req.id].before.map((url, i) => /*#__PURE__*/React.createElement("img", {
        key: i,
        src: url,
        alt: "",
        style: {
          width: 46,
          height: 46,
          objectFit: 'cover',
          borderRadius: 8,
          border: '1.5px solid rgba(14,186,199,0.5)'
        }
      })), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 10,
          color: '#0EBAC7',
          fontWeight: 700,
          marginLeft: 2
        }
      }, lang === 'pt' ? '📷 fotos antes' : '📷 before photos')), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          gap: 6,
          marginTop: 9
        }
      }, (requestPhotos[req.id]?.before || []).length < 3 && /*#__PURE__*/React.createElement("button", {
        onClick: () => {
          setAddingPhotoFor(req.id);
          if (beforePhotoRef.current) beforePhotoRef.current.click();
        },
        disabled: photoUploading && addingPhotoFor === req.id,
        style: {
          width: 36,
          height: 36,
          flexShrink: 0,
          borderRadius: 10,
          cursor: 'pointer',
          fontFamily: 'inherit',
          border: '1.5px solid var(--pg-ink-300)',
          background: 'var(--pg-ink-100)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 15
        }
      }, photoUploading && addingPhotoFor === req.id ? '⏳' : '📷'), /*#__PURE__*/React.createElement("button", {
        onClick: () => handleMarkReturned(req.id, req),
        style: {
          flex: 2,
          height: 36,
          borderRadius: 10,
          border: 'none',
          cursor: 'pointer',
          background: '#16A34A',
          color: '#fff',
          fontSize: 12,
          fontWeight: 700,
          fontFamily: 'inherit',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 5
        }
      }, /*#__PURE__*/React.createElement("svg", {
        width: "13",
        height: "13",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "#fff",
        strokeWidth: "3",
        strokeLinecap: "round"
      }, /*#__PURE__*/React.createElement("polyline", {
        points: "20 6 9 17 4 12"
      })), lang === 'pt' ? 'Devolvido' : 'Returned'), /*#__PURE__*/React.createElement("button", {
        onClick: () => {
          setDisputeSeverity('serious');
          setDisputeDesc('');
          setDisputeForm({
            requestId: req.id,
            req
          });
        },
        style: {
          flex: 1,
          height: 36,
          borderRadius: 10,
          cursor: 'pointer',
          fontFamily: 'inherit',
          border: '1.5px solid rgba(245,158,11,0.5)',
          background: 'rgba(245,158,11,0.08)',
          color: '#F59E0B',
          fontSize: 12,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 5
        }
      }, /*#__PURE__*/React.createElement("svg", {
        width: "13",
        height: "13",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "#F59E0B",
        strokeWidth: "2.5",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("path", {
        d: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "12",
        y1: "9",
        x2: "12",
        y2: "13"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "12",
        y1: "17",
        x2: "12.01",
        y2: "17"
      })), lang === 'pt' ? 'Problema' : 'Issue')), /*#__PURE__*/React.createElement("button", {
        onClick: () => handleOwnerCancelRental(req.id),
        style: {
          width: '100%',
          marginTop: 6,
          padding: '7px',
          borderRadius: 10,
          cursor: 'pointer',
          fontFamily: 'inherit',
          border: '1px solid rgba(107,114,128,0.30)',
          background: 'rgba(107,114,128,0.06)',
          color: 'var(--pg-ink-400)',
          fontSize: 11,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 5
        }
      }, /*#__PURE__*/React.createElement("svg", {
        width: "11",
        height: "11",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "3",
        strokeLinecap: "round"
      }, /*#__PURE__*/React.createElement("line", {
        x1: "18",
        y1: "6",
        x2: "6",
        y2: "18"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "6",
        y1: "6",
        x2: "18",
        y2: "18"
      })), lang === 'pt' ? 'Cancelar aluguel' : 'Cancel rental')));
    }));
  };
  const MarkSoldBlock = () => /*#__PURE__*/React.createElement(React.Fragment, null, isOwner && !isSold && /*#__PURE__*/React.createElement("button", {
    onClick: () => setMarkSoldOpen(true),
    style: {
      width: '100%',
      padding: '13px',
      borderRadius: 14,
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'inherit',
      background: 'linear-gradient(135deg,#22C55E,#15803D)',
      color: '#fff',
      fontSize: 14,
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      boxShadow: '0 4px 14px rgba(21,128,61,0.35)',
      transition: 'all .15s'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#fff",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12.99V2h10.99l8.6 8.59a2 2 0 0 1 0 2.82z"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "7",
    y1: "7",
    x2: "7.01",
    y2: "7"
  })), lang === 'pt' ? 'Marcar como vendido' : lang === 'es' ? 'Marcar como vendido' : 'Mark as Sold'), isSold && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 16px',
      borderRadius: 12,
      background: 'linear-gradient(135deg,#F0FDF4,#DCFCE7)',
      border: '1.5px solid #86EFAC',
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 32,
      height: 32,
      borderRadius: '50%',
      background: '#16A34A',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#fff",
    strokeWidth: "3",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "20 6 9 17 4 12"
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 800,
      color: '#15803D'
    }
  }, lang === 'pt' ? 'Vendido!' : lang === 'es' ? '¡Vendido!' : 'Item Sold!'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: '#16A34A',
      marginTop: 1
    }
  }, lang === 'pt' ? 'Esta negociação foi concluída.' : 'This deal has been completed.'))));

  // ── Location sub-component ────────────────────────────────────
  const LocationSection = () => !item.loc ? null : /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, Icon.pin(14, 'var(--pg-ink-500)'), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: 'var(--pg-ink-700)'
    }
  }, lang === 'pt' ? 'Localização' : lang === 'es' ? 'Ubicación' : 'Location')), /*#__PURE__*/React.createElement("a", {
    href: `https://www.google.com/maps/search/${encodeURIComponent((item.loc || '') + ', FL')}`,
    target: "_blank",
    rel: "noreferrer",
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--pg-blue-500)',
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, lang === 'pt' ? 'Abrir no Maps' : 'Open in Maps', " \u2197")), mapCoords ? /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 14,
      overflow: 'hidden',
      border: '1px solid var(--pg-ink-200)',
      height: 200,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("iframe", {
    title: "listing-location",
    src: `https://www.openstreetmap.org/export/embed.html?bbox=${mapCoords.lon - 0.05},${mapCoords.lat - 0.04},${mapCoords.lon + 0.05},${mapCoords.lat + 0.04}&layer=mapnik&marker=${mapCoords.lat},${mapCoords.lon}`,
    style: {
      width: '100%',
      height: '100%',
      border: 'none',
      display: 'block'
    },
    loading: "lazy"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 10,
      left: 10,
      background: 'rgba(0,0,0,0.60)',
      backdropFilter: 'blur(6px)',
      borderRadius: 999,
      padding: '4px 10px',
      fontSize: 11,
      fontWeight: 600,
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      gap: 5
    }
  }, Icon.pin(10, '#fff'), " ", item.loc)) : mapLoading ? /*#__PURE__*/React.createElement("div", {
    style: {
      height: 200,
      borderRadius: 14,
      background: 'var(--pg-ink-100)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 13,
      color: 'var(--pg-ink-400)'
    }
  }, lang === 'pt' ? 'Carregando mapa…' : 'Loading map…') : /*#__PURE__*/React.createElement("a", {
    href: `https://www.google.com/maps/search/${encodeURIComponent((item.loc || '') + ', FL')}`,
    target: "_blank",
    rel: "noreferrer",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '14px 16px',
      borderRadius: 12,
      background: 'var(--pg-ink-50)',
      border: '1px solid var(--pg-ink-200)',
      textDecoration: 'none'
    }
  }, Icon.pin(16, 'var(--pg-blue-500)'), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--pg-blue-500)'
    }
  }, item.loc, ", FL"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      fontSize: 11,
      color: 'var(--pg-ink-400)'
    }
  }, "\u2197")));

  // ── More from seller sub-component ───────────────────────────
  const MoreFromSeller = () => {
    const others = liveMarket.filter(m => m.author_id && m.author_id === item.author_id && m._id !== item._id && (m.status === 'approved' || m.status === 'active'));
    if (others.length === 0) return null;
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: 'var(--pg-ink-900)',
        marginBottom: 12
      }
    }, lang === 'pt' ? `Mais de ${authorDisplay}` : lang === 'es' ? `Más de ${authorDisplay}` : `More from ${authorDisplay}`), /*#__PURE__*/React.createElement("div", {
      className: "pg-scroll-x",
      style: {
        display: 'flex',
        gap: 12,
        paddingBottom: 4
      }
    }, others.slice(0, 8).map(m => /*#__PURE__*/React.createElement("button", {
      key: m._id,
      onClick: () => onOpenListing && onOpenListing(m),
      className: "pg-press",
      style: {
        flexShrink: 0,
        width: 156,
        padding: 0,
        border: '1px solid var(--pg-ink-200)',
        borderRadius: 14,
        background: 'var(--pg-white)',
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--pg-shadow-1)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: 100,
        background: 'var(--pg-ink-100)',
        overflow: 'hidden',
        flexShrink: 0
      }
    }, m.photoUrls && m.photoUrls[0] || m.photoUrl ? /*#__PURE__*/React.createElement("img", {
      src: m.photoUrls && m.photoUrls[0] || m.photoUrl,
      alt: m.name,
      style: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }
    }) : /*#__PURE__*/React.createElement(NoPhotoPlaceholder, {
      height: 100,
      small: true
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '8px 10px 10px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 700,
        color: 'var(--pg-ink-900)',
        lineHeight: 1.3,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }
    }, m.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: 'var(--pg-blue-500)',
        marginTop: 3
      }
    }, m.priceMode === 'neg' ? lang === 'pt' ? 'Negociável' : 'Negotiable' : `$${fmtN(m.price, lang)}`))))));
  };
  const MarkSoldSheetSlot = () => /*#__PURE__*/React.createElement(Sheet, {
    open: markSoldOpen,
    onClose: () => setMarkSoldOpen(false),
    height: "auto"
  }, markSoldOpen && /*#__PURE__*/React.createElement(MarkSoldSheet, {
    item: item,
    lang: lang,
    currentUser: currentUser,
    onClose: () => setMarkSoldOpen(false),
    showToast: showToast,
    onSold: sellerRating => {
      setMarkSoldOpen(false);
      onAfterSold && onAfterSold(sellerRating);
    }
  }));

  // ── Rating overlay — floats above both desktop and mobile layouts ─
  const RatingOverlay = () => {
    if (!ratingSheet) return null;
    const starLabels = ['', '⭐ Very bad', '😐 OK', '🙂 Good', '😊 Very good', '🌟 Excellent'];
    const starLabelsPt = ['', '⭐ Muito ruim', '😐 Regular', '🙂 Bom', '😊 Muito bom', '🌟 Excelente'];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        zIndex: 9500,
        display: 'flex',
        alignItems: 'flex-end'
      },
      onClick: () => setRatingSheet(null)
    }, /*#__PURE__*/React.createElement("div", {
      onClick: e => e.stopPropagation(),
      style: {
        width: '100%',
        maxWidth: 520,
        margin: '0 auto',
        background: 'var(--pg-white)',
        borderRadius: '22px 22px 0 0',
        padding: '24px 24px 44px',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.18)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 36,
        height: 4,
        borderRadius: 999,
        background: 'var(--pg-ink-200)',
        margin: '0 auto 20px'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 20,
        fontWeight: 800,
        color: 'var(--pg-ink-900)',
        fontFamily: 'var(--pg-font-display)',
        textAlign: 'center',
        marginBottom: 4
      }
    }, lang === 'pt' ? 'Avalie sua experiência' : 'Rate your experience'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: 'var(--pg-ink-500)',
        textAlign: 'center',
        marginBottom: 24
      }
    }, lang === 'pt' ? `Como foi seu aluguel com ${ratingSheet.rateeName}?` : `How was your rental with ${ratingSheet.rateeName}?`), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 20
      }
    }, [1, 2, 3, 4, 5].map(s => /*#__PURE__*/React.createElement("button", {
      key: s,
      onMouseEnter: () => setRatingHover(s),
      onMouseLeave: () => setRatingHover(0),
      onClick: () => setRatingStars(s),
      style: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px 2px',
        fontSize: 40,
        lineHeight: 1,
        color: (ratingHover || ratingStars) >= s ? '#F59E0B' : 'var(--pg-ink-200)',
        transition: 'color .1s, transform .12s',
        transform: (ratingHover || ratingStars) >= s ? 'scale(1.18)' : 'scale(1)'
      }
    }, "\u2605"))), ratingStars > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        fontSize: 13,
        fontWeight: 700,
        color: 'var(--pg-ink-600)',
        marginBottom: 18,
        marginTop: -8
      }
    }, (lang === 'pt' ? starLabelsPt : starLabels)[ratingStars]), /*#__PURE__*/React.createElement("textarea", {
      value: ratingComment,
      onChange: e => setRatingComment(e.target.value),
      maxLength: 200,
      placeholder: lang === 'pt' ? 'Comentário opcional (máx. 200 caracteres)...' : 'Optional comment (max. 200 chars)...',
      rows: 3,
      style: {
        width: '100%',
        borderRadius: 12,
        border: '1.5px solid var(--pg-ink-200)',
        background: 'var(--pg-ink-50)',
        color: 'var(--pg-ink-900)',
        fontFamily: 'inherit',
        fontSize: 14,
        padding: '11px 13px',
        resize: 'none',
        boxSizing: 'border-box',
        outline: 'none',
        marginBottom: 16,
        display: 'block'
      }
    }), /*#__PURE__*/React.createElement("button", {
      onClick: handleSubmitRating,
      disabled: ratingStars === 0 || ratingLoading,
      style: {
        width: '100%',
        height: 50,
        borderRadius: 14,
        border: 'none',
        cursor: ratingStars === 0 ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        fontSize: 15,
        fontWeight: 800,
        color: '#fff',
        marginBottom: 10,
        background: ratingStars === 0 ? 'var(--pg-ink-300)' : 'linear-gradient(135deg,#F59E0B,#D97706)',
        opacity: ratingStars === 0 ? 0.5 : 1,
        transition: 'all .15s'
      }
    }, ratingLoading ? lang === 'pt' ? 'Enviando...' : 'Sending...' : lang === 'pt' ? 'Enviar avaliação' : 'Submit rating'), /*#__PURE__*/React.createElement("button", {
      onClick: () => setRatingSheet(null),
      style: {
        width: '100%',
        height: 42,
        borderRadius: 12,
        border: '1.5px solid var(--pg-ink-200)',
        background: 'transparent',
        color: 'var(--pg-ink-500)',
        fontSize: 14,
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'inherit'
      }
    }, lang === 'pt' ? 'Agora não' : 'Not now')));
  };

  // ── Dispute report form ───────────────────────────────────────
  const DisputeFormSheet = () => {
    if (!disputeForm) return null;
    const sevs = [{
      id: 'minor',
      emoji: '🟡',
      label: lang === 'pt' ? 'Leve' : 'Minor',
      desc: lang === 'pt' ? 'Ex: pequeno atraso' : 'e.g. small delay'
    }, {
      id: 'serious',
      emoji: '🟠',
      label: lang === 'pt' ? 'Sério' : 'Serious',
      desc: lang === 'pt' ? 'Ex: dano no item' : 'e.g. item damaged'
    }, {
      id: 'critical',
      emoji: '🔴',
      label: lang === 'pt' ? 'Crítico' : 'Critical',
      desc: lang === 'pt' ? 'Não devolvido' : 'Not returned'
    }];
    const sevColor = {
      minor: '#EAB308',
      serious: '#F59E0B',
      critical: '#EF4444'
    };
    const addPhotos = files => {
      const arr = Array.from(files).filter(f => f.type.startsWith('image/')).slice(0, 5 - disputePhotos.length);
      const items = arr.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setDisputePhotos(prev => [...prev, ...items].slice(0, 5));
    };
    const removePhoto = idx => {
      setDisputePhotos(prev => {
        URL.revokeObjectURL(prev[idx].preview);
        return prev.filter((_, i) => i !== idx);
      });
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        zIndex: 9600,
        display: 'flex',
        alignItems: 'flex-end'
      },
      onClick: () => {
        setDisputeForm(null);
        setDisputePhotos([]);
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: e => e.stopPropagation(),
      style: {
        width: '100%',
        maxWidth: 520,
        margin: '0 auto',
        background: 'var(--pg-white)',
        borderRadius: '22px 22px 0 0',
        padding: '20px 20px 44px',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
        maxHeight: '92vh',
        overflowY: 'auto'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 36,
        height: 4,
        borderRadius: 999,
        background: 'var(--pg-ink-200)',
        margin: '0 auto 18px'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 19,
        fontWeight: 800,
        color: 'var(--pg-ink-900)',
        marginBottom: 4
      }
    }, "\u26A0 ", lang === 'pt' ? 'Reportar problema' : 'Report an issue'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12.5,
        color: 'var(--pg-ink-500)',
        marginBottom: 16
      }
    }, lang === 'pt' ? `Este report será analisado pela equipe PoolGuyX e pode resultar em penalidades para ${disputeForm.req.requester_name || 'o renter'}.` : `This report will be reviewed by PoolGuyX and may result in penalties for ${disputeForm.req.requester_name || 'the renter'}.`), /*#__PURE__*/React.createElement("div", {
      style: {
        borderRadius: 12,
        padding: '12px 14px',
        marginBottom: 18,
        background: 'rgba(59,130,246,0.07)',
        border: '1.5px solid rgba(59,130,246,0.25)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: '#3B82F6',
        marginBottom: 4
      }
    }, "\uD83D\uDCCE ", lang === 'pt' ? 'Adicione o máximo de provas possível' : lang === 'es' ? 'Agrega el máximo de pruebas posible' : 'Add as much evidence as possible'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: '#3B82F6',
        lineHeight: 1.55,
        opacity: 0.85
      }
    }, lang === 'pt' ? 'Nossa equipe técnica vai analisar todas as fotos e informações antes de tomar qualquer decisão. Prints, fotos do estado do equipamento e comprovantes aumentam suas chances de resolução.' : lang === 'es' ? 'Nuestro equipo técnico analizará todas las fotos e información antes de tomar cualquier decisión. Capturas de pantalla, fotos del equipamiento y comprobantes aumentan tus posibilidades de resolución.' : 'Our technical team will review all photos and information before making any decision. Screenshots, equipment condition photos and proof of communication increase your chances of resolution.')), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 700,
        color: 'var(--pg-ink-700)',
        marginBottom: 8
      }
    }, lang === 'pt' ? 'Gravidade:' : 'Severity:'), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 7,
        marginBottom: 16
      }
    }, sevs.map(s => /*#__PURE__*/React.createElement("button", {
      key: s.id,
      onClick: () => setDisputeSeverity(s.id),
      style: {
        flex: 1,
        padding: '10px 6px',
        borderRadius: 12,
        cursor: 'pointer',
        fontFamily: 'inherit',
        border: `1.5px solid ${disputeSeverity === s.id ? sevColor[s.id] : 'var(--pg-ink-200)'}`,
        background: disputeSeverity === s.id ? `rgba(${s.id === 'critical' ? '239,68,68' : s.id === 'serious' ? '245,158,11' : '234,179,8'},0.08)` : 'var(--pg-ink-50)',
        transition: 'all .12s'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: disputeSeverity === s.id ? sevColor[s.id] : 'var(--pg-ink-700)'
      }
    }, s.emoji, " ", s.label), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: 'var(--pg-ink-400)',
        marginTop: 3
      }
    }, s.desc)))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 700,
        color: 'var(--pg-ink-700)',
        marginBottom: 6
      }
    }, lang === 'pt' ? 'Descrição detalhada:' : lang === 'es' ? 'Descripción detallada:' : 'Detailed description:'), /*#__PURE__*/React.createElement("textarea", {
      value: disputeDesc,
      onChange: e => setDisputeDesc(e.target.value),
      maxLength: 500,
      placeholder: lang === 'pt' ? 'Descreva o problema com o máximo de detalhes possível...' : lang === 'es' ? 'Describe el problema con el máximo de detalle posible...' : 'Describe the issue with as much detail as possible...',
      rows: 4,
      style: {
        width: '100%',
        borderRadius: 12,
        border: '1.5px solid var(--pg-ink-200)',
        background: 'var(--pg-ink-50)',
        color: 'var(--pg-ink-900)',
        fontFamily: 'inherit',
        fontSize: 14,
        padding: '11px 13px',
        resize: 'none',
        boxSizing: 'border-box',
        outline: 'none',
        marginBottom: 16,
        display: 'block'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 700,
        color: 'var(--pg-ink-700)',
        marginBottom: 8
      }
    }, "\uD83D\uDCF7 ", lang === 'pt' ? `Fotos como prova (${disputePhotos.length}/5)` : lang === 'es' ? `Fotos como prueba (${disputePhotos.length}/5)` : `Evidence photos (${disputePhotos.length}/5)`), disputePhotos.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        marginBottom: 10
      }
    }, disputePhotos.map((p, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        position: 'relative',
        width: 76,
        height: 76,
        borderRadius: 10,
        overflow: 'hidden',
        flexShrink: 0,
        border: '1.5px solid var(--pg-ink-200)'
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: p.preview,
      alt: "",
      style: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }
    }), /*#__PURE__*/React.createElement("button", {
      onClick: () => removePhoto(i),
      style: {
        position: 'absolute',
        top: 2,
        right: 2,
        width: 20,
        height: 20,
        borderRadius: '50%',
        border: 'none',
        background: 'rgba(0,0,0,0.65)',
        color: '#fff',
        fontSize: 11,
        fontWeight: 900,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1,
        padding: 0
      }
    }, "\xD7")))), disputePhotos.length < 5 && /*#__PURE__*/React.createElement("label", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 44,
        borderRadius: 12,
        border: '1.5px dashed var(--pg-ink-300)',
        background: 'var(--pg-ink-50)',
        cursor: 'pointer',
        marginBottom: 16,
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--pg-ink-500)'
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "18",
      height: "18",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round"
    }, /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "3",
      width: "18",
      height: "18",
      rx: "3"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "8.5",
      cy: "8.5",
      r: "1.5"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "21 15 16 10 5 21"
    })), lang === 'pt' ? 'Adicionar fotos' : lang === 'es' ? 'Agregar fotos' : 'Add photos', /*#__PURE__*/React.createElement("input", {
      type: "file",
      accept: "image/*",
      multiple: true,
      style: {
        display: 'none'
      },
      onChange: e => {
        addPhotos(e.target.files);
        e.target.value = '';
      }
    })), /*#__PURE__*/React.createElement("button", {
      onClick: handleReportProblemFull,
      disabled: !disputeDesc.trim() || disputeLoading,
      style: {
        width: '100%',
        height: 50,
        borderRadius: 14,
        border: 'none',
        cursor: !disputeDesc.trim() ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        fontSize: 15,
        fontWeight: 800,
        color: '#fff',
        marginBottom: 10,
        background: !disputeDesc.trim() ? 'var(--pg-ink-300)' : 'linear-gradient(135deg,#EF4444,#DC2626)',
        opacity: !disputeDesc.trim() ? 0.5 : 1,
        transition: 'all .15s'
      }
    }, disputeLoading ? lang === 'pt' ? `Enviando${disputePhotos.length > 0 ? ` ${disputePhotos.length} foto${disputePhotos.length > 1 ? 's' : ''}...` : '...'}` : lang === 'es' ? 'Enviando...' : 'Sending...' : lang === 'pt' ? 'Enviar report' : lang === 'es' ? 'Enviar reporte' : 'Submit report'), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        setDisputeForm(null);
        setDisputePhotos([]);
      },
      style: {
        width: '100%',
        height: 42,
        borderRadius: 12,
        border: '1.5px solid var(--pg-ink-200)',
        background: 'transparent',
        color: 'var(--pg-ink-500)',
        fontSize: 14,
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'inherit'
      }
    }, lang === 'pt' ? 'Cancelar' : lang === 'es' ? 'Cancelar' : 'Cancel')));
  };

  // ── After-photo comparison step ───────────────────────────────
  const AfterPhotoSheet = () => {
    if (!afterStep) return null;
    const beforePics = requestPhotos[afterStep.requestId]?.before || [];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.65)',
        zIndex: 9550,
        overflowY: 'auto',
        display: 'flex',
        alignItems: 'flex-end'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: '100%',
        maxWidth: 520,
        margin: '0 auto',
        background: 'var(--pg-white)',
        borderRadius: '22px 22px 0 0',
        padding: '24px 24px 44px',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.2)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 36,
        height: 4,
        borderRadius: 999,
        background: 'var(--pg-ink-200)',
        margin: '0 auto 20px'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 19,
        fontWeight: 800,
        color: 'var(--pg-ink-900)',
        marginBottom: 4
      }
    }, "\uD83D\uDCF8 ", lang === 'pt' ? 'Fotos da devolução' : 'Return photos'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12.5,
        color: 'var(--pg-ink-500)',
        marginBottom: 20
      }
    }, lang === 'pt' ? 'Você registrou o estado antes. Adicione fotos do estado atual para documentar a devolução.' : 'You have before photos. Add after photos to document the return condition.'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        color: 'var(--pg-ink-500)',
        letterSpacing: '.06em',
        textTransform: 'uppercase',
        marginBottom: 8
      }
    }, lang === 'pt' ? 'Estado antes:' : 'Before:'), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        marginBottom: 18,
        flexWrap: 'wrap'
      }
    }, beforePics.map((url, i) => /*#__PURE__*/React.createElement("img", {
      key: i,
      src: url,
      alt: "",
      style: {
        width: 64,
        height: 64,
        objectFit: 'cover',
        borderRadius: 10,
        border: '2px solid rgba(14,186,199,0.5)'
      }
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        color: 'var(--pg-ink-500)',
        letterSpacing: '.06em',
        textTransform: 'uppercase',
        marginBottom: 8
      }
    }, lang === 'pt' ? `Estado depois (${afterPhotos.length}/4):` : `After (${afterPhotos.length}/4):`), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        marginBottom: 20,
        flexWrap: 'wrap'
      }
    }, afterPhotos.map((url, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        position: 'relative',
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: url,
      alt: "",
      style: {
        width: 64,
        height: 64,
        objectFit: 'cover',
        borderRadius: 10,
        border: '2px solid rgba(22,163,74,0.5)'
      }
    }), /*#__PURE__*/React.createElement("button", {
      onClick: () => setAfterPhotos(p => p.filter((_, j) => j !== i)),
      style: {
        position: 'absolute',
        top: -6,
        right: -6,
        width: 20,
        height: 20,
        borderRadius: '50%',
        border: 'none',
        background: '#EF4444',
        color: '#fff',
        fontSize: 12,
        cursor: 'pointer',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        lineHeight: '20px'
      }
    }, "\xD7"))), afterPhotos.length < 4 && /*#__PURE__*/React.createElement("button", {
      onClick: () => afterPhotoRef.current && afterPhotoRef.current.click(),
      disabled: afterUploading,
      style: {
        width: 64,
        height: 64,
        borderRadius: 10,
        border: '2px dashed var(--pg-ink-300)',
        background: 'var(--pg-ink-50)',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: afterUploading ? 13 : 24,
        color: 'var(--pg-ink-400)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, afterUploading ? '⏳' : '+')), /*#__PURE__*/React.createElement("button", {
      onClick: handleConfirmReturn,
      disabled: afterPhotos.length === 0,
      style: {
        width: '100%',
        height: 50,
        borderRadius: 14,
        border: 'none',
        cursor: afterPhotos.length === 0 ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        fontSize: 15,
        fontWeight: 800,
        color: '#fff',
        marginBottom: 10,
        background: afterPhotos.length === 0 ? 'var(--pg-ink-300)' : 'linear-gradient(135deg,#16A34A,#15803D)',
        opacity: afterPhotos.length === 0 ? 0.5 : 1,
        transition: 'all .15s'
      }
    }, lang === 'pt' ? 'Confirmar devolução' : 'Confirm return'), /*#__PURE__*/React.createElement("button", {
      onClick: () => setAfterStep(null),
      style: {
        width: '100%',
        height: 42,
        borderRadius: 12,
        border: '1.5px solid var(--pg-ink-200)',
        background: 'transparent',
        color: 'var(--pg-ink-500)',
        fontSize: 14,
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'inherit'
      }
    }, lang === 'pt' ? 'Cancelar' : 'Cancel')));
  };

  // ══════════════════════════════════════════════════════════════
  // ── DESKTOP LAYOUT (≥ 900px) ─────────────────────────────────
  // ══════════════════════════════════════════════════════════════
  if (isDesktop) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        minHeight: '100vh',
        background: 'var(--pg-ink-50)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'var(--pg-white)',
        borderBottom: '1px solid var(--pg-ink-150,var(--pg-ink-200))',
        boxShadow: '0 1px 12px rgba(0,0,0,0.06)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 1140,
        margin: '0 auto',
        padding: '0 32px',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: onClose,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        color: 'var(--pg-blue-600)',
        fontWeight: 600,
        fontSize: 14,
        fontFamily: 'inherit',
        padding: '8px 0',
        borderRadius: 8
      }
    }, Icon.chev(18, 'var(--pg-blue-600)', 'left'), lang === 'pt' ? 'Voltar ao Marketplace' : lang === 'es' ? 'Volver al Marketplace' : 'Back to Marketplace'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: 'var(--pg-ink-400)',
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--pg-ink-300)'
      }
    }, "Marketplace"), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--pg-ink-200)'
      }
    }, "\u203A"), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--pg-ink-600)',
        fontWeight: 600,
        maxWidth: 280,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }
    }, item.name)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8
      }
    }, !isOwner && !isStatic && /*#__PURE__*/React.createElement("button", {
      onClick: onToggleSave,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 14px',
        borderRadius: 10,
        border: isSaved ? '1.5px solid #FCA5A5' : '1.5px solid var(--pg-ink-200)',
        background: isSaved ? '#FEF2F2' : 'var(--pg-ink-50)',
        color: isSaved ? '#EF4444' : 'var(--pg-ink-500)',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 13,
        fontWeight: 600
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: isSaved ? 'currentColor' : 'none',
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
    })), isSaved ? lang === 'pt' ? 'Salvo' : 'Saved' : lang === 'pt' ? 'Salvar' : 'Save'), /*#__PURE__*/React.createElement("button", {
      onClick: onShare,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 14px',
        borderRadius: 10,
        border: '1.5px solid var(--pg-ink-200)',
        background: 'var(--pg-ink-50)',
        color: 'var(--pg-ink-500)',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 13,
        fontWeight: 600
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "15",
      height: "15",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "18",
      cy: "5",
      r: "3"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "6",
      cy: "12",
      r: "3"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "18",
      cy: "19",
      r: "3"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "8.59",
      y1: "13.51",
      x2: "15.42",
      y2: "17.49"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "15.41",
      y1: "6.51",
      x2: "8.59",
      y2: "10.49"
    })), lang === 'pt' ? 'Compartilhar' : 'Share'), canDelete && !isStatic && /*#__PURE__*/React.createElement("button", {
      onClick: handleAdminDelete,
      disabled: deleting,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 14px',
        borderRadius: 10,
        border: '1.5px solid #FCA5A5',
        background: '#FEF2F2',
        color: '#EF4444',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 13,
        fontWeight: 600,
        opacity: deleting ? 0.6 : 1
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "15",
      height: "15",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round"
    }, /*#__PURE__*/React.createElement("polyline", {
      points: "3 6 5 6 21 6"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M10 11v6"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M14 11v6"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
    })), lang === 'pt' ? 'Excluir' : 'Delete')))), /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 1140,
        margin: '0 auto',
        padding: '36px 32px 80px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 420px',
        gap: 36,
        alignItems: 'start'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 32
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        borderRadius: 20,
        overflow: 'hidden',
        background: 'var(--pg-ink-100)',
        position: 'relative',
        aspectRatio: '4/3',
        boxShadow: '0 4px 32px rgba(0,0,0,0.10)'
      }
    }, allPhotos.length > 0 ? /*#__PURE__*/React.createElement("img", {
      src: allPhotos[imgIdx],
      alt: item.name,
      onClick: () => setViewerOpen(true),
      style: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
        cursor: 'zoom-in',
        transition: 'transform .3s ease'
      }
    }) : item.type === 'route' ? /*#__PURE__*/React.createElement(RouteNoPhotoHero, {
      item: item,
      lang: lang
    }) : /*#__PURE__*/React.createElement(NoPhotoPlaceholder, {
      height: "100%"
    }), isSold && /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: '#16A34A',
        color: '#fff',
        borderRadius: 16,
        padding: '12px 28px',
        fontSize: 22,
        fontWeight: 900,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        boxShadow: '0 4px 24px rgba(22,163,74,0.4)'
      }
    }, "SOLD")), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 4
      }
    }, /*#__PURE__*/React.createElement(TypeBadge, null)), isAdmin && /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 4,
        fontSize: 10,
        fontWeight: 700,
        padding: '4px 10px',
        borderRadius: 6,
        background: 'rgba(239,68,68,0.85)',
        color: '#fff',
        letterSpacing: '0.05em'
      }
    }, "\uD83D\uDEE1 ADMIN"), imgIdx > 0 && /*#__PURE__*/React.createElement("button", {
      onClick: () => setImgIdx(i => i - 1),
      style: {
        position: 'absolute',
        left: 14,
        top: '50%',
        transform: 'translateY(-50%)',
        width: 42,
        height: 42,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.92)',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 12px rgba(0,0,0,0.20)',
        zIndex: 4,
        transition: 'all .15s'
      }
    }, Icon.chev(22, '#111', 'left')), imgIdx < allPhotos.length - 1 && /*#__PURE__*/React.createElement("button", {
      onClick: () => setImgIdx(i => i + 1),
      style: {
        position: 'absolute',
        right: 14,
        top: '50%',
        transform: 'translateY(-50%)',
        width: 42,
        height: 42,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.92)',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 12px rgba(0,0,0,0.20)',
        zIndex: 4,
        transition: 'all .15s'
      }
    }, Icon.chev(22, '#111', 'right')), allPhotos.length > 1 && /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        bottom: 14,
        right: 16,
        zIndex: 4,
        background: 'rgba(0,0,0,0.50)',
        backdropFilter: 'blur(4px)',
        borderRadius: 999,
        padding: '3px 10px',
        fontSize: 11,
        fontWeight: 700,
        color: '#fff'
      }
    }, imgIdx + 1, " / ", allPhotos.length)), allPhotos.length > 1 && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 10,
        flexWrap: 'wrap'
      }
    }, allPhotos.map((url, i) => /*#__PURE__*/React.createElement("button", {
      key: i,
      onClick: () => setImgIdx(i),
      style: {
        width: 80,
        height: 80,
        borderRadius: 12,
        overflow: 'hidden',
        padding: 0,
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'all .15s',
        border: i === imgIdx ? '2.5px solid var(--pg-blue-500)' : '2px solid var(--pg-ink-200)',
        opacity: i === imgIdx ? 1 : 0.65,
        boxShadow: i === imgIdx ? '0 0 0 3px rgba(59,130,246,0.15)' : 'none'
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: url,
      alt: "",
      style: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }
    })))), item.description && /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'var(--pg-white)',
        borderRadius: 16,
        padding: '24px',
        border: '1px solid var(--pg-ink-200)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        fontWeight: 800,
        color: 'var(--pg-ink-400)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginBottom: 12
      }
    }, lang === 'pt' ? 'DESCRIÇÃO' : 'DESCRIPTION'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 15,
        lineHeight: 1.7,
        color: 'var(--pg-ink-700)'
      }
    }, /*#__PURE__*/React.createElement(Tx, {
      lang: lang
    }, item.description))), (item.type === 'pool' || item.type === 'route') && (() => {
      const rows = [];
      if (item.loc) rows.push({
        label: lang === 'pt' ? 'Cidade' : lang === 'es' ? 'Ciudad' : 'City',
        value: item.loc
      });
      if (item.address) rows.push({
        label: lang === 'pt' ? 'Endereço' : lang === 'es' ? 'Dirección' : 'Address',
        value: item.address,
        full: true
      });
      if (item.sizeFt) rows.push({
        label: lang === 'pt' ? 'Tamanho' : lang === 'es' ? 'Tamaño' : 'Size',
        value: item.sizeFt
      });
      if (item.gallons) rows.push({
        label: lang === 'pt' ? 'Capacidade' : lang === 'es' ? 'Capacidad' : 'Capacity',
        value: `${fmtN(item.gallons, lang)} gal`
      });
      if (item.system) rows.push({
        label: lang === 'pt' ? 'Sistema' : lang === 'es' ? 'Sistema' : 'System',
        value: item.system === 'salt' ? lang === 'pt' ? 'Sal' : 'Salt' : lang === 'pt' ? 'Cloro' : 'Chlorine'
      });
      if (item.freq) rows.push({
        label: lang === 'pt' ? 'Visitas/semana' : lang === 'es' ? 'Visitas/semana' : 'Visits/week',
        value: `${item.freq}x`
      });
      if (item.price) rows.push({
        label: lang === 'pt' ? 'Valor/mês' : lang === 'es' ? 'Valor/mes' : 'Monthly rate',
        value: `$${fmtN(item.price, lang)}/mo`
      });
      if (item.warranty) rows.push({
        label: lang === 'pt' ? 'Garantia' : lang === 'es' ? 'Garantía' : 'Warranty',
        value: item.warranty === 'yes' ? item.warrantyMonths ? `${item.warrantyMonths} ${lang === 'pt' ? 'meses' : 'months'}` : lang === 'pt' ? 'Sim' : 'Yes' : lang === 'pt' ? 'Não' : 'No'
      });
      if (rows.length === 0) return null;
      return /*#__PURE__*/React.createElement("div", {
        style: {
          background: 'var(--pg-white)',
          borderRadius: 16,
          padding: '24px',
          border: '1px solid var(--pg-ink-200)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 11,
          fontWeight: 800,
          color: 'var(--pg-ink-400)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 16
        }
      }, item.type === 'pool' ? lang === 'pt' ? 'DETALHES DA PISCINA' : 'POOL DETAILS' : lang === 'pt' ? 'DETALHES DA ROTA' : 'ROUTE DETAILS'), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '14px 20px'
        }
      }, rows.map((r, i) => /*#__PURE__*/React.createElement("div", {
        key: i,
        style: r.full ? {
          gridColumn: '1/-1'
        } : {}
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 10,
          fontWeight: 700,
          color: 'var(--pg-ink-400)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: 3
        }
      }, r.label), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--pg-ink-800)'
        }
      }, r.value)))));
    })(), item.loc && /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'var(--pg-white)',
        borderRadius: 16,
        padding: '24px',
        border: '1px solid var(--pg-ink-200)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
      }
    }, /*#__PURE__*/React.createElement(LocationSection, null)), /*#__PURE__*/React.createElement(MoreFromSeller, null)), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'sticky',
        top: 76,
        display: 'flex',
        flexDirection: 'column',
        gap: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'var(--pg-white)',
        borderRadius: 20,
        overflow: 'hidden',
        border: '1px solid var(--pg-ink-200)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '20px 24px 0',
        borderBottom: '1px solid var(--pg-ink-100)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement(TypeBadge, null), isSold && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        fontWeight: 800,
        padding: '4px 10px',
        borderRadius: 6,
        background: '#DCFCE7',
        color: '#15803D',
        letterSpacing: '0.07em'
      }
    }, "\u2713 SOLD"), item.status === 'pending' && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        fontWeight: 800,
        padding: '4px 10px',
        borderRadius: 6,
        background: '#FEF3C7',
        color: '#92400E',
        letterSpacing: '0.07em'
      }
    }, "\u23F3 PENDING")), /*#__PURE__*/React.createElement("h1", {
      style: {
        margin: '0 0 10px',
        fontFamily: 'var(--pg-font-display)',
        fontSize: 24,
        fontWeight: 800,
        letterSpacing: '-0.02em',
        lineHeight: 1.2,
        color: 'var(--pg-ink-900)'
      }
    }, /*#__PURE__*/React.createElement(Tx, {
      lang: lang
    }, item.name)), /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement(PriceBlock, {
      large: true
    })), item.loc && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        marginBottom: 18,
        fontSize: 13,
        color: 'var(--pg-ink-500)'
      }
    }, Icon.pin(13, 'var(--pg-ink-400)'), " ", locationLabel)), !isStatic && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '18px 24px',
        borderBottom: '1px solid var(--pg-ink-100)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        fontWeight: 800,
        color: 'var(--pg-ink-400)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginBottom: 12
      }
    }, isRent ? lang === 'pt' ? 'PROPRIETÁRIO' : 'OWNER' : lang === 'pt' ? 'VENDEDOR' : lang === 'es' ? 'VENDEDOR' : 'SELLER'), /*#__PURE__*/React.createElement(SellerRow, {
      horizontal: true
    })), isStatic && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '12px 24px',
        borderBottom: '1px solid var(--pg-ink-100)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: 'var(--pg-ink-200)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 16,
        flexShrink: 0
      }
    }, "\uD83C\uDFAD"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: 'var(--pg-ink-900)'
      }
    }, "Demo Item"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'var(--pg-ink-400)'
      }
    }, lang === 'pt' ? 'Publicado pelo PoolGuyPro' : 'Posted by PoolGuyPro')))), canDelete && /*#__PURE__*/React.createElement("div", {
      style: {
        margin: '16px 24px 0',
        padding: '10px 14px',
        borderRadius: 10,
        background: '#FEF2F2',
        border: '1px solid #FCA5A5',
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 14,
        flexShrink: 0
      }
    }, "\uD83D\uDEE1"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: '#DC2626',
        fontWeight: 500,
        lineHeight: 1.4
      }
    }, lang === 'pt' ? 'Visualizando como admin — 🗑️ remove definitivamente.' : 'Viewing as admin — 🗑️ permanently removes listing.')), isRent && isOwner && ownerRequests.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '18px 24px',
        borderBottom: '1px solid var(--pg-ink-100)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        fontWeight: 800,
        color: 'var(--pg-ink-400)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginBottom: 12
      }
    }, lang === 'pt' ? `PEDIDOS DE ALUGUEL (${ownerRequests.length})` : `RENTAL REQUESTS (${ownerRequests.length})`), /*#__PURE__*/React.createElement(OwnerRequestsBlock, null)), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '18px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }
    }, isRent && !isOwner && /*#__PURE__*/React.createElement(RequestRentalBlock, null), !isOwner && /*#__PURE__*/React.createElement("button", {
      onClick: handleContact,
      style: {
        width: '100%',
        height: isRent ? 46 : 52,
        borderRadius: 14,
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: isRent ? 14 : 15,
        fontWeight: 700,
        color: isRent ? 'var(--pg-blue-700)' : '#fff',
        background: isRent ? 'transparent' : 'linear-gradient(135deg,var(--pg-blue-500),var(--pg-blue-700))',
        border: isRent ? '1.5px solid var(--pg-blue-200)' : 'none',
        boxShadow: isRent ? 'none' : '0 4px 18px rgba(0,119,182,0.30)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 9,
        transition: 'all .15s'
      }
    }, Icon.msg(18, isRent ? 'var(--pg-blue-700)' : '#fff'), lang === 'pt' ? 'Mensagem' : 'Message'), isRent && isOwner && /*#__PURE__*/React.createElement(OwnerRequestsBlock, null), !isRent && !isStatic && /*#__PURE__*/React.createElement(MarkSoldBlock, null)), timeAgoLabel && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '12px 24px 20px',
        textAlign: 'center',
        fontSize: 12,
        color: 'var(--pg-ink-400)',
        borderTop: '1px solid var(--pg-ink-100)'
      }
    }, lang === 'pt' ? `Publicado ${timeAgoLabel}` : `Listed ${timeAgoLabel}`)), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 16,
        padding: '14px 18px',
        borderRadius: 14,
        background: 'var(--pg-white)',
        border: '1px solid var(--pg-ink-200)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 32,
        height: 32,
        borderRadius: 10,
        background: 'var(--pg-blue-50)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "var(--pg-blue-600)",
      strokeWidth: "2",
      strokeLinecap: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
    }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 700,
        color: 'var(--pg-ink-800)',
        marginBottom: 2
      }
    }, lang === 'pt' ? 'Dica de segurança' : 'Safety Tip'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: 'var(--pg-ink-500)',
        lineHeight: 1.5
      }
    }, lang === 'pt' ? 'Sempre se conheçam antes de trocar dinheiro. Prefira locais públicos.' : 'Always meet in a public place. Never send payment before seeing the item.'))))))), viewerOpen && allPhotos.length > 0 && /*#__PURE__*/React.createElement(PhotoViewer, {
      photos: allPhotos,
      startIdx: imgIdx,
      onClose: () => setViewerOpen(false)
    }), MarkSoldSheetSlot(), RatingOverlay(), DisputeFormSheet(), AfterPhotoSheet(), /*#__PURE__*/React.createElement("input", {
      type: "file",
      accept: "image/*",
      capture: "environment",
      ref: beforePhotoRef,
      onChange: handleBeforePhotoFile,
      style: {
        display: 'none'
      }
    }), /*#__PURE__*/React.createElement("input", {
      type: "file",
      accept: "image/*",
      capture: "environment",
      ref: afterPhotoRef,
      onChange: handleAfterPhotoFile,
      style: {
        display: 'none'
      }
    }));
  }

  // ══════════════════════════════════════════════════════════════
  // ── MOBILE LAYOUT (< 900px) — original design kept ───────────
  // ══════════════════════════════════════════════════════════════
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 0 36px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height: 240,
      overflow: 'hidden',
      background: 'var(--pg-ink-200)',
      flexShrink: 0
    }
  }, allPhotos.length > 0 ? /*#__PURE__*/React.createElement("img", {
    src: allPhotos[imgIdx],
    alt: item.name,
    onClick: () => setViewerOpen(true),
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block',
      cursor: allPhotos.length > 1 ? 'default' : 'zoom-in'
    }
  }) : item.type === 'route' ? /*#__PURE__*/React.createElement(RouteNoPhotoHero, {
    item: item,
    lang: lang
  }) : /*#__PURE__*/React.createElement(NoPhotoPlaceholder, {
    height: 240
  }), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      position: 'absolute',
      top: 12,
      left: 12,
      zIndex: 3,
      width: 36,
      height: 36,
      borderRadius: '50%',
      background: 'rgba(0,0,0,0.48)',
      backdropFilter: 'blur(6px)',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      WebkitBackdropFilter: 'blur(6px)'
    }
  }, Icon.chev(20, '#fff', 'left')), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 16,
      left: 58,
      zIndex: 2,
      fontSize: 10,
      fontWeight: 700,
      padding: '4px 10px',
      borderRadius: 8,
      background: item.type === 'rent' ? 'rgba(14,186,199,0.92)' : 'rgba(59,130,246,0.92)',
      color: '#fff',
      letterSpacing: '0.06em',
      backdropFilter: 'blur(4px)',
      textTransform: 'uppercase'
    }
  }, item.type === 'rent' ? lang === 'pt' ? 'ALUGUEL' : lang === 'es' ? 'ALQUILER' : 'RENTAL' : lang === 'pt' ? 'VENDA' : lang === 'es' ? 'VENTA' : 'FOR SALE'), allPhotos.length > 1 && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 12,
      right: 12,
      zIndex: 2,
      background: 'rgba(0,0,0,0.45)',
      borderRadius: 999,
      padding: '3px 10px',
      fontSize: 11,
      fontWeight: 700,
      color: '#fff'
    }
  }, imgIdx + 1, " / ", allPhotos.length), allPhotos.length > 1 && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 10,
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'center',
      gap: 5,
      zIndex: 2
    }
  }, allPhotos.map((_, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    onClick: () => setImgIdx(i),
    style: {
      width: i === imgIdx ? 18 : 6,
      height: 6,
      borderRadius: 3,
      background: i === imgIdx ? '#fff' : 'rgba(255,255,255,0.50)',
      border: 'none',
      cursor: 'pointer',
      padding: 0,
      transition: 'all .18s ease'
    }
  }))), imgIdx > 0 && /*#__PURE__*/React.createElement("button", {
    onClick: () => setImgIdx(i => i - 1),
    style: {
      position: 'absolute',
      left: 10,
      top: '50%',
      transform: 'translateY(-50%)',
      width: 38,
      height: 38,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.92)',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
      zIndex: 2
    }
  }, Icon.chev(22, '#111', 'left')), imgIdx < allPhotos.length - 1 && /*#__PURE__*/React.createElement("button", {
    onClick: () => setImgIdx(i => i + 1),
    style: {
      position: 'absolute',
      right: 10,
      top: '50%',
      transform: 'translateY(-50%)',
      width: 38,
      height: 38,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.92)',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
      zIndex: 2
    }
  }, Icon.chev(22, '#111', 'right')), isAdmin && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      bottom: 14,
      left: 12,
      zIndex: 2,
      fontSize: 9.5,
      fontWeight: 700,
      padding: '3px 9px',
      borderRadius: 6,
      background: 'rgba(239,68,68,0.85)',
      color: '#fff',
      letterSpacing: '0.05em'
    }
  }, "\uD83D\uDEE1 ADMIN")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 18px 0'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '0 0 8px',
      fontFamily: 'var(--pg-font-display)',
      fontSize: 20,
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
      color: 'var(--pg-ink-900)'
    }
  }, /*#__PURE__*/React.createElement(Tx, {
    lang: lang
  }, item.name)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 6,
      marginTop: 4
    }
  }, item.priceMode === 'neg' ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      padding: '4px 13px',
      borderRadius: 999,
      background: 'var(--pg-blue-50)',
      color: 'var(--pg-blue-700)',
      border: '1px solid var(--pg-blue-100)'
    }
  }, "\uD83E\uDD1D ", lang === 'pt' ? 'Negociável' : lang === 'es' ? 'Negociable' : 'Negotiable') : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--pg-font-display)',
      fontSize: 30,
      fontWeight: 700,
      color: 'var(--pg-blue-500)',
      letterSpacing: '-0.02em',
      lineHeight: 1
    }
  }, item.type === 'pool' || item.type === 'route' ? `$${fmtN(item.asking || 0, lang)}` : /*#__PURE__*/React.createElement(React.Fragment, null, item.type === 'route' ? `$${fmtN(item.asking || 0, lang)}` : `$${fmtN(item.price, lang)}`, periodSfx && item.type !== 'route' && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      color: 'var(--pg-ink-400)',
      marginLeft: 2
    }
  }, periodSfx))), item.condition && /*#__PURE__*/React.createElement("span", {
    className: "pg-chip",
    style: {
      marginLeft: 6,
      padding: '2px 9px',
      fontSize: 11,
      background: 'var(--pg-blue-100)',
      color: 'var(--pg-blue-700)',
      borderColor: 'transparent'
    }
  }, item.condition))), locationLabel ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      marginTop: 8,
      fontSize: 13,
      color: 'var(--pg-ink-700)'
    }
  }, Icon.pin(14, 'var(--pg-ink-700)'), " ", locationLabel) : null, !isStatic && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "pg-divider",
    style: {
      margin: '14px 0'
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: handleAuthorClick,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      width: '100%',
      border: 'none',
      background: 'transparent',
      cursor: openPublicProfile ? 'pointer' : 'default',
      textAlign: 'left',
      padding: 0,
      fontFamily: 'inherit'
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: authorDisplay,
    size: 44,
    src: authorPhotoUrl || undefined
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: 'var(--pg-ink-900)'
    }
  }, authorDisplay), authorVerified && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 800,
      padding: '2px 7px',
      borderRadius: 999,
      background: 'rgba(22,163,74,0.12)',
      color: '#16A34A',
      border: '1px solid rgba(22,163,74,0.3)',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 3,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "9",
    height: "9",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#16A34A",
    strokeWidth: "3.5",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "20 6 9 17 4 12"
  })), lang === 'pt' ? 'Verificado' : 'Verified')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      marginTop: 2,
      flexWrap: 'wrap'
    }
  }, authorRating ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Stars, {
    rating: authorRating.avg,
    size: 12
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--pg-ink-700)'
    }
  }, authorRating.avg), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--pg-ink-400)'
    }
  }, "(", authorRating.count, ")")) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      color: 'var(--pg-ink-400)'
    }
  }, lang === 'pt' ? 'Sem avaliações ainda' : lang === 'es' ? 'Sin calificaciones aún' : 'No ratings yet'), timeAgoLabel ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      color: 'var(--pg-ink-400)'
    }
  }, " \xB7 ", timeAgoLabel) : null)), /*#__PURE__*/React.createElement("span", {
    className: "pg-chip pg-chip-aqua",
    style: {
      fontSize: 11,
      flexShrink: 0
    }
  }, "Pool Guy"), openPublicProfile && Icon.chev(14, 'var(--pg-ink-300)')), item.description ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      fontSize: 14,
      lineHeight: 1.55,
      color: 'var(--pg-ink-700)'
    }
  }, item.description) : null, (item.type === 'pool' || item.type === 'route') && (() => {
    const rows = [];
    if (item.type === 'route') {
      if (item.area) rows.push({
        label: lang === 'pt' ? 'Cidades' : lang === 'es' ? 'Ciudades' : 'Cities',
        value: item.area,
        full: true
      });
      if (item.clients) rows.push({
        label: lang === 'pt' ? 'Nº clientes' : lang === 'es' ? 'Nº clientes' : 'Clients',
        value: String(item.clients)
      });
      if (item.revenue) rows.push({
        label: lang === 'pt' ? 'Receita/mês' : lang === 'es' ? 'Ingreso/mes' : 'Revenue/mo',
        value: `$${fmtN(item.revenue, lang)}/mo`
      });
      if (item.cat) {
        const catTr = {
          residential: {
            pt: 'Residencial',
            es: 'Residencial',
            en: 'Residential'
          },
          commercial: {
            pt: 'Comercial',
            es: 'Comercial',
            en: 'Commercial'
          },
          mixed: {
            pt: 'Misto',
            es: 'Mixto',
            en: 'Mixed'
          }
        };
        const catVal = (catTr[item.cat] || {})[lang] || (catTr[item.cat] || {}).en || item.cat;
        rows.push({
          label: lang === 'pt' ? 'Tipo de cliente' : lang === 'es' ? 'Tipo de cliente' : 'Client type',
          value: catVal
        });
      }
    } else {
      if (item.loc) rows.push({
        label: lang === 'pt' ? 'Cidade' : lang === 'es' ? 'Ciudad' : 'City',
        value: item.loc
      });
      if (item.address) rows.push({
        label: lang === 'pt' ? 'Endereço' : lang === 'es' ? 'Dirección' : 'Address',
        value: item.address,
        full: true
      });
      if (item.sizeFt) rows.push({
        label: lang === 'pt' ? 'Tamanho' : lang === 'es' ? 'Tamaño' : 'Size',
        value: item.sizeFt
      });
      if (item.gallons) rows.push({
        label: lang === 'pt' ? 'Capacidade' : lang === 'es' ? 'Capacidad' : 'Capacity',
        value: `${fmtN(item.gallons, lang)} gal`
      });
      if (item.system) rows.push({
        label: lang === 'pt' ? 'Sistema' : lang === 'es' ? 'Sistema' : 'System',
        value: item.system === 'salt' ? lang === 'pt' ? 'Sal' : 'Salt' : lang === 'pt' ? 'Cloro' : 'Chlorine'
      });
      if (item.freq) rows.push({
        label: lang === 'pt' ? 'Visitas/semana' : lang === 'es' ? 'Visitas/semana' : 'Visits/week',
        value: `${item.freq}x`
      });
      if (item.price) rows.push({
        label: lang === 'pt' ? 'Valor/mês' : lang === 'es' ? 'Valor/mes' : 'Monthly rate',
        value: `$${fmtN(item.price, lang)}/mo`
      });
      if (item.warranty) rows.push({
        label: lang === 'pt' ? 'Garantia' : lang === 'es' ? 'Garantía' : 'Warranty',
        value: item.warranty === 'yes' ? item.warrantyMonths ? `${item.warrantyMonths} ${lang === 'pt' ? 'meses' : 'months'}` : lang === 'pt' ? 'Sim' : 'Yes' : lang === 'pt' ? 'Não' : 'No'
      });
    }
    if (rows.length === 0) return null;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 14,
        background: 'var(--pg-ink-50)',
        borderRadius: 14,
        padding: '14px 16px',
        border: '1px solid var(--pg-ink-200)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        fontWeight: 800,
        color: 'var(--pg-ink-400)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginBottom: 10
      }
    }, item.type === 'pool' ? lang === 'pt' ? 'DETALHES DA PISCINA' : 'POOL DETAILS' : lang === 'pt' ? 'DETALHES DA ROTA' : 'ROUTE DETAILS'), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px 12px'
      }
    }, rows.map((r, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: r.full ? {
        gridColumn: '1/-1'
      } : {}
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        fontWeight: 700,
        color: 'var(--pg-ink-400)',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        marginBottom: 2
      }
    }, r.label), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--pg-ink-800)'
      }
    }, r.value)))));
  })(), canDelete && !isStatic && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      padding: '9px 13px',
      borderRadius: 10,
      background: '#FEF2F2',
      border: '1px solid #FCA5A5',
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14
    }
  }, "\uD83D\uDEE1"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: '#DC2626',
      fontWeight: 500
    }
  }, lang === 'pt' ? 'Você está vendo este anúncio como admin. O botão 🗑️ remove definitivamente.' : 'You are viewing this as admin. The 🗑️ button permanently removes it.'))), isRent && !isOwner && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(RequestRentalBlock, null)), isRent && isOwner && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 800,
      color: 'var(--pg-ink-400)',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      marginBottom: 10
    }
  }, lang === 'pt' ? `PEDIDOS DE ALUGUEL (${ownerRequests.length})` : `RENTAL REQUESTS (${ownerRequests.length})`), /*#__PURE__*/React.createElement(OwnerRequestsBlock, null)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginTop: 14
    }
  }, !isOwner && /*#__PURE__*/React.createElement("button", {
    onClick: handleContact,
    className: "pg-btn pg-btn-ghost",
    style: {
      flex: 1,
      fontSize: 14
    }
  }, Icon.msg(16, 'var(--pg-blue-700)'), lang === 'pt' ? 'Mensagem' : lang === 'es' ? 'Mensaje' : 'Message'), !isOwner && !isStatic && /*#__PURE__*/React.createElement("button", {
    onClick: onToggleSave,
    style: {
      width: 52,
      height: 52,
      borderRadius: 14,
      flexShrink: 0,
      cursor: 'pointer',
      border: isSaved ? '1.5px solid #FCA5A5' : '1.5px solid var(--pg-ink-200)',
      background: isSaved ? '#FEF2F2' : 'var(--pg-ink-50)',
      color: isSaved ? '#EF4444' : 'var(--pg-ink-500)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all .15s'
    },
    title: isSaved ? lang === 'pt' ? 'Remover dos salvos' : 'Remove from saved' : lang === 'pt' ? 'Salvar' : 'Save'
  }, /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: isSaved ? 'currentColor' : 'none',
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
  }))), /*#__PURE__*/React.createElement("button", {
    onClick: onShare,
    style: {
      width: 52,
      height: 52,
      borderRadius: 14,
      flexShrink: 0,
      cursor: 'pointer',
      border: '1.5px solid var(--pg-ink-200)',
      background: 'var(--pg-ink-50)',
      color: 'var(--pg-ink-500)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    title: lang === 'pt' ? 'Compartilhar' : lang === 'es' ? 'Compartir' : 'Share'
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "18",
    cy: "5",
    r: "3"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "6",
    cy: "12",
    r: "3"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "18",
    cy: "19",
    r: "3"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "8.59",
    y1: "13.51",
    x2: "15.42",
    y2: "17.49"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "15.41",
    y1: "6.51",
    x2: "8.59",
    y2: "10.49"
  }))), canDelete && !isStatic && /*#__PURE__*/React.createElement("button", {
    onClick: handleAdminDelete,
    disabled: deleting,
    style: {
      width: 52,
      height: 52,
      borderRadius: 14,
      border: '1.5px solid #FCA5A5',
      background: '#FEF2F2',
      color: '#EF4444',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      opacity: deleting ? 0.6 : 1
    },
    title: lang === 'pt' ? 'Excluir anúncio' : 'Delete listing'
  }, deleting ? /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10",
    strokeDasharray: "31.4",
    strokeDashoffset: "10"
  })) : /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "3 6 5 6 21 6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10 11v6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 11v6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
  })))), !isRent && item.author_id && currentUser?.uid && item.author_id === currentUser.uid && item.status !== 'sold' && /*#__PURE__*/React.createElement("button", {
    onClick: () => setMarkSoldOpen(true),
    style: {
      width: '100%',
      marginTop: 10,
      padding: '13px',
      borderRadius: 14,
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'inherit',
      background: 'linear-gradient(135deg,#22C55E,#15803D)',
      color: '#fff',
      fontSize: 14,
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      boxShadow: '0 4px 14px rgba(21,128,61,0.35)',
      transition: 'all .15s'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#fff",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12.99V2h10.99l8.6 8.59a2 2 0 0 1 0 2.82z"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "7",
    y1: "7",
    x2: "7.01",
    y2: "7"
  })), lang === 'pt' ? 'Marcar como vendido' : lang === 'es' ? 'Marcar como vendido' : 'Mark as Sold'), item.status === 'sold' && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      padding: '10px 14px',
      borderRadius: 12,
      background: '#F0FDF4',
      border: '1px solid #86EFAC',
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#16A34A",
    strokeWidth: "2.5",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "20 6 9 17 4 12"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: '#16A34A'
    }
  }, lang === 'pt' ? 'Vendido!' : lang === 'es' ? '¡Vendido!' : 'Sold!'))), item.loc && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 18px 20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "pg-divider",
    style: {
      margin: '18px 0 16px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, Icon.pin(14, 'var(--pg-ink-500)'), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: 'var(--pg-ink-700)'
    }
  }, lang === 'pt' ? 'Localização' : lang === 'es' ? 'Ubicación' : 'Location')), /*#__PURE__*/React.createElement("a", {
    href: `https://www.google.com/maps/search/${encodeURIComponent((item.loc || '') + ', FL')}`,
    target: "_blank",
    rel: "noreferrer",
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--pg-blue-500)',
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, lang === 'pt' ? 'Abrir no Maps' : lang === 'es' ? 'Abrir en Maps' : 'Open in Maps', " \u2197")), mapCoords ? /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 14,
      overflow: 'hidden',
      border: '1px solid var(--pg-ink-200)',
      height: 180,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("iframe", {
    title: "listing-location",
    src: `https://www.openstreetmap.org/export/embed.html?bbox=${mapCoords.lon - 0.05},${mapCoords.lat - 0.04},${mapCoords.lon + 0.05},${mapCoords.lat + 0.04}&layer=mapnik&marker=${mapCoords.lat},${mapCoords.lon}`,
    style: {
      width: '100%',
      height: '100%',
      border: 'none',
      display: 'block'
    },
    loading: "lazy"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 10,
      left: 10,
      background: 'rgba(0,0,0,0.60)',
      backdropFilter: 'blur(6px)',
      borderRadius: 999,
      padding: '4px 10px',
      fontSize: 11,
      fontWeight: 600,
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      gap: 5
    }
  }, Icon.pin(10, '#fff'), " ", item.loc)) : mapLoading ? /*#__PURE__*/React.createElement("div", {
    style: {
      height: 180,
      borderRadius: 14,
      background: 'var(--pg-ink-100)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 13,
      color: 'var(--pg-ink-400)'
    }
  }, "\u23F3 ", lang === 'pt' ? 'Carregando mapa…' : lang === 'es' ? 'Cargando mapa…' : 'Loading map…') : /*#__PURE__*/React.createElement("a", {
    href: `https://www.google.com/maps/search/${encodeURIComponent((item.loc || '') + ', FL')}`,
    target: "_blank",
    rel: "noreferrer",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '14px 16px',
      borderRadius: 12,
      background: 'var(--pg-ink-50)',
      border: '1px solid var(--pg-ink-200)',
      textDecoration: 'none'
    }
  }, Icon.pin(16, 'var(--pg-blue-500)'), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--pg-blue-500)'
    }
  }, item.loc, ", FL"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      fontSize: 11,
      color: 'var(--pg-ink-400)'
    }
  }, "\u2197"))), (() => {
    const others = liveMarket.filter(m => m.author_id && m.author_id === item.author_id && m._id !== item._id && (m.status === 'approved' || m.status === 'active'));
    if (others.length === 0) return null;
    const sellerName = authorDisplay;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        paddingBottom: 36
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "pg-divider",
      style: {
        marginBottom: 16
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '0 18px 12px',
        fontSize: 13,
        fontWeight: 700,
        color: 'var(--pg-ink-900)'
      }
    }, lang === 'pt' ? `Mais de ${sellerName}` : lang === 'es' ? `Más de ${sellerName}` : `More from ${sellerName}`), /*#__PURE__*/React.createElement("div", {
      className: "pg-scroll-x",
      style: {
        padding: '0 18px',
        display: 'flex',
        gap: 12,
        paddingBottom: 4
      }
    }, others.slice(0, 8).map(m => /*#__PURE__*/React.createElement("button", {
      key: m._id,
      onClick: () => onOpenListing && onOpenListing(m),
      className: "pg-press",
      style: {
        flexShrink: 0,
        width: 148,
        padding: 0,
        border: '1px solid var(--pg-ink-200)',
        borderRadius: 14,
        background: 'var(--pg-white)',
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--pg-shadow-1)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: 96,
        background: 'var(--pg-ink-100)',
        overflow: 'hidden',
        flexShrink: 0
      }
    }, m.photoUrls && m.photoUrls[0] || m.photoUrl ? /*#__PURE__*/React.createElement("img", {
      src: m.photoUrls && m.photoUrls[0] || m.photoUrl,
      alt: m.name,
      style: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }
    }) : /*#__PURE__*/React.createElement(NoPhotoPlaceholder, {
      height: 96,
      small: true
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '8px 10px 10px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 700,
        color: 'var(--pg-ink-900)',
        lineHeight: 1.3,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }
    }, m.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: 'var(--pg-blue-500)',
        marginTop: 3
      }
    }, m.priceMode === 'neg' ? lang === 'pt' ? 'Negociável' : lang === 'es' ? 'Negociable' : 'Negotiable' : `$${fmtN(m.price, lang)}`))))));
  })(), viewerOpen && allPhotos.length > 0 && /*#__PURE__*/React.createElement(PhotoViewer, {
    photos: allPhotos,
    startIdx: imgIdx,
    onClose: () => setViewerOpen(false)
  }), /*#__PURE__*/React.createElement(Sheet, {
    open: markSoldOpen,
    onClose: () => setMarkSoldOpen(false),
    height: "auto"
  }, markSoldOpen && /*#__PURE__*/React.createElement(MarkSoldSheet, {
    item: item,
    lang: lang,
    currentUser: currentUser,
    onClose: () => setMarkSoldOpen(false),
    showToast: showToast,
    onSold: sellerRating => {
      setMarkSoldOpen(false);
      onAfterSold && onAfterSold(sellerRating);
    }
  })), RatingOverlay(), DisputeFormSheet(), AfterPhotoSheet(), /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "image/*",
    capture: "environment",
    ref: beforePhotoRef,
    onChange: handleBeforePhotoFile,
    style: {
      display: 'none'
    }
  }), /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "image/*",
    capture: "environment",
    ref: afterPhotoRef,
    onChange: handleAfterPhotoFile,
    style: {
      display: 'none'
    }
  }));
}

// ── My Post Detail / Edit Sheet ───────────────────────────────
function MyPostDetailSheet({
  item,
  lang,
  onClose,
  showToast,
  onUpdated,
  onDeleted,
  openRating,
  currentUser
}) {
  const [editing, setEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [activeRental, setActiveRental] = React.useState(null); // rental_request blocking edit
  const [rentLoaded, setRentLoaded] = React.useState(false);
  const [markSoldOpen, setMarkSoldOpen] = React.useState(false);
  const [boostOpen, setBoostOpen] = React.useState(false);
  const [boostedUntil, setBoostedUntil] = React.useState(item.boostedUntil || null);
  const [form, setForm] = React.useState({
    name: item.name || '',
    description: item.description || '',
    price: item.price || '',
    priceMode: item.priceMode || 'fixed',
    loc: item.loc || '',
    condition: item.condition || '',
    cat: item.cat || '',
    asking: item.asking || ''
  });
  const set = (k, v) => setForm(f => ({
    ...f,
    [k]: v
  }));

  // Check for active rental on mount (only for rent-type listings)
  React.useEffect(() => {
    if (!window.sb || !item._id || item.type !== 'rent') {
      setRentLoaded(true);
      return;
    }
    window.sb.from('rental_requests').select('id, status, requester_name, start_date, end_date').eq('listing_id', item._id).in('status', ['pending', 'approved']).order('created_at', {
      ascending: false
    }).limit(1).then(({
      data
    }) => {
      if (data && data[0]) setActiveRental(data[0]);
      setRentLoaded(true);
    }).catch(() => setRentLoaded(true));
  }, [item._id]);
  const allPhotos = item.photoUrls && item.photoUrls.length > 0 ? item.photoUrls : item.photoUrl ? [item.photoUrl] : [];
  const isPending = item.status === 'pending';
  const isSoldItem = item.status === 'sold';
  const statusColor = isPending ? '#D97706' : isSoldItem ? '#6B7280' : '#16A34A';
  const statusBg = isPending ? '#FEF3C7' : isSoldItem ? '#F3F4F6' : '#DCFCE7';
  const statusLabel = isPending ? lang === 'pt' ? '⏳ Em revisão' : lang === 'es' ? '⏳ En revisión' : '⏳ Under review' : isSoldItem ? lang === 'pt' ? '✓ Vendido' : lang === 'es' ? '✓ Vendido' : '✓ Sold' : lang === 'pt' ? '✓ Ativo' : lang === 'es' ? '✓ Activo' : '✓ Active';
  const _sfxOf = p => p === 'week' ? lang === 'pt' ? '/sem' : '/wk' : p === 'month' ? lang === 'pt' ? '/mês' : '/mo' : lang === 'pt' ? '/dia' : '/day';
  const periodSfx = item.type === 'rent' ? item.rentPrices && typeof item.rentPrices === 'object' ? Object.entries(item.rentPrices).filter(([, v]) => v > 0).map(([k, v]) => `$${fmtN(v, lang)}${_sfxOf(k)}`).join(' · ') : `$${fmtN(item.price, lang)}${_sfxOf(item.rentPeriod || 'day')}` : '';
  const handleSave = async () => {
    if (!window.sb) return;
    setSaving(true);
    // Only name/description/photo changes require a new admin review; price and other fields don't
    const contentChanged = form.name !== (item.name || '') || (form.description || '') !== (item.description || '');
    const patch = {
      name: form.name,
      description: form.description || null,
      price: form.price || null,
      price_mode: form.priceMode,
      loc: form.loc,
      condition: form.condition,
      cat: form.cat,
      asking: form.asking ? parseFloat(form.asking) || null : null
    };
    if (contentChanged && item.status === 'approved') patch.status = 'pending';
    const {
      error
    } = await window.sb.from('marketplace').update(patch).eq('id', item._id);
    setSaving(false);
    if (error) {
      if (showToast) showToast('❌ ' + error.message);
      return;
    }
    if (showToast) showToast(patch.status === 'pending' ? lang === 'pt' ? '✓ Atualizado — enviado para nova revisão' : lang === 'es' ? '✓ Actualizado — enviado a nueva revisión' : '✓ Updated — sent back for review' : lang === 'pt' ? '✓ Anúncio atualizado' : '✓ Listing updated');
    setEditing(false);
    onUpdated && onUpdated({
      ...item,
      ...patch
    });
  };
  const handleDelete = async () => {
    if (!window.sb) return;
    if (activeRental) {
      if (showToast) showToast(lang === 'pt' ? '❌ Não é possível excluir com aluguel ativo' : '❌ Cannot delete while a rental is active');
      return;
    }
    const ok = window.confirm(lang === 'pt' ? 'Deletar este anúncio? Não pode ser desfeito.' : 'Delete this listing? This cannot be undone.');
    if (!ok) return;
    setDeleting(true);
    const {
      error
    } = await window.sb.from('marketplace').delete().eq('id', item._id);
    setDeleting(false);
    if (error) {
      if (showToast) showToast('❌ ' + error.message);
      return;
    }
    if (showToast) showToast(lang === 'pt' ? '🗑️ Anúncio deletado' : '🗑️ Listing deleted');
    onDeleted && onDeleted(item._id);
  };
  const inp = {
    style: {
      width: '100%',
      padding: '11px 13px',
      borderRadius: 10,
      border: '1.5px solid var(--pg-ink-200)',
      background: 'var(--pg-ink-50,#F7F9FB)',
      color: 'var(--pg-ink-900)',
      fontSize: 14,
      outline: 'none',
      fontFamily: 'inherit',
      transition: 'border-color .15s'
    }
  };
  const lbl = text => /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: 'var(--pg-ink-500)',
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      marginBottom: 6
    }
  }, text);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0,
      borderBottom: '0.5px solid var(--pg-ink-200)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: editing ? () => setEditing(false) : onClose,
    style: {
      border: 'none',
      background: 'transparent',
      color: 'var(--pg-blue-500)',
      fontSize: 15,
      fontWeight: 600,
      cursor: 'pointer',
      padding: 0,
      fontFamily: 'inherit'
    }
  }, editing ? lang === 'pt' ? 'Voltar' : lang === 'es' ? 'Volver' : 'Back' : lang === 'pt' ? 'Fechar' : lang === 'es' ? 'Cerrar' : 'Close'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--pg-font-display)',
      fontSize: 16,
      fontWeight: 700,
      letterSpacing: '-0.01em',
      flex: 1,
      textAlign: 'center',
      margin: '0 10px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, editing ? lang === 'pt' ? 'Editar anúncio' : lang === 'es' ? 'Editar anuncio' : 'Edit listing' : item.name || (lang === 'pt' ? 'Seu anúncio' : lang === 'es' ? 'Tu anuncio' : 'Your listing')), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 44,
      flexShrink: 0
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      touchAction: 'pan-y',
      padding: '0 0 36px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement(PhotoCarousel, {
    urls: allPhotos,
    fallbackCat: item.cat || 'Tools',
    height: 220
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 14,
      left: 16,
      zIndex: 2,
      fontSize: 11,
      fontWeight: 700,
      padding: '5px 12px',
      borderRadius: 8,
      background: statusBg,
      color: statusColor,
      letterSpacing: '0.03em'
    }
  }, statusLabel), boostedUntil && new Date(boostedUntil) > new Date() && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      bottom: 14,
      left: 16,
      zIndex: 2,
      fontSize: 11,
      fontWeight: 700,
      padding: '5px 12px',
      borderRadius: 8,
      background: 'rgba(14,186,199,0.92)',
      color: '#fff',
      letterSpacing: '0.03em',
      display: 'flex',
      alignItems: 'center',
      gap: 5
    }
  }, "\uD83D\uDE80 ", lang === 'pt' ? 'Destacado' : lang === 'es' ? 'Destacado' : 'Boosted'), item.cat && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 14,
      right: 16,
      zIndex: 2,
      fontSize: 10,
      fontWeight: 700,
      padding: '4px 10px',
      borderRadius: 8,
      background: 'rgba(0,0,0,0.50)',
      color: '#fff',
      letterSpacing: '0.06em',
      textTransform: 'uppercase'
    }
  }, item.cat)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 20px 0'
    }
  }, !editing ?
  /*#__PURE__*/
  /* ── View mode ── */
  React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '0 0 6px',
      fontFamily: 'var(--pg-font-display)',
      fontSize: 21,
      fontWeight: 800,
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
      color: 'var(--pg-ink-900)'
    }
  }, item.name || '—'), item.loc && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      fontSize: 13,
      color: 'var(--pg-ink-500)'
    }
  }, Icon.pin(12, 'var(--pg-ink-400)'), " ", item.loc)), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right',
      flexShrink: 0
    }
  }, item.type === 'route' ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--pg-font-display)',
      fontSize: 26,
      fontWeight: 800,
      color: 'var(--pg-blue-500)',
      letterSpacing: '-0.03em',
      lineHeight: 1
    }
  }, item.asking ? `$${fmtN(item.asking, lang)}` : '—'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: 'var(--pg-ink-400)',
      marginTop: 2
    }
  }, lang === 'pt' ? 'Pedindo' : lang === 'es' ? 'Pidiendo' : 'Asking')) : item.priceMode === 'neg' ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      padding: '5px 12px',
      borderRadius: 999,
      background: 'var(--pg-blue-50)',
      color: 'var(--pg-blue-700)',
      border: '1px solid var(--pg-blue-100)',
      whiteSpace: 'nowrap'
    }
  }, "\uD83E\uDD1D ", lang === 'pt' ? 'Negociável' : 'Negotiable') : /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--pg-font-display)',
      fontSize: 26,
      fontWeight: 800,
      color: 'var(--pg-blue-500)',
      letterSpacing: '-0.03em',
      lineHeight: 1
    }
  }, item.price ? `$${fmtN(item.price, lang)}` : '—'), periodSfx && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--pg-ink-400)',
      marginTop: 2,
      textAlign: 'right'
    }
  }, periodSfx)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 7,
      flexWrap: 'wrap',
      marginBottom: 14
    }
  }, item.type === 'route' ? /*#__PURE__*/React.createElement(React.Fragment, null, item.clients && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      padding: '4px 11px',
      borderRadius: 999,
      background: 'var(--pg-blue-50)',
      color: 'var(--pg-blue-700)',
      border: '1px solid var(--pg-blue-100)'
    }
  }, "\uD83C\uDFCA ", item.clients, " ", lang === 'pt' ? 'piscinas' : 'pools'), item.revenue && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      padding: '4px 11px',
      borderRadius: 999,
      background: 'rgba(16,185,129,0.08)',
      color: '#065F46',
      border: '1px solid rgba(16,185,129,0.25)'
    }
  }, "\uD83D\uDCB0 $", fmtN(item.revenue, lang), "/mo"), item.area && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      padding: '4px 11px',
      borderRadius: 999,
      background: 'var(--pg-ink-100)',
      color: 'var(--pg-ink-700)'
    }
  }, item.area)) : /*#__PURE__*/React.createElement(React.Fragment, null, item.condition && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      padding: '4px 11px',
      borderRadius: 999,
      background: 'var(--pg-blue-50)',
      color: 'var(--pg-blue-700)',
      border: '1px solid var(--pg-blue-100)'
    }
  }, item.condition), item.type && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      padding: '4px 11px',
      borderRadius: 999,
      background: 'var(--pg-ink-100)',
      color: 'var(--pg-ink-700)'
    }
  }, item.type))), item.description && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14,
      padding: '11px 13px',
      background: 'var(--pg-ink-50)',
      borderRadius: 12,
      border: '1px solid var(--pg-ink-200)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      fontWeight: 700,
      color: 'var(--pg-ink-400)',
      letterSpacing: '0.07em',
      textTransform: 'uppercase',
      marginBottom: 5
    }
  }, lang === 'pt' ? 'DESCRIÇÃO' : 'DESCRIPTION'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: 'var(--pg-ink-700)',
      lineHeight: 1.55
    }
  }, item.description)), isPending && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 14px',
      borderRadius: 12,
      background: '#FFFBEB',
      border: '1px solid #FDE68A',
      marginBottom: 16,
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 20,
      lineHeight: 1,
      flexShrink: 0
    }
  }, "\u23F3"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: '#92400E'
    }
  }, lang === 'pt' ? 'Aguardando aprovação do admin' : lang === 'es' ? 'Esperando aprobación del admin' : 'Awaiting admin approval'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: '#B45309',
      marginTop: 2
    }
  }, lang === 'pt' ? 'Não aparece para outros usuários ainda.' : lang === 'es' ? 'Aún no visible para otros usuarios.' : 'Not visible to other users yet.'))), activeRental && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 12,
      padding: '11px 14px',
      borderRadius: 12,
      background: 'rgba(245,158,11,0.10)',
      border: '1.5px solid rgba(245,158,11,0.35)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 20,
      flexShrink: 0,
      lineHeight: 1.2
    }
  }, "\uD83D\uDD12"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: '#B45309'
    }
  }, lang === 'pt' ? 'Edição bloqueada — aluguel em andamento' : 'Edit locked — active rental in progress'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: '#92400E',
      marginTop: 2,
      lineHeight: 1.5
    }
  }, activeRental.requester_name ? lang === 'pt' ? `${activeRental.requester_name} está usando este equipamento.` : `${activeRental.requester_name} is currently renting this equipment.` : lang === 'pt' ? 'Alguém está usando este equipamento no momento.' : 'This equipment is currently being rented.', ' ', lang === 'pt' ? 'Edições só são permitidas quando o equipamento estiver disponível.' : 'Edits are only allowed when the equipment is available.'))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      if (!activeRental) setEditing(true);
    },
    disabled: !!activeRental || !rentLoaded,
    style: {
      flex: 1,
      height: 50,
      borderRadius: 14,
      border: 'none',
      cursor: activeRental ? 'not-allowed' : 'pointer',
      fontFamily: 'inherit',
      background: activeRental ? 'rgba(0,0,0,0.08)' : 'linear-gradient(135deg,var(--pg-blue-500),var(--pg-blue-700))',
      color: activeRental ? 'var(--pg-ink-400)' : '#fff',
      fontSize: 15,
      fontWeight: 700,
      boxShadow: activeRental ? 'none' : '0 4px 14px rgba(0,119,182,0.35)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      opacity: !rentLoaded ? 0.5 : 1,
      transition: 'all .2s'
    }
  }, activeRental ? /*#__PURE__*/React.createElement("svg", {
    width: "15",
    height: "15",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "11",
    width: "18",
    height: "11",
    rx: "2",
    ry: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 11V7a5 5 0 0 1 10 0v4"
  })) : /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#fff",
    strokeWidth: "2.5",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
  })), activeRental ? lang === 'pt' ? 'Edição bloqueada' : 'Edit locked' : lang === 'pt' ? 'Editar anúncio' : lang === 'es' ? 'Editar anuncio' : 'Edit listing'), /*#__PURE__*/React.createElement("button", {
    onClick: handleDelete,
    disabled: deleting || !!activeRental,
    title: activeRental ? lang === 'pt' ? 'Bloqueado — aluguel ativo' : 'Locked — active rental' : undefined,
    style: {
      width: 50,
      height: 50,
      borderRadius: 14,
      border: '1.5px solid #FCA5A5',
      background: '#FEF2F2',
      color: '#EF4444',
      cursor: activeRental ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      opacity: deleting || activeRental ? 0.5 : 1
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "3 6 5 6 21 6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10 11v6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 11v6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
  })))), item.type !== 'route' && item.status !== 'sold' && /*#__PURE__*/React.createElement("button", {
    onClick: () => setMarkSoldOpen(true),
    style: {
      width: '100%',
      marginTop: 10,
      padding: '13px',
      borderRadius: 14,
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'inherit',
      background: 'linear-gradient(135deg,#22C55E,#15803D)',
      color: '#fff',
      fontSize: 14,
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      boxShadow: '0 4px 14px rgba(21,128,61,0.35)',
      transition: 'all .15s'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#fff",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12.99V2h10.99l8.6 8.59a2 2 0 0 1 0 2.82z"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "7",
    y1: "7",
    x2: "7.01",
    y2: "7"
  })), lang === 'pt' ? 'Marcar como vendido' : lang === 'es' ? 'Marcar como vendido' : 'Mark as Sold'), item.status === 'sold' && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      padding: '10px 14px',
      borderRadius: 12,
      background: '#F0FDF4',
      border: '1px solid #86EFAC',
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#16A34A",
    strokeWidth: "2.5",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "20 6 9 17 4 12"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: '#16A34A'
    }
  }, lang === 'pt' ? 'Vendido!' : lang === 'es' ? '¡Vendido!' : 'Sold!')), item.status !== 'sold' && /*#__PURE__*/React.createElement("button", {
    onClick: () => setBoostOpen(true),
    style: {
      width: '100%',
      marginTop: 10,
      padding: '13px',
      borderRadius: 14,
      border: '1.5px solid rgba(14,186,199,0.4)',
      background: 'rgba(14,186,199,0.08)',
      color: '#0EBAC7',
      cursor: 'pointer',
      fontFamily: 'inherit',
      fontSize: 14,
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      transition: 'all .15s'
    }
  }, "\uD83D\uDE80 ", boostedUntil && new Date(boostedUntil) > new Date() ? lang === 'pt' ? 'Estender destaque' : lang === 'es' ? 'Extender destacado' : 'Extend boost' : lang === 'pt' ? 'Destacar anúncio' : lang === 'es' ? 'Destacar anuncio' : 'Boost listing'), /*#__PURE__*/React.createElement(Sheet, {
    open: markSoldOpen,
    onClose: () => setMarkSoldOpen(false),
    height: "auto"
  }, markSoldOpen && /*#__PURE__*/React.createElement(MarkSoldSheet, {
    item: item,
    lang: lang,
    currentUser: currentUser,
    onClose: () => setMarkSoldOpen(false),
    showToast: showToast,
    onSold: sellerRating => {
      setMarkSoldOpen(false);
      onClose && onClose();
      if (sellerRating && openRating) setTimeout(() => openRating(sellerRating), 220);
    }
  })), /*#__PURE__*/React.createElement(Sheet, {
    open: boostOpen,
    onClose: () => setBoostOpen(false),
    height: "auto"
  }, boostOpen && /*#__PURE__*/React.createElement(BoostListingSheet, {
    item: {
      ...item,
      boostedUntil
    },
    lang: lang,
    onClose: () => setBoostOpen(false),
    showToast: showToast,
    onBoosted: until => setBoostedUntil(until)
  }))) :
  /*#__PURE__*/
  /* ── Edit mode ── */
  React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--pg-ink-400)',
      marginBottom: 16
    }
  }, lang === 'pt' ? 'Alterações salvas instantaneamente' : lang === 'es' ? 'Los cambios se guardan al instante' : 'Changes are saved instantly'), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", null, lbl(lang === 'pt' ? 'Título' : 'Title'), /*#__PURE__*/React.createElement("input", _extends({}, inp, {
    value: form.name,
    onChange: e => set('name', e.target.value)
  }))), /*#__PURE__*/React.createElement("div", null, lbl(lang === 'pt' ? 'Descrição' : 'Description'), /*#__PURE__*/React.createElement("textarea", _extends({}, inp, {
    value: form.description,
    onChange: e => set('description', e.target.value),
    rows: 3,
    placeholder: lang === 'pt' ? 'Descreva o produto, estado de conservação, detalhes importantes…' : 'Describe the product, condition details, important info…',
    style: {
      ...inp.style,
      resize: 'vertical',
      minHeight: 80,
      lineHeight: 1.5
    }
  }))), item.type === 'pool' || item.type === 'route' ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, lbl(lang === 'pt' ? 'Preço de venda ($)' : lang === 'es' ? 'Precio de venta ($)' : 'Sale price ($)'), /*#__PURE__*/React.createElement("input", _extends({}, inp, {
    type: "number",
    value: form.asking,
    onChange: e => set('asking', e.target.value),
    placeholder: "3500"
  }))), /*#__PURE__*/React.createElement("div", null, lbl(lang === 'pt' ? 'Valor/mês ($)' : lang === 'es' ? 'Valor/mes ($)' : 'Monthly rate ($)'), /*#__PURE__*/React.createElement("input", _extends({}, inp, {
    type: "number",
    value: form.price,
    onChange: e => set('price', e.target.value),
    placeholder: "120"
  })))) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, lbl(lang === 'pt' ? 'Preço ($)' : 'Price ($)'), /*#__PURE__*/React.createElement("input", _extends({}, inp, {
    type: "number",
    value: form.price,
    onChange: e => set('price', e.target.value)
  }))), /*#__PURE__*/React.createElement("div", null, lbl(lang === 'pt' ? 'Modo' : 'Mode'), /*#__PURE__*/React.createElement("select", _extends({}, inp, {
    value: form.priceMode,
    onChange: e => set('priceMode', e.target.value)
  }), /*#__PURE__*/React.createElement("option", {
    value: "fixed"
  }, lang === 'pt' ? 'Fixo' : 'Fixed'), /*#__PURE__*/React.createElement("option", {
    value: "neg"
  }, lang === 'pt' ? 'Negociável' : 'Negotiable')))), /*#__PURE__*/React.createElement("div", null, lbl(lang === 'pt' ? 'Localização' : 'Location'), /*#__PURE__*/React.createElement(CityAutocomplete, {
    value: form.loc,
    onChange: v => set('loc', v),
    lang: lang
  })), item.type !== 'pool' && item.type !== 'route' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, lbl(lang === 'pt' ? 'Categoria' : 'Category'), /*#__PURE__*/React.createElement("input", _extends({}, inp, {
    value: form.cat,
    onChange: e => set('cat', e.target.value),
    placeholder: "Pumps, Vacuum\u2026"
  }))), /*#__PURE__*/React.createElement("div", null, lbl(lang === 'pt' ? 'Condição' : 'Condition'), /*#__PURE__*/React.createElement("input", _extends({}, inp, {
    value: form.condition,
    onChange: e => set('condition', e.target.value),
    placeholder: "New, Used\u2026"
  })))), (item.type === 'pool' || item.type === 'route') && /*#__PURE__*/React.createElement("div", null, lbl(lang === 'pt' ? 'Tipo de imóvel' : lang === 'es' ? 'Tipo de propiedad' : 'Property type'), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, [['house', lang === 'pt' ? '🏠 Casa' : '🏠 House'], ['condo', '🏢 Condo']].map(([val, label]) => /*#__PURE__*/React.createElement("button", {
    key: val,
    onClick: () => set('cat', val),
    style: {
      flex: 1,
      padding: '11px',
      borderRadius: 10,
      border: '1.5px solid',
      cursor: 'pointer',
      fontFamily: 'inherit',
      fontSize: 13,
      fontWeight: 600,
      borderColor: form.cat === val ? 'var(--pg-blue-500)' : 'var(--pg-ink-200)',
      background: form.cat === val ? 'var(--pg-blue-50)' : 'transparent',
      color: form.cat === val ? 'var(--pg-blue-700)' : 'var(--pg-ink-600)',
      transition: 'all .15s'
    }
  }, label))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setEditing(false),
    style: {
      flex: 1,
      height: 50,
      borderRadius: 14,
      border: '1.5px solid var(--pg-ink-200)',
      background: 'transparent',
      color: 'var(--pg-ink-700)',
      fontSize: 14,
      fontWeight: 600,
      cursor: 'pointer',
      fontFamily: 'inherit'
    }
  }, lang === 'pt' ? 'Cancelar' : lang === 'es' ? 'Cancelar' : 'Cancel'), /*#__PURE__*/React.createElement("button", {
    onClick: handleSave,
    disabled: saving,
    style: {
      flex: 2,
      height: 50,
      borderRadius: 14,
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'inherit',
      background: 'linear-gradient(135deg,var(--pg-blue-500),var(--pg-blue-700))',
      color: '#fff',
      fontSize: 15,
      fontWeight: 700,
      opacity: saving ? 0.7 : 1,
      boxShadow: '0 4px 14px rgba(0,119,182,0.30)'
    }
  }, saving ? lang === 'pt' ? 'Salvando…' : lang === 'es' ? 'Guardando…' : 'Saving…' : lang === 'pt' ? 'Salvar alterações' : lang === 'es' ? 'Guardar cambios' : 'Save changes'))))));
}
function MarketplaceScreen({
  ctx
}) {
  const {
    lang,
    user = {},
    openChat,
    goTab,
    openPublicProfile,
    liveMarket = [],
    dbWrite,
    showToast,
    hasUnreadChat,
    deepLinkListingId,
    clearDeepLink,
    pendingRatings = [],
    openRating,
    openBuyerRatingPrompt,
    loadPendingRatings,
    darkMode = false,
    openNotifications,
    hasUnreadNotif,
    isDesktop = false
  } = ctx;

  // Normalize a raw Supabase marketplace row to app format
  const normMktItem = r => ({
    _id: r.id,
    _live: true,
    type: r.type,
    name: r.name,
    cat: r.cat,
    condition: r.condition,
    price: r.price,
    priceMode: r.price_mode,
    loc: r.loc,
    asking: r.asking || null,
    area: r.area || null,
    description: r.description || '',
    address: r.address || null,
    system: r.pool_system || null,
    sizeFt: r.size_ft || null,
    gallons: r.gallons || null,
    freq: r.freq_week || null,
    warranty: r.warranty || null,
    warrantyMonths: r.warranty_months || null,
    routeName: r.route_name || null,
    clients: r.clients || null,
    revenue: r.revenue || null,
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

  // Show sold items for 1 day only, then they get auto-deleted from marketplace (archived to history)
  const isSoldVisible = item => item.status === 'sold' && (isMyPost(item) || item.soldAt && Date.now() - new Date(item.soldAt).getTime() < 86400000);

  // Never show raw email as author — if author is an email, show the part before @
  const fmtAuthor = a => {
    if (!a) return 'Unknown';
    if (a === user.email && user.name && !user.name.includes('@')) return user.name;
    if (a.includes('@')) return a.split('@')[0];
    return a;
  };

  // Same logic as dbWrite: resolve what name was stored as author
  const myAuthor = user.name && !user.name.includes('@') ? user.name : user.email ? user.email.split('@')[0] : null;
  const isMyPost = m =>
  // UID match — most reliable, works across sessions
  user.uid && m.author_id && m.author_id === user.uid ||
  // Name/email fallbacks ONLY for legacy posts that have no author_id
  // (prevents false-match when two users share the same display name)
  !m.author_id && myAuthor && m.author === myAuthor || !m.author_id && user.name && m.author === user.name || !m.author_id && user.email && m.author === user.email.split('@')[0];
  const t = STRINGS[lang];
  const [view, setView] = React.useState(() => {
    try {
      const hash = window.location.hash.replace(/^#\/?/, '');
      const [base, seg] = hash.split('/');
      if (base === 'market' && ['buy', 'rent', 'routes', 'sell'].includes(seg)) return seg;
    } catch (e) {}
    return 'buy';
  });
  const [cat, setCat] = React.useState('All');
  const [q, setQ] = React.useState('');
  const [selected, setSelected] = React.useState(null);
  const [myPostDetail, setMyPostDetail] = React.useState(null); // own post detail/edit
  const [viewListing, setViewListing] = React.useState(null); // other user's post — full-screen view
  const historyPushed = React.useRef(false);
  const [postOpen, setPostOpen] = React.useState(false);
  const [postMode, setPostMode] = React.useState(null); // 'sell'|'rent'|'route'
  const [priceRange, setPriceRange] = React.useState('all'); // equipment price filter
  const [priceOpen, setPriceOpen] = React.useState(false); // price dropdown open
  const [userLocation, setUserLocation] = React.useState(() => {
    try {
      const s = localStorage.getItem('pg_loc');
      return s ? JSON.parse(s) : null;
    } catch (e) {
      return null;
    }
  });
  const [radiusMiles, setRadiusMiles] = React.useState(() => {
    try {
      const s = localStorage.getItem('pg_loc_r');
      return s ? Number(s) : 25;
    } catch (e) {
      return 25;
    }
  });
  const [locationFilterOpen, setLocationFilterOpen] = React.useState(false);
  React.useEffect(() => {
    try {
      if (userLocation) localStorage.setItem('pg_loc', JSON.stringify(userLocation));else localStorage.removeItem('pg_loc');
      window.dispatchEvent(new CustomEvent('pg_loc_updated', {
        detail: userLocation
      }));
    } catch (e) {}
  }, [userLocation]);
  React.useEffect(() => {
    try {
      localStorage.setItem('pg_loc_r', String(radiusMiles));
    } catch (e) {}
  }, [radiusMiles]);
  const [routePrice, setRoutePrice] = React.useState('all'); // routes price filter
  const [routeSub, setRouteSub] = React.useState('routes'); // 'routes' | 'pools'
  const [poolPrice, setPoolPrice] = React.useState('all'); // individual pools price filter
  const [savedIds, setSavedIds] = React.useState(new Set());
  const [shareItem, setShareItem] = React.useState(null);

  // Sync view to URL hash
  React.useEffect(() => {
    try {
      const base = window.location.hash.replace(/^#\/?/, '').split('/')[0];
      if (base === 'market') window.history.replaceState(null, '', '#market/' + view);
    } catch (e) {}
  }, [view]);

  // Browser back/forward: update view when hash changes
  React.useEffect(() => {
    const onHash = () => {
      try {
        const hash = window.location.hash.replace(/^#\/?/, '');
        const [base, seg] = hash.split('/');
        if (base === 'market' && ['buy', 'rent', 'routes', 'sell'].includes(seg)) setView(seg);
      } catch (e) {}
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // ── Listing open / close with URL state ──────────────────────
  const openListing = React.useCallback(item => {
    setViewListing(item);
    // Only push URL for live Supabase items (have real UUID _id)
    if (item._live) {
      window.history.pushState({
        pgListing: item._id
      }, '', '?listing=' + item._id);
      historyPushed.current = true;
    }
  }, []);

  // Normalize a static EQUIPMENT array item → ViewListingSheet format
  const normStatic = React.useCallback(e => ({
    _id: 'static-' + e.id,
    _live: false,
    type: e.mode || 'sell',
    name: e.name || '',
    cat: e.category || '',
    condition: typeof e.condition === 'object' ? e.condition[lang] || e.condition.en || '' : e.condition || '',
    price: String(e.price || ''),
    priceMode: 'fixed',
    loc: e.loc || '',
    description: '',
    author: null,
    author_id: null,
    photoUrl: null,
    photoUrls: [],
    rentPeriod: e.unit ? e.unit.en === '/week' ? 'week' : e.unit.en === '/month' ? 'month' : 'day' : null,
    status: 'approved',
    createdAt: null,
    soldAt: null
  }), [lang]);
  const closeListing = React.useCallback(() => {
    setViewListing(null);
    if (historyPushed.current) {
      historyPushed.current = false;
      window.history.replaceState({}, '', '/');
    }
  }, []);

  // Browser back button → close listing
  React.useEffect(() => {
    const handler = () => {
      if (historyPushed.current) {
        setViewListing(null);
        historyPushed.current = false;
      }
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  // Deep link — fetch listing from Supabase when ?listing=ID is in the URL
  React.useEffect(() => {
    if (!deepLinkListingId || !window.sb) return;
    window.sb.from('marketplace').select('*').eq('id', deepLinkListingId).single().then(({
      data
    }) => {
      if (!data) return;
      const normalized = normMktItem(data);
      if (isMyPost(normalized)) {
        setMyPostDetail(normalized);
      } else {
        setViewListing(normalized);
        historyPushed.current = true;
      }
    }).catch(() => {}).finally(() => {
      if (clearDeepLink) clearDeepLink();
    });
  }, [deepLinkListingId]); // eslint-disable-line

  // Load saved listing IDs for current user
  React.useEffect(() => {
    if (!user?.uid || !window.sb) return;
    window.sb.from('saved_listings').select('listing_id').eq('user_id', user.uid).then(({
      data
    }) => {
      if (data) setSavedIds(new Set(data.map(r => r.listing_id)));
    });
  }, [user?.uid]);
  const toggleSave = async (e, listingId) => {
    if (e) e.stopPropagation();
    if (!user?.uid) {
      showToast && showToast(lang === 'pt' ? 'Faça login para salvar' : lang === 'es' ? 'Inicia sesión para guardar' : 'Login to save');
      return;
    }
    const isSaved = savedIds.has(listingId);
    // Optimistic update
    setSavedIds(prev => {
      const s = new Set(prev);
      isSaved ? s.delete(listingId) : s.add(listingId);
      return s;
    });
    if (isSaved) {
      await window.sb.from('saved_listings').delete().eq('user_id', user.uid).eq('listing_id', listingId);
      showToast && showToast(lang === 'pt' ? '💔 Removido dos salvos' : lang === 'es' ? '💔 Eliminado de guardados' : '💔 Removed from saved');
    } else {
      await window.sb.from('saved_listings').insert({
        user_id: user.uid,
        listing_id: listingId
      });
      showToast && showToast(lang === 'pt' ? '❤️ Salvo!' : lang === 'es' ? '❤️ Guardado!' : '❤️ Saved!');
    }
  };
  const handleShare = async (e, item) => {
    if (e) e.stopPropagation();
    const listingUrl = item._id ? `https://poolguyx.com/?listing=${item._id}` : 'https://poolguyx.com';
    const txt = `${item.name}${item.priceMode === 'neg' ? ' — Negotiable' : item.price ? ` — $${item.price}` : ''}  📍 ${item.loc || 'Broward County, FL'}\n\nFind it on PoolGuyX 👉 ${listingUrl}`;
    if (navigator.share) {
      // Try to share with photo
      const photoUrl = item.photoUrls && item.photoUrls[0] || item.photoUrl || null;
      if (photoUrl) {
        try {
          const resp = await fetch(photoUrl);
          const blob = await resp.blob();
          const file = new File([blob], 'listing.jpg', {
            type: blob.type || 'image/jpeg'
          });
          if (navigator.canShare && navigator.canShare({
            files: [file]
          })) {
            await navigator.share({
              title: item.name,
              text: txt,
              files: [file]
            });
            return;
          }
        } catch (err) {/* fall through to text-only */}
      }
      navigator.share({
        title: item.name,
        text: txt,
        url: listingUrl
      }).catch(() => {});
    } else {
      setShareItem(item);
    }
  };
  const catLabels = {
    All: {
      en: 'All',
      pt: 'Todos',
      es: 'Todos'
    },
    Pumps: {
      en: 'Pumps',
      pt: 'Bombas',
      es: 'Bombas'
    },
    Vacuum: {
      en: 'Vacuum',
      pt: 'Aspiradores',
      es: 'Aspiradores'
    },
    Heaters: {
      en: 'Heaters',
      pt: 'Aquecedores',
      es: 'Calentadores'
    },
    Pole: {
      en: 'Pole',
      pt: 'Pole',
      es: 'Pole'
    },
    Car: {
      en: 'Cart',
      pt: 'Carrinho',
      es: 'Carrito'
    },
    Truck: {
      en: 'Truck',
      pt: 'Truck',
      es: 'Truck'
    },
    Jug: {
      en: 'Jug',
      pt: 'Jug',
      es: 'Jug'
    },
    Net: {
      en: 'Net',
      pt: 'Net',
      es: 'Net'
    },
    Chemicals: {
      en: 'Chemicals',
      pt: 'Químicos',
      es: 'Químicos'
    },
    Filters: {
      en: 'Filters',
      pt: 'Filtros',
      es: 'Filtros'
    },
    Others: {
      en: 'Others',
      pt: 'Outros',
      es: 'Otros'
    }
  };
  const cats = Object.keys(catLabels);
  const isEquipment = view === 'buy' || view === 'rent';
  const mode = view === 'rent' ? 'rent' : 'sell';

  // City label for location button — uses stored city, falls back to haversine lookup
  const locCity = React.useMemo(() => {
    if (!userLocation) return '';
    if (userLocation.city) return userLocation.city;
    const lat = userLocation.lat,
      lng = userLocation.lng;
    if (lat == null || lng == null) return '';
    const coords = window.FL_CITY_COORDS || {};
    let best = '',
      bestDist = Infinity;
    for (const [name, [clat, clng]] of Object.entries(coords)) {
      const dLat = (clat - lat) * Math.PI / 180;
      const dLng = (clng - lng) * Math.PI / 180;
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat * Math.PI / 180) * Math.cos(clat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
      const d = 3958.8 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      if (d < bestDist) {
        bestDist = d;
        best = name;
      }
    }
    return best;
  }, [userLocation]);

  // Radius filter — haversine distance from user location
  const marketByCounty = React.useMemo(() => {
    if (!userLocation) return liveMarket;
    const coords = window.FL_CITY_COORDS || {};
    return liveMarket.filter(m => {
      const city = (m.loc || m.area || '').trim();
      if (!city) return true;
      const c = coords[city];
      if (!c) return true; // city not in dict → show
      return window.haversine(userLocation.lat, userLocation.lng, c[0], c[1]) <= radiusMiles;
    });
  }, [liveMarket, userLocation, radiusMiles]);

  // Rotas reais do banco (type='route', aprovadas ou próprias pendentes)
  const liveRoutes = marketByCounty.filter(m => m.type === 'route' && (m.status === 'approved' || m.status === 'pending' && isMyPost(m))).map(m => ({
    id: m._id,
    _live: true,
    _liveId: m._id,
    _author: m.author,
    _authorId: m.author_id,
    name: m.name || m.routeName || '',
    clients: m.clients ? String(m.clients) : '?',
    area: m.area || m.loc || '',
    revenue: m.revenue ? `$${fmtN(m.revenue, lang)}/mo` : '',
    est: Number(m.asking) || 0,
    photoUrl: m.photoUrl || null,
    photoUrls: m.photoUrls || [],
    status: m.status
  }));
  const allRoutes = [...liveRoutes];

  // Piscinas avulsas reais do banco (type='pool', aprovadas ou próprias pendentes)
  const livePools = marketByCounty.filter(m => m.type === 'pool' && (m.status === 'approved' || m.status === 'pending' && isMyPost(m))).map(m => ({
    id: m._id,
    _live: true,
    _liveId: m._id,
    _type: 'pool',
    _author: m.author,
    _authorId: m.author_id,
    pools: 1,
    area: m.area || m.loc || '',
    name: m.name || m.description || '',
    desc: m.description || '',
    poolKind: m.cat || 'house',
    revenue: m.price ? `$${fmtN(m.price, lang)}/mo` : '',
    est: Number(m.asking || m.price) || 0,
    photoUrl: m.photoUrl || null,
    photoUrls: m.photoUrls || [],
    status: m.status,
    // pool-specific detail fields (if columns exist in DB)
    system: m.system || null,
    sizeFt: m.sizeFt || null,
    gallons: m.gallons || null,
    freq: m.freq || null,
    warranty: m.warranty || null,
    warrantyMonths: m.warrantyMonths || null,
    address: m.address || null
  }));
  const allPools = [...livePools];
  const list = isEquipment ? EQUIPMENT.filter(e => e.mode === mode && (cat === 'All' || e.category === cat) && (q === '' || e.name.toLowerCase().includes(q.toLowerCase())) && (priceRange === 'all' || priceRange === 'u100' && e.price < 100 || priceRange === '100-500' && e.price >= 100 && e.price <= 500 || priceRange === 'o500' && e.price > 500)) : view === 'routes' && routeSub === 'pools' ? allPools.filter(p => poolPrice === 'all' || poolPrice === 'u1500' && p.est < 1500 || poolPrice === '1500-3k' && p.est >= 1500 && p.est <= 3000 || poolPrice === 'o3k' && p.est > 3000) : allRoutes.filter(r => routePrice === 'all' || routePrice === 'u5k' && r.est < 5000 || routePrice === '5k-8k' && r.est >= 5000 && r.est <= 8000 || routePrice === 'o8k' && r.est > 8000);
  // Own postings always float to the top of whichever list is being shown
  list.sort((a, b) => {
    const aOwn = user?.uid && a._authorId === user.uid ? 0 : 1;
    const bOwn = user?.uid && b._authorId === user.uid ? 0 : 1;
    return aOwn - bOwn;
  });
  const tabIcons = {
    buy: (s, c) => Icon.cart(s, c),
    rent: (s, c) => Icon.key(s, c),
    routes: (s, c) => Icon.pin(s, c)
  };
  const tabLabels = {
    buy: lang === 'pt' ? 'Comprar' : lang === 'es' ? 'Comprar' : 'Buy',
    rent: lang === 'pt' ? 'Alugar' : lang === 'es' ? 'Rentar' : 'Rent',
    routes: lang === 'pt' ? 'Rotas' : lang === 'es' ? 'Rutas' : 'Routes'
  };
  const tabSubs = {
    buy: lang === 'pt' ? 'Equipamentos à venda' : lang === 'es' ? 'Equipo en venta' : 'Equipment for sale',
    rent: lang === 'pt' ? 'Para alugar' : lang === 'es' ? 'Para rentar' : 'For rent',
    routes: lang === 'pt' ? 'Rotas · Piscinas avulsas' : lang === 'es' ? 'Rutas · Piscinas sueltas' : 'Routes · Single pools'
  };
  const sellForView = {
    buy: 'sell',
    rent: 'rent',
    routes: 'route'
  };
  const totalItems = marketByCounty.filter(m => (m.type === 'sell' || m.type === 'rent') && (m.status === 'approved' || m.status === 'pending' && isMyPost(m))).length + EQUIPMENT.length;
  const totalRoutes = allRoutes.length;
  const locationLbl = lang === 'pt' ? 'Sul da Flórida' : lang === 'es' ? 'Sur de Florida' : 'South Florida';

  // Desktop detection
  React.useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 900);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Sync app-level FAB trigger → local picker open
  React.useEffect(() => {
    if (ctx.marketPostOpen) {
      setPostOpen(true);
      setPostMode(null);
      ctx.closeMarketPost();
    }
  }, [ctx.marketPostOpen]);

  // ── Shared card renderer (used by both mobile + desktop) ──────
  const renderLiveCard = (item, desktopMode = false) => {
    const isPending = item.status === 'pending';
    const isSoldItem = item.status === 'sold';
    const canDel = user.role === 'admin' || isMyPost(item);
    const handleQuickDelete = async e => {
      e.stopPropagation();
      if (!window.confirm(lang === 'pt' ? `Excluir "${item.name}"?` : `Delete "${item.name}"?`)) return;
      const {
        error
      } = await window.sb.from('marketplace').delete().eq('id', item._id);
      if (error) {
        showToast && showToast('❌ ' + error.message);
        return;
      }
      showToast && showToast('🗑️ ' + (lang === 'pt' ? 'Anúncio excluído' : 'Listing deleted'));
      if (ctx && ctx.removeMarketItem) ctx.removeMarketItem(item._id);
    };
    const photoSrc = item.photoUrls && item.photoUrls[0] || item.photoUrl || null;
    return /*#__PURE__*/React.createElement("button", {
      key: item._id,
      onClick: () => isMyPost(item) ? setMyPostDetail(item) : openListing(item),
      className: isSoldItem ? '' : 'pg-press',
      style: {
        padding: 0,
        overflow: 'hidden',
        position: 'relative',
        cursor: isSoldItem ? isMyPost(item) ? 'pointer' : 'default' : 'pointer',
        border: desktopMode && darkMode ? `1.5px solid ${isSoldItem ? '#30363D' : '#21262D'}` : isPending ? '1.5px solid var(--pg-ink-200)' : isSoldItem ? '1.5px solid var(--pg-ink-200)' : '1.5px solid var(--pg-blue-100)',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 16,
        background: desktopMode && darkMode ? isSoldItem ? '#161B22' : '#1C2128' : isSoldItem ? 'var(--pg-ink-50)' : 'var(--pg-white)',
        textAlign: 'left',
        fontFamily: 'inherit',
        boxShadow: desktopMode ? darkMode ? '0 2px 16px rgba(0,0,0,0.45), 0 0 0 0 transparent' : '0 2px 12px rgba(0,0,0,0.08), 0 0 0 0 transparent' : '0 1px 3px rgba(0,0,0,0.08)',
        transition: 'box-shadow .18s, transform .12s'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        opacity: isPending ? 0.82 : isSoldItem ? 0.70 : 1,
        filter: isSoldItem ? 'grayscale(0.65)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        paddingTop: desktopMode ? '62%' : '72%',
        background: 'var(--pg-ink-200)',
        overflow: 'hidden',
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0
      }
    }, photoSrc ? /*#__PURE__*/React.createElement("img", {
      src: photoSrc,
      alt: item.name,
      style: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }
    }) : /*#__PURE__*/React.createElement(NoPhotoPlaceholder, {
      height: '100%'
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.28) 0%, transparent 45%, transparent 60%, rgba(0,0,0,0.10) 100%)',
        pointerEvents: 'none'
      }
    }), isMyPost(item) && /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        top: 10,
        left: 10,
        fontSize: 9.5,
        fontWeight: 700,
        padding: '3px 8px',
        borderRadius: 6,
        letterSpacing: '0.05em',
        background: isPending ? 'rgba(255,243,205,0.95)' : 'rgba(14,186,199,0.92)',
        color: isPending ? '#856404' : '#fff',
        backdropFilter: 'blur(4px)'
      }
    }, isPending ? `⏳ ${lang === 'pt' ? 'REVISÃO' : 'REVIEW'}` : `✦ ${lang === 'pt' ? 'MEU ANÚNCIO' : 'MY LISTING'}`), isSoldItem && /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        top: 10,
        left: 10,
        fontSize: 9.5,
        fontWeight: 800,
        padding: '3px 10px',
        borderRadius: 6,
        background: 'rgba(100,100,100,0.90)',
        color: '#fff',
        backdropFilter: 'blur(4px)',
        letterSpacing: '0.08em'
      }
    }, "SOLD"), /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        top: 10,
        right: 10,
        fontSize: 9,
        fontWeight: 700,
        padding: '3px 8px',
        borderRadius: 6,
        background: 'rgba(0,0,0,0.52)',
        color: '#fff',
        letterSpacing: '0.06em',
        backdropFilter: 'blur(4px)',
        textTransform: 'uppercase'
      }
    }, item.cat || 'Tools')), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: desktopMode ? '14px 16px 16px' : '12px 13px 14px',
        display: 'flex',
        flexDirection: 'column',
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: desktopMode ? 15 : 14,
        fontWeight: 700,
        letterSpacing: '-0.01em',
        lineHeight: 1.3,
        color: 'var(--pg-ink-900)',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement(Tx, {
      lang: lang
    }, item.name)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: 'var(--pg-ink-500)',
        marginTop: 5,
        lineHeight: 1.4,
        flex: 1,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement(Tx, {
      lang: lang
    }, item.description || [item.condition, item.loc].filter(Boolean).join(' · ') || '—')), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 1,
        background: 'var(--pg-ink-100)',
        margin: '10px 0'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 4
      }
    }, item.priceMode === 'neg' ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 700,
        padding: '4px 10px',
        borderRadius: 999,
        background: isPending ? 'var(--pg-ink-100)' : 'var(--pg-blue-50)',
        color: isPending ? 'var(--pg-ink-400)' : 'var(--pg-blue-600)',
        border: `1px solid ${isPending ? 'var(--pg-ink-200)' : 'var(--pg-blue-100)'}`,
        flexShrink: 0
      }
    }, "\uD83E\uDD1D ", lang === 'pt' ? 'Negociável' : 'Negotiable') : /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--pg-font-display)',
        fontSize: desktopMode ? 24 : 22,
        fontWeight: 800,
        color: isPending ? 'var(--pg-ink-400)' : isSoldItem ? 'var(--pg-ink-400)' : 'var(--pg-blue-500)',
        letterSpacing: '-0.02em',
        lineHeight: 1,
        flexShrink: 0,
        textDecoration: isSoldItem ? 'line-through' : 'none'
      }
    }, "$", fmtN(item.price, lang)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: 'linear-gradient(135deg,var(--pg-blue-500),var(--pg-blue-700))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: 8,
        fontWeight: 700,
        flexShrink: 0
      }
    }, (fmtAuthor(item.author)[0] || '?').toUpperCase()), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 600,
        color: 'var(--pg-ink-500)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        minWidth: 0
      }
    }, fmtAuthor(item.author)), item.createdAt && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        color: 'var(--pg-ink-400)',
        flexShrink: 0
      }
    }, "\xB7 ", timeAgo(item.createdAt, lang)))), !isMyPost(item) && !isPending && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6,
        marginTop: 8
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: e => toggleSave(e, item._id),
      style: {
        flex: 1,
        height: 28,
        borderRadius: 8,
        cursor: 'pointer',
        fontFamily: 'inherit',
        border: savedIds.has(item._id) ? '1px solid #FCA5A5' : '1px solid var(--pg-ink-200)',
        background: savedIds.has(item._id) ? '#FEF2F2' : 'var(--pg-ink-50)',
        color: savedIds.has(item._id) ? '#EF4444' : 'var(--pg-ink-400)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        fontSize: 11,
        fontWeight: 600
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "11",
      height: "11",
      viewBox: "0 0 24 24",
      fill: savedIds.has(item._id) ? 'currentColor' : 'none',
      stroke: "currentColor",
      strokeWidth: "2.5",
      strokeLinecap: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
    })), savedIds.has(item._id) ? lang === 'pt' ? 'Salvo' : 'Saved' : lang === 'pt' ? 'Salvar' : 'Save'), /*#__PURE__*/React.createElement("button", {
      onClick: e => handleShare(e, item),
      style: {
        width: 28,
        height: 28,
        borderRadius: 8,
        border: '1px solid var(--pg-ink-200)',
        background: 'var(--pg-ink-50)',
        color: 'var(--pg-ink-400)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "12",
      height: "12",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.5",
      strokeLinecap: "round"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "18",
      cy: "5",
      r: "3"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "6",
      cy: "12",
      r: "3"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "18",
      cy: "19",
      r: "3"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "8.59",
      y1: "13.51",
      x2: "15.42",
      y2: "17.49"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "15.41",
      y1: "6.51",
      x2: "8.59",
      y2: "10.49"
    })))), isPending && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 8,
        fontSize: 10.5,
        color: '#92710A',
        background: '#FFF8E1',
        border: '0.5px solid #FFE082',
        borderRadius: 6,
        padding: '4px 8px',
        textAlign: 'center'
      }
    }, "\u23F3 ", lang === 'pt' ? 'Em revisão' : 'Under review'))), canDel && /*#__PURE__*/React.createElement("div", {
      onClick: handleQuickDelete,
      style: {
        margin: '0 13px 14px',
        padding: '6px 0',
        borderRadius: 8,
        background: '#FEF2F2',
        border: '1px solid #FCA5A5',
        color: '#EF4444',
        fontSize: 11,
        fontWeight: 700,
        textAlign: 'center',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "11",
      height: "11",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.5",
      strokeLinecap: "round"
    }, /*#__PURE__*/React.createElement("polyline", {
      points: "3 6 5 6 21 6"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M10 11v6"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M14 11v6"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
    })), lang === 'pt' ? 'Excluir' : 'Delete'));
  };

  // ══════════════════════════════════════════════════════════════
  // ── DESKTOP LAYOUT (≥ 900px) ─────────────────────────────────
  // ══════════════════════════════════════════════════════════════
  if (isDesktop) {
    const liveEquipment = marketByCounty.filter(m => m.type === mode && (cat === 'All' || !m.cat || m.cat === cat) && (m.status === 'approved' || m.status === 'pending' && isMyPost(m))).sort((a, b) => {
      const aOwn = user?.uid && a.author_id === user.uid ? 0 : 1;
      const bOwn = user?.uid && b.author_id === user.uid ? 0 : 1;
      return aOwn - bOwn;
    });
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: '100%',
        overflowY: 'auto',
        background: 'var(--pg-bg)'
      }
    }, function () {
      const _tx = darkMode ? '#fff' : '#0A2840';
      const _sub = darkMode ? 'rgba(255,255,255,0.50)' : 'rgba(10,40,64,0.50)';
      const _sub2 = darkMode ? 'rgba(255,255,255,0.55)' : 'rgba(10,40,64,0.55)';
      const _ib = darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(10,40,64,0.08)';
      const _ibr = darkMode ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(10,40,64,0.12)';
      const _locBg = darkMode ? 'rgba(0,119,182,0.22)' : 'rgba(0,119,182,0.12)';
      const _locBr = darkMode ? '1px solid rgba(0,119,182,0.40)' : '1px solid rgba(0,119,182,0.25)';
      const _locTx = darkMode ? 'rgba(255,255,255,0.80)' : '#0A2840';
      const _bg = darkMode ? 'linear-gradient(135deg, #011B5A 0%, #0A2E6A 30%, #0077B6 70%, #023E8A 100%)' : 'linear-gradient(135deg, #e8f5ff 0%, #cfe9f8 40%, #b8dff5 100%)';
      return /*#__PURE__*/React.createElement("div", {
        style: {
          background: _bg,
          padding: '28px 40px 56px',
          position: 'relative',
          overflow: 'visible'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'absolute',
          top: -60,
          right: -60,
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(10,40,64,0.03)',
          pointerEvents: 'none'
        }
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'absolute',
          bottom: -40,
          left: 200,
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(10,40,64,0.02)',
          pointerEvents: 'none'
        }
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 0
        }
      }, /*#__PURE__*/React.createElement("img", {
        src: "icone-watermark.png",
        alt: "",
        style: {
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%,-50%)',
          height: 245,
          objectFit: 'contain',
          opacity: 0.60,
          userSelect: 'none'
        }
      })), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 20
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexShrink: 0
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: 42,
          height: 42,
          borderRadius: 13,
          flexShrink: 0,
          background: _ib,
          border: _ibr,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }
      }, Icon.cart(20, _tx)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 9.5,
          fontWeight: 700,
          color: _sub,
          letterSpacing: '0.13em',
          textTransform: 'uppercase',
          marginBottom: 2
        }
      }, lang === 'pt' ? 'MARKETPLACE · SUL DA FLÓRIDA' : 'MARKETPLACE · SOUTH FLORIDA'), /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: 'var(--pg-font-display)',
          fontSize: 20,
          fontWeight: 800,
          color: _tx,
          letterSpacing: '-0.025em',
          lineHeight: 1
        }
      }, lang === 'pt' ? 'Sul da Flórida' : 'South Florida'))), /*#__PURE__*/React.createElement("div", {
        style: {
          width: 1,
          height: 32,
          background: darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(10,40,64,0.10)',
          flexShrink: 0
        }
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flex: 1
        }
      }, [{
        icon: Icon.cart(13, _sub2),
        value: totalItems,
        label: lang === 'pt' ? 'itens' : 'items'
      }, {
        icon: Icon.pin(13, _sub2),
        value: totalRoutes,
        label: lang === 'pt' ? 'rotas' : 'routes'
      }].map((s, i) => /*#__PURE__*/React.createElement("div", {
        key: i,
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }
      }, i > 0 && /*#__PURE__*/React.createElement("div", {
        style: {
          width: 1,
          height: 18,
          background: darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(10,40,64,0.10)',
          marginRight: 10
        }
      }), s.icon, /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--pg-font-display)',
          fontSize: 15,
          fontWeight: 800,
          color: _tx,
          letterSpacing: '-0.02em'
        }
      }, s.value), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11,
          color: _sub,
          fontWeight: 500
        }
      }, s.label)))), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexShrink: 0
        }
      }, /*#__PURE__*/React.createElement("button", {
        onClick: () => setLocationFilterOpen(true),
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: userLocation ? 'var(--pg-aqua-100)' : 'rgba(0,178,169,0.10)',
          border: '1.5px solid var(--pg-aqua-400)',
          borderRadius: 999,
          padding: userLocation ? '7px 14px' : '7px 12px',
          boxShadow: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
          color: 'inherit',
          touchAction: 'manipulation'
        }
      }, /*#__PURE__*/React.createElement("svg", {
        width: "19",
        height: "19",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: userLocation ? 'var(--pg-aqua-600)' : 'var(--pg-aqua-500)',
        strokeWidth: "2.2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("path", {
        d: "M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z",
        fill: userLocation ? 'var(--pg-aqua-400)' : 'none'
      }), /*#__PURE__*/React.createElement("circle", {
        cx: "12",
        cy: "9",
        r: "2.5",
        fill: userLocation ? 'white' : 'none'
      })), userLocation && /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--pg-aqua-700)',
          whiteSpace: 'nowrap'
        }
      }, locCity ? `${locCity} · ` : '', radiusMiles, " mi")), /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'relative'
        }
      }, /*#__PURE__*/React.createElement("button", {
        onClick: () => openChat && openChat(),
        style: {
          width: 38,
          height: 38,
          borderRadius: 11,
          background: _ib,
          border: _ibr,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all .15s'
        }
      }, Icon.msg(18, _tx)), hasUnreadChat && /*#__PURE__*/React.createElement("span", {
        style: {
          position: 'absolute',
          top: 7,
          right: 7,
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: '#FF3B30',
          border: `2px solid ${darkMode ? '#011B5A' : '#c5e4f5'}`
        }
      })), /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'relative'
        }
      }, /*#__PURE__*/React.createElement("button", {
        onClick: () => openNotifications && openNotifications(),
        style: {
          width: 38,
          height: 38,
          borderRadius: 11,
          background: _ib,
          border: _ibr,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all .15s'
        }
      }, Icon.bell(18, _tx)), hasUnreadNotif && /*#__PURE__*/React.createElement("span", {
        style: {
          position: 'absolute',
          top: 7,
          right: 7,
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: '#FF3B30',
          border: `2px solid ${darkMode ? '#011B5A' : '#c5e4f5'}`
        }
      })), /*#__PURE__*/React.createElement("button", {
        onClick: () => {
          setPostOpen(true);
          setPostMode(null);
        },
        style: {
          height: 38,
          padding: '0 16px',
          borderRadius: 11,
          background: darkMode ? 'rgba(255,255,255,0.95)' : '#0077B6',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'var(--pg-font-display)',
          fontSize: 13,
          fontWeight: 700,
          color: darkMode ? '#023E8A' : '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          boxShadow: '0 3px 12px rgba(0,0,0,0.18)',
          transition: 'all .15s'
        }
      }, /*#__PURE__*/React.createElement("svg", {
        width: "14",
        height: "14",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2.5",
        strokeLinecap: "round"
      }, /*#__PURE__*/React.createElement("line", {
        x1: "12",
        y1: "5",
        x2: "12",
        y2: "19"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "5",
        y1: "12",
        x2: "19",
        y2: "12"
      })), lang === 'pt' ? 'Publicar' : lang === 'es' ? 'Publicar' : 'Post'))), (() => {
        const _tabBg = darkMode ? 'rgba(4,13,24,0.82)' : 'rgba(255,255,255,0.92)';
        const _tabBdr = darkMode ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(10,40,64,0.10)';
        const _activeBg = darkMode ? 'linear-gradient(135deg,#0077B6,#023E8A)' : 'linear-gradient(135deg,#0077B6,#005A8E)';
        const _inactTx = darkMode ? 'rgba(255,255,255,0.50)' : 'rgba(10,40,64,0.48)';
        return /*#__PURE__*/React.createElement("div", {
          style: {
            position: 'absolute',
            bottom: -26,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            zIndex: 20
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3,
            background: _tabBg,
            backdropFilter: 'blur(20px)',
            border: _tabBdr,
            borderRadius: 20,
            padding: 5,
            boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.30)' : '0 8px 32px rgba(0,80,160,0.14), 0 2px 8px rgba(0,0,0,0.08)'
          }
        }, [{
          id: 'buy',
          icon: Icon.cart,
          label: lang === 'pt' ? 'Comprar' : lang === 'es' ? 'Comprar' : 'Buy'
        }, {
          id: 'rent',
          icon: Icon.key,
          label: lang === 'pt' ? 'Alugar' : lang === 'es' ? 'Alquilar' : 'Rent'
        }, {
          id: 'routes',
          icon: Icon.pin,
          label: lang === 'pt' ? 'Rotas' : lang === 'es' ? 'Rutas' : 'Routes'
        }].map(tb => {
          const on = view === tb.id;
          return /*#__PURE__*/React.createElement("button", {
            key: tb.id,
            onClick: () => {
              setView(tb.id);
              setCat('All');
              setPriceRange('all');
              setRouteRegion('all');
              setRoutePrice('all');
              setRouteSub('routes');
              setPoolPrice('all');
              setQ('');
            },
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 30px',
              borderRadius: 15,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 14.5,
              fontWeight: on ? 700 : 500,
              background: on ? _activeBg : 'transparent',
              color: on ? '#fff' : _inactTx,
              boxShadow: on ? '0 3px 14px rgba(0,119,182,0.40)' : 'none',
              transition: 'all .20s ease',
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap'
            }
          }, tb.icon(16, on ? '#fff' : _inactTx), tb.label);
        })));
      })());
    }(), pendingRatings.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'flex-end',
        padding: '10px 32px 0'
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: () => openBuyerRatingPrompt && openBuyerRatingPrompt(),
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        cursor: 'pointer',
        background: 'linear-gradient(135deg,#FFFBEB,#FEF3C7)',
        border: '1.5px solid #FDE68A',
        borderRadius: 999,
        padding: '8px 16px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 16
      }
    }, "\u2B50"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 700,
        color: '#92400E',
        lineHeight: 1
      }
    }, pendingRatings.length, " ", lang === 'pt' ? 'avaliação pendente' : 'pending rating', pendingRatings.length > 1 ? 's' : ''), /*#__PURE__*/React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "#92400E",
      strokeWidth: "2.5",
      strokeLinecap: "round"
    }, /*#__PURE__*/React.createElement("polyline", {
      points: "9 18 15 12 9 6"
    })))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 0,
        maxWidth: '100%',
        minHeight: 'calc(100vh - 280px)',
        paddingTop: 36
      }
    }, isEquipment && /*#__PURE__*/React.createElement("div", {
      style: {
        width: 220,
        flexShrink: 0,
        background: 'var(--pg-white)',
        borderRight: '1px solid var(--pg-ink-200)',
        padding: '16px 20px',
        position: 'sticky',
        top: 0,
        height: '100vh',
        marginTop: -32,
        overflowY: 'auto'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 28
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10.5,
        fontWeight: 800,
        color: 'var(--pg-ink-400)',
        letterSpacing: '0.10em',
        textTransform: 'uppercase',
        marginBottom: 12
      }
    }, lang === 'pt' ? 'CATEGORIAS' : lang === 'es' ? 'CATEGORÍAS' : 'CATEGORIES'), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }
    }, cats.map(c => {
      const on = cat === c;
      return /*#__PURE__*/React.createElement("button", {
        key: c,
        onClick: () => setCat(c),
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '9px 12px',
          borderRadius: 10,
          border: 'none',
          cursor: 'pointer',
          background: on ? 'var(--pg-blue-50)' : 'transparent',
          fontFamily: 'inherit',
          textAlign: 'left',
          transition: 'all .12s'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: 8,
          height: 8,
          borderRadius: '50%',
          flexShrink: 0,
          background: on ? 'var(--pg-blue-500)' : 'var(--pg-ink-300)',
          transition: 'all .12s'
        }
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 13,
          fontWeight: on ? 700 : 500,
          color: on ? 'var(--pg-blue-700)' : 'var(--pg-ink-600)'
        }
      }, tr(catLabels[c], lang)), on && /*#__PURE__*/React.createElement("div", {
        style: {
          marginLeft: 'auto',
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: 'var(--pg-blue-400)'
        }
      }));
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 1,
        background: 'var(--pg-ink-100)',
        margin: '0 -20px 24px'
      }
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10.5,
        fontWeight: 800,
        color: 'var(--pg-ink-400)',
        letterSpacing: '0.10em',
        textTransform: 'uppercase',
        marginBottom: 12
      }
    }, lang === 'pt' ? 'PREÇO' : lang === 'es' ? 'PRECIO' : 'PRICE RANGE'), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }
    }, [{
      id: 'all',
      label: lang === 'pt' ? 'Qualquer preço' : 'Any price'
    }, {
      id: 'u100',
      label: '< $100'
    }, {
      id: '100-500',
      label: '$100 – $500'
    }, {
      id: 'o500',
      label: '$500+'
    }].map(opt => {
      const on = priceRange === opt.id;
      return /*#__PURE__*/React.createElement("button", {
        key: opt.id,
        onClick: () => setPriceRange(opt.id),
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '9px 12px',
          borderRadius: 10,
          border: 'none',
          cursor: 'pointer',
          background: on ? 'var(--pg-blue-50)' : 'transparent',
          fontFamily: 'inherit',
          textAlign: 'left',
          transition: 'all .12s'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: 8,
          height: 8,
          borderRadius: '50%',
          flexShrink: 0,
          background: on ? 'var(--pg-blue-500)' : 'var(--pg-ink-300)'
        }
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 13,
          fontWeight: on ? 700 : 500,
          color: on ? 'var(--pg-blue-700)' : 'var(--pg-ink-600)'
        }
      }, opt.label));
    })))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        padding: '28px 32px 60px',
        minWidth: 0
      }
    }, isEquipment && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        color: 'var(--pg-ink-600)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 700,
        color: 'var(--pg-ink-900)'
      }
    }, liveEquipment.length + list.length), ' ', lang === 'pt' ? 'anúncios' : lang === 'es' ? 'anuncios' : 'listings', cat !== 'All' && /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--pg-blue-600)'
      }
    }, " \xB7 ", tr(catLabels[cat], lang))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--pg-ink-400)'
      }
    }, lang === 'pt' ? 'Mais recentes primeiro' : 'Newest first')), isEquipment && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))',
        gap: 16,
        marginBottom: 24
      }
    }, liveEquipment.map(item => renderLiveCard(item, true)), liveEquipment.length === 0 && (view === 'rent' || list.length === 0) && /*#__PURE__*/React.createElement("div", {
      style: {
        gridColumn: '1/-1',
        textAlign: 'center',
        padding: '64px 20px',
        background: 'var(--pg-white)',
        borderRadius: 16,
        border: '1px solid var(--pg-ink-200)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        marginBottom: 12
      }
    }, view === 'rent' ? '🔑' : '🔍'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 15,
        fontWeight: 700,
        color: 'var(--pg-ink-700)',
        marginBottom: 6
      }
    }, view === 'rent' ? lang === 'pt' ? 'Nenhum item para alugar ainda' : 'No rental listings yet' : lang === 'pt' ? 'Nenhum item encontrado' : 'No items found'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: 'var(--pg-ink-400)',
        marginBottom: view === 'rent' ? 16 : 0
      }
    }, view === 'rent' ? lang === 'pt' ? 'Seja o primeiro a publicar um item para aluguel!' : 'Be the first to post a rental listing!' : lang === 'pt' ? 'Tente outros filtros ou categorias' : 'Try different filters or categories'), view === 'rent' && /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        setPostOpen(true);
        setPostMode('rent');
      },
      style: {
        height: 44,
        padding: '0 24px',
        borderRadius: 12,
        border: 'none',
        cursor: 'pointer',
        background: 'linear-gradient(135deg,#0EBAC7,#0891A8)',
        color: '#fff',
        fontFamily: 'inherit',
        fontSize: 14,
        fontWeight: 700,
        boxShadow: '0 4px 16px rgba(14,186,199,0.35)'
      }
    }, "+ ", lang === 'pt' ? 'Publicar para aluguel' : 'Post a rental')), view !== 'rent' && list.map(e => /*#__PURE__*/React.createElement("button", {
      key: e.id,
      onClick: () => openListing(normStatic(e)),
      className: "pg-press",
      style: {
        border: 'none',
        textAlign: 'left',
        cursor: 'pointer',
        overflow: 'hidden',
        padding: 0,
        borderRadius: 16,
        background: darkMode ? '#1C2128' : 'var(--pg-white)',
        boxShadow: darkMode ? '0 2px 16px rgba(0,0,0,0.45)' : '0 2px 12px rgba(0,0,0,0.07)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow .18s'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        paddingTop: '62%',
        background: 'var(--pg-ink-200)',
        overflow: 'hidden',
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0
      }
    }, /*#__PURE__*/React.createElement(EquipImg, {
      category: e.category,
      height: '100%'
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.22) 0%, transparent 40%)',
        pointerEvents: 'none'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        top: 10,
        left: 10,
        fontSize: 9,
        fontWeight: 700,
        padding: '3px 9px',
        borderRadius: 6,
        background: 'rgba(0,0,0,0.50)',
        color: '#fff',
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
        backdropFilter: 'blur(4px)'
      }
    }, tr({
      Pumps: 'Pumps',
      Filters: 'Filters',
      Vacuum: 'Vacuum',
      Heaters: 'Heaters',
      Tools: 'Tools'
    }[e.category] || e.category, lang)), /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        top: 10,
        right: 10,
        fontSize: 9.5,
        fontWeight: 700,
        padding: '3px 9px',
        borderRadius: 6,
        background: 'rgba(255,255,255,0.92)',
        color: 'var(--pg-blue-700)',
        backdropFilter: 'blur(4px)'
      }
    }, tr(e.condition, lang))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '14px 16px 16px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 15,
        fontWeight: 700,
        letterSpacing: '-0.01em',
        lineHeight: 1.3,
        color: 'var(--pg-ink-900)',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }
    }, e.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: 'var(--pg-ink-500)',
        marginTop: 5,
        lineHeight: 1.4,
        flex: 1,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }
    }, descFor(e, lang)), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 1,
        background: 'var(--pg-ink-100)',
        margin: '10px 0'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--pg-font-display)',
        fontSize: 24,
        fontWeight: 800,
        color: 'var(--pg-blue-500)',
        letterSpacing: '-0.02em',
        lineHeight: 1
      }
    }, "$", fmtN(e.price, lang), e.unit && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 500,
        color: 'var(--pg-ink-400)',
        marginLeft: 2
      }
    }, tr(e.unit, lang))), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: 'var(--pg-ink-400)'
      }
    }, sellerFor(e))))))), view === 'routes' && /*#__PURE__*/React.createElement("div", {
      style: {
        paddingTop: 8
      }
    }, user.tier === 'free' && /*#__PURE__*/React.createElement("div", {
      style: {
        borderRadius: 20,
        padding: '32px 24px',
        textAlign: 'center',
        background: 'linear-gradient(135deg,#0c4a6e 0%,#0077B6 100%)',
        color: '#fff',
        marginBottom: 20
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 52,
        height: 52,
        borderRadius: 15,
        background: 'rgba(255,255,255,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 14px'
      }
    }, Icon.lock(22, '#fff')), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 17,
        fontWeight: 800,
        letterSpacing: '-0.02em',
        marginBottom: 8
      }
    }, lang === 'pt' ? 'Rotas disponíveis com PRO' : lang === 'es' ? 'Rutas disponibles con PRO' : 'Routes available with PRO'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        opacity: .8,
        lineHeight: 1.5,
        maxWidth: 280,
        margin: '0 auto 18px'
      }
    }, lang === 'pt' ? 'Faça upgrade para Pool Guy PRO e veja todas as rotas e piscinas disponíveis na sua região.' : lang === 'es' ? 'Actualiza a Pool Guy PRO para ver todas las rutas y piscinas disponibles en tu área.' : 'Upgrade to Pool Guy PRO to see all available routes and pools in your area.'), /*#__PURE__*/React.createElement("button", {
      onClick: () => ctx.openPaywall && ctx.openPaywall('routes'),
      style: {
        height: 44,
        padding: '0 28px',
        borderRadius: 12,
        border: 'none',
        cursor: 'pointer',
        background: '#fff',
        color: '#0077B6',
        fontWeight: 800,
        fontSize: 14,
        fontFamily: 'inherit'
      }
    }, lang === 'pt' ? 'Ver planos — a partir de $14.99/mês' : lang === 'es' ? 'Ver planes — desde $14.99/mes' : 'See plans — from $14.99/mo')), user.tier !== 'free' && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 10,
        marginBottom: 24
      }
    }, [{
      id: 'routes',
      label: lang === 'pt' ? 'Rotas (5+ piscinas)' : 'Routes (5+ pools)'
    }, {
      id: 'pools',
      label: lang === 'pt' ? 'Piscinas avulsas' : 'Individual Pools'
    }].map(s => /*#__PURE__*/React.createElement("button", {
      key: s.id,
      onClick: () => setRouteSub(s.id),
      style: {
        padding: '10px 20px',
        borderRadius: 12,
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
        background: routeSub === s.id ? 'var(--pg-blue-500)' : 'var(--pg-white)',
        color: routeSub === s.id ? '#fff' : 'var(--pg-ink-600)',
        fontSize: 13,
        fontWeight: 700,
        border: `1.5px solid ${routeSub === s.id ? 'var(--pg-blue-500)' : 'var(--pg-ink-200)'}`,
        boxShadow: routeSub === s.id ? '0 4px 12px rgba(0,119,182,0.25)' : 'none',
        transition: 'all .15s'
      }
    }, s.label))), user.tier === 'free' ? null : /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(360px,1fr))',
        gap: 16
      }
    }, list.map(r => /*#__PURE__*/React.createElement("div", {
      key: r.id || r._liveId,
      onClick: () => {
        if (r._live) {
          const m = liveMarket.find(x => x._id === r._liveId);
          if (m) {
            if (isMyPost(m)) {
              setMyPostDetail(m);
              return;
            }
            if (m.status === 'sold') {
              return;
            }
            openListing(m);
          }
        } else {
          setSelected({
            ...r,
            _type: 'route'
          });
          window.history.pushState({
            pgRoute: r.id
          }, '', '?listing=route-' + r.id);
        }
      },
      style: {
        background: 'var(--pg-white)',
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid var(--pg-ink-200)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        cursor: 'pointer',
        transition: 'box-shadow .15s'
      },
      onMouseEnter: e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,119,182,0.18)',
      onMouseLeave: e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'stretch'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 100,
        flexShrink: 0,
        background: 'linear-gradient(135deg,var(--pg-blue-100) 0%,var(--pg-blue-50) 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        padding: '16px 8px'
      }
    }, r.photoUrls && r.photoUrls[0] || r.photoUrl ? /*#__PURE__*/React.createElement("img", {
      src: r.photoUrls && r.photoUrls[0] || r.photoUrl,
      alt: "",
      style: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }
    }) : /*#__PURE__*/React.createElement(React.Fragment, null, Icon.pin(22, 'var(--pg-blue-600)'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--pg-font-display)',
        fontSize: 24,
        fontWeight: 800,
        color: 'var(--pg-blue-600)',
        lineHeight: 1
      }
    }, r.clients || r.pools || '?'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 9,
        fontWeight: 700,
        color: 'var(--pg-blue-700)',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        opacity: 0.75
      }
    }, "POOLS"))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        padding: '16px 18px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 9.5,
        fontWeight: 700,
        padding: '3px 8px',
        borderRadius: 5,
        background: 'var(--pg-blue-50)',
        color: 'var(--pg-blue-700)',
        letterSpacing: '0.05em'
      }
    }, r.area || 'South FL')), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 15,
        fontWeight: 700,
        color: 'var(--pg-ink-900)',
        lineHeight: 1.3,
        marginBottom: 6
      }
    }, tr(r.name, lang) || r.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--pg-ink-500)',
        lineHeight: 1.4,
        marginBottom: 10,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }
    }, tr(r.desc, lang) || r.desc), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: 'var(--pg-ink-400)',
        marginBottom: 2
      }
    }, t.asking), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--pg-font-display)',
        fontSize: 22,
        fontWeight: 800,
        color: 'var(--pg-blue-500)',
        letterSpacing: '-0.02em',
        lineHeight: 1
      }
    }, "$", fmtN(r.est || r.asking || 0, lang))), !isMyPost(liveMarket.find(x => x._id === r._liveId) || {}) && /*#__PURE__*/React.createElement("button", {
      onClick: e => {
        e.stopPropagation();
        if (r._live && r._authorId) {
          openChat({
            id: r._authorId,
            name: r._author || 'Seller',
            listingId: r._liveId || null,
            listingContext: {
              name: tr(r.name, lang),
              photoUrl: r.photoUrls && r.photoUrls[0] || r.photoUrl || null,
              price: r.est,
              priceMode: 'fixed',
              type: 'route'
            }
          });
        } else {
          openChat && openChat();
        }
      },
      style: {
        padding: '9px 16px',
        borderRadius: 10,
        border: 'none',
        cursor: 'pointer',
        background: 'var(--pg-blue-500)',
        color: '#fff',
        fontFamily: 'inherit',
        fontSize: 13,
        fontWeight: 700,
        boxShadow: '0 3px 10px rgba(0,119,182,0.30)'
      }
    }, t.contact))))))))))), viewListing && /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        overflowY: 'auto',
        background: 'var(--pg-bg)',
        animation: 'pg-fade-in 0.18s ease'
      }
    }, /*#__PURE__*/React.createElement(ViewListingSheet, {
      item: viewListing,
      lang: lang,
      openChat: openChat,
      openPublicProfile: openPublicProfile,
      onClose: closeListing,
      isAdmin: user.role === 'admin',
      canDelete: user.role === 'admin' || !!(user.uid && viewListing.author_id && user.uid === viewListing.author_id),
      onEdit: isMyPost(viewListing) ? () => setMyPostDetail(viewListing) : undefined,
      currentUser: user,
      showToast: showToast,
      isSaved: savedIds.has(viewListing._id),
      onToggleSave: () => toggleSave(null, viewListing._id),
      onShare: () => handleShare(null, viewListing),
      liveMarket: liveMarket,
      onOpenListing: openListing,
      onAfterSold: sellerRating => {
        // Update liveMarket immediately (realtime subscription is stubbed)
        if (ctx && ctx.updateMarketItem && viewListing) ctx.updateMarketItem(viewListing._id, {
          status: 'sold'
        });
        setViewListing(prev => prev ? {
          ...prev,
          status: 'sold'
        } : null);
        setTimeout(() => {
          setViewListing(null);
          if (sellerRating && openRating) openRating(sellerRating);else if (loadPendingRatings) loadPendingRatings();
        }, 280);
      },
      onDeleted: id => {
        closeListing();
        setSavedIds(prev => {
          const s = new Set(prev);
          s.delete(id);
          return s;
        });
        if (ctx && ctx.removeMarketItem) ctx.removeMarketItem(id);
      }
    })), shareItem && /*#__PURE__*/React.createElement(ShareSheet, {
      item: shareItem,
      lang: lang,
      onClose: () => setShareItem(null),
      showToast: showToast
    }), /*#__PURE__*/React.createElement(FullPage, {
      open: !!myPostDetail,
      onClose: () => setMyPostDetail(null)
    }, myPostDetail && /*#__PURE__*/React.createElement(MyPostDetailSheet, {
      item: myPostDetail,
      lang: lang,
      onClose: () => setMyPostDetail(null),
      showToast: showToast,
      currentUser: user,
      openRating: openRating,
      onUpdated: () => {
        setMyPostDetail(null);
        if (ctx.liveMarket) ctx.liveMarket.splice(0);
      },
      onDeleted: id => {
        setMyPostDetail(null);
        if (ctx && ctx.removeMarketItem) ctx.removeMarketItem(id);
      }
    })), selected && /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'var(--pg-bg)',
        animation: 'pg-fade-in 0.18s ease'
      }
    }, /*#__PURE__*/React.createElement(ListingDetail, {
      selected: selected,
      lang: lang,
      t: t,
      catLabels: catLabels,
      openChat: openChat,
      onClose: () => {
        setSelected(null);
        if (window.location.search.includes('listing=route-') || window.location.search.includes('listing=pool-')) window.history.back();
      },
      openPublicProfile: openPublicProfile
    })), /*#__PURE__*/React.createElement(Sheet, {
      open: postOpen && !postMode,
      onClose: () => setPostOpen(false),
      height: "auto"
    }, /*#__PURE__*/React.createElement(MarketplaceListingPicker, {
      lang: lang,
      t: t,
      currentView: view,
      onPick: m => setPostMode(m),
      onClose: () => setPostOpen(false)
    })), /*#__PURE__*/React.createElement(FullPage, {
      open: postOpen && (postMode === 'sell' || postMode === 'rent'),
      onClose: () => {
        setPostMode(null);
        setPostOpen(false);
      }
    }, /*#__PURE__*/React.createElement(PostEquipmentSheet, {
      lang: lang,
      t: t,
      mode: postMode,
      onClose: () => {
        setPostMode(null);
        setPostOpen(false);
      },
      onSubmit: async data => {
        const mode = postMode;
        setPostMode(null);
        setPostOpen(false);
        if (data && dbWrite) {
          const ok = await dbWrite('marketplace', data);
          if (ok !== false) {
            setView(mode === 'rent' ? 'rent' : 'buy');
            if (showToast) showToast(lang === 'pt' ? '✓ Anúncio enviado para revisão' : '✓ Listing sent for review');
          }
        }
      }
    })), /*#__PURE__*/React.createElement(FullPage, {
      open: postOpen && postMode === 'route',
      onClose: () => {
        setPostMode(null);
        setPostOpen(false);
      }
    }, /*#__PURE__*/React.createElement(PostRouteSheet, {
      lang: lang,
      t: t,
      onClose: () => {
        setPostMode(null);
        setPostOpen(false);
      },
      onSubmit: async data => {
        setPostMode(null);
        setPostOpen(false);
        if (data && dbWrite) {
          const ok = await dbWrite('marketplace', data);
          if (ok !== false) {
            setView('routes');
            setRouteSub('routes');
            if (showToast) showToast(lang === 'pt' ? '✓ Rota enviada para revisão' : '✓ Route sent for review');
          }
        }
      }
    })), /*#__PURE__*/React.createElement(FullPage, {
      open: postOpen && postMode === 'pool',
      onClose: () => {
        setPostMode(null);
        setPostOpen(false);
      }
    }, /*#__PURE__*/React.createElement(PostPoolSheet, {
      lang: lang,
      t: t,
      onClose: () => {
        setPostMode(null);
        setPostOpen(false);
      },
      onSubmit: async data => {
        setPostMode(null);
        setPostOpen(false);
        if (data && dbWrite) {
          const ok = await dbWrite('marketplace', data);
          if (ok !== false) {
            setView('routes');
            setRouteSub('pools');
            if (showToast) showToast(lang === 'pt' ? '✓ Piscina enviada para revisão' : '✓ Pool sent for review');
          }
        }
      }
    })), /*#__PURE__*/React.createElement(LocationFilterSheet, {
      open: locationFilterOpen,
      onClose: () => setLocationFilterOpen(false),
      userLocation: userLocation,
      setUserLocation: setUserLocation,
      radiusMiles: radiusMiles,
      setRadiusMiles: setRadiusMiles,
      lang: lang
    }));
  }

  // ══════════════════════════════════════════════════════════════
  // ── MOBILE LAYOUT (< 900px) — original ───────────────────────
  // ══════════════════════════════════════════════════════════════
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: '100%',
      height: '100%',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "pg-screen",
    style: {
      paddingBottom: 110,
      height: '100%',
      overflowY: 'auto'
    }
  }, (() => {
    const H = headerTheme(darkMode);
    const ic = H.text;
    return /*#__PURE__*/React.createElement(NavyBar, {
      darkMode: darkMode,
      wave: false,
      compact: true,
      bgOverride: darkMode ? 'linear-gradient(135deg, #011B5A 0%, #0A2E6A 30%, #0077B6 70%, #023E8A 100%)' : 'linear-gradient(135deg, #e8f5ff 0%, #cfe9f8 40%, #b8dff5 100%)',
      title: /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: 44,
          height: 44,
          borderRadius: 13,
          flexShrink: 0,
          background: H.iconBg,
          border: `0.5px solid ${H.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }
      }, Icon.cart(20, ic)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 10,
          fontWeight: 600,
          color: H.sub,
          letterSpacing: '0.10em',
          marginBottom: 2,
          textTransform: 'uppercase'
        }
      }, lang === 'pt' ? 'COMPRAR · VENDER · ALUGAR' : lang === 'es' ? 'COMPRAR · VENDER · ALQUILAR' : 'BUY · SELL · RENT'), /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: 'var(--pg-font-display)',
          fontSize: 17,
          fontWeight: 700,
          letterSpacing: '-0.025em',
          lineHeight: 1.1,
          color: H.text,
          whiteSpace: 'nowrap'
        }
      }, lang === 'pt' ? 'Equipamentos & Rotas' : lang === 'es' ? 'Equipos & Rutas' : 'Equipment & Routes'))),
      leftBack: !isDesktop,
      onBack: () => goTab('home'),
      right: isDesktop ? null : /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          gap: 6,
          alignItems: 'center'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'relative',
          display: 'inline-flex'
        }
      }, /*#__PURE__*/React.createElement(IconButton, {
        dark: darkMode,
        onClick: () => openChat && openChat()
      }, Icon.msg(20, ic)), hasUnreadChat && /*#__PURE__*/React.createElement("span", {
        style: {
          position: 'absolute',
          top: 5,
          right: 5,
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#FF3B30',
          border: `1.5px solid ${darkMode ? '#011B5A' : '#d0e8f5'}`,
          pointerEvents: 'none'
        }
      })), /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'relative',
          display: 'inline-flex'
        }
      }, /*#__PURE__*/React.createElement(IconButton, {
        dark: darkMode,
        onClick: () => openNotifications && openNotifications()
      }, Icon.bell(20, ic)), hasUnreadNotif && /*#__PURE__*/React.createElement("span", {
        style: {
          position: 'absolute',
          top: 5,
          right: 5,
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#FF3B30',
          border: `1.5px solid ${darkMode ? '#011B5A' : '#d0e8f5'}`,
          pointerEvents: 'none'
        }
      })))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginTop: 10,
        paddingTop: 10,
        borderTop: `1px solid ${H.border}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 7
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 30,
        height: 30,
        borderRadius: 9,
        background: H.iconBg,
        border: `0.5px solid ${H.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, Icon.cart(14, H.iconC)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 17,
        fontWeight: 800,
        fontFamily: 'var(--pg-font-display)',
        lineHeight: 1,
        letterSpacing: '-0.02em',
        color: H.text
      }
    }, totalItems), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        opacity: 0.55,
        lineHeight: 1,
        marginTop: 1.5,
        fontWeight: 500,
        color: H.text
      }
    }, lang === 'pt' ? 'itens' : lang === 'es' ? 'artículos' : 'items'))), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 1,
        height: 30,
        background: H.divider
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 7
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 30,
        height: 30,
        borderRadius: 9,
        background: H.iconBg,
        border: `0.5px solid ${H.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, Icon.pin(14, H.iconC)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 17,
        fontWeight: 800,
        fontFamily: 'var(--pg-font-display)',
        lineHeight: 1,
        letterSpacing: '-0.02em',
        color: H.text
      }
    }, totalRoutes), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        opacity: 0.55,
        lineHeight: 1,
        marginTop: 1.5,
        fontWeight: 500,
        color: H.text
      }
    }, lang === 'pt' ? 'rotas' : lang === 'es' ? 'rutas' : 'routes'))), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 1,
        height: 30,
        background: H.divider
      }
    }), /*#__PURE__*/React.createElement("button", {
      onClick: () => setLocationFilterOpen(true),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: userLocation ? 'var(--pg-aqua-100)' : 'rgba(0,178,169,0.10)',
        border: '1.5px solid var(--pg-aqua-400)',
        borderRadius: 999,
        padding: userLocation ? '7px 14px' : '7px 12px',
        boxShadow: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
        color: 'inherit',
        touchAction: 'manipulation'
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "19",
      height: "19",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: userLocation ? 'var(--pg-aqua-600)' : 'var(--pg-aqua-500)',
      strokeWidth: "2.2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z",
      fill: userLocation ? 'var(--pg-aqua-400)' : 'none'
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "9",
      r: "2.5",
      fill: userLocation ? 'white' : 'none'
    })), userLocation && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--pg-aqua-700)',
        whiteSpace: 'nowrap'
      }
    }, locCity ? `${locCity} · ` : '', radiusMiles, " mi"))));
  })(), /*#__PURE__*/React.createElement(LocationFilterSheet, {
    open: locationFilterOpen,
    onClose: () => setLocationFilterOpen(false),
    userLocation: userLocation,
    setUserLocation: setUserLocation,
    radiusMiles: radiusMiles,
    setRadiusMiles: setRadiusMiles,
    lang: lang
  }), pendingRatings.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '12px 18px 0',
      padding: '12px 14px',
      borderRadius: 14,
      background: 'linear-gradient(135deg,#FFFBEB,#FEF3C7)',
      border: '1.5px solid #FDE68A',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      cursor: 'pointer'
    },
    onClick: () => openBuyerRatingPrompt && openBuyerRatingPrompt()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 26,
      lineHeight: 1,
      flexShrink: 0
    }
  }, "\u2B50"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: '#92400E'
    }
  }, lang === 'pt' ? `Você tem ${pendingRatings.length} avaliação${pendingRatings.length > 1 ? 'ções' : ''} pendente${pendingRatings.length > 1 ? 's' : ''}!` : `You have ${pendingRatings.length} pending rating${pendingRatings.length > 1 ? 's' : ''}!`), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: '#B45309',
      marginTop: 2
    }
  }, lang === 'pt' ? `Avalie: "${pendingRatings[0].listing_name || 'anúncio'}"` : `Rate: "${pendingRatings[0].listing_name || 'listing'}"`)), /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#92400E",
    strokeWidth: "2.5",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "9 18 15 12 9 6"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 18px 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "pg-card",
    style: {
      padding: '12px',
      marginTop: -6,
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      padding: 4,
      background: 'var(--pg-ink-100)',
      borderRadius: 14
    }
  }, ['buy', 'rent', 'routes'].map(v => {
    const on = view === v;
    return /*#__PURE__*/React.createElement("button", {
      key: v,
      onClick: () => {
        setView(v);
        setCat('All');
        setPriceRange('all');
        setRouteRegion('all');
        setRoutePrice('all');
        setRouteSub('routes');
        setPoolPrice('all');
      },
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        padding: '9px 4px',
        borderRadius: 10,
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'all .18s ease',
        background: on ? 'var(--pg-white)' : 'transparent',
        color: on ? 'var(--pg-blue-600)' : 'var(--pg-ink-400)',
        boxShadow: on ? '0 2px 10px rgba(0,0,0,0.10)' : 'none'
      }
    }, tabIcons[v](16, on ? 'var(--pg-blue-500)' : 'var(--pg-ink-400)'), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11.5,
        fontWeight: on ? 700 : 500,
        letterSpacing: '-0.01em'
      }
    }, tabLabels[v]));
  })), isEquipment && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "pg-search"
  }, Icon.search(18), /*#__PURE__*/React.createElement("input", {
    placeholder: t.search,
    value: q,
    onChange: e => setQ(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "pg-scroll-x",
    style: {
      display: 'flex',
      gap: 8,
      marginLeft: -12,
      marginRight: -12,
      padding: '2px 12px'
    }
  }, cats.filter(c => c !== 'Others').map(c => {
    const on = cat === c;
    return /*#__PURE__*/React.createElement("button", {
      key: c,
      className: `pg-chip ${on ? 'pg-chip-on' : ''}`,
      onClick: () => setCat(c),
      style: {
        padding: '7px 12px',
        whiteSpace: 'nowrap'
      }
    }, tr(catLabels[c], lang));
  }), /*#__PURE__*/React.createElement("button", {
    className: `pg-chip ${priceRange !== 'all' ? 'pg-chip-on' : ''}`,
    onClick: () => setPriceOpen(o => !o),
    style: {
      padding: '7px 12px',
      whiteSpace: 'nowrap',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      flexShrink: 0
    }
  }, priceRange === 'all' ? lang === 'pt' ? 'Preço' : lang === 'es' ? 'Precio' : 'Price' : priceRange === 'u100' ? '< $100' : priceRange === '100-500' ? '$100–$500' : '$500+', /*#__PURE__*/React.createElement("svg", {
    width: "10",
    height: "10",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: priceOpen ? '18 15 12 9 6 15' : '6 9 12 15 18 9'
  }))), (() => {
    const on = cat === 'Others';
    return /*#__PURE__*/React.createElement("button", {
      className: `pg-chip ${on ? 'pg-chip-on' : ''}`,
      onClick: () => setCat('Others'),
      style: {
        padding: '7px 12px',
        whiteSpace: 'nowrap'
      }
    }, tr(catLabels['Others'], lang));
  })()), priceOpen && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 7,
      flexWrap: 'wrap',
      padding: '4px 2px 2px'
    }
  }, [{
    id: 'all',
    label: lang === 'pt' ? 'Qualquer preço' : lang === 'es' ? 'Cualquier precio' : 'Any price'
  }, {
    id: 'u100',
    label: '< $100'
  }, {
    id: '100-500',
    label: '$100 – $500'
  }, {
    id: 'o500',
    label: '$500+'
  }].map(opt => {
    const on = priceRange === opt.id;
    return /*#__PURE__*/React.createElement("button", {
      key: opt.id,
      onClick: () => {
        setPriceRange(opt.id);
        setPriceOpen(false);
      },
      style: {
        padding: '6px 13px',
        borderRadius: 8,
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 12,
        fontWeight: 600,
        transition: 'all .12s',
        background: on ? 'var(--pg-blue-500)' : 'var(--pg-ink-100)',
        color: on ? '#fff' : 'var(--pg-ink-700)',
        boxShadow: on ? '0 2px 6px oklch(0.58 0.16 235 / 0.25)' : 'none'
      }
    }, opt.label);
  })))), isEquipment && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))',
      gap: 12,
      marginTop: 14
    }
  }, marketByCounty.filter(m => m.type === mode && (cat === 'All' || !m.cat || m.cat === cat) && (m.status === 'approved' || m.status === 'pending' && isMyPost(m))).sort((a, b) => {
    const aOwn = user?.uid && a.author_id === user.uid ? 0 : 1;
    const bOwn = user?.uid && b.author_id === user.uid ? 0 : 1;
    return aOwn - bOwn;
  }).map(item => {
    const isPending = item.status === 'pending';
    const isSoldItem = item.status === 'sold';
    const canAdminDelete = user.role === 'admin' || isMyPost(item);
    const handleQuickDelete = async e => {
      e.stopPropagation();
      const msg = lang === 'pt' ? `Excluir "${item.name}"? Não pode ser desfeito.` : `Delete "${item.name}"? This cannot be undone.`;
      if (!window.confirm(msg)) return;
      const {
        error
      } = await window.sb.from('marketplace').delete().eq('id', item._id);
      if (error) {
        showToast && showToast('❌ ' + error.message);
        return;
      }
      showToast && showToast('🗑️ ' + (lang === 'pt' ? 'Anúncio excluído' : 'Listing deleted'));
      if (ctx && ctx.removeMarketItem) ctx.removeMarketItem(item._id);
    };
    return /*#__PURE__*/React.createElement("button", {
      key: item._id,
      onClick: () => isMyPost(item) ? setMyPostDetail(item) : openListing(item),
      className: isSoldItem ? '' : 'pg-press',
      style: {
        padding: 0,
        overflow: 'hidden',
        position: 'relative',
        cursor: isSoldItem ? isMyPost(item) ? 'pointer' : 'default' : 'pointer',
        border: isPending ? '1.5px solid var(--pg-ink-200)' : isSoldItem ? '1.5px solid var(--pg-ink-200)' : '1.5px solid var(--pg-blue-100)',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 14,
        background: isSoldItem ? 'var(--pg-ink-50)' : 'var(--pg-white)',
        textAlign: 'left',
        fontFamily: 'inherit',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        opacity: isPending ? 0.82 : isSoldItem ? 0.65 : 1,
        filter: isSoldItem ? 'grayscale(0.6)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        paddingTop: '72%',
        background: 'var(--pg-ink-200)',
        overflow: 'hidden',
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0
      }
    }, item.photoUrl ? /*#__PURE__*/React.createElement("img", {
      src: item.photoUrl,
      alt: item.name,
      style: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }
    }) : /*#__PURE__*/React.createElement(NoPhotoPlaceholder, {
      height: '100%'
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.28) 0%, transparent 45%, transparent 60%, rgba(0,0,0,0.10) 100%)',
        pointerEvents: 'none'
      }
    }), isSoldItem ? /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        top: 10,
        left: 10,
        fontSize: 9.5,
        fontWeight: 800,
        padding: '3px 10px',
        borderRadius: 6,
        letterSpacing: '0.10em',
        background: 'rgba(30,30,30,0.88)',
        color: '#fff',
        backdropFilter: 'blur(4px)'
      }
    }, lang === 'pt' ? 'VENDIDO' : lang === 'es' ? 'VENDIDO' : 'SOLD') : isMyPost(item) && /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        top: 10,
        left: 10,
        fontSize: 9.5,
        fontWeight: 700,
        padding: '3px 8px',
        borderRadius: 6,
        letterSpacing: '0.05em',
        background: isPending ? 'rgba(255,243,205,0.95)' : 'rgba(14,186,199,0.92)',
        color: isPending ? '#856404' : '#fff',
        backdropFilter: 'blur(4px)'
      }
    }, isPending ? `⏳ ${lang === 'pt' ? 'REVISÃO' : lang === 'es' ? 'REVISIÓN' : 'REVIEW'}` : `✦ ${lang === 'pt' ? 'MEU ANÚNCIO' : lang === 'es' ? 'MI ANUNCIO' : 'MY LISTING'}`), /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        top: 10,
        right: 10,
        fontSize: 9,
        fontWeight: 700,
        padding: '3px 8px',
        borderRadius: 6,
        background: 'rgba(0,0,0,0.52)',
        color: '#fff',
        letterSpacing: '0.06em',
        backdropFilter: 'blur(4px)',
        textTransform: 'uppercase'
      }
    }, item.cat || 'Tools')), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '12px 13px 14px',
        display: 'flex',
        flexDirection: 'column',
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: '-0.01em',
        lineHeight: 1.3,
        color: 'var(--pg-ink-900)',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement(Tx, {
      lang: lang
    }, item.name)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: 'var(--pg-ink-500)',
        marginTop: 5,
        lineHeight: 1.4,
        flex: 1,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }
    }, item.description ? item.description : [item.condition, item.loc].filter(Boolean).join(' · ') || '—'), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 1,
        background: 'var(--pg-ink-100)',
        margin: '10px 0'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 4
      }
    }, isSoldItem ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 700,
        padding: '4px 10px',
        borderRadius: 999,
        background: 'var(--pg-ink-100)',
        color: 'var(--pg-ink-400)',
        border: '1px solid var(--pg-ink-200)',
        flexShrink: 0
      }
    }, lang === 'pt' ? '✓ Vendido' : lang === 'es' ? '✓ Vendido' : '✓ Sold') : item.priceMode === 'neg' ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 700,
        padding: '4px 10px',
        borderRadius: 999,
        background: isPending ? 'var(--pg-ink-100)' : 'var(--pg-blue-50)',
        color: isPending ? 'var(--pg-ink-400)' : 'var(--pg-blue-600)',
        border: `1px solid ${isPending ? 'var(--pg-ink-200)' : 'var(--pg-blue-100)'}`,
        flexShrink: 0
      }
    }, "\uD83E\uDD1D ", lang === 'pt' ? 'Negociável' : lang === 'es' ? 'Negociable' : 'Negotiable') : /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--pg-font-display)',
        fontSize: 22,
        fontWeight: 800,
        color: isPending ? 'var(--pg-ink-400)' : 'var(--pg-blue-500)',
        letterSpacing: '-0.02em',
        lineHeight: 1,
        flexShrink: 0
      }
    }, (() => {
      if (item.type !== 'rent' || isPending) return `$${fmtN(item.price, lang)}`;
      // Multi-period: show cheapest rate with "from" prefix
      if (item.rentPrices && typeof item.rentPrices === 'object') {
        const order = ['day', 'week', 'month'];
        const entries = order.filter(k => item.rentPrices[k] && item.rentPrices[k] > 0).map(k => ({
          k,
          v: item.rentPrices[k]
        }));
        if (entries.length === 0) return `$${fmtN(item.price, lang)}`;
        const first = entries[0];
        const sfx = first.k === 'week' ? lang === 'pt' ? '/sem' : '/wk' : first.k === 'month' ? lang === 'pt' ? '/mês' : '/mo' : lang === 'pt' ? '/dia' : '/day';
        return /*#__PURE__*/React.createElement(React.Fragment, null, entries.length > 1 && /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 10,
            fontWeight: 600,
            color: 'var(--pg-ink-400)',
            marginRight: 2
          }
        }, lang === 'pt' ? 'de' : 'from'), "$", fmtN(first.v, lang), /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 11,
            fontWeight: 500,
            color: 'var(--pg-ink-400)',
            marginLeft: 2
          }
        }, sfx));
      }
      // Legacy single period
      const sfx = item.rentPeriod === 'week' ? lang === 'pt' ? '/sem' : '/wk' : item.rentPeriod === 'month' ? lang === 'pt' ? '/mês' : '/mo' : lang === 'pt' ? '/dia' : '/day';
      return /*#__PURE__*/React.createElement(React.Fragment, null, "$", fmtN(item.price, lang), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11,
          fontWeight: 500,
          color: 'var(--pg-ink-400)',
          marginLeft: 2
        }
      }, sfx));
    })()), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: '50%',
        background: 'linear-gradient(135deg,var(--pg-blue-500),var(--pg-blue-700))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: 9,
        fontWeight: 700,
        flexShrink: 0
      }
    }, (fmtAuthor(item.author)[0] || '?').toUpperCase()), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 600,
        color: 'var(--pg-ink-600)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        minWidth: 0
      }
    }, fmtAuthor(item.author)), item.createdAt && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        color: 'var(--pg-ink-400)',
        flexShrink: 0,
        marginLeft: 2
      }
    }, "\xB7 ", timeAgo(item.createdAt, lang)))), !isMyPost(item) && !isPending && !isSoldItem && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6,
        marginTop: 8
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: e => toggleSave(e, item._id),
      style: {
        flex: 1,
        height: 30,
        borderRadius: 8,
        cursor: 'pointer',
        fontFamily: 'inherit',
        border: savedIds.has(item._id) ? '1px solid #FCA5A5' : '1px solid var(--pg-ink-200)',
        background: savedIds.has(item._id) ? '#FEF2F2' : 'var(--pg-ink-50)',
        color: savedIds.has(item._id) ? '#EF4444' : 'var(--pg-ink-400)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        fontSize: 11,
        fontWeight: 600
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "12",
      height: "12",
      viewBox: "0 0 24 24",
      fill: savedIds.has(item._id) ? 'currentColor' : 'none',
      stroke: "currentColor",
      strokeWidth: "2.5",
      strokeLinecap: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
    })), savedIds.has(item._id) ? lang === 'pt' ? 'Salvo' : lang === 'es' ? 'Guardado' : 'Saved' : lang === 'pt' ? 'Salvar' : lang === 'es' ? 'Guardar' : 'Save'), /*#__PURE__*/React.createElement("button", {
      onClick: e => handleShare(e, item),
      style: {
        width: 30,
        height: 30,
        borderRadius: 8,
        border: '1px solid var(--pg-ink-200)',
        background: 'var(--pg-ink-50)',
        color: 'var(--pg-ink-400)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "13",
      height: "13",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.5",
      strokeLinecap: "round"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "18",
      cy: "5",
      r: "3"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "6",
      cy: "12",
      r: "3"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "18",
      cy: "19",
      r: "3"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "8.59",
      y1: "13.51",
      x2: "15.42",
      y2: "17.49"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "15.41",
      y1: "6.51",
      x2: "8.59",
      y2: "10.49"
    })))), isPending && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 8,
        fontSize: 10.5,
        color: '#92710A',
        background: '#FFF8E1',
        border: '0.5px solid #FFE082',
        borderRadius: 6,
        padding: '4px 8px',
        textAlign: 'center'
      }
    }, "\u23F3 ", lang === 'pt' ? 'Em revisão' : lang === 'es' ? 'En revisión' : 'Under review'))), canAdminDelete && /*#__PURE__*/React.createElement("div", {
      onClick: handleQuickDelete,
      style: {
        margin: '0 13px 14px',
        padding: '6px 0',
        borderRadius: 8,
        background: '#FEF2F2',
        border: '1px solid #FCA5A5',
        color: '#EF4444',
        fontSize: 11,
        fontWeight: 700,
        textAlign: 'center',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "11",
      height: "11",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.5",
      strokeLinecap: "round"
    }, /*#__PURE__*/React.createElement("polyline", {
      points: "3 6 5 6 21 6"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M10 11v6"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M14 11v6"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
    })), lang === 'pt' ? 'Excluir' : lang === 'es' ? 'Eliminar' : 'Delete'));
  }), marketByCounty.filter(m => m.type === mode && (m.status === 'approved' || m.status === 'pending' && isMyPost(m))).length === 0 && (view === 'rent' || list.length === 0) && /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: '1/-1',
      textAlign: 'center',
      padding: '48px 20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 36,
      marginBottom: 12
    }
  }, view === 'rent' ? '🔑' : '🔍'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: 'var(--pg-ink-700)',
      marginBottom: 4
    }
  }, view === 'rent' ? lang === 'pt' ? 'Nenhum item para alugar ainda' : lang === 'es' ? 'Sin artículos en alquiler aún' : 'No rental listings yet' : lang === 'pt' ? 'Nenhum item encontrado' : lang === 'es' ? 'No se encontraron artículos' : 'No items found'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--pg-ink-400)',
      marginBottom: view === 'rent' ? 14 : 0
    }
  }, view === 'rent' ? lang === 'pt' ? 'Seja o primeiro a publicar!' : lang === 'es' ? '¡Sé el primero en publicar!' : 'Be the first to post a rental!' : lang === 'pt' ? 'Tente outros filtros ou categorias' : lang === 'es' ? 'Prueba otros filtros o categorías' : 'Try different filters or categories'), view === 'rent' && /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setPostOpen(true);
      setPostMode('rent');
    },
    style: {
      height: 40,
      padding: '0 20px',
      borderRadius: 11,
      border: 'none',
      cursor: 'pointer',
      background: 'linear-gradient(135deg,#0EBAC7,#0891A8)',
      color: '#fff',
      fontFamily: 'inherit',
      fontSize: 13,
      fontWeight: 700,
      boxShadow: '0 4px 12px rgba(14,186,199,0.30)'
    }
  }, "+ ", lang === 'pt' ? 'Publicar para aluguel' : lang === 'es' ? 'Publicar alquiler' : 'Post a rental')), view !== 'rent' && list.map(e => /*#__PURE__*/React.createElement("button", {
    key: e.id,
    onClick: () => openListing(normStatic(e)),
    className: "pg-press",
    style: {
      border: 'none',
      textAlign: 'left',
      cursor: 'pointer',
      overflow: 'hidden',
      padding: 0,
      borderRadius: 14,
      background: 'var(--pg-white)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px var(--pg-ink-200)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'box-shadow .15s, transform .12s'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      paddingTop: '72%',
      background: 'var(--pg-ink-200)',
      overflow: 'hidden',
      borderRadius: '14px 14px 0 0',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0
    }
  }, /*#__PURE__*/React.createElement(EquipImg, {
    category: e.category,
    height: '100%'
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(to bottom, rgba(0,0,0,0.22) 0%, transparent 40%, transparent 65%, rgba(0,0,0,0.08) 100%)',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 10,
      left: 10,
      fontSize: 9,
      fontWeight: 700,
      padding: '3px 9px',
      borderRadius: 6,
      background: 'rgba(0,0,0,0.50)',
      color: '#fff',
      letterSpacing: '0.07em',
      textTransform: 'uppercase',
      backdropFilter: 'blur(4px)'
    }
  }, tr({
    Pumps: 'Pumps',
    Filters: 'Filters',
    Vacuum: 'Vacuum',
    Heaters: 'Heaters',
    Tools: 'Tools'
  }[e.category] || e.category, lang)), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 10,
      right: 10,
      fontSize: 9.5,
      fontWeight: 700,
      padding: '3px 9px',
      borderRadius: 6,
      background: 'rgba(255,255,255,0.92)',
      color: 'var(--pg-blue-700)',
      letterSpacing: '0.03em',
      backdropFilter: 'blur(4px)'
    }
  }, tr(e.condition, lang))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 13px 14px',
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
      color: 'var(--pg-ink-900)',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    }
  }, e.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: 'var(--pg-ink-500)',
      marginTop: 5,
      lineHeight: 1.4,
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      flex: 1
    }
  }, descFor(e, lang)), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'var(--pg-ink-100)',
      margin: '10px 0'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--pg-font-display)',
      fontSize: 22,
      fontWeight: 800,
      color: 'var(--pg-blue-500)',
      letterSpacing: '-0.02em',
      lineHeight: 1
    }
  }, "$", fmtN(e.price, lang)), e.unit && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 500,
      color: 'var(--pg-ink-400)',
      marginLeft: 2
    }
  }, tr(e.unit, lang))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 22,
      height: 22,
      borderRadius: '50%',
      background: 'var(--pg-blue-100)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 10,
      flexShrink: 0
    }
  }, "\uD83D\uDC64"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--pg-ink-500)',
      fontWeight: 500
    }
  }, sellerFor(e)))))))), view === 'routes' && user.tier === 'free' && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 18,
      padding: '28px 20px',
      textAlign: 'center',
      background: 'linear-gradient(135deg,#0c4a6e 0%,#0077B6 100%)',
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 48,
      height: 48,
      borderRadius: 14,
      background: 'rgba(255,255,255,0.14)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 12px'
    }
  }, Icon.lock(20, '#fff')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 800,
      marginBottom: 6
    }
  }, lang === 'pt' ? 'Disponível no PRO' : lang === 'es' ? 'Disponible en PRO' : 'Available with PRO'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      opacity: .8,
      lineHeight: 1.5,
      marginBottom: 16
    }
  }, lang === 'pt' ? 'Veja todas as rotas e piscinas disponíveis na sua região.' : lang === 'es' ? 'Ve todas las rutas y piscinas disponibles en tu área.' : 'See all available routes and pools in your area.'), /*#__PURE__*/React.createElement("button", {
    onClick: () => ctx.openPaywall && ctx.openPaywall('routes'),
    style: {
      height: 42,
      padding: '0 24px',
      borderRadius: 10,
      border: 'none',
      cursor: 'pointer',
      background: '#fff',
      color: '#0077B6',
      fontWeight: 800,
      fontSize: 13,
      fontFamily: 'inherit'
    }
  }, lang === 'pt' ? 'Ver planos' : 'See plans', " \u2014 $14.99", lang === 'pt' ? '/mês' : '/mo'))), view === 'routes' && user.tier !== 'free' && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 6
    }
  }, [{
    id: 'routes',
    icon: Icon.pin,
    label: lang === 'pt' ? 'Rotas' : lang === 'es' ? 'Rutas' : 'Routes',
    sub: lang === 'pt' ? '5+ piscinas' : lang === 'es' ? '5+ piscinas' : '5+ pools',
    count: allRoutes.length
  }, {
    id: 'pools',
    icon: (s, c) => /*#__PURE__*/React.createElement("svg", {
      width: s,
      height: s,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: c,
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M2 12 Q6 8 10 12 Q14 16 18 12 Q20 10 22 12"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M2 18 Q6 14 10 18 Q14 22 18 18 Q20 16 22 18"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "5",
      r: "2.5"
    })),
    label: lang === 'pt' ? 'Piscinas' : lang === 'es' ? 'Piscinas' : 'Pools',
    sub: lang === 'pt' ? 'Piscinas avulsas' : lang === 'es' ? 'Piscinas sueltas' : 'Individual pools',
    count: allPools.length
  }].map(tab => {
    const on = routeSub === tab.id;
    return /*#__PURE__*/React.createElement("button", {
      key: tab.id,
      onClick: () => {
        setRouteSub(tab.id);
        setRouteRegion('all');
        setRoutePrice('all');
        setPoolPrice('all');
      },
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '11px 12px',
        borderRadius: 12,
        border: on ? 'none' : '1px solid var(--pg-ink-200)',
        cursor: 'pointer',
        fontFamily: 'inherit',
        textAlign: 'left',
        background: on ? 'var(--pg-blue-500)' : 'var(--pg-white)',
        boxShadow: on ? '0 4px 12px rgba(0,119,182,0.25)' : 'none',
        transition: 'all .15s ease'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 34,
        height: 34,
        borderRadius: 9,
        flexShrink: 0,
        background: on ? 'rgba(255,255,255,0.20)' : 'var(--pg-blue-50)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, tab.icon(17, on ? '#fff' : 'var(--pg-blue-700)')), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 14,
        fontWeight: 700,
        color: on ? '#fff' : 'var(--pg-ink-900)',
        letterSpacing: '-0.01em'
      }
    }, tab.label), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        fontWeight: 700,
        padding: '1px 6px',
        borderRadius: 999,
        background: on ? 'rgba(255,255,255,0.22)' : 'var(--pg-ink-100)',
        color: on ? '#fff' : 'var(--pg-ink-500)'
      }
    }, tab.count)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10.5,
        color: on ? 'rgba(255,255,255,0.70)' : 'var(--pg-ink-400)',
        marginTop: 2
      }
    }, tab.sub)));
  })), /*#__PURE__*/React.createElement("div", {
    className: "pg-card",
    style: {
      padding: '12px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, routeSub === 'routes' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.07em',
      color: 'var(--pg-ink-400)',
      marginBottom: 6
    }
  }, lang === 'pt' ? 'PREÇO DE VENDA' : lang === 'es' ? 'PRECIO DE VENTA' : 'ASKING PRICE'), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 7,
      flexWrap: 'wrap'
    }
  }, [{
    id: 'all',
    label: lang === 'pt' ? 'Qualquer' : lang === 'es' ? 'Cualquier' : 'Any'
  }, {
    id: 'u5k',
    label: '< $5K'
  }, {
    id: '5k-8k',
    label: '$5K – $8K'
  }, {
    id: 'o8k',
    label: '$8K+'
  }].map(opt => {
    const on = routePrice === opt.id;
    return /*#__PURE__*/React.createElement("button", {
      key: opt.id,
      onClick: () => setRoutePrice(opt.id),
      style: {
        padding: '5px 11px',
        borderRadius: 8,
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 12,
        fontWeight: 600,
        transition: 'all .12s',
        background: on ? 'var(--pg-blue-500)' : 'var(--pg-ink-100)',
        color: on ? '#fff' : 'var(--pg-ink-700)',
        boxShadow: on ? '0 2px 6px rgba(0,119,182,0.25)' : 'none'
      }
    }, opt.label);
  }))), routeSub === 'pools' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.07em',
      color: 'var(--pg-ink-400)',
      marginBottom: 6
    }
  }, lang === 'pt' ? 'PREÇO DE VENDA' : lang === 'es' ? 'PRECIO DE VENTA' : 'ASKING PRICE'), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 7,
      flexWrap: 'wrap'
    }
  }, [{
    id: 'all',
    label: lang === 'pt' ? 'Qualquer' : lang === 'es' ? 'Cualquier' : 'Any'
  }, {
    id: 'u1500',
    label: '< $1.5K'
  }, {
    id: '1500-3k',
    label: '$1.5K – $3K'
  }, {
    id: 'o3k',
    label: '$3K+'
  }].map(opt => {
    const on = poolPrice === opt.id;
    return /*#__PURE__*/React.createElement("button", {
      key: opt.id,
      onClick: () => setPoolPrice(opt.id),
      style: {
        padding: '5px 11px',
        borderRadius: 8,
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 12,
        fontWeight: 600,
        transition: 'all .12s',
        background: on ? 'var(--pg-blue-500)' : 'var(--pg-ink-100)',
        color: on ? '#fff' : 'var(--pg-ink-700)',
        boxShadow: on ? '0 2px 6px rgba(0,119,182,0.25)' : 'none'
      }
    }, opt.label);
  }))), (routePrice !== 'all' || poolPrice !== 'all') && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 8,
      borderTop: '0.5px solid var(--pg-ink-200)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      color: 'var(--pg-blue-600)',
      fontWeight: 600
    }
  }, list.length, " ", routeSub === 'pools' ? lang === 'pt' ? 'piscina(s) encontrada(s)' : lang === 'es' ? 'piscina(s) encontrada(s)' : 'pool(s) found' : lang === 'pt' ? 'rota(s) encontrada(s)' : lang === 'es' ? 'ruta(s) encontrada(s)' : 'route(s) found'), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setRoutePrice('all');
      setPoolPrice('all');
    },
    style: {
      border: 'none',
      background: 'var(--pg-ink-100)',
      borderRadius: 6,
      fontSize: 11,
      fontWeight: 600,
      color: 'var(--pg-ink-600)',
      cursor: 'pointer',
      padding: '4px 9px',
      fontFamily: 'inherit'
    }
  }, lang === 'pt' ? 'Limpar' : lang === 'es' ? 'Limpiar' : 'Clear'))), list.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '28px 16px',
      color: 'var(--pg-ink-400)',
      fontSize: 13,
      lineHeight: 1.5
    }
  }, routeSub === 'pools' ? lang === 'pt' ? 'Nenhuma piscina com esses filtros' : lang === 'es' ? 'Sin piscinas con estos filtros' : 'No pools match these filters' : lang === 'pt' ? 'Nenhuma rota com esses filtros' : lang === 'es' ? 'Sin rutas con estos filtros' : 'No routes match these filters'), routeSub === 'routes' && list.map(r => /*#__PURE__*/React.createElement("div", {
    key: r.id || r._liveId,
    className: "pg-card pg-card-tap",
    onClick: () => {
      if (r._live) {
        const m = liveMarket.find(x => x._id === r._liveId);
        if (m) {
          if (isMyPost(m)) {
            setMyPostDetail(m);
            return;
          }
          if (m.status === 'sold') {
            return;
          }
          openListing(m);
        }
      } else {
        setSelected({
          ...r,
          _type: 'route'
        });
        window.history.pushState({
          pgRoute: r.id
        }, '', '?listing=route-' + r.id);
      }
    },
    style: {
      padding: 14,
      display: 'flex',
      gap: 12,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 90,
      height: 90,
      borderRadius: 12,
      overflow: 'hidden',
      flexShrink: 0,
      background: 'linear-gradient(135deg,var(--pg-blue-100) 0%,var(--pg-blue-50) 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 3
    }
  }, r.photoUrls && r.photoUrls[0] || r.photoUrl ? /*#__PURE__*/React.createElement("img", {
    src: r.photoUrls && r.photoUrls[0] || r.photoUrl,
    alt: r.name,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }) : /*#__PURE__*/React.createElement(React.Fragment, null, Icon.pin(20, 'var(--pg-blue-600)'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--pg-font-display)',
      fontSize: 24,
      fontWeight: 800,
      color: 'var(--pg-blue-600)',
      lineHeight: 1
    }
  }, r.clients || r.pools || '?'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      fontWeight: 700,
      color: 'var(--pg-blue-700)',
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      opacity: 0.75
    }
  }, "POOLS"))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginBottom: 3
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "pg-badge",
    style: {
      background: 'var(--pg-blue-100)',
      color: 'var(--pg-blue-700)',
      fontSize: 9
    }
  }, "ROTA"), r._live && r.status === 'pending' && /*#__PURE__*/React.createElement("span", {
    className: "pg-badge",
    style: {
      background: '#FEF9C3',
      color: '#854D0E',
      fontSize: 9
    }
  }, "\u23F3 PENDENTE"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--pg-ink-400)',
      fontWeight: 500
    }
  }, r.clients, " ", t.poolsWord)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.25
    }
  }, tr(r.name, lang)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      marginTop: 5,
      flexWrap: 'wrap'
    }
  }, r.revenue && /*#__PURE__*/React.createElement("span", {
    className: "pg-chip pg-chip-aqua",
    style: {
      padding: '3px 8px',
      fontSize: 11
    }
  }, tr(r.revenue, lang)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--pg-ink-500)'
    }
  }, r.area)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: 'var(--pg-ink-400)'
    }
  }, t.asking), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--pg-font-display)',
      fontSize: 20,
      fontWeight: 700,
      color: 'var(--pg-blue-500)',
      letterSpacing: '-0.02em'
    }
  }, "$", fmtN(r.est || 0, lang))), !isMyPost(liveMarket.find(x => x._id === r._liveId) || {}) && /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      if (r._live && r._authorId) {
        openChat({
          id: r._authorId,
          name: r._author || 'Seller',
          listingId: r._liveId || null,
          listingContext: {
            name: tr(r.name, lang),
            photoUrl: r.photoUrls && r.photoUrls[0] || r.photoUrl || null,
            price: r.est,
            priceMode: 'fixed',
            type: 'route'
          }
        });
      } else {
        openChat && openChat();
      }
    },
    className: "pg-btn pg-btn-primary",
    style: {
      height: 34,
      padding: '0 14px',
      fontSize: 13
    }
  }, t.contact))), r._live && (user.role === 'admin' || isMyPost(liveMarket.find(x => x._id === r._liveId) || {})) && /*#__PURE__*/React.createElement("button", {
    onClick: async e => {
      e.stopPropagation();
      if (!window.confirm(lang === 'pt' ? `Excluir "${r.name}"?` : `Delete "${r.name}"?`)) return;
      const {
        error
      } = await window.sb.from('marketplace').delete().eq('id', r._liveId);
      if (error) {
        showToast && showToast('❌ ' + error.message);
        return;
      }
      showToast && showToast(lang === 'pt' ? '🗑️ Rota excluída' : '🗑️ Route deleted');
      if (ctx && ctx.removeMarketItem) ctx.removeMarketItem(r._liveId);
    },
    style: {
      position: 'absolute',
      top: 10,
      right: 10,
      width: 28,
      height: 28,
      borderRadius: 7,
      background: 'rgba(239,68,68,0.08)',
      border: '1px solid rgba(239,68,68,0.22)',
      color: '#EF4444',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "3 6 5 6 21 6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
  }))))), routeSub === 'pools' && list.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.id || p._liveId,
    className: "pg-card pg-card-tap",
    onClick: () => {
      if (p._live) {
        const m = liveMarket.find(x => x._id === p._liveId);
        if (m) {
          if (isMyPost(m)) {
            setMyPostDetail(m);
          } else {
            openListing(m);
          }
          return;
        }
      }
      setSelected({
        ...p,
        _type: 'pool'
      });
      window.history.pushState({
        pgPool: p.id
      }, '', '?listing=pool-' + p.id);
    },
    style: {
      padding: 0,
      overflow: 'hidden',
      position: 'relative',
      opacity: p.status === 'pending' ? 0.75 : 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      padding: '13px 14px'
    }
  }, p.photoUrl || p.photoUrls && p.photoUrls[0] ? /*#__PURE__*/React.createElement("div", {
    style: {
      width: 82,
      height: 82,
      borderRadius: 12,
      overflow: 'hidden',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: p.photoUrl || p.photoUrls[0],
    alt: "",
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  })) : /*#__PURE__*/React.createElement("div", {
    style: {
      width: 82,
      height: 82,
      borderRadius: 12,
      overflow: 'hidden',
      flexShrink: 0,
      background: 'linear-gradient(135deg, var(--pg-blue-100) 0%, var(--pg-blue-50) 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "28",
    height: "28",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--pg-blue-600)",
    strokeWidth: "1.8",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2 12 Q6 8 10 12 Q14 16 18 12 Q20 10 22 12"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M2 18 Q6 14 10 18 Q14 22 18 18 Q20 16 22 18"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "5",
    r: "2.5"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--pg-font-display)',
      fontSize: 16,
      fontWeight: 800,
      color: 'var(--pg-blue-600)',
      lineHeight: 1
    }
  }, p.pools), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      color: 'var(--pg-blue-700)',
      fontWeight: 600,
      letterSpacing: '0.03em',
      opacity: 0.75
    }
  }, p.pools === 1 ? lang === 'pt' ? 'PISCINA' : lang === 'es' ? 'PISCINA' : 'POOL' : lang === 'pt' ? 'PISCINAS' : lang === 'es' ? 'PISCINAS' : 'POOLS')), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginBottom: 3
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "pg-badge",
    style: {
      background: 'var(--pg-blue-100)',
      color: 'var(--pg-blue-700)',
      fontSize: 9
    }
  }, p.poolKind === 'condo' ? 'CONDO' : lang === 'pt' ? 'CASA' : lang === 'es' ? 'CASA' : 'HOUSE'), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--pg-ink-400)'
    }
  }, p.area)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.25,
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    }
  }, tr(p.name, lang)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'center',
      marginTop: 5,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "pg-chip",
    style: {
      padding: '3px 8px',
      fontSize: 11,
      background: 'var(--pg-blue-50)',
      color: 'var(--pg-blue-700)',
      borderColor: 'var(--pg-blue-100)'
    }
  }, tr(p.revenue, lang))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      marginTop: 7
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: 'var(--pg-ink-400)'
    }
  }, t.asking), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--pg-font-display)',
      fontSize: 20,
      fontWeight: 700,
      color: 'var(--pg-blue-500)',
      letterSpacing: '-0.02em'
    }
  }, "$", fmtN(p.est, lang))), !isMyPost(liveMarket.find(x => x._id === p._liveId) || {}) && /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      const m = liveMarket.find(x => x._id === p._liveId);
      if (m && m.author_id) openChat({
        id: m.author_id,
        name: m.author || 'Seller',
        listingId: p._liveId || null,
        listingContext: {
          name: p.name,
          photoUrl: p.photoUrls && p.photoUrls[0] || p.photoUrl || null,
          price: p.est,
          priceMode: 'fixed',
          type: 'pool'
        }
      });else openChat && openChat();
    },
    className: "pg-btn pg-btn-primary",
    style: {
      height: 34,
      padding: '0 14px',
      fontSize: 13
    }
  }, t.contact)))), p.desc ? /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '0.5px solid var(--pg-ink-100)',
      padding: '9px 14px',
      fontSize: 12,
      color: 'var(--pg-ink-500)',
      lineHeight: 1.45,
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    }
  }, tr(p.desc, lang)) : null, p._live && (user.role === 'admin' || isMyPost(liveMarket.find(x => x._id === p._liveId) || {})) && /*#__PURE__*/React.createElement("button", {
    onClick: async e => {
      e.stopPropagation();
      if (!window.confirm(lang === 'pt' ? `Excluir "${p.name}"?` : `Delete "${p.name}"?`)) return;
      const {
        error
      } = await window.sb.from('marketplace').delete().eq('id', p._liveId);
      if (error) {
        showToast && showToast('❌ ' + error.message);
        return;
      }
      showToast && showToast(lang === 'pt' ? '🗑️ Piscina excluída' : '🗑️ Pool deleted');
      if (ctx && ctx.removeMarketItem) ctx.removeMarketItem(p._liveId);
    },
    style: {
      position: 'absolute',
      top: 10,
      right: 10,
      width: 28,
      height: 28,
      borderRadius: 7,
      background: 'rgba(239,68,68,0.08)',
      border: '1px solid rgba(239,68,68,0.22)',
      color: '#EF4444',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "3 6 5 6 21 6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
  })))))))), viewListing && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 200,
      overflowY: 'auto',
      background: 'var(--pg-bg)',
      animation: 'pg-fade-in 0.18s ease'
    }
  }, /*#__PURE__*/React.createElement(ViewListingSheet, {
    item: viewListing,
    lang: lang,
    openChat: openChat,
    openPublicProfile: openPublicProfile,
    onClose: closeListing,
    isAdmin: user.role === 'admin',
    canDelete: user.role === 'admin' || !!(user.uid && viewListing.author_id && user.uid === viewListing.author_id),
    onEdit: isMyPost(viewListing) ? () => setMyPostDetail(viewListing) : undefined,
    currentUser: user,
    showToast: showToast,
    isSaved: savedIds.has(viewListing._id),
    onToggleSave: () => toggleSave(null, viewListing._id),
    onShare: () => handleShare(null, viewListing),
    liveMarket: liveMarket,
    onOpenListing: openListing,
    onAfterSold: sellerRating => {
      // Update liveMarket immediately (realtime subscription is stubbed)
      if (ctx && ctx.updateMarketItem && viewListing) ctx.updateMarketItem(viewListing._id, {
        status: 'sold'
      });
      setViewListing(prev => prev ? {
        ...prev,
        status: 'sold'
      } : null);
      setTimeout(() => {
        setViewListing(null);
        if (sellerRating && openRating) {
          openRating(sellerRating);
        } else if (loadPendingRatings) {
          loadPendingRatings();
        }
      }, 280);
    },
    onDeleted: id => {
      closeListing();
      setSavedIds(prev => {
        const s = new Set(prev);
        s.delete(id);
        return s;
      });
      if (ctx && ctx.removeMarketItem) ctx.removeMarketItem(id);
    }
  })), shareItem && /*#__PURE__*/React.createElement(ShareSheet, {
    item: shareItem,
    lang: lang,
    onClose: () => setShareItem(null),
    showToast: showToast
  }), /*#__PURE__*/React.createElement(FullPage, {
    open: !!myPostDetail,
    onClose: () => setMyPostDetail(null)
  }, myPostDetail && /*#__PURE__*/React.createElement(MyPostDetailSheet, {
    item: myPostDetail,
    lang: lang,
    onClose: () => setMyPostDetail(null),
    showToast: showToast,
    currentUser: user,
    openRating: openRating,
    onUpdated: updated => {
      setMyPostDetail(null);
      if (ctx.liveMarket) ctx.liveMarket.splice(0); // will re-fetch via realtime
    },
    onDeleted: id => {
      setMyPostDetail(null);
      if (ctx && ctx.removeMarketItem) ctx.removeMarketItem(id);
    }
  })), selected && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 200,
      background: 'var(--pg-bg)',
      animation: 'pg-fade-in 0.18s ease'
    }
  }, /*#__PURE__*/React.createElement(ListingDetail, {
    selected: selected,
    lang: lang,
    t: t,
    catLabels: catLabels,
    openChat: openChat,
    onClose: () => {
      setSelected(null);
      if (window.location.search.includes('listing=route-') || window.location.search.includes('listing=pool-')) window.history.back();
    },
    openPublicProfile: openPublicProfile
  })), /*#__PURE__*/React.createElement(Sheet, {
    open: postOpen && !postMode,
    onClose: () => setPostOpen(false),
    height: "auto"
  }, /*#__PURE__*/React.createElement(MarketplaceListingPicker, {
    lang: lang,
    t: t,
    currentView: view,
    onPick: mode => {
      setPostMode(mode);
    },
    onClose: () => setPostOpen(false)
  })), /*#__PURE__*/React.createElement(FullPage, {
    open: postOpen && (postMode === 'sell' || postMode === 'rent'),
    onClose: () => {
      setPostMode(null);
      setPostOpen(false);
    }
  }, /*#__PURE__*/React.createElement(PostEquipmentSheet, {
    lang: lang,
    t: t,
    mode: postMode,
    onClose: () => {
      setPostMode(null);
      setPostOpen(false);
    },
    onSubmit: async data => {
      const mode = postMode;
      setPostMode(null);
      setPostOpen(false);
      if (data && dbWrite) {
        const ok = await dbWrite('marketplace', data);
        if (ok !== false) {
          setView(mode === 'rent' ? 'rent' : 'buy');
          if (showToast) showToast(lang === 'pt' ? '✓ Anúncio enviado para revisão' : lang === 'es' ? '✓ Anuncio enviado a revisión' : '✓ Listing sent for review');
        }
      }
    }
  })), /*#__PURE__*/React.createElement(FullPage, {
    open: postOpen && postMode === 'route',
    onClose: () => {
      setPostMode(null);
      setPostOpen(false);
    }
  }, /*#__PURE__*/React.createElement(PostRouteSheet, {
    lang: lang,
    t: t,
    onClose: () => {
      setPostMode(null);
      setPostOpen(false);
    },
    onSubmit: async data => {
      setPostMode(null);
      setPostOpen(false);
      if (data && dbWrite) {
        const ok = await dbWrite('marketplace', data);
        if (ok !== false) {
          setView('routes');
          setRouteSub('routes');
          if (showToast) showToast(lang === 'pt' ? '✓ Rota enviada para revisão' : lang === 'es' ? '✓ Ruta enviada a revisión' : '✓ Route sent for review');
        }
      }
    }
  })), /*#__PURE__*/React.createElement(FullPage, {
    open: postOpen && postMode === 'pool',
    onClose: () => {
      setPostMode(null);
      setPostOpen(false);
    }
  }, /*#__PURE__*/React.createElement(PostPoolSheet, {
    lang: lang,
    t: t,
    onClose: () => {
      setPostMode(null);
      setPostOpen(false);
    },
    onSubmit: async data => {
      setPostMode(null);
      setPostOpen(false);
      if (data && dbWrite) {
        const ok = await dbWrite('marketplace', data);
        if (ok !== false) {
          setView('routes');
          setRouteSub('pools');
          if (showToast) showToast(lang === 'pt' ? '✓ Piscina enviada para revisão' : lang === 'es' ? '✓ Piscina enviada a revisión' : '✓ Pool sent for review');
        }
      }
    }
  })));
}

// ── Marketplace listing type picker ──────────────────────────
function MarketplaceListingPicker({
  lang,
  t,
  currentView,
  onPick,
  onClose
}) {
  const options = [{
    id: 'sell',
    icon: Icon.cart,
    title: t.pmSellEq,
    sub: t.pmSellEqSub,
    badge: lang === 'pt' ? 'Vender' : lang === 'es' ? 'Vender' : 'Sell',
    badgeColor: 'var(--pg-blue-500)'
  }, {
    id: 'rent',
    icon: Icon.key,
    title: t.pmRentEq,
    sub: t.pmRentEqSub,
    badge: lang === 'pt' ? 'Alugar' : lang === 'es' ? 'Rentar' : 'Rent',
    badgeColor: 'var(--pg-aqua-700)'
  }, {
    id: 'route',
    icon: Icon.pin,
    title: t.pmSellRoute,
    sub: t.pmSellRouteSub,
    badge: lang === 'pt' ? 'Rota (5+)' : lang === 'es' ? 'Ruta (5+)' : 'Route (5+)',
    badgeColor: 'oklch(0.50 0.16 245)'
  }, {
    id: 'pool',
    icon: (s, c) => /*#__PURE__*/React.createElement("svg", {
      width: s,
      height: s,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: c,
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M2 12 Q6 8 10 12 Q14 16 18 12 Q20 10 22 12"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M2 18 Q6 14 10 18 Q14 22 18 18 Q20 16 22 18"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "5",
      r: "2.5"
    })),
    title: lang === 'pt' ? 'Vender piscina avulsa' : lang === 'es' ? 'Vender piscina suelta' : 'Sell single pool(s)',
    sub: lang === 'pt' ? 'Piscina residencial ou de condomínio' : lang === 'es' ? 'Piscina residencial o de cond.' : 'Residential or condo pool',
    badge: lang === 'pt' ? 'Piscina' : lang === 'es' ? 'Piscina' : 'Pool',
    badgeColor: 'var(--pg-aqua-700)'
  }];
  const headLbl = lang === 'pt' ? 'Novo anúncio' : lang === 'es' ? 'Nuevo anuncio' : 'New listing';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '6px 18px 30px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 19,
      fontWeight: 700,
      letterSpacing: '-0.02em'
    }
  }, headLbl), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '3px 0 0',
      fontSize: 12,
      color: 'var(--pg-ink-500)'
    }
  }, t.whatToList)), /*#__PURE__*/React.createElement("button", {
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
      justifyContent: 'center',
      flexShrink: 0
    }
  }, Icon.x(16, 'var(--pg-ink-700)'))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, options.map(opt => /*#__PURE__*/React.createElement("button", {
    key: opt.id,
    onClick: () => onPick(opt.id),
    className: "pg-press",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '14px 16px',
      border: '1px solid var(--pg-ink-150, var(--pg-ink-200))',
      borderRadius: 14,
      background: 'var(--pg-white)',
      cursor: 'pointer',
      fontFamily: 'inherit',
      textAlign: 'left',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 46,
      height: 46,
      borderRadius: 12,
      flexShrink: 0,
      background: `${opt.badgeColor}18`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, opt.icon(22, opt.badgeColor)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      letterSpacing: '-0.015em',
      color: 'var(--pg-ink-900)'
    }
  }, opt.title), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      padding: '2px 7px',
      borderRadius: 6,
      background: `${opt.badgeColor}18`,
      color: opt.badgeColor,
      letterSpacing: '0.03em'
    }
  }, opt.badge)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: 'var(--pg-ink-500)',
      marginTop: 2
    }
  }, opt.sub)), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--pg-ink-300)'
    }
  }, Icon.chev(18, 'var(--pg-ink-400)'))))));
}

// PhotoPicker is defined globally in components.jsx (loaded first).
// ── REMOVED duplicate PhotoPicker — using global from components.jsx ──
function _PhotoPickerUnused({
  photos,
  onAdd,
  onRemove,
  max = 5,
  lang,
  title
}) {
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const camRef = React.useRef(null);
  const galRef = React.useRef(null);
  const titleLbl = title || (lang === 'pt' ? 'Fotos' : lang === 'es' ? 'Fotos' : 'Photos');
  const hintLbl = lang === 'pt' ? `Até ${max} fotos · a primeira é a capa` : lang === 'es' ? `Hasta ${max} fotos · la primera es la portada` : `Up to ${max} photos · first is the cover`;
  const canAdd = photos.length < max;

  // Compress image to max 1200px wide, JPEG 0.78 quality
  const compress = file => new Promise(resolve => {
    const img = new Image();
    const src = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 1200;
      let w = img.width,
        h = img.height;
      if (w > MAX || h > MAX) {
        if (w >= h) {
          h = Math.round(h * MAX / w);
          w = MAX;
        } else {
          w = Math.round(w * MAX / h);
          h = MAX;
        }
      }
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(src);
      c.toBlob(b => resolve(b), 'image/jpeg', 0.78);
    };
    img.src = src;
  });
  const handleFile = async e => {
    const file = e.target.files && e.target.files[0];
    e.target.value = ''; // reset so same file can be picked again
    if (!file || !canAdd) return;
    setPickerOpen(false);
    setUploading(true);
    try {
      const blob = await compress(file);
      let url = null;

      // Try Supabase Storage first
      if (window.sb && window.sb.storage) {
        const path = 'posts/' + Date.now() + '-' + Math.random().toString(36).slice(2) + '.jpg';
        const {
          data,
          error
        } = await window.sb.storage.from('post-images').upload(path, blob, {
          contentType: 'image/jpeg'
        });
        if (!error && data) {
          const {
            data: ud
          } = window.sb.storage.from('post-images').getPublicUrl(path);
          url = ud.publicUrl;
        }
      }

      // Fallback: local data URL (works always, stored in DB as base64)
      if (!url) {
        url = await new Promise(res => {
          const r = new FileReader();
          r.onload = ev => res(ev.target.result);
          r.readAsDataURL(blob);
        });
      }
      onAdd(url);
    } catch (err) {
      console.warn('[PhotoPicker] upload error:', err);
    } finally {
      setUploading(false);
    }
  };
  const SZ = 88;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: 'var(--pg-ink-900)'
    }
  }, titleLbl), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--pg-ink-400)',
      marginTop: 2
    }
  }, hintLbl)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      padding: '3px 9px',
      borderRadius: 6,
      background: photos.length === max ? 'var(--pg-blue-500)' : 'var(--pg-ink-100)',
      color: photos.length === max ? '#fff' : 'var(--pg-ink-500)'
    }
  }, photos.length, "/", max)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      overflowX: 'auto',
      paddingBottom: 4,
      scrollbarWidth: 'none'
    }
  }, photos.map((url, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      position: 'relative',
      flexShrink: 0,
      width: SZ,
      height: SZ
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: url,
    alt: "",
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      borderRadius: 10,
      display: 'block'
    }
  }), i === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'linear-gradient(transparent,rgba(0,0,0,0.6))',
      borderRadius: '0 0 10px 10px',
      fontSize: 8,
      fontWeight: 700,
      color: '#fff',
      textAlign: 'center',
      letterSpacing: '0.07em',
      padding: '3px 0 5px'
    }
  }, lang === 'pt' ? 'CAPA' : lang === 'es' ? 'PORTADA' : 'COVER'), /*#__PURE__*/React.createElement("button", {
    onClick: () => onRemove(url),
    style: {
      position: 'absolute',
      top: -6,
      right: -6,
      width: 22,
      height: 22,
      borderRadius: '50%',
      background: 'var(--pg-danger,#ff3b30)',
      border: '2.5px solid #fff',
      cursor: 'pointer',
      padding: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, Icon.x(9, '#fff')))), canAdd && !uploading && /*#__PURE__*/React.createElement("button", {
    onClick: () => setPickerOpen(true),
    style: {
      flexShrink: 0,
      width: SZ,
      height: SZ,
      borderRadius: 10,
      cursor: 'pointer',
      border: '2px dashed var(--pg-ink-300)',
      background: 'var(--pg-ink-50,#f7f9fb)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 24
    }
  }, "\uD83D\uDCF7"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9.5,
      color: 'var(--pg-ink-400)',
      fontWeight: 600
    }
  }, lang === 'pt' ? 'Adicionar' : lang === 'es' ? 'Agregar' : 'Add')), uploading && /*#__PURE__*/React.createElement("div", {
    style: {
      flexShrink: 0,
      width: SZ,
      height: SZ,
      borderRadius: 10,
      background: 'var(--pg-ink-100)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 22,
      animation: 'spin 1s linear infinite'
    }
  }, "\u23F3"))), pickerOpen && /*#__PURE__*/React.createElement("div", {
    onClick: () => setPickerOpen(false),
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.45)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      background: 'var(--pg-white)',
      borderRadius: '20px 20px 0 0',
      padding: '16px 16px 32px',
      width: '100%',
      maxWidth: 480,
      boxShadow: '0 -8px 40px rgba(0,0,0,0.18)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 4,
      borderRadius: 2,
      background: 'var(--pg-ink-200)',
      margin: '0 auto 18px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 18,
      color: 'var(--pg-ink-900)'
    }
  }, lang === 'pt' ? 'Adicionar foto' : lang === 'es' ? 'Agregar foto' : 'Add photo'), /*#__PURE__*/React.createElement("button", {
    onClick: () => camRef.current && camRef.current.click(),
    style: {
      width: '100%',
      padding: '15px 18px',
      marginBottom: 10,
      borderRadius: 14,
      border: '1.5px solid var(--pg-ink-200)',
      background: 'var(--pg-white)',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      cursor: 'pointer',
      fontFamily: 'inherit'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 28
    }
  }, "\uD83D\uDCF7"), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 15,
      color: 'var(--pg-ink-900)'
    }
  }, lang === 'pt' ? 'Tirar foto' : lang === 'es' ? 'Tomar foto' : 'Take photo'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--pg-ink-500)',
      marginTop: 2
    }
  }, lang === 'pt' ? 'Usar câmera do celular' : lang === 'es' ? 'Usar cámara del celular' : 'Use your phone camera'))), /*#__PURE__*/React.createElement("button", {
    onClick: () => galRef.current && galRef.current.click(),
    style: {
      width: '100%',
      padding: '15px 18px',
      marginBottom: 16,
      borderRadius: 14,
      border: '1.5px solid var(--pg-ink-200)',
      background: 'var(--pg-white)',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      cursor: 'pointer',
      fontFamily: 'inherit'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 28
    }
  }, "\uD83D\uDDBC\uFE0F"), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 15,
      color: 'var(--pg-ink-900)'
    }
  }, lang === 'pt' ? 'Escolher da galeria' : lang === 'es' ? 'Elegir de la galería' : 'Choose from gallery'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--pg-ink-500)',
      marginTop: 2
    }
  }, lang === 'pt' ? 'Acessar fotos salvas' : lang === 'es' ? 'Acceder a fotos guardadas' : 'Access saved photos'))), /*#__PURE__*/React.createElement("button", {
    onClick: () => setPickerOpen(false),
    style: {
      width: '100%',
      padding: '14px',
      borderRadius: 14,
      border: 'none',
      background: 'var(--pg-ink-100)',
      color: 'var(--pg-ink-700)',
      fontWeight: 600,
      fontSize: 15,
      cursor: 'pointer',
      fontFamily: 'inherit'
    }
  }, lang === 'pt' ? 'Cancelar' : lang === 'es' ? 'Cancelar' : 'Cancel'))), /*#__PURE__*/React.createElement("input", {
    ref: camRef,
    type: "file",
    accept: "image/*",
    capture: "environment",
    style: {
      display: 'none',
      position: 'absolute'
    },
    onChange: handleFile
  }), /*#__PURE__*/React.createElement("input", {
    ref: galRef,
    type: "file",
    accept: "image/*",
    style: {
      display: 'none',
      position: 'absolute'
    },
    onChange: handleFile
  }));
}

// ── Photo carousel in item detail sheet ──────────────────────
function ItemPhotoCarousel({
  category,
  height = 220
}) {
  const [idx, setIdx] = React.useState(0);
  const kw = {
    Pumps: 'pool,pump',
    Filters: 'pool,filter',
    Vacuum: 'pool,vacuum',
    Heaters: 'pool,heater',
    Tools: 'pool,maintenance',
    Routes: 'swimming,pool'
  }[category] || 'pool,equipment';

  // 3 deterministic photos for the detail view
  const photos = [1, 11, 21].map(n => `https://loremflickr.com/800/500/${kw}?lock=${n}`);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height,
      overflow: 'hidden',
      background: 'var(--pg-ink-200)',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("img", {
    key: photos[idx],
    src: photos[idx],
    alt: category,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 12,
      right: 12,
      background: 'rgba(0,0,0,0.45)',
      borderRadius: 999,
      padding: '3px 10px',
      fontSize: 11,
      fontWeight: 700,
      color: '#fff'
    }
  }, idx + 1, " / ", photos.length), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 10,
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'center',
      gap: 5
    }
  }, photos.map((_, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    onMouseDown: () => setIdx(i),
    style: {
      width: i === idx ? 18 : 6,
      height: 6,
      borderRadius: 3,
      background: i === idx ? '#fff' : 'rgba(255,255,255,0.5)',
      border: 'none',
      cursor: 'pointer',
      padding: 0,
      transition: 'all .18s ease'
    }
  }))), idx > 0 && /*#__PURE__*/React.createElement("button", {
    onClick: () => setIdx(i => i - 1),
    style: {
      position: 'absolute',
      left: 10,
      top: '50%',
      transform: 'translateY(-50%)',
      width: 34,
      height: 34,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.88)',
      border: 'none',
      cursor: 'pointer',
      fontSize: 20,
      fontWeight: 700,
      lineHeight: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    }
  }, '‹'), idx < photos.length - 1 && /*#__PURE__*/React.createElement("button", {
    onClick: () => setIdx(i => i + 1),
    style: {
      position: 'absolute',
      right: 10,
      top: '50%',
      transform: 'translateY(-50%)',
      width: 34,
      height: 34,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.88)',
      border: 'none',
      cursor: 'pointer',
      fontSize: 20,
      fontWeight: 700,
      lineHeight: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    }
  }, '›'));
}

// ── Listing detail — handles equipment, route and pool types ──
function ListingDetail({
  selected,
  lang,
  t,
  catLabels,
  openChat,
  onClose,
  openPublicProfile
}) {
  const [offerOpen, setOfferOpen] = React.useState(false);
  const [offerAmt, setOfferAmt] = React.useState('');
  const [offerNote, setOfferNote] = React.useState('');
  const [offerSent, setOfferSent] = React.useState(false);

  // Pre-fill amount when offer panel opens
  const openOffer = () => {
    const defaultAmt = selected.est ? String(selected.est) : selected.price && selected.price !== 'neg' ? String(selected.price) : '';
    setOfferAmt(defaultAmt);
    setOfferNote('');
    setOfferSent(false);
    setOfferOpen(true);
  };
  const sendOffer = () => {
    setOfferSent(true);
    setTimeout(() => {
      setOfferOpen(false);
      setOfferSent(false);
      openChat && openChat('Sandra Reyes');
      // Listing stays open — chat opens on top
    }, 1400);
  };
  const sellerName = 'Sandra Reyes';

  // Offer panel rendered inline below seller row
  const OfferPanel = offerOpen && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      borderRadius: 16,
      overflow: 'hidden',
      border: '1.5px solid var(--pg-blue-200)',
      background: 'var(--pg-blue-50)'
    }
  }, offerSent ?
  /*#__PURE__*/
  /* ── Success state ── */
  React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
      padding: '22px 20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 46,
      height: 46,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #0EBAC7, #0077B6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 12px rgba(14,186,199,0.35)'
    }
  }, Icon.check(22, '#fff')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 14,
      color: 'var(--pg-ink-900)'
    }
  }, lang === 'pt' ? 'Oferta enviada!' : lang === 'es' ? '¡Oferta enviada!' : 'Offer sent!'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--pg-ink-500)',
      textAlign: 'center',
      lineHeight: 1.4
    }
  }, lang === 'pt' ? `Redirecionando para o chat com ${sellerName}…` : lang === 'es' ? `Redirigiendo al chat con ${sellerName}…` : `Redirecting to chat with ${sellerName}…`)) :
  /*#__PURE__*/
  /* ── Offer form ── */
  React.createElement("div", {
    style: {
      padding: '14px 16px 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: 'var(--pg-blue-700)'
    }
  }, lang === 'pt' ? '💰 Fazer uma oferta' : lang === 'es' ? '💰 Hacer una oferta' : '💰 Make an offer'), /*#__PURE__*/React.createElement("button", {
    onClick: () => setOfferOpen(false),
    style: {
      border: 'none',
      background: 'var(--pg-ink-100)',
      borderRadius: '50%',
      width: 24,
      height: 24,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, Icon.x(11, 'var(--pg-ink-600)'))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.07em',
      color: 'var(--pg-ink-500)',
      marginBottom: 5
    }
  }, lang === 'pt' ? 'VALOR DA OFERTA (USD)' : lang === 'es' ? 'VALOR DE LA OFERTA (USD)' : 'OFFER AMOUNT (USD)'), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: 12,
      top: '50%',
      transform: 'translateY(-50%)',
      fontSize: 16,
      fontWeight: 700,
      color: 'var(--pg-blue-500)',
      pointerEvents: 'none'
    }
  }, "$"), /*#__PURE__*/React.createElement("input", {
    className: "pg-field",
    type: "number",
    value: offerAmt,
    onChange: e => setOfferAmt(e.target.value),
    placeholder: "0",
    style: {
      height: 46,
      fontSize: 16,
      fontWeight: 700,
      paddingLeft: 26,
      color: 'var(--pg-blue-500)'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.07em',
      color: 'var(--pg-ink-500)',
      marginBottom: 5
    }
  }, lang === 'pt' ? 'MENSAGEM (OPCIONAL)' : lang === 'es' ? 'MENSAJE (OPCIONAL)' : 'MESSAGE (OPTIONAL)'), /*#__PURE__*/React.createElement("textarea", {
    className: "pg-textarea",
    value: offerNote,
    onChange: e => setOfferNote(e.target.value),
    placeholder: lang === 'pt' ? 'Ex: Tenho interesse, posso fechar rápido…' : lang === 'es' ? 'Ej: Estoy interesado, puedo cerrar rápido…' : 'E.g. I\'m very interested, can close quickly…',
    style: {
      minHeight: 64,
      fontSize: 13
    }
  })), /*#__PURE__*/React.createElement("button", {
    onClick: sendOffer,
    disabled: !offerAmt || Number(offerAmt) <= 0,
    className: "pg-btn pg-btn-primary",
    style: {
      width: '100%',
      height: 48,
      fontSize: 14,
      borderRadius: 12,
      background: offerAmt && Number(offerAmt) > 0 ? 'linear-gradient(135deg, #023EBA 0%, #0077B6 100%)' : 'var(--pg-ink-200)',
      color: offerAmt && Number(offerAmt) > 0 ? '#fff' : 'var(--pg-ink-400)',
      boxShadow: offerAmt && Number(offerAmt) > 0 ? '0 4px 14px rgba(0,119,182,0.35)' : 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8
    }
  }, Icon.msg(16, offerAmt && Number(offerAmt) > 0 ? '#fff' : 'var(--pg-ink-400)'), lang === 'pt' ? 'Enviar oferta via mensagem' : lang === 'es' ? 'Enviar oferta por mensaje' : 'Send offer via message')));
  const sellerProfile = {
    name: 'Sandra Reyes',
    rating: 4.8,
    reviews: 87,
    tier: 'pro',
    jobs: 87,
    loc: 'Broward County, FL'
  };
  const sellerRow = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "pg-divider",
    style: {
      margin: '16px 0'
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => openPublicProfile && openPublicProfile(sellerProfile),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      width: '100%',
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      textAlign: 'left',
      padding: 0,
      fontFamily: 'inherit'
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Sandra Reyes",
    size: 44
  }), /*#__PURE__*/React.createElement("div", {
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
  }, "Sandra Reyes"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 12,
      color: 'var(--pg-ink-500)'
    }
  }, /*#__PURE__*/React.createElement(Stars, {
    rating: 4.8,
    size: 11
  }), " 4.8 \xB7 87 ", lang === 'pt' ? 'transações' : lang === 'es' ? 'transacciones' : 'transactions')), /*#__PURE__*/React.createElement("span", {
    className: "pg-chip pg-chip-aqua",
    style: {
      fontSize: 11
    }
  }, t.verified)));

  // ── ROUTE ──────────────────────────────────────────────────────
  if (selected._type === 'route') {
    const routePhotos = selected.photoUrls && selected.photoUrls.length > 0 ? selected.photoUrls : selected.photoUrl ? [selected.photoUrl] : [];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }
    }, routePhotos.length > 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement(PhotoCarousel, {
      urls: routePhotos,
      fallbackCat: "Tools",
      height: 220
    }), /*#__PURE__*/React.createElement("button", {
      onClick: onClose,
      style: {
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 10,
        border: 'none',
        background: 'rgba(0,0,0,0.45)',
        width: 32,
        height: 32,
        borderRadius: '50%',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, Icon.x(14, '#fff'))) : /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        height: 190,
        flexShrink: 0,
        background: 'linear-gradient(135deg, #011B5A 0%, #023EBA 55%, #0077B6 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: onClose,
      style: {
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 2,
        border: 'none',
        background: 'rgba(255,255,255,0.15)',
        width: 30,
        height: 30,
        borderRadius: '50%',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, Icon.x(14, '#fff')), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 28,
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        color: '#fff'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--pg-font-display)',
        fontSize: 44,
        fontWeight: 800,
        lineHeight: 1,
        letterSpacing: '-0.02em'
      }
    }, selected.clients), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        opacity: 0.60,
        fontWeight: 600,
        marginTop: 4,
        letterSpacing: '0.04em'
      }
    }, lang === 'pt' ? 'PISCINAS' : lang === 'es' ? 'PISCINAS' : 'POOLS')), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 1,
        height: 52,
        background: 'rgba(255,255,255,0.20)'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        color: '#fff'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--pg-font-display)',
        fontSize: 22,
        fontWeight: 800,
        lineHeight: 1,
        letterSpacing: '-0.01em'
      }
    }, tr(selected.revenue, lang)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        opacity: 0.60,
        fontWeight: 600,
        marginTop: 4,
        letterSpacing: '0.04em'
      }
    }, lang === 'pt' ? 'RECEITA/MÊS' : lang === 'es' ? 'INGRESO/MES' : 'REVENUE/MO'))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        background: 'rgba(255,255,255,0.12)',
        border: '1px solid rgba(255,255,255,0.22)',
        borderRadius: 999,
        padding: '4px 12px'
      }
    }, Icon.pin(11, 'rgba(255,255,255,0.80)'), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 600,
        color: 'rgba(255,255,255,0.80)'
      }
    }, selected.area)), selected.address && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.65)',
        fontWeight: 500
      }
    }, selected.address))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflowY: 'auto',
        touchAction: 'pan-y',
        padding: '16px 18px 24px',
        display: 'flex',
        flexDirection: 'column'
      }
    }, routePhotos.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 10,
        paddingBottom: 14,
        marginBottom: 4,
        borderBottom: '0.5px solid var(--pg-ink-100)'
      }
    }, selected.clients && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '7px 12px',
        borderRadius: 10,
        background: 'var(--pg-blue-50)',
        border: '0.5px solid var(--pg-blue-100)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        color: 'var(--pg-blue-700)',
        letterSpacing: '0.04em'
      }
    }, lang === 'pt' ? 'PISCINAS' : lang === 'es' ? 'PISCINAS' : 'POOLS'), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 15,
        fontWeight: 800,
        color: 'var(--pg-blue-500)'
      }
    }, selected.clients)), selected.revenue && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '7px 12px',
        borderRadius: 10,
        background: 'var(--pg-aqua-100)',
        border: '0.5px solid var(--pg-aqua-400)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        color: 'var(--pg-aqua-700)',
        letterSpacing: '0.04em'
      }
    }, lang === 'pt' ? 'RECEITA/MÊS' : lang === 'es' ? 'INGRESO/MES' : 'REV/MO'), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: 'var(--pg-ink-900)'
      }
    }, tr(selected.revenue, lang))), selected.area && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        padding: '7px 12px',
        borderRadius: 10,
        background: 'var(--pg-ink-50,var(--pg-blue-50))',
        border: '0.5px solid var(--pg-ink-200)'
      }
    }, Icon.pin(11, 'var(--pg-ink-500)'), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--pg-ink-700)'
      }
    }, selected.area)), selected.address && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--pg-ink-500)',
        padding: '7px 0',
        alignSelf: 'center'
      }
    }, selected.address)), /*#__PURE__*/React.createElement("h2", {
      style: {
        margin: 0,
        fontFamily: 'var(--pg-font-display)',
        fontSize: 20,
        fontWeight: 700,
        letterSpacing: '-0.02em',
        lineHeight: 1.2
      }
    }, tr(selected.name, lang)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'baseline',
        gap: 8,
        marginTop: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        color: 'var(--pg-ink-400)',
        fontWeight: 700,
        letterSpacing: '0.06em'
      }
    }, t.asking.toUpperCase()), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--pg-font-display)',
        fontSize: 32,
        fontWeight: 700,
        color: 'var(--pg-blue-500)',
        letterSpacing: '-0.02em'
      }
    }, "$", fmtN(selected.est, lang))), sellerRow, OfferPanel, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 10,
        marginTop: 12
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: openChat,
      className: "pg-btn pg-btn-ghost",
      style: {
        flex: 1
      }
    }, Icon.msg(16, 'var(--pg-blue-700)'), " ", t.message), /*#__PURE__*/React.createElement("button", {
      onClick: openOffer,
      className: "pg-btn pg-btn-primary",
      style: {
        flex: 2
      }
    }, t.makeOffer))));
  }

  // ── SINGLE POOL ────────────────────────────────────────────────
  if (selected._type === 'pool') {
    const poolPhotos = selected.photoUrls && selected.photoUrls.length > 0 ? selected.photoUrls : selected.photoUrl ? [selected.photoUrl] : [];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }
    }, poolPhotos.length > 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement(PhotoCarousel, {
      urls: poolPhotos,
      fallbackCat: "Tools",
      height: 220
    }), /*#__PURE__*/React.createElement("button", {
      onClick: onClose,
      style: {
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 10,
        border: 'none',
        background: 'rgba(0,0,0,0.45)',
        width: 32,
        height: 32,
        borderRadius: '50%',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, Icon.x(14, '#fff'))) : /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        height: 180,
        flexShrink: 0,
        background: 'linear-gradient(135deg, #011B5A 0%, #023EBA 55%, #0077B6 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: onClose,
      style: {
        position: 'absolute',
        top: 12,
        right: 12,
        border: 'none',
        background: 'rgba(255,255,255,0.15)',
        width: 30,
        height: 30,
        borderRadius: '50%',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, Icon.x(14, '#fff')), /*#__PURE__*/React.createElement("svg", {
      width: "34",
      height: "34",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "rgba(255,255,255,0.90)",
      strokeWidth: "1.8",
      strokeLinecap: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M2 12 Q6 8 10 12 Q14 16 18 12 Q20 10 22 12"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M2 18 Q6 14 10 18 Q14 22 18 18 Q20 16 22 18"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "5",
      r: "2.5"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--pg-font-display)',
        fontSize: 54,
        fontWeight: 800,
        color: '#fff',
        lineHeight: 1,
        letterSpacing: '-0.02em'
      }
    }, selected.pools), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        color: 'rgba(255,255,255,0.65)',
        letterSpacing: '0.06em'
      }
    }, selected.pools === 1 ? lang === 'pt' ? 'PISCINA' : lang === 'es' ? 'PISCINA' : 'POOL' : lang === 'pt' ? 'PISCINAS' : lang === 'es' ? 'PISCINAS' : 'POOLS')), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflowY: 'auto',
        touchAction: 'pan-y',
        padding: '16px 18px 24px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "pg-badge",
      style: {
        background: 'var(--pg-blue-100)',
        color: 'var(--pg-blue-700)',
        fontSize: 9
      }
    }, selected.type === 'condo' ? 'CONDO' : lang === 'pt' ? 'RESIDENCIAL' : lang === 'es' ? 'RESIDENCIAL' : 'HOUSE'), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: 'var(--pg-ink-400)'
      }
    }, selected.area), selected.address && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: 'var(--pg-ink-400)'
      }
    }, " \xB7 ", selected.address)), /*#__PURE__*/React.createElement("h2", {
      style: {
        margin: 0,
        fontFamily: 'var(--pg-font-display)',
        fontSize: 20,
        fontWeight: 700,
        letterSpacing: '-0.02em',
        lineHeight: 1.2
      }
    }, tr(selected.name || selected.desc, lang)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'baseline',
        gap: 8,
        marginTop: 10,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        color: 'var(--pg-ink-400)',
        fontWeight: 700,
        letterSpacing: '0.06em'
      }
    }, t.asking.toUpperCase()), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--pg-font-display)',
        fontSize: 32,
        fontWeight: 700,
        color: 'var(--pg-blue-500)',
        letterSpacing: '-0.02em'
      }
    }, "$", fmtN(selected.est, lang)), /*#__PURE__*/React.createElement("span", {
      className: "pg-chip",
      style: {
        fontSize: 11,
        background: 'var(--pg-blue-50)',
        color: 'var(--pg-blue-700)',
        borderColor: 'var(--pg-blue-100)'
      }
    }, tr(selected.revenue, lang))), (selected.desc || selected.description) && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 12,
        fontSize: 13,
        lineHeight: 1.55,
        color: 'var(--pg-ink-600)'
      }
    }, tr(selected.desc || selected.description, lang)), (selected.system || selected.sizeFt || selected.gallons || selected.freq || selected.warranty) && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 14,
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }
    }, (selected.sizeFt || selected.gallons) && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap'
      }
    }, selected.sizeFt && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '7px 12px',
        borderRadius: 10,
        background: 'var(--pg-ink-50,var(--pg-blue-50))',
        border: '0.5px solid var(--pg-ink-200)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        color: 'var(--pg-ink-500)',
        letterSpacing: '0.04em'
      }
    }, lang === 'pt' ? 'TAMANHO' : lang === 'es' ? 'TAMAÑO' : 'SIZE'), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--pg-ink-900)'
      }
    }, selected.sizeFt)), selected.gallons && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '7px 12px',
        borderRadius: 10,
        background: 'var(--pg-ink-50,var(--pg-blue-50))',
        border: '0.5px solid var(--pg-ink-200)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        color: 'var(--pg-ink-500)',
        letterSpacing: '0.04em'
      }
    }, lang === 'pt' ? 'GALÕES' : 'GALLONS'), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--pg-ink-900)'
      }
    }, fmtN(selected.gallons, lang), " gal"))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap'
      }
    }, selected.system && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '7px 12px',
        borderRadius: 10,
        background: 'var(--pg-aqua-100)',
        border: '0.5px solid var(--pg-aqua-400)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        color: 'var(--pg-aqua-700)',
        letterSpacing: '0.04em'
      }
    }, lang === 'pt' ? 'SISTEMA' : lang === 'es' ? 'SISTEMA' : 'SYSTEM'), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--pg-ink-900)'
      }
    }, selected.system === 'salt' ? lang === 'pt' ? 'Sal' : lang === 'es' ? 'Sal' : 'Salt' : lang === 'pt' ? 'Cloro' : lang === 'es' ? 'Cloro' : 'Chlorine')), selected.freq && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '7px 12px',
        borderRadius: 10,
        background: 'var(--pg-aqua-100)',
        border: '0.5px solid var(--pg-aqua-400)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        color: 'var(--pg-aqua-700)',
        letterSpacing: '0.04em'
      }
    }, lang === 'pt' ? 'VISITAS' : lang === 'es' ? 'VISITAS' : 'VISITS'), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--pg-ink-900)'
      }
    }, selected.freq === '7' ? lang === 'pt' ? 'Diário' : lang === 'es' ? 'Diario' : 'Daily' : `${selected.freq}x/${lang === 'pt' || lang === 'es' ? 'sem' : 'wk'}`)), selected.warranty && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '7px 12px',
        borderRadius: 10,
        background: selected.warranty === 'yes' ? '#F0FDF4' : 'var(--pg-ink-100)',
        border: `0.5px solid ${selected.warranty === 'yes' ? '#86EFAC' : 'var(--pg-ink-200)'}`
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        color: selected.warranty === 'yes' ? '#15803D' : 'var(--pg-ink-500)',
        letterSpacing: '0.04em'
      }
    }, lang === 'pt' ? 'GARANTIA' : lang === 'es' ? 'GARANTÍA' : 'WARRANTY'), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--pg-ink-900)'
      }
    }, selected.warranty === 'yes' ? selected.warrantyMonths ? `${selected.warrantyMonths} ${lang === 'pt' ? 'meses' : lang === 'es' ? 'meses' : 'mo'}` : lang === 'pt' ? 'Sim' : lang === 'es' ? 'Sí' : 'Yes' : lang === 'pt' ? 'Não' : lang === 'es' ? 'No' : 'No')))), sellerRow, OfferPanel, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 10,
        marginTop: 12
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: openChat,
      className: "pg-btn pg-btn-ghost",
      style: {
        flex: 1
      }
    }, Icon.msg(16, 'var(--pg-blue-700)'), " ", t.message), /*#__PURE__*/React.createElement("button", {
      onClick: openOffer,
      className: "pg-btn pg-btn-primary",
      style: {
        flex: 2
      }
    }, t.makeOffer))));
  }

  // ── EQUIPMENT (default) ────────────────────────────────────────
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(ItemPhotoCarousel, {
    category: selected.category,
    height: 220
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 18px 80px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontFamily: 'var(--pg-font-display)',
      fontSize: 20,
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.2
    }
  }, selected.name), /*#__PURE__*/React.createElement("button", {
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
      display: 'flex',
      alignItems: 'baseline',
      gap: 6,
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--pg-font-display)',
      fontSize: 30,
      fontWeight: 700,
      color: 'var(--pg-blue-500)',
      letterSpacing: '-0.02em'
    }
  }, "$", fmtN(selected.price, lang)), selected.unit && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'var(--pg-ink-500)'
    }
  }, tr(selected.unit, lang)), /*#__PURE__*/React.createElement("span", {
    className: "pg-chip",
    style: {
      marginLeft: 8,
      padding: '2px 9px',
      fontSize: 11,
      background: 'var(--pg-blue-100)',
      color: 'var(--pg-blue-700)',
      borderColor: 'transparent'
    }
  }, tr(selected.condition, lang).toLowerCase())), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      marginTop: 8,
      fontSize: 13,
      color: 'var(--pg-ink-700)'
    }
  }, Icon.pin(14, 'var(--pg-ink-700)'), " ", selected.loc, " \xB7 ", tr(catLabels[selected.category], lang)), sellerRow, /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      fontSize: 14,
      lineHeight: 1.5,
      color: 'var(--pg-ink-700)'
    }
  }, descFor(selected, lang)), OfferPanel, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: openChat,
    className: "pg-btn pg-btn-ghost",
    style: {
      flex: 1
    }
  }, Icon.msg(16, 'var(--pg-blue-700)'), " ", t.message), /*#__PURE__*/React.createElement("button", {
    onClick: selected.mode === 'rent' ? openChat : openOffer,
    className: "pg-btn pg-btn-primary",
    style: {
      flex: 2
    }
  }, selected.mode === 'rent' ? t.requestRental : t.makeOffer))));
}

// ── Post equipment form (sell or rent) ────────────────────────
function PostEquipmentSheet({
  lang,
  t,
  mode = 'sell',
  onClose,
  onSubmit
}) {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [cat, setCat] = React.useState('Pumps');
  const [condition, setCondition] = React.useState('new');
  const [price, setPrice] = React.useState('');
  const [loc, setLoc] = React.useState('');
  const [priceMode, setPriceMode] = React.useState('fixed');
  // Multi-period rental pricing
  const [rentEnabled, setRentEnabled] = React.useState({
    day: false,
    week: false,
    month: false
  });
  const [rentPrices, setRentPrices] = React.useState({
    day: '',
    week: '',
    month: ''
  });
  const [photos, setPhotos] = React.useState([]);
  const [disclaimerChecked, setDisclaimerChecked] = React.useState(false);
  const isRent = mode === 'rent';
  const headLbl = isRent ? t.pmRentEq : t.pmSellEq;
  const priceLbl = isRent ? lang === 'pt' ? 'Valor do aluguel' : lang === 'es' ? 'Valor del alquiler' : 'Rental rate' : lang === 'pt' ? 'Preço de venda' : lang === 'es' ? 'Precio de venta' : 'Sale price';
  const submitLbl = t.postListingBtn;
  const periodOptions = [{
    id: 'day',
    label: lang === 'pt' ? 'Por dia' : lang === 'es' ? 'Por día' : 'Per day',
    sfx: lang === 'pt' ? '/dia' : lang === 'es' ? '/día' : '/day'
  }, {
    id: 'week',
    label: lang === 'pt' ? 'Por semana' : lang === 'es' ? 'Por semana' : 'Per week',
    sfx: lang === 'pt' ? '/sem' : lang === 'es' ? '/sem' : '/wk'
  }, {
    id: 'month',
    label: lang === 'pt' ? 'Por mês' : lang === 'es' ? 'Por mes' : 'Per month',
    sfx: lang === 'pt' ? '/mês' : lang === 'es' ? '/mes' : '/mo'
  }];
  // At least one period must be enabled with a valid price
  const hasAnyRentPrice = isRent && periodOptions.some(p => rentEnabled[p.id] && rentPrices[p.id].trim().length > 0);
  const cats = ['Pumps', 'Vacuum', 'Heaters', 'Pole', 'Car', 'Truck', 'Jug', 'Net', 'Chemicals', 'Filters', 'Others'];
  const catLabels = {
    Pumps: lang === 'pt' ? 'Bombas' : lang === 'es' ? 'Bombas' : 'Pumps',
    Vacuum: lang === 'pt' ? 'Aspiradores' : lang === 'es' ? 'Aspiradores' : 'Vacuum',
    Heaters: lang === 'pt' ? 'Aquecedores' : lang === 'es' ? 'Calentadores' : 'Heaters',
    Pole: 'Pole',
    Car: lang === 'pt' ? 'Carrinho' : lang === 'es' ? 'Carrito' : 'Cart',
    Truck: 'Truck',
    Jug: 'Jug',
    Net: 'Net',
    Chemicals: lang === 'pt' ? 'Químicos' : lang === 'es' ? 'Químicos' : 'Chemicals',
    Filters: lang === 'pt' ? 'Filtros' : lang === 'es' ? 'Filtros' : 'Filters',
    Others: lang === 'pt' ? 'Outros' : lang === 'es' ? 'Otros' : 'Others'
  };
  const conditions = [{
    id: 'new',
    label: t.newLbl
  }, {
    id: 'likeNew',
    label: t.likeNewLbl
  }, {
    id: 'good',
    label: t.goodLbl
  }, {
    id: 'used',
    label: t.usedLbl
  }, {
    id: 'parts',
    label: t.forPartsLbl
  }];
  const isValid = name.trim().length > 2 && loc.trim().length > 2 && (isRent ? hasAnyRentPrice && disclaimerChecked : priceMode === 'neg' || price.trim().length > 0);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 18px 14px',
      borderBottom: '0.5px solid var(--pg-ink-200)',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      border: 'none',
      background: 'transparent',
      color: 'var(--pg-blue-500)',
      fontSize: 15,
      fontWeight: 600,
      cursor: 'pointer',
      padding: 0
    }
  }, t.cancel), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontFamily: 'var(--pg-font-display)',
      fontSize: 17,
      fontWeight: 700,
      letterSpacing: '-0.01em'
    }
  }, headLbl), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 60
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      touchAction: 'pan-y',
      padding: '16px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(PhotoPicker, {
    photos: photos,
    onAdd: url => setPhotos(p => [...p, url]),
    onRemove: url => setPhotos(p => p.filter(u => u !== url)),
    max: 5,
    cat: cat,
    lang: lang
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 0,
      borderTop: '0.5px solid var(--pg-ink-150, var(--pg-ink-200))'
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FormLabel, null, t.modelLbl), /*#__PURE__*/React.createElement("input", {
    className: "pg-field",
    value: name,
    onChange: e => setName(e.target.value),
    placeholder: t.modelPh
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FormLabel, null, lang === 'pt' ? 'Descrição' : lang === 'es' ? 'Descripción' : 'Description'), /*#__PURE__*/React.createElement("textarea", {
    className: "pg-field",
    value: description,
    onChange: e => setDescription(e.target.value),
    rows: 3,
    placeholder: lang === 'pt' ? 'Ex: Bomba usada por 2 anos, funcionando perfeitamente. Acompanha manual e cabo elétrico original…' : lang === 'es' ? 'Ej: Bomba usada por 2 años, funcionando perfectamente…' : 'e.g. Used for 2 years, works perfectly. Includes original manual and power cable…',
    style: {
      resize: 'vertical',
      minHeight: 76,
      lineHeight: 1.5
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FormLabel, null, t.categoryLbl), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 7,
      flexWrap: 'wrap'
    }
  }, cats.map(c => /*#__PURE__*/React.createElement("button", {
    key: c,
    onClick: () => setCat(c),
    style: {
      padding: '7px 13px',
      borderRadius: 10,
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'inherit',
      fontSize: 12.5,
      fontWeight: 600,
      transition: 'all .12s',
      background: cat === c ? 'var(--pg-blue-500)' : 'var(--pg-ink-100)',
      color: cat === c ? '#fff' : 'var(--pg-ink-700)',
      boxShadow: cat === c ? '0 3px 8px oklch(0.58 0.16 235 / 0.25)' : 'none'
    }
  }, catLabels[c])))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FormLabel, null, t.conditionLbl), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 7,
      flexWrap: 'wrap'
    }
  }, conditions.map(c => /*#__PURE__*/React.createElement("button", {
    key: c.id,
    onClick: () => setCondition(c.id),
    style: {
      padding: '7px 13px',
      borderRadius: 10,
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'inherit',
      fontSize: 12.5,
      fontWeight: 600,
      transition: 'all .12s',
      background: condition === c.id ? 'var(--pg-aqua-500)' : 'var(--pg-ink-100)',
      color: condition === c.id ? 'var(--pg-blue-900)' : 'var(--pg-ink-700)'
    }
  }, c.label)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FormLabel, null, priceLbl), isRent && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, periodOptions.map(p => {
    const on = rentEnabled[p.id];
    return /*#__PURE__*/React.createElement("div", {
      key: p.id,
      style: {
        borderRadius: 13,
        border: on ? '1.5px solid var(--pg-blue-500)' : '1.5px solid var(--pg-ink-200)',
        background: on ? 'rgba(0,122,255,0.04)' : 'var(--pg-ink-50)',
        overflow: 'hidden',
        transition: 'all .15s'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setRentEnabled(prev => ({
        ...prev,
        [p.id]: !prev[p.id]
      })),
      style: {
        width: '100%',
        padding: '12px 14px',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        fontFamily: 'inherit',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        textAlign: 'left'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 20,
        height: 20,
        borderRadius: 6,
        flexShrink: 0,
        border: on ? '2px solid var(--pg-blue-500)' : '2px solid var(--pg-ink-300)',
        background: on ? 'var(--pg-blue-500)' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all .12s'
      }
    }, on && /*#__PURE__*/React.createElement("svg", {
      width: "11",
      height: "11",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "#fff",
      strokeWidth: "3.5",
      strokeLinecap: "round"
    }, /*#__PURE__*/React.createElement("polyline", {
      points: "20 6 9 17 4 12"
    }))), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 14,
        fontWeight: 700,
        color: on ? 'var(--pg-blue-500)' : 'var(--pg-ink-700)',
        flex: 1
      }
    }, p.label), on && rentPrices[p.id] && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 800,
        color: 'var(--pg-blue-500)'
      }
    }, "$", rentPrices[p.id], p.sfx)), on && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '0 14px 14px',
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        left: 26,
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: 22,
        fontWeight: 700,
        color: 'var(--pg-blue-500)',
        fontFamily: 'var(--pg-font-display)'
      }
    }, "$"), /*#__PURE__*/React.createElement("input", {
      className: "pg-field",
      value: rentPrices[p.id],
      onChange: e => setRentPrices(prev => ({
        ...prev,
        [p.id]: e.target.value
      })),
      placeholder: "0",
      type: "number",
      style: {
        height: 52,
        paddingLeft: 36,
        paddingRight: 50,
        fontSize: 22,
        fontWeight: 700,
        color: 'var(--pg-blue-500)',
        fontFamily: 'var(--pg-font-display)'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        right: 26,
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--pg-ink-400)'
      }
    }, p.sfx)));
  }), !hasAnyRentPrice && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--pg-ink-400)',
      textAlign: 'center',
      padding: '2px 0'
    }
  }, lang === 'pt' ? 'Selecione pelo menos um período e informe o preço' : 'Select at least one period and enter a price')), !isRent && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "pg-seg",
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: `pg-seg-btn ${priceMode === 'fixed' ? 'on' : ''}`,
    onClick: () => setPriceMode('fixed')
  }, t.fixedPrice), /*#__PURE__*/React.createElement("button", {
    className: `pg-seg-btn ${priceMode === 'neg' ? 'on' : ''}`,
    onClick: () => setPriceMode('neg')
  }, t.priceNeg)), priceMode === 'fixed' && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: 16,
      top: '50%',
      transform: 'translateY(-50%)',
      fontSize: 22,
      fontWeight: 700,
      color: 'var(--pg-blue-500)',
      fontFamily: 'var(--pg-font-display)'
    }
  }, "$"), /*#__PURE__*/React.createElement("input", {
    className: "pg-field",
    value: price,
    onChange: e => setPrice(e.target.value),
    placeholder: "0",
    type: "number",
    style: {
      height: 56,
      paddingLeft: 36,
      fontSize: 22,
      fontWeight: 700,
      color: 'var(--pg-blue-500)',
      fontFamily: 'var(--pg-font-display)'
    }
  })))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FormLabel, null, t.location), /*#__PURE__*/React.createElement(CityAutocomplete, {
    value: loc,
    onChange: v => setLoc(v),
    lang: lang
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 18px 20px',
      borderTop: '0.5px solid var(--pg-ink-200)',
      flexShrink: 0
    }
  }, isRent && /*#__PURE__*/React.createElement("button", {
    onClick: () => setDisclaimerChecked(v => !v),
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      width: '100%',
      padding: '12px 14px',
      borderRadius: 13,
      marginBottom: 12,
      border: disclaimerChecked ? '1.5px solid #0EBAC7' : '1.5px solid var(--pg-ink-200)',
      background: disclaimerChecked ? 'rgba(14,186,199,0.06)' : 'var(--pg-ink-50)',
      cursor: 'pointer',
      textAlign: 'left',
      fontFamily: 'inherit',
      transition: 'all .15s'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 20,
      height: 20,
      borderRadius: 6,
      flexShrink: 0,
      marginTop: 1,
      border: disclaimerChecked ? '2px solid #0EBAC7' : '2px solid var(--pg-ink-300)',
      background: disclaimerChecked ? '#0EBAC7' : 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all .12s'
    }
  }, disclaimerChecked && /*#__PURE__*/React.createElement("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#fff",
    strokeWidth: "3.5",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "20 6 9 17 4 12"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      lineHeight: 1.5,
      color: 'var(--pg-ink-700)'
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--pg-ink-900)',
      display: 'block',
      marginBottom: 2
    }
  }, lang === 'pt' ? 'Responsabilidade pelo equipamento' : 'Equipment Liability'), lang === 'pt' ? 'Declaro que me responsabilizo totalmente pelo equipamento disponibilizado para aluguel. O PoolGuyX não se responsabiliza por perdas, danos ou furtos do equipamento durante o período de aluguel.' : 'I acknowledge full responsibility for the equipment listed for rental. PoolGuyX is not liable for any loss, damage, or theft of the equipment during the rental period.')), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      // Build rentPrices map from enabled periods with a valid price
      const builtRentPrices = isRent ? Object.fromEntries(periodOptions.filter(p => rentEnabled[p.id] && rentPrices[p.id].trim().length > 0).map(p => [p.id, parseFloat(rentPrices[p.id])])) : null;
      // cheapest period price for the main price column (used in card/sort)
      const cheapestPrice = isRent ? Math.min(...Object.values(builtRentPrices || {}).filter(v => v > 0)) : priceMode === 'neg' ? 'Negotiable' : price;
      onSubmit && onSubmit({
        type: mode,
        name,
        description,
        cat,
        condition,
        price: cheapestPrice,
        priceMode: isRent ? 'fixed' : priceMode,
        loc,
        rentPeriod: null,
        rentPrices: builtRentPrices,
        photoUrl: photos[0] || null,
        photos
      });
    },
    disabled: !isValid,
    className: "pg-btn pg-btn-primary",
    style: {
      width: '100%',
      height: 52,
      fontSize: 16,
      opacity: isValid ? 1 : 0.45
    }
  }, Icon.cart(17, '#fff'), " ", submitLbl)));
}

// ── Post route form ───────────────────────────────────────────
function PostPoolSheet({
  lang,
  t,
  onClose,
  onSubmit
}) {
  const [title, setTitle] = React.useState('');
  const [poolKind, setPoolKind] = React.useState('house');
  const [desc, setDesc] = React.useState('');
  const [area, setArea] = React.useState('');
  const [address, setAddress] = React.useState(''); // optional exact address
  const [sizeFt, setSizeFt] = React.useState('');
  const [gallons, setGallons] = React.useState('');
  const [system, setSystem] = React.useState('');
  const [freq, setFreq] = React.useState('');
  const [askingPrice, setAskingPrice] = React.useState(''); // Preço de venda (visible on card)
  const [price, setPrice] = React.useState(''); // Valor negociado/mês (detail only)
  const [warranty, setWarranty] = React.useState('');
  const [wMonths, setWMonths] = React.useState('');
  const [photos, setPhotos] = React.useState([]);
  const isValid = title.trim().length > 3 && area.trim().length > 0 && system !== '' && freq !== '' && askingPrice.trim().length > 0 && warranty !== '' && (warranty !== 'yes' || wMonths !== '');
  const lbl = (pt, es, en) => lang === 'pt' ? pt : lang === 'es' ? es : en;
  const fmtP = v => {
    if (!v) return '';
    const n = parseInt(String(v).replace(/[^\d]/g, ''), 10);
    if (isNaN(n)) return '';
    const s = n.toLocaleString('en-US');
    return lang === 'en' ? s : s.replace(/,/g, '.');
  };
  const ToggleGroup = ({
    value,
    onChange,
    options
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, options.map(o => {
    const on = value === o.id;
    return /*#__PURE__*/React.createElement("button", {
      key: o.id,
      onClick: () => onChange(o.id),
      style: {
        padding: '8px 16px',
        borderRadius: 10,
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 13,
        fontWeight: 600,
        transition: 'all .12s',
        background: on ? 'var(--pg-blue-500)' : 'var(--pg-ink-100)',
        color: on ? '#fff' : 'var(--pg-ink-700)',
        boxShadow: on ? '0 2px 8px rgba(0,119,182,0.25)' : 'none'
      }
    }, o.label);
  }));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 18px 14px',
      borderBottom: '0.5px solid var(--pg-ink-200)',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      border: 'none',
      background: 'transparent',
      color: 'var(--pg-blue-500)',
      fontSize: 15,
      fontWeight: 600,
      cursor: 'pointer',
      padding: 0
    }
  }, t.cancel), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontFamily: 'var(--pg-font-display)',
      fontSize: 17,
      fontWeight: 700,
      letterSpacing: '-0.01em'
    }
  }, lbl('Vender piscina avulsa', 'Vender piscina suelta', 'Sell single pool')), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 60
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      touchAction: 'pan-y',
      padding: '16px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FormLabel, null, lbl('Título da publicação *', 'Título del anuncio *', 'Listing title *')), /*#__PURE__*/React.createElement("input", {
    className: "pg-field",
    value: title,
    onChange: e => setTitle(e.target.value),
    placeholder: lbl('Ex: Piscina à venda em Boca Raton', 'Ej: Piscina en venta en Boca Raton', 'e.g. Pool for sale in Boca Raton')
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FormLabel, null, lbl('Tipo de imóvel *', 'Tipo de propiedad *', 'Property type *')), /*#__PURE__*/React.createElement(ToggleGroup, {
    value: poolKind,
    onChange: setPoolKind,
    options: [{
      id: 'house',
      label: lbl('Casa', 'Casa', 'House')
    }, {
      id: 'condo',
      label: lbl('Condomínio', 'Condominio', 'Condo')
    }]
  })), /*#__PURE__*/React.createElement(PhotoPicker, {
    photos: photos,
    onAdd: url => setPhotos(p => [...p, url]),
    onRemove: url => setPhotos(p => p.filter(u => u !== url)),
    max: 5,
    lang: lang,
    title: lbl('Fotos da piscina (opcional)', 'Fotos de la piscina (opcional)', 'Pool photos (optional)')
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FormLabel, null, lbl('Descrição (opcional)', 'Descripción (opcional)', 'Description (optional)')), /*#__PURE__*/React.createElement("textarea", {
    className: "pg-field",
    value: desc,
    onChange: e => setDesc(e.target.value),
    placeholder: lbl('Descreva a piscina, condição geral, histórico de manutenção…', 'Describa la piscina, condición general, historial de mantenimiento…', 'Describe the pool, general condition, maintenance history…'),
    style: {
      height: 90,
      resize: 'none',
      paddingTop: 12,
      lineHeight: 1.5
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FormLabel, null, lbl('Cidade', 'Ciudad', 'City')), /*#__PURE__*/React.createElement(CityAutocomplete, {
    value: area,
    onChange: v => setArea(v),
    lang: lang
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FormLabel, null, lbl('Endereço (opcional)', 'Dirección (opcional)', 'Address (optional)')), /*#__PURE__*/React.createElement("input", {
    className: "pg-field",
    value: address,
    onChange: e => setAddress(e.target.value),
    placeholder: lbl('Ex: 1234 NW 5th St, Fort Lauderdale', 'Ej: 1234 NW 5th St, Fort Lauderdale', 'e.g. 1234 NW 5th St, Fort Lauderdale')
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(FormLabel, null, lbl('Tamanho (ex: 10x20 ft)', 'Tamaño (ej: 10x20 ft)', 'Size (e.g. 10x20 ft)')), /*#__PURE__*/React.createElement("input", {
    className: "pg-field",
    value: sizeFt,
    onChange: e => setSizeFt(e.target.value),
    placeholder: "10x20 ft"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(FormLabel, null, lbl('Capacidade (galões)', 'Capacidad (galones)', 'Capacity (gallons)')), /*#__PURE__*/React.createElement("input", {
    className: "pg-field",
    value: gallons,
    onChange: e => setGallons(e.target.value),
    placeholder: "15,000",
    type: "number"
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FormLabel, null, lbl('Sistema', 'Sistema', 'System')), /*#__PURE__*/React.createElement(ToggleGroup, {
    value: system,
    onChange: setSystem,
    options: [{
      id: 'chlorine',
      label: lbl('Cloro', 'Cloro', 'Chlorine')
    }, {
      id: 'salt',
      label: lbl('Sal', 'Sal', 'Salt')
    }]
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FormLabel, null, lbl('Visitas por semana', 'Visitas por semana', 'Visits per week')), /*#__PURE__*/React.createElement(ToggleGroup, {
    value: freq,
    onChange: setFreq,
    options: [{
      id: '1',
      label: '1x'
    }, {
      id: '2',
      label: '2x'
    }, {
      id: '3',
      label: '3x'
    }, {
      id: '7',
      label: lbl('Diário', 'Diario', 'Daily')
    }]
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FormLabel, null, lbl('Preço da piscina *', 'Precio de la piscina *', 'Pool asking price *')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--pg-ink-400)',
      marginBottom: 6,
      lineHeight: 1.4
    }
  }, lbl('Valor de venda — aparece no card do marketplace.', 'Precio de venta — aparece en el card del marketplace.', 'Sale price — shown on the marketplace card.')), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: 16,
      top: '50%',
      transform: 'translateY(-50%)',
      fontSize: 22,
      fontWeight: 700,
      color: 'var(--pg-blue-500)',
      fontFamily: 'var(--pg-font-display)'
    }
  }, "$"), /*#__PURE__*/React.createElement("input", {
    className: "pg-field",
    value: fmtP(askingPrice),
    onChange: e => setAskingPrice(e.target.value.replace(/[^\d]/g, '')),
    placeholder: fmtP('3500') || '3,500',
    type: "text",
    inputMode: "numeric",
    style: {
      height: 56,
      paddingLeft: 36,
      fontSize: 22,
      fontWeight: 700,
      color: 'var(--pg-blue-500)',
      fontFamily: 'var(--pg-font-display)'
    }
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FormLabel, null, lbl('Valor negociado por mês (opcional)', 'Valor negociado por mes (opcional)', 'Monthly agreed price (optional)')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--pg-ink-400)',
      marginBottom: 6,
      lineHeight: 1.4
    }
  }, lbl('Valor que o cliente paga por mês — visível apenas dentro da publicação.', 'Valor que el cliente paga por mes — visible solo dentro del anuncio.', 'What the client pays monthly — only visible inside the listing detail.')), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: 16,
      top: '50%',
      transform: 'translateY(-50%)',
      fontSize: 22,
      fontWeight: 700,
      color: 'var(--pg-blue-500)',
      fontFamily: 'var(--pg-font-display)'
    }
  }, "$"), /*#__PURE__*/React.createElement("input", {
    className: "pg-field",
    value: fmtP(price),
    onChange: e => setPrice(e.target.value.replace(/[^\d]/g, '')),
    placeholder: "120",
    type: "text",
    inputMode: "numeric",
    style: {
      height: 56,
      paddingLeft: 36,
      fontSize: 22,
      fontWeight: 700,
      color: 'var(--pg-blue-500)',
      fontFamily: 'var(--pg-font-display)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      right: 16,
      top: '50%',
      transform: 'translateY(-50%)',
      fontSize: 12,
      color: 'var(--pg-ink-500)'
    }
  }, lbl('/mês', '/mes', '/mo')))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FormLabel, null, lbl('Garantia', 'Garantía', 'Warranty')), /*#__PURE__*/React.createElement(ToggleGroup, {
    value: warranty,
    onChange: v => {
      setWarranty(v);
      if (v === 'no') setWMonths('');
    },
    options: [{
      id: 'yes',
      label: lbl('Sim', 'Sí', 'Yes')
    }, {
      id: 'no',
      label: lbl('Não', 'No', 'No')
    }]
  }), warranty === 'yes' && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement(FormLabel, null, lbl('Meses de garantia', 'Meses de garantía', 'Warranty months')), /*#__PURE__*/React.createElement(ToggleGroup, {
    value: wMonths,
    onChange: v => setWMonths(v),
    options: Array.from({
      length: 12
    }, (_, i) => ({
      id: String(i + 1),
      label: `${i + 1} ${lang === 'pt' ? 'mes' + (i === 0 ? '' : 'es') : lang === 'es' ? 'mes' + (i === 0 ? '' : 'es') : 'mo' + (i === 0 ? '' : 's')}`
    }))
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 18px 20px',
      borderTop: '0.5px solid var(--pg-ink-200)',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => onSubmit && onSubmit({
      type: 'pool',
      name: title,
      cat: poolKind,
      desc,
      area,
      address: address || null,
      sizeFt,
      gallons,
      system,
      freq,
      asking: parseFloat(askingPrice) || 0,
      est: parseFloat(askingPrice) || 0,
      price: price ? parseFloat(price) || null : null,
      warranty,
      warrantyMonths: warranty === 'yes' ? wMonths : null,
      photoUrl: photos[0] || null,
      photoUrls: photos
    }),
    disabled: !isValid,
    className: "pg-btn pg-btn-primary",
    style: {
      width: '100%',
      height: 52,
      fontSize: 16,
      opacity: isValid ? 1 : 0.45
    }
  }, lbl('Publicar piscina', 'Publicar piscina', 'Post pool'))));
}
function PostRouteSheet({
  lang,
  t,
  onClose,
  onSubmit
}) {
  const [title, setTitle] = React.useState('');
  const [poolKind, setPoolKind] = React.useState('residential');
  const [clients, setClients] = React.useState('');
  const [revenue, setRevenue] = React.useState('');
  const [asking, setAsking] = React.useState('');
  const [area, setArea] = React.useState([]);
  const [cityKey, setCityKey] = React.useState(0);
  const [photos, setPhotos] = React.useState([]);
  const isValid = title.trim().length > 3 && clients.trim().length > 0 && asking.trim().length > 0;
  const headLbl = t.pmSellRoute;
  const lbl = (pt, es, en) => lang === 'pt' ? pt : lang === 'es' ? es : en;
  const fmtP = v => {
    if (!v) return '';
    const n = parseInt(String(v).replace(/[^\d]/g, ''), 10);
    if (isNaN(n)) return '';
    const s = n.toLocaleString('en-US');
    return lang === 'en' ? s : s.replace(/,/g, '.');
  };
  const ToggleGroup = ({
    value,
    onChange,
    options
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, options.map(o => {
    const on = value === o.id;
    return /*#__PURE__*/React.createElement("button", {
      key: o.id,
      onClick: () => onChange(o.id),
      style: {
        padding: '8px 16px',
        borderRadius: 10,
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 13,
        fontWeight: 600,
        transition: 'all .12s',
        background: on ? 'var(--pg-blue-500)' : 'var(--pg-ink-100)',
        color: on ? '#fff' : 'var(--pg-ink-700)',
        boxShadow: on ? '0 2px 8px rgba(0,119,182,0.25)' : 'none'
      }
    }, o.label);
  }));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 18px 14px',
      borderBottom: '0.5px solid var(--pg-ink-200)',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      border: 'none',
      background: 'transparent',
      color: 'var(--pg-blue-500)',
      fontSize: 15,
      fontWeight: 600,
      cursor: 'pointer',
      padding: 0
    }
  }, t.cancel), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontFamily: 'var(--pg-font-display)',
      fontSize: 17,
      fontWeight: 700,
      letterSpacing: '-0.01em'
    }
  }, headLbl), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 60
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      touchAction: 'pan-y',
      padding: '16px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FormLabel, null, lbl('Título da publicação *', 'Título del anuncio *', 'Listing title *')), /*#__PURE__*/React.createElement("input", {
    className: "pg-field",
    value: title,
    onChange: e => setTitle(e.target.value),
    placeholder: lbl('Ex: Rota à venda em Pompano Beach', 'Ej: Ruta en venta en Pompano Beach', 'e.g. Route for sale in Pompano Beach')
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FormLabel, null, lbl('Tipo de cliente *', 'Tipo de cliente *', 'Client type *')), /*#__PURE__*/React.createElement(ToggleGroup, {
    value: poolKind,
    onChange: setPoolKind,
    options: [{
      id: 'residential',
      label: lbl('Residencial', 'Residencial', 'Residential')
    }, {
      id: 'commercial',
      label: lbl('Comercial', 'Comercial', 'Commercial')
    }, {
      id: 'mixed',
      label: lbl('Misto', 'Mixto', 'Mixed')
    }]
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PhotoPicker, {
    photos: photos,
    onAdd: url => setPhotos(p => [...p, url]),
    onRemove: url => setPhotos(p => p.filter(u => u !== url)),
    max: 5,
    lang: lang,
    title: lbl('Fotos da rota (opcional)', 'Fotos de la ruta (opcional)', 'Route photos (optional)')
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '6px 0 0',
      fontSize: 12,
      color: 'var(--pg-ink-500)',
      lineHeight: 1.4
    }
  }, lbl('Pode ser print do Skimmer, PoolBrain, etc.', 'Puede ser captura de Skimmer, PoolBrain, etc.', 'Can be a screenshot from Skimmer, PoolBrain, etc.'))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FormLabel, null, t.clientsLbl), /*#__PURE__*/React.createElement("input", {
    className: "pg-field",
    value: clients,
    onChange: e => setClients(e.target.value),
    placeholder: "e.g. 14",
    type: "number"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FormLabel, null, t.revenueMonthly), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: 16,
      top: '50%',
      transform: 'translateY(-50%)',
      fontSize: 18,
      fontWeight: 700,
      color: 'var(--pg-aqua-700)',
      fontFamily: 'var(--pg-font-display)'
    }
  }, "$"), /*#__PURE__*/React.createElement("input", {
    className: "pg-field",
    value: fmtP(revenue),
    onChange: e => setRevenue(e.target.value.replace(/[^\d]/g, '')),
    placeholder: fmtP('3800') || '3,800',
    type: "text",
    inputMode: "numeric",
    style: {
      paddingLeft: 34,
      fontSize: 18,
      fontWeight: 700,
      color: 'var(--pg-aqua-700)',
      fontFamily: 'var(--pg-font-display)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      right: 16,
      top: '50%',
      transform: 'translateY(-50%)',
      fontSize: 12,
      color: 'var(--pg-ink-500)'
    }
  }, lang === 'pt' ? '/mês' : lang === 'es' ? '/mes' : '/mo'))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FormLabel, null, t.asking), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: 16,
      top: '50%',
      transform: 'translateY(-50%)',
      fontSize: 22,
      fontWeight: 700,
      color: 'var(--pg-blue-500)',
      fontFamily: 'var(--pg-font-display)'
    }
  }, "$"), /*#__PURE__*/React.createElement("input", {
    className: "pg-field",
    value: fmtP(asking),
    onChange: e => setAsking(e.target.value.replace(/[^\d]/g, '')),
    placeholder: fmtP('5800') || '5,800',
    type: "text",
    inputMode: "numeric",
    style: {
      height: 56,
      paddingLeft: 36,
      fontSize: 22,
      fontWeight: 700,
      color: 'var(--pg-blue-500)',
      fontFamily: 'var(--pg-font-display)'
    }
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FormLabel, null, lbl('Cidades da rota', 'Ciudades de la ruta', 'Route cities')), area.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 10
    }
  }, area.map(city => /*#__PURE__*/React.createElement("div", {
    key: city,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      background: 'var(--pg-blue-100)',
      color: 'var(--pg-blue-700)',
      borderRadius: 20,
      padding: '5px 10px 5px 12px',
      fontSize: 13,
      fontWeight: 600
    }
  }, city, /*#__PURE__*/React.createElement("button", {
    onClick: () => setArea(prev => prev.filter(c => c !== city)),
    style: {
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      padding: '0 0 0 2px',
      lineHeight: 1,
      color: 'var(--pg-blue-400)',
      fontSize: 17,
      fontWeight: 400
    }
  }, "\xD7")))), /*#__PURE__*/React.createElement(CityAutocomplete, {
    key: cityKey,
    value: "",
    onChange: v => {
      if (v && !area.includes(v)) setArea(prev => [...prev, v]);
      setCityKey(k => k + 1);
    },
    lang: lang
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 18px 20px',
      borderTop: '0.5px solid var(--pg-ink-200)',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => onSubmit && onSubmit({
      type: 'route',
      name: title,
      cat: poolKind,
      clients,
      revenue,
      asking,
      area: area.join(', '),
      photoUrl: photos[0] || null,
      photoUrls: photos
    }),
    disabled: !isValid,
    className: "pg-btn pg-btn-primary",
    style: {
      width: '100%',
      height: 52,
      fontSize: 16,
      opacity: isValid ? 1 : 0.45
    }
  }, Icon.pin(17, '#fff'), " ", t.postListingBtn)));
}

// ── City autocomplete (portal-based — works inside overflow:auto) ──
function CityAutocomplete({
  value,
  onChange,
  lang
}) {
  const [q, setQ] = React.useState(value || '');
  const [open, setOpen] = React.useState(false);
  const [dropPos, setDropPos] = React.useState({
    top: 0,
    left: 0,
    width: 0
  });
  const inputRef = React.useRef(null);
  React.useEffect(() => {
    setQ(value || '');
  }, [value]);
  const allCities = React.useMemo(() => {
    const out = [];
    Object.entries(FL_COUNTIES || {}).forEach(([county, cities]) => {
      (cities || []).forEach(city => out.push({
        city,
        county
      }));
    });
    return out;
  }, []);
  const matches = q.trim().length >= 1 ? allCities.filter(c => c.city.toLowerCase() !== (value || '').toLowerCase()).filter(c => c.city.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 6) : [];
  const updatePos = () => {
    if (!inputRef.current) return;
    const stage = document.getElementById('stage');
    const sr = stage ? stage.getBoundingClientRect() : {
      top: 0,
      left: 0
    };
    const ir = inputRef.current.getBoundingClientRect();
    setDropPos({
      top: ir.bottom - sr.top + 4,
      left: ir.left - sr.left,
      width: ir.width
    });
  };
  const pick = city => {
    onChange(city);
    setQ(city);
    setOpen(false);
  };
  const clear = () => {
    onChange('');
    setQ('');
  };
  const stage = document.getElementById('stage');
  const dropdown = open && matches.length > 0 && stage ? ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: dropPos.top,
      left: dropPos.left,
      width: dropPos.width,
      zIndex: 2000,
      background: 'var(--pg-white)',
      borderRadius: 12,
      padding: 6,
      border: '0.5px solid var(--pg-ink-200)',
      boxShadow: '0 8px 24px rgba(15,30,60,0.14)'
    }
  }, matches.map(m => /*#__PURE__*/React.createElement("button", {
    key: m.city,
    onMouseDown: e => {
      e.preventDefault();
      pick(m.city);
    },
    onTouchStart: e => {
      e.preventDefault();
      pick(m.city);
    },
    style: {
      width: '100%',
      textAlign: 'left',
      padding: '9px 10px',
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      borderRadius: 8,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontFamily: 'inherit',
      fontSize: 13.5
    },
    onMouseEnter: e => e.currentTarget.style.background = 'var(--pg-blue-50)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent'
  }, Icon.pin(13, 'var(--pg-blue-500)'), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      color: 'var(--pg-ink-900)',
      fontWeight: 500
    }
  }, m.city), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--pg-ink-500)'
    }
  }, m.county)))), stage) : null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, value && q === value ?
  /*#__PURE__*/
  /* ── Selected pill ── */
  React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '10px 12px',
      background: 'var(--pg-blue-50)',
      border: '1px solid var(--pg-blue-400)',
      borderRadius: 11,
      minHeight: 46
    }
  }, Icon.pin(14, 'var(--pg-blue-700)'), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 13.5,
      fontWeight: 600,
      color: 'var(--pg-blue-700)'
    }
  }, value), /*#__PURE__*/React.createElement("button", {
    onClick: clear,
    style: {
      border: 'none',
      background: 'rgba(255,255,255,0.7)',
      cursor: 'pointer',
      width: 24,
      height: 24,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, Icon.x(12, 'var(--pg-blue-700)'))) :
  /*#__PURE__*/
  /* ── Input + search icon ── */
  React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("input", {
    ref: inputRef,
    className: "pg-field",
    placeholder: lang === 'pt' ? 'Digite a cidade…' : lang === 'es' ? 'Escribe la ciudad…' : 'Type the city…',
    value: q,
    onChange: e => {
      setQ(e.target.value);
      updatePos();
    },
    onFocus: () => {
      updatePos();
      setOpen(true);
    },
    onBlur: () => setTimeout(() => setOpen(false), 200),
    style: {
      paddingLeft: 38,
      height: 44,
      fontSize: 14
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: 12,
      top: 22,
      transform: 'translateY(-50%)'
    }
  }, Icon.search(15, 'var(--pg-ink-400)'))), dropdown);
}

// ── Helper label ──────────────────────────────────────────────
function FormLabel({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--pg-ink-500)',
      fontWeight: 700,
      letterSpacing: '0.06em',
      marginBottom: 8
    }
  }, children.toUpperCase());
}

// ── Description/seller helpers ────────────────────────────────
function descFor(e, lang) {
  const map = {
    Pumps: {
      en: 'Variable-speed pool pump, lightly used.',
      pt: 'Bomba de velocidade variável, pouco uso.',
      es: 'Bomba de velocidad variable, poco uso.'
    },
    Filters: {
      en: 'High-rate sand filter, 24-inch tank.',
      pt: 'Filtro de areia, tanque de 24 polegadas.',
      es: 'Filtro de arena, tanque de 24 pulgadas.'
    },
    Vacuum: {
      en: 'Automatic suction-side pool vacuum, barely used.',
      pt: 'Aspirador automático para piscina, quase sem uso.',
      es: 'Aspirador automático para piscina, casi sin uso.'
    },
    Heaters: {
      en: 'Reliable propane pool heater, runs perfectly.',
      pt: 'Aquecedor a gás confiável, funciona perfeitamente.',
      es: 'Calentador a gas confiable, funciona perfectamente.'
    },
    Pole: {
      en: 'Heavy-duty aluminum telescopic pole.',
      pt: 'Haste telescópica de alumínio reforçada.',
      es: 'Pértiga telescópica de aluminio reforzada.'
    },
    Tools: {
      en: 'Heavy-duty aluminum telescopic pole.',
      pt: 'Haste telescópica de alumínio reforçada.',
      es: 'Pértiga telescópica de aluminio reforzada.'
    },
    Car: {
      en: 'Pool service vehicle, well maintained.',
      pt: 'Veículo de serviço de piscina, bem conservado.',
      es: 'Vehículo de servicio de piscina, bien mantenido.'
    },
    Jug: {
      en: 'Chemical dosing jug, 1-gallon capacity.',
      pt: 'Galão para dosagem de químicos, 1 galão.',
      es: 'Galón para dosificación de químicos, 1 galón.'
    },
    Net: {
      en: 'Leaf skimmer net, fits standard telescopic pole.',
      pt: 'Peneira coletora de folhas, encaixa em hastes padrão.',
      es: 'Red recoge-hojas, compatible con pértigas estándar.'
    },
    Chemicals: {
      en: 'Pool chemical treatment, balanced formula.',
      pt: 'Produto químico para piscina, fórmula balanceada.',
      es: 'Químico para piscina, fórmula balanceada.'
    },
    Others: {
      en: 'Pool-related item in good condition.',
      pt: 'Item relacionado a piscina em bom estado.',
      es: 'Artículo relacionado con piscina en buen estado.'
    }
  };
  const fallback = map.Pole;
  return (map[e.category] || fallback)[lang] || (map[e.category] || fallback).en;
}
function sellerFor(e) {
  const sellers = ['PoolPro Mike', 'AquaServ', 'FilterKing', 'RentAPool', 'BluClear', 'DesertPools'];
  return sellers[e.id % sellers.length];
}
Object.assign(window, {
  MarketplaceScreen
});