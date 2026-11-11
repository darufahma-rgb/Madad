// Sumbangan materi AI Partner (api/_lib/ai-partner/material-donation.js).
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  handleMaterialDonation, manageMaterialSubmissions, materialDonationBlock, materialHash, MATERIAL_CONSENT_VERSION, MAX_PENDING_MATERIALS,
} from '../api/_lib/ai-partner/material-donation.js';

const deps = { sbConfig: () => ({ url: 'https://db.invalid', key: 'test-only' }), sbHeaders: (_k, h = {}) => h };
const SET_ID = '11111111-1111-4111-8111-111111111111';
const SUB_ID = '22222222-2222-4222-8222-222222222222';
const ctx = { code: 'MSR-AAAA-BBBB' };
const content = 'بَابُ الْفَاعِلِ '.repeat(150);
const pdfSet = { id: SET_ID, title: 'Nahwu 2', maddah_id: 'nahwu', source_type: 'pdf', content };
const makeRes = () => { const r = { code: 0, body: null, status(c) { r.code = c; return r; }, json(b) { r.body = b; return r; } }; return r; };
const submitBody = { op: 'submit', set_id: SET_ID, source_kind: 'muqarrar', consent: MATERIAL_CONSENT_VERSION };
const mockDb = (t, routes) => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, init = {}) => {
    calls.push({ url: String(url), method: init.method || 'GET', body: init.body ? JSON.parse(init.body) : null });
    const hit = routes.find(([re]) => re.test(`${init.method || 'GET'} ${url}`));
    const out = hit ? (typeof hit[1] === 'function' ? hit[1](init) : hit[1]) : [];
    if (out instanceof Response) return out;
    return new Response(JSON.stringify(out));
  });
  return calls;
};
const ownSet = [/GET .*study_sets\?id=eq/, [pdfSet]];

test('hanya materi PDF/foto yang cukup panjang yang bisa disumbangkan', () => {
  assert.equal(materialDonationBlock(pdfSet), null);
  assert.equal(materialDonationBlock({ ...pdfSet, source_type: 'foto' }), null);
  assert.ok(materialDonationBlock({ ...pdfSet, source_type: 'teks' }));
  assert.ok(materialDonationBlock({ ...pdfSet, source_type: 'audio' }));
  assert.ok(materialDonationBlock({ ...pdfSet, content: 'pendek' }));
});

test('sidik jari mengabaikan harakat dan spasi', () => {
  assert.equal(materialHash('بَابُ  الْفَاعِلِ'), materialHash('باب الفاعل'));
  assert.notEqual(materialHash('باب الفاعل'), materialHash('باب المفعول'));
  assert.match(materialHash('x'), /^[0-9a-f]{64}$/);
});

test('tanpa persetujuan atau jenis materi, tidak ada yang tersimpan', async t => {
  const calls = mockDb(t, [ownSet]);
  for (const body of [{ ...submitBody, consent: true }, { ...submitBody, source_kind: 'catatan' }]) {
    const res = makeRes();
    await handleMaterialDonation(ctx, body, res, deps);
    assert.equal(res.code, 400);
  }
  assert.equal(calls.filter(c => c.method === 'POST').length, 0);
});

test('materi orang lain tidak bisa disumbangkan', async t => {
  const calls = mockDb(t, [[/GET .*study_sets\?id=eq/, []]]);
  const res = makeRes();
  await handleMaterialDonation(ctx, submitBody, res, deps);
  assert.equal(res.code, 404);
  assert.match(calls[0].url, /member_code=eq\.MSR-AAAA-BBBB/);
});

test('sumbangan tersimpan dengan pemilik, sidik jari, dan versi persetujuan, tanpa isi materi', async t => {
  const calls = mockDb(t, [ownSet, [/POST .*material_submissions/, [{ id: SUB_ID, status: 'pending' }]]]);
  const res = makeRes();
  await handleMaterialDonation(ctx, submitBody, res, deps);
  assert.equal(res.code, 200);
  const post = calls.find(c => c.method === 'POST').body;
  assert.equal(post.member_code, ctx.code);
  assert.equal(post.study_set_id, SET_ID);
  assert.equal(post.content_hash, materialHash(content));
  assert.equal(post.consent_version, MATERIAL_CONSENT_VERSION);
  assert.equal(post.content, undefined);
});

test('batas sumbangan menunggu per pengguna', async t => {
  mockDb(t, [ownSet, [/GET .*material_submissions\?member_code=eq.*status=eq\.pending/, Array(MAX_PENDING_MATERIALS).fill({ id: SUB_ID })]]);
  const res = makeRes();
  await handleMaterialDonation(ctx, submitBody, res, deps);
  assert.equal(res.code, 429);
});

test('materi sama dari pengguna lain ditolak sebagai sudah ada', async t => {
  mockDb(t, [ownSet, [/GET .*material_submissions\?content_hash=eq/, [{ id: SUB_ID }]]]);
  const res = makeRes();
  await handleMaterialDonation(ctx, submitBody, res, deps);
  assert.equal(res.code, 409);
});

test('tabel belum dibuat: tombol disembunyikan', async t => {
  mockDb(t, [ownSet, [/material_submissions/, () => new Response('{"code":"PGRST205"}', { status: 404 })]]);
  const res = makeRes();
  await handleMaterialDonation(ctx, { op: 'status', set_id: SET_ID }, res, deps);
  assert.equal(res.code, 200);
  assert.equal(res.body.available, false);
});

test('admin: terima menyalin teks dan talkhis lalu memutus tautan', async t => {
  const calls = mockDb(t, [
    [/GET .*material_submissions\?id=eq/, [{ study_set_id: SET_ID, member_code: ctx.code }]],
    [/GET .*study_sets\?id=eq/, [{ content, talkhis: { topics: [] } }]],
    [/PATCH .*material_submissions/, [{ id: SUB_ID }]],
  ]);
  const res = makeRes();
  await manageMaterialSubmissions({ op: 'approve', id: SUB_ID }, res, deps);
  assert.equal(res.code, 200);
  const patch = calls.find(c => c.method === 'PATCH');
  assert.match(patch.url, /status=eq\.pending/);
  assert.equal(patch.body.status, 'approved');
  assert.equal(patch.body.content, content);
  assert.equal(patch.body.study_set_id, null);
});

test('admin: materi sudah dihapus penyumbang tidak bisa diterima', async t => {
  mockDb(t, [[/GET .*material_submissions\?id=eq/, [{ study_set_id: SET_ID, member_code: ctx.code }]], [/GET .*study_sets/, []]]);
  const res = makeRes();
  await manageMaterialSubmissions({ op: 'approve', id: SUB_ID }, res, deps);
  assert.equal(res.code, 409);
});

test('admin: tolak wajib beralasan', async t => {
  const calls = mockDb(t, []);
  const res = makeRes();
  await manageMaterialSubmissions({ op: 'reject', id: SUB_ID, note: ' ' }, res, deps);
  assert.equal(res.code, 400);
  assert.equal(calls.length, 0);
});

test('admin: teks hanya bisa dibaca selama menunggu', async t => {
  mockDb(t, [[/GET .*material_submissions\?id=eq/, []]]);
  const res = makeRes();
  await manageMaterialSubmissions({ op: 'read', id: SUB_ID }, res, deps);
  assert.equal(res.code, 404);
});
