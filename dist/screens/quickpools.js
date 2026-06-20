// quickpools.jsx — Google-Maps-style map with clickable pins + premium gate

function QuickPoolsScreen({
  ctx
}) {
  const {
    lang,
    user,
    openPaywall,
    openChat,
    openPost,
    openRegionEditor,
    regionsByDay,
    county,
    hasUnreadChat,
    openNotifications,
    hasUnreadNotif,
    darkMode = false
  } = ctx;
  const t = STRINGS[lang];
  const [selected, setSelected] = React.useState(null);
  const [highlighted, setHighlighted] = React.useState(null);
  const [applied, setApplied] = React.useState({});
  const [isDesktop, setIsDesktop] = React.useState(() => window.innerWidth >= 900);
  React.useEffect(() => {
    const h = () => setIsDesktop(window.innerWidth >= 900);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  const notifCities = React.useMemo(() => {
    const set = new Set();
    Object.values(regionsByDay || {}).forEach(arr => (arr || []).forEach(c => set.add(c)));
    return [...set];
  }, [regionsByDay]);
  const activeDayCount = React.useMemo(() => Object.values(regionsByDay || {}).filter(arr => (arr || []).length > 0).length, [regionsByDay]);
  const jobs = QUICK_POOLS;
  const cardRefs = React.useRef({});
  const scrollToJob = id => {
    setHighlighted(id);
    const el = cardRefs.current[id];
    if (el) el.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
    setTimeout(() => setHighlighted(null), 1800);
  };

  // ── Shared job card (used on mobile + desktop) ────────────────
  const JobCard = ({
    j,
    compact = false
  }) => {
    const isApplied = !!applied[j.id];
    const isHighlighted = highlighted === j.id;
    const locked = user.tier === 'free';
    return /*#__PURE__*/React.createElement("article", {
      key: j.id,
      ref: el => {
        cardRefs.current[j.id] = el;
      },
      onClick: () => setSelected(j),
      style: {
        background: 'var(--pg-white)',
        borderRadius: 16,
        cursor: 'pointer',
        border: isHighlighted ? '1.5px solid var(--pg-blue-400)' : '1px solid var(--pg-ink-200)',
        boxShadow: isHighlighted ? '0 0 0 3px rgba(0,119,182,0.12), 0 6px 20px rgba(0,119,182,0.15)' : '0 2px 8px rgba(0,0,0,0.05)',
        transition: 'all .2s ease',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: 3,
        width: '100%',
        background: isApplied ? 'linear-gradient(90deg,#16A34A,#22C55E)' : locked ? 'linear-gradient(90deg,#6B7280,#9CA3AF)' : 'linear-gradient(90deg,#0077B6,#38BDF8)'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: compact ? '14px 16px' : '16px 18px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 11,
        fontWeight: 600,
        color: 'var(--pg-ink-500)'
      }
    }, Icon.clock(11, 'var(--pg-ink-400)'), " ", tr(j.when, lang)), isApplied && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        fontWeight: 700,
        padding: '2px 8px',
        borderRadius: 999,
        background: '#DCFCE7',
        color: '#15803D',
        letterSpacing: '0.04em'
      }
    }, "\u2713 ", t.applied), locked && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        fontWeight: 700,
        padding: '2px 8px',
        borderRadius: 999,
        background: 'var(--pg-ink-100)',
        color: 'var(--pg-ink-500)',
        letterSpacing: '0.04em',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3
      }
    }, Icon.lock(9, 'var(--pg-ink-400)'), " Premium")), /*#__PURE__*/React.createElement("h3", {
      style: {
        margin: '0 0 6px',
        fontFamily: 'var(--pg-font-display)',
        fontSize: compact ? 15 : 17,
        fontWeight: 800,
        letterSpacing: '-0.02em',
        lineHeight: 1.2,
        color: 'var(--pg-ink-900)'
      }
    }, tr(j.title, lang)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        fontSize: 12,
        color: 'var(--pg-ink-500)'
      }
    }, Icon.pin(12, 'var(--pg-blue-400)'), /*#__PURE__*/React.createElement("span", null, j.loc), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--pg-ink-300)'
      }
    }, "\xB7"), /*#__PURE__*/React.createElement("span", null, tr(j.dist, lang)))), /*#__PURE__*/React.createElement("div", {
      style: {
        flexShrink: 0,
        textAlign: 'right',
        padding: '8px 12px',
        borderRadius: 12,
        background: 'var(--pg-ink-50)',
        border: '1px solid var(--pg-ink-100)',
        minWidth: 72
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        fontWeight: 600,
        color: 'var(--pg-ink-400)',
        letterSpacing: '0.04em',
        marginBottom: 2
      }
    }, j.pools, " ", j.pools > 1 ? t.poolsWord : lang === 'pt' ? 'piscina' : 'pool'), j.price === 'neg' ? /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: 'var(--pg-ink-700)'
      }
    }, t.negotiable) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--pg-font-display)',
        fontSize: 22,
        fontWeight: 800,
        color: locked ? 'var(--pg-ink-400)' : 'var(--pg-blue-500)',
        letterSpacing: '-0.03em',
        lineHeight: 1,
        filter: locked ? 'blur(4px)' : 'none'
      }
    }, "$", j.price), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 9.5,
        color: 'var(--pg-ink-400)',
        marginTop: 1
      }
    }, t.perPool)))), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 1,
        background: 'var(--pg-ink-100)',
        margin: '0 0 12px'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: j.poster,
      size: 32
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--pg-ink-800)',
        lineHeight: 1.2
      }
    }, j.poster), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        marginTop: 2
      }
    }, /*#__PURE__*/React.createElement(Stars, {
      rating: j.rating,
      size: 10
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: 'var(--pg-ink-500)',
        fontWeight: 500
      }
    }, j.rating)))), locked ? /*#__PURE__*/React.createElement("button", {
      onClick: e => {
        e.stopPropagation();
        openPaywall();
      },
      style: {
        height: 36,
        padding: '0 16px',
        borderRadius: 999,
        border: 'none',
        cursor: 'pointer',
        background: 'linear-gradient(135deg, var(--pg-blue-700), oklch(0.45 0.15 230))',
        color: '#fff',
        fontFamily: 'inherit',
        fontSize: 12,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        boxShadow: '0 3px 10px rgba(0,119,182,0.35)'
      }
    }, Icon.lock(12, '#fff'), " ", t.unlock) : isApplied ? /*#__PURE__*/React.createElement("div", {
      style: {
        height: 36,
        padding: '0 16px',
        borderRadius: 999,
        background: '#DCFCE7',
        border: '1px solid #86EFAC',
        color: '#15803D',
        fontSize: 12,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }
    }, Icon.check(13, '#15803D'), " ", t.applied) : /*#__PURE__*/React.createElement("button", {
      onClick: e => {
        e.stopPropagation();
        setApplied({
          ...applied,
          [j.id]: true
        });
      },
      style: {
        height: 36,
        padding: '0 18px',
        borderRadius: 999,
        border: 'none',
        cursor: 'pointer',
        background: 'linear-gradient(135deg,#0077B6,#023E8A)',
        color: '#fff',
        fontFamily: 'inherit',
        fontSize: 13,
        fontWeight: 700,
        boxShadow: '0 3px 10px rgba(0,119,182,0.30)',
        transition: 'all .15s'
      }
    }, t.apply))));
  };

  // ── Sheet (mobile + desktop share the same) ───────────────────
  const JobSheet = () => /*#__PURE__*/React.createElement(Sheet, {
    open: !!selected,
    onClose: () => setSelected(null),
    height: "86%"
  }, selected && /*#__PURE__*/React.createElement(QuickPoolDetails, {
    job: selected,
    user: user,
    t: t,
    lang: lang,
    applied: !!applied[selected.id],
    onApply: () => setApplied({
      ...applied,
      [selected.id]: true
    }),
    onUnlock: openPaywall,
    onChat: openChat,
    onClose: () => setSelected(null)
  }));

  // ══════════════════════════════════════════════════════════════
  // ── DESKTOP LAYOUT ────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════
  if (isDesktop) {
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
        background: 'var(--pg-ink-50)'
      }
    }, function () {
      const _tx = darkMode ? '#fff' : '#0A2840';
      const _sub = darkMode ? 'rgba(255,255,255,0.50)' : 'rgba(10,40,64,0.50)';
      const _sub2 = darkMode ? 'rgba(255,255,255,0.55)' : 'rgba(10,40,64,0.55)';
      const _ib = darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(10,40,64,0.08)';
      const _ibr = darkMode ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(10,40,64,0.12)';
      const _cb = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(10,40,64,0.05)';
      const _cbr = darkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(10,40,64,0.10)';
      const _bg = darkMode ? 'linear-gradient(135deg, #011B5A 0%, #0077B6 55%, #0096C7 100%)' : 'linear-gradient(135deg, #e8f5ff 0%, #cfe9f8 60%, #b8dff5 100%)';
      return /*#__PURE__*/React.createElement("div", {
        style: {
          background: _bg,
          padding: '28px 40px 28px',
          position: 'relative',
          overflow: 'hidden'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'absolute',
          top: -80,
          right: -80,
          width: 280,
          height: 280,
          borderRadius: '50%',
          background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(10,40,64,0.03)',
          pointerEvents: 'none'
        }
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'absolute',
          bottom: -50,
          left: 160,
          width: 200,
          height: 200,
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
        src: "icone.png",
        alt: "",
        style: {
          position: 'absolute',
          left: '50%',
          top: '63%',
          transform: 'translate(-50%,-50%)',
          height: 235,
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
      }, /*#__PURE__*/React.createElement("svg", {
        width: "20",
        height: "20",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: _tx,
        strokeWidth: "1.75",
        strokeLinecap: "round"
      }, /*#__PURE__*/React.createElement("path", {
        d: "M2 12 Q6 8 10 12 Q14 16 18 12 Q20 10 22 12"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M2 17 Q6 13 10 17 Q14 21 18 17 Q20 15 22 17"
      }), /*#__PURE__*/React.createElement("circle", {
        cx: "12",
        cy: "5",
        r: "2"
      }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 9.5,
          fontWeight: 700,
          color: _sub,
          letterSpacing: '0.13em',
          textTransform: 'uppercase',
          marginBottom: 2
        }
      }, "QUICK POOLS \xB7 ", (county || 'BROWARD').toUpperCase()), /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: 'var(--pg-font-display)',
          fontSize: 20,
          fontWeight: 800,
          color: _tx,
          letterSpacing: '-0.025em',
          lineHeight: 1
        }
      }, lang === 'pt' ? 'Piscinas Rápidas' : lang === 'es' ? 'Piscinas Rápidas' : 'Express Pools'))), /*#__PURE__*/React.createElement("div", {
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
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }
      }, /*#__PURE__*/React.createElement("svg", {
        width: "13",
        height: "13",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: _sub2,
        strokeWidth: "1.75",
        strokeLinecap: "round"
      }, /*#__PURE__*/React.createElement("rect", {
        x: "2",
        y: "7",
        width: "20",
        height: "14",
        rx: "2"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M16 3 8 3"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M12 3v4"
      })), /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--pg-font-display)',
          fontSize: 15,
          fontWeight: 800,
          color: _tx,
          letterSpacing: '-0.02em'
        }
      }, jobs.length), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11,
          color: _sub,
          fontWeight: 500
        }
      }, lang === 'pt' ? 'vagas' : 'jobs')), /*#__PURE__*/React.createElement("div", {
        style: {
          width: 1,
          height: 18,
          background: darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(10,40,64,0.10)'
        }
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }
      }, Icon.cal(13, _sub2), /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--pg-font-display)',
          fontSize: 15,
          fontWeight: 800,
          color: '#34D399',
          letterSpacing: '-0.02em'
        }
      }, activeDayCount, "/7"), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11,
          color: _sub,
          fontWeight: 500
        }
      }, lang === 'pt' ? 'dias ativos' : 'active days')), /*#__PURE__*/React.createElement("div", {
        style: {
          width: 1,
          height: 18,
          background: darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(10,40,64,0.10)'
        }
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flex: 1,
          minWidth: 0
        }
      }, Icon.bell(13, _sub2), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 12,
          color: _sub,
          fontWeight: 500,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }
      }, notifCities.length > 0 ? notifCities.slice(0, 3).join(' · ') + (notifCities.length > 3 ? ` +${notifCities.length - 3}` : '') : lang === 'pt' ? 'Sem cidades' : 'No cities'))), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexShrink: 0
        }
      }, /*#__PURE__*/React.createElement("button", {
        onClick: openRegionEditor,
        style: {
          height: 38,
          padding: '0 14px',
          borderRadius: 11,
          border: _ibr,
          background: _ib,
          color: _tx,
          fontFamily: 'inherit',
          fontSize: 12,
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          transition: 'all .15s'
        }
      }, Icon.cal(13, _tx), " ", lang === 'pt' ? 'Editar' : 'Edit'), /*#__PURE__*/React.createElement("button", {
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
          position: 'relative'
        }
      }, Icon.msg(18, _tx), hasUnreadChat && /*#__PURE__*/React.createElement("span", {
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
          position: 'relative'
        }
      }, Icon.bell(18, _tx), hasUnreadNotif && /*#__PURE__*/React.createElement("span", {
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
      })))));
    }(), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '420px 1fr',
        gap: 0,
        minHeight: 'calc(100vh - 300px)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'sticky',
        top: 0,
        height: 'calc(100vh - 0px)',
        borderRight: '1px solid var(--pg-ink-200)',
        background: 'var(--pg-white)',
        overflow: 'hidden',
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement(LeafletMapBlock, {
      jobs: jobs,
      highlighted: highlighted,
      onPinClick: j => scrollToJob(j.id),
      fullHeight: true
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: 16,
        left: 16,
        right: 16,
        zIndex: 400,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        borderRadius: 12,
        padding: '10px 14px',
        border: '1px solid rgba(255,255,255,0.8)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, Icon.bell(13, 'var(--pg-blue-600)'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: 'var(--pg-blue-700)',
        lineHeight: 1.4,
        flex: 1
      }
    }, lang === 'pt' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("b", null, county, " County"), " \u2014 clique nos pins para ver detalhes") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("b", null, county, " County"), " \u2014 click pins to jump to job details")))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '28px 32px 60px',
        background: 'var(--pg-ink-50)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 20,
        fontWeight: 800,
        color: 'var(--pg-ink-900)',
        fontFamily: 'var(--pg-font-display)',
        letterSpacing: '-0.02em',
        lineHeight: 1
      }
    }, lang === 'pt' ? `${jobs.length} vagas disponíveis` : lang === 'es' ? `${jobs.length} trabajos disponibles` : `${jobs.length} jobs available`), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: 'var(--pg-ink-500)',
        marginTop: 4
      }
    }, lang === 'pt' ? `Broward County · ordenado por proximidade` : `${county} County · sorted by proximity`)), user.tier === 'free' && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '7px 14px',
        borderRadius: 999,
        background: 'linear-gradient(135deg,var(--pg-blue-50),#E0F2FE)',
        border: '1px solid var(--pg-blue-100)'
      }
    }, Icon.lock(12, 'var(--pg-blue-600)'), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 700,
        color: 'var(--pg-blue-700)'
      }
    }, lang === 'pt' ? 'Premium para se candidatar' : 'Premium to apply'))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }
    }, jobs.map(j => /*#__PURE__*/React.createElement(JobCard, {
      key: j.id,
      j: j
    })))))), /*#__PURE__*/React.createElement(JobSheet, null));
  }

  // ══════════════════════════════════════════════════════════════
  // ── MOBILE LAYOUT ─────────────────────────────────────────────
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
      overflowY: 'auto',
      background: 'var(--pg-bg)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(160deg, #011729 0%, #012D5C 45%, #014F8A 100%)',
      padding: `calc(env(safe-area-inset-top, 0px) + 14px) 20px 0`,
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: -70,
      right: -50,
      width: 210,
      height: 210,
      borderRadius: '50%',
      background: 'radial-gradient(circle,rgba(0,195,228,0.28) 0%,transparent 65%)',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: -30,
      width: 130,
      height: 130,
      borderRadius: '50%',
      background: 'radial-gradient(circle,rgba(0,119,182,0.22) 0%,transparent 70%)',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
      position: 'relative',
      zIndex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      background: 'rgba(255,255,255,0.12)',
      border: '0.5px solid rgba(255,255,255,0.2)',
      borderRadius: 20,
      padding: '5px 11px'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "rgba(255,255,255,0.75)",
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
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      color: 'rgba(255,255,255,0.75)',
      letterSpacing: '0.09em',
      textTransform: 'uppercase'
    }
  }, lang === 'pt' ? 'Piscinas Rápidas' : lang === 'es' ? 'Piscinas Rápidas' : 'Express Pools')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 7
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => openChat && openChat(),
    style: {
      width: 37,
      height: 37,
      borderRadius: 11,
      background: 'rgba(255,255,255,0.12)',
      border: '0.5px solid rgba(255,255,255,0.2)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, Icon.msg(18, '#fff')), hasUnreadChat && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 7,
      right: 7,
      width: 7,
      height: 7,
      borderRadius: '50%',
      background: '#FF3B30',
      border: '1.5px solid #011729',
      pointerEvents: 'none'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => openNotifications && openNotifications(),
    style: {
      width: 37,
      height: 37,
      borderRadius: 11,
      background: 'rgba(255,255,255,0.12)',
      border: '0.5px solid rgba(255,255,255,0.2)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, Icon.bell(18, '#fff')), hasUnreadNotif && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 7,
      right: 7,
      width: 7,
      height: 7,
      borderRadius: '50%',
      background: '#FF3B30',
      border: '1.5px solid #011729',
      pointerEvents: 'none'
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 1,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontFamily: 'var(--pg-font-display)',
      fontSize: 30,
      fontWeight: 800,
      color: '#fff',
      letterSpacing: '-0.03em',
      lineHeight: 1.1
    }
  }, lang === 'pt' ? 'Piscinas\nRápidas' : lang === 'es' ? 'Piscinas\nRápidas' : 'Express\nPools'), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 5,
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.5)',
      fontWeight: 500
    }
  }, jobs.length, " ", lang === 'pt' ? 'vagas disponíveis' : lang === 'es' ? 'trabajos disponibles' : 'jobs available'), activeDayCount > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 3,
      height: 3,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.25)',
      display: 'inline-block'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: '#34D399',
      fontWeight: 600
    }
  }, activeDayCount, "/7 ", lang === 'pt' ? 'dias ativos' : lang === 'es' ? 'días activos' : 'active days')))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 1,
      background: 'rgba(255,255,255,0.09)',
      border: '0.5px solid rgba(255,255,255,0.15)',
      borderBottom: 'none',
      backdropFilter: 'blur(16px)',
      borderRadius: '14px 14px 0 0',
      padding: '11px 14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      marginBottom: 3
    }
  }, Icon.bell(11, 'rgba(255,255,255,0.45)'), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      color: 'rgba(255,255,255,0.45)',
      letterSpacing: '0.09em',
      textTransform: 'uppercase'
    }
  }, lang === 'pt' ? 'Notificações por dia' : lang === 'es' ? 'Notif. por día' : 'Daily notifications')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: 'rgba(255,255,255,0.92)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, notifCities.length > 0 ? notifCities.slice(0, 3).join(' · ') + (notifCities.length > 3 ? ` +${notifCities.length - 3}` : '') : lang === 'pt' ? 'Nenhuma cidade configurada' : lang === 'es' ? 'Ninguna ciudad' : 'No cities set')), /*#__PURE__*/React.createElement("button", {
    onClick: openRegionEditor,
    style: {
      background: 'rgba(255,255,255,0.16)',
      border: '0.5px solid rgba(255,255,255,0.28)',
      color: '#fff',
      height: 32,
      padding: '0 13px',
      borderRadius: 9,
      fontSize: 12,
      fontWeight: 600,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      flexShrink: 0
    }
  }, Icon.cal(13, '#fff'), " ", lang === 'pt' ? 'Editar' : lang === 'es' ? 'Editar' : 'Edit'))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 18px 0'
    }
  }, /*#__PURE__*/React.createElement(LeafletMapBlock, {
    jobs: jobs,
    highlighted: highlighted,
    onPinClick: j => scrollToJob(j.id)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 18px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 12px',
      borderRadius: 11,
      background: 'var(--pg-blue-50)',
      border: '0.5px solid var(--pg-blue-100)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 9
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flexShrink: 0,
      marginTop: 1
    }
  }, Icon.bell(14, 'var(--pg-blue-700)')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: 'var(--pg-blue-700)',
      lineHeight: 1.4
    }
  }, lang === 'pt' ? /*#__PURE__*/React.createElement(React.Fragment, null, "Mostrando ", /*#__PURE__*/React.createElement("b", null, "todos os trabalhos do condado de ", county), ". Voc\xEA s\xF3 ser\xE1 ", /*#__PURE__*/React.createElement("b", null, "notificado"), " dos trabalhos nas cidades e dias configurados.") : /*#__PURE__*/React.createElement(React.Fragment, null, "Showing ", /*#__PURE__*/React.createElement("b", null, "all jobs in ", county, " County"), ". You're only ", /*#__PURE__*/React.createElement("b", null, "notified"), " for jobs in your configured cities and days.")))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 18px 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--pg-font-display)',
      fontSize: 15,
      fontWeight: 800,
      color: 'var(--pg-ink-900)',
      letterSpacing: '-0.01em'
    }
  }, lang === 'pt' ? `${jobs.length} vagas disponíveis` : lang === 'es' ? `${jobs.length} trabajos disponibles` : `${jobs.length} jobs available`), user.tier === 'free' && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--pg-blue-600)',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      fontWeight: 700
    }
  }, Icon.lock(11, 'var(--pg-blue-600)'), " Premium")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 18px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, jobs.map(j => /*#__PURE__*/React.createElement(JobCard, {
    key: j.id,
    j: j,
    compact: true
  })))), /*#__PURE__*/React.createElement(JobSheet, null));
}

