// marketplace.jsx — navy header + dual seg + distance + categories

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

// ── Share bottom sheet ───────────────────────────────────────
function ShareSheet({ item, lang, onClose, showToast }) {
  if (!item) return null;
  const listingUrl = item._id ? `https://usapoolmarket.com/?listing=${item._id}` : 'https://usapoolmarket.com';
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
      <div style={{position:'relative', height, background:'#e2e8f0', overflow:'hidden', flexShrink:0}}>
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

// ── Mark as Sold Sheet ───────────────────────────────────────────────────────
function MarkSoldSheet({ item, lang, currentUser, onClose, onSold, showToast }) {
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

      // Fetch the seller's pending rating (only pending=true — if already submitted, don't reopen)
      const { data: myRatings } = await window.sb.from('ratings')
        .select('*')
        .eq('listing_id', item._id)
        .eq('from_id', currentUser.uid)
        .eq('pending', true)
        .limit(1);

      const sellerRating = myRatings?.[0] || null;

      showToast && showToast('✅ ' + (lang==='pt'
        ? 'Vendido! Avalie o comprador agora.'
        : 'Sold! Rate the buyer now.'));

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

// ── View Listing Sheet (other users' posts — read-only + contact) ─────────
// canDelete = isAdmin (qualquer post) OR isAuthor (próprio post que chegou aqui sem isMyPost)
function ViewListingSheet({ item, lang, onClose, openChat, openPublicProfile, isAdmin, canDelete, currentUser, showToast, onDeleted, isSaved, onToggleSave, onShare, liveMarket=[], onOpenListing, onAfterSold }) {
  if (!item) return null;
  const [deleting,      setDeleting]     = React.useState(false);
  const [markSoldOpen,  setMarkSoldOpen] = React.useState(false);
  const [imgIdx,        setImgIdx]       = React.useState(0);
  const [viewerOpen,    setViewerOpen]   = React.useState(false);
  const [authorPhotoUrl,setAuthorPhotoUrl] = React.useState(null);
  const [mapCoords,     setMapCoords]    = React.useState(null);
  const [mapLoading,    setMapLoading]   = React.useState(false);
  const [isDesktop,     setIsDesktop]    = React.useState(() => window.innerWidth >= 900);
  // Rental request state
  const isRent = item.type === 'rent';
  const [reqStatus,     setReqStatus]    = React.useState(null); // null|'pending'|'approved'|'declined'
  const [reqLoading,    setReqLoading]   = React.useState(false);
  const [ownerRequests, setOwnerRequests]= React.useState([]); // for owner — list of requests

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
      .select('id, status, requester_id, requester_name, created_at')
      .eq('listing_id', item._id)
      .then(({ data }) => {
        if (!data) return;
        const isOwnerLocal = item.author_id && item.author_id === currentUser.uid;
        if (isOwnerLocal) {
          setOwnerRequests(data);
        } else {
          const mine = data.find(r => r.requester_id === currentUser.uid);
          if (mine) setReqStatus(mine.status);
        }
      })
      .catch(() => {});
  }, [item._id, isRent, currentUser?.uid]); // eslint-disable-line

  // Fetch author profile photo when listing opens
  React.useEffect(() => {
    setAuthorPhotoUrl(null);
    if (!item?.author_id || !window.sb) return;
    window.sb.from('profiles').select('photo_url').eq('id', item.author_id).single()
      .then(({ data }) => { if (data?.photo_url) setAuthorPhotoUrl(data.photo_url); })
      .catch(() => {});
  }, [item?.author_id]);

  // Geocode item.loc via Nominatim (OpenStreetMap — free, no API key)
  React.useEffect(() => {
    setMapCoords(null);
    if (!item?.loc) return;
    setMapLoading(true);
    const q = encodeURIComponent(item.loc + (item.loc.toLowerCase().includes('fl') ? '' : ', FL'));
    fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&email=feedback@usapoolmarket.com`)
      .then(r => r.json())
      .then(data => {
        if (data && data[0]) setMapCoords({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
      })
      .catch(() => {})
      .finally(() => setMapLoading(false));
  }, [item?.loc]);

  const allPhotos = (item.photoUrls && item.photoUrls.length > 0) ? item.photoUrls : (item.photoUrl ? [item.photoUrl] : []);
  const periodSfx = item.type === 'rent'
    ? (item.rentPeriod === 'week' ? (lang==='pt'?'/sem':'/wk') : item.rentPeriod === 'month' ? (lang==='pt'?'/mês':'/mo') : (lang==='pt'?'/dia':'/day'))
    : '';

  const authorDisplay = item.author
    ? (item.author.includes('@') ? item.author.split('@')[0] : item.author)
    : 'Unknown';
  const locationLabel = [item.loc, item.cat].filter(Boolean).join(' · ');
  const timeAgoLabel  = item.createdAt ? timeAgo(item.createdAt, lang) : '';

  const handleContact = () => {
    if (openChat) openChat(item.author_id ? { id: item.author_id, name: item.author || 'Seller' } : (item.author || 'Seller'));
    if (onClose) onClose();
  };

  const handleRequestRental = async () => {
    if (!currentUser?.uid || reqStatus || !window.sb) return;
    setReqLoading(true);
    const { error } = await window.sb.from('rental_requests').insert({
      listing_id: item._id,
      listing_name: item.name || '',
      requester_id: currentUser.uid,
      requester_name: currentUser.name || (currentUser.email||'').split('@')[0] || 'User',
      owner_id: item.author_id,
    });
    setReqLoading(false);
    if (error) { showToast && showToast('❌ ' + (error.message||'Error')); return; }
    setReqStatus('pending');
    showToast && showToast(lang==='pt'?'✓ Pedido enviado! Converse com o dono pela inbox.':'✓ Request sent! Chat with the owner via inbox.');
    // Auto-open chat with owner so they can discuss terms
    if (openChat && item.author_id) {
      setTimeout(() => {
        if (onClose) onClose();
        openChat({ id: item.author_id, name: item.author || 'Owner' });
      }, 600);
    }
  };

  const handleOwnerDecision = async (requestId, newStatus) => {
    if (!window.sb) return;
    const { error } = await window.sb.from('rental_requests')
      .update({ status: newStatus, responded_at: new Date().toISOString() })
      .eq('id', requestId);
    if (error) { showToast && showToast('❌ ' + (error.message||'Error')); return; }
    setOwnerRequests(prev => prev.map(r => r.id === requestId ? {...r, status: newStatus} : r));
    showToast && showToast(newStatus === 'approved'
      ? (lang==='pt'?'✓ Aluguel aprovado!':'✓ Rental approved!')
      : (lang==='pt'?'Pedido recusado':'Request declined'));
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
        const { data } = await window.sb.from('profiles')
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
            ${item.price}
            {periodSfx && <span style={{fontSize: large?16:13, fontWeight:500, color:'var(--pg-ink-400)', marginLeft:3}}>{periodSfx}</span>}
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
        <div style={{fontSize:14, fontWeight:700, color:'var(--pg-ink-900)'}}>{authorDisplay}</div>
        <div style={{fontSize:12, color:'var(--pg-ink-500)', marginTop:1}}>
          {lang==='pt'?'✓ Membro verificado':'✓ Verified member'}
          {timeAgoLabel ? <span style={{color:'var(--pg-ink-400)'}}> · {timeAgoLabel}</span> : null}
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
      <button onClick={handleContact} style={{
        flex:1, height:50, borderRadius:14, border:'none', cursor:'pointer',
        fontFamily:'inherit', fontSize:15, fontWeight:700, color:'#fff',
        background:'linear-gradient(135deg,var(--pg-blue-500),var(--pg-blue-700))',
        boxShadow:'0 4px 16px rgba(0,119,182,0.30)',
        display:'flex', alignItems:'center', justifyContent:'center', gap:8,
        transition:'all .15s',
      }}>
        {Icon.msg(18,'#fff')}
        {lang==='pt'?'Enviar mensagem':lang==='es'?'Enviar mensaje':'Send Message'}
      </button>
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

  // ── Rental request button (for non-owner renters) ─────────────
  const RequestRentalBlock = () => {
    if (!isRent || isOwner || isSold) return null;
    if (reqStatus === 'approved') return (
      <div style={{padding:'13px 16px', borderRadius:14, background:'linear-gradient(135deg,#F0FDF4,#DCFCE7)',
        border:'1.5px solid #86EFAC', display:'flex', alignItems:'center', gap:10}}>
        <div style={{width:30,height:30,borderRadius:'50%',background:'#16A34A',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div>
          <div style={{fontSize:13,fontWeight:800,color:'#15803D'}}>{lang==='pt'?'Aluguel aprovado!':'Rental approved!'}</div>
          <div style={{fontSize:11.5,color:'#16A34A',marginTop:1}}>{lang==='pt'?'O dono aprovou seu pedido.':'The owner approved your request.'}</div>
        </div>
      </div>
    );
    if (reqStatus === 'declined') return (
      <div style={{padding:'12px 14px',borderRadius:14,background:'#FEF2F2',border:'1.5px solid #FCA5A5',display:'flex',alignItems:'center',gap:10}}>
        <span style={{fontSize:18,flexShrink:0}}>❌</span>
        <div style={{fontSize:13,fontWeight:600,color:'#DC2626'}}>{lang==='pt'?'Pedido não aprovado':'Request not approved'}</div>
      </div>
    );
    if (reqStatus === 'pending') return (
      <div style={{padding:'13px 16px',borderRadius:14,background:'#FFFBEB',border:'1.5px solid #FDE68A',display:'flex',alignItems:'center',gap:10}}>
        <span style={{fontSize:16,flexShrink:0}}>⏳</span>
        <div>
          <div style={{fontSize:13,fontWeight:700,color:'#92400E'}}>{lang==='pt'?'Pedido enviado!':'Request sent!'}</div>
          <div style={{fontSize:11.5,color:'#B45309',marginTop:1}}>{lang==='pt'?'Aguardando resposta do dono.':'Waiting for owner\'s response.'}</div>
        </div>
      </div>
    );
    return (
      <button onClick={handleRequestRental} disabled={reqLoading} style={{
        width:'100%', height:52, borderRadius:14, border:'none', cursor: reqLoading?'default':'pointer',
        fontFamily:'inherit', fontSize:15, fontWeight:700, color:'#fff',
        background: reqLoading ? 'var(--pg-ink-300)' : 'linear-gradient(135deg,#0EBAC7,#0891A8)',
        boxShadow:'0 4px 16px rgba(14,186,199,0.35)',
        display:'flex', alignItems:'center', justifyContent:'center', gap:9,
        transition:'all .15s', opacity: reqLoading ? 0.7 : 1,
      }}>
        {reqLoading
          ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeDasharray="31.4" strokeDashoffset="10"/></svg>
          : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        }
        {lang==='pt'?'Solicitar aluguel':lang==='es'?'Solicitar alquiler':'Request Rental'}
      </button>
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
          const isPend = req.status === 'pending';
          const isAppr = req.status === 'approved';
          return (
            <div key={req.id} style={{
              padding:'12px 14px',borderRadius:14,
              background: isAppr ? '#F0FDF4' : isPend ? '#FFFBEB' : '#FEF2F2',
              border: `1.5px solid ${isAppr?'#86EFAC':isPend?'#FDE68A':'#FCA5A5'}`,
            }}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom: isPend ? 10 : 0}}>
                <Avatar name={req.requester_name||'?'} size={32}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:700,color:'var(--pg-ink-900)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{req.requester_name||'User'}</div>
                  <div style={{fontSize:11,color:'var(--pg-ink-500)'}}>
                    {isAppr?(lang==='pt'?'✓ Aprovado':'✓ Approved'):isPend?(lang==='pt'?'⏳ Pendente':'⏳ Pending'):(lang==='pt'?'✗ Recusado':'✗ Declined')}
                  </div>
                </div>
                <button onClick={()=>{ if(openChat) openChat({id:req.requester_id,name:req.requester_name||'User'}); if(onClose)onClose(); }}
                  style={{border:'none',background:'var(--pg-ink-100)',cursor:'pointer',borderRadius:10,
                    width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {Icon.msg(14,'var(--pg-ink-600)')}
                </button>
              </div>
              {isPend && (
                <div style={{display:'flex',gap:8}}>
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
          border:'1.5px solid #86EFAC', background:'#F0FDF4',
          color:'#16A34A', cursor:'pointer', fontFamily:'inherit',
          fontSize:14, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          transition:'all .15s',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
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
                  {m.priceMode==='neg'?(lang==='pt'?'Negociável':'Negotiable'):`$${m.price}`}
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
                    {item.description}
                  </div>
                </div>
              )}

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
                  }}>{item.name}</h1>

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

                {/* Seller — hidden for static demo items */}
                {!isStatic && (
                <div style={{padding:'18px 24px', borderBottom:'1px solid var(--pg-ink-100)'}}>
                  <div style={{fontSize:11, fontWeight:800, color:'var(--pg-ink-400)',
                    letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:12}}>
                    {isRent ? (lang==='pt'?'PROPRIETÁRIO':'OWNER') : (lang==='pt'?'VENDEDOR':lang==='es'?'VENDEDOR':'SELLER')}
                  </div>
                  <SellerRow horizontal/>
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
                  {/* Request Rental (rent items, non-owner, live) */}
                  {isRent && !isOwner && !isStatic && <RequestRentalBlock/>}

                  {/* Demo notice for static items */}
                  {isStatic && (
                    <div style={{padding:'12px 14px', borderRadius:12, background:'var(--pg-blue-50)', border:'1px solid var(--pg-blue-100)',
                      display:'flex', alignItems:'center', gap:10}}>
                      <span style={{fontSize:16, flexShrink:0}}>💡</span>
                      <div style={{fontSize:12, color:'var(--pg-blue-700)', lineHeight:1.5}}>
                        {lang==='pt'
                          ? 'Este é um item demonstrativo. Itens reais são publicados por pool guys cadastrados.'
                          : 'This is a demo item. Real listings are posted by registered pool guys.'}
                      </div>
                    </div>
                  )}

                  {/* Message button — hidden for static items */}
                  {!isStatic && <button onClick={handleContact} style={{
                    width:'100%', height: isRent && !isOwner ? 46 : 52, borderRadius:14, border:'none', cursor:'pointer',
                    fontFamily:'inherit', fontSize: isRent && !isOwner ? 14 : 15, fontWeight:700,
                    color: isRent && !isOwner ? 'var(--pg-blue-700)' : '#fff',
                    background: isRent && !isOwner
                      ? 'transparent'
                      : 'linear-gradient(135deg,var(--pg-blue-500),var(--pg-blue-700))',
                    border: isRent && !isOwner ? '1.5px solid var(--pg-blue-200)' : 'none',
                    boxShadow: isRent && !isOwner ? 'none' : '0 4px 18px rgba(0,119,182,0.30)',
                    display:'flex', alignItems:'center', justifyContent:'center', gap:9,
                    transition:'all .15s',
                  }}>
                    {Icon.msg(18, isRent && !isOwner ? 'var(--pg-blue-700)' : '#fff')}
                    {lang==='pt'?'Enviar mensagem':'Message'}
                  </button>

                  {/* Owner: rental requests panel when no requests yet */}
                  {isRent && isOwner && <OwnerRequestsBlock/>}

                  {/* Mark as Sold (sell items only) */}
                  {!isRent && <MarkSoldBlock/>}
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
        <MarkSoldSheetSlot/>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // ── MOBILE LAYOUT (< 900px) — original design kept ───────────
  // ══════════════════════════════════════════════════════════════
  return (
    <div style={{padding:'0 0 36px'}}>

      {/* ── Photo section — same style as ItemPhotoCarousel ── */}
      <div style={{position:'relative', height:240, overflow:'hidden', background:'#d6dfe8', flexShrink:0}}>
        {allPhotos.length > 0
          ? <img
              src={allPhotos[imgIdx]} alt={item.name}
              onClick={() => setViewerOpen(true)}
              style={{width:'100%', height:'100%', objectFit:'cover', display:'block', cursor: allPhotos.length > 1 ? 'default' : 'zoom-in'}}
            />
          : <NoPhotoPlaceholder height={240}/>
        }

        {/* Back arrow — top left */}
        <button onClick={onClose} style={{
          position:'absolute', top:12, left:12, zIndex:3,
          width:36, height:36, borderRadius:'50%',
          background:'rgba(0,0,0,0.48)', backdropFilter:'blur(6px)',
          border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
          WebkitBackdropFilter:'blur(6px)',
        }}>
          {Icon.chev(20,'#fff','left')}
        </button>

        {/* Type badge — shifted right of back arrow */}
        <span style={{position:'absolute', top:16, left:58, zIndex:2,
          fontSize:10, fontWeight:700, padding:'4px 10px', borderRadius:8,
          background: item.type==='rent' ? 'rgba(14,186,199,0.92)' : 'rgba(59,130,246,0.92)',
          color:'#fff', letterSpacing:'0.06em', backdropFilter:'blur(4px)', textTransform:'uppercase'}}>
          {item.type==='rent' ? (lang==='pt'?'ALUGUEL':lang==='es'?'ALQUILER':'RENTAL')
           : (lang==='pt'?'VENDA':lang==='es'?'VENTA':'FOR SALE')}
        </span>

        {/* Counter badge — top right (only if multiple photos) */}
        {allPhotos.length > 1 && (
          <div style={{position:'absolute', top:12, right:12, zIndex:2,
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
          {item.name}
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
                ${item.price}{periodSfx && <span style={{fontSize:13, fontWeight:500, color:'var(--pg-ink-400)', marginLeft:2}}>{periodSfx}</span>}
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

        {/* Divider + Author row — hidden for static demo items */}
        {!isStatic && <><div className="pg-divider" style={{margin:'14px 0'}}/>
        <button onClick={handleAuthorClick} style={{
          display:'flex', alignItems:'center', gap:12, width:'100%',
          border:'none', background:'transparent', cursor: openPublicProfile ? 'pointer' : 'default',
          textAlign:'left', padding:0, fontFamily:'inherit',
        }}>
          <Avatar name={authorDisplay} size={44} src={authorPhotoUrl || undefined}/>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontSize:14, fontWeight:600, color:'var(--pg-ink-900)'}}>{authorDisplay}</div>
            <div style={{fontSize:12, color:'var(--pg-ink-500)', marginTop:1}}>
              {lang==='pt'?'✓ Membro verificado':lang==='es'?'✓ Miembro verificado':'✓ Verified member'}
              {timeAgoLabel ? <span style={{color:'var(--pg-ink-400)'}}> · {timeAgoLabel}</span> : null}
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

        {/* ── Request Rental (rent items, non-owner, live only) ── */}
        {isRent && !isOwner && !isStatic && (
          <div style={{marginTop:14}}>
            <RequestRentalBlock/>
          </div>
        )}

        {/* Demo notice for static items (mobile) */}
        {isStatic && (
          <div style={{marginTop:14, padding:'12px 14px', borderRadius:12, background:'var(--pg-blue-50)', border:'1px solid var(--pg-blue-100)',
            display:'flex', alignItems:'center', gap:10}}>
            <span style={{fontSize:16}}>💡</span>
            <div style={{fontSize:12, color:'var(--pg-blue-700)', lineHeight:1.5}}>
              {lang==='pt'
                ? 'Item demonstrativo. Itens reais são publicados por pool guys cadastrados.'
                : 'Demo item. Real listings are posted by registered pool guys.'}
            </div>
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

        {/* ── Action buttons (live items only) ── */}
        {!isStatic && <div style={{display:'flex', gap:10, marginTop:14}}>
          {/* Contact Seller */}
          <button onClick={handleContact} className="pg-btn pg-btn-ghost" style={{flex:1, fontSize:14}}>
            {Icon.msg(16,'var(--pg-blue-700)')}
            {lang==='pt'?'Mensagem':lang==='es'?'Mensaje':'Message'}
          </button>

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
        </div>}

        {/* Mark as Sold — for the listing author (sell items only) */}
        {!isRent && item.author_id && currentUser?.uid && item.author_id === currentUser.uid && item.status !== 'sold' && (
          <button onClick={()=>setMarkSoldOpen(true)} style={{
            width:'100%', marginTop:10, padding:'13px', borderRadius:14,
            border:'1.5px solid #86EFAC', background:'#F0FDF4',
            color:'#16A34A', cursor:'pointer', fontFamily:'inherit',
            fontSize:14, fontWeight:700,
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            transition:'all .15s',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
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
                        : `$${m.price}`}
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
    </div>
  );
}

// ── My Post Detail / Edit Sheet ───────────────────────────────
function MyPostDetailSheet({ item, lang, onClose, showToast, onUpdated, onDeleted, openRating }) {
  const [editing, setEditing]   = React.useState(false);
  const [saving,  setSaving]    = React.useState(false);
  const [deleting,setDeleting]  = React.useState(false);
  const [form,    setForm]      = React.useState({
    name:        item.name        || '',
    description: item.description || '',
    price:       item.price       || '',
    priceMode:   item.priceMode   || 'fixed',
    loc:         item.loc         || '',
    condition:   item.condition   || '',
    cat:         item.cat         || '',
  });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const allPhotos = (item.photoUrls && item.photoUrls.length > 0) ? item.photoUrls : (item.photoUrl ? [item.photoUrl] : []);
  const isPending   = item.status === 'pending';
  const statusColor = isPending ? '#D97706' : '#16A34A';
  const statusBg    = isPending ? '#FEF3C7' : '#DCFCE7';
  const statusLabel = isPending
    ? (lang==='pt'?'⏳ Em revisão':lang==='es'?'⏳ En revisión':'⏳ Under review')
    : (lang==='pt'?'✓ Ativo':lang==='es'?'✓ Activo':'✓ Active');

  const periodSfx = item.type === 'rent'
    ? (item.rentPeriod === 'week' ? (lang==='pt'?'/sem':'/wk') : item.rentPeriod === 'month' ? (lang==='pt'?'/mês':'/mo') : (lang==='pt'?'/dia':'/day'))
    : '';

  const handleSave = async () => {
    if (!window.sb) return;
    setSaving(true);
    const patch = {
      name:        form.name,
      description: form.description || null,
      price:       form.price || null,
      price_mode:  form.priceMode,
      loc:         form.loc,
      condition:   form.condition,
      cat:         form.cat,
      status:      'pending',
    };
    const { error } = await window.sb.from('marketplace').update(patch).eq('id', item._id);
    setSaving(false);
    if (error) { if (showToast) showToast('❌ ' + error.message); return; }
    if (showToast) showToast(lang==='pt'?'✓ Anúncio atualizado — aguardando revisão':'✓ Post updated — back under review');
    onUpdated && onUpdated({...item, ...patch});
  };

  const handleDelete = async () => {
    if (!window.sb) return;
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
    <div style={{padding:'0 0 36px'}}>
      {/* Photo carousel with status badge overlay */}
      <div style={{position:'relative'}}>
        <PhotoCarousel urls={allPhotos} fallbackCat={item.cat||'Tools'} height={220}/>
        <span style={{position:'absolute',top:14,left:16,zIndex:2,
          fontSize:11,fontWeight:700,padding:'5px 12px',borderRadius:8,
          background:statusBg,color:statusColor,letterSpacing:'0.03em'}}>
          {statusLabel}
        </span>
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
                {item.priceMode==='neg' ? (
                  <span style={{fontSize:13,fontWeight:700,padding:'5px 12px',borderRadius:999,
                    background:'var(--pg-blue-50)',color:'var(--pg-blue-700)',border:'1px solid var(--pg-blue-100)',whiteSpace:'nowrap'}}>
                    🤝 {lang==='pt'?'Negociável':'Negotiable'}
                  </span>
                ) : (
                  <div>
                    <div style={{fontFamily:'var(--pg-font-display)',fontSize:26,fontWeight:800,color:'var(--pg-blue-500)',letterSpacing:'-0.03em',lineHeight:1}}>
                      {item.price ? `$${Number(item.price).toLocaleString()}` : '—'}
                    </div>
                    {periodSfx && <div style={{fontSize:11,color:'var(--pg-ink-400)',marginTop:2,textAlign:'right'}}>{periodSfx}</div>}
                  </div>
                )}
              </div>
            </div>

            {/* Details pills */}
            <div style={{display:'flex',gap:7,flexWrap:'wrap',marginBottom:14}}>
              {item.condition && <span style={{fontSize:12,fontWeight:600,padding:'4px 11px',borderRadius:999,background:'var(--pg-blue-50)',color:'var(--pg-blue-700)',border:'1px solid var(--pg-blue-100)'}}>{item.condition}</span>}
              {item.type && <span style={{fontSize:12,fontWeight:600,padding:'4px 11px',borderRadius:999,background:'var(--pg-ink-100)',color:'var(--pg-ink-700)'}}>{item.type}</span>}
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

            {/* Action buttons */}
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setEditing(true)} style={{
                flex:1,height:50,borderRadius:14,border:'none',cursor:'pointer',fontFamily:'inherit',
                background:'linear-gradient(135deg,var(--pg-blue-500),var(--pg-blue-700))',
                color:'#fff',fontSize:15,fontWeight:700,
                boxShadow:'0 4px 14px rgba(0,119,182,0.35)',
                display:'flex',alignItems:'center',justifyContent:'center',gap:8,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                {lang==='pt'?'Editar anúncio':lang==='es'?'Editar anuncio':'Edit listing'}
              </button>
              <button onClick={handleDelete} disabled={deleting} style={{
                width:50,height:50,borderRadius:14,border:'1.5px solid #FCA5A5',
                background:'#FEF2F2',color:'#EF4444',cursor:'pointer',
                display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
                opacity:deleting?0.6:1,
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              </button>
            </div>

            {/* Mark as Sold — only for real owner (not admin), only when not yet sold */}
            {!isAdmin && item.status !== 'sold' && (
              <button onClick={()=>setMarkSoldOpen(true)} style={{
                width:'100%', marginTop:10, padding:'13px', borderRadius:14,
                border:'1.5px solid #86EFAC', background:'#F0FDF4',
                color:'#16A34A', cursor:'pointer', fontFamily:'inherit',
                fontSize:14, fontWeight:700,
                display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                transition:'all .15s',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
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
          </>
        ) : (
          /* ── Edit mode ── */
          <>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20}}>
              <button onClick={()=>setEditing(false)} style={{width:34,height:34,borderRadius:'50%',border:'1.5px solid var(--pg-ink-200)',background:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                {Icon.chev(16,'var(--pg-ink-700)','left')}
              </button>
              <div>
                <div style={{fontFamily:'var(--pg-font-display)',fontSize:17,fontWeight:700,color:'var(--pg-ink-900)'}}>
                  {lang==='pt'?'Editar anúncio':lang==='es'?'Editar anuncio':'Edit listing'}
                </div>
                <div style={{fontSize:11.5,color:'var(--pg-ink-400)',marginTop:1}}>
                  {lang==='pt'?'Salvar volta o anúncio para revisão':lang==='es'?'Guardar vuelve el anuncio a revisión':'Saving will send the post back for review'}
                </div>
              </div>
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
              <div>
                {lbl(lang==='pt'?'Localização':'Location')}
                <input {...inp} value={form.loc} onChange={e=>set('loc',e.target.value)}/>
              </div>
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
            </div>

            {/* Review notice */}
            <div style={{margin:'16px 0',padding:'10px 13px',borderRadius:10,background:'#FEF3C7',border:'1px solid #FDE68A',display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontSize:16}}>⚠️</span>
              <span style={{fontSize:12,color:'#92400E',fontWeight:500}}>
                {lang==='pt'?'Ao salvar, o anúncio voltará para revisão do admin.':lang==='es'?'Al guardar, el anuncio volverá a revisión del admin.':'After saving, the listing goes back for admin review.'}
              </span>
            </div>

            <div style={{display:'flex',gap:10}}>
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
  );
}

function MarketplaceScreen({ ctx }) {
  const { lang, user={}, openChat, goTab, openPublicProfile, liveMarket=[], dbWrite, showToast, hasUnreadChat, deepLinkListingId, clearDeepLink, pendingRatings=[], openRating, loadPendingRatings, darkMode=false } = ctx;

  // Normalize a raw Supabase marketplace row to app format
  const normMktItem = (r) => ({ _id:r.id, _live:true, type:r.type, name:r.name, cat:r.cat,
    condition:r.condition, price:r.price, priceMode:r.price_mode,
    loc:r.loc, description:r.description||'',
    author:r.author, author_id:r.author_id||null,
    photoUrl:r.photo_url||null,
    photoUrls:(r.photo_urls&&r.photo_urls.length>0)?r.photo_urls:(r.photo_url?[r.photo_url]:[]),
    rentPeriod:r.rent_period||'day', status:r.status||'pending',
    createdAt:r.created_at||null, soldAt:r.sold_at||null });

  // Returns true if a sold item should still appear in marketplace (< 24h after sold)
  const isSoldRecently = (item) =>
    item.status === 'sold' &&
    item.soldAt &&
    (Date.now() - new Date(item.soldAt).getTime()) < 86400000;

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
  const t = STRINGS[lang];
  const [view,         setView]        = React.useState('buy');
  const [cat,          setCat]         = React.useState('All');
  const [q,            setQ]           = React.useState('');
  const [selected,     setSelected]    = React.useState(null);
  const [myPostDetail, setMyPostDetail]= React.useState(null); // own post detail/edit
  const [viewListing,  setViewListing] = React.useState(null); // other user's post — full-screen view
  const historyPushed = React.useRef(false);
  const [postOpen,   setPostOpen]   = React.useState(false);
  const [postMode,   setPostMode]   = React.useState(null); // 'sell'|'rent'|'route'
  const [priceRange, setPriceRange] = React.useState('all');  // equipment price filter
  const [routeRegion,setRouteRegion]= React.useState('all');  // routes region filter
  const [routePrice, setRoutePrice] = React.useState('all');  // routes price filter
  const [routeSub,   setRouteSub]   = React.useState('routes'); // 'routes' | 'pools'
  const [poolPrice,  setPoolPrice]  = React.useState('all');  // individual pools price filter
  const [savedIds,   setSavedIds]   = React.useState(new Set());
  const [shareItem,  setShareItem]  = React.useState(null);
  const [isDesktop,  setIsDesktop]  = React.useState(() => window.innerWidth >= 900);

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
      .then(({ data }) => { if (data) { setViewListing(normMktItem(data)); historyPushed.current = true; } })
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
    const listingUrl = item._id ? `https://usapoolmarket.com/?listing=${item._id}` : 'https://usapoolmarket.com';
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
    All:{en:'All',pt:'Todos',es:'Todos'},
    Pumps:{en:'Pumps',pt:'Bombas',es:'Bombas'},
    Filters:{en:'Filters',pt:'Filtros',es:'Filtros'},
    Vacuum:{en:'Vacuum',pt:'Aspiradores',es:'Aspiradores'},
    Heaters:{en:'Heaters',pt:'Aquecedores',es:'Calentadores'},
    Tools:{en:'Tools',pt:'Hastes',es:'Herramientas'},
  };
  const cats = Object.keys(catLabels);

  const isEquipment = view === 'buy' || view === 'rent';
  const mode = view === 'rent' ? 'rent' : 'sell';

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
      ? SINGLE_POOLS.filter(p =>
          (routeRegion === 'all' || p.area.toLowerCase().includes(routeRegion.toLowerCase())) &&
          (poolPrice === 'all' ||
           (poolPrice === 'u1500' && p.est < 1500) ||
           (poolPrice === '1500-3k' && p.est >= 1500 && p.est <= 3000) ||
           (poolPrice === 'o3k'   && p.est > 3000))
        )
      : POOL_ROUTES.filter(r =>
          (routeRegion === 'all' || r.area.toLowerCase().includes(routeRegion.toLowerCase())) &&
          (routePrice === 'all' ||
           (routePrice === 'u5k'   && r.est < 5000) ||
           (routePrice === '5k-8k' && r.est >= 5000 && r.est <= 8000) ||
           (routePrice === 'o8k'   && r.est > 8000))
        );

  const tabIcons = {
    buy:    (s,c)=> Icon.cart(s, c),
    rent:   (s,c)=> Icon.key(s, c),
    routes: (s,c)=> Icon.pin(s, c),
  };
  const tabLabels = {
    buy:    lang==='pt'?'Comprar':lang==='es'?'Comprar':'Buy',
    rent:   lang==='pt'?'Alugar':lang==='es'?'Rentar':'Rent',
    routes: lang==='pt'?'Rotas':lang==='es'?'Rutas':'Routes',
  };
  const tabSubs = {
    buy:    lang==='pt'?'Equipamentos à venda':lang==='es'?'Equipo en venta':'Equipment for sale',
    rent:   lang==='pt'?'Para alugar':lang==='es'?'Para rentar':'For rent',
    routes: lang==='pt'?'Rotas · Piscinas avulsas':lang==='es'?'Rutas · Piscinas sueltas':'Routes · Single pools',
  };

  const sellForView = { buy:'sell', rent:'rent', routes:'route' };

  const totalItems = EQUIPMENT.length;
  const totalRoutes = POOL_ROUTES.length;
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
      <button key={item._id} onClick={()=>openListing(item)} className="pg-press"
        style={{
          padding:0, overflow:'hidden', position:'relative', cursor: isSoldItem ? 'default' : 'pointer',
          border: (desktopMode && darkMode)
            ? `1.5px solid ${isSoldItem ? '#30363D' : '#21262D'}`
            : isPending ? '1.5px solid var(--pg-ink-200)' : isSoldItem ? '1.5px solid var(--pg-ink-200)' : '1.5px solid var(--pg-blue-100)',
          opacity: isPending ? 0.82 : isSoldItem ? 0.70 : 1,
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
          filter: isSoldItem ? 'grayscale(0.65)' : 'none',
        }}>
        {/* Photo */}
        <div style={{position:'relative', paddingTop: desktopMode ? '62%' : '72%', background:'#e2e8f0', overflow:'hidden', flexShrink:0}}>
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
          <span style={{position:'absolute', top:10, right:10, fontSize:9, fontWeight:700, padding:'3px 8px', borderRadius:6,
            background:'rgba(0,0,0,0.52)', color:'#fff', letterSpacing:'0.06em', backdropFilter:'blur(4px)', textTransform:'uppercase'}}>
            {item.cat||'Tools'}
          </span>
        </div>
        {/* Content */}
        <div style={{padding: desktopMode ? '14px 16px 16px' : '12px 13px 14px', display:'flex', flexDirection:'column', flex:1}}>
          <div style={{fontSize: desktopMode?15:14, fontWeight:700, letterSpacing:'-0.01em', lineHeight:1.3, color:'var(--pg-ink-900)',
            display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'}}>
            {item.name}
          </div>
          <div style={{fontSize:11.5, color:'var(--pg-ink-500)', marginTop:5, lineHeight:1.4, flex:1,
            display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'}}>
            {item.description||([item.condition,item.loc].filter(Boolean).join(' · ')||'—')}
          </div>
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
                ${item.price}
              </span>
            )}
            <div style={{display:'flex', alignItems:'center', gap:4, minWidth:0}}>
              <div style={{width:20, height:20, borderRadius:'50%',
                background:'linear-gradient(135deg,var(--pg-blue-500),var(--pg-blue-700))',
                display:'flex', alignItems:'center', justifyContent:'center',
                color:'#fff', fontSize:8, fontWeight:700, flexShrink:0}}>
                {(fmtAuthor(item.author)[0]||'?').toUpperCase()}
              </div>
              <span style={{fontSize:11, fontWeight:600, color:'var(--pg-ink-500)',
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', minWidth:0}}>
                {fmtAuthor(item.author)}
              </span>
              {item.createdAt && <span style={{fontSize:10, color:'var(--pg-ink-400)', flexShrink:0}}>· {timeAgo(item.createdAt,lang)}</span>}
            </div>
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
          {canDel && <div onClick={handleQuickDelete} style={{marginTop:8, padding:'6px 0', borderRadius:8,
            background:'#FEF2F2', border:'1px solid #FCA5A5', color:'#EF4444', fontSize:11, fontWeight:700,
            textAlign:'center', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5}}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
            {lang==='pt'?'Excluir':'Delete'}
          </div>}
        </div>
      </button>
    );
  };

  // ══════════════════════════════════════════════════════════════
  // ── DESKTOP LAYOUT (≥ 900px) ─────────────────────────────────
  // ══════════════════════════════════════════════════════════════
  if (isDesktop) {
    const liveEquipment = liveMarket.filter(m => m.type === mode && (
      user.role==='admin' || m.status==='approved' || (m.status==='pending'&&isMyPost(m)) || isSoldRecently(m)
    ));
    return (
      <div style={{position:'relative', width:'100%', height:'100%', overflow:'hidden'}}>
      <div style={{height:'100%', overflowY:'auto', background:'var(--pg-bg)'}}>

        {/* ── HERO HEADER ───────────────────────────────────────── */}
        <div style={{
          background:'linear-gradient(135deg, #011B5A 0%, #0077B6 60%, #023E8A 100%)',
          padding:'28px 40px 32px', position:'relative', overflow:'hidden',
        }}>
          {/* Decorative circles */}
          <div style={{position:'absolute', top:-60, right:-60, width:220, height:220,
            borderRadius:'50%', background:'rgba(255,255,255,0.04)', pointerEvents:'none'}}/>
          <div style={{position:'absolute', bottom:-40, left:200, width:160, height:160,
            borderRadius:'50%', background:'rgba(255,255,255,0.03)', pointerEvents:'none'}}/>

          {/* Top row: branding + actions */}
          <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24}}>
            <div style={{display:'flex', alignItems:'center', gap:14}}>
              <div style={{
                width:52, height:52, borderRadius:16,
                background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.18)',
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
              }}>
                {Icon.cart(24,'#fff')}
              </div>
              <div>
                <div style={{fontSize:10.5, fontWeight:700, color:'rgba(255,255,255,0.50)',
                  letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:3}}>
                  {lang==='pt'?'MARKETPLACE · SUL DA FLÓRIDA':'MARKETPLACE · SOUTH FLORIDA'}
                </div>
                <div style={{fontFamily:'var(--pg-font-display)', fontSize:28, fontWeight:800,
                  color:'#fff', letterSpacing:'-0.03em', lineHeight:1}}>
                  {lang==='pt'?'Sul da Flórida':'South Florida'}
                </div>
                <div style={{fontSize:13, color:'rgba(255,255,255,0.55)', marginTop:4}}>
                  {lang==='pt'?'Compra, aluguel e rotas de piscinas':'Buy, rent and pool routes in Broward · Dade · Palm Beach'}
                </div>
              </div>
            </div>

            {/* Right actions */}
            <div style={{display:'flex', gap:10, alignItems:'center'}}>
              <div style={{position:'relative'}}>
                <button onClick={()=>openChat&&openChat()} style={{
                  width:44, height:44, borderRadius:13,
                  background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.18)',
                  cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                  color:'#fff', transition:'all .15s',
                }}>
                  {Icon.msg(20,'#fff')}
                </button>
                {hasUnreadChat && <span style={{position:'absolute', top:8, right:8, width:8, height:8,
                  borderRadius:'50%', background:'#FF3B30', border:'2px solid #011B5A'}}/>}
              </div>
              <button onClick={()=>{ setPostOpen(true); setPostMode(null); }} style={{
                height:44, padding:'0 20px', borderRadius:13,
                background:'#fff', border:'none', cursor:'pointer',
                fontFamily:'var(--pg-font-display)', fontSize:14, fontWeight:700,
                color:'var(--pg-blue-700)', display:'flex', alignItems:'center', gap:8,
                boxShadow:'0 4px 16px rgba(0,0,0,0.15)', transition:'all .15s',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                {lang==='pt'?'Publicar':lang==='es'?'Publicar':'Post'}
              </button>
            </div>
          </div>

          {/* Search bar */}
          {isEquipment && (
            <div style={{position:'relative', marginBottom:20}}>
              <div style={{
                position:'absolute', left:18, top:'50%', transform:'translateY(-50%)',
                color:'rgba(255,255,255,0.45)', pointerEvents:'none',
              }}>
                {Icon.search(18)}
              </div>
              <input
                value={q} onChange={e=>setQ(e.target.value)}
                placeholder={lang==='pt'?'Buscar equipamentos...':lang==='es'?'Buscar equipos...':'Search equipment...'}
                style={{
                  width:'100%', height:50, paddingLeft:50, paddingRight:20,
                  borderRadius:14, border:'1px solid rgba(255,255,255,0.20)',
                  background:'rgba(255,255,255,0.10)', backdropFilter:'blur(10px)',
                  color:'#fff', fontSize:15, fontFamily:'inherit', outline:'none',
                  boxSizing:'border-box',
                }}
              />
            </div>
          )}

          {/* Stats strip */}
          <div style={{display:'flex', alignItems:'center', gap:20}}>
            {[
              { icon: Icon.cart(14,'rgba(255,255,255,0.80)'), value: totalItems, label: lang==='pt'?'itens à venda':'items for sale' },
              { icon: Icon.pin(14,'rgba(255,255,255,0.80)'),  value: totalRoutes, label: lang==='pt'?'rotas disponíveis':'routes available' },
              { icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.80)" strokeWidth="2" strokeLinecap="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              ), value: '500+', label: lang==='pt'?'pool guys':'pool guys' },
            ].map((s,i) => (
              <div key={i} style={{display:'flex', alignItems:'center', gap:7}}>
                {i > 0 && <div style={{width:1, height:20, background:'rgba(255,255,255,0.15)', marginRight:12}}/>}
                <div style={{
                  width:30, height:30, borderRadius:9,
                  background:'rgba(255,255,255,0.10)', border:'1px solid rgba(255,255,255,0.14)',
                  display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                }}>{s.icon}</div>
                <div>
                  <div style={{fontFamily:'var(--pg-font-display)', fontSize:18, fontWeight:800,
                    color:'#fff', lineHeight:1, letterSpacing:'-0.02em'}}>{s.value}</div>
                  <div style={{fontSize:10, color:'rgba(255,255,255,0.45)', lineHeight:1, marginTop:2, fontWeight:500}}>{s.label}</div>
                </div>
              </div>
            ))}
            <div style={{marginLeft:'auto', display:'flex', alignItems:'center', gap:6,
              background:'rgba(0,119,182,0.25)', border:'1px solid rgba(0,119,182,0.35)',
              borderRadius:999, padding:'6px 14px'}}>
              {Icon.pin(12,'rgba(255,255,255,0.70)')}
              <span style={{fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.75)'}}>
                Broward · Dade · Palm Beach
              </span>
            </div>
          </div>
        </div>

        {/* ── TAB NAVIGATION ────────────────────────────────────── */}
        <div style={{
          background:'var(--pg-white)', borderBottom:'1px solid var(--pg-ink-200)',
          boxShadow:'0 1px 8px rgba(0,0,0,0.05)',
          padding:'0 40px',
          display:'flex', alignItems:'center', gap:0,
          position:'sticky', top:0, zIndex:20,
        }}>
          {[
            { id:'buy',    icon: Icon.cart(18, view==='buy'?'var(--pg-blue-600)':'var(--pg-ink-400)'),
              label: lang==='pt'?'Comprar':'Buy', sub: lang==='pt'?'Equipamentos à venda':'Equipment for sale' },
            { id:'rent',   icon: Icon.key(18, view==='rent'?'var(--pg-blue-600)':'var(--pg-ink-400)'),
              label: lang==='pt'?'Alugar':'Rent', sub: lang==='pt'?'Para alugar':'For rent' },
            { id:'routes', icon: Icon.pin(18, view==='routes'?'var(--pg-blue-600)':'var(--pg-ink-400)'),
              label: lang==='pt'?'Rotas':'Routes', sub: lang==='pt'?'Rotas e piscinas':'Routes & pools' },
          ].map(tab => {
            const on = view === tab.id;
            return (
              <button key={tab.id} onClick={()=>{ setView(tab.id); setCat('All'); setPriceRange('all'); setRouteRegion('all'); setRoutePrice('all'); setRouteSub('routes'); setPoolPrice('all'); setQ(''); }}
                style={{
                  display:'flex', alignItems:'center', gap:10,
                  padding:'16px 24px', borderBottom: on?'2.5px solid var(--pg-blue-500)':'2.5px solid transparent',
                  background:'transparent', border:'none', borderBottom: on?'2.5px solid var(--pg-blue-500)':'2.5px solid transparent',
                  cursor:'pointer', fontFamily:'inherit', transition:'all .15s',
                  marginRight:8,
                }}>
                <div style={{
                  width:36, height:36, borderRadius:10, flexShrink:0,
                  background: on ? 'var(--pg-blue-50)' : 'var(--pg-ink-100)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  transition:'all .15s',
                }}>
                  {tab.icon}
                </div>
                <div style={{textAlign:'left'}}>
                  <div style={{fontSize:14, fontWeight:700, color: on?'var(--pg-blue-600)':'var(--pg-ink-700)', lineHeight:1}}>
                    {tab.label}
                  </div>
                  <div style={{fontSize:11, color:'var(--pg-ink-400)', marginTop:2}}>{tab.sub}</div>
                </div>
              </button>
            );
          })}

          {/* Pending ratings pill */}
          {pendingRatings.length > 0 && (
            <div onClick={()=>openRating&&openRating(pendingRatings[0])} style={{
              marginLeft:'auto', display:'flex', alignItems:'center', gap:8, cursor:'pointer',
              background:'linear-gradient(135deg,#FFFBEB,#FEF3C7)',
              border:'1.5px solid #FDE68A', borderRadius:999, padding:'8px 16px',
            }}>
              <span style={{fontSize:16}}>⭐</span>
              <div>
                <div style={{fontSize:12, fontWeight:700, color:'#92400E', lineHeight:1}}>
                  {pendingRatings.length} {lang==='pt'?'avaliação pendente':'pending rating'}{pendingRatings.length>1?'s':''}
                </div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          )}
        </div>

        {/* ── CONTENT AREA ──────────────────────────────────────── */}
        <div style={{display:'flex', gap:0, maxWidth:'100%', minHeight:'calc(100vh - 280px)'}}>

          {/* ── LEFT SIDEBAR ─────────────────────────────────────── */}
          {isEquipment && (
            <div style={{
              width:220, flexShrink:0,
              background:'var(--pg-white)', borderRight:'1px solid var(--pg-ink-200)',
              padding:'28px 20px', position:'sticky', top:72, height:'calc(100vh - 72px)',
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

              {/* Divider */}
              <div style={{height:1, background:'var(--pg-ink-100)', margin:'24px -20px 24px'}}/>

              {/* Sell prompt */}
              <div style={{
                background:'linear-gradient(135deg,var(--pg-blue-500),var(--pg-blue-700))',
                borderRadius:14, padding:'16px', textAlign:'center',
              }}>
                <div style={{fontSize:13, fontWeight:700, color:'#fff', marginBottom:6, lineHeight:1.3}}>
                  {lang==='pt'?'Tem algo para vender?':'Have something to sell?'}
                </div>
                <div style={{fontSize:11, color:'rgba(255,255,255,0.70)', marginBottom:12}}>
                  {lang==='pt'?'Publique grátis agora':'Post for free in seconds'}
                </div>
                <button onClick={()=>{ setPostOpen(true); setPostMode(null); }} style={{
                  width:'100%', padding:'9px', borderRadius:10,
                  background:'rgba(255,255,255,0.18)', border:'1px solid rgba(255,255,255,0.25)',
                  color:'#fff', fontFamily:'inherit', fontSize:12, fontWeight:700, cursor:'pointer',
                }}>
                  + {lang==='pt'?'Publicar anúncio':'Post listing'}
                </button>
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
                {liveEquipment.length === 0 && list.length === 0 && (
                  <div style={{gridColumn:'1/-1', textAlign:'center', padding:'64px 20px',
                    background:'var(--pg-white)', borderRadius:16, border:'1px solid var(--pg-ink-200)'}}>
                    <div style={{fontSize:40, marginBottom:12}}>🔍</div>
                    <div style={{fontSize:15, fontWeight:700, color:'var(--pg-ink-700)', marginBottom:6}}>
                      {lang==='pt'?'Nenhum item encontrado':'No items found'}
                    </div>
                    <div style={{fontSize:13, color:'var(--pg-ink-400)'}}>
                      {lang==='pt'?'Tente outros filtros ou categorias':'Try different filters or categories'}
                    </div>
                  </div>
                )}
                {/* Static equipment items — shown for all users */}
                {list.map(e => (
                  <button key={e.id} onClick={()=>openListing(normStatic(e))}
                    className="pg-press"
                    style={{border:'none', textAlign:'left', cursor:'pointer', overflow:'hidden', padding:0,
                      borderRadius:16,
                      background: darkMode ? '#1C2128' : 'var(--pg-white)',
                      boxShadow: darkMode ? '0 2px 16px rgba(0,0,0,0.45)' : '0 2px 12px rgba(0,0,0,0.07)',
                      display:'flex', flexDirection:'column',
                      transition:'box-shadow .18s',
                    }}>
                    <div style={{position:'relative', paddingTop:'62%', background:'#e2e8f0', overflow:'hidden', flexShrink:0}}>
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
                          ${e.price}{e.unit&&<span style={{fontSize:11, fontWeight:500, color:'var(--pg-ink-400)', marginLeft:2}}>{tr(e.unit,lang)}</span>}
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
                {/* Sub-tabs */}
                <div style={{display:'flex', gap:10, marginBottom:24}}>
                  {[
                    { id:'routes', label: lang==='pt'?'Rotas (5+ piscinas)':'Routes (5+ pools)' },
                    { id:'pools',  label: lang==='pt'?'Piscinas avulsas (1–4)':'Individual Pools (1–4)' },
                  ].map(s => (
                    <button key={s.id} onClick={()=>setRouteSub(s.id)} style={{
                      padding:'10px 20px', borderRadius:12, border:'none', cursor:'pointer', fontFamily:'inherit',
                      background: routeSub===s.id ? 'var(--pg-blue-500)' : 'var(--pg-white)',
                      color:       routeSub===s.id ? '#fff' : 'var(--pg-ink-600)',
                      fontSize:13, fontWeight:700,
                      border: `1.5px solid ${routeSub===s.id?'var(--pg-blue-500)':'var(--pg-ink-200)'}`,
                      boxShadow: routeSub===s.id ? '0 4px 12px rgba(0,119,182,0.25)' : 'none',
                      transition:'all .15s',
                    }}>{s.label}</button>
                  ))}
                </div>
                {/* Region filter */}
                <div style={{display:'flex', gap:8, flexWrap:'wrap', marginBottom:24}}>
                  {['all','Broward','Dade','Palm Beach'].map(r => (
                    <button key={r} onClick={()=>setRouteRegion(r)} style={{
                      padding:'7px 14px', borderRadius:999, border:'none', cursor:'pointer', fontFamily:'inherit',
                      background: routeRegion===r?'var(--pg-blue-500)':'var(--pg-white)',
                      color:       routeRegion===r?'#fff':'var(--pg-ink-600)',
                      fontSize:12, fontWeight:600,
                      border: `1px solid ${routeRegion===r?'var(--pg-blue-500)':'var(--pg-ink-200)'}`,
                      transition:'all .12s',
                    }}>{r==='all'?(lang==='pt'?'Todas regiões':'All regions'):r}</button>
                  ))}
                </div>
                {/* Route cards in 2-column grid on desktop */}
                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(360px,1fr))', gap:16}}>
                  {list.map(r => (
                    <div key={r.id} style={{
                      background:'var(--pg-white)', borderRadius:16, overflow:'hidden',
                      border:'1px solid var(--pg-ink-200)', boxShadow:'0 2px 12px rgba(0,0,0,0.06)',
                    }}>
                      <div style={{display:'flex', alignItems:'stretch'}}>
                        <div style={{width:100, flexShrink:0, background:'linear-gradient(135deg,var(--pg-blue-600),var(--pg-blue-800))',
                          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4, padding:'16px 8px'}}>
                          {(r.photoUrls&&r.photoUrls[0])||r.photoUrl
                            ? <img src={(r.photoUrls&&r.photoUrls[0])||r.photoUrl} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                            : <>
                                <div style={{fontFamily:'var(--pg-font-display)',fontSize:24,fontWeight:800,color:'#fff',lineHeight:1}}>{r.clients||r.pools||'?'}</div>
                                <div style={{fontSize:9,fontWeight:700,color:'rgba(255,255,255,0.60)',letterSpacing:'0.06em',textTransform:'uppercase'}}>
                                  {routeSub==='pools'?'pools':'POOLS'}
                                </div>
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
                                ${(r.est||r.asking||0).toLocaleString()}
                              </div>
                            </div>
                            <button onClick={()=>openChat&&openChat()} style={{
                              padding:'9px 16px', borderRadius:10, border:'none', cursor:'pointer',
                              background:'var(--pg-blue-500)', color:'#fff',
                              fontFamily:'inherit', fontSize:13, fontWeight:700,
                              boxShadow:'0 3px 10px rgba(0,119,182,0.30)',
                            }}>{t.contact}</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
            currentUser={user} showToast={showToast}
            isSaved={savedIds.has(viewListing._id)}
            onToggleSave={()=>toggleSave(null,viewListing._id)}
            onShare={()=>handleShare(null,viewListing)}
            liveMarket={liveMarket} onOpenListing={openListing}
            onAfterSold={(sellerRating)=>{
              // Mark as sold in local state (realtime subscription will also update liveMarket)
              setViewListing(prev=>prev?{...prev,status:'sold'}:null);
              // Wait for the MarkSoldSheet animation to complete (220ms), then close the
              // listing view and open the rating sheet without any visual overlap/flash
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
      <Sheet open={!!myPostDetail} onClose={()=>setMyPostDetail(null)} height="auto">
        {myPostDetail && <MyPostDetailSheet item={myPostDetail} lang={lang} onClose={()=>setMyPostDetail(null)} showToast={showToast}
          openRating={openRating}
          onUpdated={()=>{ setMyPostDetail(null); if(ctx.liveMarket)ctx.liveMarket.splice(0); }}
          onDeleted={(id)=>{ setMyPostDetail(null); if(ctx&&ctx.removeMarketItem)ctx.removeMarketItem(id); }}/>}
      </Sheet>
      <Sheet open={!!selected} onClose={()=>setSelected(null)} height="78%">
        {selected&&<ListingDetail selected={selected} lang={lang} t={t} catLabels={catLabels} openChat={openChat} onClose={()=>setSelected(null)} openPublicProfile={openPublicProfile}/>}
      </Sheet>
      <Sheet open={postOpen&&!postMode} onClose={()=>setPostOpen(false)} height="auto">
        <MarketplaceListingPicker lang={lang} t={t} currentView={view} onPick={(m)=>setPostMode(m)} onClose={()=>setPostOpen(false)}/>
      </Sheet>
      <Sheet open={postOpen&&(postMode==='sell'||postMode==='rent')} onClose={()=>{setPostMode(null);setPostOpen(false);}} height="86%">
        <PostEquipmentSheet lang={lang} t={t} mode={postMode} onClose={()=>{setPostMode(null);setPostOpen(false);}}
          onSubmit={async(data)=>{ setPostMode(null);setPostOpen(false); if(data&&dbWrite){const ok=await dbWrite('marketplace',data);if(ok!==false&&showToast)showToast(lang==='pt'?'✓ Anúncio enviado para revisão':'✓ Listing sent for review');}}}/>
      </Sheet>
      <Sheet open={postOpen&&postMode==='route'} onClose={()=>{setPostMode(null);setPostOpen(false);}} height="86%">
        <PostRouteSheet lang={lang} t={t} onClose={()=>{setPostMode(null);setPostOpen(false);}}
          onSubmit={async(data)=>{ setPostMode(null);setPostOpen(false); if(data&&dbWrite){const ok=await dbWrite('marketplace',data);if(ok!==false&&showToast)showToast(lang==='pt'?'✓ Rota enviada para revisão':'✓ Route sent for review');}}}/>
      </Sheet>
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
      <NavyBar
        title={
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <div style={{
              width:40, height:40, borderRadius:12, flexShrink:0,
              background:'rgba(255,255,255,0.13)', border:'0.5px solid rgba(255,255,255,0.18)',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              {Icon.cart(20,'#fff')}
            </div>
            <div>
              <div style={{fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.50)', letterSpacing:'0.10em', marginBottom:2, textTransform:'uppercase'}}>{t.marketplace}</div>
              <div style={{fontFamily:'var(--pg-font-display)', fontSize:20, fontWeight:700, letterSpacing:'-0.025em', lineHeight:1.1}}>
                {locationLbl}
              </div>
            </div>
          </div>
        }
        leftBack onBack={()=>goTab('home')}
        right={
          <div style={{position:'relative', display:'inline-flex'}}>
            <IconButton dark onClick={() => openChat && openChat()}>
              {Icon.msg(20, '#fff')}
            </IconButton>
            {hasUnreadChat && <span style={{position:'absolute', top:5, right:5, width:8, height:8, borderRadius:'50%', background:'#FF3B30', border:'1.5px solid #011B5A', pointerEvents:'none'}}/>}
          </div>
        }
      >
        {/* Stats strip below title */}
        <div style={{display:'flex', alignItems:'center', gap:12, marginTop:10, paddingTop:10, borderTop:'1px solid rgba(255,255,255,0.12)'}}>
          <div style={{display:'flex', alignItems:'center', gap:7}}>
            <div style={{
              width:30, height:30, borderRadius:9, background:'rgba(255,255,255,0.13)', border:'0.5px solid rgba(255,255,255,0.16)',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>{Icon.cart(14,'rgba(255,255,255,0.90)')}</div>
            <div>
              <div style={{fontSize:17, fontWeight:800, fontFamily:'var(--pg-font-display)', lineHeight:1, letterSpacing:'-0.02em'}}>{totalItems}</div>
              <div style={{fontSize:10, opacity:0.55, lineHeight:1, marginTop:1.5, fontWeight:500}}>{lang==='pt'?'itens':lang==='es'?'artículos':'items'}</div>
            </div>
          </div>
          <div style={{width:1, height:30, background:'rgba(255,255,255,0.15)'}}/>
          <div style={{display:'flex', alignItems:'center', gap:7}}>
            <div style={{
              width:30, height:30, borderRadius:9, background:'rgba(255,255,255,0.13)', border:'0.5px solid rgba(255,255,255,0.16)',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>{Icon.pin(14,'rgba(255,255,255,0.90)')}</div>
            <div>
              <div style={{fontSize:17, fontWeight:800, fontFamily:'var(--pg-font-display)', lineHeight:1, letterSpacing:'-0.02em'}}>{totalRoutes}</div>
              <div style={{fontSize:10, opacity:0.55, lineHeight:1, marginTop:1.5, fontWeight:500}}>{lang==='pt'?'rotas':lang==='es'?'rutas':'routes'}</div>
            </div>
          </div>
          <div style={{width:1, height:30, background:'rgba(255,255,255,0.15)'}}/>
          <div style={{flex:1, display:'flex', alignItems:'center', gap:5}}>
            <div style={{
              width:30, height:30, borderRadius:9, background:'rgba(0,119,182,0.18)', border:'0.5px solid rgba(0,119,182,0.25)',
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
            }}>{Icon.pin(13,'var(--pg-aqua-400, #2B9FD8)')}</div>
            <div>
              <div style={{fontSize:11, fontWeight:700, lineHeight:1, letterSpacing:'-0.01em'}}>Broward · Dade</div>
              <div style={{fontSize:9.5, opacity:0.50, lineHeight:1, marginTop:2, fontWeight:500}}>Palm Beach</div>
            </div>
          </div>
        </div>
      </NavyBar>

      {/* ── Pending ratings banner ── */}
      {pendingRatings.length > 0 && (
        <div style={{margin:'12px 18px 0', padding:'12px 14px', borderRadius:14,
          background:'linear-gradient(135deg,#FFFBEB,#FEF3C7)', border:'1.5px solid #FDE68A',
          display:'flex', alignItems:'center', gap:12, cursor:'pointer'}}
          onClick={()=>openRating && openRating(pendingRatings[0])}>
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
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6}}>
            {['buy','rent','routes'].map(v => {
              const on = view === v;
              return (
                <button key={v} onClick={()=>{ setView(v); setCat('All'); setPriceRange('all'); setRouteRegion('all'); setRoutePrice('all'); setRouteSub('routes'); setPoolPrice('all'); }} style={{
                  display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4,
                  padding:'10px 6px', borderRadius:11, border:'none', cursor:'pointer',
                  background: on ? 'var(--pg-blue-500)' : 'var(--pg-ink-100)',
                  color: on ? '#fff' : 'var(--pg-ink-700)',
                  fontFamily:'inherit', transition:'all .15s ease',
                  boxShadow: on ? '0 4px 10px oklch(0.58 0.16 235 / 0.30)' : 'none',
                }}>
                  <div style={{
                    width:28, height:28, borderRadius:'50%',
                    background: on ? 'rgba(255,255,255,0.18)' : 'var(--pg-white)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}>{tabIcons[v](15, on ? '#fff' : 'var(--pg-blue-700)')}</div>
                  <span style={{fontSize:13, fontWeight:700, letterSpacing:'-0.005em'}}>{tabLabels[v]}</span>
                  <span style={{fontSize:9.5, opacity:0.75, lineHeight:1.1, textAlign:'center'}}>{tabSubs[v]}</span>
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

              {/* Category chips */}
              <div className="pg-scroll-x" style={{display:'flex', gap:8, marginLeft:-12, marginRight:-12, padding:'2px 12px'}}>
                {cats.map(c => {
                  const on = cat===c;
                  return (
                    <button key={c} className={`pg-chip ${on?'pg-chip-on':''}`} onClick={()=>setCat(c)} style={{padding:'7px 12px'}}>
                      {tr(catLabels[c], lang)}
                    </button>
                  );
                })}
              </div>

              {/* Price filter chips */}
              <div>
                <div style={{fontSize:10, fontWeight:700, letterSpacing:'0.07em', color:'var(--pg-ink-400)', marginBottom:6}}>
                  {lang==='pt'?'PREÇO':lang==='es'?'PRECIO':'PRICE'}
                </div>
                <div style={{display:'flex', gap:7, flexWrap:'wrap'}}>
                  {[
                    {id:'all',     label: lang==='pt'?'Qualquer':lang==='es'?'Cualquier':'Any price'},
                    {id:'u100',    label: '< $100'},
                    {id:'100-500', label: '$100 – $500'},
                    {id:'o500',    label: '$500+'},
                  ].map(opt => {
                    const on = priceRange === opt.id;
                    return (
                      <button key={opt.id} onClick={()=>setPriceRange(opt.id)} style={{
                        padding:'6px 12px', borderRadius:8, border:'none', cursor:'pointer',
                        fontFamily:'inherit', fontSize:12, fontWeight:600, transition:'all .12s',
                        background: on ? 'var(--pg-blue-500)' : 'var(--pg-ink-100)',
                        color:      on ? '#fff' : 'var(--pg-ink-700)',
                        boxShadow:  on ? '0 2px 6px oklch(0.58 0.16 235 / 0.25)' : 'none',
                      }}>{opt.label}</button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Equipment grid */}
        {isEquipment && (
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(155px, 1fr))', gap:12, marginTop:14}}>
            {/* Live user-posted equipment items */}
            {liveMarket
              .filter(m => m.type === mode && (
                user.role === 'admin' ||   // admin vê tudo (pending de qualquer um)
                m.status === 'approved' ||
                (m.status === 'pending' && isMyPost(m)) ||
                isSoldRecently(m)
              ))
              .map(item => {
                const isPending = item.status === 'pending';
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
                    onClick={()=> openListing(item)}
                    className="pg-press"
                    style={{
                      padding:0, overflow:'hidden', position:'relative', cursor: 'pointer',
                      border: isPending ? '1.5px solid var(--pg-ink-200)' : '1.5px solid var(--pg-blue-100)',
                      opacity: isPending ? 0.82 : 1,
                      display:'flex', flexDirection:'column',
                      borderRadius:14, background:'var(--pg-white)', textAlign:'left', fontFamily:'inherit',
                      boxShadow:'0 1px 3px rgba(0,0,0,0.08)',
                    }}>
                    {/* Photo area — enforced 4:3 ratio */}
                    <div style={{position:'relative', paddingTop:'72%', background:'#e2e8f0', overflow:'hidden', flexShrink:0}}>
                      <div style={{position:'absolute', inset:0}}>
                        {item.photoUrl
                          ? <img src={item.photoUrl} alt={item.name} style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                          : <NoPhotoPlaceholder height={'100%'}/>
                        }
                      </div>
                      {/* Gradient overlay for badges */}
                      <div style={{position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(0,0,0,0.28) 0%, transparent 45%, transparent 60%, rgba(0,0,0,0.10) 100%)', pointerEvents:'none'}}/>
                      {/* Status badge top-left — only for own posts */}
                      {isMyPost(item) && (
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
                    <div style={{padding:'12px 13px 14px', display:'flex', flexDirection:'column', flex:1}}>
                      {/* Title */}
                      <div style={{fontSize:14, fontWeight:700, letterSpacing:'-0.01em', lineHeight:1.3, color:'var(--pg-ink-900)',
                        display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'}}>
                        {item.name}
                      </div>
                      {/* Description — show text if available, else condition · location */}
                      <div style={{fontSize:11.5, color:'var(--pg-ink-500)', marginTop:5, lineHeight:1.4, flex:1,
                        display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'}}>
                        {item.description
                          ? item.description
                          : ([item.condition, item.loc].filter(Boolean).join(' · ') || '—')}
                      </div>
                      {/* Divider */}
                      <div style={{height:1, background:'var(--pg-ink-100)', margin:'10px 0'}}/>
                      {/* Price + author — same row, price as badge when negotiable */}
                      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:4}}>
                        {item.priceMode === 'neg' ? (
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
                            ${item.price}{item.type==='rent' && !isPending && <span style={{fontSize:11, fontWeight:500, color:'var(--pg-ink-400)', marginLeft:2}}>
                              {item.rentPeriod==='week' ? (lang==='pt'?'/sem':'/wk') : item.rentPeriod==='month' ? (lang==='pt'?'/mês':'/mo') : (lang==='pt'?'/dia':'/day')}
                            </span>}
                          </span>
                        )}
                        <div style={{display:'flex', alignItems:'center', gap:4, minWidth:0}}>
                          <div style={{width:22, height:22, borderRadius:'50%',
                            background:'linear-gradient(135deg,var(--pg-blue-500),var(--pg-blue-700))',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            color:'#fff', fontSize:9, fontWeight:700, flexShrink:0}}>
                            {(fmtAuthor(item.author)[0]||'?').toUpperCase()}
                          </div>
                          <span style={{fontSize:11, fontWeight:600, color:'var(--pg-ink-600)',
                            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', minWidth:0}}>
                            {fmtAuthor(item.author)}
                          </span>
                          {item.createdAt && (
                            <span style={{fontSize:10, color:'var(--pg-ink-400)', flexShrink:0, marginLeft:2}}>
                              · {timeAgo(item.createdAt, lang)}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Heart + Share row */}
                      {!isMyPost(item) && !isPending && (
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
                      {/* Quick-delete button — admin ou dono do post */}
                      {canAdminDelete && (
                        <div onClick={handleQuickDelete}
                          style={{
                            marginTop:8, padding:'6px 0', borderRadius:8,
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
                    </div>
                  </button>
                );
              })}

            {/* Empty state */}
            {list.length === 0 && liveMarket.filter(m=>m.type===mode && (m.status==='approved'||(m.status==='pending'&&isMyPost(m)))).length === 0 && (
              <div style={{gridColumn:'1/-1', textAlign:'center', padding:'48px 20px'}}>
                <div style={{fontSize:36, marginBottom:12}}>🔍</div>
                <div style={{fontSize:14, fontWeight:600, color:'var(--pg-ink-700)', marginBottom:4}}>
                  {lang==='pt'?'Nenhum item encontrado':lang==='es'?'No se encontraron artículos':'No items found'}
                </div>
                <div style={{fontSize:12, color:'var(--pg-ink-400)'}}>
                  {lang==='pt'?'Tente outros filtros ou categorias':lang==='es'?'Prueba otros filtros o categorías':'Try different filters or categories'}
                </div>
              </div>
            )}

            {/* Static equipment items */}
            {list.map(e => (
              <button key={e.id} onClick={()=>openListing(normStatic(e))}
                className="pg-press"
                style={{border:'none', textAlign:'left', cursor:'pointer', overflow:'hidden', padding:0,
                  borderRadius:14, background:'var(--pg-white)',
                  boxShadow:'0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px var(--pg-ink-200)',
                  display:'flex', flexDirection:'column',
                  transition:'box-shadow .15s, transform .12s',
                }}>
                {/* Photo — 4:3 ratio enforced */}
                <div style={{position:'relative', paddingTop:'72%', background:'#e2e8f0', overflow:'hidden', borderRadius:'14px 14px 0 0', flexShrink:0}}>
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
                        ${e.price}
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
        {view === 'routes' && (
          <div style={{marginTop:14, display:'flex', flexDirection:'column', gap:12}}>

            {/* ── Rotas / Piscinas sub-tab ── */}
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:6}}>
              {[
                { id:'routes', icon: Icon.pin,
                  label: lang==='pt'?'Rotas':lang==='es'?'Rutas':'Routes',
                  sub:   lang==='pt'?'5+ piscinas':lang==='es'?'5+ piscinas':'5+ pools',
                  count: POOL_ROUTES.length },
                { id:'pools',
                  icon: (s,c) => (
                    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12 Q6 8 10 12 Q14 16 18 12 Q20 10 22 12"/>
                      <path d="M2 18 Q6 14 10 18 Q14 22 18 18 Q20 16 22 18"/>
                      <circle cx="12" cy="5" r="2.5"/>
                    </svg>
                  ),
                  label: lang==='pt'?'Piscinas':lang==='es'?'Piscinas':'Pools',
                  sub:   lang==='pt'?'1–4 piscinas avulsas':lang==='es'?'1–4 piscinas sueltas':'1–4 individual pools',
                  count: SINGLE_POOLS.length },
              ].map(tab => {
                const on = routeSub === tab.id;
                return (
                  <button key={tab.id} onClick={()=>{ setRouteSub(tab.id); setRouteRegion('all'); setRoutePrice('all'); setPoolPrice('all'); }} style={{
                    display:'flex', alignItems:'center', gap:10, padding:'11px 12px',
                    borderRadius:12, border: on ? 'none' : '1px solid var(--pg-ink-200)',
                    cursor:'pointer', fontFamily:'inherit', textAlign:'left',
                    background: on ? 'var(--pg-blue-500)' : 'var(--pg-white)',
                    boxShadow: on ? '0 4px 12px rgba(0,119,182,0.25)' : 'none',
                    transition:'all .15s ease',
                  }}>
                    <div style={{
                      width:34, height:34, borderRadius:9, flexShrink:0,
                      background: on ? 'rgba(255,255,255,0.20)' : 'var(--pg-blue-50)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                    }}>
                      {tab.icon(17, on ? '#fff' : 'var(--pg-blue-700)')}
                    </div>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{display:'flex', alignItems:'center', gap:5}}>
                        <span style={{fontSize:14, fontWeight:700, color: on ? '#fff' : 'var(--pg-ink-900)', letterSpacing:'-0.01em'}}>{tab.label}</span>
                        <span style={{
                          fontSize:10, fontWeight:700, padding:'1px 6px', borderRadius:999,
                          background: on ? 'rgba(255,255,255,0.22)' : 'var(--pg-ink-100)',
                          color: on ? '#fff' : 'var(--pg-ink-500)',
                        }}>{tab.count}</span>
                      </div>
                      <div style={{fontSize:10.5, color: on ? 'rgba(255,255,255,0.70)' : 'var(--pg-ink-400)', marginTop:2}}>{tab.sub}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Filters card */}
            <div className="pg-card" style={{padding:'12px 14px', display:'flex', flexDirection:'column', gap:10}}>
              {/* Region filter — shared */}
              <div>
                <div style={{fontSize:10, fontWeight:700, letterSpacing:'0.07em', color:'var(--pg-ink-400)', marginBottom:6}}>
                  {lang==='pt'?'REGIÃO':lang==='es'?'REGIÓN':'REGION'}
                </div>
                <div style={{display:'flex', gap:7, flexWrap:'wrap'}}>
                  {[
                    {id:'all',       label: lang==='pt'?'Todas':lang==='es'?'Todas':'All'},
                    {id:'weston',    label:'Weston'},
                    {id:'coral',     label:'Coral Gables'},
                    {id:'pinecrest', label:'Pinecrest'},
                    {id:'pembroke',  label:'Pembroke'},
                    {id:'hollywood', label:'Hollywood'},
                    {id:'doral',     label:'Doral'},
                    {id:'plantation',label:'Plantation'},
                  ].filter(o => o.id === 'all' || list.some ? true : true).map(opt => {
                    const on = routeRegion === opt.id;
                    return (
                      <button key={opt.id} onClick={()=>setRouteRegion(opt.id)} style={{
                        padding:'5px 11px', borderRadius:8, border:'none', cursor:'pointer',
                        fontFamily:'inherit', fontSize:12, fontWeight:600, transition:'all .12s',
                        background: on ? 'var(--pg-aqua-500)' : 'var(--pg-ink-100)',
                        color:      on ? 'var(--pg-blue-900)' : 'var(--pg-ink-700)',
                        boxShadow:  on ? '0 2px 6px rgba(0,119,182,0.30)' : 'none',
                      }}>{opt.label}</button>
                    );
                  })}
                </div>
              </div>

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
              {(routeRegion !== 'all' || routePrice !== 'all' || poolPrice !== 'all') && (
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between',
                  paddingTop:8, borderTop:'0.5px solid var(--pg-ink-200)'}}>
                  <span style={{fontSize:11.5, color:'var(--pg-blue-600)', fontWeight:600}}>
                    {list.length} {routeSub==='pools'
                      ? (lang==='pt'?'piscina(s) encontrada(s)':lang==='es'?'piscina(s) encontrada(s)':'pool(s) found')
                      : (lang==='pt'?'rota(s) encontrada(s)':lang==='es'?'ruta(s) encontrada(s)':'route(s) found')}
                  </span>
                  <button onClick={()=>{ setRouteRegion('all'); setRoutePrice('all'); setPoolPrice('all'); }} style={{
                    border:'none', background:'var(--pg-ink-100)', borderRadius:6,
                    fontSize:11, fontWeight:600, color:'var(--pg-ink-600)', cursor:'pointer',
                    padding:'4px 9px', fontFamily:'inherit',
                  }}>
                    {lang==='pt'?'Limpar':lang==='es'?'Limpiar':'Clear'}
                  </button>
                </div>
              )}
            </div>

            {/* Escrow notice */}
            <div className="pg-card" style={{
              padding:'11px 14px', display:'flex', alignItems:'center', gap:10,
              background:'var(--pg-aqua-100)', border:'0.5px solid var(--pg-aqua-400)',
            }}>
              {Icon.shield(16,'var(--pg-aqua-700)')}
              <div style={{fontSize:12, color:'var(--pg-aqua-700)', fontWeight:500, lineHeight:1.4}}>
                {t.routesSaleOnly}
              </div>
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
              <div key={r.id} className="pg-card pg-card-tap" onClick={()=>setSelected({...r, _type:'route'})} style={{padding:14, display:'flex', gap:12}}>
                <div style={{width:90, height:90, borderRadius:12, overflow:'hidden', flexShrink:0}}>
                  {(r.photoUrls && r.photoUrls[0]) || r.photoUrl
                    ? <img src={(r.photoUrls&&r.photoUrls[0])||r.photoUrl} alt={r.name} style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                    : <NoPhotoPlaceholder height={90} small/>
                  }
                </div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:3}}>
                    <span className="pg-badge" style={{background:'var(--pg-blue-100)', color:'var(--pg-blue-700)', fontSize:9}}>
                      ROTA
                    </span>
                    <span style={{fontSize:11, color:'var(--pg-ink-400)', fontWeight:500}}>{r.clients} {t.poolsWord}</span>
                  </div>
                  <div style={{fontSize:14, fontWeight:600, letterSpacing:'-0.01em', lineHeight:1.25}}>{tr(r.name, lang)}</div>
                  <div style={{display:'flex', gap:8, alignItems:'center', marginTop:5, flexWrap:'wrap'}}>
                    <span className="pg-chip pg-chip-aqua" style={{padding:'3px 8px', fontSize:11}}>{tr(r.revenue, lang)}</span>
                    <span style={{fontSize:11, color:'var(--pg-ink-500)'}}>{r.area}</span>
                  </div>
                  <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginTop:8}}>
                    <div>
                      <div style={{fontSize:10, color:'var(--pg-ink-400)'}}>{t.asking}</div>
                      <div style={{fontFamily:'var(--pg-font-display)', fontSize:20, fontWeight:700, color:'var(--pg-blue-500)', letterSpacing:'-0.02em'}}>${r.est.toLocaleString()}</div>
                    </div>
                    <button onClick={()=>openChat()} className="pg-btn pg-btn-primary" style={{height:34, padding:'0 14px', fontSize:13}}>
                      {t.contact}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Single Pool cards */}
            {routeSub === 'pools' && list.map(p => (
              <div key={p.id} className="pg-card pg-card-tap" onClick={()=>setSelected({...p, _type:'pool'})} style={{padding:0, overflow:'hidden'}}>
                <div style={{display:'flex', gap:12, padding:'13px 14px'}}>
                  {/* Pool icon / mini image */}
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

                  <div style={{flex:1, minWidth:0}}>
                    <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:3}}>
                      <span className="pg-badge" style={{background:'var(--pg-blue-100)', color:'var(--pg-blue-700)', fontSize:9}}>
                        {p.type === 'condo' ? 'CONDO' : (lang==='pt'?'RESIDENCIAL':lang==='es'?'RESIDENCIAL':'HOUSE')}
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
                    <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginTop:7}}>
                      <div>
                        <div style={{fontSize:10, color:'var(--pg-ink-400)'}}>{t.asking}</div>
                        <div style={{fontFamily:'var(--pg-font-display)', fontSize:20, fontWeight:700, color:'var(--pg-blue-500)', letterSpacing:'-0.02em'}}>${p.est.toLocaleString()}</div>
                      </div>
                      <button onClick={()=>openChat()} className="pg-btn pg-btn-primary" style={{height:34, padding:'0 14px', fontSize:13}}>
                        {t.contact}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Description row */}
                <div style={{
                  borderTop:'0.5px solid var(--pg-ink-100)', padding:'9px 14px',
                  fontSize:12, color:'var(--pg-ink-500)', lineHeight:1.45,
                  display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden',
                }}>
                  {tr(p.desc, lang)}
                </div>
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
            currentUser={user}
            showToast={showToast}
            isSaved={savedIds.has(viewListing._id)}
            onToggleSave={() => toggleSave(null, viewListing._id)}
            onShare={() => handleShare(null, viewListing)}
            liveMarket={liveMarket}
            onOpenListing={openListing}
            onAfterSold={(sellerRating) => {
              // Mark item as sold in local state immediately (no need to wait for realtime)
              setViewListing(prev => prev ? { ...prev, status: 'sold' } : null);
              // Wait for MarkSoldSheet animation to finish before opening RatingSheet
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
      <Sheet open={!!myPostDetail} onClose={()=>setMyPostDetail(null)} height="auto">
        {myPostDetail && <MyPostDetailSheet
          item={myPostDetail} lang={lang}
          onClose={()=>setMyPostDetail(null)}
          showToast={showToast}
          openRating={openRating}
          onUpdated={(updated)=>{
            setMyPostDetail(null);
            if(ctx.liveMarket) ctx.liveMarket.splice(0); // will re-fetch via realtime
          }}
          onDeleted={(id)=>{
            setMyPostDetail(null);
            if (ctx && ctx.removeMarketItem) ctx.removeMarketItem(id);
          }}
        />}
      </Sheet>

      {/* Item detail sheet — outside pg-screen so backdrop covers correctly */}
      <Sheet open={!!selected} onClose={()=>setSelected(null)} height="78%">
        {selected && <ListingDetail selected={selected} lang={lang} t={t} catLabels={catLabels} openChat={openChat} onClose={()=>setSelected(null)} openPublicProfile={openPublicProfile}/>}
      </Sheet>

      {/* New listing picker */}
      <Sheet open={postOpen && !postMode} onClose={()=>setPostOpen(false)} height="auto">
        <MarketplaceListingPicker lang={lang} t={t} currentView={view}
          onPick={(mode)=>{ setPostMode(mode); }}
          onClose={()=>setPostOpen(false)}/>
      </Sheet>

      {/* Sell / Rent equipment form */}
      <Sheet open={postOpen && (postMode==='sell'||postMode==='rent')} onClose={()=>{ setPostMode(null); setPostOpen(false); }} height="86%">
        <PostEquipmentSheet lang={lang} t={t} mode={postMode}
          onClose={()=>{ setPostMode(null); setPostOpen(false); }}
          onSubmit={async (data)=>{
            setPostMode(null); setPostOpen(false);
            if (data && dbWrite) {
              const ok = await dbWrite('marketplace', data);
              if (ok !== false && showToast) showToast(lang==='pt'?'✓ Anúncio enviado para revisão':lang==='es'?'✓ Anuncio enviado a revisión':'✓ Listing sent for review');
            }
          }}/>
      </Sheet>

      {/* Sell route form */}
      <Sheet open={postOpen && postMode==='route'} onClose={()=>{ setPostMode(null); setPostOpen(false); }} height="86%">
        <PostRouteSheet lang={lang} t={t}
          onClose={()=>{ setPostMode(null); setPostOpen(false); }}
          onSubmit={async (data)=>{
            setPostMode(null); setPostOpen(false);
            if (data && dbWrite) {
              const ok = await dbWrite('marketplace', data);
              if (ok !== false && showToast) showToast(lang==='pt'?'✓ Rota enviada para revisão':lang==='es'?'✓ Ruta enviada a revisión':'✓ Route sent for review');
            }
          }}/>
      </Sheet>
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
      sub:   lang==='pt'?'1 a 4 piscinas residenciais ou de cond.':lang==='es'?'1 a 4 piscinas residenciales o cond.':'1–4 residential or condo pools',
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
    <div style={{position:'relative', height, overflow:'hidden', background:'#d6dfe8', flexShrink:0}}>
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
      onClose && onClose();
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
  if (selected._type === 'route') return (
    <div style={{display:'flex', flexDirection:'column', height:'100%'}}>
      <div style={{position:'relative', height:190, flexShrink:0,
        background:'linear-gradient(135deg, #011B5A 0%, #023EBA 55%, #0077B6 100%)',
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10}}>
        <button onClick={onClose} style={{position:'absolute', top:12, right:12,
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
        <div style={{display:'flex', alignItems:'center', gap:5,
          background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.22)',
          borderRadius:999, padding:'4px 12px'}}>
          {Icon.pin(11,'rgba(255,255,255,0.80)')}
          <span style={{fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.80)'}}>{selected.area}</span>
        </div>
      </div>
      <div style={{flex:1, overflowY:'auto', padding:'16px 18px 24px', display:'flex', flexDirection:'column'}}>
        <h2 style={{margin:0, fontFamily:'var(--pg-font-display)', fontSize:20, fontWeight:700, letterSpacing:'-0.02em', lineHeight:1.2}}>
          {tr(selected.name, lang)}
        </h2>
        <div style={{display:'flex', alignItems:'baseline', gap:8, marginTop:10}}>
          <span style={{fontSize:10, color:'var(--pg-ink-400)', fontWeight:700, letterSpacing:'0.06em'}}>{t.asking.toUpperCase()}</span>
          <span style={{fontFamily:'var(--pg-font-display)', fontSize:32, fontWeight:700, color:'var(--pg-blue-500)', letterSpacing:'-0.02em'}}>
            ${selected.est.toLocaleString()}
          </span>
        </div>
        <div style={{display:'flex', alignItems:'flex-start', gap:10, padding:'10px 12px', borderRadius:10,
          background:'var(--pg-aqua-100)', border:'0.5px solid var(--pg-aqua-400)', marginTop:12}}>
          {Icon.shield(14,'var(--pg-aqua-700)')}
          <div style={{fontSize:12, color:'var(--pg-aqua-700)', fontWeight:500, lineHeight:1.4}}>{t.routesSaleOnly}</div>
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

  // ── SINGLE POOL ────────────────────────────────────────────────
  if (selected._type === 'pool') return (
    <div style={{display:'flex', flexDirection:'column', height:'100%'}}>
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
      <div style={{flex:1, overflowY:'auto', padding:'16px 18px 24px'}}>
        <div style={{display:'flex', alignItems:'center', gap:7, marginBottom:6}}>
          <span className="pg-badge" style={{background:'var(--pg-blue-100)', color:'var(--pg-blue-700)', fontSize:9}}>
            {selected.type==='condo' ? 'CONDO' : (lang==='pt'?'RESIDENCIAL':lang==='es'?'RESIDENCIAL':'HOUSE')}
          </span>
          <span style={{fontSize:12, color:'var(--pg-ink-400)'}}>{selected.area}</span>
        </div>
        <h2 style={{margin:0, fontFamily:'var(--pg-font-display)', fontSize:20, fontWeight:700, letterSpacing:'-0.02em', lineHeight:1.2}}>
          {tr(selected.name, lang)}
        </h2>
        <div style={{display:'flex', alignItems:'baseline', gap:8, marginTop:10, flexWrap:'wrap'}}>
          <span style={{fontSize:10, color:'var(--pg-ink-400)', fontWeight:700, letterSpacing:'0.06em'}}>{t.asking.toUpperCase()}</span>
          <span style={{fontFamily:'var(--pg-font-display)', fontSize:32, fontWeight:700, color:'var(--pg-blue-500)', letterSpacing:'-0.02em'}}>
            ${selected.est.toLocaleString()}
          </span>
          <span className="pg-chip" style={{fontSize:11, background:'var(--pg-blue-50)', color:'var(--pg-blue-700)', borderColor:'var(--pg-blue-100)'}}>{tr(selected.revenue, lang)}</span>
        </div>
        <div style={{marginTop:12, fontSize:13, lineHeight:1.55, color:'var(--pg-ink-600)'}}>
          {tr(selected.desc, lang)}
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
          <span style={{fontFamily:'var(--pg-font-display)', fontSize:30, fontWeight:700, color:'var(--pg-blue-500)', letterSpacing:'-0.02em'}}>${selected.price}</span>
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
  const [condition,   setCondition]  = React.useState('likeNew');
  const [price,       setPrice]      = React.useState('');
  const [loc,         setLoc]        = React.useState('');
  const [priceMode,   setPriceMode]  = React.useState('fixed');
  const [rentPeriod,  setRentPeriod] = React.useState('day'); // 'day'|'week'|'month'
  const [photos,      setPhotos]     = React.useState([]);
  const [disclaimerChecked, setDisclaimerChecked] = React.useState(false);

  const isRent = mode === 'rent';
  const headLbl   = isRent ? t.pmRentEq   : t.pmSellEq;
  const priceLbl  = isRent
    ? (lang==='pt'?'Valor do aluguel':lang==='es'?'Valor del alquiler':'Rental rate')
    : (lang==='pt'?'Preço de venda':lang==='es'?'Precio de venta':'Sale price');
  const submitLbl = t.postListingBtn;

  const periodOptions = [
    { id:'day',   label: lang==='pt'?'Por dia':lang==='es'?'Por día':'/day',    sfx: lang==='pt'?'/dia':lang==='es'?'/día':'/day' },
    { id:'week',  label: lang==='pt'?'Por semana':lang==='es'?'Por semana':'/week', sfx: lang==='pt'?'/sem':lang==='es'?'/sem':'/wk' },
    { id:'month', label: lang==='pt'?'Por mês':lang==='es'?'Por mes':'/month',  sfx: lang==='pt'?'/mês':lang==='es'?'/mes':'/mo' },
  ];
  const priceSfx = isRent ? (periodOptions.find(p=>p.id===rentPeriod)?.sfx || '/day') : '';

  const cats = ['Pumps','Filters','Vacuum','Heaters','Tools'];
  const catLabels = { Pumps:lang==='pt'?'Bombas':lang==='es'?'Bombas':'Pumps', Filters:lang==='pt'?'Filtros':lang==='es'?'Filtros':'Filters',
    Vacuum:lang==='pt'?'Aspiradores':lang==='es'?'Aspiradores':'Vacuum', Heaters:lang==='pt'?'Aquecedores':lang==='es'?'Calentadores':'Heaters',
    Tools:lang==='pt'?'Ferramentas':lang==='es'?'Herramientas':'Tools' };

  const conditions = [
    { id:'likeNew', label:t.likeNewLbl },
    { id:'good',    label:t.goodLbl },
    { id:'used',    label:t.usedLbl },
    { id:'parts',   label:t.forPartsLbl },
  ];

  const isValid = name.trim().length > 2 && (priceMode === 'neg' || price.trim().length > 0) && loc.trim().length > 2 && (!isRent || disclaimerChecked);

  return (
    <div style={{display:'flex', flexDirection:'column', height:'100%'}}>
      {/* Header */}
      <div style={{padding:'8px 18px 14px', borderBottom:'0.5px solid var(--pg-ink-200)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <button onClick={onClose} style={{border:'none', background:'transparent', color:'var(--pg-blue-500)', fontSize:15, fontWeight:600, cursor:'pointer', padding:0}}>{t.cancel}</button>
        <h2 style={{margin:0, fontFamily:'var(--pg-font-display)', fontSize:17, fontWeight:700, letterSpacing:'-0.01em'}}>{headLbl}</h2>
        <div style={{width:60}}/>
      </div>

      {/* Form */}
      <div style={{flex:1, overflow:'auto', padding:'16px 18px', display:'flex', flexDirection:'column', gap:18}}>

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

          {/* Rent period selector */}
          {isRent && (
            <div style={{display:'flex', gap:8, marginBottom:12}}>
              {periodOptions.map(p => (
                <button key={p.id} onClick={()=>setRentPeriod(p.id)} style={{
                  flex:1, padding:'10px 6px', borderRadius:12, border:'none', cursor:'pointer',
                  fontFamily:'inherit', fontSize:13, fontWeight:700, transition:'all .12s',
                  background: rentPeriod===p.id ? 'var(--pg-blue-500)' : 'var(--pg-ink-100)',
                  color: rentPeriod===p.id ? '#fff' : 'var(--pg-ink-600)',
                  boxShadow: rentPeriod===p.id ? '0 3px 10px rgba(0,119,182,0.30)' : 'none',
                }}>{p.label}</button>
              ))}
            </div>
          )}

          {!isRent && (
            <div className="pg-seg" style={{marginBottom:10}}>
              <button className={`pg-seg-btn ${priceMode==='fixed'?'on':''}`} onClick={()=>setPriceMode('fixed')}>{t.fixedPrice}</button>
              <button className={`pg-seg-btn ${priceMode==='neg'?'on':''}`} onClick={()=>setPriceMode('neg')}>{t.priceNeg}</button>
            </div>
          )}
          {(isRent || priceMode==='fixed') && (
            <div style={{position:'relative'}}>
              <span style={{position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', fontSize:22, fontWeight:700, color:'var(--pg-blue-500)', fontFamily:'var(--pg-font-display)'}}>$</span>
              <input className="pg-field" value={price} onChange={e=>setPrice(e.target.value)}
                placeholder="0" type="number"
                style={{height:56, paddingLeft:36, fontSize:22, fontWeight:700, color:'var(--pg-blue-500)', fontFamily:'var(--pg-font-display)'}}/>
              {priceSfx && <span style={{position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', fontSize:13, fontWeight:600, color:'var(--pg-ink-400)'}}>{priceSfx}</span>}
            </div>
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
                ? 'Declaro que me responsabilizo totalmente pelo equipamento disponibilizado para aluguel. O PoolGuyPro não se responsabiliza por perdas, danos ou furtos do equipamento durante o período de aluguel.'
                : 'I acknowledge full responsibility for the equipment listed for rental. PoolGuyPro is not liable for any loss, damage, or theft of the equipment during the rental period.'}
            </div>
          </button>
        )}

        <button onClick={()=>onSubmit && onSubmit({ type:mode, name, description, cat, condition, price: priceMode==='neg'?'Negotiable':price, priceMode, loc, rentPeriod: isRent ? rentPeriod : null, photoUrl: photos[0]||null, photos })}
          disabled={!isValid} className="pg-btn pg-btn-primary"
          style={{width:'100%', height:52, fontSize:16, opacity: isValid ? 1 : 0.45}}>
          {Icon.cart(17,'#fff')} {submitLbl}
        </button>
      </div>
    </div>
  );
}

// ── Post route form ───────────────────────────────────────────
function PostRouteSheet({ lang, t, onClose, onSubmit }) {
  const [routeName, setRouteName] = React.useState('');
  const [clients,   setClients]   = React.useState('');
  const [revenue,   setRevenue]   = React.useState('');
  const [asking,    setAsking]    = React.useState('');
  const [area,      setArea]      = React.useState('');
  const [photos,    setPhotos]    = React.useState([]);

  const isValid = routeName.trim().length > 2 && clients.trim().length > 0 && asking.trim().length > 0;
  const headLbl = t.pmSellRoute;

  return (
    <div style={{display:'flex', flexDirection:'column', height:'100%'}}>
      <div style={{padding:'8px 18px 14px', borderBottom:'0.5px solid var(--pg-ink-200)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <button onClick={onClose} style={{border:'none', background:'transparent', color:'var(--pg-blue-500)', fontSize:15, fontWeight:600, cursor:'pointer', padding:0}}>{t.cancel}</button>
        <h2 style={{margin:0, fontFamily:'var(--pg-font-display)', fontSize:17, fontWeight:700, letterSpacing:'-0.01em'}}>{headLbl}</h2>
        <div style={{width:60}}/>
      </div>

      <div style={{flex:1, overflow:'auto', padding:'16px 18px', display:'flex', flexDirection:'column', gap:18}}>

        {/* Photos */}
        <PhotoPicker
          photos={photos}
          onAdd={url=>setPhotos(p=>[...p,url])}
          onRemove={url=>setPhotos(p=>p.filter(u=>u!==url))}
          max={5} lang={lang}
          title={lang==='pt'?'Fotos da rota':lang==='es'?'Fotos de la ruta':'Route photos'}
        />

        <div style={{height:0, borderTop:'0.5px solid var(--pg-ink-200)'}}/>

        {/* Escrow notice */}
        <div style={{
          display:'flex', alignItems:'flex-start', gap:10, padding:'12px 14px', borderRadius:12,
          background:'var(--pg-aqua-100)', border:'0.5px solid var(--pg-aqua-400)',
        }}>
          {Icon.shield(16,'var(--pg-aqua-700)')}
          <div style={{fontSize:12, color:'var(--pg-aqua-700)', fontWeight:500, lineHeight:1.4}}>{t.routesSaleOnly}</div>
        </div>

        <div>
          <FormLabel>{t.routeNameLbl}</FormLabel>
          <input className="pg-field" value={routeName} onChange={e=>setRouteName(e.target.value)} placeholder={t.routeNamePh}/>
        </div>
        <div>
          <FormLabel>{t.clientsLbl}</FormLabel>
          <input className="pg-field" value={clients} onChange={e=>setClients(e.target.value)} placeholder="e.g. 14" type="number"/>
        </div>
        <div>
          <FormLabel>{t.revenueMonthly}</FormLabel>
          <div style={{position:'relative'}}>
            <span style={{position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', fontSize:18, fontWeight:700, color:'var(--pg-aqua-700)', fontFamily:'var(--pg-font-display)'}}>$</span>
            <input className="pg-field" value={revenue} onChange={e=>setRevenue(e.target.value)} placeholder="3,800" type="number"
              style={{paddingLeft:34, fontSize:18, fontWeight:700, color:'var(--pg-aqua-700)', fontFamily:'var(--pg-font-display)'}}/>
            <span style={{position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', fontSize:12, color:'var(--pg-ink-500)'}}>{lang==='pt'?'/mês':lang==='es'?'/mes':'/mo'}</span>
          </div>
        </div>
        <div>
          <FormLabel>{t.asking}</FormLabel>
          <div style={{position:'relative'}}>
            <span style={{position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', fontSize:22, fontWeight:700, color:'var(--pg-blue-500)', fontFamily:'var(--pg-font-display)'}}>$</span>
            <input className="pg-field" value={asking} onChange={e=>setAsking(e.target.value)} placeholder="5,800" type="number"
              style={{height:56, paddingLeft:36, fontSize:22, fontWeight:700, color:'var(--pg-blue-500)', fontFamily:'var(--pg-font-display)'}}/>
          </div>
        </div>
        <div>
          <FormLabel>{t.location}</FormLabel>
          <CityAutocomplete value={area} onChange={v=>setArea(v)} lang={lang}/>
        </div>
      </div>

      <div style={{padding:'12px 18px 20px', borderTop:'0.5px solid var(--pg-ink-200)', flexShrink:0}}>
        <button onClick={()=>onSubmit && onSubmit({ type:'route', routeName, clients, revenue, asking, area, photoUrl: photos[0]||null, photos })}
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
    Pumps:   { en:'Variable-speed pool pump, lightly used.',          pt:'Bomba de velocidade variável, pouco uso.',      es:'Bomba de velocidad variable, poco uso.' },
    Filters: { en:'High-rate sand filter, 24-inch tank.',             pt:'Filtro de areia, tanque de 24 polegadas.',      es:'Filtro de arena, tanque de 24 pulgadas.' },
    Vacuum:  { en:'Automatic suction-side pool vacuum, barely used.', pt:'Aspirador automático para piscina, quase sem uso.', es:'Aspirador automático para piscina, casi sin uso.' },
    Heaters: { en:'Reliable propane pool heater, runs perfectly.',    pt:'Aquecedor a gás confiável, funciona perfeitamente.', es:'Calentador a gas confiable, funciona perfectamente.' },
    Tools:   { en:'Heavy-duty aluminum telescopic pole.',             pt:'Haste telescópica de alumínio reforçada.',      es:'Pértiga telescópica de aluminio reforzada.' },
  };
  return (map[e.category] || map.Tools)[lang] || (map[e.category] || map.Tools).en;
}
function sellerFor(e) {
  const sellers = ['PoolPro Mike','AquaServ','FilterKing','RentAPool','BluClear','DesertPools'];
  return sellers[e.id % sellers.length];
}

Object.assign(window, { MarketplaceScreen });
