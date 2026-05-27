/* Madad, All product data
   - Personalization metadata
   - AI tools with adaptive guide variants
   - Learning paths
   - Demo member codes
*/

/* ============ STRUGGLES ============ */
const STRUGGLES = [
  { id: "arab",      label: "Materi Arab",     desc: "Memahami kitab klasik & teks Arab akademik", icon: "book" },
  { id: "makalah",   label: "Makalah",          desc: "Menulis tugas & makalah Azhari yang rapi",  icon: "pen" },
  { id: "referensi", label: "Referensi",        desc: "Mencari rujukan & sumber yang tertelusur",  icon: "search" },
  { id: "hafalan",   label: "Hafalan",          desc: "Murajaah Qur'an & matan yang tahan lama",    icon: "bookOpen" },
  { id: "fokus",     label: "Fokus",            desc: "Produktivitas & disiplin waktu belajar",    icon: "target" },
];

/* ============ STUDY FIELDS ============ */
const FIELDS = [
  { id: "syariah",     label: "Syariah",       arabic: "الشريعة",        kind: "azhari" },
  { id: "bahasa",      label: "Bahasa Arab",   arabic: "اللغة العربية",  kind: "azhari" },
  { id: "ushuluddin",  label: "Ushuluddin",    arabic: "أصول الدين",     kind: "azhari" },
  { id: "kedokteran",  label: "Kedokteran",    arabic: "الطب",           kind: "umum" },
  { id: "teknik",      label: "Teknik",        arabic: "الهندسة",        kind: "umum" },
  { id: "lainnya",     label: "Lainnya",       arabic: "أخرى",           kind: "umum" },
];

/* ============ LEARNING STYLES ============ */
const LEARNING_STYLES = [
  { id: "reading",      label: "Runtut & membaca",  desc: "Suka pendekatan teks bertahap, urut",           icon: "bookOpen", emoji: "📖" },
  { id: "summary",      label: "Ringkasan cepat",   desc: "Lebih nyaman lewat intisari & poin kunci",       icon: "list",     emoji: "🧠" },
  { id: "discussion",   label: "Diskusi",            desc: "Paham lewat tanya jawab & dialog",              icon: "messageSquare", emoji: "🗣️" },
  { id: "practice",     label: "Praktik",            desc: "Belajar paling kuat saat langsung mencoba",     icon: "target",   emoji: "✍️" },
  { id: "memorization", label: "Hafalan",            desc: "Daya hafal kuat, suka repetisi sistematis",     icon: "refresh",  emoji: "🔁" },
  { id: "visual",       label: "Visual",             desc: "Lebih cepat paham lewat peta & diagram",        icon: "layers",   emoji: "🎥" },
];

