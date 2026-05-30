/* Talqeeh — Halaman Maddah S2
   Menampilkan maddah yang diinput user saat onboarding S2.
   Setiap maddah punya prompt templates yang adaptive.
*/

/* ============ PROMPT TEMPLATES S2 ============ */

const S2_PROMPT_TEMPLATES = {

  pahami: `Aku [TINGKATAN] di [JALUR_S2], [FAKULTAS] [JURUSAN].

[MADDAH_S2]
Topik yang ingin aku pahami: [TOPIK]

Bantu aku memahami topik ini setara level riset akademik S2:

1. **Kontekstualisasi** — posisi topik ini dalam disiplin ilmu secara keseluruhan
2. **Pengertian teknis** — definisi dari berbagai ulama/ahli dengan perbandingan
   (sertakan teks Arab + sumber bila ada)
3. **Inti pembahasan** — poin-poin substantif dengan kedalaman akademik
4. **Jadal ilmi** — perdebatan akademik yang ada seputar topik ini
5. **Relevansi kontemporer** — aplikasi atau perkembangan terkini

[LEVEL_BAHASA]`,

  drill: `Aku [TINGKATAN] di [JALUR_S2], [FAKULTAS] [JURUSAN].

[MADDAH_S2]
Topik untuk di-drill: [TOPIK]

Buat 6 soal akademik S2 bergaya seminar Al-Azhar:

Format soal (campur):
- "حلِّل وناقش..." (analisis dan diskusikan) — 2 soal
- "قارن بين منهج... ومنهج..." (bandingkan metodologi) — 2 soal
- "ما موقف العلماء من... مع الترجيح" (pendapat ulama + tarjih) — 1 soal
- "اكتب مقدمة بحثية عن..." (tulis pendahuluan riset tentang) — 1 soal

Tulis soal dalam Bahasa Arab. Beri terjemah Indonesia di bawah tiap soal.
JANGAN beri jawaban dulu — tunggu aku jawab, baru koreksi dengan standar akademik S2.

[LEVEL_BAHASA]`,

  literatur: `Aku [TINGKATAN] di [JALUR_S2], [FAKULTAS] [JURUSAN].

[MADDAH_S2]
Topik yang butuh review literatur: [TOPIK]

Bantu aku review literatur akademik untuk topik ini:

1. **Sumber primer klasik** (kutub turats) — kitab-kitab utama yang membahas topik ini
   Format: Nama kitab (Arab) — Pengarang — Relevansinya untuk topik
2. **Sumber kontemporer** — buku/majalah akademik terkini (pasca-1980)
3. **Dirasat sabiqah** (penelitian terdahulu) — risalah/disertasi yang pernah membahas ini
4. **Gap penelitian** — apa yang belum banyak diteliti dari topik ini
5. **Rekomendasi fokus** — dari semua sumber, dari mana sebaiknya aku mulai

Sertakan nama Arab untuk setiap kitab/sumber yang disebut.

[LEVEL_BAHASA]`,

  presentasi: `Aku [TINGKATAN] di [JALUR_S2], [FAKULTAS] [JURUSAN].

[MADDAH_S2]
Topik presentasi/makalah: [TOPIK]

Bantu aku persiapan presentasi akademik S2:

1. **Outline presentasi** — struktur 15-20 menit (pembukaan, isi, penutup)
2. **Poin-poin kunci** — maksimal 5 poin utama yang harus tersampaikan
3. **Argumen terkuat** — yang paling perlu ditekankan beserta dalilnya
4. **Kemungkinan pertanyaan** — 5 pertanyaan yang mungkin ditanya dosen/peserta
5. **Model jawaban** — jawaban singkat untuk tiap pertanyaan

Bahasa presentasi: campuran Arab akademik + Indonesia (seperti seminar S2 Azhari).

[LEVEL_BAHASA]`,
};

/* ============ PROMPT RISALAH ============ */

