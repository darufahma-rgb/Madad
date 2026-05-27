/* Madad, Muqaranah Form (Susun Custom) */

const BLANK_VIEW = () => ({
  scholar: "", scholarArabic: "", school: "",
  position: "", evidence: { arabic: "", translation: "", notes: "" },
  reasoning: "", source: "",
});

const ViewForm = ({ view, idx, onChange, onRemove, total }) => {
  const [open, setOpen] = React.useState(idx === 0);
  const upd = (field, val) => onChange({ ...view, [field]: val });
  const updEv = (field, val) => onChange({ ...view, evidence: { ...view.evidence, [field]: val } });

  return (
    <div className="card-glass rounded-xl border border-line overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-lg bg-violet-500/20 text-violet-200 text-xs flex items-center justify-center font-semibold">{idx + 1}</span>
          <span className="font-display text-base text-ink">{view.scholar || `Pendapat ${idx + 1}`}</span>
          {view.school && <span className="chip chip-glass text-[10px]">{view.school}</span>}
        </div>
        <div className="flex items-center gap-2">
          {total > 2 && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onRemove(); }}
              className="p-1.5 rounded-lg text-ink-soft hover:text-red-400 hover:bg-red-500/10 transition-colors">
              <Icon name="x" className="w-3.5 h-3.5"/>
            </button>
          )}
          <Icon name={open ? "chevronUp" : "chevronDown"} className="w-4 h-4 text-ink-soft"/>
        </div>
      </button>

      {open && (
        <div className="px-5 pb-6 space-y-4 border-t border-line pt-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-ink-soft block mb-1.5">Nama Ulama</label>
              <input value={view.scholar} onChange={e => upd("scholar", e.target.value)}
                placeholder="Imam Asy-Syafi'i"
                className="w-full bg-white/4 border border-line rounded-lg px-3 py-2.5 text-sm text-ink placeholder-ink-soft outline-none focus:border-violet-400/40 transition-colors"/>
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-ink-soft block mb-1.5">Nama Arab</label>
              <input value={view.scholarArabic} onChange={e => upd("scholarArabic", e.target.value)}
                placeholder="الإمام الشافعي"
                className="w-full bg-white/4 border border-line rounded-lg px-3 py-2.5 text-sm text-ink placeholder-ink-soft outline-none focus:border-violet-400/40 transition-colors arabic text-right"
                style={{direction:"rtl"}}/>
            </div>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-ink-soft block mb-1.5">Madzhab / Aliran</label>
            <input value={view.school} onChange={e => upd("school", e.target.value)}
              placeholder="Syafi'iyah"
              className="w-full bg-white/4 border border-line rounded-lg px-3 py-2.5 text-sm text-ink placeholder-ink-soft outline-none focus:border-violet-400/40 transition-colors"/>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-ink-soft block mb-1.5">Qoul (Pendapat Utama)</label>
            <textarea value={view.position} onChange={e => upd("position", e.target.value)}
              placeholder="Tuliskan pendapat ulama ini secara ringkas dan akurat..."
              rows={3}
              className="w-full bg-white/4 border border-line rounded-lg px-3 py-2.5 text-sm text-ink placeholder-ink-soft outline-none focus:border-violet-400/40 transition-colors resize-none leading-relaxed"/>
          </div>
          <div className="rounded-xl bg-gold-500/5 border border-gold-400/15 p-4 space-y-3">
            <div className="text-[10px] uppercase tracking-wider text-gold-400">Dalil</div>
            <textarea value={view.evidence.arabic} onChange={e => updEv("arabic", e.target.value)}
              placeholder="نص الدليل بالعربية..."
              rows={2}
              className="w-full bg-white/4 border border-line rounded-lg px-3 py-2 text-sm text-gold-200 placeholder-ink-soft outline-none focus:border-gold-400/30 transition-colors resize-none arabic text-right leading-loose"
              style={{direction:"rtl"}}/>
            <textarea value={view.evidence.translation} onChange={e => updEv("translation", e.target.value)}
              placeholder="Terjemah singkat..."
              rows={2}
              className="w-full bg-white/4 border border-line rounded-lg px-3 py-2 text-sm text-ink-muted placeholder-ink-soft outline-none focus:border-violet-400/30 transition-colors resize-none leading-relaxed"/>
            <input value={view.evidence.notes} onChange={e => updEv("notes", e.target.value)}
              placeholder="Catatan tambahan tentang dalil (opsional)"
              className="w-full bg-white/4 border border-line rounded-lg px-3 py-2 text-sm text-ink-muted placeholder-ink-soft outline-none focus:border-violet-400/30 transition-colors"/>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-ink-soft block mb-1.5">Wajh Istidlal</label>
            <textarea value={view.reasoning} onChange={e => upd("reasoning", e.target.value)}
              placeholder="Bagaimana ulama ini menyimpulkan pendapatnya dari dalil? Tuliskan secara mengalir, bukan bullet..."
              rows={3}
              className="w-full bg-white/4 border border-line rounded-lg px-3 py-2.5 text-sm text-ink-muted placeholder-ink-soft outline-none focus:border-violet-400/40 transition-colors resize-none leading-relaxed"/>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-ink-soft block mb-1.5">Sumber Kitab</label>
            <input value={view.source} onChange={e => upd("source", e.target.value)}
              placeholder="Al-Umm · Mughni Al-Muhtaj"
              className="w-full bg-white/4 border border-line rounded-lg px-3 py-2.5 text-sm text-ink-muted placeholder-ink-soft outline-none focus:border-violet-400/40 transition-colors"/>
          </div>
        </div>
      )}
    </div>
  );
};

