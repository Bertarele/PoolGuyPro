// work.jsx — Hiring / Technicians (matching layout) / Vacation with month+weekday+region

function WorkScreen({
  ctx
}) {
  const {
    lang,
    openChat,
    goTab,
    openPostMenu,
    openApplicants,
    openJobDetail,
    openHiringAppDetail,
    openApplyJob,
    openVacSheet,
    openHiringSheet,
    openTechSheet,
    openDayPicker,
    openSchedule,
    openPublicProfile,
    showToast,
    removeJob,
    removeTech,
    removeVacation,
    liveJobs = [],
    liveTechs = [],
    liveVacations = [],
    liveApplications = [],
    jobApplicantCounts = {},
    hasUnreadChat,
    openNotifications,
    hasUnreadNotif,
    darkMode = false,
    isDesktop = false
  } = ctx;
  const t = STRINGS[lang];
  const [sub, setSub] = React.useState('hiring');
  const [vacTab, setVacTab] = React.useState('applied');
  const [myActivityTab, setMyActivityTab] = React.useState('applications'); // 'applications' | 'myposts'
  const [activityLimit, setActivityLimit] = React.useState(4);
  const [deletedAppIds, setDeletedAppIds] = React.useState(new Set());
  const [workUserLocation, setWorkUserLocation] = React.useState(() => {
    try {
      const s = localStorage.getItem('pg_loc');
      return s ? JSON.parse(s) : null;
    } catch (e) {
      return null;
    }
  });
  const [workRadiusMiles, setWorkRadiusMiles] = React.useState(() => {
    try {
      const s = localStorage.getItem('pg_loc_r');
      return s ? Number(s) : 25;
    } catch (e) {
      return 25;
    }
  });
  const [workLocationFilterOpen, setWorkLocationFilterOpen] = React.useState(false);
  React.useEffect(() => {
    try {
      if (workUserLocation) localStorage.setItem('pg_loc', JSON.stringify(workUserLocation));else localStorage.removeItem('pg_loc');
    } catch (e) {}
  }, [workUserLocation]);
  React.useEffect(() => {
    try {
      localStorage.setItem('pg_loc_r', String(workRadiusMiles));
    } catch (e) {}
  }, [workRadiusMiles]);
  const subIcons = {
    hiring: (s, c) => Icon.briefcase(s, c),
    techs: (s, c) => /*#__PURE__*/React.createElement("svg", {
      width: s,
      height: s,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: c,
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "8",
      r: "5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M8.21 13.89 7 22l5-3 5 3-1.21-8.12"
    })),
    vac: (s, c) => /*#__PURE__*/React.createElement("svg", {
      width: s,
      height: s,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: c,
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M12 22V8"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 8c-2-2-5-2-7 0 2 2 5 2 7 0Z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 8c2-2 5-2 7 0-2 2-5 2-7 0Z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M5 12c2 0 4 1 4 3M19 12c-2 0-4 1-4 3"
    }))
  };
  const handlePostBtn = () => {
    if (sub === 'vac') openVacSheet();else if (sub === 'hiring') openHiringSheet();else if (sub === 'techs') openTechSheet();
  };

  // Contextual "+ " button label & icon per sub-tab
  const postBtnCfg = {
    hiring: {
      label: lang === 'pt' ? 'Vaga' : lang === 'es' ? 'Empleo' : 'Job',
      icon: (s, c) => Icon.briefcase(s, c)
    },
    techs: {
      label: lang === 'pt' ? 'Técnico' : lang === 'es' ? 'Técnico' : 'Tech',
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
        d: "M14 7a4 4 0 1 0-5 5l-6 6 3 3 6-6a4 4 0 0 0 5-5l-3 3-3-3z"
      }))
    },
    vac: {
      label: lang === 'pt' ? 'Férias' : lang === 'es' ? 'Vacaciones' : 'Vacation',
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
        d: "M12 22V8"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M12 8c-2-2-5-2-7 0 2 2 5 2 7 0Z"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M12 8c2-2 5-2 7 0-2 2-5 2-7 0Z"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M5 12c2 0 4 1 4 3M19 12c-2 0-4 1-4 3"
      }))
    }
  };
  const postBtn = postBtnCfg[sub] || postBtnCfg.hiring;
  const activeJobs = MY_APPLICATIONS.filter(a => ['accepted', 'in_progress'].includes(a.status));
  const tabs = [{
    id: 'hiring',
    label: t.hiring
  }, {
    id: 'techs',
    label: lang === 'pt' ? 'Técnicos' : lang === 'es' ? 'Técnicos' : 'Techs'
  }, {
    id: 'vac',
    label: t.vacation
  }];

  // ── My Active Jobs sticky card ──────────────────────────────
  const myJobsLabel = lang === 'pt' ? 'Meus Jobs Ativos' : lang === 'es' ? 'Mis Jobs Activos' : 'My Active Jobs';
  const emptyLabel = lang === 'pt' ? 'Nenhum job ativo no momento' : lang === 'es' ? 'Sin jobs activos por ahora' : 'No active jobs right now';
  const findWorkLabel = lang === 'pt' ? 'Busque vagas abaixo ↓' : lang === 'es' ? 'Busca trabajos abajo ↓' : 'Browse jobs below ↓';
  const seeAllLabel = lang === 'pt' ? 'Ver todos' : lang === 'es' ? 'Ver todos' : 'See all';
  const statusChipStyle = status => {
    const cfg = {
      accepted: {
        bg: '#e8f5e9',
        color: '#2e7d32',
        label: lang === 'pt' ? 'Contratado' : lang === 'es' ? 'Contratado' : 'Hired'
      },
      in_progress: {
        bg: '#fff3e0',
        color: '#e65100',
        label: lang === 'pt' ? 'Em andamento' : lang === 'es' ? 'En progreso' : 'In Progress'
      }
    };
    return cfg[status] || {
      bg: '#f5f5f5',
      color: '#555',
      label: status
    };
  };

  // Checklist icon for the card header
  const ChecklistIcon = /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M9 11l3 3L22 4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
  }));

  // FAB — aqua floating action button
  const FabBtn = /*#__PURE__*/React.createElement("button", {
    onClick: handlePostBtn,
    className: "pg-press",
    style: {
      position: 'fixed',
      bottom: 86,
      right: 18,
      zIndex: 35,
      width: 56,
      height: 56,
      borderRadius: '50%',
      padding: 0,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0EBAC7 0%, #0D7280 100%)',
      border: 'none',
      cursor: 'pointer',
      boxShadow: '0 6px 20px rgba(14,186,199,0.45), 0 2px 8px rgba(0,0,0,0.18)'
    }
  }, Icon.plus(24, '#fff'));

  // ── My Activity data (shared between desktop + mobile) ────────
  const user = ctx.user || {};

  // Helper: relative time
  const relTime = iso => {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return lang === 'pt' ? 'agora' : lang === 'es' ? 'ahora' : 'now';
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  };

  // Static test data
  const staticAppsHiring = MY_APPLICATIONS.filter(a => a.type === 'hiring');
  const myAppsVac = typeof VACATIONS_APPLIED !== 'undefined' ? VACATIONS_APPLIED : [];
  const staticPostsHiring = MY_POSTS.filter(p => p.type === 'hiring');
  const myPostsVac = MY_POSTS.filter(p => p.type === 'vacation');

  // City label for location button — uses stored city, falls back to haversine lookup
  const workLocCity = React.useMemo(() => {
    if (!workUserLocation) return '';
    if (workUserLocation.city) return workUserLocation.city;
    const lat = workUserLocation.lat,
      lng = workUserLocation.lng;
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
  }, [workUserLocation]);

  // Radius filter — haversine distance from user location
  const radiusMatch = React.useCallback(loc => {
    if (!workUserLocation || !loc) return true;
    const city = loc.trim();
    const c = (window.FL_CITY_COORDS || {})[city];
    if (!c) return true; // city not in dict → show
    return window.haversine(workUserLocation.lat, workUserLocation.lng, c[0], c[1]) <= workRadiusMiles;
  }, [workUserLocation, workRadiusMiles]);
  const filteredLiveJobs = liveJobs.filter(j => radiusMatch(j.loc || j.region || ''));
  const filteredLiveTechs = liveTechs.filter(t => radiusMatch(t.loc || t.region || ''));
  const filteredLiveVacations = liveVacations.filter(v => radiusMatch(v.region || v.loc || ''));

  // Live jobs created by me → appear in My Posts
  const myLiveJobs = liveJobs.filter(j => j.author_id && user.uid && j.author_id === user.uid).map(j => {
    const counts = jobApplicantCounts[j._id] || {
      total: 0,
      pending: 0,
      withInterview: 0
    };
    const nPending = counts.pending || 0;
    const nInterview = counts.withInterview || 0;
    const nOther = Math.max(0, (counts.total || 0) - nPending - nInterview);
    return {
      id: j._id,
      _id: j._id,
      _live: true,
      type: 'hiring',
      title: {
        en: j.role,
        pt: j.role,
        es: j.role
      },
      loc: j.loc || '',
      date: {
        en: 'Live',
        pt: 'Publicado',
        es: 'Publicado'
      },
      status: 'open',
      pay: j.pay ? {
        en: j.pay,
        pt: j.pay,
        es: j.pay
      } : null,
      // Build fake applicant array so pending/interview badges render correctly
      applicants: [...Array(nPending).fill({
        status: 'pending'
      }), ...Array(nInterview).fill({
        status: 'accepted',
        interview: {
          day: {
            en: 'Scheduled',
            pt: 'Agendado',
            es: 'Programado'
          },
          time: ''
        }
      }), ...Array(nOther).fill({
        status: 'accepted'
      })]
    };
  });

  // Live applications (I applied to other people's jobs) → appear in My Applications
  const myLiveApps = liveApplications.map(a => {
    // Cross-reference liveJobs to get the author_id so we can open a live chat with the employer
    const relatedJob = liveJobs.find(j => j._id === a.job_id);
    return {
      id: a.id,
      _live: true,
      type: 'hiring',
      company: a.job_company || a.job_role || '?',
      title: {
        en: a.job_role || a.job_company || '',
        pt: a.job_role || a.job_company || '',
        es: a.job_role || a.job_company || ''
      },
      pay: {
        en: '',
        pt: '',
        es: ''
      },
      loc: relatedJob?.loc || relatedJob?.region || a.job_loc || '',
      status: a.status || 'pending',
      when: relTime(a.created_at),
      interview: a.interview_day ? {
        day: {
          en: a.interview_day,
          pt: a.interview_day,
          es: a.interview_day
        },
        time: a.interview_time || ''
      } : null,
      rejectReason: a.reject_reason || null,
      job_id: a.job_id,
      author_id: relatedJob?.author_id || a.job_author_id || null // employer UUID for live chat
    };
  });

  // Merge: live first, then static (so real data is prominent)
  const myAppsHiring = [...myLiveApps, ...staticAppsHiring];
  const myPostsHiring = [...myLiveJobs, ...staticPostsHiring];
  const currentMyApps = (sub === 'hiring' ? myAppsHiring : myAppsVac).filter(a => !deletedAppIds.has(a.id));
  const currentMyPosts = sub === 'hiring' ? myPostsHiring : myPostsVac;
  const deleteApp = React.useCallback(async app => {
    if (app._live && window.sb) {
      await window.sb.from('job_applications').delete().eq('id', app.id);
    }
    setDeletedAppIds(p => new Set([...p, app.id]));
  }, []);
  const visibleApps = currentMyApps.slice(0, activityLimit);

  // ── Desktop layout ─────────────────────────────────────────────
  if (isDesktop) {
    const heroTitle = sub === 'hiring' ? lang === 'pt' ? 'Vagas de Emprego' : lang === 'es' ? 'Ofertas de Trabajo' : 'Job Openings' : sub === 'techs' ? lang === 'pt' ? 'Técnicos Disponíveis' : lang === 'es' ? 'Técnicos Disponibles' : 'Available Techs' : lang === 'pt' ? 'Cobertura de Férias' : lang === 'es' ? 'Cobertura de Vacaciones' : 'Vacation Cover';
    const heroSub = sub === 'hiring' ? lang === 'pt' ? 'Oportunidades de emprego em South Florida' : lang === 'es' ? 'Oportunidades de empleo en South Florida' : 'Job opportunities in South Florida' : sub === 'techs' ? lang === 'pt' ? 'Técnicos especializados disponíveis na região' : lang === 'es' ? 'Técnicos especializados disponibles en la región' : 'Specialized technicians available in the region' : lang === 'pt' ? 'Cubra férias e impulsione seu perfil' : lang === 'es' ? 'Cubre vacaciones y mejora tu perfil' : 'Cover vacations and boost your profile';
    const StatPill = ({
      icon,
      count,
      label
    }) => /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '7px 16px',
        borderRadius: 999,
        background: 'rgba(255,255,255,0.10)',
        border: '1px solid rgba(255,255,255,0.18)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 24,
        height: 24,
        borderRadius: 7,
        background: 'rgba(255,255,255,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, icon), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 16,
        fontWeight: 700,
        fontFamily: 'var(--pg-font-display)',
        color: '#fff',
        lineHeight: 1
      }
    }, count), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.55)',
        lineHeight: 1,
        marginTop: 1
      }
    }, label)));
    const appsLbl = lang === 'pt' ? 'Candidaturas' : lang === 'es' ? 'Solicitudes' : 'Applications';
    const myPostsLbl = lang === 'pt' ? 'Meus Posts' : lang === 'es' ? 'Mis Posts' : 'My Posts';
    const emptyApps = lang === 'pt' ? 'Nenhuma candidatura ainda' : lang === 'es' ? 'Sin solicitudes aún' : 'No applications yet';
    const emptyPosts = lang === 'pt' ? 'Nenhum post publicado' : lang === 'es' ? 'Sin publicaciones' : 'No posts yet';
    return /*#__PURE__*/React.createElement("div", {
      style: {
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        background: 'var(--pg-bg)'
      }
    }, function () {
      const _tx = darkMode ? '#fff' : '#0A2840';
      const _sub = darkMode ? 'rgba(255,255,255,0.45)' : 'rgba(10,40,64,0.45)';
      const _sub2 = darkMode ? 'rgba(255,255,255,0.60)' : 'rgba(10,40,64,0.60)';
      const _ib = darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(10,40,64,0.08)';
      const _ibr = darkMode ? '1px solid rgba(255,255,255,0.20)' : '1px solid rgba(10,40,64,0.12)';
      const _locBg = darkMode ? 'rgba(0,119,182,0.22)' : 'rgba(0,119,182,0.12)';
      const _locBr = darkMode ? '1px solid rgba(0,119,182,0.40)' : '1px solid rgba(0,119,182,0.25)';
      const _locTx = darkMode ? 'rgba(255,255,255,0.80)' : '#0A2840';
      const _tabBg = darkMode ? 'rgba(0,0,0,0.22)' : 'rgba(10,40,64,0.06)';
      const _tabBr = darkMode ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(10,40,64,0.10)';
      const _bg = darkMode ? 'linear-gradient(135deg, #011B5A 0%, #0A2E6A 30%, #0077B6 70%, #023E8A 100%)' : 'linear-gradient(135deg, #e8f5ff 0%, #cfe9f8 40%, #b8dff5 100%)';
      const tabOn = on => on ? darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,119,182,0.12)' : 'transparent';
      const tabTx = on => on ? _tx : darkMode ? 'rgba(255,255,255,0.55)' : 'rgba(10,40,64,0.45)';
      const tabBdr = on => on ? darkMode ? '2px solid rgba(255,255,255,0.70)' : '2px solid #0077B6' : '2px solid transparent';
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
        style: {
          background: _bg,
          padding: '18px 36px 52px',
          position: 'relative',
          overflow: 'visible'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'absolute',
          top: -60,
          right: 60,
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: darkMode ? 'radial-gradient(circle,rgba(0,180,255,0.13) 0%,transparent 70%)' : 'radial-gradient(circle,rgba(0,119,182,0.06) 0%,transparent 70%)',
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
          background: darkMode ? 'radial-gradient(circle,rgba(255,255,255,0.06) 0%,transparent 70%)' : 'radial-gradient(circle,rgba(10,40,64,0.04) 0%,transparent 70%)',
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
          gap: 20,
          marginBottom: 16,
          position: 'relative'
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
      }, Icon.briefcase(20, _tx)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 9.5,
          fontWeight: 700,
          color: _sub,
          letterSpacing: '0.13em',
          textTransform: 'uppercase',
          marginBottom: 2
        }
      }, "WORK \xB7 SOUTH FLORIDA"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: 'var(--pg-font-display)',
          fontSize: 20,
          fontWeight: 800,
          color: _tx,
          letterSpacing: '-0.025em',
          lineHeight: 1
        }
      }, heroTitle))), /*#__PURE__*/React.createElement("div", {
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
      }, sub === 'hiring' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }
      }, Icon.briefcase(13, _sub2), /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--pg-font-display)',
          fontSize: 15,
          fontWeight: 800,
          color: _tx,
          letterSpacing: '-0.02em'
        }
      }, HIRING.length + liveJobs.length), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11,
          color: _sub,
          fontWeight: 500
        }
      }, lang === 'pt' ? 'vagas' : 'openings')), /*#__PURE__*/React.createElement("div", {
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
      }, Icon.check(13, _sub2), /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--pg-font-display)',
          fontSize: 15,
          fontWeight: 800,
          color: _tx,
          letterSpacing: '-0.02em'
        }
      }, myAppsHiring.length), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11,
          color: _sub,
          fontWeight: 500
        }
      }, lang === 'pt' ? 'candidaturas' : 'applied'))), sub === 'techs' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
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
        strokeWidth: "1.8",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("circle", {
        cx: "12",
        cy: "8",
        r: "5"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M8.21 13.89 7 22l5-3 5 3-1.21-8.12"
      })), /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--pg-font-display)',
          fontSize: 15,
          fontWeight: 800,
          color: _tx,
          letterSpacing: '-0.02em'
        }
      }, TECHS.length + liveTechs.length), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11,
          color: _sub,
          fontWeight: 500
        }
      }, lang === 'pt' ? 'técnicos' : 'techs'))), sub === 'vac' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
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
        strokeWidth: "1.8",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("path", {
        d: "M12 22V8"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M12 8c-2-2-5-2-7 0 2 2 5 2 7 0Z"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M12 8c2-2 5-2 7 0-2 2-5 2-7 0Z"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M5 12c2 0 4 1 4 3M19 12c-2 0-4 1-4 3"
      })), /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--pg-font-display)',
          fontSize: 15,
          fontWeight: 800,
          color: _tx,
          letterSpacing: '-0.02em'
        }
      }, VACATION_LISTINGS.length + liveVacations.length), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11,
          color: _sub,
          fontWeight: 500
        }
      }, lang === 'pt' ? 'coberturas' : 'covers')))), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexShrink: 0
        }
      }, /*#__PURE__*/React.createElement("button", {
        onClick: () => setWorkLocationFilterOpen(true),
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: workUserLocation ? 'var(--pg-aqua-100)' : _locBg,
          border: workUserLocation ? '1px solid var(--pg-aqua-400)' : _locBr,
          borderRadius: 999,
          padding: workUserLocation ? '6px 12px' : '7px 10px',
          cursor: 'pointer',
          fontFamily: 'inherit',
          color: 'inherit',
          touchAction: 'manipulation'
        }
      }, /*#__PURE__*/React.createElement("svg", {
        width: "17",
        height: "17",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: workUserLocation ? 'var(--pg-aqua-600)' : _sub,
        strokeWidth: "2.2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("path", {
        d: "M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z",
        fill: workUserLocation ? 'var(--pg-aqua-400)' : 'none'
      }), /*#__PURE__*/React.createElement("circle", {
        cx: "12",
        cy: "9",
        r: "2.5",
        fill: workUserLocation ? 'white' : 'none'
      })), workUserLocation && /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--pg-aqua-700)',
          whiteSpace: 'nowrap'
        }
      }, workLocCity ? `${workLocCity} · ` : '', workRadiusMiles, " mi")), /*#__PURE__*/React.createElement("button", {
        onClick: () => openChat && openChat(),
        style: {
          width: 38,
          height: 38,
          borderRadius: 11,
          background: _ib,
          border: _ibr,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
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
          border: `1.5px solid ${darkMode ? '#0077B6' : '#c5e4f5'}`
        }
      })), /*#__PURE__*/React.createElement("button", {
        onClick: () => openNotifications && openNotifications(),
        style: {
          width: 38,
          height: 38,
          borderRadius: 11,
          background: _ib,
          border: _ibr,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
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
          border: `1.5px solid ${darkMode ? '#0077B6' : '#c5e4f5'}`
        }
      })), /*#__PURE__*/React.createElement("button", {
        onClick: handlePostBtn,
        style: {
          height: 38,
          padding: '0 16px',
          borderRadius: 11,
          background: darkMode ? 'rgba(255,255,255,0.95)' : '#0077B6',
          border: 'none',
          color: darkMode ? '#023E8A' : '#fff',
          fontFamily: 'inherit',
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          boxShadow: '0 3px 12px rgba(0,0,0,0.18)',
          transition: 'all .15s'
        }
      }, postBtn.icon(14, darkMode ? '#023E8A' : '#fff'), lang === 'pt' ? '+ Publicar' : lang === 'es' ? '+ Publicar' : '+ Post', " ", postBtn.label))), /*#__PURE__*/React.createElement("div", {
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
          background: darkMode ? 'rgba(4,13,24,0.82)' : 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px)',
          border: darkMode ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(10,40,64,0.10)',
          borderRadius: 20,
          padding: 5,
          boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.30)' : '0 8px 32px rgba(0,80,160,0.14), 0 2px 8px rgba(0,0,0,0.08)'
        }
      }, tabs.map(s => {
        const on = sub === s.id;
        const _activeBg = darkMode ? 'linear-gradient(135deg,#0077B6,#023E8A)' : 'linear-gradient(135deg,#0077B6,#005A8E)';
        const _inactTx = darkMode ? 'rgba(255,255,255,0.50)' : 'rgba(10,40,64,0.48)';
        return /*#__PURE__*/React.createElement("button", {
          key: s.id,
          onClick: () => setSub(s.id),
          style: {
            display: 'inline-flex',
            alignItems: 'center',
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
        }, s.label);
      })))));
    }(), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 0,
        alignItems: 'flex-start',
        padding: '36px 36px 28px',
        maxWidth: 1400,
        margin: '0 auto'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 300,
        flexShrink: 0,
        position: 'sticky',
        top: 28,
        maxHeight: 'calc(100vh - 120px)',
        overflowY: 'auto',
        marginRight: 28
      }
    }, (sub === 'hiring' || sub === 'vac') && /*#__PURE__*/React.createElement("div", {
      className: "pg-card",
      style: {
        padding: '16px 16px 18px',
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 3,
        height: 16,
        borderRadius: 2,
        background: 'var(--pg-blue-500)',
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.07em',
        color: 'var(--pg-ink-600)',
        textTransform: 'uppercase'
      }
    }, lang === 'pt' ? 'Minha Atividade' : lang === 'es' ? 'Mi Actividad' : 'My Activity')), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 0,
        background: 'var(--pg-ink-100)',
        borderRadius: 10,
        padding: 3,
        marginBottom: 14
      }
    }, [{
      id: 'applications',
      label: appsLbl,
      count: currentMyApps.length
    }, {
      id: 'myposts',
      label: myPostsLbl,
      count: currentMyPosts.length
    }].map(tab => {
      const on = myActivityTab === tab.id;
      return /*#__PURE__*/React.createElement("button", {
        key: tab.id,
        onClick: () => setMyActivityTab(tab.id),
        style: {
          flex: 1,
          padding: '7px 4px',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          background: on ? '#fff' : 'transparent',
          color: on ? 'var(--pg-blue-600)' : 'var(--pg-ink-500)',
          fontFamily: 'inherit',
          fontSize: 12,
          fontWeight: on ? 700 : 500,
          boxShadow: on ? '0 1px 4px rgba(15,30,60,0.12)' : 'none',
          transition: 'all .15s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 5
        }
      }, tab.label, tab.count > 0 && /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 10,
          fontWeight: 700,
          minWidth: 16,
          height: 16,
          borderRadius: 999,
          padding: '0 4px',
          background: on ? 'var(--pg-blue-500)' : 'var(--pg-ink-300)',
          color: '#fff',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center'
        }
      }, tab.count));
    })), myActivityTab === 'applications' && (currentMyApps.length === 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        padding: '12px 0 4px',
        color: 'var(--pg-ink-400)',
        fontSize: 12.5
      }
    }, emptyApps) : /*#__PURE__*/React.createElement(React.Fragment, null, visibleApps.map((app, i) => {
      if (sub === 'hiring') {
        const isPending = app.status === 'pending';
        const isAccepted = app.status === 'accepted' || app.status === 'in_progress';
        const isRejected = app.status === 'rejected';
        const statusCfg = isPending ? {
          label: lang === 'pt' ? 'Aguardando' : lang === 'es' ? 'Pendiente' : 'Pending',
          color: 'oklch(0.48 0.14 68)',
          bg: 'oklch(0.96 0.05 68)'
        } : isAccepted ? {
          label: lang === 'pt' ? 'Aceito ✓' : lang === 'es' ? 'Aceptado ✓' : 'Accepted ✓',
          color: 'var(--pg-blue-600)',
          bg: 'var(--pg-blue-50)'
        } : {
          label: lang === 'pt' ? 'Recusado' : lang === 'es' ? 'Rechazado' : 'Rejected',
          color: 'oklch(0.45 0.18 20)',
          bg: 'oklch(0.95 0.04 20)'
        };
        return /*#__PURE__*/React.createElement("div", {
          key: app.id,
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 0',
            borderTop: '1px solid var(--pg-ink-100)'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            width: 8,
            height: 8,
            borderRadius: '50%',
            flexShrink: 0,
            background: isAccepted ? 'var(--pg-blue-500)' : isPending ? 'oklch(0.75 0.14 68)' : 'oklch(0.60 0.18 20)'
          }
        }), /*#__PURE__*/React.createElement("div", {
          onClick: () => openHiringAppDetail && openHiringAppDetail(app),
          style: {
            flex: 1,
            minWidth: 0,
            cursor: 'pointer'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--pg-ink-900)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }
        }, app.company), /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            flexWrap: 'wrap',
            marginTop: 2
          }
        }, /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 10.5,
            fontWeight: 700,
            padding: '2px 6px',
            borderRadius: 5,
            background: statusCfg.bg,
            color: statusCfg.color
          }
        }, statusCfg.label), /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 11,
            color: 'var(--pg-ink-400)'
          }
        }, "\xB7 ", tr(app.pay, lang)))), isRejected ? /*#__PURE__*/React.createElement("button", {
          onClick: () => deleteApp(app),
          style: {
            flexShrink: 0,
            width: 26,
            height: 26,
            borderRadius: 7,
            border: '1px solid #FCA5A5',
            background: '#FEF2F2',
            color: '#EF4444',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }
        }, /*#__PURE__*/React.createElement("svg", {
          width: "11",
          height: "11",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2.5",
          strokeLinecap: "round"
        }, /*#__PURE__*/React.createElement("path", {
          d: "M18 6L6 18M6 6l12 12"
        }))) : Icon.chev(13, 'var(--pg-ink-300)'));
      }
      // Vacation app
      const isAwaiting = app.status === 'awaiting';
      const isAcc = app.status === 'accepted';
      const sCfg = isAwaiting ? {
        label: lang === 'pt' ? 'Aguardando' : lang === 'es' ? 'Pendiente' : 'Pending',
        color: 'oklch(0.48 0.14 68)',
        bg: 'oklch(0.96 0.05 68)'
      } : isAcc ? {
        label: lang === 'pt' ? 'Confirmado ✓' : lang === 'es' ? 'Confirmado ✓' : 'Confirmed ✓',
        color: 'var(--pg-blue-600)',
        bg: 'var(--pg-blue-50)'
      } : {
        label: app.status,
        color: 'var(--pg-ink-500)',
        bg: 'var(--pg-ink-100)'
      };
      return /*#__PURE__*/React.createElement("div", {
        key: app.id,
        onClick: () => openSchedule && openSchedule(app),
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '9px 0',
          borderTop: '1px solid var(--pg-ink-100)',
          cursor: 'pointer'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: 8,
          height: 8,
          borderRadius: '50%',
          flexShrink: 0,
          background: isAcc ? 'var(--pg-blue-500)' : 'oklch(0.75 0.14 68)'
        }
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          minWidth: 0
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 13,
          fontWeight: 700,
          color: 'var(--pg-ink-900)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }
      }, app.owner), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flexWrap: 'wrap',
          marginTop: 2
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 10.5,
          fontWeight: 700,
          padding: '2px 6px',
          borderRadius: 5,
          background: sCfg.bg,
          color: sCfg.color
        }
      }, sCfg.label), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11,
          color: 'var(--pg-ink-400)'
        }
      }, "\xB7 $", app.pricePerPool, lang === 'pt' ? '/pisc' : '/pool'))), Icon.chev(13, 'var(--pg-ink-300)'));
    }), currentMyApps.length > activityLimit && /*#__PURE__*/React.createElement("button", {
      onClick: () => setActivityLimit(p => p + 4),
      style: {
        width: '100%',
        marginTop: 6,
        padding: '6px 0',
        borderRadius: 8,
        border: 'none',
        background: 'var(--pg-ink-100)',
        color: 'var(--pg-blue-600)',
        fontWeight: 700,
        fontSize: 11.5,
        cursor: 'pointer',
        fontFamily: 'inherit'
      }
    }, lang === 'pt' ? `Ver mais (${currentMyApps.length - activityLimit})` : lang === 'es' ? `Ver más (${currentMyApps.length - activityLimit})` : `See more (${currentMyApps.length - activityLimit})`))), myActivityTab === 'myposts' && (currentMyPosts.length === 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        padding: '12px 0 4px',
        color: 'var(--pg-ink-400)',
        fontSize: 12.5
      }
    }, emptyPosts) : currentMyPosts.map(post => {
      const pending = post.applicants ? post.applicants.filter(a => a.status === 'pending').length : 0;
      const totalApps = post.applicants ? post.applicants.length : 0;
      return /*#__PURE__*/React.createElement("div", {
        key: post.id,
        onClick: () => openApplicants && openApplicants(post),
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '9px 0',
          borderTop: '1px solid var(--pg-ink-100)',
          cursor: 'pointer'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: 8,
          height: 8,
          borderRadius: '50%',
          flexShrink: 0,
          background: 'var(--pg-blue-500)'
        }
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          minWidth: 0
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 13,
          fontWeight: 700,
          color: 'var(--pg-ink-900)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }
      }, tr(post.title, lang)), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginTop: 2
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 10.5,
          fontWeight: 700,
          padding: '2px 6px',
          borderRadius: 5,
          background: 'var(--pg-blue-100)',
          color: 'var(--pg-blue-700)'
        }
      }, lang === 'pt' ? 'ABERTA' : lang === 'es' ? 'ABIERTA' : 'OPEN'), pending > 0 && /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11,
          color: 'oklch(0.48 0.14 68)',
          fontWeight: 700
        }
      }, pending, " ", lang === 'pt' ? 'pend.' : 'pend.'), totalApps > 0 && /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11,
          color: 'var(--pg-blue-500)',
          fontWeight: 600
        }
      }, totalApps, " apps"))), Icon.chev(13, 'var(--pg-ink-300)'));
    }))), sub === 'techs' && /*#__PURE__*/React.createElement("div", {
      style: {
        borderRadius: 18,
        overflow: 'hidden',
        background: 'linear-gradient(135deg,#011B5A 0%,#0077B6 100%)',
        padding: '20px 18px 22px',
        color: '#fff',
        boxShadow: '0 8px 28px rgba(0,30,100,0.20)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 44,
        height: 44,
        borderRadius: 14,
        background: 'rgba(255,255,255,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "22",
      height: "22",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "#fff",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M14 7a4 4 0 1 0-5 5l-6 6 3 3 6-6a4 4 0 0 0 5-5l-3 3-3-3z"
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 17,
        fontWeight: 700,
        letterSpacing: '-0.02em',
        marginBottom: 6
      }
    }, lang === 'pt' ? 'Ofereça seus serviços' : lang === 'es' ? 'Ofrece tus servicios' : 'Offer your services'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12.5,
        color: 'rgba(255,255,255,0.70)',
        lineHeight: 1.5,
        marginBottom: 16
      }
    }, lang === 'pt' ? 'Publique seu perfil como técnico e receba contatos de pool guys da região.' : lang === 'es' ? 'Publica tu perfil como técnico y recibe contactos de pool guys de la región.' : 'Post your tech profile and receive contacts from pool guys in the area.'), /*#__PURE__*/React.createElement("button", {
      onClick: () => openTechSheet && openTechSheet(),
      style: {
        width: '100%',
        height: 40,
        borderRadius: 10,
        border: 'none',
        cursor: 'pointer',
        background: 'rgba(255,255,255,0.20)',
        color: '#fff',
        fontFamily: 'inherit',
        fontSize: 13,
        fontWeight: 700
      }
    }, lang === 'pt' ? 'Publicar perfil →' : lang === 'es' ? 'Publicar perfil →' : 'Post profile →')), sub === 'vac' && /*#__PURE__*/React.createElement("div", {
      style: {
        borderRadius: 18,
        overflow: 'hidden',
        background: 'linear-gradient(135deg,oklch(0.26 0.10 232) 0%,oklch(0.38 0.14 200) 100%)',
        padding: '20px 18px 22px',
        color: '#fff',
        boxShadow: '0 8px 28px rgba(0,30,100,0.20)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 44,
        height: 44,
        borderRadius: 14,
        background: 'oklch(0.85 0.15 90)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "22",
      height: "22",
      viewBox: "0 0 24 24",
      fill: "oklch(0.26 0.10 232)"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M12 2l2.39 7.36H22l-6.18 4.49L18.18 22 12 17.27 5.82 22l2.36-8.15L2 9.36h7.61z"
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 17,
        fontWeight: 700,
        letterSpacing: '-0.02em',
        marginBottom: 6
      }
    }, lang === 'pt' ? 'Cubra férias e cresça' : lang === 'es' ? 'Cubre vacaciones y crece' : 'Cover vacations and grow'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12.5,
        color: 'rgba(255,255,255,0.70)',
        lineHeight: 1.5,
        marginBottom: 14
      }
    }, lang === 'pt' ? 'Pool guys que cobrem férias aparecem no topo das buscas e ganham mais avaliações.' : lang === 'es' ? 'Los pool guys que cubren vacaciones aparecen arriba en las búsquedas y ganan más reseñas.' : 'Pool guys who cover vacations appear at the top of searches and earn more reviews.'), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap'
      }
    }, (lang === 'pt' ? ['+ Visibilidade', '+ Avaliações', '+ Renda'] : lang === 'es' ? ['+ Visibilidad', '+ Reseñas', '+ Ingresos'] : ['+ Visibility', '+ Reviews', '+ Income']).map(t => /*#__PURE__*/React.createElement("span", {
      key: t,
      style: {
        fontSize: 11,
        fontWeight: 600,
        padding: '3px 9px',
        borderRadius: 999,
        background: 'rgba(255,255,255,0.12)',
        border: '1px solid rgba(255,255,255,0.20)',
        color: 'rgba(255,255,255,0.88)'
      }
    }, t))))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
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
        fontFamily: 'var(--pg-font-display)',
        fontSize: 20,
        fontWeight: 700,
        letterSpacing: '-0.02em',
        color: 'var(--pg-ink-900)'
      }
    }, sub === 'hiring' ? lang === 'pt' ? 'Vagas Disponíveis' : lang === 'es' ? 'Empleos Disponibles' : 'Available Jobs' : sub === 'techs' ? lang === 'pt' ? 'Técnicos na Região' : lang === 'es' ? 'Técnicos en la Región' : 'Techs in the Region' : lang === 'pt' ? 'Coberturas Disponíveis' : lang === 'es' ? 'Coberturas Disponibles' : 'Available Covers'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--pg-ink-500)',
        marginTop: 2
      }
    }, sub === 'hiring' ? `${HIRING.length + liveJobs.length} ${lang === 'pt' ? 'vagas · Broward County' : lang === 'es' ? 'empleos · Broward County' : 'openings · Broward County'}` : sub === 'techs' ? `${TECHS.length + liveTechs.length} ${lang === 'pt' ? 'técnicos · South Florida' : lang === 'es' ? 'técnicos · South Florida' : 'techs · South Florida'}` : `${VACATION_LISTINGS.length + liveVacations.length} ${lang === 'pt' ? 'coberturas disponíveis' : lang === 'es' ? 'coberturas disponibles' : 'covers available'}`))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }
    }, sub === 'hiring' && /*#__PURE__*/React.createElement(HiringPanel, {
      t: t,
      lang: lang,
      onChat: openChat,
      onViewApplicants: openApplicants,
      onCreate: () => {},
      user: ctx.user,
      onApply: openApplyJob,
      hidePosted: false,
      openPublicProfile: openPublicProfile,
      liveJobs: filteredLiveJobs,
      showToast: showToast,
      onDeleteJob: removeJob,
      liveApplications: liveApplications
    }), sub === 'techs' && /*#__PURE__*/React.createElement(TechsPanel, {
      t: t,
      lang: lang,
      onChat: openChat,
      onCreate: () => {},
      openPublicProfile: openPublicProfile,
      liveTechs: filteredLiveTechs,
      user: ctx.user,
      showToast: showToast,
      onDeleteTech: removeTech
    }), sub === 'vac' && /*#__PURE__*/React.createElement(VacationPanel, {
      t: t,
      lang: lang,
      vacTab: vacTab,
      setVacTab: setVacTab,
      onChat: openChat,
      onCreate: openVacSheet,
      onViewApplicants: openApplicants,
      openDayPicker: openDayPicker,
      openSchedule: openSchedule,
      openPublicProfile: openPublicProfile,
      liveVacations: filteredLiveVacations,
      user: ctx.user,
      showToast: showToast,
      onDeleteVac: removeVacation
    })))), /*#__PURE__*/React.createElement(LocationFilterSheet, {
      open: workLocationFilterOpen,
      onClose: () => setWorkLocationFilterOpen(false),
      userLocation: workUserLocation,
      setUserLocation: setWorkUserLocation,
      radiusMiles: workRadiusMiles,
      setRadiusMiles: setWorkRadiusMiles,
      lang: lang
    }));
  }
  // ── END desktop ────────────────────────────────────────────────

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
      bgOverride: darkMode ? 'linear-gradient(135deg, #011B5A 0%, #0A2E6A 30%, #0077B6 70%, #023E8A 100%)' : 'linear-gradient(135deg, #e8f5ff 0%, #cfe9f8 40%, #b8dff5 100%)',
      title: /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 10,
          fontWeight: 600,
          color: H.sub,
          letterSpacing: '0.10em',
          marginBottom: 3,
          textTransform: 'uppercase'
        }
      }, t.work), /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: 'var(--pg-font-display)',
          fontSize: 21,
          fontWeight: 700,
          letterSpacing: '-0.025em',
          lineHeight: 1.1,
          color: H.text
        }
      }, sub === 'hiring' ? lang === 'pt' ? 'Vagas de Emprego' : lang === 'es' ? 'Ofertas de Trabajo' : 'Job Openings' : sub === 'techs' ? lang === 'pt' ? 'Técnicos Disponíveis' : lang === 'es' ? 'Técnicos Disponibles' : 'Available Techs' : lang === 'pt' ? 'Cobertura de Férias' : lang === 'es' ? 'Cobertura de Vacaciones' : 'Vacation Cover')),
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
        gap: 14,
        marginTop: 10,
        paddingTop: 10,
        borderTop: `1px solid ${H.border}`
      }
    }, sub === 'hiring' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 26,
        height: 26,
        borderRadius: 7,
        background: H.iconBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, Icon.briefcase(13, H.iconC)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 16,
        fontWeight: 700,
        fontFamily: 'var(--pg-font-display)',
        lineHeight: 1,
        color: H.text
      }
    }, HIRING.length), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        opacity: 0.55,
        lineHeight: 1,
        marginTop: 1,
        color: H.text
      }
    }, lang === 'pt' ? 'vagas' : lang === 'es' ? 'empleos' : 'openings'))), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 1,
        height: 28,
        background: H.divider
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 26,
        height: 26,
        borderRadius: 7,
        background: H.iconBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, Icon.check(13, H.iconC)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 16,
        fontWeight: 700,
        fontFamily: 'var(--pg-font-display)',
        lineHeight: 1,
        color: H.text
      }
    }, myAppsHiring.length), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        opacity: 0.55,
        lineHeight: 1,
        marginTop: 1,
        color: H.text
      }
    }, lang === 'pt' ? 'candidaturas' : lang === 'es' ? 'solicitudes' : 'applied'))), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 1,
        height: 28,
        background: H.divider
      }
    }), /*#__PURE__*/React.createElement("button", {
      onClick: () => setWorkLocationFilterOpen(true),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        background: workUserLocation ? 'var(--pg-aqua-100)' : H.cntyBg,
        border: workUserLocation ? '1px solid var(--pg-aqua-400)' : H.cntyBdr,
        borderRadius: 999,
        padding: workUserLocation ? '5px 11px' : '5px 9px',
        cursor: 'pointer',
        fontFamily: 'inherit',
        color: 'inherit',
        touchAction: 'manipulation'
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: workUserLocation ? 'var(--pg-aqua-600)' : H.cntyIc,
      strokeWidth: "2.2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z",
      fill: workUserLocation ? 'var(--pg-aqua-400)' : 'none'
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "9",
      r: "2.5",
      fill: workUserLocation ? 'white' : 'none'
    })), workUserLocation && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 600,
        color: 'var(--pg-aqua-700)',
        whiteSpace: 'nowrap'
      }
    }, workLocCity ? `${workLocCity} · ` : '', workRadiusMiles, " mi"))), sub === 'techs' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 26,
        height: 26,
        borderRadius: 7,
        background: H.iconBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "13",
      height: "13",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: H.iconC,
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "8",
      r: "5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M8.21 13.89 7 22l5-3 5 3-1.21-8.12"
    }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 16,
        fontWeight: 700,
        fontFamily: 'var(--pg-font-display)',
        lineHeight: 1,
        color: H.text
      }
    }, TECHS.length), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        opacity: 0.55,
        lineHeight: 1,
        marginTop: 1,
        color: H.text
      }
    }, lang === 'pt' ? 'técnicos' : lang === 'es' ? 'técnicos' : 'techs'))), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 1,
        height: 28,
        background: H.divider
      }
    }), /*#__PURE__*/React.createElement("button", {
      onClick: () => setWorkLocationFilterOpen(true),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        background: workUserLocation ? 'var(--pg-aqua-100)' : H.cntyBg,
        border: workUserLocation ? '1px solid var(--pg-aqua-400)' : H.cntyBdr,
        borderRadius: 999,
        padding: workUserLocation ? '5px 11px' : '5px 9px',
        cursor: 'pointer',
        fontFamily: 'inherit',
        color: 'inherit',
        touchAction: 'manipulation'
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: workUserLocation ? 'var(--pg-aqua-600)' : H.cntyIc,
      strokeWidth: "2.2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z",
      fill: workUserLocation ? 'var(--pg-aqua-400)' : 'none'
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "9",
      r: "2.5",
      fill: workUserLocation ? 'white' : 'none'
    })), workUserLocation && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 600,
        color: 'var(--pg-aqua-700)',
        whiteSpace: 'nowrap'
      }
    }, workLocCity ? `${workLocCity} · ` : '', workRadiusMiles, " mi"))), sub === 'vac' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 26,
        height: 26,
        borderRadius: 7,
        background: H.iconBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "13",
      height: "13",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: H.iconC,
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M12 22V8"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 8c-2-2-5-2-7 0 2 2 5 2 7 0Z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 8c2-2 5-2 7 0-2 2-5 2-7 0Z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M5 12c2 0 4 1 4 3M19 12c-2 0-4 1-4 3"
    }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 16,
        fontWeight: 700,
        fontFamily: 'var(--pg-font-display)',
        lineHeight: 1,
        color: H.text
      }
    }, VACATION_LISTINGS.length), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        opacity: 0.55,
        lineHeight: 1,
        marginTop: 1,
        color: H.text
      }
    }, lang === 'pt' ? 'coberturas' : lang === 'es' ? 'coberturas' : 'covers'))), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 1,
        height: 28,
        background: H.divider
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 26,
        height: 26,
        borderRadius: 7,
        background: H.iconBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, Icon.cal(13, H.iconC)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 16,
        fontWeight: 700,
        fontFamily: 'var(--pg-font-display)',
        lineHeight: 1,
        color: H.text
      }
    }, VACATIONS_APPLIED ? VACATIONS_APPLIED.length : 0), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        opacity: 0.55,
        lineHeight: 1,
        marginTop: 1,
        color: H.text
      }
    }, lang === 'pt' ? 'aplicadas' : lang === 'es' ? 'aplicadas' : 'applied'))))));
  })(), /*#__PURE__*/React.createElement(LocationFilterSheet, {
    open: workLocationFilterOpen,
    onClose: () => setWorkLocationFilterOpen(false),
    userLocation: workUserLocation,
    setUserLocation: setWorkUserLocation,
    radiusMiles: workRadiusMiles,
    setRadiusMiles: setWorkRadiusMiles,
    lang: lang
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 18px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      padding: 4,
      background: 'var(--pg-ink-100)',
      borderRadius: 14
    }
  }, tabs.map(s => {
    const on = sub === s.id;
    return /*#__PURE__*/React.createElement("button", {
      key: s.id,
      onClick: () => setSub(s.id),
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
    }, subIcons[s.id](16, on ? 'var(--pg-blue-500)' : 'var(--pg-ink-400)'), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11.5,
        fontWeight: on ? 700 : 500,
        letterSpacing: '-0.01em'
      }
    }, s.label));
  }))), (sub === 'hiring' || sub === 'vac') && (() => {
    // Data per sub-tab — uses shared variables defined above
    const myApps = sub === 'hiring' ? myAppsHiring : myAppsVac;
    const myPosts = sub === 'hiring' ? myPostsHiring : myPostsVac;
    const totalApps = myApps.length;
    const totalPosts = myPosts.length;
    const activityLbl = lang === 'pt' ? 'Minha Atividade' : lang === 'es' ? 'Mi Actividad' : 'My Activity';
    const appsLbl = lang === 'pt' ? 'Candidaturas' : lang === 'es' ? 'Solicitudes' : 'Applications';
    const myPostsLbl = lang === 'pt' ? 'Meus Posts' : lang === 'es' ? 'Mis Posts' : 'My Posts';
    const emptyApps = lang === 'pt' ? 'Nenhuma candidatura ainda' : lang === 'es' ? 'Sin solicitudes aún' : 'No applications yet';
    const emptyPosts = lang === 'pt' ? 'Nenhum post publicado' : lang === 'es' ? 'Sin publicaciones' : 'No posts yet';
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '10px 18px 0'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "pg-card",
      style: {
        padding: '12px 14px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 3,
        height: 14,
        borderRadius: 2,
        background: 'var(--pg-blue-500)',
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.06em',
        color: 'var(--pg-ink-700)',
        textTransform: 'uppercase'
      }
    }, activityLbl)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 0,
        background: 'var(--pg-ink-100)',
        borderRadius: 10,
        padding: 3,
        marginBottom: 12
      }
    }, [{
      id: 'applications',
      label: appsLbl,
      count: totalApps
    }, {
      id: 'myposts',
      label: myPostsLbl,
      count: totalPosts
    }].map(tab => {
      const on = myActivityTab === tab.id;
      return /*#__PURE__*/React.createElement("button", {
        key: tab.id,
        onClick: () => setMyActivityTab(tab.id),
        style: {
          flex: 1,
          padding: '7px 4px',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          background: on ? '#fff' : 'transparent',
          color: on ? 'var(--pg-blue-600)' : 'var(--pg-ink-500)',
          fontFamily: 'inherit',
          fontSize: 12,
          fontWeight: on ? 700 : 500,
          boxShadow: on ? '0 1px 4px rgba(15,30,60,0.12)' : 'none',
          transition: 'all .15s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 5
        }
      }, tab.label, tab.count > 0 && /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 10,
          fontWeight: 700,
          minWidth: 16,
          height: 16,
          borderRadius: 999,
          padding: '0 4px',
          background: on ? 'var(--pg-blue-500)' : 'var(--pg-ink-300)',
          color: '#fff',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center'
        }
      }, tab.count));
    })), myActivityTab === 'applications' && (currentMyApps.length === 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        padding: '10px 0 4px',
        color: 'var(--pg-ink-400)',
        fontSize: 12.5
      }
    }, emptyApps) : /*#__PURE__*/React.createElement(React.Fragment, null, visibleApps.map((app, i) => {
      // Hiring app
      if (sub === 'hiring') {
        const isPending = app.status === 'pending';
        const isAccepted = app.status === 'accepted';
        const isProgress = app.status === 'in_progress';
        const isRejected = app.status === 'rejected';
        const statusCfg = isPending ? {
          label: lang === 'pt' ? 'Aguardando' : lang === 'es' ? 'Pendiente' : 'Pending',
          color: 'oklch(0.48 0.14 68)',
          bg: 'oklch(0.96 0.05 68)'
        } : isAccepted || isProgress ? {
          label: lang === 'pt' ? 'Aceito ✓' : lang === 'es' ? 'Aceptado ✓' : 'Accepted ✓',
          color: 'var(--pg-blue-600)',
          bg: 'var(--pg-blue-50)'
        } : {
          label: lang === 'pt' ? 'Recusado' : lang === 'es' ? 'Rechazado' : 'Rejected',
          color: 'oklch(0.45 0.18 20)',
          bg: 'oklch(0.95 0.04 20)'
        };
        return /*#__PURE__*/React.createElement("div", {
          key: app.id,
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 0',
            borderTop: '1px solid var(--pg-ink-100)'
          }
        }, /*#__PURE__*/React.createElement("div", {
          onClick: () => openHiringAppDetail && openHiringAppDetail(app),
          style: {
            flex: 1,
            minWidth: 0,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            flex: 1,
            minWidth: 0
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--pg-ink-900)',
            marginBottom: 3,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }
        }, app.company), /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            flexWrap: 'wrap'
          }
        }, /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 10.5,
            fontWeight: 700,
            padding: '2px 6px',
            borderRadius: 6,
            background: statusCfg.bg,
            color: statusCfg.color
          }
        }, statusCfg.label), /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 11,
            color: 'var(--pg-ink-400)'
          }
        }, "\xB7 ", tr(app.pay, lang)))), !isRejected && Icon.chev(14, 'var(--pg-ink-300)')), isRejected && /*#__PURE__*/React.createElement("button", {
          onClick: () => deleteApp(app),
          style: {
            flexShrink: 0,
            width: 28,
            height: 28,
            borderRadius: 8,
            border: '1px solid #FCA5A5',
            background: '#FEF2F2',
            color: '#EF4444',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }
        }, /*#__PURE__*/React.createElement("svg", {
          width: "12",
          height: "12",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2.5",
          strokeLinecap: "round"
        }, /*#__PURE__*/React.createElement("path", {
          d: "M18 6L6 18M6 6l12 12"
        }))));
      }
      // Vacation app
      const isAwaiting = app.status === 'awaiting';
      const isAccepted = app.status === 'accepted';
      const statusCfg = isAwaiting ? {
        label: lang === 'pt' ? 'Aguardando' : lang === 'es' ? 'Pendiente' : 'Pending',
        color: 'oklch(0.48 0.14 68)',
        bg: 'oklch(0.96 0.05 68)'
      } : isAccepted ? {
        label: lang === 'pt' ? 'Confirmado ✓' : lang === 'es' ? 'Confirmado ✓' : 'Confirmed ✓',
        color: 'var(--pg-blue-600)',
        bg: 'var(--pg-blue-50)'
      } : {
        label: app.status,
        color: 'var(--pg-ink-500)',
        bg: 'var(--pg-ink-100)'
      };
      return /*#__PURE__*/React.createElement("div", {
        key: app.id,
        onClick: () => openSchedule && openSchedule(app),
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 0',
          borderTop: '1px solid var(--pg-ink-100)',
          cursor: 'pointer'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          minWidth: 0
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 13,
          fontWeight: 700,
          color: 'var(--pg-ink-900)',
          marginBottom: 3,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }
      }, app.owner), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flexWrap: 'wrap'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 10.5,
          fontWeight: 700,
          padding: '2px 6px',
          borderRadius: 6,
          background: statusCfg.bg,
          color: statusCfg.color
        }
      }, statusCfg.label), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11,
          color: 'var(--pg-ink-400)'
        }
      }, "\xB7 ", tr(app.month, lang), " \xB7 ", app.poolsPerDay, " ", lang === 'pt' ? 'pisc/dia' : lang === 'es' ? 'pisc/día' : 'pools/day'))), /*#__PURE__*/React.createElement("div", {
        style: {
          textAlign: 'right',
          flexShrink: 0
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: 'var(--pg-font-display)',
          fontSize: 14,
          fontWeight: 700,
          color: 'var(--pg-blue-500)'
        }
      }, "$", app.pricePerPool), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 10,
          color: 'var(--pg-ink-400)'
        }
      }, lang === 'pt' ? '/piscina' : lang === 'es' ? '/piscina' : '/pool')));
    }), currentMyApps.length > activityLimit && /*#__PURE__*/React.createElement("button", {
      onClick: () => setActivityLimit(p => p + 4),
      style: {
        width: '100%',
        marginTop: 6,
        padding: '7px 0',
        borderRadius: 8,
        border: 'none',
        background: 'var(--pg-ink-100)',
        color: 'var(--pg-blue-600)',
        fontWeight: 700,
        fontSize: 12,
        cursor: 'pointer',
        fontFamily: 'inherit'
      }
    }, lang === 'pt' ? `Ver mais (${currentMyApps.length - activityLimit})` : lang === 'es' ? `Ver más (${currentMyApps.length - activityLimit})` : `See more (${currentMyApps.length - activityLimit})`))), myActivityTab === 'myposts' && (myPosts.length === 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        padding: '10px 0 4px',
        color: 'var(--pg-ink-400)',
        fontSize: 12.5
      }
    }, emptyPosts) : myPosts.map(post => {
      const pending = post.applicants ? post.applicants.filter(a => a.status === 'pending').length : 0;
      const withInterview = post.applicants ? post.applicants.filter(a => a.interview).length : 0;
      const totalApplicants = post.applicants ? post.applicants.length : 0;
      return /*#__PURE__*/React.createElement("div", {
        key: post.id,
        onClick: () => openApplicants && openApplicants(post),
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 0',
          borderTop: '1px solid var(--pg-ink-100)',
          cursor: 'pointer'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          minWidth: 0
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 13,
          fontWeight: 700,
          color: 'var(--pg-ink-900)',
          marginBottom: 3,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }
      }, tr(post.title, lang)), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          flexWrap: 'wrap'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 10.5,
          fontWeight: 700,
          padding: '2px 6px',
          borderRadius: 6,
          background: 'var(--pg-blue-100)',
          color: 'var(--pg-blue-700)'
        }
      }, lang === 'pt' ? 'ABERTA' : lang === 'es' ? 'ABIERTA' : 'OPEN'), pending > 0 && /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11,
          color: 'oklch(0.48 0.14 68)',
          fontWeight: 700
        }
      }, pending, " ", lang === 'pt' ? 'pendente(s)' : lang === 'es' ? 'pendiente(s)' : 'pending'), withInterview > 0 && /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11,
          color: 'oklch(0.40 0.18 145)',
          fontWeight: 600
        }
      }, "\uD83D\uDCC5 ", withInterview, " ", lang === 'pt' ? 'entrev.' : lang === 'es' ? 'entrev.' : 'interview', withInterview > 1 ? 's' : ''))), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          flexShrink: 0
        }
      }, totalApplicants > 0 && /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 12,
          color: 'var(--pg-blue-500)',
          fontWeight: 700
        }
      }, totalApplicants, " ", lang === 'pt' ? 'cands.' : lang === 'es' ? 'cands.' : 'apps'), Icon.chev(14, 'var(--pg-ink-300)')));
    }))));
  })(), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 18px 0'
    }
  }, sub === 'hiring' && /*#__PURE__*/React.createElement(HiringPanel, {
    t: t,
    lang: lang,
    onChat: openChat,
    onViewApplicants: openApplicants,
    onCreate: () => setHiringSheetOpen(true),
    user: ctx.user,
    onApply: openApplyJob,
    hidePosted: false,
    openPublicProfile: openPublicProfile,
    liveJobs: filteredLiveJobs,
    showToast: showToast,
    onDeleteJob: removeJob,
    liveApplications: liveApplications
  }), sub === 'techs' && /*#__PURE__*/React.createElement(TechsPanel, {
    t: t,
    lang: lang,
    onChat: openChat,
    onCreate: () => setTechSheetOpen(true),
    openPublicProfile: openPublicProfile,
    liveTechs: filteredLiveTechs,
    user: ctx.user,
    showToast: showToast,
    onDeleteTech: removeTech
  }), sub === 'vac' && /*#__PURE__*/React.createElement(VacationPanel, {
    t: t,
    lang: lang,
    vacTab: vacTab,
    setVacTab: setVacTab,
    onChat: openChat,
    onCreate: openVacSheet,
    onViewApplicants: openApplicants,
    openDayPicker: openDayPicker,
    openSchedule: openSchedule,
    openPublicProfile: openPublicProfile,
    liveVacations: filteredLiveVacations,
    user: ctx.user,
    showToast: showToast,
    onDeleteVac: removeVacation
  }))), FabBtn);
}

