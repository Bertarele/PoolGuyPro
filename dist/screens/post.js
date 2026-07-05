// post.jsx — Quick Pool creation form (3 steps)
// Each pool is its own entry with its own location, type, and access details.

function PostQuickPool({
  onClose,
  onSubmit,
  lang = 'en',
  initialData = null
}) {
  const t = STRINGS[lang];
  const isEdit = !!initialData;
  const [step, setStep] = React.useState(1);
  const newPool = id => ({
    id,
    location: '',
    poolType: 'street',
    gateCode: false,
    gateCodeVal: '',
    doorman: false,
    dog: false,
    saltwater: false
  });
  const [form, setForm] = React.useState(() => {
    if (initialData) {
      return {
        title: initialData.title || '',
        notes: initialData.description || '',
        pools: [{
          id: 1,
          location: initialData.city || '',
          poolType: initialData.pool_type || 'street',
          gateCode: !!initialData.extras?.gate_code,
          gateCodeVal: initialData.extras?.gate_code || '',
          doorman: initialData.extras?.doorman || false,
          dog: initialData.extras?.dog || false,
          saltwater: initialData.extras?.saltwater || false
        }],
        priceMode: initialData.price_negotiable ? 'neg' : 'fixed',
        price: initialData.price_per_pool ? String(initialData.price_per_pool) : '0',
        date: lang === 'pt' ? 'Agora' : lang === 'es' ? 'Ahora' : 'Now',
        showPhone: !!initialData.poster_phone,
        phone: initialData.poster_phone || '',
        pool_address: initialData.pool_address || '',
        pool_zip: '',
        requiredPhotos: initialData.required_photos || [],
        customPhotoText: ''
      };
    }
    return {
      title: '',
      notes: '',
      pools: [newPool(1)],
      priceMode: 'fixed',
      price: '0',
      date: lang === 'pt' ? 'Agora' : lang === 'es' ? 'Ahora' : 'Now',
      showPhone: false,
      phone: '',
      pool_address: '',
      pool_zip: '',
      requiredPhotos: [],
      customPhotoText: ''
    };
  });
  const PHOTO_OPTS = [{
    key: 'before',
    pt: 'Foto antes',
    en: 'Before photo'
  }, {
    key: 'after',
    pt: 'Foto depois',
    en: 'After photo'
  }, {
    key: 'vacuum',
    pt: 'Foto vacum',
    en: 'Vacuum photo'
  }, {
    key: 'chemical',
    pt: 'Foto químico',
    en: 'Chemical photo'
  }];
  const togglePhoto = key => {
    const cur = form.requiredPhotos;
    upd('requiredPhotos', cur.includes(key) ? cur.filter(k => k !== key) : [...cur, key]);
  };
  const addCustomPhoto = () => {
    const txt = (form.customPhotoText || '').trim();
    if (!txt) return;
    const key = 'custom:' + txt;
    if (!form.requiredPhotos.includes(key)) upd('requiredPhotos', [...form.requiredPhotos, key]);
    upd('customPhotoText', '');
  };
  const fmtPhone = val => {
    const d = val.replace(/\D/g, '').slice(0, 10);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  };
  const upd = (k, v) => setForm(f => ({
    ...f,
    [k]: v
  }));
  const updPool = (id, patch) => setForm(f => ({
    ...f,
    pools: f.pools.map(p => p.id === id ? {
      ...p,
      ...patch
    } : p)
  }));
  const addPool = () => setForm(f => ({
    ...f,
    pools: [...f.pools, newPool((f.pools.at(-1)?.id || 0) + 1)]
  }));
  const removePool = id => setForm(f => ({
    ...f,
    pools: f.pools.length > 1 ? f.pools.filter(p => p.id !== id) : f.pools
  }));
  const nowLbl = lang === 'pt' ? 'Agora' : lang === 'es' ? 'Ahora' : 'Now';
  const dateOptions = [nowLbl, t.custom];
  const [customDT, setCustomDT] = React.useState('');
  const isCustom = form.date === t.custom;
  const lbl = {
    poolN: lang === 'pt' ? 'Piscina' : lang === 'es' ? 'Piscina' : 'Pool',
    step2Title: lang === 'pt' ? 'Onde fica a piscina?' : lang === 'es' ? '¿Dónde está la piscina?' : 'Where is the pool?',
    step2Sub: lang === 'pt' ? 'Informe a cidade e o tipo para notificar os piscineiros certos.' : lang === 'es' ? 'Indica la ciudad y el tipo para notificar a los técnicos correctos.' : 'Enter the city and type to notify the right pool guys.',
    pickLocation: lang === 'pt' ? 'Cidade da piscina' : lang === 'es' ? 'Ciudad de la piscina' : 'Pool city',
    pickType: lang === 'pt' ? 'Tipo' : lang === 'es' ? 'Tipo' : 'Type'
  };
  const [matchCount, setMatchCount] = React.useState(null);
  React.useEffect(() => {
    if (step !== 3) return;
    const city = form.pools[0]?.location;
    if (!city || !window.sb) {
      setMatchCount(null);
      return;
    }
    const dayIdx = isCustom && customDT ? new Date(customDT).getDay() : new Date().getDay();
    const dayKey = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][dayIdx];
    setMatchCount(null);
    window.sb.from('profiles_public').select('regions_by_day').then(({
      data
    }) => {
      const c = (data || []).filter(p => (p.regions_by_day?.[dayKey] || []).includes(city)).length;
      setMatchCount(c);
    });
  }, [step, form.pools, isCustom, customDT]);
  const canContinue = () => {
    if (step === 1) return form.title.trim().length > 0;
    if (step === 2) return form.pools.every(p => p.location.trim().length > 0);
    return true;
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 0 24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '4px 18px 16px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: step === 1 ? onClose : () => setStep(step - 1),
    style: {
      border: 'none',
      background: 'transparent',
      color: 'var(--pg-blue-500)',
      fontSize: 15,
      fontWeight: 600,
      cursor: 'pointer',
      padding: 0
    }
  }, step === 1 ? t.cancel : `← ${t.back}`), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--pg-ink-500)',
      fontWeight: 600
    }
  }, t.step, " ", step, " ", t.of, " 3"), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 60
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 18px'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontFamily: 'var(--pg-font-display)',
      fontSize: 22,
      fontWeight: 700,
      letterSpacing: '-0.02em'
    }
  }, step === 1 && t.pqStep1Title, step === 2 && lbl.step2Title, step === 3 && t.pqStep3Title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--pg-ink-500)',
      marginTop: 4
    }
  }, step === 1 && t.pqStep1Sub, step === 2 && lbl.step2Sub, step === 3 && t.pqStep3Sub), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      marginTop: 14
    }
  }, [1, 2, 3].map(i => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      flex: 1,
      height: 4,
      borderRadius: 2,
      background: i <= step ? 'var(--pg-blue-500)' : 'var(--pg-ink-200)',
      transition: 'background .2s ease'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18,
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, step === 1 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Field, {
    label: t.title
  }, /*#__PURE__*/React.createElement("input", {
    className: "pg-field",
    placeholder: t.titlePh,
    value: form.title,
    onChange: e => upd('title', e.target.value)
  })), /*#__PURE__*/React.createElement(Field, {
    label: t.notesOptional
  }, /*#__PURE__*/React.createElement("textarea", {
    className: "pg-textarea",
    placeholder: t.notesPh,
    value: form.notes,
    onChange: e => upd('notes', e.target.value)
  })), /*#__PURE__*/React.createElement(Field, {
    label: t.when
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, dateOptions.map(d => {
    const isNow = d === nowLbl;
    const on = form.date === d;
    return /*#__PURE__*/React.createElement("button", {
      key: d,
      onClick: () => upd('date', d),
      style: {
        flex: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: '11px 13px',
        borderRadius: 12,
        cursor: 'pointer',
        background: on ? isNow ? 'var(--pg-danger)' : 'var(--pg-blue-500)' : isNow ? 'oklch(0.96 0.05 25)' : 'var(--pg-ink-100)',
        color: on ? '#fff' : isNow ? 'var(--pg-danger)' : 'var(--pg-ink-700)',
        border: '1px solid ' + (on ? 'transparent' : isNow ? 'oklch(0.62 0.20 25 / 0.5)' : 'var(--pg-ink-200)'),
        fontSize: 14,
        fontWeight: 700,
        fontFamily: 'inherit'
      }
    }, isNow ? Icon.bolt(14, on ? '#fff' : 'var(--pg-danger)') : Icon.cal(14, on ? '#fff' : 'var(--pg-ink-500)'), d);
  })), isCustom && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "datetime-local",
    value: customDT,
    min: new Date().toISOString().slice(0, 16),
    onChange: e => setCustomDT(e.target.value),
    style: {
      width: '100%',
      height: 46,
      borderRadius: 11,
      border: '1.5px solid var(--pg-blue-500)',
      background: 'var(--pg-blue-50)',
      padding: '0 14px',
      fontSize: 16,
      fontFamily: 'inherit',
      color: 'var(--pg-ink-900)',
      outline: 'none',
      boxSizing: 'border-box'
    }
  }), customDT && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6,
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 12,
      color: 'var(--pg-ink-500)'
    }
  }, Icon.bell(12, 'var(--pg-aqua-500)'), /*#__PURE__*/React.createElement("span", null, lang === 'pt' ? 'Pool guys serão notificados às 7h do dia selecionado.' : lang === 'es' ? 'Los pool guys serán notificados a las 7 AM del día seleccionado.' : 'Pool guys will be notified at 7 AM on the selected day.'))))), step === 2 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, form.pools.map((p, idx) => /*#__PURE__*/React.createElement(PoolItemCard, {
    key: p.id,
    index: idx + 1,
    pool: p,
    onChange: patch => updPool(p.id, patch),
    onRemove: form.pools.length > 1 ? () => removePool(p.id) : null,
    lbl: lbl,
    t: t,
    lang: lang
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 14,
      border: '1px solid var(--pg-ink-200)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 16px',
      cursor: 'pointer'
    },
    onClick: () => upd('showPhone', !form.showPhone)
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      marginBottom: 2
    }
  }, lang === 'pt' ? 'Mostrar telefone ao candidato aceito?' : lang === 'es' ? '¿Mostrar teléfono al candidato aceptado?' : 'Show phone to accepted candidate?'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--pg-ink-500)'
    }
  }, lang === 'pt' ? 'Apenas quem você aceitar terá seu número.' : lang === 'es' ? 'Solo el candidato aceptado verá su número.' : 'Only the accepted candidate will see your number.')), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 44,
      height: 26,
      borderRadius: 999,
      flexShrink: 0,
      marginLeft: 12,
      background: form.showPhone ? 'var(--pg-blue-500)' : 'var(--pg-ink-300)',
      position: 'relative',
      transition: 'background .2s'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 3,
      left: form.showPhone ? 18 : 3,
      width: 20,
      height: 20,
      borderRadius: '50%',
      background: '#fff',
      transition: 'left .2s',
      boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
    }
  }))), form.showPhone && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px 14px',
      borderTop: '0.5px solid var(--pg-ink-200)'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: 'var(--pg-ink-500)',
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      display: 'block',
      margin: '12px 0 6px'
    }
  }, lang === 'pt' ? 'Seu telefone' : lang === 'es' ? 'Tu teléfono' : 'Your phone'), /*#__PURE__*/React.createElement("input", {
    className: "pg-field",
    value: form.phone,
    onChange: e => upd('phone', fmtPhone(e.target.value)),
    type: "tel",
    placeholder: "(954) 000-0000",
    inputMode: "numeric"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 14,
      border: '1px solid var(--pg-ink-200)',
      padding: '14px 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      marginBottom: 2
    }
  }, lang === 'pt' ? 'Endereço da piscina' : lang === 'es' ? 'Dirección de la piscina' : 'Pool address'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--pg-ink-500)',
      marginBottom: 10
    }
  }, lang === 'pt' ? 'Visível apenas para o candidato aceito. Opcional.' : lang === 'es' ? 'Visible solo al candidato aceptado. Opcional.' : 'Visible only to the accepted candidate. Optional.'), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("input", {
    className: "pg-field",
    value: form.pool_zip,
    onChange: e => upd('pool_zip', e.target.value.replace(/\D/g, '').slice(0, 5)),
    placeholder: "ZIP",
    inputMode: "numeric",
    style: {
      width: 90,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("input", {
    className: "pg-field",
    value: form.pool_address,
    onChange: e => upd('pool_address', e.target.value),
    placeholder: lang === 'pt' ? 'Ex: 123 Palm Ave, Davie' : 'E.g. 123 Palm Ave, Davie',
    style: {
      flex: 1
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 14,
      border: '1px solid var(--pg-ink-200)',
      padding: '14px 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      marginBottom: 2
    }
  }, lang === 'pt' ? 'Fotos obrigatórias' : lang === 'es' ? 'Fotos obligatorias' : 'Required photos'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--pg-ink-500)',
      marginBottom: 12
    }
  }, lang === 'pt' ? 'O pool guy deverá tirar essas fotos antes de finalizar.' : lang === 'es' ? 'El pool guy deberá tomar estas fotos antes de finalizar.' : 'The pool guy must take these photos before completing the job.'), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, PHOTO_OPTS.map(opt => {
    const sel = form.requiredPhotos.includes(opt.key);
    return /*#__PURE__*/React.createElement("button", {
      key: opt.key,
      onClick: () => togglePhoto(opt.key),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 12px',
        borderRadius: 10,
        border: sel ? '1.5px solid var(--pg-blue-500)' : '1px solid var(--pg-ink-200)',
        background: sel ? 'var(--pg-blue-50)' : 'transparent',
        cursor: 'pointer',
        textAlign: 'left'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 20,
        height: 20,
        borderRadius: 6,
        flexShrink: 0,
        border: sel ? 'none' : '1.5px solid var(--pg-ink-300)',
        background: sel ? 'var(--pg-blue-500)' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, sel && /*#__PURE__*/React.createElement("svg", {
      width: "12",
      height: "12",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "#fff",
      strokeWidth: "3",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("polyline", {
      points: "20 6 9 17 4 12"
    }))), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 500,
        color: sel ? 'var(--pg-blue-700)' : 'var(--pg-ink-700)'
      }
    }, lang === 'pt' ? opt.pt : opt.en));
  }), form.requiredPhotos.filter(k => k.startsWith('custom:')).map(k => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '10px 12px',
      borderRadius: 10,
      border: '1.5px solid var(--pg-blue-500)',
      background: 'var(--pg-blue-50)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 20,
      height: 20,
      borderRadius: 6,
      background: 'var(--pg-blue-500)',
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
    stroke: "#fff",
    strokeWidth: "3",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "20 6 9 17 4 12"
  }))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      color: 'var(--pg-blue-700)',
      flex: 1
    }
  }, k.slice(7)), /*#__PURE__*/React.createElement("button", {
    onClick: () => upd('requiredPhotos', form.requiredPhotos.filter(x => x !== k)),
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: 2,
      color: 'var(--pg-ink-400)',
      fontSize: 16,
      lineHeight: 1
    }
  }, "\u2715"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginTop: 2
    }
  }, /*#__PURE__*/React.createElement("input", {
    className: "pg-field",
    value: form.customPhotoText,
    onChange: e => upd('customPhotoText', e.target.value),
    onKeyDown: e => e.key === 'Enter' && addCustomPhoto(),
    placeholder: lang === 'pt' ? 'Outro (ex: foto do filtro)' : lang === 'es' ? 'Otro (ej: foto del filtro)' : 'Other (e.g. filter photo)',
    style: {
      flex: 1,
      height: 38,
      fontSize: 13
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: addCustomPhoto,
    disabled: !form.customPhotoText.trim(),
    style: {
      height: 38,
      padding: '0 14px',
      borderRadius: 10,
      border: 'none',
      cursor: 'pointer',
      background: 'var(--pg-blue-500)',
      color: '#fff',
      fontSize: 13,
      fontWeight: 700,
      opacity: form.customPhotoText.trim() ? 1 : 0.4
    }
  }, "+"))))), step === 3 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Field, {
    label: t.priceQ
  }, /*#__PURE__*/React.createElement("div", {
    className: "pg-seg"
  }, /*#__PURE__*/React.createElement("button", {
    className: `pg-seg-btn ${form.priceMode === 'fixed' ? 'on' : ''}`,
    onClick: () => upd('priceMode', 'fixed')
  }, t.fixedPrice), /*#__PURE__*/React.createElement("button", {
    className: `pg-seg-btn ${form.priceMode === 'neg' ? 'on' : ''}`,
    onClick: () => upd('priceMode', 'neg')
  }, t.priceNeg))), form.priceMode === 'fixed' && /*#__PURE__*/React.createElement(Field, {
    label: t.pricePerPool
  }, /*#__PURE__*/React.createElement("div", {
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
    value: form.price,
    onChange: e => upd('price', e.target.value.replace(/[^0-9]/g, '')),
    inputMode: "numeric",
    pattern: "[0-9]*",
    style: {
      height: 64,
      paddingLeft: 36,
      fontSize: 30,
      fontWeight: 700,
      color: 'var(--pg-blue-500)',
      letterSpacing: '-0.02em',
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
  }, t.perPool))), /*#__PURE__*/React.createElement("div", {
    className: "pg-card",
    style: {
      padding: 14,
      background: 'var(--pg-blue-50)',
      border: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--pg-blue-700)',
      fontWeight: 700,
      letterSpacing: '0.05em',
      marginBottom: 8
    }
  }, t.summary), /*#__PURE__*/React.createElement(SummaryRow, {
    label: t.sumTitle,
    value: form.title || '—'
  }), /*#__PURE__*/React.createElement(SummaryRow, {
    label: t.sumWhen,
    value: form.date
  }), /*#__PURE__*/React.createElement(SummaryRow, {
    label: t.sumPrice,
    value: form.priceMode === 'fixed' ? `$${form.price}/${lang === 'en' ? 'pool' : 'piscina'}` : t.negotiable
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      paddingTop: 10,
      borderTop: '0.5px solid var(--pg-blue-100)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      color: 'var(--pg-blue-700)',
      letterSpacing: '0.06em',
      marginBottom: 6
    }
  }, (lang === 'pt' ? 'Piscinas neste anúncio' : lang === 'es' ? 'Piscinas en este anuncio' : 'Pools in this listing').toUpperCase()), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, form.pools.map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: p.id,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '7px 9px',
      background: 'var(--pg-white)',
      borderRadius: 9
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
      fontSize: 11,
      fontWeight: 700,
      fontFamily: 'var(--pg-font-display)'
    }
  }, i + 1), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      fontSize: 12.5,
      fontWeight: 600,
      color: 'var(--pg-ink-900)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, Icon.pin(11, 'var(--pg-ink-500)'), " ", p.location || '—'), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      padding: '2px 7px',
      borderRadius: 6,
      background: p.poolType === 'condo' ? 'var(--pg-aqua-100)' : 'var(--pg-blue-100)',
      color: p.poolType === 'condo' ? 'var(--pg-aqua-700)' : 'var(--pg-blue-700)',
      letterSpacing: '0.03em',
      flexShrink: 0
    }
  }, p.poolType === 'condo' ? t.condominium : t.streetHouse))))), form.priceMode === 'fixed' && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      paddingTop: 10,
      borderTop: '0.5px solid var(--pg-blue-100)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: 'var(--pg-ink-900)'
    }
  }, t.totalBudget), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--pg-font-display)',
      fontSize: 18,
      fontWeight: 700,
      color: 'var(--pg-blue-500)',
      letterSpacing: '-0.02em'
    }
  }, "$", (parseInt(form.price || 0) * form.pools.length).toLocaleString()))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '10px 12px',
      background: 'var(--pg-aqua-100)',
      borderRadius: 12
    }
  }, Icon.shield(16, 'var(--pg-aqua-700)'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--pg-aqua-700)',
      lineHeight: 1.4
    }
  }, matchCount === null ? lang === 'pt' ? 'Calculando…' : 'Calculating…' : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("b", null, matchCount), " ", t.matchNotice)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 18px 8px',
      position: 'sticky',
      bottom: 0,
      background: 'var(--pg-white)',
      borderTop: '0.5px solid var(--pg-ink-200)'
    }
  }, step < 3 ? /*#__PURE__*/React.createElement("button", {
    onClick: () => setStep(step + 1),
    disabled: !canContinue(),
    className: "pg-btn pg-btn-primary",
    style: {
      width: '100%',
      height: 52,
      fontSize: 16,
      opacity: canContinue() ? 1 : 0.45
    }
  }, t.continueBtn, " ", Icon.arrow(16, '#fff')) : /*#__PURE__*/React.createElement("button", {
    onClick: () => onSubmit({
      ...form,
      scheduled_for: isCustom && customDT ? customDT : null
    }),
    className: "pg-btn pg-btn-aqua",
    style: {
      width: '100%',
      height: 52,
      fontSize: 16
    }
  }, isEdit ? /*#__PURE__*/React.createElement(React.Fragment, null, Icon.check(18, 'var(--pg-blue-900)'), " ", lang === 'pt' ? 'Salvar alterações' : lang === 'es' ? 'Guardar cambios' : 'Save changes') : /*#__PURE__*/React.createElement(React.Fragment, null, Icon.bolt(18, 'var(--pg-blue-900)'), " ", t.postQuickBtn))));
}

