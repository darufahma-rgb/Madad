import test from 'node:test';
import assert from 'node:assert/strict';
import { handleReferenceDonation, manageSubmissions, donationBlock, CONSENT_VERSION, MAX_PENDING_PER_MEMBER } from '../api/_lib/ai-partner/reference-donation.js';

const deps = { sbConfig: () => ({ url: 'https://db.invalid', key: 'test-only' }), sbHeaders: (_k, h = {}) => h };
const hash = 'a'.repeat(64);
const DOC_ID = '11111111-1111-4111-8111-111111111111';
const SUB_ID = '22222222-2222-4222-8222-222222222222';
const ctx = { code: 'MSR-AAAA-BBBB' };
const doneDoc = { id: DOC_ID, title: 'kitab.pdf', file_hash: hash, status: 'done', page_stats: { ok: 10 }, edition: { title: 'الكتاب' } };
const makeRes = () => { const r = { code: 0, body: null, status(c) { r.code = c; return r; }, json(b) { r.body = b; return r; } }; return r; };
const submitBody = { op: 'submit', document_id: DOC_ID, source_kind: 'kitab', consent: CONSENT_VERSION };

// routes: [pola url, respons atau fungsi] — yang pertama cocok dipakai. Semua pemanggilan dicatat.
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
const ownDoc = [/GET .*ilmi_documents\?id=eq/, [doneDoc]];

test('hanya dokumen yang selesai dan terbaca penuh yang bisa disumbangkan', () => {
  assert.equal(donationBlock(doneDoc), null);
  assert.ok(donationBlock({ ...doneDoc, status: 'partial' }));
  assert.ok(donationBlock({ ...doneDoc, status: 'analyzing' }));
  assert.ok(donationBlock({ ...doneDoc, page_stats: { unread: 1 } }));
  assert.ok(donationBlock({ ...doneDoc, page_stats: { garbled: 2 } }));
});

test('tanpa persetujuan atau jenis dokumen, tidak ada yang tersimpan', async t => {
  const calls = mockDb(t, [ownDoc]);
  for (const body of [{ ...submitBody, consent: true }, { ...submitBody, consent: undefined }, { ...submitBody, source_kind: 'catatan' }]) {
    const res = makeRes();
    await handleReferenceDonation(ctx, body, res, deps);
    assert.equal(res.code, 400);
  }
  assert.equal(calls.filter(c => c.method === 'POST').length, 0);
});

test('dokumen orang lain tidak bisa disumbangkan', async t => {
  const calls = mockDb(t, [[/GET .*ilmi_documents\?id=eq/, []]]);
  const res = makeRes();
  await handleReferenceDonation(ctx, submitBody, res, deps);
  assert.equal(res.code, 404);
  assert.match(calls[0].url, /member_code=eq\.MSR-AAAA-BBBB/);
  assert.equal(calls.filter(c => c.method === 'POST').length, 0);
});

test('sumbangan tersimpan dengan pemilik dan versi persetujuan', async t => {
  const calls = mockDb(t, [ownDoc, [/POST .*reference_submissions/, [{ id: SUB_ID, status: 'pending' }]]]);
  const res = makeRes();
  await handleReferenceDonation(ctx, submitBody, res, deps);
  assert.equal(res.code, 200);
  assert.equal(res.body.submission.status, 'pending');
  const row = calls.find(c => c.method === 'POST').body;
  assert.equal(row.member_code, ctx.code);
  assert.equal(row.document_id, DOC_ID);
  assert.equal(row.consent_version, CONSENT_VERSION);
  assert.equal(row.title, 'الكتاب');
});

test('file yang sama ditolak: sudah di pustaka, sedang diproses orang lain, atau bentrok saat disimpan', async t => {
  const expect409 = async (routes) => {
    const m = mockDb(t, routes);
    const res = makeRes();
    await handleReferenceDonation(ctx, submitBody, res, deps);
    assert.equal(res.code, 409);
    t.mock.restoreAll();
    return m;
  };
  await expect409([ownDoc, [/member_code=eq\.ADMIN-REFERENCE/, [{ id: DOC_ID }]]]);
  await expect409([ownDoc, [/member_code=neq\./, [{ id: SUB_ID }]]]);
  await expect409([ownDoc, [/POST .*reference_submissions/, () => new Response('{"code":"23505"}', { status: 409 })]]);
});

test('sumbangan menunggu dibatasi per pengguna, dan yang pernah ditolak tidak bisa dikirim ulang', async t => {
  mockDb(t, [ownDoc, [/status=eq\.pending&select=id&limit/, Array(MAX_PENDING_PER_MEMBER).fill({ id: SUB_ID })]]);
  let res = makeRes();
  await handleReferenceDonation(ctx, submitBody, res, deps);
  assert.equal(res.code, 429);
  t.mock.restoreAll();
  mockDb(t, [ownDoc, [/member_code=eq\.MSR-AAAA-BBBB&file_hash=eq/, [{ id: SUB_ID, status: 'rejected' }]]]);
  res = makeRes();
  await handleReferenceDonation(ctx, submitBody, res, deps);
  assert.equal(res.code, 409);
});

