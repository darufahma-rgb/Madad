/* Talqeeh — Halaman Maddah Ma'had Al-Azhar
   I'dadi (SMP) + Tsanawi (SMA Adabi/Ilmi)
*/

const MahadMaddahPage = () => {
  const { session, profile } = useAuth();
  const toast = useToast();
  const [activeCategory, setActiveCategory] = useState("all");

  if (!session || !profile?.onboarded) { navigate("/"); return null; }
  if (!isMahadLevel(profile?.level))   { navigate("/dashboard"); return null; }

  const level    = profile.level;
  const isIdad   = isIdadLevel(level);
  const isTsanawi = isTsanawiLevel(level);
  const isIlmi   = isIlmiLevel(level);
  const isAdabi  = isAdabiLevel(level);

  const levelLabel = (typeof TINGKATAN_LABEL !== "undefined")
    ? TINGKATAN_LABEL[level] : level;

  const myMaddah = getMahadMaddahByJenjang(level);

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
        <Blob color="rgba(62,207,142,0.15)" size={500} top={-150} right={-80}/>
        <div className="container-x relative">
          <button onClick={() => navigate("/dashboard")}
            className="text-sm text-ink-soft inline-flex items-center gap-1.5 mb-4"
            style={{minHeight:40}}>
            <Icon name="arrowLeft" className="w-4 h-4"/> Dashboard
          </button>
          <div className="arabic-classic text-gold-300 text-2xl mb-2" style={{direction:"rtl"}}>
            الْمَعْهَدُ الْأَزْهَرِيُّ
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink mb-2">
            Maddah Ma'had
          </h1>
          <p className="text-sm text-ink-muted leading-relaxed">
            {levelLabel}
            {isIdad    && " · I'dadi (SMP)"}
            {isTsanawi && isIlmi  && " · Tsanawi Ilmi (IPA)"}
            {isTsanawi && isAdabi && " · Tsanawi Adabi (IPS)"}
            {isTsanawi && !isIlmi && !isAdabi && " · Tsanawi"}
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs text-ink-soft">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"/>
            {myMaddah.length} maddah tersedia untuk levelmu
          </div>
        </div>
      </section>

      {/* Category filter */}
      <section className="pb-4">
        <div className="container-x">
          <div className="flex gap-2">
            {categories.map(cat => (
              <button key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setSelectedMaddah(null); }}
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
              Belum ada maddah untuk kategori ini di levelmu.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map(m => (
                <button key={m.id}
                  onClick={() => navigate("/mahad-maddah/" + m.id)}
                  className="card-glass p-4 text-left hov-lift active:scale-[0.97] transition-all">
                  <div className="arabic-display text-gold-300 text-base mb-1.5 truncate"
                    style={{direction:"rtl"}}>
                    {m.nameArabic}
                  </div>
                  <div className="font-display text-sm font-semibold text-ink mb-1.5 leading-snug">
                    {m.name}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded border ${
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
