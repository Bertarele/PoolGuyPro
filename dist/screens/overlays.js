// overlays.jsx — chat inbox + conversation, notifications, paywall, post-menu,
//               language picker, applicants sheet

// ── Rating compliment tags (shown on 4-5★, OfferUp-style) ─────
const RATING_TAGS = {
  en: ['Friendly', 'Reliable', 'Communicative', 'On time', 'Great value', 'Professional'],
  pt: ['Simpático', 'Confiável', 'Comunicativo', 'Pontual', 'Bom custo-benefício', 'Profissional'],
  es: ['Amable', 'Confiable', 'Comunicativo', 'Puntual', 'Buena relación calidad-precio', 'Profesional']
};
function RatingTagPicker({
  lang,
  selected,
  onToggle
}) {
  const tags = RATING_TAGS[lang] || RATING_TAGS.en;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 7,
      marginBottom: 14
    }
  }, tags.map(tag => {
    const on = selected.includes(tag);
    return /*#__PURE__*/React.createElement("button", {
      key: tag,
      type: "button",
      onClick: () => onToggle(tag),
      style: {
        padding: '7px 13px',
        borderRadius: 999,
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 12.5,
        fontWeight: 600,
        border: on ? '1.5px solid #F59E0B' : '1.5px solid var(--pg-ink-200)',
        background: on ? 'rgba(245,158,11,0.12)' : 'var(--pg-white)',
        color: on ? '#B45309' : 'var(--pg-ink-600)',
        transition: 'all .12s'
      }
    }, on ? '✓ ' : '', tag);
  }));
}

// ── Chat helpers ──────────────────────────────────────────────
function makeConvoId(uidA, uidB, listingId) {
  const base = [uidA, uidB].sort().join('_');
  return listingId ? base + '_lst_' + listingId : base;
}
// Relative time formatter — module-scope so all sheets can use it
function relTimeGlobal(iso) {
  if (!iso) return '';
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return diff + 's atrás';
  if (diff < 3600) return Math.floor(diff / 60) + 'min atrás';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h atrás';
  if (diff < 86400 * 30) return Math.floor(diff / 86400) + 'd atrás';
  if (diff < 86400 * 365) return Math.floor(diff / (86400 * 30)) + 'mo atrás';
  return Math.floor(diff / (86400 * 365)) + 'a atrás';
}
function fmtMsgTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const sameDay = now.toDateString() === d.toDateString();
  if (sameDay) return d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
  const yesterday = new Date(now - 86400000).toDateString() === d.toDateString();
  if (yesterday) return 'Yesterday';
  return d.toLocaleDateString([], {
    month: 'short',
    day: 'numeric'
  });
}

// ── Chat (inbox + conversation) ───────────────────────────────
function ChatSheet({
  open,
  onClose,
  lang = 'en',
  initialConvo = null,
  currentUser = null,
  onUnreadChange = null,
  onOpenListing = null,
  openPublicProfile = null
}) {
  const t = STRINGS[lang];
  const [activeConvo, setActiveConvo] = React.useState(initialConvo);

  // When a specific convo target arrives, navigate into it immediately.
  // Separate from the `open` effect to avoid double-firing when both change together.
  React.useEffect(() => {
    if (initialConvo) setActiveConvo(initialConvo);
  }, [initialConvo]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset active convo after sheet closes (wait for close animation ~300ms).
  React.useEffect(() => {
    if (!open) {
      const t = setTimeout(() => setActiveConvo(null), 300);
      return () => clearTimeout(t);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  return /*#__PURE__*/React.createElement(Sheet, {
    open: open,
    onClose: onClose,
    height: "86%"
  }, activeConvo ? /*#__PURE__*/React.createElement(ChatConversation, {
    convo: activeConvo,
    lang: lang,
    t: t,
    onBack: () => {
      setActiveConvo(null);
      if (onUnreadChange) onUnreadChange();
    },
    onClose: onClose,
    currentUser: currentUser,
    onUnreadChange: onUnreadChange,
    onOpenListing: onOpenListing,
    openPublicProfile: openPublicProfile
  }) : /*#__PURE__*/React.createElement(ChatInbox, {
    lang: lang,
    t: t,
    onSelect: setActiveConvo,
    onClose: onClose,
    currentUser: currentUser
  }));
}
function ChatInbox({
  lang,
  t,
  onSelect,
  onClose,
  currentUser
}) {
  const [convos, setConvos] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const loadInbox = React.useCallback(async () => {
    if (!window.sb || !currentUser?.uid) {
      setLoading(false);
      return;
    }
    const uid = currentUser.uid;
    const {
      data
    } = await window.sb.from('conversations').select('*').or(`participant_1.eq.${uid},participant_2.eq.${uid}`).order('last_message_at', {
      ascending: false
    });
    if (!data) {
      setLoading(false);
      return;
    }
    const mapped = data.map(c => {
      const amP1 = c.participant_1 === uid;
      return {
        convoId: c.id,
        receiverId: amP1 ? c.participant_2 : c.participant_1,
        name: amP1 ? c.name_2 || '?' : c.name_1 || '?',
        lastMsg: c.last_message || '',
        lastTime: c.last_message_at,
        unread: amP1 ? c.unread_1 || 0 : c.unread_2 || 0,
        listingId: c.listing_id || null,
        listingName: c.listing_name || null,
        listingPhoto: c.listing_photo_url || null
      };
    });
    setConvos(mapped);
    setLoading(false);
  }, [currentUser]);
  React.useEffect(() => {
    loadInbox();
  }, [loadInbox]);
  const totalUnread = convos.reduce((s, c) => s + c.unread, 0);
  const noChatsLbl = lang === 'pt' ? 'Nenhuma conversa ainda' : lang === 'es' ? 'Sin conversaciones' : 'No conversations yet';
  const noChatsSubLbl = lang === 'pt' ? 'Toque em "Mensagem" em um anúncio para começar.' : lang === 'es' ? 'Toca "Mensaje" en un anuncio para empezar.' : 'Tap "Message" on any listing to start.';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 16px 12px',
      borderBottom: '0.5px solid var(--pg-ink-200)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 20,
      fontWeight: 700,
      letterSpacing: '-0.02em',
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, t.inboxTitle || 'Messages', totalUnread > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      background: '#EF4444',
      color: '#fff',
      borderRadius: 999,
      padding: '2px 7px',
      minWidth: 18,
      textAlign: 'center'
    }
  }, totalUnread)), /*#__PURE__*/React.createElement("button", {
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
      flex: 1,
      overflow: 'auto'
    }
  }, loading ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '40px 20px',
      color: 'var(--pg-ink-400)',
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 22,
      animation: 'spin 1s linear infinite'
    }
  }, "\u23F3")) : convos.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '48px 24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 56,
      height: 56,
      borderRadius: 16,
      background: 'var(--pg-blue-50)',
      margin: '0 auto 14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, Icon.msg(26, 'var(--pg-blue-300)')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: 'var(--pg-ink-700)',
      marginBottom: 6
    }
  }, noChatsLbl), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--pg-ink-400)',
      lineHeight: 1.5
    }
  }, noChatsSubLbl)) : convos.map(c => /*#__PURE__*/React.createElement("button", {
    key: c.convoId,
    onClick: () => onSelect({
      convoId: c.convoId,
      receiverId: c.receiverId,
      name: c.name,
      listingId: c.listingId || null,
      listingContext: c.listingName ? {
        name: c.listingName,
        photoUrl: c.listingPhoto || null
      } : null
    }),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '13px 16px',
      border: 'none',
      background: c.unread > 0 ? 'var(--pg-blue-50)' : 'transparent',
      cursor: 'pointer',
      width: '100%',
      textAlign: 'left',
      borderBottom: '0.5px solid var(--pg-ink-100)',
      fontFamily: 'inherit'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      flexShrink: 0
    }
  }, c.listingPhoto ? /*#__PURE__*/React.createElement("img", {
    src: c.listingPhoto,
    alt: "",
    style: {
      width: 44,
      height: 44,
      borderRadius: 10,
      objectFit: 'cover',
      border: '1px solid var(--pg-ink-200)'
    }
  }) : /*#__PURE__*/React.createElement(AvatarFetch, {
    uid: c.receiverId,
    name: c.name,
    size: 44
  }), c.unread > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: -2,
      right: -2,
      minWidth: 16,
      height: 16,
      borderRadius: 999,
      background: '#EF4444',
      color: '#fff',
      fontSize: 9,
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '2px solid var(--pg-white)',
      paddingLeft: 2,
      paddingRight: 2
    }
  }, c.unread)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: c.unread > 0 ? 700 : 600,
      color: 'var(--pg-ink-900)',
      letterSpacing: '-0.01em'
    }
  }, c.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: c.unread > 0 ? 'var(--pg-blue-500)' : 'var(--pg-ink-400)',
      flexShrink: 0,
      fontWeight: c.unread > 0 ? 600 : 400
    }
  }, fmtMsgTime(c.lastTime))), c.listingName && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--pg-blue-600)',
      fontWeight: 600,
      marginTop: 1,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "10",
    height: "10",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"
  })), c.listingName), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: c.unread > 0 ? 'var(--pg-ink-700)' : 'var(--pg-ink-500)',
      marginTop: 2,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      fontWeight: c.unread > 0 ? 600 : 400
    }
  }, c.lastMsg)), Icon.chev(14, 'var(--pg-ink-300)')))));
}
function ChatConversation({
  convo,
  lang,
  t,
  onBack,
  onClose,
  currentUser,
  onUnreadChange,
  onOpenListing,
  openPublicProfile
}) {
  const isLive = !!(currentUser?.uid && convo.receiverId);
  const convoId = isLive ? makeConvoId(currentUser.uid, convo.receiverId, convo.listingId || null) : null;
  const [messages, setMessages] = React.useState([]);
  const [draft, setDraft] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState(null);
  const [receiverPhoto, setReceiverPhoto] = React.useState(null);
  const [receiverOnline, setReceiverOnline] = React.useState(false);
  const [theyTyping, setTheyTyping] = React.useState(false);
  const scroller = React.useRef(null);
  const pollRef = React.useRef(null);
  const lastCount = React.useRef(0);
  const typingTimer = React.useRef(null);
  const myTypingRef = React.useRef(null);
  React.useEffect(() => {
    if (!convo.receiverId || !window.sb) return;
    const check = () => {
      window.sb.from('profiles_public').select('photo_url,is_online,last_seen').eq('id', convo.receiverId).single().then(({
        data
      }) => {
        if (!data) return;
        if (data.photo_url) setReceiverPhoto(data.photo_url);
        const recentlySeen = data.last_seen && Date.now() - new Date(data.last_seen).getTime() < 60000;
        setReceiverOnline(!!(data.is_online && recentlySeen));
      });
    };
    check();
    const timer = setInterval(check, 20000);
    return () => clearInterval(timer);
  }, [convo.receiverId]);
  const fmtMsg = React.useCallback(m => ({
    id: m.id,
    from: m.sender_id === currentUser?.uid ? 'me' : 'them',
    text: m.body,
    time: fmtMsgTime(m.created_at),
    deleted: !!m.deleted_at,
    sender_id: m.sender_id
  }), [currentUser]);
  const loadMessages = React.useCallback(async () => {
    if (!isLive) return;
    const {
      data
    } = await window.sb.from('messages').select('*').eq('conversation_id', convoId).order('created_at', {
      ascending: true
    });
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

  // On open: load messages, mark as read, set up polling + typing channel
  React.useEffect(() => {
    if (!isLive) return;
    loadMessages();
    window.sb.rpc('mark_chat_read', {
      p_convo_id: convoId
    }).catch(() => {});
    if (onUnreadChange) setTimeout(onUnreadChange, 500);
    pollRef.current = setInterval(loadMessages, 2500);

    // Mark this conversation as actively open — send-push checks this to skip
    // notifying the recipient about messages they're already looking at. Also
    // stamped with a timestamp and refreshed on a heartbeat: if the app gets
    // force-closed instead of properly navigated away from, this unmount
    // cleanup never runs and the flag would otherwise stay stuck forever,
    // silently suppressing every future push for that conversation. The
    // server only honors this flag while the stamp is fresh (see send-push),
    // so a stale one self-heals within ~90s instead of blocking pushes for good.
    const markActive = () => {
      if (currentUser?.uid) {
        window.sb.from('profiles').update({
          active_conversation_id: convoId,
          active_conversation_set_at: new Date().toISOString()
        }).eq('id', currentUser.uid).catch(() => {});
      }
    };
    markActive();
    const heartbeatRef = setInterval(markActive, 30000);

    // Typing broadcast channel — one channel per conversation pair
    const typingCh = window.sb.channel('typing-' + convoId).on('broadcast', {
      event: 'typing'
    }, ({
      payload
    }) => {
      if (payload?.uid === currentUser?.uid) return; // ignore own events
      setTheyTyping(true);
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setTheyTyping(false), 3000);
    }).subscribe();
    myTypingRef.current = typingCh;
    return () => {
      clearInterval(pollRef.current);
      clearInterval(heartbeatRef);
      clearTimeout(typingTimer.current);
      window.sb.removeChannel(typingCh);
      if (currentUser?.uid) {
        window.sb.from('profiles').update({
          active_conversation_id: null,
          active_conversation_set_at: null
        }).eq('id', currentUser.uid).catch(() => {});
      }
    };
  }, [convoId]); // eslint-disable-line

  // ── Approve/decline a pending rental request right from the chat ──────────
  // Lets the owner act on it mid-conversation instead of having to leave the
  // chat and go find the listing's requests panel.
  const [pendingRentalReq, setPendingRentalReq] = React.useState(null);
  const [rentalActionBusy, setRentalActionBusy] = React.useState(false);
  const [rentalActionErr, setRentalActionErr] = React.useState('');
  const [rentalActionDone, setRentalActionDone] = React.useState(null); // 'approved'|'declined'|null

  const loadPendingRentalReq = React.useCallback(() => {
    // Don't gate on convo.listingContext.type==='rent' — conversations opened via
    // a notification deep link (openChatFromDeepLink) only ever populate
    // {name, photoUrl} for listingContext, never `type` (the conversations table
    // has no listing_type column to read it from), so that check silently killed
    // this for every chat opened by tapping the notification instead of the chat
    // button on the listing itself. The rental_requests query below is already a
    // sufficient filter — a sell listing simply never has a matching row.
    if (!window.sb || !currentUser?.uid || !convo.receiverId || !convo.listingId) {
      setPendingRentalReq(null);
      return;
    }
    window.sb.from('rental_requests').select('id,status,period,quantity,total_price').eq('listing_id', convo.listingId).eq('owner_id', currentUser.uid).eq('requester_id', convo.receiverId).eq('status', 'pending').limit(1).then(({
      data
    }) => setPendingRentalReq(data && data[0] || null)).catch(() => setPendingRentalReq(null));
  }, [currentUser?.uid, convo.receiverId, convo.listingId]);
  React.useEffect(() => {
    loadPendingRentalReq();
  }, [loadPendingRentalReq]);
  const handleRentalDecision = async decision => {
    if (!pendingRentalReq || !window.sb || rentalActionBusy) return;
    setRentalActionBusy(true);
    setRentalActionErr('');
    const {
      error
    } = await window.sb.from('rental_requests').update({
      status: decision,
      responded_at: new Date().toISOString()
    }).eq('id', pendingRentalReq.id);
    setRentalActionBusy(false);
    if (error) {
      setRentalActionErr((error.message || '').includes('rental_requests_one_approved_per_listing') ? lang === 'pt' ? 'Já existe um pedido aprovado para este item.' : 'Another request for this item is already approved.' : lang === 'pt' ? 'Erro — tente de novo.' : 'Error — please try again.');
      return;
    }
    setRentalActionDone(decision);
    setPendingRentalReq(null);
    const msg = decision === 'approved' ? lang === 'pt' ? '✅ Pedido de aluguel aprovado!' : '✅ Rental request approved!' : lang === 'pt' ? '❌ Pedido de aluguel recusado.' : '❌ Rental request declined.';
    if (isLive) {
      window.sb.rpc('send_chat_message', {
        p_convo_id: convoId,
        p_body: msg,
        p_other_id: convo.receiverId,
        p_my_name: currentUser.name || (currentUser.email || '').split('@')[0] || 'Owner',
        p_other_name: convo.name || ''
      }).catch(() => {});
    }
    if (window.sb && convo.receiverId) {
      const title = decision === 'approved' ? {
        en: 'Rental approved!',
        pt: 'Aluguel aprovado!',
        es: 'Alquiler aprobado!'
      } : {
        en: 'Rental declined',
        pt: 'Aluguel recusado',
        es: 'Alquiler rechazado'
      };
      window.sb.from('notifications').insert({
        user_id: convo.receiverId,
        type: decision === 'approved' ? 'rental_approved' : 'rental_declined',
        title: JSON.stringify(title),
        body: msg,
        link_id: convo.listingId
      }).catch(() => {});
      window.sendPush && window.sendPush(convo.receiverId, title[lang] || title.en, msg, `/#market?listing=${convo.listingId}`, 'market');
    }
  };

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
      const myName = currentUser.name && !currentUser.name.includes('@') ? currentUser.name : currentUser.email ? currentUser.email.split('@')[0] : 'User';
      // Optimistic UI
      setMessages(prev => [...prev, {
        id: 'tmp_' + Date.now(),
        from: 'me',
        text,
        time: fmtMsgTime(new Date().toISOString()),
        deleted: false
      }]);
      setTimeout(() => {
        if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
      }, 30);
      await window.sb.rpc('send_chat_message', {
        p_convo_id: convoId,
        p_body: text,
        p_other_id: convo.receiverId,
        p_my_name: myName,
        p_other_name: convo.name
      });
      // Push notification to recipient — deep link opens chat with sender
      if (convo.receiverId && window.sendPush) {
        window.sendPush(convo.receiverId, myName, text.length > 120 ? text.slice(0, 120) + '…' : text, `/#chat?user=${currentUser.uid}&name=${encodeURIComponent(myName)}`, 'chat', convoId);
      }
      // In-app notification too — chat was the only type that skipped this table,
      // so it never showed in the bell list and relied entirely on OS push (which
      // silently does nothing if the user hasn't granted permission). This also
      // rides the existing real-time notif-badge subscription for instant delivery.
      if (convo.receiverId && window.sb) {
        window.sb.from('notifications').insert({
          user_id: convo.receiverId,
          type: 'chat',
          title: myName,
          body: text.length > 120 ? text.slice(0, 120) + '…' : text,
          link_id: currentUser.uid
        }).catch(() => {});
      }
      // Store listing context in the conversation row so seller also sees it
      if (convo.listingId || convo.listingContext?.name) {
        window.sb.from('conversations').update({
          listing_id: convo.listingId || null,
          listing_name: convo.listingContext?.name || null,
          listing_photo_url: convo.listingContext?.photoUrl || null
        }).eq('id', convoId).then(() => {});
      }
      await loadMessages();
    } else {
      setMessages(m => [...m, {
        id: Date.now(),
        from: 'me',
        text,
        time: fmtMsgTime(new Date().toISOString()),
        deleted: false
      }]);
      setTimeout(() => {
        if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
      }, 30);
    }
    setSending(false);
  };
  const deleteMsg = async msg => {
    setDeleteConfirm(null);
    if (isLive && msg.id && !String(msg.id).startsWith('tmp_')) {
      await window.sb.from('messages').update({
        deleted_at: new Date().toISOString()
      }).eq('id', msg.id);
      await loadMessages();
    } else {
      setMessages(prev => prev.map(m => m.id === msg.id ? {
        ...m,
        deleted: true
      } : m));
    }
  };
  const deletedLbl = lang === 'pt' ? 'Mensagem apagada' : lang === 'es' ? 'Mensaje eliminado' : 'Message deleted';
  const deleteLbl = lang === 'pt' ? 'Apagar' : lang === 'es' ? 'Eliminar' : 'Delete';
  const cancelLbl = lang === 'pt' ? 'Cancelar' : lang === 'es' ? 'Cancelar' : 'Cancel';
  const confirmDeleteLbl = lang === 'pt' ? 'Apagar mensagem?' : lang === 'es' ? '¿Eliminar mensaje?' : 'Delete message?';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '4px 14px 12px',
      borderBottom: '0.5px solid var(--pg-ink-200)',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      padding: 6,
      color: 'var(--pg-blue-600)',
      display: 'flex'
    }
  }, Icon.chev(18, 'var(--pg-blue-600)', 'left')), /*#__PURE__*/React.createElement("div", {
    onClick: openPublicProfile && convo.receiverId ? () => openPublicProfile({
      uid: convo.receiverId,
      name: convo.name
    }) : undefined,
    style: {
      cursor: openPublicProfile && convo.receiverId ? 'pointer' : 'default',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: convo.name,
    size: 38,
    src: receiverPhoto
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, openPublicProfile && convo.receiverId ? /*#__PURE__*/React.createElement("button", {
    onClick: () => openPublicProfile({
      uid: convo.receiverId,
      name: convo.name
    }),
    style: {
      background: 'none',
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      fontFamily: 'inherit',
      fontSize: 14,
      fontWeight: 600,
      color: 'var(--pg-ink-900)',
      textAlign: 'left',
      textDecoration: 'underline',
      textDecorationColor: 'rgba(0,0,0,0.18)',
      textUnderlineOffset: 2
    }
  }, convo.name) : /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600
    }
  }, convo.name), receiverOnline && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--pg-aqua-700)',
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: 'var(--pg-aqua-500)'
    }
  }), " Live")), /*#__PURE__*/React.createElement("button", {
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
  }, Icon.x(14, 'var(--pg-ink-700)'))), convo.listingContext && /*#__PURE__*/React.createElement("div", {
    onClick: () => {
      if (onOpenListing && convo.listingId) {
        onClose();
        onOpenListing(convo.listingId);
      }
    },
    style: {
      margin: '0 12px',
      padding: '10px 12px',
      borderRadius: 12,
      border: '1px solid var(--pg-ink-200)',
      background: 'var(--pg-ink-50)',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flexShrink: 0,
      cursor: onOpenListing && convo.listingId ? 'pointer' : 'default',
      transition: 'background .15s'
    },
    onMouseEnter: e => {
      if (onOpenListing && convo.listingId) e.currentTarget.style.background = 'var(--pg-ink-100)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.background = 'var(--pg-ink-50)';
    }
  }, convo.listingContext.photoUrl ? /*#__PURE__*/React.createElement("img", {
    src: convo.listingContext.photoUrl,
    alt: "",
    style: {
      width: 48,
      height: 48,
      borderRadius: 8,
      objectFit: 'cover',
      flexShrink: 0,
      border: '1px solid var(--pg-ink-200)'
    }
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      width: 48,
      height: 48,
      borderRadius: 8,
      background: 'var(--pg-ink-200)',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--pg-ink-400)",
    strokeWidth: "1.5",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "7",
    width: "18",
    height: "13",
    rx: "2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "13.5",
    r: "3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: 'var(--pg-ink-800)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, convo.listingContext.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--pg-ink-500)',
      marginTop: 2
    }
  }, convo.listingContext.priceMode === 'neg' ? lang === 'pt' ? 'Negociável' : lang === 'es' ? 'Negociable' : 'Negotiable' : convo.listingContext.price ? `$${Number(convo.listingContext.price).toLocaleString()}` : '', convo.listingContext.type === 'rent' ? lang === 'pt' ? ' · Aluguel' : ' · Rental' : convo.listingContext.type === 'sell' ? lang === 'pt' ? ' · Venda' : ' · For sale' : '')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      fontWeight: 600,
      color: 'var(--pg-ink-400)',
      padding: '3px 7px',
      borderRadius: 999,
      background: 'var(--pg-ink-200)'
    }
  }, lang === 'pt' ? 'Anúncio' : lang === 'es' ? 'Anuncio' : 'Listing'), onOpenListing && convo.listingId && /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--pg-ink-400)",
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M9 18l6-6-6-6"
  })))), pendingRentalReq && /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '8px 12px 0',
      flexShrink: 0
    }
  }, rentalActionErr && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: '#DC2626',
      marginBottom: 6,
      textAlign: 'center'
    }
  }, rentalActionErr), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => handleRentalDecision('approved'),
    disabled: rentalActionBusy,
    style: {
      flex: 1,
      height: 38,
      borderRadius: 11,
      border: 'none',
      cursor: rentalActionBusy ? 'default' : 'pointer',
      background: '#16A34A',
      color: '#fff',
      fontSize: 13,
      fontWeight: 700,
      fontFamily: 'inherit',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      opacity: rentalActionBusy ? 0.7 : 1
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
  })), lang === 'pt' ? 'Aprovar aluguel' : lang === 'es' ? 'Aprobar alquiler' : 'Approve rental'), /*#__PURE__*/React.createElement("button", {
    onClick: () => handleRentalDecision('declined'),
    disabled: rentalActionBusy,
    style: {
      flex: 1,
      height: 38,
      borderRadius: 11,
      border: 'none',
      cursor: rentalActionBusy ? 'default' : 'pointer',
      background: '#EF4444',
      color: '#fff',
      fontSize: 13,
      fontWeight: 700,
      fontFamily: 'inherit',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      opacity: rentalActionBusy ? 0.7 : 1
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
  })), lang === 'pt' ? 'Recusar' : lang === 'es' ? 'Rechazar' : 'Decline'))), rentalActionDone && /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '8px 12px 0',
      padding: '8px 12px',
      borderRadius: 11,
      flexShrink: 0,
      textAlign: 'center',
      background: rentalActionDone === 'approved' ? 'rgba(22,163,74,0.10)' : 'rgba(239,68,68,0.10)',
      color: rentalActionDone === 'approved' ? '#16A34A' : '#EF4444',
      fontSize: 12.5,
      fontWeight: 700
    }
  }, rentalActionDone === 'approved' ? lang === 'pt' ? '✅ Aluguel aprovado' : '✅ Rental approved' : lang === 'pt' ? '❌ Aluguel recusado' : '❌ Rental declined'), /*#__PURE__*/React.createElement("div", {
    ref: scroller,
    style: {
      flex: 1,
      overflow: 'auto',
      padding: '14px 14px 4px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, messages.length === 0 && isLive && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      color: 'var(--pg-ink-400)',
      fontSize: 13,
      marginTop: 24
    }
  }, lang === 'pt' ? '👋 Comece a conversa!' : lang === 'es' ? '👋 ¡Inicia la conversación!' : '👋 Start the conversation!'), messages.map(m => /*#__PURE__*/React.createElement("div", {
    key: m.id,
    style: {
      display: 'flex',
      justifyContent: m.from === 'me' ? 'flex-end' : 'flex-start',
      alignItems: 'flex-end',
      gap: 4
    }
  }, m.from !== 'me' && !m.deleted && /*#__PURE__*/React.createElement("button", {
    onClick: () => setDeleteConfirm(m.id),
    style: {
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      padding: '4px 2px',
      opacity: 0.35,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      transition: 'opacity .15s',
      borderRadius: 6
    },
    onMouseEnter: e => e.currentTarget.style.opacity = 1,
    onMouseLeave: e => e.currentTarget.style.opacity = 0.35
  }, /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--pg-ink-600)",
    strokeWidth: "2.2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "3 6 5 6 21 6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10 11v6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 11v6"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '75%'
    }
  }, m.deleted ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 12px',
      borderRadius: 14,
      fontSize: 13,
      fontStyle: 'italic',
      background: m.from === 'me' ? 'oklch(0.75 0.06 235)' : 'var(--pg-ink-150,#e8e8e8)',
      color: m.from === 'me' ? 'rgba(255,255,255,0.55)' : 'var(--pg-ink-400)',
      borderBottomRightRadius: m.from === 'me' ? 4 : 14,
      borderBottomLeftRadius: m.from === 'me' ? 14 : 4
    }
  }, "\uD83D\uDDD1 ", deletedLbl) : /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '9px 13px',
      borderRadius: 16,
      fontSize: 14,
      lineHeight: 1.4,
      background: m.from === 'me' ? 'var(--pg-blue-500)' : 'var(--pg-ink-100)',
      color: m.from === 'me' ? '#fff' : 'var(--pg-ink-900)',
      borderBottomRightRadius: m.from === 'me' ? 4 : 16,
      borderBottomLeftRadius: m.from === 'me' ? 16 : 4,
      wordBreak: 'break-word',
      opacity: String(m.id).startsWith('tmp_') ? 0.65 : 1
    }
  }, m.text), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: 'var(--pg-ink-400)',
      marginTop: 3,
      padding: '0 4px',
      textAlign: m.from === 'me' ? 'right' : 'left'
    }
  }, m.time)), m.from === 'me' && !m.deleted && !String(m.id).startsWith('tmp_') && /*#__PURE__*/React.createElement("button", {
    onClick: () => setDeleteConfirm(m.id),
    style: {
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      padding: '4px 2px',
      opacity: 0.30,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      transition: 'opacity .15s',
      borderRadius: 6
    },
    onMouseEnter: e => e.currentTarget.style.opacity = 0.9,
    onMouseLeave: e => e.currentTarget.style.opacity = 0.30
  }, /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--pg-blue-200)",
    strokeWidth: "2.2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "3 6 5 6 21 6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10 11v6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 11v6"
  })))))), deleteConfirm && (() => {
    const msg = messages.find(m => m.id === deleteConfirm);
    if (!msg) return null;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.42)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-end'
      },
      onClick: () => setDeleteConfirm(null)
    }, /*#__PURE__*/React.createElement("div", {
      onClick: e => e.stopPropagation(),
      style: {
        width: '100%',
        background: 'var(--pg-white)',
        borderRadius: '18px 18px 0 0',
        padding: '20px 20px 36px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 15,
        fontWeight: 700,
        textAlign: 'center',
        color: 'var(--pg-ink-900)'
      }
    }, confirmDeleteLbl), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '10px 14px',
        borderRadius: 12,
        background: 'var(--pg-ink-100)',
        fontSize: 13.5,
        color: 'var(--pg-ink-700)',
        lineHeight: 1.45,
        maxHeight: 70,
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, msg.text), /*#__PURE__*/React.createElement("button", {
      onClick: () => deleteMsg(msg),
      style: {
        width: '100%',
        padding: '14px',
        border: 'none',
        borderRadius: 14,
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 15,
        fontWeight: 700,
        background: '#EF4444',
        color: '#fff'
      }
    }, deleteLbl), /*#__PURE__*/React.createElement("button", {
      onClick: () => setDeleteConfirm(null),
      style: {
        width: '100%',
        padding: '12px',
        border: '1px solid var(--pg-ink-200)',
        borderRadius: 14,
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 14,
        fontWeight: 600,
        background: 'transparent',
        color: 'var(--pg-ink-700)'
      }
    }, cancelLbl)));
  })(), theyTyping && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 16px 2px',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      padding: '7px 12px',
      background: 'var(--pg-ink-100)',
      borderRadius: 18,
      maxWidth: 72
    }
  }, [0, 1, 2].map(i => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: 'var(--pg-ink-400)',
      display: 'inline-block',
      animation: `pgTypeDot 1.2s ${i * 0.2}s infinite ease-in-out`
    }
  }))), /*#__PURE__*/React.createElement("style", null, `@keyframes pgTypeDot{0%,80%,100%{transform:scale(0.6);opacity:.4}40%{transform:scale(1);opacity:1}}`)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 12px',
      paddingBottom: 'calc(14px + env(safe-area-inset-bottom, 0px))',
      borderTop: '0.5px solid var(--pg-ink-200)',
      display: 'flex',
      gap: 8,
      alignItems: 'flex-end',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      background: 'var(--pg-ink-100)',
      borderRadius: 18,
      padding: '10px 14px',
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: draft,
    onChange: e => {
      setDraft(e.target.value);
      if (myTypingRef.current && typeof myTypingRef.current.send === 'function' && e.target.value) myTypingRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          uid: currentUser?.uid
        }
      });
    },
    onKeyDown: e => e.key === 'Enter' && send(),
    placeholder: t.messagePh || 'Type a message…',
    style: {
      flex: 1,
      border: 'none',
      background: 'transparent',
      outline: 'none',
      fontSize: 14,
      fontFamily: 'inherit'
    }
  })), /*#__PURE__*/React.createElement("button", {
    onClick: send,
    disabled: sending,
    className: "pg-press",
    style: {
      width: 42,
      height: 42,
      borderRadius: '50%',
      border: 'none',
      cursor: 'pointer',
      background: draft.trim() ? 'var(--pg-blue-500)' : 'var(--pg-ink-200)',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background .15s'
    }
  }, Icon.arrow(18, '#fff'))));
}

