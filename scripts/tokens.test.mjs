// Model token (api/_lib/tokens.js): potongan per biaya asli, hitungan untung, konversi pembelian lama, alur saldo.
import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.SUPABASE_URL = 'http://sb.test';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'k';

const {
  DEFAULT_TOKENS, TOKEN_USD, parseTokenConfig, tokensFor, tokenValueIdr, saleMargin, grantsDue, freeGrantDue,
  tokensOn, clearTokenCache, tokenState, chargeTokens, ensureGrants,
} = await import('../api/_lib/tokens.js');

const DAY = 86400000;

test('setting kosong atau rusak memakai bawaan', () => {
  assert.deepEqual(parseTokenConfig(''), DEFAULT_TOKENS);
  assert.deepEqual(parseTokenConfig('{bukan json'), DEFAULT_TOKENS);
  const c = parseTokenConfig({ packs: [{ id: 'T50', price: 50000, tokens: 10000 }, { id: 'x', price: 1, tokens: 0 }], grants: { imtihan: '' }, convert: { monthly: 9000, imtihan: -5 } });
  assert.deepEqual(c.packs, [{ id: 't50', price: 50000, tokens: 10000 }]);
  assert.equal(c.grants.imtihan, DEFAULT_TOKENS.grants.imtihan);   // kosong → bawaan, bukan 0
  assert.equal(c.convert.monthly, 9000);
  assert.equal(c.convert.imtihan, DEFAULT_TOKENS.convert.imtihan); // negatif ditolak
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

test('token dari pembelian: baru, lama (dikonversi), kedaluwarsa, sudah tercatat', () => {
  const start = Date.parse('2026-11-20T00:00:00Z');
  const iso = (t) => new Date(t).toISOString();
  const rows = [
    { ref: 'a', plan: 'token', paidAt: iso(start + DAY), tokens: 35000 },
    { ref: 'b', plan: 'imtihan', paidAt: iso(start + DAY), tokens: 0 },           // Paket Imtihan baru = paket token besar
    { ref: 'c', plan: 'imtihan', paidAt: iso(start - 10 * DAY), tokens: 0 },      // pembeli lama
    { ref: 'd', plan: 'ai', paidAt: iso(start - 5 * DAY), tokens: 0 },
    { ref: 'e', plan: 'talkhis_3', paidAt: iso(start - 2 * DAY), tokens: 0 },
    { ref: 'f', plan: 'group', paidAt: iso(start - 3 * DAY), tokens: 0 },
    { ref: 'g', plan: 'library', paidAt: iso(start - 3 * DAY), tokens: 0 },       // Library saja: tanpa token
    { ref: 'h', plan: 'token', paidAt: null, tokens: 9 },
  ];
  assert.deepEqual(grantsDue(rows, { start, subActive: true, have: new Set(['d']) }), [
    { ref: 'a', amount: 35000, reason: 'buy' },
    { ref: 'b', amount: 75000, reason: 'buy' },
    { ref: 'c', amount: 75000, reason: 'convert' },
    { ref: 'e', amount: 30000, reason: 'convert' },
    { ref: 'f', amount: 75000, reason: 'convert' },
  ]);
  // Masa AI lamanya sudah habis → pembelian lama tidak dikonversi; pembelian baru tetap masuk.
  assert.deepEqual(grantsDue(rows, { start, subActive: false }).map(g => g.ref), ['a', 'b']);
  // Akses lama tanpa tagihan (diberi admin): sekali, setara paket kecil.
  assert.deepEqual(grantsDue([], { start, subActive: true }), [{ ref: 'legacy:sub', amount: 35000, reason: 'convert' }]);
  assert.deepEqual(grantsDue([], { start, subActive: true, have: new Set(['legacy:sub']) }), []);
  assert.deepEqual(grantsDue([], { start, subActive: false }), []);
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
  if (path === 'payment_checkouts') return json(state.checkouts);
  if (path === 'ai_subscriptions') return json(state.subs || []);
  if (path === 'group_codes') return json([]);
  if (path === 'ai_token_ledger') return json([...state.refs].map(ref => ({ ref })));
  return json([], 404);
};

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
