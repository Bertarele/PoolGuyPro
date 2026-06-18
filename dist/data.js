// data.jsx — mock content + i18n strings

const STRINGS = {
  en: {
    // Tabs
    home: 'Home',
    marketplace: 'Marketplace',
    quickPools: 'Express Pools',
    work: 'Work',
    profile: 'Profile',
    // Common
    seeAll: 'See all',
    apply: 'Apply',
    applied: 'Applied',
    contact: 'Contact',
    message: 'Message',
    viewDetails: 'View details',
    search: 'Search…',
    edit: 'Edit',
    cancel: 'Cancel',
    confirm: 'Confirm',
    back: 'Back',
    continueBtn: 'Continue',
    save: 'Save',
    urgent: 'URGENT',
    new: 'NEW',
    open: 'OPEN',
    accepted: 'Accepted',
    awaiting: 'Awaiting',
    verified: 'Verified',
    negotiable: 'Negotiable',
    perPool: 'per pool',
    poolsWord: 'pools',
    today: 'Today',
    tomorrow: 'Tomorrow',
    thisWeek: 'This week',
    flexible: 'Flexible',
    custom: 'Set custom',
    // Home
    homeSubtitle: 'South Florida · Active',
    featured: 'Featured opportunities',
    activity: 'Activity feed',
    upgrade: 'Upgrade to Premium',
    upgradeDesc: 'Unlock Express Pools, full marketplace and unlimited applications.',
    goPro: 'Go PRO',
    getJobsFirst: 'Get the jobs\nbefore everyone else.',
    qaPostQuick: 'Post Quick',
    qaSellGear: 'Sell gear',
    qaVacation: 'Vacation',
    qaFindWork: 'Find work',
    activityAgo: 'ago',
    todayJobs: 'Today\'s pool jobs',
    seeAllOpps: 'See all',
    todayJobsSub: 'tap to view & apply',
    // Marketplace
    equipment: 'Equipment',
    poolRoutes: 'Pool Routes',
    sell: 'Sell',
    rent: 'Rent',
    routesSaleOnly: 'Pool routes are sale-only. PoolGuyPro escrows the first month\'s revenue until handoff is complete.',
    asking: 'Asking',
    makeOffer: 'Make offer',
    requestRental: 'Request rental',
    itemsSell: 'items · Sell',
    itemsRent: 'items · Rent',
    routesFor: 'routes for sale',
    // Express Pools
    postQuick: 'Post a Quick Pool',
    yourRegions: 'YOUR REGIONS',
    mapView: 'Map view',
    nearestFirst: 'Nearest first',
    under50: '< $50',
    house: 'House',
    condo: 'Condo',
    offer: 'OFFER',
    whenLabel: 'WHEN',
    pools: 'POOLS',
    accessDetails: 'ACCESS DETAILS',
    gateCode: 'Gate code',
    doorman: 'Doorman',
    dogLbl: 'Dog',
    saltwater: 'Saltwater',
    yes: 'Yes',
    no: 'No',
    description: 'DESCRIPTION',
    completedJobs: 'completed jobs',
    unlock: 'Unlock',
    unlockApply: 'Unlock to apply',
    premiumUnlocks: 'Premium unlocks Express Pools',
    premiumUnlocksDesc: 'Apply, contact the poster and see full access details. Cancel anytime.',
    fastTrack: 'fast track',
    unlockPrice: 'Unlock — $9.99/mo',
    // Post form
    step: 'Step',
    of: 'of',
    pqStep1Title: 'What needs doing?',
    pqStep1Sub: 'A short title so nearby pool guys understand the job at a glance.',
    pqStep2Title: 'Where and when?',
    pqStep2Sub: 'We notify pool guys whose region matches.',
    pqStep3Title: 'Set your price',
    pqStep3Sub: 'Pay per pool, or leave it open for negotiation.',
    title: 'Title',
    titlePh: 'Vacation cover — 6 pools',
    numPools: 'Number of pools',
    notesOptional: 'Notes for applicants (optional)',
    notesPh: 'Saltwater systems, all chemicals on-site, key under mat…',
    location: 'Location',
    locationPh: 'e.g. Boca Raton, FL',
    poolType: 'Pool type',
    streetHouse: 'Street house',
    condominium: 'Condominium',
    condoAccess: 'CONDO ACCESS',
    gateCodeReq: 'Gate code required',
    hasDoorman: 'Has doorman',
    hasDog: 'Has dog on property',
    when: 'When',
    priceQ: 'How do you want to pay?',
    fixedPrice: 'Fixed price',
    priceNeg: 'Negotiable',
    pricePerPool: 'Price per pool (USD)',
    typicalRange: 'Typical range in your area:',
    summary: 'SUMMARY',
    sumTitle: 'Title',
    sumPools: 'Pools',
    sumType: 'Type',
    sumLocation: 'Location',
    sumWhen: 'When',
    sumPrice: 'Price',
    totalBudget: 'Total budget',
    matchNotice: 'pool guys match your region. They\'ll be notified instantly.',
    postQuickBtn: 'Post Quick Pool',
    // Work
    hiring: 'Hiring',
    technicians: 'Technicians',
    vacation: 'Vacation',
    posted: 'Posted',
    appliedTab: 'Applied to',
    applicant: 'applicant',
    applicants: 'applicants',
    jobSearchPh: 'Job title, company, area…',
    techSearchPh: 'Specialty, name, area…',
    fullTime: 'Full-time',
    partTime: 'Part-time',
    contract: 'Contract',
    remote: 'Remote',
    withTruck: 'With truck',
    pay: 'Pay',
    request: 'Request',
    goingOnVacation: 'Going on vacation?',
    vacationDesc: 'Delegate your route to a trusted PoolGuy. We escrow payment until you confirm the route is clean.',
    postAvailability: 'Post my availability',
    selectedDays: 'SELECTED DAYS',
    poolsPerDay: 'pools/day',
    days: 'days',
    viewApplicants: 'View applicants',
    viewSchedule: 'View schedule',
    withdraw: 'Withdraw',
    // Profile
    myProfile: 'MY PROFILE',
    memberSince: 'Member since',
    jobsDone: 'Jobs done',
    routes: 'Routes',
    serviced: 'serviced',
    rating: 'Rating',
    onTime: 'On-time',
    workRegions: 'Work regions',
    specialties: 'Specialties',
    reviews: 'Reviews',
    add: 'Add',
    notifyNewJobs: 'Notify me of new jobs',
    peerToPeer: 'Ratings are peer-to-peer only — both sides must have completed a transaction.',
    settings: 'Settings',
    notifications: 'Notifications',
    languageLbl: 'Language',
    locationServices: 'Location services',
    verification: 'Verification',
    alwaysLbl: 'Always',
    helpSupport: 'Help & support',
    privacy: 'Privacy',
    logout: 'Log out',
    subscription: 'SUBSCRIPTION',
    poolguyPro: 'PoolGuy PRO',
    premium: 'Premium',
    free: 'Free tier',
    renews: 'Renews',
    upgradeQp: 'Upgrade to unlock Express Pools',
    comparePlans: 'Compare plans',
    tapTier: 'Tap a tier to preview gating behavior across the app',
    on: 'On',
    english: 'English',
    portuguese: 'Português',
    spanish: 'Español',
    // Overlays
    activeNow: 'Active now',
    viewJob: 'View job',
    messagePh: 'Message…',
    notifsTitle: 'Notifications',
    markAllRead: 'Mark all read',
    whatPost: 'What do you want to post?',
    pmQuickPool: 'Quick Pool',
    pmQuickPoolSub: 'On-demand pool job',
    pmSellEq: 'Sell equipment',
    pmSellEqSub: 'Pumps, filters, heaters…',
    pmRentEq: 'Rent equipment',
    pmRentEqSub: 'Daily / weekly rentals',
    pmSellRoute: 'Sell pool route',
    pmSellRouteSub: 'Transfer your clients',
    pmVacCover: 'Vacation cover',
    pmVacCoverSub: 'Delegate your route',
    pmHireTech: 'Hire a tech',
    pmHireTechSub: 'Post a job opening',
    payTitle: 'Get the jobs before\neveryone else.',
    paySub: 'Premium unlocks Express Pools, full marketplace access and removes daily caps.',
    payBest: 'BEST VALUE',
    payTrial: '7-day free trial',
    paySave: 'Or $179/year — save 25%',
    payF1: 'View Quick Pool details',
    payF2: 'Apply to jobs',
    payF3: 'Unlimited applications',
    payF4: 'Priority notifications',
    payF5: 'Featured marketplace posts',
    payF6: 'PRO badge on your profile',
    startTrial: 'Start free trial',
    cancelAnytime: 'Cancel anytime. Renews automatically after 7-day trial.',
    restore: 'Restore purchases · Terms · Privacy',
    toastPosted: 'Quick Pool posted — 34 pool guys notified',
    // Notif content
    notif1Title: 'New job in your region',
    notif1Body: '6 pools · Boca Raton · $45/pool',
    notif2Title: 'sent a message',
    notif3Title: 'Application update',
    notif3Body: 'accepted your vacation request',
    notif4Title: 'New 5★ rating',
    notif4Body: 'left you a review',
    justNow: 'just now',
    yesterday: 'yesterday',
    // Login
    tagline: 'Your Pool. Our Priority.',
    loginSub: 'Connecting South Florida pool guys',
    passLbl: 'Password',
    forgotPw: 'Forgot password?',
    loginBtn: 'Log in',
    noAccount: "Don't have an account?",
    signUp: 'Sign up',
    continueGuest: 'Continue as guest',
    orLbl: 'or',
    withApple: 'Continue with Apple',
    // Language picker
    chooseLanguage: 'Language',
    // Chat inbox
    inboxTitle: 'Messages',
    noChats: 'No conversations yet',
    // My posts
    myPosts: 'My posts',
    noPostsYet: 'No posts yet',
    applicantsPanelTitle: 'Applicants',
    acceptBtn: 'Accept',
    rejectBtn: 'Reject',
    chatBtn: 'Chat',
    rejected: 'Rejected',
    pendingLbl: 'Pending',
    // Marketplace post form
    whatToList: 'What do you want to list?',
    postListingBtn: 'Post listing',
    conditionLbl: 'Condition',
    likeNewLbl: 'Like new',
    goodLbl: 'Good',
    usedLbl: 'Used',
    forPartsLbl: 'For parts',
    modelLbl: 'Model / Name',
    modelPh: 'e.g. Pentair IntelliFlo VSF',
    ratePerDay: 'Rate per day',
    ratePerWeek: 'Rate per week',
    routeNameLbl: 'Route name',
    routeNamePh: 'e.g. Weston Lakes — 14 pools',
    clientsLbl: 'Number of clients',
    revenueMonthly: 'Monthly revenue',
    categoryLbl: 'Category'
  },
  pt: {
    home: 'Início',
    marketplace: 'Mercado',
    quickPools: 'Piscinas Rápidas',
    work: 'Trabalho',
    profile: 'Perfil',
    seeAll: 'Ver tudo',
    apply: 'Candidatar',
    applied: 'Aplicado',
    contact: 'Contato',
    message: 'Mensagem',
    viewDetails: 'Ver detalhes',
    search: 'Procurar…',
    edit: 'Editar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    back: 'Voltar',
    continueBtn: 'Continuar',
    save: 'Salvar',
    urgent: 'URGENTE',
    new: 'NOVO',
    open: 'ABERTO',
    accepted: 'Aceito',
    awaiting: 'Aguardando',
    verified: 'Verificado',
    negotiable: 'Negociável',
    perPool: 'por piscina',
    poolsWord: 'piscinas',
    today: 'Hoje',
    tomorrow: 'Amanhã',
    thisWeek: 'Esta semana',
    flexible: 'Flexível',
    custom: 'Personalizar',
    homeSubtitle: 'Sul da Flórida · Ativo',
    featured: 'Oportunidades em destaque',
    activity: 'Feed de atividade',
    upgrade: 'Atualize para Premium',
    upgradeDesc: 'Desbloqueie Piscinas Rápidas, mercado completo e candidaturas ilimitadas.',
    goPro: 'Tornar-se PRO',
    getJobsFirst: 'Pegue os trabalhos\nantes de todo mundo.',
    qaPostQuick: 'Publicar',
    qaSellGear: 'Vender',
    qaVacation: 'Férias',
    qaFindWork: 'Trabalho',
    activityAgo: 'atrás',
    todayJobs: 'Piscinas para hoje',
    seeAllOpps: 'Ver tudo',
    todayJobsSub: 'toque para ver e candidatar',
    equipment: 'Equipamento',
    poolRoutes: 'Rotas',
    sell: 'Vender',
    rent: 'Alugar',
    routesSaleOnly: 'Rotas de piscina são apenas para venda. O PoolGuyPro guarda em garantia a receita do primeiro mês até a entrega ser concluída.',
    asking: 'Pedido',
    makeOffer: 'Fazer oferta',
    requestRental: 'Solicitar aluguel',
    itemsSell: 'itens · Venda',
    itemsRent: 'itens · Aluguel',
    routesFor: 'rotas à venda',
    postQuick: 'Publicar Piscina Rápida',
    yourRegions: 'SUAS REGIÕES',
    mapView: 'Ver mapa',
    nearestFirst: 'Mais próximos',
    under50: '< R$50',
    house: 'Casa',
    condo: 'Condomínio',
    offer: 'OFERTA',
    whenLabel: 'QUANDO',
    pools: 'PISCINAS',
    accessDetails: 'DETALHES DE ACESSO',
    gateCode: 'Código do portão',
    doorman: 'Porteiro',
    dogLbl: 'Cachorro',
    saltwater: 'Água salgada',
    yes: 'Sim',
    no: 'Não',
    description: 'DESCRIÇÃO',
    completedJobs: 'trabalhos concluídos',
    unlock: 'Desbloquear',
    unlockApply: 'Desbloquear para aplicar',
    premiumUnlocks: 'Premium desbloqueia Piscinas Rápidas',
    premiumUnlocksDesc: 'Candidate-se, contate o anunciante e veja todos os detalhes de acesso. Cancele quando quiser.',
    fastTrack: 'aplicação rápida',
    unlockPrice: 'Desbloquear — R$49/mês',
    step: 'Passo',
    of: 'de',
    pqStep1Title: 'O que precisa ser feito?',
    pqStep1Sub: 'Um título curto para os piscineiros próximos entenderem o trabalho rapidamente.',
    pqStep2Title: 'Onde e quando?',
    pqStep2Sub: 'Notificamos os piscineiros cuja região corresponda.',
    pqStep3Title: 'Defina seu preço',
    pqStep3Sub: 'Pague por piscina ou deixe aberto para negociar.',
    title: 'Título',
    titlePh: 'Cobrir férias — 6 piscinas',
    numPools: 'Número de piscinas',
    notesOptional: 'Notas para candidatos (opcional)',
    notesPh: 'Sistemas de água salgada, produtos no local, chave embaixo do tapete…',
    location: 'Localização',
    locationPh: 'ex: Boca Raton, FL',
    poolType: 'Tipo de piscina',
    streetHouse: 'Casa de rua',
    condominium: 'Condomínio',
    condoAccess: 'ACESSO AO CONDOMÍNIO',
    gateCodeReq: 'Código de portão necessário',
    hasDoorman: 'Tem porteiro',
    hasDog: 'Tem cachorro na propriedade',
    when: 'Quando',
    priceQ: 'Como você quer pagar?',
    fixedPrice: 'Preço fixo',
    priceNeg: 'Negociável',
    pricePerPool: 'Preço por piscina (BRL)',
    typicalRange: 'Faixa típica na sua área:',
    summary: 'RESUMO',
    sumTitle: 'Título',
    sumPools: 'Piscinas',
    sumType: 'Tipo',
    sumLocation: 'Localização',
    sumWhen: 'Quando',
    sumPrice: 'Preço',
    totalBudget: 'Orçamento total',
    matchNotice: 'piscineiros correspondem à sua região. Eles serão notificados imediatamente.',
    postQuickBtn: 'Publicar Piscina Rápida',
    hiring: 'Vagas',
    technicians: 'Técnicos',
    vacation: 'Férias',
    posted: 'Publicados',
    appliedTab: 'Candidatados',
    applicant: 'candidato',
    applicants: 'candidatos',
    jobSearchPh: 'Cargo, empresa, área…',
    techSearchPh: 'Especialidade, nome, área…',
    fullTime: 'Tempo integral',
    partTime: 'Meio período',
    contract: 'Contrato',
    remote: 'Remoto',
    withTruck: 'Com veículo',
    pay: 'Salário',
    request: 'Solicitar',
    goingOnVacation: 'Vai sair de férias?',
    vacationDesc: 'Delegue sua rota a um PoolGuy confiável. O pagamento fica em garantia até você confirmar que a rota está limpa.',
    postAvailability: 'Publicar disponibilidade',
    selectedDays: 'DIAS SELECIONADOS',
    poolsPerDay: 'piscinas/dia',
    days: 'dias',
    viewApplicants: 'Ver candidatos',
    viewSchedule: 'Ver agenda',
    withdraw: 'Retirar',
    myProfile: 'MEU PERFIL',
    memberSince: 'Membro desde',
    jobsDone: 'Trabalhos',
    routes: 'Rotas',
    serviced: 'atendidas',
    rating: 'Avaliação',
    onTime: 'Pontualidade',
    workRegions: 'Regiões de trabalho',
    specialties: 'Especialidades',
    reviews: 'Avaliações',
    add: 'Adicionar',
    notifyNewJobs: 'Notificar novos trabalhos',
    peerToPeer: 'Avaliações são entre pares — ambos os lados precisam ter concluído uma transação.',
    settings: 'Configurações',
    notifications: 'Notificações',
    languageLbl: 'Idioma',
    locationServices: 'Serviços de localização',
    verification: 'Verificação',
    alwaysLbl: 'Sempre',
    helpSupport: 'Ajuda e suporte',
    privacy: 'Privacidade',
    logout: 'Sair',
    subscription: 'ASSINATURA',
    poolguyPro: 'PoolGuy PRO',
    premium: 'Premium',
    free: 'Gratuito',
    renews: 'Renova',
    upgradeQp: 'Atualize para desbloquear Piscinas Rápidas',
    comparePlans: 'Comparar planos',
    tapTier: 'Toque em um plano para visualizar o comportamento de bloqueio no app',
    on: 'Ativo',
    english: 'English',
    portuguese: 'Português',
    spanish: 'Español',
    activeNow: 'Online agora',
    viewJob: 'Ver trabalho',
    messagePh: 'Mensagem…',
    notifsTitle: 'Notificações',
    markAllRead: 'Marcar todas como lidas',
    whatPost: 'O que você quer publicar?',
    pmQuickPool: 'Piscina Rápida',
    pmQuickPoolSub: 'Trabalho sob demanda',
    pmSellEq: 'Vender equipamento',
    pmSellEqSub: 'Bombas, filtros, aquecedores…',
    pmRentEq: 'Alugar equipamento',
    pmRentEqSub: 'Aluguel diário / semanal',
    pmSellRoute: 'Vender rota',
    pmSellRouteSub: 'Transferir seus clientes',
    pmVacCover: 'Cobertura de férias',
    pmVacCoverSub: 'Delegue sua rota',
    pmHireTech: 'Contratar técnico',
    pmHireTechSub: 'Publicar vaga',
    payTitle: 'Pegue os trabalhos\nantes de todo mundo.',
    paySub: 'Premium desbloqueia Piscinas Rápidas, acesso total ao mercado e remove limites diários.',
    payBest: 'MELHOR VALOR',
    payTrial: '7 dias grátis',
    paySave: 'Ou R$899/ano — economize 25%',
    payF1: 'Ver detalhes das Piscinas Rápidas',
    payF2: 'Candidatar-se a trabalhos',
    payF3: 'Candidaturas ilimitadas',
    payF4: 'Notificações prioritárias',
    payF5: 'Anúncios em destaque no mercado',
    payF6: 'Selo PRO no seu perfil',
    startTrial: 'Iniciar teste grátis',
    cancelAnytime: 'Cancele quando quiser. Renova automaticamente após 7 dias.',
    restore: 'Restaurar compras · Termos · Privacidade',
    toastPosted: 'Piscina Rápida publicada — 34 piscineiros notificados',
    notif1Title: 'Novo trabalho na sua região',
    notif1Body: '6 piscinas · Boca Raton · R$45/piscina',
    notif2Title: 'enviou uma mensagem',
    notif3Title: 'Atualização de candidatura',
    notif3Body: 'aceitou seu pedido de cobertura de férias',
    notif4Title: 'Nova avaliação 5★',
    notif4Body: 'deixou uma avaliação',
    justNow: 'agora',
    yesterday: 'ontem',
    // Login
    tagline: 'Sua Piscina. Nossa Prioridade.',
    loginSub: 'Conectando piscineiros do sul da Flórida',
    passLbl: 'Senha',
    forgotPw: 'Esqueceu a senha?',
    loginBtn: 'Entrar',
    noAccount: 'Não tem conta?',
    signUp: 'Criar conta',
    continueGuest: 'Continuar como visitante',
    orLbl: 'ou',
    withApple: 'Continuar com Apple',
    // Language picker
    chooseLanguage: 'Idioma',
    // Chat inbox
    inboxTitle: 'Mensagens',
    noChats: 'Nenhuma conversa ainda',
    // My posts
    myPosts: 'Meus anúncios',
    noPostsYet: 'Nenhum anúncio ainda',
    applicantsPanelTitle: 'Candidatos',
    acceptBtn: 'Aceitar',
    rejectBtn: 'Rejeitar',
    chatBtn: 'Chat',
    rejected: 'Rejeitado',
    pendingLbl: 'Pendente',
    // Marketplace post form
    whatToList: 'O que você quer anunciar?',
    postListingBtn: 'Publicar anúncio',
    conditionLbl: 'Condição',
    likeNewLbl: 'Seminovo',
    goodLbl: 'Bom estado',
    usedLbl: 'Usado',
    forPartsLbl: 'Para peças',
    modelLbl: 'Modelo / Nome',
    modelPh: 'ex: Pentair IntelliFlo VSF',
    ratePerDay: 'Valor por dia',
    ratePerWeek: 'Valor por semana',
    routeNameLbl: 'Nome da rota',
    routeNamePh: 'ex: Weston Lakes — 14 piscinas',
    clientsLbl: 'Número de clientes',
    revenueMonthly: 'Receita mensal',
    categoryLbl: 'Categoria'
  },
  es: {
    home: 'Inicio',
    marketplace: 'Mercado',
    quickPools: 'Piscinas Rápidas',
    work: 'Trabajo',
    profile: 'Perfil',
    seeAll: 'Ver todo',
    apply: 'Postular',
    applied: 'Postulado',
    contact: 'Contactar',
    message: 'Mensaje',
    viewDetails: 'Ver detalles',
    search: 'Buscar…',
    edit: 'Editar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    back: 'Atrás',
    continueBtn: 'Continuar',
    save: 'Guardar',
    urgent: 'URGENTE',
    new: 'NUEVO',
    open: 'ABIERTO',
    accepted: 'Aceptado',
    awaiting: 'Esperando',
    verified: 'Verificado',
    negotiable: 'Negociable',
    perPool: 'por piscina',
    poolsWord: 'piscinas',
    today: 'Hoy',
    tomorrow: 'Mañana',
    thisWeek: 'Esta semana',
    flexible: 'Flexible',
    custom: 'Personalizar',
    homeSubtitle: 'Sur de Florida · Activo',
    featured: 'Oportunidades destacadas',
    activity: 'Feed de actividad',
    upgrade: 'Actualizar a Premium',
    upgradeDesc: 'Desbloquea Piscinas Rápidas, mercado completo y postulaciones ilimitadas.',
    goPro: 'Hazte PRO',
    getJobsFirst: 'Consigue los trabajos\nantes que los demás.',
    qaPostQuick: 'Publicar',
    qaSellGear: 'Vender',
    qaVacation: 'Vacaciones',
    qaFindWork: 'Trabajo',
    activityAgo: 'atrás',
    todayJobs: 'Piscinas para hoy',
    seeAllOpps: 'Ver todo',
    todayJobsSub: 'toca para ver y postular',
    equipment: 'Equipo',
    poolRoutes: 'Rutas',
    sell: 'Vender',
    rent: 'Rentar',
    routesSaleOnly: 'Las rutas de piscina son solo para venta. PoolGuyPro retiene en garantía los ingresos del primer mes hasta completar la entrega.',
    asking: 'Precio',
    makeOffer: 'Hacer oferta',
    requestRental: 'Solicitar renta',
    itemsSell: 'artículos · Venta',
    itemsRent: 'artículos · Renta',
    routesFor: 'rutas en venta',
    postQuick: 'Publicar Piscina Rápida',
    yourRegions: 'TUS REGIONES',
    mapView: 'Ver mapa',
    nearestFirst: 'Más cercanos',
    under50: '< $50',
    house: 'Casa',
    condo: 'Condominio',
    offer: 'OFERTA',
    whenLabel: 'CUÁNDO',
    pools: 'PISCINAS',
    accessDetails: 'DETALLES DE ACCESO',
    gateCode: 'Código de portón',
    doorman: 'Portero',
    dogLbl: 'Perro',
    saltwater: 'Agua salada',
    yes: 'Sí',
    no: 'No',
    description: 'DESCRIPCIÓN',
    completedJobs: 'trabajos completados',
    unlock: 'Desbloquear',
    unlockApply: 'Desbloquea para postular',
    premiumUnlocks: 'Premium desbloquea Piscinas Rápidas',
    premiumUnlocksDesc: 'Postúlate, contacta al anunciante y ve todos los detalles de acceso. Cancela cuando quieras.',
    fastTrack: 'vía rápida',
    unlockPrice: 'Desbloquear — $9.99/mes',
    step: 'Paso',
    of: 'de',
    pqStep1Title: '¿Qué hay que hacer?',
    pqStep1Sub: 'Un título corto para que los técnicos cercanos entiendan el trabajo a primera vista.',
    pqStep2Title: '¿Dónde y cuándo?',
    pqStep2Sub: 'Notificamos a los técnicos cuya región coincida.',
    pqStep3Title: 'Establece tu precio',
    pqStep3Sub: 'Paga por piscina o déjalo abierto para negociar.',
    title: 'Título',
    titlePh: 'Cobertura de vacaciones — 6 piscinas',
    numPools: 'Número de piscinas',
    notesOptional: 'Notas para postulantes (opcional)',
    notesPh: 'Sistemas de agua salada, productos en el sitio, llave bajo el tapete…',
    location: 'Ubicación',
    locationPh: 'ej: Boca Raton, FL',
    poolType: 'Tipo de piscina',
    streetHouse: 'Casa',
    condominium: 'Condominio',
    condoAccess: 'ACCESO AL CONDOMINIO',
    gateCodeReq: 'Código de portón requerido',
    hasDoorman: 'Tiene portero',
    hasDog: 'Tiene perro en la propiedad',
    when: 'Cuándo',
    priceQ: '¿Cómo quieres pagar?',
    fixedPrice: 'Precio fijo',
    priceNeg: 'Negociable',
    pricePerPool: 'Precio por piscina (USD)',
    typicalRange: 'Rango típico en tu área:',
    summary: 'RESUMEN',
    sumTitle: 'Título',
    sumPools: 'Piscinas',
    sumType: 'Tipo',
    sumLocation: 'Ubicación',
    sumWhen: 'Cuándo',
    sumPrice: 'Precio',
    totalBudget: 'Presupuesto total',
    matchNotice: 'técnicos coinciden con tu región. Serán notificados de inmediato.',
    postQuickBtn: 'Publicar Piscina Rápida',
    hiring: 'Empleos',
    technicians: 'Técnicos',
    vacation: 'Vacaciones',
    posted: 'Publicados',
    appliedTab: 'Postulados',
    applicant: 'postulante',
    applicants: 'postulantes',
    jobSearchPh: 'Puesto, empresa, área…',
    techSearchPh: 'Especialidad, nombre, área…',
    fullTime: 'Tiempo completo',
    partTime: 'Medio tiempo',
    contract: 'Contrato',
    remote: 'Remoto',
    withTruck: 'Con camioneta',
    pay: 'Pago',
    request: 'Solicitar',
    goingOnVacation: '¿Te vas de vacaciones?',
    vacationDesc: 'Delega tu ruta a un PoolGuy de confianza. Retenemos el pago hasta que confirmes que la ruta está limpia.',
    postAvailability: 'Publicar disponibilidad',
    selectedDays: 'DÍAS SELECCIONADOS',
    poolsPerDay: 'piscinas/día',
    days: 'días',
    viewApplicants: 'Ver postulantes',
    viewSchedule: 'Ver agenda',
    withdraw: 'Retirar',
    myProfile: 'MI PERFIL',
    memberSince: 'Miembro desde',
    jobsDone: 'Trabajos',
    routes: 'Rutas',
    serviced: 'atendidas',
    rating: 'Calificación',
    onTime: 'Puntualidad',
    workRegions: 'Regiones de trabajo',
    specialties: 'Especialidades',
    reviews: 'Reseñas',
    add: 'Agregar',
    notifyNewJobs: 'Notificarme de nuevos trabajos',
    peerToPeer: 'Las reseñas son entre pares — ambas partes deben haber completado una transacción.',
    settings: 'Configuración',
    notifications: 'Notificaciones',
    languageLbl: 'Idioma',
    locationServices: 'Servicios de ubicación',
    verification: 'Verificación',
    alwaysLbl: 'Siempre',
    helpSupport: 'Ayuda y soporte',
    privacy: 'Privacidad',
    logout: 'Cerrar sesión',
    subscription: 'SUSCRIPCIÓN',
    poolguyPro: 'PoolGuy PRO',
    premium: 'Premium',
    free: 'Gratis',
    renews: 'Renueva',
    upgradeQp: 'Actualiza para desbloquear Piscinas Rápidas',
    comparePlans: 'Comparar planes',
    tapTier: 'Toca un plan para previsualizar el bloqueo en la app',
    on: 'Activo',
    english: 'English',
    portuguese: 'Português',
    spanish: 'Español',
    activeNow: 'Activo ahora',
    viewJob: 'Ver trabajo',
    messagePh: 'Mensaje…',
    notifsTitle: 'Notificaciones',
    markAllRead: 'Marcar todas leídas',
    whatPost: '¿Qué quieres publicar?',
    pmQuickPool: 'Piscina Rápida',
    pmQuickPoolSub: 'Trabajo bajo demanda',
    pmSellEq: 'Vender equipo',
    pmSellEqSub: 'Bombas, filtros, calentadores…',
    pmRentEq: 'Rentar equipo',
    pmRentEqSub: 'Renta diaria / semanal',
    pmSellRoute: 'Vender ruta',
    pmSellRouteSub: 'Transfiere tus clientes',
    pmVacCover: 'Cobertura vacaciones',
    pmVacCoverSub: 'Delega tu ruta',
    pmHireTech: 'Contratar técnico',
    pmHireTechSub: 'Publicar vacante',
    payTitle: 'Consigue los trabajos\nantes que los demás.',
    paySub: 'Premium desbloquea Piscinas Rápidas, acceso completo al mercado y elimina los límites diarios.',
    payBest: 'MEJOR VALOR',
    payTrial: '7 días gratis',
    paySave: 'O $179/año — ahorra 25%',
    payF1: 'Ver detalles de Piscinas Rápidas',
    payF2: 'Postular a trabajos',
    payF3: 'Postulaciones ilimitadas',
    payF4: 'Notificaciones prioritarias',
    payF5: 'Anuncios destacados en mercado',
    payF6: 'Insignia PRO en tu perfil',
    startTrial: 'Iniciar prueba gratis',
    cancelAnytime: 'Cancela cuando quieras. Renueva automáticamente tras 7 días.',
    restore: 'Restaurar compras · Términos · Privacidad',
    toastPosted: 'Piscina Rápida publicada — 34 técnicos notificados',
    notif1Title: 'Nuevo trabajo en tu región',
    notif1Body: '6 piscinas · Boca Raton · $45/piscina',
    notif2Title: 'envió un mensaje',
    notif3Title: 'Actualización de postulación',
    notif3Body: 'aceptó tu solicitud de vacaciones',
    notif4Title: 'Nueva calificación 5★',
    notif4Body: 'te dejó una reseña',
    justNow: 'ahora',
    yesterday: 'ayer',
    // Login
    tagline: 'Tu Piscina. Nuestra Prioridad.',
    loginSub: 'Conectando pool guys del sur de Florida',
    passLbl: 'Contraseña',
    forgotPw: '¿Olvidaste tu contraseña?',
    loginBtn: 'Iniciar sesión',
    noAccount: '¿No tienes cuenta?',
    signUp: 'Crear cuenta',
    continueGuest: 'Continuar como invitado',
    orLbl: 'o',
    withApple: 'Continuar con Apple',
    // Language picker
    chooseLanguage: 'Idioma',
    // Chat inbox
    inboxTitle: 'Mensajes',
    noChats: 'Sin conversaciones aún',
    // My posts
    myPosts: 'Mis publicaciones',
    noPostsYet: 'Sin publicaciones aún',
    applicantsPanelTitle: 'Postulantes',
    acceptBtn: 'Aceptar',
    rejectBtn: 'Rechazar',
    chatBtn: 'Chat',
    rejected: 'Rechazado',
    pendingLbl: 'Pendiente',
    // Marketplace post form
    whatToList: '¿Qué quieres publicar?',
    postListingBtn: 'Publicar anuncio',
    conditionLbl: 'Condición',
    likeNewLbl: 'Como nuevo',
    goodLbl: 'Buen estado',
    usedLbl: 'Usado',
    forPartsLbl: 'Para repuestos',
    modelLbl: 'Modelo / Nombre',
    modelPh: 'ej: Pentair IntelliFlo VSF',
    ratePerDay: 'Tarifa por día',
    ratePerWeek: 'Tarifa por semana',
    routeNameLbl: 'Nombre de ruta',
    routeNamePh: 'ej: Weston Lakes — 14 piscinas',
    clientsLbl: 'Número de clientes',
    revenueMonthly: 'Ingreso mensual',
    categoryLbl: 'Categoría'
  }
};
const FEED = [{
  id: 1,
  user: 'Marcos Tavares',
  avatar: 'M',
  time: '12m',
  kind: 'job',
  rating: 4.8,
  reviews: 47,
  jobs: 47,
  loc: 'Boca Raton, FL',
  body: {
    en: 'Just posted a 6-pool route in Boca Raton — Tue/Thu mornings.',
    pt: 'Acabei de publicar uma rota de 6 piscinas em Boca Raton — Ter/Qui pela manhã.',
    es: 'Acabo de publicar una ruta de 6 piscinas en Boca Raton — Mar/Jue por la mañana.'
  },
  chip: {
    en: 'Quick Pool',
    pt: 'Piscina Rápida',
    es: 'Piscina Rápida'
  },
  chipKind: 'aqua',
  meta: {
    en: '$45 / pool · 4.2 mi',
    pt: 'R$45 / piscina · 6,7 km',
    es: '$45 / piscina · 4,2 mi'
  }
}, {
  id: 2,
  user: 'Sandra Reyes',
  avatar: 'S',
  time: '34m',
  kind: 'gear',
  rating: 4.9,
  reviews: 62,
  jobs: 62,
  loc: 'Coral Springs, FL',
  body: {
    en: 'Selling a barely-used Pentair IntelliFlo VSF pump. 2 yrs warranty left.',
    pt: 'Vendendo bomba Pentair IntelliFlo VSF quase nova. Restam 2 anos de garantia.',
    es: 'Vendo bomba Pentair IntelliFlo VSF casi nueva. Quedan 2 años de garantía.'
  },
  chip: {
    en: 'Marketplace',
    pt: 'Mercado',
    es: 'Mercado'
  },
  chipKind: 'blue',
  meta: {
    en: '$680 · Coral Springs',
    pt: 'R$3.400 · Coral Springs',
    es: '$680 · Coral Springs'
  }
}, {
  id: 3,
  user: 'Diego Almeida',
  avatar: 'D',
  time: '1h',
  kind: 'rating',
  rating: 5.0,
  reviews: 83,
  jobs: 83,
  loc: 'Fort Lauderdale, FL',
  body: {
    en: 'Rated ★ 5.0 by Carlos N. for a vacation route last week.',
    pt: 'Avaliado ★ 5.0 por Carlos N. por uma rota de férias na semana passada.',
    es: 'Calificado ★ 5.0 por Carlos N. por una ruta de vacaciones la semana pasada.'
  },
  chip: {
    en: 'Trusted',
    pt: 'Confiável',
    es: 'Confiable'
  },
  chipKind: 'blue',
  meta: {
    en: '+1 reputation',
    pt: '+1 reputação',
    es: '+1 reputación'
  }
}, {
  id: 4,
  user: 'Aqua Solutions LLC',
  avatar: 'A',
  time: '2h',
  kind: 'hire',
  rating: 4.7,
  reviews: 120,
  jobs: 120,
  loc: 'Miami-Dade, FL',
  body: {
    en: 'Hiring 2 full-time technicians for Miami-Dade. Driver\'s license preferred.',
    pt: 'Contratando 2 técnicos de tempo integral para Miami-Dade. Driver\'s license preferencial.',
    es: 'Contratando 2 técnicos de tiempo completo para Miami-Dade. Driver\'s license preferida.'
  },
  chip: {
    en: 'Hiring',
    pt: 'Vagas',
    es: 'Empleos'
  },
  chipKind: 'aqua',
  meta: {
    en: '$28–34/hr · benefits',
    pt: 'R$140–170/h · benefícios',
    es: '$28–34/h · beneficios'
  }
}];
const FEATURED = [{
  id: 1,
  category: 'Routes',
  title: {
    en: '12 Pools — Weston route',
    pt: '12 Piscinas — Rota Weston',
    es: '12 Piscinas — Ruta Weston'
  },
  sub: {
    en: 'Mon · Wed · Fri',
    pt: 'Seg · Qua · Sex',
    es: 'Lun · Mié · Vie'
  },
  price: '$65',
  tag: 'URGENT'
}, {
  id: 2,
  category: 'Heaters',
  title: {
    en: 'Heater repair training',
    pt: 'Treinamento de aquecedores',
    es: 'Capacitación de calentadores'
  },
  sub: {
    en: 'Saturday workshop',
    pt: 'Workshop de sábado',
    es: 'Taller del sábado'
  },
  price: {
    en: 'Free',
    pt: 'Grátis',
    es: 'Gratis'
  },
  tag: 'NEW'
}, {
  id: 3,
  category: 'Pole',
  title: {
    en: 'Salt cell — 40k gal',
    pt: 'Célula de sal — 40k gal',
    es: 'Celda de sal — 40k gal'
  },
  sub: {
    en: 'Brand new, sealed',
    pt: 'Novo, lacrado',
    es: 'Nuevo, sellado'
  },
  price: '$420',
  tag: 'NEW'
}];
const EQUIPMENT = [];
const POOL_ROUTES = [{
  id: 1,
  name: {
    en: 'Weston Lakes — 14 pools',
    pt: 'Weston Lakes — 14 piscinas',
    es: 'Weston Lakes — 14 piscinas'
  },
  revenue: {
    en: '$3.8k/mo',
    pt: 'R$19k/mês',
    es: '$3.8k/mes'
  },
  clients: 14,
  area: 'Weston',
  est: 5800
}, {
  id: 2,
  name: {
    en: 'Coral Gables — 8 pools',
    pt: 'Coral Gables — 8 piscinas',
    es: 'Coral Gables — 8 piscinas'
  },
  revenue: {
    en: '$2.4k/mo',
    pt: 'R$12k/mês',
    es: '$2.4k/mes'
  },
  clients: 8,
  area: 'Coral Gables',
  est: 3900
}, {
  id: 3,
  name: {
    en: 'Pinecrest — 22 pools',
    pt: 'Pinecrest — 22 piscinas',
    es: 'Pinecrest — 22 piscinas'
  },
  revenue: {
    en: '$6.1k/mo',
    pt: 'R$30k/mês',
    es: '$6.1k/mes'
  },
  clients: 22,
  area: 'Pinecrest',
  est: 9200
}];
const SINGLE_POOLS = [];
const QUICK_POOLS = [{
  id: 1,
  title: {
    en: 'Vacation cover — 6 pools',
    pt: 'Cobrir férias — 6 piscinas',
    es: 'Cobertura vacaciones — 6 piscinas'
  },
  loc: 'Boca Raton',
  dist: {
    en: '3.2 mi',
    pt: '5,1 km',
    es: '5,1 km'
  },
  price: 45,
  type: 'street',
  urgency: 'urgent',
  poster: 'Marcos T.',
  rating: 4.9,
  when: {
    en: 'Tomorrow · 9 AM',
    pt: 'Amanhã · 9h',
    es: 'Mañana · 9 AM'
  },
  pools: 6,
  body: {
    en: 'Need someone reliable to handle my Tuesday route. Saltwater systems, all chemicals on-site.',
    pt: 'Preciso de alguém confiável para minha rota de terça. Sistemas de água salgada, produtos no local.',
    es: 'Necesito a alguien confiable para mi ruta del martes. Sistemas de agua salada, productos en sitio.'
  }
}, {
  id: 2,
  title: {
    en: 'One-off cleaning — Coral Springs',
    pt: 'Limpeza pontual — Coral Springs',
    es: 'Limpieza única — Coral Springs'
  },
  loc: 'Coral Springs',
  dist: {
    en: '5.4 mi',
    pt: '8,7 km',
    es: '8,7 km'
  },
  price: 'neg',
  type: 'condo',
  urgency: 'new',
  poster: 'Sandra R.',
  rating: 4.7,
  when: {
    en: 'Thu · afternoon',
    pt: 'Qui · tarde',
    es: 'Jue · tarde'
  },
  pools: 1,
  body: {
    en: 'Condo complex. Algae bloom after storm. Need acid wash + balancing.',
    pt: 'Condomínio. Algas após tempestade. Precisa lavagem ácida + balanceamento.',
    es: 'Condominio. Algas tras tormenta. Necesita lavado ácido + balanceo.'
  },
  gateCode: true,
  doorman: true,
  dog: false
}, {
  id: 3,
  title: {
    en: 'Weekly route assist — 4 pools',
    pt: 'Assistência semanal — 4 piscinas',
    es: 'Asistencia semanal — 4 piscinas'
  },
  loc: 'Davie',
  dist: {
    en: '8.1 mi',
    pt: '13 km',
    es: '13 km'
  },
  price: 55,
  type: 'street',
  urgency: 'normal',
  poster: 'Diego A.',
  rating: 5.0,
  when: {
    en: 'Mon · 7 AM',
    pt: 'Seg · 7h',
    es: 'Lun · 7 AM'
  },
  pools: 4,
  body: {
    en: 'Need a second tech on Mondays through summer. Steady gig if it works out.',
    pt: 'Preciso de um segundo técnico nas segundas durante o verão. Trabalho fixo se der certo.',
    es: 'Necesito un segundo técnico los lunes durante el verano. Trabajo fijo si funciona.'
  }
}, {
  id: 4,
  title: {
    en: 'Equipment swap — Heat pump',
    pt: 'Troca de equipamento — Bomba de calor',
    es: 'Cambio de equipo — Bomba de calor'
  },
  loc: 'Plantation',
  dist: {
    en: '4.7 mi',
    pt: '7,5 km',
    es: '7,5 km'
  },
  price: 120,
  type: 'street',
  urgency: 'normal',
  poster: 'Lana B.',
  rating: 4.8,
  when: {
    en: 'Fri · flexible',
    pt: 'Sex · flexível',
    es: 'Vie · flexible'
  },
  pools: 1,
  body: {
    en: 'Already have the new unit on-site, need help with install + leak test.',
    pt: 'Já tenho a unidade nova no local, preciso de ajuda com instalação + teste de vazamento.',
    es: 'Ya tengo la unidad nueva en sitio, necesito ayuda con instalación + prueba de fugas.'
  }
}];
const HIRING = [];
const TECHS = [{
  id: 1,
  name: 'Rafael S.',
  speciality: {
    en: 'Pump & Motor Repair',
    pt: 'Reparo de Bombas e Motores',
    es: 'Reparación de Bombas'
  },
  rate: {
    en: '$90/visit',
    pt: 'R$450/visita',
    es: '$90/visita'
  },
  rating: 4.9,
  jobs: 142,
  loc: 'Miami',
  phone: '(305) 487-2910',
  email: 'rafael.pool@gmail.com'
}, {
  id: 2,
  name: 'Joana P.',
  speciality: {
    en: 'Heater & Heat Pumps',
    pt: 'Aquecedores e Bombas de Calor',
    es: 'Calentadores y Bombas'
  },
  rate: {
    en: '$110/visit',
    pt: 'R$550/visita',
    es: '$110/visita'
  },
  rating: 4.8,
  jobs: 88,
  loc: 'Fort Lauderdale',
  phone: '(954) 623-7841',
  email: null
}, {
  id: 3,
  name: 'Anderson L.',
  speciality: {
    en: 'Automation & Salt Cells',
    pt: 'Automação e Células de Sal',
    es: 'Automatización y Celdas'
  },
  rate: {
    en: '$120/visit',
    pt: 'R$600/visita',
    es: '$120/visita'
  },
  rating: 5.0,
  jobs: 64,
  loc: 'Boca Raton',
  phone: '(561) 302-5588',
  email: 'anderson.pool@outlook.com'
}, {
  id: 4,
  name: 'Carla M.',
  speciality: {
    en: 'Tile & Plaster',
    pt: 'Azulejo e Reboco',
    es: 'Azulejo y Yeso'
  },
  rate: {
    en: 'Quote',
    pt: 'Orçamento',
    es: 'Cotización'
  },
  rating: 4.7,
  jobs: 51,
  loc: 'West Palm',
  phone: '(561) 774-1923',
  email: null
}];
const VACATIONS_POSTED = [{
  id: 1,
  myPostId: 2,
  month: {
    en: 'June 2026',
    pt: 'Junho 2026',
    es: 'Junio 2026'
  },
  yearMonth: {
    year: 2026,
    month: 5
  },
  // June = month 5 (0-indexed). Jun 1 2026 = Monday
  days: [3, 4, 5, 6, 10, 11],
  bookedDays: [3, 4],
  // Wed 3 & Thu 4 already assigned to Carlos N.
  poolsPerDay: 16,
  pricePerPool: 22,
  region: 'Weston / Plantation',
  status: 'open'
}, {
  id: 2,
  myPostId: 4,
  month: {
    en: 'August 2026',
    pt: 'Agosto 2026',
    es: 'Agosto 2026'
  },
  yearMonth: {
    year: 2026,
    month: 7
  },
  // August = month 7. Aug 1 2026 = Saturday
  days: [18, 19, 20],
  bookedDays: [],
  poolsPerDay: 14,
  pricePerPool: 20,
  region: 'Coral Springs',
  status: 'open'
}];

