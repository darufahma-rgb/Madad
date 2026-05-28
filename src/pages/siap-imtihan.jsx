/* Talqee — Siap Imtihan Page
   Section di dashboard yang jadi landing, plus halaman penuh /siap-imtihan
*/

/* ============ CONSTANTS ============ */

const IMTIHAN_MODES = [
  {
    id: "kompres",
    label: "Kompres Materi",
    labelArabic: "تلخيص المادة",
    icon: "list",
    color: "violet",
    desc: "Rangkuman padat satu bab — definisi, dalil, hukum, pengecualian. Format siap tulis di kertas ujian.",
    tag: "Tahriri",
  },
  {
    id: "analogi",
    label: "Analogi & Paham",
    labelArabic: "التشبيه والفهم",
    icon: "lightbulb",
    color: "gold",
    desc: "Konsep yang susah dicerna dijelaskan lewat analogi sehari-hari — tapi istilah teknisnya tetap benar.",
    tag: "Tahriri + Syafawi",
  },
  {
    id: "drill",
    label: "Drill Soal Azhari",
    labelArabic: "التدريب على الأسئلة",
    icon: "target",
    color: "violet",
    desc: "Latihan soal persis gaya imtihan Al-Azhar: 'arrif, bayyin, wadhdhih, qaarun. Lengkap dengan model jawaban.",
    tag: "Tahriri",
  },
  {
    id: "syafawi",
    label: "Mock Syafawi",
    labelArabic: "محاكاة الشفوي",
    icon: "messageSquare",
    color: "gold",
    desc: "Simulasi ujian lisan — AI berperan sebagai dosen yang menguji, follow-up jawaban, dan tantang pemahamanmu.",
    tag: "Syafawi",
  },
];

/* ============ PROMPT GENERATOR ============ */

