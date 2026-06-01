import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from 'react';
/* Talqih, All product data
   - Personalization metadata
   - AI tools with adaptive guide variants
   - Learning paths
   - Demo member codes
*/

/* ============ MAHAD HELPER ============ */
const MAHAD_LEVEL_IDS = [
  "idad_1","idad_2","idad_3",
  "tsanawi_1_adabi","tsanawi_1_ilmi",
  "tsanawi_2_adabi","tsanawi_2_ilmi",
  "tsanawi_3_adabi","tsanawi_3_ilmi",
  "idadi","tsanawi",
];
const isMahadLevel   = (level) => MAHAD_LEVEL_IDS.includes(level);
const isIdadLevel    = (level) => level?.startsWith("idad");
const isTsanawiLevel = (level) => level?.startsWith("tsanawi");
const isIlmiLevel    = (level) => level?.includes("ilmi");
const isAdabiLevel   = (level) => level?.includes("adabi");
Object.assign(window, { isMahadLevel, isIdadLevel, isTsanawiLevel, isIlmiLevel, isAdabiLevel, MAHAD_LEVEL_IDS });

/* ============ STRUGGLES (Masisir) ============ */
const STRUGGLES = [
  { id: "arab",      label: "Materi Arab",     desc: "Memahami kitab klasik & teks Arab akademik", icon: "book" },
  { id: "makalah",   label: "Makalah",          desc: "Menulis tugas & makalah Azhari yang rapi",  icon: "pen" },
  { id: "referensi", label: "Referensi",        desc: "Mencari rujukan & sumber yang tertelusur",  icon: "search" },
  { id: "hafalan",   label: "Hafalan",          desc: "Murajaah Qur'an & matan yang tahan lama",    icon: "bookOpen" },
  { id: "fokus",     label: "Fokus",            desc: "Produktivitas & disiplin waktu belajar",    icon: "target" },
];

/* ============ STRUGGLES (Ma'had) ============ */
const _MAHAD_STRUGGLES_COMMON = [
  { id: "hafalan",      label: "Hafalan Al-Qur'an",    desc: "Murajaah dan penambahan hafalan",            icon: "book" },
  { id: "insya",        label: "Insya' (mengarang)",   desc: "Menulis karangan dalam bahasa Arab",         icon: "pen" },
  { id: "fahm_maqru",   label: "Fahm Maqru'",          desc: "Memahami teks soal ujian dalam bahasa Arab", icon: "bookOpen" },
  { id: "nahwu_sharaf", label: "Nahwu & Sharaf",       desc: "Tata bahasa Arab",                          icon: "list" },
  { id: "english",      label: "Bahasa Inggris",       desc: "Pelajaran bahasa Inggris di sekolah",       icon: "messageSquare" },
];
const _MAHAD_STRUGGLES_IDAD = [
  { id: "math_arab",  label: "Matematika bahasa Arab",  desc: "Berhitung & rumus dalam bahasa Arab",       icon: "target" },
  { id: "sains_arab", label: "Sains dalam bahasa Arab", desc: "Fisika, Kimia, Biologi dalam bahasa Arab",  icon: "layers" },
];
const _MAHAD_STRUGGLES_TSANAWI = [
  { id: "sejarah_geo", label: "Sejarah & Geografi", desc: "Pelajaran IPS dalam bahasa Arab", icon: "search" },
  { id: "mantiq",      label: "Mantiq",             desc: "Ilmu logika Islam",               icon: "layers" },
];
const getMahadStruggles = (level) => {
  const isIdad    = level?.startsWith("idad");
  const isTsanawi = level?.startsWith("tsanawi");
  if (isIdad)    return [..._MAHAD_STRUGGLES_COMMON, ..._MAHAD_STRUGGLES_IDAD];
  if (isTsanawi) return [..._MAHAD_STRUGGLES_COMMON, ..._MAHAD_STRUGGLES_TSANAWI];
  return _MAHAD_STRUGGLES_COMMON;
};

/* ============ MA'HAD YEARS ============ */
const MAHAD_YEARS = [
  { id: "1", label: "Tahun 1", arabic: "١" },
  { id: "2", label: "Tahun 2", arabic: "٢" },
  { id: "3", label: "Tahun 3", arabic: "٣" },
];

/* ============ MA'HAD JURUSAN (Tsanawi only) ============ */
const MAHAD_JURUSAN = [
  { id: "adabi", label: "Adabi",  desc: "أدبي — Sastra & Sosial",        emoji: "📖" },
  { id: "ilmi",  label: "Ilmi",   desc: "علمي — Sains & Matematika",     emoji: "⚗️" },
];

/* ============ FACULTIES (Al-Azhar) ============ */
const FACULTIES = [
  {
    id: "ushuluddin",
    label: "Ushuluddin",
    arabic: "أصول الدين",
    desc: "Tafsir, Hadits, Aqidah & Filsafat",
    icon: "bookOpen",
    forGender: "banin",
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
    forGender: "banin",
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
    forGender: "banin",
    majorsStartLevel: 1,
    majors: [
      { id: "adab",     label: "Lughah & Adab (Umum)",   arabic: "اللغة والأدب" },
      { id: "tarikh",   label: "Tarikh wal Hadharah",    arabic: "التاريخ والحضارة" },
      { id: "shahafah", label: "Shahafah wal I'lam",     arabic: "الصحافة والإعلام" },
    ],
  },
  {
    id: "dirasat",
    label: "Dirasat Islamiyah (Banat)",
    arabic: "الدراسات الإسلامية",
    desc: "Kuliyyah Banat — Syariah, Ushuluddin, Lughah",
    icon: "layers",
    forGender: "banat",
    majorsStartLevel: 1,
    majors: [
      { id: "dirasat_syariah",    label: "Qism Syariah",         arabic: "قسم الشريعة" },
      { id: "dirasat_ushuluddin", label: "Qism Ushuluddin",      arabic: "قسم أصول الدين" },
      { id: "dirasat_lughah",     label: "Qism Lughah Arabiyah", arabic: "قسم اللغة العربية" },
    ],
  },
  {
    id: "dirasat-banin",
    label: "Dirasat Islamiyah (Banin)",
    arabic: "الدراسات الإسلامية",
    desc: "Studi Islam terpadu — maddah inti lintas bidang",
    icon: "layers",
    forGender: "banin",
    majorsStartLevel: null,
    majors: [],
  },
  {
    id: "quran",
    label: "Al-Qur'an Al-Karim",
    arabic: "القرآن الكريم",
    desc: "Tahfidz, Qira'at, Tafsir",
    icon: "book",
    forGender: "all",
    majorsStartLevel: null,
    majors: [],
  },
  {
    id: "dakwah",
    label: "Dakwah Islamiyah",
    arabic: "الدعوة الإسلامية",
    desc: "Dakwah, Komunikasi Islam & Ilmu Sosial",
    icon: "star",
    majorsStartLevel: null,
    majors: [],
  },
  {
    id: "umum",
    label: "Fakultas Umum / Lainnya",
    arabic: "أخرى",
    desc: "Kedokteran, Teknik, Sains, dll",
    icon: "grid",
    forGender: "all",
    majorsStartLevel: null,
    majors: [],
  },
];

