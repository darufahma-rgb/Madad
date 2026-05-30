/* Talqeeh — Ma'had Al-Azhar Maddah Data
   TERPISAH dari MADDAHS (S1) — jangan dicampur!
   Format prompts: object { pahami, hafal, latihan, ujian }
*/

const MAHAD_MADDAH = [

  // ══════════════ AGAMA — I'DADI & TSANAWI ══════════════

  {
    id: "quran-tajwid-mahad",
    name: "Al-Qur'an & Tajwid",
    nameArabic: "الْقُرْآنُ وَالتَّجْوِيدُ",
    category: "agama",
    jenjang: ["idad", "tsanawi"],
    description: "Membaca Al-Qur'an dengan benar sesuai kaidah tajwid.",
    topikUtama: [
      "Makharijul Huruf", "Sifatul Huruf",
      "Hukum Nun Sukun & Tanwin (izhar, idgham, iqlab, ikhfa)",
      "Hukum Mim Sukun", "Hukum Mad (Thabii, Wajib, Jaiz)",
      "Hukum Ra' dan Lam", "Waqaf dan Ibtida'",
    ],
    prompts: {
      pahami: `Aku pelajar Ma'had Al-Azhar yang sedang belajar tajwid.

Tolong jelaskan topik ini dengan cara yang mudah dipahami: [TOPIK]

Yang aku butuhkan:
1. Penjelasan singkat dan jelas
2. Contoh dari Al-Qur'an — tulis ayatnya dengan harakat + tunjukkan bagian yang jadi contoh
3. Cara mudah mengingat kaidah ini (trik hafalan)
4. Perbedaan dengan hukum tajwid lain yang mirip

Bahasa: Indonesia yang mudah. Istilah Arab tetap disebut tapi selalu dikasih artinya.`,

      hafal: `Aku pelajar Ma'had Al-Azhar, mau hafal kaidah tajwid: [TOPIK]

Bantu aku hafal dengan cara yang menyenangkan:
1. Ringkasan kaidah dalam 3-5 poin pendek
2. Contoh kata/ayat untuk tiap poin — tulis Arab dengan harakat
3. Tips/trik supaya tidak lupa (akronim, cerita, atau cara kreatif lain)
4. 5 pertanyaan cepat untuk test diri sendiri

Buat semenarik mungkin ya!`,

      latihan: `Aku pelajar Ma'had Al-Azhar, mau latihan tajwid.

Topik: [TOPIK]

Buat latihan soal:
1. Tulis 5 penggalan ayat Al-Qur'an (dengan harakat)
2. Minta aku identifikasi hukum tajwid yang ada
3. JANGAN kasih jawaban dulu — tunggu jawabanku
4. Setelah aku jawab, koreksi dan jelaskan yang benar`,

      ujian: `Aku pelajar Ma'had Al-Azhar, persiapan ujian tajwid: [TOPIK]

Buat rangkuman siap ujian:
1. Definisi (Arab + terjemah)
2. Pembagian/macam-macam
3. Contoh dari Al-Qur'an
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
      "Pengertian dan urgensi tafsir", "Macam-macam tafsir",
      "Tafsir Juz Amma", "Asbabun Nuzul",
      "Nasikh dan Mansukh", "Muhkam dan Mutasyabih",
    ],
    prompts: {
      pahami: `Aku pelajar Ma'had Al-Azhar yang belajar tafsir.

Topik/Ayat: [TOPIK]

Yang aku butuhkan:
1. Tulis ayatnya (Arab + harakat + terjemah) kalau tentang ayat tertentu
2. Penjelasan makna dengan bahasa yang mudah
3. Poin-poin penting yang terkandung
4. Asbabun nuzul singkat (kalau ada)
5. Pelajaran/hikmah yang bisa diambil

Bahasa Indonesia yang mudah dipahami remaja!`,

      hafal: `Aku pelajar Ma'had Al-Azhar, mau hafal tafsir: [TOPIK]

Buat kartu belajar:
1. Ayat utama (Arab + harakat + terjemah)
2. Kata kunci tafsir (5-7 frasa penting)
3. Asbabun nuzul dalam 2-3 kalimat
4. 3 poin WAJIB diingat
5. Pertanyaan yang sering keluar di ujian`,

      latihan: `Aku pelajar Ma'had Al-Azhar, latihan tafsir.

Topik/Surah: [TOPIK]

Buat latihan:
1. 3 pertanyaan pemahaman makna ayat
2. 2 pertanyaan tentang asbabun nuzul
3. 1 pertanyaan "apa pelajaran dari ayat ini?"
4. JANGAN kasih jawaban dulu`,

      ujian: `Aku pelajar Ma'had Al-Azhar, persiapan ujian tafsir: [TOPIK]

Rangkuman ujian:
1. Ayat kunci (Arab + harakat + terjemah singkat)
2. Asbabun nuzul penting
3. Poin tafsir yang perlu diingat
4. Soal-soal yang biasa keluar`,
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
      "Sanad dan Matan", "Arba'in Nawawi",
      "Hadits tentang akhlak dan ibadah",
    ],
    prompts: {
      pahami: `Aku pelajar Ma'had Al-Azhar yang belajar hadits.

Hadits/Topik: [TOPIK]

Yang aku butuhkan:
1. Teks hadits (Arab + harakat) kalau tentang hadits tertentu
2. Terjemah yang mudah dipahami
3. Siapa yang meriwayatkan? — singkat saja
4. Makna dan kandungan hadits
5. Cara mengamalkannya

Jelaskan seperti bercerita!`,

      hafal: `Aku pelajar Ma'had Al-Azhar, mau hafal hadits: [TOPIK]

Bantu aku hafal:
1. Tulis hadits dengan harakat yang jelas + terjemah
2. Pecah menjadi bagian kecil yang mudah dihafal
3. Kata kunci sebagai jangkar hafalan
4. Konteks/cerita di balik hadits
5. Cara test diri sendiri`,

      latihan: `Aku pelajar Ma'had Al-Azhar, latihan hadits: [TOPIK]

Buat latihan:
1. 3 hadits (Arab + terjemah) — aku sebutkan rawinya
2. 3 soal pemahaman kandungan
3. 2 soal istilah teknis hadits
4. JANGAN kasih jawaban dulu`,

      ujian: `Aku pelajar Ma'had Al-Azhar, persiapan ujian hadits: [TOPIK]

Rangkuman ujian:
1. Hadits yang wajib dihafal (Arab + harakat + terjemah)
2. Nama rawi masing-masing
3. Istilah teknis yang mungkin ditanyakan
4. Soal yang biasa keluar`,
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
      "Perbedaan tauhid dengan syirik",
    ],
    prompts: {
      pahami: `Aku pelajar Ma'had Al-Azhar yang belajar tauhid.

Topik: [TOPIK]

Jelaskan dengan cara yang menarik:
1. Pengertian sederhana
2. Dalil dari Al-Qur'an atau hadits (Arab + harakat + terjemah)
3. Contoh nyata dalam kehidupan sehari-hari
4. Kenapa topik ini penting?
5. Hal yang sering disalahpahami

Buat aku benar-benar paham, bukan sekedar hafal!`,

      hafal: `Aku pelajar Ma'had Al-Azhar, mau hafal tauhid: [TOPIK]

Buat kartu hafalan aqidah:
1. Definisi (singkat, 1-2 kalimat)
2. Dalil utama (Arab + harakat + terjemah)
3. Pembagian/macam-macam (tabel atau poin)
4. Perbedaan dengan konsep yang berlawanan
5. Cara mudah mengingat`,

      latihan: `Aku pelajar Ma'had Al-Azhar, latihan tauhid: [TOPIK]

Buat soal:
1. 3 soal pilihan ganda (4 pilihan)
2. 2 soal isian (definisikan istilah)
3. 1 soal esai pendek
4. JANGAN kasih jawaban dulu`,

      ujian: `Aku pelajar Ma'had Al-Azhar, persiapan ujian tauhid: [TOPIK]

Rangkuman ujian:
1. Definisi kunci (Arab + terjemah)
2. Dalil utama yang perlu dihafal
3. Pembagian + penjelasan singkat
4. Perbedaan antar istilah yang mirip
5. Soal yang sering keluar`,
    },
  },

  {
    id: "fiqh-mahad",
    name: "Fiqh",
    nameArabic: "الْفِقْهُ",
    category: "agama",
    jenjang: ["idad", "tsanawi"],
    description: "Hukum-hukum Islam dalam ibadah dan muamalah.",
    topikUtama: [
      "Thaharah (wudhu, mandi, tayammum)",
      "Shalat (syarat, rukun, yang membatalkan)",
      "Shaum/Puasa", "Zakat", "Haji", "Muamalah", "Jenazah",
    ],
    prompts: {
      pahami: `Aku pelajar Ma'had Al-Azhar yang belajar fiqh.

Topik: [TOPIK]

Jelaskan:
1. Pengertian singkat
2. Dalil (Arab + harakat + terjemah)
3. Hukumnya apa?
4. Syarat-syarat atau rukun-rukun (daftar jelas)
5. Hal yang sering membingungkan + contoh kasus`,

      hafal: `Aku pelajar Ma'had Al-Azhar, mau hafal fiqh: [TOPIK]

Buat kartu fiqh:
1. Definisi (1-2 kalimat)
2. Hukum + dalil singkat
3. Syarat/Rukun (DAFTAR BERNOMOR)
4. Yang membatalkan (kalau ada)
5. Tips hafalan + 5 soal cepat`,

      latihan: `Aku pelajar Ma'had Al-Azhar, latihan fiqh: [TOPIK]

Buat soal kasus:
1. 3 kasus nyata — aku tentukan hukumnya
2. 2 soal isian — definisi atau syarat/rukun
3. JANGAN kasih jawaban — tunggu jawabanku`,

      ujian: `Aku pelajar Ma'had Al-Azhar, persiapan ujian fiqh: [TOPIK]

Rangkuman siap tulis:
1. Definisi + hukum + dalil singkat
2. Syarat-syarat (bernomor)
3. Rukun-rukun (bernomor)
4. Yang membatalkan (bernomor)
5. Soal yang sering keluar`,
    },
  },

  {
    id: "nahwu-mahad",
    name: "Nahwu",
    nameArabic: "النَّحْوُ",
    category: "agama",
    jenjang: ["idad", "tsanawi"],
    description: "Kaidah tata bahasa Arab — i'rab dan kedudukan kata.",
    topikUtama: [
      "Kalam (Isim, Fi'il, Harf)",
      "I'rab (rafa', nashab, jar, jazm)",
      "Mubtada' dan Khabar", "Fa'il dan Maf'ul",
      "Na'at dan Man'ut", "Dzharaf",
    ],
    prompts: {
      pahami: `Aku pelajar Ma'had Al-Azhar yang belajar nahwu.

Topik: [TOPIK]

Jelaskan dengan sangat jelas:
1. Pengertian dalam bahasa sederhana
2. Contoh kalimat Arab (harakat + terjemah)
3. Tanda-tanda atau ciri-cirinya
4. Kaidah penting yang perlu diingat
5. Lebih banyak contoh dari Al-Qur'an`,

      hafal: `Aku pelajar Ma'had Al-Azhar, mau hafal nahwu: [TOPIK]

Buat kartu hafalan:
1. Kaidah dalam 1-2 kalimat (Arab + terjemah)
2. Tanda-tanda i'rab (tabel)
3. 5 contoh kalimat (Arab + harakat + terjemah)
4. Pengecualian penting`,

      latihan: `Aku pelajar Ma'had Al-Azhar, latihan nahwu: [TOPIK]

Buat soal i'rab:
1. Tulis 5 kalimat Arab sederhana (harakat)
2. Aku tentukan kedudukan kata yang ditandai
3. JANGAN kasih jawaban dulu
4. Koreksi dengan penjelasan kaidah`,

      ujian: `Aku pelajar Ma'had Al-Azhar, persiapan ujian nahwu: [TOPIK]

Rangkuman ujian:
1. Definisi (Arab + terjemah)
2. Kaidah utama (poin-poin)
3. Tanda-tanda i'rab (tabel)
4. Contoh dari Al-Qur'an
5. Hal yang sering salah`,
    },
  },

  {
    id: "sharf-mahad",
    name: "Sharf",
    nameArabic: "الصَّرْفُ",
    category: "agama",
    jenjang: ["idad", "tsanawi"],
    description: "Perubahan bentuk kata Arab — wazan, tashrif, derivasi.",
    topikUtama: [
      "Wazan Fi'il Tsulatsi Mujarrad",
      "Tashrif (madhi, mudhari', masdar, isim fa'il, maf'ul, amar, nahi)",
      "Fi'il Shahih dan Mu'tal",
    ],
    prompts: {
      pahami: `Aku pelajar Ma'had Al-Azhar yang belajar sharf.

Topik: [TOPIK]

Jelaskan:
1. Pengertian sederhana
2. Contoh tashrif/wazan — tabel yang rapi (Arab + harakat)
3. Cara mengenali pola ini
4. Tips mengingat
5. Kata Arab yang sering dipakai dengan pola ini`,

      hafal: `Aku pelajar Ma'had Al-Azhar, mau hafal sharf: [TOPIK]

Buat tabel tashrif:
1. Tashrif istilahi lengkap (fi'il madhi → fi'il nahi) — tabel rapi, Arab + harakat
2. Tashrif lughawi untuk semua dhamir
3. Tips menghafal pola perubahan`,

      latihan: `Aku pelajar Ma'had Al-Azhar, latihan sharf: [TOPIK]

Buat latihan:
1. 5 kata Arab — aku tashrif-kan semua bentuknya
2. 5 bentuk kata — aku tebak fi'il dan wazannya
3. JANGAN kasih jawaban dulu`,

      ujian: `Aku pelajar Ma'had Al-Azhar, persiapan ujian sharf: [TOPIK]

Rangkuman ujian:
1. Wazan/pola dalam tabel (Arab + harakat)
2. Tashrif istilahi lengkap
3. Perubahan khusus fi'il mu'tal
4. Soal yang biasa keluar`,
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
      "Nasab dan kelahiran", "Masa kecil dan sebelum kenabian",
      "Dakwah sirri dan jahri", "Hijrah ke Habasyah",
      "Isra' Mi'raj", "Hijrah ke Madinah",
      "Perang Badr, Uhud, Khandaq", "Fath Makkah", "Haji Wada'",
    ],
    prompts: {
      pahami: `Aku pelajar Ma'had Al-Azhar yang belajar Sirah Nabawiyah.

Topik/Peristiwa: [TOPIK]

Ceritakan dengan menarik:
1. Latar belakang — apa yang terjadi sebelumnya?
2. Kronologi kejadian — ceritakan seperti bercerita
3. Tokoh-tokoh kunci yang terlibat
4. Hikmah dan pelajaran
5. Kaitannya dengan kehidupan kita sekarang`,

      hafal: `Aku pelajar Ma'had Al-Azhar, mau hafal sirah: [TOPIK]

Buat timeline hafalan:
1. Tahun/tanggal penting + peristiwa
2. Tokoh kunci + peran singkat
3. Urutan kejadian (5-7 poin)
4. Angka-angka penting
5. Kutipan Nabi ﷺ yang relevan (Arab + terjemah)`,

      latihan: `Aku pelajar Ma'had Al-Azhar, latihan sirah: [TOPIK]

Buat soal:
1. 3 soal fakta (kapan, siapa, di mana)
2. 2 soal analisis (mengapa, bagaimana)
3. 1 soal refleksi (apa hikmahnya?)
4. JANGAN kasih jawaban dulu`,

      ujian: `Aku pelajar Ma'had Al-Azhar, persiapan ujian sirah: [TOPIK]

Rangkuman ujian:
1. Timeline singkat
2. Tokoh penting + peran
3. Fakta kunci yang sering ditanyakan
4. Hikmah yang perlu disebutkan
5. Soal yang biasa keluar`,
    },
  },

  {
    id: "balaghah-mahad",
    name: "Balaghah",
    nameArabic: "الْبَلَاغَةُ",
    category: "agama",
    jenjang: ["tsanawi"],
    description: "Ilmu keindahan bahasa Arab — ma'ani, bayan, badi'.",
    topikUtama: [
      "Pengertian Balaghah", "Ilmu Ma'ani",
      "Tasybih", "Majaz dan Isti'arah",
      "Kinayah", "Ilmu Badi'",
    ],
    prompts: {
      pahami: `Aku pelajar Ma'had Al-Azhar (Tsanawi) yang belajar balaghah.

Topik: [TOPIK]

Jelaskan:
1. Pengertian sederhana
2. Contoh dari Al-Qur'an (Arab + harakat + terjemah)
3. Mengapa gaya bahasa ini digunakan?
4. Cara mengidentifikasi dalam teks Arab
5. Bedanya dengan gaya bahasa lain yang mirip`,

      hafal: `Aku pelajar Ma'had Al-Azhar Tsanawi, mau hafal balaghah: [TOPIK]

Buat kartu hafalan:
1. Definisi (Arab + terjemah)
2. Macam-macam + penjelasan singkat
3. 3 contoh dari Al-Qur'an (Arab + harakat)
4. Cara mengidentifikasi dalam teks`,

      latihan: `Aku pelajar Ma'had Al-Azhar Tsanawi, latihan balaghah: [TOPIK]

Buat soal:
1. 3 kalimat/ayat Arab — aku identifikasi unsur balaghahnya
2. 2 contoh — aku jelaskan efek bahasanya
3. JANGAN kasih jawaban dulu`,

      ujian: `Aku pelajar Ma'had Al-Azhar Tsanawi, persiapan ujian balaghah: [TOPIK]

Rangkuman ujian:
1. Definisi (Arab + terjemah)
2. Pembagian/macam-macam
3. Contoh dari Al-Qur'an
4. Cara mengidentifikasi
5. Soal yang sering keluar`,
    },
  },

  // ══════════════ MADDAH UMUM — I'DADI ══════════════

  {
    id: "matematika-idad",
    name: "Matematika (I'dadi)",
    nameArabic: "الرِّيَاضِيَّاتُ",
    category: "umum",
    jenjang: ["idad"],
    description: "Matematika dasar I'dadi — diajarkan dalam bahasa Arab.",
    topikUtama: [
      "الأعداد الصحيحة — Bilangan Bulat",
      "الكسور — Pecahan",
      "النسب والتناسب — Perbandingan",
      "المعادلات الخطية — Persamaan Linear",
      "الهندسة الأساسية — Geometri Dasar",
    ],
    prompts: {
      pahami: `Aku pelajar Ma'had Al-Azhar (I'dadi) yang belajar matematika dalam bahasa Arab.

Topik: [TOPIK]

Yang aku butuhkan:
1. Jelaskan konsepnya dalam bahasa Indonesia yang mudah
2. Tunjukkan istilah Arabnya yang dipakai di buku pelajaran
3. Contoh soal bertahap — mulai dari yang mudah
4. Cara/langkah penyelesaian yang jelas

Aku sering bingung karena harus paham konsep SEKALIGUS istilah Arabnya!`,

      hafal: `Aku pelajar Ma'had Al-Azhar (I'dadi), mau hafal matematika: [TOPIK]

Buat kartu hafalan:
1. Rumus utama (Arab + Latin + penjelasan variabel)
2. Tabel istilah: Arab ↔ Indonesia
3. Langkah penyelesaian (poin bernomor)
4. Contoh soal + jawaban lengkap
5. Kesalahan umum yang harus dihindari`,

      latihan: `Aku pelajar Ma'had Al-Azhar (I'dadi), latihan matematika: [TOPIK]

Buat 5 soal bertahap:
- Format campuran seperti buku Ma'had
- Mulai mudah, naik ke yang lebih sulit
- JANGAN kasih jawaban dulu
- Koreksi dengan langkah penyelesaian lengkap`,

      ujian: `Aku pelajar Ma'had Al-Azhar (I'dadi), persiapan ujian matematika: [TOPIK]

Rangkuman ujian:
1. Rumus WAJIB dihafal (Arab + keterangan)
2. Istilah Arab penting (tabel)
3. Contoh soal + langkah penyelesaian (2 contoh)
4. Tips mengerjakan soal matematika Arab`,
    },
  },

  {
    id: "sains-idad",
    name: "Sains / IPA (I'dadi)",
    nameArabic: "الْعُلُومُ",
    category: "umum",
    jenjang: ["idad"],
    description: "IPA dasar I'dadi — fisika, kimia, biologi dasar dalam bahasa Arab.",
    topikUtama: [
      "المادة وخصائصها — Materi dan Sifatnya",
      "الخلية — Sel", "الضوء — Cahaya",
      "الكهرباء — Listrik Dasar",
      "جسم الإنسان — Tubuh Manusia",
      "البيئة — Lingkungan dan Ekosistem",
    ],
    prompts: {
      pahami: `Aku pelajar Ma'had Al-Azhar (I'dadi) yang belajar sains dalam bahasa Arab.

Topik: [TOPIK]

Jelaskan:
1. Konsep utama dalam bahasa Indonesia yang mudah
2. Istilah Arab penting (tabel: Arab ↔ Indonesia)
3. Contoh dari kehidupan sehari-hari
4. Penjelasan ilmiahnya yang singkat dan jelas
5. Fakta menarik tentang topik ini`,

      hafal: `Aku pelajar Ma'had Al-Azhar (I'dadi), mau hafal sains: [TOPIK]

Buat kartu hafalan:
1. Konsep kunci dalam 3-5 poin singkat
2. Tabel istilah: Arab ↔ Indonesia
3. Fakta penting yang sering keluar di ujian
4. Cara mengingat dengan asosiasi`,

      latihan: `Aku pelajar Ma'had Al-Azhar (I'dadi), latihan sains: [TOPIK]

Buat soal:
1. 3 soal pemahaman konsep
2. 2 soal penerapan (kasus nyata)
3. 1 soal analisis
4. JANGAN kasih jawaban dulu`,

      ujian: `Aku pelajar Ma'had Al-Azhar (I'dadi), persiapan ujian sains: [TOPIK]

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
    description: "Bahasa Inggris Ma'had — grammar, vocabulary, reading, writing.",
    topikUtama: [
      "Tenses (Present, Past, Future)",
      "Parts of Speech", "Articles dan Prepositions",
      "Reading Comprehension", "Writing",
    ],
    prompts: {
      pahami: `Aku pelajar Ma'had Al-Azhar yang belajar Bahasa Inggris.

Topik: [TOPIK]

Jelaskan:
1. Aturan/konsep dalam bahasa Indonesia
2. Contoh kalimat sederhana (minimal 5)
3. Kesalahan umum yang sering dilakukan
4. Tips mudah mengingat aturan ini

Aku belajar tiga bahasa sekaligus — bantu aku dengan penjelasan yang jelas!`,

      hafal: `Aku pelajar Ma'had Al-Azhar, mau hafal Bahasa Inggris: [TOPIK]

Buat kartu hafalan:
1. Aturan dalam poin singkat
2. Contoh kalimat tiap aturan
3. Vocabulary penting terkait topik
4. Pengecualian yang perlu diingat`,

      latihan: `Aku pelajar Ma'had Al-Azhar, latihan Bahasa Inggris: [TOPIK]

Buat latihan:
1. 5 soal fill-in-the-blank
2. 3 soal perbaiki kalimat yang salah
3. 2 soal buat kalimat sendiri
4. JANGAN kasih jawaban dulu`,

      ujian: `Aku pelajar Ma'had Al-Azhar, persiapan ujian Bahasa Inggris: [TOPIK]

Rangkuman ujian:
1. Aturan/rumus utama
2. Contoh kalimat
3. Vocabulary penting
4. Soal yang biasa keluar`,
    },
  },

  // ══════════════ TSANAWI ILMI ══════════════

  {
    id: "matematika-tsanawi",
    name: "Matematika (Tsanawi)",
    nameArabic: "الرِّيَاضِيَّاتُ",
    category: "umum",
    jenjang: ["tsanawi"],
    jurusan: ["ilmi", "adabi"],
    description: "Matematika Tsanawi — Bahta dan Tathbiqi dalam bahasa Arab.",
    topikUtama: [
      "المتتاليات — Barisan dan Deret",
      "المثلثات — Trigonometri",
      "الاحتمالات — Peluang",
      "المصفوفات — Matriks",
      "الحساب التفاضلي — Kalkulus Diferensial",
      "الحساب التكاملي — Kalkulus Integral",
      "الدوال — Fungsi dan Relasi",
    ],
    prompts: {
      pahami: `Aku pelajar Ma'had Al-Azhar (Tsanawi) yang belajar matematika lanjut dalam bahasa Arab.

Topik: [TOPIK]

Yang aku butuhkan:
1. Penjelasan konsep dalam bahasa Indonesia yang jelas
2. Istilah Arab + simbol yang dipakai
3. Rumus lengkap dengan keterangan tiap variabel
4. Contoh soal bertahap dengan langkah penyelesaian
5. Aplikasi nyata konsep ini`,

      hafal: `Aku pelajar Ma'had Al-Azhar Tsanawi, mau hafal matematika: [TOPIK]

Buat kartu hafalan:
1. Rumus-rumus utama (notasi Arab)
2. Tabel: Arab ↔ Indonesia ↔ Simbol
3. Kondisi penggunaan tiap rumus
4. Soal cepat untuk test diri (3 soal + jawaban)`,

      latihan: `Aku pelajar Ma'had Al-Azhar Tsanawi, latihan matematika: [TOPIK]

Buat 5 soal bertahap:
- Format seperti soal ujian Ma'had
- Sertakan soal cerita (konteks nyata)
- JANGAN kasih jawaban dulu
- Koreksi + langkah penyelesaian lengkap`,

      ujian: `Aku pelajar Ma'had Al-Azhar Tsanawi, persiapan ujian matematika: [TOPIK]

Rangkuman ujian:
1. Rumus WAJIB dihafal
2. Tabel istilah Arab penting
3. Contoh soal + solusi (3 soal)
4. Kesalahan umum`,
    },
  },

  {
    id: "fisika-tsanawi",
    name: "Fisika",
    nameArabic: "الْفِيزِيَاءُ",
    category: "umum",
    jenjang: ["tsanawi"],
    jurusan: ["ilmi"],
    description: "Fisika Tsanawi — mekanika, kalor, gelombang, listrik, optik dalam bahasa Arab.",
    topikUtama: [
      "الحركة والقوة — Gerak dan Gaya",
      "الشغل والطاقة — Usaha dan Energi",
      "الحرارة — Kalor", "الموجات والصوت — Gelombang",
      "الضوء والبصريات — Cahaya dan Optik",
      "الكهرباء والمغناطيسية — Listrik dan Magnet",
    ],
    prompts: {
      pahami: `Aku pelajar Ma'had Al-Azhar (Tsanawi Ilmi) yang belajar fisika dalam bahasa Arab.

Topik: [TOPIK]

Jelaskan dengan cara yang konkret:
1. Apa yang terjadi secara fisik? (analogi sehari-hari)
2. Istilah Arab + simbol (tabel)
3. Rumus-rumus + keterangan tiap simbol
4. Contoh soal dengan langkah penyelesaian
5. Fenomena alam atau teknologi yang berhubungan`,

      hafal: `Aku pelajar Ma'had Al-Azhar Tsanawi Ilmi, mau hafal fisika: [TOPIK]

Buat kartu hafalan:
1. Hukum/prinsip utama (nama Arab + terjemah)
2. Rumus dengan satuan SI
3. Tabel: Arab ↔ Indonesia ↔ Simbol ↔ Satuan
4. Aplikasi nyata yang mudah diingat`,

      latihan: `Aku pelajar Ma'had Al-Azhar Tsanawi Ilmi, latihan fisika: [TOPIK]

Buat soal:
1. 2 soal hitungan mudah
2. 2 soal hitungan sedang
3. 1 soal analisis
4. JANGAN kasih jawaban dulu`,

      ujian: `Aku pelajar Ma'had Al-Azhar Tsanawi Ilmi, persiapan ujian fisika: [TOPIK]

Rangkuman ujian:
1. Hukum/prinsip (Arab + isi hukum)
2. Rumus dengan satuan
3. Istilah Arab penting (tabel)
4. Soal tipe ujian + solusi (2-3 soal)`,
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
      "المحاليل — Larutan",
      "الكيمياء العضوية — Kimia Organik Dasar",
    ],
    prompts: {
      pahami: `Aku pelajar Ma'had Al-Azhar (Tsanawi Ilmi) yang belajar kimia dalam bahasa Arab.

Topik: [TOPIK]

Jelaskan:
1. Apa yang terjadi di tingkat molekul/atom? (analogi sederhana)
2. Istilah Arab kimia (tabel: Arab ↔ Indonesia)
3. Rumus/persamaan yang relevan
4. Contoh dari kehidupan sehari-hari
5. Langkah menyelesaikan soal tipe ini`,

      hafal: `Aku pelajar Ma'had Al-Azhar Tsanawi Ilmi, mau hafal kimia: [TOPIK]

Buat kartu hafalan:
1. Konsep kunci + definisi Arab
2. Simbol/lambang kimia
3. Rumus/hukum yang berlaku
4. Tabel: Arab ↔ Indonesia ↔ Simbol
5. Contoh reaksi representatif`,

      latihan: `Aku pelajar Ma'had Al-Azhar Tsanawi Ilmi, latihan kimia: [TOPIK]

Buat soal:
1. 2 soal hitungan/setarakan persamaan
2. 2 soal pemahaman konsep
3. 1 soal analisis kasus
4. JANGAN kasih jawaban dulu`,

      ujian: `Aku pelajar Ma'had Al-Azhar Tsanawi Ilmi, persiapan ujian kimia: [TOPIK]

Rangkuman ujian:
1. Definisi (Arab + Indonesia)
2. Rumus/hukum
3. Istilah Arab penting (tabel)
4. Contoh soal + solusi`,
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
      "الخلية — Sel dan Organel",
      "الأنسجة والأعضاء — Jaringan dan Organ",
      "جهاز الدوران والتنفس والهضم — Sistem Tubuh",
      "جهاز العصبي — Sistem Saraf",
      "الوراثة — Genetika",
      "البيئة — Ekosistem",
    ],
    prompts: {
      pahami: `Aku pelajar Ma'had Al-Azhar (Tsanawi Ilmi) yang belajar biologi dalam bahasa Arab.

Topik: [TOPIK]

Jelaskan:
1. Gambaran besar — apa fungsi sistem/organ ini?
2. Komponen utama + istilah Arabnya (tabel/daftar)
3. Proses yang terjadi — jelaskan step by step
4. Diagram yang bisa aku gambar (deskripsikan)
5. Fakta menarik

Biologi itu tentang kehidupan — buat aku kagum!`,

      hafal: `Aku pelajar Ma'had Al-Azhar Tsanawi Ilmi, mau hafal biologi: [TOPIK]

Buat kartu hafalan:
1. Istilah kunci (tabel: Arab ↔ Indonesia)
2. Fungsi tiap komponen (tabel: komponen → fungsi)
3. Proses utama (poin bernomor)
4. Fakta penting (angka, persentase)`,

      latihan: `Aku pelajar Ma'had Al-Azhar Tsanawi Ilmi, latihan biologi: [TOPIK]

Buat soal:
1. 3 soal identifikasi (nama/fungsi bagian)
2. 2 soal proses (urutan/tahapan)
3. 1 soal aplikasi
4. JANGAN kasih jawaban dulu`,

      ujian: `Aku pelajar Ma'had Al-Azhar Tsanawi Ilmi, persiapan ujian biologi: [TOPIK]

Rangkuman ujian:
1. Definisi (Arab + Indonesia)
2. Komponen dan fungsi (tabel)
3. Proses penting (poin bernomor)
4. Istilah Arab kunci
5. Soal yang biasa keluar`,
    },
  },

  // ══════════════ TSANAWI ADABI ══════════════

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
      "الحضارات القديمة", "العصر الحديث",
    ],
    prompts: {
      pahami: `Aku pelajar Ma'had Al-Azhar (Tsanawi Adabi) yang belajar sejarah dalam bahasa Arab.

Topik: [TOPIK]

Ceritakan dengan menarik:
1. Latar belakang — apa kondisi saat itu?
2. Kronologi peristiwa — naratif, bukan daftar kering
3. Tokoh-tokoh penting + peran singkat
4. Dampak/pengaruh
5. Pelajaran yang bisa diambil`,

      hafal: `Aku pelajar Ma'had Al-Azhar Tsanawi Adabi, mau hafal sejarah: [TOPIK]

Buat timeline hafalan:
1. Tahun penting + peristiwa
2. Tokoh kunci + identitas singkat
3. Urutan kejadian (5-7 poin)
4. Angka-angka penting`,

      latihan: `Aku pelajar Ma'had Al-Azhar Tsanawi Adabi, latihan sejarah: [TOPIK]

Buat soal:
1. 3 soal fakta (kapan, siapa, di mana)
2. 2 soal analisis (mengapa, bagaimana)
3. 1 soal evaluasi (apa dampaknya?)
4. JANGAN kasih jawaban dulu`,

      ujian: `Aku pelajar Ma'had Al-Azhar Tsanawi Adabi, persiapan ujian sejarah: [TOPIK]

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
    description: "Geografi Tsanawi — alam, manusia, wilayah dalam bahasa Arab.",
    topikUtama: [
      "الخريطة والإحداثيات — Peta dan Koordinat",
      "طبقات الأرض — Lapisan Bumi",
      "المناخ والطقس — Iklim",
      "السكان والتوزع — Penduduk",
      "الموارد الطبيعية — SDA",
      "العالم الإسلامي — Dunia Islam",
    ],
    prompts: {
      pahami: `Aku pelajar Ma'had Al-Azhar (Tsanawi Adabi) yang belajar geografi dalam bahasa Arab.

Topik: [TOPIK]

Jelaskan:
1. Gambaran umum topik ini
2. Istilah Arab geografi penting (tabel)
3. Contoh dari wilayah yang kita kenal (Mesir, Indonesia)
4. Hubungan dengan kehidupan manusia
5. Fakta menarik yang mudah diingat`,

      hafal: `Aku pelajar Ma'had Al-Azhar Tsanawi Adabi, mau hafal geografi: [TOPIK]

Buat kartu hafalan:
1. Konsep kunci + definisi Arab
2. Data/angka penting
3. Nama-nama penting + Arab-nya
4. Cara mengingat dengan asosiasi`,

      latihan: `Aku pelajar Ma'had Al-Azhar Tsanawi Adabi, latihan geografi: [TOPIK]

Buat soal:
1. 3 soal identifikasi/lokasi
2. 2 soal penjelasan fenomena
3. 1 soal analisis alam-manusia
4. JANGAN kasih jawaban dulu`,

      ujian: `Aku pelajar Ma'had Al-Azhar Tsanawi Adabi, persiapan ujian geografi: [TOPIK]

Rangkuman ujian:
1. Definisi (Arab + Indonesia)
2. Data dan angka penting
3. Istilah Arab kunci (tabel)
4. Soal yang biasa keluar`,
    },
  },

  {
    id: "falsafah-mantiq",
    name: "Filsafat & Mantiq",
    nameArabic: "الْفَلْسَفَةُ وَالْمَنْطِقُ",
    category: "umum",
    jenjang: ["tsanawi"],
    jurusan: ["adabi"],
    description: "Dasar-dasar filsafat dan logika (mantiq) Tsanawi.",
    topikUtama: [
      "تعريف الفلسفة وفروعها",
      "الفلسفة اليونانية (سقراط، أفلاطون، أرسطو)",
      "الفلسفة الإسلامية (الكندي، ابن سينا، الفارابي)",
      "علم المنطق والقياس المنطقي",
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
5. Mengapa penting dipelajari?

Filsafat bukan hafalan — bantu aku BERPIKIR!`,

      hafal: `Aku pelajar Ma'had Al-Azhar Tsanawi Adabi, mau hafal filsafat/mantiq: [TOPIK]

Buat kartu hafalan:
1. Definisi (Arab + Indonesia)
2. Tokoh kunci + pemikiran utama
3. Istilah teknis penting (tabel)
4. Perbedaan dengan konsep yang mirip`,

      latihan: `Aku pelajar Ma'had Al-Azhar Tsanawi Adabi, latihan filsafat/mantiq: [TOPIK]

Buat soal:
1. 2 soal definisi/pengertian
2. 2 soal "bandingkan pemikiran X dengan Y"
3. 1 soal aplikasi mantiq
4. JANGAN kasih jawaban dulu`,

      ujian: `Aku pelajar Ma'had Al-Azhar Tsanawi Adabi, persiapan ujian filsafat/mantiq: [TOPIK]

Rangkuman ujian:
1. Definisi (Arab + Indonesia)
2. Tokoh + pemikiran utama
3. Istilah teknis (tabel)
4. Soal yang biasa keluar`,
    },
  },

  {
    id: "ilmu-nafs",
    name: "Ilmu Nafs (Psikologi)",
    nameArabic: "عِلْمُ النَّفْسِ",
    category: "umum",
    jenjang: ["tsanawi"],
    jurusan: ["adabi"],
    description: "Psikologi dasar Tsanawi — perilaku, emosi, belajar, kepribadian.",
    topikUtama: [
      "تعريف علم النفس",
      "الإحساس والإدراك — Sensasi dan Persepsi",
      "الذاكرة — Memori",
      "التعلم — Teori Belajar",
      "الدوافع والانفعالات — Motivasi dan Emosi",
      "الشخصية — Kepribadian",
      "الصحة النفسية — Kesehatan Mental",
    ],
    prompts: {
      pahami: `Aku pelajar Ma'had Al-Azhar (Tsanawi Adabi) yang belajar ilmu nafs.

Topik: [TOPIK]

Jelaskan dengan relate ke kehidupanku:
1. Apa yang dipelajari? (definisi sederhana)
2. Istilah Arab psikologi (tabel)
3. Contoh dari kehidupan nyata
4. Tokoh/psikolog utama
5. Hubungan dengan ajaran Islam

Psikologi itu tentang diri kita — buat aku bisa merefleksikan diri!`,

      hafal: `Aku pelajar Ma'had Al-Azhar Tsanawi Adabi, mau hafal ilmu nafs: [TOPIK]

Buat kartu hafalan:
1. Definisi (Arab + Indonesia)
2. Tokoh + teori utama (tabel)
3. Istilah teknis (tabel)
4. Contoh fenomena nyata`,

      latihan: `Aku pelajar Ma'had Al-Azhar Tsanawi Adabi, latihan ilmu nafs: [TOPIK]

Buat soal:
1. 2 soal definisi
2. 2 soal "berikan contoh nyata untuk..."
3. 1 soal "bandingkan teori X dengan Y"
4. JANGAN kasih jawaban dulu`,

      ujian: `Aku pelajar Ma'had Al-Azhar Tsanawi Adabi, persiapan ujian ilmu nafs: [TOPIK]

Rangkuman ujian:
1. Definisi (Arab + Indonesia)
2. Tokoh + teori utama
3. Istilah teknis penting (tabel)
4. Soal yang biasa keluar`,
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
      "مفهوم الإحصاء — Pengertian Statistik",
      "المتوسط والوسيط والمنوال — Mean, Median, Modus",
      "التشتت — Dispersi",
      "الاحتمالات الأساسية — Probabilitas",
    ],
    prompts: {
      pahami: `Aku pelajar Ma'had Al-Azhar (Tsanawi Adabi) yang belajar statistik dalam bahasa Arab.

Topik: [TOPIK]

Jelaskan:
1. Kegunaan konsep ini di dunia nyata
2. Istilah Arab statistik (tabel)
3. Rumus/cara hitung + contoh dengan data nyata
4. Kapan dipakai (mean vs median vs modus)

Statistik itu alat — bantu aku lihat kegunaannya!`,

      hafal: `Aku pelajar Ma'had Al-Azhar Tsanawi Adabi, mau hafal statistik: [TOPIK]

Buat kartu hafalan:
1. Definisi (Arab + Indonesia)
2. Rumus + keterangan simbol
3. Langkah-langkah perhitungan
4. Tabel: Arab ↔ Indonesia ↔ Simbol`,

      latihan: `Aku pelajar Ma'had Al-Azhar Tsanawi Adabi, latihan statistik: [TOPIK]

Buat soal:
1. Set data → aku hitung ukuran statistiknya
2. Hasil → aku interpretasikan
3. 1 soal cerita aplikasi nyata
4. JANGAN kasih jawaban dulu`,

      ujian: `Aku pelajar Ma'had Al-Azhar Tsanawi Adabi, persiapan ujian statistik: [TOPIK]

Rangkuman ujian:
1. Definisi (Arab + Indonesia)
2. Rumus yang wajib dihafal
3. Istilah Arab penting (tabel)
4. Contoh soal + solusi`,
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
    const jenjangMatch = (isIdad    && m.jenjang.includes("idad"))
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
