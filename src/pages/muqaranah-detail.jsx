import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from 'react';
/* Talqih, Muqaranah Detail Page */

const ViewColumn = ({ view, isMobile }) => {
  const [collapsed, setCollapsed] = React.useState(isMobile);

  const content = (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <span className="badge-neutral text-[10px] uppercase tracking-wider mb-3 inline-block">{view.school}</span>
        <h3 className="font-display text-xl font-semibold text-ink leading-snug">{view.scholar}</h3>
        <div className="arabic text-gold-300 text-base leading-loose mt-1" style={{direction:"rtl"}}>{view.scholarArabic}</div>
      </div>

      <div className="divider-arabesque opacity-25"/>

      {/* Qoul */}
      <div>
        <div className="text-[10px] uppercase tracking-wider text-ink-soft mb-2 font-medium">Qoul</div>
        <p className="text-sm text-ink leading-relaxed font-display">{view.position}</p>
      </div>

      {/* Dalil */}
      {view.evidence && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-ink-soft mb-2 font-medium">Dalil</div>
          <div className="rounded-xl border border-gold-400/15 bg-gold-500/5 p-4">
            <div className="arabic text-gold-200 text-lg leading-loose mb-3" style={{direction:"rtl",textAlign:"right"}}>
              {view.evidence.arabic}
            </div>
            {view.evidence.translation && (
              <p className="text-xs text-ink-muted italic leading-relaxed border-t border-white/5 pt-3 mt-1">
                {view.evidence.translation}
              </p>
            )}
            {view.evidence.notes && (
              <p className="text-xs text-ink-soft leading-relaxed mt-2">{view.evidence.notes}</p>
            )}
          </div>
        </div>
      )}

      {/* Wajh Istidlal */}
      {view.reasoning && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-ink-soft mb-2 font-medium">Wajh Istidlal</div>
          <p className="text-sm text-ink-muted leading-relaxed">{view.reasoning}</p>
        </div>
      )}

      {/* Source */}
      {view.source && (
        <div className="pt-3 border-t border-line">
          <p className="text-[11px] text-ink-soft">Sumber: <span className="text-ink-muted">{view.source}</span></p>
        </div>
      )}
    </div>
  );

  if (!isMobile) return (
    <div className="card-glass rounded-xl p-6 h-full" style={{border:"1px solid rgba(255,255,255,0.08)",borderTop:"2px solid rgba(201,168,106,0.2)"}}>
      {content}
    </div>
  );

  return (
    <div className="card-glass rounded-xl overflow-hidden" style={{border:"1px solid rgba(255,255,255,0.08)",borderTop:"2px solid rgba(201,168,106,0.2)"}}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between p-4 text-left">
        <div>
          <div className="font-display text-base font-semibold text-ink">{view.scholar}</div>
          <div className="arabic text-gold-300 text-sm mt-0.5" style={{direction:"rtl"}}>{view.scholarArabic}</div>
        </div>
        <Icon name={collapsed ? "chevronDown" : "chevronUp"} className="w-4 h-4 text-ink-soft flex-shrink-0"/>
      </button>
      {!collapsed && <div className="px-4 pb-5">{content}</div>}
    </div>
  );
};

