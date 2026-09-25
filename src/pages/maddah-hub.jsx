import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from 'react';
/* Talqih — Maddah Hub: daftar semua Maddah (S1 Masisir) dengan filter & search */

const MaddahCard = ({ maddah }) => {
  const hasContent   = maddah.prompts && Object.values(maddah.prompts).some(arr => arr.length > 0);
  const totalPrompts = hasContent ? Object.values(maddah.prompts).reduce((s, arr) => s + arr.length, 0) : 0;

  const activity = (typeof loadMaddahActivity !== "undefined") ? loadMaddahActivity() : {};
  const act      = activity[maddah.id];
  const isVisited  = act && act.opens > 0;
  const promptCount = act?.promptsCopied || 0;
  const locked = isMaddahLocked(maddah.id, getSession(), getProfile());
  const freeOpen = getSession()?.tier === "free" && !locked;

  return (
    <div
      onClick={() => navigate("/maddah/" + maddah.id)}
      className={`card-glass p-3.5 md:p-5 hov-lift cursor-pointer group relative overflow-hidden min-w-0 ${isVisited ? "border-l-2 border-l-violet-600/50" : ""}`}
    >
      {isVisited && (
        <div className="absolute top-2.5 left-3 md:left-auto md:top-3 md:right-3 flex items-center gap-1 text-[10px] text-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"/>
          <span className="hidden md:inline">{promptCount > 0 ? `${promptCount} prompt dipakai` : "Pernah dibuka"}</span>
        </div>
      )}

      <div className="flex items-start justify-between gap-2 md:gap-3 mb-2 md:mb-3">
        <div className="flex-1 min-w-0">
          <div className="arabic-display text-gold-300 text-lg md:text-xl mb-1 group-hover:text-gold-200 transition-colors truncate" style={{direction:"rtl"}}>
            {maddah.nameArabic}
          </div>
          <h3 className="font-display text-sm md:text-lg font-semibold text-ink leading-snug break-words">{maddah.name}</h3>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0 mt-1">
          {!hasContent && !isVisited && (
            <span className="badge-neutral">Segera</span>
          )}
          {locked && <span className="inline-flex items-center gap-1 text-[10px] text-gold-300"><Icon name="crown" className="w-3 h-3"/>Library</span>}
          {freeOpen && <span className="text-[10px] text-sky-300">Gratis</span>}
        </div>
      </div>

      <p className="text-xs md:text-sm text-ink-muted leading-relaxed line-clamp-2 mb-2.5 md:mb-3">{maddah.description}</p>

      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="hidden md:flex items-center gap-1.5 text-ink-soft">
          <Icon name="layers" className="w-3 h-3"/>
          {maddah.tingkat?.length >= 6
            ? "Semua tingkat"
            : `Tingkat ${(maddah.tingkat || []).filter(t => t !== "mustawa" && t !== "pasca").join(", ")}${(maddah.tingkat || []).includes("mustawa") ? " + DL" : ""}${(maddah.tingkat || []).includes("pasca") ? " + S2/S3" : ""}`
          }
        </div>
        {hasContent && (
          <span className="text-gold-400 font-medium">{totalPrompts} prompt</span>
        )}
      </div>
    </div>
  );
};

/* ── Switcher katalog: S1 · Ma'had · S2 — dipasang di ketiga halaman Maddah ── */
const MADDAH_CATALOGS = [
  { id: "s1",    to: "/maddah",       label: "Maddah S1",     arabic: "المواد الدراسية" },
  { id: "mahad", to: "/mahad-maddah", label: "Maddah Ma'had" },
  { id: "s2",    to: "/s2-maddah",    label: "Maddah S2",     arabic: "الدراسات العليا" },
];

const MaddahCatalogSwitcher = ({ current }) => {
  const { session } = useAuth();
  const isFree = session?.tier === "free";
  return (
    <div className="flex gap-1.5 p-1 bg-white/4 rounded-xl w-full md:w-fit overflow-x-auto no-scrollbar">
      {MADDAH_CATALOGS.map(c => {
        const active = c.id === current;
        const locked = isFree && c.id === "s2";
        return (
          <button key={c.id}
            onClick={() => { if (!active) navigate(c.to); }}
            aria-current={active ? "page" : undefined}
            className={`flex-1 md:flex-none flex-shrink-0 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              active ? "text-emerald-200" : "text-ink-muted hover:text-ink hover:bg-white/5"
            }`}
            style={active ? {background:"rgba(62,207,142,0.20)",minHeight:40} : {minHeight:40}}>
            {c.label}
            {locked && <Icon name="crown" className="w-3 h-3 text-gold-300"/>}
          </button>
        );
      })}
    </div>
  );
};

