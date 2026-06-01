import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from 'react';
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
          title: "Pahami Dasar Tajwid dengan Bahasa Sederhana",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar (program persiapan), [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan dasar tajwid untuk pemula dengan bahasa SANGAT mudah:
1. Apa itu tajwid & kenapa penting saat membaca Al-Qur'an.
2. Hukum nun sukun & tanwin (izhar, idgham, iqlab, ikhfa') — sederhana + contoh.
3. Hukum mim sukun — sederhana + contoh.
Hindari istilah rumit; jelaskan bertahap dengan contoh kata.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Makhraj Huruf untuk Pemula",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan makhraj (tempat keluar huruf) secara mudah:
1. Lima tempat utama keluarnya huruf (bahasa sederhana).
2. Huruf yang sering salah pelafalan bagi orang Indonesia (mis. ث ذ ظ ع ح).
3. Tips melatih pengucapan yang benar.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Hukum Mad (Panjang Bacaan)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan hukum mad untuk pemula:
1. Mad ashli (2 harakat) — apa & contohnya.
2. Mad far'i umum (wajib, jaiz, 'aridh) — panjang & contoh sederhana.
3. Cara mengenali mad saat membaca.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Pentingnya Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan dengan sederhana:
1. Kenapa Al-Qur'an harus dipelajari dari guru (talaqqi), bukan sekadar buku.
2. Hal yang bisa dilatih sendiri vs yang butuh guru.
3. Cara memanfaatkan aplikasi (mis. Tarteel) untuk latihan mandiri.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Hukum Nun Sukun & Tanwin",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal hukum nun sukun/tanwin:
1. Tabel sederhana: hukum | huruf | cara baca | contoh.
2. Mnemonic Indonesia yang mudah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Hafal Huruf Tiap Hukum Tajwid",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal pengelompokan huruf (huruf izhar, ikhfa', idgham):
1. Daftar huruf tiap hukum.
2. Jembatan keledai.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Tajwid Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah sederhana H+1, H+3, H+7, mingguan + cara uji. Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Drill Temukan Hukum Tajwid di Ayat",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku potongan ayat pendek (sebut surat & nomor; jangan mengarang). Tugasku: temukan hukum tajwidnya.
1. Mulai dari yang mudah.
2. JANGAN beri jawaban dulu.
3. Koreksi dengan penjelasan sederhana.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Klasifikasi Hukum Bacaan",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 8 contoh kata. Tugasku: tentukan hukumnya (izhar/idgham/ikhfa'/mad).
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Soal Tajwid Sederhana",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal sederhana (definisi, huruf, hukum) dari bab [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Tajwid Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian.

Buatkan soal ujian Tajwid tingkat Ma'had untuk bab [SEBUTKAN]:
1. Tipe: definisi, sebut huruf, temukan hukum di potongan ayat.
2. 5-6 soal dari mudah ke sedang.
3. JANGAN beri jawaban. Tunggu jawabanku, koreksi & nilai dengan bahasa mendukung.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Tanya-Jawab Lisan Tajwid",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian lisan.

Berperanlah sebagai penguji ramah:
1. Tanya hukum tajwid atau minta sebut hukum pada potongan ayat.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik membangun, naikkan kesulitan perlahan.
(Untuk bacaan suara, sarankan aku pakai Tarteel.)

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab yang kupelajari ([SEBUTKAN]): yang sering jadi soal di Ma'had, cara jawab benar, prioritas belajar H-7.

[METODE]

[LEVEL_BAHASA]`,
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
          title: "Pahami Apa Itu Tafsir (Pemula)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar (program persiapan), [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan dasar tafsir untuk pemula dengan bahasa sederhana:
1. Apa itu tafsir & kenapa kita butuh tafsir untuk memahami Al-Qur'an.
2. Beda tafsir dengan terjemah.
3. Cara sederhana memahami ayat (makna kata → makna ayat → pelajaran).

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Tafsir Surat Pendek (Juz 30)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk surat pendek [SEBUTKAN, mis. Al-Ikhlash, Al-'Ashr], jelaskan dengan mudah:
1. Tulis ayatnya (berharakat) — jika ragu redaksinya, minta aku tempel; jangan mengarang.
2. Makna kata kunci.
3. Makna keseluruhan surat.
4. Pelajaran praktis dari surat itu.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Makna Kata dalam Ayat",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk ayat [SEBUTKAN], bantu aku memahami mufradat (kata):
1. Arti tiap kata penting (berharakat + arti Indonesia).
2. Kata yang maknanya tidak biasa.
3. Bagaimana makna kata membentuk makna ayat.
PENTING: pakai ayat yang benar; jika ragu, minta aku tempel.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Pelajaran (Ibrah) dari Ayat",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk ayat/surat [SEBUTKAN]:
1. Pelajaran utama yang bisa diambil.
2. Cara menerapkannya dalam kehidupan sehari-hari.
3. Sajikan dengan bahasa mudah & memotivasi.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Makna Kata Surat yang Dipelajari",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk surat [SEBUTKAN], buatkan daftar mufradat untuk dihafal:
1. Kata (berharakat) + arti.
2. Kelompokkan agar mudah diingat.
PENTING: pakai kata yang benar; jika ragu, katakan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Hafal Pelajaran Inti Tiap Surat",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk surat-surat [SEBUTKAN], buatkan ringkasan hafalan:
1. Nama surat | tema utama | 1-2 pelajaran inti.
2. Mnemonic untuk mengingatnya.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Tafsir Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Surat/ayat yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah sederhana H+1, H+3, H+7, mingguan + cara uji. Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Jelaskan Makna Ayat (Aku Coba)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Aku akan menjelaskan makna ayat [SEBUTKAN] dengan kemampuanku.
1. Koreksi penjelasanku dengan bahasa sederhana.
2. Tambahkan makna/pelajaran yang terlewat.
PENTING: jika aku salah memahami, betulkan dengan lembut.

[METODE]

[LEVEL_BAHASA]

Penjelasanku: [TEMPEL]`,
        },
        {
          title: "Drill Arti Kata dalam Ayat",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 8 kata dari surat [SEBUTKAN]. Tugasku: sebutkan artinya.
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.
PENTING: pakai kata yang benar; jika ragu, katakan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Soal Tafsir Sederhana",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal sederhana (arti kata, makna ayat, pelajaran) dari [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Tafsir Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian.

Buatkan soal ujian Tafsir tingkat Ma'had untuk surat/ayat [SEBUTKAN]:
1. Tipe: arti kata, makna ayat, pelajaran.
2. 5-6 soal mudah ke sedang.
3. JANGAN beri jawaban. Tunggu jawabanku, koreksi & nilai dengan bahasa mendukung.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Tanya-Jawab Lisan Tafsir",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian lisan.

Berperanlah sebagai penguji ramah:
1. Tanya arti kata atau makna ayat sederhana.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik membangun, naikkan kesulitan perlahan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari surat/ayat yang kupelajari ([SEBUTKAN]): yang sering jadi soal, cara jawab benar, prioritas belajar H-7.

[METODE]

[LEVEL_BAHASA]`,
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
          title: "Pahami Apa Itu Hadits (Pemula)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar (program persiapan), [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan dasar hadits untuk pemula dengan bahasa sederhana:
1. Apa itu hadits & kedudukannya dalam Islam.
2. Bagian hadits (sanad & matan) secara mudah.
3. Pembagian sederhana (shahih, hasan, dha'if) tanpa istilah rumit.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Makna Hadits Pendek",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk hadits [SEBUTKAN/tempel], jelaskan dengan mudah:
1. Arti kata-kata sulitnya.
2. Makna keseluruhan hadits.
3. Pelajaran praktis dari hadits itu.
PENTING: pakai teks hadits yang kutempel; jangan mengarang lafazh/sumber. Jika ragu derajat, katakan.

[METODE]

[LEVEL_BAHASA]

Hadits: [TEMPEL]`,
        },
        {
          title: "Pahami Hadits Arba'in / Riyadhus Shalihin",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk hadits [SEBUTKAN, mis. dari Arba'in Nawawi]:
1. Tulis matan-nya kalau kamu yakin; jika ragu, minta aku tempel.
2. Makna & kandungannya.
3. Pelajaran utama yang mudah diterapkan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Cara Mengamalkan Hadits",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk hadits [SEBUTKAN]:
1. Tuntunan praktis yang bisa langsung diamalkan.
2. Contoh penerapan dalam kehidupan sehari-hari.
3. Hikmah di balik tuntunan itu.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Matan Hadits dengan Paham",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu aku menghafal hadits [tempel di bawah]:
1. Pecah matan jadi bagian kecil dengan maknanya.
2. Tips menghafal lafazh Arab + artinya.
PENTING: pakai teks yang kutempel; jangan mengarang lafazh.

[METODE]

[LEVEL_BAHASA]

Hadits: [TEMPEL]`,
        },
        {
          title: "Hafal Pelajaran Inti Tiap Hadits",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk hadits-hadits [SEBUTKAN], buatkan ringkasan hafalan: inti hadits | pelajaran utama. Tambahkan mnemonic.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Hadits Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Hadits yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah sederhana H+1, H+3, H+7, mingguan + cara uji. Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Jelaskan Makna Hadits (Aku Coba)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Aku akan menjelaskan makna hadits [tempel di bawah] dengan kemampuanku.
1. Koreksi penjelasanku dengan bahasa sederhana.
2. Tambahkan pelajaran yang terlewat.

[METODE]

[LEVEL_BAHASA]

Hadits + penjelasanku: [TEMPEL]`,
        },
        {
          title: "Drill Arti Kata dalam Hadits",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari hadits [tempel], beri aku kata-kata sulitnya. Tugasku: sebutkan artinya.
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]

Hadits: [TEMPEL]`,
        },
        {
          title: "Drill Soal Hadits Sederhana",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal sederhana (arti kata, makna, pelajaran, bagian hadits) dari [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Hadits Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian.

Buatkan soal ujian Hadits tingkat Ma'had untuk [SEBUTKAN]:
1. Tipe: arti kata, makna hadits, pelajaran, bagian hadits (sanad/matan).
2. 5-6 soal mudah ke sedang.
3. JANGAN beri jawaban. Tunggu jawabanku, koreksi & nilai dengan bahasa mendukung.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Tanya-Jawab Lisan Hadits",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian lisan.

Berperanlah sebagai penguji ramah:
1. Tanya makna hadits, pelajaran, atau arti kata.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik membangun, naikkan kesulitan perlahan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari hadits yang kupelajari ([SEBUTKAN]): yang sering jadi soal, cara jawab benar, prioritas belajar H-7.

[METODE]

[LEVEL_BAHASA]`,
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
          title: "Pahami Dasar Tauhid dengan Bahasa Sederhana",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar (program persiapan), [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan dasar tauhid untuk pemula dengan bahasa SANGAT mudah:
1. Apa itu tauhid & kenapa ini pokok agama.
2. Rukun iman yang enam — penjelasan ringkas tiap satu.
3. Contoh sederhana penerapan iman dalam kehidupan.
Hindari istilah kalam yang rumit.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Sifat-Sifat Allah (Dasar)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan sifat Allah untuk pemula:
1. Sifat wajib bagi Allah (mulai dari pokok: wujud, qidam, baqa', dll) — Arab berharakat + arti sederhana.
2. Sifat mustahil (lawannya).
3. Sifat jaiz.
Jelaskan bertahap dengan bahasa mudah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Iman kepada Malaikat, Kitab, Rasul",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan dengan sederhana:
1. Iman kepada malaikat (tugas-tugas malaikat).
2. Iman kepada kitab-kitab Allah.
3. Iman kepada para rasul (sifat wajib rasul).
Beri contoh & dalil ringkas yang kamu yakin; jika ragu, katakan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Iman kepada Hari Akhir & Takdir",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan dengan sederhana:
1. Iman kepada hari akhir (tanda, peristiwa pokok).
2. Iman kepada qadha & qadar (takdir) tanpa membuat bingung.
3. Bagaimana iman ini memengaruhi sikap hidup.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Rukun Iman & Islam",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal rukun iman (6) & rukun Islam (5):
1. Daftar berurutan (Arab berharakat + arti).
2. Mnemonic Indonesia yang mudah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Hafal Sifat Wajib Allah (Bertahap)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal sifat wajib Allah secara bertahap:
1. Kelompokkan (mulai dari pokok).
2. Arab berharakat + arti.
3. Mnemonic + pasangkan dengan lawannya (sifat mustahil).

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Tauhid Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah sederhana H+1, H+3, H+7, mingguan + cara uji. Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Drill Sifat Allah & Lawannya",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Sebutkan sifat wajib, tugasku sebutkan arti & lawannya (sifat mustahil).
1. Beri 8 sifat.
2. JANGAN beri jawaban dulu.
3. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Soal Tauhid Sederhana",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal sederhana (rukun iman, sifat Allah, definisi) dari bab [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Jelaskan Konsep Iman (Aku Coba)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Aku akan menjelaskan konsep [SEBUTKAN, mis. iman kepada takdir] dengan kemampuanku.
1. Koreksi penjelasanku dengan bahasa sederhana.
2. Betulkan jika ada pemahaman keliru (penting untuk akidah).

[METODE]

[LEVEL_BAHASA]

Penjelasanku: [TEMPEL]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Tauhid Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian.

Buatkan soal ujian Tauhid tingkat Ma'had untuk bab [SEBUTKAN]:
1. Tipe: definisi, rukun iman, sifat Allah, contoh penerapan.
2. 5-6 soal mudah ke sedang.
3. JANGAN beri jawaban. Tunggu jawabanku, koreksi & nilai dengan bahasa mendukung.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Tanya-Jawab Lisan Tauhid",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian lisan.

Berperanlah sebagai penguji ramah:
1. Tanya rukun iman, sifat Allah, atau konsep dasar.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik membangun, naikkan kesulitan perlahan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab yang kupelajari ([SEBUTKAN]): yang sering jadi soal, cara jawab benar, prioritas belajar H-7.

[METODE]

[LEVEL_BAHASA]`,
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
          title: "Pahami Dasar Fiqh Ibadah dengan Mudah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar (program persiapan), [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan dasar fiqh ibadah untuk pemula dengan bahasa sederhana:
1. Bab thaharah (wudhu, mandi, najis) — rukun & cara, dengan bahasa mudah.
2. Bab shalat — rukun, syarat, hal yang membatalkan.
3. Contoh praktis sehari-hari.
PENTING: sebut dalil dengan benar bila perlu; jika ragu, katakan. Hindari istilah terlalu rumit.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Bab Thaharah Tuntas",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan bab thaharah untuk pemula:
1. Jenis air & najis.
2. Wudhu: rukun, sunnah, pembatal — langkah demi langkah.
3. Mandi wajib & tayammum (kapan & cara).
4. Contoh kasus sehari-hari.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Bab Shalat Tuntas",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan bab shalat untuk pemula:
1. Syarat sah & rukun shalat.
2. Hal yang membatalkan & sunnah-sunnahnya.
3. Sujud sahwi (kapan & cara) secara sederhana.
4. Contoh praktis.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Bab Puasa & Zakat Dasar",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan dasar puasa & zakat:
1. Puasa: syarat wajib, rukun, pembatal, yang membolehkan tidak puasa.
2. Zakat: jenis harta wajib zakat & nisabnya secara sederhana.
3. Contoh praktis.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Rukun & Syarat Ibadah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal rukun/syarat [SEBUTKAN, mis. rukun shalat, rukun wudhu]:
1. Daftar lengkap (Arab berharakat + arti) dengan bahasa mudah.
2. Mnemonic Indonesia.
3. Urutan bila penting.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Tabel Pembatal Ibadah untuk Dihafal",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Buatkan tabel hafalan pembatal (mubthilat) untuk wudhu/shalat/puasa:
1. Kolom: ibadah | hal yang membatalkan.
2. Mnemonic.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Hafal Istilah Fiqh Dasar",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal istilah fiqh dasar (fardhu, sunnah, makruh, najis, hadats, dll):
1. Daftar (Arab berharakat + arti sederhana + contoh).
2. Mnemonic.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Fiqh Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah sederhana H+1, H+3, H+7, mingguan + cara uji. Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Kasus Ibadah Sehari-hari",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 6 kasus ibadah sederhana (mis. "wudhu batal atau tidak jika..."). Tugasku: tentukan hukumnya.
1. Tulis kasusnya.
2. JANGAN beri jawaban dulu.
3. Koreksi + jelaskan dengan bahasa mudah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Soal Rukun & Syarat",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal sederhana (rukun, syarat, pembatal, istilah) dari bab [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Bedakan Hukum (Fardhu/Sunnah/dll)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 8 amalan/perbuatan. Tugasku: tentukan hukumnya (fardhu/sunnah/makruh/mubah/haram).
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Fiqh Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian.

Buatkan soal ujian Fiqh tingkat Ma'had untuk bab [SEBUTKAN]:
1. Tipe soal sesuai level: definisi, rukun/syarat, kasus sederhana.
2. 5-6 soal dari mudah ke sedang.
3. JANGAN beri jawaban. Tunggu jawabanku, koreksi & nilai dengan bahasa mendukung.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Tanya-Jawab Lisan Fiqh",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian lisan.

Berperanlah sebagai penguji yang ramah:
1. Tanya rukun/syarat/hukum, atau beri kasus sederhana.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik membangun, naikkan kesulitan perlahan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab yang kupelajari ([SEBUTKAN]): bab tersering jadi soal di Ma'had, cara jawab yang benar, prioritas belajar H-7.

[METODE]

[LEVEL_BAHASA]`,
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
          title: "Pahami Dasar Nahwu dengan Bahasa Sederhana",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar (program persiapan), [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan dasar nahwu untuk pemula dengan bahasa SANGAT sederhana:
1. Apa itu kalimat (isim, fi'il, harf) — dengan contoh sehari-hari.
2. Konsep i'rab (rafa', nashab, jar, jazm) secara mudah.
3. Beri contoh konkret tiap konsep (teks Arab berharakat + arti).
Hindari istilah yang terlalu rumit; jelaskan bertahap.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Mubtada-Khabar & Fi'il-Fa'il",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan dua struktur kalimat dasar dengan mudah:
1. Jumlah ismiyah (mubtada + khabar) — contoh berharakat sederhana.
2. Jumlah fi'liyah (fi'il + fa'il) — contoh berharakat sederhana.
3. Cara membedakan keduanya.
4. Latihan kecil mengenali keduanya.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Tanda I'rab Dasar",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan tanda i'rab untuk pemula:
1. Tanda asli: dhammah (rafa'), fathah (nashab), kasrah (jar), sukun (jazm).
2. Contoh kata dengan tiap tanda (berharakat).
3. Cara menentukan tanda i'rab sebuah kata.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Bab Penting (Kana, Inna, dll) secara Mudah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan bab [SEBUTKAN, mis. kana wa akhawatuha, inna wa akhawatuha] dengan bahasa sederhana:
1. Apa fungsinya & pengaruhnya pada kalimat.
2. Contoh sebelum & sesudah masuknya 'amil (berharakat).
3. Cara mengingatnya dengan mudah.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Tanda I'rab dengan Mudah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal tanda i'rab:
1. Tabel sederhana: kondisi (rafa'/nashab/jar/jazm) → tanda → contoh.
2. Mnemonic Indonesia yang mudah diingat pemula.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Hafal Huruf-Huruf Penting (Jar, Nashab, dll)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal kelompok huruf:
1. Huruf jar, huruf nashab, akhawat kana & inna (Arab berharakat + arti).
2. Mnemonic untuk tiap kelompok.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Hafal Kaidah Dasar + Contoh",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk bab [SEBUTKAN], buatkan ringkasan hafalan:
1. Kaidah inti (kalimat pendek, berharakat).
2. Satu contoh mudah per kaidah.
3. Mnemonic.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Nahwu Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah sederhana H+1, H+3, H+7, mingguan + cara uji. Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan I'rab Kalimat Sederhana",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 8 kalimat Arab SEDERHANA berharakat untuk di-i'rab.
1. Mulai dari yang sangat mudah.
2. JANGAN beri jawaban dulu.
3. Setelah aku i'rab, koreksi dengan penjelasan mudah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Lengkapi Harakat Akhir",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 8 kalimat tanpa harakat akhir. Tugasku: tentukan harakat akhir tiap kata sesuai i'rab.
1. JANGAN beri jawaban dulu.
2. Koreksi + jelaskan kenapa.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Kenali Jenis Kata & Struktur",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 contoh. Tugasku: tentukan jenis kata (isim/fi'il/harf) atau struktur (ismiyah/fi'liyah).
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Nahwu Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian.

Buatkan soal ujian Nahwu tingkat Ma'had untuk bab [SEBUTKAN]:
1. Tipe soal sesuai level pemula: i'rab kalimat sederhana, lengkapi harakat, sebut kaidah.
2. 5-6 soal dari mudah ke sedang.
3. JANGAN beri jawaban. Tunggu jawabanku, lalu koreksi & nilai dengan bahasa yang mendukung.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Tanya-Jawab Lisan Nahwu",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian lisan.

Berperanlah sebagai penguji yang ramah:
1. Tanya kaidah dasar atau minta i'rab kata sederhana.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Beri umpan balik yang membangun, naikkan kesulitan perlahan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab yang kupelajari ([SEBUTKAN]): bab tersering jadi soal di tingkat Ma'had, cara jawab yang benar, prioritas belajar H-7.

[METODE]

[LEVEL_BAHASA]`,
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
        title: "Pahami Dasar Sharf dengan Bahasa Sederhana",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar (program persiapan), [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan dasar sharf untuk pemula dengan bahasa SANGAT mudah:
1. Apa itu sharf & bedanya dengan nahwu (sharf = bentuk kata, nahwu = posisi kata).
2. Konsep tashrif (perubahan kata) — contoh sederhana.
3. Kenapa sharf penting untuk membaca & memahami Arab.
Hindari istilah rumit; pakai contoh kata sehari-hari.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Pahami Tashrif Istilahi Dasar",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan tashrif istilahi (نَصَرَ يَنْصُرُ...) untuk pemula:
1. Apa itu & urutannya (madhi → mudhari → mashdar → ...).
2. Contoh tashrif satu fi'il berharakat, langkah demi langkah.
3. Cara mengingat urutannya.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Pahami Wazan (Timbangan Kata) Sederhana",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan konsep wazan untuk pemula:
1. Konsep fa-'ain-lam (ف ع ل) sebagai timbangan, dengan bahasa mudah.
2. Contoh menimbang kata sederhana.
3. Manfaat tahu wazan untuk menebak makna.

[METODE]

[LEVEL_BAHASA]`,
      },
    ],
    hafal: [
      {
        title: "Hafal Tashrif Istilahi dengan Irama",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal tashrif istilahi seperti metode pesantren:
1. Susun urutan berirama agar mudah dilafalkan berulang.
2. Pecah per kelompok.
3. Tandai bagian yang sering lupa.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Hafal Pola Wazan Dasar",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal wazan tsulatsi dasar:
1. Tabel sederhana: wazan | contoh | makna umum.
2. Mnemonic untuk mengingatnya.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Jadwal Muraja'ah Sharf Ma'had",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah sederhana H+1, H+3, H+7, mingguan + cara uji (tashrif lisan). Tabel.

[METODE]

[LEVEL_BAHASA]`,
      },
    ],
    latihan: [
      {
        title: "Latihan Tashrif dari Akar Kata",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 6 akar kata sederhana. Tugasku: tashrif istilahi-nya.
1. Sebut akarnya saja.
2. JANGAN beri jawaban dulu.
3. Koreksi dengan penjelasan mudah.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Drill Tentukan Wazan",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 8 kata berharakat. Tugasku: tentukan wazan-nya.
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Drill Soal Sharf Sederhana",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal sederhana (tashrif, wazan, definisi) dari bab [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
      },
    ],
    ujian: [
      {
        title: "Mock Imtihan Sharf Ma'had",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian.

Buatkan soal ujian Sharf tingkat Ma'had untuk bab [SEBUTKAN]:
1. Tipe: tashrif kata, tentukan wazan, definisi.
2. 5-6 soal mudah ke sedang.
3. JANGAN beri jawaban. Tunggu jawabanku, koreksi & nilai dengan bahasa mendukung.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Simulasi Tanya-Jawab Lisan Sharf",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian lisan.

Berperanlah sebagai penguji ramah:
1. Minta aku tashrif kata atau tentukan wazan secara lisan.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik membangun, naikkan kesulitan perlahan.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Kisi-kisi & Strategi Ujian Ma'had",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab yang kupelajari ([SEBUTKAN]): yang sering jadi soal, cara jawab benar, prioritas belajar H-7.

[METODE]

[LEVEL_BAHASA]`,
      },
    ],
  }
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
        title: "Pahami Garis Besar Sirah Nabi (Pemula)",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar (program persiapan), [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan garis besar sirah Nabi ﷺ dengan bahasa sederhana:
1. Fase besar: kelahiran → kenabian → Makkah → hijrah → Madinah → wafat.
2. Peristiwa paling penting tiap fase (ringkas).
3. Sajikan sebagai timeline mudah diingat.
PENTING: sebut yang kamu yakin; jika ragu, katakan.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Pahami Peristiwa Penting Periode Makkah",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan dengan mudah periode Makkah:
1. Permulaan wahyu & dakwah.
2. Tantangan & kesabaran Nabi.
3. Pelajaran sederhana yang bisa diambil.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Pahami Peristiwa Penting Periode Madinah",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan dengan mudah periode Madinah:
1. Hijrah & membangun masyarakat.
2. Peperangan besar (ringkas) & maknanya.
3. Pelajaran sederhana untuk kehidupan.

[METODE]

[LEVEL_BAHASA]`,
      },
    ],
    hafal: [
      {
        title: "Hafal Timeline Peristiwa Penting",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal urutan peristiwa sirah:
1. Timeline sederhana + tahun (kalau yakin).
2. Mnemonic untuk urutannya.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Tabel Peperangan untuk Dihafal",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Buatkan tabel hafalan sederhana: perang | tahun | hasil | pelajaran. Tandai yang sering jadi soal.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Jadwal Muraja'ah Sirah Ma'had",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Periode yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah sederhana H+1, H+3, H+7, mingguan + cara uji. Tabel.

[METODE]

[LEVEL_BAHASA]`,
      },
    ],
    latihan: [
      {
        title: "Drill Kronologi Peristiwa",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 8 soal urutan peristiwa & tokoh dari periode [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Latihan Ambil Pelajaran (Ibrah)",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 4 peristiwa sirah. Tugasku: ambil pelajarannya.
1. JANGAN beri jawaban dulu.
2. Koreksi + tambahkan pelajaran yang terlewat.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Drill Soal Sirah Sederhana",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal sederhana (peristiwa, tokoh, pelajaran) dari [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
      },
    ],
    ujian: [
      {
        title: "Mock Imtihan Sirah Ma'had",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian.

Buatkan soal ujian Sirah tingkat Ma'had untuk periode [SEBUTKAN]:
1. Tipe: peristiwa, tokoh, pelajaran.
2. 5-6 soal mudah ke sedang.
3. JANGAN beri jawaban. Tunggu jawabanku, koreksi & nilai dengan bahasa mendukung.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Simulasi Tanya-Jawab Lisan Sirah",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian lisan.

Berperanlah sebagai penguji ramah:
1. Tanya peristiwa, tokoh, atau pelajaran.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik membangun, naikkan kesulitan perlahan.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Kisi-kisi & Strategi Ujian Ma'had",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari periode yang kupelajari ([SEBUTKAN]): yang sering jadi soal, cara jawab benar, prioritas belajar H-7.

[METODE]

[LEVEL_BAHASA]`,
      },
    ],
  }
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
        title: "Pahami Apa Itu Balaghah (Pemula)",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar (program persiapan), [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan dasar balaghah untuk pemula dengan bahasa mudah:
1. Apa itu balaghah & kenapa membuat bahasa jadi indah.
2. Tiga cabang (ma'ani, bayan, badi') secara ringkas.
3. Contoh sederhana keindahan bahasa.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Pahami Tasybih (Perumpamaan) Sederhana",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan tasybih untuk pemula:
1. Apa itu tasybih + rukunnya (yang diserupakan, penyerupa, alat, sifat).
2. Contoh tasybih sederhana berharakat.
3. Cara mengenali tasybih dalam kalimat.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Pahami Majaz & Kinayah Dasar",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan dengan mudah:
1. Majaz (makna bukan sebenarnya) — contoh sederhana.
2. Kinayah (sindiran halus) — contoh sederhana.
3. Beda keduanya.

[METODE]

[LEVEL_BAHASA]`,
      },
    ],
    hafal: [
      {
        title: "Hafal Cabang Balaghah & Isinya",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal tiga cabang balaghah:
1. Tabel: cabang | fokus | contoh gaya.
2. Mnemonic.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Hafal Rukun Tasybih",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal 4 rukun tasybih (Arab berharakat + arti) + mnemonic, dengan satu contoh mudah.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Jadwal Muraja'ah Balaghah Ma'had",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah sederhana H+1, H+3, H+7, mingguan + cara uji. Tabel.

[METODE]

[LEVEL_BAHASA]`,
      },
    ],
    latihan: [
      {
        title: "Drill Kenali Gaya Balaghah",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 6 kalimat sederhana. Tugasku: kenali gaya balaghah-nya (tasybih/majaz/kinayah).
1. JANGAN beri jawaban dulu.
2. Koreksi dengan penjelasan mudah.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Drill Tentukan Rukun Tasybih",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 6 contoh tasybih. Tugasku: tentukan rukun-rukunnya.
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Drill Soal Balaghah Sederhana",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal sederhana (definisi, gaya, rukun) dari bab [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
      },
    ],
    ujian: [
      {
        title: "Mock Imtihan Balaghah Ma'had",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian.

Buatkan soal ujian Balaghah tingkat Ma'had untuk bab [SEBUTKAN]:
1. Tipe: definisi, kenali gaya, tentukan rukun.
2. 5-6 soal mudah ke sedang.
3. JANGAN beri jawaban. Tunggu jawabanku, koreksi & nilai dengan bahasa mendukung.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Simulasi Tanya-Jawab Lisan Balaghah",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian lisan.

Berperanlah sebagai penguji ramah:
1. Tanya definisi atau minta kenali gaya pada kalimat pendek.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik membangun, naikkan kesulitan perlahan.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Kisi-kisi & Strategi Ujian Ma'had",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab yang kupelajari ([SEBUTKAN]): yang sering jadi soal, cara jawab benar, prioritas belajar H-7.

[METODE]

[LEVEL_BAHASA]`,
      },
    ],
  }
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
        title: "Pahami Dasar Menulis Arab (Insya')",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar (program persiapan), [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan dasar insya' (mengarang Arab) untuk pemula:
1. Apa itu insya' & tujuannya.
2. Cara menyusun kalimat Arab sederhana yang benar.
3. Kesalahan umum pemula saat menulis Arab.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Pahami Struktur Paragraf Arab Sederhana",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan cara membuat paragraf Arab sederhana:
1. Struktur: kalimat pembuka, isi, penutup.
2. Kata penghubung (rawabith) yang sering dipakai.
3. Contoh paragraf pendek berharakat + terjemah.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Pahami Kosakata & Ungkapan untuk Menulis",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk tema [SEBUTKAN, mis. perkenalan diri, kegiatan harian]:
1. Kosakata penting untuk menulis tentang tema itu.
2. Ungkapan/pola kalimat yang berguna.
3. Contoh kalimat memakainya.

[METODE]

[LEVEL_BAHASA]`,
      },
    ],
    hafal: [
      {
        title: "Hafal Kata Penghubung (Rawabith)",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal kata penghubung untuk mengarang:
1. Daftar rawabith (Arab berharakat + arti + fungsi).
2. Mnemonic.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Hafal Kosakata per Tema",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk tema [SEBUTKAN], buatkan daftar kosakata untuk dihafal: kata (berharakat) + arti, dikelompokkan.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Jadwal Muraja'ah Insya' Ma'had",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Tema yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal latihan menulis & muraja'ah kosakata. Tabel.

[METODE]

[LEVEL_BAHASA]`,
      },
    ],
    latihan: [
      {
        title: "Latihan Menulis Paragraf (Aku Coba, AI Koreksi)",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Aku akan menulis paragraf Arab pendek tentang [SEBUTKAN TEMA] (di bawah).
1. Koreksi tata bahasa (nahwu/sharf) & pilihan kata.
2. Tunjukkan kesalahan + cara perbaikannya.
3. Beri versi yang lebih baik sebagai contoh.

[METODE]

[LEVEL_BAHASA]

Tulisanku: [TEMPEL]`,
      },
      {
        title: "Latihan Susun Kalimat dari Kosakata",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 6 kosakata. Tugasku: susun kalimat Arab benar memakainya.
1. JANGAN beri contoh dulu.
2. Koreksi kalimatku + perbaiki.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Latihan Perbaiki Kalimat Salah",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 6 kalimat Arab yang ada kesalahannya. Tugasku: temukan & perbaiki.
1. JANGAN beri jawaban dulu.
2. Koreksi + jelaskan kesalahannya.

[METODE]

[LEVEL_BAHASA]`,
      },
    ],
    ujian: [
      {
        title: "Mock Imtihan Insya' Ma'had",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian.

Buatkan soal ujian Insya' tingkat Ma'had:
1. Tipe: tulis paragraf tentang tema, susun kalimat dari kata, perbaiki kalimat.
2. 4-5 soal.
3. JANGAN beri jawaban. Tunggu jawabanku, koreksi tata bahasa & beri nilai dengan bahasa mendukung.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Latihan Menulis Terbimbing",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bimbing aku menulis karangan pendek tentang [SEBUTKAN]:
1. Beri kerangka (poin yang bisa ditulis).
2. Setelah aku tulis tiap bagian, koreksi & arahkan.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Kisi-kisi & Strategi Ujian Ma'had",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk ujian insya': tema yang sering keluar, cara menulis agar minim kesalahan, kosakata & pola yang perlu disiapkan, prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
      },
    ],
  }
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
        title: "Pahami Cara Membaca Pemahaman (Mutholaah)",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar (program persiapan), [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan dasar mutholaah (membaca pemahaman Arab):
1. Apa itu mutholaah & tujuannya.
2. Cara membaca teks Arab agar paham (bukan sekadar baca).
3. Strategi menebak makna kata baru dari konteks.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Pahami Teks Bacaan (Aku Tempel, AI Jelaskan)",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Aku tempel teks bacaan Arab di bawah. Bantu aku memahaminya:
1. Arti kata-kata sulit.
2. Makna tiap kalimat.
3. Inti/ide pokok bacaan.

[METODE]

[LEVEL_BAHASA]

Teks: [TEMPEL]`,
      },
      {
        title: "Pahami Cara Menemukan Ide Pokok",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Ajari aku menemukan ide pokok teks Arab:
1. Cara mengenali kalimat utama tiap paragraf.
2. Cara membedakan info penting & detail pendukung.
3. Cara meringkas bacaan.

[METODE]

[LEVEL_BAHASA]`,
      },
    ],
    hafal: [
      {
        title: "Hafal Kosakata dari Teks Bacaan",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari teks [tempel/sebutkan], buatkan daftar kosakata untuk dihafal: kata (berharakat) + arti, dikelompokkan per tema.

[METODE]

[LEVEL_BAHASA]

Teks: [TEMPEL]`,
      },
      {
        title: "Hafal Pola Kalimat yang Sering Muncul",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu aku menghafal pola kalimat Arab yang sering muncul dalam bacaan + artinya + contoh. Tambahkan mnemonic.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Jadwal Muraja'ah Mutholaah Ma'had",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Teks/kosakata yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah kosakata & latihan baca. Tabel.

[METODE]

[LEVEL_BAHASA]`,
      },
    ],
    latihan: [
      {
        title: "Latihan Jawab Pertanyaan Bacaan",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari teks yang kutempel, beri aku pertanyaan pemahaman (fahm al-maqru').
1. Beri 5 pertanyaan.
2. JANGAN beri jawaban dulu.
3. Koreksi jawabanku.

[METODE]

[LEVEL_BAHASA]

Teks: [TEMPEL]`,
      },
      {
        title: "Latihan Terjemah & Pahami Kalimat",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 6 kalimat Arab. Tugasku: terjemahkan & jelaskan maknanya.
1. JANGAN beri jawaban dulu.
2. Koreksi terjemahanku.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Latihan Ringkas Bacaan",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari teks yang kutempel, aku akan membuat ringkasannya.
1. Koreksi ringkasanku (apakah menangkap ide pokok).
2. Tunjukkan poin penting yang terlewat.

[METODE]

[LEVEL_BAHASA]

Teks + ringkasanku: [TEMPEL]`,
      },
    ],
    ujian: [
      {
        title: "Mock Imtihan Mutholaah Ma'had",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian.

Berdasarkan teks yang kutempel (atau buatkan teks pendek sesuai level), buat soal ujian mutholaah:
1. Tipe: arti kata, pemahaman isi, ide pokok.
2. 5-6 soal.
3. JANGAN beri jawaban. Tunggu jawabanku, koreksi & nilai dengan bahasa mendukung.

[METODE]

[LEVEL_BAHASA]

Teks (opsional): [TEMPEL]`,
      },
      {
        title: "Simulasi Tanya-Jawab Lisan Mutholaah",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian lisan.

Berperanlah sebagai penguji ramah:
1. Beri kalimat/teks pendek, minta aku jelaskan maknanya.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik membangun, naikkan kesulitan perlahan.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Kisi-kisi & Strategi Ujian Ma'had",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk ujian mutholaah: tipe teks & pertanyaan yang sering keluar, strategi membaca cepat-paham, prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
      },
    ],
  }
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
        title: "Pahami Konsep Matematika Step-by-Step",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar (program persiapan), [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan konsep [SEBUTKAN TOPIK, mis. pecahan, aljabar dasar, persamaan] dengan SANGAT sederhana:
1. Apa konsep dasarnya, pakai bahasa sehari-hari.
2. Langkah pengerjaan, satu per satu.
3. Satu contoh soal dikerjakan lengkap.
4. Kesalahan umum & cara menghindarinya.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Pahami Rumus & Kapan Memakainya",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk topik [SEBUTKAN]:
1. Tuliskan rumus-rumus pentingnya.
2. Jelaskan ARTI tiap simbol dalam rumus.
3. Kapan tiap rumus dipakai (jangan cuma hafal, tapi paham).
4. Contoh penerapan tiap rumus.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Pahami dari Soal Cerita ke Persamaan",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Ajari aku mengubah soal cerita jadi persamaan matematika:
1. Cara membaca soal & menemukan yang ditanya.
2. Cara mengubah kalimat jadi simbol/persamaan.
3. Contoh 2 soal cerita dikerjakan dari awal sampai jawaban.

[METODE]

[LEVEL_BAHASA]`,
      },
    ],
    hafal: [
      {
        title: "Hafal Rumus Penting dengan Pemahaman",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk topik [SEBUTKAN], bantu aku menghafal rumus:
1. Daftar rumus penting + arti simbol.
2. Cara mengingat tiap rumus (logika/jembatan keledai), bukan hafalan buta.
3. Tandai rumus yang sering dipakai.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Hafal Langkah Pengerjaan Tipe Soal",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk tipe soal [SEBUTKAN], buatkan checklist langkah pengerjaan:
1. Urutan langkah dari membaca soal sampai jawaban.
2. Cara cepat mengenali tipe soal ini.
3. Mnemonic untuk urutan langkah.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Jadwal Latihan Rutin Matematika",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Topik yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal latihan rutin:
1. Porsi latihan soal harian per topik.
2. Cara mengukur kemajuan.
3. Tabel jadwal.

[METODE]

[LEVEL_BAHASA]`,
      },
    ],
    latihan: [
      {
        title: "Latihan Soal Bertingkat (Aku Kerjakan, AI Koreksi)",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 6 soal [SEBUTKAN TOPIK] dari mudah ke sulit.
1. Tampilkan soalnya saja.
2. JANGAN beri jawaban dulu.
3. Setelah aku kerjakan, koreksi langkah demi langkah & tunjukkan di mana salahnya.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Latihan Soal Cerita",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 4 soal cerita tentang [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Setelah aku jawab, koreksi cara mengubah ke persamaan & perhitungannya.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Bedah Soal yang Aku Salah",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Aku salah mengerjakan soal ini (kutempel di bawah dengan jawabanku).
1. Tunjukkan persis di langkah mana aku salah.
2. Jelaskan kenapa salah & cara benarnya.
3. Beri 2 soal serupa untuk latihan.

[METODE]

[LEVEL_BAHASA]

Soal + jawabanku: [TEMPEL]`,
      },
    ],
    ujian: [
      {
        title: "Mock Ujian Matematika Ma'had",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian.

Buatkan satu set soal ujian Matematika tingkat Ma'had untuk topik [SEBUTKAN]:
1. Campur tipe soal (hitung langsung, soal cerita) dari mudah ke sulit.
2. 6-8 soal.
3. JANGAN beri jawaban. Tunggu jawabanku, koreksi langkah & beri skor.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Strategi Mengerjakan Ujian Matematika",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu strategi ujian matematika:
1. Cara membagi waktu antar soal.
2. Cara cek ulang jawaban agar tidak ada salah hitung.
3. Tips kalau menemui soal yang sulit.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Kisi-kisi & Topik Prioritas",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari topik yang kupelajari ([SEBUTKAN]): tipe soal yang sering keluar, topik yang perlu latihan ekstra, rencana belajar H-7.

[METODE]

[LEVEL_BAHASA]`,
      },
    ],
  }
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
        title: "Pahami Konsep Sains dengan Bahasa Sederhana",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar (program persiapan), [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan konsep [SEBUTKAN TOPIK, mis. fotosintesis, gaya, sistem pencernaan] dengan sangat sederhana:
1. Apa konsepnya, pakai analogi sehari-hari.
2. Bagaimana prosesnya bekerja, bertahap.
3. Kenapa penting/contoh dalam kehidupan.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Pahami dengan Diagram & Analogi",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk topik [SEBUTKAN]:
1. Jelaskan dengan analogi yang mudah dibayangkan.
2. Gambarkan prosesnya dalam bentuk langkah/alur (deskripsi diagram).
3. Hubungkan dengan contoh nyata yang sering kutemui.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Pahami Hubungan Sebab-Akibat dalam Sains",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk fenomena [SEBUTKAN]:
1. Apa penyebabnya & bagaimana terjadi.
2. Apa akibat/hasilnya.
3. Hubungkan konsep ini dengan konsep lain yang sudah kupelajari.

[METODE]

[LEVEL_BAHASA]`,
      },
    ],
    hafal: [
      {
        title: "Hafal Istilah & Definisi Sains",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk topik [SEBUTKAN], bantu hafal istilah penting:
1. Tabel: istilah | definisi sederhana | contoh.
2. Mnemonic untuk istilah yang sulit.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Hafal Klasifikasi & Urutan Proses",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk topik [SEBUTKAN, mis. klasifikasi makhluk hidup, tahapan suatu proses]:
1. Susun klasifikasi/urutan dengan rapi.
2. Mnemonic untuk mengingat urutannya.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Jadwal Belajar Sains",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Topik yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal belajar & muraja'ah + cara uji pemahaman. Tabel.

[METODE]

[LEVEL_BAHASA]`,
      },
    ],
    latihan: [
      {
        title: "Latihan Soal Konsep (Aku Jawab, AI Koreksi)",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 8 soal tentang [SEBUTKAN] (pilihan ganda & uraian singkat).
1. JANGAN beri jawaban dulu.
2. Setelah aku jawab, koreksi + jelaskan yang salah.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Latihan Jelaskan dengan Kata Sendiri",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Aku akan menjelaskan konsep [SEBUTKAN] dengan kata-kataku sendiri (di bawah).
1. Koreksi pemahamanku.
2. Tunjukkan bagian yang kurang tepat atau terlewat.

[METODE]

[LEVEL_BAHASA]

Penjelasanku: [TEMPEL]`,
      },
      {
        title: "Drill Soal Sebab-Akibat",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 6 pertanyaan "mengapa/bagaimana" tentang [SEBUTKAN]. Tugasku: jelaskan sebab-akibatnya.
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
      },
    ],
    ujian: [
      {
        title: "Mock Ujian Sains Ma'had",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian.

Buatkan soal ujian Sains tingkat Ma'had untuk topik [SEBUTKAN]:
1. Campur: definisi, jelaskan proses, sebab-akibat.
2. 6-8 soal mudah ke sedang.
3. JANGAN beri jawaban. Tunggu jawabanku, koreksi & beri skor dengan bahasa mendukung.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Simulasi Tanya-Jawab Lisan Sains",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian lisan.

Berperanlah sebagai penguji ramah:
1. Tanya konsep atau minta aku jelaskan proses.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik membangun, naikkan kesulitan perlahan.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Kisi-kisi & Topik Prioritas Sains",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari topik yang kupelajari ([SEBUTKAN]): topik yang sering keluar, konsep yang perlu pendalaman, rencana H-7.

[METODE]

[LEVEL_BAHASA]`,
      },
    ],
  }
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
        title: "Pahami Grammar Inggris Sederhana",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar (program persiapan), [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan topik grammar [SEBUTKAN, mis. tenses, parts of speech] dengan sangat sederhana:
1. Aturan dasarnya, pakai bahasa Indonesia yang mudah.
2. Pola/rumus kalimat.
3. Contoh kalimat + terjemah.
4. Kesalahan umum & cara menghindarinya.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Pahami Kosakata lewat Konteks",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk tema [SEBUTKAN, mis. daily activities, school]:
1. Kosakata penting + arti + cara baca sederhana.
2. Contoh kalimat memakai tiap kata.
3. Tips mengingat kosakata lewat konteks.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Pahami Bacaan Inggris (Reading)",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Aku tempel teks Inggris di bawah. Bantu aku memahaminya:
1. Arti kata-kata sulit.
2. Terjemah & makna tiap kalimat.
3. Ide pokok bacaan.

[METODE]

[LEVEL_BAHASA]

Teks: [TEMPEL]`,
      },
    ],
    hafal: [
      {
        title: "Hafal Kosakata per Tema",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk tema [SEBUTKAN], buatkan daftar kosakata untuk dihafal:
1. Kata | arti | contoh kalimat.
2. Kelompokkan & beri tips menghafal.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Hafal Pola Tenses",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal pola tenses [SEBUTKAN, mis. present/past/future]:
1. Tabel: tense | rumus | contoh | kapan dipakai.
2. Mnemonic.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Jadwal Belajar Bahasa Inggris",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal belajar (grammar, kosakata, reading) + cara latihan. Tabel.

[METODE]

[LEVEL_BAHASA]`,
      },
    ],
    latihan: [
      {
        title: "Latihan Grammar (Aku Jawab, AI Koreksi)",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 8 soal grammar [SEBUTKAN TOPIK] (isi titik-titik / pilih bentuk benar).
1. JANGAN beri jawaban dulu.
2. Setelah aku jawab, koreksi + jelaskan aturannya.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Latihan Membuat Kalimat",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 6 kata/situasi. Tugasku: buat kalimat Inggris yang benar.
1. JANGAN beri contoh dulu.
2. Koreksi kalimatku + perbaiki grammar.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Latihan Reading Comprehension",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari teks yang kutempel (atau buatkan teks pendek sesuai level), beri pertanyaan pemahaman.
1. Beri 5 pertanyaan.
2. JANGAN beri jawaban dulu.
3. Koreksi jawabanku.

[METODE]

[LEVEL_BAHASA]

Teks (opsional): [TEMPEL]`,
      },
    ],
    ujian: [
      {
        title: "Mock Ujian Bahasa Inggris Ma'had",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian.

Buatkan soal ujian Bahasa Inggris tingkat Ma'had:
1. Campur: grammar, vocabulary, reading.
2. 6-8 soal mudah ke sedang.
3. JANGAN beri jawaban. Tunggu jawabanku, koreksi & beri skor.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Latihan Speaking/Writing Terbimbing",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu aku berlatih menulis/berbicara tentang [SEBUTKAN TEMA]:
1. Beri kerangka/poin.
2. Setelah aku tulis, koreksi grammar & beri masukan.
3. Tunjukkan ungkapan yang lebih natural.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Kisi-kisi & Strategi Ujian Inggris",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari yang kupelajari ([SEBUTKAN]): tipe soal yang sering keluar, topik grammar prioritas, rencana H-7.

[METODE]

[LEVEL_BAHASA]`,
      },
    ],
  }
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
        title: "Pahami Garis Besar Periode Sejarah",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar (tingkat Tsanawi), [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan garis besar periode [SEBUTKAN] dengan sederhana:
1. Rentang waktu & ciri utama periode itu.
2. Peristiwa & tokoh penting.
3. Timeline mudah diingat.
PENTING: sebut fakta yang kamu yakin; jika ragu, katakan.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Pahami Sebab-Akibat Peristiwa Sejarah",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk peristiwa [SEBUTKAN]:
1. Apa latar belakang/sebabnya.
2. Bagaimana peristiwa berlangsung (ringkas).
3. Apa dampak/akibatnya.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Pahami Peran Tokoh Sejarah",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk tokoh [SEBUTKAN]:
1. Siapa dia & perannya dalam sejarah.
2. Apa yang dilakukannya & dampaknya.
3. Pelajaran yang bisa diambil.
PENTING: kalau tidak yakin fakta, katakan; jangan mengarang.

[METODE]

[LEVEL_BAHASA]`,
      },
    ],
    hafal: [
      {
        title: "Hafal Kronologi Peristiwa",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk periode [SEBUTKAN], bantu hafal kronologi:
1. Timeline peristiwa + tahun.
2. Mnemonic untuk urutannya.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Tabel Tokoh & Peristiwa untuk Dihafal",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Buatkan tabel hafalan: peristiwa/tokoh | tahun | peran/dampak. Tandai yang sering jadi soal.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Jadwal Muraja'ah Sejarah",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Periode yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah + cara uji (sebut sebab-akibat). Tabel.

[METODE]

[LEVEL_BAHASA]`,
      },
    ],
    latihan: [
      {
        title: "Drill Kronologi & Tokoh",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal (urutan peristiwa, tokoh, tahun, sebab-akibat) dari periode [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Latihan Analisis Sebab-Akibat",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 5 peristiwa. Tugasku: jelaskan sebab & akibatnya.
1. JANGAN beri jawaban dulu.
2. Koreksi + tambahkan yang terlewat.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Latihan Esai Sejarah Singkat",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 1 topik esai sejarah. Aku tulis, lalu koreksi keakuratan fakta & logika + tunjukkan poin yang terlewat.

[METODE]

[LEVEL_BAHASA]`,
      },
    ],
    ujian: [
      {
        title: "Mock Ujian Sejarah Ma'had",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian.

Buatkan soal ujian Sejarah tingkat Ma'had untuk periode [SEBUTKAN]:
1. Campur: kronologi, tokoh, sebab-akibat.
2. 6-8 soal.
3. JANGAN beri jawaban. Tunggu jawabanku, koreksi & beri skor.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Simulasi Tanya-Jawab Lisan Sejarah",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian lisan.

Berperanlah sebagai penguji ramah:
1. Tanya peristiwa, tokoh, atau sebab-akibat.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik membangun, naikkan kesulitan perlahan.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Kisi-kisi & Topik Prioritas Sejarah",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari periode yang kupelajari ([SEBUTKAN]): topik yang sering jadi soal, cara jawab analitis (bukan hafal tanggal), rencana H-7.

[METODE]

[LEVEL_BAHASA]`,
      },
    ],
  }
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
        title: "Pahami Konsep Geografi Sederhana",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar (tingkat Tsanawi), [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan konsep [SEBUTKAN TOPIK, mis. iklim, bentuk muka bumi, peta] dengan sederhana:
1. Apa konsepnya, pakai contoh yang mudah dibayangkan.
2. Bagaimana terjadi/bekerja.
3. Contoh nyata di dunia/sekitar kita.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Pahami Peta & Lokasi",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu aku memahami peta & lokasi untuk topik [SEBUTKAN]:
1. Cara membaca peta (arah, skala, simbol).
2. Letak/posisi penting yang perlu diketahui.
3. Cara menghubungkan lokasi dengan fenomena geografi.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Pahami Hubungan Manusia & Lingkungan",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk topik [SEBUTKAN, mis. sumber daya alam, kependudukan]:
1. Bagaimana kondisi geografi memengaruhi kehidupan manusia.
2. Bagaimana manusia memengaruhi lingkungan.
3. Contoh nyata.

[METODE]

[LEVEL_BAHASA]`,
      },
    ],
    hafal: [
      {
        title: "Hafal Istilah & Konsep Geografi",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk topik [SEBUTKAN], bantu hafal istilah:
1. Tabel: istilah | definisi | contoh.
2. Mnemonic.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Hafal Data Geografi Penting",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk topik [SEBUTKAN, mis. benua, samudra, jenis iklim]:
1. Daftar data penting yang perlu dihafal.
2. Cara mengelompokkan agar mudah diingat.
PENTING: sebut data yang kamu yakin; jika ragu, katakan.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Jadwal Belajar Geografi",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Topik yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal belajar & muraja'ah + cara uji. Tabel.

[METODE]

[LEVEL_BAHASA]`,
      },
    ],
    latihan: [
      {
        title: "Drill Soal Konsep Geografi",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal (definisi, konsep, lokasi, sebab-akibat) dari topik [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Latihan Jelaskan Fenomena Geografi",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 5 fenomena geografi. Tugasku: jelaskan mengapa & bagaimana terjadi.
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Latihan Jelaskan dengan Kata Sendiri",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Aku akan menjelaskan konsep [SEBUTKAN] dengan kata-kataku (di bawah).
1. Koreksi pemahamanku.
2. Tunjukkan yang kurang tepat/terlewat.

[METODE]

[LEVEL_BAHASA]

Penjelasanku: [TEMPEL]`,
      },
    ],
    ujian: [
      {
        title: "Mock Ujian Geografi Ma'had",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian.

Buatkan soal ujian Geografi tingkat Ma'had untuk topik [SEBUTKAN]:
1. Campur: definisi, konsep, fenomena, lokasi.
2. 6-8 soal.
3. JANGAN beri jawaban. Tunggu jawabanku, koreksi & beri skor.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Simulasi Tanya-Jawab Lisan Geografi",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian lisan.

Berperanlah sebagai penguji ramah:
1. Tanya konsep, fenomena, atau lokasi.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik membangun, naikkan kesulitan perlahan.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Kisi-kisi & Topik Prioritas Geografi",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari topik yang kupelajari ([SEBUTKAN]): topik yang sering jadi soal, konsep yang perlu pendalaman, rencana H-7.

[METODE]

[LEVEL_BAHASA]`,
      },
    ],
  }
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
        title: "Pahami Apa Itu Mantiq (Pemula)",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar (tingkat Tsanawi), [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan dasar mantiq (logika) untuk pemula dengan bahasa mudah:
1. Apa itu mantiq & gunanya (menjaga akal dari salah berpikir).
2. Dua bagian: tashawwurat (konsep) & tashdiqat (penalaran) — sederhana.
3. Contoh berpikir logis sehari-hari.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Pahami Al-Kulliyat Al-Khams Sederhana",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan lima kulli (jins, naw', fashl, 'aradh 'amm, khashshah) untuk pemula:
1. Definisi sederhana tiap satu.
2. Contoh mudah (mis. manusia, hewan).
3. Cara membedakannya.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Pahami Qiyas (Silogisme) Dasar",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan qiyas untuk pemula:
1. Apa itu qiyas + dua premis & kesimpulan.
2. Contoh qiyas sederhana yang benar.
3. Cara menilai qiyas sahih atau tidak.

[METODE]

[LEVEL_BAHASA]`,
      },
    ],
    hafal: [
      {
        title: "Hafal Al-Kulliyat Al-Khams",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal lima kulli:
1. Tabel: kulli | definisi singkat | contoh.
2. Mnemonic.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Hafal Istilah Mantiq Dasar",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal istilah dasar (tashawwur, tashdiq, qiyas, muqaddimah, natijah) + arti sederhana + mnemonic.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Jadwal Muraja'ah Mantiq Ma'had",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah sederhana H+1, H+3, H+7, mingguan + cara uji. Tabel.

[METODE]

[LEVEL_BAHASA]`,
      },
    ],
    latihan: [
      {
        title: "Drill Susun Qiyas Sederhana",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku beberapa premis. Tugasku: susun jadi qiyas + tentukan kesimpulan.
1. JANGAN beri jawaban dulu.
2. Koreksi dengan penjelasan mudah.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Drill Klasifikasi Kulli",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 8 contoh kata. Tugasku: tentukan termasuk kulli apa.
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Drill Soal Mantiq Sederhana",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal sederhana (definisi, kulli, qiyas) dari bab [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
      },
    ],
    ujian: [
      {
        title: "Mock Imtihan Mantiq Ma'had",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian.

Buatkan soal ujian Mantiq tingkat Tsanawi untuk bab [SEBUTKAN]:
1. Tipe: definisi, klasifikasi kulli, susun qiyas.
2. 5-6 soal mudah ke sedang.
3. JANGAN beri jawaban. Tunggu jawabanku, koreksi & nilai dengan bahasa mendukung.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Simulasi Tanya-Jawab Lisan Mantiq",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian lisan.

Berperanlah sebagai penguji ramah:
1. Tanya definisi, kulli, atau minta susun qiyas sederhana.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik membangun, naikkan kesulitan perlahan.

[METODE]

[LEVEL_BAHASA]`,
      },
      {
        title: "Kisi-kisi & Strategi Ujian Ma'had",
        targetAI: "claude",
        template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab yang kupelajari ([SEBUTKAN]): yang sering jadi soal, cara jawab benar, prioritas belajar H-7.

[METODE]

[LEVEL_BAHASA]`,
      },
    ],
  }
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
