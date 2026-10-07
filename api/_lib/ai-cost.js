/* Biaya AI yang sebenarnya, per panggilan.
   OpenRouter menyertakan biaya pasti (USD) dan jumlah token di setiap respons (usage accounting). Tiap panggilan dicatat
   ke tabel ai_cost_log bersama siapa pemakainya dan fiturnya, supaya analitik admin memakai angka nyata, bukan taksiran.
   "Siapa & fitur apa" dibawa lewat AsyncLocalStorage: handler API membungkus pekerjaannya dengan withAiContext(),
   lalu requestAI/streamAI di ai.js mencatat tanpa perlu meneruskan parameter ke semua pemanggil. */
import { AsyncLocalStorage } from 'node:async_hooks';
import { sbConfig, sbHeaders } from './member.js';

const store = new AsyncLocalStorage();
export const withAiContext = (ctx, fn) => store.run(ctx, fn);

let tableMissing = false; // migrasi ai_cost_log belum dijalankan → berhenti mencoba di instance ini

const int = (n) => (Number.isFinite(Number(n)) ? Math.round(Number(n)) : null);

/* usage: objek usage OpenRouter ({ prompt_tokens, completion_tokens, cost }), atau null bila respons terputus.
   estimate: { tokensIn, tokensOut } dipakai bila usage tidak ada (mis. stream dihentikan karena batas waktu) —
   biayanya nanti dihitung analitik dari harga model. Tidak pernah melempar error. */
export const recordAiCost = async (model, usage, estimate = null) => {
  if (tableMissing) return;
  const ctx = store.getStore() || {};
  const cost = Number(usage?.cost);
  const row = {
    member_code: String(ctx.code || 'system').slice(0, 40),
    kind: String(ctx.kind || 'other').slice(0, 30),
    detail: ctx.detail ? String(ctx.detail).slice(0, 40) : null,
    model: String(model || '').slice(0, 100),
    cost_usd: Number.isFinite(cost) ? cost : null,
    tokens_in: int(usage?.prompt_tokens ?? estimate?.tokensIn),
    tokens_out: int(usage?.completion_tokens ?? estimate?.tokensOut),
    estimated: !Number.isFinite(cost),
  };
  try {
    const { url, key } = sbConfig();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const r = await fetch(`${url}/rest/v1/ai_cost_log`, {
      method: 'POST',
      signal: controller.signal,
      headers: sbHeaders(key, { Prefer: 'return=minimal' }),
      body: JSON.stringify(row),
    });
    clearTimeout(timer);
    if (r.status === 404 || (r.status === 400 && /ai_cost_log|relation/i.test(await r.text().catch(() => '')))) tableMissing = true;
  } catch {}
};
