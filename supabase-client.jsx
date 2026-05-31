// ── Supabase client ───────────────────────────────────────────
(function () {
  var URL = 'https://xiszfqghizqzlwyrfjol.supabase.co';
  var KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhpc3pmcWdoaXpxemx3eXJmam9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNzM3NDMsImV4cCI6MjA5NTc0OTc0M30.BeRc6j0XnJteUSaA7nAjOWCS_bZ9rcBlGvw54cXcmeg';
  try {
    window.sb = window.supabase.createClient(URL, KEY);
    console.log('[PoolGuyPro] Supabase conectado ✓');
  } catch (e) {
    console.error('[PoolGuyPro] Supabase erro:', e.message);
    window.sb = null;
  }
})();
