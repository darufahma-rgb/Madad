import React from 'react';
/* Talqeeh — Visual animasi untuk slide seminar AI.
   Semua SVG/CSS murni. Animasi didefinisikan lewat kelas .sv-* (lihat SEMINAR_VIZ_CSS) dan hanya
   berjalan saat slide dimuat; di bawah prefers-reduced-motion semuanya tampil langsung dalam keadaan akhir.
   Catatan jujur: angka di visual "ilustrasi" adalah contoh konsep, bukan hasil pengukuran. */

const GOLD = "#C9A86A";
const GOLD_SOFT = "#E8D0A0";
const SURFACE = "#0b0b0a";

const SEMINAR_VIZ_CSS = `
@keyframes svFade { from { opacity: 0; } to { opacity: 1; } }
@keyframes svRise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
@keyframes svGrowX { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes svGrowY { from { transform: scaleY(0); } to { transform: scaleY(1); } }
@keyframes svPop { from { opacity: 0; transform: scale(.55); } to { opacity: 1; transform: none; } }
@keyframes svDraw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
@keyframes svBlink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
.sv-fade { animation: svFade .7s ease both; }
.sv-rise { animation: svRise .75s cubic-bezier(.16,1,.3,1) both; }
.sv-growx { transform-origin: left center; animation: svGrowX .95s cubic-bezier(.16,1,.3,1) both; }
.sv-growy { transform-origin: center top; animation: svGrowY .95s cubic-bezier(.16,1,.3,1) both; }
.sv-pop { transform-box: fill-box; transform-origin: center; animation: svPop .6s cubic-bezier(.16,1,.3,1) both; }
.sv-pop-b { transform-box: fill-box; transform-origin: 50% 100%; animation: svPop .8s cubic-bezier(.16,1,.3,1) both; }
.sv-draw { stroke-dasharray: 1; animation: svDraw 1.8s cubic-bezier(.4,0,.2,1) both; }
.sv-blink { animation: svBlink 1s step-end infinite; }
@media (prefers-reduced-motion: reduce) {
  .sv-fade, .sv-rise, .sv-growx, .sv-growy, .sv-pop, .sv-pop-b, .sv-draw, .sv-blink { animation: none !important; }
}
`;

const dl = (i, base = 0, step = 140) => ({ animationDelay: (base + i * step) + "ms" });
const pad2 = (n) => String(n).padStart(2, "0");