// ── Shared "My Applications" tracking section ─────────────────
function MyApplicationsSection({
  apps,
  lang,
  onChat,
  type = 'hiring'
}) {
  if (!apps || apps.length === 0) return null;
  const sectionLabel = lang === 'pt' ? 'MINHAS CANDIDATURAS' : lang === 'es' ? 'MIS SOLICITUDES' : 'MY APPLICATIONS';
  const pendingCount = apps.filter(a => a.status === 'pending').length;
  const TypeIcon = (s, c) => type === 'techs' ? /*#__PURE__*/React.createElement("svg", {
    width: s,
    height: s,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: c,
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M14 7a4 4 0 1 0-5 5l-6 6 3 3 6-6a4 4 0 0 0 5-5l-3 3-3-3z"
  })) : Icon.briefcase(s, c);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '0.5px solid var(--pg-ink-200)',
      marginTop: 20,
      paddingTop: 16,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 7,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 3,
      height: 16,
      borderRadius: 2,
      background: 'var(--pg-blue-500)',
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      fontWeight: 700,
      letterSpacing: '0.06em',
      color: 'var(--pg-ink-700)'
    }
  }, sectionLabel), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      padding: '2px 8px',
      borderRadius: 999,
      background: pendingCount > 0 ? 'oklch(0.96 0.05 68)' : 'var(--pg-ink-100)',
      color: pendingCount > 0 ? 'oklch(0.48 0.14 68)' : 'var(--pg-ink-500)'
    }
  }, apps.length)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, apps.map(app => {
    const isPending = app.status === 'pending';
    const isAccepted = app.status === 'accepted';
    const isRejected = app.status === 'rejected';
    const statusCfg = isPending ? {
      label: lang === 'pt' ? 'AGUARDANDO' : lang === 'es' ? 'PENDIENTE' : 'PENDING',
      bg: 'oklch(0.96 0.05 68)',
      color: 'oklch(0.48 0.14 68)',
      bar: 'oklch(0.75 0.14 68)'
    } : isAccepted ? {
      label: lang === 'pt' ? 'ACEITO ✓' : lang === 'es' ? 'ACEPTADO ✓' : 'ACCEPTED ✓',
      bg: 'var(--pg-aqua-100)',
      color: 'var(--pg-aqua-700)',
      bar: 'var(--pg-aqua-500)'
    } : {
      label: lang === 'pt' ? 'RECUSADO' : lang === 'es' ? 'RECHAZADO' : 'REJECTED',
      bg: 'oklch(0.95 0.04 20)',
      color: 'oklch(0.45 0.18 20)',
      bar: 'oklch(0.60 0.18 20)'
    };
    const iconColor = isAccepted ? 'var(--pg-aqua-700)' : isRejected ? 'var(--pg-ink-400)' : 'var(--pg-blue-700)';
    const iconBg = isAccepted ? 'var(--pg-aqua-100)' : isRejected ? 'var(--pg-ink-100)' : 'var(--pg-blue-100)';
    return /*#__PURE__*/React.createElement("article", {
      key: app.id,
      className: "pg-card",
      style: {
        padding: 0,
        overflow: 'hidden',
        borderLeft: `3px solid ${statusCfg.bar}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: statusCfg.bg,
        padding: '7px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10.5,
        fontWeight: 800,
        letterSpacing: '0.08em',
        color: statusCfg.color
      }
    }, statusCfg.label), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: statusCfg.color,
        opacity: 0.75
      }
    }, app.when, " ", lang === 'pt' ? 'atrás' : lang === 'es' ? 'atrás' : 'ago')), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '12px 14px 14px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 36,
        height: 36,
        borderRadius: 9,
        flexShrink: 0,
        background: iconBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, TypeIcon(16, iconColor)), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        fontWeight: 700,
        marginBottom: 2,
        color: isRejected ? 'var(--pg-ink-500)' : 'var(--pg-ink-900)'
      }
    }, app.company), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12.5,
        color: 'var(--pg-ink-600)',
        fontWeight: 500
      }
    }, tr(app.title, lang)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
        fontSize: 11.5,
        color: 'var(--pg-ink-500)',
        flexWrap: 'wrap'
      }
    }, Icon.pin(11, 'var(--pg-ink-400)'), " ", app.loc, /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--pg-ink-300)'
      }
    }, "\xB7"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--pg-font-display)',
        fontWeight: 700,
        fontSize: 13,
        color: isRejected ? 'var(--pg-ink-400)' : 'var(--pg-blue-500)',
        textDecoration: isRejected ? 'line-through' : 'none'
      }
    }, tr(app.pay, lang))))), app.note && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        lineHeight: 1.45,
        padding: '8px 10px',
        borderRadius: 8,
        marginBottom: 12,
        color: isRejected ? 'var(--pg-ink-400)' : 'var(--pg-ink-600)',
        background: isRejected ? 'var(--pg-ink-50)' : 'var(--pg-blue-50)'
      }
    }, tr(app.note, lang)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        paddingTop: 10,
        borderTop: '0.5px solid var(--pg-ink-100)'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => onChat(app.author_id ? {
        id: app.author_id,
        name: app.company,
        listingId: app.job_id || null,
        listingContext: {
          name: tr(app.title, lang) || app.company,
          type: 'hiring'
        }
      } : app.company),
      className: "pg-btn pg-btn-ghost",
      style: {
        height: 34,
        padding: '0 14px',
        fontSize: 12.5,
        borderRadius: 999
      }
    }, Icon.msg(13, 'var(--pg-blue-700)')), isAccepted ? /*#__PURE__*/React.createElement("button", {
      className: "pg-btn pg-btn-aqua",
      style: {
        flex: 1,
        height: 34,
        fontSize: 12.5,
        borderRadius: 999
      }
    }, lang === 'pt' ? 'Ver detalhes' : lang === 'es' ? 'Ver detalles' : 'View details') : isRejected ? /*#__PURE__*/React.createElement("button", {
      className: "pg-btn pg-btn-ghost",
      disabled: true,
      style: {
        flex: 1,
        height: 34,
        fontSize: 12.5,
        borderRadius: 999,
        opacity: 0.45
      }
    }, lang === 'pt' ? 'Candidatura encerrada' : lang === 'es' ? 'Postulación cerrada' : 'Application closed') : /*#__PURE__*/React.createElement("button", {
      className: "pg-btn pg-btn-outline",
      style: {
        flex: 1,
        height: 34,
        fontSize: 12.5,
        borderRadius: 999,
        color: 'var(--pg-danger)'
      }
    }, lang === 'pt' ? 'Cancelar' : lang === 'es' ? 'Cancelar' : 'Withdraw'))));
  })));
}

// ── Card with company-style header ────────────────────────────
function HiringPanel({
  t,
  lang,
  onChat,
  onViewApplicants,
  onCreate,
  user,
  onApply,
  hidePosted = false,
  openPublicProfile,
  liveJobs = [],
  showToast,
  onDeleteJob,
  liveApplications = []
}) {
  const Company = (s = 20, c = 'var(--pg-blue-500)') => /*#__PURE__*/React.createElement("svg", {
    width: s,
    height: s,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: c,
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "4",
    y: "3",
    width: "16",
    height: "18",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 8h2M13 8h2M9 12h2M13 12h2M9 16h2M13 16h2"
  }));
  const Briefcase = (s = 13, c = 'var(--pg-ink-500)') => Icon.briefcase(s, c);
  const License = (s = 13, c = 'var(--pg-ink-500)') => /*#__PURE__*/React.createElement("svg", {
    width: s,
    height: s,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: c,
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "6",
    width: "18",
    height: "13",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 11h4M7 14h6M14 10h4v6h-4z"
  }));
  const cdlLbl = lang === 'pt' ? "Driver's license obrigatória" : lang === 'es' ? "Driver's license requerida" : "Driver's license required";
  const eqProv = lang === 'pt' ? 'Equipamento fornecido' : lang === 'es' ? 'Equipo provisto' : 'Equipment provided';
  const contractLabel = c => ({
    fullTime: lang === 'pt' ? 'Full-time' : lang === 'es' ? 'Tiempo completo' : 'Full-time',
    partTime: lang === 'pt' ? 'Part-time' : lang === 'es' ? 'Medio tiempo' : 'Part-time',
    contract: lang === 'pt' ? 'Contrato' : lang === 'es' ? 'Contrato' : 'Contract'
  })[c] || c;
  const [hiddenStatic, setHiddenStatic] = React.useState([]);
  const [selectedJob, setSelectedJob] = React.useState(null);
  React.useEffect(() => {
    if (window.__pgOpenJobId && liveJobs.length > 0) {
      const job = liveJobs.find(j => j._id === window.__pgOpenJobId);
      window.__pgOpenJobId = null;
      if (job) setSelectedJob(job);
    }
  }, [liveJobs]);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Sheet, {
    open: !!selectedJob,
    onClose: () => setSelectedJob(null),
    height: "92%"
  }, selectedJob && (() => {
    const job = selectedJob;
    const myApp = user?.uid ? liveApplications.find(a => a.job_id === job._id) : null;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '0 0 32px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '8px 18px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setSelectedJob(null),
      style: {
        border: 'none',
        background: 'transparent',
        color: 'var(--pg-blue-500)',
        fontSize: 15,
        fontWeight: 600,
        cursor: 'pointer',
        padding: 0
      }
    }, lang === 'pt' ? 'Fechar' : lang === 'es' ? 'Cerrar' : 'Close'), /*#__PURE__*/React.createElement("h2", {
      style: {
        margin: 0,
        fontFamily: 'var(--pg-font-display)',
        fontSize: 17,
        fontWeight: 700,
        letterSpacing: '-0.01em'
      }
    }, lang === 'pt' ? 'Detalhes da Vaga' : lang === 'es' ? 'Detalle del Empleo' : 'Job Details'), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 60
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '0 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 44,
        height: 44,
        borderRadius: 12,
        background: 'var(--pg-blue-100)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "22",
      height: "22",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "var(--pg-blue-700)",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("rect", {
      x: "4",
      y: "3",
      width: "16",
      height: "18",
      rx: "2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M9 8h2M13 8h2M9 12h2M13 12h2M9 16h2M13 16h2"
    }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 18,
        fontWeight: 700,
        fontFamily: 'var(--pg-font-display)',
        letterSpacing: '-0.015em'
      }
    }, job.author), job.role && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: 'var(--pg-ink-600)',
        marginTop: 2
      }
    }, job.role))), job.desc && /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        fontSize: 13.5,
        color: 'var(--pg-ink-700)',
        lineHeight: 1.6,
        background: 'var(--pg-ink-50)',
        borderRadius: 10,
        padding: '12px 14px'
      }
    }, job.desc), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        fontSize: 13,
        color: 'var(--pg-ink-600)'
      }
    }, job.loc && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, Icon.pin(15, 'var(--pg-blue-500)'), " ", job.loc), job.contract && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "15",
      height: "15",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "var(--pg-blue-500)",
      strokeWidth: "1.8",
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
    })), {
      fullTime: lang === 'pt' ? 'Full-time' : lang === 'es' ? 'Tiempo completo' : 'Full-time',
      partTime: lang === 'pt' ? 'Part-time' : lang === 'es' ? 'Medio tiempo' : 'Part-time',
      contract: lang === 'pt' ? 'Contrato' : lang === 'es' ? 'Contrato' : 'Contract'
    }[job.contract] || job.contract), job.equipReq && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "15",
      height: "15",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "var(--pg-blue-500)",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M14 7a4 4 0 1 0-5 5l-6 6 3 3 6-6a4 4 0 0 0 5-5l-3 3-3-3z"
    })), job.equipReq === 'companyEquip' ? lang === 'pt' ? 'Equipamento fornecido' : lang === 'es' ? 'Equipo provisto' : 'Equipment provided' : lang === 'pt' ? 'Equip. próprio necessário' : lang === 'es' ? 'Equipo propio requerido' : 'Own equipment required'), job.carReq && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "15",
      height: "15",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "var(--pg-blue-500)",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M5 17H3v-5l2-5h14l2 5v5h-2"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "7.5",
      cy: "17.5",
      r: "2.5"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "16.5",
      cy: "17.5",
      r: "2.5"
    })), job.carReq === 'companyCar' ? lang === 'pt' ? 'Carro da empresa' : lang === 'es' ? 'Auto de empresa' : 'Company car provided' : lang === 'pt' ? 'Carro próprio necessário' : lang === 'es' ? 'Auto propio requerido' : 'Own car required'), job.licenseReq === 'required' && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "15",
      height: "15",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "var(--pg-blue-500)",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("rect", {
      x: "2",
      y: "6",
      width: "20",
      height: "13",
      rx: "2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M7 11h4M7 14h6M15 10h2v4h-2z"
    })), lang === 'pt' ? "Driver's license obrigatória" : lang === 'es' ? "Driver's license requerida" : "Driver's license required")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        borderRadius: 12,
        background: 'var(--pg-blue-50)',
        border: '1px solid var(--pg-blue-100)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        color: 'var(--pg-blue-700)',
        fontWeight: 600
      }
    }, lang === 'pt' ? 'Remuneração' : lang === 'es' ? 'Pago' : 'Pay'), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--pg-font-display)',
        fontSize: 22,
        fontWeight: 800,
        color: 'var(--pg-blue-500)',
        letterSpacing: '-0.02em'
      }
    }, job.payMode === 'neg' ? lang === 'pt' ? 'Negociável' : lang === 'es' ? 'Negociable' : 'Negotiable' : `$${job.pay}${job.payMode === 'weekly' ? lang === 'pt' ? '/sem' : '/wk' : '/pool'}`))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '20px 18px 0',
        position: 'sticky',
        bottom: 0,
        background: 'var(--pg-white)',
        borderTop: '0.5px solid var(--pg-ink-200)',
        marginTop: 16
      }
    }, myApp?.status === 'rejected' ? /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '14px',
        borderRadius: 12,
        background: 'rgba(239,68,68,0.08)',
        border: '1px solid rgba(239,68,68,0.25)',
        textAlign: 'center',
        fontSize: 13,
        fontWeight: 700,
        color: '#EF4444'
      }
    }, lang === 'pt' ? 'Candidatura recusada' : lang === 'es' ? 'Solicitud rechazada' : 'Application rejected') : myApp?.status === 'pending' ? /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '14px',
        borderRadius: 12,
        background: 'rgba(245,158,11,0.08)',
        border: '1px solid rgba(245,158,11,0.25)',
        textAlign: 'center',
        fontSize: 13,
        fontWeight: 700,
        color: '#D97706'
      }
    }, lang === 'pt' ? 'Candidatura enviada — aguardando resposta' : lang === 'es' ? 'Solicitud enviada — esperando respuesta' : 'Application sent — awaiting response') : myApp?.status === 'accepted' ? /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '14px',
        borderRadius: 12,
        background: 'rgba(16,185,129,0.08)',
        border: '1px solid rgba(16,185,129,0.25)',
        textAlign: 'center',
        fontSize: 13,
        fontWeight: 700,
        color: '#10B981'
      }
    }, lang === 'pt' ? 'Candidatura aceita!' : lang === 'es' ? '¡Solicitud aceptada!' : 'Application accepted!') : user?.uid && user.uid === job.author_id ? /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '14px',
        borderRadius: 12,
        background: 'var(--pg-blue-50)',
        border: '1px solid var(--pg-blue-100)',
        textAlign: 'center',
        fontSize: 13,
        fontWeight: 700,
        color: 'var(--pg-blue-600)'
      }
    }, lang === 'pt' ? 'Sua vaga' : lang === 'es' ? 'Tu oferta' : 'Your listing') : /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        setSelectedJob(null);
        onApply && onApply(job);
      },
      className: "pg-btn pg-btn-primary",
      style: {
        width: '100%',
        height: 52,
        fontSize: 16,
        borderRadius: 14
      }
    }, t.apply)));
  })()), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, liveJobs.filter(job => !hidePosted || !user?.uid || user.uid !== job.author_id).map(job => /*#__PURE__*/React.createElement("article", {
    key: job._id,
    className: "pg-card pg-press",
    onClick: () => setSelectedJob(job),
    style: {
      padding: '14px 16px',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      openPublicProfile && openPublicProfile({
        name: job.author,
        rating: 4.8,
        reviews: 0,
        jobs: 0,
        loc: job.loc
      });
    },
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 8,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: 0,
      fontFamily: 'inherit',
      textAlign: 'left',
      width: '100%'
    },
    className: "pg-press"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 28,
      height: 28,
      borderRadius: 7,
      background: 'var(--pg-blue-100)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, Company(15, 'var(--pg-blue-700)')), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontFamily: 'var(--pg-font-display)',
      fontSize: 15,
      fontWeight: 700,
      letterSpacing: '-0.015em',
      flex: 1,
      minWidth: 0
    }
  }, job.author), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9.5,
      fontWeight: 700,
      padding: '2px 8px',
      borderRadius: 6,
      background: 'var(--pg-aqua-100)',
      color: 'var(--pg-aqua-700)',
      flexShrink: 0,
      letterSpacing: '0.05em',
      marginLeft: 4
    }
  }, "NEW")), job.role && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 4px',
      fontSize: 13.5,
      fontWeight: 600,
      color: 'var(--pg-ink-900)',
      lineHeight: 1.3
    }
  }, job.role), job.desc && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 10px',
      fontSize: 12.5,
      color: 'var(--pg-ink-600)',
      lineHeight: 1.45
    }
  }, job.desc), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      marginTop: job.desc ? 0 : 8,
      fontSize: 12.5,
      color: 'var(--pg-ink-500)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      flexWrap: 'wrap'
    }
  }, job.loc && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5
    }
  }, Icon.pin(13, 'var(--pg-ink-500)'), " ", job.loc), job.equipReq === 'companyEquip' && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5
    }
  }, Briefcase(13), " ", eqProv), job.equipReq === 'ownEquip' && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5
    }
  }, Briefcase(13), " ", lang === 'pt' ? 'Equip. próprio' : lang === 'es' ? 'Equipo propio' : 'Own equipment')), job.carReq === 'companyCar' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5
    }
  }, License(13), " ", lang === 'pt' ? 'Carro da empresa incluso' : lang === 'es' ? 'Auto de empresa incluido' : 'Company car provided'), job.carReq === 'ownCar' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5
    }
  }, License(13), " ", lang === 'pt' ? 'Carro próprio necessário' : lang === 'es' ? 'Auto propio requerido' : 'Own car required'), job.licenseReq === 'required' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--pg-ink-500)",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: "6",
    width: "20",
    height: "13",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 11h4M7 14h6M15 10h2v4h-2z"
  })), lang === 'pt' ? "Driver's license obrigatória" : lang === 'es' ? "Driver's license requerida" : "Driver's license required"), job.licenseReq === 'notRequired' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--pg-ink-500)",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 12h6"
  })), lang === 'pt' ? "Driver's license não necessária" : lang === 'es' ? "Driver's license no requerida" : "No driver's license needed")), job.contract && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap',
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "pg-chip",
    style: {
      fontSize: 11
    }
  }, contractLabel(job.contract))), /*#__PURE__*/React.createElement("div", {
    className: "pg-divider",
    style: {
      margin: '12px 0'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--pg-font-display)',
      fontSize: 16,
      fontWeight: 700,
      color: job.payMode === 'neg' ? 'var(--pg-aqua-700)' : 'var(--pg-blue-500)',
      letterSpacing: '-0.01em'
    }
  }, job.payMode === 'neg' ? lang === 'pt' ? 'Negociável' : lang === 'es' ? 'Negociable' : 'Negotiable' : `$${job.pay}${job.payMode === 'weekly' ? lang === 'pt' ? '/sem' : '/wk' : '/pool'}`), (() => {
    const myApp = user?.uid ? liveApplications.find(a => a.job_id === job._id) : null;
    if (myApp?.status === 'rejected') {
      return /*#__PURE__*/React.createElement("div", {
        style: {
          height: 36,
          padding: '0 16px',
          borderRadius: 999,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(239,68,68,0.10)',
          border: '1.5px solid rgba(239,68,68,0.35)',
          color: '#EF4444',
          fontSize: 12.5,
          fontWeight: 700,
          letterSpacing: '0.02em',
          userSelect: 'none'
        }
      }, /*#__PURE__*/React.createElement("svg", {
        width: "13",
        height: "13",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2.2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("circle", {
        cx: "12",
        cy: "12",
        r: "9"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M15 9l-6 6M9 9l6 6"
      })), lang === 'pt' ? 'Recusado' : lang === 'es' ? 'Rechazado' : 'Rejected');
    }
    if (myApp?.status === 'pending') {
      return /*#__PURE__*/React.createElement("div", {
        style: {
          height: 36,
          padding: '0 16px',
          borderRadius: 999,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(245,158,11,0.10)',
          border: '1.5px solid rgba(245,158,11,0.35)',
          color: '#D97706',
          fontSize: 12.5,
          fontWeight: 700,
          letterSpacing: '0.02em',
          userSelect: 'none'
        }
      }, /*#__PURE__*/React.createElement("svg", {
        width: "13",
        height: "13",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("circle", {
        cx: "12",
        cy: "12",
        r: "9"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M12 7v5l3 3"
      })), lang === 'pt' ? 'Enviado' : lang === 'es' ? 'Enviado' : 'Applied');
    }
    if (myApp?.status === 'accepted') {
      return /*#__PURE__*/React.createElement("div", {
        style: {
          height: 36,
          padding: '0 16px',
          borderRadius: 999,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(16,185,129,0.10)',
          border: '1.5px solid rgba(16,185,129,0.35)',
          color: '#10B981',
          fontSize: 12.5,
          fontWeight: 700,
          letterSpacing: '0.02em',
          userSelect: 'none'
        }
      }, /*#__PURE__*/React.createElement("svg", {
        width: "13",
        height: "13",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2.2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("circle", {
        cx: "12",
        cy: "12",
        r: "9"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M9 12l2 2 4-4"
      })), lang === 'pt' ? 'Aceito' : lang === 'es' ? 'Aceptado' : 'Accepted');
    }
    // Own job — don't show apply button
    if (user?.uid && user.uid === job.author_id) {
      return /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11,
          fontWeight: 700,
          padding: '4px 10px',
          borderRadius: 999,
          background: 'rgba(0,119,182,0.12)',
          color: 'var(--pg-blue-600)',
          border: '1px solid rgba(0,119,182,0.25)'
        }
      }, lang === 'pt' ? 'Sua vaga' : lang === 'es' ? 'Tu oferta' : 'Your listing');
    }
    // Not applied yet — show Candidatar button
    return /*#__PURE__*/React.createElement("button", {
      onClick: () => onApply && onApply(job),
      className: "pg-btn pg-btn-primary",
      style: {
        height: 36,
        padding: '0 18px',
        fontSize: 13,
        borderRadius: 999
      }
    }, t.apply);
  })()), user?.uid && user.uid === job.author_id && user?.role !== 'admin' && /*#__PURE__*/React.createElement("div", {
    onClick: async () => {
      const msg = lang === 'pt' ? `Encerrar a vaga "${job.role}"? Isso indica que você já preencheu a posição.` : lang === 'es' ? `¿Cerrar la oferta "${job.role}"? Esto indica que ya cubriste el puesto.` : `Close the "${job.role}" listing? This means you've already filled the position.`;
      if (!window.confirm(msg)) return;
      const {
        error
      } = await window.sb.from('jobs').delete().eq('id', job._id);
      if (error) {
        showToast && showToast('❌ ' + error.message);
        return;
      }
      showToast && showToast('✓ ' + (lang === 'pt' ? 'Vaga encerrada!' : lang === 'es' ? '¡Oferta cerrada!' : 'Listing closed!'));
      onDeleteJob && onDeleteJob(job._id);
    },
    style: {
      marginTop: 8,
      padding: '7px 0',
      borderRadius: 8,
      cursor: 'pointer',
      background: 'rgba(16,185,129,0.08)',
      border: '1px solid rgba(16,185,129,0.28)',
      color: '#10B981',
      fontSize: 11,
      fontWeight: 700,
      textAlign: 'center',
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
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20 6L9 17l-5-5"
  })), lang === 'pt' ? 'Já contratei — Encerrar vaga' : lang === 'es' ? 'Ya contraté — Cerrar oferta' : 'Hired someone — Close listing'), user?.role === 'admin' && /*#__PURE__*/React.createElement("div", {
    onClick: async () => {
      if (!window.confirm(lang === 'pt' ? `Excluir vaga "${job.role}"?` : `Delete job "${job.role}"?`)) return;
      const {
        error
      } = await window.sb.from('jobs').delete().eq('id', job._id);
      if (error) {
        showToast && showToast('❌ ' + error.message);
        return;
      }
      showToast && showToast('🗑️ ' + (lang === 'pt' ? 'Vaga excluída' : 'Job deleted'));
      onDeleteJob && onDeleteJob(job._id);
    },
    style: {
      marginTop: 4,
      padding: '6px 0',
      borderRadius: 8,
      cursor: 'pointer',
      background: '#FEF2F2',
      border: '1px solid #FCA5A5',
      color: '#EF4444',
      fontSize: 11,
      fontWeight: 700,
      textAlign: 'center',
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
  })), lang === 'pt' ? 'Excluir' : lang === 'es' ? 'Eliminar' : 'Delete'))), HIRING.filter(h => !hiddenStatic.includes(h.id)).map(h => /*#__PURE__*/React.createElement("article", {
    key: h.id,
    className: "pg-card",
    style: {
      padding: '14px 16px 14px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => openPublicProfile && openPublicProfile({
      name: h.company,
      rating: 4.8,
      reviews: 64,
      jobs: 120,
      loc: h.loc
    }),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 8,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: 0,
      fontFamily: 'inherit',
      textAlign: 'left',
      width: '100%'
    },
    className: "pg-press"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 28,
      height: 28,
      borderRadius: 7,
      background: 'var(--pg-blue-100)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, Company(15, 'var(--pg-blue-700)')), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontFamily: 'var(--pg-font-display)',
      fontSize: 16,
      fontWeight: 700,
      letterSpacing: '-0.015em',
      flex: 1
    }
  }, h.company), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--pg-blue-500)',
      fontWeight: 600,
      flexShrink: 0
    }
  }, "Ver perfil \u2192")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 13,
      lineHeight: 1.45,
      color: 'var(--pg-ink-700)'
    }
  }, descForHiring(h, lang)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      marginTop: 10,
      fontSize: 12.5,
      color: 'var(--pg-ink-500)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5
    }
  }, Icon.pin(13, 'var(--pg-ink-500)'), " ", h.loc), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5
    }
  }, Briefcase(13, 'var(--pg-ink-500)'), " ", eqProv)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5
    }
  }, License(13, 'var(--pg-ink-500)'), " ", cdlLbl)), /*#__PURE__*/React.createElement("div", {
    className: "pg-divider",
    style: {
      margin: '12px 0'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--pg-font-display)',
      fontSize: 16,
      fontWeight: 700,
      color: tr(h.pay, lang) === t.negotiable ? 'var(--pg-aqua-700)' : 'var(--pg-blue-500)',
      letterSpacing: '-0.01em'
    }
  }, tr(h.pay, lang)), /*#__PURE__*/React.createElement("button", {
    onClick: () => onApply && onApply(h),
    className: "pg-btn pg-btn-primary",
    style: {
      height: 36,
      padding: '0 18px',
      fontSize: 13,
      borderRadius: 999
    }
  }, t.apply)), user?.role === 'admin' && /*#__PURE__*/React.createElement("div", {
    onClick: () => {
      if (!window.confirm(lang === 'pt' ? `Excluir "${h.company}"?` : `Delete "${h.company}"?`)) return;
      setHiddenStatic(prev => [...prev, h.id]);
      showToast && showToast('🗑️ ' + (lang === 'pt' ? 'Removido (sessão)' : 'Removed (session)'));
    },
    style: {
      marginTop: 8,
      padding: '6px 0',
      borderRadius: 8,
      cursor: 'pointer',
      background: '#FEF2F2',
      border: '1px solid #FCA5A5',
      color: '#EF4444',
      fontSize: 11,
      fontWeight: 700,
      textAlign: 'center',
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
  })), lang === 'pt' ? 'Excluir' : lang === 'es' ? 'Eliminar' : 'Delete')))));
}
function descForHiring(h, lang) {
  const descs = {
    1: {
      en: 'Looking for a reliable pool tech for our growing route. Full training provided.',
      pt: 'Procurando técnico de piscina confiável para nossa rota em crescimento. Treinamento completo.',
      es: 'Buscamos técnico de piscina confiable para nuestra ruta en crecimiento. Capacitación completa.'
    },
    2: {
      en: 'Expanding company needs experienced technician. Truck and equipment provided. CPO preferred.',
      pt: 'Empresa em expansão precisa de técnico experiente. Veículo e equipamentos fornecidos. CPO preferencial.',
      es: 'Empresa en expansión necesita técnico con experiencia. Camioneta y equipo provistos. CPO preferido.'
    },
    3: {
      en: 'High-end residential route. Must have own equipment and truck. Premium clientele.',
      pt: 'Rota residencial premium. Necessário equipamento e veículo próprios. Clientela exclusiva.',
      es: 'Ruta residencial premium. Necesario equipo y camioneta propios. Clientela exclusiva.'
    }
  };
  return (descs[h.id] || descs[1])[lang] || (descs[h.id] || descs[1]).en;
}

