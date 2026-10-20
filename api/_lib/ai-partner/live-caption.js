// Live Caption: satu potongan audio kuliah → transkrip + terjemah + istilah + tanda "ditekankan duktur".
// Dipakai handler action "live-caption" (api/ai-partner.js) dan skrip uji kualitas.
import { callAI, callAIJson } from '../ai.js';
import { liveTranscribePrompt, liveTranslatePrompt, liveTranslateInput } from './prompts.js';

const isStr = (v) => typeof v === 'string';
const clean = (v, n = 4000) => (isStr(v) ? v.trim().slice(0, n) : '');
const SILENT = /^\[?\s*(HENING|NONE)\s*\]?\.?$/i;
const FATAL = /credit|insufficient|402|403|401|key limit/i;

/* context: { title, prevTail, prevId, terms, learner } — hanya dipakai tahap 2 (teks), tidak pernah bersama audio.
   Mengembalikan { ar, id, istilah, penting, partial }; ar kosong = tidak ada ucapan. */
export const runLiveCaption = async ({ audio, dialect = 'campur', model, context = {} }) => {
  // Tahap 1 — dengar: audio → transkrip tanpa konteks kuliah. Dengan konteks, model "mendengar" kuliah dari derau
  // kelas dan mengarang ucapan duktur; dengan instruksi polos ia menjawab [HENING]. Gangguan sesaat dicoba ulang sekali.
  let heard = '';
  for (let attempt = 0; ; attempt++) {
    try {
      heard = (await callAI({
        model, maxTokens: 1200, temperature: 0,
        messages: [{ role: 'user', content: [
          { type: 'input_audio', input_audio: { data: audio, format: 'wav' } },
          { type: 'text', text: liveTranscribePrompt({ dialect }) },
        ] }],
      })).trim();
      break;
    } catch (err) {
      if (/tidak mengembalikan hasil/i.test(err.message)) { heard = ''; break; }
      if (attempt >= 1 || FATAL.test(err.message)) throw err;
    }
  }
  heard = clean(heard.replace(/\[HENING\]/gi, ''));
  if (!heard || SILENT.test(heard)) return { ar: '', id: '', istilah: [], penting: false, partial: false };

  // Tahap 2 — terjemah: hanya TEKS transkrip + konteks. Gagal di sini tidak membuang hasil dengar.
  let out = null;
  try {
    out = await callAIJson({
      model, maxTokens: 1500, temperature: 0,
      system: liveTranslatePrompt({ dialect, ...context }),
      messages: [{ role: 'user', content: liveTranslateInput(heard) }],
    });
  } catch (err) {
    if (FATAL.test(err.message)) throw err;
    console.warn('[live-caption] terjemah gagal:', err.message);
  }
  // "ar" tahap 2 hanya boleh merapikan transkrip, bukan menambah: kalau jauh lebih panjang, pakai hasil dengar.
  const tidy = clean(out?.ar);
  const ar = tidy && tidy.length <= heard.length * 1.3 + 20 ? tidy : heard;
  // Kartu menampilkan teks biasa: buang sisa markdown (*miring*, **tebal**). Mode Indonesia: "id" boleh kosong.
  const id = clean(out?.id).replace(/\*+([^*\n]+)\*+/g, '$1');
  const istilah = !Array.isArray(out?.istilah) ? [] : out.istilah
    .map(t => ({ ar: clean(t?.ar, 60), id: clean(t?.id, 80) }))
    .filter(t => t.ar && t.id)
    .slice(0, 3);
  return { ar, id: id === ar ? '' : id, istilah, penting: out?.penting === true, partial: !out };
};
