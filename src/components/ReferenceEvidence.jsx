import React, { useEffect, useState } from 'react';

export const referenceText = (message) => `${message.content || ''}${message.refs?.length ? '\n\nDasar rujukan:\n' + message.refs.map((r, i) => `[${i + 1}] ${r.edition?.title || r.title}${r.edition?.author ? ` — ${r.edition.author}` : ''}, ${r.source_type === 'material' ? 'teks materi pribadi, bukan halaman PDF' : `halaman PDF ${r.page}`}${r.printed ? ` (cetak ${r.printed.p})` : ''}\n${r.quote}`).join('\n\n') : ''}`;

const ReferencePage = ({ reference: r, onClose }) => {
  const [data, setData] = useState(null);
  useEffect(() => {
    let alive = true;
    window.aiCall('reference-page', { document_id: r.document_id, page: r.page }).then(d => { if (alive) setData(d); });
    const key = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', key);
    return () => { alive = false; window.removeEventListener('keydown', key); };
  }, [r.document_id, r.page]);
  return <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-3" onClick={onClose}>
    <section role="dialog" aria-modal="true" aria-label="Bukti teks kitab" className="bg-[#111916] border border-emerald-400/20 rounded-2xl w-full max-w-2xl max-h-[85dvh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
      <div className="p-4 border-b border-white/10 flex justify-between items-start gap-3">
        <div className="min-w-0"><h3 className="text-ink font-medium" dir="auto">{r.edition?.title || r.title}</h3><p className="text-xs text-ink-soft mt-1">Halaman PDF {r.page} · teks hasil ekstraksi{r.printed ? ` · cetak ${r.printed.p}${r.printed.s === 'inferred' ? ' (perkiraan urutan)' : ''}` : ''}</p></div>
        <button autoFocus className="btn btn-ghost text-sm" onClick={onClose}>Tutup</button>
      </div>
      <div className="p-4 overflow-y-auto">
        {!data ? <p className="text-sm text-ink-soft">Memuat teks halaman…</p> : !data.ok ? <p className="text-sm text-red-300">{data.error}</p> : <>
          <p className="text-xs text-ink-soft mb-3">Teks ini berasal dari PDF yang diunggah admin. Hasil OCR bisa keliru; keberadaan kutipan tidak membuktikan kesahihan hadis atau ketepatan kesimpulan AI.</p>
          <blockquote dir="auto" className="arabic text-lg leading-loose p-3 border-s-2 border-emerald-400 bg-emerald-400/5 mb-4 whitespace-pre-wrap">{r.quote}</blockquote>
          <p dir="auto" className="arabic text-lg leading-loose whitespace-pre-wrap break-words text-ink">{data.text}</p>
        </>}
      </div>
    </section>
  </div>;
};

export default function ReferenceEvidence({ refs, grounded, needsClarification }) {
  const [selected, setSelected] = useState(null);
  if (!refs?.length) return <p className="mt-2 text-xs text-amber-200/80">{needsClarification ? 'Konteks perlu diperjelas sebelum memilih rujukan.' : grounded === false ? 'Dasar rujukan belum ditemukan; Talqeeh menahan jawaban.' : 'Jawaban lama ini belum memiliki rujukan yang diperiksa lewat pustaka.'}</p>;
  return <div className="mt-4 space-y-2 min-w-0">
    <p className="text-xs text-emerald-300">Dasar rujukan · kutipan cocok dengan teks tersimpan</p>
    {refs.map((r, i) => <details key={`${r.document_id}-${r.page}-${i}`} className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.04] p-3">
      <summary className="cursor-pointer text-sm text-ink break-words">[{i + 1}] <span dir="auto">{r.edition?.title || r.title}</span> · {r.source_type === 'material' ? 'Materi pribadi' : `PDF ${r.page}`}</summary>
      <p className="text-xs text-ink-soft mt-2" dir="auto">{[r.edition?.author, r.edition?.publisher, r.edition?.edition, r.edition?.year].filter(Boolean).join(' · ') || 'Metadata edisi belum lengkap'}</p>
      <blockquote dir="auto" className="arabic text-lg leading-loose mt-2 whitespace-pre-wrap break-words">{r.quote}</blockquote>
      {r.source_type === 'material' ? <p className="mt-2 text-xs text-ink-soft">Kutipan dari materi belajarmu; periksa di tab Materi. Nomor halaman PDF tidak tersedia.</p> : <button className="mt-2 text-xs text-emerald-200 underline underline-offset-4 min-h-[40px]" onClick={() => setSelected(r)}>Periksa teks halaman {r.page}</button>}
    </details>)}
    <p className="text-[11px] text-ink-soft">Nomor PDF berbeda dari nomor cetak. Sumber sekunder dan kesahihan hadis belum otomatis diverifikasi.</p>
    {selected && <ReferencePage reference={selected} onClose={() => setSelected(null)}/>}
  </div>;
}