// ── Tech Review Sheet ─────────────────────────────────────────
function TechReviewSheet({
  open,
  onClose,
  tech,
  lang = 'en'
}) {
  const [rating, setRating] = React.useState(0);
  const [hover, setHover] = React.useState(0);
  const [comment, setComment] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);
  React.useEffect(() => {
    if (open) {
      setRating(0);
      setHover(0);
      setComment('');
      setSubmitted(false);
    }
  }, [open]);
  if (!tech) return null;
  const titleLbl = lang === 'pt' ? 'Avaliar técnico' : lang === 'es' ? 'Calificar técnico' : 'Rate technician';
  const reviewPh = lang === 'pt' ? 'Compartilhe sua experiência com este técnico…' : lang === 'es' ? 'Comparte tu experiencia con este técnico…' : 'Share your experience with this technician…';
  const submitLbl = lang === 'pt' ? 'Enviar avaliação' : lang === 'es' ? 'Enviar reseña' : 'Submit review';
  const skipLbl = lang === 'pt' ? 'Pular por agora' : lang === 'es' ? 'Omitir por ahora' : 'Skip for now';
  const sentLbl = lang === 'pt' ? 'Avaliação enviada!' : lang === 'es' ? '¡Reseña enviada!' : 'Review submitted!';
  const sentSubLbl = lang === 'pt' ? 'Obrigado! Isso ajuda outros pool guys a escolher técnicos de qualidade.' : lang === 'es' ? '¡Gracias! Esto ayuda a otros pool guys a elegir técnicos de calidad.' : 'Thanks! This helps other pool guys choose quality technicians.';
  const starLabels = {
    en: ['Terrible', 'Bad', 'OK', 'Good', 'Excellent'],
    pt: ['Péssimo', 'Ruim', 'Ok', 'Bom', 'Excelente'],
    es: ['Pésimo', 'Malo', 'Ok', 'Bueno', 'Excelente']
  };
  const sLabels = starLabels[lang] || starLabels.en;
  const displayed = hover || rating;
  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => onClose(), 1900);
  };
  return /*#__PURE__*/React.createElement(Sheet, {
    open: open,
    onClose: onClose,
    height: "auto"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '6px 20px 36px'
    }
  }, submitted ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '20px 0 10px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 68,
      height: 68,
      borderRadius: '50%',
      background: 'var(--pg-aqua-100)',
      margin: '0 auto 14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, Icon.check(30, 'var(--pg-aqua-700)')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 700,
      letterSpacing: '-0.02em'
    }
  }, sentLbl), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--pg-ink-500)',
      marginTop: 8,
      lineHeight: 1.5,
      maxWidth: 260,
      margin: '8px auto 0'
    }
  }, sentSubLbl)) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 18,
      fontWeight: 700,
      letterSpacing: '-0.01em'
    }
  }, titleLbl), /*#__PURE__*/React.createElement("button", {
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
      alignItems: 'center',
      gap: 10,
      padding: '10px 12px',
      borderRadius: 11,
      background: 'var(--pg-blue-50)',
      border: '0.5px solid var(--pg-blue-100)',
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: tech.name,
    size: 38
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: 'var(--pg-ink-900)'
    }
  }, tech.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--pg-ink-500)',
      marginTop: 1,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, tr(tech.speciality, lang), " \xB7 ", tech.loc)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Stars, {
    rating: tech.rating,
    size: 11
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--pg-ink-500)'
    }
  }, tech.rating))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      gap: 6,
      marginBottom: 10
    }
  }, [1, 2, 3, 4, 5].map(s => /*#__PURE__*/React.createElement("button", {
    key: s,
    onMouseEnter: () => setHover(s),
    onMouseLeave: () => setHover(0),
    onClick: () => setRating(s),
    style: {
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      padding: 4,
      transform: displayed >= s ? 'scale(1.1)' : 'scale(1)',
      transition: 'transform .12s'
    }
  }, Icon.star(38, displayed >= s ? 'oklch(0.78 0.18 80)' : 'var(--pg-ink-200)', displayed >= s)))), displayed > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: 'oklch(0.55 0.18 80)',
      letterSpacing: '-0.01em'
    }
  }, sLabels[displayed - 1])), /*#__PURE__*/React.createElement("textarea", {
    value: comment,
    onChange: e => setComment(e.target.value),
    placeholder: reviewPh,
    rows: 3,
    style: {
      width: '100%',
      borderRadius: 12,
      border: '1px solid var(--pg-ink-200)',
      padding: '12px 14px',
      fontSize: 14,
      fontFamily: 'inherit',
      resize: 'none',
      outline: 'none',
      background: 'var(--pg-ink-50)',
      boxSizing: 'border-box',
      color: 'var(--pg-ink-900)',
      lineHeight: 1.5
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: handleSubmit,
    disabled: rating === 0,
    className: "pg-btn pg-btn-primary",
    style: {
      width: '100%',
      height: 52,
      fontSize: 16,
      marginTop: 14,
      opacity: rating > 0 ? 1 : 0.45
    }
  }, Icon.star(18, '#fff', true), " ", submitLbl), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      width: '100%',
      padding: '10px',
      border: 'none',
      background: 'transparent',
      color: 'var(--pg-ink-500)',
      fontSize: 13,
      cursor: 'pointer',
      fontFamily: 'inherit'
    }
  }, skipLbl))));
}

