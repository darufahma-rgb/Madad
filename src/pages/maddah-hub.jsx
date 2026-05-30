/* Talqih — Maddah Hub: daftar semua Maddah dengan filter & search */

/* ── Badge MA'HAD ── */
const MahadCardBadge = () => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide"
    style={{background:"rgba(16,185,129,0.15)",color:"#10B981",border:"1px solid rgba(16,185,129,0.28)"}}>
    MA'HAD
  </span>
);

/* ── Tingkat label helper (Ma'had-aware) ── */
const tingkatLabel = (maddah) => {
  if (maddah.isMahad) {
    const jenjang = [];
    if (maddah.mahadFor?.includes("idadi")) jenjang.push("I'dadi");
    if (maddah.mahadFor?.includes("tsanawi") || maddah.mahadFor?.includes("tsanawi_ilmi") || maddah.mahadFor?.includes("tsanawi_adabi")) {
      if (maddah.mahadFor?.includes("tsanawi_ilmi"))  jenjang.push("Tsanawi Ilmi");
      else if (maddah.mahadFor?.includes("tsanawi_adabi")) jenjang.push("Tsanawi Adabi");
      else jenjang.push("Tsanawi");
    }
    return jenjang.join(" & ") || "Ma'had";
  }
  if (maddah.tingkat.length >= 6) return "Semua tingkat";
  return `Tingkat ${maddah.tingkat.filter(t => t !== "mustawa" && t !== "pasca").join(", ")}${maddah.tingkat.includes("mustawa") ? " + DL" : ""}${maddah.tingkat.includes("pasca") ? " + S2/S3" : ""}`;
};

const MaddahCard = ({ maddah }) => {
  const hasContent   = maddah.prompts && Object.values(maddah.prompts).some(arr => arr.length > 0);
  const totalPrompts = hasContent ? Object.values(maddah.prompts).reduce((s, arr) => s + arr.length, 0) : 0;

  const activity = (typeof loadMaddahActivity !== "undefined") ? loadMaddahActivity() : {};
  const act      = activity[maddah.id];
  const isVisited  = act && act.opens > 0;
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
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0 mt-1">
          {maddah.isMahad && <MahadCardBadge/>}
          {!hasContent && !isVisited && !maddah.isMahad && (
            <span className="badge-neutral">Segera</span>
          )}
        </div>
      </div>

      <p className="text-sm text-ink-muted leading-relaxed line-clamp-2 mb-3">{maddah.description}</p>

      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-ink-soft">
          <Icon name="layers" className="w-3 h-3"/>
          {tingkatLabel(maddah)}
        </div>
        {hasContent && (
          <span className="text-gold-400 font-medium">{totalPrompts} prompt</span>
        )}
      </div>
    </div>
  );
};

/* ── Sub-filter tabs untuk Ma'had ── */
const MAHAD_SUB_FILTERS = [
  { id: "all",        label: "Semua" },
  { id: "agama",      label: "Maddah Agama" },
  { id: "umum_ilmi",  label: "Umum — Ilmi" },
  { id: "umum_adabi", label: "Umum — Adabi" },
  { id: "umum_all",   label: "Umum — Semua Jenjang" },
];

