import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from 'react';
/* Talqih, Muqaranah Landing Page */

const CATEGORY_LABELS = { fiqh: "Fiqh", ushul: "Ushul Fiqh", aqidah: "Aqidah", hadits: "Hadits/Musthola" };

const MuqaranahCard = ({ entry, onOpen, isCustom, onDelete }) => {
  const schools = entry.views.map(v => v.school).slice(0, 4);
  const extra = entry.views.length > 4 ? entry.views.length - 4 : 0;
  const cat = CATEGORY_LABELS[entry.category] || entry.category;
  return (
    <div
      onClick={() => onOpen(entry)}
      className="relative card-glass hov-lift cursor-pointer group border border-white/8 hover:border-emerald-400/35 transition-all rounded-xl overflow-hidden"
      style={{borderTopWidth:2, borderTopColor:"rgba(62,207,142,0.18)"}}>
      <div className="divider-arabesque opacity-20 mt-0 mb-0"/>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <span className="badge-neutral text-[11px] uppercase tracking-wider">{cat}</span>
          {isCustom && <span className="badge-purple text-[10px]">Buatanmu</span>}
        </div>
        <h3 className="font-display text-lg font-semibold text-ink mb-1.5 leading-snug line-clamp-2 group-hover:text-emerald-100 transition-colors">{entry.title}</h3>
        <p className="text-xs text-ink-muted leading-relaxed mb-4" style={{display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>
          {entry.question}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 flex-wrap">
            {schools.map((s, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-400/15">{s}</span>
            ))}
            {extra > 0 && <span className="text-[10px] text-ink-soft">+{extra}</span>}
          </div>
          {isCustom && (
            <button
              onClick={e => { e.stopPropagation(); onDelete && onDelete(entry.id); }}
              className="p-1.5 rounded-lg text-ink-soft hover:text-rose-600 hover:bg-rose-600/10 transition-colors ml-2">
              <Icon name="x" className="w-3.5 h-3.5"/>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const MuqaranahPage = () => {
  const { session, profile } = useAuth();
  const [tab, setTab] = React.useState("library");
  const [catFilter, setCatFilter] = React.useState("all");
  const [search, setSearch] = React.useState("");
  const [customList, setCustomList] = React.useState(loadCustomMuqaranah());

  React.useEffect(() => {
    if (!session) navigate("/");
    else if (!profile?.onboarded) navigate("/onboarding");
  }, [session, profile]);

  if (!session || !profile?.onboarded) return null;

  const cats = [
    { id: "all", label: "Semua" },
    { id: "fiqh", label: "Fiqh" },
    { id: "ushul", label: "Ushul Fiqh" },
    { id: "aqidah", label: "Aqidah" },
    { id: "hadits", label: "Hadits" },
  ];

  const filterEntries = (list) => list.filter(e => {
    const matchCat = catFilter === "all" || e.category === catFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || e.title.toLowerCase().includes(q) || e.question.toLowerCase().includes(q)
      || e.views.some(v => v.scholar.toLowerCase().includes(q) || v.source?.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  const openDetail = (entry) => {
    navigate("/paths/muqaranah?id=" + entry.id);
  };

  const deleteCustom = (id) => {
    const updated = customList.filter(e => e.id !== id);
    setCustomList(updated);
    saveCustomMuqaranah(updated);
  };

  const libraryFiltered = filterEntries(MUQARANAH_LIBRARY);
  const customFiltered = filterEntries(customList);

  return (
    <div className="page-enter">
      {/* Header */}
      <section className="section pb-8">
        <div className="container-x">
          <Reveal>
            <div className="text-xs text-ink-soft mb-6">
              <button onClick={() => navigate("/paths")} className="hover:text-ink-muted transition-colors">Learning Path</button>
              <span className="mx-2 opacity-40">/</span>
              <span className="text-ink-muted">Muqaranah</span>
            </div>
            <div className="text-center max-w-2xl mx-auto">
              <div className="divider-arabesque opacity-40 mb-8"/>
              <div className="arabic-display-modern text-gold-300 text-2xl leading-loose mb-3" style={{direction:"rtl"}}>بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-ink mb-3">Muqaranah</h1>
              <div className="arabic-display-modern text-gold-300 text-xl leading-loose mb-5" style={{direction:"rtl"}}>بَيْنَ الْأَقْوَالِ نَتَأَمَّلُ</div>
              <p className="text-ink-muted leading-relaxed text-base max-w-xl mx-auto mb-2">
                Ruang untuk merenungi perbedaan pendapat para ulama, bukan untuk menghakimi, melainkan untuk memahami keluasan ilmu dan adab dalam menyikapi khilaf.
              </p>
              <div className="divider-arabesque opacity-30 mt-8"/>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="pb-6">
        <div className="container-x">
          <Reveal className="mb-5">
            <div className="relative">
              <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft pointer-events-none"/>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari masalah, ulama, atau kitab..."
                className="w-full pl-11 pr-4 py-3.5 bg-white/4 border border-white/10 rounded-xl text-sm text-ink placeholder-ink-soft outline-none transition-all"
                onFocus={e => { e.target.style.borderColor="rgba(62,207,142,0.45)"; e.target.style.background="rgba(255,255,255,0.06)"; }}
                onBlur={e => { e.target.style.borderColor="rgba(255,255,255,0.10)"; e.target.style.background="rgba(255,255,255,0.04)"; }}
              />
            </div>
          </Reveal>

          <Reveal className="flex items-center gap-3 mb-5 flex-wrap">
            {/* Tabs */}
            <div className="flex rounded-xl overflow-hidden border" style={{borderColor:"rgba(62,207,142,0.22)"}}>
              {["library","custom"].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-5 py-2 text-sm font-medium transition-colors ${tab === t ? "text-emerald-200" : "text-ink-muted hover:text-ink hover:bg-white/4"}`}
                  style={tab === t ? {background:"rgba(62,207,142,0.22)"} : {}}>
                  {t === "library" ? "Library" : "Buatan Saya"}
                </button>
              ))}
            </div>
            <div className="w-px h-5 bg-white/10 hidden sm:block"/>
            {/* Category chips */}
            {cats.map(c => (
              <button key={c.id} onClick={() => setCatFilter(c.id)}
                className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-all ${catFilter === c.id ? "text-emerald-200 border-emerald-600/35" : "bg-white/4 text-ink-muted border-white/8 hover:bg-white/7"}`}
                style={catFilter === c.id ? {background:"rgba(62,207,142,0.20)"} : {}}>
                {c.label}
              </button>
            ))}
          </Reveal>

          {/* Grid */}
          {tab === "library" && (
            libraryFiltered.length > 0 ? (
              <Reveal stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {libraryFiltered.map(e => (
                  <MuqaranahCard key={e.id} entry={e} onOpen={openDetail}/>
                ))}
              </Reveal>
            ) : (
              <div className="text-center py-20 text-ink-muted">Tidak ada hasil untuk pencarian ini.</div>
            )
          )}

          {tab === "custom" && (
            customFiltered.length > 0 ? (
              <Reveal stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {customFiltered.map(e => (
                  <MuqaranahCard key={e.id} entry={e} onOpen={openDetail} isCustom onDelete={deleteCustom}/>
                ))}
              </Reveal>
            ) : (
              <Reveal className="py-20 text-center">
                <div className="pattern-stars opacity-5 absolute inset-0 pointer-events-none rounded-xl"/>
                <div className="arabic-display-classical text-gold-300 text-3xl leading-loose mb-3" style={{direction:"rtl"}}>
                  إِنَّمَا يَخْشَى اللَّهَ مِنْ عِبَادِهِ الْعُلَمَاءُ
                </div>
                <p className="text-xs text-gold-400/70 mb-1 arabic-ui" style={{direction:"rtl"}}>فاطر: ٢٨</p>
                <p className="text-ink-muted text-sm mt-4 mb-8 max-w-sm mx-auto">
                  Belum ada muqaranah buatanmu. Susun yang pertama, merangkum qoul ulama adalah ibadah ilmiah tersendiri.
                </p>
                <button onClick={() => navigate("/paths/muqaranah/new")} className="btn btn-primary">
                  <Icon name="pen" className="w-4 h-4"/> Susun Muqaranah Pertama
                </button>
              </Reveal>
            )
          )}
        </div>
      </section>

      {/* FAB */}
      <button
        onClick={() => navigate("/paths/muqaranah/new")}
        className="fixed right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-full btn-primary shadow-lg hov-lift text-sm font-medium"
        style={{ background:"linear-gradient(135deg, #7C4DFF, #A970FF)", bottom: "calc(var(--tabbar-height, 0px) + 24px)" }}>
        <Icon name="pen" className="w-4 h-4"/> Susun Muqaranah Baru
      </button>
    </div>
  );
};

window.MuqaranahPage = MuqaranahPage;
