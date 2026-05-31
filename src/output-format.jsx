import React from 'react';
/* Talqeeh — Format Output Helper
   Auto-append instruksi format ke prompt saat copy.
   Diimpor dari main.jsx setelah adaptive-prompt.jsx.
*/

const OUTPUT_FORMAT_INSTRUCTION = `
---
📋 FORMAT JAWABAN YANG DIINGINKAN:

1. PENJELASAN UTAMA dalam Bahasa Indonesia yang jelas dan terstruktur.

2. KUTIPAN ARAB: Untuk setiap istilah teknis, kaidah, atau konsep penting, sertakan teks Arab aslinya (beri harakat bila perlu) diikuti transliterasi dan arti Indonesianya. Contoh: المُبْتَدَأ (al-mubtada') = subjek.

3. RUJUKAN LITERATUR: Bila menjelaskan kaidah atau pendapat ulama, sebutkan sumbernya dalam Bahasa Arab beserta penulis/kitabnya bila kamu mengetahuinya (misal: قال ابن مالك في الألفية). Jika tidak yakin sumbernya, katakan terus terang — JANGAN mengarang rujukan.

4. STRUKTUR RAPI: Gunakan poin atau penomoran, dan pisahkan teks Arab (rata kanan) dari penjelasan Indonesia agar mudah dibaca.

5. Jika ada khilaf (perbedaan pendapat) ulama, sajikan secara berimbang antar madzhab.
---`;

const withFormatInstruction = (promptText, enabled) => {
  if (!enabled) return promptText;
  return promptText + "\n\n" + OUTPUT_FORMAT_INSTRUCTION;
};

const getFormatPref = () => {
  const v = localStorage.getItem("madad_format_rapi");
  return v === null ? true : v === "true";
};

const setFormatPref = (val) => {
  localStorage.setItem("madad_format_rapi", String(val));
};

const FormatToggle = ({ enabled, onChange }) => (
  <label className="flex items-center gap-2 cursor-pointer select-none group">
    <div className="relative flex-shrink-0">
      <input type="checkbox" className="sr-only" checked={enabled} onChange={e => onChange(e.target.checked)}/>
      <div className="w-8 h-[18px] rounded-full transition-colors border"
        style={{
          background: enabled ? "rgba(62,207,142,0.25)" : "rgba(255,255,255,0.06)",
          borderColor: enabled ? "rgba(62,207,142,0.5)" : "rgba(255,255,255,0.15)",
        }}/>
      <div className="absolute top-[2px] left-[2px] w-[14px] h-[14px] rounded-full transition-transform"
        style={{
          background: enabled ? "#3ecf8e" : "rgba(255,255,255,0.35)",
          transform: enabled ? "translateX(14px)" : "translateX(0)",
        }}/>
    </div>
    <span className="text-xs text-ink-soft group-hover:text-ink-muted transition-colors">Format rapi (Arab + sumber)</span>
  </label>
);

Object.assign(window, {
  OUTPUT_FORMAT_INSTRUCTION,
  withFormatInstruction,
  getFormatPref,
  setFormatPref,
  FormatToggle,
});