const MuqaranahFormPage = () => {
  const { session, profile } = useAuth();
  const toast = useToast();
  const path = useRoute();

  // Check if editing existing custom entry
  const params = new URLSearchParams(path.includes("?") ? path.split("?")[1] : "");
  const editId = params.get("edit");
  const customList = loadCustomMuqaranah();
  const existing = editId ? customList.find(e => e.id === editId) : null;

  const [title, setTitle] = React.useState(existing?.title || "");
  const [titleArabic, setTitleArabic] = React.useState(existing?.titleArabic || "");
  const [category, setCategory] = React.useState(existing?.category || "fiqh");
  const [question, setQuestion] = React.useState(existing?.question || "");
  const [views, setViews] = React.useState(existing?.views || [BLANK_VIEW(), BLANK_VIEW()]);
  const [notes, setNotes] = React.useState(existing?.notes || "");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!session) navigate("/");
    else if (!profile?.onboarded) navigate("/onboarding");
  }, [session, profile]);

  if (!session || !profile?.onboarded) return null;

  const addView = () => {
    if (views.length >= 6) return;
    setViews([...views, BLANK_VIEW()]);
  };

  const updateView = (idx, val) => {
    const v = [...views];
    v[idx] = val;
    setViews(v);
  };

  const removeView = (idx) => {
    setViews(views.filter((_, i) => i !== idx));
  };

  const copyAIPrompt = () => {
    const ulama = views.map((v, idx) =>
      `${idx+1}. ${v.scholar || "[nama ulama]"} (${v.school || "[madzhab]"})`
    ).join("\n");

    const prompt = `Aku thalib Azhari sedang menyusun muqaranat al-aqwal untuk mas'alah:

**'Unwan (Judul):** ${title || "[JUDUL]"}
**Tashwir al-Mas'alah:** ${question || "[RUMUSAN]"}

Tolong bantu aku menyusun draft perbandingan dari ${views.length} ulama berikut:
${ulama}

**Format yang aku butuhkan per ulama:**

1. **Qoul** — pendapat utama (bahasa Indonesia akademik)
2. **Dalil** — sertakan teks Arab asli (ayat/hadits/kaidah) dengan harakat + terjemah
3. **Wajh istidlal** — bagaimana ulama tersebut berdalil dari dalil tersebut menuju qoul-nya (paragraf, bukan poin)
4. **Mashdar** (sumber kitab) — sebut nama Arab kitab (contoh: Al-Umm, Al-Mughni, Syarh al-Mahalli)

**Aturan:**
- Bahasa: Indonesia akademik dengan istilah Arab transliterasi
- Untuk nama ulama, pakai transliterasi Arab (al-Imam Ahmad ibn Hanbal, bukan "Imam Ahmad bin Hambal")
- Tanpa men-tarjih — aku ingin presentasi seimbang, biarkan aku yang merenungkan
- Bila ada qoul yang dalilnya lemah, sebutkan tapi tetap presentasikan dengan jujur

Setelah kamu draft, aku akan paste hasilnya ke form MADAD dan tambahkan refleksi pribadiku.`;

    navigator.clipboard.writeText(prompt);
    toast.push("Prompt AI disalin. Paste ke AI, lalu isi hasilnya di form ini.");
  };

  const handleSave = () => {
    if (!title.trim()) { toast.push("Isi judul masalah dulu."); return; }
    if (!question.trim()) { toast.push("Isi rumusan masalah dulu."); return; }
    const filledViews = views.filter(v => v.scholar.trim() && v.position.trim());
    if (filledViews.length < 2) { toast.push("Isi minimal 2 pendapat ulama."); return; }

    setSaving(true);
    const id = existing?.id || "custom_" + Date.now();
    const entry = { id, title: title.trim(), titleArabic: titleArabic.trim(), category, question: question.trim(), views: filledViews, notes: notes.trim() };

    const updated = existing
      ? customList.map(e => e.id === editId ? entry : e)
      : [entry, ...customList];
    saveCustomMuqaranah(updated);
    setSaving(false);
    toast.push("Muqaranah tersimpan ke koleksimu.");
    setTimeout(() => navigate("/paths/muqaranah?id=" + id), 500);
  };

  const cats = [
    { id:"fiqh", label:"Fiqh" }, { id:"ushul", label:"Ushul Fiqh" },
    { id:"aqidah", label:"Aqidah" }, { id:"hadits", label:"Hadits" },
  ];

  return (
    <div className="page-enter">
      <section className="section pb-4">
        <div className="container-x max-w-3xl">
          <Reveal>
            <div className="text-xs text-ink-soft mb-6">
              <button onClick={() => navigate("/paths")} className="hover:text-ink-muted">Learning Path</button>
              <span className="mx-2 opacity-40">/</span>
              <button onClick={() => navigate("/paths/muqaranah")} className="hover:text-ink-muted">Muqaranah</button>
              <span className="mx-2 opacity-40">/</span>
              <span className="text-ink-muted">{existing ? "Edit" : "Susun Baru"}</span>
            </div>
            <div className="divider-arabesque opacity-30 mb-8"/>
            <h1 className="font-display text-4xl font-semibold text-ink mb-2">{existing ? "Edit Muqaranah" : "Susun Muqaranah"}</h1>
            <p className="text-ink-muted mb-8">Rangkum qoul ulama secara adil dan akurat. Tidak perlu men-tarjih, biarkan thalib yang merenung.</p>
          </Reveal>

          <div className="space-y-8">
            {/* Step 1: Identitas */}
            <Reveal className="card-glass rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-7 h-7 rounded-lg bg-violet-500/20 text-violet-200 text-xs flex items-center justify-center font-semibold">1</span>
                <span className="font-display text-lg text-ink">Identitas Masalah</span>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-ink-soft block mb-1.5">Judul Masalah</label>
                <input value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="Hukum Membaca Basmalah dalam Al-Fatihah"
                  className="w-full bg-white/4 border border-line rounded-lg px-4 py-3 text-ink font-display text-lg placeholder-ink-soft outline-none focus:border-violet-400/40 transition-colors"/>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-ink-soft block mb-1.5">Judul Arab (opsional)</label>
                <input value={titleArabic} onChange={e => setTitleArabic(e.target.value)}
                  placeholder="حكم قراءة البسملة"
                  className="w-full bg-white/4 border border-line rounded-lg px-4 py-3 text-gold-200 placeholder-ink-soft outline-none focus:border-gold-400/30 transition-colors arabic text-right"
                  style={{direction:"rtl"}}/>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-ink-soft block mb-2">Kategori</label>
                <div className="flex gap-2 flex-wrap">
                  {cats.map(c => (
                    <button key={c.id} type="button" onClick={() => setCategory(c.id)}
                      className={`chip text-xs transition-all ${category === c.id ? "chip-violet" : "chip-glass hover:bg-white/6"}`}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-ink-soft block mb-1.5">Rumusan Masalah</label>
                <textarea value={question} onChange={e => setQuestion(e.target.value)}
                  placeholder="Tuliskan pertanyaan inti yang menjadi fokus muqaranah ini..."
                  rows={3}
                  className="w-full bg-white/4 border border-line rounded-lg px-4 py-3 text-sm text-ink-muted placeholder-ink-soft outline-none focus:border-violet-400/40 transition-colors resize-none leading-relaxed"/>
              </div>
            </Reveal>

            {/* Step 2: Views */}
            <Reveal>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-violet-500/20 text-violet-200 text-xs flex items-center justify-center font-semibold">2</span>
                <span className="font-display text-lg text-ink">Pendapat Ulama</span>
                <span className="text-xs text-ink-soft">(min 2, maks 6)</span>
              </div>

              <div className="space-y-3 mb-4">
                {views.map((v, i) => (
                  <ViewForm key={i} view={v} idx={i} onChange={val => updateView(i, val)} onRemove={() => removeView(i)} total={views.length}/>
                ))}
              </div>

              <div className="flex items-center gap-3">
                {views.length < 6 && (
                  <button type="button" onClick={addView} className="btn btn-ghost text-sm py-2.5 px-4">
                    <Icon name="sparkles" className="w-4 h-4"/> Tambah Pendapat
                  </button>
                )}
                <button type="button" onClick={copyAIPrompt} className="btn btn-ghost text-sm py-2.5 px-4 text-ink-muted">
                  <Icon name="copy" className="w-4 h-4"/> Bantu aku dengan AI
                </button>
              </div>
            </Reveal>

            {/* Step 3: Notes */}
            <Reveal className="card-glass rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-violet-500/20 text-violet-200 text-xs flex items-center justify-center font-semibold">3</span>
                <span className="font-display text-lg text-ink">Catatan Titik Khilaf</span>
                <span className="text-xs text-ink-soft">(opsional)</span>
              </div>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Tuliskan akar perbedaan dan konsekuensi praktisnya. Bukan kesimpulan mana yang benar, tapi mengapa mereka berbeda..."
                rows={4}
                className="w-full bg-white/4 border border-line rounded-lg px-4 py-3 text-sm text-ink-muted placeholder-ink-soft outline-none focus:border-violet-400/40 transition-colors resize-none leading-relaxed"/>
            </Reveal>

            {/* Save */}
            <Reveal className="flex items-center gap-4 pb-10">
              <button onClick={handleSave} disabled={saving}
                className="btn btn-primary px-8 py-3">
                {saving ? "Menyimpan..." : "Simpan ke Buatan Saya"}
              </button>
              <button onClick={() => navigate("/paths/muqaranah")} className="btn btn-ghost py-3 px-5">Batal</button>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
};

window.MuqaranahFormPage = MuqaranahFormPage;