// Available vacations from other pool guys (pool guy can apply, pick specific days)
const VACATION_LISTINGS = [{
  id: 1,
  owner: 'Marco S.',
  ownerRating: 4.9,
  ownerJobs: 87,
  month: {
    en: 'June 2026',
    pt: 'Junho 2026',
    es: 'Junio 2026'
  },
  yearMonth: {
    year: 2026,
    month: 5
  },
  days: [2, 3, 4, 5, 6, 9, 10, 11],
  bookedDays: [2, 3],
  poolsPerDay: 16,
  pricePerPool: 22,
  // Jun 1 2026 = Mon(1) → Jun2=Tue(2), Jun3=Wed(3), Jun4=Thu(4), Jun5=Fri(5), Jun6=Sat(6)
  poolsByWeekday: {
    2: 14,
    3: 16,
    4: 18,
    5: 14,
    6: 10
  },
  region: 'Fort Lauderdale',
  note: {
    en: 'All chemicals & equipment on-site. Key under mat.',
    pt: 'Químicos e equipamentos no local. Chave embaixo do tapete.',
    es: 'Químicos y equipos en sitio. Llave bajo el tapete.'
  }
}, {
  id: 2,
  owner: 'Lisa C.',
  ownerRating: 4.8,
  ownerJobs: 54,
  month: {
    en: 'July 2026',
    pt: 'Julho 2026',
    es: 'Julio 2026'
  },
  yearMonth: {
    year: 2026,
    month: 6
  },
  days: [6, 7, 8, 9, 10, 13, 14],
  bookedDays: [6, 7],
  poolsPerDay: 14,
  pricePerPool: 20,
  // Jul 1 2026 = Wed(3) → Jul6=Mon(1), Jul7=Tue(2), Jul8=Wed(3), Jul9=Thu(4), Jul10=Fri(5)
  poolsByWeekday: {
    1: 12,
    2: 14,
    3: 14,
    4: 16,
    5: 10
  },
  region: 'Boca Raton',
  note: {
    en: 'Truck available if needed. Saltwater route — 3 properties have dogs.',
    pt: 'Caminhonete disponível se precisar. Rota de água salgada — 3 propriedades com cães.',
    es: 'Camioneta disponible si se necesita. Ruta de agua salada — 3 propiedades con perros.'
  }
}, {
  id: 3,
  owner: 'David R.',
  ownerRating: 5.0,
  ownerJobs: 142,
  month: {
    en: 'August 2026',
    pt: 'Agosto 2026',
    es: 'Agosto 2026'
  },
  yearMonth: {
    year: 2026,
    month: 7
  },
  days: [3, 4, 5, 6, 7, 10, 11, 12],
  bookedDays: [],
  poolsPerDay: 18,
  pricePerPool: 24,
  // Aug 1 2026 = Sat(6) → Aug3=Mon(1), Aug4=Tue(2), Aug5=Wed(3), Aug6=Thu(4), Aug7=Fri(5)
  poolsByWeekday: {
    1: 18,
    2: 20,
    3: 18,
    4: 16,
    5: 14
  },
  region: 'Pompano Beach',
  note: {
    en: 'Premium residential route — pools are well-maintained. Own transport required.',
    pt: 'Rota residencial premium — piscinas bem mantidas. Transporte próprio necessário.',
    es: 'Ruta residencial premium — piscinas bien mantenidas. Transporte propio requerido.'
  }
}, {
  id: 4,
  owner: 'Ana P.',
  ownerRating: 4.7,
  ownerJobs: 31,
  month: {
    en: 'June 2026',
    pt: 'Junho 2026',
    es: 'Junio 2026'
  },
  yearMonth: {
    year: 2026,
    month: 5
  },
  days: [15, 16, 17, 18, 19, 22],
  bookedDays: [15, 16, 17],
  poolsPerDay: 12,
  pricePerPool: 21,
  // Jun15=Mon(1), Jun16=Tue(2), Jun17=Wed(3), Jun18=Thu(4), Jun19=Fri(5), Jun22=Mon(1)
  poolsByWeekday: {
    1: 12,
    2: 12,
    3: 10,
    4: 14,
    5: 8
  },
  region: 'Hollywood',
  note: {
    en: 'Condo complex — all pools on same site. Gate code shared on accept.',
    pt: 'Condomínio — todas as piscinas no mesmo local. Código do portão ao aceitar.',
    es: 'Condominio — todas las piscinas en el mismo lugar. Código del portón al aceptar.'
  }
}];
const VACATIONS_APPLIED = [{
  id: 1,
  owner: 'Marco S.',
  month: {
    en: 'June 2026',
    pt: 'Junho 2026',
    es: 'Junio 2026'
  },
  yearMonth: {
    year: 2026,
    month: 5
  },
  // June = month 5. Jun 1 2026 = Monday
  days: [2, 3, 4, 5, 6, 9, 10, 11],
  selectedDays: [4, 5, 6],
  // Applied for Wed/Thu/Fri
  poolsPerDay: 16,
  pricePerPool: 22,
  region: 'Fort Lauderdale',
  status: 'awaiting'
}, {
  id: 2,
  owner: 'Patrícia L.',
  month: {
    en: 'July 2026',
    pt: 'Julho 2026',
    es: 'Julio 2026'
  },
  yearMonth: {
    year: 2026,
    month: 6
  },
  // July = month 6. Jul 1 2026 = Wednesday
  days: [8, 9, 10, 11, 12],
  selectedDays: [8, 9, 10, 11, 12],
  // Applied for all 5 days
  poolsPerDay: 8,
  pricePerPool: 25,
  region: 'Pinecrest',
  status: 'accepted',
  // Jul8=Wed(3), Jul9=Thu(4), Jul10=Fri(5), Jul11=Sat(6), Jul12=Sun(0)
  poolsByWeekday: {
    3: 8,
    4: 8,
    5: 8,
    6: 6,
    0: 5
  },
  addresses: {
    3: [{
      addr: '8021 SW 118th St, Pinecrest',
      lat: 25.6660,
      lng: -80.3305
    }, {
      addr: '8150 SW 124th St, Pinecrest',
      lat: 25.6590,
      lng: -80.3290
    }, {
      addr: '7965 SW 120th St, Pinecrest',
      lat: 25.6630,
      lng: -80.3260
    }, {
      addr: '8320 SW 116th St, Pinecrest',
      lat: 25.6680,
      lng: -80.3245
    }, {
      addr: '8085 SW 122nd St, Pinecrest',
      lat: 25.6610,
      lng: -80.3200
    }, {
      addr: '7890 SW 128th St, Pinecrest',
      lat: 25.6550,
      lng: -80.3280
    }, {
      addr: '8240 SW 130th St, Pinecrest',
      lat: 25.6530,
      lng: -80.3195
    }, {
      addr: '8450 SW 114th St, Pinecrest',
      lat: 25.6700,
      lng: -80.3155
    }],
    4: [{
      addr: '7720 SW 136th St, Pinecrest',
      lat: 25.6460,
      lng: -80.3310
    }, {
      addr: '8100 SW 140th St, Pinecrest',
      lat: 25.6420,
      lng: -80.3265
    }, {
      addr: '8350 SW 132nd St, Pinecrest',
      lat: 25.6500,
      lng: -80.3170
    }, {
      addr: '7980 SW 142nd St, Pinecrest',
      lat: 25.6400,
      lng: -80.3215
    }, {
      addr: '8210 SW 138th St, Pinecrest',
      lat: 25.6440,
      lng: -80.3140
    }, {
      addr: '8480 SW 134th St, Pinecrest',
      lat: 25.6480,
      lng: -80.3100
    }, {
      addr: '7850 SW 144th St, Pinecrest',
      lat: 25.6380,
      lng: -80.3250
    }, {
      addr: '8060 SW 146th St, Pinecrest',
      lat: 25.6360,
      lng: -80.3180
    }],
    5: [{
      addr: '7680 SW 152nd St, Pinecrest',
      lat: 25.6300,
      lng: -80.3320
    }, {
      addr: '8030 SW 148th St, Pinecrest',
      lat: 25.6340,
      lng: -80.3270
    }, {
      addr: '8190 SW 150th St, Pinecrest',
      lat: 25.6320,
      lng: -80.3225
    }, {
      addr: '8420 SW 154th St, Pinecrest',
      lat: 25.6280,
      lng: -80.3185
    }, {
      addr: '7870 SW 156th St, Pinecrest',
      lat: 25.6260,
      lng: -80.3250
    }, {
      addr: '8270 SW 158th St, Pinecrest',
      lat: 25.6240,
      lng: -80.3160
    }, {
      addr: '7760 SW 162nd St, Pinecrest',
      lat: 25.6200,
      lng: -80.3300
    }, {
      addr: '8110 SW 160th St, Pinecrest',
      lat: 25.6220,
      lng: -80.3220
    }],
    6: [{
      addr: '11200 S Dixie Hwy, Pinecrest',
      lat: 25.6580,
      lng: -80.3080
    }, {
      addr: '11350 S Dixie Hwy, Pinecrest',
      lat: 25.6560,
      lng: -80.3075
    }, {
      addr: '11480 S Dixie Hwy, Pinecrest',
      lat: 25.6540,
      lng: -80.3070
    }, {
      addr: '11620 S Dixie Hwy, Pinecrest',
      lat: 25.6520,
      lng: -80.3065
    }, {
      addr: '11750 S Dixie Hwy, Pinecrest',
      lat: 25.6500,
      lng: -80.3060
    }, {
      addr: '11880 S Dixie Hwy, Pinecrest',
      lat: 25.6480,
      lng: -80.3055
    }],
    0: [{
      addr: '7600 SW 104th St, Pinecrest',
      lat: 25.6760,
      lng: -80.3350
    }, {
      addr: '7730 SW 106th St, Pinecrest',
      lat: 25.6740,
      lng: -80.3320
    }, {
      addr: '7860 SW 108th St, Pinecrest',
      lat: 25.6720,
      lng: -80.3295
    }, {
      addr: '7990 SW 110th St, Pinecrest',
      lat: 25.6700,
      lng: -80.3270
    }, {
      addr: '8120 SW 112th St, Pinecrest',
      lat: 25.6680,
      lng: -80.3240
    }]
  }
}];
const REVIEWS = [{
  id: 1,
  from: 'Carlos N.',
  rating: 5,
  text: {
    en: 'Took my whole route for a week. Pools were spotless when I got back.',
    pt: 'Cobriu minha rota inteira por uma semana. As piscinas estavam impecáveis quando voltei.',
    es: 'Cubrió toda mi ruta por una semana. Las piscinas estaban impecables al volver.'
  },
  when: {
    en: '2 weeks ago',
    pt: '2 semanas atrás',
    es: 'hace 2 semanas'
  }
}, {
  id: 2,
  from: 'Patrícia L.',
  rating: 5,
  text: {
    en: 'Super communicative. Pictures every day. Will hire again.',
    pt: 'Super comunicativo. Fotos todos os dias. Contrato de novo.',
    es: 'Muy comunicativo. Fotos cada día. Volveré a contratar.'
  },
  when: {
    en: '1 month ago',
    pt: '1 mês atrás',
    es: 'hace 1 mes'
  }
}, {
  id: 3,
  from: 'Sandra R.',
  rating: 4,
  text: {
    en: 'Solid work, just had to remind about the gate code once.',
    pt: 'Bom trabalho, só tive que lembrar do código do portão uma vez.',
    es: 'Buen trabajo, solo tuve que recordar el código del portón una vez.'
  },
  when: {
    en: '2 months ago',
    pt: '2 meses atrás',
    es: 'hace 2 meses'
  }
}];
const NOTIFICATIONS = [{
  id: 1,
  kind: 'job',
  unread: true,
  whenKey: 'justNow',
  titleKey: 'notif1Title',
  bodyKey: 'notif1Body',
  who: null
}, {
  id: 2,
  kind: 'message',
  unread: true,
  whenKey: 'min8',
  titleKey: 'notif2Title',
  bodyKey: null,
  who: 'Marcos T.',
  quote: {
    en: '"Available Tuesday morning?"',
    pt: '"Disponível terça de manhã?"',
    es: '"¿Disponible martes en la mañana?"'
  }
}, {
  id: 3,
  kind: 'apply',
  unread: false,
  whenKey: 'hours2',
  titleKey: 'notif3Title',
  bodyKey: 'notif3Body',
  who: 'Patrícia L.'
}, {
  id: 4,
  kind: 'rating',
  unread: false,
  whenKey: 'yesterday',
  titleKey: 'notif4Title',
  bodyKey: 'notif4Body',
  who: 'Carlos N.'
}];
const MY_POSTS = [{
  id: 1,
  type: 'quickpool',
  title: {
    en: 'Vacation cover — 6 pools',
    pt: 'Cobrir férias — 6 piscinas',
    es: 'Cobertura vacaciones — 6 piscinas'
  },
  loc: 'Boca Raton',
  date: {
    en: 'May 22',
    pt: '22 mai',
    es: '22 may'
  },
  status: 'open',
  applicants: [{
    id: 1,
    name: 'Marcos T.',
    rating: 4.9,
    jobs: 48,
    status: 'pending',
    when: '2h'
  }, {
    id: 2,
    name: 'Sandra R.',
    rating: 4.7,
    jobs: 32,
    status: 'pending',
    when: '3h'
  }, {
    id: 3,
    name: 'Diego A.',
    rating: 5.0,
    jobs: 64,
    status: 'pending',
    when: '5h'
  }]
}, {
  id: 2,
  type: 'vacation',
  title: {
    en: 'June vacation — 16 pools/day',
    pt: 'Férias junho — 16 piscinas/dia',
    es: 'Vacaciones junio — 16 piscinas/día'
  },
  loc: 'Weston',
  date: {
    en: 'May 20',
    pt: '20 mai',
    es: '20 may'
  },
  status: 'open',
  days: [3, 4, 5, 6, 10, 11],
  bookedDays: [3, 4],
  poolsPerDay: 16,
  pricePerPool: 22,
  applicants: [{
    id: 1,
    name: 'Carlos N.',
    rating: 4.8,
    jobs: 22,
    status: 'accepted',
    when: '1d',
    selectedDays: [3, 4]
  }, {
    id: 2,
    name: 'Patrícia L.',
    rating: 5.0,
    jobs: 41,
    status: 'pending',
    when: '1d',
    selectedDays: [5, 6, 10, 11]
  }, {
    id: 3,
    name: 'Rafael S.',
    rating: 4.9,
    jobs: 142,
    status: 'rejected',
    when: '2d',
    selectedDays: [3, 5, 10]
  }, {
    id: 4,
    name: 'Anderson L.',
    rating: 5.0,
    jobs: 64,
    status: 'pending',
    when: '2d',
    selectedDays: [10, 11]
  }]
}, {
  id: 3,
  type: 'marketplace',
  title: {
    en: 'Pentair pump — $680',
    pt: 'Bomba Pentair — R$3.400',
    es: 'Bomba Pentair — $680'
  },
  loc: 'Coral Springs',
  date: {
    en: 'May 15',
    pt: '15 mai',
    es: '15 may'
  },
  status: 'open',
  applicants: [{
    id: 1,
    name: 'Joana P.',
    rating: 4.8,
    jobs: 88,
    status: 'pending',
    when: '3d'
  }, {
    id: 2,
    name: 'Carla M.',
    rating: 4.7,
    jobs: 51,
    status: 'pending',
    when: '4d'
  }]
}, {
  id: 4,
  type: 'vacation',
  title: {
    en: 'August vacation — 14 pools/day',
    pt: 'Férias agosto — 14 piscinas/dia',
    es: 'Vacaciones agosto — 14 piscinas/día'
  },
  loc: 'Coral Springs',
  date: {
    en: 'May 25',
    pt: '25 mai',
    es: '25 may'
  },
  status: 'open',
  days: [18, 19, 20],
  bookedDays: [],
  poolsPerDay: 14,
  pricePerPool: 20,
  applicants: [{
    id: 1,
    name: 'Gabriel M.',
    rating: 4.8,
    jobs: 19,
    status: 'pending',
    when: '4h',
    selectedDays: [18, 19, 20]
  }]
}, {
  id: 5,
  type: 'hiring',
  title: {
    en: 'Pool Service Technician',
    pt: 'Técnico de Manutenção de Piscinas',
    es: 'Técnico de Servicio de Piscinas'
  },
  loc: 'Weston, FL',
  date: {
    en: 'May 24',
    pt: '24 mai',
    es: '24 may'
  },
  status: 'open',
  pay: {
    en: '$18–22/hr + truck',
    pt: 'R$28–35/h + veículo',
    es: '$18–22/h + camioneta'
  },
  applicants: [{
    id: 1,
    name: 'Ricardo M.',
    rating: 4.9,
    jobs: 62,
    status: 'accepted',
    when: '1h',
    age: 32,
    region: 'Hialeah, FL',
    hasCar: true,
    hasLicense: true,
    hasEquipment: true,
    equipment: {
      en: ['Pentair IntelliFlo pump', 'Pool vacuum robot', 'Digital test kit', 'Full chemical kit'],
      pt: ['Bomba Pentair IntelliFlo', 'Robô aspirador', 'Kit de teste digital', 'Kit de produtos químicos'],
      es: ['Bomba Pentair IntelliFlo', 'Robot aspiradora', 'Kit de prueba digital', 'Kit de químicos']
    },
    note: {
      en: 'CPO certified. Available immediately. References available upon request.',
      pt: 'Certificado CPO. Disponível imediatamente. Referências disponíveis.',
      es: 'Certificado CPO. Disponible de inmediato. Referencias disponibles.'
    },
    interview: {
      day: {
        en: 'Thursday',
        pt: 'Quinta',
        es: 'Jueves'
      },
      time: '10:00 AM'
    },
    experience: [{
      company: 'AquaPro Services',
      role: {
        en: 'Senior Pool Technician',
        pt: 'Técnico Sênior de Piscinas',
        es: 'Técnico Senior de Piscinas'
      },
      duration: {
        en: '2 yrs 4 mo',
        pt: '2 a. 4 m.',
        es: '2 a. 4 m.'
      },
      desc: {
        en: 'Managed a 45-pool residential route in Doral. Responsible for chemical balancing, equipment repair and client communication.',
        pt: 'Gerenciei rota de 45 piscinas no Doral. Balanceamento químico, reparos de equipamentos e atendimento ao cliente.',
        es: 'Gestioné ruta de 45 piscinas en Doral. Balance químico, reparaciones de equipo y atención al cliente.'
      }
    }, {
      company: 'BluClear Pools',
      role: {
        en: 'Pool Tech (Part-time)',
        pt: 'Técnico de Piscinas (Meio período)',
        es: 'Técnico de Piscinas (Medio tiempo)'
      },
      duration: {
        en: '8 mo',
        pt: '8 m.',
        es: '8 m.'
      },
      desc: {
        en: 'Assisted senior techs on commercial accounts. Trained on Hayward and Pentair systems.',
        pt: 'Auxiliei técnicos sênior em contas comerciais. Treinamento em sistemas Hayward e Pentair.',
        es: 'Asistí a técnicos senior en cuentas comerciales. Formación en sistemas Hayward y Pentair.'
      }
    }]
  }, {
    id: 2,
    name: 'Diego T.',
    rating: 4.6,
    jobs: 24,
    status: 'pending',
    when: '3h',
    age: 27,
    region: 'Doral, FL',
    hasCar: true,
    hasLicense: true,
    hasEquipment: true,
    equipment: {
      en: ['Pool vacuum', 'Chemical test kit'],
      pt: ['Aspirador de piscina', 'Kit de teste químico'],
      es: ['Aspiradora de piscina', 'Kit de prueba química']
    },
    note: {
      en: 'Seeking full-time. Flexible schedule, available Mon–Sat.',
      pt: 'Busca período integral. Horário flexível, disponível Seg–Sáb.',
      es: 'Busca tiempo completo. Horario flexible, disponible Lun–Sáb.'
    },
    interview: null,
    experience: [{
      company: 'Sunshine Pool Care',
      role: {
        en: 'Pool Technician',
        pt: 'Técnico de Piscinas',
        es: 'Técnico de Piscinas'
      },
      duration: {
        en: '1 yr 8 mo',
        pt: '1 a. 8 m.',
        es: '1 a. 8 m.'
      },
      desc: {
        en: 'Weekly maintenance of 18-pool residential route in Doral. Handled water chemistry and minor repairs.',
        pt: 'Manutenção semanal de rota de 18 piscinas em Doral. Química da água e pequenos reparos.',
        es: 'Mantenimiento semanal de ruta de 18 piscinas en Doral. Química del agua y reparaciones menores.'
      }
    }]
  }, {
    id: 3,
    name: 'Ana K.',
    rating: 4.8,
    jobs: 11,
    status: 'rejected',
    when: '1d',
    age: 23,
    region: 'Miami Lakes, FL',
    hasCar: false,
    hasLicense: false,
    hasEquipment: false,
    equipment: null,
    note: {
      en: 'Entry level, motivated to learn. Willing to obtain CDL.',
      pt: 'Iniciante, motivada para aprender. Disposta a tirar habilitação.',
      es: 'Nivel inicial, motivada para aprender. Dispuesta a obtener licencia.'
    },
    interview: null,
    experience: [{
      company: 'AquaClean Co.',
      role: {
        en: 'Pool Maintenance Assistant',
        pt: 'Auxiliar de Manutenção',
        es: 'Auxiliar de Mantenimiento'
      },
      duration: {
        en: '6 mo',
        pt: '6 m.',
        es: '6 m.'
      },
      desc: {
        en: 'Assisted lead technician on a 10-pool condo route. Learned water chemistry basics and skimming/vacuuming procedures.',
        pt: 'Auxiliei técnico principal em rota de 10 piscinas em condomínio. Aprendi química básica e procedimentos de aspiração.',
        es: 'Asistí al técnico principal en ruta de 10 piscinas en condominio. Aprendí química básica y procedimientos de aspiración.'
      }
    }]
  }]
}];
const CHAT_CONVERSATIONS = [{
  id: 1,
  name: 'Marcos Tavares',
  lastMsg: {
    en: '"Available Tuesday morning?"',
    pt: '"Disponível terça de manhã?"',
    es: '"¿Disponible martes en la mañana?"'
  },
  time: '10:05',
  unread: 1,
  context: {
    en: 'Vacation cover — 6 pools',
    pt: 'Cobrir férias — 6 piscinas',
    es: 'Cobertura vacaciones — 6 piscinas'
  }
}, {
  id: 2,
  name: 'Sandra Reyes',
  lastMsg: {
    en: 'Is the pump still available?',
    pt: 'A bomba ainda está disponível?',
    es: '¿La bomba sigue disponible?'
  },
  time: {
    en: 'Yesterday',
    pt: 'Ontem',
    es: 'Ayer'
  },
  unread: 0,
  context: {
    en: 'Pentair pump — $680',
    pt: 'Bomba Pentair — R$3.400',
    es: 'Bomba Pentair — $680'
  }
}, {
  id: 3,
  name: 'Aqua Solutions LLC',
  lastMsg: {
    en: 'Interview Thursday at 10am',
    pt: 'Entrevista quinta às 10h',
    es: 'Entrevista el jueves a las 10am'
  },
  time: {
    en: 'Mon',
    pt: 'Seg',
    es: 'Lun'
  },
  unread: 0,
  context: {
    en: 'Pool Service Technician',
    pt: 'Técnico de Manutenção',
    es: 'Técnico de Servicio'
  }
}, {
  id: 4,
  name: 'Ricardo M.',
  type: 'hiring',
  lastMsg: {
    en: 'Thursday 10am works perfectly ✓',
    pt: 'Quinta às 10h me serve perfeitamente ✓',
    es: 'El jueves a las 10am me viene perfecto ✓'
  },
  time: {
    en: 'Today',
    pt: 'Hoje',
    es: 'Hoy'
  },
  unread: 0,
  context: {
    en: 'Pool Service Technician — Weston',
    pt: 'Técnico de Piscinas — Weston',
    es: 'Técnico de Servicio — Weston'
  }
}];