/* ============ AI TOOLS, with adaptive guides ============ */
/* Each tool has:
   - id, name, monogram, color, tier, link, description
   - generalUse: 1-2 sentences default
   - guides: keyed by learning style id → { when, steps[], starterPrompt }
*/
const AI_TOOLS = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    by: "OpenAI",
    monogram: "GPT",
    logo: "/assets/logo-chatgpt.png",
    color: "#10A37F",
    tier: "Gratis + Berbayar",
    link: "https://chat.openai.com",
    description: "Asisten percakapan paling familiar, kuat untuk brainstorm, drafting, dan diskusi belajar bertahap.",
    bestAt: ["Diskusi", "Brainstorming", "Drill cepat"],
    guides: {
      discussion: {
        when: "Saat kamu mau memahami konsep lewat tanya-jawab, bukan sekali baca penjelasan, tapi dialog bertahap.",
        steps: [
          "Buka ChatGPT, pilih model GPT-4o (atau yang tersedia di akunmu).",
          "Mulai dengan: 'Saya ingin paham [konsep]. Jangan langsung jelaskan, tanya saya dulu apa yang sudah saya tahu.'",
          "Jawab pertanyaan AI dengan jujur. Setiap jawabanmu jadi titik tolak penjelasan berikutnya.",
          "Setelah cukup, minta ringkasan 5 poin sebagai penutup sesi diskusi.",
        ],
        starterPrompt: "Berperanlah sebagai tutor Azhari yang sabar. Aku mau memahami konsep [TOPIK]. Jangan beri penjelasan langsung, tanyakan dulu pemahamanku, lalu bimbing dengan pertanyaan-pertanyaan bertahap sampai aku menemukan jawabannya sendiri. Mulai dengan satu pertanyaan pembuka.",
      },
      summary: {
        when: "Kamu butuh intisari cepat dari materi panjang sebelum baca detail.",
        steps: [
          "Tempel atau jelaskan materi yang mau diringkas.",
          "Minta 5 poin utama + 1 kalimat ringkasan akhir.",
          "Tanya lagi: 'Poin mana yang paling sering keluar di ujian?' supaya prioritas jelas.",
        ],
        starterPrompt: "Buatkan ringkasan dari materi berikut: [PASTE MATERI]. Format: 5 poin utama (1 baris per poin) + 1 kalimat penutup. Setelah itu beri tahu 1 poin yang paling fundamental dan kenapa.",
      },
      visual: {
        when: "Kamu lebih cepat paham lewat diagram, hierarki, dan peta konsep.",
        steps: [
          "Minta AI membuat outline berjenjang (bukan paragraf).",
          "Minta visualisasi sederhana dalam bentuk ASCII tree atau bullet hierarchy.",
          "Gambar ulang manual di buku catatanmu, itu yang mengikat memori.",
        ],
        starterPrompt: "Buatkan peta konsep [TOPIK] dalam format hierarki bertingkat (indentasi). Akar = tema utama, cabang = sub-tema, daun = istilah kunci. Maksimal 3 level kedalaman.",
      },
      practice: {
        when: "Belajarmu paling kuat saat langsung mengerjakan latihan dengan feedback.",
        steps: [
          "Minta AI generate 5-10 soal latihan tingkat bertahap.",
          "Kerjakan satu per satu, jangan lihat jawaban dulu.",
          "Setelah selesai, kirim jawabanmu, minta koreksi per nomor dengan kaidah yang dilanggar.",
        ],
        starterPrompt: "Beri aku 10 soal latihan tentang [TOPIK] tingkat bertahap dari mudah ke sulit. Tampilkan tanpa jawaban dulu. Aku akan jawab semua, lalu kamu koreksi per nomor.",
      },
      memorization: {
        when: "Materi yang sedang kamu hafal butuh drill aktif & spaced repetition.",
        steps: [
          "Minta AI bikin flashcard format Q→A dari materi.",
          "Mulai sesi tasmi': AI sebut potongan, kamu lanjutkan.",
          "Tutup sesi dengan daftar ayat/baris yang ragu, untuk murajaah hari berikutnya.",
        ],
        starterPrompt: "Aku menghafal [SURAT/MATAN]. Bikin sesi tasmi': sebut potongan ayat secara acak, aku lanjutkan. Jika aku ragu, beri 3 huruf pertama sebagai petunjuk halus. Di akhir, beri daftar ayat yang perlu murajaah ulang.",
      },
      reading: {
        when: "Kamu lebih nyaman dengan pendekatan teks runtut, paragraf yang mengalir, bukan poin pendek.",
        steps: [
          "Minta penjelasan dalam bentuk esai 3-4 paragraf, bukan bullet points.",
          "Tanya pertanyaan lanjutan setelah tiap paragraf untuk memperdalam.",
          "Tulis ulang dengan kata-katamu sendiri sebagai latihan tafahhum.",
        ],
        starterPrompt: "Jelaskan konsep [TOPIK] dalam bentuk esai naratif 3 paragraf, bukan poin. Paragraf 1: konteks dan definisi. Paragraf 2: penjelasan inti. Paragraf 3: aplikasi & contoh. Gunakan bahasa yang mengalir.",
      },
    },
  },
  {
    id: "claude",
    name: "Claude",
    by: "Anthropic",
    monogram: "Cl",
    logo: "/assets/logo-claude.png",
    color: "#D97757",
    tier: "Gratis + Berbayar",
    link: "https://claude.ai",
    description: "Paling unggul untuk analisis teks panjang, kitab klasik, dan penulisan akademik dengan nuansa halus.",
    bestAt: ["Analisis kitab", "Makalah", "Bahasa Arab klasik"],
    guides: {
      discussion: {
        when: "Diskusi mendalam soal konsep ushul, kalam, atau fiqh muqaran yang butuh nuansa.",
        steps: [
          "Buka claude.ai, gunakan model terbaru yang tersedia.",
          "Mulai dengan konteks: 'Saya mahasiswa [jurusan] Azhar...' supaya jawaban sesuai level.",
          "Tantang setiap kesimpulannya: 'Kenapa begitu?' / 'Bisa beri pandangan lawan?'",
          "Tutup dengan minta sintesis 5 kalimat.",
        ],
        starterPrompt: "Saya mahasiswa Azhar yang sedang belajar [TOPIK]. Aku ingin diskusi mendalam, bukan sekadar penjelasan. Mulai dengan menanyakan apa yang sudah aku tahu, lalu bimbing dengan dialog. Tantang asumsiku saat perlu.",
      },
      summary: {
        when: "Meringkas matan klasik atau syarah panjang menjadi peta yang bisa dipahami cepat.",
        steps: [
          "Tempel teks panjang (matan/syarah).",
          "Minta ringkasan struktural: definisi → poin utama → contoh → khilafiyyah (jika ada).",
          "Verifikasi terms teknis ke kitab asli, Claude paling jujur kalau tidak yakin.",
        ],
        starterPrompt: "Ringkas bab berikut dari kitab [NAMA]: [PASTE TEKS]. Format: (1) definisi inti, (2) 3 sub-tema utama, (3) per sub-tema: poin + contoh + dalil utama, (4) ringkasan akhir 1 paragraf. Tandai bila ada bagian yang kamu tidak yakin sumbernya.",
      },
      visual: {
        when: "Butuh peta konsep yang terstruktur dari materi kompleks.",
        steps: [
          "Minta pohon konsep dengan akar → cabang → daun.",
          "Minta hubungan antar cabang dijelaskan (mana prasyarat, mana konsekuensi).",
          "Tulis ulang di kertas atau aplikasi mind-map.",
        ],
        starterPrompt: "Buatkan pohon konsep kitab [NAMA KITAB]. Format: akar (tema utama), 5-7 cabang (bab inti), 3 sub-cabang per bab, 1 contoh per sub-cabang. Setelah selesai, jelaskan hubungan antar cabang utama dalam 1 paragraf.",
      },
      practice: {
        when: "Latihan i'rab, tashrif, atau tatbiq kaidah dengan koreksi teliti.",
        steps: [
          "Minta 5-10 latihan dengan tingkat bertahap.",
          "Kerjakan sendiri, kirim jawaban.",
          "Claude akan koreksi dengan menyebut kaidah & rujukan, paling teliti di antara semua AI.",
        ],
        starterPrompt: "Beri aku 5 kalimat Arab untuk diirab dengan tingkat kesulitan bertahap. Jangan kasih jawaban dulu. Setelah aku i'rab, koreksi dengan menyebut kaidah yang dilanggar dan rujukan ke matan nahwu standar.",
      },
      memorization: {
        when: "Membuat skema hafalan yang strategis, bukan brute force.",
        steps: [
          "Jelaskan materi yang ingin dihafal + target waktu.",
          "Minta jadwal spaced repetition (hari 1, 3, 7, 14, 21).",
          "Minta mnemonic untuk poin yang sulit dihafal.",
        ],
        starterPrompt: "Aku menghafal [MATAN/SURAT] dengan target [X HARI]. Buatkan jadwal murajaah berbasis spaced repetition (hari 1, 3, 7, 14, 21) dalam tabel. Tambahkan mnemonic untuk 3 bagian yang paling sering bikin ragu.",
      },
      reading: {
        when: "Memahami kitab klasik secara mendalam, paragraf demi paragraf.",
        steps: [
          "Tempel teks Arab + minta terjemahan harfiah dulu.",
          "Lalu minta parafrase akademik.",
          "Tanya lanjutan untuk setiap istilah teknis yang muncul.",
        ],
        starterPrompt: "Ini paragraf dari kitab [NAMA KITAB]: [PASTE]. Lakukan: (1) terjemahan harfiah, (2) parafrase akademik, (3) penjelasan tiap istilah teknis, (4) maksud inti penulis dalam 1 kalimat. Sebut jika ada khilaf ulama dalam pemahaman paragraf ini.",
      },
    },
  },
  {
    id: "gemini",
    name: "Gemini",
    by: "Google",
    monogram: "Gm",
    logo: "/assets/logo-gemini.png",
    color: "#4285F4",
    tier: "Gratis + Berbayar",
    link: "https://gemini.google.com",
    description: "Terhubung dengan Google Search, paling cocok untuk info terkini, foto matan, dan terjemahan cepat.",
    bestAt: ["Info terkini", "OCR foto", "Terjemah cepat"],
    guides: {
      discussion: {
        when: "Mau diskusi sambil cek fakta real-time dari internet.",
        steps: [
          "Buka gemini.google.com (login akun Google).",
          "Mulai diskusi & minta Gemini selalu sertakan sumber web saat relevan.",
          "Verifikasi link yang dia bagikan, terutama untuk klaim fiqh.",
        ],
        starterPrompt: "Mari diskusi tentang [TOPIK]. Untuk setiap klaim faktual, sertakan link sumbernya. Jika kamu tidak yakin atau sumbernya lemah, sebutkan secara jujur.",
      },
      summary: {
        when: "Meringkas artikel/berita kontemporer terkait Azhar atau dunia Islam.",
        steps: [
          "Tempel link artikel atau judul yang mau diringkas.",
          "Minta ringkasan 5 poin + tanggapan dari perspektif Islam.",
        ],
        starterPrompt: "Ringkas artikel berikut: [URL/JUDUL]. Format: 5 poin utama + 1 paragraf tanggapan dari perspektif keilmuan Islam.",
      },
      visual: {
        when: "Foto matan atau halaman kitab yang sulit terbaca, Gemini bisa OCR dengan baik.",
        steps: [
          "Foto halaman kitab dengan terang & fokus.",
          "Upload ke Gemini, minta transkrip Arab + terjemahan.",
          "Cek hasil transkripsi karena bisa salah pada huruf serupa.",
        ],
        starterPrompt: "Aku upload foto halaman kitab. Transkripsikan teks Arabnya dengan harakat, lalu terjemahkan ke Indonesia. Jika ada bagian yang tidak terbaca jelas di foto, tandai dengan [???].",
      },
      practice: {
        when: "Drill tashrif atau kosakata dengan sumber suplemen dari web.",
        steps: [
          "Minta latihan acak.",
          "Minta sumber online tambahan untuk latihan lebih lanjut.",
        ],
        starterPrompt: "Beri aku 10 latihan tashrif acak (level dasar). Setelah aku selesai, koreksi dan rekomendasikan 1 website atau channel YouTube untuk latihan lanjut.",
      },
      memorization: {
        when: "Cari murattil favorit atau tasmi' audio sebagai pendamping hafalan.",
        steps: [
          "Minta rekomendasi qari dari Mesir untuk surat tertentu.",
          "Minta link YouTube atau platform yang resmi.",
        ],
        starterPrompt: "Rekomendasikan 3 qari kontemporer dari Mesir untuk membantu hafalan [SURAT]. Untuk setiap qari, sebutkan kelebihan tajwidnya & beri 1 link YouTube ke bacaan surat tersebut.",
      },
      reading: {
        when: "Membaca jurnal kontemporer atau penelitian terbaru.",
        steps: [
          "Minta Gemini mencari paper terkini tentang topik.",
          "Minta ringkasan terstruktur dari setiap paper.",
        ],
        starterPrompt: "Cari 3 paper akademis terbaru (5 tahun terakhir) tentang [TOPIK]. Untuk masing-masing: judul, penulis, abstrak singkat, dan link sumber. Beri tahu jika tidak menemukan paper yang relevan.",
      },
    },
  },
  {
    id: "notebooklm",
    name: "NotebookLM",
    by: "Google",
    monogram: "NB",
    logo: "/assets/logo-notebooklm.png",
    color: "#7C4DFF",
    tier: "Gratis",
    link: "https://notebooklm.google.com",
    description: "Asisten yang \"belajar\" dari PDF kitab yang kamu upload, semua jawaban merujuk halaman aslimu.",
    bestAt: ["Upload PDF kitab", "Jawaban tertelusur", "Notebook per matkul"],
    guides: {
      discussion: {
        when: "Diskusi mendalam yang seluruh jawabannya merujuk ke kitabmu sendiri.",
        steps: [
          "Buat notebook baru, beri judul (mis. \"Ushul Fiqh, Al-Waraqat\").",
          "Upload 1-5 PDF kitab inti + syarahnya.",
          "Mulai chat, setiap jawaban akan otomatis cite halaman sumber.",
          "Klik citation untuk loncat ke halaman tersebut.",
        ],
        starterPrompt: "Saya mau diskusi konsep [TOPIK] berdasarkan kitab yang sudah saya upload. Jawab pertanyaanku dengan selalu merujuk ke halaman spesifik dari sumber, bukan dari pengetahuan umum.",
      },
      summary: {
        when: "Bikin ringkasan otomatis dari kitab panjang yang kamu upload.",
        steps: [
          "Upload PDF kitab.",
          "Pakai tombol \"Briefing doc\" atau \"Summary\" yang muncul otomatis.",
          "Atau minta: 'Ringkas bab [X] dalam 5 poin dengan halaman rujukan.'",
        ],
        starterPrompt: "Ringkas bab [NAMA BAB] dari kitab yang saya upload. Format: 5 poin utama + halaman rujukan untuk setiap poin + 1 paragraf intisari.",
      },
      visual: {
        when: "Bikin mind-map dari koleksi kitab untuk satu mata kuliah.",
        steps: [
          "Upload semua sumber 1 matkul ke 1 notebook.",
          "Minta peta konsep yang menghubungkan kitab-kitab tersebut.",
          "Gunakan fitur \"Mind map\" jika sudah tersedia di akunmu.",
        ],
        starterPrompt: "Berdasarkan semua kitab yang sudah saya upload, buatkan peta konsep yang menghubungkan tema-tema utamanya. Tunjukkan bagian mana yang dibahas di beberapa kitab dan bagian unik per kitab.",
      },
      practice: {
        when: "Latihan soal yang sumbernya khusus dari kitab kamu.",
        steps: [
          "Upload kitab + materi kuliah.",
          "Minta soal latihan dengan rujukan halaman.",
          "Kerjakan, lalu minta koreksi berbasis halaman tersebut.",
        ],
        starterPrompt: "Buat 10 soal latihan tentang [TOPIK] berbasis kitab yang aku upload. Setiap soal sertakan referensi halaman ke kitab. Tampilkan tanpa jawaban dulu.",
      },
      memorization: {
        when: "Murajaah matan dengan referensi syarah otomatis.",
        steps: [
          "Upload matan + syarah ke 1 notebook.",
          "Minta drill hafalan, AI akan jelaskan dari syarah jika kamu ragu.",
        ],
        starterPrompt: "Aku menghafal matan [NAMA] yang sudah saya upload. Bikin sesi drill: sebut potongan, aku lanjutkan. Jika aku ragu, jelaskan dari syarah yang juga saya upload.",
      },
      reading: {
        when: "Tafahhum bertahap, baca kitab dengan AI sebagai pendamping.",
        steps: [
          "Upload kitab, baca paragraf demi paragraf.",
          "Untuk setiap paragraf musykil, tanya AI dengan menyebut halaman.",
          "AI hanya menjawab dari kitabmu, tidak mengarang.",
        ],
        starterPrompt: "Saya sedang baca kitab yang saya upload, halaman [X]. Tolong jelaskan paragraf yang dimulai dengan kata '[KATA AWAL]', terjemahkan, parafrase, dan jelaskan istilah teknis. Selalu rujuk ke halaman ini.",
      },
    },
  },
  {
    id: "perplexity",
    name: "Perplexity",
    by: "Perplexity AI",
    monogram: "Px",
    logo: "/assets/logo-perplexity.png",
    color: "#1FB6B6",
    tier: "Gratis + Berbayar",
    link: "https://perplexity.ai",
    description: "Mesin pencari + AI dalam satu, setiap jawaban dilengkapi sumber yang bisa diklik.",
    bestAt: ["Riset akademik", "Sumber tertelusur", "Verifikasi fakta"],
    guides: {
      discussion: {
        when: "Diskusi yang setiap klaimnya butuh disokong sumber web.",
        steps: [
          "Buka perplexity.ai, pilih mode \"Academic\" untuk prioritas jurnal.",
          "Tanyakan pertanyaan diskusi.",
          "Klik setiap link sitasi untuk verifikasi.",
        ],
        starterPrompt: "Diskusikan [TOPIK]. Untuk setiap poin, sebutkan sumber akademisnya. Jika sumbernya hanya blog atau forum, tandai jelas sebagai sumber lemah.",
      },
      summary: {
        when: "Riset awal cepat, apa saja yang ditulis tentang topik ini.",
        steps: [
          "Cari topikmu.",
          "Minta ringkasan 5 sudut pandang utama.",
          "Simpan list sumber untuk dibaca lengkap nanti.",
        ],
        starterPrompt: "Apa saja sudut pandang utama tentang [TOPIK] menurut literatur akademis? Beri 5 sudut pandang dengan 1 sumber kuat per sudut.",
      },
      visual: {
        when: "Petakan landscape penelitian, siapa berdebat dengan siapa.",
        steps: [
          "Tanyakan posisi para tokoh utama.",
          "Minta tabel perbandingan posisi mereka.",
        ],
        starterPrompt: "Buatkan tabel perbandingan posisi 4-6 tokoh akademis utama tentang [TOPIK]. Kolom: Nama | Posisi | Argumen Inti | Sumber Utama.",
      },
      practice: {
        when: "Verifikasi referensi yang kamu temukan di tempat lain.",
        steps: [
          "Tempel kutipan/klaim yang ingin dicek.",
          "Tanyakan: 'Apakah ini akurat? Apa sumbernya?'",
        ],
        starterPrompt: "Verifikasi klaim berikut: '[PASTE KLAIM]'. Apakah akurat? Apa sumber asli yang valid? Jika tidak ditemukan, katakan dengan jelas.",
      },
      memorization: {
        when: "Kurang relevan untuk hafalan, gunakan ChatGPT atau Claude.",
        steps: [
          "Untuk hafalan, beralih ke ChatGPT atau NotebookLM.",
          "Perplexity lebih cocok mencari materi yang akan dihafal, bukan drill-nya.",
        ],
        starterPrompt: "Cari teks lengkap dari [MATAN/SURAT] dengan sumber yang valid (idealnya dari situs resmi).",
      },
      reading: {
        when: "Membangun bab landasan teori untuk makalah.",
        steps: [
          "Cari isu spesifik di topik makalahmu.",
          "Minta perpaduan 3-5 sumber jadi 1 paragraf landasan teori.",
          "Selalu cek ulang setiap sitasi.",
        ],
        starterPrompt: "Saya menulis makalah tentang [TOPIK]. Bantu susun paragraf landasan teori dengan menggabungkan minimal 3 sumber akademis. Tampilkan paragraf + daftar sumber di bawahnya.",
      },
    },
  },
  {
    id: "copilot",
    name: "Copilot",
    by: "Microsoft",
    monogram: "Co",
    color: "#0078D4",
    tier: "Gratis",
    link: "https://copilot.microsoft.com",
    description: "Asisten Microsoft yang menempel di Word, paling pas saat kamu menulis makalah panjang.",
    bestAt: ["Menulis di Word", "Baca PDF", "GPT-4 gratis"],
    guides: {
      discussion: {
        when: "Diskusi sambil menulis di Microsoft Word.",
        steps: [
          "Aktifkan Copilot di Word (klik ikon Copilot di ribbon).",
          "Highlight paragraf yang sedang ditulis, klik \"Refine\".",
          "Minta diskusi/tantang argumenmu.",
        ],
        starterPrompt: "Saya sedang menulis paragraf ini di makalah saya: [PASTE]. Tantang argumennya, apa kelemahan logikanya? Saran kalimat alternatif yang lebih kuat?",
      },
      summary: {
        when: "Ringkas PDF panjang langsung dari Word atau Edge.",
        steps: [
          "Buka PDF di Edge atau attach di Copilot.",
          "Klik \"Summarize\" atau minta ringkasan dengan format spesifik.",
        ],
        starterPrompt: "Ringkas PDF yang saya buka. Format: 5 poin utama + 3 kutipan langsung penting + 1 paragraf kesimpulan. Sertakan nomor halaman untuk setiap kutipan.",
      },
      visual: {
        when: "Bikin tabel atau diagram langsung di Word.",
        steps: [
          "Posisi cursor di tempat tabel/diagram mau dimasukkan.",
          "Minta Copilot generate tabel/diagram berdasarkan deskripsi.",
        ],
        starterPrompt: "Buatkan tabel perbandingan [TOPIK] dengan kolom [...]. Sisipkan langsung di Word di posisi cursor saat ini.",
      },
      practice: {
        when: "Latihan menulis terbimbing, tulis paragraf, dapat feedback real-time.",
        steps: [
          "Tulis paragraf utuh dulu.",
          "Highlight → Copilot → 'Rewrite' atau 'Critique'.",
          "Bandingkan versimu dengan saran AI, ambil yang masuk akal.",
        ],
        starterPrompt: "Critique paragraf saya berikut sebagai dosen pembimbing skripsi: [PASTE]. Tunjukkan kelemahan logika, masalah bahasa, dan 1 versi revisi.",
      },
      memorization: {
        when: "Kurang cocok untuk drill hafalan, gunakan ChatGPT.",
        steps: [
          "Beralih ke ChatGPT atau NotebookLM untuk hafalan.",
          "Copilot lebih kuat untuk menulis dan dokumen.",
        ],
        starterPrompt: "Untuk hafalan, gunakan ChatGPT atau NotebookLM.",
      },
      reading: {
        when: "Pendamping baca PDF makalah/buku akademik.",
        steps: [
          "Buka PDF di Edge browser.",
          "Aktifkan sidebar Copilot.",
          "Tanyakan paragraf demi paragraf saat baca.",
        ],
        starterPrompt: "Saya baca PDF ini di Edge. Bantu saya pahami paragraf yang dimulai dengan kalimat '[PASTE KATA AWAL]', jelaskan dalam bahasa lebih sederhana.",
      },
    },
  },
];