// ── Technicians — same card layout as Hiring ─────────────────
function TechsPanel({
  t,
  lang,
  onChat,
  onCreate,
  openPublicProfile,
  liveTechs = [],
  user,
  showToast,
  onDeleteTech
}) {
  const [contactOpen, setContactOpen] = React.useState(null);
  const [ratingFor, setRatingFor] = React.useState(null);
  const [hiddenStatic, setHiddenStatic] = React.useState([]);
  const Briefcase = (s = 13, c = 'var(--pg-ink-500)') => Icon.briefcase(s, c);
  const Tool = (s = 13, c = 'var(--pg-ink-500)') => /*#__PURE__*/React.createElement("svg", {
    width: s,
    height: s,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: c,
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M14 7a4 4 0 1 0-5 5l-6 6 3 3 6-6a4 4 0 0 0 5-5l-3 3-3-3z"
  }));
  const verifiedLbl = lang === 'pt' ? 'Técnico verificado' : lang === 'es' ? 'Técnico verificado' : 'Verified technician';
  const ownEquipLbl = lang === 'pt' ? 'Equipamento próprio' : lang === 'es' ? 'Equipo propio' : 'Own equipment';
  const descForTech = (tech, lang) => {
    const map = {
      1: {
        en: 'Specialized in pump and motor repair. 12 years of field experience. Same-day service available.',
        pt: 'Especializado em reparo de bombas e motores. 12 anos de experiência. Atendimento no mesmo dia.',
        es: 'Especializado en reparación de bombas y motores. 12 años de experiencia. Servicio mismo día.'
      },
      2: {
        en: 'Heater and heat-pump diagnostics. Pentair and Hayward certified.',
        pt: 'Diagnóstico de aquecedores e bombas de calor. Certificado Pentair e Hayward.',
        es: 'Diagnóstico de calentadores y bombas de calor. Certificado Pentair y Hayward.'
      },
      3: {
        en: 'Automation, salt-cell replacement and full equipment installs. Works weekends.',
        pt: 'Automação, troca de células de sal e instalações completas. Trabalha fins de semana.',
        es: 'Automatización, reemplazo de celdas de sal e instalaciones completas. Trabaja fines de semana.'
      },
      4: {
        en: 'Tile, plaster and surface repair for residential and commercial pools. Quote on request.',
        pt: 'Azulejo, reboco e reparo de superfícies para piscinas residenciais e comerciais. Orçamento sob consulta.',
        es: 'Azulejo, yeso y reparación de superficies para piscinas residenciales y comerciales. Cotización a solicitud.'
      }
    };
    return (map[tech.id] || map[1])[lang] || (map[tech.id] || map[1]).en;
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, liveTechs.map(tech => /*#__PURE__*/React.createElement("article", {
    key: tech._id,
    className: "pg-card",
    style: {
      padding: '14px 16px',
      border: '1.5px solid var(--pg-aqua-400,#38bdf8)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: tech.name,
    size: 36
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: 'var(--pg-ink-900)'
    }
  }, tech.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--pg-ink-500)',
      marginTop: 1
    }
  }, tech.specialty, " \xB7 ", tech.loc)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9.5,
      fontWeight: 700,
      padding: '2px 8px',
      borderRadius: 6,
      background: 'var(--pg-aqua-100)',
      color: 'var(--pg-aqua-700)',
      flexShrink: 0,
      letterSpacing: '0.05em'
    }
  }, "NEW")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap',
      marginBottom: 10
    }
  }, tech.rateMode === 'fixed' && tech.rate ? /*#__PURE__*/React.createElement("span", {
    className: "pg-chip pg-chip-aqua",
    style: {
      fontSize: 12
    }
  }, "$", tech.rate, lang === 'pt' ? '/visita' : lang === 'es' ? '/visita' : '/visit') : /*#__PURE__*/React.createElement("span", {
    className: "pg-chip",
    style: {
      fontSize: 12
    }
  }, lang === 'pt' ? 'Negociável' : lang === 'es' ? 'Negociable' : 'Negotiable'), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      fontSize: 11,
      color: 'var(--pg-ink-500)'
    }
  }, Icon.pin(11, 'var(--pg-ink-400)'), " ", tech.loc)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, tech.phone && /*#__PURE__*/React.createElement("a", {
    href: `tel:${tech.phone}`,
    className: "pg-btn pg-btn-ghost",
    style: {
      flex: 1,
      height: 36,
      fontSize: 12.5,
      borderRadius: 999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      textDecoration: 'none',
      color: 'inherit'
    }
  }, "\uD83D\uDCDE ", tech.phone)), user?.uid && user.uid === tech.author_id && user?.role !== 'admin' && /*#__PURE__*/React.createElement("div", {
    onClick: async () => {
      const msg = lang === 'pt' ? 'Remover seu perfil de técnico? Você pode republicar quando quiser.' : lang === 'es' ? '¿Eliminar tu perfil de técnico? Puedes volver a publicar cuando quieras.' : 'Remove your technician profile? You can re-post whenever you want.';
      if (!window.confirm(msg)) return;
      const {
        error
      } = await window.sb.from('techs').delete().eq('id', tech._id);
      if (error) {
        showToast && showToast('❌ ' + error.message);
        return;
      }
      showToast && showToast('✓ ' + (lang === 'pt' ? 'Perfil removido' : lang === 'es' ? 'Perfil eliminado' : 'Profile removed'));
      onDeleteTech && onDeleteTech(tech._id);
    },
    style: {
      marginTop: 8,
      padding: '7px 0',
      borderRadius: 8,
      cursor: 'pointer',
      background: 'rgba(16,185,129,0.08)',
      border: '1px solid rgba(16,185,129,0.28)',
      color: '#10B981',
      fontSize: 11,
      fontWeight: 700,
      textAlign: 'center',
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
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20 6L9 17l-5-5"
  })), lang === 'pt' ? 'Já fui contratado — Remover perfil' : lang === 'es' ? 'Ya fui contratado — Eliminar perfil' : 'Got hired — Remove profile'), user?.role === 'admin' && /*#__PURE__*/React.createElement("div", {
    onClick: async () => {
      if (!window.confirm(lang === 'pt' ? `Excluir técnico "${tech.name}"?` : `Delete technician "${tech.name}"?`)) return;
      const {
        error
      } = await window.sb.from('techs').delete().eq('id', tech._id);
      if (error) {
        showToast && showToast('❌ ' + error.message);
        return;
      }
      showToast && showToast('🗑️ ' + (lang === 'pt' ? 'Técnico excluído' : 'Technician deleted'));
      onDeleteTech && onDeleteTech(tech._id);
    },
    style: {
      marginTop: 4,
      padding: '6px 0',
      borderRadius: 8,
      cursor: 'pointer',
      background: '#FEF2F2',
      border: '1px solid #FCA5A5',
      color: '#EF4444',
      fontSize: 11,
      fontWeight: 700,
      textAlign: 'center',
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
  })), lang === 'pt' ? 'Excluir' : lang === 'es' ? 'Eliminar' : 'Delete'))), TECHS.filter(tech => !hiddenStatic.includes(tech.id)).map(tech => /*#__PURE__*/React.createElement("article", {
    key: tech.id,
    className: "pg-card",
    style: {
      padding: '14px 16px 14px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => openPublicProfile && openPublicProfile({
      name: tech.name,
      rating: tech.rating,
      reviews: tech.jobs,
      jobs: tech.jobs,
      loc: tech.loc
    }),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 8,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: 0,
      fontFamily: 'inherit',
      textAlign: 'left',
      width: '100%'
    },
    className: "pg-press"
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: tech.name,
    size: 28
  }), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontFamily: 'var(--pg-font-display)',
      fontSize: 16,
      fontWeight: 700,
      letterSpacing: '-0.015em',
      flex: 1,
      minWidth: 0
    }
  }, tech.name), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 3,
      fontSize: 12,
      color: 'var(--pg-ink-700)',
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement(Stars, {
    rating: tech.rating,
    size: 11
  }), " ", tech.rating)), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 13,
      lineHeight: 1.45,
      color: 'var(--pg-ink-700)'
    }
  }, descForTech(tech, lang)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      marginTop: 10,
      fontSize: 12.5,
      color: 'var(--pg-ink-500)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5
    }
  }, Icon.pin(13, 'var(--pg-ink-500)'), " ", tech.loc), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5
    }
  }, Tool(13, 'var(--pg-ink-500)'), " ", tr(tech.speciality, lang))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5
    }
  }, Icon.shield(13, 'var(--pg-ink-500)'), " ", verifiedLbl, " \xB7 ", tech.jobs, " ", lang === 'pt' ? 'trabalhos' : lang === 'es' ? 'trabajos' : 'jobs')), /*#__PURE__*/React.createElement("div", {
    className: "pg-divider",
    style: {
      margin: '12px 0'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--pg-font-display)',
      fontSize: 16,
      fontWeight: 700,
      color: tr(tech.rate, lang).toLowerCase().includes('quote') || tr(tech.rate, lang).toLowerCase().includes('orça') || tr(tech.rate, lang).toLowerCase().includes('cotiz') ? 'var(--pg-aqua-700)' : 'var(--pg-blue-500)',
      letterSpacing: '-0.01em'
    }
  }, tr(tech.rate, lang)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setRatingFor(tech),
    className: "pg-btn pg-btn-ghost",
    title: lang === 'pt' ? 'Avaliar técnico' : lang === 'es' ? 'Calificar técnico' : 'Rate technician',
    style: {
      height: 36,
      width: 36,
      padding: 0,
      borderRadius: 999,
      flexShrink: 0
    }
  }, Icon.star(16, 'oklch(0.72 0.17 80)', false)), /*#__PURE__*/React.createElement("button", {
    onClick: () => setContactOpen(contactOpen === tech.id ? null : tech.id),
    className: contactOpen === tech.id ? 'pg-btn pg-btn-ghost' : 'pg-btn pg-btn-primary',
    style: {
      height: 36,
      padding: '0 18px',
      fontSize: 13,
      borderRadius: 999
    }
  }, contactOpen === tech.id ? lang === 'pt' ? 'Fechar' : lang === 'es' ? 'Cerrar' : 'Close' : t.contact))), contactOpen === tech.id && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      padding: '12px 14px',
      borderRadius: 12,
      background: 'var(--pg-blue-50)',
      border: '0.5px solid var(--pg-blue-100)',
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: `tel:${tech.phone}`,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      textDecoration: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      borderRadius: 10,
      flexShrink: 0,
      background: 'var(--pg-blue-500)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#fff",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 2.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      fontWeight: 700,
      letterSpacing: '0.06em',
      color: 'var(--pg-ink-400)'
    }
  }, lang === 'pt' ? 'TELEFONE' : lang === 'es' ? 'TELÉFONO' : 'PHONE'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: 'var(--pg-blue-700)',
      letterSpacing: '-0.01em'
    }
  }, tech.phone))), tech.email ? /*#__PURE__*/React.createElement("a", {
    href: `mailto:${tech.email}`,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      textDecoration: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      borderRadius: 10,
      flexShrink: 0,
      background: 'var(--pg-aqua-100)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--pg-aqua-700)",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "22,6 12,13 2,6"
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      fontWeight: 700,
      letterSpacing: '0.06em',
      color: 'var(--pg-ink-400)'
    }
  }, "EMAIL"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--pg-aqua-700)'
    }
  }, tech.email))) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      borderRadius: 10,
      flexShrink: 0,
      background: 'var(--pg-ink-100)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--pg-ink-400)",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "22,6 12,13 2,6"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: 'var(--pg-ink-400)',
      fontStyle: 'italic'
    }
  }, lang === 'pt' ? 'E-mail não informado' : lang === 'es' ? 'Email no disponible' : 'No email provided'))), user?.role === 'admin' && /*#__PURE__*/React.createElement("div", {
    onClick: () => {
      if (!window.confirm(lang === 'pt' ? `Excluir "${tech.name}"?` : `Delete "${tech.name}"?`)) return;
      setHiddenStatic(prev => [...prev, tech.id]);
      showToast && showToast('🗑️ ' + (lang === 'pt' ? 'Removido (sessão)' : 'Removed (session)'));
    },
    style: {
      marginTop: 8,
      padding: '6px 0',
      borderRadius: 8,
      cursor: 'pointer',
      background: '#FEF2F2',
      border: '1px solid #FCA5A5',
      color: '#EF4444',
      fontSize: 11,
      fontWeight: 700,
      textAlign: 'center',
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
  })), lang === 'pt' ? 'Excluir' : lang === 'es' ? 'Eliminar' : 'Delete')))), /*#__PURE__*/React.createElement(TechReviewSheet, {
    open: !!ratingFor,
    onClose: () => setRatingFor(null),
    tech: ratingFor,
    lang: lang
  }));
}

