// ============================================================================
// admin-user — Edge Function para operações privilegiadas do painel admin
//
// Substitui o uso da service_role key no navegador (admin.html).
// A chave fica SOMENTE aqui no servidor (env var SUPABASE_SERVICE_ROLE_KEY).
// Toda chamada é verificada: só quem tem profiles.role = 'admin' pode agir.
//
// Ações:
//   { action: 'get',    user_id }  -> lê metadados de auth do usuário
//   { action: 'delete', user_id }  -> deleta a conta de auth (revoga sessões)
// ============================================================================

const SB_URL = Deno.env.get('SUPABASE_URL')!;
const SB_SRK = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors },
  });
}

const srkHeaders = {
  'apikey': SB_SRK,
  'Authorization': `Bearer ${SB_SRK}`,
  'Content-Type': 'application/json',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  // 1. Extrai o token do chamador
  const authHeader = req.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return json({ error: 'missing token' }, 401);

  // 2. Descobre quem é o chamador (valida o JWT contra o Supabase Auth)
  const meRes = await fetch(`${SB_URL}/auth/v1/user`, {
    headers: { 'apikey': SB_SRK, 'Authorization': `Bearer ${token}` },
  });
  if (!meRes.ok) return json({ error: 'invalid token' }, 401);
  const me = await meRes.json();
  const callerId = me?.id;
  if (!callerId) return json({ error: 'invalid token' }, 401);

  // 3. Confirma que o chamador é admin (checagem no servidor, à prova de fraude)
  const profRes = await fetch(
    `${SB_URL}/rest/v1/profiles?select=role&id=eq.${callerId}&limit=1`,
    { headers: srkHeaders }
  );
  const profArr = await profRes.json();
  const isAdmin = Array.isArray(profArr) && profArr[0]?.role === 'admin';
  if (!isAdmin) return json({ error: 'forbidden — admin only' }, 403);

  // 4. Executa a ação pedida
  let payload: { action?: string; user_id?: string };
  try { payload = await req.json(); } catch { return json({ error: 'bad body' }, 400); }
  const { action, user_id } = payload;
  if (!user_id) return json({ error: 'missing user_id' }, 400);

  if (action === 'get') {
    const r = await fetch(`${SB_URL}/auth/v1/admin/users/${user_id}`, { headers: srkHeaders });
    const data = await r.json().catch(() => ({}));
    return json(data, r.ok ? 200 : r.status);
  }

  if (action === 'delete') {
    const r = await fetch(`${SB_URL}/auth/v1/admin/users/${user_id}`, {
      method: 'DELETE',
      headers: srkHeaders,
    });
    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      return json({ error: e.message || e.msg || `delete failed ${r.status}` }, r.status);
    }
    return json({ ok: true });
  }

  return json({ error: 'unknown action' }, 400);
});