// ── Real interactive map with Leaflet ────────────────────────
function LeafletMapBlock({
  jobs,
  highlighted,
  onPinClick,
  fullHeight = false
}) {
  const containerRef = React.useRef(null);
  const mapRef = React.useRef(null);
  const markersRef = React.useRef({});

  // Real Broward County / South Florida geocoordinates
  const COORDS = {
    'Boca Raton': [26.3683, -80.1289],
    'Coral Springs': [26.2712, -80.2706],
    'Davie': [26.0765, -80.2521],
    'Plantation': [26.1276, -80.2331],
    'Weston': [26.1003, -80.3997],
    'Fort Lauderdale': [26.1224, -80.1373],
    'Pompano Beach': [26.2379, -80.1248],
    'Hollywood': [26.0112, -80.1495]
  };
  React.useEffect(() => {
    if (!containerRef.current || typeof L === 'undefined') return;
    const map = L.map(containerRef.current, {
      center: [26.19, -80.22],
      zoom: 10,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      keyboard: false,
      // ← prevents Leaflet from setting tabindex + calling container.focus()
      tap: false // ← prevents iOS tap handler that triggers focus
    });

    // CartoDB light tiles — clean, Apple Maps-like aesthetic
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(map);

    // Attribution (small) bottom-left
    L.control.attribution({
      position: 'bottomleft',
      prefix: false
    }).addAttribution('© <a href="https://carto.com">CartoDB</a> © <a href="https://www.openstreetmap.org/copyright">OSM</a>').addTo(map);

    // Your-location pulse dot
    L.circleMarker([26.15, -80.22], {
      radius: 9,
      fillColor: '#4285F4',
      color: '#fff',
      weight: 2.5,
      fillOpacity: 1
    }).addTo(map);

    // Job price pins
    jobs.forEach(job => {
      const coords = COORDS[job.loc];
      if (!coords) return;
      const isNeg = job.price === 'neg';
      const lbl = isNeg ? 'NEG' : `$${job.price}`;
      const bg = isNeg ? '#f59e0b' : '#2563eb';
      const icon = L.divIcon({
        html: `<div style="background:${bg};color:#fff;font-size:11px;font-weight:700;padding:5px 9px;border-radius:14px;white-space:nowrap;box-shadow:0 3px 10px rgba(0,0,0,0.28);border:2.5px solid rgba(255,255,255,0.95);font-family:Inter,system-ui,sans-serif;line-height:1;">${lbl}</div>`,
        className: '',
        iconAnchor: [22, 14]
      });
      const marker = L.marker(coords, {
        icon
      }).addTo(map).on('click', () => onPinClick(job));
      markersRef.current[job.id] = marker;
    });
    mapRef.current = map;

    // Prevent Leaflet's map container from stealing focus and triggering scroll-into-view
    const container = map.getContainer();
    container.setAttribute('tabindex', '-1');
    container.addEventListener('focus', () => container.blur(), true);

    // Force recalc after layout settles
    setTimeout(() => {
      if (mapRef.current) mapRef.current.invalidateSize();
    }, 120);
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersRef.current = {};
    };
  }, []);

  // Pan to highlighted job
  React.useEffect(() => {
    if (!highlighted || !mapRef.current || !markersRef.current[highlighted]) return;
    mapRef.current.panTo(markersRef.current[highlighted].getLatLng(), {
      animate: true,
      duration: 0.4
    });
  }, [highlighted]);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: fullHeight ? '100%' : 200,
      overflow: 'hidden',
      padding: 0,
      border: fullHeight ? 'none' : '0.5px solid var(--pg-ink-200)',
      borderRadius: fullHeight ? 0 : 14,
      background: 'var(--pg-ink-100)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: containerRef,
    style: {
      height: '100%',
      width: '100%'
    }
  }));
}