// ── Per-pool item card ────────────────────────────────────────
function PoolItemCard({
  index,
  pool,
  onChange,
  onRemove,
  lbl,
  t,
  lang
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "pg-card",
    style: {
      padding: '14px 14px 12px',
      border: '0.5px solid var(--pg-ink-200)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20
    }
  }, "\uD83C\uDFCA"), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      flex: 1,
      fontFamily: 'var(--pg-font-display)',
      fontSize: 15,
      fontWeight: 700,
      letterSpacing: '-0.01em',
      color: 'var(--pg-ink-900)'
    }
  }, lang === 'pt' ? 'Detalhes da piscina' : lang === 'es' ? 'Detalles de la piscina' : 'Pool details')), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      fontWeight: 600,
      color: 'var(--pg-ink-700)',
      marginBottom: 6
    }
  }, lbl.pickLocation), /*#__PURE__*/React.createElement(SingleLocationField, {
    value: pool.location,
    onChange: v => onChange({
      location: v
    }),
    lang: lang
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      fontWeight: 600,
      color: 'var(--pg-ink-700)',
      marginBottom: 6
    }
  }, lbl.pickType), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 8
    }
  }, [{
    id: 'street',
    label: t.streetHouse,
    emoji: '🏠'
  }, {
    id: 'condo',
    label: t.condominium,
    emoji: '🏢'
  }].map(o => {
    const on = pool.poolType === o.id;
    return /*#__PURE__*/React.createElement("button", {
      key: o.id,
      onClick: () => onChange({
        poolType: o.id
      }),
      style: {
        padding: '10px 10px',
        borderRadius: 10,
        cursor: 'pointer',
        background: on ? 'var(--pg-blue-50)' : 'var(--pg-white)',
        border: '1px solid ' + (on ? 'var(--pg-blue-500)' : 'var(--pg-ink-200)'),
        textAlign: 'left',
        fontFamily: 'inherit',
        display: 'flex',
        alignItems: 'center',
        gap: 9
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18
      }
    }, o.emoji), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12.5,
        fontWeight: 600,
        color: on ? 'var(--pg-blue-700)' : 'var(--pg-ink-900)'
      }
    }, o.label));
  }))), pool.poolType === 'street' && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 2,
      padding: '4px 12px 8px',
      borderRadius: 11,
      background: 'var(--pg-blue-50)',
      border: '0.5px solid var(--pg-blue-100)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: 'var(--pg-blue-700)',
      fontWeight: 700,
      letterSpacing: '0.06em',
      marginTop: 8
    }
  }, lang === 'pt' ? 'INFORMAÇÕES DA CASA' : lang === 'es' ? 'INFO DEL HOGAR' : 'HOME INFO'), /*#__PURE__*/React.createElement(ToggleRow, {
    icon: Icon.dog(15, 'var(--pg-ink-700)'),
    label: t.hasDog,
    on: pool.dog,
    setOn: v => onChange({
      dog: v
    })
  }), /*#__PURE__*/React.createElement(ToggleRow, {
    icon: Icon.pool(15, 'var(--pg-ink-700)'),
    label: lang === 'pt' ? 'Piscina de sal' : lang === 'es' ? 'Piscina de sal' : 'Salt pool',
    on: pool.saltwater,
    setOn: v => onChange({
      saltwater: v
    })
  })), pool.poolType === 'condo' && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 2,
      padding: '4px 12px 8px',
      borderRadius: 11,
      background: 'var(--pg-aqua-100)',
      border: '0.5px solid var(--pg-aqua-400)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: 'var(--pg-aqua-700)',
      fontWeight: 700,
      letterSpacing: '0.06em',
      marginTop: 8
    }
  }, t.condoAccess), /*#__PURE__*/React.createElement(ToggleRow, {
    icon: Icon.key(15, 'var(--pg-ink-700)'),
    label: t.gateCodeReq,
    on: pool.gateCode,
    setOn: v => onChange({
      gateCode: v
    })
  }), pool.gateCode && /*#__PURE__*/React.createElement("input", {
    className: "pg-field",
    placeholder: "e.g. 8472*",
    value: pool.gateCodeVal,
    onChange: e => onChange({
      gateCodeVal: e.target.value
    }),
    style: {
      marginTop: 4,
      height: 38,
      fontSize: 13
    }
  }), /*#__PURE__*/React.createElement(ToggleRow, {
    icon: Icon.user(15, 'var(--pg-ink-700)'),
    label: t.hasDoorman,
    on: pool.doorman,
    setOn: v => onChange({
      doorman: v
    })
  }), /*#__PURE__*/React.createElement(ToggleRow, {
    icon: Icon.dog(15, 'var(--pg-ink-700)'),
    label: t.hasDog,
    on: pool.dog,
    setOn: v => onChange({
      dog: v
    })
  }), /*#__PURE__*/React.createElement(ToggleRow, {
    icon: Icon.pool(15, 'var(--pg-ink-700)'),
    label: lang === 'pt' ? 'Piscina de sal' : lang === 'es' ? 'Piscina de sal' : 'Salt pool',
    on: pool.saltwater,
    setOn: v => onChange({
      saltwater: v
    })
  })));
}

