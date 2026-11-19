// Model token (api/_lib/tokens.js): potongan per biaya asli, hitungan untung, konversi pembelian lama, alur saldo.
import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.SUPABASE_URL = 'http://sb.test';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'k';

const {
  DEFAULT_TOKENS, TOKEN_USD, parseTokenConfig, tokensFor, tokenValueIdr, saleMargin, grantsDue, freeGrantDue, rateFor, minRate, tokenGuide, legacyImtihanDays, legacySchedule,
  tokensOn, clearTokenCache, tokenState, chargeTokens, ensureGrants,
} = await import('../api/_lib/tokens.js');

const DAY = 86400000;

test('setting kosong atau rusak memakai bawaan', () => {
  assert.deepEqual(parseTokenConfig(''), DEFAULT_TOKENS);
  assert.deepEqual(parseTokenConfig('{bukan json'), DEFAULT_TOKENS);
  const c = parseTokenConfig({ packs: [{ id: 'T50', price: 50000, tokens: 10000 }, { id: 'x', price: 1, tokens: 0 }], grants: { imtihan: '' }, convert: { monthly: 9000, talkhis_1: -5 }, rates: { live: 80, chat: 5 } });
  assert.deepEqual(c.packs, [{ id: 't50', price: 50000, tokens: 10000 }]);
  assert.equal(c.grants.imtihan, DEFAULT_TOKENS.grants.imtihan);   // kosong → bawaan, bukan 0
  assert.equal(c.convert.monthly, 9000);
  assert.equal(c.convert.talkhis_1, DEFAULT_TOKENS.convert.talkhis_1); // negatif ditolak
  assert.equal(c.rates.live, 80);
  assert.equal(c.rates.chat, 100); // di bawah 10% ditolak
});

test('tambahan token (add-on): bawaan, dimatikan, id tidak boleh sama dengan paket utama, tetap untung', () => {
  assert.deepEqual(parseTokenConfig({}).addons, DEFAULT_TOKENS.addons);
  assert.deepEqual(parseTokenConfig({ addons: [] }).addons, []);
  assert.deepEqual(parseTokenConfig({ addons: [{ id: 't100', price: 20000, tokens: 5000 }, { id: 'a10', price: 10000, tokens: 2500 }, { id: 'x', price: '', tokens: 1 }] }).addons,
    [{ id: 'a10', price: 10000, tokens: 2500 }]);
  for (const a of DEFAULT_TOKENS.addons) {
    assert.ok(saleMargin({ price: a.price, tokens: a.tokens }).percent >= 40, `add-on ${a.id} terlalu tipis`);
    // Per token tidak lebih murah daripada paket besar.
    const best = Math.max(...DEFAULT_TOKENS.packs.map(p => p.tokens / p.price));
    assert.ok(a.tokens / a.price <= best, `add-on ${a.id} lebih murah per token daripada paket besar`);
  }
});

test('token dipotong sebesar biaya asli, dibulatkan ke atas', () => {
  assert.equal(tokensFor(0.01), 100);        // satu pesan tutor ±$0,01
  assert.equal(tokensFor(0.0064), 64);       // satu menit Live Caption
  assert.equal(tokensFor(0.00001), 1);       // tidak pernah gratis
  assert.equal(tokensFor(2.7), 27000);       // talkhis muqarrar terbesar
  // Biaya tidak dilaporkan (respons terputus) → taksiran harga Sonnet dari jumlah token model.
  assert.equal(tokensFor(undefined, { tokensIn: 10000, tokensOut: 1000 }), 450);
  assert.equal(tokensFor(null, null), 1);
  // Nilai token yang dipotong tidak pernah di bawah biaya AI-nya.
  for (const cost of [0.00037, 0.0123, 0.5, 1.99]) assert.ok(tokensFor(cost) * TOKEN_USD >= cost);
});