const MaddahHubPage = () => {
  const { session, profile } = useAuth();

  const isMahad = profile && (typeof isMahadLevel !== "undefined") && isMahadLevel(profile.level);

  const [searchQuery,       setSearchQuery]       = useState("");
  const [activeCategory,    setActiveCategory]    = useState("all");
  const [showOnlyMyFaculty, setShowOnlyMyFaculty] = useState(true);

  if (!session) { navigate("/"); return null; }

  /* ── Filter logic (S1 only, never show isMahad entries) ── */
  const filtered = MADDAHS.filter(m => {
    if (m.isMahad) return false;

    if (activeCategory !== "all" && m.category !== activeCategory) return false;

    if (showOnlyMyFaculty && profile?.faculty && profile.faculty !== "umum") {
      if (!m.fakultas?.includes(profile.faculty)) return false;
    }

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
    ? [{ category: { id: "all", label: "Semua Maddah" }, maddahs: filtered }]
    : MADDAH_CATEGORIES
        .filter(cat => cat.id === activeCategory)
        .map(cat => ({ category: cat, maddahs: filtered.filter(m => m.category === cat.id) }))
        .filter(g => g.maddahs.length > 0);

  const { withContent } = getMaddahCompletionCount();

  return (
    <div className="page-enter">

      {/* Header */}
      <section className="relative pt-6 md:pt-12 pb-6 md:pb-8 overflow-hidden">
        <Blob color="rgba(62,207,142,0.18)" size={500} top={-150} right={-100}/>
        <div className="container-x relative">
          <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-3 inline-flex items-center gap-2">
            <span className="w-6 h-px bg-gold-500/70"/>
            {MADDAHS.filter(m => !m.isMahad).length} MADDAH
          </div>
          <div className="arabic-display text-gold-300 text-3xl md:text-4xl mb-3" style={{display:"block",textAlign:"left",direction:"rtl",width:"fit-content"}}>
            المواد الدراسية
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink leading-[1.1] mb-4">
            Semua mata pelajaran.
          </h1>
          <p className="text-base md:text-lg text-ink-muted max-w-2xl leading-relaxed">
            Pilih Maddah → dapat AI rekomendasi, tutorial, dan belasan prompt template per Maddah.{" "}
            <span className="text-gold-400">{withContent} Maddah sudah lengkap.</span>
          </p>
          <div className="mt-5">
            <MaddahCatalogSwitcher current="s1"/>
          </div>
        </div>
      </section>

      {/* Filter Bar — sticky */}
      <div className="sticky top-[var(--app-header-h)] z-30 border-y border-line bg-night-950/70 backdrop-blur-md">
        <div className="container-x py-3">
          {/* Search */}
          <div className="relative mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari Maddah (Indonesia atau Arab)..."
              className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-sm text-ink placeholder-ink-soft outline-none transition-colors"
              onFocus={e => e.target.style.borderColor="rgba(62,207,142,0.45)"}
              onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.10)"}
            />
            <Icon name="search" className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft pointer-events-none"/>
          </div>

          {/* Kategori tabs — hanya S1, skip "mahad" */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveCategory("all")}
              className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium transition-colors rounded-xl border ${
                activeCategory === "all"
                  ? "text-emerald-200 border-emerald-600/35"
                  : "bg-white/4 text-ink-muted border-white/8 hover:bg-white/7 hover:text-ink"
              }`}
              style={activeCategory === "all" ? {background:"rgba(62,207,142,0.20)"} : {}}
            >
              Semua
            </button>
            {MADDAH_CATEGORIES.filter(cat => cat.id !== "mahad").map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium transition-colors rounded-xl border ${
                  activeCategory === cat.id
                    ? "text-emerald-200 border-emerald-600/35"
                    : "bg-white/4 text-ink-muted border-white/8 hover:bg-white/7 hover:text-ink"
                }`}
                style={activeCategory === cat.id ? {background:"rgba(62,207,142,0.20)"} : {}}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Checkbox filter fakultas (Masisir only) */}
          {profile?.faculty && profile.faculty !== "umum" && (
            <label className="flex items-center gap-2 mt-3 text-xs text-ink-muted cursor-pointer w-fit select-none">
              <input
                type="checkbox"
                checked={showOnlyMyFaculty}
                onChange={e => setShowOnlyMyFaculty(e.target.checked)}
                className="rounded border-line accent-emerald-500"
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
                onClick={() => { setSearchQuery(""); setActiveCategory("all"); setShowOnlyMyFaculty(true); }}
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
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 md:gap-3">
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
window.MaddahCatalogSwitcher = MaddahCatalogSwitcher;
