const DEFAULT_MODEL = 'anthropic/claude-sonnet-4-6';
// Transkripsi audio butuh model yang menerima input audio; Gemini Flash murah dan kuat untuk Arab.
const DEFAULT_TRANSCRIBE_MODEL = 'google/gemini-2.5-flash';

export const transcribeModel = () => process.env.AI_TRANSCRIBE_MODEL || DEFAULT_TRANSCRIBE_MODEL;
export const activeModel = () => process.env.AI_PARTNER_MODEL || DEFAULT_MODEL;

/* Panggil model lewat OpenRouter. Mengembalikan teks + apakah jawabannya terpotong batas token.
   cacheSystem: system prompt (mis. materi panjang untuk tutor) di-cache Anthropic ±5 menit, jadi pesan
   berikutnya dalam satu sesi chat jauh lebih murah dan cepat. Model non-Anthropic menerima teks biasa. */
export const requestAI = async ({ system, messages, maxTokens = 2000, temperature = 0.3, model, cacheSystem = false }) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY belum diset');

  const modelId = model || activeModel();
  const systemMessage = !system ? null
    : cacheSystem && modelId.startsWith('anthropic/')
      ? { role: 'system', content: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }] }
      : { role: 'system', content: system };

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://talqeeh.vercel.app',
      'X-Title': 'Talqeeh AI Partner',
    },
    body: JSON.stringify({
      model: modelId,
      max_tokens: maxTokens,
      temperature,
      messages: systemMessage ? [systemMessage, ...messages] : messages,
    }),
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error.message || 'OpenRouter error');
  const choice = data.choices?.[0] || {};
  const text = choice.message?.content || '';
  if (!text) throw new Error('AI tidak mengembalikan hasil');
  const truncated = choice.finish_reason === 'length' || choice.native_finish_reason === 'max_tokens';
  return { text, truncated, model: modelId };
};

export const callAI = async (opts) => (await requestAI(opts)).text;

/* Versi streaming: onDelta(potongan) dipanggil tiap token datang; hasil akhirnya sama dengan requestAI. */
export const streamAI = async ({ system, messages, maxTokens = 2000, temperature = 0.3, model, cacheSystem = false }, onDelta) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY belum diset');
  const modelId = model || activeModel();
  const systemMessage = !system ? null
    : cacheSystem && modelId.startsWith('anthropic/')
      ? { role: 'system', content: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }] }
      : { role: 'system', content: system };

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://talqeeh.vercel.app',
      'X-Title': 'Talqeeh AI Partner',
    },
    body: JSON.stringify({
      model: modelId, max_tokens: maxTokens, temperature, stream: true,
      messages: systemMessage ? [systemMessage, ...messages] : messages,
    }),
  });
  if (!res.ok || !res.body) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error?.message || `OpenRouter error (${res.status})`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '', text = '', truncated = false;
  const handleLine = (line) => {
    if (!line.startsWith('data:')) return; // baris komentar ": OPENROUTER PROCESSING"
    const payload = line.slice(5).trim();
    if (!payload || payload === '[DONE]') return;
    let chunk;
    try { chunk = JSON.parse(payload); } catch { return; }
    if (chunk.error) throw new Error(chunk.error.message || 'OpenRouter error');
    const choice = chunk.choices?.[0];
    const piece = choice?.delta?.content || '';
    if (piece) { text += piece; onDelta?.(piece); }
    if (choice?.finish_reason === 'length' || choice?.native_finish_reason === 'max_tokens') truncated = true;
  };
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let nl;
    while ((nl = buffer.indexOf('\n')) >= 0) {
      handleLine(buffer.slice(0, nl).trim());
      buffer = buffer.slice(nl + 1);
    }
  }
  if (buffer.trim()) handleLine(buffer.trim());
  if (!text) throw new Error('AI tidak mengembalikan hasil');
  return { text, truncated, model: modelId };
};

const parseJsonReply = (text) => {
  const cleaned = text.replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
  const start = cleaned.search(/[[{]/);
  return JSON.parse(start > 0 ? cleaned.slice(start) : cleaned);
};

export const callAIJson = async (opts) => {
  const first = await requestAI(opts);
  try {
    return parseJsonReply(first.text);
  } catch {
    // JSON yang terpotong batas token tidak akan valid kalau dikirim ulang sama panjangnya — minta versi lebih ringkas.
    const retryAsk = first.truncated
      ? 'Balasan tadi terpotong karena terlalu panjang. Kirim ulang versi yang LEBIH RINGKAS (kurangi jumlah item dan panjang teks tiap item) sebagai JSON valid saja, tanpa teks lain.'
      : 'Balasan tadi bukan JSON valid. Kirim ulang HANYA JSON valid, tanpa teks lain.';
    const retry = await callAI({
      ...opts,
      messages: [...opts.messages, { role: 'assistant', content: first.text }, { role: 'user', content: retryAsk }],
    });
    return parseJsonReply(retry);
  }
};
