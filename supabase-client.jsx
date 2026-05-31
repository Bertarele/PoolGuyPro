// ── Supabase client ───────────────────────────────────────────
(function () {
  var URL = 'https://xiszfqghizqzlwyrfjol.supabase.co';
  var KEY = 'sb_publishable_2C7PFtLNiXt3IziFnMVb4w_1YGfBqyX';
  try {
    window.sb = window.supabase.createClient(URL, KEY);
    console.log('[PoolGuyPro] Supabase conectado ✓');
  } catch (e) {
    console.error('[PoolGuyPro] Supabase erro:', e.message);
    window.sb = null;
  }
})();