const generateImtihanPrompt = (mode, maddah, profile) => {
  const facultyData = (typeof FACULTIES !== "undefined")
    ? FACULTIES.find(f => f.id === profile?.faculty) : null;
  const fakultas = facultyData?.label || "Al-Azhar";
  const tingkat = (typeof TINGKATAN_LABEL !== "undefined")
    ? (TINGKATAN_LABEL[profile?.level] || "thalib") : "thalib";
  const maddahNama = maddah || "[MADDAH — isi nama mata kuliah]";

  const prompts = {

    kompres: `Aku ${tingkat} di ${fakultas}, akan menghadapi ujian Tahriri untuk maddah ${maddahNama}.

Bab/topik yang mau aku kompres: [TULIS BAB ATAU TOPIK]

Buatkan talkhish (rangkuman) siap ujian dengan format berikut — padat, langsung ke inti, tidak ada penjelasan panjang:

1. **Ta'rif** (definisi) — tulis teks Arab istilah + transliterasi + definisi singkat
2. **Arkan/Syuruth** (rukun/syarat) — jika ada, bullet per poin
3. **Dalil utama** — sertakan teks Arab dengan harakat + terjemah + sumber (kitab/hadits)
4. **Hukum** — apa hukumnya? Ada ikhtilaf? Sebutkan madzhab yang berbeda (1 baris tiap madzhab)
5. **Pengecualian/mustatsnayat** — kalau ada
6. **Farq** (perbedaan dengan konsep mirip) — kalau relevan, 1-2 poin

Bahasa: Indonesia akademik. Istilah teknis tetap Arab transliterasi. Teks Arab wajib ada harakat.
Panjang: padat, tidak lebih dari 1 halaman A4 mental. Ini untuk ditulis ulang di kertas ujian.`,

    analogi: `Aku ${tingkat} di ${fakultas}, mau ujian ${maddahNama} tapi ada konsep yang masih susah dicerna secara logis.

Konsep yang mau aku pahami: [TULIS KONSEP YANG SUSAH — mis. mafhum mukhalafah, naskh, 'illah qiyas, dll]

Tolong jelaskan dengan cara berikut:

**Langkah 1 — Definisi dengan istilah yang tepat**
Tulis definisi formal dalam Arab dengan harakat, lalu terjemah akademis. Jangan ubah istilah teknisnya.

**Langkah 2 — Analoginya**
Berikan 1-2 analogi dari kehidupan sehari-hari thalib di Mesir (kehidupan kos, masjid, pasar, kampus). Analogi harus menerangkan *logika konsep*, bukan hanya kesamaan nama.

**Langkah 3 — Kembalikan ke istilah teknis**
Setelah analogi, hubungkan kembali: "Nah, itulah yang dimaksud [ISTILAH] — dalam fiqh/ushul/kalam, [konsep teknis kembali]."

**Langkah 4 — Contoh aplikasi di teks Arab**
Berikan 1 contoh penggunaan konsep ini di ayat/hadits/kaidah. Tulis teks Arabnya dengan harakat.

Ingat: Aku butuh PAHAM, bukan hanya HAFAL. Tapi istilah teknisnya harus tetap benar untuk ujian.`,

    drill: `Aku ${tingkat} di ${fakultas}, mau drill soal ujian Tahriri untuk maddah ${maddahNama}.

Bab/topik yang mau di-drill: [TULIS BAB ATAU TOPIK]

Buat 8 soal dengan gaya khas imtihan Al-Azhar. Campurkan format berikut:

Format soal yang harus ada:
- "عَرِّفْ..." (definisikan...) — setidaknya 2 soal
- "بَيِّنْ الْفَرْقَ بَيْنَ... وَ..." (jelaskan perbedaan antara... dan...) — 1-2 soal
- "وَضِّحْ..." (jelaskan/uraikan...) — 1-2 soal
- "اذْكُرْ... مَعَ الدَّلِيلِ" (sebutkan... beserta dalil) — 1-2 soal
- "مَا حُكْمُ... مَعَ التَّعْلِيلِ" (apa hukum... beserta alasan) — 1 soal

**Tulis soal dalam Bahasa Arab** (untuk membiasakan baca soal Azhari yang memang berbahasa Arab).
Berikan terjemah Indonesia di bawah tiap soal (italic).

**JANGAN kasih jawaban dulu.** Aku akan jawab semua, lalu kamu koreksi per nomor dengan:
- Kaidah/definisi yang benar
- Teks Arab model jawaban (kalau relevan)
- Hal yang biasanya keliru dalam menjawab soal ini`,

    syafawi: `Aku ${tingkat} di ${fakultas}, mau latihan ujian Syafawi untuk maddah ${maddahNama}.

Topik yang mau diuji: [TULIS TOPIK]

Bertindaklah sebagai dosen Al-Azhar yang sedang menguji aku dalam ujian lisan (syafawi). Ikuti aturan berikut:

**Aturan sesi:**
- Mulai dengan 1 pertanyaan pembuka (level dasar)
- Tunggu jawabanku sebelum lanjut
- Kalau jawabanku benar tapi tidak lengkap: tanya follow-up untuk perdalam
- Kalau jawabanku kurang tepat: jangan langsung koreksi — tanya balik "apa dalilnya?" atau "bagaimana kalau kasusnya begini?"
- Setelah 5-6 pertanyaan, naikkan level ke pertanyaan yang lebih kompleks
- Jangan terlalu mudah — dosen Azhari terkenal galak dan detail

**Format pertanyaanmu:**
- Campur Bahasa Arab dan Indonesia (seperti dosen Azhari asli)
- Contoh: "Apa definisi [istilah]?" atau "عَرِّفْ لِي [istilah] بِالضَّبْطِ"

**Di akhir sesi (setelah 8-10 pertanyaan):**
Berikan evaluasi jujur:
- Apa yang sudah aku kuasai dengan baik
- Apa yang perlu diperdalam sebelum ujian
- 3 topik yang paling perlu di-review ulang

Mulai sekarang. Tanya pertanyaan pertamamu.`,
  };

  return prompts[mode] || "";
};