test('tiap paket untung walau semua tokennya terpakai', () => {
  assert.equal(tokenValueIdr(35000), 57750);
  for (const p of DEFAULT_TOKENS.packs) {
    const m = saleMargin({ price: p.price, tokens: p.tokens });
    assert.ok(m.safe && m.percent >= 35, `paket ${p.id}: sisa ${m.percent}%`);
  }
  // Paket Imtihan harga kupon (termurah yang dijual) tetap untung.
  assert.equal(saleMargin({ price: 149000, tokens: DEFAULT_TOKENS.grants.imtihan }).profit, 25250);
  assert.equal(saleMargin({ price: 30000, tokens: 25000 }).safe, false);
});

test('tarif per fitur: dipotong sesuai persen biaya asli, kasus terburuk ikut tarif terendah', () => {
  const cfg = parseTokenConfig({ rates: { live: 80, talkhis: 120 } });
  assert.equal(rateFor('live', cfg), 0.8);
  assert.equal(rateFor('battle_quiz', parseTokenConfig({ rates: { game: 50 } })), 0.5);
  assert.equal(rateFor('entah', cfg), 1);
  assert.equal(tokensFor(0.0064, null, 0.8), 52);
  assert.equal(tokensFor(1, null, 1.2), 12000);
  assert.equal(minRate(cfg), 0.8);
  assert.equal(tokenValueIdr(35000, cfg), 72188); // 35.000 token semuanya untuk Live Caption
  assert.equal(tokenGuide(cfg).livePerMinute, 60);
  assert.equal(tokenGuide().talkhis, 15000);
});

test('masa Paket Imtihan lama: 4 bulan sebelum 5 Nov 2026, 2 bulan sesudahnya', () => {
  assert.equal(legacyImtihanDays('2026-10-20T00:00:00Z'), 120);
  assert.equal(legacyImtihanDays('2026-11-06T00:00:00Z'), 60);
});

test('token dari pembelian: baru, member lama diisi ulang tiap bulan, hadiah Library', () => {
  const start = Date.parse('2026-11-20T00:00:00Z');
  const iso = (t) => new Date(t).toISOString();
  const old = '2026-10-01T00:00:00Z'; // Paket Imtihan 4 bulan
  const rows = [
    { ref: 'a', plan: 'token', paidAt: iso(start + DAY), tokens: 35000 },
    { ref: 'b', plan: 'imtihan', paidAt: iso(start + DAY), createdAt: iso(start + DAY) }, // pembeli baru
    { ref: 'c', plan: 'imtihan', paidAt: old, createdAt: old },                            // member lama, 120 hari
    { ref: 'd', plan: 'ai', paidAt: iso(start - 40 * DAY), createdAt: iso(start - 40 * DAY) }, // sudah habis
    { ref: 'e', plan: 'talkhis_3', paidAt: iso(start - 2 * DAY) },
    { ref: 'g', plan: 'library', paidAt: iso(start - 3 * DAY) },
  ];
  const at = (days) => grantsDue(rows, { start, now: Date.parse(old) + days * DAY, paidLibrary: true });
  // Hari ke-55 sejak bayar = bulan ke-2 dari 4.
  assert.deepEqual(at(55), [
    { ref: 'a', amount: 35000, reason: 'buy' },
    { ref: 'b', amount: 75000, reason: 'buy' },
    { ref: 'reset:c:2', amount: 30000, reason: 'reset:2/4', topup: true },
    { ref: 'e', amount: 30000, reason: 'convert' },
  ]); // sudah membeli paket baru → tanpa hadiah Library
  const legacyOnly = rows.filter(r => !['a', 'b'].includes(r.ref));
  assert.deepEqual(grantsDue(legacyOnly, { start, now: Date.parse(old) + 55 * DAY, paidLibrary: true }).map(g => g.ref), ['reset:c:2', 'e', 'gift:library']);
  assert.equal(at(95).find(g => g.ref.startsWith('reset:c')).ref, 'reset:c:4');   // bulan terakhir
  assert.equal(at(121).find(g => g.ref.startsWith('reset:c')), undefined);       // masa paket habis
  // Sudah tercatat → tidak diberi lagi.
  const have = new Set(['a', 'b', 'reset:c:2', 'e']);
  assert.deepEqual(grantsDue(rows, { start, now: Date.parse(old) + 55 * DAY, paidLibrary: true, have }), []);
  // Akses lama dari admin tanpa tagihan: satu kali isi ulang.
  assert.deepEqual(grantsDue([], { start, subActive: true }), [{ ref: 'legacy:sub', amount: 30000, reason: 'reset:1/1', topup: true }]);
  assert.deepEqual(grantsDue([], { start, subActive: false, paidLibrary: false }), []);
  assert.deepEqual(grantsDue([], { start, paidLibrary: true }), [{ ref: 'gift:library', amount: 5000, reason: 'gift' }]);
});

