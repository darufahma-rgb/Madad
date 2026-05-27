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

/* ============ FACULTIES (Al-Azhar) ============ */
const FACULTIES = [
  {
    id: "ushuluddin",
    label: "Ushuluddin",
    arabic: "أصول الدين",
    desc: "Tafsir, Hadits, Aqidah & Filsafat",
    icon: "bookOpen",
    majorsStartLevel: 3,
    majors: [
      { id: "tafsir",  label: "Tafsir & 'Ulum Al-Qur'an", arabic: "التفسير وعلوم القرآن" },
      { id: "hadits",  label: "Hadits & 'Ulum Al-Hadits",  arabic: "الحديث وعلومه" },
      { id: "aqidah",  label: "Aqidah & Filsafat",         arabic: "العقيدة والفلسفة" },
    ],
  },
  {
    id: "syariah",
    label: "Syariah wal Qanun",
    arabic: "الشريعة والقانون",
    desc: "Fiqh, Ushul Fiqh, Hukum Islam",
    icon: "scale",
    majorsStartLevel: 1,
    majors: [
      { id: "islamiyah",  label: "Syariah Islamiyah (4 thn)",   arabic: "الشريعة الإسلامية" },
      { id: "wal_qanun",  label: "Syariah wal Qanun (5 thn)",   arabic: "الشريعة والقانون" },
    ],
  },
  {
    id: "lughah",
    label: "Lughah 'Arabiyah",
    arabic: "اللغة العربية",
    desc: "Nahwu, Sharaf, Balaghah, Adab",
    icon: "pen",
    majorsStartLevel: 1,
    majors: [
      { id: "adab",     label: "Lughah & Adab (Umum)",   arabic: "اللغة والأدب" },
      { id: "tarikh",   label: "Tarikh wal Hadharah",    arabic: "التاريخ والحضارة" },
      { id: "shahafah", label: "Shahafah wal I'lam",     arabic: "الصحافة والإعلام" },
    ],
  },
  {
    id: "dirasat",
    label: "Dirasat Islamiyah",
    arabic: "الدراسات الإسلامية",
    desc: "Gabungan Ushuluddin, Syariah & Lughah",
    icon: "layers",
    majorsStartLevel: null,
    majors: [],
  },
  {
    id: "quran",
    label: "Al-Qur'an Al-Karim",
    arabic: "القرآن الكريم",
    desc: "Tahfidz, Qira'at, Tafsir",
    icon: "book",
    majorsStartLevel: null,
    majors: [],
  },
  {
    id: "umum",
    label: "Fakultas Umum / Lainnya",
    arabic: "أخرى",
    desc: "Kedokteran, Teknik, Sains, dll",
    icon: "grid",
    majorsStartLevel: null,
    majors: [],
  },
];

/* ============ TINGKAT KULIAH ============ */
const LEVELS = [
  { id: "mustawa", label: "Mustawa / Daurah Lughah",         short: "Persiapan",      arabic: "مستوى" },
  { id: "1",       label: "Tingkat I",                        short: "Awwal",          arabic: "الأولى" },
  { id: "2",       label: "Tingkat II",                       short: "Tsani",          arabic: "الثانية" },
  { id: "3",       label: "Tingkat III",                      short: "Tsalits",        arabic: "الثالثة" },
  { id: "4",       label: "Tingkat IV",                       short: "Robi'",          arabic: "الرابعة" },
  { id: "5",       label: "Tingkat V (Syariah wal Qanun)",    short: "Khamis",         arabic: "الخامسة" },
  { id: "pasca",   label: "Pasca-sarjana (S2/S3)",            short: "Dirasat 'Ulya",  arabic: "دراسات عليا" },
];

