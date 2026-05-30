/* Talqeeh — Prompt Library
   /prompt-library
   Ma'had tab auto-aktif untuk user Ma'had.
   Masisir bisa akses, default ke tab Masisir.
*/

/* ============ DATA MA'HAD ============ */

const MAHAD_PROMPT_SUBCATS = [
  { id: "all",      label: "Semua",                 emoji: "📚" },
  { id: "umum_arab", label: "Maddah Umum dalam Arab", emoji: "🔢" },
  { id: "insya",     label: "Insya' & Bahasa Arab",   emoji: "✍️" },
  { id: "hafalan",   label: "Hafalan & Qur'an",        emoji: "📖" },
  { id: "ujian",     label: "Persiapan Ujian",         emoji: "📋" },
];

const MAHAD_PROMPTS = [

  /* ── SUB-CAT 1: MADDAH UMUM DALAM ARAB ── */
  {
    id: "u1",
    subcat: "umum_arab",
    title: "Pahami Soal Matematika Berbahasa Arab",
    situation: "Dapat soal matematika dalam Arab tapi tidak paham maksudnya",
    template: `Saya pelajar Ma'had Al-Azhar tingkat \
[I'dadi/Tsanawi] Tahun [1/2/3].
Saya dapat soal matematika dalam bahasa Arab
tapi tidak paham maksudnya:

[paste soal di sini]

Tolong bantu saya:
1. Terjemahkan soalnya ke bahasa Indonesia
2. Jelaskan apa yang diminta soal ini
3. Tunjukkan cara menyelesaikannya step by step
4. Sebutkan rumus atau konsep yang dipakai`,
  },
  {
    id: "u2",
    subcat: "umum_arab",
    title: "Kamus Istilah Matematika Arab-Indonesia",
    situation: "Tidak tahu istilah matematika dalam bahasa Arab",
    template: `Saya pelajar Ma'had Al-Azhar. Tolong buatkan
tabel istilah matematika untuk bab [nama bab]
dengan format:

Istilah Arab | Cara Baca | Arti Indonesia | Contoh

Bab yang saya minta: [isi nama bab]`,
  },
  {
    id: "u3",
    subcat: "umum_arab",
    title: "Latihan Soal Matematika Level Ma'had",
    situation: "Mau latihan soal sebelum ujian",
    template: `Saya pelajar Ma'had Al-Azhar
[I'dadi/Tsanawi Ilmi/Tsanawi Adabi] Tahun [X].
Tolong buat 10 soal latihan matematika tentang
[nama topik] dengan level kesulitan ujian Ma'had.

Format:
- Tulis soal dalam bahasa Arab (seperti ujian asli)
- Sertakan terjemahan Indonesia di bawah tiap soal
- Kunci jawaban di bagian paling bawah`,
  },
  {
    id: "u4",
    subcat: "umum_arab",
    title: "Pahami Konsep Sains dalam Bahasa Arab",
    situation: "Ada konsep fisika/kimia/biologi yang tidak dimengerti",
    template: `Saya pelajar Tsanawi Ilmi Ma'had Al-Azhar.
Saya tidak paham konsep berikut dari pelajaran
[Fisika/Kimia/Biologi]:

Istilah Arabnya: [tulis istilah Arab]
atau Konsepnya : [tulis konsep yang tidak dipahami]

Tolong jelaskan:
1. Apa artinya dalam bahasa Indonesia?
2. Jelaskan konsepnya dengan bahasa yang mudah
3. Berikan contoh dari kehidupan sehari-hari
4. Apa istilah Arabnya yang lain (kalau ada)?`,
  },
  {
    id: "u5",
    subcat: "umum_arab",
    title: "Kamus Istilah Sains Arab-Indonesia",
    situation: "Mau hafal istilah sains sebelum ujian",
    template: `Tolong buatkan tabel istilah
[Fisika/Kimia/Biologi] dalam bahasa Arab
untuk bab [nama bab].

Format tabel:
Istilah Arab | Cara Baca | Arti Indonesia |
Keterangan Singkat

Buat minimal 15 istilah yang paling penting
dan sering muncul di soal ujian.`,
  },
  {
    id: "u6",
    subcat: "umum_arab",
    title: "Pahami Peta & Konsep Geografi (Arab)",
    situation: "Ada materi geografi yang sulit dipahami",
    template: `Saya pelajar Tsanawi Adabi Ma'had Al-Azhar.
Saya tidak paham materi geografi berikut:

[tulis topik atau teks dari buku]

Tolong:
1. Jelaskan dengan bahasa Indonesia yang mudah
2. Berikan istilah Arabnya untuk kata-kata kunci
3. Kalau ada data atau angka penting, ringkaskan
   dalam tabel`,
  },

  /* ── SUB-CAT 2: INSYA' & BAHASA ARAB ── */
  {
    id: "b1",
    subcat: "insya",
    title: "Koreksi Insya' (Karangan Arab)",
    situation: "Sudah nulis tapi tidak yakin benar",
    template: `Saya pelajar Ma'had Al-Azhar. Ini karangan
bahasa Arab yang saya tulis untuk tugas/ujian.

Tolong koreksi:
1. Kesalahan nahwu dan sharaf
2. Pilihan kata yang kurang tepat
3. Alur kalimat yang membingungkan
4. Berikan versi yang sudah diperbaiki

Tema karangan: [tulis tema]
Karangan saya:
[paste teks Arab di sini]`,
  },
  {
    id: "b2",
    subcat: "insya",
    title: "Bantu Kerangka Insya'",
    situation: "Dapat tugas insya' tapi bingung mulai dari mana",
    template: `Saya pelajar Ma'had Al-Azhar dapat tugas insya'
dengan tema: [tulis tema]
Panjang yang diminta: [X] kata/baris

Bantu saya:
1. Kerangka paragraf (muqaddimah, isi, khatimah)
2. Kalimat pembuka yang bagus dalam bahasa Arab
3. Minimal 10 kosakata Arab penting untuk
   tema ini beserta artinya
4. Kalimat penutup yang berkesan`,
  },
  {
    id: "b3",
    subcat: "insya",
    title: "Latihan Fahm Maqru' (Teks Ujian)",
    situation: "Mau latihan memahami teks bacaan ujian",
    template: `Saya pelajar Ma'had Al-Azhar. Berikan saya
1 teks bacaan bahasa Arab level ujian
[I'dadi/Tsanawi] dengan panjang sekitar
150-200 kata.

Setelah teks, buat 5 pertanyaan fahm maqru'
seperti format ujian asli Ma'had.

Saya akan coba jawab dulu, baru minta koreksi.`,
  },

  /* ── SUB-CAT 3: HAFALAN & QUR'AN ── */
  {
    id: "h1",
    subcat: "hafalan",
    title: "Pahami Makna Sebelum Hafal",
    situation: "Mau hafal tapi ingin mengerti maknanya dulu",
    template: `Sebelum saya menghafal [Surah X / ayat X-Y],
bantu saya pahami dulu:

1. Tema utama bagian ini (dalam bahasa Indonesia)
2. Makna kata-kata yang sulit
3. Hubungan antar ayat (supaya lebih mudah diingat)
4. 1-2 pelajaran utama dari bagian ini

Bagian yang mau saya hafal:
[tulis nama surah/ayat]`,
  },
  {
    id: "h2",
    subcat: "hafalan",
    title: "Latihan Cek Hafalan (Active Recall)",
    situation: "Baru murajaah dan mau tes diri sendiri",
    template: `Saya baru murajaah [Surah X].
Buat 7 pertanyaan untuk menguji hafalan saya —
dari yang mudah ke yang sulit.

Jenis pertanyaan bisa:
- Isi/melanjutkan ayat
- Tema ayat tertentu
- Urutan kejadian/kisah
- Makna kata kunci

Jangan tampilkan jawabannya dulu.
Tunggu sampai saya menjawab semua.`,
  },
  {
    id: "h3",
    subcat: "hafalan",
    title: "Bantu Tajwid Ayat Ini",
    situation: "Tidak yakin cara baca yang benar",
    template: `Tolong bantu saya periksa tajwid dari ayat ini:
[paste ayat atau tulis ayatnya]

Untuk setiap bagian yang ada hukum tajwidnya:
1. Sebutkan nama hukum tajwidnya
2. Jelaskan cara membacanya
3. Tandai bagian mana yang sering salah dibaca`,
  },

  /* ── SUB-CAT 4: PERSIAPAN UJIAN MA'HAD ── */
  {
    id: "ujian1",
    subcat: "ujian",
    title: "Buat Soal Latihan Ujian Ma'had",
    situation: "Ujian tinggal beberapa hari",
    template: `Saya pelajar [I'dadi/Tsanawi] Ma'had Al-Azhar
mau ujian [nama maddah] dalam [X] hari.

Materi yang diujikan: [daftar topik]

Buat soal latihan dengan komposisi:
- 5 soal mudah (definisi dan hafalan)
- 5 soal menengah (pemahaman)
- 5 soal sulit (analisis atau aplikasi)

Tulis soal sesuai format ujian Ma'had
(dalam bahasa Arab kalau maddah umum).
Kunci jawaban di bagian terpisah.`,
  },
  {
    id: "ujian2",
    subcat: "ujian",
    title: "Ringkasan Padat Sebelum Ujian",
    situation: "Waktu mepet, butuh ringkasan cepat",
    template: `Ujian [nama maddah] saya [besok/X hari lagi].
Buatkan ringkasan padat untuk bab: [nama bab]

Format:
- Poin-poin terpenting saja
- Definisi istilah kunci (Arab + Indonesia)
- Rumus atau kaidah yang wajib dihapal
- Maksimal 1 halaman

Bahasa: Indonesia dengan istilah Arabnya`,
  },
  {
    id: "ujian3",
    subcat: "ujian",
    title: "Cek Kelemahan Sebelum Ujian",
    situation: "Mau tahu bagian mana yang masih lemah",
    template: `Saya akan ujian [maddah] dengan materi:
[daftar materi/bab]

Buat 10 soal diagnostik yang mencakup
semua materi secara merata.

Setelah saya jawab semua, tolong analisis:
1. Bab mana yang paling lemah
2. Bab mana yang sudah kuat
3. Apa yang harus saya fokuskan
   di sisa waktu sebelum ujian`,
  },
];

