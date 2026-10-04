import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
/* Talqeeh — Mode slide untuk materi seminar AI.
   Data dari SEMINAR_CHAPTERS (seminar-ai.jsx): satu sumber untuk halaman baca dan slide.
   Bahasa visual: gelap editorial, satu aksen emas, tiap tipe slide punya komposisi sendiri. */

const SLIDES_KEY = "talqeeh_seminar_slide";

const textLen = (pts) => pts.reduce((n, p) => n + p.replace(/\*/g, "").length, 0);

const buildSeminarSlides = () => {
  const chapters = window.SEMINAR_CHAPTERS;
  const last = chapters.length + 1;
  const slides = [
    { type: "title", key: "title", seg: 0 },
    { type: "hook-poll", key: "hook-poll", seg: 0 },
    { type: "hook-demo", key: "hook-demo", seg: 0 },
    { type: "hook-goals", key: "hook-goals", seg: 0 },
    { type: "agenda", key: "agenda", seg: 0 },
  ];
  chapters.forEach((ch, ci) => {
    const seg = ci + 1;
    slides.push({ type: "chapter", key: "ch:" + ch.id, ch, ci, seg });
    const vizAfter = (window.SEMINAR_VIZ_AFTER || {})[ch.id] || {};
    const shotAfter = (window.SEMINAR_SHOT_AFTER || {})[ch.id] || {};
    ch.sections.forEach((s, si) => {
      slides.push({ type: "section", key: "sec:" + ch.id + ":" + si, ch, ci, s, seg });
      if (vizAfter[s.h]) slides.push({ type: "viz", key: "viz:" + vizAfter[s.h], viz: vizAfter[s.h], ch, ci, seg });
      (shotAfter[s.h] || []).forEach(id => {
        const shot = window.SEMINAR_SHOTS[id];
        if (shot && !shot.pending) slides.push({ type: "shot", key: "shot:" + id, shot, ch, ci, seg });
      });
    });
    if (ch.prompts) slides.push({ type: "prompts", key: "prompts:" + ch.id, ch, ci, seg });
    slides.push({ type: "practice", key: "task:" + ch.id, ch, ci, seg });
  });
  ["outputs", "worksheet", "cta", "closing"].forEach(t => slides.push({ type: t, key: t, seg: last }));
  return slides;
};

/* Judul singkat sebuah slide, untuk panduan pemateri. */
const seminarSlideTitle = (sl) => {
  const V = window.SEMINAR_VIZ || {};
  switch (sl.type) {
    case "title": return "Judul";
    case "hook-poll": return "Hook: angkat tangan";
    case "hook-demo": return "Hook: demo percaya atau cek";
    case "hook-goals": return "Yang kamu bawa pulang";
    case "agenda": return "Agenda";
    case "chapter": return "Pembuka Bab " + (sl.ci + 1) + ": " + sl.ch.title;
    case "section": return sl.s.h;
    case "viz": return "Visual: " + (V[sl.viz] ? V[sl.viz].title : sl.viz);
    case "shot": return "Screenshot: " + sl.shot.title;
    case "prompts": return "Contoh prompt";
    case "practice": return "Tugas: " + sl.ch.task.title;
    case "outputs": return "Paket Belajar AI Pribadi";
    case "worksheet": return "Ambil lembar kerjamu";
    case "cta": return "Lanjutkan bersama Talqeeh";
    case "closing": return "Penutup";
    default: return sl.type;
  }
};

const pad2 = (n) => String(n).padStart(2, "0");
const goldStroke = { WebkitTextStroke: "1.5px rgba(201,168,106,0.55)", color: "transparent" };

/* QR dari matriks 0/1 (seminar-qr.jsx). Selalu gelap di atas terang supaya terbaca kamera. */
const QrCode = ({ id, className = "" }) => {
  const q = window.SEMINAR_QR[id];
  const n = q.size;
  let d = "";
  q.rows.forEach((row, y) => {
    let x = 0;
    while (x < n) {
      if (row[x] === "1") { let w = 1; while (x + w < n && row[x + w] === "1") w++; d += "M" + x + " " + y + "h" + w + "v1h-" + w + "z"; x += w; }
      else x++;
    }
  });
  return (
    <svg viewBox={"-3 -3 " + (n + 6) + " " + (n + 6)} className={"bg-white rounded-xl " + className} role="img" aria-label={"QR code untuk " + q.url} shapeRendering="crispEdges">
      <path d={d} fill="#0b0b0a"/>
    </svg>
  );
};

/* Timer tugas: tombol atau tekan T. Menghitung mundur dari menit tugas. */
const TaskTimer = ({ minutes }) => {
  const [left, setLeft] = useState(minutes * 60);
  const [run, setRun] = useState(false);
  useEffect(() => {
    if (!run) return;
    const id = setInterval(() => setLeft(l => { if (l <= 1) { setRun(false); return 0; } return l - 1; }), 1000);
    return () => clearInterval(id);
  }, [run]);
  useEffect(() => {
    const h = () => setRun(r => (left > 0 ? !r : r));
    window.addEventListener("seminar-timer", h);
    return () => window.removeEventListener("seminar-timer", h);
  }, [left]);
  const mm = String(Math.floor(left / 60)).padStart(2, "0"), ss = String(left % 60).padStart(2, "0");
  const done = left === 0;
  return (
    <div className="inline-flex items-center gap-[clamp(0.6rem,1.4vw,1.2rem)] mt-[clamp(0.6rem,1.8vh,1.2rem)]">
      <span className={"num tabular-nums font-display font-semibold leading-none text-[clamp(1.8rem,min(4vw,7vh),3.4rem)] " + (done ? "text-gold-300" : "text-ink")}>{mm}:{ss}</span>
      <button onClick={() => done ? (setLeft(minutes * 60), setRun(false)) : setRun(r => !r)}
              className="rounded-xl border border-gold-500/60 text-gold-300 hover:bg-gold-500/10 transition-colors px-4 py-2 text-[clamp(0.85rem,1.3vw,1.05rem)] font-medium">
        {done ? "Waktu habis, ulangi" : run ? "Jeda" : left === minutes * 60 ? "Mulai timer (T)" : "Lanjut"}
      </button>
    </div>
  );
};

