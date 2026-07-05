// ── Supabase client ───────────────────────────────────────────
(function () {
  var SUPA_URL = 'https://xiszfqghizqzlwyrfjol.supabase.co';
  var SUPA_KEY = 'sb_publishable_2C7PFtLNiXt3IziFnMVb4w_1YGfBqyX';

  function init() {
    try {
      var lib = window.supabase || (window.Supabase && window.Supabase.createClient ? window.Supabase : null);
      if (!lib) { console.error('[PoolGuyPro] supabase.js not loaded'); window.sb = null; return; }
      window.sb = lib.createClient(SUPA_URL, SUPA_KEY);
      console.log('[PoolGuyPro] Supabase conectado ✓');
    } catch (e) {
      console.error('[PoolGuyPro] Supabase erro:', e.message);
      window.sb = null;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