/* ============ SHARED COMPONENT ============ */

const MahadChip = () => (
  <span
    className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
    style={{ background: "rgba(16,185,129,0.15)", color: "#10B981", border: "1px solid rgba(16,185,129,0.30)" }}
  >
    MA'HAD
  </span>
);

/* ============ PROMPT CARD ============ */

const PromptCard = ({ item }) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(item.template);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const subcat = MAHAD_PROMPT_SUBCATS.find(s => s.id === item.subcat);

  return (
    <div
      className="flex flex-col relative overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        padding: "18px",
      }}
    >
      {/* Badge */}
      <div className="mb-2">
        <MahadChip />
      </div>

      {/* Sub-category label */}
      {subcat && subcat.id !== "all" && (
        <p className="text-[11px] mb-1.5 uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>
          {subcat.emoji} {subcat.label}
        </p>
      )}

      {/* Title */}
      <h3 className="font-display text-[15px] font-bold text-ink mb-2 leading-snug">{item.title}</h3>

      {/* Situation */}
      <p className="text-[12px] mb-3" style={{ color: "rgba(255,255,255,0.45)" }}>📌 {item.situation}</p>

      {/* Template preview / expanded */}
      <div
        className="mb-3 overflow-hidden"
        style={{
          background: "rgba(0,0,0,0.3)",
          borderRadius: "10px",
          padding: "12px",
          maxHeight: expanded ? "600px" : "60px",
          transition: "max-height 0.3s ease",
          WebkitMaskImage: expanded ? "none" : "linear-gradient(black 30%, transparent)",
          maskImage: expanded ? "none" : "linear-gradient(black 30%, transparent)",
        }}
      >
        <pre className="font-mono text-[12px] leading-relaxed whitespace-pre-wrap m-0" style={{ color: "rgba(255,255,255,0.7)" }}>
          {item.template}
        </pre>
      </div>

      {/* Actions row */}
      <div className="flex gap-2">
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex-1 py-2.5 rounded-lg text-[12px] transition-colors"
          style={{
            border: "1px solid rgba(255,255,255,0.1)",
            background: "transparent",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          {expanded ? "Sembunyikan ▲" : "Lihat Prompt ▼"}
        </button>
        <button
          onClick={handleCopy}
          className="flex-1 py-2.5 rounded-lg text-[12px] font-semibold transition-all"
          style={{
            background: copied ? "rgba(16,185,129,0.35)" : "rgba(16,185,129,0.2)",
            color: "#10B981",
            border: "none",
          }}
        >
          {copied ? "✓ Tersalin!" : "📋 Salin"}
        </button>
      </div>
    </div>
  );
};

