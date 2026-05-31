// ── Supabase client ───────────────────────────────────────────
(function () {
  var SUPA_URL = 'https://xiszfqghizqzlwyrfjol.supabase.co';
  var SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhpc3pmcWdoaXpxemx3eXJmam9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNzM3NDMsImV4cCI6MjA5NTc0OTc0M30.BeRc6j0XnJteUSaA7nAjOWCS_bZ9rcBlGvw54cXcmeg';

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
