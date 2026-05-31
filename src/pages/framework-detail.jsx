import React, { useState, useEffect } from 'react';
/* Talqeeh — Halaman Tutorial Detail per Framework Belajar */

const FrameworkDetailPage = () => {
  const path = useRoute();
  const idMatch = path.match(/^\/framework\/([\w-]+)/);
  const fwId = idMatch ? idMatch[1] : null;
  const fw = (typeof LEARNING_FRAMEWORKS !== "undefined")
    ? LEARNING_FRAMEWORKS.find(f => f.id === fwId)
    : null;

  const storageKey = "madad_framework_check_" + (fwId || "");
  const [checked, setChecked] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      setChecked(saved ? JSON.parse(saved) : []);
    } catch { setChecked([]); }
  }, [storageKey]);

  const toggleCheck = (i) => {
    setChecked(prev => {
      const next = prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i];
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  if (!fw) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="arabic-display text-gold-300 text-3xl mb-4" style={{direction:"rtl"}}>تَلْقِيح</div>
        <p className="text-ink-muted mb-6">Framework tidak ditemukan.</p>
        <button className="btn btn-ghost" onClick={() => navigate("/framework")}>
          Kembali ke daftar framework
        </button>
      </div>
    );
  }

  const progress = fw.checklist.length
    ? Math.round((checked.length / fw.checklist.length) * 100)
    : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">

      {/* Tombol kembali */}
      <button
        className="text-xs text-ink-muted hover:text-emerald-400 mb-6 inline-flex items-center gap-1.5 transition-colors"
        onClick={() => navigate("/framework")}>
        ← Semua Framework
      </button>

      {/* HERO */}
      <Reveal>
        <div className="text-[11px] uppercase tracking-[0.22em] text-emerald-400 mb-2">
          {fw.nameId}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-ink mb-3">{fw.name}</h1>
        <p className="text-base md:text-lg text-ink-muted leading-relaxed max-w-2xl">
          {fw.tagline}
        </p>
      </Reveal>

      {/* CARA KERJA */}
      <Reveal delay={80}>
        <section className="mt-10">
          <h2 className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4">Cara Kerja</h2>
          <div className="card-glass p-5 space-y-3">
            {fw.howItWorks.map((p, i) => (
              <p key={i} className="text-sm text-ink-muted leading-relaxed">{p}</p>
            ))}
          </div>
        </section>
      </Reveal>

      {/* RUTINITAS PRAKTIK */}
      <Reveal delay={120}>
        <section className="mt-8">
          <h2 className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4">Rutinitas Praktik</h2>
          <div className="space-y-3">
            {fw.routine.map((step, i) => (
              <div key={i} className="card-glass p-4 flex gap-3 items-start">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-600/15 border border-emerald-600/30 text-emerald-400 text-sm flex items-center justify-center font-medium">
                  {i + 1}
                </div>
                <p className="text-sm text-ink leading-relaxed pt-0.5">{step}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* CONTOH PER MADDAH */}
      <Reveal delay={160}>
        <section className="mt-8">
          <h2 className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4">Contoh per Maddah</h2>
          <div className="space-y-3">
            {fw.maddahExamples.map((ex, i) => (
              <div key={i} className="card-glass p-4">
                <div className="text-sm font-semibold text-emerald-400 mb-1">{ex.maddah}</div>
                <p className="text-sm text-ink-muted leading-relaxed">{ex.example}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* TEMPLATE JADWAL */}
      <Reveal delay={200}>
        <section className="mt-8">
          <h2 className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4">Template Jadwal</h2>
          <div className="card-glass overflow-hidden">
            {fw.schedule.map((row, i) => (
              <div
                key={i}
                className="flex gap-4 p-4 border-b border-white/8 last:border-b-0">
                <div className="flex-shrink-0 w-28 text-sm font-medium text-gold-300">{row.when}</div>
                <div className="text-sm text-ink-muted leading-relaxed">{row.what}</div>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* CHECKLIST INTERAKTIF */}
      <Reveal delay={240}>
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs uppercase tracking-[0.22em] text-gold-400">Checklist Praktik</h2>
            <span className="text-xs text-ink-muted">{checked.length}/{fw.checklist.length} ({progress}%)</span>
          </div>
          <div className="space-y-2">
            {fw.checklist.map((item, i) => {
              const isOn = checked.includes(i);
              return (
                <button
                  key={i}
                  onClick={() => toggleCheck(i)}
                  className={"w-full text-left card-glass p-4 flex gap-3 items-start transition-colors " + (isOn ? "border-emerald-600/40 bg-emerald-600/5" : "")}>
                  <div className={"flex-shrink-0 w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 transition-colors " + (isOn ? "bg-emerald-500 border-emerald-500" : "border-white/20")}>
                    {isOn && <span className="text-xs font-bold" style={{color:"#0a0a0a"}}>✓</span>}
                  </div>
                  <span className={"text-sm leading-relaxed " + (isOn ? "text-ink-muted line-through opacity-70" : "text-ink")}>{item}</span>
                </button>
              );
            })}
          </div>
        </section>
      </Reveal>

      {/* TERAPKAN KE PROMPT AI */}
      <Reveal delay={280}>
        <section className="mt-8">
          <h2 className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4">Terapkan ke Prompt AI</h2>
          <div className="card-glass p-5" style={{border:"1px solid rgba(62,207,142,0.15)", background:"rgba(62,207,142,0.03)"}}>
            <p className="text-xs text-ink-muted mb-3">
              Salin prompt ini ke AI favoritmu (ChatGPT, Claude, Gemini), lalu ganti bagian [DALAM KURUNG] sesuai materimu.
            </p>
            <div className="p-3 rounded-xl mb-3 text-xs text-ink-muted leading-relaxed font-mono whitespace-pre-wrap"
                 style={{background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)"}}>
              {fw.aiPrompt}
            </div>
            <CopyButton
              text={typeof withFormatInstruction !== "undefined"
                ? withFormatInstruction(fw.aiPrompt, typeof getFormatPref !== "undefined" ? getFormatPref() : true)
                : fw.aiPrompt}
              label="Salin Prompt"
              variant="primary"
              fullLabel="Prompt tersalin, siap ditempel ke AI" />
          </div>
        </section>
      </Reveal>

      {/* SUMBER ILMIAH */}
      <Reveal delay={320}>
        <section className="mt-8 mb-16">
          <h2 className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4">Sumber Ilmiah</h2>
          <div className="card-glass p-5 space-y-2">
            {fw.sources.map((s, i) => (
              <p key={i} className="text-xs text-ink-muted italic leading-relaxed">{s}</p>
            ))}
            <p className="text-[11px] text-ink-muted mt-3 pt-3 border-t border-white/8 not-italic">
              Catatan: rujukan Arab yang dihasilkan AI tetap perlu kamu verifikasi ke kitab aslinya, karena AI kadang keliru menyebut sumber.
            </p>
          </div>
        </section>
      </Reveal>

    </div>
  );
};

Object.assign(window, { FrameworkDetailPage });