/* ── Supabase tiruan ── */
const fake = (state) => async (url, opts = {}) => {
  const u = new URL(url);
  const json = (body, status = 200) => new Response(JSON.stringify(body), { status });
  const body = opts.body ? JSON.parse(opts.body) : {};
  const path = u.pathname.replace('/rest/v1/', '');
  if (path === 'app_settings') return json(Object.entries(state.settings).map(([key, value]) => ({ key, value })));
  if (path === 'rpc/charge_ai_tokens') {
    if (state.down) return json({ message: 'down' }, 500);
    state.balance -= Math.max(0, body.p_amount);
    return json([{ balance: state.balance, granted: state.granted }]);
  }
  if (path === 'rpc/grant_ai_tokens') {
    if (!state.refs.has(body.p_ref)) { state.refs.add(body.p_ref); state.balance += body.p_amount; state.granted += body.p_amount; }
    return json([{ balance: state.balance, granted: state.granted }]);
  }
  if (path === 'rpc/consume_ai_quota') { if ((state.capLeft ?? 1) <= 0) return json(false); state.capLeft = (state.capLeft ?? 1) - 1; return json(true); }
  if (path === 'rpc/topup_ai_tokens') {
    if (!state.refs.has(body.p_ref)) { state.refs.add(body.p_ref); const d = Math.max(0, body.p_target - state.balance); state.balance += d; state.granted += d; }
    return json([{ balance: state.balance, granted: state.granted }]);
  }
  if (path === 'members') return json(state.members || []);
  if (path === 'payment_checkouts') return json(state.checkouts);
  if (path === 'ai_subscriptions') return json(state.subs || []);
  if (path === 'group_codes') return json([]);
  if (path === 'ai_token_ledger') return json([...state.refs].map(ref => ({ ref })));
  return json([], 404);
};

test('jadwal isi ulang member lama: bulan ke berapa, kapan isi ulang berikutnya', () => {
  const start = Date.parse('2026-11-20T00:00:00Z');
  const old = '2026-10-01T00:00:00Z'; // Paket Imtihan 4 bulan → berakhir 29 Jan 2027
  const rows = [{ plan: 'imtihan', paidAt: old, createdAt: old }, { plan: 'token', paidAt: old }];
  const at = (days) => legacySchedule(rows, { start, now: Date.parse(old) + days * DAY });
  assert.deepEqual(at(55), {
    target: 30000, cycle: 2, cycles: 4, cycleStart: '2026-10-31T00:00:00.000Z',
    nextResetAt: '2026-11-30T00:00:00.000Z', endsAt: '2027-01-29T00:00:00.000Z',
  });
  assert.equal(at(100).cycle, 4);
  assert.equal(at(100).nextResetAt, null); // bulan terakhir
  assert.equal(at(121), null);             // sudah habis
  // Dibeli setelah model token berlaku → bukan member lama.
  assert.equal(legacySchedule([{ plan: 'imtihan', paidAt: '2026-11-25T00:00:00Z' }], { start, now: Date.parse('2026-11-26T00:00:00Z') }), null);
  // AI 30 hari lama: satu bulan, tanpa isi ulang berikutnya.
  const ai = legacySchedule([{ plan: 'ai', paidAt: '2026-11-10T00:00:00Z' }], { start, now: Date.parse('2026-11-21T00:00:00Z') });
  assert.equal(ai.cycles, 1);
  assert.equal(ai.nextResetAt, null);
});