const Item = ({ i = 0, className = "", children, ...rest }) => (
  <div className={"sl-item " + className} style={{ animationDelay: (110 + i * 75) + "ms" }} {...rest}>{children}</div>
);

const SlideBody = ({ slide, goChapter }) => {
  const clean = /[?&]clean=1/.test(window.location.hash);
  const chapters = window.SEMINAR_CHAPTERS;
  const inline = window.seminarRenderInline;

  /* ── Judul: kiri teks, kanan potret ── */
  if (slide.type === "title") return (
    <div className="w-full max-w-[1400px] mx-auto grid lg:grid-cols-12 gap-6 lg:gap-16 items-center">
      <div className="lg:col-span-7 order-2 lg:order-1">
        <Item i={0}><div className="arabic-display-classical text-[clamp(1.3rem,2.6vw,2.2rem)] text-gold-300 mb-[clamp(0.8rem,2vw,1.6rem)]" dir="rtl" style={{ textAlign: "left" }}>الذكاء الاصطناعي في التعليم</div></Item>
        <Item i={1}>
          <h1 className="font-display font-semibold text-ink tracking-tight leading-[1.04] text-[clamp(2.1rem,min(6vw,9vh),5.4rem)]">
            Dari fundamental sampai AI untuk pendidikan.
          </h1>
        </Item>
        <Item i={2}><p className="text-ink-muted text-[clamp(1.05rem,2vw,1.6rem)] mt-[clamp(1rem,2.4vw,2rem)]">Seminar AIGYPT × Talqeeh</p></Item>
        <Item i={3}>
          <div className="mt-[clamp(1.2rem,3vw,2.6rem)] pt-[clamp(0.9rem,2vw,1.4rem)] border-t border-white/10 inline-flex items-center gap-4 pr-10">
            <img src="/daru-fahmaa.webp" alt="Daru Fahmaa Muliawan" className="shrink-0 rounded-full object-cover object-top border border-gold-500/40 w-[clamp(3rem,5.5vw,4.5rem)] h-[clamp(3rem,5.5vw,4.5rem)]"
                 onError={(e) => { e.currentTarget.style.display = "none"; }}/>
            <div>
              <div className="text-ink font-medium text-[clamp(1rem,1.7vw,1.3rem)]">Daru Fahmaa Muliawan</div>
              <div className="text-ink-muted text-[clamp(0.8rem,1.3vw,1rem)] mt-0.5">Pendiri Talqeeh dan AIGYPT</div>
            </div>
          </div>
        </Item>
      </div>
      <Item i={1} className="lg:col-span-5 order-1 lg:order-2 relative mx-auto lg:ml-auto w-[min(46vw,200px)] lg:w-[min(100%,420px,44vh)]">
        <img src="/assets/talqeeh-logo.png" alt="Talqeeh" className="relative w-full h-auto object-contain" style={{ mixBlendMode: "screen" }}/>
      </Item>
    </div>
  );

  /* ── Agenda: judul kiri, baris besar kanan ── */
  if (slide.type === "agenda") return (
    <div className="w-full max-w-[1400px] mx-auto grid lg:grid-cols-12 gap-6 lg:gap-16 items-center">
      <div className="lg:col-span-4">
        <Item i={0}><h2 className="font-display font-semibold text-ink tracking-tight leading-none text-[clamp(2.4rem,min(6.5vw,11vh),5.5rem)]">Agenda</h2></Item>
        <Item i={1}><p className="text-ink-muted text-[clamp(1rem,1.8vw,1.35rem)] mt-[clamp(0.6rem,1.6vw,1.2rem)] max-w-[28ch]">Enam bab dalam tiga jam, termasuk 85 menit praktik dan istirahat 10 menit.</p></Item>
      </div>
      <ol className="lg:col-span-8 grid gap-1.5">
        {chapters.map((c, i) => (
          <Item i={i + 1} key={c.id}>
            <button onClick={() => goChapter(c.id)}
                    className="group w-full flex items-baseline gap-[clamp(0.8rem,2.4vw,2rem)] text-left rounded-2xl px-3 md:px-5 py-[clamp(0.35rem,min(1.3vw,1.5vh),1rem)] hover:bg-white/[0.04] transition-colors">
              <span className="num text-gold-400 text-[clamp(1rem,min(2vw,3.2vh),1.6rem)] w-8 md:w-12 shrink-0">{pad2(i + 1)}</span>
              <span className="min-w-0">
                <span className="block text-ink font-display font-medium text-[clamp(1.05rem,min(2.5vw,4vh),2rem)] leading-snug">{c.title}</span>
                <span className="hidden lg:block [@media(max-height:850px)]:!hidden text-ink-muted text-[clamp(0.8rem,1.15vw,1rem)] mt-0.5 max-w-[60ch]">{c.summary}</span>
              </span>
                          <span className="ml-auto num text-ink-muted text-[clamp(0.8rem,1.3vw,1.05rem)] shrink-0">{window.seminarClock(window.SEMINAR_SCHEDULE.blocks.find(b => b.key === "talk:" + c.id).start)}</span>
            </button>
          </Item>
        ))}
      </ol>
    </div>
  );

  /* ── Hook 1: angkat tangan ── */
  if (slide.type === "hook-poll") return (
    <div className="w-full max-w-[1200px] mx-auto">
      <Item i={0}><div className="text-gold-300 text-[clamp(0.8rem,1.3vw,1.05rem)] mb-[clamp(0.4rem,1.2vh,0.9rem)]">Sebelum mulai</div></Item>
      <Item i={1}><h2 className="font-display font-semibold text-ink tracking-tight leading-[1.08] text-[clamp(1.8rem,min(5vw,8vh),4.4rem)]">Siapa yang pernah memakai AI untuk belajar?</h2></Item>
      <div className="mt-[clamp(1rem,3.4vh,2.4rem)] grid sm:grid-cols-3 gap-[clamp(0.6rem,1.6vw,1.4rem)]">
        {["Hampir tiap hari", "Kadang-kadang", "Belum pernah"].map((t, i) => (
          <Item i={i + 2} key={t}>
            <div className="rounded-2xl border border-white/15 bg-white/[0.03] px-[clamp(1rem,2vw,1.8rem)] py-[clamp(0.7rem,2.2vh,1.5rem)] text-ink font-display font-medium text-[clamp(1.05rem,min(2.2vw,3.8vh),1.8rem)]">{t}</div>
          </Item>
        ))}
      </div>
      <Item i={6}>
        <p className="mt-[clamp(1.2rem,4.4vh,3.2rem)] pl-[clamp(1rem,2vw,1.6rem)] border-l-2 border-gold-500 text-gold-200 leading-snug text-[clamp(1.1rem,min(2.4vw,4vh),2rem)]">
          Dan siapa yang pernah dapat jawaban AI yang salah, tapi terdengar sangat meyakinkan?
        </p>
      </Item>
    </div>
  );

  /* ── Hook 2: demo percaya atau cek ── */
  if (slide.type === "hook-demo") return (
    <div className="w-full max-w-[1300px] mx-auto grid lg:grid-cols-12 gap-5 lg:gap-14 items-center">
      <div className="lg:col-span-5">
        <Item i={0}><div className="text-gold-300 text-[clamp(0.8rem,1.3vw,1.05rem)] mb-[clamp(0.4rem,1.2vh,0.9rem)]">Demo 3 menit</div></Item>
        <Item i={1}><h2 className="font-display font-semibold text-ink tracking-tight leading-[1.06] text-[clamp(1.8rem,min(4.6vw,7.4vh),3.8rem)]">Percaya atau cek?</h2></Item>
        <ol className="mt-[clamp(0.8rem,2.6vh,1.8rem)] grid gap-[clamp(0.5rem,1.6vh,1.1rem)]">
          {["Kita tanyakan ini ke AI.", "Kita cek bersama: nama kitab, halaman, dan matan.", "Hitung: berapa yang benar-benar lolos?"].map((t, i) => (
            <Item i={i + 2} key={i}>
              <li className="flex gap-3 items-baseline list-none text-ink-muted leading-snug text-[clamp(1rem,min(1.9vw,3.3vh),1.5rem)]">
                <span className="num text-gold-400 w-5 shrink-0 text-[0.8em]">{i + 1}</span>{t}
              </li>
            </Item>
          ))}
        </ol>
      </div>
      <Item i={3} className="lg:col-span-7">
        <div className="rounded-2xl border border-gold-500/50 bg-gold-500/[0.06] p-[clamp(1rem,2.4vw,2.2rem)]">
          <div className="text-gold-300 font-medium text-[clamp(0.8rem,1.3vw,1.05rem)] mb-[clamp(0.5rem,1.4vh,1rem)]">Prompt</div>
          <p className="text-ink leading-[1.4] text-[clamp(1.05rem,min(2.2vw,3.8vh),1.8rem)]">
            Sebutkan tiga kitab tafsir ayat ahkam yang membahas ayat riba. Cantumkan nama pengarang, nomor jilid dan halaman, serta kutipan matannya.
          </p>
        </div>
      </Item>
    </div>
  );

  /* ── Hook 3: tujuan dan persiapan ── */
  if (slide.type === "hook-goals") return (
    <div className="w-full max-w-[1300px] mx-auto">
      <Item i={0}><div className="text-gold-300 text-[clamp(0.8rem,1.3vw,1.05rem)] mb-[clamp(0.4rem,1.2vh,0.9rem)]">Tujuan hari ini</div></Item>
      <Item i={1}><h2 className="font-display font-semibold text-ink tracking-tight leading-[1.06] text-[clamp(1.8rem,min(4.8vw,7.6vh),4rem)]">Yang kamu bawa pulang</h2></Item>
      <ol className="mt-[clamp(0.9rem,3vh,2.2rem)] grid gap-[clamp(0.6rem,2vh,1.4rem)]">
        {["Tahu kapan AI bisa dipercaya dan kapan harus dicek.", "Mampu menulis prompt yang tepat sasaran.", "Punya cara belajar aktif dengan AI: ringkas, uji, ulang."].map((t, i) => (
          <Item i={i + 2} key={i}>
            <li className="flex gap-[clamp(0.8rem,1.8vw,1.5rem)] items-baseline list-none">
              <span className="num text-gold-400 text-[clamp(0.9rem,1.5vw,1.2rem)] w-7 shrink-0">{pad2(i + 1)}</span>
              <span className="text-ink leading-snug text-[clamp(1.1rem,min(2.3vw,4vh),1.9rem)]">{t}</span>
            </li>
          </Item>
        ))}
      </ol>
      <Item i={5}>
        <div className="mt-[clamp(1rem,3.4vh,2.4rem)] rounded-2xl border border-gold-500/50 bg-gold-500/[0.07] px-[clamp(1rem,2.2vw,1.8rem)] py-[clamp(0.7rem,2vh,1.3rem)] text-ink leading-snug text-[clamp(1rem,min(1.9vw,3.2vh),1.5rem)]">
          Dan satu <span className="text-gold-300 font-semibold">Paket Belajar AI Pribadi</span>: enam output yang kamu buat sendiri di tempat.
        </div>
      </Item>
      <Item i={6}>
        <p className="mt-[clamp(0.8rem,2.6vh,1.8rem)] text-ink-muted leading-snug text-[clamp(0.9rem,min(1.6vw,2.8vh),1.3rem)]">
          <span className="text-ink font-medium">Siapkan sekarang:</span> HP atau laptop, satu bab diktat atau catatan, dan akun salah satu alat AI (ChatGPT, Claude, Gemini, atau NotebookLM). Login ke Talqeeh dengan Google di talqeeh.vercel.app/#/seminar sekarang, supaya akun Anda bisa diaktifkan panitia.
        </p>
      </Item>
    </div>
  );

  /* ── Pembuka bab: angka outline raksasa ── */
  if (slide.type === "chapter") return (
    <div className="w-full max-w-[1400px] mx-auto grid lg:grid-cols-12 gap-2 lg:gap-12 items-center">
      <Item i={0} className="lg:col-span-5">
        <div className="num font-display font-bold leading-[0.8] select-none text-[clamp(8rem,30vw,26rem)]" style={goldStroke} aria-hidden="true">{pad2(slide.ci + 1)}</div>
      </Item>
      <div className="lg:col-span-7">
        <Item i={1}><h2 className="font-display font-semibold text-ink tracking-tight leading-[1.05] text-[clamp(2rem,5.4vw,4.6rem)]">{slide.ch.title}</h2></Item>
        <Item i={2}><p className="text-ink-muted leading-relaxed text-[clamp(1.05rem,2vw,1.6rem)] mt-[clamp(0.8rem,2vw,1.6rem)] max-w-[42ch]">{slide.ch.summary}</p></Item>
      </div>
    </div>
  );

  /* ── Isi: satu poin = pernyataan, banyak poin = judul kiri + daftar kanan ── */
  if (slide.type === "section") {
    const pts = slide.s.points;
    if (pts.length === 1) return (
      <div className="w-full max-w-[1100px] mx-auto">
        <Item i={0}><div className="text-gold-400 text-[clamp(0.85rem,1.4vw,1.1rem)] mb-[clamp(0.8rem,2vw,1.6rem)]">{slide.s.h}</div></Item>
        <Item i={1}>
          <p className="font-display text-ink leading-[1.25] tracking-tight pl-[clamp(1rem,2.4vw,2rem)] border-l-2 border-gold-500"
             style={{ fontSize: "clamp(1.5rem,3.8vw,3.3rem)" }}>{inline(pts[0])}</p>
        </Item>
      </div>
    );
    const n = textLen(pts);
    const fs = n <= 300 ? "clamp(1.1rem,2.3vw,1.9rem)" : n <= 560 ? "clamp(1rem,1.9vw,1.5rem)" : "clamp(0.92rem,1.6vw,1.25rem)";
    return (
      <div className="w-full max-w-[1400px] mx-auto grid lg:grid-cols-12 gap-5 lg:gap-16 items-start lg:items-center">
        <div className="lg:col-span-4">
          <Item i={0}><div className="text-ink-muted text-[clamp(0.8rem,1.2vw,1rem)] mb-[clamp(0.5rem,1.4vw,1rem)]">{slide.ch.title}</div></Item>
          <Item i={1}><h2 className="font-display font-semibold text-ink tracking-tight leading-[1.08] text-[clamp(1.7rem,4.2vw,3.6rem)]">{slide.s.h}</h2></Item>
        </div>
        <ol className="lg:col-span-8 grid gap-[clamp(0.7rem,1.7vw,1.4rem)]" style={{ fontSize: fs }}>
          {pts.map((p, i) => (
            <Item i={i + 1} key={i}>
              <li className="flex gap-[clamp(0.8rem,1.8vw,1.5rem)] items-baseline list-none">
                <span className="num text-gold-400 text-[0.7em] w-[1.8em] shrink-0 pt-[0.15em]">{pad2(i + 1)}</span>
                <span className="text-ink-muted leading-snug min-w-0">{inline(p)}</span>
              </li>
            </Item>
          ))}
        </ol>
      </div>
    );
  }

  /* ── Visual: diagram atau grafik animasi ── */
  if (slide.type === "viz") {
    const v = window.SEMINAR_VIZ[slide.viz];
    const Viz = v.C;
    return (
      <div className="w-full max-w-[1300px] mx-auto">
        <Item i={0}><div className="text-ink-muted text-[clamp(0.8rem,1.2vw,1rem)] mb-[clamp(0.4rem,1.2vh,0.8rem)]">{slide.ch.title}</div></Item>
        <Item i={1}><h2 className="font-display font-semibold text-ink tracking-tight leading-[1.08] text-[clamp(1.6rem,min(4vw,6.4vh),3.3rem)]">{v.title}</h2></Item>
        <Item i={2}><p className="text-ink-muted text-[clamp(0.95rem,min(1.7vw,3vh),1.35rem)] mt-[clamp(0.3rem,1vh,0.7rem)]">{v.sub}</p></Item>
        <div className="mt-[clamp(0.9rem,3vh,2.2rem)]"><Viz/></div>
        {v.note && <p className="sl-note text-ink-muted/80 text-xs md:text-sm mt-[clamp(0.6rem,2vh,1.4rem)]">{v.note}</p>}
      </div>
    );
  }

  /* ── Contoh prompt: dibandingkan berdampingan ── */
  if (slide.type === "prompts") {
    const list = slide.ch.prompts;
    const pair = list.length > 1;
    return (
      <div className="w-full max-w-[1400px] mx-auto">
        <Item i={0}><h2 className="font-display font-semibold text-ink tracking-tight leading-none text-[clamp(1.8rem,4.4vw,3.6rem)] mb-[clamp(1rem,2.6vw,2.2rem)]">Contoh prompt</h2></Item>
        <div className={pair ? "grid md:grid-cols-2 gap-[clamp(0.7rem,1.8vw,1.5rem)]" : "max-w-[1000px]"}>
          {list.map((p, i) => {
            const good = i === list.length - 1;
            return (
              <Item i={i + 1} key={p.label}>
                <div className={"h-full rounded-2xl p-[clamp(1rem,2.2vw,2rem)] border " + (good ? "border-gold-500/50 bg-gold-500/[0.06]" : "border-white/10 bg-white/[0.02]")}>
                  <div className={"text-[clamp(0.8rem,1.2vw,1rem)] mb-[clamp(0.5rem,1.2vw,0.9rem)] font-medium " + (good ? "text-gold-300" : "text-ink-muted")}>{p.label}</div>
                  <p className={"leading-relaxed whitespace-pre-line " + (good ? "text-ink" : "text-ink-muted")} style={{ fontSize: "clamp(0.92rem,1.7vw,1.35rem)" }}>{p.text}</p>
                </div>
              </Item>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── Screenshot Talqeeh dengan sorotan ── */
  if (slide.type === "shot") {
    const sh = slide.shot;
    const imgs = sh.imgs || [{ src: sh.src, hl: sh.hl }];
    const portrait = sh.ar < 1;
    return (
      <div className="w-full max-w-[1400px] mx-auto grid lg:grid-cols-12 gap-4 lg:gap-12 items-center">
        <div className="lg:col-span-4">
          <Item i={0}><div className="text-gold-300 text-[clamp(0.8rem,1.3vw,1.05rem)] mb-[clamp(0.4rem,1.2vh,0.9rem)]">{sh.tie}</div></Item>
          <Item i={1}><h2 className="font-display font-semibold text-ink tracking-tight leading-[1.08] text-[clamp(1.5rem,min(3.6vw,6vh),3.1rem)]">{sh.title}</h2></Item>
          <ul className="mt-[clamp(0.6rem,2vh,1.4rem)] grid gap-[clamp(0.35rem,1.1vh,0.8rem)]">
            {sh.points.map((p, i) => (
              <Item i={i + 2} key={i}>
                <li className="flex gap-3 text-ink-muted leading-snug list-none text-[clamp(0.92rem,min(1.5vw,2.8vh),1.3rem)]">
                  <span className="num text-gold-400 w-5 shrink-0 pt-[0.12em] text-[0.75em]">{pad2(i + 1)}</span>{p}
                </li>
              </Item>
            ))}
          </ul>
        </div>
        <Item i={1} className={"lg:col-span-8 flex justify-center items-start " + (portrait ? "gap-3 md:gap-5" : "lg:justify-end")}>
          {imgs.map((im, k) => (
            <div key={im.src} className={"sl-shotbox relative overflow-hidden border border-gold-500/30 bg-night-900 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)] " + (portrait ? "rounded-[22px] md:rounded-[28px]" : "rounded-2xl")}
                 style={{ "--w-lg": "min(100%, " + (sh.vh * sh.ar).toFixed(1) + "vh)", "--w-sm": portrait ? "min(100%, " + (34 * sh.ar).toFixed(1) + "vh)" : "100%", aspectRatio: sh.ar }}>
              <img src={im.src} alt={sh.title} className="sv-zoom absolute inset-0 w-full h-full object-cover"/>
              {im.hl && (
                <div className="sv-fade absolute rounded-lg" style={{ left: im.hl.x + "%", top: im.hl.y + "%", width: im.hl.w + "%", height: im.hl.h + "%", border: "2px solid #C9A86A", background: "rgba(201,168,106,0.09)", boxShadow: "0 0 0 9999px rgba(0,0,0,0.38)", animationDelay: (1200 + k * 300) + "ms", animationDuration: ".8s" }}>
                  <span className="absolute left-0 bottom-full mb-1.5 w-max max-w-full rounded-md bg-gold-500 text-night-950 font-semibold px-2 py-1 leading-tight text-[clamp(0.6rem,1.05vw,0.88rem)]">{im.hl.label}</span>
                </div>
              )}
            </div>
          ))}
        </Item>
      </div>
    );
  }

  /* ── Tugas: langkah di kiri, output di bawah ── */
  if (slide.type === "practice") {
    const t = slide.ch.task;
    return (
      <div className="w-full max-w-[1300px] mx-auto">
        <div className="grid lg:grid-cols-12 gap-4 lg:gap-14 items-start">
          <div className="lg:col-span-5">
            <Item i={0}>
              <div className="flex items-center gap-3 text-gold-300 mb-[clamp(0.5rem,1.6vh,1rem)]">
                <Icon name="lightbulb" className="w-[clamp(1.2rem,2.2vw,1.8rem)] h-[clamp(1.2rem,2.2vw,1.8rem)]" strokeWidth={1.5}/>
                <span className="font-medium text-[clamp(0.9rem,1.5vw,1.2rem)]">Tugas, {t.minutes} menit</span>
              </div>
            </Item>
            <Item i={1}><h2 className="font-display font-semibold text-ink tracking-tight leading-[1.08] text-[clamp(1.7rem,min(4.2vw,6.8vh),3.6rem)]">{t.title}</h2></Item>
            <Item i={2}><div className="text-ink-muted text-[clamp(0.8rem,1.2vw,1rem)] mt-[clamp(0.4rem,1.2vh,0.9rem)]">Bab {slide.ci + 1}, {slide.ch.title}</div></Item>
            {!clean && <Item i={3}><TaskTimer minutes={t.minutes}/></Item>}
          </div>
          <ol className="lg:col-span-7 grid gap-[clamp(0.55rem,1.8vh,1.2rem)]">
            {t.steps.map((st, i) => (
              <Item i={i + 2} key={i}>
                <li className="flex gap-[clamp(0.8rem,1.6vw,1.4rem)] items-baseline list-none">
                  <span className="num text-gold-400 text-[clamp(0.85rem,1.4vw,1.15rem)] w-6 shrink-0">{i + 1}</span>
                  <span className="text-ink leading-snug text-[clamp(1rem,min(1.9vw,3.3vh),1.55rem)]">{st}</span>
                </li>
              </Item>
            ))}
          </ol>
        </div>
        <Item i={t.steps.length + 3}>
          <div className="mt-[clamp(0.9rem,3vh,2rem)] rounded-2xl border border-gold-500/50 bg-gold-500/[0.07] px-[clamp(1rem,2.2vw,1.8rem)] py-[clamp(0.7rem,2vh,1.3rem)] flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="text-gold-300 font-semibold text-[clamp(0.9rem,1.5vw,1.2rem)]">Output</span>
            <span className="text-ink leading-snug text-[clamp(0.95rem,min(1.8vw,3vh),1.45rem)] min-w-0 flex-1">{t.output}</span>
          </div>
        </Item>
      </div>
    );
  }

  /* ── Output akhir: apa yang dibawa pulang ── */
  if (slide.type === "outputs") {
    const total = chapters.reduce((n, c) => n + c.task.minutes, 0);
    return (
      <div className="w-full max-w-[1300px] mx-auto">
        <Item i={0}><div className="text-gold-300 text-[clamp(0.8rem,1.3vw,1.05rem)] mb-[clamp(0.4rem,1.2vh,0.9rem)]">Hasil seminar</div></Item>
        <Item i={1}><h2 className="font-display font-semibold text-ink tracking-tight leading-[1.06] text-[clamp(1.8rem,min(4.8vw,7.6vh),4rem)]">Paket Belajar AI Pribadi</h2></Item>
        <Item i={2}><p className="text-ink-muted text-[clamp(0.95rem,min(1.7vw,3vh),1.35rem)] mt-[clamp(0.3rem,1vh,0.7rem)]">Enam output dari enam tugas, total {total} menit praktik. Semuanya milikmu dan siap dipakai.</p></Item>
        <ol className="mt-[clamp(0.9rem,3vh,2.2rem)] grid sm:grid-cols-2 lg:grid-cols-3 gap-x-[clamp(1rem,2.4vw,2.4rem)] gap-y-[clamp(0.6rem,2.2vh,1.6rem)]">
          {chapters.map((c, i) => (
            <Item i={i + 3} key={c.id}>
              <li className="flex items-start gap-3 list-none">
                <span className="mt-[0.15em] w-[clamp(1.5rem,2.4vw,2rem)] h-[clamp(1.5rem,2.4vw,2rem)] rounded-full shrink-0 bg-gold-500 text-night-950 flex items-center justify-center">
                  <Icon name="check" className="w-1/2 h-1/2" strokeWidth={3}/>
                </span>
                <span className="min-w-0">
                  <span className="block text-ink font-display font-medium leading-snug text-[clamp(1rem,min(1.9vw,3.4vh),1.6rem)]">{window.seminarOutputName(c)}</span>
                  <span className="block text-ink-muted text-[clamp(0.78rem,1.15vw,0.95rem)] mt-0.5">Bab {i + 1}, {c.task.minutes} menit</span>
                </span>
              </li>
            </Item>
          ))}
        </ol>
      </div>
    );
  }

  /* ── Ambil lembar kerja: QR ke halaman materi ── */
  if (slide.type === "worksheet") return (
    <div className="w-full max-w-[1300px] mx-auto grid lg:grid-cols-12 gap-5 lg:gap-16 items-center">
      <div className="lg:col-span-7">
        <Item i={0}><div className="text-gold-300 text-[clamp(0.8rem,1.3vw,1.05rem)] mb-[clamp(0.4rem,1.2vh,0.9rem)]">Untuk peserta</div></Item>
        <Item i={1}><h2 className="font-display font-semibold text-ink tracking-tight leading-[1.06] text-[clamp(1.8rem,min(4.8vw,7.6vh),4rem)]">Ambil lembar kerjamu</h2></Item>
        <ol className="mt-[clamp(0.9rem,3vh,2.2rem)] grid gap-[clamp(0.6rem,2vh,1.4rem)]">
          {[
            "Scan QR di samping dengan kamera HP.",
            "Login dengan Google (sudah dilakukan di awal), lalu tekan Periksa lagi bila belum terbuka. Atau masukkan PIN pribadimu.",
            "Isi lembar kerja di tiap bab. Isianmu tersimpan otomatis di HP.",
            "Salin, unduh, atau kirim ke WhatsApp sebagai Paket Belajar AI Pribadi.",
          ].map((t, i) => (
            <Item i={i + 2} key={i}>
              <li className="flex gap-4 items-baseline list-none">
                <span className="num text-gold-400 text-[clamp(0.9rem,1.5vw,1.2rem)] w-6 shrink-0">{i + 1}</span>
                <span className="text-ink leading-snug text-[clamp(1.05rem,min(2vw,3.6vh),1.7rem)]">{t}</span>
              </li>
            </Item>
          ))}
        </ol>
      </div>
      <Item i={2} className="lg:col-span-5 flex flex-col items-center">
        <QrCode id="materi" className="p-3 w-[clamp(8rem,34vw,13rem)] lg:w-full" />
        <div className="text-ink-muted text-[clamp(0.75rem,1.1vw,0.95rem)] mt-3 text-center break-all max-w-[22rem]">talqeeh.vercel.app/#/seminar</div>
      </Item>
    </div>
  );

  /* ── Ajakan setelah Talqeeh dibahas ── */
  if (slide.type === "cta") {
    const offer = window.SEMINAR_CTA_OFFER;
    const cards = [
      { id: "sample", t: "Coba gratis, tanpa login", d: "Template prompt Sample Maddah Nahwu" },
      { id: "gabung", t: "Gabung dan mulai", d: "Library lengkap dan AI Study Partner" },
    ];
    return (
      <div className="w-full max-w-[1300px] mx-auto">
        <Item i={0}><div className="text-gold-300 text-[clamp(0.8rem,1.3vw,1.05rem)] mb-[clamp(0.4rem,1.2vh,0.9rem)]">Setelah seminar</div></Item>
        <Item i={1}><h2 className="font-display font-semibold text-ink tracking-tight leading-[1.06] text-[clamp(1.8rem,min(4.8vw,7.6vh),4rem)]">Lanjutkan belajar bersama Talqeeh</h2></Item>
        {offer && <Item i={2}><p className="mt-[clamp(0.5rem,1.6vh,1rem)] inline-block rounded-xl border border-gold-500/50 bg-gold-500/[0.08] px-4 py-2 text-ink text-[clamp(0.95rem,1.7vw,1.35rem)]">{offer}</p></Item>}
        <div className="mt-[clamp(1rem,3.4vh,2.4rem)] grid sm:grid-cols-2 gap-[clamp(1rem,2.6vw,2.6rem)] max-w-[1150px]">
          {cards.map((c, i) => (
            <Item i={i + 3} key={c.id} className="flex items-center gap-[clamp(0.8rem,1.8vw,1.6rem)]">
              <QrCode id={c.id} className="p-2.5 w-[clamp(7rem,min(19vw,33vh),17rem)] shrink-0" />
              <div className="min-w-0">
                <div className="font-display font-semibold text-ink leading-snug text-[clamp(1.05rem,min(1.9vw,3.4vh),1.6rem)]">{c.t}</div>
                <div className="text-ink-muted leading-snug mt-1 text-[clamp(0.85rem,1.3vw,1.1rem)]">{c.d}</div>
              </div>
            </Item>
          ))}
        </div>
        <Item i={6}><p className="text-ink-muted mt-[clamp(1rem,3vh,2rem)] text-[clamp(0.9rem,1.5vw,1.2rem)]">Ikuti komunitas AIGYPT di Instagram <span className="text-ink font-medium">@ai.gypt</span></p></Item>
      </div>
    );
  }

  /* ── Penutup ── */
  return (
    <div className="w-full max-w-[1100px] mx-auto text-center">
      <Item i={0}><div className="arabic-display-classical text-gold-300 leading-none" dir="rtl" style={{ fontSize: "clamp(4rem,min(16vw,20vh),11rem)" }}>تَلْقِيح</div></Item>
      <Item i={1}>
        <h2 className="font-display font-semibold text-ink tracking-tight leading-[1.1] text-[clamp(1.5rem,min(4.4vw,6vh),3.6rem)] mt-[clamp(0.8rem,min(3vw,3vh),2.4rem)]">
          Teknologi terbaik membuat manusia belajar lebih baik.
        </h2>
      </Item>
      <Item i={2}><p className="text-ink-muted text-[clamp(1rem,1.9vw,1.5rem)] mt-[clamp(1rem,2.4vw,2rem)]">Terima kasih. Pertanyaan dan masukan: Instagram @ai.gypt</p></Item>
    </div>
  );
};

const SeminarSlidesPage = () => {
  const slides = useMemo(buildSeminarSlides, []);
  const total = slides.length;
  const chapters = window.SEMINAR_CHAPTERS;

  // Segmen progress: pembuka, tiap bab, penutup. Lebar sebanding jumlah slide.
  const segments = useMemo(() => {
    const out = [];
    slides.forEach((s, i) => {
      if (!out[s.seg]) out[s.seg] = { start: i, count: 0 };
      out[s.seg].count++;
    });
    return out;
  }, [slides]);

  const [idx, setIdx] = useState(() => {
    // Tautan langsung ke satu slide: ...slides?s=44 (nomor mulai dari 1)
    const m = /[?&]s=(\d+)/.exec(window.location.hash);
    if (m) { const v = parseInt(m[1], 10) - 1; if (v >= 0 && v < total) return v; }
    try { const v = parseInt(sessionStorage.getItem(SLIDES_KEY) || "0", 10); return v >= 0 && v < total ? v : 0; } catch { return 0; }
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const touch = useRef(null);
  const prevIdx = useRef(idx);
  const dir = idx >= prevIdx.current ? 1 : -1;
  useEffect(() => { prevIdx.current = idx; }, [idx]);

  const go = useCallback((n) => setIdx(i => Math.max(0, Math.min(total - 1, typeof n === "function" ? n(i) : n))), [total]);
  const goChapter = useCallback((id) => {
    const at = slides.findIndex(s => s.type === "chapter" && s.ch.id === id);
    if (at >= 0) { setIdx(at); setMenuOpen(false); }
  }, [slides]);
  const exit = useCallback(() => {
    try { if (document.fullscreenElement) document.exitFullscreen(); } catch {}
    navigate(window.SEMINAR_AI_PATH);
  }, []);
  const toggleFull = useCallback(() => {
    try {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
    } catch {}
  }, []);

  useEffect(() => { try { sessionStorage.setItem(SLIDES_KEY, String(idx)); } catch {} }, [idx]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (["ArrowRight", "ArrowDown", "PageDown", " ", "Enter"].includes(e.key)) { e.preventDefault(); go(i => i + 1); }
      else if (["ArrowLeft", "ArrowUp", "PageUp", "Backspace"].includes(e.key)) { e.preventDefault(); go(i => i - 1); }
      else if (e.key === "Home") go(0);
      else if (e.key === "End") go(total - 1);
      else if (e.key === "Escape") { if (menuOpen) setMenuOpen(false); else if (!document.fullscreenElement) exit(); }
      else if (e.key === "f" || e.key === "F") toggleFull();
      else if (e.key === "p" || e.key === "P") setNotesOpen(o => !o);
      else if (e.key === "t" || e.key === "T") window.dispatchEvent(new Event("seminar-timer"));
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prevOverflow; };
  }, [go, total, menuOpen, exit, toggleFull]);

  const onTouchStart = (e) => { const t = e.touches[0]; touch.current = { x: t.clientX, y: t.clientY }; };
  const onTouchEnd = (e) => {
    const s = touch.current; touch.current = null;
    if (!s) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x, dy = t.clientY - s.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(i => i + (dx < 0 ? 1 : -1));
  };

  // Mode bersih (?clean=1): tanpa kontrol dan animasi, untuk ekspor PDF atau cetak.
  const clean = useMemo(() => /[?&]clean=1/.test(window.location.hash), []);
  const slide = slides[idx];
  const label =slide.ch ? "Bab " + (slide.ci + 1) + " " + slide.ch.title : "Materi Seminar AI";
  const blockOf = (sl) => {
    const B = window.SEMINAR_SCHEDULE.blocks;
    if (sl.seg === 0) return B.find(b => b.key === "open");
    if (sl.seg > chapters.length) return B.find(b => b.key === "close");
    return B.find(b => b.key === (sl.type === "practice" ? "task:" : "talk:") + sl.ch.id);
  };
  const block = blockOf(slide);
  const note = (window.SEMINAR_NOTES || {})[slide.key];
  const iconBtn = "w-10 h-10 rounded-xl flex items-center justify-center text-ink-muted hover:text-ink hover:bg-white/[0.07] transition-colors";

  return (
    <div className={"fixed inset-0 z-[200] flex flex-col" + (clean ? " sl-clean" : "")}
         style={{ background: "radial-gradient(ellipse 70% 50% at 8% -5%, rgba(201,168,106,0.11), transparent 60%), #0b0b0a" }}
         onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <style>{(window.SEMINAR_VIZ_CSS || "") + `
        @keyframes slIn { from { opacity: 0; transform: translateX(var(--dx, 24px)); } to { opacity: 1; transform: none; } }
        @keyframes slItem { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        @keyframes svZoom { from { transform: scale(1.045); } to { transform: none; } }
        .sv-zoom { animation: svZoom 1.6s cubic-bezier(.16,1,.3,1) both; }
        .sl-shotbox { width: var(--w-sm); }
        @media (min-width: 1024px) { .sl-shotbox { width: var(--w-lg); } }
        @media (prefers-reduced-motion: reduce) { .sv-zoom { animation: none !important; } }
        .sl-stage { animation: slIn .38s cubic-bezier(.16,1,.3,1) both; }
        .sl-item { animation: slItem .55s cubic-bezier(.16,1,.3,1) both; }
        @media (prefers-reduced-motion: reduce) { .sl-stage, .sl-item { animation: none !important; } }
        .sl-clean *, .sl-clean *::before, .sl-clean *::after { animation: none !important; transition: none !important; }
      `}</style>

      {!clean && (<>
      {/* progress per bab (bisa diklik) */}
      <div className="flex gap-1 px-3 md:px-6 pt-3 shrink-0" style={{ paddingTop: "max(0.75rem, var(--safe-top, 0px))" }}>
        {segments.map((sg, si) => {
          const frac = idx < sg.start ? 0 : Math.min(1, (idx - sg.start + 1) / sg.count);
          const name = si === 0 ? "Pembuka" : si === segments.length - 1 ? "Penutup" : chapters[si - 1].title;
          return (
            <button key={si} onClick={() => go(sg.start)} title={name} aria-label={"Ke " + name}
                    className="group h-4 flex items-center" style={{ flexGrow: sg.count, flexBasis: 0 }}>
              <span className="block w-full h-[3px] rounded-full bg-white/10 overflow-hidden group-hover:h-[5px] transition-all">
                <span className="block h-full bg-gold-500 transition-[width] duration-300" style={{ width: frac * 100 + "%" }}/>
              </span>
            </button>
          );
        })}
      </div>

      {/* bar atas */}
      <div className="flex items-center gap-1.5 px-3 md:px-6 py-1 shrink-0">
        <button onClick={exit} className={iconBtn} aria-label="Keluar dari mode slide" title="Keluar (Esc)"><Icon name="x" className="w-5 h-5"/></button>
        <div className="min-w-0 flex-1 text-xs md:text-sm text-ink-muted truncate pl-1">{label}</div>
        <div className="relative">
          <button onClick={() => setMenuOpen(o => !o)} className={iconBtn} aria-label="Loncat ke bab" title="Daftar bab"><Icon name="list" className="w-5 h-5"/></button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)}/>
              <div className="absolute right-0 top-12 z-20 w-80 max-w-[88vw] rounded-2xl border border-white/10 bg-night-900 p-2 shadow-2xl">
                {chapters.map((c, i) => (
                  <button key={c.id} onClick={() => goChapter(c.id)}
                          className="w-full flex items-baseline gap-3 px-3 py-2.5 rounded-xl text-left text-sm text-ink-muted hover:text-ink hover:bg-white/[0.06]">
                    <span className="num text-gold-400 w-5 shrink-0">{pad2(i + 1)}</span>{c.title}
                  </button>
                ))}
                <div className="hidden md:block px-3 pt-2.5 mt-1 border-t border-white/10 text-xs text-ink-muted">Panah atau spasi pindah slide, F layar penuh, P catatan pemateri, T timer tugas, Esc keluar</div>
              </div>
            </>
          )}
        </div>
        <button onClick={toggleFull} className={iconBtn + " hidden md:flex"} aria-label="Layar penuh" title="Layar penuh (F)"><Icon name="maximize" className="w-5 h-5"/></button>
        <div className="num tabular-nums text-xs md:text-sm text-ink-muted pl-1 pr-1 min-w-[3.2rem] text-right">{idx + 1}/{total}</div>
      </div>
      </>)}

      {/* panggung */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className={"min-h-full flex items-center px-5 md:px-14 lg:px-20 " + (clean ? "py-10" : "pt-2 pb-20")} style={notesOpen && !clean ? { paddingBottom: "42vh" } : undefined}>
          <div key={idx} className="sl-stage w-full" style={{ "--dx": dir * 28 + "px" }}>
            <SlideBody slide={slide} goChapter={goChapter}/>
          </div>
        </div>
      </div>

      {notesOpen && !clean && (
        <div className="absolute inset-x-0 bottom-0 z-30 max-h-[44%] overflow-y-auto border-t border-gold-500/40 bg-[#0f0f0e] px-5 md:px-10 py-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 mb-2">
            <span className="text-gold-300 text-xs uppercase tracking-[0.2em]">Catatan pemateri</span>
            {block && <span className="text-ink-muted text-sm num">{block.label}, {window.seminarClock(block.start)} sampai {window.seminarClock(block.end)} ({block.min} menit)</span>}
          </div>
          <p className="text-ink leading-relaxed text-[clamp(0.95rem,1.4vw,1.15rem)]">{note ? note.say : "Belum ada catatan untuk slide ini."}</p>
          {note && note.cue && <p className="mt-2 text-gold-200 text-sm"><span className="font-semibold">Isyarat:</span> {note.cue}</p>}
        </div>
      )}

      {clean && <div className="absolute left-6 bottom-4 num text-sm text-ink-muted">{idx + 1} / {total}</div>}

      {/* navigasi */}
      {!clean && <div className="absolute right-3 md:right-6 flex gap-2" style={{ bottom: "max(1rem, var(--safe-bottom, 0px))" }}>
        <button onClick={() => go(i => i - 1)} disabled={idx === 0} aria-label="Slide sebelumnya"
                className="w-12 h-12 rounded-xl border border-white/12 bg-white/[0.04] text-ink flex items-center justify-center hover:bg-white/[0.09] transition-colors disabled:opacity-25 disabled:pointer-events-none">
          <Icon name="chevronLeft" className="w-5 h-5"/>
        </button>
        <button onClick={() => go(i => i + 1)} disabled={idx === total - 1} aria-label="Slide berikutnya"
                className="w-12 h-12 rounded-xl bg-gold-500 text-night-950 flex items-center justify-center hover:bg-gold-400 transition-colors disabled:opacity-25 disabled:pointer-events-none">
          <Icon name="chevronRight" className="w-5 h-5" strokeWidth={2.2}/>
        </button>
      </div>}
    </div>
  );
};

Object.assign(window, { SeminarSlidesPage, buildSeminarSlides, seminarSlideTitle });
