// overlays.jsx — chat inbox + conversation, notifications, paywall, post-menu,
//               language picker, applicants sheet

// ── Chat helpers ──────────────────────────────────────────────
function makeConvoId(uidA, uidB) {
  return [uidA, uidB].sort().join('_');
}
function fmtMsgTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const sameDay = now.toDateString() === d.toDateString();
  if (sameDay) return d.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
  const yesterday = new Date(now - 86400000).toDateString() === d.toDateString();
  if (yesterday) return 'Yesterday';
  return d.toLocaleDateString([], { month:'short', day:'numeric' });
}

// ── Chat (inbox + conversation) ───────────────────────────────
function ChatSheet({ open, onClose, lang='en', initialConvo=null, currentUser=null, onUnreadChange=null }) {
  const t = STRINGS[lang];
  const [activeConvo, setActiveConvo] = React.useState(initialConvo);

  React.useEffect(() => { setActiveConvo(initialConvo); }, [initialConvo, open]);
  React.useEffect(() => { if (!open) setTimeout(()=>setActiveConvo(null), 300); }, [open]);

  return (
    <Sheet open={open} onClose={onClose} height="86%">
      {activeConvo
        ? <ChatConversation convo={activeConvo} lang={lang} t={t}
            onBack={()=>{ setActiveConvo(null); if(onUnreadChange) onUnreadChange(); }}
            onClose={onClose} currentUser={currentUser} onUnreadChange={onUnreadChange}/>
        : <ChatInbox lang={lang} t={t} onSelect={setActiveConvo} onClose={onClose} currentUser={currentUser}/>
      }
    </Sheet>
  );
}

function ChatInbox({ lang, t, onSelect, onClose, currentUser }) {
  const [convos,  setConvos]  = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const loadInbox = React.useCallback(async () => {
    if (!window.sb || !currentUser?.uid) { setLoading(false); return; }
    const uid = currentUser.uid;
    const { data } = await window.sb.from('conversations')
      .select('*')
      .or(`participant_1.eq.${uid},participant_2.eq.${uid}`)
      .order('last_message_at', { ascending: false });
    if (!data) { setLoading(false); return; }
    const mapped = data.map(c => {
      const amP1 = c.participant_1 === uid;
      return {
        convoId:    c.id,
        receiverId: amP1 ? c.participant_2 : c.participant_1,
        name:       amP1 ? (c.name_2 || '?') : (c.name_1 || '?'),
        lastMsg:    c.last_message || '',
        lastTime:   c.last_message_at,
        unread:     amP1 ? (c.unread_1 || 0) : (c.unread_2 || 0),
      };
    });
    setConvos(mapped);
    setLoading(false);
  }, [currentUser]);

  React.useEffect(() => { loadInbox(); }, [loadInbox]);

  const totalUnread   = convos.reduce((s, c) => s + c.unread, 0);
  const noChatsLbl    = lang==='pt' ? 'Nenhuma conversa ainda'    : lang==='es' ? 'Sin conversaciones'    : 'No conversations yet';
  const noChatsSubLbl = lang==='pt' ? 'Toque em "Mensagem" em um anúncio para começar.'
                      : lang==='es' ? 'Toca "Mensaje" en un anuncio para empezar.'
                      : 'Tap "Message" on any listing to start.';

  return (
    <div style={{display:'flex', flexDirection:'column', height:'100%'}}>
      {/* Header */}
      <div style={{padding:'4px 16px 12px', borderBottom:'0.5px solid var(--pg-ink-200)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0}}>
        <h2 style={{margin:0, fontSize:20, fontWeight:700, letterSpacing:'-0.02em', display:'flex', alignItems:'center', gap:8}}>
          {t.inboxTitle || 'Messages'}
          {totalUnread > 0 && (
            <span style={{fontSize:11, fontWeight:700, background:'#EF4444', color:'#fff', borderRadius:999, padding:'2px 7px', minWidth:18, textAlign:'center'}}>
              {totalUnread}
            </span>
          )}
        </h2>
        <button onClick={onClose} style={{border:'none', background:'var(--pg-ink-100)', width:30, height:30, borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
          {Icon.x(16,'var(--pg-ink-700)')}
        </button>
      </div>

      {/* List */}
      <div style={{flex:1, overflow:'auto'}}>
        {loading ? (
          <div style={{textAlign:'center', padding:'40px 20px', color:'var(--pg-ink-400)', fontSize:13}}>
            <span style={{fontSize:22, animation:'spin 1s linear infinite'}}>⏳</span>
          </div>
        ) : convos.length === 0 ? (
          <div style={{textAlign:'center', padding:'48px 24px'}}>
            <div style={{width:56, height:56, borderRadius:16, background:'var(--pg-blue-50)', margin:'0 auto 14px', display:'flex', alignItems:'center', justifyContent:'center'}}>
              {Icon.msg(26,'var(--pg-blue-300)')}
            </div>
            <div style={{fontSize:15, fontWeight:700, color:'var(--pg-ink-700)', marginBottom:6}}>{noChatsLbl}</div>
            <div style={{fontSize:13, color:'var(--pg-ink-400)', lineHeight:1.5}}>{noChatsSubLbl}</div>
          </div>
        ) : convos.map(c => (
          <button key={c.convoId} onClick={()=>onSelect(c)} style={{
            display:'flex', alignItems:'center', gap:12, padding:'13px 16px',
            border:'none', background: c.unread > 0 ? 'var(--pg-blue-50)' : 'transparent',
            cursor:'pointer', width:'100%', textAlign:'left',
            borderBottom:'0.5px solid var(--pg-ink-100)', fontFamily:'inherit',
          }}>
            <div style={{position:'relative', flexShrink:0}}>
              <Avatar name={c.name} size={44}/>
              {c.unread > 0 && (
                <span style={{position:'absolute', top:-2, right:-2, minWidth:16, height:16, borderRadius:999,
                  background:'#EF4444', color:'#fff', fontSize:9, fontWeight:700,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  border:'2px solid var(--pg-white)', paddingLeft:2, paddingRight:2}}>
                  {c.unread}
                </span>
              )}
            </div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:8}}>
                <div style={{fontSize:14, fontWeight: c.unread > 0 ? 700 : 600, color:'var(--pg-ink-900)', letterSpacing:'-0.01em'}}>{c.name}</div>
                <div style={{fontSize:11, color: c.unread > 0 ? 'var(--pg-blue-500)' : 'var(--pg-ink-400)', flexShrink:0, fontWeight: c.unread > 0 ? 600 : 400}}>{fmtMsgTime(c.lastTime)}</div>
              </div>
              <div style={{fontSize:12.5, color: c.unread > 0 ? 'var(--pg-ink-700)' : 'var(--pg-ink-500)', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontWeight: c.unread > 0 ? 600 : 400}}>
                {c.lastMsg}
              </div>
            </div>
            {Icon.chev(14,'var(--pg-ink-300)')}
          </button>
        ))}
      </div>
    </div>
  );
}

function ChatConversation({ convo, lang, t, onBack, onClose, currentUser, onUnreadChange }) {
  const isLive  = !!(currentUser?.uid && convo.receiverId);
  const convoId = isLive ? makeConvoId(currentUser.uid, convo.receiverId) : null;

  const [messages,      setMessages]      = React.useState([]);
  const [draft,         setDraft]         = React.useState('');
  const [sending,       setSending]       = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState(null);
  const scroller = React.useRef(null);
  const pollRef  = React.useRef(null);
  const lastCount = React.useRef(0);

  const fmtMsg = React.useCallback((m) => ({
    id:        m.id,
    from:      m.sender_id === currentUser?.uid ? 'me' : 'them',
    text:      m.body,
    time:      fmtMsgTime(m.created_at),
    deleted:   !!m.deleted_at,
    sender_id: m.sender_id,
  }), [currentUser]);

  const loadMessages = React.useCallback(async () => {
    if (!isLive) return;
    const { data } = await window.sb.from('messages')
      .select('*')
      .eq('conversation_id', convoId)
      .order('created_at', { ascending: true });
    if (data) {
      setMessages(data.map(fmtMsg));
      // Auto-scroll only when new messages arrive
      if (data.length !== lastCount.current) {
        lastCount.current = data.length;
        setTimeout(() => {
          if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
        }, 50);
      }
    }
  }, [convoId, isLive, fmtMsg]);

  // On open: load messages, mark as read, set up polling
  React.useEffect(() => {
    if (!isLive) return;
    loadMessages();
    // Mark conversation as read
    window.sb.rpc('mark_chat_read', { p_convo_id: convoId }).catch(()=>{});
    if (onUnreadChange) setTimeout(onUnreadChange, 500);
    pollRef.current = setInterval(loadMessages, 2500);
    return () => clearInterval(pollRef.current);
  }, [convoId]); // eslint-disable-line

  // Initial scroll to bottom
  React.useEffect(() => {
    if (messages.length > 0 && scroller.current) {
      scroller.current.scrollTop = scroller.current.scrollHeight;
    }
  }, []); // eslint-disable-line

  const send = async () => {
    if (!draft.trim() || sending) return;
    setSending(true);
    const text = draft.trim();
    setDraft('');
    if (isLive) {
      const myName = (currentUser.name && !currentUser.name.includes('@'))
        ? currentUser.name
        : (currentUser.email ? currentUser.email.split('@')[0] : 'User');
      // Optimistic UI
      setMessages(prev => [...prev, { id: 'tmp_'+Date.now(), from:'me', text, time: fmtMsgTime(new Date().toISOString()), deleted: false }]);
      setTimeout(() => { if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight; }, 30);
      await window.sb.rpc('send_chat_message', {
        p_convo_id:   convoId,
        p_body:       text,
        p_other_id:   convo.receiverId,
        p_my_name:    myName,
        p_other_name: convo.name,
      });
      await loadMessages();
    } else {
      setMessages(m => [...m, { id: Date.now(), from:'me', text, time: fmtMsgTime(new Date().toISOString()), deleted: false }]);
      setTimeout(() => { if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight; }, 30);
    }
    setSending(false);
  };

  const deleteMsg = async (msg) => {
    setDeleteConfirm(null);
    if (isLive && msg.id && !String(msg.id).startsWith('tmp_')) {
      await window.sb.from('messages').update({ deleted_at: new Date().toISOString() }).eq('id', msg.id);
      await loadMessages();
    } else {
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, deleted: true } : m));
    }
  };

  const deletedLbl       = lang==='pt' ? 'Mensagem apagada'   : lang==='es' ? 'Mensaje eliminado'   : 'Message deleted';
  const deleteLbl        = lang==='pt' ? 'Apagar'             : lang==='es' ? 'Eliminar'             : 'Delete';
  const cancelLbl        = lang==='pt' ? 'Cancelar'           : lang==='es' ? 'Cancelar'             : 'Cancel';
  const confirmDeleteLbl = lang==='pt' ? 'Apagar mensagem?'   : lang==='es' ? '¿Eliminar mensaje?'   : 'Delete message?';

  return (
    <div style={{display:'flex', flexDirection:'column', height:'100%', position:'relative'}}>
      {/* Header */}
      <div style={{display:'flex', alignItems:'center', gap:10, padding:'4px 14px 12px', borderBottom:'0.5px solid var(--pg-ink-200)', flexShrink:0}}>
        <button onClick={onBack} style={{border:'none', background:'transparent', cursor:'pointer', padding:6, color:'var(--pg-blue-600)', display:'flex'}}>
          {Icon.chev(18,'var(--pg-blue-600)','left')}
        </button>
        <Avatar name={convo.name} size={38}/>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontSize:14, fontWeight:600}}>{convo.name}</div>
          {isLive && (
            <div style={{fontSize:11, color:'var(--pg-aqua-700)', display:'flex', alignItems:'center', gap:4}}>
              <span style={{width:6, height:6, borderRadius:'50%', background:'var(--pg-aqua-500)'}}/> Live
            </div>
          )}
        </div>
        <button onClick={onClose} style={{border:'none', background:'var(--pg-ink-100)', width:30, height:30, borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
          {Icon.x(14,'var(--pg-ink-700)')}
        </button>
      </div>

      {/* Messages */}
      <div ref={scroller} style={{flex:1, overflow:'auto', padding:'14px 14px 4px', display:'flex', flexDirection:'column', gap:8}}>
        {messages.length === 0 && isLive && (
          <div style={{textAlign:'center', color:'var(--pg-ink-400)', fontSize:13, marginTop:24}}>
            {lang==='pt' ? '👋 Comece a conversa!' : lang==='es' ? '👋 ¡Inicia la conversación!' : '👋 Start the conversation!'}
          </div>
        )}
        {messages.map(m => (
          <div key={m.id} style={{display:'flex', justifyContent: m.from==='me' ? 'flex-end' : 'flex-start', alignItems:'flex-end', gap:4}}>
            {/* Trash — left of received */}
            {m.from !== 'me' && !m.deleted && (
              <button onClick={() => setDeleteConfirm(m.id)} style={{
                border:'none', background:'transparent', cursor:'pointer', padding:'4px 2px',
                opacity:0.35, flexShrink:0, display:'flex', alignItems:'center',
                transition:'opacity .15s', borderRadius:6,
              }} onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0.35}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--pg-ink-600)" strokeWidth="2.2" strokeLinecap="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6"/><path d="M14 11v6"/>
                </svg>
              </button>
            )}

            <div style={{maxWidth:'75%'}}>
              {m.deleted ? (
                <div style={{padding:'8px 12px', borderRadius:14, fontSize:13, fontStyle:'italic',
                  background: m.from==='me' ? 'oklch(0.75 0.06 235)' : 'var(--pg-ink-150,#e8e8e8)',
                  color: m.from==='me' ? 'rgba(255,255,255,0.55)' : 'var(--pg-ink-400)',
                  borderBottomRightRadius: m.from==='me'?4:14, borderBottomLeftRadius: m.from==='me'?14:4,
                }}>
                  🗑 {deletedLbl}
                </div>
              ) : (
                <div style={{padding:'9px 13px', borderRadius:16, fontSize:14, lineHeight:1.4,
                  background: m.from==='me' ? 'var(--pg-blue-500)' : 'var(--pg-ink-100)',
                  color: m.from==='me' ? '#fff' : 'var(--pg-ink-900)',
                  borderBottomRightRadius: m.from==='me'?4:16, borderBottomLeftRadius: m.from==='me'?16:4,
                  wordBreak:'break-word',
                  opacity: String(m.id).startsWith('tmp_') ? 0.65 : 1,
                }}>{m.text}</div>
              )}
              <div style={{fontSize:10, color:'var(--pg-ink-400)', marginTop:3, padding:'0 4px', textAlign: m.from==='me'?'right':'left'}}>
                {m.time}
              </div>
            </div>

            {/* Trash — right of sent */}
            {m.from === 'me' && !m.deleted && !String(m.id).startsWith('tmp_') && (
              <button onClick={() => setDeleteConfirm(m.id)} style={{
                border:'none', background:'transparent', cursor:'pointer', padding:'4px 2px',
                opacity:0.30, flexShrink:0, display:'flex', alignItems:'center',
                transition:'opacity .15s', borderRadius:6,
              }} onMouseEnter={e=>e.currentTarget.style.opacity=0.9} onMouseLeave={e=>e.currentTarget.style.opacity=0.30}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--pg-blue-200)" strokeWidth="2.2" strokeLinecap="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6"/><path d="M14 11v6"/>
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Delete confirm bottom sheet */}
      {deleteConfirm && (() => {
        const msg = messages.find(m => m.id === deleteConfirm);
        if (!msg) return null;
        return (
          <div style={{position:'absolute', inset:0, background:'rgba(0,0,0,0.42)', zIndex:50, display:'flex', alignItems:'flex-end'}}
            onClick={() => setDeleteConfirm(null)}>
            <div onClick={e=>e.stopPropagation()} style={{
              width:'100%', background:'var(--pg-white)', borderRadius:'18px 18px 0 0',
              padding:'20px 20px 36px', display:'flex', flexDirection:'column', gap:12,
            }}>
              <div style={{fontSize:15, fontWeight:700, textAlign:'center', color:'var(--pg-ink-900)'}}>{confirmDeleteLbl}</div>
              <div style={{padding:'10px 14px', borderRadius:12, background:'var(--pg-ink-100)', fontSize:13.5, color:'var(--pg-ink-700)', lineHeight:1.45, maxHeight:70, overflow:'hidden', textOverflow:'ellipsis'}}>
                {msg.text}
              </div>
              <button onClick={() => deleteMsg(msg)} style={{width:'100%', padding:'14px', border:'none', borderRadius:14, cursor:'pointer', fontFamily:'inherit', fontSize:15, fontWeight:700, background:'#EF4444', color:'#fff'}}>{deleteLbl}</button>
              <button onClick={() => setDeleteConfirm(null)} style={{width:'100%', padding:'12px', border:'1px solid var(--pg-ink-200)', borderRadius:14, cursor:'pointer', fontFamily:'inherit', fontSize:14, fontWeight:600, background:'transparent', color:'var(--pg-ink-700)'}}>{cancelLbl}</button>
            </div>
          </div>
        );
      })()}

      {/* Input */}
      <div style={{padding:'10px 12px 14px', borderTop:'0.5px solid var(--pg-ink-200)', display:'flex', gap:8, alignItems:'flex-end', flexShrink:0}}>
        <div style={{flex:1, background:'var(--pg-ink-100)', borderRadius:18, padding:'10px 14px', display:'flex', alignItems:'center'}}>
          <input value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()}
            placeholder={t.messagePh || 'Type a message…'}
            style={{flex:1, border:'none', background:'transparent', outline:'none', fontSize:14, fontFamily:'inherit'}}/>
        </div>
        <button onClick={send} disabled={sending} className="pg-press" style={{
          width:42, height:42, borderRadius:'50%', border:'none', cursor:'pointer',
          background: draft.trim() ? 'var(--pg-blue-500)' : 'var(--pg-ink-200)',
          color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', transition:'background .15s',
        }}>{Icon.arrow(18,'#fff')}</button>
      </div>
    </div>
  );
}

