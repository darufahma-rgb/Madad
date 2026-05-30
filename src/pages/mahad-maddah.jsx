/* Talqeeh — Halaman Maddah Ma'had Al-Azhar
   I'dadi (SMP) + Tsanawi (SMA Adabi/Ilmi)
*/

const MahadMaddahPage = () => {
  const { session, profile } = useAuth();
  const toast = useToast();
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedMaddah,  setSelectedMaddah]  = useState(null);
  const [activeMode,      setActiveMode]      = useState("pahami");
  const [topikInput,      setTopikInput]      = useState("");
  const [copied,          setCopied]          = useState(false);

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

  const MODES = [
    { id: "pahami",  label: "Pahami",       icon: "lightbulb" },
    { id: "hafal",   label: "Hafal",        icon: "refresh"   },
    { id: "latihan", label: "Latihan Soal", icon: "target"    },
    { id: "ujian",   label: "Siap Ujian",   icon: "list"      },
  ];

  const getPrompt = () => {
    if (!selectedMaddah) return "";
    const template = selectedMaddah.prompts?.[activeMode] || "";
    return template
      .replace(/\[TOPIK\]/g,           topikInput || "[tulis topik spesifik yang ingin dibahas]")
      .replace(/\[HADITS\/TOPIK\]/g,   topikInput || "[tulis hadits atau topik]")
      .replace(/\[TOPIK\/AYAT\]/g,     topikInput || "[tulis topik atau ayat]")
      .replace(/\[TOPIK\/SURAH\]/g,    topikInput || "[tulis topik atau surah]")
      .replace(/\[TOPIK\/WAZAN\]/g,    topikInput || "[tulis topik atau wazan]");
  };

  const handleCopy = () => {
    if (!selectedMaddah) { toast.push("Pilih maddah dulu ya!"); return; }
    navigator.clipboard.writeText(getPrompt());
    setCopied(true);
    toast.push("Prompt tersalin — paste ke AI!");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCopyAndOpen = (toolId) => {
    if (!selectedMaddah) { toast.push("Pilih maddah dulu ya!"); return; }
    navigator.clipboard.writeText(getPrompt());
    const tool = AI_TOOLS.find(t => t.id === toolId);
    if (tool?.link) setTimeout(() => window.open(tool.link, "_blank"), 300);
    toast.push(`Tersalin — membuka ${tool?.name}...`);
  };

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
                  onClick={() => { setSelectedMaddah(m); setTopikInput(""); setCopied(false); }}
                  className={`card-glass p-4 text-left hov-lift active:scale-[0.97] transition-all ${
                    selectedMaddah?.id === m.id
                      ? "border-emerald-500/35"
                      : ""
                  }`}
                  style={selectedMaddah?.id === m.id ? {background:"rgba(62,207,142,0.06)"} : {}}>
                  <div className="arabic-display text-gold-300 text-base mb-1.5 truncate"
                    style={{direction:"rtl"}}>
                    {m.nameArabic}
                  </div>
                  <div className="font-display text-sm font-semibold text-ink mb-1.5 leading-snug">
                    {m.name}
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded border ${
                    m.category === "agama"
                      ? "bg-gold-500/10 text-gold-300 border-gold-500/20"
                      : "text-emerald-300 border-emerald-500/20"
                  }`}
                  style={m.category !== "agama" ? {background:"rgba(62,207,142,0.08)"} : {}}>
                    {m.category === "agama" ? "Agama" : "Umum"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Prompt panel */}
      {selectedMaddah && (
        <section className="pb-8">
          <div className="container-x">
            <Reveal>
              <div className="card-glass-strong p-5 md:p-6">

                {/* Maddah header */}
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div>
                    <div className="arabic-display text-gold-300 text-2xl mb-1"
                      style={{direction:"rtl"}}>
                      {selectedMaddah.nameArabic}
                    </div>
                    <h3 className="font-display text-xl font-semibold text-ink">
                      {selectedMaddah.name}
                    </h3>
                    <p className="text-sm text-ink-muted mt-1 leading-relaxed">
                      {selectedMaddah.description}
                    </p>
                  </div>
                  <button onClick={() => setSelectedMaddah(null)}
                    className="text-ink-soft hover:text-ink w-8 h-8 flex items-center justify-center flex-shrink-0">
                    <Icon name="x" className="w-4 h-4"/>
                  </button>
                </div>

                {/* Topik chips */}
                <div className="mb-4">
                  <div className="text-xs uppercase tracking-wider text-ink-soft mb-2">
                    Topik yang tersedia:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedMaddah.topikUtama.map((t, i) => (
                      <button key={i}
                        onClick={() => setTopikInput(t.includes(" — ") ? t.split(" — ")[1] : t)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 border border-line text-ink-muted hover:text-ink hover:bg-white/8 transition-colors">
                        {t}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-ink-soft mt-1.5">
                    ↑ Klik topik untuk isi otomatis, atau ketik sendiri di bawah
                  </p>
                </div>

                {/* Mode tabs */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1 mb-4">
                  {MODES.map(mode => (
                    <button key={mode.id}
                      onClick={() => setActiveMode(mode.id)}
                      className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs border transition-colors ${
                        activeMode === mode.id
                          ? "text-emerald-300 border-emerald-500/30"
                          : "bg-white/3 text-ink-muted border-line hover:bg-white/5"
                      }`}
                      style={activeMode === mode.id ? {background:"rgba(62,207,142,0.10)"} : {}}
                      >
                      <Icon name={mode.icon} className="w-3.5 h-3.5"/>
                      {mode.label}
                    </button>
                  ))}
                </div>

                {/* Input topik */}
                <div className="mb-4">
                  <label className="text-xs text-ink-soft mb-1.5 block">
                    Topik yang mau dipelajari:
                  </label>
                  <input
                    value={topikInput}
                    onChange={e => setTopikInput(e.target.value)}
                    placeholder={
                      selectedMaddah.category === "umum"
                        ? "mis. persamaan linear satu variabel"
                        : "mis. hukum bacaan ikhfa"
                    }
                    className="w-full bg-white/4 border border-line rounded-xl px-4 py-3 text-sm text-ink outline-none transition-colors"
                    style={{fontSize:16}}
                    onFocus={e => e.target.style.borderColor="rgba(62,207,142,0.35)"}
                    onBlur={e => e.target.style.borderColor=""}
                  />
                </div>

                {/* Preview prompt */}
                <div className="p-3 rounded-lg bg-white/3 border border-line mb-4">
                  <div className="text-xs text-ink-soft mb-1.5">Preview prompt:</div>
                  <p className="text-xs text-ink-muted leading-relaxed line-clamp-4 whitespace-pre-wrap">
                    {getPrompt().slice(0, 300)}...
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  <button onClick={handleCopy}
                    className="btn-ghost text-xs px-4 py-2.5 flex items-center gap-1.5"
                    style={{minHeight:40}}>
                    <Icon name="copy" className="w-3.5 h-3.5"/>
                    {copied ? "Tersalin ✓" : "Salin Prompt"}
                  </button>
                  <button onClick={() => handleCopyAndOpen("chatgpt")}
                    className="btn-primary text-xs px-4 py-2.5 flex items-center gap-1.5"
                    style={{minHeight:40}}>
                    Salin & Buka ChatGPT
                    <Icon name="external" className="w-3 h-3"/>
                  </button>
                </div>

                {/* Loop closer — simpan ke Kurasah */}
                {copied && (
                  <div className="mt-3 flex items-center justify-between gap-2 p-3 rounded-lg bg-gold-500/8 border border-gold-500/20">
                    <p className="text-xs text-ink-muted">
                      <span className="text-gold-300 font-medium">Dapat jawaban bagus?</span>
                      {" "}Simpan ke Kurasah!
                    </p>
                    <button onClick={() => {
                      const newNote = {
                        id: "note_" + Date.now(),
                        title: `${selectedMaddah.name} — ${topikInput || "Catatan"}`,
                        body: `## Maddah\n${selectedMaddah.name}\n\n## Topik\n${topikInput || "-"}\n\n## Jawaban AI\n\n*Paste jawaban AI di sini...*\n\n## Catatanku\n\n`,
                        tags: ["mahad", selectedMaddah.category, selectedMaddah.id],
                        source: { type: "mahad", label: selectedMaddah.name },
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                      };
                      if (typeof loadNotes !== "undefined") {
                        saveNotes([newNote, ...loadNotes()]);
                      }
                      navigate("/kurasah?id=" + newNote.id);
                    }}
                      className="btn-ghost text-xs px-3 py-1.5 border border-gold-500/20 text-gold-300 hover:bg-gold-500/8 flex-shrink-0 flex items-center gap-1"
                      style={{minHeight:36}}>
                      <Icon name="notebook" className="w-3 h-3"/>
                      Simpan
                    </button>
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        </section>
      )}
    </div>
  );
};

window.MahadMaddahPage = MahadMaddahPage;
