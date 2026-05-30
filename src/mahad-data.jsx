/* Talqeeh — Ma'had Al-Azhar Maddah Data
   I'dadi (SMP) + Tsanawi (SMA) — Agama + Umum
   Tone: sederhana, encouraging, cocok untuk remaja 12-18 tahun
*/

const MAHAD_MADDAH = [

  // ═══════════════════════════════════════
  // MADDAH AGAMA — I'DADI & TSANAWI
  // ═══════════════════════════════════════

  {
    id: "quran-tajwid",
    name: "Al-Qur'an & Tajwid",
    nameArabic: "الْقُرْآنُ وَالتَّجْوِيدُ",
    category: "agama",
    jenjang: ["idad", "tsanawi"],
    description: "Belajar membaca Al-Qur'an dengan benar sesuai kaidah tajwid.",
    topikUtama: [
      "Makharijul Huruf", "Sifatul Huruf",
      "Nun Sukun & Tanwin (izhar, idgham, iqlab, ikhfa)",
      "Hukum Mim Sukun", "Hukum Mad",
      "Hukum Ra' dan Lam", "Waqaf dan Ibtida'",
    ],
    prompts: {
      pahami: `Aku pelajar Ma'had Al-Azhar yang sedang belajar tajwid.

Tolong jelaskan topik ini dengan cara yang mudah dipahami: [TOPIK]

Yang aku butuhkan:
1. Penjelasan singkat dan jelas
2. Contoh dari Al-Qur'an — tulis ayatnya dengan harakat + tunjukkan bagian yang jadi contoh
3. Cara mudah mengingat kaidah ini (kalau ada trik hafalan)
4. Perbedaan dengan hukum tajwid lain yang mirip (supaya tidak tertukar)

Bahasa: Indonesia yang mudah. Istilah Arab tetap disebut tapi selalu dikasih artinya.`,

      hafal: `Aku pelajar Ma'had Al-Azhar, mau hafal kaidah tajwid: [TOPIK]

Bantu aku hafal dengan cara yang menyenangkan:
1. Ringkasan kaidah dalam 3-5 poin pendek
2. Contoh kata/ayat untuk tiap poin — tulis Arab dengan harakat
3. Tips/trik supaya tidak lupa (akronim, cerita, atau cara kreatif lain)
4. 5 pertanyaan cepat untuk test diri sendiri

Buat semenarik mungkin ya — aku masih remaja dan butuh cara belajar yang fun!`,

      latihan: `Aku pelajar Ma'had Al-Azhar, mau latihan mengidentifikasi hukum tajwid.

Topik: [TOPIK]

Buat latihan soal:
1. Tulis 5 penggalan ayat Al-Qur'an (dengan harakat)
2. Minta aku identifikasi hukum tajwid yang ada
3. JANGAN kasih jawaban dulu — tunggu jawabanku
4. Setelah aku jawab, koreksi dan jelaskan yang benar`,

      ujian: `Aku pelajar Ma'had Al-Azhar, persiapan ujian tajwid.

Topik: [TOPIK]

Buat rangkuman siap ujian:
1. Definisi (Arab + terjemah)
2. Pembagian/macam-macam (kalau ada)
3. Contoh dari Al-Qur'an untuk tiap macam
4. Perbedaan dengan hukum yang mirip
5. Hal yang sering salah dalam ujian`,
    },
  },

  {
    id: "tafsir-mahad",
    name: "Tafsir",
    nameArabic: "التَّفْسِيرُ",
    category: "agama",
    jenjang: ["idad", "tsanawi"],
    description: "Memahami makna dan kandungan ayat-ayat Al-Qur'an sesuai tingkat Ma'had.",
    topikUtama: [
      "Pengertian dan urgensi tafsir",
      "Macam-macam tafsir",
      "Tafsir Juz Amma",
      "Asbabun Nuzul",
      "Nasikh dan Mansukh",
      "Muhkam dan Mutasyabih",
    ],
    prompts: {
      pahami: `Aku pelajar Ma'had Al-Azhar yang sedang belajar tafsir.

Topik/Ayat: [TOPIK/AYAT]

Yang aku butuhkan:
1. Tulis ayatnya (Arab + harakat + terjemah) kalau tentang ayat tertentu
2. Penjelasan makna secara umum dengan bahasa yang mudah
3. Poin-poin penting yang terkandung
4. Asbabun nuzul (kalau ada) — ceritakan singkat
5. Pelajaran/hikmah yang bisa diambil

Bahasa Indonesia yang mudah dipahami remaja ya!`,

      hafal: `Aku pelajar Ma'had Al-Azhar, mau hafal materi tafsir: [TOPIK]

Buat kartu belajar tafsir:
1. Ayat utama (Arab + harakat + terjemah)
2. Kata kunci tafsir (5-7 frasa penting)
3. Asbabun nuzul dalam 2-3 kalimat (kalau ada)
4. 3 poin penting yang WAJIB diingat
5. Pertanyaan yang sering keluar di ujian`,

      latihan: `Aku pelajar Ma'had Al-Azhar, mau latihan pemahaman tafsir.

Topik/Surah: [TOPIK/SURAH]

Buat latihan:
1. 3 pertanyaan pemahaman tentang makna ayat
2. 2 pertanyaan tentang asbabun nuzul atau konteks
3. 1 pertanyaan "apa pelajaran dari ayat ini?"
4. JANGAN kasih jawaban dulu — tunggu jawabanku`,

      ujian: `Aku pelajar Ma'had Al-Azhar, persiapan ujian tafsir.

Topik: [TOPIK]

Rangkuman ujian:
1. Ayat-ayat kunci (Arab + harakat + terjemah singkat)
2. Asbabun nuzul penting
3. Poin tafsir yang perlu diingat
4. Istilah teknis yang mungkin ditanyakan
5. Soal-soal yang biasa keluar`,
    },
  },

  {
    id: "hadits-mahad",
    name: "Hadits",
    nameArabic: "الْحَدِيثُ الشَّرِيفُ",
    category: "agama",
    jenjang: ["idad", "tsanawi"],
    description: "Mempelajari, menghafalkan, dan memahami hadits-hadits Nabi ﷺ.",
    topikUtama: [
      "Pengertian hadits, sunnah, khabar, atsar",
      "Pembagian hadits (shahih, hasan, dha'if)",
      "Sanad dan Matan",
      "Hafalan Arba'in Nawawi",
      "Kandungan hadits tentang akhlak dan ibadah",
    ],
    prompts: {
      pahami: `Aku pelajar Ma'had Al-Azhar yang belajar hadits.

Hadits/Topik: [HADITS/TOPIK]

Yang aku butuhkan:
1. Teks hadits (Arab + harakat) kalau tentang hadits tertentu
2. Terjemah yang mudah dipahami
3. Siapa yang meriwayatkan? — singkat saja
4. Apa makna/kandungan hadits ini?
5. Bagaimana cara mengamalkannya?

Jelaskan seperti bercerita — bukan hanya definisi kering!`,

      hafal: `Aku pelajar Ma'had Al-Azhar, mau hafal hadits: [HADITS/TOPIK]

Bantu aku hafal:
1. Tulis hadits dengan harakat yang jelas + terjemah
2. Pecah hadits menjadi bagian kecil yang mudah dihafal
3. Kata kunci sebagai jangkar hafalan
4. Konteks/cerita di balik hadits ini
5. Cara test diri sendiri`,

      latihan: `Aku pelajar Ma'had Al-Azhar, mau latihan materi hadits.

Topik: [TOPIK]

Buat latihan:
1. Tulis 3 hadits (Arab + terjemah) — aku sebutkan rawinya
2. 3 soal pemahaman kandungan
3. 2 soal istilah teknis hadits
4. JANGAN kasih jawaban dulu`,

      ujian: `Aku pelajar Ma'had Al-Azhar, persiapan ujian hadits.

Topik: [TOPIK]

Rangkuman ujian:
1. Hadits yang wajib dihafal (Arab + harakat + terjemah)
2. Nama rawi masing-masing
3. Istilah teknis yang mungkin ditanyakan
4. Soal-soal yang biasa keluar`,
    },
  },

  {
    id: "tauhid-mahad",
    name: "Tauhid / Aqidah",
    nameArabic: "التَّوْحِيدُ وَالْعَقِيدَةُ",
    category: "agama",
    jenjang: ["idad", "tsanawi"],
    description: "Memahami dan meyakini dasar-dasar aqidah Islam.",
    topikUtama: [
      "Pengertian tauhid dan pembagiannya",
      "Sifat-sifat Allah (Wajib, Mustahil, Jaiz)",
      "Rukun Iman yang enam",
      "Pengertian iman, Islam, ihsan",
      "Perbedaan tauhid dengan syirik",
    ],
    prompts: {
      pahami: `Aku pelajar Ma'had Al-Azhar yang belajar tauhid/aqidah.

Topik: [TOPIK]

Jelaskan dengan cara yang menarik:
1. Pengertian sederhana dengan bahasa yang mudah
2. Dalil dari Al-Qur'an atau hadits (Arab + harakat + terjemah)
3. Contoh nyata dalam kehidupan sehari-hari
4. Kenapa topik ini penting?
5. Hal yang sering disalahpahami

Buat aku benar-benar paham, bukan sekedar hafal!`,

      hafal: `Aku pelajar Ma'had Al-Azhar, mau hafal materi tauhid: [TOPIK]

Buat kartu hafalan aqidah:
1. Definisi (singkat, 1-2 kalimat)
2. Dalil utama (Arab + harakat + terjemah)
3. Pembagian/macam-macam (tabel atau poin)
4. Perbedaan dengan konsep yang berlawanan
5. Cara mudah mengingat`,

      latihan: `Aku pelajar Ma'had Al-Azhar, latihan materi tauhid.

Topik: [TOPIK]

Buat soal:
1. 3 soal pilihan ganda (4 pilihan)
2. 2 soal isian (definisikan istilah)
3. 1 soal esai pendek
4. JANGAN kasih jawaban dulu`,

      ujian: `Aku pelajar Ma'had Al-Azhar, persiapan ujian tauhid.

Topik: [TOPIK]

Rangkuman ujian:
1. Definisi-definisi kunci (Arab + terjemah)
2. Dalil-dalil utama yang perlu dihafal
3. Pembagian + penjelasan singkat
4. Perbedaan antar istilah yang mirip
5. Soal-soal yang sering keluar`,
    },
  },

  {
    id: "fiqh-mahad",
    name: "Fiqh",
    nameArabic: "الْفِقْهُ",
    category: "agama",
    jenjang: ["idad", "tsanawi"],
    description: "Hukum-hukum Islam dalam ibadah dan muamalah sesuai tingkat Ma'had.",
    topikUtama: [
      "Thaharah (wudhu, mandi, tayammum)",
      "Shalat (syarat, rukun, yang membatalkan)",
      "Shaum/Puasa",
      "Zakat",
      "Haji dan Umrah",
      "Muamalah dasar",
      "Jenazah",
    ],
    prompts: {
      pahami: `Aku pelajar Ma'had Al-Azhar yang belajar fiqh.

Topik: [TOPIK]

Jelaskan dengan cara yang mudah:
1. Pengertian singkat
2. Dalil (ayat/hadits) — Arab + harakat + terjemah
3. Hukumnya apa?
4. Syarat-syarat atau rukun-rukun (daftar yang jelas)
5. Hal yang sering membingungkan + contoh kasus nyata`,

      hafal: `Aku pelajar Ma'had Al-Azhar, mau hafal materi fiqh: [TOPIK]

Buat kartu fiqh:
1. Definisi (1-2 kalimat)
2. Hukum + dalil singkat
3. Syarat/Rukun dalam DAFTAR BERNOMOR
4. Yang membatalkan (kalau ada)
5. Tips hafalan + soal cepat (5 pertanyaan)`,

      latihan: `Aku pelajar Ma'had Al-Azhar, latihan fiqh.

Topik: [TOPIK]

Buat soal kasus fiqh:
1. 3 kasus nyata — aku yang tentukan hukumnya
2. 2 soal isian — definisi atau sebutkan syarat/rukun
3. JANGAN kasih jawaban — tunggu jawabanku
4. Koreksi dengan dalil yang relevan`,

      ujian: `Aku pelajar Ma'had Al-Azhar, persiapan ujian fiqh.

Topik: [TOPIK]

Rangkuman siap tulis:
1. Definisi + hukum + dalil singkat
2. Syarat-syarat (bernomor)
3. Rukun-rukun (bernomor)
4. Yang membatalkan (bernomor)
5. Perbedaan dengan topik fiqh yang mirip
6. Soal yang sering keluar`,
    },
  },

  {
    id: "nahwu-mahad",
    name: "Nahwu",
    nameArabic: "النَّحْوُ",
    category: "agama",
    jenjang: ["idad", "tsanawi"],
    description: "Kaidah tata bahasa Arab — i'rab dan kedudukan kata dalam kalimat.",
    topikUtama: [
      "Kalam dan pembagiannya (Isim, Fi'il, Harf)",
      "I'rab (rafa', nashab, jar, jazm) dan tanda-tandanya",
      "Mubtada' dan Khabar",
      "Fa'il dan Maf'ul bih",
      "Na'at (sifat) dan Man'ut",
      "Jumlah Ismiyyah dan Fi'liyyah",
      "Dzharaf Makan dan Zaman",
    ],
    prompts: {
      pahami: `Aku pelajar Ma'had Al-Azhar yang belajar nahwu.

Topik: [TOPIK]

Jelaskan dengan sangat jelas:
1. Pengertian dalam bahasa sederhana
2. Contoh kalimat Arab sederhana (dengan harakat + terjemah)
3. Tanda-tanda atau ciri-cirinya
4. Kaidah penting yang perlu diingat
5. Lebih banyak contoh dari Al-Qur'an atau kalimat sederhana

Aku masih belajar — tolong jangan terlalu teknis tapi tetap akurat!`,

      hafal: `Aku pelajar Ma'had Al-Azhar, mau hafal kaidah nahwu: [TOPIK]

Buat kartu hafalan:
1. Kaidah dalam 1-2 kalimat (Arab + terjemah)
2. Tanda-tanda i'rab yang relevan (tabel)
3. 5 contoh kalimat (Arab + harakat + terjemah + penjelasan)
4. Pengecualian penting
5. Cara membedakan dengan kaidah yang mirip`,

      latihan: `Aku pelajar Ma'had Al-Azhar, latihan i'rab dan nahwu.

Topik: [TOPIK]

Buat soal i'rab:
1. Tulis 5 kalimat Arab sederhana (dengan harakat)
2. Minta aku tentukan kedudukan kata yang ditandai
3. JANGAN kasih jawaban dulu
4. Koreksi dengan penjelasan kaidah yang berlaku

Mulai dari yang mudah, naik ke yang lebih sulit.`,

      ujian: `Aku pelajar Ma'had Al-Azhar, persiapan ujian nahwu.

Topik: [TOPIK]

Rangkuman ujian:
1. Definisi (Arab + terjemah)
2. Kaidah utama (poin-poin)
3. Tanda-tanda i'rab (tabel)
4. Contoh dari Al-Qur'an (Arab + harakat)
5. Hal yang sering salah + soal yang biasa keluar`,
    },
  },

  {
    id: "sharf-mahad",
    name: "Sharf",
    nameArabic: "الصَّرْفُ",
    category: "agama",
    jenjang: ["idad", "tsanawi"],
    description: "Perubahan bentuk kata dalam bahasa Arab — wazan, tashrif, dan derivasi kata.",
    topikUtama: [
      "Wazan Fi'il Tsulatsi Mujarrad (6 bab)",
      "Fi'il Mazid",
      "Tashrif (madhi, mudhari', masdar, isim fa'il, isim maf'ul, amar, nahi)",
      "Fi'il Shahih dan Fi'il Mu'tal",
      "Fi'il Ajwaf, Naqish, Mitsil",
    ],
    prompts: {
      pahami: `Aku pelajar Ma'had Al-Azhar yang belajar sharf.

Topik: [TOPIK]

Jelaskan:
1. Pengertian sederhana
2. Contoh tashrif/wazan — tabel yang rapi
3. Cara mengenali pola ini di teks Arab
4. Tips mengingat (karena sharf banyak hafalan)
5. Contoh kata Arab yang sering kita dengar yang mengikuti pola ini`,

      hafal: `Aku pelajar Ma'had Al-Azhar, mau hafal sharf: [TOPIK/WAZAN]

Buat tabel tashrif lengkap:
1. Tashrif istilahi — fi'il madhi sampai fi'il nahi (tabel rapi, Arab + harakat)
2. Tashrif lughawi — untuk semua dhamir
3. Tips menghafal pola perubahan
4. Kata-kata yang sering dipakai dengan wazan ini`,

      latihan: `Aku pelajar Ma'had Al-Azhar, latihan sharf.

Topik: [TOPIK/WAZAN]

Buat latihan:
1. Berikan 5 kata Arab — aku tashrif-kan semua bentuknya
2. Berikan 5 bentuk kata — aku tebak fi'il apa dan wazan apa
3. JANGAN kasih jawaban dulu
4. Koreksi dengan penjelasan wazan yang benar`,

      ujian: `Aku pelajar Ma'had Al-Azhar, persiapan ujian sharf.

Topik: [TOPIK]

Rangkuman ujian:
1. Wazan/pola dalam tabel (Arab + harakat)
2. Tabel tashrif istilahi lengkap
3. Perubahan khusus (untuk fi'il mu'tal dll)
4. Perbedaan dengan wazan yang mirip
5. Contoh soal yang biasa keluar`,
    },
  },

  {
    id: "sirah-mahad",
    name: "Sirah Nabawiyah",
    nameArabic: "السِّيرَةُ النَّبَوِيَّةُ",
    category: "agama",
    jenjang: ["idad", "tsanawi"],
    description: "Perjalanan hidup Nabi Muhammad ﷺ dan sejarah awal Islam.",
    topikUtama: [
      "Nasab dan kelahiran Nabi ﷺ",
      "Masa kecil dan sebelum kenabian",
      "Awal wahyu dan dakwah sirri",
      "Hijrah ke Habasyah",
      "Isra' Mi'raj",
      "Hijrah ke Madinah",
      "Perang Badr, Uhud, Khandaq",
      "Fath Makkah",
      "Haji Wada' dan wafatnya Nabi ﷺ",
    ],
    prompts: {
      pahami: `Aku pelajar Ma'had Al-Azhar yang belajar Sirah Nabawiyah.

Topik/Peristiwa: [TOPIK]

Ceritakan dengan menarik:
1. Latar belakang — apa yang terjadi sebelumnya?
2. Kronologi kejadian — ceritakan seperti bercerita
3. Tokoh-tokoh kunci yang terlibat
4. Hikmah dan pelajaran dari peristiwa ini
5. Kaitannya dengan kehidupan kita sekarang

Aku suka sejarah kalau diceritakan dengan hidup — bukan hafalan tanggal dan nama saja!`,

      hafal: `Aku pelajar Ma'had Al-Azhar, mau hafal sirah: [TOPIK]

Buat timeline hafalan:
1. Tanggal/tahun penting (format mudah diingat)
2. Tokoh kunci + peran singkat mereka
3. Urutan kejadian dalam 5-7 poin
4. Angka-angka penting
5. Kutipan/kata-kata Nabi ﷺ yang relevan (Arab + terjemah)`,

      latihan: `Aku pelajar Ma'had Al-Azhar, latihan sirah.

Topik: [TOPIK]

Buat soal:
1. 3 soal fakta (kapan, siapa, di mana)
2. 2 soal analisis (mengapa, bagaimana)
3. 1 soal refleksi (apa hikmahnya?)
4. JANGAN kasih jawaban dulu`,

      ujian: `Aku pelajar Ma'had Al-Azhar, persiapan ujian sirah.

Topik: [TOPIK]

Rangkuman ujian:
1. Kronologi singkat (timeline)
2. Tokoh penting + peran mereka
3. Fakta-fakta kunci
4. Hikmah yang perlu disebutkan
5. Soal-soal yang biasa keluar`,
    },
  },

  {
    id: "balaghah-mahad",
    name: "Balaghah",
    nameArabic: "الْبَلَاغَةُ",
    category: "agama",
    jenjang: ["tsanawi"],
    description: "Ilmu keindahan bahasa Arab — ma'ani, bayan, dan badi'.",
    topikUtama: [
      "Pengertian Balaghah dan pembagiannya",
      "Ilmu Ma'ani — Khabar dan Insya'",
      "Tasybih (perumpamaan)",
      "Majaz dan Isti'arah",
      "Kinayah",
      "Ilmu Badi' — Thibaq, Muqabalah, Jinas",
    ],
    prompts: {
      pahami: `Aku pelajar Ma'had Al-Azhar yang belajar balaghah.

Topik: [TOPIK]

Jelaskan:
1. Pengertian sederhana
2. Contoh dari Al-Qur'an (Arab + harakat + terjemah)
3. Mengapa gaya bahasa ini digunakan? Apa efeknya?
4. Cara mengidentifikasi ketika membaca teks Arab
5. Bedanya dengan gaya bahasa lain yang mirip

Balaghah itu seni bahasa — buat aku bisa merasakannya!`,

      hafal: `Aku pelajar Ma'had Al-Azhar, mau hafal balaghah: [TOPIK]

Buat kartu hafalan:
1. Definisi (Arab + terjemah)
2. Macam-macam + penjelasan singkat
3. 3 contoh dari Al-Qur'an (Arab + harakat)
4. Perbedaan dengan gaya bahasa yang mirip
5. Kata kunci untuk mengidentifikasi dalam teks`,

      latihan: `Aku pelajar Ma'had Al-Azhar, latihan balaghah.

Topik: [TOPIK]

Buat soal analisis:
1. 3 kalimat/ayat Arab — aku identifikasi unsur balaghahnya
2. 2 contoh — aku jelaskan efek/keindahan bahasanya
3. JANGAN kasih jawaban dulu`,

      ujian: `Aku pelajar Ma'had Al-Azhar, persiapan ujian balaghah.

Topik: [TOPIK]

Rangkuman ujian:
1. Definisi (Arab + terjemah)
2. Pembagian/macam-macam
3. Contoh dari Al-Qur'an
4. Cara mengidentifikasi dalam teks
5. Soal-soal yang sering keluar`,
    },
  },

  // ═══════════════════════════════════════
  // MADDAH UMUM — I'DADI
  // ═══════════════════════════════════════

  {
    id: "matematika-idad",
    name: "Matematika (I'dadi)",
    nameArabic: "الرِّيَاضِيَّاتُ",
    category: "umum",
    jenjang: ["idad"],
    description: "Matematika dasar-menengah tingkat I'dadi, diajarkan dalam bahasa Arab.",
    topikUtama: [
      "الأعداد الصحيحة — Bilangan Bulat",
      "الكسور — Pecahan",
      "النسب والتناسب — Perbandingan",
      "المعادلات الخطية — Persamaan Linear",
      "الهندسة الأساسية — Geometri Dasar",
      "الجبر الأساسي — Aljabar Dasar",
    ],
    prompts: {
      pahami: `Aku pelajar Ma'had Al-Azhar (I'dadi) yang belajar matematika dalam bahasa Arab.

Topik: [TOPIK]

Yang aku butuhkan:
1. Jelaskan konsepnya dulu dalam bahasa Indonesia yang mudah
2. Tunjukkan istilah Arabnya yang dipakai di buku pelajaran
3. Contoh soal bertahap — mulai dari yang mudah
4. Cara/langkah penyelesaian yang jelas
5. Tips supaya tidak bingung dengan istilah Arab-nya

Aku sering bingung karena harus paham konsep SEKALIGUS istilah Arabnya!`,

      hafal: `Aku pelajar Ma'had Al-Azhar (I'dadi), mau hafal matematika: [TOPIK]

Buat kartu hafalan:
1. Rumus utama (Arab + Latin + penjelasan tiap variabel)
2. Tabel istilah: Arab ↔ Indonesia
3. Langkah-langkah penyelesaian (poin bernomor)
4. Contoh soal + jawaban lengkap (1 contoh)
5. Kesalahan umum yang harus dihindari`,

      latihan: `Aku pelajar Ma'had Al-Azhar (I'dadi), latihan matematika.

Topik: [TOPIK]

Buat 5 soal bertahap:
- Format campuran seperti buku Ma'had
- Mulai mudah, naik ke yang lebih sulit
- JANGAN kasih jawaban dulu
- Koreksi dengan langkah penyelesaian lengkap`,

      ujian: `Aku pelajar Ma'had Al-Azhar (I'dadi), persiapan ujian matematika.

Topik: [TOPIK]

Rangkuman ujian:
1. Rumus-rumus WAJIB dihafal (Arab + keterangan)
2. Istilah Arab penting (tabel: Arab ↔ Indonesia)
3. Contoh soal + langkah penyelesaian (2 contoh)
4. Tips mengerjakan soal matematika Arab dengan cepat`,
    },
  },

  {
    id: "sains-idad",
    name: "Sains / IPA (I'dadi)",
    nameArabic: "الْعُلُومُ",
    category: "umum",
    jenjang: ["idad"],
    description: "IPA tingkat I'dadi mencakup fisika, kimia, dan biologi dasar dalam bahasa Arab.",
    topikUtama: [
      "المادة وخصائصها — Materi dan Sifatnya",
      "الخلية — Sel",
      "الضوء والكهرباء — Cahaya dan Listrik",
      "جسم الإنسان — Tubuh Manusia",
      "البيئة والنظام البيئي — Lingkungan dan Ekosistem",
    ],
    prompts: {
      pahami: `Aku pelajar Ma'had Al-Azhar (I'dadi) yang belajar sains dalam bahasa Arab.

Topik: [TOPIK]

Jelaskan:
1. Konsep utama dalam bahasa Indonesia yang mudah
2. Istilah Arab penting (tabel: Arab ↔ Indonesia)
3. Contoh dari kehidupan sehari-hari
4. Penjelasan ilmiahnya (singkat dan jelas)
5. Fakta menarik tentang topik ini`,

      hafal: `Aku pelajar Ma'had Al-Azhar (I'dadi), mau hafal sains: [TOPIK]

Buat kartu hafalan:
1. Konsep kunci dalam 3-5 poin singkat
2. Tabel istilah: Arab ↔ Indonesia
3. Fakta-fakta penting yang sering keluar di ujian
4. Cara mengingat dengan asosiasi atau cerita`,

      latihan: `Aku pelajar Ma'had Al-Azhar (I'dadi), latihan sains.

Topik: [TOPIK]

Buat soal:
1. 3 soal pemahaman konsep
2. 2 soal penerapan (kasus nyata)
3. 1 soal analisis
4. JANGAN kasih jawaban dulu`,

      ujian: `Aku pelajar Ma'had Al-Azhar (I'dadi), persiapan ujian sains.

Topik: [TOPIK]

Rangkuman ujian:
1. Definisi (Arab + Indonesia)
2. Poin-poin penting
3. Istilah Arab kunci (tabel)
4. Contoh dan penerapan
5. Soal yang biasa keluar`,
    },
  },

  {
    id: "bahasa-inggris-mahad",
    name: "Bahasa Inggris",
    nameArabic: "اللُّغَةُ الْإِنْجِلِيزِيَّةُ",
    category: "umum",
    jenjang: ["idad", "tsanawi"],
    description: "Bahasa Inggris tingkat Ma'had — grammar, vocabulary, reading, dan writing.",
    topikUtama: [
      "Tenses (Present, Past, Future)",
      "Parts of Speech",
      "Articles dan Prepositions",
      "Reading Comprehension",
      "Writing — paragraphs",
      "Vocabulary building",
    ],
    prompts: {
      pahami: `Aku pelajar Ma'had Al-Azhar yang belajar Bahasa Inggris.

Topik: [TOPIK]

Jelaskan:
1. Aturan/konsep dalam bahasa Indonesia
2. Contoh kalimat sederhana (minimal 5)
3. Kesalahan umum yang sering dilakukan
4. Tips mudah mengingat aturan ini
5. Latihan cepat (3-5 soal)`,

      hafal: `Aku pelajar Ma'had Al-Azhar, mau hafal Bahasa Inggris: [TOPIK]

Buat kartu hafalan:
1. Aturan dalam poin singkat
2. Contoh kalimat tiap aturan
3. Vocabulary penting terkait topik
4. Pengecualian yang perlu diingat
5. Tips mudah mengingat`,

      latihan: `Aku pelajar Ma'had Al-Azhar, latihan Bahasa Inggris.

Topik: [TOPIK]

Buat latihan:
1. 5 soal fill-in-the-blank
2. 3 soal perbaiki kalimat yang salah
3. 2 soal buat kalimat sendiri
4. JANGAN kasih jawaban dulu`,

      ujian: `Aku pelajar Ma'had Al-Azhar, persiapan ujian Bahasa Inggris.

Topik: [TOPIK]

Rangkuman ujian:
1. Aturan/rumus utama
2. Contoh kalimat
3. Vocabulary penting
4. Kesalahan yang harus dihindari
5. Tipe soal yang biasa keluar`,
    },
  },

  // ═══════════════════════════════════════
  // MADDAH UMUM — TSANAWI ILMI (IPA)
  // ═══════════════════════════════════════

  {
    id: "matematika-tsanawi",
    name: "Matematika (Tsanawi)",
    nameArabic: "الرِّيَاضِيَّاتُ",
    category: "umum",
    jenjang: ["tsanawi"],
    jurusan: ["ilmi", "adabi"],
    description: "Matematika tingkat Tsanawi — Bahta dan Tathbiqi dalam bahasa Arab.",
    topikUtama: [
      "المتتاليات والمتسلسلات — Barisan dan Deret",
      "المثلثات المتقدمة — Trigonometri",
      "الاحتمالات — Peluang",
      "المصفوفات — Matriks",
      "الحساب التفاضلي — Kalkulus Diferensial",
      "الحساب التكاملي — Kalkulus Integral",
      "الهندسة التحليلية — Geometri Analitik",
      "الدوال والعلاقات — Fungsi dan Relasi",
    ],
    prompts: {
      pahami: `Aku pelajar Ma'had Al-Azhar (Tsanawi) yang belajar matematika lanjut dalam bahasa Arab.

Topik: [TOPIK]

Yang aku butuhkan:
1. Penjelasan konsep dalam bahasa Indonesia yang jelas
2. Istilah Arab untuk konsep ini + simbol yang dipakai
3. Rumus lengkap dengan keterangan tiap variabel
4. Contoh soal bertahap dengan langkah penyelesaian
5. Kapan/di mana konsep ini dipakai dalam kehidupan nyata?`,

      hafal: `Aku pelajar Ma'had Al-Azhar Tsanawi, mau hafal matematika: [TOPIK]

Buat kartu hafalan:
1. Rumus-rumus utama (notasi Arab)
2. Tabel: Arab ↔ Indonesia ↔ Simbol
3. Kondisi penggunaan tiap rumus
4. Soal cepat untuk test diri (3 soal + jawaban)`,

      latihan: `Aku pelajar Ma'had Al-Azhar Tsanawi, latihan matematika.

Topik: [TOPIK]

Buat 5 soal bertahap:
- Format seperti soal ujian Ma'had
- Sertakan soal cerita (konteks nyata)
- JANGAN kasih jawaban dulu
- Koreksi + langkah penyelesaian lengkap`,

      ujian: `Aku pelajar Ma'had Al-Azhar Tsanawi, persiapan ujian matematika.

Topik: [TOPIK]

Rangkuman ujian:
1. Rumus WAJIB dihafal (Arab → rumus → keterangan)
2. Tabel istilah Arab penting
3. Contoh soal + solusi (3 soal)
4. Kesalahan umum dan cara menghindarinya`,
    },
  },

  {
    id: "fisika-tsanawi",
    name: "Fisika",
    nameArabic: "الْفِيزِيَاءُ",
    category: "umum",
    jenjang: ["tsanawi"],
    jurusan: ["ilmi"],
    description: "Fisika Tsanawi — mekanika, termodinamika, gelombang, listrik, optik dalam bahasa Arab.",
    topikUtama: [
      "الحركة والقوة — Gerak dan Gaya",
      "الشغل والطاقة — Usaha dan Energi",
      "الحرارة — Kalor",
      "الموجات والصوت — Gelombang dan Bunyi",
      "الضوء والبصريات — Cahaya dan Optik",
      "الكهرباء والمغناطيسية — Listrik dan Magnet",
    ],
    prompts: {
      pahami: `Aku pelajar Ma'had Al-Azhar (Tsanawi Ilmi) yang belajar fisika dalam bahasa Arab.

Topik: [TOPIK]

Jelaskan dengan cara yang konkret:
1. Apa yang terjadi secara fisik? (gunakan analogi sehari-hari)
2. Istilah Arab + simbol yang dipakai (tabel)
3. Rumus-rumus + keterangan tiap simbol
4. Contoh soal dengan langkah penyelesaian
5. Fenomena alam atau teknologi yang berhubungan`,

      hafal: `Aku pelajar Ma'had Al-Azhar Tsanawi Ilmi, mau hafal fisika: [TOPIK]

Buat kartu hafalan:
1. Hukum/prinsip utama (nama Arab + terjemah)
2. Rumus lengkap dengan satuan SI
3. Tabel: Arab ↔ Indonesia ↔ Simbol ↔ Satuan
4. Kondisi berlaku / batasan
5. Contoh aplikasi nyata yang mudah diingat`,

      latihan: `Aku pelajar Ma'had Al-Azhar Tsanawi Ilmi, latihan fisika.

Topik: [TOPIK]

Buat soal:
1. 2 soal hitungan mudah
2. 2 soal hitungan sedang
3. 1 soal analisis (mengapa/bagaimana)
4. JANGAN kasih jawaban dulu
5. Koreksi dengan langkah lengkap`,

      ujian: `Aku pelajar Ma'had Al-Azhar Tsanawi Ilmi, persiapan ujian fisika.

Topik: [TOPIK]

Rangkuman ujian:
1. Hukum/prinsip (nama Arab + isi hukum)
2. Rumus lengkap (dengan satuan)
3. Istilah Arab penting (tabel)
4. Soal tipe ujian + solusi (2-3 soal)
5. Hal yang sering salah`,
    },
  },

  {
    id: "kimia-tsanawi",
    name: "Kimia",
    nameArabic: "الْكِيمِيَاءُ",
    category: "umum",
    jenjang: ["tsanawi"],
    jurusan: ["ilmi"],
    description: "Kimia Tsanawi — atom, ikatan, reaksi, larutan, organik dalam bahasa Arab.",
    topikUtama: [
      "الذرة والجدول الدوري — Atom dan Tabel Periodik",
      "الروابط الكيميائية — Ikatan Kimia",
      "المعادلات الكيميائية — Persamaan Kimia",
      "الأحماض والقواعد — Asam dan Basa",
      "المحاليل والتركيز — Larutan dan Konsentrasi",
      "الكيمياء العضوية — Kimia Organik Dasar",
    ],
    prompts: {
      pahami: `Aku pelajar Ma'had Al-Azhar (Tsanawi Ilmi) yang belajar kimia dalam bahasa Arab.

Topik: [TOPIK]

Jelaskan:
1. Apa yang terjadi di tingkat molekul/atom? (dengan analogi sederhana)
2. Istilah Arab kimia (tabel: Arab ↔ Indonesia)
3. Rumus/persamaan yang relevan
4. Contoh dari kehidupan sehari-hari
5. Langkah menyelesaikan soal tipe ini`,

      hafal: `Aku pelajar Ma'had Al-Azhar Tsanawi Ilmi, mau hafal kimia: [TOPIK]

Buat kartu hafalan:
1. Konsep kunci + definisi Arab
2. Simbol/lambang kimia yang dipakai
3. Rumus/hukum yang berlaku
4. Tabel: Arab ↔ Indonesia ↔ Simbol
5. Cara mengingat + contoh reaksi representatif`,

      latihan: `Aku pelajar Ma'had Al-Azhar Tsanawi Ilmi, latihan kimia.

Topik: [TOPIK]

Buat soal:
1. 2 soal hitungan/setarakan persamaan
2. 2 soal pemahaman konsep
3. 1 soal analisis kasus
4. JANGAN kasih jawaban dulu`,

      ujian: `Aku pelajar Ma'had Al-Azhar Tsanawi Ilmi, persiapan ujian kimia.

Topik: [TOPIK]

Rangkuman ujian:
1. Definisi (Arab + Indonesia)
2. Rumus/hukum
3. Istilah Arab penting (tabel)
4. Contoh soal + solusi
5. Kesalahan umum`,
    },
  },

  {
    id: "biologi-tsanawi",
    name: "Biologi",
    nameArabic: "الْأَحْيَاءُ",
    category: "umum",
    jenjang: ["tsanawi"],
    jurusan: ["ilmi"],
    description: "Biologi Tsanawi — sel, genetika, anatomi, ekologi dalam bahasa Arab.",
    topikUtama: [
      "الخلية ومكوناتها — Sel dan Organel",
      "الأنسجة والأعضاء — Jaringan dan Organ",
      "جهاز الدوران والتنفس والهضم — Sistem Tubuh",
      "جهاز العصبي — Sistem Saraf",
      "الوراثة والجينات — Genetika",
      "البيئة والنظام البيئي — Ekosistem",
    ],
    prompts: {
      pahami: `Aku pelajar Ma'had Al-Azhar (Tsanawi Ilmi) yang belajar biologi dalam bahasa Arab.

Topik: [TOPIK]

Jelaskan:
1. Gambaran besar — apa fungsi sistem/organ ini?
2. Komponen utama + istilah Arabnya (tabel/daftar)
3. Proses yang terjadi — jelaskan step by step seperti bercerita
4. Diagram sederhana yang bisa aku gambar (deskripsikan)
5. Fakta menarik tentang topik ini`,

      hafal: `Aku pelajar Ma'had Al-Azhar Tsanawi Ilmi, mau hafal biologi: [TOPIK]

Buat kartu hafalan:
1. Istilah kunci (tabel: Arab ↔ Indonesia)
2. Fungsi tiap komponen (tabel: komponen → fungsi)
3. Proses utama (poin bernomor)
4. Skema yang bisa aku gambar ulang
5. Fakta hafalan penting (angka, persentase)`,

      latihan: `Aku pelajar Ma'had Al-Azhar Tsanawi Ilmi, latihan biologi.

Topik: [TOPIK]

Buat soal:
1. 3 soal identifikasi (nama/fungsi bagian)
2. 2 soal proses (urutan/tahapan)
3. 1 soal aplikasi (apa yang terjadi kalau...)
4. JANGAN kasih jawaban dulu`,

      ujian: `Aku pelajar Ma'had Al-Azhar Tsanawi Ilmi, persiapan ujian biologi.

Topik: [TOPIK]

Rangkuman ujian:
1. Definisi (Arab + Indonesia)
2. Komponen dan fungsi (tabel)
3. Proses penting (poin bernomor)
4. Istilah Arab kunci
5. Soal yang biasa keluar`,
    },
  },

  // ═══════════════════════════════════════
  // MADDAH UMUM — TSANAWI ADABI (IPS)
  // ═══════════════════════════════════════

  {
    id: "sejarah-tsanawi",
    name: "Sejarah",
    nameArabic: "التَّارِيخُ",
    category: "umum",
    jenjang: ["tsanawi"],
    jurusan: ["adabi"],
    description: "Sejarah Islam dan dunia tingkat Tsanawi dalam bahasa Arab.",
    topikUtama: [
      "الحضارة الإسلامية — Peradaban Islam",
      "الخلافة الراشدة والأموية والعباسية",
      "الحروب الصليبية — Perang Salib",
      "الإمبراطورية العثمانية",
      "الحضارات القديمة",
      "العصر الحديث",
    ],
    prompts: {
      pahami: `Aku pelajar Ma'had Al-Azhar (Tsanawi Adabi) yang belajar sejarah dalam bahasa Arab.

Topik: [TOPIK]

Ceritakan dengan menarik:
1. Latar belakang — apa kondisi saat itu?
2. Kronologi peristiwa — naratif, bukan daftar kering
3. Tokoh-tokoh penting + peran singkat mereka
4. Dampak/pengaruh peristiwa ini
5. Pelajaran yang bisa diambil`,

      hafal: `Aku pelajar Ma'had Al-Azhar Tsanawi Adabi, mau hafal sejarah: [TOPIK]

Buat timeline hafalan:
1. Tahun-tahun penting + peristiwa
2. Tokoh kunci + identitas singkat
3. Urutan kejadian (5-7 poin)
4. Angka-angka penting
5. Kata kunci untuk tiap sub-topik`,

      latihan: `Aku pelajar Ma'had Al-Azhar Tsanawi Adabi, latihan sejarah.

Topik: [TOPIK]

Buat soal:
1. 3 soal fakta (kapan, siapa, di mana)
2. 2 soal analisis (mengapa, bagaimana)
3. 1 soal evaluasi (apa dampaknya?)
4. JANGAN kasih jawaban dulu`,

      ujian: `Aku pelajar Ma'had Al-Azhar Tsanawi Adabi, persiapan ujian sejarah.

Topik: [TOPIK]

Rangkuman ujian:
1. Timeline singkat
2. Tokoh penting + kontribusi
3. Fakta kunci yang sering ditanyakan
4. Sebab dan dampak
5. Soal yang biasa keluar`,
    },
  },

  {
    id: "geografi-tsanawi",
    name: "Geografi",
    nameArabic: "الْجُغْرَافِيَا",
    category: "umum",
    jenjang: ["tsanawi"],
    jurusan: ["adabi"],
    description: "Geografi Tsanawi — alam, manusia, wilayah, dan geografi Islam dalam bahasa Arab.",
    topikUtama: [
      "الخريطة والإحداثيات — Peta dan Koordinat",
      "طبقات الأرض — Lapisan Bumi",
      "المناخ والطقس — Iklim dan Cuaca",
      "السكان والتوزع — Penduduk",
      "الموارد الطبيعية — Sumber Daya Alam",
      "العالم الإسلامي — Dunia Islam",
    ],
    prompts: {
      pahami: `Aku pelajar Ma'had Al-Azhar (Tsanawi Adabi) yang belajar geografi dalam bahasa Arab.

Topik: [TOPIK]

Jelaskan:
1. Gambaran umum topik ini
2. Istilah Arab geografi yang penting (tabel)
3. Contoh dari wilayah yang kita kenal (Mesir, Indonesia)
4. Hubungan dengan kehidupan manusia
5. Fakta menarik atau statistik yang mudah diingat`,

      hafal: `Aku pelajar Ma'had Al-Azhar Tsanawi Adabi, mau hafal geografi: [TOPIK]

Buat kartu hafalan:
1. Konsep kunci + definisi Arab
2. Data/angka penting
3. Nama-nama penting (negara, sungai, gunung) + Arab-nya
4. Pola/hubungan penting
5. Cara mengingat dengan asosiasi`,

      latihan: `Aku pelajar Ma'had Al-Azhar Tsanawi Adabi, latihan geografi.

Topik: [TOPIK]

Buat soal:
1. 3 soal identifikasi/lokasi
2. 2 soal penjelasan fenomena
3. 1 soal analisis hubungan alam-manusia
4. JANGAN kasih jawaban dulu`,

      ujian: `Aku pelajar Ma'had Al-Azhar Tsanawi Adabi, persiapan ujian geografi.

Topik: [TOPIK]

Rangkuman ujian:
1. Definisi (Arab + Indonesia)
2. Data dan angka penting
3. Istilah Arab kunci (tabel)
4. Contoh wilayah/kasus
5. Soal yang biasa keluar`,
    },
  },

  {
    id: "falsafah-mantiq",
    name: "Filsafat & Mantiq",
    nameArabic: "الْفَلْسَفَةُ وَالْمَنْطِقُ",
    category: "umum",
    jenjang: ["tsanawi"],
    jurusan: ["adabi"],
    description: "Dasar-dasar filsafat dan logika (mantiq) di tingkat Tsanawi.",
    topikUtama: [
      "تعريف الفلسفة وفروعها",
      "الفلسفة اليونانية (سقراط، أفلاطون، أرسطو)",
      "الفلسفة الإسلامية (الكندي، ابن سينا، الفارابي)",
      "علم المنطق والقضايا المنطقية",
      "القياس المنطقي (السيلوجيزم)",
      "نظرية المعرفة",
    ],
    prompts: {
      pahami: `Aku pelajar Ma'had Al-Azhar (Tsanawi Adabi) yang belajar filsafat dan mantiq.

Topik: [TOPIK]

Jelaskan dengan cara yang membuat aku bisa berpikir:
1. Pertanyaan besar yang coba dijawab topik ini
2. Penjelasan konsep + istilah Arabnya
3. Contoh konkret dari kehidupan nyata
4. Hubungan dengan pemikiran Islam
5. Mengapa topik ini penting?

Filsafat bukan hafalan — bantu aku BERPIKIR!`,

      hafal: `Aku pelajar Ma'had Al-Azhar Tsanawi Adabi, mau hafal filsafat/mantiq: [TOPIK]

Buat kartu hafalan:
1. Definisi (Arab + Indonesia)
2. Tokoh kunci + pemikiran utama (1-2 kalimat/tokoh)
3. Istilah teknis penting (tabel)
4. Perbedaan dengan aliran/konsep yang mirip
5. Pertanyaan yang sering keluar di ujian`,

      latihan: `Aku pelajar Ma'had Al-Azhar Tsanawi Adabi, latihan filsafat/mantiq.

Topik: [TOPIK]

Buat soal:
1. 2 soal definisi/pengertian
2. 2 soal "bandingkan pemikiran X dengan Y"
3. 1 soal aplikasi mantiq (buat silogisme tentang...)
4. JANGAN kasih jawaban dulu`,

      ujian: `Aku pelajar Ma'had Al-Azhar Tsanawi Adabi, persiapan ujian filsafat/mantiq.

Topik: [TOPIK]

Rangkuman ujian:
1. Definisi (Arab + Indonesia)
2. Tokoh + pemikiran utama
3. Istilah teknis penting (tabel)
4. Perbedaan antar konsep/aliran
5. Soal yang biasa keluar`,
    },
  },

  {
    id: "ilmu-nafs",
    name: "Ilmu Nafs (Psikologi)",
    nameArabic: "عِلْمُ النَّفْسِ",
    category: "umum",
    jenjang: ["tsanawi"],
    jurusan: ["adabi"],
    description: "Psikologi dasar — perilaku manusia, emosi, belajar, dan kepribadian.",
    topikUtama: [
      "تعريف علم النفس",
      "الإحساس والإدراك — Sensasi dan Persepsi",
      "الذاكرة — Memori",
      "التعلم — Teori Belajar",
      "التفكير والذكاء — Berpikir dan Kecerdasan",
      "الدوافع والانفعالات — Motivasi dan Emosi",
      "الشخصية — Kepribadian",
      "الصحة النفسية — Kesehatan Mental",
    ],
    prompts: {
      pahami: `Aku pelajar Ma'had Al-Azhar (Tsanawi Adabi) yang belajar ilmu nafs/psikologi.

Topik: [TOPIK]

Jelaskan dengan relate ke kehidupanku:
1. Apa yang dipelajari? (definisi sederhana)
2. Istilah Arab psikologi (tabel)
3. Contoh dari kehidupan nyata
4. Tokoh/psikolog utama yang berhubungan
5. Hubungan dengan ajaran Islam`,

      hafal: `Aku pelajar Ma'had Al-Azhar Tsanawi Adabi, mau hafal ilmu nafs: [TOPIK]

Buat kartu hafalan:
1. Definisi (Arab + Indonesia)
2. Tokoh + teori utama (tabel: tokoh → teori → inti)
3. Istilah teknis (tabel: Arab ↔ Indonesia)
4. Tahapan/proses kalau ada
5. Contoh fenomena nyata`,

      latihan: `Aku pelajar Ma'had Al-Azhar Tsanawi Adabi, latihan ilmu nafs.

Topik: [TOPIK]

Buat soal:
1. 2 soal definisi
2. 2 soal "berikan contoh nyata untuk..."
3. 1 soal "bandingkan teori X dengan teori Y"
4. JANGAN kasih jawaban dulu`,

      ujian: `Aku pelajar Ma'had Al-Azhar Tsanawi Adabi, persiapan ujian ilmu nafs.

Topik: [TOPIK]

Rangkuman ujian:
1. Definisi (Arab + Indonesia)
2. Tokoh + teori utama
3. Istilah teknis penting (tabel)
4. Poin-poin penting yang wajib diingat
5. Soal yang biasa keluar`,
    },
  },

  {
    id: "statistik-adabi",
    name: "Statistik",
    nameArabic: "الْإِحْصَاءُ",
    category: "umum",
    jenjang: ["tsanawi"],
    jurusan: ["adabi"],
    description: "Statistik dasar Tsanawi Adabi dalam bahasa Arab.",
    topikUtama: [
      "مفهوم الإحصاء وجمع البيانات",
      "المتوسط والوسيط والمنوال — Mean, Median, Modus",
      "التشتت والانحراف المعياري",
      "الاحتمالات الأساسية — Probabilitas",
      "الارتباط والانحدار — Korelasi dan Regresi",
    ],
    prompts: {
      pahami: `Aku pelajar Ma'had Al-Azhar (Tsanawi Adabi) yang belajar statistik dalam bahasa Arab.

Topik: [TOPIK]

Jelaskan:
1. Kegunaan konsep ini di dunia nyata
2. Istilah Arab statistik (tabel)
3. Rumus/cara hitung + contoh dengan data nyata
4. Kapan dipakai (mean vs median vs modus — mana yang tepat kapan?)
5. Cara membaca/interpretasi hasilnya`,

      hafal: `Aku pelajar Ma'had Al-Azhar Tsanawi Adabi, mau hafal statistik: [TOPIK]

Buat kartu hafalan:
1. Definisi (Arab + Indonesia)
2. Rumus + keterangan simbol (Arab + Indonesia)
3. Langkah-langkah perhitungan
4. Tabel: Arab ↔ Indonesia ↔ Simbol
5. Contoh perhitungan singkat`,

      latihan: `Aku pelajar Ma'had Al-Azhar Tsanawi Adabi, latihan statistik.

Topik: [TOPIK]

Buat soal dengan data nyata:
1. Set data → aku hitung ukuran statistiknya
2. Hasil statistik → aku interpretasikan
3. 1 soal cerita aplikasi nyata
4. JANGAN kasih jawaban dulu`,

      ujian: `Aku pelajar Ma'had Al-Azhar Tsanawi Adabi, persiapan ujian statistik.

Topik: [TOPIK]

Rangkuman ujian:
1. Definisi (Arab + Indonesia)
2. Rumus yang wajib dihafal
3. Istilah Arab penting (tabel)
4. Contoh soal + solusi
5. Soal tipe ujian Tsanawiyah`,
    },
  },
];

/* ── Helper functions ── */
const getMahadMaddahByJenjang = (level) => {
  if (!level) return [];
  const isIdad    = level.startsWith("idad");
  const isTsanawi = level.startsWith("tsanawi");
  const isIlmi    = level.includes("ilmi");
  const isAdabi   = level.includes("adabi");

  return MAHAD_MADDAH.filter(m => {
    const jenjangMatch = (isIdad && m.jenjang.includes("idad"))
      || (isTsanawi && m.jenjang.includes("tsanawi"));
    if (!jenjangMatch) return false;
    if (!m.jurusan) return true;
    if (isIlmi  && m.jurusan.includes("ilmi"))  return true;
    if (isAdabi && m.jurusan.includes("adabi")) return true;
    if (isIdad) return true;
    return false;
  });
};

const getMahadMaddahById = (id) => MAHAD_MADDAH.find(m => m.id === id) || null;

Object.assign(window, {
  MAHAD_MADDAH,
  getMahadMaddahByJenjang,
  getMahadMaddahById,
});
