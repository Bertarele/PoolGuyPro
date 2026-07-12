// quickpools.jsx — Express Pools live feed + posting + push notifications

function ConfirmModal({ message, subMessage, confirmLabel, onConfirm, onCancel, lang='pt' }) {
  return (
    <div style={{
      position:'fixed', inset:0, zIndex:10000,
      background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'flex-end', justifyContent:'center',
    }}>
      <div style={{
        width:'100%', maxWidth:520, background:'var(--pg-white)',
        borderRadius:'20px 20px 0 0', padding:'24px 20px 36px',
        boxShadow:'0 -8px 32px rgba(0,0,0,0.2)',
      }}>
        <div style={{width:40, height:4, borderRadius:4, background:'var(--pg-ink-200)', margin:'0 auto 20px'}}/>
        <div style={{fontSize:18, fontWeight:800, color:'var(--pg-ink-900)', textAlign:'center', marginBottom:subMessage ? 8 : 20}}>
          {message}
        </div>
        {subMessage && (
          <div style={{fontSize:14, color:'var(--pg-ink-500)', textAlign:'center', marginBottom:20, lineHeight:1.4}}>
            {subMessage}
          </div>
        )}
        <div style={{display:'flex', gap:10}}>
          <button onClick={onCancel} style={{
            flex:1, height:48, borderRadius:14, border:'1px solid var(--pg-ink-200)',
            background:'var(--pg-ink-50)', color:'var(--pg-ink-700)', fontSize:15, fontWeight:600, cursor:'pointer',
          }}>
            {lang==='pt'?'Cancelar':lang==='es'?'Cancelar':'Cancel'}
          </button>
          <button onClick={onConfirm} style={{
            flex:1, height:48, borderRadius:14, border:'none',
            background:'linear-gradient(135deg,#DC2626,#EF4444)', color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer',
            boxShadow:'0 4px 12px rgba(220,38,38,0.35)',
          }}>
            {confirmLabel || (lang==='pt'?'Confirmar':lang==='es'?'Confirmar':'Confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}

function ExtendJobModal({ onExtend, onCancel, lang='pt' }) {
  const opts = [
    { hours:6,  label: lang==='pt'?'+6 horas':lang==='es'?'+6 horas':'+6 hours' },
    { hours:12, label: lang==='pt'?'+12 horas':lang==='es'?'+12 horas':'+12 hours' },
    { hours:24, label: lang==='pt'?'+1 dia':lang==='es'?'+1 día':'+1 day' },
    { hours:72, label: lang==='pt'?'+3 dias':lang==='es'?'+3 días':'+3 days' },
  ];
  return (
    <div style={{
      position:'fixed', inset:0, zIndex:10000,
      background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'flex-end', justifyContent:'center',
    }}>
      <div style={{
        width:'100%', maxWidth:520, background:'var(--pg-white)',
        borderRadius:'20px 20px 0 0', padding:'24px 20px 36px',
        boxShadow:'0 -8px 32px rgba(0,0,0,0.2)',
      }}>
        <div style={{width:40, height:4, borderRadius:4, background:'var(--pg-ink-200)', margin:'0 auto 20px'}}/>
        <div style={{fontSize:18, fontWeight:800, color:'var(--pg-ink-900)', textAlign:'center', marginBottom:8}}>
          {lang==='pt'?'Sua vaga está prestes a expirar':lang==='es'?'Tu vacante está por expirar':'Your job posting is about to expire'}
        </div>
        <div style={{fontSize:14, color:'var(--pg-ink-500)', textAlign:'center', marginBottom:20, lineHeight:1.4}}>
          {lang==='pt'?'Deseja estender e por quantos dias a mais?':lang==='es'?'¿Deseas extenderla y por cuánto tiempo?':'Would you like to extend it, and by how long?'}
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10}}>
          {opts.map(o => (
            <button key={o.hours} onClick={()=>onExtend(o.hours)} style={{
              height:48, borderRadius:14, border:'1px solid var(--pg-blue-200)',
              background:'var(--pg-blue-50)', color:'var(--pg-blue-700)', fontSize:14, fontWeight:700, cursor:'pointer',
            }}>
              {o.label}
            </button>
          ))}
        </div>
        <button onClick={onCancel} style={{
          width:'100%', height:44, borderRadius:14, border:'1px solid var(--pg-ink-200)',
          background:'var(--pg-ink-50)', color:'var(--pg-ink-700)', fontSize:14, fontWeight:600, cursor:'pointer',
        }}>
          {lang==='pt'?'Deixar expirar':lang==='es'?'Dejar expirar':'Let it expire'}
        </button>
      </div>
    </div>
  );
}

class JobDetailBoundary extends React.Component {
  constructor(props) { super(props); this.state = { err: null }; }
  static getDerivedStateFromError(e) { return { err: e }; }
  render() {
    if (this.state.err) {
      return React.createElement('div', { style: { padding: '24px 18px' } },
        React.createElement('div', { style: { fontWeight: 700, color: '#DC2626', marginBottom: 8 } }, 'Erro ao carregar detalhes'),
        React.createElement('pre', { style: { fontSize: 11, color: '#7F1D1D', whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: '#FEF2F2', padding: 10, borderRadius: 8 } },
          this.state.err && (this.state.err.message + '\n' + (this.state.err.stack || ''))
        ),
        React.createElement('button', { onClick: this.props.onClose, style: { marginTop: 12, padding: '8px 16px', borderRadius: 8, border: 'none', background: '#DC2626', color: '#fff', cursor: 'pointer' } }, 'Fechar')
      );
    }
    return this.props.children;
  }
}

function QuickPoolsScreen({ ctx }) {
  const { lang, user, openPaywall, openChat, openPost, openEditPost, openRegionEditor, regionsByDay, county, hasUnreadChat, openNotifications, hasUnreadNotif, darkMode=false, openPublicProfile, goTab, showToast } = ctx;
  const t = STRINGS[lang];
  const [selected,    setSelected]    = React.useState(null);
  const [highlighted, setHighlighted] = React.useState(null);
  const [applied,     setApplied]     = React.useState({});
  const [isDesktop,   setIsDesktop]   = React.useState(() => window.innerWidth >= 900);
  const [myAcceptedJobIds, setMyAcceptedJobIds] = React.useState(new Set());
  const [myDoneJobIds,    setMyDoneJobIds]    = React.useState(new Map()); // jobId -> doneAt Date
  const [historyJobs,     setHistoryJobs]     = React.useState([]);
  const [showHistory,     setShowHistory]     = React.useState(false);
  const [confirmDialog, setConfirmDialog] = React.useState(null); // { message, subMessage, confirmLabel, onConfirm }
  const [extendDialog,  setExtendDialog]  = React.useState(null); // jobId of the job being offered an extension

  // Live jobs from Supabase — no demo/seed fallback, only real postings
  const [jobs, setJobs] = React.useState([]);
  const [jobsLoading, setJobsLoading] = React.useState(false);



  // Push notification status: 'checking' | 'needed' | 'active' | 'denied' | 'unsupported'
  const [notifStatus, setNotifStatus] = React.useState('checking');
  const [notifHelpOpen, setNotifHelpOpen] = React.useState(false);

  const checkNotifStatus = React.useCallback(async () => {
    if (typeof Notification === 'undefined' || !('PushManager' in window)) {
      setNotifStatus('unsupported'); return;
    }
    const perm = Notification.permission;
    if (perm === 'denied') { setNotifStatus('denied'); return; }
    if (perm === 'default') { setNotifStatus('needed'); return; }
    // Permission granted — verify an actual push subscription exists
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        setNotifStatus(sub ? 'active' : 'needed');
      } else { setNotifStatus('active'); }
    } catch { setNotifStatus('active'); }
  }, []);

  React.useEffect(() => { checkNotifStatus(); }, [checkNotifStatus]);

  const activatePush = React.useCallback(async () => {
    if (Notification.permission === 'denied') { setNotifHelpOpen(true); return; }
    // retryPush calls _registerPush(true) — triggers the browser permission prompt
    if (ctx.retryPush) { await ctx.retryPush(); await checkNotifStatus(); return; }
    if (ctx.registerPush) await ctx.registerPush(true);
    await checkNotifStatus();
  }, [ctx.retryPush, ctx.registerPush, checkNotifStatus]);

  // Auto-prompt when tab opens and permission not yet decided
  const autoPromptedRef = React.useRef(false);
  React.useEffect(() => {
    if (notifStatus === 'needed' && !autoPromptedRef.current) {
      autoPromptedRef.current = true;
      setTimeout(() => activatePush(), 700);
    }
  }, [notifStatus, activatePush]);

  const loadJobs = React.useCallback(async () => {
    if (!window.sb) return;
    setJobsLoading(true);
    try {
      window.sb.rpc('cleanup_quick_pool_jobs').then(()=>{}).catch(()=>{});
      const { data } = await window.sb.from('quick_pool_jobs')
        .select('*').in('status',['open','filled']).order('created_at',{ ascending:false }).limit(50);
      {
        // Expire jobs past their expires_at locally too, in case the RPC above hasn't landed yet
        const now = Date.now();
        const active = (data || []).filter(j => {
          const exp = j.expires_at ? new Date(j.expires_at).getTime() : (new Date(j.created_at).getTime() + 24*60*60*1000);
          return !(j.status === 'open' && now > exp);
        });
        setJobs(active.map(j => ({
          id: j.id, _live: true,
          title: { en: j.title || `Pool job in ${j.city}`, pt: j.title || `Vaga em ${j.city}`, es: j.title || `Vaga en ${j.city}` },
          loc: j.city, dist: { en:'', pt:'', es:'' },
          price: j.price_negotiable ? 'neg' : j.price_per_pool,
          type: j.pool_type || 'residential',
          urgency: 'new',
          poster: j.poster_name,
          poster_phone: j.poster_phone,
          pool_address: j.pool_address,
          poster_id: j.poster_id,
          when: { en: j.when_label||'', pt: j.when_label||'', es: j.when_label||'' },
          pools: j.pools_count || 1,
          day_of_week: j.day_of_week,
          time_slot: j.time_slot || '',
          extras: j.extras || null,
          required_photos: j.required_photos || [],
          body: { en: j.description||'', pt: j.description||'', es: j.description||'' },
          created_at: j.created_at,
          expires_at: j.expires_at,
          status: j.status,
        })));
      }
    } catch {}
    setJobsLoading(false);
  }, []);

  React.useEffect(() => { loadJobs(); }, [loadJobs]);

  // Reload jobs when a new one is posted from the PostQuickPool sheet
  React.useEffect(() => {
    const handler = () => loadJobs();
    window.addEventListener('pgQuickPoolPosted', handler);
    return () => window.removeEventListener('pgQuickPoolPosted', handler);
  }, [loadJobs]);

  const EXTEND_WINDOW_MS = 4 * 60 * 60 * 1000; // extend option only offered once <4h remain
  const formatRemaining = (expiresAt) => {
    const ms = new Date(expiresAt).getTime() - Date.now();
    if (ms <= 0) return null;
    const h = Math.floor(ms / (60*60*1000));
    const m = Math.floor((ms % (60*60*1000)) / (60*1000));
    if (h >= 24) { const d = Math.floor(h/24); return lang==='pt'?`${d}d restantes`:lang==='es'?`${d}d restantes`:`${d}d left`; }
    return lang==='pt'?`${h}h ${m}min restantes`:lang==='es'?`${h}h ${m}min restantes`:`${h}h ${m}min left`;
  };

  // Proactively offer to extend the owner's own soon-to-expire open jobs
  const promptedExpiryRef = React.useRef(new Set());
  React.useEffect(() => {
    if (!user?.uid || extendDialog) return;
    const soon = jobs.find(j => {
      if (!j._live || j.poster_id !== user.uid || j.status !== 'open' || !j.expires_at) return false;
      if (promptedExpiryRef.current.has(j.id)) return false;
      const remainingMs = new Date(j.expires_at).getTime() - Date.now();
      return remainingMs > 0 && remainingMs < EXTEND_WINDOW_MS;
    });
    if (soon) { promptedExpiryRef.current.add(soon.id); setExtendDialog(soon.id); }
  }, [jobs, user?.uid, extendDialog]);

  // Load accepted applications for current user so we can highlight them
  React.useEffect(() => {
    if (!window.sb || !user?.uid) return;
    window.sb.from('quick_pool_applications')
      .select('job_id,pool_guy_done,pool_guy_done_at').eq('applicant_id', user.uid).eq('status', 'accepted')
      .then(({ data }) => {
        if (!data || data.length === 0) return;
        const accepted = new Set();
        const done = new Map();
        data.forEach(r => {
          accepted.add(String(r.job_id));
          if (r.pool_guy_done) done.set(String(r.job_id), r.pool_guy_done_at ? new Date(r.pool_guy_done_at) : new Date(0));
        });
        setMyAcceptedJobIds(accepted);
        setMyDoneJobIds(done);
      });
    // Hydrate `applied` from the DB too — it used to be session-only local state,
    // so a job the user already applied to in a previous session showed the plain
    // "Apply" button again after reload, inviting a duplicate application attempt.
    window.sb.from('quick_pool_applications')
      .select('job_id').eq('applicant_id', user.uid).neq('status', 'withdrawn')
      .then(({ data }) => {
        if (!data || data.length === 0) return;
        setApplied(prev => {
          const next = { ...prev };
          data.forEach(r => { next[r.job_id] = true; });
          return next;
        });
      });
    // Load history: accepted apps where pool_guy_done=true, fetch full job details
    window.sb.from('quick_pool_applications')
      .select('job_id,pool_guy_done_at,submitted_photos,quick_pool_jobs!inner(id,title,city,price_per_pool,price_negotiable,poster_name,poster_id,poster_phone,pool_address,status,created_at,day_of_week,time_slot,when_label,pools_count,pool_type,extras,required_photos,description)')
      .eq('applicant_id', user.uid).eq('status', 'accepted').eq('pool_guy_done', true)
      .order('pool_guy_done_at', { ascending: false }).limit(20)
      .then(({ data }) => {
        if (!data || data.length === 0) return;
        setHistoryJobs(data.map(r => {
          const j = r.quick_pool_jobs;
          return {
            id: j.id, _live: true,
            title: { en: j.title || `Pool job in ${j.city}`, pt: j.title || `Vaga em ${j.city}`, es: j.title || `Vaga en ${j.city}` },
            loc: j.city, dist: { en:'', pt:'', es:'' },
            price: j.price_negotiable ? 'neg' : j.price_per_pool,
            type: j.pool_type || 'residential',
            poster: j.poster_name, poster_id: j.poster_id,
            poster_phone: j.poster_phone, pool_address: j.pool_address,
            when: { en: j.when_label||'', pt: j.when_label||'', es: j.when_label||'' },
            pools: j.pools_count || 1,
            day_of_week: j.day_of_week, time_slot: j.time_slot || '',
            extras: j.extras || null, required_photos: j.required_photos || [],
            body: { en: j.description||'', pt: j.description||'', es: j.description||'' },
            created_at: j.created_at, status: j.status,
            pool_guy_done_at: r.pool_guy_done_at,
            submitted_photos: r.submitted_photos || [],
          };
        }));
      });
  }, [user?.uid]);

  // Capture deep-link job ID from URL on first render, before hash is overwritten by tab sync
  const deepLinkJobId = React.useMemo(() => {
    try {
      const hash = window.location.hash;
      const qs = hash.includes('?') ? hash.split('?')[1] : '';
      return new URLSearchParams(qs).get('job') || null;
    } catch { return null; }
  }, []);

  // Open deep-linked job once jobs list is loaded
  React.useEffect(() => {
    if (!deepLinkJobId || !jobs.length) return;
    const j = jobs.find(x => String(x.id) === String(deepLinkJobId));
    if (j) setSelected(j);
  }, [jobs, deepLinkJobId]);

  // Open job from pendingQuickJobId (set by notification deep link or chat card click)
  React.useEffect(() => {
    const id = ctx.pendingQuickJobId;
    if (!id) return;
    // Try the already-loaded list first
    const j = jobs.find(x => String(x.id) === String(id));
    if (j) { setSelected(j); ctx.clearPendingQuickJob(); return; }
    // Not in list yet — fetch directly from Supabase (handles timing + expired jobs)
    if (!window.sb) return;
    window.sb.from('quick_pool_jobs').select('*').eq('id', id).single()
      .then(({ data }) => {
        if (!data) return;
        setSelected({
          id: data.id, _live: true,
          title: { en: data.title || `Pool job in ${data.city}`, pt: data.title || `Vaga em ${data.city}`, es: data.title || `Vaga en ${data.city}` },
          loc: data.city, dist: { en:'', pt:'', es:'' },
          price: data.price_negotiable ? 'neg' : data.price_per_pool,
          type: data.pool_type || 'residential',
          urgency: 'new',
          poster: data.poster_name, poster_phone: data.poster_phone,
          pool_address: data.pool_address, poster_id: data.poster_id,
          when: { en: data.when_label||'', pt: data.when_label||'', es: data.when_label||'' },
          pools: data.pools_count || 1, day_of_week: data.day_of_week,
          time_slot: data.time_slot || '', extras: data.extras || null,
          required_photos: data.required_photos || [],
          body: { en: data.description||'', pt: data.description||'', es: data.description||'' },
          created_at: data.created_at, status: data.status,
        });
        ctx.clearPendingQuickJob();
      });
  }, [ctx.pendingQuickJobId, jobs]);

  React.useEffect(() => {
    const h = () => setIsDesktop(window.innerWidth >= 900);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  const notifCities = React.useMemo(() => {
    const set = new Set();
    Object.values(regionsByDay || {}).forEach(arr => (arr||[]).forEach(c => set.add(c)));
    return [...set];
  }, [regionsByDay]);
  const activeDayCount = React.useMemo(
    () => Object.values(regionsByDay || {}).filter(arr => (arr||[]).length > 0).length,
    [regionsByDay]
  );

  const cardRefs = React.useRef({});

  const scrollToJob = (id) => {
    setHighlighted(prev => prev === id ? null : id);
    const el = cardRefs.current[id];
    if (el) el.scrollIntoView({behavior:'smooth', block:'center'});
  };

  // ── Delete a live job ─────────────────────────────────────────
  const deleteJob = async (jobId, e) => {
    e && e.stopPropagation();
    if (!window.sb) return;
    // If someone was already accepted for this job, notify them and clear their
    // application so it doesn't linger stuck at status:'accepted' forever.
    const { data: accepted } = await window.sb.from('quick_pool_applications')
      .select('id, applicant_id').eq('job_id', jobId).eq('status', 'accepted').limit(1);
    if (accepted && accepted[0]) {
      await window.sb.from('quick_pool_applications').update({ status: 'cancelled' }).eq('id', accepted[0].id);
      window.sendPush && window.sendPush(accepted[0].applicant_id,
        lang==='pt' ? '⚠️ Vaga cancelada' : lang==='es' ? '⚠️ Vacante cancelada' : '⚠️ Job cancelled',
        lang==='pt' ? 'O dono cancelou esta vaga depois de ter aceitado sua candidatura.'
          : lang==='es' ? 'El propietario canceló esta vacante después de aceptar tu solicitud.'
          : 'The poster cancelled this job after accepting your application.',
        '/#express-pools', 'quick');
    }
    await window.sb.from('quick_pool_jobs').update({ status:'cancelled' }).eq('id', jobId);
    setJobs(prev => prev.filter(j => String(j.id) !== String(jobId)));
    if (selected && String(selected.id) === String(jobId)) setSelected(null);
  };

  // ── Extend a job's expiration (owner only) ──────────────────
  const extendJob = async (jobId, hours) => {
    if (!window.sb) return;
    const job = jobs.find(j => String(j.id) === String(jobId));
    const base = (job?.expires_at && new Date(job.expires_at) > new Date()) ? new Date(job.expires_at) : new Date();
    const newExpiry = new Date(base.getTime() + hours * 60 * 60 * 1000).toISOString();
    const { error } = await window.sb.from('quick_pool_jobs')
      .update({ expires_at: newExpiry, status: 'open' }).eq('id', jobId);
    setExtendDialog(null);
    if (error) { showToast && showToast('❌ ' + error.message); return; }
    // The REST client uses Prefer: return=minimal on updates, so a 0-row RLS-blocked
    // write still reports success — verify the row actually changed before trusting it.
    const { data: verify } = await window.sb.from('quick_pool_jobs').select('expires_at').eq('id', jobId).single();
    if (!verify || new Date(verify.expires_at).getTime() !== new Date(newExpiry).getTime()) {
      showToast && showToast(lang==='pt'?'❌ Não foi possível estender — tente novamente':lang==='es'?'❌ No se pudo extender — inténtalo de nuevo':'❌ Could not extend — please try again');
      return;
    }
    promptedExpiryRef.current.delete(jobId);
    setJobs(prev => prev.map(j => String(j.id) === String(jobId) ? { ...j, expires_at: newExpiry, status: 'open' } : j));
    showToast && showToast(lang==='pt'?'✓ Vaga estendida':lang==='es'?'✓ Vacante extendida':'✓ Job extended');
  };

  // ── Finalize a filled job (owner marks complete → removed) ──
  const finalizeJob = async (jobId) => {
    if (!window.sb) return;
    await window.sb.from('quick_pool_jobs').update({ status: 'completed' }).eq('id', jobId);
    setJobs(prev => prev.filter(j => String(j.id) !== String(jobId)));
    setSelected(null);
  };

  // ── Apply to a live job ───────────────────────────────────────
  const applyToJob = async (jobId, sharePhone = false) => {
    if (!window.sb || !user?.uid) return;
    setApplied(prev => ({ ...prev, [jobId]: true }));
    try {
      await window.sb.from('quick_pool_applications').insert({
        job_id: jobId, applicant_id: user.uid,
        applicant_name: user.name || user.email || 'Pool Guy',
        applicant_phone: sharePhone ? (user.phone || null) : null,
        status: 'pending',
      });
    } catch {}
  };

  // ── Shared job card (used on mobile + desktop) ────────────────
  const JobCard = ({ j, compact=false }) => {
    const isApplied    = !!applied[j.id];
    const isOwn        = j._live && user?.uid && j.poster_id === user.uid;
    const isAdmin       = user?.role === 'admin';
    const locked       = !isOwn && user.tier !== 'premium';
    // Green only for the candidate whose application was accepted
    const isAccepted   = !isOwn && myAcceptedJobIds.has(String(j.id));
    // Amber for the owner when someone has been accepted (job filled, pending finalization)
    const isOwnFilled  = isOwn && j.status === 'filled';
    const isDone       = !isOwn && myDoneJobIds.has(String(j.id));
    const isHighlighted = highlighted === j.id;

    return (
      <article key={j.id}
        ref={el => { cardRefs.current[j.id] = el; }}
        onClick={()=>setSelected(j)}
        style={{
          background: isDone ? 'var(--pg-ink-100,#F1F5F9)' : 'var(--pg-white)',
          borderRadius:16, cursor:'pointer', opacity: isDone ? 0.7 : 1,
          border: isDone
            ? '1px solid var(--pg-ink-300,#CBD5E1)'
            : isOwnFilled
              ? '2px solid #F59E0B'
              : isAccepted
                ? '2px solid #22C55E'
                : isHighlighted
                  ? '2px solid #00B4D8'
                  : '1px solid var(--pg-ink-200)',
          boxShadow: isDone
            ? 'none'
            : isOwnFilled
            ? '0 0 0 4px rgba(245,158,11,0.10), 0 6px 20px rgba(245,158,11,0.15)'
            : isAccepted
            ? '0 0 0 4px rgba(34,197,94,0.12), 0 6px 20px rgba(34,197,94,0.18)'
            : isHighlighted
              ? '0 0 0 4px rgba(0,180,216,0.18), 0 6px 20px rgba(0,180,216,0.22)'
              : '0 2px 8px rgba(0,0,0,0.05)',
          transition:'all .2s ease',
          overflow:'hidden',
        }}>

        {/* Top accent strip */}
        <div style={{
          height: (isAccepted && !isDone) ? 4 : 3, width:'100%',
          background: isDone
            ? 'linear-gradient(90deg,#94A3B8,#CBD5E1)'
            : isOwnFilled
              ? 'linear-gradient(90deg,#D97706,#F59E0B)'
              : isAccepted
                ? 'linear-gradient(90deg,#16A34A,#22C55E,#4ADE80)'
                : j.status==='filled'
                  ? 'linear-gradient(90deg,#D97706,#F59E0B)'
                  : isApplied
                    ? 'linear-gradient(90deg,#16A34A,#22C55E)'
                    : locked
                      ? 'linear-gradient(90deg,#6B7280,#9CA3AF)'
                      : 'linear-gradient(90deg,#0077B6,#38BDF8)',
        }}/>

        <div style={{padding: compact ? '14px 16px' : '16px 18px'}}>
          {/* Row 1: time + pools + price */}
          <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:10}}>
            <div style={{flex:1, minWidth:0}}>
              {/* When + applied badge */}
              <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:6, flexWrap:'wrap'}}>
                <span style={{
                  display:'inline-flex', alignItems:'center', gap:4,
                  fontSize:11, fontWeight:600, color:'var(--pg-ink-500)',
                }}>
                  {Icon.clock(11,'var(--pg-ink-400)')} {tr(j.when,lang)}
                </span>
                {!isAccepted && j.status==='filled' && !isOwn && (
                  <span style={{
                    fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:999,
                    background:'#FEF3C7', color:'#92400E', letterSpacing:'0.04em',
                    display:'inline-flex', alignItems:'center', gap:3,
                  }}>⏳ {lang==='pt'?'Em curso':lang==='es'?'En curso':'In progress'}</span>
                )}
                {!isAccepted && isApplied && j.status!=='filled' && (
                  <span style={{
                    fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:999,
                    background:'#DCFCE7', color:'#15803D', letterSpacing:'0.04em',
                  }}>✓ {t.applied}</span>
                )}
                {locked && (
                  <span style={{
                    fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:999,
                    background:'var(--pg-ink-100)', color:'var(--pg-ink-500)', letterSpacing:'0.04em',
                    display:'inline-flex', alignItems:'center', gap:3,
                  }}>
                    {Icon.lock(9,'var(--pg-ink-400)')} Premium
                  </span>
                )}
              </div>
              {/* Title */}
              <h3 style={{
                margin:'0 0 6px', fontFamily:'var(--pg-font-display)',
                fontSize: compact?15:17, fontWeight:800, letterSpacing:'-0.02em', lineHeight:1.2,
                color:'var(--pg-ink-900)',
              }}><Tx lang={lang}>{tr(j.title,'pt')}</Tx></h3>
              {/* Location */}
              <div style={{display:'flex', alignItems:'center', gap:5, fontSize:12, color:'var(--pg-ink-500)'}}>
                {Icon.pin(12,'var(--pg-blue-400)')}
                <span>{j.loc}</span>
                <span style={{color:'var(--pg-ink-300)'}}>·</span>
                <span>{tr(j.dist,lang)}</span>
              </div>
            </div>

            {/* Price block */}
            <div style={{
              flexShrink:0, textAlign:'right', padding:'8px 12px',
              borderRadius:12, background:'var(--pg-ink-50)', border:'1px solid var(--pg-ink-100)',
              minWidth:72,
            }}>
              {j.price === 'neg' ? (
                <div style={{fontSize:13, fontWeight:700, color:'var(--pg-ink-700)'}}>{t.negotiable}</div>
              ) : (
                <>
                  <div style={{fontFamily:'var(--pg-font-display)', fontSize:22, fontWeight:800,
                    color: locked?'var(--pg-ink-400)':'var(--pg-blue-500)',
                    letterSpacing:'-0.03em', lineHeight:1,
                    filter: locked ? 'blur(4px)' : 'none',
                  }}>${j.price}</div>
                  <div style={{fontSize:9.5, color:'var(--pg-ink-400)', marginTop:1}}>{t.perPool}</div>
                </>
              )}
            </div>
          </div>

          {/* Divider */}
          <div style={{height:1, background:'var(--pg-ink-100)', margin:'0 0 12px'}}/>

          {/* Row 2: poster + action */}
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:10}}>
            <div onClick={(e)=>{ e.stopPropagation(); locked ? openPaywall('quickpools') : (j.poster_id && openPublicProfile({ uid: j.poster_id, name: j.poster })); }}
              style={{display:'flex', alignItems:'center', gap:10, minWidth:0, cursor: 'pointer'}}>
              <div style={{filter: locked ? 'blur(5px)' : 'none'}}>
                <AvatarFetch uid={j.poster_id} name={j.poster} size={32}/>
              </div>
              <div style={{filter: locked ? 'blur(4px)' : 'none', userSelect: locked ? 'none' : 'auto'}}>
                <div style={{fontSize:13, fontWeight:600, color:'var(--pg-ink-800)', lineHeight:1.2}}>{locked ? 'Pool Guy' : j.poster}</div>
                <div style={{display:'flex', alignItems:'center', gap:4, marginTop:2}}>
                  <Stars rating={j.rating} size={10}/>
                  <span style={{fontSize:11, color:'var(--pg-ink-500)', fontWeight:500}}>{j.rating}</span>
                </div>
              </div>
            </div>

            {isOwnFilled ? (
              <div style={{
                height:36, padding:'0 14px', borderRadius:999,
                background:'#FFFBEB', border:'1px solid #FCD34D',
                color:'#92400E', fontSize:12, fontWeight:700,
                display:'flex', alignItems:'center', gap:6,
              }}>
                ⏳ {lang==='pt'?'Em andamento':lang==='es'?'En curso':'In progress'}
              </div>
            ) : isOwn ? (
              <div style={{display:'flex', alignItems:'center', gap:6}}>
                {j.status === 'open' && j.expires_at && (
                  (new Date(j.expires_at).getTime() - Date.now()) < EXTEND_WINDOW_MS ? (
                    <button onClick={(e)=>{ e.stopPropagation(); setExtendDialog(j.id); }} title={lang==='pt'?'Estender':lang==='es'?'Extender':'Extend'} style={{
                      width:36, height:36, borderRadius:10, border:'1px solid var(--pg-ink-300)',
                      background:'var(--pg-ink-100)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                    }}>
                      {Icon.clock(14,'var(--pg-ink-700)')}
                    </button>
                  ) : (
                    <span style={{fontSize:10.5, color:'var(--pg-ink-400)', fontWeight:600, whiteSpace:'nowrap'}}>
                      {formatRemaining(j.expires_at)}
                    </span>
                  )
                )}
                <button onClick={(e)=>{ e.stopPropagation(); openEditPost && openEditPost({
                  id: j.id, title: typeof j.title==='object' ? (j.title[lang]||j.title.pt||j.title.en) : j.title,
                  description: typeof j.body==='object' ? (j.body[lang]||j.body.pt||j.body.en) : '',
                  city: j.loc, pool_type: j.type, extras: j.extras,
                  price_negotiable: j.price==='neg', price_per_pool: j.price==='neg' ? null : j.price,
                  poster_phone: j.poster_phone, pool_address: j.pool_address,
                  required_photos: j.required_photos || [],
                }); }} style={{
                  width:36, height:36, borderRadius:10, border:'1px solid var(--pg-ink-300)',
                  background:'var(--pg-ink-100)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  {Icon.edit(14,'var(--pg-ink-700)')}
                </button>
                <button onClick={(e)=>{ e.stopPropagation(); setConfirmDialog({
                  message: lang==='pt'?'Remover publicação?':lang==='es'?'¿Eliminar publicación?':'Remove posting?',
                  subMessage: lang==='pt'?'Essa vaga será removida e os candidatos não poderão mais se candidatar.':'This job will be removed and applicants will no longer be able to apply.',
                  confirmLabel: lang==='pt'?'Sim, remover':lang==='es'?'Sí, eliminar':'Yes, remove',
                  onConfirm: () => { deleteJob(j.id); setConfirmDialog(null); },
                }); }} style={{
                  width:36, height:36, borderRadius:10, border:'1px solid #FECACA',
                  background:'#FEF2F2', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                  </svg>
                </button>
              </div>
            ) : locked ? (
              <button onClick={(e)=>{e.stopPropagation();openPaywall('quickpools');}} style={{
                height:36, padding:'0 16px', borderRadius:999, border:'none', cursor:'pointer',
                background:'linear-gradient(135deg, var(--pg-blue-700), oklch(0.45 0.15 230))',
                color:'#fff', fontFamily:'inherit',
                fontSize:12, fontWeight:700, display:'flex', alignItems:'center', gap:6,
                boxShadow:'0 3px 10px rgba(0,119,182,0.35)',
              }}>
                {Icon.lock(12,'#fff')} {t.unlock}
              </button>
            ) : isDone ? (
              <div style={{
                height:36, padding:'0 16px', borderRadius:999,
                background:'#F1F5F9', border:'1px solid #CBD5E1',
                color:'#64748B', fontSize:12, fontWeight:700,
                display:'flex', alignItems:'center', gap:6,
              }}>
                {Icon.check(13,'#64748B')} {lang==='pt'?'Concluído':lang==='es'?'Completado':'Completed'}
              </div>
            ) : isAccepted && !isOwn ? (
              <div style={{
                height:36, padding:'0 16px', borderRadius:999,
                background:'#DCFCE7', border:'1px solid #86EFAC',
                color:'#15803D', fontSize:12, fontWeight:700,
                display:'flex', alignItems:'center', gap:6,
              }}>
                {Icon.check(13,'#15803D')} {lang==='pt'?'Aceito':lang==='es'?'Aceptado':'Accepted'}
              </div>
            ) : j.status==='filled' && !isOwn ? (
              <div style={{
                height:36, padding:'0 16px', borderRadius:999,
                background:'#FEF3C7', border:'1px solid #FCD34D',
                color:'#92400E', fontSize:12, fontWeight:700,
                display:'flex', alignItems:'center', gap:6,
              }}>
                ⏳ {lang==='pt'?'Em curso':lang==='es'?'En curso':'In progress'}
              </div>
            ) : isApplied ? (
              <div style={{
                height:36, padding:'0 16px', borderRadius:999,
                background:'#DCFCE7', border:'1px solid #86EFAC',
                color:'#15803D', fontSize:12, fontWeight:700,
                display:'flex', alignItems:'center', gap:6,
              }}>
                {Icon.check(13,'#15803D')} {t.applied}
              </div>
            ) : (
              <button onClick={(e)=>{e.stopPropagation();setSelected(j);}} style={{
                height:36, padding:'0 18px', borderRadius:999, border:'none', cursor:'pointer',
                background:'linear-gradient(135deg,#0077B6,#023E8A)',
                color:'#fff', fontFamily:'inherit', fontSize:13, fontWeight:700,
                boxShadow:'0 3px 10px rgba(0,119,182,0.30)', transition:'all .15s',
              }}>{t.apply}</button>
            )}
            {isAdmin && !isOwn && j._live && (
              <button onClick={(e)=>{ e.stopPropagation(); openEditPost && openEditPost({
                id: j.id, title: typeof j.title==='object' ? (j.title[lang]||j.title.pt||j.title.en) : j.title,
                description: typeof j.body==='object' ? (j.body[lang]||j.body.pt||j.body.en) : '',
                city: j.loc, pool_type: j.type, extras: j.extras,
                price_negotiable: j.price==='neg', price_per_pool: j.price==='neg' ? null : j.price,
                poster_phone: j.poster_phone, pool_address: j.pool_address,
                required_photos: j.required_photos || [],
              }); }} title={lang==='pt'?'Editar (admin)':lang==='es'?'Editar (admin)':'Edit (admin)'} style={{
                width:36, height:36, borderRadius:10, border:'1px solid var(--pg-ink-300)',
                background:'var(--pg-ink-100)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', marginLeft:6,
              }}>
                {Icon.edit(14,'var(--pg-ink-700)')}
              </button>
            )}
            {isAdmin && !isOwn && j._live && (
              <button onClick={(e)=>{ e.stopPropagation(); setConfirmDialog({
                message: lang==='pt'?'[Admin] Excluir publicação?':lang==='es'?'[Admin] ¿Eliminar publicación?':'[Admin] Delete posting?',
                subMessage: lang==='pt'?'Remove a vaga deste usuário permanentemente.':lang==='es'?'Elimina la vacante de este usuario permanentemente.':'Permanently removes this user\'s posting.',
                confirmLabel: lang==='pt'?'Sim, excluir':lang==='es'?'Sí, eliminar':'Yes, delete',
                onConfirm: () => { deleteJob(j.id); setConfirmDialog(null); },
              }); }} title={lang==='pt'?'Excluir (admin)':lang==='es'?'Eliminar (admin)':'Delete (admin)'} style={{
                width:36, height:36, borderRadius:10, border:'1px solid #FECACA',
                background:'#FEF2F2', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', marginLeft:6,
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </article>
    );
  };

  // ── Sheet (mobile + desktop share the same) ───────────────────
  const jobDetailPanel = selected ? (
    <div style={{
      position:'fixed', inset:0, zIndex:500,
      background:'var(--pg-bg)', overflowY:'auto',
      display:'flex', flexDirection:'column',
    }}>
      <JobDetailBoundary onClose={()=>setSelected(null)}>
        <QuickPoolDetails job={selected} user={user} t={t} lang={lang}
          applied={!!applied[selected.id]}
          onApply={(sharePhone)=>applyToJob(selected.id, sharePhone)}
          onUnlock={()=>openPaywall('quickpools')}
          onChat={openChat}
          onClose={()=>setSelected(null)}
          onDelete={deleteJob}
          onComplete={finalizeJob}
          openPublicProfile={openPublicProfile}
          openEditPost={openEditPost}
          onStatusChange={(status) => {
            setJobs(prev => prev.map(j => String(j.id)===String(selected.id) ? {...j, status} : j));
            setSelected(prev => prev ? {...prev, status} : prev);
          }}
          onMyJobAccepted={(jobId) => {
            setMyAcceptedJobIds(prev => new Set([...prev, String(jobId)]));
          }}
        />
      </JobDetailBoundary>
    </div>
  ) : null;

  // ── Job list helpers (used by both desktop and mobile) ────────
  const now24 = Date.now();
  const sortedJobs = [...jobs]
    .filter(j => {
      const doneAt = myDoneJobIds.get(String(j.id));
      if (doneAt && (now24 - doneAt.getTime()) > 24*60*60*1000) return false;
      return true;
    })
    .sort((a, b) => {
      const aOwn = (a._live && user?.uid && a.poster_id === user.uid) ? 0 : 1;
      const bOwn = (b._live && user?.uid && b.poster_id === user.uid) ? 0 : 1;
      if (aOwn !== bOwn) return aOwn - bOwn;
      const aDone = myDoneJobIds.has(String(a.id)) ? 1 : 0;
      const bDone = myDoneJobIds.has(String(b.id)) ? 1 : 0;
      if (aDone !== bDone) return aDone - bDone;
      const aAcc = myAcceptedJobIds.has(String(a.id)) ? 1 : 0;
      const bAcc = myAcceptedJobIds.has(String(b.id)) ? 1 : 0;
      return bAcc - aAcc;
    });

  const HistorySection = () => historyJobs.length === 0 ? null : (
    <div style={{padding:'16px 18px 8px'}}>
      <button onClick={()=>setShowHistory(v=>!v)} style={{
        width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between',
        background:'none', border:'none', cursor:'pointer', padding:'8px 0',
      }}>
        <span style={{fontSize:14, fontWeight:700, color:'var(--pg-ink-600)'}}>
          📋 {lang==='pt'?'Histórico':lang==='es'?'Historial':'History'} ({historyJobs.length})
        </span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--pg-ink-400)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
          style={{transform: showHistory ? 'rotate(180deg)' : 'rotate(0deg)', transition:'transform .2s'}}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {showHistory && (
        <div style={{display:'flex', flexDirection:'column', gap:8, marginTop:8}}>
          {historyJobs.map(j => (
            <div key={j.id} onClick={()=>setSelected(j)} style={{
              borderRadius:12, border:'1px solid var(--pg-ink-200)',
              background:'var(--pg-ink-50)', opacity:0.85, padding:'12px 14px',
              display:'flex', alignItems:'center', justifyContent:'space-between', gap:10,
              cursor:'pointer', transition:'opacity .15s',
            }}
              onMouseEnter={e=>e.currentTarget.style.opacity='1'}
              onMouseLeave={e=>e.currentTarget.style.opacity='0.85'}
            >
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:13, fontWeight:700, color:'var(--pg-ink-700)', marginBottom:2}}>
                  {typeof j.title === 'object' ? (j.title[lang] || j.title.pt || j.title.en) : (j.title || j.loc)}
                </div>
                <div style={{fontSize:11, color:'var(--pg-ink-400)'}}>
                  {j.loc} · {j.price === 'neg' ? (lang==='pt'?'Negociável':'Negotiable') : `$${j.price}`}
                </div>
              </div>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <span style={{fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:999,
                  background:'#F1F5F9', color:'#64748B', border:'1px solid #CBD5E1', whiteSpace:'nowrap',
                }}>✓ {lang==='pt'?'Concluído':'Done'}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--pg-ink-300)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ══════════════════════════════════════════════════════════════
  // ── DESKTOP LAYOUT ────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════
  if (isDesktop) {
    return (
      <div style={{position:'relative', width:'100%', height:'100%', overflow:'hidden'}}>
      <div style={{height:'100%', overflowY:'auto', background:'var(--pg-ink-50)'}}>

        {/* ── HERO ─────────────────────────────────────────────── */}
        {(function(){
          const _tx  = darkMode ? '#fff'                     : '#0A2840';
          const _sub = darkMode ? 'rgba(255,255,255,0.50)'   : 'rgba(10,40,64,0.50)';
          const _sub2= darkMode ? 'rgba(255,255,255,0.55)'   : 'rgba(10,40,64,0.55)';
          const _ib  = darkMode ? 'rgba(255,255,255,0.12)'   : 'rgba(10,40,64,0.08)';
          const _ibr = darkMode ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(10,40,64,0.12)';
          const _cb  = darkMode ? 'rgba(255,255,255,0.08)'   : 'rgba(10,40,64,0.05)';
          const _cbr = darkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(10,40,64,0.10)';
          const _bg  = darkMode
            ? 'linear-gradient(135deg, #011B5A 0%, #0077B6 55%, #0096C7 100%)'
            : 'linear-gradient(135deg, #e8f5ff 0%, #cfe9f8 60%, #b8dff5 100%)';
          return (
            <div style={{background:_bg, padding:'28px 40px 28px', position:'relative', overflow:'hidden'}}>
              <div style={{position:'absolute', top:-80, right:-80, width:280, height:280,
                borderRadius:'50%', background: darkMode?'rgba(255,255,255,0.03)':'rgba(10,40,64,0.03)', pointerEvents:'none'}}/>
              <div style={{position:'absolute', bottom:-50, left:160, width:200, height:200,
                borderRadius:'50%', background: darkMode?'rgba(255,255,255,0.03)':'rgba(10,40,64,0.02)', pointerEvents:'none'}}/>
              {/* Centered icon watermark */}
              <div style={{position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none', zIndex:0}}>
                <img src="icone-watermark.png" alt="" style={{position:'absolute', left:'50%', top:'63%', transform:'translate(-50%,-50%)', height:235, objectFit:'contain', opacity:0.60, userSelect:'none'}}/>
              </div>

              {/* Single compact row */}
              <div style={{display:'flex', alignItems:'center', gap:20}}>
                {/* Brand */}
                <div style={{display:'flex', alignItems:'center', gap:12, flexShrink:0}}>
                  <div style={{width:42,height:42,borderRadius:13,flexShrink:0,background:_ib,border:_ibr,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={_tx} strokeWidth="1.75" strokeLinecap="round">
                      <path d="M2 12 Q6 8 10 12 Q14 16 18 12 Q20 10 22 12"/>
                      <path d="M2 17 Q6 13 10 17 Q14 21 18 17 Q20 15 22 17"/>
                      <circle cx="12" cy="5" r="2"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{fontSize:9.5,fontWeight:700,color:_sub,letterSpacing:'0.13em',textTransform:'uppercase',marginBottom:2}}>
                      QUICK POOLS · {(county||'BROWARD').toUpperCase()}
                    </div>
                    <div style={{fontFamily:'var(--pg-font-display)',fontSize:20,fontWeight:800,color:_tx,letterSpacing:'-0.025em',lineHeight:1}}>
                      {lang==='pt'?'Piscinas Rápidas':lang==='es'?'Piscinas Rápidas':'Express Pools'}
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div style={{width:1, height:32, background: darkMode?'rgba(255,255,255,0.12)':'rgba(10,40,64,0.10)', flexShrink:0}}/>

                {/* Stats inline */}
                <div style={{display:'flex', alignItems:'center', gap:16, flex:1}}>
                  <div style={{display:'flex', alignItems:'center', gap:6}}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={_sub2} strokeWidth="1.75" strokeLinecap="round">
                      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3 8 3"/><path d="M12 3v4"/>
                    </svg>
                    <span style={{fontFamily:'var(--pg-font-display)',fontSize:15,fontWeight:800,color:_tx,letterSpacing:'-0.02em'}}>{jobs.length}</span>
                    <span style={{fontSize:11,color:_sub,fontWeight:500}}>{lang==='pt'?'vagas':'jobs'}</span>
                  </div>
                  <div style={{width:1,height:18,background:darkMode?'rgba(255,255,255,0.12)':'rgba(10,40,64,0.10)'}}/>
                  <div style={{display:'flex', alignItems:'center', gap:6}}>
                    {Icon.cal(13,_sub2)}
                    <span style={{fontFamily:'var(--pg-font-display)',fontSize:15,fontWeight:800,color:'#34D399',letterSpacing:'-0.02em'}}>{activeDayCount}/7</span>
                    <span style={{fontSize:11,color:_sub,fontWeight:500}}>{lang==='pt'?'dias ativos':'active days'}</span>
                  </div>
                  <div style={{width:1,height:18,background:darkMode?'rgba(255,255,255,0.12)':'rgba(10,40,64,0.10)'}}/>
                  <div style={{display:'flex', alignItems:'center', gap:6, flex:1, minWidth:0}}>
                    {Icon.bell(13,_sub2)}
                    <span style={{fontSize:12,color:_sub,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                      {notifCities.length > 0
                        ? notifCities.slice(0,3).join(' · ') + (notifCities.length>3?` +${notifCities.length-3}`:'')
                        : (lang==='pt'?'Sem cidades':'No cities')}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{display:'flex', alignItems:'center', gap:8, flexShrink:0}}>
                  <button onClick={()=>openPost()} style={{height:38,padding:'0 16px',borderRadius:11,border:'none',background:'linear-gradient(135deg,#0077B6,#023E8A)',color:'#fff',fontFamily:'inherit',fontSize:13,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:6,boxShadow:'0 3px 10px rgba(0,119,182,0.35)',transition:'all .15s'}}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    {lang==='pt'?'Publicar':lang==='es'?'Publicar':'Post'}
                  </button>
                  <button onClick={()=>user.tier==='premium' ? openRegionEditor() : openPaywall('quickpools')} style={{height:38,padding:'0 14px',borderRadius:11,border:_ibr,background:_ib,color:_tx,fontFamily:'inherit',fontSize:12,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:6,transition:'all .15s'}}>
                    {Icon.cal(13,_tx)} {lang==='pt'?'Editar':'Edit'}
                  </button>
                  <button onClick={()=>openChat&&openChat()} style={{width:38,height:38,borderRadius:11,background:_ib,border:_ibr,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
                    {Icon.msg(18,_tx)}
                    {hasUnreadChat && <span style={{position:'absolute',top:7,right:7,width:7,height:7,borderRadius:'50%',background:'#FF3B30',border:`2px solid ${darkMode?'#011B5A':'#c5e4f5'}`}}/>}
                  </button>
                  <button onClick={()=>openNotifications&&openNotifications()} style={{width:38,height:38,borderRadius:11,background:_ib,border:_ibr,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
                    {Icon.bell(18,_tx)}
                    {hasUnreadNotif && <span style={{position:'absolute',top:7,right:7,width:7,height:7,borderRadius:'50%',background:'#FF3B30',border:`2px solid ${darkMode?'#011B5A':'#c5e4f5'}`}}/>}
                  </button>
                </div>
              </div>
            </div>
          );
        }())}

        {/* ── CONTENT: Map left + Jobs right ───────────────────── */}
        <div style={{display:'grid', gridTemplateColumns:'420px 1fr', gap:0, minHeight:'calc(100vh - 300px)'}}>

          {/* Left: sticky map */}
          <div style={{
            position:'sticky', top:0, height:'calc(100vh - 0px)',
            borderRight:'1px solid var(--pg-ink-200)',
            background:'var(--pg-white)', overflow:'hidden', flexShrink:0,
          }}>
            <LeafletMapBlock jobs={jobs} highlighted={highlighted} onPinClick={(j)=>scrollToJob(j.id)} fullHeight/>

            {/* Info overlay */}
            <div style={{
              position:'absolute', top:16, left:16, right:16, zIndex:400,
              background:'rgba(255,255,255,0.95)', backdropFilter:'blur(12px)',
              borderRadius:12, padding:'10px 14px',
              border:'1px solid rgba(255,255,255,0.8)',
              boxShadow:'0 4px 16px rgba(0,0,0,0.12)',
              display:'flex', alignItems:'center', gap:8,
            }}>
              {Icon.bell(13,'var(--pg-blue-600)')}
              <div style={{fontSize:11.5, color:'var(--pg-blue-700)', lineHeight:1.4, flex:1}}>
                {lang==='pt'
                  ? <><b>{county} County</b> — clique nos pins para ver detalhes</>
                  : <><b>{county} County</b> — click pins to jump to job details</>}
              </div>
            </div>
          </div>

          {/* Right: job list */}
          <div style={{padding:'28px 32px 60px', background:'var(--pg-ink-50)'}}>

            {/* Push notification banner — only when not active */}
            {(notifStatus === 'needed' || notifStatus === 'denied') && (
              <div style={{
                marginBottom:20, padding:'12px 16px', borderRadius:13,
                background:'#FEFCE8', border:'1px solid #FDE68A',
                display:'flex', alignItems:'center', gap:10,
              }}>
                <div style={{fontSize:18, flexShrink:0}}>🔔</div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:13, fontWeight:700, color:'#92400E', marginBottom:2}}>
                    {lang==='pt' ? 'Ative as notificações para receber vagas em tempo real' : lang==='es' ? 'Activa las notificaciones para recibir trabajos en tiempo real' : 'Enable notifications to receive real-time job alerts'}
                  </div>
                  <div style={{fontSize:12, color:'#A16207', lineHeight:1.4}}>
                    {lang==='pt'
                      ? 'Sem notificações ativas você pode perder vagas urgentes.'
                      : lang==='es'
                      ? 'Sin notificaciones activas puedes perder trabajos urgentes.'
                      : 'Without notifications enabled you may miss urgent jobs.'}
                  </div>
                </div>
                <button onClick={activatePush} style={{
                  flexShrink:0, height:36, padding:'0 18px', borderRadius:9,
                  border:'none', cursor:'pointer', fontSize:13, fontWeight:700, fontFamily:'inherit',
                  background:'#D97706', color:'#fff',
                  boxShadow:'0 2px 8px rgba(217,119,6,0.3)',
                }}>
                  {lang==='pt' ? 'Ativar notificações' : lang==='es' ? 'Activar notificaciones' : 'Enable notifications'}
                </button>
              </div>
            )}

            {/* Header */}
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20}}>
              <div>
                <div style={{fontSize:20, fontWeight:800, color:'var(--pg-ink-900)',
                  fontFamily:'var(--pg-font-display)', letterSpacing:'-0.02em', lineHeight:1}}>
                  {lang==='pt'?`${jobs.length} vagas disponíveis`:lang==='es'?`${jobs.length} trabajos disponibles`:`${jobs.length} jobs available`}
                </div>
                <div style={{fontSize:13, color:'var(--pg-ink-500)', marginTop:4}}>
                  {lang==='pt'?`Broward County · ordenado por proximidade`:`${county} County · sorted by proximity`}
                </div>
              </div>
              {user.tier !== 'premium' && (
                <button onClick={()=>openPaywall('quickpools')} style={{
                  display:'flex', alignItems:'center', gap:7, padding:'9px 16px', borderRadius:999,
                  background:'linear-gradient(135deg,#7c3aed,#6d28d9)', border:'none', cursor:'pointer',
                  boxShadow:'0 4px 14px rgba(124,58,237,0.35)',
                }}>
                  {Icon.lock(12,'#fff')}
                  <span style={{fontSize:12.5, fontWeight:800, color:'#fff', letterSpacing:'-0.005em'}}>
                    {lang==='pt'?'Só para assinantes Premium':'Premium subscribers only'}
                  </span>
                </button>
              )}
            </div>

            {user.tier !== 'premium' && (
              <button onClick={()=>openPaywall('quickpools')} style={{
                width:'100%', textAlign:'left', border:'1px solid #c4b5fd', cursor:'pointer',
                padding:'12px 16px', marginBottom:20, borderRadius:14, fontFamily:'inherit',
                background:'linear-gradient(110deg,#f5f3ff,#ede9fe)',
                display:'flex', alignItems:'center', gap:12,
              }}>
                <div style={{width:38, height:38, borderRadius:'50%', flexShrink:0, background:'linear-gradient(150deg,#7c3aed,#6d28d9)', display:'flex', alignItems:'center', justifyContent:'center'}}>
                  {Icon.crown(18,'#fff')}
                </div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:13, fontWeight:800, color:'#5b21b6'}}>
                    {lang==='pt'?'Piscinas Rápidas é exclusivo Premium':'Express Pools is Premium-exclusive'}
                  </div>
                  <div style={{fontSize:11.5, color:'#6d28d9', marginTop:2, lineHeight:1.35}}>
                    {lang==='pt'?'Assine Premium para ver quem publicou, candidatar-se e configurar suas cidades/dias.':'Subscribe to Premium to see who posted, apply, and set your cities/days.'}
                  </div>
                </div>
                {Icon.chev(14,'#6d28d9')}
              </button>
            )}

            {/* Cards */}
            {sortedJobs.length === 0 ? (
              <div style={{padding:'48px 24px', textAlign:'center', background:'var(--pg-white)', borderRadius:16, border:'1px solid var(--pg-ink-200)'}}>
                <div style={{fontSize:32, marginBottom:8}}>⚡</div>
                <div style={{fontWeight:700, color:'var(--pg-ink-600)'}}>
                  {lang==='pt'?'Nenhuma vaga disponível no momento':lang==='es'?'Ninguna vacante disponible por ahora':'No jobs available right now'}
                </div>
                <div style={{fontSize:13, color:'var(--pg-ink-400)', marginTop:4}}>
                  {lang==='pt'?'Volte mais tarde ou publique a sua.':lang==='es'?'Vuelve más tarde o publica la tuya.':'Check back later or post your own.'}
                </div>
              </div>
            ) : (
              <div style={{display:'flex', flexDirection:'column', gap:12}}>
                {sortedJobs.map(j => <JobCard key={j.id} j={j}/>)}
              </div>
            )}
            <HistorySection/>
          </div>
        </div>
      </div>
      {jobDetailPanel}
      {confirmDialog && (
        <ConfirmModal
          message={confirmDialog.message}
          subMessage={confirmDialog.subMessage}
          confirmLabel={confirmDialog.confirmLabel}
          lang={lang}
          onConfirm={confirmDialog.onConfirm}
          onCancel={()=>setConfirmDialog(null)}
        />
      )}
      {extendDialog && (
        <ExtendJobModal
          lang={lang}
          onExtend={(hours)=>extendJob(extendDialog, hours)}
          onCancel={()=>setExtendDialog(null)}
        />
      )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // ── MOBILE LAYOUT ─────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════
  return (
    <div style={{position:'relative', width:'100%', height:'100%', overflow:'hidden'}}>
    <div className="pg-screen" style={{paddingBottom:110, height:'100%', overflowY:'auto', background:'var(--pg-bg)'}}>
      {/* Express Pools header */}
      {(()=>{
        const H = headerTheme(darkMode);
        const dotBorder = darkMode ? '#010E1F' : '#a8d8f5';
        const poolIcon = (
          <svg width="20" height="20" viewBox="0 0 24 24" fill={H.iconC}>
            <path d="M13.5 2 4 14h6l-1.5 8L20 10h-6.5z"/>
          </svg>
        );
        return (
          <NavyBar
            darkMode={darkMode}
            wave={true}
            compact={false}
            bgOverride={darkMode
              ? 'linear-gradient(155deg, #010E1F 0%, #012044 40%, #013B78 80%, #004E9A 100%)'
              : 'linear-gradient(155deg, #daeeff 0%, #c2e4f8 40%, #a8d8f5 80%, #8ec8f0 100%)'}
            leftBack={true}
            onBack={()=>goTab&&goTab('home')}
            title={
              <div style={{display:'flex', alignItems:'center', gap:10}}>
                <div style={{width:44, height:44, borderRadius:13, flexShrink:0, background:H.iconBg, border:`0.5px solid ${H.border}`, display:'flex', alignItems:'center', justifyContent:'center'}}>
                  {poolIcon}
                </div>
                <div style={{paddingTop:2}}>
                  <div style={{fontSize:10.5, fontWeight:600, color:H.sub, letterSpacing:'0.10em', marginBottom:3, textTransform:'uppercase'}}>
                    {lang==='pt'?'ALERTAS EM TEMPO REAL':lang==='es'?'ALERTAS EN TIEMPO REAL':'REAL-TIME ALERTS'}
                  </div>
                  <div style={{fontFamily:'var(--pg-font-display)', fontSize:19, fontWeight:800, letterSpacing:'-0.025em', lineHeight:1.1, color:H.text}}>
                    {lang==='pt'?'Piscinas Rápidas':lang==='es'?'Piscinas Rápidas':'Express Pools'}
                  </div>
                </div>
              </div>
            }
            right={
              <div style={{display:'flex', gap:6, alignItems:'center'}}>
                <div style={{position:'relative', display:'inline-flex'}}>
                  <IconButton dark={darkMode} onClick={()=>openChat&&openChat()}>
                    {Icon.msg(20, H.text)}
                  </IconButton>
                  {hasUnreadChat&&<span style={{position:'absolute',top:5,right:5,width:8,height:8,borderRadius:'50%',background:'#FF3B30',border:`1.5px solid ${dotBorder}`,pointerEvents:'none'}}/>}
                </div>
                <div style={{position:'relative', display:'inline-flex'}}>
                  <IconButton dark={darkMode} onClick={()=>openNotifications&&openNotifications()}>
                    {Icon.bell(20, H.text)}
                  </IconButton>
                  {hasUnreadNotif&&<span style={{position:'absolute',top:5,right:5,width:8,height:8,borderRadius:'50%',background:'#FF3B30',border:`1.5px solid ${dotBorder}`,pointerEvents:'none'}}/>}
                </div>
              </div>
            }
          >
            {/* Stats strip */}
            <div style={{display:'flex', alignItems:'center', gap:10, marginTop:10, paddingTop:10, borderTop:`1px solid ${H.divider}`}}>
              {/* Jobs */}
              <div style={{display:'flex', alignItems:'center', gap:7}}>
                <div style={{width:30,height:30,borderRadius:9,background:H.iconBg,border:`0.5px solid ${H.border}`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={H.iconC} strokeWidth="1.75" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3 8 3"/><path d="M12 3v4"/></svg>
                </div>
                <div>
                  <div style={{fontSize:16,fontWeight:800,fontFamily:'var(--pg-font-display)',lineHeight:1,letterSpacing:'-0.02em',color:H.text}}>{jobs.length}</div>
                  <div style={{fontSize:10,opacity:0.55,lineHeight:1,marginTop:1.5,fontWeight:500,color:H.text}}>{lang==='pt'?'vagas':lang==='es'?'puestos':'jobs'}</div>
                </div>
              </div>
              <div style={{width:1,height:28,background:H.divider,flexShrink:0}}/>
              {/* Active days */}
              <div style={{display:'flex', alignItems:'center', gap:7}}>
                <div style={{width:30,height:30,borderRadius:9,background:H.iconBg,border:`0.5px solid ${H.border}`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {Icon.cal(14,H.iconC)}
                </div>
                <div>
                  <div style={{fontSize:16,fontWeight:800,fontFamily:'var(--pg-font-display)',lineHeight:1,letterSpacing:'-0.02em',color:'#34D399'}}>{activeDayCount}/7</div>
                  <div style={{fontSize:10,opacity:0.55,lineHeight:1,marginTop:1.5,fontWeight:500,color:H.text}}>{lang==='pt'?'dias ativos':lang==='es'?'días activos':'active days'}</div>
                </div>
              </div>
              <div style={{width:1,height:28,background:H.divider,flexShrink:0}}/>
              {/* Notification cities pill */}
              <div style={{flex:1,minWidth:0,display:'flex',alignItems:'center',gap:6,background:H.iconBg,border:`0.5px solid ${H.border}`,borderRadius:10,padding:'6px 10px'}}>
                {Icon.bell(11,H.sub)}
                <span style={{flex:1,minWidth:0,fontSize:11,fontWeight:500,color:H.sub,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                  {notifCities.length > 0
                    ? notifCities.slice(0,3).join(' · ')+(notifCities.length>3?` +${notifCities.length-3}`:'')
                    : (lang==='pt'?'Nenhuma cidade':lang==='es'?'Ninguna ciudad':'No cities')}
                </span>
                <button onClick={()=>user.tier==='premium' ? openRegionEditor() : openPaywall('quickpools')} style={{background:'transparent',border:'none',color:H.sub,fontSize:11,fontWeight:700,cursor:'pointer',padding:0,flexShrink:0,display:'flex',alignItems:'center',gap:3}}>
                  {Icon.cal(11,H.sub)} {lang==='pt'?'Editar':'Edit'}
                </button>
              </div>
            </div>
          </NavyBar>
        );
      })()}

      {/* Push notification banner — only when not active */}
      {(notifStatus === 'needed' || notifStatus === 'denied') && (
        <div style={{padding:'12px 18px 0'}}>
          <div style={{
            padding:'12px 14px', borderRadius:13,
            background: darkMode ? 'rgba(234,179,8,0.14)' : '#FEFCE8',
            border: `1px solid ${darkMode ? 'rgba(234,179,8,0.35)' : '#FDE68A'}`,
            display:'flex', alignItems:'center', gap:10,
          }}>
            <div style={{fontSize:18, flexShrink:0}}>🔔</div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:13, fontWeight:700, color: darkMode ? '#FDE68A' : '#92400E', marginBottom:2}}>
                {lang==='pt' ? 'Ative as notificações' : lang==='es' ? 'Activa las notificaciones' : 'Enable notifications'}
              </div>
              <div style={{fontSize:11.5, color: darkMode ? 'rgba(253,230,138,0.75)' : '#A16207', lineHeight:1.4}}>
                {lang==='pt'
                  ? 'Você só receberá vagas em tempo real se as notificações estiverem ativas.'
                  : lang==='es'
                  ? 'Solo recibirás trabajos en tiempo real si las notificaciones están activas.'
                  : 'You\'ll only receive real-time job alerts if notifications are enabled.'}
              </div>
            </div>
            <button onClick={activatePush} style={{
              flexShrink:0, height:34, padding:'0 14px', borderRadius:9,
              border:'none', cursor:'pointer', fontSize:12, fontWeight:700, fontFamily:'inherit',
              background: darkMode ? '#CA8A04' : '#D97706', color:'#fff',
              boxShadow:'0 2px 8px rgba(217,119,6,0.35)',
            }}>
              {lang==='pt' ? 'Ativar' : lang==='es' ? 'Activar' : 'Enable'}
            </button>
          </div>
        </div>
      )}

      {/* Map */}
      <div style={{padding:'14px 18px 0'}}>
        <LeafletMapBlock jobs={jobs} highlighted={highlighted} onPinClick={(j)=>scrollToJob(j.id)}/>
      </div>

      {/* Info banner */}
      <div style={{padding:'12px 18px 0'}}>
        <div style={{
          padding:'10px 12px', borderRadius:11, background:'var(--pg-blue-50)',
          border:'0.5px solid var(--pg-blue-100)',
          display:'flex', alignItems:'flex-start', gap:9,
        }}>
          <div style={{flexShrink:0, marginTop:1}}>{Icon.bell(14,'var(--pg-blue-700)')}</div>
          <div style={{fontSize:11.5, color:'var(--pg-blue-700)', lineHeight:1.4}}>
            {lang==='pt'
              ? <>Mostrando <b>todos os trabalhos do condado de {county}</b>. Você só será <b>notificado</b> dos trabalhos nas cidades e dias configurados.</>
              : <>Showing <b>all jobs in {county} County</b>. You're only <b>notified</b> for jobs in your configured cities and days.</>}
          </div>
        </div>
      </div>

      {/* Count row */}
      <div style={{padding:'12px 18px 0', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <div style={{fontFamily:'var(--pg-font-display)', fontSize:15, fontWeight:800,
          color:'var(--pg-ink-900)', letterSpacing:'-0.01em'}}>
          {lang==='pt'?`${jobs.length} vagas disponíveis`:lang==='es'?`${jobs.length} trabajos disponibles`:`${jobs.length} jobs available`}
        </div>
        {user.tier !== 'premium' && (
          <button onClick={()=>openPaywall('quickpools')} style={{
            display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:999,
            background:'linear-gradient(135deg,#7c3aed,#6d28d9)', border:'none', cursor:'pointer',
            boxShadow:'0 3px 10px rgba(124,58,237,0.32)',
          }}>
            {Icon.lock(10,'#fff')}
            <span style={{fontSize:11, fontWeight:800, color:'#fff'}}>
              {lang==='pt'?'Só Premium':'Premium only'}
            </span>
          </button>
        )}
      </div>

      {user.tier !== 'premium' && (
        <div style={{padding:'10px 18px 0'}}>
          <button onClick={()=>openPaywall('quickpools')} style={{
            width:'100%', textAlign:'left', border:'1px solid #c4b5fd', cursor:'pointer',
            padding:'12px 14px', borderRadius:14, fontFamily:'inherit',
            background:'linear-gradient(110deg,#f5f3ff,#ede9fe)',
            display:'flex', alignItems:'center', gap:10,
          }}>
            <div style={{width:34, height:34, borderRadius:'50%', flexShrink:0, background:'linear-gradient(150deg,#7c3aed,#6d28d9)', display:'flex', alignItems:'center', justifyContent:'center'}}>
              {Icon.crown(16,'#fff')}
            </div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:12.5, fontWeight:800, color:'#5b21b6'}}>
                {lang==='pt'?'Piscinas Rápidas é exclusivo Premium':'Express Pools is Premium-exclusive'}
              </div>
              <div style={{fontSize:11, color:'#6d28d9', marginTop:1, lineHeight:1.3}}>
                {lang==='pt'?'Veja quem publicou, candidate-se e configure suas cidades/dias.':'See who posted, apply, and set your cities/days.'}
              </div>
            </div>
            {Icon.chev(13,'#6d28d9')}
          </button>
        </div>
      )}

      {/* Job list */}
      {sortedJobs.length === 0 ? (
        <div style={{margin:'10px 18px 0', padding:'40px 20px', textAlign:'center', background:'var(--pg-white)', borderRadius:16, border:'1px solid var(--pg-ink-200)'}}>
          <div style={{fontSize:30, marginBottom:8}}>⚡</div>
          <div style={{fontWeight:700, color:'var(--pg-ink-600)'}}>
            {lang==='pt'?'Nenhuma vaga disponível no momento':lang==='es'?'Ninguna vacante disponible por ahora':'No jobs available right now'}
          </div>
          <div style={{fontSize:13, color:'var(--pg-ink-400)', marginTop:4}}>
            {lang==='pt'?'Volte mais tarde ou publique a sua.':lang==='es'?'Vuelve más tarde o publica la tuya.':'Check back later or post your own.'}
          </div>
        </div>
      ) : (
        <div style={{padding:'10px 18px 0', display:'flex', flexDirection:'column', gap:10}}>
          {sortedJobs.map(j => <JobCard key={j.id} j={j} compact/>)}
        </div>
      )}
      <HistorySection/>

    </div>
    {jobDetailPanel}
    {confirmDialog && (
      <ConfirmModal
        message={confirmDialog.message}
        subMessage={confirmDialog.subMessage}
        confirmLabel={confirmDialog.confirmLabel}
        lang={lang}
        onConfirm={confirmDialog.onConfirm}
        onCancel={()=>setConfirmDialog(null)}
      />
    )}
    {extendDialog && (
      <ExtendJobModal
        lang={lang}
        onExtend={(hours)=>extendJob(extendDialog, hours)}
        onCancel={()=>setExtendDialog(null)}
      />
    )}

    {/* ── Notification Help Modal (shown only when permission was previously denied) ── */}
    {notifHelpOpen && (() => {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
      const pt = lang === 'pt';
      const step = (n, text) => (
        <div style={{display:'flex', gap:12, alignItems:'flex-start', marginBottom:16}}>
          <div style={{width:28, height:28, borderRadius:9, background:'#0EBAC720', border:'1px solid #0EBAC740',
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
            fontWeight:800, fontSize:13, color:'#0EBAC7'}}>{n}</div>
          <div style={{fontSize:14, color:'var(--pg-ink-700)', lineHeight:1.5, paddingTop:4}}>{text}</div>
        </div>
      );
      return (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', zIndex:3000,
          display:'flex', alignItems:'flex-end', justifyContent:'center'}}
          onClick={()=>setNotifHelpOpen(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:'var(--pg-ink-100)',
            borderRadius:'22px 22px 0 0', padding:'20px 22px 40px', width:'100%', maxWidth:480,
            boxShadow:'0 -8px 40px rgba(0,0,0,0.35)'}}>
            <div style={{width:36, height:4, borderRadius:2, background:'var(--pg-ink-300)', margin:'0 auto 18px'}}/>
            <div style={{fontWeight:800, fontSize:17, color:'var(--pg-ink-900)', marginBottom:6}}>
              🔔 {pt ? 'Como ativar notificações' : 'How to enable notifications'}
            </div>
            <div style={{fontSize:13, color:'var(--pg-ink-500)', marginBottom:20, lineHeight:1.5}}>
              {pt ? 'Você negou a permissão antes. Siga os passos para reativar:' : 'You previously denied permission. Follow these steps to re-enable:'}
            </div>
            {isIOS && isStandalone && (<>
              {step(1, pt ? <>Abra o app <b>Ajustes</b> do iPhone</> : <>Open iPhone <b>Settings</b></>)}
              {step(2, pt ? <>Role e toque em <b>PoolGuyX</b></> : <>Scroll and tap <b>PoolGuyX</b></>)}
              {step(3, pt ? <>Toque em <b>Notificações</b> e ative o botão</> : <>Tap <b>Notifications</b> and toggle ON</>)}
              {step(4, pt ? <><b>Volte ao app</b> e toque em "Ativar" no banner</> : <><b>Return to the app</b> and tap "Enable"</>)}
            </>)}
            {isIOS && !isStandalone && (<>
              {step(1, pt ? <>No Safari, toque em <b>⎋ Compartilhar</b> (barra inferior)</> : <>In Safari, tap <b>⎋ Share</b> (bottom bar)</>)}
              {step(2, pt ? <>Toque em <b>"Adicionar à Tela de Início"</b></> : <>Tap <b>"Add to Home Screen"</b></>)}
              {step(3, pt ? <>Abra o app pela <b>tela inicial</b> do iPhone</> : <>Open the app from your <b>Home Screen</b></>)}
              {step(4, pt ? <>Toque em "Ativar" no banner de notificações</> : <>Tap "Enable" on the notification banner</>)}
            </>)}
            {!isIOS && (<>
              {step(1, pt ? <>Toque no ícone de <b>cadeado</b> na barra de endereço</> : <>Tap the <b>lock icon</b> in the address bar</>)}
              {step(2, pt ? <>Toque em <b>Permissões → Notificações → Permitir</b></> : <>Tap <b>Permissions → Notifications → Allow</b></>)}
              {step(3, pt ? <><b>Recarregue a página</b> e toque em "Ativar"</> : <><b>Reload the page</b> and tap "Enable"</>)}
            </>)}
            <button onClick={()=>setNotifHelpOpen(false)} style={{
              width:'100%', height:50, borderRadius:14, border:'none', cursor:'pointer', marginTop:8,
              background:'linear-gradient(135deg,#0EBAC7,#0D7280)', color:'#fff',
              fontWeight:700, fontSize:15, fontFamily:'inherit',
            }}>
              {pt ? 'Entendido' : 'Got it'}
            </button>
          </div>
        </div>
      );
    })()}


    </div>
  );
}

// ── Real interactive map with Leaflet ────────────────────────
function LeafletMapBlock({ jobs, highlighted, onPinClick, fullHeight=false }) {
  const containerRef = React.useRef(null);
  const mapRef       = React.useRef(null);
  const markersRef   = React.useRef({});

  // Use the full South Florida geocoordinates already defined in brand.jsx
  const COORDS = window.FL_CITY_COORDS || {};

  React.useEffect(() => {
    if (!containerRef.current || typeof L === 'undefined') return;

    const map = L.map(containerRef.current, {
      center: [26.19, -80.22],
      zoom: 10,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      keyboard: false,        // ← prevents Leaflet from setting tabindex + calling container.focus()
      tap: false,             // ← prevents iOS tap handler that triggers focus
    });

    // CartoDB light tiles — clean, Apple Maps-like aesthetic
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Attribution (small) bottom-left
    L.control.attribution({ position:'bottomleft', prefix:false })
      .addAttribution('© <a href="https://carto.com">CartoDB</a> © <a href="https://www.openstreetmap.org/copyright">OSM</a>')
      .addTo(map);

    mapRef.current = map;

    // Prevent Leaflet's map container from stealing focus and triggering scroll-into-view
    const container = map.getContainer();
    container.setAttribute('tabindex', '-1');
    container.addEventListener('focus', () => container.blur(), true);

    // Prevent iOS pull-to-refresh while dragging the map.
    // Must be on document (not container) so Leaflet's own document-level handlers still fire.
    const stopPull = (e) => { if (container.contains(e.target)) e.preventDefault(); };
    document.addEventListener('touchmove', stopPull, { passive: false });

    // Force recalc after layout settles
    setTimeout(() => { if (mapRef.current) mapRef.current.invalidateSize(); }, 120);

    return () => {
      document.removeEventListener('touchmove', stopPull);
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
      markersRef.current = {};
    };
  }, []);

  // Update markers whenever jobs list changes
  React.useEffect(() => {
    if (!mapRef.current || typeof L === 'undefined') return;
    // Remove all existing markers
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};
    // Add a marker for each job that has known coordinates
    jobs.forEach(job => {
      const coords = COORDS[job.loc];
      if (!coords) return;
      const isNeg = job.price === 'neg';
      const lbl   = isNeg ? 'NEG' : `$${job.price}`;
      const bg    = isNeg ? '#f59e0b' : '#2563eb';
      const icon  = L.divIcon({
        html:`<div style="background:${bg};color:#fff;font-size:11px;font-weight:700;padding:5px 9px;border-radius:14px;white-space:nowrap;box-shadow:0 3px 10px rgba(0,0,0,0.28);border:2.5px solid rgba(255,255,255,0.95);font-family:Inter,system-ui,sans-serif;line-height:1;">${lbl}</div>`,
        className:'',
        iconAnchor:[22,14],
      });
      const marker = L.marker(coords, { icon })
        .addTo(mapRef.current)
        .on('click', () => onPinClick(job));
      markersRef.current[job.id] = marker;
    });
  }, [jobs]);

  // Pan to highlighted job
  React.useEffect(() => {
    if (!highlighted || !mapRef.current || !markersRef.current[highlighted]) return;
    mapRef.current.panTo(markersRef.current[highlighted].getLatLng(), { animate:true, duration:0.4 });
  }, [highlighted]);

  return (
    <div style={{
      height: fullHeight ? '100%' : 200, overflow:'hidden', padding:0,
      border: fullHeight ? 'none' : '0.5px solid var(--pg-ink-200)',
      borderRadius: fullHeight ? 0 : 14,
      background:'var(--pg-ink-100)',
      isolation: 'isolate',
      overscrollBehavior: 'none',
    }}>
      <div ref={containerRef} style={{ height:'100%', width:'100%', overscrollBehavior:'none' }}/>
    </div>
  );
}

// ── Detail view ──────────────────────────────────────────────
function QuickPoolDetails({ job, user, t, lang, applied, onApply, onUnlock, onChat, onClose, onDelete, onComplete, openPublicProfile, openEditPost, onStatusChange, onMyJobAccepted }) {
  const isOwn   = job._live && user?.uid && job.poster_id === user.uid;
  const isAdmin = user?.role === 'admin';
  const isOwnFilled = isOwn && job.status === 'filled';
  const locked  = !isOwn && user.tier !== 'premium';
  const [confirmDialog,  setConfirmDialog]  = React.useState(null);
  const [applicants,     setApplicants]     = React.useState([]);
  const [loadingApps,    setLoadingApps]    = React.useState(false);
  const [showApplicants, setShowApplicants] = React.useState(false);
  const applicantsPanelRef = React.useRef(null);
  React.useEffect(() => {
    if (showApplicants && applicantsPanelRef.current) {
      setTimeout(() => applicantsPanelRef.current?.scrollIntoView({ behavior:'smooth', block:'nearest' }), 50);
    }
  }, [showApplicants]);
  const [myApp,          setMyApp]          = React.useState(null);
  const [showConsent,    setShowConsent]    = React.useState(false);
  const [sharePhone,     setSharePhone]     = React.useState(false);
  const [showRating,     setShowRating]     = React.useState(false);
  const [ratingStars,    setRatingStars]    = React.useState(0);
  const [ratingComment,  setRatingComment]  = React.useState('');
  const [ratingSubmitting, setRatingSubmitting] = React.useState(false);

  // Photo upload state (pool guy)
  const [showPhotoUpload,   setShowPhotoUpload]   = React.useState(false);
  const [uploadedPhotos,    setUploadedPhotos]    = React.useState({});
  const [photosSubmitting,  setPhotosSubmitting]  = React.useState(false);
  const [photosSubmitted,   setPhotosSubmitted]   = React.useState(!!(myApp && myApp.submitted_photos && myApp.submitted_photos.length > 0));
  const [poolGuyDone,       setPoolGuyDone]       = React.useState(!!(myApp && myApp.pool_guy_done));

  // Pool guy rates owner
  const [showOwnerRating,      setShowOwnerRating]      = React.useState(false);
  const [ownerRatingStars,     setOwnerRatingStars]     = React.useState(0);
  const [ownerRatingComment,   setOwnerRatingComment]   = React.useState('');
  const [ownerRatingSubmitting,setOwnerRatingSubmitting]= React.useState(false);

  React.useEffect(() => {
    setPhotosSubmitted(!!(myApp && myApp.submitted_photos && myApp.submitted_photos.length > 0));
    setPoolGuyDone(!!(myApp && myApp.pool_guy_done));
  }, [myApp]);

  const requiredPhotos = job.required_photos || [];

  const photoLabel = (p) => p.startsWith('custom:') ? p.slice(7)
    : p==='before'   ? (lang==='pt'?'Foto antes':'Before photo')
    : p==='after'    ? (lang==='pt'?'Foto depois':'After photo')
    : p==='vacuum'   ? (lang==='pt'?'Foto vacum':'Vacuum photo')
    : p==='chemical' ? (lang==='pt'?'Foto químico':'Chemical photo') : p;

  const handlePhotoSelect = async (photoKey, file) => {
    if (!file) return;
    setUploadedPhotos(prev => ({ ...prev, [photoKey]: { file, url: URL.createObjectURL(file), uploading: true, error: null } }));
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `${job.id}/${(user?.uid||'anon')}_${photoKey}_${Date.now()}.${ext}`;
    const { error: uploadErr } = await window.sb.storage.from('job-photos').upload(path, file, { upsert: true, contentType: file.type });
    if (uploadErr) {
      console.error('Photo upload error:', uploadErr);
      setUploadedPhotos(prev => ({ ...prev, [photoKey]: { ...prev[photoKey], uploading: false, error: uploadErr.message } }));
      return;
    }
    const { data: pub } = window.sb.storage.from('job-photos').getPublicUrl(path);
    setUploadedPhotos(prev => ({ ...prev, [photoKey]: { file, url: pub.publicUrl, uploading: false, error: null } }));
  };

  // Only allow submit when all photos are uploaded AND have a valid public URL (not blob:)
  const allPhotosUploaded = requiredPhotos.length > 0 && requiredPhotos.every(p =>
    uploadedPhotos[p] && !uploadedPhotos[p].uploading && !uploadedPhotos[p].error &&
    uploadedPhotos[p].url && !uploadedPhotos[p].url.startsWith('blob:')
  );

  const submitPhotos = async () => {
    if (!allPhotosUploaded || !myApp || !window.sb) return;
    setPhotosSubmitting(true);
    const photoList = requiredPhotos.map(p => ({ type: p, url: uploadedPhotos[p].url }));
    const { error } = await window.sb.from('quick_pool_applications').update({ submitted_photos: photoList }).eq('id', myApp.id);
    setPhotosSubmitting(false);
    if (error) {
      console.error('submitPhotos error:', error);
      return;
    }
    setMyApp(prev => prev ? { ...prev, submitted_photos: photoList } : prev);
    setShowPhotoUpload(false);
    setPhotosSubmitted(true);
  };

  const submitOwnerRatingAndFinishPoolGuy = async () => {
    setOwnerRatingSubmitting(true);
    if (window.sb) {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      // Blind mutual rating: create/fill my own row, plus an empty placeholder for the
      // owner so loadPendingRatings picks it up and reminds them to rate back — same
      // pattern used everywhere else in the app (marketplace sales, tech reviews).
      if (ownerRatingStars > 0) {
        await window.sb.from('ratings').upsert({
          listing_id: job.id,
          listing_name: tr(job.title, lang),
          from_id: user.uid,
          to_id: job.poster_id,
          from_name: user.name || user.email || 'Pool Guy',
          stars: ownerRatingStars,
          comment: ownerRatingComment.trim() || null,
          pending: true,
          connection_type: 'quickpool',
          connection_id: String(job.id),
          expires_at: expiresAt,
        }, { onConflict: 'from_id,to_id' }).then(()=>{});
        window.sb.rpc('reveal_mutual_rating', { p_a: user.uid, p_b: job.poster_id }).catch(()=>{});
      }
      await window.sb.from('ratings').insert({
        listing_id: job.id,
        listing_name: tr(job.title, lang),
        from_id: job.poster_id,
        from_name: job.poster || '',
        to_id: user.uid,
        stars: null,
        comment: '',
        pending: true,
        connection_type: 'quickpool',
        connection_id: String(job.id),
        expires_at: expiresAt,
      }).catch(()=>{}); // ignore duplicate-key — placeholder may already exist
    }
    // Mark pool_guy_done; also re-save submitted_photos atomically (in case first save failed)
    if (myApp && window.sb) {
      const patch = { pool_guy_done: true, pool_guy_done_at: new Date().toISOString() };
      // Include photos from local state as safety net (uploaded but possibly not persisted yet)
      const localPhotos = requiredPhotos.length > 0
        ? requiredPhotos.filter(p => uploadedPhotos[p]?.url && !uploadedPhotos[p].url.startsWith('blob:'))
            .map(p => ({ type: p, url: uploadedPhotos[p].url }))
        : null;
      // Prefer myApp.submitted_photos (already persisted) over local state
      const photosToSave = (myApp.submitted_photos && myApp.submitted_photos.length > 0)
        ? myApp.submitted_photos
        : (localPhotos && localPhotos.length > 0 ? localPhotos : null);
      if (photosToSave) patch.submitted_photos = photosToSave;
      await window.sb.from('quick_pool_applications').update(patch).eq('id', myApp.id);
    }
    // Notify owner — push + in-app notification
    if (job.poster_id && window.sb) {
      const pushTitle = lang==='pt' ? '✅ Serviço concluído!' : '✅ Job completed!';
      const pushBody  = lang==='pt'
        ? `${user.name||'Pool guy'} finalizou "${tr(job.title,lang)}". Confira as fotos e avalie!`
        : `${user.name||'Pool guy'} completed "${tr(job.title,lang)}". Check the photos and rate!`;
      window.sendPush && window.sendPush(job.poster_id, pushTitle, pushBody, `/#quick?job=${job.id}`, 'quick');
      // In-app notification so owner sees it even without push
      window.sb.from('notifications').insert({
        user_id: job.poster_id,
        type: 'quick_pool_done',
        title: pushTitle,
        body:  pushBody,
        link_id: String(job.id),
      }).catch(() => {});
    }
    setOwnerRatingSubmitting(false);
    setShowOwnerRating(false);
    setPoolGuyDone(true);
  };

  const loadApplicants = React.useCallback(() => {
    if (!window.sb || !job._live) return;
    if (isOwn) {
      window.sb.from('quick_pool_applications')
        .select('*').eq('job_id', job.id).order('created_at', { ascending: true })
        .then(({ data }) => { setApplicants(data || []); setLoadingApps(false); });
    } else if (user?.uid) {
      window.sb.from('quick_pool_applications')
        .select('id,status,applicant_phone,submitted_photos,pool_guy_done').eq('job_id', job.id).eq('applicant_id', user.uid)
        .limit(1)
        .then(({ data }) => {
          const app = (data && data[0]) || null;
          setMyApp(app);
          if (app?.status === 'accepted') onMyJobAccepted && onMyJobAccepted(job.id);
        });
    }
  }, [isOwn, job.id, job._live, user?.uid]);

  // Load on mount
  React.useEffect(() => {
    if (isOwn) setLoadingApps(true);
    loadApplicants();
  }, [loadApplicants]);

  // Poll every 8s when owner is waiting for pool guy to finish (no pool_guy_done yet)
  const acceptedApp = applicants.find(a => a.status === 'accepted');
  React.useEffect(() => {
    if (!isOwn || job.status !== 'filled' || acceptedApp?.pool_guy_done) return;
    const interval = setInterval(loadApplicants, 8000);
    return () => clearInterval(interval);
  }, [isOwn, job.status, acceptedApp?.pool_guy_done, loadApplicants]);

  const acceptApplicant = async (appId, applicantId) => {
    if (!window.sb) return;
    await window.sb.from('quick_pool_applications').update({ status: 'accepted' }).eq('id', appId);
    await window.sb.from('quick_pool_applications').update({ status: 'rejected' }).neq('id', appId).eq('job_id', job.id);
    await window.sb.from('quick_pool_jobs').update({ status: 'filled' }).eq('id', job.id);
    // Notify rejected applicants
    applicants.forEach(a => {
      if (a.id === appId) return;
      window.sendPush && window.sendPush(a.applicant_id,
        lang==='pt' ? '❌ Candidatura não selecionada' : '❌ Application not selected',
        lang==='pt' ? `Outra pessoa foi escolhida para "${tr(job.title,lang)}". Continue tentando!` : `Someone else was chosen for "${tr(job.title,lang)}". Keep trying!`,
        '/#express-pools',
        'quick'
      );
    });
    setApplicants(prev => prev.map(a => ({ ...a, status: a.id === appId ? 'accepted' : 'rejected' })));
    onStatusChange && onStatusChange('filled');
    // Notify accepted applicant with deep link to this job
    window.sendPush && window.sendPush(applicantId,
      lang==='pt' ? '🎉 Candidatura aceita!' : '🎉 Application accepted!',
      lang==='pt' ? `Sua candidatura para "${tr(job.title,lang)}" foi aceita.` : `Your application for "${tr(job.title,lang)}" was accepted.`,
      `/#quick?job=${job.id}`,
      'quick'
    );
  };

  const withdrawApp = async () => {
    if (!window.sb || !myApp) return;
    await window.sb.from('quick_pool_applications').update({ status: 'withdrawn' }).eq('id', myApp.id);
    setMyApp(null);
  };


  const submitRatingAndFinalize = async () => {
    setRatingSubmitting(true);
    if (acceptedApp && window.sb) {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      if (ratingStars > 0) {
        // Fills the pool guy's placeholder if it already exists (created when they
        // finished the job), or creates the row if it doesn't — blind mutual rating.
        await window.sb.from('ratings').upsert({
          listing_id: job.id,
          listing_name: tr(job.title, lang),
          from_id: user.uid,
          to_id: acceptedApp.applicant_id,
          from_name: user.name || user.email || 'Pool Owner',
          stars: ratingStars,
          comment: ratingComment.trim() || null,
          pending: true,
          connection_type: 'quickpool',
          connection_id: String(job.id),
          expires_at: expiresAt,
        }, { onConflict: 'from_id,to_id' }).then(()=>{});
        window.sb.rpc('reveal_mutual_rating', { p_a: user.uid, p_b: acceptedApp.applicant_id }).catch(()=>{});
      }
      await window.sb.from('ratings').insert({
        listing_id: job.id,
        listing_name: tr(job.title, lang),
        from_id: acceptedApp.applicant_id,
        from_name: acceptedApp.applicant_name || '',
        to_id: user.uid,
        stars: null,
        comment: '',
        pending: true,
        connection_type: 'quickpool',
        connection_id: String(job.id),
        expires_at: expiresAt,
      }).catch(()=>{}); // ignore duplicate-key — placeholder may already exist
    }
    setRatingSubmitting(false);
    setShowRating(false);
    onComplete && onComplete(job.id);
  };

  return (
    <>
    <div style={{display:'flex', flexDirection:'column', minHeight:'100%'}}>
      {/* Sticky top bar with back arrow */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'calc(env(safe-area-inset-top, 0px) + 12px) 18px 12px',
        borderBottom:'0.5px solid var(--pg-ink-200)',
        position:'sticky', top:0, background:'var(--pg-bg)', zIndex:10,
      }}>
        <button onClick={onClose} style={{
          display:'flex', alignItems:'center', gap:4,
          border:'none', background:'transparent', cursor:'pointer',
          color:'var(--pg-blue-500)', fontSize:14, fontWeight:600, padding:0, fontFamily:'inherit',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          {lang==='pt'?'Piscinas Rápidas':lang==='es'?'Piscinas Rápidas':'Express Pools'}
        </button>
        {isOwnFilled && (
          <div style={{
            height:32, padding:'0 12px', borderRadius:9,
            background:'#FFFBEB', border:'1px solid #FCD34D',
            color:'#92400E', fontSize:12, fontWeight:700,
            display:'flex', alignItems:'center', gap:6,
          }}>
            ⏳ {lang==='pt'?'Em andamento':lang==='es'?'En curso':'In progress'}
          </div>
        )}
        {((isOwn && !isOwnFilled) || (isAdmin && !isOwn && job._live)) && (
          <div style={{display:'flex', alignItems:'center', gap:6}}>
            {isAdmin && !isOwn && job._live && openEditPost && (
              <button onClick={()=>openEditPost({
                id: job.id,
                title: typeof job.title==='object' ? (job.title[lang]||job.title.pt||job.title.en) : job.title,
                description: typeof job.body==='object' ? (job.body[lang]||job.body.pt||job.body.en) : '',
                city: job.loc, pool_type: job.type, extras: job.extras,
                price_negotiable: job.price==='neg', price_per_pool: job.price==='neg' ? null : job.price,
                poster_phone: job.poster_phone, pool_address: job.pool_address,
                required_photos: job.required_photos || [],
              })} title={lang==='pt'?'Editar (admin)':lang==='es'?'Editar (admin)':'Edit (admin)'} style={{
                display:'flex', alignItems:'center', gap:5, height:32, padding:'0 12px', borderRadius:9,
                border:'1px solid var(--pg-ink-300)', background:'var(--pg-ink-100)', cursor:'pointer', fontSize:12, fontWeight:600, color:'var(--pg-ink-700)',
              }}>
                {Icon.edit(13,'var(--pg-ink-700)')}
                {lang==='pt'?'Editar':lang==='es'?'Editar':'Edit'}
              </button>
            )}
            <button onClick={()=>setConfirmDialog({
              message: lang==='pt'?'Excluir publicação?':lang==='es'?'¿Eliminar publicación?':'Delete posting?',
              subMessage: lang==='pt'?'Essa vaga será removida permanentemente.':lang==='es'?'Esta vacante será eliminada permanentemente.':'This job will be permanently removed.',
              confirmLabel: lang==='pt'?'Sim, excluir':lang==='es'?'Sí, eliminar':'Yes, delete',
              onConfirm: ()=>{ onDelete && onDelete(job.id); onClose(); setConfirmDialog(null); },
            })} style={{
              display:'flex', alignItems:'center', gap:5, height:32, padding:'0 12px', borderRadius:9,
              border:'1px solid #FECACA', background:'#FEF2F2', cursor:'pointer', fontSize:12, fontWeight:600, color:'#DC2626',
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
              </svg>
              {lang==='pt'?'Excluir':lang==='es'?'Eliminar':'Delete'}
            </button>
          </div>
        )}
      </div>

      <div style={{padding:'16px 18px 100px', flex:1}}>
        <h2 style={{margin:0, fontFamily:'var(--pg-font-display)', fontSize:22, fontWeight:700, letterSpacing:'-0.02em', lineHeight:1.2}}><Tx lang={lang}>{tr(job.title,'pt')}</Tx></h2>
        <div style={{display:'flex', alignItems:'center', gap:6, marginTop:8, fontSize:13, color:'var(--pg-ink-700)'}}>
          {Icon.pin(14)} {job.loc} · {tr(job.dist, lang)}
        </div>

        <div style={{
          marginTop:14, padding:'14px 16px', borderRadius:14,
          background:'var(--pg-blue-50)', border:'0.5px solid var(--pg-blue-100)',
          display:'flex', justifyContent:'space-between', alignItems:'center',
        }}>
          <div>
            <div style={{fontSize:11, color:'var(--pg-ink-500)', letterSpacing:'0.05em', fontWeight:600}}>{t.offer}</div>
            {job.price === 'neg' ? (
              <div style={{fontSize:22, fontWeight:700, marginTop:2, fontFamily:'var(--pg-font-display)'}}>{t.negotiable}</div>
            ) : (
              <div style={{fontFamily:'var(--pg-font-display)', fontSize:26, fontWeight:700, color:'var(--pg-blue-500)', letterSpacing:'-0.02em', marginTop:2}}>
                ${job.price} <span style={{fontSize:13, color:'var(--pg-ink-500)', fontWeight:500}}>· {t.perPool}</span>
              </div>
            )}
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:11, color:'var(--pg-ink-500)', letterSpacing:'0.05em', fontWeight:600}}>{t.whenLabel}</div>
            <div style={{fontSize:13, fontWeight:600, marginTop:2, maxWidth:90}}>{tr(job.when, lang)}</div>
          </div>
        </div>

        {/* Access / pool details */}
        {job.extras && (
          <div className="pg-card" style={{padding:'12px 14px', marginTop:14}}>
            <div style={{fontSize:11, color:'var(--pg-ink-500)', fontWeight:600, letterSpacing:'0.05em', marginBottom:8}}>{t.accessDetails}</div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
              {job.type === 'condo' && job.extras.gate_code && (
                <DetailPill icon={Icon.key(14, 'var(--pg-blue-700)')} label={t.gateCode}
                  value={locked ? '••••' : job.extras.gate_code}/>
              )}
              {job.type === 'condo' && (
                <DetailPill icon={Icon.user(14, 'var(--pg-blue-700)')} label={t.doorman} value={job.extras.doorman ? t.yes : t.no}/>
              )}
              <DetailPill icon={Icon.dog(14, 'var(--pg-blue-700)')} label={t.dogLbl} value={job.extras.dog ? t.yes : t.no}/>
              <DetailPill icon={Icon.pool(14, 'var(--pg-blue-700)')} label={t.saltwater} value={job.extras.saltwater ? t.yes : t.no}/>
            </div>
          </div>
        )}

        {/* Required photos list */}
        {job.required_photos && job.required_photos.length > 0 && (
          <div style={{marginTop:14, padding:'12px 14px', borderRadius:12, background:'var(--pg-ink-50)', border:'1px solid var(--pg-ink-200)'}}>
            <div style={{fontSize:11, color:'var(--pg-ink-500)', fontWeight:700, letterSpacing:'0.05em', textTransform:'uppercase', marginBottom:8}}>
              {lang==='pt'?'📸 FOTOS OBRIGATÓRIAS':lang==='es'?'📸 FOTOS OBLIGATORIAS':'📸 REQUIRED PHOTOS'}
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:6}}>
              {job.required_photos.map((p,i) => {
                const label = p.startsWith('custom:') ? p.slice(7)
                  : p==='before' ? (lang==='pt'?'Foto antes':'Before photo')
                  : p==='after'  ? (lang==='pt'?'Foto depois':'After photo')
                  : p==='vacuum' ? (lang==='pt'?'Foto vacum':'Vacuum photo')
                  : p==='chemical' ? (lang==='pt'?'Foto químico':'Chemical photo') : p;
                return (
                  <div key={i} style={{display:'flex', alignItems:'center', gap:8, fontSize:13, color:'var(--pg-ink-700)'}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--pg-blue-500)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/><circle cx="12" cy="12" r="3" fill="var(--pg-blue-500)" stroke="none"/></svg>
                    {label}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tr(job.body, 'pt') ? (
          <div style={{marginTop:14}}>
            <div style={{fontSize:11, color:'var(--pg-ink-500)', fontWeight:600, letterSpacing:'0.05em', marginBottom:6}}>
              {lang==='pt'?'NOTAS PARA CANDIDATOS':lang==='es'?'NOTAS PARA CANDIDATOS':'NOTES FOR APPLICANTS'}
            </div>
            <p style={{margin:0, fontSize:14, lineHeight:1.5, color:'var(--pg-ink-700)'}}><Tx lang={lang}>{tr(job.body,'pt')}</Tx></p>
          </div>
        ) : null}

        <div className="pg-card" style={{padding:14, marginTop:14, display:'flex', alignItems:'center', gap:12,
          cursor: locked ? 'pointer' : (job.poster_id ? 'pointer' : 'default')}}
          onClick={()=>locked ? onUnlock && onUnlock() : (job.poster_id && openPublicProfile({ uid: job.poster_id, name: job.poster }))}>
          <div style={{filter: locked ? 'blur(6px)' : 'none'}}>
            <AvatarFetch uid={job.poster_id} name={job.poster} size={48}/>
          </div>
          <div style={{flex:1, minWidth:0, filter: locked ? 'blur(5px)' : 'none', userSelect: locked ? 'none' : 'auto'}}>
            <div style={{fontSize:15, fontWeight:600}}>{locked ? 'Pool Guy' : job.poster}</div>
            <div style={{display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--pg-ink-500)', marginTop:2}}>
              <Stars rating={job.rating} size={11}/> {job.rating} · 26 {t.completedJobs}
            </div>
          </div>
          {locked ? (
            <span className="pg-chip" style={{fontSize:11}}>{Icon.lock(11, 'var(--pg-ink-500)')} {t.unlock}</span>
          ) : (
            <span className="pg-chip pg-chip-aqua" style={{fontSize:11}}>{Icon.shield(11, 'var(--pg-aqua-700)')} {t.verified}</span>
          )}
        </div>

        {/* Phone + address — visible to poster OR accepted applicant */}
        {(isOwn || myApp?.status === 'accepted') && (job.poster_phone || job.pool_address) && (
          <div className="pg-card" style={{padding:'12px 14px', marginTop:12, display:'flex', flexDirection:'column', gap:10}}>
            {job.poster_phone && (
              <div style={{display:'flex', alignItems:'center', gap:10}}>
                {Icon.phone ? Icon.phone(14,'var(--pg-blue-700)') : null}
                <div style={{minWidth:0}}>
                  <div style={{fontSize:10, fontWeight:700, color:'var(--pg-ink-500)', letterSpacing:'0.05em', textTransform:'uppercase', marginBottom:2}}>
                    {lang==='pt'?'Telefone':lang==='es'?'Teléfono':'Phone'}
                  </div>
                  <a href={`tel:${job.poster_phone}`} style={{fontSize:14, fontWeight:600, color:'var(--pg-blue-600)', textDecoration:'none'}}>
                    {job.poster_phone}
                  </a>
                </div>
              </div>
            )}
            {job.pool_address && (
              <div style={{display:'flex', alignItems:'flex-start', gap:10}}>
                {Icon.pin(14,'var(--pg-blue-700)')}
                <div style={{minWidth:0}}>
                  <div style={{fontSize:10, fontWeight:700, color:'var(--pg-ink-500)', letterSpacing:'0.05em', textTransform:'uppercase', marginBottom:2}}>
                    {lang==='pt'?'Endereço':lang==='es'?'Dirección':'Address'}
                  </div>
                  <div style={{fontSize:14, fontWeight:600, color:'var(--pg-ink-900)'}}>{job.pool_address}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {locked && (
          <div style={{
            marginTop:14, padding:16, borderRadius:14, color:'#fff',
            background:'linear-gradient(135deg, var(--pg-blue-700), oklch(0.45 0.15 230))',
            display:'flex', gap:12, alignItems:'flex-start',
          }}>
            {Icon.crown(22, 'oklch(0.85 0.15 90)')}
            <div style={{flex:1}}>
              <div style={{fontFamily:'var(--pg-font-display)', fontSize:14, fontWeight:700}}>{t.premiumUnlocks}</div>
              <div style={{fontSize:12, opacity:0.85, marginTop:3, lineHeight:1.4}}>
                {t.premiumUnlocksDesc}
              </div>
              <button onClick={onUnlock} className="pg-btn pg-btn-aqua" style={{height:36, padding:'0 14px', fontSize:13, marginTop:10, borderRadius:999}}>
                {t.unlockPrice}
              </button>
            </div>
          </div>
        )}

        {/* Applicants panel — visible to owner, inside scroll content */}
        {isOwn && showApplicants && (
          <div ref={applicantsPanelRef} style={{marginTop:16, borderRadius:14, border:'1px solid var(--pg-ink-200)', overflow:'hidden'}}>
            <div style={{padding:'12px 14px 8px', fontSize:11, fontWeight:700, color:'var(--pg-ink-500)', letterSpacing:'0.06em', textTransform:'uppercase', background:'var(--pg-ink-50)'}}>
              {lang==='pt'?'Candidatos':lang==='es'?'Candidatos':'Applicants'} ({applicants.length})
            </div>
            {loadingApps && <div style={{padding:'14px', fontSize:13, color:'var(--pg-ink-400)', textAlign:'center'}}>...</div>}
            {!loadingApps && applicants.length === 0 && (
              <div style={{padding:'14px 14px', fontSize:13, color:'var(--pg-ink-400)'}}>
                {lang==='pt'?'Nenhuma candidatura ainda.':lang==='es'?'Ninguna candidatura aún.':'No applicants yet.'}
              </div>
            )}
            {applicants.map(a => (
              <div key={a.id} style={{borderTop:'0.5px solid var(--pg-ink-100)', background: a.status==='accepted' ? '#F0FDF4' : a.status==='rejected' ? '#FFF1F1' : 'var(--pg-ink-50)'}}>
                <div style={{display:'flex', alignItems:'center', gap:10, padding:'10px 14px'}}>
                  <div onClick={()=>a.applicant_id && openPublicProfile({ uid: a.applicant_id, name: a.applicant_name })}
                    style={{cursor: a.applicant_id ? 'pointer' : 'default', display:'flex', alignItems:'center', gap:10, flex:1, minWidth:0}}>
                  <AvatarFetch uid={a.applicant_id} name={a.applicant_name} size={34}/>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:13, fontWeight:600, color: a.status==='accepted' ? '#14532D' : a.status==='rejected' ? '#7F1D1D' : 'var(--pg-ink-900)'}}>{a.applicant_name}</div>
                    {a.applicant_phone && (
                      <a href={`tel:${a.applicant_phone}`} onClick={e=>e.stopPropagation()} style={{fontSize:11, color: a.status==='accepted' ? '#15803D' : 'var(--pg-blue-600)', fontWeight:500, textDecoration:'none'}}>
                        {a.applicant_phone}
                      </a>
                    )}
                  </div>
                  </div>
                  {a.status === 'accepted' ? (
                    <span style={{fontSize:11, fontWeight:700, color:'#16A34A', background:'#DCFCE7', padding:'3px 8px', borderRadius:8}}>
                      {lang==='pt'?'Aceito':lang==='es'?'Aceptado':'Accepted'}
                    </span>
                  ) : a.status === 'rejected' ? (
                    <span style={{fontSize:11, fontWeight:700, color:'#DC2626', background:'#FEE2E2', padding:'3px 8px', borderRadius:8}}>
                      {lang==='pt'?'Recusado':lang==='es'?'Rechazado':'Rejected'}
                    </span>
                  ) : (
                    <button onClick={()=>acceptApplicant(a.id, a.applicant_id)} style={{
                      height:30, padding:'0 12px', borderRadius:8, border:'none', cursor:'pointer',
                      background:'linear-gradient(135deg,#16A34A,#22C55E)', color:'#fff', fontSize:12, fontWeight:700,
                    }}>
                      {lang==='pt'?'Aceitar':lang==='es'?'Aceptar':'Accept'}
                    </button>
                  )}
                </div>
                {/* Pool guy done badge */}
                {a.status === 'accepted' && a.pool_guy_done && (
                  <div style={{margin:'0 14px 8px', padding:'8px 12px', borderRadius:10, background:'#F0FDF4', border:'1px solid #86EFAC', fontSize:12, fontWeight:700, color:'#15803D'}}>
                    ✅ {lang==='pt'?'Pool guy finalizou o serviço — confira as fotos e avalie!':'Pool guy completed the job — check photos and leave a review!'}
                  </div>
                )}
                {/* Submitted photos (visible to owner for accepted applicant) */}
                {a.status === 'accepted' && a.submitted_photos && a.submitted_photos.length > 0 && (
                  <div style={{padding:'0 14px 12px'}}>
                    <div style={{fontSize:11, fontWeight:700, color:'var(--pg-ink-500)', marginBottom:6}}>
                      📸 {lang==='pt'?'Fotos enviadas':'Submitted photos'} ({a.submitted_photos.length})
                    </div>
                    <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                      {a.submitted_photos.map((p, i) => (
                        <a key={i} href={p.url} target="_blank" rel="noreferrer" style={{display:'block',borderRadius:8,overflow:'hidden',flexShrink:0}}>
                          <img src={p.url} alt={photoLabel(p.type)} style={{width:60,height:60,objectFit:'cover',display:'block'}}/>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
      </div>{/* end content div */}

      {/* Rating modal — shown to owner when marking complete */}
      {showRating && (
        <div style={{
          position:'fixed', inset:0, zIndex:9999,
          background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'flex-end',
        }}>
          <div style={{
            width:'100%', maxWidth:520, margin:'0 auto',
            background:'var(--pg-white)', borderRadius:'20px 20px 0 0',
            padding:'20px 18px 32px', boxShadow:'0 -8px 32px rgba(0,0,0,0.18)',
          }}>
            <div style={{width:40, height:4, borderRadius:4, background:'var(--pg-ink-200)', margin:'0 auto 18px'}}/>
            <h3 style={{margin:'0 0 4px', fontSize:17, fontWeight:700, textAlign:'center'}}>
              {lang==='pt'?'Como foi o serviço?':'How was the service?'}
            </h3>
            {acceptedApp && (
              <div style={{textAlign:'center', fontSize:13, color:'var(--pg-ink-500)', marginBottom:16}}>
                {acceptedApp.applicant_name}
              </div>
            )}
            <div style={{display:'flex', justifyContent:'center', gap:10, marginBottom:14}}>
              {[1,2,3,4,5].map(s=>(
                <button key={s} onClick={()=>setRatingStars(s)} style={{
                  fontSize:32, background:'transparent', border:'none', cursor:'pointer',
                  opacity: s<=ratingStars ? 1 : 0.25, transform: s<=ratingStars ? 'scale(1.1)' : 'scale(1)',
                  transition:'all 0.15s',
                }}>★</button>
              ))}
            </div>
            <textarea value={ratingComment} onChange={e=>setRatingComment(e.target.value)}
              placeholder={lang==='pt'?'Comentário opcional...':'Optional comment...'}
              style={{width:'100%',minHeight:64,borderRadius:10,border:'1px solid var(--pg-ink-200)',padding:'10px 12px',fontSize:14,fontFamily:'inherit',resize:'none',outline:'none',boxSizing:'border-box',marginBottom:12}}/>
            <div style={{display:'flex', gap:8}}>
              <button onClick={()=>{ setShowRating(false); onComplete && onComplete(job.id); }} style={{
                flex:1, height:46, borderRadius:12, border:'1px solid var(--pg-ink-200)',
                background:'var(--pg-ink-50)', color:'var(--pg-ink-600)', fontSize:13, fontWeight:600, cursor:'pointer',
              }}>
                {lang==='pt'?'Pular':'Skip'}
              </button>
              <button onClick={submitRatingAndFinalize} disabled={ratingStars===0||ratingSubmitting} style={{
                flex:2, height:46, borderRadius:12, border:'none', cursor:ratingStars===0?'default':'pointer',
                background: ratingStars>0 ? 'linear-gradient(135deg,#16A34A,#22C55E)' : 'var(--pg-ink-200)',
                color:'#fff', fontSize:14, fontWeight:700,
              }}>
                {ratingSubmitting ? '...' : (lang==='pt'?'Avaliar e finalizar':'Rate & complete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo upload modal — for accepted pool guy */}
      {showPhotoUpload && (
        <div style={{position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'flex-end'}}>
          <div style={{width:'100%', maxWidth:520, margin:'0 auto', background:'var(--pg-white)', borderRadius:'20px 20px 0 0', padding:'20px 18px 32px', boxShadow:'0 -8px 32px rgba(0,0,0,0.18)', maxHeight:'85vh', overflowY:'auto'}}>
            <div style={{width:40, height:4, borderRadius:4, background:'var(--pg-ink-200)', margin:'0 auto 16px'}}/>
            <h3 style={{margin:'0 0 4px', fontSize:17, fontWeight:700, textAlign:'center'}}>
              📸 {lang==='pt'?'Fotos obrigatórias':lang==='es'?'Fotos obligatorias':'Required photos'}
            </h3>
            <p style={{margin:'0 0 20px', fontSize:13, color:'var(--pg-ink-500)', textAlign:'center', lineHeight:1.4}}>
              {lang==='pt'?'Tire ou selecione cada foto abaixo antes de finalizar.':'Take or select each photo below before completing.'}
            </p>
            <div style={{display:'flex', flexDirection:'column', gap:12}}>
              {requiredPhotos.map(photoKey => {
                const state = uploadedPhotos[photoKey];
                return (
                  <div key={photoKey} style={{borderRadius:12, border: state ? '1.5px solid var(--pg-blue-400)' : '1px solid var(--pg-ink-200)', overflow:'hidden'}}>
                    <div style={{display:'flex', alignItems:'center', gap:10, padding:'12px 14px', background: state ? 'var(--pg-blue-50)' : 'transparent'}}>
                      <div style={{
                        width:36, height:36, borderRadius:10, flexShrink:0, overflow:'hidden',
                        background: state ? 'transparent' : 'var(--pg-ink-100)',
                        display:'flex', alignItems:'center', justifyContent:'center',
                      }}>
                        {state?.url ? <img src={state.url} alt="" style={{width:36,height:36,objectFit:'cover'}}/> : <span style={{fontSize:18}}>📷</span>}
                      </div>
                      <div style={{flex:1, minWidth:0}}>
                        <div style={{fontSize:13, fontWeight:600, color:'var(--pg-ink-800)'}}>{photoLabel(photoKey)}</div>
                        {state?.uploading && <div style={{fontSize:11, color:'var(--pg-blue-500)'}}>Enviando...</div>}
                        {state && !state.uploading && <div style={{fontSize:11, color:'#16A34A', fontWeight:600}}>✓ {lang==='pt'?'Foto adicionada':'Photo added'}</div>}
                      </div>
                      <label style={{cursor:'pointer', flexShrink:0}}>
                        <input type="file" accept="image/*" capture="environment" style={{display:'none'}}
                          onChange={e=>handlePhotoSelect(photoKey, e.target.files[0])}/>
                        <span style={{
                          display:'inline-flex', alignItems:'center', gap:4, height:34, padding:'0 12px',
                          borderRadius:999, fontSize:12, fontWeight:700, cursor:'pointer',
                          background: state ? 'var(--pg-blue-100)' : 'var(--pg-blue-500)',
                          color: state ? 'var(--pg-blue-700)' : '#fff',
                          border:'none',
                        }}>
                          {state ? (lang==='pt'?'Trocar':'Retake') : (lang==='pt'?'Tirar foto':'Take photo')}
                        </span>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{display:'flex', gap:8, marginTop:20}}>
              <button onClick={()=>setShowPhotoUpload(false)} style={{
                flex:1, height:46, borderRadius:12, border:'1px solid var(--pg-ink-200)',
                background:'var(--pg-ink-50)', color:'var(--pg-ink-600)', fontSize:13, fontWeight:600, cursor:'pointer',
              }}>
                {lang==='pt'?'Cancelar':'Cancel'}
              </button>
              <button onClick={submitPhotos} disabled={!allPhotosUploaded||photosSubmitting} style={{
                flex:2, height:46, borderRadius:12, border:'none',
                cursor: allPhotosUploaded&&!photosSubmitting ? 'pointer' : 'default',
                background: allPhotosUploaded ? 'linear-gradient(135deg,#16A34A,#22C55E)' : 'var(--pg-ink-200)',
                color:'#fff', fontSize:14, fontWeight:700,
              }}>
                {photosSubmitting ? '...' : (lang==='pt'?'Enviar fotos':'Submit photos')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pool guy rates owner modal */}
      {showOwnerRating && (
        <div style={{position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'flex-end'}}>
          <div style={{width:'100%', maxWidth:520, margin:'0 auto', background:'var(--pg-white)', borderRadius:'20px 20px 0 0', padding:'20px 18px 32px', boxShadow:'0 -8px 32px rgba(0,0,0,0.18)'}}>
            <div style={{width:40, height:4, borderRadius:4, background:'var(--pg-ink-200)', margin:'0 auto 18px'}}/>
            <h3 style={{margin:'0 0 4px', fontSize:17, fontWeight:700, textAlign:'center'}}>
              {lang==='pt'?'Avaliar o dono':'Rate the owner'}
            </h3>
            <p style={{margin:'0 0 16px', fontSize:13, color:'var(--pg-ink-500)', textAlign:'center', lineHeight:1.4}}>
              {lang==='pt'
                ? 'Como foi sua experiência com esse cliente?'
                : 'How was your experience with this client?'}
            </p>
            <div style={{display:'flex', justifyContent:'center', gap:10, marginBottom:16}}>
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={()=>setOwnerRatingStars(s)} style={{
                  background:'none', border:'none', cursor:'pointer', fontSize:30, padding:4,
                  opacity: s<=ownerRatingStars ? 1 : 0.25, transform: s<=ownerRatingStars ? 'scale(1.1)' : 'scale(1)',
                  transition:'all .15s',
                }}>★</button>
              ))}
            </div>
            <textarea value={ownerRatingComment} onChange={e=>setOwnerRatingComment(e.target.value)}
              placeholder={lang==='pt'?'Comentário opcional...':'Optional comment...'}
              style={{width:'100%',minHeight:64,borderRadius:10,border:'1px solid var(--pg-ink-200)',padding:'10px 12px',fontSize:14,fontFamily:'inherit',resize:'none',outline:'none',boxSizing:'border-box',marginBottom:12}}/>
            <p style={{margin:'0 0 14px', fontSize:12, color:'var(--pg-ink-400)', textAlign:'center', lineHeight:1.4}}>
              {lang==='pt'
                ? 'O dono receberá uma notificação para conferir as fotos e avaliar você.'
                : 'The owner will receive a notification to check the photos and rate you.'}
            </p>
            <div style={{display:'flex', gap:8}}>
              <button onClick={()=>{ submitOwnerRatingAndFinishPoolGuy(); }} style={{
                flex:1, height:46, borderRadius:12, border:'1px solid var(--pg-ink-200)',
                background:'var(--pg-ink-50)', color:'var(--pg-ink-600)', fontSize:13, fontWeight:600, cursor:'pointer',
              }}>
                {lang==='pt'?'Pular avaliação':'Skip rating'}
              </button>
              <button onClick={submitOwnerRatingAndFinishPoolGuy} disabled={ownerRatingStars===0||ownerRatingSubmitting} style={{
                flex:2, height:46, borderRadius:12, border:'none',
                cursor: ownerRatingStars>0&&!ownerRatingSubmitting ? 'pointer' : 'default',
                background: ownerRatingStars>0 ? 'linear-gradient(135deg,#16A34A,#22C55E)' : 'var(--pg-ink-200)',
                color:'#fff', fontSize:14, fontWeight:700,
              }}>
                {ownerRatingSubmitting ? '...' : (lang==='pt'?'Finalizar e avaliar':'Finish & rate')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{
        position:'sticky', bottom:0, padding:'12px 18px 16px',
        background:'linear-gradient(180deg, transparent, var(--pg-white) 25%)',
        display:'flex', flexDirection:'column', gap:8, marginTop:14,
      }}>
        {isOwn ? (
          /* Owner actions */
          <div style={{display:'flex', flexDirection:'column', gap:8}}>
            {job.status === 'filled' && acceptedApp?.pool_guy_done ? (
              <>
              {acceptedApp.submitted_photos && acceptedApp.submitted_photos.length > 0 && (
                <div style={{padding:'10px 12px', borderRadius:12, background:'var(--pg-ink-50)', border:'1px solid var(--pg-ink-200)'}}>
                  <div style={{fontSize:11, fontWeight:700, color:'var(--pg-ink-500)', marginBottom:8}}>
                    📸 {lang==='pt'?'Fotos enviadas pelo pool guy':lang==='es'?'Fotos enviadas por el pool guy':'Photos submitted by the pool guy'} ({acceptedApp.submitted_photos.length})
                  </div>
                  <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                    {acceptedApp.submitted_photos.map((p, i) => (
                      <a key={i} href={p.url} target="_blank" rel="noreferrer" style={{display:'flex', flexDirection:'column', alignItems:'center', gap:3, borderRadius:10, overflow:'hidden', flexShrink:0}}>
                        <img src={p.url} alt={photoLabel(p.type)} style={{width:76, height:76, objectFit:'cover', display:'block', borderRadius:10, border:'1px solid var(--pg-ink-200)'}}/>
                        <span style={{fontSize:10, color:'var(--pg-ink-500)', fontWeight:600}}>{photoLabel(p.type)}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
              <button onClick={()=>setConfirmDialog({
                message: lang==='pt'?'Finalizar e remover vaga?':lang==='es'?'¿Finalizar y eliminar?':'Mark complete & remove?',
                subMessage: lang==='pt'?'A vaga será removida da lista. Você poderá avaliar o pool guy.':'The job will be removed from the list. You can rate the pool guy.',
                confirmLabel: lang==='pt'?'Sim, finalizar':lang==='es'?'Sí, finalizar':'Yes, finalize',
                onConfirm: ()=>{ setConfirmDialog(null); setShowRating(true); },
              })} style={{
                height:50, borderRadius:14, border:'none', cursor:'pointer',
                background:'linear-gradient(135deg,#16A34A,#22C55E)',
                color:'#fff', fontSize:15, fontWeight:700,
                display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                boxShadow:'0 4px 14px rgba(22,163,74,0.35)',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {lang==='pt'?'Finalizar e remover vaga':lang==='es'?'Finalizar y eliminar':'Mark complete & remove'}
              </button>
              </>
            ) : job.status === 'filled' ? (
              <div style={{
                height:50, borderRadius:14, border:'1.5px solid #FCD34D',
                background:'#FFFBEB', color:'#92400E', fontSize:14, fontWeight:700,
                display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              }}>
                ⏳ {lang==='pt'?'Em andamento — aguardando pool guy':'In progress — waiting for pool guy'}
              </div>
            ) : (
              <div style={{display:'flex', flexDirection:'column', gap:8}}>
                {job.status === 'open' && openEditPost && (
                  <button onClick={()=>openEditPost({
                    id: job.id,
                    title: typeof job.title==='object' ? (job.title[lang]||job.title.pt||job.title.en) : job.title,
                    description: typeof job.body==='object' ? (job.body[lang]||job.body.pt||job.body.en) : '',
                    city: job.loc, pool_type: job.type, extras: job.extras,
                    price_negotiable: job.price==='neg', price_per_pool: job.price==='neg' ? null : job.price,
                    poster_phone: job.poster_phone, pool_address: job.pool_address,
                    required_photos: job.required_photos || [],
                  })} style={{
                    height:46, borderRadius:14, border:'1.5px solid var(--pg-ink-300)',
                    background:'var(--pg-ink-100)', color:'var(--pg-ink-700)',
                    fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
                    display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                  }}>
                    {Icon.edit(16,'var(--pg-ink-700)')}
                    {lang==='pt'?'Editar publicação':lang==='es'?'Editar publicación':'Edit posting'}
                  </button>
                )}
                <button onClick={()=>setShowApplicants(v=>!v)} style={{
                  height:50, borderRadius:14, border:'1.5px solid var(--pg-blue-400)',
                  background: showApplicants ? 'var(--pg-blue-500)' : '#fff',
                  color: showApplicants ? '#fff' : 'var(--pg-blue-600)',
                  fontSize:15, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  {lang==='pt'
                    ? `${showApplicants?'Fechar':'Ver'} candidatos${applicants.length>0?' ('+applicants.length+')':''}`
                    : `${showApplicants?'Close':'View'} applicants${applicants.length>0?' ('+applicants.length+')':''}`}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Non-owner actions */
          <>
            {/* Address + Phone: only shown to accepted applicant */}
            {job._live && job.pool_address && myApp?.status === 'accepted' && (
              <a href={/iP(hone|od|ad)/.test(navigator.userAgent)
                  ? `maps://maps.apple.com/?q=${encodeURIComponent(job.pool_address)}`
                  : `https://maps.google.com/?q=${encodeURIComponent(job.pool_address)}`}
                target="_blank" rel="noreferrer"
                style={{
                  display:'flex', alignItems:'flex-start', gap:10,
                  padding:'12px 14px', borderRadius:12,
                  background:'#F0FDF4', border:'1px solid #86EFAC',
                  textDecoration:'none', cursor:'pointer',
                }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,marginTop:1}}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <div>
                  <div style={{fontSize:11, fontWeight:700, color:'#15803D', letterSpacing:'0.04em', textTransform:'uppercase', marginBottom:2}}>
                    {lang==='pt'?'Endereço da piscina':lang==='es'?'Dirección':'Pool address'}
                  </div>
                  <div style={{fontSize:14, fontWeight:600, color:'#14532D'}}>{job.pool_address}</div>
                  <div style={{fontSize:11, color:'#16A34A', fontWeight:600, marginTop:2}}>
                    {lang==='pt'?'Ver no mapa →':lang==='es'?'Ver en mapa →':'Open in Maps →'}
                  </div>
                </div>
              </a>
            )}
            {job._live && job.poster_phone && myApp?.status === 'accepted' && (
              <a href={`tel:${job.poster_phone}`} style={{
                display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                height:46, borderRadius:999, textDecoration:'none',
                background:'linear-gradient(135deg,#16A34A,#22C55E)',
                color:'#fff', fontSize:14, fontWeight:700,
              }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12 19.79 19.79 0 0 1 1.97 3.4 2 2 0 0 1 3.94 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z"/>
                </svg>
                {job.poster_phone}
              </a>
            )}

            {/* Phone consent panel — shown before applying */}
            {showConsent && (
              <div style={{
                background:'var(--pg-ink-50)', border:'1px solid var(--pg-ink-200)',
                borderRadius:14, padding:'14px 16px', marginBottom:4,
              }}>
                <p style={{margin:'0 0 12px', fontSize:13, fontWeight:600, color:'var(--pg-ink-800)', lineHeight:1.4}}>
                  {lang==='pt'
                    ? 'O dono pode ver seu número de telefone?'
                    : lang==='es'
                      ? '¿El propietario puede ver tu número?'
                      : 'Can the owner see your phone number?'}
                </p>
                <div style={{display:'flex', gap:8, marginBottom:4}}>
                  <button onClick={()=>setSharePhone(true)} style={{
                    flex:1, height:38, borderRadius:10, border: sharePhone?'2px solid #0077B6':'1px solid var(--pg-ink-200)',
                    background: sharePhone?'var(--pg-blue-50)':'var(--pg-white)',
                    color: sharePhone?'var(--pg-blue-700)':'var(--pg-ink-600)',
                    fontSize:13, fontWeight:700, cursor:'pointer',
                  }}>
                    {lang==='pt'?'Sim, compartilhar':lang==='es'?'Sí':'Yes, share'}
                  </button>
                  <button onClick={()=>setSharePhone(false)} style={{
                    flex:1, height:38, borderRadius:10, border: !sharePhone?'2px solid #0077B6':'1px solid var(--pg-ink-200)',
                    background: !sharePhone?'var(--pg-blue-50)':'var(--pg-white)',
                    color: !sharePhone?'var(--pg-blue-700)':'var(--pg-ink-600)',
                    fontSize:13, fontWeight:700, cursor:'pointer',
                  }}>
                    {lang==='pt'?'Não, só chat':lang==='es'?'No, solo chat':'No, chat only'}
                  </button>
                </div>
                <p style={{margin:'8px 0 12px', fontSize:11, color:'var(--pg-ink-400)', lineHeight:1.4}}>
                  {lang==='pt'
                    ? 'Seu número só fica visível para o dono se você escolher compartilhar.'
                    : 'Your number is only visible to the owner if you choose to share.'}
                </p>
                <button onClick={()=>{
                  onApply(sharePhone);
                  setShowConsent(false);
                  // Optimistic update so button switches immediately
                  setMyApp(prev => prev || { status:'pending', id:null, submitted_photos:[], pool_guy_done:false });
                  // Reload from DB to get real ID
                  if (window.sb && user?.uid) {
                    setTimeout(() => {
                      window.sb.from('quick_pool_applications')
                        .select('id,status,applicant_phone,submitted_photos,pool_guy_done')
                        .eq('job_id', job.id).eq('applicant_id', user.uid).limit(1)
                        .then(({ data }) => { if (data?.[0]) setMyApp(data[0]); });
                    }, 1200);
                  }
                }} className="pg-btn pg-btn-primary" style={{width:'100%', height:42, borderRadius:11, fontSize:14}}>
                  {lang==='pt'?'Confirmar candidatura':lang==='es'?'Confirmar':'Confirm application'}
                </button>
              </div>
            )}

            <div style={{display:'flex', gap:8}}>
              <button onClick={()=>onChat(job.poster_id ? { id: job.poster_id, name: job.poster, listingId: 'qp_' + job.id, listingContext: { name: tr(job.title, lang) + ' · ' + job.loc, price: job.price !== 'neg' ? job.price : null, priceMode: job.price === 'neg' ? 'neg' : 'fixed', type: 'quick_pool' } } : job.poster)} disabled={locked} className="pg-btn pg-btn-ghost" style={{flex:1, opacity:locked?0.5:1, borderRadius:999}}>
                {Icon.msg(16, 'var(--pg-blue-700)')} {t.contact}
              </button>
              {job.status === 'filled' && myApp?.status === 'accepted' ? (
                poolGuyDone ? (
                  <div style={{
                    flex:2, height:46, borderRadius:999, display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                    background:'#F0FDF4', border:'1px solid #86EFAC', color:'#15803D', fontSize:14, fontWeight:700,
                  }}>
                    ✓ {lang==='pt'?'Finalizado':lang==='es'?'Finalizado':'Done'}
                  </div>
                ) : requiredPhotos.length > 0 && !photosSubmitted ? (
                  <button onClick={()=>setShowPhotoUpload(true)} style={{
                    flex:2, height:46, borderRadius:999, border:'none', cursor:'pointer',
                    background:'linear-gradient(135deg,#0077B6,#00B4D8)',
                    color:'#fff', fontSize:13, fontWeight:700,
                    display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                  }}>
                    📸 {lang==='pt'?'Enviar fotos':lang==='es'?'Enviar fotos':'Send photos'}
                  </button>
                ) : (
                  <button onClick={()=>setShowOwnerRating(true)} style={{
                    flex:2, height:46, borderRadius:999, border:'none', cursor:'pointer',
                    background:'linear-gradient(135deg,#16A34A,#22C55E)',
                    color:'#fff', fontSize:14, fontWeight:700,
                    display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                    boxShadow:'0 4px 14px rgba(22,163,74,0.35)',
                  }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    {lang==='pt'?'Finalizar':lang==='es'?'Finalizar':'Finalize'}
                  </button>
                )
              ) : job.status === 'filled' ? (
                myApp?.status === 'rejected' ? (
                  <div style={{
                    flex:2, height:46, borderRadius:999, display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                    background:'#FEF2F2', border:'1px solid #FECACA', color:'#DC2626', fontSize:14, fontWeight:700,
                  }}>
                    {lang==='pt'?'Não selecionado':lang==='es'?'No seleccionado':'Not selected'}
                  </div>
                ) : (
                  <div style={{
                    flex:2, height:46, borderRadius:999, display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                    background:'#FEF3C7', border:'1px solid #FCD34D', color:'#92400E', fontSize:14, fontWeight:700,
                  }}>
                    ⏳ {lang==='pt'?'Em curso':lang==='es'?'En curso':'In progress'}
                  </div>
                )
              ) : job._live ? (
                myApp && myApp.status === 'pending' ? (
                  <button onClick={()=>setConfirmDialog({
                    message: lang==='pt'?'Retirar candidatura?':lang==='es'?'¿Retirar postulación?':'Withdraw application?',
                    subMessage: lang==='pt'?'Sua candidatura será cancelada.':lang==='es'?'Tu postulación será cancelada.':'Your application will be cancelled.',
                    confirmLabel: lang==='pt'?'Sim, retirar':lang==='es'?'Sí, retirar':'Yes, withdraw',
                    onConfirm: ()=>{ withdrawApp(); setConfirmDialog(null); },
                  })} style={{
                    flex:2, height:46, borderRadius:999, border:'1px solid #FECACA',
                    background:'#FEF2F2', color:'#DC2626', fontSize:13, fontWeight:700, cursor:'pointer',
                  }}>
                    {lang==='pt'?'Retirar candidatura':'Withdraw'}
                  </button>
                ) : myApp && myApp.status === 'accepted' ? (
                  poolGuyDone ? (
                    <div style={{
                      flex:2, height:46, borderRadius:999, display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                      background:'#F0FDF4', border:'1px solid #86EFAC', color:'#15803D', fontSize:14, fontWeight:700,
                    }}>
                      ✓ {lang==='pt'?'Finalizado':lang==='es'?'Finalizado':'Done'}
                    </div>
                  ) : requiredPhotos.length > 0 && !photosSubmitted ? (
                    <button onClick={()=>setShowPhotoUpload(true)} style={{
                      flex:2, height:46, borderRadius:999, border:'none', cursor:'pointer',
                      background:'linear-gradient(135deg,#0077B6,#00B4D8)',
                      color:'#fff', fontSize:13, fontWeight:700,
                      display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                    }}>
                      📸 {lang==='pt'?'Enviar fotos':lang==='es'?'Enviar fotos':'Send photos'}
                    </button>
                  ) : (
                    <button onClick={()=>setShowOwnerRating(true)} style={{
                      flex:2, height:46, borderRadius:999, border:'none', cursor:'pointer',
                      background:'linear-gradient(135deg,#16A34A,#22C55E)',
                      color:'#fff', fontSize:14, fontWeight:700,
                      display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                      boxShadow:'0 4px 14px rgba(22,163,74,0.35)',
                    }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      {lang==='pt'?'Finalizar':lang==='es'?'Finalizar':'Finalize'}
                    </button>
                  )
                ) : myApp && myApp.status === 'rejected' ? (
                  <div style={{
                    flex:2, height:46, borderRadius:999, display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                    background:'#FEF2F2', border:'1px solid #FECACA', color:'#DC2626', fontSize:14, fontWeight:700,
                  }}>
                    {lang==='pt'?'Não selecionado':lang==='es'?'No seleccionado':'Not selected'}
                  </div>
                ) : (
                  <button
                    onClick={locked ? onUnlock : ()=>setShowConsent(v=>!v)}
                    className="pg-btn pg-btn-primary"
                    style={{flex:2, borderRadius:999}}
                  >
                    {locked ? <>{Icon.lock(14,'#fff')} {t.unlockApply}</> : <>{lang==='pt'?'Candidatar':t.apply}</>}
                  </button>
                )
              ) : (
                <button onClick={locked ? onUnlock : ()=>setShowConsent(v=>!v)} className={`pg-btn ${applied?'pg-btn-ghost':'pg-btn-primary'}`} style={{flex:2, borderRadius:999}}>
                  {locked ? <>{Icon.lock(14, '#fff')} {t.unlockApply}</> :
                   applied ? <>{Icon.check(15, 'var(--pg-blue-700)')} {t.applied}</> :
                   <>{t.apply} — {t.fastTrack}</>}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
    {confirmDialog && (
      <ConfirmModal
        message={confirmDialog.message}
        subMessage={confirmDialog.subMessage}
        confirmLabel={confirmDialog.confirmLabel}
        lang={lang}
        onConfirm={confirmDialog.onConfirm}
        onCancel={()=>setConfirmDialog(null)}
      />
    )}
    </>
  );
}

function DetailPill({ icon, label, value }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:10, background:'var(--pg-blue-50)'}}>
      {icon}
      <div style={{minWidth:0}}>
        <div style={{fontSize:10, color:'var(--pg-ink-500)', textTransform:'uppercase', letterSpacing:'0.04em'}}>{label}</div>
        <div style={{fontSize:13, fontWeight:600, marginTop:1}}>{value}</div>
      </div>
    </div>
  );
}

function PostJobSheet({ open, onClose, lang, user, darkMode=false, onPosted }) {
  const DAY_KEYS = ['mon','tue','wed','thu','fri','sat','sun'];
  const DAY_LABELS_PT = ['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'];
  const DAY_LABELS_EN = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const dayLabels = lang==='pt' ? DAY_LABELS_PT : DAY_LABELS_EN;
  const TIME_SLOTS = [
    { key:'morning',   label: lang==='pt'?'Manhã':'Morning'   },
    { key:'afternoon', label: lang==='pt'?'Tarde':'Afternoon' },
    { key:'evening',   label: lang==='pt'?'Noite':'Evening'   },
  ];

  const [title,      setTitle]      = React.useState('');
  const [city,       setCity]       = React.useState('');
  const [day,        setDay]        = React.useState('');
  const [timeSlot,   setTimeSlot]   = React.useState('');
  const [poolType,   setPoolType]   = React.useState('residential');
  const [gateCode,   setGateCode]   = React.useState('');
  const [hasDoorman, setHasDoorman] = React.useState(false);
  const [hasDog,     setHasDog]     = React.useState(false);
  const [saltwater,  setSaltwater]  = React.useState(false);
  const [desc,       setDesc]       = React.useState('');
  const [price,      setPrice]      = React.useState('');
  const [neg,        setNeg]        = React.useState(false);
  const [showPhone,  setShowPhone]  = React.useState(false);
  const [phone,      setPhone]      = React.useState(user?.phone || '');
  const [address,    setAddress]    = React.useState('');
  const [saving,     setSaving]     = React.useState(false);
  const [err,        setErr]        = React.useState('');

  const allCities = React.useMemo(() => {
    return [].concat.apply([], Object.values(window.FL_COUNTIES||{})).filter((c,i,a)=>a.indexOf(c)===i).sort();
  }, []);
  const [cityQ, setCityQ] = React.useState('');
  const filteredCities = cityQ ? allCities.filter(c=>c.toLowerCase().includes(cityQ.toLowerCase())) : allCities;

  const reset = () => {
    setTitle(''); setCity(''); setDay(''); setTimeSlot(''); setPoolType('residential');
    setGateCode(''); setHasDoorman(false); setHasDog(false); setSaltwater(false);
    setDesc(''); setPrice(''); setNeg(false); setShowPhone(false); setPhone(user?.phone||'');
    setAddress(''); setErr(''); setCityQ('');
  };

  const submit = async () => {
    if (!title.trim()) return setErr(lang==='pt'?'Adicione um título':'Add a title');
    if (!city) return setErr(lang==='pt'?'Escolha a cidade':'Choose city');
    if (!day)  return setErr(lang==='pt'?'Escolha o dia':'Choose day');
    const parsedPrice = parseFloat(price);
    if (!neg && (!price.trim() || isNaN(parsedPrice) || parsedPrice <= 0)) {
      return setErr(lang==='pt'?'Informe um preço válido ou marque como negociável':'Enter a valid price or mark as negotiable');
    }
    if (!window.sb || !user?.uid) return setErr('Login required');
    setSaving(true);
    const timeLabel = timeSlot ? (' · ' + (TIME_SLOTS.find(t=>t.key===timeSlot)||{}).label||'') : '';
    const job = {
      poster_id: user.uid, poster_name: user.name || user.email || 'Pool Guy',
      poster_phone: showPhone ? (phone||null) : null, pool_address: address.trim()||null, city, day_of_week: day,
      when_label: dayLabels[DAY_KEYS.indexOf(day)] + timeLabel,
      time_slot: timeSlot || null,
      pools_count: 1, price_per_pool: neg ? null : parsedPrice,
      price_negotiable: neg, title: title.trim(), description: desc.trim()||null,
      pool_type: poolType,
      extras: poolType==='condo'
        ? { gate_code: gateCode.trim()||null, doorman: hasDoorman, dog: hasDog, saltwater }
        : { dog: hasDog, saltwater },
      status:'open',
    };
    const { data, error } = await window.sb.from('quick_pool_jobs').insert(job).select().single();
    if (error) { setSaving(false); return setErr(error.message); }
    // Trigger push notifications for matching pool guys
    try {
      await fetch('https://xiszfqghizqzlwyrfjol.supabase.co/functions/v1/notify-quick-pool', {
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':'Bearer '+(window._pgGetTok?window._pgGetTok():'')},
        body: JSON.stringify({ job: data }),
      });
    } catch {}
    setSaving(false);
    reset();
    onClose();
    onPosted && onPosted(data);
  };

  const dm = darkMode;
  const inkBg   = dm ? 'rgba(255,255,255,0.08)' : 'var(--pg-ink-50)';
  const inkBdr   = dm ? 'rgba(255,255,255,0.12)' : 'var(--pg-ink-200)';
  const inkText  = dm ? '#fff' : 'var(--pg-ink-900)';
  const inkSub   = dm ? 'rgba(255,255,255,0.45)' : 'var(--pg-ink-500)';
  const cardBg   = dm ? 'rgba(255,255,255,0.05)' : 'var(--pg-white)';
  const inp = { width:'100%', height:44, borderRadius:10, border:`1.5px solid ${dm ? 'rgba(255,255,255,0.25)' : 'var(--pg-ink-200)'}`, background: dm ? 'rgba(255,255,255,0.14)' : 'var(--pg-ink-50)', padding:'0 12px', fontSize:16, fontFamily:'inherit', color:inkText, outline:'none', boxSizing:'border-box' };

  return (
    <Sheet open={open} onClose={()=>{ reset(); onClose(); }} height="92%">
      <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
        {/* Header */}
        <div style={{padding:'4px 18px 14px', borderBottom:`0.5px solid ${inkBdr}`}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
            <h2 style={{margin:0,fontSize:18,fontWeight:700,letterSpacing:'-0.02em',color:inkText}}>
              {lang==='pt'?'Publicar vaga':lang==='es'?'Publicar trabajo':'Post a job'}
            </h2>
            <button onClick={()=>{ reset(); onClose(); }} style={{border:'none',background:inkBg,width:30,height:30,borderRadius:'50%',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
              {Icon.x(16,inkText)}
            </button>
          </div>
          <p style={{margin:0,fontSize:12,color:inkSub,lineHeight:1.4}}>
            {lang==='pt'?'Pool guys com essa cidade e dia configurados serão notificados na hora.':'Pool guys with this city and day configured will be notified instantly.'}
          </p>
        </div>

        {/* Body */}
        <div style={{flex:1,overflow:'auto',padding:'16px 18px',display:'flex',flexDirection:'column',gap:14}}>

          {/* Title */}
          <div>
            <label style={{fontSize:12,fontWeight:700,color:inkSub,letterSpacing:'0.04em',textTransform:'uppercase',display:'block',marginBottom:6}}>
              {lang==='pt'?'Título':'Title'}
            </label>
            <input value={title} onChange={e=>setTitle(e.target.value)}
              placeholder={lang==='pt'?'Ex: Limpeza em Davie':'E.g. Pool cleaning in Davie'}
              style={inp}/>
          </div>

          {/* City */}
          <div>
            <label style={{fontSize:12,fontWeight:700,color:inkSub,letterSpacing:'0.04em',textTransform:'uppercase',display:'block',marginBottom:6}}>
              {lang==='pt'?'Cidade':'City'}
            </label>
            {city ? (
              <div style={{display:'flex',alignItems:'center',gap:8,height:44,borderRadius:10,border:'1.5px solid var(--pg-blue-500)',background:dm?'rgba(0,119,182,0.18)':'var(--pg-blue-50)',padding:'0 12px'}}>
                <span style={{flex:1,fontSize:14,fontWeight:600,color:dm?'#60BBFF':'var(--pg-blue-700)'}}>{city}</span>
                <button onClick={()=>setCity('')} style={{border:'none',background:'transparent',cursor:'pointer',padding:2}}>{Icon.x(14,inkSub)}</button>
              </div>
            ) : (
              <>
                <input value={cityQ} onChange={e=>setCityQ(e.target.value)} placeholder={lang==='pt'?'Buscar cidade...':'Search city...'} style={{...inp,marginBottom:6}}/>
                <div style={{maxHeight:140,overflow:'auto',border:`1px solid ${inkBdr}`,borderRadius:10,background:cardBg}}>
                  {filteredCities.slice(0,30).map(c=>(
                    <button key={c} onClick={()=>{ setCity(c); setCityQ(''); }} style={{display:'block',width:'100%',textAlign:'left',padding:'9px 12px',border:'none',background:'transparent',cursor:'pointer',fontSize:13,fontWeight:500,color:inkText,borderBottom:`0.5px solid ${inkBdr}`}}>
                      {c}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Day */}
          <div>
            <label style={{fontSize:12,fontWeight:700,color:inkSub,letterSpacing:'0.04em',textTransform:'uppercase',display:'block',marginBottom:6}}>
              {lang==='pt'?'Dia da semana':'Day of week'}
            </label>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6}}>
              {DAY_KEYS.map((dk,i)=>{
                const on = dk===day;
                return (
                  <button key={dk} onClick={()=>setDay(dk)} style={{
                    padding:'8px 4px',borderRadius:9,border:'1px solid '+(on?'var(--pg-blue-500)':inkBdr),
                    background:on?'var(--pg-blue-500)':inkBg,
                    color:on?'#fff':inkText,fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit',
                  }}>{dayLabels[i].slice(0,3)}</button>
                );
              })}
            </div>
          </div>

          {/* Time slot */}
          <div>
            <label style={{fontSize:12,fontWeight:700,color:inkSub,letterSpacing:'0.04em',textTransform:'uppercase',display:'block',marginBottom:6}}>
              {lang==='pt'?'Horário':'Time'}
            </label>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}}>
              {TIME_SLOTS.map(ts=>{
                const on = ts.key===timeSlot;
                return (
                  <button key={ts.key} onClick={()=>setTimeSlot(on?'':ts.key)} style={{
                    padding:'9px 4px',borderRadius:9,border:'1px solid '+(on?'var(--pg-blue-500)':inkBdr),
                    background:on?'var(--pg-blue-500)':inkBg,
                    color:on?'#fff':inkText,fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit',
                  }}>{ts.label}</button>
                );
              })}
            </div>
          </div>

          {/* Pool type */}
          <div>
            <label style={{fontSize:12,fontWeight:700,color:inkSub,letterSpacing:'0.04em',textTransform:'uppercase',display:'block',marginBottom:6}}>
              {lang==='pt'?'Tipo':'Type'}
            </label>
            <div style={{display:'flex',gap:6}}>
              {['residential','condo'].map(pt=>{
                const on = poolType===pt;
                const lbl = pt==='residential'?(lang==='pt'?'Residencial':'Residential'):(lang==='pt'?'Condomínio':'Condo');
                return (
                  <button key={pt} onClick={()=>setPoolType(pt)} style={{
                    flex:1,padding:'10px 4px',borderRadius:9,
                    border:'1px solid '+(on?'var(--pg-blue-500)':inkBdr),
                    background:on?'var(--pg-blue-500)':inkBg,
                    color:on?'#fff':inkText,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit',
                  }}>{lbl}</button>
                );
              })}
            </div>
          </div>

          {/* Pool extras — always visible */}
          <div style={{borderRadius:12,border:`1px solid ${inkBdr}`,padding:'12px 14px',background:inkBg,display:'flex',flexDirection:'column',gap:10}}>
            <div style={{fontSize:11,fontWeight:700,color:inkSub,letterSpacing:'0.04em',textTransform:'uppercase',marginBottom:2}}>
              {lang==='pt'?'Detalhes da piscina':lang==='es'?'Detalles de la piscina':'Pool details'}
            </div>
            {[
              { key:'dog',  state:hasDog,    set:setHasDog,    label:lang==='pt'?'Tem cachorro':lang==='es'?'Tiene perro':'Has dog'   },
              { key:'salt', state:saltwater, set:setSaltwater, label:lang==='pt'?'Piscina de sal':lang==='es'?'Piscina de sal':'Salt pool' },
            ].map(item=>(
              <label key={item.key} style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:13,color:inkText,fontWeight:500}}>
                <input type="checkbox" checked={item.state} onChange={e=>item.set(e.target.checked)} style={{width:16,height:16,accentColor:'var(--pg-blue-500)'}}/>
                {item.label}
              </label>
            ))}
          </div>

          {/* Condo extras */}
          {poolType==='condo' && (
            <div style={{borderRadius:12,border:`1px solid ${inkBdr}`,padding:'12px 14px',background:inkBg,display:'flex',flexDirection:'column',gap:10}}>
              <div style={{fontSize:11,fontWeight:700,color:inkSub,letterSpacing:'0.04em',textTransform:'uppercase',marginBottom:2}}>
                {lang==='pt'?'Detalhes do condomínio':lang==='es'?'Detalles del condominio':'Condo details'}
              </div>
              <input value={gateCode} onChange={e=>setGateCode(e.target.value)}
                placeholder={lang==='pt'?'Código do portão (opcional)':'Gate code (optional)'}
                style={{...inp,height:40,fontSize:13}}/>
              {[
                { key:'doorman', state:hasDoorman, set:setHasDoorman, label:lang==='pt'?'Tem porteiro':lang==='es'?'Tiene portero':'Has doorman' },
              ].map(item=>(
                <label key={item.key} style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:13,color:inkText,fontWeight:500}}>
                  <input type="checkbox" checked={item.state} onChange={e=>item.set(e.target.checked)} style={{width:16,height:16,accentColor:'var(--pg-blue-500)'}}/>
                  {item.label}
                </label>
              ))}
            </div>
          )}

          {/* Description */}
          <div>
            <label style={{fontSize:12,fontWeight:700,color:inkSub,letterSpacing:'0.04em',textTransform:'uppercase',display:'block',marginBottom:6}}>
              {lang==='pt'?'Descrição':'Description'}
            </label>
            <textarea value={desc} onChange={e=>setDesc(e.target.value)}
              placeholder={lang==='pt'?'Ex: Piscina residencial, produto no local, portão com código...':'E.g. Residential pool, chemicals on site, gate code required...'}
              style={{width:'100%',minHeight:80,borderRadius:10,border:`1px solid ${inkBdr}`,background:inkBg,padding:'10px 12px',fontSize:14,fontFamily:'inherit',resize:'none',outline:'none',color:inkText,boxSizing:'border-box'}}/>
          </div>

          {/* Price */}
          <div>
            <label style={{fontSize:12,fontWeight:700,color:inkSub,letterSpacing:'0.04em',textTransform:'uppercase',display:'block',marginBottom:6}}>
              {lang==='pt'?'$/piscina':'$/pool'}
            </label>
            <div style={{position:'relative'}}>
              <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontSize:14,color:neg?inkSub:inkText,fontWeight:600}}>$</span>
              <input type="number" value={price} onChange={e=>setPrice(e.target.value)} disabled={neg}
                placeholder="45" style={{...inp,paddingLeft:24,opacity:neg?0.4:1}}/>
            </div>
            <label style={{display:'flex',alignItems:'center',gap:6,marginTop:6,cursor:'pointer',fontSize:12,color:inkSub}}>
              <input type="checkbox" checked={neg} onChange={e=>setNeg(e.target.checked)} style={{width:14,height:14}}/>
              {lang==='pt'?'A combinar':'Negotiable'}
            </label>
          </div>

          {/* Phone visibility toggle */}
          <div style={{borderRadius:14,border:`1px solid ${inkBdr}`,overflow:'hidden'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 16px',cursor:'pointer',background:cardBg}}
              onClick={()=>setShowPhone(v=>!v)}>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:inkText,marginBottom:2}}>
                  {lang==='pt'?'Mostrar telefone para candidato aceito?':lang==='es'?'¿Mostrar teléfono al candidato aceptado?':'Show phone to accepted candidate?'}
                </div>
                <div style={{fontSize:11,color:inkSub}}>
                  {lang==='pt'?'Apenas quem você aceitar terá acesso ao seu número.':'Only the candidate you accept will see your number.'}
                </div>
              </div>
              {/* Toggle */}
              <div style={{
                width:44,height:26,borderRadius:999,flexShrink:0,marginLeft:12,
                background:showPhone?'#0077B6':inkBdr,
                position:'relative',transition:'background .2s',
              }}>
                <div style={{
                  position:'absolute',top:3,left:showPhone?18:3,width:20,height:20,
                  borderRadius:'50%',background:'#fff',transition:'left .2s',
                  boxShadow:'0 1px 4px rgba(0,0,0,0.2)',
                }}/>
              </div>
            </div>
            {showPhone && (
              <div style={{padding:'0 16px 14px',borderTop:`0.5px solid ${inkBdr}`,background:inkBg}}>
                <label style={{fontSize:11,fontWeight:700,color:inkSub,letterSpacing:'0.04em',textTransform:'uppercase',display:'block',margin:'12px 0 6px'}}>
                  {lang==='pt'?'Seu telefone':'Your phone'}
                </label>
                <input value={phone} onChange={e=>setPhone(e.target.value)} type="tel"
                  placeholder="(954) 000-0000" style={inp}/>
              </div>
            )}
          </div>

          {/* Address — revealed only to accepted candidate */}
          <div style={{borderRadius:14,border:`1px solid ${inkBdr}`,overflow:'hidden',background:cardBg}}>
            <div style={{padding:'14px 16px'}}>
              <div style={{fontSize:13,fontWeight:700,color:inkText,marginBottom:2}}>
                {lang==='pt'?'Endereço da piscina':lang==='es'?'Dirección de la piscina':'Pool address'}
              </div>
              <div style={{fontSize:11,color:inkSub,marginBottom:10}}>
                {lang==='pt'?'Visível apenas para o candidato que você aceitar.':'Only visible to the candidate you accept.'}
              </div>
              <input value={address} onChange={e=>setAddress(e.target.value)} type="text"
                placeholder={lang==='pt'?'Ex: 123 Palm Ave, Davie, FL 33325':'E.g. 123 Palm Ave, Davie, FL 33325'}
                style={inp}/>
            </div>
          </div>

          {err && <div style={{background:'#FEE2E2',borderRadius:9,padding:'9px 12px',fontSize:13,color:'#DC2626',fontWeight:500}}>{err}</div>}
        </div>

        {/* Submit */}
        <div style={{padding:'12px 18px 18px',borderTop:`0.5px solid ${inkBdr}`}}>
          <button onClick={submit} disabled={saving} className="pg-btn pg-btn-primary" style={{width:'100%',height:50,fontSize:15,borderRadius:14}}>
            {saving
              ? (lang==='pt'?'Publicando...':'Posting...')
              : (lang==='pt'?'Publicar agora':'Post now')}
          </button>
        </div>
      </div>
    </Sheet>
  );
}

Object.assign(window, { QuickPoolsScreen });
