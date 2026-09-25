// Agregasi analitik admin: dihitung di server supaya browser admin tidak menerima baris mentah.
import { sbConfig, sbHeaders } from './member.js';
import { readSettings } from './settings.js';
import { resolveModels } from './models.js';

const DAY_MS = 86400000;
const dayKey = (d) => new Date(d).toISOString().slice(0, 10);

/* Perkiraan biaya AI per pemakaian (USD) = ukuran rata-rata permintaan × harga model yang sedang dipakai
   untuk tugas itu (harga diambil dari OpenRouter). Ukuran token masih taksiran — cocokkan dengan
   OpenRouter → Activity setelah ada pemakaian nyata. */
const TOKEN_PROFILE = {
  generate: { in: 12000, out: 1500, tasks: ['default', 'study'] }, // separuh ringkasan/peta/tahriri, separuh kartu/kuis/mufradat
  chat:     { in: 6000,  out: 1100, tasks: ['chat'] },    // tutor & syafawi — materi di-cache, jadi input efektif lebih kecil
  prompt:   { in: 5000,  out: 900,  tasks: ['prompt'] },  // Tanya AI — jawaban ±600 kata
  ocr:      { in: 2000,  out: 1000, tasks: ['vision'] },  // satu foto/halaman
  analyze:  { in: 1500,  out: 500,  tasks: ['arabic'] },  // terjemah & i'rab / harakat
  grade:    { in: 2000,  out: 1000, tasks: ['grade'] },   // nilai satu jawaban tahriri
};
const TRANSCRIBE_PER_MINUTE_USD = 0.004; // input audio dihargai berbeda dari teks — taksiran tetap per menit
const FALLBACK_PRICE = { in: 3, out: 15 }; // $ per 1 juta token (Sonnet 4.6) bila harga model tidak ditemukan

let priceCache = { at: 0, map: null };
const PRICE_CACHE_MS = 6 * 3600 * 1000;
const modelPrices = async () => {
  if (priceCache.map && Date.now() - priceCache.at < PRICE_CACHE_MS) return priceCache.map;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const r = await fetch('https://openrouter.ai/api/v1/models', { signal: controller.signal });
    clearTimeout(timer);
    const list = (await r.json())?.data || [];
    const map = {};
    for (const m of list) {
      const pin = Number(m?.pricing?.prompt) * 1e6, pout = Number(m?.pricing?.completion) * 1e6;
      if (m?.id && Number.isFinite(pin) && Number.isFinite(pout)) map[m.id] = { in: pin, out: pout };
    }
    if (Object.keys(map).length) priceCache = { at: Date.now(), map };
  } catch {}
  return priceCache.map || {};
};
// OpenRouter menerima "claude-sonnet-4-6" maupun "claude-sonnet-4.6"; daftar harganya memakai titik.
const priceOf = (prices, id) => prices[id] || prices[String(id).replace(/(\d)-(\d)/g, '$1.$2')] || null;

export const aiCostTable = async () => {
  const [models, prices] = await Promise.all([resolveModels(), modelPrices()]);
  let estimated = false;
  const table = {};
  for (const [kind, p] of Object.entries(TOKEN_PROFILE)) {
    const costs = p.tasks.map(t => {
      const price = priceOf(prices, models[t]);
      if (!price) estimated = true;
      const { in: pin, out: pout } = price || FALLBACK_PRICE;
      return (p.in * pin + p.out * pout) / 1e6;
    });
    table[kind] = +(costs.reduce((a, b) => a + b, 0) / costs.length).toFixed(4);
  }
  table.transcribe = TRANSCRIBE_PER_MINUTE_USD;
  table.create = 0;
  return { table, models, pricesMissing: estimated || !Object.keys(prices).length };
};

const fetchAll = async (path) => {
  const { url, key } = sbConfig();
  const rows = [];
  for (let offset = 0; offset < 20000; offset += 1000) {
    const sep = path.includes('?') ? '&' : '?';
    const r = await fetch(`${url}/rest/v1/${path}${sep}limit=1000&offset=${offset}`, { headers: sbHeaders(key) });
    if (!r.ok) return { rows, missing: true }; // tabel/kolom belum ada → dianggap kosong
    const page = await r.json();
    rows.push(...page);
    if (page.length < 1000) break;
  }
  return { rows, missing: false };
};

// Jumlah baris tanpa mengunduhnya (Content-Range: 0-0/123).
const countRows = async (path) => {
  const { url, key } = sbConfig();
  const r = await fetch(`${url}/rest/v1/${path}&limit=1`, { headers: sbHeaders(key, { Prefer: 'count=exact' }) });
  const total = (r.headers.get('content-range') || '').split('/')[1];
  return r.ok && total && total !== '*' ? parseInt(total, 10) : 0;
};