// ── Language Picker ───────────────────────────────────────────
function LanguagePickerSheet({ open, onClose, lang, setLang }) {
  const t = STRINGS[lang];
  const options = [
    { id:'en', flag:'🇺🇸', label:'English' },
    { id:'pt', flag:'🇧🇷', label:'Português' },
    { id:'es', flag:'🇪🇸', label:'Español' },
  ];
  return (
    <Sheet open={open} onClose={onClose} height="auto">
      <div style={{padding:'4px 18px 30px'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18}}>
          <h2 style={{margin:0, fontSize:18, fontWeight:700, letterSpacing:'-0.01em'}}>{t.chooseLanguage}</h2>
          <button onClick={onClose} style={{border:'none', background:'var(--pg-ink-100)', width:30, height:30, borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
            {Icon.x(16,'var(--pg-ink-700)')}
          </button>
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:8}}>
          {options.map(opt => {
            const active = lang === opt.id;
            return (
              <button key={opt.id} onClick={()=>{ setLang(opt.id); onClose(); }}
                className="pg-press" style={{
                  display:'flex', alignItems:'center', gap:16, padding:'14px 16px', borderRadius:14,
                  cursor:'pointer', fontFamily:'inherit', textAlign:'left',
                  border: active ? '2px solid var(--pg-blue-500)' : '1px solid var(--pg-ink-200)',
                  background: active ? 'var(--pg-blue-50)' : 'var(--pg-white)',
                }}>
                <span style={{fontSize:28}}>{opt.flag}</span>
                <span style={{flex:1, fontSize:16, fontWeight:600, color:active?'var(--pg-blue-700)':'var(--pg-ink-900)'}}>{opt.label}</span>
                {active && (
                  <div style={{width:22, height:22, borderRadius:'50%', background:'var(--pg-blue-500)', display:'flex', alignItems:'center', justifyContent:'center'}}>
                    {Icon.check(13,'#fff')}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </Sheet>
  );
}

// ── Applicants Sheet ──────────────────────────────────────────
function ApplicantsSheet({ open, onClose, post, lang='en', onChat }) {
  const t = STRINGS[lang];
  const [applicants, setApplicants] = React.useState([]);
  const [conflictInfo, setConflictInfo] = React.useState(null);
  const [profileApp, setProfileApp] = React.useState(null);
  const [schedulingFor, setSchedulingFor] = React.useState(null); // applicant scheduling interview
  const [rejectingFor,  setRejectingFor]  = React.useState(null); // applicant showing reason input
  const [rejectReason,  setRejectReason]  = React.useState('');
  // conflictInfo: { applicantId, conflicts: [{day, takenBy}] }

  React.useEffect(() => {
    if (post) { setApplicants(post.applicants.map(a=>({...a}))); setConflictInfo(null); setSchedulingFor(null); setRejectingFor(null); setRejectReason(''); }
  }, [post]);

  const scheduleInterview = (applicantId, interview) => {
    setApplicants(prev => prev.map(a => a.id===applicantId ? {...a, interview, status:'accepted'} : a));
    setSchedulingFor(null);
  };

  if (!post) return null;

  const updateStatus = (id, status) => {
    setApplicants(prev => prev.map(a => a.id===id ? {...a, status} : a));
  };

  // Build day→owner map from post.bookedDays + currently accepted applicants
  const buildBookedMap = (appsSnapshot) => {
    const map = {};
    (post.bookedDays || []).forEach(d => {
      map[d] = lang==='pt'?'reserva anterior':lang==='es'?'reserva anterior':'previous booking';
    });
    appsSnapshot
      .filter(a => a.status === 'accepted' && a.selectedDays)
      .forEach(acc => acc.selectedDays.forEach(d => { map[d] = acc.name; }));
    return map;
  };

  // Smart accept handler — checks for day conflicts on vacation posts
  const handleAccept = (applicant) => {
    if (post.type !== 'vacation' || !applicant.selectedDays) {
      updateStatus(applicant.id, 'accepted');
      return;
    }
    const bookedMap = buildBookedMap(applicants);
    const conflicts = applicant.selectedDays
      .filter(d => bookedMap[d])
      .map(d => ({ day: d, takenBy: bookedMap[d] }));

    if (conflicts.length > 0) {
      setConflictInfo({ applicantId: applicant.id, conflicts });
    } else {
      setConflictInfo(null);
      updateStatus(applicant.id, 'accepted');
    }
  };

  const typeIcon = (type) => {
    if (type==='quickpool') return Icon.bolt(14,'var(--pg-blue-700)');
    if (type==='vacation')  return Icon.cal(14,'var(--pg-blue-700)');
    return Icon.cart(14,'var(--pg-blue-700)');
  };

  const statusConfig = {
    pending:  { label:t.pendingLbl,  bg:'var(--pg-ink-100)',   color:'var(--pg-ink-600)' },
    accepted: { label:t.accepted,    bg:'var(--pg-aqua-100)',  color:'var(--pg-aqua-700)' },
    rejected: { label:t.rejected,    bg:'oklch(0.95 0.04 20)', color:'oklch(0.45 0.18 20)' },
  };

  const pending  = applicants.filter(a=>a.status==='pending').length;
  const accepted = applicants.filter(a=>a.status==='accepted').length;

  return (
    <Sheet open={open} onClose={onClose} height="88%">
      <div style={{display:'flex', flexDirection:'column', height:'100%'}}>
        {/* Header */}
        <div style={{padding:'4px 16px 14px', borderBottom:'0.5px solid var(--pg-ink-200)', flexShrink:0}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10}}>
            <h2 style={{margin:0, fontSize:18, fontWeight:700, letterSpacing:'-0.01em'}}>{t.applicantsPanelTitle}</h2>
            <button onClick={onClose} style={{border:'none', background:'var(--pg-ink-100)', width:30, height:30, borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
              {Icon.x(16,'var(--pg-ink-700)')}
            </button>
          </div>
          {/* Post context */}
          <div style={{display:'flex', alignItems:'center', gap:10, background:'var(--pg-blue-50)', borderRadius:10, padding:'9px 12px'}}>
            <div style={{width:32, height:32, borderRadius:8, background:'var(--pg-blue-100)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
              {typeIcon(post.type)}
            </div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:13, fontWeight:600, color:'var(--pg-blue-800)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                {tr(post.title, lang)}
              </div>
              <div style={{fontSize:11, color:'var(--pg-ink-500)', marginTop:1}}>
                {Icon.pin(10,'var(--pg-ink-400)')} {post.loc} · {tr(post.date, lang)}
              </div>
            </div>
          </div>
          {/* Stats row */}
          <div style={{display:'flex', gap:8, marginTop:10}}>
            {[
              { val:applicants.length, label:t.applicants,  bg:'var(--pg-ink-50)',   color:'var(--pg-ink-900)',  border:'var(--pg-ink-200)' },
              { val:pending,           label:t.pendingLbl,  bg:'oklch(0.97 0.03 80)',color:'oklch(0.55 0.18 80)',border:'oklch(0.88 0.06 80)' },
              { val:accepted,          label:t.accepted,    bg:'var(--pg-aqua-50)',  color:'var(--pg-aqua-700)', border:'var(--pg-aqua-200)' },
            ].map((s,i)=>(
              <div key={i} style={{flex:1, textAlign:'center', padding:'8px 4px', borderRadius:10, background:s.bg, border:`0.5px solid ${s.border}`}}>
                <div style={{fontSize:18, fontWeight:700, letterSpacing:'-0.02em', color:s.color}}>{s.val}</div>
                <div style={{fontSize:10, fontWeight:600, marginTop:1, color:s.color, opacity:0.75}}>{s.label.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* List */}
        <div style={{flex:1, overflow:'auto', padding:'10px 16px 20px', display:'flex', flexDirection:'column', gap:10}}>
          {applicants.map(a => {
            const sc = statusConfig[a.status] || statusConfig.pending;
            return (
              <div key={a.id} className="pg-card" style={{padding:'13px 14px'}}>
                <div style={{display:'flex', alignItems:'center', gap:10}}>
                  {/* Tappable avatar + name → opens profile */}
                  <button onClick={()=>setProfileApp(a)} style={{
                    border:'none', background:'transparent', padding:0, cursor:'pointer',
                    flexShrink:0, borderRadius:'50%', position:'relative',
                  }}>
                    <Avatar name={a.name} size={42}/>
                    <span style={{
                      position:'absolute', bottom:-2, right:-2,
                      width:14, height:14, borderRadius:'50%',
                      background:'var(--pg-blue-500)', border:'2px solid #fff',
                      display:'flex', alignItems:'center', justifyContent:'center',
                    }}>
                      <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                        <circle cx="12" cy="8" r="5"/><path d="M3 21v-1a9 9 0 0118 0v1"/>
                      </svg>
                    </span>
                  </button>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{display:'flex', alignItems:'center', gap:7, flexWrap:'wrap'}}>
                      <button onClick={()=>setProfileApp(a)} style={{
                        border:'none', background:'transparent', padding:0, cursor:'pointer',
                        fontSize:14, fontWeight:700, letterSpacing:'-0.01em', fontFamily:'inherit',
                        color:'var(--pg-ink-900)', textAlign:'left',
                      }}>{a.name}</button>
                      <span style={{fontSize:10, padding:'2px 7px', borderRadius:6, fontWeight:700, background:sc.bg, color:sc.color}}>{sc.label}</span>
                    </div>
                    <div style={{display:'flex', alignItems:'center', gap:5, marginTop:3}}>
                      <ReputationBadge jobs={a.jobs} lang={lang}/>
                    </div>
                    <div style={{fontSize:12, color:'var(--pg-ink-500)', marginTop:4, display:'flex', alignItems:'center', gap:6}}>
                      <Stars rating={a.rating} size={10}/> {a.rating}
                      <span>·</span>
                      <span>{a.jobs} {lang==='pt'?'trabalhos':lang==='es'?'trabajos':'jobs'}</span>
                      <span>·</span>
                      <span>{a.when} {lang==='en'?'ago':lang==='pt'?'atrás':'atrás'}</span>
                    </div>
                  </div>
                </div>
                {/* Selected days (only for vacation posts) */}
                {post.type === 'vacation' && a.selectedDays && a.selectedDays.length > 0 && (() => {
                  const bookedMap  = buildBookedMap(applicants);
                  const hasConflict = conflictInfo && conflictInfo.applicantId === a.id;
                  const conflictDays = hasConflict ? new Set(conflictInfo.conflicts.map(c=>c.day)) : new Set();
                  const allDays = post.days || a.selectedDays;
                  return (
                    <div style={{marginTop:8, paddingTop:8, borderTop:'0.5px solid var(--pg-ink-100)'}}>
                      <div style={{fontSize:10.5, color:'var(--pg-ink-400)', fontWeight:600, letterSpacing:'0.03em', marginBottom:5}}>
                        {lang==='pt'?'DIAS ESCOLHIDOS':lang==='es'?'DÍAS ELEGIDOS':'DAYS REQUESTED'}
                      </div>
                      <div style={{display:'flex', flexWrap:'wrap', gap:4}}>
                        {allDays.map(d => {
                          const reqd        = a.selectedDays.includes(d);
                          const takenBy     = bookedMap[d];
                          const isTakenByOther = takenBy && (a.status !== 'accepted' || !a.selectedDays.includes(d));
                          const isConflict  = conflictDays.has(d);
                          const isAccepted  = a.status === 'accepted' && reqd;

                          let bg, color, border = 'none', title = '';
                          if (isConflict) {
                            bg = 'oklch(0.93 0.08 25)'; color = 'oklch(0.50 0.22 25)';
                            border = '1.5px solid oklch(0.72 0.18 25)';
                            title = `Day ${d} — reserved for ${takenBy}`;
                          } else if (isAccepted) {
                            bg = 'var(--pg-aqua-500)'; color = '#fff';
                          } else if (reqd && takenBy && a.status !== 'accepted') {
                            bg = 'oklch(0.93 0.08 25)'; color = 'oklch(0.50 0.22 25)';
                          } else if (reqd) {
                            bg = 'var(--pg-blue-500)'; color = '#fff';
                          } else if (takenBy) {
                            bg = 'var(--pg-ink-100)'; color = 'var(--pg-ink-300)';
                          } else {
                            bg = 'var(--pg-blue-50)'; color = 'var(--pg-ink-200)';
                          }
                          return (
                            <span key={d} title={title} style={{
                              width:26, height:26, borderRadius:6, fontSize:10.5, fontWeight:700,
                              display:'inline-flex', alignItems:'center', justifyContent:'center',
                              background:bg, color, border,
                              position:'relative',
                            }}>{d}</span>
                          );
                        })}
                      </div>

                      {/* Conflict inline warning */}
                      {hasConflict && (
                        <div style={{
                          marginTop:8, padding:'8px 10px', borderRadius:8,
                          background:'oklch(0.96 0.04 25)', border:'1px solid oklch(0.85 0.10 25)',
                          display:'flex', flexDirection:'column', gap:4,
                        }}>
                          <div style={{display:'flex', alignItems:'center', gap:6}}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="oklch(0.50 0.22 25)" strokeWidth="2.2" strokeLinecap="round">
                              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                            </svg>
                            <span style={{fontSize:11.5, fontWeight:700, color:'oklch(0.42 0.20 25)'}}>
                              {lang==='pt'?'Conflito de dias':lang==='es'?'Conflicto de días':'Day conflict'}
                            </span>
                            <button onClick={()=>setConflictInfo(null)} style={{
                              marginLeft:'auto', border:'none', background:'transparent',
                              cursor:'pointer', padding:2, color:'oklch(0.55 0.18 25)',
                              lineHeight:1, fontSize:13, fontFamily:'inherit',
                            }}>✕</button>
                          </div>
                          {conflictInfo.conflicts.map((c,i) => (
                            <div key={i} style={{
                              fontSize:11.5, color:'oklch(0.42 0.20 25)',
                              display:'flex', alignItems:'center', gap:5, paddingLeft:2,
                            }}>
                              <span style={{
                                width:20, height:20, borderRadius:4, background:'oklch(0.85 0.12 25)',
                                display:'inline-flex', alignItems:'center', justifyContent:'center',
                                fontSize:10, fontWeight:700, flexShrink:0,
                              }}>{c.day}</span>
                              {lang==='pt'
                                ? `já reservado para ${c.takenBy}`
                                : lang==='es'
                                  ? `ya reservado para ${c.takenBy}`
                                  : `already reserved for ${c.takenBy}`}
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={{fontSize:11, color:'var(--pg-ink-400)', marginTop:6}}>
                        {a.selectedDays.length} {lang==='pt'?'dias':lang==='es'?'días':'days'}
                        {post.poolsPerDay && post.pricePerPool && (
                          <span style={{marginLeft:6, color:'var(--pg-blue-500)', fontWeight:600}}>
                            · Est. ${(a.selectedDays.length * post.poolsPerDay * post.pricePerPool).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })()}
                {/* Hiring-specific: candidate note */}
                {post.type === 'hiring' && a.note && (
                  <div style={{
                    marginTop:8, padding:'7px 10px', borderRadius:8,
                    background:'var(--pg-blue-50)', border:'0.5px solid var(--pg-blue-100)',
                    fontSize:12, color:'var(--pg-ink-700)', lineHeight:1.4,
                  }}>
                    {tr(a.note, lang)}
                  </div>
                )}

                {/* Rejection reason display */}
                {a.status === 'rejected' && a.rejectReason && (
                  <div style={{
                    display:'flex', alignItems:'flex-start', gap:6, marginTop:8,
                    padding:'6px 10px', borderRadius:8,
                    background:'oklch(0.97 0.02 20)', border:'0.5px solid oklch(0.88 0.08 20)',
                  }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="oklch(0.55 0.18 20)" strokeWidth="2.2" strokeLinecap="round" style={{flexShrink:0, marginTop:1}}>
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <span style={{fontSize:11.5, color:'oklch(0.50 0.18 20)', lineHeight:1.4, fontStyle:'italic'}}>
                      "{a.rejectReason}"
                    </span>
                  </div>
                )}

                {/* Interview scheduled chip */}
                {a.interview && (
                  <div style={{
                    display:'inline-flex', alignItems:'center', gap:6,
                    marginTop:8, padding:'5px 10px', borderRadius:8,
                    background:'oklch(0.96 0.04 145)', border:'0.5px solid oklch(0.80 0.10 145)',
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                      stroke="oklch(0.40 0.18 145)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                    </svg>
                    <span style={{fontSize:11.5, fontWeight:700, color:'oklch(0.40 0.18 145)'}}>
                      📅 {tr(a.interview.day, lang)} · {a.interview.time}
                    </span>
                  </div>
                )}

                <div style={{display:'flex', gap:7, marginTop:11, flexWrap:'wrap'}}>
                  <button onClick={()=>{ onChat(a.name); onClose(); }}
                    className="pg-btn pg-btn-ghost" style={{height:34, padding:'0 12px', fontSize:12, borderRadius:999, flexShrink:0}}>
                    {Icon.msg(13,'var(--pg-blue-700)')} {t.chatBtn}
                  </button>
                  {a.status === 'pending' && rejectingFor !== a.id && (
                    <>
                      {/* Hiring: schedule interview instead of plain accept */}
                      {post.type === 'hiring' ? (
                        <button onClick={()=>setSchedulingFor(a)}
                          className="pg-btn pg-btn-aqua" style={{flex:1, height:34, fontSize:12, borderRadius:999}}>
                          📅 {lang==='pt'?'Agendar entrevista':lang==='es'?'Agendar entrevista':'Schedule interview'}
                        </button>
                      ) : (
                        <button onClick={()=>handleAccept(a)}
                          className="pg-btn pg-btn-aqua" style={{flex:1, height:34, fontSize:12, borderRadius:999}}>
                          {Icon.check(13,'var(--pg-blue-900)')} {t.acceptBtn}
                        </button>
                      )}
                      <button onClick={()=>{ setRejectingFor(a.id); setRejectReason(''); }} style={{
                        flex:1, height:34, fontSize:12, borderRadius:999, border:'none', cursor:'pointer',
                        fontFamily:'inherit', fontWeight:600,
                        background:'oklch(0.95 0.04 20)', color:'oklch(0.45 0.18 20)',
                      }}>{t.rejectBtn}</button>
                    </>
                  )}
                  {a.status === 'accepted' && rejectingFor !== a.id && (
                    <>
                      {post.type === 'hiring' && !a.interview && (
                        <button onClick={()=>setSchedulingFor(a)}
                          className="pg-btn pg-btn-ghost" style={{flex:1, height:34, fontSize:12, borderRadius:999}}>
                          📅 {lang==='pt'?'Agendar entrevista':lang==='es'?'Agendar entrevista':'Schedule interview'}
                        </button>
                      )}
                      {(post.type !== 'hiring' || a.interview) && (
                        <button onClick={()=>{ setRejectingFor(a.id); setRejectReason(''); }} style={{
                          flex:1, height:34, fontSize:12, borderRadius:999, border:'1px solid var(--pg-ink-200)',
                          cursor:'pointer', fontFamily:'inherit', fontWeight:600, background:'transparent', color:'var(--pg-ink-600)',
                        }}>{t.rejectBtn}</button>
                      )}
                    </>
                  )}
                  {a.status === 'rejected' && (
                    <button onClick={()=>updateStatus(a.id,'pending')}
                      className="pg-btn pg-btn-ghost" style={{flex:1, height:34, fontSize:12, borderRadius:999}}>
                      {lang==='pt'?'Restaurar':lang==='es'?'Restaurar':'Restore'}
                    </button>
                  )}
                </div>

                {/* Inline rejection reason form */}
                {rejectingFor === a.id && (
                  <div style={{marginTop:8, padding:'10px 12px', borderRadius:10, background:'oklch(0.97 0.02 20)', border:'0.5px solid oklch(0.88 0.08 20)'}}>
                    <div style={{fontSize:11.5, fontWeight:700, color:'oklch(0.45 0.18 20)', marginBottom:7}}>
                      {lang==='pt'?'Motivo da recusa (opcional)':lang==='es'?'Motivo del rechazo (opcional)':'Reason for rejection (optional)'}
                    </div>
                    <input
                      autoFocus
                      value={rejectReason}
                      onChange={e=>setRejectReason(e.target.value)}
                      placeholder={lang==='pt'?'Ex: Pouca experiência…':lang==='es'?'Ej: Poca experiencia…':'E.g. Not enough experience…'}
                      style={{width:'100%', boxSizing:'border-box', padding:'9px 11px', borderRadius:9,
                        border:'1px solid oklch(0.85 0.07 20)', background:'#fff', fontSize:13,
                        fontFamily:'inherit', outline:'none', color:'var(--pg-ink-900)'}}
                    />
                    <div style={{display:'flex', gap:7, marginTop:8}}>
                      <button onClick={()=>{ setRejectingFor(null); setRejectReason(''); }} style={{
                        flex:1, height:34, fontSize:12, borderRadius:999, border:'1px solid var(--pg-ink-200)',
                        cursor:'pointer', fontFamily:'inherit', fontWeight:600, background:'transparent', color:'var(--pg-ink-600)',
                      }}>
                        {lang==='pt'?'Cancelar':lang==='es'?'Cancelar':'Cancel'}
                      </button>
                      <button onClick={()=>{
                        const reason = rejectReason.trim() || null;
                        setApplicants(prev=>prev.map(a2=>a2.id===a.id?{...a2, status:'rejected', rejectReason:reason}:a2));
                        setRejectingFor(null); setRejectReason('');
                      }} style={{
                        flex:1, height:34, fontSize:12, borderRadius:999, border:'none', cursor:'pointer',
                        fontFamily:'inherit', fontWeight:700, background:'oklch(0.55 0.22 25)', color:'#fff',
                      }}>
                        {lang==='pt'?'Confirmar':lang==='es'?'Confirmar':'Confirm'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Profile preview — nested sheet stacked on top */}
      <ApplicantProfileSheet
        open={!!profileApp} onClose={()=>setProfileApp(null)}
        applicant={profileApp} lang={lang}/>

      {/* Interview scheduler — nested sheet */}
      <InterviewSchedulerSheet
        open={!!schedulingFor} onClose={()=>setSchedulingFor(null)}
        applicant={schedulingFor} lang={lang}
        onConfirm={(interview) => scheduleInterview(schedulingFor.id, interview)}/>
    </Sheet>
  );
}

// ── Interview Scheduler Sheet ─────────────────────────────────
function InterviewSchedulerSheet({ open, onClose, applicant, lang='en', onConfirm }) {
  // Fixed reference date for the prototype
  const NOW_YEAR = 2026, NOW_MONTH = 4, NOW_DAY = 27; // May 27 2026

  const slots = ['8:00 AM','9:00 AM','10:00 AM','11:00 AM',
                  '1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM'];

  const [selDate, setSelDate] = React.useState({year:2026, month:4, day:29});
  const [calYear, setCalYear] = React.useState(2026);
  const [calMonth, setCalMonth] = React.useState(4);
  const [selTime, setSelTime]   = React.useState('10:00 AM');

  React.useEffect(() => {
    if (open) {
      setSelDate({year:2026, month:4, day:29});
      setCalYear(2026); setCalMonth(4);
      setSelTime('10:00 AM');
    }
  }, [open]);

  if (!applicant) return null;

  const monthNamesFull = {
    en:['January','February','March','April','May','June','July','August','September','October','November','December'],
    pt:['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
    es:['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
  };
  const monthNamesShort = {
    en:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    pt:['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'],
    es:['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'],
  };
  const weekdayLabels = {
    en:['Su','Mo','Tu','We','Th','Fr','Sa'],
    pt:['Do','Se','Te','Qu','Qu','Se','Sá'],
    es:['Do','Lu','Ma','Mi','Ju','Vi','Sá'],
  };
  const shortDays = {
    en:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
    pt:['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],
    es:['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'],
  };

  // Build calendar grid
  const firstDow    = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const canPrevMonth = !(calYear === NOW_YEAR && calMonth <= NOW_MONTH);
  const prevMonth = () => {
    if (!canPrevMonth) return;
    if (calMonth === 0) { setCalMonth(11); setCalYear(y=>y-1); } else setCalMonth(m=>m-1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y=>y+1); } else setCalMonth(m=>m+1);
  };

  // Formatted day display for summary / chip
  const dow = new Date(selDate.year, selDate.month, selDate.day).getDay();
  const dayDisplay = {
    en:`${shortDays.en[dow]}, ${monthNamesShort.en[selDate.month]} ${selDate.day}`,
    pt:`${shortDays.pt[dow]}, ${selDate.day} ${monthNamesShort.pt[selDate.month]}`,
    es:`${shortDays.es[dow]}, ${selDate.day} ${monthNamesShort.es[selDate.month]}`,
  };

  const isSelInView = selDate.year === calYear && selDate.month === calMonth;

  const titleLbl   = lang==='pt' ? 'Agendar Entrevista' : lang==='es' ? 'Agendar Entrevista' : 'Schedule Interview';
  const confirmLbl = lang==='pt' ? 'Confirmar entrevista' : lang==='es' ? 'Confirmar entrevista' : 'Confirm interview';
  const dateLbl    = lang==='pt' ? 'DATA' : lang==='es' ? 'FECHA' : 'DATE';
  const timeLbl    = lang==='pt' ? 'HORÁRIO' : lang==='es' ? 'HORA' : 'TIME';
  const noteLbl    = lang==='pt' ? 'O candidato será notificado pelo chat.' : lang==='es' ? 'El candidato será notificado por chat.' : 'Candidate will be notified via chat.';

  return (
    <Sheet open={open} onClose={onClose} height="92%">
      <div style={{overflow:'auto', height:'100%', padding:'6px 18px 32px'}}>
        {/* Header */}
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16}}>
          <div>
            <h2 style={{margin:0, fontSize:18, fontWeight:700, letterSpacing:'-0.015em'}}>{titleLbl}</h2>
            <div style={{fontSize:12.5, color:'var(--pg-ink-500)', marginTop:3, display:'flex', alignItems:'center', gap:6}}>
              <Avatar name={applicant.name} size={18}/>
              {applicant.name} · <Stars rating={applicant.rating} size={10}/> {applicant.rating}
            </div>
          </div>
          <button onClick={onClose} style={{border:'none', background:'var(--pg-ink-100)', width:30, height:30, borderRadius:'50%',
            cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
            {Icon.x(16,'var(--pg-ink-700)')}
          </button>
        </div>

        {/* ── Calendar ── */}
        <div style={{marginBottom:18}}>
          <div style={{fontSize:10, fontWeight:700, letterSpacing:'0.07em', color:'var(--pg-ink-400)', marginBottom:8}}>{dateLbl}</div>

          {/* Month navigation */}
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8, padding:'0 2px'}}>
            <button onClick={prevMonth} style={{
              border:'none', background:'transparent', cursor: canPrevMonth ? 'pointer' : 'default',
              opacity: canPrevMonth ? 1 : 0.25, padding:4, display:'flex', borderRadius:8,
            }}>
              {Icon.chev(18,'var(--pg-ink-700)','left')}
            </button>
            <div style={{fontSize:14, fontWeight:700, letterSpacing:'-0.01em', color:'var(--pg-ink-900)'}}>
              {(monthNamesFull[lang]||monthNamesFull.en)[calMonth]} {calYear}
            </div>
            <button onClick={nextMonth} style={{
              border:'none', background:'transparent', cursor:'pointer', padding:4, display:'flex', borderRadius:8,
            }}>
              {Icon.chev(18,'var(--pg-ink-700)')}
            </button>
          </div>

          {/* Weekday headers */}
          <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, marginBottom:4}}>
            {(weekdayLabels[lang]||weekdayLabels.en).map((d,i) => (
              <div key={i} style={{
                textAlign:'center', fontSize:10.5, fontWeight:700,
                color:'var(--pg-ink-400)', letterSpacing:'0.03em', padding:'2px 0',
              }}>{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2}}>
            {cells.map((day, i) => {
              if (!day) return <div key={i}/>;
              const isPast = (calYear < NOW_YEAR) ||
                             (calYear === NOW_YEAR && calMonth < NOW_MONTH) ||
                             (calYear === NOW_YEAR && calMonth === NOW_MONTH && day < NOW_DAY);
              const isSel    = isSelInView && selDate.day === day;
              const isToday  = calYear === NOW_YEAR && calMonth === NOW_MONTH && day === NOW_DAY;
              return (
                <button key={i}
                  disabled={isPast}
                  onClick={()=>!isPast && setSelDate({year:calYear, month:calMonth, day})}
                  style={{
                    height:36, borderRadius:9,
                    border: isToday && !isSel ? '1.5px solid var(--pg-blue-300)' : 'none',
                    cursor: isPast ? 'default' : 'pointer',
                    fontFamily:'inherit', fontSize:12.5, fontWeight: isSel ? 700 : 500, transition:'all .1s',
                    background: isSel ? 'var(--pg-blue-500)' : isToday ? 'var(--pg-blue-50)' : 'transparent',
                    color: isSel ? '#fff' : isPast ? 'var(--pg-ink-200)' : 'var(--pg-ink-900)',
                    boxShadow: isSel ? '0 2px 8px oklch(0.58 0.16 235 / 0.30)' : 'none',
                  }}>
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Time slots ── */}
        <div style={{marginBottom:18}}>
          <div style={{fontSize:10, fontWeight:700, letterSpacing:'0.07em', color:'var(--pg-ink-400)', marginBottom:8}}>{timeLbl}</div>
          <div style={{display:'flex', flexWrap:'wrap', gap:7}}>
            {slots.map(slot => {
              const on = selTime === slot;
              return (
                <button key={slot} onClick={()=>setSelTime(slot)} style={{
                  padding:'7px 12px', borderRadius:9, border:'none', cursor:'pointer',
                  fontFamily:'inherit', fontSize:12.5, fontWeight:600, transition:'all .12s',
                  background: on ? 'var(--pg-blue-500)' : 'var(--pg-ink-100)',
                  color: on ? '#fff' : 'var(--pg-ink-700)',
                  boxShadow: on ? '0 2px 6px oklch(0.58 0.16 235 / 0.25)' : 'none',
                }}>{slot}</button>
              );
            })}
          </div>
        </div>

        {/* ── Summary preview ── */}
        <div style={{
          display:'flex', alignItems:'center', gap:10, padding:'11px 14px',
          borderRadius:12, background:'oklch(0.96 0.04 145)', border:'0.5px solid oklch(0.80 0.10 145)',
          marginBottom:16,
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="oklch(0.40 0.18 145)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
            <path d="M8 14h.01M12 14h.01M16 14h.01"/>
          </svg>
          <div>
            <div style={{fontSize:13, fontWeight:700, color:'oklch(0.36 0.18 145)', letterSpacing:'-0.01em'}}>
              {tr(dayDisplay, lang)} · {selTime}
            </div>
            <div style={{fontSize:11, color:'oklch(0.50 0.14 145)', marginTop:1}}>{noteLbl}</div>
          </div>
        </div>

        {/* ── Confirm button ── */}
        <button
          onClick={()=>onConfirm({ day: dayDisplay, time: selTime })}
          className="pg-btn pg-btn-primary"
          style={{width:'100%', height:50, fontSize:15, borderRadius:14}}>
          {Icon.check(16,'#fff')} {confirmLbl}
        </button>
      </div>
    </Sheet>
  );
}

// ── Applicant Profile Preview Sheet ───────────────────────────
function ApplicantProfileSheet({ open, onClose, applicant, lang='en' }) {
  const [reviewLang, setReviewLang] = React.useState(lang);
  React.useEffect(() => { if (open) setReviewLang(lang); }, [open, lang]);

  if (!applicant) return null;

  const badgeCfg = (jobs) => {
    if (jobs >= 100) return { label:'EXPERT',   bg:'oklch(0.93 0.06 80)',  color:'oklch(0.40 0.18 80)' };
    if (jobs >= 20)  return { label:'RELIABLE', bg:'var(--pg-aqua-100)',   color:'var(--pg-aqua-700)' };
    return              { label:'ROOKIE',   bg:'var(--pg-blue-100)',   color:'var(--pg-blue-700)' };
  };
  const badge = badgeCfg(applicant.jobs);

  const mockReviews = [
    { from:'Carlos M.', rating:Math.min(5, Math.round(applicant.rating)),
      when:{en:'2 weeks ago', pt:'2 semanas atrás', es:'hace 2 semanas'},
      text:{en:'Excellent work, arrived on time and left everything spotless.',
            pt:'Excelente trabalho, chegou no horário e deixou tudo impecável.',
            es:'Excelente trabajo, llegó a tiempo y dejó todo impecable.'} },
    { from:'Ana R.', rating:Math.max(4, Math.round(applicant.rating) - (applicant.rating < 4.8 ? 1 : 0)),
      when:{en:'1 month ago', pt:'1 mês atrás', es:'hace 1 mes'},
      text:{en:'Very communicative throughout the whole coverage.',
            pt:'Muito comunicativo durante toda a cobertura.',
            es:'Muy comunicativo durante toda la cobertura.'} },
    ...(applicant.jobs >= 30 ? [{
      from:'Pedro S.', rating:5,
      when:{en:'2 months ago', pt:'2 meses atrás', es:'hace 2 meses'},
      text:{en:'Already hired 3 times. Always reliable and professional.',
            pt:'Já contratei 3 vezes. Sempre confiável e profissional.',
            es:'Ya lo contraté 3 veces. Siempre confiable y profesional.'} }] : []),
  ];

  const LANGS = ['en','pt','es'];
  const LANG_LABELS = {en:'EN', pt:'PT', es:'ES'};

  // ── Localized labels ──────────────────────────
  const sectionLbl = (en, pt, es) => lang==='pt' ? pt : lang==='es' ? es : en;

  const CarIcon = (c='var(--pg-ink-500)') => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h1l3-4h9l3 4h1a2 2 0 012 2v6a2 2 0 01-2 2h-2"/>
      <circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/>
    </svg>
  );
  const LicenseIcon = (c='var(--pg-ink-500)') => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="13" rx="2"/>
      <path d="M7 10h4M7 14h6M15 10h2v4h-2z"/>
    </svg>
  );
  const ToolIcon = (c='var(--pg-ink-500)') => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 7a4 4 0 1 0-5 5l-6 6 3 3 6-6a4 4 0 0 0 5-5l-3 3-3-3z"/>
    </svg>
  );
  const BriefcaseIcon = (c='var(--pg-ink-500)') => Icon.briefcase(13, c);

  const hasProfile = applicant.age || applicant.region || applicant.hasCar !== undefined;
  const hasExp     = applicant.experience && applicant.experience.length > 0;

  // Chip helper for yes/no fields
  const YesNoChip = ({yes, yesLabel, noLabel, icon}) => (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:5,
      fontSize:12, fontWeight:600, padding:'5px 11px', borderRadius:999,
      background: yes ? 'var(--pg-aqua-100)' : 'var(--pg-ink-100)',
      color:      yes ? 'var(--pg-aqua-800)' : 'var(--pg-ink-400)',
    }}>
      {icon(yes ? 'var(--pg-aqua-700)' : 'var(--pg-ink-400)')}
      {yes ? yesLabel : noLabel}
    </span>
  );

  return (
    <Sheet open={open} onClose={onClose} height="90%">
      <div style={{padding:'0 18px 40px'}}>

        {/* Header */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:18}}>
          <div style={{display:'flex', alignItems:'center', gap:14}}>
            <Avatar name={applicant.name} size={64}/>
            <div>
              <div style={{fontFamily:'var(--pg-font-display)', fontSize:20, fontWeight:700, letterSpacing:'-0.02em'}}>{applicant.name}</div>
              <div style={{display:'flex', alignItems:'center', gap:6, marginTop:4, flexWrap:'wrap'}}>
                <span style={{fontSize:10.5, fontWeight:700, padding:'3px 8px', borderRadius:6, background:badge.bg, color:badge.color}}>{badge.label}</span>
                <Stars rating={applicant.rating} size={11}/>
                <span style={{fontSize:12, color:'var(--pg-ink-500)', fontWeight:600}}>{applicant.rating}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{border:'none', background:'var(--pg-ink-100)', width:30, height:30, borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
            {Icon.x(16,'var(--pg-ink-700)')}
          </button>
        </div>

        {/* Stats row */}
        <div style={{display:'flex', gap:8, marginBottom:20}}>
          {[
            { val:applicant.jobs,         label:sectionLbl('Jobs done','Jobs feitos','Jobs hechos') },
            { val:`${applicant.rating}★`, label:sectionLbl('Rating','Avaliação','Calificación') },
            { val:applicant.jobs>=100?'3+yr':applicant.jobs>=30?'1+yr':'<1yr',
              label:sectionLbl('On platform','Na plataforma','En plataforma') },
          ].map((s,i) => (
            <div key={i} style={{flex:1, textAlign:'center', padding:'10px 4px', borderRadius:12, background:'var(--pg-blue-50)', border:'0.5px solid var(--pg-blue-200)'}}>
              <div style={{fontFamily:'var(--pg-font-display)', fontSize:18, fontWeight:700, color:'var(--pg-blue-600)', letterSpacing:'-0.02em'}}>{s.val}</div>
              <div style={{fontSize:10, fontWeight:600, color:'var(--pg-ink-500)', marginTop:2}}>{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>

        {/* ── PROFILE DETAILS ── */}
        {hasProfile && (
          <div style={{marginBottom:20}}>
            <div style={{fontSize:11, fontWeight:700, color:'var(--pg-ink-400)', letterSpacing:'0.06em', marginBottom:10}}>
              {sectionLbl('PROFILE','PERFIL','PERFIL')}
            </div>
            <div style={{display:'flex', flexWrap:'wrap', gap:7}}>
              {/* Age */}
              {applicant.age && (
                <span style={{display:'inline-flex', alignItems:'center', gap:5, fontSize:12, fontWeight:600,
                  padding:'5px 11px', borderRadius:999, background:'var(--pg-ink-100)', color:'var(--pg-ink-700)'}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--pg-ink-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="5"/><path d="M3 21v-1a9 9 0 0118 0v1"/>
                  </svg>
                  {applicant.age} {sectionLbl('yrs','anos','años')}
                </span>
              )}
              {/* Region */}
              {applicant.region && (
                <span style={{display:'inline-flex', alignItems:'center', gap:5, fontSize:12, fontWeight:600,
                  padding:'5px 11px', borderRadius:999, background:'var(--pg-ink-100)', color:'var(--pg-ink-700)'}}>
                  {Icon.pin(12,'var(--pg-ink-500)')} {applicant.region}
                </span>
              )}
              {/* Car */}
              {applicant.hasCar !== undefined && (
                <YesNoChip
                  yes={applicant.hasCar}
                  yesLabel={sectionLbl('Own vehicle','Veículo próprio','Vehículo propio')}
                  noLabel={sectionLbl('No vehicle','Sem veículo','Sin vehículo')}
                  icon={CarIcon}/>
              )}
              {/* License */}
              {applicant.hasLicense !== undefined && (
                <YesNoChip
                  yes={applicant.hasLicense}
                  yesLabel={sectionLbl("Valid driver's license",'CNH válida','Licencia válida')}
                  noLabel={sectionLbl('No license','Sem CNH','Sin licencia')}
                  icon={LicenseIcon}/>
              )}
            </div>
          </div>
        )}

        {/* ── EQUIPMENT ── */}
        {applicant.hasEquipment !== undefined && (
          <div style={{marginBottom:20}}>
            <div style={{fontSize:11, fontWeight:700, color:'var(--pg-ink-400)', letterSpacing:'0.06em', marginBottom:10}}>
              {sectionLbl('EQUIPMENT','EQUIPAMENTOS','EQUIPOS')}
            </div>
            {applicant.hasEquipment && applicant.equipment ? (
              <div style={{display:'flex', flexWrap:'wrap', gap:6}}>
                {(tr(applicant.equipment, lang) || []).map((eq, i) => (
                  <span key={i} style={{display:'inline-flex', alignItems:'center', gap:5, fontSize:12, fontWeight:600,
                    padding:'5px 11px', borderRadius:999,
                    background:'var(--pg-blue-50)', border:'0.5px solid var(--pg-blue-200)', color:'var(--pg-blue-800)'}}>
                    {ToolIcon('var(--pg-blue-600)')} {eq}
                  </span>
                ))}
              </div>
            ) : (
              <span style={{display:'inline-flex', alignItems:'center', gap:5, fontSize:12, fontWeight:600,
                padding:'5px 11px', borderRadius:999, background:'var(--pg-ink-100)', color:'var(--pg-ink-400)'}}>
                {ToolIcon()} {sectionLbl('No equipment','Sem equipamentos','Sin equipos')}
              </span>
            )}
          </div>
        )}

        {/* ── WORK EXPERIENCE ── */}
        {hasExp && (
          <div style={{marginBottom:20}}>
            <div style={{fontSize:11, fontWeight:700, color:'var(--pg-ink-400)', letterSpacing:'0.06em', marginBottom:10}}>
              {sectionLbl('WORK EXPERIENCE','EXPERIÊNCIA','EXPERIENCIA')}
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:10}}>
              {applicant.experience.map((exp, i) => (
                <div key={i} style={{
                  padding:'12px 14px', borderRadius:12,
                  background:'var(--pg-ink-50)', border:'0.5px solid var(--pg-ink-200)',
                  borderLeft:'3px solid var(--pg-blue-400)',
                }}>
                  <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8, marginBottom:4}}>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontSize:13, fontWeight:700, color:'var(--pg-ink-900)', letterSpacing:'-0.01em'}}>
                        {tr(exp.role, lang)}
                      </div>
                      <div style={{display:'flex', alignItems:'center', gap:5, marginTop:2}}>
                        {BriefcaseIcon('var(--pg-ink-400)')}
                        <span style={{fontSize:12, color:'var(--pg-ink-600)', fontWeight:500}}>{exp.company}</span>
                      </div>
                    </div>
                    <span style={{fontSize:11, fontWeight:700, color:'var(--pg-blue-600)', flexShrink:0,
                      background:'var(--pg-blue-50)', padding:'3px 8px', borderRadius:6}}>
                      {tr(exp.duration, lang)}
                    </span>
                  </div>
                  <p style={{margin:0, fontSize:12, color:'var(--pg-ink-600)', lineHeight:1.5}}>
                    {tr(exp.desc, lang)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── NOTE (if any) ── */}
        {applicant.note && (
          <div style={{marginBottom:20, padding:'10px 13px', borderRadius:11,
            background:'var(--pg-blue-50)', border:'0.5px solid var(--pg-blue-100)'}}>
            <div style={{fontSize:11, fontWeight:700, color:'var(--pg-ink-400)', letterSpacing:'0.06em', marginBottom:5}}>
              {sectionLbl('NOTE FROM APPLICANT','NOTA DO CANDIDATO','NOTA DEL CANDIDATO')}
            </div>
            <p style={{margin:0, fontSize:12.5, color:'var(--pg-ink-700)', lineHeight:1.5, fontStyle:'italic'}}>
              "{tr(applicant.note, lang)}"
            </p>
          </div>
        )}

        {/* ── REVIEWS ── */}
        <div>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10}}>
            <div style={{fontSize:11, fontWeight:700, color:'var(--pg-ink-400)', letterSpacing:'0.06em'}}>
              {sectionLbl('REVIEWS','AVALIAÇÕES','RESEÑAS')} ({mockReviews.length})
            </div>
            <div style={{display:'flex', gap:2, background:'var(--pg-ink-100)', borderRadius:999, padding:'2px 3px'}}>
              {LANGS.map(l => (
                <button key={l} onClick={()=>setReviewLang(l)} style={{
                  fontSize:10, fontWeight:700, letterSpacing:'0.04em', padding:'3px 8px', borderRadius:999,
                  border:'none', cursor:'pointer', transition:'all .18s', fontFamily:'inherit',
                  background: reviewLang===l ? 'var(--pg-blue-500)' : 'transparent',
                  color:      reviewLang===l ? '#fff' : 'var(--pg-ink-500)',
                }}>
                  {LANG_LABELS[l]}
                </button>
              ))}
            </div>
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:10}}>
            {mockReviews.map((r,i) => (
              <div key={i} className="pg-card" style={{padding:'12px 14px'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6}}>
                  <div style={{display:'flex', alignItems:'center', gap:8}}>
                    <Avatar name={r.from} size={28}/>
                    <span style={{fontSize:13, fontWeight:600}}>{r.from}</span>
                  </div>
                  <div style={{display:'flex', alignItems:'center', gap:4}}>
                    <Stars rating={r.rating} size={10}/>
                    <span style={{fontSize:11, color:'var(--pg-ink-500)'}}>{r.when[reviewLang]}</span>
                  </div>
                </div>
                <p style={{margin:0, fontSize:12.5, color:'var(--pg-ink-700)', lineHeight:1.5}}>"{r.text[reviewLang]}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Sheet>
  );
}

// ── Identity Verification ─────────────────────────────────────
function VerificationSheet({ open, onClose, lang='en' }) {
  const [done, setDone] = React.useState([]);

  const steps = [
    { id:'id',
      icon: Icon.user,
      title:  {en:'Government ID',       pt:'Documento Oficial',            es:'ID Oficial'},
      sub:    {en:'Passport, driver\'s license or state ID', pt:'Passaporte, CNH ou RG', es:'Pasaporte, licencia o ID'},
      time:   '~2 min' },
    { id:'selfie',
      icon: Icon.user,
      title:  {en:'Selfie verification', pt:'Selfie de verificação',         es:'Selfie de verificación'},
      sub:    {en:'Live photo to match your ID',            pt:'Foto ao vivo para confirmar documento', es:'Foto en vivo para confirmar tu ID'},
      time:   '~1 min' },
    { id:'bg',
      icon: Icon.shield,
      title:  {en:'Background check',    pt:'Verificação de antecedentes',   es:'Verificación de antecedentes'},
      sub:    {en:'Instant results via our partner',        pt:'Resultado imediato pelo nosso parceiro', es:'Resultado inmediato por nuestro socio'},
      time:   '~5 min' },
  ];

  const headLbl  = lang==='pt' ? 'Verificação de identidade' : lang==='es' ? 'Verificación de identidad' : 'Identity Verification';
  const descLbl  = lang==='pt'
    ? 'Piscineiros verificados recebem 40% mais contatos e aparecem primeiro nos resultados.'
    : lang==='es'
      ? 'Los técnicos verificados reciben 40% más contactos y aparecen primero en los resultados.'
      : 'Verified pool guys get 40% more contacts and appear first in search results.';
  const allDone  = done.length === steps.length;
  const score    = Math.round(60 + (done.length / steps.length) * 40);
  const scoreWid = `${score}%`;

  const trustLbl = lang==='pt' ? 'PONTUAÇÃO DE CONFIANÇA' : lang==='es' ? 'PUNTUACIÓN DE CONFIANZA' : 'TRUST SCORE';
  const leftLbl  = (n) => lang==='pt' ? `${n} etapa${n!==1?'s':''} restante${n!==1?'s':''}` : lang==='es' ? `${n} paso${n!==1?'s':''} más` : `${n} step${n!==1?'s':''} left for max score`;
  const verifiedLbl = lang==='pt' ? 'Verificado' : lang==='es' ? 'Verificado' : 'Verified';
  const doneLbl  = lang==='pt' ? 'Conta verificada!' : lang==='es' ? '¡Cuenta verificada!' : 'Account verified!';
  const doneSubLbl = lang==='pt' ? 'Seu perfil aparece como verificado para outros usuários.' : lang==='es' ? 'Tu perfil aparece como verificado para otros.' : 'Your profile appears as verified to other users.';

  return (
    <Sheet open={open} onClose={onClose} height="92%">
      <div style={{overflow:'auto', height:'100%'}}>
        <div style={{padding:'4px 18px 36px'}}>
          {/* Header */}
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
            <h2 style={{margin:0, fontSize:18, fontWeight:700, letterSpacing:'-0.01em'}}>{headLbl}</h2>
            <button onClick={onClose} style={{border:'none', background:'var(--pg-ink-100)', width:30, height:30, borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
              {Icon.x(16,'var(--pg-ink-700)')}
            </button>
          </div>

          {allDone ? (
            <div style={{display:'flex', alignItems:'center', gap:12, padding:'14px 16px', borderRadius:14, background:'var(--pg-aqua-100)', border:'0.5px solid var(--pg-aqua-400)', marginBottom:18}}>
              {Icon.shield(22,'var(--pg-aqua-700)')}
              <div>
                <div style={{fontSize:14, fontWeight:700, color:'var(--pg-aqua-700)'}}>{doneLbl}</div>
                <div style={{fontSize:12, color:'var(--pg-aqua-600)', marginTop:2}}>{doneSubLbl}</div>
              </div>
            </div>
          ) : (
            <p style={{margin:'0 0 18px', fontSize:13, color:'var(--pg-ink-500)', lineHeight:1.5}}>{descLbl}</p>
          )}

          {/* Steps */}
          <div style={{display:'flex', flexDirection:'column', gap:10}}>
            {steps.map((step, idx) => {
              const isDone      = done.includes(step.id);
              const prevDone    = idx === 0 || done.includes(steps[idx-1].id);
              const available   = prevDone && !isDone;
              return (
                <button key={step.id}
                  onClick={available ? () => setDone(d => [...d, step.id]) : undefined}
                  style={{
                    display:'flex', alignItems:'center', gap:14, padding:'14px 16px',
                    border:'1px solid ' + (isDone ? 'var(--pg-aqua-400)' : available ? 'var(--pg-blue-200)' : 'var(--pg-ink-200)'),
                    borderRadius:14,
                    background: isDone ? 'var(--pg-aqua-50)' : available ? 'var(--pg-white)' : 'var(--pg-ink-50)',
                    cursor: available ? 'pointer' : 'default', fontFamily:'inherit', textAlign:'left',
                    opacity: !isDone && !available ? 0.5 : 1, transition:'all .15s',
                  }}>
                  <div style={{
                    width:44, height:44, borderRadius:12, flexShrink:0,
                    background: isDone ? 'var(--pg-aqua-500)' : available ? 'var(--pg-blue-100)' : 'var(--pg-ink-100)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}>
                    {isDone ? Icon.check(20,'#fff') : step.icon(20, available ? 'var(--pg-blue-700)' : 'var(--pg-ink-400)')}
                  </div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:14, fontWeight:700, color: isDone ? 'var(--pg-aqua-700)' : 'var(--pg-ink-900)'}}>
                      {tr(step.title, lang)}
                    </div>
                    <div style={{fontSize:12, color:'var(--pg-ink-500)', marginTop:2, lineHeight:1.35}}>{tr(step.sub, lang)}</div>
                    {!isDone && available && <div style={{fontSize:11, color:'var(--pg-blue-600)', marginTop:5, fontWeight:600}}>{step.time}</div>}
                  </div>
                  {isDone
                    ? <span className="pg-chip pg-chip-aqua" style={{fontSize:10, padding:'3px 8px', flexShrink:0}}>{verifiedLbl}</span>
                    : available ? Icon.chev(16,'var(--pg-ink-400)') : Icon.lock(14,'var(--pg-ink-300)')}
                </button>
              );
            })}
          </div>

          {/* Trust score card */}
          <div style={{marginTop:18, padding:'16px 18px', borderRadius:16, background:'linear-gradient(135deg, var(--pg-navy-900), var(--pg-blue-600))', color:'#fff'}}>
            <div style={{fontSize:10, opacity:0.7, letterSpacing:'0.09em', fontWeight:700, marginBottom:10}}>{trustLbl}</div>
            <div style={{display:'flex', alignItems:'baseline', gap:8}}>
              <div style={{fontFamily:'var(--pg-font-display)', fontSize:40, fontWeight:700, letterSpacing:'-0.04em'}}>{score}</div>
              <div style={{fontSize:15, opacity:0.6}}>/100</div>
            </div>
            <div style={{marginTop:10, height:7, borderRadius:4, background:'rgba(255,255,255,0.15)'}}>
              <div style={{height:'100%', borderRadius:4, width:scoreWid, background:'var(--pg-aqua-400)', transition:'width .6s ease'}}/>
            </div>
            <div style={{fontSize:11, opacity:0.6, marginTop:8}}>{leftLbl(steps.length - done.length)}</div>
          </div>
        </div>
      </div>
    </Sheet>
  );
}

// ── Push Notifications permission ─────────────────────────────
function PushNotifSheet({ open, onClose, lang='en', onEnabled }) {
  const [state, setState] = React.useState('idle'); // idle | requesting | enabled | denied

  const PUSH_LBL_MAP = {
    en: {
      title:'Push Notifications', sub:'Stay ahead of the competition — get jobs the moment they\'re posted.',
      types:['New Quick Pool in your region','Application accepted/rejected','New message from a poster','Route & vacation updates'],
      allow:'Enable Notifications', later:'Maybe later',
      enabledTitle:'Notifications enabled!', enabledSub:'You\'ll be notified of new jobs instantly.',
    },
    pt: {
      title:'Notificacoes Push', sub:'Fique a frente da concorrencia — receba trabalhos no momento em que forem publicados.',
      types:['Nova Piscina Rapida na sua regiao','Candidatura aceita/rejeitada','Nova mensagem de um anunciante','Atualizacoes de rota e ferias'],
      allow:'Ativar Notificacoes', later:'Talvez mais tarde',
      enabledTitle:'Notificacoes ativadas!', enabledSub:'Voce sera notificado de novos trabalhos instantaneamente.',
    },
    es: {
      title:'Notificaciones Push', sub:'Adelantate a la competencia — recibe trabajos en el momento en que se publican.',
      types:['Nueva Piscina Rapida en tu region','Postulacion aceptada/rechazada','Nuevo mensaje de un anunciante','Actualizaciones de ruta y vacaciones'],
      allow:'Activar Notificaciones', later:'Quizas despues',
      enabledTitle:'Notificaciones activadas!', enabledSub:'Recibiras notificaciones de nuevos trabajos al instante.',
    },
  };
  const lbl = PUSH_LBL_MAP[lang] || PUSH_LBL_MAP.en;

  const handleAllow = () => {
    setState('requesting');
    setTimeout(() => {
      setState('enabled');
      if (onEnabled) onEnabled();
    }, 1200);
  };

  return (
    <Sheet open={open} onClose={onClose} height="auto">
      <div style={{padding:'6px 20px 36px'}}>
        {state === 'enabled' ? (
          <div style={{textAlign:'center', padding:'10px 0 8px'}}>
            <div style={{width:64, height:64, borderRadius:20, background:'var(--pg-aqua-100)', margin:'0 auto 14px', display:'flex', alignItems:'center', justifyContent:'center'}}>
              {Icon.check(28,'var(--pg-aqua-700)')}
            </div>
            <div style={{fontSize:18, fontWeight:700, letterSpacing:'-0.01em'}}>{lbl.enabledTitle}</div>
            <div style={{fontSize:13, color:'var(--pg-ink-500)', marginTop:6, lineHeight:1.5}}>{lbl.enabledSub}</div>
            <button onClick={onClose} className="pg-btn pg-btn-primary" style={{width:'100%', height:50, fontSize:15, marginTop:20}}>OK</button>
          </div>
        ) : (
          <>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14}}>
              <div style={{width:50, height:50, borderRadius:14, background:'linear-gradient(135deg,var(--pg-blue-500),var(--pg-aqua-500))', display:'flex', alignItems:'center', justifyContent:'center'}}>
                {Icon.bell(24,'#fff')}
              </div>
              <button onClick={onClose} style={{border:'none', background:'var(--pg-ink-100)', width:30, height:30, borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
                {Icon.x(16,'var(--pg-ink-700)')}
              </button>
            </div>
            <h2 style={{margin:'0 0 6px', fontSize:20, fontWeight:700, letterSpacing:'-0.02em'}}>{lbl.title}</h2>
            <p style={{margin:'0 0 18px', fontSize:13, color:'var(--pg-ink-500)', lineHeight:1.5}}>{lbl.sub}</p>
            <div style={{display:'flex', flexDirection:'column', gap:8, marginBottom:20}}>
              {lbl.types.map((type, i) => (
                <div key={i} style={{display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:12, background:'var(--pg-blue-50)', border:'0.5px solid var(--pg-blue-100)'}}>
                  <div style={{width:32, height:32, borderRadius:9, background:'var(--pg-blue-100)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                    {Icon.bolt(15,'var(--pg-blue-700)')}
                  </div>
                  <div style={{fontSize:13, fontWeight:500, color:'var(--pg-blue-800)'}}>{type}</div>
                </div>
              ))}
            </div>
            <button onClick={handleAllow} className="pg-btn pg-btn-primary" style={{width:'100%', height:52, fontSize:15, marginBottom:10, position:'relative'}}>
              {state === 'requesting' ? (
                <span style={{display:'inline-flex', alignItems:'center', gap:8}}>
                  <span style={{width:16, height:16, border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', borderRadius:'50%', animation:'pg-spin .7s linear infinite', display:'inline-block'}}/>
                  {lang==='pt'?'Aguarde…':lang==='es'?'Espera…':'Requesting…'}
                </span>
              ) : lbl.allow}
            </button>
            <button onClick={onClose} style={{width:'100%', padding:'10px', border:'none', background:'transparent', color:'var(--pg-ink-500)', fontSize:14, cursor:'pointer', fontFamily:'inherit'}}>{lbl.later}</button>
          </>
        )}
      </div>
    </Sheet>
  );
}

// ── Notifications ─────────────────────────────────────────────
function NotificationsSheet({ open, onClose, lang='en' }) {
  const t = STRINGS[lang];
  const whenMap = { justNow:t.justNow, min8:'8m', hours2:'2h', yesterday:t.yesterday };
  return (
    <Sheet open={open} onClose={onClose} height="72%">
      <div style={{padding:'4px 18px 30px'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14}}>
          <h2 style={{margin:0, fontSize:20, fontWeight:700, letterSpacing:'-0.02em'}}>{t.notifsTitle}</h2>
          <button style={{border:'none', background:'transparent', color:'var(--pg-blue-600)', fontSize:13, fontWeight:600, cursor:'pointer'}}>{t.markAllRead}</button>
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:2}}>
          {NOTIFICATIONS.map(n => {
            const title = n.kind==='message' ? `${n.who} ${t[n.titleKey]}` : t[n.titleKey];
            const body  = n.kind==='message' ? tr(n.quote, lang) :
                          n.kind==='apply'   ? `${n.who} ${t[n.bodyKey]}` :
                          n.kind==='rating'  ? `${n.who} ${t[n.bodyKey]}` : t[n.bodyKey];
            return (
              <div key={n.id} style={{display:'flex', gap:12, padding:'12px 8px', borderRadius:10,
                background:n.unread?'var(--pg-blue-50)':'transparent', cursor:'pointer', position:'relative'}}>
                <div style={{width:38, height:38, borderRadius:'50%', flexShrink:0,
                  background:n.kind==='job'?'var(--pg-aqua-500)':n.kind==='message'?'var(--pg-blue-500)':n.kind==='apply'?'var(--pg-aqua-700)':'oklch(0.78 0.15 80)',
                  display:'flex', alignItems:'center', justifyContent:'center', color:'#fff'}}>
                  {n.kind==='job'     && Icon.bolt(18,'#fff')}
                  {n.kind==='message' && Icon.msg(16,'#fff')}
                  {n.kind==='apply'   && Icon.check(16,'#fff')}
                  {n.kind==='rating'  && Icon.star(15,'#fff',true)}
                </div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:8}}>
                    <div style={{fontSize:13, fontWeight:600, letterSpacing:'-0.01em'}}>{title}</div>
                    <div style={{display:'flex', alignItems:'center', gap:5, flexShrink:0}}>
                      <div style={{fontSize:11, color:'var(--pg-ink-500)', whiteSpace:'nowrap'}}>{whenMap[n.whenKey]}</div>
                      {n.unread && <span style={{width:8, height:8, borderRadius:'50%', background:'var(--pg-blue-500)', flexShrink:0}}/>}
                    </div>
                  </div>
                  <div style={{fontSize:13, color:'var(--pg-ink-700)', marginTop:2, lineHeight:1.4}}>{body}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Sheet>
  );
}

// ── Paywall ───────────────────────────────────────────────────
function PaywallSheet({ open, onClose, setUser, lang='en' }) {
  const t = STRINGS[lang];
  const [tier, setTier] = React.useState('premium');
  const features = [
    { f:t.payF1, free:false, prem:true,  pro:true },
    { f:t.payF2, free:false, prem:true,  pro:true },
    { f:t.payF3, free:false, prem:false, pro:true },
    { f:t.payF4, free:false, prem:true,  pro:true },
    { f:t.payF5, free:false, prem:false, pro:true },
    { f:t.payF6, free:false, prem:false, pro:true },
  ];
  const month = lang==='pt'?'/mês':lang==='es'?'/mes':'/month';
  return (
    <Sheet open={open} onClose={onClose} height="88%">
      <div style={{padding:'0 18px 30px'}}>
        <div style={{padding:'4px 0 14px', display:'flex', justifyContent:'flex-end'}}>
          <button onClick={onClose} style={{border:'none', background:'var(--pg-ink-100)', width:30, height:30, borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
            {Icon.x(16,'var(--pg-ink-700)')}
          </button>
        </div>
        <div style={{textAlign:'center'}}>
          <div style={{display:'inline-flex', alignItems:'center', justifyContent:'center', width:64, height:64, borderRadius:18, marginBottom:14, background:'linear-gradient(155deg,var(--pg-aqua-400),var(--pg-blue-500))'}}>
            {Icon.crown(28,'#fff')}
          </div>
          <h2 style={{margin:0, fontSize:26, fontWeight:700, letterSpacing:'-0.025em', lineHeight:1.1, whiteSpace:'pre-line'}}>{t.payTitle}</h2>
          <p style={{margin:'8px 16px 0', fontSize:14, color:'var(--pg-ink-500)', lineHeight:1.45}}>{t.paySub}</p>
        </div>
        <div className="pg-seg" style={{marginTop:18}}>
          <button className={`pg-seg-btn ${tier==='premium'?'on':''}`} onClick={()=>setTier('premium')}>{t.premium}</button>
          <button className={`pg-seg-btn ${tier==='pro'?'on':''}`} onClick={()=>setTier('pro')}>{t.poolguyPro}</button>
        </div>
        <div className="pg-card" style={{padding:18, marginTop:14,
          background:tier==='pro'?'linear-gradient(135deg,var(--pg-blue-900),var(--pg-blue-700))':'var(--pg-white)',
          color:tier==='pro'?'#fff':'inherit', border:tier==='pro'?'none':'0.5px solid var(--pg-aqua-400)'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end'}}>
            <div>
              <div style={{fontSize:12, fontWeight:700, letterSpacing:'0.06em', opacity:0.8}}>
                {tier==='pro'?'POOLGUY PRO':t.premium.toUpperCase()}
              </div>
              <div style={{display:'flex', alignItems:'baseline', gap:4, marginTop:6}}>
                <span style={{fontSize:36, fontWeight:700, letterSpacing:'-0.03em'}}>${tier==='pro'?'19.99':'9.99'}</span>
                <span style={{fontSize:14, opacity:0.7}}>{month}</span>
              </div>
              <div style={{fontSize:12, opacity:0.7, marginTop:2}}>{tier==='pro'?t.paySave:t.payTrial}</div>
            </div>
            {tier==='pro' && <span style={{fontSize:10, padding:'4px 8px', borderRadius:6, background:'var(--pg-aqua-500)', color:'var(--pg-blue-900)', fontWeight:700, letterSpacing:'0.05em'}}>{t.payBest}</span>}
          </div>
        </div>
        <div style={{marginTop:14}}>
          {features.map((f,i)=>{
            const has = tier==='pro'?f.pro:f.prem;
            return (
              <div key={i} style={{display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom:'0.5px solid var(--pg-ink-200)'}}>
                <div style={{width:22, height:22, borderRadius:'50%', background:has?'var(--pg-aqua-100)':'var(--pg-ink-100)', display:'flex', alignItems:'center', justifyContent:'center'}}>
                  {has?Icon.check(13,'var(--pg-aqua-700)'):Icon.x(11,'var(--pg-ink-400)')}
                </div>
                <div style={{flex:1, fontSize:13, color:has?'var(--pg-ink-900)':'var(--pg-ink-500)'}}>{f.f}</div>
              </div>
            );
          })}
        </div>
        <button onClick={()=>{setUser(u=>({...u,tier})); onClose();}} className="pg-btn pg-btn-primary" style={{width:'100%', height:54, fontSize:16, marginTop:18}}>
          {t.startTrial} — ${tier==='pro'?'19.99':'9.99'}{month}
        </button>
        <div style={{fontSize:11, color:'var(--pg-ink-500)', textAlign:'center', marginTop:8, lineHeight:1.4}}>
          {t.cancelAnytime}<br/>{t.restore}
        </div>
      </div>
    </Sheet>
  );
}

// ── Post Menu ─────────────────────────────────────────────────
function PostMenuSheet({ open, onClose, onPickQuickPool, lang='en' }) {
  const t = STRINGS[lang];
  const items = [
    { ic:Icon.bolt,      title:t.pmQuickPool,  sub:t.pmQuickPoolSub, kind:'aqua', onClick:onPickQuickPool },
    { ic:Icon.cart,      title:t.pmSellEq,     sub:t.pmSellEqSub,   kind:'blue' },
    { ic:Icon.cart,      title:t.pmRentEq,     sub:t.pmRentEqSub,   kind:'blue' },
    { ic:Icon.pin,       title:t.pmSellRoute,  sub:t.pmSellRouteSub,kind:'blue' },
    { ic:Icon.cal,       title:t.pmVacCover,   sub:t.pmVacCoverSub, kind:'blue' },
    { ic:Icon.briefcase, title:t.pmHireTech,   sub:t.pmHireTechSub, kind:'blue' },
  ];
  return (
    <Sheet open={open} onClose={onClose} height="auto">
      <div style={{padding:'4px 18px 30px'}}>
        <h2 style={{margin:'4px 0 14px', fontSize:18, fontWeight:700, letterSpacing:'-0.01em', textAlign:'center'}}>{t.whatPost}</h2>
        <div style={{display:'flex', flexDirection:'column', gap:8}}>
          {items.map((it,i)=>(
            <button key={i} onClick={()=>{ onClose(); it.onClick && it.onClick(); }} className="pg-press" style={{
              display:'flex', alignItems:'center', gap:14, padding:'12px 14px', border:'none', cursor:'pointer',
              background:'var(--pg-white)', borderRadius:14, boxShadow:'var(--pg-shadow-1)', textAlign:'left',
            }}>
              <div style={{width:42, height:42, borderRadius:11, background:it.kind==='aqua'?'var(--pg-aqua-100)':'var(--pg-blue-100)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                {it.ic(20, it.kind==='aqua'?'var(--pg-aqua-700)':'var(--pg-blue-700)')}
              </div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:15, fontWeight:600, letterSpacing:'-0.01em'}}>{it.title}</div>
                <div style={{fontSize:12, color:'var(--pg-ink-500)', marginTop:1}}>{it.sub}</div>
              </div>
              {Icon.chev(16,'var(--pg-ink-400)')}
            </button>
          ))}
        </div>
      </div>
    </Sheet>
  );
}

// ── Toast ─────────────────────────────────────────────────────
function Toast({ message, kind='success' }) {
  if (!message) return null;
  return (
    <div style={{
      position:'absolute', left:18, right:18, bottom:108, zIndex:200,
      padding:'12px 14px', borderRadius:14,
      background:kind==='success'?'var(--pg-aqua-700)':'var(--pg-ink-900)',
      color:'#fff', display:'flex', alignItems:'center', gap:10,
      boxShadow:'0 8px 24px rgba(0,0,0,0.2)',
      animation:'pg-sheet-up 0.28s cubic-bezier(.22,1,.36,1)',
    }}>
      {kind==='success' && Icon.check(18,'#fff')}
      <div style={{fontSize:13, fontWeight:500, lineHeight:1.4, flex:1}}>{message}</div>
    </div>
  );
}

// ── Wallet Sheet ──────────────────────────────────────────────
function WalletSheet({ open, onClose, lang='en' }) {
  const [tab, setTab] = React.useState('pending');
  const d = WALLET_DATA;

  const walletLbl   = lang==='pt' ? 'Carteira' : lang==='es' ? 'Cartera' : 'Wallet';
  const weekLbl     = lang==='pt' ? 'Esta semana' : lang==='es' ? 'Esta semana' : 'This week';
  const monthLbl    = lang==='pt' ? 'Este mês' : lang==='es' ? 'Este mes' : 'This month';
  const pendingLbl  = lang==='pt' ? 'A receber' : lang==='es' ? 'Por cobrar' : 'Pending';
  const historyLbl  = lang==='pt' ? 'Histórico' : lang==='es' ? 'Historial' : 'History';
  const withdrawLbl = lang==='pt' ? 'Sacar fundos' : lang==='es' ? 'Retirar fondos' : 'Withdraw funds';
  const balanceLbl  = lang==='pt' ? 'Saldo disponível' : lang==='es' ? 'Saldo disponible' : 'Available balance';
  const minLbl      = lang==='pt' ? 'Mín. $50 para sacar' : lang==='es' ? 'Mín. $50 para retirar' : 'Min. $50 to withdraw';
  const awaitLbl    = lang==='pt' ? 'Aguardando liberação' : lang==='es' ? 'Esperando liberación' : 'Awaiting release';

  const dayKeys = lang==='pt' ? ['D','S','T','Q','Q','S','S'] : lang==='es' ? ['D','L','M','X','J','V','S'] : ['S','M','T','W','T','F','S'];
  const dayAmts = [0, 55, 45, 110, 0, 85, 45];
  const maxAmt = Math.max(...dayAmts);

  const ArrowUp = (s=16,c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5M5 12l7-7 7 7"/>
    </svg>
  );
  const ArrowDown = (s=16,c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12l7 7 7-7"/>
    </svg>
  );

  return (
    <Sheet open={open} onClose={onClose} height="90%">
      <div style={{display:'flex', flexDirection:'column', height:'100%'}}>
        <div style={{padding:'4px 18px 14px', borderBottom:'0.5px solid var(--pg-ink-200)', flexShrink:0, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h2 style={{margin:0, fontSize:20, fontWeight:700, letterSpacing:'-0.02em'}}>{walletLbl}</h2>
          <button onClick={onClose} style={{border:'none', background:'var(--pg-ink-100)', width:30, height:30, borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
            {Icon.x(16,'var(--pg-ink-700)')}
          </button>
        </div>

        <div style={{flex:1, overflow:'auto', padding:'16px 18px 30px'}}>
          {/* Balance hero */}
          <div style={{borderRadius:18, padding:'20px', background:'linear-gradient(135deg, var(--pg-blue-900) 0%, oklch(0.38 0.16 245) 100%)', color:'#fff', marginBottom:16, position:'relative', overflow:'hidden'}}>
            <div style={{position:'absolute', right:-30, top:-30, width:120, height:120, borderRadius:'50%', background:'rgba(255,255,255,0.05)', pointerEvents:'none'}}/>
            <div style={{fontSize:10, opacity:0.6, letterSpacing:'0.09em', fontWeight:700, marginBottom:6}}>{balanceLbl.toUpperCase()}</div>
            <div style={{fontFamily:'var(--pg-font-display)', fontSize:46, fontWeight:700, letterSpacing:'-0.04em', lineHeight:1}}>${d.balance}</div>
            <div style={{marginTop:16, display:'flex', gap:24}}>
              <div>
                <div style={{fontSize:9, opacity:0.6, fontWeight:700, letterSpacing:'0.07em', marginBottom:3}}>{weekLbl.toUpperCase()}</div>
                <div style={{fontSize:17, fontWeight:700}}>${d.weekEarnings}</div>
              </div>
              <div>
                <div style={{fontSize:9, opacity:0.6, fontWeight:700, letterSpacing:'0.07em', marginBottom:3}}>{monthLbl.toUpperCase()}</div>
                <div style={{fontSize:17, fontWeight:700}}>${d.monthEarnings}</div>
              </div>
            </div>
            {/* Sparkline */}
            <div style={{marginTop:14, display:'flex', alignItems:'flex-end', gap:4, height:34}}>
              {dayAmts.map((amt,i) => (
                <div key={i} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3}}>
                  <div style={{width:'100%', borderRadius:3, height: maxAmt ? Math.max(3, Math.round((amt/maxAmt)*22)) : 3, background: amt>0?'rgba(255,255,255,0.65)':'rgba(255,255,255,0.18)'}}/>
                  <div style={{fontSize:8, opacity:0.5, fontWeight:600}}>{dayKeys[i]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Withdraw CTA */}
          <button className="pg-btn pg-btn-aqua" style={{width:'100%', height:50, fontSize:15, borderRadius:14, marginBottom:6}}>
            {ArrowUp(16,'var(--pg-blue-900)')} {withdrawLbl}
          </button>
          <div style={{fontSize:11, color:'var(--pg-ink-500)', textAlign:'center', marginBottom:20}}>{minLbl}</div>

          {/* Tabs */}
          <div className="pg-seg" style={{marginBottom:14}}>
            <button className={`pg-seg-btn ${tab==='pending'?'on':''}`} onClick={()=>setTab('pending')}>
              {pendingLbl} ({d.pending.length})
            </button>
            <button className={`pg-seg-btn ${tab==='history'?'on':''}`} onClick={()=>setTab('history')}>{historyLbl}</button>
          </div>

          {tab==='pending' && (
            <div style={{display:'flex', flexDirection:'column', gap:10}}>
              {d.pending.map(p => (
                <div key={p.id} className="pg-card" style={{padding:'13px 14px'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10}}>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontSize:13, fontWeight:600, letterSpacing:'-0.005em'}}>{tr(p.title, lang)}</div>
                      <div style={{fontSize:11.5, color:'var(--pg-ink-500)', marginTop:3}}>{p.client} · {tr(p.date, lang)}</div>
                    </div>
                    <div style={{fontFamily:'var(--pg-font-display)', fontSize:20, fontWeight:700, color:'var(--pg-aqua-700)', letterSpacing:'-0.02em'}}>${p.amount}</div>
                  </div>
                  <div style={{marginTop:9, display:'flex', alignItems:'center', gap:6}}>
                    <div style={{width:7, height:7, borderRadius:'50%', background:'oklch(0.72 0.18 80)', flexShrink:0}}/>
                    <span style={{fontSize:11, color:'oklch(0.55 0.18 80)', fontWeight:600}}>{awaitLbl}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab==='history' && (
            <div style={{display:'flex', flexDirection:'column', gap:1}}>
              {d.history.map(h => (
                <div key={h.id} style={{display:'flex', alignItems:'center', gap:12, padding:'12px 2px', borderBottom:'0.5px solid var(--pg-ink-100)'}}>
                  <div style={{width:38, height:38, borderRadius:11, flexShrink:0, background:h.type==='credit'?'var(--pg-aqua-100)':'oklch(0.95 0.04 20)', display:'flex', alignItems:'center', justifyContent:'center'}}>
                    {h.type==='credit' ? ArrowUp(16,'var(--pg-aqua-700)') : ArrowDown(16,'oklch(0.45 0.18 20)')}
                  </div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{tr(h.title, lang)}</div>
                    <div style={{fontSize:11, color:'var(--pg-ink-500)', marginTop:1}}>{tr(h.date, lang)}</div>
                  </div>
                  <div style={{fontFamily:'var(--pg-font-display)', fontSize:15, fontWeight:700, letterSpacing:'-0.02em', color:h.type==='credit'?'var(--pg-aqua-700)':'oklch(0.45 0.18 20)'}}>
                    {h.type==='credit'?'+':'-'}${h.amount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Sheet>
  );
}

// ── Work Lifecycle Sheet ──────────────────────────────────────
function WorkLifecycleSheet({ open, onClose, app, lang='en', onReview }) {
  const stageOf = (s) => ({ paid:3, completed:2, in_progress:1 }[s] ?? 0);
  const [stage, setStage] = React.useState(0);
  const [photo, setPhoto] = React.useState(null);
  const [advancing, setAdvancing] = React.useState(false);

  React.useEffect(() => {
    if (open && app) { setStage(stageOf(app.status)); setPhoto(null); setAdvancing(false); }
  }, [open, app]);

  if (!app) return null;

  const stageNames = {
    en: ['Hired', 'In Progress', 'Completed', 'Paid'],
    pt: ['Contratado', 'Em Andamento', 'Concluído', 'Pago'],
    es: ['Contratado', 'En Progreso', 'Completado', 'Pagado'],
  };
  const sn = stageNames[lang] || stageNames.en;

  const startLbl    = lang==='pt' ? 'Iniciar trabalho' : lang==='es' ? 'Iniciar trabajo' : 'Start job';
  const photoLbl    = lang==='pt' ? 'Tirar foto de conclusão' : lang==='es' ? 'Tomar foto final' : 'Take completion photo';
  const markDoneLbl = lang==='pt' ? 'Marcar como concluído' : lang==='es' ? 'Marcar completado' : 'Mark as complete';
  const awaitPayLbl = lang==='pt' ? 'Aguardando liberação do pagamento…' : lang==='es' ? 'Esperando liberación del pago…' : 'Awaiting payment release…';
  const paidLbl     = lang==='pt' ? 'Pagamento recebido!' : lang==='es' ? '¡Pago recibido!' : 'Payment received!';
  const reviewLbl   = lang==='pt' ? 'Avaliar o contratante' : lang==='es' ? 'Calificar al contratante' : 'Rate the client';
  const detailLbl   = lang==='pt' ? 'Detalhes do trabalho' : lang==='es' ? 'Detalle del trabajo' : 'Job details';
  const simLbl      = lang==='pt' ? 'Toque para simular foto' : lang==='es' ? 'Toca para simular foto' : 'Tap to simulate photo';
  const closeLbl    = lang==='pt' ? 'Fechar' : lang==='es' ? 'Cerrar' : 'Close';

  const CameraIcon = (s=20,c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
      <circle cx="12" cy="13" r="3"/>
    </svg>
  );
  const DollarIcon = (s=20,c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  );

  const handleStart = () => setStage(1);

  const handleTakePhoto = () => {
    const lock = (Date.now() % 9) + 1;
    setPhoto(`https://loremflickr.com/400/280/swimming,pool,service?lock=${lock}`);
  };

  const handleMarkDone = () => {
    setAdvancing(true);
    setTimeout(() => setStage(2), 400);
    setTimeout(() => { setStage(3); setAdvancing(false); }, 2000);
  };

  const amtStr = app.price ? `$${app.price}` : (lang==='pt'?'Negociável':lang==='es'?'Negociable':'Negotiable');

  // stepper visual
  const stepIcons = [Icon.check, Icon.bolt, CameraIcon, DollarIcon];
  const stepBg = (i) => {
    if (stage > i) return 'var(--pg-aqua-500)';
    if (stage === i) return 'var(--pg-blue-500)';
    return 'var(--pg-ink-100)';
  };
  const stepIconColor = (i) => (stage >= i ? '#fff' : 'var(--pg-ink-400)');
  const connBg = (i) => stage > i ? 'var(--pg-aqua-400)' : 'var(--pg-ink-200)';

  return (
    <Sheet open={open} onClose={onClose} height="88%">
      <div style={{overflow:'auto', height:'100%'}}>
        <div style={{padding:'4px 18px 30px'}}>
          {/* Header */}
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14}}>
            <h2 style={{margin:0, fontSize:18, fontWeight:700, letterSpacing:'-0.01em'}}>{detailLbl}</h2>
            <button onClick={onClose} style={{border:'none', background:'var(--pg-ink-100)', width:30, height:30, borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
              {Icon.x(16,'var(--pg-ink-700)')}
            </button>
          </div>

          {/* Job summary card */}
          <div className="pg-card" style={{padding:'12px 14px', marginBottom:22}}>
            <div style={{display:'flex', gap:10, alignItems:'center'}}>
              <Avatar name={app.poster} size={38}/>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:14, fontWeight:700, letterSpacing:'-0.01em', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{tr(app.title, lang)}</div>
                <div style={{fontSize:12, color:'var(--pg-ink-500)', marginTop:2, display:'flex', alignItems:'center', gap:5}}>
                  {Icon.pin(11,'var(--pg-ink-400)')} {app.loc} · {app.poster}
                </div>
              </div>
              <div style={{fontFamily:'var(--pg-font-display)', fontSize:20, fontWeight:700, color:'var(--pg-blue-500)', letterSpacing:'-0.02em', flexShrink:0}}>{amtStr}</div>
            </div>
          </div>

          {/* Progress stepper */}
          <div style={{display:'flex', alignItems:'flex-start', marginBottom:26}}>
            {[0,1,2,3].map(i => (
              <React.Fragment key={i}>
                <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:5, minWidth:0}}>
                  <div style={{
                    width:38, height:38, borderRadius:'50%',
                    background: stepBg(i),
                    display:'flex', alignItems:'center', justifyContent:'center',
                    boxShadow: stage===i ? '0 0 0 4px var(--pg-blue-100)' : 'none',
                    transition:'all .3s ease', flexShrink:0,
                  }}>
                    {stepIcons[i](16, stepIconColor(i))}
                  </div>
                  <div style={{fontSize:9, fontWeight:700, letterSpacing:'0.01em', textAlign:'center', width:60, color: stage>=i?'var(--pg-ink-900)':'var(--pg-ink-400)', lineHeight:1.2}}>{sn[i]}</div>
                </div>
                {i < 3 && (
                  <div style={{flex:1, height:2, borderRadius:2, background:connBg(i), margin:'19px 3px 0', transition:'background .5s ease'}}/>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* ── Stage 0: Hired ── */}
          {stage === 0 && (
            <div style={{display:'flex', flexDirection:'column', gap:14}}>
              <div className="pg-card" style={{padding:'14px 16px', background:'var(--pg-aqua-50)', border:'0.5px solid var(--pg-aqua-300)'}}>
                <div style={{display:'flex', gap:10, alignItems:'flex-start'}}>
                  <div style={{width:36, height:36, borderRadius:10, background:'var(--pg-aqua-500)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                    {Icon.check(18,'#fff')}
                  </div>
                  <div>
                    <div style={{fontSize:14, fontWeight:700, color:'var(--pg-aqua-700)'}}>
                      {lang==='pt'?'Você foi contratado!':lang==='es'?'¡Fuiste contratado!':'You\'re hired!'}
                    </div>
                    <div style={{fontSize:12.5, color:'var(--pg-aqua-600)', marginTop:4, lineHeight:1.45}}>
                      {lang==='pt'?'Confirme o início quando chegar no local. O pagamento será liberado após a conclusão.':lang==='es'?'Confirma el inicio al llegar al lugar. El pago se liberará al completar.':'Confirm start when you arrive on-site. Payment will be released upon completion.'}
                    </div>
                  </div>
                </div>
              </div>
              <button onClick={handleStart} className="pg-btn pg-btn-primary" style={{width:'100%', height:52, fontSize:16}}>
                {Icon.bolt(18,'#fff')} {startLbl}
              </button>
            </div>
          )}

          {/* ── Stage 1: In Progress ── */}
          {stage === 1 && (
            <div style={{display:'flex', flexDirection:'column', gap:14}}>
              <div className="pg-card" style={{padding:'13px 16px', background:'var(--pg-blue-50)', border:'0.5px solid var(--pg-blue-200)'}}>
                <div style={{display:'flex', gap:10, alignItems:'center'}}>
                  {Icon.bolt(18,'var(--pg-blue-600)')}
                  <div style={{fontSize:13, color:'var(--pg-blue-700)', fontWeight:600}}>
                    {lang==='pt'?'Tire uma foto ao concluir todos os serviços.':lang==='es'?'Toma una foto al finalizar los servicios.':'Take a photo when all services are complete.'}
                  </div>
                </div>
              </div>

              {/* Photo area */}
              <div onClick={handleTakePhoto} style={{
                borderRadius:14, overflow:'hidden',
                border: photo ? 'none' : '2px dashed var(--pg-ink-300)',
                background:'var(--pg-ink-50)', minHeight:160,
                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                cursor:'pointer',
              }}>
                {photo ? (
                  <div style={{position:'relative', width:'100%'}}>
                    <img src={photo} alt="proof" style={{width:'100%', height:170, objectFit:'cover', display:'block'}}/>
                    <div style={{position:'absolute', top:10, right:10, background:'var(--pg-aqua-500)', borderRadius:20, padding:'4px 10px', display:'flex', alignItems:'center', gap:5}}>
                      {Icon.check(12,'#fff')}
                      <span style={{fontSize:11, color:'#fff', fontWeight:700}}>
                        {lang==='pt'?'Foto salva':lang==='es'?'Foto guardada':'Photo saved'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div style={{padding:24, textAlign:'center'}}>
                    {CameraIcon(34,'var(--pg-ink-400)')}
                    <div style={{marginTop:10, fontSize:13.5, color:'var(--pg-ink-600)', fontWeight:600}}>{photoLbl}</div>
                    <div style={{fontSize:11.5, color:'var(--pg-ink-400)', marginTop:5}}>{simLbl}</div>
                  </div>
                )}
              </div>

              <button onClick={handleMarkDone}
                disabled={!photo || advancing}
                className="pg-btn pg-btn-primary"
                style={{width:'100%', height:52, fontSize:16, opacity:photo&&!advancing?1:0.5}}>
                {advancing
                  ? <span style={{display:'inline-flex', alignItems:'center', gap:8}}>
                      <span style={{width:16, height:16, border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', borderRadius:'50%', animation:'pg-spin .7s linear infinite', display:'inline-block'}}/>
                      {lang==='pt'?'Processando…':lang==='es'?'Procesando…':'Processing…'}
                    </span>
                  : <>{CameraIcon(18,'#fff')} {markDoneLbl}</>
                }
              </button>
            </div>
          )}

          {/* ── Stage 2: Completed — awaiting payment ── */}
          {stage === 2 && (
            <div className="pg-card" style={{padding:'18px 16px', background:'oklch(0.97 0.04 80)', border:'0.5px solid oklch(0.88 0.10 80)'}}>
              <div style={{display:'flex', gap:12, alignItems:'center'}}>
                <div style={{
                  width:44, height:44, borderRadius:'50%', flexShrink:0,
                  background:'oklch(0.88 0.15 80)', display:'flex', alignItems:'center', justifyContent:'center',
                  animation:'pg-spin 2s linear infinite',
                }}>
                  {DollarIcon(22,'oklch(0.45 0.18 80)')}
                </div>
                <div>
                  <div style={{fontSize:14, fontWeight:700, color:'oklch(0.45 0.18 80)'}}>{awaitPayLbl}</div>
                  <div style={{fontSize:12.5, color:'oklch(0.55 0.18 80)', marginTop:4, lineHeight:1.45}}>
                    {lang==='pt'?'O cliente está liberando o pagamento em escrow. Isso leva alguns segundos.':lang==='es'?'El cliente está liberando el pago en escrow. Tarda unos segundos.':'The client is releasing the escrowed payment. This takes a few seconds.'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Stage 3: Paid ── */}
          {stage === 3 && (
            <div style={{display:'flex', flexDirection:'column', gap:14}}>
              <div style={{textAlign:'center', padding:'12px 0 4px'}}>
                <div style={{width:80, height:80, borderRadius:'50%', background:'var(--pg-aqua-100)', margin:'0 auto 14px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                  {DollarIcon(36,'var(--pg-aqua-700)')}
                </div>
                <div style={{fontFamily:'var(--pg-font-display)', fontSize:22, fontWeight:700, letterSpacing:'-0.02em', color:'var(--pg-aqua-700)'}}>{paidLbl}</div>
                <div style={{fontFamily:'var(--pg-font-display)', fontSize:36, fontWeight:700, letterSpacing:'-0.04em', color:'var(--pg-aqua-500)', marginTop:6, lineHeight:1}}>{amtStr}</div>
                <div style={{fontSize:13, color:'var(--pg-ink-500)', marginTop:10, lineHeight:1.5}}>
                  {lang==='pt'?'Valor adicionado à sua carteira PoolGuyPro.':lang==='es'?'Importe añadido a tu cartera PoolGuyPro.':'Amount added to your PoolGuyPro wallet.'}
                </div>
              </div>
              <button onClick={()=>{ onClose(); if(onReview) onReview(app); }}
                className="pg-btn pg-btn-primary" style={{width:'100%', height:52, fontSize:16}}>
                {Icon.star(18,'#fff',true)} {reviewLbl}
              </button>
              <button onClick={onClose} style={{width:'100%', padding:'12px', border:'none', background:'transparent', color:'var(--pg-ink-500)', fontSize:14, cursor:'pointer', fontFamily:'inherit'}}>
                {closeLbl}
              </button>
            </div>
          )}
        </div>
      </div>
    </Sheet>
  );
}

// ── Review Sheet ──────────────────────────────────────────────
function ReviewSheet({ open, onClose, app, lang='en', onSubmitDone }) {
  const [rating, setRating] = React.useState(0);
  const [hover, setHover] = React.useState(0);
  const [comment, setComment] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(() => {
    if (open) { setRating(0); setHover(0); setComment(''); setSubmitted(false); }
  }, [open]);

  const titleLbl  = lang==='pt' ? 'Avaliar o contratante' : lang==='es' ? 'Calificar al contratante' : 'Rate the client';
  const reviewPh  = lang==='pt' ? 'Compartilhe sua experiência com este trabalho…' : lang==='es' ? 'Comparte tu experiencia con este trabajo…' : 'Share your experience with this job…';
  const submitLbl = lang==='pt' ? 'Enviar avaliação' : lang==='es' ? 'Enviar reseña' : 'Submit review';
  const sentLbl   = lang==='pt' ? 'Avaliação enviada!' : lang==='es' ? '¡Reseña enviada!' : 'Review submitted!';
  const sentSubLbl= lang==='pt' ? 'Obrigado! Sua avaliação ajuda a comunidade de pool guys.' : lang==='es' ? '¡Gracias! Tu reseña ayuda a la comunidad.' : 'Thanks! Your review helps the pool guy community.';
  const skipLbl   = lang==='pt' ? 'Pular por agora' : lang==='es' ? 'Omitir por ahora' : 'Skip for now';

  const starLabels = {
    en: ['Terrible','Bad','OK','Good','Excellent'],
    pt: ['Péssimo','Ruim','Ok','Bom','Excelente'],
    es: ['Pésimo','Malo','Ok','Bueno','Excelente'],
  };
  const sLabels = (starLabels[lang] || starLabels.en);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => { if(onSubmitDone) onSubmitDone(); onClose(); }, 1800);
  };

  const displayed = hover || rating;

  return (
    <Sheet open={open} onClose={onClose} height="auto">
      <div style={{padding:'6px 20px 36px'}}>
        {submitted ? (
          <div style={{textAlign:'center', padding:'20px 0 10px'}}>
            <div style={{width:68, height:68, borderRadius:'50%', background:'var(--pg-aqua-100)', margin:'0 auto 14px', display:'flex', alignItems:'center', justifyContent:'center'}}>
              {Icon.check(30,'var(--pg-aqua-700)')}
            </div>
            <div style={{fontSize:20, fontWeight:700, letterSpacing:'-0.02em'}}>{sentLbl}</div>
            <div style={{fontSize:13, color:'var(--pg-ink-500)', marginTop:8, lineHeight:1.5}}>{sentSubLbl}</div>
          </div>
        ) : (
          <>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
              <h2 style={{margin:0, fontSize:18, fontWeight:700, letterSpacing:'-0.01em'}}>{titleLbl}</h2>
              <button onClick={onClose} style={{border:'none', background:'var(--pg-ink-100)', width:30, height:30, borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
                {Icon.x(16,'var(--pg-ink-700)')}
              </button>
            </div>

            {app && (
              <div style={{display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:11, background:'var(--pg-blue-50)', border:'0.5px solid var(--pg-blue-100)', marginBottom:20}}>
                <Avatar name={app.poster} size={34}/>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:13, fontWeight:700}}>{app.poster}</div>
                  <div style={{fontSize:11, color:'var(--pg-ink-500)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{tr(app.title, lang)}</div>
                </div>
              </div>
            )}

            {/* Star picker */}
            <div style={{textAlign:'center', marginBottom:20}}>
              <div style={{display:'flex', justifyContent:'center', gap:6, marginBottom:10}}>
                {[1,2,3,4,5].map(s => (
                  <button key={s}
                    onMouseEnter={()=>setHover(s)} onMouseLeave={()=>setHover(0)}
                    onClick={()=>setRating(s)}
                    style={{border:'none', background:'transparent', cursor:'pointer', padding:4, transform: displayed>=s?'scale(1.1)':'scale(1)', transition:'transform .12s'}}>
                    {Icon.star(38, displayed>=s?'oklch(0.78 0.18 80)':'var(--pg-ink-200)', displayed>=s)}
                  </button>
                ))}
              </div>
              {displayed > 0 && (
                <div style={{fontSize:15, fontWeight:700, color:'oklch(0.55 0.18 80)', letterSpacing:'-0.01em'}}>{sLabels[displayed-1]}</div>
              )}
            </div>

            <textarea
              value={comment}
              onChange={e=>setComment(e.target.value)}
              placeholder={reviewPh}
              rows={3}
              style={{
                width:'100%', borderRadius:12, border:'1px solid var(--pg-ink-200)',
                padding:'12px 14px', fontSize:14, fontFamily:'inherit',
                resize:'none', outline:'none', background:'var(--pg-ink-50)',
                boxSizing:'border-box', color:'var(--pg-ink-900)', lineHeight:1.5,
              }}
            />

            <button onClick={handleSubmit}
              disabled={rating===0}
              className="pg-btn pg-btn-primary"
              style={{width:'100%', height:52, fontSize:16, marginTop:14, opacity:rating>0?1:0.45}}>
              {Icon.star(18,'#fff',true)} {submitLbl}
            </button>
            <button onClick={onClose} style={{width:'100%', padding:'10px', border:'none', background:'transparent', color:'var(--pg-ink-500)', fontSize:13, cursor:'pointer', fontFamily:'inherit'}}>
              {skipLbl}
            </button>
          </>
        )}
      </div>
    </Sheet>
  );
}

// ── Apply to Job Sheet ────────────────────────────────────────
function ApplyJobSheet({ open, onClose, job, user, lang='en', onSubmit, onEditProfile }) {
  const [note,      setNote]      = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(() => {
    if (open) { setNote(''); setSubmitted(false); }
  }, [open]);

  if (!job) return null;

  const s = (en, pt, es) => lang==='pt' ? pt : lang==='es' ? es : en;

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => onSubmit && onSubmit(), 2000);
  };

  // ── Icon helpers ──
  const CarIcon = (c='var(--pg-ink-500)') => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h1l3-4h9l3 4h1a2 2 0 012 2v6a2 2 0 01-2 2h-2"/>
      <circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/>
    </svg>
  );
  const LicenseIcon = (c='var(--pg-ink-500)') => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="13" rx="2"/>
      <path d="M7 10h4M7 14h6M15 10h2v4h-2z"/>
    </svg>
  );
  const ToolIcon = (c='var(--pg-ink-500)') => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 7a4 4 0 1 0-5 5l-6 6 3 3 6-6a4 4 0 0 0 5-5l-3 3-3-3z"/>
    </svg>
  );

  const Chip = ({icon, label, green}) => (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:5,
      fontSize:12, fontWeight:600, padding:'5px 10px', borderRadius:999,
      background: green ? 'var(--pg-aqua-100)' : 'var(--pg-ink-100)',
      color:      green ? 'var(--pg-aqua-800)' : 'var(--pg-ink-600)',
    }}>
      {icon} {label}
    </span>
  );

  const equipment = (tr(user.equipment, lang) || []);
  const hasExp    = user.experience && user.experience.length > 0;

  // Success screen
  if (submitted) {
    return (
      <Sheet open={open} onClose={onClose} height="auto">
        <div style={{padding:'20px 20px 50px', textAlign:'center'}}>
          <div style={{
            width:72, height:72, borderRadius:'50%',
            background:'var(--pg-aqua-100)', margin:'0 auto 16px',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            {Icon.check(32,'var(--pg-aqua-700)')}
          </div>
          <div style={{fontSize:22, fontWeight:700, letterSpacing:'-0.02em', marginBottom:8}}>
            {s('Application sent!','Candidatura enviada!','¡Postulación enviada!')}
          </div>
          <div style={{fontSize:14, color:'var(--pg-ink-500)', lineHeight:1.55, maxWidth:260, margin:'0 auto'}}>
            {s(`${job.company} will review your profile and get in touch.`,
               `${job.company} vai analisar seu perfil e entrar em contato.`,
               `${job.company} revisará tu perfil y se pondrá en contacto.`)}
          </div>
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onClose={onClose} height="92%">
      <div style={{padding:'6px 18px 44px'}}>

        {/* Header */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18}}>
          <h2 style={{margin:0, fontSize:18, fontWeight:700, letterSpacing:'-0.01em'}}>
            {s('Apply for job','Candidatar-se','Postularse')}
          </h2>
          <button onClick={onClose} style={{border:'none', background:'var(--pg-ink-100)', width:30, height:30, borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
            {Icon.x(16,'var(--pg-ink-700)')}
          </button>
        </div>

        {/* Job card */}
        <div style={{
          padding:'13px 14px', borderRadius:14, marginBottom:22,
          background:'var(--pg-blue-900)',
          display:'flex', alignItems:'center', gap:12,
        }}>
          <div style={{
            width:44, height:44, borderRadius:12, flexShrink:0,
            background:'rgba(255,255,255,0.12)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontWeight:800, fontSize:18, color:'#fff',
            fontFamily:'var(--pg-font-display)',
          }}>{job.company[0]}</div>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontSize:15, fontWeight:700, color:'#fff', letterSpacing:'-0.01em', marginBottom:2}}>{job.company}</div>
            <div style={{fontSize:12.5, color:'rgba(255,255,255,0.65)'}}>{tr(job.role, lang)} · {job.loc}</div>
          </div>
          <div style={{textAlign:'right', flexShrink:0}}>
            <div style={{fontFamily:'var(--pg-font-display)', fontSize:15, fontWeight:700,
              color:'oklch(0.88 0.16 90)', letterSpacing:'-0.01em'}}>{tr(job.pay, lang)}</div>
            <div style={{fontSize:11, color:'rgba(255,255,255,0.45)', marginTop:1}}>{tr(job.type, lang)}</div>
          </div>
        </div>

        {/* Profile summary — auto-filled */}
        <div style={{marginBottom:20}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10}}>
            <div style={{fontSize:11, fontWeight:700, color:'var(--pg-ink-400)', letterSpacing:'0.06em'}}>
              {s('YOUR PROFILE (auto-filled)','SEU PERFIL (preenchido automaticamente)','TU PERFIL (llenado automáticamente)')}
            </div>
            <span onClick={onEditProfile} style={{fontSize:11, color:'var(--pg-blue-500)', fontWeight:600, cursor:'pointer'}}>
              {s('Edit profile','Editar perfil','Editar perfil')} →
            </span>
          </div>

          {/* Name */}
          <div style={{
            display:'flex', alignItems:'center', gap:10,
            padding:'11px 14px', borderRadius:12,
            background:'var(--pg-blue-50)', border:'0.5px solid var(--pg-blue-100)',
            marginBottom:10,
          }}>
            <Avatar name={user.name} size={38}/>
            <div>
              <div style={{fontSize:14, fontWeight:700, color:'var(--pg-ink-900)'}}>{user.name}</div>
              <div style={{display:'flex', alignItems:'center', gap:4, marginTop:2}}>
                <Stars rating={user.rating} size={10}/>
                <span style={{fontSize:11.5, color:'var(--pg-ink-500)', fontWeight:600}}>{user.rating} · {user.reviews} {s('reviews','avaliações','reseñas')}</span>
              </div>
            </div>
          </div>

          {/* Basic info chips */}
          <div style={{display:'flex', flexWrap:'wrap', gap:6, marginBottom:10}}>
            {user.age && (
              <Chip icon={
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--pg-ink-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="5"/><path d="M3 21v-1a9 9 0 0118 0v1"/>
                </svg>
              } label={`${user.age} ${s('yrs','anos','años')}`}/>
            )}
            {user.region && (
              <Chip icon={Icon.pin(12,'var(--pg-ink-500)')} label={user.region}/>
            )}
            <Chip
              icon={CarIcon(user.hasCar ? 'var(--pg-aqua-700)' : 'var(--pg-ink-400)')}
              label={user.hasCar ? s('Own vehicle','Veículo próprio','Vehículo propio') : s('No vehicle','Sem veículo','Sin vehículo')}
              green={user.hasCar}/>
            <Chip
              icon={LicenseIcon(user.hasLicense ? 'var(--pg-aqua-700)' : 'var(--pg-ink-400)')}
              label={user.hasLicense ? s("Valid driver's license",'CNH válida','Licencia válida') : s('No license','Sem CNH','Sin licencia')}
              green={user.hasLicense}/>
          </div>

          {/* Equipment */}
          {equipment.length > 0 && (
            <div style={{marginBottom:10}}>
              <div style={{fontSize:10.5, fontWeight:700, color:'var(--pg-ink-400)', letterSpacing:'0.06em', marginBottom:6}}>
                {s('EQUIPMENT','EQUIPAMENTOS','EQUIPOS')}
              </div>
              <div style={{display:'flex', flexWrap:'wrap', gap:5}}>
                {equipment.map((eq,i) => (
                  <span key={i} style={{
                    display:'inline-flex', alignItems:'center', gap:4,
                    fontSize:11.5, fontWeight:600, padding:'4px 9px', borderRadius:999,
                    background:'var(--pg-blue-50)', border:'0.5px solid var(--pg-blue-200)',
                    color:'var(--pg-blue-800)',
                  }}>
                    {ToolIcon('var(--pg-blue-600)')} {eq}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {hasExp && (
            <div>
              <div style={{fontSize:10.5, fontWeight:700, color:'var(--pg-ink-400)', letterSpacing:'0.06em', marginBottom:6}}>
                {s('WORK EXPERIENCE','EXPERIÊNCIA','EXPERIENCIA')}
              </div>
              <div style={{display:'flex', flexDirection:'column', gap:7}}>
                {user.experience.map((exp, i) => (
                  <div key={i} style={{
                    padding:'10px 12px', borderRadius:10,
                    background:'var(--pg-ink-50)', border:'0.5px solid var(--pg-ink-200)',
                    borderLeft:'3px solid var(--pg-blue-400)',
                  }}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8, marginBottom:3}}>
                      <div>
                        <div style={{fontSize:13, fontWeight:700, color:'var(--pg-ink-900)'}}>{tr(exp.role, lang)}</div>
                        <div style={{fontSize:11.5, color:'var(--pg-ink-500)', marginTop:1}}>{exp.company}</div>
                      </div>
                      <span style={{fontSize:11, fontWeight:700, color:'var(--pg-blue-600)',
                        background:'var(--pg-blue-50)', padding:'2px 7px', borderRadius:5, flexShrink:0}}>
                        {tr(exp.duration, lang)}
                      </span>
                    </div>
                    <p style={{margin:0, fontSize:11.5, color:'var(--pg-ink-600)', lineHeight:1.45}}>
                      {tr(exp.desc, lang)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Optional note */}
        <div style={{marginBottom:22}}>
          <div style={{fontSize:11, fontWeight:700, color:'var(--pg-ink-400)', letterSpacing:'0.06em', marginBottom:8}}>
            {s('MESSAGE TO EMPLOYER (optional)','MENSAGEM PARA O EMPREGADOR (opcional)','MENSAJE AL EMPLEADOR (opcional)')}
          </div>
          <textarea
            value={note}
            onChange={e=>setNote(e.target.value)}
            placeholder={s(
              'Tell them why you\'re a great fit, your availability, or anything else relevant…',
              'Diga por que você é o candidato ideal, sua disponibilidade ou qualquer outro detalhe relevante…',
              'Cuéntales por qué eres ideal para el puesto, tu disponibilidad u otros detalles relevantes…'
            )}
            rows={3}
            style={{
              width:'100%', boxSizing:'border-box', padding:'12px 14px',
              borderRadius:12, border:'1px solid var(--pg-ink-200)',
              background:'var(--pg-ink-50)', fontSize:13.5, fontFamily:'inherit',
              color:'var(--pg-ink-900)', lineHeight:1.5,
              resize:'none', outline:'none',
            }}
          />
        </div>

        {/* Submit */}
        <button onClick={handleSubmit} className="pg-btn pg-btn-primary"
          style={{width:'100%', height:54, fontSize:16, borderRadius:14, gap:8}}>
          {Icon.check(18,'#fff')}
          {s('Send application','Enviar candidatura','Enviar postulación')}
        </button>
        <div style={{textAlign:'center', marginTop:10, fontSize:11.5, color:'var(--pg-ink-400)', lineHeight:1.5}}>
          {s('Your profile data will be shared with the employer.',
             'Seus dados de perfil serão compartilhados com o empregador.',
             'Tus datos de perfil serán compartidos con el empleador.')}
        </div>
      </div>
    </Sheet>
  );
}

// ── Hiring Application Detail Sheet ──────────────────────────
function HiringAppDetailSheet({ open, onClose, app, lang='en' }) {
  if (!app) return null;

  const isPending  = app.status === 'pending';
  const isAccepted = app.status === 'accepted';
  const isRejected = app.status === 'rejected';

  const appliedLbl  = lang==='pt' ? 'Candidatura enviada'              : lang==='es' ? 'Postulación enviada'             : 'Application sent';
  const waitingLbl  = lang==='pt' ? 'Aguardando resposta da empresa'    : lang==='es' ? 'Esperando respuesta de la empresa': 'Awaiting company response';
  const hiredLbl    = lang==='pt' ? 'Você foi contratado!'              : lang==='es' ? '¡Fuiste contratado!'             : 'You got the job!';
  const hiredSubLbl = lang==='pt' ? 'Parabéns! Veja os próximos passos.': lang==='es' ? '¡Felicidades! Próximos pasos.'   : 'Congratulations! See next steps below.';
  const rejectedLbl = lang==='pt' ? 'Candidatura encerrada'             : lang==='es' ? 'Postulación cerrada'             : 'Application closed';
  const startLbl    = lang==='pt' ? 'Data de início'                    : lang==='es' ? 'Fecha de inicio'                 : 'Start date';
  const contactLbl  = lang==='pt' ? 'Contato na empresa'                : lang==='es' ? 'Contacto en la empresa'          : 'Company contact';
  const perksLbl    = lang==='pt' ? 'Benefícios'                        : lang==='es' ? 'Beneficios'                      : 'Benefits';
  const withdrawLbl = lang==='pt' ? 'Retirar candidatura'               : lang==='es' ? 'Retirar postulación'             : 'Withdraw application';
  const lookMoreLbl = lang==='pt' ? 'Ver outras vagas'                   : lang==='es' ? 'Ver más empleos'                 : 'Browse more jobs';
  const messageLbl  = lang==='pt' ? 'Enviar mensagem'                    : lang==='es' ? 'Enviar mensaje'                  : 'Send message';
  const reasonLbl   = lang==='pt' ? 'Motivo informado pela empresa'      : lang==='es' ? 'Motivo informado por la empresa' : 'Reason provided by company';
  const sentLbl     = lang==='pt' ? `Enviada há ${app.when}`             : lang==='es' ? `Enviada hace ${app.when}`        : `Sent ${app.when} ago`;
  const appliedOnLbl= app.appliedDate ? (
    lang==='pt' ? `Candidatura enviada em ${tr(app.appliedDate, lang)}`
    : lang==='es' ? `Postulación enviada el ${tr(app.appliedDate, lang)}`
    : `Applied on ${tr(app.appliedDate, lang)}`
  ) : sentLbl;

  const statusCfg = isPending ? {
    bg:'oklch(0.96 0.05 68)', border:'oklch(0.85 0.10 68)',
    iconBg:'oklch(0.88 0.14 68)', color:'oklch(0.42 0.18 68)',
    emoji:'⏳', title:appliedLbl, sub:waitingLbl,
  } : isAccepted ? {
    bg:'var(--pg-aqua-50)', border:'var(--pg-aqua-200)',
    iconBg:'var(--pg-aqua-100)', color:'var(--pg-aqua-800)',
    emoji:'🎉', title:hiredLbl, sub:hiredSubLbl,
  } : {
    bg:'oklch(0.97 0.02 20)', border:'oklch(0.88 0.08 20)',
    iconBg:'oklch(0.92 0.05 20)', color:'oklch(0.42 0.18 20)',
    emoji:'✕', title:rejectedLbl, sub:'',
  };

  const PhoneIcon = (color='#fff') => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 2.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/>
    </svg>
  );
  const EmailIcon = (color='var(--pg-aqua-700)') => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );
  const CalIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--pg-aqua-700)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );

  return (
    <Sheet open={open} onClose={onClose} height="auto">
      <div style={{padding:'6px 20px 44px'}}>

        {/* Drag + close */}
        <div style={{display:'flex', justifyContent:'flex-end', marginBottom:16}}>
          <button onClick={onClose} style={{border:'none', background:'var(--pg-ink-100)', width:30, height:30, borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
            {Icon.x(16,'var(--pg-ink-700)')}
          </button>
        </div>

        {/* Company header */}
        <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:18}}>
          <div style={{
            width:52, height:52, borderRadius:14, flexShrink:0,
            background:'var(--pg-blue-100)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontWeight:800, fontSize:22, color:'var(--pg-blue-700)',
            fontFamily:'var(--pg-font-display)',
          }}>
            {app.company[0]}
          </div>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontSize:18, fontWeight:700, letterSpacing:'-0.015em', color:'var(--pg-ink-900)'}}>{app.company}</div>
            <div style={{fontSize:14, color:'var(--pg-ink-600)', marginTop:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{tr(app.title, lang)}</div>
          </div>
        </div>

        {/* Meta chips */}
        <div style={{display:'flex', gap:7, flexWrap:'wrap', marginBottom:20}}>
          <span style={{display:'inline-flex', alignItems:'center', gap:4, fontSize:12, color:'var(--pg-ink-500)', padding:'4px 10px', borderRadius:999, background:'var(--pg-ink-100)'}}>
            {Icon.pin(11,'var(--pg-ink-400)')} {app.loc}
          </span>
          <span style={{display:'inline-flex', alignItems:'center', gap:4, fontSize:12, fontWeight:700, color:'var(--pg-blue-700)', padding:'4px 10px', borderRadius:999, background:'var(--pg-blue-50)'}}>
            {tr(app.pay, lang)}
          </span>
          {app.jobType && (
            <span style={{fontSize:12, color:'var(--pg-ink-500)', padding:'4px 10px', borderRadius:999, background:'var(--pg-ink-100)'}}>
              {tr(app.jobType, lang)}
            </span>
          )}
        </div>

        {/* Status banner */}
        <div style={{
          borderRadius:14, padding:'14px 16px', marginBottom:20,
          background:statusCfg.bg, border:`0.5px solid ${statusCfg.border}`,
        }}>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <div style={{
              width:38, height:38, borderRadius:11, flexShrink:0,
              background:statusCfg.iconBg,
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:18,
            }}>
              {statusCfg.emoji}
            </div>
            <div>
              <div style={{fontSize:15, fontWeight:700, color:statusCfg.color, letterSpacing:'-0.01em'}}>{statusCfg.title}</div>
              {statusCfg.sub && <div style={{fontSize:12, color:statusCfg.color, opacity:0.72, marginTop:2}}>{statusCfg.sub}</div>}
            </div>
          </div>
          {isPending && (
            <div style={{marginTop:10, paddingTop:10, borderTop:`0.5px solid ${statusCfg.border}`, fontSize:12, color:statusCfg.color, opacity:0.68}}>
              {appliedOnLbl}
            </div>
          )}
        </div>

        {/* Rejected: reason */}
        {isRejected && app.rejectReason && (
          <div style={{marginBottom:20, padding:'12px 14px', borderRadius:12, background:'oklch(0.97 0.02 20)', border:'0.5px solid oklch(0.88 0.08 20)'}}>
            <div style={{fontSize:10.5, fontWeight:700, letterSpacing:'0.07em', color:'oklch(0.55 0.15 20)', marginBottom:7}}>
              {reasonLbl.toUpperCase()}
            </div>
            <div style={{fontSize:13, color:'var(--pg-ink-600)', lineHeight:1.55, fontStyle:'italic'}}>
              "{tr(app.rejectReason, lang)}"
            </div>
          </div>
        )}

        {/* Accepted: start date */}
        {isAccepted && app.startDate && (
          <div style={{
            marginBottom:14, padding:'12px 14px', borderRadius:12,
            background:'var(--pg-aqua-50)', border:'0.5px solid var(--pg-aqua-200)',
            display:'flex', alignItems:'center', gap:10,
          }}>
            <div style={{width:38, height:38, borderRadius:10, background:'var(--pg-aqua-100)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
              {CalIcon}
            </div>
            <div>
              <div style={{fontSize:10.5, fontWeight:700, letterSpacing:'0.07em', color:'var(--pg-ink-400)'}}>{startLbl.toUpperCase()}</div>
              <div style={{fontSize:16, fontWeight:700, color:'var(--pg-aqua-800)', letterSpacing:'-0.01em'}}>{tr(app.startDate, lang)}</div>
            </div>
          </div>
        )}

        {/* Accepted: contact */}
        {isAccepted && app.contact && (
          <div style={{marginBottom:14, padding:'12px 14px', borderRadius:12, background:'var(--pg-blue-50)', border:'0.5px solid var(--pg-blue-100)'}}>
            <div style={{fontSize:10.5, fontWeight:700, letterSpacing:'0.07em', color:'var(--pg-ink-400)', marginBottom:10}}>
              {contactLbl.toUpperCase()}
            </div>
            <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
              <Avatar name={app.contact.name} size={32}/>
              <span style={{fontSize:14, fontWeight:700, color:'var(--pg-ink-900)'}}>{app.contact.name}</span>
            </div>
            <a href={`tel:${app.contact.phone}`} style={{display:'flex', alignItems:'center', gap:8, textDecoration:'none', padding:'7px 0', borderTop:'0.5px solid var(--pg-blue-100)'}}>
              <div style={{width:28, height:28, borderRadius:8, background:'var(--pg-blue-500)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                {PhoneIcon('#fff')}
              </div>
              <span style={{fontSize:14, fontWeight:700, color:'var(--pg-blue-700)'}}>{app.contact.phone}</span>
            </a>
            {app.contact.email && (
              <a href={`mailto:${app.contact.email}`} style={{display:'flex', alignItems:'center', gap:8, textDecoration:'none', padding:'7px 0', borderTop:'0.5px solid var(--pg-blue-100)'}}>
                <div style={{width:28, height:28, borderRadius:8, background:'var(--pg-aqua-100)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                  {EmailIcon()}
                </div>
                <span style={{fontSize:13, fontWeight:600, color:'var(--pg-aqua-700)'}}>{app.contact.email}</span>
              </a>
            )}
          </div>
        )}

        {/* Accepted: perks */}
        {isAccepted && app.perks && (
          <div style={{marginBottom:22}}>
            <div style={{fontSize:10.5, fontWeight:700, letterSpacing:'0.07em', color:'var(--pg-ink-400)', marginBottom:8}}>
              {perksLbl.toUpperCase()}
            </div>
            <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
              {(tr(app.perks, lang) || []).map((perk, i) => (
                <span key={i} style={{fontSize:12, fontWeight:600, padding:'4px 11px', borderRadius:999, background:'var(--pg-aqua-100)', color:'var(--pg-aqua-800)'}}>
                  ✓ {perk}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA buttons */}
        {isAccepted && (
          <button className="pg-btn pg-btn-aqua" style={{width:'100%', height:52, fontSize:15, borderRadius:14}}>
            {messageLbl}
          </button>
        )}
        {isPending && (
          <button className="pg-btn pg-btn-ghost" style={{width:'100%', height:46, fontSize:14, borderRadius:14, color:'var(--pg-danger)'}}>
            {withdrawLbl}
          </button>
        )}
        {isRejected && (
          <button onClick={onClose} className="pg-btn pg-btn-primary" style={{width:'100%', height:52, fontSize:15, borderRadius:14}}>
            {lookMoreLbl}
          </button>
        )}
      </div>
    </Sheet>
  );
}

// ── Edit Profile Sheet ────────────────────────────────────────
function EditProfileSheet({ open, onClose, user, setUser, lang='en' }) {
  const s = (en, pt, es) => lang==='pt' ? pt : lang==='es' ? es : en;

  const [name,         setName]         = React.useState('');
  const [age,          setAge]          = React.useState('');
  const [region,       setRegion]       = React.useState('');
  const [regionFocus,  setRegionFocus]  = React.useState(false);
  const [hasCar,       setHasCar]       = React.useState(false);
  const [hasLicense,   setHasLicense]   = React.useState(false);
  const [hasEquipment, setHasEquipment] = React.useState(false);
  const [equipment,    setEquipment]    = React.useState([]);
  const [eqInput,      setEqInput]      = React.useState('');
  const [experience,   setExperience]   = React.useState([]);
  const [addingExp,    setAddingExp]    = React.useState(false);
  const [newExp,       setNewExp]       = React.useState({company:'', role:'', duration:'', desc:''});
  const [photoUrl,     setPhotoUrl]     = React.useState('');
  const [photoUploading, setPhotoUploading] = React.useState(false);
  const photoInputRef = React.useRef(null);

  const REGION_LIST = [
    'Fort Lauderdale, FL','Weston, FL','Plantation, FL','Davie, FL','Sunrise, FL',
    'Pembroke Pines, FL','Hollywood, FL','Miramar, FL','Coral Springs, FL','Pompano Beach, FL',
    'Boca Raton, FL','Deerfield Beach, FL','Margate, FL','Tamarac, FL','Oakland Park, FL',
    'Hallandale Beach, FL','Dania Beach, FL','Lauderhill, FL','Lauderdale Lakes, FL','North Lauderdale, FL',
    'Miami, FL','Miami Beach, FL','Hialeah, FL','Doral, FL','Kendall, FL',
    'Coral Gables, FL','Aventura, FL','North Miami Beach, FL','Opa-locka, FL','Miami Lakes, FL',
    'Homestead, FL','Miami Gardens, FL','Cutler Bay, FL','Palmetto Bay, FL','Pinecrest, FL',
    'West Palm Beach, FL','Boca Raton, FL','Boynton Beach, FL','Delray Beach, FL','Lake Worth, FL',
    'Wellington, FL','Palm Beach Gardens, FL','Jupiter, FL','Riviera Beach, FL','Royal Palm Beach, FL',
    'Naples, FL','Cape Coral, FL','Fort Myers, FL','Bonita Springs, FL','Marco Island, FL',
    'Broward County, FL','Miami-Dade County, FL','Palm Beach County, FL',
  ];

  const regionSuggestions = region.trim().length >= 2
    ? REGION_LIST.filter(r => r.toLowerCase().includes(region.toLowerCase())).slice(0, 6)
    : [];

  React.useEffect(() => {
    if (!open || !user) return;
    setName(user.name || '');
    setAge(user.age ? String(user.age) : '');
    setRegion(user.region || '');
    setHasCar(!!user.hasCar);
    setHasLicense(!!user.hasLicense);
    setHasEquipment(!!user.hasEquipment);
    setEquipment([...(user.equipment ? (tr(user.equipment, lang) || []) : [])]);
    setExperience((user.experience || []).map(exp => ({
      company:  exp.company || '',
      role:     tr(exp.role, lang) || '',
      duration: tr(exp.duration, lang) || '',
      desc:     tr(exp.desc, lang) || '',
    })));
    setAddingExp(false);
    setNewExp({company:'', role:'', duration:'', desc:''});
    setEqInput('');
    setPhotoUrl(user.photoUrl || '');
  }, [open]);

  // ── Photo upload ──────────────────────────────────────────────
  const handlePhotoFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setPhotoUploading(true);
    try {
      // Compress: max 400px (avatar size), JPEG 0.82
      const blob = await new Promise(resolve => {
        const img = new Image();
        const src = URL.createObjectURL(file);
        img.onload = () => {
          const MAX = 400;
          let w = img.width, h = img.height;
          const min = Math.min(w, h); // crop to square
          const sx = (w - min) / 2, sy = (h - min) / 2;
          const out = Math.min(min, MAX);
          const c = document.createElement('canvas');
          c.width = out; c.height = out;
          c.getContext('2d').drawImage(img, sx, sy, min, min, 0, 0, out, out);
          URL.revokeObjectURL(src);
          c.toBlob(b => resolve(b), 'image/jpeg', 0.82);
        };
        img.src = src;
      });

      let url = null;
      if (window.sb && window.sb.storage) {
        const path = 'avatars/' + (user.uid || Date.now()) + '.jpg';
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
      setPhotoUrl(url);
    } catch(err) {
      console.warn('[Avatar upload]', err);
    } finally {
      setPhotoUploading(false);
    }
  };

  const addEquipment = () => {
    const v = eqInput.trim();
    if (v && !equipment.includes(v)) setEquipment(p => [...p, v]);
    setEqInput('');
  };

  const addExperience = () => {
    if (!newExp.company.trim() || !newExp.role.trim()) return;
    setExperience(p => [...p, {...newExp}]);
    setNewExp({company:'', role:'', duration:'', desc:''});
    setAddingExp(false);
  };

  const handleSave = () => {
    const eqObj = hasEquipment && equipment.length > 0
      ? { en:equipment, pt:equipment, es:equipment } : null;
    const expArr = experience.map(e => ({
      company:  e.company,
      role:     { en:e.role,     pt:e.role,     es:e.role },
      duration: { en:e.duration, pt:e.duration, es:e.duration },
      desc:     { en:e.desc,     pt:e.desc,     es:e.desc },
    }));
    setUser(prev => ({
      ...prev,
      name:        name.trim() || prev.name,
      age:         parseInt(age) || prev.age,
      region:      region.trim() || prev.region,
      hasCar, hasLicense, hasEquipment,
      equipment:   eqObj,
      experience:  expArr,
      photoUrl:    photoUrl || prev.photoUrl || '',
    }));
    // Also persist to Supabase profiles table if logged in
    if (window.sb && user.uid) {
      window.sb.from('profiles').update({ photo_url: photoUrl || '' }).eq('id', user.uid)
        .then(({error}) => { if (error) console.warn('[Profile photo save]', error.message); });
    }
    onClose();
  };

  const inp = {
    width:'100%', boxSizing:'border-box', padding:'10px 12px', borderRadius:10,
    border:'1px solid var(--pg-ink-200)', background:'#fff', fontSize:14,
    fontFamily:'inherit', outline:'none', color:'var(--pg-ink-900)',
  };

  const SecLbl = ({children}) => (
    <div style={{fontSize:11, fontWeight:700, color:'var(--pg-ink-400)',
      letterSpacing:'0.06em', marginBottom:10}}>{children}</div>
  );

  // Toggle switch
  const Toggle = ({on, onChange}) => (
    <button onClick={()=>onChange(!on)} style={{
      width:46, height:27, borderRadius:14, border:'none', cursor:'pointer',
      background: on ? 'var(--pg-aqua-500)' : 'var(--pg-ink-300)',
      position:'relative', padding:0, flexShrink:0, transition:'background .18s',
    }}>
      <div style={{
        width:21, height:21, borderRadius:'50%', background:'#fff',
        position:'absolute', top:3, left: on ? 22 : 3,
        transition:'left .18s', boxShadow:'0 1px 4px rgba(0,0,0,0.22)',
      }}/>
    </button>
  );

  const ToggleRow = ({label, sub, on, onChange}) => (
    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'11px 14px', borderRadius:11, background:'var(--pg-ink-50)',
      border:'0.5px solid var(--pg-ink-200)', marginBottom:8}}>
      <div style={{flex:1, minWidth:0, paddingRight:12}}>
        <div style={{fontSize:13.5, fontWeight:600, color:'var(--pg-ink-900)'}}>{label}</div>
        {sub && <div style={{fontSize:11.5, color:'var(--pg-ink-400)', marginTop:1}}>{sub}</div>}
      </div>
      <Toggle on={on} onChange={onChange}/>
    </div>
  );

  return (
    <Sheet open={open} onClose={onClose} height="95%">
      <div style={{padding:'6px 18px 52px'}}>

        {/* Header */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22}}>
          <h2 style={{margin:0, fontSize:18, fontWeight:700, letterSpacing:'-0.01em'}}>
            {s('Edit profile','Editar perfil','Editar perfil')}
          </h2>
          <button onClick={onClose} style={{border:'none', background:'var(--pg-ink-100)', width:30, height:30, borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
            {Icon.x(16,'var(--pg-ink-700)')}
          </button>
        </div>

        {/* ── PROFILE PHOTO ── */}
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', marginBottom:24, gap:10}}>
          <div style={{position:'relative'}}>
            {/* Avatar ring */}
            <div style={{
              width:96, height:96, borderRadius:'50%', padding:3,
              background:'linear-gradient(135deg, var(--pg-aqua-500) 0%, var(--pg-blue-600) 100%)',
            }}>
              <Avatar name={name || user.name || '?'} size={90} src={photoUrl}/>
            </div>
            {/* Camera button overlay */}
            <button
              onClick={()=>photoInputRef.current && photoInputRef.current.click()}
              disabled={photoUploading}
              style={{
                position:'absolute', bottom:2, right:2,
                width:30, height:30, borderRadius:'50%',
                background: photoUploading ? 'var(--pg-ink-300)' : 'var(--pg-blue-500)',
                border:'2.5px solid var(--pg-white)',
                cursor: photoUploading ? 'default' : 'pointer',
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 2px 8px rgba(0,0,0,0.18)',
              }}
            >
              {photoUploading
                ? <span style={{fontSize:13}}>⏳</span>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              }
            </button>
          </div>

          <div style={{textAlign:'center'}}>
            <div style={{fontSize:13, fontWeight:600, color:'var(--pg-ink-700)'}}>
              {s('Profile photo','Foto de perfil','Foto de perfil')}
            </div>
            <div style={{fontSize:11.5, color:'var(--pg-ink-400)', marginTop:2}}>
              {photoUploading
                ? s('Uploading…','Enviando…','Subiendo…')
                : s('Tap the camera icon to change','Toque o ícone de câmera para trocar','Toca el ícono de cámara para cambiar')
              }
            </div>
          </div>

          {/* Hidden file input — accepts both camera and gallery */}
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            style={{display:'none'}}
            onChange={handlePhotoFile}
          />
        </div>

        {/* ── BASIC INFO ── */}
        <div style={{marginBottom:22}}>
          <SecLbl>{s('BASIC INFO','INFORMAÇÕES BÁSICAS','INFORMACIÓN BÁSICA')}</SecLbl>

          <label style={{fontSize:12, fontWeight:600, color:'var(--pg-ink-600)', display:'block', marginBottom:4}}>
            {s('Full name','Nome completo','Nombre completo')}
          </label>
          <input value={name} onChange={e=>setName(e.target.value)}
            style={{...inp, marginBottom:10}} placeholder="Lucas Mendes"/>

          <div style={{display:'flex', gap:8}}>
            <div style={{flex:'0 0 88px'}}>
              <label style={{fontSize:12, fontWeight:600, color:'var(--pg-ink-600)', display:'block', marginBottom:4}}>
                {s('Age','Idade','Edad')}
              </label>
              <input value={age} onChange={e=>setAge(e.target.value.replace(/\D/g,''))}
                style={inp} placeholder="31" inputMode="numeric"/>
            </div>
            <div style={{flex:1, position:'relative'}}>
              <label style={{fontSize:12, fontWeight:600, color:'var(--pg-ink-600)', display:'block', marginBottom:4}}>
                {s('City / Region','Cidade / Região','Ciudad / Región')}
              </label>
              <input value={region} onChange={e=>setRegion(e.target.value)}
                onFocus={()=>setRegionFocus(true)}
                onBlur={()=>setTimeout(()=>setRegionFocus(false), 150)}
                style={{...inp, borderBottomLeftRadius: regionFocus && regionSuggestions.length > 0 ? 0 : undefined,
                  borderBottomRightRadius: regionFocus && regionSuggestions.length > 0 ? 0 : undefined}}
                placeholder="Fort Lauderdale, FL"/>
              {regionFocus && regionSuggestions.length > 0 && (
                <div style={{
                  position:'absolute', top:'100%', left:0, right:0, zIndex:999,
                  background:'#fff', border:'1px solid var(--pg-blue-300)',
                  borderTop:'none', borderRadius:'0 0 10px 10px',
                  boxShadow:'0 6px 16px rgba(15,30,60,0.12)',
                  overflow:'hidden',
                }}>
                  {regionSuggestions.map((r, i) => (
                    <button key={i} onMouseDown={()=>{ setRegion(r); setRegionFocus(false); }}
                      style={{
                        display:'flex', alignItems:'center', gap:8, width:'100%',
                        padding:'9px 12px', border:'none', background:'transparent',
                        cursor:'pointer', fontFamily:'inherit', textAlign:'left',
                        fontSize:13, color:'var(--pg-ink-800)', fontWeight:500,
                        borderBottom: i < regionSuggestions.length-1 ? '0.5px solid var(--pg-ink-100)' : 'none',
                      }}
                      onMouseEnter={e=>e.currentTarget.style.background='var(--pg-blue-50)'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      {Icon.pin(12,'var(--pg-blue-400)')}
                      <span>{r}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RESOURCES ── */}
        <div style={{marginBottom:22}}>
          <SecLbl>{s('RESOURCES','RECURSOS','RECURSOS')}</SecLbl>
          <ToggleRow
            label={s('Own vehicle','Veículo próprio','Vehículo propio')}
            sub={s('Car, truck or van','Carro, caminhonete ou van','Carro, camioneta o van')}
            on={hasCar} onChange={setHasCar}/>
          <ToggleRow
            label={s("Valid driver's license",'CNH válida','Licencia de conducir válida')}
            sub={s('State-issued driving license','CNH emitida pelo estado','Licencia emitida por el estado')}
            on={hasLicense} onChange={setHasLicense}/>
        </div>

        {/* ── EQUIPMENT ── */}
        <div style={{marginBottom:22}}>
          <SecLbl>{s('EQUIPMENT','EQUIPAMENTOS','EQUIPOS')}</SecLbl>
          <ToggleRow
            label={s('I have my own equipment','Possuo equipamentos próprios','Tengo equipo propio')}
            sub={s('Pump, vacuum, test kits…','Bomba, aspirador, kits de teste…','Bomba, aspiradora, kits de prueba…')}
            on={hasEquipment}
            onChange={v=>{ setHasEquipment(v); if(!v) setEquipment([]); }}/>

          {hasEquipment && (
            <>
              {equipment.length > 0 && (
                <div style={{display:'flex', flexWrap:'wrap', gap:6, marginBottom:9}}>
                  {equipment.map((eq,i) => (
                    <span key={i} style={{
                      display:'inline-flex', alignItems:'center', gap:5, fontSize:12, fontWeight:600,
                      padding:'5px 9px', borderRadius:999,
                      background:'var(--pg-blue-50)', border:'0.5px solid var(--pg-blue-200)', color:'var(--pg-blue-800)',
                    }}>
                      {eq}
                      <button onClick={()=>setEquipment(p=>p.filter((_,j)=>j!==i))} style={{
                        border:'none', background:'transparent', cursor:'pointer',
                        padding:0, color:'var(--pg-blue-500)', lineHeight:1, fontSize:15,
                      }}>×</button>
                    </span>
                  ))}
                </div>
              )}
              <div style={{display:'flex', gap:8}}>
                <input value={eqInput} onChange={e=>setEqInput(e.target.value)}
                  onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();addEquipment();}}}
                  placeholder={s('e.g. Pentair VS pump','ex: Bomba Pentair VS','ej: Bomba Pentair VS')}
                  style={{...inp, flex:1}}/>
                <button onClick={addEquipment} style={{
                  height:42, padding:'0 14px', borderRadius:10, border:'none',
                  background:'var(--pg-blue-500)', color:'#fff',
                  fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit', flexShrink:0,
                }}>
                  {s('Add','Adicionar','Agregar')}
                </button>
              </div>
            </>
          )}
        </div>

        {/* ── WORK EXPERIENCE ── */}
        <div style={{marginBottom:28}}>
          <SecLbl>{s('WORK EXPERIENCE','EXPERIÊNCIA PROFISSIONAL','EXPERIENCIA LABORAL')}</SecLbl>

          {experience.length > 0 && (
            <div style={{display:'flex', flexDirection:'column', gap:8, marginBottom:10}}>
              {experience.map((exp, i) => (
                <div key={i} style={{
                  padding:'11px 13px', borderRadius:11, position:'relative',
                  background:'var(--pg-ink-50)', border:'0.5px solid var(--pg-ink-200)',
                  borderLeft:'3px solid var(--pg-blue-400)',
                }}>
                  <button onClick={()=>setExperience(p=>p.filter((_,j)=>j!==i))} style={{
                    position:'absolute', top:8, right:8, border:'none',
                    background:'var(--pg-ink-200)', width:22, height:22, borderRadius:'50%',
                    cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', padding:0,
                  }}>
                    {Icon.x(10,'var(--pg-ink-600)')}
                  </button>
                  <div style={{fontSize:13, fontWeight:700, color:'var(--pg-ink-900)', paddingRight:28}}>{exp.role}</div>
                  <div style={{fontSize:12, color:'var(--pg-ink-500)', marginTop:2}}>
                    {exp.company}{exp.duration ? ` · ${exp.duration}` : ''}
                  </div>
                  {exp.desc && <div style={{fontSize:12, color:'var(--pg-ink-600)', marginTop:4, lineHeight:1.45}}>{exp.desc}</div>}
                </div>
              ))}
            </div>
          )}

          {addingExp ? (
            <div style={{padding:'13px 14px', borderRadius:12, background:'var(--pg-blue-50)', border:'1px solid var(--pg-blue-200)'}}>
              <div style={{display:'flex', gap:8, marginBottom:8}}>
                <div style={{flex:1}}>
                  <label style={{fontSize:11, fontWeight:600, color:'var(--pg-ink-500)', display:'block', marginBottom:3}}>
                    {s('Company','Empresa','Empresa')} *
                  </label>
                  <input value={newExp.company} onChange={e=>setNewExp(p=>({...p,company:e.target.value}))}
                    placeholder="Aqua Solutions" style={{...inp, fontSize:13}}/>
                </div>
                <div style={{flex:'0 0 90px'}}>
                  <label style={{fontSize:11, fontWeight:600, color:'var(--pg-ink-500)', display:'block', marginBottom:3}}>
                    {s('Duration','Duração','Duración')}
                  </label>
                  <input value={newExp.duration} onChange={e=>setNewExp(p=>({...p,duration:e.target.value}))}
                    placeholder={s('2 yrs','2 anos','2 años')} style={{...inp, fontSize:13}}/>
                </div>
              </div>
              <div style={{marginBottom:8}}>
                <label style={{fontSize:11, fontWeight:600, color:'var(--pg-ink-500)', display:'block', marginBottom:3}}>
                  {s('Role / Position','Cargo / Função','Cargo / Puesto')} *
                </label>
                <input value={newExp.role} onChange={e=>setNewExp(p=>({...p,role:e.target.value}))}
                  placeholder={s('Pool Technician','Técnico de Piscinas','Técnico de Piscinas')}
                  style={{...inp, fontSize:13}}/>
              </div>
              <div style={{marginBottom:10}}>
                <label style={{fontSize:11, fontWeight:600, color:'var(--pg-ink-500)', display:'block', marginBottom:3}}>
                  {s('Description (optional)','Descrição (opcional)','Descripción (opcional)')}
                </label>
                <textarea value={newExp.desc} onChange={e=>setNewExp(p=>({...p,desc:e.target.value}))}
                  placeholder={s('Brief description…','Breve descrição…','Breve descripción…')} rows={2}
                  style={{...inp, resize:'none', fontSize:13}}/>
              </div>
              <div style={{display:'flex', gap:8}}>
                <button onClick={()=>{setAddingExp(false);setNewExp({company:'',role:'',duration:'',desc:''});}} style={{
                  flex:1, height:36, borderRadius:9, border:'1px solid var(--pg-ink-200)',
                  background:'transparent', color:'var(--pg-ink-600)',
                  fontWeight:600, fontSize:13, cursor:'pointer', fontFamily:'inherit',
                }}>{s('Cancel','Cancelar','Cancelar')}</button>
                <button onClick={addExperience}
                  disabled={!newExp.company.trim()||!newExp.role.trim()}
                  style={{
                    flex:1, height:36, borderRadius:9, border:'none',
                    background:'var(--pg-blue-500)', color:'#fff',
                    fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit',
                    opacity:(!newExp.company.trim()||!newExp.role.trim())?0.4:1,
                  }}>{s('Save','Salvar','Guardar')}</button>
              </div>
            </div>
          ) : (
            <button onClick={()=>setAddingExp(true)} style={{
              width:'100%', height:42, borderRadius:10,
              border:'1.5px dashed var(--pg-blue-300)', background:'transparent',
              color:'var(--pg-blue-600)', fontWeight:600, fontSize:13,
              cursor:'pointer', fontFamily:'inherit',
              display:'flex', alignItems:'center', justifyContent:'center', gap:6,
            }}>
              {Icon.plus(14,'var(--pg-blue-600)')}
              {s('Add experience','Adicionar experiência','Agregar experiencia')}
            </button>
          )}
        </div>

        {/* Save */}
        <button onClick={handleSave} className="pg-btn pg-btn-primary"
          style={{width:'100%', height:52, fontSize:15, borderRadius:14}}>
          {s('Save profile','Salvar perfil','Guardar perfil')}
        </button>
      </div>
    </Sheet>
  );
}

// ── Public user profile sheet ────────────────────────────────
function PublicProfileSheet({ open, onClose, profile, lang='en', onChat }) {
  React.useEffect(() => {
    if (open) { _lockScreen(); return () => _unlockScreen(); }
  }, [open]);
  if (!open || !profile) return null;
  const name = profile.name || 'User';
  // rating: undefined = not yet rated (new user); null or number = real value
  const hasRating = profile.rating !== undefined && profile.rating !== null;
  const rating  = hasRating ? profile.rating : 4.8; // 4.8 only for static/demo profiles
  const reviews = profile.reviews !== undefined ? profile.reviews : 0;
  const jobs    = profile.jobs !== undefined ? profile.jobs : reviews;
  const loc     = profile.loc || 'South Florida';

  const msgLbl = lang==='pt'?'Mensagem':lang==='es'?'Mensaje':'Message';
  const jobsLbl = lang==='pt'?'Trabalhos':lang==='es'?'Trabajos':'Jobs';
  const ratingLbl = lang==='pt'?'Avaliação':lang==='es'?'Calificación':'Rating';
  const verifiedLbl = lang==='pt'?'Perfil verificado':lang==='es'?'Perfil verificado':'Verified profile';

  return (
    <div className="pg-sheet-backdrop" style={{zIndex:1100}} onClick={onClose}>
      <div className="pg-sheet" style={{padding:'0 0 36px', zIndex:1101}} onClick={e=>e.stopPropagation()}>
        <div className="pg-sheet-grabber"/>
        {/* Navy hero */}
        <div style={{
          background:'linear-gradient(145deg, #040D18, #071A2E)',
          padding:'20px 20px 28px', textAlign:'center', position:'relative',
        }}>
          <button onClick={onClose} style={{
            position:'absolute', top:12, right:14, border:'none',
            background:'rgba(255,255,255,0.12)', width:28, height:28, borderRadius:'50%',
            cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
          }}>{Icon.x(13,'#fff')}</button>

          <div style={{display:'inline-block', position:'relative', marginBottom:12}}>
            <div style={{padding:3, borderRadius:'50%', background:'linear-gradient(135deg,var(--pg-aqua-500),#0D7280)'}}>
              <Avatar name={name} size={72}/>
            </div>
            <div style={{position:'absolute', bottom:2, right:2, width:20, height:20, borderRadius:'50%',
              background:'var(--pg-aqua-500)', border:'2px solid #040D18',
              display:'flex', alignItems:'center', justifyContent:'center'}}>
              {Icon.check(10,'#fff')}
            </div>
          </div>

          <div style={{fontFamily:'var(--pg-font-display)', fontSize:20, fontWeight:700, color:'#fff', letterSpacing:'-0.02em'}}>{name}</div>
          <div style={{fontSize:12, color:'rgba(255,255,255,0.50)', marginTop:4, display:'flex', alignItems:'center', justifyContent:'center', gap:5}}>
            {Icon.pin(10,'rgba(255,255,255,0.45)')} {loc}
          </div>
          <div style={{marginTop:6, display:'inline-flex', alignItems:'center', gap:5,
            background:'rgba(14,186,199,0.18)', border:'1px solid rgba(14,186,199,0.35)',
            borderRadius:999, padding:'3px 10px'}}>
            {Icon.check(10,'var(--pg-aqua-400)')}
            <span style={{fontSize:10.5, fontWeight:600, color:'var(--pg-aqua-300,#6DD8F0)'}}>{verifiedLbl}</span>
          </div>

          {/* Stats */}
          <div style={{display:'flex', marginTop:18, paddingTop:14, borderTop:'1px solid rgba(255,255,255,0.10)', gap:0}}>
            {[
              { val: hasRating ? rating : '—', lbl: ratingLbl },
              { val: jobs || '0',              lbl: jobsLbl },
              { val: reviews > 50 ? '⭐ Pro' : reviews > 20 ? 'Expert' : reviews > 0 ? 'Active' : (lang==='pt'?'Novo':lang==='es'?'Nuevo':'New'), lbl: 'Trust' },
            ].map((s, i, arr) => (
              <React.Fragment key={i}>
                <div style={{flex:1, textAlign:'center'}}>
                  <div style={{fontFamily:'var(--pg-font-display)', fontSize:20, fontWeight:700, color:'#fff', letterSpacing:'-0.02em', lineHeight:1}}>{s.val}</div>
                  <div style={{fontSize:9.5, color:'rgba(255,255,255,0.45)', marginTop:3, fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase'}}>{s.lbl}</div>
                </div>
                {i < arr.length-1 && <div style={{width:1, background:'rgba(255,255,255,0.12)', margin:'0 4px'}}/>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Stars + reviews */}
        <div style={{padding:'18px 20px 0', display:'flex', flexDirection:'column', gap:14}}>
          {hasRating ? (
            <div style={{display:'flex', alignItems:'center', gap:10}}>
              <Stars rating={rating} size={16}/>
              <span style={{fontFamily:'var(--pg-font-display)', fontSize:16, fontWeight:700, color:'var(--pg-ink-900)'}}>{rating}</span>
              <span style={{fontSize:13, color:'var(--pg-ink-500)'}}>({reviews} {lang==='pt'?'avaliações':lang==='es'?'reseñas':'reviews'})</span>
            </div>
          ) : (
            <div style={{display:'flex', alignItems:'center', gap:8, padding:'10px 14px', borderRadius:12, background:'var(--pg-ink-50)', border:'1px solid var(--pg-ink-200)'}}>
              <span style={{fontSize:16}}>🌱</span>
              <div>
                <div style={{fontSize:13, fontWeight:600, color:'var(--pg-ink-700)'}}>
                  {lang==='pt'?'Novo membro':lang==='es'?'Nuevo miembro':'New member'}
                </div>
                <div style={{fontSize:11.5, color:'var(--pg-ink-400)', marginTop:1}}>
                  {lang==='pt'?'Ainda sem avaliações':lang==='es'?'Aún sin reseñas':'No reviews yet'}
                </div>
              </div>
            </div>
          )}

          {/* Badge */}
          {reviews > 50 && (
            <div style={{display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:12,
              background:'linear-gradient(135deg,var(--pg-navy-800),var(--pg-blue-700))', color:'#fff'}}>
              <span style={{fontSize:22}}>⭐</span>
              <div>
                <div style={{fontSize:13, fontWeight:700}}>Pool Guy PRO</div>
                <div style={{fontSize:11, opacity:0.65, marginTop:1}}>{lang==='pt'?`${jobs}+ trabalhos concluídos`:lang==='es'?`${jobs}+ trabajos completados`:`${jobs}+ jobs completed`}</div>
              </div>
            </div>
          )}

          {/* Action */}
          <button onClick={()=>{ onClose(); onChat && onChat(name); }}
            className="pg-btn pg-btn-primary" style={{width:'100%', height:50, fontSize:15, borderRadius:14, marginTop:4}}>
            {Icon.msg(16,'#fff')}
            <span style={{marginLeft:6}}>{msgLbl}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Help & Support sheet ──────────────────────────────────────
function HelpSheet({ open, onClose, lang='en' }) {
  React.useEffect(() => {
    if (open) { _lockScreen(); return () => _unlockScreen(); }
  }, [open]);
  if (!open) return null;
  const title = lang==='pt'?'Ajuda & Suporte':lang==='es'?'Ayuda y Soporte':'Help & Support';
  const items = lang==='pt' ? [
    { icon:'📖', title:'Como usar o app', sub:'Guia rápido para pool guys' },
    { icon:'💳', title:'Assinatura e pagamento', sub:'Planos, cobranças e cancelamento' },
    { icon:'🔔', title:'Notificações', sub:'Configure alertas de trabalho por região' },
    { icon:'🤝', title:'Como aplicar para vagas', sub:'Candidaturas e contato com clientes' },
    { icon:'⭐', title:'Avaliações e reputação', sub:'Como funciona o Trust Score' },
    { icon:'📧', title:'Falar com a equipe', sub:'suporte@poolguyapp.com', action: ()=>window.open('mailto:suporte@poolguyapp.com') },
  ] : lang==='es' ? [
    { icon:'📖', title:'Cómo usar la app', sub:'Guía rápida para pool guys' },
    { icon:'💳', title:'Suscripción y pago', sub:'Planes, cobros y cancelación' },
    { icon:'🔔', title:'Notificaciones', sub:'Configura alertas de trabajo por región' },
    { icon:'🤝', title:'Cómo postular a empleos', sub:'Solicitudes y contacto con clientes' },
    { icon:'⭐', title:'Reseñas y reputación', sub:'Cómo funciona el Trust Score' },
    { icon:'📧', title:'Hablar con el equipo', sub:'support@poolguyapp.com', action: ()=>window.open('mailto:support@poolguyapp.com') },
  ] : [
    { icon:'📖', title:'How to use the app', sub:'Quick guide for pool guys' },
    { icon:'💳', title:'Subscription & billing', sub:'Plans, charges and cancellation' },
    { icon:'🔔', title:'Notifications', sub:'Configure job alerts by region & day' },
    { icon:'🤝', title:'How to apply for jobs', sub:'Applications and contacting clients' },
    { icon:'⭐', title:'Reviews & reputation', sub:'How the Trust Score works' },
    { icon:'📧', title:'Contact the team', sub:'support@poolguyapp.com', action: ()=>window.open('mailto:support@poolguyapp.com') },
  ];

  return (
    <div className="pg-sheet-backdrop" onClick={onClose}>
      <div className="pg-sheet" style={{padding:'0 0 36px'}} onClick={e=>e.stopPropagation()}>
        <div className="pg-sheet-grabber"/>
        <div style={{padding:'4px 18px 16px', borderBottom:'0.5px solid var(--pg-ink-200)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h2 style={{margin:0, fontSize:18, fontWeight:700, letterSpacing:'-0.02em'}}>{title}</h2>
          <button onClick={onClose} style={{border:'none', background:'var(--pg-ink-100)', width:30, height:30, borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
            {Icon.x(16,'var(--pg-ink-700)')}
          </button>
        </div>
        <div style={{padding:'12px 18px 0', display:'flex', flexDirection:'column', gap:0}}>
          {items.map((item, i) => (
            <button key={i} onClick={item.action || undefined} style={{
              display:'flex', alignItems:'center', gap:14, padding:'14px 0',
              border:'none', background:'transparent', cursor: item.action?'pointer':'default',
              textAlign:'left', fontFamily:'inherit',
              borderBottom: i < items.length-1 ? '0.5px solid var(--pg-ink-100)' : 'none',
            }}>
              <div style={{width:40, height:40, borderRadius:11, background:'var(--pg-blue-50)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0}}>
                {item.icon}
              </div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:14, fontWeight:600, color:'var(--pg-ink-900)'}}>{item.title}</div>
                <div style={{fontSize:12, color: item.action ? 'var(--pg-blue-500)' : 'var(--pg-ink-500)', marginTop:2}}>{item.sub}</div>
              </div>
              {item.action && Icon.chev(14,'var(--pg-ink-400)')}
            </button>
          ))}
        </div>
        <div style={{textAlign:'center', padding:'20px 0 0', fontSize:11, color:'var(--pg-ink-400)'}}>
          PoolGuyX · v2.5.0 Beta
        </div>
      </div>
    </div>
  );
}

// ── Privacy sheet ─────────────────────────────────────────────
function PrivacySheet({ open, onClose, lang='en' }) {
  React.useEffect(() => {
    if (open) { _lockScreen(); return () => _unlockScreen(); }
  }, [open]);
  if (!open) return null;
  const title = lang==='pt'?'Privacidade':lang==='es'?'Privacidad':'Privacy';
  const sections = lang==='pt' ? [
    { title:'Dados coletados', body:'Coletamos apenas os dados necessários para o funcionamento do app: nome, e-mail, telefone e localização geral (condado/cidade). Nunca compartilhamos seus dados pessoais com terceiros sem sua autorização.' },
    { title:'Localização', body:'O app usa sua localização apenas para mostrar trabalhos próximos. A localização exata nunca é armazenada nem compartilhada com outros usuários.' },
    { title:'Comunicação', body:'Usamos seu e-mail para enviar notificações de trabalho e atualizações importantes. Você pode cancelar a qualquer momento nas configurações.' },
    { title:'Exclusão de conta', body:'Para excluir sua conta e todos os seus dados, entre em contato com suporte@poolguyapp.com. Processamos pedidos em até 7 dias úteis.' },
  ] : lang==='es' ? [
    { title:'Datos recopilados', body:'Solo recopilamos los datos necesarios para el funcionamiento de la app: nombre, email, teléfono y ubicación general. Nunca compartimos tus datos personales con terceros.' },
    { title:'Ubicación', body:'La app usa tu ubicación solo para mostrar trabajos cercanos. La ubicación exacta nunca se almacena ni se comparte con otros usuarios.' },
    { title:'Comunicación', body:'Usamos tu email para enviarte notificaciones de trabajo. Puedes cancelar en cualquier momento en la configuración.' },
    { title:'Eliminación de cuenta', body:'Para eliminar tu cuenta, contacta a support@poolguyapp.com. Procesamos solicitudes en hasta 7 días hábiles.' },
  ] : [
    { title:'Data collected', body:'We only collect the data necessary for the app to work: name, email, phone, and general location (county/city). We never share your personal data with third parties without your consent.' },
    { title:'Location', body:'The app uses your location only to show nearby jobs. Your exact location is never stored or shared with other users.' },
    { title:'Communication', body:'We use your email to send job notifications and important updates. You can opt out at any time in settings.' },
    { title:'Account deletion', body:'To delete your account and all your data, contact support@poolguyapp.com. We process requests within 7 business days.' },
  ];

  return (
    <div className="pg-sheet-backdrop" onClick={onClose}>
      <div className="pg-sheet" style={{padding:'0 0 36px'}} onClick={e=>e.stopPropagation()}>
        <div className="pg-sheet-grabber"/>
        <div style={{padding:'4px 18px 16px', borderBottom:'0.5px solid var(--pg-ink-200)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h2 style={{margin:0, fontSize:18, fontWeight:700, letterSpacing:'-0.02em'}}>{title}</h2>
          <button onClick={onClose} style={{border:'none', background:'var(--pg-ink-100)', width:30, height:30, borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
            {Icon.x(16,'var(--pg-ink-700)')}
          </button>
        </div>
        <div style={{padding:'18px 18px 0', display:'flex', flexDirection:'column', gap:20, maxHeight:400, overflowY:'auto'}}>
          {sections.map((s,i) => (
            <div key={i}>
              <div style={{fontSize:13, fontWeight:700, color:'var(--pg-ink-900)', marginBottom:6}}>{s.title}</div>
              <div style={{fontSize:13, color:'var(--pg-ink-600)', lineHeight:1.55}}>{s.body}</div>
            </div>
          ))}
          <div style={{fontSize:11, color:'var(--pg-ink-400)', paddingBottom:4}}>
            {lang==='pt'?'Última atualização: maio de 2026':lang==='es'?'Última actualización: mayo 2026':'Last updated: May 2026'}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  ChatSheet, NotificationsSheet, PaywallSheet, PostMenuSheet, Toast,
  LanguagePickerSheet, ApplicantsSheet, VerificationSheet, PushNotifSheet,
  WalletSheet, WorkLifecycleSheet, ReviewSheet, HiringAppDetailSheet,
  ApplyJobSheet, EditProfileSheet,
  PublicProfileSheet, HelpSheet, PrivacySheet,
});