test('token gratis: sekali per akun, bisa dimatikan', () => {
  assert.equal(freeGrantDue(new Set()), true);
  assert.equal(freeGrantDue(new Set(['free:welcome'])), false);
  assert.equal(freeGrantDue(new Set(), parseTokenConfig({ grants: { free: 0 } })), false);
  assert.equal(freeGrantDue(new Set(), parseTokenConfig({ limits: { freeDaily: 0 } })), false);
  // 1.500 token gratis paling mahal ±Rp2.475 per akun.
  assert.equal(tokenValueIdr(DEFAULT_TOKENS.grants.free), 2475);
});

test('token gratis lewat ensureGrants: dibatasi per hari, tidak dobel', async () => {
  const state = { settings: { aiTokensStart: new Date(Date.now() - DAY).toISOString() }, balance: 0, granted: 0, refs: new Set(), checkouts: [], capLeft: 1 };
  globalThis.fetch = fake(state);
  clearTokenCache();
  assert.equal(await ensureGrants('F1', { welcome: true }), true);
  assert.equal(state.balance, 1500);
  assert.equal(await ensureGrants('F1', { welcome: true }), false); // sudah pernah
  assert.equal(state.balance, 1500);
  const other = { ...state, balance: 0, granted: 0, refs: new Set(), capLeft: 0 };
  globalThis.fetch = fake(other);
  assert.equal(await ensureGrants('F2', { welcome: true }), false); // batas hari ini penuh
  assert.equal(other.balance, 0);
  globalThis.fetch = fake({ ...other, refs: new Set() });
  assert.equal(await ensureGrants('F3'), false); // tanpa welcome (mis. dari Beranda) → tidak diberi
});

test('isi ulang bulanan lewat ensureGrants: tidak menumpuk, hadiah Library sekali', async () => {
  const paid = new Date(Date.now() - 40 * DAY).toISOString(); // bulan ke-2 dari Paket Imtihan 4 bulan
  const state = {
    settings: { aiTokensStart: new Date(Date.now() - DAY).toISOString() }, balance: 0, granted: 0, refs: new Set(),
    checkouts: [{ id: 'old', plan: 'imtihan', paid_at: paid, created_at: '2026-10-01T00:00:00Z', tokens: null }],
    members: [{ status: 'active', tier: 'library', member_type: 'berbayar' }],
  };
  globalThis.fetch = fake(state);
  clearTokenCache();
  await ensureGrants('L1', { force: true });
  assert.equal(state.balance, 35000); // isi ulang ke 30.000, lalu hadiah Library 5.000
  assert.ok(state.refs.has('reset:checkout:old:2') && state.refs.has('gift:library'));
  await ensureGrants('L1', { force: true });
  assert.equal(state.balance, 35000);
});

test('migrasi belum dijalankan → model token mati', async () => {
  globalThis.fetch = fake({ settings: {} });
  clearTokenCache();
  assert.equal(await tokensOn(), false);
});

test('alur saldo: paket masuk sekali, dipotong sesuai biaya, gangguan tidak menggagalkan AI', async () => {
  const state = {
    settings: { aiTokensStart: new Date(Date.now() - DAY).toISOString() }, balance: 0, granted: 0, refs: new Set(), down: false,
    checkouts: [{ id: 'c1', plan: 'token', paid_at: new Date().toISOString(), tokens: 35000 }],
  };
  globalThis.fetch = fake(state);
  clearTokenCache();
  assert.equal(await tokensOn(), true);

  await ensureGrants('M1', { force: true });
  await ensureGrants('M1', { force: true }); // dipanggil lagi → tidak dobel
  assert.deepEqual(await tokenState('M1'), { balance: 35000, granted: 35000 });

  assert.deepEqual(await chargeTokens('M1', tokensFor(0.0123), 'spend:chat'), { balance: 34877, granted: 35000 });
  // Pemakaian terakhir boleh membuat saldo sedikit minus; pemakaian berikutnya ditolak di pintu masuk API.
  assert.equal((await chargeTokens('M1', 35000, 'spend:talkhis')).balance, -123);

  state.down = true;
  assert.equal(await chargeTokens('M1', 10, 'spend:chat'), null);
  assert.equal(await tokenState('M1'), null);
});
