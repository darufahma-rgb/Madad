const DEFAULT_MODEL = 'anthropic/claude-sonnet-4-6';

export const callAI = async ({ system, messages, maxTokens = 2000, temperature = 0.3 }) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY belum diset');

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://talqeeh.vercel.app',
      'X-Title': 'Talqeeh AI Partner',
    },
    body: JSON.stringify({
      model: process.env.AI_PARTNER_MODEL || DEFAULT_MODEL,
      max_tokens: maxTokens,
      temperature,
      messages: system ? [{ role: 'system', content: system }, ...messages] : messages,
    }),
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error.message || 'OpenRouter error');
  const text = data.choices?.[0]?.message?.content || '';
  if (!text) throw new Error('AI tidak mengembalikan hasil');
  return text;
};

const parseJsonReply = (text) => {
  const cleaned = text.replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
  const start = cleaned.search(/[[{]/);
  return JSON.parse(start > 0 ? cleaned.slice(start) : cleaned);
};

export const callAIJson = async (opts) => {
  const first = await callAI(opts);
  try {
    return parseJsonReply(first);
  } catch {
    const retry = await callAI({
      ...opts,
      messages: [
        ...opts.messages,
        { role: 'assistant', content: first },
        { role: 'user', content: 'Balasan tadi bukan JSON valid. Kirim ulang HANYA JSON valid, tanpa teks lain.' },
      ],
    });
    return parseJsonReply(retry);
  }
};