const RISALAH_TEMPLATES = {

  outline: `Aku [TINGKATAN] di [JALUR_S2], [FAKULTAS] [JURUSAN].
Judul risalah (tesis): [JUDUL_RISALAH]

Bantu aku buat outline risalah yang memenuhi standar akademik Al-Azhar:

**Struktur yang dibutuhkan:**

BAB I — PENDAHULUAN (مقدمة)
- Latar belakang masalah (خلفية البحث)
- Rumusan masalah (أسئلة البحث) — dalam bentuk pertanyaan
- Tujuan penelitian (أهداف البحث)
- Signifikansi penelitian (أهمية البحث)
- Metodologi penelitian (منهج البحث)
- Batasan penelitian (حدود البحث)
- Sistematika penulisan (خطة البحث)

BAB II, III, IV — ISI (berdasarkan judul)
- Bagi topik menjadi bab-bab logis
- Tiap bab punya sub-bab yang koheren
- Urutan dari umum ke khusus, dari teori ke aplikasi

BAB TERAKHIR — PENUTUP (خاتمة)
- Kesimpulan (نتائج البحث)
- Rekomendasi (توصيات)

Berikan outline lengkap dengan judul Arab + Indonesia untuk setiap bab dan sub-bab.`,

  rumusan: `Aku [TINGKATAN] di [JALUR_S2], [FAKULTAS] [JURUSAN].
Judul risalah: [JUDUL_RISALAH]
Area yang ingin diteliti: [TOPIK]

Bantu aku merumuskan masalah penelitian yang tajam:

1. **Analisis gap** — apa yang belum diteliti secara mendalam dari area ini?
2. **3-5 rumusan masalah** — dalam bentuk pertanyaan penelitian yang spesifik
   Format Arab: "ما..." / "كيف..." / "ما مدى..."
   + terjemah Indonesia
3. **Hipotesis awal** (فرضيات) — dugaan sementara untuk tiap pertanyaan
4. **Batasan masalah** — apa yang di-scope out dari penelitian ini dan kenapa
5. **Kebaruan penelitian** (الجدة والابتكار) — apa yang baru dari penelitian ini

Standar: rumusan masalah harus spesifik, terukur, dan bisa dijawab melalui penelitian.`,

  abstrak: `Aku [TINGKATAN] di [JALUR_S2], [FAKULTAS] [JURUSAN].
Judul risalah: [JUDUL_RISALAH]

Poin-poin utama risalah:
[POIN_RISALAH]

Bantu aku tulis abstrak bilingual (Arab + Indonesia) standar Al-Azhar:

**ABSTRAK ARAB** (ملخص البحث):
- Panjang: 200-250 kata Arab
- Struktur: latar belakang → rumusan masalah → metodologi → temuan utama → kesimpulan
- Bahasa: Arab akademik baku (فصحى معاصرة)
- Akhiri dengan kata kunci (الكلمات المفتاحية): 5-7 kata kunci Arab

**ABSTRAK INDONESIA**:
- Terjemahan akademik dari abstrak Arab
- Bukan terjemah harfiyah — sesuaikan dengan gaya akademik Indonesia
- Akhiri dengan Kata Kunci: 5-7 kata kunci Indonesia`,

  footnote: `Aku [TINGKATAN] di [JALUR_S2], [FAKULTAS] [JURUSAN].

Bantu aku tulis footnote Arab yang benar untuk kutipan berikut:

Informasi sumber:
- Nama kitab/buku: [NAMA_KITAB]
- Pengarang: [PENGARANG]
- Penerbit & tahun: [PENERBIT_TAHUN]
- Jilid & halaman: [JILID_HALAMAN]

Berikan:
1. **Format footnote pertama** (kutipan pertama kali — lengkap)
2. **Format footnote singkat** (ibid / op.cit — kalau kutip ulang)
3. **Format daftar pustaka** (قائمة المصادر والمراجع)

Ikuti standar penulisan akademik Al-Azhar.`,
};

/* ============ KOMPONEN FOOTNOTE HELPER ============ */

