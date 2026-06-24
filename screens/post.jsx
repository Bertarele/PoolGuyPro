// post.jsx — Quick Pool creation form (3 steps)
// Each pool is its own entry with its own location, type, and access details.

function PostQuickPool({ onClose, onSubmit, lang='en' }) {
  const t = STRINGS[lang];
  const [step, setStep] = React.useState(1);

  const newPool = (id) => ({
    id,
    location: '',
    poolType: 'street',
    gateCode: false,
    gateCodeVal: '',
    doorman: false,
    dog: false,
    saltwater: false,
  });

  const [form, setForm] = React.useState({
    title:'',
    notes:'',
    pools: [newPool(1)],
    priceMode:'fixed', price:'45',
    date: lang==='pt'?'Agora':lang==='es'?'Ahora':'Now',
    showPhone: false,
    phone: '',
    pool_address: '',
    pool_zip: '',
  });

  const fmtPhone = (val) => {
    const d = val.replace(/\D/g,'').slice(0,10);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `(${d.slice(0,3)}) ${d.slice(3)}`;
    return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  };
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const updPool = (id, patch) => setForm(f => ({
    ...f,
    pools: f.pools.map(p => p.id === id ? { ...p, ...patch } : p),
  }));
  const addPool = () => setForm(f => ({
    ...f,
    pools: [...f.pools, newPool((f.pools.at(-1)?.id || 0) + 1)],
  }));
  const removePool = (id) => setForm(f => ({
    ...f,
    pools: f.pools.length > 1 ? f.pools.filter(p => p.id !== id) : f.pools,
  }));

  const nowLbl   = lang==='pt'?'Agora':lang==='es'?'Ahora':'Now';
  const dateOptions = [nowLbl, t.custom];
  const [customDT, setCustomDT] = React.useState('');
  const isCustom = form.date === t.custom;

  const lbl = {
    poolN: lang==='pt'?'Piscina':lang==='es'?'Piscina':'Pool',
    step2Title: lang==='pt'?'Onde fica a piscina?':lang==='es'?'¿Dónde está la piscina?':'Where is the pool?',
    step2Sub: lang==='pt'?'Informe a cidade e o tipo para notificar os piscineiros certos.':lang==='es'?'Indica la ciudad y el tipo para notificar a los técnicos correctos.':'Enter the city and type to notify the right pool guys.',
    pickLocation: lang==='pt'?'Cidade da piscina':lang==='es'?'Ciudad de la piscina':'Pool city',
    pickType: lang==='pt'?'Tipo':lang==='es'?'Tipo':'Type',
  };

  const [matchCount, setMatchCount] = React.useState(null);
  React.useEffect(() => {
    if (step !== 3) return;
    const city = form.pools[0]?.location;
    if (!city || !window.sb) { setMatchCount(null); return; }
    const dayIdx = isCustom && customDT ? new Date(customDT).getDay() : new Date().getDay();
    const dayKey = ['sun','mon','tue','wed','thu','fri','sat'][dayIdx];
    setMatchCount(null);
    window.sb.from('profiles').select('regions_by_day').then(({ data }) => {
      const c = (data || []).filter(p => (p.regions_by_day?.[dayKey] || []).includes(city)).length;
      setMatchCount(c);
    });
  }, [step, form.pools, isCustom, customDT]);

  const canContinue = () => {
    if (step === 1) return form.title.trim().length > 0;
    if (step === 2) return form.pools.every(p => p.location.trim().length > 0);
    return true;
  };

  return (
    <div style={{padding:'8px 0 24px'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'4px 18px 16px'}}>
        <button onClick={step===1?onClose:()=>setStep(step-1)} style={{
          border:'none', background:'transparent', color:'var(--pg-blue-500)',
          fontSize:15, fontWeight:600, cursor:'pointer', padding:0,
        }}>{step===1 ? t.cancel : `← ${t.back}`}</button>
        <div style={{fontSize:13, color:'var(--pg-ink-500)', fontWeight:600}}>{t.step} {step} {t.of} 3</div>
        <div style={{width:60}}/>
      </div>

      <div style={{padding:'0 18px'}}>
        <h2 style={{margin:0, fontFamily:'var(--pg-font-display)', fontSize:22, fontWeight:700, letterSpacing:'-0.02em'}}>
          {step===1 && t.pqStep1Title}
          {step===2 && lbl.step2Title}
          {step===3 && t.pqStep3Title}
        </h2>
        <div style={{fontSize:13, color:'var(--pg-ink-500)', marginTop:4}}>
          {step===1 && t.pqStep1Sub}
          {step===2 && lbl.step2Sub}
          {step===3 && t.pqStep3Sub}
        </div>

        <div style={{display:'flex', gap:6, marginTop:14}}>
          {[1,2,3].map(i => (
            <div key={i} style={{
              flex:1, height:4, borderRadius:2,
              background: i<=step ? 'var(--pg-blue-500)' : 'var(--pg-ink-200)',
              transition:'background .2s ease',
            }}/>
          ))}
        </div>

        <div style={{marginTop:18, display:'flex', flexDirection:'column', gap:16}}>
          {step === 1 && (
            <>
              <Field label={t.title}>
                <input className="pg-field" placeholder={t.titlePh}
                  value={form.title} onChange={e=>upd('title',e.target.value)}/>
              </Field>
              <Field label={t.notesOptional}>
                <textarea className="pg-textarea"
                  placeholder={t.notesPh}
                  value={form.notes} onChange={e=>upd('notes',e.target.value)}/>
              </Field>

              {/* When */}
              <Field label={t.when}>
                <div style={{display:'flex', gap:8}}>
                  {dateOptions.map(d => {
                    const isNow = d === nowLbl;
                    const on = form.date === d;
                    return (
                      <button key={d} onClick={()=>upd('date',d)} style={{
                        flex:1, display:'inline-flex', alignItems:'center', justifyContent:'center', gap:6,
                        padding:'11px 13px', borderRadius:12, cursor:'pointer',
                        background: on
                          ? (isNow ? 'var(--pg-danger)' : 'var(--pg-blue-500)')
                          : (isNow ? 'oklch(0.96 0.05 25)' : 'var(--pg-ink-100)'),
                        color: on ? '#fff' : (isNow ? 'var(--pg-danger)' : 'var(--pg-ink-700)'),
                        border:'1px solid ' + (on ? 'transparent' : (isNow ? 'oklch(0.62 0.20 25 / 0.5)' : 'var(--pg-ink-200)')),
                        fontSize:14, fontWeight:700, fontFamily:'inherit',
                      }}>
                        {isNow ? Icon.bolt(14, on?'#fff':'var(--pg-danger)') : Icon.cal(14, on?'#fff':'var(--pg-ink-500)')}
                        {d}
                      </button>
                    );
                  })}
                </div>
                {isCustom && (
                  <div style={{marginTop:10}}>
                    <input
                      type="datetime-local"
                      value={customDT}
                      min={new Date().toISOString().slice(0,16)}
                      onChange={e=>setCustomDT(e.target.value)}
                      style={{
                        width:'100%', height:46, borderRadius:11, border:'1.5px solid var(--pg-blue-500)',
                        background:'var(--pg-blue-50)', padding:'0 14px', fontSize:16,
                        fontFamily:'inherit', color:'var(--pg-ink-900)', outline:'none',
                        boxSizing:'border-box',
                      }}
                    />
                    {customDT && (
                      <div style={{marginTop:6, display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--pg-ink-500)'}}>
                        {Icon.bell(12,'var(--pg-aqua-500)')}
                        <span>
                          {lang==='pt'
                            ? 'Pool guys serão notificados às 7h do dia selecionado.'
                            : lang==='es'
                            ? 'Los pool guys serán notificados a las 7 AM del día seleccionado.'
                            : 'Pool guys will be notified at 7 AM on the selected day.'}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </Field>
            </>
          )}

          {step === 2 && (
            <>
              <div style={{display:'flex', flexDirection:'column', gap:14}}>
                {form.pools.map((p, idx) => (
                  <PoolItemCard
                    key={p.id}
                    index={idx + 1}
                    pool={p}
                    onChange={(patch)=>updPool(p.id, patch)}
                    onRemove={form.pools.length > 1 ? ()=>removePool(p.id) : null}
                    lbl={lbl}
                    t={t}
                    lang={lang}
                  />
                ))}
              </div>

              {/* Phone toggle */}
              <div style={{borderRadius:14, border:'1px solid var(--pg-ink-200)', overflow:'hidden'}}>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', cursor:'pointer'}}
                  onClick={()=>upd('showPhone', !form.showPhone)}>
                  <div>
                    <div style={{fontSize:13, fontWeight:700, marginBottom:2}}>
                      {lang==='pt'?'Mostrar telefone ao candidato aceito?':lang==='es'?'¿Mostrar teléfono al candidato aceptado?':'Show phone to accepted candidate?'}
                    </div>
                    <div style={{fontSize:11, color:'var(--pg-ink-500)'}}>
                      {lang==='pt'?'Apenas quem você aceitar terá seu número.':lang==='es'?'Solo el candidato aceptado verá su número.':'Only the accepted candidate will see your number.'}
                    </div>
                  </div>
                  <div style={{
                    width:44, height:26, borderRadius:999, flexShrink:0, marginLeft:12,
                    background: form.showPhone ? 'var(--pg-blue-500)' : 'var(--pg-ink-300)',
                    position:'relative', transition:'background .2s',
                  }}>
                    <div style={{
                      position:'absolute', top:3, left: form.showPhone ? 18 : 3, width:20, height:20,
                      borderRadius:'50%', background:'#fff', transition:'left .2s',
                      boxShadow:'0 1px 4px rgba(0,0,0,0.2)',
                    }}/>
                  </div>
                </div>
                {form.showPhone && (
                  <div style={{padding:'0 16px 14px', borderTop:'0.5px solid var(--pg-ink-200)'}}>
                    <label style={{fontSize:11, fontWeight:700, color:'var(--pg-ink-500)', letterSpacing:'0.04em', textTransform:'uppercase', display:'block', margin:'12px 0 6px'}}>
                      {lang==='pt'?'Seu telefone':lang==='es'?'Tu teléfono':'Your phone'}
                    </label>
                    <input className="pg-field" value={form.phone}
                      onChange={e=>upd('phone', fmtPhone(e.target.value))}
                      type="tel" placeholder="(954) 000-0000" inputMode="numeric"/>
                  </div>
                )}
              </div>

              {/* Pool address */}
              <div style={{borderRadius:14, border:'1px solid var(--pg-ink-200)', padding:'14px 16px'}}>
                <div style={{fontSize:13, fontWeight:700, marginBottom:2}}>
                  {lang==='pt'?'Endereço da piscina':lang==='es'?'Dirección de la piscina':'Pool address'}
                </div>
                <div style={{fontSize:11, color:'var(--pg-ink-500)', marginBottom:10}}>
                  {lang==='pt'?'Visível apenas para o candidato aceito. Opcional.':lang==='es'?'Visible solo al candidato aceptado. Opcional.':'Visible only to the accepted candidate. Optional.'}
                </div>
                <div style={{display:'flex', gap:8}}>
                  <input className="pg-field" value={form.pool_zip}
                    onChange={e=>upd('pool_zip', e.target.value.replace(/\D/g,'').slice(0,5))}
                    placeholder="ZIP" inputMode="numeric"
                    style={{width:90, flexShrink:0}}/>
                  <input className="pg-field" value={form.pool_address} onChange={e=>upd('pool_address',e.target.value)}
                    placeholder={lang==='pt'?'Ex: 123 Palm Ave, Davie':'E.g. 123 Palm Ave, Davie'}
                    style={{flex:1}}/>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <Field label={t.priceQ}>
                <div className="pg-seg">
                  <button className={`pg-seg-btn ${form.priceMode==='fixed'?'on':''}`} onClick={()=>upd('priceMode','fixed')}>{t.fixedPrice}</button>
                  <button className={`pg-seg-btn ${form.priceMode==='neg'?'on':''}`} onClick={()=>upd('priceMode','neg')}>{t.priceNeg}</button>
                </div>
              </Field>

              {form.priceMode === 'fixed' && (
                <Field label={t.pricePerPool}>
                  <div style={{position:'relative'}}>
                    <span style={{position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', fontSize:22, fontWeight:700, color:'var(--pg-blue-500)', fontFamily:'var(--pg-font-display)'}}>$</span>
                    <input className="pg-field" value={form.price} onChange={e=>upd('price', e.target.value.replace(/[^0-9]/g,''))}
                      inputMode="numeric" pattern="[0-9]*"
                      style={{height:64, paddingLeft:36, fontSize:30, fontWeight:700, color:'var(--pg-blue-500)', letterSpacing:'-0.02em', fontFamily:'var(--pg-font-display)'}}/>
                    <span style={{position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', fontSize:13, color:'var(--pg-ink-500)'}}>{t.perPool}</span>
                  </div>
                </Field>
              )}

              <div className="pg-card" style={{padding:14, background:'var(--pg-blue-50)', border:'none'}}>
                <div style={{fontSize:11, color:'var(--pg-blue-700)', fontWeight:700, letterSpacing:'0.05em', marginBottom:8}}>{t.summary}</div>
                <SummaryRow label={t.sumTitle}  value={form.title || '—'}/>
                <SummaryRow label={t.sumWhen}   value={form.date}/>
                <SummaryRow label={t.sumPrice}  value={form.priceMode==='fixed' ? `$${form.price}/${lang==='en'?'pool':'piscina'}` : t.negotiable}/>

                {/* Per-pool breakdown */}
                <div style={{marginTop:10, paddingTop:10, borderTop:'0.5px solid var(--pg-blue-100)'}}>
                  <div style={{fontSize:10, fontWeight:700, color:'var(--pg-blue-700)', letterSpacing:'0.06em', marginBottom:6}}>
                    {(lang==='pt'?'Piscinas neste anúncio':lang==='es'?'Piscinas en este anuncio':'Pools in this listing').toUpperCase()}
                  </div>
                  <div style={{display:'flex', flexDirection:'column', gap:6}}>
                    {form.pools.map((p, i) => (
                      <div key={p.id} style={{
                        display:'flex', alignItems:'center', gap:8, padding:'7px 9px',
                        background:'var(--pg-white)', borderRadius:9,
                      }}>
                        <div style={{
                          width:22, height:22, borderRadius:6, flexShrink:0,
                          background:'var(--pg-blue-500)', color:'#fff',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize:11, fontWeight:700, fontFamily:'var(--pg-font-display)',
                        }}>{i+1}</div>
                        <div style={{flex:1, minWidth:0, display:'flex', alignItems:'center', gap:5, fontSize:12.5, fontWeight:600, color:'var(--pg-ink-900)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                          {Icon.pin(11, 'var(--pg-ink-500)')} {p.location || '—'}
                        </div>
                        <span style={{
                          fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:6,
                          background: p.poolType==='condo' ? 'var(--pg-aqua-100)' : 'var(--pg-blue-100)',
                          color: p.poolType==='condo' ? 'var(--pg-aqua-700)' : 'var(--pg-blue-700)',
                          letterSpacing:'0.03em', flexShrink:0,
                        }}>{p.poolType==='condo' ? t.condominium : t.streetHouse}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {form.priceMode==='fixed' && (
                  <div style={{
                    marginTop:10, paddingTop:10, borderTop:'0.5px solid var(--pg-blue-100)',
                    display:'flex', justifyContent:'space-between', alignItems:'center',
                  }}>
                    <span style={{fontSize:13, fontWeight:700, color:'var(--pg-ink-900)'}}>{t.totalBudget}</span>
                    <span style={{fontFamily:'var(--pg-font-display)', fontSize:18, fontWeight:700, color:'var(--pg-blue-500)', letterSpacing:'-0.02em'}}>
                      ${(parseInt(form.price||0) * form.pools.length).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <div style={{display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:'var(--pg-aqua-100)', borderRadius:12}}>
                {Icon.shield(16, 'var(--pg-aqua-700)')}
                <div style={{fontSize:12, color:'var(--pg-aqua-700)', lineHeight:1.4}}>
                  {matchCount === null
                    ? (lang==='pt'?'Calculando…':'Calculating…')
                    : <><b>{matchCount}</b> {t.matchNotice}</>}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{padding:'18px 18px 8px', position:'sticky', bottom:0, background:'var(--pg-white)', borderTop:'0.5px solid var(--pg-ink-200)'}}>
        {step < 3 ? (
          <button onClick={()=>setStep(step+1)} disabled={!canContinue()} className="pg-btn pg-btn-primary"
            style={{width:'100%', height:52, fontSize:16, opacity: canContinue() ? 1 : 0.45}}>
            {t.continueBtn} {Icon.arrow(16, '#fff')}
          </button>
        ) : (
          <button onClick={()=>onSubmit({ ...form, scheduled_for: isCustom && customDT ? customDT : null })} className="pg-btn pg-btn-aqua" style={{width:'100%', height:52, fontSize:16}}>
            {Icon.bolt(18, 'var(--pg-blue-900)')} {t.postQuickBtn}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Per-pool item card ────────────────────────────────────────
function PoolItemCard({ index, pool, onChange, onRemove, lbl, t, lang }) {
  return (
    <div className="pg-card" style={{padding:'14px 14px 12px', border:'0.5px solid var(--pg-ink-200)'}}>
      {/* Header */}
      <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:12}}>
        <div style={{fontSize:20}}>🏊</div>
        <h3 style={{margin:0, flex:1, fontFamily:'var(--pg-font-display)', fontSize:15, fontWeight:700, letterSpacing:'-0.01em', color:'var(--pg-ink-900)'}}>
          {lang==='pt' ? 'Detalhes da piscina' : lang==='es' ? 'Detalles de la piscina' : 'Pool details'}
        </h3>
      </div>

      {/* Location */}
      <div style={{marginBottom:12}}>
        <div style={{fontSize:11.5, fontWeight:600, color:'var(--pg-ink-700)', marginBottom:6}}>{lbl.pickLocation}</div>
        <SingleLocationField
          value={pool.location}
          onChange={(v)=>onChange({location: v})}
          lang={lang}
        />
      </div>

      {/* Type */}
      <div style={{marginBottom:10}}>
        <div style={{fontSize:11.5, fontWeight:600, color:'var(--pg-ink-700)', marginBottom:6}}>{lbl.pickType}</div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
          {[
            { id:'street', label:t.streetHouse, emoji:'🏠' },
            { id:'condo',  label:t.condominium, emoji:'🏢' },
          ].map(o => {
            const on = pool.poolType === o.id;
            return (
              <button key={o.id} onClick={()=>onChange({poolType: o.id})} style={{
                padding:'10px 10px', borderRadius:10, cursor:'pointer',
                background: on ? 'var(--pg-blue-50)' : 'var(--pg-white)',
                border:'1px solid ' + (on ? 'var(--pg-blue-500)' : 'var(--pg-ink-200)'),
                textAlign:'left', fontFamily:'inherit',
                display:'flex', alignItems:'center', gap:9,
              }}>
                <span style={{fontSize:18}}>{o.emoji}</span>
                <span style={{fontSize:12.5, fontWeight:600, color: on ? 'var(--pg-blue-700)' : 'var(--pg-ink-900)'}}>{o.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Street / house */}
      {pool.poolType === 'street' && (
        <div style={{
          marginTop:2, padding:'4px 12px 8px', borderRadius:11,
          background:'var(--pg-blue-50)', border:'0.5px solid var(--pg-blue-100)',
        }}>
          <div style={{fontSize:10, color:'var(--pg-blue-700)', fontWeight:700, letterSpacing:'0.06em', marginTop:8}}>
            {lang==='pt'?'INFORMAÇÕES DA CASA':lang==='es'?'INFO DEL HOGAR':'HOME INFO'}
          </div>
          <ToggleRow icon={Icon.dog(15, 'var(--pg-ink-700)')} label={t.hasDog}
            on={pool.dog} setOn={v=>onChange({dog: v})}/>
          <ToggleRow icon={Icon.pool(15, 'var(--pg-ink-700)')} label={lang==='pt'?'Piscina de sal':lang==='es'?'Piscina de sal':'Salt pool'}
            on={pool.saltwater} setOn={v=>onChange({saltwater: v})}/>
        </div>
      )}

      {/* Condo access details */}
      {pool.poolType === 'condo' && (
        <div style={{
          marginTop:2, padding:'4px 12px 8px', borderRadius:11,
          background:'var(--pg-aqua-100)', border:'0.5px solid var(--pg-aqua-400)',
        }}>
          <div style={{fontSize:10, color:'var(--pg-aqua-700)', fontWeight:700, letterSpacing:'0.06em', marginTop:8}}>
            {t.condoAccess}
          </div>
          <ToggleRow icon={Icon.key(15, 'var(--pg-ink-700)')} label={t.gateCodeReq}
            on={pool.gateCode} setOn={v=>onChange({gateCode: v})}/>
          {pool.gateCode && (
            <input className="pg-field" placeholder="e.g. 8472*"
              value={pool.gateCodeVal} onChange={e=>onChange({gateCodeVal: e.target.value})}
              style={{marginTop:4, height:38, fontSize:13}}/>
          )}
          <ToggleRow icon={Icon.user(15, 'var(--pg-ink-700)')} label={t.hasDoorman}
            on={pool.doorman} setOn={v=>onChange({doorman: v})}/>
          <ToggleRow icon={Icon.dog(15, 'var(--pg-ink-700)')} label={t.hasDog}
            on={pool.dog} setOn={v=>onChange({dog: v})}/>
          <ToggleRow icon={Icon.pool(15, 'var(--pg-ink-700)')} label={lang==='pt'?'Piscina de sal':lang==='es'?'Piscina de sal':'Salt pool'}
            on={pool.saltwater} setOn={v=>onChange({saltwater: v})}/>
        </div>
      )}
    </div>
  );
}

// ── Single-city autocomplete (used per pool) ─────────────────
function SingleLocationField({ value, onChange, lang }) {
  const [q, setQ] = React.useState(value || '');
  const [focused, setFocused] = React.useState(false);

  React.useEffect(()=>{ setQ(value || ''); }, [value]);

  const allCities = React.useMemo(() => {
    const out = [];
    Object.entries(FL_COUNTIES).forEach(([county, cities]) => {
      cities.forEach(city => out.push({ city, county }));
    });
    return out;
  }, []);

  const matches = q.trim().length >= 1
    ? allCities
        .filter(c => c.city.toLowerCase() !== (value || '').toLowerCase())
        .filter(c => c.city.toLowerCase().includes(q.trim().toLowerCase()))
        .slice(0, 5)
    : [];

  const pick = (city) => { onChange(city); setQ(city); setFocused(false); };
  const clear = () => { onChange(''); setQ(''); };

  return (
    <div style={{position:'relative'}}>
      {value && q === value ? (
        <div style={{
          display:'flex', alignItems:'center', gap:8, padding:'10px 12px',
          background:'var(--pg-aqua-100)', border:'1px solid var(--pg-aqua-400)',
          borderRadius:11, minHeight:46,
        }}>
          {Icon.pin(14, 'var(--pg-aqua-700)')}
          <span style={{flex:1, fontSize:13.5, fontWeight:600, color:'var(--pg-aqua-700)'}}>{value}</span>
          <button onClick={clear} style={{
            border:'none', background:'rgba(255,255,255,0.6)', cursor:'pointer',
            width:24, height:24, borderRadius:'50%',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>{Icon.x(12, 'var(--pg-aqua-700)')}</button>
        </div>
      ) : (
        <>
          <input className="pg-field"
            placeholder={lang==='pt'?'Digite a cidade…':lang==='es'?'Escribe la ciudad…':'Type the city…'}
            value={q} onChange={e=>setQ(e.target.value)}
            onFocus={()=>setFocused(true)}
            onBlur={()=>setTimeout(()=>setFocused(false), 180)}
            style={{paddingLeft:38, height:44, fontSize:14}}/>
          <span style={{position:'absolute', left:12, top:22, transform:'translateY(-50%)'}}>
            {Icon.search(15, 'var(--pg-ink-500)')}
          </span>
          {focused && matches.length > 0 && (
            <div style={{
              position:'absolute', top:'calc(100% + 4px)', left:0, right:0, zIndex:20,
              background:'var(--pg-white)', borderRadius:12, padding:6,
              border:'0.5px solid var(--pg-ink-200)',
              boxShadow:'0 8px 24px rgba(15, 30, 60, 0.12)',
            }}>
              {matches.map(m => (
                <button key={m.city} onMouseDown={(e)=>{e.preventDefault(); pick(m.city);}} style={{
                  width:'100%', textAlign:'left', padding:'9px 10px', border:'none', background:'transparent',
                  cursor:'pointer', borderRadius:8, display:'flex', alignItems:'center', gap:8,
                  fontFamily:'inherit', fontSize:13.5,
                }} onMouseEnter={e=>e.currentTarget.style.background='var(--pg-blue-50)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  {Icon.pin(13, 'var(--pg-blue-500)')}
                  <span style={{flex:1, color:'var(--pg-ink-900)', fontWeight:500}}>{m.city}</span>
                  <span style={{fontSize:11, color:'var(--pg-ink-500)'}}>{m.county}</span>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div style={{fontSize:12, fontWeight:600, color:'var(--pg-ink-700)', marginBottom:7}}>{label}</div>
      {children}
    </div>
  );
}

function ToggleRow({ icon, label, on, setOn }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:10, padding:'8px 0'}}>
      <div style={{
        width:28, height:28, borderRadius:7, background:'rgba(255,255,255,0.6)',
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>{icon}</div>
      <div style={{flex:1, fontSize:13.5, fontWeight:500, color:'var(--pg-ink-900)'}}>{label}</div>
      <div className={`pg-toggle ${on?'on':''}`} onClick={()=>setOn(!on)}/>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'4px 0', fontSize:13}}>
      <span style={{color:'var(--pg-ink-500)'}}>{label}</span>
      <span style={{fontWeight:600, color:'var(--pg-ink-900)', maxWidth:'60%', textAlign:'right'}}>{value}</span>
    </div>
  );
}

Object.assign(window, { PostQuickPool });
