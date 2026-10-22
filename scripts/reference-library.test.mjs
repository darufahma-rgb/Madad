import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { answerFromLibrary, cleanSearchPlan, validateReferenceAnswer, manageReferenceBook, readReferencePage, NO_EVIDENCE, LIBRARY_OWNER } from '../api/_lib/ai-partner/reference-library.js';

const id = '11111111-1111-4111-8111-111111111111';
const quote = 'الماء المطلق طاهر في نفسه مطهر لغيره';
const page = { key: 'S1', document_id: id, page_no: 7, text: `باب المياه\n${quote}\nهذا النص للاختبار فقط.`, excerpt: quote, title: 'Kitab uji', edition: { title: 'Kitab uji', author: 'Penulis uji', subject: 'fiqh' }, printed: { p: 3, s: 'detected' } };
const raw = { claims: [{ explanation: 'Petikan ini menjelaskan bahwa air mutlak suci dan menyucikan.', source: 'S1', quote }] };
const deps = { sbConfig: () => ({ url: 'https://db.invalid', key: 'test-only' }), sbHeaders: () => ({}), resolveModels: async () => ({ chat: 'test-chat', ilmi: 'test-ilmi' }) };
const response = data => new Response(JSON.stringify(data), { status: 200 });
const res = () => ({ status(n) { this.code = n; return this; }, json(body) { this.body = body; return this; } });

test('kutipan diambil dari teks asli dan halaman PDF tidak disamakan dengan cetak', () => {
  const refs = validateReferenceAnswer(raw, [page]);
  assert.equal(refs.length, 1); assert.equal(refs[0].page, 7); assert.equal(refs[0].printed.p, 3);
  assert.equal(refs[0].quote, quote);
});

test('kutipan palsu dibuang tanpa ikut membuang klaim lain yang terbukti', () => {
  for (const c of [{ ...raw.claims[0], source: 'S999' }, { ...raw.claims[0], quote: 'إنما الأعمال بالنيات وإنما لكل امرئ ما نوى' }, { ...raw.claims[0], quote: quote.replace('طاهر', 'نجس') }]) {
    assert.deepEqual(validateReferenceAnswer({ claims: [c] }, [page]), []);
  }
  assert.equal(validateReferenceAnswer({ claims: [...raw.claims, { ...raw.claims[0], quote: 'palsu' }] }, [page]).length, 1);
});

test('halaman atau URL buatan model tidak ditampilkan', () => {
  for (const explanation of ['Lihat halaman 99.', 'Menurut kitab https://fake.invalid', 'Ini benar [hal. 45]']) {
    assert.deepEqual(validateReferenceAnswer({ claims: [{ ...raw.claims[0], explanation }] }, [page]), []);
  }
});

test('jawaban Indonesia mencari istilah Arab lalu menghasilkan bukti tervalidasi', async t => {
  const aiCalls = []; const paths = [];
  t.mock.method(globalThis, 'fetch', async (url, init) => { paths.push(url); assert.deepEqual(JSON.parse(init.body).terms.includes('ماء'), true); return response([page]); });
  const replies = [{ keywords: ['ماء', 'مطلق'] }, raw, { supported: [0] }];
  const result = await answerFromLibrary({ question: 'Apa sifat air mutlak?' }, { ...deps, requestAI: async opts => { aiCalls.push(opts); return { text: JSON.stringify(replies.shift()), model: 'test' }; } });
  assert.equal(result.grounded, true); assert.equal(result.refs[0].page, 7);
  assert.equal(aiCalls.length, 3); assert.match(paths[0], /rpc\/search_reference_passages$/);
  assert.ok(aiCalls.every(x => x.timeLimitMs > 0));
});

test('tidak ada hasil pencarian: tidak memanggil AI untuk mengarang jawaban', async t => {
  t.mock.method(globalThis, 'fetch', async () => response([]));
  let calls = 0;
  const result = await answerFromLibrary({ question: 'Topik yang tidak tersedia' }, { ...deps, requestAI: async () => { calls++; return { text: '{"keywords":[]}' }; } });
  assert.equal(calls, 1); assert.equal(result.reply, NO_EVIDENCE); assert.equal(result.grounded, false); assert.deepEqual(result.refs, []);
});