// Kolom tambahan datang dari migrasi terpisah (ai_partner_v2, free_tier); pakai yang tersedia saja.
const fetchMembers = async () => {
  const base = 'members?select=code,name,email,status,created_at,last_login,auth_user_id';
  for (const extra of [',ai_trial_set_id,tier,free_started_at', ',ai_trial_set_id', '']) {
    const result = await fetchAll(base + extra);
    if (!result.missing) return result;
  }
  return { rows: [], missing: true };
};

// expires_at datang dari migrasi mayar_api.sql.
const fetchSubs = async () => {
  const withExpiry = await fetchAll('ai_subscriptions?select=member_code,status,product_id,created_at,expires_at');
  return withExpiry.missing ? fetchAll('ai_subscriptions?select=member_code,status,product_id,created_at') : withExpiry;
};

const inRange = (iso, from, to) => { const d = dayKey(iso); return d >= from && d <= to; };

export async function buildAdminAnalytics(days) {
  const span = [7, 30, 90].includes(days) ? days : 30;
  const today = new Date();
  const to = dayKey(today);
  const from = dayKey(today.getTime() - (span - 1) * DAY_MS);
  const prevTo = dayKey(today.getTime() - span * DAY_MS);
  const prevFrom = dayKey(today.getTime() - (2 * span - 1) * DAY_MS);
  const dayList = Array.from({ length: span }, (_, i) => dayKey(today.getTime() - (span - 1 - i) * DAY_MS));
  const since = `${prevFrom}T00:00:00Z`;

  const [
    members, payments, subs, usage, sets, presence, activity, profiles, settings,
    notesCount, muqaranahCount, soalPaham, soalBelum, feedback, checkouts, costInfo,
  ] = await Promise.all([
    fetchMembers(),
    fetchAll(`payment_events?select=created_at,event,product_id,product_name,amount,handled_as&created_at=gte.${since}&order=created_at.asc`),
    fetchSubs(),
    fetchAll(`ai_usage?select=member_code,day,kind,count&day=gte.${prevFrom}`),
    fetchAll('study_sets?select=member_code,source_type,created_at'),
    fetchAll('user_presence?select=member_code,days_present'),
    fetchAll('user_maddah_activity?select=maddah_id,opens,prompts_copied'),
    fetchAll('user_profiles?select=profile'),
    readSettings(['mayarLibraryProductId', 'mayarAiProductId']),
    countRows('user_notes?select=member_code'),
    countRows('user_muqaranah?select=member_code'),
    countRows('user_soal_progress?select=member_code&status=eq.paham'),
    countRows('user_soal_progress?select=member_code&status=eq.belum'),
    fetchAll(`ai_feedback?select=member_code,kind,rating,category,note,snippet,model,updated_at&updated_at=gte.${since}&order=updated_at.desc`),
    fetchAll(`payment_checkouts?select=paid_at,library_amount,ai_amount&status=eq.paid&paid_at=gte.${since}&order=paid_at.asc`),
    aiCostTable(),
  ]);
  const AI_COST_USD = costInfo.table;

  /* ── Pemasukan ── */
  const libraryId = (settings.mayarLibraryProductId || '').trim();
  const aiId = (settings.mayarAiProductId || '').trim();
  const classify = (p) => {
    if (p.event !== 'payment.received' || !Number.isFinite(p.amount)) return null;
    if (p.handled_as === 'checkout') return null; // dihitung dari payment_checkouts di bawah
    if (p.handled_as === 'library' || (libraryId && p.product_id === libraryId)) return 'library';
    if (aiId && p.product_id === aiId) return 'ai';
    return 'other';
  };
  const revenueByDay = Object.fromEntries(dayList.map(d => [d, { day: d, library: 0, ai: 0 }]));
  const revenue = { library: 0, ai: 0, transactions: 0, prevTotal: 0, otherCount: 0, otherAmount: 0 };
  for (const p of payments.rows) {
    const kind = classify(p);
    if (!kind) continue;
    if (inRange(p.created_at, prevFrom, prevTo)) { if (kind !== 'other') revenue.prevTotal += p.amount; continue; }
    if (!inRange(p.created_at, from, to)) continue;
    if (kind === 'other') { revenue.otherCount++; revenue.otherAmount += p.amount; continue; }
    revenue[kind] += p.amount;
    revenue.transactions++;
    revenueByDay[dayKey(p.created_at)][kind] += p.amount;
  }
  // Tagihan Mayar API: satu pembayaran bisa berisi Library + AI sekaligus.
  for (const c of checkouts.rows) {
    const lib = c.library_amount || 0;
    const ai = c.ai_amount || 0;
    if (inRange(c.paid_at, prevFrom, prevTo)) { revenue.prevTotal += lib + ai; continue; }
    if (!inRange(c.paid_at, from, to)) continue;
    revenue.library += lib;
    revenue.ai += ai;
    revenue.transactions++;
    revenueByDay[dayKey(c.paid_at)].library += lib;
    revenueByDay[dayKey(c.paid_at)].ai += ai;
  }
  revenue.total = revenue.library + revenue.ai;
  revenue.byDay = Object.values(revenueByDay);
  revenue.checkoutsReady = !checkouts.missing;

  /* ── Member ── */
  const m = members.rows;
  const nameOf = Object.fromEntries(m.map(x => [x.code, x.name || x.email || x.code]));
  const newByDay = Object.fromEntries(dayList.map(d => [d, 0]));
  let newPrev = 0;
  for (const x of m) {
    if (!x.created_at) continue;
    const d = dayKey(x.created_at);
    if (d in newByDay) newByDay[d]++;
    else if (d >= prevFrom && d <= prevTo) newPrev++;
  }
  const loginWithin = (n) => m.filter(x => x.last_login && Date.now() - Date.parse(x.last_login) <= n * DAY_MS).length;
  const presentByDay = Object.fromEntries(dayList.map(d => [d, 0]));
  const activeInWindow = new Set();
  for (const p of presence.rows) {
    for (const d of (Array.isArray(p.days_present) ? p.days_present : [])) {
      if (d in presentByDay) { presentByDay[d]++; activeInWindow.add(p.member_code); }
    }
  }
  const faculty = {};
  const level = {};
  for (const { profile } of profiles.rows) {
    if (!profile?.onboarded) continue;
    const f = profile.faculty || (profile.level?.startsWith?.('s2') ? 's2' : 'lainnya');
    faculty[f] = (faculty[f] || 0) + 1;
    if (profile.level) level[profile.level] = (level[profile.level] || 0) + 1;
  }
  const isFree = (x) => x.tier === 'free';
  const freeStarted = m.filter(x => x.free_started_at);
  const freeConverted = freeStarted.filter(x => !isFree(x) && x.status === 'active').length;
  const membersOut = {
    total: m.length,
    active: m.filter(x => x.status === 'active').length,
    paid: m.filter(x => x.status === 'active' && !isFree(x)).length,
    free: m.filter(x => x.status === 'active' && isFree(x)).length,
    freeStarted: freeStarted.length,
    freeConverted,
    freeConversionRate: freeStarted.length ? freeConverted / freeStarted.length : null,
    freeNewInRange: freeStarted.filter(x => inRange(x.free_started_at, from, to)).length,
    googleLinked: m.filter(x => x.auth_user_id).length,
    pinPending: m.filter(x => x.status === 'active' && !x.auth_user_id).length,
    newInRange: Object.values(newByDay).reduce((a, b) => a + b, 0),
    newPrev,
    newByDay: dayList.map(d => ({ day: d, count: newByDay[d] })),
    login7: loginWithin(7),
    login30: loginWithin(30),
    presentByDay: dayList.map(d => ({ day: d, count: presentByDay[d] })),
    activeInRange: activeInWindow.size,
    faculty, level,
  };

  /* ── AI Partner ── */
  const nowIso = new Date().toISOString();
  const activeSubs = new Set(subs.rows.filter(s => s.status === 'active' && (!s.expires_at || s.expires_at > nowIso)).map(s => s.member_code));
  const everPaid = new Set(subs.rows.filter(s => s.product_id !== 'manual').map(s => s.member_code));
  const trialMembers = m.filter(x => x.ai_trial_set_id);
  const trialConverted = trialMembers.filter(x => everPaid.has(x.code)).length;

  const kinds = Object.keys(AI_COST_USD).filter(k => k !== 'create');
  const usageByDay = Object.fromEntries(dayList.map(d => [d, Object.fromEntries(kinds.map(k => [k, 0]))]));
  const usageByKind = Object.fromEntries([...kinds, 'create'].map(k => [k, 0]));
  const perMember = {};
  let costPrev = 0;
  for (const raw of usage.rows) {
    // Tanya AI akun coba gratis tercatat terpisah, tapi biayanya sama dengan Tanya AI biasa.
    const u = raw.kind === 'prompt_trial' ? { ...raw, kind: 'prompt' } : raw;
    if (!(u.kind in AI_COST_USD)) continue; // hanya pemakaian model AI
    const cost = AI_COST_USD[u.kind] * u.count;
    if (u.day >= prevFrom && u.day <= prevTo) { costPrev += cost; continue; }
    if (!(u.day in usageByDay)) continue;
    if (u.kind in usageByKind) usageByKind[u.kind] += u.count;
    if (u.kind in usageByDay[u.day]) usageByDay[u.day][u.kind] += u.count;
    const pm = perMember[u.member_code] ||= { code: u.member_code, count: 0, cost: 0 };
    pm.count += u.count;
    pm.cost += cost;
  }
  const costByKind = Object.fromEntries(kinds.map(k => [k, +(usageByKind[k] * AI_COST_USD[k]).toFixed(2)]));
  const setsInRange = sets.rows.filter(s => inRange(s.created_at, from, to));
  const bySource = {};
  for (const s of setsInRange) bySource[s.source_type] = (bySource[s.source_type] || 0) + 1;

  const aiOut = {
    activeSubscribers: activeSubs.size,
    trialsStarted: trialMembers.length,
    trialConverted,
    conversionRate: trialMembers.length ? trialConverted / trialMembers.length : null,
    usageByKind,
    usageByDay: dayList.map(d => ({ day: d, ...usageByDay[d] })),
    costByKind,
    estCostUsd: +Object.values(costByKind).reduce((a, b) => a + b, 0).toFixed(2),
    estCostPrevUsd: +costPrev.toFixed(2),
    costModels: costInfo.models,
    costPricesMissing: costInfo.pricesMissing,
    transcribeMinutes: usageByKind.transcribe,
    setsCreated: setsInRange.length,
    setsTotal: sets.rows.length,
    bySource,
    topUsers: Object.values(perMember).sort((a, b) => b.cost - a.cost).slice(0, 8)
      .map(u => ({ ...u, name: nameOf[u.code] || u.code, cost: +u.cost.toFixed(2), subscribed: activeSubs.has(u.code) })),
    migrated: !members.missing && !sets.missing,
  };

  /* ── Library ── */
  const maddah = {};
  for (const a of activity.rows) {
    const x = maddah[a.maddah_id] ||= { id: a.maddah_id, opens: 0, prompts: 0 };
    x.opens += a.opens || 0;
    x.prompts += a.prompts_copied || 0;
  }
  const maddahList = Object.values(maddah);
  const libraryOut = {
    totalOpens: maddahList.reduce((a, x) => a + x.opens, 0),
    totalPrompts: maddahList.reduce((a, x) => a + x.prompts, 0),
    topMaddah: maddahList.sort((a, b) => b.opens - a.opens).slice(0, 10),
    notes: notesCount,
    muqaranah: muqaranahCount,
    soal: { paham: soalPaham, belum: soalBelum },
  };

  /* ── Kualitas AI (masukan 👍/👎 dari member) ── */
  const fbNow = feedback.rows.filter(f => inRange(f.updated_at, from, to));
  const fbPrev = feedback.rows.filter(f => inRange(f.updated_at, prevFrom, prevTo));
  const positiveRate = (rows) => (rows.length ? rows.filter(f => f.rating > 0).length / rows.length : null);
  const byKind = {};
  for (const f of fbNow) {
    const k = byKind[f.kind] ||= { kind: f.kind, up: 0, down: 0 };
    if (f.rating > 0) k.up++; else k.down++;
  }
  const byModel = {};
  for (const f of fbNow) {
    const k = byModel[f.model || 'tidak diketahui'] ||= { model: f.model || 'tidak diketahui', up: 0, down: 0 };
    if (f.rating > 0) k.up++; else k.down++;
  }
  const categories = {};
  for (const f of fbNow) if (f.rating < 0 && f.category) categories[f.category] = (categories[f.category] || 0) + 1;
  const qualityOut = {
    migrated: !feedback.missing,
    total: fbNow.length,
    up: fbNow.filter(f => f.rating > 0).length,
    down: fbNow.filter(f => f.rating < 0).length,
    positiveRate: positiveRate(fbNow),
    positiveRatePrev: positiveRate(fbPrev),
    byKind: Object.values(byKind).sort((a, b) => (b.up + b.down) - (a.up + a.down)),
    byModel: Object.values(byModel).sort((a, b) => (b.up + b.down) - (a.up + a.down)),
    categories,
    reports: fbNow.filter(f => f.rating < 0).slice(0, 25).map(f => ({
      kind: f.kind, category: f.category, note: f.note, snippet: f.snippet, model: f.model,
      at: f.updated_at, name: nameOf[f.member_code] || f.member_code,
    })),
  };

  return { range: { days: span, from, to }, revenue, members: membersOut, ai: aiOut, library: libraryOut, quality: qualityOut, costTable: AI_COST_USD };
}