/* ============ MA'HAD TAB ============ */

const MahadTab = ({ profile }) => {
  const [activeSub, setActiveSub] = useState("all");

  const filtered = activeSub === "all"
    ? MAHAD_PROMPTS
    : MAHAD_PROMPTS.filter(p => p.subcat === activeSub);

  const total = MAHAD_PROMPTS.length;

  return (
    <div>
      {/* Intro banner */}
      <Reveal>
        <div
          className="rounded-2xl p-5 mb-8 flex flex-col md:flex-row md:items-center gap-4"
          style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.18)" }}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "#10B981" }}>Prompt Khusus Ma'had</span>
            </div>
            <p className="text-sm text-ink-muted leading-relaxed">
              {total} template prompt siap pakai untuk pelajar Ma'had Al-Azhar. Salin, paste ke AI pilihanmu, lalu isi bagian dalam kurung kotak <code className="text-[11px] px-1 py-0.5 rounded" style={{background:"rgba(255,255,255,0.08)"}}>[...]</code>
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="font-display text-3xl font-bold" style={{ color: "#10B981" }}>{total}</div>
            <div className="text-[10px] text-ink-muted uppercase tracking-wide">Template</div>
          </div>
        </div>
      </Reveal>

      {/* Sub-category filter */}
      <Reveal className="mb-6">
        <div className="flex gap-2 flex-wrap">
          {MAHAD_PROMPT_SUBCATS.map(s => {
            const isActive = s.id === activeSub;
            const count = s.id === "all" ? MAHAD_PROMPTS.length : MAHAD_PROMPTS.filter(p => p.subcat === s.id).length;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSub(s.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all"
                style={isActive
                  ? { background: "rgba(16,185,129,0.18)", color: "#10B981", border: "1px solid rgba(16,185,129,0.35)" }
                  : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }
                }
              >
                <span>{s.emoji}</span>
                <span>{s.label}</span>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full"
                  style={isActive
                    ? { background: "rgba(16,185,129,0.25)", color: "#10B981" }
                    : { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }
                  }
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </Reveal>

      {/* Sub-category label if filtered */}
      {activeSub !== "all" && (
        <Reveal className="mb-5">
          <h2 className="font-display text-xl font-semibold text-ink flex items-center gap-2">
            {MAHAD_PROMPT_SUBCATS.find(s => s.id === activeSub)?.emoji}
            {MAHAD_PROMPT_SUBCATS.find(s => s.id === activeSub)?.label}
            <span className="text-base text-ink-muted font-normal">({filtered.length} prompt)</span>
          </h2>
        </Reveal>
      )}

      {/* Grid */}
      <Reveal stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(item => (
          <PromptCard key={item.id} item={item} />
        ))}
      </Reveal>
    </div>
  );
};

/* ============ MASISIR TAB ============ */

const MasisirTab = ({ profile }) => {
  const shortcuts = [
    {
      icon: "target",
      color: "#3ecf8e",
      title: "Siap Imtihan",
      desc: "Prompt untuk kompres materi, drill soal Azhari, mock syafawi, dan analogi konsep sulit.",
      to: "/siap-imtihan",
      label: "Buka Siap Imtihan",
    },
    {
      icon: "layers",
      color: "#C9A86A",
      title: "Prompt per Maddah",
      desc: "66+ prompt template diorganisir per maddah — Fiqh, Nahwu, Tafsir, Hadits, dan lainnya.",
      to: "/maddah",
      label: "Buka Maddah Hub",
    },
    {
      icon: "sparkles",
      color: "#3ecf8e",
      title: "Adaptive Tool Guide",
      desc: "Guide cara pakai setiap AI (ChatGPT, Claude, Perplexity, dll) disesuaikan gaya belajarmu.",
      to: "/tools",
      label: "Buka Tool Guide",
    },
    {
      icon: "bookOpen",
      color: "#C9A86A",
      title: "Kurasah AI",
      desc: "Buat catatan pintar langsung dari sesi AI. Simpan, edit, dan susun ulang dengan mudah.",
      to: "/kurasah",
      label: "Buka Kurasah",
    },
  ];

  return (
    <div>
      <Reveal className="mb-8">
        <div className="rounded-2xl p-5" style={{ background: "rgba(62,207,142,0.08)", border: "1px solid rgba(62,207,142,0.18)" }}>
          <p className="text-sm text-ink-muted leading-relaxed">
            Prompt-prompt untuk Masisir sudah terintegrasi langsung di setiap fitur Talqeeh di bawah ini.
            Pilih fitur yang kamu butuhkan — prompt akan muncul sesuai konteks.
          </p>
        </div>
      </Reveal>

      <Reveal stagger className="grid sm:grid-cols-2 gap-4">
        {shortcuts.map(s => (
          <button
            key={s.to}
            onClick={() => navigate(s.to)}
            className="card-glass p-5 text-left hov-lift relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-20 h-20 pointer-events-none opacity-20" style={{ background: `radial-gradient(circle at top right, ${s.color}, transparent 70%)` }}/>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${s.color}20`, border: `1px solid ${s.color}30` }}>
                <Icon name={s.icon} className="w-5 h-5" style={{ color: s.color }}/>
              </div>
              <div className="font-display text-lg font-semibold text-ink mb-1">{s.title}</div>
              <p className="text-sm text-ink-muted leading-relaxed mb-4">{s.desc}</p>
              <div className="flex items-center gap-1.5 text-sm font-medium" style={{ color: s.color }}>
                {s.label} <Icon name="arrowRight" className="w-3.5 h-3.5"/>
              </div>
            </div>
          </button>
        ))}
      </Reveal>
    </div>
  );
};

/* ============ MAIN PAGE ============ */

const PromptLibraryPage = () => {
  const { session, profile } = useAuth();
  const isMahad = (typeof isMahadLevel !== "undefined") && isMahadLevel(profile?.level);
  const [activeTab, setActiveTab] = useState(isMahad ? "mahad" : "masisir");

  useEffect(() => {
    if (!session) navigate("/");
    else if (!profile?.onboarded) navigate("/onboarding");
    else if (typeof markPresenceToday !== "undefined") markPresenceToday();
  }, [session, profile]);

  useEffect(() => {
    setActiveTab(isMahad ? "mahad" : "masisir");
  }, [isMahad]);

  if (!session || !profile?.onboarded) return null;

  const tabs = [
    { id: "masisir", label: "Masisir", icon: "🎓" },
    { id: "mahad",   label: "Ma'had",  icon: "🏫", badge: true },
  ];

  return (
    <div className="page-enter">
      {/* Header */}
      <section className="relative pt-10 pb-6 overflow-hidden">
        <Blob color="rgba(16,185,129,0.12)" size={420} top={-180} right={-80}/>
        <Blob color="rgba(62,207,142,0.10)" size={300} top={-80} left={-100}/>
        <div className="container-x relative">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] uppercase tracking-[0.2em] text-ink-muted">Talqeeh</span>
            <span className="w-4 h-px bg-line"/>
            <span className="text-[10px] uppercase tracking-[0.2em] text-ink-muted">Prompt Library</span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-semibold text-ink mb-3 leading-tight">
            Template Prompt<br/>
            <span className="gradient-text">siap pakai.</span>
          </h1>
          <p className="text-ink-muted text-base md:text-lg max-w-xl leading-relaxed">
            Salin, tempel ke AI pilihanmu, isi konteksmu — langsung jalan.
          </p>
        </div>
      </section>

      {/* Tab bar */}
      <section className="pb-2 sticky top-[48px] md:top-[72px] z-30" style={{ background: "rgba(12,12,12,0.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="container-x">
          <div className="flex items-center gap-1 py-2">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all relative"
                  style={isActive
                    ? { background: tab.id === "mahad" ? "rgba(16,185,129,0.15)" : "rgba(62,207,142,0.15)", color: tab.id === "mahad" ? "#10B981" : "#3ecf8e", border: `1px solid ${tab.id === "mahad" ? "rgba(16,185,129,0.3)" : "rgba(62,207,142,0.3)"}` }
                    : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.08)" }
                  }
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.2)", color: "#10B981" }}>
                      Baru
                    </span>
                  )}
                </button>
              );
            })}

            {/* Prompt count */}
            <div className="ml-auto text-xs text-ink-muted">
              {activeTab === "mahad"
                ? <span><span className="text-ink font-medium">{MAHAD_PROMPTS.length}</span> prompt tersedia</span>
                : <span>Akses cepat ke semua fitur</span>
              }
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20">
        <div className="container-x pt-8">
          {activeTab === "masisir" && <MasisirTab profile={profile}/>}
          {activeTab === "mahad"   && <MahadTab profile={profile}/>}
        </div>
      </section>
    </div>
  );
};

window.PromptLibraryPage = PromptLibraryPage;
