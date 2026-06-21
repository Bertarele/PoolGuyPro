// profile.jsx — personal info, subscription, my posts, settings

function ProfileScreen({
  ctx
}) {
  const {
    lang,
    user,
    setUser,
    openPaywall,
    regions,
    openRegionEditor,
    openLanguagePicker,
    openApplicants,
    openVerification,
    openPushNotif,
    openFeedback,
    openEditProfile,
    onLogout,
    openHelp,
    openPrivacy,
    darkMode,
    toggleDark,
    openChat,
    hasUnreadChat,
    openNotifications,
    hasUnreadNotif,
    requestVerification,
    openWallet,
    isDesktop = false,
    retryPush,
    pushLog = ''
  } = ctx;
  const t = STRINGS[lang];
  const typeIcon = type => {
    if (type === 'quickpool') return Icon.bolt(13, 'var(--pg-blue-600)');
    if (type === 'vacation') return Icon.cal(13, 'var(--pg-blue-600)');
    return Icon.cart(13, 'var(--pg-blue-600)');
  };
  const typeLabel = type => {
    if (type === 'quickpool') return lang === 'pt' ? 'Piscina Rápida' : lang === 'es' ? 'Piscina Rápida' : 'Quick Pool';
    if (type === 'vacation') return lang === 'pt' ? 'Férias' : lang === 'es' ? 'Vacaciones' : 'Vacation';
    return lang === 'pt' ? 'Mercado' : lang === 'es' ? 'Mercado' : 'Marketplace';
  };
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
      centerDecor: /*#__PURE__*/React.createElement("img", {
        src: "icone.png",
        alt: "",
        style: {
          height: 280,
          objectFit: 'contain',
          opacity: 0.60,
          userSelect: 'none',
          transform: 'translateY(-10px)'
        }
      }),
      title: /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 10,
          fontWeight: 600,
          color: H.sub,
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
          marginBottom: 3
        }
      }, t.myProfile), (() => {
        const dn = user.name && !user.name.includes('@') ? user.name : user.email ? user.email.split('@')[0] : '';
        const parts = dn.split(' ');
        return /*#__PURE__*/React.createElement("div", {
          style: {
            fontFamily: 'var(--pg-font-display)',
            fontSize: 21,
            fontWeight: 700,
            letterSpacing: '-0.025em',
            lineHeight: 1.1,
            color: H.text
          }
        }, parts[0], " ", /*#__PURE__*/React.createElement("span", {
          style: {
            fontWeight: 400,
            opacity: 0.70
          }
        }, parts.slice(1).join(' ')));
      })()),
      right: /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }
      }, !isDesktop && /*#__PURE__*/React.createElement("div", {
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
      })), !isDesktop && /*#__PURE__*/React.createElement("div", {
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
      })), /*#__PURE__*/React.createElement("button", {
        onClick: toggleDark,
        style: {
          width: 36,
          height: 36,
          borderRadius: 10,
          border: 'none',
          cursor: 'pointer',
          background: H.iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background .15s'
        },
        title: darkMode ? 'Light mode' : 'Dark mode'
      }, darkMode ? /*#__PURE__*/React.createElement("svg", {
        width: "18",
        height: "18",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "#FFD60A",
        strokeWidth: "2",
        strokeLinecap: "round"
      }, /*#__PURE__*/React.createElement("circle", {
        cx: "12",
        cy: "12",
        r: "5"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "12",
        y1: "1",
        x2: "12",
        y2: "3"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "12",
        y1: "21",
        x2: "12",
        y2: "23"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "4.22",
        y1: "4.22",
        x2: "5.64",
        y2: "5.64"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "18.36",
        y1: "18.36",
        x2: "19.78",
        y2: "19.78"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "1",
        y1: "12",
        x2: "3",
        y2: "12"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "21",
        y1: "12",
        x2: "23",
        y2: "12"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "4.22",
        y1: "19.78",
        x2: "5.64",
        y2: "18.36"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "18.36",
        y1: "5.64",
        x2: "19.78",
        y2: "4.22"
      })) : /*#__PURE__*/React.createElement("svg", {
        width: "18",
        height: "18",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: ic,
        strokeWidth: "2",
        strokeLinecap: "round"
      }, /*#__PURE__*/React.createElement("path", {
        d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
      }))), /*#__PURE__*/React.createElement(IconButton, {
        dark: darkMode,
        onClick: openEditProfile
      }, Icon.more(16, ic)))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        marginTop: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: openEditProfile,
      style: {
        border: 'none',
        background: 'none',
        padding: 0,
        cursor: 'pointer',
        borderRadius: '50%',
        display: 'block'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 72,
        height: 72,
        borderRadius: '50%',
        padding: 3,
        background: 'linear-gradient(135deg, var(--pg-aqua-500) 0%, #0077B6 100%)',
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: user.name,
      size: 66,
      src: user.photoUrl
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 3,
        borderRadius: '50%',
        background: 'rgba(0,0,0,0.28)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0,
        transition: 'opacity .15s'
      },
      onMouseEnter: e => e.currentTarget.style.opacity = 1,
      onMouseLeave: e => e.currentTarget.style.opacity = 0
    }, /*#__PURE__*/React.createElement("svg", {
      width: "20",
      height: "20",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "#fff",
      strokeWidth: "2",
      strokeLinecap: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "13",
      r: "4"
    }))))), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        bottom: 1,
        right: 1,
        width: 22,
        height: 22,
        borderRadius: '50%',
        background: 'var(--pg-aqua-500)',
        border: `2.5px solid ${darkMode ? '#011B5A' : '#d0e8f5'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, Icon.check(12, '#fff'))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        flexWrap: 'wrap'
      }
    }, user.tier === 'pro' && /*#__PURE__*/React.createElement("span", {
      className: "pg-badge pg-badge-pro",
      style: {
        fontSize: 10
      }
    }, "PRO"), user.tier === 'premium' && /*#__PURE__*/React.createElement("span", {
      className: "pg-badge pg-badge-premium",
      style: {
        fontSize: 10
      }
    }, Icon.crown(10, '#92400E'), " PREMIUM"), /*#__PURE__*/React.createElement(ReputationBadge, {
      jobs: user.reviews,
      lang: lang,
      size: "lg"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginTop: 6
      }
    }, /*#__PURE__*/React.createElement(Stars, {
      rating: user.rating,
      size: 13
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: H.mid
      }
    }, user.rating), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: H.faint
      }
    }, "(", user.reviews, " ", lang === 'pt' ? 'avaliações' : lang === 'es' ? 'reseñas' : 'reviews', ")")), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 5,
        display: 'flex',
        alignItems: 'center',
        gap: 5
      }
    }, Icon.pin(10, H.faint), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: H.faint
      }
    }, "Broward County, FL")))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        marginTop: 14,
        paddingTop: 13,
        borderTop: `1px solid ${H.border}`
      }
    }, [{
      val: user.rating,
      lbl: lang === 'pt' ? 'Avaliação' : lang === 'es' ? 'Calificación' : 'Rating'
    }, {
      val: user.reviews,
      lbl: lang === 'pt' ? 'Trabalhos' : lang === 'es' ? 'Trabajos' : 'Jobs Done'
    }, {
      val: EQUIPMENT.filter(e => e).length + POOL_ROUTES.length,
      lbl: lang === 'pt' ? 'Anúncios' : lang === 'es' ? 'Anuncios' : 'Listings'
    }].map((s, i, arr) => /*#__PURE__*/React.createElement(React.Fragment, {
      key: i
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--pg-font-display)',
        fontSize: 20,
        fontWeight: 700,
        lineHeight: 1,
        color: H.text,
        letterSpacing: '-0.02em'
      }
    }, s.val), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 9.5,
        color: H.sub,
        fontWeight: 600,
        letterSpacing: '0.05em',
        textTransform: 'uppercase'
      }
    }, s.lbl)), i < arr.length - 1 && /*#__PURE__*/React.createElement("div", {
      style: {
        width: 1,
        background: H.divider,
        margin: '0 4px'
      }
    })))));
  })(), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 18px',
      marginTop: -2,
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "pg-card",
    style: {
      padding: '13px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 44,
      height: 44,
      borderRadius: 12,
      flexShrink: 0,
      background: 'linear-gradient(135deg, var(--pg-blue-900), oklch(0.38 0.16 245))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "oklch(0.82 0.12 178)",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "1",
    x2: "12",
    y2: "23"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--pg-ink-500)',
      fontWeight: 600,
      letterSpacing: '0.02em'
    }
  }, lang === 'pt' ? 'ESTA SEMANA' : lang === 'es' ? 'ESTA SEMANA' : 'THIS WEEK'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--pg-font-display)',
      fontSize: 24,
      fontWeight: 700,
      color: 'var(--pg-blue-500)',
      letterSpacing: '-0.03em',
      lineHeight: 1.1
    }
  }, "$", WALLET_DATA.weekEarnings)), /*#__PURE__*/React.createElement("button", {
    onClick: openWallet,
    className: "pg-btn pg-btn-ghost",
    style: {
      height: 36,
      padding: '0 14px',
      fontSize: 13,
      borderRadius: 999,
      flexShrink: 0
    }
  }, lang === 'pt' ? 'Carteira' : lang === 'es' ? 'Cartera' : 'Wallet', " ", Icon.chev(13, 'var(--pg-blue-700)'))), /*#__PURE__*/React.createElement(SubscriptionCard, {
    user: user,
    setUser: setUser,
    openPaywall: openPaywall,
    t: t,
    lang: lang,
    isDesktop: isDesktop
  }), /*#__PURE__*/React.createElement(PersonalInfoCard, {
    user: user,
    setUser: setUser,
    lang: lang
  }), (() => {
    const [warnings, setWarnings] = React.useState(null); // null = loading, [] = none
    const [newIds, setNewIds] = React.useState(new Set());
    React.useEffect(() => {
      if (!user?.uid || !window.sb) return;
      window.sb.from('user_warnings').select('id,reason,severity,created_at').eq('user_id', user.uid).order('created_at', {
        ascending: false
      }).then(({
        data
      }) => {
        const all = data || [];
        setWarnings(all);
        // Detectar advertências novas via localStorage
        try {
          const seenRaw = localStorage.getItem('pg_seen_warn_' + user.uid);
          const seen = seenRaw ? new Set(JSON.parse(seenRaw)) : new Set();
          const fresh = new Set(all.filter(w => !seen.has(w.id)).map(w => w.id));
          if (fresh.size > 0) setNewIds(fresh);
          // Marcar como vistas após 4s
          setTimeout(() => {
            const allIds = all.map(w => w.id);
            localStorage.setItem('pg_seen_warn_' + user.uid, JSON.stringify(allIds));
            setNewIds(new Set());
          }, 4000);
        } catch (e) {}
      }).catch(() => setWarnings([]));
    }, [user?.uid]);
    if (!warnings || warnings.length === 0) return null;

    // Mapa de pontos
    const ptMap = {
      leve: 1,
      medio: 2,
      grave: 5,
      warning: 1,
      suspension: 3,
      banned: 5
    };
    const totalPts = warnings.reduce((s, w) => s + (ptMap[w.severity] || 1), 0);
    const pctBar = Math.min(100, totalPts / 5 * 100);
    const barColor = totalPts >= 5 ? '#EF4444' : totalPts >= 3 ? '#F97316' : '#F59E0B';
    const warnLabel = s => {
      if (s === 'banned' || s === 'ban') return lang === 'pt' ? 'Banimento' : lang === 'es' ? 'Baneo' : 'Ban';
      if (s === 'suspension') return lang === 'pt' ? 'Suspensão' : lang === 'es' ? 'Suspensión' : 'Suspension';
      if (s === 'grave') return lang === 'pt' ? 'Grave' : lang === 'es' ? 'Grave' : 'Severe';
      if (s === 'medio') return lang === 'pt' ? 'Médio' : lang === 'es' ? 'Medio' : 'Moderate';
      return lang === 'pt' ? 'Leve' : lang === 'es' ? 'Leve' : 'Light';
    };
    const warnPts = s => s === 'grave' ? 5 : s === 'medio' ? 2 : s === 'banned' || s === 'ban' ? 5 : s === 'suspension' ? 3 : 1;
    const warnColor = s => s === 'banned' || s === 'ban' || s === 'grave' ? '#EF4444' : s === 'medio' ? '#F97316' : '#F59E0B';
    const fmtDate = d => new Date(d).toLocaleDateString(lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : 'en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const headerTitle = lang === 'pt' ? `Você tem ${warnings.length} advertência${warnings.length !== 1 ? 's' : ''} — ${totalPts}/5 pontos` : lang === 'es' ? `Tienes ${warnings.length} advertencia${warnings.length !== 1 ? 's' : ''} — ${totalPts}/5 puntos` : `You have ${warnings.length} warning${warnings.length !== 1 ? 's' : ''} — ${totalPts}/5 points`;
    const headerSub = lang === 'pt' ? 'Ao acumular 5 pontos sua conta é banida automaticamente.' : lang === 'es' ? 'Al acumular 5 puntos tu cuenta es baneada automáticamente.' : 'Reaching 5 points results in an automatic account ban.';
    return /*#__PURE__*/React.createElement("div", {
      style: {
        borderRadius: 16,
        overflow: 'hidden',
        border: `1.5px solid ${barColor}50`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '13px 16px',
        background: `rgba(${totalPts >= 5 ? '239,68,68' : totalPts >= 3 ? '249,115,22' : '245,158,11'},0.09)`,
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 38,
        height: 38,
        borderRadius: '50%',
        flexShrink: 0,
        background: `rgba(${totalPts >= 5 ? '239,68,68' : totalPts >= 3 ? '249,115,22' : '245,158,11'},0.15)`,
        border: `1.5px solid ${barColor}50`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18
      }
    }, newIds.size > 0 ? '🆕' : '⚠️'), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 800,
        color: barColor
      }
    }, headerTitle), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: barColor,
        opacity: 0.8,
        marginTop: 2
      }
    }, headerSub))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '10px 16px 2px',
        background: 'var(--pg-ink-50)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        fontWeight: 700,
        color: 'var(--pg-ink-400)',
        textTransform: 'uppercase',
        letterSpacing: '.06em'
      }
    }, lang === 'pt' ? 'Pontos acumulados' : lang === 'es' ? 'Puntos acumulados' : 'Accumulated points'), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 800,
        color: barColor
      }
    }, totalPts, "/5")), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 7,
        borderRadius: 99,
        background: 'var(--pg-ink-200)',
        overflow: 'hidden',
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: '100%',
        borderRadius: 99,
        background: barColor,
        width: `${pctBar}%`,
        transition: 'width .5s ease'
      }
    }))), warnings.map((w, i) => {
      const isNew = newIds.has(w.id);
      const c = warnColor(w.severity);
      return /*#__PURE__*/React.createElement("div", {
        key: w.id,
        style: {
          padding: '11px 16px',
          borderTop: `1px solid ${c}20`,
          background: isNew ? `rgba(${c.replace('#', '').match(/../g).map(x => parseInt(x, 16)).join(',')},0.06)` : i % 2 === 0 ? 'var(--pg-white)' : 'var(--pg-ink-50)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          flexShrink: 0,
          marginTop: 1
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 10,
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: 999,
          color: c,
          background: `${c}18`,
          border: `1px solid ${c}40`,
          whiteSpace: 'nowrap'
        }
      }, warnLabel(w.severity)), w.severity !== 'banned' && w.severity !== 'ban' && w.severity !== 'suspension' && /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 9,
          fontWeight: 700,
          color: c,
          opacity: 0.75
        }
      }, "+", warnPts(w.severity), "pt")), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          minWidth: 0
        }
      }, isNew && /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 10,
          fontWeight: 700,
          color: c,
          marginBottom: 3
        }
      }, "\uD83C\uDD95 ", lang === 'pt' ? 'Nova advertência' : lang === 'es' ? 'Nueva advertencia' : 'New warning'), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 13,
          color: 'var(--pg-ink-800)',
          lineHeight: 1.5
        }
      }, w.reason), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 11,
          color: 'var(--pg-ink-400)',
          marginTop: 3
        }
      }, fmtDate(w.created_at))));
    }));
  })(), (() => {
    const hasName = !!(user.name && !user.name.includes('@') && user.name.trim().length > 1);
    const hasPhone = !!user.phone?.trim();
    const hasPhoto = !!user.photoUrl;
    const profileComplete = hasName && hasPhone && hasPhoto;
    if (user.verified) return /*#__PURE__*/React.createElement("div", {
      style: {
        borderRadius: 14,
        padding: '14px 16px',
        background: 'rgba(22,163,74,0.08)',
        border: '1.5px solid rgba(22,163,74,0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 38,
        height: 38,
        borderRadius: '50%',
        background: '#16A34A',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "18",
      height: "18",
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
        color: '#16A34A'
      }
    }, lang === 'pt' ? '✓ Identidade verificada' : '✓ Identity verified'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: '#16A34A',
        opacity: 0.8,
        marginTop: 2
      }
    }, lang === 'pt' ? 'Seu badge verde aparece para quem ver seus posts e pedidos de aluguel.' : 'Your green badge is visible on your posts and rental requests.')));
    if (user.verificationRequested) return /*#__PURE__*/React.createElement("div", {
      style: {
        borderRadius: 14,
        padding: '14px 16px',
        background: 'rgba(245,158,11,0.08)',
        border: '1.5px solid rgba(245,158,11,0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 24,
        flexShrink: 0
      }
    }, "\u23F3"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        fontWeight: 700,
        color: '#F59E0B'
      }
    }, lang === 'pt' ? 'Verificação em análise' : 'Verification under review'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: '#F59E0B',
        opacity: 0.8,
        marginTop: 2
      }
    }, lang === 'pt' ? 'Nossa equipe vai analisar em breve. Você será notificado.' : 'Our team will review shortly. You will be notified.')));
    return /*#__PURE__*/React.createElement("div", {
      style: {
        borderRadius: 14,
        overflow: 'hidden',
        border: '1.5px solid var(--pg-ink-200)'
      }
    }, !profileComplete && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '12px 16px',
        background: 'rgba(245,158,11,0.06)',
        borderBottom: '1px solid rgba(245,158,11,0.2)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 700,
        color: '#F59E0B',
        marginBottom: 6
      }
    }, lang === 'pt' ? '⚠ Complete seu perfil para alugar equipamentos:' : '⚠ Complete your profile to rent equipment:'), !hasPhoto && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: '#F59E0B',
        marginBottom: 2
      }
    }, "\u2022 ", lang === 'pt' ? 'Adicione uma foto de perfil' : 'Add a profile photo'), !hasName && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: '#F59E0B',
        marginBottom: 2
      }
    }, "\u2022 ", lang === 'pt' ? 'Adicione seu nome completo' : 'Add your full name'), !hasPhone && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: '#F59E0B',
        marginBottom: 2
      }
    }, "\u2022 ", lang === 'pt' ? 'Adicione seu telefone' : 'Add your phone number')), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '14px 16px',
        background: 'var(--pg-white)',
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 38,
        height: 38,
        borderRadius: '50%',
        background: 'var(--pg-ink-100)',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, Icon.shield(18, 'var(--pg-ink-500)')), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        fontWeight: 700,
        color: 'var(--pg-ink-900)'
      }
    }, lang === 'pt' ? 'Verificar identidade' : 'Verify identity'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--pg-ink-500)',
        marginTop: 2
      }
    }, lang === 'pt' ? 'Badge ✓ verde nos seus posts e pedidos de aluguel.' : 'Green ✓ badge on your posts and rental requests.')), /*#__PURE__*/React.createElement("button", {
      onClick: async () => {
        if (requestVerification) await requestVerification();
      },
      disabled: !profileComplete,
      style: {
        padding: '9px 16px',
        borderRadius: 10,
        border: 'none',
        cursor: profileComplete ? 'pointer' : 'not-allowed',
        fontFamily: 'inherit',
        fontSize: 13,
        fontWeight: 700,
        background: profileComplete ? '#16A34A' : 'var(--pg-ink-200)',
        color: profileComplete ? '#fff' : 'var(--pg-ink-400)',
        flexShrink: 0,
        opacity: profileComplete ? 1 : 0.6,
        transition: 'all .15s'
      }
    }, lang === 'pt' ? 'Solicitar' : 'Request')));
  })(), /*#__PURE__*/React.createElement(SavedSection, {
    user: user,
    lang: lang
  }), /*#__PURE__*/React.createElement(HistorySection, {
    user: user,
    lang: lang
  }), /*#__PURE__*/React.createElement(PurchasesSection, {
    user: user,
    lang: lang
  }), /*#__PURE__*/React.createElement(Section, {
    title: t.workRegions,
    action: t.edit,
    onAction: openRegionEditor
  }, /*#__PURE__*/React.createElement("div", {
    className: "pg-card",
    style: {
      padding: '12px 14px'
    }
  }, regions && regions.length > 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 6
    }
  }, regions.slice(0, 8).map(r => /*#__PURE__*/React.createElement("span", {
    key: r,
    className: "pg-chip pg-chip-aqua",
    style: {
      padding: '5px 10px',
      fontSize: 12
    }
  }, Icon.pin(11, 'var(--pg-aqua-700)'), " ", r)), regions.length > 8 && /*#__PURE__*/React.createElement("span", {
    className: "pg-chip",
    style: {
      padding: '5px 10px',
      fontSize: 12
    }
  }, "+", regions.length - 8)) : /*#__PURE__*/React.createElement("button", {
    onClick: openRegionEditor,
    style: {
      border: 'none',
      background: 'transparent',
      color: 'var(--pg-blue-500)',
      fontSize: 13,
      fontWeight: 600,
      cursor: 'pointer',
      padding: 0
    }
  }, Icon.plus(13, 'var(--pg-blue-500)'), " ", t.add))), /*#__PURE__*/React.createElement(Section, {
    title: t.myPosts
  }, /*#__PURE__*/React.createElement("div", {
    className: "pg-card",
    style: {
      padding: 0,
      overflow: 'hidden'
    }
  }, MY_POSTS.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 14px',
      fontSize: 13,
      color: 'var(--pg-ink-500)'
    }
  }, t.noPostsYet) : MY_POSTS.map((post, idx) => {
    const pendingCount = post.applicants.filter(a => a.status === 'pending').length;
    const isLast = idx === MY_POSTS.length - 1;
    return /*#__PURE__*/React.createElement("div", {
      key: post.id,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 14px',
        borderBottom: isLast ? 'none' : '0.5px solid var(--pg-ink-100)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 36,
        height: 36,
        borderRadius: 9,
        background: 'var(--pg-blue-100)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }
    }, typeIcon(post.type)), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        letterSpacing: '-0.01em'
      }
    }, tr(post.title, lang)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'var(--pg-ink-500)',
        marginTop: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        background: 'var(--pg-ink-100)',
        borderRadius: 5,
        padding: '1px 6px',
        fontSize: 10,
        fontWeight: 600,
        color: 'var(--pg-ink-600)'
      }
    }, typeLabel(post.type)), Icon.pin(10, 'var(--pg-ink-400)'), " ", post.loc)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 5,
        flexShrink: 0
      }
    }, pendingCount > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        fontWeight: 700,
        padding: '2px 7px',
        borderRadius: 8,
        background: 'var(--pg-blue-500)',
        color: '#fff'
      }
    }, pendingCount, " new"), /*#__PURE__*/React.createElement("button", {
      onClick: () => openApplicants && openApplicants(post),
      style: {
        border: 'none',
        background: 'var(--pg-blue-100)',
        color: 'var(--pg-blue-700)',
        fontSize: 11,
        fontWeight: 700,
        padding: '5px 10px',
        borderRadius: 8,
        cursor: 'pointer',
        fontFamily: 'inherit',
        display: 'flex',
        alignItems: 'center',
        gap: 4
      }
    }, t.applicantsPanelTitle, " ", Icon.chev(11, 'var(--pg-blue-600)'))));
  }))), /*#__PURE__*/React.createElement(Section, {
    title: t.settings
  }, /*#__PURE__*/React.createElement("div", {
    className: "pg-card",
    style: {
      padding: 0
    }
  }, /*#__PURE__*/React.createElement(SettingRow, {
    icon: darkMode ? /*#__PURE__*/React.createElement("svg", {
      width: "18",
      height: "18",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "#F59E0B",
      strokeWidth: "2",
      strokeLinecap: "round"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "5"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "1",
      x2: "12",
      y2: "3"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "21",
      x2: "12",
      y2: "23"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "4.22",
      y1: "4.22",
      x2: "5.64",
      y2: "5.64"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "18.36",
      y1: "18.36",
      x2: "19.78",
      y2: "19.78"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "1",
      y1: "12",
      x2: "3",
      y2: "12"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "21",
      y1: "12",
      x2: "23",
      y2: "12"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "4.22",
      y1: "19.78",
      x2: "5.64",
      y2: "18.36"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "18.36",
      y1: "5.64",
      x2: "19.78",
      y2: "4.22"
    })) : /*#__PURE__*/React.createElement("svg", {
      width: "18",
      height: "18",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "var(--pg-blue-500)",
      strokeWidth: "2",
      strokeLinecap: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
    })),
    label: lang === 'pt' ? 'Modo Escuro' : lang === 'es' ? 'Modo Oscuro' : 'Dark Mode',
    right: /*#__PURE__*/React.createElement("div", {
      onClick: e => {
        e.stopPropagation();
        toggleDark && toggleDark();
      },
      className: 'pg-toggle' + (darkMode ? ' on' : ''),
      style: {
        flexShrink: 0
      }
    }),
    onClick: toggleDark
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SettingRow, {
    icon: Icon.bell(18, 'var(--pg-blue-500)'),
    label: t.notifications,
    detail: pushLog.startsWith('✅') ? lang === 'pt' ? 'Ativas' : 'Active' : lang === 'pt' ? 'Verificar' : 'Check',
    chev: true,
    onClick: openPushNotif
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '4px 16px 10px',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      flex: 1,
      lineHeight: 1.3,
      color: pushLog.startsWith('✅') ? '#16A34A' : pushLog.startsWith('❌') ? '#DC2626' : 'var(--pg-ink-400)'
    }
  }, pushLog || (lang === 'pt' ? 'Toque para ativar notificações push' : 'Tap to enable push notifications')), !pushLog.startsWith('✅') && /*#__PURE__*/React.createElement("button", {
    onClick: retryPush,
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: 'var(--pg-blue-500)',
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      padding: '4px 8px',
      whiteSpace: 'nowrap',
      flexShrink: 0
    }
  }, lang === 'pt' ? 'Ativar' : 'Enable'))), /*#__PURE__*/React.createElement(SettingRow, {
    icon: Icon.globe(18, 'var(--pg-blue-500)'),
    label: t.languageLbl,
    detail: {
      en: t.english,
      pt: t.portuguese,
      es: t.spanish
    }[lang],
    chev: true,
    onClick: openLanguagePicker
  }), /*#__PURE__*/React.createElement(SettingRow, {
    icon: Icon.shield(18, 'var(--pg-blue-500)'),
    label: t.verification,
    detail: t.verified,
    chev: true,
    onClick: openVerification
  }), /*#__PURE__*/React.createElement(SettingRow, {
    icon: Icon.msg(18, 'var(--pg-blue-500)'),
    label: t.helpSupport,
    chev: true,
    onClick: openHelp
  }), /*#__PURE__*/React.createElement(SettingRow, {
    icon: /*#__PURE__*/React.createElement("svg", {
      width: "18",
      height: "18",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "var(--pg-blue-500)",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
    })),
    label: lang === 'pt' ? 'Enviar Feedback' : lang === 'es' ? 'Enviar Feedback' : 'Send Feedback',
    detail: lang === 'pt' ? 'Beta' : 'Beta',
    chev: true,
    onClick: openFeedback
  }), /*#__PURE__*/React.createElement(SettingRow, {
    icon: Icon.lock(18, 'var(--pg-blue-500)'),
    label: t.privacy,
    chev: true,
    last: true,
    onClick: openPrivacy
  }))), user.role === 'admin' && /*#__PURE__*/React.createElement("button", {
    onClick: () => window.open('admin.html', '_blank'),
    style: {
      width: '100%',
      padding: '13px 14px',
      borderRadius: 12,
      marginBottom: 10,
      border: '1px solid rgba(14,186,199,0.35)',
      background: 'linear-gradient(135deg, rgba(14,186,199,0.12), rgba(13,114,128,0.08))',
      color: '#0EBAC7',
      fontWeight: 700,
      fontSize: 14,
      cursor: 'pointer',
      fontFamily: 'inherit',
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
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
  })), lang === 'pt' ? 'Painel Admin' : lang === 'es' ? 'Panel Admin' : 'Admin Panel'), /*#__PURE__*/React.createElement("button", {
    onClick: onLogout,
    style: {
      width: '100%',
      padding: '13px 14px',
      borderRadius: 12,
      border: '1px solid var(--pg-ink-200)',
      background: 'transparent',
      color: 'var(--pg-danger)',
      fontWeight: 600,
      fontSize: 14,
      cursor: 'pointer',
      fontFamily: 'inherit'
    }
  }, t.logout), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      fontSize: 11,
      color: 'var(--pg-ink-400)',
      marginTop: 4
    }
  }, "PoolGuyPro \xB7 v2.5.0"))));
}
function SavedSection({
  user,
  lang
}) {
  const [items, setItems] = React.useState(null); // null = loading

  React.useEffect(() => {
    if (!user?.uid || !window.sb) {
      setItems([]);
      return;
    }
    window.sb.from('saved_listings').select('listing_id, created_at, marketplace(id, name, price, price_mode, cat, loc, photo_url, type, status)').eq('user_id', user.uid).order('created_at', {
      ascending: false
    }).then(({
      data
    }) => {
      if (data) setItems(data.filter(r => r.marketplace && r.marketplace.status === 'approved'));else setItems([]);
    });
  }, [user?.uid]);
  const unsave = async listingId => {
    setItems(prev => prev.filter(r => r.listing_id !== listingId));
    await window.sb.from('saved_listings').delete().eq('user_id', user.uid).eq('listing_id', listingId);
  };
  const title = lang === 'pt' ? 'SALVOS' : lang === 'es' ? 'GUARDADOS' : 'SAVED';
  return /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontWeight: 700,
      color: 'var(--pg-ink-700)',
      letterSpacing: '-0.01em',
      textTransform: 'uppercase',
      fontSize: 11
    }
  }, title), items && items.length > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: 'var(--pg-blue-500)'
    }
  }, items.length)), /*#__PURE__*/React.createElement("div", {
    className: "pg-card",
    style: {
      padding: items && items.length > 0 ? 0 : '16px 14px',
      overflow: 'hidden'
    }
  }, items === null ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 14px',
      fontSize: 13,
      color: 'var(--pg-ink-400)'
    }
  }, lang === 'pt' ? 'Carregando…' : lang === 'es' ? 'Cargando…' : 'Loading…') : items.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
      padding: '20px 14px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "28",
    height: "28",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--pg-ink-300)",
    strokeWidth: "1.5",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--pg-ink-400)'
    }
  }, lang === 'pt' ? 'Nenhum anúncio salvo ainda' : lang === 'es' ? 'Ningún anuncio guardado' : ' No saved listings yet')) : items.map((r, idx) => {
    const m = r.marketplace;
    const isLast = idx === items.length - 1;
    return /*#__PURE__*/React.createElement("div", {
      key: r.listing_id,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 14px',
        borderBottom: isLast ? 'none' : '0.5px solid var(--pg-ink-100)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 48,
        height: 48,
        borderRadius: 10,
        overflow: 'hidden',
        flexShrink: 0,
        background: 'var(--pg-ink-100)'
      }
    }, m.photo_url ? /*#__PURE__*/React.createElement("img", {
      src: m.photo_url,
      alt: m.name,
      style: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }
    }) : /*#__PURE__*/React.createElement("div", {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20
      }
    }, "\uD83D\uDCE6")), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        color: 'var(--pg-ink-900)'
      }
    }, m.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'var(--pg-ink-500)',
        marginTop: 2
      }
    }, m.price_mode === 'neg' ? lang === 'pt' ? 'Negociável' : 'Negotiable' : m.price ? `$${m.price}` : '—', m.loc ? ` · ${m.loc}` : '')), /*#__PURE__*/React.createElement("button", {
      onClick: () => unsave(r.listing_id),
      style: {
        width: 32,
        height: 32,
        borderRadius: 8,
        border: '1px solid #FCA5A5',
        background: '#FEF2F2',
        color: '#EF4444',
        cursor: 'pointer',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      },
      title: lang === 'pt' ? 'Remover' : 'Remove'
    }, /*#__PURE__*/React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 24 24",
      fill: "currentColor",
      stroke: "none"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
    }))));
  })));
}
function PersonalInfoCard({
  user,
  setUser,
  lang
}) {
  const [editing, setEditing] = React.useState(false);
  const [phone, setPhone] = React.useState(user.phone || '');
  const [saving, setSaving] = React.useState(false);
  // Phone OTP verification
  const [otpSent, setOtpSent] = React.useState(false);
  const [otpCode, setOtpCode] = React.useState('');
  const [otpLoading, setOtpLoading] = React.useState(false);
  const [otpError, setOtpError] = React.useState('');
  const SB_URL = 'https://xiszfqghizqzlwyrfjol.supabase.co';
  const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhpc3pmcWdoaXpxemx3eXJmam9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNzM3NDMsImV4cCI6MjA5NTc0OTc0M30.BeRc6j0XnJteUSaA7nAjOWCS_bZ9rcBlGvw54cXcmeg';
  const sendOtp = async () => {
    const digits = (user.phone || '').replace(/\D/g, '');
    if (digits.length < 10) {
      setOtpError(lang === 'pt' ? 'Telefone inválido — mínimo 10 dígitos' : 'Invalid phone — minimum 10 digits');
      return;
    }
    const E164 = '+1' + digits;
    setOtpLoading(true);
    setOtpError('');
    try {
      const s = await window.sb.auth.getSession();
      const jwt = s?.data?.session?.access_token;
      if (!jwt) throw new Error(lang === 'pt' ? 'Sessão expirada — faça login novamente' : 'Session expired — please log in again');
      const res = await fetch(SB_URL + '/auth/v1/user', {
        method: 'PUT',
        headers: {
          apikey: SB_KEY,
          Authorization: 'Bearer ' + jwt,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: E164
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || data.message || data.error_description || 'Erro ao enviar SMS');
      setOtpSent(true);
    } catch (e) {
      setOtpError(e.message);
    } finally {
      setOtpLoading(false);
    }
  };
  const verifyOtp = async () => {
    if (!otpCode.trim()) return;
    const digits = (user.phone || '').replace(/\D/g, '');
    const E164 = '+1' + digits;
    setOtpLoading(true);
    setOtpError('');
    try {
      const res = await fetch(SB_URL + '/auth/v1/verify', {
        method: 'POST',
        headers: {
          apikey: SB_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'phone_change',
          phone: E164,
          token: otpCode.trim()
        })
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.msg || data.message || data.error_description || (lang === 'pt' ? 'Código inválido' : 'Invalid code'));
      await window.sb.from('profiles').update({
        phone_verified: true
      }).eq('id', user.uid);
      setUser(u => ({
        ...u,
        phoneVerified: true
      }));
      setOtpSent(false);
      setOtpCode('');
      setOtpError('');
    } catch (e) {
      setOtpError(e.message);
    } finally {
      setOtpLoading(false);
    }
  };
  const fmtPhone = val => {
    const digits = val.replace(/\D/g, '').slice(0, 10);
    if (digits.length >= 7) return '(' + digits.slice(0, 3) + ') ' + digits.slice(3, 6) + '-' + digits.slice(6);
    if (digits.length >= 4) return '(' + digits.slice(0, 3) + ') ' + digits.slice(3);
    if (digits.length > 0) return '(' + digits;
    return digits;
  };
  const save = async () => {
    if (!user.uid) {
      setEditing(false);
      return;
    }
    setSaving(true);
    await window.sb.from('profiles').update({
      phone: phone.trim()
    }).eq('id', user.uid);
    setUser(u => ({
      ...u,
      phone: phone.trim()
    }));
    setSaving(false);
    setEditing(false);
  };
  const rowStyle = last => ({
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 14px',
    borderBottom: last ? 'none' : '0.5px solid var(--pg-ink-100)'
  });
  const iconBox = {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: 'var(--pg-blue-100)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  };
  return /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontWeight: 700,
      color: 'var(--pg-ink-700)',
      letterSpacing: '-0.01em',
      textTransform: 'uppercase',
      fontSize: 11
    }
  }, lang === 'pt' ? 'INFO PESSOAL' : lang === 'es' ? 'INFO PERSONAL' : 'PERSONAL INFO'), !editing && /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setPhone(user.phone || '');
      setEditing(true);
    },
    style: {
      border: 'none',
      background: 'transparent',
      color: 'var(--pg-blue-500)',
      fontSize: 13,
      fontWeight: 600,
      cursor: 'pointer'
    }
  }, lang === 'pt' ? 'Editar' : lang === 'es' ? 'Editar' : 'Edit')), /*#__PURE__*/React.createElement("div", {
    className: "pg-card",
    style: {
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: rowStyle(false)
  }, /*#__PURE__*/React.createElement("div", {
    style: iconBox
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--pg-blue-500)",
    strokeWidth: "2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "22,6 12,13 2,6"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: 'var(--pg-ink-400)',
      fontWeight: 700,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      marginBottom: 1
    }
  }, "EMAIL"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      color: 'var(--pg-ink-900)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, user.email || '—')), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      padding: '2px 7px',
      borderRadius: 6,
      background: 'var(--pg-ink-100)',
      color: 'var(--pg-ink-500)'
    }
  }, lang === 'pt' ? 'fixo' : lang === 'es' ? 'fijo' : 'fixed')), /*#__PURE__*/React.createElement("div", {
    style: rowStyle(true)
  }, /*#__PURE__*/React.createElement("div", {
    style: iconBox
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--pg-blue-500)",
    strokeWidth: "2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.29 6.29l.94-.94a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: 'var(--pg-ink-400)',
      fontWeight: 700,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      marginBottom: 2,
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, lang === 'pt' ? 'TELEFONE' : lang === 'es' ? 'TELÉFONO' : 'PHONE', user.phoneVerified && !editing && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      fontWeight: 800,
      padding: '1px 6px',
      borderRadius: 999,
      background: 'rgba(22,163,74,0.12)',
      color: '#16A34A',
      border: '1px solid rgba(22,163,74,0.3)',
      letterSpacing: '0.04em'
    }
  }, "\u2713 ", lang === 'pt' ? 'VERIFICADO' : lang === 'es' ? 'VERIFICADO' : 'VERIFIED')), editing ? /*#__PURE__*/React.createElement("input", {
    className: "pg-field",
    type: "tel",
    value: phone,
    onChange: e => setPhone(fmtPhone(e.target.value)),
    placeholder: "(954) 000-0000",
    style: {
      height: 36,
      fontSize: 13,
      width: '100%',
      padding: '6px 10px'
    },
    autoFocus: true
  }) : otpSent ?
  /*#__PURE__*/
  /* OTP code entry */
  React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--pg-ink-500)',
      lineHeight: 1.4
    }
  }, "\uD83D\uDCF1 ", lang === 'pt' ? 'Código enviado para' : 'Code sent to', " ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--pg-ink-700)'
    }
  }, user.phone)), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: otpCode,
    onChange: e => setOtpCode(e.target.value.slice(0, 6)),
    placeholder: "000000",
    style: {
      width: '100%',
      height: 48,
      borderRadius: 10,
      border: '1.5px solid var(--pg-ink-200)',
      background: 'var(--pg-bg)',
      color: 'var(--pg-ink-900)',
      fontSize: 24,
      fontWeight: 700,
      textAlign: 'center',
      letterSpacing: '0.2em',
      outline: 'none',
      fontFamily: 'inherit',
      boxSizing: 'border-box'
    },
    autoFocus: true
  }), otpError && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: '#EF4444'
    }
  }, otpError), /*#__PURE__*/React.createElement("button", {
    onClick: verifyOtp,
    disabled: otpLoading || !otpCode,
    style: {
      width: '100%',
      height: 40,
      borderRadius: 9,
      border: 'none',
      background: otpCode && !otpLoading ? '#16A34A' : 'var(--pg-ink-200)',
      color: otpCode && !otpLoading ? '#fff' : 'var(--pg-ink-400)',
      fontSize: 13,
      fontWeight: 700,
      cursor: otpCode ? 'pointer' : 'not-allowed',
      fontFamily: 'inherit',
      boxSizing: 'border-box'
    }
  }, otpLoading ? '…' : lang === 'pt' ? 'Confirmar código' : 'Confirm code'), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: sendOtp,
    style: {
      background: 'none',
      border: 'none',
      color: 'var(--pg-blue-500)',
      fontSize: 11,
      cursor: 'pointer',
      padding: 0,
      fontFamily: 'inherit'
    }
  }, lang === 'pt' ? 'Reenviar código' : 'Resend code'), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setOtpSent(false);
      setOtpCode('');
      setOtpError('');
    },
    style: {
      background: 'none',
      border: 'none',
      color: 'var(--pg-ink-400)',
      fontSize: 11,
      cursor: 'pointer',
      padding: 0,
      fontFamily: 'inherit'
    }
  }, lang === 'pt' ? 'Cancelar' : 'Cancel'))) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      color: user.phone ? 'var(--pg-ink-900)' : 'var(--pg-ink-400)',
      flex: 1
    }
  }, user.phone || (lang === 'pt' ? 'Adicionar telefone' : lang === 'es' ? 'Agregar teléfono' : 'Add phone number')), user.phone && !user.phoneVerified && !editing && /*#__PURE__*/React.createElement("button", {
    onClick: sendOtp,
    disabled: otpLoading,
    style: {
      height: 28,
      padding: '0 10px',
      borderRadius: 7,
      border: '1px solid rgba(14,186,199,0.5)',
      background: 'rgba(14,186,199,0.08)',
      color: '#0EBAC7',
      fontSize: 11,
      fontWeight: 700,
      cursor: 'pointer',
      fontFamily: 'inherit',
      flexShrink: 0,
      opacity: otpLoading ? 0.7 : 1
    }
  }, otpLoading ? '…' : lang === 'pt' ? '📱 Verificar' : '📱 Verify')), otpError && !otpSent && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: '#EF4444',
      marginTop: 4
    }
  }, otpError)), editing && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      flexShrink: 0,
      marginLeft: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setEditing(false),
    style: {
      height: 32,
      padding: '0 10px',
      borderRadius: 8,
      border: '1px solid var(--pg-ink-200)',
      background: 'transparent',
      color: 'var(--pg-ink-500)',
      fontSize: 12,
      fontWeight: 600,
      cursor: 'pointer',
      fontFamily: 'inherit'
    }
  }, lang === 'pt' ? 'Cancelar' : lang === 'es' ? 'Cancelar' : 'Cancel'), /*#__PURE__*/React.createElement("button", {
    onClick: save,
    disabled: saving,
    style: {
      height: 32,
      padding: '0 12px',
      borderRadius: 8,
      border: 'none',
      background: 'var(--pg-blue-500)',
      color: '#fff',
      fontSize: 12,
      fontWeight: 700,
      cursor: 'pointer',
      fontFamily: 'inherit',
      opacity: saving ? 0.7 : 1
    }
  }, saving ? '…' : lang === 'pt' ? 'Salvar' : lang === 'es' ? 'Guardar' : 'Save')))));
}
function SubscriptionCard({
  user,
  setUser,
  openPaywall,
  t,
  lang = 'en',
  isDesktop = false
}) {
  const tiers = [{
    id: 'free',
    name: t.free
  }, {
    id: 'premium',
    name: t.premium
  }, {
    id: 'pro',
    name: 'PRO'
  }];

  // Desktop free-tier: compact premium upsell with gold/silver gradient
  if (isDesktop && user.tier === 'free') {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'center',
        width: '100%'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 460,
        width: '100%',
        borderRadius: 22,
        overflow: 'hidden',
        position: 'relative',
        background: 'linear-gradient(135deg, #040d1f 0%, #07193d 20%, #0e3070 40%, #1558b0 50%, #0e3070 65%, #07193d 82%, #040d1f 100%)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(14,186,199,0.18)',
        border: '1px solid rgba(14,186,199,0.20)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: 2,
        background: 'linear-gradient(90deg, transparent 0%, rgba(14,186,199,0.18) 20%, rgba(160,240,255,0.75) 50%, rgba(14,186,199,0.18) 80%, transparent 100%)'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        width: 280,
        height: 280,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(14,186,199,0.13) 0%, transparent 60%)',
        top: -80,
        left: '50%',
        transform: 'translateX(-50%)',
        pointerEvents: 'none'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        padding: '24px 28px 24px',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 58,
        height: 58,
        borderRadius: 18,
        margin: '0 auto 16px',
        background: 'linear-gradient(135deg, rgba(14,186,199,0.22), rgba(0,119,182,0.14))',
        border: '1px solid rgba(14,186,199,0.38)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(0,0,0,0.40)'
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "28",
      height: "28",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "url(#aquaGradP)",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
      id: "aquaGradP",
      x1: "0",
      y1: "0",
      x2: "1",
      y2: "1"
    }, /*#__PURE__*/React.createElement("stop", {
      offset: "0%",
      stopColor: "#A8EEFF"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "50%",
      stopColor: "#0EC8D8"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "100%",
      stopColor: "#0077B6"
    }))), /*#__PURE__*/React.createElement("path", {
      d: "M2 20h20M5 20l2-8 5 4 5-4 2 8"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "8",
      r: "2",
      fill: "#0EC8D8",
      stroke: "none"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "4",
      cy: "12",
      r: "1.5",
      fill: "#0EC8D8",
      stroke: "none"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "20",
      cy: "12",
      r: "1.5",
      fill: "#0EC8D8",
      stroke: "none"
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--pg-font-display)',
        fontSize: 22,
        fontWeight: 800,
        letterSpacing: '-0.01em',
        lineHeight: 1.1,
        marginBottom: 7,
        background: 'linear-gradient(135deg, #A8EEFF 0%, #5DDCF0 35%, #FFFFFF 52%, #5DDCF0 68%, #7EC8E3 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }
    }, lang === 'pt' ? 'Seja Premium' : lang === 'es' ? 'Hazte Premium' : 'Go Premium'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.55)',
        marginBottom: 20,
        lineHeight: 1.5
      }
    }, t.upgradeQp), /*#__PURE__*/React.createElement("button", {
      onClick: openPaywall,
      style: {
        width: '100%',
        height: 46,
        borderRadius: 13,
        border: '1px solid rgba(14,186,199,0.45)',
        cursor: 'pointer',
        fontFamily: 'var(--pg-font-display)',
        fontSize: 15,
        fontWeight: 700,
        letterSpacing: '0.01em',
        background: 'linear-gradient(135deg, #004d8a, #006ab4, #009ec4, #006ab4, #004d8a)',
        color: '#B8F0FF',
        boxShadow: '0 4px 18px rgba(0,0,0,0.42)',
        transition: 'filter .15s'
      },
      onMouseEnter: e => e.currentTarget.style.filter = 'brightness(1.18)',
      onMouseLeave: e => e.currentTarget.style.filter = 'none'
    }, t.comparePlans, " \u2726"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 5,
        marginTop: 14,
        justifyContent: 'center'
      }
    }, tiers.map(tier => /*#__PURE__*/React.createElement("button", {
      key: tier.id,
      onClick: () => setUser(u => ({
        ...u,
        tier: tier.id
      })),
      style: {
        padding: '5px 14px',
        borderRadius: 8,
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 11,
        fontWeight: 600,
        transition: 'all .12s',
        background: user.tier === tier.id ? 'rgba(14,186,199,0.18)' : 'rgba(255,255,255,0.05)',
        border: '1px solid ' + (user.tier === tier.id ? 'rgba(14,186,199,0.45)' : 'rgba(255,255,255,0.08)'),
        color: user.tier === tier.id ? '#A8EEFF' : 'rgba(255,255,255,0.35)'
      }
    }, tier.name))))));
  }

  // Mobile / paid tiers: original card
  return /*#__PURE__*/React.createElement("div", {
    className: "pg-card",
    style: {
      padding: 14,
      background: 'linear-gradient(135deg,var(--pg-navy-900),var(--pg-blue-600))',
      color: '#fff',
      border: 'none',
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      opacity: 0.7,
      letterSpacing: '0.08em',
      fontWeight: 600
    }
  }, t.subscription), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--pg-font-display)',
      fontSize: 18,
      fontWeight: 700,
      marginTop: 4,
      letterSpacing: '-0.01em',
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, user.tier === 'pro' && /*#__PURE__*/React.createElement(React.Fragment, null, Icon.crown(18, 'var(--pg-aqua-400)'), " ", t.poolguyPro), user.tier === 'premium' && /*#__PURE__*/React.createElement(React.Fragment, null, Icon.crown(16, 'var(--pg-aqua-400)'), " ", t.premium), user.tier === 'free' && /*#__PURE__*/React.createElement(React.Fragment, null, t.free)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      opacity: 0.7,
      marginTop: 4
    }
  }, user.tier === 'free' ? t.upgradeQp : `${t.renews} 26/05 · $9.99/mo`)), user.tier !== 'free' && Icon.crown(28, 'oklch(0.85 0.15 90)')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      marginTop: 14
    }
  }, tiers.map(tier => /*#__PURE__*/React.createElement("button", {
    key: tier.id,
    onClick: () => setUser(u => ({
      ...u,
      tier: tier.id
    })),
    style: {
      flex: 1,
      padding: '8px 6px',
      borderRadius: 10,
      background: user.tier === tier.id ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)',
      border: '1px solid ' + (user.tier === tier.id ? 'rgba(255,255,255,0.35)' : 'transparent'),
      color: '#fff',
      fontSize: 12,
      fontWeight: 600,
      cursor: 'pointer',
      fontFamily: 'inherit'
    }
  }, tier.name))), user.tier === 'free' && /*#__PURE__*/React.createElement("button", {
    onClick: openPaywall,
    className: "pg-btn pg-btn-aqua",
    style: {
      width: '100%',
      height: 42,
      fontSize: 14,
      marginTop: 10
    }
  }, t.comparePlans));
}
function Section({
  title,
  action,
  onAction,
  children
}) {
  return /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontWeight: 700,
      color: 'var(--pg-ink-700)',
      letterSpacing: '-0.01em',
      textTransform: 'uppercase',
      fontSize: 11
    }
  }, title), action && /*#__PURE__*/React.createElement("button", {
    onClick: onAction,
    style: {
      border: 'none',
      background: 'transparent',
      color: 'var(--pg-blue-500)',
      fontSize: 13,
      fontWeight: 600,
      cursor: 'pointer'
    }
  }, action)), children);
}
function SettingRow({
  icon,
  label,
  detail,
  chev,
  last,
  onClick,
  right
}) {
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '13px 14px',
      borderBottom: last ? 'none' : '0.5px solid var(--pg-ink-200)',
      cursor: onClick ? 'pointer' : 'default'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 32,
      height: 32,
      borderRadius: 8,
      background: 'var(--pg-blue-100)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, icon), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      fontSize: 14,
      fontWeight: 500,
      color: 'var(--pg-ink-900)'
    }
  }, label), detail && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--pg-ink-500)'
    }
  }, detail), right, chev && Icon.chev(14, 'var(--pg-ink-400)'));
}
function _historyItemRow(m, idx, isLast, fmtDate, fmtType, badge) {
  return /*#__PURE__*/React.createElement("div", {
    key: m.id,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 14px',
      borderBottom: isLast ? 'none' : '0.5px solid var(--pg-ink-100)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 48,
      height: 48,
      borderRadius: 10,
      overflow: 'hidden',
      flexShrink: 0,
      background: 'var(--pg-ink-100)',
      position: 'relative'
    }
  }, m.photo_url ? /*#__PURE__*/React.createElement("img", {
    src: m.photo_url,
    alt: m.name,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      filter: 'grayscale(0.4)'
    }
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 18
    }
  }, "\uD83D\uDCE6"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'rgba(0,0,0,0.55)',
      fontSize: 8,
      fontWeight: 800,
      color: '#fff',
      textAlign: 'center',
      letterSpacing: '0.06em',
      padding: '2px 0'
    }
  }, badge)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      color: 'var(--pg-ink-900)'
    }
  }, m.name), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginTop: 2,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      padding: '2px 7px',
      borderRadius: 5,
      background: 'var(--pg-ink-100)',
      color: 'var(--pg-ink-500)',
      letterSpacing: '0.04em'
    }
  }, fmtType(m.type)), m.price_mode !== 'neg' && m.price && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: 'var(--pg-ink-700)'
    }
  }, "$", m.price))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--pg-ink-400)',
      textAlign: 'right',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      color: '#16A34A',
      fontSize: 10,
      letterSpacing: '0.04em',
      marginBottom: 2
    }
  }, "\u2713 ", badge), m.sold_at && /*#__PURE__*/React.createElement("div", null, fmtDate(m.sold_at))));
}
function _historyList({
  items,
  expanded,
  setExpanded,
  emptyMsg,
  fmtDate,
  fmtType,
  badge,
  lang
}) {
  const visibleItems = expanded ? items || [] : (items || []).slice(0, 3);
  if (items === null) return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 14px',
      fontSize: 13,
      color: 'var(--pg-ink-400)'
    }
  }, lang === 'pt' ? 'Carregando…' : lang === 'es' ? 'Cargando…' : 'Loading…');
  if (items.length === 0) return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
      padding: '20px 14px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "28",
    height: "28",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--pg-ink-300)",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "4",
    width: "18",
    height: "18",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 2v4M8 2v4M3 10h18"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 14h.01M12 14h.01"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--pg-ink-400)'
    }
  }, emptyMsg));
  return /*#__PURE__*/React.createElement(React.Fragment, null, visibleItems.map((m, idx) => {
    const isLast = idx === visibleItems.length - 1 && (!expanded || items.length <= 3);
    return _historyItemRow(m, idx, isLast, fmtDate, fmtType, badge);
  }), items.length > 3 && /*#__PURE__*/React.createElement("button", {
    onClick: () => setExpanded(!expanded),
    style: {
      width: '100%',
      padding: '11px',
      border: 'none',
      background: 'transparent',
      color: 'var(--pg-blue-500)',
      fontSize: 13,
      fontWeight: 600,
      cursor: 'pointer',
      borderTop: '0.5px solid var(--pg-ink-100)',
      fontFamily: 'inherit',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5
    }
  }, expanded ? lang === 'pt' ? 'Ver menos' : lang === 'es' ? 'Ver menos' : 'Show less' : lang === 'pt' ? `Ver mais ${items.length - 3}` : lang === 'es' ? `Ver ${items.length - 3} más` : `Show ${items.length - 3} more`, /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: expanded ? "18 15 12 9 6 15" : "6 9 12 15 18 9"
  }))));
}

// ── History Section — items I sold ───────────────────────────────
function HistorySection({
  user,
  lang
}) {
  const [items, setItems] = React.useState(null);
  const [expanded, setExpanded] = React.useState(false);
  React.useEffect(() => {
    if (!user?.uid || !window.sb) {
      setItems([]);
      return;
    }
    window.sb.from('marketplace_history').select('id, name, price, price_mode, cat, loc, photo_url, type, sold_at, created_at, buyer_name').eq('author_id', user.uid).order('sold_at', {
      ascending: false
    }).then(({
      data
    }) => setItems(data || []));
  }, [user?.uid]);
  const fmtDate = iso => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString(lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-MX' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  const fmtType = type => {
    if (type === 'sell') return lang === 'pt' ? 'Venda' : lang === 'es' ? 'Venta' : 'Sold';
    if (type === 'rent') return lang === 'pt' ? 'Aluguel' : lang === 'es' ? 'Renta' : 'Rental';
    if (type === 'route') return lang === 'pt' ? 'Rota' : lang === 'es' ? 'Ruta' : 'Route';
    return 'Marketplace';
  };
  const title = lang === 'pt' ? 'VENDAS' : lang === 'es' ? 'VENTAS' : 'SALES';
  const emptyMsg = lang === 'pt' ? 'Nenhuma venda ainda' : lang === 'es' ? 'Sin ventas aún' : 'No completed sales yet';
  return /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontWeight: 700,
      color: 'var(--pg-ink-700)',
      letterSpacing: '-0.01em',
      textTransform: 'uppercase',
      fontSize: 11
    }
  }, title), items && items.length > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: 'var(--pg-ink-500)'
    }
  }, items.length)), /*#__PURE__*/React.createElement("div", {
    className: "pg-card",
    style: {
      padding: items && items.length > 0 ? 0 : '16px 14px',
      overflow: 'hidden'
    }
  }, _historyList({
    items,
    expanded,
    setExpanded,
    emptyMsg,
    fmtDate,
    fmtType,
    badge: 'SOLD',
    lang
  })));
}

// ── Purchases Section — items I bought ───────────────────────────
function PurchasesSection({
  user,
  lang
}) {
  const [items, setItems] = React.useState(null);
  const [expanded, setExpanded] = React.useState(false);
  React.useEffect(() => {
    if (!user?.uid || !window.sb) {
      setItems([]);
      return;
    }
    window.sb.from('marketplace_history').select('id, name, price, price_mode, cat, loc, photo_url, type, sold_at, created_at, author').eq('buyer_id', user.uid).order('sold_at', {
      ascending: false
    }).then(({
      data
    }) => setItems(data || []));
  }, [user?.uid]);
  const fmtDate = iso => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString(lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-MX' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  const fmtType = type => {
    if (type === 'sell') return lang === 'pt' ? 'Compra' : lang === 'es' ? 'Compra' : 'Purchase';
    if (type === 'rent') return lang === 'pt' ? 'Aluguel' : lang === 'es' ? 'Renta' : 'Rental';
    if (type === 'route') return lang === 'pt' ? 'Rota' : lang === 'es' ? 'Ruta' : 'Route';
    return 'Marketplace';
  };
  const title = lang === 'pt' ? 'COMPRAS' : lang === 'es' ? 'COMPRAS' : 'PURCHASES';
  const emptyMsg = lang === 'pt' ? 'Nenhuma compra ainda' : lang === 'es' ? 'Sin compras aún' : 'No purchases yet';
  return /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontWeight: 700,
      color: 'var(--pg-ink-700)',
      letterSpacing: '-0.01em',
      textTransform: 'uppercase',
      fontSize: 11
    }
  }, title), items && items.length > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: 'var(--pg-ink-500)'
    }
  }, items.length)), /*#__PURE__*/React.createElement("div", {
    className: "pg-card",
    style: {
      padding: items && items.length > 0 ? 0 : '16px 14px',
      overflow: 'hidden'
    }
  }, _historyList({
    items,
    expanded,
    setExpanded,
    emptyMsg,
    fmtDate,
    fmtType,
    badge: 'BOUGHT',
    lang
  })));
}
Object.assign(window, {
  ProfileScreen
});