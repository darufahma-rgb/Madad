import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from 'react';
/* Talqeeh — Halaman Maddah Ma'had Al-Azhar
   I'dadi (SMP) + Tsanawi (SMA Adabi/Ilmi)
*/

const MahadMaddahPage = () => {
  const { session, profile } = useAuth();
  const toast = useToast();
  const [activeCategory, setActiveCategory] = useState("all");
  const isMahadUser = isMahadLevel(profile?.level);
  // Katalog Ma'had bisa dibuka dari jenjang mana pun; non-Ma'had mulai dari I'dadi.
  const [viewLevel, setViewLevel] = useState(isMahadUser ? profile.level : "idad_1");

  if (!session || !profile?.onboarded) { navigate("/"); return null; }

  const level    = viewLevel;
  const isIdad   = isIdadLevel(level);
  const isTsanawi = isTsanawiLevel(level);
  const isIlmi   = isIlmiLevel(level);
  const isAdabi  = isAdabiLevel(level);

  const levelLabel = (typeof TINGKATAN_LABEL !== "undefined")
    ? TINGKATAN_LABEL[level] : level;

  const myMaddah = getMahadMaddahByJenjang(level);

  const jenjangOptions = [
    { id: "idad_1",          label: "I'dadi" },
    { id: "tsanawi_1_adabi", label: "Tsanawi Adabi" },
    { id: "tsanawi_1_ilmi",  label: "Tsanawi Ilmi" },
  ];
  const jenjangKey = (lv) => isIdadLevel(lv) ? "idad" : isIlmiLevel(lv) ? "ilmi" : "adabi";
  const pickJenjang = (id) => {
    // Kalau kembali ke jenjang sendiri, pakai level asli user (kelasnya).
    setViewLevel(isMahadUser && jenjangKey(profile.level) === jenjangKey(id) ? profile.level : id);
  };
  const isOwnLevel = isMahadUser && level === profile.level;

  const categories = [
    { id: "all",   label: "Semua"       },
    { id: "agama", label: "Maddah Agama" },
    { id: "umum",  label: "Maddah Umum"  },
  ];
  const filtered = activeCategory === "all"
    ? myMaddah
    : myMaddah.filter(m => m.category === activeCategory);


  return (
    <div className="page-enter mobile-page-wrap">

      {/* Header */}
      <section className="relative pt-6 md:pt-12 pb-6 overflow-hidden">
        <GlowBlob color="rgba(62,207,142,0.15)" size={500} top={-150} right={-80}/>
        <div className="container-x relative">
          <button onClick={() => navigate("/library")}
            className="text-sm text-ink-soft inline-flex items-center gap-1.5 mb-4"
            style={{minHeight:40}}>
            <Icon name="arrowLeft" className="w-4 h-4"/> Library
          </button>
          <div className="arabic-classic text-gold-300 text-2xl mb-2" style={{direction:"rtl"}}>
            الْمَعْهَدُ الْأَزْهَرِيُّ
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink mb-2">
            Maddah Ma'had
          </h1>
          <div className="mb-4">
            <MaddahCatalogSwitcher current="mahad"/>
          </div>
          <p className="text-sm text-ink-muted leading-relaxed">
            {isOwnLevel ? levelLabel : "Katalog Ma'had"}
            {isIdad    && " · I'dadi (SMP)"}
            {isTsanawi && isIlmi  && " · Tsanawi Ilmi (IPA)"}
            {isTsanawi && isAdabi && " · Tsanawi Adabi (IPS)"}
            {isTsanawi && !isIlmi && !isAdabi && " · Tsanawi"}
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs text-ink-soft">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"/>
            {myMaddah.length} maddah {isOwnLevel ? "tersedia untuk levelmu" : "di jenjang ini"}
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            {jenjangOptions.map(j => {
              const active = jenjangKey(level) === jenjangKey(j.id);
              return (
                <button key={j.id}
                  onClick={() => pickJenjang(j.id)}
                  className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors ${
                    active
                      ? "text-emerald-200 border-emerald-600/35"
                      : "bg-white/4 text-ink-muted border-white/8 hover:bg-white/7 hover:text-ink"
                  }`}
                  style={active ? {background:"rgba(62,207,142,0.20)"} : {}}>
                  {j.label}
                  {isMahadUser && jenjangKey(profile.level) === jenjangKey(j.id) && (
                    <span className="ml-1 text-[10px] text-gold-400">· jenjangmu</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Category filter */}
      <section className="pb-4">
        <div className="container-x">
          <div className="flex gap-2">
            {categories.map(cat => (
              <button key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                  activeCategory === cat.id
                    ? "text-emerald-300 border-emerald-500/30"
                    : "bg-white/3 text-ink-muted border-line hover:bg-white/5"
                }`}
                style={activeCategory === cat.id ? {background:"rgba(62,207,142,0.12)"} : {}}
                >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Maddah grid */}
      <section className="pb-6">
        <div className="container-x">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-ink-soft text-sm">
              Belum ada maddah untuk kategori ini di jenjang ini.
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 md:gap-3">
              {filtered.map(m => (
                <button key={m.id}
                  onClick={() => navigate("/mahad-maddah/" + m.id)}
                  className="card-glass p-3.5 md:p-5 text-left hov-lift active:scale-[0.97] transition-all group relative overflow-hidden min-w-0">
                  {isMaddahLocked(m.id, session, profile) && (
                    <span className="absolute top-2.5 left-3.5 md:left-auto md:top-3 md:right-3 inline-flex items-center gap-1 text-[10px] text-gold-300"><Icon name="crown" className="w-3 h-3"/>Library</span>
                  )}
                  <div className="arabic-display text-gold-300 text-lg md:text-xl mb-1 group-hover:text-gold-200 transition-colors truncate"
                    style={{direction:"rtl"}}>
                    {m.nameArabic}
                  </div>
                  <h3 className="font-display text-sm md:text-lg font-semibold text-ink leading-snug mb-1 break-words">
                    {m.name}
                  </h3>
                  {m.description && (
                    <p className="text-xs md:text-sm text-ink-muted leading-relaxed line-clamp-2 mb-2.5 md:mb-3">
                      {m.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between gap-2 text-[11px] md:text-xs mt-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded border ${
                      m.category === "agama"
                        ? "bg-gold-500/10 text-gold-300 border-gold-500/20"
                        : "bg-violet-500/10 text-violet-300 border-violet-500/20"
                    }`}>
                      {m.category === "agama" ? "Agama" : "Umum"}
                    </span>
                    <Icon name="arrowRight" className="w-3.5 h-3.5 text-ink-soft"/>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

window.MahadMaddahPage = MahadMaddahPage;