// Helper: read i18n field from string or {en,pt,es} object
function tr(v, lang = 'en') {
  if (v == null) return '';
  if (typeof v === 'string' || typeof v === 'number') return v;
  return v[lang] || v.en || '';
}
const WALLET_DATA = {
  balance: 490,
  weekEarnings: 340,
  monthEarnings: 1240,
  pending: [{
    id: 1,
    title: {
      en: 'Vacation cover — 6 pools',
      pt: 'Cobrir férias — 6 piscinas',
      es: 'Cobertura vacaciones — 6 piscinas'
    },
    client: 'Marcos T.',
    amount: 270,
    date: {
      en: 'Today',
      pt: 'Hoje',
      es: 'Hoy'
    }
  }, {
    id: 2,
    title: {
      en: 'Weekly route assist',
      pt: 'Assistência semanal',
      es: 'Asistencia semanal'
    },
    client: 'Diego A.',
    amount: 220,
    date: {
      en: 'Yesterday',
      pt: 'Ontem',
      es: 'Ayer'
    }
  }],
  history: [{
    id: 1,
    title: {
      en: 'Equipment swap',
      pt: 'Troca de equipamento',
      es: 'Cambio de equipo'
    },
    amount: 120,
    date: {
      en: 'May 20',
      pt: '20 mai',
      es: '20 may'
    },
    type: 'credit'
  }, {
    id: 2,
    title: {
      en: 'One-off cleaning',
      pt: 'Limpeza pontual',
      es: 'Limpieza única'
    },
    amount: 85,
    date: {
      en: 'May 18',
      pt: '18 mai',
      es: '18 may'
    },
    type: 'credit'
  }, {
    id: 3,
    title: {
      en: 'Withdrawal',
      pt: 'Saque',
      es: 'Retiro'
    },
    amount: 500,
    date: {
      en: 'May 15',
      pt: '15 mai',
      es: '15 may'
    },
    type: 'debit'
  }, {
    id: 4,
    title: {
      en: 'Weekly route',
      pt: 'Rota semanal',
      es: 'Ruta semanal'
    },
    amount: 220,
    date: {
      en: 'May 12',
      pt: '12 mai',
      es: '12 may'
    },
    type: 'credit'
  }, {
    id: 5,
    title: {
      en: 'Vacation cover',
      pt: 'Cobrir férias',
      es: 'Cobertura vacaciones'
    },
    amount: 270,
    date: {
      en: 'May 8',
      pt: '8 mai',
      es: '8 may'
    },
    type: 'credit'
  }]
};
const MY_APPLICATIONS = [];
Object.assign(window, {
  STRINGS,
  FEED,
  FEATURED,
  EQUIPMENT,
  POOL_ROUTES,
  SINGLE_POOLS,
  QUICK_POOLS,
  HIRING,
  TECHS,
  VACATIONS_POSTED,
  VACATION_LISTINGS,
  VACATIONS_APPLIED,
  REVIEWS,
  NOTIFICATIONS,
  MY_POSTS,
  CHAT_CONVERSATIONS,
  tr,
  WALLET_DATA,
  MY_APPLICATIONS
});