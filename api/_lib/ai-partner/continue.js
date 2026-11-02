/* Jawaban chat yang terhenti karena batas token disambung otomatis (maks. 2 kali) selama waktu fungsi masih cukup,
   jadi pelajar tidak perlu mengetik "lanjutkan". Terhenti karena waktu habis tidak disambung. */

export const CUT_NOTE_MARK = 'Jawaban terpotong karena terlalu panjang';
export const CONTINUE_MIN_LEFT_MS = 12000;
export const CONTINUE_INSTRUCTION = 'Lanjutkan jawabanmu persis dari titik berhenti tadi. Jangan mengulang apa pun yang sudah ditulis, jangan membuka dengan sapaan atau ringkasan; kalau berhenti di tengah kata, selesaikan kata itu. Selesaikan jawaban secara ringkas dan akhiri dengan bagian penutup yang diminta.';

// "lanjutkan" setelah jawaban yang terpotong: kelanjutan pertanyaan yang sama, jadi tidak memakan jatah.
export const isContinueAfterCut = (message, lastAssistant) =>
  /^(lanjut(kan)?|teruskan|continue)[\s.!]*$/i.test(String(message || '').trim())
  && typeof lastAssistant === 'string' && lastAssistant.includes(CUT_NOTE_MARK);

// deps dipasang dari ai-partner.js (runAI, streamAI, requestAI); now bisa diganti di tes.
export const makeRunContinued = ({ runAI, streamAI, requestAI, now = Date.now, log = console.error }) =>
  async (body, res, opts, maxRounds = 2) => {
    const started = now();
    const first = await runAI(body, res, opts);
    if (first.failed) return first;
    const { stream } = first;
    let out = first.out;
    for (let round = 0; round < maxRounds && out.truncated && !out.timedOut; round++) {
      const left = opts.timeLimitMs - (now() - started);
      if (left < CONTINUE_MIN_LEFT_MS) break;
      const next = {
        ...opts, timeLimitMs: left, thinking: 0,
        messages: [...opts.messages, { role: 'assistant', content: out.text.trimEnd() }, { role: 'user', content: CONTINUE_INSTRUCTION }],
      };
      let seen = '';
      try {
        const more = stream
          ? await streamAI(next, (d) => { seen += d; stream.delta(d); })
          : await requestAI(next);
        out = { ...out, text: out.text + more.text, truncated: more.truncated, timedOut: more.timedOut };
      } catch (err) {
        log('[ai-partner:continue]', err.message);
        // Potongan yang sempat tampil di layar tetap dibawa supaya jawaban tersimpan sama dengan yang dibaca.
        if (seen) out = { ...out, text: out.text + seen };
        break;
      }
    }
    return { out, stream };
  };
