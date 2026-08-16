// api/share.js — Vercel serverless function that serves proper Open Graph
// tags (title + real item photo) for a specific listing/job/handoff/vacation
// before redirecting into the SPA. The app itself is a client-rendered
// single-page app with a fixed index.html, so link-preview crawlers
// (WhatsApp, iMessage, Facebook, etc.) never see per-item content — they
// don't execute JS, they just read whatever <meta> tags come back on the
// first response. This endpoint is a small server-rendered detour just for
// that: it fetches the item from Supabase, prints the right meta tags, and
// immediately sends real visitors on into the app via the same hash routes
// already used elsewhere (#market?listing=, #work?job=, etc).

const SB_URL = 'https://xiszfqghizqzlwyrfjol.supabase.co';
const SB_KEY = 'sb_publishable_2C7PFtLNiXt3IziFnMVb4w_1YGfBqyX';
const APP_URL = 'https://poolguyx.com';
const DEFAULT_IMAGE = `${APP_URL}/icone.png`;

const TYPES = {
  market:  { table: 'marketplace',    hash: id => `#market?listing=${id}` },
  job:     { table: 'jobs',           hash: id => `#work?job=${id}` },
  handoff: { table: 'pool_handoffs',  hash: id => `#work?handoff=${id}` },
  vac:     { table: 'vacations',      hash: id => `#work?vac=${id}` },
};

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}

async function fetchItem(table, id) {
  const res = await fetch(`${SB_URL}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}&select=*`, {
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
  });
  if (!res.ok) return null;
  const rows = await res.json();
  return rows && rows[0] ? rows[0] : null;
}

function pickImage(row) {
  if (!row) return null;
  const urls = row.photo_urls;
  if (Array.isArray(urls) && urls.length > 0) return urls[0];
  if (row.photo_url) return row.photo_url;
  return null;
}

function pickTitleDesc(type, row) {
  if (!row) return { title: 'PoolGuyX', desc: 'Florida Pool Network' };
  if (type === 'market') {
    return { title: row.name || 'PoolGuyX', desc: row.description || (row.price ? `$${row.price}` : '') };
  }
  if (type === 'job') {
    return { title: row.author || 'PoolGuyX', desc: row.role || '' };
  }
  if (type === 'handoff') {
    return { title: row.poster_name ? `${row.poster_name} — Repasse de Piscina` : 'Repasse de Piscina',
      desc: row.description || (row.price_per_pool ? `$${row.price_per_pool}/piscina` : '') };
  }
  if (type === 'vac') {
    return { title: row.author ? `${row.author} — Férias para cobrir` : 'Férias para cobrir', desc: row.note || '' };
  }
  return { title: 'PoolGuyX', desc: 'Florida Pool Network' };
}

module.exports = async (req, res) => {
  try {
    const { type, id } = req.query;
    const cfg = TYPES[type];
    if (!cfg || !id) {
      res.writeHead(302, { Location: APP_URL });
      res.end();
      return;
    }
    const row = await fetchItem(cfg.table, id);
    const { title, desc } = pickTitleDesc(type, row);
    const image = pickImage(row) || DEFAULT_IMAGE;
    const redirectUrl = `${APP_URL}/${cfg.hash(id)}`;

    const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<title>${escapeHtml(title)}</title>
<meta property="og:title" content="${escapeHtml(title)}"/>
<meta property="og:description" content="${escapeHtml(desc)}"/>
<meta property="og:image" content="${escapeHtml(image)}"/>
<meta property="og:url" content="${escapeHtml(redirectUrl)}"/>
<meta property="og:type" content="website"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${escapeHtml(title)}"/>
<meta name="twitter:description" content="${escapeHtml(desc)}"/>
<meta name="twitter:image" content="${escapeHtml(image)}"/>
<meta http-equiv="refresh" content="0;url=${escapeHtml(redirectUrl)}"/>
<script>location.replace(${JSON.stringify(redirectUrl)});</script>
</head>
<body>
<p>PoolGuyX — <a href="${escapeHtml(redirectUrl)}">${escapeHtml(title)}</a></p>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300' });
    res.end(html);
  } catch (e) {
    res.writeHead(302, { Location: APP_URL });
    res.end();
  }
};
