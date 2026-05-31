import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from 'react';
/* Talqeeh — Halaman Katalog Maddah Publik
   Bisa diakses siapapun tanpa login.
*/

const MaddahPublikPage = ({ onOpenPayment, onOpenLogin }) => {

  const KATEGORI_INFO = [
    { id: "qurani",  label: "Quran & Tafsir",     arabic: "الْقُرْآنُ وَالتَّفْسِيرُ", color: "gold"   },
    { id: "haditsi", label: "Hadits & Mustholah",  arabic: "الْحَدِيثُ وَالْمُصْطَلَحُ", color: "violet" },
    { id: "fiqhi",   label: "Fiqh & Ushul",        arabic: "الْفِقْهُ وَالْأُصُولُ",     color: "gold"   },
    { id: "aqdi",    label: "Aqidah & Pemikiran",  arabic: "الْعَقِيدَةُ وَالْفِكْرُ",   color: "violet" },
    { id: "lughawi", label: "Lughah Arabiyah",     arabic: "اللُّغَةُ الْعَرَبِيَّةُ",   color: "gold"   },
    { id: "tarikhi", label: "Tarikh & Dakwah",     arabic: "التَّارِيخُ وَالدَّعْوَةُ",  color: "violet" },
  ];

  const grouped = KATEGORI_INFO.map(kat => ({
    ...kat,
    maddahs: (typeof MADDAHS !== "undefined")
      ? MADDAHS.filter(m => m.category === kat.id)
      : [],
  })).filter(g => g.maddahs.length > 0);

  const totalMaddah = typeof MADDAHS !== "undefined" ? MADDAHS.length : 35;

  const stats = [
    { label: "Maddah S1",       value: String(totalMaddah) },
    { label: "Maddah Ma'had",   value: "17"   },
    { label: "Template Prompt", value: "490+" },
    { label: "AI Tools",        value: "7"    },
  ];

  const mahadCards = [
    { name: "Al-Qur'an & Tajwid",  arabic: "الْقُرْآنُ وَالتَّجْوِيدُ",     for: "I'dadi & Tsanawi" },
    { name: "Nahwu & Sharf",       arabic: "النَّحْوُ وَالصَّرْفُ",           for: "I'dadi & Tsanawi" },
    { name: "Fiqh & Tauhid",       arabic: "الْفِقْهُ وَالتَّوْحِيدُ",        for: "I'dadi & Tsanawi" },
    { name: "Insya' & Mutholaah",  arabic: "الْإِنْشَاءُ وَالْمُطَالَعَةُ",   for: "I'dadi & Tsanawi" },
    { name: "Matematika Arab",     arabic: "الرِّيَاضِيَّاتُ",                for: "I'dadi" },
    { name: "Sains Arab",          arabic: "الْعُلُومُ",                       for: "I'dadi" },
    { name: "Geografi & Sejarah",  arabic: "الْجُغْرَافِيَا وَالتَّارِيخُ",   for: "Tsanawi" },
    { name: "Mantiq",              arabic: "الْمَنْطِقُ",                       for: "Tsanawi" },
  ];

  return (
    <div className="page-enter min-h-screen">

      {/* ── Header ── */}
      <section className="relative pt-10 md:pt-16 pb-8 overflow-hidden">
        <Blob color="rgba(124,77,255,0.15)" size={500} top={-150} right={-100}/>
        <div className="container-x relative">

          <div className="text-xs uppercase tracking-[0.2em] text-gold-400 mb-4 flex items-center gap-2">
            <span className="w-6 h-px bg-gold-500/60"/>KATALOG MADDAH
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-semibold text-ink leading-tight mb-4">
            Semua Maddah<br/>
            <span className="bg-gradient-to-r from-violet-300 to-gold-400 bg-clip-text text-transparent">
              Al-Azhar.
            </span>
          </h1>
          <p className="text-base md:text-lg text-ink-muted max-w-xl leading-relaxed mb-6">
            {totalMaddah} maddah S1 + 17 maddah Ma'had · 490+ template prompt AI ·
            Disesuaikan untuk tingkat & gaya belajarmu.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-3 mb-8">
            {stats.map(s => (
              <div key={s.label} className="card-glass px-4 py-2.5 flex items-center gap-2">
                <span className="font-display text-lg font-semibold text-violet-300">{s.value}</span>
                <span className="text-xs text-ink-muted">{s.label}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onOpenPayment}
              className="btn btn-primary px-6 py-3 text-sm font-medium flex items-center gap-2">
              <Icon name="sparkles" className="w-4 h-4"/>
              Gabung Member
            </button>
            <button onClick={onOpenLogin} className="btn btn-ghost px-6 py-3 text-sm">
              Sudah member? Login
            </button>
          </div>
        </div>
      </section>

      {/* ── Sample gratis banner ── */}
      <section className="pb-6">
        <div className="container-x">
          <div
            onClick={() => navigate("/sample/nahwu")}
            className="flex items-center justify-between gap-4 p-4 md:p-5 rounded-2xl
                       cursor-pointer hover:opacity-90 transition-opacity"
            style={{background:"rgba(201,168,106,0.08)",border:"1px solid rgba(201,168,106,0.20)"}}>
            <div>
              <div className="text-xs uppercase tracking-wider text-gold-400 mb-1 font-medium">
                ✦ Coba Gratis
              </div>
              <div className="text-base font-semibold text-ink mb-0.5">
                Sample Maddah Nahwu — Gratis, Tanpa Login
              </div>
              <div className="text-sm text-ink-muted">
                Lihat langsung bagaimana prompt Talqeeh bekerja untuk Maddah Nahwu.
              </div>
            </div>
            <Icon name="arrowRight" className="w-5 h-5 text-gold-400 flex-shrink-0"/>
          </div>
        </div>
      </section>

      {/* ── Daftar Maddah S1 per Kategori ── */}
      <section className="pb-12">
        <div className="container-x">
          <div className="space-y-10">
            {grouped.map(kat => (
              <div key={kat.id}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="arabic-display text-gold-300 text-xl" style={{direction:"rtl"}}>
                    {kat.arabic}
                  </div>
                  <div className="w-px h-5 bg-line"/>
                  <h2 className="font-display text-lg font-semibold text-ink">{kat.label}</h2>
                  <span className="text-xs text-ink-soft ml-auto">{kat.maddahs.length} maddah</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {kat.maddahs.map(m => {
                    const totalPrompt = m.prompts
                      ? Object.values(m.prompts).reduce((s, arr) => s + (arr?.length || 0), 0)
                      : 0;
                    return (
                      <div key={m.id} className="card-glass p-4 relative overflow-hidden group">
                        {/* Hover overlay */}
                        <div className="absolute inset-0 flex items-center justify-center
                                        bg-night-900/0 group-hover:bg-night-900/70
                                        transition-all duration-200 rounded-xl z-10">
                          <button
                            onClick={onOpenPayment}
                            className="opacity-0 group-hover:opacity-100 transition-opacity
                                       btn btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5">
                            <Icon name="lock" className="w-3 h-3"/>
                            Gabung untuk akses
                          </button>
                        </div>

                        <div className="arabic-display text-gold-300 text-base mb-1.5 truncate"
                          style={{direction:"rtl"}}>
                          {m.nameArabic}
                        </div>
                        <div className="font-display text-sm font-semibold text-ink mb-1 leading-snug">
                          {m.name}
                        </div>
                        <div className="text-xs text-ink-soft line-clamp-2 mb-2 leading-relaxed">
                          {m.description}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] px-2 py-0.5 rounded border ${
                            kat.color === "gold"
                              ? "bg-gold-500/10 text-gold-300 border-gold-500/20"
                              : "bg-violet-500/10 text-violet-300 border-violet-500/20"
                          }`}>
                            {kat.label}
                          </span>
                          {totalPrompt > 0 && (
                            <span className="text-[10px] text-ink-soft">{totalPrompt} prompt</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* ── Ma'had Section ── */}
          <div className="mt-10 pt-8 border-t border-line">
            <div className="flex items-center gap-3 mb-4">
              <div className="arabic-display text-gold-300 text-xl" style={{direction:"rtl"}}>
                الْمَعْهَدُ الْأَزْهَرِيُّ
              </div>
              <div className="w-px h-5 bg-line"/>
              <h2 className="font-display text-lg font-semibold text-ink">Ma'had Al-Azhar</h2>
              <span className="text-xs text-ink-soft ml-auto">17 maddah</span>
            </div>
            <p className="text-sm text-ink-muted mb-4">
              Maddah khusus pelajar Ma'had Buuts Al-Azhar (I'dadi & Tsanawi) —
              mencakup maddah agama + umum dalam bahasa Arab.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {mahadCards.map((m, i) => (
                <div key={i} className="card-glass p-3 relative overflow-hidden group">
                  <div className="absolute inset-0 flex items-center justify-center
                                  bg-night-900/0 group-hover:bg-night-900/70
                                  transition-all rounded-xl z-10">
                    <button onClick={onOpenPayment}
                      className="opacity-0 group-hover:opacity-100 transition-opacity
                                 btn btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5">
                      <Icon name="lock" className="w-3 h-3"/>
                      Gabung
                    </button>
                  </div>
                  <div className="arabic-display text-gold-300 text-sm mb-1" style={{direction:"rtl"}}>
                    {m.arabic}
                  </div>
                  <div className="text-xs font-semibold text-ink mb-0.5">{m.name}</div>
                  <div className="text-[10px] text-ink-soft">{m.for}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Bottom CTA ── */}
          <div className="mt-10 text-center">
            <div className="arabic-display text-gold-300 text-2xl mb-3" style={{direction:"rtl"}}>
              وَقُلْ رَبِّ زِدْنِي عِلْمًا
            </div>
            <p className="text-ink-muted text-sm mb-6 max-w-md mx-auto">
              Semua maddah di atas tersedia untuk member Talqeeh —
              dengan prompt yang disesuaikan untuk tingkat dan gaya belajarmu.
            </p>
            <button
              onClick={onOpenPayment}
              className="btn btn-primary px-8 py-3.5 text-base font-medium mx-auto flex items-center gap-2">
              <Icon name="sparkles" className="w-4 h-4"/>
              Gabung Member Selamanya
            </button>
            <p className="text-xs text-ink-soft mt-3">
              Bayar sekali · Akses selamanya · Update terus
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

window.MaddahPublikPage = MaddahPublikPage;