// ── Language Picker ───────────────────────────────────────────
function LanguagePickerSheet({
  open,
  onClose,
  lang,
  setLang
}) {
  const t = STRINGS[lang];
  const options = [{
    id: 'en',
    flag: '🇺🇸',
    label: 'English'
  }, {
    id: 'pt',
    flag: '🇧🇷',
    label: 'Português'
  }, {
    id: 'es',
    flag: '🇪🇸',
    label: 'Español'
  }];
  return /*#__PURE__*/React.createElement(Sheet, {
    open: open,
    onClose: onClose,
    height: "auto"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 18px 30px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 18,
      fontWeight: 700,
      letterSpacing: '-0.01em'
    }
  }, t.chooseLanguage), /*#__PURE__*/React.createElement("button", {
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
      flexDirection: 'column',
      gap: 8
    }
  }, options.map(opt => {
    const active = lang === opt.id;
    return /*#__PURE__*/React.createElement("button", {
      key: opt.id,
      onClick: () => {
        setLang(opt.id);
        onClose();
      },
      className: "pg-press",
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '14px 16px',
        borderRadius: 14,
        cursor: 'pointer',
        fontFamily: 'inherit',
        textAlign: 'left',
        border: active ? '2px solid var(--pg-blue-500)' : '1px solid var(--pg-ink-200)',
        background: active ? 'var(--pg-blue-50)' : 'var(--pg-white)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 28
      }
    }, opt.flag), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        fontSize: 16,
        fontWeight: 600,
        color: active ? 'var(--pg-blue-700)' : 'var(--pg-ink-900)'
      }
    }, opt.label), active && /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: '50%',
        background: 'var(--pg-blue-500)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, Icon.check(13, '#fff')));
  }))));
}

// ── Applicants Sheet ──────────────────────────────────────────
function ApplicantsSheet({
  open,
  onClose,
  post,
  lang = 'en',
  onChat,
  user,
  onOpenProfile
}) {
  const t = STRINGS[lang];
  const [applicants, setApplicants] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [conflictInfo, setConflictInfo] = React.useState(null);
  const [profileApp, setProfileApp] = React.useState(null);
  const [schedulingFor, setSchedulingFor] = React.useState(null);
  const [rejectingFor, setRejectingFor] = React.useState(null);
  const [rejectReason, setRejectReason] = React.useState('');

  // Helper: relative time from ISO timestamp
  const relTime = iso => {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return lang === 'pt' ? 'agora' : lang === 'es' ? 'ahora' : 'now';
    if (m < 60) return lang === 'pt' ? `${m}min atrás` : lang === 'es' ? `hace ${m}min` : `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return lang === 'pt' ? `${h}h atrás` : lang === 'es' ? `hace ${h}h` : `${h}h ago`;
    const d = Math.floor(h / 24);
    return lang === 'pt' ? `${d}d atrás` : lang === 'es' ? `hace ${d}d` : `${d}d ago`;
  };

  // Normalize a DB row from job_applications → UI applicant shape
  const normApp = row => {
    const snap = row.profile_snapshot || {};
    const vacDays = row.vacation_days || null;
    return {
      id: row.id,
      _dbId: row.id,
      applicant_id: row.applicant_id || null,
      name: row.applicant_name || '?',
      rating: row.applicant_rating || 0,
      jobs: row.applicant_jobs || 0,
      status: row.status || 'pending',
      note: row.note || null,
      when: relTime(row.created_at),
      rejectReason: row.reject_reason || null,
      selectedDays: vacDays?.selectedDays || null,
      interview: row.interview_day ? {
        day: {
          en: row.interview_day,
          pt: row.interview_day,
          es: row.interview_day
        },
        time: row.interview_time || ''
      } : null,
      // Profile snapshot saved at apply time
      profile: {
        age: snap.age || null,
        region: snap.region || '',
        hasCar: snap.hasCar || false,
        hasLicense: snap.hasLicense || false,
        equipment: snap.equipment || null,
        experience: snap.experience || [],
        photoUrl: snap.photoUrl || null
      }
    };
  };

  // Load live applicants from Supabase
  const loadLiveApplicants = React.useCallback(async jobId => {
    if (!window.sb || !jobId) return;
    setLoading(true);
    const {
      data,
      error
    } = await window.sb.from('job_applications').select('*').eq('job_id', jobId).order('created_at', {
      ascending: false
    });
    setLoading(false);
    if (error) {
      console.warn('[ApplicantsSheet] fetch error:', error.message);
      return;
    }
    const apps = (data || []).map(normApp);
    setApplicants(apps);
    // Fetch current profile photos for all applicants in one batch
    const ids = apps.map(a => a.applicant_id).filter(Boolean);
    if (ids.length && window.sb) {
      window.sb.from('profiles_public').select('id,photo_url').in('id', ids).then(({
        data: pdata
      }) => {
        if (!pdata) return;
        const photoMap = {};
        pdata.forEach(p => {
          if (p.photo_url) photoMap[p.id] = p.photo_url;
        });
        setApplicants(prev => prev.map(a => a.applicant_id && photoMap[a.applicant_id] ? {
          ...a,
          profile: {
            ...a.profile,
            photoUrl: photoMap[a.applicant_id]
          }
        } : a));
      });
    }
  }, [lang]);
  React.useEffect(() => {
    if (!post) return;
    setConflictInfo(null);
    setSchedulingFor(null);
    setRejectingFor(null);
    setRejectReason('');
    if (post._live) {
      loadLiveApplicants(post._id);
    } else {
      setApplicants((post.applicants || []).map(a => ({
        ...a
      })));
    }
  }, [post]);

  // DB update helper (only for live posts)
  const dbUpdate = async (appDbId, patch) => {
    if (!window.sb || !post?._live || !appDbId) return;
    const {
      error
    } = await window.sb.from('job_applications').update(patch).eq('id', appDbId);
    if (error) console.warn('[ApplicantsSheet] update error:', error.message);
  };

  // Hiring (not vacation, where multiple different-day accepts are normal): accepting
  // one applicant closes the job and rejects everyone else, so the listing stops
  // accepting new applications and other applicants aren't left thinking they're
  // still in the running. Shared by both accept paths (plain accept + schedule interview).
  const closeJobAndRejectOthers = async acceptedId => {
    if (post.type !== 'hiring' || !window.sb) return;
    await window.sb.from('jobs').update({
      hired_at: new Date().toISOString()
    }).eq('id', post._id);
    const others = applicants.filter(a => a.id !== acceptedId && a.status !== 'rejected' && a._dbId);
    for (const other of others) {
      await dbUpdate(other._dbId, {
        status: 'rejected'
      });
      if (other.applicant_id) {
        window.sb.from('notifications').insert({
          user_id: other.applicant_id,
          type: 'job_rejected',
          title: JSON.stringify({
            en: 'Application not selected',
            pt: 'Candidatura não selecionada',
            es: 'Postulación no seleccionada'
          }),
          body: JSON.stringify({
            en: `Your application for "${post.role || post.company || ''}" was not selected — another candidate was hired.`,
            pt: `Sua candidatura para "${post.role || post.company || ''}" não foi selecionada — outro candidato foi contratado.`,
            es: `Tu postulación para "${post.role || post.company || ''}" no fue seleccionada — se contrató a otro candidato.`
          }),
          link_id: post._id || null,
          read: false
        });
      }
    }
    setApplicants(prev => prev.map(a => a.id === acceptedId ? a : a.status !== 'rejected' ? {
      ...a,
      status: 'rejected'
    } : a));
  };
  const scheduleInterview = async (applicantId, interview) => {
    const app = applicants.find(a => a.id === applicantId);
    setApplicants(prev => prev.map(a => a.id === applicantId ? {
      ...a,
      interview,
      status: 'accepted'
    } : a));
    setSchedulingFor(null);
    if (post?._live && app?._dbId) {
      await dbUpdate(app._dbId, {
        status: 'accepted',
        interview_day: tr(interview.day, 'en'),
        interview_time: interview.time || ''
      });
      // Notify applicant
      if (app.applicant_id && window.sb) {
        const jobRole = post.role || post.company || '';
        window.sb.from('notifications').insert({
          user_id: app.applicant_id,
          type: 'job_accepted',
          title: JSON.stringify({
            en: 'Application accepted! 🎉',
            pt: 'Candidatura aceita! 🎉',
            es: '¡Postulación aceptada! 🎉'
          }),
          body: JSON.stringify({
            en: `Your application for "${jobRole}" was accepted.`,
            pt: `Sua candidatura para "${jobRole}" foi aceita.`,
            es: `Tu postulación para "${jobRole}" fue aceptada.`
          }),
          link_id: post._id || null,
          read: false
        });
      }
      await closeJobAndRejectOthers(applicantId);
    }
  };
  if (!post) return null;
  const updateStatus = async (id, status, extra = {}) => {
    setApplicants(prev => prev.map(a => a.id === id ? {
      ...a,
      status,
      ...extra
    } : a));
    const app = applicants.find(a => a.id === id);
    if (post?._live && app?._dbId) {
      await dbUpdate(app._dbId, {
        status,
        ...extra
      });
      // Notify applicant on accept or reject
      if (app.applicant_id && window.sb && (status === 'accepted' || status === 'rejected')) {
        const jobRole = post.role || post.company || '';
        const isAcc = status === 'accepted';
        window.sb.from('notifications').insert({
          user_id: app.applicant_id,
          type: isAcc ? 'job_accepted' : 'job_rejected',
          title: JSON.stringify(isAcc ? {
            en: 'Application accepted! 🎉',
            pt: 'Candidatura aceita! 🎉',
            es: '¡Postulación aceptada! 🎉'
          } : {
            en: 'Application not selected',
            pt: 'Candidatura não selecionada',
            es: 'Postulación no seleccionada'
          }),
          body: JSON.stringify(isAcc ? {
            en: `Your application for "${jobRole}" was accepted.`,
            pt: `Sua candidatura para "${jobRole}" foi aceita.`,
            es: `Tu postulación para "${jobRole}" fue aceptada.`
          } : {
            en: `Your application for "${jobRole}" was not selected.`,
            pt: `Sua candidatura para "${jobRole}" não foi selecionada.`,
            es: `Tu postulación para "${jobRole}" no fue seleccionada.`
          }),
          link_id: post._id || null,
          read: false
        });
      }
      if (status === 'accepted') await closeJobAndRejectOthers(id);
      // Persist accepted vacation days so booked_days reflects reality — it's what
      // the day-picker/listing UI use to grey out days that are already taken.
      if (status === 'accepted' && post.type === 'vacation' && app.selectedDays?.length) {
        const {
          data: fresh
        } = await window.sb.from('vacations').select('booked_days').eq('id', post._id).single();
        const merged = Array.from(new Set([...(fresh?.booked_days || []), ...app.selectedDays]));
        await window.sb.from('vacations').update({
          booked_days: merged
        }).eq('id', post._id);
      }
    }
  };

  // Build day→owner map from post.bookedDays + currently accepted applicants
  const buildBookedMap = appsSnapshot => {
    const map = {};
    (post.bookedDays || []).forEach(d => {
      map[d] = lang === 'pt' ? 'reserva anterior' : lang === 'es' ? 'reserva anterior' : 'previous booking';
    });
    appsSnapshot.filter(a => a.status === 'accepted' && a.selectedDays).forEach(acc => acc.selectedDays.forEach(d => {
      map[d] = acc.name;
    }));
    return map;
  };

  // Smart accept handler — checks for day conflicts on vacation posts
  const handleAccept = applicant => {
    if (post.type !== 'vacation' || !applicant.selectedDays) {
      updateStatus(applicant.id, 'accepted');
      return;
    }
    const bookedMap = buildBookedMap(applicants);
    const conflicts = applicant.selectedDays.filter(d => bookedMap[d]).map(d => ({
      day: d,
      takenBy: bookedMap[d]
    }));
    if (conflicts.length > 0) {
      setConflictInfo({
        applicantId: applicant.id,
        conflicts
      });
    } else {
      setConflictInfo(null);
      updateStatus(applicant.id, 'accepted');
    }
  };
  const typeIcon = type => {
    if (type === 'quickpool') return Icon.bolt(14, 'var(--pg-blue-700)');
    if (type === 'vacation') return Icon.cal(14, 'var(--pg-blue-700)');
    if (type === 'hiring') return Icon.briefcase(14, 'var(--pg-blue-700)');
    return Icon.cart(14, 'var(--pg-blue-700)');
  };
  const statusConfig = {
    pending: {
      label: t.pendingLbl,
      bg: 'var(--pg-ink-100)',
      color: 'var(--pg-ink-600)'
    },
    accepted: {
      label: t.accepted,
      bg: 'var(--pg-aqua-100)',
      color: 'var(--pg-aqua-700)'
    },
    rejected: {
      label: t.rejected,
      bg: 'oklch(0.95 0.04 20)',
      color: 'oklch(0.45 0.18 20)'
    }
  };
  const pending = applicants.filter(a => a.status === 'pending').length;
  const accepted = applicants.filter(a => a.status === 'accepted').length;
  return /*#__PURE__*/React.createElement(Sheet, {
    open: open,
    onClose: onClose,
    height: "88%"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 16px 14px',
      borderBottom: '0.5px solid var(--pg-ink-200)',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 18,
      fontWeight: 700,
      letterSpacing: '-0.01em'
    }
  }, t.applicantsPanelTitle), /*#__PURE__*/React.createElement("button", {
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
      background: 'var(--pg-blue-50)',
      borderRadius: 10,
      padding: '9px 12px'
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
  }, typeIcon(post.type)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--pg-blue-800)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, tr(post.title, lang)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--pg-ink-500)',
      marginTop: 1
    }
  }, Icon.pin(10, 'var(--pg-ink-400)'), " ", post.loc, " \xB7 ", tr(post.date, lang)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginTop: 10
    }
  }, [{
    val: applicants.length,
    label: t.applicants,
    bg: 'var(--pg-ink-50)',
    color: 'var(--pg-ink-900)',
    border: 'var(--pg-ink-200)'
  }, {
    val: pending,
    label: t.pendingLbl,
    bg: 'oklch(0.97 0.03 80)',
    color: 'oklch(0.55 0.18 80)',
    border: 'oklch(0.88 0.06 80)'
  }, {
    val: accepted,
    label: t.accepted,
    bg: 'var(--pg-aqua-50)',
    color: 'var(--pg-aqua-700)',
    border: 'var(--pg-aqua-200)'
  }].map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      flex: 1,
      textAlign: 'center',
      padding: '8px 4px',
      borderRadius: 10,
      background: s.bg,
      border: `0.5px solid ${s.border}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: s.color
    }
  }, s.val), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      fontWeight: 600,
      marginTop: 1,
      color: s.color,
      opacity: 0.75
    }
  }, s.label.toUpperCase()))))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: '10px 16px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, loading && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '32px 0',
      color: 'var(--pg-ink-400)',
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 24,
      height: 24,
      borderRadius: '50%',
      border: '2.5px solid var(--pg-blue-200)',
      borderTopColor: 'var(--pg-blue-500)',
      animation: 'pg-spin 0.7s linear infinite',
      margin: '0 auto 12px'
    }
  }), lang === 'pt' ? 'Carregando candidatos…' : lang === 'es' ? 'Cargando candidatos…' : 'Loading applicants…'), !loading && applicants.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '40px 16px',
      color: 'var(--pg-ink-400)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 36,
      marginBottom: 10
    }
  }, "\uD83D\uDCED"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: 'var(--pg-ink-600)',
      marginBottom: 4
    }
  }, lang === 'pt' ? 'Nenhum candidato ainda' : lang === 'es' ? 'Sin candidatos aún' : 'No applicants yet'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--pg-ink-400)'
    }
  }, lang === 'pt' ? 'As candidaturas aparecerão aqui' : lang === 'es' ? 'Las postulaciones aparecerán aquí' : 'Applications will appear here')), !loading && applicants.map(a => {
    const sc = statusConfig[a.status] || statusConfig.pending;
    return /*#__PURE__*/React.createElement("div", {
      key: a.id,
      className: "pg-card",
      style: {
        padding: '13px 14px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setProfileApp(a),
      style: {
        border: 'none',
        background: 'transparent',
        padding: 0,
        cursor: 'pointer',
        flexShrink: 0,
        borderRadius: '50%',
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: a.name,
      size: 42,
      src: a.profile?.photoUrl || undefined
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 14,
        height: 14,
        borderRadius: '50%',
        background: 'var(--pg-blue-500)',
        border: '2px solid #fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "7",
      height: "7",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "#fff",
      strokeWidth: "2.5",
      strokeLinecap: "round"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "8",
      r: "5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M3 21v-1a9 9 0 0118 0v1"
    })))), /*#__PURE__*/React.createElement("div", {
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
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setProfileApp(a),
      style: {
        border: 'none',
        background: 'transparent',
        padding: 0,
        cursor: 'pointer',
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: '-0.01em',
        fontFamily: 'inherit',
        color: 'var(--pg-ink-900)',
        textAlign: 'left'
      }
    }, a.name), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        padding: '2px 7px',
        borderRadius: 6,
        fontWeight: 700,
        background: sc.bg,
        color: sc.color
      }
    }, sc.label)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        marginTop: 3
      }
    }, /*#__PURE__*/React.createElement(ReputationBadge, {
      jobs: a.jobs,
      lang: lang
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--pg-ink-500)',
        marginTop: 4,
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement(Stars, {
      rating: a.rating,
      size: 10
    }), " ", a.rating, /*#__PURE__*/React.createElement("span", null, "\xB7"), /*#__PURE__*/React.createElement("span", null, a.jobs, " ", lang === 'pt' ? 'trabalhos' : lang === 'es' ? 'trabajos' : 'jobs'), /*#__PURE__*/React.createElement("span", null, "\xB7"), /*#__PURE__*/React.createElement("span", null, a.when, " ", lang === 'en' ? 'ago' : lang === 'pt' ? 'atrás' : 'atrás')))), post.type === 'vacation' && a.selectedDays && a.selectedDays.length > 0 && (() => {
      const bookedMap = buildBookedMap(applicants);
      const hasConflict = conflictInfo && conflictInfo.applicantId === a.id;
      const conflictDays = hasConflict ? new Set(conflictInfo.conflicts.map(c => c.day)) : new Set();
      const allDays = post.days || a.selectedDays;
      return /*#__PURE__*/React.createElement("div", {
        style: {
          marginTop: 8,
          paddingTop: 8,
          borderTop: '0.5px solid var(--pg-ink-100)'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 10.5,
          color: 'var(--pg-ink-400)',
          fontWeight: 600,
          letterSpacing: '0.03em',
          marginBottom: 5
        }
      }, lang === 'pt' ? 'DIAS ESCOLHIDOS' : lang === 'es' ? 'DÍAS ELEGIDOS' : 'DAYS REQUESTED'), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          flexWrap: 'wrap',
          gap: 4
        }
      }, allDays.map(d => {
        const reqd = a.selectedDays.includes(d);
        const takenBy = bookedMap[d];
        const isTakenByOther = takenBy && (a.status !== 'accepted' || !a.selectedDays.includes(d));
        const isConflict = conflictDays.has(d);
        const isAccepted = a.status === 'accepted' && reqd;
        let bg,
          color,
          border = 'none',
          title = '';
        if (isConflict) {
          bg = 'oklch(0.93 0.08 25)';
          color = 'oklch(0.50 0.22 25)';
          border = '1.5px solid oklch(0.72 0.18 25)';
          title = `Day ${d} — reserved for ${takenBy}`;
        } else if (isAccepted) {
          bg = 'var(--pg-aqua-500)';
          color = '#fff';
        } else if (reqd && takenBy && a.status !== 'accepted') {
          bg = 'oklch(0.93 0.08 25)';
          color = 'oklch(0.50 0.22 25)';
        } else if (reqd) {
          bg = 'var(--pg-blue-500)';
          color = '#fff';
        } else if (takenBy) {
          bg = 'var(--pg-ink-100)';
          color = 'var(--pg-ink-300)';
        } else {
          bg = 'var(--pg-blue-50)';
          color = 'var(--pg-ink-200)';
        }
        return /*#__PURE__*/React.createElement("span", {
          key: d,
          title: title,
          style: {
            width: 26,
            height: 26,
            borderRadius: 6,
            fontSize: 10.5,
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: bg,
            color,
            border,
            position: 'relative'
          }
        }, d);
      })), hasConflict && /*#__PURE__*/React.createElement("div", {
        style: {
          marginTop: 8,
          padding: '8px 10px',
          borderRadius: 8,
          background: 'oklch(0.96 0.04 25)',
          border: '1px solid oklch(0.85 0.10 25)',
          display: 'flex',
          flexDirection: 'column',
          gap: 4
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
        stroke: "oklch(0.50 0.22 25)",
        strokeWidth: "2.2",
        strokeLinecap: "round"
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
      })), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11.5,
          fontWeight: 700,
          color: 'oklch(0.42 0.20 25)'
        }
      }, lang === 'pt' ? 'Conflito de dias' : lang === 'es' ? 'Conflicto de días' : 'Day conflict'), /*#__PURE__*/React.createElement("button", {
        onClick: () => setConflictInfo(null),
        style: {
          marginLeft: 'auto',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          padding: 2,
          color: 'oklch(0.55 0.18 25)',
          lineHeight: 1,
          fontSize: 13,
          fontFamily: 'inherit'
        }
      }, "\u2715")), conflictInfo.conflicts.map((c, i) => /*#__PURE__*/React.createElement("div", {
        key: i,
        style: {
          fontSize: 11.5,
          color: 'oklch(0.42 0.20 25)',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          paddingLeft: 2
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 20,
          height: 20,
          borderRadius: 4,
          background: 'oklch(0.85 0.12 25)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
          fontWeight: 700,
          flexShrink: 0
        }
      }, c.day), lang === 'pt' ? `já reservado para ${c.takenBy}` : lang === 'es' ? `ya reservado para ${c.takenBy}` : `already reserved for ${c.takenBy}`))), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 11,
          color: 'var(--pg-ink-400)',
          marginTop: 6
        }
      }, a.selectedDays.length, " ", lang === 'pt' ? 'dias' : lang === 'es' ? 'días' : 'days', post.poolsPerDay && post.pricePerPool && /*#__PURE__*/React.createElement("span", {
        style: {
          marginLeft: 6,
          color: 'var(--pg-blue-500)',
          fontWeight: 600
        }
      }, "\xB7 Est. $", (a.selectedDays.length * post.poolsPerDay * post.pricePerPool).toLocaleString())));
    })(), post.type === 'hiring' && a.note && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 8,
        padding: '7px 10px',
        borderRadius: 8,
        background: 'var(--pg-blue-50)',
        border: '0.5px solid var(--pg-blue-100)',
        fontSize: 12,
        color: 'var(--pg-ink-700)',
        lineHeight: 1.4,
        fontStyle: 'italic'
      }
    }, "\uD83D\uDCAC ", tr(a.note, lang)), post.type === 'hiring' && a.profile && (a.profile.age || a.profile.region || a.profile.hasCar || a.profile.hasLicense || a.profile.equipment && (Array.isArray(tr(a.profile.equipment, lang)) ? tr(a.profile.equipment, lang).length > 0 : false) || a.profile.experience?.length > 0) && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        padding: '10px 12px',
        borderRadius: 10,
        background: 'var(--pg-ink-50)',
        border: '0.5px solid var(--pg-ink-150,#e8e8e8)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 9.5,
        fontWeight: 800,
        letterSpacing: '0.08em',
        color: 'var(--pg-ink-400)',
        marginBottom: 7
      }
    }, lang === 'pt' ? 'PERFIL DO CANDIDATO' : lang === 'es' ? 'PERFIL DEL CANDIDATO' : 'CANDIDATE PROFILE'), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 5,
        marginBottom: a.profile.experience?.length > 0 ? 8 : 0
      }
    }, a.profile.age && /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 11,
        fontWeight: 600,
        padding: '3px 8px',
        borderRadius: 999,
        background: 'var(--pg-ink-100)',
        color: 'var(--pg-ink-700)'
      }
    }, "\uD83D\uDC64 ", a.profile.age, " ", lang === 'pt' ? 'anos' : lang === 'es' ? 'años' : 'yrs'), a.profile.region && /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 11,
        fontWeight: 600,
        padding: '3px 8px',
        borderRadius: 999,
        background: 'var(--pg-ink-100)',
        color: 'var(--pg-ink-700)'
      }
    }, Icon.pin(10, 'var(--pg-ink-500)'), " ", a.profile.region), a.profile.hasCar && /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 11,
        fontWeight: 600,
        padding: '3px 8px',
        borderRadius: 999,
        background: 'var(--pg-aqua-100)',
        color: 'var(--pg-aqua-800)'
      }
    }, "\uD83D\uDE97 ", lang === 'pt' ? 'Veículo próprio' : lang === 'es' ? 'Vehículo propio' : 'Own vehicle'), a.profile.hasLicense && /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 11,
        fontWeight: 600,
        padding: '3px 8px',
        borderRadius: 999,
        background: 'var(--pg-aqua-100)',
        color: 'var(--pg-aqua-800)'
      }
    }, "\uD83E\uDEAA ", lang === 'pt' ? "Driver's license" : lang === 'es' ? "Driver's license" : "Driver's license"), (() => {
      const eqList = a.profile.equipment ? tr(a.profile.equipment, lang) : null;
      if (!Array.isArray(eqList)) return null;
      return eqList.map((eq, i) => /*#__PURE__*/React.createElement("span", {
        key: i,
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 11,
          fontWeight: 600,
          padding: '3px 8px',
          borderRadius: 999,
          background: 'oklch(0.95 0.04 270)',
          color: 'oklch(0.40 0.18 270)'
        }
      }, "\uD83D\uDD27 ", eq));
    })()), a.profile.experience && a.profile.experience.map((exp, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        gap: 8,
        alignItems: 'flex-start',
        padding: '6px 0',
        borderTop: i > 0 ? '0.5px solid var(--pg-ink-150,#e8e8e8)' : '0.5px solid var(--pg-ink-150,#e8e8e8)',
        marginTop: i === 0 ? 2 : 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 3,
        borderRadius: 2,
        background: 'var(--pg-blue-400)',
        alignSelf: 'stretch',
        flexShrink: 0,
        minHeight: 28
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 700,
        color: 'var(--pg-ink-900)',
        lineHeight: 1.2
      }
    }, tr(exp.role, lang)), exp.duration && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10.5,
        fontWeight: 700,
        color: 'var(--pg-blue-600)',
        flexShrink: 0
      }
    }, tr(exp.duration, lang))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'var(--pg-ink-500)',
        marginTop: 1
      }
    }, exp.company), exp.desc && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'var(--pg-ink-600)',
        lineHeight: 1.45,
        marginTop: 3
      }
    }, tr(exp.desc, lang)))))), a.status === 'rejected' && a.rejectReason && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: 6,
        marginTop: 8,
        padding: '6px 10px',
        borderRadius: 8,
        background: 'oklch(0.97 0.02 20)',
        border: '0.5px solid oklch(0.88 0.08 20)'
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "11",
      height: "11",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "oklch(0.55 0.18 20)",
      strokeWidth: "2.2",
      strokeLinecap: "round",
      style: {
        flexShrink: 0,
        marginTop: 1
      }
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "10"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "8",
      x2: "12",
      y2: "12"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "16",
      x2: "12.01",
      y2: "16"
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11.5,
        color: 'oklch(0.50 0.18 20)',
        lineHeight: 1.4,
        fontStyle: 'italic'
      }
    }, "\"", a.rejectReason, "\"")), a.interview && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        marginTop: 8,
        padding: '5px 10px',
        borderRadius: 8,
        background: 'oklch(0.96 0.04 145)',
        border: '0.5px solid oklch(0.80 0.10 145)'
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "12",
      height: "12",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "oklch(0.40 0.18 145)",
      strokeWidth: "2.2",
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
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11.5,
        fontWeight: 700,
        color: 'oklch(0.40 0.18 145)'
      }
    }, "\uD83D\uDCC5 ", tr(a.interview.day, lang), " \xB7 ", a.interview.time)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 7,
        marginTop: 11,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        onChat(a.applicant_id ? {
          id: a.applicant_id,
          name: a.name,
          listingId: post?._id || null,
          listingContext: {
            name: post?.name || (lang === 'pt' ? 'Vaga' : 'Job'),
            type: post?.type || 'hiring'
          }
        } : a.name);
        onClose();
      },
      className: "pg-btn pg-btn-ghost",
      style: {
        height: 34,
        padding: '0 12px',
        fontSize: 12,
        borderRadius: 999,
        flexShrink: 0
      }
    }, Icon.msg(13, 'var(--pg-blue-700)'), " ", t.chatBtn), a.status === 'pending' && rejectingFor !== a.id && /*#__PURE__*/React.createElement(React.Fragment, null, post.type === 'hiring' ? /*#__PURE__*/React.createElement("button", {
      onClick: () => setSchedulingFor(a),
      className: "pg-btn pg-btn-aqua",
      style: {
        flex: 1,
        height: 34,
        fontSize: 12,
        borderRadius: 999
      }
    }, "\uD83D\uDCC5 ", lang === 'pt' ? 'Agendar entrevista' : lang === 'es' ? 'Agendar entrevista' : 'Schedule interview') : /*#__PURE__*/React.createElement("button", {
      onClick: () => handleAccept(a),
      className: "pg-btn pg-btn-aqua",
      style: {
        flex: 1,
        height: 34,
        fontSize: 12,
        borderRadius: 999
      }
    }, Icon.check(13, 'var(--pg-blue-900)'), " ", t.acceptBtn), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        setRejectingFor(a.id);
        setRejectReason('');
      },
      style: {
        flex: 1,
        height: 34,
        fontSize: 12,
        borderRadius: 999,
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontWeight: 600,
        background: 'oklch(0.95 0.04 20)',
        color: 'oklch(0.45 0.18 20)'
      }
    }, t.rejectBtn)), a.status === 'accepted' && rejectingFor !== a.id && /*#__PURE__*/React.createElement(React.Fragment, null, post.type === 'hiring' && !a.interview && /*#__PURE__*/React.createElement("button", {
      onClick: () => setSchedulingFor(a),
      className: "pg-btn pg-btn-ghost",
      style: {
        flex: 1,
        height: 34,
        fontSize: 12,
        borderRadius: 999
      }
    }, "\uD83D\uDCC5 ", lang === 'pt' ? 'Agendar entrevista' : lang === 'es' ? 'Agendar entrevista' : 'Schedule interview'), (post.type !== 'hiring' || a.interview) && /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        setRejectingFor(a.id);
        setRejectReason('');
      },
      style: {
        flex: 1,
        height: 34,
        fontSize: 12,
        borderRadius: 999,
        border: '1px solid var(--pg-ink-200)',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontWeight: 600,
        background: 'transparent',
        color: 'var(--pg-ink-600)'
      }
    }, t.rejectBtn)), a.status === 'rejected' && /*#__PURE__*/React.createElement("button", {
      onClick: async () => {
        // Restore: clear status + reject_reason
        setApplicants(prev => prev.map(a2 => a2.id === a.id ? {
          ...a2,
          status: 'pending',
          rejectReason: null
        } : a2));
        const found = applicants.find(ap => ap.id === a.id);
        if (post?._live && found?._dbId) {
          await dbUpdate(found._dbId, {
            status: 'pending',
            reject_reason: null
          });
        }
      },
      className: "pg-btn pg-btn-ghost",
      style: {
        flex: 1,
        height: 34,
        fontSize: 12,
        borderRadius: 999
      }
    }, lang === 'pt' ? 'Restaurar' : lang === 'es' ? 'Restaurar' : 'Restore')), rejectingFor === a.id && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 8,
        padding: '10px 12px',
        borderRadius: 10,
        background: 'oklch(0.97 0.02 20)',
        border: '0.5px solid oklch(0.88 0.08 20)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11.5,
        fontWeight: 700,
        color: 'oklch(0.45 0.18 20)',
        marginBottom: 7
      }
    }, lang === 'pt' ? 'Motivo da recusa (opcional)' : lang === 'es' ? 'Motivo del rechazo (opcional)' : 'Reason for rejection (optional)'), /*#__PURE__*/React.createElement("input", {
      autoFocus: true,
      value: rejectReason,
      onChange: e => setRejectReason(e.target.value),
      placeholder: lang === 'pt' ? 'Ex: Pouca experiência…' : lang === 'es' ? 'Ej: Poca experiencia…' : 'E.g. Not enough experience…',
      style: {
        width: '100%',
        boxSizing: 'border-box',
        padding: '9px 11px',
        borderRadius: 9,
        border: '1px solid oklch(0.85 0.07 20)',
        background: 'var(--pg-white)',
        fontSize: 13,
        fontFamily: 'inherit',
        outline: 'none',
        color: 'var(--pg-ink-900)'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 7,
        marginTop: 8
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        setRejectingFor(null);
        setRejectReason('');
      },
      style: {
        flex: 1,
        height: 34,
        fontSize: 12,
        borderRadius: 999,
        border: '1px solid var(--pg-ink-200)',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontWeight: 600,
        background: 'transparent',
        color: 'var(--pg-ink-600)'
      }
    }, lang === 'pt' ? 'Cancelar' : lang === 'es' ? 'Cancelar' : 'Cancel'), /*#__PURE__*/React.createElement("button", {
      onClick: async () => {
        const reason = rejectReason.trim() || null;
        setApplicants(prev => prev.map(a2 => a2.id === a.id ? {
          ...a2,
          status: 'rejected',
          rejectReason: reason
        } : a2));
        if (post?._live && a._dbId && window.sb) {
          await window.sb.from('job_applications').update({
            status: 'rejected',
            reject_reason: reason
          }).eq('id', a._dbId);
        }
        setRejectingFor(null);
        setRejectReason('');
      },
      style: {
        flex: 1,
        height: 34,
        fontSize: 12,
        borderRadius: 999,
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontWeight: 700,
        background: 'oklch(0.55 0.22 25)',
        color: '#fff'
      }
    }, lang === 'pt' ? 'Confirmar' : lang === 'es' ? 'Confirmar' : 'Confirm'))));
  }))), /*#__PURE__*/React.createElement(ApplicantProfileSheet, {
    open: !!profileApp,
    onClose: () => setProfileApp(null),
    applicant: profileApp,
    lang: lang
  }), /*#__PURE__*/React.createElement(InterviewSchedulerSheet, {
    open: !!schedulingFor,
    onClose: () => setSchedulingFor(null),
    applicant: schedulingFor,
    lang: lang,
    onConfirm: interview => scheduleInterview(schedulingFor.id, interview)
  }));
}