const FootnoteFields = ({ values, onChange }) => {
  const fields = [
    { key: "namaKitab",     label: "Nama kitab/buku",    placeholder: "mis. الفقه الإسلامي وأدلته" },
    { key: "pengarang",     label: "Pengarang",           placeholder: "mis. Wahbah Zuhaili" },
    { key: "penerbitTahun", label: "Penerbit & tahun",    placeholder: "mis. Dar al-Fikr, 1989" },
    { key: "jilidHalaman",  label: "Jilid & halaman",     placeholder: "mis. Jilid 3, hlm. 245" },
  ];
  return (
    <div className="space-y-3 mb-4">
      {fields.map(f => (
        <div key={f.key}>
          <label className="text-xs text-ink-soft mb-1.5 block">{f.label}:</label>
          <input
            value={values[f.key] || ""}
            onChange={e => onChange(f.key, e.target.value)}
            placeholder={f.placeholder}
            className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-ink outline-none transition-colors"
            style={{fontSize:16}}
            onFocus={e => e.target.style.borderColor="rgba(62,207,142,0.45)"}
            onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.10)"}
          />
        </div>
      ))}
    </div>
  );
};

/* ============ KOMPONEN UTAMA ============ */

const S2MaddahPage = () => {
  const { session, profile } = useAuth();
  const toast = useToast();
  const [selectedMaddah, setSelectedMaddah] = useState(null);
  const [activeTab, setActiveTab]   = useState("prompt");
  const [activeMode, setActiveMode] = useState("pahami");
  const [topikInput, setTopikInput] = useState("");
  const [judulRisalah, setJudulRisalah] = useState("");
  const [risalahMode, setRisalahMode] = useState("outline");
  const [poinRisalah, setPoinRisalah] = useState("");
  const [footnoteFields, setFootnoteFields] = useState({});
  const [copied, setCopied] = useState(false);

  if (!session || !profile?.onboarded) { navigate("/"); return null; }

  const isS2 = profile?.level === "s2_kuliyyat" || profile?.level === "s2_dirasat";
  if (!isS2) { navigate("/dashboard"); return null; }

  const maddahList = profile?.s2Maddah || [];
  const jalur = profile.level === "s2_kuliyyat" ? "Kuliyyat Ulum" : "Dirasat Ulya";

  const getPrompt = () => {
    if (activeTab === "risalah") {
      let template = RISALAH_TEMPLATES[risalahMode] || "";
      template = template
        .replace(/\[JUDUL_RISALAH\]/g, judulRisalah || "[tulis judul risalahmu]")
        .replace(/\[TOPIK\]/g,         topikInput   || "[tulis area yang ingin diteliti]")
        .replace(/\[POIN_RISALAH\]/g,  poinRisalah  || "[tulis poin-poin utama risalah]")
        .replace(/\[NAMA_KITAB\]/g,    footnoteFields.namaKitab     || "[nama kitab]")
        .replace(/\[PENGARANG\]/g,     footnoteFields.pengarang     || "[pengarang]")
        .replace(/\[PENERBIT_TAHUN\]/g,footnoteFields.penerbitTahun || "[penerbit & tahun]")
        .replace(/\[JILID_HALAMAN\]/g, footnoteFields.jilidHalaman  || "[jilid & halaman]");
      return generateS2Prompt(template, profile, selectedMaddah);
    }
    const template = (S2_PROMPT_TEMPLATES[activeMode] || "")
      .replace(/\[TOPIK\]/g, topikInput || "[tulis topik spesifik yang ingin dibahas]");
    return generateS2Prompt(template, profile, selectedMaddah);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getPrompt());
    setCopied(true);
    toast.push("Prompt tersalin — paste ke AI.");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCopyAndOpen = (toolId) => {
    navigator.clipboard.writeText(getPrompt());
    const tool = (typeof AI_TOOLS !== "undefined" ? AI_TOOLS : []).find(t => t.id === toolId);
    if (tool?.link) setTimeout(() => window.open(tool.link, "_blank"), 300);
    toast.push(`Tersalin — membuka ${tool?.name || toolId}...`);
  };

  const PROMPT_MODES = [
    { id: "pahami",     label: "Pahami",     icon: "lightbulb", desc: "Analisis kritis setara seminar S2" },
    { id: "drill",      label: "Drill Soal", icon: "target",    desc: "Soal bergaya ujian S2 Al-Azhar" },
    { id: "literatur",  label: "Literatur",  icon: "bookOpen",  desc: "Review sumber & dirasat sabiqah" },
    { id: "presentasi", label: "Presentasi", icon: "layers",    desc: "Persiapan makalah & seminar" },
  ];

  const RISALAH_MODES = [
    { id: "outline",  label: "Outline Bab",     icon: "list" },
    { id: "rumusan",  label: "Rumusan Masalah", icon: "search" },
    { id: "abstrak",  label: "Abstrak",          icon: "pen" },
    { id: "footnote", label: "Footnote Arab",   icon: "bookmark" },
  ];

  const promptPreview = getPrompt().slice(0, 300);

  return (
    <div className="page-enter mobile-page-wrap">

      {/* Header */}
      <section className="relative pt-6 md:pt-12 pb-6 overflow-hidden">
        <Blob color="rgba(62,207,142,0.2)" size={500} top={-150} right={-80}/>
        <Blob color="rgba(201,168,106,0.1)" size={300} top={200} left={-100}/>
        <div className="container-x relative">
          <button onClick={() => navigate("/dashboard")}
            className="text-sm text-ink-soft inline-flex items-center gap-1.5 mb-4"
            style={{minHeight:40}}>
            <Icon name="arrowLeft" className="w-4 h-4"/> Dashboard
          </button>
          <div className="arabic-classic text-gold-300 text-2xl mb-2" style={{direction:"rtl"}}>
            مَوَادُّ الدِّرَاسَاتِ الْعُلْيَا
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink mb-2">
            Maddah S2
          </h1>
          <p className="text-sm text-ink-muted max-w-lg leading-relaxed">
            {jalur} · Prompt setara level riset akademik.
          </p>
        </div>
      </section>

      {/* Pilih Maddah */}
      <section className="pb-6">
        <div className="container-x">
          <div className="text-xs uppercase tracking-wider text-gold-400 mb-3">
            Pilih Maddah
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 pb-1">
            {maddahList.map(m => (
              <button key={m.id}
                onClick={() => setSelectedMaddah(m)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm border font-medium transition-colors text-left ${
                  selectedMaddah?.id === m.id
                    ? "text-emerald-200 border-emerald-600/35"
                    : "bg-white/4 text-ink-muted border-white/8 hover:bg-white/7"
                }`}
                style={selectedMaddah?.id === m.id ? {background:"rgba(62,207,142,0.20)",minHeight:44} : {minHeight:44}}>
                <div className="font-medium">{m.nama}</div>
                {m.kitab && (
                  <div className="text-[10px] text-ink-soft mt-0.5 truncate max-w-[140px]">
                    {m.kitab}
                  </div>
                )}
                {m.isPreset && (
                  <span className="text-[9px] text-gold-400">✦ Wajib</span>
                )}
              </button>
            ))}
            <button
              onClick={() => navigate("/onboarding")}
              className="flex-shrink-0 px-4 py-2.5 rounded-xl text-sm border border-dashed text-ink-soft hover:text-ink transition-colors"
              style={{minHeight:44,borderColor:"rgba(62,207,142,0.28)"}}>
              + Edit Maddah
            </button>
          </div>
          {selectedMaddah && (
            <div className="mt-2">
              {selectedMaddah.kitab && (
                <p className="text-xs text-ink-soft">
                  Kitab: <span className="text-ink">{selectedMaddah.kitab}</span>
                </p>
              )}
              {!selectedMaddah.kitab && (
                <p className="text-xs text-amber-400/80">
                  💡 Belum ada kitab — prompt tetap bekerja, tapi lebih baik kalau tambahkan kitab
                </p>
              )}
            </div>
          )}
          {maddahList.length === 0 && (
            <div className="card-glass p-4 text-center mt-2">
              <p className="text-sm text-ink-muted mb-3">Belum ada maddah yang diinput.</p>
              <button onClick={() => navigate("/onboarding")} className="btn-primary text-sm px-4 py-2">
                Tambahkan Maddah
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Tab: Prompt Maddah vs Risalah */}
      <section className="pb-4">
        <div className="container-x">
          <div className="flex gap-2 p-1 bg-white/4 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab("prompt")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === "prompt"
                  ? "text-emerald-200"
                  : "text-ink-muted hover:text-ink"
              }`}
              style={activeTab === "prompt" ? {background:"rgba(62,207,142,0.22)"} : {}}>
              Prompt Maddah
            </button>
            <button
              onClick={() => setActiveTab("risalah")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === "risalah"
                  ? "bg-gold-500/20 text-gold-200"
                  : "text-ink-muted hover:text-ink"
              }`}>
              <span className="arabic-display text-xs" style={{direction:"rtl"}}>رسالة</span>
              Risalah / Tesis
            </button>
          </div>
        </div>
      </section>

      {/* ── TAB: PROMPT MADDAH ── */}
      {activeTab === "prompt" && (
        <section className="pb-8">
          <div className="container-x">
            {/* Mode tabs */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 pb-3 mb-5">
              {PROMPT_MODES.map(mode => (
                <button key={mode.id}
                  onClick={() => setActiveMode(mode.id)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border font-medium transition-colors ${
                    activeMode === mode.id
                      ? "text-emerald-200 border-emerald-600/35"
                      : "bg-white/4 text-ink-muted border-white/8 hover:bg-white/7"
                  }`}
                  style={activeMode === mode.id ? {background:"rgba(62,207,142,0.20)",minHeight:44} : {minHeight:44}}>
                  <Icon name={mode.icon} className="w-4 h-4"/>
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Input topik */}
            <div className="mb-4">
              <label className="text-xs text-ink-soft mb-1.5 block">
                Topik spesifik yang ingin dibahas:
              </label>
              <input
                value={topikInput}
                onChange={e => setTopikInput(e.target.value)}
                placeholder="mis. hukum cryptocurrency · metode istinbat nawazil · i'jaz 'ilmi"
                className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-3 text-sm text-ink outline-none transition-colors"
                style={{fontSize:16}}
                onFocus={e => e.target.style.borderColor="rgba(62,207,142,0.45)"}
                onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.10)"}
              />
              {topikInput.trim().length > 0 && topikInput.trim().split(" ").length < 2 && (
                <p className="text-xs text-amber-400 mt-1">
                  💡 Coba lebih spesifik — mis. "hukum asuransi jiwa syariah kontemporer"
                </p>
              )}
            </div>

            {/* Preview + Actions */}
            <div className="card-glass p-5">
              <div className="p-3 rounded-xl mb-4" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)"}}>
                <div className="text-xs text-ink-soft mb-1">Preview prompt:</div>
                <p className="text-xs text-ink-muted leading-relaxed font-mono line-clamp-4 whitespace-pre-wrap">
                  {promptPreview}{promptPreview.length >= 300 ? "..." : ""}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={handleCopy}
                  className="btn-ghost text-xs px-4 py-2.5 flex items-center gap-1.5"
                  style={{minHeight:40}}>
                  <Icon name="copy" className="w-3.5 h-3.5"/>
                  {copied ? "Tersalin ✓" : "Salin Prompt"}
                </button>
                <button onClick={() => handleCopyAndOpen("claude")}
                  className="btn-primary text-xs px-4 py-2.5 flex items-center gap-1.5"
                  style={{minHeight:40}}>
                  Salin & Buka Claude
                  <Icon name="external" className="w-3 h-3"/>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── TAB: RISALAH ── */}
      {activeTab === "risalah" && (
        <section className="pb-8">
          <div className="container-x">
            <div className="text-xs uppercase tracking-wider text-gold-400 mb-3">
              ✦ Prompt Risalah / Tesis
            </div>

            {/* Judul risalah */}
            <div className="mb-4">
              <label className="text-xs text-ink-soft mb-1.5 block">
                Judul risalahmu (sementara atau final):
              </label>
              <input
                value={judulRisalah}
                onChange={e => setJudulRisalah(e.target.value)}
                placeholder="mis. Fiqh Nawazil dalam Transaksi Digital Kontemporer"
                className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-3 text-sm text-ink outline-none transition-colors"
                style={{fontSize:16}}
                onFocus={e => e.target.style.borderColor="rgba(62,207,142,0.45)"}
                onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.10)"}
              />
            </div>

            {/* Risalah mode tabs */}
            <div className="grid grid-cols-2 gap-2 mb-5">
              {RISALAH_MODES.map(mode => (
                <button key={mode.id}
                  onClick={() => setRisalahMode(mode.id)}
                  className={`flex items-center gap-2 p-3 rounded-xl text-sm border font-medium transition-colors text-left ${
                    risalahMode === mode.id
                      ? "bg-gold-500/15 text-gold-200 border-gold-500/30"
                      : "bg-white/4 text-ink-muted border-white/8 hover:bg-white/7"
                  }`}>
                  <Icon name={mode.icon} className="w-4 h-4"/>
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Input tambahan: abstrak */}
            {risalahMode === "abstrak" && (
              <div className="mb-4">
                <label className="text-xs text-ink-soft mb-1.5 block">
                  Poin-poin utama risalahmu (untuk abstrak):
                </label>
                <textarea
                  value={poinRisalah}
                  onChange={e => setPoinRisalah(e.target.value)}
                  placeholder={"1. Temuan pertama\n2. Temuan kedua\n3. Kesimpulan utama"}
                  className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-3 text-sm text-ink outline-none transition-colors resize-none"
                  style={{fontSize:16, minHeight:100}}
                  onFocus={e => e.target.style.borderColor="rgba(62,207,142,0.45)"}
                  onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.10)"}
                />
              </div>
            )}

            {/* Input tambahan: rumusan */}
            {risalahMode === "rumusan" && (
              <div className="mb-4">
                <label className="text-xs text-ink-soft mb-1.5 block">
                  Area yang ingin diteliti (lebih spesifik):
                </label>
                <input
                  value={topikInput}
                  onChange={e => setTopikInput(e.target.value)}
                  placeholder="mis. penerapan fiqh nawazil pada platform fintech syariah"
                  className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-3 text-sm text-ink outline-none transition-colors"
                  style={{fontSize:16}}
                  onFocus={e => e.target.style.borderColor="rgba(62,207,142,0.45)"}
                  onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.10)"}
                />
              </div>
            )}

            {/* Input tambahan: footnote */}
            {risalahMode === "footnote" && (
              <FootnoteFields
                values={footnoteFields}
                onChange={(key, val) => setFootnoteFields(prev => ({...prev, [key]: val}))}
              />
            )}

            {/* Preview + Actions */}
            <div className="card-glass p-5 border border-gold-500/15">
              <div className="p-3 rounded-xl mb-4" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)"}}>
                <div className="text-xs text-ink-soft mb-1">Preview prompt:</div>
                <p className="text-xs text-ink-muted leading-relaxed font-mono line-clamp-4 whitespace-pre-wrap">
                  {promptPreview}{promptPreview.length >= 300 ? "..." : ""}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={handleCopy}
                  className="btn-ghost text-xs px-4 py-2.5 flex items-center gap-1.5"
                  style={{minHeight:40}}>
                  <Icon name="copy" className="w-3.5 h-3.5"/>
                  {copied ? "Tersalin ✓" : "Salin Prompt"}
                </button>
                <button onClick={() => handleCopyAndOpen("claude")}
                  className="btn-primary text-xs px-4 py-2.5 flex items-center gap-1.5"
                  style={{minHeight:40}}>
                  Salin & Buka Claude
                  <Icon name="external" className="w-3 h-3"/>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

window.S2MaddahPage = S2MaddahPage;
window.S2_PROMPT_TEMPLATES = S2_PROMPT_TEMPLATES;
window.RISALAH_TEMPLATES = RISALAH_TEMPLATES;
