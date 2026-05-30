/* Talqih — Ma'had Al-Azhar Maddah Data
   16 kartu Maddah khusus pelajar Ma'had Al-Azhar (usia 12-18).
   Di-append ke MADDAHS array setelah maddah-data.jsx selesai dimuat.
*/

const MAHAD_MADDAHS = [

  /* ============================================================
     KELOMPOK 1: MADDAH AGAMA (6 kartu) — I'dadi & Tsanawi
     ============================================================ */

  {
    id: "mahad-quran-tajwid",
    name: "Al-Qur'an & Tajwid",
    nameArabic: "القرآن الكريم والتجويد",
    category: "mahad",
    isMahad: true,
    mahadSubcat: "agama",
    mahadFor: ["idadi", "tsanawi"],
    fakultas: ["mahad"],
    tingkat: ["idadi", "tsanawi"],
    description: "Hafalan, tilawah, dan kaidah tajwid — fondasi utama di Ma'had Al-Azhar",
    recommendedAI: [
      { tool: "notebooklm", rank: 1, strength: "Upload rekaman murattal sebagai sumber belajar", why: "NotebookLM membantu kamu membuat catatan dan quiz dari materi yang kamu upload" },
      { tool: "claude",      rank: 2, strength: "Jelaskan kaidah tajwid & buat jadwal tahfizh",  why: "Claude bagus untuk penjelasan bertahap dan pembuatan rencana belajar yang terstruktur" },
    ],
    prompts: {
      pahami: [
        {
          title: "Pahami Kaidah Tajwid",
          targetAI: "claude",
          template: `Aku pelajar [TINGKATAN] di Ma'had Al-Azhar.

Tolong jelaskan kaidah tajwid berikut dengan detail:
[TULIS NAMA KAIDAH — contoh: Ikhfa', Idgham Bi Ghunnah, Mad Wajib Muttashil]

Jelaskan:
1. Apa itu kaidah ini? (definisi dalam bahasa Indonesia yang mudah)
2. Kapan kaidah ini berlaku? (ciri-ciri dan syaratnya)
3. Contoh dari Al-Qur'an — tulis ayat dengan harakat + nama surah
4. Cara melafalkan yang benar
5. Bedanya dengan kaidah yang mirip (kalau ada)

Gunakan bahasa Indonesia yang mudah dipahami pelajar SMP-SMA.`,
        },
        {
          title: "Identifikasi Hukum Tajwid dalam Ayat",
          targetAI: "claude",
          template: `Aku pelajar [TINGKATAN] di Ma'had Al-Azhar, sedang belajar Tajwid.

Analisis ayat berikut dan temukan semua hukum tajwidnya:
[PASTE AYAT DENGAN HARAKAT LENGKAP]

Untuk setiap hukum tajwid yang ditemukan, sebutkan:
- Kata atau huruf yang dimaksud
- Nama hukum tajwidnya
- Alasan kenapa termasuk hukum itu
- Cara bacanya

Sajikan dalam tabel atau poin yang rapi.`,
        },
      ],
      hafal: [
        {
          title: "Jadwal Tahfizh Harian",
          targetAI: "claude",
          template: `Aku pelajar [TINGKATAN] di Ma'had Al-Azhar, program tahfizh.

Target hafalanku: [TULIS TARGET — contoh: Juz 30 dalam 3 bulan, Surah Al-Baqarah ayat 1-50]
Waktu yang bisa aku alokasikan: [TULIS WAKTU — contoh: 1 jam pagi, 30 menit setelah Ashar]
Posisi hafalanku sekarang: [TULIS SURAH/JUZ TERAKHIR]

Buatkan:
1. Jadwal harian yang realistis (berapa ayat per hari)
2. Teknik menghafal yang efektif (chunking, pengulangan, dll)
3. Sistem muraja'ah agar tidak cepat lupa
4. Tips mengatasi ayat yang susah dihafal`,
        },
      ],
      latihan: [
        {
          title: "Drill Kaidah Tajwid",
          targetAI: "claude",
          template: `Aku pelajar [TINGKATAN] di Ma'had Al-Azhar, latihan Tajwid.

Kaidah yang sedang kupelajari: [TULIS KAIDAH]

Beri 5 soal latihan:
- Setiap soal: tampilkan potongan ayat berharakat
- Aku akan menjawab hukum tajwidnya
- Koreksi jawabanku dan jelaskan yang keliru

Mulai soal pertama sekarang.`,
        },
      ],
      ujian: [
        {
          title: "Mock Ujian Tajwid",
          targetAI: "claude",
          template: `Aku pelajar [TINGKATAN] di Ma'had Al-Azhar, persiapan ujian Tajwid.

Bab yang akan diujikan: [TULIS BAB — atau: "semua kaidah dasar"]

Buat soal ujian (8 soal):
- 3 soal: definisi hukum tajwid
- 4 soal: identifikasi hukum dalam ayat berharakat
- 1 soal: bedakan dua kaidah yang mirip

Berikan kunci jawaban lengkap setelah aku mencoba menjawab semua soal.`,
        },
      ],
    },
  },

  {
    id: "mahad-tauhid-aqidah",
    name: "Tauhid & Aqidah",
    nameArabic: "التوحيد والعقيدة",
    category: "mahad",
    isMahad: true,
    mahadSubcat: "agama",
    mahadFor: ["idadi", "tsanawi"],
    fakultas: ["mahad"],
    tingkat: ["idadi", "tsanawi"],
    description: "Dasar-dasar keyakinan Islam sesuai manhaj Al-Azhar level Ma'had",
    recommendedAI: [
      { tool: "claude",  rank: 1, strength: "Jelaskan konsep aqidah dengan bahasa mudah", why: "Claude mampu menjelaskan konsep abstrak teologi dengan analogi yang mudah dipahami remaja" },
      { tool: "gemini",  rank: 2, strength: "Bantu hafal matan dan buat quiz aqidah",    why: "Gemini bagus untuk membuat soal-soal latihan dan drill hafalan" },
    ],
    prompts: {
      pahami: [
        {
          title: "Pahami Konsep Tauhid",
          targetAI: "claude",
          template: `Aku pelajar [TINGKATAN] di Ma'had Al-Azhar, belajar Tauhid & Aqidah.

Tolong jelaskan konsep berikut dengan bahasa yang mudah dipahami:
[TULIS KONSEP — contoh: Tauhid Uluhiyyah, Asmaul Husna, Sifat Wajib Allah, Perbedaan Islam-Iman-Ihsan]

Sertakan:
1. Penjelasan dalam bahasa Indonesia yang jelas dan mudah
2. Dalil dari Al-Qur'an atau Hadits — tulis teks Arab berharakat + terjemahannya
3. Contoh konkret dalam kehidupan sehari-hari
4. Kesalahpahaman umum yang perlu dihindari
5. Hubungan konsep ini dengan keimanan seorang Muslim

Ingat: aku pelajar Ma'had, bukan mahasiswa. Jelaskan dengan cara yang sesuai usia.`,
        },
        {
          title: "Bedah Matan Aqidah",
          targetAI: "claude",
          template: `Aku pelajar [TINGKATAN] di Ma'had Al-Azhar, belajar Aqidah.

Ini penggalan matan/teks aqidah dari kitabku:
[PASTE TEKS ARAB — boleh dengan atau tanpa harakat]

Tolong jelaskan:
1. Terjemahan kata per kata (mufradat penting)
2. Maksud keseluruhan teks
3. Apa konsep aqidah yang dibahas
4. Contoh konkret dari dalil Al-Qur'an atau Sunnah

Gunakan bahasa Indonesia yang mudah.`,
        },
      ],
      hafal: [
        {
          title: "Drill Hafal Sifat Wajib & Mustahil Allah",
          targetAI: "claude",
          template: `Aku pelajar [TINGKATAN] di Ma'had Al-Azhar, sedang menghafal sifat-sifat Allah.

Yang ingin kuhafal: [TULIS — contoh: 20 Sifat Wajib Allah, Sifat Mustahil, atau Sifat Jaiz]

Buatkan:
1. Tabel lengkap: nama sifat (Arab) → arti → penjelasan singkat
2. Mnemonic atau cara mudah menghafal urutan sifat-sifatnya
3. 5 pertanyaan drill untuk mengetes hafalanku`,
        },
      ],
      latihan: [
        {
          title: "Latihan Soal Aqidah",
          targetAI: "gemini",
          template: `Aku pelajar [TINGKATAN] di Ma'had Al-Azhar, latihan Tauhid & Aqidah.

Topik: [TULIS TOPIK — contoh: Sifat Allah, Iman kepada Malaikat, Rukun Iman]

Beri 6 soal latihan campuran (pilihan ganda + esai pendek). Setelah aku jawab, berikan koreksi dan penjelasan untuk jawaban yang keliru.`,
        },
      ],
      ujian: [
        {
          title: "Mock Ujian Tauhid",
          targetAI: "claude",
          template: `Aku pelajar [TINGKATAN] di Ma'had Al-Azhar, persiapan ujian Tauhid.

Materi yang diujikan: [TULIS BAB]

Buat mock ujian (10 soal): definisi istilah, pilihan ganda konsep, soal dalil (sebutkan dalil untuk konsep X), dan 1 soal esai pendek. Berikan kunci jawaban setelah aku selesai.`,
        },
      ],
    },
  },

  {
    id: "mahad-fiqh-ibadah",
    name: "Fiqh & Ibadah",
    nameArabic: "الفقه والعبادات",
    category: "mahad",
    isMahad: true,
    mahadSubcat: "agama",
    mahadFor: ["idadi", "tsanawi"],
    fakultas: ["mahad"],
    tingkat: ["idadi", "tsanawi"],
    description: "Fiqh ibadah sehari-hari dan hukum praktis level Ma'had Al-Azhar",
    recommendedAI: [
      { tool: "claude",  rank: 1, strength: "Jelaskan hukum fiqh dengan bahasa sederhana + praktik", why: "Claude baik untuk menjelaskan hukum praktis dan menyederhanakan konsep fiqh untuk pelajar muda" },
      { tool: "chatgpt", rank: 2, strength: "Tanya-jawab hukum ibadah sehari-hari",                 why: "ChatGPT bagus untuk sesi tanya-jawab cepat tentang praktik ibadah" },
    ],
    prompts: {
      pahami: [
        {
          title: "Pahami Hukum Fiqh Ibadah",
          targetAI: "claude",
          template: `Aku pelajar [TINGKATAN] di Ma'had Al-Azhar, belajar Fiqh & Ibadah.

Tolong jelaskan hukum/topik berikut:
[TULIS TOPIK — contoh: syarat sah wudhu, hukum shalat berjamaah, tata cara shalat Jum'at, zakat fitrah]

Sertakan:
1. Penjelasan hukum yang berlaku (wajib/sunnah/mubah/makruh/haram)
2. Dasar hukum: dalil Al-Qur'an atau Hadits berharakat + terjemah
3. Cara pelaksanaan yang benar (step by step)
4. Hal-hal yang membatalkan atau merusak ibadah ini
5. Pertanyaan umum yang sering muncul tentang topik ini

Gunakan bahasa Indonesia yang mudah, sesuai level pelajar Ma'had.`,
        },
        {
          title: "Bandingkan Pendapat Fiqh",
          targetAI: "claude",
          template: `Aku pelajar [TINGKATAN] di Ma'had Al-Azhar, belajar Fiqh.

Ada masalah fiqh yang ingin kupahami berbagai pendapatnya:
[TULIS MASALAH — contoh: hukum qunut subuh, batasan aurat, niat di dalam hati]

Jelaskan:
1. Pendapat para ulama (setidaknya 2 pendapat yang berbeda)
2. Dalil masing-masing pendapat
3. Manakah pendapat yang lazim di kalangan Al-Azhar
4. Bagaimana cara bersikap menghadapi perbedaan ini

Catatan: jangan men-tarjih. Sajikan semua pendapat dengan adil.`,
        },
      ],
      latihan: [
        {
          title: "Soal Latihan Fiqh Ibadah",
          targetAI: "chatgpt",
          template: `Aku pelajar [TINGKATAN] di Ma'had Al-Azhar, latihan Fiqh.

Bab yang sedang kupelajari: [TULIS BAB — contoh: Thaharah, Shalat, Puasa]

Buat 6 soal latihan campuran:
- 3 soal: hukum praktis sehari-hari (boleh/tidak boleh?)
- 2 soal: tata cara ibadah (step by step)
- 1 soal: dalil dari ibadah tertentu

Berikan penjelasan untuk tiap jawaban setelah aku mencoba.`,
        },
      ],
      ujian: [
        {
          title: "Mock Ujian Fiqh",
          targetAI: "claude",
          template: `Aku pelajar [TINGKATAN] di Ma'had Al-Azhar, persiapan ujian Fiqh.

Bab yang diujikan: [TULIS BAB]

Buat mock ujian (10 soal): definisi istilah fiqh, soal hukum praktis, soal dalil, dan 1 soal analisis kasus (seseorang melakukan X — apa hukumnya?). Kunci jawaban diberikan setelah aku selesai menjawab.`,
        },
      ],
    },
  },

  {
    id: "mahad-sirah-tarikh-nabi",
    name: "Sirah Nabawiyyah & Tarikh",
    nameArabic: "السيرة النبوية والتاريخ",
    category: "mahad",
    isMahad: true,
    mahadSubcat: "agama",
    mahadFor: ["idadi", "tsanawi"],
    fakultas: ["mahad"],
    tingkat: ["idadi", "tsanawi"],
    description: "Sejarah Nabi ﷺ dan peradaban Islam dalam kurikulum Ma'had Al-Azhar",
    recommendedAI: [
      { tool: "chatgpt",    rank: 1, strength: "Ceritakan peristiwa Sirah dengan narasi menarik", why: "ChatGPT bagus untuk mengemas sejarah dalam narasi yang mudah dipahami dan menarik bagi remaja" },
      { tool: "perplexity", rank: 2, strength: "Verifikasi fakta dan urutan peristiwa",           why: "Perplexity membantu cek kronologi dan fakta dari sumber-sumber sejarah" },
    ],
    prompts: {
      pahami: [
        {
          title: "Pahami Peristiwa Sirah Nabawiyyah",
          targetAI: "chatgpt",
          template: `Aku pelajar [TINGKATAN] di Ma'had Al-Azhar, belajar Sirah Nabawiyyah.

Ceritakan peristiwa berikut dengan detail:
[TULIS PERISTIWA — contoh: Hijrah ke Madinah, Perang Badar, Fathu Makkah, Perjanjian Hudaibiyyah]

Sertakan:
1. Latar belakang dan sebab terjadinya peristiwa
2. Kronologi kejadian yang penting
3. Tokoh-tokoh kunci yang terlibat
4. Hikmah dan pelajaran dari peristiwa ini
5. Dampaknya terhadap perkembangan Islam

Gunakan bahasa Indonesia yang menarik dan mudah dipahami pelajar SMP-SMA.`,
        },
        {
          title: "Garis Waktu Sirah Nabawiyyah",
          targetAI: "chatgpt",
          template: `Aku pelajar [TINGKATAN] di Ma'had Al-Azhar, belajar kronologi Sirah.

Buat garis waktu (timeline) dari:
[TULIS PERIODE — contoh: Fase Makkah (610-622 M), Fase Madinah (622-632 M), atau topik tertentu]

Sajikan dalam format yang mudah dihafal:
- Tahun/waktu → Peristiwa penting → Keterangan singkat

Urutkan dari yang paling awal hingga paling akhir.`,
        },
      ],
      hafal: [
        {
          title: "Hafal Kronologi & Fakta Kunci Sirah",
          targetAI: "claude",
          template: `Aku pelajar [TINGKATAN] di Ma'had Al-Azhar, perlu hafal fakta-fakta penting Sirah.

Topik: [TULIS TOPIK — contoh: Perang-perang Nabi ﷺ, Sahabat Nabi yang masuk Islam pertama, Tahun-tahun penting]

Buatkan:
1. Tabel ringkas: fakta kunci yang perlu dihafal
2. Mnemonic atau cara mudah mengingat urutan/angka tahun
3. 5 pertanyaan drill untuk mengetes ingatan`,
        },
      ],
      ujian: [
        {
          title: "Mock Ujian Sirah Nabawiyyah",
          targetAI: "chatgpt",
          template: `Aku pelajar [TINGKATAN] di Ma'had Al-Azhar, persiapan ujian Sirah Nabawiyyah.

Bab yang diujikan: [TULIS BAB — contoh: Periode Makkah, Hijrah, Perang Badar]

Buat mock ujian (10 soal): urutan peristiwa, tokoh dan perannya, sebab-akibat peristiwa, dan 1 soal hikmah. Berikan kunci jawaban lengkap setelah aku menjawab semua.`,
        },
      ],
    },
  },

  {
    id: "mahad-nahwu-sharaf",
    name: "Nahwu & Sharaf Dasar",
    nameArabic: "النحو والصرف الأساسي",
    category: "mahad",
    isMahad: true,
    mahadSubcat: "agama",
    mahadFor: ["idadi", "tsanawi"],
    fakultas: ["mahad"],
    tingkat: ["idadi", "tsanawi"],
    description: "Kaidah bahasa Arab level dasar-menengah — fondasi untuk semua maddah lainnya",
    recommendedAI: [
      { tool: "claude",      rank: 1, strength: "Jelaskan kaidah nahwu/sharaf dengan mudah + contoh", why: "Claude kuat untuk penjelasan gramatikal bertahap dengan contoh yang relevan untuk pelajar baru" },
      { tool: "notebooklm", rank: 2, strength: "Upload kitab nahwu dan buat ringkasan interaktif",   why: "NotebookLM membantu membuat catatan dari kitab dan tanya-jawab tentang isinya" },
    ],
    prompts: {
      pahami: [
        {
          title: "Pahami Kaidah Nahwu",
          targetAI: "claude",
          template: `Aku pelajar [TINGKATAN] di Ma'had Al-Azhar, belajar Nahwu Dasar.

Tolong jelaskan kaidah berikut:
[TULIS KAIDAH — contoh: Isim Marfu', Fi'il Madhi, Isim Mufrad vs Jama', Huruf Jar dan fungsinya]

Sertakan:
1. Definisi dalam bahasa Indonesia yang mudah
2. Kapan kaidah ini dipakai
3. Contoh kalimat Arab sederhana — sertakan harakat + terjemah
4. Tanda-tanda atau ciri-ciri yang bisa dikenali
5. Kesalahan umum yang sering dilakukan pelajar

Buat penjelasannya sesederhana mungkin — aku masih belajar dasar.`,
        },
        {
          title: "I'rab Kalimat Arab",
          targetAI: "claude",
          template: `Aku pelajar [TINGKATAN] di Ma'had Al-Azhar, latihan i'rab.

I'rabkan kalimat Arab berikut:
[TULIS KALIMAT ARAB DENGAN HARAKAT]

Untuk setiap kata:
1. Kata apa ini? (isim/fi'il/harf)
2. Kedudukan i'rabnya (mubtada/khabar/fa'il/maf'ul/dll)
3. Tanda i'rabnya (dhammah/fathah/kasrah/sukun dan alasannya)

Jelaskan dengan bahasa Indonesia yang mudah.`,
        },
      ],
      latihan: [
        {
          title: "Drill Kaidah Nahwu",
          targetAI: "claude",
          template: `Aku pelajar [TINGKATAN] di Ma'had Al-Azhar, latihan Nahwu.

Kaidah yang sedang kupelajari: [TULIS KAIDAH]

Buat 5 soal latihan:
- Tipe 1 (2 soal): lengkapi harakat yang tepat
- Tipe 2 (2 soal): identifikasi kedudukan kata dalam kalimat
- Tipe 3 (1 soal): buat kalimat sederhana menggunakan kaidah ini

Koreksi jawabanku dan jelaskan yang keliru.`,
        },
        {
          title: "Drill Tashrif Sharaf",
          targetAI: "claude",
          template: `Aku pelajar [TINGKATAN] di Ma'had Al-Azhar, latihan Sharaf.

Fi'il yang ingin kupelajari tashrifnya: [TULIS FI'IL — contoh: كَتَبَ، ضَرَبَ، نَصَرَ]

Buatkan tabel tashrif lengkap:
- Fi'il Madhi (semua dhamir)
- Fi'il Mudhari'
- Fi'il Amar

Lalu buat 3 soal drill dimana aku harus melengkapi tashrif yang kosong.`,
        },
      ],
      ujian: [
        {
          title: "Mock Ujian Nahwu & Sharaf",
          targetAI: "claude",
          template: `Aku pelajar [TINGKATAN] di Ma'had Al-Azhar, persiapan ujian Nahwu & Sharaf.

Bab yang diujikan: [TULIS BAB]

Buat mock ujian (10 soal): definisi istilah, identifikasi kedudukan kata, beri harakat yang benar, tashrif fi'il, dan 1 soal i'rab kalimat pendek. Kunci jawaban setelah aku selesai.`,
        },
      ],
    },
  },

  {
    id: "mahad-insya-tabir",
    name: "Insya' & Ta'bir",
    nameArabic: "الإنشاء والتعبير الكتابي",
    category: "mahad",
    isMahad: true,
    mahadSubcat: "agama",
    mahadFor: ["idadi", "tsanawi"],
    fakultas: ["mahad"],
    tingkat: ["idadi", "tsanawi"],
    description: "Mengarang dan menulis dalam bahasa Arab — dari paragraf dasar hingga esai ujian",
    recommendedAI: [
      { tool: "claude",  rank: 1, strength: "Koreksi tulisan Arab & bantu susun kerangka insya'", why: "Claude sangat baik untuk koreksi tata bahasa Arab dan membantu menyusun tulisan yang terstruktur" },
      { tool: "chatgpt", rank: 2, strength: "Buat template insya' untuk berbagai topik",          why: "ChatGPT bagus untuk menghasilkan template dan contoh karangan yang bisa jadi referensi" },
    ],
    prompts: {
      pahami: [
        {
          title: "Bantu Susun Kerangka Insya'",
          targetAI: "claude",
          template: `Aku pelajar [TINGKATAN] di Ma'had Al-Azhar, berlatih menulis insya' (karangan Arab).

Topik insya' yang harus kutulis: [TULIS TOPIK — contoh: الصداقة، فضل العلم، حياة الطالب في مصر]

Tolong bantu aku:
1. Buat kerangka karangan (المقدمة - الموضوع - الخاتمة)
2. Poin-poin penting yang harus masuk di setiap bagian
3. Kosakata/ungkapan Arab berguna untuk topik ini (dengan harakat + arti)
4. Kalimat pembuka yang bagus untuk muqaddimah

Aku akan menulis sendiri dulu, tolong jangan langsung berikan karangan jadi.`,
        },
        {
          title: "Koreksi Insya' Arabku",
          targetAI: "claude",
          template: `Aku pelajar [TINGKATAN] di Ma'had Al-Azhar, minta koreksi insya' ini:

[PASTE TULISAN ARABMU — boleh dengan atau tanpa harakat]

Tolong koreksi:
1. Kesalahan nahwu dan sharaf (tandai dan jelaskan)
2. Pilihan kosakata yang kurang tepat
3. Struktur kalimat yang bisa diperbaiki
4. Penilaian keseluruhan (isi, bahasa, struktur)

Berikan versi yang sudah diperbaiki dengan penjelasan untuk setiap koreksi.`,
        },
      ],
      latihan: [
        {
          title: "Template Insya' per Topik",
          targetAI: "chatgpt",
          template: `Aku pelajar [TINGKATAN] di Ma'had Al-Azhar, butuh template insya' untuk topik:
[TULIS TOPIK — contoh: فضل طلب العلم، الحياة في مصر، الأسرة المسلمة]

Buatkan:
1. Karangan contoh (150-200 kata) dengan bahasa yang sesuai level Ma'had
2. Kosakata kunci dari topik ini (10-15 kata) dengan harakat + arti
3. Ungkapan transisi yang bisa dipakai (أولاً، ثانياً، وفي الختام، dll)

Aku akan mempelajari contoh ini sebagai referensi, bukan untuk menyalin langsung.`,
        },
      ],
      ujian: [
        {
          title: "Simulasi Ujian Insya'",
          targetAI: "claude",
          template: `Aku pelajar [TINGKATAN] di Ma'had Al-Azhar, persiapan ujian Insya'.

Beri aku topik insya' seperti di ujian Ma'had, lalu aku akan menulis dalam waktu terbatas. Setelah selesai, nilai berdasarkan:
- Ketepatan nahwu & sharaf (40%)
- Kosakata & ungkapan (30%)
- Struktur & kohesi (30%)

Beri skor dan feedback yang spesifik.`,
        },
      ],
    },
  },

  /* ============================================================
     KELOMPOK 2: MADDAH UMUM — SEMUA JENJANG (2 kartu)
     ============================================================ */

  {
    id: "mahad-riyadhiyat",
    name: "Riyadhiyat (Matematika)",
    nameArabic: "الرياضيات",
    category: "mahad",
    isMahad: true,
    mahadSubcat: "umum_all",
    mahadFor: ["idadi", "tsanawi"],
    fakultas: ["mahad"],
    tingkat: ["idadi", "tsanawi"],
    description: "Matematika kurikulum Ma'had Al-Azhar — dipelajari dalam bahasa Arab. Dari aljabar dasar hingga kalkulus untuk Tsanawi Ilmi.",
    recommendedAI: [
      { tool: "chatgpt", rank: 1, strength: "Jelaskan konsep matematika + tunjukkan langkah penyelesaian", why: "ChatGPT unggul untuk penyelesaian soal matematika langkah demi langkah" },
      { tool: "gemini",  rank: 2, strength: "Bantu memahami istilah matematika dalam bahasa Arab",       why: "Gemini bagus untuk bridging konsep matematika dengan terminologi Arab yang dipakai di ujian" },
    ],
    prompts: {
      pahami: [
        {
          title: "Pahami Konsep Matematika + Istilah Arabnya",
          targetAI: "chatgpt",
          template: `Aku pelajar [TINGKATAN] di Ma'had Al-Azhar. Matematika (الرياضيات) diajarkan dalam bahasa Arab di sekolahku.

Topik yang ingin kupahami: [TULIS TOPIK — contoh: persamaan linear, teorema Pythagoras, fungsi kuadrat, matriks]

Tolong jelaskan:
1. Konsep dasarnya dalam bahasa Indonesia yang mudah
2. Istilah Arab penting yang dipakai di buku teksmu (dengan harakat)
3. Rumus atau cara penyelesaian — langkah demi langkah
4. Contoh soal dengan penyelesaian lengkap
5. Soal latihan singkat untuk dicoba sendiri

Bantu aku paham konsepnya dulu sebelum hafal rumusnya.`,
        },
        {
          title: "Terjemahkan Soal Arab → Selesaikan",
          targetAI: "chatgpt",
          template: `Aku pelajar [TINGKATAN] di Ma'had Al-Azhar. Soal matematikaku dalam bahasa Arab dan aku butuh bantuan.

Ini soal dari buku/ujianku:
[PASTE SOAL ARAB]

Tolong:
1. Terjemahkan soal ke bahasa Indonesia
2. Identifikasi apa yang dicari dan apa yang diketahui
3. Selesaikan langkah demi langkah
4. Jelaskan kenapa setiap langkah dilakukan

Aku ingin mengerti prosesnya, bukan hanya jawabannya.`,
        },
      ],
      latihan: [
        {
          title: "Latihan Soal Matematika",
          targetAI: "chatgpt",
          template: `Aku pelajar [TINGKATAN] di Ma'had Al-Azhar, latihan Matematika.

Bab/topik: [TULIS TOPIK]

Beri 5 soal latihan dengan tingkat kesulitan bertahap (dari mudah ke susah). Aku akan mencoba selesaikan dulu, kemudian berikan penyelesaian lengkap + penjelasan langkahnya.`,
        },
      ],
      ujian: [
        {
          title: "Mock Ujian Matematika",
          targetAI: "chatgpt",
          template: `Aku pelajar [TINGKATAN] di Ma'had Al-Azhar, persiapan ujian Matematika (الرياضيات).

Bab yang diujikan: [TULIS BAB]

Buat soal ujian 10 soal (campuran pilihan ganda dan uraian). Soal boleh dalam bahasa Indonesia dulu. Setelah aku menjawab, berikan kunci jawaban lengkap dengan penyelesaian langkah demi langkah.`,
        },
      ],
    },
  },

  {
    id: "mahad-english",
    name: "Lughah Injiliziyyah (B. Inggris)",
    nameArabic: "اللغة الإنجليزية",
    category: "mahad",
    isMahad: true,
    mahadSubcat: "umum_all",
    mahadFor: ["idadi", "tsanawi"],
    fakultas: ["mahad"],
    tingkat: ["idadi", "tsanawi"],
    description: "Bahasa Inggris sebagai maddah wajib di Ma'had — dipelajari bersamaan dengan bahasa Arab",
    recommendedAI: [
      { tool: "chatgpt", rank: 1, strength: "Latihan grammar, vocab, dan writing bahasa Inggris", why: "ChatGPT sangat baik untuk latihan bahasa Inggris komprehensif" },
      { tool: "copilot",  rank: 2, strength: "Koreksi tulisan Inggris + saran perbaikan",         why: "Copilot bagus untuk proofread dan koreksi tulisan bahasa Inggris" },
    ],
    prompts: {
      pahami: [
        {
          title: "Pahami Grammar Bahasa Inggris",
          targetAI: "chatgpt",
          template: `Aku pelajar [TINGKATAN] di Ma'had Al-Azhar, belajar Bahasa Inggris (اللغة الإنجليزية).

Topik grammar yang ingin kupahami: [TULIS TOPIK — contoh: Simple Past Tense, Conditional Sentences, Passive Voice]

Jelaskan:
1. Apa itu dan kapan dipakai (dalam bahasa Indonesia)
2. Polanya (pattern/rumus)
3. Contoh kalimat (setidaknya 5 contoh)
4. Kesalahan umum yang harus dihindari
5. Latihan singkat untuk dicoba

Ingat: aku sudah belajar 2 bahasa sekaligus (Arab + Indonesia), jadi gunakan penjelasan yang efisien.`,
        },
        {
          title: "Perbanyak Kosakata Bahasa Inggris",
          targetAI: "chatgpt",
          template: `Aku pelajar [TINGKATAN] di Ma'had Al-Azhar, mau memperluas vocabulary Bahasa Inggris.

Topik atau tema: [TULIS TEMA — contoh: daily life, school, science, religion, nature]

Buatkan:
1. 20 kosakata penting dalam tema ini
2. Untuk setiap kata: arti bahasa Indonesia + contoh kalimat pendek
3. Kelompokkan berdasarkan part of speech (nouns, verbs, adjectives)
4. 5 soal isi-bagian-yang-kosong untuk latihan`,
        },
      ],
      latihan: [
        {
          title: "Latihan Writing Bahasa Inggris",
          targetAI: "chatgpt",
          template: `Aku pelajar [TINGKATAN] di Ma'had Al-Azhar, latihan writing Bahasa Inggris.

Ini tulisanku (paragraph atau essay pendek):
[PASTE TULISAN INGGRISMU]

Tolong:
1. Koreksi kesalahan grammar
2. Perbaiki pilihan kata (word choice)
3. Saran untuk membuat tulisan lebih natural
4. Beri nilai 1-10 dengan alasannya`,
        },
      ],
      ujian: [
        {
          title: "Mock Ujian Bahasa Inggris",
          targetAI: "chatgpt",
          template: `Aku pelajar [TINGKATAN] di Ma'had Al-Azhar, persiapan ujian Bahasa Inggris.

Bab yang diujikan: [TULIS BAB — contoh: Reading Comprehension, Grammar, Vocabulary]

Buat mock ujian: 5 soal grammar, 5 soal vocabulary, dan 1 paragraf reading comprehension dengan 3 pertanyaan. Berikan kunci jawaban setelah aku selesai.`,
        },
      ],
    },
  },

  /* ============================================================
     KELOMPOK 3: MADDAH UMUM — TSANAWI ILMI (3 kartu)
     ============================================================ */

  {
    id: "mahad-fisika",
    name: "Fisika (Tsanawi Ilmi)",
    nameArabic: "الفيزياء",
    category: "mahad",
    isMahad: true,
    mahadSubcat: "umum_ilmi",
    mahadFor: ["tsanawi_ilmi"],
    fakultas: ["mahad"],
    tingkat: ["tsanawi"],
    description: "Fisika dasar hingga menengah dalam bahasa Arab — mekanika, listrik, gelombang, dan termodinamika",
    recommendedAI: [
      { tool: "chatgpt", rank: 1, strength: "Jelaskan konsep fisika + selesaikan soal hitungan", why: "ChatGPT kuat untuk penjelasan fisika dan penyelesaian soal numerik langkah demi langkah" },
      { tool: "gemini",  rank: 2, strength: "Visualisasikan konsep fisika & cari rumus dalam Arab", why: "Gemini bagus untuk membantu memahami konsep fisika yang abstrak dan bridging ke bahasa Arab" },
    ],
    prompts: {
      pahami: [
        {
          title: "Pahami Konsep Fisika + Istilah Arab",
          targetAI: "chatgpt",
          template: `Aku pelajar Tsanawi Ilmi di Ma'had Al-Azhar. Fisika (الفيزياء) diajarkan dalam bahasa Arab.

Konsep yang ingin kupahami: [TULIS KONSEP — contoh: Hukum Newton, Energi Kinetik, Gelombang Elektromagnetik, Rangkaian Listrik]

Jelaskan:
1. Konsep dasarnya dalam bahasa Indonesia yang jelas
2. Istilah Arab penting yang dipakai di buku fisikaku (sertakan harakat)
3. Rumus yang relevan — tulis dalam notasi yang jelas
4. Contoh soal dengan penyelesaian langkah demi langkah
5. Aplikasi nyata dari konsep ini

Bantu aku paham konsepnya dulu, baru ke rumus dan hitungan.`,
        },
        {
          title: "Bantu Selesaikan Soal Fisika Berbahasa Arab",
          targetAI: "chatgpt",
          template: `Aku pelajar Tsanawi Ilmi di Ma'had Al-Azhar. Ada soal fisika dalam bahasa Arab yang butuh bantuanku:

[PASTE SOAL ARAB — boleh foto atau ketik]

Tolong:
1. Terjemahkan soal ke bahasa Indonesia
2. Identifikasi: apa yang diketahui? apa yang dicari?
3. Pilih rumus yang tepat
4. Selesaikan langkah demi langkah dengan penjelasan
5. Cek apakah satuan sudah benar`,
        },
      ],
      latihan: [
        {
          title: "Latihan Soal Fisika",
          targetAI: "chatgpt",
          template: `Aku pelajar Tsanawi Ilmi di Ma'had Al-Azhar, latihan soal Fisika.

Bab: [TULIS BAB — contoh: Mekanika, Termodinamika, Listrik, Optik]

Beri 4 soal hitungan dengan tingkat kesulitan bertahap. Aku kerjakan dulu, lalu berikan penyelesaian lengkap + jelaskan konsep di balik setiap soal.`,
        },
      ],
      ujian: [
        {
          title: "Mock Ujian Fisika",
          targetAI: "chatgpt",
          template: `Aku pelajar Tsanawi Ilmi di Ma'had Al-Azhar, persiapan ujian Fisika (الفيزياء).

Bab yang diujikan: [TULIS BAB]

Buat mock ujian: 3 soal teori (definisi + konsep) dan 5 soal hitungan. Berikan kunci jawaban dengan penyelesaian lengkap setelah aku selesai menjawab.`,
        },
      ],
    },
  },

  {
    id: "mahad-kimia",
    name: "Kimia (Tsanawi Ilmi)",
    nameArabic: "الكيمياء",
    category: "mahad",
    isMahad: true,
    mahadSubcat: "umum_ilmi",
    mahadFor: ["tsanawi_ilmi"],
    fakultas: ["mahad"],
    tingkat: ["tsanawi"],
    description: "Kimia dasar hingga menengah dalam bahasa Arab — unsur, reaksi, ikatan, dan kimia organik dasar",
    recommendedAI: [
      { tool: "chatgpt", rank: 1, strength: "Jelaskan konsep kimia + selesaikan soal reaksi", why: "ChatGPT baik untuk menjelaskan kimia dan membantu menyetarakan persamaan reaksi" },
      { tool: "gemini",  rank: 2, strength: "Cari istilah kimia dalam bahasa Arab",          why: "Gemini membantu bridging terminologi kimia Indonesia-Arab yang sering beda" },
    ],
    prompts: {
      pahami: [
        {
          title: "Pahami Konsep Kimia + Istilah Arab",
          targetAI: "chatgpt",
          template: `Aku pelajar Tsanawi Ilmi di Ma'had Al-Azhar. Kimia (الكيمياء) diajarkan dalam bahasa Arab.

Konsep yang ingin kupahami: [TULIS KONSEP — contoh: Ikatan Kimia, Persamaan Reaksi, Asam-Basa, Tabel Periodik, Kimia Organik Dasar]

Jelaskan:
1. Konsep dasarnya dalam bahasa Indonesia yang jelas
2. Istilah Arab penting dari buku kimiaku (sertakan harakat)
3. Contoh dan cara kerja konsep ini
4. Cara menyetarakan persamaan reaksi (jika relevan)
5. Soal contoh dengan penyelesaian

Utamakan pemahaman konsep, bukan sekadar menghafal.`,
        },
        {
          title: "Bantu Soal Kimia Berbahasa Arab",
          targetAI: "chatgpt",
          template: `Aku pelajar Tsanawi Ilmi di Ma'had Al-Azhar. Ada soal kimia dalam bahasa Arab:

[PASTE SOAL ARAB]

Tolong:
1. Terjemahkan ke bahasa Indonesia
2. Apa yang diketahui dan dicari?
3. Selesaikan langkah demi langkah
4. Jelaskan konsep kimia yang dipakai

Aku ingin paham, bukan hanya jawaban.`,
        },
      ],
      latihan: [
        {
          title: "Latihan Soal Kimia",
          targetAI: "chatgpt",
          template: `Aku pelajar Tsanawi Ilmi di Ma'had Al-Azhar, latihan Kimia.

Bab: [TULIS BAB — contoh: Stoikiometri, Larutan, Termokimia, Elektrokimia]

Beri 4 soal: campuran teori dan hitungan. Aku kerjakan dulu, kemudian berikan penyelesaian lengkap dengan penjelasan.`,
        },
      ],
      ujian: [
        {
          title: "Mock Ujian Kimia",
          targetAI: "chatgpt",
          template: `Aku pelajar Tsanawi Ilmi di Ma'had Al-Azhar, persiapan ujian Kimia (الكيمياء).

Bab yang diujikan: [TULIS BAB]

Buat mock ujian 8 soal: definisi istilah, pilih jawaban benar, dan soal hitungan. Kunci jawaban + penyelesaian setelah aku selesai.`,
        },
      ],
    },
  },

  {
    id: "mahad-biologi",
    name: "Biologi (Tsanawi Ilmi)",
    nameArabic: "الأحياء (البيولوجيا)",
    category: "mahad",
    isMahad: true,
    mahadSubcat: "umum_ilmi",
    mahadFor: ["tsanawi_ilmi"],
    fakultas: ["mahad"],
    tingkat: ["tsanawi"],
    description: "Biologi dalam bahasa Arab — sel, genetika, ekosistem, dan anatomi sesuai kurikulum Tsanawi Ilmi",
    recommendedAI: [
      { tool: "chatgpt",    rank: 1, strength: "Jelaskan konsep biologi + istilah ilmiah dalam Arab", why: "ChatGPT kuat untuk menjelaskan konsep biologi dan bridging terminologi Arab-Indonesia" },
      { tool: "gemini",     rank: 2, strength: "Cari gambar dan visualisasi untuk biologi",            why: "Gemini membantu mencari sumber visual untuk memahami anatomi dan proses biologi" },
      { tool: "perplexity", rank: 3, strength: "Verifikasi fakta biologi terkini",                      why: "Perplexity bagus untuk cek fakta ilmiah dan mendapatkan informasi terbaru" },
    ],
    prompts: {
      pahami: [
        {
          title: "Pahami Konsep Biologi + Istilah Arab",
          targetAI: "chatgpt",
          template: `Aku pelajar Tsanawi Ilmi di Ma'had Al-Azhar. Biologi (الأحياء) diajarkan dalam bahasa Arab.

Konsep yang ingin kupahami: [TULIS KONSEP — contoh: Pembelahan Sel, Pewarisan Genetika, Sistem Peredaran Darah, Ekosistem, Fotosintesis]

Jelaskan:
1. Konsep dasarnya dalam bahasa Indonesia yang mudah dipahami
2. Istilah Arab penting yang muncul di buku biologiku (sertakan harakat)
3. Bagaimana proses ini bekerja — step by step
4. Diagram atau deskripsi visual jika membantu
5. Kaitan konsep ini dengan kehidupan nyata

Buat penjelasan semenarik dan seringkas mungkin.`,
        },
        {
          title: "Bantu Soal Biologi Berbahasa Arab",
          targetAI: "chatgpt",
          template: `Aku pelajar Tsanawi Ilmi di Ma'had Al-Azhar. Ada soal biologi dalam bahasa Arab:

[PASTE SOAL ARAB]

Tolong:
1. Terjemahkan soal ke bahasa Indonesia
2. Jelaskan konsep biologi yang ditanyakan
3. Berikan jawaban lengkap
4. Kosakata kunci Arab dalam soal ini (dengan arti)`,
        },
      ],
      latihan: [
        {
          title: "Latihan Soal Biologi",
          targetAI: "chatgpt",
          template: `Aku pelajar Tsanawi Ilmi di Ma'had Al-Azhar, latihan Biologi.

Bab: [TULIS BAB — contoh: Sel & Organelnya, Genetika Mendel, Sistem Organ Manusia]

Beri 6 soal: campuran definisi, pilihan, dan esai pendek. Aku kerjakan dulu, lalu berikan kunci jawaban + penjelasan.`,
        },
      ],
      ujian: [
        {
          title: "Mock Ujian Biologi",
          targetAI: "chatgpt",
          template: `Aku pelajar Tsanawi Ilmi di Ma'had Al-Azhar, persiapan ujian Biologi (الأحياء).

Bab yang diujikan: [TULIS BAB]

Buat mock ujian 10 soal campuran (definisi, diagram/gambar deskriptif, dan esai singkat). Kunci jawaban setelah aku selesai.`,
        },
      ],
    },
  },

  /* ============================================================
     KELOMPOK 4: MADDAH UMUM — TSANAWI ADABI (5 kartu)
     ============================================================ */

  {
    id: "mahad-tarikh-sejarah",
    name: "Tarikh (Sejarah Umum)",
    nameArabic: "التاريخ",
    category: "mahad",
    isMahad: true,
    mahadSubcat: "umum_adabi",
    mahadFor: ["tsanawi_adabi"],
    fakultas: ["mahad"],
    tingkat: ["tsanawi"],
    description: "Sejarah umum dan Islam dalam bahasa Arab — dari sejarah kuno hingga modern, kurikulum Tsanawi Adabi",
    recommendedAI: [
      { tool: "chatgpt",    rank: 1, strength: "Ceritakan sejarah dengan narasi yang mudah dipahami", why: "ChatGPT baik untuk menyajikan sejarah dalam narasi yang menarik dan mudah dicerna remaja" },
      { tool: "perplexity", rank: 2, strength: "Verifikasi fakta dan kronologi sejarah",              why: "Perplexity membantu cek fakta, tanggal, dan kronologi peristiwa sejarah" },
    ],
    prompts: {
      pahami: [
        {
          title: "Pahami Peristiwa Sejarah",
          targetAI: "chatgpt",
          template: `Aku pelajar Tsanawi Adabi di Ma'had Al-Azhar. Sejarah (التاريخ) diajarkan dalam bahasa Arab.

Peristiwa/topik sejarah yang ingin kupahami: [TULIS TOPIK — contoh: Perang Dunia I, Revolusi Prancis, Peradaban Mesopotamia, Penjajahan di Timur Tengah]

Jelaskan:
1. Latar belakang dan konteksnya
2. Kronologi peristiwa penting
3. Tokoh-tokoh kunci dan perannya
4. Dampak dan akibat dari peristiwa ini
5. Istilah Arab penting yang mungkin muncul di ujian

Gunakan bahasa Indonesia yang menarik dan mudah diingat.`,
        },
        {
          title: "Garis Waktu Sejarah",
          targetAI: "chatgpt",
          template: `Aku pelajar Tsanawi Adabi di Ma'had Al-Azhar, belajar Tarikh (Sejarah Umum).

Buat garis waktu untuk: [TULIS TOPIK/PERIODE]

Format:
- Tahun/periode → Peristiwa → Keterangan singkat (1-2 kalimat)

Urutkan dari yang paling awal. Tambahkan catatan tentang peristiwa yang paling penting untuk diingat.`,
        },
      ],
      hafal: [
        {
          title: "Hafal Fakta Kunci Sejarah",
          targetAI: "claude",
          template: `Aku pelajar Tsanawi Adabi di Ma'had Al-Azhar, perlu hafal fakta sejarah untuk ujian.

Topik: [TULIS TOPIK]

Buatkan:
1. Tabel ringkas: fakta kunci (tanggal, tokoh, tempat, peristiwa)
2. Tips mengingat tanggal atau urutan yang membingungkan
3. 5 pertanyaan drill hafalan`,
        },
      ],
      ujian: [
        {
          title: "Mock Ujian Sejarah",
          targetAI: "chatgpt",
          template: `Aku pelajar Tsanawi Adabi di Ma'had Al-Azhar, persiapan ujian Tarikh (Sejarah).

Bab yang diujikan: [TULIS BAB]

Buat mock ujian 10 soal: urutan kronologi, pilihan ganda fakta, sebab-akibat, dan 1 soal esai singkat tentang hikmah/dampak peristiwa. Kunci jawaban setelah aku selesai.`,
        },
      ],
    },
  },

  {
    id: "mahad-jughrafiya",
    name: "Jughrafiya (Geografi)",
    nameArabic: "الجغرافيا",
    category: "mahad",
    isMahad: true,
    mahadSubcat: "umum_adabi",
    mahadFor: ["tsanawi_adabi"],
    fakultas: ["mahad"],
    tingkat: ["tsanawi"],
    description: "Geografi fisik dan manusia dalam bahasa Arab — peta, iklim, populasi, dan geografi ekonomi",
    recommendedAI: [
      { tool: "gemini",     rank: 1, strength: "Cari peta, data geografis, dan visualisasi", why: "Gemini bagus untuk pencarian informasi geografis dengan data yang terverifikasi" },
      { tool: "perplexity", rank: 2, strength: "Statistik populasi dan geografi ekonomi terkini", why: "Perplexity membantu mendapatkan data geografis dan statistik yang up-to-date" },
    ],
    prompts: {
      pahami: [
        {
          title: "Pahami Konsep Geografi + Istilah Arab",
          targetAI: "gemini",
          template: `Aku pelajar Tsanawi Adabi di Ma'had Al-Azhar. Geografi (الجغرافيا) diajarkan dalam bahasa Arab.

Konsep yang ingin kupahami: [TULIS KONSEP — contoh: Iklim dan Cuaca, Zona Iklim Dunia, Geografi Mesir, Sumber Daya Alam, Populasi Dunia]

Jelaskan:
1. Konsep dasarnya dalam bahasa Indonesia yang jelas
2. Istilah Arab penting yang dipakai di buku geografiku (sertakan harakat)
3. Data atau fakta penting yang perlu diingat
4. Kaitan dengan kondisi dunia nyata (terutama Timur Tengah/Mesir jika relevan)

Buat penjelasan yang mudah divisualisasikan.`,
        },
        {
          title: "Analisis Karakteristik Wilayah",
          targetAI: "gemini",
          template: `Aku pelajar Tsanawi Adabi di Ma'had Al-Azhar, belajar Geografi.

Wilayah yang ingin kupahami: [TULIS WILAYAH — contoh: Negara-negara Arab, Afrika Utara, Asia Selatan, Eropa Barat]

Analisis:
1. Lokasi dan batas wilayah
2. Kondisi alam (iklim, topografi, sungai/gunung utama)
3. Populasi dan ciri-ciri demografi
4. Sumber daya alam dan ekonomi
5. Fakta penting yang sering muncul di soal ujian`,
        },
      ],
      latihan: [
        {
          title: "Latihan Soal Geografi",
          targetAI: "chatgpt",
          template: `Aku pelajar Tsanawi Adabi di Ma'had Al-Azhar, latihan Geografi.

Bab: [TULIS BAB — contoh: Geografi Fisik, Geografi Manusia, Iklim, Negara-negara Dunia]

Beri 6 soal latihan campuran. Aku kerjakan dulu, lalu berikan kunci jawaban + penjelasan.`,
        },
      ],
      ujian: [
        {
          title: "Mock Ujian Geografi",
          targetAI: "chatgpt",
          template: `Aku pelajar Tsanawi Adabi di Ma'had Al-Azhar, persiapan ujian Geografi (الجغرافيا).

Bab yang diujikan: [TULIS BAB]

Buat mock ujian 10 soal: identifikasi wilayah, fakta geografis, sebab-akibat fenomena alam, dan 1 soal analisis. Kunci jawaban setelah aku selesai.`,
        },
      ],
    },
  },

  {
    id: "mahad-falsafah-mantiq",
    name: "Falsafah & Mantiq",
    nameArabic: "الفلسفة والمنطق",
    category: "mahad",
    isMahad: true,
    mahadSubcat: "umum_adabi",
    mahadFor: ["tsanawi_adabi"],
    fakultas: ["mahad"],
    tingkat: ["tsanawi"],
    description: "Filsafat dasar dan ilmu logika dalam bahasa Arab — kurikulum Tsanawi Adabi Ma'had Al-Azhar",
    recommendedAI: [
      { tool: "claude",  rank: 1, strength: "Jelaskan konsep filsafat + bantah/dukung argumen", why: "Claude kuat untuk penjelasan konsep abstrak dan analisis argumen logis" },
      { tool: "chatgpt", rank: 2, strength: "Buat contoh dan skenario untuk konsep filsafat", why: "ChatGPT bagus untuk membuat analogi dan contoh konkret yang membantu memahami filsafat" },
    ],
    prompts: {
      pahami: [
        {
          title: "Pahami Konsep Filsafat & Logika",
          targetAI: "claude",
          template: `Aku pelajar Tsanawi Adabi di Ma'had Al-Azhar, belajar Filsafat & Mantiq.

Konsep yang ingin kupahami: [TULIS KONSEP — contoh: Silogisme, Qiyas Mantiq, Aliran Filsafat Idealisme/Materialisme, Teori Pengetahuan]

Jelaskan:
1. Apa itu konsep ini dalam bahasa Indonesia yang mudah
2. Istilah Arab yang dipakai di buku pelajaranku (sertakan harakat)
3. Contoh sederhana yang mudah dipahami remaja
4. Bagaimana konsep ini dipakai dalam kehidupan sehari-hari atau pemikiran Islam
5. Poin penting yang sering diujikan

Buat seabstrak apapun konsepnya tetap bisa kupahami.`,
        },
        {
          title: "Analisis Argumen Logis",
          targetAI: "claude",
          template: `Aku pelajar Tsanawi Adabi di Ma'had Al-Azhar, belajar Mantiq (Logika).

Argumen yang ingin kuanalisis: [TULIS ARGUMEN — atau: "buat contoh silogisme dan minta saya analisis"]

Bantu aku:
1. Identifikasi premis-premis dalam argumen
2. Apakah argumen ini valid secara logis?
3. Apakah ada kekeliruan logis (mughalatat mantiqiyyah)?
4. Bagaimana memperbaiki argumen jika ada kelemahan

Jelaskan dengan bahasa yang mudah.`,
        },
      ],
      latihan: [
        {
          title: "Latihan Soal Falsafah & Mantiq",
          targetAI: "claude",
          template: `Aku pelajar Tsanawi Adabi di Ma'had Al-Azhar, latihan Filsafat & Mantiq.

Bab: [TULIS BAB — contoh: Silogisme, Aliran Filsafat, Teori Pengetahuan]

Beri 5 soal latihan: definisi istilah, analisis argumen, dan identifikasi aliran pemikiran. Aku kerjakan dulu, kemudian berikan kunci + penjelasan.`,
        },
      ],
      ujian: [
        {
          title: "Mock Ujian Falsafah & Mantiq",
          targetAI: "claude",
          template: `Aku pelajar Tsanawi Adabi di Ma'had Al-Azhar, persiapan ujian Filsafat & Mantiq.

Bab yang diujikan: [TULIS BAB]

Buat mock ujian 8 soal: definisi istilah, identifikasi aliran, analisis argumen, dan 1 soal esai tentang relevansi filsafat dalam kehidupan. Kunci jawaban setelah aku selesai.`,
        },
      ],
    },
  },

  {
    id: "mahad-ilmu-nafs",
    name: "Ilmu Nafs (Psikologi)",
    nameArabic: "علم النفس",
    category: "mahad",
    isMahad: true,
    mahadSubcat: "umum_adabi",
    mahadFor: ["tsanawi_adabi"],
    fakultas: ["mahad"],
    tingkat: ["tsanawi"],
    description: "Psikologi dasar dalam bahasa Arab — perilaku, emosi, dan perkembangan manusia level Tsanawi",
    recommendedAI: [
      { tool: "claude", rank: 1, strength: "Jelaskan teori psikologi + kaitkan dengan Islam", why: "Claude baik untuk menjelaskan psikologi dan menghubungkannya dengan perspektif Islam" },
      { tool: "gemini", rank: 2, strength: "Cari contoh kasus dan aplikasi psikologi",       why: "Gemini bagus untuk memberikan contoh nyata dan aplikasi teori psikologi" },
    ],
    prompts: {
      pahami: [
        {
          title: "Pahami Konsep Psikologi + Istilah Arab",
          targetAI: "claude",
          template: `Aku pelajar Tsanawi Adabi di Ma'had Al-Azhar, belajar Ilmu Nafs (Psikologi).

Konsep yang ingin kupahami: [TULIS KONSEP — contoh: Teori Belajar, Motivasi, Perkembangan Anak, Emosi, Kepribadian, Stres]

Jelaskan:
1. Konsep ini dalam bahasa Indonesia yang mudah dipahami
2. Istilah Arab yang dipakai di buku Ilmu Nafsku (sertakan harakat)
3. Tokoh atau teori yang terkenal tentang konsep ini
4. Contoh nyata dari kehidupan sehari-hari
5. Pandangan Islam tentang aspek psikologis ini (jika ada)

Buat semenarik dan seringan mungkin.`,
        },
        {
          title: "Aplikasi Psikologi dalam Kehidupan",
          targetAI: "gemini",
          template: `Aku pelajar Tsanawi Adabi di Ma'had Al-Azhar, belajar Ilmu Nafs.

Topik yang ingin kuhubungkan dengan kehidupan nyata: [TULIS TOPIK — contoh: Motivasi belajar, Cara mengatasi stres, Perkembangan remaja]

Jelaskan:
1. Teori psikologi yang relevan
2. Bagaimana ini berlaku di kehidupan seorang pelajar Ma'had
3. Strategi praktis berdasarkan teori ini
4. Poin kunci untuk ujian`,
        },
      ],
      latihan: [
        {
          title: "Latihan Soal Ilmu Nafs",
          targetAI: "claude",
          template: `Aku pelajar Tsanawi Adabi di Ma'had Al-Azhar, latihan Ilmu Nafs.

Bab: [TULIS BAB — contoh: Teori Belajar, Motivasi dan Emosi, Kepribadian, Perkembangan]

Beri 6 soal: definisi istilah, identifikasi teori, dan analisis kasus singkat. Aku kerjakan dulu, lalu berikan kunci + penjelasan.`,
        },
      ],
      ujian: [
        {
          title: "Mock Ujian Ilmu Nafs",
          targetAI: "claude",
          template: `Aku pelajar Tsanawi Adabi di Ma'had Al-Azhar, persiapan ujian Ilmu Nafs (Psikologi).

Bab yang diujikan: [TULIS BAB]

Buat mock ujian 10 soal: definisi, pilihan ganda, identifikasi teori, dan 1 soal esai analisis kasus. Kunci jawaban setelah aku selesai.`,
        },
      ],
    },
  },

  {
    id: "mahad-ihsha",
    name: "Ihsha' (Statistik)",
    nameArabic: "الإحصاء",
    category: "mahad",
    isMahad: true,
    mahadSubcat: "umum_adabi",
    mahadFor: ["tsanawi_adabi"],
    fakultas: ["mahad"],
    tingkat: ["tsanawi"],
    description: "Statistik dasar dalam bahasa Arab — data, mean, median, modus, dan probabilitas level Tsanawi Adabi",
    recommendedAI: [
      { tool: "chatgpt", rank: 1, strength: "Jelaskan konsep statistik + selesaikan soal hitungan", why: "ChatGPT kuat untuk penjelasan statistik dan penyelesaian soal numerik langkah demi langkah" },
      { tool: "gemini",  rank: 2, strength: "Bridging istilah statistik Indonesia-Arab",             why: "Gemini membantu memahami terminologi statistik dalam bahasa Arab yang dipakai di ujian" },
    ],
    prompts: {
      pahami: [
        {
          title: "Pahami Konsep Statistik + Istilah Arab",
          targetAI: "chatgpt",
          template: `Aku pelajar Tsanawi Adabi di Ma'had Al-Azhar. Statistik (الإحصاء) diajarkan dalam bahasa Arab.

Konsep yang ingin kupahami: [TULIS KONSEP — contoh: Mean/Rata-rata, Median, Modus, Varians, Probabilitas, Diagram/Grafik]

Jelaskan:
1. Apa itu dan kapan dipakai
2. Istilah Arab yang dipakai di buku statistikku (dengan harakat)
3. Cara menghitung — step by step dengan contoh data
4. Contoh soal lengkap dengan penyelesaian
5. Kesalahan umum yang sering dilakukan

Buat penjelasannya sesederhana mungkin — statistik itu sebenarnya tidak susah!`,
        },
        {
          title: "Bantu Soal Statistik Berbahasa Arab",
          targetAI: "chatgpt",
          template: `Aku pelajar Tsanawi Adabi di Ma'had Al-Azhar. Ada soal statistik dalam bahasa Arab:

[PASTE SOAL ARAB]

Tolong:
1. Terjemahkan soal ke bahasa Indonesia
2. Apa yang diketahui dan dicari?
3. Selesaikan langkah demi langkah
4. Jelaskan konsep statistik yang dipakai`,
        },
      ],
      latihan: [
        {
          title: "Latihan Soal Statistik",
          targetAI: "chatgpt",
          template: `Aku pelajar Tsanawi Adabi di Ma'had Al-Azhar, latihan Statistik.

Bab: [TULIS BAB — contoh: Ukuran Pemusatan Data, Probabilitas, Penyajian Data]

Beri 4 soal hitungan dengan data yang berbeda-beda. Aku kerjakan dulu, kemudian berikan penyelesaian lengkap + penjelasan konsep di balik setiap soal.`,
        },
      ],
      ujian: [
        {
          title: "Mock Ujian Statistik",
          targetAI: "chatgpt",
          template: `Aku pelajar Tsanawi Adabi di Ma'had Al-Azhar, persiapan ujian Statistik (الإحصاء).

Bab yang diujikan: [TULIS BAB]

Buat mock ujian 8 soal: 3 soal definisi/konsep dan 5 soal hitungan dengan data. Kunci jawaban + penyelesaian lengkap setelah aku selesai.`,
        },
      ],
    },
  },

];

/* ── Append semua Ma'had Maddah ke array global MADDAHS ── */
MAHAD_MADDAHS.forEach(m => MADDAHS.push(m));

/* ── Helper khusus Ma'had ── */
const getMahadMaddahsForProfile = (profile) => {
  if (!profile || !isMahadLevel(profile.level)) return [];
  const level = profile.level;
  const jurusan = profile.mahad_jurusan;
  return MAHAD_MADDAHS.filter(m => {
    if (level === 'idadi') return m.mahadFor.includes('idadi');
    if (level === 'tsanawi') {
      if (jurusan === 'ilmi')  return m.mahadFor.includes('tsanawi') || m.mahadFor.includes('tsanawi_ilmi');
      if (jurusan === 'adabi') return m.mahadFor.includes('tsanawi') || m.mahadFor.includes('tsanawi_adabi');
      return m.mahadFor.includes('tsanawi'); // Tsanawi tanpa jurusan: tampilkan maddah agama + umum_all
    }
    return false;
  });
};

Object.assign(window, { MAHAD_MADDAHS, getMahadMaddahsForProfile });
