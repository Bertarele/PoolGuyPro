// ── Firebase init + helpers ───────────────────────────────────
(function () {
  var cfg = window.FIREBASE_CONFIG;
  if (!cfg || !cfg.apiKey || cfg.apiKey === 'COLE_SUA_API_KEY_AQUI') {
    console.warn('[PoolGuyPro] Firebase não configurado — usando dados locais. Edite firebase-config.jsx para ativar.');
    window.db = null;
    window.fsNow = function () { return new Date().toISOString(); };
    return;
  }
  try {
    var app = firebase.initializeApp(cfg);
    window.db = firebase.firestore(app);
    window.fsNow = function () { return firebase.firestore.FieldValue.serverTimestamp(); };
    console.log('[PoolGuyPro] Firebase conectado ✓ —', cfg.projectId);
  } catch (e) {
    console.error('[PoolGuyPro] Firebase erro:', e.message);
    window.db = null;
    window.fsNow = function () { return new Date().toISOString(); };
  }
})();