window.generateImtihanPrompt = generateImtihanPrompt;

/* ============ KOMPONEN PROMPT CARD ============ */

const ImtihanPromptCard = ({ mode, maddah, profile }) => {
  const toast = useToast();
  const [copied, setCopied] = React.useState(false);
  const [targetAI, setTargetAI] = React.useState(
    mode.id === "syafawi" ? "chatgpt" : "claude"
  );

  const prompt = generateImtihanPrompt(mode.id, maddah, profile);
  const recommendedAIs = {
    kompres:  ["claude", "chatgpt"],
    analogi:  ["claude", "chatgpt"],
    drill:    ["claude", "chatgpt"],
    syafawi:  ["chatgpt", "claude"],
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    toast.push("Prompt tersalin — paste ke AI, isi placeholder [...].");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCopyAndOpen = () => {
    navigator.clipboard.writeText(prompt);
    const tool = AI_TOOLS.find(t => t.id === targetAI);
    if (tool?.link) setTimeout(() => window.open(tool.link, "_blank"), 300);
    toast.push(`Prompt tersalin — membuka ${tool?.name}...`);
  };

  const colorClass = mode.color === "gold"
    ? "border-gold-500/20 bg-gold-500/5"
    : "border-violet-500/20 bg-violet-500/5";

  return (
    <div className={`card-glass p-5 md:p-6 border ${colorClass} relative overflow-hidden`}>
      <div className={`absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl pointer-events-none ${
        mode.color === "gold" ? "bg-gold-500/10" : "bg-violet-500/10"
      }`}/>

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                mode.color === "gold" ? "bg-gold-500/15" : "bg-violet-500/15"
              }`}>
                <Icon name={mode.icon} className={`w-4 h-4 ${
                  mode.color === "gold" ? "text-gold-300" : "text-violet-300"
                }`}/>
              </div>
              <h3 className="font-display text-lg font-semibold text-ink">{mode.label}</h3>
            </div>
            <div className="arabic-display text-sm text-ink-soft" style={{direction:"rtl"}}>
              {mode.labelArabic}
            </div>
          </div>
          <span className={`text-[10px] px-2 py-1 rounded-full border font-medium flex-shrink-0 ${
            mode.color === "gold"
              ? "bg-gold-500/10 text-gold-300 border-gold-500/20"
              : "bg-violet-500/10 text-violet-300 border-violet-500/20"
          }`}>
            {mode.tag}
          </span>
        </div>

        <p className="text-sm text-ink-muted leading-relaxed mb-4">{mode.desc}</p>

        {/* AI selector */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-ink-soft">Pakai:</span>
          {recommendedAIs[mode.id].map(toolId => {
            const tool = AI_TOOLS.find(t => t.id === toolId);
            if (!tool) return null;
            return (
              <button key={toolId} onClick={() => setTargetAI(toolId)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border transition-colors ${
                  targetAI === toolId
                    ? "bg-violet-500/15 text-violet-200 border-violet-500/30"
                    : "bg-white/3 text-ink-muted border-line hover:bg-white/5"
                }`}>
                <ToolIcon tool={tool} size="w-4 h-4" rounded="rounded-sm"/>
                {tool.name}
              </button>
            );
          })}
        </div>

        {/* Preview prompt (3 baris) */}
        <div className="p-3 rounded-lg bg-white/3 border border-line mb-4">
          <p className="text-xs text-ink-soft font-mono leading-relaxed line-clamp-3 whitespace-pre-wrap">
            {prompt.slice(0, 220)}...
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleCopy}
            className="btn-ghost text-xs px-3 py-2 flex items-center gap-1.5"
            style={{minHeight:40}}>
            <Icon name="copy" className="w-3 h-3"/>
            {copied ? "Tersalin ✓" : "Salin Prompt"}
          </button>
          <button onClick={handleCopyAndOpen}
            className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
            style={{minHeight:40}}>
            Salin & Buka {AI_TOOLS.find(t => t.id === targetAI)?.name}
            <Icon name="external" className="w-3 h-3"/>
          </button>
        </div>

        {/* Loop-closer: simpan hasil ke Kurasah */}
        {copied && (
          <div className="mt-3 flex items-center justify-between gap-2 p-3 rounded-lg bg-gold-500/8 border border-gold-500/20">
            <p className="text-xs text-ink-muted">
              <span className="text-gold-300 font-medium">Sudah dapat jawaban AI?</span>
              {" "}Simpan ke Kurasah supaya bisa review lagi.
            </p>
            <button onClick={() => {
              const newNote = {
                id: "note_" + Date.now(),
                title: `Siap Imtihan — ${mode.label}`,
                body: `## Mode\n${mode.label}\n\n## Maddah\n${maddah || "[isi maddah]"}\n\n## Catatan dari AI\n\n*Paste jawaban AI di sini...*\n\n## Poin penting untuk diingat\n\n1. \n2. \n3. `,
                tags: ["siap-imtihan", mode.id],
                source: { type: "imtihan", label: mode.label },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              const existing = loadNotes();
              saveNotes([newNote, ...existing]);
              navigate("/kurasah?id=" + newNote.id);
            }}
              className="btn-ghost text-xs px-3 py-1.5 border border-gold-500/20 text-gold-300 hover:bg-gold-500/8 flex-shrink-0"
              style={{minHeight:36}}>
              <Icon name="notebook" className="w-3 h-3 mr-1"/>
              Simpan
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ============ HALAMAN PENUH /siap-imtihan ============ */

const SiapImtihanPage = () => {
  const { session, profile } = useAuth();
  const [activeMaddah, setActiveMaddah] = React.useState("");
  const [activeMode, setActiveMode] = React.useState("kompres");

  if (!session || !profile?.onboarded) { navigate("/"); return null; }

  const myMaddahs = (typeof getMaddahsForProfile !== "undefined")
    ? getMaddahsForProfile(profile).filter(m =>
        m.prompts && Object.values(m.prompts).some(a => a.length > 0)
      ).slice(0, 10)
    : [];

  const currentMode = IMTIHAN_MODES.find(m => m.id === activeMode);

  return (
    <div className="page-enter mobile-page-wrap">
      {/* Header */}
      <section className="relative pt-6 md:pt-12 pb-6 overflow-hidden">
        <div className="absolute inset-0 pattern-talqih opacity-40 pointer-events-none"/>
        <Blob color="rgba(124,77,255,0.2)" size={500} top={-150} right={-80}/>

        <div className="container-x relative">
          <button onClick={() => navigate("/dashboard")}
            className="text-sm text-ink-soft inline-flex items-center gap-1.5 mb-4"
            style={{minHeight:40}}>
            <Icon name="arrowLeft" className="w-4 h-4"/> Dashboard
          </button>

          <div className="arabic-classic text-gold-300 text-2xl md:text-3xl mb-2" style={{direction:"rtl"}}>
            الاستعداد للامتحان
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-semibold text-ink mb-3">
            Siap Imtihan
          </h1>
          <p className="text-base text-ink-muted max-w-xl leading-relaxed">
            4 mode prompt khusus untuk persiapan ujian Tahriri dan Syafawi Al-Azhar.
            Pilih maddah, pilih mode, salin prompt ke AI.
          </p>
        </div>
      </section>

      {/* Maddah selector */}
      <section className="pb-6">
        <div className="container-x">
          <div className="text-xs uppercase tracking-[0.2em] text-gold-400 mb-3 flex items-center gap-2">
            <span className="w-5 h-px bg-gold-500/60"/>
            Pilih Maddah (opsional)
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 pb-1">
            <button onClick={() => setActiveMaddah("")}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm border transition-colors ${
                activeMaddah === ""
                  ? "bg-violet-500/20 text-violet-200 border-violet-500/30"
                  : "bg-white/3 text-ink-muted border-line hover:bg-white/5"
              }`} style={{minHeight:40}}>
              Umum
            </button>
            {myMaddahs.map(m => (
              <button key={m.id} onClick={() => setActiveMaddah(m.name)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm border transition-colors ${
                  activeMaddah === m.name
                    ? "bg-violet-500/20 text-violet-200 border-violet-500/30"
                    : "bg-white/3 text-ink-muted border-line hover:bg-white/5"
                }`} style={{minHeight:40}}>
                {m.name}
              </button>
            ))}
          </div>
          {activeMaddah && (
            <p className="text-xs text-ink-soft mt-2">
              Prompt akan menyertakan konteks maddah: <span className="text-ink">{activeMaddah}</span>
            </p>
          )}
        </div>
      </section>

      {/* Mode tabs */}
      <section className="pb-8">
        <div className="container-x">
          <div className="text-xs uppercase tracking-[0.2em] text-gold-400 mb-3 flex items-center gap-2">
            <span className="w-5 h-px bg-gold-500/60"/>
            Pilih Mode
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 pb-3 mb-6">
            {IMTIHAN_MODES.map(mode => (
              <button key={mode.id} onClick={() => setActiveMode(mode.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border transition-colors ${
                  activeMode === mode.id
                    ? mode.color === "gold"
                      ? "bg-gold-500/15 text-gold-200 border-gold-500/30"
                      : "bg-violet-500/15 text-violet-200 border-violet-500/30"
                    : "bg-white/3 text-ink-muted border-line hover:bg-white/5"
                }`} style={{minHeight:44}}>
                <Icon name={mode.icon} className="w-4 h-4"/>
                <span className="font-medium">{mode.label}</span>
              </button>
            ))}
          </div>

          {currentMode && (
            <Reveal key={activeMode}>
              <ImtihanPromptCard
                mode={currentMode}
                maddah={activeMaddah}
                profile={profile}
              />
            </Reveal>
          )}
        </div>
      </section>

      {/* Tips ujian Azhari */}
      <section className="pb-12">
        <div className="container-x">
          <div className="card-glass p-5 md:p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-gold-400 mb-4 flex items-center gap-2">
              <span className="w-5 h-px bg-gold-500/60"/>
              Tips Ujian Al-Azhar
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  title: "Untuk Tahriri",
                  items: [
                    "Mulai jawaban dengan ta'rif yang padat — dosen nilai dari definisi pertama",
                    "Sertakan dalil Arab + terjemah, walau singkat",
                    "Gunakan format: ta'rif → dalil → hukum → ikhtilaf (kalau ada)",
                    "Tulis rapi — khat yang jelek bisa kurangi nilai",
                  ],
                },
                {
                  title: "Untuk Syafawi",
                  items: [
                    "Jawab dengan percaya diri — dosen uji mental, bukan hanya ilmu",
                    "Kalau tidak tahu: 'لا أعرف بالتفصيل لكن أعرف...' lebih baik dari diam",
                    "Latih jawab dalam bahasa Arab — walau campuran",
                    "Drill dengan teman: satu jadi dosen, satu jadi mahasiswa",
                  ],
                },
              ].map((tip, i) => (
                <div key={i}>
                  <div className="text-sm font-semibold text-ink mb-2">{tip.title}</div>
                  <ul className="space-y-1.5">
                    {tip.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs text-ink-muted">
                        <span className="w-1 h-1 rounded-full bg-gold-400 flex-shrink-0 mt-1.5"/>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

window.SiapImtihanPage = SiapImtihanPage;
window.IMTIHAN_MODES = IMTIHAN_MODES;
window.generateImtihanPrompt = generateImtihanPrompt;
