import React, { useState, useEffect } from 'react';
/* Talqeeh — Materi Seminar AI. Akses: PIN per orang atau member berbayar yang login (lihat seminar-gate.jsx dan
   api/seminar.js). Tidak ditautkan dari navbar/footer. */

const SEMINAR_AI_PATH = "/seminar";

const SEMINAR_UPDATED = "Oktober 2026";

/* Isi materi (bab, tugas, screenshot, catatan pemateri) TIDAK ada di kode: dikirim dari server setelah akses valid
   (api/seminar.js). seminarInit memasang isinya ke window lalu menghitung jadwal 3 jam. */
const seminarInit = (content) => {
  const W = window;
  W.SEMINAR_CHAPTERS = content.chapters;
  W.SEMINAR_SHOTS = content.shots || {};
  W.SEMINAR_SHOT_AFTER = content.shotAfter || {};
  W.SEMINAR_VIZ_AFTER = content.vizAfter || {};
  W.SEMINAR_NOTES = content.notes || {};
  W.SEMINAR_GUIDE_CHECKLIST = content.guideChecklist || [];
  W.SEMINAR_CTA_OFFER = content.ctaOffer || "";
  let t = 0; const blocks = [];
  const add = (key, label, min, kind, ch) => { blocks.push({ key, label, min, kind, ch, start: t, end: t + min }); t += min; };
  add("open", "Pembuka dan hook", 8, "open");
  content.chapters.forEach((c, i) => {
    add("talk:" + c.id, "Bab " + (i + 1) + ": materi", c.talk, "talk", c);
    add("task:" + c.id, "Bab " + (i + 1) + ": tugas", c.task.minutes, "task", c);
    if (i === 1) add("break", "Istirahat", 10, "break");
  });
  add("close", "Penutup, ajakan, tanya jawab", 8, "close");
  W.SEMINAR_SCHEDULE = { blocks, total: t };
};


const seminarClock = (min) => Math.floor(min / 60) + ":" + String(min % 60).padStart(2, "0");

/* **tebal** dan *miring* sederhana, tanpa library */
const renderInline = (text) => {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**")) return <strong key={i} className="text-ink font-semibold">{p.slice(2, -2)}</strong>;
    if (p.startsWith("*")) return <em key={i}>{p.slice(1, -1)}</em>;
    return <React.Fragment key={i}>{p}</React.Fragment>;
  });
};

const SeminarPromptBox = ({ label, text }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch {}
  };
  return (
    <div className="rounded-xl border border-gold-500/25 bg-gold-500/5 p-4">
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-xs uppercase tracking-[0.18em] text-gold-400">{label}</span>
        <button onClick={copy} className="btn-subtle !py-1 !px-2.5 !text-xs">
          <Icon name={copied ? "check" : "copy"} className="w-3.5 h-3.5"/>{copied ? "Tersalin" : "Salin"}
        </button>
      </div>
      <p className="text-sm text-ink-muted leading-relaxed whitespace-pre-line">{text}</p>
    </div>
  );
};

