// Anonymous usage counts for Nous. Once a day the app sends tallies such as {"topic:scratch-fire": 3}; this Worker adds
// them to per-day totals. It accepts no identifiers and stores none: no IP address, user agent, cookie or device id,
// and logging is off (wrangler.jsonc), so a request leaves nothing behind but the sums.
const KEY = /^(subject|topic|lesson|course):[a-z0-9-]{1,64}$/;
const MAX_KEYS = 300;
const MAX_PER_KEY = 100; // one device's honest day never gets near this; it limits how far one request can skew a total
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });
    if (request.method === 'POST' && url.pathname === '/count') return count(request, env);
    if (request.method === 'GET' && url.pathname === '/stats') return stats(url, env);
    return new Response('Not found', { status: 404, headers: CORS });
  },
};

async function count(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'bad json' }, 400);
  }
  const counts = body && typeof body.counts === 'object' ? body.counts : null;
  if (!counts) return json({ error: 'no counts' }, 400);
  const rows = Object.entries(counts)
    .filter(([k, n]) => KEY.test(k) && Number.isInteger(n) && n > 0)
    .slice(0, MAX_KEYS);
  if (rows.length) {
    const day = new Date().toISOString().slice(0, 10);
    const upsert = env.DB.prepare(
      'INSERT INTO counts (day, key, n) VALUES (?1, ?2, ?3) ON CONFLICT(day, key) DO UPDATE SET n = n + excluded.n');
    await env.DB.batch(rows.map(([k, n]) => upsert.bind(day, k, Math.min(n, MAX_PER_KEY))));
  }
  return json({ ok: true, kept: rows.length });
}

async function stats(url, env) {
  if (!env.STATS_KEY || url.searchParams.get('key') !== env.STATS_KEY) return new Response('Forbidden', { status: 403 });
  const days = Math.min(365, Math.max(1, parseInt(url.searchParams.get('days') || '30', 10) || 30));
  const since = new Date(Date.now() - days * 864e5).toISOString().slice(0, 10);
  const { results } = await env.DB.prepare(
    'SELECT key, SUM(n) AS n FROM counts WHERE day >= ?1 GROUP BY key ORDER BY n DESC').bind(since).all();
  if (url.searchParams.get('format') === 'json') return json({ since, results });
  const groups = {};
  for (const r of results) {
    const [kind, id] = r.key.split(':');
    (groups[kind] ||= []).push([id, r.n]);
  }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const sections = ['subject', 'topic', 'course', 'lesson'].filter((k) => groups[k]).map((k) =>
    `<h2>${k}s</h2><table>${groups[k].map(([id, n]) => `<tr><td>${esc(id)}</td><td>${n}</td></tr>`).join('')}</table>`);
  const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Nous usage</title><style>body{font:15px system-ui;margin:16px;max-width:640px}table{border-collapse:collapse;width:100%}
td{padding:4px 6px;border-bottom:1px solid #ddd}td:last-child{text-align:right;font-variant-numeric:tabular-nums}h2{margin-top:24px}</style>
<h1>Nous usage, last ${days} days</h1><p>Since ${since}. Anonymous totals only. <a href="?key=${esc(url.searchParams.get('key'))}&days=7">7 days</a>
· <a href="?key=${esc(url.searchParams.get('key'))}&days=90">90 days</a></p>${sections.join('') || '<p>No counts yet.</p>'}`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json', ...CORS } });
}