/* ── 1. AI ⊃ ML ⊃ DL ⊃ LLM ───────────────────────────────────── */
const VizNesting = () => {
  const rows = [
    { r: 190, short: "AI", t: "Kecerdasan Buatan (AI)", d: "Sistem yang meniru kemampuan kognitif manusia.", fill: 0.03 },
    { r: 146, short: "Machine learning", t: "Machine learning", d: "Belajar pola dari data, bukan dari aturan yang ditulis manual.", fill: 0.05 },
    { r: 102, short: "Deep learning", t: "Deep learning", d: "Jaringan saraf berlapis-lapis, dasar AI modern.", fill: 0.075 },
    { r: 58, short: "LLM", t: "LLM (model bahasa besar)", d: "Dilatih pada teks sangat banyak. ChatGPT, Claude, dan Gemini termasuk di sini.", fill: 0.12 },
  ];
  const cx = 200, bottom = 394;
  return (
    <div className="grid md:grid-cols-12 gap-4 md:gap-10 items-center">
      <svg viewBox="0 0 400 400" className="md:col-span-5 w-full mx-auto max-h-[27vh] md:max-h-[44vh]" style={{ maxWidth: 440 }} role="img"
           aria-label="Diagram lingkaran bersarang: AI memuat machine learning, yang memuat deep learning, yang memuat LLM">
        {rows.map((row, i) => (
          <g key={row.t}>
            <circle className="sv-pop-b" style={dl(i, 100, 260)} cx={cx} cy={bottom - row.r} r={row.r}
                    fill={"rgba(201,168,106," + row.fill + ")"} stroke="rgba(201,168,106,0.55)" strokeWidth="1.5"/>
            <text className="sv-fade" style={dl(i, 380, 260)} x={cx} y={i === rows.length - 1 ? bottom - row.r + 6 : bottom - 2 * row.r + 28}
                  textAnchor="middle" fill={i === rows.length - 1 ? GOLD_SOFT : "#d8d8d8"}
                  fontSize={i === rows.length - 1 ? 22 : 17} fontWeight={i === rows.length - 1 ? 700 : 500}>{row.short}</text>
          </g>
        ))}
      </svg>
      <ol className="md:col-span-7 grid gap-[clamp(0.6rem,1.8vh,1.3rem)]">
        {rows.map((row, i) => (
          <li key={row.t} className="sv-rise flex gap-4 items-start" style={dl(i, 500, 260)}>
            <span className="num text-gold-400 w-7 shrink-0 pt-0.5">{pad2(i + 1)}</span>
            <span className="min-w-0">
              <span className="block text-ink font-display font-medium text-[clamp(1.05rem,min(2vw,3.4vh),1.6rem)] leading-snug">{row.t}</span>
              <span className="hidden md:block text-ink-muted text-[clamp(0.9rem,min(1.5vw,2.6vh),1.2rem)] leading-snug mt-0.5">{row.d}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
};

/* ── 2. Prediksi token berikutnya ────────────────────────────── */
const VizNextToken = () => {
  const words = ["Belajar", "bahasa", "Arab", "itu"];
  const cands = [
    { w: "menyenangkan", p: 34 }, { w: "penting", p: 27 }, { w: "sulit", p: 18 },
    { w: "seru", p: 11 }, { w: "melelahkan", p: 6 }, { w: "lainnya", p: 4 },
  ];
  return (
    <div className="max-w-[1000px]">
      <div className="flex flex-wrap items-center gap-2 mb-[clamp(0.9rem,3vh,2rem)]">
        {words.map((w, i) => (
          <span key={w} className="sv-pop-chip sv-rise px-3.5 py-1.5 rounded-xl border border-white/15 bg-white/[0.04] text-ink text-[clamp(1rem,min(2vw,3.4vh),1.5rem)]" style={dl(i, 0, 160)}>{w}</span>
        ))}
        <span className="sv-fade inline-block w-[3px] h-[1.6em] bg-gold-400 sv-blink ml-1" style={dl(0, 800)} aria-hidden="true"/>
      </div>
      <div className="grid gap-[clamp(0.45rem,1.4vh,0.85rem)]" role="img" aria-label="Peluang contoh untuk kata berikutnya: menyenangkan 34 persen, penting 27, sulit 18, seru 11, melelahkan 6, lainnya 4">
        {cands.map((c, i) => (
          <div key={c.w} className="grid grid-cols-[6.5rem_1fr_2.6rem] md:grid-cols-[9rem_1fr_3rem] items-center gap-3">
            <span className={"sv-fade text-right text-[clamp(0.9rem,min(1.5vw,2.8vh),1.3rem)] " + (i === 0 ? "text-gold-300 font-medium" : "text-ink-muted")} style={dl(i, 900, 120)}>{c.w}</span>
            <span className="relative h-[10px] rounded-full bg-white/[0.06] overflow-hidden">
              <span className="sv-growx absolute inset-y-0 left-0 rounded-full"
                    style={{ width: (c.p * 2) + "%", background: i === 0 ? GOLD : "rgba(255,255,255,0.28)", animationDelay: (1000 + i * 130) + "ms" }}/>
            </span>
            <span className={"sv-fade num tabular-nums text-sm md:text-base " + (i === 0 ? "text-gold-300" : "text-ink-muted")} style={dl(i, 1300, 130)}>{c.p}%</span>
          </div>
        ))}
        <div className="grid grid-cols-[6.5rem_1fr_2.6rem] md:grid-cols-[9rem_1fr_3rem] gap-3 text-xs text-ink-muted">
          <span/><span className="flex justify-between"><span>0%</span><span>50%</span></span><span/>
        </div>
      </div>
    </div>
  );
};

/* ── 3. Rumus prompt lima bagian ─────────────────────────────── */
const VizFormula = () => {
  const rows = [
    { k: "Peran", v: "Kamu tutor nahwu untuk mahasiswa Al-Azhar" },
    { k: "Konteks", v: "Tingkat 2, ujian minggu depan" },
    { k: "Tugas", v: "Jelaskan isim mamnu' minas sharf" },
    { k: "Format", v: "Tabel, istilah Arab berharakat" },
    { k: "Batasan", v: "Jangan mengarang kutipan kitab" },
  ];
  return (
    <div className="max-w-[1000px]">
      <div className="relative pl-5 md:pl-7">
        <span className="sv-growy absolute left-0 top-1 bottom-1 w-[2px] rounded-full" style={{ background: GOLD }} aria-hidden="true"/>
        <ol className="grid gap-[clamp(0.45rem,1.6vh,1rem)]">
          {rows.map((r, i) => (
            <li key={r.k} className="sv-rise grid grid-cols-[5.2rem_1fr] md:grid-cols-[8rem_1fr] items-baseline gap-3 md:gap-6" style={dl(i, 150, 230)}>
              <span className="text-gold-300 font-medium text-[clamp(0.95rem,min(1.7vw,3vh),1.35rem)]">{r.k}</span>
              <span className="text-ink text-[clamp(1rem,min(2vw,3.6vh),1.6rem)] leading-snug">{r.v}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="sv-rise mt-[clamp(0.9rem,3vh,2rem)] inline-flex items-center gap-3 rounded-xl border border-gold-500/45 bg-gold-500/[0.07] px-4 py-2.5" style={dl(0, 1500)}>
        <Icon name="arrowRight" className="w-5 h-5 text-gold-300"/>
        <span className="text-ink text-[clamp(1rem,min(1.9vw,3.4vh),1.5rem)] font-medium">Jawaban tepat sasaran</span>
      </div>
    </div>
  );
};

/* ── 4. Kurva lupa (ilustrasi konsep) ────────────────────────── */
const VizForgetting = () => {
  const W = 540, H = 330, L = 48, R = 112, T = 26, B = 46;
  const pw = W - L - R, ph = H - T - B;
  const X = (t) => L + (t / 14) * pw;
  const Y = (v) => T + (1 - v) * ph;
  const seg = (t0, t1, s) => { const a = []; for (let k = 0; k <= 28; k++) { const t = t0 + (t1 - t0) * k / 28; a.push([t, Math.exp(-(t - t0) / s)]); } return a; };
  const reviews = [1, 3, 7, 14];
  const plan = [[0, 1, 2.2], [1, 3, 4], [3, 7, 8], [7, 14, 16]];
  let d = "";
  plan.forEach(([t0, t1, s], si) => {
    seg(t0, t1, s).forEach(([t, v], k) => { d += (si === 0 && k === 0 ? "M" : "L") + X(t).toFixed(1) + " " + Y(v).toFixed(1) + " "; });
  });
  d += "L" + X(14).toFixed(1) + " " + Y(1).toFixed(1);
  const dA = seg(0, 14, 2.2).map(([t, v], k) => (k === 0 ? "M" : "L") + X(t).toFixed(1) + " " + Y(v).toFixed(1)).join(" ");
  return (
    <div>
      <div className="flex flex-wrap gap-x-6 gap-y-1.5 mb-3 text-[clamp(0.8rem,1.3vw,1rem)] text-ink-muted">
        <span className="inline-flex items-center gap-2"><span className="inline-block w-6 h-[3px] rounded" style={{ background: GOLD }}/>Dengan pengulangan (hari 1, 3, 7, 14)</span>
        <span className="inline-flex items-center gap-2"><span className="inline-block w-6 h-[2px] rounded bg-[#8a8a8a]"/>Tanpa pengulangan</span>
        <span className="inline-flex items-center gap-2"><svg width="12" height="12" aria-hidden="true"><circle cx="6" cy="6" r="5" fill={GOLD} stroke={SURFACE} strokeWidth="2"/></svg>Sesi mengulang</span>
      </div>
      <svg viewBox={"0 0 " + W + " " + H} className="w-full" style={{ maxHeight: "38vh" }} role="img"
           aria-label="Grafik ilustrasi: ingatan turun cepat tanpa pengulangan, dan bertahan lebih lama dengan pengulangan pada hari 1, 3, 7, dan 14">
        {[0, 0.5, 1].map((v) => (
          <g key={v}>
            <line x1={L} x2={W - R} y1={Y(v)} y2={Y(v)} stroke="rgba(255,255,255,0.09)" strokeWidth="1"/>
            <text x={L - 8} y={Y(v) + 4} textAnchor="end" fill="#8c8c8c" fontSize="14">{Math.round(v * 100)}%</text>
          </g>
        ))}
        {reviews.map((t, i) => (
          <g key={t}>
            <line className="sv-fade" style={{ animationDelay: (500 + (t / 14) * 2200) + "ms" }} x1={X(t)} x2={X(t)} y1={Y(1)} y2={Y(0)} stroke="rgba(201,168,106,0.22)" strokeWidth="1" strokeDasharray="3 4"/>
            <text x={X(t)} y={H - 18} textAnchor="middle" fill="#9a9a9a" fontSize="14">{t}</text>
          </g>
        ))}
        <text x={L} y={H - 18} textAnchor="middle" fill="#9a9a9a" fontSize="14">0</text>
        <text x={(L + W - R) / 2} y={H - 2} textAnchor="middle" fill="#8c8c8c" fontSize="13">Hari</text>
        <path d={dA} pathLength="1" className="sv-draw" style={{ animationDelay: "300ms", animationDuration: "1.5s" }} fill="none" stroke="#8a8a8a" strokeWidth="2" strokeLinejoin="round"/>
        <path d={d} pathLength="1" className="sv-draw" style={{ animationDelay: "600ms", animationDuration: "2.4s" }} fill="none" stroke={GOLD} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
        {reviews.map((t) => (
          <circle key={t} className="sv-pop" style={{ animationDelay: (600 + (t / 14) * 2400) + "ms" }} cx={X(t)} cy={Y(1)} r="5.5" fill={GOLD} stroke={SURFACE} strokeWidth="2"/>
        ))}
        <text className="sv-fade" style={{ animationDelay: "2800ms" }} x={X(14) + 12} y={Y(1) + 5} fill={GOLD_SOFT} fontSize="14" fontWeight="500">Dengan ulang</text>
        <text className="sv-fade" style={{ animationDelay: "2000ms" }} x={X(14) + 12} y={Y(0) - 5} fill="#a0a0a0" fontSize="14">Tanpa ulang</text>
      </svg>
    </div>
  );
};

/* ── 5. Tiga cek ─────────────────────────────────────────────── */
const VizThreeChecks = () => {
  const items = [
    { t: "Cek nama", d: "Kitab dan pengarangnya benar-benar ada? Cari di Maktabah Syamilah atau katalog perpustakaan." },
    { t: "Cek halaman", d: "Buka kitabnya langsung. Teks itu memang ada di halaman yang disebut?" },
    { t: "Cek matan", d: "Bandingkan kata per kata. AI sering memparafrase tanpa memberi tahu." },
  ];
  return (
    <div>
      <ol className="grid md:grid-cols-3 gap-y-6 md:gap-x-10">
        {items.map((it, i) => (
          <li key={it.t} className="relative flex md:block gap-4">
            <span className="sv-pop shrink-0 w-14 h-14 rounded-full border border-gold-500/60 bg-gold-500/[0.08] flex items-center justify-center" style={dl(i, 200, 750)}>
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke={GOLD_SOFT} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12.5l4.5 4.5L19 7.5" pathLength="1" className="sv-draw" style={{ animationDuration: ".7s", animationDelay: (500 + i * 750) + "ms" }}/>
              </svg>
            </span>
            {i < items.length - 1 && (
              <>
                <span className="hidden md:block sv-growx absolute top-[27px] h-[2px] bg-gold-500/45" style={{ left: "4.4rem", right: "-1.6rem", ...dl(i, 800, 750) }} aria-hidden="true"/>
                <span className="md:hidden sv-growy absolute left-[27px] top-[3.6rem] w-[2px] bg-gold-500/45" style={{ height: "calc(100% - 2.6rem)", ...dl(i, 800, 750) }} aria-hidden="true"/>
              </>
            )}
            <div className="sv-rise min-w-0 md:mt-4" style={dl(i, 350, 750)}>
              <div className="font-display font-semibold text-ink text-[clamp(1.2rem,min(2.4vw,4vh),1.9rem)]">{it.t}</div>
              <p className="text-ink-muted text-[clamp(0.9rem,min(1.5vw,2.7vh),1.2rem)] leading-snug mt-1.5 max-w-[34ch]">{it.d}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="sv-rise mt-[clamp(1rem,3.4vh,2.4rem)] inline-flex items-center gap-3 rounded-xl border border-gold-500/45 bg-gold-500/[0.07] px-4 py-2.5" style={dl(0, 2700)}>
        <Icon name="check" className="w-5 h-5 text-gold-300" strokeWidth={2.2}/>
        <span className="text-ink font-medium text-[clamp(0.95rem,min(1.8vw,3.2vh),1.4rem)]">Lolos tiga cek: baru boleh masuk makalah</span>
      </div>
    </div>
  );
};

/* ── 6. Siapa mengerjakan apa (dot plot, ilustrasi) ──────────── */
const VizSpectrum = () => {
  const rows = [
    { t: "Merangkum diktat", v: 10 },
    { t: "Membuat latihan soal", v: 22 },
    { t: "Umpan balik awal", v: 40 },
    { t: "Penilaian akhir", v: 70 },
    { t: "Rujukan hukum syar'i", v: 92 },
    { t: "Sanad dan talaqqi", v: 98 },
  ];
  return (
    <div className="max-w-[1100px]" role="img" aria-label="Pembagian peran dari paling cocok untuk AI sampai paling harus dipegang manusia: merangkum, membuat latihan soal, umpan balik awal, penilaian akhir, rujukan hukum syar'i, sanad dan talaqqi">
      <div className="grid md:grid-cols-[14rem_1fr] gap-x-6 mb-2">
        <span className="hidden md:block"/>
        <div className="flex justify-between text-xs md:text-sm">
          <span className="text-gold-300">AI sangat membantu</span>
          <span className="text-ink-muted">Manusia dan kitab</span>
        </div>
      </div>
      <div className="grid gap-[clamp(0.55rem,1.8vh,1.2rem)]">
        {rows.map((r, i) => (
          <div key={r.t} className="grid md:grid-cols-[14rem_1fr] md:items-center gap-x-6 gap-y-1.5">
            <span className="sv-fade text-ink text-[clamp(0.95rem,min(1.6vw,2.9vh),1.3rem)]" style={dl(i, 100, 200)}>{r.t}</span>
            <span className="relative block h-5 mr-2">
              <span className="absolute left-0 right-0 top-1/2 h-px bg-white/15"/>
              <span className="sv-growx absolute left-0 top-1/2 -mt-px h-[2px] rounded-full" style={{ width: r.v + "%", background: "rgba(201,168,106,0.55)", ...dl(i, 300, 200) }}/>
              <span className="sv-pop absolute top-1/2 w-3.5 h-3.5 rounded-full" style={{ left: "calc(" + r.v + "% - 7px)", marginTop: -7, background: GOLD, boxShadow: "0 0 0 2px " + SURFACE, animationDelay: (1100 + i * 200) + "ms" }}/>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── 7. Rencana 7 hari ───────────────────────────────────────── */
const VizSevenDays = () => {
  const days = [
    "Ringkas materi", "Buat kuis dan kerjakan", "Perbaiki bagian yang salah", "Tutor penguji",
    "Tutor penguji lagi", "Ulang dengan flashcard", "Simulasi ujian tanpa catatan",
  ];
  return (
    <ol className="relative grid md:grid-cols-7 gap-y-4 md:gap-x-3">
      <span className="hidden md:block sv-growx absolute top-[21px] left-[22px] right-[22px] h-[2px] bg-gold-500/40" aria-hidden="true"/>
      <span className="md:hidden sv-growy absolute left-[21px] top-[22px] bottom-[22px] w-[2px] bg-gold-500/40" aria-hidden="true"/>
      {days.map((t, i) => {
        const last = i === days.length - 1;
        return (
          <li key={i} className="relative flex md:block items-center gap-4">
            <span className={"sv-pop relative z-[1] shrink-0 w-11 h-11 rounded-full flex items-center justify-center num font-semibold " + (last ? "text-[#0b0b0a]" : "text-gold-300")}
                  style={{ ...(last ? { background: GOLD } : { background: SURFACE, border: "1.5px solid rgba(201,168,106,0.65)" }), animationDelay: (300 + i * 220) + "ms" }}>{i + 1}</span>
            <span className="sv-rise block md:mt-3 min-w-0">
              <span className="block text-ink-muted text-xs mb-0.5 hidden md:block">Hari {i + 1}</span>
              <span className={"block leading-snug text-[clamp(0.9rem,min(1.35vw,2.6vh),1.15rem)] " + (last ? "text-gold-300 font-medium" : "text-ink")} style={dl(i, 450, 220)}>{t}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
};

const SEMINAR_VIZ = {
  nesting:    { C: VizNesting,     title: "AI, ML, deep learning, dan LLM", sub: "Satu di dalam yang lain, dari yang paling luas ke yang paling spesifik." },
  nexttoken:  { C: VizNextToken,   title: "LLM memprediksi kata berikutnya", sub: "Tiap kata dipilih dari peluang, bukan dicari di database.", note: "Ilustrasi konsep. Angka adalah contoh, bukan keluaran model tertentu." },
  formula:    { C: VizFormula,     title: "Rumus lima bagian", sub: "Susun prompt dari lima potongan, lalu perbaiki berulang." },
  forgetting: { C: VizForgetting,  title: "Mengulang berjarak melawan lupa", sub: "Tiap pengulangan membuat ingatan bertahan lebih lama.", note: "Ilustrasi konsep kurva lupa, bukan hasil pengukuran." },
  threechecks:{ C: VizThreeChecks, title: "Tiga cek sebelum dipakai", sub: "Referensi dari AI baru boleh masuk makalah setelah lolos semuanya." },
  spectrum:   { C: VizSpectrum,    title: "Siapa mengerjakan apa", sub: "Makin ke kanan, makin harus dipegang manusia, guru, dan kitab.", note: "Ilustrasi pembagian peran, bukan hasil pengukuran." },
  sevenday:   { C: VizSevenDays,   title: "Rencana belajar 7 hari", sub: "Dari ringkasan sampai simulasi ujian." },
};

/* Visual disisipkan SETELAH subtopik ini: { idBab: { judulSubtopik: idVisual } } */
const SEMINAR_VIZ_AFTER = {
  fundamental: { "Peta istilah": "nesting", "Cara kerja LLM, versi sederhana": "nexttoken" },
  prompting: { "Rumus lima bagian": "formula" },
  belajar: { "Flashcard, kuis, dan pengulangan": "forgetting" },
  adab: { "Protokol tiga cek": "threechecks" },
  pendidikan: { "Siapa mengerjakan apa": "spectrum" },
  praktik: { "Rencana belajar 7 hari": "sevenday" },
};

Object.assign(window, { SEMINAR_VIZ, SEMINAR_VIZ_AFTER, SEMINAR_VIZ_CSS });
