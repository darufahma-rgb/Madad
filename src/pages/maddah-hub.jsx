/* Talqih — Maddah Hub: daftar semua 36 Maddah dengan filter & search */

const MaddahCard = ({ maddah }) => {
  const hasContent  = maddah.prompts && Object.values(maddah.prompts).some(arr => arr.length > 0);
  const totalPrompts = hasContent ? Object.values(maddah.prompts).reduce((s, arr) => s + arr.length, 0) : 0;

  const activity = (typeof loadMaddahActivity !== "undefined") ? loadMaddahActivity() : {};
  const act = activity[maddah.id];
  const isVisited = act && act.opens > 0;
  const promptCount = act?.promptsCopied || 0;

  return (
    <div
      onClick={() => navigate("/maddah/" + maddah.id)}
      className={`card-glass p-4 md:p-5 hov-lift cursor-pointer group relative overflow-hidden ${isVisited ? "border-l-2 border-l-violet-600/50" : ""}`}
    >
      {isVisited && (
        <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] text-violet-300">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500"/>
          {promptCount > 0 ? `${promptCount} prompt dipakai` : "Pernah dibuka"}
        </div>
      )}

      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="arabic-display text-gold-300 text-xl mb-1 group-hover:text-gold-200 transition-colors" style={{direction:"rtl"}}>
            {maddah.nameArabic}
          </div>
          <h3 className="font-display text-lg font-semibold text-ink leading-snug">{maddah.name}</h3>
        </div>
        {!hasContent && !isVisited && (
          <span className="badge-neutral flex-shrink-0 mt-1">Segera</span>
        )}
      </div>

      <p className="text-sm text-ink-muted leading-relaxed line-clamp-2 mb-3">{maddah.description}</p>

      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-ink-soft">
          <Icon name="layers" className="w-3 h-3"/>
          {maddah.tingkat.length >= 6
            ? "Semua tingkat"
            : `Tingkat ${maddah.tingkat.filter(t => t !== "mustawa" && t !== "pasca").join(", ")}${maddah.tingkat.includes("mustawa") ? " + DL" : ""}${maddah.tingkat.includes("pasca") ? " + S2/S3" : ""}`
          }
        </div>
        {hasContent && (
          <span className="text-gold-400 font-medium">{totalPrompts} prompt</span>
        )}
      </div>
    </div>
  );
};

const MaddahHubPage = () => {
  const { session, profile } = useAuth();
  const [searchQuery,       setSearchQuery]       = useState("");
  const [activeCategory,    setActiveCategory]    = useState("all");
  const [showOnlyMyFaculty, setShowOnlyMyFaculty] = useState(true);

  if (!session) {
    navigate("/");
    return null;
  }

  const filtered = MADDAHS.filter(m => {
    if (activeCategory !== "all" && m.category !== activeCategory) return false;
    if (showOnlyMyFaculty && profile?.faculty && profile.faculty !== "umum") {
      if (!m.fakultas.includes(profile.faculty)) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName   = m.name.toLowerCase().includes(q);
      const matchArabic = m.nameArabic.includes(searchQuery);
      const matchDesc   = m.description.toLowerCase().includes(q);
      if (!matchName && !matchArabic && !matchDesc) return false;
    }
    return true;
  });

  const grouped = MADDAH_CATEGORIES.map(cat => ({
    category: cat,
    maddahs:  filtered.filter(m => m.category === cat.id),
  })).filter(g => g.maddahs.length > 0);

  const { withContent } = getMaddahCompletionCount();

  return (
    <div className="page-enter">

      {/* Header */}
      <section className="relative pt-6 md:pt-12 pb-6 md:pb-8 overflow-hidden">
        <Blob color="rgba(124,77,255,0.18)" size={500} top={-150} right={-100}/>
        <div className="container-x relative">
          <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-3 inline-flex items-center gap-2">
            <span className="w-6 h-px bg-gold-500/70"/>
            36 MADDAH
          </div>
          <div className="arabic-display text-gold-300 text-3xl md:text-4xl mb-3" style={{display:"block",textAlign:"left",direction:"rtl",width:"fit-content"}}>
            المواد الدراسية
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink leading-[1.1] mb-4">
            Semua mata pelajaran.
          </h1>
          <p className="text-base md:text-lg text-ink-muted max-w-2xl leading-relaxed">
            Pilih Maddah → dapat AI rekomendasi, tutorial, dan 15+ prompt template per Maddah.
            {" "}<span className="text-gold-400">{withContent} Maddah sudah lengkap.</span>
          </p>
        </div>
      </section>

      {/* Filter Bar — sticky */}
      <div className="sticky top-12 md:top-[72px] z-30 border-y border-line bg-night-950/70 backdrop-blur-md">
        <div className="container-x py-4">
          <div className="relative mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari Maddah (Indonesia atau Arab)..."
              className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-sm text-ink placeholder-ink-soft outline-none transition-colors"
              onFocus={e => e.target.style.borderColor="rgba(113,50,245,0.45)"}
              onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.10)"}
            />
            <Icon name="search" className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft pointer-events-none"/>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveCategory("all")}
              className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium transition-colors rounded-xl border ${
                activeCategory === "all"
                  ? "text-violet-200 border-violet-600/35"
                  : "bg-white/4 text-ink-muted border-white/8 hover:bg-white/7 hover:text-ink"
              }`}
              style={activeCategory === "all" ? {background:"rgba(113,50,245,0.20)"} : {}}
            >
              Semua
            </button>
            {MADDAH_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium transition-colors rounded-xl border ${
                  activeCategory === cat.id
                    ? "text-violet-200 border-violet-600/35"
                    : "bg-white/4 text-ink-muted border-white/8 hover:bg-white/7 hover:text-ink"
                }`}
                style={activeCategory === cat.id ? {background:"rgba(113,50,245,0.20)"} : {}}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {profile?.faculty && profile.faculty !== "umum" && (
            <label className="flex items-center gap-2 mt-3 text-xs text-ink-muted cursor-pointer w-fit select-none">
              <input
                type="checkbox"
                checked={showOnlyMyFaculty}
                onChange={e => setShowOnlyMyFaculty(e.target.checked)}
                className="rounded border-line accent-violet-500"
              />
              <span>Hanya untuk {FAKULTAS_LABEL[profile.faculty]}</span>
            </label>
          )}
        </div>
      </div>

      {/* Grid */}
      <section className="section pt-8 pb-20">
        <div className="container-x">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-ink-muted mb-4">Tidak ada Maddah yang cocok dengan filter.</p>
              <button
                onClick={() => { setSearchQuery(""); setActiveCategory("all"); setShowOnlyMyFaculty(false); }}
                className="btn btn-ghost text-sm"
              >
                Reset filter
              </button>
            </div>
          ) : (
            grouped.map(({ category, maddahs }) => (
              <div key={category.id} className="mb-10">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <h2 className="font-display text-xl md:text-2xl text-ink font-semibold">{category.label}</h2>
                  <span className="text-xs text-ink-soft">{maddahs.length} Maddah</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {maddahs.map(m => <MaddahCard key={m.id} maddah={m}/>)}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

window.MaddahHubPage = MaddahHubPage;