// ── Accepted vacation application card with address reveal ────
function AcceptedVacCard({
  v,
  lang,
  onChat,
  onSchedule,
  openPublicProfile
}) {
  const [showAddrs, setShowAddrs] = React.useState(false);
  const [mapDayWd, setMapDayWd] = React.useState(null); // which weekday's map is open

  const wdFull = lang === 'pt' ? ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'] : lang === 'es' ? ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'] : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const earnings = (v.selectedDays || v.days).length * (v.poolsPerDay || 0) * (v.pricePerPool || 0);
  const hasAddresses = v.addresses && Object.keys(v.addresses).length > 0;

  // Involved weekdays for the selected days
  const involvedWds = React.useMemo(() => {
    if (!v.yearMonth) return [];
    const set = new Set();
    (v.selectedDays || v.days).forEach(d => set.add(new Date(v.yearMonth.year, v.yearMonth.month, d).getDay()));
    return [...set].sort();
  }, [v]);
  return /*#__PURE__*/React.createElement("article", {
    className: "pg-card",
    style: {
      padding: 0,
      overflow: 'hidden',
      borderLeft: '3px solid var(--pg-aqua-500)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--pg-aqua-100)',
      padding: '7px 14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10.5,
      fontWeight: 800,
      letterSpacing: '0.08em',
      color: 'var(--pg-aqua-700)'
    }
  }, lang === 'pt' ? 'ACEITO ✓' : lang === 'es' ? 'ACEPTADO ✓' : 'ACCEPTED ✓')), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 14px 14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => openPublicProfile && openPublicProfile({
      name: v.owner,
      rating: v.ownerRating || 4.8,
      reviews: v.ownerJobs || 30,
      jobs: v.ownerJobs || 30,
      loc: v.region
    }),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      flex: 1,
      minWidth: 0,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: 0,
      fontFamily: 'inherit',
      textAlign: 'left'
    },
    className: "pg-press"
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: v.owner,
    size: 34
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700
    }
  }, v.owner), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--pg-ink-500)'
    }
  }, v.region, " \xB7 ", tr(v.month, lang)))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--pg-font-display)',
      fontSize: 17,
      fontWeight: 700,
      color: 'var(--pg-blue-500)',
      letterSpacing: '-0.02em'
    }
  }, "$", earnings.toLocaleString()), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: 'var(--pg-ink-400)'
    }
  }, (v.selectedDays || v.days).length, " ", lang === 'pt' ? 'dias' : lang === 'es' ? 'días' : 'days', " \xB7 $", v.pricePerPool, "/pool"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(DayChips, {
    days: v.days,
    selectedDays: v.selectedDays || v.days
  })), v.poolsByWeekday && involvedWds.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 5,
      flexWrap: 'wrap',
      marginBottom: 10
    }
  }, involvedWds.map(wd => {
    const cnt = v.poolsByWeekday[wd] ?? v.poolsPerDay ?? 0;
    return /*#__PURE__*/React.createElement("div", {
      key: wd,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 8px',
        borderRadius: 6,
        background: 'var(--pg-blue-50)',
        border: '0.5px solid var(--pg-blue-100)',
        fontSize: 11,
        fontWeight: 600,
        color: 'var(--pg-blue-700)'
      }
    }, wdFull[wd].slice(0, 3), " ", /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 800
      }
    }, cnt), " \uD83C\uDFCA");
  })), hasAddresses && /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '0.5px solid var(--pg-ink-100)',
      paddingTop: 10,
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowAddrs(v => !v),
    style: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: 0,
      fontFamily: 'inherit'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      fontWeight: 700,
      color: 'var(--pg-blue-700)',
      display: 'flex',
      alignItems: 'center',
      gap: 5
    }
  }, "\uD83D\uDCCD ", lang === 'pt' ? 'Endereços das piscinas' : lang === 'es' ? 'Direcciones de piscinas' : 'Pool addresses'), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--pg-blue-500)',
      fontWeight: 600
    }
  }, showAddrs ? lang === 'pt' ? 'Fechar' : lang === 'es' ? 'Cerrar' : 'Close' : lang === 'pt' ? 'Ver' : lang === 'es' ? 'Ver' : 'View', ' ', Icon.chev(11, 'var(--pg-blue-500)'))), showAddrs && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--pg-blue-700)',
      padding: '5px 9px',
      borderRadius: 7,
      background: 'var(--pg-blue-50)',
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, Icon.shield(12, 'var(--pg-blue-700)'), lang === 'pt' ? 'Endereços confirmados — visíveis apenas para você' : lang === 'es' ? 'Direcciones confirmadas — visibles solo para ti' : 'Confirmed addresses — visible to you only'), involvedWds.map(wd => {
    const addrsForWd = v.addresses[wd] || [];
    const cnt = v.poolsByWeekday?.[wd] ?? v.poolsPerDay ?? addrsForWd.length;
    const isMapOpen = mapDayWd === wd;
    return /*#__PURE__*/React.createElement("div", {
      key: wd,
      style: {
        borderRadius: 10,
        overflow: 'hidden',
        border: '0.5px solid var(--pg-ink-200)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 11px',
        background: 'var(--pg-ink-100)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 700,
        color: 'var(--pg-ink-700)'
      }
    }, wdFull[wd], " \u2014 ", /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--pg-blue-600)'
      }
    }, cnt, " \uD83C\uDFCA")), /*#__PURE__*/React.createElement("button", {
      onClick: () => setMapDayWd(isMapOpen ? null : wd),
      style: {
        border: 'none',
        background: isMapOpen ? 'var(--pg-blue-500)' : 'var(--pg-blue-100)',
        color: isMapOpen ? '#fff' : 'var(--pg-blue-700)',
        padding: '3px 9px',
        borderRadius: 6,
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 11,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: 4
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "12",
      height: "12",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M3 11l19-9-9 19-2-8-8-2z"
    })), isMapOpen ? lang === 'pt' ? 'Fechar' : lang === 'es' ? 'Cerrar' : 'Close' : lang === 'pt' ? 'Mapa' : lang === 'es' ? 'Mapa' : 'Map')), isMapOpen && /*#__PURE__*/React.createElement(PoolRouteMap, {
      pools: addrsForWd,
      style: {
        borderRadius: 0
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '6px 11px 8px'
      }
    }, addrsForWd.map((p, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '5px 0',
        borderBottom: i < addrsForWd.length - 1 ? '0.5px solid var(--pg-ink-100)' : 'none'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: 6,
        flexShrink: 0,
        background: 'var(--pg-blue-500)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 10,
        fontWeight: 700
      }
    }, i + 1), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: 'var(--pg-ink-700)'
      }
    }, p.addr)))));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginTop: 12,
      paddingTop: 10,
      borderTop: '0.5px solid var(--pg-ink-100)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => onChat(v.author_id ? {
      id: v.author_id,
      name: v.owner || v.author || '?',
      listingId: v._id || null,
      listingContext: {
        name: v.name || v.title || (lang === 'pt' ? 'Cobertura' : 'Coverage'),
        type: 'vac'
      }
    } : v.owner || v.author || '?'),
    className: "pg-btn pg-btn-ghost",
    style: {
      height: 34,
      padding: '0 14px',
      fontSize: 12.5,
      borderRadius: 999
    }
  }, Icon.msg(13, 'var(--pg-blue-700)')), /*#__PURE__*/React.createElement("button", {
    onClick: () => onSchedule && onSchedule(v),
    className: "pg-btn pg-btn-aqua",
    style: {
      flex: 1,
      height: 34,
      fontSize: 12.5,
      borderRadius: 999
    }
  }, lang === 'pt' ? 'Ver agenda' : lang === 'es' ? 'Ver agenda' : 'View schedule'))));
}

// ── Leaflet pool route map ─────────────────────────────────────
function PoolRouteMap({
  pools = [],
  style = {},
  doneIndices = null
}) {
  const mapRef = React.useRef(null);
  const lMapRef = React.useRef(null);

  // Serialize done state so the effect re-runs when completion changes
  const doneKey = doneIndices ? [...doneIndices].sort().join(',') : '';
  React.useEffect(() => {
    if (!mapRef.current || pools.length === 0) return;
    if (lMapRef.current) {
      lMapRef.current.remove();
      lMapRef.current = null;
    }
    const map = L.map(mapRef.current, {
      zoomControl: false,
      scrollWheelZoom: false
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '',
      maxZoom: 18
    }).addTo(map);
    pools.forEach((p, i) => {
      const done = doneIndices && doneIndices.has(i);
      const bg = done ? '#34a853' : 'oklch(0.58 0.16 235)';
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:26px;height:26px;border-radius:50%;background:${bg};color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;font-family:sans-serif;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.28)">${i + 1}</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });
      L.marker([p.lat, p.lng], {
        icon
      }).addTo(map).bindPopup(`<b>Pool ${i + 1}</b><br>${p.addr}`);
    });
    if (pools.length > 1) {
      L.polyline(pools.map(p => [p.lat, p.lng]), {
        color: 'oklch(0.58 0.16 235)',
        weight: 2.5,
        dashArray: '6 4',
        opacity: 0.8
      }).addTo(map);
    }
    const bounds = L.latLngBounds(pools.map(p => [p.lat, p.lng]));
    map.fitBounds(bounds, {
      padding: [20, 20]
    });
    lMapRef.current = map;
    setTimeout(() => map.invalidateSize(), 150);
    return () => {
      map.remove();
      lMapRef.current = null;
    };
  }, [pools, doneKey]); // re-render markers when completion changes

  return /*#__PURE__*/React.createElement("div", {
    ref: mapRef,
    style: {
      width: '100%',
      height: 180,
      ...style
    }
  });
}

// ── Vacation panel ────────────────────────────────────────────
function VacationPanel({
  t,
  lang,
  vacTab,
  setVacTab,
  onChat,
  onCreate,
  onViewApplicants,
  openDayPicker,
  openSchedule,
  openPublicProfile,
  liveVacations = [],
  user,
  showToast,
  onDeleteVac
}) {
  const [hiddenStatic, setHiddenStatic] = React.useState([]);
  const boost = {
    title: lang === 'pt' ? 'Cobrir férias impulsiona seu perfil' : lang === 'es' ? 'Cubrir vacaciones impulsa tu perfil' : 'Covering vacations boosts your profile',
    body: lang === 'pt' ? 'Pool guys que cobrem férias ganham impulsionamento no perfil e melhores avaliações — aparecendo no topo das buscas.' : lang === 'es' ? 'Los pool guys que cubren vacaciones obtienen impulso en el perfil y mejores reseñas — apareciendo en el top de las búsquedas.' : 'Pool guys who cover vacations earn a profile boost and better reviews — showing up at the top of searches.',
    chip: lang === 'pt' ? '+ Visibilidade · + Avaliações' : lang === 'es' ? '+ Visibilidad · + Reseñas' : '+ Visibility · + Reviews'
  };

  // Labels
  const availSectionLabel = lang === 'pt' ? 'FÉRIAS PARA COBRIR' : lang === 'es' ? 'VACACIONES DISPONIBLES' : 'AVAILABLE TO COVER';
  const activityLabel = lang === 'pt' ? 'MINHA ATIVIDADE' : lang === 'es' ? 'MI ACTIVIDAD' : 'MY ACTIVITY';
  const appTabLabel = lang === 'pt' ? 'Aplicações' : lang === 'es' ? 'Aplicaciones' : 'Applications';
  const postsTabLabel = lang === 'pt' ? 'Minhas Postagens' : lang === 'es' ? 'Mis Publicaciones' : 'My Posts';
  const nonePostedLabel = lang === 'pt' ? 'Nenhuma postagem ainda' : lang === 'es' ? 'Sin publicaciones aún' : 'No posts yet';
  const noneAppliedLabel = lang === 'pt' ? 'Sem candidaturas pendentes ou recusadas.' : lang === 'es' ? 'Sin solicitudes pendientes o rechazadas.' : 'No pending or rejected applications.';

  // Only show pending/rejected in this tab — accepted go to My Active Jobs
  const vacAppsFiltered = VACATIONS_APPLIED.filter(v => v.status !== 'accepted');
  const pickDaysLabel = lang === 'pt' ? 'Escolher dias' : lang === 'es' ? 'Elegir días' : 'Pick days';
  const maxEarnLabel = lang === 'pt' ? 'GANHO MÁX.' : lang === 'es' ? 'GANANCIA MÁX.' : 'MAX EARNINGS';
  const daysFreeLabel = lang === 'pt' ? 'dias livres' : lang === 'es' ? 'días libres' : 'days free';
  const bookedLabel = lang === 'pt' ? 'reservados' : lang === 'es' ? 'reservados' : 'booked';
  const selectedDaysLabel = lang === 'pt' ? 'Dias escolhidos' : lang === 'es' ? 'Días elegidos' : 'Selected days';
  const pendingOwnerLabel = name => lang === 'pt' ? `Aguardando ${name}` : lang === 'es' ? `Esperando a ${name}` : `Waiting for ${name}`;
  const withdrawLabel = lang === 'pt' ? 'Cancelar' : lang === 'es' ? 'Cancelar' : 'Withdraw';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
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
      gap: 7
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 3,
      height: 16,
      borderRadius: 2,
      background: 'var(--pg-aqua-500)',
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      fontWeight: 700,
      letterSpacing: '0.06em',
      color: 'var(--pg-ink-700)'
    }
  }, availSectionLabel)), VACATION_LISTINGS.length > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      padding: '2px 9px',
      borderRadius: 999,
      background: 'var(--pg-aqua-100)',
      color: 'var(--pg-aqua-700)'
    }
  }, VACATION_LISTINGS.length, " ", lang === 'pt' ? 'disponíveis' : lang === 'es' ? 'disponibles' : 'available')), /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 12,
      padding: '10px 13px',
      marginBottom: 14,
      background: 'linear-gradient(120deg, var(--pg-blue-900) 0%, oklch(0.34 0.13 215) 100%)',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      color: '#fff',
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      right: -16,
      top: -16,
      width: 70,
      height: 70,
      borderRadius: '50%',
      background: 'oklch(0.85 0.15 90 / 0.13)',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 28,
      height: 28,
      borderRadius: 8,
      flexShrink: 0,
      background: 'oklch(0.85 0.15 90)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "var(--pg-blue-900)"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 2l2.39 7.36H22l-6.18 4.49L18.18 22 12 17.27 5.82 22l2.36-8.15L2 9.36h7.61z"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      lineHeight: 1.3
    }
  }, boost.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      opacity: 0.75,
      marginTop: 1
    }
  }, boost.chip))), liveVacations.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      marginBottom: 12
    }
  }, liveVacations.map(vac => /*#__PURE__*/React.createElement("article", {
    key: vac._id,
    className: "pg-card",
    style: {
      padding: '14px 16px',
      border: '1.5px solid var(--pg-aqua-400,#38bdf8)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: 'var(--pg-ink-900)'
    }
  }, lang === 'pt' ? 'Cobertura de Férias' : lang === 'es' ? 'Cobertura de Vacaciones' : 'Vacation Coverage'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--pg-ink-500)',
      marginTop: 2
    }
  }, "\uD83D\uDC64 ", vac.author)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9.5,
      fontWeight: 700,
      padding: '2px 8px',
      borderRadius: 6,
      background: 'var(--pg-aqua-100)',
      color: 'var(--pg-aqua-700)',
      flexShrink: 0,
      marginLeft: 8,
      letterSpacing: '0.05em'
    }
  }, "NEW")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap',
      marginBottom: 6
    }
  }, vac.price && /*#__PURE__*/React.createElement("span", {
    className: "pg-chip pg-chip-aqua",
    style: {
      fontSize: 11
    }
  }, "$", vac.price, vac.priceMode === 'pool' ? '/pool' : '/day'), vac.priceMode === 'neg' && /*#__PURE__*/React.createElement("span", {
    className: "pg-chip",
    style: {
      fontSize: 11
    }
  }, lang === 'pt' ? 'Negociável' : 'Negotiable')), user?.uid && user.uid === vac.author_id && user?.role !== 'admin' && /*#__PURE__*/React.createElement("div", {
    onClick: async () => {
      const msg = lang === 'pt' ? 'Encerrar sua cobertura de férias? Isso indica que você encontrou alguém.' : lang === 'es' ? '¿Cerrar tu cobertura de vacaciones? Indica que ya encontraste a alguien.' : 'Close your vacation coverage post? This means you found someone.';
      if (!window.confirm(msg)) return;
      const {
        error
      } = await window.sb.from('vacations').delete().eq('id', vac._id);
      if (error) {
        showToast && showToast('❌ ' + error.message);
        return;
      }
      showToast && showToast('✓ ' + (lang === 'pt' ? 'Cobertura encerrada!' : lang === 'es' ? '¡Cobertura cerrada!' : 'Coverage closed!'));
      onDeleteVac && onDeleteVac(vac._id);
    },
    style: {
      marginTop: 8,
      padding: '7px 0',
      borderRadius: 8,
      cursor: 'pointer',
      background: 'rgba(16,185,129,0.08)',
      border: '1px solid rgba(16,185,129,0.28)',
      color: '#10B981',
      fontSize: 11,
      fontWeight: 700,
      textAlign: 'center',
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
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20 6L9 17l-5-5"
  })), lang === 'pt' ? 'Já encontrei alguém — Encerrar' : lang === 'es' ? 'Ya encontré a alguien — Cerrar' : 'Found someone — Close post'), user?.role === 'admin' && /*#__PURE__*/React.createElement("div", {
    onClick: async () => {
      if (!window.confirm(lang === 'pt' ? 'Excluir este registro de férias?' : 'Delete this vacation post?')) return;
      const {
        error
      } = await window.sb.from('vacations').delete().eq('id', vac._id);
      if (error) {
        showToast && showToast('❌ ' + error.message);
        return;
      }
      showToast && showToast('🗑️ ' + (lang === 'pt' ? 'Férias excluídas' : 'Vacation deleted'));
      onDeleteVac && onDeleteVac(vac._id);
    },
    style: {
      marginTop: 4,
      padding: '6px 0',
      borderRadius: 8,
      cursor: 'pointer',
      background: '#FEF2F2',
      border: '1px solid #FCA5A5',
      color: '#EF4444',
      fontSize: 11,
      fontWeight: 700,
      textAlign: 'center',
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
  })), lang === 'pt' ? 'Excluir' : lang === 'es' ? 'Eliminar' : 'Delete')))), VACATION_LISTINGS.filter(v => !hiddenStatic.includes(v.id)).length === 0 && liveVacations.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '28px 16px',
      color: 'var(--pg-ink-400)',
      fontSize: 13
    }
  }, lang === 'pt' ? 'Nenhuma vaga disponível agora' : lang === 'es' ? 'Sin vacantes disponibles ahora' : 'No vacations available right now') : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, VACATION_LISTINGS.filter(v => !hiddenStatic.includes(v.id)).map(v => {
    const availDays = v.days.filter(d => !v.bookedDays.includes(d));
    const maxEarnings = availDays.length * v.poolsPerDay * v.pricePerPool;
    return /*#__PURE__*/React.createElement("article", {
      key: v.id,
      className: "pg-card",
      style: {
        padding: 0,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'linear-gradient(120deg, oklch(0.26 0.10 232) 0%, oklch(0.33 0.13 215) 100%)',
        padding: '12px 14px 11px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end'
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.09em',
        color: 'rgba(255,255,255,0.52)',
        marginBottom: 3,
        textTransform: 'uppercase'
      }
    }, v.region), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--pg-font-display)',
        fontSize: 18,
        fontWeight: 700,
        color: '#fff',
        letterSpacing: '-0.02em',
        lineHeight: 1.1
      }
    }, tr(v.month, lang))), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'right'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--pg-font-display)',
        fontSize: 26,
        fontWeight: 800,
        color: 'oklch(0.88 0.16 90)',
        letterSpacing: '-0.03em',
        lineHeight: 1
      }
    }, "$", v.pricePerPool, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11.5,
        fontWeight: 500,
        color: 'rgba(255,255,255,0.45)'
      }
    }, "/pool")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.52)',
        marginTop: 1
      }
    }, v.poolsPerDay, " ", t.poolsPerDay))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '11px 14px 14px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => openPublicProfile && openPublicProfile({
        name: v.owner,
        rating: v.ownerRating,
        reviews: v.ownerJobs,
        jobs: v.ownerJobs,
        loc: v.region
      }),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flex: 1,
        minWidth: 0,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        fontFamily: 'inherit',
        textAlign: 'left'
      },
      className: "pg-press"
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: v.owner,
      size: 30
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 600
      }
    }, v.owner), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: 'var(--pg-ink-400)',
        marginLeft: 5
      }
    }, "\u2605 ", v.ownerRating, " \xB7 ", v.ownerJobs, " jobs"))), availDays.length > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        padding: '2px 8px',
        borderRadius: 999,
        background: 'var(--pg-aqua-100)',
        color: 'var(--pg-aqua-700)',
        flexShrink: 0
      }
    }, availDays.length, " ", daysFreeLabel), v.bookedDays.length > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 600,
        padding: '2px 8px',
        borderRadius: 999,
        background: 'var(--pg-ink-100)',
        color: 'var(--pg-ink-500)',
        flexShrink: 0
      }
    }, v.bookedDays.length, " ", bookedLabel)), /*#__PURE__*/React.createElement(DayChips, {
      days: v.days,
      bookedDays: v.bookedDays,
      yearMonth: v.yearMonth,
      lang: lang
    }), (v.poolsByWeekday || v.poolsPerDay) && (() => {
      const wdShortNames = lang === 'pt' ? ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] : lang === 'es' ? ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const availDays = v.days.filter(d => !(v.bookedDays || []).includes(d));
      return /*#__PURE__*/React.createElement("div", {
        style: {
          marginTop: 8,
          padding: '7px 10px',
          borderRadius: 9,
          background: 'var(--pg-blue-50)',
          border: '0.5px solid var(--pg-blue-100)'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 9.5,
          fontWeight: 700,
          letterSpacing: '0.07em',
          color: 'var(--pg-blue-700)',
          marginBottom: 5,
          textTransform: 'uppercase'
        }
      }, lang === 'pt' ? 'Piscinas por dia' : lang === 'es' ? 'Piscinas por día' : 'Pools per day'), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          gap: 5,
          flexWrap: 'wrap'
        }
      }, availDays.map(d => {
        const wd = v.yearMonth ? new Date(v.yearMonth.year, v.yearMonth.month, d).getDay() : null;
        const count = wd !== null && v.poolsByWeekday?.[wd] !== undefined ? v.poolsByWeekday[wd] : v.poolsPerDay || '?';
        return /*#__PURE__*/React.createElement("div", {
          key: d,
          style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '5px 9px',
            borderRadius: 7,
            background: 'var(--pg-white)',
            border: '0.5px solid var(--pg-blue-200)',
            minWidth: 36,
            gap: 2
          }
        }, wd !== null && /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 9,
            fontWeight: 700,
            color: 'var(--pg-blue-600)',
            letterSpacing: '0.04em',
            lineHeight: 1
          }
        }, wdShortNames[wd].toUpperCase()), /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 13,
            fontWeight: 800,
            color: 'var(--pg-ink-900)',
            fontFamily: 'var(--pg-font-display)',
            lineHeight: 1.1
          }
        }, count), /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 9,
            color: 'var(--pg-ink-400)'
          }
        }, "\uD83C\uDFCA"));
      })));
    })(), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'var(--pg-ink-400)',
        marginTop: 7,
        lineHeight: 1.45
      }
    }, tr(v.note, lang)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 12,
        paddingTop: 10,
        borderTop: '0.5px solid var(--pg-ink-100)'
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.06em',
        color: 'var(--pg-ink-400)'
      }
    }, maxEarnLabel), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--pg-font-display)',
        fontSize: 20,
        fontWeight: 800,
        color: 'var(--pg-blue-500)',
        letterSpacing: '-0.02em',
        lineHeight: 1.1
      }
    }, "$", maxEarnings.toLocaleString())), /*#__PURE__*/React.createElement("button", {
      onClick: () => openDayPicker && openDayPicker(v),
      className: "pg-btn pg-btn-primary",
      style: {
        height: 38,
        padding: '0 20px',
        fontSize: 13.5,
        borderRadius: 999,
        gap: 5
      }
    }, pickDaysLabel, " \u2192"))), user?.role === 'admin' && /*#__PURE__*/React.createElement("div", {
      onClick: () => {
        if (!window.confirm(lang === 'pt' ? `Excluir férias de "${v.owner}"?` : `Delete "${v.owner}"'s vacation?`)) return;
        setHiddenStatic(prev => [...prev, v.id]);
        showToast && showToast('🗑️ ' + (lang === 'pt' ? 'Removido (sessão)' : 'Removed (session)'));
      },
      style: {
        margin: '8px 14px 14px',
        padding: '6px 0',
        borderRadius: 8,
        cursor: 'pointer',
        background: '#FEF2F2',
        border: '1px solid #FCA5A5',
        color: '#EF4444',
        fontSize: 11,
        fontWeight: 700,
        textAlign: 'center',
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
  }))));
}

