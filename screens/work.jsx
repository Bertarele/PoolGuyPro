// work.jsx — Hiring / Technicians (matching layout) / Vacation with month+weekday+region

function WorkScreen({ ctx }) {
  const { lang, openChat, goTab, openPostMenu, openApplicants, openJobDetail,
          openHiringAppDetail, openApplyJob,
          openVacSheet, openHiringSheet, openTechSheet, openDayPicker, openSchedule,
          openPublicProfile,
          liveJobs=[], liveTechs=[], liveVacations=[] } = ctx;
  const t = STRINGS[lang];
  const [sub, setSub] = React.useState('hiring');
  const [vacTab, setVacTab] = React.useState('applied');
  const [myActivityTab, setMyActivityTab] = React.useState('applications'); // 'applications' | 'myposts'

  const subIcons = {
    hiring: (s, c) => Icon.briefcase(s, c),
    techs:  (s, c) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="5"/>
        <path d="M8.21 13.89 7 22l5-3 5 3-1.21-8.12"/>
      </svg>
    ),
    vac: (s, c) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22V8"/>
        <path d="M12 8c-2-2-5-2-7 0 2 2 5 2 7 0Z"/>
        <path d="M12 8c2-2 5-2 7 0-2 2-5 2-7 0Z"/>
        <path d="M5 12c2 0 4 1 4 3M19 12c-2 0-4 1-4 3"/>
      </svg>
    ),
  };

  const handlePostBtn = () => {
    if (sub === 'vac')         openVacSheet();
    else if (sub === 'hiring') openHiringSheet();
    else if (sub === 'techs')  openTechSheet();
  };

  // Contextual "+ " button label & icon per sub-tab
  const postBtnCfg = {
    hiring: {
      label: lang==='pt'?'Vaga':lang==='es'?'Empleo':'Job',
      icon:  (s,c) => Icon.briefcase(s,c),
    },
    techs: {
      label: lang==='pt'?'Técnico':lang==='es'?'Técnico':'Tech',
      icon:  (s,c) => (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 7a4 4 0 1 0-5 5l-6 6 3 3 6-6a4 4 0 0 0 5-5l-3 3-3-3z"/>
        </svg>
      ),
    },
    vac: {
      label: lang==='pt'?'Férias':lang==='es'?'Vacaciones':'Vacation',
      icon:  (s,c) => (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22V8"/>
          <path d="M12 8c-2-2-5-2-7 0 2 2 5 2 7 0Z"/>
          <path d="M12 8c2-2 5-2 7 0-2 2-5 2-7 0Z"/>
          <path d="M5 12c2 0 4 1 4 3M19 12c-2 0-4 1-4 3"/>
        </svg>
      ),
    },
  };
  const postBtn = postBtnCfg[sub] || postBtnCfg.hiring;

  const activeJobs = MY_APPLICATIONS.filter(a => ['accepted','in_progress'].includes(a.status));

  const tabs = [
    { id:'hiring', label:t.hiring },
    { id:'techs',  label:lang==='pt'?'Técnicos':lang==='es'?'Técnicos':'Techs' },
    { id:'vac',    label:t.vacation },
  ];

  // ── My Active Jobs sticky card ──────────────────────────────
  const myJobsLabel   = lang==='pt' ? 'Meus Jobs Ativos' : lang==='es' ? 'Mis Jobs Activos' : 'My Active Jobs';
  const emptyLabel    = lang==='pt' ? 'Nenhum job ativo no momento' : lang==='es' ? 'Sin jobs activos por ahora' : 'No active jobs right now';
  const findWorkLabel = lang==='pt' ? 'Busque vagas abaixo ↓' : lang==='es' ? 'Busca trabajos abajo ↓' : 'Browse jobs below ↓';
  const seeAllLabel   = lang==='pt' ? 'Ver todos' : lang==='es' ? 'Ver todos' : 'See all';

  const statusChipStyle = (status) => {
    const cfg = {
      accepted:    { bg:'#e8f5e9', color:'#2e7d32', label: lang==='pt'?'Contratado':lang==='es'?'Contratado':'Hired' },
      in_progress: { bg:'#fff3e0', color:'#e65100', label: lang==='pt'?'Em andamento':lang==='es'?'En progreso':'In Progress' },
    };
    return cfg[status] || { bg:'#f5f5f5', color:'#555', label: status };
  };

  // Checklist icon for the card header
  const ChecklistIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  );

  // FAB — aqua floating action button
  const FabBtn = (
    <button onClick={handlePostBtn} className="pg-press" style={{
      position:'absolute', bottom:86, right:18, zIndex:35,
      width:56, height:56, borderRadius:'50%', padding:0,
      display:'inline-flex', alignItems:'center', justifyContent:'center',
      background:'linear-gradient(135deg, #0EBAC7 0%, #0D7280 100%)',
      border:'none', cursor:'pointer',
      boxShadow:'0 6px 20px rgba(14,186,199,0.45), 0 2px 8px rgba(0,0,0,0.18)',
    }}>
      {Icon.plus(24,'#fff')}
    </button>
  );

  return (
    <div style={{position:'relative', width:'100%', height:'100%', overflow:'hidden'}}>
    <div className="pg-screen" style={{paddingBottom:110, height:'100%', overflowY:'auto'}}>
      <NavyBar
        title={
          <div>
            <div style={{fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.50)', letterSpacing:'0.10em', marginBottom:3, textTransform:'uppercase'}}>
              {t.work}
            </div>
            <div style={{fontFamily:'var(--pg-font-display)', fontSize:21, fontWeight:700, letterSpacing:'-0.025em', lineHeight:1.1}}>
              {sub==='hiring'
                ? (lang==='pt'?'Vagas de Emprego':lang==='es'?'Ofertas de Trabajo':'Job Openings')
                : sub==='techs'
                  ? (lang==='pt'?'Técnicos Disponíveis':lang==='es'?'Técnicos Disponibles':'Available Techs')
                  : (lang==='pt'?'Cobertura de Férias':lang==='es'?'Cobertura de Vacaciones':'Vacation Cover')}
            </div>
          </div>
        }
        leftBack onBack={()=>goTab('home')}
      >
        {/* Contextual stats strip per sub-tab */}
        <div style={{display:'flex', alignItems:'center', gap:14, marginTop:10, paddingTop:10, borderTop:'1px solid rgba(255,255,255,0.12)'}}>
          {sub === 'hiring' && <>
            <div style={{display:'flex', alignItems:'center', gap:6}}>
              <div style={{width:26, height:26, borderRadius:7, background:'rgba(255,255,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center'}}>
                {Icon.briefcase(13,'rgba(255,255,255,0.88)')}
              </div>
              <div>
                <div style={{fontSize:16, fontWeight:700, fontFamily:'var(--pg-font-display)', lineHeight:1}}>{HIRING.length}</div>
                <div style={{fontSize:10, opacity:0.55, lineHeight:1, marginTop:1}}>{lang==='pt'?'vagas':lang==='es'?'empleos':'openings'}</div>
              </div>
            </div>
            <div style={{width:1, height:28, background:'rgba(255,255,255,0.15)'}}/>
            <div style={{display:'flex', alignItems:'center', gap:6}}>
              <div style={{width:26, height:26, borderRadius:7, background:'rgba(255,255,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center'}}>
                {Icon.check(13,'rgba(255,255,255,0.88)')}
              </div>
              <div>
                <div style={{fontSize:16, fontWeight:700, fontFamily:'var(--pg-font-display)', lineHeight:1}}>
                  {MY_APPLICATIONS.filter(a=>a.type==='hiring').length}
                </div>
                <div style={{fontSize:10, opacity:0.55, lineHeight:1, marginTop:1}}>{lang==='pt'?'candidaturas':lang==='es'?'solicitudes':'applied'}</div>
              </div>
            </div>
            <div style={{width:1, height:28, background:'rgba(255,255,255,0.15)'}}/>
            <div style={{display:'flex', alignItems:'center', gap:5, opacity:0.60}}>
              {Icon.pin(11,'rgba(255,255,255,0.8)')}
              <span style={{fontSize:10.5, fontWeight:500}}>South Florida</span>
            </div>
          </>}
          {sub === 'techs' && <>
            <div style={{display:'flex', alignItems:'center', gap:6}}>
              <div style={{width:26, height:26, borderRadius:7, background:'rgba(255,255,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center'}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.88)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M8.21 13.89 7 22l5-3 5 3-1.21-8.12"/></svg>
              </div>
              <div>
                <div style={{fontSize:16, fontWeight:700, fontFamily:'var(--pg-font-display)', lineHeight:1}}>{TECHS.length}</div>
                <div style={{fontSize:10, opacity:0.55, lineHeight:1, marginTop:1}}>{lang==='pt'?'técnicos':lang==='es'?'técnicos':'techs'}</div>
              </div>
            </div>
            <div style={{width:1, height:28, background:'rgba(255,255,255,0.15)'}}/>
            <div style={{display:'flex', alignItems:'center', gap:5, opacity:0.60}}>
              {Icon.pin(11,'rgba(255,255,255,0.8)')}
              <span style={{fontSize:10.5, fontWeight:500}}>South Florida</span>
            </div>
          </>}
          {sub === 'vac' && <>
            <div style={{display:'flex', alignItems:'center', gap:6}}>
              <div style={{width:26, height:26, borderRadius:7, background:'rgba(255,255,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center'}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.88)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V8"/><path d="M12 8c-2-2-5-2-7 0 2 2 5 2 7 0Z"/><path d="M12 8c2-2 5-2 7 0-2 2-5 2-7 0Z"/><path d="M5 12c2 0 4 1 4 3M19 12c-2 0-4 1-4 3"/></svg>
              </div>
              <div>
                <div style={{fontSize:16, fontWeight:700, fontFamily:'var(--pg-font-display)', lineHeight:1}}>{VACATION_LISTINGS.length}</div>
                <div style={{fontSize:10, opacity:0.55, lineHeight:1, marginTop:1}}>{lang==='pt'?'coberturas':lang==='es'?'coberturas':'covers'}</div>
              </div>
            </div>
            <div style={{width:1, height:28, background:'rgba(255,255,255,0.15)'}}/>
            <div style={{display:'flex', alignItems:'center', gap:6}}>
              <div style={{width:26, height:26, borderRadius:7, background:'rgba(255,255,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center'}}>
                {Icon.cal(13,'rgba(255,255,255,0.88)')}
              </div>
              <div>
                <div style={{fontSize:16, fontWeight:700, fontFamily:'var(--pg-font-display)', lineHeight:1}}>
                  {VACATIONS_APPLIED ? VACATIONS_APPLIED.length : 0}
                </div>
                <div style={{fontSize:10, opacity:0.55, lineHeight:1, marginTop:1}}>{lang==='pt'?'aplicadas':lang==='es'?'aplicadas':'applied'}</div>
              </div>
            </div>
          </>}
        </div>
      </NavyBar>

      {/* ── Find Work tabs — TOP ── */}
      <div style={{padding:'10px 18px 0'}}>
        <div style={{fontSize:11, fontWeight:700, color:'var(--pg-ink-400)', letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:6, paddingLeft:2}}>
          {lang==='pt' ? 'ENCONTRAR TRABALHO' : lang==='es' ? 'ENCONTRAR TRABAJO' : 'FIND WORK'}
        </div>
        <div className="pg-card" style={{padding:5, display:'flex', gap:0}}>
          {tabs.map(s => {
            const on = sub === s.id;
            return (
              <button key={s.id} onClick={()=>setSub(s.id)} style={{
                flex:1, padding:'9px 4px', border:'none', borderRadius:9, cursor:'pointer',
                background: on ? 'var(--pg-blue-500)' : 'transparent',
                color: on ? '#fff' : 'var(--pg-ink-700)',
                fontWeight:600, fontSize:12, letterSpacing:'-0.005em',
                display:'inline-flex', alignItems:'center', justifyContent:'center', gap:5,
                fontFamily:'inherit', transition:'all .15s ease',
                boxShadow: on ? '0 4px 10px oklch(0.58 0.16 235 / 0.30)' : 'none',
              }}>
                {subIcons[s.id](13, on ? '#fff' : 'var(--pg-ink-500)')}
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── My Activity — unified card for hiring + vacation ── */}
      {(sub === 'hiring' || sub === 'vac') && (() => {
        // Data per sub-tab
        const myApps  = sub === 'hiring'
          ? MY_APPLICATIONS.filter(a => a.type === 'hiring')
          : (typeof VACATIONS_APPLIED !== 'undefined' ? VACATIONS_APPLIED : []);
        const myPosts = MY_POSTS.filter(p =>
          sub === 'hiring' ? p.type === 'hiring' : p.type === 'vacation'
        );

        const totalApps  = myApps.length;
        const totalPosts = myPosts.length;

        const activityLbl = lang==='pt'?'Minha Atividade':lang==='es'?'Mi Actividad':'My Activity';
        const appsLbl     = lang==='pt'?'Candidaturas':lang==='es'?'Solicitudes':'Applications';
        const myPostsLbl  = lang==='pt'?'Meus Posts':lang==='es'?'Mis Posts':'My Posts';
        const emptyApps   = lang==='pt'?'Nenhuma candidatura ainda':lang==='es'?'Sin solicitudes aún':'No applications yet';
        const emptyPosts  = lang==='pt'?'Nenhum post publicado':lang==='es'?'Sin publicaciones':'No posts yet';

        return (
          <div style={{padding:'10px 18px 0'}}>
            <div className="pg-card" style={{padding:'12px 14px'}}>

              {/* Section title */}
              <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:10}}>
                <div style={{width:3, height:14, borderRadius:2, background:'var(--pg-blue-500)', flexShrink:0}}/>
                <span style={{fontSize:11, fontWeight:700, letterSpacing:'0.06em', color:'var(--pg-ink-700)', textTransform:'uppercase'}}>
                  {activityLbl}
                </span>
              </div>

              {/* Inner tab switcher */}
              <div style={{display:'flex', gap:0, background:'var(--pg-ink-100)', borderRadius:10, padding:3, marginBottom:12}}>
                {[
                  { id:'applications', label: appsLbl,    count: totalApps  },
                  { id:'myposts',      label: myPostsLbl, count: totalPosts },
                ].map(tab => {
                  const on = myActivityTab === tab.id;
                  return (
                    <button key={tab.id} onClick={()=>setMyActivityTab(tab.id)} style={{
                      flex:1, padding:'7px 4px', border:'none', borderRadius:8, cursor:'pointer',
                      background: on ? '#fff' : 'transparent',
                      color: on ? 'var(--pg-blue-600)' : 'var(--pg-ink-500)',
                      fontFamily:'inherit', fontSize:12, fontWeight: on ? 700 : 500,
                      boxShadow: on ? '0 1px 4px rgba(15,30,60,0.12)' : 'none',
                      transition:'all .15s', display:'flex', alignItems:'center', justifyContent:'center', gap:5,
                    }}>
                      {tab.label}
                      {tab.count > 0 && (
                        <span style={{
                          fontSize:10, fontWeight:700, minWidth:16, height:16, borderRadius:999, padding:'0 4px',
                          background: on ? 'var(--pg-blue-500)' : 'var(--pg-ink-300)',
                          color:'#fff', display:'inline-flex', alignItems:'center', justifyContent:'center',
                        }}>{tab.count}</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* ── Applications tab ── */}
              {myActivityTab === 'applications' && (
                myApps.length === 0
                  ? <div style={{textAlign:'center', padding:'10px 0 4px', color:'var(--pg-ink-400)', fontSize:12.5}}>{emptyApps}</div>
                  : myApps.map((app, i) => {
                      // Hiring app
                      if (sub === 'hiring') {
                        const isPending  = app.status === 'pending';
                        const isAccepted = app.status === 'accepted';
                        const isProgress = app.status === 'in_progress';
                        const statusCfg = isPending
                          ? { label: lang==='pt'?'Aguardando':lang==='es'?'Pendiente':'Pending',   color:'oklch(0.48 0.14 68)', bg:'oklch(0.96 0.05 68)' }
                          : isAccepted || isProgress
                            ? { label: lang==='pt'?'Aceito ✓':lang==='es'?'Aceptado ✓':'Accepted ✓', color:'var(--pg-blue-600)', bg:'var(--pg-blue-50)' }
                            : { label: lang==='pt'?'Recusado':lang==='es'?'Rechazado':'Rejected',     color:'oklch(0.45 0.18 20)', bg:'oklch(0.95 0.04 20)' };
                        return (
                          <div key={app.id} onClick={()=>openHiringAppDetail && openHiringAppDetail(app)}
                            style={{display:'flex', alignItems:'center', gap:10, padding:'8px 0',
                              borderTop:'1px solid var(--pg-ink-100)', cursor:'pointer'}}>
                            <div style={{flex:1, minWidth:0}}>
                              <div style={{fontSize:13, fontWeight:700, color:'var(--pg-ink-900)', marginBottom:3,
                                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{app.company}</div>
                              <div style={{display:'flex', alignItems:'center', gap:6, flexWrap:'wrap'}}>
                                <span style={{fontSize:10.5, fontWeight:700, padding:'2px 6px', borderRadius:6,
                                  background:statusCfg.bg, color:statusCfg.color}}>{statusCfg.label}</span>
                                <span style={{fontSize:11, color:'var(--pg-ink-400)'}}>· {tr(app.pay, lang)}</span>
                              </div>
                            </div>
                            {Icon.chev(14,'var(--pg-ink-300)')}
                          </div>
                        );
                      }
                      // Vacation app
                      const isAwaiting = app.status === 'awaiting';
                      const isAccepted = app.status === 'accepted';
                      const statusCfg = isAwaiting
                        ? { label: lang==='pt'?'Aguardando':lang==='es'?'Pendiente':'Pending',   color:'oklch(0.48 0.14 68)', bg:'oklch(0.96 0.05 68)' }
                        : isAccepted
                          ? { label: lang==='pt'?'Confirmado ✓':lang==='es'?'Confirmado ✓':'Confirmed ✓', color:'var(--pg-blue-600)', bg:'var(--pg-blue-50)' }
                          : { label: app.status, color:'var(--pg-ink-500)', bg:'var(--pg-ink-100)' };
                      return (
                        <div key={app.id} onClick={()=>openSchedule && openSchedule(app)}
                          style={{display:'flex', alignItems:'center', gap:10, padding:'8px 0',
                            borderTop:'1px solid var(--pg-ink-100)', cursor:'pointer'}}>
                          <div style={{flex:1, minWidth:0}}>
                            <div style={{fontSize:13, fontWeight:700, color:'var(--pg-ink-900)', marginBottom:3,
                              whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                              {app.owner}
                            </div>
                            <div style={{display:'flex', alignItems:'center', gap:6, flexWrap:'wrap'}}>
                              <span style={{fontSize:10.5, fontWeight:700, padding:'2px 6px', borderRadius:6,
                                background:statusCfg.bg, color:statusCfg.color}}>{statusCfg.label}</span>
                              <span style={{fontSize:11, color:'var(--pg-ink-400)'}}>
                                · {tr(app.month, lang)} · {app.poolsPerDay} {lang==='pt'?'pisc/dia':lang==='es'?'pisc/día':'pools/day'}
                              </span>
                            </div>
                          </div>
                          <div style={{textAlign:'right', flexShrink:0}}>
                            <div style={{fontFamily:'var(--pg-font-display)', fontSize:14, fontWeight:700, color:'var(--pg-blue-500)'}}>
                              ${app.pricePerPool}
                            </div>
                            <div style={{fontSize:10, color:'var(--pg-ink-400)'}}>
                              {lang==='pt'?'/piscina':lang==='es'?'/piscina':'/pool'}
                            </div>
                          </div>
                        </div>
                      );
                    })
              )}

              {/* ── My Posts tab ── */}
              {myActivityTab === 'myposts' && (
                myPosts.length === 0
                  ? <div style={{textAlign:'center', padding:'10px 0 4px', color:'var(--pg-ink-400)', fontSize:12.5}}>{emptyPosts}</div>
                  : myPosts.map(post => {
                      const pending       = post.applicants ? post.applicants.filter(a=>a.status==='pending').length : 0;
                      const withInterview = post.applicants ? post.applicants.filter(a=>a.interview).length : 0;
                      const totalApplicants = post.applicants ? post.applicants.length : 0;
                      return (
                        <div key={post.id} onClick={()=>openApplicants && openApplicants(post)}
                          style={{display:'flex', alignItems:'center', gap:10, padding:'8px 0',
                            borderTop:'1px solid var(--pg-ink-100)', cursor:'pointer'}}>
                          <div style={{flex:1, minWidth:0}}>
                            <div style={{fontSize:13, fontWeight:700, color:'var(--pg-ink-900)', marginBottom:3,
                              whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{tr(post.title, lang)}</div>
                            <div style={{display:'flex', alignItems:'center', gap:5, flexWrap:'wrap'}}>
                              <span style={{fontSize:10.5, fontWeight:700, padding:'2px 6px', borderRadius:6,
                                background:'var(--pg-blue-100)', color:'var(--pg-blue-700)'}}>
                                {lang==='pt'?'ABERTA':lang==='es'?'ABIERTA':'OPEN'}
                              </span>
                              {pending > 0 && <span style={{fontSize:11, color:'oklch(0.48 0.14 68)', fontWeight:700}}>
                                {pending} {lang==='pt'?'pendente(s)':lang==='es'?'pendiente(s)':'pending'}
                              </span>}
                              {withInterview > 0 && <span style={{fontSize:11, color:'oklch(0.40 0.18 145)', fontWeight:600}}>
                                📅 {withInterview} {lang==='pt'?'entrev.':lang==='es'?'entrev.':'interview'}{withInterview>1?'s':''}
                              </span>}
                            </div>
                          </div>
                          <div style={{display:'flex', alignItems:'center', gap:4, flexShrink:0}}>
                            {totalApplicants > 0 && <span style={{fontSize:12, color:'var(--pg-blue-500)', fontWeight:700}}>
                              {totalApplicants} {lang==='pt'?'cands.':lang==='es'?'cands.':'apps'}
                            </span>}
                            {Icon.chev(14,'var(--pg-ink-300)')}
                          </div>
                        </div>
                      );
                    })
              )}
            </div>
          </div>
        );
      })()}

      {/* ── Content panels ── */}
      <div style={{padding:'14px 18px 0'}}>
        {sub === 'hiring' && <HiringPanel t={t} lang={lang} onChat={openChat} onViewApplicants={openApplicants} onCreate={()=>setHiringSheetOpen(true)} user={ctx.user} onApply={openApplyJob} hidePosted={true} openPublicProfile={openPublicProfile} liveJobs={liveJobs}/>}
        {sub === 'techs'  && <TechsPanel  t={t} lang={lang} onChat={openChat} onCreate={()=>setTechSheetOpen(true)} openPublicProfile={openPublicProfile} liveTechs={liveTechs}/>}
        {sub === 'vac'    && <VacationPanel t={t} lang={lang} vacTab={vacTab} setVacTab={setVacTab}
                              onChat={openChat} onCreate={openVacSheet}
                              onViewApplicants={openApplicants}
                              openDayPicker={openDayPicker}
                              openSchedule={openSchedule}
                              openPublicProfile={openPublicProfile}/>}
      </div>

    </div>
    {FabBtn}
    </div>
  );
}

// ── Shared "My Applications" tracking section ─────────────────
function MyApplicationsSection({ apps, lang, onChat, type='hiring' }) {
  if (!apps || apps.length === 0) return null;

  const sectionLabel = lang==='pt' ? 'MINHAS CANDIDATURAS' : lang==='es' ? 'MIS SOLICITUDES' : 'MY APPLICATIONS';
  const pendingCount = apps.filter(a => a.status === 'pending').length;

  const TypeIcon = (s, c) => type === 'techs' ? (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 7a4 4 0 1 0-5 5l-6 6 3 3 6-6a4 4 0 0 0 5-5l-3 3-3-3z"/>
    </svg>
  ) : Icon.briefcase(s, c);

  return (
    <div style={{borderTop:'0.5px solid var(--pg-ink-200)', marginTop:20, paddingTop:16, marginBottom:16}}>
      {/* Header */}
      <div style={{display:'flex', alignItems:'center', gap:7, marginBottom:12}}>
        <div style={{width:3, height:16, borderRadius:2, background:'var(--pg-blue-500)', flexShrink:0}}/>
        <span style={{fontSize:11.5, fontWeight:700, letterSpacing:'0.06em', color:'var(--pg-ink-700)'}}>{sectionLabel}</span>
        <span style={{
          fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:999,
          background: pendingCount > 0 ? 'oklch(0.96 0.05 68)' : 'var(--pg-ink-100)',
          color:      pendingCount > 0 ? 'oklch(0.48 0.14 68)' : 'var(--pg-ink-500)',
        }}>{apps.length}</span>
      </div>

      <div style={{display:'flex', flexDirection:'column', gap:12}}>
        {apps.map(app => {
          const isPending  = app.status === 'pending';
          const isAccepted = app.status === 'accepted';
          const isRejected = app.status === 'rejected';

          const statusCfg = isPending ? {
            label: lang==='pt'?'AGUARDANDO':lang==='es'?'PENDIENTE':'PENDING',
            bg:'oklch(0.96 0.05 68)', color:'oklch(0.48 0.14 68)', bar:'oklch(0.75 0.14 68)',
          } : isAccepted ? {
            label: lang==='pt'?'ACEITO ✓':lang==='es'?'ACEPTADO ✓':'ACCEPTED ✓',
            bg:'var(--pg-aqua-100)', color:'var(--pg-aqua-700)', bar:'var(--pg-aqua-500)',
          } : {
            label: lang==='pt'?'RECUSADO':lang==='es'?'RECHAZADO':'REJECTED',
            bg:'oklch(0.95 0.04 20)', color:'oklch(0.45 0.18 20)', bar:'oklch(0.60 0.18 20)',
          };

          const iconColor = isAccepted ? 'var(--pg-aqua-700)' : isRejected ? 'var(--pg-ink-400)' : 'var(--pg-blue-700)';
          const iconBg    = isAccepted ? 'var(--pg-aqua-100)' : isRejected ? 'var(--pg-ink-100)' : 'var(--pg-blue-100)';

          return (
            <article key={app.id} className="pg-card" style={{padding:0, overflow:'hidden', borderLeft:`3px solid ${statusCfg.bar}`}}>

              {/* Status banner */}
              <div style={{
                background:statusCfg.bg, padding:'7px 14px',
                display:'flex', alignItems:'center', justifyContent:'space-between',
              }}>
                <span style={{fontSize:10.5, fontWeight:800, letterSpacing:'0.08em', color:statusCfg.color}}>
                  {statusCfg.label}
                </span>
                <span style={{fontSize:11, color:statusCfg.color, opacity:0.75}}>
                  {app.when} {lang==='pt'?'atrás':lang==='es'?'atrás':'ago'}
                </span>
              </div>

              {/* Body */}
              <div style={{padding:'12px 14px 14px'}}>
                {/* Company + role row */}
                <div style={{display:'flex', alignItems:'flex-start', gap:10, marginBottom:8}}>
                  <div style={{
                    width:36, height:36, borderRadius:9, flexShrink:0,
                    background:iconBg, display:'flex', alignItems:'center', justifyContent:'center',
                  }}>
                    {TypeIcon(16, iconColor)}
                  </div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{
                      fontSize:14, fontWeight:700, marginBottom:2,
                      color: isRejected ? 'var(--pg-ink-500)' : 'var(--pg-ink-900)',
                    }}>
                      {app.company}
                    </div>
                    <div style={{fontSize:12.5, color:'var(--pg-ink-600)', fontWeight:500}}>
                      {tr(app.title, lang)}
                    </div>
                    <div style={{display:'flex', alignItems:'center', gap:6, marginTop:4, fontSize:11.5, color:'var(--pg-ink-500)', flexWrap:'wrap'}}>
                      {Icon.pin(11,'var(--pg-ink-400)')} {app.loc}
                      <span style={{color:'var(--pg-ink-300)'}}>·</span>
                      <span style={{
                        fontFamily:'var(--pg-font-display)', fontWeight:700, fontSize:13,
                        color: isRejected ? 'var(--pg-ink-400)' : 'var(--pg-blue-500)',
                        textDecoration: isRejected ? 'line-through' : 'none',
                      }}>{tr(app.pay, lang)}</span>
                    </div>
                  </div>
                </div>

                {/* Note */}
                {app.note && (
                  <div style={{
                    fontSize:12, lineHeight:1.45, padding:'8px 10px', borderRadius:8, marginBottom:12,
                    color:      isRejected ? 'var(--pg-ink-400)' : 'var(--pg-ink-600)',
                    background: isRejected ? 'var(--pg-ink-50)'  : 'var(--pg-blue-50)',
                  }}>
                    {tr(app.note, lang)}
                  </div>
                )}

                {/* Actions */}
                <div style={{display:'flex', gap:8, paddingTop:10, borderTop:'0.5px solid var(--pg-ink-100)'}}>
                  <button onClick={()=>onChat(app.company)} className="pg-btn pg-btn-ghost"
                    style={{height:34, padding:'0 14px', fontSize:12.5, borderRadius:999}}>
                    {Icon.msg(13, 'var(--pg-blue-700)')}
                  </button>
                  {isAccepted ? (
                    <button className="pg-btn pg-btn-aqua"
                      style={{flex:1, height:34, fontSize:12.5, borderRadius:999}}>
                      {lang==='pt'?'Ver detalhes':lang==='es'?'Ver detalles':'View details'}
                    </button>
                  ) : isRejected ? (
                    <button className="pg-btn pg-btn-ghost" disabled
                      style={{flex:1, height:34, fontSize:12.5, borderRadius:999, opacity:0.45}}>
                      {lang==='pt'?'Candidatura encerrada':lang==='es'?'Postulación cerrada':'Application closed'}
                    </button>
                  ) : (
                    <button className="pg-btn pg-btn-outline"
                      style={{flex:1, height:34, fontSize:12.5, borderRadius:999, color:'var(--pg-danger)'}}>
                      {lang==='pt'?'Cancelar':lang==='es'?'Cancelar':'Withdraw'}
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

// ── Card with company-style header ────────────────────────────
function HiringPanel({ t, lang, onChat, onViewApplicants, onCreate, user, onApply, hidePosted=false, openPublicProfile, liveJobs=[] }) {
  const Company = (s=20, c='var(--pg-blue-500)') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="18" rx="2"/>
      <path d="M9 8h2M13 8h2M9 12h2M13 12h2M9 16h2M13 16h2"/>
    </svg>
  );
  const Briefcase = (s=13, c='var(--pg-ink-500)') => Icon.briefcase(s, c);
  const License = (s=13, c='var(--pg-ink-500)') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="18" height="13" rx="2"/><path d="M7 11h4M7 14h6M14 10h4v6h-4z"/>
    </svg>
  );
  const cdlLbl = lang==='pt'?'Carteira de motorista obrigatória':lang==='es'?'Licencia de conducir requerida':'Driver license required';
  const eqProv = lang==='pt'?'Equipamento fornecido':lang==='es'?'Equipo provisto':'Equipment provided';

  const contractLabel = (c) => ({
    fullTime: lang==='pt'?'Full-time':lang==='es'?'Tiempo completo':'Full-time',
    partTime: lang==='pt'?'Part-time':lang==='es'?'Medio tiempo':'Part-time',
    contract: lang==='pt'?'Contrato':lang==='es'?'Contrato':'Contract',
  }[c] || c);

  return (
    <>
    <div style={{display:'flex', flexDirection:'column', gap:12}}>
      {/* ── Live jobs posted by real users ── */}
      {liveJobs.map(job => (
        <article key={job._id} className="pg-card" style={{padding:'14px 16px', border:'1.5px solid var(--pg-aqua-400,#38bdf8)'}}>
          <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:6}}>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:15, fontWeight:700, color:'var(--pg-ink-900)', letterSpacing:'-0.01em'}}>{job.role}</div>
              <div style={{display:'flex', alignItems:'center', gap:5, marginTop:3, color:'var(--pg-ink-500)', fontSize:12}}>
                {Icon.pin(11,'var(--pg-ink-400)')} {job.loc}
              </div>
            </div>
            <span style={{fontSize:9.5, fontWeight:700, padding:'2px 8px', borderRadius:6, background:'var(--pg-aqua-100)', color:'var(--pg-aqua-700)', flexShrink:0, marginLeft:8, letterSpacing:'0.05em'}}>NEW</span>
          </div>
          {job.desc ? <p style={{margin:'0 0 10px', fontSize:12.5, color:'var(--pg-ink-600)', lineHeight:1.45}}>{job.desc}</p> : null}
          <div style={{display:'flex', gap:6, flexWrap:'wrap', marginBottom:8}}>
            <span className="pg-chip" style={{fontSize:11}}>{contractLabel(job.contract)}</span>
            {job.payMode !== 'neg' && job.pay
              ? <span className="pg-chip pg-chip-aqua" style={{fontSize:11}}>${job.pay}{job.payMode==='weekly'?(lang==='pt'?'/sem':'/wk'):'/pool'}</span>
              : null}
            {job.payMode === 'neg' ? <span className="pg-chip" style={{fontSize:11}}>{lang==='pt'?'Negociável':lang==='es'?'Negociable':'Negotiable'}</span> : null}
            {job.carReq === 'ownCar'      ? <span className="pg-chip" style={{fontSize:11}}>🚗 {lang==='pt'?'Carro próprio':lang==='es'?'Auto propio':'Own car'}</span> : null}
            {job.carReq === 'companyCar'  ? <span className="pg-chip" style={{fontSize:11}}>🏢 {lang==='pt'?'Carro fornecido':lang==='es'?'Auto provisto':'Company car'}</span> : null}
            {job.equipReq === 'ownEquip'  ? <span className="pg-chip" style={{fontSize:11}}>🔧 {lang==='pt'?'Equip. próprio':lang==='es'?'Equipo propio':'Own equip.'}</span> : null}
          </div>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:4}}>
            <span style={{fontSize:11, color:'var(--pg-ink-400)'}}>👤 {job.author}</span>
            <button onClick={()=>onApply && onApply(job)} className="pg-btn pg-btn-primary" style={{height:34, padding:'0 16px', fontSize:12.5, borderRadius:999}}>
              {t.apply}
            </button>
          </div>
        </article>
      ))}
      {/* ── Static seed jobs ── */}
      {HIRING.map(h => (
        <article key={h.id} className="pg-card" style={{padding:'14px 16px 14px'}}>
          <button onClick={()=>openPublicProfile && openPublicProfile({ name:h.company, rating:4.8, reviews:64, jobs:120, loc:h.loc })}
            style={{display:'flex', alignItems:'center', gap:10, marginBottom:8, background:'none', border:'none', cursor:'pointer', padding:0, fontFamily:'inherit', textAlign:'left', width:'100%'}} className="pg-press">
            <div style={{
              width:28, height:28, borderRadius:7, background:'var(--pg-blue-100)',
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
            }}>{Company(15, 'var(--pg-blue-700)')}</div>
            <h3 style={{margin:0, fontFamily:'var(--pg-font-display)', fontSize:16, fontWeight:700, letterSpacing:'-0.015em', flex:1}}>{h.company}</h3>
            <span style={{fontSize:11, color:'var(--pg-blue-500)', fontWeight:600, flexShrink:0}}>Ver perfil →</span>
          </button>
          <p style={{margin:0, fontSize:13, lineHeight:1.45, color:'var(--pg-ink-700)'}}>
            {descForHiring(h, lang)}
          </p>
          <div style={{display:'flex', flexDirection:'column', gap:6, marginTop:10, fontSize:12.5, color:'var(--pg-ink-500)'}}>
            <div style={{display:'flex', alignItems:'center', gap:12, flexWrap:'wrap'}}>
              <span style={{display:'inline-flex', alignItems:'center', gap:5}}>
                {Icon.pin(13, 'var(--pg-ink-500)')} {h.loc}
              </span>
              <span style={{display:'inline-flex', alignItems:'center', gap:5}}>
                {Briefcase(13, 'var(--pg-ink-500)')} {eqProv}
              </span>
            </div>
            <div style={{display:'inline-flex', alignItems:'center', gap:5}}>
              {License(13, 'var(--pg-ink-500)')} {cdlLbl}
            </div>
          </div>
          <div className="pg-divider" style={{margin:'12px 0'}}/>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <div style={{
              fontFamily:'var(--pg-font-display)', fontSize:16, fontWeight:700,
              color: tr(h.pay, lang) === t.negotiable ? 'var(--pg-aqua-700)' : 'var(--pg-blue-500)',
              letterSpacing:'-0.01em',
            }}>{tr(h.pay, lang)}</div>
            <button onClick={()=>onApply && onApply(h)} className="pg-btn pg-btn-primary" style={{height:36, padding:'0 18px', fontSize:13, borderRadius:999}}>{t.apply}</button>
          </div>
        </article>
      ))}
    </div>
    {/* My Posted Jobs — bottom section (hidden when tab switcher is active) */}
    {!hidePosted && (() => {
      const myPosts = MY_POSTS.filter(p => p.type === 'hiring');
      if (myPosts.length === 0) return null;
      const sectionLbl = lang==='pt' ? 'MINHAS VAGAS PUBLICADAS' : lang==='es' ? 'MIS VACANTES PUBLICADAS' : 'MY POSTED JOBS';
      return (
        <div style={{borderTop:'0.5px solid var(--pg-ink-200)', marginTop:20, paddingTop:16, marginBottom:16}}>
          <div style={{display:'flex', alignItems:'center', gap:7, marginBottom:12}}>
            <div style={{width:3, height:16, borderRadius:2, background:'var(--pg-blue-500)', flexShrink:0}}/>
            <span style={{fontSize:11.5, fontWeight:700, letterSpacing:'0.06em', color:'var(--pg-ink-700)'}}>
              {sectionLbl}
            </span>
            <span style={{
              fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:999,
              background:'var(--pg-blue-100)', color:'var(--pg-blue-700)',
            }}>{myPosts.length}</span>
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:12}}>
            {myPosts.map(post => {
              const pending       = post.applicants.filter(a=>a.status==='pending').length;
              const withInterview = post.applicants.filter(a=>a.interview).length;
              return (
                <article key={post.id} className="pg-card"
                  style={{padding:'12px 14px', cursor:'pointer'}}
                  onClick={()=>onViewApplicants && onViewApplicants(post)}>
                  <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10}}>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontSize:14, fontWeight:700, marginBottom:4,
                        whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                        {tr(post.title, lang)}
                      </div>
                      <div style={{display:'flex', alignItems:'center', gap:6, flexWrap:'wrap'}}>
                        <span style={{fontSize:10.5, fontWeight:700, padding:'2px 7px', borderRadius:999,
                          background:'var(--pg-aqua-100)', color:'var(--pg-aqua-700)'}}>
                          {lang==='pt'?'ABERTA':lang==='es'?'ABIERTA':'OPEN'}
                        </span>
                        {pending > 0 && (
                          <span style={{fontSize:11, color:'oklch(0.48 0.14 68)', fontWeight:700}}>
                            {pending} {lang==='pt'?'pendente(s)':lang==='es'?'pendiente(s)':'pending'}
                          </span>
                        )}
                        {withInterview > 0 && (
                          <span style={{fontSize:11, color:'oklch(0.40 0.18 145)', fontWeight:600}}>
                            📅 {withInterview} {lang==='pt'?'entrevista':lang==='es'?'entrevista':'interview'}{withInterview>1?'s':''}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{display:'flex', alignItems:'center', gap:5, flexShrink:0}}>
                      <span style={{fontSize:12, color:'var(--pg-blue-500)', fontWeight:600}}>
                        {post.applicants.length} {lang==='pt'?'cands.':lang==='es'?'cands.':'apps'}
                      </span>
                      {Icon.chev(14,'var(--pg-ink-300)')}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      );
    })()}

    </>
  );
}

function descForHiring(h, lang) {
  const descs = {
    1: { en:'Looking for a reliable pool tech for our growing route. Full training provided.',
         pt:'Procurando técnico de piscina confiável para nossa rota em crescimento. Treinamento completo.',
         es:'Buscamos técnico de piscina confiable para nuestra ruta en crecimiento. Capacitación completa.' },
    2: { en:'Expanding company needs experienced technician. Truck and equipment provided. CPO preferred.',
         pt:'Empresa em expansão precisa de técnico experiente. Veículo e equipamentos fornecidos. CPO preferencial.',
         es:'Empresa en expansión necesita técnico con experiencia. Camioneta y equipo provistos. CPO preferido.' },
    3: { en:'High-end residential route. Must have own equipment and truck. Premium clientele.',
         pt:'Rota residencial premium. Necessário equipamento e veículo próprios. Clientela exclusiva.',
         es:'Ruta residencial premium. Necesario equipo y camioneta propios. Clientela exclusiva.' },
  };
  return (descs[h.id] || descs[1])[lang] || (descs[h.id] || descs[1]).en;
}

// ── Tech Review Sheet ─────────────────────────────────────────
function TechReviewSheet({ open, onClose, tech, lang='en' }) {
  const [rating,   setRating]   = React.useState(0);
  const [hover,    setHover]    = React.useState(0);
  const [comment,  setComment]  = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(() => {
    if (open) { setRating(0); setHover(0); setComment(''); setSubmitted(false); }
  }, [open]);

  if (!tech) return null;

  const titleLbl   = lang==='pt' ? 'Avaliar técnico'    : lang==='es' ? 'Calificar técnico'   : 'Rate technician';
  const reviewPh   = lang==='pt' ? 'Compartilhe sua experiência com este técnico…' : lang==='es' ? 'Comparte tu experiencia con este técnico…' : 'Share your experience with this technician…';
  const submitLbl  = lang==='pt' ? 'Enviar avaliação'   : lang==='es' ? 'Enviar reseña'        : 'Submit review';
  const skipLbl    = lang==='pt' ? 'Pular por agora'    : lang==='es' ? 'Omitir por ahora'     : 'Skip for now';
  const sentLbl    = lang==='pt' ? 'Avaliação enviada!' : lang==='es' ? '¡Reseña enviada!'     : 'Review submitted!';
  const sentSubLbl = lang==='pt' ? 'Obrigado! Isso ajuda outros pool guys a escolher técnicos de qualidade.'
                   : lang==='es' ? '¡Gracias! Esto ayuda a otros pool guys a elegir técnicos de calidad.'
                   : 'Thanks! This helps other pool guys choose quality technicians.';

  const starLabels = {
    en:['Terrible','Bad','OK','Good','Excellent'],
    pt:['Péssimo','Ruim','Ok','Bom','Excelente'],
    es:['Pésimo','Malo','Ok','Bueno','Excelente'],
  };
  const sLabels  = starLabels[lang] || starLabels.en;
  const displayed = hover || rating;

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => onClose(), 1900);
  };

  return (
    <Sheet open={open} onClose={onClose} height="auto">
      <div style={{padding:'6px 20px 36px'}}>
        {submitted ? (
          <div style={{textAlign:'center', padding:'20px 0 10px'}}>
            <div style={{width:68, height:68, borderRadius:'50%', background:'var(--pg-aqua-100)', margin:'0 auto 14px', display:'flex', alignItems:'center', justifyContent:'center'}}>
              {Icon.check(30,'var(--pg-aqua-700)')}
            </div>
            <div style={{fontSize:20, fontWeight:700, letterSpacing:'-0.02em'}}>{sentLbl}</div>
            <div style={{fontSize:13, color:'var(--pg-ink-500)', marginTop:8, lineHeight:1.5, maxWidth:260, margin:'8px auto 0'}}>{sentSubLbl}</div>
          </div>
        ) : (
          <>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
              <h2 style={{margin:0, fontSize:18, fontWeight:700, letterSpacing:'-0.01em'}}>{titleLbl}</h2>
              <button onClick={onClose} style={{border:'none', background:'var(--pg-ink-100)', width:30, height:30, borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
                {Icon.x(16,'var(--pg-ink-700)')}
              </button>
            </div>

            {/* Tech info card */}
            <div style={{display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:11, background:'var(--pg-blue-50)', border:'0.5px solid var(--pg-blue-100)', marginBottom:20}}>
              <Avatar name={tech.name} size={38}/>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:14, fontWeight:700, color:'var(--pg-ink-900)'}}>{tech.name}</div>
                <div style={{fontSize:11, color:'var(--pg-ink-500)', marginTop:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                  {tr(tech.speciality, lang)} · {tech.loc}
                </div>
              </div>
              <div style={{display:'flex', alignItems:'center', gap:4, flexShrink:0}}>
                <Stars rating={tech.rating} size={11}/>
                <span style={{fontSize:12, fontWeight:600, color:'var(--pg-ink-500)'}}>{tech.rating}</span>
              </div>
            </div>

            {/* Star picker */}
            <div style={{textAlign:'center', marginBottom:20}}>
              <div style={{display:'flex', justifyContent:'center', gap:6, marginBottom:10}}>
                {[1,2,3,4,5].map(s => (
                  <button key={s}
                    onMouseEnter={()=>setHover(s)} onMouseLeave={()=>setHover(0)}
                    onClick={()=>setRating(s)}
                    style={{border:'none', background:'transparent', cursor:'pointer', padding:4,
                      transform:displayed>=s?'scale(1.1)':'scale(1)', transition:'transform .12s'}}>
                    {Icon.star(38, displayed>=s?'oklch(0.78 0.18 80)':'var(--pg-ink-200)', displayed>=s)}
                  </button>
                ))}
              </div>
              {displayed > 0 && (
                <div style={{fontSize:15, fontWeight:700, color:'oklch(0.55 0.18 80)', letterSpacing:'-0.01em'}}>
                  {sLabels[displayed-1]}
                </div>
              )}
            </div>

            <textarea
              value={comment} onChange={e=>setComment(e.target.value)}
              placeholder={reviewPh} rows={3}
              style={{width:'100%', borderRadius:12, border:'1px solid var(--pg-ink-200)',
                padding:'12px 14px', fontSize:14, fontFamily:'inherit',
                resize:'none', outline:'none', background:'var(--pg-ink-50)',
                boxSizing:'border-box', color:'var(--pg-ink-900)', lineHeight:1.5}}
            />

            <button onClick={handleSubmit} disabled={rating===0}
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

// ── Technicians — same card layout as Hiring ─────────────────
function TechsPanel({ t, lang, onChat, onCreate, openPublicProfile, liveTechs=[] }) {
  const [contactOpen, setContactOpen] = React.useState(null);
  const [ratingFor,   setRatingFor]   = React.useState(null);

  const Briefcase = (s=13, c='var(--pg-ink-500)') => Icon.briefcase(s, c);
  const Tool = (s=13, c='var(--pg-ink-500)') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 7a4 4 0 1 0-5 5l-6 6 3 3 6-6a4 4 0 0 0 5-5l-3 3-3-3z"/>
    </svg>
  );
  const verifiedLbl = lang==='pt'?'Técnico verificado':lang==='es'?'Técnico verificado':'Verified technician';
  const ownEquipLbl = lang==='pt'?'Equipamento próprio':lang==='es'?'Equipo propio':'Own equipment';

  const descForTech = (tech, lang) => {
    const map = {
      1: { en:'Specialized in pump and motor repair. 12 years of field experience. Same-day service available.',
           pt:'Especializado em reparo de bombas e motores. 12 anos de experiência. Atendimento no mesmo dia.',
           es:'Especializado en reparación de bombas y motores. 12 años de experiencia. Servicio mismo día.' },
      2: { en:'Heater and heat-pump diagnostics. Pentair and Hayward certified.',
           pt:'Diagnóstico de aquecedores e bombas de calor. Certificado Pentair e Hayward.',
           es:'Diagnóstico de calentadores y bombas de calor. Certificado Pentair y Hayward.' },
      3: { en:'Automation, salt-cell replacement and full equipment installs. Works weekends.',
           pt:'Automação, troca de células de sal e instalações completas. Trabalha fins de semana.',
           es:'Automatización, reemplazo de celdas de sal e instalaciones completas. Trabaja fines de semana.' },
      4: { en:'Tile, plaster and surface repair for residential and commercial pools. Quote on request.',
           pt:'Azulejo, reboco e reparo de superfícies para piscinas residenciais e comerciais. Orçamento sob consulta.',
           es:'Azulejo, yeso y reparación de superficies para piscinas residenciales y comerciales. Cotización a solicitud.' },
    };
    return (map[tech.id] || map[1])[lang] || (map[tech.id] || map[1]).en;
  };

  return (
    <>
    <div style={{display:'flex', flexDirection:'column', gap:12}}>
      {/* ── Live techs registered by real users ── */}
      {liveTechs.map(tech => (
        <article key={tech._id} className="pg-card" style={{padding:'14px 16px', border:'1.5px solid var(--pg-aqua-400,#38bdf8)'}}>
          <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:8}}>
            <Avatar name={tech.name} size={36}/>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:14, fontWeight:700, color:'var(--pg-ink-900)'}}>{tech.name}</div>
              <div style={{fontSize:12, color:'var(--pg-ink-500)', marginTop:1}}>{tech.specialty} · {tech.loc}</div>
            </div>
            <span style={{fontSize:9.5, fontWeight:700, padding:'2px 8px', borderRadius:6, background:'var(--pg-aqua-100)', color:'var(--pg-aqua-700)', flexShrink:0, letterSpacing:'0.05em'}}>NEW</span>
          </div>
          <div style={{display:'flex', gap:6, flexWrap:'wrap', marginBottom:10}}>
            {tech.rateMode === 'fixed' && tech.rate
              ? <span className="pg-chip pg-chip-aqua" style={{fontSize:12}}>
                  ${tech.rate}{lang==='pt'?'/visita':lang==='es'?'/visita':'/visit'}
                </span>
              : <span className="pg-chip" style={{fontSize:12}}>{lang==='pt'?'Negociável':lang==='es'?'Negociable':'Negotiable'}</span>}
            <span style={{display:'inline-flex', alignItems:'center', gap:4, fontSize:11, color:'var(--pg-ink-500)'}}>{Icon.pin(11,'var(--pg-ink-400)')} {tech.loc}</span>
          </div>
          <div style={{display:'flex', gap:8}}>
            {tech.phone && <a href={`tel:${tech.phone}`} className="pg-btn pg-btn-ghost" style={{flex:1, height:36, fontSize:12.5, borderRadius:999, display:'flex', alignItems:'center', justifyContent:'center', gap:5, textDecoration:'none', color:'inherit'}}>
              📞 {tech.phone}
            </a>}
          </div>
        </article>
      ))}
      {/* ── Static seed techs ── */}
      {TECHS.map(tech => (
        <article key={tech.id} className="pg-card" style={{padding:'14px 16px 14px'}}>
          <button onClick={()=>openPublicProfile && openPublicProfile({ name:tech.name, rating:tech.rating, reviews:tech.jobs, jobs:tech.jobs, loc:tech.loc })}
            style={{display:'flex', alignItems:'center', gap:10, marginBottom:8, background:'none', border:'none', cursor:'pointer', padding:0, fontFamily:'inherit', textAlign:'left', width:'100%'}} className="pg-press">
            <Avatar name={tech.name} size={28}/>
            <h3 style={{margin:0, fontFamily:'var(--pg-font-display)', fontSize:16, fontWeight:700, letterSpacing:'-0.015em', flex:1, minWidth:0}}>{tech.name}</h3>
            <span style={{display:'inline-flex', alignItems:'center', gap:3, fontSize:12, color:'var(--pg-ink-700)', fontWeight:600}}>
              <Stars rating={tech.rating} size={11}/> {tech.rating}
            </span>
          </button>
          <p style={{margin:0, fontSize:13, lineHeight:1.45, color:'var(--pg-ink-700)'}}>
            {descForTech(tech, lang)}
          </p>
          <div style={{display:'flex', flexDirection:'column', gap:6, marginTop:10, fontSize:12.5, color:'var(--pg-ink-500)'}}>
            <div style={{display:'flex', alignItems:'center', gap:12, flexWrap:'wrap'}}>
              <span style={{display:'inline-flex', alignItems:'center', gap:5}}>
                {Icon.pin(13, 'var(--pg-ink-500)')} {tech.loc}
              </span>
              <span style={{display:'inline-flex', alignItems:'center', gap:5}}>
                {Tool(13, 'var(--pg-ink-500)')} {tr(tech.speciality, lang)}
              </span>
            </div>
            <div style={{display:'inline-flex', alignItems:'center', gap:5}}>
              {Icon.shield(13, 'var(--pg-ink-500)')} {verifiedLbl} · {tech.jobs} {lang==='pt'?'trabalhos':lang==='es'?'trabajos':'jobs'}
            </div>
          </div>
          <div className="pg-divider" style={{margin:'12px 0'}}/>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <div style={{
              fontFamily:'var(--pg-font-display)', fontSize:16, fontWeight:700,
              color: tr(tech.rate, lang).toLowerCase().includes('quote') || tr(tech.rate, lang).toLowerCase().includes('orça') || tr(tech.rate, lang).toLowerCase().includes('cotiz') ? 'var(--pg-aqua-700)' : 'var(--pg-blue-500)',
              letterSpacing:'-0.01em',
            }}>{tr(tech.rate, lang)}</div>
            <div style={{display:'flex', gap:8}}>
              {/* Rate button */}
              <button onClick={()=>setRatingFor(tech)}
                className="pg-btn pg-btn-ghost"
                title={lang==='pt'?'Avaliar técnico':lang==='es'?'Calificar técnico':'Rate technician'}
                style={{height:36, width:36, padding:0, borderRadius:999, flexShrink:0}}>
                {Icon.star(16,'oklch(0.72 0.17 80)',false)}
              </button>
              {/* Contact / Close */}
              <button
                onClick={()=>setContactOpen(contactOpen===tech.id ? null : tech.id)}
                className={contactOpen===tech.id ? 'pg-btn pg-btn-ghost' : 'pg-btn pg-btn-primary'}
                style={{height:36, padding:'0 18px', fontSize:13, borderRadius:999}}>
                {contactOpen===tech.id
                  ? (lang==='pt'?'Fechar':lang==='es'?'Cerrar':'Close')
                  : t.contact}
              </button>
            </div>
          </div>

          {/* Inline contact info */}
          {contactOpen === tech.id && (
            <div style={{
              marginTop:10, padding:'12px 14px', borderRadius:12,
              background:'var(--pg-blue-50)', border:'0.5px solid var(--pg-blue-100)',
              display:'flex', flexDirection:'column', gap:10,
            }}>
              {/* Phone */}
              <a href={`tel:${tech.phone}`} style={{display:'flex', alignItems:'center', gap:12, textDecoration:'none'}}>
                <div style={{
                  width:36, height:36, borderRadius:10, flexShrink:0,
                  background:'var(--pg-blue-500)', display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 2.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/>
                  </svg>
                </div>
                <div>
                  <div style={{fontSize:10.5, fontWeight:700, letterSpacing:'0.06em', color:'var(--pg-ink-400)'}}>
                    {lang==='pt'?'TELEFONE':lang==='es'?'TELÉFONO':'PHONE'}
                  </div>
                  <div style={{fontSize:15, fontWeight:700, color:'var(--pg-blue-700)', letterSpacing:'-0.01em'}}>{tech.phone}</div>
                </div>
              </a>
              {/* Email */}
              {tech.email ? (
                <a href={`mailto:${tech.email}`} style={{display:'flex', alignItems:'center', gap:12, textDecoration:'none'}}>
                  <div style={{
                    width:36, height:36, borderRadius:10, flexShrink:0,
                    background:'var(--pg-aqua-100)', display:'flex', alignItems:'center', justifyContent:'center',
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--pg-aqua-700)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{fontSize:10.5, fontWeight:700, letterSpacing:'0.06em', color:'var(--pg-ink-400)'}}>EMAIL</div>
                    <div style={{fontSize:13, fontWeight:600, color:'var(--pg-aqua-700)'}}>{tech.email}</div>
                  </div>
                </a>
              ) : (
                <div style={{display:'flex', alignItems:'center', gap:12}}>
                  <div style={{
                    width:36, height:36, borderRadius:10, flexShrink:0,
                    background:'var(--pg-ink-100)', display:'flex', alignItems:'center', justifyContent:'center',
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--pg-ink-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <div style={{fontSize:12.5, color:'var(--pg-ink-400)', fontStyle:'italic'}}>
                    {lang==='pt'?'E-mail não informado':lang==='es'?'Email no disponible':'No email provided'}
                  </div>
                </div>
              )}
            </div>
          )}
        </article>
      ))}
    </div>

    {/* Tech Review Sheet */}
    <TechReviewSheet
      open={!!ratingFor} onClose={()=>setRatingFor(null)}
      tech={ratingFor} lang={lang}/>
    </>
  );
}

// ── Accepted vacation application card with address reveal ────
function AcceptedVacCard({ v, lang, onChat, onSchedule, openPublicProfile }) {
  const [showAddrs, setShowAddrs] = React.useState(false);
  const [mapDayWd, setMapDayWd] = React.useState(null); // which weekday's map is open

  const wdFull = lang==='pt'
    ? ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado']
    : lang==='es'
      ? ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
      : ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  const earnings = (v.selectedDays||v.days).length * (v.poolsPerDay||0) * (v.pricePerPool||0);

  const hasAddresses = v.addresses && Object.keys(v.addresses).length > 0;

  // Involved weekdays for the selected days
  const involvedWds = React.useMemo(() => {
    if (!v.yearMonth) return [];
    const set = new Set();
    (v.selectedDays || v.days).forEach(d =>
      set.add(new Date(v.yearMonth.year, v.yearMonth.month, d).getDay())
    );
    return [...set].sort();
  }, [v]);

  return (
    <article className="pg-card" style={{padding:0, overflow:'hidden', borderLeft:'3px solid var(--pg-aqua-500)'}}>
      {/* Status banner */}
      <div style={{background:'var(--pg-aqua-100)', padding:'7px 14px',
        display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <span style={{fontSize:10.5, fontWeight:800, letterSpacing:'0.08em', color:'var(--pg-aqua-700)'}}>
          {lang==='pt'?'ACEITO ✓':lang==='es'?'ACEPTADO ✓':'ACCEPTED ✓'}
        </span>
      </div>

      {/* Body */}
      <div style={{padding:'12px 14px 14px'}}>
        <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
          <button onClick={()=>openPublicProfile && openPublicProfile({ name:v.owner, rating:v.ownerRating||4.8, reviews:v.ownerJobs||30, jobs:v.ownerJobs||30, loc:v.region })}
            style={{display:'flex', alignItems:'center', gap:8, flex:1, minWidth:0, background:'none', border:'none', cursor:'pointer', padding:0, fontFamily:'inherit', textAlign:'left'}} className="pg-press">
            <Avatar name={v.owner} size={34}/>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:14, fontWeight:700}}>{v.owner}</div>
              <div style={{fontSize:11, color:'var(--pg-ink-500)'}}>
                {v.region} · {tr(v.month, lang)}
              </div>
            </div>
          </button>
          <div style={{textAlign:'right', flexShrink:0}}>
            <div style={{fontFamily:'var(--pg-font-display)', fontSize:17, fontWeight:700,
              color:'var(--pg-blue-500)', letterSpacing:'-0.02em'}}>
              ${earnings.toLocaleString()}
            </div>
            <div style={{fontSize:10.5, color:'var(--pg-ink-400)'}}>
              {(v.selectedDays||v.days).length} {lang==='pt'?'dias':lang==='es'?'días':'days'} · ${v.pricePerPool}/pool
            </div>
          </div>
        </div>

        {/* Selected days */}
        <div style={{marginBottom:10}}>
          <DayChips days={v.days} selectedDays={v.selectedDays||v.days}/>
        </div>

        {/* Per-weekday pools info */}
        {v.poolsByWeekday && involvedWds.length > 0 && (
          <div style={{display:'flex', gap:5, flexWrap:'wrap', marginBottom:10}}>
            {involvedWds.map(wd => {
              const cnt = v.poolsByWeekday[wd] ?? v.poolsPerDay ?? 0;
              return (
                <div key={wd} style={{
                  display:'flex', alignItems:'center', gap:4, padding:'3px 8px', borderRadius:6,
                  background:'var(--pg-blue-50)', border:'0.5px solid var(--pg-blue-100)',
                  fontSize:11, fontWeight:600, color:'var(--pg-blue-700)',
                }}>
                  {wdFull[wd].slice(0,3)} <span style={{fontWeight:800}}>{cnt}</span> 🏊
                </div>
              );
            })}
          </div>
        )}

        {/* Address section */}
        {hasAddresses && (
          <div style={{borderTop:'0.5px solid var(--pg-ink-100)', paddingTop:10, marginTop:4}}>
            <button onClick={()=>setShowAddrs(v=>!v)} style={{
              width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between',
              background:'none', border:'none', cursor:'pointer', padding:0, fontFamily:'inherit',
            }}>
              <span style={{fontSize:12.5, fontWeight:700, color:'var(--pg-blue-700)', display:'flex', alignItems:'center', gap:5}}>
                📍 {lang==='pt'?'Endereços das piscinas':lang==='es'?'Direcciones de piscinas':'Pool addresses'}
              </span>
              <span style={{fontSize:11, color:'var(--pg-blue-500)', fontWeight:600}}>
                {showAddrs ? (lang==='pt'?'Fechar':lang==='es'?'Cerrar':'Close') : (lang==='pt'?'Ver':lang==='es'?'Ver':'View')}
                {' '}{Icon.chev(11, 'var(--pg-blue-500)')}
              </span>
            </button>

            {showAddrs && (
              <div style={{marginTop:10, display:'flex', flexDirection:'column', gap:10}}>
                <div style={{fontSize:11, color:'var(--pg-blue-700)', padding:'5px 9px',
                  borderRadius:7, background:'var(--pg-blue-50)',
                  display:'flex', alignItems:'center', gap:6}}>
                  {Icon.shield(12,'var(--pg-blue-700)')}
                  {lang==='pt'?'Endereços confirmados — visíveis apenas para você':lang==='es'?'Direcciones confirmadas — visibles solo para ti':'Confirmed addresses — visible to you only'}
                </div>
                {involvedWds.map(wd => {
                  const addrsForWd = v.addresses[wd] || [];
                  const cnt = v.poolsByWeekday?.[wd] ?? v.poolsPerDay ?? addrsForWd.length;
                  const isMapOpen = mapDayWd === wd;
                  return (
                    <div key={wd} style={{borderRadius:10, overflow:'hidden', border:'0.5px solid var(--pg-ink-200)'}}>
                      <div style={{
                        display:'flex', alignItems:'center', justifyContent:'space-between',
                        padding:'8px 11px', background:'var(--pg-ink-100)',
                      }}>
                        <span style={{fontSize:12, fontWeight:700, color:'var(--pg-ink-700)'}}>
                          {wdFull[wd]} — <span style={{color:'var(--pg-blue-600)'}}>{cnt} 🏊</span>
                        </span>
                        <button onClick={()=>setMapDayWd(isMapOpen ? null : wd)} style={{
                          border:'none', background: isMapOpen ? 'var(--pg-blue-500)' : 'var(--pg-blue-100)',
                          color: isMapOpen ? '#fff' : 'var(--pg-blue-700)',
                          padding:'3px 9px', borderRadius:6, cursor:'pointer', fontFamily:'inherit',
                          fontSize:11, fontWeight:700, display:'flex', alignItems:'center', gap:4,
                        }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 11l19-9-9 19-2-8-8-2z"/>
                          </svg>
                          {isMapOpen ? (lang==='pt'?'Fechar':lang==='es'?'Cerrar':'Close') : (lang==='pt'?'Mapa':lang==='es'?'Mapa':'Map')}
                        </button>
                      </div>
                      {isMapOpen && (
                        <PoolRouteMap pools={addrsForWd} style={{borderRadius:0}}/>
                      )}
                      <div style={{padding:'6px 11px 8px'}}>
                        {addrsForWd.map((p, i) => (
                          <div key={i} style={{
                            display:'flex', alignItems:'center', gap:8, padding:'5px 0',
                            borderBottom: i < addrsForWd.length-1 ? '0.5px solid var(--pg-ink-100)' : 'none',
                          }}>
                            <div style={{
                              width:22, height:22, borderRadius:6, flexShrink:0,
                              background:'var(--pg-blue-500)', color:'#fff',
                              display:'flex', alignItems:'center', justifyContent:'center',
                              fontSize:10, fontWeight:700,
                            }}>{i+1}</div>
                            <span style={{fontSize:12, color:'var(--pg-ink-700)'}}>{p.addr}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Action row */}
        <div style={{display:'flex', gap:8, marginTop:12, paddingTop:10, borderTop:'0.5px solid var(--pg-ink-100)'}}>
          <button onClick={()=>onChat(v.owner)} className="pg-btn pg-btn-ghost"
            style={{height:34, padding:'0 14px', fontSize:12.5, borderRadius:999}}>
            {Icon.msg(13, 'var(--pg-blue-700)')}
          </button>
          <button onClick={()=>onSchedule && onSchedule(v)}
            className="pg-btn pg-btn-aqua"
            style={{flex:1, height:34, fontSize:12.5, borderRadius:999}}>
            {lang==='pt'?'Ver agenda':lang==='es'?'Ver agenda':'View schedule'}
          </button>
        </div>
      </div>
    </article>
  );
}

// ── Leaflet pool route map ─────────────────────────────────────
function PoolRouteMap({ pools=[], style={}, doneIndices=null }) {
  const mapRef  = React.useRef(null);
  const lMapRef = React.useRef(null);

  // Serialize done state so the effect re-runs when completion changes
  const doneKey = doneIndices ? [...doneIndices].sort().join(',') : '';

  React.useEffect(() => {
    if (!mapRef.current || pools.length === 0) return;
    if (lMapRef.current) { lMapRef.current.remove(); lMapRef.current = null; }

    const map = L.map(mapRef.current, { zoomControl:false, scrollWheelZoom:false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:'', maxZoom:18,
    }).addTo(map);

    pools.forEach((p, i) => {
      const done = doneIndices && doneIndices.has(i);
      const bg   = done ? '#34a853' : 'oklch(0.58 0.16 235)';
      const icon = L.divIcon({
        className:'',
        html:`<div style="width:26px;height:26px;border-radius:50%;background:${bg};color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;font-family:sans-serif;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.28)">${i+1}</div>`,
        iconSize:[26,26], iconAnchor:[13,13],
      });
      L.marker([p.lat, p.lng], { icon }).addTo(map).bindPopup(`<b>Pool ${i+1}</b><br>${p.addr}`);
    });

    if (pools.length > 1) {
      L.polyline(pools.map(p=>[p.lat, p.lng]), {
        color:'oklch(0.58 0.16 235)', weight:2.5, dashArray:'6 4', opacity:0.8,
      }).addTo(map);
    }

    const bounds = L.latLngBounds(pools.map(p=>[p.lat, p.lng]));
    map.fitBounds(bounds, { padding:[20,20] });
    lMapRef.current = map;
    setTimeout(() => map.invalidateSize(), 150);
    return () => { map.remove(); lMapRef.current = null; };
  }, [pools, doneKey]); // re-render markers when completion changes

  return <div ref={mapRef} style={{width:'100%', height:180, ...style}}/>;
}

// ── Vacation panel ────────────────────────────────────────────
function VacationPanel({ t, lang, vacTab, setVacTab, onChat, onCreate, onViewApplicants, openDayPicker, openSchedule, openPublicProfile }) {
  const boost = {
    title: lang==='pt'
      ? 'Cobrir férias impulsiona seu perfil'
      : lang==='es'
        ? 'Cubrir vacaciones impulsa tu perfil'
        : 'Covering vacations boosts your profile',
    body: lang==='pt'
      ? 'Pool guys que cobrem férias ganham impulsionamento no perfil e melhores avaliações — aparecendo no topo das buscas.'
      : lang==='es'
        ? 'Los pool guys que cubren vacaciones obtienen impulso en el perfil y mejores reseñas — apareciendo en el top de las búsquedas.'
        : 'Pool guys who cover vacations earn a profile boost and better reviews — showing up at the top of searches.',
    chip: lang==='pt' ? '+ Visibilidade · + Avaliações' : lang==='es' ? '+ Visibilidad · + Reseñas' : '+ Visibility · + Reviews',
  };

  // Labels
  const availSectionLabel  = lang==='pt' ? 'FÉRIAS PARA COBRIR'   : lang==='es' ? 'VACACIONES DISPONIBLES' : 'AVAILABLE TO COVER';
  const activityLabel      = lang==='pt' ? 'MINHA ATIVIDADE'      : lang==='es' ? 'MI ACTIVIDAD'           : 'MY ACTIVITY';
  const appTabLabel        = lang==='pt' ? 'Aplicações'           : lang==='es' ? 'Aplicaciones'           : 'Applications';
  const postsTabLabel      = lang==='pt' ? 'Minhas Postagens'     : lang==='es' ? 'Mis Publicaciones'      : 'My Posts';
  const nonePostedLabel    = lang==='pt' ? 'Nenhuma postagem ainda' : lang==='es' ? 'Sin publicaciones aún' : 'No posts yet';
  const noneAppliedLabel   = lang==='pt' ? 'Sem candidaturas pendentes ou recusadas.'
                           : lang==='es' ? 'Sin solicitudes pendientes o rechazadas.'
                           : 'No pending or rejected applications.';

  // Only show pending/rejected in this tab — accepted go to My Active Jobs
  const vacAppsFiltered = VACATIONS_APPLIED.filter(v => v.status !== 'accepted');
  const pickDaysLabel      = lang==='pt' ? 'Escolher dias' : lang==='es' ? 'Elegir días' : 'Pick days';
  const maxEarnLabel       = lang==='pt' ? 'GANHO MÁX.' : lang==='es' ? 'GANANCIA MÁX.' : 'MAX EARNINGS';
  const daysFreeLabel      = lang==='pt' ? 'dias livres' : lang==='es' ? 'días libres' : 'days free';
  const bookedLabel        = lang==='pt' ? 'reservados' : lang==='es' ? 'reservados' : 'booked';
  const selectedDaysLabel  = lang==='pt' ? 'Dias escolhidos' : lang==='es' ? 'Días elegidos' : 'Selected days';
  const pendingOwnerLabel  = (name) => lang==='pt' ? `Aguardando ${name}` : lang==='es' ? `Esperando a ${name}` : `Waiting for ${name}`;
  const withdrawLabel      = lang==='pt' ? 'Cancelar' : lang==='es' ? 'Cancelar' : 'Withdraw';

  return (
    <div style={{display:'flex', flexDirection:'column', gap:0}}>

      {/* ═══════════════════════════════════════════════ */}
      {/*  SECTION 1 — AVAILABLE TO COVER  (em destaque) */}
      {/* ═══════════════════════════════════════════════ */}
      <div style={{marginBottom:20}}>

        {/* Section header */}
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12}}>
          <div style={{display:'flex', alignItems:'center', gap:7}}>
            <div style={{width:3, height:16, borderRadius:2, background:'var(--pg-aqua-500)', flexShrink:0}}/>
            <span style={{fontSize:11.5, fontWeight:700, letterSpacing:'0.06em', color:'var(--pg-ink-700)'}}>
              {availSectionLabel}
            </span>
          </div>
          {VACATION_LISTINGS.length > 0 && (
            <span style={{fontSize:11, fontWeight:700, padding:'2px 9px', borderRadius:999,
              background:'var(--pg-aqua-100)', color:'var(--pg-aqua-700)'}}>
              {VACATION_LISTINGS.length} {lang==='pt'?'disponíveis':lang==='es'?'disponibles':'available'}
            </span>
          )}
        </div>

        {/* Boost motivation banner — compact */}
        <div style={{
          borderRadius:12, padding:'10px 13px', marginBottom:14,
          background:'linear-gradient(120deg, var(--pg-blue-900) 0%, oklch(0.34 0.13 215) 100%)',
          display:'flex', alignItems:'center', gap:10, color:'#fff',
          position:'relative', overflow:'hidden',
        }}>
          <div style={{position:'absolute', right:-16, top:-16, width:70, height:70, borderRadius:'50%',
            background:'oklch(0.85 0.15 90 / 0.13)', pointerEvents:'none'}}/>
          <div style={{width:28, height:28, borderRadius:8, flexShrink:0, background:'oklch(0.85 0.15 90)',
            display:'flex', alignItems:'center', justifyContent:'center'}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--pg-blue-900)">
              <path d="M12 2l2.39 7.36H22l-6.18 4.49L18.18 22 12 17.27 5.82 22l2.36-8.15L2 9.36h7.61z"/>
            </svg>
          </div>
          <div style={{flex:1, minWidth:0, position:'relative'}}>
            <div style={{fontSize:12, fontWeight:700, lineHeight:1.3}}>{boost.title}</div>
            <div style={{fontSize:10.5, opacity:0.75, marginTop:1}}>{boost.chip}</div>
          </div>
        </div>

        {/* ── Job-board style listing cards ── */}
        {VACATION_LISTINGS.length === 0 ? (
          <div style={{textAlign:'center', padding:'28px 16px', color:'var(--pg-ink-400)', fontSize:13}}>
            {lang==='pt'?'Nenhuma vaga disponível agora':lang==='es'?'Sin vacantes disponibles ahora':'No vacations available right now'}
          </div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:14}}>
            {VACATION_LISTINGS.map(v => {
              const availDays = v.days.filter(d => !v.bookedDays.includes(d));
              const maxEarnings = availDays.length * v.poolsPerDay * v.pricePerPool;
              return (
              <article key={v.id} className="pg-card" style={{padding:0, overflow:'hidden'}}>

                {/* ── Gradient header: region + month + price ── */}
                <div style={{
                  background:'linear-gradient(120deg, oklch(0.26 0.10 232) 0%, oklch(0.33 0.13 215) 100%)',
                  padding:'12px 14px 11px',
                  display:'flex', justifyContent:'space-between', alignItems:'flex-end',
                }}>
                  <div>
                    <div style={{fontSize:10, fontWeight:700, letterSpacing:'0.09em',
                      color:'rgba(255,255,255,0.52)', marginBottom:3, textTransform:'uppercase'}}>
                      {v.region}
                    </div>
                    <div style={{fontFamily:'var(--pg-font-display)', fontSize:18, fontWeight:700,
                      color:'#fff', letterSpacing:'-0.02em', lineHeight:1.1}}>
                      {tr(v.month, lang)}
                    </div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontFamily:'var(--pg-font-display)', fontSize:26, fontWeight:800,
                      color:'oklch(0.88 0.16 90)', letterSpacing:'-0.03em', lineHeight:1}}>
                      ${v.pricePerPool}
                      <span style={{fontSize:11.5, fontWeight:500, color:'rgba(255,255,255,0.45)'}}>/pool</span>
                    </div>
                    <div style={{fontSize:11, color:'rgba(255,255,255,0.52)', marginTop:1}}>
                      {v.poolsPerDay} {t.poolsPerDay}
                    </div>
                  </div>
                </div>

                {/* ── Card body ── */}
                <div style={{padding:'11px 14px 14px'}}>
                  {/* Owner row */}
                  <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
                    <button onClick={()=>openPublicProfile && openPublicProfile({ name:v.owner, rating:v.ownerRating, reviews:v.ownerJobs, jobs:v.ownerJobs, loc:v.region })}
                      style={{display:'flex', alignItems:'center', gap:8, flex:1, minWidth:0, background:'none', border:'none', cursor:'pointer', padding:0, fontFamily:'inherit', textAlign:'left'}} className="pg-press">
                      <Avatar name={v.owner} size={30}/>
                      <div style={{flex:1, minWidth:0}}>
                        <span style={{fontSize:13, fontWeight:600}}>{v.owner}</span>
                        <span style={{fontSize:11, color:'var(--pg-ink-400)', marginLeft:5}}>
                          ★ {v.ownerRating} · {v.ownerJobs} jobs
                        </span>
                      </div>
                    </button>
                    {availDays.length > 0 && (
                      <span style={{fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:999,
                        background:'var(--pg-aqua-100)', color:'var(--pg-aqua-700)', flexShrink:0}}>
                        {availDays.length} {daysFreeLabel}
                      </span>
                    )}
                    {v.bookedDays.length > 0 && (
                      <span style={{fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:999,
                        background:'var(--pg-ink-100)', color:'var(--pg-ink-500)', flexShrink:0}}>
                        {v.bookedDays.length} {bookedLabel}
                      </span>
                    )}
                  </div>

                  {/* Day chips */}
                  <DayChips days={v.days} bookedDays={v.bookedDays}
                    yearMonth={v.yearMonth} lang={lang}/>

                  {/* Pools per available day — one chip per day, matching the day chips above */}
                  {(v.poolsByWeekday || v.poolsPerDay) && (() => {
                    const wdShortNames = lang==='pt'
                      ? ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
                      : lang==='es'
                        ? ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
                        : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
                    const availDays = v.days.filter(d => !(v.bookedDays||[]).includes(d));
                    return (
                      <div style={{marginTop:8, padding:'7px 10px', borderRadius:9,
                        background:'var(--pg-blue-50)', border:'0.5px solid var(--pg-blue-100)'}}>
                        <div style={{fontSize:9.5, fontWeight:700, letterSpacing:'0.07em',
                          color:'var(--pg-blue-700)', marginBottom:5, textTransform:'uppercase'}}>
                          {lang==='pt'?'Piscinas por dia':lang==='es'?'Piscinas por día':'Pools per day'}
                        </div>
                        <div style={{display:'flex', gap:5, flexWrap:'wrap'}}>
                          {availDays.map(d => {
                            const wd = v.yearMonth
                              ? new Date(v.yearMonth.year, v.yearMonth.month, d).getDay()
                              : null;
                            const count = (wd !== null && v.poolsByWeekday?.[wd] !== undefined)
                              ? v.poolsByWeekday[wd]
                              : (v.poolsPerDay || '?');
                            return (
                              <div key={d} style={{
                                display:'flex', flexDirection:'column', alignItems:'center',
                                padding:'5px 9px', borderRadius:7,
                                background:'#fff', border:'0.5px solid var(--pg-blue-200)',
                                minWidth:36, gap:2,
                              }}>
                                {wd !== null && (
                                  <span style={{fontSize:9, fontWeight:700, color:'var(--pg-blue-600)',
                                    letterSpacing:'0.04em', lineHeight:1}}>
                                    {wdShortNames[wd].toUpperCase()}
                                  </span>
                                )}
                                <span style={{fontSize:13, fontWeight:800, color:'var(--pg-ink-900)',
                                  fontFamily:'var(--pg-font-display)', lineHeight:1.1}}>{count}</span>
                                <span style={{fontSize:9, color:'var(--pg-ink-400)'}}>🏊</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Note */}
                  <div style={{fontSize:11, color:'var(--pg-ink-400)', marginTop:7, lineHeight:1.45}}>
                    {tr(v.note, lang)}
                  </div>

                  {/* Footer: max earnings + CTA */}
                  <div style={{
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    marginTop:12, paddingTop:10, borderTop:'0.5px solid var(--pg-ink-100)',
                  }}>
                    <div>
                      <div style={{fontSize:10, fontWeight:700, letterSpacing:'0.06em', color:'var(--pg-ink-400)'}}>
                        {maxEarnLabel}
                      </div>
                      <div style={{fontFamily:'var(--pg-font-display)', fontSize:20, fontWeight:800,
                        color:'var(--pg-blue-500)', letterSpacing:'-0.02em', lineHeight:1.1}}>
                        ${maxEarnings.toLocaleString()}
                      </div>
                    </div>
                    <button onClick={()=>openDayPicker && openDayPicker(v)}
                      className="pg-btn pg-btn-primary"
                      style={{height:38, padding:'0 20px', fontSize:13.5, borderRadius:999, gap:5}}>
                      {pickDaysLabel} →
                    </button>
                  </div>
                </div>
              </article>
              );
            })}
          </div>
        )}
      </div>


    </div>
  );
}

// ── New Vacation creation sheet ───────────────────────────────
function PostVacationSheet({ onClose, lang='en', onSubmit }) {
  const t = STRINGS[lang];
  const allMonths = lang==='pt'
    ? ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
    : lang==='es'
      ? ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
      : ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayShort = lang==='pt'
    ? ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
    : lang==='es'
      ? ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
      : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const dayFull = lang==='pt'
    ? ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado']
    : lang==='es'
      ? ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
      : ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  // Only show current month and future months
  const currentMonthIdx = new Date().getMonth();
  const months = allMonths
    .map((m, i) => ({ name: m, idx: i }))
    .filter(({ idx }) => idx >= currentMonthIdx);

  const [monthIdx, setMonthIdx] = React.useState(currentMonthIdx);
  const [year] = React.useState(new Date().getFullYear());
  const [selectedDays, setSelectedDays] = React.useState(new Set());
  const [weekdayRegions, setWeekdayRegions] = React.useState({});   // {wd: string[]}
  const [poolsPerWeekday, setPoolsPerWeekday] = React.useState({});  // {wd: number}
  const [wdAddresses, setWdAddresses]         = React.useState({});  // {wd: string[]}
  const [price, setPrice] = React.useState('55');
  const [priceMode, setPriceMode] = React.useState('fixed');

  // Calendar — get days in selected month
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const firstDow = new Date(year, monthIdx, 1).getDay(); // 0=Sun

  const toggleDay = (d) => {
    setSelectedDays(prev => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d); else next.add(d);
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
  const getPoolsForWd = (wd) => poolsPerWeekday[wd] ?? 10;
  const setPoolsForWd = (wd, n) => {
    const newN = Math.max(1, Math.min(60, n));
    setPoolsPerWeekday(p => ({ ...p, [wd]: newN }));
    // Keep that weekday's address array in sync with its pool count
    setWdAddresses(a => {
      const arr = [...(a[wd] || [])];
      while (arr.length < newN) arr.push('');
      return { ...a, [wd]: arr.slice(0, newN) };
    });
  };

  // When new weekdays appear (days selected), initialise their address arrays
  React.useEffect(() => {
    setWdAddresses(a => {
      const next = { ...a };
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
      return { ...r, [wd]: cur.includes(city) ? cur.filter(c => c !== city) : [...cur, city] };
    });
  };

  // Flatten city list
  const allCities = React.useMemo(() => {
    const out = [];
    Object.entries(FL_COUNTIES).forEach(([county, cities]) =>
      cities.forEach(city => out.push({ city, county })));
    return out;
  }, []);

  const headLbl   = lang==='pt'?'Publicar disponibilidade':lang==='es'?'Publicar disponibilidad':'Post availability';
  const monthLbl  = lang==='pt'?'Mês':lang==='es'?'Mes':'Month';
  const daysLbl   = lang==='pt'?'Dias em que estarei fora':lang==='es'?'Días que estaré fuera':'Days I will be away';
  const regsLbl   = lang==='pt'?'Localização, piscinas e endereços por dia':lang==='es'?'Ubicación, piscinas y direcciones por día':'Location, pools & addresses by weekday';
  const priceLbl  = lang==='pt'?'Preço por piscina':lang==='es'?'Precio por piscina':'Price per pool';
  const submitLbl = lang==='pt'?'Publicar férias':lang==='es'?'Publicar vacaciones':'Post vacation';

  const isValid = selectedDays.size > 0 && involvedWeekdays.every(wd => (weekdayRegions[wd]?.length || 0) > 0);

  return (
    <div style={{padding:'8px 0 24px'}}>
      <div style={{padding:'4px 18px 14px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <button onClick={onClose} style={{
          border:'none', background:'transparent', color:'var(--pg-blue-500)',
          fontSize:15, fontWeight:600, cursor:'pointer', padding:0,
        }}>{t.cancel}</button>
        <h2 style={{margin:0, fontFamily:'var(--pg-font-display)', fontSize:17, fontWeight:700, letterSpacing:'-0.01em'}}>{headLbl}</h2>
        <div style={{width:60}}/>
      </div>

      <div style={{padding:'0 18px', display:'flex', flexDirection:'column', gap:18}}>
        {/* Month picker */}
        <div>
          <div style={{fontSize:11, color:'var(--pg-ink-500)', fontWeight:700, letterSpacing:'0.06em', marginBottom:8}}>{monthLbl.toUpperCase()}</div>
          <div className="pg-scroll-x" style={{display:'flex', gap:6, marginLeft:-18, marginRight:-18, padding:'2px 18px'}}>
            {months.map(({ name, idx }) => (
              <button key={idx} onClick={()=>{ setMonthIdx(idx); setSelectedDays(new Set()); setWeekdayRegions({}); }}
                className={`pg-chip ${monthIdx===idx?'pg-chip-on':''}`}>
                {name} {year}
              </button>
            ))}
          </div>
        </div>

        {/* Days picker */}
        <div>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:8}}>
            <div style={{fontSize:11, color:'var(--pg-ink-500)', fontWeight:700, letterSpacing:'0.06em'}}>{daysLbl.toUpperCase()}</div>
            <div style={{fontSize:11, color:'var(--pg-aqua-700)', fontWeight:600}}>
              {selectedDays.size} {t.days}
            </div>
          </div>
          <div className="pg-card" style={{padding:'12px 12px'}}>
            <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:4, marginBottom:6}}>
              {dayShort.map(d => (
                <div key={d} style={{fontSize:10, color:'var(--pg-ink-500)', textAlign:'center', fontWeight:600}}>{d}</div>
              ))}
            </div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:4}}>
              {Array.from({length: firstDow}).map((_, i) => (
                <div key={`spacer-${i}`}/>
              ))}
              {Array.from({length: daysInMonth}, (_, i) => i+1).map(d => {
                const on = selectedDays.has(d);
                return (
                  <button key={d} onClick={()=>toggleDay(d)} style={{
                    aspectRatio:'1', borderRadius:8, fontSize:12, fontWeight:600,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    background: on ? 'var(--pg-blue-500)' : 'transparent',
                    color: on ? '#fff' : 'var(--pg-ink-700)',
                    border:'none', cursor:'pointer', fontFamily:'inherit',
                    transition:'all .12s ease',
                  }}>{d}</button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Price */}
        <div>
          <div style={{fontSize:11, color:'var(--pg-ink-500)', fontWeight:700, letterSpacing:'0.06em', marginBottom:8}}>{priceLbl.toUpperCase()}</div>
          <div className="pg-seg" style={{marginBottom:10}}>
            <button className={`pg-seg-btn ${priceMode==='fixed'?'on':''}`} onClick={()=>setPriceMode('fixed')}>{t.fixedPrice}</button>
            <button className={`pg-seg-btn ${priceMode==='neg'?'on':''}`} onClick={()=>setPriceMode('neg')}>{t.priceNeg}</button>
          </div>
          {priceMode === 'fixed' && (
            <div style={{position:'relative'}}>
              <span style={{position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', fontSize:22, fontWeight:700, color:'var(--pg-blue-500)', fontFamily:'var(--pg-font-display)'}}>$</span>
              <input className="pg-field" value={price} onChange={e=>setPrice(e.target.value)}
                style={{height:60, paddingLeft:36, fontSize:26, fontWeight:700, color:'var(--pg-blue-500)', letterSpacing:'-0.02em', fontFamily:'var(--pg-font-display)'}}/>
              <span style={{position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', fontSize:13, color:'var(--pg-ink-500)'}}>{t.perPool}</span>
            </div>
          )}
        </div>

        {/* ── Localização + piscinas por dia da semana ── */}
        {involvedWeekdays.length > 0 && (
          <div>
            <div style={{fontSize:11, color:'var(--pg-ink-500)', fontWeight:700, letterSpacing:'0.06em', marginBottom:8}}>
              {regsLbl.toUpperCase()}
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:8}}>
              {involvedWeekdays.map(wd => (
                <WeekdayRegionRow key={wd}
                  label={dayFull[wd]}
                  values={weekdayRegions[wd] || []}
                  cities={allCities}
                  onToggle={(city) => toggleCityForWeekday(wd, city)}
                  poolCount={getPoolsForWd(wd)}
                  onPoolChange={(n) => setPoolsForWd(wd, n)}
                  pricePerPool={priceMode === 'fixed' ? parseInt(price || 0) : 0}
                  addresses={wdAddresses[wd] || []}
                  onAddressChange={(i, val) => setWdAddresses(a => {
                    const arr = [...(a[wd] || [])];
                    arr[i] = val;
                    return { ...a, [wd]: arr };
                  })}
                  lang={lang}
                />
              ))}
            </div>
          </div>
        )}

      </div>

      <div style={{padding:'14px 18px 8px', position:'sticky', bottom:0, background:'#fff', borderTop:'0.5px solid var(--pg-ink-100)'}}>
        {isValid && (
          <div style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'8px 12px', borderRadius:10, background:'var(--pg-blue-50)',
            marginBottom:10,
          }}>
            <div style={{fontSize:12, color:'var(--pg-ink-600)'}}>
              <b>{selectedDays.size}</b> {lang==='pt'?'dias · ':lang==='es'?'días · ':'days · '}
              <b>{involvedWeekdays.length}</b> {lang==='pt'?'dias/sem.':lang==='es'?'días/sem.':'weekdays'}
            </div>
            {priceMode === 'fixed' && totalPotential > 0 && (
              <div style={{fontFamily:'var(--pg-font-display)', fontSize:15, fontWeight:700, color:'var(--pg-blue-500)', letterSpacing:'-0.01em'}}>
                ${totalPotential.toLocaleString()} {lang==='pt'?'pot.':lang==='es'?'pot.':'pot.'}
              </div>
            )}
          </div>
        )}
        <button onClick={()=>onSubmit && onSubmit({ monthIdx, year, selectedDays:[...selectedDays], weekdayRegions, poolsPerWeekday, price, priceMode })}
          disabled={!isValid}
          className="pg-btn pg-btn-primary"
          style={{
            width:'100%', height:52, fontSize:16,
            opacity: isValid ? 1 : 0.45,
          }}>
          {Icon.cal(17, '#fff')} {submitLbl}
        </button>
      </div>
    </div>
  );
}

function WeekdayRegionRow({ label, values, cities, onToggle, poolCount, onPoolChange, pricePerPool=0, addresses=[], onAddressChange, lang }) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState('');
  const [showAddrs, setShowAddrs] = React.useState(false);
  const matches = q.trim().length >= 1
    ? cities.filter(c => c.city.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 8)
    : [];

  const addLbl    = lang==='pt'?'+ Cidade':lang==='es'?'+ Ciudad':'+ City';
  const searchPh  = lang==='pt'?'Buscar cidade…':lang==='es'?'Buscar ciudad…':'Search city…';
  const hasValues = values.length > 0;
  const dayEarnings = pricePerPool > 0 ? poolCount * pricePerPool : 0;

  return (
    <div className="pg-card" style={{padding:'12px 14px'}}>

      {/* ── Row 1: day pill + label + city search button ── */}
      <div style={{display:'flex', alignItems:'center', gap:10, marginBottom: hasValues ? 8 : 4}}>
        <div style={{
          width:38, height:38, borderRadius:10, background:'var(--pg-blue-100)', flexShrink:0,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:12, fontWeight:700, color:'var(--pg-blue-700)',
          fontFamily:'var(--pg-font-display)', letterSpacing:'-0.01em',
        }}>{label.slice(0,3)}</div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontSize:13.5, fontWeight:700, color:'var(--pg-ink-900)', letterSpacing:'-0.01em'}}>{label}</div>
          {!hasValues && (
            <div style={{fontSize:11, color:'var(--pg-ink-400)', marginTop:1}}>
              {lang==='pt'?'Nenhuma cidade':lang==='es'?'Sin ciudades':'No cities yet'}
            </div>
          )}
        </div>
        <button onClick={()=>{ setOpen(!open); setQ(''); }} style={{
          border:'1px solid ' + (open ? 'var(--pg-blue-400)' : 'var(--pg-ink-200)'),
          background: open ? 'var(--pg-blue-50)' : '#fff',
          height:30, padding:'0 11px', borderRadius:8,
          fontSize:12, fontWeight:600,
          color: open ? 'var(--pg-blue-600)' : 'var(--pg-blue-500)',
          cursor:'pointer', fontFamily:'inherit',
          display:'inline-flex', alignItems:'center', gap:4, flexShrink:0,
        }}>{open ? (lang==='pt'?'Fechar':lang==='es'?'Cerrar':'Close') : addLbl}</button>
      </div>

      {/* City chips */}
      {hasValues && (
        <div style={{display:'flex', flexWrap:'wrap', gap:4, marginBottom:10}}>
          {values.map(city => (
            <span key={city} style={{
              display:'inline-flex', alignItems:'center', gap:3,
              padding:'3px 8px', borderRadius:6,
              background:'var(--pg-aqua-100)', color:'var(--pg-aqua-700)',
              fontSize:11, fontWeight:600,
            }}>
              {city}
              <button onClick={()=>onToggle(city)} style={{
                border:'none', background:'transparent', padding:0, cursor:'pointer',
                display:'inline-flex', color:'var(--pg-aqua-700)', lineHeight:1,
              }}>×</button>
            </span>
          ))}
        </div>
      )}

      {/* City search dropdown */}
      {open && (
        <div style={{marginBottom:12, paddingBottom:12, borderBottom:'0.5px solid var(--pg-ink-100)'}}>
          <div style={{position:'relative', marginBottom:6}}>
            <input className="pg-field" value={q} onChange={e=>setQ(e.target.value)}
              placeholder={searchPh} style={{paddingLeft:38, height:38}} autoFocus/>
            <span style={{position:'absolute', left:14, top:'50%', transform:'translateY(-50%)'}}>
              {Icon.search(15, 'var(--pg-ink-500)')}
            </span>
          </div>
          {matches.length > 0 && (
            <div style={{display:'flex', flexDirection:'column', gap:3, maxHeight:160, overflow:'auto'}}>
              {matches.map(m => {
                const selected = values.includes(m.city);
                return (
                  <button key={m.city} onClick={()=>onToggle(m.city)} style={{
                    display:'flex', alignItems:'center', gap:8, padding:'7px 10px',
                    background: selected ? 'var(--pg-aqua-100)' : 'transparent',
                    border:'none', borderRadius:8, cursor:'pointer', textAlign:'left',
                    fontFamily:'inherit', fontSize:13,
                  }}>
                    {selected ? Icon.check(13,'var(--pg-aqua-700)') : Icon.pin(13,'var(--pg-blue-500)')}
                    <span style={{flex:1, fontWeight:selected?700:500, color:selected?'var(--pg-aqua-700)':'inherit'}}>{m.city}</span>
                    <span style={{fontSize:11, color:'var(--pg-ink-500)'}}>{m.county}</span>
                  </button>
                );
              })}
            </div>
          )}
          {q.trim().length >= 1 && matches.length === 0 && (
            <div style={{fontSize:12, color:'var(--pg-ink-500)', textAlign:'center', padding:'8px 0'}}>
              {lang==='pt'?'Nenhuma cidade encontrada':lang==='es'?'No se encontraron ciudades':'No cities found'}
            </div>
          )}
        </div>
      )}

      {/* ── Row 2: Pools this day ── */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        paddingTop: (hasValues || open) ? 10 : 4,
        borderTop: (hasValues || open) ? '0.5px solid var(--pg-ink-100)' : 'none',
      }}>
        <span style={{fontSize:12.5, color:'var(--pg-ink-600)', fontWeight:500}}>
          🏊 {lang==='pt'?'Piscinas neste dia':lang==='es'?'Piscinas este día':'Pools this day'}
        </span>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          {dayEarnings > 0 && (
            <span style={{fontSize:12, fontWeight:700, color:'var(--pg-blue-500)', fontFamily:'var(--pg-font-display)', letterSpacing:'-0.01em'}}>
              ${dayEarnings.toLocaleString()}
            </span>
          )}
          <div style={{display:'flex', alignItems:'center', gap:0, border:'1px solid var(--pg-ink-200)', borderRadius:8, overflow:'hidden'}}>
            <button onClick={()=>onPoolChange(poolCount - 1)} style={{
              width:30, height:30, border:'none', background:'var(--pg-ink-100)',
              cursor:'pointer', fontSize:16, fontWeight:700, color:'var(--pg-ink-700)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontFamily:'inherit', lineHeight:1,
            }}>−</button>
            <span style={{
              minWidth:34, textAlign:'center', fontSize:14, fontWeight:700,
              color:'var(--pg-blue-600)', fontFamily:'var(--pg-font-display)',
              padding:'0 4px', borderLeft:'1px solid var(--pg-ink-200)', borderRight:'1px solid var(--pg-ink-200)',
              lineHeight:'30px', display:'inline-block',
            }}>{poolCount}</span>
            <button onClick={()=>onPoolChange(poolCount + 1)} style={{
              width:30, height:30, border:'none', background:'var(--pg-blue-100)',
              cursor:'pointer', fontSize:16, fontWeight:700, color:'var(--pg-blue-700)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontFamily:'inherit', lineHeight:1,
            }}>+</button>
          </div>
        </div>
      </div>

      {/* ── Row 3: Addresses for this day ── */}
      <div style={{marginTop:10, paddingTop:10, borderTop:'0.5px solid var(--pg-ink-100)'}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <span style={{fontSize:12, color:'var(--pg-ink-500)', fontWeight:500}}>
            📍 {lang==='pt'
              ? `${addresses.filter(a=>a.trim()).length}/${poolCount} endereços`
              : lang==='es'
                ? `${addresses.filter(a=>a.trim()).length}/${poolCount} direcciones`
                : `${addresses.filter(a=>a.trim()).length}/${poolCount} addresses`}
          </span>
          <button onClick={()=>setShowAddrs(v=>!v)} style={{
            border:'1px solid var(--pg-ink-200)', background: showAddrs ? 'var(--pg-blue-50)' : '#fff',
            height:26, padding:'0 10px', borderRadius:7,
            fontSize:11.5, fontWeight:600,
            color: showAddrs ? 'var(--pg-blue-600)' : 'var(--pg-ink-600)',
            cursor:'pointer', fontFamily:'inherit',
          }}>
            {showAddrs
              ? (lang==='pt'?'Fechar':lang==='es'?'Cerrar':'Close')
              : (lang==='pt'?'Adicionar':lang==='es'?'Agregar':'Add')}
          </button>
        </div>

        {showAddrs && (
          <div style={{marginTop:8, display:'flex', flexDirection:'column', gap:6}}>
            <div style={{display:'flex', alignItems:'center', gap:6, padding:'5px 9px', borderRadius:7, background:'var(--pg-blue-50)'}}>
              {Icon.shield(12,'var(--pg-blue-700)')}
              <span style={{fontSize:10.5, color:'var(--pg-blue-700)', fontWeight:500}}>
                {lang==='pt'?'Revelados apenas ao técnico aprovado':lang==='es'?'Solo revelados al técnico aprobado':'Only revealed to the approved tech'}
              </span>
            </div>
            {addresses.map((addr, i) => (
              <div key={i} style={{display:'flex', alignItems:'center', gap:7}}>
                <div style={{
                  width:24, height:24, borderRadius:6, flexShrink:0,
                  background: addr.trim() ? 'var(--pg-blue-500)' : 'var(--pg-ink-200)',
                  color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:10, fontWeight:700, fontFamily:'var(--pg-font-display)',
                  transition:'background .15s ease',
                }}>{i+1}</div>
                <input
                  className="pg-field"
                  style={{height:38, fontSize:12.5}}
                  placeholder={lang==='pt'?`Endereço piscina ${i+1}…`:lang==='es'?`Dirección piscina ${i+1}…`:`Pool ${i+1} address…`}
                  value={addr}
                  onChange={e => onAddressChange && onAddressChange(i, e.target.value)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

// ── Post Hiring sheet ─────────────────────────────────────────
// ── Shared form helpers (defined outside any component so identity is stable) ──
function HiringFormSection({ label, children }) {
  return (
    <div>
      <div style={{fontSize:11, color:'var(--pg-ink-500)', fontWeight:700, letterSpacing:'0.06em', marginBottom:8, textTransform:'uppercase'}}>
        {label}
      </div>
      {children}
    </div>
  );
}

function HiringRequirementCard({ options, value, onChange }) {
  return (
    <div style={{display:'flex', flexDirection:'column', gap:8}}>
      {options.map(opt => {
        const on = value === opt.id;
        return (
          <button key={opt.id} onClick={()=>onChange(on ? '' : opt.id)} style={{
            display:'flex', alignItems:'center', gap:12, padding:'11px 14px',
            borderRadius:12, border: on ? '1.5px solid var(--pg-blue-400)' : '1.5px solid var(--pg-ink-200)',
            background: on ? 'var(--pg-blue-50)' : '#fff',
            cursor:'pointer', fontFamily:'inherit', textAlign:'left', transition:'all .15s',
          }}>
            <div style={{
              width:38, height:38, borderRadius:10, flexShrink:0,
              background: on ? 'var(--pg-blue-500)' : 'var(--pg-ink-100)',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              {opt.icon(on ? '#fff' : 'var(--pg-ink-500)')}
            </div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:13, fontWeight:700, color: on ? 'var(--pg-blue-700)' : 'var(--pg-ink-900)', marginBottom:2}}>
                {opt.label}
              </div>
              <div style={{fontSize:11, color: on ? 'var(--pg-blue-500)' : 'var(--pg-ink-400)'}}>
                {opt.sublabel}
              </div>
            </div>
            <div style={{
              width:20, height:20, borderRadius:'50%', flexShrink:0,
              border: on ? 'none' : '2px solid var(--pg-ink-300)',
              background: on ? 'var(--pg-blue-500)' : 'transparent',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              {on && <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function PostHiringSheet({ onClose, lang='en', onSubmit }) {
  const t = STRINGS[lang];
  const [role,     setRole]     = React.useState('');
  const [loc,      setLoc]      = React.useState('');
  const [contract, setContract] = React.useState('fullTime');
  const [payMode,  setPayMode]  = React.useState('perPool');
  const [pay,      setPay]      = React.useState('');
  const [carReq,   setCarReq]   = React.useState('');
  const [equipReq, setEquipReq] = React.useState('');
  const [desc,     setDesc]     = React.useState('');

  const headLbl     = lang==='pt'?'Publicar vaga':lang==='es'?'Publicar empleo':'Post a job';
  const roleLbl     = lang==='pt'?'Título do cargo':lang==='es'?'Título del puesto':'Job title';
  const rolePh      = lang==='pt'?'ex: Técnico de Piscina':lang==='es'?'ej: Técnico de Piscina':'e.g. Pool Service Technician';
  const locLbl      = lang==='pt'?'Localização':lang==='es'?'Ubicación':'Location';
  const contractLbl = lang==='pt'?'Tipo de contrato':lang==='es'?'Tipo de contrato':'Contract type';
  const payLbl      = lang==='pt'?'Tipo de pagamento':lang==='es'?'Tipo de pago':'Payment type';
  const descLbl     = lang==='pt'?'Descrição da vaga':lang==='es'?'Descripción del puesto':'Job description';
  const descPh      = lang==='pt'?'Descreva as responsabilidades, horários, benefícios…':lang==='es'?'Describa las responsabilidades, horarios, beneficios…':'Describe responsibilities, schedule, benefits…';
  const submitLbl   = lang==='pt'?'Publicar vaga':lang==='es'?'Publicar empleo':'Post job';

  const contractTypes = [
    { id:'fullTime', label: lang==='pt'?'Full-time':lang==='es'?'Tiempo completo':'Full-time' },
    { id:'partTime', label: lang==='pt'?'Part-time':lang==='es'?'Medio tiempo':'Part-time' },
    { id:'contract', label: lang==='pt'?'Contrato':lang==='es'?'Contrato':'Contract' },
  ];

  const payModes = [
    { id:'perPool', label: lang==='pt'?'Por piscina':lang==='es'?'Por piscina':'Per pool',  suffix:'/pool' },
    { id:'weekly',  label: lang==='pt'?'Semanal':lang==='es'?'Semanal':'Weekly',             suffix: lang==='pt'?'/sem':lang==='es'?'/sem':'/wk' },
    { id:'neg',     label: lang==='pt'?'Negociável':lang==='es'?'Negociable':'Negotiable',   suffix:'' },
  ];

  const carOptions = [
    {
      id:'ownCar',
      icon: c => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3v-5l2-5h14l2 5v5h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/><path d="M5 12h14"/></svg>,
      label:    lang==='pt'?'Candidato com carro':lang==='es'?'Candidato con auto':'Candidate has own vehicle',
      sublabel: lang==='pt'?'Veículo próprio obrigatório':lang==='es'?'Vehículo propio requerido':'Own vehicle required',
    },
    {
      id:'companyCar',
      icon: c => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M12 12v4M10 14h4"/></svg>,
      label:    lang==='pt'?'Empresa fornece veículo':lang==='es'?'Empresa provee vehículo':'Company provides vehicle',
      sublabel: lang==='pt'?'Caminhonete/van incluída':lang==='es'?'Camioneta/van incluida':'Truck/van included',
    },
  ];

  const equipOptions = [
    {
      id:'ownEquip',
      icon: c => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 7a4 4 0 1 0-5 5l-6 6 3 3 6-6a4 4 0 0 0 5-5l-3 3-3-3z"/></svg>,
      label:    lang==='pt'?'Candidato com equipamentos':lang==='es'?'Candidato con equipo':'Candidate has own equipment',
      sublabel: lang==='pt'?'Equipamentos próprios obrigatórios':lang==='es'?'Equipos propios requeridos':'Own equipment required',
    },
    {
      id:'companyEquip',
      icon: c => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
      label:    lang==='pt'?'Empresa fornece equipamentos':lang==='es'?'Empresa provee equipos':'Company provides equipment',
      sublabel: lang==='pt'?'Tudo incluído pela empresa':lang==='es'?'Todo incluido por la empresa':'Everything provided',
    },
  ];

  const isValid = role.trim().length > 0 && loc.trim().length > 0 && carReq !== '' && equipReq !== '';

  return (
    <div style={{padding:'8px 0 24px'}}>
      {/* Header */}
      <div style={{padding:'4px 18px 14px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <button onClick={onClose} style={{border:'none', background:'transparent', color:'var(--pg-blue-500)', fontSize:15, fontWeight:600, cursor:'pointer', padding:0}}>
          {t.cancel}
        </button>
        <h2 style={{margin:0, fontFamily:'var(--pg-font-display)', fontSize:17, fontWeight:700, letterSpacing:'-0.01em'}}>
          {headLbl}
        </h2>
        <div style={{width:60}}/>
      </div>

      <div style={{padding:'0 18px', display:'flex', flexDirection:'column', gap:20}}>

        <HiringFormSection label={roleLbl}>
          <input className="pg-field" value={role} onChange={e=>setRole(e.target.value)} placeholder={rolePh}/>
        </HiringFormSection>

        <HiringFormSection label={locLbl}>
          <CityAutocomplete value={loc} onChange={setLoc} lang={lang}/>
        </HiringFormSection>

        <HiringFormSection label={contractLbl}>
          <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
            {contractTypes.map(ct => {
              const on = contract === ct.id;
              return (
                <button key={ct.id} onClick={()=>setContract(ct.id)} style={{
                  padding:'8px 16px', borderRadius:10, border:'none', cursor:'pointer', fontFamily:'inherit',
                  fontSize:13, fontWeight:600, transition:'all .12s',
                  background: on ? 'var(--pg-blue-500)' : 'var(--pg-ink-100)',
                  color: on ? '#fff' : 'var(--pg-ink-700)',
                  boxShadow: on ? '0 4px 10px oklch(0.58 0.16 235 / 0.25)' : 'none',
                }}>{ct.label}</button>
              );
            })}
          </div>
        </HiringFormSection>

        <HiringFormSection label={payLbl}>
          <div style={{display:'flex', gap:8, marginBottom:12, flexWrap:'wrap'}}>
            {payModes.map(pm => {
              const on = payMode === pm.id;
              return (
                <button key={pm.id} onClick={()=>setPayMode(pm.id)} style={{
                  padding:'8px 16px', borderRadius:10, border:'none', cursor:'pointer', fontFamily:'inherit',
                  fontSize:13, fontWeight:600, transition:'all .12s', flex:1,
                  background: on ? 'var(--pg-blue-500)' : 'var(--pg-ink-100)',
                  color: on ? '#fff' : 'var(--pg-ink-700)',
                  boxShadow: on ? '0 4px 10px oklch(0.58 0.16 235 / 0.25)' : 'none',
                }}>{pm.label}</button>
              );
            })}
          </div>
          {payMode !== 'neg' && (
            <div style={{position:'relative'}}>
              <span style={{position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', fontSize:22, fontWeight:700, color:'var(--pg-blue-500)', fontFamily:'var(--pg-font-display)'}}>$</span>
              <input className="pg-field" type="number" inputMode="decimal" value={pay} onChange={e=>setPay(e.target.value)} placeholder="0"
                style={{height:56, paddingLeft:36, paddingRight:70, fontSize:22, fontWeight:700, color:'var(--pg-blue-500)', fontFamily:'var(--pg-font-display)'}}/>
              <span style={{position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', fontSize:13, fontWeight:600, color:'var(--pg-ink-400)'}}>
                {payModes.find(p=>p.id===payMode)?.suffix}
              </span>
            </div>
          )}
          {payMode === 'neg' && (
            <div style={{padding:'12px 14px', borderRadius:12, background:'var(--pg-blue-50)', border:'1px solid var(--pg-blue-100)', fontSize:12.5, color:'var(--pg-blue-700)', display:'flex', alignItems:'center', gap:8}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--pg-blue-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
              {lang==='pt'?'O candidato e o empregador vão combinar o valor diretamente.':lang==='es'?'El candidato y el empleador acordarán el monto directamente.':'Candidate and employer will agree on compensation directly.'}
            </div>
          )}
        </HiringFormSection>

        <HiringFormSection label={lang==='pt'?'Veículo':lang==='es'?'Vehículo':'Vehicle'}>
          <HiringRequirementCard options={carOptions} value={carReq} onChange={setCarReq}/>
        </HiringFormSection>

        <HiringFormSection label={lang==='pt'?'Equipamentos':lang==='es'?'Equipos':'Equipment'}>
          <HiringRequirementCard options={equipOptions} value={equipReq} onChange={setEquipReq}/>
        </HiringFormSection>

        <HiringFormSection label={descLbl}>
          <textarea className="pg-field" value={desc} onChange={e=>setDesc(e.target.value)}
            placeholder={descPh} rows={4}
            style={{resize:'none', lineHeight:1.55, paddingTop:12, paddingBottom:12, height:'auto'}}/>
        </HiringFormSection>

      </div>

      <div style={{padding:'20px 18px 8px', position:'sticky', bottom:0, background:'#fff', borderTop:'0.5px solid var(--pg-ink-100)'}}>
        {!isValid && (carReq === '' || equipReq === '') && (
          <div style={{fontSize:11.5, color:'var(--pg-ink-400)', textAlign:'center', marginBottom:10}}>
            {lang==='pt'?'Selecione os requisitos de veículo e equipamento':lang==='es'?'Selecciona los requisitos de vehículo y equipo':'Select vehicle and equipment requirements to continue'}
          </div>
        )}
        <button onClick={()=>onSubmit && onSubmit({ role, loc, contract, payMode, pay, carReq, equipReq, desc })}
          disabled={!isValid} className="pg-btn pg-btn-primary"
          style={{width:'100%', height:52, fontSize:16, opacity: isValid ? 1 : 0.45}}>
          {Icon.briefcase(17, '#fff')} {submitLbl}
        </button>
      </div>
    </div>
  );
}

// ── Post Tech profile sheet ───────────────────────────────────
function PostTechSheet({ onClose, lang='en', onSubmit }) {
  const t = STRINGS[lang];
  const [name, setName]         = React.useState('');
  const [specialty, setSpecialty] = React.useState('');
  const [loc, setLoc]           = React.useState('');
  const [phone, setPhone]       = React.useState('');
  const [email, setEmail]       = React.useState('');
  const [rateMode, setRateMode] = React.useState('fixed');
  const [rate, setRate]         = React.useState('90');

  const headLbl     = lang==='pt'?'Cadastrar técnico':lang==='es'?'Registrar técnico':'Register as technician';
  const nameLbl     = lang==='pt'?'Nome completo':lang==='es'?'Nombre completo':'Full name';
  const namePh      = lang==='pt'?'ex: Rafael Silva':lang==='es'?'ej: Rafael Silva':'e.g. Rafael Silva';
  const specLbl     = lang==='pt'?'Especialidade':lang==='es'?'Especialidad':'Specialty';
  const specPh      = lang==='pt'?'ex: Reparo de bombas e motores':lang==='es'?'ej: Reparación de bombas y motores':'e.g. Pump & Motor Repair';
  const locLbl      = lang==='pt'?'Cidade':lang==='es'?'Ciudad':'City';
  const phoneLbl    = lang==='pt'?'Telefone':lang==='es'?'Teléfono':'Phone number';
  const emailLbl    = lang==='pt'?'E-mail (opcional)':lang==='es'?'E-mail (opcional)':'Email (optional)';
  const rateLbl     = lang==='pt'?'Preço por visita':lang==='es'?'Precio por visita':'Rate per visit';
  const submitLbl   = lang==='pt'?'Publicar perfil':lang==='es'?'Publicar perfil':'Post profile';

  // US phone mask: (xxx) XXX-XXXX
  const formatPhone = (val) => {
    const d = val.replace(/\D/g, '').slice(0, 10);
    if (d.length === 0) return '';
    if (d.length <= 3)  return `(${d}`;
    if (d.length <= 6)  return `(${d.slice(0,3)}) ${d.slice(3)}`;
    return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  };

  const isValid = name.trim().length > 0 && specialty.trim().length > 0
               && loc.trim().length > 0 && phone.replace(/\D/g,'').length === 10;

  return (
    <div style={{padding:'8px 0 24px'}}>
      <div style={{padding:'4px 18px 14px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <button onClick={onClose} style={{border:'none', background:'transparent', color:'var(--pg-blue-500)', fontSize:15, fontWeight:600, cursor:'pointer', padding:0}}>{t.cancel}</button>
        <h2 style={{margin:0, fontFamily:'var(--pg-font-display)', fontSize:17, fontWeight:700, letterSpacing:'-0.01em'}}>{headLbl}</h2>
        <div style={{width:60}}/>
      </div>

      <div style={{padding:'0 18px', display:'flex', flexDirection:'column', gap:18}}>
        <div>
          <div style={{fontSize:11, color:'var(--pg-ink-500)', fontWeight:700, letterSpacing:'0.06em', marginBottom:8}}>{nameLbl.toUpperCase()}</div>
          <input className="pg-field" value={name} onChange={e=>setName(e.target.value)} placeholder={namePh}/>
        </div>
        <div>
          <div style={{fontSize:11, color:'var(--pg-ink-500)', fontWeight:700, letterSpacing:'0.06em', marginBottom:8}}>{specLbl.toUpperCase()}</div>
          <input className="pg-field" value={specialty} onChange={e=>setSpecialty(e.target.value)} placeholder={specPh}/>
        </div>
        <div>
          <div style={{fontSize:11, color:'var(--pg-ink-500)', fontWeight:700, letterSpacing:'0.06em', marginBottom:8}}>{locLbl.toUpperCase()}</div>
          <CityAutocomplete value={loc} onChange={setLoc} lang={lang}/>
        </div>
        {/* Contact info */}
        <div>
          <div style={{fontSize:11, color:'var(--pg-ink-500)', fontWeight:700, letterSpacing:'0.06em', marginBottom:8}}>
            {phoneLbl.toUpperCase()}
            <span style={{color:'oklch(0.55 0.22 25)', marginLeft:4, fontWeight:800}}>*</span>
          </div>
          <input className="pg-field" type="tel" inputMode="numeric" value={phone}
            onChange={e=>setPhone(formatPhone(e.target.value))}
            placeholder="(954) 555-0000"
            style={{letterSpacing:'0.04em'}}/>
          {phone.length > 0 && phone.replace(/\D/g,'').length < 10 && (
            <div style={{fontSize:11, color:'oklch(0.55 0.18 25)', marginTop:5, paddingLeft:2}}>
              {lang==='pt'?'Digite os 10 dígitos do número':lang==='es'?'Ingresa los 10 dígitos':'Enter all 10 digits'}
            </div>
          )}
        </div>
        <div>
          <div style={{fontSize:11, color:'var(--pg-ink-500)', fontWeight:700, letterSpacing:'0.06em', marginBottom:8}}>{emailLbl.toUpperCase()}</div>
          <input className="pg-field" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com"/>
        </div>
        <div>
          <div style={{fontSize:11, color:'var(--pg-ink-500)', fontWeight:700, letterSpacing:'0.06em', marginBottom:8}}>{rateLbl.toUpperCase()}</div>
          <div className="pg-seg" style={{marginBottom:10}}>
            <button className={`pg-seg-btn ${rateMode==='fixed'?'on':''}`} onClick={()=>setRateMode('fixed')}>{t.fixedPrice}</button>
            <button className={`pg-seg-btn ${rateMode==='neg'?'on':''}`} onClick={()=>setRateMode('neg')}>{t.priceNeg}</button>
          </div>
          {rateMode === 'fixed' && (
            <div style={{position:'relative'}}>
              <span style={{position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', fontSize:22, fontWeight:700, color:'var(--pg-blue-500)', fontFamily:'var(--pg-font-display)'}}>$</span>
              <input className="pg-field" value={rate} onChange={e=>setRate(e.target.value)}
                style={{height:56, paddingLeft:36, fontSize:22, fontWeight:700, color:'var(--pg-blue-500)', fontFamily:'var(--pg-font-display)'}}/>
              <span style={{position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', fontSize:13, color:'var(--pg-ink-500)'}}>
                {lang==='pt'?'/visita':lang==='es'?'/visita':'/visit'}
              </span>
            </div>
          )}
        </div>
      </div>

      <div style={{padding:'18px 18px 8px', position:'sticky', bottom:0, background:'#fff'}}>
        <button onClick={()=>onSubmit && onSubmit({ name, specialty, loc, phone, email, rateMode, rate })}
          disabled={!isValid} className="pg-btn pg-btn-primary"
          style={{width:'100%', height:52, fontSize:16, opacity: isValid ? 1 : 0.45}}>
          {Icon.shield(17, '#fff')} {submitLbl}
        </button>
      </div>
    </div>
  );
}

function MiniCal({ days, bookedDays=[], selectedDays=null, yearMonth=null, variant='blue', lang='en', style={} }) {
  // days = all vacation days, bookedDays = already assigned, selectedDays = user's selection
  // yearMonth = {year, month} (month 0-indexed) for proper weekday alignment
  const vacSet    = new Set(days);
  const bookedSet = new Set(bookedDays);
  const selSet    = selectedDays ? new Set(selectedDays) : null;
  const c   = variant==='aqua' ? 'var(--pg-aqua-500)' : 'var(--pg-blue-500)';
  const cBg = variant==='aqua' ? 'var(--pg-aqua-100)' : 'var(--pg-blue-100)';

  // Weekday headers — 2-letter, starting Sunday
  const wdHeaders = lang==='pt'
    ? ['Do','Se','Te','Qu','Qu','Se','Sá']
    : lang==='es'
      ? ['Do','Lu','Ma','Mi','Ju','Vi','Sá']
      : ['Su','Mo','Tu','We','Th','Fr','Sa'];

  // Offset: what weekday does day-1 of this month start on? (0=Sun)
  const offset = yearMonth ? new Date(yearMonth.year, yearMonth.month, 1).getDay() : 0;
  const all = Array.from({length:31}, (_,i)=>i+1);

  return (
    <div style={style}>
      {/* Weekday header row */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4, marginBottom:3}}>
        {wdHeaders.map((h,i) => (
          <div key={i} style={{
            fontSize:8.5, fontWeight:700, textAlign:'center',
            color:'var(--pg-ink-400)', letterSpacing:'0.03em', padding:'1px 0',
          }}>{h}</div>
        ))}
      </div>
      {/* Day grid */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4}}>
        {/* Offset empty cells */}
        {Array.from({length:offset}).map((_,i) => <div key={`off-${i}`}/>)}
        {all.map(d => {
          const inVac  = vacSet.has(d);
          const booked = bookedSet.has(d);
          const sel    = selSet ? selSet.has(d) : inVac;
          let bg, color, td='none', border='none';
          if (!inVac) { bg='var(--pg-blue-50)'; color='var(--pg-ink-200)'; }
          else if (booked) { bg='var(--pg-ink-100)'; color='var(--pg-ink-300)'; td='line-through'; }
          else if (sel)    { bg=c; color='#fff'; }
          else             { bg=cBg; color='var(--pg-blue-600)'; border='1px dashed var(--pg-blue-200)'; }
          return (
            <div key={d} style={{
              aspectRatio:'1', borderRadius:6, fontSize:10, fontWeight:600,
              display:'flex', alignItems:'center', justifyContent:'center',
              background:bg, color, textDecoration:td, border,
            }}>{d}</div>
          );
        })}
      </div>
    </div>
  );
}

// ── Compact day chips (for ApplicantsSheet + Applied cards) ────
function DayChips({ days, bookedDays=[], selectedDays=null, size=26, yearMonth=null, lang='en' }) {
  const bookedSet = new Set(bookedDays);
  const selSet    = selectedDays ? new Set(selectedDays) : null;

  const wdShort = lang==='pt'
    ? ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
    : lang==='es'
      ? ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
      : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  return (
    <div style={{display:'flex', flexWrap:'wrap', gap:4}}>
      {days.map(d => {
        const booked = bookedSet.has(d);
        const sel    = selSet ? selSet.has(d) : !booked;
        const wd     = yearMonth ? new Date(yearMonth.year, yearMonth.month, d).getDay() : null;
        return (
          <span key={d} style={{
            minWidth: wd !== null ? 30 : size,
            height:   wd !== null ? 38 : size,
            padding:  wd !== null ? '3px 5px' : 0,
            borderRadius:7, fontWeight:700,
            display:'inline-flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center', gap:0,
            background: booked ? 'var(--pg-ink-100)' : sel ? 'var(--pg-blue-500)' : 'var(--pg-blue-100)',
            color:      booked ? 'var(--pg-ink-300)' : sel ? '#fff'               : 'var(--pg-blue-600)',
            textDecoration: booked ? 'line-through' : 'none',
          }}>
            {wd !== null && (
              <span style={{fontSize:8, fontWeight:700, letterSpacing:'0.04em',
                opacity: booked ? 0.5 : 0.75, lineHeight:1.2}}>
                {wdShort[wd].toUpperCase()}
              </span>
            )}
            <span style={{fontSize: wd !== null ? 12 : 10.5, lineHeight:1.15}}>{d}</span>
          </span>
        );
      })}
    </div>
  );
}

// ── Vacation Day Picker Sheet ──────────────────────────────────
function VacationDayPickerSheet({ vac, lang='en', onClose, onSubmit, confirmedDays=[] }) {
  const [selected, setSelected] = React.useState(new Set());
  const [submitted, setSubmitted] = React.useState(false);
  const [conflictPending, setConflictPending] = React.useState(null); // {d, owner}

  // Build a map of confirmed date-keys → owner name
  const confirmedMap = React.useMemo(() => {
    const m = {};
    confirmedDays.forEach(c => { m[c.key] = c.owner; });
    return m;
  }, [confirmedDays]);

  React.useEffect(() => {
    if (vac) { setSelected(new Set()); setSubmitted(false); setConflictPending(null); }
  }, [vac]);

  if (!vac) return null;

  const bookedSet   = new Set(vac.bookedDays || []);
  const availDays   = vac.days.filter(d => !bookedSet.has(d));
  const selArr      = Array.from(selected);

  // Weekday short names per lang (Sun=0)
  const wdShort = lang==='pt'
    ? ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
    : lang==='es'
      ? ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
      : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  const getDayWd = (d) => vac.yearMonth
    ? new Date(vac.yearMonth.year, vac.yearMonth.month, d).getDay()
    : null;
  const getDayName = (d) => { const wd = getDayWd(d); return wd !== null ? wdShort[wd] : null; };
  const getPoolsForDay = (d) => {
    const wd = getDayWd(d);
    if (wd !== null && vac.poolsByWeekday && vac.poolsByWeekday[wd] !== undefined) return vac.poolsByWeekday[wd];
    return vac.poolsPerDay;
  };

  // Earnings: sum per-day pools × price
  const earnings = selArr.reduce((sum, d) => sum + getPoolsForDay(d) * vac.pricePerPool, 0);
  const allSelected = availDays.every(d => selected.has(d));

  const commitToggle = (d) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(d) ? next.delete(d) : next.add(d);
      return next;
    });
  };

  const toggle = (d) => {
    if (bookedSet.has(d)) return;
    // Check conflict
    if (!selected.has(d) && vac.yearMonth) {
      const key = `${vac.yearMonth.year}-${vac.yearMonth.month}-${d}`;
      if (confirmedMap[key]) {
        setConflictPending({ d, owner: confirmedMap[key] });
        return;
      }
    }
    commitToggle(d);
  };

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(availDays));
  };

  const selectAllLabel = lang==='pt' ? 'Todos os dias' : lang==='es' ? 'Todos los días' : 'All days';
  const bookedLabel    = lang==='pt' ? 'Já reservado' : lang==='es' ? 'Ya reservado' : 'Booked';
  const availLabel     = lang==='pt' ? 'Disponível' : lang==='es' ? 'Disponible' : 'Available';
  const selLabel       = lang==='pt' ? 'Selecionado' : lang==='es' ? 'Seleccionado' : 'Selected';
  const conflictLabel  = lang==='pt' ? 'Dia já confirmado' : lang==='es' ? 'Día ya confirmado' : 'Day already confirmed';
  const applyLabel     = lang==='pt' ? `Aplicar para ${selArr.length} dia${selArr.length!==1?'s':''}` :
                         lang==='es' ? `Aplicar a ${selArr.length} día${selArr.length!==1?'s':''}` :
                                       `Apply for ${selArr.length} day${selArr.length!==1?'s':''}`;
  const estLabel       = lang==='pt' ? 'Est.' : 'Est.';

  return (
    <div style={{padding:'0 18px 32px', display:'flex', flexDirection:'column', height:'100%'}}>
      {/* Header */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', paddingBottom:12, borderBottom:'0.5px solid var(--pg-ink-200)'}}>
        <div>
          <h2 style={{margin:0, fontSize:18, fontWeight:700, letterSpacing:'-0.01em'}}>
            {lang==='pt'?'Escolher dias':lang==='es'?'Elegir días':'Pick your days'}
          </h2>
          <div style={{fontSize:12, color:'var(--pg-ink-500)', marginTop:2}}>
            {vac.owner} · {tr(vac.month, lang)} · {vac.region}
          </div>
        </div>
        <button onClick={onClose} style={{border:'none', background:'var(--pg-ink-100)', width:30, height:30, borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
          {Icon.x(16,'var(--pg-ink-700)')}
        </button>
      </div>

      {/* Legend */}
      <div style={{display:'flex', gap:14, marginTop:14, marginBottom:12}}>
        {[
          { bg:'var(--pg-blue-500)', color:'#fff',             label:selLabel },
          { bg:'var(--pg-blue-100)', color:'var(--pg-blue-600)', label:availLabel, border:'1px dashed var(--pg-blue-300)' },
          { bg:'var(--pg-ink-100)',  color:'var(--pg-ink-300)', label:bookedLabel, td:'line-through' },
        ].map((l,i) => (
          <div key={i} style={{display:'flex', alignItems:'center', gap:5}}>
            <span style={{width:18, height:18, borderRadius:4, background:l.bg, display:'inline-block', border:l.border||'none', flexShrink:0}}/>
            <span style={{fontSize:11, color:'var(--pg-ink-500)', textDecoration:l.td||'none'}}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Day grid — large tappable chips */}
      <div style={{display:'flex', flexWrap:'wrap', gap:8, marginBottom:16}}>
        {vac.days.map(d => {
          const booked   = bookedSet.has(d);
          const sel      = selected.has(d);
          const poolsCnt = getPoolsForDay(d);
          const wd       = getDayWd(d);
          const isConflict = !booked && !sel && vac.yearMonth &&
            !!confirmedMap[`${vac.yearMonth.year}-${vac.yearMonth.month}-${d}`];
          return (
            <button key={d} onClick={()=>toggle(d)} style={{
              width:56, height:68, borderRadius:12, border: isConflict ? '2px solid var(--pg-warn)' : 'none',
              cursor: booked ? 'default' : 'pointer',
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:1,
              fontFamily:'inherit', transition:'all .12s ease',
              background: booked    ? 'var(--pg-ink-100)'
                        : isConflict? 'oklch(0.97 0.05 60)'
                        : sel       ? 'var(--pg-blue-500)'
                        :             'var(--pg-blue-100)',
              color:      booked    ? 'var(--pg-ink-300)'
                        : isConflict? 'oklch(0.48 0.14 60)'
                        : sel       ? '#fff'
                        :             'var(--pg-blue-600)',
              boxShadow:  sel && !booked ? '0 4px 12px oklch(0.58 0.16 235 / 0.35)' : 'none',
              transform:  sel && !booked ? 'scale(1.06)' : 'scale(1)',
            }}>
              {getDayName(d) && (
                <span style={{fontSize:8.5, fontWeight:700, letterSpacing:'0.03em', opacity: booked ? 0.5 : 0.85}}>
                  {getDayName(d).toUpperCase()}
                </span>
              )}
              <span style={{fontSize:17, fontWeight:700, textDecoration: booked ? 'line-through' : 'none', lineHeight:1}}>{d}</span>
              {booked
                ? <span style={{fontSize:7.5, fontWeight:700, letterSpacing:'0.04em', marginTop:1}}>{lang==='pt'?'RESERV.':lang==='es'?'RESERV.':'BOOKED'}</span>
                : isConflict
                  ? <span style={{fontSize:7, fontWeight:700, letterSpacing:'0.02em', marginTop:1}}>⚠️</span>
                  : <span style={{fontSize:8, color: sel ? 'rgba(255,255,255,0.75)' : 'var(--pg-blue-500)', marginTop:1}}>
                      {poolsCnt}🏊
                    </span>
              }
            </button>
          );
        })}
      </div>

      {/* Select all toggle */}
      <button onClick={toggleAll} style={{
        border:'none', background:'transparent', cursor:'pointer', padding:'0 0 14px',
        fontSize:13, fontWeight:600, color:'var(--pg-blue-600)', textAlign:'left', fontFamily:'inherit',
        display:'flex', alignItems:'center', gap:6,
      }}>
        <span style={{
          width:18, height:18, borderRadius:4, border:'1.5px solid var(--pg-blue-400)',
          background: allSelected ? 'var(--pg-blue-500)' : 'transparent',
          display:'inline-flex', alignItems:'center', justifyContent:'center', flexShrink:0,
        }}>
          {allSelected && <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>}
        </span>
        {selectAllLabel}
        <span style={{color:'var(--pg-ink-400)', fontWeight:400}}>({availDays.length} {lang==='pt'?'dias':lang==='es'?'días':'days'})</span>
      </button>

      {/* Per-day/weekday detail */}
      <div className="pg-card" style={{padding:'10px 14px', marginBottom:12, background:'var(--pg-blue-50)'}}>
        {vac.poolsByWeekday ? (
          <div style={{display:'flex', flexDirection:'column', gap:5}}>
            <div style={{fontSize:11, fontWeight:700, color:'var(--pg-blue-700)', marginBottom:2}}>
              {lang==='pt'?'Piscinas por dia':lang==='es'?'Piscinas por día':'Pools per day'}
            </div>
            {availDays.map(d => {
              const wd   = getDayWd(d);
              const cnt  = getPoolsForDay(d);
              const isSel = selected.has(d);
              return (
                <div key={d} style={{
                  display:'flex', justifyContent:'space-between', alignItems:'center',
                  fontSize:12, padding:'5px 8px', borderRadius:8, marginLeft:-8, marginRight:-8,
                  transition:'all .15s ease',
                  background: isSel ? 'var(--pg-blue-500)' : 'transparent',
                  color:      isSel ? '#fff' : 'var(--pg-ink-600)',
                }}>
                  <span style={{fontWeight: isSel ? 700 : 400}}>
                    {wd !== null ? wdShort[wd] : d} — {cnt} 🏊 × ${vac.pricePerPool}/pool
                  </span>
                  <span style={{fontWeight:700}}>
                    ${(cnt * vac.pricePerPool).toLocaleString()}/day
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--pg-ink-600)'}}>
            <span>{vac.poolsPerDay} {lang==='pt'?'piscinas/dia':lang==='es'?'piscinas/día':'pools/day'} × ${vac.pricePerPool}/pool</span>
            <span style={{fontWeight:700}}>${(vac.poolsPerDay * vac.pricePerPool).toLocaleString()}/{lang==='pt'?'dia':lang==='es'?'día':'day'}</span>
          </div>
        )}
      </div>

      {/* Conflict legend hint */}
      {Object.keys(confirmedMap).length > 0 && (
        <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:10, fontSize:11.5,
          color:'oklch(0.48 0.14 60)', fontWeight:600}}>
          <span style={{width:16, height:16, borderRadius:4, background:'oklch(0.97 0.05 60)',
            border:'2px solid var(--pg-warn)', display:'inline-block', flexShrink:0}}/>
          {conflictLabel} — {lang==='pt'?'você já tem cobertura neste dia com outra pessoa'
            :lang==='es'?'ya tienes cobertura este día con otra persona'
            :'you already have coverage on this day with someone else'}
        </div>
      )}

      {/* Conflict warning dialog */}
      {conflictPending && (
        <div style={{
          padding:'14px', borderRadius:12, marginBottom:12,
          background:'oklch(0.97 0.05 60)', border:'1.5px solid var(--pg-warn)',
        }}>
          <div style={{fontSize:13, fontWeight:700, color:'oklch(0.38 0.14 60)', marginBottom:6}}>
            ⚠️ {lang==='pt'?'Dia já confirmado!':lang==='es'?'¡Día ya confirmado!':'Day already confirmed!'}
          </div>
          <div style={{fontSize:12, color:'oklch(0.45 0.14 60)', lineHeight:1.45, marginBottom:12}}>
            {lang==='pt'
              ? `Você já tem os dias ${conflictPending.d} confirmados com ${conflictPending.owner}. Deseja mesmo continuar?`
              : lang==='es'
                ? `Ya tienes el día ${conflictPending.d} confirmado con ${conflictPending.owner}. ¿Quieres continuar?`
                : `You already have day ${conflictPending.d} confirmed with ${conflictPending.owner}. Do you still want to apply?`}
          </div>
          <div style={{display:'flex', gap:8}}>
            <button onClick={()=>setConflictPending(null)} className="pg-btn pg-btn-outline"
              style={{flex:1, height:36, fontSize:13, borderRadius:999}}>
              {lang==='pt'?'Cancelar':lang==='es'?'Cancelar':'Cancel'}
            </button>
            <button onClick={()=>{ commitToggle(conflictPending.d); setConflictPending(null); }}
              style={{flex:1, height:36, fontSize:13, fontWeight:700, borderRadius:999,
                background:'var(--pg-warn)', color:'#fff', border:'none', cursor:'pointer', fontFamily:'inherit'}}>
              {lang==='pt'?'Continuar mesmo assim':lang==='es'?'Continuar de todos modos':'Continue anyway'}
            </button>
          </div>
        </div>
      )}

      {/* Sticky CTA */}
      <div style={{marginTop:'auto'}}>
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'10px 14px', borderRadius:12, marginBottom:12,
          background: selArr.length > 0 ? 'var(--pg-blue-50)' : 'var(--pg-ink-50)',
        }}>
          <div>
            <div style={{fontSize:11, color:'var(--pg-ink-500)'}}>
              {selArr.length > 0
                ? `${selArr.length} ${lang==='pt'?'dia(s) selecionado(s)':lang==='es'?'día(s) elegido(s)':'day(s) selected'}`
                : lang==='pt'?'Nenhum dia selecionado':lang==='es'?'Ningún día seleccionado':'No days selected'}
            </div>
            {selArr.length > 0 && (
              <div style={{fontFamily:'var(--pg-font-display)', fontSize:20, fontWeight:700, color:'var(--pg-blue-500)', letterSpacing:'-0.02em'}}>
                {estLabel} ${earnings.toLocaleString()}
              </div>
            )}
          </div>
          {selArr.length > 0 && (
            <div style={{fontSize:11, color:'var(--pg-ink-400)', textAlign:'right'}}>
              <div>{selArr.sort((a,b)=>a-b).join(', ')}</div>
            </div>
          )}
        </div>
        <button
          disabled={selArr.length === 0}
          onClick={()=>{ setSubmitted(true); setTimeout(onSubmit, 1600); }}
          className="pg-btn pg-btn-primary"
          style={{width:'100%', height:50, fontSize:15, fontWeight:700, borderRadius:14,
            opacity: selArr.length === 0 ? 0.4 : 1}}>
          {submitted
            ? (lang==='pt'?'Aplicação enviada ✓':lang==='es'?'Aplicación enviada ✓':'Application sent ✓')
            : selArr.length > 0 ? applyLabel : (lang==='pt'?'Selecione pelo menos 1 dia':lang==='es'?'Selecciona al menos 1 día':'Select at least 1 day')}
        </button>
      </div>
    </div>
  );
}

// ── My Jobs Panel ─────────────────────────────────────────────
function MyJobsPanel({ t, lang, openJobDetail }) {
  const [filter, setFilter] = React.useState('active');

  const statusConfig = {
    accepted:    { label: lang==='pt'?'Contratado':lang==='es'?'Contratado':'Hired',            bg:'var(--pg-blue-100)',    color:'var(--pg-blue-700)' },
    in_progress: { label: lang==='pt'?'Em Andamento':lang==='es'?'En Progreso':'In Progress',   bg:'oklch(0.94 0.06 80)',   color:'oklch(0.48 0.18 80)' },
    completed:   { label: lang==='pt'?'Concluído':lang==='es'?'Completado':'Completed',         bg:'var(--pg-aqua-100)',    color:'var(--pg-aqua-700)' },
    paid:        { label: lang==='pt'?'Pago':lang==='es'?'Pagado':'Paid',                       bg:'oklch(0.93 0.06 160)',  color:'oklch(0.40 0.16 160)' },
    pending:     { label: lang==='pt'?'Aguardando':lang==='es'?'Esperando':'Pending',           bg:'var(--pg-ink-100)',     color:'var(--pg-ink-600)' },
    rejected:    { label: lang==='pt'?'Rejeitado':lang==='es'?'Rechazado':'Rejected',           bg:'oklch(0.95 0.04 20)',   color:'oklch(0.45 0.18 20)' },
  };

  const isActive = (s) => ['accepted', 'in_progress'].includes(s);

  const filterTabs = [
    { id:'active', label: lang==='pt'?'Ativos':lang==='es'?'Activos':'Active',
      count: MY_APPLICATIONS.filter(a => isActive(a.status)).length },
    { id:'all',    label: lang==='pt'?'Todos':lang==='es'?'Todos':'All',
      count: MY_APPLICATIONS.length },
  ];

  const shown = filter==='active'
    ? MY_APPLICATIONS.filter(a => isActive(a.status))
    : MY_APPLICATIONS;

  const typeIcons = {
    quickpool: (s,c) => Icon.bolt(s,c),
    vacation:  (s,c) => Icon.cal(s,c),
    hiring:    (s,c) => Icon.briefcase(s,c),
  };

  const emptyMsg = filter==='active'
    ? (lang==='pt'?'Nenhuma candidatura ativa no momento':lang==='es'?'Sin postulaciones activas':'No active applications right now')
    : (lang==='pt'?'Nenhuma candidatura ainda':lang==='es'?'Sin postulaciones aún':'No applications yet');

  const tapHintLbl = lang==='pt' ? 'Toque para ver detalhes' : lang==='es' ? 'Toca para ver detalles' : 'Tap to view details';

  return (
    <div style={{display:'flex', flexDirection:'column', gap:12}}>
      {/* Info banner for active jobs */}
      {MY_APPLICATIONS.filter(a=>isActive(a.status)).length > 0 && (
        <div style={{
          padding:'11px 14px', borderRadius:12,
          background:'linear-gradient(110deg, var(--pg-blue-50), var(--pg-aqua-50))',
          border:'0.5px solid var(--pg-blue-200)',
          display:'flex', alignItems:'center', gap:10,
        }}>
          {Icon.bolt(14,'var(--pg-blue-600)')}
          <div style={{fontSize:12.5, color:'var(--pg-blue-700)', fontWeight:600}}>
            {MY_APPLICATIONS.filter(a=>isActive(a.status)).length} {lang==='pt'?'trabalhos ativos — toque para gerenciar':lang==='es'?'trabajos activos — toca para gestionar':'active jobs — tap to manage'}
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{display:'flex', gap:7}}>
        {filterTabs.map(f => (
          <button key={f.id} onClick={()=>setFilter(f.id)} style={{
            padding:'7px 15px', borderRadius:999, border:'none', cursor:'pointer', fontFamily:'inherit',
            fontSize:13, fontWeight:600, transition:'all .12s',
            background: filter===f.id ? 'var(--pg-blue-500)' : 'var(--pg-ink-100)',
            color: filter===f.id ? '#fff' : 'var(--pg-ink-700)',
          }}>
            {f.label}
            <span style={{marginLeft:5, fontSize:11, fontWeight:700, opacity:0.85}}>{f.count}</span>
          </button>
        ))}
      </div>

      {shown.length === 0 && (
        <div style={{textAlign:'center', padding:'40px 20px', color:'var(--pg-ink-400)', fontSize:14}}>{emptyMsg}</div>
      )}

      {shown.map(app => {
        const sc = statusConfig[app.status] || statusConfig.pending;
        const ic = typeIcons[app.type] || typeIcons.quickpool;
        const canTap = isActive(app.status) && !!openJobDetail;
        return (
          <article key={app.id}
            className={`pg-card${canTap?' pg-card-tap':''}`}
            style={{padding:'13px 14px', cursor: canTap?'pointer':'default'}}
            onClick={canTap ? ()=>openJobDetail(app) : undefined}>
            <div style={{display:'flex', alignItems:'flex-start', gap:11}}>
              <div style={{
                width:42, height:42, borderRadius:11, flexShrink:0,
                background: app.type==='quickpool' ? 'var(--pg-aqua-100)' : 'var(--pg-blue-100)',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                {ic(18, app.type==='quickpool' ? 'var(--pg-aqua-700)' : 'var(--pg-blue-700)')}
              </div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', marginBottom:4}}>
                  <span style={{fontSize:9.5, padding:'2px 8px', borderRadius:6, fontWeight:700, background:sc.bg, color:sc.color, letterSpacing:'0.02em'}}>{sc.label}</span>
                </div>
                <div style={{fontSize:13.5, fontWeight:600, letterSpacing:'-0.01em', lineHeight:1.3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                  {tr(app.title, lang)}
                </div>
                <div style={{fontSize:12, color:'var(--pg-ink-500)', marginTop:4, display:'flex', alignItems:'center', gap:5, flexWrap:'wrap'}}>
                  <span style={{fontWeight:600, color:'var(--pg-ink-700)'}}>{app.poster}</span>
                  <span style={{color:'var(--pg-ink-300)'}}>·</span>
                  {Icon.pin(11,'var(--pg-ink-400)')} {app.loc}
                </div>
              </div>
              <div style={{textAlign:'right', flexShrink:0}}>
                {app.price ? (
                  <div style={{fontFamily:'var(--pg-font-display)', fontSize:17, fontWeight:700, color:'var(--pg-blue-500)', letterSpacing:'-0.02em'}}>${app.price}</div>
                ) : (
                  <div style={{fontSize:11, color:'var(--pg-ink-400)'}}>—</div>
                )}
                <div style={{fontSize:10.5, color:'var(--pg-ink-400)', marginTop:2}}>
                  {app.when} {lang==='en'?'ago':'atrás'||'atrás'}
                </div>
                {canTap && (
                  <div style={{marginTop:5, display:'flex', justifyContent:'flex-end'}}>
                    {Icon.chev(14,'var(--pg-blue-500)')}
                  </div>
                )}
              </div>
            </div>
            {canTap && (
              <div style={{marginTop:10, paddingTop:10, borderTop:'0.5px solid var(--pg-ink-100)', fontSize:11.5, color:'var(--pg-blue-600)', fontWeight:600, display:'flex', alignItems:'center', gap:5}}>
                {Icon.bolt(12,'var(--pg-blue-500)')} {tapHintLbl}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

// ── Coverage Schedule Sheet ───────────────────────────────────
function ScheduleSheet({ app, lang='en', onClose }) {
  const [activeDayIdx, setActiveDayIdx] = React.useState(0);
  const [dayStatus, setDayStatus]       = React.useState({});
  const [noPhotoHint, setNoPhotoHint]   = React.useState(null); // pool index showing hint

  React.useEffect(() => {
    if (app) { setActiveDayIdx(0); setDayStatus({}); setNoPhotoHint(null); }
  }, [app]);

  // ── All hooks must be called before any early return ──────────
  const wdFull = lang==='pt'
    ? ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado']
    : lang==='es'
      ? ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
      : ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const wdShort = lang==='pt'
    ? ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
    : lang==='es'
      ? ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
      : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const monthNames = lang==='pt'
    ? ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']
    : lang==='es'
      ? ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
      : ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const photoLabels = lang==='pt' ? ['Fachada','Antes','Depois']
    : lang==='es' ? ['Fachada','Antes','Después'] : ['Facade','Before','After'];

  const days = React.useMemo(() => {
    if (!app) return [];
    return (app.selectedDays || app.days || []).sort((a,b)=>a-b).map(d => {
      const wd = app.yearMonth ? new Date(app.yearMonth.year, app.yearMonth.month, d).getDay() : 0;
      const pools = app.poolsByWeekday?.[wd] ?? app.poolsPerDay ?? 0;
      const addrs = (app.addresses?.[wd] || []).slice(0, pools);
      return { d, wd, pools, addrs, earnings: pools * (app.pricePerPool || 0) };
    });
  }, [app]);

  const totalPools    = days.reduce((s,d) => s + d.pools, 0);
  const totalEarnings = days.reduce((s,d) => s + d.earnings, 0);
  const activeDay     = days[activeDayIdx] || null;

  const getDoneCnt = (day) => day ? Object.values(dayStatus[day.wd]||{}).filter(p=>p.done).length : 0;
  const completedPools = days.reduce((s,d) => s + getDoneCnt(d), 0);
  const progress = totalPools > 0 ? completedPools / totalPools : 0;

  const activeDoneCnt = getDoneCnt(activeDay);
  const activeAllDone = activeDay && activeDoneCnt === activeDay.pools && activeDay.pools > 0;

  // Set of pool indices done on the active day (for map markers)
  const activeDoneIndices = React.useMemo(() => {
    if (!activeDay) return new Set();
    return new Set(
      Object.entries(dayStatus[activeDay.wd] || {})
        .filter(([, p]) => p.done)
        .map(([i]) => +i)
    );
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
      const d = prev[wd]||{}; const p = d[idx]||{};
      return {...prev, [wd]: {...d, [idx]: {...p, done:!p.done}}};
    });
  };

  const togglePhoto = (wd, pi, phi) => setDayStatus(prev => {
    const d = prev[wd]||{}; const p = d[pi]||{};
    const photos = [...(p.photos||[null,null,null])];
    photos[phi] = photos[phi] ? null : 'ok';
    return {...prev, [wd]: {...d, [pi]: {...p, photos}}};
  });

  const markAllDone = () => {
    if (!activeDay) return;
    const next = {...(dayStatus[activeDay.wd]||{})};
    activeDay.addrs.forEach((_, i) => {
      const photos = dayStatus[activeDay.wd]?.[i]?.photos || [null,null,null];
      const photoCnt = photos.filter(Boolean).length;
      if (photoCnt >= 3) next[i] = {...(next[i]||{}), done:true};
    });
    setDayStatus(p => ({...p, [activeDay.wd]: next}));
  };

  return (
    <div style={{paddingBottom:48}}>
      {/* Header */}
      <div style={{padding:'12px 18px 14px', display:'flex', alignItems:'center',
        justifyContent:'space-between', borderBottom:'0.5px solid var(--pg-ink-100)'}}>
        <button onClick={onClose} style={{border:'none', background:'transparent',
          color:'var(--pg-blue-500)', fontSize:15, fontWeight:600, cursor:'pointer',
          padding:0, fontFamily:'inherit'}}>
          {lang==='pt'?'Fechar':lang==='es'?'Cerrar':'Close'}
        </button>
        <h2 style={{margin:0, fontFamily:'var(--pg-font-display)', fontSize:17, fontWeight:700,
          letterSpacing:'-0.01em'}}>
          {lang==='pt'?'Agenda de cobertura':lang==='es'?'Agenda de cobertura':'Coverage schedule'}
        </h2>
        <div style={{width:50}}/>
      </div>

      {/* Summary banner */}
      <div style={{padding:'14px 18px 12px'}}>
        <div style={{borderRadius:14, padding:'14px 16px',
          background:'linear-gradient(120deg, oklch(0.26 0.10 232) 0%, oklch(0.33 0.13 215) 100%)',
          color:'#fff', position:'relative', overflow:'hidden'}}>
          <div style={{position:'absolute', right:-20, top:-20, width:80, height:80,
            borderRadius:'50%', background:'oklch(0.85 0.15 90 / 0.10)', pointerEvents:'none'}}/>
          <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:10}}>
            <Avatar name={app.owner} size={36}/>
            <div style={{flex:1}}>
              <div style={{fontSize:14, fontWeight:700}}>{app.owner}</div>
              <div style={{fontSize:11.5, opacity:0.70}}>{app.region} · {tr(app.month, lang)}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontFamily:'var(--pg-font-display)', fontSize:22, fontWeight:800,
                letterSpacing:'-0.02em', color:'oklch(0.88 0.16 90)', lineHeight:1}}>
                ${totalEarnings.toLocaleString()}
              </div>
              <div style={{fontSize:10.5, opacity:0.65, marginTop:1}}>
                {totalPools} {lang==='pt'?'piscinas':lang==='es'?'piscinas':'pools'}
              </div>
            </div>
          </div>
          {/* Progress bar */}
          <div style={{fontSize:10.5, opacity:0.75, marginBottom:5, display:'flex', justifyContent:'space-between'}}>
            <span>{lang==='pt'?'Progresso':lang==='es'?'Progreso':'Progress'}</span>
            <span>{completedPools}/{totalPools} {lang==='pt'?'feitas':lang==='es'?'hechas':'done'}</span>
          </div>
          <div style={{height:7, borderRadius:999, background:'rgba(255,255,255,0.20)'}}>
            <div style={{height:'100%', borderRadius:999, background:'oklch(0.88 0.16 90)',
              width:`${Math.round(progress*100)}%`, transition:'width .4s ease'}}/>
          </div>
        </div>
      </div>

      {/* Day selector */}
      <div className="pg-scroll-x" style={{display:'flex', gap:8, padding:'2px 18px 14px'}}>
        {days.map((day, i) => {
          const done  = getDoneCnt(day);
          const full  = done === day.pools && day.pools > 0;
          const on    = activeDayIdx === i;
          return (
            <button key={i} onClick={()=>setActiveDayIdx(i)} style={{
              flexShrink:0, minWidth:62, padding:'8px 10px', borderRadius:12,
              border: on ? 'none' : '0.5px solid var(--pg-ink-200)',
              background: on ? 'var(--pg-blue-500)' : full ? 'var(--pg-aqua-100)' : 'var(--pg-ink-100)',
              color:  on ? '#fff' : full ? 'var(--pg-aqua-700)' : 'var(--pg-ink-700)',
              cursor:'pointer', fontFamily:'inherit', transition:'all .12s ease',
              boxShadow: on ? '0 4px 12px oklch(0.58 0.16 235 / 0.30)' : 'none',
            }}>
              <div style={{fontSize:9, fontWeight:700, letterSpacing:'0.05em', opacity:.75, marginBottom:2}}>
                {wdShort[day.wd].toUpperCase()}
              </div>
              <div style={{fontSize:20, fontWeight:800, fontFamily:'var(--pg-font-display)', lineHeight:1, marginBottom:2}}>
                {day.d}
              </div>
              <div style={{fontSize:9.5, fontWeight:600}}>
                {full ? '✓' : `${done}/${day.pools}🏊`}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active day */}
      {activeDay && (
        <div style={{padding:'0 18px'}}>
          {/* Day title */}
          <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:8}}>
            <div>
              <span style={{fontFamily:'var(--pg-font-display)', fontSize:17, fontWeight:700, letterSpacing:'-0.01em'}}>
                {wdFull[activeDay.wd]}
              </span>
              {app.yearMonth && (
                <span style={{fontSize:13, color:'var(--pg-ink-500)', marginLeft:6}}>
                  {lang==='pt' ? `${activeDay.d} de ${monthNames[app.yearMonth.month]}`
                   : lang==='es' ? `${activeDay.d} de ${monthNames[app.yearMonth.month]}`
                   : `${monthNames[app.yearMonth.month]} ${activeDay.d}`}
                </span>
              )}
            </div>
            <div style={{fontFamily:'var(--pg-font-display)', fontSize:16, fontWeight:700,
              color:'var(--pg-blue-500)', letterSpacing:'-0.01em'}}>
              ${activeDay.earnings.toLocaleString()}
            </div>
          </div>
          <div style={{fontSize:12, color:'var(--pg-ink-500)', marginBottom:12}}>
            {activeDay.pools} {lang==='pt'?'piscinas':lang==='es'?'piscinas':'pools'} ·
            ${app.pricePerPool}/{lang==='pt'?'piscina':lang==='es'?'piscina':'pool'}
            {activeDoneCnt > 0 && (
              <span style={{marginLeft:6, color:'var(--pg-aqua-700)', fontWeight:600}}>
                · {activeDoneCnt}/{activeDay.pools} {lang==='pt'?'feitas':lang==='es'?'hechas':'done'}
              </span>
            )}
          </div>

          {/* Map */}
          {activeDay.addrs.length > 0 && (
            <div style={{borderRadius:12, overflow:'hidden', marginBottom:14,
              border:'0.5px solid var(--pg-ink-200)'}}>
              <PoolRouteMap pools={activeDay.addrs} doneIndices={activeDoneIndices}/>
            </div>
          )}

          {/* Pool cards */}
          <div style={{display:'flex', flexDirection:'column', gap:10, marginBottom:14}}>
            {activeDay.addrs.length > 0 ? activeDay.addrs.map((pool, i) => {
              const pSt   = dayStatus[activeDay.wd]?.[i] || {};
              const done  = !!pSt.done;
              const photos = pSt.photos || [null, null, null];
              const photoCnt = photos.filter(Boolean).length;
              return (
                <div key={i} className="pg-card" style={{padding:'12px 14px',
                  borderLeft:`3px solid ${done ? 'var(--pg-aqua-500)' : 'var(--pg-ink-200)'}`,
                  opacity: done ? 0.8 : 1, transition:'all .2s ease'}}>
                  {/* Address row */}
                  <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:10}}>
                    <div style={{
                      width:28, height:28, borderRadius:8, flexShrink:0,
                      background: done ? 'var(--pg-aqua-500)' : 'var(--pg-blue-500)',
                      color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:12, fontWeight:700, transition:'background .2s ease',
                    }}>{done ? '✓' : i+1}</div>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontSize:12.5, fontWeight:600,
                        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                        textDecoration: done ? 'line-through' : 'none',
                        color: done ? 'var(--pg-ink-400)' : 'var(--pg-ink-900)'}}>
                        {pool.addr}
                      </div>
                      <div style={{fontSize:10.5, color:'var(--pg-ink-400)', marginTop:1}}>
                        📸 {photoCnt}/3 {lang==='pt'?'fotos':lang==='es'?'fotos':'photos'}
                      </div>
                    </div>
                    <button onClick={()=>toggleDone(activeDay.wd, i, photoCnt)} style={{
                      width:32, height:32, borderRadius:8, flexShrink:0,
                      border: done ? 'none' : (!done && photoCnt < 3) ? '1.5px solid var(--pg-ink-150)' : '1.5px solid var(--pg-ink-200)',
                      background: done ? 'var(--pg-aqua-500)' : (!done && photoCnt < 3) ? 'var(--pg-ink-100)' : '#fff',
                      color: done ? '#fff' : (!done && photoCnt < 3) ? 'var(--pg-ink-300)' : 'var(--pg-ink-400)',
                      cursor: (!done && photoCnt < 3) ? 'not-allowed' : 'pointer',
                      display:'flex', alignItems:'center',
                      justifyContent:'center', fontSize:14, transition:'all .15s ease',
                    }}>
                      {done ? '✓' : '○'}
                    </button>
                  </div>
                  {/* 3 photo slots */}
                  <div style={{display:'flex', gap:6}}>
                    {photoLabels.map((lbl, pi) => {
                      const has = !!photos[pi];
                      return (
                        <button key={pi} onClick={()=>togglePhoto(activeDay.wd, i, pi)} style={{
                          flex:1, height:58, borderRadius:10,
                          border: has ? 'none' : '1.5px dashed var(--pg-ink-200)',
                          background: has
                            ? 'linear-gradient(135deg, oklch(0.68 0.14 155 / 0.15), oklch(0.68 0.14 155 / 0.05))'
                            : 'var(--pg-ink-50)',
                          cursor:'pointer', display:'flex', flexDirection:'column',
                          alignItems:'center', justifyContent:'center', gap:3,
                          fontFamily:'inherit', transition:'all .15s ease',
                        }}>
                          <span style={{fontSize:18}}>{has ? '✅' : '📷'}</span>
                          <span style={{fontSize:9, fontWeight:700, letterSpacing:'0.03em',
                            color: has ? 'var(--pg-aqua-700)' : 'var(--pg-ink-400)'}}>
                            {lbl.toUpperCase()}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {/* No-photo hint */}
                  {noPhotoHint === i && (
                    <div style={{
                      marginTop:7, padding:'6px 10px', borderRadius:8,
                      background:'oklch(0.97 0.05 30)', border:'1px solid oklch(0.85 0.12 30)',
                      fontSize:11.5, fontWeight:600, color:'oklch(0.45 0.16 30)',
                      display:'flex', alignItems:'center', gap:6, animation:'fadeIn .15s ease',
                    }}>
                      📷 {lang==='pt'?`Adicione as 3 fotos para concluir (${photoCnt}/3)`
                         :lang==='es'?`Agrega las 3 fotos para completar (${photoCnt}/3)`
                         :`Add all 3 photos to complete this pool (${photoCnt}/3)`}
                    </div>
                  )}
                </div>
              );
            }) : Array.from({length:activeDay.pools}).map((_,i) => (
              <div key={i} className="pg-card" style={{padding:'12px 14px', opacity:0.55}}>
                <div style={{display:'flex', alignItems:'center', gap:8}}>
                  <div style={{width:28, height:28, borderRadius:8,
                    background:'var(--pg-ink-200)', color:'#fff',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:12, fontWeight:700}}>{i+1}</div>
                  <div style={{flex:1, height:12, borderRadius:4, background:'var(--pg-ink-100)'}}/>
                  <div style={{fontSize:11.5, color:'var(--pg-ink-400)'}}>
                    {lang==='pt'?'Endereço pendente':lang==='es'?'Dirección pendiente':'Address pending'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mark all done CTA */}
          <button onClick={activeAllDone ? undefined : markAllDone}
            className="pg-btn"
            style={{
              width:'100%', height:48, fontSize:14, borderRadius:12,
              background: activeAllDone ? 'var(--pg-aqua-100)' : 'var(--pg-blue-500)',
              color: activeAllDone ? 'var(--pg-aqua-700)' : '#fff',
              cursor: activeAllDone ? 'default' : 'pointer',
              border:'none',
            }}>
            {activeAllDone
              ? (lang==='pt'?'✓ Dia concluído!':lang==='es'?'✓ ¡Día completado!':'✓ Day complete!')
              : (lang==='pt'?'Marcar todas como concluídas':lang==='es'?'Marcar todas como completadas':'Mark all pools as done')}
          </button>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { WorkScreen, ScheduleSheet });
