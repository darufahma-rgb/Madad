// Admin → Pemakaian AI: siapa yang memakai AI dan menghabiskan biaya, dari tabel ai_cost_log (satu baris per panggilan model).
// Dihitung di server; browser admin hanya menerima ringkasan per member + aktivitas terbaru.
import { sbConfig, sbHeaders } from './member.js';
import { modelPrices, priceOf } from './analytics.js';

const RANGES = { '1h': 3600e3, today: null, '24h': 86400e3, '7d': 7 * 86400e3, '30d': 30 * 86400e3 };
const FEED_SIZE = 300;
const MAX_ROWS = 50000;

const get = async (path) => {
  const { url, key } = sbConfig();
  const r = await fetch(`${url}/rest/v1/${path}`, { headers: sbHeaders(key) });
  if (!r.ok) return null;
  return r.json();
};

const fetchAll = async (path) => {
  const rows = [];
  for (let offset = 0; offset < MAX_ROWS; offset += 1000) {
    const page = await get(`${path}&limit=1000&offset=${offset}`);
    if (!page) return offset ? rows : null;
    rows.push(...page);
    if (page.length < 1000) break;
  }
  return rows;
};

// Awal hari ini menurut waktu Kairo (dianggap UTC+3; selisih satu jam saat musim dingin tidak masalah untuk tampilan admin).
const startOfTodayCairo = () => {
  const now = new Date(Date.now() + 3 * 3600e3);
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - 3 * 3600e3);
};

// code: bila diisi, daftar aktivitas hanya berisi panggilan member itu (ringkasan tetap untuk semua orang).
export async function buildAiUsage(range, code) {
  const r = Object.prototype.hasOwnProperty.call(RANGES, range) ? range : 'today';
  const since = r === 'today' ? startOfTodayCairo() : new Date(Date.now() - RANGES[r]);
  const rows = await fetchAll(
    `ai_cost_log?select=id,at,member_code,kind,detail,model,cost_usd,tokens_in,tokens_out,estimated&at=gte.${since.toISOString()}&order=at.desc`);
  if (rows === null) return { error: 'Tabel ai_cost_log belum ada. Jalankan migrations/ai_cost_log.sql di Supabase.' };

  // Panggilan yang terputus tidak punya biaya pasti dari OpenRouter → hitung dari token × harga model.
  const prices = rows.some(x => x.cost_usd === null) ? await modelPrices() : {};
  const costOf = (x) => {
    if (x.cost_usd !== null && x.cost_usd !== undefined) return Number(x.cost_usd) || 0;
    const p = priceOf(prices, x.model) || { in: 3, out: 15 };
    return ((x.tokens_in || 0) * p.in + (x.tokens_out || 0) * p.out) / 1e6;
  };

  const users = new Map();
  let total = 0;
  for (const x of rows) {
    const c = costOf(x);
    x._cost = c;
    total += c;
    let u = users.get(x.member_code);
    if (!u) users.set(x.member_code, u = { code: x.member_code, cost: 0, calls: 0, tokens: 0, byKind: {}, lastAt: x.at, firstAt: x.at });
    u.cost += c;
    u.calls++;
    u.tokens += (x.tokens_in || 0) + (x.tokens_out || 0);
    u.byKind[x.kind] = (u.byKind[x.kind] || 0) + c;
    if (x.at > u.lastAt) u.lastAt = x.at;
    if (x.at < u.firstAt) u.firstAt = x.at;
  }

  // Nama, email, tier, dan status langganan untuk member yang muncul.
  const codes = [...users.keys()].filter(c => c && c !== 'ADMIN' && c !== 'system');
  const info = {};
  const nowIso = new Date().toISOString();
  for (let i = 0; i < codes.length; i += 80) {
    const list = codes.slice(i, i + 80).map(c => `"${String(c).replace(/"/g, '')}"`).join(',');
    const [members, subs, imtihan] = await Promise.all([
      get(`members?select=code,name,email,tier&code=in.(${list})`),
      get(`ai_subscriptions?select=member_code,expires_at,status&member_code=in.(${list})&status=eq.active`),
      get(`payment_checkouts?select=member_code&plan=eq.imtihan&status=eq.paid&member_code=in.(${list})&paid_at=gte.${new Date(Date.now() - 120 * 86400e3).toISOString()}`),
    ]);
    for (const m of members || []) info[m.code] = { name: m.name || '', email: m.email || '', tier: m.tier || 'library' };
    for (const s of subs || []) if (!s.expires_at || s.expires_at > nowIso) (info[s.member_code] ||= {}).ai = true;
    for (const p of imtihan || []) (info[p.member_code] ||= {}).imtihan = true;
  }

  const round = (n) => +n.toFixed(5);
  const top = [...users.values()]
    .map(u => ({ ...u, ...(info[u.code] || {}), cost: round(u.cost), byKind: Object.fromEntries(Object.entries(u.byKind).map(([k, v]) => [k, round(v)])) }))
    .sort((a, b) => b.cost - a.cost);

  const focus = code ? String(code) : '';
  const feed = (focus ? rows.filter(x => x.member_code === focus) : rows).slice(0, FEED_SIZE).map(x => ({
    id: x.id, at: x.at, code: x.member_code, name: info[x.member_code]?.name || '',
    kind: x.kind, detail: x.detail, model: x.model, cost: round(x._cost),
    tokens_in: x.tokens_in, tokens_out: x.tokens_out, estimated: x.estimated,
  }));

  return {
    range: r, since: since.toISOString(), generatedAt: nowIso,
    total: round(total), calls: rows.length, users: top.filter(u => u.code !== 'ADMIN' && u.code !== 'system').length,
    capped: rows.length >= MAX_ROWS, top, feed,
  };
}