// ── New Vacation creation sheet ───────────────────────────────
function PostVacationSheet({
  onClose,
  lang = 'en',
  onSubmit
}) {
  const t = STRINGS[lang];
  const allMonths = lang === 'pt' ? ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'] : lang === 'es' ? ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'] : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayShort = lang === 'pt' ? ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] : lang === 'es' ? ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayFull = lang === 'pt' ? ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'] : lang === 'es' ? ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'] : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Only show current month and future months
  const currentMonthIdx = new Date().getMonth();
  const months = allMonths.map((m, i) => ({
    name: m,
    idx: i
  })).filter(({
    idx
  }) => idx >= currentMonthIdx);
  const [monthIdx, setMonthIdx] = React.useState(currentMonthIdx);
  const [year] = React.useState(new Date().getFullYear());
  const [selectedDays, setSelectedDays] = React.useState(new Set());
  const [weekdayRegions, setWeekdayRegions] = React.useState({}); // {wd: string[]}
  const [poolsPerWeekday, setPoolsPerWeekday] = React.useState({}); // {wd: number}
  const [wdAddresses, setWdAddresses] = React.useState({}); // {wd: string[]}
  const [price, setPrice] = React.useState('55');
  const [priceMode, setPriceMode] = React.useState('fixed');

  // Calendar — get days in selected month
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const firstDow = new Date(year, monthIdx, 1).getDay(); // 0=Sun

  const toggleDay = d => {
    setSelectedDays(prev => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d);else next.add(d);
      return next;
    });
  };

  // Compute which weekdays are represented in selectedDays
  const involvedWeekdays = React.useMemo(() => {
    const set = new Set();
    selectedDays.forEach(d => set.add(new Date(year, monthIdx, d).getDay()));
    return [...set].sort();
  }, [selectedDays, monthIdx, year]);

  // Per-weekday pools helpers
  const getPoolsForWd = wd => poolsPerWeekday[wd] ?? 10;
  const setPoolsForWd = (wd, n) => {
    const newN = Math.max(1, Math.min(60, n));
    setPoolsPerWeekday(p => ({
      ...p,
      [wd]: newN
    }));
    // Keep that weekday's address array in sync with its pool count
    setWdAddresses(a => {
      const arr = [...(a[wd] || [])];
      while (arr.length < newN) arr.push('');
      return {
        ...a,
        [wd]: arr.slice(0, newN)
      };
    });
  };

  // When new weekdays appear (days selected), initialise their address arrays
  React.useEffect(() => {
    setWdAddresses(a => {
      const next = {
        ...a
      };
      involvedWeekdays.forEach(wd => {
        const count = poolsPerWeekday[wd] ?? 10;
        if (!next[wd] || next[wd].length !== count) {
          const arr = [...(next[wd] || [])];
          while (arr.length < count) arr.push('');
          next[wd] = arr.slice(0, count);
        }
      });
      return next;
    });
  }, [involvedWeekdays]); // eslint-disable-line react-hooks/exhaustive-deps

  // Total potential earnings across all selected days
  const totalPotential = React.useMemo(() => {
    if (!parseInt(price || 0)) return 0;
    return [...selectedDays].reduce((sum, d) => {
      const wd = new Date(year, monthIdx, d).getDay();
      return sum + (poolsPerWeekday[wd] ?? 10) * parseInt(price);
    }, 0);
  }, [selectedDays, poolsPerWeekday, price, year, monthIdx]);
  const toggleCityForWeekday = (wd, city) => {
    setWeekdayRegions(r => {
      const cur = r[wd] || [];
      return {
        ...r,
        [wd]: cur.includes(city) ? cur.filter(c => c !== city) : [...cur, city]
      };
    });
  };

  // Flatten city list
  const allCities = React.useMemo(() => {
    const out = [];
    Object.entries(FL_COUNTIES).forEach(([county, cities]) => cities.forEach(city => out.push({
      city,
      county
    })));
    return out;
  }, []);
  const headLbl = lang === 'pt' ? 'Publicar disponibilidade' : lang === 'es' ? 'Publicar disponibilidad' : 'Post availability';
  const monthLbl = lang === 'pt' ? 'Mês' : lang === 'es' ? 'Mes' : 'Month';
  const daysLbl = lang === 'pt' ? 'Dias em que estarei fora' : lang === 'es' ? 'Días que estaré fuera' : 'Days I will be away';
  const regsLbl = lang === 'pt' ? 'Localização, piscinas e endereços por dia' : lang === 'es' ? 'Ubicación, piscinas y direcciones por día' : 'Location, pools & addresses by weekday';
  const priceLbl = lang === 'pt' ? 'Preço por piscina' : lang === 'es' ? 'Precio por piscina' : 'Price per pool';
  const submitLbl = lang === 'pt' ? 'Publicar férias' : lang === 'es' ? 'Publicar vacaciones' : 'Post vacation';
  const isValid = selectedDays.size > 0 && involvedWeekdays.every(wd => (weekdayRegions[wd]?.length || 0) > 0);

  // Desktop-friendly calendar: fixed 40px cells regardless of container width
  const DAY_SIZE = 40;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(135deg, #011B5A 0%, #023EBA 60%, #0077B6 100%)',
      padding: '16px 20px 18px',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 2
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      border: '1px solid rgba(255,255,255,0.25)',
      background: 'rgba(255,255,255,0.12)',
      color: '#fff',
      fontSize: 13,
      fontWeight: 600,
      cursor: 'pointer',
      padding: '6px 14px',
      borderRadius: 999,
      fontFamily: 'inherit'
    }
  }, t.cancel), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontFamily: 'var(--pg-font-display)',
      fontSize: 17,
      fontWeight: 700,
      letterSpacing: '-0.01em',
      color: '#fff'
    }
  }, headLbl), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 80
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "pg-scroll-x",
    style: {
      display: 'flex',
      gap: 6,
      marginTop: 14,
      marginLeft: -20,
      marginRight: -20,
      padding: '2px 20px'
    }
  }, months.map(({
    name,
    idx
  }) => /*#__PURE__*/React.createElement("button", {
    key: idx,
    onClick: () => {
      setMonthIdx(idx);
      setSelectedDays(new Set());
      setWeekdayRegions({});
    },
    style: {
      padding: '6px 14px',
      borderRadius: 999,
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'inherit',
      fontSize: 12.5,
      fontWeight: 700,
      whiteSpace: 'nowrap',
      background: monthIdx === idx ? '#fff' : 'rgba(255,255,255,0.14)',
      color: monthIdx === idx ? 'var(--pg-blue-700)' : 'rgba(255,255,255,0.88)',
      boxShadow: monthIdx === idx ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
      transition: 'all .12s'
    }
  }, name, " ", year)))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '20px 20px 100px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 24,
      alignItems: 'flex-start',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 auto',
      width: DAY_SIZE * 7 + 6 * 4 + 24,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.07em',
      color: 'var(--pg-ink-500)',
      textTransform: 'uppercase'
    }
  }, daysLbl), selectedDays.size > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      padding: '3px 10px',
      borderRadius: 999,
      background: 'var(--pg-blue-500)',
      color: '#fff'
    }
  }, selectedDays.size, " ", t.days)), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--pg-white)',
      borderRadius: 16,
      border: '1px solid var(--pg-ink-100)',
      padding: '14px 12px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: `repeat(7, ${DAY_SIZE}px)`,
      gap: 4,
      marginBottom: 8
    }
  }, dayShort.map(d => /*#__PURE__*/React.createElement("div", {
    key: d,
    style: {
      width: DAY_SIZE,
      textAlign: 'center',
      fontSize: 10.5,
      color: 'var(--pg-ink-400)',
      fontWeight: 700,
      letterSpacing: '0.04em',
      textTransform: 'uppercase'
    }
  }, d))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: `repeat(7, ${DAY_SIZE}px)`,
      gap: 4
    }
  }, Array.from({
    length: firstDow
  }).map((_, i) => /*#__PURE__*/React.createElement("div", {
    key: `s-${i}`,
    style: {
      width: DAY_SIZE,
      height: DAY_SIZE
    }
  })), Array.from({
    length: daysInMonth
  }, (_, i) => i + 1).map(d => {
    const on = selectedDays.has(d);
    const today = new Date();
    const isToday = today.getDate() === d && today.getMonth() === monthIdx && today.getFullYear() === year;
    return /*#__PURE__*/React.createElement("button", {
      key: d,
      onClick: () => toggleDay(d),
      style: {
        width: DAY_SIZE,
        height: DAY_SIZE,
        borderRadius: 10,
        fontSize: 13,
        fontWeight: on ? 700 : 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: on ? 'var(--pg-blue-500)' : isToday ? 'var(--pg-blue-50)' : 'transparent',
        color: on ? '#fff' : isToday ? 'var(--pg-blue-600)' : 'var(--pg-ink-800)',
        border: isToday && !on ? '1.5px solid var(--pg-blue-200)' : 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
        boxShadow: on ? '0 2px 6px rgba(0,119,182,0.35)' : 'none',
        transition: 'all .12s ease'
      }
    }, d);
  }))), selectedDays.size === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      padding: '8px 12px',
      borderRadius: 10,
      background: 'var(--pg-ink-50, #F7F9FB)',
      fontSize: 12,
      color: 'var(--pg-ink-500)',
      textAlign: 'center'
    }
  }, "\uD83D\uDC46 ", lang === 'pt' ? 'Toque nos dias em que estará fora' : lang === 'es' ? 'Toca los días que estarás fuera' : 'Tap the days you\'ll be away')), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '1 1 260px',
      minWidth: 240,
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.07em',
      color: 'var(--pg-ink-500)',
      textTransform: 'uppercase',
      marginBottom: 10
    }
  }, priceLbl), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      marginBottom: 12
    }
  }, [{
    id: 'fixed',
    label: t.fixedPrice
  }, {
    id: 'neg',
    label: t.priceNeg
  }].map(opt => {
    const on = priceMode === opt.id;
    return /*#__PURE__*/React.createElement("button", {
      key: opt.id,
      onClick: () => setPriceMode(opt.id),
      style: {
        flex: 1,
        padding: '9px 0',
        border: 'none',
        borderRadius: 10,
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 13,
        fontWeight: 700,
        background: on ? 'var(--pg-blue-500)' : 'var(--pg-ink-100)',
        color: on ? '#fff' : 'var(--pg-ink-600)',
        transition: 'all .12s',
        boxShadow: on ? '0 2px 8px rgba(0,119,182,0.30)' : 'none'
      }
    }, opt.label);
  })), priceMode === 'fixed' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      background: 'var(--pg-white)',
      borderRadius: 14,
      border: '1.5px solid var(--pg-blue-200)',
      padding: '0 16px',
      height: 64,
      boxShadow: '0 2px 8px rgba(0,119,182,0.10)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 28,
      fontWeight: 800,
      color: 'var(--pg-blue-500)',
      fontFamily: 'var(--pg-font-display)',
      marginRight: 4
    }
  }, "$"), /*#__PURE__*/React.createElement("input", {
    className: "pg-field",
    value: price,
    onChange: e => setPrice(e.target.value),
    style: {
      flex: 1,
      border: 'none',
      padding: 0,
      height: 40,
      fontSize: 32,
      fontWeight: 800,
      color: 'var(--pg-blue-500)',
      letterSpacing: '-0.03em',
      fontFamily: 'var(--pg-font-display)',
      background: 'transparent',
      outline: 'none',
      boxShadow: 'none'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      color: 'var(--pg-ink-400)',
      fontWeight: 600,
      whiteSpace: 'nowrap'
    }
  }, t.perPool)), priceMode === 'neg' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '14px 16px',
      borderRadius: 14,
      background: 'var(--pg-ink-50, #F7F9FB)',
      border: '1px solid var(--pg-ink-200)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 22
    }
  }, "\uD83E\uDD1D"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      fontWeight: 700,
      color: 'var(--pg-ink-800)'
    }
  }, lang === 'pt' ? 'Preço a combinar' : lang === 'es' ? 'Precio a convenir' : 'Price on request'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: 'var(--pg-ink-400)',
      marginTop: 2
    }
  }, lang === 'pt' ? 'Defina o valor ao combinar com o solicitante' : lang === 'es' ? 'Define el precio al hablar con el solicitante' : 'Set the price when talking to the requester')))), selectedDays.size > 0 && priceMode === 'fixed' && totalPotential > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(135deg, var(--pg-blue-50), oklch(0.97 0.04 178))',
      border: '1px solid var(--pg-blue-100)',
      borderRadius: 14,
      padding: '14px 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: 'var(--pg-ink-500)',
      letterSpacing: '0.06em',
      marginBottom: 6,
      textTransform: 'uppercase'
    }
  }, lang === 'pt' ? 'Potencial de ganho' : lang === 'es' ? 'Ganancia potencial' : 'Earning potential'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--pg-font-display)',
      fontSize: 32,
      fontWeight: 800,
      color: 'var(--pg-blue-500)',
      letterSpacing: '-0.03em',
      lineHeight: 1
    }
  }, "$", totalPotential.toLocaleString()), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--pg-ink-500)',
      marginTop: 6
    }
  }, selectedDays.size, " ", lang === 'pt' ? 'dias · $' + price + '/piscina' : lang === 'es' ? 'días · $' + price + '/piscina' : 'days · $' + price + '/pool')), involvedWeekdays.length > 0 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.07em',
      color: 'var(--pg-ink-500)',
      textTransform: 'uppercase',
      marginBottom: 10
    }
  }, regsLbl), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, involvedWeekdays.map(wd => /*#__PURE__*/React.createElement(WeekdayRegionRow, {
    key: wd,
    label: dayFull[wd],
    values: weekdayRegions[wd] || [],
    cities: allCities,
    onToggle: city => toggleCityForWeekday(wd, city),
    poolCount: getPoolsForWd(wd),
    onPoolChange: n => setPoolsForWd(wd, n),
    pricePerPool: priceMode === 'fixed' ? parseInt(price || 0) : 0,
    addresses: wdAddresses[wd] || [],
    onAddressChange: (i, val) => setWdAddresses(a => {
      const arr = [...(a[wd] || [])];
      arr[i] = val;
      return {
        ...a,
        [wd]: arr
      };
    }),
    lang: lang
  }))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 20px 18px',
      flexShrink: 0,
      background: 'var(--pg-white)',
      borderTop: '1px solid var(--pg-ink-100)',
      boxShadow: '0 -4px 16px rgba(0,0,0,0.06)'
    }
  }, isValid && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 14px',
      borderRadius: 12,
      background: 'linear-gradient(110deg, var(--pg-blue-50), oklch(0.97 0.04 178))',
      border: '0.5px solid var(--pg-blue-100)',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 16,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--pg-font-display)',
      fontSize: 20,
      fontWeight: 800,
      color: 'var(--pg-blue-500)',
      lineHeight: 1
    }
  }, selectedDays.size), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: 'var(--pg-ink-500)',
      fontWeight: 600,
      marginTop: 2,
      letterSpacing: '0.03em'
    }
  }, lang === 'pt' ? 'DIAS' : lang === 'es' ? 'DÍAS' : 'DAYS')), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1,
      height: 30,
      background: 'var(--pg-ink-200)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--pg-font-display)',
      fontSize: 20,
      fontWeight: 800,
      color: 'var(--pg-blue-500)',
      lineHeight: 1
    }
  }, involvedWeekdays.length), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: 'var(--pg-ink-500)',
      fontWeight: 600,
      marginTop: 2,
      letterSpacing: '0.03em'
    }
  }, lang === 'pt' ? 'DIAS/SEM' : lang === 'es' ? 'DÍAS/SEM' : 'WEEKDAYS')), totalPotential > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1,
      height: 30,
      background: 'var(--pg-ink-200)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--pg-font-display)',
      fontSize: 20,
      fontWeight: 800,
      color: 'var(--pg-blue-500)',
      lineHeight: 1
    }
  }, "$", totalPotential.toLocaleString()), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: 'var(--pg-ink-500)',
      fontWeight: 600,
      marginTop: 2,
      letterSpacing: '0.03em'
    }
  }, lang === 'pt' ? 'POTENCIAL' : lang === 'es' ? 'POTENCIAL' : 'POTENTIAL')))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10.5,
      fontWeight: 700,
      padding: '4px 10px',
      borderRadius: 999,
      background: isValid ? 'var(--pg-blue-500)' : 'var(--pg-ink-200)',
      color: isValid ? '#fff' : 'var(--pg-ink-400)'
    }
  }, isValid ? lang === 'pt' ? '✓ PRONTO' : lang === 'es' ? '✓ LISTO' : '✓ READY' : lang === 'pt' ? 'Falta cidade' : lang === 'es' ? 'Falta ciudad' : 'Need city')), /*#__PURE__*/React.createElement("button", {
    onClick: () => onSubmit && onSubmit({
      monthIdx,
      year,
      selectedDays: [...selectedDays],
      weekdayRegions,
      poolsPerWeekday,
      price,
      priceMode
    }),
    disabled: !isValid,
    className: "pg-btn pg-btn-primary",
    style: {
      width: '100%',
      height: 54,
      fontSize: 16,
      borderRadius: 14,
      opacity: isValid ? 1 : 0.40,
      background: isValid ? 'linear-gradient(135deg, #023EBA 0%, #0077B6 100%)' : 'var(--pg-ink-200)',
      boxShadow: isValid ? '0 6px 20px rgba(0,119,182,0.35)' : 'none'
    }
  }, Icon.cal(18, isValid ? '#fff' : 'var(--pg-ink-400)'), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 8
    }
  }, submitLbl))));
}
function WeekdayRegionRow({
  label,
  values,
  cities,
  onToggle,
  poolCount,
  onPoolChange,
  pricePerPool = 0,
  addresses = [],
  onAddressChange,
  lang
}) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState('');
  const [showAddrs, setShowAddrs] = React.useState(false);
  const matches = q.trim().length >= 1 ? cities.filter(c => c.city.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 8) : [];
  const addLbl = lang === 'pt' ? '+ Cidade' : lang === 'es' ? '+ Ciudad' : '+ City';
  const searchPh = lang === 'pt' ? 'Buscar cidade…' : lang === 'es' ? 'Buscar ciudad…' : 'Search city…';
  const hasValues = values.length > 0;
  const dayEarnings = pricePerPool > 0 ? poolCount * pricePerPool : 0;
  return /*#__PURE__*/React.createElement("div", {
    className: "pg-card",
    style: {
      padding: '12px 14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: hasValues ? 8 : 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 38,
      borderRadius: 10,
      background: 'var(--pg-blue-100)',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 12,
      fontWeight: 700,
      color: 'var(--pg-blue-700)',
      fontFamily: 'var(--pg-font-display)',
      letterSpacing: '-0.01em'
    }
  }, label.slice(0, 3)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      fontWeight: 700,
      color: 'var(--pg-ink-900)',
      letterSpacing: '-0.01em'
    }
  }, label), !hasValues && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--pg-ink-400)',
      marginTop: 1
    }
  }, lang === 'pt' ? 'Nenhuma cidade' : lang === 'es' ? 'Sin ciudades' : 'No cities yet')), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setOpen(!open);
      setQ('');
    },
    style: {
      border: '1px solid ' + (open ? 'var(--pg-blue-400)' : 'var(--pg-ink-200)'),
      background: open ? 'var(--pg-blue-50)' : '#fff',
      height: 30,
      padding: '0 11px',
      borderRadius: 8,
      fontSize: 12,
      fontWeight: 600,
      color: open ? 'var(--pg-blue-600)' : 'var(--pg-blue-500)',
      cursor: 'pointer',
      fontFamily: 'inherit',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      flexShrink: 0
    }
  }, open ? lang === 'pt' ? 'Fechar' : lang === 'es' ? 'Cerrar' : 'Close' : addLbl)), hasValues && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 4,
      marginBottom: 10
    }
  }, values.map(city => /*#__PURE__*/React.createElement("span", {
    key: city,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 3,
      padding: '3px 8px',
      borderRadius: 6,
      background: 'var(--pg-aqua-100)',
      color: 'var(--pg-aqua-700)',
      fontSize: 11,
      fontWeight: 600
    }
  }, city, /*#__PURE__*/React.createElement("button", {
    onClick: () => onToggle(city),
    style: {
      border: 'none',
      background: 'transparent',
      padding: 0,
      cursor: 'pointer',
      display: 'inline-flex',
      color: 'var(--pg-aqua-700)',
      lineHeight: 1
    }
  }, "\xD7")))), open && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 12,
      paddingBottom: 12,
      borderBottom: '0.5px solid var(--pg-ink-100)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("input", {
    className: "pg-field",
    value: q,
    onChange: e => setQ(e.target.value),
    placeholder: searchPh,
    style: {
      paddingLeft: 38,
      height: 38
    },
    autoFocus: true
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: 14,
      top: '50%',
      transform: 'translateY(-50%)'
    }
  }, Icon.search(15, 'var(--pg-ink-500)'))), matches.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 3,
      maxHeight: 160,
      overflow: 'auto'
    }
  }, matches.map(m => {
    const selected = values.includes(m.city);
    return /*#__PURE__*/React.createElement("button", {
      key: m.city,
      onClick: () => onToggle(m.city),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '7px 10px',
        background: selected ? 'var(--pg-aqua-100)' : 'transparent',
        border: 'none',
        borderRadius: 8,
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit',
        fontSize: 13
      }
    }, selected ? Icon.check(13, 'var(--pg-aqua-700)') : Icon.pin(13, 'var(--pg-blue-500)'), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        fontWeight: selected ? 700 : 500,
        color: selected ? 'var(--pg-aqua-700)' : 'inherit'
      }
    }, m.city), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: 'var(--pg-ink-500)'
      }
    }, m.county));
  })), q.trim().length >= 1 && matches.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--pg-ink-500)',
      textAlign: 'center',
      padding: '8px 0'
    }
  }, lang === 'pt' ? 'Nenhuma cidade encontrada' : lang === 'es' ? 'No se encontraron ciudades' : 'No cities found')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: hasValues || open ? 10 : 4,
      borderTop: hasValues || open ? '0.5px solid var(--pg-ink-100)' : 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      color: 'var(--pg-ink-600)',
      fontWeight: 500
    }
  }, "\uD83C\uDFCA ", lang === 'pt' ? 'Piscinas neste dia' : lang === 'es' ? 'Piscinas este día' : 'Pools this day'), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, dayEarnings > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: 'var(--pg-blue-500)',
      fontFamily: 'var(--pg-font-display)',
      letterSpacing: '-0.01em'
    }
  }, "$", dayEarnings.toLocaleString()), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 0,
      border: '1px solid var(--pg-ink-200)',
      borderRadius: 8,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => onPoolChange(poolCount - 1),
    style: {
      width: 30,
      height: 30,
      border: 'none',
      background: 'var(--pg-ink-100)',
      cursor: 'pointer',
      fontSize: 16,
      fontWeight: 700,
      color: 'var(--pg-ink-700)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'inherit',
      lineHeight: 1
    }
  }, "\u2212"), /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: 34,
      textAlign: 'center',
      fontSize: 14,
      fontWeight: 700,
      color: 'var(--pg-blue-600)',
      fontFamily: 'var(--pg-font-display)',
      padding: '0 4px',
      borderLeft: '1px solid var(--pg-ink-200)',
      borderRight: '1px solid var(--pg-ink-200)',
      lineHeight: '30px',
      display: 'inline-block'
    }
  }, poolCount), /*#__PURE__*/React.createElement("button", {
    onClick: () => onPoolChange(poolCount + 1),
    style: {
      width: 30,
      height: 30,
      border: 'none',
      background: 'var(--pg-blue-100)',
      cursor: 'pointer',
      fontSize: 16,
      fontWeight: 700,
      color: 'var(--pg-blue-700)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'inherit',
      lineHeight: 1
    }
  }, "+")))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      paddingTop: 10,
      borderTop: '0.5px solid var(--pg-ink-100)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--pg-ink-500)',
      fontWeight: 500
    }
  }, "\uD83D\uDCCD ", lang === 'pt' ? `${addresses.filter(a => a.trim()).length}/${poolCount} endereços` : lang === 'es' ? `${addresses.filter(a => a.trim()).length}/${poolCount} direcciones` : `${addresses.filter(a => a.trim()).length}/${poolCount} addresses`), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowAddrs(v => !v),
    style: {
      border: '1px solid var(--pg-ink-200)',
      background: showAddrs ? 'var(--pg-blue-50)' : '#fff',
      height: 26,
      padding: '0 10px',
      borderRadius: 7,
      fontSize: 11.5,
      fontWeight: 600,
      color: showAddrs ? 'var(--pg-blue-600)' : 'var(--pg-ink-600)',
      cursor: 'pointer',
      fontFamily: 'inherit'
    }
  }, showAddrs ? lang === 'pt' ? 'Fechar' : lang === 'es' ? 'Cerrar' : 'Close' : lang === 'pt' ? 'Adicionar' : lang === 'es' ? 'Agregar' : 'Add')), showAddrs && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '5px 9px',
      borderRadius: 7,
      background: 'var(--pg-blue-50)'
    }
  }, Icon.shield(12, 'var(--pg-blue-700)'), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10.5,
      color: 'var(--pg-blue-700)',
      fontWeight: 500
    }
  }, lang === 'pt' ? 'Revelados apenas ao técnico aprovado' : lang === 'es' ? 'Solo revelados al técnico aprobado' : 'Only revealed to the approved tech')), addresses.map((addr, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 7
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 24,
      height: 24,
      borderRadius: 6,
      flexShrink: 0,
      background: addr.trim() ? 'var(--pg-blue-500)' : 'var(--pg-ink-200)',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 10,
      fontWeight: 700,
      fontFamily: 'var(--pg-font-display)',
      transition: 'background .15s ease'
    }
  }, i + 1), /*#__PURE__*/React.createElement("input", {
    className: "pg-field",
    style: {
      height: 38,
      fontSize: 12.5
    },
    placeholder: lang === 'pt' ? `Endereço piscina ${i + 1}…` : lang === 'es' ? `Dirección piscina ${i + 1}…` : `Pool ${i + 1} address…`,
    value: addr,
    onChange: e => onAddressChange && onAddressChange(i, e.target.value)
  }))))));
}