/* ============ RECOMMENDATION RULES ============ */
/* Returns array of { toolId, reason } based on profile */
const recommend = (profile) => {
  const struggles = profile.struggle || [];
  const styles = profile.learningStyle || [];
  const field = profile.field;

  const scores = {};
  const reasons = {};
  const addScore = (id, n, reason) => {
    scores[id] = (scores[id] || 0) + n;
    if (!reasons[id]) reasons[id] = [];
    reasons[id].push(reason);
  };

  // By struggle
  if (struggles.includes("arab")) {
    addScore("claude", 3, "kuat untuk analisis teks Arab klasik");
    addScore("notebooklm", 2, "bisa upload kitab langsung");
  }
  if (struggles.includes("makalah")) {
    addScore("claude", 3, "paling rapi struktur akademiknya");
    addScore("copilot", 2, "menempel di Microsoft Word saat menulis");
    addScore("perplexity", 1, "untuk landasan teori dengan sumber");
  }
  if (struggles.includes("referensi")) {
    addScore("perplexity", 3, "spesialis sumber tertelusur");
    addScore("notebooklm", 2, "rujuk ke kitab yang kamu upload");
  }
  if (struggles.includes("hafalan")) {
    addScore("chatgpt", 3, "mode suara untuk tasmi'");
    addScore("notebooklm", 1, "ringkasan dari syarah yang kamu upload");
  }
  if (struggles.includes("fokus")) {
    addScore("chatgpt", 2, "drill cepat dan terstruktur");
    addScore("claude", 1, "menyusun jadwal & sistem belajar");
  }

  // By learning style
  if (styles.includes("discussion")) {
    addScore("chatgpt", 2, "alur diskusi paling natural");
    addScore("claude", 2, "diskusi mendalam dengan nuansa");
  }
  if (styles.includes("summary")) {
    addScore("claude", 2, "ringkasan paling rapi & teliti");
    addScore("perplexity", 1, "ringkasan multi-sumber");
  }
  if (styles.includes("visual")) {
    addScore("notebooklm", 2, "punya fitur mind-map bawaan");
    addScore("gemini", 1, "bagus untuk OCR & diagram");
  }
  if (styles.includes("practice")) {
    addScore("chatgpt", 2, "drill cepat dengan banyak variasi");
    addScore("claude", 1, "koreksi paling teliti");
  }
  if (styles.includes("memorization")) {
    addScore("chatgpt", 2, "sesi tasmi' interaktif via mode suara");
    addScore("notebooklm", 1, "untuk integrasi dengan syarah");
  }
  if (styles.includes("reading")) {
    addScore("claude", 2, "esai naratif yang mengalir");
    addScore("notebooklm", 1, "baca kitab dengan AI di samping");
  }

  // By field
  if (["syariah", "bahasa", "ushuluddin"].includes(field)) {
    addScore("claude", 1, "fasih dengan bahasa Arab klasik");
    addScore("notebooklm", 1, "cocok untuk PDF kitab Azhari");
  }
  if (["kedokteran", "teknik"].includes(field)) {
    addScore("perplexity", 1, "untuk sumber jurnal sains");
    addScore("gemini", 1, "info terkini & riset terbaru");
  }

  // Sort by score, pick top 3
  const ranked = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => {
      const tool = AI_TOOLS.find(t => t.id === id);
      const reasonList = reasons[id].slice(0, 2);
      return {
        toolId: id,
        tool,
        score: scores[id],
        reason: reasonList.join(" · "),
        reasons: reasons[id],
      };
    });

  // Fallback if too few
  if (ranked.length < 3) {
    const filler = AI_TOOLS.filter(t => !ranked.find(r => r.toolId === t.id)).slice(0, 3 - ranked.length);
    filler.forEach(tool => ranked.push({ toolId: tool.id, tool, score: 0, reason: "pilihan serbaguna untuk Masisir", reasons: [] }));
  }
  return ranked;
};

