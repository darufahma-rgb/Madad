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