// ── Interview Scheduler Sheet ─────────────────────────────────
function InterviewSchedulerSheet({
  open,
  onClose,
  applicant,
  lang = 'en',
  onConfirm
}) {
  // Real current date — recomputed on every render so it's always fresh
  const _now = new Date();
  const NOW_YEAR = _now.getFullYear();
  const NOW_MONTH = _now.getMonth(); // 0-based (5 = June)
  const NOW_DAY = _now.getDate();
  const NOW_HOUR = _now.getHours(); // 0-23

  const ALL_SLOTS = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];

  // Parse a slot string like '2:00 PM' into a 24h hour number
  const slotHour = s => {
    const [time, ampm] = s.split(' ');
    let h = parseInt(time.split(':')[0], 10);
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return h;
  };
  const firstAvailSlot = nowH => ALL_SLOTS.find(s => slotHour(s) > nowH) || '5:00 PM';
  const [selDate, setSelDate] = React.useState(() => {
    const t = new Date();
    return {
      year: t.getFullYear(),
      month: t.getMonth(),
      day: t.getDate()
    };
  });
  const [calYear, setCalYear] = React.useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = React.useState(() => new Date().getMonth());
  const [selTime, setSelTime] = React.useState(() => firstAvailSlot(new Date().getHours()));

  // Reset to today whenever the sheet opens
  React.useEffect(() => {
    if (open) {
      const t = new Date();
      setSelDate({
        year: t.getFullYear(),
        month: t.getMonth(),
        day: t.getDate()
      });
      setCalYear(t.getFullYear());
      setCalMonth(t.getMonth());
      setSelTime(firstAvailSlot(t.getHours()));
    }
  }, [open]);

  // When user picks a different day, auto-correct selTime if it's now past
  React.useEffect(() => {
    const isSelToday = selDate.year === NOW_YEAR && selDate.month === NOW_MONTH && selDate.day === NOW_DAY;
    if (isSelToday && slotHour(selTime) <= NOW_HOUR) {
      setSelTime(firstAvailSlot(NOW_HOUR));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selDate.year, selDate.month, selDate.day]);
  if (!applicant) return null;
  const monthNamesFull = {
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    pt: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
    es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  };
  const monthNamesShort = {
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    pt: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
    es: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  };
  const weekdayLabels = {
    en: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    pt: ['Do', 'Se', 'Te', 'Qu', 'Qu', 'Se', 'Sá'],
    es: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá']
  };
  const shortDays = {
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    pt: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    es: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  };

  // Build calendar grid
  const firstDow = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const canPrevMonth = !(calYear === NOW_YEAR && calMonth <= NOW_MONTH);
  const prevMonth = () => {
    if (!canPrevMonth) return;
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(y => y - 1);
    } else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(y => y + 1);
    } else setCalMonth(m => m + 1);
  };

  // Formatted day display for summary / chip
  const dow = new Date(selDate.year, selDate.month, selDate.day).getDay();
  const dayDisplay = {
    en: `${shortDays.en[dow]}, ${monthNamesShort.en[selDate.month]} ${selDate.day}`,
    pt: `${shortDays.pt[dow]}, ${selDate.day} ${monthNamesShort.pt[selDate.month]}`,
    es: `${shortDays.es[dow]}, ${selDate.day} ${monthNamesShort.es[selDate.month]}`
  };
  const isSelInView = selDate.year === calYear && selDate.month === calMonth;

  // Filter time slots: hide past slots when selected day is today
  const isSelToday = selDate.year === NOW_YEAR && selDate.month === NOW_MONTH && selDate.day === NOW_DAY;
  const visibleSlots = isSelToday ? ALL_SLOTS.filter(s => slotHour(s) > NOW_HOUR) : ALL_SLOTS;
  // If selTime is no longer visible (became past), show first available instead
  const displayTime = visibleSlots.includes(selTime) ? selTime : visibleSlots[0] || selTime;
  const titleLbl = lang === 'pt' ? 'Agendar Entrevista' : lang === 'es' ? 'Agendar Entrevista' : 'Schedule Interview';
  const confirmLbl = lang === 'pt' ? 'Confirmar entrevista' : lang === 'es' ? 'Confirmar entrevista' : 'Confirm interview';
  const dateLbl = lang === 'pt' ? 'DATA' : lang === 'es' ? 'FECHA' : 'DATE';
  const timeLbl = lang === 'pt' ? 'HORÁRIO' : lang === 'es' ? 'HORA' : 'TIME';
  const noteLbl = lang === 'pt' ? 'O candidato será notificado pelo chat.' : lang === 'es' ? 'El candidato será notificado por chat.' : 'Candidate will be notified via chat.';
  return /*#__PURE__*/React.createElement(Sheet, {
    open: open,
    onClose: onClose,
    height: "92%"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      overflow: 'auto',
      height: '100%',
      padding: '6px 18px 32px'
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
      fontSize: 18,
      fontWeight: 700,
      letterSpacing: '-0.015em'
    }
  }, titleLbl), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: 'var(--pg-ink-500)',
      marginTop: 3,
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: applicant.name,
    size: 18
  }), applicant.name, " \xB7 ", /*#__PURE__*/React.createElement(Stars, {
    rating: applicant.rating,
    size: 10
  }), " ", applicant.rating)), /*#__PURE__*/React.createElement("button", {
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
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.07em',
      color: 'var(--pg-ink-400)',
      marginBottom: 8
    }
  }, dateLbl), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
      padding: '0 2px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: prevMonth,
    style: {
      border: 'none',
      background: 'transparent',
      cursor: canPrevMonth ? 'pointer' : 'default',
      opacity: canPrevMonth ? 1 : 0.25,
      padding: 4,
      display: 'flex',
      borderRadius: 8
    }
  }, Icon.chev(18, 'var(--pg-ink-700)', 'left')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      letterSpacing: '-0.01em',
      color: 'var(--pg-ink-900)'
    }
  }, (monthNamesFull[lang] || monthNamesFull.en)[calMonth], " ", calYear), /*#__PURE__*/React.createElement("button", {
    onClick: nextMonth,
    style: {
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      padding: 4,
      display: 'flex',
      borderRadius: 8
    }
  }, Icon.chev(18, 'var(--pg-ink-700)'))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7,1fr)',
      gap: 2,
      marginBottom: 4
    }
  }, (weekdayLabels[lang] || weekdayLabels.en).map((d, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      textAlign: 'center',
      fontSize: 10.5,
      fontWeight: 700,
      color: 'var(--pg-ink-400)',
      letterSpacing: '0.03em',
      padding: '2px 0'
    }
  }, d))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7,1fr)',
      gap: 2
    }
  }, cells.map((day, i) => {
    if (!day) return /*#__PURE__*/React.createElement("div", {
      key: i
    });
    const isPast = calYear < NOW_YEAR || calYear === NOW_YEAR && calMonth < NOW_MONTH || calYear === NOW_YEAR && calMonth === NOW_MONTH && day < NOW_DAY;
    const isSel = isSelInView && selDate.day === day;
    const isToday = calYear === NOW_YEAR && calMonth === NOW_MONTH && day === NOW_DAY;
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      disabled: isPast,
      onClick: () => !isPast && setSelDate({
        year: calYear,
        month: calMonth,
        day
      }),
      style: {
        height: 36,
        borderRadius: 9,
        border: isToday && !isSel ? '1.5px solid var(--pg-blue-300)' : 'none',
        cursor: isPast ? 'default' : 'pointer',
        fontFamily: 'inherit',
        fontSize: 12.5,
        fontWeight: isSel ? 700 : 500,
        transition: 'all .1s',
        background: isSel ? 'var(--pg-blue-500)' : isToday ? 'var(--pg-blue-50)' : 'transparent',
        color: isSel ? '#fff' : isPast ? 'var(--pg-ink-200)' : 'var(--pg-ink-900)',
        boxShadow: isSel ? '0 2px 8px oklch(0.58 0.16 235 / 0.30)' : 'none'
      }
    }, day);
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.07em',
      color: 'var(--pg-ink-400)',
      marginBottom: 8
    }
  }, timeLbl), visibleSlots.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: 'var(--pg-ink-400)',
      fontStyle: 'italic',
      padding: '6px 0',
      lineHeight: 1.5
    }
  }, lang === 'pt' ? 'Nenhum horário disponível para hoje. Selecione outro dia.' : lang === 'es' ? 'No hay horarios disponibles hoy. Seleccione otro día.' : 'No time slots available for today. Please select another day.') : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 7
    }
  }, visibleSlots.map(slot => {
    const on = displayTime === slot;
    return /*#__PURE__*/React.createElement("button", {
      key: slot,
      onClick: () => setSelTime(slot),
      style: {
        padding: '7px 12px',
        borderRadius: 9,
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 12.5,
        fontWeight: 600,
        transition: 'all .12s',
        background: on ? 'var(--pg-blue-500)' : 'var(--pg-ink-100)',
        color: on ? '#fff' : 'var(--pg-ink-700)',
        boxShadow: on ? '0 2px 6px oklch(0.58 0.16 235 / 0.25)' : 'none'
      }
    }, slot);
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '11px 14px',
      borderRadius: 12,
      background: 'oklch(0.96 0.04 145)',
      border: '0.5px solid oklch(0.80 0.10 145)',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "oklch(0.40 0.18 145)",
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
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 14h.01M12 14h.01M16 14h.01"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: 'oklch(0.36 0.18 145)',
      letterSpacing: '-0.01em'
    }
  }, tr(dayDisplay, lang), " \xB7 ", displayTime), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'oklch(0.50 0.14 145)',
      marginTop: 1
    }
  }, noteLbl))), /*#__PURE__*/React.createElement("button", {
    onClick: () => onConfirm({
      day: dayDisplay,
      time: displayTime
    }),
    className: "pg-btn pg-btn-primary",
    style: {
      width: '100%',
      height: 50,
      fontSize: 15,
      borderRadius: 14
    }
  }, Icon.check(16, '#fff'), " ", confirmLbl)));
}

// ── Applicant Profile Preview Sheet ───────────────────────────
function ApplicantProfileSheet({
  open,
  onClose,
  applicant,
  lang = 'en'
}) {
  const [reviewLang, setReviewLang] = React.useState(lang);
  const [realRatings, setRealRatings] = React.useState(null);
  const [livePhoto, setLivePhoto] = React.useState(null); // fetched from profiles table

  React.useEffect(() => {
    if (open) setReviewLang(lang);
  }, [open, lang]);

  // Fetch applicant's current profile photo + real ratings from Supabase
  React.useEffect(() => {
    setRealRatings(null);
    setLivePhoto(null);
    if (!open || !applicant?.applicant_id || !window.sb) return;
    // Photo from profiles table (always fresh, even for old applications)
    window.sb.from('profiles_public').select('photo_url').eq('id', applicant.applicant_id).then(({
      data
    }) => {
      const row = Array.isArray(data) ? data[0] : null;
      if (row?.photo_url) setLivePhoto(row.photo_url);
    });
    // Real ratings
    // Visible once either: revealed (both sides rated) or the 7-day blind window expired
    window.sb.from('ratings').select('id,stars,comment,from_id,from_name,created_at').eq('to_id', applicant.applicant_id).or('pending.eq.false,expires_at.lt.' + new Date().toISOString()).order('created_at', {
      ascending: false
    }).limit(20).then(({
      data
    }) => setRealRatings(data || [])).catch(() => setRealRatings([]));
  }, [open, applicant?.applicant_id]); // eslint-disable-line

  if (!applicant) return null;

  // Use profile snapshot (nested under applicant.profile)
  const prof = applicant.profile || {};
  const badgeCfg = jobs => {
    if (jobs >= 100) return {
      label: 'EXPERT',
      bg: 'oklch(0.93 0.06 80)',
      color: 'oklch(0.40 0.18 80)'
    };
    if (jobs >= 20) return {
      label: 'RELIABLE',
      bg: 'var(--pg-aqua-100)',
      color: 'var(--pg-aqua-700)'
    };
    return {
      label: 'ROOKIE',
      bg: 'var(--pg-blue-100)',
      color: 'var(--pg-blue-700)'
    };
  };
  const badge = badgeCfg(applicant.jobs);
  const LANGS = ['en', 'pt', 'es'];
  const LANG_LABELS = {
    en: 'EN',
    pt: 'PT',
    es: 'ES'
  };

  // ── Localized labels ──────────────────────────
  const sectionLbl = (en, pt, es) => lang === 'pt' ? pt : lang === 'es' ? es : en;
  const CarIcon = (c = 'var(--pg-ink-500)') => /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: c,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h1l3-4h9l3 4h1a2 2 0 012 2v6a2 2 0 01-2 2h-2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7.5",
    cy: "17.5",
    r: "1.5"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "16.5",
    cy: "17.5",
    r: "1.5"
  }));
  const LicenseIcon = (c = 'var(--pg-ink-500)') => /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: c,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: "6",
    width: "20",
    height: "13",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 10h4M7 14h6M15 10h2v4h-2z"
  }));
  const ToolIcon = (c = 'var(--pg-ink-500)') => /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: c,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M14 7a4 4 0 1 0-5 5l-6 6 3 3 6-6a4 4 0 0 0 5-5l-3 3-3-3z"
  }));
  const BriefcaseIcon = (c = 'var(--pg-ink-500)') => Icon.briefcase(13, c);
  const hasProfile = prof.age || prof.region || prof.hasCar !== undefined;
  const hasExp = prof.experience && prof.experience.length > 0;

  // Chip helper for yes/no fields
  const YesNoChip = ({
    yes,
    yesLabel,
    noLabel,
    icon
  }) => /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      fontSize: 12,
      fontWeight: 600,
      padding: '5px 11px',
      borderRadius: 999,
      background: yes ? 'var(--pg-aqua-100)' : 'var(--pg-ink-100)',
      color: yes ? 'var(--pg-aqua-800)' : 'var(--pg-ink-400)'
    }
  }, icon(yes ? 'var(--pg-aqua-700)' : 'var(--pg-ink-400)'), yes ? yesLabel : noLabel);
  return /*#__PURE__*/React.createElement(Sheet, {
    open: open,
    onClose: onClose,
    height: "90%"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 18px 40px',
      height: '100%',
      overflow: 'auto',
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: applicant.name,
    size: 64,
    src: livePhoto || prof.photoUrl || undefined
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--pg-font-display)',
      fontSize: 20,
      fontWeight: 700,
      letterSpacing: '-0.02em'
    }
  }, applicant.name), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginTop: 4,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10.5,
      fontWeight: 700,
      padding: '3px 8px',
      borderRadius: 6,
      background: badge.bg,
      color: badge.color
    }
  }, badge.label), /*#__PURE__*/React.createElement(Stars, {
    rating: applicant.rating,
    size: 11
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--pg-ink-500)',
      fontWeight: 600
    }
  }, applicant.rating)))), /*#__PURE__*/React.createElement("button", {
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
      gap: 8,
      marginBottom: 20
    }
  }, [{
    val: applicant.jobs,
    label: sectionLbl('Jobs done', 'Jobs feitos', 'Jobs hechos')
  }, {
    val: `${applicant.rating}★`,
    label: sectionLbl('Rating', 'Avaliação', 'Calificación')
  }, {
    val: applicant.jobs >= 100 ? '3+yr' : applicant.jobs >= 30 ? '1+yr' : '<1yr',
    label: sectionLbl('On platform', 'Na plataforma', 'En plataforma')
  }].map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      flex: 1,
      textAlign: 'center',
      padding: '10px 4px',
      borderRadius: 12,
      background: 'var(--pg-blue-50)',
      border: '0.5px solid var(--pg-blue-200)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--pg-font-display)',
      fontSize: 18,
      fontWeight: 700,
      color: 'var(--pg-blue-600)',
      letterSpacing: '-0.02em'
    }
  }, s.val), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      fontWeight: 600,
      color: 'var(--pg-ink-500)',
      marginTop: 2
    }
  }, s.label.toUpperCase())))), hasProfile && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: 'var(--pg-ink-400)',
      letterSpacing: '0.06em',
      marginBottom: 10
    }
  }, sectionLbl('PROFILE', 'PERFIL', 'PERFIL')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 7
    }
  }, prof.age && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      fontSize: 12,
      fontWeight: 600,
      padding: '5px 11px',
      borderRadius: 999,
      background: 'var(--pg-ink-100)',
      color: 'var(--pg-ink-700)'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--pg-ink-500)",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "8",
    r: "5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 21v-1a9 9 0 0118 0v1"
  })), prof.age, " ", sectionLbl('yrs', 'anos', 'años')), prof.region && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      fontSize: 12,
      fontWeight: 600,
      padding: '5px 11px',
      borderRadius: 999,
      background: 'var(--pg-ink-100)',
      color: 'var(--pg-ink-700)'
    }
  }, Icon.pin(12, 'var(--pg-ink-500)'), " ", prof.region), prof.hasCar !== undefined && /*#__PURE__*/React.createElement(YesNoChip, {
    yes: prof.hasCar,
    yesLabel: sectionLbl('Own vehicle', 'Veículo próprio', 'Vehículo propio'),
    noLabel: sectionLbl('No vehicle', 'Sem veículo', 'Sin vehículo'),
    icon: CarIcon
  }), prof.hasLicense !== undefined && /*#__PURE__*/React.createElement(YesNoChip, {
    yes: prof.hasLicense,
    yesLabel: sectionLbl("Valid driver's license", "Driver's license válida", "Driver's license válida"),
    noLabel: sectionLbl('No license', "Sem driver's license", "Sin driver's license"),
    icon: LicenseIcon
  }))), prof.equipment && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: 'var(--pg-ink-400)',
      letterSpacing: '0.06em',
      marginBottom: 10
    }
  }, sectionLbl('EQUIPMENT', 'EQUIPAMENTOS', 'EQUIPOS')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 6
    }
  }, (Array.isArray(prof.equipment) ? prof.equipment : tr(prof.equipment, lang) || []).map((eq, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      fontSize: 12,
      fontWeight: 600,
      padding: '5px 11px',
      borderRadius: 999,
      background: 'var(--pg-blue-50)',
      border: '0.5px solid var(--pg-blue-200)',
      color: 'var(--pg-blue-800)'
    }
  }, ToolIcon('var(--pg-blue-600)'), " ", eq)))), hasExp && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: 'var(--pg-ink-400)',
      letterSpacing: '0.06em',
      marginBottom: 10
    }
  }, sectionLbl('WORK EXPERIENCE', 'EXPERIÊNCIA', 'EXPERIENCIA')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, prof.experience.map((exp, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      padding: '12px 14px',
      borderRadius: 12,
      background: 'var(--pg-ink-50)',
      border: '0.5px solid var(--pg-ink-200)',
      borderLeft: '3px solid var(--pg-blue-400)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 8,
      marginBottom: 4
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
      letterSpacing: '-0.01em'
    }
  }, tr(exp.role, lang)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      marginTop: 2
    }
  }, BriefcaseIcon('var(--pg-ink-400)'), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--pg-ink-600)',
      fontWeight: 500
    }
  }, exp.company))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: 'var(--pg-blue-600)',
      flexShrink: 0,
      background: 'var(--pg-blue-50)',
      padding: '3px 8px',
      borderRadius: 6
    }
  }, tr(exp.duration, lang))), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 12,
      color: 'var(--pg-ink-600)',
      lineHeight: 1.5
    }
  }, tr(exp.desc, lang)))))), applicant.note && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20,
      padding: '10px 13px',
      borderRadius: 11,
      background: 'var(--pg-blue-50)',
      border: '0.5px solid var(--pg-blue-100)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: 'var(--pg-ink-400)',
      letterSpacing: '0.06em',
      marginBottom: 5
    }
  }, sectionLbl('NOTE FROM APPLICANT', 'NOTA DO CANDIDATO', 'NOTA DEL CANDIDATO')), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 12.5,
      color: 'var(--pg-ink-700)',
      lineHeight: 1.5,
      fontStyle: 'italic'
    }
  }, "\"", tr(applicant.note, lang), "\"")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: 'var(--pg-ink-400)',
      letterSpacing: '0.06em',
      marginBottom: 10
    }
  }, sectionLbl('REVIEWS', 'AVALIAÇÕES', 'RESEÑAS'), realRatings !== null && ` (${realRatings.length})`), realRatings === null && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '20px 0',
      color: 'var(--pg-ink-400)',
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement(Shimmer, {
    style: {
      height: 60,
      borderRadius: 12,
      marginBottom: 8
    }
  }), /*#__PURE__*/React.createElement(Shimmer, {
    style: {
      height: 60,
      borderRadius: 12
    }
  })), realRatings !== null && realRatings.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '20px 0',
      color: 'var(--pg-ink-400)',
      fontSize: 13
    }
  }, sectionLbl('No reviews yet', 'Nenhuma avaliação ainda', 'Sin reseñas aún')), realRatings !== null && realRatings.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, realRatings.map(r => /*#__PURE__*/React.createElement("div", {
    key: r.id,
    className: "pg-card",
    style: {
      padding: '12px 14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(AvatarFetch, {
    uid: r.from_id,
    name: r.from_name || '?',
    size: 28
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600
    }
  }, r.from_name || '?')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, r.stars && /*#__PURE__*/React.createElement(Stars, {
    rating: r.stars,
    size: 10
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--pg-ink-500)'
    }
  }, relTimeGlobal(r.created_at)))), r.comment && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 12.5,
      color: 'var(--pg-ink-700)',
      lineHeight: 1.5
    }
  }, "\"", r.comment, "\"")))))));
}

