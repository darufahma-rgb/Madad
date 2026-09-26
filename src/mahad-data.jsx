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
          title: "Pahami Dasar-Dasar Hadits",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan dasar-dasar hadits untuk pelajar Ma'had:
1. Ta'rif الْحَدِيثُ، السَّنَدُ، الْمَتْنُ، الرَّاوِي dengan harakat + arti, dan contoh sederhana bagian-bagian hadits.
2. Kedudukan sunnah dalam Islam dan kenapa kita mempelajarinya.
3. Pembagian hadits yang paling dasar (shahih, hasan, dha'if) dengan penjelasan mudah.
4. Tutup dengan 3 pertanyaan cepat. Tunggu jawabanku.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Satu Hadits dari Buku",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Aku tempel satu hadits dari buku muqarrar. Bantu aku memahaminya:
1. Syakl lengkap tanpa mengubah satu kata pun dari teks yang kutempel.
2. Siapa rawi a'la (sahabat) dan mukharrij-nya bila tertulis di buku.
3. Arti kata sulit (مَعَانِي الْمُفْرَدَاتِ) dan makna umum hadits.
4. Pelajaran yang diambil (مَا يُرْشِدُ إِلَيْهِ الْحَدِيثُ) dalam 3–5 poin.

Jangan melengkapi matan dari ingatan.

Hadits:
[TEMPEL HADITS]

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Hadits Arba'in yang Sedang Dipelajari",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Aku sedang mempelajari hadits nomor [SEBUTKAN NOMOR HADITS, mis. 1, 13, 40] dari Al-Arba'in An-Nawawiyyah.
1. Sebut tema hadits itu dan rawinya — hanya kalau kamu yakin. Kalau ragu, minta aku menempelkan teksnya.
2. Kalau teksnya kutempel, jelaskan arti kata sulit, makna umum, dan pelajarannya.
3. Satu contoh penerapan dalam kehidupan pelajar.

Teks hadits (opsional):
[TEMPEL HADITS]

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Cara Mengamalkan Hadits",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari hadits tentang [SEBUTKAN TEMA, mis. niat, jujur, menjaga lisan, berbakti kepada orang tua] yang ada di bukuku:
1. Pelajaran utamanya dalam bahasa sederhana.
2. Tiga cara nyata mengamalkannya di rumah, di kelas, dan di asrama.
3. Satu kebiasaan kecil yang bisa kulatih selama seminggu, dengan cara mengecek kemajuannya.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Matan Hadits dengan Paham",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Aku tempel hadits yang wajib kuhafal. Bantu aku:
1. Potong matan menjadi 3–4 bagian pendek dengan arti tiap bagian.
2. Cara menghafal: ulangi bagian demi bagian, lalu sambungkan.
3. Lalu uji aku: kamu beri awal bagian, aku lanjutkan. Satu per satu, tunggu jawabanku.

Jangan mengubah teks hadits yang kutempel.

Hadits:
[TEMPEL HADITS]

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kartu Hafalan Rawi, Arti Kata & Pelajaran",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari hadits-hadits yang kutempel (dari buku), buatkan kartu hafalan:
1. Satu kartu per hadits: awal matan | rawi a'la | 2–3 arti kata sulit | 2 pelajaran utama.
2. Hanya data yang ada di teks yang kutempel atau yang kamu yakini.
3. Lalu kuis 6 soal, satu per satu. Tunggu jawabanku.

Hadits-hadits:
[TEMPEL HADITS]

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Hadits Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Hadits yang harus kuhafal dan pahami: [SEBUTKAN JUMLAH & NOMOR HADITS, mis. 10 hadits, nomor 1–10]. Buatkan jadwal sampai ujian:
1. Hafalan baru maksimal 1–2 hadits per hari, sesuai panjang matan.
2. Muraja'ah H+1, H+3, H+7 untuk hadits yang sudah dihafal.
3. Cara menguji diri: setor hafalan, sebut rawi, dan satu pelajaran.

Format: tabel (hari | hafalan baru | muraja'ah | durasi).

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Jelaskan Makna Hadits (Aku Coba, AI Koreksi)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Aku menjelaskan makna satu hadits dengan kata-kataku sendiri (hadits dan penjelasanku di bawah). Koreksi dengan ramah:
1. Bagian yang sudah benar dan yang kurang.
2. Arti kata yang keliru.
3. Bahasa Arab tulisanku bila kutulis dalam Arab: maksimal 3 koreksi.
4. Contoh penjelasan yang lebih baik tapi tetap singkat.

Hadits dan penjelasanku:
[TEMPEL JAWABANKU]

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Arti Kata dalam Hadits",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari hadits-hadits yang kutempel (dari buku), buat drill kosakata seperti ujian Ma'had:
1. 6 soal "هَاتِ مَعْنَى مَا تَحْتَهُ خَطٌّ" untuk kata-kata sulit.
2. 3 soal "هَاتِ مُضَادَّ" atau "هَاتِ جَمْعَ / مُفْرَدَ".
3. JANGAN beri jawaban. Tunggu jawabanku, lalu koreksi.

Hadits-hadits:
[TEMPEL HADITS]

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Soal Gaya Ujian Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari hadits-hadits yang kutempel (dari buku), buat latihan seperti ujian Ma'had, soal dalam bahasa Arab berharakat + terjemah singkat:
1. "أَكْمِلِ الْحَدِيثَ" untuk 2 hadits.
2. "مَنْ رَاوِي الْحَدِيثِ؟" dan "مَا الْمَقْصُودُ بِـ ...؟".
3. "اُذْكُرْ مَا يُرْشِدُ إِلَيْهِ الْحَدِيثُ".
4. 3 pernyataan "ضَعْ عَلَامَةَ (✓) أَوْ (✗)".
5. JANGAN beri jawaban. Tunggu jawabanku, lalu koreksi.

Hadits-hadits:
[TEMPEL HADITS]

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Simulasi Ujian Tulis Hadits Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian.

Dari hadits-hadits muqarrar yang kutempel, buatkan satu lembar ujian dalam bahasa Arab berharakat + terjemah singkat:
1. Tiga السؤال dengan bobot درجة: "أَكْمِلِ الْحَدِيثَ" dan rawinya; arti kata dan makna; pelajaran dari hadits.
2. Matan hanya dari teks yang kutempel.
3. JANGAN beri jawaban. Tunggu jawabanku seluruhnya, lalu nilai dan jelaskan yang salah.

Hadits muqarrar:
[TEMPEL HADITS]

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Ujian Lisan Hadits",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian lisan.

Berperanlah sebagai guru penguji lisan untuk hadits-hadits yang kutempel:
1. Satu permintaan sekali jalan, dalam bahasa Arab sederhana: minta aku membaca satu hadits dari hafalan, menyebut rawinya, atau menjelaskan satu kata.
2. Tunggu jawabanku sebelum lanjut, lalu beri umpan balik singkat dan ramah.
3. Setelah 6 permintaan: nilai kesiapanku (dari 10) dan hadits yang perlu diulang.

Nilai hafalanku berdasarkan teks yang kutempel, bukan ingatanmu.

Hadits:
[TEMPEL HADITS]

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Tips Ujian Hadits Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Hadits yang diujikan: [SEBUTKAN JUMLAH & NOMOR HADITS]. Bantu aku bersiap:
1. Jenis soal yang mungkin keluar (melengkapi hadits, rawi, arti kata, pelajaran) dan satu contoh redaksi soal dalam bahasa Arab.
2. Cara membagi waktu antara menghafal ulang dan memahami.
3. Rencana 5 hari sebelum ujian.

Jangan mengklaim soal tertentu "pasti keluar".

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
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan dasar ilmu tauhid dengan sederhana:
1. Ta'rif عِلْمُ التَّوْحِيدِ, objeknya, dan kenapa ia ilmu paling mulia.
2. Tiga hukum akal: الْوَاجِبُ، الْمُسْتَحِيلُ، الْجَائِزُ — dengan contoh sehari-hari yang mudah.
3. Kewajiban pertama seorang mukallaf menurut ulama Ahlussunnah.
4. Tutup dengan 3 pertanyaan cepat. Tunggu jawabanku.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Sifat Wajib Allah secara Bertahap",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan sifat [SEBUTKAN SIFAT ATAU KELOMPOK SIFAT, mis. al-wujud, sifat salbiyyah, sifat ma'ani] sesuai manhaj Asy'ari-Maturidi yang diajarkan di Al-Azhar:
1. Arti sifat itu (Arab berharakat + arti) dan lawannya yang mustahil.
2. Dalil naqli pendek yang kamu yakini redaksinya, dan dalil 'aqli yang sederhana.
3. Contoh yang membantu memahami tanpa menyerupakan Allah dengan makhluk.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Iman kepada Malaikat, Kitab & Rasul",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan rukun iman [SEBUTKAN RUKUN, mis. malaikat, kitab-kitab, para rasul]:
1. Makna beriman kepadanya dan dalilnya — ayat hanya yang kamu yakini redaksinya.
2. Hal-hal yang wajib diketahui (mis. nama malaikat dan tugasnya, sifat wajib bagi rasul: الصِّدْقُ، الْأَمَانَةُ، التَّبْلِيغُ، الْفَطَانَةُ).
3. Buah iman itu dalam kehidupan sehari-hari pelajar.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Iman kepada Hari Akhir & Takdir",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan dengan bahasa yang menenangkan:
1. Peristiwa hari akhir secara berurutan (kematian, alam barzakh, kebangkitan, hisab, mizan, shirath, surga-neraka), dengan dalil yang kamu yakini.
2. Iman kepada qadha' dan qadar: maknanya, dan hubungannya dengan ikhtiar serta tawakkal.
3. Jawaban sederhana untuk pertanyaan remaja "kalau sudah ditakdirkan, kenapa aku harus berusaha?".

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Rukun Iman & Rukun Islam dengan Dalil",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Buatkan kartu hafalan:
1. Rukun iman dan rukun Islam dalam bahasa Arab berharakat + arti.
2. Dalil pokoknya (mis. hadits Jibril) — sebut sumbernya dan redaksinya hanya kalau kamu yakin; kalau tidak, minta aku menempel dari buku.
3. Lalu uji aku satu per satu. Tunggu jawabanku.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Hafal Sifat Wajib, Mustahil & Jaiz",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu aku menghafal sifat-sifat Allah dan para rasul secara bertahap:
1. Tabel: sifat wajib (Arab berharakat) | arti | lawannya (mustahil) | arti.
2. Bagi hafalan menjadi kelompok kecil (nafsiyyah, salbiyyah, ma'ani, ma'nawiyyah), lalu sifat jaiz.
3. Lalu uji aku: kamu sebut satu sifat, aku sebut lawannya. Satu per satu, tunggu jawabanku.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Tauhid Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang diujikan: [SEBUTKAN BAB-BAB]. Buatkan jadwal belajar sampai ujian:
1. Tiap sesi: 10 menit hafalan sifat, 15 menit memahami dalil dan contoh.
2. Jadwal ulang H+1, H+3, H+7.
3. Dua hari terakhir untuk soal gaya ujian.

Format: tabel (hari | bab | kegiatan | durasi).

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Drill Sifat & Lawannya",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Latih hafalanku tentang sifat Allah dan rasul:
1. Beri 8 soal campuran dalam bahasa Arab berharakat: "مَا ضِدُّ صِفَةِ ...؟" dan "اُذْكُرْ دَلِيلًا عَلَى صِفَةِ ...".
2. Satu soal sekali jalan. JANGAN beri jawaban. Tunggu jawabanku.
3. Koreksi dengan penjelasan singkat.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Soal Gaya Ujian Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab [SEBUTKAN BAB-BAB], buat latihan seperti ujian Ma'had, dalam bahasa Arab berharakat + terjemah singkat:
1. 3 soal "عَرِّفْ".
2. 3 soal "أَكْمِلْ".
3. 2 soal "اُذْكُرِ الدَّلِيلَ عَلَى ...".
4. 3 pernyataan "ضَعْ عَلَامَةَ (✓) أَوْ (✗)".
5. JANGAN beri jawaban. Tunggu jawabanku, lalu koreksi dengan penjelasan singkat.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Jelaskan Konsep Iman (Aku Coba, AI Koreksi)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Aku menjelaskan satu konsep akidah dengan kata-kataku sendiri (di bawah). Koreksi dengan ramah:
1. Bagian yang sudah benar dan yang kurang tepat menurut manhaj Ahlussunnah.
2. Dalil yang kupakai: tepat atau tidak.
3. Bahasa Arab tulisanku bila kutulis dalam Arab: maksimal 3 koreksi.
4. Contoh penjelasan yang lebih baik tapi tetap singkat.

Penjelasanku:
[TEMPEL JAWABANKU]

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Simulasi Ujian Tulis Tauhid Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian.

Buatkan satu lembar ujian dari bab [SEBUTKAN BAB-BAB], soal dalam bahasa Arab berharakat + terjemah singkat:
1. Tiga السؤال dengan bobot درجة: ta'rif dan hukum akal; sifat, lawannya, dan dalilnya; lalu ✓/✗ dan "أَكْمِلْ".
2. Dalil hanya yang kamu yakini redaksinya.
3. JANGAN beri jawaban. Tunggu jawabanku seluruhnya, lalu nilai dan jelaskan yang salah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Ujian Lisan Tauhid",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian lisan.

Berperanlah sebagai guru penguji lisan untuk bab [SEBUTKAN BAB-BAB]:
1. Satu pertanyaan sekali jalan, dalam bahasa Arab sederhana: sebutkan sifat, lawannya, artinya, atau dalilnya.
2. Tunggu jawabanku sebelum lanjut, lalu beri umpan balik singkat dan ramah.
3. Setelah 6 pertanyaan: nilai kesiapanku (dari 10) dan bagian yang perlu diulang.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Tips Ujian Tauhid Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang diujikan: [SEBUTKAN BAB-BAB]. Bantu aku bersiap:
1. Jenis soal yang mungkin keluar dan satu contoh redaksi soal dalam bahasa Arab.
2. Sifat, dalil, dan ta'rif yang wajib hafal.
3. Rencana 5 hari sebelum ujian.

Jangan mengklaim soal tertentu "pasti keluar".

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
          title: "Pahami Dasar Fiqh & Hukum Taklifi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan dasar fiqh dengan sederhana:
1. Ta'rif الْفِقْهُ dan sumber-sumbernya secara ringkas.
2. Hukum taklifi: الْوَاجِبُ، الْمَنْدُوبُ، الْمُبَاحُ، الْمَكْرُوهُ، الْحَرَامُ — arti dan contoh dari kehidupan pelajar.
3. Beda الرُّكْنُ dan الشَّرْطُ dengan contoh dari shalat.
4. Tutup dengan 3 pertanyaan cepat. Tunggu jawabanku.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Bab Thaharah secara Tuntas",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan bab thaharah sesuai buku sekolahku ([SEBUTKAN SUB-BAB, mis. air, najis, wudhu, mandi, tayammum]):
1. Ta'rif dan pembagiannya (Arab berharakat + arti).
2. Rukun atau fardhu, syarat, sunnah, dan pembatal — dalam tabel.
3. Dalil pokok yang kamu yakini redaksinya.
4. Contoh kasus sehari-hari di asrama atau sekolah.

Ikuti madzhab di profilku; kalau ada perbedaan madzhab yang penting, sebut singkat saja.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Bab Shalat secara Tuntas",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan bab shalat sesuai buku sekolahku ([SEBUTKAN SUB-BAB, mis. syarat, rukun, sunnah, pembatal, sujud sahwi, shalat jama'ah]):
1. Tabel: syarat wajib | syarat sah | rukun | sunnah | pembatal — Arab berharakat + arti.
2. Urutan rukun shalat dengan cara mudah menghafalnya.
3. Kesalahan shalat yang sering terjadi pada pelajar dan cara memperbaikinya.

Ikuti madzhab di profilku.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Bab Puasa & Zakat",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan bab [SEBUTKAN BAB, mis. puasa, zakat fitrah, zakat mal] sesuai buku sekolahku:
1. Ta'rif, hukum, dan dalilnya — dalil hanya yang kamu yakini.
2. Syarat, rukun, dan pembatal (untuk puasa) atau syarat, nishab, dan penerima (untuk zakat), dalam tabel.
3. Satu contoh kasus dengan perhitungan sederhana bila babnya zakat — periksa ulang hitunganmu.

Ikuti madzhab di profilku.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Rukun & Syarat Ibadah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk ibadah [SEBUTKAN IBADAH, mis. wudhu, shalat, puasa], buatkan kartu hafalan:
1. Daftar rukun dan syarat berharakat + arti, sesuai madzhab di profilku.
2. Cara menghafal urutannya (singkatan atau gerakan).
3. Lalu uji aku: kamu sebut nomor, aku sebut rukun atau syaratnya. Satu per satu, tunggu jawabanku.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Tabel Pembatal Ibadah untuk Dihafal",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Buatkan tabel hafalan pembatal:
1. Kolom: ibadah (wudhu, shalat, puasa) | pembatal (Arab berharakat) | arti | contoh kasus.
2. Sesuai madzhab di profilku.
3. Lalu kuis 6 soal: kamu beri kasus, aku tentukan batal atau tidak. Satu per satu, tunggu jawabanku.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Hafal Istilah Fiqh Dasar",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Buatkan daftar istilah fiqh yang harus kuhafal dari bab [SEBUTKAN BAB]:
1. Istilah Arab berharakat | arti | contoh pemakaian dalam kalimat.
2. Tandai istilah yang mirip dan mudah tertukar (mis. الْحَدَثُ وَالنَّجَسُ، الْفَرْضُ وَالسُّنَّةُ).
3. Lalu uji aku satu per satu. Tunggu jawabanku.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Fiqh Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang diujikan: [SEBUTKAN BAB-BAB]. Buatkan jadwal belajar sampai ujian:
1. Tiap sesi: 10 menit hafalan rukun dan syarat, 15 menit kasus sehari-hari.
2. Jadwal ulang H+1, H+3, H+7.
3. Dua hari terakhir untuk soal gaya ujian.

Format: tabel (hari | bab | kegiatan | durasi).

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Kasus Ibadah Sehari-hari",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 6 kasus ibadah sehari-hari dari bab [SEBUTKAN BAB] (mis. lupa rakaat, wudhu terkena najis, puasa lalu muntah).
1. Untuk tiap kasus aku menyebut hukumnya dan alasannya, dengan redaksi soal Arab "مَا حُكْمُ ...؟ مَعَ التَّعْلِيلِ".
2. Satu kasus sekali jalan. JANGAN beri jawaban. Tunggu jawabanku.
3. Koreksi sesuai madzhab di profilku.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Rukun, Syarat & Hukum",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab [SEBUTKAN BAB], buat drill campuran:
1. 4 soal: "هَلْ ... رُكْنٌ أَمْ شَرْطٌ أَمْ سُنَّةٌ؟".
2. 4 soal: tentukan hukum taklifi sebuah perbuatan (wajib, sunnah, mubah, makruh, haram).
3. Satu soal sekali jalan. JANGAN beri jawaban. Tunggu jawabanku, lalu koreksi.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Soal Gaya Ujian Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab [SEBUTKAN BAB-BAB], buat latihan seperti ujian Ma'had, dalam bahasa Arab berharakat + terjemah singkat:
1. 3 soal "عَرِّفْ".
2. 3 soal "اُذْكُرْ أَرْكَانَ / شُرُوطَ ...".
3. 2 soal "عَلِّلْ".
4. 3 pernyataan "ضَعْ عَلَامَةَ (✓) أَوْ (✗)".
5. JANGAN beri jawaban. Tunggu jawabanku, lalu koreksi dengan penjelasan singkat.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Simulasi Ujian Tulis Fiqh Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian.

Buatkan satu lembar ujian dari bab [SEBUTKAN BAB-BAB], soal dalam bahasa Arab berharakat + terjemah singkat:
1. Tiga السؤال dengan bobot درجة: ta'rif dan dalil; rukun, syarat, dan pembatal; lalu kasus "مَا حُكْمُ ...؟" dan ✓/✗.
2. Sesuai madzhab di profilku.
3. JANGAN beri jawaban. Tunggu jawabanku seluruhnya, lalu nilai dan jelaskan yang salah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Ujian Lisan Fiqh",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian lisan.

Berperanlah sebagai guru penguji lisan untuk bab [SEBUTKAN BAB-BAB]:
1. Satu pertanyaan sekali jalan, dalam bahasa Arab sederhana: rukun, syarat, pembatal, atau "bagaimana hukumnya kalau ...".
2. Tunggu jawabanku sebelum lanjut, lalu beri umpan balik singkat dan ramah.
3. Setelah 6 pertanyaan: nilai kesiapanku (dari 10) dan bab yang perlu diulang.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Tips Ujian Fiqh Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang diujikan: [SEBUTKAN BAB-BAB]. Bantu aku bersiap:
1. Jenis soal yang mungkin keluar dan satu contoh redaksi soal dalam bahasa Arab.
2. Rukun, syarat, dan dalil yang wajib hafal.
3. Rencana 5 hari sebelum ujian.

Jangan mengklaim soal tertentu "pasti keluar".

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
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan dasar nahwu untuk pemula:
1. Ta'rif الْكَلَامُ dan tiga jenis kata: الِاسْمُ، الْفِعْلُ، الْحَرْفُ — dengan tanda-tanda pengenalnya.
2. الْمُعْرَبُ وَالْمَبْنِيُّ dengan contoh.
3. Empat keadaan i'rab: رَفْعٌ، نَصْبٌ، جَرٌّ، جَزْمٌ — satu contoh kalimat untuk tiap keadaan.
4. Tutup dengan 3 pertanyaan cepat. Tunggu jawabanku.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Jumlah Ismiyyah & Fi'liyyah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan dua jenis kalimat Arab:
1. الْجُمْلَةُ الِاسْمِيَّةُ: الْمُبْتَدَأُ وَالْخَبَرُ, hukum i'rab, dan jenis khabar (mufrad, jumlah, syibh jumlah).
2. الْجُمْلَةُ الْفِعْلِيَّةُ: الْفِعْلُ وَالْفَاعِلُ وَالْمَفْعُولُ بِهِ, dan kesesuaian fi'il dengan fa'il.
3. Lima contoh kalimat berharakat yang dibedah bagiannya.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Tanda I'rab Asli & Pengganti",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan tanda-tanda i'rab:
1. Tanda asli (dhammah, fathah, kasrah, sukun).
2. Tanda pengganti untuk الْمُثَنَّى، جَمْعُ الْمُذَكَّرِ السَّالِمِ، جَمْعُ الْمُؤَنَّثِ السَّالِمِ، الْأَسْمَاءُ الْخَمْسَةُ، الْمَمْنُوعُ مِنَ الصَّرْفِ، الْأَفْعَالُ الْخَمْسَةُ.
3. Tabel ringkas: jenis kata | rafa' | nashab | jarr/jazm, dengan contoh.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Bab Nawasikh (Kana & Inna) dengan Mudah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan bab [SEBUTKAN BAB, mis. kana wa akhawatuha, inna wa akhawatuha, zhanna wa akhawatuha] dengan sederhana:
1. Apa yang berubah pada mubtada' dan khabar setelah nasikh masuk.
2. Daftar saudara-saudaranya dengan arti.
3. Lima contoh kalimat sebelum → sesudah nasikh, dengan i'rab singkat.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Tanda I'rab dengan Tabel",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Buatkan tabel hafalan tanda i'rab asli dan pengganti:
1. Kolom: jenis kata | rafa' | nashab | jarr | jazm | contoh.
2. Cara mudah mengingat.
3. Lalu uji aku: kamu sebut kata dan kedudukannya, aku sebut tandanya. 8 soal, satu per satu, tunggu jawabanku.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Hafal Huruf Jar, Nawashib & Jawazim",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu aku menghafal kelompok huruf yang beramal:
1. حُرُوفُ الْجَرِّ، نَوَاصِبُ الْمُضَارِعِ، جَوَازِمُ الْمُضَارِعِ — daftar berharakat + arti + satu contoh.
2. Cara mengingat tiap kelompok.
3. Lalu uji aku satu per satu. Tunggu jawabanku.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Hafal Kaidah Bab dengan Contoh",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk bab [SEBUTKAN BAB], buatkan ringkasan hafalan:
1. Kaidah inti dalam 3–5 kalimat pendek.
2. Satu contoh berharakat untuk tiap kaidah, dengan kata yang dimaksud ditandai.
3. Kalau aku menempelkan bait nazham dari buku (mis. Al-Ajurrumiyyah atau Alfiyah), jelaskan maksudnya tanpa mengubah teksnya.

Nazham (opsional):
[TEMPEL NAZHAM]

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Nahwu Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang diujikan: [SEBUTKAN BAB-BAB]. Buatkan jadwal belajar sampai ujian:
1. Tiap sesi: 10 menit kaidah, 20 menit i'rab kalimat.
2. Jadwal ulang H+1, H+3, H+7.
3. Dua hari terakhir untuk soal gaya ujian.

Format: tabel (hari | bab | kegiatan | durasi).

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan I'rab Kalimat Bertahap",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab [SEBUTKAN BAB], beri 6 kalimat berharakat untuk kui'rab (2 mudah, 2 sedang, 2 sulit), dengan instruksi "أَعْرِبْ مَا تَحْتَهُ خَطٌّ".
1. Satu kalimat sekali jalan. JANGAN beri jawaban. Tunggu i'rab-ku.
2. Koreksi kata per kata dan jelaskan kaidahnya dengan singkat.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Lengkapi Harakat Akhir",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 5 kalimat Arab tanpa harakat akhir dari bab [SEBUTKAN BAB], dengan instruksi "اِضْبِطْ أَوَاخِرَ الْكَلِمَاتِ".
1. Aku memberi harakat akhir tiap kata dan alasannya.
2. Satu kalimat sekali jalan. JANGAN beri jawaban. Tunggu jawabanku.
3. Koreksi dengan alasan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Soal Gaya Ujian Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab [SEBUTKAN BAB-BAB], buat latihan seperti ujian Ma'had, dalam bahasa Arab berharakat + terjemah singkat:
1. 3 soal "عَرِّفْ ... مَعَ التَّمْثِيلِ".
2. 3 soal "أَعْرِبْ مَا تَحْتَهُ خَطٌّ".
3. 2 soal "اِسْتَخْرِجْ مِنَ الْجُمَلِ الْآتِيَةِ ...".
4. 2 soal "صَوِّبِ الْخَطَأَ".
5. JANGAN beri jawaban. Tunggu jawabanku, lalu koreksi dengan penjelasan singkat.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Simulasi Ujian Tulis Nahwu Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian.

Buatkan satu lembar ujian dari bab [SEBUTKAN BAB-BAB], soal dalam bahasa Arab berharakat + terjemah singkat:
1. Tiga السؤال dengan bobot درجة: ta'rif dan contoh; "أَعْرِبْ" dan "اِسْتَخْرِجْ"; lalu "اِضْبِطْ" dan "صَوِّبِ الْخَطَأَ".
2. Periksa ulang kunci i'rab-mu sebelum memberikan soal.
3. JANGAN beri jawaban. Tunggu jawabanku seluruhnya, lalu nilai dan jelaskan yang salah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Ujian Lisan Nahwu",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian lisan.

Berperanlah sebagai guru penguji lisan untuk bab [SEBUTKAN BAB-BAB]:
1. Satu pertanyaan sekali jalan, dalam bahasa Arab sederhana: ta'rif, contoh, atau i'rab satu kata dalam kalimat pendek.
2. Tunggu jawabanku sebelum lanjut, lalu beri umpan balik singkat dan ramah.
3. Setelah 6 pertanyaan: nilai kesiapanku (dari 10) dan bab yang perlu diulang.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Tips Ujian Nahwu Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang diujikan: [SEBUTKAN BAB-BAB]. Bantu aku bersiap:
1. Jenis soal yang mungkin keluar dan satu contoh redaksi soal dalam bahasa Arab.
2. Kaidah dan contoh yang wajib hafal, serta kesalahan i'rab yang paling sering terjadi.
3. Rencana 5 hari sebelum ujian.

Jangan mengklaim soal tertentu "pasti keluar".

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
          title: "Pahami Dasar Sharaf dengan Bahasa Sederhana",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan dasar ilmu sharaf untuk pemula:
1. Ta'rif عِلْمُ الصَّرْفِ dan bedanya dengan nahwu (bentuk kata vs kedudukan kata).
2. Huruf asli dan huruf tambahan, dan cara menemukan akar kata (الْجَذْرُ) dengan timbangan فَعَلَ.
3. الْمُجَرَّدُ وَالْمَزِيدُ dengan contoh.
4. Tutup dengan 3 pertanyaan cepat. Tunggu jawabanku.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Tashrif Istilahi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan التَّصْرِيفُ الِاصْطِلَاحِيُّ dengan kata [SEBUTKAN KATA DASAR, mis. نَصَرَ، ضَرَبَ، كَتَبَ]:
1. Urutan bentuknya: fi'il madhi, mudhari', mashdar, isim fa'il, isim maf'ul, fi'il amr, fi'il nahi, isim zaman/makan, isim alat.
2. Arti tiap bentuk dan satu contoh kalimat pendek.
3. Kesalahan yang sering terjadi saat mentashrif.

Periksa ulang setiap bentuk sebelum menulis.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Wazan Tsulatsi Mazid",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan wazan-wazan fi'il tsulatsi mazid yang ada di bukuku ([SEBUTKAN WAZAN, mis. أَفْعَلَ، فَعَّلَ، فَاعَلَ، تَفَعَّلَ، اِسْتَفْعَلَ]):
1. Untuk tiap wazan: bentuk madhi dan mudhari', huruf tambahannya, dan faedah makna yang paling umum.
2. Dua contoh kata nyata untuk tiap wazan, dengan arti.
3. Tabel ringkas yang bisa kusalin.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Tashrif Istilahi Berirama",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu aku menghafal tashrif istilahi seperti cara di pesantren (dilagukan):
1. Tulis tashrif lengkap kata [SEBUTKAN KATA DASAR] dalam satu baris yang bisa dilagukan, berharakat.
2. Beri dua kata lain dengan wazan yang sama untuk latihan.
3. Lalu uji aku: kamu beri kata dasar baru, aku tuliskan tashrif-nya. Satu per satu, tunggu jawabanku.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Hafal Pola Wazan & Faedahnya",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Buatkan kartu hafalan wazan di muqarrar-ku:
1. Tabel: wazan | madhi | mudhari' | mashdar | faedah makna | contoh.
2. Cara mudah mengingat huruf tambahan tiap wazan.
3. Lalu kuis 8 soal: kamu beri kata, aku sebut wazannya. Satu per satu, tunggu jawabanku.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Sharaf Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang diujikan: [SEBUTKAN BAB-BAB]. Buatkan jadwal belajar sampai ujian:
1. Tiap sesi: 10 menit melagukan tashrif, 15 menit menentukan wazan dan akar kata.
2. Jadwal ulang H+1, H+3, H+7.
3. Dua hari terakhir untuk soal gaya ujian.

Format: tabel (hari | bab | kegiatan | durasi).

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Tashrif dari Akar Kata",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 5 kata dasar (tsulatsi mujarrad dan mazid) dari bab [SEBUTKAN BAB].
1. Untuk tiap kata aku menuliskan mudhari', mashdar, isim fa'il, isim maf'ul, dan amr — dengan instruksi "صَرِّفِ الْأَفْعَالَ الْآتِيَةَ".
2. Satu kata sekali jalan. JANGAN beri jawaban. Tunggu jawabanku.
3. Koreksi bentuk yang salah dan jelaskan polanya.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Tentukan Akar & Wazan",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 8 kata berimbuhan (mis. مُسْتَغْفِرٌ، تَعَلَّمَ، مَكْتَبَةٌ) dengan instruksi "زِنِ الْكَلِمَاتِ الْآتِيَةَ وَبَيِّنْ جَذْرَهَا".
1. Untuk tiap kata aku menyebut akar, wazan, dan jenis katanya.
2. Satu kata sekali jalan. JANGAN beri jawaban. Tunggu jawabanku.
3. Koreksi dengan alasan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Soal Gaya Ujian Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab [SEBUTKAN BAB-BAB], buat latihan seperti ujian Ma'had, dalam bahasa Arab berharakat + terjemah singkat:
1. 3 soal "عَرِّفْ ... مَعَ التَّمْثِيلِ".
2. 3 soal "هَاتِ الْمُضَارِعَ / الْمَصْدَرَ / اسْمَ الْفَاعِلِ مِنْ ...".
3. 2 soal "زِنْ".
4. 2 pernyataan "ضَعْ عَلَامَةَ (✓) أَوْ (✗)".
5. JANGAN beri jawaban. Tunggu jawabanku, lalu koreksi dengan penjelasan singkat.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Simulasi Ujian Tulis Sharaf Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian.

Buatkan satu lembar ujian dari bab [SEBUTKAN BAB-BAB], soal dalam bahasa Arab berharakat + terjemah singkat:
1. Tiga السؤال dengan bobot درجة: ta'rif dan contoh; tashrif dan "هَاتِ ... مِنْ"; lalu "زِنْ" dan ✓/✗.
2. Periksa ulang semua bentuk kata di kunci jawabanmu sebelum memberikan soal.
3. JANGAN beri jawaban. Tunggu jawabanku seluruhnya, lalu nilai dan jelaskan yang salah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Ujian Lisan Sharaf",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian lisan.

Berperanlah sebagai guru penguji lisan untuk bab [SEBUTKAN BAB-BAB]:
1. Satu permintaan sekali jalan, dalam bahasa Arab sederhana: lagukan tashrif sebuah kata, sebut wazan, atau sebut bentuk tertentu.
2. Tunggu jawabanku sebelum lanjut, lalu beri umpan balik singkat dan ramah.
3. Setelah 6 permintaan: nilai kesiapanku (dari 10) dan bab yang perlu diulang.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Tips Ujian Sharaf Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang diujikan: [SEBUTKAN BAB-BAB]. Bantu aku bersiap:
1. Jenis soal yang mungkin keluar dan satu contoh redaksi soal dalam bahasa Arab.
2. Wazan dan pola tashrif yang wajib hafal.
3. Rencana 5 hari sebelum ujian.

Jangan mengklaim soal tertentu "pasti keluar".

[METODE]

[LEVEL_BAHASA]`,
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
          title: "Pahami Balaghah untuk Pemula",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Kenalkan aku pada balaghah dengan sederhana:
1. Ta'rif الْبَلَاغَةُ dan الْفَصَاحَةُ, dan bedanya.
2. Tiga cabangnya: عِلْمُ الْمَعَانِي، عِلْمُ الْبَيَانِ، عِلْمُ الْبَدِيعِ — satu kalimat penjelasan dan satu contoh untuk tiap cabang.
3. Kenapa balaghah penting untuk memahami Al-Qur'an.
4. Tutup dengan 3 pertanyaan cepat. Tunggu jawabanku.

Contoh ayat hanya yang kamu yakini redaksinya.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Tasybih: Rukun & Jenisnya",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan التَّشْبِيهُ seperti di buku Ma'had:
1. Empat rukunnya: الْمُشَبَّهُ، الْمُشَبَّهُ بِهِ، أَدَاةُ التَّشْبِيهِ، وَجْهُ الشَّبَهِ — dengan satu contoh kalimat yang dibedah.
2. Jenis-jenisnya: مُرْسَلٌ، مُؤَكَّدٌ، مُجْمَلٌ، مُفَصَّلٌ، بَلِيغٌ — ta'rif singkat dan contoh.
3. Cara cepat menentukan jenis tasybih dari rukun yang ada atau dibuang.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Isti'arah, Majaz & Kinayah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan dengan contoh sederhana:
1. الْحَقِيقَةُ وَالْمَجَازُ: bedanya.
2. الِاسْتِعَارَةُ: hubungannya dengan tasybih, lalu تَصْرِيحِيَّةٌ dan مَكْنِيَّةٌ dengan cara membedakannya.
3. الْكِنَايَةُ: ta'rif dan contoh.
4. Tabel ringkas: gaya bahasa | ciri | contoh.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Peta Hafalan Cabang Balaghah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Buatkan peta hafalan balaghah sesuai muqarrar-ku ([SEBUTKAN BAB-BAB, mis. tasybih, isti'arah, kinayah, jinas, thibaq]):
1. Bagan: cabang → bab → jenis.
2. Ta'rif singkat tiap istilah (Arab berharakat + arti).
3. Satu contoh pendek untuk tiap jenis.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kartu Hafalan Istilah & Contoh",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk bab [SEBUTKAN BAB], buatkan kartu hafalan:
1. Tabel: istilah Arab berharakat | ta'rif | contoh | cara mengenalinya.
2. Lalu uji aku 8 soal: kamu beri contoh kalimat, aku sebut istilahnya. Satu per satu, tunggu jawabanku.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Balaghah Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang diujikan: [SEBUTKAN BAB-BAB]. Buatkan jadwal belajar sampai ujian:
1. Tiap sesi: 10 menit ta'rif, 20 menit mengenali gaya bahasa dalam contoh.
2. Jadwal ulang H+1, H+3, H+7.
3. Dua hari terakhir untuk soal gaya ujian.

Format: tabel (hari | bab | kegiatan | durasi).

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Drill Kenali Gaya Bahasa",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Latih aku mengenali gaya bahasa dari bab [SEBUTKAN BAB-BAB]:
1. Beri 8 kalimat Arab pendek berharakat (buatanmu atau ungkapan umum yang kamu yakini).
2. Untuk tiap kalimat aku menyebut gaya bahasanya dan alasannya.
3. Satu kalimat sekali jalan. JANGAN beri jawaban. Tunggu jawabanku, lalu koreksi.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Bedah Rukun Tasybih",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Buat 6 kalimat tasybih berharakat dengan bentuk berbeda.
1. Untuk tiap kalimat aku menyebut empat rukunnya (mana yang ada, mana yang dibuang) dan jenis tasybih-nya, dengan redaksi "بَيِّنْ أَرْكَانَ التَّشْبِيهِ وَنَوْعَهُ".
2. Satu kalimat sekali jalan. JANGAN beri jawaban. Tunggu jawabanku.
3. Koreksi dengan alasan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Soal Gaya Ujian Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab [SEBUTKAN BAB-BAB], buat latihan seperti ujian Ma'had, dalam bahasa Arab berharakat + terjemah singkat:
1. 3 soal "عَرِّفْ ... مَعَ التَّمْثِيلِ".
2. 3 soal "وَضِّحِ الصُّورَةَ الْبَيَانِيَّةَ فِيمَا يَأْتِي".
3. 3 soal "مَثِّلْ لِـ ...".
4. 3 pernyataan "ضَعْ عَلَامَةَ (✓) أَوْ (✗)".
5. JANGAN beri jawaban. Tunggu jawabanku, lalu koreksi dengan penjelasan singkat.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Simulasi Ujian Tulis Balaghah Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian.

Buatkan satu lembar ujian dari bab [SEBUTKAN BAB-BAB], soal dalam bahasa Arab berharakat + terjemah singkat:
1. Tiga السؤال dengan bobot درجة: ta'rif dan contoh; "وَضِّحِ الصُّورَةَ" dan "بَيِّنْ نَوْعَ التَّشْبِيهِ"; lalu ✓/✗ dan "مَثِّلْ".
2. Contoh ayat atau syair hanya yang kamu yakini redaksinya.
3. JANGAN beri jawaban. Tunggu jawabanku seluruhnya, lalu nilai dan jelaskan yang salah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Ujian Lisan Balaghah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian lisan.

Berperanlah sebagai guru penguji lisan untuk bab [SEBUTKAN BAB-BAB]:
1. Satu pertanyaan sekali jalan, dalam bahasa Arab sederhana: ta'rif, contoh, atau "apa gaya bahasa dalam kalimat ini?".
2. Tunggu jawabanku sebelum lanjut, lalu beri umpan balik singkat dan ramah.
3. Setelah 6 pertanyaan: nilai kesiapanku (dari 10) dan bab yang perlu diulang.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Tips Ujian Balaghah Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang diujikan: [SEBUTKAN BAB-BAB]. Bantu aku bersiap:
1. Jenis soal yang mungkin keluar dan satu contoh redaksi soal dalam bahasa Arab.
2. Cara cepat membedakan tasybih, isti'arah, dan kinayah di lembar ujian.
3. Rencana 5 hari sebelum ujian.

Jangan mengklaim soal tertentu "pasti keluar".

[METODE]

[LEVEL_BAHASA]`,
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
          title: "Pahami Dasar Menulis Arab (Insya')",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Ajari aku dasar insya':
1. Beda الْإِنْشَاءُ الْوَظِيفِيُّ (surat, pengumuman, ringkasan) dan الْإِنْشَاءُ الْإِبْدَاعِيُّ (karangan bebas, cerita).
2. Syarat kalimat Arab yang benar: susunan jumlah ismiyyah dan fi'liyyah, kesesuaian (mudzakkar-muannats, mufrad-jamak), dan tanda baca.
3. Kesalahan paling umum pelajar Indonesia saat menulis Arab (terjemahan kata per kata, salah pakai huruf jar), dengan contoh salah → benar.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Struktur Karangan Arab",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan susunan karangan Arab untuk tema [SEBUTKAN TEMA, mis. keutamaan ilmu, kebersihan, persahabatan, liburan]:
1. الْمُقَدِّمَةُ، الْعَرْضُ، الْخَاتِمَةُ — fungsi tiap bagian dan panjang yang wajar.
2. Kerangka poin (عَنَاصِرُ الْمَوْضُوعِ) untuk tema itu. JANGAN tulis karangannya.
3. Ungkapan pembuka dan penutup yang bisa kupakai, dengan harakat + arti.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Kosakata & Ungkapan per Tema",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk tema [SEBUTKAN TEMA], siapkan bekal menulis:
1. 15 kosakata inti berharakat + arti, dikelompokkan (kata benda, kerja, sifat).
2. 5 ungkapan siap pakai (تَعْبِيرَاتٌ جَاهِزَةٌ) dengan contoh kalimat.
3. Satu ayat atau hadits pendek yang cocok dijadikan syahid — hanya yang kamu yakini redaksinya.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Kata Penghubung (Rawabith)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Buatkan daftar الرَّوَابِطُ yang paling berguna untuk karangan:
1. Kelompokkan: menambah (وَ، كَذَلِكَ، بِالْإِضَافَةِ إِلَى)، sebab-akibat (لِأَنَّ، لِذَلِكَ)، pertentangan (لَكِنَّ، وَمَعَ ذَلِكَ)، urutan (أَوَّلًا، ثُمَّ، أَخِيرًا)، penutup (وَخُلَاصَةُ الْقَوْلِ).
2. Satu contoh kalimat untuk tiap kata.
3. Lalu uji aku: kamu beri dua kalimat, aku sambungkan dengan rabith yang tepat. Satu per satu, tunggu jawabanku.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Hafal Kosakata Tema Ujian",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Tema-tema yang sering keluar di ujian insya' sekolahku: [SEBUTKAN TEMA-TEMA]. Buatkan kartu hafalan:
1. Untuk tiap tema: 8 kosakata inti dan 2 ungkapan, berharakat + arti.
2. Cara menghafal: buat satu kalimat yang memakai beberapa kata sekaligus.
3. Lalu kuis 8 soal, satu per satu. Tunggu jawabanku.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Latihan Menulis",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Ujian insya'-ku [SEBUTKAN WAKTU, mis. 3 minggu lagi]. Buatkan jadwal latihan:
1. Tiap hari: 10 menit kosakata dan rawabith, 20 menit menulis satu paragraf.
2. Tiap minggu: satu karangan lengkap untuk dikoreksi.
3. Catatan kesalahan pribadi yang diulang tiap minggu.

Format: tabel (hari | tema | kegiatan | durasi).

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Menulis Paragraf (Aku Coba, AI Koreksi)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Aku menulis paragraf atau karangan dalam bahasa Arab (di bawah). Koreksi seperti guru insya':
1. Kesalahan nahwu dan sharaf, imla', serta pilihan kata — tunjukkan yang salah → yang benar, maksimal 10 yang terpenting.
2. Susunan: muqaddimah, 'ardh, khatimah, dan penggunaan rawabith.
3. Nilai dari 10 dengan alasan singkat.
4. Jangan menulis ulang seluruh karanganku; cukup koreksi dan beri 2–3 kalimat contoh perbaikan.

Tulisanku:
[TEMPEL TULISANKU]

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Susun Kalimat dari Kosakata",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Latih aku membuat kalimat:
1. Beri 6 soal "ضَعْ كُلَّ كَلِمَةٍ مِمَّا يَأْتِي فِي جُمْلَةٍ مُفِيدَةٍ" untuk tema [SEBUTKAN TEMA].
2. Satu soal sekali jalan. JANGAN beri contoh kalimat dulu. Tunggu jawabanku.
3. Koreksi kalimatku dan jelaskan kesalahannya bila ada.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Perbaiki Kalimat Salah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 8 kalimat Arab berharakat yang mengandung kesalahan umum pelajar (kesesuaian, huruf jar, i'rab, imla').
1. Soal: "صَوِّبِ الْخَطَأَ فِي الْجُمَلِ الْآتِيَةِ".
2. Satu kalimat sekali jalan. JANGAN tunjukkan letak kesalahannya. Tunggu jawabanku.
3. Koreksi dan jelaskan kaidahnya dengan singkat.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Simulasi Ujian Insya' Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian.

Buatkan satu lembar ujian insya' seperti di Ma'had, dalam bahasa Arab berharakat + terjemah singkat:
1. Soal "ضَعْ فِي جُمْلَةٍ مُفِيدَةٍ" dan "صَوِّبِ الْخَطَأَ".
2. Satu soal karangan: "اُكْتُبْ مَوْضُوعًا فِي حُدُودِ ... سَطْرًا عَنْ ..." dengan 2–3 tema pilihan.
3. JANGAN beri contoh jawaban. Tunggu tulisanku, lalu nilai per bagian (isi, susunan, bahasa) dengan bobot درجة.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Menulis Terbimbing Sebelum Ujian",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian.

Bimbing aku menulis satu karangan tentang [SEBUTKAN TEMA] secara bertahap, seperti soal ujian "اُكْتُبْ مَوْضُوعًا تَعْبِيرِيًّا عَنْ ...":
1. Minta aku menulis 3–4 poin kerangka dulu. Tunggu jawabanku, lalu beri masukan.
2. Minta aku menulis muqaddimah. Tunggu, lalu koreksi.
3. Lanjutkan untuk 'ardh dan khatimah dengan cara yang sama.
4. Di akhir, beri nilai dan tiga pelajaran untuk ujian nanti.

JANGAN menuliskan bagian mana pun untukku.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Tips Ujian Insya'",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu aku bersiap ujian insya':
1. Jenis soal yang biasa keluar dan satu contoh redaksi soal dalam bahasa Arab.
2. Strategi di ruang ujian: membuat kerangka 3 menit, mengatur panjang tulisan, dan mengecek ulang kesalahan umum.
3. Rencana 5 hari sebelum ujian.

Jangan mengklaim tema tertentu "pasti keluar".

[METODE]

[LEVEL_BAHASA]`,
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
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Buatkan garis besar periode [SEBUTKAN PERIODE, mis. Khulafa' Rasyidin, Daulah Umawiyah, Daulah 'Abbasiyah, Mesir modern]:
1. Awal dan akhir periode, dan ibu kota atau pusatnya.
2. Tokoh-tokoh utama dan peran singkatnya.
3. Peristiwa penting berurutan dalam garis waktu.
4. Istilah Arab berharakat + artinya (buku Ma'had memakai bahasa Arab).

Tahun, nama, dan peristiwa hanya yang kamu yakini.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Sebab-Akibat Peristiwa Sejarah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk peristiwa [SEBUTKAN PERISTIWA]:
1. Sebab-sebabnya (الْأَسْبَابُ): langsung dan tidak langsung.
2. Jalannya peristiwa secara singkat.
3. Akibat-akibatnya (النَّتَائِجُ) jangka pendek dan panjang.
4. Kerangka jawaban soal "اُذْكُرْ أَسْبَابَ ... وَنَتَائِجَهُ" dalam bahasa Arab sederhana.

Fakta hanya yang kamu yakini.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Peran Seorang Tokoh",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Ceritakan tokoh [SEBUTKAN TOKOH, mis. 'Umar bin Al-Khaththab, 'Umar bin 'Abd Al-'Aziz, Shalahuddin Al-Ayyubi]:
1. Latar singkat dan masa hidupnya.
2. Tiga peran atau karya terpentingnya.
3. Sifat yang bisa diteladani, dengan contoh peristiwa.
4. Kerangka jawaban soal "تَرْجِمْ لِـ ..." dalam poin.

Hanya fakta yang kamu yakini.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Garis Waktu untuk Dihafal",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk periode [SEBUTKAN PERIODE], buatkan garis waktu hafalan:
1. Tabel: tahun (H/M) | peristiwa | tokoh — hanya yang kamu yakini; kosongkan dan tandai "cek" kalau ragu.
2. Cara mengingat urutan (cerita singkat atau pengelompokan).
3. Lalu kuis: kamu sebut peristiwa, aku sebut tahun dan tokohnya. Satu per satu, tunggu jawabanku.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Tabel Tokoh & Karya untuk Dihafal",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Tokoh di bab [SEBUTKAN BAB]: buatkan tabel hafalan:
1. Kolom: tokoh (Arab berharakat) | periode | jabatan atau gelar | karya atau peran utama.
2. Hanya data yang kamu yakini.
3. Lalu kuis 6 soal "مَنْ ...؟". Satu per satu, tunggu jawabanku.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Sejarah Tsanawi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang diujikan: [SEBUTKAN BAB-BAB]. Buatkan jadwal belajar sampai ujian:
1. Tiap sesi: menyusun ulang garis waktu dari ingatan, lalu satu soal sebab-akibat.
2. Jadwal ulang H+1, H+3, H+7.
3. Dua hari terakhir untuk soal gaya ujian.

Format: tabel (hari | bab | kegiatan | durasi).

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Drill Kronologi & Tokoh",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari periode [SEBUTKAN PERIODE], buat drill dengan redaksi Arab berharakat + terjemah singkat:
1. 3 soal "رَتِّبِ الْأَحْدَاثَ الْآتِيَةَ تَرْتِيبًا زَمَنِيًّا".
2. 4 soal "مَنْ ...؟" atau "مَتَى ...؟".
3. JANGAN beri jawaban. Tunggu jawabanku, lalu koreksi.

Hanya fakta yang kamu yakini.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Analisis Sebab-Akibat (Aku Coba, AI Koreksi)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Aku menulis sebab dan akibat satu peristiwa (soal dan jawabanku di bawah). Koreksi dengan ramah:
1. Sebab dan akibat yang sudah tepat, yang kurang, dan yang tertukar.
2. Fakta yang perlu kucek.
3. Bahasa Arab tulisanku bila kutulis dalam Arab: maksimal 3 koreksi.
4. Contoh jawaban yang lebih baik tapi tetap singkat.

Soal dan jawabanku:
[TEMPEL JAWABANKU]

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Soal Gaya Ujian Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab [SEBUTKAN BAB-BAB], buat latihan seperti ujian Ma'had, dalam bahasa Arab berharakat + terjemah singkat:
1. 4 soal "اِخْتَرِ الْإِجَابَةَ الصَّحِيحَةَ".
2. 3 soal "أَكْمِلْ".
3. 2 soal "عَلِّلْ".
4. 3 pernyataan "ضَعْ عَلَامَةَ (✓) أَوْ (✗)".
5. JANGAN beri jawaban. Tunggu jawabanku, lalu koreksi dengan penjelasan singkat.

Hanya buat soal yang jawabannya kamu yakini.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Simulasi Ujian Sejarah Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian.

Buatkan satu lembar ujian dari bab [SEBUTKAN BAB-BAB], soal dalam bahasa Arab berharakat + terjemah singkat:
1. Tiga السؤال dengan bobot درجة: pilihan ganda dan isian; "اُذْكُرْ أَسْبَابَ ... وَنَتَائِجَهُ" dan "عَلِّلْ"; lalu "تَرْجِمْ لِـ ..." atau urutan peristiwa.
2. Hanya fakta yang kamu yakini.
3. JANGAN beri jawaban. Tunggu jawabanku seluruhnya, lalu nilai dan jelaskan yang salah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Ujian Lisan Sejarah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian lisan.

Berperanlah sebagai guru penguji lisan untuk bab [SEBUTKAN BAB-BAB]:
1. Satu pertanyaan sekali jalan, dalam bahasa Arab sederhana: tokoh, peristiwa, sebab, atau akibat.
2. Tunggu jawabanku sebelum lanjut, lalu beri umpan balik singkat dan ramah.
3. Setelah 6 pertanyaan: nilai kesiapanku (dari 10) dan bab yang perlu diulang.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Tips Ujian Sejarah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang diujikan: [SEBUTKAN BAB-BAB]. Bantu aku bersiap:
1. Jenis soal yang mungkin keluar dan satu contoh redaksi soal dalam bahasa Arab.
2. Tahun, tokoh, dan istilah yang wajib hafal.
3. Rencana 5 hari sebelum ujian.

Jangan mengklaim soal tertentu "pasti keluar".

[METODE]

[LEVEL_BAHASA]`,
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
          title: "Pahami Satu Bab Geografi dengan Sederhana",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan bab [SEBUTKAN BAB, mis. iklim, bentuk muka bumi, sumber daya, penduduk, kawasan dunia Arab] dengan sederhana:
1. Istilah kunci dalam bahasa Arab berharakat + artinya, mis. الْمُنَاخُ، التَّضَارِيسُ، الْمَوَارِدُ، السُّكَّانُ.
2. Konsep inti dengan contoh dari Mesir atau Indonesia.
3. Hubungan sebab-akibat dalam bentuk panah (mis. letak → iklim → pertanian).
4. Tutup dengan 3 pertanyaan cepat. Tunggu jawabanku.

Angka hanya sebagai perkiraan dengan tahunnya; jangan mengarang.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Membaca Peta & Menentukan Lokasi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Ajari aku keterampilan peta:
1. Arah mata angin, garis lintang dan bujur, serta skala — istilah Arab + artinya.
2. Cara menentukan letak astronomis dan letak geografis suatu negara, dengan contoh Mesir.
3. Latihan: aku menggambar peta sederhana [SEBUTKAN WILAYAH, mis. Mesir, Jazirah Arab] dan kamu memberi daftar hal yang harus ada di dalamnya.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Manusia & Lingkungan",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan hubungan manusia dan lingkungan di bab [SEBUTKAN BAB]:
1. Pengaruh lingkungan terhadap cara hidup manusia (tempat tinggal, pekerjaan, makanan).
2. Pengaruh manusia terhadap lingkungan: manfaat dan kerusakan.
3. Tuntunan Islam menjaga bumi, dengan dalil pendek yang kamu yakini.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Kartu Hafalan Istilah Geografi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk bab [SEBUTKAN BAB], buatkan kartu hafalan:
1. Tabel: istilah Arab berharakat | arti | penjelasan satu kalimat | contoh tempat.
2. Cara mudah mengingat.
3. Lalu uji aku 8 soal, satu per satu. Tunggu jawabanku.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Tabel Data Wilayah untuk Dihafal",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk wilayah [SEBUTKAN WILAYAH], buatkan tabel hafalan:
1. Kolom: negara atau kawasan | ibu kota | ciri alam | sumber daya utama.
2. Angka hanya sebagai perkiraan dengan tahunnya, dan hanya yang kamu yakini; kosongkan dan tandai "cek" kalau ragu.
3. Lalu kuis 6 soal, satu per satu. Tunggu jawabanku.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Geografi Tsanawi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang diujikan: [SEBUTKAN BAB-BAB]. Buatkan jadwal belajar sampai ujian:
1. Tiap sesi: menggambar peta dari ingatan, 10 menit istilah, dan satu soal "عَلِّلْ".
2. Jadwal ulang H+1, H+3, H+7.
3. Dua hari terakhir untuk soal gaya ujian.

Format: tabel (hari | bab | kegiatan | durasi).

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Soal Gaya Ujian Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab [SEBUTKAN BAB-BAB], buat latihan seperti ujian Ma'had, dalam bahasa Arab berharakat + terjemah singkat:
1. 4 soal "اِخْتَرِ الْإِجَابَةَ الصَّحِيحَةَ".
2. 3 soal "أَكْمِلْ".
3. 3 pernyataan "ضَعْ عَلَامَةَ (✓) أَوْ (✗)".
4. JANGAN beri jawaban. Tunggu jawabanku, lalu koreksi dengan penjelasan singkat.

Hanya buat soal yang jawabannya kamu yakini.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill 'Allil Fenomena Geografi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Latih aku menjelaskan sebab fenomena geografi:
1. Beri 6 soal "عَلِّلْ" berbahasa Arab berharakat + terjemah (mis. kenapa penduduk Mesir berkumpul di lembah Nil).
2. Satu soal sekali jalan. JANGAN beri jawaban. Tunggu jawabanku.
3. Koreksi: apakah sebab yang kusebut tepat dan lengkap.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Jelaskan dengan Kata Sendiri (Aku Coba, AI Koreksi)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Aku menjelaskan satu konsep atau fenomena geografi dengan kata-kataku sendiri (di bawah). Koreksi dengan ramah:
1. Bagian yang sudah benar dan yang kurang.
2. Istilah yang salah pakai.
3. Bahasa Arab tulisanku bila kutulis dalam Arab: maksimal 3 koreksi.
4. Contoh penjelasan yang lebih baik tapi tetap singkat.

Penjelasanku:
[TEMPEL JAWABANKU]

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Simulasi Ujian Geografi Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian.

Buatkan satu lembar ujian dari bab [SEBUTKAN BAB-BAB], soal dalam bahasa Arab berharakat + terjemah singkat:
1. Tiga السؤال dengan bobot درجة: pilihan ganda dan isian; "عَلِّلْ"; lalu satu soal peta yang dijelaskan dengan kata-kata.
2. Hanya fakta yang kamu yakini.
3. JANGAN beri jawaban. Tunggu jawabanku seluruhnya, lalu nilai dan jelaskan yang salah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Ujian Lisan Geografi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian lisan.

Berperanlah sebagai guru penguji lisan untuk bab [SEBUTKAN BAB-BAB]:
1. Satu pertanyaan sekali jalan, dalam bahasa Arab sederhana: istilah, letak suatu tempat, atau sebab sebuah fenomena.
2. Tunggu jawabanku sebelum lanjut, lalu beri umpan balik singkat dan ramah.
3. Setelah 6 pertanyaan: nilai kesiapanku (dari 10) dan bab yang perlu diulang.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Tips Ujian Geografi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang diujikan: [SEBUTKAN BAB-BAB]. Bantu aku bersiap:
1. Jenis soal yang mungkin keluar dan satu contoh redaksi soal dalam bahasa Arab.
2. Istilah, lokasi peta, dan data yang wajib hafal.
3. Rencana 5 hari sebelum ujian.

Jangan mengklaim soal tertentu "pasti keluar".

[METODE]

[LEVEL_BAHASA]`,
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
          title: "Pahami Mantiq untuk Pemula",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Kenalkan aku pada ilmu mantiq dengan sederhana:
1. Ta'rif عِلْمُ الْمَنْطِقِ dan faedahnya: menjaga pikiran dari kesalahan.
2. Dua bagian besar: التَّصَوُّرُ (memahami makna, hasilnya ta'rif) dan التَّصْدِيقُ (menilai benar-salah, hasilnya qiyas) — dengan contoh sehari-hari.
3. Beda الْعِلْمُ الضَّرُورِيُّ dan النَّظَرِيُّ dengan contoh.
4. Tutup dengan 3 pertanyaan cepat. Tunggu jawabanku.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Al-Kulliyat Al-Khams dengan Contoh",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan الْكُلِّيُّ وَالْجُزْئِيُّ lalu الْكُلِّيَّاتُ الْخَمْسُ: الْجِنْسُ، النَّوْعُ، الْفَصْلُ، الْخَاصَّةُ، الْعَرَضُ الْعَامُّ.
1. Ta'rif singkat tiap kulli (Arab berharakat + arti).
2. Satu contoh berantai yang sama untuk semuanya, mis. manusia: jins = hewan, fashl = berpikir, khashshah = tertawa, 'aradh 'am = berjalan.
3. Cara cepat membedakan khashshah dan 'aradh 'am.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Qadhiyyah & Qiyas Sederhana",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan dengan contoh sederhana:
1. الْقَضِيَّةُ: ta'rif, bagian-bagiannya (مَوْضُوعٌ، مَحْمُولٌ), dan pembagiannya (كُلِّيَّةٌ/جُزْئِيَّةٌ، مُوجَبَةٌ/سَالِبَةٌ).
2. الْقِيَاسُ: muqaddimah shughra, kubra, al-hadd al-awsath, dan natijah — dibedah pada satu contoh.
3. Contoh qiyas yang benar dan yang salah, dan kenapa yang salah itu salah.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Kartu Hafalan Kulliyat Khams",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Buatkan kartu hafalan al-kulliyat al-khams:
1. Tabel: kulli (Arab berharakat) | ta'rif persis sesuai buku (kalau aku menempelnya, pakai redaksi itu) | contoh | cara mengingat.
2. Lalu uji aku: kamu sebut contoh, aku sebut jenis kulli-nya. 8 soal, satu per satu, tunggu jawabanku.

Ta'rif dari buku (opsional):
[TEMPEL TA'RIF DARI BUKU]

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Hafal Istilah Mantiq Dasar",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Buatkan daftar istilah mantiq yang harus kuhafal:
1. Istilah: التَّصَوُّرُ، التَّصْدِيقُ، الْكُلِّيُّ، الْجُزْئِيُّ، التَّعْرِيفُ، الْحَدُّ، الرَّسْمُ، الْقَضِيَّةُ، الْقِيَاسُ، النَّتِيجَةُ.
2. Untuk tiap istilah: ta'rif singkat dan satu contoh.
3. Lalu uji aku satu per satu. Tunggu jawabanku.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Mantiq Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang diujikan: [SEBUTKAN BAB-BAB]. Buatkan jadwal belajar sampai ujian:
1. Tiap sesi: 10 menit ta'rif, 15 menit latihan contoh (menentukan kulli atau menyusun qiyas).
2. Jadwal ulang H+1, H+3, H+7.
3. Dua hari terakhir untuk soal gaya ujian.

Format: tabel (hari | bab | kegiatan | durasi).

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Drill Susun & Uji Qiyas",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Latih aku dengan qiyas:
1. Beri 6 soal: sebagian berupa dua muqaddimah untuk kusimpulkan natijahnya, sebagian berupa qiyas lengkap untuk kutentukan hadd awsath-nya dan kunilai benar-salahnya.
2. Satu soal sekali jalan. JANGAN beri jawaban. Tunggu jawabanku.
3. Koreksi dengan alasan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Tentukan Kulli & Jenis Qadhiyyah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 8 soal campuran:
1. Separuh: tentukan jenis kulli dari pasangan kata (mis. "hewan bagi manusia").
2. Separuh: tentukan jenis qadhiyyah (kulliyyah/juz'iyyah, mujabah/salibah) dari kalimat.
3. Satu soal sekali jalan. JANGAN beri jawaban. Tunggu jawabanku, lalu koreksi.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Soal Gaya Ujian Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab [SEBUTKAN BAB-BAB], buat latihan seperti ujian Ma'had, dalam bahasa Arab berharakat + terjemah singkat:
1. 3 soal "عَرِّفْ".
2. 3 soal "مَثِّلْ لِـ ...".
3. 2 soal "عَلِّلْ".
4. 3 pernyataan "ضَعْ عَلَامَةَ (✓) أَوْ (✗)".
5. JANGAN beri jawaban. Tunggu jawabanku, lalu koreksi dengan penjelasan singkat.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Simulasi Ujian Tulis Mantiq Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian.

Buatkan satu lembar ujian dari bab [SEBUTKAN BAB-BAB], soal dalam bahasa Arab berharakat + terjemah singkat:
1. Tiga السؤال dengan bobot درجة: ta'rif dan contoh; menentukan kulli dan jenis qadhiyyah; lalu menyusun atau menilai qiyas.
2. JANGAN beri jawaban. Tunggu jawabanku seluruhnya, lalu nilai dan jelaskan yang salah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Ujian Lisan Mantiq",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian lisan.

Berperanlah sebagai guru penguji lisan untuk bab [SEBUTKAN BAB-BAB]:
1. Satu pertanyaan sekali jalan, dalam bahasa Arab sederhana: ta'rif, contoh kulli, atau "susun qiyas dari ...".
2. Tunggu jawabanku sebelum lanjut, lalu beri umpan balik singkat dan ramah.
3. Setelah 6 pertanyaan: nilai kesiapanku (dari 10) dan bab yang perlu diulang.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Tips Ujian Mantiq Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang diujikan: [SEBUTKAN BAB-BAB]. Bantu aku bersiap:
1. Jenis soal yang mungkin keluar dan satu contoh redaksi soal dalam bahasa Arab.
2. Ta'rif yang wajib hafal persis.
3. Rencana 5 hari sebelum ujian.

Jangan mengklaim soal tertentu "pasti keluar".

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  // ══════════════ MA'AHID AL-BU'UTS AL-ISLAMIYYAH — 10 MADDAH BARU ══════════════

  /* ─── I'DADI ──────────────────────────────────────────────────── */

  {
    id: "tsaqafah-islamiyah-mahad",
    name: "Tsaqafah Islamiyah",
    nameArabic: "الثقافة الإسلامية",
    arabic: "الثقافة الإسلامية",
    description: "Wawasan Islam menyeluruh — aqidah, syariah, akhlak, dan peradaban",
    descriptionArabic: "تنمية الوعي الإسلامي الشامل لدى الطالب في مجالات العقيدة والشريعة والأخلاق",
    category: "aqdi",
    jenjang: ["idad"],
    jurusan: null,
    kitabUtama: [{ nama: "Tsaqafah Islamiyah", arabic: "الثقافة الإسلامية", penulis: "Manhaj Al-Azhar" }],
    recommendedAI: [],
    prompts: {
      pahami: [
        {
          title: "Pahami Satu Bab Tsaqafah dengan Mudah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan bab [SEBUTKAN BAB, mis. keistimewaan Islam, akhlak Muslim, peradaban Islam, tantangan pemuda] dengan sederhana:
1. Istilah kunci dalam bahasa Arab berharakat + artinya.
2. Penjelasan inti dalam 5–7 poin dengan contoh dari kehidupan remaja.
3. Satu ayat atau hadits pendek yang terkait — hanya yang kamu yakini redaksinya.
4. Tutup dengan 3 pertanyaan cepat. Tunggu jawabanku.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Islam sebagai Jalan Hidup yang Menyeluruh",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan bahwa Islam mengatur seluruh sisi hidup (الشُّمُولُ):
1. Akidah, ibadah, akhlak, dan muamalah — satu contoh sederhana untuk tiap sisi dari kehidupan sehari-hari pelajar.
2. Keistimewaan Islam: رَبَّانِيَّةٌ، وَسَطِيَّةٌ، يُسْرٌ — dengan dalil pendek yang kamu yakini.
3. Tabel ringkas yang bisa kusalin: sisi | contoh | dalil.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Tantangan Remaja Muslim Masa Kini",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bahas satu tantangan: [SEBUTKAN TANTANGAN, mis. kecanduan gawai, ikut-ikutan tren, pergaulan, keraguan tentang agama].
1. Kenapa hal itu jadi tantangan bagi remaja.
2. Tuntunan Islam yang terkait, dengan dalil pendek yang kamu yakini.
3. Tiga langkah nyata yang bisa kulakukan mulai minggu ini.

Gunakan bahasa yang hangat dan tidak menghakimi.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Kartu Hafalan Istilah & Dalil Pendek",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk bab [SEBUTKAN BAB], buatkan kartu hafalan:
1. Tabel: istilah Arab berharakat | arti | satu kalimat penjelasan.
2. Dalil pendek yang wajib hafal — hanya yang kamu yakini redaksinya.
3. Cara mudah mengingat.
4. Lalu uji aku 8 soal, satu per satu. Tunggu jawabanku.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Tsaqafah Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang harus kupelajari: [SEBUTKAN BAB-BAB]. Buatkan jadwal belajar sampai ujian:
1. Bagi per bab, 20–30 menit per sesi.
2. Jadwal ulang H+1, H+3, H+7.
3. Cara menguji diri tiap sesi: istilah, satu dalil, dan satu contoh penerapan.

Format: tabel (hari | bab | cara menguji | durasi).

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Soal Gaya Ujian Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab [SEBUTKAN BAB], buat latihan seperti ujian Ma'had, soal dalam bahasa Arab berharakat + terjemah singkat:
1. 4 soal "اِخْتَرِ الْإِجَابَةَ الصَّحِيحَةَ".
2. 3 soal "أَكْمِلْ".
3. 2 soal "اُذْكُرْ ... مَعَ الدَّلِيلِ".
4. 3 pernyataan "ضَعْ عَلَامَةَ (✓) أَوْ (✗)".
5. JANGAN beri jawaban. Tunggu jawabanku, lalu koreksi dengan penjelasan singkat.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Jelaskan Konsep (Aku Coba, AI Koreksi)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Aku menjelaskan satu konsep tsaqafah dengan kata-kataku sendiri (di bawah). Koreksi dengan ramah:
1. Bagian yang sudah benar dan yang kurang.
2. Dalil yang kupakai: tepat atau tidak.
3. Bahasa Arab tulisanku bila kutulis dalam Arab: maksimal 3 koreksi.
4. Versi perbaikan yang ringkas.

Penjelasanku:
[TEMPEL JAWABANKU]

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Simulasi Ujian Tsaqafah Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian.

Buatkan satu lembar ujian dari bab [SEBUTKAN BAB-BAB], soal dalam bahasa Arab berharakat + terjemah singkat:
1. Tiga السؤال dengan bobot درجة: pilihan ganda dan isian, lalu "اُذْكُرْ مَعَ الدَّلِيلِ", lalu satu soal uraian pendek.
2. JANGAN beri jawaban. Tunggu jawabanku seluruhnya, lalu nilai dan jelaskan yang salah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Tips Ujian Tsaqafah Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang diujikan: [SEBUTKAN BAB-BAB]. Bantu aku bersiap:
1. Untuk tiap bab: jenis soal yang mungkin keluar dan satu contoh redaksi soal dalam bahasa Arab.
2. Istilah dan dalil yang wajib hafal.
3. Rencana 5 hari sebelum ujian.

Jangan mengklaim soal tertentu "pasti keluar".

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  {
    id: "dirasat-ijtima",
    name: "Dirasat Ijtima'iyyah (IPS)",
    nameArabic: "الدراسات الاجتماعية",
    arabic: "الدراسات الاجتماعية",
    description: "Ilmu Pengetahuan Sosial — geografi, sejarah, dan ilmu sosial dasar",
    descriptionArabic: "دراسة الجغرافيا والتاريخ والمجتمع على المستوى الإعدادي",
    category: "tarikhi",
    jenjang: ["idad"],
    jurusan: null,
    kitabUtama: [{ nama: "Dirasat Ijtima'iyyah", arabic: "الدراسات الاجتماعية", penulis: "Manhaj Al-Azhar" }],
    recommendedAI: [],
    prompts: {
      pahami: [
        {
          title: "Pahami Satu Bab IPS dengan Mudah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan bab [SEBUTKAN BAB, mis. iklim Mesir, Sungai Nil, peradaban Mesir kuno, hak dan kewajiban warga] dengan sederhana:
1. Istilah kunci dalam bahasa Arab berharakat + artinya (buku Ma'had memakai bahasa Arab).
2. Penjelasan inti dalam 5–7 poin dengan contoh dari kehidupan sehari-hari.
3. Satu nilai Islam yang berkaitan dengan bab ini.
4. Tutup dengan 3 pertanyaan cepat untuk mengecek pemahamanku. Tunggu jawabanku.

Fakta dan angka hanya yang kamu yakini; kalau ragu, katakan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Peta & Geografi Mesir dan Dunia Arab",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu aku memahami bab geografi [SEBUTKAN BAB, mis. letak dan batas Mesir, bentuk permukaan bumi, penduduk]:
1. Gambaran peta dengan kata-kata: letak, batas, dan tempat penting — lalu sarankan aku menggambar peta sederhana.
2. Istilah geografi dalam bahasa Arab berharakat + artinya.
3. Hubungan sebab-akibat (mis. iklim dan pertanian) dalam bentuk panah.

Angka (luas, jumlah penduduk) hanya sebagai perkiraan dengan tahunnya; jangan mengarang.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Peristiwa Sejarah secara Runtut",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk peristiwa atau masa [SEBUTKAN PERISTIWA, mis. Mesir kuno, masuknya Islam ke Mesir, Perang Oktober]:
1. Garis waktu singkat: sebab → peristiwa → akibat.
2. Tokoh penting dan perannya.
3. Istilah Arab berharakat + artinya.
4. Pelajaran yang bisa diambil.

Tahun dan nama hanya yang kamu yakini.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Kartu Hafalan Istilah & Fakta",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk bab [SEBUTKAN BAB], buatkan kartu hafalan:
1. Tabel: istilah Arab berharakat | arti | satu kalimat penjelasan.
2. Fakta penting (tahun, tempat, tokoh) — hanya yang kamu yakini.
3. Cara mudah mengingat (singkatan atau cerita pendek).
4. Lalu uji aku 8 soal, satu per satu. Tunggu jawabanku.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah IPS",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang harus kupelajari: [SEBUTKAN BAB-BAB]. Buatkan jadwal belajar sampai ujian:
1. Bagi per bab, 20–30 menit per sesi.
2. Jadwal ulang H+1, H+3, H+7.
3. Cara menguji diri tiap sesi: istilah, peta, dan satu soal "عَلِّلْ".

Format: tabel (hari | bab | cara menguji | durasi).

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Soal Gaya Ujian Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab [SEBUTKAN BAB], buat latihan seperti ujian Ma'had, soal dalam bahasa Arab berharakat + terjemah singkat:
1. 4 soal "اِخْتَرِ الْإِجَابَةَ الصَّحِيحَةَ".
2. 3 soal "أَكْمِلْ".
3. 2 soal "عَلِّلْ".
4. 3 pernyataan "ضَعْ عَلَامَةَ (✓) أَوْ (✗)".
5. JANGAN beri jawaban. Tunggu jawabanku, lalu koreksi dengan penjelasan singkat.

Hanya buat soal yang jawabannya kamu yakini.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Jawab Soal Uraian (Aku Coba, AI Koreksi)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Aku menjawab satu soal uraian IPS (soal dan jawabanku di bawah). Koreksi dengan ramah:
1. Poin yang sudah benar dan yang kurang.
2. Fakta yang keliru, dengan alasan.
3. Bahasa Arab tulisanku bila kutulis dalam Arab: maksimal 3 koreksi.
4. Contoh jawaban yang lebih lengkap tapi tetap singkat.

Soal dan jawabanku:
[TEMPEL JAWABANKU]

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Simulasi Ujian IPS Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian.

Buatkan satu lembar ujian dari bab [SEBUTKAN BAB-BAB], soal dalam bahasa Arab berharakat + terjemah singkat:
1. Tiga السؤال dengan bobot درجة: pilihan ganda dan isian, lalu "عَلِّلْ", lalu satu soal peta atau garis waktu.
2. Hanya fakta yang kamu yakini.
3. JANGAN beri jawaban. Tunggu jawabanku seluruhnya, lalu nilai dan jelaskan yang salah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Tips Ujian IPS",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang diujikan: [SEBUTKAN BAB-BAB]. Bantu aku bersiap:
1. Untuk tiap bab: jenis soal yang mungkin keluar dan satu contoh redaksi soal dalam bahasa Arab.
2. Istilah dan fakta yang wajib hafal.
3. Tips menjawab soal "عَلِّلْ" dan soal peta.
4. Rencana 5 hari sebelum ujian.

Jangan mengklaim soal tertentu "pasti keluar".

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  {
    id: "komputer-idad",
    name: "Komputer & TI (Teknologi Informasi)",
    nameArabic: "الكمبيوتر وتكنولوجيا المعلومات",
    arabic: "الكمبيوتر وتكنولوجيا المعلومات",
    description: "Dasar-dasar komputer dan teknologi informasi untuk tingkat I'dadi",
    descriptionArabic: "أساسيات الحاسوب وتقنية المعلومات للمرحلة الإعدادية",
    category: "tarikhi",
    jenjang: ["idad"],
    jurusan: null,
    kitabUtama: [{ nama: "Al-Kambyutar wa Tiknulujiya Al-Ma'lumat", arabic: "الكمبيوتر وتكنولوجيا المعلومات", penulis: "Manhaj Al-Azhar" }],
    recommendedAI: [],
    prompts: {
      pahami: [
        {
          title: "Pahami Satu Bab Komputer dengan Mudah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan bab [SEBUTKAN BAB, mis. komponen komputer, sistem operasi, internet, keamanan informasi] dengan sederhana:
1. Istilah kunci dalam bahasa Arab (seperti di buku Ma'had) + bahasa Inggris + artinya, mis. وَحْدَةُ الْمُعَالَجَةِ الْمَرْكَزِيَّةِ = CPU.
2. Penjelasan inti dalam 5–7 poin dengan perumpamaan sehari-hari.
3. Tutup dengan 3 pertanyaan cepat. Tunggu jawabanku.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Perangkat Keras & Lunak",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan bedanya الْمُكَوِّنَاتُ الْمَادِّيَّةُ (hardware) dan الْبَرَامِجُ (software):
1. Perangkat masukan, keluaran, pemrosesan, dan penyimpanan — contoh untuk tiap jenis, nama Arab + Inggris.
2. Jenis software: sistem operasi dan aplikasi, dengan contoh.
3. Satu diagram alur sederhana: data masuk → diproses → disimpan → keluar.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Internet & Etika Digital Muslim",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan bab internet dan keamanan:
1. Istilah pokok (الشَّبَكَةُ، الْمُتَصَفِّحُ، الْبَرِيدُ الْإِلِكْتُرُونِيُّ، كَلِمَةُ الْمُرُورِ) + artinya.
2. Cara menjaga keamanan akun dan data pribadi.
3. Adab Muslim di internet: jujur, menjaga pandangan dan lisan, tidak menyebar berita tanpa tabayyun — dengan satu dalil yang kamu yakini.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Kartu Hafalan Istilah Komputer (Arab–Inggris–Indonesia)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk bab [SEBUTKAN BAB], buatkan kartu hafalan:
1. Tabel: istilah Arab berharakat | istilah Inggris | arti | fungsi singkat.
2. Cara mudah mengingat.
3. Lalu uji aku 8 soal: kamu sebut istilah Arab, aku sebut arti dan fungsinya. Satu per satu, tunggu jawabanku.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Komputer",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang harus kupelajari: [SEBUTKAN BAB-BAB]. Buatkan jadwal belajar sampai ujian:
1. Bagi per bab, 20–30 menit per sesi.
2. Jadwal ulang H+1, H+3, H+7.
3. Cara menguji diri: istilah, fungsi, dan satu praktik kecil di komputer bila memungkinkan.

Format: tabel (hari | bab | cara menguji | durasi).

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Soal Gaya Ujian Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab [SEBUTKAN BAB], buat latihan seperti ujian Ma'had, soal dalam bahasa Arab berharakat + terjemah singkat:
1. 4 soal "اِخْتَرِ الْإِجَابَةَ الصَّحِيحَةَ".
2. 3 soal "أَكْمِلْ".
3. 3 pernyataan "ضَعْ عَلَامَةَ (✓) أَوْ (✗)".
4. 2 soal "اُذْكُرْ وَظِيفَةَ ...".
5. JANGAN beri jawaban. Tunggu jawabanku, lalu koreksi dengan penjelasan singkat.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Praktik Langkah demi Langkah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Aku ingin berlatih keterampilan [SEBUTKAN KETERAMPILAN, mis. membuat folder dan menyimpan file, mengetik dokumen, membuat tabel di spreadsheet].
1. Beri tugas kecil dengan tujuan yang jelas.
2. Beri langkah-langkahnya satu per satu; setelah tiap langkah, tunggu aku bilang "sudah" sebelum lanjut.
3. Di akhir, beri 2 pertanyaan untuk mengecek apakah aku paham alasan tiap langkah.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Simulasi Ujian Komputer Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian.

Buatkan satu lembar ujian dari bab [SEBUTKAN BAB-BAB], soal dalam bahasa Arab berharakat + terjemah singkat:
1. Tiga السؤال dengan bobot درجة: pilihan ganda dan isian, lalu ✓/✗, lalu "اُذْكُرْ" atau "قَارِنْ بَيْنَ".
2. JANGAN beri jawaban. Tunggu jawabanku seluruhnya, lalu nilai dan jelaskan yang salah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Tips Ujian Komputer",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang diujikan: [SEBUTKAN BAB-BAB]. Bantu aku bersiap:
1. Untuk tiap bab: jenis soal yang mungkin keluar dan satu contoh redaksi soal dalam bahasa Arab.
2. Istilah Arab yang wajib hafal.
3. Rencana 5 hari sebelum ujian.

Jangan mengklaim soal tertentu "pasti keluar".

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  /* ─── TSANAWI ADABI ──────────────────────────────────────────── */

  {
    id: "arudh-tsanawi",
    name: "'Arudh wal Qawafi (Tsanawi)",
    nameArabic: "العروض والقوافي",
    arabic: "العروض والقوافي",
    description: "Ilmu timbangan syair dan qafiyah — tingkat Tsanawi Adabi",
    descriptionArabic: "دراسة البحور الشعرية والأوزان والقوافي على المستوى الثانوي الأدبي",
    category: "lughawi",
    jenjang: ["tsanawi"],
    jurusan: ["adabi"],
    kitabUtama: [{ nama: "'Arudh wal Qawafi", arabic: "العروض والقوافي", penulis: "Manhaj Al-Azhar" }],
    recommendedAI: [],
    prompts: {
      pahami: [
        {
          title: "Pahami Dasar 'Arudh: dari Harakat ke Taf'ilah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan dasar 'arudh untuk pemula:
1. Apa itu الْعَرُوضُ dan الْقَافِيَةُ, dan siapa peletaknya.
2. Tiga aturan pokok الْكِتَابَةُ الْعَرُوضِيَّةُ: tulis yang diucapkan, buang yang tidak diucapkan, dan pecah huruf bersyaddah — masing-masing dengan satu contoh kata.
3. Lambang: huruf berharakat (/) dan sukun (0); lalu cara mengelompokkan lambang menjadi taf'ilah (mis. فَعُولُنْ = //0/0).
4. Satu latihan kecil: tiga kata untuk kutulis secara 'arudhi. Tunggu jawabanku.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Bahr-Bahr di Muqarrar Tsanawi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk bahr [SEBUTKAN BAHR, mis. ar-rajaz, al-kamil, al-wafir, al-mutaqarib] yang ada di muqarrar-ku:
1. Taf'ilat satu shathr, ditulis jelas.
2. Ciri mudah untuk mengenalinya.
3. Perubahan (zihaf) yang paling sering muncul di bahr ini, dengan contoh taf'ilah sebelum → sesudah.
4. Bait kunci (miftah) — hanya kalau kamu yakin redaksinya; kalau ragu, lewati saja.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Qafiyah & Huruf Rawi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan qafiyah dengan sederhana:
1. Ta'rif الْقَافِيَةُ dan cara menentukannya di akhir bait.
2. Huruf الرَّوِيُّ dan cara menemukannya, dengan contoh.
3. Qafiyah مُطْلَقَةٌ dan مُقَيَّدَةٌ.
4. Terapkan pada bait yang kutempel dari buku.

Bait:
[TEMPEL BAIT]

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Kartu Hafalan Taf'ilat & Istilah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bahr di muqarrar-ku: [SEBUTKAN BAHR-BAHR]. Buatkan kartu hafalan:
1. Tabel: bahr | taf'ilat satu shathr | lambang /0 | ciri mudah.
2. Istilah pokok (الصَّدْرُ، الْعَجُزُ، الْعَرُوضُ، الضَّرْبُ، الرَّوِيُّ) dengan harakat + arti.
3. Lalu uji aku: kamu sebut bahr, aku tulis taf'ilatnya. Satu per satu, tunggu jawabanku.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Latihan 'Arudh Tsanawi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bahr yang diujikan: [SEBUTKAN BAHR-BAHR]. Buatkan jadwal latihan sampai ujian:
1. Tiap hari: 5 menit mengulang taf'ilat, 15 menit taqthi' dua bait dari buku.
2. Jadwal ulang H+1, H+3, H+7 untuk bahr yang paling sering salah.
3. Dua hari terakhir untuk soal gaya ujian.

Format: tabel (hari | bahr | kegiatan | durasi).

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Taqthi' Bait Buku (Aku Coba, AI Koreksi)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Aku sudah men-taqthi' bait dari buku (bait dan jawabanku di bawah). Koreksi dengan sabar:
1. Periksa kitabah 'arudhiyyah-ku huruf demi huruf.
2. Periksa lambang /0 dan pembagian taf'ilah.
3. Periksa nama bahr-nya.
4. Tunjukkan langkah yang benar untuk bagian yang keliru. Kalau ada bagian yang kamu ragukan, katakan terus terang.

Bait dan taqthi'-ku:
[TEMPEL TAQTHI'KU]

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Soal Gaya Ujian Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Buat latihan 'arudh seperti ujian Ma'had, dalam bahasa Arab berharakat + terjemah singkat:
1. 3 soal "عَرِّفْ" dan 3 soal "أَكْمِلْ" tentang istilah dan taf'ilat.
2. 3 soal "اُكْتُبِ الْكَلِمَاتِ الْآتِيَةَ كِتَابَةً عَرُوضِيَّةً".
3. 3 pernyataan "ضَعْ عَلَامَةَ (✓) أَوْ (✗)".
4. JANGAN beri jawaban. Tunggu jawabanku, lalu koreksi dengan penjelasan singkat.

Soal taqthi' bait hanya memakai bait yang kutempel sendiri.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Simulasi Ujian 'Arudh Tsanawi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian.

Buatkan satu lembar ujian dari bahr [SEBUTKAN BAHR-BAHR], soal dalam bahasa Arab berharakat + terjemah singkat:
1. Tiga السؤال dengan bobot درجة: istilah dan taf'ilat, kitabah 'arudhiyyah, lalu "قَطِّعِ الْبَيْتَ وَاذْكُرْ بَحْرَهُ" memakai bait yang kutempel di bawah.
2. JANGAN beri jawaban. Tunggu jawabanku seluruhnya, lalu nilai langkah demi langkah.

Bait untuk soal taqthi' (dari buku):
[TEMPEL BAIT]

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Tips Ujian 'Arudh",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bahr yang diujikan: [SEBUTKAN BAHR-BAHR]. Bantu aku bersiap:
1. Jenis soal yang mungkin keluar dan satu contoh redaksi soal dalam bahasa Arab.
2. Urutan kerja taqthi' yang aman di lembar ujian dan kesalahan yang paling sering terjadi.
3. Rencana 5 hari sebelum ujian.

Jangan mengklaim soal tertentu "pasti keluar".

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  {
    id: "adab-nushus",
    name: "Adab wan Nushus (Sastra & Teks)",
    nameArabic: "الأدب والنصوص",
    arabic: "الأدب والنصوص",
    description: "Sastra Arab dan analisis teks — sejarah sastra, apresiasi, dan analisis naskah",
    descriptionArabic: "دراسة الأدب العربي وتحليل النصوص الأدبية شعراً ونثراً",
    category: "lughawi",
    jenjang: ["tsanawi"],
    jurusan: ["adabi", "ilmi"],
    kitabUtama: [{ nama: "Al-Adab wan Nushus", arabic: "الأدب والنصوص", penulis: "Manhaj Al-Azhar" }],
    recommendedAI: [],
    prompts: {
      pahami: [
        {
          title: "Pahami Sejarah Sastra di Muqarrar Tsanawi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan periode sastra [SEBUTKAN PERIODE, mis. Jahili, Shadr Al-Islam, Umawi, 'Abbasi] dengan sederhana:
1. Keadaan masyarakat yang memengaruhi sastra saat itu.
2. Tema syi'r yang menonjol (أَغْرَاضُ الشِّعْرِ) dan ciri gayanya.
3. Dua penyair terkenal dan ciri khas masing-masing — hanya yang kamu yakini.
4. Istilah Arab berharakat + artinya, lalu 3 pertanyaan cepat. Tunggu jawabanku.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Cara Menjawab Soal Nash",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Soal nash di ujian Ma'had biasanya memberi bait dari buku lalu bertanya. Ajari aku menjawab tiap jenis pertanyaan:
1. "هَاتِ مَعْنَى / مُضَادَّ / جَمْعَ ..." (kosakata).
2. "اِشْرَحِ الْأَبْيَاتَ بِأُسْلُوبِكَ" (syarah).
3. "مَا الْفِكْرَةُ الْعَامَّةُ؟" dan "مَا الْغَرَضُ الشِّعْرِيُّ؟".
4. "وَضِّحِ الصُّورَةَ الْجَمَالِيَّةَ فِي ..." (tasybih, isti'arah, kinayah).
Untuk tiap jenis: kerangka jawaban dan satu contoh singkat dalam bahasa Arab.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Nash dari Buku secara Tuntas",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Aku tempel bait atau teks dari buku muqarrar. Bantu aku memahaminya:
1. Syakl lengkap tanpa mengubah satu kata pun dari teks yang kutempel.
2. Arti kata sulit (معاني المفردات).
3. Syarah per bait dengan bahasa mudah.
4. Gagasan utama, tujuan (gharadh), dan satu atau dua keindahan bahasa.

Nash:
[TEMPEL NASH]

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Bait Nash & Maknanya",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Aku tempel bait-bait yang wajib kuhafal. Bantu aku:
1. Potong per shathr dan beri arti singkat tiap shathr.
2. Cara menghafal: kaitkan urutan bait dengan urutan gagasannya.
3. Lalu uji aku: kamu beri shathr pertama, aku lengkapi shathr kedua. Satu per satu, tunggu jawabanku.

Jangan mengubah teks bait yang kutempel.

Bait-bait:
[TEMPEL BAIT]

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Adab wan Nushus",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Muqarrar-ku mencakup [SEBUTKAN PERIODE & NASH]. Buatkan jadwal belajar sampai ujian:
1. Bagi antara sejarah sastra dan nash.
2. Jadwal ulang H+1, H+3, H+7, termasuk setoran hafalan bait.
3. Cara menguji diri tiap sesi: satu tokoh, satu nash (arti, syarah, keindahan).

Format: tabel (hari | bahan | cara menguji | durasi).

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Jawab Soal Nash (Aku Coba, AI Koreksi)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Aku menjawab soal-soal nash dari buku (nash, soal, dan jawabanku di bawah). Koreksi dengan ramah:
1. Jawaban kosakata, syarah, gagasan, dan keindahan: mana yang tepat dan mana yang kurang.
2. Bahasa Arab tulisanku: maksimal 5 koreksi.
3. Contoh jawaban yang lebih baik tapi tetap singkat.

Nash, soal, dan jawabanku:
[TEMPEL JAWABANKU]

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Soal Gaya Ujian Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari periode [SEBUTKAN PERIODE], buat latihan seperti ujian Ma'had, dalam bahasa Arab berharakat + terjemah singkat:
1. 4 soal "اِخْتَرِ الْإِجَابَةَ الصَّحِيحَةَ" tentang tokoh dan ciri periode.
2. 3 soal "أَكْمِلْ".
3. 2 soal "عَلِّلْ".
4. 3 pernyataan "ضَعْ عَلَامَةَ (✓) أَوْ (✗)".
5. JANGAN beri jawaban. Tunggu jawabanku, lalu koreksi dengan penjelasan singkat.

Hanya buat soal yang jawabannya kamu yakini.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Simulasi Ujian Adab wan Nushus",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian.

Buatkan satu lembar ujian dari muqarrar [SEBUTKAN PERIODE & NASH], soal dalam bahasa Arab berharakat + terjemah singkat:
1. Tiga السؤال dengan bobot درجة: sejarah sastra; satu nash (pakai nash yang kutempel di bawah) dengan soal kosakata, syarah, gagasan, dan keindahan; lalu soal hafalan bait.
2. JANGAN beri jawaban. Tunggu jawabanku seluruhnya, lalu nilai dan jelaskan yang kurang.

Nash untuk soal (dari buku):
[TEMPEL NASH]

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Tips Ujian Adab wan Nushus",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Muqarrar yang diujikan: [SEBUTKAN PERIODE & NASH]. Bantu aku bersiap:
1. Jenis soal yang mungkin keluar untuk sejarah sastra dan untuk nash, dengan satu contoh redaksi soal dalam bahasa Arab.
2. Bait yang wajib hafal dan cara menghafalnya.
3. Rencana 5 hari sebelum ujian.

Jangan mengklaim soal tertentu "pasti keluar".

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  /* ─── TSANAWI ILMI ───────────────────────────────────────────── */

  {
    id: "fisika-tsanawi",
    name: "Fisika (Tsanawi Ilmi)",
    nameArabic: "الفيزياء",
    arabic: "الفيزياء",
    description: "Fisika — mekanika, listrik, cahaya, dan gelombang untuk tingkat Tsanawi Ilmi",
    descriptionArabic: "دراسة الفيزياء من ميكانيكا وكهرباء وضوء وموجات للمرحلة الثانوية العلمية",
    category: "tarikhi",
    jenjang: ["tsanawi"],
    jurusan: ["ilmi"],
    kitabUtama: [{ nama: "Al-Fiziya'", arabic: "الفيزياء", penulis: "Manhaj Al-Azhar" }],
    recommendedAI: [],
    prompts: {
      pahami: [
        {
          title: "Pahami Satu Bab Fisika secara Konsep",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan bab [SEBUTKAN BAB, mis. gerak lurus, hukum Newton, usaha dan energi, listrik statis, gelombang] secara konsep dulu, baru rumus:
1. Istilah kunci dalam bahasa Arab (seperti buku Ma'had) + artinya, mis. السُّرْعَةُ، الْعَجَلَةُ، الْقُوَّةُ.
2. Konsep inti dengan contoh sehari-hari.
3. Rumus pokok: arti tiap simbol dan satuannya (SI).
4. Kesalahan konsep yang sering terjadi.

Tulis rumus dengan jelas; jangan menambah rumus yang tidak ada di tingkatku kecuali kuminta.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Cara Menyelesaikan Soal Hitungan",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Ajari aku langkah baku mengerjakan soal hitungan fisika, dengan satu contoh dari bab [SEBUTKAN BAB]:
1. Tulis yang diketahui dan ditanya, lalu samakan satuan.
2. Pilih rumus dan jelaskan alasannya.
3. Substitusi dan hitung, langkah demi langkah.
4. Cek hasil: satuan dan kewajaran angka.

Tulis soal contoh dalam bahasa Arab berharakat + terjemah, seperti di ujian Ma'had. Periksa ulang hitunganmu sebelum menjawab.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Percobaan & Grafik",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk percobaan atau grafik di bab [SEBUTKAN BAB]:
1. Tujuan percobaan, alat, langkah, dan hasil yang diharapkan.
2. Cara membaca grafik (mis. jarak–waktu, kecepatan–waktu): arti kemiringan dan luas di bawah kurva.
3. Kesimpulan dan hubungannya dengan rumus.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Kartu Rumus, Satuan & Istilah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk bab [SEBUTKAN BAB], buatkan kartu hafalan:
1. Tabel: besaran (Arab berharakat) | simbol | rumus | satuan SI | arti.
2. Hubungan antarrumus supaya tidak hafalan buta.
3. Lalu uji aku 8 soal, satu per satu: kamu sebut besaran, aku tulis rumus dan satuannya. Tunggu jawabanku.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Belajar Fisika",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang harus kupelajari: [SEBUTKAN BAB-BAB]. Buatkan jadwal belajar sampai ujian:
1. Tiap sesi: 10 menit konsep dan rumus, 20 menit soal hitungan.
2. Jadwal ulang H+1, H+3, H+7, termasuk menulis ulang daftar rumus dari ingatan.
3. Target jumlah soal hitungan per bab.

Format: tabel (hari | bab | kegiatan | durasi).

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Soal Hitungan Bertahap",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab [SEBUTKAN BAB], beri 6 soal dalam bahasa Arab berharakat + terjemah singkat: 2 mudah, 2 sedang, 2 sulit.
1. Satu soal sekali jalan. JANGAN beri jawaban. Tunggu jawabanku.
2. Koreksi langkahku, bukan hanya hasil akhirnya; tunjukkan di langkah mana aku keliru.
3. Periksa ulang hitunganmu sendiri sebelum menilai.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Soal Konsep Gaya Ujian Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab [SEBUTKAN BAB], buat soal konsep seperti ujian Ma'had, dalam bahasa Arab berharakat + terjemah singkat:
1. 4 soal "اِخْتَرِ الْإِجَابَةَ الصَّحِيحَةَ".
2. 3 soal "أَكْمِلْ".
3. 3 soal "عَلِّلْ" tentang gejala fisika sehari-hari (mis. kenapa penumpang terdorong ke depan saat bus mengerem).
4. JANGAN beri jawaban. Tunggu jawabanku, lalu koreksi dengan penjelasan singkat.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Simulasi Ujian Fisika Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian.

Buatkan satu lembar ujian dari bab [SEBUTKAN BAB-BAB], soal dalam bahasa Arab berharakat + terjemah singkat:
1. Tiga السؤال dengan bobot درجة: pilihan ganda dan isian, lalu "عَلِّلْ", lalu 2–3 soal hitungan.
2. Periksa ulang semua angka dan kunci jawabanmu sebelum memberikan soal.
3. JANGAN beri jawaban. Tunggu jawabanku seluruhnya, lalu nilai langkah demi langkah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian Fisika",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang diujikan: [SEBUTKAN BAB-BAB]. Bantu aku bersiap:
1. Untuk tiap bab: rumus wajib, jenis soal hitungan yang mungkin keluar, dan satu contoh redaksi soal dalam bahasa Arab.
2. Tips mengerjakan soal hitungan dengan cepat dan aman (satuan, pembulatan, cek jawaban).
3. Rencana 5 hari sebelum ujian.

Jangan mengklaim soal tertentu "pasti keluar".

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  {
    id: "kimia-tsanawi",
    name: "Kimia / Kimiya' (Tsanawi Ilmi)",
    nameArabic: "الكيمياء",
    arabic: "الكيمياء",
    description: "Kimia — atom, ikatan, reaksi, dan stoikiometri untuk tingkat Tsanawi Ilmi",
    descriptionArabic: "دراسة الكيمياء من ذرة وروابط وتفاعلات وقياس للمرحلة الثانوية العلمية",
    category: "tarikhi",
    jenjang: ["tsanawi"],
    jurusan: ["ilmi"],
    kitabUtama: [{ nama: "Al-Kimiya'", arabic: "الكيمياء", penulis: "Manhaj Al-Azhar" }],
    recommendedAI: [],
    prompts: {
      pahami: [
        {
          title: "Pahami Satu Bab Kimia secara Konsep",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan bab [SEBUTKAN BAB, mis. struktur atom, sistem periodik, ikatan kimia, reaksi kimia, larutan] secara konsep:
1. Istilah kunci dalam bahasa Arab (seperti buku Ma'had) + artinya, mis. الذَّرَّةُ، الْإِلِكْتِرُونُ، الرَّابِطَةُ التَّسَاهُمِيَّةُ.
2. Konsep inti dengan gambaran sederhana atau perumpamaan.
3. Rumus atau persamaan pokok beserta arti simbolnya.
4. Kesalahan konsep yang sering terjadi.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Cara Menyetarakan Reaksi & Hitungan Mol",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Ajari aku langkah baku untuk soal [SEBUTKAN JENIS SOAL, mis. menyetarakan persamaan reaksi, hitungan mol, konsentrasi larutan]:
1. Langkah-langkahnya satu per satu.
2. Satu contoh soal dalam bahasa Arab berharakat + terjemah, dikerjakan bertahap.
3. Cara mengecek jawaban (jumlah atom, satuan).

Periksa ulang hitungan dan rumus kimiamu sebelum menjawab.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Percobaan & Keselamatan Laboratorium",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk percobaan di bab [SEBUTKAN BAB]:
1. Tujuan, alat dan bahan, langkah, pengamatan, dan kesimpulan.
2. Persamaan reaksi yang terjadi (hanya yang kamu yakini benar).
3. Aturan keselamatan laboratorium yang terkait.

Ini untuk memahami materi; jangan memberi petunjuk membuat zat berbahaya di luar percobaan buku.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Kartu Hafalan Unsur, Rumus & Istilah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk bab [SEBUTKAN BAB], buatkan kartu hafalan:
1. Tabel: istilah atau unsur (Arab berharakat) | simbol/rumus | arti | contoh.
2. Cara mudah mengingat (mis. urutan golongan dalam sistem periodik).
3. Lalu uji aku 8 soal, satu per satu. Tunggu jawabanku.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Belajar Kimia",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang harus kupelajari: [SEBUTKAN BAB-BAB]. Buatkan jadwal belajar sampai ujian:
1. Tiap sesi: 10 menit konsep, 10 menit menyetarakan reaksi, 10 menit soal hitungan.
2. Jadwal ulang H+1, H+3, H+7, termasuk menulis ulang simbol unsur dan rumus senyawa dari ingatan.
3. Target jumlah soal per bab.

Format: tabel (hari | bab | kegiatan | durasi).

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Soal Hitungan & Persamaan Reaksi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab [SEBUTKAN BAB], beri 6 soal dalam bahasa Arab berharakat + terjemah singkat: 2 mudah, 2 sedang, 2 sulit.
1. Satu soal sekali jalan. JANGAN beri jawaban. Tunggu jawabanku.
2. Koreksi langkahku, bukan hanya hasil akhirnya.
3. Periksa ulang hitungan dan persamaanmu sendiri sebelum menilai.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Soal Konsep Gaya Ujian Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab [SEBUTKAN BAB], buat soal konsep seperti ujian Ma'had, dalam bahasa Arab berharakat + terjemah singkat:
1. 4 soal "اِخْتَرِ الْإِجَابَةَ الصَّحِيحَةَ".
2. 3 soal "أَكْمِلْ".
3. 3 soal "عَلِّلْ" tentang sifat zat dan reaksi (mis. kenapa gas mulia sukar bereaksi).
4. JANGAN beri jawaban. Tunggu jawabanku, lalu koreksi dengan penjelasan singkat.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Simulasi Ujian Kimia Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian.

Buatkan satu lembar ujian dari bab [SEBUTKAN BAB-BAB], soal dalam bahasa Arab berharakat + terjemah singkat:
1. Tiga السؤال dengan bobot درجة: pilihan ganda dan isian, lalu "عَلِّلْ", lalu 2–3 soal hitungan atau persamaan reaksi.
2. Periksa ulang semua angka, rumus, dan kunci jawabanmu sebelum memberikan soal.
3. JANGAN beri jawaban. Tunggu jawabanku seluruhnya, lalu nilai langkah demi langkah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian Kimia",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang diujikan: [SEBUTKAN BAB-BAB]. Bantu aku bersiap:
1. Untuk tiap bab: konsep dan rumus wajib, jenis soal yang mungkin keluar, dan satu contoh redaksi soal dalam bahasa Arab.
2. Tips mengerjakan soal persamaan reaksi dan hitungan dengan aman.
3. Rencana 5 hari sebelum ujian.

Jangan mengklaim soal tertentu "pasti keluar".

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  {
    id: "biologi-tsanawi",
    name: "Biologi / Ahya' (Tsanawi Ilmi)",
    nameArabic: "الأحياء",
    arabic: "الأحياء",
    description: "Biologi — sel, sistem tubuh, genetika, dan ekologi untuk tingkat Tsanawi Ilmi",
    descriptionArabic: "دراسة الأحياء الدقيقة والجهاز البشري والوراثة والنظام البيئي على المستوى الثانوي العلمي",
    category: "tarikhi",
    jenjang: ["tsanawi"],
    jurusan: ["ilmi"],
    kitabUtama: [{ nama: "Al-Ahya'", arabic: "الأحياء", penulis: "Manhaj Al-Azhar" }],
    recommendedAI: [],
    prompts: {
      pahami: [
        {
          title: "Pahami Satu Bab Biologi dengan Analogi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan bab [SEBUTKAN BAB, mis. sel, pencernaan, peredaran darah, genetika, ekosistem] dengan analogi sehari-hari:
1. Istilah kunci dalam bahasa Arab (seperti buku Ma'had) + artinya, mis. الْخَلِيَّةُ، النَّوَاةُ، الْجِهَازُ الْهَضْمِيُّ، الْوِرَاثَةُ.
2. Struktur dan fungsi, dengan satu analogi untuk tiap bagian utama.
3. Proses utama di bab ini dalam bentuk urutan panah.
4. Kesalahan konsep yang sering terjadi.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Proses & Sistem Tubuh secara Berurutan",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan proses [SEBUTKAN PROSES, mis. pencernaan makanan, pernapasan, peredaran darah, pembelahan sel, fotosintesis]:
1. Urutan tahapnya dengan nama organ atau struktur (Arab berharakat + arti).
2. Apa yang terjadi di tiap tahap dan kenapa tahap itu penting.
3. Diagram teks sederhana yang bisa kusalin ke buku catatan.
4. Tiga pertanyaan "عَلِّلْ" yang mungkin keluar dari proses ini. Jangan beri jawabannya dulu.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Biologi & Tanda Kebesaran Allah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Hubungkan bab [SEBUTKAN BAB] dengan tadabbur ciptaan Allah:
1. Fakta ilmiah pokok di bab ini.
2. Ayat yang mengajak merenungkan ciptaan terkait (surat:ayat; redaksi hanya kalau kamu yakin).
3. Batas yang sehat: tidak memaksakan ayat sebagai "rumus sains" dan tidak mengklaim mukjizat ilmiah yang diperselisihkan.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Kartu Hafalan Istilah & Klasifikasi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk bab [SEBUTKAN BAB], buatkan kartu hafalan:
1. Tabel: istilah Arab berharakat | arti | fungsi atau ciri.
2. Klasifikasi dalam bentuk pohon (mis. jenis jaringan, kelompok makhluk hidup).
3. Cara mudah mengingat.
4. Lalu uji aku 8 soal, satu per satu. Tunggu jawabanku.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Belajar Biologi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang harus kupelajari: [SEBUTKAN BAB-BAB]. Buatkan jadwal belajar sampai ujian:
1. Tiap sesi: 10 menit membaca, 10 menit menggambar diagram dari ingatan, 10 menit soal.
2. Jadwal ulang H+1, H+3, H+7.
3. Target jumlah soal per bab.

Format: tabel (hari | bab | kegiatan | durasi).

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Soal Gaya Ujian Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab [SEBUTKAN BAB], buat latihan seperti ujian Ma'had, soal dalam bahasa Arab berharakat + terjemah singkat:
1. 4 soal "اِخْتَرِ الْإِجَابَةَ الصَّحِيحَةَ".
2. 3 soal "أَكْمِلْ".
3. 3 soal "عَلِّلْ" tentang fungsi organ atau proses.
4. 2 soal "قَارِنْ بَيْنَ".
5. JANGAN beri jawaban. Tunggu jawabanku, lalu koreksi dengan penjelasan singkat.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Jelaskan Proses (Aku Coba, AI Koreksi)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Aku menjelaskan satu proses biologi dengan kata-kataku sendiri (di bawah). Koreksi dengan ramah:
1. Tahap yang benar, yang terlewat, dan urutan yang keliru.
2. Istilah yang salah pakai.
3. Bahasa Arab tulisanku bila kutulis dalam Arab: maksimal 3 koreksi.
4. Versi perbaikan yang ringkas.

Penjelasanku:
[TEMPEL JAWABANKU]

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Simulasi Ujian Biologi Ma'had",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian.

Buatkan satu lembar ujian dari bab [SEBUTKAN BAB-BAB], soal dalam bahasa Arab berharakat + terjemah singkat:
1. Tiga السؤال dengan bobot درجة: pilihan ganda dan isian, lalu "عَلِّلْ" dan "قَارِنْ", lalu satu soal menjelaskan proses atau melabeli diagram yang dijelaskan dengan kata-kata.
2. Hanya fakta yang kamu yakini.
3. JANGAN beri jawaban. Tunggu jawabanku seluruhnya, lalu nilai dan jelaskan yang salah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian Biologi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang diujikan: [SEBUTKAN BAB-BAB]. Bantu aku bersiap:
1. Untuk tiap bab: istilah dan proses wajib, jenis soal yang mungkin keluar, dan satu contoh redaksi soal dalam bahasa Arab.
2. Tips menjawab soal "عَلِّلْ" dan soal diagram.
3. Rencana 5 hari sebelum ujian.

Jangan mengklaim soal tertentu "pasti keluar".

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  {
    id: "riyadhiyat-bahts",
    name: "Riyadhiyat Bahtsah (Matematika Murni)",
    nameArabic: "الرياضيات البحتة",
    arabic: "الرياضيات البحتة",
    description: "Matematika murni — aljabar, kalkulus, trigonometri, dan geometri untuk Tsanawi Ilmi",
    descriptionArabic: "دراسة الرياضيات البحتة من جبر وتفاضل وتثليث وهندسة للمرحلة الثانوية العلمية",
    category: "tarikhi",
    jenjang: ["tsanawi"],
    jurusan: ["ilmi"],
    kitabUtama: [{ nama: "Ar-Riyadhiyyat Al-Bahtsah", arabic: "الرياضيات البحتة", penulis: "Manhaj Al-Azhar" }],
    recommendedAI: [],
    prompts: {
      pahami: [
        {
          title: "Pahami Konsep Matematika Murni Langkah demi Langkah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan bab [SEBUTKAN BAB, mis. persamaan kuadrat, fungsi, limit, turunan, trigonometri, geometri analitik]:
1. Istilah kunci dalam bahasa Arab (seperti buku Ma'had) + artinya, mis. الْمُعَادَلَةُ، الدَّالَّةُ، الْمُشْتَقَّةُ، النِّهَايَةُ.
2. Ide dasarnya dengan gambaran atau grafik sederhana, sebelum rumus.
3. Rumus atau teorema pokok, dan dari mana asalnya secara singkat.
4. Dua contoh soal dikerjakan bertahap — periksa ulang hitunganmu sebelum menulis.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Kapan Memakai Rumus atau Metode",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk bab [SEBUTKAN BAB], aku sering bingung memilih cara penyelesaian. Bantu aku:
1. Daftar metode atau rumus di bab ini, masing-masing dengan "tanda" soal yang cocok untuknya.
2. Pohon keputusan sederhana: lihat bentuk soal → pilih metode.
3. Tiga soal pendek: aku menyebut metode yang cocok dulu sebelum mengerjakan. Satu per satu, tunggu jawabanku.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Pembuktian & Soal Cerita",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Ajari aku dua keterampilan yang sering membuat nilai turun, dengan contoh dari bab [SEBUTKAN BAB]:
1. Menulis pembuktian (الْبُرْهَانُ) yang rapi: yang diketahui, yang dibuktikan, langkah dengan alasan tiap langkah.
2. Menerjemahkan soal cerita berbahasa Arab ke bentuk matematika: kata kunci Arab (مَجْمُوعٌ، فَرْقٌ، حَاصِلُ ضَرْبٍ، ضِعْفُ) dan artinya.
3. Satu contoh untuk masing-masing, dikerjakan bertahap.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Lembar Rumus Matematika Murni",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Buatkan lembar rumus untuk bab [SEBUTKAN BAB-BAB]:
1. Tabel: rumus | nama Arab | kapan dipakai | contoh singkat.
2. Tandai rumus yang bisa diturunkan dari rumus lain, supaya hafalanku lebih sedikit.
3. Lalu uji aku 8 soal cepat: kamu sebut situasi, aku tulis rumusnya. Satu per satu, tunggu jawabanku.

Periksa ulang setiap rumus sebelum menulis.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Latihan Matematika Murni",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang diujikan: [SEBUTKAN BAB-BAB]. Buatkan jadwal latihan sampai ujian:
1. Tiap sesi: 10 menit rumus dan konsep, 30 menit soal bertingkat, 5 menit mencatat kesalahan.
2. Jadwal ulang H+1, H+3, H+7 untuk bab yang paling sering salah.
3. Target jumlah soal per bab dan satu sesi simulasi ujian berwaktu.

Format: tabel (hari | bab | kegiatan | durasi).

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Soal Bertingkat",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab [SEBUTKAN BAB], beri 6 soal dalam bahasa Arab berharakat + terjemah singkat: 2 mudah, 2 sedang, 2 sulit (termasuk satu pembuktian bila babnya memungkinkan).
1. Satu soal sekali jalan. JANGAN beri jawaban. Tunggu jawabanku.
2. Koreksi langkahku, bukan hanya hasil akhirnya; tunjukkan di langkah mana aku keliru.
3. Periksa ulang kunci jawabanmu sendiri sebelum menilai.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Bedah Soal yang Aku Salah (Aku Tempel, AI Periksa)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Aku salah mengerjakan soal di bawah. Bantu aku belajar dari kesalahannya:
1. Temukan langkah pertama yang keliru dan jenis kesalahannya (konsep, rumus, aljabar, tanda, atau hitungan).
2. Tunjukkan cara yang benar, langkah demi langkah.
3. Beri satu soal mirip untuk kucoba ulang. JANGAN beri jawabannya. Tunggu jawabanku.

Soal dan jawabanku:
[TEMPEL JAWABANKU]

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Simulasi Ujian Riyadhiyat Bahtsah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian.

Buatkan satu lembar ujian dari bab [SEBUTKAN BAB-BAB], soal dalam bahasa Arab berharakat + terjemah singkat:
1. Tiga atau empat السؤال dengan bobot درجة: pilihan ganda dan isian, soal hitungan, dan satu pembuktian.
2. Periksa ulang semua kunci jawabanmu sebelum memberikan soal.
3. JANGAN beri jawaban. Tunggu jawabanku seluruhnya, lalu nilai langkah demi langkah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian Matematika Murni",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang diujikan: [SEBUTKAN BAB-BAB]. Bantu aku bersiap:
1. Untuk tiap bab: tipe soal yang mungkin keluar dan satu contoh redaksi soal dalam bahasa Arab.
2. Strategi di ruang ujian: urutan mengerjakan, mengelola waktu, dan cara mengecek jawaban.
3. Rencana 5 hari sebelum ujian.

Jangan mengklaim soal tertentu "pasti keluar".

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  {
    id: "riyadhiyat-tatbiq",
    name: "Riyadhiyat Tatbiqiyyah (Matematika Terapan)",
    nameArabic: "الرياضيات التطبيقية",
    arabic: "الرياضيات التطبيقية",
    description: "Matematika terapan — statistika, mekanika, dan aplikasi matematika untuk Tsanawi Ilmi",
    descriptionArabic: "دراسة الرياضيات التطبيقية من إحصاء وميكانيكا وتطبيقات عملية للمرحلة الثانوية العلمية",
    category: "tarikhi",
    jenjang: ["tsanawi"],
    jurusan: ["ilmi"],
    kitabUtama: [{ nama: "Ar-Riyadhiyyat At-Tatbiqiyyah", arabic: "الرياضيات التطبيقية", penulis: "Manhaj Al-Azhar" }],
    recommendedAI: [],
    prompts: {
      pahami: [
        {
          title: "Pahami Satu Bab Matematika Terapan",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan bab [SEBUTKAN BAB, mis. statistika, peluang, vektor, statika, dinamika] dengan contoh dunia nyata:
1. Istilah kunci dalam bahasa Arab (seperti buku Ma'had) + artinya, mis. الْوَسَطُ الْحِسَابِيُّ، الِاحْتِمَالُ، الْمُتَّجِهُ، الْقُوَّةُ.
2. Ide dasarnya dengan situasi nyata (data nilai kelas, benda di bidang miring, dsb.).
3. Rumus pokok, arti simbol, dan satuannya bila ada.
4. Dua contoh soal dikerjakan bertahap — periksa ulang hitunganmu sebelum menulis.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Statistika & Peluang dari Data Nyata",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Pakai data sederhana (mis. nilai 10 teman sekelas) untuk mengajariku:
1. Ukuran pemusatan (mean, median, modus) dan ukuran penyebaran (jangkauan, simpangan baku) — hitung bertahap dari data itu.
2. Cara membaca tabel frekuensi dan diagram.
3. Peluang kejadian sederhana dan peluang gabungan, dengan contoh.

Istilah Arab berharakat + artinya. Periksa ulang semua hitungan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Mekanika: Gaya, Vektor & Keseimbangan",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan mekanika di muqarrar-ku ([SEBUTKAN BAB, mis. penjumlahan vektor, keseimbangan benda, gerak lurus]):
1. Cara menggambar diagram gaya dan menguraikan vektor.
2. Syarat keseimbangan dan cara menyusun persamaannya.
3. Satu soal dikerjakan bertahap: gambar → uraikan → susun persamaan → hitung → cek satuan.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Lembar Rumus Statistika & Mekanika",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Buatkan lembar rumus untuk bab [SEBUTKAN BAB-BAB]:
1. Tabel: rumus | nama Arab | arti simbol | satuan | kapan dipakai.
2. Kelompokkan: statistika, peluang, dan mekanika.
3. Lalu uji aku 8 soal cepat: kamu beri situasi nyata, aku pilih rumusnya. Satu per satu, tunggu jawabanku.

Periksa ulang setiap rumus sebelum menulis.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Latihan Matematika Terapan",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang diujikan: [SEBUTKAN BAB-BAB]. Buatkan jadwal latihan sampai ujian:
1. Tiap sesi: 10 menit rumus, 25 menit soal (statistika dengan data, mekanika dengan diagram), 5 menit mencatat kesalahan.
2. Jadwal ulang H+1, H+3, H+7.
3. Satu sesi simulasi ujian berwaktu.

Format: tabel (hari | bab | kegiatan | durasi).

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Soal Terapan Bertingkat",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab [SEBUTKAN BAB], beri 6 soal terapan dalam bahasa Arab berharakat + terjemah singkat: 2 mudah, 2 sedang, 2 sulit (dengan data atau diagram yang dijelaskan dengan kata-kata).
1. Satu soal sekali jalan. JANGAN beri jawaban. Tunggu jawabanku.
2. Koreksi langkahku, termasuk diagram gaya atau tabel data yang kususun.
3. Periksa ulang kunci jawabanmu sendiri sebelum menilai.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Bedah Soal Terapan yang Aku Salah (Aku Tempel, AI Periksa)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Aku salah mengerjakan soal terapan di bawah. Bantu aku:
1. Temukan langkah pertama yang keliru: salah membaca data, salah menggambar gaya, salah rumus, atau salah hitung.
2. Tunjukkan cara yang benar, langkah demi langkah.
3. Beri satu soal mirip untuk kucoba ulang. JANGAN beri jawabannya. Tunggu jawabanku.

Soal dan jawabanku:
[TEMPEL JAWABANKU]

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Simulasi Ujian Riyadhiyat Tathbiqiyyah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian.

Buatkan satu lembar ujian dari bab [SEBUTKAN BAB-BAB], soal dalam bahasa Arab berharakat + terjemah singkat:
1. Tiga atau empat السؤال dengan bobot درجة: soal statistika dengan tabel data, soal peluang, dan soal mekanika dengan diagram yang dijelaskan dengan kata-kata.
2. Periksa ulang semua kunci jawabanmu sebelum memberikan soal.
3. JANGAN beri jawaban. Tunggu jawabanku seluruhnya, lalu nilai langkah demi langkah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian Matematika Terapan",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Ma'had Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang diujikan: [SEBUTKAN BAB-BAB]. Bantu aku bersiap:
1. Untuk tiap bab: tipe soal yang mungkin keluar dan satu contoh redaksi soal dalam bahasa Arab.
2. Kesalahan yang paling sering terjadi (membaca data, arah gaya, satuan) dan cara menghindarinya.
3. Rencana 5 hari sebelum ujian.

Jangan mengklaim soal tertentu "pasti keluar".

[METODE]

[LEVEL_BAHASA]`,
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