/* ============ STUDY FIELDS (alias untuk backward compat) ============ */
const FIELDS = FACULTIES;

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
    logoBg: "#10A37F",
    logoPad: "p-0",
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
        starterPrompt: "Berperanlah sebagai tutor Azhari yang sabar dan terbiasa dengan turuq tadris klasik. Aku thalib di Al-Azhar yang sedang mempelajari konsep [TOPIK]. Jangan beri penjelasan langsung — tanyakan dulu ma 'indi (apa yang sudah aku tahu), lalu bimbing dengan as'ilah taqririyyah (pertanyaan-pertanyaan bertahap) sampai aku menemukan jawabannya sendiri.\n\nSaat menyebut ayat, hadits, atau kaidah, selalu sertakan teks Arab asli (dengan harakat) sebelum terjemahan. Gunakan istilah Arab transliterasi seperti ta'rif, dalil, wajh istidlal — jangan diterjemahkan. Mulai dengan satu pertanyaan pembuka.",
      },
      summary: {
        when: "Kamu butuh intisari cepat dari materi panjang sebelum baca detail.",
        steps: [
          "Tempel atau jelaskan materi yang mau diringkas.",
          "Minta 5 poin utama + 1 kalimat ringkasan akhir.",
          "Tanya lagi: 'Poin mana yang paling sering keluar di ujian?' supaya prioritas jelas.",
        ],
        starterPrompt: "Aku thalib Azhari yang sedang mutala'ah materi berikut: [PASTE MATERI]\n\nBuatkan talkhish dengan format:\n1. Ta'rif (definisi inti) — sertakan istilah Arab asli + terjemah\n2. 5 poin utama (1 baris per poin) — pakai terminologi kitab klasik\n3. Satu kalimat penutup yang menangkap jawhar al-mas'alah\n4. Sebutkan 1 poin paling fundamental dan kenapa ia menjadi madar al-bab\n\nSaat ada istilah teknis, tulis Arab + transliterasi. Contoh: قياس (qiyas), إجماع (ijma').",
      },
      visual: {
        when: "Kamu lebih cepat paham lewat diagram, hierarki, dan peta konsep.",
        steps: [
          "Minta AI membuat outline berjenjang (bukan paragraf).",
          "Minta visualisasi sederhana dalam bentuk ASCII tree atau bullet hierarchy.",
          "Gambar ulang manual di buku catatanmu, itu yang mengikat memori.",
        ],
        starterPrompt: "Aku thalib Azhari. Buatkan kharitah dzihniyyah (peta konsep) untuk [TOPIK] dalam format hierarki bertingkat (indentasi).\n\nStruktur:\n- Akar (jadhr) = tema utama → tulis dengan nama Arab + transliterasi\n- Cabang (furu') = sub-tema utama\n- Daun (waraqat) = istilah kunci\n\nUntuk setiap istilah teknis, tulis: [Arab dengan harakat] (transliterasi) — terjemah singkat.\nMaksimal 3 level kedalaman. Pakai terminologi kitab klasik, bukan terjemahan modern.",
      },
      practice: {
        when: "Belajarmu paling kuat saat langsung mengerjakan latihan dengan feedback.",
        steps: [
          "Minta AI generate 5-10 soal latihan tingkat bertahap.",
          "Kerjakan satu per satu, jangan lihat jawaban dulu.",
          "Setelah selesai, kirim jawabanmu, minta koreksi per nomor dengan kaidah yang dilanggar.",
        ],
        starterPrompt: "Aku thalib Azhari, mau drill materi [TOPIK]. Beri 10 soal latihan dengan tingkat bertahap (mubtadi' → mutawassith → mutaqaddim).\n\nFormat tiap soal:\n- Pakai gaya tanya khas imtihan Azhari (\"'Arrif...\", \"Wadhdhih...\", \"Bayyin al-farq bayna...\", \"Ma hukm... ma'a al-dalil?\")\n- Untuk soal yang melibatkan ayat/hadits/matan, sertakan teks Arab asli\n- Boleh sisipkan satu soal i'rab atau syarh ibarah kalau topiknya nahwu/balaghah\n\nTampilkan tanpa jawaban dulu. Aku akan jawab semua, lalu kamu koreksi per nomor dengan menyebut kaidah yang dilanggar dan rujukan ke matan standar (Alfiyah, Al-Waraqat, dll).",
      },
      memorization: {
        when: "Materi yang sedang kamu hafal butuh drill aktif & spaced repetition.",
        steps: [
          "Minta AI bikin flashcard format Q→A dari materi.",
          "Mulai sesi tasmi': AI sebut potongan, kamu lanjutkan.",
          "Tutup sesi dengan daftar ayat/baris yang ragu, untuk murajaah hari berikutnya.",
        ],
        starterPrompt: "Aku thalib Azhari, sedang menghafal [SURAT/MATAN — sebutkan Arab + Latin]. Bikin sesi tasmi' untukku:\n\n- Sebut potongan ayat/bait secara acak — tulis dalam Arab dengan harakat\n- Aku akan lanjutkan\n- Jika aku ragu, beri 3 huruf pertama dari kalimat selanjutnya sebagai isyarah halus\n- Setelah 10 putaran, beri daftar mawadhi' (posisi/ayat) yang perlu muraja'ah ulang\n- Sertakan saran tahsin/tajwid kalau ada potongan yang biasanya keliru",
      },
      reading: {
        when: "Kamu lebih nyaman dengan pendekatan teks runtut, paragraf yang mengalir, bukan poin pendek.",
        steps: [
          "Minta penjelasan dalam bentuk esai 3-4 paragraf, bukan bullet points.",
          "Tanya pertanyaan lanjutan setelah tiap paragraf untuk memperdalam.",
          "Tulis ulang dengan kata-katamu sendiri sebagai latihan tafahhum.",
        ],
        starterPrompt: "Aku thalib Azhari yang lebih nyaman belajar dengan qira'ah naratif (bukan poin-poin). Jelaskan konsep [TOPIK] dalam 3 paragraf yang mengalir:\n\n- Paragraf 1: siyaq (konteks) dan ta'rif — sertakan teks Arab asli untuk definisi kunci\n- Paragraf 2: penjelasan inti dengan dalil — sertakan ayat/hadits/kaidah dalam Arab + terjemah\n- Paragraf 3: tatbiq (aplikasi) dan furu' (contoh kasus)\n\nGaya bahasa: Indonesia akademik dengan istilah Arab transliterasi. Pakai struktur seperti syarh kitab klasik — runtut dari 'amm ke khass.",
      },
    },
  },
  {
    id: "claude",
    name: "Claude",
    by: "Anthropic",
    monogram: "Cl",
    logo: "/assets/logo-claude.png",
    logoBg: "#1a0e09",
    logoPad: "p-1.5",
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
        starterPrompt: "Aku thalib Al-Azhar yang sedang mendalami [TOPIK]. Aku ingin munaqasyah (diskusi mendalam), bukan sekadar penjelasan satu arah.\n\nBimbingan diskusi:\n- Mulai dengan menanyakan ma 'indi (apa yang sudah aku tahu)\n- Bimbing dengan dialog bertahap — tantang asumsiku saat perlu (tanqih al-manat)\n- Saat membahas ayat/hadits/kaidah, selalu kutip teks Arab asli sebelum terjemah\n- Gunakan istilah Arab: dalil, wajh istidlal, ta'rif, qaidah, mas'alah, hukm — jangan terjemahkan\n- Bila menyebut pendapat ulama, sebut nama Arab-nya lengkap (al-Imam al-Syafi'i, Ibn Taymiyyah)\n- Bila merujuk kitab, sebut nama Arab-nya (Al-Umm, Al-Muhadhdhab, Al-Mughni)\n\nMari mulai — tanyakan dulu apa yang sudah aku pahami.",
      },
      summary: {
        when: "Meringkas matan klasik atau syarah panjang menjadi peta yang bisa dipahami cepat.",
        steps: [
          "Tempel teks panjang (matan/syarah).",
          "Minta ringkasan struktural: definisi → poin utama → contoh → khilafiyyah (jika ada).",
          "Verifikasi terms teknis ke kitab asli, Claude paling jujur kalau tidak yakin.",
        ],
        starterPrompt: "Aku thalib Azhari sedang mutala'ah bab berikut dari kitab [NAMA KITAB Arab + Latin]:\n\n[PASTE TEKS]\n\nBuatkan talkhish dengan format:\n1. Ta'rif inti — sertakan teks Arab asli dari definisi yang muncul di bab\n2. 3 sub-tema utama (al-mabahith al-ra'isiyyah) — pakai istilah Arab\n3. Per sub-tema: poin inti + contoh konkret + dalil utama dalam Arab (ayat/hadits/kaidah) + terjemah\n4. Khulasah (ringkasan akhir) dalam 1 paragraf\n5. Tandai dengan [⚠️] bila ada bagian yang kamu tidak yakin sumbernya\n\nGaya: Indonesia akademik. Istilah teknis tetap Arab transliterasi.",
      },
      visual: {
        when: "Butuh peta konsep yang terstruktur dari materi kompleks.",
        steps: [
          "Minta pohon konsep dengan akar → cabang → daun.",
          "Minta hubungan antar cabang dijelaskan (mana prasyarat, mana konsekuensi).",
          "Tulis ulang di kertas atau aplikasi mind-map.",
        ],
        starterPrompt: "Aku thalib Azhari. Buatkan shajarat al-mafahim (pohon konsep) kitab [NAMA KITAB — Arab + Latin] dengan struktur:\n\n- Jadhr (akar): tema utama kitab — Arab + terjemah\n- 5-7 furu' ra'isiyyah (cabang utama): bab-bab inti — gunakan judul bab dalam Arab\n- 3 sub-furu' per cabang: sub-bab atau topik turunan\n- 1 mithal (contoh) per sub-cabang: contoh klasik dari kitab tersebut\n\nSetelah selesai, jelaskan dalam 1 paragraf bagaimana 'alaqah (hubungan) antar cabang utama saling mendukung. Sebutkan apakah kitab ini termasuk genre matan, syarh, atau hasyiyah.",
      },
      practice: {
        when: "Latihan i'rab, tashrif, atau tatbiq kaidah dengan koreksi teliti.",
        steps: [
          "Minta 5-10 latihan dengan tingkat bertahap.",
          "Kerjakan sendiri, kirim jawaban.",
          "Claude akan koreksi dengan menyebut kaidah & rujukan, paling teliti di antara semua AI.",
        ],
        starterPrompt: "Aku thalib Azhari yang sedang melatih i'rab. Beri 5 jumlah (kalimat Arab) untuk di-i'rab dengan tingkat kesulitan bertahap:\n\n- Jumlah 1-2: ismiyyah/fi'liyyah basit (mubtada'-khabar, fi'l-fa'il-maf'ul)\n- Jumlah 3-4: mengandung syibh al-jumlah, hal, atau tamyiz\n- Jumlah 5: mengandung naskh (kana wa akhawatiha, inna wa akhawatiha) atau idafah berlapis\n\nTulis tiap jumlah dengan harakat lengkap. Jangan kasih jawaban dulu.\n\nSetelah aku i'rab, koreksi dengan:\n- Sebut kaidah yang dilanggar (kalau ada)\n- Rujukan ke matan nahwu standar: Alfiyat Ibn Malik, Al-Ajurrumiyyah, atau Qatr al-Nada\n- Saran tambahan: cara membedakan i'rab yang sering rancu",
      },
      memorization: {
        when: "Membuat skema hafalan yang strategis, bukan brute force.",
        steps: [
          "Jelaskan materi yang ingin dihafal + target waktu.",
          "Minta jadwal spaced repetition (hari 1, 3, 7, 14, 21).",
          "Minta mnemonic untuk poin yang sulit dihafal.",
        ],
        starterPrompt: "Aku thalib Azhari, sedang menghafal [MATAN/SURAT — sebutkan Arab + Latin, dan dari kitab apa kalau matan] dengan target khatam [X HARI].\n\nBuatkan jadwal muraja'ah dengan pendekatan spaced repetition (hari 1, 3, 7, 14, 21) dalam tabel:\n| Hari | Bagian | Fokus | Catatan |\n\nTambahan:\n- Berikan 3 mawadhi' yang biasanya paling bikin ragu, beserta mnemonic Arab\n- Saran adab muraja'ah: waktu terbaik (ba'da Fajr, ba'da 'Asr), kondisi fisik, dll\n- Sertakan dua khasishoh dari matan/surat ini yang bisa dijadikan \"pegangan\" memori",
      },
      reading: {
        when: "Memahami kitab klasik secara mendalam, paragraf demi paragraf.",
        steps: [
          "Tempel teks Arab + minta terjemahan harfiah dulu.",
          "Lalu minta parafrase akademik.",
          "Tanya lanjutan untuk setiap istilah teknis yang muncul.",
        ],
        starterPrompt: "Aku thalib Azhari sedang mutala'ah paragraf berikut dari kitab [NAMA KITAB — Arab + Latin]:\n\n[PASTE TEKS Arab]\n\nLakukan analisis bertahap:\n\n1. Tarjamah harfiyyah (terjemahan harfiah) — kata per kata\n2. Tarjamah ma'nawiyyah (parafrase akademik) — Indonesia mengalir\n3. Syarh al-mustalahat (penjelasan istilah teknis) — untuk setiap istilah: [Arab dengan harakat] (transliterasi) — definisi\n4. Maqsud al-mu'allif (maksud inti penulis) dalam 1 kalimat\n5. Khilaf (perbedaan pendapat ulama) bila ada — sebut nama ulama dan kitab rujukan dalam nama Arab\n\nBila ada bagian yang ambigu, sebut secara jujur dan tawarkan dua kemungkinan tafsir.",
      },
    },
  },
  {
    id: "gemini",
    name: "Gemini",
    by: "Google",
    monogram: "Gm",
    logo: "/assets/logo-gemini.webp",
    logoBg: "#0d1b4b",
    logoPad: "p-1.5",
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
        starterPrompt: "Aku thalib Azhari sedang mendalami [TOPIK]. Mari munaqasyah dengan pendekatan jadal 'ilmi (diskusi akademik):\n\n- Untuk setiap klaim faktual atau pendapat ulama, sertakan link sumber web yang terpercaya\n- Saat mengutip ayat/hadits/kaidah, sertakan teks Arab asli + sebut sumber (nama surah-ayat, kitab hadits + bab + no)\n- Bila menyebut pendapat ulama, gunakan nama Arab transliterasi: al-Imam al-Syafi'i, Ibn Taymiyyah, al-Ghazali\n- Bila kamu tidak yakin atau sumbernya lemah (da'if), sebutkan secara jujur\n\nMulai dengan menanyakan ma 'indi tentang topik ini.",
      },
      summary: {
        when: "Meringkas artikel/berita kontemporer terkait Azhar atau dunia Islam.",
        steps: [
          "Tempel link artikel atau judul yang mau diringkas.",
          "Minta ringkasan 5 poin + tanggapan dari perspektif Islam.",
        ],
        starterPrompt: "Aku thalib Azhari. Ringkas artikel atau konten berikut: [URL/JUDUL/PASTE]. Format: 5 poin utama + 1 paragraf tanggapan dari perspektif keilmuan Islam. Bila ada istilah syar'i yang muncul, sertakan Arab aslinya.",
      },
      visual: {
        when: "Foto matan atau halaman kitab yang sulit terbaca, Gemini bisa OCR dengan baik.",
        steps: [
          "Foto halaman kitab dengan terang & fokus.",
          "Upload ke Gemini, minta transkrip Arab + terjemahan.",
          "Cek hasil transkripsi karena bisa salah pada huruf serupa.",
        ],
        starterPrompt: "Aku thalib Azhari upload foto halaman kitab. Lakukan:\n\n1. Transkrip teks Arab dengan harakat lengkap — tulis ulang persis seperti di kitab\n2. Tarjamah ke Bahasa Indonesia akademik (mengalir, bukan harfiah)\n3. Syarh mustalahat — daftar istilah teknis: [Arab dengan harakat] (transliterasi) — definisi singkat\n4. Identifikasi kitab bila memungkinkan: judul Arab, penulis (nama Arab), genre (matan/syarh/hasyiyah)\n\nBila ada bagian foto yang tidak terbaca, tandai dengan [???] dan jelaskan posisinya.",
      },
      practice: {
        when: "Drill tashrif atau kosakata dengan sumber suplemen dari web.",
        steps: [
          "Minta latihan acak.",
          "Minta sumber online tambahan untuk latihan lebih lanjut.",
        ],
        starterPrompt: "Aku thalib Azhari, mau drill tashrif atau kosakata Arab. Beri 10 latihan acak (level dasar hingga menengah). Tulis setiap soal dengan harakat lengkap. Setelah aku selesai, koreksi dan rekomendasikan 1 sumber online atau channel YouTube untuk latihan lanjut.",
      },
      memorization: {
        when: "Cari murattil favorit atau tasmi' audio sebagai pendamping hafalan.",
        steps: [
          "Minta rekomendasi qari dari Mesir untuk surat tertentu.",
          "Minta link YouTube atau platform yang resmi.",
        ],
        starterPrompt: "Rekomendasikan 3 qari' kontemporer dari Mesir untuk membantu hafalan [SURAT]. Untuk setiap qari', sebutkan: kelebihan tartil dan tajwidnya, riwayah bacaan yang digunakan, dan 1 link YouTube ke bacaan surat tersebut.",
      },
      reading: {
        when: "Membaca jurnal kontemporer atau penelitian terbaru.",
        steps: [
          "Minta Gemini mencari paper terkini tentang topik.",
          "Minta ringkasan terstruktur dari setiap paper.",
        ],
        starterPrompt: "Aku thalib Azhari mencari paper akademis terbaru (5 tahun terakhir) tentang [TOPIK]. Untuk masing-masing: judul, penulis, abstrak singkat, dan link sumber. Beri tahu jika tidak menemukan paper yang relevan.",
      },
    },
  },
  {
    id: "notebooklm",
    name: "NotebookLM",
    by: "Google",
    monogram: "NB",
    logo: "/assets/logo-notebooklm.webp",
    logoBg: "#5c35cc",
    logoPad: "p-2",
    logoFilter: "brightness(0) invert(1)",
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
        starterPrompt: "Aku thalib Azhari mau diskusi konsep [TOPIK] berdasarkan kitab yang sudah aku upload. Jawab pertanyaanku dengan selalu merujuk ke halaman spesifik dari sumber — bukan pengetahuan umum. Saat mengutip langsung dari kitab, sertakan teks Arab asli-nya. Bila kitab tidak membahas pertanyaanku, katakan secara eksplisit.",
      },
      summary: {
        when: "Bikin ringkasan otomatis dari kitab panjang yang kamu upload.",
        steps: [
          "Upload PDF kitab.",
          "Pakai tombol \"Briefing doc\" atau \"Summary\" yang muncul otomatis.",
          "Atau minta: 'Ringkas bab [X] dalam 5 poin dengan halaman rujukan.'",
        ],
        starterPrompt: "Aku thalib Azhari. Ringkas bab [NAMA BAB] dari kitab yang aku upload. Format: 5 poin utama + halaman rujukan untuk setiap poin + 1 paragraf intisari. Bila ada istilah teknis Arab, sertakan Arab aslinya.",
      },
      visual: {
        when: "Bikin mind-map dari koleksi kitab untuk satu mata kuliah.",
        steps: [
          "Upload semua sumber 1 matkul ke 1 notebook.",
          "Minta peta konsep yang menghubungkan kitab-kitab tersebut.",
          "Gunakan fitur \"Mind map\" jika sudah tersedia di akunmu.",
        ],
        starterPrompt: "Aku thalib Azhari. Berdasarkan semua kitab yang sudah aku upload, buatkan peta konsep yang menghubungkan tema-tema utamanya. Gunakan nama bab dalam Arab bila memungkinkan. Tunjukkan bagian mana yang dibahas di beberapa kitab dan bagian unik per kitab.",
      },
      practice: {
        when: "Latihan soal yang sumbernya khusus dari kitab kamu.",
        steps: [
          "Upload kitab + materi kuliah.",
          "Minta soal latihan dengan rujukan halaman.",
          "Kerjakan, lalu minta koreksi berbasis halaman tersebut.",
        ],
        starterPrompt: "Aku thalib Azhari. Buat 10 soal latihan tentang [TOPIK] berbasis kitab yang aku upload. Pakai gaya tanya imtihan Azhari (\"'Arrif...\", \"Bayyin...\", \"Ma hukm...\"). Setiap soal sertakan referensi halaman ke kitab. Tampilkan tanpa jawaban dulu.",
      },
      memorization: {
        when: "Murajaah matan dengan referensi syarah otomatis.",
        steps: [
          "Upload matan + syarah ke 1 notebook.",
          "Minta drill hafalan, AI akan jelaskan dari syarah jika kamu ragu.",
        ],
        starterPrompt: "Aku thalib Azhari menghafal matan [NAMA] yang sudah aku upload. Bikin sesi drill: sebut potongan Arab dengan harakat, aku lanjutkan. Jika aku ragu, jelaskan dari syarah yang juga aku upload. Tulis semua potongan dengan harakat lengkap.",
      },
      reading: {
        when: "Tafahhum bertahap, baca kitab dengan AI sebagai pendamping.",
        steps: [
          "Upload kitab, baca paragraf demi paragraf.",
          "Untuk setiap paragraf musykil, tanya AI dengan menyebut halaman.",
          "AI hanya menjawab dari kitabmu, tidak mengarang.",
        ],
        starterPrompt: "Aku thalib Azhari sedang baca kitab yang aku upload, halaman [X]. Tolong jelaskan paragraf yang dimulai dengan kata '[KATA AWAL]': terjemahkan, parafrase, dan jelaskan istilah teknis Arab-nya. Gunakan nama kitab dalam Arab. Selalu rujuk ke halaman sumber.",
      },
    },
  },
  {
    id: "perplexity",
    name: "Perplexity",
    by: "Perplexity AI",
    monogram: "Px",
    logo: "/assets/logo-perplexity.png",
    logoBg: "#138a8a",
    logoPad: "p-2",
    logoFilter: "brightness(0) invert(1)",
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
        starterPrompt: "Aku thalib Azhari sedang mendalami konsep [TOPIK] berdasarkan kitab [NAMA KITAB Arab + Latin] yang sudah aku upload.\n\nAturan diskusi:\n- Jawab dengan selalu merujuk halaman spesifik dari sumber upload, bukan pengetahuan umum\n- Sertakan teks Arab asli untuk kutipan langsung dari kitab\n- Bila kitab tidak membahas pertanyaanku, sebut eksplisit: \"Tidak ditemukan dalam kitab ini\"\n- Bila ada perbedaan antara pendapat di kitab ini dan pendapat masyhur, sebutkan dengan jelas\n- Gunakan istilah Arab: dalil, hujjah, ta'rif, taqsim\n\nMulai dengan menyebut bab pertama yang mau aku dalami.",
      },
      summary: {
        when: "Riset awal cepat, apa saja yang ditulis tentang topik ini.",
        steps: [
          "Cari topikmu.",
          "Minta ringkasan 5 sudut pandang utama.",
          "Simpan list sumber untuk dibaca lengkap nanti.",
        ],
        starterPrompt: "Aku thalib Azhari, mau riset awal tentang [TOPIK]. Apa saja sudut pandang utama dalam literatur akademis? Beri 5 sudut pandang dengan 1 sumber kuat per sudut. Bila ada perspektif ulama atau keilmuan Islam, prioritaskan.",
      },
      visual: {
        when: "Petakan landscape penelitian, siapa berdebat dengan siapa.",
        steps: [
          "Tanyakan posisi para tokoh utama.",
          "Minta tabel perbandingan posisi mereka.",
        ],
        starterPrompt: "Aku thalib Azhari. Buatkan tabel perbandingan posisi 4-6 tokoh akademis atau ulama tentang [TOPIK]. Kolom: Nama | Posisi | Argumen Inti | Sumber Utama. Untuk nama ulama, gunakan transliterasi Arab (al-Imam al-Syafi'i, dll).",
      },
      practice: {
        when: "Verifikasi referensi yang kamu temukan di tempat lain.",
        steps: [
          "Tempel kutipan/klaim yang ingin dicek.",
          "Tanyakan: 'Apakah ini akurat? Apa sumbernya?'",
        ],
        starterPrompt: "Aku thalib Azhari. Verifikasi klaim berikut: '[PASTE KLAIM]'. Apakah akurat? Apa sumber asli yang valid? Bila merujuk ayat atau hadits, apakah teks Arab dan terjemahannya tepat? Jika tidak ditemukan, katakan dengan jelas.",
      },
      memorization: {
        when: "Kurang relevan untuk hafalan, gunakan ChatGPT atau Claude.",
        steps: [
          "Untuk hafalan, beralih ke ChatGPT atau NotebookLM.",
          "Perplexity lebih cocok mencari materi yang akan dihafal, bukan drill-nya.",
        ],
        starterPrompt: "Aku thalib Azhari mencari teks lengkap [MATAN/SURAT] dari sumber yang valid. Idealnya dari situs resmi atau repositori kitab terpercaya. Sertakan teks Arab dengan harakat dan terjemah standar.",
      },
      reading: {
        when: "Membangun bab landasan teori untuk makalah.",
        steps: [
          "Cari isu spesifik di topik makalahmu.",
          "Minta perpaduan 3-5 sumber jadi 1 paragraf landasan teori.",
          "Selalu cek ulang setiap sitasi.",
        ],
        starterPrompt: "Aku thalib Azhari menulis makalah tentang [TOPIK]. Bantu susun paragraf landasan teori dengan menggabungkan minimal 3 sumber akademis. Bila ada sumber dari ulama atau lembaga Islam (Al-Azhar, ISESCO, dll), prioritaskan. Tampilkan paragraf + daftar sumber.",
      },
    },
  },
  {
    id: "copilot",
    name: "Copilot",
    by: "Microsoft",
    monogram: "Co",
    logo: "/assets/logo-copilot.png",
    logoBg: "#1a1a2e",
    logoPad: "p-1",
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
        starterPrompt: "Aku thalib Azhari sedang menulis paragraf ini di makalah: [PASTE]. Tantang argumennya — apa kelemahan logikanya dari perspektif akademik Islam? Saran kalimat alternatif yang lebih kuat?",
      },
      summary: {
        when: "Ringkas PDF panjang langsung dari Word atau Edge.",
        steps: [
          "Buka PDF di Edge atau attach di Copilot.",
          "Klik \"Summarize\" atau minta ringkasan dengan format spesifik.",
        ],
        starterPrompt: "Aku thalib Azhari. Ringkas PDF yang sedang aku buka. Format: 5 poin utama + 3 kutipan langsung penting + 1 paragraf kesimpulan. Sertakan nomor halaman untuk setiap kutipan. Bila ada istilah teknis Arab, pertahankan istilah aslinya.",
      },
      visual: {
        when: "Bikin tabel atau diagram langsung di Word.",
        steps: [
          "Posisi cursor di tempat tabel/diagram mau dimasukkan.",
          "Minta Copilot generate tabel/diagram berdasarkan deskripsi.",
        ],
        starterPrompt: "Aku thalib Azhari. Buatkan tabel perbandingan [TOPIK] dengan kolom yang relevan. Sisipkan langsung di Word. Bila kolom menyebut nama ulama atau kitab, gunakan nama Arab-nya.",
      },
      practice: {
        when: "Latihan menulis terbimbing, tulis paragraf, dapat feedback real-time.",
        steps: [
          "Tulis paragraf utuh dulu.",
          "Highlight → Copilot → 'Rewrite' atau 'Critique'.",
          "Bandingkan versimu dengan saran AI, ambil yang masuk akal.",
        ],
        starterPrompt: "Aku thalib Azhari. Critique paragraf makalahku berikut sebagai pembimbing akademik: [PASTE]. Tunjukkan kelemahan logika, masalah bahasa, dan 1 versi revisi. Perhatikan apakah terminologi Islam digunakan dengan tepat.",
      },
      memorization: {
        when: "Kurang cocok untuk drill hafalan, gunakan ChatGPT.",
        steps: [
          "Beralih ke ChatGPT atau NotebookLM untuk hafalan.",
          "Copilot lebih kuat untuk menulis dan dokumen.",
        ],
        starterPrompt: "Untuk hafalan matan atau Qur'an, gunakan ChatGPT atau NotebookLM yang lebih optimal untuk sesi tasmi' dan drill.",
      },
      reading: {
        when: "Pendamping baca PDF makalah/buku akademik.",
        steps: [
          "Buka PDF di Edge browser.",
          "Aktifkan sidebar Copilot.",
          "Tanyakan paragraf demi paragraf saat baca.",
        ],
        starterPrompt: "Aku thalib Azhari sedang baca PDF ini di Edge. Bantu aku pahami paragraf yang dimulai dengan '[PASTE KATA AWAL]'. Jelaskan dalam bahasa akademik, dan perhatikan bila ada istilah Arab atau syar'i yang memerlukan penjelasan lebih.",
      },
    },
  },
];