const SeminarChapter = ({ ch, index, open, onToggle, done, onDone, sheet, onField }) => (
  <article id={"bab-" + ch.id} className="card-glass overflow-hidden scroll-mt-24">
    <button onClick={onToggle} aria-expanded={open}
            className="w-full flex items-center gap-4 p-4 md:p-6 text-left">
      <span className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-gold-500/15 text-gold-400 flex items-center justify-center shrink-0">
        <Icon name={ch.icon} className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.6}/>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] uppercase tracking-[0.22em] text-gold-400 mb-0.5">Bab {index + 1}</span>
        <span className="block font-display text-lg md:text-2xl font-semibold text-ink leading-snug">{ch.title}</span>
        {!open && <span className="block text-sm text-ink-muted mt-1 leading-relaxed">{ch.summary}</span>}
      </span>
      <Icon name="chevronDown" className={"w-5 h-5 text-ink-soft shrink-0 transition-transform " + (open ? "rotate-180" : "")}/>
    </button>
    {open && (
      <div className="px-4 md:px-6 pb-5 md:pb-7 border-t border-line">
        <p className="text-ink-muted text-base md:text-lg leading-relaxed pt-5 mb-6">{ch.summary}</p>
        <div className="space-y-6">
          {ch.sections.map(s => (
            <div key={s.h}>
              <h3 className="font-display text-lg md:text-xl font-semibold text-ink mb-2.5">{s.h}</h3>
              <ul className="space-y-2">
                {s.points.map((p, i) => (
                  <li key={i} className="flex gap-3 text-ink-muted leading-relaxed">
                    <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-gold-500/70 shrink-0"/>
                    <span className="min-w-0">{renderInline(p)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {ch.prompts && (
          <div className="mt-6 space-y-3">
            <div className="text-xs uppercase tracking-[0.22em] text-gold-400">Contoh prompt</div>
            {ch.prompts.map(p => <SeminarPromptBox key={p.label} {...p}/>)}
          </div>
        )}
        {ch.id === "pendidikan" && (
          <div className="mt-6">
            <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-3">Tampilan Talqeeh</div>
            <div className="grid sm:grid-cols-3 gap-3">
              {Object.values(SEMINAR_SHOTS).filter(s => !s.pending).map(s => (
                <figure key={s.title} className="rounded-xl overflow-hidden border border-white/10 bg-white/[0.02]">
                  <img src={s.imgs ? s.imgs[0].src : s.src} alt={s.title} loading="lazy" className="w-full aspect-[16/10] object-cover object-top"/>
                  <figcaption className="p-3 text-sm text-ink-muted"><span className="block text-ink font-medium">{s.title}</span>{s.tie}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        )}
        <div className={"mt-6 rounded-xl border p-4 md:p-5 " + (done ? "border-gold-500/50 bg-gold-500/[0.07]" : "border-gold-500/25 bg-gold-500/[0.04]")}>
          <div className="flex items-start gap-3">
            <Icon name="lightbulb" className="w-5 h-5 text-gold-300 shrink-0 mt-1" strokeWidth={1.6}/>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-3">
                <span className="text-xs uppercase tracking-[0.18em] text-gold-300">Tugas</span>
                <span className="text-xs text-ink-muted">{ch.task.minutes} menit</span>
              </div>
              <div className="font-display text-lg md:text-xl font-semibold text-ink mt-1 mb-3">{ch.task.title}</div>
              <ol className="space-y-1.5 mb-4">
                {ch.task.steps.map((st, i) => (
                  <li key={i} className="flex gap-3 text-sm md:text-base text-ink-muted leading-relaxed">
                    <span className="num text-gold-400 w-5 shrink-0">{i + 1}</span><span className="min-w-0">{st}</span>
                  </li>
                ))}
              </ol>
              <div className="rounded-lg bg-black/25 border border-white/10 p-3 text-sm md:text-base">
                <span className="text-gold-300 font-medium">Output: </span><span className="text-ink">{ch.task.output}</span>
              </div>
              <details className="mt-4 rounded-lg border border-white/10 bg-black/20 open:bg-black/30">
                <summary className="cursor-pointer select-none list-none px-3.5 py-3 flex items-center justify-between gap-3 text-sm md:text-base text-gold-300 font-medium">
                  <span>Isi lembar kerja <span className="text-ink-muted font-normal">({ch.task.fields.filter((_, k) => (sheet.f[ch.id + "." + k] || "").trim()).length} dari {ch.task.fields.length} terisi)</span></span>
                  <Icon name="chevronDown" className="w-4 h-4 shrink-0"/>
                </summary>
                <div className="px-3.5 pb-4 pt-1 grid gap-4">
                  {ch.task.fields.map((f, k) => {
                    const id = "ws-" + ch.id + "-" + k;
                    return (
                      <div key={id}>
                        <label htmlFor={id} className="block text-sm font-medium text-ink mb-0.5">{f.label}</label>
                        <p className="text-xs text-ink-muted mb-1.5 leading-snug">{f.hint}</p>
                        <textarea id={id} rows={f.rows} value={sheet.f[ch.id + "." + k] || ""}
                                  onChange={(e) => onField(ch.id + "." + k, e.target.value)}
                                  className="w-full rounded-lg bg-black/30 border border-white/15 focus:border-gold-500 focus:outline-none px-3 py-2 text-ink leading-relaxed resize-y"
                                  style={{ fontSize: 16 }}/>
                      </div>
                    );
                  })}
                </div>
              </details>
              <label className="mt-3 inline-flex items-center gap-2.5 cursor-pointer select-none text-sm text-ink-muted">
                <input type="checkbox" checked={!!done} onChange={() => onDone(ch.id)} className="w-4 h-4 accent-[#C9A86A]"/>
                Tugas ini sudah selesai
              </label>
            </div>
          </div>
        </div>
      </div>
    )}
  </article>
);

const TASKS_KEY = "talqeeh_seminar_tasks";
const SHEET_KEY = "talqeeh_seminar_sheet";
const seminarOutputName = (ch) => ch.task.output.split(":")[0];

/* Gabungkan semua isian jadi satu teks yang rapi untuk disalin, diunduh, atau dikirim. */
const seminarCompile = (sheet) => {
  const L = [];
  L.push("PAKET BELAJAR AI PRIBADI");
  L.push("Seminar AIGYPT x Talqeeh");
  L.push("Nama: " + (sheet.name.trim() || "-"));
  L.push("Tanggal: " + new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }));
  SEMINAR_CHAPTERS.forEach((ch, i) => {
    L.push("", "== " + (i + 1) + ". " + seminarOutputName(ch).toUpperCase() + " ==");
    ch.task.fields.forEach((f, k) => {
      const v = (sheet.f[ch.id + "." + k] || "").trim();
      L.push("", f.label + (/[?:.]$/.test(f.label) ? "" : ":"), v || "(belum diisi)");
    });
  });
  L.push("", "Dibuat dengan materi seminar Talqeeh. Instagram @ai.gypt");
  return L.join("\n");
};

const SeminarAiPage = () => {
  const [openSet, setOpenSet] = useState(() => new Set([SEMINAR_CHAPTERS[0].id]));
  const [sheet, setSheet] = useState(() => {
    try { const s = JSON.parse(localStorage.getItem(SHEET_KEY) || "null"); if (s && s.f) return { name: s.name || "", f: s.f }; } catch {}
    return { name: "", f: {} };
  });
  const [exportMsg, setExportMsg] = useState("");
  const saveSheet = (n) => { setSheet(n); try { localStorage.setItem(SHEET_KEY, JSON.stringify(n)); } catch {} };
  const setField = (key, v) => saveSheet({ ...sheet, f: { ...sheet.f, [key]: v } });
  const setName = (v) => saveSheet({ ...sheet, name: v });
  const flash = (m) => { setExportMsg(m); setTimeout(() => setExportMsg(""), 3200); };
  const copyAll = async () => {
    try { await navigator.clipboard.writeText(seminarCompile(sheet)); flash("Tersalin. Tempel di catatan atau WhatsApp."); }
    catch { flash("Gagal menyalin. Coba tombol Unduh."); }
  };
  const downloadAll = () => {
    try {
      const blob = new Blob([seminarCompile(sheet)], { type: "text/plain;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "paket-belajar-ai-" + ((sheet.name.trim() || "peserta").toLowerCase().replace(/[^a-z0-9]+/g, "-")) + ".txt";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      flash("File diunduh.");
    } catch { flash("Gagal mengunduh. Coba tombol Salin."); }
  };
  const shareWa = async () => {
    const text = seminarCompile(sheet);
    if (text.length > 3500) {
      try { await navigator.clipboard.writeText(text); flash("Teks panjang, sudah disalin. Tempel di WhatsApp."); } catch { flash("Teks terlalu panjang. Pakai tombol Unduh."); }
      window.open("https://wa.me/", "_blank", "noopener");
    } else {
      window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank", "noopener");
    }
  };
  const filledCount = SEMINAR_CHAPTERS.reduce((n, c) => n + c.task.fields.filter((_, k) => (sheet.f[c.id + "." + k] || "").trim()).length, 0);
  const fieldTotal = SEMINAR_CHAPTERS.reduce((n, c) => n + c.task.fields.length, 0);
  const [doneMap, setDoneMap] = useState(() => {
    try { return JSON.parse(localStorage.getItem(TASKS_KEY) || "{}") || {}; } catch { return {}; }
  });
  const toggleDone = (id) => setDoneMap(prev => {
    const n = { ...prev, [id]: !prev[id] };
    try { localStorage.setItem(TASKS_KEY, JSON.stringify(n)); } catch {}
    return n;
  });
  const doneCount = SEMINAR_CHAPTERS.filter(c => doneMap[c.id]).length;

  // Halaman ini tidak untuk diindeks mesin pencari.
  useEffect(() => {
    const m = document.createElement("meta");
    m.name = "robots"; m.content = "noindex, nofollow";
    document.head.appendChild(m);
    return () => { m.remove(); };
  }, []);

  const toggle = (id) => setOpenSet(prev => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });
  const allOpen = openSet.size === SEMINAR_CHAPTERS.length;
  const goTo = (id) => {
    setOpenSet(prev => new Set(prev).add(id));
    setTimeout(() => {
      const el = document.getElementById("bab-" + id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  return (
    <div className="page-enter">
      <PageHeader
        kicker="Materi Seminar"
        arabic="الذكاء الاصطناعي في التعليم"
        title="Dari fundamental sampai AI untuk pendidikan."
        subtitle={`Pegangan peserta seminar AIGYPT × Talqeeh. Diperbarui ${SEMINAR_UPDATED}.`}
      />

      <section className="pb-16">
        <div className="container-x">
          <div className="grid lg:grid-cols-12 gap-6 lg:gap-10 items-start">
            {/* Daftar isi */}
            <aside className="lg:col-span-4 lg:sticky lg:top-24">
              <div className="card-glass p-4 md:p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-3">Daftar isi</div>
                <ol className="space-y-1">
                  {SEMINAR_CHAPTERS.map((ch, i) => (
                    <li key={ch.id}>
                      <button onClick={() => goTo(ch.id)}
                              className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left text-ink-muted hover:text-ink hover:bg-white/5 transition-colors">
                        <span className="num text-sm text-gold-400 w-5 shrink-0">{i + 1}</span>
                        <span className="text-sm leading-snug">{ch.title}</span>
                      </button>
                    </li>
                  ))}
                </ol>
                <button onClick={() => navigate(SEMINAR_AI_PATH + "/slides")} className="btn btn-gold w-full justify-center mt-4 text-sm py-2.5">
                  <Icon name="play" className="w-4 h-4"/> Mode slide
                </button>
                <button
                  onClick={() => setOpenSet(allOpen ? new Set() : new Set(SEMINAR_CHAPTERS.map(c => c.id)))}
                  className="btn-subtle w-full justify-center mt-2">
                  {allOpen ? "Tutup semua bab" : "Buka semua bab"}
                </button>
              </div>
            </aside>

            {/* Bab */}
            <div className="lg:col-span-8 space-y-3 md:space-y-4 min-w-0">
              {SEMINAR_CHAPTERS.map((ch, i) => (
                <SeminarChapter key={ch.id} ch={ch} index={i} open={openSet.has(ch.id)} onToggle={() => toggle(ch.id)}
                                done={!!doneMap[ch.id]} onDone={toggleDone} sheet={sheet} onField={setField}/>
              ))}
              <section className="card-glass-strong p-5 md:p-8">
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                  <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink">Paket Belajar AI Pribadi</h2>
                  <span className="num text-gold-300 text-sm">{doneCount} dari {SEMINAR_CHAPTERS.length} output selesai</span>
                </div>
                <p className="text-ink-muted mb-5">Enam tugas di atas menghasilkan satu paket yang kamu bawa pulang dan langsung bisa dipakai.</p>
                <div className="h-[3px] rounded-full bg-white/10 overflow-hidden mb-5">
                  <div className="h-full bg-gold-500 transition-[width] duration-500" style={{ width: (doneCount / SEMINAR_CHAPTERS.length * 100) + "%" }}/>
                </div>
                <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
                  {SEMINAR_CHAPTERS.map((ch, i) => (
                    <li key={ch.id} className="flex items-start gap-3">
                      <span className={"mt-0.5 w-6 h-6 rounded-full shrink-0 flex items-center justify-center border " + (doneMap[ch.id] ? "bg-gold-500 border-gold-500 text-night-950" : "border-white/25 text-transparent")}>
                        <Icon name="check" className="w-3.5 h-3.5" strokeWidth={2.6}/>
                      </span>
                      <span className="min-w-0">
                        <span className="block text-ink font-medium leading-snug">{seminarOutputName(ch)}</span>
                        <span className="block text-xs text-ink-muted">Bab {i + 1}, {ch.task.minutes} menit</span>
                      </span>
                    </li>
                  ))}
                </ol>
                <div className="mt-6 pt-5 border-t border-white/10">
                  <label htmlFor="ws-name" className="block text-sm font-medium text-ink mb-1.5">Namamu</label>
                  <input id="ws-name" value={sheet.name} onChange={(e) => setName(e.target.value)} autoComplete="name"
                         className="w-full sm:max-w-sm rounded-lg bg-black/30 border border-white/15 focus:border-gold-500 focus:outline-none px-3 py-2 text-ink"
                         style={{ fontSize: 16 }}/>
                  <p className="text-xs text-ink-muted mt-2">Lembar kerja tersimpan otomatis di perangkat ini, {filledCount} dari {fieldTotal} kolom terisi.</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <button onClick={copyAll} className="btn btn-gold text-sm py-2.5"><Icon name="copy" className="w-4 h-4"/> Salin semua</button>
                    <button onClick={downloadAll} className="btn btn-ghost text-sm py-2.5"><Icon name="download" className="w-4 h-4"/> Unduh .txt</button>
                    <button onClick={shareWa} className="btn btn-ghost text-sm py-2.5"><Icon name="messageSquare" className="w-4 h-4"/> Kirim ke WhatsApp</button>
                  </div>
                  <p role="status" className="text-sm text-gold-300 mt-3 min-h-[1.25rem]">{exportMsg}</p>
                </div>
              </section>
              <section className="card-glass p-5 md:p-8">
                <h2 className="font-display text-2xl font-semibold text-ink mb-2">Lanjutkan belajar bersama Talqeeh</h2>
                <p className="text-ink-muted leading-relaxed mb-5">Coba template prompt untuk satu maddah tanpa login, atau gabung untuk memakai library lengkap dan AI Study Partner.</p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => navigate("/sample/nahwu")} className="btn btn-gold text-sm py-2.5">Coba sample gratis</button>
                  <button onClick={() => navigate("/gabung")} className="btn btn-ghost text-sm py-2.5">Lihat pilihan paket</button>
                </div>
                <p className="text-sm text-ink-muted mt-5">Pertanyaan atau masukan? Kabari kami lewat Instagram <strong className="text-ink">@ai.gypt</strong>.</p>
                {window.SEMINAR_SESSION && window.SEMINAR_SESSION.via === "pin" && (
                  <button onClick={() => window.seminarLogout()} className="mt-4 text-sm text-ink-muted hover:text-ink underline underline-offset-2">Keluar dari materi seminar di perangkat ini</button>
                )}
              </section>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

Object.assign(window, {
  SeminarAiPage, SEMINAR_AI_PATH,
  SEMINAR_AI_SLIDES_PATH: SEMINAR_AI_PATH + "/slides",
  SEMINAR_AI_GUIDE_PATH: SEMINAR_AI_PATH + "/pemateri",
  seminarRenderInline: renderInline,
  seminarInit, seminarOutputName, seminarCompile, seminarClock,
});