const MuqaranahDetailPage = () => {
  const { session, profile } = useAuth();
  const path = useRoute();
  const toast = useToast();
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  React.useEffect(() => {
    if (!session) navigate("/");
    else if (!profile?.onboarded) navigate("/onboarding");
  }, [session, profile]);

  if (!session || !profile?.onboarded) return null;

  // Resolve entry
  const params = new URLSearchParams(path.includes("?") ? path.split("?")[1] : "");
  const id = params.get("id");
  const allEntries = [...MUQARANAH_LIBRARY, ...loadCustomMuqaranah()];
  const entry = allEntries.find(e => e.id === id);

  if (!entry) return (
    <div className="page-enter min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-ink-muted mb-4">Muqaranah tidak ditemukan.</p>
        <button onClick={() => navigate("/paths/muqaranah")} className="btn btn-ghost">Kembali</button>
      </div>
    </div>
  );

  const buildPrompt = () => {
    const viewsText = entry.views.map((v, idx) => {
      const arab = v.evidence?.arabic ? `\n  Dalil (Arab): ${v.evidence.arabic}` : "";
      const terj = v.evidence?.translation ? `\n  Terjemah: ${v.evidence.translation}` : "";
      const wajh = v.reasoning ? `\n  Wajh istidlal: ${v.reasoning}` : "";
      const sumber = v.source ? `\n  Sumber: ${v.source}` : "";
      return `${idx+1}. ${v.scholar} — ${v.scholarArabic || ""} (${v.school})
  Qoul: ${v.position}${arab}${terj}${wajh}${sumber}`;
    }).join("\n\n");

    return `Aku thalib di Al-Azhar yang sedang mempelajari mas'alah berikut:

**Mas'alah:** ${entry.title}
${entry.titleArabic ? `**Bil-'Arabiyyah:** ${entry.titleArabic}` : ""}

**Tashwir al-Mas'alah (Rumusan Masalah):**
${entry.question}

**Aqwal al-'Ulama':**
${viewsText}

Tolong bantu aku merenungkan mas'alah ini dengan adab thalib:

1. Apa sesungguhnya mawdhi' al-khilaf (titik perbedaan) di sini? Apakah perbedaannya lafzhi, ma'nawi, atau haqiqi?
2. Apa thamarat al-khilaf (konsekuensi praktis) dari masing-masing qoul dalam ibadah/muamalah sehari-hari?
3. Bagaimana adab seorang thalib menyikapi khilaf ini? — terutama saat berinteraksi dengan saudara yang mengikuti madzhab berbeda

**Aturan jawaban:**
- Saat mengutip ayat, hadits, atau kaidah ushul, selalu sertakan teks Arab asli dengan harakat sebelum terjemah
- Gunakan istilah Arab transliterasi: dalil, hujjah, qiyas, istihsan, mafhum mukhalafah, wajh istidlal
- Sebut nama ulama dalam transliterasi Arab (al-Imam al-Syafi'i, bukan "Imam Syafii")
- Sebut nama kitab dalam Arab (Al-Umm, Al-Mughni, Bidayat al-Mujtahid)
- Jangan men-tarjih (memilih yang paling kuat) — itu hak guru-ku yang langsung mengajariku. Aku ingin paham, bukan disodorkan kesimpulan.`;
  };

  const copyPrompt = (url) => {
    const prompt = buildPrompt();
    navigator.clipboard.writeText(prompt).then(() => {
      toast.push("Prompt disalin. Diskusikan dengan adab.");
      if (url) setTimeout(() => window.open(url, "_blank"), 500);
    });
  };

  const catatKeKurasah = () => {
    const notes = loadNotes();
    const now = new Date().toISOString();
    const noteId = "note_" + Date.now();
    const body = `## Tashwir al-Mas'alah\n\n${entry.question}\n\n${entry.titleArabic ? `> ${entry.titleArabic}\n\n` : ""}## Catatan Pribadiku\n\n*Tuliskan refleksi, ta'liq, atau pertanyaan yang muncul saat membaca muqaranah ini...*\n\n## Aqwal al-'Ulama'\n\n${entry.views.map(v => {
      const arab = v.evidence?.arabic ? `\n> ${v.evidence.arabic}\n*${v.evidence?.translation || ""}*\n` : "";
      return `### ${v.scholar} ${v.scholarArabic ? `(${v.scholarArabic})` : ""}\n**Madzhab:** ${v.school}\n\n**Qoul:** ${v.position}\n${arab}\n**Wajh istidlal:** ${v.reasoning || "-"}\n\n**Mashdar:** ${v.source || "-"}`;
    }).join("\n\n---\n\n")}\n\n## Pertanyaan untuk Guru\n\n*(Pertanyaan yang ingin aku tanyakan saat talaqqi berikutnya)*\n\n1. \n2. \n3. `;
    const note = {
      id: noteId,
      title: entry.title,
      body,
      tags: [entry.category],
      source: { type: "muqaranah", id: entry.id, label: entry.title },
      createdAt: now,
      updatedAt: now,
    };
    saveNotes([note, ...notes]);
    toast.push("Tersimpan ke Kurasah!");
    setTimeout(() => navigate("/kurasah?id=" + noteId), 600);
  };

  const catLabel = { fiqh:"Fiqh", ushul:"Ushul Fiqh", aqidah:"Aqidah", hadits:"Hadits/Musthola" }[entry.category] || entry.category;

  const views2col = entry.views.length <= 2;
  const views4col = entry.views.length <= 4 && !views2col;

  return (
    <div className="page-enter">
      {/* Header */}
      <section className="section pb-6">
        <div className="container-x">
          <Reveal>
            <div className="text-xs text-ink-soft mb-6 flex items-center gap-2 flex-wrap">
              <button onClick={() => navigate("/paths")} className="hover:text-ink-muted">Learning Path</button>
              <span className="opacity-40">/</span>
              <button onClick={() => navigate("/paths/muqaranah")} className="hover:text-ink-muted">Muqaranah</button>
              <span className="opacity-40">/</span>
              <span className="text-ink-muted truncate max-w-xs">{entry.title}</span>
            </div>

            <div className="badge-neutral text-[11px] uppercase tracking-wider mb-4">{catLabel}</div>
            <h1 className="font-display text-4xl md:text-5xl font-medium text-ink leading-tight mb-2">{entry.title}</h1>
            {entry.titleArabic && (
              <div className="arabic-display-modern text-gold-300 text-xl leading-loose mt-2 mb-5" style={{direction:"rtl"}}>{entry.titleArabic}</div>
            )}

            {/* Rumusan masalah */}
            <div className="max-w-3xl border-l-2 border-gold-500/40 pl-5 py-2 my-6">
              <div className="text-[10px] uppercase tracking-wider text-ink-soft mb-2">Rumusan Masalah</div>
              <p className="text-ink-muted leading-relaxed italic">{entry.question}</p>
            </div>

            <div className="divider-arabesque opacity-30"/>

            {/* Action row */}
            <div className="flex items-center gap-3 flex-wrap mt-6">
              <button onClick={catatKeKurasah} className="btn btn-primary text-sm py-2.5 px-5">
                <Icon name="bookmark" className="w-4 h-4"/> Catat ke Kurasah
              </button>
              <button onClick={() => copyPrompt(null)} className="btn btn-ghost text-sm py-2.5 px-5">
                <Icon name="copy" className="w-4 h-4"/> Salin Prompt AI
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Views */}
      <section className="pb-12">
        <div className="container-x">
          {/* Desktop grid */}
          <div className="hidden md:block">
            <Reveal stagger className={`grid gap-5 ${views2col ? "grid-cols-2" : views4col ? "grid-cols-2" : "grid-cols-2"}`}>
              {entry.views.map((v, i) => (
                <ViewColumn key={i} view={v} isMobile={false}/>
              ))}
            </Reveal>
          </div>

          {/* Mobile accordion */}
          <div className="md:hidden space-y-3">
            {entry.views.map((v, i) => (
              <ViewColumn key={i} view={v} isMobile={true}/>
            ))}
          </div>

          {/* Rangkuman Mudah */}
          {entry.rangkuman && (
            <Reveal className="mt-10">
              <div className="card-glass p-6 rounded-xl relative overflow-hidden"
                style={{border:"1px solid rgba(124,77,255,0.2)", background:"rgba(124,77,255,0.04)"}}>
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-violet-500/10 blur-2xl pointer-events-none"/>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center flex-shrink-0">
                      <Icon name="lightbulb" className="w-4 h-4 text-violet-300"/>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-violet-400 font-medium">Intinya</div>
                      <h2 className="font-display text-lg font-semibold text-ink leading-tight">Rangkuman dalam Bahasa Mudah</h2>
                    </div>
                  </div>
                  <p className="text-sm text-ink-muted leading-relaxed">{entry.rangkuman}</p>
                  <div className="mt-4 pt-4 border-t border-violet-500/15 flex items-start gap-2">
                    <Icon name="info" className="w-3.5 h-3.5 text-violet-400 flex-shrink-0 mt-0.5"/>
                    <p className="text-[11px] text-ink-soft leading-relaxed">
                      Ini rangkuman sederhana untuk memudahkan pemahaman awal. Untuk kajian mendalam, baca pendapat ulama di atas dan diskusikan dengan guru.
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          )}

          {/* Titik Perbedaan */}
          {entry.notes && (
            <Reveal className="mt-12">
              <div className="card-glass-strong p-7 rounded-xl" style={{border:"1px solid rgba(255,255,255,0.08)"}}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-1 h-10 rounded-full bg-gradient-to-b from-emerald-400 to-gold-400/60"/>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-ink-soft">Refleksi</div>
                    <h2 className="font-display text-xl font-semibold text-ink">Titik Perbedaan</h2>
                  </div>
                </div>
                <p className="text-ink-muted leading-relaxed max-w-3xl">{entry.notes}</p>
              </div>
            </Reveal>
          )}

          {/* Diskusi AI */}
          <Reveal className="mt-8">
            <div className="card-glass rounded-xl border border-gold-400/15 p-7" style={{background:"rgba(201,168,106,0.04)"}}>
              <div className="divider-arabesque opacity-20 mb-6"/>
              <h3 className="font-display text-xl font-semibold text-ink mb-2">Ingin paham lebih dalam?</h3>
              <p className="text-sm text-ink-muted leading-relaxed mb-5 max-w-2xl">
                Salin prompt ini dan ajak AI berdiskusi. Ingat: jadikan jawaban AI bahan refleksi, bukan pengganti <em>talaqqi</em> dengan guru.
              </p>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => copyPrompt("https://chat.openai.com")} className="btn btn-ghost text-sm py-2.5 px-4">
                  <Icon name="copy" className="w-4 h-4"/> Salin &amp; Buka ChatGPT
                </button>
                <button onClick={() => copyPrompt("https://claude.ai")} className="btn btn-ghost text-sm py-2.5 px-4">
                  <Icon name="copy" className="w-4 h-4"/> Salin &amp; Buka Claude
                </button>
                <button onClick={() => copyPrompt(null)} className="btn btn-ghost text-sm py-2.5 px-4">
                  <Icon name="copy" className="w-4 h-4"/> Salin saja
                </button>
              </div>
              <div className="divider-arabesque opacity-20 mt-6"/>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
};

window.MuqaranahDetailPage = MuqaranahDetailPage;