/* ============ RECOMMENDATION RULES ============ */
/* Returns array of { toolId, reason } based on profile */
const recommend = (profile) => {
  const struggles = profile.struggle || [];
  const styles = profile.learningStyle || [];
  const faculty = profile.faculty || profile.field;
  const major = profile.major;
  const field = faculty; // keep compat

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

  // By faculty — umum Azhari
  if (["syariah", "lughah", "ushuluddin", "quran", "dirasat"].includes(faculty)) {
    addScore("claude", 1, "fasih dengan bahasa Arab klasik");
    addScore("notebooklm", 1, "cocok untuk PDF kitab Azhari");
  }

  // Faculty + major specific
  if (faculty === "ushuluddin") {
    if (!major || major === "tafsir") {
      addScore("claude", 2, "kuat untuk komparasi tafsir klasik vs mu'ashir, navigasi teks Arab panjang");
    }
    if (major === "hadits") {
      addScore("claude", 2, "analisis sanad dan takhrij mendalam");
      addScore("perplexity", 1, "verifikasi rujukan hadits dan sumber primer");
    }
    if (major === "aqidah") {
      addScore("chatgpt", 1, "diskusi konsep abstrak filsafat butuh dialog mendalam");
      addScore("claude", 1, "nuansa argumen aqidah komparatif");
    }
  }
  if (faculty === "syariah") {
    if (!major || major === "islamiyah") {
      addScore("notebooklm", 2, "hafal matan & ringkasan kitab Syariah langsung dari file");
      addScore("claude", 1, "fiqh muqaran antar madzhab");
    }
    if (major === "wal_qanun") {
      addScore("claude", 2, "navigate teks panjang qanun, drafting analisis hukum");
      addScore("chatgpt", 1, "drafting dan strukturisasi dokumen hukum");
    }
  }
  if (faculty === "lughah") {
    addScore("notebooklm", 2, "parsing kitab sastra klasik, analisis balaghah dan kritik syi'ir");
    if (major === "tarikh") {
      addScore("perplexity", 1, "cross-reference periode sejarah dan kitab tarikh");
    }
    if (major === "shahafah") {
      addScore("chatgpt", 1, "drafting dan editing teks media");
    }
  }
  if (faculty === "quran") {
    addScore("claude", 2, "navigate qira'at dan ulumul Qur'an detail");
    addScore("chatgpt", 1, "sesi tasmi' interaktif via mode suara");
  }
  if (faculty === "dirasat") {
    addScore("chatgpt", 1, "generalis untuk materi luas lintas disiplin");
    addScore("claude", 1, "analisis mendalam teks multi-bidang");
  }
  if (faculty === "umum" || ["kedokteran", "teknik"].includes(faculty)) {
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
  STRUGGLES, FIELDS, FACULTIES, LEVELS, LEARNING_STYLES,
  AI_TOOLS, recommend,
  LEARNING_PATHS, allModules,
  ETHICS_POINTS,
  DEFAULT_MEMBERS, ADMIN_PIN,
});
