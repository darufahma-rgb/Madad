import test from 'node:test';
import assert from 'node:assert/strict';
import { makeRunContinued, isContinueAfterCut, CUT_NOTE_MARK, CONTINUE_INSTRUCTION } from '../api/_lib/ai-partner/continue.js';

const cut = `Jawaban panjang._(${CUT_NOTE_MARK} — ketik **lanjutkan** untuk meneruskan.)_`;
const opts = { system: 's', messages: [{ role: 'user', content: 'ringkas 3 halaman' }], maxTokens: 3200, timeLimitMs: 48000, thinking: 1024 };

// Jam palsu: tiap panggilan now() maju sesuai antrean, jadi tes tidak menunggu waktu sungguhan.
const clock = (...ticks) => () => ticks.length > 1 ? ticks.shift() : ticks[0];

const build = ({ first, more, now = clock(0, 1000, 2000, 3000, 4000) }) => {
  const calls = { stream: [], request: [] };
  const deltas = [];
  const stream = { delta: (d) => deltas.push(d) };
  const run = makeRunContinued({
    runAI: async (body) => ({ out: first, stream: body.stream ? stream : null }),
    streamAI: async (o, onDelta) => { calls.stream.push(o); const r = more.shift(); if (r instanceof Error) throw r; onDelta(r.text); return r; },
    requestAI: async (o) => { calls.request.push(o); const r = more.shift(); if (r instanceof Error) throw r; return r; },
    now, log: () => {},
  });
  return { run, calls, deltas };
};

test('"lanjutkan" setelah jawaban terpotong tidak memakan jatah, selain itu tetap dihitung', () => {
  for (const m of ['lanjutkan', 'Lanjutkan', 'lanjut.', 'teruskan!', 'continue']) assert.equal(isContinueAfterCut(m, cut), true, m);
  assert.equal(isContinueAfterCut('lanjutkan', 'Jawaban biasa yang utuh.'), false);
  assert.equal(isContinueAfterCut('lanjutkan', undefined), false);
  assert.equal(isContinueAfterCut('lanjutkan penjelasan bab dua', cut), false);
  assert.equal(isContinueAfterCut('jelaskan i\'rab', cut), false);
});

test('jawaban utuh tidak disambung', async () => {
  const { run, calls } = build({ first: { text: 'Selesai.', truncated: false }, more: [] });
  const { out } = await run({}, {}, opts);
  assert.equal(out.text, 'Selesai.');
  assert.equal(calls.request.length + calls.stream.length, 0);
});

test('terpotong token: disambung sekali, teks menyatu, tanpa catatan terpotong', async () => {
  const { run, calls } = build({
    first: { text: 'Bagian satu ', truncated: true, model: 'm' },
    more: [{ text: 'dan bagian dua.', truncated: false }],
  });
  const { out } = await run({}, {}, opts);
  assert.equal(out.text, 'Bagian satu dan bagian dua.');
  assert.equal(out.truncated, false);
  const sent = calls.request[0];
  assert.equal(sent.thinking, 0);
  assert.deepEqual(sent.messages.slice(-2), [{ role: 'assistant', content: 'Bagian satu' }, { role: 'user', content: CONTINUE_INSTRUCTION }]);
  assert.equal(sent.messages[0].content, 'ringkas 3 halaman');
});

test('maksimal dua sambungan, sisanya tetap ditandai terpotong', async () => {
  const { run, calls } = build({
    first: { text: 'A', truncated: true },
    more: [{ text: 'B', truncated: true }, { text: 'C', truncated: true }, { text: 'D', truncated: false }],
  });
  const { out } = await run({}, {}, opts);
  assert.equal(out.text, 'ABC');
  assert.equal(out.truncated, true);
  assert.equal(calls.request.length, 2);
});

test('terhenti karena waktu habis atau waktu sisa terlalu sedikit: tidak disambung', async () => {
  const timed = build({ first: { text: 'A', truncated: true, timedOut: true }, more: [{ text: 'B', truncated: false }] });
  assert.equal((await timed.run({}, {}, opts)).out.text, 'A');
  assert.equal(timed.calls.request.length, 0);

  const late = build({ first: { text: 'A', truncated: true }, more: [{ text: 'B', truncated: false }], now: clock(0, 40000) });
  const r = await late.run({}, {}, opts);
  assert.equal(r.out.text, 'A');
  assert.equal(r.out.truncated, true);
  assert.equal(late.calls.request.length, 0);
});

test('mode stream: sambungan dikirim lewat stream yang sama dan jatah waktu sisa dipakai', async () => {
  const { run, calls, deltas } = build({
    first: { text: 'Awal ', truncated: true },
    more: [{ text: 'akhir.', truncated: false }],
    now: clock(0, 5000, 6000),
  });
  const { out, stream } = await run({ stream: true }, {}, opts);
  assert.equal(out.text, 'Awal akhir.');
  assert.deepEqual(deltas, ['akhir.']);
  assert.ok(stream);
  assert.equal(calls.stream[0].timeLimitMs, 43000);
});

test('sambungan gagal: jawaban awal tetap dikembalikan dan ditandai terpotong', async () => {
  const { run } = build({ first: { text: 'Awal', truncated: true }, more: [new Error('jaringan putus')] });
  const { out } = await run({}, {}, opts);
  assert.equal(out.text, 'Awal');
  assert.equal(out.truncated, true);
});

test('gagal di panggilan pertama diteruskan apa adanya', async () => {
  const run = makeRunContinued({ runAI: async () => ({ failed: true }), streamAI: async () => { throw new Error('tidak boleh'); }, requestAI: async () => { throw new Error('tidak boleh'); } });
  assert.deepEqual(await run({}, {}, opts), { failed: true });
});