// ── Identity Verification ─────────────────────────────────────
function VerificationSheet({
  open,
  onClose,
  lang = 'en'
}) {
  const [done, setDone] = React.useState([]);
  const steps = [{
    id: 'id',
    icon: Icon.user,
    title: {
      en: 'Government ID',
      pt: 'Documento Oficial',
      es: 'ID Oficial'
    },
    sub: {
      en: 'Passport, driver\'s license or state ID',
      pt: 'Passport, driver\'s license or state ID',
      es: 'Passport, driver\'s license or state ID'
    },
    time: '~2 min'
  }, {
    id: 'selfie',
    icon: Icon.user,
    title: {
      en: 'Selfie verification',
      pt: 'Selfie de verificação',
      es: 'Selfie de verificación'
    },
    sub: {
      en: 'Live photo to match your ID',
      pt: 'Foto ao vivo para confirmar documento',
      es: 'Foto en vivo para confirmar tu ID'
    },
    time: '~1 min'
  }, {
    id: 'bg',
    icon: Icon.shield,
    title: {
      en: 'Background check',
      pt: 'Verificação de antecedentes',
      es: 'Verificación de antecedentes'
    },
    sub: {
      en: 'Instant results via our partner',
      pt: 'Resultado imediato pelo nosso parceiro',
      es: 'Resultado inmediato por nuestro socio'
    },
    time: '~5 min'
  }];
  const headLbl = lang === 'pt' ? 'Verificação de identidade' : lang === 'es' ? 'Verificación de identidad' : 'Identity Verification';
  const descLbl = lang === 'pt' ? 'Piscineiros verificados recebem 40% mais contatos e aparecem primeiro nos resultados.' : lang === 'es' ? 'Los técnicos verificados reciben 40% más contactos y aparecen primero en los resultados.' : 'Verified pool guys get 40% more contacts and appear first in search results.';
  const allDone = done.length === steps.length;
  const score = Math.round(60 + done.length / steps.length * 40);
  const scoreWid = `${score}%`;
  const trustLbl = lang === 'pt' ? 'PONTUAÇÃO DE CONFIANÇA' : lang === 'es' ? 'PUNTUACIÓN DE CONFIANZA' : 'TRUST SCORE';
  const leftLbl = n => lang === 'pt' ? `${n} etapa${n !== 1 ? 's' : ''} restante${n !== 1 ? 's' : ''}` : lang === 'es' ? `${n} paso${n !== 1 ? 's' : ''} más` : `${n} step${n !== 1 ? 's' : ''} left for max score`;
  const verifiedLbl = lang === 'pt' ? 'Verificado' : lang === 'es' ? 'Verificado' : 'Verified';
  const doneLbl = lang === 'pt' ? 'Conta verificada!' : lang === 'es' ? '¡Cuenta verificada!' : 'Account verified!';
  const doneSubLbl = lang === 'pt' ? 'Seu perfil aparece como verificado para outros usuários.' : lang === 'es' ? 'Tu perfil aparece como verificado para otros.' : 'Your profile appears as verified to other users.';
  return /*#__PURE__*/React.createElement(Sheet, {
    open: open,
    onClose: onClose,
    height: "92%"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      overflow: 'auto',
      height: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 18px 36px'
    }
  }, /*#__PURE__*/React.createElement("div", {
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
  }, headLbl), /*#__PURE__*/React.createElement("button", {
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
  }, Icon.x(16, 'var(--pg-ink-700)'))), allDone ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '14px 16px',
      borderRadius: 14,
      background: 'var(--pg-aqua-100)',
      border: '0.5px solid var(--pg-aqua-400)',
      marginBottom: 18
    }
  }, Icon.shield(22, 'var(--pg-aqua-700)'), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: 'var(--pg-aqua-700)'
    }
  }, doneLbl), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--pg-aqua-600)',
      marginTop: 2
    }
  }, doneSubLbl))) : /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 18px',
      fontSize: 13,
      color: 'var(--pg-ink-500)',
      lineHeight: 1.5
    }
  }, descLbl), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, steps.map((step, idx) => {
    const isDone = done.includes(step.id);
    const prevDone = idx === 0 || done.includes(steps[idx - 1].id);
    const available = prevDone && !isDone;
    return /*#__PURE__*/React.createElement("button", {
      key: step.id,
      onClick: available ? () => setDone(d => [...d, step.id]) : undefined,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 16px',
        border: '1px solid ' + (isDone ? 'var(--pg-aqua-400)' : available ? 'var(--pg-blue-200)' : 'var(--pg-ink-200)'),
        borderRadius: 14,
        background: isDone ? 'var(--pg-aqua-50)' : available ? 'var(--pg-white)' : 'var(--pg-ink-50)',
        cursor: available ? 'pointer' : 'default',
        fontFamily: 'inherit',
        textAlign: 'left',
        opacity: !isDone && !available ? 0.5 : 1,
        transition: 'all .15s'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 44,
        height: 44,
        borderRadius: 12,
        flexShrink: 0,
        background: isDone ? 'var(--pg-aqua-500)' : available ? 'var(--pg-blue-100)' : 'var(--pg-ink-100)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, isDone ? Icon.check(20, '#fff') : step.icon(20, available ? 'var(--pg-blue-700)' : 'var(--pg-ink-400)')), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        fontWeight: 700,
        color: isDone ? 'var(--pg-aqua-700)' : 'var(--pg-ink-900)'
      }
    }, tr(step.title, lang)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--pg-ink-500)',
        marginTop: 2,
        lineHeight: 1.35
      }
    }, tr(step.sub, lang)), !isDone && available && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'var(--pg-blue-600)',
        marginTop: 5,
        fontWeight: 600
      }
    }, step.time)), isDone ? /*#__PURE__*/React.createElement("span", {
      className: "pg-chip pg-chip-aqua",
      style: {
        fontSize: 10,
        padding: '3px 8px',
        flexShrink: 0
      }
    }, verifiedLbl) : available ? Icon.chev(16, 'var(--pg-ink-400)') : Icon.lock(14, 'var(--pg-ink-300)'));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18,
      padding: '16px 18px',
      borderRadius: 16,
      background: 'linear-gradient(135deg, var(--pg-navy-900), var(--pg-blue-600))',
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      opacity: 0.7,
      letterSpacing: '0.09em',
      fontWeight: 700,
      marginBottom: 10
    }
  }, trustLbl), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--pg-font-display)',
      fontSize: 40,
      fontWeight: 700,
      letterSpacing: '-0.04em'
    }
  }, score), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      opacity: 0.6
    }
  }, "/100")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      height: 7,
      borderRadius: 4,
      background: 'rgba(255,255,255,0.15)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      borderRadius: 4,
      width: scoreWid,
      background: 'var(--pg-aqua-400)',
      transition: 'width .6s ease'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      opacity: 0.6,
      marginTop: 8
    }
  }, leftLbl(steps.length - done.length))))));
}

// ── Push Notifications permission ─────────────────────────────
function PushNotifSheet({
  open,
  onClose,
  lang = 'en',
  onEnabled
}) {
  const [state, setState] = React.useState('idle'); // idle | requesting | enabled | denied

  const PUSH_LBL_MAP = {
    en: {
      title: 'Push Notifications',
      sub: 'Stay ahead of the competition — get jobs the moment they\'re posted.',
      types: ['New Quick Pool in your region', 'Application accepted/rejected', 'New message from a poster', 'Route & vacation updates'],
      allow: 'Enable Notifications',
      later: 'Maybe later',
      enabledTitle: 'Notifications enabled!',
      enabledSub: 'You\'ll be notified of new jobs instantly.'
    },
    pt: {
      title: 'Notificacoes Push',
      sub: 'Fique a frente da concorrencia — receba trabalhos no momento em que forem publicados.',
      types: ['Nova Piscina Rapida na sua regiao', 'Candidatura aceita/rejeitada', 'Nova mensagem de um anunciante', 'Atualizacoes de rota e ferias'],
      allow: 'Ativar Notificacoes',
      later: 'Talvez mais tarde',
      enabledTitle: 'Notificacoes ativadas!',
      enabledSub: 'Voce sera notificado de novos trabalhos instantaneamente.'
    },
    es: {
      title: 'Notificaciones Push',
      sub: 'Adelantate a la competencia — recibe trabajos en el momento en que se publican.',
      types: ['Nueva Piscina Rapida en tu region', 'Postulacion aceptada/rechazada', 'Nuevo mensaje de un anunciante', 'Actualizaciones de ruta y vacaciones'],
      allow: 'Activar Notificaciones',
      later: 'Quizas despues',
      enabledTitle: 'Notificaciones activadas!',
      enabledSub: 'Recibiras notificaciones de nuevos trabajos al instante.'
    }
  };
  const lbl = PUSH_LBL_MAP[lang] || PUSH_LBL_MAP.en;
  const handleAllow = () => {
    setState('requesting');
    setTimeout(() => {
      setState('enabled');
      if (onEnabled) onEnabled();
    }, 1200);
  };
  return /*#__PURE__*/React.createElement(Sheet, {
    open: open,
    onClose: onClose,
    height: "auto"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '6px 20px 36px'
    }
  }, state === 'enabled' ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '10px 0 8px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 64,
      height: 64,
      borderRadius: 20,
      background: 'var(--pg-aqua-100)',
      margin: '0 auto 14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, Icon.check(28, 'var(--pg-aqua-700)')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 700,
      letterSpacing: '-0.01em'
    }
  }, lbl.enabledTitle), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--pg-ink-500)',
      marginTop: 6,
      lineHeight: 1.5
    }
  }, lbl.enabledSub), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    className: "pg-btn pg-btn-primary",
    style: {
      width: '100%',
      height: 50,
      fontSize: 15,
      marginTop: 20
    }
  }, "OK")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 50,
      height: 50,
      borderRadius: 14,
      background: 'linear-gradient(135deg,var(--pg-blue-500),var(--pg-aqua-500))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, Icon.bell(24, '#fff')), /*#__PURE__*/React.createElement("button", {
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
  }, Icon.x(16, 'var(--pg-ink-700)'))), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '0 0 6px',
      fontSize: 20,
      fontWeight: 700,
      letterSpacing: '-0.02em'
    }
  }, lbl.title), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 18px',
      fontSize: 13,
      color: 'var(--pg-ink-500)',
      lineHeight: 1.5
    }
  }, lbl.sub), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      marginBottom: 20
    }
  }, lbl.types.map((type, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 12px',
      borderRadius: 12,
      background: 'var(--pg-blue-50)',
      border: '0.5px solid var(--pg-blue-100)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 32,
      height: 32,
      borderRadius: 9,
      background: 'var(--pg-blue-100)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, Icon.bolt(15, 'var(--pg-blue-700)')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      color: 'var(--pg-blue-800)'
    }
  }, type)))), /*#__PURE__*/React.createElement("button", {
    onClick: handleAllow,
    className: "pg-btn pg-btn-primary",
    style: {
      width: '100%',
      height: 52,
      fontSize: 15,
      marginBottom: 10,
      position: 'relative'
    }
  }, state === 'requesting' ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 16,
      height: 16,
      border: '2px solid rgba(255,255,255,0.4)',
      borderTopColor: '#fff',
      borderRadius: '50%',
      animation: 'pg-spin .7s linear infinite',
      display: 'inline-block'
    }
  }), lang === 'pt' ? 'Aguarde…' : lang === 'es' ? 'Espera…' : 'Requesting…') : lbl.allow), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      width: '100%',
      padding: '10px',
      border: 'none',
      background: 'transparent',
      color: 'var(--pg-ink-500)',
      fontSize: 14,
      cursor: 'pointer',
      fontFamily: 'inherit'
    }
  }, lbl.later))));
}