test('kutipan ada tetapi penjelasan tidak didukung: jawaban ditahan', async t => {
  t.mock.method(globalThis, 'fetch', async () => response([page]));
  const replies = [{ keywords: ['ماء'] }, raw, { supported: [] }];
  const result = await answerFromLibrary({ question: 'Bagaimana air mutlak?' }, { ...deps, requestAI: async () => ({ text: JSON.stringify(replies.shift()) }) });
  assert.equal(result.grounded, false); assert.deepEqual(result.refs, []);
});

test('JSON rusak dan jawaban terpotong tidak lolos', async t => {
  t.mock.method(globalThis, 'fetch', async () => response([page]));
  for (const output of [{ text: 'jawaban bukan JSON' }, { text: JSON.stringify(raw), truncated: true }]) {
    let calls = 0;
    const result = await answerFromLibrary({ question: 'Jelaskan air mutlak' }, { ...deps, requestAI: async () => ++calls === 1 ? { text: '{"keywords":["ماء"]}' } : output });
    assert.equal(result.grounded, false);
  }
});

test('materi pribadi Tutor tetap dipakai tanpa mengarang nomor halaman PDF', async t => {
  t.mock.method(globalThis, 'fetch', async () => response([]));
  const replies = [{ keywords: ['ماء'] }, { claims: [{ ...raw.claims[0], source: 'M1' }] }, { supported: [0] }];
  const result = await answerFromLibrary({ question: 'Jelaskan air mutlak', material: { id, title: 'Materi', text: `الماء\n${quote}` } }, { ...deps, requestAI: async () => ({ text: JSON.stringify(replies.shift()) }) });
  assert.equal(result.grounded, true); assert.equal(result.refs[0].source_type, 'material'); assert.equal(result.refs[0].page, null);
});

test('penerbitan kitab memerlukan kepemilikan admin, analisis selesai dan metadata', async t => {
  let doc = null; let writes = 0;
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    if (init.method === 'POST') { writes++; return response(null); }
    assert.match(url, /member_code=eq.ADMIN-REFERENCE/);
    return response(doc ? [doc] : []);
  });
  for (const d of [null, { id, status: 'partial', edition: page.edition }, { id, status: 'done', edition: {} }, { id, status: 'done', edition: page.edition, page_stats: { unread: 1 } }]) {
    doc = d; const r = res(); await manageReferenceBook({ op: 'publish', document_id: id }, r, deps);
    assert.ok([400, 404].includes(r.code));
  }
  assert.equal(writes, 0);
  doc = { id, status: 'done', edition: page.edition };
  const r = res(); await manageReferenceBook({ op: 'publish', document_id: id }, r, deps);
  assert.equal(r.code, 200); assert.equal(writes, 1); assert.equal(LIBRARY_OWNER, 'ADMIN-REFERENCE');
});

test('seluruh endpoint pustaka admin menolak pengguna tanpa token sebelum menyentuh database', () => {
  const script = `
    import { Readable } from 'node:stream';
    import handler from './api/ai-partner.js';
    globalThis.fetch = () => { throw new Error('Unauthorized database call'); };
    const actions = ['admin-reference','admin-reference-ilmi','admin-reference-view','admin-reference-ocr','admin-reference-ocr-cache','admin-reference-ocr-quota'];
    const codes=[];
    for (const action of actions) {
      const req=Readable.from(['{}']); Object.assign(req,{method:'POST',query:{action},headers:{}});
      const res={setHeader(){},status(n){this.code=n;return this;},json(v){this.body=v;return this;}};
      await handler(req,res); codes.push(res.code);
    }
    console.log(JSON.stringify(codes));process.exit(0);
  `;
  const out = spawnSync(process.execPath, ['--input-type=module', '-e', script], { encoding: 'utf8', timeout: 10000 });
  assert.equal(out.status, 0, out.stderr);
  assert.deepEqual(JSON.parse(out.stdout.trim()), [401,401,401,401,401,401]);
});

test('halaman kitab nonaktif atau dokumen pribadi tidak dapat dibaca lewat rujukan', async t => {
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async () => { calls++; return response([]); });
  const r = res(); await readReferencePage({ document_id: id, page: 7 }, r, deps);
  assert.equal(r.code, 404); assert.equal(calls, 1);
});