/* ============ TINGKAT KULIAH ============ */
const LEVELS = [
  { id: "_sep_mahad",   isSeparator: true, label: "MA'HAD AL-AZHAR" },
  { id: "idadi",   label: "I'dadi",   short: "I'dadi",   arabic: "الإعدادي",  desc: "Ma'had Al-Azhar · Setingkat SMP", isMahad: true },
  { id: "tsanawi", label: "Tsanawi",  short: "Tsanawi",  arabic: "الثانوي",   desc: "Ma'had Al-Azhar · Setingkat SMA", isMahad: true },
  // ── GRANULAR MA'HAD LEVELS ──
  { id: "idad_1", label: "I'dadi Kelas 1", short: "I'dadi 1", arabic: "إعدادي ١", jenjang: "mahad", isMahad: true },
  { id: "idad_2", label: "I'dadi Kelas 2", short: "I'dadi 2", arabic: "إعدادي ٢", jenjang: "mahad", isMahad: true },
  { id: "idad_3", label: "I'dadi Kelas 3", short: "I'dadi 3", arabic: "إعدادي ٣", jenjang: "mahad", isMahad: true },
  { id: "tsanawi_1_adabi", label: "Tsanawi Kelas 1 — Adabi",  short: "Tsanawi 1 Adabi",  arabic: "ثانوي ١ أدبي",  jenjang: "mahad", jurusan: "adabi", isMahad: true },
  { id: "tsanawi_1_ilmi",  label: "Tsanawi Kelas 1 — Ilmi",   short: "Tsanawi 1 Ilmi",   arabic: "ثانوي ١ علمي",  jenjang: "mahad", jurusan: "ilmi",  isMahad: true },
  { id: "tsanawi_2_adabi", label: "Tsanawi Kelas 2 — Adabi",  short: "Tsanawi 2 Adabi",  arabic: "ثانوي ٢ أدبي",  jenjang: "mahad", jurusan: "adabi", isMahad: true },
  { id: "tsanawi_2_ilmi",  label: "Tsanawi Kelas 2 — Ilmi",   short: "Tsanawi 2 Ilmi",   arabic: "ثانوي ٢ علمي",  jenjang: "mahad", jurusan: "ilmi",  isMahad: true },
  { id: "tsanawi_3_adabi", label: "Tsanawi Kelas 3 — Adabi",  short: "Tsanawi 3 Adabi",  arabic: "ثانوي ٣ أدبي",  jenjang: "mahad", jurusan: "adabi", isMahad: true },
  { id: "tsanawi_3_ilmi",  label: "Tsanawi Kelas 3 — Ilmi",   short: "Tsanawi 3 Ilmi",   arabic: "ثانوي ٣ علمي",  jenjang: "mahad", jurusan: "ilmi",  isMahad: true },
  { id: "_sep_masisir", isSeparator: true, label: "MASISIR — MAHASISWA" },
  { id: "mustawa", label: "Darul Lughoh (DL)",                short: "DL",             arabic: "دار اللغة", desc: "Persiapan bahasa Arab sebelum masuk fakultas" },
  { id: "1",       label: "Tingkat I",                        short: "Awwal",          arabic: "الأولى" },
  { id: "2",       label: "Tingkat II",                       short: "Tsani",          arabic: "الثانية" },
  { id: "3",       label: "Tingkat III",                      short: "Tsalits",        arabic: "الثالثة" },
  { id: "4",       label: "Tingkat IV",                       short: "Robi'",          arabic: "الرابعة" },
  { id: "5",       label: "Tingkat V (Syariah wal Qanun)",    short: "Khamis",         arabic: "الخامسة" },
  {
    id: "s2_kuliyyat",
    label: "S2 — Kuliyyat Ulum (1 tahun)",
    short: "Kuliyyat Ulum",
    arabic: "كليات العلوم",
    desc: "Program Maajistir intensif 1 tahun — kuliah + risalah",
  },
  {
    id: "s2_dirasat",
    label: "S2 — Dirasat Ulya (2 tahun)",
    short: "Dirasat Ulya",
    arabic: "الدراسات العليا",
    desc: "Program Maajistir reguler 2 tahun — kuliah + risalah",
  },
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
    logo: "/assets/images/ai-tools/ChatGPT.png",
    logoBg: null,
    brandColor: "#10A37F",
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
    logo: "/assets/images/ai-tools/Claude.png",
    logoBg: null,
    brandColor: "#D97757",
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
    logo: "/assets/images/ai-tools/Gemini.webp",
    logoBg: "#FFFFFF",
    brandColor: "#4285F4",
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
    logo: "/assets/images/ai-tools/NotebookLM.webp",
    logoBg: "#FFFFFF",
    brandColor: "#9168F0",
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
    logo: "/assets/images/ai-tools/perplexity-ai-icon.webp",
    logoBg: null,
    brandColor: "#1FB6B6",
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
    logo: "/assets/images/ai-tools/Copilot.png",
    logoBg: null,
    brandColor: "#0078D4",
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
  {
    id: "tarteel",
    name: "Tarteel",
    by: "Tarteel AI",
    monogram: "ت",
    logo: "/assets/tarteel-logo.png",
    logoBg: "#2C2C2E",
    brandColor: "#1A7A4A",
    color: "#1A7A4A",
    tier: "Gratis + Premium",
    link: "https://tarteel.ai",
    description: "AI khusus Qur'an — mendengar bacaanmu secara real-time dan langsung koreksi kalau ada kesalahan tajwid atau makhraj. Teman terbaik untuk hafalan dan tahsin.",
    bestAt: ["Tahsin tilawah", "Hafalan interaktif", "Koreksi tajwid real-time"],
    guides: {
      discussion: {
        when: "Kamu mau 'berdiskusi' dengan Qur'an — baca, dengar koreksi, baca ulang. Loop aktif yang membangun kesadaran tilawah.",
        steps: [
          "Buka tarteel.ai di browser atau app — login atau lanjut sebagai tamu.",
          "Pilih surah yang mau dibaca, aktifkan mode 'Listening'.",
          "Baca dengan suara jelas — Tarteel akan highlight kalau ada kesalahan.",
          "Ulangi ayat yang merah/koreksi sampai hijau (benar).",
          "Setelah satu halaman, lihat summary kesalahan — catat di Kurasah.",
        ],
        starterPrompt: "Aku mau sesi tahsin aktif. Aku akan baca [SURAH] ayat [X–Y]. Setelah aku selesai baca, bantu aku analisis:\n1. Hukum tajwid apa yang ada di ayat-ayat ini yang perlu diperhatikan?\n2. Makhraj huruf mana yang biasanya keliru di ayat ini?\n3. Tempat-tempat waqaf yang disarankan (tanda waqaf)\n\nAku akan cek bacaanku di Tarteel, lalu bandingkan dengan catatanmu.",
      },
      summary: {
        when: "Mau ringkasan sebelum sesi hafalan — tau dulu mana ayat yang mirip (mutasyabihat) supaya tidak tertukar.",
        steps: [
          "Sebelum buka Tarteel, minta AI (Claude/ChatGPT) list ayat mutasyabihat di surah target.",
          "Buka Tarteel, fokus drill di ayat-ayat yang AI sebut rawan tertukar.",
          "Setelah sesi, catat progres di Kurasah Talqeeh.",
        ],
        starterPrompt: "Aku mau hafal [SURAH]. Sebelum mulai, berikan:\n1. Daftar ayat-ayat yang mirip (mutasyabihat) di surah ini — tulis teks Arabnya dengan harakat\n2. Perbedaan kecil yang biasanya bikin keliru\n3. Tips untuk membedakan masing-masing\n\nSetelah ini aku akan drill bacaan di Tarteel.",
      },
      visual: {
        when: "Kamu visual learner — mau lihat peta hafalan secara jelas sebelum mulai baca.",
        steps: [
          "Minta AI buatkan 'peta hafalan' surah (struktur tema per kelompok ayat).",
          "Buka Tarteel, gunakan peta ini sebagai navigasi saat baca.",
          "Setiap kelompok ayat jadi satu unit drill.",
        ],
        starterPrompt: "Buatkan peta hafalan [SURAH] dalam format hierarki:\n- Kelompok ayat (misal: 1-7, 8-16, dll)\n- Tema tiap kelompok (1 kalimat)\n- Kata kunci pembuka tiap kelompok (teks Arab dengan harakat)\n\nIni akan aku pakai sebagai navigasi saat drill di Tarteel AI.",
      },
      practice: {
        when: "Latihan intensif hafalan — baca, koreksi, ulang. Ini mode utama Tarteel.",
        steps: [
          "Buka Tarteel → pilih mode 'Memorization' atau 'Challenge'.",
          "Mode Memorization: baca, Tarteel lanjutkan kalau kamu stuck — bantu mengingat.",
          "Mode Challenge: teks disembunyikan, kamu baca dari ingatan penuh.",
          "Tarteel langsung koreksi kalau ada kata yang salah — ulangi sampai benar.",
          "Setelah sesi, screenshot hasil sesi dan catat poin lemah di Kurasah.",
        ],
        starterPrompt: "Aku baru selesai sesi drill hafalan [SURAH] ayat [X–Y] di Tarteel. Hasil: ada [N] kesalahan di [sebutkan ayat/kata yang keliru].\n\nBantu aku:\n1. Analisis kenapa bagian itu sering keliru (pola tertentu?)\n2. Buat mnemonic atau trik untuk mengingat bagian itu\n3. Susun jadwal murajaah 7 hari ke depan untuk surah ini dengan spaced repetition",
      },
      memorization: {
        when: "Ini spesialisasi utama Tarteel — hafalan dengan AI yang mendengar dan mengoreksi secara real-time.",
        steps: [
          "Buka tarteel.ai → Login (akun gratis sudah cukup untuk fitur dasar).",
          "Pilih surah target → klik 'Memorize'.",
          "Tarteel tampilkan ayat satu per satu. Baca dengan suara. AI evaluasi.",
          "Kalau salah: Tarteel highlight kata yang keliru, ulangi sampai benar.",
          "Kalau stuck: Tarteel bisa baca 3 kata berikutnya sebagai isyarah (hint).",
          "Setelah khatam target: review statsnya — ayat mana yang paling sering salah.",
        ],
        starterPrompt: "Aku sedang menghafal [SURAH], target khatam dalam [X hari].\n\nBantu aku:\n1. Bagi [jumlah ayat] ayat menjadi paket harian yang masuk akal\n2. Waktu terbaik hafal vs murajaah (berdasarkan ilmu tahfidz klasik)\n3. Daftar 5 ayat yang paling rawan keliru di surah ini — tulis teks Arabnya dengan harakat\n4. Tanda-tanda tajwid khusus di surah ini yang perlu diperhatikan\n\nAku akan pakai Tarteel untuk drill praktisnya.",
      },
      reading: {
        when: "Kamu tipe yang suka baca tartil pelan-pelan dan dengar koreksi satu per satu — bukan drill cepat.",
        steps: [
          "Buka Tarteel → pilih mode 'Recitation' atau 'Listening'.",
          "Baca tartil, satu ayat per tarikan napas.",
          "Jangan buru-buru — biarkan Tarteel mengevaluasi tiap ayat.",
          "Kalau ada koreksi, berhenti, baca ulang ayat itu 3 kali baru lanjut.",
          "Di akhir, export atau catat ayat-ayat yang dapat koreksi.",
        ],
        starterPrompt: "Aku tipe yang suka baca tartil pelan dan teliti. Bantu aku persiapan sesi tilawah [SURAH]:\n\n1. Hukum tajwid yang paling dominan di surah ini\n2. Ayat-ayat yang punya bacaan khusus (gunnah panjang, ikhfa, dll) — tulis teks Arab\n3. Etika tilawah yang disarankan ulama sebelum mulai\n4. Doa sebelum tilawah\n\nSetelah persiapan ini, aku akan baca di Tarteel dengan santai.",
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
    addScore("tarteel", 5, "AI yang mendengar bacaanmu real-time dan koreksi tajwid langsung — spesialis hafalan");
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
    addScore("tarteel", 5, "hafalan interaktif dengan koreksi suara real-time — spesialis Qur'an");
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
    label: "Tholibun Jadid 🌱",
    icon: "🌱",
    color: "#6EE7B7",
    desc: "Mengenal AI, prompt dasar, dan etika penggunaan untuk pemula.",
    modules: [
      {
        id: "b1", title: "Apa itu AI & cara kerjanya", duration: "8 menit", kind: "Materi",
        content: {
          type: "materi",
          body: [
            { heading: "Apa itu AI?", text: "AI atau Artificial Intelligence adalah teknologi yang memungkinkan komputer memproses pertanyaan dan menghasilkan respons yang terasa seperti percakapan manusia. Jenis AI yang kita pakai sehari-hari — seperti ChatGPT, Claude, atau Gemini — disebut Large Language Model (LLM). Ia dilatih dari miliaran teks sehingga mampu memahami pertanyaanmu dan menjawab dengan kalimat yang koheren.\n\nSebagai thalib Azhari, bayangkan AI seperti ensiklopedia hidup yang bisa diajak bicara. Ia tahu sangat banyak hal, tapi tidak semua yang ia katakan itu benar atau akurat. Persis seperti bertanya kepada seseorang yang banyak membaca tapi belum pernah duduk di majlis ulama." },
            { heading: "Bagaimana AI 'berpikir'?", text: "AI tidak benar-benar 'berpikir' seperti manusia. Ia memprediksi kata berikutnya berdasarkan pola dari data pelatihannya. Ibarat kamu hafal ribuan bait syi'ir — ketika diberi satu baris, kamu bisa melanjutkannya dengan pola yang familiar. AI melakukan hal serupa, tapi dengan teks yang jauh lebih masif.\n\nImplikasinya penting: AI bisa sangat fasih menyusun kalimat, tapi tetap bisa salah dalam fakta. Ia bisa menyebut nama kitab yang tidak ada, atau mensandarkan pendapat kepada ulama yang tidak pernah mengatakannya. Ini yang para ahli sebut 'halusinasi' — tampak meyakinkan tapi bisa keliru." },
            { heading: "AI untuk thalib Azhari", text: "Di tangan yang tepat, AI bisa menjadi mu'in (penolong) belajar yang luar biasa. Ia bisa membantu menerjemahkan teks Arab yang musykil, meringkas bab yang panjang sebelum kamu baca lengkap, membuat soal latihan dari materi yang sudah dipelajari, atau menjadi lawan diskusi saat ingin menguji pemahaman.\n\nTapi ingat prinsip ini: AI adalah wasilah, bukan ghayah. Tujuanmu tetap tafahhum, internalisasi ilmu, dan amal. Setiap output AI tetap perlu diverifikasi ke kitab asli atau guru yang kamu percaya." },
          ],
          keyPoints: [
            "AI adalah alat bantu (wasilah), bukan pengganti syaikh atau talaqqi",
            "Jawaban AI bisa salah (halusinasi) — selalu verifikasi ke kitab atau guru",
            "AI paling berguna untuk: terjemah, ringkas, drill soal, dan diskusi pemahaman",
            "Semakin spesifik dan kontekstual promptmu, semakin relevan jawaban AI",
          ],
        },
      },
      {
        id: "b2", title: "Prompt pertamamu", duration: "10 menit", kind: "Praktik",
        content: {
          type: "praktik",
          intro: "Teori sudah cukup, sekarang waktunya praktik langsung. Prompt adalah instruksi yang kamu tulis ke AI — kualitas jawaban AI sangat bergantung pada seberapa jelas dan kontekstual promptmu. Ikuti 5 langkah berikut untuk membuat dan mencoba prompt pertamamu.",
          steps: [
            "Buka salah satu AI — rekomendasi untuk pemula: Claude (claude.ai) atau ChatGPT (chat.openai.com). Keduanya gratis untuk penggunaan dasar.",
            "Salin prompt contoh di bawah ke clipboard",
            "Paste di kolom chat AI pilihanmu, lalu ganti [TOPIK] dengan materi yang sedang kamu pelajari minggu ini (mis. 'pengertian mubtada dan khabar' atau 'syarat sah shalat')",
            "Kirim ke AI dan baca jawabannya dengan teliti — perhatikan istilah Arab yang muncul",
            "Bandingkan jawaban AI dengan pemahamanmu dari kelas atau kitab. Ada yang berbeda? Ada klaim yang perlu dicek ke sumber?",
          ],
          practicePrompt: "Aku thalib di Al-Azhar yang sedang belajar [TOPIK]. Tolong jelaskan konsep ini dengan bahasa yang mudah dipahami, sertakan istilah Arab aslinya dengan harakat, dan berikan 1 contoh konkret yang relate untuk mahasiswa Azhar. Jika ada dalil penting (ayat atau hadits), tulis teks Arabnya dengan harakat lengkap disertai terjemah.",
          checklistItems: [
            "Aku sudah membuka salah satu AI dan mencoba prompt di atas",
            "Aku sudah mengganti [TOPIK] dengan materi yang sedang kupelajari",
            "Aku sudah membandingkan jawaban AI dengan pemahamanku dari kelas atau kitab",
          ],
        },
      },
      {
        id: "b3", title: "Etika dasar pakai AI", duration: "6 menit", kind: "Materi",
        content: {
          type: "materi",
          body: [
            { heading: "AI sebagai wasilah, bukan ghayah", text: "Dalam tradisi keilmuan Islam, ilmu punya adab. Pakai AI pun ada adabnya. Prinsip pertama: AI adalah wasilah (sarana), bukan ghayah (tujuan akhir). Tujuanmu tetap tafahhum, internalisasi ilmu, dan pengamalan. AI hanya mempercepat proses itu.\n\nBahayanya kalau AI jadi tujuan: kamu mulai copy-paste jawaban AI tanpa memahami, mengumpulkan makalah yang bukan pikiranmu, dan kehilangan proses belajar yang justru lebih berharga dari hasilnya." },
            { heading: "Tiga adab penting", text: "Pertama — jangan submit karya AI sebagai karyamu sendiri tanpa transformasi pemikiran. Ini amanah akademik yang harus dijaga, dan lebih dari itu, kamu merugikan dirimu sendiri.\n\nKedua — jangan jadikan AI sebagai satu-satunya rujukan untuk masalah syar'i. Selalu verifikasi ke ulama, guru, atau kitab mutamad.\n\nKetiga — jangan lewatkan proses manual. Kalau kamu hanya 'membaca lewat AI' tanpa menulis ulang, menghafal, atau mendiskusikan, keilmuanmu tidak akan mengendap jadi pemahaman yang melekat." },
            { heading: "Kejujuran adalah kunci", text: "Saat AI memberi jawaban yang tampak keren tapi kamu tidak mengerti, jangan diam. Tanya lagi: 'Aku tidak paham bagian ini, tolong jelaskan lebih sederhana.' Kesempatan belajar ada justru di saat kamu jujur dengan kebingunganmu sendiri.\n\nDan ketika AI ternyata salah — yang akan kamu temukan kalau rajin verifikasi — itu justru momen belajar terbaik. Kamu bisa analisis kenapa AI salah, dan apa yang benar menurut kitab. Ini melatih nalar kritis yang jauh lebih berharga." },
          ],
          keyPoints: [
            "AI adalah wasilah — proses belajar manual (menulis, menghafal, diskusi) tidak tergantikan",
            "Jangan submit output AI mentah sebagai karyamu sendiri",
            "Verifikasi selalu, terutama untuk masalah syar'i dan nama kitab/ulama",
            "Gunakan AI untuk memperdalam pemahaman, bukan mempersingkat proses berpikir",
          ],
        },
      },
      {
        id: "b4", title: "Tools mana untuk apa?", duration: "12 menit", kind: "Tour",
        content: {
          type: "tour",
          intro: "Ada 5 AI utama yang paling berguna untuk thalib Azhari. Masing-masing punya kelebihan yang berbeda. Kenali kapan pakai yang mana — ini akan menghemat banyak waktu.",
          stops: [
            { tool: "claude",      title: "Claude — untuk teks panjang & analisis mendalam",  body: "Paling cocok untuk: menganalisis teks Arab klasik, i'rab, syarah kitab, menulis makalah, dan diskusi konsep mendalam. Kelebihan utama: konteks sangat panjang (bisa baca puluhan halaman sekaligus), akurat untuk nuansa bahasa, jujur saat tidak tahu." },
            { tool: "chatgpt",     title: "ChatGPT — serba bisa, paling familiar",             body: "Paling cocok untuk: tanya jawab umum, latihan soal, drill hafalan via mode suara, brainstorming. Kelebihan utama: cepat, fleksibel, banyak pengguna sehingga banyak tips tersedia. Mode suara cocok untuk sesi tasmi' darurat." },
            { tool: "notebooklm", title: "NotebookLM — drill dari kitabmu sendiri",            body: "Paling cocok untuk: upload PDF kitab → tanya-jawab berbasis kitab tersebut. Tidak akan halusinasi karena semua jawaban merujuk ke sumber yang kamu upload. Ideal untuk murajaah matan atau tafahhum kitab matkul." },
            { tool: "gemini",      title: "Gemini — OCR foto kitab & info terkini",            body: "Paling cocok untuk: foto halaman kitab yang tulisannya kecil (OCR), cari informasi terkini, terjemahan cepat. Kelebihan: terhubung ke Google Search, bisa baca gambar/foto secara langsung." },
            { tool: "perplexity",  title: "Perplexity — riset dengan sitasi",                  body: "Paling cocok untuk: cari rujukan akademis, verifikasi klaim, riset awal sebelum tulis makalah. Kelebihan: setiap jawaban disertai link sumber yang bisa diklik dan dicek. Tidak akan menyebut sumber fiktif." },
          ],
        },
      },
      {
        id: "b5", title: "Workflow harian sederhana", duration: "10 menit", kind: "Praktik",
        content: {
          type: "praktik",
          intro: "Kamu sudah tahu AI apa saja dan cara dasar pakai prompt. Sekarang: bagaimana integrasikan AI ke rutinitas belajar harian tanpa malah jadi distraksi? Berikut workflow sederhana yang bisa langsung dipraktikkan hari ini.",
          steps: [
            "Sebelum kuliah/dars: buka ChatGPT atau Claude, minta ringkasan 5 poin materi yang akan dipelajari hari ini. Ini 'peta' yang bikin kamu lebih aktif saat dars.",
            "Saat ada istilah Arab yang tidak dipahami di kelas: catat dulu, lalu setelah dars tanya ke AI — 'Apa arti [istilah] dalam konteks ilmu [nama maddah]?'",
            "Malam sebelum tidur (10 menit): salin prompt di bawah ke AI, isi [MATERI] dengan yang baru dipelajari, lalu jawab 3 pertanyaan yang AI buat. Ini 'review aktif' yang lebih efektif dari sekadar membaca ulang.",
            "Setiap akhir pekan: minta AI buat soal ujian 5 nomor gaya Azhari dari materi minggu ini. Kerjakan tanpa lihat catatan, koreksi bersama AI.",
            "Atur batas: maksimal 30 menit AI per hari untuk belajar. Sisanya tetap baca kitab dan ulang dengan tangan.",
          ],
          practicePrompt: "Aku baru selesai belajar [MATERI]. Buat 3 pertanyaan singkat (gaya tanya imtihan Azhari) untuk menguji pemahamanku. Jangan kasih jawaban dulu. Setelah aku jawab, koreksi dan jelaskan dengan menyebut istilah Arab relevan yang perlu aku hafal.",
          checklistItems: [
            "Aku sudah mencoba workflow 'sebelum kuliah' hari ini",
            "Aku sudah mencoba prompt review aktif di atas untuk materi hari ini",
          ],
        },
      },
    ],
  },
  {
    id: "intermediate",
    level: "Intermediate",
    label: "Bertumbuh",
    icon: "🌿",
    color: "#A07BFA",
    desc: "Workflow untuk memahami kitab klasik, menulis makalah, dan murajaah sistematis.",
    modules: [
      {
        id: "i1", title: "Bedah matan klasik dengan AI", duration: "15 menit", kind: "Praktik",
        content: {
          type: "praktik",
          intro: "Membedah matan klasik bukan sekadar terjemah — ini proses merangkai konteks, menemukan kaidah, dan menghubungkan dengan syarah. AI bisa menjadi partner yang sangat berguna dalam proses ini. Berikut workflow teruji untuk bedah matan bersama AI.",
          steps: [
            "Pilih satu baris atau satu paragraf matan yang sedang dipelajari (jangan langsung satu halaman penuh)",
            "Buka Claude (paling direkomendasikan untuk teks Arab klasik)",
            "Salin teks Arab matan-nya ke prompt di bawah — kalau tidak bisa ketik Arab, foto dan gunakan Gemini untuk OCR dulu",
            "Baca output AI: tarjamah → parafrase → istilah teknis. Tandai bagian yang belum kamu pahami",
            "Tanyakan bagian yang musykil: 'Apa maksud kalimat ini lebih detail?' atau 'Bagaimana ulama syafi'iyyah memahami istilah ini?'",
            "Setelah selesai, tulis ulang pemahaman utama dengan kata-katamu sendiri di Kurasah",
          ],
          practicePrompt: "Aku thalib Azhari sedang mutala'ah teks berikut dari kitab [NAMA KITAB]:\n\n[PASTE TEKS ARAB]\n\nLakukan analisis bertahap:\n1. Tarjamah harfiyyah (terjemahan kata per kata)\n2. Tarjamah ma'nawiyyah (parafrase akademik)\n3. Syarh al-mustalahat — jelaskan setiap istilah teknis: tulis Arab + transliterasi + definisi\n4. Maqsud al-mu'allif (inti yang ingin disampaikan penulis) dalam 1 kalimat\n\nBila ada bagian ambigu, sebutkan dan tawarkan dua kemungkinan penafsiran.",
          checklistItems: [
            "Aku sudah mencoba workflow ini dengan satu paragraf matan aktual",
            "Aku sudah menulis ulang pemahaman utamaku dengan kata-kataku sendiri",
          ],
        },
      },
      {
        id: "i2", title: "Outline makalah standar Azhari", duration: "18 menit", kind: "Praktik",
        content: {
          type: "praktik",
          intro: "Makalah Azhari punya struktur khas: muqaddimah → tanwir al-maudhu' → 'ardh al-masa'il → tahlil wa munaqasyah → khulasah. AI bisa membantu dari tahap outline sampai revisi akhir — tapi pemikiran dan argumennya tetap harus dari kamu. Berikut workflow langkah per langkah.",
          steps: [
            "Tulis topik makalahmu dalam satu kalimat yang jelas (mis. 'Hukum shalat di atas kendaraan menurut mazhab empat')",
            "Gunakan prompt di bawah untuk minta AI buatkan kerangka awal — ini draft, bukan final",
            "Evaluasi outline yang AI buat: apakah urutannya logis? Ada sub-tema yang terlewat?",
            "Minta AI mengembangkan satu bagian yang paling sulit (biasanya bagian tahlil/analisis)",
            "Untuk setiap pendapat ulama yang muncul, verifikasi ke kitab atau minta Perplexity cari sumber aslinya",
            "Tulis makalah final dengan kata-katamu sendiri — jangan copy-paste dari AI",
          ],
          practicePrompt: "Aku thalib Azhari menulis makalah tentang: [TOPIK MAKALAH]\n\nBuatkan outline standar makalah Azhari dengan struktur:\n1. Muqaddimah (latar belakang, pertanyaan penelitian, metodologi)\n2. Tanwir al-Maudhu' (definisi istilah kunci + pembatasan masalah)\n3. 'Ardh al-Masa'il (sajian pendapat-pendapat, setiap pendapat: dalil + wajh istidlal + nama ulama + kitab rujukan dalam Arab)\n4. Tahlil wa Munaqasyah (analisis komparatif, kekuatan-kelemahan setiap pendapat)\n5. Khulasah (kesimpulan tanpa mentarjih, atau dengan tarjih + alasan)\n\nUntuk setiap pendapat ulama, sertakan nama kitab rujukan dalam bahasa Arab.",
          checklistItems: [
            "Aku sudah membuat outline makalahku menggunakan workflow ini",
            "Aku sudah memverifikasi minimal satu rujukan ulama yang muncul di outline",
          ],
        },
      },
      {
        id: "i3", title: "Sistem murajaah spaced repetition", duration: "12 menit", kind: "Praktik",
        content: {
          type: "praktik",
          intro: "Spaced repetition adalah metode ilmiah paling efektif untuk hafalan jangka panjang — ulang materi di interval waktu yang semakin jauh. AI bisa membantu membuat jadwal dan sesi drill yang tepat. Ini bukan pengganti muraja'ah manual, tapi booster-nya.",
          steps: [
            "Tentukan: apa yang ingin kamu hafal? (surat, matan, istilah teknis per maddah, bait syi'ir)",
            "Gunakan prompt di bawah untuk minta AI buat jadwal spaced repetition 21 hari",
            "Simpan jadwal di Kurasahmu — tulis tanggal konkret, bukan hanya 'hari 1, hari 3'",
            "Setiap sesi murajaah: buka ChatGPT mode suara, atau ketik ke Claude, lakukan sesi tasmi' (AI sebut potongan, kamu lanjutkan)",
            "Catat mawadhi' (bagian) yang paling sering ragu — ini yang perlu intensitas lebih",
            "Setiap 7 hari, minta AI buat tes dadakan tanpa melihat catatan",
          ],
          practicePrompt: "Aku thalib Azhari menghafal [SEBUTKAN: nama surat/matan/materi — sertakan nama Arab jika matan] dengan target khatam dalam [X hari/X minggu].\n\nBuatkan:\n1. Jadwal spaced repetition 21 hari dalam tabel: | Hari | Bagian | Durasi | Jenis Aktivitas |\n2. 3 poin yang biasanya paling bikin ragu beserta mnemonic Arab-nya\n3. Saran adab dan waktu optimal murajaah (ba'da Fajr, ba'da 'Asr, dll)\n\nSetelah jadwal, langsung mulai sesi tasmi': sebut potongan dengan harakat, aku lanjutkan. Jika aku ragu, beri isyarah (3 huruf pertama kata selanjutnya).",
          checklistItems: [
            "Aku sudah membuat jadwal spaced repetition untuk satu materi hafalanku",
            "Aku sudah mencoba satu sesi tasmi' dengan AI hari ini",
          ],
        },
      },
      {
        id: "i4", title: "Latihan i'rab interaktif", duration: "20 menit", kind: "Praktik",
        content: {
          type: "praktik",
          intro: "I'rab adalah keterampilan yang butuh drill berulang, bukan sekadar teori. AI — terutama Claude — sangat baik sebagai partner drill i'rab: ia bisa memberi soal bergradasi, mengoreksi dengan menyebut kaidah yang dilanggar, dan merujuk ke matan nahwu standar. Ini sesi drill yang paling mendekati kualitas koreksi manual ustadz.",
          steps: [
            "Buka Claude — paling direkomendasikan untuk drill i'rab karena ketelitiannya",
            "Salin prompt di bawah dan kirim ke AI",
            "Kerjakan setiap jumlah secara berurutan — tulis i'rab lengkap (nama i'rab + alasan + kaidah)",
            "Kirim semua jawaban sekaligus setelah selesai",
            "Baca koreksi AI dengan teliti — catat kaidah yang kamu langgar",
            "Minta soal tambahan khusus untuk pola yang kamu buat salah",
          ],
          practicePrompt: "Aku thalib Azhari mau drill i'rab. Beri 7 jumlah Arab dengan tingkat bertahap:\n\n- Jumlah 1-2: ismiyyah/fi'liyyah basit (mubtada'-khabar, fi'l-fa'il-maf'ul)\n- Jumlah 3-4: mengandung syibh al-jumlah, hal, atau tamyiz\n- Jumlah 5-6: mengandung naskh (kana wa akhawatiha atau inna wa akhawatiha)\n- Jumlah 7: tarkib murakkab dengan idafah berlapis atau jumlah fi mahall\n\nTulis setiap jumlah dengan harakat lengkap. Jangan kasih jawaban.\n\nSetelah aku i'rab semua, koreksi dengan:\n- Sebut kaidah yang dilanggar (jika ada)\n- Rujukan ke: Alfiyat Ibn Malik, Al-Ajurrumiyyah, atau Qatr al-Nada\n- Penjelasan cara bedakan i'rab yang sering rancu",
          checklistItems: [
            "Aku sudah menyelesaikan minimal 5 jumlah dan mendapatkan koreksi AI",
            "Aku sudah mencatat kaidah yang paling sering aku langgar",
          ],
        },
      },
      {
        id: "i5", title: "Perbandingan mazhab terstruktur", duration: "15 menit", kind: "Materi",
        content: {
          type: "materi",
          body: [
            { heading: "Mengapa perbandingan mazhab butuh metodologi?", text: "Muqaranah al-madzahib bukan sekadar daftar pendapat lalu pilih yang paling mudah. Ini ilmu yang punya adab dan metodologi. Tujuannya memahami dalil dan wajh istidlal di balik setiap pendapat — bukan mencari 'rukhshah shopping'.\n\nDengan AI, kamu bisa lebih cepat menyusun kerangka perbandingan. Tapi filter kritis tetap harus kamu pakai: nama kitab harus diverifikasi, dalil harus dicek ke sumber aslinya." },
            { heading: "Framework 4 kolom", text: "Format paling efektif untuk muqaranah via AI adalah tabel 4 kolom:\n\n| Mazhab | Hukum | Dalil Utama | Wajh Istidlal |\n\nMinta AI mengisi tabel ini untuk masalah yang sedang kamu pelajari. Setelah dapat tabelnya, pindah ke kolom kelima yang kamu isi sendiri: 'Catatan Aku' — apa yang menarik, apa yang perlu diverifikasi, pertanyaan yang belum terjawab.\n\nProses menulis kolom terakhir ini adalah di mana sesungguhnya tafahhum terbentuk." },
            { heading: "Batas etis perbandingan mazhab", text: "Ada dua hal yang tidak boleh dilakukan dengan output AI muqaranah:\n\nPertama, jangan jadikan tabel AI sebagai dasar fatwa atau kesimpulan syar'i. Output AI adalah titik awal riset, bukan kesimpulan.\n\nKedua, jangan mentarjih (memilih pendapat terkuat) berdasarkan argumen AI saja — tarjih membutuhkan penguasaan ilmu alat yang mendalam dan konsultasi dengan ulama. Sajikan semua pendapat secara adil, dan biarkan guru atau masyaikhmu yang membimbing proses tarjih." },
          ],
          keyPoints: [
            "Muqaranah adalah memahami dalil di balik setiap pendapat, bukan mencari yang termudah",
            "Format tabel 4 kolom (Mazhab | Hukum | Dalil | Wajh Istidlal) paling efektif untuk AI",
            "Verifikasi nama kitab dan dalil ke sumber asli — AI bisa salah dalam detail ini",
            "Jangan gunakan output AI untuk dasar fatwa atau tarjih mandiri",
          ],
        },
      },
    ],
  },
  {
    id: "advanced",
    level: "Advanced",
    label: "Siap menjelajah",
    icon: "🕌",
    color: "#E5C18A",
    desc: "Riset akademik tingkat lanjut, multi-AI workflow, dan produktivitas kelas pakar.",
    modules: [
      {
        id: "a1", title: "Multi-AI workflow (Claude + Perplexity + NotebookLM)", duration: "25 menit", kind: "Tour",
        content: {
          type: "tour",
          intro: "Menggunakan 3 AI sekaligus bukan berarti kerja tiga kali lipat — justru setiap AI mengisi peran yang berbeda. Inilah pipeline paling kuat untuk riset akademik tingkat Azhari.",
          stops: [
            { tool: "perplexity", title: "Tahap 1: Perplexity — Peta & Sumber Awal",    body: "Mulai dengan Perplexity untuk 'peta wilayah': apa saja sudut pandang akademis yang ada tentang topik ini? Siapa tokoh-tokoh utamanya? Apa kitab/jurnal yang paling sering dikutip? Simpan list sumber yang Perplexity rekomendasikan — semuanya ada link-nya untuk diverifikasi." },
            { tool: "notebooklm", title: "Tahap 2: NotebookLM — Gali dari Sumber Primer", body: "Upload kitab-kitab utama yang sudah kamu temukan ke NotebookLM. Sekarang tanya langsung berbasis sumber primermu: 'Bagaimana kitab X membahas topik Y? Halaman berapa?' NotebookLM hanya akan menjawab dari apa yang kamu upload — zero halusinasi." },
            { tool: "claude",     title: "Tahap 3: Claude — Analisis & Sintesis Mendalam", body: "Bawa temuan dari Perplexity dan NotebookLM ke Claude. Minta Claude melakukan analisis komparatif, menemukan kontradiksi antar sumber, dan membantu kamu menyusun argumen. Claude paling kuat untuk tahap ini karena kemampuannya memproses konteks panjang dan menghasilkan analisis bernuansa." },
          ],
        },
      },
      {
        id: "a2", title: "Gap analysis untuk topik makalah", duration: "18 menit", kind: "Praktik",
        content: {
          type: "praktik",
          intro: "Gap analysis adalah proses menemukan 'apa yang belum diteliti atau dibahas' dalam suatu topik — ini kunci makalah yang punya kontribusi orisinal. AI bisa mempercepat proses ini secara signifikan.",
          steps: [
            "Tentukan topik makalah spesifik (semakin spesifik, gap analysis-nya semakin tajam)",
            "Gunakan Perplexity untuk peta awal: siapa yang sudah menulis tentang topik ini, apa argumen utama mereka?",
            "Gunakan prompt di bawah di Claude untuk analisis kesenjangan yang lebih mendalam",
            "Baca output dengan kritis: apakah 'gap' yang AI temukan benar-benar gap, atau hanya kamu/AI yang belum tahu literaturnya?",
            "Verifikasi ke koleksi tesis/disertasi Al-Azhar atau database jurnal Islam (JSTOR, Al-Manhal) untuk konfirmasi",
            "Pilih satu gap yang paling relevan dengan kapasitas dan sumber daya yang kamu punya — bukan yang paling ambisius",
          ],
          practicePrompt: "Aku thalib Azhari menulis makalah tentang [TOPIK SPESIFIK]. Bantu aku lakukan gap analysis:\n\n1. Apa saja sudut pandang yang sudah banyak dibahas (al-masail al-mukarrarah)?\n2. Apa sudut pandang yang masih jarang atau belum dibahas secara memadai?\n3. Apa kontradiksi atau ketegangan dalam literatur yang ada?\n4. Usulan 3 angle orisinal yang bisa aku pilih — urutkan dari yang paling feasible untuk tingkat thalib Azhari\n\nSertakan nama kitab/jurnal dalam bahasa Arab untuk setiap klaim tentang literatur yang ada.",
          checklistItems: [
            "Aku sudah melakukan gap analysis untuk topik makalahku",
            "Aku sudah memverifikasi gap yang ditemukan ke minimal satu sumber akademis",
          ],
        },
      },
      {
        id: "a3", title: "Pipeline riset jurnal kontemporer", duration: "20 menit", kind: "Praktik",
        content: {
          type: "praktik",
          intro: "Riset kontemporer berbeda dengan riset kitab klasik — sumber tersebar di jurnal digital, database akademis, dan repositori online. AI bisa menjadi navigator yang sangat efisien untuk lanskap ini.",
          steps: [
            "Tentukan kata kunci risetmu dalam dua bahasa: Indonesia/Inggris dan Arab (penting: banyak jurnal Azhari hanya dalam Arab)",
            "Mulai di Perplexity dengan kata kunci tersebut — minta mode 'Academic' untuk prioritas jurnal peer-reviewed",
            "Gunakan Google Scholar langsung dengan kata kunci Arab untuk menemukan disertasi dan tesis Azhari",
            "Untuk setiap paper yang relevan, gunakan prompt di bawah di Claude untuk ekstraksi cepat argumen utama",
            "Bangun database sitasi personal di Kurasah: judul | penulis | tahun | argumen utama | link",
            "Sebelum finalisasi, minta Perplexity cross-check: 'Apakah ada literatur terbaru (2020-2026) yang membahas [TOPIK] yang belum aku cover?'",
          ],
          practicePrompt: "Aku thalib Azhari sedang riset tentang [TOPIK]. Bantu aku ekstraksi dari abstract/paper berikut:\n\n[PASTE ABSTRACT ATAU BAGIAN PAPER]\n\nEkstraksikan:\n1. Tesis utama penulis dalam satu kalimat\n2. Metodologi yang digunakan\n3. Temuan atau kesimpulan utama\n4. Kritik atau limitasi yang penulis sendiri akui\n5. Relevansi untuk topik risetku\n6. Apakah ada istilah Arab teknis yang digunakan? Jika ya, tulis dengan harakat dan transliterasi\n\nBeri rating relevansi 1-5 dan alasannya.",
          checklistItems: [
            "Aku sudah menemukan minimal 3 jurnal/paper relevan menggunakan pipeline ini",
            "Aku sudah membuat catatan sitasi di Kurasah untuk setiap sumber",
          ],
        },
      },
      {
        id: "a4", title: "Sistem produktivitas Masisir", duration: "15 menit", kind: "Materi",
        content: {
          type: "materi",
          body: [
            { heading: "Tantangan produktivitas unik Masisir", text: "Hidup di Kairo sebagai Masisir punya tantangan produktivitas yang berbeda: antara kuliah pagi di Azhar, muthala'ah kitab, menulis makalah, hafalan, dan tekanan sosial komunitas yang padat. Sebagian besar tools produktivitas populer tidak dirancang untuk konteks ini.\n\nKunci utama: jangan coba replicate sistem produktivitas YouTuber Barat. Bangun sistem yang sesuai dengan ritme Azhari — shalat berjamaah sebagai anchor waktu, istirahat qailulah, dan energi yang berbeda antara sebelum dan sesudah Dzuhur." },
            { heading: "Framework AI untuk produktivitas harian", text: "Tiga peran AI yang paling mengubah permainan:\n\nPertama, AI sebagai 'briefing pagi': 5 menit sebelum kuliah, minta Claude atau ChatGPT ringkasan materi hari ini. Ini membuat otakmu dalam mode 'aktif menerima', bukan 'pasif mendengarkan'.\n\nKedua, AI sebagai 'debrief malam': 10 menit sebelum tidur, ceritakan ke AI apa yang kamu pelajari hari ini. Proses menjelaskan ulang ini (feynman technique) adalah cara terkuat mengonsolidasi memori.\n\nKetiga, AI sebagai 'blocker writer's block': saat mandek menulis makalah, ceritakan ide utamamu ke AI secara lisan (voice-to-text), biarkan AI menyusunnya jadi outline — lalu kembangkan sendiri." },
            { heading: "Batasan yang harus dijaga", text: "Justru karena AI sangat berguna, mudah terjebak menggunakannya terlalu banyak. Tetapkan batas yang jelas:\n\nWaktu maksimal AI per hari: 45-60 menit untuk keperluan akademik. Di luar itu, baca kitab secara manual.\n\nZona bebas AI: saat dars dengan guru/syaikh, saat murajaah hafalan inti, saat menulis draft pertama esai. Ini proses yang nilainya ada di kesulitannya — jangan shortcut dengan AI.\n\nAI-free day: satu hari per minggu tanpa AI untuk belajar. Ini menjaga ketergantungan tetap sehat." },
          ],
          keyPoints: [
            "Gunakan shalat berjamaah sebagai anchor waktu, bukan timer aplikasi",
            "Tiga peran AI terbaik: briefing pagi, debrief malam, blocker writer's block",
            "Batas wajib: maks 60 menit AI/hari untuk belajar, satu AI-free day per minggu",
            "Proses yang sulit (nulis draft, murajaah manual) adalah di mana nilai belajar yang sesungguhnya ada",
          ],
        },
      },
      {
        id: "a5", title: "Audit kualitas output AI", duration: "12 menit", kind: "Materi",
        content: {
          type: "materi",
          body: [
            { heading: "Mengapa output AI perlu diaudit?", text: "AI tingkat advanced pun masih bisa — dan sering — menghasilkan error yang tidak langsung terlihat. Di konteks keilmuan Islam, error ini bisa berupa: nama kitab yang tidak ada, pendapat yang disandarkan ke ulama yang tidak pernah mengatakannya, hadits yang dikutip dengan redaksi yang tidak tepat, atau nomor halaman yang fiktif.\n\nThalib Azhari yang sudah di level advanced justru lebih rentan terhadap jebakan ini, karena semakin percaya pada AI setelah sering mendapat jawaban yang baik." },
            { heading: "Checklist audit 5 poin", text: "Setiap kali menggunakan output AI untuk keperluan akademik serius, jalankan checklist ini:\n\n1. Nama kitab: apakah ada di katalog perpustakaan Azhari atau maktabah syamilah?\n2. Penisbatan ulama: apakah pendapat ini benar dari ulama yang disebutkan? Cek di kitabnya langsung.\n3. Teks Arab: bila ada ayat atau hadits, cocokkan dengan mushaf/kutub hadits resmi. AI kadang menulis harakat yang salah.\n4. Nomor halaman (jika disebutkan): verifikasi ke kitab asli — AI sangat sering salah di sini.\n5. Konsistensi internal: apakah ada kontradiksi dalam satu output AI yang sama?" },
            { heading: "Strategi verifikasi efisien", text: "Untuk verifikasi efisien tanpa menghabiskan terlalu banyak waktu:\n\nGunakan NotebookLM: upload kitab yang dirujuk AI, lalu tanya 'Apakah pendapat ini ada di kitab ini? Di halaman mana?' Ini verifikasi berbasis sumber primer yang cepat.\n\nGunakan Perplexity: untuk verifikasi claims faktual umum, Perplexity paling transparan karena selalu menyertakan link sumber.\n\nAturan praktis: semakin spesifik sebuah klaim (nama ulama + kitab + halaman), semakin kritis kamu harus verifikasi. Klaim umum lebih aman daripada klaim sangat spesifik yang ternyata fiktif." },
          ],
          keyPoints: [
            "Error AI yang paling berbahaya: nama kitab fiktif, penisbatan pendapat yang salah, nomor halaman karangan",
            "Jalankan checklist 5 poin untuk setiap output AI yang dipakai di karya akademik",
            "NotebookLM + Perplexity adalah kombinasi terkuat untuk verifikasi cepat",
            "Semakin spesifik klaim AI, semakin kritis kamu harus memverifikasi",
          ],
        },
      },
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

/* ============ EXPORTS ============ */
Object.assign(window, {
  STRUGGLES, FIELDS, FACULTIES, LEVELS, LEARNING_STYLES,
  AI_TOOLS, recommend,
  LEARNING_PATHS, allModules,
  ETHICS_POINTS,
  DEFAULT_MEMBERS,
  getMahadStruggles,
});