// ── Single-city autocomplete (used per pool) ─────────────────
function SingleLocationField({
  value,
  onChange,
  lang
}) {
  const [q, setQ] = React.useState(value || '');
  const [focused, setFocused] = React.useState(false);
  React.useEffect(() => {
    setQ(value || '');
  }, [value]);
  const allCities = React.useMemo(() => {
    const out = [];
    Object.entries(FL_COUNTIES).forEach(([county, cities]) => {
      cities.forEach(city => out.push({
        city,
        county
      }));
    });
    return out;
  }, []);
  const matches = q.trim().length >= 1 ? allCities.filter(c => c.city.toLowerCase() !== (value || '').toLowerCase()).filter(c => c.city.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 5) : [];
  const pick = city => {
    onChange(city);
    setQ(city);
    setFocused(false);
  };
  const clear = () => {
    onChange('');
    setQ('');
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, value && q === value ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '10px 12px',
      background: 'var(--pg-aqua-100)',
      border: '1px solid var(--pg-aqua-400)',
      borderRadius: 11,
      minHeight: 46
    }
  }, Icon.pin(14, 'var(--pg-aqua-700)'), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 13.5,
      fontWeight: 600,
      color: 'var(--pg-aqua-700)'
    }
  }, value), /*#__PURE__*/React.createElement("button", {
    onClick: clear,
    style: {
      border: 'none',
      background: 'rgba(255,255,255,0.6)',
      cursor: 'pointer',
      width: 24,
      height: 24,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, Icon.x(12, 'var(--pg-aqua-700)'))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("input", {
    className: "pg-field",
    placeholder: lang === 'pt' ? 'Digite a cidade…' : lang === 'es' ? 'Escribe la ciudad…' : 'Type the city…',
    value: q,
    onChange: e => setQ(e.target.value),
    onFocus: () => setFocused(true),
    onBlur: () => setTimeout(() => setFocused(false), 180),
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
  }, Icon.search(15, 'var(--pg-ink-500)')), focused && matches.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 'calc(100% + 4px)',
      left: 0,
      right: 0,
      zIndex: 20,
      background: 'var(--pg-white)',
      borderRadius: 12,
      padding: 6,
      border: '0.5px solid var(--pg-ink-200)',
      boxShadow: '0 8px 24px rgba(15, 30, 60, 0.12)'
    }
  }, matches.map(m => /*#__PURE__*/React.createElement("button", {
    key: m.city,
    onMouseDown: e => {
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
  }, m.county))))));
}
function Field({
  label,
  children
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--pg-ink-700)',
      marginBottom: 7
    }
  }, label), children);
}
function ToggleRow({
  icon,
  label,
  on,
  setOn
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 28,
      height: 28,
      borderRadius: 7,
      background: 'rgba(255,255,255,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, icon), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      fontSize: 13.5,
      fontWeight: 500,
      color: 'var(--pg-ink-900)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    className: `pg-toggle ${on ? 'on' : ''}`,
    onClick: () => setOn(!on)
  }));
}
function SummaryRow({
  label,
  value
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '4px 0',
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--pg-ink-500)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      color: 'var(--pg-ink-900)',
      maxWidth: '60%',
      textAlign: 'right'
    }
  }, value));
}
Object.assign(window, {
  PostQuickPool
});