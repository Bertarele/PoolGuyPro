// marketplace.jsx — navy header + dual seg + distance + categories

// ── Locale-aware number/price formatter ──────────────────────
// PT/ES use "." as thousands sep; EN uses ","
function fmtN(n, lang) {
  const s = Number(n||0).toLocaleString('en-US');
  return lang === 'en' ? s : s.replace(/,/g, '.');
}

// ── Time ago helper ──────────────────────────────────────────
function timeAgo(iso, lang='en') {
  if (!iso) return '';
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60)    return lang==='pt' ? 'agora'        : lang==='es' ? 'ahora'     : 'just now';
  if (diff < 3600)  { const m=Math.floor(diff/60);   return lang==='pt'?`${m}min`  :lang==='es'?`${m}min`  :`${m}m ago`; }
  if (diff < 86400) { const h=Math.floor(diff/3600);  return lang==='pt'?`${h}h`    :lang==='es'?`${h}h`    :`${h}h ago`; }
  if (diff < 604800){ const d=Math.floor(diff/86400); return lang==='pt'?`${d}d`    :lang==='es'?`${d}d`    :`${d}d ago`; }
  const w=Math.floor(diff/604800); return lang==='pt'?`${w}sem`:lang==='es'?`${w}sem`:`${w}w ago`;
}

// ── Boost (paid listing highlight) ────────────────────────────
// NOTE: prices are placeholders — final values TBD, easy to tweak here.
const BOOST_PLANS = [
  { days: 3,  price: 4.99  },
  { days: 7,  price: 8.99  },
  { days: 14, price: 14.99 },
];

function BoostListingSheet({ item, lang, onClose, onBoosted, showToast }) {
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
    const { error } = await window.sb.from('marketplace').update({ boosted_until: until }).eq('id', item._id);
    setBuying(false);
    if (error) { showToast && showToast('❌ ' + error.message); return; }
    showToast && showToast(lang==='pt' ? '🚀 Anúncio destacado!' : lang==='es' ? '🚀 ¡Anuncio destacado!' : '🚀 Listing boosted!');
    onBoosted && onBoosted(until);
    onClose && onClose();
  };

  return (
    <div style={{padding:'20px 18px 36px'}}>
      <div style={{width:40,height:4,borderRadius:2,background:'var(--pg-ink-200)',margin:'-6px auto 20px'}}/>
      <div style={{fontSize:18,fontWeight:800,color:'var(--pg-ink-900)',fontFamily:'var(--pg-font-display)',marginBottom:4}}>
        🚀 {lang==='pt' ? 'Destacar anúncio' : lang==='es' ? 'Destacar anuncio' : 'Boost listing'}
      </div>
      <div style={{fontSize:13,color:'var(--pg-ink-500)',marginBottom:20,lineHeight:1.5}}>
        {lang==='pt'
          ? `Coloque "${item.name}" na seção de Destaques da tela inicial para mais visibilidade.`
          : lang==='es'
          ? `Coloca "${item.name}" en la sección de Destacados de la pantalla principal para más visibilidad.`
          : `Get "${item.name}" placed in the Featured Listings section on Home for extra visibility.`}
      </div>

      {alreadyBoosted && (
        <div style={{marginBottom:16,padding:'11px 14px',borderRadius:12,
          background:'rgba(14,186,199,0.10)',border:'1.5px solid rgba(14,186,199,0.35)',
          fontSize:12.5,color:'#0EBAC7',fontWeight:600}}>
          {lang==='pt'
            ? `Já está destacado até ${new Date(item.boostedUntil).toLocaleDateString('pt-BR')}. Comprar de novo estende o prazo.`
            : lang==='es'
            ? `Ya está destacado hasta ${new Date(item.boostedUntil).toLocaleDateString('es-ES')}. Comprar de nuevo extiende el plazo.`
            : `Already boosted until ${new Date(item.boostedUntil).toLocaleDateString('en-US')}. Buying again extends it.`}
        </div>
      )}

      <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:20}}>
        {BOOST_PLANS.map((pl, i) => (
          <button key={pl.days} onClick={()=>setPlanIdx(i)} style={{
            padding:'14px 16px', borderRadius:12,
            border: '1.5px solid ' + (planIdx===i ? '#0EBAC7' : 'var(--pg-ink-200)'),
            background: planIdx===i ? 'rgba(14,186,199,0.08)' : 'var(--pg-white)',
            display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer',
            fontFamily:'inherit', textAlign:'left', transition:'all .12s',
          }}>
            <span style={{fontSize:14,fontWeight:700,color:'var(--pg-ink-900)'}}>
              {pl.days} {lang==='pt'?'dias':lang==='es'?'días':'days'}
            </span>
            <span style={{display:'flex',alignItems:'center',gap:10}}>
              <span style={{fontSize:15,fontWeight:800,color:'#0EBAC7'}}>${pl.price}</span>
              {planIdx===i && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0EBAC7" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
            </span>
          </button>
        ))}
      </div>

      <button onClick={handleBuy} disabled={buying} style={{
        width:'100%', padding:'15px', borderRadius:14, border:'none', cursor:'pointer',
        fontFamily:'inherit', fontSize:15, fontWeight:700, color:'#fff',
        background: 'linear-gradient(135deg,#0EBAC7,#0891A0)',
        opacity: buying ? 0.7 : 1, transition:'all .15s',
        display:'flex', alignItems:'center', justifyContent:'center', gap:8,
      }}>
        {buying ? '...' : (lang==='pt' ? `Destacar por $${plan.price}` : lang==='es' ? `Destacar por $${plan.price}` : `Boost for $${plan.price}`)}
      </button>
      <button onClick={onClose} style={{
        width:'100%', marginTop:10, padding:'12px', borderRadius:14, border:'none',
        cursor:'pointer', fontFamily:'inherit', fontSize:14, fontWeight:600,
        background:'var(--pg-ink-100)', color:'var(--pg-ink-600)',
      }}>
        {lang==='pt' ? 'Cancelar' : lang==='es' ? 'Cancelar' : 'Cancel'}
      </button>
    </div>
  );
}

// ── Share bottom sheet ───────────────────────────────────────
function ShareSheet({ item, lang, onClose, showToast }) {
  if (!item) return null;
  const listingUrl = item._id ? `https://poolguyx.com/?listing=${item._id}` : 'https://poolguyx.com';
  const txt = `${item.name}${item.priceMode==='neg'?' — Negotiable':item.price?` — $${item.price}`:''}  📍 ${item.loc||'Broward County, FL'}\n\nFind it on PoolGuyX 👉 ${listingUrl}`;
  const enc = encodeURIComponent(txt);
  const btn = (label, icon, href, color, onClick) => (
    <a href={href||'#'} onClick={onClick||(e=>{if(!href){e.preventDefault();}})}
      target={href?'_blank':undefined} rel="noreferrer"
      style={{display:'flex',flexDirection:'column',alignItems:'center',gap:7,textDecoration:'none',flex:1}}>
      <div style={{width:54,height:54,borderRadius:16,background:color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,boxShadow:'0 2px 8px rgba(0,0,0,0.12)'}}>
        {icon}
      </div>
      <span style={{fontSize:11,fontWeight:600,color:'var(--pg-ink-700)'}}>{label}</span>
    </a>
  );
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:8000,display:'flex',alignItems:'flex-end'}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{width:'100%',background:'var(--pg-white)',borderRadius:'22px 22px 0 0',padding:'20px 24px 40px',boxShadow:'0 -4px 32px rgba(0,0,0,0.15)'}}>
        <div style={{width:36,height:4,borderRadius:999,background:'var(--pg-ink-200)',margin:'0 auto 18px'}}/>
        <div style={{fontFamily:'var(--pg-font-display)',fontSize:16,fontWeight:700,color:'var(--pg-ink-900)',marginBottom:4}}>{lang==='pt'?'Compartilhar anúncio':lang==='es'?'Compartir anuncio':'Share listing'}</div>
        <div style={{fontSize:13,color:'var(--pg-ink-500)',marginBottom:20,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.name}</div>
        <div style={{display:'flex',gap:16,justifyContent:'center',marginBottom:20}}>
          {btn('WhatsApp','💬',`https://wa.me/?text=${enc}`,'#25D366')}
          {btn('SMS','📱',`sms:?body=${enc}`,'#5AC8FA')}
          {btn(lang==='pt'?'Copiar':lang==='es'?'Copiar':'Copy','📋',null,
            'var(--pg-ink-100)',
            (e)=>{ e.preventDefault(); navigator.clipboard&&navigator.clipboard.writeText(`${item.name} — ${listingUrl}`).then(()=>{ if(showToast) showToast('✓ '+(lang==='pt'?'Link copiado!':'Link copied!')); onClose(); }); }
          )}
        </div>
        <button onClick={onClose} style={{width:'100%',height:46,borderRadius:13,border:'1.5px solid var(--pg-ink-200)',background:'transparent',color:'var(--pg-ink-600)',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
          {lang==='pt'?'Cancelar':lang==='es'?'Cancelar':'Cancel'}
        </button>
      </div>
    </div>
  );
}

// ── Fullscreen Photo Viewer ───────────────────────────────────
function PhotoViewer({ photos, startIdx=0, onClose }) {
  const [idx, setIdx] = React.useState(startIdx);
  const prev = (e) => { e.stopPropagation(); setIdx(i => (i - 1 + photos.length) % photos.length); };
  const next = (e) => { e.stopPropagation(); setIdx(i => (i + 1) % photos.length); };

  // Fechar com ESC
  React.useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Travar scroll do body
  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, zIndex:9999,
      background:'rgba(0,0,0,0.96)',
      display:'flex', alignItems:'center', justifyContent:'center',
      flexDirection:'column',
    }}>
      {/* Barra superior */}
      <div onClick={e=>e.stopPropagation()} style={{
        position:'absolute', top:0, left:0, right:0,
        padding:'14px 18px', display:'flex', alignItems:'center', justifyContent:'space-between',
        background:'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)',
        zIndex:2,
      }}>
        <span style={{fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.70)'}}>
          {photos.length > 1 ? `${idx + 1} / ${photos.length}` : ''}
        </span>
        <button onClick={onClose} style={{
          width:36, height:36, borderRadius:'50%', border:'none', cursor:'pointer',
          background:'rgba(255,255,255,0.15)', color:'#fff',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:20, lineHeight:1,
        }}>×</button>
      </div>

      {/* Foto principal */}
      <img
        src={photos[idx]} alt=""
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth:'100%', maxHeight:'100%',
          objectFit:'contain', display:'block',
          userSelect:'none', borderRadius:4,
        }}
      />

      {/* Arrows (múltiplas fotos) */}
      {photos.length > 1 && (
        <>
          <button onClick={prev} style={{
            position:'absolute', left:12, top:'50%', transform:'translateY(-50%)',
            width:44, height:44, borderRadius:'50%', border:'none', cursor:'pointer',
            background:'rgba(255,255,255,0.15)', color:'#fff', fontSize:22,
            display:'flex', alignItems:'center', justifyContent:'center',
            backdropFilter:'blur(4px)',
          }}>‹</button>
          <button onClick={next} style={{
            position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
            width:44, height:44, borderRadius:'50%', border:'none', cursor:'pointer',
            background:'rgba(255,255,255,0.15)', color:'#fff', fontSize:22,
            display:'flex', alignItems:'center', justifyContent:'center',
            backdropFilter:'blur(4px)',
          }}>›</button>
        </>
      )}

      {/* Dots */}
      {photos.length > 1 && (
        <div onClick={e=>e.stopPropagation()} style={{
          position:'absolute', bottom:24, left:'50%', transform:'translateX(-50%)',
          display:'flex', gap:6,
        }}>
          {photos.map((_,i) => (
            <div key={i} onClick={()=>setIdx(i)} style={{
              width: i===idx ? 20 : 7, height:7, borderRadius:4, cursor:'pointer',
              background: i===idx ? '#fff' : 'rgba(255,255,255,0.35)',
              transition:'width .18s, background .18s',
            }}/>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Photo Carousel ────────────────────────────────────────────
function PhotoCarousel({ urls=[], fallbackCat='Tools', height=220 }) {
  const photos = urls.filter(Boolean);
  const [idx, setIdx] = React.useState(0);
  const [viewerOpen, setViewerOpen] = React.useState(false);
  const prev = (e) => { e.stopPropagation(); setIdx(i => (i - 1 + photos.length) % photos.length); };
  const next = (e) => { e.stopPropagation(); setIdx(i => (i + 1) % photos.length); };

  return (
    <>
      <div style={{position:'relative', height, background:'var(--pg-ink-200)', overflow:'hidden', flexShrink:0}}>
        {photos.length > 0
          ? <img
              src={photos[idx]} alt=""
              onClick={() => setViewerOpen(true)}
              style={{width:'100%', height:'100%', objectFit:'cover', display:'block', cursor:'zoom-in'}}
            />
          : <NoPhotoPlaceholder height={height}/>
        }
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(0,0,0,0.18) 0%,transparent 45%,rgba(0,0,0,0.25) 100%)',pointerEvents:'none'}}/>

        {/* Ícone de zoom (hint visual) */}
        {photos.length > 0 && (
          <div onClick={() => setViewerOpen(true)} style={{
            position:'absolute', bottom:10, right:10, zIndex:2,
            width:28, height:28, borderRadius:8, cursor:'zoom-in',
            background:'rgba(0,0,0,0.40)', backdropFilter:'blur(4px)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </div>
        )}

        {/* Arrows — only if multiple photos */}
        {photos.length > 1 && (
          <>
            <button onClick={prev} style={{
              position:'absolute', left:10, top:'50%', transform:'translateY(-50%)',
              width:32, height:32, borderRadius:'50%', border:'none', cursor:'pointer',
              background:'rgba(0,0,0,0.45)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
            }}>‹</button>
            <button onClick={next} style={{
              position:'absolute', right:10, top:'50%', transform:'translateY(-50%)',
              width:32, height:32, borderRadius:'50%', border:'none', cursor:'pointer',
              background:'rgba(0,0,0,0.45)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
            }}>›</button>
            {/* Dot indicators */}
            <div style={{position:'absolute', bottom:10, left:'50%', transform:'translateX(-50%)', display:'flex', gap:5}}>
              {photos.map((_,i) => (
                <div key={i} onClick={(e)=>{e.stopPropagation();setIdx(i);}} style={{
                  width: i===idx ? 18 : 6, height:6, borderRadius:3, cursor:'pointer',
                  background: i===idx ? '#fff' : 'rgba(255,255,255,0.5)',
                  transition:'width .2s, background .2s',
                }}/>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Fullscreen viewer */}
      {viewerOpen && photos.length > 0 && (
        <PhotoViewer
          photos={photos}
          startIdx={idx}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </>
  );
}

// ── Expiring listing prompt — "still available?" ──────────────────────────
function ExpiringListingPrompt({ item, lang, onClose, onRenew, onNotAvailable }) {
  if (!item) return null;
  return (
    <Sheet open={!!item} onClose={onClose} height="auto">
      <div style={{padding:'20px 18px 32px'}}>
        <div style={{width:40,height:4,borderRadius:2,background:'var(--pg-ink-200)',margin:'-6px auto 20px'}}/>
        <div style={{fontSize:18,fontWeight:800,color:'var(--pg-ink-900)',fontFamily:'var(--pg-font-display)',marginBottom:6}}>
          ⏳ {lang==='pt'?'Seu anúncio expira em breve':lang==='es'?'Tu anuncio expira pronto':'Your listing expires soon'}
        </div>
        <div style={{fontSize:13,color:'var(--pg-ink-500)',marginBottom:20,lineHeight:1.4}}>
          {lang==='pt'
            ? `"${item.name}" ainda está disponível?`
            : lang==='es'
              ? `¿"${item.name}" sigue disponible?`
              : `Is "${item.name}" still available?`}
        </div>
        <button onClick={()=>onRenew(item)} style={{
          width:'100%', padding:'15px', borderRadius:14, border:'none', cursor:'pointer',
          fontFamily:'inherit', fontSize:15, fontWeight:700, color:'#fff',
          background:'linear-gradient(135deg,#16A34A,#15803D)', marginBottom:10,
        }}>
          ✓ {lang==='pt'?'Sim, renovar por 30 dias':lang==='es'?'Sí, renovar por 30 días':'Yes, renew for 30 more days'}
        </button>
        <button onClick={onNotAvailable} style={{
          width:'100%', padding:'13px', borderRadius:14, border:'1px solid var(--pg-ink-200)',
          cursor:'pointer', fontFamily:'inherit', fontSize:14, fontWeight:600,
          background:'var(--pg-ink-50)', color:'var(--pg-ink-600)',
        }}>
          {lang==='pt'?'Não está mais disponível':lang==='es'?'Ya no está disponible':'Not available anymore'}
        </button>
      </div>
    </Sheet>
  );
}

// ── Mark as Sold Sheet ───────────────────────────────────────────────────────
function MarkSoldSheet({ item, lang, currentUser, onClose, onSold, onSkip, showToast }) {
  const [contacts,    setContacts]   = React.useState([]);
  const [loading,     setLoading]    = React.useState(true);
  const [selected,    setSelected]   = React.useState(null);
  const [confirming,  setConfirming] = React.useState(false);

  React.useEffect(() => {
    if (!window.sb || !currentUser?.uid) { setLoading(false); return; }
    window.sb.from('conversations')
      .select('id,participant_1,participant_2,name_1,name_2')
      .or(`participant_1.eq.${currentUser.uid},participant_2.eq.${currentUser.uid}`)
      .order('last_message_at', { ascending: false })
      .then(({ data }) => {
        if (!data) { setLoading(false); return; }
        const seen = new Set();
        const mapped = data.reduce((acc, c) => {
          const amP1 = c.participant_1 === currentUser.uid;
          const id   = amP1 ? c.participant_2 : c.participant_1;
          const name = amP1 ? (c.name_2 || '?') : (c.name_1 || '?');
          if (id && id !== currentUser.uid && !seen.has(id)) { seen.add(id); acc.push({ id, name }); }
          return acc;
        }, []);
        setContacts(mapped);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [currentUser]);

  const handleConfirm = async () => {
    if (!selected || !window.sb || !currentUser?.uid) return;
    setConfirming(true);
    try {
      // Update listing status (silently succeeds even if already sold — idempotent)
      const { error: e1 } = await window.sb.from('marketplace')
        .update({ status: 'sold', buyer_id: selected.id, sold_at: new Date().toISOString() })
        .eq('id', item._id);
      if (e1) throw e1;

      // Guard: check if ratings already exist for this listing to prevent duplicates on retry
      const { data: existing } = await window.sb.from('ratings')
        .select('id, from_id, pending')
        .eq('listing_id', item._id)
        .limit(10);

      const hasSellerRating = (existing || []).some(r => r.from_id === currentUser.uid);
      if (!hasSellerRating) {
        // First time: insert pending ratings for both parties
        await window.sb.from('ratings').insert([
          { listing_id: item._id, listing_name: item.name || '',
            from_id: currentUser.uid, from_name: currentUser.name || currentUser.email || '',
            to_id: selected.id, stars: null, comment: '', pending: true },
          { listing_id: item._id, listing_name: item.name || '',
            from_id: selected.id, from_name: selected.name,
            to_id: currentUser.uid, stars: null, comment: '', pending: true },
        ]);
      }
      // If ratings already exist (retry case), skip insert — just fetch the existing one

      // Fetch the seller's own placeholder rating, only if not yet submitted (stars still
      // null) — `pending` stays true even after submitting (it means "still in the 7-day
      // blind window"), so checking it here would wrongly reopen an already-submitted rating.
      const { data: myRatings } = await window.sb.from('ratings')
        .select('*')
        .eq('listing_id', item._id)
        .eq('from_id', currentUser.uid)
        .or('stars.is.null')
        .limit(1);

      const sellerRating = myRatings?.[0] || null;

      showToast && showToast('✅ ' + (lang==='pt'
        ? 'Vendido! Avalie o comprador agora.'
        : 'Sold! Rate the buyer now.'));

      // Notify buyer that their purchase was confirmed
      if (selected?.id && window.sendPush) {
        window.sendPush(
          selected.id,
          lang==='pt' ? '✅ Compra confirmada!' : '✅ Purchase confirmed!',
          lang==='pt'
            ? `O vendedor confirmou a venda de "${item.name||''}"`
            : `The seller confirmed the sale of "${item.name||''}"`,
          '/#market',
          'market'
        );
      }

      onSold && onSold(sellerRating);
    } catch(e) {
      showToast && showToast('❌ ' + (e.message || 'Error'));
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div style={{padding:'20px 18px 36px'}}>
      <div style={{width:40,height:4,borderRadius:2,background:'var(--pg-ink-200)',margin:'-6px auto 20px'}}/>
      <div style={{fontSize:18,fontWeight:800,color:'var(--pg-ink-900)',fontFamily:'var(--pg-font-display)',marginBottom:4}}>
        🤝 {lang==='pt' ? 'Marcar como vendido' : 'Mark as Sold'}
      </div>
      <div style={{fontSize:13,color:'var(--pg-ink-500)',marginBottom:6}}>
        {lang==='pt' ? `Quem comprou "${item.name}"?` : `Who bought "${item.name}"?`}
      </div>
      <div style={{fontSize:12,color:'var(--pg-ink-400)',marginBottom:20}}>
        {lang==='pt'
          ? '⭐ Ambos receberão um pedido de avaliação após confirmação.'
          : '⭐ Both parties will be asked to rate each other after confirmation.'}
      </div>

      {loading ? (
        <div style={{textAlign:'center',padding:'28px 0',color:'var(--pg-ink-400)',fontSize:13}}>
          {lang==='pt' ? 'Carregando contatos...' : 'Loading contacts...'}
        </div>
      ) : contacts.length === 0 ? (
        <div style={{textAlign:'center',padding:'28px 0',color:'var(--pg-ink-400)',fontSize:13,lineHeight:1.6,background:'var(--pg-ink-50)',borderRadius:12}}>
          <div style={{fontSize:28,marginBottom:8}}>💬</div>
          {lang==='pt'
            ? 'Nenhuma conversa encontrada.\nA negociação foi feita fora do app.'
            : 'No conversations found.\nThe deal was made outside the app.'}
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:20,maxHeight:260,overflowY:'auto'}}>
          {contacts.map(c => (
            <button key={c.id} onClick={() => setSelected(c)} style={{
              padding:'12px 14px', borderRadius:12,
              border: '1.5px solid ' + (selected?.id === c.id ? 'var(--pg-blue-500)' : 'var(--pg-ink-200)'),
              background: selected?.id === c.id ? 'var(--pg-blue-50)' : 'var(--pg-white)',
              display:'flex', alignItems:'center', gap:12, cursor:'pointer',
              fontFamily:'inherit', textAlign:'left', transition:'all .12s',
            }}>
              <Avatar name={c.name} size={36}/>
              <span style={{fontSize:14,fontWeight:600,color:'var(--pg-ink-900)',flex:1}}>{c.name}</span>
              {selected?.id === c.id && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--pg-blue-500)" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              )}
            </button>
          ))}
        </div>
      )}

      <button onClick={handleConfirm} disabled={!selected || confirming} style={{
        width:'100%', padding:'15px', borderRadius:14, border:'none', cursor: selected ? 'pointer' : 'default',
        fontFamily:'inherit', fontSize:15, fontWeight:700, color:'#fff',
        background: selected ? 'linear-gradient(135deg,#16A34A,#15803D)' : 'var(--pg-ink-200)',
        opacity: confirming ? 0.7 : 1, transition:'all .15s',
        display:'flex', alignItems:'center', justifyContent:'center', gap:8,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
        {confirming ? '...' : (lang==='pt' ? 'Confirmar venda' : 'Confirm Sale')}
      </button>
      {onSkip && (
        <button onClick={onSkip} style={{
          display:'block', width:'100%', marginTop:12, padding:'4px 0', border:'none', background:'transparent',
          color:'var(--pg-ink-400)', fontSize:12.5, fontWeight:600, cursor:'pointer', textDecoration:'underline',
        }}>
          {lang==='pt'?'Não vendi pelo app — pular':lang==='es'?'No lo vendí en la app — omitir':"I didn't sell through the app — skip"}
        </button>
      )}
      <button onClick={onClose} style={{
        width:'100%', marginTop:10, padding:'12px', borderRadius:14, border:'none',
        cursor:'pointer', fontFamily:'inherit', fontSize:14, fontWeight:600,
        background:'var(--pg-ink-100)', color:'var(--pg-ink-600)',
      }}>
        {lang==='pt' ? 'Cancelar' : 'Cancel'}
      </button>
    </div>
  );
}

// ── Route hero card (no photo) ────────────────────────────────
function RouteNoPhotoHero({ item, lang }) {
  const n = Number(item.revenue || 0);
  const revFmt = n > 0 ? (n % 1000 === 0 ? `${n/1000}k` : fmtN(n, lang)) : null;
  const cities = (item.area || '').split(',').map(c => c.trim()).filter(Boolean);
  const poolsLabel = lang === 'pt' ? 'Piscinas' : lang === 'es' ? 'Piscinas' : 'Pools';
  const revLabel   = lang === 'pt' ? 'Receita/mês' : lang === 'es' ? 'Ingresos/mes' : 'Revenue/mo';
  const moSfx      = lang === 'pt' ? '/mês' : '/mo';
  return (
    <div style={{
      width:'100%', height:'100%', minHeight:240,
      background:'linear-gradient(135deg, #0b1a5c 0%, #1d3faa 55%, #2563eb 100%)',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      gap:18, padding:'20px 24px',
    }}>
      {/* Stats row */}
      {(item.clients || revFmt) && (
        <div style={{display:'flex', alignItems:'center'}}>
          {item.clients && (
            <div style={{textAlign:'center', padding:'0 28px'}}>
              <div style={{fontSize:58, fontWeight:800, color:'#fff', lineHeight:1, letterSpacing:'-1px'}}>
                {item.clients}
              </div>
              <div style={{fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.55)',
                letterSpacing:'0.14em', marginTop:5, textTransform:'uppercase'}}>
                {poolsLabel}
              </div>
            </div>
          )}
          {item.clients && revFmt && (
            <div style={{width:1, height:60, background:'rgba(255,255,255,0.22)', flexShrink:0}}/>
          )}
          {revFmt && (
            <div style={{textAlign:'center', padding:'0 28px'}}>
              <div style={{fontSize: item.clients ? 34 : 46, fontWeight:800, color:'#fff', lineHeight:1, letterSpacing:'-0.5px'}}>
                ${revFmt}
                <span style={{fontSize:16, fontWeight:700, opacity:0.8}}>{moSfx}</span>
              </div>
              <div style={{fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.55)',
                letterSpacing:'0.14em', marginTop:5, textTransform:'uppercase'}}>
                {revLabel}
              </div>
            </div>
          )}
        </div>
      )}
      {/* City pills */}
      {cities.length > 0 && (
        <div style={{display:'flex', flexWrap:'wrap', gap:6, justifyContent:'center', maxWidth:320}}>
          {cities.map(city => (
            <div key={city} style={{
              display:'inline-flex', alignItems:'center', gap:5,
              background:'rgba(255,255,255,0.13)', backdropFilter:'blur(8px)',
              WebkitBackdropFilter:'blur(8px)',
              border:'1px solid rgba(255,255,255,0.22)',
              borderRadius:999, padding:'6px 14px',
              fontSize:13, fontWeight:600, color:'#fff',
            }}>
              <svg width="11" height="13" viewBox="0 0 24 28" fill="currentColor">
                <path d="M12 0C7.58 0 4 3.58 4 8c0 6 8 16 8 16s8-10 8-16c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
              </svg>
              {city}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── View Listing Sheet (other users' posts — read-only + contact) ─────────
// canDelete = isAdmin (qualquer post) OR isAuthor (próprio post que chegou aqui sem isMyPost)
function ViewListingSheet({ item, lang, onClose, openChat, openPublicProfile, isAdmin, canDelete, onEdit, currentUser, showToast, onDeleted, isSaved, onToggleSave, onShare, liveMarket=[], onOpenListing, onAfterSold }) {
  if (!item) return null;
  const [deleting,      setDeleting]     = React.useState(false);
  const [markSoldOpen,  setMarkSoldOpen] = React.useState(false);
  const [imgIdx,        setImgIdx]       = React.useState(0);
  const [viewerOpen,    setViewerOpen]   = React.useState(false);
  const [authorPhotoUrl,setAuthorPhotoUrl] = React.useState(null);
  const [authorVerified,setAuthorVerified] = React.useState(false);
  const [authorRating,  setAuthorRating]   = React.useState(null); // { avg, count } | null

  const [mapCoords,     setMapCoords]    = React.useState(null);
  const [mapLoading,    setMapLoading]   = React.useState(false);
  const [isDesktop,     setIsDesktop]    = React.useState(() => window.innerWidth >= 900);
  // Rental request state
  const isRent = item.type === 'rent';
  const [reqStatus,          setReqStatus]          = React.useState(null); // null|'pending'|'approved'|'declined'|'completed'|'disputed'|'resolved'
  const [resolvedMessage,    setResolvedMessage]    = React.useState(''); // admin's public resolution message
  const [listingOccupied,    setListingOccupied]    = React.useState(false); // another user has an approved rental
  const [dismissedDecisions, setDismissedDecisions] = React.useState(new Set()); // reqIds owner dismissed keep/remove prompt
  const [reqLoading,    setReqLoading]   = React.useState(false);
  const [cancelLoading, setCancelLoading]= React.useState(false);
  const [ownerRequests, setOwnerRequests]= React.useState([]); // for owner — list of requests
  const [reqPeriod,     setReqPeriod]    = React.useState(null); // 'day'|'week'|'month'
  const [reqQty,        setReqQty]       = React.useState(1);
  const [myRequestId,   setMyRequestId]  = React.useState(null); // renter's own request id
  // Rating state
  const [ratingSheet,   setRatingSheet]   = React.useState(null); // null | {requestId,rateeId,rateeName}
  const [ratingStars,   setRatingStars]   = React.useState(0);
  const [ratingComment, setRatingComment] = React.useState('');
  const [ratingLoading, setRatingLoading] = React.useState(false);
  const [ratingHover,   setRatingHover]   = React.useState(0);
  const [hasRated,          setHasRated]          = React.useState(false);
  const [ownerRatedRequests, setOwnerRatedRequests] = React.useState(new Set()); // requestIds owner already rated after resolved
  // Dispute form
  const [disputeForm,     setDisputeForm]     = React.useState(null); // null | {requestId, req}
  const [disputeSeverity, setDisputeSeverity] = React.useState('serious');
  const [disputeDesc,     setDisputeDesc]     = React.useState('');
  const [disputeLoading,  setDisputeLoading]  = React.useState(false);
  const [disputePhotos,   setDisputePhotos]   = React.useState([]); // [{file, preview}]
  // Rental photos (before/after)
  const [requestPhotos,  setRequestPhotos]  = React.useState({}); // {reqId:{before:[],after:[]}}
  const [addingPhotoFor, setAddingPhotoFor] = React.useState(null); // reqId being photo'd
  const [photoUploading, setPhotoUploading] = React.useState(false);
  const [afterStep,      setAfterStep]      = React.useState(null); // null | {requestId, req}
  const [afterPhotos,    setAfterPhotos]    = React.useState([]);
  const [afterUploading, setAfterUploading] = React.useState(false);
  const beforePhotoRef = React.useRef(null);
  const afterPhotoRef  = React.useRef(null);

  // Compute available rental periods from item (multi-price new items, or single-period legacy)
  const availablePeriods = React.useMemo(() => {
    if (item.rentPrices && typeof item.rentPrices === 'object') {
      const order = ['day','week','month'];
      return order
        .filter(k => item.rentPrices[k] && Number(item.rentPrices[k]) > 0)
        .map(k => ({ period: k, price: Number(item.rentPrices[k]) }));
    }
    // Legacy: single period from rent_period + price
    const p = item.rentPeriod || 'day';
    return [{ period: p, price: Number(item.price) || 0 }];
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
    window.sb.from('rental_requests')
      .select('id, status, requester_id, requester_name, created_at, period, quantity, total_price, requester_verified, owner_kept_active')
      .eq('listing_id', item._id)
      .then(({ data }) => {
        if (!data) return;
        const isOwnerLocal = item.author_id && item.author_id === currentUser.uid;
        if (isOwnerLocal) {
          setOwnerRequests(data);
          // Check which resolved requests the owner has already rated
          const resolvedIds = data.filter(r => r.status === 'resolved' || r.status === 'completed').map(r => r.id);
          if (resolvedIds.length > 0 && window.sb) {
            window.sb.from('rental_ratings').select('request_id').eq('rater_id', currentUser.uid)
              .then(({ data: rd }) => { if (rd) setOwnerRatedRequests(new Set(rd.map(r => r.request_id))); })
              .catch(() => {});
          }
        } else {
          const mine = data.find(r => r.requester_id === currentUser.uid);
          if (mine) {
            setReqStatus(mine.status);
            setMyRequestId(mine.id);
            if (mine.status === 'completed' && window.sb) {
              window.sb.from('rental_ratings')
                .select('id').eq('request_id', mine.id).eq('rater_id', currentUser.uid).limit(1)
                .then(({ data: rd }) => { if (rd && rd.length > 0) setHasRated(true); })
                .catch(() => {});
            }
            if (mine.status === 'resolved' && window.sb) {
              window.sb.from('dispute_reports')
                .select('resolution_message')
                .eq('rental_request_id', mine.id)
                .order('created_at', { ascending: false })
                .then(({ data: dd }) => {
                  if (dd && dd[0]) setResolvedMessage(dd[0].resolution_message || '');
                })
                .catch(() => {});
            }
          } else {
            // No request from this user — check if listing is occupied by someone else
            const hasActiveRental = data.some(r => r.status === 'approved');
            if (hasActiveRental) setListingOccupied(true);
          }
        }
      })
      .catch(() => {});
  }, [item._id, isRent, currentUser?.uid]); // eslint-disable-line

  // Compress photo helper (same as PhotoPicker)
  const compressPhoto = (file) => new Promise(resolve => {
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

  // Load before/after photos for owner's requests (all non-pending/declined)
  React.useEffect(() => {
    const active = ownerRequests.filter(r => ['approved','completed','disputed','resolved'].includes(r.status));
    if (!active.length || !window.sb) return;
    Promise.all(active.map(r =>
      window.sb.from('rental_photos').select('type, photo_url').eq('request_id', r.id)
    )).then(results => {
      const map = {};
      results.forEach((res, i) => {
        if (res.data && res.data.length > 0) {
          const rid = active[i].id;
          map[rid] = {
            before: res.data.filter(p => p.type === 'before').map(p => p.photo_url),
            after:  res.data.filter(p => p.type === 'after').map(p => p.photo_url),
          };
        }
      });
      if (Object.keys(map).length) setRequestPhotos(prev => ({...prev, ...map}));
    }).catch(() => {});
  }, [ownerRequests.length]); // eslint-disable-line

  // Load before/after photos for the renter's own request too — previously only
  // the owner could ever see these, leaving the renter with no visibility into
  // the documentation protecting both sides of the rental.
  React.useEffect(() => {
    if (!myRequestId || !window.sb || isOwner) return;
    window.sb.from('rental_photos').select('type, photo_url').eq('request_id', myRequestId)
      .then(({ data }) => {
        if (!data || data.length === 0) return;
        setRequestPhotos(prev => ({
          ...prev,
          [myRequestId]: {
            before: data.filter(p => p.type === 'before').map(p => p.photo_url),
            after:  data.filter(p => p.type === 'after').map(p => p.photo_url),
          },
        }));
      }).catch(() => {});
  }, [myRequestId, reqStatus]); // eslint-disable-line

  // Fetch author profile photo when listing opens
  React.useEffect(() => {
    setAuthorPhotoUrl(null); setAuthorVerified(false); setAuthorRating(null);
    if (!item?.author_id || !window.sb) return;
    window.sb.from('profiles_public').select('photo_url, verified').eq('id', item.author_id).single()
      .then(({ data }) => {
        if (data?.photo_url) setAuthorPhotoUrl(data.photo_url);
        if (data?.verified)  setAuthorVerified(true);
      })
      .catch(() => {});
    window.sb.from('ratings').select('stars').eq('to_id', item.author_id).eq('pending', false)
      .then(({ data }) => {
        const stars = (data || []).map(r => r.stars).filter(s => s != null);
        if (stars.length === 0) return;
        const avg = stars.reduce((s,v) => s + v, 0) / stars.length;
        setAuthorRating({ avg: Math.round(avg * 10) / 10, count: stars.length });
      })
      .catch(() => {});
  }, [item?.author_id]);

  // Geocode item.loc via Nominatim (OpenStreetMap — free, no API key)
  React.useEffect(() => {
    setMapCoords(null);
    if (!item?.loc) return;
    setMapLoading(true);
    const q = encodeURIComponent(item.loc + (item.loc.toLowerCase().includes('fl') ? '' : ', FL'));
    fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&email=feedback@poolguyx.com`)
      .then(r => r.json())
      .then(data => {
        if (data && data[0]) setMapCoords({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
      })
      .catch(() => {})
      .finally(() => setMapLoading(false));
  }, [item?.loc]);

  const allPhotos = (item.photoUrls && item.photoUrls.length > 0) ? item.photoUrls : (item.photoUrl ? [item.photoUrl] : []);

  // Helper: suffix label for a given period key
  const getPeriodSfx = (p) => p==='week'?(lang==='pt'?'/sem':'/wk'):p==='month'?(lang==='pt'?'/mês':'/mo'):(lang==='pt'?'/dia':'/day');
  const getPeriodLabel = (p,qty=1) => {
    const n = qty > 1 ? qty+' ' : '';
    if (p==='week')  return n+(lang==='pt'?(qty>1?'semanas':'semana'):(qty>1?'weeks':'week'));
    if (p==='month') return n+(lang==='pt'?(qty>1?'meses':'mês'):(qty>1?'months':'month'));
    return n+(lang==='pt'?(qty>1?'dias':'dia'):(qty>1?'days':'day'));
  };

  // For card/header price display: cheapest period if multi, else single
  const displayPrice = availablePeriods.length > 0 ? availablePeriods[0].price : (item.price || 0);
  const displayPeriod = availablePeriods.length > 0 ? availablePeriods[0].period : (item.rentPeriod || 'day');
  const periodSfx = item.type === 'rent' ? getPeriodSfx(displayPeriod) : '';
  const hasMultiPeriod = availablePeriods.length > 1;

  const authorDisplay = item.author
    ? (item.author.includes('@') ? item.author.split('@')[0] : item.author)
    : 'Unknown';
  const locationLabel = item.type === 'route'
    ? (item.area || '')
    : [item.loc, item.cat].filter(Boolean).join(' · ');
  const timeAgoLabel  = item.createdAt ? timeAgo(item.createdAt, lang) : '';

  const _listingCtx = () => ({
    name:     item.name || '',
    photoUrl: (item.photoUrls && item.photoUrls[0]) || item.photoUrl || null,
    price:    item.price,
    priceMode:item.priceMode,
    type:     item.type,
  });

  const handleContact = () => {
    if (isStatic) { showToast && showToast(lang==='pt'?'💡 Item demonstrativo — sem vendedor real.':'💡 Demo item — no real seller to contact.'); return; }
    // Open chat on top of the listing — listing stays open so user returns to it when chat closes
    if (openChat) openChat(item.author_id
      ? { id: item.author_id, name: item.author || 'Seller', listingId: item._id || null, listingContext: _listingCtx() }
      : (item.author || 'Seller'));
  };

  // Helper: insert notification silently (fire-and-forget)
  // title/body can be {en,pt,es} objects → stored as JSON for multilingual rendering
  const _notify = (userId, type, title, body, linkId=null, pushUrl=null) => {
    if (!window.sb || !userId) return;
    const titleStr = typeof title === 'object' ? JSON.stringify(title) : title;
    const bodyStr  = typeof body  === 'object' ? JSON.stringify(body)  : body;
    const row = { user_id: userId, type, title: titleStr, body: bodyStr };
    if (linkId) row.link_id = linkId;
    window.sb.from('notifications').insert(row).catch(() => {});
    // Push notification (extract readable text from multilingual object)
    const pushTitle = typeof title === 'object' ? (title.pt || title.en || '') : title;
    const pushBody  = typeof body  === 'object' ? (body.pt  || body.en  || '') : body;
    // The in-app bell click uses linkId straight from the notifications row, but
    // the OS push banner only has whatever URL we hand it here — without the
    // listing id baked in, tapping the banner can only switch tabs, never open
    // the specific listing. rental_* types carry the listing id as linkId, so
    // build that URL automatically unless the caller passed one explicitly.
    const url = pushUrl || (type.startsWith('rental_') && linkId ? `/#market?listing=${linkId}` : '/#market');
    window.sendPush && window.sendPush(userId, pushTitle, pushBody, url, 'market');
  };

  const handleRequestRental = async () => {
    // Allow re-request after cancelled or declined — those are terminal but recoverable states
    const blockedStatuses = ['pending','approved','completed','disputed','resolved'];
    if (!currentUser?.uid || blockedStatuses.includes(reqStatus) || !window.sb || !reqPeriod) return;
    const periodEntry = availablePeriods.find(p => p.period === reqPeriod);
    const totalPrice  = periodEntry ? periodEntry.price * reqQty : 0;
    setReqLoading(true);
    // A renter can only ever have one rental_requests row per listing (unique on
    // listing_id+requester_id) — re-requesting after a cancelled/declined request
    // hits that same row, so this must upsert (resetting it back to pending) rather
    // than insert, which would otherwise always fail with a duplicate-key error.
    const { data: inserted, error } = await window.sb.from('rental_requests').upsert({
      listing_id:     item._id,
      listing_name:   item.name || '',
      requester_id:   currentUser.uid,
      requester_name: currentUser.name || (currentUser.email||'').split('@')[0] || 'User',
      owner_id:           item.author_id,
      period:             reqPeriod,
      quantity:           reqQty,
      total_price:        totalPrice,
      requester_verified: currentUser.verified || false,
      status:             'pending',
      responded_at:       null,
    }, { onConflict: 'listing_id,requester_id' }).select().single();
    setReqLoading(false);
    if (error) { showToast && showToast('❌ ' + (error.message||'Error')); return; }
    if (inserted?.id) setMyRequestId(inserted.id);
    // Notify owner (multilingual — receiver sees in their own language)
    const _renterName = currentUser.name || (currentUser.email||'').split('@')[0] || 'Someone';
    // link_id is the requester's uid (not the listing id, unlike other rental_*
    // notification types) so tapping this notification jumps straight into the
    // chat with them — that's where the actual proposal now lives (auto-posted
    // above) and where the owner approves/declines from, not the listing page.
    _notify(item.author_id, 'rental_request',
      { en:'New rental request', pt:'Novo pedido de aluguel', es:'Nueva solicitud de alquiler' },
      { en:`${_renterName} wants to rent "${item.name||''}"`, pt:`${_renterName} quer alugar "${item.name||''}"`, es:`${_renterName} quiere alquilar "${item.name||''}"` },
      currentUser.uid, `/#chat?user=${currentUser.uid}&name=${encodeURIComponent(_renterName)}`);
    setReqStatus('pending');
    showToast && showToast(lang==='pt'?'✓ Pedido enviado! Converse com o dono pela inbox.':'✓ Request sent! Chat with the owner via inbox.');
    // Auto-post the proposal into the chat itself — the owner needs to see exactly
    // what's being requested right in the conversation, not just an empty thread.
    if (window.sb && item.author_id) {
      const convoId = makeConvoId(currentUser.uid, item.author_id, item._id || null);
      const periodLabel = getPeriodLabel(reqPeriod, reqQty);
      const script = lang==='pt'
        ? `📦 Quero alugar "${item.name||''}" por ${periodLabel} — total estimado $${fmtN(totalPrice, lang)}.`
        : lang==='es'
          ? `📦 Quiero alquilar "${item.name||''}" por ${periodLabel} — total estimado $${fmtN(totalPrice, lang)}.`
          : `📦 I'd like to rent "${item.name||''}" for ${periodLabel} — estimated total $${fmtN(totalPrice, lang)}.`;
      window.sb.rpc('send_chat_message', {
        p_convo_id:   convoId,
        p_body:       script,
        p_other_id:   item.author_id,
        p_my_name:    _renterName,
        p_other_name: item.author || 'Owner',
      }).then(() => {
        window.sb.from('conversations').update({
          listing_id: item._id || null, listing_name: item.name || null,
          listing_photo_url: (item.photoUrls && item.photoUrls[0]) || item.photoUrl || null,
        }).eq('id', convoId).catch(()=>{});
      }).catch(()=>{});
    }
    if (openChat && item.author_id) {
      // Open chat on top — listing stays open behind it (Sheet zIndex 9999 > listing zIndex 200)
      openChat({ id: item.author_id, name: item.author || 'Owner', listingId: item._id || null, listingContext: _listingCtx() });
    }
  };

  const handleOwnerDecision = async (requestId, newStatus) => {
    if (!window.sb) return;
    if (newStatus === 'approved' && ownerRequests.some(r => r.status === 'approved' && r.id !== requestId)) {
      showToast && showToast(lang==='pt'?'❌ Já existe um pedido aprovado para este item':'❌ Another request for this item is already approved');
      return;
    }
    const { error } = await window.sb.from('rental_requests')
      .update({ status: newStatus, responded_at: new Date().toISOString() })
      .eq('id', requestId);
    if (error) {
      const msg = (error.message||'').includes('duplicate key') || (error.message||'').includes('rental_requests_one_approved_per_listing')
        ? (lang==='pt'?'❌ Já existe um pedido aprovado para este item':'❌ Another request for this item is already approved')
        : '❌ ' + (error.message||'Error');
      showToast && showToast(msg);
      return;
    }
    setOwnerRequests(prev => prev.map(r => r.id === requestId ? {...r, status: newStatus} : r));
    showToast && showToast(newStatus === 'approved'
      ? (lang==='pt'?'✓ Aluguel aprovado!':'✓ Rental approved!')
      : (lang==='pt'?'Pedido recusado':'Request declined'));
    // Notify renter
    const req = ownerRequests.find(r => r.id === requestId);
    if (req?.requester_id) {
      if (newStatus === 'approved') {
        _notify(req.requester_id, 'rental_approved',
          { en:'Rental approved! 🎉', pt:'Aluguel aprovado! 🎉', es:'¡Alquiler aprobado! 🎉' },
          { en:`The owner approved your request for "${item.name||''}"`, pt:`O dono aprovou seu pedido para "${item.name||''}"`, es:`El propietario aprobó tu solicitud para "${item.name||''}"` },
          item._id);
      } else {
        _notify(req.requester_id, 'rental_declined',
          { en:'Rental request declined', pt:'Pedido de aluguel recusado', es:'Solicitud de alquiler rechazada' },
          { en:`"${item.name||''}" — The owner did not accept your request.`, pt:`"${item.name||''}" — O dono não aceitou seu pedido.`, es:`"${item.name||''}" — El propietario no aceptó tu solicitud.` },
          item._id);
      }
    }
  };

  const handleCancelRequest = async () => {
    if (!window.sb || !myRequestId) return;
    const ok = window.confirm(lang==='pt'
      ? 'Cancelar o pedido de aluguel? Esta ação não pode ser desfeita.'
      : 'Cancel the rental request? This cannot be undone.');
    if (!ok) return;
    setCancelLoading(true);
    const { error } = await window.sb.from('rental_requests')
      .update({ status: 'cancelled' })
      .eq('id', myRequestId);
    if (error) { setCancelLoading(false); showToast && showToast('❌ ' + (error.message||'Error')); return; }
    // The REST client uses Prefer: return=minimal on updates, so an RLS-blocked
    // 0-row write still reports success — verify the row actually changed.
    const { data: verify } = await window.sb.from('rental_requests').select('status').eq('id', myRequestId).single();
    setCancelLoading(false);
    if (verify?.status !== 'cancelled') {
      showToast && showToast(lang==='pt'?'❌ Não foi possível cancelar — tente novamente':'❌ Could not cancel — please try again');
      return;
    }
    setReqStatus('cancelled');
    setListingOccupied(false);
    showToast && showToast(lang==='pt'?'Pedido cancelado.':'Request cancelled.');
  };

  const handleOwnerCancelRental = async (requestId) => {
    if (!window.sb) return;
    const ok = window.confirm(lang==='pt'
      ? 'Cancelar este aluguel em andamento? O renter será notificado pelo chat.'
      : 'Cancel this active rental? The renter will be notified via chat.');
    if (!ok) return;
    const { error } = await window.sb.from('rental_requests')
      .update({ status: 'cancelled' })
      .eq('id', requestId);
    if (error) { showToast && showToast('❌ ' + (error.message||'Error')); return; }
    const cancelledReq = ownerRequests.find(r => r.id === requestId);
    setOwnerRequests(prev => prev.map(r => r.id === requestId ? {...r, status: 'cancelled'} : r));
    showToast && showToast(lang==='pt'?'Aluguel cancelado.':'Rental cancelled.');
    if (cancelledReq?.requester_id) {
      _notify(cancelledReq.requester_id, 'rental_cancelled',
        { en:'Rental cancelled by owner', pt:'Aluguel cancelado pelo dono', es:'Alquiler cancelado por el propietario' },
        { en:`"${item.name||''}" — The owner cancelled the active rental.`, pt:`"${item.name||''}" — O dono cancelou o aluguel em andamento.`, es:`"${item.name||''}" — El propietario canceló el alquiler en curso.` },
        item._id);
    }
  };

  const handleMarkReturned = async (requestId, req) => {
    // If before photos exist → require after photos first
    const beforePics = requestPhotos[requestId]?.before || [];
    if (beforePics.length > 0) {
      setAfterPhotos([]);
      setAfterStep({ requestId, req });
      return;
    }
    // No before photos on file — this is the documentation step being skipped
    // entirely, so make sure that's a deliberate choice, not an oversight.
    const skipOk = window.confirm(lang==='pt'
      ? 'Você não tirou fotos do estado inicial do item. Sem elas, não há como provar dano em caso de disputa. Marcar como devolvido mesmo assim?'
      : "You didn't take initial condition photos. Without them there's no proof in case of a damage dispute. Mark as returned anyway?");
    if (!skipOk) return;
    if (!window.sb) return;
    const { error } = await window.sb.from('rental_requests')
      .update({ status: 'completed' })
      .eq('id', requestId);
    if (error) { showToast && showToast('❌ ' + (error.message||'Error')); return; }
    setOwnerRequests(prev => prev.map(r => r.id === requestId ? {...r, status: 'completed'} : r));
    showToast && showToast(lang==='pt' ? '✓ Marcado como devolvido!' : '✓ Marked as returned!');
    setRatingStars(0); setRatingComment('');
    setRatingSheet({ requestId, rateeId: req.requester_id, rateeName: req.requester_name || 'Renter' });
  };

  // ── Before-photo upload ──────────────────────────────────────
  const handleBeforePhotoFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file || !addingPhotoFor || !window.sb) return;
    setPhotoUploading(true);
    try {
      const blob = await compressPhoto(file);
      const path = 'rental/before-' + addingPhotoFor + '-' + Date.now() + '.jpg';
      let url = null;
      if (window.sb.storage) {
        const { data, error } = await window.sb.storage.from('post-images').upload(path, blob, { contentType:'image/jpeg' });
        if (!error && data) {
          const { data: ud } = window.sb.storage.from('post-images').getPublicUrl(path);
          url = ud.publicUrl;
        }
      }
      if (!url) {
        url = await new Promise(res => { const r = new FileReader(); r.onload = ev => res(ev.target.result); r.readAsDataURL(blob); });
      }
      await window.sb.from('rental_photos').insert({ request_id: addingPhotoFor, type: 'before', photo_url: url, uploaded_by: currentUser.uid });
      setRequestPhotos(prev => ({
        ...prev,
        [addingPhotoFor]: { before: [...(prev[addingPhotoFor]?.before || []), url], after: prev[addingPhotoFor]?.after || [] }
      }));
      showToast && showToast(lang==='pt' ? '📷 Foto adicionada!' : '📷 Photo added!');
    } catch(err) { console.warn('[BeforePhoto]', err); }
    setPhotoUploading(false);
    setAddingPhotoFor(null);
  };

  // ── After-photo upload (during Devolvido flow) ───────────────
  const handleAfterPhotoFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file || afterPhotos.length >= 4 || !window.sb) return;
    setAfterUploading(true);
    try {
      const blob = await compressPhoto(file);
      const path = 'rental/after-' + Date.now() + '-' + Math.random().toString(36).slice(2) + '.jpg';
      let url = null;
      if (window.sb.storage) {
        const { data, error } = await window.sb.storage.from('post-images').upload(path, blob, { contentType:'image/jpeg' });
        if (!error && data) {
          const { data: ud } = window.sb.storage.from('post-images').getPublicUrl(path);
          url = ud.publicUrl;
        }
      }
      if (!url) {
        url = await new Promise(res => { const r = new FileReader(); r.onload = ev => res(ev.target.result); r.readAsDataURL(blob); });
      }
      setAfterPhotos(prev => [...prev, url]);
    } catch(err) { console.warn('[AfterPhoto]', err); }
    setAfterUploading(false);
  };

  // ── Confirm return WITH after photos ────────────────────────
  const handleConfirmReturn = async () => {
    if (!afterStep || !window.sb) return;
    const { requestId, req } = afterStep;
    // Save after photos
    if (afterPhotos.length > 0) {
      await Promise.all(afterPhotos.map(url =>
        window.sb.from('rental_photos').insert({ request_id: requestId, type: 'after', photo_url: url, uploaded_by: currentUser.uid })
      ));
      setRequestPhotos(prev => ({
        ...prev,
        [requestId]: { before: prev[requestId]?.before || [], after: afterPhotos }
      }));
    }
    const { error } = await window.sb.from('rental_requests').update({ status: 'completed' }).eq('id', requestId);
    if (error) { showToast && showToast('❌ ' + (error.message||'Error')); return; }
    setOwnerRequests(prev => prev.map(r => r.id === requestId ? {...r, status: 'completed'} : r));
    setAfterStep(null); setAfterPhotos([]);
    showToast && showToast(lang==='pt' ? '✓ Devolvido com fotos!' : '✓ Returned with photos!');
    setRatingStars(0); setRatingComment('');
    setRatingSheet({ requestId, rateeId: req.requester_id, rateeName: req.requester_name || 'Renter' });
  };

  // ── Report problem — full flow with form ─────────────────────
  const handleReportProblemFull = async () => {
    if (!disputeForm || !disputeDesc.trim() || !window.sb || !currentUser?.uid) return;
    setDisputeLoading(true);
    const { requestId, req } = disputeForm;

    // 1. Upload evidence photos
    const evidenceUrls = [];
    for (const p of disputePhotos) {
      try {
        const raw = p.file.name.split('.').pop().toLowerCase();
        const ext = /^(jpg|jpeg|png|webp|gif|heic)$/.test(raw) ? raw : 'jpg';
        const path = `dispute-evidence/${currentUser.uid}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await window.sb.storage.from('post-images').upload(path, p.file, { contentType: p.file.type, upsert: false });
        if (!upErr) {
          const { data: pub } = window.sb.storage.from('post-images').getPublicUrl(path);
          if (pub?.publicUrl) evidenceUrls.push(pub.publicUrl);
        }
      } catch(e) {}
    }

    // 2. Mark request as disputed
    await window.sb.from('rental_requests').update({ status: 'disputed' }).eq('id', requestId);
    // 3. Insert dispute report
    await window.sb.from('dispute_reports').insert({
      rental_request_id: requestId,
      reporter_id:       currentUser.uid,
      reported_user_id:  req.requester_id,
      listing_id:        item._id,
      listing_name:      item.name || '',
      severity:          disputeSeverity,
      description:       disputeDesc.trim(),
      reporter_name:     currentUser.name || (currentUser.email||'').split('@')[0] || 'Owner',
      reported_name:     req.requester_name || 'Renter',
      status:            'pending',
      evidence_urls:     evidenceUrls,
    });
    setOwnerRequests(prev => prev.map(r => r.id === requestId ? {...r, status: 'disputed'} : r));
    setDisputeLoading(false);
    showToast && showToast(lang==='pt' ? '⚠ Problema reportado e enviado para análise.' : '⚠ Issue reported and sent for review.');
    setDisputeForm(null);
    setDisputePhotos([]);
  };

  const handleSubmitRating = async () => {
    if (!ratingSheet || ratingStars === 0 || ratingLoading || !window.sb || !currentUser?.uid) return;
    setRatingLoading(true);
    const { error } = await window.sb.from('rental_ratings').insert({
      request_id: ratingSheet.requestId,
      rater_id:   currentUser.uid,
      ratee_id:   ratingSheet.rateeId,
      listing_id: item._id,
      stars:      ratingStars,
      comment:    ratingComment.trim() || null,
    });
    setRatingLoading(false);
    if (error) { showToast && showToast('❌ ' + (error.message||'Error')); return; }
    // Also mirror into the generic ratings table — that's what the app-wide
    // realtime subscription and instant "you've been rated, rate back" popup
    // key off, so without this the other party only ever finds out by
    // manually reopening the listing (the exact "só dá pra avaliar quando eu
    // entro na publicação" gap this closes). Same connection_type/connection_id
    // pattern already used for quickpool/hiring/vacation ratings.
    const connId = String(ratingSheet.requestId);
    window.sb.from('ratings').upsert({
      from_id: currentUser.uid, to_id: ratingSheet.rateeId,
      from_name: currentUser.name || (currentUser.email||'').split('@')[0] || '',
      listing_name: item.name || '', stars: ratingStars, comment: ratingComment.trim() || null,
      pending: true, connection_type: 'rental', connection_id: connId,
      expires_at: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
    }, { onConflict: 'connection_type,connection_id,from_id' }).then(({error:e2}) => {
      if (e2) { console.error('[Rental rating mirror] upsert failed', e2); return; }
      window.sb.rpc('reveal_mutual_rating', { p_a: currentUser.uid, p_b: ratingSheet.rateeId }).catch(()=>{});
    });
    window.sb.from('ratings').insert({
      from_id: ratingSheet.rateeId, to_id: currentUser.uid,
      from_name: ratingSheet.rateeName || '', listing_name: item.name || '',
      stars: null, comment: '', pending: true, connection_type: 'rental', connection_id: connId,
      expires_at: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
    }).catch(()=>{}); // ignore duplicate-key — placeholder may already exist
    showToast && showToast(lang==='pt' ? '⭐ Avaliação enviada! Obrigado.' : '⭐ Rating submitted! Thank you.');
    setHasRated(true);
    // Track owner rating for resolved requests
    if (ratingSheet.requestId) {
      setOwnerRatedRequests(prev => { const n = new Set(prev); n.add(ratingSheet.requestId); return n; });
    }
    setRatingSheet(null);
  };

  // Open seller public profile — fetch real data from Supabase
  const handleAuthorClick = async () => {
    if (!openPublicProfile) return;
    const base = {
      uid:    item.author_id || null,
      name:   authorDisplay,
      rating: undefined,   // undefined = no ratings yet (not 4.8 default)
      reviews: 0,
      jobs: 0,
      loc: item.loc || 'Broward County, FL',
    };
    if (item.author_id && window.sb) {
      try {
        const { data } = await window.sb.from('profiles_public')
          .select('name, region, role, photo_url')
          .eq('id', item.author_id)
          .single();
        if (data) {
          if (data.name)      base.name  = data.name;
          if (data.region)    base.loc   = data.region;
          if (data.photo_url) base.photo = data.photo_url;
        }
      } catch(e) {}
    }
    openPublicProfile(base);
  };

  const handleAdminDelete = async () => {
    const confirmMsg = lang==='pt'
      ? `Excluir o anúncio "${item.name}"? Não pode ser desfeito.`
      : `Delete listing "${item.name}"? This cannot be undone.`;
    if (!window.confirm(confirmMsg)) return;
    setDeleting(true);
    const { error } = await window.sb.from('marketplace').delete().eq('id', item._id);
    setDeleting(false);
    if (error) { if (showToast) showToast('❌ ' + error.message); return; }
    if (showToast) showToast(lang==='pt'?'🗑️ Anúncio excluído':'🗑️ Listing deleted');
    if (onDeleted) onDeleted(item._id);
    if (onClose) onClose();
  };

  // ── Shared sub-components ─────────────────────────────────────
  const isStatic = !item._live; // demo item from EQUIPMENT array — no DB entry
  const isOwner = !isStatic && item.author_id && currentUser?.uid && item.author_id === currentUser.uid;
  const isSold  = item.status === 'sold';

  const TypeBadge = () => (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:4,
      fontSize:10, fontWeight:800, padding:'4px 10px', borderRadius:6,
      background: item.type==='rent' ? '#0EBAC7' : 'var(--pg-blue-500)',
      color:'#fff', letterSpacing:'0.07em', textTransform:'uppercase',
    }}>
      {item.type==='rent' ? (lang==='pt'?'ALUGUEL':'RENTAL') : (lang==='pt'?'VENDA':'FOR SALE')}
    </span>
  );

  const PriceBlock = ({ large=false }) => (
    <div style={{display:'flex', alignItems:'baseline', gap:8, flexWrap:'wrap'}}>
      {item.priceMode === 'neg' ? (
        <span style={{
          fontSize: large?18:14, fontWeight:700, padding:'5px 14px', borderRadius:999,
          background:'var(--pg-blue-50)', color:'var(--pg-blue-700)', border:'1.5px solid var(--pg-blue-100)',
        }}>
          🤝 {lang==='pt'?'Negociável':lang==='es'?'Negociable':'Negotiable'}
        </span>
      ) : (
        <>
          <span style={{
            fontFamily:'var(--pg-font-display)',
            fontSize: large?38:30,
            fontWeight:800, color:'var(--pg-blue-500)',
            letterSpacing:'-0.03em', lineHeight:1,
          }}>
            {(item.type === 'pool' || item.type === 'route')
              ? `$${fmtN(item.asking||0, lang)}`
              : `$${fmtN(item.price, lang)}`}
            {item.type !== 'pool' && item.type !== 'route' && periodSfx && <span style={{fontSize: large?16:13, fontWeight:500, color:'var(--pg-ink-400)', marginLeft:3}}>{periodSfx}</span>}
          </span>
          {item.condition && (
            <span style={{
              fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:999,
              background:'var(--pg-blue-100)', color:'var(--pg-blue-700)', border:'none',
            }}>{item.condition}</span>
          )}
        </>
      )}
    </div>
  );

  const SellerRow = ({ horizontal=false }) => (
    <button onClick={handleAuthorClick} style={{
      display:'flex', alignItems:'center', gap:12, width:'100%',
      border:'none', background:'transparent', cursor: openPublicProfile ? 'pointer' : 'default',
      textAlign:'left', padding:0, fontFamily:'inherit',
    }}>
      <Avatar name={authorDisplay} size={horizontal?48:44} src={authorPhotoUrl||undefined}/>
      <div style={{flex:1, minWidth:0}}>
        <div style={{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}}>
          <span style={{fontSize:14, fontWeight:700, color:'var(--pg-ink-900)'}}>{authorDisplay}</span>
          {authorVerified && (
            <span style={{fontSize:10,fontWeight:800,padding:'2px 7px',borderRadius:999,
              background:'rgba(22,163,74,0.12)',color:'#16A34A',border:'1px solid rgba(22,163,74,0.3)',
              display:'inline-flex',alignItems:'center',gap:3,flexShrink:0}}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              {lang==='pt'?'Verificado':'Verified'}
            </span>
          )}
        </div>
        <div style={{display:'flex', alignItems:'center', gap:5, marginTop:2, flexWrap:'wrap'}}>
          {authorRating ? (
            <>
              <Stars rating={authorRating.avg} size={12}/>
              <span style={{fontSize:12, fontWeight:600, color:'var(--pg-ink-700)'}}>{authorRating.avg}</span>
              <span style={{fontSize:11, color:'var(--pg-ink-400)'}}>({authorRating.count})</span>
            </>
          ) : (
            <span style={{fontSize:11.5, color:'var(--pg-ink-400)'}}>{lang==='pt'?'Sem avaliações ainda':lang==='es'?'Sin calificaciones aún':'No ratings yet'}</span>
          )}
          {timeAgoLabel ? <span style={{fontSize:11.5, color:'var(--pg-ink-400)'}}> · {timeAgoLabel}</span> : null}
        </div>
      </div>
      <span style={{
        fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:999,
        background:'var(--pg-blue-50)', color:'var(--pg-blue-700)', border:'1px solid var(--pg-blue-100)',
        flexShrink:0,
      }}>Pool Guy</span>
      {openPublicProfile && Icon.chev(14,'var(--pg-ink-300)')}
    </button>
  );

  const ActionButtons = ({ vertical=false }) => (
    <div style={{display:'flex', flexDirection: vertical?'column':'row', gap:10}}>
      {!isOwner && <button onClick={handleContact} style={{
        flex:1, height:50, borderRadius:14, border:'none', cursor:'pointer',
        fontFamily:'inherit', fontSize:15, fontWeight:700, color:'#fff',
        background:'linear-gradient(135deg,var(--pg-blue-500),var(--pg-blue-700))',
        boxShadow:'0 4px 16px rgba(0,119,182,0.30)',
        display:'flex', alignItems:'center', justifyContent:'center', gap:8,
        transition:'all .15s',
      }}>
        {Icon.msg(18,'#fff')}
        {lang==='pt'?'Enviar mensagem':lang==='es'?'Enviar mensaje':'Send Message'}
      </button>}
      {isOwner && onEdit && <button onClick={onEdit} style={{
        flex:1, height:50, borderRadius:14, border:'none', cursor:'pointer',
        fontFamily:'inherit', fontSize:15, fontWeight:700, color:'#fff',
        background:'linear-gradient(135deg,var(--pg-blue-500),var(--pg-blue-700))',
        boxShadow:'0 4px 16px rgba(0,119,182,0.30)',
        display:'flex', alignItems:'center', justifyContent:'center', gap:8,
        transition:'all .15s',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        {lang==='pt'?'Editar anúncio':lang==='es'?'Editar anuncio':'Edit listing'}
      </button>}
      <div style={{display:'flex', gap:10}}>
        {!isOwner && (
        <button onClick={onToggleSave} title={isSaved?(lang==='pt'?'Remover dos salvos':'Unsave'):(lang==='pt'?'Salvar':'Save')} style={{
          width:50, height:50, borderRadius:14, cursor:'pointer', flexShrink:0,
          border: isSaved ? '1.5px solid #FCA5A5' : '1.5px solid var(--pg-ink-200)',
          background: isSaved ? '#FEF2F2' : 'var(--pg-ink-50)',
          color: isSaved ? '#EF4444' : 'var(--pg-ink-500)',
          display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill={isSaved?'currentColor':'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        )}
        <button onClick={onShare} title={lang==='pt'?'Compartilhar':'Share'} style={{
          width:50, height:50, borderRadius:14, cursor:'pointer', flexShrink:0,
          border:'1.5px solid var(--pg-ink-200)', background:'var(--pg-ink-50)',
          color:'var(--pg-ink-500)', display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
        </button>
        {canDelete && (
          <button onClick={handleAdminDelete} disabled={deleting} title={lang==='pt'?'Excluir':'Delete'} style={{
            width:50, height:50, borderRadius:14, cursor:'pointer', flexShrink:0,
            border:'1.5px solid #FCA5A5', background:'#FEF2F2', color:'#EF4444',
            display:'flex', alignItems:'center', justifyContent:'center', opacity: deleting?0.6:1,
          }}>
            {deleting
              ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeDasharray="31.4" strokeDashoffset="10"/></svg>
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            }
          </button>
        )}
      </div>
    </div>
  );

  // ── Rental request block (for non-owner renters) ──────────────
  const RequestRentalBlock = () => {
    if (!isRent || isOwner || isSold) return null;

    // ── Profile completeness gate (B) ────────────────────────────
    if (currentUser?.uid && reqStatus === null) {
      const hasName  = !!(currentUser?.name && !currentUser.name.includes('@') && currentUser.name.trim().length > 1);
      const hasPhone = !!(currentUser?.phone?.trim());
      const hasPhoto = !!(currentUser?.photoUrl);
      if (!hasName || !hasPhone || !hasPhoto) {
        const missing = [
          !hasPhoto && (lang==='pt'?'📷 Foto de perfil':'📷 Profile photo'),
          !hasName  && (lang==='pt'?'👤 Nome completo':'👤 Full name'),
          !hasPhone && (lang==='pt'?'📞 Telefone':'📞 Phone number'),
        ].filter(Boolean);
        return (
          <div style={{borderRadius:14,overflow:'hidden',border:'1.5px solid rgba(245,158,11,0.4)'}}>
            <div style={{padding:'13px 16px',background:'rgba(245,158,11,0.08)',display:'flex',gap:10,alignItems:'flex-start'}}>
              <span style={{fontSize:22,flexShrink:0}}>🔒</span>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:800,color:'#F59E0B',marginBottom:3}}>
                  {lang==='pt'?'Perfil incompleto':'Incomplete profile'}
                </div>
                <div style={{fontSize:12,color:'#F59E0B',opacity:0.85,marginBottom:8}}>
                  {lang==='pt'?'Para alugar equipamentos, complete seu perfil:':'To rent equipment, complete your profile:'}
                </div>
                {missing.map((m,i)=>(
                  <div key={i} style={{fontSize:12,fontWeight:600,color:'#F59E0B',marginBottom:3}}>• {m}</div>
                ))}
              </div>
            </div>
            <div style={{padding:'10px 16px',background:'rgba(245,158,11,0.04)',borderTop:'1px solid rgba(245,158,11,0.2)',
              fontSize:12,color:'var(--pg-ink-500)',textAlign:'center'}}>
              {lang==='pt'?'Vá em ⚙ Perfil no menu para completar seus dados.':'Go to ⚙ Profile in the menu to complete your info.'}
            </div>
          </div>
        );
      }
    }

    // Listing occupied by another renter
    if (listingOccupied && !reqStatus) return (
      <div style={{borderRadius:14,overflow:'hidden',border:'1.5px solid rgba(245,158,11,0.45)'}}>
        <div style={{padding:'14px 16px',background:'rgba(245,158,11,0.09)',display:'flex',alignItems:'flex-start',gap:12}}>
          <div style={{width:38,height:38,borderRadius:'50%',background:'rgba(245,158,11,0.18)',
            display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:20}}>
            🔒
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:800,color:'#D97706',marginBottom:3}}>
              {lang==='pt'?'Equipamento em uso':'Equipment in use'}
            </div>
            <div style={{fontSize:12,color:'#B45309',lineHeight:1.55}}>
              {lang==='pt'
                ? 'Este equipamento está alugado no momento e não está disponível para novas solicitações.'
                : 'This equipment is currently rented and unavailable for new requests.'}
            </div>
          </div>
        </div>
        <div style={{padding:'10px 16px',background:'rgba(245,158,11,0.05)',
          borderTop:'1px solid rgba(245,158,11,0.2)',fontSize:12,color:'var(--pg-ink-500)',textAlign:'center'}}>
          {lang==='pt'
            ? '💡 Salve este anúncio para ser notificado quando estiver disponível.'
            : '💡 Save this listing to be notified when it becomes available.'}
        </div>
      </div>
    );

    // Status cards (same for static/live)
    if (reqStatus === 'approved') {
      const beforePics = requestPhotos[myRequestId]?.before || [];
      return (
      <div style={{borderRadius:14,overflow:'hidden',border:'1.5px solid rgba(14,186,199,0.40)'}}>
        <div style={{padding:'13px 16px',background:'rgba(14,186,199,0.10)',display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:30,height:30,borderRadius:'50%',background:'#0EBAC7',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>
          </div>
          <div>
            <div style={{fontSize:13,fontWeight:800,color:'#0EBAC7'}}>{lang==='pt'?'🔄 Em andamento!':'🔄 In progress!'}</div>
            <div style={{fontSize:11.5,color:'#0EBAC7',opacity:0.8,marginTop:1}}>{lang==='pt'?'O dono aprovou. Aproveite!':'The owner approved. Enjoy!'}</div>
          </div>
        </div>
        <div style={{padding:'10px 16px',background:'var(--pg-white)',borderTop:'1px solid rgba(14,186,199,0.20)'}}>
          {beforePics.length > 0 ? (
            <>
              <div style={{fontSize:11,fontWeight:700,color:'var(--pg-ink-500)',marginBottom:6}}>
                {lang==='pt'?'📷 Estado do item documentado pelo dono antes da entrega:':"📷 Item's condition documented by the owner before handoff:"}
              </div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {beforePics.map((url,i)=>(
                  <img key={i} src={url} alt="" style={{width:52,height:52,objectFit:'cover',borderRadius:8,border:'1.5px solid rgba(14,186,199,0.4)'}}/>
                ))}
              </div>
            </>
          ) : (
            <div style={{fontSize:11.5,color:'var(--pg-ink-400)'}}>
              {lang==='pt'
                ? '⏳ O dono ainda não documentou o estado inicial do item.'
                : "⏳ The owner hasn't documented the item's initial condition yet."}
            </div>
          )}
        </div>
      </div>
    );}
    if (reqStatus === 'completed') {
      const beforePics = requestPhotos[myRequestId]?.before || [];
      const afterPics  = requestPhotos[myRequestId]?.after  || [];
      return (
      <div style={{borderRadius:14,overflow:'hidden',border:'1.5px solid rgba(22,163,74,0.4)'}}>
        <div style={{padding:'13px 16px',background:'rgba(22,163,74,0.12)',display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:30,height:30,borderRadius:'50%',background:'#16A34A',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:800,color:'#22C55E'}}>{lang==='pt'?'Aluguel concluído!':'Rental completed!'}</div>
            <div style={{fontSize:11.5,color:'#22C55E',opacity:0.8,marginTop:1}}>
              {hasRated ? (lang==='pt'?'Obrigado pela avaliação! ⭐':'Thanks for rating! ⭐') : (lang==='pt'?'Avalie sua experiência abaixo.':'Rate your experience below.')}
            </div>
          </div>
        </div>
        {(beforePics.length > 0 || afterPics.length > 0) && (
          <div style={{padding:'10px 16px',background:'var(--pg-white)',borderTop:'1px solid rgba(22,163,74,0.20)',display:'flex',flexDirection:'column',gap:8}}>
            {beforePics.length > 0 && (
              <div>
                <div style={{fontSize:10.5,fontWeight:700,color:'var(--pg-ink-500)',marginBottom:5}}>{lang==='pt'?'📷 Antes':'📷 Before'}</div>
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  {beforePics.map((url,i)=>(<img key={i} src={url} alt="" style={{width:48,height:48,objectFit:'cover',borderRadius:8,border:'1.5px solid var(--pg-ink-200)'}}/>))}
                </div>
              </div>
            )}
            {afterPics.length > 0 && (
              <div>
                <div style={{fontSize:10.5,fontWeight:700,color:'var(--pg-ink-500)',marginBottom:5}}>{lang==='pt'?'📷 Depois':'📷 After'}</div>
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  {afterPics.map((url,i)=>(<img key={i} src={url} alt="" style={{width:48,height:48,objectFit:'cover',borderRadius:8,border:'1.5px solid var(--pg-ink-200)'}}/>))}
                </div>
              </div>
            )}
          </div>
        )}
        {!hasRated && (
          <button
            onClick={()=>{ setRatingStars(0); setRatingComment(''); setRatingSheet({ requestId: myRequestId, rateeId: item.author_id, rateeName: item.author || 'Owner' }); }}
            style={{width:'100%',padding:'11px',border:'none',borderTop:'1px solid rgba(22,163,74,0.25)',cursor:'pointer',fontFamily:'inherit',
              background:'#16A34A',color:'#fff',fontSize:13,fontWeight:700,
              display:'flex',alignItems:'center',justifyContent:'center',gap:7}}>
            ⭐ {lang==='pt'?'Avaliar o dono':'Rate the owner'}
          </button>
        )}
      </div>
    );}
    if (reqStatus === 'disputed') return (
      <div style={{padding:'12px 14px',borderRadius:14,background:'rgba(245,158,11,0.10)',border:'1.5px solid rgba(245,158,11,0.40)',display:'flex',alignItems:'center',gap:10}}>
        <span style={{fontSize:18,flexShrink:0}}>⚠️</span>
        <div>
          <div style={{fontSize:13,fontWeight:700,color:'#F59E0B'}}>{lang==='pt'?'Problema reportado':'Issue reported'}</div>
          <div style={{fontSize:11.5,color:'#F59E0B',opacity:0.8,marginTop:1}}>{lang==='pt'?'Nossa equipe vai analisar em breve.':'Our team will review this shortly.'}</div>
        </div>
      </div>
    );
    if (reqStatus === 'resolved') return (
      <div style={{borderRadius:14,overflow:'hidden',border:'1.5px solid rgba(99,102,241,0.40)'}}>
        <div style={{padding:'12px 14px',background:'rgba(99,102,241,0.10)',display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:18,flexShrink:0}}>✅</span>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:'#818CF8'}}>{lang==='pt'?'Ocorrência resolvida pelo suporte':'Case resolved by support'}</div>
            <div style={{fontSize:11.5,color:'#818CF8',opacity:0.8,marginTop:1}}>{lang==='pt'?'Nossa equipe analisou e encerrou esta ocorrência.':'Our team reviewed and closed this case.'}</div>
          </div>
        </div>
        {resolvedMessage ? (
          <div style={{padding:'10px 14px',background:'rgba(99,102,241,0.06)',borderTop:'1px solid rgba(99,102,241,0.2)',fontSize:13,color:'#818CF8',lineHeight:1.6,fontStyle:'italic'}}>
            "{resolvedMessage}"
          </div>
        ) : null}
      </div>
    );
    if (reqStatus === 'declined') return (
      <div style={{borderRadius:14,overflow:'hidden',border:'1.5px solid rgba(239,68,68,0.35)'}}>
        <div style={{padding:'12px 14px',background:'rgba(239,68,68,0.08)',display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:18,flexShrink:0}}>❌</span>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700,color:'#F87171'}}>{lang==='pt'?'Pedido não aprovado':'Request not approved'}</div>
            <div style={{fontSize:11.5,color:'#F87171',opacity:0.8,marginTop:1}}>{lang==='pt'?'O dono recusou este pedido.':'The owner declined this request.'}</div>
          </div>
        </div>
        <button onClick={()=>{ setReqStatus(null); setMyRequestId(null); }} style={{
          width:'100%',padding:'10px',border:'none',borderTop:'1px solid rgba(239,68,68,0.15)',
          cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:700,
          background:'rgba(14,186,199,0.06)',color:'#0EBAC7',
          display:'flex',alignItems:'center',justifyContent:'center',gap:6,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>
          {lang==='pt'?'Tentar novamente':'Try again'}
        </button>
      </div>
    );
    if (reqStatus === 'cancelled') return (
      <div style={{borderRadius:14,overflow:'hidden',border:'1.5px solid rgba(107,114,128,0.30)'}}>
        <div style={{padding:'12px 14px',background:'rgba(107,114,128,0.08)',display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:18,flexShrink:0}}>🚫</span>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700,color:'var(--pg-ink-500)'}}>{lang==='pt'?'Pedido cancelado':'Request cancelled'}</div>
            <div style={{fontSize:11.5,color:'var(--pg-ink-400)',marginTop:1}}>{lang==='pt'?'Este pedido foi cancelado.':'This request was cancelled.'}</div>
          </div>
        </div>
        <button onClick={()=>{ setReqStatus(null); setMyRequestId(null); }} style={{
          width:'100%',padding:'10px',border:'none',borderTop:'1px solid rgba(107,114,128,0.15)',
          cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:700,
          background:'rgba(14,186,199,0.06)',color:'#0EBAC7',
          display:'flex',alignItems:'center',justifyContent:'center',gap:6,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>
          {lang==='pt'?'Fazer novo pedido':'Make a new request'}
        </button>
      </div>
    );
    if (reqStatus === 'pending') return (
      <div style={{borderRadius:14,overflow:'hidden',border:'1.5px solid rgba(245,158,11,0.4)'}}>
        <div onClick={()=>{ if(openChat && item.author_id) openChat({ id: item.author_id, name: item.author || 'Owner', listingId: item._id || null, listingContext: _listingCtx() }); }}
          style={{padding:'13px 16px',background:'rgba(245,158,11,0.10)',display:'flex',alignItems:'center',gap:10,cursor:'pointer'}}>
          <span style={{fontSize:16,flexShrink:0}}>⏳</span>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700,color:'#F59E0B'}}>{lang==='pt'?'Pedido enviado!':'Request sent!'}</div>
            <div style={{fontSize:11.5,color:'#F59E0B',opacity:0.8,marginTop:1}}>{lang==='pt'?'Toque para ver o que foi enviado.':'Tap to see what was sent.'}</div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" style={{flexShrink:0}}><polyline points="9 18 15 12 9 6"/></svg>
        </div>
        <button onClick={handleCancelRequest} disabled={cancelLoading} style={{
          width:'100%',padding:'10px',border:'none',borderTop:'1px solid rgba(245,158,11,0.2)',
          cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:700,
          background:'rgba(239,68,68,0.06)',color:'#EF4444',
          display:'flex',alignItems:'center',justifyContent:'center',gap:6,
          opacity:cancelLoading?0.6:1,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          {cancelLoading?(lang==='pt'?'Cancelando…':'Cancelling…'):(lang==='pt'?'Cancelar pedido':'Cancel request')}
        </button>
      </div>
    );

    if (isStatic) return (
      <button onClick={()=>showToast&&showToast(lang==='pt'?'💡 Item demonstrativo — publique seu item real no marketplace!':'💡 Demo item — post your own listing to rent it out!')}
        style={{width:'100%',height:52,borderRadius:14,border:'none',cursor:'pointer',fontFamily:'inherit',fontSize:15,fontWeight:700,color:'#fff',
          background:'linear-gradient(135deg,#0EBAC7,#0891A8)',boxShadow:'0 4px 16px rgba(14,186,199,0.35)',
          display:'flex',alignItems:'center',justifyContent:'center',gap:9}}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        {lang==='pt'?'Solicitar aluguel':'Request Rental'}
      </button>
    );

    // ── Rental form card ────────────────────────────────────────
    const selPeriodEntry = availablePeriods.find(p => p.period === reqPeriod) || availablePeriods[0];
    const totalPrice = selPeriodEntry ? selPeriodEntry.price * reqQty : 0;

    return (
      <div style={{borderRadius:16, border:'1.5px solid var(--pg-ink-200)', overflow:'hidden', background:'var(--pg-white)'}}>
        {/* Header */}
        <div style={{padding:'11px 14px', background:'var(--pg-ink-50)', borderBottom:'1px solid var(--pg-ink-200)',
          display:'flex', alignItems:'center', gap:8}}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0EBAC7" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span style={{fontSize:13, fontWeight:700, color:'var(--pg-ink-900)'}}>
            {lang==='pt'?'Solicitar aluguel':'Request Rental'}
          </span>
        </div>

        <div style={{padding:'14px', display:'flex', flexDirection:'column', gap:14}}>

          {/* Period selector — only shown when multiple periods available */}
          {availablePeriods.length > 1 && (
            <div>
              <div style={{fontSize:11, fontWeight:700, color:'var(--pg-ink-500)', textTransform:'uppercase',
                letterSpacing:'0.07em', marginBottom:8}}>
                {lang==='pt'?'Escolha o período':'Choose period'}
              </div>
              <div style={{display:'flex', gap:8}}>
                {availablePeriods.map(({period, price}) => {
                  const isOn = reqPeriod === period;
                  return (
                    <button key={period} onClick={()=>setReqPeriod(period)} style={{
                      flex:1, padding:'10px 6px', borderRadius:12, border:'none', cursor:'pointer',
                      background: isOn ? '#0EBAC7' : 'var(--pg-ink-100)',
                      fontFamily:'inherit', transition:'all .12s',
                      boxShadow: isOn ? '0 3px 10px rgba(14,186,199,0.3)' : 'none',
                    }}>
                      <div style={{fontSize:14, fontWeight:800, color: isOn?'#fff':'var(--pg-ink-900)'}}>
                        {getPeriodSfx(period)}
                      </div>
                      <div style={{fontSize:12, fontWeight:600, color: isOn?'rgba(255,255,255,0.85)':'var(--pg-ink-500)', marginTop:2}}>
                        ${price}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity stepper */}
          <div>
            <div style={{fontSize:11, fontWeight:700, color:'var(--pg-ink-500)', textTransform:'uppercase',
              letterSpacing:'0.07em', marginBottom:8}}>
              {lang==='pt'?'Quantidade':'Quantity'}
            </div>
            <div style={{display:'flex', alignItems:'center', gap:10}}>
              <button onClick={()=>setReqQty(q=>Math.max(1,q-1))} style={{
                width:38, height:38, borderRadius:10, border:'1.5px solid var(--pg-ink-200)',
                background:'var(--pg-ink-100)', cursor:'pointer', fontFamily:'inherit',
                fontSize:20, fontWeight:400, color:'var(--pg-ink-900)',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>−</button>
              <span style={{fontSize:20, fontWeight:800, color:'var(--pg-ink-900)', minWidth:28, textAlign:'center'}}>{reqQty}</span>
              <button onClick={()=>setReqQty(q=>Math.min(52,q+1))} style={{
                width:38, height:38, borderRadius:10, border:'1.5px solid var(--pg-ink-200)',
                background:'var(--pg-ink-100)', cursor:'pointer', fontFamily:'inherit',
                fontSize:20, fontWeight:400, color:'var(--pg-ink-900)',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>+</button>
              <span style={{fontSize:13, color:'var(--pg-ink-500)', marginLeft:4}}>
                {selPeriodEntry ? getPeriodLabel(selPeriodEntry.period, reqQty) : ''}
              </span>
            </div>
          </div>

          {/* Total */}
          <div style={{padding:'10px 12px', borderRadius:12, background:'var(--pg-ink-50)',
            border:'1px solid var(--pg-ink-200)', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <span style={{fontSize:13, color:'var(--pg-ink-500)', fontWeight:600}}>
              {lang==='pt'?'Total estimado':'Estimated total'}
            </span>
            <span style={{fontSize:20, fontWeight:800, color:'#0EBAC7', fontFamily:'var(--pg-font-display)'}}>
              ${fmtN(totalPrice, lang)}
            </span>
          </div>

          {/* Submit */}
          <button onClick={handleRequestRental} disabled={reqLoading || !reqPeriod} style={{
            width:'100%', height:50, borderRadius:13, border:'none',
            cursor: (reqLoading||!reqPeriod)?'default':'pointer',
            fontFamily:'inherit', fontSize:15, fontWeight:700, color:'#fff',
            background: (reqLoading||!reqPeriod) ? 'var(--pg-ink-300)' : 'linear-gradient(135deg,#0EBAC7,#0891A8)',
            boxShadow:'0 4px 14px rgba(14,186,199,0.30)',
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            transition:'all .15s', opacity:(reqLoading||!reqPeriod)?0.6:1,
          }}>
            {reqLoading
              ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeDasharray="31.4" strokeDashoffset="10"/></svg>
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            }
            {lang==='pt'?'Enviar pedido':'Send Request'}
          </button>
        </div>
      </div>
    );
  };

  // ── Owner's rental requests panel ─────────────────────────────
  const OwnerRequestsBlock = () => {
    if (!isRent || !isOwner) return null;
    if (ownerRequests.length === 0) return (
      <div style={{padding:'12px 14px',borderRadius:12,background:'var(--pg-ink-50)',border:'1px solid var(--pg-ink-200)',
        display:'flex',alignItems:'center',gap:10}}>
        <span style={{fontSize:16}}>📭</span>
        <span style={{fontSize:12,color:'var(--pg-ink-500)'}}>
          {lang==='pt'?'Nenhum pedido de aluguel ainda.':'No rental requests yet.'}
        </span>
      </div>
    );
    return (
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {ownerRequests.map(req => {
          const isPend      = req.status === 'pending';
          const isAppr      = req.status === 'approved';
          const isComp      = req.status === 'completed';
          const isDisp      = req.status === 'disputed';
          const isResolved  = req.status === 'resolved';
          const isCancelled = req.status === 'cancelled';
          // rgba backgrounds — work in both light and dark mode
          const rowBg     = isComp ? 'rgba(22,163,74,0.12)' : isAppr ? 'rgba(14,186,199,0.10)' : isPend ? 'rgba(245,158,11,0.12)' : isDisp ? 'rgba(245,158,11,0.10)' : isResolved ? 'rgba(99,102,241,0.10)' : isCancelled ? 'rgba(107,114,128,0.08)' : 'rgba(239,68,68,0.12)';
          const rowBorder = isComp ? 'rgba(22,163,74,0.40)' : isAppr ? 'rgba(14,186,199,0.40)' : isPend ? 'rgba(245,158,11,0.40)' : isDisp ? 'rgba(245,158,11,0.40)' : isResolved ? 'rgba(99,102,241,0.40)' : isCancelled ? 'rgba(107,114,128,0.25)' : 'rgba(239,68,68,0.40)';
          const statusColor = isComp ? '#22C55E' : isAppr ? '#0EBAC7' : isPend ? '#F59E0B' : isDisp ? '#F59E0B' : isResolved ? '#818CF8' : isCancelled ? 'var(--pg-ink-400)' : '#F87171';
          const statusLabel = isComp
            ? (lang==='pt'?'✓ Devolvido':'✓ Returned')
            : isAppr
              ? (lang==='pt'?'🔄 Em andamento':'🔄 In progress')
              : isPend
                ? (lang==='pt'?'⏳ Pendente':'⏳ Pending')
                : isDisp
                  ? (lang==='pt'?'⚠ Problema reportado':'⚠ Issue reported')
                  : isResolved
                    ? (lang==='pt'?'✅ Resolvido pelo suporte':'✅ Resolved by support')
                    : isCancelled
                      ? (lang==='pt'?'🚫 Cancelado':'🚫 Cancelled')
                      : (lang==='pt'?'✗ Recusado':'✗ Declined');
          return (
            <div key={req.id} style={{
              padding:'12px 14px',borderRadius:14,
              background: rowBg,
              border: `1.5px solid ${rowBorder}`,
            }}>
              {/* Row header: avatar + name + status + message btn */}
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <Avatar name={req.requester_name||'?'} size={32}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:5,flexWrap:'wrap'}}>
                    <span style={{fontSize:13,fontWeight:700,color:'var(--pg-ink-900)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{req.requester_name||'User'}</span>
                    {req.requester_verified && (
                      <span style={{fontSize:9,fontWeight:800,padding:'1px 6px',borderRadius:999,flexShrink:0,
                        background:'rgba(22,163,74,0.12)',color:'#16A34A',border:'1px solid rgba(22,163,74,0.3)',
                        display:'inline-flex',alignItems:'center',gap:2}}>
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                        {lang==='pt'?'Verificado':'Verified'}
                      </span>
                    )}
                  </div>
                  <div style={{fontSize:11,fontWeight:600,color:statusColor,marginTop:1}}>{statusLabel}</div>
                </div>
                <button onClick={()=>{ if(openChat) openChat({id:req.requester_id,name:req.requester_name||'User'}); if(onClose)onClose(); }}
                  style={{border:'none',background:'var(--pg-ink-200)',cursor:'pointer',borderRadius:10,
                    width:36,height:36,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  {Icon.msg(15,'var(--pg-ink-700)')}
                </button>
              </div>

              {/* Request details: period, qty, total */}
              {(req.period || req.quantity) && (
                <div style={{display:'flex',gap:6,marginTop:8,flexWrap:'wrap'}}>
                  {req.period && (
                    <span style={{fontSize:11,fontWeight:700,padding:'3px 9px',borderRadius:999,
                      background:'rgba(14,186,199,0.15)',color:'#0EBAC7',border:'1px solid rgba(14,186,199,0.3)'}}>
                      {getPeriodSfx(req.period)}
                    </span>
                  )}
                  {req.quantity && (
                    <span style={{fontSize:11,fontWeight:600,padding:'3px 9px',borderRadius:999,
                      background:'var(--pg-ink-100)',color:'var(--pg-ink-700)',border:'1px solid var(--pg-ink-200)'}}>
                      ×{req.quantity} {getPeriodLabel(req.period||'day', req.quantity > 1 ? 2 : 1).replace(/^\d+\s*/,'')}
                    </span>
                  )}
                  {req.total_price && (
                    <span style={{fontSize:11,fontWeight:800,padding:'3px 9px',borderRadius:999,
                      background:'rgba(22,163,74,0.12)',color:'#22C55E',border:'1px solid rgba(22,163,74,0.3)',marginLeft:'auto'}}>
                      ${fmtN(req.total_price, lang)}
                    </span>
                  )}
                </div>
              )}

              {/* Keep or Remove prompt — only for completed, not yet dismissed.
                  owner_kept_active is persisted to the DB (not just local state) so
                  the choice survives a page refresh instead of reappearing every time. */}
              {isComp && !req.owner_kept_active && !dismissedDecisions.has(req.id) && (
                <div style={{marginTop:10,borderRadius:12,overflow:'hidden',border:'1px solid rgba(22,163,74,0.30)'}}>
                  <div style={{padding:'10px 13px',background:'rgba(22,163,74,0.08)'}}>
                    <div style={{fontSize:12.5,fontWeight:700,color:'#15803D',marginBottom:2}}>
                      {lang==='pt'?'🎉 Aluguel concluído!':'🎉 Rental completed!'}
                    </div>
                    <div style={{fontSize:11.5,color:'#16A34A',lineHeight:1.5}}>
                      {lang==='pt'
                        ? 'Deseja manter este anúncio disponível para outros aluguéis, ou prefere removê-lo?'
                        : 'Would you like to keep this listing available for future rentals, or remove it?'}
                    </div>
                  </div>
                  <div style={{display:'flex',gap:0}}>
                    <button
                      onClick={async ()=>{
                        setDismissedDecisions(prev => { const s = new Set(prev); s.add(req.id); return s; });
                        setOwnerRequests(prev => prev.map(r => r.id === req.id ? {...r, owner_kept_active:true} : r));
                        if (window.sb) await window.sb.from('rental_requests').update({ owner_kept_active: true }).eq('id', req.id).catch(()=>{});
                      }}
                      style={{flex:1,padding:'10px 6px',border:'none',borderTop:'1px solid rgba(22,163,74,0.20)',borderRight:'1px solid rgba(22,163,74,0.20)',
                        cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:700,
                        background:'rgba(22,163,74,0.10)',color:'#15803D',
                        display:'flex',alignItems:'center',justifyContent:'center',gap:5}}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      {lang==='pt'?'Manter ativo':'Keep active'}
                    </button>
                    <button
                      onClick={async ()=>{
                        if (!window.sb) return;
                        const ok = window.confirm(lang==='pt'
                          ? 'Remover o anúncio do marketplace? Não pode ser desfeito.'
                          : 'Remove this listing from the marketplace? This cannot be undone.');
                        if (!ok) return;
                        const { error } = await window.sb.from('marketplace').delete().eq('id', item._id);
                        if (error) { showToast && showToast('❌ ' + error.message); return; }
                        showToast && showToast(lang==='pt'?'🗑️ Anúncio removido':'🗑️ Listing removed');
                        onDeleted && onDeleted(item._id);
                        onClose && onClose();
                      }}
                      style={{flex:1,padding:'10px 6px',border:'none',borderTop:'1px solid rgba(239,68,68,0.20)',
                        cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:700,
                        background:'rgba(239,68,68,0.06)',color:'#EF4444',
                        display:'flex',alignItems:'center',justifyContent:'center',gap:5}}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                      {lang==='pt'?'Remover anúncio':'Remove listing'}
                    </button>
                  </div>
                </div>
              )}

              {/* Approve / Decline buttons — only for pending */}
              {isPend && (
                <div style={{display:'flex',gap:8,marginTop:10}}>
                  <button onClick={()=>handleOwnerDecision(req.id,'approved')} style={{
                    flex:1,height:36,borderRadius:10,border:'none',cursor:'pointer',
                    background:'#16A34A',color:'#fff',fontSize:13,fontWeight:700,fontFamily:'inherit',
                    display:'flex',alignItems:'center',justifyContent:'center',gap:6,
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    {lang==='pt'?'Aprovar':'Approve'}
                  </button>
                  <button onClick={()=>handleOwnerDecision(req.id,'declined')} style={{
                    flex:1,height:36,borderRadius:10,border:'none',cursor:'pointer',
                    background:'#EF4444',color:'#fff',fontSize:13,fontWeight:700,fontFamily:'inherit',
                    display:'flex',alignItems:'center',justifyContent:'center',gap:6,
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    {lang==='pt'?'Recusar':'Decline'}
                  </button>
                </div>
              )}

              {/* Rate renter — persistent re-entry for both resolved disputes and normal completed rentals */}
              {(isResolved || isComp) && (
                <div style={{marginTop:10}}>
                  {!ownerRatedRequests.has(req.id) ? (
                    <button onClick={()=>{ setRatingStars(0); setRatingComment(''); setRatingSheet({ requestId:req.id, rateeId:req.requester_id, rateeName:req.requester_name||'Renter' }); }} style={{
                      width:'100%',height:36,borderRadius:10,border:'none',cursor:'pointer',fontFamily:'inherit',
                      background:'linear-gradient(135deg,#F59E0B,#D97706)',color:'#fff',
                      fontSize:12,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',gap:5,
                    }}>
                      ⭐ {lang==='pt'?'Avaliar o renter':'Rate the renter'}
                    </button>
                  ) : (
                    <div style={{fontSize:11,color:'#818CF8',fontWeight:600,textAlign:'center',padding:'5px 0',
                      display:'flex',alignItems:'center',justifyContent:'center',gap:5}}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      {lang==='pt'?'Renter avaliado':'Renter rated'}
                    </div>
                  )}
                </div>
              )}

              {/* Mark Returned / Report Problem — only for in-progress (approved) */}
              {isAppr && (
                <>
                  {(() => {
                    const beforePics = requestPhotos[req.id]?.before || [];
                    const hasBefore = beforePics.length > 0;
                    return (
                      <div style={{marginTop:9,borderRadius:12,overflow:'hidden',
                        border:`1.5px solid ${hasBefore?'rgba(14,186,199,0.35)':'rgba(245,158,11,0.45)'}`}}>
                        <div style={{padding:'9px 11px',background:hasBefore?'rgba(14,186,199,0.08)':'rgba(245,158,11,0.10)'}}>
                          <div style={{fontSize:11.5,fontWeight:800,color:hasBefore?'#0EBAC7':'#D97706'}}>
                            {hasBefore
                              ? (lang==='pt'?'📸 Estado inicial documentado':'📸 Initial condition documented')
                              : (lang==='pt'?'📸 Etapa obrigatória: fotos do estado inicial':'📸 Required step: initial condition photos')}
                          </div>
                          {!hasBefore && (
                            <div style={{fontSize:10.5,color:'#B45309',marginTop:2,lineHeight:1.4}}>
                              {lang==='pt'
                                ? 'Tire fotos do item antes de entregar — protege você em caso de dano.'
                                : 'Photograph the item before handing it over — protects you if it comes back damaged.'}
                            </div>
                          )}
                        </div>
                        {hasBefore && (
                          <div style={{display:'flex',gap:6,padding:'8px 11px',alignItems:'center',flexWrap:'wrap',background:'var(--pg-white)'}}>
                            {beforePics.map((url,i)=>(
                              <img key={i} src={url} alt="" style={{width:46,height:46,objectFit:'cover',borderRadius:8,border:'1.5px solid rgba(14,186,199,0.5)'}}/>
                            ))}
                          </div>
                        )}
                        {beforePics.length < 3 && (
                          <button
                            onClick={()=>{ setAddingPhotoFor(req.id); if(beforePhotoRef.current) beforePhotoRef.current.click(); }}
                            disabled={photoUploading && addingPhotoFor===req.id}
                            style={{width:'100%',padding:'9px',border:'none',
                              borderTop: hasBefore ? '1px solid rgba(14,186,199,0.20)' : 'none',
                              cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:700,
                              background: hasBefore ? 'rgba(14,186,199,0.06)' : '#D97706',
                              color: hasBefore ? '#0EBAC7' : '#fff',
                              display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
                            {photoUploading&&addingPhotoFor===req.id
                              ? '⏳'
                              : <>📷 {hasBefore
                                  ? (lang==='pt'?'Adicionar mais':'Add more')
                                  : (lang==='pt'?'Tirar fotos agora':'Take photos now')}</>}
                          </button>
                        )}
                      </div>
                    );
                  })()}
                  <div style={{display:'flex',gap:6,marginTop:9}}>
                    <button onClick={()=>handleMarkReturned(req.id, req)} style={{
                      flex:2,height:36,borderRadius:10,border:'none',cursor:'pointer',
                      background:'#16A34A',color:'#fff',fontSize:12,fontWeight:700,fontFamily:'inherit',
                      display:'flex',alignItems:'center',justifyContent:'center',gap:5,
                    }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      {lang==='pt'?'Devolvido':'Returned'}
                    </button>
                    <button onClick={()=>{ setDisputeSeverity('serious'); setDisputeDesc(''); setDisputeForm({requestId:req.id, req}); }} style={{
                      flex:1,height:36,borderRadius:10,cursor:'pointer',fontFamily:'inherit',
                      border:'1.5px solid rgba(245,158,11,0.5)',
                      background:'rgba(245,158,11,0.08)',color:'#F59E0B',fontSize:12,fontWeight:700,
                      display:'flex',alignItems:'center',justifyContent:'center',gap:5,
                    }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                      {lang==='pt'?'Problema':'Issue'}
                    </button>
                  </div>
                  {/* Owner cancel active rental */}
                  <button onClick={()=>handleOwnerCancelRental(req.id)} style={{
                    width:'100%',marginTop:6,padding:'7px',borderRadius:10,cursor:'pointer',fontFamily:'inherit',
                    border:'1px solid rgba(107,114,128,0.30)',background:'rgba(107,114,128,0.06)',
                    color:'var(--pg-ink-400)',fontSize:11,fontWeight:600,
                    display:'flex',alignItems:'center',justifyContent:'center',gap:5,
                  }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    {lang==='pt'?'Cancelar aluguel':'Cancel rental'}
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const MarkSoldBlock = () => (
    <>
      {isOwner && !isSold && (
        <button onClick={()=>setMarkSoldOpen(true)} style={{
          width:'100%', padding:'13px', borderRadius:14,
          border:'none', cursor:'pointer', fontFamily:'inherit',
          background:'linear-gradient(135deg,#22C55E,#15803D)',
          color:'#fff', fontSize:14, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          boxShadow:'0 4px 14px rgba(21,128,61,0.35)',
          transition:'all .15s',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12.99V2h10.99l8.6 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
          {lang==='pt'?'Marcar como vendido':lang==='es'?'Marcar como vendido':'Mark as Sold'}
        </button>
      )}
      {isSold && (
        <div style={{
          padding:'12px 16px', borderRadius:12,
          background:'linear-gradient(135deg,#F0FDF4,#DCFCE7)', border:'1.5px solid #86EFAC',
          display:'flex', alignItems:'center', gap:10,
        }}>
          <div style={{
            width:32, height:32, borderRadius:'50%', background:'#16A34A',
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div>
            <div style={{fontSize:14, fontWeight:800, color:'#15803D'}}>
              {lang==='pt'?'Vendido!':lang==='es'?'¡Vendido!':'Item Sold!'}
            </div>
            <div style={{fontSize:12, color:'#16A34A', marginTop:1}}>
              {lang==='pt'?'Esta negociação foi concluída.':'This deal has been completed.'}
            </div>
          </div>
        </div>
      )}
    </>
  );

  // ── Location sub-component ────────────────────────────────────
  const LocationSection = () => !item.loc ? null : (
    <div>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12}}>
        <div style={{display:'flex', alignItems:'center', gap:6}}>
          {Icon.pin(14,'var(--pg-ink-500)')}
          <span style={{fontSize:13, fontWeight:700, color:'var(--pg-ink-700)'}}>
            {lang==='pt'?'Localização':lang==='es'?'Ubicación':'Location'}
          </span>
        </div>
        <a href={`https://www.google.com/maps/search/${encodeURIComponent((item.loc||'')+', FL')}`}
          target="_blank" rel="noreferrer"
          style={{fontSize:12, fontWeight:600, color:'var(--pg-blue-500)', textDecoration:'none', display:'flex', alignItems:'center', gap:4}}>
          {lang==='pt'?'Abrir no Maps':'Open in Maps'} ↗
        </a>
      </div>
      {mapCoords ? (
        <div style={{borderRadius:14, overflow:'hidden', border:'1px solid var(--pg-ink-200)', height:200, position:'relative'}}>
          <iframe
            title="listing-location"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapCoords.lon-0.05},${mapCoords.lat-0.04},${mapCoords.lon+0.05},${mapCoords.lat+0.04}&layer=mapnik&marker=${mapCoords.lat},${mapCoords.lon}`}
            style={{width:'100%', height:'100%', border:'none', display:'block'}}
            loading="lazy"
          />
          <div style={{position:'absolute', bottom:10, left:10,
            background:'rgba(0,0,0,0.60)', backdropFilter:'blur(6px)',
            borderRadius:999, padding:'4px 10px',
            fontSize:11, fontWeight:600, color:'#fff', display:'flex', alignItems:'center', gap:5}}>
            {Icon.pin(10,'#fff')} {item.loc}
          </div>
        </div>
      ) : mapLoading ? (
        <div style={{height:200, borderRadius:14, background:'var(--pg-ink-100)',
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:'var(--pg-ink-400)'}}>
          {lang==='pt'?'Carregando mapa…':'Loading map…'}
        </div>
      ) : (
        <a href={`https://www.google.com/maps/search/${encodeURIComponent((item.loc||'')+', FL')}`}
          target="_blank" rel="noreferrer"
          style={{display:'flex', alignItems:'center', gap:10, padding:'14px 16px', borderRadius:12,
            background:'var(--pg-ink-50)', border:'1px solid var(--pg-ink-200)', textDecoration:'none'}}>
          {Icon.pin(16,'var(--pg-blue-500)')}
          <span style={{fontSize:13, fontWeight:600, color:'var(--pg-blue-500)'}}>{item.loc}, FL</span>
          <span style={{marginLeft:'auto', fontSize:11, color:'var(--pg-ink-400)'}}>↗</span>
        </a>
      )}
    </div>
  );

  // ── More from seller sub-component ───────────────────────────
  const MoreFromSeller = () => {
    const others = liveMarket.filter(m =>
      m.author_id && m.author_id === item.author_id &&
      m._id !== item._id &&
      (m.status === 'approved' || m.status === 'active')
    );
    if (others.length === 0) return null;
    return (
      <div>
        <div style={{fontSize:13, fontWeight:700, color:'var(--pg-ink-900)', marginBottom:12}}>
          {lang==='pt'?`Mais de ${authorDisplay}`:lang==='es'?`Más de ${authorDisplay}`:`More from ${authorDisplay}`}
        </div>
        <div className="pg-scroll-x" style={{display:'flex', gap:12, paddingBottom:4}}>
          {others.slice(0,8).map(m => (
            <button key={m._id} onClick={()=>onOpenListing&&onOpenListing(m)}
              className="pg-press"
              style={{
                flexShrink:0, width:156, padding:0, border:'1px solid var(--pg-ink-200)',
                borderRadius:14, background:'var(--pg-white)', cursor:'pointer',
                textAlign:'left', fontFamily:'inherit', overflow:'hidden',
                display:'flex', flexDirection:'column', boxShadow:'var(--pg-shadow-1)',
              }}>
              <div style={{height:100, background:'var(--pg-ink-100)', overflow:'hidden', flexShrink:0}}>
                {(m.photoUrls&&m.photoUrls[0])||m.photoUrl
                  ? <img src={(m.photoUrls&&m.photoUrls[0])||m.photoUrl} alt={m.name}
                      style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                  : <NoPhotoPlaceholder height={100} small/>
                }
              </div>
              <div style={{padding:'8px 10px 10px'}}>
                <div style={{fontSize:12,fontWeight:700,color:'var(--pg-ink-900)',lineHeight:1.3,
                  overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.name}</div>
                <div style={{fontSize:13,fontWeight:700,color:'var(--pg-blue-500)',marginTop:3}}>
                  {m.priceMode==='neg'?(lang==='pt'?'Negociável':'Negotiable'):`$${fmtN(m.price, lang)}`}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const MarkSoldSheetSlot = () => (
    <Sheet open={markSoldOpen} onClose={()=>setMarkSoldOpen(false)} height="auto">
      {markSoldOpen && (
        <MarkSoldSheet
          item={item} lang={lang} currentUser={currentUser}
          onClose={()=>setMarkSoldOpen(false)}
          showToast={showToast}
          onSold={(sellerRating)=>{ setMarkSoldOpen(false); onAfterSold && onAfterSold(sellerRating); }}
        />
      )}
    </Sheet>
  );

  // ── Rating overlay — floats above both desktop and mobile layouts ─
  const RatingOverlay = () => {
    if (!ratingSheet) return null;
    const starLabels   = ['','⭐ Very bad','😐 OK','🙂 Good','😊 Very good','🌟 Excellent'];
    const starLabelsPt = ['','⭐ Muito ruim','😐 Regular','🙂 Bom','😊 Muito bom','🌟 Excelente'];
    return (
      <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',zIndex:9500,display:'flex',alignItems:'flex-end'}}
        onClick={()=>setRatingSheet(null)}>
        <div onClick={e=>e.stopPropagation()}
          style={{width:'100%',maxWidth:520,margin:'0 auto',background:'var(--pg-white)',
            borderRadius:'22px 22px 0 0',padding:'24px 24px 44px',
            boxShadow:'0 -8px 40px rgba(0,0,0,0.18)'}}>
          {/* Handle */}
          <div style={{width:36,height:4,borderRadius:999,background:'var(--pg-ink-200)',margin:'0 auto 20px'}}/>
          {/* Title */}
          <div style={{fontSize:20,fontWeight:800,color:'var(--pg-ink-900)',fontFamily:'var(--pg-font-display)',textAlign:'center',marginBottom:4}}>
            {lang==='pt'?'Avalie sua experiência':'Rate your experience'}
          </div>
          <div style={{fontSize:13,color:'var(--pg-ink-500)',textAlign:'center',marginBottom:24}}>
            {lang==='pt'
              ? `Como foi seu aluguel com ${ratingSheet.rateeName}?`
              : `How was your rental with ${ratingSheet.rateeName}?`}
          </div>
          {/* Stars */}
          <div style={{display:'flex',justifyContent:'center',gap:8,marginBottom:20}}>
            {[1,2,3,4,5].map(s => (
              <button key={s}
                onMouseEnter={()=>setRatingHover(s)}
                onMouseLeave={()=>setRatingHover(0)}
                onClick={()=>setRatingStars(s)}
                style={{background:'none',border:'none',cursor:'pointer',padding:'4px 2px',fontSize:40,lineHeight:1,
                  color:(ratingHover||ratingStars)>=s?'#F59E0B':'var(--pg-ink-200)',
                  transition:'color .1s, transform .12s',
                  transform:(ratingHover||ratingStars)>=s?'scale(1.18)':'scale(1)'}}>
                ★
              </button>
            ))}
          </div>
          {/* Star label */}
          {ratingStars > 0 && (
            <div style={{textAlign:'center',fontSize:13,fontWeight:700,color:'var(--pg-ink-600)',marginBottom:18,marginTop:-8}}>
              {(lang==='pt'?starLabelsPt:starLabels)[ratingStars]}
            </div>
          )}
          {/* Comment */}
          <textarea
            value={ratingComment}
            onChange={e=>setRatingComment(e.target.value)}
            maxLength={200}
            placeholder={lang==='pt'?'Comentário opcional (máx. 200 caracteres)...':'Optional comment (max. 200 chars)...'}
            rows={3}
            style={{width:'100%',borderRadius:12,border:'1.5px solid var(--pg-ink-200)',background:'var(--pg-ink-50)',
              color:'var(--pg-ink-900)',fontFamily:'inherit',fontSize:14,padding:'11px 13px',
              resize:'none',boxSizing:'border-box',outline:'none',marginBottom:16,display:'block'}}
          />
          {/* Submit */}
          <button onClick={handleSubmitRating}
            disabled={ratingStars===0||ratingLoading}
            style={{width:'100%',height:50,borderRadius:14,border:'none',
              cursor:ratingStars===0?'not-allowed':'pointer',fontFamily:'inherit',
              fontSize:15,fontWeight:800,color:'#fff',marginBottom:10,
              background:ratingStars===0?'var(--pg-ink-300)':'linear-gradient(135deg,#F59E0B,#D97706)',
              opacity:ratingStars===0?0.5:1,transition:'all .15s'}}>
            {ratingLoading
              ? (lang==='pt'?'Enviando...':'Sending...')
              : (lang==='pt'?'Enviar avaliação':'Submit rating')}
          </button>
          <button onClick={()=>setRatingSheet(null)}
            style={{width:'100%',height:42,borderRadius:12,border:'1.5px solid var(--pg-ink-200)',
              background:'transparent',color:'var(--pg-ink-500)',fontSize:14,fontWeight:600,
              cursor:'pointer',fontFamily:'inherit'}}>
            {lang==='pt'?'Agora não':'Not now'}
          </button>
        </div>
      </div>
    );
  };

  // ── Dispute report form ───────────────────────────────────────
  const DisputeFormSheet = () => {
    if (!disputeForm) return null;
    const sevs = [
      { id:'minor',    emoji:'🟡', label:lang==='pt'?'Leve':'Minor',    desc:lang==='pt'?'Ex: pequeno atraso':'e.g. small delay' },
      { id:'serious',  emoji:'🟠', label:lang==='pt'?'Sério':'Serious',  desc:lang==='pt'?'Ex: dano no item':'e.g. item damaged' },
      { id:'critical', emoji:'🔴', label:lang==='pt'?'Crítico':'Critical',desc:lang==='pt'?'Não devolvido':'Not returned' },
    ];
    const sevColor = { minor:'#EAB308', serious:'#F59E0B', critical:'#EF4444' };

    const addPhotos = (files) => {
      const arr = Array.from(files).filter(f=>f.type.startsWith('image/')).slice(0, 5 - disputePhotos.length);
      const items = arr.map(file => ({ file, preview: URL.createObjectURL(file) }));
      setDisputePhotos(prev => [...prev, ...items].slice(0, 5));
    };
    const removePhoto = (idx) => {
      setDisputePhotos(prev => { URL.revokeObjectURL(prev[idx].preview); return prev.filter((_,i)=>i!==idx); });
    };

    return (
      <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',zIndex:9600,display:'flex',alignItems:'flex-end'}}
        onClick={()=>{ setDisputeForm(null); setDisputePhotos([]); }}>
        <div onClick={e=>e.stopPropagation()}
          style={{width:'100%',maxWidth:520,margin:'0 auto',background:'var(--pg-white)',
            borderRadius:'22px 22px 0 0',padding:'20px 20px 44px',boxShadow:'0 -8px 40px rgba(0,0,0,0.2)',
            maxHeight:'92vh',overflowY:'auto'}}>

          <div style={{width:36,height:4,borderRadius:999,background:'var(--pg-ink-200)',margin:'0 auto 18px'}}/>

          <div style={{fontSize:19,fontWeight:800,color:'var(--pg-ink-900)',marginBottom:4}}>
            ⚠ {lang==='pt'?'Reportar problema':'Report an issue'}
          </div>
          <div style={{fontSize:12.5,color:'var(--pg-ink-500)',marginBottom:16}}>
            {lang==='pt'
              ?`Este report será analisado pela equipe PoolGuyX e pode resultar em penalidades para ${disputeForm.req.requester_name||'o renter'}.`
              :`This report will be reviewed by PoolGuyX and may result in penalties for ${disputeForm.req.requester_name||'the renter'}.`}
          </div>

          {/* Banner de evidências */}
          <div style={{borderRadius:12,padding:'12px 14px',marginBottom:18,
            background:'rgba(59,130,246,0.07)',border:'1.5px solid rgba(59,130,246,0.25)'}}>
            <div style={{fontSize:13,fontWeight:700,color:'#3B82F6',marginBottom:4}}>
              📎 {lang==='pt'?'Adicione o máximo de provas possível':lang==='es'?'Agrega el máximo de pruebas posible':'Add as much evidence as possible'}
            </div>
            <div style={{fontSize:12,color:'#3B82F6',lineHeight:1.55,opacity:0.85}}>
              {lang==='pt'
                ?'Nossa equipe técnica vai analisar todas as fotos e informações antes de tomar qualquer decisão. Prints, fotos do estado do equipamento e comprovantes aumentam suas chances de resolução.'
                :lang==='es'
                ?'Nuestro equipo técnico analizará todas las fotos e información antes de tomar cualquier decisión. Capturas de pantalla, fotos del equipamiento y comprobantes aumentan tus posibilidades de resolución.'
                :'Our technical team will review all photos and information before making any decision. Screenshots, equipment condition photos and proof of communication increase your chances of resolution.'}
            </div>
          </div>

          {/* Gravidade */}
          <div style={{fontSize:12,fontWeight:700,color:'var(--pg-ink-700)',marginBottom:8}}>
            {lang==='pt'?'Gravidade:':'Severity:'}
          </div>
          <div style={{display:'flex',gap:7,marginBottom:16}}>
            {sevs.map(s=>(
              <button key={s.id} onClick={()=>setDisputeSeverity(s.id)} style={{
                flex:1,padding:'10px 6px',borderRadius:12,cursor:'pointer',fontFamily:'inherit',
                border:`1.5px solid ${disputeSeverity===s.id?sevColor[s.id]:'var(--pg-ink-200)'}`,
                background:disputeSeverity===s.id?`rgba(${s.id==='critical'?'239,68,68':s.id==='serious'?'245,158,11':'234,179,8'},0.08)`:'var(--pg-ink-50)',
                transition:'all .12s',
              }}>
                <div style={{fontSize:13,fontWeight:700,color:disputeSeverity===s.id?sevColor[s.id]:'var(--pg-ink-700)'}}>{s.emoji} {s.label}</div>
                <div style={{fontSize:10,color:'var(--pg-ink-400)',marginTop:3}}>{s.desc}</div>
              </button>
            ))}
          </div>

          {/* Descrição */}
          <div style={{fontSize:12,fontWeight:700,color:'var(--pg-ink-700)',marginBottom:6}}>
            {lang==='pt'?'Descrição detalhada:':lang==='es'?'Descripción detallada:':'Detailed description:'}
          </div>
          <textarea
            value={disputeDesc}
            onChange={e=>setDisputeDesc(e.target.value)}
            maxLength={500}
            placeholder={lang==='pt'?'Descreva o problema com o máximo de detalhes possível...':lang==='es'?'Describe el problema con el máximo de detalle posible...':'Describe the issue with as much detail as possible...'}
            rows={4}
            style={{width:'100%',borderRadius:12,border:'1.5px solid var(--pg-ink-200)',background:'var(--pg-ink-50)',
              color:'var(--pg-ink-900)',fontFamily:'inherit',fontSize:14,padding:'11px 13px',
              resize:'none',boxSizing:'border-box',outline:'none',marginBottom:16,display:'block'}}
          />

          {/* Upload de fotos */}
          <div style={{fontSize:12,fontWeight:700,color:'var(--pg-ink-700)',marginBottom:8}}>
            📷 {lang==='pt'?`Fotos como prova (${disputePhotos.length}/5)`:lang==='es'?`Fotos como prueba (${disputePhotos.length}/5)`:`Evidence photos (${disputePhotos.length}/5)`}
          </div>

          {/* Grid de previews */}
          {disputePhotos.length > 0 && (
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:10}}>
              {disputePhotos.map((p,i)=>(
                <div key={i} style={{position:'relative',width:76,height:76,borderRadius:10,overflow:'hidden',flexShrink:0,
                  border:'1.5px solid var(--pg-ink-200)'}}>
                  <img src={p.preview} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                  <button onClick={()=>removePhoto(i)} style={{
                    position:'absolute',top:2,right:2,width:20,height:20,borderRadius:'50%',border:'none',
                    background:'rgba(0,0,0,0.65)',color:'#fff',fontSize:11,fontWeight:900,
                    cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',lineHeight:1,padding:0}}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Botão de adicionar fotos */}
          {disputePhotos.length < 5 && (
            <label style={{
              display:'flex',alignItems:'center',justifyContent:'center',gap:8,
              height:44,borderRadius:12,border:'1.5px dashed var(--pg-ink-300)',
              background:'var(--pg-ink-50)',cursor:'pointer',marginBottom:16,
              fontSize:13,fontWeight:600,color:'var(--pg-ink-500)',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              {lang==='pt'?'Adicionar fotos':lang==='es'?'Agregar fotos':'Add photos'}
              <input type="file" accept="image/*" multiple style={{display:'none'}}
                onChange={e=>{ addPhotos(e.target.files); e.target.value=''; }}/>
            </label>
          )}

          {/* Botão de enviar */}
          <button onClick={handleReportProblemFull}
            disabled={!disputeDesc.trim()||disputeLoading}
            style={{width:'100%',height:50,borderRadius:14,border:'none',
              cursor:!disputeDesc.trim()?'not-allowed':'pointer',fontFamily:'inherit',
              fontSize:15,fontWeight:800,color:'#fff',marginBottom:10,
              background:!disputeDesc.trim()?'var(--pg-ink-300)':'linear-gradient(135deg,#EF4444,#DC2626)',
              opacity:!disputeDesc.trim()?0.5:1,transition:'all .15s'}}>
            {disputeLoading
              ? (lang==='pt'?`Enviando${disputePhotos.length>0?` ${disputePhotos.length} foto${disputePhotos.length>1?'s':''}...`:'...'}`:lang==='es'?'Enviando...':'Sending...')
              : (lang==='pt'?'Enviar report':lang==='es'?'Enviar reporte':'Submit report')}
          </button>
          <button onClick={()=>{ setDisputeForm(null); setDisputePhotos([]); }}
            style={{width:'100%',height:42,borderRadius:12,border:'1.5px solid var(--pg-ink-200)',
              background:'transparent',color:'var(--pg-ink-500)',fontSize:14,fontWeight:600,
              cursor:'pointer',fontFamily:'inherit'}}>
            {lang==='pt'?'Cancelar':lang==='es'?'Cancelar':'Cancel'}
          </button>
        </div>
      </div>
    );
  };

  // ── After-photo comparison step ───────────────────────────────
  const AfterPhotoSheet = () => {
    if (!afterStep) return null;
    const beforePics = requestPhotos[afterStep.requestId]?.before || [];
    return (
      <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.65)',zIndex:9550,overflowY:'auto',display:'flex',alignItems:'flex-end'}}>
        <div style={{width:'100%',maxWidth:520,margin:'0 auto',background:'var(--pg-white)',
          borderRadius:'22px 22px 0 0',padding:'24px 24px 44px',boxShadow:'0 -8px 40px rgba(0,0,0,0.2)'}}>
          <div style={{width:36,height:4,borderRadius:999,background:'var(--pg-ink-200)',margin:'0 auto 20px'}}/>
          <div style={{fontSize:19,fontWeight:800,color:'var(--pg-ink-900)',marginBottom:4}}>
            📸 {lang==='pt'?'Fotos da devolução':'Return photos'}
          </div>
          <div style={{fontSize:12.5,color:'var(--pg-ink-500)',marginBottom:20}}>
            {lang==='pt'
              ?'Você registrou o estado antes. Adicione fotos do estado atual para documentar a devolução.'
              :'You have before photos. Add after photos to document the return condition.'}
          </div>
          <div style={{fontSize:11,fontWeight:700,color:'var(--pg-ink-500)',letterSpacing:'.06em',textTransform:'uppercase',marginBottom:8}}>
            {lang==='pt'?'Estado antes:':'Before:'}
          </div>
          <div style={{display:'flex',gap:8,marginBottom:18,flexWrap:'wrap'}}>
            {beforePics.map((url,i)=>(
              <img key={i} src={url} alt="" style={{width:64,height:64,objectFit:'cover',borderRadius:10,border:'2px solid rgba(14,186,199,0.5)'}}/>
            ))}
          </div>
          <div style={{fontSize:11,fontWeight:700,color:'var(--pg-ink-500)',letterSpacing:'.06em',textTransform:'uppercase',marginBottom:8}}>
            {lang==='pt'?`Estado depois (${afterPhotos.length}/4):`:`After (${afterPhotos.length}/4):`}
          </div>
          <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
            {afterPhotos.map((url,i)=>(
              <div key={i} style={{position:'relative',flexShrink:0}}>
                <img src={url} alt="" style={{width:64,height:64,objectFit:'cover',borderRadius:10,border:'2px solid rgba(22,163,74,0.5)'}}/>
                <button onClick={()=>setAfterPhotos(p=>p.filter((_,j)=>j!==i))}
                  style={{position:'absolute',top:-6,right:-6,width:20,height:20,borderRadius:'50%',border:'none',
                    background:'#EF4444',color:'#fff',fontSize:12,cursor:'pointer',padding:0,
                    display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,lineHeight:'20px'}}>×</button>
              </div>
            ))}
            {afterPhotos.length < 4 && (
              <button onClick={()=>afterPhotoRef.current&&afterPhotoRef.current.click()}
                disabled={afterUploading}
                style={{width:64,height:64,borderRadius:10,border:'2px dashed var(--pg-ink-300)',
                  background:'var(--pg-ink-50)',cursor:'pointer',fontFamily:'inherit',
                  fontSize:afterUploading?13:24,color:'var(--pg-ink-400)',
                  display:'flex',alignItems:'center',justifyContent:'center'}}>
                {afterUploading?'⏳':'+'}
              </button>
            )}
          </div>
          <button onClick={handleConfirmReturn}
            disabled={afterPhotos.length===0}
            style={{width:'100%',height:50,borderRadius:14,border:'none',
              cursor:afterPhotos.length===0?'not-allowed':'pointer',fontFamily:'inherit',
              fontSize:15,fontWeight:800,color:'#fff',marginBottom:10,
              background:afterPhotos.length===0?'var(--pg-ink-300)':'linear-gradient(135deg,#16A34A,#15803D)',
              opacity:afterPhotos.length===0?0.5:1,transition:'all .15s'}}>
            {lang==='pt'?'Confirmar devolução':'Confirm return'}
          </button>
          <button onClick={()=>setAfterStep(null)}
            style={{width:'100%',height:42,borderRadius:12,border:'1.5px solid var(--pg-ink-200)',
              background:'transparent',color:'var(--pg-ink-500)',fontSize:14,fontWeight:600,
              cursor:'pointer',fontFamily:'inherit'}}>
            {lang==='pt'?'Cancelar':'Cancel'}
          </button>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════
  // ── DESKTOP LAYOUT (≥ 900px) ─────────────────────────────────
  // ══════════════════════════════════════════════════════════════
  if (isDesktop) {
    return (
      <div style={{minHeight:'100vh', background:'var(--pg-ink-50)'}}>

        {/* ── Top navigation bar ── */}
        <div style={{
          position:'sticky', top:0, zIndex:50,
          background:'var(--pg-white)',
          borderBottom:'1px solid var(--pg-ink-150,var(--pg-ink-200))',
          boxShadow:'0 1px 12px rgba(0,0,0,0.06)',
        }}>
          <div style={{maxWidth:1140, margin:'0 auto', padding:'0 32px', height:60,
            display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            {/* Back button */}
            <button onClick={onClose} style={{
              display:'flex', alignItems:'center', gap:6, border:'none', background:'transparent',
              cursor:'pointer', color:'var(--pg-blue-600)', fontWeight:600, fontSize:14,
              fontFamily:'inherit', padding:'8px 0', borderRadius:8,
            }}>
              {Icon.chev(18,'var(--pg-blue-600)','left')}
              {lang==='pt'?'Voltar ao Marketplace':lang==='es'?'Volver al Marketplace':'Back to Marketplace'}
            </button>

            {/* Breadcrumb */}
            <div style={{fontSize:13, color:'var(--pg-ink-400)', display:'flex', alignItems:'center', gap:6}}>
              <span style={{color:'var(--pg-ink-300)'}}>Marketplace</span>
              <span style={{color:'var(--pg-ink-200)'}}>›</span>
              <span style={{color:'var(--pg-ink-600)', fontWeight:600, maxWidth:280,
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{item.name}</span>
            </div>

            {/* Right actions */}
            <div style={{display:'flex', gap:8}}>
              {!isOwner && !isStatic && (
              <button onClick={onToggleSave} style={{
                display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:10,
                border: isSaved?'1.5px solid #FCA5A5':'1.5px solid var(--pg-ink-200)',
                background: isSaved?'#FEF2F2':'var(--pg-ink-50)',
                color: isSaved?'#EF4444':'var(--pg-ink-500)',
                cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:600,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill={isSaved?'currentColor':'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                {isSaved?(lang==='pt'?'Salvo':'Saved'):(lang==='pt'?'Salvar':'Save')}
              </button>
              )}
              <button onClick={onShare} style={{
                display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:10,
                border:'1.5px solid var(--pg-ink-200)', background:'var(--pg-ink-50)',
                color:'var(--pg-ink-500)', cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:600,
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                {lang==='pt'?'Compartilhar':'Share'}
              </button>
              {canDelete && !isStatic && (
                <button onClick={handleAdminDelete} disabled={deleting} style={{
                  display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:10,
                  border:'1.5px solid #FCA5A5', background:'#FEF2F2', color:'#EF4444',
                  cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:600,
                  opacity: deleting?0.6:1,
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                  {lang==='pt'?'Excluir':'Delete'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Main content grid ── */}
        <div style={{maxWidth:1140, margin:'0 auto', padding:'36px 32px 80px'}}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 420px', gap:36, alignItems:'start'}}>

            {/* ── LEFT COLUMN: Photos + description + map + more ── */}
            <div style={{display:'flex', flexDirection:'column', gap:32}}>

              {/* Main photo */}
              <div style={{borderRadius:20, overflow:'hidden', background:'var(--pg-ink-100)',
                position:'relative', aspectRatio:'4/3',
                boxShadow:'0 4px 32px rgba(0,0,0,0.10)'}}>
                {allPhotos.length > 0
                  ? <img
                      src={allPhotos[imgIdx]} alt={item.name}
                      onClick={()=>setViewerOpen(true)}
                      style={{width:'100%', height:'100%', objectFit:'cover', display:'block',
                        cursor:'zoom-in', transition:'transform .3s ease'}}
                    />
                  : item.type === 'route'
                    ? <RouteNoPhotoHero item={item} lang={lang}/>
                    : <NoPhotoPlaceholder height='100%'/>
                }

                {/* Status badge */}
                {isSold && (
                  <div style={{position:'absolute', inset:0, background:'rgba(0,0,0,0.45)',
                    display:'flex', alignItems:'center', justifyContent:'center', zIndex:3}}>
                    <div style={{
                      background:'#16A34A', color:'#fff', borderRadius:16,
                      padding:'12px 28px', fontSize:22, fontWeight:900,
                      letterSpacing:'0.06em', textTransform:'uppercase',
                      boxShadow:'0 4px 24px rgba(22,163,74,0.4)',
                    }}>SOLD</div>
                  </div>
                )}

                {/* Type badge */}
                <div style={{position:'absolute', top:16, left:16, zIndex:4}}>
                  <TypeBadge/>
                </div>

                {/* Admin badge */}
                {isAdmin && (
                  <span style={{position:'absolute', top:16, right:16, zIndex:4,
                    fontSize:10, fontWeight:700, padding:'4px 10px', borderRadius:6,
                    background:'rgba(239,68,68,0.85)', color:'#fff', letterSpacing:'0.05em'}}>
                    🛡 ADMIN
                  </span>
                )}

                {/* Nav arrows */}
                {imgIdx > 0 && (
                  <button onClick={()=>setImgIdx(i=>i-1)} style={{
                    position:'absolute', left:14, top:'50%', transform:'translateY(-50%)',
                    width:42, height:42, borderRadius:'50%', background:'rgba(255,255,255,0.92)',
                    border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                    boxShadow:'0 2px 12px rgba(0,0,0,0.20)', zIndex:4, transition:'all .15s',
                  }}>{Icon.chev(22,'#111','left')}</button>
                )}
                {imgIdx < allPhotos.length - 1 && (
                  <button onClick={()=>setImgIdx(i=>i+1)} style={{
                    position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
                    width:42, height:42, borderRadius:'50%', background:'rgba(255,255,255,0.92)',
                    border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                    boxShadow:'0 2px 12px rgba(0,0,0,0.20)', zIndex:4, transition:'all .15s',
                  }}>{Icon.chev(22,'#111','right')}</button>
                )}

                {/* Photo counter */}
                {allPhotos.length > 1 && (
                  <div style={{position:'absolute', bottom:14, right:16, zIndex:4,
                    background:'rgba(0,0,0,0.50)', backdropFilter:'blur(4px)',
                    borderRadius:999, padding:'3px 10px', fontSize:11, fontWeight:700, color:'#fff'}}>
                    {imgIdx+1} / {allPhotos.length}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {allPhotos.length > 1 && (
                <div style={{display:'flex', gap:10, flexWrap:'wrap'}}>
                  {allPhotos.map((url, i) => (
                    <button key={i} onClick={()=>setImgIdx(i)} style={{
                      width:80, height:80, borderRadius:12, overflow:'hidden', padding:0,
                      cursor:'pointer', flexShrink:0, transition:'all .15s',
                      border: i===imgIdx
                        ? '2.5px solid var(--pg-blue-500)'
                        : '2px solid var(--pg-ink-200)',
                      opacity: i===imgIdx ? 1 : 0.65,
                      boxShadow: i===imgIdx ? '0 0 0 3px rgba(59,130,246,0.15)' : 'none',
                    }}>
                      <img src={url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                    </button>
                  ))}
                </div>
              )}

              {/* Description */}
              {item.description && (
                <div style={{
                  background:'var(--pg-white)', borderRadius:16, padding:'24px',
                  border:'1px solid var(--pg-ink-200)', boxShadow:'0 1px 4px rgba(0,0,0,0.04)',
                }}>
                  <div style={{fontSize:11, fontWeight:800, color:'var(--pg-ink-400)',
                    letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:12}}>
                    {lang==='pt'?'DESCRIÇÃO':'DESCRIPTION'}
                  </div>
                  <div style={{fontSize:15, lineHeight:1.7, color:'var(--pg-ink-700)'}}>
                    <Tx lang={lang}>{item.description}</Tx>
                  </div>
                </div>
              )}

              {/* Pool / Route details card (desktop) */}
              {(item.type === 'pool' || item.type === 'route') && (() => {
                const rows = [];
                if (item.loc)       rows.push({ label: lang==='pt'?'Cidade':lang==='es'?'Ciudad':'City',              value: item.loc });
                if (item.address)   rows.push({ label: lang==='pt'?'Endereço':lang==='es'?'Dirección':'Address',       value: item.address, full: true });
                if (item.sizeFt)    rows.push({ label: lang==='pt'?'Tamanho':lang==='es'?'Tamaño':'Size',              value: item.sizeFt });
                if (item.gallons)   rows.push({ label: lang==='pt'?'Capacidade':lang==='es'?'Capacidad':'Capacity',    value: `${fmtN(item.gallons, lang)} gal` });
                if (item.system)    rows.push({ label: lang==='pt'?'Sistema':lang==='es'?'Sistema':'System',           value: item.system === 'salt' ? (lang==='pt'?'Sal':'Salt') : (lang==='pt'?'Cloro':'Chlorine') });
                if (item.freq)      rows.push({ label: lang==='pt'?'Visitas/semana':lang==='es'?'Visitas/semana':'Visits/week', value: `${item.freq}x` });
                if (item.price)     rows.push({ label: lang==='pt'?'Valor/mês':lang==='es'?'Valor/mes':'Monthly rate', value: `$${fmtN(item.price, lang)}/mo` });
                if (item.warranty)  rows.push({ label: lang==='pt'?'Garantia':lang==='es'?'Garantía':'Warranty',       value: item.warranty === 'yes' ? (item.warrantyMonths ? `${item.warrantyMonths} ${lang==='pt'?'meses':'months'}` : (lang==='pt'?'Sim':'Yes')) : (lang==='pt'?'Não':'No') });
                if (rows.length === 0) return null;
                return (
                  <div style={{background:'var(--pg-white)', borderRadius:16, padding:'24px', border:'1px solid var(--pg-ink-200)', boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
                    <div style={{fontSize:11, fontWeight:800, color:'var(--pg-ink-400)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:16}}>
                      {item.type==='pool' ? (lang==='pt'?'DETALHES DA PISCINA':'POOL DETAILS') : (lang==='pt'?'DETALHES DA ROTA':'ROUTE DETAILS')}
                    </div>
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px 20px'}}>
                      {rows.map((r, i) => (
                        <div key={i} style={r.full ? {gridColumn:'1/-1'} : {}}>
                          <div style={{fontSize:10, fontWeight:700, color:'var(--pg-ink-400)', letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:3}}>{r.label}</div>
                          <div style={{fontSize:14, fontWeight:600, color:'var(--pg-ink-800)'}}>{r.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Location */}
              {item.loc && (
                <div style={{
                  background:'var(--pg-white)', borderRadius:16, padding:'24px',
                  border:'1px solid var(--pg-ink-200)', boxShadow:'0 1px 4px rgba(0,0,0,0.04)',
                }}>
                  <LocationSection/>
                </div>
              )}

              {/* More from seller */}
              <MoreFromSeller/>
            </div>

            {/* ── RIGHT COLUMN: Sticky info panel ── */}
            <div style={{position:'sticky', top:76, display:'flex', flexDirection:'column', gap:0}}>
              <div style={{
                background:'var(--pg-white)', borderRadius:20, overflow:'hidden',
                border:'1px solid var(--pg-ink-200)',
                boxShadow:'0 4px 24px rgba(0,0,0,0.08)',
              }}>
                {/* Header with type + status */}
                <div style={{
                  padding:'20px 24px 0',
                  borderBottom:'1px solid var(--pg-ink-100)',
                }}>
                  <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:14}}>
                    <TypeBadge/>
                    {isSold && (
                      <span style={{
                        fontSize:10, fontWeight:800, padding:'4px 10px', borderRadius:6,
                        background:'#DCFCE7', color:'#15803D', letterSpacing:'0.07em',
                      }}>✓ SOLD</span>
                    )}
                    {item.status === 'pending' && (
                      <span style={{
                        fontSize:10, fontWeight:800, padding:'4px 10px', borderRadius:6,
                        background:'#FEF3C7', color:'#92400E', letterSpacing:'0.07em',
                      }}>⏳ PENDING</span>
                    )}
                  </div>

                  {/* Title */}
                  <h1 style={{
                    margin:'0 0 10px', fontFamily:'var(--pg-font-display)',
                    fontSize:24, fontWeight:800, letterSpacing:'-0.02em',
                    lineHeight:1.2, color:'var(--pg-ink-900)',
                  }}><Tx lang={lang}>{item.name}</Tx></h1>

                  {/* Price */}
                  <div style={{marginBottom:10}}>
                    <PriceBlock large/>
                  </div>

                  {/* Location */}
                  {item.loc && (
                    <div style={{display:'flex', alignItems:'center', gap:5, marginBottom:18,
                      fontSize:13, color:'var(--pg-ink-500)'}}>
                      {Icon.pin(13,'var(--pg-ink-400)')} {locationLabel}
                    </div>
                  )}
                </div>

                {/* Seller / Owner row */}
                {!isStatic && (
                <div style={{padding:'18px 24px', borderBottom:'1px solid var(--pg-ink-100)'}}>
                  <div style={{fontSize:11, fontWeight:800, color:'var(--pg-ink-400)',
                    letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:12}}>
                    {isRent ? (lang==='pt'?'PROPRIETÁRIO':'OWNER') : (lang==='pt'?'VENDEDOR':lang==='es'?'VENDEDOR':'SELLER')}
                  </div>
                  <SellerRow horizontal/>
                </div>
                )}
                {isStatic && (
                <div style={{padding:'12px 24px', borderBottom:'1px solid var(--pg-ink-100)'}}>
                  <div style={{display:'flex', alignItems:'center', gap:8}}>
                    <div style={{width:36,height:36,borderRadius:'50%',background:'var(--pg-ink-200)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>🎭</div>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:'var(--pg-ink-900)'}}>Demo Item</div>
                      <div style={{fontSize:11,color:'var(--pg-ink-400)'}}>{lang==='pt'?'Publicado pelo PoolGuyPro':'Posted by PoolGuyPro'}</div>
                    </div>
                  </div>
                </div>
                )}

                {/* Admin notice */}
                {canDelete && (
                  <div style={{
                    margin:'16px 24px 0',
                    padding:'10px 14px', borderRadius:10,
                    background:'#FEF2F2', border:'1px solid #FCA5A5',
                    display:'flex', alignItems:'center', gap:8,
                  }}>
                    <span style={{fontSize:14, flexShrink:0}}>🛡</span>
                    <span style={{fontSize:12, color:'#DC2626', fontWeight:500, lineHeight:1.4}}>
                      {lang==='pt'
                        ? 'Visualizando como admin — 🗑️ remove definitivamente.'
                        : 'Viewing as admin — 🗑️ permanently removes listing.'}
                    </span>
                  </div>
                )}

                {/* Rental requests panel (owner only) */}
                {isRent && isOwner && ownerRequests.length > 0 && (
                  <div style={{padding:'18px 24px', borderBottom:'1px solid var(--pg-ink-100)'}}>
                    <div style={{fontSize:11, fontWeight:800, color:'var(--pg-ink-400)',
                      letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:12}}>
                      {lang==='pt'?`PEDIDOS DE ALUGUEL (${ownerRequests.length})`:`RENTAL REQUESTS (${ownerRequests.length})`}
                    </div>
                    <OwnerRequestsBlock/>
                  </div>
                )}

                {/* Actions */}
                <div style={{padding:'18px 24px', display:'flex', flexDirection:'column', gap:10}}>
                  {/* Request Rental (rent items, non-owner) */}
                  {isRent && !isOwner && <RequestRentalBlock/>}

                  {/* Message button — only for other users' listings */}
                  {!isOwner && <button onClick={handleContact} style={{
                    width:'100%', height: isRent ? 46 : 52, borderRadius:14, cursor:'pointer',
                    fontFamily:'inherit', fontSize: isRent ? 14 : 15, fontWeight:700,
                    color: isRent ? 'var(--pg-blue-700)' : '#fff',
                    background: isRent
                      ? 'transparent'
                      : 'linear-gradient(135deg,var(--pg-blue-500),var(--pg-blue-700))',
                    border: isRent ? '1.5px solid var(--pg-blue-200)' : 'none',
                    boxShadow: isRent ? 'none' : '0 4px 18px rgba(0,119,182,0.30)',
                    display:'flex', alignItems:'center', justifyContent:'center', gap:9,
                    transition:'all .15s',
                  }}>
                    {Icon.msg(18, isRent ? 'var(--pg-blue-700)' : '#fff')}
                    {lang==='pt'?'Mensagem':'Message'}
                  </button>}

                  {/* Owner: rental requests panel */}
                  {isRent && isOwner && <OwnerRequestsBlock/>}

                  {/* Mark as Sold (sell live items only) */}
                  {!isRent && !isStatic && <MarkSoldBlock/>}
                </div>

                {/* Listed date */}
                {timeAgoLabel && (
                  <div style={{
                    padding:'12px 24px 20px', textAlign:'center',
                    fontSize:12, color:'var(--pg-ink-400)',
                    borderTop:'1px solid var(--pg-ink-100)',
                  }}>
                    {lang==='pt'?`Publicado ${timeAgoLabel}`:`Listed ${timeAgoLabel}`}
                  </div>
                )}
              </div>

              {/* Safety tip card */}
              <div style={{
                marginTop:16, padding:'14px 18px', borderRadius:14,
                background:'var(--pg-white)', border:'1px solid var(--pg-ink-200)',
                boxShadow:'0 1px 4px rgba(0,0,0,0.04)',
              }}>
                <div style={{display:'flex', gap:10, alignItems:'flex-start'}}>
                  <div style={{
                    width:32, height:32, borderRadius:10, background:'var(--pg-blue-50)',
                    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--pg-blue-600)" strokeWidth="2" strokeLinecap="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{fontSize:12, fontWeight:700, color:'var(--pg-ink-800)', marginBottom:2}}>
                      {lang==='pt'?'Dica de segurança':'Safety Tip'}
                    </div>
                    <div style={{fontSize:11.5, color:'var(--pg-ink-500)', lineHeight:1.5}}>
                      {lang==='pt'
                        ? 'Sempre se conheçam antes de trocar dinheiro. Prefira locais públicos.'
                        : 'Always meet in a public place. Never send payment before seeing the item.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fullscreen photo viewer */}
        {viewerOpen && allPhotos.length > 0 && (
          <PhotoViewer photos={allPhotos} startIdx={imgIdx} onClose={()=>setViewerOpen(false)}/>
        )}
        {MarkSoldSheetSlot()}
        {RatingOverlay()}
        {DisputeFormSheet()}
        {AfterPhotoSheet()}
        <input type="file" accept="image/*" capture="environment" ref={beforePhotoRef} onChange={handleBeforePhotoFile} style={{display:'none'}}/>
        <input type="file" accept="image/*" capture="environment" ref={afterPhotoRef}  onChange={handleAfterPhotoFile}  style={{display:'none'}}/>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // ── MOBILE LAYOUT (< 900px) — original design kept ───────────
  // ══════════════════════════════════════════════════════════════
  return (
    <div style={{padding:'0 0 36px'}}>

      {/* ── Photo section — same style as ItemPhotoCarousel ── */}
      <div style={{position:'relative', height:240, overflow:'hidden', background:'var(--pg-ink-200)', flexShrink:0}}>
        {allPhotos.length > 0
          ? <img
              src={allPhotos[imgIdx]} alt={item.name}
              onClick={() => setViewerOpen(true)}
              style={{width:'100%', height:'100%', objectFit:'cover', display:'block', cursor: allPhotos.length > 1 ? 'default' : 'zoom-in'}}
            />
          : item.type === 'route'
            ? <RouteNoPhotoHero item={item} lang={lang}/>
            : <NoPhotoPlaceholder height={240}/>
        }

        {/* Back arrow — top left */}
        <button onClick={onClose} style={{
          position:'absolute', top:'calc(12px + env(safe-area-inset-top, 0px))', left:12, zIndex:3,
          width:36, height:36, borderRadius:'50%',
          background:'rgba(0,0,0,0.48)', backdropFilter:'blur(6px)',
          border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
          WebkitBackdropFilter:'blur(6px)',
        }}>
          {Icon.chev(20,'#fff','left')}
        </button>

        {/* Type badge — shifted right of back arrow */}
        <span style={{position:'absolute', top:'calc(16px + env(safe-area-inset-top, 0px))', left:58, zIndex:2,
          fontSize:10, fontWeight:700, padding:'4px 10px', borderRadius:8,
          background: item.type==='rent' ? 'rgba(14,186,199,0.92)' : 'rgba(59,130,246,0.92)',
          color:'#fff', letterSpacing:'0.06em', backdropFilter:'blur(4px)', textTransform:'uppercase'}}>
          {item.type==='rent' ? (lang==='pt'?'ALUGUEL':lang==='es'?'ALQUILER':'RENTAL')
           : (lang==='pt'?'VENDA':lang==='es'?'VENTA':'FOR SALE')}
        </span>

        {/* Counter badge — top right (only if multiple photos) */}
        {allPhotos.length > 1 && (
          <div style={{position:'absolute', top:'calc(12px + env(safe-area-inset-top, 0px))', right:12, zIndex:2,
            background:'rgba(0,0,0,0.45)', borderRadius:999,
            padding:'3px 10px', fontSize:11, fontWeight:700, color:'#fff'}}>
            {imgIdx + 1} / {allPhotos.length}
          </div>
        )}

        {/* Dots — bottom center */}
        {allPhotos.length > 1 && (
          <div style={{position:'absolute', bottom:10, left:0, right:0,
            display:'flex', justifyContent:'center', gap:5, zIndex:2}}>
            {allPhotos.map((_,i) => (
              <button key={i} onClick={()=>setImgIdx(i)} style={{
                width: i===imgIdx ? 18 : 6, height:6, borderRadius:3,
                background: i===imgIdx ? '#fff' : 'rgba(255,255,255,0.50)',
                border:'none', cursor:'pointer', padding:0, transition:'all .18s ease',
              }}/>
            ))}
          </div>
        )}

        {/* Prev arrow */}
        {imgIdx > 0 && (
          <button onClick={()=>setImgIdx(i=>i-1)} style={{
            position:'absolute', left:10, top:'50%', transform:'translateY(-50%)',
            width:38, height:38, borderRadius:'50%', background:'rgba(255,255,255,0.92)',
            border:'none', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 2px 10px rgba(0,0,0,0.25)', zIndex:2,
          }}>{Icon.chev(22,'#111','left')}</button>
        )}
        {/* Next arrow */}
        {imgIdx < allPhotos.length - 1 && (
          <button onClick={()=>setImgIdx(i=>i+1)} style={{
            position:'absolute', right:10, top:'50%', transform:'translateY(-50%)',
            width:38, height:38, borderRadius:'50%', background:'rgba(255,255,255,0.92)',
            border:'none', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 2px 10px rgba(0,0,0,0.25)', zIndex:2,
          }}>{Icon.chev(22,'#111','right')}</button>
        )}

        {/* Admin badge — bottom left */}
        {isAdmin && (
          <span style={{position:'absolute', bottom:14, left:12, zIndex:2,
            fontSize:9.5, fontWeight:700, padding:'3px 9px', borderRadius:6,
            background:'rgba(239,68,68,0.85)', color:'#fff', letterSpacing:'0.05em'}}>
            🛡 ADMIN
          </span>
        )}
      </div>

      {/* ── Content ── */}
      <div style={{padding:'14px 18px 0'}}>

        {/* Title */}
        <h2 style={{margin:'0 0 8px', fontFamily:'var(--pg-font-display)', fontSize:20, fontWeight:700, letterSpacing:'-0.02em', lineHeight:1.2, color:'var(--pg-ink-900)'}}>
          <Tx lang={lang}>{item.name}</Tx>
        </h2>

        {/* Price + condition badge */}
        <div style={{display:'flex', alignItems:'baseline', gap:6, marginTop:4}}>
          {item.priceMode === 'neg' ? (
            <span style={{fontSize:14, fontWeight:700, padding:'4px 13px', borderRadius:999,
              background:'var(--pg-blue-50)', color:'var(--pg-blue-700)', border:'1px solid var(--pg-blue-100)'}}>
              🤝 {lang==='pt'?'Negociável':lang==='es'?'Negociable':'Negotiable'}
            </span>
          ) : (
            <>
              <span style={{fontFamily:'var(--pg-font-display)', fontSize:30, fontWeight:700, color:'var(--pg-blue-500)', letterSpacing:'-0.02em', lineHeight:1}}>
                {(item.type === 'pool' || item.type === 'route')
                  ? `$${fmtN(item.asking||0, lang)}`
                  : <>{item.type==='route'?`$${fmtN(item.asking||0, lang)}`:`$${fmtN(item.price, lang)}`}{periodSfx && item.type !== 'route' && <span style={{fontSize:13, fontWeight:500, color:'var(--pg-ink-400)', marginLeft:2}}>{periodSfx}</span>}</>
                }
              </span>
              {item.condition && (
                <span className="pg-chip" style={{marginLeft:6, padding:'2px 9px', fontSize:11, background:'var(--pg-blue-100)', color:'var(--pg-blue-700)', borderColor:'transparent'}}>
                  {item.condition}
                </span>
              )}
            </>
          )}
        </div>

        {/* Location · Category */}
        {locationLabel ? (
          <div style={{display:'flex', alignItems:'center', gap:5, marginTop:8, fontSize:13, color:'var(--pg-ink-700)'}}>
            {Icon.pin(14,'var(--pg-ink-700)')} {locationLabel}
          </div>
        ) : null}

        {/* Divider + Author row */}
        {!isStatic && <><div className="pg-divider" style={{margin:'14px 0'}}/>
        <button onClick={handleAuthorClick} style={{
          display:'flex', alignItems:'center', gap:12, width:'100%',
          border:'none', background:'transparent', cursor: openPublicProfile ? 'pointer' : 'default',
          textAlign:'left', padding:0, fontFamily:'inherit',
        }}>
          <Avatar name={authorDisplay} size={44} src={authorPhotoUrl || undefined}/>
          <div style={{flex:1, minWidth:0}}>
            <div style={{display:'flex', alignItems:'center', gap:6, flexWrap:'wrap'}}>
              <span style={{fontSize:14, fontWeight:600, color:'var(--pg-ink-900)'}}>{authorDisplay}</span>
              {authorVerified && (
                <span style={{fontSize:10,fontWeight:800,padding:'2px 7px',borderRadius:999,
                  background:'rgba(22,163,74,0.12)',color:'#16A34A',border:'1px solid rgba(22,163,74,0.3)',
                  display:'inline-flex',alignItems:'center',gap:3,flexShrink:0}}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  {lang==='pt'?'Verificado':'Verified'}
                </span>
              )}
            </div>
            <div style={{display:'flex', alignItems:'center', gap:5, marginTop:2, flexWrap:'wrap'}}>
              {authorRating ? (
                <>
                  <Stars rating={authorRating.avg} size={12}/>
                  <span style={{fontSize:12, fontWeight:600, color:'var(--pg-ink-700)'}}>{authorRating.avg}</span>
                  <span style={{fontSize:11, color:'var(--pg-ink-400)'}}>({authorRating.count})</span>
                </>
              ) : (
                <span style={{fontSize:11.5, color:'var(--pg-ink-400)'}}>{lang==='pt'?'Sem avaliações ainda':lang==='es'?'Sin calificaciones aún':'No ratings yet'}</span>
              )}
              {timeAgoLabel ? <span style={{fontSize:11.5, color:'var(--pg-ink-400)'}}> · {timeAgoLabel}</span> : null}
            </div>
          </div>
          <span className="pg-chip pg-chip-aqua" style={{fontSize:11, flexShrink:0}}>Pool Guy</span>
          {openPublicProfile && Icon.chev(14, 'var(--pg-ink-300)')}
        </button>

        {/* Description — plain text */}
        {item.description ? (
          <div style={{marginTop:14, fontSize:14, lineHeight:1.55, color:'var(--pg-ink-700)'}}>
            {item.description}
          </div>
        ) : null}

        {/* ── Pool / Route details grid ── */}
        {(item.type === 'pool' || item.type === 'route') && (() => {
          const rows = [];
          if (item.type === 'route') {
            if (item.area)    rows.push({ label: lang==='pt'?'Cidades':lang==='es'?'Ciudades':'Cities',               value: item.area, full: true });
            if (item.clients) rows.push({ label: lang==='pt'?'Nº clientes':lang==='es'?'Nº clientes':'Clients',       value: String(item.clients) });
            if (item.revenue) rows.push({ label: lang==='pt'?'Receita/mês':lang==='es'?'Ingreso/mes':'Revenue/mo',    value: `$${fmtN(item.revenue, lang)}/mo` });
            if (item.cat) {
              const catTr = { residential: {pt:'Residencial',es:'Residencial',en:'Residential'}, commercial: {pt:'Comercial',es:'Comercial',en:'Commercial'}, mixed: {pt:'Misto',es:'Mixto',en:'Mixed'} };
              const catVal = (catTr[item.cat]||{})[lang] || (catTr[item.cat]||{}).en || item.cat;
              rows.push({ label: lang==='pt'?'Tipo de cliente':lang==='es'?'Tipo de cliente':'Client type', value: catVal });
            }
          } else {
            if (item.loc)      rows.push({ label: lang==='pt'?'Cidade':lang==='es'?'Ciudad':'City',              value: item.loc });
            if (item.address)  rows.push({ label: lang==='pt'?'Endereço':lang==='es'?'Dirección':'Address',       value: item.address, full: true });
            if (item.sizeFt)   rows.push({ label: lang==='pt'?'Tamanho':lang==='es'?'Tamaño':'Size',             value: item.sizeFt });
            if (item.gallons)  rows.push({ label: lang==='pt'?'Capacidade':lang==='es'?'Capacidad':'Capacity',    value: `${fmtN(item.gallons, lang)} gal` });
            if (item.system)   rows.push({ label: lang==='pt'?'Sistema':lang==='es'?'Sistema':'System',          value: item.system === 'salt' ? (lang==='pt'?'Sal':'Salt') : (lang==='pt'?'Cloro':'Chlorine') });
            if (item.freq)     rows.push({ label: lang==='pt'?'Visitas/semana':lang==='es'?'Visitas/semana':'Visits/week', value: `${item.freq}x` });
            if (item.price)    rows.push({ label: lang==='pt'?'Valor/mês':lang==='es'?'Valor/mes':'Monthly rate', value: `$${fmtN(item.price, lang)}/mo` });
            if (item.warranty) rows.push({ label: lang==='pt'?'Garantia':lang==='es'?'Garantía':'Warranty',      value: item.warranty === 'yes' ? (item.warrantyMonths ? `${item.warrantyMonths} ${lang==='pt'?'meses':'months'}` : (lang==='pt'?'Sim':'Yes')) : (lang==='pt'?'Não':'No') });
          }
          if (rows.length === 0) return null;
          return (
            <div style={{marginTop:14, background:'var(--pg-ink-50)', borderRadius:14, padding:'14px 16px', border:'1px solid var(--pg-ink-200)'}}>
              <div style={{fontSize:10, fontWeight:800, color:'var(--pg-ink-400)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:10}}>
                {item.type==='pool' ? (lang==='pt'?'DETALHES DA PISCINA':'POOL DETAILS') : (lang==='pt'?'DETALHES DA ROTA':'ROUTE DETAILS')}
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px 12px'}}>
                {rows.map((r, i) => (
                  <div key={i} style={r.full ? {gridColumn:'1/-1'} : {}}>
                    <div style={{fontSize:10, fontWeight:700, color:'var(--pg-ink-400)', letterSpacing:'0.04em', textTransform:'uppercase', marginBottom:2}}>{r.label}</div>
                    <div style={{fontSize:13, fontWeight:600, color:'var(--pg-ink-800)'}}>{r.value}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Admin info strip */}
        {canDelete && !isStatic && (
          <div style={{marginTop:14, padding:'9px 13px', borderRadius:10, background:'#FEF2F2', border:'1px solid #FCA5A5',
            display:'flex', alignItems:'center', gap:8}}>
            <span style={{fontSize:14}}>🛡</span>
            <span style={{fontSize:12, color:'#DC2626', fontWeight:500}}>
              {lang==='pt'?'Você está vendo este anúncio como admin. O botão 🗑️ remove definitivamente.':'You are viewing this as admin. The 🗑️ button permanently removes it.'}
            </span>
          </div>
        )}
        </>}

        {/* ── Request Rental (rent items, non-owner) ── */}
        {isRent && !isOwner && (
          <div style={{marginTop:14}}>
            <RequestRentalBlock/>
          </div>
        )}

        {/* ── Owner rental requests ── */}
        {isRent && isOwner && (
          <div style={{marginTop:14}}>
            <div style={{fontSize:11,fontWeight:800,color:'var(--pg-ink-400)',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:10}}>
              {lang==='pt'?`PEDIDOS DE ALUGUEL (${ownerRequests.length})`:`RENTAL REQUESTS (${ownerRequests.length})`}
            </div>
            <OwnerRequestsBlock/>
          </div>
        )}

        {/* ── Action buttons ── */}
        <div style={{display:'flex', gap:10, marginTop:14}}>
          {/* Contact / Message — only for other users' listings */}
          {!isOwner && <button onClick={handleContact} className="pg-btn pg-btn-ghost" style={{flex:1, fontSize:14}}>
            {Icon.msg(16,'var(--pg-blue-700)')}
            {lang==='pt'?'Mensagem':lang==='es'?'Mensaje':'Message'}
          </button>}

          {/* Save (heart) — only for other users' live posts */}
          {!isOwner && !isStatic && (
          <button onClick={onToggleSave} style={{
            width:52, height:52, borderRadius:14, flexShrink:0, cursor:'pointer',
            border: isSaved ? '1.5px solid #FCA5A5' : '1.5px solid var(--pg-ink-200)',
            background: isSaved ? '#FEF2F2' : 'var(--pg-ink-50)',
            color: isSaved ? '#EF4444' : 'var(--pg-ink-500)',
            display:'flex', alignItems:'center', justifyContent:'center',
            transition:'all .15s',
          }} title={isSaved?(lang==='pt'?'Remover dos salvos':'Remove from saved'):(lang==='pt'?'Salvar':'Save')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill={isSaved?'currentColor':'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
          )}

          {/* Share */}
          <button onClick={onShare} style={{
            width:52, height:52, borderRadius:14, flexShrink:0, cursor:'pointer',
            border:'1.5px solid var(--pg-ink-200)', background:'var(--pg-ink-50)',
            color:'var(--pg-ink-500)', display:'flex', alignItems:'center', justifyContent:'center',
          }} title={lang==='pt'?'Compartilhar':lang==='es'?'Compartir':'Share'}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          </button>

          {/* Delete — admin or author, live items only */}
          {canDelete && !isStatic && (
            <button onClick={handleAdminDelete} disabled={deleting} style={{
              width:52, height:52, borderRadius:14, border:'1.5px solid #FCA5A5',
              background:'#FEF2F2', color:'#EF4444', cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
              opacity: deleting ? 0.6 : 1,
            }} title={lang==='pt'?'Excluir anúncio':'Delete listing'}>
              {deleting
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" strokeDasharray="31.4" strokeDashoffset="10"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              }
            </button>
          )}
        </div>

        {/* Mark as Sold — sell items, author only (author_id null = static → never shows) */}
        {!isRent && item.author_id && currentUser?.uid && item.author_id === currentUser.uid && item.status !== 'sold' && (
          <button onClick={()=>setMarkSoldOpen(true)} style={{
            width:'100%', marginTop:10, padding:'13px', borderRadius:14,
            border:'none', cursor:'pointer', fontFamily:'inherit',
            background:'linear-gradient(135deg,#22C55E,#15803D)',
            color:'#fff', fontSize:14, fontWeight:700,
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            boxShadow:'0 4px 14px rgba(21,128,61,0.35)',
            transition:'all .15s',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12.99V2h10.99l8.6 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
            {lang==='pt' ? 'Marcar como vendido' : lang==='es' ? 'Marcar como vendido' : 'Mark as Sold'}
          </button>
        )}
        {item.status === 'sold' && (
          <div style={{
            marginTop:10, padding:'10px 14px', borderRadius:12,
            background:'#F0FDF4', border:'1px solid #86EFAC',
            display:'flex', alignItems:'center', gap:8,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span style={{fontSize:13, fontWeight:700, color:'#16A34A'}}>
              {lang==='pt' ? 'Vendido!' : lang==='es' ? '¡Vendido!' : 'Sold!'}
            </span>
          </div>
        )}

      </div>

      {/* ── Location map ── */}
      {item.loc && (
        <div style={{padding:'0 18px 20px'}}>
          <div className="pg-divider" style={{margin:'18px 0 16px'}}/>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12}}>
            <div style={{display:'flex', alignItems:'center', gap:6}}>
              {Icon.pin(14,'var(--pg-ink-500)')}
              <span style={{fontSize:13, fontWeight:700, color:'var(--pg-ink-700)'}}>
                {lang==='pt'?'Localização':lang==='es'?'Ubicación':'Location'}
              </span>
            </div>
            <a href={`https://www.google.com/maps/search/${encodeURIComponent((item.loc||'')+', FL')}`}
              target="_blank" rel="noreferrer"
              style={{fontSize:12, fontWeight:600, color:'var(--pg-blue-500)', textDecoration:'none', display:'flex', alignItems:'center', gap:4}}>
              {lang==='pt'?'Abrir no Maps':lang==='es'?'Abrir en Maps':'Open in Maps'} ↗
            </a>
          </div>
          {mapCoords ? (
            <div style={{borderRadius:14, overflow:'hidden', border:'1px solid var(--pg-ink-200)', height:180, position:'relative'}}>
              <iframe
                title="listing-location"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapCoords.lon-0.05},${mapCoords.lat-0.04},${mapCoords.lon+0.05},${mapCoords.lat+0.04}&layer=mapnik&marker=${mapCoords.lat},${mapCoords.lon}`}
                style={{width:'100%', height:'100%', border:'none', display:'block'}}
                loading="lazy"
              />
              {/* Location label overlay */}
              <div style={{position:'absolute', bottom:10, left:10,
                background:'rgba(0,0,0,0.60)', backdropFilter:'blur(6px)',
                borderRadius:999, padding:'4px 10px',
                fontSize:11, fontWeight:600, color:'#fff', display:'flex', alignItems:'center', gap:5}}>
                {Icon.pin(10,'#fff')} {item.loc}
              </div>
            </div>
          ) : mapLoading ? (
            <div style={{height:180, borderRadius:14, background:'var(--pg-ink-100)',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:'var(--pg-ink-400)'}}>
              ⏳ {lang==='pt'?'Carregando mapa…':lang==='es'?'Cargando mapa…':'Loading map…'}
            </div>
          ) : (
            <a href={`https://www.google.com/maps/search/${encodeURIComponent((item.loc||'')+', FL')}`}
              target="_blank" rel="noreferrer"
              style={{display:'flex', alignItems:'center', gap:10, padding:'14px 16px', borderRadius:12,
                background:'var(--pg-ink-50)', border:'1px solid var(--pg-ink-200)', textDecoration:'none'}}>
              {Icon.pin(16,'var(--pg-blue-500)')}
              <span style={{fontSize:13, fontWeight:600, color:'var(--pg-blue-500)'}}>{item.loc}, FL</span>
              <span style={{marginLeft:'auto', fontSize:11, color:'var(--pg-ink-400)'}}>↗</span>
            </a>
          )}
        </div>
      )}

      {/* ── More from this seller ── */}
      {(() => {
        const others = liveMarket.filter(m =>
          m.author_id && m.author_id === item.author_id &&
          m._id !== item._id &&
          (m.status === 'approved' || m.status === 'active')
        );
        if (others.length === 0) return null;
        const sellerName = authorDisplay;
        return (
          <div style={{paddingBottom:36}}>
            <div className="pg-divider" style={{marginBottom:16}}/>
            <div style={{padding:'0 18px 12px', fontSize:13, fontWeight:700, color:'var(--pg-ink-900)'}}>
              {lang==='pt'?`Mais de ${sellerName}`:lang==='es'?`Más de ${sellerName}`:`More from ${sellerName}`}
            </div>
            <div className="pg-scroll-x" style={{padding:'0 18px', display:'flex', gap:12, paddingBottom:4}}>
              {others.slice(0,8).map(m => (
                <button key={m._id} onClick={()=>onOpenListing&&onOpenListing(m)}
                  className="pg-press"
                  style={{
                    flexShrink:0, width:148, padding:0, border:'1px solid var(--pg-ink-200)',
                    borderRadius:14, background:'var(--pg-white)', cursor:'pointer',
                    textAlign:'left', fontFamily:'inherit', overflow:'hidden',
                    display:'flex', flexDirection:'column', boxShadow:'var(--pg-shadow-1)',
                  }}>
                  <div style={{height:96, background:'var(--pg-ink-100)', overflow:'hidden', flexShrink:0}}>
                    {(m.photoUrls && m.photoUrls[0]) || m.photoUrl
                      ? <img src={(m.photoUrls&&m.photoUrls[0])||m.photoUrl} alt={m.name}
                          style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                      : <NoPhotoPlaceholder height={96} small/>
                    }
                  </div>
                  <div style={{padding:'8px 10px 10px'}}>
                    <div style={{fontSize:12, fontWeight:700, color:'var(--pg-ink-900)', lineHeight:1.3,
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{m.name}</div>
                    <div style={{fontSize:13, fontWeight:700, color:'var(--pg-blue-500)', marginTop:3}}>
                      {m.priceMode==='neg'
                        ? (lang==='pt'?'Negociável':lang==='es'?'Negociable':'Negotiable')
                        : `$${fmtN(m.price, lang)}`}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Fullscreen photo viewer */}
      {viewerOpen && allPhotos.length > 0 && (
        <PhotoViewer photos={allPhotos} startIdx={imgIdx} onClose={() => setViewerOpen(false)}/>
      )}

      {/* Mark as Sold sheet */}
      <Sheet open={markSoldOpen} onClose={()=>setMarkSoldOpen(false)} height="auto">
        {markSoldOpen && (
          <MarkSoldSheet
            item={item} lang={lang} currentUser={currentUser}
            onClose={()=>setMarkSoldOpen(false)}
            showToast={showToast}
            onSold={(sellerRating)=>{ setMarkSoldOpen(false); onAfterSold && onAfterSold(sellerRating); }}
          />
        )}
      </Sheet>
      {RatingOverlay()}
      {DisputeFormSheet()}
      {AfterPhotoSheet()}
      <input type="file" accept="image/*" capture="environment" ref={beforePhotoRef} onChange={handleBeforePhotoFile} style={{display:'none'}}/>
      <input type="file" accept="image/*" capture="environment" ref={afterPhotoRef}  onChange={handleAfterPhotoFile}  style={{display:'none'}}/>
    </div>
  );
}

// ── My Post Detail / Edit Sheet ───────────────────────────────
function MyPostDetailSheet({ item, lang, onClose, showToast, onUpdated, onDeleted, openRating, currentUser }) {
  const [editing,        setEditing]        = React.useState(false);
  const [saving,         setSaving]         = React.useState(false);
  const [deleting,       setDeleting]       = React.useState(false);
  const [activeRental,   setActiveRental]   = React.useState(null);  // rental_request blocking edit
  const [rentLoaded,     setRentLoaded]     = React.useState(false);
  const [markSoldOpen,   setMarkSoldOpen]   = React.useState(false);
  const [boostOpen,      setBoostOpen]      = React.useState(false);
  const [boostedUntil,   setBoostedUntil]   = React.useState(item.boostedUntil || null);
  const [form,    setForm]      = React.useState({
    name:        item.name        || '',
    description: item.description || '',
    price:       item.price       || '',
    priceMode:   item.priceMode   || 'fixed',
    loc:         item.loc         || '',
    condition:   item.condition   || '',
    cat:         item.cat         || '',
    asking:      item.asking      || '',
  });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  // Check for active rental on mount (only for rent-type listings)
  React.useEffect(() => {
    if (!window.sb || !item._id || item.type !== 'rent') { setRentLoaded(true); return; }
    window.sb.from('rental_requests')
      .select('id, status, requester_name, start_date, end_date')
      .eq('listing_id', item._id)
      .in('status', ['pending', 'approved'])
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data[0]) setActiveRental(data[0]);
        setRentLoaded(true);
      })
      .catch(() => setRentLoaded(true));
  }, [item._id]);

  const allPhotos = (item.photoUrls && item.photoUrls.length > 0) ? item.photoUrls : (item.photoUrl ? [item.photoUrl] : []);
  const isPending   = item.status === 'pending';
  const isSoldItem  = item.status === 'sold';
  const statusColor = isPending ? '#D97706' : isSoldItem ? '#6B7280' : '#16A34A';
  const statusBg    = isPending ? '#FEF3C7' : isSoldItem ? '#F3F4F6' : '#DCFCE7';
  const statusLabel = isPending
    ? (lang==='pt'?'⏳ Em revisão':lang==='es'?'⏳ En revisión':'⏳ Under review')
    : isSoldItem
      ? (lang==='pt'?'✓ Vendido':lang==='es'?'✓ Vendido':'✓ Sold')
      : (lang==='pt'?'✓ Ativo':lang==='es'?'✓ Activo':'✓ Active');

  const _sfxOf = p => p==='week'?(lang==='pt'?'/sem':'/wk'):p==='month'?(lang==='pt'?'/mês':'/mo'):(lang==='pt'?'/dia':'/day');
  const periodSfx = item.type === 'rent'
    ? (item.rentPrices && typeof item.rentPrices === 'object'
        ? Object.entries(item.rentPrices).filter(([,v])=>v>0).map(([k,v])=>`$${fmtN(v, lang)}${_sfxOf(k)}`).join(' · ')
        : `$${fmtN(item.price, lang)}${_sfxOf(item.rentPeriod||'day')}`)
    : '';

  const handleSave = async () => {
    if (!window.sb) return;
    setSaving(true);
    // Only name/description/photo changes require a new admin review; price and other fields don't
    const contentChanged = form.name !== (item.name || '') || (form.description || '') !== (item.description || '');
    const patch = {
      name:        form.name,
      description: form.description || null,
      price:       form.price || null,
      price_mode:  form.priceMode,
      loc:         form.loc,
      condition:   form.condition,
      cat:         form.cat,
      asking:      form.asking ? (parseFloat(form.asking) || null) : null,
    };
    if (contentChanged && item.status === 'approved') patch.status = 'pending';
    const { error } = await window.sb.from('marketplace').update(patch).eq('id', item._id);
    setSaving(false);
    if (error) { if (showToast) showToast('❌ ' + error.message); return; }
    if (showToast) showToast(patch.status === 'pending'
      ? (lang==='pt'?'✓ Atualizado — enviado para nova revisão':lang==='es'?'✓ Actualizado — enviado a nueva revisión':'✓ Updated — sent back for review')
      : (lang==='pt'?'✓ Anúncio atualizado':'✓ Listing updated'));
    setEditing(false);
    onUpdated && onUpdated({...item, ...patch});
  };

  const handleDelete = async () => {
    if (!window.sb) return;
    if (activeRental) {
      if (showToast) showToast(lang==='pt'?'❌ Não é possível excluir com aluguel ativo':'❌ Cannot delete while a rental is active');
      return;
    }
    const ok = window.confirm(lang==='pt'?'Deletar este anúncio? Não pode ser desfeito.':'Delete this listing? This cannot be undone.');
    if (!ok) return;
    setDeleting(true);
    const { error } = await window.sb.from('marketplace').delete().eq('id', item._id);
    setDeleting(false);
    if (error) { if (showToast) showToast('❌ ' + error.message); return; }
    if (showToast) showToast(lang==='pt'?'🗑️ Anúncio deletado':'🗑️ Listing deleted');
    onDeleted && onDeleted(item._id);
  };

  const inp = {style:{width:'100%',padding:'11px 13px',borderRadius:10,border:'1.5px solid var(--pg-ink-200)',background:'var(--pg-ink-50,#F7F9FB)',color:'var(--pg-ink-900)',fontSize:14,outline:'none',fontFamily:'inherit',transition:'border-color .15s'}};
  const lbl = (text) => <div style={{fontSize:11,fontWeight:700,color:'var(--pg-ink-500)',letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:6}}>{text}</div>;

  return (
    <div style={{display:'flex', flexDirection:'column', height:'100%'}}>
      {/* Header */}
      <div style={{padding:'14px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0, borderBottom:'0.5px solid var(--pg-ink-200)'}}>
        <button onClick={editing ? ()=>setEditing(false) : onClose} style={{border:'none', background:'transparent', color:'var(--pg-blue-500)', fontSize:15, fontWeight:600, cursor:'pointer', padding:0, fontFamily:'inherit'}}>
          {editing ? (lang==='pt'?'Voltar':lang==='es'?'Volver':'Back') : (lang==='pt'?'Fechar':lang==='es'?'Cerrar':'Close')}
        </button>
        <div style={{fontFamily:'var(--pg-font-display)', fontSize:16, fontWeight:700, letterSpacing:'-0.01em', flex:1, textAlign:'center', margin:'0 10px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
          {editing ? (lang==='pt'?'Editar anúncio':lang==='es'?'Editar anuncio':'Edit listing') : (item.name || (lang==='pt'?'Seu anúncio':lang==='es'?'Tu anuncio':'Your listing'))}
        </div>
        <div style={{width:44, flexShrink:0}}/>
      </div>

      {/* Scrollable body */}
      <div style={{flex:1, overflow:'auto', touchAction:'pan-y', padding:'0 0 36px'}}>
      {/* Photo carousel with status badge overlay */}
      <div style={{position:'relative'}}>
        <PhotoCarousel urls={allPhotos} fallbackCat={item.cat||'Tools'} height={220}/>
        <span style={{position:'absolute',top:14,left:16,zIndex:2,
          fontSize:11,fontWeight:700,padding:'5px 12px',borderRadius:8,
          background:statusBg,color:statusColor,letterSpacing:'0.03em'}}>
          {statusLabel}
        </span>
        {boostedUntil && new Date(boostedUntil) > new Date() && (
          <span style={{position:'absolute',bottom:14,left:16,zIndex:2,
            fontSize:11,fontWeight:700,padding:'5px 12px',borderRadius:8,
            background:'rgba(14,186,199,0.92)',color:'#fff',letterSpacing:'0.03em',
            display:'flex',alignItems:'center',gap:5}}>
            🚀 {lang==='pt'?'Destacado':lang==='es'?'Destacado':'Boosted'}
          </span>
        )}
        {item.cat && (
          <span style={{position:'absolute',top:14,right:16,zIndex:2,
            fontSize:10,fontWeight:700,padding:'4px 10px',borderRadius:8,
            background:'rgba(0,0,0,0.50)',color:'#fff',letterSpacing:'0.06em',textTransform:'uppercase'}}>
            {item.cat}
          </span>
        )}
      </div>

      <div style={{padding:'20px 20px 0'}}>
        {!editing ? (
          /* ── View mode ── */
          <>
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12,marginBottom:12}}>
              <div style={{flex:1,minWidth:0}}>
                <h2 style={{margin:'0 0 6px',fontFamily:'var(--pg-font-display)',fontSize:21,fontWeight:800,letterSpacing:'-0.02em',lineHeight:1.2,color:'var(--pg-ink-900)'}}>
                  {item.name||'—'}
                </h2>
                {item.loc && (
                  <div style={{display:'flex',alignItems:'center',gap:5,fontSize:13,color:'var(--pg-ink-500)'}}>
                    {Icon.pin(12,'var(--pg-ink-400)')} {item.loc}
                  </div>
                )}
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                {item.type==='route' ? (
                  <div>
                    <div style={{fontFamily:'var(--pg-font-display)',fontSize:26,fontWeight:800,color:'var(--pg-blue-500)',letterSpacing:'-0.03em',lineHeight:1}}>
                      {item.asking ? `$${fmtN(item.asking, lang)}` : '—'}
                    </div>
                    <div style={{fontSize:10,color:'var(--pg-ink-400)',marginTop:2}}>{lang==='pt'?'Pedindo':lang==='es'?'Pidiendo':'Asking'}</div>
                  </div>
                ) : item.priceMode==='neg' ? (
                  <span style={{fontSize:13,fontWeight:700,padding:'5px 12px',borderRadius:999,
                    background:'var(--pg-blue-50)',color:'var(--pg-blue-700)',border:'1px solid var(--pg-blue-100)',whiteSpace:'nowrap'}}>
                    🤝 {lang==='pt'?'Negociável':'Negotiable'}
                  </span>
                ) : (
                  <div>
                    <div style={{fontFamily:'var(--pg-font-display)',fontSize:26,fontWeight:800,color:'var(--pg-blue-500)',letterSpacing:'-0.03em',lineHeight:1}}>
                      {item.price ? `$${fmtN(item.price, lang)}` : '—'}
                    </div>
                    {periodSfx && <div style={{fontSize:11,color:'var(--pg-ink-400)',marginTop:2,textAlign:'right'}}>{periodSfx}</div>}
                  </div>
                )}
              </div>
            </div>

            {/* Details pills */}
            <div style={{display:'flex',gap:7,flexWrap:'wrap',marginBottom:14}}>
              {item.type==='route' ? (
                <>
                  {item.clients && <span style={{fontSize:12,fontWeight:600,padding:'4px 11px',borderRadius:999,background:'var(--pg-blue-50)',color:'var(--pg-blue-700)',border:'1px solid var(--pg-blue-100)'}}>🏊 {item.clients} {lang==='pt'?'piscinas':'pools'}</span>}
                  {item.revenue && <span style={{fontSize:12,fontWeight:600,padding:'4px 11px',borderRadius:999,background:'rgba(16,185,129,0.08)',color:'#065F46',border:'1px solid rgba(16,185,129,0.25)'}}>💰 ${fmtN(item.revenue, lang)}/mo</span>}
                  {item.area && <span style={{fontSize:12,fontWeight:600,padding:'4px 11px',borderRadius:999,background:'var(--pg-ink-100)',color:'var(--pg-ink-700)'}}>{item.area}</span>}
                </>
              ) : (
                <>
                  {item.condition && <span style={{fontSize:12,fontWeight:600,padding:'4px 11px',borderRadius:999,background:'var(--pg-blue-50)',color:'var(--pg-blue-700)',border:'1px solid var(--pg-blue-100)'}}>{item.condition}</span>}
                  {item.type && <span style={{fontSize:12,fontWeight:600,padding:'4px 11px',borderRadius:999,background:'var(--pg-ink-100)',color:'var(--pg-ink-700)'}}>{item.type}</span>}
                </>
              )}
            </div>

            {/* Description */}
            {item.description && (
              <div style={{marginBottom:14,padding:'11px 13px',background:'var(--pg-ink-50)',borderRadius:12,border:'1px solid var(--pg-ink-200)'}}>
                <div style={{fontSize:10.5,fontWeight:700,color:'var(--pg-ink-400)',letterSpacing:'0.07em',textTransform:'uppercase',marginBottom:5}}>
                  {lang==='pt'?'DESCRIÇÃO':'DESCRIPTION'}
                </div>
                <div style={{fontSize:13.5,color:'var(--pg-ink-700)',lineHeight:1.55}}>{item.description}</div>
              </div>
            )}

            {isPending && (
              <div style={{padding:'12px 14px',borderRadius:12,background:'#FFFBEB',border:'1px solid #FDE68A',marginBottom:16,display:'flex',alignItems:'flex-start',gap:10}}>
                <span style={{fontSize:20,lineHeight:1,flexShrink:0}}>⏳</span>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:'#92400E'}}>
                    {lang==='pt'?'Aguardando aprovação do admin':lang==='es'?'Esperando aprobación del admin':'Awaiting admin approval'}
                  </div>
                  <div style={{fontSize:12,color:'#B45309',marginTop:2}}>
                    {lang==='pt'?'Não aparece para outros usuários ainda.':lang==='es'?'Aún no visible para otros usuarios.':'Not visible to other users yet.'}
                  </div>
                </div>
              </div>
            )}

            {/* Active rental lock banner */}
            {activeRental && (
              <div style={{marginBottom:12,padding:'11px 14px',borderRadius:12,
                background:'rgba(245,158,11,0.10)',border:'1.5px solid rgba(245,158,11,0.35)',
                display:'flex',alignItems:'flex-start',gap:10}}>
                <span style={{fontSize:20,flexShrink:0,lineHeight:1.2}}>🔒</span>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:'#B45309'}}>
                    {lang==='pt'?'Edição bloqueada — aluguel em andamento':'Edit locked — active rental in progress'}
                  </div>
                  <div style={{fontSize:11.5,color:'#92400E',marginTop:2,lineHeight:1.5}}>
                    {activeRental.requester_name
                      ? (lang==='pt'
                          ? `${activeRental.requester_name} está usando este equipamento.`
                          : `${activeRental.requester_name} is currently renting this equipment.`)
                      : (lang==='pt'
                          ? 'Alguém está usando este equipamento no momento.'
                          : 'This equipment is currently being rented.')}
                    {' '}{lang==='pt'?'Edições só são permitidas quando o equipamento estiver disponível.':'Edits are only allowed when the equipment is available.'}
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>{ if(!activeRental) setEditing(true); }} disabled={!!activeRental || !rentLoaded} style={{
                flex:1,height:50,borderRadius:14,border:'none',cursor:activeRental?'not-allowed':'pointer',fontFamily:'inherit',
                background: activeRental
                  ? 'rgba(0,0,0,0.08)'
                  : 'linear-gradient(135deg,var(--pg-blue-500),var(--pg-blue-700))',
                color: activeRental ? 'var(--pg-ink-400)' : '#fff',
                fontSize:15,fontWeight:700,
                boxShadow: activeRental ? 'none' : '0 4px 14px rgba(0,119,182,0.35)',
                display:'flex',alignItems:'center',justifyContent:'center',gap:8,
                opacity: !rentLoaded ? 0.5 : 1,
                transition:'all .2s',
              }}>
                {activeRental
                  ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                }
                {activeRental
                  ? (lang==='pt'?'Edição bloqueada':'Edit locked')
                  : (lang==='pt'?'Editar anúncio':lang==='es'?'Editar anuncio':'Edit listing')}
              </button>
              <button onClick={handleDelete} disabled={deleting||!!activeRental} title={activeRental?(lang==='pt'?'Bloqueado — aluguel ativo':'Locked — active rental'):undefined} style={{
                width:50,height:50,borderRadius:14,border:'1.5px solid #FCA5A5',
                background:'#FEF2F2',color:'#EF4444',cursor:activeRental?'not-allowed':'pointer',
                display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
                opacity:(deleting||activeRental)?0.5:1,
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              </button>
            </div>

            {/* Mark as Sold — only for equipment-for-sale (not routes/pools, not rentals — those
                are owned/managed through ViewListingSheet's rental-requests panel), not yet sold */}
            {item.type !== 'route' && item.type !== 'pool' && item.type !== 'rent' && item.status !== 'sold' && (
              <button onClick={()=>setMarkSoldOpen(true)} style={{
                width:'100%', marginTop:10, padding:'13px', borderRadius:14,
                border:'none', cursor:'pointer', fontFamily:'inherit',
                background:'linear-gradient(135deg,#22C55E,#15803D)',
                color:'#fff', fontSize:14, fontWeight:700,
                display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                boxShadow:'0 4px 14px rgba(21,128,61,0.35)',
                transition:'all .15s',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12.99V2h10.99l8.6 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                {lang==='pt' ? 'Marcar como vendido' : lang==='es' ? 'Marcar como vendido' : 'Mark as Sold'}
              </button>
            )}
            {item.status === 'sold' && (
              <div style={{
                marginTop:10, padding:'10px 14px', borderRadius:12,
                background:'#F0FDF4', border:'1px solid #86EFAC',
                display:'flex', alignItems:'center', gap:8,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span style={{fontSize:13, fontWeight:700, color:'#16A34A'}}>
                  {lang==='pt' ? 'Vendido!' : lang==='es' ? '¡Vendido!' : 'Sold!'}
                </span>
              </div>
            )}

            {/* Boost — highlight on Home for a paid duration, any status but sold */}
            {item.status !== 'sold' && (
              <button onClick={()=>setBoostOpen(true)} style={{
                width:'100%', marginTop:10, padding:'13px', borderRadius:14,
                border:'1.5px solid rgba(14,186,199,0.4)', background:'rgba(14,186,199,0.08)',
                color:'#0EBAC7', cursor:'pointer', fontFamily:'inherit',
                fontSize:14, fontWeight:700,
                display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                transition:'all .15s',
              }}>
                🚀 {boostedUntil && new Date(boostedUntil) > new Date()
                  ? (lang==='pt'?'Estender destaque':lang==='es'?'Extender destacado':'Extend boost')
                  : (lang==='pt'?'Destacar anúncio':lang==='es'?'Destacar anuncio':'Boost listing')}
              </button>
            )}

            {/* MarkSoldSheet */}
            <Sheet open={markSoldOpen} onClose={()=>setMarkSoldOpen(false)} height="auto">
              {markSoldOpen && (
                <MarkSoldSheet
                  item={item} lang={lang} currentUser={currentUser}
                  onClose={()=>setMarkSoldOpen(false)}
                  showToast={showToast}
                  onSold={(sellerRating)=>{ setMarkSoldOpen(false); onClose && onClose(); if(sellerRating && openRating) setTimeout(()=>openRating(sellerRating), 220); }}
                />
              )}
            </Sheet>

            {/* BoostListingSheet */}
            <Sheet open={boostOpen} onClose={()=>setBoostOpen(false)} height="auto">
              {boostOpen && (
                <BoostListingSheet
                  item={{...item, boostedUntil}} lang={lang}
                  onClose={()=>setBoostOpen(false)}
                  showToast={showToast}
                  onBoosted={(until)=>setBoostedUntil(until)}
                />
              )}
            </Sheet>
          </>
        ) : (
          /* ── Edit mode ── */
          <>
            <div style={{fontSize:12,color:'var(--pg-ink-400)',marginBottom:16}}>
              {lang==='pt'?'Alterações salvas instantaneamente':lang==='es'?'Los cambios se guardan al instante':'Changes are saved instantly'}
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              <div>
                {lbl(lang==='pt'?'Título':'Title')}
                <input {...inp} value={form.name} onChange={e=>set('name',e.target.value)}/>
              </div>
              <div>
                {lbl(lang==='pt'?'Descrição':'Description')}
                <textarea {...inp} value={form.description} onChange={e=>set('description',e.target.value)}
                  rows={3} placeholder={lang==='pt'?'Descreva o produto, estado de conservação, detalhes importantes…':'Describe the product, condition details, important info…'}
                  style={{...inp.style, resize:'vertical', minHeight:80, lineHeight:1.5}}/>
              </div>
              {/* Price fields — pool/route: asking + monthly; equipment: price + mode */}
              {(item.type === 'pool' || item.type === 'route') ? (
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <div>
                    {lbl(lang==='pt'?'Preço de venda ($)':lang==='es'?'Precio de venta ($)':'Sale price ($)')}
                    <input {...inp} type="number" value={form.asking} onChange={e=>set('asking',e.target.value)} placeholder="3500"/>
                  </div>
                  <div>
                    {lbl(lang==='pt'?'Valor/mês ($)':lang==='es'?'Valor/mes ($)':'Monthly rate ($)')}
                    <input {...inp} type="number" value={form.price} onChange={e=>set('price',e.target.value)} placeholder="120"/>
                  </div>
                </div>
              ) : (
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <div>
                    {lbl(lang==='pt'?'Preço ($)':'Price ($)')}
                    <input {...inp} type="number" value={form.price} onChange={e=>set('price',e.target.value)}/>
                  </div>
                  <div>
                    {lbl(lang==='pt'?'Modo':'Mode')}
                    <select {...inp} value={form.priceMode} onChange={e=>set('priceMode',e.target.value)}>
                      <option value="fixed">{lang==='pt'?'Fixo':'Fixed'}</option>
                      <option value="neg">{lang==='pt'?'Negociável':'Negotiable'}</option>
                    </select>
                  </div>
                </div>
              )}
              <div>
                {lbl(lang==='pt'?'Localização':'Location')}
                <CityAutocomplete value={form.loc} onChange={v=>set('loc',v)} lang={lang}/>
              </div>
              {/* For equipment: show Category + Condition */}
              {item.type !== 'pool' && item.type !== 'route' && (
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <div>
                    {lbl(lang==='pt'?'Categoria':'Category')}
                    <input {...inp} value={form.cat} onChange={e=>set('cat',e.target.value)} placeholder="Pumps, Vacuum…"/>
                  </div>
                  <div>
                    {lbl(lang==='pt'?'Condição':'Condition')}
                    <input {...inp} value={form.condition} onChange={e=>set('condition',e.target.value)} placeholder="New, Used…"/>
                  </div>
                </div>
              )}
              {/* For pools/routes: show Casa/Condo toggle */}
              {(item.type === 'pool' || item.type === 'route') && (
                <div>
                  {lbl(lang==='pt'?'Tipo de imóvel':lang==='es'?'Tipo de propiedad':'Property type')}
                  <div style={{display:'flex', gap:8}}>
                    {[['house', lang==='pt'?'🏠 Casa':'🏠 House'], ['condo', '🏢 Condo']].map(([val, label]) => (
                      <button key={val} onClick={()=>set('cat', val)} style={{
                        flex:1, padding:'11px', borderRadius:10, border:'1.5px solid',
                        cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:600,
                        borderColor: form.cat===val ? 'var(--pg-blue-500)' : 'var(--pg-ink-200)',
                        background: form.cat===val ? 'var(--pg-blue-50)' : 'transparent',
                        color: form.cat===val ? 'var(--pg-blue-700)' : 'var(--pg-ink-600)',
                        transition:'all .15s',
                      }}>{label}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{display:'flex',gap:10,marginTop:16}}>
              <button onClick={()=>setEditing(false)} style={{flex:1,height:50,borderRadius:14,border:'1.5px solid var(--pg-ink-200)',background:'transparent',color:'var(--pg-ink-700)',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
                {lang==='pt'?'Cancelar':lang==='es'?'Cancelar':'Cancel'}
              </button>
              <button onClick={handleSave} disabled={saving} style={{
                flex:2,height:50,borderRadius:14,border:'none',cursor:'pointer',fontFamily:'inherit',
                background:'linear-gradient(135deg,var(--pg-blue-500),var(--pg-blue-700))',
                color:'#fff',fontSize:15,fontWeight:700,opacity:saving?0.7:1,
                boxShadow:'0 4px 14px rgba(0,119,182,0.30)',
              }}>
                {saving?(lang==='pt'?'Salvando…':lang==='es'?'Guardando…':'Saving…'):(lang==='pt'?'Salvar alterações':lang==='es'?'Guardar cambios':'Save changes')}
              </button>
            </div>
          </>
        )}
      </div>
      </div>
    </div>
  );
}

function MarketplaceScreen({ ctx }) {
  const { lang, user={}, openChat, goTab, openPublicProfile, liveMarket=[], dbWrite, showToast, hasUnreadChat, deepLinkListingId, clearDeepLink, pendingRatings=[], openRating, openBuyerRatingPrompt, loadPendingRatings, darkMode=false, openNotifications, hasUnreadNotif, isDesktop=false } = ctx;

  // Normalize a raw Supabase marketplace row to app format
  const normMktItem = (r) => ({ _id:r.id, _live:true, type:r.type, name:r.name, cat:r.cat,
    condition:r.condition, price:r.price, priceMode:r.price_mode,
    loc:r.loc, asking:r.asking||null, area:r.area||null, description:r.description||'',
    address:r.address||null, system:r.pool_system||null, sizeFt:r.size_ft||null,
    gallons:r.gallons||null, freq:r.freq_week||null, warranty:r.warranty||null,
    warrantyMonths:r.warranty_months||null, routeName:r.route_name||null,
    clients:r.clients||null, revenue:r.revenue||null,
    author:r.author, author_id:r.author_id||null,
    photoUrl:r.photo_url||null,
    photoUrls:(r.photo_urls&&r.photo_urls.length>0)?r.photo_urls:(r.photo_url?[r.photo_url]:[]),
    rentPeriod:r.rent_period||null, rentPrices:r.rent_prices||null, status:r.status||'pending',
    createdAt:r.created_at||null, soldAt:r.sold_at||null, boostedUntil:r.boosted_until||null,
    expiresAt:r.expires_at||null });

  // Show sold items for 1 day only, then they get auto-deleted from marketplace (archived to history)
  const isSoldVisible = (item) =>
    item.status === 'sold' && (
      isMyPost(item) ||
      (item.soldAt && (Date.now() - new Date(item.soldAt).getTime()) < 86400000)
    );

  // Never show raw email as author — if author is an email, show the part before @
  const fmtAuthor = (a) => {
    if (!a) return 'Unknown';
    if (a === user.email && user.name && !user.name.includes('@')) return user.name;
    if (a.includes('@')) return a.split('@')[0];
    return a;
  };

  // Same logic as dbWrite: resolve what name was stored as author
  const myAuthor = (user.name && !user.name.includes('@'))
    ? user.name
    : (user.email ? user.email.split('@')[0] : null);

  const isMyPost = (m) => (
    // UID match — most reliable, works across sessions
    (user.uid && m.author_id && m.author_id === user.uid) ||
    // Name/email fallbacks ONLY for legacy posts that have no author_id
    // (prevents false-match when two users share the same display name)
    (!m.author_id && myAuthor && m.author === myAuthor) ||
    (!m.author_id && user.name && m.author === user.name) ||
    (!m.author_id && user.email && m.author === user.email.split('@')[0])
  );
  // Rental owners need ViewListingSheet — it already has the full owner-side
  // rental-requests approve/decline UI (isOwner && isRent branches). Only
  // route to the plain edit/delete MyPostDetailSheet for non-rent own posts.
  const openMyOrOthersListing = (item) => {
    if (isMyPost(item) && item.type !== 'rent') setMyPostDetail(item);
    else openListing(item);
  };
  const t = STRINGS[lang];
  const [view,         setView]        = React.useState(() => {
    try {
      const hash = window.location.hash.replace(/^#\/?/, '');
      const [base, seg] = hash.split('/');
      if (base === 'market' && ['buy','rent','routes','sell'].includes(seg)) return seg;
    } catch(e) {}
    return 'buy';
  });
  const [cat,          setCat]         = React.useState('All');
  const [q,            setQ]           = React.useState('');
  const [selected,     setSelected]    = React.useState(null);
  const [myPostDetail, setMyPostDetail]= React.useState(null); // own post detail/edit
  const [viewListing,  setViewListing] = React.useState(null); // other user's post — full-screen view
  const historyPushed = React.useRef(false);
  const [postOpen,   setPostOpen]   = React.useState(false);
  const [postMode,   setPostMode]   = React.useState(null); // 'sell'|'rent'|'route'
  const [priceRange, setPriceRange] = React.useState('all');  // equipment price filter
  const [priceOpen,  setPriceOpen]  = React.useState(false);  // price dropdown open
  const [userLocation,     setUserLocation]     = React.useState(() => { try { const s=localStorage.getItem('pg_loc'); return s?JSON.parse(s):null; } catch(e){return null;} });
  const [radiusMiles,      setRadiusMiles]      = React.useState(() => { try { const s=localStorage.getItem('pg_loc_r'); return s?Number(s):25; } catch(e){return 25;} });
  const [locationFilterOpen, setLocationFilterOpen] = React.useState(false);
  React.useEffect(()=>{ try{ if(userLocation) localStorage.setItem('pg_loc',JSON.stringify(userLocation)); else localStorage.removeItem('pg_loc'); window.dispatchEvent(new CustomEvent('pg_loc_updated',{detail:userLocation})); }catch(e){} },[userLocation]);
  React.useEffect(()=>{ try{ localStorage.setItem('pg_loc_r',String(radiusMiles)); }catch(e){} },[radiusMiles]);
  const [routePrice, setRoutePrice] = React.useState('all');  // routes price filter
  const [routeSub,   setRouteSub]   = React.useState('routes'); // 'routes' | 'pools'
  const [poolPrice,  setPoolPrice]  = React.useState('all');  // individual pools price filter
  const [savedIds,   setSavedIds]   = React.useState(new Set());
  const [shareItem,  setShareItem]  = React.useState(null);

  // Proactively ask the owner about their own soon-expiring listings (still
  // available → renew 30 more days, or not → pick the buyer from chat / skip).
  const [expiringItem, setExpiringItem] = React.useState(null); // item being prompted about
  const [notAvailableItem, setNotAvailableItem] = React.useState(null); // item in the buyer-picker sheet
  const EXPIRY_PROMPT_WINDOW_MS = 3 * 24 * 60 * 60 * 1000; // prompt once <3 days remain
  const promptedMktExpiryRef = React.useRef(new Set());
  React.useEffect(() => {
    if (!user?.uid || expiringItem || notAvailableItem) return;
    const soon = liveMarket.find(m => {
      if (m.status !== 'approved' || m.author_id !== user.uid || !m.expiresAt) return false;
      if (promptedMktExpiryRef.current.has(m._id)) return false;
      const remainingMs = new Date(m.expiresAt).getTime() - Date.now();
      return remainingMs > 0 && remainingMs < EXPIRY_PROMPT_WINDOW_MS;
    });
    if (soon) { promptedMktExpiryRef.current.add(soon._id); setExpiringItem(soon); }
  }, [liveMarket, user?.uid, expiringItem, notAvailableItem]);

  const renewListing = async (item) => {
    if (!window.sb) return;
    const { error } = await window.sb.from('marketplace')
      .update({ expires_at: new Date(Date.now() + 30*24*60*60*1000).toISOString() })
      .eq('id', item._id);
    setExpiringItem(null);
    if (error) { showToast && showToast('❌ ' + error.message); return; }
    showToast && showToast(lang==='pt'?'✓ Anúncio renovado por mais 30 dias':lang==='es'?'✓ Anuncio renovado por 30 días más':'✓ Listing renewed for 30 more days');
  };

  // Sync view to URL hash
  React.useEffect(() => {
    try {
      const base = window.location.hash.replace(/^#\/?/, '').split('/')[0];
      if (base === 'market') window.history.replaceState(null, '', '#market/' + view);
    } catch(e) {}
  }, [view]);

  // Browser back/forward: update view when hash changes
  React.useEffect(() => {
    const onHash = () => {
      try {
        const hash = window.location.hash.replace(/^#\/?/, '');
        const [base, seg] = hash.split('/');
        if (base === 'market' && ['buy','rent','routes','sell'].includes(seg)) setView(seg);
      } catch(e) {}
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // ── Listing open / close with URL state ──────────────────────
  const openListing = React.useCallback((item) => {
    setViewListing(item);
    // Only push URL for live Supabase items (have real UUID _id)
    if (item._live) {
      window.history.pushState({ pgListing: item._id }, '', '?listing=' + item._id);
      historyPushed.current = true;
    }
  }, []);

  // Normalize a static EQUIPMENT array item → ViewListingSheet format
  const normStatic = React.useCallback((e) => ({
    _id: 'static-' + e.id,
    _live: false,
    type: e.mode || 'sell',
    name: e.name || '',
    cat: e.category || '',
    condition: typeof e.condition === 'object' ? (e.condition[lang] || e.condition.en || '') : (e.condition || ''),
    price: String(e.price || ''),
    priceMode: 'fixed',
    loc: e.loc || '',
    description: '',
    author: null,
    author_id: null,
    photoUrl: null,
    photoUrls: [],
    rentPeriod: e.unit
      ? (e.unit.en === '/week' ? 'week' : e.unit.en === '/month' ? 'month' : 'day')
      : null,
    status: 'approved',
    createdAt: null,
    soldAt: null,
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
    const handler = () => { if (historyPushed.current) { setViewListing(null); historyPushed.current = false; } };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  // Deep link — fetch listing from Supabase when ?listing=ID is in the URL
  React.useEffect(() => {
    if (!deepLinkListingId || !window.sb) return;
    window.sb.from('marketplace').select('*').eq('id', deepLinkListingId).single()
      .then(({ data }) => {
        if (!data) return;
        const normalized = normMktItem(data);
        if (isMyPost(normalized) && normalized.type !== 'rent') { setMyPostDetail(normalized); }
        else { setViewListing(normalized); historyPushed.current = true; }
      })
      .catch(() => {})
      .finally(() => { if (clearDeepLink) clearDeepLink(); });
  }, [deepLinkListingId]); // eslint-disable-line

  // Load saved listing IDs for current user
  React.useEffect(() => {
    if (!user?.uid || !window.sb) return;
    window.sb.from('saved_listings').select('listing_id').eq('user_id', user.uid).then(({data}) => {
      if (data) setSavedIds(new Set(data.map(r => r.listing_id)));
    });
  }, [user?.uid]);

  const toggleSave = async (e, listingId) => {
    if (e) e.stopPropagation();
    if (!user?.uid) { showToast && showToast(lang==='pt'?'Faça login para salvar':lang==='es'?'Inicia sesión para guardar':'Login to save'); return; }
    const isSaved = savedIds.has(listingId);
    // Optimistic update
    setSavedIds(prev => { const s = new Set(prev); isSaved ? s.delete(listingId) : s.add(listingId); return s; });
    if (isSaved) {
      await window.sb.from('saved_listings').delete().eq('user_id', user.uid).eq('listing_id', listingId);
      showToast && showToast(lang==='pt'?'💔 Removido dos salvos':lang==='es'?'💔 Eliminado de guardados':'💔 Removed from saved');
    } else {
      await window.sb.from('saved_listings').insert({ user_id: user.uid, listing_id: listingId });
      showToast && showToast(lang==='pt'?'❤️ Salvo!':lang==='es'?'❤️ Guardado!':'❤️ Saved!');
    }
  };

  const handleShare = async (e, item) => {
    if (e) e.stopPropagation();
    const listingUrl = item._id ? `https://poolguyx.com/?listing=${item._id}` : 'https://poolguyx.com';
    const txt = `${item.name}${item.priceMode==='neg'?' — Negotiable':item.price?` — $${item.price}`:''}  📍 ${item.loc||'Broward County, FL'}\n\nFind it on PoolGuyX 👉 ${listingUrl}`;
    if (navigator.share) {
      // Try to share with photo
      const photoUrl = (item.photoUrls && item.photoUrls[0]) || item.photoUrl || null;
      if (photoUrl) {
        try {
          const resp = await fetch(photoUrl);
          const blob = await resp.blob();
          const file = new File([blob], 'listing.jpg', { type: blob.type || 'image/jpeg' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ title: item.name, text: txt, files: [file] });
            return;
          }
        } catch(err) { /* fall through to text-only */ }
      }
      navigator.share({ title: item.name, text: txt, url: listingUrl }).catch(()=>{});
    } else {
      setShareItem(item);
    }
  };

  const catLabels = {
    All:       {en:'All',        pt:'Todos',         es:'Todos'},
    Pumps:     {en:'Pumps',      pt:'Bombas',         es:'Bombas'},
    Vacuum:    {en:'Vacuum',     pt:'Aspiradores',    es:'Aspiradores'},
    Heaters:   {en:'Heaters',    pt:'Aquecedores',    es:'Calentadores'},
    Pole:      {en:'Pole',       pt:'Pole',           es:'Pole'},
    Car:       {en:'Cart',       pt:'Carrinho',       es:'Carrito'},
    Truck:     {en:'Truck',      pt:'Truck',          es:'Truck'},
    Jug:       {en:'Jug',        pt:'Jug',            es:'Jug'},
    Net:       {en:'Net',        pt:'Net',            es:'Net'},
    Chemicals: {en:'Chemicals',  pt:'Químicos',       es:'Químicos'},
    Filters:   {en:'Filters',    pt:'Filtros',        es:'Filtros'},
    Others:    {en:'Others',     pt:'Outros',         es:'Otros'},
  };
  const cats = Object.keys(catLabels);

  const isEquipment = view === 'buy' || view === 'rent';
  const mode = view === 'rent' ? 'rent' : 'sell';

  // City label for location button — uses stored city, falls back to haversine lookup
  const locCity = React.useMemo(() => {
    if (!userLocation) return '';
    if (userLocation.city) return userLocation.city;
    const lat = userLocation.lat, lng = userLocation.lng;
    if (lat == null || lng == null) return '';
    const coords = window.FL_CITY_COORDS || {};
    let best = '', bestDist = Infinity;
    for (const [name, [clat, clng]] of Object.entries(coords)) {
      const dLat = (clat - lat) * Math.PI / 180;
      const dLng = (clng - lng) * Math.PI / 180;
      const a = Math.sin(dLat/2)**2 + Math.cos(lat*Math.PI/180)*Math.cos(clat*Math.PI/180)*Math.sin(dLng/2)**2;
      const d = 3958.8 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      if (d < bestDist) { bestDist = d; best = name; }
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
  const liveRoutes = marketByCounty
    .filter(m => m.type === 'route' && (m.status === 'approved' || (m.status === 'pending' && isMyPost(m))))
    .map(m => ({
      id: m._id, _live: true, _liveId: m._id,
      _author: m.author, _authorId: m.author_id,
      name: m.name || m.routeName || '',
      clients: m.clients ? String(m.clients) : '?',
      area: m.area || m.loc || '',
      revenue: m.revenue ? `$${fmtN(m.revenue, lang)}/mo` : '',
      est: Number(m.asking) || 0,
      photoUrl: m.photoUrl || null,
      photoUrls: m.photoUrls || [],
      status: m.status,
    }));
  const allRoutes = [...liveRoutes];

  // Piscinas avulsas reais do banco (type='pool', aprovadas ou próprias pendentes)
  const livePools = marketByCounty
    .filter(m => m.type === 'pool' && (m.status === 'approved' || (m.status === 'pending' && isMyPost(m))))
    .map(m => ({
      id: m._id, _live: true, _liveId: m._id, _type: 'pool',
      _author: m.author, _authorId: m.author_id,
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
      system: m.system || null, sizeFt: m.sizeFt || null,
      gallons: m.gallons || null, freq: m.freq || null,
      warranty: m.warranty || null, warrantyMonths: m.warrantyMonths || null,
      address: m.address || null,
    }));
  const allPools = [...livePools];

  const list = isEquipment
    ? EQUIPMENT.filter(e =>
        e.mode === mode &&
        (cat === 'All' || e.category === cat) &&
        (q === '' || e.name.toLowerCase().includes(q.toLowerCase())) &&
        (priceRange === 'all' ||
         (priceRange === 'u100'    && e.price < 100) ||
         (priceRange === '100-500' && e.price >= 100 && e.price <= 500) ||
         (priceRange === 'o500'    && e.price > 500))
      )
    : view === 'routes' && routeSub === 'pools'
      ? allPools.filter(p =>
          (poolPrice === 'all' ||
           (poolPrice === 'u1500' && p.est < 1500) ||
           (poolPrice === '1500-3k' && p.est >= 1500 && p.est <= 3000) ||
           (poolPrice === 'o3k'   && p.est > 3000))
        )
      : allRoutes.filter(r =>
          (routePrice === 'all' ||
           (routePrice === 'u5k'   && r.est < 5000) ||
           (routePrice === '5k-8k' && r.est >= 5000 && r.est <= 8000) ||
           (routePrice === 'o8k'   && r.est > 8000))
        );
  // Own postings always float to the top of whichever list is being shown
  list.sort((a, b) => {
    const aOwn = user?.uid && a._authorId === user.uid ? 0 : 1;
    const bOwn = user?.uid && b._authorId === user.uid ? 0 : 1;
    return aOwn - bOwn;
  });

  // Batch-fetch seller ratings for whatever routes/pools are currently listed, so
  // the seller's name + rating can show directly on the card (not just once opened).
  const [authorRatings, setAuthorRatings] = React.useState({}); // id -> {avg, count}
  const authorIdsKey = [...new Set(list.map(x => x._authorId || x.author_id).filter(Boolean))].sort().join(',');
  React.useEffect(() => {
    if (!window.sb || !authorIdsKey) return;
    const ids = authorIdsKey.split(',');
    window.sb.from('ratings').select('to_id, stars').in('to_id', ids).eq('pending', false)
      .then(({ data }) => {
        const map = {};
        (data || []).forEach(r => {
          if (r.stars == null) return;
          if (!map[r.to_id]) map[r.to_id] = { sum: 0, count: 0 };
          map[r.to_id].sum += r.stars;
          map[r.to_id].count++;
        });
        const out = {};
        Object.keys(map).forEach(id => { out[id] = { avg: Math.round(map[id].sum / map[id].count * 10) / 10, count: map[id].count }; });
        setAuthorRatings(out);
      })
      .catch(() => {});
  }, [authorIdsKey]);

  // Batch-fetch which rental listings currently have an approved (in-progress)
  // request, so the feed can show "Em andamento" instead of letting other
  // people request an item that's already out. rental_requests itself is
  // locked down to the owner/requester (it holds prices and contact info),
  // so this reads a public view that only exposes the listing_id — nothing
  // else — for anyone to check "is this occupied right now".
  const [activeRentalIds, setActiveRentalIds] = React.useState(new Set());
  const rentListingIdsKey = [...new Set(list.filter(x => x.type === 'rent').map(x => x._id).filter(Boolean))].sort().join(',');
  React.useEffect(() => {
    if (!window.sb || !rentListingIdsKey) { setActiveRentalIds(new Set()); return; }
    const ids = rentListingIdsKey.split(',');
    window.sb.from('active_rental_listing_ids').select('listing_id').in('listing_id', ids)
      .then(({ data }) => setActiveRentalIds(new Set((data || []).map(r => r.listing_id))))
      .catch(() => {});
  }, [rentListingIdsKey]);

  const tabIcons = {
    buy:    (s,c)=> Icon.cart(s, c),
    rent:   (s,c)=> Icon.key(s, c),
    routes: (s,c)=> Icon.pin(s, c),
    pools:  (s,c)=> Icon.pool(s, c),
  };
  const tabLabels = {
    buy:    lang==='pt'?'Comprar':lang==='es'?'Comprar':'Buy',
    rent:   lang==='pt'?'Alugar':lang==='es'?'Rentar':'Rent',
    routes: lang==='pt'?'Rotas':lang==='es'?'Rutas':'Routes',
    pools:  lang==='pt'?'Piscinas':lang==='es'?'Piscinas':'Pools',
  };
  const tabSubs = {
    buy:    lang==='pt'?'Equipamentos à venda':lang==='es'?'Equipo en venta':'Equipment for sale',
    rent:   lang==='pt'?'Para alugar':lang==='es'?'Para rentar':'For rent',
    routes: lang==='pt'?'Rotas de negócio':lang==='es'?'Rutas de negocio':'Business routes',
    pools:  lang==='pt'?'Piscinas avulsas':lang==='es'?'Piscinas sueltas':'Single pools',
  };

  const sellForView = { buy:'sell', rent:'rent', routes:'route', pools:'route' };

  // Per-tab counts shown on the header pills
  const approvedOrOwn = (m) => m.status === 'approved' || (m.status === 'pending' && isMyPost(m));
  const buyCount   = marketByCounty.filter(m => m.type === 'sell' && approvedOrOwn(m)).length
    + EQUIPMENT.filter(e => e.mode === 'sell').length;
  const rentCount  = marketByCounty.filter(m => m.type === 'rent' && approvedOrOwn(m)).length
    + EQUIPMENT.filter(e => e.mode === 'rent').length;
  const routesCount = allRoutes.length;
  const poolsCount  = allPools.length;
  const tabCounts = { buy: buyCount, rent: rentCount, routes: routesCount, pools: poolsCount };

  const locationLbl = lang==='pt'?'Sul da Flórida':lang==='es'?'Sur de Florida':'South Florida';

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
  const renderLiveCard = (item, desktopMode=false) => {
    const isPending   = item.status === 'pending';
    const isSoldItem  = item.status === 'sold';
    const isActiveRental = item.type === 'rent' && activeRentalIds.has(item._id);
    const canDel      = user.role === 'admin' || isMyPost(item);
    const handleQuickDelete = async (e) => {
      e.stopPropagation();
      if (!window.confirm(lang==='pt'?`Excluir "${item.name}"?`:`Delete "${item.name}"?`)) return;
      const { error } = await window.sb.from('marketplace').delete().eq('id', item._id);
      if (error) { showToast && showToast('❌ ' + error.message); return; }
      showToast && showToast('🗑️ ' + (lang==='pt'?'Anúncio excluído':'Listing deleted'));
      if (ctx && ctx.removeMarketItem) ctx.removeMarketItem(item._id);
    };
    const photoSrc = (item.photoUrls&&item.photoUrls[0]) || item.photoUrl || null;
    return (
      <button key={item._id}
        onClick={()=> openMyOrOthersListing(item)}
        className={isSoldItem ? '' : 'pg-press'}
        style={{
          padding:0, overflow:'hidden', position:'relative', cursor: isSoldItem ? (isMyPost(item) ? 'pointer' : 'default') : 'pointer',
          border: (desktopMode && darkMode)
            ? `1.5px solid ${isSoldItem ? '#30363D' : '#21262D'}`
            : isPending ? '1.5px solid var(--pg-ink-200)' : isSoldItem ? '1.5px solid var(--pg-ink-200)' : '1.5px solid var(--pg-blue-100)',
          display:'flex', flexDirection:'column',
          borderRadius:16,
          background: (desktopMode && darkMode)
            ? (isSoldItem ? '#161B22' : '#1C2128')
            : (isSoldItem ? 'var(--pg-ink-50)' : 'var(--pg-white)'),
          textAlign:'left', fontFamily:'inherit',
          boxShadow: desktopMode
            ? (darkMode ? '0 2px 16px rgba(0,0,0,0.45), 0 0 0 0 transparent' : '0 2px 12px rgba(0,0,0,0.08), 0 0 0 0 transparent')
            : '0 1px 3px rgba(0,0,0,0.08)',
          transition:'box-shadow .18s, transform .12s',
        }}>
        <div style={{opacity: isPending ? 0.82 : isSoldItem ? 0.70 : 1, filter: isSoldItem ? 'grayscale(0.65)' : 'none', display:'flex', flexDirection:'column', flex:1}}>
        {/* Photo */}
        <div style={{position:'relative', paddingTop: desktopMode ? '62%' : '72%', background:'var(--pg-ink-200)', overflow:'hidden', flexShrink:0}}>
          <div style={{position:'absolute', inset:0}}>
            {photoSrc
              ? <img src={photoSrc} alt={item.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
              : <NoPhotoPlaceholder height={'100%'}/>
            }
          </div>
          <div style={{position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(0,0,0,0.28) 0%, transparent 45%, transparent 60%, rgba(0,0,0,0.10) 100%)', pointerEvents:'none'}}/>
          {isMyPost(item) && (
            <span style={{position:'absolute', top:10, left:10, fontSize:9.5, fontWeight:700, padding:'3px 8px', borderRadius:6, letterSpacing:'0.05em',
              background: isPending?'rgba(255,243,205,0.95)':'rgba(14,186,199,0.92)',
              color: isPending?'#856404':'#fff', backdropFilter:'blur(4px)'}}>
              {isPending ? `⏳ ${lang==='pt'?'REVISÃO':'REVIEW'}` : `✦ ${lang==='pt'?'MEU ANÚNCIO':'MY LISTING'}`}
            </span>
          )}
          {isSoldItem && (
            <span style={{position:'absolute', top:10, left:10, fontSize:9.5, fontWeight:800, padding:'3px 10px', borderRadius:6,
              background:'rgba(100,100,100,0.90)', color:'#fff', backdropFilter:'blur(4px)', letterSpacing:'0.08em'}}>
              SOLD
            </span>
          )}
          {isActiveRental && (
            <span style={{position:'absolute', top:10, left:10, fontSize:9.5, fontWeight:800, padding:'3px 10px', borderRadius:6,
              background:'rgba(217,119,6,0.92)', color:'#fff', backdropFilter:'blur(4px)', letterSpacing:'0.08em'}}>
              ⏳ {lang==='pt'?'EM ANDAMENTO':lang==='es'?'EN CURSO':'IN PROGRESS'}
            </span>
          )}
          <span style={{position:'absolute', top:10, right:10, fontSize:9, fontWeight:700, padding:'3px 8px', borderRadius:6,
            background:'rgba(0,0,0,0.52)', color:'#fff', letterSpacing:'0.06em', backdropFilter:'blur(4px)', textTransform:'uppercase'}}>
            {item.cat||'Tools'}
          </span>
        </div>
        {/* Content */}
        <div style={{padding: desktopMode ? '14px 16px 16px' : '12px 13px 14px', display:'flex', flexDirection:'column'}}>
          <div style={{fontSize: desktopMode?15:14, fontWeight:700, letterSpacing:'-0.01em', lineHeight:1.3, color:'var(--pg-ink-900)',
            minHeight: (desktopMode?15:14)*1.3*2,
            display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'}}>
            <Tx lang={lang}>{item.name}</Tx>
          </div>
          <div style={{fontSize:11.5, color:'var(--pg-ink-500)', marginTop:5, lineHeight:1.4, minHeight:11.5*1.4*2,
            display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'}}>
            <Tx lang={lang}>{item.description||([item.condition,item.loc].filter(Boolean).join(' · ')||'—')}</Tx>
          </div>
          {item.author_id && (
            <div style={{display:'flex', alignItems:'center', gap:5, marginTop:6}}>
              <AvatarFetch uid={item.author_id} name={fmtAuthor(item.author)} size={18}/>
              <span style={{fontSize:11.5, fontWeight:600, color:'var(--pg-ink-600)',
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:90}}>
                {fmtAuthor(item.author)}
              </span>
              {authorRatings[item.author_id] ? (
                <>
                  <Stars rating={authorRatings[item.author_id].avg} size={10}/>
                  <span style={{fontSize:11, color:'var(--pg-ink-400)'}}>{authorRatings[item.author_id].avg} ({authorRatings[item.author_id].count})</span>
                </>
              ) : (
                <span style={{fontSize:10.5, color:'var(--pg-ink-400)'}}>{lang==='pt'?'sem avaliações':lang==='es'?'sin calificaciones':'no ratings'}</span>
              )}
              {item.createdAt && <span style={{fontSize:10, color:'var(--pg-ink-400)', flexShrink:0, marginLeft:'auto'}}>· {timeAgo(item.createdAt,lang)}</span>}
            </div>
          )}
          <div style={{height:1, background:'var(--pg-ink-100)', margin:'10px 0'}}/>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:4}}>
            {item.priceMode==='neg' ? (
              <span style={{fontSize:12, fontWeight:700, padding:'4px 10px', borderRadius:999,
                background: isPending?'var(--pg-ink-100)':'var(--pg-blue-50)',
                color: isPending?'var(--pg-ink-400)':'var(--pg-blue-600)',
                border:`1px solid ${isPending?'var(--pg-ink-200)':'var(--pg-blue-100)'}`, flexShrink:0}}>
                🤝 {lang==='pt'?'Negociável':'Negotiable'}
              </span>
            ) : (
              <span style={{fontFamily:'var(--pg-font-display)', fontSize: desktopMode?24:22, fontWeight:800,
                color: isPending?'var(--pg-ink-400)':isSoldItem?'var(--pg-ink-400)':'var(--pg-blue-500)',
                letterSpacing:'-0.02em', lineHeight:1, flexShrink:0, textDecoration: isSoldItem?'line-through':'none'}}>
                ${fmtN(item.price, lang)}
              </span>
            )}
          </div>
          {!isMyPost(item) && !isPending && (
            <div style={{display:'flex', gap:6, marginTop:8}}>
              <button onClick={(e)=>toggleSave(e,item._id)} style={{
                flex:1, height:28, borderRadius:8, cursor:'pointer', fontFamily:'inherit',
                border: savedIds.has(item._id)?'1px solid #FCA5A5':'1px solid var(--pg-ink-200)',
                background: savedIds.has(item._id)?'#FEF2F2':'var(--pg-ink-50)',
                color: savedIds.has(item._id)?'#EF4444':'var(--pg-ink-400)',
                display:'flex', alignItems:'center', justifyContent:'center', gap:4, fontSize:11, fontWeight:600,
              }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill={savedIds.has(item._id)?'currentColor':'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                {savedIds.has(item._id)?(lang==='pt'?'Salvo':'Saved'):(lang==='pt'?'Salvar':'Save')}
              </button>
              <button onClick={(e)=>handleShare(e,item)} style={{
                width:28, height:28, borderRadius:8, border:'1px solid var(--pg-ink-200)',
                background:'var(--pg-ink-50)', color:'var(--pg-ink-400)', cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
              </button>
            </div>
          )}
          {isPending && <div style={{marginTop:8, fontSize:10.5, color:'#92710A', background:'#FFF8E1',
            border:'0.5px solid #FFE082', borderRadius:6, padding:'4px 8px', textAlign:'center'}}>
            ⏳ {lang==='pt'?'Em revisão':'Under review'}</div>}
        </div>
        </div>
        {canDel && <div onClick={handleQuickDelete} style={{margin:'0 13px 14px', padding:'6px 0', borderRadius:8,
            background:'#FEF2F2', border:'1px solid #FCA5A5', color:'#EF4444', fontSize:11, fontWeight:700,
            textAlign:'center', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5}}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
            {lang==='pt'?'Excluir':'Delete'}
          </div>}
      </button>
    );
  };

  // ══════════════════════════════════════════════════════════════
  // ── DESKTOP LAYOUT (≥ 900px) ─────────────────────────────────
  // ══════════════════════════════════════════════════════════════
  if (isDesktop) {
    const liveEquipment = marketByCounty.filter(m => m.type === mode &&
      (cat === 'All' || !m.cat || m.cat === cat) &&
      (m.status==='approved' || (m.status==='pending'&&isMyPost(m)))
    ).sort((a, b) => {
      const aOwn = user?.uid && a.author_id === user.uid ? 0 : 1;
      const bOwn = user?.uid && b.author_id === user.uid ? 0 : 1;
      return aOwn - bOwn;
    });
    return (
      <div style={{position:'relative', width:'100%', height:'100%', overflow:'hidden'}}>
      <div style={{height:'100%', overflowY:'auto', background:'var(--pg-bg)'}}>

        {/* ── HERO HEADER — compacto ────────────────────────────── */}
        {(function(){
          const _tx  = darkMode ? '#fff'                      : '#0A2840';
          const _sub = darkMode ? 'rgba(255,255,255,0.50)'    : 'rgba(10,40,64,0.50)';
          const _sub2= darkMode ? 'rgba(255,255,255,0.55)'    : 'rgba(10,40,64,0.55)';
          const _ib  = darkMode ? 'rgba(255,255,255,0.12)'    : 'rgba(10,40,64,0.08)';
          const _ibr = darkMode ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(10,40,64,0.12)';
          const _locBg= darkMode ? 'rgba(0,119,182,0.22)'     : 'rgba(0,119,182,0.12)';
          const _locBr= darkMode ? '1px solid rgba(0,119,182,0.40)' : '1px solid rgba(0,119,182,0.25)';
          const _locTx= darkMode ? 'rgba(255,255,255,0.80)'   : '#0A2840';
          const _bg  = darkMode
            ? 'linear-gradient(135deg, #011B5A 0%, #0A2E6A 30%, #0077B6 70%, #023E8A 100%)'
            : 'linear-gradient(135deg, #e8f5ff 0%, #cfe9f8 40%, #b8dff5 100%)';
          return (
            <div style={{background:_bg, padding:'28px 40px 56px', position:'relative', overflow:'visible'}}>
              <div style={{position:'absolute', top:-60, right:-60, width:220, height:220,
                borderRadius:'50%', background: darkMode?'rgba(255,255,255,0.04)':'rgba(10,40,64,0.03)', pointerEvents:'none'}}/>
              <div style={{position:'absolute', bottom:-40, left:200, width:160, height:160,
                borderRadius:'50%', background: darkMode?'rgba(255,255,255,0.03)':'rgba(10,40,64,0.02)', pointerEvents:'none'}}/>
              {/* Centered icon watermark */}
              <div style={{position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none', zIndex:0}}>
                <img src="icone-watermark.png" alt="" style={{position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)', height:245, objectFit:'contain', opacity:0.60, userSelect:'none'}}/>
              </div>

              {/* Single row: icon+title · stats · county · actions */}
              <div style={{display:'flex', alignItems:'center', gap:20}}>
                {/* Brand */}
                <div style={{display:'flex', alignItems:'center', gap:12, flexShrink:0}}>
                  <div style={{width:42, height:42, borderRadius:13, flexShrink:0,
                    background:_ib, border:_ibr,
                    display:'flex', alignItems:'center', justifyContent:'center'}}>
                    {Icon.cart(20,_tx)}
                  </div>
                  <div>
                    <div style={{fontSize:9.5, fontWeight:700, color:_sub,
                      letterSpacing:'0.13em', textTransform:'uppercase', marginBottom:2}}>
                      {lang==='pt'?'MARKETPLACE · SUL DA FLÓRIDA':'MARKETPLACE · SOUTH FLORIDA'}
                    </div>
                    <div style={{fontFamily:'var(--pg-font-display)', fontSize:20, fontWeight:800,
                      color:_tx, letterSpacing:'-0.025em', lineHeight:1}}>
                      {lang==='pt'?'Sul da Flórida':'South Florida'}
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div style={{width:1, height:32, background: darkMode?'rgba(255,255,255,0.12)':'rgba(10,40,64,0.10)', flexShrink:0}}/>

                {/* Stats inline — icon + count per category, no labels */}
                <div style={{display:'flex', alignItems:'center', gap:14, flex:1}}>
                  {[
                    { icon: Icon.cart(13,_sub2), value: buyCount },
                    { icon: Icon.key(13,_sub2),  value: rentCount },
                    { icon: Icon.pin(13,_sub2),  value: routesCount },
                    { icon: Icon.pool(13,_sub2), value: poolsCount },
                  ].map((s,i) => (
                    <div key={i} style={{display:'flex', alignItems:'center', gap:5}}>
                      {i > 0 && <div style={{width:1, height:16, background: darkMode?'rgba(255,255,255,0.12)':'rgba(10,40,64,0.10)', marginRight:9}}/>}
                      {s.icon}
                      <span style={{fontFamily:'var(--pg-font-display)', fontSize:14, fontWeight:800, color:_tx, letterSpacing:'-0.02em'}}>{s.value}</span>
                    </div>
                  ))}
                </div>

                {/* County + actions */}
                <div style={{display:'flex', alignItems:'center', gap:8, flexShrink:0}}>
                  <button onClick={()=>setLocationFilterOpen(true)} style={{display:'flex', alignItems:'center', gap:6,
                    background: userLocation ? 'var(--pg-aqua-100)' : 'rgba(0,178,169,0.10)',
                    border: '1.5px solid var(--pg-aqua-400)',
                    borderRadius:999, padding: userLocation ? '7px 14px' : '7px 12px',
                    boxShadow:'none',
                    cursor:'pointer', fontFamily:'inherit', color:'inherit', touchAction:'manipulation'}}>
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={userLocation?'var(--pg-aqua-600)':'var(--pg-aqua-500)'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" fill={userLocation?'var(--pg-aqua-400)':'none'}/>
                      <circle cx="12" cy="9" r="2.5" fill={userLocation?'white':'none'}/>
                    </svg>
                    {userLocation && (
                      <span style={{fontSize:12, fontWeight:600, color:'var(--pg-aqua-700)', whiteSpace:'nowrap'}}>
                        {locCity ? `${locCity} · ` : ''}{radiusMiles} mi
                      </span>
                    )}
                  </button>
                  <div style={{position:'relative'}}>
                    <button onClick={()=>openChat&&openChat()} style={{
                      width:38, height:38, borderRadius:11,
                      background:_ib, border:_ibr,
                      cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s',
                    }}>
                      {Icon.msg(18,_tx)}
                    </button>
                    {hasUnreadChat && <span style={{position:'absolute', top:7, right:7, width:7, height:7,
                      borderRadius:'50%', background:'#FF3B30', border:`2px solid ${darkMode?'#011B5A':'#c5e4f5'}`}}/>}
                  </div>
                  <div style={{position:'relative'}}>
                    <button onClick={()=>openNotifications&&openNotifications()} style={{
                      width:38, height:38, borderRadius:11,
                      background:_ib, border:_ibr,
                      cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s',
                    }}>
                      {Icon.bell(18,_tx)}
                    </button>
                    {hasUnreadNotif && <span style={{position:'absolute', top:7, right:7, width:7, height:7,
                      borderRadius:'50%', background:'#FF3B30', border:`2px solid ${darkMode?'#011B5A':'#c5e4f5'}`}}/>}
                  </div>
                  <button onClick={()=>{ setPostOpen(true); setPostMode(null); }} style={{
                    height:38, padding:'0 16px', borderRadius:11,
                    background: darkMode ? 'rgba(255,255,255,0.95)' : '#0077B6',
                    border:'none', cursor:'pointer',
                    fontFamily:'var(--pg-font-display)', fontSize:13, fontWeight:700,
                    color: darkMode ? '#023E8A' : '#fff',
                    display:'flex', alignItems:'center', gap:7,
                    boxShadow:'0 3px 12px rgba(0,0,0,0.18)', transition:'all .15s',
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    {lang==='pt'?'Publicar':lang==='es'?'Publicar':'Post'}
                  </button>
                </div>
              </div>

              {/* ── Tabs absolutos na base do hero ── */}
              {(()=>{
                const _tabBg   = darkMode ? 'rgba(4,13,24,0.82)'  : 'rgba(255,255,255,0.92)';
                const _tabBdr  = darkMode ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(10,40,64,0.10)';
                const _activeBg= darkMode ? 'linear-gradient(135deg,#0077B6,#023E8A)' : 'linear-gradient(135deg,#0077B6,#005A8E)';
                const _inactTx = darkMode ? 'rgba(255,255,255,0.50)' : 'rgba(10,40,64,0.48)';
                return (
                  <div style={{position:'absolute', bottom:-26, left:0, right:0, display:'flex', justifyContent:'center', zIndex:20}}>
                    <div style={{
                      display:'inline-flex', alignItems:'center', gap:3,
                      background:_tabBg, backdropFilter:'blur(20px)',
                      border:_tabBdr, borderRadius:20, padding:5,
                      boxShadow: darkMode
                        ? '0 8px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.30)'
                        : '0 8px 32px rgba(0,80,160,0.14), 0 2px 8px rgba(0,0,0,0.08)',
                    }}>
                      {[
                        { id:'buy',    icon: Icon.cart, label: lang==='pt'?'Comprar':lang==='es'?'Comprar':'Buy' },
                        { id:'rent',   icon: Icon.key,  label: lang==='pt'?'Alugar':lang==='es'?'Alquilar':'Rent' },
                        { id:'routes', icon: Icon.pin,  label: lang==='pt'?'Rotas':lang==='es'?'Rutas':'Routes' },
                        { id:'pools',  icon: Icon.pool, label: lang==='pt'?'Piscinas':lang==='es'?'Piscinas':'Pools' },
                      ].map(tb => {
                        const on = tb.id==='pools' ? (view==='routes' && routeSub==='pools') : tb.id==='routes' ? (view==='routes' && routeSub==='routes') : view === tb.id;
                        return (
                          <button key={tb.id}
                            onClick={()=>{
                              setView(tb.id==='pools' ? 'routes' : tb.id); setRouteSub(tb.id==='pools' ? 'pools' : 'routes');
                              setCat('All'); setPriceRange('all'); setRouteRegion('all'); setRoutePrice('all'); setPoolPrice('all'); setQ('');
                            }}
                            style={{
                              display:'flex', alignItems:'center', gap:8,
                              padding:'10px 22px', borderRadius:15, border:'none', cursor:'pointer',
                              fontFamily:'inherit', fontSize:14.5, fontWeight: on?700:500,
                              background: on ? _activeBg : 'transparent',
                              color: on ? '#fff' : _inactTx,
                              boxShadow: on ? '0 3px 14px rgba(0,119,182,0.40)' : 'none',
                              transition:'all .20s ease',
                              letterSpacing:'-0.01em', whiteSpace:'nowrap',
                            }}>
                            {tb.icon(16, on ? '#fff' : _inactTx)}
                            {tb.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          );
        })()}

        {/* Pending ratings pill (floating, top-right) */}
        {pendingRatings.length > 0 && (
          <div style={{display:'flex', justifyContent:'flex-end', padding:'10px 32px 0'}}>
            <div onClick={()=>openBuyerRatingPrompt&&openBuyerRatingPrompt()} style={{
              display:'inline-flex', alignItems:'center', gap:8, cursor:'pointer',
              background:'linear-gradient(135deg,#FFFBEB,#FEF3C7)',
              border:'1.5px solid #FDE68A', borderRadius:999, padding:'8px 16px',
            }}>
              <span style={{fontSize:16}}>⭐</span>
              <div style={{fontSize:12, fontWeight:700, color:'#92400E', lineHeight:1}}>
                {pendingRatings.length} {lang==='pt'?'avaliação pendente':'pending rating'}{pendingRatings.length>1?'s':''}
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        )}

        {/* ── CONTENT AREA ──────────────────────────────────────── */}
        <div style={{display:'flex', gap:0, maxWidth:'100%', minHeight:'calc(100vh - 280px)', paddingTop:36}}>

          {/* ── LEFT SIDEBAR ─────────────────────────────────────── */}
          {isEquipment && (
            <div style={{
              width:220, flexShrink:0,
              background:'var(--pg-white)', borderRight:'1px solid var(--pg-ink-200)',
              padding:'16px 20px', position:'sticky', top:0, height:'100vh', marginTop:-32,
              overflowY:'auto',
            }}>
              {/* Categories */}
              <div style={{marginBottom:28}}>
                <div style={{fontSize:10.5, fontWeight:800, color:'var(--pg-ink-400)',
                  letterSpacing:'0.10em', textTransform:'uppercase', marginBottom:12}}>
                  {lang==='pt'?'CATEGORIAS':lang==='es'?'CATEGORÍAS':'CATEGORIES'}
                </div>
                <div style={{display:'flex', flexDirection:'column', gap:2}}>
                  {cats.map(c => {
                    const on = cat===c;
                    return (
                      <button key={c} onClick={()=>setCat(c)} style={{
                        display:'flex', alignItems:'center', gap:10,
                        padding:'9px 12px', borderRadius:10, border:'none', cursor:'pointer',
                        background: on ? 'var(--pg-blue-50)' : 'transparent',
                        fontFamily:'inherit', textAlign:'left', transition:'all .12s',
                      }}>
                        <div style={{
                          width:8, height:8, borderRadius:'50%', flexShrink:0,
                          background: on ? 'var(--pg-blue-500)' : 'var(--pg-ink-300)',
                          transition:'all .12s',
                        }}/>
                        <span style={{fontSize:13, fontWeight: on?700:500,
                          color: on?'var(--pg-blue-700)':'var(--pg-ink-600)'}}>
                          {tr(catLabels[c], lang)}
                        </span>
                        {on && <div style={{marginLeft:'auto', width:6, height:6, borderRadius:'50%', background:'var(--pg-blue-400)'}}/>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Divider */}
              <div style={{height:1, background:'var(--pg-ink-100)', margin:'0 -20px 24px'}}/>

              {/* Price filter */}
              <div>
                <div style={{fontSize:10.5, fontWeight:800, color:'var(--pg-ink-400)',
                  letterSpacing:'0.10em', textTransform:'uppercase', marginBottom:12}}>
                  {lang==='pt'?'PREÇO':lang==='es'?'PRECIO':'PRICE RANGE'}
                </div>
                <div style={{display:'flex', flexDirection:'column', gap:2}}>
                  {[
                    {id:'all',     label: lang==='pt'?'Qualquer preço':'Any price'},
                    {id:'u100',    label: '< $100'},
                    {id:'100-500', label: '$100 – $500'},
                    {id:'o500',    label: '$500+'},
                  ].map(opt => {
                    const on = priceRange===opt.id;
                    return (
                      <button key={opt.id} onClick={()=>setPriceRange(opt.id)} style={{
                        display:'flex', alignItems:'center', gap:10,
                        padding:'9px 12px', borderRadius:10, border:'none', cursor:'pointer',
                        background: on ? 'var(--pg-blue-50)' : 'transparent',
                        fontFamily:'inherit', textAlign:'left', transition:'all .12s',
                      }}>
                        <div style={{
                          width:8, height:8, borderRadius:'50%', flexShrink:0,
                          background: on ? 'var(--pg-blue-500)' : 'var(--pg-ink-300)',
                        }}/>
                        <span style={{fontSize:13, fontWeight: on?700:500,
                          color: on?'var(--pg-blue-700)':'var(--pg-ink-600)'}}>
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* ── MAIN GRID AREA ─────────────────────────────────── */}
          <div style={{flex:1, padding:'28px 32px 60px', minWidth:0}}>

            {/* Results count + sort */}
            {isEquipment && (
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20}}>
                <div style={{fontSize:14, color:'var(--pg-ink-600)'}}>
                  <span style={{fontWeight:700, color:'var(--pg-ink-900)'}}>{liveEquipment.length + list.length}</span>
                  {' '}{lang==='pt'?'anúncios':lang==='es'?'anuncios':'listings'}
                  {cat !== 'All' && <span style={{color:'var(--pg-blue-600)'}}> · {tr(catLabels[cat],lang)}</span>}
                </div>
                <div style={{fontSize:12, color:'var(--pg-ink-400)'}}>
                  {lang==='pt'?'Mais recentes primeiro':'Newest first'}
                </div>
              </div>
            )}

            {/* Live listings grid */}
            {isEquipment && (
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px,1fr))', gap:16, marginBottom:24}}>
                {liveEquipment.map(item => renderLiveCard(item, true))}
                {liveEquipment.length === 0 && (view === 'rent' || list.length === 0) && (
                  <div style={{gridColumn:'1/-1', textAlign:'center', padding:'64px 20px',
                    background:'var(--pg-white)', borderRadius:16, border:'1px solid var(--pg-ink-200)'}}>
                    <div style={{fontSize:40, marginBottom:12}}>{view==='rent'?'🔑':'🔍'}</div>
                    <div style={{fontSize:15, fontWeight:700, color:'var(--pg-ink-700)', marginBottom:6}}>
                      {view==='rent'
                        ? (lang==='pt'?'Nenhum item para alugar ainda':'No rental listings yet')
                        : (lang==='pt'?'Nenhum item encontrado':'No items found')}
                    </div>
                    <div style={{fontSize:13, color:'var(--pg-ink-400)', marginBottom: view==='rent'?16:0}}>
                      {view==='rent'
                        ? (lang==='pt'?'Seja o primeiro a publicar um item para aluguel!':'Be the first to post a rental listing!')
                        : (lang==='pt'?'Tente outros filtros ou categorias':'Try different filters or categories')}
                    </div>
                    {view==='rent' && (
                      <button onClick={()=>{ setPostOpen(true); setPostMode('rent'); }} style={{
                        height:44, padding:'0 24px', borderRadius:12, border:'none', cursor:'pointer',
                        background:'linear-gradient(135deg,#0EBAC7,#0891A8)', color:'#fff',
                        fontFamily:'inherit', fontSize:14, fontWeight:700,
                        boxShadow:'0 4px 16px rgba(14,186,199,0.35)',
                      }}>
                        + {lang==='pt'?'Publicar para aluguel':'Post a rental'}
                      </button>
                    )}
                  </div>
                )}
                {/* Static equipment items — shown only on Buy tab, not Rent */}
                {view !== 'rent' && list.map(e => (
                  <button key={e.id} onClick={()=>openListing(normStatic(e))}
                    className="pg-press"
                    style={{border:'none', textAlign:'left', cursor:'pointer', overflow:'hidden', padding:0,
                      borderRadius:16,
                      background: darkMode ? '#1C2128' : 'var(--pg-white)',
                      boxShadow: darkMode ? '0 2px 16px rgba(0,0,0,0.45)' : '0 2px 12px rgba(0,0,0,0.07)',
                      display:'flex', flexDirection:'column',
                      transition:'box-shadow .18s',
                    }}>
                    <div style={{position:'relative', paddingTop:'62%', background:'var(--pg-ink-200)', overflow:'hidden', flexShrink:0}}>
                      <div style={{position:'absolute', inset:0}}><EquipImg category={e.category} height={'100%'}/></div>
                      <div style={{position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(0,0,0,0.22) 0%, transparent 40%)', pointerEvents:'none'}}/>
                      <span style={{position:'absolute', top:10, left:10, fontSize:9, fontWeight:700, padding:'3px 9px', borderRadius:6,
                        background:'rgba(0,0,0,0.50)', color:'#fff', letterSpacing:'0.07em', textTransform:'uppercase', backdropFilter:'blur(4px)'}}>
                        {tr({Pumps:'Pumps',Filters:'Filters',Vacuum:'Vacuum',Heaters:'Heaters',Tools:'Tools'}[e.category]||e.category,lang)}
                      </span>
                      <span style={{position:'absolute', top:10, right:10, fontSize:9.5, fontWeight:700, padding:'3px 9px', borderRadius:6,
                        background:'rgba(255,255,255,0.92)', color:'var(--pg-blue-700)', backdropFilter:'blur(4px)'}}>
                        {tr(e.condition,lang)}
                      </span>
                    </div>
                    <div style={{padding:'14px 16px 16px', flex:1, display:'flex', flexDirection:'column'}}>
                      <div style={{fontSize:15, fontWeight:700, letterSpacing:'-0.01em', lineHeight:1.3, color:'var(--pg-ink-900)',
                        display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'}}>{e.name}</div>
                      <div style={{fontSize:11.5, color:'var(--pg-ink-500)', marginTop:5, lineHeight:1.4, flex:1,
                        display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'}}>{descFor(e,lang)}</div>
                      <div style={{height:1, background:'var(--pg-ink-100)', margin:'10px 0'}}/>
                      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                        <span style={{fontFamily:'var(--pg-font-display)', fontSize:24, fontWeight:800,
                          color:'var(--pg-blue-500)', letterSpacing:'-0.02em', lineHeight:1}}>
                          ${fmtN(e.price, lang)}{e.unit&&<span style={{fontSize:11, fontWeight:500, color:'var(--pg-ink-400)', marginLeft:2}}>{tr(e.unit,lang)}</span>}
                        </span>
                        <span style={{fontSize:11, color:'var(--pg-ink-400)'}}>{sellerFor(e)}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Routes view for desktop */}
            {view === 'routes' && (
              <div style={{paddingTop:8}}>
                {/* Free-tier gate: can publish routes but can't see others' */}
                {user.tier === 'free' && (
                  <div style={{
                    borderRadius:20, padding:'32px 24px', textAlign:'center',
                    background:'linear-gradient(135deg,#0c4a6e 0%,#0077B6 100%)',
                    color:'#fff', marginBottom:20,
                  }}>
                    <div style={{width:52, height:52, borderRadius:15, background:'rgba(255,255,255,0.12)',
                      display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px'}}>
                      {Icon.lock(22,'#fff')}
                    </div>
                    <div style={{fontSize:17, fontWeight:800, letterSpacing:'-0.02em', marginBottom:8}}>
                      {lang==='pt'?'Rotas disponíveis com PRO':lang==='es'?'Rutas disponibles con PRO':'Routes available with PRO'}
                    </div>
                    <div style={{fontSize:13, opacity:.8, lineHeight:1.5, maxWidth:280, margin:'0 auto 18px'}}>
                      {lang==='pt'?'Faça upgrade para Pool Guy PRO e veja todas as rotas e piscinas disponíveis na sua região.'
                      :lang==='es'?'Actualiza a Pool Guy PRO para ver todas las rutas y piscinas disponibles en tu área.'
                      :'Upgrade to Pool Guy PRO to see all available routes and pools in your area.'}
                    </div>
                    <button onClick={()=>ctx.openPaywall&&ctx.openPaywall('routes')} style={{
                      height:44, padding:'0 28px', borderRadius:12, border:'none', cursor:'pointer',
                      background:'#fff', color:'#0077B6', fontWeight:800, fontSize:14, fontFamily:'inherit',
                    }}>
                      {lang==='pt'?'Ver planos — a partir de $14.99/mês':lang==='es'?'Ver planes — desde $14.99/mes':'See plans — from $14.99/mo'}
                    </button>
                  </div>
                )}
                {/* Route cards in 2-column grid on desktop */}
                {user.tier === 'free' ? null :
                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(360px,1fr))', gap:16}}>
                  {list.map(r => (
                    <div key={r.id||r._liveId} onClick={()=>{ if(r._live){ const m=liveMarket.find(x=>x._id===r._liveId); if(m){ if(isMyPost(m)){ setMyPostDetail(m); return; } if(m.status==='sold'){return;} openListing(m); } } else { setSelected({...r, _type:'route'}); window.history.pushState({pgRoute:r.id},'','?listing=route-'+r.id); } }}
                      style={{
                        background:'var(--pg-white)', borderRadius:16, overflow:'hidden',
                        border:'1px solid var(--pg-ink-200)', boxShadow:'0 2px 12px rgba(0,0,0,0.06)',
                        cursor:'pointer', transition:'box-shadow .15s',
                      }}
                      onMouseEnter={e=>e.currentTarget.style.boxShadow='0 4px 20px rgba(0,119,182,0.18)'}
                      onMouseLeave={e=>e.currentTarget.style.boxShadow='0 2px 12px rgba(0,0,0,0.06)'}>
                      <div style={{display:'flex', alignItems:'stretch'}}>
                        <div style={{width:100, flexShrink:0, background:'linear-gradient(135deg,var(--pg-blue-100) 0%,var(--pg-blue-50) 100%)',
                          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4, padding:'16px 8px'}}>
                          {(r.photoUrls&&r.photoUrls[0])||r.photoUrl
                            ? <img src={(r.photoUrls&&r.photoUrls[0])||r.photoUrl} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                            : <>
                                {Icon.pin(22,'var(--pg-blue-600)')}
                                <div style={{fontFamily:'var(--pg-font-display)',fontSize:24,fontWeight:800,color:'var(--pg-blue-600)',lineHeight:1}}>{r.clients||r.pools||'?'}</div>
                                <div style={{fontSize:9,fontWeight:700,color:'var(--pg-blue-700)',letterSpacing:'0.06em',textTransform:'uppercase',opacity:0.75}}>POOLS</div>
                              </>
                          }
                        </div>
                        <div style={{flex:1, padding:'16px 18px'}}>
                          <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:6}}>
                            <span style={{fontSize:9.5, fontWeight:700, padding:'3px 8px', borderRadius:5,
                              background:'var(--pg-blue-50)', color:'var(--pg-blue-700)', letterSpacing:'0.05em'}}>
                              {r.area||'South FL'}
                            </span>
                          </div>
                          <div style={{fontSize:15, fontWeight:700, color:'var(--pg-ink-900)', lineHeight:1.3, marginBottom:6}}>
                            {tr(r.name,lang)||r.name}
                          </div>
                          <div style={{fontSize:12, color:'var(--pg-ink-500)', lineHeight:1.4, marginBottom:10,
                            display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'}}>
                            {tr(r.desc,lang)||r.desc}
                          </div>
                          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                            <div>
                              <div style={{fontSize:10, color:'var(--pg-ink-400)', marginBottom:2}}>{t.asking}</div>
                              <div style={{fontFamily:'var(--pg-font-display)', fontSize:22, fontWeight:800,
                                color:'var(--pg-blue-500)', letterSpacing:'-0.02em', lineHeight:1}}>
                                ${fmtN(r.est||r.asking||0, lang)}
                              </div>
                            </div>
                            {!isMyPost(liveMarket.find(x=>x._id===r._liveId)||{}) && (
                              <button onClick={(e)=>{ e.stopPropagation();
                                if(r._live&&r._authorId){
                                  openChat({id:r._authorId,name:r._author||'Seller',listingId:r._liveId||null,listingContext:{name:tr(r.name,lang),photoUrl:(r.photoUrls&&r.photoUrls[0])||r.photoUrl||null,price:r.est,priceMode:'fixed',type:'route'}});
                                } else { openChat&&openChat(); }
                              }} style={{
                                padding:'9px 16px', borderRadius:10, border:'none', cursor:'pointer',
                                background:'var(--pg-blue-500)', color:'#fff',
                                fontFamily:'inherit', fontSize:13, fontWeight:700,
                                boxShadow:'0 3px 10px rgba(0,119,182,0.30)',
                              }}>{t.contact}</button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── OVERLAY SHEETS (same as mobile) ───────────────────── */}
      {viewListing && (
        <div style={{position:'fixed', inset:0, zIndex:200, overflowY:'auto', background:'var(--pg-bg)', animation:'pg-fade-in 0.18s ease'}}>
          <ViewListingSheet
            item={viewListing} lang={lang}
            openChat={openChat} openPublicProfile={openPublicProfile}
            onClose={closeListing}
            isAdmin={user.role==='admin'}
            canDelete={user.role==='admin'||!!(user.uid&&viewListing.author_id&&user.uid===viewListing.author_id)}
            onEdit={isMyPost(viewListing)?()=>setMyPostDetail(viewListing):undefined}
            currentUser={user} showToast={showToast}
            isSaved={savedIds.has(viewListing._id)}
            onToggleSave={()=>toggleSave(null,viewListing._id)}
            onShare={()=>handleShare(null,viewListing)}
            liveMarket={liveMarket} onOpenListing={openListing}
            onAfterSold={(sellerRating)=>{
              // Update liveMarket immediately (realtime subscription is stubbed)
              if(ctx&&ctx.updateMarketItem&&viewListing) ctx.updateMarketItem(viewListing._id, {status:'sold'});
              setViewListing(prev=>prev?{...prev,status:'sold'}:null);
              setTimeout(()=>{
                setViewListing(null);
                if(sellerRating&&openRating) openRating(sellerRating);
                else if(loadPendingRatings) loadPendingRatings();
              }, 280);
            }}
            onDeleted={(id)=>{ closeListing(); setSavedIds(prev=>{const s=new Set(prev);s.delete(id);return s;}); if(ctx&&ctx.removeMarketItem)ctx.removeMarketItem(id); }}
          />
        </div>
      )}
      {shareItem && <ShareSheet item={shareItem} lang={lang} onClose={()=>setShareItem(null)} showToast={showToast}/>}
      <FullPage open={!!myPostDetail} onClose={()=>setMyPostDetail(null)}>
        {myPostDetail && <MyPostDetailSheet item={myPostDetail} lang={lang} onClose={()=>setMyPostDetail(null)} showToast={showToast}
          currentUser={user} openRating={openRating}
          onUpdated={()=>{ setMyPostDetail(null); if(ctx.liveMarket)ctx.liveMarket.splice(0); }}
          onDeleted={(id)=>{ setMyPostDetail(null); if(ctx&&ctx.removeMarketItem)ctx.removeMarketItem(id); }}/>}
      </FullPage>
      {selected && (
        <div style={{position:'fixed', inset:0, zIndex:200, background:'var(--pg-bg)', animation:'pg-fade-in 0.18s ease'}}>
          <ListingDetail selected={selected} lang={lang} t={t} catLabels={catLabels} openChat={openChat}
            onClose={()=>{ setSelected(null); if(window.location.search.includes('listing=route-')||window.location.search.includes('listing=pool-')) window.history.back(); }}
            openPublicProfile={openPublicProfile}/>
        </div>
      )}
      <Sheet open={postOpen&&!postMode} onClose={()=>setPostOpen(false)} height="auto">
        <MarketplaceListingPicker lang={lang} t={t} currentView={view} onPick={(m)=>setPostMode(m)} onClose={()=>setPostOpen(false)}/>
      </Sheet>
      <FullPage open={postOpen&&(postMode==='sell'||postMode==='rent')} onClose={()=>{setPostMode(null);setPostOpen(false);}}>
        <PostEquipmentSheet lang={lang} t={t} mode={postMode} onClose={()=>{setPostMode(null);setPostOpen(false);}}
          onSubmit={async(data)=>{ const mode=postMode; setPostMode(null);setPostOpen(false); if(data&&dbWrite){const ok=await dbWrite('marketplace',data);if(ok!==false){setView(mode==='rent'?'rent':'buy');if(showToast)showToast(lang==='pt'?'✓ Anúncio enviado para revisão':'✓ Listing sent for review');}}}}/>
      </FullPage>
      <ExpiringListingPrompt item={expiringItem} lang={lang} onClose={()=>setExpiringItem(null)}
        onRenew={renewListing} onNotAvailable={()=>{ setNotAvailableItem(expiringItem); setExpiringItem(null); }}/>
      <Sheet open={!!notAvailableItem} onClose={()=>setNotAvailableItem(null)} height="auto">
        {notAvailableItem && (
          <MarkSoldSheet item={notAvailableItem} lang={lang} currentUser={user} showToast={showToast}
            onClose={()=>setNotAvailableItem(null)}
            onSold={(sellerRating)=>{ const id=notAvailableItem._id; setNotAvailableItem(null); if(ctx&&ctx.updateMarketItem) ctx.updateMarketItem(id,{status:'sold'}); openRating && sellerRating && openRating(sellerRating); }}
            onSkip={async()=>{
              const id = notAvailableItem._id;
              if (window.sb) await window.sb.from('marketplace').update({ status:'expired' }).eq('id', id);
              setNotAvailableItem(null);
              if (ctx && ctx.updateMarketItem) ctx.updateMarketItem(id, { status:'expired' });
              showToast && showToast(lang==='pt'?'Anúncio removido':lang==='es'?'Anuncio eliminado':'Listing removed');
            }}/>
        )}
      </Sheet>
      <FullPage open={postOpen&&postMode==='route'} onClose={()=>{setPostMode(null);setPostOpen(false);}}>
        <PostRouteSheet lang={lang} t={t} onClose={()=>{setPostMode(null);setPostOpen(false);}}
          onSubmit={async(data)=>{ setPostMode(null);setPostOpen(false); if(data&&dbWrite){const ok=await dbWrite('marketplace',data);if(ok!==false){setView('routes');setRouteSub('routes');if(showToast)showToast(lang==='pt'?'✓ Rota enviada para revisão':'✓ Route sent for review');}}}}/>
      </FullPage>
      <FullPage open={postOpen&&postMode==='pool'} onClose={()=>{setPostMode(null);setPostOpen(false);}}>
        <PostPoolSheet lang={lang} t={t} onClose={()=>{setPostMode(null);setPostOpen(false);}}
          onSubmit={async(data)=>{ setPostMode(null);setPostOpen(false); if(data&&dbWrite){const ok=await dbWrite('marketplace',data);if(ok!==false){setView('routes');setRouteSub('pools');if(showToast)showToast(lang==='pt'?'✓ Piscina enviada para revisão':'✓ Pool sent for review');}}}}/>
      </FullPage>

      <LocationFilterSheet open={locationFilterOpen} onClose={()=>setLocationFilterOpen(false)}
        userLocation={userLocation} setUserLocation={setUserLocation}
        radiusMiles={radiusMiles} setRadiusMiles={setRadiusMiles} lang={lang}/>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // ── MOBILE LAYOUT (< 900px) — original ───────────────────────
  // ══════════════════════════════════════════════════════════════
  return (
    <div style={{position:'relative', width:'100%', height:'100%', overflow:'hidden'}}>
    <div className="pg-screen" style={{paddingBottom:110, height:'100%', overflowY:'auto'}}>
      {/* ── Enhanced NavyBar ── */}
      {(() => {
        const H = headerTheme(darkMode);
        const ic = H.text;
        return (
          <NavyBar
            darkMode={darkMode}
            wave={false}
            compact={true}
            bgOverride={darkMode
              ? 'linear-gradient(135deg, #011B5A 0%, #0A2E6A 30%, #0077B6 70%, #023E8A 100%)'
              : 'linear-gradient(135deg, #e8f5ff 0%, #cfe9f8 40%, #b8dff5 100%)'}
            title={
              <div style={{display:'flex', alignItems:'center', gap:10}}>
                <div style={{
                  width:44, height:44, borderRadius:13, flexShrink:0,
                  background:H.iconBg, border:`0.5px solid ${H.border}`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  {Icon.cart(20,ic)}
                </div>
                <div>
                  <div style={{fontSize:10, fontWeight:600, color:H.sub, letterSpacing:'0.10em', marginBottom:2, textTransform:'uppercase'}}>
                    {lang==='pt'?'COMPRAR · VENDER · ALUGAR':lang==='es'?'COMPRAR · VENDER · ALQUILAR':'BUY · SELL · RENT'}
                  </div>
                  <div style={{fontFamily:'var(--pg-font-display)', fontSize:17, fontWeight:700, letterSpacing:'-0.025em', lineHeight:1.1, color:H.text, whiteSpace:'nowrap'}}>
                    {lang==='pt'?'Equipamentos & Rotas':lang==='es'?'Equipos & Rutas':'Equipment & Routes'}
                  </div>
                </div>
              </div>
            }
            leftBack={!isDesktop} onBack={()=>goTab('home')}
            right={isDesktop ? null : (
              <div style={{display:'flex', gap:6, alignItems:'center'}}>
                <div style={{position:'relative', display:'inline-flex'}}>
                  <IconButton dark={darkMode} onClick={() => openChat && openChat()}>
                    {Icon.msg(20, ic)}
                  </IconButton>
                  {hasUnreadChat && <span style={{position:'absolute', top:5, right:5, width:8, height:8, borderRadius:'50%', background:'#FF3B30', border:`1.5px solid ${darkMode?'#011B5A':'#d0e8f5'}`, pointerEvents:'none'}}/>}
                </div>
                <div style={{position:'relative', display:'inline-flex'}}>
                  <IconButton dark={darkMode} onClick={() => openNotifications && openNotifications()}>
                    {Icon.bell(20, ic)}
                  </IconButton>
                  {hasUnreadNotif && <span style={{position:'absolute', top:5, right:5, width:8, height:8, borderRadius:'50%', background:'#FF3B30', border:`1.5px solid ${darkMode?'#011B5A':'#d0e8f5'}`, pointerEvents:'none'}}/>}
                </div>
              </div>
            )}
          >
            {/* Stats strip below title — icon + count per category, no labels */}
            <div style={{display:'flex', alignItems:'center', gap:12, marginTop:10, paddingTop:10, borderTop:`1px solid ${H.border}`}}>
              {[
                { icon: Icon.cart, value: buyCount },
                { icon: Icon.key,  value: rentCount },
                { icon: Icon.pin,  value: routesCount },
                { icon: Icon.pool, value: poolsCount },
              ].map((s,i) => (
                <div key={i} style={{display:'flex', alignItems:'center', gap:5}}>
                  {s.icon(15, H.iconC)}
                  <span style={{fontSize:14, fontWeight:800, fontFamily:'var(--pg-font-display)', letterSpacing:'-0.02em', color:H.text}}>{s.value}</span>
                </div>
              ))}
              <div style={{width:1, height:30, background:H.divider}}/>
              {/* County selector */}
              <button onClick={()=>setLocationFilterOpen(true)}
                style={{display:'flex', alignItems:'center', gap:6,
                  background: userLocation ? 'var(--pg-aqua-100)' : 'rgba(0,178,169,0.10)',
                  border: '1.5px solid var(--pg-aqua-400)',
                  borderRadius:999, padding: userLocation ? '7px 14px' : '7px 12px',
                  boxShadow:'none',
                  cursor:'pointer', fontFamily:'inherit', color:'inherit', touchAction:'manipulation'}}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={userLocation?'var(--pg-aqua-600)':'var(--pg-aqua-500)'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" fill={userLocation?'var(--pg-aqua-400)':'none'}/>
                  <circle cx="12" cy="9" r="2.5" fill={userLocation?'white':'none'}/>
                </svg>
                {userLocation && (
                  <span style={{fontSize:12, fontWeight:600, color:'var(--pg-aqua-700)', whiteSpace:'nowrap'}}>
                    {locCity ? `${locCity} · ` : ''}{radiusMiles} mi
                  </span>
                )}
              </button>
            </div>
          </NavyBar>
        );
      })()}

      {/* ── Location filter sheet ── */}
      <LocationFilterSheet open={locationFilterOpen} onClose={()=>setLocationFilterOpen(false)}
        userLocation={userLocation} setUserLocation={setUserLocation}
        radiusMiles={radiusMiles} setRadiusMiles={setRadiusMiles} lang={lang}/>

      {/* ── Pending ratings banner ── */}
      {pendingRatings.length > 0 && (
        <div style={{margin:'12px 18px 0', padding:'12px 14px', borderRadius:14,
          background:'linear-gradient(135deg,#FFFBEB,#FEF3C7)', border:'1.5px solid #FDE68A',
          display:'flex', alignItems:'center', gap:12, cursor:'pointer'}}
          onClick={()=>openBuyerRatingPrompt && openBuyerRatingPrompt()}>
          <div style={{fontSize:26, lineHeight:1, flexShrink:0}}>⭐</div>
          <div style={{flex:1}}>
            <div style={{fontSize:13, fontWeight:700, color:'#92400E'}}>
              {lang==='pt'
                ? `Você tem ${pendingRatings.length} avaliação${pendingRatings.length>1?'ções':''} pendente${pendingRatings.length>1?'s':''}!`
                : `You have ${pendingRatings.length} pending rating${pendingRatings.length>1?'s':''}!`}
            </div>
            <div style={{fontSize:12, color:'#B45309', marginTop:2}}>
              {lang==='pt'
                ? `Avalie: "${pendingRatings[0].listing_name || 'anúncio'}"`
                : `Rate: "${pendingRatings[0].listing_name || 'listing'}"`}
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      )}

      <div style={{padding:'0 18px 16px'}}>
        {/* Filter card */}
        <div className="pg-card" style={{padding:'12px', marginTop:-6, display:'flex', flexDirection:'column', gap:12}}>
          {/* 3-option segmented */}
          {/* Mobile tab bar — pill style */}
          <div style={{
            display:'flex', gap:4, padding:4,
            background:'var(--pg-ink-100)', borderRadius:14,
          }}>
            {['buy','rent','routes','pools'].map(v => {
              const on = v==='pools' ? (view==='routes' && routeSub==='pools') : v==='routes' ? (view==='routes' && routeSub==='routes') : view === v;
              return (
                <button key={v}
                  onClick={()=>{
                    setView(v==='pools' ? 'routes' : v); setRouteSub(v==='pools' ? 'pools' : 'routes');
                    setCat('All'); setPriceRange('all'); setRouteRegion('all'); setRoutePrice('all'); setPoolPrice('all');
                  }}
                  style={{
                    flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3,
                    padding:'9px 2px', borderRadius:10, border:'none', cursor:'pointer',
                    fontFamily:'inherit', transition:'all .18s ease',
                    background: on ? 'var(--pg-white)' : 'transparent',
                    color: on ? 'var(--pg-blue-600)' : 'var(--pg-ink-400)',
                    boxShadow: on ? '0 2px 10px rgba(0,0,0,0.10)' : 'none',
                  }}>
                  {tabIcons[v](16, on ? 'var(--pg-blue-500)' : 'var(--pg-ink-400)')}
                  <span style={{fontSize:11.5, fontWeight: on?700:500, letterSpacing:'-0.01em', whiteSpace:'nowrap'}}>{tabLabels[v]}</span>
                </button>
              );
            })}
          </div>

          {isEquipment && (
            <>
              <div className="pg-search">
                {Icon.search(18)}
                <input placeholder={t.search} value={q} onChange={e=>setQ(e.target.value)}/>
              </div>

              {/* Category chips + Price chip */}
              <div className="pg-scroll-x" style={{display:'flex', gap:8, marginLeft:-12, marginRight:-12, padding:'2px 12px'}}>
                {cats.filter(c => c !== 'Others').map(c => {
                  const on = cat===c;
                  return (
                    <button key={c} className={`pg-chip ${on?'pg-chip-on':''}`} onClick={()=>setCat(c)} style={{padding:'7px 12px', whiteSpace:'nowrap'}}>
                      {tr(catLabels[c], lang)}
                    </button>
                  );
                })}
                {/* Price chip — before Outros */}
                <button
                  className={`pg-chip ${priceRange!=='all'?'pg-chip-on':''}`}
                  onClick={()=>setPriceOpen(o=>!o)}
                  style={{padding:'7px 12px', whiteSpace:'nowrap', display:'inline-flex', alignItems:'center', gap:4, flexShrink:0}}>
                  {priceRange==='all'
                    ? (lang==='pt'?'Preço':lang==='es'?'Precio':'Price')
                    : priceRange==='u100' ? '< $100'
                    : priceRange==='100-500' ? '$100–$500'
                    : '$500+'}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points={priceOpen ? '18 15 12 9 6 15' : '6 9 12 15 18 9'}/>
                  </svg>
                </button>
                {/* Outros — last chip */}
                {(() => { const on = cat==='Others'; return (
                  <button className={`pg-chip ${on?'pg-chip-on':''}`} onClick={()=>setCat('Others')} style={{padding:'7px 12px', whiteSpace:'nowrap'}}>
                    {tr(catLabels['Others'], lang)}
                  </button>
                ); })()}
              </div>

              {/* Price dropdown — appears below chip row */}
              {priceOpen && (
                <div style={{display:'flex', gap:7, flexWrap:'wrap', padding:'4px 2px 2px'}}>
                  {[
                    {id:'all',     label: lang==='pt'?'Qualquer preço':lang==='es'?'Cualquier precio':'Any price'},
                    {id:'u100',    label: '< $100'},
                    {id:'100-500', label: '$100 – $500'},
                    {id:'o500',    label: '$500+'},
                  ].map(opt => {
                    const on = priceRange === opt.id;
                    return (
                      <button key={opt.id} onClick={()=>{ setPriceRange(opt.id); setPriceOpen(false); }} style={{
                        padding:'6px 13px', borderRadius:8, border:'none', cursor:'pointer',
                        fontFamily:'inherit', fontSize:12, fontWeight:600, transition:'all .12s',
                        background: on ? 'var(--pg-blue-500)' : 'var(--pg-ink-100)',
                        color:      on ? '#fff' : 'var(--pg-ink-700)',
                        boxShadow:  on ? '0 2px 6px oklch(0.58 0.16 235 / 0.25)' : 'none',
                      }}>{opt.label}</button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Equipment grid */}
        {isEquipment && (
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(155px, 1fr))', gap:12, marginTop:14}}>
            {/* Live user-posted equipment items */}
            {marketByCounty
              .filter(m => m.type === mode &&
                (cat === 'All' || !m.cat || m.cat === cat) &&
                (m.status === 'approved' || (m.status === 'pending' && isMyPost(m)))
              )
              .sort((a, b) => {
                const aOwn = user?.uid && a.author_id === user.uid ? 0 : 1;
                const bOwn = user?.uid && b.author_id === user.uid ? 0 : 1;
                return aOwn - bOwn;
              })
              .map(item => {
                const isPending = item.status === 'pending';
                const isSoldItem = item.status === 'sold';
                const isActiveRental = item.type === 'rent' && activeRentalIds.has(item._id);
                const canAdminDelete = user.role === 'admin' || isMyPost(item);
                const handleQuickDelete = async (e) => {
                  e.stopPropagation();
                  const msg = lang==='pt'
                    ? `Excluir "${item.name}"? Não pode ser desfeito.`
                    : `Delete "${item.name}"? This cannot be undone.`;
                  if (!window.confirm(msg)) return;
                  const { error } = await window.sb.from('marketplace').delete().eq('id', item._id);
                  if (error) { showToast && showToast('❌ ' + error.message); return; }
                  showToast && showToast('🗑️ ' + (lang==='pt'?'Anúncio excluído':'Listing deleted'));
                  if (ctx && ctx.removeMarketItem) ctx.removeMarketItem(item._id);
                };
                return (
                  <button key={item._id}
                    onClick={()=> openMyOrOthersListing(item)}
                    className={isSoldItem ? '' : 'pg-press'}
                    style={{
                      padding:0, overflow:'hidden', position:'relative',
                      cursor: isSoldItem ? (isMyPost(item) ? 'pointer' : 'default') : 'pointer',
                      border: isPending ? '1.5px solid var(--pg-ink-200)' : isSoldItem ? '1.5px solid var(--pg-ink-200)' : '1.5px solid var(--pg-blue-100)',
                      display:'flex', flexDirection:'column',
                      borderRadius:14,
                      background: isSoldItem ? 'var(--pg-ink-50)' : 'var(--pg-white)',
                      textAlign:'left', fontFamily:'inherit',
                      boxShadow:'0 1px 3px rgba(0,0,0,0.08)',
                    }}>
                    <div style={{opacity: isPending ? 0.82 : isSoldItem ? 0.65 : 1, filter: isSoldItem ? 'grayscale(0.6)' : 'none', display:'flex', flexDirection:'column', flex:1}}>
                    {/* Photo area — enforced 4:3 ratio */}
                    <div style={{position:'relative', paddingTop:'72%', background:'var(--pg-ink-200)', overflow:'hidden', flexShrink:0}}>
                      <div style={{position:'absolute', inset:0}}>
                        {item.photoUrl
                          ? <img src={item.photoUrl} alt={item.name} style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                          : <NoPhotoPlaceholder height={'100%'}/>
                        }
                      </div>
                      {/* Gradient overlay for badges */}
                      <div style={{position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(0,0,0,0.28) 0%, transparent 45%, transparent 60%, rgba(0,0,0,0.10) 100%)', pointerEvents:'none'}}/>
                      {/* Status badge top-left — only for own posts */}
                      {/* SOLD badge — top-left (takes priority over MY LISTING) */}
                      {isSoldItem ? (
                        <span style={{
                          position:'absolute', top:10, left:10,
                          fontSize:9.5, fontWeight:800, padding:'3px 10px', borderRadius:6,
                          letterSpacing:'0.10em',
                          background:'rgba(30,30,30,0.88)', color:'#fff',
                          backdropFilter:'blur(4px)',
                        }}>
                          {lang==='pt'?'VENDIDO':lang==='es'?'VENDIDO':'SOLD'}
                        </span>
                      ) : isActiveRental ? (
                        <span style={{
                          position:'absolute', top:10, left:10,
                          fontSize:9.5, fontWeight:800, padding:'3px 10px', borderRadius:6,
                          letterSpacing:'0.08em',
                          background:'rgba(217,119,6,0.92)', color:'#fff',
                          backdropFilter:'blur(4px)',
                        }}>
                          ⏳ {lang==='pt'?'EM ANDAMENTO':lang==='es'?'EN CURSO':'IN PROGRESS'}
                        </span>
                      ) : isMyPost(item) && (
                        <span style={{
                          position:'absolute', top:10, left:10,
                          fontSize:9.5, fontWeight:700, padding:'3px 8px', borderRadius:6,
                          letterSpacing:'0.05em',
                          background: isPending ? 'rgba(255,243,205,0.95)' : 'rgba(14,186,199,0.92)',
                          color: isPending ? '#856404' : '#fff',
                          backdropFilter:'blur(4px)',
                        }}>
                          {isPending ? `⏳ ${lang==='pt'?'REVISÃO':lang==='es'?'REVISIÓN':'REVIEW'}` : `✦ ${lang==='pt'?'MEU ANÚNCIO':lang==='es'?'MI ANUNCIO':'MY LISTING'}`}
                        </span>
                      )}
                      {/* Category badge top-right */}
                      <span style={{
                        position:'absolute', top:10, right:10,
                        fontSize:9, fontWeight:700, padding:'3px 8px', borderRadius:6,
                        background:'rgba(0,0,0,0.52)', color:'#fff',
                        letterSpacing:'0.06em', backdropFilter:'blur(4px)',
                        textTransform:'uppercase',
                      }}>{item.cat || 'Tools'}</span>
                    </div>
                    {/* Content — same structure as static cards */}
                    <div style={{padding:'12px 13px 14px', display:'flex', flexDirection:'column'}}>
                      {/* Title */}
                      <div style={{fontSize:14, fontWeight:700, letterSpacing:'-0.01em', lineHeight:1.3, color:'var(--pg-ink-900)',
                        minHeight:14*1.3*2,
                        display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'}}>
                        <Tx lang={lang}>{item.name}</Tx>
                      </div>
                      {/* Description — show text if available, else condition · location */}
                      <div style={{fontSize:11.5, color:'var(--pg-ink-500)', marginTop:5, lineHeight:1.4, minHeight:11.5*1.4*2,
                        display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'}}>
                        {item.description
                          ? item.description
                          : ([item.condition, item.loc].filter(Boolean).join(' · ') || '—')}
                      </div>
                      {/* Seller — photo + name + rating, above the price */}
                      {item.author_id && (
                        <div style={{display:'flex', alignItems:'center', gap:5, marginTop:6}}>
                          <AvatarFetch uid={item.author_id} name={fmtAuthor(item.author)} size={18}/>
                          <span style={{fontSize:11.5, fontWeight:600, color:'var(--pg-ink-600)',
                            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:90}}>
                            {fmtAuthor(item.author)}
                          </span>
                          {authorRatings[item.author_id] ? (
                            <>
                              <Stars rating={authorRatings[item.author_id].avg} size={10}/>
                              <span style={{fontSize:11, color:'var(--pg-ink-400)'}}>{authorRatings[item.author_id].avg} ({authorRatings[item.author_id].count})</span>
                            </>
                          ) : (
                            <span style={{fontSize:10.5, color:'var(--pg-ink-400)'}}>{lang==='pt'?'sem avaliações':lang==='es'?'sin calificaciones':'no ratings'}</span>
                          )}
                          {item.createdAt && (
                            <span style={{fontSize:10, color:'var(--pg-ink-400)', flexShrink:0, marginLeft:'auto'}}>
                              · {timeAgo(item.createdAt, lang)}
                            </span>
                          )}
                        </div>
                      )}
                      {/* Divider */}
                      <div style={{height:1, background:'var(--pg-ink-100)', margin:'10px 0'}}/>
                      {/* Price */}
                      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:4}}>
                        {isSoldItem ? (
                          <span style={{
                            fontSize:12, fontWeight:700, padding:'4px 10px', borderRadius:999,
                            background:'var(--pg-ink-100)', color:'var(--pg-ink-400)',
                            border:'1px solid var(--pg-ink-200)', flexShrink:0,
                          }}>
                            {lang==='pt'?'✓ Vendido':lang==='es'?'✓ Vendido':'✓ Sold'}
                          </span>
                        ) : item.priceMode === 'neg' ? (
                          <span style={{
                            fontSize:12, fontWeight:700, padding:'4px 10px', borderRadius:999,
                            background: isPending ? 'var(--pg-ink-100)' : 'var(--pg-blue-50)',
                            color: isPending ? 'var(--pg-ink-400)' : 'var(--pg-blue-600)',
                            border: `1px solid ${isPending ? 'var(--pg-ink-200)' : 'var(--pg-blue-100)'}`,
                            flexShrink:0,
                          }}>
                            🤝 {lang==='pt'?'Negociável':lang==='es'?'Negociable':'Negotiable'}
                          </span>
                        ) : (
                          <span style={{fontFamily:'var(--pg-font-display)', fontSize:22, fontWeight:800,
                            color: isPending ? 'var(--pg-ink-400)' : 'var(--pg-blue-500)',
                            letterSpacing:'-0.02em', lineHeight:1, flexShrink:0}}>
                            {(() => {
                              if (item.type !== 'rent' || isPending) return `$${fmtN(item.price, lang)}`;
                              // Multi-period: show cheapest rate with "from" prefix
                              if (item.rentPrices && typeof item.rentPrices==='object') {
                                const order=['day','week','month'];
                                const entries=order.filter(k=>item.rentPrices[k]&&item.rentPrices[k]>0).map(k=>({k,v:item.rentPrices[k]}));
                                if (entries.length===0) return `$${fmtN(item.price, lang)}`;
                                const first=entries[0];
                                const sfx=first.k==='week'?(lang==='pt'?'/sem':'/wk'):first.k==='month'?(lang==='pt'?'/mês':'/mo'):(lang==='pt'?'/dia':'/day');
                                return <>{entries.length>1&&<span style={{fontSize:10,fontWeight:600,color:'var(--pg-ink-400)',marginRight:2}}>{lang==='pt'?'de':'from'}</span>}${fmtN(first.v, lang)}<span style={{fontSize:11,fontWeight:500,color:'var(--pg-ink-400)',marginLeft:2}}>{sfx}</span></>;
                              }
                              // Legacy single period
                              const sfx=item.rentPeriod==='week'?(lang==='pt'?'/sem':'/wk'):item.rentPeriod==='month'?(lang==='pt'?'/mês':'/mo'):(lang==='pt'?'/dia':'/day');
                              return <>${fmtN(item.price, lang)}<span style={{fontSize:11,fontWeight:500,color:'var(--pg-ink-400)',marginLeft:2}}>{sfx}</span></>;
                            })()}
                          </span>
                        )}
                      </div>
                      {/* Heart + Share row — hide for sold items */}
                      {!isMyPost(item) && !isPending && !isSoldItem && (
                        <div style={{display:'flex', gap:6, marginTop:8}}>
                          <button onClick={(e)=>toggleSave(e, item._id)} style={{
                            flex:1, height:30, borderRadius:8, cursor:'pointer', fontFamily:'inherit',
                            border: savedIds.has(item._id) ? '1px solid #FCA5A5' : '1px solid var(--pg-ink-200)',
                            background: savedIds.has(item._id) ? '#FEF2F2' : 'var(--pg-ink-50)',
                            color: savedIds.has(item._id) ? '#EF4444' : 'var(--pg-ink-400)',
                            display:'flex', alignItems:'center', justifyContent:'center', gap:4, fontSize:11, fontWeight:600,
                          }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill={savedIds.has(item._id)?'currentColor':'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                            {savedIds.has(item._id) ? (lang==='pt'?'Salvo':lang==='es'?'Guardado':'Saved') : (lang==='pt'?'Salvar':lang==='es'?'Guardar':'Save')}
                          </button>
                          <button onClick={(e)=>handleShare(e, item)} style={{
                            width:30, height:30, borderRadius:8, border:'1px solid var(--pg-ink-200)',
                            background:'var(--pg-ink-50)', color:'var(--pg-ink-400)', cursor:'pointer',
                            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                          }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                            </svg>
                          </button>
                        </div>
                      )}
                      {isPending && (
                        <div style={{marginTop:8, fontSize:10.5, color:'#92710A', background:'#FFF8E1',
                          border:'0.5px solid #FFE082', borderRadius:6, padding:'4px 8px', textAlign:'center'}}>
                          ⏳ {lang==='pt'?'Em revisão':lang==='es'?'En revisión':'Under review'}
                        </div>
                      )}
                    </div>
                  </div>
                    {/* Quick-delete button — outside opacity wrapper so it's never faded */}
                    {canAdminDelete && (
                      <div onClick={handleQuickDelete}
                        style={{
                          margin:'0 13px 14px', padding:'6px 0', borderRadius:8,
                          background:'#FEF2F2', border:'1px solid #FCA5A5',
                          color:'#EF4444', fontSize:11, fontWeight:700,
                          textAlign:'center', cursor:'pointer',
                          display:'flex', alignItems:'center', justifyContent:'center', gap:5,
                        }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          <path d="M10 11v6"/><path d="M14 11v6"/>
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                        {lang==='pt'?'Excluir':lang==='es'?'Eliminar':'Delete'}
                      </div>
                    )}
                  </button>
                );
              })}

            {/* Empty state */}
            {marketByCounty.filter(m=>m.type===mode && (m.status==='approved'||(m.status==='pending'&&isMyPost(m)))).length === 0
             && (view === 'rent' || list.length === 0) && (
              <div style={{gridColumn:'1/-1', textAlign:'center', padding:'48px 20px'}}>
                <div style={{fontSize:36, marginBottom:12}}>{view==='rent'?'🔑':'🔍'}</div>
                <div style={{fontSize:14, fontWeight:600, color:'var(--pg-ink-700)', marginBottom:4}}>
                  {view==='rent'
                    ? (lang==='pt'?'Nenhum item para alugar ainda':lang==='es'?'Sin artículos en alquiler aún':'No rental listings yet')
                    : (lang==='pt'?'Nenhum item encontrado':lang==='es'?'No se encontraron artículos':'No items found')}
                </div>
                <div style={{fontSize:12, color:'var(--pg-ink-400)', marginBottom: view==='rent'?14:0}}>
                  {view==='rent'
                    ? (lang==='pt'?'Seja o primeiro a publicar!':lang==='es'?'¡Sé el primero en publicar!':'Be the first to post a rental!')
                    : (lang==='pt'?'Tente outros filtros ou categorias':lang==='es'?'Prueba otros filtros o categorías':'Try different filters or categories')}
                </div>
                {view==='rent' && (
                  <button onClick={()=>{ setPostOpen(true); setPostMode('rent'); }} style={{
                    height:40, padding:'0 20px', borderRadius:11, border:'none', cursor:'pointer',
                    background:'linear-gradient(135deg,#0EBAC7,#0891A8)', color:'#fff',
                    fontFamily:'inherit', fontSize:13, fontWeight:700,
                    boxShadow:'0 4px 12px rgba(14,186,199,0.30)',
                  }}>
                    + {lang==='pt'?'Publicar para aluguel':lang==='es'?'Publicar alquiler':'Post a rental'}
                  </button>
                )}
              </div>
            )}

            {/* Static equipment items — shown only on Buy tab, not Rent */}
            {view !== 'rent' && list.map(e => (
              <button key={e.id} onClick={()=>openListing(normStatic(e))}
                className="pg-press"
                style={{border:'none', textAlign:'left', cursor:'pointer', overflow:'hidden', padding:0,
                  borderRadius:14, background:'var(--pg-white)',
                  boxShadow:'0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px var(--pg-ink-200)',
                  display:'flex', flexDirection:'column',
                  transition:'box-shadow .15s, transform .12s',
                }}>
                {/* Photo — 4:3 ratio enforced */}
                <div style={{position:'relative', paddingTop:'72%', background:'var(--pg-ink-200)', overflow:'hidden', borderRadius:'14px 14px 0 0', flexShrink:0}}>
                  <div style={{position:'absolute', inset:0}}>
                    <EquipImg category={e.category} height={'100%'}/>
                  </div>
                  {/* Gradient overlay */}
                  <div style={{position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(0,0,0,0.22) 0%, transparent 40%, transparent 65%, rgba(0,0,0,0.08) 100%)', pointerEvents:'none'}}/>
                  {/* Category badge */}
                  <span style={{
                    position:'absolute', top:10, left:10,
                    fontSize:9, fontWeight:700, padding:'3px 9px', borderRadius:6,
                    background:'rgba(0,0,0,0.50)', color:'#fff',
                    letterSpacing:'0.07em', textTransform:'uppercase', backdropFilter:'blur(4px)',
                  }}>{tr({Pumps:'Pumps',Filters:'Filters',Vacuum:'Vacuum',Heaters:'Heaters',Tools:'Tools'}[e.category] || e.category, lang)}</span>
                  {/* Condition chip */}
                  <span style={{
                    position:'absolute', top:10, right:10,
                    fontSize:9.5, fontWeight:700, padding:'3px 9px', borderRadius:6,
                    background:'rgba(255,255,255,0.92)', color:'var(--pg-blue-700)',
                    letterSpacing:'0.03em', backdropFilter:'blur(4px)',
                  }}>{tr(e.condition, lang)}</span>
                </div>
                {/* Content */}
                <div style={{padding:'12px 13px 14px', flex:1, display:'flex', flexDirection:'column'}}>
                  {/* Title */}
                  <div style={{fontSize:14, fontWeight:700, letterSpacing:'-0.01em', lineHeight:1.3, color:'var(--pg-ink-900)',
                    display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'}}>
                    {e.name}
                  </div>
                  {/* Description */}
                  <div style={{fontSize:11.5, color:'var(--pg-ink-500)', marginTop:5, lineHeight:1.4,
                    display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', flex:1}}>
                    {descFor(e, lang)}
                  </div>
                  {/* Divider */}
                  <div style={{height:1, background:'var(--pg-ink-100)', margin:'10px 0'}}/>
                  {/* Price row */}
                  <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                    <div>
                      <span style={{fontFamily:'var(--pg-font-display)', fontSize:22, fontWeight:800, color:'var(--pg-blue-500)', letterSpacing:'-0.02em', lineHeight:1}}>
                        ${fmtN(e.price, lang)}
                      </span>
                      {e.unit && <span style={{fontSize:11, fontWeight:500, color:'var(--pg-ink-400)', marginLeft:2}}>{tr(e.unit, lang)}</span>}
                    </div>
                    <div style={{display:'flex', alignItems:'center', gap:5}}>
                      <div style={{
                        width:22, height:22, borderRadius:'50%',
                        background:'var(--pg-blue-100)',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:10, flexShrink:0,
                      }}>👤</div>
                      <span style={{fontSize:11, color:'var(--pg-ink-500)', fontWeight:500}}>{sellerFor(e)}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Routes + Single Pools */}
        {/* Free-tier upgrade banner — routes (mobile) */}
        {view === 'routes' && user.tier === 'free' && (
          <div style={{marginTop:14}}>
            <div style={{
              borderRadius:18, padding:'28px 20px', textAlign:'center',
              background:'linear-gradient(135deg,#0c4a6e 0%,#0077B6 100%)',
              color:'#fff',
            }}>
              <div style={{width:48, height:48, borderRadius:14, background:'rgba(255,255,255,0.14)',
                display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px'}}>
                {Icon.lock(20,'#fff')}
              </div>
              <div style={{fontSize:16, fontWeight:800, marginBottom:6}}>
                {lang==='pt'?'Disponível no PRO':lang==='es'?'Disponible en PRO':'Available with PRO'}
              </div>
              <div style={{fontSize:12.5, opacity:.8, lineHeight:1.5, marginBottom:16}}>
                {lang==='pt'?'Veja todas as rotas e piscinas disponíveis na sua região.'
                :lang==='es'?'Ve todas las rutas y piscinas disponibles en tu área.'
                :'See all available routes and pools in your area.'}
              </div>
              <button onClick={()=>ctx.openPaywall&&ctx.openPaywall('routes')} style={{
                height:42, padding:'0 24px', borderRadius:10, border:'none', cursor:'pointer',
                background:'#fff', color:'#0077B6', fontWeight:800, fontSize:13, fontFamily:'inherit',
              }}>
                {lang==='pt'?'Ver planos':'See plans'} — $14.99{lang==='pt'?'/mês':'/mo'}
              </button>
            </div>
          </div>
        )}

        {view === 'routes' && user.tier !== 'free' && (
          <div style={{marginTop:14, display:'flex', flexDirection:'column', gap:12}}>

            {/* Filters card */}
            <div className="pg-card" style={{padding:'12px 14px', display:'flex', flexDirection:'column', gap:10}}>

              {/* Price filter — routes */}
              {routeSub === 'routes' && (
                <div>
                  <div style={{fontSize:10, fontWeight:700, letterSpacing:'0.07em', color:'var(--pg-ink-400)', marginBottom:6}}>
                    {lang==='pt'?'PREÇO DE VENDA':lang==='es'?'PRECIO DE VENTA':'ASKING PRICE'}
                  </div>
                  <div style={{display:'flex', gap:7, flexWrap:'wrap'}}>
                    {[
                      {id:'all',   label: lang==='pt'?'Qualquer':lang==='es'?'Cualquier':'Any'},
                      {id:'u5k',   label:'< $5K'},
                      {id:'5k-8k', label:'$5K – $8K'},
                      {id:'o8k',   label:'$8K+'},
                    ].map(opt => {
                      const on = routePrice === opt.id;
                      return (
                        <button key={opt.id} onClick={()=>setRoutePrice(opt.id)} style={{
                          padding:'5px 11px', borderRadius:8, border:'none', cursor:'pointer',
                          fontFamily:'inherit', fontSize:12, fontWeight:600, transition:'all .12s',
                          background: on ? 'var(--pg-blue-500)' : 'var(--pg-ink-100)',
                          color:      on ? '#fff' : 'var(--pg-ink-700)',
                          boxShadow:  on ? '0 2px 6px rgba(0,119,182,0.25)' : 'none',
                        }}>{opt.label}</button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Price filter — pools */}
              {routeSub === 'pools' && (
                <div>
                  <div style={{fontSize:10, fontWeight:700, letterSpacing:'0.07em', color:'var(--pg-ink-400)', marginBottom:6}}>
                    {lang==='pt'?'PREÇO DE VENDA':lang==='es'?'PRECIO DE VENTA':'ASKING PRICE'}
                  </div>
                  <div style={{display:'flex', gap:7, flexWrap:'wrap'}}>
                    {[
                      {id:'all',      label: lang==='pt'?'Qualquer':lang==='es'?'Cualquier':'Any'},
                      {id:'u1500',    label:'< $1.5K'},
                      {id:'1500-3k',  label:'$1.5K – $3K'},
                      {id:'o3k',      label:'$3K+'},
                    ].map(opt => {
                      const on = poolPrice === opt.id;
                      return (
                        <button key={opt.id} onClick={()=>setPoolPrice(opt.id)} style={{
                          padding:'5px 11px', borderRadius:8, border:'none', cursor:'pointer',
                          fontFamily:'inherit', fontSize:12, fontWeight:600, transition:'all .12s',
                          background: on ? 'var(--pg-blue-500)' : 'var(--pg-ink-100)',
                          color:      on ? '#fff' : 'var(--pg-ink-700)',
                          boxShadow:  on ? '0 2px 6px rgba(0,119,182,0.25)' : 'none',
                        }}>{opt.label}</button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Active filters badge */}
              {(routePrice !== 'all' || poolPrice !== 'all') && (
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between',
                  paddingTop:8, borderTop:'0.5px solid var(--pg-ink-200)'}}>
                  <span style={{fontSize:11.5, color:'var(--pg-blue-600)', fontWeight:600}}>
                    {list.length} {routeSub==='pools'
                      ? (lang==='pt'?'piscina(s) encontrada(s)':lang==='es'?'piscina(s) encontrada(s)':'pool(s) found')
                      : (lang==='pt'?'rota(s) encontrada(s)':lang==='es'?'ruta(s) encontrada(s)':'route(s) found')}
                  </span>
                  <button onClick={()=>{ setRoutePrice('all'); setPoolPrice('all'); }} style={{
                    border:'none', background:'var(--pg-ink-100)', borderRadius:6,
                    fontSize:11, fontWeight:600, color:'var(--pg-ink-600)', cursor:'pointer',
                    padding:'4px 9px', fontFamily:'inherit',
                  }}>
                    {lang==='pt'?'Limpar':lang==='es'?'Limpiar':'Clear'}
                  </button>
                </div>
              )}
            </div>

            {list.length === 0 && (
              <div style={{textAlign:'center', padding:'28px 16px', color:'var(--pg-ink-400)', fontSize:13, lineHeight:1.5}}>
                {routeSub==='pools'
                  ? (lang==='pt'?'Nenhuma piscina com esses filtros':lang==='es'?'Sin piscinas con estos filtros':'No pools match these filters')
                  : (lang==='pt'?'Nenhuma rota com esses filtros':lang==='es'?'Sin rutas con estos filtros':'No routes match these filters')}
              </div>
            )}

            {/* Route cards */}
            {routeSub === 'routes' && list.map(r => (
              <div key={r.id||r._liveId} className="pg-card pg-card-tap"
                onClick={()=>{ if(r._live){ const m=liveMarket.find(x=>x._id===r._liveId); if(m){ if(isMyPost(m)){ setMyPostDetail(m); return; } if(m.status==='sold'){return;} openListing(m); } } else { setSelected({...r, _type:'route'}); window.history.pushState({pgRoute:r.id},'','?listing=route-'+r.id); } }}
                style={{padding:14, display:'flex', gap:12, position:'relative'}}>
                <div style={{width:90, height:90, borderRadius:12, overflow:'hidden', flexShrink:0,
                  background:'linear-gradient(135deg,var(--pg-blue-100) 0%,var(--pg-blue-50) 100%)',
                  display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:3}}>
                  {(r.photoUrls && r.photoUrls[0]) || r.photoUrl
                    ? <img src={(r.photoUrls&&r.photoUrls[0])||r.photoUrl} alt={r.name} style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                    : <>
                        {Icon.pin(20,'var(--pg-blue-600)')}
                        <div style={{fontFamily:'var(--pg-font-display)', fontSize:24, fontWeight:800, color:'var(--pg-blue-600)', lineHeight:1}}>{r.clients||r.pools||'?'}</div>
                        <div style={{fontSize:9, fontWeight:700, color:'var(--pg-blue-700)', letterSpacing:'0.06em', textTransform:'uppercase', opacity:0.75}}>POOLS</div>
                      </>
                  }
                </div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:3}}>
                    <span className="pg-badge" style={{background:'var(--pg-blue-100)', color:'var(--pg-blue-700)', fontSize:9}}>
                      ROTA
                    </span>
                    {r._live && r.status==='pending' && (
                      <span className="pg-badge" style={{background:'#FEF9C3', color:'#854D0E', fontSize:9}}>⏳ PENDENTE</span>
                    )}
                    <span style={{fontSize:11, color:'var(--pg-ink-400)', fontWeight:500}}>{r.clients} {t.poolsWord}</span>
                  </div>
                  <div style={{fontSize:14, fontWeight:600, letterSpacing:'-0.01em', lineHeight:1.25}}>{tr(r.name, lang)}</div>
                  <div style={{display:'flex', gap:8, alignItems:'center', marginTop:5, flexWrap:'wrap'}}>
                    {r.revenue && <span className="pg-chip pg-chip-aqua" style={{padding:'3px 8px', fontSize:11}}>{tr(r.revenue, lang)}</span>}
                    <span style={{fontSize:11, color:'var(--pg-ink-500)'}}>{r.area}</span>
                  </div>
                  {r._author && (
                    <div style={{display:'flex', alignItems:'center', gap:5, marginTop:5}}>
                      <AvatarFetch uid={r._authorId} name={r._author} size={18}/>
                      <span style={{fontSize:11.5, color:'var(--pg-ink-600)', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:110}}>{r._author}</span>
                      {authorRatings[r._authorId] ? (
                        <>
                          <Stars rating={authorRatings[r._authorId].avg} size={10}/>
                          <span style={{fontSize:11, color:'var(--pg-ink-400)'}}>{authorRatings[r._authorId].avg} ({authorRatings[r._authorId].count})</span>
                        </>
                      ) : (
                        <span style={{fontSize:10.5, color:'var(--pg-ink-400)'}}>{lang==='pt'?'sem avaliações':lang==='es'?'sin calificaciones':'no ratings'}</span>
                      )}
                    </div>
                  )}
                  <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginTop:8}}>
                    <div>
                      <div style={{fontSize:10, color:'var(--pg-ink-400)'}}>{t.asking}</div>
                      <div style={{fontFamily:'var(--pg-font-display)', fontSize:20, fontWeight:700, color:'var(--pg-blue-500)', letterSpacing:'-0.02em'}}>${fmtN(r.est||0, lang)}</div>
                    </div>
                    {!isMyPost(liveMarket.find(x=>x._id===r._liveId)||{}) && (
                      <button onClick={(e)=>{ e.stopPropagation();
                        if(r._live&&r._authorId){
                          openChat({id:r._authorId,name:r._author||'Seller',listingId:r._liveId||null,listingContext:{name:tr(r.name,lang),photoUrl:(r.photoUrls&&r.photoUrls[0])||r.photoUrl||null,price:r.est,priceMode:'fixed',type:'route'}});
                        } else { openChat&&openChat(); }
                      }} className="pg-btn pg-btn-primary" style={{height:34, padding:'0 14px', fontSize:13}}>
                        {t.contact}
                      </button>
                    )}
                  </div>
                </div>
                {/* Quick delete — owner or admin */}
                {r._live && (user.role==='admin' || isMyPost(liveMarket.find(x=>x._id===r._liveId)||{})) && (
                  <button onClick={async(e)=>{
                    e.stopPropagation();
                    if(!window.confirm(lang==='pt'?`Excluir "${r.name}"?`:`Delete "${r.name}"?`)) return;
                    const {error} = await window.sb.from('marketplace').delete().eq('id', r._liveId);
                    if(error){showToast&&showToast('❌ '+error.message);return;}
                    showToast&&showToast(lang==='pt'?'🗑️ Rota excluída':'🗑️ Route deleted');
                    if(ctx&&ctx.removeMarketItem)ctx.removeMarketItem(r._liveId);
                  }} style={{position:'absolute', top:10, right:10, width:28, height:28, borderRadius:7,
                    background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.22)',
                    color:'#EF4444', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2}}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    </svg>
                  </button>
                )}
              </div>
            ))}

            {/* Single Pool cards */}
            {routeSub === 'pools' && list.map(p => (
              <div key={p.id||p._liveId} className="pg-card pg-card-tap"
                onClick={()=>{
                  if (p._live) {
                    const m = liveMarket.find(x => x._id === p._liveId);
                    if (m) { if (isMyPost(m)) { setMyPostDetail(m); } else { openListing(m); } return; }
                  }
                  setSelected({...p, _type:'pool'}); window.history.pushState({pgPool:p.id},'','?listing=pool-'+p.id);
                }}
                style={{padding:0, overflow:'hidden', position:'relative', opacity: p.status==='pending' ? 0.75 : 1}}>
                <div style={{display:'flex', gap:12, padding:'13px 14px'}}>
                  {/* Pool thumbnail — photo if available, else icon + count */}
                  {(p.photoUrl || (p.photoUrls && p.photoUrls[0])) ? (
                    <div style={{width:82, height:82, borderRadius:12, overflow:'hidden', flexShrink:0}}>
                      <img src={p.photoUrl || p.photoUrls[0]} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                    </div>
                  ) : (
                  <div style={{
                    width:82, height:82, borderRadius:12, overflow:'hidden', flexShrink:0,
                    background:'linear-gradient(135deg, var(--pg-blue-100) 0%, var(--pg-blue-50) 100%)',
                    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4,
                  }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--pg-blue-600)" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M2 12 Q6 8 10 12 Q14 16 18 12 Q20 10 22 12"/>
                      <path d="M2 18 Q6 14 10 18 Q14 22 18 18 Q20 16 22 18"/>
                      <circle cx="12" cy="5" r="2.5"/>
                    </svg>
                    <div style={{
                      fontFamily:'var(--pg-font-display)', fontSize:16, fontWeight:800,
                      color:'var(--pg-blue-600)', lineHeight:1,
                    }}>{p.pools}</div>
                    <div style={{fontSize:9, color:'var(--pg-blue-700)', fontWeight:600, letterSpacing:'0.03em', opacity:0.75}}>
                      {p.pools === 1 ? (lang==='pt'?'PISCINA':lang==='es'?'PISCINA':'POOL') : (lang==='pt'?'PISCINAS':lang==='es'?'PISCINAS':'POOLS')}
                    </div>
                  </div>
                  )}

                  <div style={{flex:1, minWidth:0}}>
                    <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:3}}>
                      <span className="pg-badge" style={{background:'var(--pg-blue-100)', color:'var(--pg-blue-700)', fontSize:9}}>
                        {p.poolKind === 'condo' ? 'CONDO' : (lang==='pt'?'CASA':lang==='es'?'CASA':'HOUSE')}
                      </span>
                      <span style={{fontSize:11, color:'var(--pg-ink-400)'}}>{p.area}</span>
                    </div>
                    <div style={{fontSize:14, fontWeight:600, letterSpacing:'-0.01em', lineHeight:1.25,
                      display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'}}>
                      {tr(p.name, lang)}
                    </div>
                    <div style={{display:'flex', gap:6, alignItems:'center', marginTop:5, flexWrap:'wrap'}}>
                      <span className="pg-chip" style={{padding:'3px 8px', fontSize:11, background:'var(--pg-blue-50)', color:'var(--pg-blue-700)', borderColor:'var(--pg-blue-100)'}}>{tr(p.revenue, lang)}</span>
                    </div>
                    {p._author && (
                      <div style={{display:'flex', alignItems:'center', gap:5, marginTop:5}}>
                        <AvatarFetch uid={p._authorId} name={p._author} size={18}/>
                        <span style={{fontSize:11.5, color:'var(--pg-ink-600)', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:110}}>{p._author}</span>
                        {authorRatings[p._authorId] ? (
                          <>
                            <Stars rating={authorRatings[p._authorId].avg} size={10}/>
                            <span style={{fontSize:11, color:'var(--pg-ink-400)'}}>{authorRatings[p._authorId].avg} ({authorRatings[p._authorId].count})</span>
                          </>
                        ) : (
                          <span style={{fontSize:10.5, color:'var(--pg-ink-400)'}}>{lang==='pt'?'sem avaliações':lang==='es'?'sin calificaciones':'no ratings'}</span>
                        )}
                      </div>
                    )}
                    <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginTop:7}}>
                      <div>
                        <div style={{fontSize:10, color:'var(--pg-ink-400)'}}>{t.asking}</div>
                        <div style={{fontFamily:'var(--pg-font-display)', fontSize:20, fontWeight:700, color:'var(--pg-blue-500)', letterSpacing:'-0.02em'}}>${fmtN(p.est, lang)}</div>
                      </div>
                      {!isMyPost(liveMarket.find(x=>x._id===p._liveId)||{}) && (
                        <button onClick={(e)=>{ e.stopPropagation();
                          const m = liveMarket.find(x=>x._id===p._liveId);
                          if(m&&m.author_id) openChat({id:m.author_id, name:m.author||'Seller', listingId:p._liveId||null, listingContext:{name:p.name, photoUrl:(p.photoUrls&&p.photoUrls[0])||p.photoUrl||null, price:p.est, priceMode:'fixed', type:'pool'}});
                          else openChat&&openChat();
                        }} className="pg-btn pg-btn-primary" style={{height:34, padding:'0 14px', fontSize:13}}>
                          {t.contact}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description row */}
                {p.desc ? (
                  <div style={{
                    borderTop:'0.5px solid var(--pg-ink-100)', padding:'9px 14px',
                    fontSize:12, color:'var(--pg-ink-500)', lineHeight:1.45,
                    display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden',
                  }}>
                    {tr(p.desc, lang)}
                  </div>
                ) : null}

                {/* Quick delete — owner or admin */}
                {p._live && (user.role==='admin' || isMyPost(liveMarket.find(x=>x._id===p._liveId)||{})) && (
                  <button onClick={async(e)=>{
                    e.stopPropagation();
                    if(!window.confirm(lang==='pt'?`Excluir "${p.name}"?`:`Delete "${p.name}"?`)) return;
                    const {error} = await window.sb.from('marketplace').delete().eq('id', p._liveId);
                    if(error){showToast&&showToast('❌ '+error.message);return;}
                    showToast&&showToast(lang==='pt'?'🗑️ Piscina excluída':'🗑️ Pool deleted');
                    if(ctx&&ctx.removeMarketItem)ctx.removeMarketItem(p._liveId);
                  }} style={{position:'absolute', top:10, right:10, width:28, height:28, borderRadius:7,
                    background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.22)',
                    color:'#EF4444', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2}}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>{/* end .pg-screen */}

      {/* Other user's listing — full-screen view */}
      {viewListing && (
        <div style={{
          position:'fixed', inset:0, zIndex:200, overflowY:'auto',
          background:'var(--pg-bg)', animation:'pg-fade-in 0.18s ease',
        }}>
          <ViewListingSheet
            item={viewListing} lang={lang}
            openChat={openChat}
            openPublicProfile={openPublicProfile}
            onClose={closeListing}
            isAdmin={user.role === 'admin'}
            canDelete={user.role === 'admin' || !!(user.uid && viewListing.author_id && user.uid === viewListing.author_id)}
            onEdit={isMyPost(viewListing) ? () => setMyPostDetail(viewListing) : undefined}
            currentUser={user}
            showToast={showToast}
            isSaved={savedIds.has(viewListing._id)}
            onToggleSave={() => toggleSave(null, viewListing._id)}
            onShare={() => handleShare(null, viewListing)}
            liveMarket={liveMarket}
            onOpenListing={openListing}
            onAfterSold={(sellerRating) => {
              // Update liveMarket immediately (realtime subscription is stubbed)
              if (ctx && ctx.updateMarketItem && viewListing) ctx.updateMarketItem(viewListing._id, { status: 'sold' });
              setViewListing(prev => prev ? { ...prev, status: 'sold' } : null);
              setTimeout(() => {
                setViewListing(null);
                if (sellerRating && openRating) {
                  openRating(sellerRating);
                } else if (loadPendingRatings) {
                  loadPendingRatings();
                }
              }, 280);
            }}
            onDeleted={(id) => {
              closeListing();
              setSavedIds(prev => { const s = new Set(prev); s.delete(id); return s; });
              if (ctx && ctx.removeMarketItem) ctx.removeMarketItem(id);
            }}
          />
        </div>
      )}

      {/* Share bottom sheet */}
      {shareItem && <ShareSheet item={shareItem} lang={lang} onClose={()=>setShareItem(null)} showToast={showToast}/>}

      {/* My post detail / edit sheet */}
      <FullPage open={!!myPostDetail} onClose={()=>setMyPostDetail(null)}>
        {myPostDetail && <MyPostDetailSheet
          item={myPostDetail} lang={lang}
          onClose={()=>setMyPostDetail(null)}
          showToast={showToast}
          currentUser={user} openRating={openRating}
          onUpdated={(updated)=>{
            setMyPostDetail(null);
            if(ctx.liveMarket) ctx.liveMarket.splice(0); // will re-fetch via realtime
          }}
          onDeleted={(id)=>{
            setMyPostDetail(null);
            if (ctx && ctx.removeMarketItem) ctx.removeMarketItem(id);
          }}
        />}
      </FullPage>

      {/* Item detail — full screen overlay, same as equipment */}
      {selected && (
        <div style={{position:'fixed', inset:0, zIndex:200, background:'var(--pg-bg)', animation:'pg-fade-in 0.18s ease'}}>
          <ListingDetail selected={selected} lang={lang} t={t} catLabels={catLabels} openChat={openChat}
            onClose={()=>{ setSelected(null); if(window.location.search.includes('listing=route-')||window.location.search.includes('listing=pool-')) window.history.back(); }}
            openPublicProfile={openPublicProfile}/>
        </div>
      )}

      {/* New listing picker */}
      <Sheet open={postOpen && !postMode} onClose={()=>setPostOpen(false)} height="auto">
        <MarketplaceListingPicker lang={lang} t={t} currentView={view}
          onPick={(mode)=>{ setPostMode(mode); }}
          onClose={()=>setPostOpen(false)}/>
      </Sheet>

      {/* Sell / Rent equipment form — FullPage to avoid iOS pull-to-refresh on backdrop */}
      <FullPage open={postOpen && (postMode==='sell'||postMode==='rent')} onClose={()=>{ setPostMode(null); setPostOpen(false); }}>
        <PostEquipmentSheet lang={lang} t={t} mode={postMode}
          onClose={()=>{ setPostMode(null); setPostOpen(false); }}
          onSubmit={async (data)=>{
            const mode = postMode;
            setPostMode(null); setPostOpen(false);
            if (data && dbWrite) {
              const ok = await dbWrite('marketplace', data);
              if (ok !== false) {
                setView(mode==='rent' ? 'rent' : 'buy');
                if (showToast) showToast(lang==='pt'?'✓ Anúncio enviado para revisão':lang==='es'?'✓ Anuncio enviado a revisión':'✓ Listing sent for review');
              }
            }
          }}/>
      </FullPage>

      <ExpiringListingPrompt item={expiringItem} lang={lang} onClose={()=>setExpiringItem(null)}
        onRenew={renewListing} onNotAvailable={()=>{ setNotAvailableItem(expiringItem); setExpiringItem(null); }}/>
      <Sheet open={!!notAvailableItem} onClose={()=>setNotAvailableItem(null)} height="auto">
        {notAvailableItem && (
          <MarkSoldSheet item={notAvailableItem} lang={lang} currentUser={user} showToast={showToast}
            onClose={()=>setNotAvailableItem(null)}
            onSold={(sellerRating)=>{ const id=notAvailableItem._id; setNotAvailableItem(null); if(ctx&&ctx.updateMarketItem) ctx.updateMarketItem(id,{status:'sold'}); openRating && sellerRating && openRating(sellerRating); }}
            onSkip={async()=>{
              const id = notAvailableItem._id;
              if (window.sb) await window.sb.from('marketplace').update({ status:'expired' }).eq('id', id);
              setNotAvailableItem(null);
              if (ctx && ctx.updateMarketItem) ctx.updateMarketItem(id, { status:'expired' });
              showToast && showToast(lang==='pt'?'Anúncio removido':lang==='es'?'Anuncio eliminado':'Listing removed');
            }}/>
        )}
      </Sheet>

      {/* Sell route form */}
      <FullPage open={postOpen && postMode==='route'} onClose={()=>{ setPostMode(null); setPostOpen(false); }}>
        <PostRouteSheet lang={lang} t={t}
          onClose={()=>{ setPostMode(null); setPostOpen(false); }}
          onSubmit={async (data)=>{
            setPostMode(null); setPostOpen(false);
            if (data && dbWrite) {
              const ok = await dbWrite('marketplace', data);
              if (ok !== false) {
                setView('routes'); setRouteSub('routes');
                if (showToast) showToast(lang==='pt'?'✓ Rota enviada para revisão':lang==='es'?'✓ Ruta enviada a revisión':'✓ Route sent for review');
              }
            }
          }}/>
      </FullPage>

      {/* Sell single pool form */}
      <FullPage open={postOpen && postMode==='pool'} onClose={()=>{ setPostMode(null); setPostOpen(false); }}>
        <PostPoolSheet lang={lang} t={t}
          onClose={()=>{ setPostMode(null); setPostOpen(false); }}
          onSubmit={async (data)=>{
            setPostMode(null); setPostOpen(false);
            if (data && dbWrite) {
              const ok = await dbWrite('marketplace', data);
              if (ok !== false) {
                setView('routes'); setRouteSub('pools');
                if (showToast) showToast(lang==='pt'?'✓ Piscina enviada para revisão':lang==='es'?'✓ Piscina enviada a revisión':'✓ Pool sent for review');
              }
            }
          }}/>
      </FullPage>
    </div>
  );
}

// ── Marketplace listing type picker ──────────────────────────
function MarketplaceListingPicker({ lang, t, currentView, onPick, onClose }) {
  const options = [
    {
      id:'sell', icon: Icon.cart,
      title: t.pmSellEq, sub: t.pmSellEqSub,
      badge: lang==='pt'?'Vender':lang==='es'?'Vender':'Sell',
      badgeColor:'var(--pg-blue-500)',
    },
    {
      id:'rent', icon: Icon.key,
      title: t.pmRentEq, sub: t.pmRentEqSub,
      badge: lang==='pt'?'Alugar':lang==='es'?'Rentar':'Rent',
      badgeColor:'var(--pg-aqua-700)',
    },
    {
      id:'route', icon: Icon.pin,
      title: t.pmSellRoute, sub: t.pmSellRouteSub,
      badge: lang==='pt'?'Rota (5+)':lang==='es'?'Ruta (5+)':'Route (5+)',
      badgeColor:'oklch(0.50 0.16 245)',
    },
    {
      id:'pool',
      icon: (s,c) => (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12 Q6 8 10 12 Q14 16 18 12 Q20 10 22 12"/>
          <path d="M2 18 Q6 14 10 18 Q14 22 18 18 Q20 16 22 18"/>
          <circle cx="12" cy="5" r="2.5"/>
        </svg>
      ),
      title: lang==='pt'?'Vender piscina avulsa':lang==='es'?'Vender piscina suelta':'Sell single pool(s)',
      sub:   lang==='pt'?'Piscina residencial ou de condomínio':lang==='es'?'Piscina residencial o de cond.':'Residential or condo pool',
      badge: lang==='pt'?'Piscina':lang==='es'?'Piscina':'Pool',
      badgeColor:'var(--pg-aqua-700)',
    },
  ];

  const headLbl = lang==='pt'?'Novo anúncio':lang==='es'?'Nuevo anuncio':'New listing';

  return (
    <div style={{padding:'6px 18px 30px'}}>
      {/* Header */}
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16}}>
        <div>
          <h2 style={{margin:0, fontSize:19, fontWeight:700, letterSpacing:'-0.02em'}}>{headLbl}</h2>
          <p style={{margin:'3px 0 0', fontSize:12, color:'var(--pg-ink-500)'}}>{t.whatToList}</p>
        </div>
        <button onClick={onClose} style={{
          border:'none', background:'var(--pg-ink-100)', width:30, height:30, borderRadius:'50%',
          cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
        }}>{Icon.x(16,'var(--pg-ink-700)')}</button>
      </div>

      {/* Option cards */}
      <div style={{display:'flex', flexDirection:'column', gap:10}}>
        {options.map(opt => (
          <button key={opt.id} onClick={()=>onPick(opt.id)} className="pg-press" style={{
            display:'flex', alignItems:'center', gap:14, padding:'14px 16px',
            border:'1px solid var(--pg-ink-150, var(--pg-ink-200))', borderRadius:14,
            background:'var(--pg-white)', cursor:'pointer', fontFamily:'inherit', textAlign:'left',
            boxShadow:'0 1px 4px rgba(0,0,0,0.04)',
          }}>
            <div style={{
              width:46, height:46, borderRadius:12, flexShrink:0,
              background:`${opt.badgeColor}18`,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              {opt.icon(22, opt.badgeColor)}
            </div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <span style={{fontSize:15, fontWeight:700, letterSpacing:'-0.015em', color:'var(--pg-ink-900)'}}>{opt.title}</span>
                <span style={{
                  fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:6,
                  background:`${opt.badgeColor}18`, color:opt.badgeColor,
                  letterSpacing:'0.03em',
                }}>{opt.badge}</span>
              </div>
              <div style={{fontSize:12.5, color:'var(--pg-ink-500)', marginTop:2}}>{opt.sub}</div>
            </div>
            <div style={{color:'var(--pg-ink-300)'}}>
              {Icon.chev(18,'var(--pg-ink-400)')}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// PhotoPicker is defined globally in components.jsx (loaded first).
// ── REMOVED duplicate PhotoPicker — using global from components.jsx ──
function _PhotoPickerUnused({ photos, onAdd, onRemove, max=5, lang, title }) {
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [uploading,  setUploading]  = React.useState(false);
  const camRef = React.useRef(null);
  const galRef = React.useRef(null);

  const titleLbl = title || (lang==='pt'?'Fotos':lang==='es'?'Fotos':'Photos');
  const hintLbl  = lang==='pt'?`Até ${max} fotos · a primeira é a capa`
                 : lang==='es'?`Hasta ${max} fotos · la primera es la portada`
                 : `Up to ${max} photos · first is the cover`;
  const canAdd = photos.length < max;

  // Compress image to max 1200px wide, JPEG 0.78 quality
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
    e.target.value = '';          // reset so same file can be picked again
    if (!file || !canAdd) return;
    setPickerOpen(false);
    setUploading(true);
    try {
      const blob = await compress(file);
      let url = null;

      // Try Supabase Storage first
      if (window.sb && window.sb.storage) {
        const path = 'posts/' + Date.now() + '-' + Math.random().toString(36).slice(2) + '.jpg';
        const { data, error } = await window.sb.storage.from('post-images').upload(path, blob, { contentType:'image/jpeg' });
        if (!error && data) {
          const { data: ud } = window.sb.storage.from('post-images').getPublicUrl(path);
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
    } catch(err) {
      console.warn('[PhotoPicker] upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const SZ = 88;

  return (
    <div>
      {/* Label row */}
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

      {/* Thumbnail strip */}
      <div style={{display:'flex', gap:8, overflowX:'auto', paddingBottom:4, scrollbarWidth:'none'}}>
        {photos.map((url, i) => (
          <div key={i} style={{position:'relative', flexShrink:0, width:SZ, height:SZ}}>
            <img src={url} alt=""
              style={{width:'100%', height:'100%', objectFit:'cover', borderRadius:10, display:'block'}}/>
            {i===0 && (
              <div style={{
                position:'absolute', bottom:0, left:0, right:0,
                background:'linear-gradient(transparent,rgba(0,0,0,0.6))',
                borderRadius:'0 0 10px 10px',
                fontSize:8, fontWeight:700, color:'#fff', textAlign:'center',
                letterSpacing:'0.07em', padding:'3px 0 5px',
              }}>{lang==='pt'?'CAPA':lang==='es'?'PORTADA':'COVER'}</div>
            )}
            <button onClick={()=>onRemove(url)} style={{
              position:'absolute', top:-6, right:-6,
              width:22, height:22, borderRadius:'50%',
              background:'var(--pg-danger,#ff3b30)', border:'2.5px solid #fff',
              cursor:'pointer', padding:0,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>{Icon.x(9,'#fff')}</button>
          </div>
        ))}

        {/* Add button */}
        {canAdd && !uploading && (
          <button onClick={()=>setPickerOpen(true)} style={{
            flexShrink:0, width:SZ, height:SZ, borderRadius:10, cursor:'pointer',
            border:'2px dashed var(--pg-ink-300)',
            background:'var(--pg-ink-50,#f7f9fb)',
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6,
          }}>
            <span style={{fontSize:24}}>📷</span>
            <span style={{fontSize:9.5, color:'var(--pg-ink-400)', fontWeight:600}}>
              {lang==='pt'?'Adicionar':lang==='es'?'Agregar':'Add'}
            </span>
          </button>
        )}

        {uploading && (
          <div style={{
            flexShrink:0, width:SZ, height:SZ, borderRadius:10,
            background:'var(--pg-ink-100)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <span style={{fontSize:22, animation:'spin 1s linear infinite'}}>⏳</span>
          </div>
        )}
      </div>

      {/* Picker bottom-sheet */}
      {pickerOpen && (
        <div onClick={()=>setPickerOpen(false)} style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.45)',
          zIndex:9999, display:'flex', alignItems:'flex-end', justifyContent:'center',
        }}>
          <div onClick={e=>e.stopPropagation()} style={{
            background:'var(--pg-white)', borderRadius:'20px 20px 0 0',
            padding:'16px 16px 32px', width:'100%', maxWidth:480,
            boxShadow:'0 -8px 40px rgba(0,0,0,0.18)',
          }}>
            {/* Grabber */}
            <div style={{width:40,height:4,borderRadius:2,background:'var(--pg-ink-200)',margin:'0 auto 18px'}}/>
            <div style={{fontWeight:700, fontSize:16, textAlign:'center', marginBottom:18, color:'var(--pg-ink-900)'}}>
              {lang==='pt'?'Adicionar foto':lang==='es'?'Agregar foto':'Add photo'}
            </div>
            {/* Camera */}
            <button onClick={()=>camRef.current && camRef.current.click()} style={{
              width:'100%', padding:'15px 18px', marginBottom:10, borderRadius:14,
              border:'1.5px solid var(--pg-ink-200)', background:'var(--pg-white)',
              display:'flex', alignItems:'center', gap:14, cursor:'pointer', fontFamily:'inherit',
            }}>
              <span style={{fontSize:28}}>📷</span>
              <div style={{textAlign:'left'}}>
                <div style={{fontWeight:700, fontSize:15, color:'var(--pg-ink-900)'}}>
                  {lang==='pt'?'Tirar foto':lang==='es'?'Tomar foto':'Take photo'}
                </div>
                <div style={{fontSize:12, color:'var(--pg-ink-500)', marginTop:2}}>
                  {lang==='pt'?'Usar câmera do celular':lang==='es'?'Usar cámara del celular':'Use your phone camera'}
                </div>
              </div>
            </button>
            {/* Gallery */}
            <button onClick={()=>galRef.current && galRef.current.click()} style={{
              width:'100%', padding:'15px 18px', marginBottom:16, borderRadius:14,
              border:'1.5px solid var(--pg-ink-200)', background:'var(--pg-white)',
              display:'flex', alignItems:'center', gap:14, cursor:'pointer', fontFamily:'inherit',
            }}>
              <span style={{fontSize:28}}>🖼️</span>
              <div style={{textAlign:'left'}}>
                <div style={{fontWeight:700, fontSize:15, color:'var(--pg-ink-900)'}}>
                  {lang==='pt'?'Escolher da galeria':lang==='es'?'Elegir de la galería':'Choose from gallery'}
                </div>
                <div style={{fontSize:12, color:'var(--pg-ink-500)', marginTop:2}}>
                  {lang==='pt'?'Acessar fotos salvas':lang==='es'?'Acceder a fotos guardadas':'Access saved photos'}
                </div>
              </div>
            </button>
            {/* Cancel */}
            <button onClick={()=>setPickerOpen(false)} style={{
              width:'100%', padding:'14px', borderRadius:14, border:'none',
              background:'var(--pg-ink-100)', color:'var(--pg-ink-700)',
              fontWeight:600, fontSize:15, cursor:'pointer', fontFamily:'inherit',
            }}>{lang==='pt'?'Cancelar':lang==='es'?'Cancelar':'Cancel'}</button>
          </div>
        </div>
      )}

      {/* Hidden file inputs */}
      <input ref={camRef} type="file" accept="image/*" capture="environment"
        style={{display:'none', position:'absolute'}} onChange={handleFile}/>
      <input ref={galRef} type="file" accept="image/*"
        style={{display:'none', position:'absolute'}} onChange={handleFile}/>
    </div>
  );
}

// ── Photo carousel in item detail sheet ──────────────────────
function ItemPhotoCarousel({ category, height=220 }) {
  const [idx, setIdx] = React.useState(0);
  const kw = ({
    Pumps:'pool,pump', Filters:'pool,filter', Vacuum:'pool,vacuum',
    Heaters:'pool,heater', Tools:'pool,maintenance', Routes:'swimming,pool',
  })[category] || 'pool,equipment';

  // 3 deterministic photos for the detail view
  const photos = [1, 11, 21].map(n => `https://loremflickr.com/800/500/${kw}?lock=${n}`);

  return (
    <div style={{position:'relative', height, overflow:'hidden', background:'var(--pg-ink-200)', flexShrink:0}}>
      <img
        key={photos[idx]}
        src={photos[idx]}
        alt={category}
        style={{width:'100%', height:'100%', objectFit:'cover', display:'block'}}
      />
      {/* Counter */}
      <div style={{
        position:'absolute', top:12, right:12,
        background:'rgba(0,0,0,0.45)', borderRadius:999,
        padding:'3px 10px', fontSize:11, fontWeight:700, color:'#fff',
      }}>{idx+1} / {photos.length}</div>

      {/* Dots */}
      <div style={{
        position:'absolute', bottom:10, left:0, right:0,
        display:'flex', justifyContent:'center', gap:5,
      }}>
        {photos.map((_,i)=>(
          <button key={i} onMouseDown={()=>setIdx(i)} style={{
            width: i===idx ? 18 : 6, height:6, borderRadius:3,
            background: i===idx ? '#fff' : 'rgba(255,255,255,0.5)',
            border:'none', cursor:'pointer', padding:0, transition:'all .18s ease',
          }}/>
        ))}
      </div>

      {/* Prev */}
      {idx > 0 && (
        <button onClick={()=>setIdx(i=>i-1)} style={{
          position:'absolute', left:10, top:'50%', transform:'translateY(-50%)',
          width:34, height:34, borderRadius:'50%', background:'rgba(255,255,255,0.88)',
          border:'none', cursor:'pointer', fontSize:20, fontWeight:700, lineHeight:1,
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 2px 8px rgba(0,0,0,0.15)',
        }}>{'‹'}</button>
      )}
      {/* Next */}
      {idx < photos.length-1 && (
        <button onClick={()=>setIdx(i=>i+1)} style={{
          position:'absolute', right:10, top:'50%', transform:'translateY(-50%)',
          width:34, height:34, borderRadius:'50%', background:'rgba(255,255,255,0.88)',
          border:'none', cursor:'pointer', fontSize:20, fontWeight:700, lineHeight:1,
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 2px 8px rgba(0,0,0,0.15)',
        }}>{'›'}</button>
      )}
    </div>
  );
}

// ── Listing detail — handles equipment, route and pool types ──
function ListingDetail({ selected, lang, t, catLabels, openChat, onClose, openPublicProfile }) {
  const [offerOpen,  setOfferOpen]  = React.useState(false);
  const [offerAmt,   setOfferAmt]   = React.useState('');
  const [offerNote,  setOfferNote]  = React.useState('');
  const [offerSent,  setOfferSent]  = React.useState(false);

  // Pre-fill amount when offer panel opens
  const openOffer = () => {
    const defaultAmt = selected.est
      ? String(selected.est)
      : selected.price && selected.price !== 'neg'
        ? String(selected.price)
        : '';
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
  const OfferPanel = offerOpen && (
    <div style={{
      marginTop:14, borderRadius:16, overflow:'hidden',
      border:'1.5px solid var(--pg-blue-200)',
      background:'var(--pg-blue-50)',
    }}>
      {offerSent ? (
        /* ── Success state ── */
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:8, padding:'22px 20px'}}>
          <div style={{
            width:46, height:46, borderRadius:'50%',
            background:'linear-gradient(135deg, #0EBAC7, #0077B6)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 4px 12px rgba(14,186,199,0.35)',
          }}>
            {Icon.check(22,'#fff')}
          </div>
          <div style={{fontWeight:700, fontSize:14, color:'var(--pg-ink-900)'}}>
            {lang==='pt'?'Oferta enviada!':lang==='es'?'¡Oferta enviada!':'Offer sent!'}
          </div>
          <div style={{fontSize:12, color:'var(--pg-ink-500)', textAlign:'center', lineHeight:1.4}}>
            {lang==='pt'?`Redirecionando para o chat com ${sellerName}…`:lang==='es'?`Redirigiendo al chat con ${sellerName}…`:`Redirecting to chat with ${sellerName}…`}
          </div>
        </div>
      ) : (
        /* ── Offer form ── */
        <div style={{padding:'14px 16px 16px'}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12}}>
            <span style={{fontSize:13, fontWeight:700, color:'var(--pg-blue-700)'}}>
              {lang==='pt'?'💰 Fazer uma oferta':lang==='es'?'💰 Hacer una oferta':'💰 Make an offer'}
            </span>
            <button onClick={()=>setOfferOpen(false)} style={{
              border:'none', background:'var(--pg-ink-100)', borderRadius:'50%',
              width:24, height:24, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
            }}>{Icon.x(11,'var(--pg-ink-600)')}</button>
          </div>

          {/* Amount */}
          <div style={{marginBottom:10}}>
            <div style={{fontSize:10, fontWeight:700, letterSpacing:'0.07em', color:'var(--pg-ink-500)', marginBottom:5}}>
              {lang==='pt'?'VALOR DA OFERTA (USD)':lang==='es'?'VALOR DE LA OFERTA (USD)':'OFFER AMOUNT (USD)'}
            </div>
            <div style={{position:'relative'}}>
              <span style={{
                position:'absolute', left:12, top:'50%', transform:'translateY(-50%)',
                fontSize:16, fontWeight:700, color:'var(--pg-blue-500)', pointerEvents:'none',
              }}>$</span>
              <input
                className="pg-field"
                type="number"
                value={offerAmt}
                onChange={e=>setOfferAmt(e.target.value)}
                placeholder="0"
                style={{height:46, fontSize:16, fontWeight:700, paddingLeft:26, color:'var(--pg-blue-500)'}}
              />
            </div>
          </div>

          {/* Note */}
          <div style={{marginBottom:14}}>
            <div style={{fontSize:10, fontWeight:700, letterSpacing:'0.07em', color:'var(--pg-ink-500)', marginBottom:5}}>
              {lang==='pt'?'MENSAGEM (OPCIONAL)':lang==='es'?'MENSAJE (OPCIONAL)':'MESSAGE (OPTIONAL)'}
            </div>
            <textarea
              className="pg-textarea"
              value={offerNote}
              onChange={e=>setOfferNote(e.target.value)}
              placeholder={
                lang==='pt'?'Ex: Tenho interesse, posso fechar rápido…'
                :lang==='es'?'Ej: Estoy interesado, puedo cerrar rápido…'
                :'E.g. I\'m very interested, can close quickly…'
              }
              style={{minHeight:64, fontSize:13}}
            />
          </div>

          {/* Send */}
          <button
            onClick={sendOffer}
            disabled={!offerAmt || Number(offerAmt) <= 0}
            className="pg-btn pg-btn-primary"
            style={{
              width:'100%', height:48, fontSize:14, borderRadius:12,
              background: offerAmt && Number(offerAmt) > 0
                ? 'linear-gradient(135deg, #023EBA 0%, #0077B6 100%)'
                : 'var(--pg-ink-200)',
              color: offerAmt && Number(offerAmt) > 0 ? '#fff' : 'var(--pg-ink-400)',
              boxShadow: offerAmt && Number(offerAmt) > 0 ? '0 4px 14px rgba(0,119,182,0.35)' : 'none',
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            }}>
            {Icon.msg(16, offerAmt && Number(offerAmt) > 0 ? '#fff' : 'var(--pg-ink-400)')}
            {lang==='pt'?'Enviar oferta via mensagem':lang==='es'?'Enviar oferta por mensaje':'Send offer via message'}
          </button>
        </div>
      )}
    </div>
  );

  const sellerProfile = { name:'Sandra Reyes', rating:4.8, reviews:87, tier:'pro', jobs:87, loc:'Broward County, FL' };
  const sellerRow = (
    <>
      <div className="pg-divider" style={{margin:'16px 0'}}/>
      <button onClick={()=>openPublicProfile && openPublicProfile(sellerProfile)}
        style={{display:'flex', alignItems:'center', gap:12, width:'100%', border:'none', background:'transparent', cursor:'pointer', textAlign:'left', padding:0, fontFamily:'inherit'}}>
        <Avatar name="Sandra Reyes" size={44}/>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontSize:14, fontWeight:600, color:'var(--pg-ink-900)'}}>Sandra Reyes</div>
          <div style={{display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--pg-ink-500)'}}>
            <Stars rating={4.8} size={11}/> 4.8 · 87 {lang==='pt'?'transações':lang==='es'?'transacciones':'transactions'}
          </div>
        </div>
        <span className="pg-chip pg-chip-aqua" style={{fontSize:11}}>{t.verified}</span>
      </button>
    </>
  );

  // ── ROUTE ──────────────────────────────────────────────────────
  if (selected._type === 'route') {
    const routePhotos = (selected.photoUrls&&selected.photoUrls.length>0) ? selected.photoUrls : (selected.photoUrl?[selected.photoUrl]:[]);
    return (
      <div style={{display:'flex', flexDirection:'column', height:'100%'}}>
        {routePhotos.length > 0 ? (
          <div style={{position:'relative', flexShrink:0}}>
            <PhotoCarousel urls={routePhotos} fallbackCat="Tools" height={220}/>
            <button onClick={onClose} style={{position:'absolute', top:12, right:12, zIndex:10,
              border:'none', background:'rgba(0,0,0,0.45)', width:32, height:32,
              borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
              {Icon.x(14,'#fff')}
            </button>
          </div>
        ) : (
          <div style={{position:'relative', height:190, flexShrink:0,
            background:'linear-gradient(135deg, #011B5A 0%, #023EBA 55%, #0077B6 100%)',
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10, overflow:'hidden'}}>
            <button onClick={onClose} style={{position:'absolute', top:12, right:12, zIndex:2,
              border:'none', background:'rgba(255,255,255,0.15)', width:30, height:30,
              borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
              {Icon.x(14,'#fff')}
            </button>
            <div style={{display:'flex', gap:28, alignItems:'center'}}>
              <div style={{textAlign:'center', color:'#fff'}}>
                <div style={{fontFamily:'var(--pg-font-display)', fontSize:44, fontWeight:800, lineHeight:1, letterSpacing:'-0.02em'}}>{selected.clients}</div>
                <div style={{fontSize:11, opacity:0.60, fontWeight:600, marginTop:4, letterSpacing:'0.04em'}}>
                  {lang==='pt'?'PISCINAS':lang==='es'?'PISCINAS':'POOLS'}
                </div>
              </div>
              <div style={{width:1, height:52, background:'rgba(255,255,255,0.20)'}}/>
              <div style={{textAlign:'center', color:'#fff'}}>
                <div style={{fontFamily:'var(--pg-font-display)', fontSize:22, fontWeight:800, lineHeight:1, letterSpacing:'-0.01em'}}>{tr(selected.revenue, lang)}</div>
                <div style={{fontSize:11, opacity:0.60, fontWeight:600, marginTop:4, letterSpacing:'0.04em'}}>
                  {lang==='pt'?'RECEITA/MÊS':lang==='es'?'INGRESO/MES':'REVENUE/MO'}
                </div>
              </div>
            </div>
            <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:4}}>
              <div style={{display:'flex', alignItems:'center', gap:5,
                background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.22)',
                borderRadius:999, padding:'4px 12px'}}>
                {Icon.pin(11,'rgba(255,255,255,0.80)')}
                <span style={{fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.80)'}}>{selected.area}</span>
              </div>
              {selected.address && (
                <div style={{fontSize:11, color:'rgba(255,255,255,0.65)', fontWeight:500}}>{selected.address}</div>
              )}
            </div>
          </div>
        )}
        <div style={{flex:1, overflowY:'auto', touchAction:'pan-y', padding:'16px 18px 24px', display:'flex', flexDirection:'column'}}>
          {/* Stats row — shown below carousel when photos exist */}
          {routePhotos.length > 0 && (
            <div style={{display:'flex', flexWrap:'wrap', gap:10, paddingBottom:14, marginBottom:4, borderBottom:'0.5px solid var(--pg-ink-100)'}}>
              {selected.clients && (
                <div style={{display:'flex', alignItems:'center', gap:6, padding:'7px 12px', borderRadius:10, background:'var(--pg-blue-50)', border:'0.5px solid var(--pg-blue-100)'}}>
                  <span style={{fontSize:11, fontWeight:700, color:'var(--pg-blue-700)', letterSpacing:'0.04em'}}>{lang==='pt'?'PISCINAS':lang==='es'?'PISCINAS':'POOLS'}</span>
                  <span style={{fontSize:15, fontWeight:800, color:'var(--pg-blue-500)'}}>{selected.clients}</span>
                </div>
              )}
              {selected.revenue && (
                <div style={{display:'flex', alignItems:'center', gap:6, padding:'7px 12px', borderRadius:10, background:'var(--pg-aqua-100)', border:'0.5px solid var(--pg-aqua-400)'}}>
                  <span style={{fontSize:11, fontWeight:700, color:'var(--pg-aqua-700)', letterSpacing:'0.04em'}}>{lang==='pt'?'RECEITA/MÊS':lang==='es'?'INGRESO/MES':'REV/MO'}</span>
                  <span style={{fontSize:13, fontWeight:700, color:'var(--pg-ink-900)'}}>{tr(selected.revenue, lang)}</span>
                </div>
              )}
              {selected.area && (
                <div style={{display:'flex', alignItems:'center', gap:5, padding:'7px 12px', borderRadius:10, background:'var(--pg-ink-50,var(--pg-blue-50))', border:'0.5px solid var(--pg-ink-200)'}}>
                  {Icon.pin(11,'var(--pg-ink-500)')}
                  <span style={{fontSize:12, fontWeight:600, color:'var(--pg-ink-700)'}}>{selected.area}</span>
                </div>
              )}
              {selected.address && (
                <div style={{fontSize:12, color:'var(--pg-ink-500)', padding:'7px 0', alignSelf:'center'}}>{selected.address}</div>
              )}
            </div>
          )}
          <h2 style={{margin:0, fontFamily:'var(--pg-font-display)', fontSize:20, fontWeight:700, letterSpacing:'-0.02em', lineHeight:1.2}}>
            {tr(selected.name, lang)}
          </h2>
          <div style={{display:'flex', alignItems:'baseline', gap:8, marginTop:10}}>
            <span style={{fontSize:10, color:'var(--pg-ink-400)', fontWeight:700, letterSpacing:'0.06em'}}>{t.asking.toUpperCase()}</span>
            <span style={{fontFamily:'var(--pg-font-display)', fontSize:32, fontWeight:700, color:'var(--pg-blue-500)', letterSpacing:'-0.02em'}}>
              ${fmtN(selected.est, lang)}
            </span>
          </div>
          {sellerRow}
          {OfferPanel}
          <div style={{display:'flex', gap:10, marginTop:12}}>
            <button onClick={openChat} className="pg-btn pg-btn-ghost" style={{flex:1}}>
              {Icon.msg(16,'var(--pg-blue-700)')} {t.message}
            </button>
            <button onClick={openOffer} className="pg-btn pg-btn-primary" style={{flex:2}}>{t.makeOffer}</button>
          </div>
        </div>
      </div>
    );
  }

  // ── SINGLE POOL ────────────────────────────────────────────────
  if (selected._type === 'pool') {
    const poolPhotos = (selected.photoUrls&&selected.photoUrls.length>0) ? selected.photoUrls : (selected.photoUrl?[selected.photoUrl]:[]);
    return (
    <div style={{display:'flex', flexDirection:'column', height:'100%'}}>
      {poolPhotos.length > 0
        ? (
          <div style={{position:'relative', flexShrink:0}}>
            <PhotoCarousel urls={poolPhotos} fallbackCat="Tools" height={220}/>
            <button onClick={onClose} style={{position:'absolute', top:12, right:12, zIndex:10,
              border:'none', background:'rgba(0,0,0,0.45)', width:32, height:32,
              borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
              {Icon.x(14,'#fff')}
            </button>
          </div>
        ) : (
          <div style={{position:'relative', height:180, flexShrink:0,
            background:'linear-gradient(135deg, #011B5A 0%, #023EBA 55%, #0077B6 100%)',
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4}}>
            <button onClick={onClose} style={{position:'absolute', top:12, right:12,
              border:'none', background:'rgba(255,255,255,0.15)', width:30, height:30,
              borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
              {Icon.x(14,'#fff')}
            </button>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.90)" strokeWidth="1.8" strokeLinecap="round">
              <path d="M2 12 Q6 8 10 12 Q14 16 18 12 Q20 10 22 12"/>
              <path d="M2 18 Q6 14 10 18 Q14 22 18 18 Q20 16 22 18"/>
              <circle cx="12" cy="5" r="2.5"/>
            </svg>
            <div style={{fontFamily:'var(--pg-font-display)', fontSize:54, fontWeight:800, color:'#fff', lineHeight:1, letterSpacing:'-0.02em'}}>
              {selected.pools}
            </div>
            <div style={{fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.65)', letterSpacing:'0.06em'}}>
              {selected.pools===1 ? (lang==='pt'?'PISCINA':lang==='es'?'PISCINA':'POOL') : (lang==='pt'?'PISCINAS':lang==='es'?'PISCINAS':'POOLS')}
            </div>
          </div>
        )
      }
      <div style={{flex:1, overflowY:'auto', touchAction:'pan-y', padding:'16px 18px 24px'}}>
        <div style={{display:'flex', alignItems:'center', gap:7, marginBottom:6}}>
          <span className="pg-badge" style={{background:'var(--pg-blue-100)', color:'var(--pg-blue-700)', fontSize:9}}>
            {selected.type==='condo' ? 'CONDO' : (lang==='pt'?'RESIDENCIAL':lang==='es'?'RESIDENCIAL':'HOUSE')}
          </span>
          <span style={{fontSize:12, color:'var(--pg-ink-400)'}}>{selected.area}</span>
          {selected.address && <span style={{fontSize:12, color:'var(--pg-ink-400)'}}> · {selected.address}</span>}
        </div>
        <h2 style={{margin:0, fontFamily:'var(--pg-font-display)', fontSize:20, fontWeight:700, letterSpacing:'-0.02em', lineHeight:1.2}}>
          {tr(selected.name||selected.desc, lang)}
        </h2>
        <div style={{display:'flex', alignItems:'baseline', gap:8, marginTop:10, flexWrap:'wrap'}}>
          <span style={{fontSize:10, color:'var(--pg-ink-400)', fontWeight:700, letterSpacing:'0.06em'}}>{t.asking.toUpperCase()}</span>
          <span style={{fontFamily:'var(--pg-font-display)', fontSize:32, fontWeight:700, color:'var(--pg-blue-500)', letterSpacing:'-0.02em'}}>
            ${fmtN(selected.est, lang)}
          </span>
          <span className="pg-chip" style={{fontSize:11, background:'var(--pg-blue-50)', color:'var(--pg-blue-700)', borderColor:'var(--pg-blue-100)'}}>{tr(selected.revenue, lang)}</span>
        </div>
        {(selected.desc||selected.description) && (
          <div style={{marginTop:12, fontSize:13, lineHeight:1.55, color:'var(--pg-ink-600)'}}>
            {tr(selected.desc||selected.description, lang)}
          </div>
        )}

        {/* Detail chips */}
        {(selected.system||selected.sizeFt||selected.gallons||selected.freq||selected.warranty) && (
          <div style={{marginTop:14, display:'flex', flexDirection:'column', gap:8}}>
            {(selected.sizeFt||selected.gallons) && (
              <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                {selected.sizeFt && (
                  <div style={{display:'flex', alignItems:'center', gap:6, padding:'7px 12px', borderRadius:10, background:'var(--pg-ink-50,var(--pg-blue-50))', border:'0.5px solid var(--pg-ink-200)'}}>
                    <span style={{fontSize:11, fontWeight:700, color:'var(--pg-ink-500)', letterSpacing:'0.04em'}}>{lang==='pt'?'TAMANHO':lang==='es'?'TAMAÑO':'SIZE'}</span>
                    <span style={{fontSize:13, fontWeight:600, color:'var(--pg-ink-900)'}}>{selected.sizeFt}</span>
                  </div>
                )}
                {selected.gallons && (
                  <div style={{display:'flex', alignItems:'center', gap:6, padding:'7px 12px', borderRadius:10, background:'var(--pg-ink-50,var(--pg-blue-50))', border:'0.5px solid var(--pg-ink-200)'}}>
                    <span style={{fontSize:11, fontWeight:700, color:'var(--pg-ink-500)', letterSpacing:'0.04em'}}>{lang==='pt'?'GALÕES':'GALLONS'}</span>
                    <span style={{fontSize:13, fontWeight:600, color:'var(--pg-ink-900)'}}>{fmtN(selected.gallons, lang)} gal</span>
                  </div>
                )}
              </div>
            )}
            <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
              {selected.system && (
                <div style={{display:'flex', alignItems:'center', gap:6, padding:'7px 12px', borderRadius:10, background:'var(--pg-aqua-100)', border:'0.5px solid var(--pg-aqua-400)'}}>
                  <span style={{fontSize:11, fontWeight:700, color:'var(--pg-aqua-700)', letterSpacing:'0.04em'}}>{lang==='pt'?'SISTEMA':lang==='es'?'SISTEMA':'SYSTEM'}</span>
                  <span style={{fontSize:13, fontWeight:600, color:'var(--pg-ink-900)'}}>
                    {selected.system==='salt'?(lang==='pt'?'Sal':lang==='es'?'Sal':'Salt'):(lang==='pt'?'Cloro':lang==='es'?'Cloro':'Chlorine')}
                  </span>
                </div>
              )}
              {selected.freq && (
                <div style={{display:'flex', alignItems:'center', gap:6, padding:'7px 12px', borderRadius:10, background:'var(--pg-aqua-100)', border:'0.5px solid var(--pg-aqua-400)'}}>
                  <span style={{fontSize:11, fontWeight:700, color:'var(--pg-aqua-700)', letterSpacing:'0.04em'}}>{lang==='pt'?'VISITAS':lang==='es'?'VISITAS':'VISITS'}</span>
                  <span style={{fontSize:13, fontWeight:600, color:'var(--pg-ink-900)'}}>
                    {selected.freq==='7'?(lang==='pt'?'Diário':lang==='es'?'Diario':'Daily'):`${selected.freq}x/${lang==='pt'||lang==='es'?'sem':'wk'}`}
                  </span>
                </div>
              )}
              {selected.warranty && (
                <div style={{display:'flex', alignItems:'center', gap:6, padding:'7px 12px', borderRadius:10, background: selected.warranty==='yes'?'#F0FDF4':'var(--pg-ink-100)', border:`0.5px solid ${selected.warranty==='yes'?'#86EFAC':'var(--pg-ink-200)'}`}}>
                  <span style={{fontSize:11, fontWeight:700, color: selected.warranty==='yes'?'#15803D':'var(--pg-ink-500)', letterSpacing:'0.04em'}}>{lang==='pt'?'GARANTIA':lang==='es'?'GARANTÍA':'WARRANTY'}</span>
                  <span style={{fontSize:13, fontWeight:600, color:'var(--pg-ink-900)'}}>
                    {selected.warranty==='yes'
                      ? (selected.warrantyMonths ? `${selected.warrantyMonths} ${lang==='pt'?'meses':lang==='es'?'meses':'mo'}` : (lang==='pt'?'Sim':lang==='es'?'Sí':'Yes'))
                      : (lang==='pt'?'Não':lang==='es'?'No':'No')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {sellerRow}
        {OfferPanel}
        <div style={{display:'flex', gap:10, marginTop:12}}>
          <button onClick={openChat} className="pg-btn pg-btn-ghost" style={{flex:1}}>
            {Icon.msg(16,'var(--pg-blue-700)')} {t.message}
          </button>
          <button onClick={openOffer} className="pg-btn pg-btn-primary" style={{flex:2}}>{t.makeOffer}</button>
        </div>
      </div>
    </div>
    );
  }

  // ── EQUIPMENT (default) ────────────────────────────────────────
  return (
    <div>
      <ItemPhotoCarousel category={selected.category} height={220}/>
      <div style={{padding:'14px 18px 80px'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10}}>
          <h2 style={{margin:0, fontFamily:'var(--pg-font-display)', fontSize:20, fontWeight:700, letterSpacing:'-0.02em', lineHeight:1.2}}>
            {selected.name}
          </h2>
          <button onClick={onClose} style={{border:'none', background:'var(--pg-ink-100)', width:30, height:30,
            borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
            {Icon.x(16,'var(--pg-ink-700)')}
          </button>
        </div>
        <div style={{display:'flex', alignItems:'baseline', gap:6, marginTop:8}}>
          <span style={{fontFamily:'var(--pg-font-display)', fontSize:30, fontWeight:700, color:'var(--pg-blue-500)', letterSpacing:'-0.02em'}}>${fmtN(selected.price, lang)}</span>
          {selected.unit && <span style={{fontSize:13, color:'var(--pg-ink-500)'}}>{tr(selected.unit, lang)}</span>}
          <span className="pg-chip" style={{marginLeft:8, padding:'2px 9px', fontSize:11, background:'var(--pg-blue-100)', color:'var(--pg-blue-700)', borderColor:'transparent'}}>
            {tr(selected.condition, lang).toLowerCase()}
          </span>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:5, marginTop:8, fontSize:13, color:'var(--pg-ink-700)'}}>
          {Icon.pin(14,'var(--pg-ink-700)')} {selected.loc} · {tr(catLabels[selected.category], lang)}
        </div>
        {sellerRow}
        <div style={{marginTop:14, fontSize:14, lineHeight:1.5, color:'var(--pg-ink-700)'}}>
          {descFor(selected, lang)}
        </div>
        {OfferPanel}
        <div style={{display:'flex', gap:10, marginTop:12}}>
          <button onClick={openChat} className="pg-btn pg-btn-ghost" style={{flex:1}}>
            {Icon.msg(16,'var(--pg-blue-700)')} {t.message}
          </button>
          <button onClick={selected.mode==='rent' ? openChat : openOffer} className="pg-btn pg-btn-primary" style={{flex:2}}>
            {selected.mode==='rent' ? t.requestRental : t.makeOffer}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Post equipment form (sell or rent) ────────────────────────
function PostEquipmentSheet({ lang, t, mode='sell', onClose, onSubmit }) {
  const [name,        setName]       = React.useState('');
  const [description, setDescription]= React.useState('');
  const [cat,         setCat]        = React.useState('Pumps');
  const [condition,   setCondition]  = React.useState('new');
  const [price,       setPrice]      = React.useState('');
  const [loc,         setLoc]        = React.useState('');
  const [priceMode,   setPriceMode]  = React.useState('fixed');
  // Multi-period rental pricing
  const [rentEnabled, setRentEnabled] = React.useState({ day: false, week: false, month: false });
  const [rentPrices,  setRentPrices]  = React.useState({ day: '', week: '', month: '' });
  const [photos,      setPhotos]     = React.useState([]);
  const [disclaimerChecked, setDisclaimerChecked] = React.useState(false);

  const isRent = mode === 'rent';
  const headLbl   = isRent ? t.pmRentEq   : t.pmSellEq;
  const priceLbl  = isRent
    ? (lang==='pt'?'Valor do aluguel':lang==='es'?'Valor del alquiler':'Rental rate')
    : (lang==='pt'?'Preço de venda':lang==='es'?'Precio de venta':'Sale price');
  const submitLbl = t.postListingBtn;

  const periodOptions = [
    { id:'day',   label: lang==='pt'?'Por dia':lang==='es'?'Por día':'Per day',    sfx: lang==='pt'?'/dia':lang==='es'?'/día':'/day' },
    { id:'week',  label: lang==='pt'?'Por semana':lang==='es'?'Por semana':'Per week', sfx: lang==='pt'?'/sem':lang==='es'?'/sem':'/wk' },
    { id:'month', label: lang==='pt'?'Por mês':lang==='es'?'Por mes':'Per month',  sfx: lang==='pt'?'/mês':lang==='es'?'/mes':'/mo' },
  ];
  // At least one period must be enabled with a valid price
  const hasAnyRentPrice = isRent && periodOptions.some(p => rentEnabled[p.id] && rentPrices[p.id].trim().length > 0);

  const cats = ['Pumps','Vacuum','Heaters','Pole','Car','Truck','Jug','Net','Chemicals','Filters','Others'];
  const catLabels = {
    Pumps:     lang==='pt'?'Bombas':     lang==='es'?'Bombas':     'Pumps',
    Vacuum:    lang==='pt'?'Aspiradores':lang==='es'?'Aspiradores':'Vacuum',
    Heaters:   lang==='pt'?'Aquecedores':lang==='es'?'Calentadores':'Heaters',
    Pole:      'Pole',
    Car:       lang==='pt'?'Carrinho':   lang==='es'?'Carrito':    'Cart',
    Truck:     'Truck',
    Jug:       'Jug',
    Net:       'Net',
    Chemicals: lang==='pt'?'Químicos':   lang==='es'?'Químicos':   'Chemicals',
    Filters:   lang==='pt'?'Filtros':    lang==='es'?'Filtros':    'Filters',
    Others:    lang==='pt'?'Outros':     lang==='es'?'Otros':      'Others',
  };

  const conditions = [
    { id:'new',     label:t.newLbl },
    { id:'likeNew', label:t.likeNewLbl },
    { id:'good',    label:t.goodLbl },
    { id:'used',    label:t.usedLbl },
    { id:'parts',   label:t.forPartsLbl },
  ];

  const isValid = name.trim().length > 2 && loc.trim().length > 2
    && (isRent ? (hasAnyRentPrice && disclaimerChecked) : (priceMode === 'neg' || price.trim().length > 0));

  return (
    <div style={{display:'flex', flexDirection:'column', height:'100%'}}>
      {/* Header */}
      <div style={{padding:'8px 18px 14px', borderBottom:'0.5px solid var(--pg-ink-200)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <button onClick={onClose} style={{border:'none', background:'transparent', color:'var(--pg-blue-500)', fontSize:15, fontWeight:600, cursor:'pointer', padding:0}}>{t.cancel}</button>
        <h2 style={{margin:0, fontFamily:'var(--pg-font-display)', fontSize:17, fontWeight:700, letterSpacing:'-0.01em'}}>{headLbl}</h2>
        <div style={{width:60}}/>
      </div>

      {/* Form */}
      <div style={{flex:1, overflow:'auto', touchAction:'pan-y', padding:'16px 18px', display:'flex', flexDirection:'column', gap:18}}>

        {/* Photos — first field, most impactful */}
        <PhotoPicker
          photos={photos}
          onAdd={url=>setPhotos(p=>[...p, url])}
          onRemove={url=>setPhotos(p=>p.filter(u=>u!==url))}
          max={5}
          cat={cat}
          lang={lang}
        />

        <div style={{height:0, borderTop:'0.5px solid var(--pg-ink-150, var(--pg-ink-200))'}}/>

        {/* Name */}
        <div>
          <FormLabel>{t.modelLbl}</FormLabel>
          <input className="pg-field" value={name} onChange={e=>setName(e.target.value)} placeholder={t.modelPh}/>
        </div>

        {/* Description */}
        <div>
          <FormLabel>{lang==='pt'?'Descrição':lang==='es'?'Descripción':'Description'}</FormLabel>
          <textarea className="pg-field" value={description} onChange={e=>setDescription(e.target.value)}
            rows={3}
            placeholder={lang==='pt'?'Ex: Bomba usada por 2 anos, funcionando perfeitamente. Acompanha manual e cabo elétrico original…':lang==='es'?'Ej: Bomba usada por 2 años, funcionando perfectamente…':'e.g. Used for 2 years, works perfectly. Includes original manual and power cable…'}
            style={{resize:'vertical', minHeight:76, lineHeight:1.5}}/>
        </div>

        {/* Category */}
        <div>
          <FormLabel>{t.categoryLbl}</FormLabel>
          <div style={{display:'flex', gap:7, flexWrap:'wrap'}}>
            {cats.map(c=>(
              <button key={c} onClick={()=>setCat(c)} style={{
                padding:'7px 13px', borderRadius:10, border:'none', cursor:'pointer',
                fontFamily:'inherit', fontSize:12.5, fontWeight:600, transition:'all .12s',
                background: cat===c ? 'var(--pg-blue-500)' : 'var(--pg-ink-100)',
                color: cat===c ? '#fff' : 'var(--pg-ink-700)',
                boxShadow: cat===c ? '0 3px 8px oklch(0.58 0.16 235 / 0.25)' : 'none',
              }}>{catLabels[c]}</button>
            ))}
          </div>
        </div>

        {/* Condition */}
        <div>
          <FormLabel>{t.conditionLbl}</FormLabel>
          <div style={{display:'flex', gap:7, flexWrap:'wrap'}}>
            {conditions.map(c=>(
              <button key={c.id} onClick={()=>setCondition(c.id)} style={{
                padding:'7px 13px', borderRadius:10, border:'none', cursor:'pointer',
                fontFamily:'inherit', fontSize:12.5, fontWeight:600, transition:'all .12s',
                background: condition===c.id ? 'var(--pg-aqua-500)' : 'var(--pg-ink-100)',
                color: condition===c.id ? 'var(--pg-blue-900)' : 'var(--pg-ink-700)',
              }}>{c.label}</button>
            ))}
          </div>
        </div>

        {/* Price */}
        <div>
          <FormLabel>{priceLbl}</FormLabel>

          {/* Multi-period pricing for rent */}
          {isRent && (
            <div style={{display:'flex', flexDirection:'column', gap:10}}>
              {periodOptions.map(p => {
                const on = rentEnabled[p.id];
                return (
                  <div key={p.id} style={{
                    borderRadius:13, border: on ? '1.5px solid var(--pg-blue-500)' : '1.5px solid var(--pg-ink-200)',
                    background: on ? 'rgba(0,122,255,0.04)' : 'var(--pg-ink-50)',
                    overflow:'hidden', transition:'all .15s',
                  }}>
                    {/* Toggle header */}
                    <button onClick={()=>setRentEnabled(prev=>({...prev,[p.id]:!prev[p.id]}))} style={{
                      width:'100%', padding:'12px 14px', border:'none', background:'transparent',
                      cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:10, textAlign:'left',
                    }}>
                      {/* Checkbox */}
                      <div style={{
                        width:20, height:20, borderRadius:6, flexShrink:0,
                        border: on ? '2px solid var(--pg-blue-500)' : '2px solid var(--pg-ink-300)',
                        background: on ? 'var(--pg-blue-500)' : 'transparent',
                        display:'flex', alignItems:'center', justifyContent:'center', transition:'all .12s',
                      }}>
                        {on && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                      <span style={{fontSize:14, fontWeight:700, color: on ? 'var(--pg-blue-500)' : 'var(--pg-ink-700)', flex:1}}>
                        {p.label}
                      </span>
                      {on && rentPrices[p.id] && (
                        <span style={{fontSize:13, fontWeight:800, color:'var(--pg-blue-500)'}}>
                          ${rentPrices[p.id]}{p.sfx}
                        </span>
                      )}
                    </button>
                    {/* Price input — shown when enabled */}
                    {on && (
                      <div style={{padding:'0 14px 14px', position:'relative'}}>
                        <span style={{position:'absolute', left:26, top:'50%', transform:'translateY(-50%)',
                          fontSize:22, fontWeight:700, color:'var(--pg-blue-500)', fontFamily:'var(--pg-font-display)'}}>$</span>
                        <input className="pg-field" value={rentPrices[p.id]}
                          onChange={e=>setRentPrices(prev=>({...prev,[p.id]:e.target.value}))}
                          placeholder="0" type="number"
                          style={{height:52, paddingLeft:36, paddingRight:50,
                            fontSize:22, fontWeight:700, color:'var(--pg-blue-500)', fontFamily:'var(--pg-font-display)'}}/>
                        <span style={{position:'absolute', right:26, top:'50%', transform:'translateY(-50%)',
                          fontSize:13, fontWeight:600, color:'var(--pg-ink-400)'}}>{p.sfx}</span>
                      </div>
                    )}
                  </div>
                );
              })}
              {!hasAnyRentPrice && (
                <div style={{fontSize:12, color:'var(--pg-ink-400)', textAlign:'center', padding:'2px 0'}}>
                  {lang==='pt'?'Selecione pelo menos um período e informe o preço':'Select at least one period and enter a price'}
                </div>
              )}
            </div>
          )}

          {/* Sell: fixed or negotiable */}
          {!isRent && (
            <>
              <div className="pg-seg" style={{marginBottom:10}}>
                <button className={`pg-seg-btn ${priceMode==='fixed'?'on':''}`} onClick={()=>setPriceMode('fixed')}>{t.fixedPrice}</button>
                <button className={`pg-seg-btn ${priceMode==='neg'?'on':''}`} onClick={()=>setPriceMode('neg')}>{t.priceNeg}</button>
              </div>
              {priceMode==='fixed' && (
                <div style={{position:'relative'}}>
                  <span style={{position:'absolute', left:16, top:'50%', transform:'translateY(-50%)',
                    fontSize:22, fontWeight:700, color:'var(--pg-blue-500)', fontFamily:'var(--pg-font-display)'}}>$</span>
                  <input className="pg-field" value={price} onChange={e=>setPrice(e.target.value)}
                    placeholder="0" type="number"
                    style={{height:56, paddingLeft:36, fontSize:22, fontWeight:700,
                      color:'var(--pg-blue-500)', fontFamily:'var(--pg-font-display)'}}/>
                </div>
              )}
            </>
          )}
        </div>

        {/* Location */}
        <div>
          <FormLabel>{t.location}</FormLabel>
          <CityAutocomplete value={loc} onChange={v=>setLoc(v)} lang={lang}/>
        </div>
      </div>

      {/* Submit */}
      <div style={{padding:'12px 18px 20px', borderTop:'0.5px solid var(--pg-ink-200)', flexShrink:0}}>
        {/* Disclaimer — rent only */}
        {isRent && (
          <button onClick={()=>setDisclaimerChecked(v=>!v)} style={{
            display:'flex', alignItems:'flex-start', gap:12,
            width:'100%', padding:'12px 14px', borderRadius:13, marginBottom:12,
            border: disclaimerChecked ? '1.5px solid #0EBAC7' : '1.5px solid var(--pg-ink-200)',
            background: disclaimerChecked ? 'rgba(14,186,199,0.06)' : 'var(--pg-ink-50)',
            cursor:'pointer', textAlign:'left', fontFamily:'inherit',
            transition:'all .15s',
          }}>
            <div style={{
              width:20, height:20, borderRadius:6, flexShrink:0, marginTop:1,
              border: disclaimerChecked ? '2px solid #0EBAC7' : '2px solid var(--pg-ink-300)',
              background: disclaimerChecked ? '#0EBAC7' : 'transparent',
              display:'flex', alignItems:'center', justifyContent:'center',
              transition:'all .12s',
            }}>
              {disclaimerChecked && (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              )}
            </div>
            <div style={{fontSize:12, lineHeight:1.5, color:'var(--pg-ink-700)'}}>
              <b style={{color:'var(--pg-ink-900)', display:'block', marginBottom:2}}>
                {lang==='pt'?'Responsabilidade pelo equipamento':'Equipment Liability'}
              </b>
              {lang==='pt'
                ? 'Declaro que me responsabilizo totalmente pelo equipamento disponibilizado para aluguel. O PoolGuyX não se responsabiliza por perdas, danos ou furtos do equipamento durante o período de aluguel.'
                : 'I acknowledge full responsibility for the equipment listed for rental. PoolGuyX is not liable for any loss, damage, or theft of the equipment during the rental period.'}
            </div>
          </button>
        )}

        <button onClick={()=>{
            // Build rentPrices map from enabled periods with a valid price
            const builtRentPrices = isRent
              ? Object.fromEntries(
                  periodOptions
                    .filter(p => rentEnabled[p.id] && rentPrices[p.id].trim().length > 0)
                    .map(p => [p.id, parseFloat(rentPrices[p.id])])
                )
              : null;
            // cheapest period price for the main price column (used in card/sort)
            const cheapestPrice = isRent
              ? Math.min(...Object.values(builtRentPrices || {}).filter(v=>v>0))
              : (priceMode==='neg' ? 'Negotiable' : price);
            onSubmit && onSubmit({
              type: mode, name, description, cat, condition,
              price: cheapestPrice, priceMode: isRent ? 'fixed' : priceMode,
              loc, rentPeriod: null, rentPrices: builtRentPrices,
              photoUrl: photos[0]||null, photos,
            });
          }}
          disabled={!isValid} className="pg-btn pg-btn-primary"
          style={{width:'100%', height:52, fontSize:16, opacity: isValid ? 1 : 0.45}}>
          {Icon.cart(17,'#fff')} {submitLbl}
        </button>
      </div>
    </div>
  );
}

// ── Post route form ───────────────────────────────────────────
function PostPoolSheet({ lang, t, onClose, onSubmit }) {
  const [title,      setTitle]      = React.useState('');
  const [poolKind,   setPoolKind]   = React.useState('house');
  const [desc,       setDesc]       = React.useState('');
  const [area,       setArea]       = React.useState('');
  const [address,    setAddress]    = React.useState('');   // optional exact address
  const [sizeFt,     setSizeFt]     = React.useState('');
  const [gallons,    setGallons]    = React.useState('');
  const [system,     setSystem]     = React.useState('');
  const [freq,       setFreq]       = React.useState('');
  const [askingPrice, setAskingPrice] = React.useState('');  // Preço de venda (visible on card)
  const [price,       setPrice]       = React.useState('');  // Valor negociado/mês (detail only)
  const [warranty,   setWarranty]   = React.useState('');
  const [wMonths,    setWMonths]    = React.useState('');
  const [photos,     setPhotos]     = React.useState([]);

  const isValid = title.trim().length > 3 && area.trim().length > 0
    && system !== '' && freq !== '' && askingPrice.trim().length > 0 && warranty !== ''
    && (warranty !== 'yes' || wMonths !== '');

  const lbl = (pt, es, en) => lang==='pt'?pt:lang==='es'?es:en;
  const fmtP = v => { if (!v) return ''; const n = parseInt(String(v).replace(/[^\d]/g,''),10); if (isNaN(n)) return ''; const s = n.toLocaleString('en-US'); return lang==='en' ? s : s.replace(/,/g,'.'); };

  const ToggleGroup = ({ value, onChange, options }) => (
    <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
      {options.map(o => {
        const on = value === o.id;
        return (
          <button key={o.id} onClick={()=>onChange(o.id)} style={{
            padding:'8px 16px', borderRadius:10, border:'none', cursor:'pointer',
            fontFamily:'inherit', fontSize:13, fontWeight:600, transition:'all .12s',
            background: on ? 'var(--pg-blue-500)' : 'var(--pg-ink-100)',
            color:      on ? '#fff' : 'var(--pg-ink-700)',
            boxShadow:  on ? '0 2px 8px rgba(0,119,182,0.25)' : 'none',
          }}>{o.label}</button>
        );
      })}
    </div>
  );

  return (
    <div style={{display:'flex', flexDirection:'column', height:'100%'}}>
      {/* Header */}
      <div style={{padding:'8px 18px 14px', borderBottom:'0.5px solid var(--pg-ink-200)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <button onClick={onClose} style={{border:'none', background:'transparent', color:'var(--pg-blue-500)', fontSize:15, fontWeight:600, cursor:'pointer', padding:0}}>{t.cancel}</button>
        <h2 style={{margin:0, fontFamily:'var(--pg-font-display)', fontSize:17, fontWeight:700, letterSpacing:'-0.01em'}}>
          {lbl('Vender piscina avulsa','Vender piscina suelta','Sell single pool')}
        </h2>
        <div style={{width:60}}/>
      </div>

      <div style={{flex:1, overflow:'auto', touchAction:'pan-y', padding:'16px 18px', display:'flex', flexDirection:'column', gap:18}}>

        {/* Title — required */}
        <div>
          <FormLabel>{lbl('Título da publicação *','Título del anuncio *','Listing title *')}</FormLabel>
          <input className="pg-field" value={title} onChange={e=>setTitle(e.target.value)}
            placeholder={lbl('Ex: Piscina à venda em Boca Raton','Ej: Piscina en venta en Boca Raton','e.g. Pool for sale in Boca Raton')}/>
        </div>

        {/* Pool kind */}
        <div>
          <FormLabel>{lbl('Tipo de imóvel *','Tipo de propiedad *','Property type *')}</FormLabel>
          <ToggleGroup value={poolKind} onChange={setPoolKind} options={[
            { id:'house', label: lbl('Casa','Casa','House') },
            { id:'condo', label: lbl('Condomínio','Condominio','Condo') },
          ]}/>
        </div>

        {/* Photos — optional */}
        <PhotoPicker
          photos={photos}
          onAdd={url=>setPhotos(p=>[...p, url])}
          onRemove={url=>setPhotos(p=>p.filter(u=>u!==url))}
          max={5} lang={lang}
          title={lbl('Fotos da piscina (opcional)','Fotos de la piscina (opcional)','Pool photos (optional)')}
        />

        {/* Description */}
        <div>
          <FormLabel>{lbl('Descrição (opcional)','Descripción (opcional)','Description (optional)')}</FormLabel>
          <textarea className="pg-field" value={desc} onChange={e=>setDesc(e.target.value)}
            placeholder={lbl('Descreva a piscina, condição geral, histórico de manutenção…','Describa la piscina, condición general, historial de mantenimiento…','Describe the pool, general condition, maintenance history…')}
            style={{height:90, resize:'none', paddingTop:12, lineHeight:1.5}}/>
        </div>

        {/* Location */}
        <div>
          <FormLabel>{lbl('Cidade','Ciudad','City')}</FormLabel>
          <CityAutocomplete value={area} onChange={v=>setArea(v)} lang={lang}/>
        </div>

        {/* Exact address — optional */}
        <div>
          <FormLabel>{lbl('Endereço (opcional)','Dirección (opcional)','Address (optional)')}</FormLabel>
          <input className="pg-field" value={address} onChange={e=>setAddress(e.target.value)}
            placeholder={lbl('Ex: 1234 NW 5th St, Fort Lauderdale','Ej: 1234 NW 5th St, Fort Lauderdale','e.g. 1234 NW 5th St, Fort Lauderdale')}/>
        </div>

        {/* Pool size */}
        <div style={{display:'flex', gap:12}}>
          <div style={{flex:1}}>
            <FormLabel>{lbl('Tamanho (ex: 10x20 ft)','Tamaño (ej: 10x20 ft)','Size (e.g. 10x20 ft)')}</FormLabel>
            <input className="pg-field" value={sizeFt} onChange={e=>setSizeFt(e.target.value)} placeholder="10x20 ft"/>
          </div>
          <div style={{flex:1}}>
            <FormLabel>{lbl('Capacidade (galões)','Capacidad (galones)','Capacity (gallons)')}</FormLabel>
            <input className="pg-field" value={gallons} onChange={e=>setGallons(e.target.value)} placeholder="15,000" type="number"/>
          </div>
        </div>

        {/* System */}
        <div>
          <FormLabel>{lbl('Sistema','Sistema','System')}</FormLabel>
          <ToggleGroup value={system} onChange={setSystem} options={[
            { id:'chlorine', label: lbl('Cloro','Cloro','Chlorine') },
            { id:'salt',     label: lbl('Sal','Sal','Salt') },
          ]}/>
        </div>

        {/* Frequency */}
        <div>
          <FormLabel>{lbl('Visitas por semana','Visitas por semana','Visits per week')}</FormLabel>
          <ToggleGroup value={freq} onChange={setFreq} options={[
            { id:'1', label:'1x' },
            { id:'2', label:'2x' },
            { id:'3', label:'3x' },
            { id:'7', label: lbl('Diário','Diario','Daily') },
          ]}/>
        </div>

        {/* Asking price (visible on card) */}
        <div>
          <FormLabel>{lbl('Preço da piscina *','Precio de la piscina *','Pool asking price *')}</FormLabel>
          <div style={{fontSize:12, color:'var(--pg-ink-400)', marginBottom:6, lineHeight:1.4}}>
            {lbl('Valor de venda — aparece no card do marketplace.','Precio de venta — aparece en el card del marketplace.','Sale price — shown on the marketplace card.')}
          </div>
          <div style={{position:'relative'}}>
            <span style={{position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', fontSize:22, fontWeight:700, color:'var(--pg-blue-500)', fontFamily:'var(--pg-font-display)'}}>$</span>
            <input className="pg-field" value={fmtP(askingPrice)} onChange={e=>setAskingPrice(e.target.value.replace(/[^\d]/g,''))} placeholder={fmtP('3500')||'3,500'} type="text" inputMode="numeric"
              style={{height:56, paddingLeft:36, fontSize:22, fontWeight:700, color:'var(--pg-blue-500)', fontFamily:'var(--pg-font-display)'}}/>
          </div>
        </div>

        {/* Monthly negotiated price (detail only) */}
        <div>
          <FormLabel>{lbl('Valor negociado por mês (opcional)','Valor negociado por mes (opcional)','Monthly agreed price (optional)')}</FormLabel>
          <div style={{fontSize:12, color:'var(--pg-ink-400)', marginBottom:6, lineHeight:1.4}}>
            {lbl('Valor que o cliente paga por mês — visível apenas dentro da publicação.','Valor que el cliente paga por mes — visible solo dentro del anuncio.','What the client pays monthly — only visible inside the listing detail.')}
          </div>
          <div style={{position:'relative'}}>
            <span style={{position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', fontSize:22, fontWeight:700, color:'var(--pg-blue-500)', fontFamily:'var(--pg-font-display)'}}>$</span>
            <input className="pg-field" value={fmtP(price)} onChange={e=>setPrice(e.target.value.replace(/[^\d]/g,''))} placeholder="120" type="text" inputMode="numeric"
              style={{height:56, paddingLeft:36, fontSize:22, fontWeight:700, color:'var(--pg-blue-500)', fontFamily:'var(--pg-font-display)'}}/>
            <span style={{position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', fontSize:12, color:'var(--pg-ink-500)'}}>{lbl('/mês','/mes','/mo')}</span>
          </div>
        </div>

        {/* Warranty */}
        <div>
          <FormLabel>{lbl('Garantia','Garantía','Warranty')}</FormLabel>
          <ToggleGroup value={warranty} onChange={v=>{ setWarranty(v); if(v==='no') setWMonths(''); }} options={[
            { id:'yes', label: lbl('Sim','Sí','Yes') },
            { id:'no',  label: lbl('Não','No','No') },
          ]}/>
          {warranty === 'yes' && (
            <div style={{marginTop:12}}>
              <FormLabel>{lbl('Meses de garantia','Meses de garantía','Warranty months')}</FormLabel>
              <ToggleGroup value={wMonths} onChange={v=>setWMonths(v)} options={
                Array.from({length:12},(_,i)=>({ id:String(i+1), label:`${i+1} ${lang==='pt'?'mes'+(i===0?'':'es'):lang==='es'?'mes'+(i===0?'':'es'):'mo'+(i===0?'':'s')}` }))
              }/>
            </div>
          )}
        </div>

      </div>

      <div style={{padding:'12px 18px 20px', borderTop:'0.5px solid var(--pg-ink-200)', flexShrink:0}}>
        <button onClick={()=>onSubmit && onSubmit({
            type:'pool', name: title, cat: poolKind, desc, area, address: address||null, sizeFt, gallons, system, freq,
            asking: parseFloat(askingPrice)||0, est: parseFloat(askingPrice)||0,
            price: price ? parseFloat(price)||null : null,
            warranty, warrantyMonths: warranty==='yes' ? wMonths : null,
            photoUrl: photos[0]||null, photoUrls: photos,
          })}
          disabled={!isValid} className="pg-btn pg-btn-primary"
          style={{width:'100%', height:52, fontSize:16, opacity: isValid ? 1 : 0.45}}>
          {lbl('Publicar piscina','Publicar piscina','Post pool')}
        </button>
      </div>
    </div>
  );
}

function PostRouteSheet({ lang, t, onClose, onSubmit }) {
  const [title,     setTitle]     = React.useState('');
  const [poolKind,  setPoolKind]  = React.useState('residential');
  const [clients,   setClients]   = React.useState('');
  const [revenue,   setRevenue]   = React.useState('');
  const [asking,    setAsking]    = React.useState('');
  const [area,      setArea]      = React.useState([]);
  const [cityKey,   setCityKey]   = React.useState(0);
  const [photos,    setPhotos]    = React.useState([]);

  const isValid = title.trim().length > 3 && clients.trim().length > 0 && asking.trim().length > 0;
  const headLbl = t.pmSellRoute;
  const lbl = (pt, es, en) => lang==='pt'?pt:lang==='es'?es:en;
  const fmtP = v => { if (!v) return ''; const n = parseInt(String(v).replace(/[^\d]/g,''),10); if (isNaN(n)) return ''; const s = n.toLocaleString('en-US'); return lang==='en' ? s : s.replace(/,/g,'.'); };
  const ToggleGroup = ({ value, onChange, options }) => (
    <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
      {options.map(o => {
        const on = value === o.id;
        return (
          <button key={o.id} onClick={()=>onChange(o.id)} style={{
            padding:'8px 16px', borderRadius:10, border:'none', cursor:'pointer',
            fontFamily:'inherit', fontSize:13, fontWeight:600, transition:'all .12s',
            background: on ? 'var(--pg-blue-500)' : 'var(--pg-ink-100)',
            color:      on ? '#fff' : 'var(--pg-ink-700)',
            boxShadow:  on ? '0 2px 8px rgba(0,119,182,0.25)' : 'none',
          }}>{o.label}</button>
        );
      })}
    </div>
  );

  return (
    <div style={{display:'flex', flexDirection:'column', height:'100%'}}>
      <div style={{padding:'8px 18px 14px', borderBottom:'0.5px solid var(--pg-ink-200)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <button onClick={onClose} style={{border:'none', background:'transparent', color:'var(--pg-blue-500)', fontSize:15, fontWeight:600, cursor:'pointer', padding:0}}>{t.cancel}</button>
        <h2 style={{margin:0, fontFamily:'var(--pg-font-display)', fontSize:17, fontWeight:700, letterSpacing:'-0.01em'}}>{headLbl}</h2>
        <div style={{width:60}}/>
      </div>

      <div style={{flex:1, overflow:'auto', touchAction:'pan-y', padding:'16px 18px', display:'flex', flexDirection:'column', gap:18}}>

        {/* Title — required */}
        <div>
          <FormLabel>{lbl('Título da publicação *','Título del anuncio *','Listing title *')}</FormLabel>
          <input className="pg-field" value={title} onChange={e=>setTitle(e.target.value)}
            placeholder={lbl('Ex: Rota à venda em Pompano Beach','Ej: Ruta en venta en Pompano Beach','e.g. Route for sale in Pompano Beach')}/>
        </div>

        {/* Client kind */}
        <div>
          <FormLabel>{lbl('Tipo de cliente *','Tipo de cliente *','Client type *')}</FormLabel>
          <ToggleGroup value={poolKind} onChange={setPoolKind} options={[
            { id:'residential', label: lbl('Residencial','Residencial','Residential') },
            { id:'commercial',  label: lbl('Comercial','Comercial','Commercial') },
            { id:'mixed',       label: lbl('Misto','Mixto','Mixed') },
          ]}/>
        </div>

        {/* Photos — optional */}
        <div>
          <PhotoPicker
            photos={photos}
            onAdd={url=>setPhotos(p=>[...p, url])}
            onRemove={url=>setPhotos(p=>p.filter(u=>u!==url))}
            max={5} lang={lang}
            title={lbl('Fotos da rota (opcional)','Fotos de la ruta (opcional)','Route photos (optional)')}
          />
          <p style={{margin:'6px 0 0', fontSize:12, color:'var(--pg-ink-500)', lineHeight:1.4}}>
            {lbl('Pode ser print do Skimmer, PoolBrain, etc.','Puede ser captura de Skimmer, PoolBrain, etc.','Can be a screenshot from Skimmer, PoolBrain, etc.')}
          </p>
        </div>
        <div>
          <FormLabel>{t.clientsLbl}</FormLabel>
          <input className="pg-field" value={clients} onChange={e=>setClients(e.target.value)} placeholder="e.g. 14" type="number"/>
        </div>
        <div>
          <FormLabel>{t.revenueMonthly}</FormLabel>
          <div style={{position:'relative'}}>
            <span style={{position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', fontSize:18, fontWeight:700, color:'var(--pg-aqua-700)', fontFamily:'var(--pg-font-display)'}}>$</span>
            <input className="pg-field" value={fmtP(revenue)} onChange={e=>setRevenue(e.target.value.replace(/[^\d]/g,''))} placeholder={fmtP('3800')||'3,800'} type="text" inputMode="numeric"
              style={{paddingLeft:34, fontSize:18, fontWeight:700, color:'var(--pg-aqua-700)', fontFamily:'var(--pg-font-display)'}}/>
            <span style={{position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', fontSize:12, color:'var(--pg-ink-500)'}}>{lang==='pt'?'/mês':lang==='es'?'/mes':'/mo'}</span>
          </div>
        </div>
        <div>
          <FormLabel>{t.asking}</FormLabel>
          <div style={{position:'relative'}}>
            <span style={{position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', fontSize:22, fontWeight:700, color:'var(--pg-blue-500)', fontFamily:'var(--pg-font-display)'}}>$</span>
            <input className="pg-field" value={fmtP(asking)} onChange={e=>setAsking(e.target.value.replace(/[^\d]/g,''))} placeholder={fmtP('5800')||'5,800'} type="text" inputMode="numeric"
              style={{height:56, paddingLeft:36, fontSize:22, fontWeight:700, color:'var(--pg-blue-500)', fontFamily:'var(--pg-font-display)'}}/>
          </div>
        </div>
        <div>
          <FormLabel>{lbl('Cidades da rota','Ciudades de la ruta','Route cities')}</FormLabel>
          {area.length > 0 && (
            <div style={{display:'flex', flexWrap:'wrap', gap:6, marginBottom:10}}>
              {area.map(city => (
                <div key={city} style={{display:'inline-flex', alignItems:'center', gap:5, background:'var(--pg-blue-100)', color:'var(--pg-blue-700)', borderRadius:20, padding:'5px 10px 5px 12px', fontSize:13, fontWeight:600}}>
                  {city}
                  <button onClick={() => setArea(prev => prev.filter(c => c !== city))} style={{border:'none', background:'transparent', cursor:'pointer', padding:'0 0 0 2px', lineHeight:1, color:'var(--pg-blue-400)', fontSize:17, fontWeight:400}}>×</button>
                </div>
              ))}
            </div>
          )}
          <CityAutocomplete key={cityKey} value='' onChange={v => { if (v && !area.includes(v)) setArea(prev => [...prev, v]); setCityKey(k => k+1); }} lang={lang}/>
        </div>
      </div>

      <div style={{padding:'12px 18px 20px', borderTop:'0.5px solid var(--pg-ink-200)', flexShrink:0}}>
        <button onClick={()=>onSubmit && onSubmit({ type:'route', name: title, cat: poolKind, clients, revenue, asking, area: area.join(', '), photoUrl: photos[0]||null, photoUrls: photos })}
          disabled={!isValid} className="pg-btn pg-btn-primary"
          style={{width:'100%', height:52, fontSize:16, opacity: isValid ? 1 : 0.45}}>
          {Icon.pin(17,'#fff')} {t.postListingBtn}
        </button>
      </div>
    </div>
  );
}

// ── City autocomplete (portal-based — works inside overflow:auto) ──
function CityAutocomplete({ value, onChange, lang }) {
  const [q,        setQ]      = React.useState(value || '');
  const [open,     setOpen]   = React.useState(false);
  const [dropPos,  setDropPos]= React.useState({ top:0, left:0, width:0 });
  const inputRef = React.useRef(null);

  React.useEffect(() => { setQ(value || ''); }, [value]);

  const allCities = React.useMemo(() => {
    const out = [];
    Object.entries(FL_COUNTIES || {}).forEach(([county, cities]) => {
      (cities || []).forEach(city => out.push({ city, county }));
    });
    return out;
  }, []);

  const matches = q.trim().length >= 1
    ? allCities
        .filter(c => c.city.toLowerCase() !== (value || '').toLowerCase())
        .filter(c => c.city.toLowerCase().includes(q.trim().toLowerCase()))
        .slice(0, 6)
    : [];

  const updatePos = () => {
    if (!inputRef.current) return;
    const stage = document.getElementById('stage');
    const sr = stage ? stage.getBoundingClientRect() : { top:0, left:0 };
    const ir = inputRef.current.getBoundingClientRect();
    setDropPos({ top: ir.bottom - sr.top + 4, left: ir.left - sr.left, width: ir.width });
  };

  const pick = (city) => { onChange(city); setQ(city); setOpen(false); };
  const clear = () => { onChange(''); setQ(''); };

  const stage = document.getElementById('stage');
  const dropdown = open && matches.length > 0 && stage
    ? ReactDOM.createPortal(
        <div style={{
          position:'absolute', top: dropPos.top, left: dropPos.left, width: dropPos.width,
          zIndex: 2000, background:'var(--pg-white)', borderRadius:12, padding:6,
          border:'0.5px solid var(--pg-ink-200)',
          boxShadow:'0 8px 24px rgba(15,30,60,0.14)',
        }}>
          {matches.map(m => (
            <button key={m.city}
              onMouseDown={e => { e.preventDefault(); pick(m.city); }}
              onTouchStart={e => { e.preventDefault(); pick(m.city); }}
              style={{
                width:'100%', textAlign:'left', padding:'9px 10px', border:'none',
                background:'transparent', cursor:'pointer', borderRadius:8,
                display:'flex', alignItems:'center', gap:8,
                fontFamily:'inherit', fontSize:13.5,
              }}
              onMouseEnter={e=>e.currentTarget.style.background='var(--pg-blue-50)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              {Icon.pin(13, 'var(--pg-blue-500)')}
              <span style={{flex:1, color:'var(--pg-ink-900)', fontWeight:500}}>{m.city}</span>
              <span style={{fontSize:11, color:'var(--pg-ink-500)'}}>{m.county}</span>
            </button>
          ))}
        </div>,
        stage
      )
    : null;

  return (
    <div style={{position:'relative'}}>
      {value && q === value ? (
        /* ── Selected pill ── */
        <div style={{
          display:'flex', alignItems:'center', gap:8, padding:'10px 12px',
          background:'var(--pg-blue-50)', border:'1px solid var(--pg-blue-400)',
          borderRadius:11, minHeight:46,
        }}>
          {Icon.pin(14, 'var(--pg-blue-700)')}
          <span style={{flex:1, fontSize:13.5, fontWeight:600, color:'var(--pg-blue-700)'}}>{value}</span>
          <button onClick={clear} style={{
            border:'none', background:'rgba(255,255,255,0.7)', cursor:'pointer',
            width:24, height:24, borderRadius:'50%',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>{Icon.x(12, 'var(--pg-blue-700)')}</button>
        </div>
      ) : (
        /* ── Input + search icon ── */
        <>
          <input ref={inputRef} className="pg-field"
            placeholder={lang==='pt'?'Digite a cidade…':lang==='es'?'Escribe la ciudad…':'Type the city…'}
            value={q}
            onChange={e => { setQ(e.target.value); updatePos(); }}
            onFocus={() => { updatePos(); setOpen(true); }}
            onBlur={() => setTimeout(() => setOpen(false), 200)}
            style={{paddingLeft:38, height:44, fontSize:14}}
          />
          <span style={{position:'absolute', left:12, top:22, transform:'translateY(-50%)'}}>
            {Icon.search(15, 'var(--pg-ink-400)')}
          </span>
        </>
      )}
      {dropdown}
    </div>
  );
}

// ── Helper label ──────────────────────────────────────────────
function FormLabel({ children }) {
  return (
    <div style={{fontSize:11, color:'var(--pg-ink-500)', fontWeight:700, letterSpacing:'0.06em', marginBottom:8}}>
      {children.toUpperCase()}
    </div>
  );
}

// ── Description/seller helpers ────────────────────────────────
function descFor(e, lang) {
  const map = {
    Pumps:     { en:'Variable-speed pool pump, lightly used.',          pt:'Bomba de velocidade variável, pouco uso.',          es:'Bomba de velocidad variable, poco uso.' },
    Filters:   { en:'High-rate sand filter, 24-inch tank.',             pt:'Filtro de areia, tanque de 24 polegadas.',          es:'Filtro de arena, tanque de 24 pulgadas.' },
    Vacuum:    { en:'Automatic suction-side pool vacuum, barely used.', pt:'Aspirador automático para piscina, quase sem uso.', es:'Aspirador automático para piscina, casi sin uso.' },
    Heaters:   { en:'Reliable propane pool heater, runs perfectly.',    pt:'Aquecedor a gás confiável, funciona perfeitamente.', es:'Calentador a gas confiable, funciona perfectamente.' },
    Pole:      { en:'Heavy-duty aluminum telescopic pole.',             pt:'Haste telescópica de alumínio reforçada.',          es:'Pértiga telescópica de aluminio reforzada.' },
    Tools:     { en:'Heavy-duty aluminum telescopic pole.',             pt:'Haste telescópica de alumínio reforçada.',          es:'Pértiga telescópica de aluminio reforzada.' },
    Car:       { en:'Pool service vehicle, well maintained.',           pt:'Veículo de serviço de piscina, bem conservado.',    es:'Vehículo de servicio de piscina, bien mantenido.' },
    Jug:       { en:'Chemical dosing jug, 1-gallon capacity.',         pt:'Galão para dosagem de químicos, 1 galão.',          es:'Galón para dosificación de químicos, 1 galón.' },
    Net:       { en:'Leaf skimmer net, fits standard telescopic pole.', pt:'Peneira coletora de folhas, encaixa em hastes padrão.', es:'Red recoge-hojas, compatible con pértigas estándar.' },
    Chemicals: { en:'Pool chemical treatment, balanced formula.',       pt:'Produto químico para piscina, fórmula balanceada.',  es:'Químico para piscina, fórmula balanceada.' },
    Others:    { en:'Pool-related item in good condition.',             pt:'Item relacionado a piscina em bom estado.',         es:'Artículo relacionado con piscina en buen estado.' },
  };
  const fallback = map.Pole;
  return (map[e.category] || fallback)[lang] || (map[e.category] || fallback).en;
}
function sellerFor(e) {
  const sellers = ['PoolPro Mike','AquaServ','FilterKing','RentAPool','BluClear','DesertPools'];
  return sellers[e.id % sellers.length];
}

Object.assign(window, { MarketplaceScreen });