test('pembatalan hanya untuk yang masih menunggu, dan hanya milik sendiri', async t => {
  const calls = mockDb(t, [ownDoc, [/GET .*member_code=eq\.MSR-AAAA-BBBB&file_hash=eq/, [{ id: SUB_ID, status: 'pending' }]]]);
  let res = makeRes();
  await handleReferenceDonation(ctx, { op: 'withdraw', document_id: DOC_ID }, res, deps);
  assert.equal(res.code, 200);
  const del = calls.find(c => c.method === 'DELETE');
  assert.match(del.url, /member_code=eq\.MSR-AAAA-BBBB/);
  assert.match(del.url, /status=eq\.pending/);
  t.mock.restoreAll();
  mockDb(t, [ownDoc, [/GET .*member_code=eq\.MSR-AAAA-BBBB&file_hash=eq/, [{ id: SUB_ID, status: 'approved' }]]]);
  res = makeRes();
  await handleReferenceDonation(ctx, { op: 'withdraw', document_id: DOC_ID }, res, deps);
  assert.equal(res.code, 409);
});

test('sebelum migrasi: tombol disembunyikan, antrean admin memberi tahu', async t => {
  const missing = () => new Response('{"code":"PGRST205","message":"Could not find the table"}', { status: 404 });
  mockDb(t, [ownDoc, [/reference_submissions/, missing]]);
  let res = makeRes();
  await handleReferenceDonation(ctx, { op: 'status', document_id: DOC_ID }, res, deps);
  assert.deepEqual(res.body, { ok: true, available: false });
  res = makeRes();
  await manageSubmissions({ op: 'list' }, res, deps);
  assert.equal(res.body.available, false);
});

test('admin hanya bisa membaca teks sumbangan yang masih menunggu', async t => {
  const calls = mockDb(t, [[/reference_submissions\?id=eq/, []]]);
  const res = makeRes();
  await manageSubmissions({ op: 'page', id: SUB_ID, page: 1 }, res, deps);
  assert.equal(res.code, 404);
  assert.match(calls[0].url, /status=eq\.pending/);
  assert.equal(calls.some(c => c.url.includes('ilmi_pages')), false);
});

test('antrean admin menandai judul yang sudah ada dan tidak mengirim catatan penyumbang', async t => {
  mockDb(t, [
    [/GET .*reference_submissions/, [{ id: SUB_ID, document_id: DOC_ID, title: 'الْكِتَاب', source_kind: 'kitab', created_at: '2026-11-01T00:00:00Z' }]],
    [/ilmi_documents\?id=in/, [{ id: DOC_ID, num_pages: 10, status: 'done', edition: { title: 'الكتاب', note: 'hp saya 0812' } }]],
    [/member_code=eq\.ADMIN-REFERENCE/, [{ title: 'الكتاب', edition: {} }]],
  ]);
  const res = makeRes();
  await manageSubmissions({ op: 'list' }, res, deps);
  assert.equal(res.body.submissions[0].similar_title, true);
  assert.equal(JSON.stringify(res.body).includes('0812'), false);
});

test('hasil penyalinan diterjemahkan ke pesan admin', async t => {
  for (const [status, code] of [['not_pending', 409], ['source_missing', 409], ['not_ready', 400], ['duplicate', 409]]) {
    mockDb(t, [[/rpc\/approve_reference_submission/, { status }]]);
    const res = makeRes();
    await manageSubmissions({ op: 'approve', id: SUB_ID }, res, deps);
    assert.equal(res.code, code, status);
    t.mock.restoreAll();
  }
  mockDb(t, [[/rpc\/approve_reference_submission/, { status: 'ok', document_id: DOC_ID }]]);
  const res = makeRes();
  await manageSubmissions({ op: 'approve', id: SUB_ID }, res, deps);
  assert.equal(res.body.document_id, DOC_ID);
});

test('penolakan wajib beralasan dan tidak menimpa keputusan sebelumnya', async t => {
  let res = makeRes();
  await manageSubmissions({ op: 'reject', id: SUB_ID, note: ' ' }, res, deps);
  assert.equal(res.code, 400);
  const calls = mockDb(t, [[/PATCH .*reference_submissions/, []]]);
  res = makeRes();
  await manageSubmissions({ op: 'reject', id: SUB_ID, note: 'Ini catatan pribadi' }, res, deps);
  assert.equal(res.code, 409);
  assert.match(calls[0].url, /status=eq\.pending/);
});
