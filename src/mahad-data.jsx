/* Talqeeh — Ma'had Al-Azhar Maddah Data
   Format prompts: array of { title, targetAI, template }
   8-10 prompt per maddah (pahami 2-3, hafal 2, latihan 2, ujian 2)
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
    recommendedAI: [
      { tool: "claude", rank: 1, strength: "Penjelasan kaidah mendalam",
        why: "Claude sangat baik menjelaskan kaidah tajwid dengan contoh dari Al-Qur'an yang tepat dan mudah dipahami" },
      { tool: "chatgpt", rank: 2, strength: "Latihan identifikasi hukum",
        why: "ChatGPT efektif membuat soal latihan identifikasi hukum tajwid dari potongan ayat" },
    ],
    prompts: {
      pahami: [
        {
          title: "Pahami Kaidah Tajwid",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar yang sedang belajar tajwid.

Topik: [TOPIK]

Yang aku butuhkan:
1. Penjelasan singkat dan jelas dalam bahasa Indonesia
2. Contoh dari Al-Qur'an — tulis ayatnya dengan harakat + tunjukkan bagian yang jadi contoh
3. Cara mudah mengingat kaidah ini (trik hafalan)
4. Perbedaan dengan hukum tajwid lain yang mirip

Bahasa: Indonesia yang mudah. Istilah Arab tetap disebut tapi selalu dikasih artinya.`,
        },
        {
          title: "Bedah Contoh dari Ayat",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar yang belajar tajwid.

Kaidah/Hukum: [TOPIK]

Carikan aku 5 contoh dari Al-Qur'an:
1. Tulis ayat lengkap dengan harakat
2. Tunjukkan tepat di mana hukum tajwid ini berlaku (bold atau tandai)
3. Jelaskan kenapa huruf/kata itu punya hukum tersebut
4. Surahnya apa? Ayat berapa?

Aku ingin bisa mengenali hukum ini sendiri saat membaca!`,
        },
        {
          title: "Perbandingan Hukum yang Mirip",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar, sering bingung membedakan hukum tajwid.

Yang membingungkan: [TOPIK]

Tolong buat tabel perbandingan:
| Hukum | Syarat | Cara Baca | Contoh Ayat |
|-------|--------|-----------|-------------|

Lalu jelaskan:
- Cara paling mudah membedakan keduanya
- Kesalahan yang sering terjadi
- Tips agar tidak salah lagi`,
        },
      ],
      hafal: [
        {
          title: "Kartu Hafalan Tajwid",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar, mau hafal kaidah tajwid: [TOPIK]

Bantu aku hafal dengan cara yang menyenangkan:
1. Ringkasan kaidah dalam 3-5 poin pendek
2. Contoh kata/ayat untuk tiap poin — tulis Arab dengan harakat
3. Tips/trik supaya tidak lupa (akronim, cerita, atau cara kreatif lain)
4. 5 pertanyaan cepat untuk test diri sendiri

Buat semenarik mungkin!`,
        },
        {
          title: "Tabel Ringkasan Hukum",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar, buat tabel hafalan tajwid: [TOPIK]

Buat tabel yang bisa aku cetak:
| No | Nama Hukum | Syarat | Cara Baca | Contoh |
|----|-----------|--------|-----------|--------|

Setelah tabel, tambahkan:
- 3 kalimat kunci yang WAJIB diingat
- Cara cepat membedakan kalau ada yang mirip`,
        },
      ],
      latihan: [
        {
          title: "Latihan Identifikasi Hukum",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar, mau latihan tajwid.

Topik: [TOPIK]

Buat latihan soal:
1. Tulis 5 penggalan ayat Al-Qur'an (dengan harakat)
2. Minta aku identifikasi hukum tajwid yang ada
3. JANGAN kasih jawaban dulu — tunggu jawabanku
4. Setelah aku jawab, koreksi dan jelaskan yang benar`,
        },
        {
          title: "Drill Cepat Tajwid",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar, drill tajwid: [TOPIK]

Buat 10 soal pilihan ganda singkat:
- Tampilkan penggalan ayat
- Tanya: hukum bacaan huruf yang dicetak tebal adalah?
  a) ... b) ... c) ... d) ...

JANGAN kasih jawaban dulu. Setelah aku jawab semua, kasih skor dan koreksi lengkap.`,
        },
      ],
      ujian: [
        {
          title: "Rangkuman Siap Ujian Tajwid",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar, persiapan ujian tajwid: [TOPIK]

Buat rangkuman siap ujian:
1. Definisi (Arab + terjemah)
2. Pembagian/macam-macam
3. Contoh dari Al-Qur'an
4. Perbedaan dengan hukum yang mirip
5. Hal yang sering salah dalam ujian`,
        },
        {
          title: "Simulasi Ujian Tajwid",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar, simulasi ujian tajwid: [TOPIK]

Buat 8 soal bergaya ujian Ma'had:
- 2 soal definisi hukum
- 3 soal identifikasi dari ayat
- 2 soal sebut contoh
- 1 soal bedakan dua hukum

Kasih jawaban model setelah aku selesai menjawab semua.`,
        },
      ],
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
    recommendedAI: [
      { tool: "claude", rank: 1, strength: "Pemahaman ayat mendalam",
        why: "Claude sangat bagus menjelaskan kandungan ayat dengan bahasa yang mudah dan dikaitkan dengan konteks kehidupan" },
      { tool: "chatgpt", rank: 2, strength: "Latihan soal pemahaman",
        why: "ChatGPT efektif membuat soal-soal pemahaman teks dan asbabun nuzul untuk persiapan ujian" },
    ],
    prompts: {
      pahami: [
        {
          title: "Pahami Makna Ayat",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar yang belajar tafsir.

Topik/Ayat: [TOPIK]

Yang aku butuhkan:
1. Tulis ayatnya (Arab + harakat + terjemah) kalau tentang ayat tertentu
2. Penjelasan makna dengan bahasa yang mudah
3. Poin-poin penting yang terkandung
4. Asbabun nuzul singkat (kalau ada)
5. Pelajaran/hikmah yang bisa diambil

Bahasa Indonesia yang mudah dipahami!`,
        },
        {
          title: "Asbabun Nuzul & Konteks",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar yang belajar tafsir.

Ayat/Surah: [TOPIK]

Jelaskan konteks turunnya ayat ini:
1. Asbabun nuzul — ceritakan dengan detail (kisahnya seperti apa?)
2. Kondisi umat Islam saat ayat ini turun
3. Bagaimana ayat ini menjawab kondisi tersebut?
4. Apakah ada ayat lain yang berkaitan dengan tema ini?
5. Relevansi ayat ini untuk kehidupan sekarang

Ceritakan seperti bercerita — bukan sekadar poin-poin kering!`,
        },
        {
          title: "Tafsir Perbandingan Ulama",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar yang belajar tafsir.

Ayat: [TOPIK]

Bandingkan penafsiran beberapa ulama tafsir:
1. Tafsir Ibnu Katsir — apa kata beliau?
2. Tafsir Al-Jalalayn — bagaimana ringkasannya?
3. Tafsir Al-Azhar (Hamka) atau tafsir kontemporer
4. Mana yang paling mudah dipahami untuk level Ma'had? Kenapa?
5. Apakah ada perbedaan pendapat? Mana yang lebih kuat?`,
        },
      ],
      hafal: [
        {
          title: "Kartu Belajar Tafsir",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar, mau hafal tafsir: [TOPIK]

Buat kartu belajar:
1. Ayat utama (Arab + harakat + terjemah)
2. Kata kunci tafsir (5-7 frasa penting)
3. Asbabun nuzul dalam 2-3 kalimat
4. 3 poin WAJIB diingat
5. Pertanyaan yang sering keluar di ujian`,
        },
        {
          title: "Peta Konsep Tafsir",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar, hafal tafsir: [TOPIK]

Buat peta konsep yang bisa aku gambar:
- Ayat inti (di tengah)
- Cabang: makna kata kunci, asbabun nuzul, kandungan, hikmah
- Untuk tiap cabang, 1-2 poin pendek

Lalu buat 5 pertanyaan hafalan:
"Apa yang dimaksud dengan...?" "Kenapa ayat ini turun?" dll.`,
        },
      ],
      latihan: [
        {
          title: "Latihan Soal Tafsir",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar, latihan tafsir.

Topik/Surah: [TOPIK]

Buat latihan:
1. 3 pertanyaan pemahaman makna ayat
2. 2 pertanyaan tentang asbabun nuzul
3. 1 pertanyaan "apa pelajaran dari ayat ini?"
4. JANGAN kasih jawaban dulu — tunggu jawabanku`,
        },
        {
          title: "Analisis Ayat Mandiri",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar, latihan analisis tafsir.

Kasih aku satu ayat dari: [TOPIK]

Aku akan mencoba:
1. Menjelaskan makna ayat dengan bahasa sendiri
2. Menyebut kata-kata kunci dan artinya
3. Menyimpulkan kandungan ayat
4. Menyebut hikmah yang bisa diambil

JANGAN bantu dulu — kasih aku ayatnya saja, tunggu analisisku, baru koreksi.`,
        },
      ],
      ujian: [
        {
          title: "Rangkuman Ujian Tafsir",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar, persiapan ujian tafsir: [TOPIK]

Rangkuman ujian:
1. Ayat kunci (Arab + harakat + terjemah singkat)
2. Asbabun nuzul penting
3. Poin tafsir yang perlu diingat
4. Soal-soal yang biasa keluar`,
        },
        {
          title: "Simulasi Ujian Tafsir",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar, simulasi ujian tafsir: [TOPIK]

Buat 8 soal bergaya ujian Ma'had:
- 2 soal makna ayat (sebutkan kandungannya)
- 2 soal asbabun nuzul
- 2 soal makna kata (ما معنى كلمة...؟)
- 2 soal hikmah dan faidah

Kasih jawaban model setelah aku selesai.`,
        },
      ],
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
    recommendedAI: [
      { tool: "claude", rank: 1, strength: "Pemahaman kandungan hadits",
        why: "Claude sangat baik menjelaskan makna dan kandungan hadits dengan bahasa yang mudah dan kaya contoh" },
      { tool: "chatgpt", rank: 2, strength: "Hafalan matan & latihan",
        why: "ChatGPT efektif membuat latihan hafalan matan dan soal-soal tentang perawi dan istilah hadits" },
    ],
    prompts: {
      pahami: [
        {
          title: "Pahami Hadits & Maknanya",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar yang belajar hadits.

Hadits/Topik: [TOPIK]

Yang aku butuhkan:
1. Teks hadits (Arab + harakat) kalau tentang hadits tertentu
2. Terjemah yang mudah dipahami
3. Siapa yang meriwayatkan? — singkat saja
4. Makna dan kandungan hadits
5. Cara mengamalkannya

Jelaskan seperti bercerita!`,
        },
        {
          title: "Analisis Sanad & Matan",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar yang belajar ilmu hadits.

Topik: [TOPIK]

Jelaskan:
1. Apa itu sanad dan matan? (dengan contoh hadits yang jelas)
2. Bagaimana cara menilai kualitas sanad?
3. Tingkatan hadits (shahih, hasan, dha'if) — bedanya apa?
4. Contoh hadits shahih dan dha'if tentang topik yang sama
5. Kenapa penting mengetahui kualitas hadits?`,
        },
      ],
      hafal: [
        {
          title: "Hafal Matan Hadits",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar, mau hafal hadits: [TOPIK]

Bantu aku hafal:
1. Tulis hadits dengan harakat yang jelas + terjemah
2. Pecah menjadi bagian kecil yang mudah dihafal
3. Kata kunci sebagai jangkar hafalan
4. Konteks/cerita di balik hadits
5. Cara test diri sendiri`,
        },
        {
          title: "Tabel Hafalan Kumpulan Hadits",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar, hafal kumpulan hadits: [TOPIK]

Buat tabel hafalan:
| No | Matan (ringkas) | Rawi | Tema | Kualitas |
|----|----------------|------|------|---------|

Lalu untuk setiap hadits:
- Kata pembuka yang khas (permudah identifikasi)
- 1 faidah utama yang harus diingat`,
        },
      ],
      latihan: [
        {
          title: "Latihan Soal Hadits",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar, latihan hadits: [TOPIK]

Buat latihan:
1. 3 hadits (Arab + terjemah) — aku sebutkan rawinya
2. 3 soal pemahaman kandungan
3. 2 soal istilah teknis hadits
4. JANGAN kasih jawaban dulu`,
        },
        {
          title: "Drill Hafalan Matan",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar, drill hafalan hadits: [TOPIK]

Buat latihan isian:
1. Kasih aku awal matan hadits (setengahnya saja)
2. Aku lanjutkan sisanya
3. Kasih aku nama rawi saja — aku sebut matan haditsnya
4. Kasih aku tema — aku sebut hadits yang relevan

JANGAN kasih jawaban dulu untuk setiap soal.`,
        },
      ],
      ujian: [
        {
          title: "Rangkuman Ujian Hadits",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar, persiapan ujian hadits: [TOPIK]

Rangkuman ujian:
1. Hadits yang wajib dihafal (Arab + harakat + terjemah)
2. Nama rawi masing-masing
3. Istilah teknis yang mungkin ditanyakan
4. Soal yang biasa keluar`,
        },
        {
          title: "Simulasi Ujian Hadits",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar, simulasi ujian hadits: [TOPIK]

Buat 8 soal bergaya ujian Ma'had:
- 2 soal hafalan matan (lanjutkan hadits ini...)
- 2 soal tentang rawi dan kualitas hadits
- 2 soal makna dan kandungan
- 2 soal pengamalan (bagaimana menerapkan hadits ini?)

Kasih jawaban model setelah aku selesai.`,
        },
      ],
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
    recommendedAI: [
      { tool: "claude", rank: 1, strength: "Penjelasan konsep aqidah",
        why: "Claude sangat baik menjelaskan konsep-konsep aqidah dengan dalil yang tepat dan mudah dipahami" },
      { tool: "chatgpt", rank: 2, strength: "Latihan soal & hafalan dalil",
        why: "ChatGPT efektif membuat soal pilihan ganda dan membantu hafalan dalil-dalil aqidah" },
    ],
    prompts: {
      pahami: [
        {
          title: "Pahami Konsep Tauhid",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar yang belajar tauhid.

Topik: [TOPIK]

Jelaskan dengan cara yang menarik:
1. Pengertian sederhana
2. Dalil dari Al-Qur'an atau hadits (Arab + harakat + terjemah)
3. Contoh nyata dalam kehidupan sehari-hari
4. Kenapa topik ini penting?
5. Hal yang sering disalahpahami

Buat aku benar-benar paham, bukan sekedar hafal!`,
        },
        {
          title: "Perbandingan Konsep Aqidah",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar yang belajar aqidah.

Topik: [TOPIK]

Bantu aku memahami perbedaan:
1. Buat tabel perbandingan konsep yang sering tertukar
   | Istilah | Pengertian | Contoh | Hukumnya |
2. Mana yang wajib diyakini? Mana yang dilarang?
3. Dalil untuk masing-masing
4. Contoh kasus nyata yang memperlihatkan perbedaannya
5. Cara mudah membedakannya saat ujian`,
        },
      ],
      hafal: [
        {
          title: "Kartu Hafalan Aqidah",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar, mau hafal tauhid: [TOPIK]

Buat kartu hafalan aqidah:
1. Definisi (singkat, 1-2 kalimat)
2. Dalil utama (Arab + harakat + terjemah)
3. Pembagian/macam-macam (tabel atau poin)
4. Perbedaan dengan konsep yang berlawanan
5. Cara mudah mengingat`,
        },
        {
          title: "Tabel Sifat-Sifat Allah",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar, hafal sifat-sifat Allah untuk: [TOPIK]

Buat tabel lengkap:
| No | Sifat Wajib | Artinya | Sifat Mustahil | Artinya | Sifat Jaiz |
|----|-----------|---------|--------------|---------|----|

Setelah tabel:
- Cara mengingat urutan sifat wajib
- Dalil Al-Qur'an untuk 5 sifat wajib yang paling penting`,
        },
      ],
      latihan: [
        {
          title: "Latihan Soal Tauhid",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar, latihan tauhid: [TOPIK]

Buat soal:
1. 3 soal pilihan ganda (4 pilihan)
2. 2 soal isian (definisikan istilah)
3. 1 soal esai pendek
4. JANGAN kasih jawaban dulu`,
        },
        {
          title: "Drill Istilah Aqidah",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar, drill istilah aqidah: [TOPIK]

Buat latihan cepat:
1. Kasih aku definisi — aku tebak istilah Arabnya
2. Kasih aku istilah Arab — aku jelaskan maknanya
3. Kasih aku contoh kasus — aku identifikasi: ini termasuk apa?

10 soal. JANGAN kasih jawaban dulu.`,
        },
      ],
      ujian: [
        {
          title: "Rangkuman Ujian Tauhid",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar, persiapan ujian tauhid: [TOPIK]

Rangkuman ujian:
1. Definisi kunci (Arab + terjemah)
2. Dalil utama yang perlu dihafal
3. Pembagian + penjelasan singkat
4. Perbedaan antar istilah yang mirip
5. Soal yang sering keluar`,
        },
        {
          title: "Simulasi Ujian Tauhid",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar, simulasi ujian tauhid: [TOPIK]

Buat 8 soal bergaya ujian Ma'had:
- 2 soal definisi
- 2 soal dalil (sebutkan dalilnya)
- 2 soal bedakan dua konsep
- 2 soal penerapan (contoh kasus)

Kasih jawaban model setelah aku selesai.`,
        },
      ],
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
    recommendedAI: [
      { tool: "claude", rank: 1, strength: "Penjelasan hukum & dalil",
        why: "Claude sangat teliti dalam menjelaskan syarat, rukun, dan dalil fiqh dengan bahasa yang mudah" },
      { tool: "chatgpt", rank: 2, strength: "Soal kasus fiqh",
        why: "ChatGPT efektif membuat soal-soal kasus fiqh yang realistis untuk latihan dan ujian" },
    ],
    prompts: {
      pahami: [
        {
          title: "Pahami Hukum Fiqh",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar yang belajar fiqh.

Topik: [TOPIK]

Jelaskan:
1. Pengertian singkat
2. Dalil (Arab + harakat + terjemah)
3. Hukumnya apa?
4. Syarat-syarat atau rukun-rukun (daftar jelas)
5. Hal yang sering membingungkan + contoh kasus`,
        },
        {
          title: "Studi Kasus Fiqh",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar yang belajar fiqh.

Topik: [TOPIK]

Jelaskan melalui kasus nyata:
1. Skenario A: kasus normal → hukumnya apa?
2. Skenario B: kasus yang agak berbeda → bagaimana hukumnya berubah?
3. Skenario C: kasus yang sering jadi pertanyaan orang
4. Prinsip umum yang bisa dipakai untuk kasus-kasus serupa
5. Mazhab mana yang paling banyak dipakai di Mesir/Al-Azhar?`,
        },
      ],
      hafal: [
        {
          title: "Kartu Fiqh",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar, mau hafal fiqh: [TOPIK]

Buat kartu fiqh:
1. Definisi (1-2 kalimat)
2. Hukum + dalil singkat
3. Syarat/Rukun (DAFTAR BERNOMOR)
4. Yang membatalkan (kalau ada)
5. Tips hafalan + 5 soal cepat`,
        },
        {
          title: "Skema Alur Fiqh",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar, hafal alur fiqh: [TOPIK]

Buat skema alur yang bisa aku gambar:
IF [kondisi A] → hukumnya [X]
IF [kondisi B] → hukumnya [Y]
IF [kondisi C] → hukumnya [Z]

Lalu buat tabel:
| Syarat/Rukun | Keterangan | Kalau tidak terpenuhi |
|-------------|-----------|----------------------|`,
        },
      ],
      latihan: [
        {
          title: "Latihan Kasus Fiqh",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar, latihan fiqh: [TOPIK]

Buat soal kasus:
1. 3 kasus nyata — aku tentukan hukumnya
2. 2 soal isian — definisi atau syarat/rukun
3. JANGAN kasih jawaban — tunggu jawabanku`,
        },
        {
          title: "Drill Syarat & Rukun",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar, drill fiqh: [TOPIK]

Buat latihan cepat:
1. Sebutkan 1 item — aku tebak: syarat, rukun, atau yang membatalkan?
2. Kasih aku skenario — aku tentukan: sah atau tidak?
3. Kasih soal "apa bedanya [A] dengan [B]?"

15 soal total. JANGAN kasih jawaban dulu.`,
        },
      ],
      ujian: [
        {
          title: "Rangkuman Siap Tulis Fiqh",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar, persiapan ujian fiqh: [TOPIK]

Rangkuman siap tulis:
1. Definisi + hukum + dalil singkat
2. Syarat-syarat (bernomor)
3. Rukun-rukun (bernomor)
4. Yang membatalkan (bernomor)
5. Soal yang sering keluar`,
        },
        {
          title: "Simulasi Ujian Fiqh",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar, simulasi ujian fiqh: [TOPIK]

Buat 8 soal bergaya ujian Ma'had:
- 2 soal definisi dan hukum
- 2 soal sebutkan syarat/rukun
- 2 soal kasus (sah/tidak sah + alasan)
- 2 soal dalil

Kasih jawaban model setelah aku selesai.`,
        },
      ],
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
      "Kalam (Isim, Fi'il, Harf)",
      "I'rab (rafa', nashab, jar, jazm) dan tanda-tandanya",
      "Mubtada' dan Khabar", "Fa'il dan Maf'ul bih",
      "Na'at dan Man'ut", "Dzharaf",
    ],
    recommendedAI: [
      { tool: "claude", rank: 1, strength: "Penjelasan kaidah mendalam",
        why: "Claude sangat baik menjelaskan kaidah nahwu dengan contoh yang tepat dan analisis i'rab yang detail" },
      { tool: "chatgpt", rank: 2, strength: "Latihan i'rab",
        why: "ChatGPT efektif untuk generate soal latihan i'rab dan drill kaidah secara interaktif" },
    ],
    prompts: {
      pahami: [
        {
          title: "Pahami Kaidah Nahwu",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar, belajar nahwu.

Topik: [TOPIK]

Jelaskan dengan sangat jelas:
1. Pengertian dalam bahasa sederhana
2. Contoh kalimat Arab (dengan harakat + terjemah)
3. Tanda-tanda atau ciri-cirinya
4. Kaidah penting yang perlu diingat
5. Lebih banyak contoh dari Al-Qur'an

Aku masih belajar — jelaskan bertahap!`,
        },
        {
          title: "Analisis I'rab Kalimat",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar, mau belajar i'rab.

Kalimat yang ingin aku pahami: [TOPIK]

Tolong bantu:
1. Tulis kalimat dengan harakat lengkap
2. Analisis i'rab tiap kata:
   Kata → Jenis → Kedudukan → Tanda i'rab
3. Jelaskan kenapa tiap kata mendapat i'rab tersebut
4. Kaidah nahwu apa yang berlaku?`,
        },
        {
          title: "Bedah Kaidah yang Membingungkan",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar.

Yang membingungkan: [TOPIK]

Tolong jelaskan:
1. Kaidah asalnya apa?
2. Kenapa ada pengecualian/variasi ini?
3. Contoh kasus yang bikin bingung + penjelasannya
4. Cara mudah membedakan supaya tidak salah lagi`,
        },
      ],
      hafal: [
        {
          title: "Hafal Kaidah Nahwu",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar, mau hafal nahwu: [TOPIK]

Buat kartu hafalan:
1. Kaidah (Arab + terjemah)
2. Tanda-tanda i'rab (tabel)
3. 5 contoh kalimat (Arab + harakat + terjemah)
4. Pengecualian penting
5. Cara membedakan dengan kaidah yang mirip`,
        },
        {
          title: "Tabel I'rab Lengkap",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar.

Buat tabel i'rab untuk: [TOPIK]

| Kedudukan | Nama Arab | Tanda Rafa' | Tanda Nashab | Tanda Jar/Jazm |
|---|---|---|---|---|

Tambahkan contoh untuk tiap baris.`,
        },
      ],
      latihan: [
        {
          title: "Latihan I'rab",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar, latihan i'rab: [TOPIK]

Buat soal:
1. Tulis 5 kalimat Arab sederhana (dengan harakat)
2. Tandai kata yang harus dianalisis
3. JANGAN kasih jawaban dulu
4. Koreksi dengan penjelasan kaidah`,
        },
        {
          title: "Drill Tanda I'rab",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar, drill nahwu: [TOPIK]

Drill cepat:
1. 8 kata/frasa Arab tanpa harakat
2. Aku tentukan: harakat apa + alasan (kedudukan)
3. JANGAN kasih jawaban dulu
4. Koreksi dengan kaidah yang berlaku`,
        },
      ],
      ujian: [
        {
          title: "Rangkuman Ujian Nahwu",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar, persiapan ujian nahwu: [TOPIK]

Rangkuman ujian:
1. Definisi (Arab + terjemah)
2. Kaidah utama (poin-poin)
3. Tanda-tanda i'rab (tabel)
4. Contoh dari Al-Qur'an (Arab + harakat)
5. Hal yang sering salah + soal yang biasa keluar`,
        },
        {
          title: "Simulasi Ujian Nahwu",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar, simulasi ujian nahwu: [TOPIK]

Buat 8 soal bergaya ujian Ma'had:
- 2 soal definisi kaidah
- 3 soal i'rab (tentukan kedudukan kata)
- 2 soal lengkapi harakat
- 1 soal buat kalimat sesuai kaidah

Kasih jawaban model setelah aku selesai.`,
        },
      ],
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
    recommendedAI: [
      { tool: "claude", rank: 1, strength: "Tabel tashrif yang rapi",
        why: "Claude sangat baik membuat tabel tashrif lengkap dan menjelaskan pola perubahan kata dengan contoh" },
      { tool: "chatgpt", rank: 2, strength: "Drill tashrif interaktif",
        why: "ChatGPT efektif untuk latihan tashrif secara interaktif, bisa memberi soal bertahap" },
    ],
    prompts: {
      pahami: [
        {
          title: "Pahami Wazan & Tashrif",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar yang belajar sharf.

Topik: [TOPIK]

Jelaskan:
1. Pengertian sederhana
2. Contoh tashrif/wazan — tabel yang rapi (Arab + harakat)
3. Cara mengenali pola ini
4. Tips mengingat
5. Kata Arab yang sering dipakai dengan pola ini`,
        },
        {
          title: "Bedah Perubahan Fi'il Mu'tal",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar yang belajar sharf.

Topik perubahan: [TOPIK]

Jelaskan kenapa kata Arab berubah bentuknya:
1. Apa itu fi'il mu'tal? Bedanya dengan shahih?
2. Jenis-jenis mu'tal (mitsali, ajwaf, naqish, lafif)
3. Contoh tashrif untuk masing-masing — tabel rapi
4. Kaidah perubahan yang berlaku
5. Tips mengenali jenis fi'il dengan cepat`,
        },
      ],
      hafal: [
        {
          title: "Tabel Tashrif Istilahi",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar, mau hafal sharf: [TOPIK]

Buat tabel tashrif:
1. Tashrif istilahi lengkap (fi'il madhi → fi'il nahi) — tabel rapi, Arab + harakat
2. Tashrif lughawi untuk semua dhamir
3. Tips menghafal pola perubahan`,
        },
        {
          title: "Kartu Wazan",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar, hafal wazan sharf: [TOPIK]

Buat kartu wazan:
1. Wazan (فَعَلَ / فَعَّلَ / dll) — tuliskan dengan harakat
2. Makna/fungsi wazan ini
3. 5 contoh kata dengan wazan ini (Arab + harakat + terjemah)
4. Cara membedakan dengan wazan yang mirip
5. 5 soal cepat: ini wazannya apa?`,
        },
      ],
      latihan: [
        {
          title: "Latihan Tashrif",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar, latihan sharf: [TOPIK]

Buat latihan:
1. 5 kata Arab — aku tashrif-kan semua bentuknya
2. 5 bentuk kata — aku tebak fi'il dan wazannya
3. JANGAN kasih jawaban dulu`,
        },
        {
          title: "Drill Identifikasi Wazan",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar, drill wazan sharf: [TOPIK]

Drill cepat 10 soal:
1. Kasih aku kata — aku tentukan: wazannya apa? jenis fi'ilnya?
2. Kasih aku masdar — aku tentukan: dari fi'il apa?
3. Kasih aku isim fa'il — aku tentukan: fi'il dan wazannya

JANGAN kasih jawaban. Koreksi setelah aku jawab semua.`,
        },
      ],
      ujian: [
        {
          title: "Rangkuman Ujian Sharf",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar, persiapan ujian sharf: [TOPIK]

Rangkuman ujian:
1. Wazan/pola dalam tabel (Arab + harakat)
2. Tashrif istilahi lengkap
3. Perubahan khusus fi'il mu'tal
4. Soal yang biasa keluar`,
        },
        {
          title: "Simulasi Ujian Sharf",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar, simulasi ujian sharf: [TOPIK]

Buat 8 soal bergaya ujian Ma'had:
- 2 soal tashrif istilahi (lanjutkan tabel)
- 2 soal tashrif lughawi
- 2 soal identifikasi wazan
- 2 soal bentuk isim (fa'il/maf'ul/masdar)

Kasih jawaban model setelah aku selesai.`,
        },
      ],
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
    recommendedAI: [
      { tool: "claude", rank: 1, strength: "Narasi sirah yang hidup",
        why: "Claude sangat baik menceritakan peristiwa sirah dengan narasi yang hidup dan menyentuh hati" },
      { tool: "chatgpt", rank: 2, strength: "Timeline & soal fakta",
        why: "ChatGPT efektif membuat timeline kronologis dan soal-soal fakta untuk persiapan ujian" },
    ],
    prompts: {
      pahami: [
        {
          title: "Pahami Peristiwa Sirah",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar yang belajar Sirah Nabawiyah.

Topik/Peristiwa: [TOPIK]

Ceritakan dengan menarik:
1. Latar belakang — apa yang terjadi sebelumnya?
2. Kronologi kejadian — ceritakan seperti bercerita
3. Tokoh-tokoh kunci yang terlibat
4. Hikmah dan pelajaran
5. Kaitannya dengan kehidupan kita sekarang`,
        },
        {
          title: "Analisis Hikmah Sirah",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar yang belajar Sirah Nabawiyah.

Peristiwa: [TOPIK]

Bantu aku memahami hikmah lebih dalam:
1. Mengapa Allah izinkan peristiwa ini terjadi?
2. Bagaimana respons Nabi ﷺ? Apa yang bisa kita teladani?
3. Bagaimana peristiwa ini mengubah perjalanan Islam?
4. Ada hadits atau ayat Al-Qur'an yang berkaitan?
5. Relevansi untuk kehidupan pelajar Ma'had sekarang`,
        },
      ],
      hafal: [
        {
          title: "Timeline Hafalan Sirah",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar, mau hafal sirah: [TOPIK]

Buat timeline hafalan:
1. Tahun/tanggal penting + peristiwa
2. Tokoh kunci + peran singkat
3. Urutan kejadian (5-7 poin)
4. Angka-angka penting
5. Kutipan Nabi ﷺ yang relevan (Arab + terjemah)`,
        },
        {
          title: "Kartu Tokoh Sirah",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar, hafal tokoh-tokoh sirah untuk: [TOPIK]

Buat kartu tokoh:
| Nama | Peran | Kontribusi | Hal Unik |
|------|-------|-----------|---------|

Setelah tabel, tambahkan:
- Hubungan antar tokoh
- Urutan kejadian yang melibatkan mereka
- 5 soal cepat tentang tokoh-tokoh ini`,
        },
      ],
      latihan: [
        {
          title: "Latihan Soal Sirah",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar, latihan sirah: [TOPIK]

Buat soal:
1. 3 soal fakta (kapan, siapa, di mana)
2. 2 soal analisis (mengapa, bagaimana)
3. 1 soal refleksi (apa hikmahnya?)
4. JANGAN kasih jawaban dulu`,
        },
        {
          title: "Drill Timeline Sirah",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar, drill kronologi sirah: [TOPIK]

Drill cepat:
1. Kasih aku tahun — aku sebut peristiwanya
2. Kasih aku peristiwa — aku sebut tahunnya
3. Urutkan 5 peristiwa yang aku acak

JANGAN kasih jawaban dulu.`,
        },
      ],
      ujian: [
        {
          title: "Rangkuman Ujian Sirah",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar, persiapan ujian sirah: [TOPIK]

Rangkuman ujian:
1. Timeline singkat
2. Tokoh penting + peran
3. Fakta kunci yang sering ditanyakan
4. Hikmah yang perlu disebutkan
5. Soal yang biasa keluar`,
        },
        {
          title: "Simulasi Ujian Sirah",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar, simulasi ujian sirah: [TOPIK]

Buat 8 soal bergaya ujian Ma'had:
- 2 soal fakta (siapa/kapan/di mana)
- 2 soal kronologi (urutkan/apa yang terjadi setelah)
- 2 soal tokoh
- 2 soal hikmah

Kasih jawaban model setelah aku selesai.`,
        },
      ],
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
    recommendedAI: [
      { tool: "claude", rank: 1, strength: "Analisis gaya bahasa Arab",
        why: "Claude sangat baik menganalisis unsur balaghah dalam Al-Qur'an dan menjelaskan efek keindahannya" },
      { tool: "chatgpt", rank: 2, strength: "Latihan identifikasi balaghah",
        why: "ChatGPT efektif membuat soal latihan identifikasi jenis-jenis balaghah dari teks Arab" },
    ],
    prompts: {
      pahami: [
        {
          title: "Pahami Unsur Balaghah",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar (Tsanawi) yang belajar balaghah.

Topik: [TOPIK]

Jelaskan:
1. Pengertian sederhana
2. Contoh dari Al-Qur'an (Arab + harakat + terjemah)
3. Mengapa gaya bahasa ini digunakan?
4. Cara mengidentifikasi dalam teks Arab
5. Bedanya dengan gaya bahasa lain yang mirip`,
        },
        {
          title: "Analisis Balaghah Al-Qur'an",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar Tsanawi yang belajar balaghah.

Unsur balaghah: [TOPIK]

Analisis 3 contoh dari Al-Qur'an:
1. Tulis ayatnya (Arab + harakat + terjemah)
2. Tunjukkan: di mana letak balaghah-nya?
3. Jenis apa? (tasybih/majaz/isti'arah/kinayah/dll)
4. Apa efeknya terhadap makna ayat?
5. Kenapa Allah pilih gaya bahasa ini?`,
        },
      ],
      hafal: [
        {
          title: "Kartu Hafalan Balaghah",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar Tsanawi, mau hafal balaghah: [TOPIK]

Buat kartu hafalan:
1. Definisi (Arab + terjemah)
2. Macam-macam + penjelasan singkat
3. 3 contoh dari Al-Qur'an (Arab + harakat)
4. Cara mengidentifikasi dalam teks`,
        },
        {
          title: "Tabel Perbandingan Balaghah",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar Tsanawi, hafal jenis-jenis balaghah: [TOPIK]

Buat tabel perbandingan:
| Istilah | Definisi | Ciri-ciri | Contoh dari Qur'an |
|---------|---------|----------|-------------------|

Setelah tabel:
- Cara paling mudah membedakan jenis-jenis ini
- 5 soal identifikasi cepat`,
        },
      ],
      latihan: [
        {
          title: "Latihan Identifikasi Balaghah",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar Tsanawi, latihan balaghah: [TOPIK]

Buat soal:
1. 3 kalimat/ayat Arab — aku identifikasi unsur balaghahnya
2. 2 contoh — aku jelaskan efek bahasanya
3. JANGAN kasih jawaban dulu`,
        },
        {
          title: "Drill Jenis Balaghah",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar Tsanawi, drill balaghah: [TOPIK]

Drill 8 soal:
1. Tampilkan kalimat Arab — aku tentukan: ini tasybih/majaz/isti'arah/kinayah?
2. Kasih aku jenis balaghah — aku buat satu contoh kalimat
3. Analisis: apa yang membuat kalimat ini indah?

JANGAN kasih jawaban dulu.`,
        },
      ],
      ujian: [
        {
          title: "Rangkuman Ujian Balaghah",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar Tsanawi, persiapan ujian balaghah: [TOPIK]

Rangkuman ujian:
1. Definisi (Arab + terjemah)
2. Pembagian/macam-macam
3. Contoh dari Al-Qur'an
4. Cara mengidentifikasi
5. Soal yang sering keluar`,
        },
        {
          title: "Simulasi Ujian Balaghah",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar Tsanawi, simulasi ujian balaghah: [TOPIK]

Buat 8 soal bergaya ujian Ma'had:
- 2 soal definisi
- 3 soal identifikasi dari teks Arab
- 2 soal bedakan jenis balaghah
- 1 soal analisis efek balaghah

Kasih jawaban model setelah aku selesai.`,
        },
      ],
    },
  },

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
    recommendedAI: [
      { tool: "claude", rank: 1, strength: "Koreksi tulisan Arab",
        why: "Claude sangat baik mengoreksi tulisan Arab, memberi feedback detail tentang nahwu, sharf, dan gaya bahasa" },
      { tool: "chatgpt", rank: 2, strength: "Kosakata & template karangan",
        why: "ChatGPT efektif menyediakan kosakata siap pakai dan template karangan untuk berbagai tema" },
    ],
    prompts: {
      pahami: [
        {
          title: "Pahami Teknik Mengarang Arab",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar yang belajar Insya' (mengarang Arab).

Topik: [TOPIK]

Yang aku butuhkan:
1. Penjelasan konsep/teknik menulis ini dengan bahasa Indonesia yang mudah
2. Contoh tulisan Arab yang baik sesuai topik (dengan harakat)
3. Unsur-unsur yang harus ada dalam tulisan ini
4. Kata-kata dan frasa Arab yang berguna untuk topik ini (kosakata siap pakai)
5. Kesalahan umum yang sering dilakukan pelajar Indonesia saat menulis Arab

Aku ingin bisa menulis Arab dengan benar dan indah!`,
        },
        {
          title: "Contoh Karangan & Analisis",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar yang belajar Insya'.

Tema karangan: [TOPIK]

Tolong:
1. Buat contoh karangan Arab yang baik (12-15 kalimat, dengan harakat)
2. Terjemahkan ke Indonesia
3. Tunjukkan: struktur pembuka-isi-penutup ada di mana?
4. Tandai kata penghubung yang dipakai
5. Kata/frasa Arab apa yang bisa aku "curi" untuk karangan serupa?`,
        },
      ],
      hafal: [
        {
          title: "Hafal Kosakata Insya'",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar, mau hafal kosakata untuk Insya': [TOPIK]

Buat kartu hafalan:
1. 15-20 kosakata Arab penting untuk topik ini (Arab + harakat + terjemah)
2. 10 frasa/ungkapan siap pakai (pembuka, penghubung, penutup)
3. Kata penghubung (أَدَوَاتُ الرَّبْطِ) yang sering dipakai dalam karangan
4. Contoh kalimat menggunakan kosakata di atas`,
        },
        {
          title: "Template Struktur Karangan",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar, hafal template Insya': [TOPIK]

Buat template yang bisa aku pakai berulang-ulang:
PEMBUKA: [3 pilihan kalimat pembuka yang kuat]
ISI paragraf 1: [struktur + kata kunci]
ISI paragraf 2: [struktur + kata kunci]
PENUTUP: [3 pilihan kalimat penutup]

Sertakan kata penghubung transisi yang bisa aku variasikan.`,
        },
      ],
      latihan: [
        {
          title: "Latihan Menulis & Koreksi",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar, latihan menulis Insya'.

Topik mengarang: [TOPIK]

Bantu aku berlatih:
1. Berikan outline/kerangka karangan untuk topik ini
2. Aku akan tulis karangannya — tunggu dulu
3. Setelah aku tulis, koreksi:
   - Kesalahan nahwu dan sharf
   - Kosakata yang bisa diganti lebih baik
   - Struktur kalimat yang perlu diperbaiki
   - Nilai tulisanku (1-10) dengan komentar`,
        },
        {
          title: "Drill Kalimat Arab",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar, drill menulis kalimat Arab: [TOPIK]

Buat latihan:
1. Kasih aku 5 ide/poin dalam bahasa Indonesia → aku tulis dalam Arab
2. Kasih aku kalimat Arab yang salah → aku perbaiki nahwu/sharfnya
3. Kasih aku 3 kata kunci → aku buat kalimat Arab yang benar

JANGAN kasih jawaban dulu — koreksi setelah aku jawab.`,
        },
      ],
      ujian: [
        {
          title: "Persiapan Ujian Insya'",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar, persiapan ujian Insya': [TOPIK]

Buat persiapan ujian:
1. Outline karangan yang lengkap (struktur baku Ma'had)
2. Kosakata wajib yang harus muncul dalam karangan tentang topik ini
3. Frasa pembuka yang kuat (مقدمة)
4. Frasa penutup yang baik (خاتمة)
5. Hal yang sering membuat nilai Insya' turun di ujian`,
        },
        {
          title: "Simulasi Ujian Insya'",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar, simulasi ujian Insya': [TOPIK]

Buat soal ujian:
1. Tugas: tulis karangan tentang [tema] (8-10 kalimat)
2. Batas kosakata yang boleh dipakai (sesuai level)
3. Setelah aku tulis, nilai dengan kriteria:
   - Kebenaran nahwu (30%)
   - Kekayaan kosakata (30%)
   - Koherensi dan struktur (40%)
4. Berikan versi yang diperbaiki sebagai referensi`,
        },
      ],
    },
  },

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
    recommendedAI: [
      { tool: "claude", rank: 1, strength: "Teks Arab & analisis",
        why: "Claude sangat baik menyediakan teks Arab berkualitas dengan harakat dan penjelasan kosakata yang tepat" },
      { tool: "chatgpt", rank: 2, strength: "Soal pemahaman interaktif",
        why: "ChatGPT efektif membuat soal pemahaman dalam bahasa Arab dan memberikan umpan balik jawaban" },
    ],
    prompts: {
      pahami: [
        {
          title: "Pahami Teks Arab",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar yang belajar Mutholaah (membaca pemahaman Arab).

Topik/Jenis teks: [TOPIK]

Yang aku butuhkan:
1. Berikan contoh teks Arab pendek (8-12 baris) sesuai topik — dengan harakat lengkap
2. Terjemah teks ke Indonesia (paragraf per paragraf)
3. Penjelasan kosakata sulit yang muncul dalam teks (Arab + terjemah + cara bacanya)
4. Ide pokok teks dalam 1-2 kalimat
5. Tips cara memahami teks Arab dengan cepat`,
        },
        {
          title: "Strategi Baca Teks Arab",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar yang belajar Mutholaah.

Jenis teks yang mau aku kuasai: [TOPIK]

Ajarkan aku strategi:
1. Bagaimana cara membaca teks Arab tanpa terjemah kata per kata?
2. Cara menebak arti kosakata dari konteks kalimat
3. Cara menemukan ide pokok dengan cepat
4. Tanda-tanda struktural teks Arab (kata penghubung, kata kunci)
5. Latihan singkat dengan teks contoh`,
        },
      ],
      hafal: [
        {
          title: "Kosakata Teks Mutholaah",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar, mau hafal kosakata dari teks Mutholaah: [TOPIK]

Bantu aku kuasai kosakata:
1. Daftar kosakata sulit dari teks ini (Arab + harakat + terjemah + cara pakai dalam kalimat)
2. Kelompokkan per tema (kata benda, kata kerja, sifat)
3. Antonim dan sinonim untuk kosakata kunci
4. Cara mengingat kosakata ini (asosiasi atau cerita)`,
        },
        {
          title: "Template Jawab Soal Mutholaah",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar, hafal cara menjawab soal Mutholaah: [TOPIK]

Buat template jawaban:
1. Soal "ما الفكرة الرئيسية؟" → template jawaban dalam Arab
2. Soal "ما معنى كلمة...؟" → template jawaban dalam Arab
3. Soal "اذكر..." → template jawaban dalam Arab
4. Frasa pembuka jawaban yang bisa dipakai di semua soal
5. Contoh soal + contoh jawaban model`,
        },
      ],
      latihan: [
        {
          title: "Latihan Pemahaman Teks",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar, latihan Mutholaah.

Jenis teks: [TOPIK]

Buat latihan pemahaman:
1. Berikan teks Arab (10-15 baris, dengan harakat)
2. Buat 5 pertanyaan pemahaman dalam bahasa Arab
   + terjemah Indonesia di bawah tiap pertanyaan
3. JANGAN kasih jawaban dulu — tunggu aku jawab
4. Setelah aku jawab, koreksi dengan jawaban yang benar`,
        },
        {
          title: "Drill Kosakata Konteks",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar, drill kosakata dari teks: [TOPIK]

Drill:
1. Kasih aku kalimat Arab — aku tebak arti kata yang dicetak tebal dari konteksnya
2. Kasih aku kosakata Arab — aku buat kalimat menggunakan kata itu
3. Kasih aku 2 kata yang mirip — aku jelaskan perbedaannya

10 soal. Koreksi setelah aku selesai.`,
        },
      ],
      ujian: [
        {
          title: "Persiapan Ujian Mutholaah",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar, persiapan ujian Mutholaah: [TOPIK]

Persiapan ujian:
1. Berikan teks Arab sesuai level (dengan harakat) + terjemah
2. Contoh soal yang biasa keluar di ujian Mutholaah:
   - Soal pemahaman isi (فَهْمُ الْمَقْرُوء)
   - Soal kosakata (اِسْتَخْرِجِ الْمُفْرَدَاتِ)
   - Soal menentukan ide pokok (الْفِكْرَةُ الرَّئِيسِيَّة)
   - Soal menyimpulkan (اِسْتَنْتِجْ)
3. Tips menjawab soal Mutholaah dengan benar dan cepat`,
        },
        {
          title: "Simulasi Ujian Mutholaah",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar, simulasi ujian Mutholaah: [TOPIK]

Buat satu set soal ujian lengkap:
1. Teks Arab (15-20 baris dengan harakat)
2. 8 soal ujian dalam bahasa Arab:
   - 3 soal pemahaman isi
   - 2 soal kosakata
   - 1 soal ide pokok
   - 1 soal kesimpulan
   - 1 soal pendapat pribadi

Kasih jawaban model setelah aku selesai menjawab.`,
        },
      ],
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
    recommendedAI: [
      { tool: "claude", rank: 1, strength: "Penjelasan konsep + istilah Arab",
        why: "Claude sangat baik menjelaskan konsep matematika sambil mengajarkan istilah Arabnya sekaligus" },
      { tool: "chatgpt", rank: 2, strength: "Soal latihan bertahap",
        why: "ChatGPT efektif membuat soal matematika bertahap dari mudah ke sulit dengan format yang bisa dicetak" },
    ],
    prompts: {
      pahami: [
        {
          title: "Pahami Konsep Matematika Arab",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar (I'dadi) yang belajar matematika dalam bahasa Arab.

Topik: [TOPIK]

Yang aku butuhkan:
1. Jelaskan konsepnya dalam bahasa Indonesia yang mudah
2. Tunjukkan istilah Arabnya yang dipakai di buku pelajaran
3. Contoh soal bertahap — mulai dari yang mudah
4. Cara/langkah penyelesaian yang jelas

Aku sering bingung karena harus paham konsep SEKALIGUS istilah Arabnya!`,
        },
        {
          title: "Istilah Arab Matematika",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar (I'dadi) yang sering bingung dengan istilah Arab matematika.

Topik: [TOPIK]

Buat glosarium:
1. Tabel: Istilah Arab → Istilah Indonesia → Definisi singkat
2. Simbol-simbol matematika dalam bahasa Arab
3. Cara soal biasanya ditulis dalam Arab (contoh soal + terjemah)
4. Kata kerja instruksi yang sering muncul (احسب، أوجد، حل...)
5. Langkah mengerjakan soal Arab tanpa panik`,
        },
      ],
      hafal: [
        {
          title: "Kartu Hafalan Rumus",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar (I'dadi), mau hafal matematika: [TOPIK]

Buat kartu hafalan:
1. Rumus utama (Arab + Latin + penjelasan variabel)
2. Tabel istilah: Arab ↔ Indonesia
3. Langkah penyelesaian (poin bernomor)
4. Contoh soal + jawaban lengkap
5. Kesalahan umum yang harus dihindari`,
        },
        {
          title: "Skema Langkah Penyelesaian",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar (I'dadi), hafal langkah matematika: [TOPIK]

Buat skema langkah yang bisa aku jadikan checklist:
Langkah 1: [...]
Langkah 2: [...]
Langkah 3: [...]

Lalu 2 contoh soal bergaya ujian Ma'had dengan langkah penyelesaian lengkap.`,
        },
      ],
      latihan: [
        {
          title: "Latihan Soal Bergaya Ma'had",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar (I'dadi), latihan matematika: [TOPIK]

Buat 5 soal bertahap:
- Format campuran seperti buku Ma'had
- Mulai mudah, naik ke yang lebih sulit
- JANGAN kasih jawaban dulu
- Koreksi dengan langkah penyelesaian lengkap`,
        },
        {
          title: "Drill Soal Cepat",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar (I'dadi), drill matematika: [TOPIK]

Buat 8 soal pilihan ganda bergaya ujian:
- Tampilkan soal dalam bahasa Arab
- 4 pilihan jawaban
- Level: sedang (sesuai ujian akhir I'dadi)

JANGAN kasih jawaban dulu. Kasih kunci dan penjelasan setelah aku jawab semua.`,
        },
      ],
      ujian: [
        {
          title: "Rangkuman Ujian Matematika",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar (I'dadi), persiapan ujian matematika: [TOPIK]

Rangkuman ujian:
1. Rumus WAJIB dihafal (Arab + keterangan)
2. Istilah Arab penting (tabel)
3. Contoh soal + langkah penyelesaian (2 contoh)
4. Tips mengerjakan soal matematika Arab`,
        },
        {
          title: "Simulasi Ujian Matematika",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar (I'dadi), simulasi ujian matematika: [TOPIK]

Buat ujian mini:
1. 2 soal pilihan ganda
2. 2 soal isian
3. 1 soal uraian (tampilkan dalam bahasa Arab)

Batasi waktu: 15 menit. Kasih kunci + pembahasan setelah aku selesai.`,
        },
      ],
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
    recommendedAI: [
      { tool: "claude", rank: 1, strength: "Penjelasan sains + analogi",
        why: "Claude sangat baik menjelaskan konsep sains dengan analogi yang mudah dipahami dan dikaitkan dengan istilah Arab" },
      { tool: "chatgpt", rank: 2, strength: "Soal sains bergaya Ma'had",
        why: "ChatGPT efektif membuat soal sains dalam format ujian Ma'had yang realistis" },
    ],
    prompts: {
      pahami: [
        {
          title: "Pahami Konsep Sains Arab",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar (I'dadi) yang belajar sains dalam bahasa Arab.

Topik: [TOPIK]

Jelaskan:
1. Konsep utama dalam bahasa Indonesia yang mudah
2. Istilah Arab penting (tabel: Arab ↔ Indonesia)
3. Contoh dari kehidupan sehari-hari
4. Penjelasan ilmiahnya yang singkat dan jelas
5. Fakta menarik tentang topik ini`,
        },
        {
          title: "Kosakata Sains Arab",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar (I'dadi) yang kesulitan dengan istilah sains Arab.

Topik: [TOPIK]

Buat glosarium lengkap:
1. Semua istilah teknis Arab untuk topik ini + artinya
2. Cara membaca istilah Arab dengan harakat
3. Bagaimana istilah ini biasanya muncul di soal ujian?
4. Contoh kalimat Arab yang menggunakan istilah-istilah ini
5. Mnemonic/cara mengingat istilah-istilah ini`,
        },
      ],
      hafal: [
        {
          title: "Kartu Hafalan Sains",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar (I'dadi), mau hafal sains: [TOPIK]

Buat kartu hafalan:
1. Konsep kunci dalam 3-5 poin singkat
2. Tabel istilah: Arab ↔ Indonesia
3. Fakta penting yang sering keluar di ujian
4. Cara mengingat dengan asosiasi`,
        },
        {
          title: "Tabel Istilah Sains",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar (I'dadi), hafal istilah sains: [TOPIK]

Buat tabel komprehensif:
| Istilah Arab | Harakat | Terjemah | Definisi Singkat | Contoh |
|-------------|---------|---------|-----------------|--------|

Lalu: 5 pertanyaan cepat tentang istilah-istilah ini.`,
        },
      ],
      latihan: [
        {
          title: "Latihan Soal Sains",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar (I'dadi), latihan sains: [TOPIK]

Buat soal:
1. 3 soal pemahaman konsep
2. 2 soal penerapan (kasus nyata)
3. 1 soal analisis
4. JANGAN kasih jawaban dulu`,
        },
        {
          title: "Drill Istilah Sains",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar (I'dadi), drill istilah sains: [TOPIK]

Drill 10 soal:
1. Kasih aku istilah Arab — aku terjemahkan dan jelaskan
2. Kasih aku definisi — aku sebut istilah Arabnya
3. Kasih aku soal bergaya ujian dalam Arab — aku jawab

JANGAN kasih jawaban. Koreksi setelah aku selesai.`,
        },
      ],
      ujian: [
        {
          title: "Rangkuman Ujian Sains",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar (I'dadi), persiapan ujian sains: [TOPIK]

Rangkuman ujian:
1. Definisi (Arab + Indonesia)
2. Poin-poin penting
3. Istilah Arab kunci (tabel)
4. Contoh dan penerapan
5. Soal yang biasa keluar`,
        },
        {
          title: "Simulasi Ujian Sains",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar (I'dadi), simulasi ujian sains: [TOPIK]

Buat ujian mini bergaya Ma'had:
1. 3 soal pilihan ganda (dalam bahasa Arab)
2. 2 soal isian singkat
3. 1 soal uraian

Kasih kunci + pembahasan setelah aku selesai.`,
        },
      ],
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
    recommendedAI: [
      { tool: "claude", rank: 1, strength: "Penjelasan grammar mendalam",
        why: "Claude sangat baik menjelaskan aturan grammar dengan contoh yang jelas dan membandingkan dengan bahasa Arab/Indonesia" },
      { tool: "chatgpt", rank: 2, strength: "Latihan soal & koreksi tulisan",
        why: "ChatGPT efektif membuat soal fill-in-the-blank dan mengoreksi tulisan bahasa Inggris secara detail" },
    ],
    prompts: {
      pahami: [
        {
          title: "Pahami Grammar Bahasa Inggris",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar yang belajar Bahasa Inggris.

Topik: [TOPIK]

Jelaskan:
1. Aturan/konsep dalam bahasa Indonesia
2. Contoh kalimat sederhana (minimal 5)
3. Kesalahan umum yang sering dilakukan
4. Tips mudah mengingat aturan ini

Aku belajar tiga bahasa sekaligus — bantu aku dengan penjelasan yang jelas!`,
        },
        {
          title: "Perbandingan dengan Bahasa Arab",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar yang belajar Bahasa Inggris.

Topik grammar: [TOPIK]

Bandingkan dengan bahasa Arab/Indonesia:
1. Aturan dalam bahasa Inggris (jelaskan singkat)
2. Aturan serupa dalam bahasa Arab — ada tidak?
3. Di mana titik perbedaan yang sering bikin bingung?
4. Contoh kalimat dalam 3 bahasa (Arab / Indonesia / Inggris)
5. Tips khusus untuk pelajar yang sudah bisa bahasa Arab`,
        },
      ],
      hafal: [
        {
          title: "Kartu Hafalan Bahasa Inggris",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar, mau hafal Bahasa Inggris: [TOPIK]

Buat kartu hafalan:
1. Aturan dalam poin singkat
2. Contoh kalimat tiap aturan
3. Vocabulary penting terkait topik
4. Pengecualian yang perlu diingat`,
        },
        {
          title: "Tabel Grammar",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar, hafal grammar Inggris: [TOPIK]

Buat tabel yang bisa aku cetak:
| Aturan | Struktur Kalimat | Contoh Positif | Contoh Negatif | Contoh Pertanyaan |
|--------|----------------|---------------|---------------|-----------------|

Sertakan catatan pengecualian di bawah tabel.`,
        },
      ],
      latihan: [
        {
          title: "Latihan Fill-in-the-Blank",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar, latihan Bahasa Inggris: [TOPIK]

Buat latihan:
1. 5 soal fill-in-the-blank
2. 3 soal perbaiki kalimat yang salah
3. 2 soal buat kalimat sendiri
4. JANGAN kasih jawaban dulu`,
        },
        {
          title: "Drill Vocabulary",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar, drill vocabulary Inggris: [TOPIK]

Buat latihan:
1. 10 kata — aku tentukan: artinya apa? part of speech apa?
2. 5 kalimat dengan kata yang dihilangkan — aku isi yang tepat
3. 3 pasang kata sinonim/antonim — aku bedakan penggunaannya

JANGAN kasih jawaban dulu.`,
        },
      ],
      ujian: [
        {
          title: "Rangkuman Ujian Bahasa Inggris",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar, persiapan ujian Bahasa Inggris: [TOPIK]

Rangkuman ujian:
1. Aturan/rumus utama
2. Contoh kalimat
3. Vocabulary penting
4. Soal yang biasa keluar`,
        },
        {
          title: "Simulasi Ujian Bahasa Inggris",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar, simulasi ujian Bahasa Inggris: [TOPIK]

Buat ujian mini:
1. 5 soal pilihan ganda
2. 3 soal fill-in
3. 1 soal writing singkat (3-4 kalimat)

Kasih kunci + pembahasan setelah aku selesai.`,
        },
      ],
    },
  },

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
    recommendedAI: [
      { tool: "claude", rank: 1, strength: "Narasi sejarah yang kaya",
        why: "Claude sangat baik menceritakan sejarah dengan narasi yang hidup, kronologi jelas, dan analisis sebab-akibat" },
      { tool: "chatgpt", rank: 2, strength: "Timeline & fakta ujian",
        why: "ChatGPT efektif membuat soal-soal fakta sejarah dan timeline yang sering keluar di ujian" },
    ],
    prompts: {
      pahami: [
        {
          title: "Pahami Peristiwa Sejarah",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar (Tsanawi) yang belajar sejarah dalam bahasa Arab.

Topik: [TOPIK]

Ceritakan dengan menarik:
1. Latar belakang — apa kondisi saat itu?
2. Kronologi peristiwa — naratif, bukan daftar kering
3. Tokoh-tokoh penting + peran singkat
4. Dampak/pengaruh
5. Pelajaran yang bisa diambil`,
        },
        {
          title: "Analisis Sebab-Akibat Sejarah",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar Tsanawi yang belajar sejarah.

Peristiwa: [TOPIK]

Analisis mendalam:
1. SEBAB: Apa faktor-faktor yang menyebabkan peristiwa ini? (faktor internal + eksternal)
2. PROSES: Bagaimana peristiwa ini berkembang? (kronologi singkat)
3. AKIBAT: Apa dampak jangka pendek dan jangka panjangnya?
4. PERBANDINGAN: Adakah peristiwa serupa dalam sejarah lain?
5. RELEVANSI: Apa yang bisa kita pelajari hari ini?`,
        },
      ],
      hafal: [
        {
          title: "Timeline Hafalan Sejarah",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar Tsanawi, mau hafal sejarah: [TOPIK]

Buat timeline hafalan:
1. Tahun penting + peristiwa
2. Tokoh kunci + identitas singkat
3. Urutan kejadian (5-7 poin)
4. Angka-angka penting`,
        },
        {
          title: "Kartu Tokoh Sejarah",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar Tsanawi, hafal tokoh sejarah: [TOPIK]

Buat kartu tokoh:
| Nama | Tahun Hidup | Jabatan/Peran | Kontribusi Utama | Fakta Unik |
|------|------------|--------------|-----------------|-----------|

Setelah tabel, 5 soal cepat: "Siapa yang...?" "Kapan...?" "Di mana...?"`,
        },
      ],
      latihan: [
        {
          title: "Latihan Soal Sejarah",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar Tsanawi, latihan sejarah: [TOPIK]

Buat soal:
1. 3 soal fakta (kapan, siapa, di mana)
2. 2 soal analisis (mengapa, bagaimana)
3. 1 soal evaluasi (apa dampaknya?)
4. JANGAN kasih jawaban dulu`,
        },
        {
          title: "Drill Kronologi Sejarah",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar Tsanawi, drill sejarah: [TOPIK]

Drill:
1. Kasih aku tahun — aku sebut peristiwanya
2. Kasih aku peristiwa — aku sebut tahun + tokoh
3. Urutkan 5 peristiwa yang aku acak
4. "Siapa yang melakukan...?" — aku jawab dengan nama + latar belakang

JANGAN kasih jawaban dulu.`,
        },
      ],
      ujian: [
        {
          title: "Rangkuman Ujian Sejarah",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar Tsanawi, persiapan ujian sejarah: [TOPIK]

Rangkuman ujian:
1. Timeline singkat
2. Tokoh penting + kontribusi
3. Fakta kunci yang sering ditanyakan
4. Sebab dan dampak
5. Soal yang biasa keluar`,
        },
        {
          title: "Simulasi Ujian Sejarah",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar Tsanawi, simulasi ujian sejarah: [TOPIK]

Buat 8 soal bergaya ujian:
- 2 soal fakta (pilihan ganda)
- 2 soal analisis sebab
- 2 soal dampak/akibat
- 2 soal esai singkat

Kasih kunci + pembahasan setelah aku selesai.`,
        },
      ],
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
    recommendedAI: [
      { tool: "claude", rank: 1, strength: "Penjelasan konsep + istilah Arab",
        why: "Claude sangat baik menjelaskan konsep geografi sambil mengajarkan istilah Arab yang tepat" },
      { tool: "chatgpt", rank: 2, strength: "Soal geografi bergaya ujian",
        why: "ChatGPT efektif membuat soal-soal geografi dengan format ujian Ma'had yang realistis" },
    ],
    prompts: {
      pahami: [
        {
          title: "Pahami Konsep Geografi Arab",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar (Tsanawi) yang belajar geografi dalam bahasa Arab.

Topik: [TOPIK]

Jelaskan:
1. Gambaran umum topik ini
2. Istilah Arab geografi penting (tabel)
3. Contoh dari wilayah yang kita kenal (Mesir, Indonesia)
4. Hubungan dengan kehidupan manusia
5. Fakta menarik yang mudah diingat`,
        },
        {
          title: "Geografi Dunia Islam",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar Tsanawi yang belajar geografi.

Topik: [TOPIK]

Fokuskan pada dunia Islam/Timur Tengah:
1. Jelaskan fenomena/konsep geografi ini
2. Bagaimana ini terjadi di kawasan Mesir dan dunia Arab?
3. Contoh nyata dari wilayah yang aku kenal sebagai Masisir
4. Data dan angka penting
5. Istilah Arab geografinya apa?`,
        },
      ],
      hafal: [
        {
          title: "Kartu Hafalan Geografi",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar Tsanawi, mau hafal geografi: [TOPIK]

Buat kartu hafalan:
1. Konsep kunci + definisi Arab
2. Data/angka penting
3. Nama-nama penting + Arab-nya
4. Cara mengingat dengan asosiasi`,
        },
        {
          title: "Tabel Istilah Geografi",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar Tsanawi, hafal istilah geografi: [TOPIK]

Buat tabel:
| Istilah Arab | Harakat | Terjemah | Contoh/Keterangan |
|-------------|---------|---------|-----------------|

Setelah tabel:
- 3 fakta angka yang wajib diingat
- 5 soal cepat tentang istilah-istilah ini`,
        },
      ],
      latihan: [
        {
          title: "Latihan Soal Geografi",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar Tsanawi, latihan geografi: [TOPIK]

Buat soal:
1. 3 soal identifikasi/lokasi
2. 2 soal penjelasan fenomena
3. 1 soal analisis alam-manusia
4. JANGAN kasih jawaban dulu`,
        },
        {
          title: "Drill Fakta Geografi",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar Tsanawi, drill geografi: [TOPIK]

Drill 10 soal:
1. Kasih aku nama tempat — aku jelaskan: di mana + apa pentingnya
2. Kasih aku angka/data — aku tebak ini tentang apa
3. Kasih aku fenomena — aku jelaskan penyebabnya

JANGAN kasih jawaban. Koreksi setelah aku selesai.`,
        },
      ],
      ujian: [
        {
          title: "Rangkuman Ujian Geografi",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar Tsanawi, persiapan ujian geografi: [TOPIK]

Rangkuman ujian:
1. Definisi (Arab + Indonesia)
2. Data dan angka penting
3. Istilah Arab kunci (tabel)
4. Soal yang biasa keluar`,
        },
        {
          title: "Simulasi Ujian Geografi",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar Tsanawi, simulasi ujian geografi: [TOPIK]

Buat ujian mini:
1. 3 soal identifikasi (pilihan ganda)
2. 2 soal isian data/angka
3. 1 soal uraian (jelaskan fenomena ini)
4. 1 soal hubungan sebab-akibat

Kasih kunci + pembahasan setelah aku selesai.`,
        },
      ],
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
    recommendedAI: [
      { tool: "claude", rank: 1, strength: "Penjelasan logika mendalam",
        why: "Claude sangat baik menjelaskan konsep mantiq dengan contoh konkret dan hubungannya dengan ilmu-ilmu Islam" },
      { tool: "chatgpt", rank: 2, strength: "Latihan silogisme & identifikasi",
        why: "ChatGPT efektif membuat soal latihan identifikasi jenis qiyas dan kesalahan logika" },
    ],
    prompts: {
      pahami: [
        {
          title: "Pahami Konsep Mantiq",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar (Tsanawi) yang belajar Mantiq.

Topik: [TOPIK]

Jelaskan dengan cara yang bikin aku bisa berpikir logis:
1. Pengertian sederhana + istilah Arabnya
2. Contoh konkret dari kehidupan nyata atau contoh dalam bahasa Arab
3. Cara menggunakannya dalam berpikir sehari-hari
4. Hubungannya dengan ilmu-ilmu Islam (fiqh, ushul, dll)
5. Perbedaan dengan konsep Mantiq yang mirip

Mantiq itu ilmu berpikir — bantu aku PAHAM logikanya, bukan sekedar hafal!`,
        },
        {
          title: "Mantiq & Ilmu Islam",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar Tsanawi yang belajar Mantiq.

Konsep: [TOPIK]

Tunjukkan hubungan dengan ilmu Islam:
1. Bagaimana konsep mantiq ini dipakai dalam ilmu fiqh?
2. Bagaimana dalam ilmu ushul fiqh?
3. Bagaimana dalam ilmu tafsir atau hadits?
4. Contoh penggunaan nyata oleh ulama klasik
5. Kenapa ulama Al-Azhar mewajibkan belajar Mantiq?`,
        },
      ],
      hafal: [
        {
          title: "Kartu Hafalan Mantiq",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar Tsanawi, mau hafal Mantiq: [TOPIK]

Buat kartu hafalan:
1. Definisi (Arab + terjemah, 1-2 kalimat)
2. Pembagian/macam-macam dalam tabel (Arab + terjemah)
3. Contoh untuk tiap macam (dalam Arab kalau bisa)
4. Perbedaan dengan konsep yang mirip
5. Cara mengingat dengan asosiasi atau skema sederhana`,
        },
        {
          title: "Tabel Kalimat Mantiq",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar Tsanawi, hafal istilah Mantiq: [TOPIK]

Buat tabel:
| Istilah Arab | Terjemah | Definisi Singkat | Contoh | Lawannya |
|-------------|---------|----------------|-------|---------|

Setelah tabel:
- Skema hubungan antar konsep (bisa berupa diagram teks)
- 5 soal cepat identifikasi`,
        },
      ],
      latihan: [
        {
          title: "Latihan Soal Mantiq",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar Tsanawi, latihan Mantiq: [TOPIK]

Buat soal latihan:
1. 2 soal definisi (apa yang dimaksud dengan...)
2. 2 soal identifikasi (ini termasuk jenis apa?)
3. 1 soal buat contoh sendiri (buatlah qiyas/had/qadhiyyah tentang...)
4. JANGAN kasih jawaban dulu — tunggu jawabanku`,
        },
        {
          title: "Drill Silogisme Mantiq",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar Tsanawi, drill Mantiq: [TOPIK]

Drill logika:
1. Kasih aku premis-premis — aku tentukan: qiyas yang valid atau tidak?
2. Kasih aku argumen — aku identifikasi: ada mughalathah (kesalahan logika)?
3. Kasih aku term — aku tentukan: ini kulliat jenis apa?

8 soal. JANGAN kasih jawaban dulu.`,
        },
      ],
      ujian: [
        {
          title: "Rangkuman Ujian Mantiq",
          targetAI: "claude",
          template: `Aku pelajar Ma'had Al-Azhar Tsanawi, persiapan ujian Mantiq: [TOPIK]

Rangkuman ujian:
1. Definisi (Arab + terjemah)
2. Pembagian/macam-macam (tabel rapi)
3. Contoh dari literatur Arab/Islam
4. Perbedaan dengan konsep yang sering tertukar
5. Soal yang biasa keluar di ujian Tsanawi`,
        },
        {
          title: "Simulasi Ujian Mantiq",
          targetAI: "chatgpt",
          template: `Aku pelajar Ma'had Al-Azhar Tsanawi, simulasi ujian Mantiq: [TOPIK]

Buat 8 soal bergaya ujian Ma'had:
- 2 soal definisi istilah Arab
- 2 soal identifikasi jenis/macam
- 2 soal analisis qiyas (valid/tidak?)
- 2 soal buat contoh sendiri

Kasih jawaban model setelah aku selesai.`,
        },
      ],
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