// ── Post Hiring sheet ─────────────────────────────────────────
// ── Shared form helpers (defined outside any component so identity is stable) ──
function HiringFormSection({
  label,
  children
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--pg-ink-500)',
      fontWeight: 700,
      letterSpacing: '0.06em',
      marginBottom: 8,
      textTransform: 'uppercase'
    }
  }, label), children);
}
function HiringRequirementCard({
  options,
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, options.map(opt => {
    const on = value === opt.id;
    return /*#__PURE__*/React.createElement("button", {
      key: opt.id,
      onClick: () => onChange(on ? '' : opt.id),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '11px 14px',
        borderRadius: 12,
        border: on ? '1.5px solid var(--pg-blue-400)' : '1.5px solid var(--pg-ink-200)',
        background: on ? 'var(--pg-blue-50)' : 'var(--pg-white)',
        cursor: 'pointer',
        fontFamily: 'inherit',
        textAlign: 'left',
        transition: 'all .15s'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 38,
        height: 38,
        borderRadius: 10,
        flexShrink: 0,
        background: on ? 'var(--pg-blue-500)' : 'var(--pg-ink-100)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, opt.icon(on ? '#fff' : 'var(--pg-ink-500)')), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: on ? 'var(--pg-blue-700)' : 'var(--pg-ink-900)',
        marginBottom: 2
      }
    }, opt.label), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: on ? 'var(--pg-blue-500)' : 'var(--pg-ink-400)'
      }
    }, opt.sublabel)), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 20,
        height: 20,
        borderRadius: '50%',
        flexShrink: 0,
        border: on ? 'none' : '2px solid var(--pg-ink-300)',
        background: on ? 'var(--pg-blue-500)' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, on && /*#__PURE__*/React.createElement("svg", {
      width: "10",
      height: "10",
      viewBox: "0 0 10 10"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M2 5l2.5 2.5L8 3",
      stroke: "#fff",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      fill: "none"
    }))));
  }));
}
function PostHiringSheet({
  onClose,
  lang = 'en',
  onSubmit
}) {
  const t = STRINGS[lang];
  const [company, setCompany] = React.useState('');
  const [role, setRole] = React.useState('');
  const [loc, setLoc] = React.useState('');
  const [contract, setContract] = React.useState('fullTime');
  const [payMode, setPayMode] = React.useState('perPool');
  const [pay, setPay] = React.useState('');
  const [carReq, setCarReq] = React.useState('');
  const [equipReq, setEquipReq] = React.useState('');
  const [licenseReq, setLicenseReq] = React.useState('');
  const [desc, setDesc] = React.useState('');
  const headLbl = lang === 'pt' ? 'Publicar vaga' : lang === 'es' ? 'Publicar empleo' : 'Post a job';
  const companyLbl = lang === 'pt' ? 'Nome da empresa' : lang === 'es' ? 'Nombre de la empresa' : 'Company name';
  const companyPh = lang === 'pt' ? 'ex: South Florida Pools Inc.' : lang === 'es' ? 'ej: South Florida Pools Inc.' : 'e.g. South Florida Pools Inc.';
  const roleLbl = lang === 'pt' ? 'Título do cargo' : lang === 'es' ? 'Título del puesto' : 'Job title';
  const rolePh = lang === 'pt' ? 'ex: Técnico de Piscina' : lang === 'es' ? 'ej: Técnico de Piscina' : 'e.g. Pool Service Technician';
  const locLbl = lang === 'pt' ? 'Localização' : lang === 'es' ? 'Ubicación' : 'Location';
  const contractLbl = lang === 'pt' ? 'Tipo de contrato' : lang === 'es' ? 'Tipo de contrato' : 'Contract type';
  const payLbl = lang === 'pt' ? 'Tipo de pagamento' : lang === 'es' ? 'Tipo de pago' : 'Payment type';
  const descLbl = lang === 'pt' ? 'Descrição da vaga' : lang === 'es' ? 'Descripción del puesto' : 'Job description';
  const descPh = lang === 'pt' ? 'Descreva as responsabilidades, horários, benefícios…' : lang === 'es' ? 'Describa las responsabilidades, horarios, beneficios…' : 'Describe responsibilities, schedule, benefits…';
  const submitLbl = lang === 'pt' ? 'Publicar vaga' : lang === 'es' ? 'Publicar empleo' : 'Post job';
  const contractTypes = [{
    id: 'fullTime',
    label: lang === 'pt' ? 'Full-time' : lang === 'es' ? 'Tiempo completo' : 'Full-time'
  }, {
    id: 'partTime',
    label: lang === 'pt' ? 'Part-time' : lang === 'es' ? 'Medio tiempo' : 'Part-time'
  }, {
    id: 'contract',
    label: lang === 'pt' ? 'Contrato' : lang === 'es' ? 'Contrato' : 'Contract'
  }];
  const payModes = [{
    id: 'perPool',
    label: lang === 'pt' ? 'Por piscina' : lang === 'es' ? 'Por piscina' : 'Per pool',
    suffix: '/pool'
  }, {
    id: 'weekly',
    label: lang === 'pt' ? 'Semanal' : lang === 'es' ? 'Semanal' : 'Weekly',
    suffix: lang === 'pt' ? '/sem' : lang === 'es' ? '/sem' : '/wk'
  }, {
    id: 'neg',
    label: lang === 'pt' ? 'Negociável' : lang === 'es' ? 'Negociable' : 'Negotiable',
    suffix: ''
  }];
  const carOptions = [{
    id: 'ownCar',
    icon: c => /*#__PURE__*/React.createElement("svg", {
      width: "18",
      height: "18",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: c,
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M5 17H3v-5l2-5h14l2 5v5h-2"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "7.5",
      cy: "17.5",
      r: "2.5"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "16.5",
      cy: "17.5",
      r: "2.5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M5 12h14"
    })),
    label: lang === 'pt' ? 'Candidato com carro' : lang === 'es' ? 'Candidato con auto' : 'Candidate has own vehicle',
    sublabel: lang === 'pt' ? 'Veículo próprio obrigatório' : lang === 'es' ? 'Vehículo propio requerido' : 'Own vehicle required'
  }, {
    id: 'companyCar',
    icon: c => /*#__PURE__*/React.createElement("svg", {
      width: "18",
      height: "18",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: c,
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("rect", {
      x: "2",
      y: "7",
      width: "20",
      height: "14",
      rx: "2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 12v4M10 14h4"
    })),
    label: lang === 'pt' ? 'Empresa fornece veículo' : lang === 'es' ? 'Empresa provee vehículo' : 'Company provides vehicle',
    sublabel: lang === 'pt' ? 'Caminhonete/van incluída' : lang === 'es' ? 'Camioneta/van incluida' : 'Truck/van included'
  }];
  const equipOptions = [{
    id: 'ownEquip',
    icon: c => /*#__PURE__*/React.createElement("svg", {
      width: "18",
      height: "18",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: c,
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M14 7a4 4 0 1 0-5 5l-6 6 3 3 6-6a4 4 0 0 0 5-5l-3 3-3-3z"
    })),
    label: lang === 'pt' ? 'Candidato com equipamentos' : lang === 'es' ? 'Candidato con equipo' : 'Candidate has own equipment',
    sublabel: lang === 'pt' ? 'Equipamentos próprios obrigatórios' : lang === 'es' ? 'Equipos propios requeridos' : 'Own equipment required'
  }, {
    id: 'companyEquip',
    icon: c => /*#__PURE__*/React.createElement("svg", {
      width: "18",
      height: "18",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: c,
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M3 6h18"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M16 10a4 4 0 0 1-8 0"
    })),
    label: lang === 'pt' ? 'Empresa fornece equipamentos' : lang === 'es' ? 'Empresa provee equipos' : 'Company provides equipment',
    sublabel: lang === 'pt' ? 'Tudo incluído pela empresa' : lang === 'es' ? 'Todo incluido por la empresa' : 'Everything provided'
  }];
  const licenseOptions = [{
    id: 'required',
    icon: c => /*#__PURE__*/React.createElement("svg", {
      width: "18",
      height: "18",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: c,
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("rect", {
      x: "2",
      y: "6",
      width: "20",
      height: "13",
      rx: "2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M7 11h4M7 14h6M15 10h2v4h-2z"
    })),
    label: lang === 'pt' ? "Driver's license obrigatória" : lang === 'es' ? "Driver's license requerida" : "Driver's license required",
    sublabel: lang === 'pt' ? "Driver's license válida emitida pelo estado" : lang === 'es' ? "Driver's license válida emitida por el estado" : "Valid state-issued driver's license"
  }, {
    id: 'notRequired',
    icon: c => /*#__PURE__*/React.createElement("svg", {
      width: "18",
      height: "18",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: c,
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "9"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M9 12h6"
    })),
    label: lang === 'pt' ? "Driver's license não necessária" : lang === 'es' ? "Driver's license no requerida" : "Driver's license not required",
    sublabel: lang === 'pt' ? 'Sem necessidade para este cargo' : lang === 'es' ? 'No se requiere para este puesto' : 'No license needed for this role'
  }];
  const isValid = company.trim().length > 0 && role.trim().length > 0 && loc.trim().length > 0 && carReq !== '' && equipReq !== '' && licenseReq !== '';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 0 24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 18px 14px',
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
      padding: '0 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement(HiringFormSection, {
    label: companyLbl
  }, /*#__PURE__*/React.createElement("input", {
    className: "pg-field",
    value: company,
    onChange: e => setCompany(e.target.value),
    placeholder: companyPh
  })), /*#__PURE__*/React.createElement(HiringFormSection, {
    label: roleLbl
  }, /*#__PURE__*/React.createElement("input", {
    className: "pg-field",
    value: role,
    onChange: e => setRole(e.target.value),
    placeholder: rolePh
  })), /*#__PURE__*/React.createElement(HiringFormSection, {
    label: locLbl
  }, /*#__PURE__*/React.createElement(CityAutocomplete, {
    value: loc,
    onChange: setLoc,
    lang: lang
  })), /*#__PURE__*/React.createElement(HiringFormSection, {
    label: contractLbl
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, contractTypes.map(ct => {
    const on = contract === ct.id;
    return /*#__PURE__*/React.createElement("button", {
      key: ct.id,
      onClick: () => setContract(ct.id),
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
        boxShadow: on ? '0 4px 10px oklch(0.58 0.16 235 / 0.25)' : 'none'
      }
    }, ct.label);
  }))), /*#__PURE__*/React.createElement(HiringFormSection, {
    label: payLbl
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 12,
      flexWrap: 'wrap'
    }
  }, payModes.map(pm => {
    const on = payMode === pm.id;
    return /*#__PURE__*/React.createElement("button", {
      key: pm.id,
      onClick: () => setPayMode(pm.id),
      style: {
        padding: '8px 16px',
        borderRadius: 10,
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 13,
        fontWeight: 600,
        transition: 'all .12s',
        flex: 1,
        background: on ? 'var(--pg-blue-500)' : 'var(--pg-ink-100)',
        color: on ? '#fff' : 'var(--pg-ink-700)',
        boxShadow: on ? '0 4px 10px oklch(0.58 0.16 235 / 0.25)' : 'none'
      }
    }, pm.label);
  })), payMode !== 'neg' && /*#__PURE__*/React.createElement("div", {
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
    type: "number",
    inputMode: "decimal",
    value: pay,
    onChange: e => setPay(e.target.value),
    placeholder: "0",
    style: {
      height: 56,
      paddingLeft: 36,
      paddingRight: 70,
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
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--pg-ink-400)'
    }
  }, payModes.find(p => p.id === payMode)?.suffix)), payMode === 'neg' && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 14px',
      borderRadius: 12,
      background: 'var(--pg-blue-50)',
      border: '1px solid var(--pg-blue-100)',
      fontSize: 12.5,
      color: 'var(--pg-blue-700)',
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--pg-blue-500)",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 16v-4M12 8h.01"
  })), lang === 'pt' ? 'O candidato e o empregador vão combinar o valor diretamente.' : lang === 'es' ? 'El candidato y el empleador acordarán el monto directamente.' : 'Candidate and employer will agree on compensation directly.')), /*#__PURE__*/React.createElement(HiringFormSection, {
    label: lang === 'pt' ? 'Veículo' : lang === 'es' ? 'Vehículo' : 'Vehicle'
  }, /*#__PURE__*/React.createElement(HiringRequirementCard, {
    options: carOptions,
    value: carReq,
    onChange: setCarReq
  })), /*#__PURE__*/React.createElement(HiringFormSection, {
    label: "Driver's License"
  }, /*#__PURE__*/React.createElement(HiringRequirementCard, {
    options: licenseOptions,
    value: licenseReq,
    onChange: setLicenseReq
  })), /*#__PURE__*/React.createElement(HiringFormSection, {
    label: lang === 'pt' ? 'Equipamentos' : lang === 'es' ? 'Equipos' : 'Equipment'
  }, /*#__PURE__*/React.createElement(HiringRequirementCard, {
    options: equipOptions,
    value: equipReq,
    onChange: setEquipReq
  })), /*#__PURE__*/React.createElement(HiringFormSection, {
    label: descLbl
  }, /*#__PURE__*/React.createElement("textarea", {
    className: "pg-field",
    value: desc,
    onChange: e => setDesc(e.target.value),
    placeholder: descPh,
    rows: 4,
    style: {
      resize: 'none',
      lineHeight: 1.55,
      paddingTop: 12,
      paddingBottom: 12,
      height: 'auto'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 18px 8px',
      position: 'sticky',
      bottom: 0,
      background: 'var(--pg-white)',
      borderTop: '0.5px solid var(--pg-ink-200)'
    }
  }, !isValid && (carReq === '' || licenseReq === '' || equipReq === '') && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: 'var(--pg-ink-400)',
      textAlign: 'center',
      marginBottom: 10
    }
  }, lang === 'pt' ? 'Selecione os requisitos de veículo, driver\'s license e equipamento' : lang === 'es' ? 'Selecciona los requisitos de vehículo, driver\'s license y equipo' : 'Select vehicle, driver\'s license and equipment to continue'), /*#__PURE__*/React.createElement("button", {
    onClick: () => onSubmit && onSubmit({
      company,
      role,
      loc,
      contract,
      payMode,
      pay,
      carReq,
      licenseReq,
      equipReq,
      desc,
      photoUrl: null
    }),
    disabled: !isValid,
    className: "pg-btn pg-btn-primary",
    style: {
      width: '100%',
      height: 52,
      fontSize: 16,
      opacity: isValid ? 1 : 0.45
    }
  }, Icon.briefcase(17, '#fff'), " ", submitLbl)));
}

// ── Post Tech profile sheet ───────────────────────────────────
function PostTechSheet({
  onClose,
  lang = 'en',
  onSubmit
}) {
  const t = STRINGS[lang];
  const [name, setName] = React.useState('');
  const [specialty, setSpecialty] = React.useState('');
  const [loc, setLoc] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [photos, setPhotos] = React.useState([]);
  const [rateMode, setRateMode] = React.useState('fixed');
  const [rate, setRate] = React.useState('90');
  const headLbl = lang === 'pt' ? 'Cadastrar técnico' : lang === 'es' ? 'Registrar técnico' : 'Register as technician';
  const nameLbl = lang === 'pt' ? 'Nome completo' : lang === 'es' ? 'Nombre completo' : 'Full name';
  const namePh = lang === 'pt' ? 'ex: Rafael Silva' : lang === 'es' ? 'ej: Rafael Silva' : 'e.g. Rafael Silva';
  const specLbl = lang === 'pt' ? 'Especialidade' : lang === 'es' ? 'Especialidad' : 'Specialty';
  const specPh = lang === 'pt' ? 'ex: Reparo de bombas e motores' : lang === 'es' ? 'ej: Reparación de bombas y motores' : 'e.g. Pump & Motor Repair';
  const locLbl = lang === 'pt' ? 'Cidade' : lang === 'es' ? 'Ciudad' : 'City';
  const phoneLbl = lang === 'pt' ? 'Telefone' : lang === 'es' ? 'Teléfono' : 'Phone number';
  const emailLbl = lang === 'pt' ? 'E-mail (opcional)' : lang === 'es' ? 'E-mail (opcional)' : 'Email (optional)';
  const rateLbl = lang === 'pt' ? 'Preço por visita' : lang === 'es' ? 'Precio por visita' : 'Rate per visit';
  const submitLbl = lang === 'pt' ? 'Publicar perfil' : lang === 'es' ? 'Publicar perfil' : 'Post profile';

  // US phone mask: (xxx) XXX-XXXX
  const formatPhone = val => {
    const d = val.replace(/\D/g, '').slice(0, 10);
    if (d.length === 0) return '';
    if (d.length <= 3) return `(${d}`;
    if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  };
  const isValid = name.trim().length > 0 && specialty.trim().length > 0 && loc.trim().length > 0 && phone.replace(/\D/g, '').length === 10;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 0 24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 18px 14px',
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
      padding: '0 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(PhotoPicker, {
    photos: photos,
    onAdd: url => setPhotos(p => [...p, url]),
    onRemove: url => setPhotos(p => p.filter(u => u !== url)),
    max: 3,
    lang: lang,
    title: lang === 'pt' ? 'Foto do perfil' : lang === 'es' ? 'Foto de perfil' : 'Profile photo'
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 0,
      borderTop: '0.5px solid var(--pg-ink-200)'
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--pg-ink-500)',
      fontWeight: 700,
      letterSpacing: '0.06em',
      marginBottom: 8
    }
  }, nameLbl.toUpperCase()), /*#__PURE__*/React.createElement("input", {
    className: "pg-field",
    value: name,
    onChange: e => setName(e.target.value),
    placeholder: namePh
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--pg-ink-500)',
      fontWeight: 700,
      letterSpacing: '0.06em',
      marginBottom: 8
    }
  }, specLbl.toUpperCase()), /*#__PURE__*/React.createElement("input", {
    className: "pg-field",
    value: specialty,
    onChange: e => setSpecialty(e.target.value),
    placeholder: specPh
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--pg-ink-500)',
      fontWeight: 700,
      letterSpacing: '0.06em',
      marginBottom: 8
    }
  }, locLbl.toUpperCase()), /*#__PURE__*/React.createElement(CityAutocomplete, {
    value: loc,
    onChange: setLoc,
    lang: lang
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--pg-ink-500)',
      fontWeight: 700,
      letterSpacing: '0.06em',
      marginBottom: 8
    }
  }, phoneLbl.toUpperCase(), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'oklch(0.55 0.22 25)',
      marginLeft: 4,
      fontWeight: 800
    }
  }, "*")), /*#__PURE__*/React.createElement("input", {
    className: "pg-field",
    type: "tel",
    inputMode: "numeric",
    value: phone,
    onChange: e => setPhone(formatPhone(e.target.value)),
    placeholder: "(954) 555-0000",
    style: {
      letterSpacing: '0.04em'
    }
  }), phone.length > 0 && phone.replace(/\D/g, '').length < 10 && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'oklch(0.55 0.18 25)',
      marginTop: 5,
      paddingLeft: 2
    }
  }, lang === 'pt' ? 'Digite os 10 dígitos do número' : lang === 'es' ? 'Ingresa los 10 dígitos' : 'Enter all 10 digits')), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--pg-ink-500)',
      fontWeight: 700,
      letterSpacing: '0.06em',
      marginBottom: 8
    }
  }, emailLbl.toUpperCase()), /*#__PURE__*/React.createElement("input", {
    className: "pg-field",
    type: "email",
    value: email,
    onChange: e => setEmail(e.target.value),
    placeholder: "your@email.com"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--pg-ink-500)',
      fontWeight: 700,
      letterSpacing: '0.06em',
      marginBottom: 8
    }
  }, rateLbl.toUpperCase()), /*#__PURE__*/React.createElement("div", {
    className: "pg-seg",
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: `pg-seg-btn ${rateMode === 'fixed' ? 'on' : ''}`,
    onClick: () => setRateMode('fixed')
  }, t.fixedPrice), /*#__PURE__*/React.createElement("button", {
    className: `pg-seg-btn ${rateMode === 'neg' ? 'on' : ''}`,
    onClick: () => setRateMode('neg')
  }, t.priceNeg)), rateMode === 'fixed' && /*#__PURE__*/React.createElement("div", {
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
    value: rate,
    onChange: e => setRate(e.target.value),
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
      fontSize: 13,
      color: 'var(--pg-ink-500)'
    }
  }, lang === 'pt' ? '/visita' : lang === 'es' ? '/visita' : '/visit')))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 18px 8px',
      position: 'sticky',
      bottom: 0,
      background: 'var(--pg-white)',
      borderTop: '0.5px solid var(--pg-ink-200)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => onSubmit && onSubmit({
      name,
      specialty,
      loc,
      phone,
      email,
      rateMode,
      rate,
      photoUrl: photos[0] || null
    }),
    disabled: !isValid,
    className: "pg-btn pg-btn-primary",
    style: {
      width: '100%',
      height: 52,
      fontSize: 16,
      opacity: isValid ? 1 : 0.45
    }
  }, Icon.shield(17, '#fff'), " ", submitLbl)));
}
function MiniCal({
  days,
  bookedDays = [],
  selectedDays = null,
  yearMonth = null,
  variant = 'blue',
  lang = 'en',
  style = {}
}) {
  // days = all vacation days, bookedDays = already assigned, selectedDays = user's selection
  // yearMonth = {year, month} (month 0-indexed) for proper weekday alignment
  const vacSet = new Set(days);
  const bookedSet = new Set(bookedDays);
  const selSet = selectedDays ? new Set(selectedDays) : null;
  const c = variant === 'aqua' ? 'var(--pg-aqua-500)' : 'var(--pg-blue-500)';
  const cBg = variant === 'aqua' ? 'var(--pg-aqua-100)' : 'var(--pg-blue-100)';

  // Weekday headers — 2-letter, starting Sunday
  const wdHeaders = lang === 'pt' ? ['Do', 'Se', 'Te', 'Qu', 'Qu', 'Se', 'Sá'] : lang === 'es' ? ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'] : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Offset: what weekday does day-1 of this month start on? (0=Sun)
  const offset = yearMonth ? new Date(yearMonth.year, yearMonth.month, 1).getDay() : 0;
  const all = Array.from({
    length: 31
  }, (_, i) => i + 1);
  return /*#__PURE__*/React.createElement("div", {
    style: style
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7,1fr)',
      gap: 4,
      marginBottom: 3
    }
  }, wdHeaders.map((h, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      fontSize: 8.5,
      fontWeight: 700,
      textAlign: 'center',
      color: 'var(--pg-ink-400)',
      letterSpacing: '0.03em',
      padding: '1px 0'
    }
  }, h))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7,1fr)',
      gap: 4
    }
  }, Array.from({
    length: offset
  }).map((_, i) => /*#__PURE__*/React.createElement("div", {
    key: `off-${i}`
  })), all.map(d => {
    const inVac = vacSet.has(d);
    const booked = bookedSet.has(d);
    const sel = selSet ? selSet.has(d) : inVac;
    let bg,
      color,
      td = 'none',
      border = 'none';
    if (!inVac) {
      bg = 'var(--pg-blue-50)';
      color = 'var(--pg-ink-200)';
    } else if (booked) {
      bg = 'var(--pg-ink-100)';
      color = 'var(--pg-ink-300)';
      td = 'line-through';
    } else if (sel) {
      bg = c;
      color = '#fff';
    } else {
      bg = cBg;
      color = 'var(--pg-blue-600)';
      border = '1px dashed var(--pg-blue-200)';
    }
    return /*#__PURE__*/React.createElement("div", {
      key: d,
      style: {
        aspectRatio: '1',
        borderRadius: 6,
        fontSize: 10,
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: bg,
        color,
        textDecoration: td,
        border
      }
    }, d);
  })));
}

// ── Compact day chips (for ApplicantsSheet + Applied cards) ────
function DayChips({
  days,
  bookedDays = [],
  selectedDays = null,
  size = 26,
  yearMonth = null,
  lang = 'en'
}) {
  const bookedSet = new Set(bookedDays);
  const selSet = selectedDays ? new Set(selectedDays) : null;
  const wdShort = lang === 'pt' ? ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] : lang === 'es' ? ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 4
    }
  }, days.map(d => {
    const booked = bookedSet.has(d);
    const sel = selSet ? selSet.has(d) : !booked;
    const wd = yearMonth ? new Date(yearMonth.year, yearMonth.month, d).getDay() : null;
    return /*#__PURE__*/React.createElement("span", {
      key: d,
      style: {
        minWidth: wd !== null ? 30 : size,
        height: wd !== null ? 38 : size,
        padding: wd !== null ? '3px 5px' : 0,
        borderRadius: 7,
        fontWeight: 700,
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        background: booked ? 'var(--pg-ink-100)' : sel ? 'var(--pg-blue-500)' : 'var(--pg-blue-100)',
        color: booked ? 'var(--pg-ink-300)' : sel ? '#fff' : 'var(--pg-blue-600)',
        textDecoration: booked ? 'line-through' : 'none'
      }
    }, wd !== null && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 8,
        fontWeight: 700,
        letterSpacing: '0.04em',
        opacity: booked ? 0.5 : 0.75,
        lineHeight: 1.2
      }
    }, wdShort[wd].toUpperCase()), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: wd !== null ? 12 : 10.5,
        lineHeight: 1.15
      }
    }, d));
  }));
}

// ── Vacation Day Picker Sheet ──────────────────────────────────
function VacationDayPickerSheet({
  vac,
  lang = 'en',
  onClose,
  onSubmit,
  confirmedDays = []
}) {
  const [selected, setSelected] = React.useState(new Set());
  const [submitted, setSubmitted] = React.useState(false);
  const [conflictPending, setConflictPending] = React.useState(null); // {d, owner}

  // Build a map of confirmed date-keys → owner name
  const confirmedMap = React.useMemo(() => {
    const m = {};
    confirmedDays.forEach(c => {
      m[c.key] = c.owner;
    });
    return m;
  }, [confirmedDays]);
  React.useEffect(() => {
    if (vac) {
      setSelected(new Set());
      setSubmitted(false);
      setConflictPending(null);
    }
  }, [vac]);
  if (!vac) return null;
  const bookedSet = new Set(vac.bookedDays || []);
  const availDays = vac.days.filter(d => !bookedSet.has(d));
  const selArr = Array.from(selected);

  // Weekday short names per lang (Sun=0)
  const wdShort = lang === 'pt' ? ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] : lang === 'es' ? ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const getDayWd = d => vac.yearMonth ? new Date(vac.yearMonth.year, vac.yearMonth.month, d).getDay() : null;
  const getDayName = d => {
    const wd = getDayWd(d);
    return wd !== null ? wdShort[wd] : null;
  };
  const getPoolsForDay = d => {
    const wd = getDayWd(d);
    if (wd !== null && vac.poolsByWeekday && vac.poolsByWeekday[wd] !== undefined) return vac.poolsByWeekday[wd];
    return vac.poolsPerDay;
  };

  // Earnings: sum per-day pools × price
  const earnings = selArr.reduce((sum, d) => sum + getPoolsForDay(d) * vac.pricePerPool, 0);
  const allSelected = availDays.every(d => selected.has(d));
  const commitToggle = d => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(d) ? next.delete(d) : next.add(d);
      return next;
    });
  };
  const toggle = d => {
    if (bookedSet.has(d)) return;
    // Check conflict
    if (!selected.has(d) && vac.yearMonth) {
      const key = `${vac.yearMonth.year}-${vac.yearMonth.month}-${d}`;
      if (confirmedMap[key]) {
        setConflictPending({
          d,
          owner: confirmedMap[key]
        });
        return;
      }
    }
    commitToggle(d);
  };
  const toggleAll = () => {
    if (allSelected) setSelected(new Set());else setSelected(new Set(availDays));
  };
  const selectAllLabel = lang === 'pt' ? 'Todos os dias' : lang === 'es' ? 'Todos los días' : 'All days';
  const bookedLabel = lang === 'pt' ? 'Já reservado' : lang === 'es' ? 'Ya reservado' : 'Booked';
  const availLabel = lang === 'pt' ? 'Disponível' : lang === 'es' ? 'Disponible' : 'Available';
  const selLabel = lang === 'pt' ? 'Selecionado' : lang === 'es' ? 'Seleccionado' : 'Selected';
  const conflictLabel = lang === 'pt' ? 'Dia já confirmado' : lang === 'es' ? 'Día ya confirmado' : 'Day already confirmed';
  const applyLabel = lang === 'pt' ? `Aplicar para ${selArr.length} dia${selArr.length !== 1 ? 's' : ''}` : lang === 'es' ? `Aplicar a ${selArr.length} día${selArr.length !== 1 ? 's' : ''}` : `Apply for ${selArr.length} day${selArr.length !== 1 ? 's' : ''}`;
  const estLabel = lang === 'pt' ? 'Est.' : 'Est.';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 18px 32px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: 12,
      borderBottom: '0.5px solid var(--pg-ink-200)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 18,
      fontWeight: 700,
      letterSpacing: '-0.01em'
    }
  }, lang === 'pt' ? 'Escolher dias' : lang === 'es' ? 'Elegir días' : 'Pick your days'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--pg-ink-500)',
      marginTop: 2
    }
  }, vac.owner, " \xB7 ", tr(vac.month, lang), " \xB7 ", vac.region)), /*#__PURE__*/React.createElement("button", {
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
      gap: 14,
      marginTop: 14,
      marginBottom: 12
    }
  }, [{
    bg: 'var(--pg-blue-500)',
    color: '#fff',
    label: selLabel
  }, {
    bg: 'var(--pg-blue-100)',
    color: 'var(--pg-blue-600)',
    label: availLabel,
    border: '1px dashed var(--pg-blue-300)'
  }, {
    bg: 'var(--pg-ink-100)',
    color: 'var(--pg-ink-300)',
    label: bookedLabel,
    td: 'line-through'
  }].map((l, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 18,
      height: 18,
      borderRadius: 4,
      background: l.bg,
      display: 'inline-block',
      border: l.border || 'none',
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--pg-ink-500)',
      textDecoration: l.td || 'none'
    }
  }, l.label)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 16
    }
  }, vac.days.map(d => {
    const booked = bookedSet.has(d);
    const sel = selected.has(d);
    const poolsCnt = getPoolsForDay(d);
    const wd = getDayWd(d);
    const isConflict = !booked && !sel && vac.yearMonth && !!confirmedMap[`${vac.yearMonth.year}-${vac.yearMonth.month}-${d}`];
    return /*#__PURE__*/React.createElement("button", {
      key: d,
      onClick: () => toggle(d),
      style: {
        width: 56,
        height: 68,
        borderRadius: 12,
        border: isConflict ? '2px solid var(--pg-warn)' : 'none',
        cursor: booked ? 'default' : 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        fontFamily: 'inherit',
        transition: 'all .12s ease',
        background: booked ? 'var(--pg-ink-100)' : isConflict ? 'oklch(0.97 0.05 60)' : sel ? 'var(--pg-blue-500)' : 'var(--pg-blue-100)',
        color: booked ? 'var(--pg-ink-300)' : isConflict ? 'oklch(0.48 0.14 60)' : sel ? '#fff' : 'var(--pg-blue-600)',
        boxShadow: sel && !booked ? '0 4px 12px oklch(0.58 0.16 235 / 0.35)' : 'none',
        transform: sel && !booked ? 'scale(1.06)' : 'scale(1)'
      }
    }, getDayName(d) && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 8.5,
        fontWeight: 700,
        letterSpacing: '0.03em',
        opacity: booked ? 0.5 : 0.85
      }
    }, getDayName(d).toUpperCase()), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 17,
        fontWeight: 700,
        textDecoration: booked ? 'line-through' : 'none',
        lineHeight: 1
      }
    }, d), booked ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 7.5,
        fontWeight: 700,
        letterSpacing: '0.04em',
        marginTop: 1
      }
    }, lang === 'pt' ? 'RESERV.' : lang === 'es' ? 'RESERV.' : 'BOOKED') : isConflict ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 7,
        fontWeight: 700,
        letterSpacing: '0.02em',
        marginTop: 1
      }
    }, "\u26A0\uFE0F") : /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 8,
        color: sel ? 'rgba(255,255,255,0.75)' : 'var(--pg-blue-500)',
        marginTop: 1
      }
    }, poolsCnt, "\uD83C\uDFCA"));
  })), /*#__PURE__*/React.createElement("button", {
    onClick: toggleAll,
    style: {
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      padding: '0 0 14px',
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--pg-blue-600)',
      textAlign: 'left',
      fontFamily: 'inherit',
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 18,
      height: 18,
      borderRadius: 4,
      border: '1.5px solid var(--pg-blue-400)',
      background: allSelected ? 'var(--pg-blue-500)' : 'transparent',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, allSelected && /*#__PURE__*/React.createElement("svg", {
    width: "10",
    height: "10",
    viewBox: "0 0 12 12",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2 6l3 3 5-5",
    stroke: "#fff",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), selectAllLabel, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--pg-ink-400)',
      fontWeight: 400
    }
  }, "(", availDays.length, " ", lang === 'pt' ? 'dias' : lang === 'es' ? 'días' : 'days', ")")), /*#__PURE__*/React.createElement("div", {
    className: "pg-card",
    style: {
      padding: '10px 14px',
      marginBottom: 12,
      background: 'var(--pg-blue-50)'
    }
  }, vac.poolsByWeekday ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: 'var(--pg-blue-700)',
      marginBottom: 2
    }
  }, lang === 'pt' ? 'Piscinas por dia' : lang === 'es' ? 'Piscinas por día' : 'Pools per day'), availDays.map(d => {
    const wd = getDayWd(d);
    const cnt = getPoolsForDay(d);
    const isSel = selected.has(d);
    return /*#__PURE__*/React.createElement("div", {
      key: d,
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 12,
        padding: '5px 8px',
        borderRadius: 8,
        marginLeft: -8,
        marginRight: -8,
        transition: 'all .15s ease',
        background: isSel ? 'var(--pg-blue-500)' : 'transparent',
        color: isSel ? '#fff' : 'var(--pg-ink-600)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: isSel ? 700 : 400
      }
    }, wd !== null ? wdShort[wd] : d, " \u2014 ", cnt, " \uD83C\uDFCA \xD7 $", vac.pricePerPool, "/pool"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 700
      }
    }, "$", (cnt * vac.pricePerPool).toLocaleString(), "/day"));
  })) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 12,
      color: 'var(--pg-ink-600)'
    }
  }, /*#__PURE__*/React.createElement("span", null, vac.poolsPerDay, " ", lang === 'pt' ? 'piscinas/dia' : lang === 'es' ? 'piscinas/día' : 'pools/day', " \xD7 $", vac.pricePerPool, "/pool"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700
    }
  }, "$", (vac.poolsPerDay * vac.pricePerPool).toLocaleString(), "/", lang === 'pt' ? 'dia' : lang === 'es' ? 'día' : 'day'))), Object.keys(confirmedMap).length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginBottom: 10,
      fontSize: 11.5,
      color: 'oklch(0.48 0.14 60)',
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 16,
      height: 16,
      borderRadius: 4,
      background: 'oklch(0.97 0.05 60)',
      border: '2px solid var(--pg-warn)',
      display: 'inline-block',
      flexShrink: 0
    }
  }), conflictLabel, " \u2014 ", lang === 'pt' ? 'você já tem cobertura neste dia com outra pessoa' : lang === 'es' ? 'ya tienes cobertura este día con otra persona' : 'you already have coverage on this day with someone else'), conflictPending && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px',
      borderRadius: 12,
      marginBottom: 12,
      background: 'oklch(0.97 0.05 60)',
      border: '1.5px solid var(--pg-warn)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: 'oklch(0.38 0.14 60)',
      marginBottom: 6
    }
  }, "\u26A0\uFE0F ", lang === 'pt' ? 'Dia já confirmado!' : lang === 'es' ? '¡Día ya confirmado!' : 'Day already confirmed!'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'oklch(0.45 0.14 60)',
      lineHeight: 1.45,
      marginBottom: 12
    }
  }, lang === 'pt' ? `Você já tem os dias ${conflictPending.d} confirmados com ${conflictPending.owner}. Deseja mesmo continuar?` : lang === 'es' ? `Ya tienes el día ${conflictPending.d} confirmado con ${conflictPending.owner}. ¿Quieres continuar?` : `You already have day ${conflictPending.d} confirmed with ${conflictPending.owner}. Do you still want to apply?`), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setConflictPending(null),
    className: "pg-btn pg-btn-outline",
    style: {
      flex: 1,
      height: 36,
      fontSize: 13,
      borderRadius: 999
    }
  }, lang === 'pt' ? 'Cancelar' : lang === 'es' ? 'Cancelar' : 'Cancel'), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      commitToggle(conflictPending.d);
      setConflictPending(null);
    },
    style: {
      flex: 1,
      height: 36,
      fontSize: 13,
      fontWeight: 700,
      borderRadius: 999,
      background: 'var(--pg-warn)',
      color: '#fff',
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'inherit'
    }
  }, lang === 'pt' ? 'Continuar mesmo assim' : lang === 'es' ? 'Continuar de todos modos' : 'Continue anyway'))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 14px',
      borderRadius: 12,
      marginBottom: 12,
      background: selArr.length > 0 ? 'var(--pg-blue-50)' : 'var(--pg-ink-50)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--pg-ink-500)'
    }
  }, selArr.length > 0 ? `${selArr.length} ${lang === 'pt' ? 'dia(s) selecionado(s)' : lang === 'es' ? 'día(s) elegido(s)' : 'day(s) selected'}` : lang === 'pt' ? 'Nenhum dia selecionado' : lang === 'es' ? 'Ningún día seleccionado' : 'No days selected'), selArr.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--pg-font-display)',
      fontSize: 20,
      fontWeight: 700,
      color: 'var(--pg-blue-500)',
      letterSpacing: '-0.02em'
    }
  }, estLabel, " $", earnings.toLocaleString())), selArr.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--pg-ink-400)',
      textAlign: 'right'
    }
  }, /*#__PURE__*/React.createElement("div", null, selArr.sort((a, b) => a - b).join(', ')))), /*#__PURE__*/React.createElement("button", {
    disabled: selArr.length === 0,
    onClick: () => {
      setSubmitted(true);
      setTimeout(onSubmit, 1600);
    },
    className: "pg-btn pg-btn-primary",
    style: {
      width: '100%',
      height: 50,
      fontSize: 15,
      fontWeight: 700,
      borderRadius: 14,
      opacity: selArr.length === 0 ? 0.4 : 1
    }
  }, submitted ? lang === 'pt' ? 'Aplicação enviada ✓' : lang === 'es' ? 'Aplicación enviada ✓' : 'Application sent ✓' : selArr.length > 0 ? applyLabel : lang === 'pt' ? 'Selecione pelo menos 1 dia' : lang === 'es' ? 'Selecciona al menos 1 día' : 'Select at least 1 day')));
}