// ── Notifications ─────────────────────────────────────────────
function NotificationsSheet({
  open,
  onClose,
  lang = 'en',
  user,
  onUnreadChange,
  onNavigate
}) {
  const [notifs, setNotifs] = React.useState(null); // null = loading
  const [marking, setMarking] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(false);
  const PAGE_SIZE = 30;

  // Fetch on open (first page)
  React.useEffect(() => {
    if (!open || !user?.uid || !window.sb) return;
    setPage(1);
    window.sb.from('notifications').select('*').eq('user_id', user.uid).order('created_at', {
      ascending: false
    }).limit(PAGE_SIZE + 1).then(({
      data
    }) => {
      const rows = data || [];
      setHasMore(rows.length > PAGE_SIZE);
      setNotifs(rows.slice(0, PAGE_SIZE));
      if (onUnreadChange) onUnreadChange(rows.filter(n => !n.read).length);
    });
  }, [open, user?.uid]);
  const loadMore = () => {
    if (!window.sb || !user?.uid || !hasMore) return;
    const nextPage = page + 1;
    const offset = (nextPage - 1) * PAGE_SIZE;
    window.sb.from('notifications').select('*').eq('user_id', user.uid).order('created_at', {
      ascending: false
    }).then(({
      data
    }) => {
      const rows = data || [];
      const slice = rows.slice(offset, offset + PAGE_SIZE);
      setHasMore(rows.length > offset + PAGE_SIZE);
      setNotifs(prev => [...(prev || []), ...slice]);
      setPage(nextPage);
    });
  };
  const deleteNotif = id => {
    if (!window.sb) return;
    const next = (notifs || []).filter(n => n.id !== id);
    setNotifs(next);
    window.sb.from('notifications').delete().eq('id', id).catch(() => {});
    // Parent expects a NUMBER (does count>0), not an updater fn — recompute remaining unread.
    if (onUnreadChange) onUnreadChange(next.filter(n => !n.read).length);
  };

  // Real-time new notifications
  React.useEffect(() => {
    if (!user?.uid || !window.sb) return;
    const ch = window.sb.channel('notifs-ui-' + user.uid).on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${user.uid}`
    }, p => {
      setNotifs(prev => prev ? [p.new, ...prev] : [p.new]);
      if (onUnreadChange) onUnreadChange(1);
    }).subscribe();
    return () => window.sb.removeChannel(ch);
  }, [user?.uid]);

  // Mark all read when sheet opens (with a short delay so user sees the unread state first)
  React.useEffect(() => {
    if (!open || !user?.uid || !window.sb || marking) return;
    if (!notifs || !notifs.some(n => !n.read)) return;
    const t = setTimeout(() => {
      setMarking(true);
      window.sb.from('notifications').update({
        read: true
      }).eq('user_id', user.uid).eq('read', false).then(() => {
        setNotifs(prev => prev ? prev.map(n => ({
          ...n,
          read: true
        })) : prev);
        if (onUnreadChange) onUnreadChange(0);
        setMarking(false);
      });
    }, 1500);
    return () => clearTimeout(t);
  }, [open, notifs]);
  const markAllNow = () => {
    if (!window.sb || !user?.uid) return;
    window.sb.from('notifications').update({
      read: true
    }).eq('user_id', user.uid).eq('read', false).then(() => {
      setNotifs(prev => prev ? prev.map(n => ({
        ...n,
        read: true
      })) : prev);
      if (onUnreadChange) onUnreadChange(0);
    });
  };

  // ── Notification text rendering ──────────────────────────────
  // Titles for known types — always localized regardless of what's stored in DB
  // This fixes legacy English-only notifications AND new multilingual ones
  const NOTIF_TITLES = {
    rental_request: {
      en: 'New rental request',
      pt: 'Novo pedido de aluguel',
      es: 'Nueva solicitud de alquiler'
    },
    rental_approved: {
      en: 'Rental approved! 🎉',
      pt: 'Aluguel aprovado! 🎉',
      es: '¡Alquiler aprobado! 🎉'
    },
    rental_declined: {
      en: 'Rental request declined',
      pt: 'Pedido de aluguel recusado',
      es: 'Solicitud de alquiler rechazada'
    },
    rental_cancelled: {
      en: 'Rental cancelled by owner',
      pt: 'Aluguel cancelado pelo dono',
      es: 'Alquiler cancelado por el propietario'
    },
    rental_completed: {
      en: 'Rental completed ✓',
      pt: 'Aluguel finalizado ✓',
      es: 'Alquiler completado ✓'
    },
    dispute_resolved: {
      en: 'Dispute resolved',
      pt: 'Disputa resolvida',
      es: 'Disputa resuelta'
    },
    job_new_application: {
      en: 'New job application',
      pt: 'Nova candidatura recebida',
      es: 'Nueva postulación recibida'
    },
    job_accepted: {
      en: 'Application accepted! 🎉',
      pt: 'Candidatura aceita! 🎉',
      es: '¡Postulación aceptada! 🎉'
    },
    job_rejected: {
      en: 'Application not selected',
      pt: 'Candidatura não selecionada',
      es: 'Postulación no seleccionada'
    }
  };
  const renderTitle = n => {
    const entry = NOTIF_TITLES[n.type];
    if (entry) return entry[lang] || entry.en;
    // warning and others — stored title may be plain or JSON
    return renderText(n.title);
  };

  // Body: 1) try JSON (new format), 2) pattern-replace legacy English strings
  const renderText = raw => {
    if (!raw) return '';
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed[lang] || parsed.en || parsed.pt || '';
    } catch (e) {}
    return raw;
  };
  const renderBody = n => {
    const raw = n.body;
    if (!raw) return '';
    // New format (JSON) — try first
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed[lang] || parsed.en || parsed.pt || '';
    } catch (e) {}
    // Legacy plain-text English — translate common patterns
    if (lang === 'pt') {
      return raw.replace(/ wants to rent /, ' quer alugar ').replace('The owner approved your request for ', 'O dono aprovou seu pedido para ').replace('The owner did not accept your request.', 'O dono não aceitou seu pedido.').replace('The owner cancelled the active rental.', 'O dono cancelou o aluguel em andamento.').replace('Rental approved! 🎉', 'Aluguel aprovado! 🎉');
    }
    if (lang === 'es') {
      return raw.replace(/ wants to rent /, ' quiere alquilar ').replace('The owner approved your request for ', 'El propietario aprobó tu solicitud para ').replace('The owner did not accept your request.', 'El propietario no aceptó tu solicitud.').replace('The owner cancelled the active rental.', 'El propietario canceló el alquiler en curso.');
    }
    return raw;
  };

  // Whether this notification type is navigable
  const isNavigable = n => !!(onNavigate && (n.link_id || n.type));
  const iconFor = type => {
    if (type === 'rental_request') return Icon.key(17, '#fff');
    if (type === 'rental_approved') return Icon.check(17, '#fff');
    if (type === 'rental_declined') return Icon.x(17, '#fff');
    if (type === 'rental_cancelled') return Icon.x(17, '#fff');
    if (type === 'rental_completed') return Icon.check(17, '#fff');
    if (type === 'warning') return /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18
      }
    }, "\u26A0\uFE0F");
    if (type === 'dispute_resolved') return Icon.shield(16, '#fff');
    if (type === 'job_new_application') return Icon.briefcase(17, '#fff');
    if (type === 'job_accepted') return Icon.check(17, '#fff');
    if (type === 'job_rejected') return Icon.x(17, '#fff');
    if (type === 'quick_pool_new') return Icon.bolt(17, '#fff');
    if (type === 'quick_pool_application') return Icon.briefcase(17, '#fff');
    if (type === 'quick_pool_done') return Icon.check(17, '#fff');
    if (type === 'market') return Icon.briefcase(17, '#fff');
    if (type === 'verification_approved') return /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 16
      }
    }, "\u2705");
    if (type === 'chat') return Icon.msg(16, '#fff');
    return Icon.bolt(17, '#fff');
  };
  const colorFor = type => {
    if (type === 'rental_request') return '#0EBAC7';
    if (type === 'rental_approved') return '#22C55E';
    if (type === 'rental_declined' || type === 'rental_cancelled') return '#EF4444';
    if (type === 'rental_completed') return '#16A34A';
    if (type === 'warning') return '#F59E0B';
    if (type === 'dispute_resolved') return '#6366F1';
    if (type === 'job_new_application') return '#0077B6';
    if (type === 'job_accepted') return '#22C55E';
    if (type === 'job_rejected') return '#EF4444';
    if (type === 'quick_pool_new') return '#0EBAC7';
    if (type === 'quick_pool_application') return '#0077B6';
    if (type === 'quick_pool_done') return '#16A34A';
    if (type === 'market') return '#6366F1';
    if (type === 'verification_approved') return '#22C55E';
    if (type === 'chat') return '#38BDF8';
    return '#3B82F6';
  };
  const fmtTime = d => {
    const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (mins < 1) return lang === 'pt' ? 'agora' : lang === 'es' ? 'ahora' : 'now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return lang === 'pt' ? 'ontem' : lang === 'es' ? 'ayer' : 'yesterday';
    return `${days}d`;
  };
  const hasUnread = notifs && notifs.some(n => !n.read);
  return /*#__PURE__*/React.createElement(Sheet, {
    open: open,
    onClose: onClose,
    height: "72%"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 18px 30px',
      height: '100%',
      overflow: 'auto',
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 20,
      fontWeight: 700,
      letterSpacing: '-0.02em'
    }
  }, lang === 'pt' ? 'Notificações' : lang === 'es' ? 'Notificaciones' : 'Notifications'), hasUnread && /*#__PURE__*/React.createElement("button", {
    onClick: markAllNow,
    style: {
      border: 'none',
      background: 'transparent',
      color: 'var(--pg-blue-600)',
      fontSize: 13,
      fontWeight: 600,
      cursor: 'pointer'
    }
  }, lang === 'pt' ? 'Marcar tudo lido' : lang === 'es' ? 'Marcar todo leído' : 'Mark all read')), notifs === null && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '48px 0',
      textAlign: 'center',
      color: 'var(--pg-ink-400)',
      fontSize: 13
    }
  }, lang === 'pt' ? 'Carregando…' : lang === 'es' ? 'Cargando…' : 'Loading…'), notifs !== null && notifs.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '48px 0',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 40,
      marginBottom: 12
    }
  }, "\uD83D\uDD14"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: 'var(--pg-ink-700)',
      marginBottom: 6
    }
  }, lang === 'pt' ? 'Nenhuma notificação' : lang === 'es' ? 'Sin notificaciones' : 'No notifications yet'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--pg-ink-400)',
      lineHeight: 1.55,
      maxWidth: 260,
      margin: '0 auto'
    }
  }, lang === 'pt' ? 'Você será avisado sobre pedidos de aluguel, aprovações e advertências.' : lang === 'es' ? 'Te avisaremos sobre solicitudes de alquiler, aprobaciones y advertencias.' : 'You\'ll be notified about rental requests, approvals, and warnings.')), notifs !== null && notifs.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, notifs.map(n => {
    const navigable = isNavigable(n);
    return /*#__PURE__*/React.createElement("div", {
      key: n.id,
      style: {
        position: 'relative',
        borderRadius: 10,
        background: n.read ? 'transparent' : 'var(--pg-blue-50)',
        transition: 'background 0.12s'
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: navigable ? () => onNavigate(n.type, n.link_id) : undefined,
      style: {
        display: 'flex',
        gap: 12,
        padding: '12px 8px',
        paddingRight: 36,
        cursor: navigable ? 'pointer' : 'default'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 40,
        height: 40,
        borderRadius: '50%',
        flexShrink: 0,
        background: colorFor(n.type),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff'
      }
    }, iconFor(n.type)), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: '-0.01em',
        lineHeight: 1.3
      }
    }, renderTitle(n)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'var(--pg-ink-400)',
        whiteSpace: 'nowrap'
      }
    }, fmtTime(n.created_at)), !n.read && /*#__PURE__*/React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: 'var(--pg-blue-500)',
        flexShrink: 0
      }
    }))), n.body && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12.5,
        color: 'var(--pg-ink-600)',
        marginTop: 3,
        lineHeight: 1.45
      }
    }, renderBody(n)), navigable && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'var(--pg-blue-500)',
        fontWeight: 600,
        marginTop: 4
      }
    }, lang === 'pt' ? 'Toque para ver →' : lang === 'es' ? 'Toca para ver →' : 'Tap to view →'))), /*#__PURE__*/React.createElement("button", {
      onClick: e => {
        e.stopPropagation();
        deleteNotif(n.id);
      },
      style: {
        position: 'absolute',
        top: 8,
        right: 4,
        width: 26,
        height: 26,
        borderRadius: '50%',
        border: 'none',
        background: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: 'var(--pg-ink-300)',
        transition: 'color 0.15s, background 0.15s'
      },
      onMouseEnter: e => {
        e.currentTarget.style.background = 'var(--pg-ink-100)';
        e.currentTarget.style.color = 'var(--pg-ink-600)';
      },
      onMouseLeave: e => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = 'var(--pg-ink-300)';
      },
      "aria-label": "Apagar notifica\xE7\xE3o"
    }, Icon.x(13)));
  }), hasMore && /*#__PURE__*/React.createElement("button", {
    onClick: loadMore,
    style: {
      margin: '8px 0 4px',
      padding: '10px',
      borderRadius: 10,
      border: '1px solid var(--pg-ink-200)',
      background: 'transparent',
      color: 'var(--pg-blue-500)',
      fontWeight: 600,
      fontSize: 13,
      cursor: 'pointer',
      fontFamily: 'inherit',
      width: '100%'
    }
  }, lang === 'pt' ? 'Carregar mais notificações' : lang === 'es' ? 'Cargar más notificaciones' : 'Load more notifications'))));
}

// ── Paywall ───────────────────────────────────────────────────
function PaywallSheet({
  open,
  onClose,
  setUser,
  lang = 'en',
  context = null
}) {
  // Auto-select best plan based on context (quick pools / featured = premium)
  const [plan, setPlan] = React.useState('pro');
  React.useEffect(() => {
    if (!open) return;
    setPlan(context === 'quickpools' || context === 'featured' ? 'premium' : 'pro');
  }, [open, context]);
  const mo = lang === 'pt' ? '/mês' : lang === 'es' ? '/mes' : '/mo';
  const plans = {
    pro: {
      name: 'Pool Guy PRO',
      tagline: lang === 'pt' ? 'Expanda seu negócio e alcance mais clientes' : lang === 'es' ? 'Expande tu negocio y llega a más clientes' : 'Grow your business and reach more clients',
      price: '14.99',
      badge: null,
      gradient: 'linear-gradient(135deg,#0c4a6e,#0077B6)',
      accent: '#0EBAC7',
      url: 'https://poolguyx.com/upgrade/pro'
    },
    premium: {
      name: 'Pool Guy PREMIUM',
      tagline: lang === 'pt' ? 'Receba jobs instantaneamente e nunca perca uma oportunidade' : lang === 'es' ? 'Recibe trabajos al instante y nunca pierdas una oportunidad' : 'Get jobs instantly near you and never miss an opportunity again',
      price: '24.99',
      badge: lang === 'pt' ? 'MELHOR VALOR' : lang === 'es' ? 'MEJOR VALOR' : 'BEST VALUE',
      gradient: 'linear-gradient(135deg,#3b0764,#7c3aed)',
      accent: '#a78bfa',
      url: 'https://poolguyx.com/upgrade/premium'
    }
  };
  const ROWS = [{
    label: lang === 'pt' ? 'Anúncios simultâneos' : lang === 'es' ? 'Anuncios simultáneos' : 'Simultaneous listings',
    free: '2',
    pro: '5',
    premium: '10',
    type: 'count'
  }, {
    label: lang === 'pt' ? 'Aplicar a vagas' : lang === 'es' ? 'Postularte a empleos' : 'Apply to jobs',
    free: true,
    pro: true,
    premium: true
  }, {
    label: lang === 'pt' ? 'Publicar vagas (contratar)' : lang === 'es' ? 'Publicar empleos (contratar)' : 'Post job listings (hire)',
    free: true,
    pro: true,
    premium: true
  }, {
    label: lang === 'pt' ? 'Marketplace completo' : lang === 'es' ? 'Marketplace completo' : 'Full marketplace access',
    free: true,
    pro: true,
    premium: true
  }, {
    label: lang === 'pt' ? 'Ver anúncios de rotas/piscinas' : lang === 'es' ? 'Ver anuncios de rutas/piscinas' : 'See routes & pools listings',
    free: false,
    pro: true,
    premium: true
  }, {
    label: lang === 'pt' ? 'Rotas de férias (ver + publicar)' : lang === 'es' ? 'Rutas de vacaciones (ver + publicar)' : 'Vacation routes — full access',
    free: false,
    pro: true,
    premium: true
  }, {
    label: lang === 'pt' ? 'Piscinas Rápidas (Quick Pools)' : lang === 'es' ? 'Piscinas Rápidas (Quick Pools)' : 'Quick Pools — instant jobs',
    free: false,
    pro: false,
    premium: true
  }, {
    label: lang === 'pt' ? '2 anúncios em destaque/mês' : lang === 'es' ? '2 anuncios destacados/mes' : '2 featured listings/month',
    free: false,
    pro: false,
    premium: true
  }, {
    label: lang === 'pt' ? 'Badge verificado Premium' : lang === 'es' ? 'Badge verificado Premium' : 'Premium verified badge',
    free: false,
    pro: false,
    premium: true
  }];
  const p = plans[plan];
  const handleSubscribe = () => {
    // Open external Stripe checkout — no Apple cut
    window.open(p.url, '_blank', 'noopener');
    // NOTE: In production, remove the line below. Tier is set server-side via webhook.
    // Kept here for demo/testing purposes only.
    setUser(u => ({
      ...u,
      tier: plan
    }));
    onClose();
  };
  return /*#__PURE__*/React.createElement(Sheet, {
    open: open,
    onClose: onClose,
    height: "92%"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '6px 16px 0',
      display: 'flex',
      justifyContent: 'flex-end',
      flexShrink: 0
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
      flex: 1,
      overflow: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 20px 16px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 56,
      height: 56,
      borderRadius: 16,
      marginBottom: 12,
      background: p.gradient
    }
  }, Icon.crown(24, '#fff')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '.1em',
      color: 'var(--pg-ink-400)',
      marginBottom: 6
    }
  }, lang === 'pt' ? 'DESBLOQUEIE MAIS' : lang === 'es' ? 'DESBLOQUEA MÁS' : 'UNLOCK MORE'), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 22,
      fontWeight: 800,
      letterSpacing: '-0.025em',
      lineHeight: 1.15
    }
  }, p.name), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '6px 8px 0',
      fontSize: 13,
      color: 'var(--pg-ink-500)',
      lineHeight: 1.5
    }
  }, p.tagline)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px 14px',
      display: 'flex',
      gap: 8
    }
  }, ['pro', 'premium'].map(id => {
    const pl = plans[id];
    const active = plan === id;
    return /*#__PURE__*/React.createElement("button", {
      key: id,
      onClick: () => setPlan(id),
      style: {
        flex: 1,
        padding: '12px 10px',
        borderRadius: 14,
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
        textAlign: 'left',
        position: 'relative',
        background: active ? pl.gradient : 'var(--pg-ink-100)',
        color: active ? '#fff' : 'var(--pg-ink-600)',
        transition: 'all .18s',
        boxShadow: active ? '0 6px 18px rgba(0,0,0,0.22)' : 'none'
      }
    }, pl.badge && /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: -8,
        right: 8,
        fontSize: 9,
        fontWeight: 800,
        padding: '2px 7px',
        borderRadius: 999,
        background: '#fbbf24',
        color: '#1c1917',
        letterSpacing: '.06em',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
      }
    }, pl.badge), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '.07em',
        opacity: .8,
        marginBottom: 4
      }
    }, pl.name.toUpperCase()), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'baseline',
        gap: 2
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 22,
        fontWeight: 800,
        letterSpacing: '-0.03em'
      }
    }, "$", pl.price), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        opacity: .7
      }
    }, mo)));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 52px 52px 52px',
      gap: 4,
      padding: '6px 0 8px',
      borderBottom: '1.5px solid var(--pg-ink-200)'
    }
  }, /*#__PURE__*/React.createElement("div", null), ['free', 'pro', 'premium'].map(col => /*#__PURE__*/React.createElement("div", {
    key: col,
    style: {
      textAlign: 'center',
      fontSize: 9,
      fontWeight: 800,
      letterSpacing: '.07em',
      color: col === 'free' ? 'var(--pg-ink-400)' : col === 'pro' ? '#0077B6' : '#7c3aed'
    }
  }, col === 'free' ? 'FREE' : col === 'pro' ? 'PRO' : 'PREM'))), ROWS.map((row, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 52px 52px 52px',
      gap: 4,
      padding: '9px 0',
      borderBottom: '0.5px solid var(--pg-ink-100)',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: 'var(--pg-ink-700)',
      lineHeight: 1.35,
      paddingRight: 6
    }
  }, row.label), ['free', 'pro', 'premium'].map(col => {
    const val = row[col];
    const isActive = col === plan;
    return /*#__PURE__*/React.createElement("div", {
      key: col,
      style: {
        textAlign: 'center',
        background: isActive ? col === 'pro' ? 'rgba(0,119,182,0.08)' : 'rgba(124,58,237,0.08)' : 'transparent',
        borderRadius: 8,
        padding: '3px 0'
      }
    }, row.type === 'count' ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: col === 'free' ? 'var(--pg-ink-400)' : col === 'pro' ? '#0077B6' : '#7c3aed'
      }
    }, val) : val ? /*#__PURE__*/React.createElement("svg", {
      width: "16",
      height: "16",
      viewBox: "0 0 20 20",
      fill: "none"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "10",
      cy: "10",
      r: "10",
      fill: col === 'free' ? '#e2e8f0' : col === 'pro' ? '#0077B6' : '#7c3aed'
    }), /*#__PURE__*/React.createElement("path", {
      d: "M6 10l3 3 5-5",
      stroke: "#fff",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    })) : /*#__PURE__*/React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 14 14",
      fill: "none"
    }, /*#__PURE__*/React.createElement("line", {
      x1: "3",
      y1: "7",
      x2: "11",
      y2: "7",
      stroke: "var(--pg-ink-300)",
      strokeWidth: "1.8",
      strokeLinecap: "round"
    })));
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 16px calc(14px + env(safe-area-inset-bottom, 0px))',
      borderTop: '0.5px solid var(--pg-ink-200)',
      background: 'var(--pg-white)',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: handleSubscribe,
    style: {
      width: '100%',
      height: 52,
      borderRadius: 14,
      border: 'none',
      background: p.gradient,
      color: '#fff',
      fontWeight: 800,
      fontSize: 16,
      cursor: 'pointer',
      fontFamily: 'inherit',
      letterSpacing: '-0.01em',
      boxShadow: `0 6px 20px rgba(0,0,0,0.28)`
    }
  }, lang === 'pt' ? `Assinar ${p.name} — $${p.price}${mo}` : lang === 'es' ? `Suscribirse a ${p.name} — $${p.price}${mo}` : `Subscribe to ${p.name} — $${p.price}${mo}`), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      justifyContent: 'center',
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--pg-ink-400)",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "11",
    width: "18",
    height: "11",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 11V7a5 5 0 0 1 10 0v4"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--pg-ink-400)',
      textAlign: 'center',
      lineHeight: 1.4
    }
  }, lang === 'pt' ? 'Pagamento seguro via site. Cancele quando quiser.' : lang === 'es' ? 'Pago seguro por el sitio web. Cancela cuando quieras.' : 'Secure payment via website. Cancel anytime.')))));
}

// ── Post Menu ─────────────────────────────────────────────────
function PostMenuSheet({
  open,
  onClose,
  onPickQuickPool,
  lang = 'en'
}) {
  const t = STRINGS[lang];
  const items = [{
    ic: Icon.bolt,
    title: t.pmQuickPool,
    sub: t.pmQuickPoolSub,
    kind: 'aqua',
    onClick: onPickQuickPool
  }, {
    ic: Icon.cart,
    title: t.pmSellEq,
    sub: t.pmSellEqSub,
    kind: 'blue'
  }, {
    ic: Icon.cart,
    title: t.pmRentEq,
    sub: t.pmRentEqSub,
    kind: 'blue'
  }, {
    ic: Icon.pin,
    title: t.pmSellRoute,
    sub: t.pmSellRouteSub,
    kind: 'blue'
  }, {
    ic: Icon.cal,
    title: t.pmVacCover,
    sub: t.pmVacCoverSub,
    kind: 'blue'
  }, {
    ic: Icon.briefcase,
    title: t.pmHireTech,
    sub: t.pmHireTechSub,
    kind: 'blue'
  }];
  return /*#__PURE__*/React.createElement(Sheet, {
    open: open,
    onClose: onClose,
    height: "auto"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 18px 30px'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '4px 0 14px',
      fontSize: 18,
      fontWeight: 700,
      letterSpacing: '-0.01em',
      textAlign: 'center'
    }
  }, t.whatPost), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, items.map((it, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    onClick: () => {
      onClose();
      it.onClick && it.onClick();
    },
    className: "pg-press",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '12px 14px',
      border: 'none',
      cursor: 'pointer',
      background: 'var(--pg-white)',
      borderRadius: 14,
      boxShadow: 'var(--pg-shadow-1)',
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 42,
      height: 42,
      borderRadius: 11,
      background: it.kind === 'aqua' ? 'var(--pg-aqua-100)' : 'var(--pg-blue-100)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, it.ic(20, it.kind === 'aqua' ? 'var(--pg-aqua-700)' : 'var(--pg-blue-700)')), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 600,
      letterSpacing: '-0.01em'
    }
  }, it.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--pg-ink-500)',
      marginTop: 1
    }
  }, it.sub)), Icon.chev(16, 'var(--pg-ink-400)'))))));
}

// ── Toast ─────────────────────────────────────────────────────
function Toast({
  message,
  kind = 'success',
  onClick
}) {
  if (!message) return null;
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    style: {
      position: 'absolute',
      left: 18,
      right: 18,
      bottom: 108,
      zIndex: 200,
      padding: '12px 14px',
      borderRadius: 14,
      background: kind === 'success' ? 'var(--pg-aqua-700)' : 'var(--pg-ink-900)',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      animation: 'pg-sheet-up 0.28s cubic-bezier(.22,1,.36,1)',
      cursor: onClick ? 'pointer' : 'default'
    }
  }, kind === 'success' && Icon.check(18, '#fff'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      lineHeight: 1.4,
      flex: 1
    }
  }, message), onClick && /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#fff",
    strokeWidth: "2.5",
    strokeLinecap: "round",
    style: {
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "9 18 15 12 9 6"
  })));
}

// ── Wallet Sheet ──────────────────────────────────────────────
function WalletSheet({
  open,
  onClose,
  lang = 'en'
}) {
  const [tab, setTab] = React.useState('pending');
  const d = WALLET_DATA;
  const walletLbl = lang === 'pt' ? 'Carteira' : lang === 'es' ? 'Cartera' : 'Wallet';
  const weekLbl = lang === 'pt' ? 'Esta semana' : lang === 'es' ? 'Esta semana' : 'This week';
  const monthLbl = lang === 'pt' ? 'Este mês' : lang === 'es' ? 'Este mes' : 'This month';
  const pendingLbl = lang === 'pt' ? 'A receber' : lang === 'es' ? 'Por cobrar' : 'Pending';
  const historyLbl = lang === 'pt' ? 'Histórico' : lang === 'es' ? 'Historial' : 'History';
  const withdrawLbl = lang === 'pt' ? 'Sacar fundos' : lang === 'es' ? 'Retirar fondos' : 'Withdraw funds';
  const balanceLbl = lang === 'pt' ? 'Saldo disponível' : lang === 'es' ? 'Saldo disponible' : 'Available balance';
  const minLbl = lang === 'pt' ? 'Mín. $50 para sacar' : lang === 'es' ? 'Mín. $50 para retirar' : 'Min. $50 to withdraw';
  const awaitLbl = lang === 'pt' ? 'Aguardando liberação' : lang === 'es' ? 'Esperando liberación' : 'Awaiting release';
  const dayKeys = lang === 'pt' ? ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'] : lang === 'es' ? ['D', 'L', 'M', 'X', 'J', 'V', 'S'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const dayAmts = [0, 55, 45, 110, 0, 85, 45];
  const maxAmt = Math.max(...dayAmts);
  const ArrowUp = (s = 16, c = 'currentColor') => /*#__PURE__*/React.createElement("svg", {
    width: s,
    height: s,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: c,
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 19V5M5 12l7-7 7 7"
  }));
  const ArrowDown = (s = 16, c = 'currentColor') => /*#__PURE__*/React.createElement("svg", {
    width: s,
    height: s,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: c,
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 5v14M5 12l7 7 7-7"
  }));
  return /*#__PURE__*/React.createElement(Sheet, {
    open: open,
    onClose: onClose,
    height: "90%"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 18px 14px',
      borderBottom: '0.5px solid var(--pg-ink-200)',
      flexShrink: 0,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 20,
      fontWeight: 700,
      letterSpacing: '-0.02em'
    }
  }, walletLbl), /*#__PURE__*/React.createElement("button", {
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
      flex: 1,
      overflow: 'auto',
      padding: '16px 18px 30px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 18,
      padding: '20px',
      background: 'linear-gradient(135deg, var(--pg-blue-900) 0%, oklch(0.38 0.16 245) 100%)',
      color: '#fff',
      marginBottom: 16,
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      right: -30,
      top: -30,
      width: 120,
      height: 120,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.05)',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      opacity: 0.6,
      letterSpacing: '0.09em',
      fontWeight: 700,
      marginBottom: 6
    }
  }, balanceLbl.toUpperCase()), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--pg-font-display)',
      fontSize: 46,
      fontWeight: 700,
      letterSpacing: '-0.04em',
      lineHeight: 1
    }
  }, "$", d.balance), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      display: 'flex',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      opacity: 0.6,
      fontWeight: 700,
      letterSpacing: '0.07em',
      marginBottom: 3
    }
  }, weekLbl.toUpperCase()), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 700
    }
  }, "$", d.weekEarnings)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      opacity: 0.6,
      fontWeight: 700,
      letterSpacing: '0.07em',
      marginBottom: 3
    }
  }, monthLbl.toUpperCase()), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 700
    }
  }, "$", d.monthEarnings))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      display: 'flex',
      alignItems: 'flex-end',
      gap: 4,
      height: 34
    }
  }, dayAmts.map((amt, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 3
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      borderRadius: 3,
      height: maxAmt ? Math.max(3, Math.round(amt / maxAmt * 22)) : 3,
      background: amt > 0 ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.18)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 8,
      opacity: 0.5,
      fontWeight: 600
    }
  }, dayKeys[i]))))), /*#__PURE__*/React.createElement("button", {
    className: "pg-btn pg-btn-aqua",
    style: {
      width: '100%',
      height: 50,
      fontSize: 15,
      borderRadius: 14,
      marginBottom: 6
    }
  }, ArrowUp(16, 'var(--pg-blue-900)'), " ", withdrawLbl), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--pg-ink-500)',
      textAlign: 'center',
      marginBottom: 20
    }
  }, minLbl), /*#__PURE__*/React.createElement("div", {
    className: "pg-seg",
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: `pg-seg-btn ${tab === 'pending' ? 'on' : ''}`,
    onClick: () => setTab('pending')
  }, pendingLbl, " (", d.pending.length, ")"), /*#__PURE__*/React.createElement("button", {
    className: `pg-seg-btn ${tab === 'history' ? 'on' : ''}`,
    onClick: () => setTab('history')
  }, historyLbl)), tab === 'pending' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, d.pending.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.id,
    className: "pg-card",
    style: {
      padding: '13px 14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      letterSpacing: '-0.005em'
    }
  }, tr(p.title, lang)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: 'var(--pg-ink-500)',
      marginTop: 3
    }
  }, p.client, " \xB7 ", tr(p.date, lang))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--pg-font-display)',
      fontSize: 20,
      fontWeight: 700,
      color: 'var(--pg-aqua-700)',
      letterSpacing: '-0.02em'
    }
  }, "$", p.amount)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 9,
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 7,
      height: 7,
      borderRadius: '50%',
      background: 'oklch(0.72 0.18 80)',
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'oklch(0.55 0.18 80)',
      fontWeight: 600
    }
  }, awaitLbl))))), tab === 'history' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 1
    }
  }, d.history.map(h => /*#__PURE__*/React.createElement("div", {
    key: h.id,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 2px',
      borderBottom: '0.5px solid var(--pg-ink-100)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 38,
      borderRadius: 11,
      flexShrink: 0,
      background: h.type === 'credit' ? 'var(--pg-aqua-100)' : 'oklch(0.95 0.04 20)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, h.type === 'credit' ? ArrowUp(16, 'var(--pg-aqua-700)') : ArrowDown(16, 'oklch(0.45 0.18 20)')), /*#__PURE__*/React.createElement("div", {
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
      whiteSpace: 'nowrap'
    }
  }, tr(h.title, lang)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--pg-ink-500)',
      marginTop: 1
    }
  }, tr(h.date, lang))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--pg-font-display)',
      fontSize: 15,
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: h.type === 'credit' ? 'var(--pg-aqua-700)' : 'oklch(0.45 0.18 20)'
    }
  }, h.type === 'credit' ? '+' : '-', "$", h.amount)))))));
}

// ── Work Lifecycle Sheet ──────────────────────────────────────
function WorkLifecycleSheet({
  open,
  onClose,
  app,
  lang = 'en',
  onReview
}) {
  const stageOf = s => ({
    paid: 3,
    completed: 2,
    in_progress: 1
  })[s] ?? 0;
  const [stage, setStage] = React.useState(0);
  const [photo, setPhoto] = React.useState(null);
  const [advancing, setAdvancing] = React.useState(false);
  React.useEffect(() => {
    if (open && app) {
      setStage(stageOf(app.status));
      setPhoto(null);
      setAdvancing(false);
    }
  }, [open, app]);
  if (!app) return null;
  const stageNames = {
    en: ['Hired', 'In Progress', 'Completed', 'Paid'],
    pt: ['Contratado', 'Em Andamento', 'Concluído', 'Pago'],
    es: ['Contratado', 'En Progreso', 'Completado', 'Pagado']
  };
  const sn = stageNames[lang] || stageNames.en;
  const startLbl = lang === 'pt' ? 'Iniciar trabalho' : lang === 'es' ? 'Iniciar trabajo' : 'Start job';
  const photoLbl = lang === 'pt' ? 'Tirar foto de conclusão' : lang === 'es' ? 'Tomar foto final' : 'Take completion photo';
  const markDoneLbl = lang === 'pt' ? 'Marcar como concluído' : lang === 'es' ? 'Marcar completado' : 'Mark as complete';
  const awaitPayLbl = lang === 'pt' ? 'Aguardando liberação do pagamento…' : lang === 'es' ? 'Esperando liberación del pago…' : 'Awaiting payment release…';
  const paidLbl = lang === 'pt' ? 'Pagamento recebido!' : lang === 'es' ? '¡Pago recibido!' : 'Payment received!';
  const reviewLbl = lang === 'pt' ? 'Avaliar o contratante' : lang === 'es' ? 'Calificar al contratante' : 'Rate the client';
  const detailLbl = lang === 'pt' ? 'Detalhes do trabalho' : lang === 'es' ? 'Detalle del trabajo' : 'Job details';
  const simLbl = lang === 'pt' ? 'Toque para simular foto' : lang === 'es' ? 'Toca para simular foto' : 'Tap to simulate photo';
  const closeLbl = lang === 'pt' ? 'Fechar' : lang === 'es' ? 'Cerrar' : 'Close';
  const CameraIcon = (s = 20, c = 'currentColor') => /*#__PURE__*/React.createElement("svg", {
    width: s,
    height: s,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: c,
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "13",
    r: "3"
  }));
  const DollarIcon = (s = 20, c = 'currentColor') => /*#__PURE__*/React.createElement("svg", {
    width: s,
    height: s,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: c,
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
  }));
  const handleStart = () => setStage(1);
  const handleTakePhoto = () => {
    const lock = Date.now() % 9 + 1;
    setPhoto(`https://loremflickr.com/400/280/swimming,pool,service?lock=${lock}`);
  };
  const handleMarkDone = () => {
    setAdvancing(true);
    setTimeout(() => setStage(2), 400);
    setTimeout(() => {
      setStage(3);
      setAdvancing(false);
    }, 2000);
  };
  const amtStr = app.price ? `$${app.price}` : lang === 'pt' ? 'Negociável' : lang === 'es' ? 'Negociable' : 'Negotiable';

  // stepper visual
  const stepIcons = [Icon.check, Icon.bolt, CameraIcon, DollarIcon];
  const stepBg = i => {
    if (stage > i) return 'var(--pg-aqua-500)';
    if (stage === i) return 'var(--pg-blue-500)';
    return 'var(--pg-ink-100)';
  };
  const stepIconColor = i => stage >= i ? '#fff' : 'var(--pg-ink-400)';
  const connBg = i => stage > i ? 'var(--pg-aqua-400)' : 'var(--pg-ink-200)';
  return /*#__PURE__*/React.createElement(Sheet, {
    open: open,
    onClose: onClose,
    height: "88%"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      overflow: 'auto',
      height: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 18px 30px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 18,
      fontWeight: 700,
      letterSpacing: '-0.01em'
    }
  }, detailLbl), /*#__PURE__*/React.createElement("button", {
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
    className: "pg-card",
    style: {
      padding: '12px 14px',
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: app.poster,
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
      letterSpacing: '-0.01em',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, tr(app.title, lang)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--pg-ink-500)',
      marginTop: 2,
      display: 'flex',
      alignItems: 'center',
      gap: 5
    }
  }, Icon.pin(11, 'var(--pg-ink-400)'), " ", app.loc, " \xB7 ", app.poster)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--pg-font-display)',
      fontSize: 20,
      fontWeight: 700,
      color: 'var(--pg-blue-500)',
      letterSpacing: '-0.02em',
      flexShrink: 0
    }
  }, amtStr))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      marginBottom: 26
    }
  }, [0, 1, 2, 3].map(i => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 5,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 38,
      borderRadius: '50%',
      background: stepBg(i),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: stage === i ? '0 0 0 4px var(--pg-blue-100)' : 'none',
      transition: 'all .3s ease',
      flexShrink: 0
    }
  }, stepIcons[i](16, stepIconColor(i))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: '0.01em',
      textAlign: 'center',
      width: 60,
      color: stage >= i ? 'var(--pg-ink-900)' : 'var(--pg-ink-400)',
      lineHeight: 1.2
    }
  }, sn[i])), i < 3 && /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 2,
      borderRadius: 2,
      background: connBg(i),
      margin: '19px 3px 0',
      transition: 'background .5s ease'
    }
  })))), stage === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "pg-card",
    style: {
      padding: '14px 16px',
      background: 'var(--pg-aqua-50)',
      border: '0.5px solid var(--pg-aqua-300)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      borderRadius: 10,
      background: 'var(--pg-aqua-500)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, Icon.check(18, '#fff')), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: 'var(--pg-aqua-700)'
    }
  }, lang === 'pt' ? 'Você foi contratado!' : lang === 'es' ? '¡Fuiste contratado!' : 'You\'re hired!'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: 'var(--pg-aqua-600)',
      marginTop: 4,
      lineHeight: 1.45
    }
  }, lang === 'pt' ? 'Confirme o início quando chegar no local. O pagamento será liberado após a conclusão.' : lang === 'es' ? 'Confirma el inicio al llegar al lugar. El pago se liberará al completar.' : 'Confirm start when you arrive on-site. Payment will be released upon completion.')))), /*#__PURE__*/React.createElement("button", {
    onClick: handleStart,
    className: "pg-btn pg-btn-primary",
    style: {
      width: '100%',
      height: 52,
      fontSize: 16
    }
  }, Icon.bolt(18, '#fff'), " ", startLbl)), stage === 1 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "pg-card",
    style: {
      padding: '13px 16px',
      background: 'var(--pg-blue-50)',
      border: '0.5px solid var(--pg-blue-200)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'center'
    }
  }, Icon.bolt(18, 'var(--pg-blue-600)'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--pg-blue-700)',
      fontWeight: 600
    }
  }, lang === 'pt' ? 'Tire uma foto ao concluir todos os serviços.' : lang === 'es' ? 'Toma una foto al finalizar los servicios.' : 'Take a photo when all services are complete.'))), /*#__PURE__*/React.createElement("div", {
    onClick: handleTakePhoto,
    style: {
      borderRadius: 14,
      overflow: 'hidden',
      border: photo ? 'none' : '2px dashed var(--pg-ink-300)',
      background: 'var(--pg-ink-50)',
      minHeight: 160,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer'
    }
  }, photo ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: photo,
    alt: "proof",
    style: {
      width: '100%',
      height: 170,
      objectFit: 'cover',
      display: 'block'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 10,
      right: 10,
      background: 'var(--pg-aqua-500)',
      borderRadius: 20,
      padding: '4px 10px',
      display: 'flex',
      alignItems: 'center',
      gap: 5
    }
  }, Icon.check(12, '#fff'), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: '#fff',
      fontWeight: 700
    }
  }, lang === 'pt' ? 'Foto salva' : lang === 'es' ? 'Foto guardada' : 'Photo saved'))) : /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 24,
      textAlign: 'center'
    }
  }, CameraIcon(34, 'var(--pg-ink-400)'), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      fontSize: 13.5,
      color: 'var(--pg-ink-600)',
      fontWeight: 600
    }
  }, photoLbl), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: 'var(--pg-ink-400)',
      marginTop: 5
    }
  }, simLbl))), /*#__PURE__*/React.createElement("button", {
    onClick: handleMarkDone,
    disabled: !photo || advancing,
    className: "pg-btn pg-btn-primary",
    style: {
      width: '100%',
      height: 52,
      fontSize: 16,
      opacity: photo && !advancing ? 1 : 0.5
    }
  }, advancing ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 16,
      height: 16,
      border: '2px solid rgba(255,255,255,0.4)',
      borderTopColor: '#fff',
      borderRadius: '50%',
      animation: 'pg-spin .7s linear infinite',
      display: 'inline-block'
    }
  }), lang === 'pt' ? 'Processando…' : lang === 'es' ? 'Procesando…' : 'Processing…') : /*#__PURE__*/React.createElement(React.Fragment, null, CameraIcon(18, '#fff'), " ", markDoneLbl))), stage === 2 && /*#__PURE__*/React.createElement("div", {
    className: "pg-card",
    style: {
      padding: '18px 16px',
      background: 'oklch(0.97 0.04 80)',
      border: '0.5px solid oklch(0.88 0.10 80)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 44,
      height: 44,
      borderRadius: '50%',
      flexShrink: 0,
      background: 'oklch(0.88 0.15 80)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'pg-spin 2s linear infinite'
    }
  }, DollarIcon(22, 'oklch(0.45 0.18 80)')), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: 'oklch(0.45 0.18 80)'
    }
  }, awaitPayLbl), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: 'oklch(0.55 0.18 80)',
      marginTop: 4,
      lineHeight: 1.45
    }
  }, lang === 'pt' ? 'O cliente está liberando o pagamento em escrow. Isso leva alguns segundos.' : lang === 'es' ? 'El cliente está liberando el pago en escrow. Tarda unos segundos.' : 'The client is releasing the escrowed payment. This takes a few seconds.')))), stage === 3 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '12px 0 4px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 80,
      height: 80,
      borderRadius: '50%',
      background: 'var(--pg-aqua-100)',
      margin: '0 auto 14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, DollarIcon(36, 'var(--pg-aqua-700)')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--pg-font-display)',
      fontSize: 22,
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: 'var(--pg-aqua-700)'
    }
  }, paidLbl), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--pg-font-display)',
      fontSize: 36,
      fontWeight: 700,
      letterSpacing: '-0.04em',
      color: 'var(--pg-aqua-500)',
      marginTop: 6,
      lineHeight: 1
    }
  }, amtStr), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--pg-ink-500)',
      marginTop: 10,
      lineHeight: 1.5
    }
  }, lang === 'pt' ? 'Valor adicionado à sua carteira PoolGuyPro.' : lang === 'es' ? 'Importe añadido a tu cartera PoolGuyPro.' : 'Amount added to your PoolGuyPro wallet.')), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      onClose();
      if (onReview) onReview(app);
    },
    className: "pg-btn pg-btn-primary",
    style: {
      width: '100%',
      height: 52,
      fontSize: 16
    }
  }, Icon.star(18, '#fff', true), " ", reviewLbl), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      width: '100%',
      padding: '12px',
      border: 'none',
      background: 'transparent',
      color: 'var(--pg-ink-500)',
      fontSize: 14,
      cursor: 'pointer',
      fontFamily: 'inherit'
    }
  }, closeLbl)))));
}

