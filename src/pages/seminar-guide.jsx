import React, { useEffect } from 'react';
/* Talqeeh — Panduan Pemateri seminar AI (tidak ditautkan; hanya lewat URL). Ramah cetak: tema terang saat dicetak. */

const GUIDE_CHECKLIST = [
  "Coba demo hook di rumah dengan alat AI yang sama. Siapkan kitab aslinya (Maktabah Syamilah atau cetak) agar pengecekan cepat.",
  "Simpan PDF slide di flashdisk dan HP sebagai cadangan kalau internet atau proyektor bermasalah.",
  "Buka mode slide di laptop, tekan F untuk layar penuh, uji tombol P (catatan) dan T (timer tugas).",
  "Scan QR di slide 'Ambil lembar kerjamu' dan 'Lanjutkan bersama Talqeeh' dari jarak belakang ruangan.",
  "Siapkan hotspot cadangan. Peserta butuh internet untuk memakai alat AI saat tugas.",
  "Jika ada penawaran khusus peserta, isi SEMINAR_CTA_OFFER di seminar-qr.jsx sebelum acara.",
  "Minta panitia mengingatkan peserta membawa HP atau laptop, satu bab diktat, dan akun salah satu alat AI.",
];


const SeminarGuidePage = () => {
  useEffect(() => {
    const m = document.createElement("meta");
    m.name = "robots"; m.content = "noindex, nofollow";
    document.head.appendChild(m);
    const st = document.createElement("style");
    st.textContent = `@media print {
      html, body { background: #fff !important; }
      header, footer, nav, .pg-hide, .fixed { display: none !important; }
      .pg-root, .pg-root * { color: #111 !important; background: transparent !important; box-shadow: none !important; border-color: #bbb !important; }
      .pg-root { padding: 0 !important; }
      .pg-slide { break-inside: avoid; }
      .pg-h { break-after: avoid; }
    }`;
    document.head.appendChild(st);
    return () => { m.remove(); st.remove(); };
  }, []);

  const S = window.SEMINAR_SCHEDULE;
  const slides = window.buildSeminarSlides();
  const notes = window.SEMINAR_NOTES || {};
  const chapters = window.SEMINAR_CHAPTERS;
  const clock = window.seminarClock;
  const segName = (seg) => seg === 0 ? "Pembuka" : seg > chapters.length ? "Penutup" : "Bab " + seg + ": " + chapters[seg - 1].title;
  const groups = [];
  slides.forEach((sl, i) => {
    if (!groups.length || groups[groups.length - 1].seg !== sl.seg) groups.push({ seg: sl.seg, items: [] });
    groups[groups.length - 1].items.push({ sl, n: i + 1 });
  });

  return (
    <div className="page-enter pg-root">
      <div className="pg-hide">
        <PageHeader kicker="Untuk pemateri" title="Panduan Pemateri" subtitle="Jadwal tiga jam, persiapan, dan catatan tiap slide. Gunakan Cetak untuk menyimpan sebagai PDF."/>
      </div>
      <section className="pb-20">
        <div className="container-x max-w-4xl">
          <div className="hidden print:block mb-4">
            <h1 className="text-2xl font-bold">Panduan Pemateri: Seminar AI untuk Pendidikan</h1>
            <p className="text-sm">AIGYPT x Talqeeh, 3 jam, peserta S1 Masisir. {slides.length} slide.</p>
          </div>
          <div className="pg-hide flex flex-wrap gap-2 mb-6">
            <button onClick={() => window.print()} className="btn btn-gold text-sm py-2.5"><Icon name="download" className="w-4 h-4"/> Cetak / simpan PDF</button>
            <button onClick={() => navigate(window.SEMINAR_AI_SLIDES_PATH)} className="btn btn-ghost text-sm py-2.5"><Icon name="play" className="w-4 h-4"/> Buka mode slide</button>
          </div>

          <h2 className="pg-h font-display text-2xl font-semibold text-ink mb-3">Jadwal 3 jam</h2>
          <div className="card-glass overflow-hidden mb-8">
            <table className="w-full text-sm md:text-base">
              <thead>
                <tr className="text-left text-ink-muted border-b border-line">
                  <th className="px-3 md:px-4 py-2.5 font-medium">Waktu</th>
                  <th className="px-3 md:px-4 py-2.5 font-medium">Kegiatan</th>
                  <th className="px-3 md:px-4 py-2.5 font-medium text-right">Menit</th>
                </tr>
              </thead>
              <tbody>
                {S.blocks.map(b => (
                  <tr key={b.key} className={"border-b border-line last:border-0 " + (b.kind === "task" ? "text-gold-200" : "text-ink-muted")}>
                    <td className="px-3 md:px-4 py-2 num whitespace-nowrap">{clock(b.start)} sampai {clock(b.end)}</td>
                    <td className="px-3 md:px-4 py-2 text-ink">{b.label.replace(": ", " ")}{b.ch ? ": " + b.ch.title : ""}</td>
                    <td className="px-3 md:px-4 py-2 num text-right">{b.min}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr><td className="px-3 md:px-4 py-2.5 text-ink font-medium" colSpan={2}>Total</td><td className="px-3 md:px-4 py-2.5 num text-right text-ink font-medium">{S.total}</td></tr>
              </tfoot>
            </table>
          </div>

          <h2 className="pg-h font-display text-2xl font-semibold text-ink mb-3">Persiapan sebelum acara</h2>
          <ul className="space-y-2 mb-10">
            {GUIDE_CHECKLIST.map((t, i) => (
              <li key={i} className="flex gap-3 text-ink-muted leading-relaxed">
                <span className="mt-1 w-4 h-4 rounded border border-white/30 shrink-0"/><span className="min-w-0">{t}</span>
              </li>
            ))}
          </ul>

          <h2 className="pg-h font-display text-2xl font-semibold text-ink mb-1">Catatan per slide</h2>
          <p className="text-ink-muted text-sm mb-5">Di mode slide, tekan <strong>P</strong> untuk menampilkan catatan ini di layar laptopmu.</p>
          {groups.map(g => (
            <div key={g.seg} className="mb-8">
              <h3 className="pg-h font-display text-xl font-semibold text-gold-300 mb-3">{segName(g.seg)}</h3>
              <div className="space-y-3">
                {g.items.map(({ sl, n }) => {
                  const nt = notes[sl.key];
                  return (
                    <div key={sl.key} className="pg-slide card-glass p-4 md:p-5">
                      <div className="flex items-baseline gap-3 mb-1.5">
                        <span className="num text-gold-400 text-sm shrink-0">#{n}</span>
                        <span className="text-ink font-medium leading-snug">{window.seminarSlideTitle(sl)}</span>
                      </div>
                      <p className="text-ink-muted leading-relaxed">{nt ? nt.say : "Belum ada catatan."}</p>
                      {nt && nt.cue && <p className="text-gold-200 text-sm mt-2"><span className="font-semibold">Isyarat:</span> {nt.cue}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

Object.assign(window, { SeminarGuidePage });