// ── My Jobs Panel ─────────────────────────────────────────────
function MyJobsPanel({
  t,
  lang,
  openJobDetail
}) {
  const [filter, setFilter] = React.useState('active');
  const statusConfig = {
    accepted: {
      label: lang === 'pt' ? 'Contratado' : lang === 'es' ? 'Contratado' : 'Hired',
      bg: 'var(--pg-blue-100)',
      color: 'var(--pg-blue-700)'
    },
    in_progress: {
      label: lang === 'pt' ? 'Em Andamento' : lang === 'es' ? 'En Progreso' : 'In Progress',
      bg: 'oklch(0.94 0.06 80)',
      color: 'oklch(0.48 0.18 80)'
    },
    completed: {
      label: lang === 'pt' ? 'Concluído' : lang === 'es' ? 'Completado' : 'Completed',
      bg: 'var(--pg-aqua-100)',
      color: 'var(--pg-aqua-700)'
    },
    paid: {
      label: lang === 'pt' ? 'Pago' : lang === 'es' ? 'Pagado' : 'Paid',
      bg: 'oklch(0.93 0.06 160)',
      color: 'oklch(0.40 0.16 160)'
    },
    pending: {
      label: lang === 'pt' ? 'Aguardando' : lang === 'es' ? 'Esperando' : 'Pending',
      bg: 'var(--pg-ink-100)',
      color: 'var(--pg-ink-600)'
    },
    rejected: {
      label: lang === 'pt' ? 'Rejeitado' : lang === 'es' ? 'Rechazado' : 'Rejected',
      bg: 'oklch(0.95 0.04 20)',
      color: 'oklch(0.45 0.18 20)'
    }
  };
  const isActive = s => ['accepted', 'in_progress'].includes(s);
  const filterTabs = [{
    id: 'active',
    label: lang === 'pt' ? 'Ativos' : lang === 'es' ? 'Activos' : 'Active',
    count: MY_APPLICATIONS.filter(a => isActive(a.status)).length
  }, {
    id: 'all',
    label: lang === 'pt' ? 'Todos' : lang === 'es' ? 'Todos' : 'All',
    count: MY_APPLICATIONS.length
  }];
  const shown = filter === 'active' ? MY_APPLICATIONS.filter(a => isActive(a.status)) : MY_APPLICATIONS;
  const typeIcons = {
    quickpool: (s, c) => Icon.bolt(s, c),
    vacation: (s, c) => Icon.cal(s, c),
    hiring: (s, c) => Icon.briefcase(s, c)
  };
  const emptyMsg = filter === 'active' ? lang === 'pt' ? 'Nenhuma candidatura ativa no momento' : lang === 'es' ? 'Sin postulaciones activas' : 'No active applications right now' : lang === 'pt' ? 'Nenhuma candidatura ainda' : lang === 'es' ? 'Sin postulaciones aún' : 'No applications yet';
  const tapHintLbl = lang === 'pt' ? 'Toque para ver detalhes' : lang === 'es' ? 'Toca para ver detalles' : 'Tap to view details';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, MY_APPLICATIONS.filter(a => isActive(a.status)).length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '11px 14px',
      borderRadius: 12,
      background: 'linear-gradient(110deg, var(--pg-blue-50), var(--pg-aqua-50))',
      border: '0.5px solid var(--pg-blue-200)',
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, Icon.bolt(14, 'var(--pg-blue-600)'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: 'var(--pg-blue-700)',
      fontWeight: 600
    }
  }, MY_APPLICATIONS.filter(a => isActive(a.status)).length, " ", lang === 'pt' ? 'trabalhos ativos — toque para gerenciar' : lang === 'es' ? 'trabajos activos — toca para gestionar' : 'active jobs — tap to manage')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 7
    }
  }, filterTabs.map(f => /*#__PURE__*/React.createElement("button", {
    key: f.id,
    onClick: () => setFilter(f.id),
    style: {
      padding: '7px 15px',
      borderRadius: 999,
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'inherit',
      fontSize: 13,
      fontWeight: 600,
      transition: 'all .12s',
      background: filter === f.id ? 'var(--pg-blue-500)' : 'var(--pg-ink-100)',
      color: filter === f.id ? '#fff' : 'var(--pg-ink-700)'
    }
  }, f.label, /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 5,
      fontSize: 11,
      fontWeight: 700,
      opacity: 0.85
    }
  }, f.count)))), shown.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '40px 20px',
      color: 'var(--pg-ink-400)',
      fontSize: 14
    }
  }, emptyMsg), shown.map(app => {
    const sc = statusConfig[app.status] || statusConfig.pending;
    const ic = typeIcons[app.type] || typeIcons.quickpool;
    const canTap = isActive(app.status) && !!openJobDetail;
    return /*#__PURE__*/React.createElement("article", {
      key: app.id,
      className: `pg-card${canTap ? ' pg-card-tap' : ''}`,
      style: {
        padding: '13px 14px',
        cursor: canTap ? 'pointer' : 'default'
      },
      onClick: canTap ? () => openJobDetail(app) : undefined
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: 11
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 42,
        height: 42,
        borderRadius: 11,
        flexShrink: 0,
        background: app.type === 'quickpool' ? 'var(--pg-aqua-100)' : 'var(--pg-blue-100)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, ic(18, app.type === 'quickpool' ? 'var(--pg-aqua-700)' : 'var(--pg-blue-700)')), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        flexWrap: 'wrap',
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 9.5,
        padding: '2px 8px',
        borderRadius: 6,
        fontWeight: 700,
        background: sc.bg,
        color: sc.color,
        letterSpacing: '0.02em'
      }
    }, sc.label)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13.5,
        fontWeight: 600,
        letterSpacing: '-0.01em',
        lineHeight: 1.3,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }
    }, tr(app.title, lang)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--pg-ink-500)',
        marginTop: 4,
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 600,
        color: 'var(--pg-ink-700)'
      }
    }, app.poster), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--pg-ink-300)'
      }
    }, "\xB7"), Icon.pin(11, 'var(--pg-ink-400)'), " ", app.loc)), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'right',
        flexShrink: 0
      }
    }, app.price ? /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--pg-font-display)',
        fontSize: 17,
        fontWeight: 700,
        color: 'var(--pg-blue-500)',
        letterSpacing: '-0.02em'
      }
    }, "$", app.price) : /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'var(--pg-ink-400)'
      }
    }, "\u2014"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10.5,
        color: 'var(--pg-ink-400)',
        marginTop: 2
      }
    }, app.when, " ", lang === 'en' ? 'ago' : 'atrás' || 'atrás'), canTap && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 5,
        display: 'flex',
        justifyContent: 'flex-end'
      }
    }, Icon.chev(14, 'var(--pg-blue-500)')))), canTap && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        paddingTop: 10,
        borderTop: '0.5px solid var(--pg-ink-100)',
        fontSize: 11.5,
        color: 'var(--pg-blue-600)',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: 5
      }
    }, Icon.bolt(12, 'var(--pg-blue-500)'), " ", tapHintLbl));
  }));
}

// ── Coverage Schedule Sheet ───────────────────────────────────
function ScheduleSheet({
  app,
  lang = 'en',
  onClose
}) {
  const [activeDayIdx, setActiveDayIdx] = React.useState(0);
  const [dayStatus, setDayStatus] = React.useState({});
  const [noPhotoHint, setNoPhotoHint] = React.useState(null); // pool index showing hint

  React.useEffect(() => {
    if (app) {
      setActiveDayIdx(0);
      setDayStatus({});
      setNoPhotoHint(null);
    }
  }, [app]);

  // ── All hooks must be called before any early return ──────────
  const wdFull = lang === 'pt' ? ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'] : lang === 'es' ? ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'] : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const wdShort = lang === 'pt' ? ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] : lang === 'es' ? ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = lang === 'pt' ? ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'] : lang === 'es' ? ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'] : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const photoLabels = lang === 'pt' ? ['Fachada', 'Antes', 'Depois'] : lang === 'es' ? ['Fachada', 'Antes', 'Después'] : ['Facade', 'Before', 'After'];
  const days = React.useMemo(() => {
    if (!app) return [];
    return (app.selectedDays || app.days || []).sort((a, b) => a - b).map(d => {
      const wd = app.yearMonth ? new Date(app.yearMonth.year, app.yearMonth.month, d).getDay() : 0;
      const pools = app.poolsByWeekday?.[wd] ?? app.poolsPerDay ?? 0;
      const addrs = (app.addresses?.[wd] || []).slice(0, pools);
      return {
        d,
        wd,
        pools,
        addrs,
        earnings: pools * (app.pricePerPool || 0)
      };
    });
  }, [app]);
  const totalPools = days.reduce((s, d) => s + d.pools, 0);
  const totalEarnings = days.reduce((s, d) => s + d.earnings, 0);
  const activeDay = days[activeDayIdx] || null;
  const getDoneCnt = day => day ? Object.values(dayStatus[day.wd] || {}).filter(p => p.done).length : 0;
  const completedPools = days.reduce((s, d) => s + getDoneCnt(d), 0);
  const progress = totalPools > 0 ? completedPools / totalPools : 0;
  const activeDoneCnt = getDoneCnt(activeDay);
  const activeAllDone = activeDay && activeDoneCnt === activeDay.pools && activeDay.pools > 0;

  // Set of pool indices done on the active day (for map markers)
  const activeDoneIndices = React.useMemo(() => {
    if (!activeDay) return new Set();
    return new Set(Object.entries(dayStatus[activeDay.wd] || {}).filter(([, p]) => p.done).map(([i]) => +i));
  }, [dayStatus, activeDay]);

  // ── Early return AFTER all hooks ──────────────────────────────
  if (!app) return null;
  const toggleDone = (wd, idx, photoCnt) => {
    const pSt = dayStatus[wd]?.[idx] || {};
    if (!pSt.done && photoCnt < 3) {
      // Block: show hint briefly
      setNoPhotoHint(idx);
      setTimeout(() => setNoPhotoHint(null), 2200);
      return;
    }
    setDayStatus(prev => {
      const d = prev[wd] || {};
      const p = d[idx] || {};
      return {
        ...prev,
        [wd]: {
          ...d,
          [idx]: {
            ...p,
            done: !p.done
          }
        }
      };
    });
  };
  const togglePhoto = (wd, pi, phi) => setDayStatus(prev => {
    const d = prev[wd] || {};
    const p = d[pi] || {};
    const photos = [...(p.photos || [null, null, null])];
    photos[phi] = photos[phi] ? null : 'ok';
    return {
      ...prev,
      [wd]: {
        ...d,
        [pi]: {
          ...p,
          photos
        }
      }
    };
  });
  const markAllDone = () => {
    if (!activeDay) return;
    const next = {
      ...(dayStatus[activeDay.wd] || {})
    };
    activeDay.addrs.forEach((_, i) => {
      const photos = dayStatus[activeDay.wd]?.[i]?.photos || [null, null, null];
      const photoCnt = photos.filter(Boolean).length;
      if (photoCnt >= 3) next[i] = {
        ...(next[i] || {}),
        done: true
      };
    });
    setDayStatus(p => ({
      ...p,
      [activeDay.wd]: next
    }));
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 48
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 18px 14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '0.5px solid var(--pg-ink-100)'
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
      padding: 0,
      fontFamily: 'inherit'
    }
  }, lang === 'pt' ? 'Fechar' : lang === 'es' ? 'Cerrar' : 'Close'), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontFamily: 'var(--pg-font-display)',
      fontSize: 17,
      fontWeight: 700,
      letterSpacing: '-0.01em'
    }
  }, lang === 'pt' ? 'Agenda de cobertura' : lang === 'es' ? 'Agenda de cobertura' : 'Coverage schedule'), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 50
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 18px 12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 14,
      padding: '14px 16px',
      background: 'linear-gradient(120deg, oklch(0.26 0.10 232) 0%, oklch(0.33 0.13 215) 100%)',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      right: -20,
      top: -20,
      width: 80,
      height: 80,
      borderRadius: '50%',
      background: 'oklch(0.85 0.15 90 / 0.10)',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: app.owner,
    size: 36
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700
    }
  }, app.owner), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      opacity: 0.70
    }
  }, app.region, " \xB7 ", tr(app.month, lang))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--pg-font-display)',
      fontSize: 22,
      fontWeight: 800,
      letterSpacing: '-0.02em',
      color: 'oklch(0.88 0.16 90)',
      lineHeight: 1
    }
  }, "$", totalEarnings.toLocaleString()), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      opacity: 0.65,
      marginTop: 1
    }
  }, totalPools, " ", lang === 'pt' ? 'piscinas' : lang === 'es' ? 'piscinas' : 'pools'))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      opacity: 0.75,
      marginBottom: 5,
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", null, lang === 'pt' ? 'Progresso' : lang === 'es' ? 'Progreso' : 'Progress'), /*#__PURE__*/React.createElement("span", null, completedPools, "/", totalPools, " ", lang === 'pt' ? 'feitas' : lang === 'es' ? 'hechas' : 'done')), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 7,
      borderRadius: 999,
      background: 'rgba(255,255,255,0.20)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      borderRadius: 999,
      background: 'oklch(0.88 0.16 90)',
      width: `${Math.round(progress * 100)}%`,
      transition: 'width .4s ease'
    }
  })))), /*#__PURE__*/React.createElement("div", {
    className: "pg-scroll-x",
    style: {
      display: 'flex',
      gap: 8,
      padding: '2px 18px 14px'
    }
  }, days.map((day, i) => {
    const done = getDoneCnt(day);
    const full = done === day.pools && day.pools > 0;
    const on = activeDayIdx === i;
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      onClick: () => setActiveDayIdx(i),
      style: {
        flexShrink: 0,
        minWidth: 62,
        padding: '8px 10px',
        borderRadius: 12,
        border: on ? 'none' : '0.5px solid var(--pg-ink-200)',
        background: on ? 'var(--pg-blue-500)' : full ? 'var(--pg-aqua-100)' : 'var(--pg-ink-100)',
        color: on ? '#fff' : full ? 'var(--pg-aqua-700)' : 'var(--pg-ink-700)',
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'all .12s ease',
        boxShadow: on ? '0 4px 12px oklch(0.58 0.16 235 / 0.30)' : 'none'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: '0.05em',
        opacity: .75,
        marginBottom: 2
      }
    }, wdShort[day.wd].toUpperCase()), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 20,
        fontWeight: 800,
        fontFamily: 'var(--pg-font-display)',
        lineHeight: 1,
        marginBottom: 2
      }
    }, day.d), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 9.5,
        fontWeight: 600
      }
    }, full ? '✓' : `${done}/${day.pools}🏊`));
  })), activeDay && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 18px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--pg-font-display)',
      fontSize: 17,
      fontWeight: 700,
      letterSpacing: '-0.01em'
    }
  }, wdFull[activeDay.wd]), app.yearMonth && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'var(--pg-ink-500)',
      marginLeft: 6
    }
  }, lang === 'pt' ? `${activeDay.d} de ${monthNames[app.yearMonth.month]}` : lang === 'es' ? `${activeDay.d} de ${monthNames[app.yearMonth.month]}` : `${monthNames[app.yearMonth.month]} ${activeDay.d}`)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--pg-font-display)',
      fontSize: 16,
      fontWeight: 700,
      color: 'var(--pg-blue-500)',
      letterSpacing: '-0.01em'
    }
  }, "$", activeDay.earnings.toLocaleString())), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--pg-ink-500)',
      marginBottom: 12
    }
  }, activeDay.pools, " ", lang === 'pt' ? 'piscinas' : lang === 'es' ? 'piscinas' : 'pools', " \xB7 $", app.pricePerPool, "/", lang === 'pt' ? 'piscina' : lang === 'es' ? 'piscina' : 'pool', activeDoneCnt > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 6,
      color: 'var(--pg-aqua-700)',
      fontWeight: 600
    }
  }, "\xB7 ", activeDoneCnt, "/", activeDay.pools, " ", lang === 'pt' ? 'feitas' : lang === 'es' ? 'hechas' : 'done')), activeDay.addrs.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 14,
      border: '0.5px solid var(--pg-ink-200)'
    }
  }, /*#__PURE__*/React.createElement(PoolRouteMap, {
    pools: activeDay.addrs,
    doneIndices: activeDoneIndices
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      marginBottom: 14
    }
  }, activeDay.addrs.length > 0 ? activeDay.addrs.map((pool, i) => {
    const pSt = dayStatus[activeDay.wd]?.[i] || {};
    const done = !!pSt.done;
    const photos = pSt.photos || [null, null, null];
    const photoCnt = photos.filter(Boolean).length;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "pg-card",
      style: {
        padding: '12px 14px',
        borderLeft: `3px solid ${done ? 'var(--pg-aqua-500)' : 'var(--pg-ink-200)'}`,
        opacity: done ? 0.8 : 1,
        transition: 'all .2s ease'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 28,
        height: 28,
        borderRadius: 8,
        flexShrink: 0,
        background: done ? 'var(--pg-aqua-500)' : 'var(--pg-blue-500)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 12,
        fontWeight: 700,
        transition: 'background .2s ease'
      }
    }, done ? '✓' : i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12.5,
        fontWeight: 600,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        textDecoration: done ? 'line-through' : 'none',
        color: done ? 'var(--pg-ink-400)' : 'var(--pg-ink-900)'
      }
    }, pool.addr), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10.5,
        color: 'var(--pg-ink-400)',
        marginTop: 1
      }
    }, "\uD83D\uDCF8 ", photoCnt, "/3 ", lang === 'pt' ? 'fotos' : lang === 'es' ? 'fotos' : 'photos')), /*#__PURE__*/React.createElement("button", {
      onClick: () => toggleDone(activeDay.wd, i, photoCnt),
      style: {
        width: 32,
        height: 32,
        borderRadius: 8,
        flexShrink: 0,
        border: done ? 'none' : !done && photoCnt < 3 ? '1.5px solid var(--pg-ink-150)' : '1.5px solid var(--pg-ink-200)',
        background: done ? 'var(--pg-aqua-500)' : !done && photoCnt < 3 ? 'var(--pg-ink-100)' : '#fff',
        color: done ? '#fff' : !done && photoCnt < 3 ? 'var(--pg-ink-300)' : 'var(--pg-ink-400)',
        cursor: !done && photoCnt < 3 ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 14,
        transition: 'all .15s ease'
      }
    }, done ? '✓' : '○')), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6
      }
    }, photoLabels.map((lbl, pi) => {
      const has = !!photos[pi];
      return /*#__PURE__*/React.createElement("button", {
        key: pi,
        onClick: () => togglePhoto(activeDay.wd, i, pi),
        style: {
          flex: 1,
          height: 58,
          borderRadius: 10,
          border: has ? 'none' : '1.5px dashed var(--pg-ink-200)',
          background: has ? 'linear-gradient(135deg, oklch(0.68 0.14 155 / 0.15), oklch(0.68 0.14 155 / 0.05))' : 'var(--pg-ink-50)',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          fontFamily: 'inherit',
          transition: 'all .15s ease'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 18
        }
      }, has ? '✅' : '📷'), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.03em',
          color: has ? 'var(--pg-aqua-700)' : 'var(--pg-ink-400)'
        }
      }, lbl.toUpperCase()));
    })), noPhotoHint === i && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 7,
        padding: '6px 10px',
        borderRadius: 8,
        background: 'oklch(0.97 0.05 30)',
        border: '1px solid oklch(0.85 0.12 30)',
        fontSize: 11.5,
        fontWeight: 600,
        color: 'oklch(0.45 0.16 30)',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        animation: 'fadeIn .15s ease'
      }
    }, "\uD83D\uDCF7 ", lang === 'pt' ? `Adicione as 3 fotos para concluir (${photoCnt}/3)` : lang === 'es' ? `Agrega las 3 fotos para completar (${photoCnt}/3)` : `Add all 3 photos to complete this pool (${photoCnt}/3)`));
  }) : Array.from({
    length: activeDay.pools
  }).map((_, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "pg-card",
    style: {
      padding: '12px 14px',
      opacity: 0.55
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 28,
      height: 28,
      borderRadius: 8,
      background: 'var(--pg-ink-200)',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 12,
      fontWeight: 700
    }
  }, i + 1), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 12,
      borderRadius: 4,
      background: 'var(--pg-ink-100)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: 'var(--pg-ink-400)'
    }
  }, lang === 'pt' ? 'Endereço pendente' : lang === 'es' ? 'Dirección pendiente' : 'Address pending'))))), /*#__PURE__*/React.createElement("button", {
    onClick: activeAllDone ? undefined : markAllDone,
    className: "pg-btn",
    style: {
      width: '100%',
      height: 48,
      fontSize: 14,
      borderRadius: 12,
      background: activeAllDone ? 'var(--pg-aqua-100)' : 'var(--pg-blue-500)',
      color: activeAllDone ? 'var(--pg-aqua-700)' : '#fff',
      cursor: activeAllDone ? 'default' : 'pointer',
      border: 'none'
    }
  }, activeAllDone ? lang === 'pt' ? '✓ Dia concluído!' : lang === 'es' ? '✓ ¡Día completado!' : '✓ Day complete!' : lang === 'pt' ? 'Marcar todas como concluídas' : lang === 'es' ? 'Marcar todas como completadas' : 'Mark all pools as done')));
}
Object.assign(window, {
  WorkScreen,
  ScheduleSheet
});