// ── Review Sheet ──────────────────────────────────────────────
function ReviewSheet({
  open,
  onClose,
  app,
  lang = 'en',
  onSubmitDone
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
  const titleLbl = lang === 'pt' ? 'Avaliar o contratante' : lang === 'es' ? 'Calificar al contratante' : 'Rate the client';
  const reviewPh = lang === 'pt' ? 'Compartilhe sua experiência com este trabalho…' : lang === 'es' ? 'Comparte tu experiencia con este trabajo…' : 'Share your experience with this job…';
  const submitLbl = lang === 'pt' ? 'Enviar avaliação' : lang === 'es' ? 'Enviar reseña' : 'Submit review';
  const sentLbl = lang === 'pt' ? 'Avaliação enviada!' : lang === 'es' ? '¡Reseña enviada!' : 'Review submitted!';
  const sentSubLbl = lang === 'pt' ? 'Obrigado! Sua avaliação ajuda a comunidade de pool guys.' : lang === 'es' ? '¡Gracias! Tu reseña ayuda a la comunidad.' : 'Thanks! Your review helps the pool guy community.';
  const skipLbl = lang === 'pt' ? 'Pular por agora' : lang === 'es' ? 'Omitir por ahora' : 'Skip for now';
  const starLabels = {
    en: ['Terrible', 'Bad', 'OK', 'Good', 'Excellent'],
    pt: ['Péssimo', 'Ruim', 'Ok', 'Bom', 'Excelente'],
    es: ['Pésimo', 'Malo', 'Ok', 'Bueno', 'Excelente']
  };
  const sLabels = starLabels[lang] || starLabels.en;
  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      if (onSubmitDone) onSubmitDone();
      onClose();
    }, 1800);
  };
  const displayed = hover || rating;
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
      lineHeight: 1.5
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
  }, Icon.x(16, 'var(--pg-ink-700)'))), app && /*#__PURE__*/React.createElement("div", {
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
    name: app.poster,
    size: 34
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700
    }
  }, app.poster), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--pg-ink-500)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, tr(app.title, lang)))), /*#__PURE__*/React.createElement("div", {
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

// ── Apply to Job Sheet ────────────────────────────────────────
function ApplyJobSheet({
  open,
  onClose,
  job,
  user,
  lang = 'en',
  onSubmit,
  onEditProfile
}) {
  const [note, setNote] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [insertError, setInsertError] = React.useState(null);
  React.useEffect(() => {
    if (open) {
      setNote('');
      setSubmitted(false);
      setSaving(false);
      setInsertError(null);
    }
  }, [open]);
  if (!job) return null;
  const s = (en, pt, es) => lang === 'pt' ? pt : lang === 'es' ? es : en;

  // Normalize: live jobs use job.author; static jobs use job.company
  const jobCompany = job.company || job.author || job.role || '?';
  const jobRole = job.role || job.company || '';
  const jobType = job.type || job.contract || '';
  const handleSubmit = async () => {
    setSaving(true);
    setInsertError(null);
    const uid = user?.uid || user?.id || null;
    if (!window.sb || !uid) {
      console.warn('[ApplyJob] skipped — no uid or sb:', {
        uid,
        hasSb: !!window.sb
      });
      setSaving(false);
      const errMsg = lang === 'pt' ? 'Faça login para se candidatar.' : lang === 'es' ? 'Inicia sesión para postularte.' : 'Please log in to apply.';
      setInsertError(errMsg);
      return;
    }
    // Block duplicate / rejected re-application
    const jobId = job._id || job.id || null;
    const {
      data: existing
    } = await window.sb.from('job_applications').select('id, status').eq('job_id', jobId).eq('applicant_id', uid);
    if (existing && existing.length > 0) {
      setSaving(false);
      const st = existing[0].status;
      const errMsg = st === 'rejected' ? lang === 'pt' ? 'Você foi recusado para esta vaga e não pode se candidatar novamente.' : lang === 'es' ? 'Fuiste rechazado para esta oferta y no puedes volver a postularte.' : 'You were rejected for this position and cannot reapply.' : lang === 'pt' ? 'Você já enviou uma candidatura para esta vaga.' : lang === 'es' ? 'Ya te postulaste a esta oferta.' : 'You already applied to this position.';
      setInsertError(errMsg);
      return;
    }
    // Snapshot of candidate profile — saved so employer can see full resume
    const profileSnapshot = {
      age: user.age || null,
      region: user.region || '',
      hasCar: !!user.hasCar,
      hasLicense: !!user.hasLicense,
      equipment: user.equipment || null,
      experience: user.experience || [],
      photoUrl: user.photoUrl || null
    };
    const {
      error
    } = await window.sb.from('job_applications').insert({
      job_id: jobId,
      job_company: jobCompany,
      job_role: jobRole,
      job_loc: job.loc || job.region || '',
      job_author_id: job.author_id || null,
      applicant_id: uid,
      applicant_name: user.name || '',
      applicant_rating: user.rating || null,
      applicant_jobs: user.reviews || 0,
      note: note.trim() || null,
      status: 'pending',
      profile_snapshot: profileSnapshot
    });
    setSaving(false);
    if (error) {
      console.error('[ApplyJob] insert error:', error.code, error.message);
      const errMsg = lang === 'pt' ? 'Erro ao enviar candidatura. Tente novamente.' : lang === 'es' ? 'Error al enviar postulación. Inténtalo de nuevo.' : 'Failed to submit application. Please try again.';
      setInsertError(errMsg);
      return;
    }
    // Notify the job owner (in-app + push)
    const ownerId = job.author_id || job.job_author_id || null;
    if (ownerId && ownerId !== uid && window.sb) {
      window.sb.from('notifications').insert({
        user_id: ownerId,
        type: 'job_new_application',
        title: JSON.stringify({
          en: 'New application received',
          pt: 'Nova candidatura recebida',
          es: 'Nueva postulação recebida'
        }),
        body: JSON.stringify({
          en: `${user.name || 'Someone'} applied for "${jobRole || jobCompany}".`,
          pt: `${user.name || 'Alguém'} se candidatou para "${jobRole || jobCompany}".`,
          es: `${user.name || 'Alguien'} se postuló para "${jobRole || jobCompany}".`
        }),
        link_id: jobId,
        read: false
      });
      window.sendPush && window.sendPush(ownerId, lang === 'pt' ? '📬 Nova candidatura' : lang === 'es' ? '📬 Nueva postulación' : '📬 New application', lang === 'pt' ? `${user.name || 'Alguém'} se candidatou para "${jobRole || jobCompany}".` : lang === 'es' ? `${user.name || 'Alguien'} se postuló para "${jobRole || jobCompany}".` : `${user.name || 'Someone'} applied for "${jobRole || jobCompany}".`, '/#work', 'work');
    }
    setSubmitted(true);
    setTimeout(() => onSubmit && onSubmit(), 2000);
  };

  // ── Icon helpers ──
  const CarIcon = (c = 'var(--pg-ink-500)') => /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: c,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h1l3-4h9l3 4h1a2 2 0 012 2v6a2 2 0 01-2 2h-2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7.5",
    cy: "17.5",
    r: "1.5"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "16.5",
    cy: "17.5",
    r: "1.5"
  }));
  const LicenseIcon = (c = 'var(--pg-ink-500)') => /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: c,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: "6",
    width: "20",
    height: "13",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 10h4M7 14h6M15 10h2v4h-2z"
  }));
  const ToolIcon = (c = 'var(--pg-ink-500)') => /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: c,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M14 7a4 4 0 1 0-5 5l-6 6 3 3 6-6a4 4 0 0 0 5-5l-3 3-3-3z"
  }));
  const Chip = ({
    icon,
    label,
    green
  }) => /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      fontSize: 12,
      fontWeight: 600,
      padding: '5px 10px',
      borderRadius: 999,
      background: green ? 'var(--pg-aqua-100)' : 'var(--pg-ink-100)',
      color: green ? 'var(--pg-aqua-800)' : 'var(--pg-ink-600)'
    }
  }, icon, " ", label);
  const safeUser = user || {};
  const equipment = tr(safeUser.equipment, lang) || [];
  const hasExp = safeUser.experience && safeUser.experience.length > 0;

  // Success screen
  if (submitted) {
    return /*#__PURE__*/React.createElement(Sheet, {
      open: open,
      onClose: onClose,
      height: "auto"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '20px 20px 50px',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 72,
        height: 72,
        borderRadius: '50%',
        background: 'var(--pg-aqua-100)',
        margin: '0 auto 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, Icon.check(32, 'var(--pg-aqua-700)')), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 22,
        fontWeight: 700,
        letterSpacing: '-0.02em',
        marginBottom: 8
      }
    }, s('Application sent!', 'Candidatura enviada!', '¡Postulación enviada!')), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        color: 'var(--pg-ink-500)',
        lineHeight: 1.55,
        maxWidth: 260,
        margin: '0 auto'
      }
    }, s(`${jobCompany} will review your profile and get in touch.`, `${jobCompany} vai analisar seu perfil e entrar em contato.`, `${jobCompany} revisará tu perfil y se pondrá en contacto.`))));
  }
  return /*#__PURE__*/React.createElement(Sheet, {
    open: open,
    onClose: onClose,
    height: "92%"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '6px 18px 44px',
      height: '100%',
      overflow: 'auto',
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 18,
      fontWeight: 700,
      letterSpacing: '-0.01em'
    }
  }, s('Apply for job', 'Candidatar-se', 'Postularse')), /*#__PURE__*/React.createElement("button", {
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
      padding: '13px 14px',
      borderRadius: 14,
      marginBottom: 22,
      background: 'var(--pg-blue-900)',
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 44,
      height: 44,
      borderRadius: 12,
      flexShrink: 0,
      background: 'rgba(255,255,255,0.12)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 800,
      fontSize: 18,
      color: '#fff',
      fontFamily: 'var(--pg-font-display)'
    }
  }, (jobCompany[0] || '?').toUpperCase()), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: '#fff',
      letterSpacing: '-0.01em',
      marginBottom: 2
    }
  }, jobCompany), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: 'rgba(255,255,255,0.65)'
    }
  }, tr(jobRole, lang), " \xB7 ", job.loc)), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--pg-font-display)',
      fontSize: 15,
      fontWeight: 700,
      color: 'oklch(0.88 0.16 90)',
      letterSpacing: '-0.01em'
    }
  }, tr(job.pay, lang)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'rgba(255,255,255,0.45)',
      marginTop: 1
    }
  }, tr(jobType, lang)))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
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
      color: 'var(--pg-ink-400)',
      letterSpacing: '0.06em'
    }
  }, s('YOUR PROFILE (auto-filled)', 'SEU PERFIL (preenchido automaticamente)', 'TU PERFIL (llenado automáticamente)')), /*#__PURE__*/React.createElement("span", {
    onClick: onEditProfile,
    style: {
      fontSize: 11,
      color: 'var(--pg-blue-500)',
      fontWeight: 600,
      cursor: 'pointer'
    }
  }, s('Edit profile', 'Editar perfil', 'Editar perfil'), " \u2192")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '11px 14px',
      borderRadius: 12,
      background: 'var(--pg-blue-50)',
      border: '0.5px solid var(--pg-blue-100)',
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: safeUser.name,
    size: 38,
    src: safeUser.photoUrl || undefined
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: 'var(--pg-ink-900)'
    }
  }, safeUser.name), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      marginTop: 2
    }
  }, /*#__PURE__*/React.createElement(Stars, {
    rating: safeUser.rating,
    size: 10
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      color: 'var(--pg-ink-500)',
      fontWeight: 600
    }
  }, safeUser.rating, " \xB7 ", safeUser.reviews, " ", s('reviews', 'avaliações', 'reseñas'))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 10
    }
  }, safeUser.age && /*#__PURE__*/React.createElement(Chip, {
    icon: /*#__PURE__*/React.createElement("svg", {
      width: "12",
      height: "12",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "var(--pg-ink-500)",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "8",
      r: "5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M3 21v-1a9 9 0 0118 0v1"
    })),
    label: `${safeUser.age} ${s('yrs', 'anos', 'años')}`
  }), safeUser.region && /*#__PURE__*/React.createElement(Chip, {
    icon: Icon.pin(12, 'var(--pg-ink-500)'),
    label: safeUser.region
  }), /*#__PURE__*/React.createElement(Chip, {
    icon: CarIcon(safeUser.hasCar ? 'var(--pg-aqua-700)' : 'var(--pg-ink-400)'),
    label: safeUser.hasCar ? s('Own vehicle', 'Veículo próprio', 'Vehículo propio') : s('No vehicle', 'Sem veículo', 'Sin vehículo'),
    green: safeUser.hasCar
  }), /*#__PURE__*/React.createElement(Chip, {
    icon: LicenseIcon(safeUser.hasLicense ? 'var(--pg-aqua-700)' : 'var(--pg-ink-400)'),
    label: safeUser.hasLicense ? lang === 'pt' ? "Driver's license válida" : lang === 'es' ? "Driver's license válida" : "Valid driver's license" : lang === 'pt' ? "Sem driver's license" : lang === 'es' ? "Sin driver's license" : 'No license',
    green: safeUser.hasLicense
  })), equipment.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      fontWeight: 700,
      color: 'var(--pg-ink-400)',
      letterSpacing: '0.06em',
      marginBottom: 6
    }
  }, s('EQUIPMENT', 'EQUIPAMENTOS', 'EQUIPOS')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 5
    }
  }, equipment.map((eq, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      fontSize: 11.5,
      fontWeight: 600,
      padding: '4px 9px',
      borderRadius: 999,
      background: 'var(--pg-blue-50)',
      border: '0.5px solid var(--pg-blue-200)',
      color: 'var(--pg-blue-800)'
    }
  }, ToolIcon('var(--pg-blue-600)'), " ", eq)))), hasExp && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      fontWeight: 700,
      color: 'var(--pg-ink-400)',
      letterSpacing: '0.06em',
      marginBottom: 6
    }
  }, s('WORK EXPERIENCE', 'EXPERIÊNCIA', 'EXPERIENCIA')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 7
    }
  }, safeUser.experience.map((exp, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      padding: '10px 12px',
      borderRadius: 10,
      background: 'var(--pg-ink-50)',
      border: '0.5px solid var(--pg-ink-200)',
      borderLeft: '3px solid var(--pg-blue-400)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 8,
      marginBottom: 3
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: 'var(--pg-ink-900)'
    }
  }, tr(exp.role, lang)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: 'var(--pg-ink-500)',
      marginTop: 1
    }
  }, exp.company)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: 'var(--pg-blue-600)',
      background: 'var(--pg-blue-50)',
      padding: '2px 7px',
      borderRadius: 5,
      flexShrink: 0
    }
  }, tr(exp.duration, lang))), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 11.5,
      color: 'var(--pg-ink-600)',
      lineHeight: 1.45
    }
  }, tr(exp.desc, lang))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: 'var(--pg-ink-400)',
      letterSpacing: '0.06em',
      marginBottom: 8
    }
  }, s('MESSAGE TO EMPLOYER (optional)', 'MENSAGEM PARA O EMPREGADOR (opcional)', 'MENSAJE AL EMPLEADOR (opcional)')), /*#__PURE__*/React.createElement("textarea", {
    value: note,
    onChange: e => setNote(e.target.value),
    placeholder: s('Tell them why you\'re a great fit, your availability, or anything else relevant…', 'Diga por que você é o candidato ideal, sua disponibilidade ou qualquer outro detalhe relevante…', 'Cuéntales por qué eres ideal para el puesto, tu disponibilidad u otros detalles relevantes…'),
    rows: 3,
    style: {
      width: '100%',
      boxSizing: 'border-box',
      padding: '12px 14px',
      borderRadius: 12,
      border: '1px solid var(--pg-ink-200)',
      background: 'var(--pg-ink-50)',
      fontSize: 13.5,
      fontFamily: 'inherit',
      color: 'var(--pg-ink-900)',
      lineHeight: 1.5,
      resize: 'none',
      outline: 'none'
    }
  })), insertError && /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'oklch(0.97 0.03 25)',
      border: '0.5px solid oklch(0.80 0.12 25)',
      borderRadius: 10,
      padding: '10px 14px',
      marginBottom: 10,
      fontSize: 13,
      color: 'oklch(0.45 0.18 25)',
      lineHeight: 1.4
    }
  }, "\u26A0\uFE0F ", insertError), /*#__PURE__*/React.createElement("button", {
    onClick: handleSubmit,
    disabled: saving,
    className: "pg-btn pg-btn-primary",
    style: {
      width: '100%',
      height: 54,
      fontSize: 16,
      borderRadius: 14,
      gap: 8,
      opacity: saving ? 0.7 : 1
    }
  }, saving ? /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#fff",
    strokeWidth: "2.5",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "9",
    strokeOpacity: ".3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 3a9 9 0 0 1 9 9",
    style: {
      animation: 'spin 0.8s linear infinite'
    }
  })) : Icon.check(18, '#fff'), saving ? s('Sending…', 'Enviando…', 'Enviando…') : s('Send application', 'Enviar candidatura', 'Enviar postulación')), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginTop: 10,
      fontSize: 11.5,
      color: 'var(--pg-ink-400)',
      lineHeight: 1.5
    }
  }, s('Your profile data will be shared with the employer.', 'Seus dados de perfil serão compartilhados com o empregador.', 'Tus datos de perfil serán compartidos con el empleador.'))));
}