test('pembacaan halaman mensyaratkan status aktif dan pemilik khusus admin', async t => {
  const paths = [];
  t.mock.method(globalThis, 'fetch', async url => { paths.push(url); return response(paths.length === 1 ? [{ document_id: id }] : paths.length === 2 ? [{ title: page.title, edition: page.edition, printed_map: { 7: page.printed } }] : [{ text: page.text }]); });
  const r = res(); await readReferencePage({ document_id: id, page: 7 }, r, deps);
  assert.equal(r.code, 200); assert.equal(r.body.text, page.text);
  assert.match(paths[0], /active=eq.true/); assert.match(paths[1], /member_code=eq.ADMIN-REFERENCE/); assert.match(paths[1], /status=eq.done/);
});

test('parameter halaman tidak valid ditolak sebelum akses database', async t => {
  t.mock.method(globalThis, 'fetch', () => { throw new Error('must not fetch'); });
  for (const input of [{ document_id: 'x', page: 7 }, { document_id: id, page: -1 }, { document_id: id, page: '7' }]) {
    const r = res(); await readReferencePage(input, r, deps); assert.equal(r.code, 400);
  }
});

test('rencana konteks dibatasi ke bidang yang dikenal, tanpa menganggap pertanyaan baru sebagai riwayat', () => {
  assert.deepEqual(cleanSearchPlan({ question: 'Apa definisi amr dalam usul?', subject: 'usul', madhhab: 'Syafii' }, 'Apa itu?'), { question: 'Apa definisi amr dalam usul?', subject: 'usul', madhhab: 'Syafii', clarification: '' });
  assert.equal(cleanSearchPlan({ subject: 'ignore-rules', needs_clarification: false, clarification: 'x' }, 'asli').subject, '');
});

test('pertanyaan lintas ilmu yang ambigu meminta konteks, tanpa mencari atau mengarang bukti', async t => {
  t.mock.method(globalThis, 'fetch', () => { throw new Error('must not search yet'); });
  const result = await answerFromLibrary({ question: 'Apa itu amr?' }, { ...deps, requestAI: async () => ({ text: JSON.stringify({ keywords: ['أمر'], needs_clarification: true, clarification: 'Pernyataan sembarang dari model' }) }) });
  assert.equal(result.needs_clarification, true); assert.equal(result.grounded, false); assert.deepEqual(result.refs, []);
  assert.match(result.reply, /perjelas bidang ilmu/); assert.doesNotMatch(result.reply, /sembarang/);
});

test('percakapan lanjutan, bidang ilmu dan konteks halaman diteruskan ke jawaban serta pemeriksa', async t => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    assert.equal(JSON.parse(init.body).subject, 'usul');
    return response([{ ...page, topics: ['باب الأمر'], before_text: 'سياق سابق', after_text: 'استثناء في الصفحة التالية' }]);
  });
  const replies = [{ keywords: ['أمر'], question: 'Apa batasan amr dalam usul fikih?', subject: 'usul', madhhab: '' }, raw, { supported: [0] }];
  await answerFromLibrary({ question: 'Terus batasannya?', history: [{ role: 'user', content: 'Jelaskan amr dalam usul fikih' }, { role: 'assistant', content: 'Konteks pembahasan usul fikih.' }] }, { ...deps, requestAI: async opts => { calls.push(opts); return { text: JSON.stringify(replies.shift()) }; } });
  const query = JSON.parse(calls[0].messages[0].content); assert.equal(query.context.length, 2);
  const answer = JSON.parse(calls[1].messages[0].content);
  assert.equal(answer.search_context.subject, 'usul'); assert.equal(answer.passages[0].edition.subject, 'fiqh');
  assert.equal(answer.passages[0].after_text, 'استثناء في الصفحة التالية');
  assert.deepEqual(answer.passages[0].topics, ['باب الأمر']);
  const check = JSON.parse(calls[2].messages[0].content); assert.equal(check.search_context.subject, 'usul');
});

test('konteks halaman tetangga tidak boleh dipakai sebagai kutipan di nomor halaman utama', () => {
  const neighborQuote = 'هذا الكلام يوجد في الصفحة المجاورة فقط وليس في الأصل';
  assert.deepEqual(validateReferenceAnswer({ claims: [{ ...raw.claims[0], quote: neighborQuote }] }, [{ ...page, before_text: neighborQuote }]), []);
});