/* ============ LEARNING PATHS ============ */
const LEARNING_PATHS = [
  {
    id: "beginner",
    level: "Beginner",
    label: "Baru mulai",
    icon: "🌱",
    color: "#6EE7B7",
    desc: "Mengenal AI, prompt dasar, dan etika penggunaan untuk pemula.",
    modules: [
      { id: "b1", title: "Apa itu AI & cara kerjanya",      duration: "8 menit", kind: "Materi" },
      { id: "b2", title: "Prompt pertamamu",                 duration: "10 menit", kind: "Praktik" },
      { id: "b3", title: "Etika dasar pakai AI",             duration: "6 menit", kind: "Materi" },
      { id: "b4", title: "Tools mana untuk apa?",            duration: "12 menit", kind: "Tour" },
      { id: "b5", title: "Workflow harian sederhana",         duration: "10 menit", kind: "Praktik" },
    ],
  },
  {
    id: "intermediate",
    level: "Intermediate",
    label: "Bertumbuh",
    icon: "⚡",
    color: "#A07BFA",
    desc: "Workflow untuk memahami kitab klasik, menulis makalah, dan murajaah sistematis.",
    modules: [
      { id: "i1", title: "Bedah matan klasik dengan AI",     duration: "15 menit", kind: "Workflow" },
      { id: "i2", title: "Outline makalah standar Azhari",   duration: "18 menit", kind: "Workflow" },
      { id: "i3", title: "Sistem murajaah spaced repetition", duration: "12 menit", kind: "Workflow" },
      { id: "i4", title: "Latihan i'rab interaktif",          duration: "20 menit", kind: "Praktik" },
      { id: "i5", title: "Perbandingan mazhab terstruktur",   duration: "15 menit", kind: "Workflow" },
    ],
  },
  {
    id: "advanced",
    level: "Advanced",
    label: "AI-ready",
    icon: "🚀",
    color: "#E5C18A",
    desc: "Riset akademik tingkat lanjut, multi-AI workflow, dan produktivitas kelas pakar.",
    modules: [
      { id: "a1", title: "Multi-AI workflow (Claude + Perplexity + NotebookLM)", duration: "25 menit", kind: "Workflow" },
      { id: "a2", title: "Gap analysis untuk topik makalah",  duration: "18 menit", kind: "Workflow" },
      { id: "a3", title: "Pipeline riset jurnal kontemporer", duration: "20 menit", kind: "Workflow" },
      { id: "a4", title: "Sistem produktivitas Masisir",      duration: "15 menit", kind: "Materi" },
      { id: "a5", title: "Audit kualitas output AI",          duration: "12 menit", kind: "Materi" },
    ],
  },
];

