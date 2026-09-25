// Sonnet 5: lebih baru dan lebih murah dari Sonnet 4.6 di OpenRouter ($2/$10 vs $3/$15 per 1 juta token).
const DEFAULT_MODEL = 'anthropic/claude-sonnet-5';
// Transkripsi audio butuh model yang menerima input audio; Gemini Flash murah dan kuat untuk Arab.
const DEFAULT_TRANSCRIBE_MODEL = 'google/gemini-2.5-flash';

export const transcribeModel = () => process.env.AI_TRANSCRIBE_MODEL || DEFAULT_TRANSCRIBE_MODEL;
export const activeModel = () => process.env.AI_PARTNER_MODEL || DEFAULT_MODEL;

// Cadangan otomatis bila model pilihan gagal di OpenRouter (model mati, ditolak, kehabisan kapasitas).
const FALLBACK_MODEL = 'anthropic/claude-sonnet-4.6';

/* Sebagian model baru (mis. Claude Sonnet 5, GPT-5) menolak parameter `temperature`. Daftar parameter yang
   diterima tiap model dibaca dari OpenRouter (disimpan 6 jam); kalau gagal dibaca, pakai daftar cadangan. */
const NO_TEMPERATURE_FALLBACK = /^(anthropic\/claude-(sonnet-5|fable|opus-4[.-]7)|openai\/gpt-5)/;
let paramCache = { at: 0, map: null };
const modelParams = async () => {
  if (paramCache.map && Date.now() - paramCache.at < 6 * 3600 * 1000) return paramCache.map;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const r = await fetch('https://openrouter.ai/api/v1/models', { signal: controller.signal });
    clearTimeout(timer);
    const list = (await r.json())?.data || [];
    const map = {};
    for (const m of list) if (m?.id && Array.isArray(m.supported_parameters)) map[m.id] = m.supported_parameters;
    if (Object.keys(map).length) paramCache = { at: Date.now(), map };
  } catch {}
  return paramCache.map || {};
};
// OpenRouter menerima "claude-sonnet-4-6" maupun "claude-sonnet-4.6"; daftarnya memakai titik.
export const acceptsTemperature = async (modelId) => {
  const map = await modelParams();
  const params = map[modelId] || map[String(modelId).replace(/(\d)-(\d)/g, '$1.$2')];
  return params ? params.includes('temperature') : !NO_TEMPERATURE_FALLBACK.test(modelId);
};

// Isi permintaan OpenRouter: temperature hanya untuk model yang menerimanya, plus model cadangan
// (kecuali input audio — model cadangan tidak bisa mendengar).
const buildBody = async ({ modelId, maxTokens, temperature, messages, stream }) => {
  const hasAudio = messages.some(m => Array.isArray(m.content) && m.content.some(p => p?.type === 'input_audio'));
  const fallback = !hasAudio && modelId !== FALLBACK_MODEL && modelId.replace(/(\d)-(\d)/g, '$1.$2') !== FALLBACK_MODEL;
  return {
    model: modelId,
    ...(fallback ? { models: [modelId, FALLBACK_MODEL] } : {}),
    max_tokens: maxTokens,
    ...((await acceptsTemperature(modelId)) ? { temperature } : {}),
    ...(stream ? { stream: true } : {}),
    messages,
  };
};

// Pesan untuk pengguna dari error OpenRouter (detail teknis tetap di log server).
export const friendlyAiError = (err) => {
  const m = String(err?.message || '');
  if (/credit|insufficient|payment required|402/i.test(m)) return 'Layanan AI sedang tidak tersedia (saldo AI habis). Kabari admin Talqeeh, ya.';
  if (/rate.?limit|429|overloaded|capacity/i.test(m)) return 'AI sedang sibuk. Coba lagi sebentar.';
  if (/terlalu lama/i.test(m)) return 'AI terlalu lama merespons. Coba lagi, atau persingkat pertanyaannya.';
  return 'AI sedang bermasalah. Coba lagi sebentar.';
};

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
    body: JSON.stringify(await buildBody({
      modelId, maxTokens, temperature,
      messages: systemMessage ? [systemMessage, ...messages] : messages,
    })),
  });

  const data = await res.json().catch(() => ({ error: { message: `OpenRouter error (${res.status})` } }));
  if (data.error) throw new Error(data.error.message || `OpenRouter error (${res.status})`);
  const choice = data.choices?.[0] || {};
  const text = choice.message?.content || '';
  if (!text) throw new Error('AI tidak mengembalikan hasil');
  const truncated = choice.finish_reason === 'length' || choice.native_finish_reason === 'max_tokens';
  // data.model = model yang benar-benar menjawab (bisa model cadangan).
  return { text, truncated, model: data.model || modelId };
};

export const callAI = async (opts) => (await requestAI(opts)).text;

/* Versi streaming: onDelta(potongan) dipanggil tiap token datang; hasil akhirnya sama dengan requestAI. */
/* timeLimitMs: hentikan dengan rapi sebelum batas waktu fungsi (Vercel 60 dtk) — teks yang sudah ada
   dikembalikan dengan truncated = true, jadi pengguna bisa minta "lanjutkan". */
export const streamAI = async ({ system, messages, maxTokens = 2000, temperature = 0.3, model, cacheSystem = false, timeLimitMs = 0 }, onDelta) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY belum diset');
  const modelId = model || activeModel();
  const systemMessage = !system ? null
    : cacheSystem && modelId.startsWith('anthropic/')
      ? { role: 'system', content: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }] }
      : { role: 'system', content: system };

  const controller = new AbortController();
  let timedOut = false;
  const timer = timeLimitMs > 0 ? setTimeout(() => { timedOut = true; controller.abort(); }, timeLimitMs) : null;
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://talqeeh.vercel.app',
        'X-Title': 'Talqeeh AI Partner',
      },
      body: JSON.stringify(await buildBody({
        modelId, maxTokens, temperature, stream: true,
        messages: systemMessage ? [systemMessage, ...messages] : messages,
      })),
    });
    if (!res.ok || !res.body) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error?.message || `OpenRouter error (${res.status})`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '', text = '', truncated = false, usedModel = modelId;
    const handleLine = (line) => {
      if (!line.startsWith('data:')) return; // baris komentar ": OPENROUTER PROCESSING"
      const payload = line.slice(5).trim();
      if (!payload || payload === '[DONE]') return;
      let chunk;
      try { chunk = JSON.parse(payload); } catch { return; }
      if (chunk.error) throw new Error(chunk.error.message || 'OpenRouter error');
      if (chunk.model) usedModel = chunk.model;
      const choice = chunk.choices?.[0];
      const piece = choice?.delta?.content || '';
      if (piece) { text += piece; onDelta?.(piece); }
      if (choice?.finish_reason === 'length' || choice?.native_finish_reason === 'max_tokens') truncated = true;
    };
    try {
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
    } catch (err) {
      if (!timedOut) throw err;
    }
    if (!text) throw new Error(timedOut ? 'AI terlalu lama merespons' : 'AI tidak mengembalikan hasil');
    return { text, truncated: truncated || timedOut, timedOut, model: usedModel };
  } finally {
    if (timer) clearTimeout(timer);
  }
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
