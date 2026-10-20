// Live Caption: satu potongan audio kuliah → transkrip + terjemah + istilah + tanda "ditekankan duktur".
// Dua tahap yang bisa dipanggil terpisah (halaman menampilkan teks Arab begitu tahap 1 selesai, terjemahnya menyusul):
//   liveHear      — audio → transkrip, TANPA konteks kuliah (lihat liveTranscribePrompt: konteks membuat model
//                   mengarang ucapan duktur dari derau kelas).
//   liveTranslate — teks transkrip + konteks → { ar (dirapikan), id, istilah, penting }.
// Dipakai action "live-hear" / "live-translate" / "live-caption" (api/ai-partner.js) dan skrip uji kualitas.
import { callAI, callAIJson } from '../ai.js';
import { liveTranscribePrompt, liveTranslatePrompt, liveTranslateInput } from './prompts.js';

const isStr = (v) => typeof v === 'string';
const clean = (v, n = 4000) => (isStr(v) ? v.trim().slice(0, n) : '');
const SILENT = /^\[?\s*(HENING|NONE)\s*\]?\.?$/i;
const FATAL = /credit|insufficient|402|403|401|key limit/i;

// Mengembalikan transkrip ('' = tidak ada ucapan). Gangguan sesaat dicoba ulang sekali.
export const liveHear = async ({ audio, dialect = 'campur', model }) => {
  let heard = '';
  for (let attempt = 0; ; attempt++) {
    try {
      heard = (await callAI({
        model, maxTokens: 1200, temperature: 0, thinking: 'off',
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
  return !heard || SILENT.test(heard) ? '' : heard;
};

/* context: { title, prevTail, prevId, terms, learner } — hanya dipakai di sini (teks), tidak pernah bersama audio.
   Gagal di sini tidak membuang hasil dengar: transkrip tetap dikembalikan dengan partial: true. */
export const liveTranslate = async ({ heard, dialect = 'campur', model, context = {} }) => {
  let out = null;
  try {
    out = await callAIJson({
      model, maxTokens: 1500, temperature: 0, thinking: 'off',
      system: liveTranslatePrompt({ dialect }),
      messages: [{ role: 'user', content: liveTranslateInput(heard, context) }],
    });
  } catch (err) {
    if (FATAL.test(err.message)) throw err;
    console.warn('[live-caption] terjemah gagal:', err.message);
  }
  // "ar" di sini hanya boleh merapikan transkrip, bukan menambah: kalau jauh lebih panjang, pakai hasil dengar.
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

// Satu panggilan untuk keduanya (dipakai action "live-caption" lama dan skrip uji).
export const runLiveCaption = async ({ audio, dialect = 'campur', model, translateModel, context = {} }) => {
  const heard = await liveHear({ audio, dialect, model });
  if (!heard) return { ar: '', id: '', istilah: [], penting: false, partial: false };
  return liveTranslate({ heard, dialect, model: translateModel || model, context });
};