// ── Detail view ──────────────────────────────────────────────
function QuickPoolDetails({
  job,
  user,
  t,
  lang,
  applied,
  onApply,
  onUnlock,
  onChat,
  onClose
}) {
  const locked = user.tier === 'free';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 0 100px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 18px 0',
      display: 'flex',
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("button", {
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
      padding: '4px 18px 0'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontFamily: 'var(--pg-font-display)',
      fontSize: 22,
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.2
    }
  }, tr(job.title, lang)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginTop: 8,
      fontSize: 13,
      color: 'var(--pg-ink-700)'
    }
  }, Icon.pin(14), " ", job.loc, " \xB7 ", tr(job.dist, lang)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      padding: '14px 16px',
      borderRadius: 14,
      background: 'var(--pg-blue-50)',
      border: '0.5px solid var(--pg-blue-100)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--pg-ink-500)',
      letterSpacing: '0.05em',
      fontWeight: 600
    }
  }, t.offer), job.price === 'neg' ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 700,
      marginTop: 2,
      fontFamily: 'var(--pg-font-display)'
    }
  }, t.negotiable) : /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--pg-font-display)',
      fontSize: 26,
      fontWeight: 700,
      color: 'var(--pg-blue-500)',
      letterSpacing: '-0.02em',
      marginTop: 2
    }
  }, "$", job.price, " ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'var(--pg-ink-500)',
      fontWeight: 500
    }
  }, "\xB7 ", t.perPool))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--pg-ink-500)',
      letterSpacing: '0.05em',
      fontWeight: 600
    }
  }, t.pools), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--pg-font-display)',
      fontSize: 26,
      fontWeight: 700,
      letterSpacing: '-0.02em',
      marginTop: 2
    }
  }, job.pools)), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--pg-ink-500)',
      letterSpacing: '0.05em',
      fontWeight: 600
    }
  }, t.whenLabel), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      marginTop: 2,
      maxWidth: 90
    }
  }, tr(job.when, lang)))), job.type === 'condo' && /*#__PURE__*/React.createElement("div", {
    className: "pg-card",
    style: {
      padding: '12px 14px',
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--pg-ink-500)',
      fontWeight: 600,
      letterSpacing: '0.05em',
      marginBottom: 8
    }
  }, t.accessDetails), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(DetailPill, {
    icon: Icon.key(14, 'var(--pg-blue-700)'),
    label: t.gateCode,
    value: locked ? '••••' : '8472*'
  }), /*#__PURE__*/React.createElement(DetailPill, {
    icon: Icon.user(14, 'var(--pg-blue-700)'),
    label: t.doorman,
    value: job.doorman ? t.yes : t.no
  }), /*#__PURE__*/React.createElement(DetailPill, {
    icon: Icon.dog(14, 'var(--pg-blue-700)'),
    label: t.dogLbl,
    value: job.dog ? t.yes : t.no
  }), /*#__PURE__*/React.createElement(DetailPill, {
    icon: Icon.pool(14, 'var(--pg-blue-700)'),
    label: t.saltwater,
    value: t.yes
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--pg-ink-500)',
      fontWeight: 600,
      letterSpacing: '0.05em',
      marginBottom: 6
    }
  }, t.description), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 14,
      lineHeight: 1.5,
      color: 'var(--pg-ink-700)'
    }
  }, tr(job.body, lang))), /*#__PURE__*/React.createElement("div", {
    className: "pg-card",
    style: {
      padding: 14,
      marginTop: 14,
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: job.poster,
    size: 48
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 600
    }
  }, job.poster), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 12,
      color: 'var(--pg-ink-500)',
      marginTop: 2
    }
  }, /*#__PURE__*/React.createElement(Stars, {
    rating: job.rating,
    size: 11
  }), " ", job.rating, " \xB7 26 ", t.completedJobs)), /*#__PURE__*/React.createElement("span", {
    className: "pg-chip pg-chip-aqua",
    style: {
      fontSize: 11
    }
  }, Icon.shield(11, 'var(--pg-aqua-700)'), " ", t.verified)), locked && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      padding: 16,
      borderRadius: 14,
      color: '#fff',
      background: 'linear-gradient(135deg, var(--pg-blue-700), oklch(0.45 0.15 230))',
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start'
    }
  }, Icon.crown(22, 'oklch(0.85 0.15 90)'), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--pg-font-display)',
      fontSize: 14,
      fontWeight: 700
    }
  }, t.premiumUnlocks), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      opacity: 0.85,
      marginTop: 3,
      lineHeight: 1.4
    }
  }, t.premiumUnlocksDesc), /*#__PURE__*/React.createElement("button", {
    onClick: onUnlock,
    className: "pg-btn pg-btn-aqua",
    style: {
      height: 36,
      padding: '0 14px',
      fontSize: 13,
      marginTop: 10,
      borderRadius: 999
    }
  }, t.unlockPrice)))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'sticky',
      bottom: 0,
      padding: '12px 18px',
      background: 'linear-gradient(180deg, transparent, var(--pg-white) 25%)',
      display: 'flex',
      gap: 10,
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => onChat(job.author_id ? {
      id: job.author_id,
      name: job.poster
    } : job.poster),
    disabled: locked,
    className: "pg-btn pg-btn-ghost",
    style: {
      flex: 1,
      opacity: locked ? 0.5 : 1,
      borderRadius: 999
    }
  }, Icon.msg(16, 'var(--pg-blue-700)'), " ", t.contact), /*#__PURE__*/React.createElement("button", {
    onClick: locked ? onUnlock : onApply,
    className: `pg-btn ${applied ? 'pg-btn-ghost' : 'pg-btn-primary'}`,
    style: {
      flex: 2,
      borderRadius: 999
    }
  }, locked ? /*#__PURE__*/React.createElement(React.Fragment, null, Icon.lock(14, '#fff'), " ", t.unlockApply) : applied ? /*#__PURE__*/React.createElement(React.Fragment, null, Icon.check(15, 'var(--pg-blue-700)'), " ", t.applied) : /*#__PURE__*/React.createElement(React.Fragment, null, t.apply, " \u2014 ", t.fastTrack))));
}
function DetailPill({
  icon,
  label,
  value
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 10px',
      borderRadius: 10,
      background: 'var(--pg-blue-50)'
    }
  }, icon, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: 'var(--pg-ink-500)',
      textTransform: 'uppercase',
      letterSpacing: '0.04em'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      marginTop: 1
    }
  }, value)));
}
Object.assign(window, {
  QuickPoolsScreen
});