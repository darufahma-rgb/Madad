import test from 'node:test';
import assert from 'node:assert/strict';

process.env.OPENROUTER_API_KEY = 'sk-or-test';
process.env.SUPABASE_URL = '';
const { streamAI } = await import('../api/_lib/ai.js');

// Respons SSE OpenRouter berisi potongan teks.
const sse = (model, pieces) => new Response(new ReadableStream({
  start(c) {
    const enc = new TextEncoder();
    for (const p of pieces) c.enqueue(enc.encode(`data: ${JSON.stringify({ model, choices: [{ delta: { content: p } }] })}\n\n`));
    c.enqueue(enc.encode('data: [DONE]\n\n'));
    c.close();
  },
}), { status: 200, headers: { 'Content-Type': 'text/event-stream' } });

// Permintaan yang tidak pernah dijawab sampai dibatalkan (seperti OpenRouter yang macet).
const hang = (signal) => new Promise((_, reject) => signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' }))));

const withFetch = async (impl, fn) => {
  const orig = globalThis.fetch;
  globalThis.fetch = impl;
  try { return await fn(); } finally { globalThis.fetch = orig; }
};

const chatCalls = (calls) => calls.filter(c => c.url.includes('/chat/completions'));

test('model yang macet tanpa huruf pertama diganti model cadangan, jawabannya tetap sampai', async () => {
  const calls = [];
  const out = await withFetch(async (url, init = {}) => {
    calls.push({ url: String(url), body: init.body ? JSON.parse(init.body) : null });
    if (String(url).includes('/models')) return new Response(JSON.stringify({ data: [] }));
    const n = chatCalls(calls).length;
    return n === 1 ? hang(init.signal) : sse('google/gemini-2.5-flash', ['Halo ', 'thalib']);
  }, () => streamAI({ messages: [{ role: 'user', content: 'Jelaskan isytighal' }], model: 'anthropic/claude-haiku-4.5', timeLimitMs: 20000, firstTokenMs: 50 }, () => {}));
  assert.equal(out.text, 'Halo thalib');
  assert.equal(out.model, 'google/gemini-2.5-flash');
  const chats = chatCalls(calls);
  assert.equal(chats.length, 2);
  assert.equal(chats[0].body.model, 'anthropic/claude-haiku-4.5');
  assert.equal(chats[1].body.model, 'google/gemini-2.5-flash');
});

test('jawaban yang sudah mulai mengalir tidak diganti walau lambat', async () => {
  const calls = [];
  const out = await withFetch(async (url, init = {}) => {
    calls.push({ url: String(url) });
    if (String(url).includes('/models')) return new Response(JSON.stringify({ data: [] }));
    return sse('anthropic/claude-haiku-4.5', ['Satu ', 'dua']);
  }, () => streamAI({ messages: [{ role: 'user', content: 'x' }], model: 'anthropic/claude-haiku-4.5', timeLimitMs: 5000, firstTokenMs: 1000 }, () => {}));
  assert.equal(out.text, 'Satu dua');
  assert.equal(chatCalls(calls).length, 1);
});

test('sisa waktu terlalu sedikit untuk mengulang → pesan terlalu lama', async () => {
  await withFetch(async (url, init = {}) => {
    if (String(url).includes('/models')) return new Response(JSON.stringify({ data: [] }));
    return hang(init.signal);
  }, () => assert.rejects(
    streamAI({ messages: [{ role: 'user', content: 'x' }], model: 'anthropic/claude-haiku-4.5', timeLimitMs: 8000, firstTokenMs: 50 }, () => {}),
    /terlalu lama/,
  ));
});

test('tanpa firstTokenMs perilakunya seperti semula (satu permintaan)', async () => {
  const calls = [];
  const out = await withFetch(async (url) => {
    calls.push({ url: String(url) });
    if (String(url).includes('/models')) return new Response(JSON.stringify({ data: [] }));
    return sse('anthropic/claude-haiku-4.5', ['ok']);
  }, () => streamAI({ messages: [{ role: 'user', content: 'x' }], model: 'anthropic/claude-haiku-4.5', timeLimitMs: 5000 }, () => {}));
  assert.equal(out.text, 'ok');
  assert.equal(chatCalls(calls).length, 1);
});