// ── Hiring Application Detail Sheet ──────────────────────────
function HiringAppDetailSheet({
  open,
  onClose,
  app,
  lang = 'en',
  onWithdraw,
  onChat
}) {
  // freshApp: live data polled from DB while sheet is open
  const [freshApp, setFreshApp] = React.useState(null);
  const [withdrawing, setWithdrawing] = React.useState(false);
  const [chatLoading, setChatLoading] = React.useState(false);

  // snapshotRef: keeps the last valid app data alive during the 300ms close animation
  // so HiringAppDetailSheet never returns null mid-animation (which would abruptly
  // unmount Sheet and cut its close animation short → visual glitch / black screen).
  const snapshotRef = React.useRef(null);
  if (app) snapshotRef.current = app; // update whenever a real app arrives
  if (freshApp) snapshotRef.current = freshApp; // prefer fresh data

  const fetchFresh = React.useCallback(async () => {
    if (!window.sb) return;
    // Use the ref so the closure always has the current app data
    const curApp = snapshotRef.current;
    if (!curApp?.id && !curApp?.job_id) return;
    let data = null;
    if (curApp.id) {
      const res = await window.sb.from('job_applications').select('*').eq('id', curApp.id);
      data = Array.isArray(res.data) ? res.data[0] : null;
    }
    if (!data && curApp.job_id) {
      const res = await window.sb.from('job_applications').select('*').eq('job_id', curApp.job_id);
      data = Array.isArray(res.data) ? res.data[0] : null;
    }
    if (!data) return;

    // Resolve author_id: cached → job_author_id column → jobs table lookup
    let resolvedAuthorId = curApp.author_id || data.job_author_id || null;
    if (!resolvedAuthorId && data.job_id && window.sb) {
      try {
        const jr = await window.sb.from('jobs').select('author_id').eq('id', data.job_id);
        if (jr.data && jr.data[0]) resolvedAuthorId = jr.data[0].author_id || null;
      } catch (e) {}
    }
    setFreshApp({
      ...curApp,
      status: data.status || curApp.status,
      rejectReason: data.reject_reason || null,
      interview: data.interview_day ? {
        day: {
          en: data.interview_day,
          pt: data.interview_day,
          es: data.interview_day
        },
        time: data.interview_time || ''
      } : null,
      author_id: resolvedAuthorId,
      job_id: data.job_id || curApp.job_id
    });
  }, []); // eslint-disable-line — uses ref, no deps needed

  React.useEffect(() => {
    if (!open) {
      // Delay clearing freshApp until AFTER the Sheet close animation (300ms)
      // so HiringAppDetailSheet never returns null mid-animation.
      const t = setTimeout(() => {
        setFreshApp(null);
        setWithdrawing(false);
      }, 320);
      return () => clearTimeout(t);
    }
    fetchFresh();
    const t = setInterval(fetchFresh, 5000);
    return () => clearInterval(t);
  }, [open, app?.id]); // eslint-disable-line

  const handleWithdraw = async () => {
    const curApp = app || snapshotRef.current;
    if (!curApp?.id || !window.sb) return;
    setWithdrawing(true);
    await window.sb.from('job_applications').delete().eq('id', curApp.id);
    setWithdrawing(false);
    onWithdraw && onWithdraw(curApp.id);
    onClose();
  };

  // Use snapshotRef so the Sheet always has data during the close animation.
  // Never return null here — that would abruptly unmount Sheet and cut its
  // close animation short, causing the black screen bug.
  const display = freshApp || app || snapshotRef.current;
  if (!display) return null; // only on first-ever render before any app arrives

  const isPending = display.status === 'pending';
  const isAccepted = display.status === 'accepted';
  const isRejected = display.status === 'rejected';
  const appliedLbl = lang === 'pt' ? 'Candidatura enviada' : lang === 'es' ? 'Postulación enviada' : 'Application sent';
  const waitingLbl = lang === 'pt' ? 'Aguardando resposta da empresa' : lang === 'es' ? 'Esperando respuesta de la empresa' : 'Awaiting company response';
  const hiredLbl = lang === 'pt' ? 'Você foi contratado!' : lang === 'es' ? '¡Fuiste contratado!' : 'You got the job!';
  const hiredSubLbl = lang === 'pt' ? 'Parabéns! Veja os próximos passos.' : lang === 'es' ? '¡Felicidades! Próximos pasos.' : 'Congratulations! See next steps below.';
  const rejectedLbl = lang === 'pt' ? 'Candidatura encerrada' : lang === 'es' ? 'Postulación cerrada' : 'Application closed';
  const startLbl = lang === 'pt' ? 'Data de início' : lang === 'es' ? 'Fecha de inicio' : 'Start date';
  const contactLbl = lang === 'pt' ? 'Contato na empresa' : lang === 'es' ? 'Contacto en la empresa' : 'Company contact';
  const perksLbl = lang === 'pt' ? 'Benefícios' : lang === 'es' ? 'Beneficios' : 'Benefits';
  const withdrawLbl = lang === 'pt' ? 'Retirar candidatura' : lang === 'es' ? 'Retirar postulación' : 'Withdraw application';
  const lookMoreLbl = lang === 'pt' ? 'Ver outras vagas' : lang === 'es' ? 'Ver más empleos' : 'Browse more jobs';
  const messageLbl = lang === 'pt' ? 'Enviar mensagem' : lang === 'es' ? 'Enviar mensaje' : 'Send message';
  const reasonLbl = lang === 'pt' ? 'Motivo informado pela empresa' : lang === 'es' ? 'Motivo informado por la empresa' : 'Reason provided by company';
  const sentLbl = lang === 'pt' ? `Enviada há ${display.when}` : lang === 'es' ? `Enviada hace ${display.when}` : `Sent ${display.when} ago`;
  const appliedOnLbl = display.appliedDate ? lang === 'pt' ? `Candidatura enviada em ${tr(display.appliedDate, lang)}` : lang === 'es' ? `Postulación enviada el ${tr(display.appliedDate, lang)}` : `Applied on ${tr(display.appliedDate, lang)}` : sentLbl;
  const statusCfg = isPending ? {
    bg: 'oklch(0.96 0.05 68)',
    border: 'oklch(0.85 0.10 68)',
    iconBg: 'oklch(0.88 0.14 68)',
    color: 'oklch(0.42 0.18 68)',
    emoji: '⏳',
    title: appliedLbl,
    sub: waitingLbl
  } : isAccepted ? {
    bg: 'var(--pg-aqua-50)',
    border: 'var(--pg-aqua-200)',
    iconBg: 'var(--pg-aqua-100)',
    color: 'var(--pg-aqua-800)',
    emoji: '🎉',
    title: hiredLbl,
    sub: hiredSubLbl
  } : {
    bg: 'oklch(0.97 0.02 20)',
    border: 'oklch(0.88 0.08 20)',
    iconBg: 'oklch(0.92 0.05 20)',
    color: 'oklch(0.42 0.18 20)',
    emoji: '✕',
    title: rejectedLbl,
    sub: ''
  };
  const PhoneIcon = (color = '#fff') => /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 2.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"
  }));
  const EmailIcon = (color = 'var(--pg-aqua-700)') => /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "22,6 12,13 2,6"
  }));
  const CalIcon = /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--pg-aqua-700)",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "4",
    width: "18",
    height: "18",
    rx: "2",
    ry: "2"
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
  }));
  return /*#__PURE__*/React.createElement(Sheet, {
    open: open,
    onClose: onClose,
    height: "auto"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '6px 20px 44px',
      maxHeight: '100%',
      overflow: 'auto',
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginBottom: 16
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
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 52,
      height: 52,
      borderRadius: 14,
      flexShrink: 0,
      background: 'var(--pg-blue-100)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 800,
      fontSize: 22,
      color: 'var(--pg-blue-700)',
      fontFamily: 'var(--pg-font-display)'
    }
  }, (display.company || '?')[0]), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 700,
      letterSpacing: '-0.015em',
      color: 'var(--pg-ink-900)'
    }
  }, display.company), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: 'var(--pg-ink-600)',
      marginTop: 1,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, tr(display.title, lang)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 7,
      flexWrap: 'wrap',
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      fontSize: 12,
      color: 'var(--pg-ink-500)',
      padding: '4px 10px',
      borderRadius: 999,
      background: 'var(--pg-ink-100)'
    }
  }, Icon.pin(11, 'var(--pg-ink-400)'), " ", display.loc), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      fontSize: 12,
      fontWeight: 700,
      color: 'var(--pg-blue-700)',
      padding: '4px 10px',
      borderRadius: 999,
      background: 'var(--pg-blue-50)'
    }
  }, tr(display.pay, lang)), display.jobType && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--pg-ink-500)',
      padding: '4px 10px',
      borderRadius: 999,
      background: 'var(--pg-ink-100)'
    }
  }, tr(display.jobType, lang))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 14,
      padding: '14px 16px',
      marginBottom: 20,
      background: statusCfg.bg,
      border: `0.5px solid ${statusCfg.border}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 38,
      borderRadius: 11,
      flexShrink: 0,
      background: statusCfg.iconBg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 18
    }
  }, statusCfg.emoji), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: statusCfg.color,
      letterSpacing: '-0.01em'
    }
  }, statusCfg.title), statusCfg.sub && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: statusCfg.color,
      opacity: 0.72,
      marginTop: 2
    }
  }, statusCfg.sub))), isPending && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      paddingTop: 10,
      borderTop: `0.5px solid ${statusCfg.border}`,
      fontSize: 12,
      color: statusCfg.color,
      opacity: 0.68
    }
  }, appliedOnLbl)), isRejected && display.rejectReason && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20,
      padding: '12px 14px',
      borderRadius: 12,
      background: 'oklch(0.97 0.02 20)',
      border: '0.5px solid oklch(0.88 0.08 20)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      fontWeight: 700,
      letterSpacing: '0.07em',
      color: 'oklch(0.55 0.15 20)',
      marginBottom: 7
    }
  }, reasonLbl.toUpperCase()), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: 'oklch(0.30 0.12 20)',
      lineHeight: 1.55,
      fontStyle: 'italic',
      fontWeight: 500
    }
  }, "\"", tr(display.rejectReason, lang), "\"")), isRejected && !display.rejectReason && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20,
      padding: '10px 14px',
      borderRadius: 12,
      background: 'oklch(0.97 0.02 20)',
      border: '0.5px solid oklch(0.88 0.08 20)',
      fontSize: 12,
      color: 'oklch(0.55 0.15 20)',
      fontStyle: 'italic'
    }
  }, lang === 'pt' ? 'Nenhum motivo informado pela empresa.' : lang === 'es' ? 'Sin motivo informado por la empresa.' : 'No reason provided by the company.'), isAccepted && display.interview && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14,
      padding: '12px 14px',
      borderRadius: 12,
      background: 'oklch(0.96 0.04 145)',
      border: '0.5px solid oklch(0.80 0.10 145)',
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 38,
      borderRadius: 10,
      background: 'oklch(0.88 0.10 145)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, CalIcon), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      fontWeight: 700,
      letterSpacing: '0.07em',
      color: 'oklch(0.40 0.18 145)',
      marginBottom: 2
    }
  }, (lang === 'pt' ? 'ENTREVISTA AGENDADA' : lang === 'es' ? 'ENTREVISTA PROGRAMADA' : 'INTERVIEW SCHEDULED').toUpperCase()), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: 'oklch(0.35 0.18 145)',
      letterSpacing: '-0.01em'
    }
  }, "\uD83D\uDCC5 ", tr(display.interview.day, lang), " \xB7 ", display.interview.time))), isAccepted && display.startDate && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14,
      padding: '12px 14px',
      borderRadius: 12,
      background: 'var(--pg-aqua-50)',
      border: '0.5px solid var(--pg-aqua-200)',
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 38,
      borderRadius: 10,
      background: 'var(--pg-aqua-100)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, CalIcon), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      fontWeight: 700,
      letterSpacing: '0.07em',
      color: 'var(--pg-ink-400)'
    }
  }, startLbl.toUpperCase()), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      color: 'var(--pg-aqua-800)',
      letterSpacing: '-0.01em'
    }
  }, tr(display.startDate, lang)))), isAccepted && display.contact && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14,
      padding: '12px 14px',
      borderRadius: 12,
      background: 'var(--pg-blue-50)',
      border: '0.5px solid var(--pg-blue-100)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      fontWeight: 700,
      letterSpacing: '0.07em',
      color: 'var(--pg-ink-400)',
      marginBottom: 10
    }
  }, contactLbl.toUpperCase()), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: display.contact.name,
    size: 32
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: 'var(--pg-ink-900)'
    }
  }, display.contact.name)), /*#__PURE__*/React.createElement("a", {
    href: `tel:${display.contact.phone}`,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      textDecoration: 'none',
      padding: '7px 0',
      borderTop: '0.5px solid var(--pg-blue-100)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 28,
      height: 28,
      borderRadius: 8,
      background: 'var(--pg-blue-500)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, PhoneIcon('#fff')), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: 'var(--pg-blue-700)'
    }
  }, display.contact.phone)), display.contact.email && /*#__PURE__*/React.createElement("a", {
    href: `mailto:${display.contact.email}`,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      textDecoration: 'none',
      padding: '7px 0',
      borderTop: '0.5px solid var(--pg-blue-100)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 28,
      height: 28,
      borderRadius: 8,
      background: 'var(--pg-aqua-100)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, EmailIcon()), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--pg-aqua-700)'
    }
  }, display.contact.email))), isAccepted && display.perks && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      fontWeight: 700,
      letterSpacing: '0.07em',
      color: 'var(--pg-ink-400)',
      marginBottom: 8
    }
  }, perksLbl.toUpperCase()), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap'
    }
  }, (tr(display.perks, lang) || []).map((perk, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      fontSize: 12,
      fontWeight: 600,
      padding: '4px 11px',
      borderRadius: 999,
      background: 'var(--pg-aqua-100)',
      color: 'var(--pg-aqua-800)'
    }
  }, "\u2713 ", perk)))), isAccepted && /*#__PURE__*/React.createElement("button", {
    onClick: async () => {
      if (!onChat) return;
      let authorId = display.author_id;
      let authorName = display.company || '';

      // Slow path — look up employer when author_id not yet cached
      if (!authorId && display.job_id && window.sb) {
        setChatLoading(true);
        try {
          const {
            data
          } = await window.sb.from('jobs').select('author_id, author').eq('id', display.job_id);
          if (data && data[0]) {
            authorId = data[0].author_id || null;
            authorName = data[0].author || authorName;
          }
        } catch (e) {
          console.warn('[HiringAppDetail] job lookup failed:', e);
        } finally {
          setChatLoading(false);
        }
      }

      // Close this sheet first, then wait for its 260ms close animation to finish
      // before opening chat — avoids the backdrop overlap (black screen).
      // HiringAppDetailSheet comes after ChatSheet in the DOM so its backdrop
      // (z-index 1000) covers the opening ChatSheet if both render simultaneously.
      onClose();
      setTimeout(() => {
        onChat(authorId ? {
          id: authorId,
          name: authorName,
          listingId: display.job_id || null,
          listingContext: {
            name: tr(display.title, lang) || display.company || (lang === 'pt' ? 'Vaga' : 'Job'),
            type: 'hiring'
          }
        } : null);
      }, 300);
    },
    disabled: chatLoading,
    className: "pg-btn pg-btn-aqua",
    style: {
      width: '100%',
      height: 52,
      fontSize: 15,
      borderRadius: 14,
      opacity: chatLoading ? 0.7 : 1
    }
  }, chatLoading ? lang === 'pt' ? 'Carregando…' : lang === 'es' ? 'Cargando…' : 'Loading…' : messageLbl), isPending && /*#__PURE__*/React.createElement("button", {
    onClick: handleWithdraw,
    disabled: withdrawing,
    className: "pg-btn pg-btn-ghost",
    style: {
      width: '100%',
      height: 46,
      fontSize: 14,
      borderRadius: 14,
      color: 'var(--pg-danger)',
      opacity: withdrawing ? 0.5 : 1
    }
  }, withdrawing ? lang === 'pt' ? 'Retirando…' : lang === 'es' ? 'Retirando…' : 'Withdrawing…' : withdrawLbl), isRejected && /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    className: "pg-btn pg-btn-primary",
    style: {
      width: '100%',
      height: 52,
      fontSize: 15,
      borderRadius: 14
    }
  }, lookMoreLbl)));
}

// ── Edit Profile Sheet ────────────────────────────────────────
function EditProfileSheet({
  open,
  onClose,
  user,
  setUser,
  lang = 'en'
}) {
  const s = (en, pt, es) => lang === 'pt' ? pt : lang === 'es' ? es : en;
  const [name, setName] = React.useState('');
  const [age, setAge] = React.useState('');
  const [region, setRegion] = React.useState('');
  const [regionFocus, setRegionFocus] = React.useState(false);
  const [hasCar, setHasCar] = React.useState(false);
  const [hasLicense, setHasLicense] = React.useState(false);
  const [hasEquipment, setHasEquipment] = React.useState(false);
  const [equipment, setEquipment] = React.useState([]);
  const [eqInput, setEqInput] = React.useState('');
  const [experience, setExperience] = React.useState([]);
  const [addingExp, setAddingExp] = React.useState(false);
  const [newExp, setNewExp] = React.useState({
    company: '',
    role: '',
    duration: '',
    desc: ''
  });
  const [photoUrl, setPhotoUrl] = React.useState('');
  const [photoUploading, setPhotoUploading] = React.useState(false);
  const photoInputRef = React.useRef(null);
  const REGION_LIST = ['Fort Lauderdale, FL', 'Weston, FL', 'Plantation, FL', 'Davie, FL', 'Sunrise, FL', 'Pembroke Pines, FL', 'Hollywood, FL', 'Miramar, FL', 'Coral Springs, FL', 'Pompano Beach, FL', 'Boca Raton, FL', 'Deerfield Beach, FL', 'Margate, FL', 'Tamarac, FL', 'Oakland Park, FL', 'Hallandale Beach, FL', 'Dania Beach, FL', 'Lauderhill, FL', 'Lauderdale Lakes, FL', 'North Lauderdale, FL', 'Miami, FL', 'Miami Beach, FL', 'Hialeah, FL', 'Doral, FL', 'Kendall, FL', 'Coral Gables, FL', 'Aventura, FL', 'North Miami Beach, FL', 'Opa-locka, FL', 'Miami Lakes, FL', 'Homestead, FL', 'Miami Gardens, FL', 'Cutler Bay, FL', 'Palmetto Bay, FL', 'Pinecrest, FL', 'West Palm Beach, FL', 'Boca Raton, FL', 'Boynton Beach, FL', 'Delray Beach, FL', 'Lake Worth, FL', 'Wellington, FL', 'Palm Beach Gardens, FL', 'Jupiter, FL', 'Riviera Beach, FL', 'Royal Palm Beach, FL', 'Naples, FL', 'Cape Coral, FL', 'Fort Myers, FL', 'Bonita Springs, FL', 'Marco Island, FL', 'Broward County, FL', 'Miami-Dade County, FL', 'Palm Beach County, FL'];
  const regionSuggestions = region.trim().length >= 2 ? REGION_LIST.filter(r => r.toLowerCase().includes(region.toLowerCase())).slice(0, 6) : [];
  React.useEffect(() => {
    if (!open || !user) return;
    setName(user.name || '');
    setAge(user.age ? String(user.age) : '');
    setRegion(user.region || '');
    setHasCar(!!user.hasCar);
    setHasLicense(!!user.hasLicense);
    setHasEquipment(!!user.hasEquipment);
    setEquipment([...(user.equipment ? tr(user.equipment, lang) || [] : [])]);
    setExperience((user.experience || []).map(exp => ({
      company: exp.company || '',
      role: tr(exp.role, lang) || '',
      duration: tr(exp.duration, lang) || '',
      desc: tr(exp.desc, lang) || ''
    })));
    setAddingExp(false);
    setNewExp({
      company: '',
      role: '',
      duration: '',
      desc: ''
    });
    setEqInput('');
    setPhotoUrl(user.photoUrl || '');
  }, [open]);

  // ── Photo upload ──────────────────────────────────────────────
  const handlePhotoFile = async e => {
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
          let w = img.width,
            h = img.height;
          const min = Math.min(w, h); // crop to square
          const sx = (w - min) / 2,
            sy = (h - min) / 2;
          const out = Math.min(min, MAX);
          const c = document.createElement('canvas');
          c.width = out;
          c.height = out;
          c.getContext('2d').drawImage(img, sx, sy, min, min, 0, 0, out, out);
          URL.revokeObjectURL(src);
          c.toBlob(b => resolve(b), 'image/jpeg', 0.82);
        };
        img.src = src;
      });
      let url = null;
      if (window.sb && window.sb.storage) {
        const path = 'avatars/' + (user.uid || Date.now()) + '.jpg';
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
      setPhotoUrl(url);
    } catch (err) {
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
    setExperience(p => [...p, {
      ...newExp
    }]);
    setNewExp({
      company: '',
      role: '',
      duration: '',
      desc: ''
    });
    setAddingExp(false);
  };
  const handleSave = () => {
    const eqObj = hasEquipment && equipment.length > 0 ? {
      en: equipment,
      pt: equipment,
      es: equipment
    } : null;
    const expArr = experience.map(e => ({
      company: e.company,
      role: {
        en: e.role,
        pt: e.role,
        es: e.role
      },
      duration: {
        en: e.duration,
        pt: e.duration,
        es: e.duration
      },
      desc: {
        en: e.desc,
        pt: e.desc,
        es: e.desc
      }
    }));
    const newAge = parseInt(age) || null;
    setUser(prev => ({
      ...prev,
      name: name.trim() || prev.name,
      age: newAge || prev.age,
      region: region.trim() || prev.region,
      hasCar,
      hasLicense,
      hasEquipment,
      equipment: eqObj,
      experience: expArr,
      photoUrl: photoUrl || prev.photoUrl || ''
    }));
    // Persist to Supabase so it survives reload / other devices, not just this session
    if (window.sb && user.uid) {
      window.sb.from('profiles').update({
        name: name.trim() || undefined,
        region: region.trim() || undefined,
        age: newAge,
        has_car: hasCar,
        has_license: hasLicense,
        has_equipment: hasEquipment,
        equipment: eqObj,
        experience: expArr,
        photo_url: photoUrl || ''
      }).eq('id', user.uid).then(({
        error
      }) => {
        if (error) console.warn('[Profile save]', error.message);
      });
    }
    onClose();
  };
  const inp = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid var(--pg-ink-200)',
    background: 'var(--pg-white)',
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
    color: 'var(--pg-ink-900)'
  };
  const SecLbl = ({
    children
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: 'var(--pg-ink-500)',
      letterSpacing: '0.06em',
      marginBottom: 10
    }
  }, children);

  // Toggle switch
  const Toggle = ({
    on,
    onChange
  }) => /*#__PURE__*/React.createElement("button", {
    onClick: () => onChange(!on),
    style: {
      width: 46,
      height: 27,
      borderRadius: 14,
      border: 'none',
      cursor: 'pointer',
      background: on ? 'var(--pg-aqua-500)' : 'var(--pg-ink-300)',
      position: 'relative',
      padding: 0,
      flexShrink: 0,
      transition: 'background .18s'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 21,
      height: 21,
      borderRadius: '50%',
      background: '#fff',
      position: 'absolute',
      top: 3,
      left: on ? 22 : 3,
      transition: 'left .18s',
      boxShadow: '0 1px 4px rgba(0,0,0,0.22)'
    }
  }));
  const ToggleRow = ({
    label,
    sub,
    on,
    onChange
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '11px 14px',
      borderRadius: 11,
      background: 'var(--pg-ink-50)',
      border: '0.5px solid var(--pg-ink-200)',
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      paddingRight: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      fontWeight: 600,
      color: 'var(--pg-ink-900)'
    }
  }, label), sub && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: 'var(--pg-ink-400)',
      marginTop: 1
    }
  }, sub)), /*#__PURE__*/React.createElement(Toggle, {
    on: on,
    onChange: onChange
  }));
  return /*#__PURE__*/React.createElement(FullPage, {
    open: open,
    onClose: onClose
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 18px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexShrink: 0,
      borderBottom: '0.5px solid var(--pg-ink-200)'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 18,
      fontWeight: 700,
      letterSpacing: '-0.01em'
    }
  }, s('Edit profile', 'Editar perfil', 'Editar perfil')), /*#__PURE__*/React.createElement("button", {
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
      flex: 1,
      overflow: 'auto',
      touchAction: 'pan-y',
      padding: '20px 18px 24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: 24,
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 96,
      height: 96,
      borderRadius: '50%',
      padding: 3,
      background: 'linear-gradient(135deg, var(--pg-aqua-500) 0%, var(--pg-blue-600) 100%)'
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: name || user.name || '?',
    size: 90,
    src: photoUrl
  })), /*#__PURE__*/React.createElement("button", {
    onClick: () => photoInputRef.current && photoInputRef.current.click(),
    disabled: photoUploading,
    style: {
      position: 'absolute',
      bottom: 2,
      right: 2,
      width: 30,
      height: 30,
      borderRadius: '50%',
      background: photoUploading ? 'var(--pg-ink-300)' : 'var(--pg-blue-500)',
      border: '2.5px solid var(--pg-white)',
      cursor: photoUploading ? 'default' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.18)'
    }
  }, photoUploading ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13
    }
  }, "\u23F3") : /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#fff",
    strokeWidth: "2.2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "13",
    r: "4"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--pg-ink-700)'
    }
  }, s('Profile photo', 'Foto de perfil', 'Foto de perfil')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: 'var(--pg-ink-400)',
      marginTop: 2
    }
  }, photoUploading ? s('Uploading…', 'Enviando…', 'Subiendo…') : s('Tap the camera icon to change', 'Toque o ícone de câmera para trocar', 'Toca el ícono de cámara para cambiar'))), /*#__PURE__*/React.createElement("input", {
    ref: photoInputRef,
    type: "file",
    accept: "image/*",
    style: {
      display: 'none'
    },
    onChange: handlePhotoFile
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement(SecLbl, null, s('BASIC INFO', 'INFORMAÇÕES BÁSICAS', 'INFORMACIÓN BÁSICA')), /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--pg-ink-600)',
      display: 'block',
      marginBottom: 4
    }
  }, s('Full name', 'Nome completo', 'Nombre completo')), /*#__PURE__*/React.createElement("input", {
    value: name,
    onChange: e => setName(e.target.value),
    style: {
      ...inp,
      marginBottom: 10
    },
    placeholder: "Lucas Mendes"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 88px'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--pg-ink-600)',
      display: 'block',
      marginBottom: 4
    }
  }, s('Age', 'Idade', 'Edad')), /*#__PURE__*/React.createElement("input", {
    value: age,
    onChange: e => setAge(e.target.value.replace(/\D/g, '')),
    style: inp,
    placeholder: "31",
    inputMode: "numeric"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--pg-ink-600)',
      display: 'block',
      marginBottom: 4
    }
  }, s('City / Region', 'Cidade / Região', 'Ciudad / Región')), /*#__PURE__*/React.createElement("input", {
    value: region,
    onChange: e => setRegion(e.target.value),
    onFocus: () => setRegionFocus(true),
    onBlur: () => setTimeout(() => setRegionFocus(false), 150),
    style: {
      ...inp,
      borderBottomLeftRadius: regionFocus && regionSuggestions.length > 0 ? 0 : undefined,
      borderBottomRightRadius: regionFocus && regionSuggestions.length > 0 ? 0 : undefined
    },
    placeholder: "Fort Lauderdale, FL"
  }), regionFocus && regionSuggestions.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      zIndex: 999,
      background: 'var(--pg-white)',
      border: '1px solid var(--pg-blue-300)',
      borderTop: 'none',
      borderRadius: '0 0 10px 10px',
      boxShadow: '0 6px 16px rgba(15,30,60,0.12)',
      overflow: 'hidden'
    }
  }, regionSuggestions.map((r, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    onMouseDown: () => {
      setRegion(r);
      setRegionFocus(false);
    },
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      width: '100%',
      padding: '9px 12px',
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      fontFamily: 'inherit',
      textAlign: 'left',
      fontSize: 13,
      color: 'var(--pg-ink-800)',
      fontWeight: 500,
      borderBottom: i < regionSuggestions.length - 1 ? '0.5px solid var(--pg-ink-100)' : 'none'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'var(--pg-blue-50)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent'
  }, Icon.pin(12, 'var(--pg-blue-400)'), /*#__PURE__*/React.createElement("span", null, r))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement(SecLbl, null, s('RESOURCES', 'RECURSOS', 'RECURSOS')), /*#__PURE__*/React.createElement(ToggleRow, {
    label: s('Own vehicle', 'Veículo próprio', 'Vehículo propio'),
    sub: s('Car, truck or van', 'Carro, caminhonete ou van', 'Carro, camioneta o van'),
    on: hasCar,
    onChange: setHasCar
  }), /*#__PURE__*/React.createElement(ToggleRow, {
    label: lang === 'pt' ? "Driver's license válida" : lang === 'es' ? "Driver's license válida" : "Valid driver's license",
    sub: lang === 'pt' ? "Driver's license emitida pelo estado" : lang === 'es' ? "Driver's license emitida por el estado" : "State-issued driver's license",
    on: hasLicense,
    onChange: setHasLicense
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement(SecLbl, null, s('EQUIPMENT', 'EQUIPAMENTOS', 'EQUIPOS')), /*#__PURE__*/React.createElement(ToggleRow, {
    label: s('I have my own equipment', 'Possuo equipamentos próprios', 'Tengo equipo propio'),
    sub: s('Pump, vacuum, test kits…', 'Bomba, aspirador, kits de teste…', 'Bomba, aspiradora, kits de prueba…'),
    on: hasEquipment,
    onChange: v => {
      setHasEquipment(v);
      if (!v) setEquipment([]);
    }
  }), hasEquipment && /*#__PURE__*/React.createElement(React.Fragment, null, equipment.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 9
    }
  }, equipment.map((eq, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      fontSize: 12,
      fontWeight: 600,
      padding: '5px 9px',
      borderRadius: 999,
      background: 'var(--pg-blue-50)',
      border: '0.5px solid var(--pg-blue-200)',
      color: 'var(--pg-blue-800)'
    }
  }, eq, /*#__PURE__*/React.createElement("button", {
    onClick: () => setEquipment(p => p.filter((_, j) => j !== i)),
    style: {
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      padding: 0,
      color: 'var(--pg-blue-500)',
      lineHeight: 1,
      fontSize: 15
    }
  }, "\xD7")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: eqInput,
    onChange: e => setEqInput(e.target.value),
    onKeyDown: e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addEquipment();
      }
    },
    placeholder: s('e.g. Pentair VS pump', 'ex: Bomba Pentair VS', 'ej: Bomba Pentair VS'),
    style: {
      ...inp,
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: addEquipment,
    style: {
      height: 42,
      padding: '0 14px',
      borderRadius: 10,
      border: 'none',
      background: 'var(--pg-blue-500)',
      color: '#fff',
      fontWeight: 700,
      fontSize: 13,
      cursor: 'pointer',
      fontFamily: 'inherit',
      flexShrink: 0
    }
  }, s('Add', 'Adicionar', 'Agregar'))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 28
    }
  }, /*#__PURE__*/React.createElement(SecLbl, null, s('WORK EXPERIENCE', 'EXPERIÊNCIA PROFISSIONAL', 'EXPERIENCIA LABORAL')), experience.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      marginBottom: 10
    }
  }, experience.map((exp, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      padding: '11px 13px',
      borderRadius: 11,
      position: 'relative',
      background: 'var(--pg-ink-50)',
      border: '0.5px solid var(--pg-ink-200)',
      borderLeft: '3px solid var(--pg-blue-400)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setExperience(p => p.filter((_, j) => j !== i)),
    style: {
      position: 'absolute',
      top: 8,
      right: 8,
      border: 'none',
      background: 'var(--pg-ink-200)',
      width: 22,
      height: 22,
      borderRadius: '50%',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 0
    }
  }, Icon.x(10, 'var(--pg-ink-600)')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: 'var(--pg-ink-900)',
      paddingRight: 28
    }
  }, exp.role), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--pg-ink-500)',
      marginTop: 2
    }
  }, exp.company, exp.duration ? ` · ${exp.duration}` : ''), exp.desc && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--pg-ink-600)',
      marginTop: 4,
      lineHeight: 1.45
    }
  }, exp.desc)))), addingExp ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '13px 14px',
      borderRadius: 12,
      background: 'var(--pg-blue-50)',
      border: '1px solid var(--pg-blue-200)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      color: 'var(--pg-ink-500)',
      display: 'block',
      marginBottom: 3
    }
  }, s('Company', 'Empresa', 'Empresa'), " *"), /*#__PURE__*/React.createElement("input", {
    value: newExp.company,
    onChange: e => setNewExp(p => ({
      ...p,
      company: e.target.value
    })),
    placeholder: "Aqua Solutions",
    style: {
      ...inp,
      fontSize: 13
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 90px'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      color: 'var(--pg-ink-500)',
      display: 'block',
      marginBottom: 3
    }
  }, s('Duration', 'Duração', 'Duración')), /*#__PURE__*/React.createElement("input", {
    value: newExp.duration,
    onChange: e => setNewExp(p => ({
      ...p,
      duration: e.target.value
    })),
    placeholder: s('2 yrs', '2 anos', '2 años'),
    style: {
      ...inp,
      fontSize: 13
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      color: 'var(--pg-ink-500)',
      display: 'block',
      marginBottom: 3
    }
  }, s('Role / Position', 'Cargo / Função', 'Cargo / Puesto'), " *"), /*#__PURE__*/React.createElement("input", {
    value: newExp.role,
    onChange: e => setNewExp(p => ({
      ...p,
      role: e.target.value
    })),
    placeholder: s('Pool Technician', 'Técnico de Piscinas', 'Técnico de Piscinas'),
    style: {
      ...inp,
      fontSize: 13
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      color: 'var(--pg-ink-500)',
      display: 'block',
      marginBottom: 3
    }
  }, s('Description (optional)', 'Descrição (opcional)', 'Descripción (opcional)')), /*#__PURE__*/React.createElement("textarea", {
    value: newExp.desc,
    onChange: e => setNewExp(p => ({
      ...p,
      desc: e.target.value
    })),
    placeholder: s('Brief description…', 'Breve descrição…', 'Breve descripción…'),
    rows: 2,
    style: {
      ...inp,
      resize: 'none',
      fontSize: 13
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setAddingExp(false);
      setNewExp({
        company: '',
        role: '',
        duration: '',
        desc: ''
      });
    },
    style: {
      flex: 1,
      height: 36,
      borderRadius: 9,
      border: '1px solid var(--pg-ink-200)',
      background: 'transparent',
      color: 'var(--pg-ink-600)',
      fontWeight: 600,
      fontSize: 13,
      cursor: 'pointer',
      fontFamily: 'inherit'
    }
  }, s('Cancel', 'Cancelar', 'Cancelar')), /*#__PURE__*/React.createElement("button", {
    onClick: addExperience,
    disabled: !newExp.company.trim() || !newExp.role.trim(),
    style: {
      flex: 1,
      height: 36,
      borderRadius: 9,
      border: 'none',
      background: 'var(--pg-blue-500)',
      color: '#fff',
      fontWeight: 700,
      fontSize: 13,
      cursor: 'pointer',
      fontFamily: 'inherit',
      opacity: !newExp.company.trim() || !newExp.role.trim() ? 0.4 : 1
    }
  }, s('Save', 'Salvar', 'Guardar')))) : /*#__PURE__*/React.createElement("button", {
    onClick: () => setAddingExp(true),
    style: {
      width: '100%',
      height: 42,
      borderRadius: 10,
      border: '1.5px dashed var(--pg-blue-300)',
      background: 'transparent',
      color: 'var(--pg-blue-600)',
      fontWeight: 600,
      fontSize: 13,
      cursor: 'pointer',
      fontFamily: 'inherit',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6
    }
  }, Icon.plus(14, 'var(--pg-blue-600)'), s('Add experience', 'Adicionar experiência', 'Agregar experiencia')))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 18px',
      flexShrink: 0,
      background: 'var(--pg-bg)',
      borderTop: '0.5px solid var(--pg-ink-200)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: handleSave,
    className: "pg-btn pg-btn-primary",
    style: {
      width: '100%',
      height: 52,
      fontSize: 15,
      borderRadius: 14
    }
  }, s('Save profile', 'Salvar perfil', 'Guardar perfil')))));
}

// ── Public user profile sheet ────────────────────────────────
function PublicProfileSheet({
  open,
  onClose,
  profile,
  lang = 'en',
  onChat
}) {
  const [realRatings, setRealRatings] = React.useState(null);
  const [fetchedProfile, setFetchedProfile] = React.useState(null);
  React.useEffect(() => {
    if (open) {
      _lockScreen();
      return () => _unlockScreen();
    }
  }, [open]);

  // Fetch full profile from Supabase when opened (fills in photo, role, loc, etc.)
  React.useEffect(() => {
    setFetchedProfile(null);
    if (!open || !profile?.uid || !window.sb) return;
    window.sb.from('profiles_public').select('id,name,photo_url,role,verified,region').eq('id', profile.uid).single().then(({
      data
    }) => {
      if (data) setFetchedProfile(data);
    }).catch(() => {});
  }, [open, profile?.uid]);

  // Load real ratings from Supabase whenever the profile changes
  React.useEffect(() => {
    setRealRatings(null);
    if (!open || !profile?.uid || !window.sb) return;
    // Visible once either: revealed (both sides rated) or the 7-day blind window expired
    window.sb.from('ratings').select('id,stars,comment,from_id,from_name,listing_name,created_at').eq('to_id', profile.uid).or('pending.eq.false,expires_at.lt.' + new Date().toISOString()).order('created_at', {
      ascending: false
    }).limit(20).then(({
      data
    }) => {
      setRealRatings(data || []);
    }).catch(() => {
      setRealRatings([]);
    });
  }, [open, profile?.uid]);
  if (!open || !profile) return null;
  const name = fetchedProfile?.name || profile.name || 'User';
  const photo = fetchedProfile?.photo_url || profile.photo || undefined;
  const loc = fetchedProfile?.region || profile.loc || 'South Florida';

  // Use real ratings if loaded, otherwise fall back to profile prop
  const ratingList = realRatings || [];
  const completedRat = ratingList.filter(r => r.stars);
  const avgRating = completedRat.length > 0 ? Math.round(completedRat.reduce((s, r) => s + r.stars, 0) / completedRat.length * 10) / 10 : null;
  const reviewCount = completedRat.length;

  // If Supabase data is loaded use it; otherwise fall back to profile prop
  const hasRating = realRatings !== null ? reviewCount > 0 : profile.rating !== undefined && profile.rating !== null;
  const rating = realRatings !== null ? avgRating : profile.rating ?? 4.8;
  const reviews = realRatings !== null ? reviewCount : profile.reviews ?? 0;
  const jobs = profile.jobs !== undefined ? profile.jobs : reviews;
  const msgLbl = lang === 'pt' ? 'Mensagem' : lang === 'es' ? 'Mensaje' : 'Message';
  const jobsLbl = lang === 'pt' ? 'Trabalhos' : lang === 'es' ? 'Trabajos' : 'Jobs';
  const ratingLbl = lang === 'pt' ? 'Avaliação' : lang === 'es' ? 'Calificación' : 'Rating';
  const verifiedLbl = lang === 'pt' ? 'Perfil verificado' : lang === 'es' ? 'Perfil verificado' : 'Verified profile';
  return /*#__PURE__*/React.createElement("div", {
    className: "pg-sheet-backdrop",
    style: {
      zIndex: 1100
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "pg-sheet",
    style: {
      padding: '0 0 36px',
      zIndex: 1101
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "pg-sheet-grabber"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(145deg, #040D18, #071A2E)',
      padding: '20px 20px 28px',
      textAlign: 'center',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      position: 'absolute',
      top: 12,
      right: 14,
      border: 'none',
      background: 'rgba(255,255,255,0.12)',
      width: 28,
      height: 28,
      borderRadius: '50%',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, Icon.x(13, '#fff')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-block',
      position: 'relative',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 3,
      borderRadius: '50%',
      background: 'linear-gradient(135deg,var(--pg-aqua-500),#0D7280)'
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: name,
    size: 72,
    src: photo
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 2,
      right: 2,
      width: 20,
      height: 20,
      borderRadius: '50%',
      background: 'var(--pg-aqua-500)',
      border: '2px solid #040D18',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, Icon.check(10, '#fff'))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--pg-font-display)',
      fontSize: 20,
      fontWeight: 700,
      color: '#fff',
      letterSpacing: '-0.02em'
    }
  }, name), fetchedProfile?.tier === 'premium' && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 800,
      padding: '2px 8px',
      borderRadius: 999,
      background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
      color: '#fff',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      letterSpacing: '.04em'
    }
  }, Icon.crown(9, '#fff'), " PREMIUM"), fetchedProfile?.tier === 'pro' && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 800,
      padding: '2px 8px',
      borderRadius: 999,
      background: 'linear-gradient(135deg,#0c4a6e,#0077B6)',
      color: '#fff',
      letterSpacing: '.04em'
    }
  }, "PRO")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.50)',
      marginTop: 4,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5
    }
  }, Icon.pin(10, 'rgba(255,255,255,0.45)'), " ", loc), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      background: 'rgba(14,186,199,0.18)',
      border: '1px solid rgba(14,186,199,0.35)',
      borderRadius: 999,
      padding: '3px 10px'
    }
  }, Icon.check(10, 'var(--pg-aqua-400)'), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10.5,
      fontWeight: 600,
      color: 'var(--pg-aqua-300,#6DD8F0)'
    }
  }, verifiedLbl)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      marginTop: 18,
      paddingTop: 14,
      borderTop: '1px solid rgba(255,255,255,0.10)',
      gap: 0
    }
  }, [{
    val: hasRating ? rating : '—',
    lbl: ratingLbl
  }, {
    val: jobs || '0',
    lbl: jobsLbl
  }, {
    val: reviews > 50 ? '⭐ Pro' : reviews > 20 ? 'Expert' : reviews > 0 ? 'Active' : lang === 'pt' ? 'Novo' : lang === 'es' ? 'Nuevo' : 'New',
    lbl: 'Trust'
  }].map((s, i, arr) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--pg-font-display)',
      fontSize: 20,
      fontWeight: 700,
      color: '#fff',
      letterSpacing: '-0.02em',
      lineHeight: 1
    }
  }, s.val), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9.5,
      color: 'rgba(255,255,255,0.45)',
      marginTop: 3,
      fontWeight: 600,
      letterSpacing: '0.05em',
      textTransform: 'uppercase'
    }
  }, s.lbl)), i < arr.length - 1 && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1,
      background: 'rgba(255,255,255,0.12)',
      margin: '0 4px'
    }
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 20px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, hasRating ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Stars, {
    rating: rating,
    size: 16
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--pg-font-display)',
      fontSize: 16,
      fontWeight: 700,
      color: 'var(--pg-ink-900)'
    }
  }, rating), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'var(--pg-ink-500)'
    }
  }, "(", reviews, " ", lang === 'pt' ? 'avaliações' : lang === 'es' ? 'reseñas' : 'reviews', ")")) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '10px 14px',
      borderRadius: 12,
      background: 'var(--pg-ink-50)',
      border: '1px solid var(--pg-ink-200)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16
    }
  }, "\uD83C\uDF31"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--pg-ink-700)'
    }
  }, lang === 'pt' ? 'Novo membro' : lang === 'es' ? 'Nuevo miembro' : 'New member'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: 'var(--pg-ink-400)',
      marginTop: 1
    }
  }, lang === 'pt' ? 'Ainda sem avaliações' : lang === 'es' ? 'Aún sin reseñas' : 'No reviews yet'))), reviews > 50 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '10px 14px',
      borderRadius: 12,
      background: 'linear-gradient(135deg,var(--pg-navy-800),var(--pg-blue-700))',
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 22
    }
  }, "\u2B50"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700
    }
  }, "Pool Guy PRO"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      opacity: 0.65,
      marginTop: 1
    }
  }, lang === 'pt' ? `${jobs}+ trabalhos concluídos` : lang === 'es' ? `${jobs}+ trabajos completados` : `${jobs}+ jobs completed`))), realRatings !== null && completedRat.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      fontWeight: 700,
      color: 'var(--pg-ink-400)',
      letterSpacing: '0.07em',
      textTransform: 'uppercase',
      marginBottom: 10
    }
  }, lang === 'pt' ? 'Avaliações' : lang === 'es' ? 'Reseñas' : 'Reviews'), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      maxHeight: 220,
      overflowY: 'auto'
    }
  }, completedRat.slice(0, 8).map(r => /*#__PURE__*/React.createElement("div", {
    key: r.id,
    style: {
      padding: '10px 12px',
      borderRadius: 11,
      background: 'var(--pg-ink-50)',
      border: '1px solid var(--pg-ink-100)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: r.comment ? 6 : 0
    }
  }, /*#__PURE__*/React.createElement(AvatarFetch, {
    uid: r.from_id,
    name: r.from_name || '?',
    size: 26
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      fontWeight: 700,
      color: 'var(--pg-ink-800)',
      flex: 1
    }
  }, r.from_name || '?'), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 1
    }
  }, [1, 2, 3, 4, 5].map(n => /*#__PURE__*/React.createElement("svg", {
    key: n,
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: n <= r.stars ? '#F59E0B' : 'none',
    stroke: n <= r.stars ? '#F59E0B' : 'var(--pg-ink-300)',
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("polygon", {
    points: "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
  }))))), r.comment ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 12.5,
      color: 'var(--pg-ink-600)',
      lineHeight: 1.5
    }
  }, r.comment) : null, r.listing_name && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--pg-ink-400)',
      marginTop: 4
    }
  }, "\uD83C\uDFF7 ", r.listing_name))))), !profile.isSelf && /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      onClose();
      onChat && onChat(profile.uid ? {
        id: profile.uid,
        name
      } : name);
    },
    className: "pg-btn pg-btn-primary",
    style: {
      width: '100%',
      height: 50,
      fontSize: 15,
      borderRadius: 14,
      marginTop: 4
    }
  }, Icon.msg(16, '#fff'), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 6
    }
  }, msgLbl)))));
}

// ── Rating Sheet — submit a pending rating ──────────────────────────────────
function RatingSheet({
  open,
  rating,
  lang,
  currentUser,
  onClose,
  onDone,
  showToast
}) {
  const [stars, setStars] = React.useState(0);
  const [hovered, setHovered] = React.useState(0);
  const [comment, setComment] = React.useState('');
  const [tags, setTags] = React.useState([]);
  const [submitting, setSubmitting] = React.useState(false);
  const [toProfile, setToProfile] = React.useState(null);
  const toggleTag = tag => setTags(p => p.includes(tag) ? p.filter(t => t !== tag) : [...p, tag]);
  React.useEffect(() => {
    if (!open) {
      setStars(0);
      setComment('');
      setTags([]);
      setToProfile(null);
      return;
    }
    if (!rating?.to_id || !window.sb) return;
    window.sb.from('profiles_public').select('name,photo_url').eq('id', rating.to_id).single().then(({
      data
    }) => {
      if (data) setToProfile(data);
    }).catch(() => {});
  }, [open, rating?.to_id]);
  const toName = toProfile?.name || rating?.to_name || '?';
  const labels = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent!'
  };
  const labelspt = {
    1: 'Péssimo',
    2: 'Ruim',
    3: 'Ok',
    4: 'Bom',
    5: 'Excelente!'
  };
  const handleSubmit = async () => {
    if (!stars || !window.sb || !currentUser?.uid || !rating?.to_id) return;
    setSubmitting(true);
    try {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const myName = currentUser.name || currentUser.displayName || '';
      const payload = {
        from_id: currentUser.uid,
        to_id: rating.to_id,
        from_name: myName,
        listing_name: rating.listing_name || rating.to_name || null,
        stars,
        comment: comment || null,
        tags: tags.length > 0 ? tags : null,
        pending: true,
        connection_type: rating.connection_type || null,
        connection_id: rating.connection_id || null,
        expires_at: expiresAt
      };
      // "from_id,to_id" was never a real constraint on this table — every
      // upsert with that onConflict target hard-failed (42P10: no matching
      // unique/exclusion constraint), so no seller-rates-buyer submission
      // through this sheet ever actually saved. Target the row we already
      // know (from a pre-created placeholder) when we have its id; otherwise
      // upsert against the connection-based unique index.
      const {
        error
      } = rating.id ? await window.sb.from('ratings').update(payload).eq('id', rating.id) : await window.sb.from('ratings').upsert(payload, {
        onConflict: 'connection_type,connection_id,from_id'
      });
      if (error) throw error;
      // Reveals both ratings to each other if the other side already submitted theirs
      window.sb.rpc('reveal_mutual_rating', {
        p_a: currentUser.uid,
        p_b: rating.to_id
      }).catch(() => {});
      if (window.sendPush && rating.to_id) {
        const msg = lang === 'pt' ? `${myName} avaliou você! Avalie-o também.` : `${myName} rated you! Rate them back.`;
        window.sendPush(rating.to_id, myName, msg, '/#home', 'rating');
      }
      showToast && showToast('⭐ ' + (lang === 'pt' ? 'Avaliação enviada!' : 'Rating submitted!'));
      onDone && onDone(rating.id);
    } catch (e) {
      showToast && showToast('❌ ' + (e.message || 'Error'));
      setSubmitting(false);
    }
  };
  return /*#__PURE__*/React.createElement(Sheet, {
    open: open,
    onClose: onClose,
    height: "auto"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 18px 32px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: toName,
    size: 64,
    src: toProfile?.photo_url || undefined
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 800,
      color: 'var(--pg-ink-900)',
      fontFamily: 'var(--pg-font-display)',
      marginTop: 12
    }
  }, lang === 'pt' ? `Avalie ${toName}` : `Rate ${toName}`), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: 'var(--pg-ink-500)',
      marginTop: 4
    }
  }, lang === 'pt' ? 'Transação' : 'Transaction', ": ", /*#__PURE__*/React.createElement("strong", null, "\"", rating?.listing_name || '', "\""))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      gap: 6,
      marginBottom: 6
    }
  }, [1, 2, 3, 4, 5].map(n => /*#__PURE__*/React.createElement("button", {
    key: n,
    onClick: () => setStars(n),
    onMouseEnter: () => setHovered(n),
    onMouseLeave: () => setHovered(0),
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '4px',
      lineHeight: 1,
      transition: 'transform .1s',
      transform: (hovered || stars) >= n ? 'scale(1.18)' : 'scale(1)'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "38",
    height: "38",
    viewBox: "0 0 24 24",
    fill: (hovered || stars) >= n ? '#F59E0B' : 'none',
    stroke: (hovered || stars) >= n ? '#F59E0B' : 'var(--pg-ink-300)',
    strokeWidth: "1.8",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("polygon", {
    points: "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      height: 20,
      marginBottom: 16
    }
  }, (hovered || stars) > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: '#F59E0B'
    }
  }, lang === 'pt' ? labelspt[hovered || stars] : labels[hovered || stars])), stars >= 4 && /*#__PURE__*/React.createElement(RatingTagPicker, {
    lang: lang,
    selected: tags,
    onToggle: toggleTag
  }), /*#__PURE__*/React.createElement("textarea", {
    value: comment,
    onChange: e => setComment(e.target.value),
    placeholder: lang === 'pt' ? 'Comentário opcional (max 280 caracteres)...' : 'Optional comment (max 280 chars)...',
    maxLength: 280,
    style: {
      width: '100%',
      minHeight: 80,
      borderRadius: 12,
      border: '1.5px solid var(--pg-ink-200)',
      padding: '10px 12px',
      fontFamily: 'inherit',
      fontSize: 14,
      resize: 'none',
      background: 'var(--pg-white)',
      color: 'var(--pg-ink-900)',
      outline: 'none',
      boxSizing: 'border-box'
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: handleSubmit,
    disabled: !stars || submitting,
    style: {
      width: '100%',
      marginTop: 12,
      padding: '15px',
      borderRadius: 14,
      border: 'none',
      cursor: stars ? 'pointer' : 'default',
      fontFamily: 'inherit',
      fontSize: 15,
      fontWeight: 700,
      color: '#fff',
      background: stars ? 'linear-gradient(135deg,#F59E0B,#D97706)' : 'var(--pg-ink-200)',
      opacity: submitting ? 0.7 : 1,
      transition: 'all .15s'
    }
  }, submitting ? '...' : lang === 'pt' ? 'Enviar avaliação' : 'Submit Rating'), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      width: '100%',
      marginTop: 10,
      padding: '12px',
      borderRadius: 14,
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'inherit',
      fontSize: 13,
      fontWeight: 600,
      background: 'var(--pg-ink-100)',
      color: 'var(--pg-ink-600)'
    }
  }, lang === 'pt' ? 'Avaliar depois' : 'Rate Later')));
}

// ── Help & Support sheet ──────────────────────────────────────
function HelpSheet({
  open,
  onClose,
  lang = 'en'
}) {
  React.useEffect(() => {
    if (open) {
      _lockScreen();
      return () => _unlockScreen();
    }
  }, [open]);
  if (!open) return null;
  const title = lang === 'pt' ? 'Ajuda & Suporte' : lang === 'es' ? 'Ayuda y Soporte' : 'Help & Support';
  const items = lang === 'pt' ? [{
    icon: '📖',
    title: 'Como usar o app',
    sub: 'Guia rápido para pool guys'
  }, {
    icon: '💳',
    title: 'Assinatura e pagamento',
    sub: 'Planos, cobranças e cancelamento'
  }, {
    icon: '🔔',
    title: 'Notificações',
    sub: 'Configure alertas de trabalho por região'
  }, {
    icon: '🤝',
    title: 'Como aplicar para vagas',
    sub: 'Candidaturas e contato com clientes'
  }, {
    icon: '⭐',
    title: 'Avaliações e reputação',
    sub: 'Como funciona o Trust Score'
  }, {
    icon: '📧',
    title: 'Falar com a equipe',
    sub: 'suporte@poolguyapp.com',
    action: () => window.open('mailto:suporte@poolguyapp.com')
  }] : lang === 'es' ? [{
    icon: '📖',
    title: 'Cómo usar la app',
    sub: 'Guía rápida para pool guys'
  }, {
    icon: '💳',
    title: 'Suscripción y pago',
    sub: 'Planes, cobros y cancelación'
  }, {
    icon: '🔔',
    title: 'Notificaciones',
    sub: 'Configura alertas de trabajo por región'
  }, {
    icon: '🤝',
    title: 'Cómo postular a empleos',
    sub: 'Solicitudes y contacto con clientes'
  }, {
    icon: '⭐',
    title: 'Reseñas y reputación',
    sub: 'Cómo funciona el Trust Score'
  }, {
    icon: '📧',
    title: 'Hablar con el equipo',
    sub: 'support@poolguyapp.com',
    action: () => window.open('mailto:support@poolguyapp.com')
  }] : [{
    icon: '📖',
    title: 'How to use the app',
    sub: 'Quick guide for pool guys'
  }, {
    icon: '💳',
    title: 'Subscription & billing',
    sub: 'Plans, charges and cancellation'
  }, {
    icon: '🔔',
    title: 'Notifications',
    sub: 'Configure job alerts by region & day'
  }, {
    icon: '🤝',
    title: 'How to apply for jobs',
    sub: 'Applications and contacting clients'
  }, {
    icon: '⭐',
    title: 'Reviews & reputation',
    sub: 'How the Trust Score works'
  }, {
    icon: '📧',
    title: 'Contact the team',
    sub: 'support@poolguyapp.com',
    action: () => window.open('mailto:support@poolguyapp.com')
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "pg-sheet-backdrop",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "pg-sheet",
    style: {
      padding: '0 0 36px'
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "pg-sheet-grabber"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 18px 16px',
      borderBottom: '0.5px solid var(--pg-ink-200)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 18,
      fontWeight: 700,
      letterSpacing: '-0.02em'
    }
  }, title), /*#__PURE__*/React.createElement("button", {
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
      padding: '12px 18px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: 0
    }
  }, items.map((item, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    onClick: item.action || undefined,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '14px 0',
      border: 'none',
      background: 'transparent',
      cursor: item.action ? 'pointer' : 'default',
      textAlign: 'left',
      fontFamily: 'inherit',
      borderBottom: i < items.length - 1 ? '0.5px solid var(--pg-ink-100)' : 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 40,
      borderRadius: 11,
      background: 'var(--pg-blue-50)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 20,
      flexShrink: 0
    }
  }, item.icon), /*#__PURE__*/React.createElement("div", {
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
  }, item.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: item.action ? 'var(--pg-blue-500)' : 'var(--pg-ink-500)',
      marginTop: 2
    }
  }, item.sub)), item.action && Icon.chev(14, 'var(--pg-ink-400)')))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '20px 0 0',
      fontSize: 11,
      color: 'var(--pg-ink-400)'
    }
  }, "PoolGuyX \xB7 v2.5.0 Beta")));
}

// ── Privacy sheet ─────────────────────────────────────────────
function PrivacySheet({
  open,
  onClose,
  lang = 'en'
}) {
  React.useEffect(() => {
    if (open) {
      _lockScreen();
      return () => _unlockScreen();
    }
  }, [open]);
  if (!open) return null;
  const title = lang === 'pt' ? 'Privacidade' : lang === 'es' ? 'Privacidad' : 'Privacy';
  const sections = lang === 'pt' ? [{
    title: 'Dados coletados',
    body: 'Coletamos apenas os dados necessários para o funcionamento do app: nome, e-mail, telefone e localização geral (condado/cidade). Nunca compartilhamos seus dados pessoais com terceiros sem sua autorização.'
  }, {
    title: 'Localização',
    body: 'O app usa sua localização apenas para mostrar trabalhos próximos. A localização exata nunca é armazenada nem compartilhada com outros usuários.'
  }, {
    title: 'Comunicação',
    body: 'Usamos seu e-mail para enviar notificações de trabalho e atualizações importantes. Você pode cancelar a qualquer momento nas configurações.'
  }, {
    title: 'Exclusão de conta',
    body: 'Para excluir sua conta e todos os seus dados, entre em contato com suporte@poolguyapp.com. Processamos pedidos em até 7 dias úteis.'
  }] : lang === 'es' ? [{
    title: 'Datos recopilados',
    body: 'Solo recopilamos los datos necesarios para el funcionamiento de la app: nombre, email, teléfono y ubicación general. Nunca compartimos tus datos personales con terceros.'
  }, {
    title: 'Ubicación',
    body: 'La app usa tu ubicación solo para mostrar trabajos cercanos. La ubicación exacta nunca se almacena ni se comparte con otros usuarios.'
  }, {
    title: 'Comunicación',
    body: 'Usamos tu email para enviarte notificaciones de trabajo. Puedes cancelar en cualquier momento en la configuración.'
  }, {
    title: 'Eliminación de cuenta',
    body: 'Para eliminar tu cuenta, contacta a support@poolguyapp.com. Procesamos solicitudes en hasta 7 días hábiles.'
  }] : [{
    title: 'Data collected',
    body: 'We only collect the data necessary for the app to work: name, email, phone, and general location (county/city). We never share your personal data with third parties without your consent.'
  }, {
    title: 'Location',
    body: 'The app uses your location only to show nearby jobs. Your exact location is never stored or shared with other users.'
  }, {
    title: 'Communication',
    body: 'We use your email to send job notifications and important updates. You can opt out at any time in settings.'
  }, {
    title: 'Account deletion',
    body: 'To delete your account and all your data, contact support@poolguyapp.com. We process requests within 7 business days.'
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "pg-sheet-backdrop",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "pg-sheet",
    style: {
      padding: '0 0 36px'
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "pg-sheet-grabber"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 18px 16px',
      borderBottom: '0.5px solid var(--pg-ink-200)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 18,
      fontWeight: 700,
      letterSpacing: '-0.02em'
    }
  }, title), /*#__PURE__*/React.createElement("button", {
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
      padding: '18px 18px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      maxHeight: 400,
      overflowY: 'auto'
    }
  }, sections.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: 'var(--pg-ink-900)',
      marginBottom: 6
    }
  }, s.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--pg-ink-600)',
      lineHeight: 1.55
    }
  }, s.body))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--pg-ink-400)',
      paddingBottom: 4
    }
  }, lang === 'pt' ? 'Última atualização: maio de 2026' : lang === 'es' ? 'Última actualización: mayo 2026' : 'Last updated: May 2026'))));
}

// ── Buyer Rating Prompt Modal — centered popup (not a bottom sheet) ───────────
// Shown automatically when buyer has a pending rating to submit
function BuyerRatingPromptModal({
  open,
  pendingRatings = [],
  lang = 'en',
  currentUser,
  onRateNow,
  onClose,
  showToast
}) {
  const [toProfile, setToProfile] = React.useState(null);
  const [stars, setStars] = React.useState(0);
  const [hovered, setHovered] = React.useState(0);
  const [comment, setComment] = React.useState('');
  const [tags, setTags] = React.useState([]);
  const [submitting, setSubmitting] = React.useState(false);
  const toggleTag = tag => setTags(p => p.includes(tag) ? p.filter(t => t !== tag) : [...p, tag]);
  const rating = pendingRatings[0] || null;

  // rating.from_id = the person who rated ME; I need to rate them back
  React.useEffect(() => {
    if (!open || !rating?.from_id || !window.sb) {
      setToProfile(null);
      setStars(0);
      setComment('');
      setTags([]);
      return;
    }
    window.sb.from('profiles_public').select('name,photo_url').eq('id', rating.from_id).single().then(({
      data
    }) => {
      if (data) setToProfile(data);
    }).catch(() => {});
  }, [open, rating?.from_id]);
  if (!open || !rating) return null;
  const toName = toProfile?.name || rating.from_name || '?';
  const listingName = rating.listing_name || '';
  const count = pendingRatings.length;
  const labels = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent!'
  };
  const labelspt = {
    1: 'Péssimo',
    2: 'Ruim',
    3: 'Ok',
    4: 'Bom',
    5: 'Excelente!'
  };
  const handleSubmit = async () => {
    if (!stars || !window.sb || !currentUser?.uid || !rating?.from_id) return;
    setSubmitting(true);
    try {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const myName = currentUser.name || currentUser.displayName || '';
      const {
        error
      } = await window.sb.from('ratings').upsert({
        from_id: currentUser.uid,
        to_id: rating.from_id,
        from_name: myName,
        listing_name: rating.listing_name || null,
        stars,
        comment: comment || null,
        tags: tags.length > 0 ? tags : null,
        pending: true,
        connection_type: rating.connection_type || null,
        connection_id: rating.connection_id || null,
        expires_at: expiresAt
      }, {
        onConflict: 'from_id,to_id'
      });
      if (error) throw error;
      // Both sides have now submitted — reveal both ratings to each other
      window.sb.rpc('reveal_mutual_rating', {
        p_a: currentUser.uid,
        p_b: rating.from_id
      }).catch(() => {});
      if (window.sendPush && rating.from_id) {
        const msg = lang === 'pt' ? `${myName} também te avaliou! Ambas as avaliações agora estão visíveis.` : `${myName} also rated you! Both ratings are now visible.`;
        window.sendPush(rating.from_id, myName, msg, '/#home', 'rating');
      }
      showToast && showToast('⭐ ' + (lang === 'pt' ? 'Avaliação enviada!' : 'Rating submitted!'));
      onRateNow && onRateNow(null);
    } catch (e) {
      showToast && showToast('❌ ' + (e.message || 'Error'));
      setSubmitting(false);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 2000,
      background: 'rgba(0,0,0,0.55)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      backdropFilter: 'blur(3px)',
      animation: 'fadeIn .18s ease-out'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: '100%',
      maxWidth: 380,
      background: 'var(--pg-white)',
      borderRadius: 24,
      padding: '28px 24px 24px',
      boxShadow: '0 24px 80px rgba(0,0,0,0.30)',
      animation: 'slideUp .22s ease-out'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: toName,
    size: 64,
    src: toProfile?.photo_url || undefined
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: -4,
      right: -4,
      width: 22,
      height: 22,
      borderRadius: '50%',
      background: 'linear-gradient(135deg,#F59E0B,#D97706)',
      border: '2px solid var(--pg-white)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 24 24",
    fill: "#fff",
    stroke: "#fff",
    strokeWidth: "1"
  }, /*#__PURE__*/React.createElement("polygon", {
    points: "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 800,
      color: 'var(--pg-ink-900)',
      fontFamily: 'var(--pg-font-display)',
      marginBottom: 4
    }
  }, lang === 'pt' ? `Avalie ${toName}` : lang === 'es' ? `Evalúa a ${toName}` : `Rate ${toName}`), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: 'var(--pg-ink-500)',
      textAlign: 'center',
      lineHeight: 1.5
    }
  }, lang === 'pt' ? listingName ? `Transação: "${listingName}"` : 'Avalie para revelar a nota deles' : lang === 'es' ? listingName ? `Transacción: "${listingName}"` : 'Evalúa para revelar su calificación' : listingName ? `Transaction: "${listingName}"` : 'Rate them to reveal their rating', count > 1 && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 8,
      fontSize: 11,
      fontWeight: 700,
      padding: '2px 7px',
      borderRadius: 6,
      background: 'var(--pg-blue-500)',
      color: '#fff',
      verticalAlign: 'middle'
    }
  }, "+", count - 1))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      gap: 4,
      marginBottom: 6
    }
  }, [1, 2, 3, 4, 5].map(n => /*#__PURE__*/React.createElement("button", {
    key: n,
    onClick: () => setStars(n),
    onMouseEnter: () => setHovered(n),
    onMouseLeave: () => setHovered(0),
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '4px',
      lineHeight: 1,
      transition: 'transform .12s',
      transform: (hovered || stars) >= n ? 'scale(1.22)' : 'scale(1)'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "40",
    height: "40",
    viewBox: "0 0 24 24",
    fill: (hovered || stars) >= n ? '#F59E0B' : 'none',
    stroke: (hovered || stars) >= n ? '#F59E0B' : 'var(--pg-ink-200)',
    strokeWidth: "1.8",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("polygon", {
    points: "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      height: 22,
      marginBottom: 14
    }
  }, (hovered || stars) > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: '#F59E0B'
    }
  }, lang === 'pt' ? labelspt[hovered || stars] : labels[hovered || stars])), stars >= 4 && /*#__PURE__*/React.createElement(RatingTagPicker, {
    lang: lang,
    selected: tags,
    onToggle: toggleTag
  }), /*#__PURE__*/React.createElement("textarea", {
    value: comment,
    onChange: e => setComment(e.target.value),
    placeholder: lang === 'pt' ? 'Comentário opcional...' : lang === 'es' ? 'Comentario opcional...' : 'Optional comment...',
    maxLength: 280,
    rows: 3,
    style: {
      width: '100%',
      borderRadius: 13,
      border: '1.5px solid var(--pg-ink-200)',
      padding: '10px 12px',
      fontFamily: 'inherit',
      fontSize: 14,
      resize: 'none',
      background: 'var(--pg-ink-50)',
      color: 'var(--pg-ink-900)',
      outline: 'none',
      boxSizing: 'border-box',
      lineHeight: 1.5,
      marginBottom: 14,
      transition: 'border-color .15s'
    },
    onFocus: e => e.target.style.borderColor = 'var(--pg-blue-300)',
    onBlur: e => e.target.style.borderColor = 'var(--pg-ink-200)'
  }), /*#__PURE__*/React.createElement("button", {
    onClick: handleSubmit,
    disabled: !stars || submitting,
    style: {
      width: '100%',
      padding: '15px',
      borderRadius: 14,
      border: 'none',
      cursor: stars ? 'pointer' : 'default',
      fontFamily: 'inherit',
      fontSize: 15,
      fontWeight: 700,
      color: '#fff',
      marginBottom: 10,
      background: stars ? 'linear-gradient(135deg,#F59E0B,#D97706)' : 'var(--pg-ink-200)',
      boxShadow: stars ? '0 4px 16px rgba(245,158,11,0.35)' : 'none',
      opacity: submitting ? 0.7 : 1,
      transition: 'all .15s'
    }
  }, submitting ? '...' : lang === 'pt' ? 'Enviar avaliação' : lang === 'es' ? 'Enviar evaluación' : 'Submit Rating'), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      width: '100%',
      padding: '12px',
      borderRadius: 14,
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      fontFamily: 'inherit',
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--pg-ink-400)'
    }
  }, lang === 'pt' ? 'Avaliar depois' : lang === 'es' ? 'Evaluar después' : 'Rate Later')));
}
Object.assign(window, {
  ChatSheet,
  NotificationsSheet,
  PaywallSheet,
  PostMenuSheet,
  Toast,
  LanguagePickerSheet,
  ApplicantsSheet,
  VerificationSheet,
  PushNotifSheet,
  WalletSheet,
  WorkLifecycleSheet,
  ReviewSheet,
  HiringAppDetailSheet,
  ApplyJobSheet,
  EditProfileSheet,
  PublicProfileSheet,
  HelpSheet,
  PrivacySheet,
  BuyerRatingPromptModal
});