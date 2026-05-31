import React from 'react';
/* Talqeeh — Halaman Framework Belajar (publik) */

const FrameworkPage = () => {
  const frameworks = typeof LEARNING_FRAMEWORKS !== "undefined" ? LEARNING_FRAMEWORKS : [];

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
              Klik kartu untuk panduan praktik lengkapnya.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Cards grid */}
      <section className="container-x pb-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {frameworks.map((fw, i) => (
            <Reveal key={fw.id} delay={i * 60}>
              <div
                className="card-glass p-5 cursor-pointer transition-all duration-200 hov-lift group"
                onClick={() => navigate("/framework/" + fw.id)}
              >
                <div className="text-3xl mb-3">{fw.icon}</div>
                <div className="text-[10px] uppercase tracking-wider text-emerald-400 mb-1 font-medium">
                  {fw.nameId}
                </div>
                <h3 className="font-display text-lg font-semibold text-ink mb-2">{fw.name}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{fw.tagline}</p>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-300 group-hover:text-emerald-200 transition-colors">
                  <span>Pelajari lengkap</span>
                  <Icon name="chevronRight" className="w-3.5 h-3.5"/>
                </div>
              </div>
            </Reveal>
          ))}
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