const allModules = () => LEARNING_PATHS.flatMap(p => p.modules.map(m => ({ ...m, pathId: p.id, level: p.level })));

/* ============ ETHICS ============ */
const ETHICS_POINTS = [
  { t: "Wasilah, bukan tujuan", d: "AI membantu memahami ilmu, bukan menggantikan tafahhum kamu sendiri." },
  { t: "Verifikasi sebelum percaya", d: "Cek nama kitab, halaman, dan matan ke sumber asli sebelum dipakai akademik." },
  { t: "Hormati guru", d: "AI tidak menggantikan masyaikh. Jadikan jawaban AI bahan diskusi dengan guru, bukan pesaingnya." },
  { t: "Kejujuran akademik", d: "Karya yang kamu submit harus tetap representasi pemikiranmu sendiri." },
  { t: "Niat ikhlas", d: "إنما الأعمال بالنيات, pakai AI dengan niat lebih dalam, bukan lebih malas." },
];

/* ============ DEMO MEMBERS ============ */
const DEFAULT_MEMBERS = [
  { code: "MSR-DEMO-1234", name: "Demo Member",       whatsapp: "+201xxxxxxxxx", duration: 30, status: "active",   createdAt: "2025-12-01", expiresAt: "2026-12-31", device: null },
  { code: "MSR-AHMD-X7K9", name: "Ahmad Fauzi",         whatsapp: "+201111111111", duration: 90, status: "active",   createdAt: "2025-11-15", expiresAt: "2026-02-15", device: "iPhone · Cairo" },
  { code: "MSR-FATM-Z3P2", name: "Fatimah Az-Zahra",    whatsapp: "+201222222222", duration: 30, status: "active",   createdAt: "2025-12-10", expiresAt: "2026-01-10", device: "Pixel · Nasr City" },
  { code: "MSR-UMAR-Q8L5", name: "Umar Khalid",         whatsapp: "+201333333333", duration: 60, status: "active",   createdAt: "2025-11-30", expiresAt: "2026-01-30", device: null },
  { code: "MSR-NUSY-B4R7", name: "Nusyaibah Rifqi",     whatsapp: "+201444444444", duration: 30, status: "expired",  createdAt: "2025-10-01", expiresAt: "2025-11-01", device: "iPhone · Hayy 10" },
  { code: "MSR-RIZK-T6M9", name: "Rizki Pratama",       whatsapp: "+201555555555", duration: 30, status: "disabled", createdAt: "2025-11-20", expiresAt: "2025-12-20", device: null },
];

/* ============ ADMIN AUTH (super simple) ============ */
const ADMIN_PIN = "9090";

/* ============ EXPORTS ============ */
Object.assign(window, {
  STRUGGLES, FIELDS, LEARNING_STYLES,
  AI_TOOLS, recommend,
  LEARNING_PATHS, allModules,
  ETHICS_POINTS,
  DEFAULT_MEMBERS, ADMIN_PIN,
});