const MaddahHubPage = () => {
  const { session, profile } = useAuth();

  const isMahad = profile && (typeof isMahadLevel !== "undefined") && isMahadLevel(profile.level);

  const [searchQuery,    setSearchQuery]    = useState("");
  const [activeCategory, setActiveCategory] = useState(isMahad ? "mahad" : "all");
  const [activeMahadSub, setActiveMahadSub] = useState("all");
  const [showMyLevel,    setShowMyLevel]    = useState(true);  // Ma'had: filter by jenjang
  const [showOnlyMyFaculty, setShowOnlyMyFaculty] = useState(true); // Masisir: filter by faculty

  if (!session) { navigate("/"); return null; }

  /* ── Filter logic ── */
  const filtered = MADDAHS.filter(m => {
    /* 1. Kategori utama */
    if (activeCategory === "all") {
      /* Semua: Masisir lihat Masisir Maddah, Ma'had lihat Ma'had Maddah */
      if (isMahad  && !m.isMahad) return false;
      if (!isMahad &&  m.isMahad) return false;
    } else {
      if (m.category !== activeCategory) return false;
    }

    /* 2. Sub-filter Ma'had */
    if (activeCategory === "mahad" && activeMahadSub !== "all") {
      if (m.mahadSubcat !== activeMahadSub) return false;
    }

    /* 3. Filter jenjang Ma'had (showMyLevel) */
    if (activeCategory === "mahad" && isMahad && showMyLevel && m.isMahad) {
      const jurusan = profile?.mahad_jurusan;
      const lvl     = profile?.level;
      if (lvl === "idadi") {
        if (!m.mahadFor?.includes("idadi")) return false;
      } else if (lvl === "tsanawi") {
        const ok = m.mahadFor?.includes("tsanawi")
          || (jurusan === "ilmi"  && m.mahadFor?.includes("tsanawi_ilmi"))
          || (jurusan === "adabi" && m.mahadFor?.includes("tsanawi_adabi"));
        if (!ok) return false;
      }
    }

    /* 4. Filter fakultas Masisir */
    if (!isMahad && showOnlyMyFaculty && profile?.faculty && profile.faculty !== "umum") {
      if (!m.fakultas?.includes(profile.faculty)) return false;
    }

    /* 5. Search */
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!m.name.toLowerCase().includes(q) &&
          !m.nameArabic.includes(searchQuery) &&
          !m.description.toLowerCase().includes(q)) return false;
    }

    return true;
  });

  /* ── Grouping ── */
  const grouped = activeCategory === "all"
    ? [{
        category: { id: "all", label: isMahad ? "Ma'had Al-Azhar" : "Semua Maddah" },
        maddahs: filtered,
      }]
    : MADDAH_CATEGORIES
        .filter(cat => activeCategory === "all" || cat.id === activeCategory)
        .map(cat => ({ category: cat, maddahs: filtered.filter(m => m.category === cat.id) }))
        .filter(g => g.maddahs.length > 0);

  const { withContent } = getMaddahCompletionCount();
  const totalMahad = (typeof MAHAD_MADDAHS !== "undefined") ? MAHAD_MADDAHS.length : 16;

  /* ── Judul & subtitle yang adaptif ── */
  const pageTitle    = isMahad ? "Semua mata pelajaran Ma'had." : "Semua mata pelajaran.";
  const pageSubtitle = isMahad
    ? `Pilih maddah → dapat template prompt AI siap pakai. ${totalMahad} Maddah khusus Ma'had Al-Azhar.`
    : `Pilih Maddah → dapat AI rekomendasi, tutorial, dan 15+ prompt template per Maddah. ${withContent} Maddah sudah lengkap.`;

  /* ── Label jenjang user untuk checkbox ── */
  const myLevelLabel = () => {
    if (!isMahad) return "";
    const jenjang = profile?.level === "idadi" ? "I'dadi" : "Tsanawi";
    const jurusan = profile?.mahad_jurusan === "ilmi" ? " Ilmi" : profile?.mahad_jurusan === "adabi" ? " Adabi" : "";
    return `${jenjang}${jurusan}`;
  };

  return (
    <div className="page-enter">

      {/* Header */}
      <section className="relative pt-6 md:pt-12 pb-6 md:pb-8 overflow-hidden">
        <Blob color={isMahad ? "rgba(16,185,129,0.12)" : "rgba(124,77,255,0.18)"} size={500} top={-150} right={-100}/>
        <div className="container-x relative">
          <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-3 inline-flex items-center gap-2">
            <span className="w-6 h-px bg-gold-500/70"/>
            {isMahad ? "MA'HAD AL-AZHAR" : "36 MADDAH"}
          </div>
          <div className="arabic-display text-gold-300 text-3xl md:text-4xl mb-3" style={{display:"block",textAlign:"left",direction:"rtl",width:"fit-content"}}>
            {isMahad ? "المعهد الأزهري" : "المواد الدراسية"}
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink leading-[1.1] mb-4">
            {pageTitle}
          </h1>
          <p className="text-base md:text-lg text-ink-muted max-w-2xl leading-relaxed">
            {isMahad
              ? <>Pilih maddah → dapat template prompt AI siap pakai.{" "}
                  <span className="text-gold-400">{totalMahad} Maddah khusus Ma'had Al-Azhar.</span></>
              : <>Pilih Maddah → dapat AI rekomendasi, tutorial, dan 15+ prompt template per Maddah.{" "}
                  <span className="text-gold-400">{withContent} Maddah sudah lengkap.</span></>
            }
          </p>
        </div>
      </section>

      {/* Filter Bar — sticky */}
      <div className="sticky top-12 md:top-[72px] z-30 border-y border-line bg-night-950/70 backdrop-blur-md">
        <div className="container-x py-3">
          {/* Search */}
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

          {/* Kategori tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => { setActiveCategory("all"); setActiveMahadSub("all"); }}
              className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium transition-colors rounded-xl border ${
                activeCategory === "all"
                  ? "text-violet-200 border-violet-600/35"
                  : "bg-white/4 text-ink-muted border-white/8 hover:bg-white/7 hover:text-ink"
              }`}
              style={activeCategory === "all" ? {background:"rgba(113,50,245,0.20)"} : {}}
            >
              {isMahad ? "Semua Ma'had" : "Semua"}
            </button>
            {MADDAH_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setActiveMahadSub("all"); }}
                className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium transition-colors rounded-xl border ${
                  activeCategory === cat.id
                    ? cat.id === "mahad"
                      ? "text-emerald-200 border-emerald-600/35"
                      : "text-violet-200 border-violet-600/35"
                    : "bg-white/4 text-ink-muted border-white/8 hover:bg-white/7 hover:text-ink"
                }`}
                style={activeCategory === cat.id ? {
                  background: cat.id === "mahad" ? "rgba(16,185,129,0.16)" : "rgba(113,50,245,0.20)"
                } : {}}
              >
                {cat.id === "mahad" ? "🏫 Ma'had" : cat.label}
              </button>
            ))}
          </div>

          {/* Sub-filter Ma'had (muncul hanya saat tab Ma'had aktif) */}
          {activeCategory === "mahad" && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none mt-2 pt-2"
              style={{borderTop:"1px solid rgba(16,185,129,0.12)"}}>
              {MAHAD_SUB_FILTERS.map(sf => (
                <button
                  key={sf.id}
                  onClick={() => setActiveMahadSub(sf.id)}
                  className={`flex-shrink-0 px-3 py-1 text-[11px] font-medium transition-colors rounded-lg border ${
                    activeMahadSub === sf.id
                      ? "border-emerald-600/40 text-emerald-300"
                      : "bg-white/3 text-ink-soft border-white/6 hover:text-ink"
                  }`}
                  style={activeMahadSub === sf.id ? {background:"rgba(16,185,129,0.12)"} : {}}
                >
                  {sf.label}
                </button>
              ))}
            </div>
          )}

          {/* Checkbox filter — Ma'had: filter jenjang | Masisir: filter fakultas */}
          {isMahad && activeCategory === "mahad" && profile?.level && (
            <label className="flex items-center gap-2 mt-2.5 text-xs text-ink-muted cursor-pointer w-fit select-none">
              <input
                type="checkbox"
                checked={showMyLevel}
                onChange={e => setShowMyLevel(e.target.checked)}
                className="rounded border-line accent-emerald-500"
              />
              <span>Tampilkan hanya untuk {myLevelLabel()}</span>
            </label>
          )}
          {!isMahad && profile?.faculty && profile.faculty !== "umum" && (
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
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory(isMahad ? "mahad" : "all");
                  setActiveMahadSub("all");
                  setShowMyLevel(true);
                  setShowOnlyMyFaculty(true);
                }}
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
