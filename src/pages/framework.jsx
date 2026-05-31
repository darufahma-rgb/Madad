import React, { useState } from 'react';
/* Talqeeh — Halaman Framework Belajar (interaktif, publik) */

const FrameworkPage = () => {
  const [activeId, setActiveId] = useState(null);

  const frameworks = typeof LEARNING_FRAMEWORKS !== "undefined" ? LEARNING_FRAMEWORKS : [];
  const active = frameworks.find(f => f.id === activeId) || null;

  return (
    <div className="page-enter">

      {/* Header */}
      <section className="relative pt-8 md:pt-14 pb-8 md:pb-10 overflow-hidden">
        <Blob color="rgba(62,207,142,0.15)" size={500} top={-180} right={-80}/>
        <div className="container-x relative">
          <Reveal>
            <div className="text-[11px] uppercase tracking-[0.22em] text-emerald-400 mb-3 font-medium">
              Ilmu Belajar yang Belajar
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-semibold text-ink mb-4 leading-tight">
              Framework Belajar
            </h1>
            <p className="text-base md:text-lg text-ink-muted max-w-2xl leading-relaxed">
              6 metode belajar berbasis riset ilmiah — dicontohkan untuk konteks Masisir Al-Azhar.
              Klik kartu untuk lihat bukti, tips, dan sumber akademiknya.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Cards grid */}
      <section className="container-x pb-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {frameworks.map((fw, i) => {
            const isOpen = activeId === fw.id;
            return (
              <Reveal key={fw.id} delay={i * 60}>
                <div
                  className={`card-glass p-5 cursor-pointer transition-all duration-200 hov-lift ${isOpen ? "ring-1 ring-emerald-500/40" : ""}`}
                  style={isOpen ? {background:"rgba(62,207,142,0.06)"} : {}}
                  onClick={() => setActiveId(isOpen ? null : fw.id)}
                >
                  <div className="text-3xl mb-3">{fw.icon}</div>
                  <div className="text-[10px] uppercase tracking-wider text-emerald-400 mb-1 font-medium">
                    {fw.nameId}
                  </div>
                  <h3 className="font-display text-lg font-semibold text-ink mb-2">{fw.name}</h3>
                  <p className="text-sm text-ink-muted leading-relaxed">{fw.tagline}</p>
                  <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-300">
                    <Icon name={isOpen ? "chevronUp" : "chevronDown"} className="w-3.5 h-3.5"/>
                    {isOpen ? "Sembunyikan" : "Lihat detail"}
                  </div>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div className="mt-4 pt-4 border-t border-line" onClick={e => e.stopPropagation()}>

                      {/* Summary */}
                      <p className="text-sm text-ink leading-relaxed mb-4">{fw.summary}</p>

                      {/* Evidence */}
                      <div className="p-3 rounded-xl mb-4"
                        style={{background:"rgba(62,207,142,0.06)", border:"1px solid rgba(62,207,142,0.15)"}}>
                        <div className="text-[10px] uppercase tracking-wider text-emerald-400 mb-1.5 font-medium">
                          Bukti Ilmiah
                        </div>
                        <p className="text-xs text-ink-muted leading-relaxed">{fw.evidence}</p>
                      </div>

                      {/* Tips */}
                      <div className="mb-4">
                        <div className="text-[10px] uppercase tracking-wider text-gold-400 mb-2 font-medium">
                          Tips Terapan untuk Masisir
                        </div>
                        <ul className="space-y-1.5">
                          {fw.tips.map((tip, ti) => (
                            <li key={ti} className="flex items-start gap-2 text-xs text-ink-muted leading-relaxed">
                              <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none">
                                <path d="M3 8l3.5 3.5L13 4.5" stroke="#C9A86A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Sources */}
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-ink-soft mb-2 font-medium">
                          Sumber Ilmiah
                        </div>
                        <ul className="space-y-1">
                          {fw.sources.map((src, si) => (
                            <li key={si} className="text-[11px] text-ink-soft italic leading-relaxed">
                              {src}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Footer note */}
      <section className="container-x pb-16">
        <Reveal>
          <div className="p-5 rounded-2xl text-center"
            style={{background:"rgba(201,168,106,0.06)", border:"1px solid rgba(201,168,106,0.15)"}}>
            <div className="arabic-display-classical text-gold-300 text-xl mb-2">طَلَبُ الْعِلْمِ فَرِيضَةٌ</div>
            <p className="text-xs text-ink-muted">
              Framework ini bukan pengganti istiqamah — tapi cara belajar yang benar bisa melipatgandakan hasilmu dengan waktu yang sama.
            </p>
          </div>
        </Reveal>
      </section>

    </div>
  );
};

window.FrameworkPage = FrameworkPage;
