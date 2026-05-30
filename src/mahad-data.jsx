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

  // ── Insya' ──
  {
    id: "insya-mahad",
    name: "Insya' (Mengarang Arab)",
    nameArabic: "الْإِنْشَاءُ",
    category: "agama",
    jenjang: ["idad", "tsanawi"],
    description: "Belajar menulis dan mengarang dalam bahasa Arab — dari kalimat sederhana hingga paragraf dan esai.",
    topikUtama: [
      "الجملة المفيدة — Kalimat sempurna",
      "الفقرة — Paragraf (pembuka, isi, penutup)",
      "الوصف — Mendeskripsikan orang/tempat/benda",
      "السرد — Bercerita/narasi",
      "الرسالة — Menulis surat (resmi & tidak resmi)",
      "التلخيص — Meringkas teks Arab",
      "التعبير عن الرأي — Mengungkapkan pendapat",
      "الإنشاء الموجَّه — Mengarang terbimbing",
      "الإنشاء الحر — Mengarang bebas",
    ],
    prompts: {
      pahami: `Aku pelajar Ma'had Al-Azhar yang belajar Insya' (mengarang Arab).

Topik: [TOPIK]

Yang aku butuhkan:
1. Penjelasan konsep/teknik menulis ini dengan bahasa Indonesia yang mudah
2. Contoh tulisan Arab yang baik sesuai topik (dengan harakat)
3. Unsur-unsur yang harus ada dalam tulisan ini
4. Kata-kata dan frasa Arab yang berguna untuk topik ini (kosakata siap pakai)
5. Kesalahan umum yang sering dilakukan pelajar Indonesia saat menulis Arab

Aku ingin bisa menulis Arab dengan benar dan indah — bantu aku!`,

      hafal: `Aku pelajar Ma'had Al-Azhar, mau hafal kosakata dan frasa untuk Insya': [TOPIK]

Buat kartu hafalan:
1. 15-20 kosakata Arab penting untuk topik ini (Arab + harakat + terjemah)
2. 10 frasa/ungkapan siap pakai (pembuka, penghubung, penutup)
3. Kata penghubung (أَدَوَاتُ الرَّبْطِ) yang sering dipakai dalam karangan
4. Contoh kalimat menggunakan kosakata di atas`,

      latihan: `Aku pelajar Ma'had Al-Azhar, latihan menulis Insya'.

Topik mengarang: [TOPIK]

Bantu aku berlatih:
1. Berikan outline/kerangka karangan untuk topik ini (poin-poin Arab + terjemah)
2. Aku akan tulis karangannya — tunggu dulu
3. Setelah aku tulis, koreksi:
   - Kesalahan nahwu dan sharf
   - Kosakata yang bisa diganti lebih baik
   - Struktur kalimat yang perlu diperbaiki
   - Nilai tulisanku (1-10) dengan komentar

Atau kalau aku minta contoh dulu, berikan contoh karangan Arab yang bagus tentang topik ini.`,

      ujian: `Aku pelajar Ma'had Al-Azhar, persiapan ujian Insya': [TOPIK]

Buat persiapan ujian:
1. Outline karangan yang lengkap (struktur baku Ma'had)
2. Kosakata wajib yang harus muncul dalam karangan tentang topik ini
3. Frasa pembuka yang kuat (مقدمة)
4. Frasa penutup yang baik (خاتمة)
5. Contoh karangan pendek (10-15 kalimat) tentang topik ini sebagai referensi
6. Hal yang sering membuat nilai Insya' turun di ujian`,
    },
  },

  // ── Mutholaah ──
  {
    id: "mutholaah-mahad",
    name: "Mutholaah (Membaca Pemahaman)",
    nameArabic: "الْمُطَالَعَةُ",
    category: "agama",
    jenjang: ["idad", "tsanawi"],
    description: "Membaca dan memahami teks Arab — dari teks sederhana hingga teks akademik.",
    topikUtama: [
      "القراءة الجهرية — Membaca nyaring dengan benar",
      "فهم المقروء — Memahami isi teks",
      "استخراج الأفكار الرئيسية — Menemukan ide pokok",
      "الأفكار الفرعية — Ide pendukung",
      "معنى المفردات من السياق — Makna kosakata dari konteks",
      "الاستنتاج — Menyimpulkan isi teks",
      "النصوص الأدبية — Teks sastra Arab",
      "النصوص العلمية — Teks ilmiah/informatif",
      "النصوص الدينية — Teks keagamaan",
    ],
    prompts: {
      pahami: `Aku pelajar Ma'had Al-Azhar yang belajar Mutholaah (membaca pemahaman Arab).

Topik/Jenis teks: [TOPIK]

Yang aku butuhkan:
1. Berikan contoh teks Arab pendek (8-12 baris) sesuai topik — dengan harakat lengkap
2. Terjemah teks ke Indonesia (paragraf per paragraf)
3. Penjelasan kosakata sulit yang muncul dalam teks (Arab + terjemah + cara bacanya)
4. Ide pokok teks dalam 1-2 kalimat
5. Tips cara memahami teks Arab dengan cepat tanpa harus terjemah kata per kata`,

      hafal: `Aku pelajar Ma'had Al-Azhar, mau hafal kosakata dari teks Mutholaah: [TOPIK/TEKS]

Bantu aku kuasai kosakata:
1. Daftar kosakata sulit dari teks ini (Arab + harakat + terjemah + cara pakai dalam kalimat)
2. Kelompokkan per tema (kata benda, kata kerja, sifat)
3. Antonim dan sinonim untuk kosakata kunci
4. Cara mengingat kosakata ini (asosiasi atau cerita)`,

      latihan: `Aku pelajar Ma'had Al-Azhar, latihan Mutholaah.

Jenis teks: [TOPIK]

Buat latihan pemahaman:
1. Berikan teks Arab (10-15 baris, dengan harakat)
2. Buat 5 pertanyaan pemahaman dalam bahasa Arab (أَسْئِلَةُ الْفَهْمِ)
   + terjemah Indonesia di bawah tiap pertanyaan
3. JANGAN kasih jawaban dulu — tunggu aku jawab
4. Setelah aku jawab, koreksi dengan:
   - Jawaban yang benar (dalam Arab + terjemah)
   - Kosakata yang aku salah pahami`,

      ujian: `Aku pelajar Ma'had Al-Azhar, persiapan ujian Mutholaah: [TOPIK]

Persiapan ujian:
1. Berikan teks Arab sesuai level (dengan harakat) + terjemah
2. Contoh soal yang biasa keluar di ujian Mutholaah:
   - Soal pemahaman isi (فَهْمُ الْمَقْرُوء)
   - Soal kosakata (اِسْتَخْرِجِ الْمُفْرَدَاتِ)
   - Soal menentukan ide pokok (الْفِكْرَةُ الرَّئِيسِيَّة)
   - Soal menyimpulkan (اِسْتَنْتِجْ)
3. Tips menjawab soal Mutholaah dengan benar dan cepat`,
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

  // ══════════════ TSANAWI UMUM ══════════════

  {
    id: "sejarah-tsanawi",
    name: "Sejarah",
    nameArabic: "التَّارِيخُ",
    category: "umum",
    jenjang: ["tsanawi"],
    description: "Sejarah Islam dan dunia tingkat Tsanawi dalam bahasa Arab.",
    topikUtama: [
      "الحضارة الإسلامية — Peradaban Islam",
      "الخلافة الراشدة والأموية والعباسية",
      "الحروب الصليبية — Perang Salib",
      "الإمبراطورية العثمانية",
      "الحضارات القديمة", "العصر الحديث",
    ],
    prompts: {
      pahami: `Aku pelajar Ma'had Al-Azhar (Tsanawi) yang belajar sejarah dalam bahasa Arab.

Topik: [TOPIK]

Ceritakan dengan menarik:
1. Latar belakang — apa kondisi saat itu?
2. Kronologi peristiwa — naratif, bukan daftar kering
3. Tokoh-tokoh penting + peran singkat
4. Dampak/pengaruh
5. Pelajaran yang bisa diambil`,

      hafal: `Aku pelajar Ma'had Al-Azhar Tsanawi, mau hafal sejarah: [TOPIK]

Buat timeline hafalan:
1. Tahun penting + peristiwa
2. Tokoh kunci + identitas singkat
3. Urutan kejadian (5-7 poin)
4. Angka-angka penting`,

      latihan: `Aku pelajar Ma'had Al-Azhar Tsanawi, latihan sejarah: [TOPIK]

Buat soal:
1. 3 soal fakta (kapan, siapa, di mana)
2. 2 soal analisis (mengapa, bagaimana)
3. 1 soal evaluasi (apa dampaknya?)
4. JANGAN kasih jawaban dulu`,

      ujian: `Aku pelajar Ma'had Al-Azhar Tsanawi, persiapan ujian sejarah: [TOPIK]

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
      pahami: `Aku pelajar Ma'had Al-Azhar (Tsanawi) yang belajar geografi dalam bahasa Arab.

Topik: [TOPIK]

Jelaskan:
1. Gambaran umum topik ini
2. Istilah Arab geografi penting (tabel)
3. Contoh dari wilayah yang kita kenal (Mesir, Indonesia)
4. Hubungan dengan kehidupan manusia
5. Fakta menarik yang mudah diingat`,

      hafal: `Aku pelajar Ma'had Al-Azhar Tsanawi, mau hafal geografi: [TOPIK]

Buat kartu hafalan:
1. Konsep kunci + definisi Arab
2. Data/angka penting
3. Nama-nama penting + Arab-nya
4. Cara mengingat dengan asosiasi`,

      latihan: `Aku pelajar Ma'had Al-Azhar Tsanawi, latihan geografi: [TOPIK]

Buat soal:
1. 3 soal identifikasi/lokasi
2. 2 soal penjelasan fenomena
3. 1 soal analisis alam-manusia
4. JANGAN kasih jawaban dulu`,

      ujian: `Aku pelajar Ma'had Al-Azhar Tsanawi, persiapan ujian geografi: [TOPIK]

Rangkuman ujian:
1. Definisi (Arab + Indonesia)
2. Data dan angka penting
3. Istilah Arab kunci (tabel)
4. Soal yang biasa keluar`,
    },
  },

  {
    id: "mantiq-tsanawi",
    name: "Mantiq (Logika Islam)",
    nameArabic: "الْمَنْطِقُ",
    category: "umum",
    jenjang: ["tsanawi"],
    description: "Ilmu logika Islam — kaidah berpikir benar, definisi, proposisi, dan silogisme.",
    topikUtama: [
      "تعريف المنطق وموضوعه — Pengertian dan objek Mantiq",
      "التصور والتصديق — Konsep dan penilaian",
      "الكليات الخمس — Lima universal (jins, nau', fashl, khasshah, 'ardh 'amm)",
      "الحد والرسم — Definisi (had) dan deskripsi (rasm)",
      "القضايا المنطقية — Proposisi (qadhiyyah)",
      "القياس — Silogisme (qiyas)",
      "أنواع القياس — Jenis-jenis silogisme",
      "الاستقراء والتمثيل — Induksi dan analogi",
      "المغالطات — Kesalahan logika (mughalathah)",
    ],
    prompts: {
      pahami: `Aku pelajar Ma'had Al-Azhar (Tsanawi) yang belajar Mantiq.

Topik: [TOPIK]

Jelaskan dengan cara yang bikin aku bisa berpikir logis:
1. Pengertian sederhana + istilah Arabnya
2. Contoh konkret dari kehidupan nyata atau contoh dalam bahasa Arab
3. Cara menggunakannya dalam berpikir sehari-hari
4. Hubungannya dengan ilmu-ilmu Islam (fiqh, ushul, dll)
5. Perbedaan dengan konsep Mantiq yang mirip

Mantiq itu ilmu berpikir — bantu aku PAHAM logikanya, bukan sekedar hafal!`,

      hafal: `Aku pelajar Ma'had Al-Azhar Tsanawi, mau hafal Mantiq: [TOPIK]

Buat kartu hafalan:
1. Definisi (Arab + terjemah, 1-2 kalimat)
2. Pembagian/macam-macam dalam tabel (Arab + terjemah)
3. Contoh untuk tiap macam (dalam Arab kalau bisa)
4. Perbedaan dengan konsep yang mirip
5. Cara mengingat dengan asosiasi atau skema sederhana`,

      latihan: `Aku pelajar Ma'had Al-Azhar Tsanawi, latihan Mantiq: [TOPIK]

Buat soal latihan:
1. 2 soal definisi (apa yang dimaksud dengan...)
2. 2 soal identifikasi (ini termasuk jenis apa?)
3. 1 soal buat contoh sendiri (buatlah qiyas/had/qadhiyyah tentang...)
4. JANGAN kasih jawaban dulu — tunggu jawabanku`,

      ujian: `Aku pelajar Ma'had Al-Azhar Tsanawi, persiapan ujian Mantiq: [TOPIK]

Rangkuman ujian:
1. Definisi (Arab + terjemah)
2. Pembagian/macam-macam (tabel rapi)
3. Contoh dari literatur Arab/Islam
4. Perbedaan dengan konsep yang sering tertukar
5. Soal yang biasa keluar di ujian Tsanawi`,
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
