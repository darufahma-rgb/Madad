import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from 'react';
/* Talqih — Maddah Data Structure
   51 mata kuliah S1 Al-Azhar + 17 maddah Ma'had.
   Prompt 3B: Semua 33 Maddah skeleton diisi lengkap.
*/

const MADDAH_CATEGORIES = [
  { id: "mahad",    label: "Ma'had Al-Azhar",             arabic: "المعهد الأزهري",      color: "green"  },
  { id: "qurani",   label: "Quran & Tafsir",              arabic: "القرآن والتفسير",     color: "violet" },
  { id: "haditsi",  label: "Hadits & Mustholah",          arabic: "الحديث والمصطلح",     color: "violet" },
  { id: "fiqhi",    label: "Fiqh & Ushul",                arabic: "الفقه والأصول",       color: "gold" },
  { id: "aqdi",     label: "Aqidah & Pemikiran",          arabic: "العقيدة والفكر",      color: "violet" },
  { id: "lughawi",  label: "Lughah Arabiyah",             arabic: "اللغة العربية",       color: "gold" },
  { id: "tarikhi",  label: "Tarikh, Dakwah & Tarbiyah",  arabic: "التاريخ والدعوة",     color: "violet" },
];

const MADDAH_PROMPT_KINDS = [
  { id: "pahami",     label: "Pahami Konsep",        icon: "lightbulb",     desc: "Untuk memahami materi baru atau konsep yang belum jelas" },
  { id: "hafal",      label: "Hafalan",               icon: "refresh",       desc: "Drill matan, mnemonic, dan jadwal murajaah" },
  { id: "latihan",    label: "Latihan & Drill",       icon: "target",        desc: "Soal latihan dengan tingkat bertahap" },
  { id: "ujian",      label: "Persiapan Ujian",       icon: "fileText",      desc: "Mock Tahriri & Syafawi, gaya soal Azhari" },
  { id: "talaqqi",    label: "Review Pasca-Talaqqi",  icon: "messageSquare", desc: "Review materi setelah talaqqi dengan syaikh" },
  { id: "eksplorasi", label: "Eksplorasi Mendalam",   icon: "compass",       desc: "Khilaf ulama, syawahid, aplikasi praktis" },
];

const MADDAHS = [

  /* ============================================================
     3 MADDAH LENGKAP (dari Prompt 3A)
     ============================================================ */

  {
    id: "tafsir-tahlili",
    name: "Tafsir Tahlili",
    nameArabic: "التفسير التحليلي",
    category: "qurani",
    fakultas: ["ushuluddin", "dirasat", "dirasat-banin", "quran"],
    jurusan: ["dirasat_ushuluddin"],
    tingkat: ["3", "4", "pasca"],
    description: "Tafsir analitik per ayat — membahas asbabun nuzul, mufradat, balaghah, kaidah ushul yang relate, dan hubungan antar ayat. Pendekatan klasik mufassirin seperti Imam Thabari, Ibnu Katsir, Az-Zamakhsyari.",
    descriptionArabic: "التفسير الذي يتناول الآيات آية آية مع بيان أسباب النزول والمفردات والإعراب",
    kitabUtama: [
      { nama: "Tafsir Ibnu Katsir",   arabic: "تفسير ابن كثير",   penulis: "Ibnu Katsir" },
      { nama: "At-Tafsir Al-Munir",   arabic: "التفسير المنير",   penulis: "Wahbah Az-Zuhaili" },
      { nama: "Mafatih Al-Ghaib",     arabic: "مفاتيح الغيب",     penulis: "Fakhruddin Ar-Razi" },
    ],
    recommendedAI: [
      { tool: "claude",      rank: 1, strength: "Navigasi teks Arab panjang, komparasi multi-tafsir",  why: "Tafsir Tahlili butuh AI yang bisa pegang konteks panjang (1 ayat bisa dibahas 5-10 halaman). Claude excel di sini, plus paham nuansa balaghah Qur'an." },
      { tool: "perplexity",  rank: 2, strength: "Cross-reference pendapat mufassir",                   why: "Saat butuh verifikasi pendapat Ibnu Katsir vs Az-Zamakhsyari vs mufassir kontemporer, Perplexity bagus untuk cek sumber primer." },
    ],
    tutorial: {
      overview: "Cara pakai AI untuk Tafsir Tahlili — dari ayat sampai pemahaman utuh.",
      steps: [
        { title: "Siapkan ayat & konteks",       body: "Tulis ayat lengkap dengan harakat. Sebutkan surah dan nomor ayat. Kalau memungkinkan, sebutkan juga bab/maudhu' yang sedang dipelajari." },
        { title: "Mulai dengan mufradat",         body: "Minta AI jelasin kata-kata kunci dulu (mufradat). Jangan langsung minta tafsir lengkap — itu overwhelm." },
        { title: "Lanjut ke i'rab & balaghah",   body: "Setelah paham kata, baru tanya i'rab kalimat dan keindahan balaghah-nya (kalau ada)." },
        { title: "Minta perbandingan tafsir",    body: "Tanya: 'Bagaimana mufassir klasik (Ibnu Katsir, Thabari) dan kontemporer (Quthb, Az-Zuhaili) memahami ayat ini?'" },
        { title: "Tutup dengan refleksi",        body: "Minta AI bantu kamu identifikasi: apa pelajaran utama dari ayat ini? Apa yang bisa diaplikasikan?" },
      ],
    },
    prompts: {
      pahami: [
        {
          title: "Pahami Metode Tafsir Tahlili",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan apa itu tafsir tahlili (analitis) & cara kerjanya:
1. Definisi tafsir tahlili + bedanya dengan tafsir maudhu'i, ijmali, muqaran.
2. Langkah-langkah menafsir tahlili: makna mufradat → munasabah → asbab nuzul → i'rab → balaghah → istinbath hukum/faedah.
3. Kitab tafsir tahlili rujukan (mis. Jalalain, Baidhawi, Ibn Katsir) + karakter masing-masing.
4. Outline langkah agar bisa kuikuti tiap menafsir ayat.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Tafsir Tahlili Satu Ayat (Demonstrasi Lengkap)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Tafsirkan ayat [SEBUTKAN SURAT & NOMOR] secara tahlili lengkap:
1. Tulis ayatnya (teks Arab berharakat) — kalau kamu ragu redaksinya, minta aku tempel; jangan mengarang.
2. Makna mufradat (kata kunci) + arti.
3. Munasabah dengan ayat sebelum/sesudah.
4. Asbab nuzul bila ada (sebut riwayat; jika ragu, katakan).
5. Penjelasan makna global (ijmali) lalu rinci (tafshili).
6. Faedah/istinbath (hukum, akhlak, akidah).

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Munasabah & Keterkaitan Ayat",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan ilmu munasabah:
1. Definisi munasabah + jenisnya (antar ayat, antar surat, antar bagian ayat).
2. Faedah munasabah untuk memahami maksud ayat secara utuh.
3. Contoh munasabah pada ayat [SEBUTKAN].

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Sumber Tafsir (bil Ma'tsur & bir Ra'yi)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan sumber penafsiran:
1. Tafsir bil ma'tsur (Qur'an dgn Qur'an, dgn Sunnah, dgn qaul sahabat/tabi'in) — keutamaan & contoh.
2. Tafsir bir ra'yi (ijtihad) — syarat diterima & yang tercela.
3. Sikap terhadap israiliyyat.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Langkah-Langkah Tafsir Tahlili",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal urutan langkah tafsir tahlili sebagai checklist:
1. Susun langkah berurutan (mufradat → munasabah → asbab → i'rab → balaghah → istinbath).
2. Mnemonic untuk mengingat urutannya.
3. Kata kunci tiap langkah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Hafal Mufradat & Istilah Tafsir",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari ayat/surat [SEBUTKAN], buatkan daftar mufradat (gharib Qur'an) untuk dihafal:
1. Kata Arab berharakat + makna dalam konteks ayat.
2. Tandai kata yang maknanya beda dari makna umum.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Tafsir",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Surat/ayat yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah H+1, H+3, H+7, mingguan + cara uji (sebut makna, faedah, istinbath). Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Tafsir Mandiri (Aku Coba, AI Koreksi)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Aku akan mencoba menafsir ayat [SEBUTKAN] secara tahlili dengan kemampuanku (kutulis di bawah).
1. Koreksi tafsirku: mana yang tepat, mana yang keliru/kurang.
2. Tunjukkan langkah tahlili yang terlewat.
3. Lengkapi dengan rujukan mu'tabar (jika ragu, katakan).

[METODE]

[LEVEL_BAHASA]

Tafsirku: [TEMPEL]`,
        },
        {
          title: "Drill Soal Istinbath dari Ayat",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 6 ayat (sebut surat & nomor). Tugasku: sebutkan faedah/istinbath tiap ayat.
1. JANGAN beri jawaban dulu.
2. Setelah aku jawab, koreksi + tambahkan faedah yang terlewat.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Analisis Mufradat & I'rab Ayat",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk ayat [SEBUTKAN], tugasku menganalisis mufradat & i'rab kata kuncinya.
1. JANGAN beri jawaban dulu.
2. Setelah aku jawab, koreksi makna & i'rab-ku.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Tahriri Tafsir (Gaya Azhari)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian tulis Tafsir Tahlili gaya Azhar untuk surat/bagian [SEBUTKAN]:
1. Tipe khas: fassir qaulahu ta'ala..., istanbith al-fawa'id, ma ma'na..., udzkur al-munasabah.
2. 5-6 soal bobot bervariasi.
3. JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih + skor & catatan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Imtihan Syafawi Tafsir",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan syafawi.

Berperanlah sebagai mumtahin syafawi:
1. Minta aku tafsirkan ayat, sebut makna mufradat, faedah secara lisan.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik, naikkan kesulitan.
4. Penilaian akhir + area lemah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian Tafsir",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari surat/bagian yang kupelajari ([SEBUTKAN]): ayat yang sering jadi soal tafsir & istinbath, cara menulis jawaban tafsir yang lengkap (makna + munasabah + faedah), prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi Tafsir",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi tafsir-ku berantakan (di bawah). Rapikan jadi: ayat → makna → faedah, lengkapi harakat, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
        {
          title: "Verifikasi Pemahaman Pasca-Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Setelah talaqqi tafsir ayat [SEBUTKAN], aku jelaskan ulang (di bawah). Periksa keakuratan, koreksi, ajukan 3 pertanyaan penguji.

[METODE]

[LEVEL_BAHASA]

Penjelasanku: [TEMPEL]`,
        },
      ],
      eksplorasi: [
        {
          title: "Bandingkan Penafsiran antar Mufassir",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk ayat [SEBUTKAN], bandingkan penafsiran beberapa mufassir (mis. Jalalain, Ibn Katsir, Razi, Qurthubi):
1. Poin penekanan masing-masing.
2. Perbedaan penafsiran bila ada + sebabnya.
PENTING: kalau tidak yakin isi tafsir tertentu, katakan; jangan mengarang nukilan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Gali Faedah Tarbawi & Dakwah dari Ayat",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari ayat [SEBUTKAN], gali sisi yang bisa kupakai untuk tarbiyah/dakwah:
1. Pelajaran akhlak/tarbawi.
2. Hikmah praktis untuk kehidupan.
3. Cara menyampaikannya agar mengena.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Ayat Ahkam: Istinbath Hukum dari Ayat",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk ayat ahkam [SEBUTKAN]:
1. Hukum yang diistinbath dari ayat.
2. Cara ulama mengambil hukum (dilalah ayat).
3. Khilaf penafsiran hukum bila ada + sebabnya.
PENTING: sebut sumber; jangan mengarang.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  {
    id: "nahwu",
    name: "Nahwu",
    nameArabic: "النحو",
    category: "lughawi",
    fakultas: ["ushuluddin", "syariah", "lughah", "dirasat", "dirasat-banin", "quran"],
    jurusan: ["dirasat_lughah"],
    tingkat: ["mustawa", "1", "2", "3", "4"],
    description: "Ilmu yang mempelajari kaidah penyusunan kalimat Arab — i'rab, kedudukan kata, hukum jumlah ismiyyah dan fi'liyyah. Pondasi semua ilmu syar'i.",
    descriptionArabic: "علم يبحث في قواعد تركيب الجملة العربية وإعرابها",
    kitabUtama: [
      { nama: "Al-Ajurrumiyyah",     arabic: "الآجرومية",        penulis: "Ibnu Ajurrum" },
      { nama: "Alfiyah Ibnu Malik",  arabic: "ألفية ابن مالك",   penulis: "Ibnu Malik" },
      { nama: "Qatr An-Nada",        arabic: "قطر الندى",         penulis: "Ibnu Hisyam" },
      { nama: "Syarh Ibnu 'Aqil",   arabic: "شرح ابن عقيل",      penulis: "Ibnu 'Aqil" },
    ],
    recommendedAI: [
      { tool: "notebooklm", rank: 1, strength: "Hafal kaidah, drill matan, parsing kitab",     why: "Nahwu butuh hafalan matan klasik. NotebookLM bisa di-upload Alfiyah/Ajurrumiyyah lalu drill berdasarkan source — tidak halusinasi." },
      { tool: "claude",     rank: 2, strength: "I'rab kalimat, syarah ibarah klasik",           why: "Claude excellent parsing kalimat Arab berharakat, analisis i'rab kompleks, dan menjelaskan ibarah kitab klasik dengan akurat." },
    ],
    tutorial: {
      overview: "Cara pakai AI untuk Nahwu — dari kaidah sampai i'rab kompleks.",
      steps: [
        { title: "Pilih AI sesuai kebutuhan",    body: "Mau hafal matan? Pakai NotebookLM dengan upload PDF kitab. Mau i'rab? Pakai Claude untuk parsing kalimat." },
        { title: "Tulis kalimat dengan harakat", body: "Selalu tulis kalimat Arab dengan harakat lengkap saat minta i'rab. Ini critical untuk akurasi AI." },
        { title: "Tanya bertahap",               body: "Jangan langsung 'jelaskan bab x lengkap'. Mulai dari definisi → tanda → contoh → aplikasi." },
        { title: "Verifikasi dengan kitab",      body: "Setelah AI jawab, cek dengan Alfiyah Ibnu Malik atau syarah-nya. AI bisa salah kutip bait Alfiyah." },
      ],
    },
    prompts: {

      pahami: [
        {
          title: "Peta Besar Ilmu Nahwu (Marfu'at, Manshubat, Majrurat)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku peta besar (kharitah) ilmu Nahwu agar aku punya kerangka utuh sebelum masuk detail:
1. Tiga kelompok i'rab utama: al-marfu'at, al-manshubat, al-majrurat — apa saja anggota tiap kelompok (sertakan istilah Arab berharakat + arti).
2. Untuk tiap anggota, satu kalimat penjelas fungsinya.
3. Tampilkan dalam bentuk pohon/outline bercabang agar mudah kuhafal strukturnya.
4. Tunjukkan mana yang paling sering keluar di teks kitab turats.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Konsep I'rab dan Bina secara Tuntas",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan fondasi i'rab dan bina:
1. Definisi i'rab (إعراب) dan bina (بناء) dengan teks Arab berharakat + arti.
2. Tanda-tanda i'rab asli (harakat) dan pengganti (huruf/hadzf) — beserta kapan dipakai.
3. Kata yang mu'rab vs mabni: isim, fi'il, harf — mana yang mana dan kenapa.
4. Contoh satu kalimat, lalu i'rab tiap katanya sebagai demonstrasi.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Bedah Masalah Sulit: Isytighal, Tanazu', dan Naib Fa'il",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Aku kesulitan di bab-bab nahwu yang rumit. Jelaskan satu per satu dengan bahasa sederhana + contoh berharakat:
1. Al-Isytighal (الاشتغال) — apa kaidahnya, kapan wajib/boleh nashab.
2. At-Tanazu' (التنازع) — saat dua amil berebut satu ma'mul.
3. Naib al-Fa'il (نائب الفاعل) — perubahan fi'il ma'lum ke majhul.
Untuk tiap bab: definisi, kaidah inti, 2 contoh, dan kesalahan umum thalib.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Perbedaan Pendapat Bashrah vs Kufah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan perbedaan dua madrasah nahwu (madzhab Bashrah & Kufah) untuk topik [SEBUTKAN TOPIK, mis. amal "kana", i'rab fi'il mudhari']:
1. Pendapat masing-masing madrasah + alasannya (illat).
2. Pendapat yang dipegang mayoritas/dipakai di kurikulum Azhar.
3. Kenapa perbedaan ini penting dipahami saat membaca syarah.
Sertakan istilah Arab berharakat dan rujukan kitab bila kamu tahu (jika tidak yakin, katakan terus terang).

[METODE]

[LEVEL_BAHASA]`,
        },
      ],

      hafal: [
        {
          title: "Hafal Matan Alfiyah per Bab dengan Pemahaman",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH] dari Alfiyah Ibn Malik.

Bantu aku menghafal bait Alfiyah untuk bab [SEBUTKAN BAB]:
1. Tampilkan bait-baitnya (kalau kamu tahu persis; kalau ragu teksnya, katakan dan minta aku tempel).
2. Pecah tiap bait jadi makna per potong agar hafalanku berbasis paham, bukan beo.
3. Beri jembatan keledai/asosiasi untuk bait yang sulit.
4. Tandai kata kunci tiap bait yang jadi inti kaidah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Tabel Tanda I'rab untuk Dihafal",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Buatkan tabel hafalan tanda-tanda i'rab yang ringkas:
1. Kolom: jenis kata (isim mufrad, jamak taksir, jamak mudzakkar salim, jamak muannats salim, mutsanna, asma' khamsah, af'al khamsah, fi'il mu'tal akhir).
2. Baris: rafa', nashab, jar/jazm — tanda masing-masing (berharakat).
3. Beri 1 contoh kata per sel.
4. Tandai yang paling sering jadi jebakan di ujian.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Kaidah Nahwu",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Aku sudah belajar bab-bab nahwu berikut: [SEBUTKAN BAB-BAB]. Buatkan jadwal muraja'ah:
1. Urutkan bab dari yang paling fundamental ke turunannya.
2. Jadwal pengulangan H+1, H+3, H+7, mingguan.
3. Untuk tiap sesi, sebutkan cara mengujinya (i'rab kalimat, sebut kaidah, dll).
4. Sajikan sebagai tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],

      latihan: [
        {
          title: "10 Soal I'rab Bertingkat",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 10 kalimat Arab berharakat untuk di-i'rab, bertingkat dari mudah ke sulit, fokus bab [SEBUTKAN BAB atau "campuran"]:
1. Nomori dan beri harakat penuh.
2. JANGAN beri jawaban dulu — aku akan i'rab sendiri.
3. Setelah aku menjawab, koreksi i'rab-ku kata per kata dan jelaskan yang salah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Tashhih Khata' (Perbaiki Kalimat Salah)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 8 kalimat Arab yang mengandung kesalahan nahwu (khata' nahwi) yang umum dilakukan thalib:
1. Tulis kalimat berharakat dengan kesalahannya.
2. Aku akan menemukan & memperbaikinya sendiri.
3. Setelah aku jawab, tunjukkan kesalahan persisnya, perbaikan, dan kaidah yang dilanggar.
Variasikan jenis kesalahan (i'rab, kesesuaian, idhafah, dll).

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Tarkib (Susun Kalimat dari Kaidah)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Latih aku menyusun kalimat (tarkib) menerapkan kaidah [SEBUTKAN KAIDAH, mis. kana wa akhawatuha, inna wa akhawatuha]:
1. Beri 6 instruksi (mis. "buat jumlah dengan inna + khabar jar majrur").
2. Aku susun kalimatnya berharakat.
3. Koreksi hasilku, tunjukkan benar/salahnya dan kenapa.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],

      ujian: [
        {
          title: "Mock Imtihan Tahriri Gaya Azhari",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan imtihan tahriri.

Buatkan satu set soal ujian tulis (tahriri) Nahwu bergaya Azhar untuk bab [SEBUTKAN BAB / "semester ini"]:
1. Sertakan tipe soal khas Azhar: a'rib ma tahta khat (i'rab kata bergaris bawah), 'allil (jelaskan illat), istakhrij (temukan dari teks), tsm akmil/shahhih.
2. Buat 5-6 soal dengan bobot bervariasi.
3. JANGAN beri jawaban dulu. Tunggu jawabanku, lalu nilai seperti mushahhih Azhar + beri skor & catatan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Imtihan Syafawi (Tanya-Jawab Lisan)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan imtihan syafawi.

Berperanlah sebagai mumtahin (penguji) syafawi Nahwu di Azhar:
1. Ajukan pertanyaan lisan satu per satu (definisi, i'rab spontan, illat kaidah, syawahid).
2. Tunggu jawabanku tiap pertanyaan sebelum lanjut.
3. Beri umpan balik singkat ala penguji, lalu naikkan kesulitan bertahap.
4. Di akhir, beri penilaian kesiapanku dan area yang perlu diperkuat.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Prediksi & Kisi-kisi Soal Nahwu",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab-bab yang kupelajari semester ini ([SEBUTKAN BAB-BAB]), bantu aku menyusun strategi ujian:
1. Bab mana yang paling sering jadi soal i'rab dan ta'lil di Azhar.
2. Tipe soal yang paling mungkin keluar + contoh formatnya.
3. Kesalahan yang paling sering menurunkan nilai thalib.
4. Prioritas belajar H-7 sebelum ujian.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],

      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi Nahwu",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Aku baru talaqqi dengan syaikh dan punya catatan berantakan (kutempel di bawah). Bantu aku:
1. Rapikan jadi poin-poin kaidah yang terstruktur.
2. Lengkapi istilah Arab berharakat yang mungkin kutulis tanpa harakat.
3. Tandai bagian yang kelihatannya belum lengkap/perlu kutanyakan lagi.
4. Buat ringkasan 5 poin inti dari sesi ini.

[METODE]

[LEVEL_BAHASA]

Catatanku:
[TEMPEL CATATAN]`,
        },
        {
          title: "Verifikasi Pemahaman Setelah Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Setelah talaqqi bab [SEBUTKAN BAB], aku ingin memastikan pemahamanku benar:
1. Aku akan jelaskan ulang kaidah yang kupelajari dengan bahasaku (kutempel di bawah).
2. Periksa apakah pemahamanku akurat — koreksi yang keliru dengan rujukan + teks Arab berharakat.
3. Ajukan 3 pertanyaan untuk menguji apakah pemahamanku benar-benar mantap.

[METODE]

[LEVEL_BAHASA]

Penjelasanku: [TEMPEL]`,
        },
      ],

      eksplorasi: [
        {
          title: "Telusuri Syawahid (Bukti dari Al-Qur'an, Hadits, Syi'r)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk kaidah [SEBUTKAN KAIDAH], bantu aku memahami syawahid (bukti-bukti) klasiknya:
1. Syahid dari Al-Qur'an (sebutkan ayat + surat, jelaskan wajh istisyhad).
2. Syahid dari syi'r Arab (kalau kamu tahu baitnya; jika ragu, katakan).
3. Bagaimana ulama nahwu memakai syahid ini untuk menetapkan kaidah.
PENTING: jangan mengarang ayat/bait. Jika tidak yakin, sebutkan ketidakyakinanmu.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Aplikasi Nahwu untuk Membaca Kitab Turats",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Aku ingin nahwu-ku berguna untuk membaca kitab gundul (turats). Dari potongan teks yang kutempel:
1. Beri harakat lengkap pada teks.
2. I'rab kata-kata kunci yang menentukan makna.
3. Tunjukkan bagaimana pemahaman nahwu mengubah/menentukan makna kalimat.
4. Tandai struktur nahwu yang sering muncul di kitab turats agar aku kenali lain kali.

[METODE]

[LEVEL_BAHASA]

Teks: [TEMPEL TEKS GUNDUL]`,
        },
        {
          title: "Hubungkan Nahwu dengan Balaghah & Makna",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan bagaimana pilihan nahwu memengaruhi makna dan balaghah, untuk fenomena [SEBUTKAN, mis. taqdim-ta'khir, hadzf, iltifat]:
1. Apa kaidah nahwunya.
2. Bagaimana penyimpangan dari urutan asli membawa makna balaghi (mis. taqdim untuk ikhtishash).
3. Contoh dari Al-Qur'an bila ada (sebut ayatnya, jangan mengarang).
4. Kenapa ini penting untuk tafsir & pemahaman teks.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],

    }
  },

  {
    id: "ushul-fiqh",
    name: "Ushul Fiqh",
    nameArabic: "أصول الفقه",
    category: "fiqhi",
    fakultas: ["ushuluddin", "syariah", "dirasat", "dirasat-banin"],
    jurusan: ["dirasat_syariah"],
    tingkat: ["2", "3", "4", "5", "pasca"],
    description: "Ilmu yang membahas dalil-dalil syar'i dan kaidah-kaidah istinbat hukum dari dalil tersebut. Pondasi semua ijtihad fiqhi.",
    descriptionArabic: "علم القواعد التي يتوصل بها إلى استنباط الأحكام الشرعية من أدلتها التفصيلية",
    kitabUtama: [
      { nama: "Al-Waraqat",     arabic: "الورقات",       penulis: "Imam Al-Juwayni" },
      { nama: "Lubbul Ushul",   arabic: "لب الأصول",     penulis: "Zakariya Al-Anshari" },
      { nama: "Jam'ul Jawami'", arabic: "جمع الجوامع",   penulis: "Tajuddin As-Subki" },
      { nama: "Al-Mustashfa",   arabic: "المستصفى",      penulis: "Imam Al-Ghazali" },
    ],
    recommendedAI: [
      { tool: "claude",      rank: 1, strength: "Analisis kaidah, navigasi kitab ushul, jadal antar madzhab", why: "Ushul Fiqh punya banyak istilah teknis dan struktur logis yang complex. Claude excel di reasoning bertingkat dan komparasi madzhab." },
      { tool: "notebooklm",  rank: 2, strength: "Drill matan Al-Waraqat, navigasi syarah",                   why: "Untuk hafal matan dan drill dengan source kitab, NotebookLM aman dari halusinasi." },
    ],
    tutorial: {
      overview: "Cara pakai AI untuk Ushul Fiqh — dari kaidah sampai aplikasi.",
      steps: [
        { title: "Identifikasi bab",               body: "Ushul Fiqh punya 4 bab utama: Mashadir (sumber), Dalalat (cara dalil tunjuk), Ijtihad, dan Hukum Syar'i. Identifikasi bab dulu sebelum tanya AI." },
        { title: "Bedakan istilah dengan teliti",  body: "Banyak istilah ushul mirip tapi beda (mis. 'illah vs hikmah, manthuq vs mafhum). Selalu minta AI jelaskan perbedaan." },
        { title: "Cek perbedaan madzhab",          body: "Hampir setiap masalah ushul ada khilaf antar madzhab. Selalu tanya komparasi Jumhur vs Hanafi vs Maliki vs Syafi'i vs Hanbali." },
        { title: "Aplikasi ke fiqh",               body: "Ushul tidak akan stick di kepala tanpa aplikasi. Selalu minta contoh aplikasi kaidah ushul ke masalah fiqh konkret." },
      ],
    },
    prompts: {
      pahami: [
        {
          title: "Peta Besar Ushul Fiqh",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri kerangka utuh Ushul Fiqh:
1. Definisi & tujuan ushul fiqh (beda dengan fiqh & qawa'id fiqhiyyah).
2. Pembagian besar: al-adillah (sumber), dilalat al-alfazh (cara teks menunjukkan hukum), al-ijtihad wat-taqlid, ta'arudh wat-tarjih.
3. Outline bercabang agar mudah dipahami.
4. Urutan belajar ideal.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Sumber Hukum (Adillah)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan al-adillah asy-syar'iyyah:
1. Muttafaq 'alaih: Qur'an, Sunnah, Ijma', Qiyas — definisi + kehujjahan tiap satu (teks Arab berharakat untuk istilah).
2. Mukhtalaf fih: istihsan, mashlahah mursalah, 'urf, sad adz-dzari'ah, dll — ringkas.
3. Urutan/hierarki dalil.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Dilalat Alfazh (Amr, Nahy, 'Am, Khas)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan dilalat al-alfazh yang inti:
1. Al-Amr (perintah) — apakah menunjukkan wajib? + kaidahnya.
2. An-Nahy (larangan) — apakah menunjukkan haram & fasad?
3. Al-'Am wal-Khas, Al-Mutlaq wal-Muqayyad, Al-Mujmal wal-Mubayyan.
Untuk tiap: definisi (teks Arab berharakat), kaidah, contoh dari nash.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Bedah Qiyas secara Tuntas",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan qiyas:
1. Definisi + rukun qiyas (ashl, far', 'illah, hukm ashl) — teks Arab berharakat + arti.
2. Cara menentukan 'illah (masalik al-'illah): nash, ijma', sabr wa taqsim, munasabah.
3. Satu contoh qiyas lengkap dari kitab ushul.
4. Kesalahan umum thalib memahami qiyas.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Kaidah Ushuliyyah Kunci",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal kaidah ushuliyyah penting (mis. الأمر يقتضي الوجوب, النهي يقتضي التحريم, العبرة بعموم اللفظ لا بخصوص السبب):
1. Daftar kaidah (teks Arab berharakat + arti).
2. Mnemonic/asosiasi tiap kaidah.
3. Contoh penerapan singkat.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Tabel Definisi Istilah Ushul",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Buatkan tabel hafalan istilah ushul untuk bab [SEBUTKAN]:
1. Kolom: istilah Arab berharakat | definisi ringkas | contoh.
2. Tandai istilah yang sering tertukar (mis. 'am vs mutlaq, mujmal vs mubham).

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Ushul",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah:
1. Urutkan dari fondasi (adillah) ke turunan (dilalat, ta'arudh).
2. H+1, H+3, H+7, mingguan.
3. Cara menguji (sebut kaidah + contoh penerapan).
4. Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Takhrij Furu' 'ala Ushul",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 6 kasus furu' (fiqh). Tugasku: tunjukkan kaidah ushul mana yang menjadi dasarnya.
1. Tulis kasusnya.
2. JANGAN beri jawaban dulu.
3. Setelah aku jawab, koreksi: kaidah ushul yang benar + cara penerapannya.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Analisis Nash (Amr/Nahy/'Am/Khas)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 8 potongan nash (ayat/hadits — teks Arab berharakat, sebut sumber, jangan mengarang). Tugasku: analisis dilalah-nya (amr/nahy/'am/khas/mutlaq/muqayyad).
1. JANGAN beri jawaban dulu.
2. Setelah aku jawab, koreksi + jelaskan kaidah dilalah-nya.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Identifikasi 'Illah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 6 contoh hukum yang ada qiyas-nya. Tugasku: tentukan 'illah-nya & maslak penetapannya.
1. JANGAN beri jawaban dulu.
2. Setelah aku jawab, koreksi: 'illah benar + masalik al-'illah yang dipakai.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Tahriri Ushul (Gaya Azhari)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian tulis Ushul gaya Azhar untuk bab [SEBUTKAN]:
1. Tipe khas: 'arrif + matsil, udzkur al-khilaf ma'a ad-dalil, tathbiq (terapkan kaidah ke kasus), bayyin wajh istidlal.
2. 5-6 soal bobot bervariasi.
3. JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih + skor & catatan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Imtihan Syafawi Ushul",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan syafawi.

Berperanlah sebagai mumtahin syafawi Ushul Fiqh:
1. Tanya definisi, khilaf + dalil, penerapan kaidah ke furu'.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik, naikkan kesulitan.
4. Penilaian akhir + area lemah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian Ushul",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab yang kupelajari ([SEBUTKAN]):
1. Bab yang paling sering jadi soal tathbiq & khilaf.
2. Tipe soal paling mungkin keluar.
3. Cara menjawab agar dapat nilai penuh (definisi + dalil + tathbiq).
4. Prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi Ushul",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku (di bawah) berantakan. Bantu:
1. Rapikan jadi poin kaidah + contoh + khilaf.
2. Lengkapi harakat istilah Arab.
3. Tandai yang perlu ditanyakan.
4. Ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
        {
          title: "Verifikasi Pemahaman Pasca-Talaqqi Ushul",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Setelah talaqqi bab [SEBUTKAN], aku jelaskan ulang (di bawah):
1. Periksa keakuratan, koreksi dengan teks Arab berharakat + contoh.
2. Ajukan 3 pertanyaan penguji yang menggali penerapan.

[METODE]

[LEVEL_BAHASA]

Penjelasanku: [TEMPEL]`,
        },
      ],
      eksplorasi: [
        {
          title: "Ta'arudh & Tarjih antar Dalil",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan ta'arudh wat-tarjih:
1. Apa itu ta'arudh al-adillah & syaratnya.
2. Cara penyelesaian: al-jam' wat-taufiq, naskh, tarjih, tasaqut — urutan & contoh.
3. Bagaimana ini dipakai saat dua nash tampak bertentangan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Hubungkan Ushul dengan Istinbath Nyata",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Ambil satu hukum fiqh [SEBUTKAN], lalu bedah proses istinbath-nya dari sisi ushul:
1. Dari dalil apa hukum ini diambil.
2. Kaidah ushul/dilalah apa yang dipakai.
3. Kalau ada qiyas, apa 'illah-nya.
Tujuan: melihat ushul bekerja secara nyata, bukan teori kosong.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Perbedaan Madrasah Ushul (Mutakallimin vs Fuqaha)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan dua metode penulisan ushul:
1. Thariqah al-Mutakallimin (Syafi'iyah) vs Thariqah al-Fuqaha (Hanafiyah) — ciri masing-masing.
2. Contoh kitab tiap metode (bila kamu tahu; jika ragu, katakan).
3. Kenapa penting tahu ini saat membaca kitab ushul berbeda.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    }
  },

  /* ============================================================
     BATCH 1 — QURANI & HADITSI (11 Maddah)
     ============================================================ */

  {
    id: "quran-tahfidz",
    name: "Al-Qur'an (Tahfidz & Tilawah)",
    nameArabic: "القرآن الكريم",
    category: "qurani",
    fakultas: ["ushuluddin", "dirasat", "dirasat-banin", "quran"],
    jurusan: ["dirasat_ushuluddin"],
    tingkat: ["1", "2", "3", "4", "pasca"],
    description: "Hafalan dan tilawah Al-Qur'an dengan tajwid yang benar. Persiapan tasmi', manajemen murajaah, dan penanganan mutasyabihat lafzhi.",
    descriptionArabic: "حفظ القرآن وتلاوته بالتجويد الصحيح",
    kitabUtama: [
      { nama: "Mushaf Madinah",           arabic: "المصحف المدني",               penulis: "Majma' Malik Fahd" },
      { nama: "At-Tibyan fi Adab Hamalatil Qur'an", arabic: "التبيان في آداب حملة القرآن", penulis: "Imam Nawawi" },
    ],
    recommendedAI: [
      { tool: "tarteel",    rank: 1, strength: "Koreksi tajwid real-time, drill hafalan interaktif",  why: "Tarteel mendengar bacaanmu langsung dan koreksi kalau ada kesalahan tajwid atau makhraj — spesialis hafalan dan tahsin Al-Qur'an, tidak ada AI lain yang bisa ini." },
      { tool: "notebooklm", rank: 2, strength: "Drill mutasyabihat, jadwal murajaah dari source",     why: "Upload mushaf atau daftar ayat mutasyabihat, lalu NotebookLM bisa drill tasmi' dari source yang tepat tanpa halusinasi teks ayat." },
      { tool: "gemini",     rank: 3, strength: "Cari audio murattil, tips tahsin tilawah",            why: "Gemini bisa browsing dan temukan referensi audio tilawah dari murattil tertentu untuk pendengar dan referensi tahsin." },
    ],
    tutorial: {
      overview: "AI bisa bantu sisi manajemen hafalan — bukan gantikan talaqqi musyafahah dengan guru.",
      steps: [
        { title: "Upload daftar mutasyabihat", body: "Buat dokumen berisi ayat-ayat yang mirip (mutasyabihat lafzhi) dan upload ke NotebookLM. Pakai sebagai bahan drill agar tidak salah di momen tasmi'." },
        { title: "Buat jadwal murajaah",       body: "Minta AI bantu susun jadwal spaced repetition sesuai jumlah hafalan yang dimiliki dan target murajaah harian." },
        { title: "Identifikasi titik rawan",   body: "Minta AI identifikasi tempat-tempat dalam surah yang sering keliru — permulaan juz, ayat setelah sajdah, tempat yang mirip dengan surah lain." },
        { title: "Tahsin tetap butuh guru",    body: "Untuk makhraj, sifat huruf, dan tajwid praktis, AI hanya bantu pemahaman teori. Latihan suara wajib dengan guru atau murattil rekaman." },
      ],
    },
    prompts: {
      pahami: [
        {
          title: "Pahami Strategi Menghafal Al-Qur'an",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu aku memahami strategi tahfidz yang efektif:
1. Prinsip hifzh jadid (hafalan baru) vs muraja'ah (mengulang).
2. Metode menghafal (per ayat, per halaman, talqin, tasmi').
3. Pentingnya konsistensi & kualitas bacaan (tajwid) sebelum hafal.
4. Kesalahan umum penghafal pemula.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Manajemen Hafalan & Muraja'ah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan sistem menjaga hafalan:
1. Beda muraja'ah hafalan dekat (qarib) & jauh (ba'id).
2. Cara membagi porsi: hafalan baru vs mengulang lama.
3. Cara mengatasi ayat-ayat mutasyabihat (mirip) yang sering tertukar.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Ayat Mutasyabihat (Mirip)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk surat/juz [SEBUTKAN], bantu aku dengan ayat-ayat mutasyabihat:
1. Identifikasi ayat yang mirip/berulang (sebut surat & nomor; jangan mengarang).
2. Tunjukkan perbedaan halus antar ayat mirip.
3. Tips mengingat pembeda agar tidak tertukar saat menghafal.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Adab & Keutamaan Penghafal Qur'an",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan:
1. Keutamaan menghafal Al-Qur'an (sebut dalil yang kamu yakin; jika ragu, katakan).
2. Adab penghafal terhadap Al-Qur'an.
3. Bahaya melupakan hafalan & cara menjaganya.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Rencana Hafalan Terjadwal",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Aku mau menghafal [SEBUTKAN TARGET, mis. juz 30, surat tertentu] dalam [SEBUTKAN WAKTU]. Buatkan rencana:
1. Pembagian hafalan harian yang realistis.
2. Jadwal muraja'ah agar tidak lupa.
3. Cara tasmi' (memperdengarkan) untuk verifikasi.
4. Sajikan sebagai tabel jadwal.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Teknik Mengikat Hafalan dengan Makna",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk ayat/surat [SEBUTKAN], bantu aku menghafal dengan memahami makna:
1. Terjemah & makna ringkas per ayat (agar hafalan berbasis paham).
2. Alur/tema yang menghubungkan ayat-ayat.
3. Tips visual/asosiasi untuk bagian yang sulit.
PENTING: gunakan ayat yang benar; jika ragu, minta aku tempel.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Hafalan",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Aku sudah hafal [SEBUTKAN]. Buatkan jadwal muraja'ah berbasis spaced repetition:
1. Bagi hafalan ke siklus muraja'ah harian & mingguan.
2. Prioritaskan hafalan baru & yang rentan lupa.
3. Tabel jadwal.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Drill Sambung Ayat",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Uji hafalanku surat/juz [SEBUTKAN] dengan latihan sambung ayat:
1. Beri potongan awal ayat, aku lanjutkan (atau sebaliknya).
2. JANGAN tampilkan lanjutannya dulu.
3. Setelah aku jawab, koreksi dari mushaf.
PENTING: pakai teks Qur'an yang benar; jika ragu, katakan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Tebak Posisi Ayat",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku potongan ayat dari [SEBUTKAN]. Tugasku: sebutkan surat & posisinya.
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.
PENTING: pakai ayat yang benar; jika ragu, katakan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Tasmi' Terstruktur",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu aku menyiapkan sesi tasmi' (setor hafalan):
1. Buat checklist persiapan sebelum tasmi'.
2. Tips mengurangi gugup & kesalahan saat setor.
3. Cara menandai & memperbaiki bagian yang sering salah.
(Untuk verifikasi bacaan suara, sarankan aku pakai Tarteel atau setor ke guru.)

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Simulasi Ujian Tahfidz",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan ujian hafalan.

Simulasikan ujian tahfidz untuk [SEBUTKAN]:
1. Beri pertanyaan model ujian (sambung ayat, sebut posisi, baca dari ayat tertentu).
2. JANGAN beri jawaban dulu.
3. Setelah aku jawab, koreksi & nilai kesiapan hafalanku.
PENTING: pakai teks yang benar; jika ragu, katakan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Strategi Menghadapi Ujian Hafalan",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu strategi ujian tahfidz:
1. Cara muraja'ah intensif H-7 sebelum ujian.
2. Bagian yang biasanya diuji & cara mengantisipasi.
3. Menjaga ketenangan & fokus saat setor di hadapan penguji.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Prioritas Muraja'ah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari hafalan yang kupunya ([SEBUTKAN]): bagian yang perlu prioritas muraja'ah, ayat mutasyabihat yang rawan, rencana H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Catat Koreksi dari Guru Tahfidz",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Setelah setor ke guru, aku punya catatan koreksi (di bawah). Bantu:
1. Rapikan jadi daftar bagian yang perlu diperbaiki.
2. Kelompokkan (kesalahan hafalan vs tajwid).
3. Buat rencana perbaikan untuk sesi berikutnya.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
        {
          title: "Verifikasi Hafalan Pasca-Setor",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk bagian [SEBUTKAN] yang baru kusetor:
1. Bantu aku susun daftar ayat yang masih goyah.
2. Beri latihan fokus untuk ayat-ayat itu.
3. Jadwalkan muraja'ah khusus untuknya.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      eksplorasi: [
        {
          title: "Tadabbur Ayat yang Dihafal",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk ayat/surat [SEBUTKAN] yang kuhafal, bantu aku tadabbur:
1. Makna & pelajaran tiap bagian.
2. Bagaimana tadabbur memperkuat hafalan sekaligus iman.
3. Pesan praktis untuk kehidupan.
PENTING: pakai ayat yang benar; jika ragu, minta aku tempel.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Hubungkan Hafalan dengan Tilawah Indah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan:
1. Bagaimana memadukan hafalan kuat dengan tilawah yang fasih & indah.
2. Peran tajwid & waqf dalam memperindah bacaan hafalan.
3. Sarankan praktik (talaqqi, aplikasi seperti Tarteel).

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Menjaga Hafalan Seumur Hidup",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan:
1. Sistem muraja'ah jangka panjang agar hafalan tidak hilang.
2. Cara mengintegrasikan muraja'ah ke ibadah harian (shalat, dll).
3. Mengembalikan hafalan yang sudah mulai pudar.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  {
    id: "tajwid",
    name: "Tajwid",
    nameArabic: "التجويد",
    category: "qurani",
    fakultas: ["ushuluddin", "dirasat", "dirasat-banin", "quran"],
    jurusan: ["dirasat_ushuluddin"],
    tingkat: ["1", "2", "3"],
    description: "Ilmu cara membaca Al-Qur'an dengan benar — makhorijul huruf, sifat huruf, hukum nun mati, mad, waqaf. Tajwid praktis wajib dengan guru; AI bantu sisi teori.",
    descriptionArabic: "علم يبحث في كيفية النطق بكلمات القرآن صحيحاً",
    kitabUtama: [
      { nama: "Tuhfatul Athfal",     arabic: "تحفة الأطفال",       penulis: "Sulaiman Al-Jamzuri" },
      { nama: "Matan Al-Jazariyyah", arabic: "متن الجزرية",         penulis: "Ibnul Jazari" },
      { nama: "Hidayatul Mustafid",  arabic: "هداية المستفيد",      penulis: "Muhammad Makki Nashr" },
    ],
    recommendedAI: [
      { tool: "notebooklm", rank: 1, strength: "Drill matan Tuhfatul Athfal & Jazariyyah", why: "Tajwid teori membutuhkan hafalan matan nazham. NotebookLM dengan file matan bisa dipakai drill tasmi' tanpa halusinasi teks." },
      { tool: "claude",     rank: 2, strength: "Penjelasan kaidah tajwid & contoh aplikasi", why: "Claude bagus untuk menjelaskan kaidah (mis. hukum idgham, iqlab) dengan contoh kata dari Al-Qur'an yang tepat." },
    ],
    tutorial: {
      overview: "Tajwid punya dua dimensi: teori (bisa dengan AI) dan praktik (wajib dengan guru).",
      steps: [
        { title: "Pahami teori dulu",              body: "Gunakan AI untuk memahami kaidah tajwid secara teori — hukum nun mati, mad, sifat huruf. Ini bisa dipelajari mandiri." },
        { title: "Praktik WAJIB dengan guru",      body: "Makhraj, sifat huruf, dan cara baca yang benar wajib talaqqi musyafahah langsung. AI tidak bisa menilai apakah bacaanmu sudah benar." },
        { title: "Hafal matan nazham",             body: "Tuhfatul Athfal dan Jazariyyah adalah matan pokok. Upload ke NotebookLM untuk drill hafalan dengan source yang akurat." },
        { title: "Latihan identifikasi hukum",    body: "Setelah paham teori, latih identifikasi hukum tajwid dari teks ayat. Claude bisa bantu koreksi analisismu." },
      ],
    },
    prompts: {
      pahami: [
        {
          title: "Peta Besar Ilmu Tajwid",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri kerangka utuh ilmu tajwid:
1. Definisi tajwid + hukum mempelajari & mengamalkannya.
2. Cabang: makharij al-huruf, shifat al-huruf, ahkam nun sukun & tanwin, ahkam mim sukun, mad, waqf-ibtida.
3. Outline bercabang.
4. Tujuan: membaca Qur'an sesuai bacaan yang diterima (talaqqi).

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Makharij & Shifat Huruf",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan makharij & shifat huruf:
1. Makharij (tempat keluar huruf): 5 tempat utama (jauf, halq, lisan, syafatain, khaisyum) + perincian.
2. Shifat al-huruf (sifat huruf): yang berlawanan (hams-jahr, dst) & yang tidak.
3. Bagaimana makhraj & sifat menentukan pelafalan benar.
Sertakan teks Arab istilah berharakat.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Hukum Nun Sukun, Tanwin & Mim Sukun",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan hukum bacaan:
1. Nun sukun & tanwin: izhar, idgham (bi ghunnah & bila ghunnah), iqlab, ikhfa' — definisi + huruf + contoh.
2. Mim sukun: izhar syafawi, idgham syafawi (mimi), ikhfa' syafawi.
3. Contoh tiap hukum (sebut ayat/kata; jangan mengarang).

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Hukum Mad & Pembagiannya",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan hukum mad:
1. Mad ashli (thabi'i) & mad far'i.
2. Jenis mad far'i (wajib muttashil, jaiz munfashil, 'aridh lis-sukun, lazim, dll) + panjang harakatnya.
3. Contoh tiap jenis (sebut kata/ayat; jangan mengarang).

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Makharij & Shifat dengan Sistematis",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal makharij & shifat:
1. Skema 5 makhraj + huruf di tiap makhraj.
2. Daftar shifat berlawanan & tunggal.
3. Mnemonic untuk mengingatnya.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Tabel Hukum Tajwid untuk Dihafal",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Buatkan tabel hafalan untuk bab [SEBUTKAN, mis. nun sukun, mad]:
1. Kolom: hukum | huruf/syarat | cara baca | contoh.
2. Tandai yang sering tertukar.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Tajwid",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah H+1, H+3, H+7, mingguan + cara uji (terapkan hukum saat membaca). Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Drill Terapkan Hukum Tajwid pada Ayat",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku potongan ayat (sebut surat & nomor; jangan mengarang). Tugasku: temukan & sebutkan hukum tajwid di dalamnya.
1. JANGAN beri jawaban dulu.
2. Setelah aku jawab, koreksi: hukum yang benar + letaknya.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Klasifikasi Hukum Bacaan",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 8 contoh kata/potongan. Tugasku: tentukan hukum tajwidnya (izhar/idgham/ikhfa'/mad/dll).
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Soal Definisi & Hukum",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal campuran (definisi, huruf, hukum, panjang mad) dari bab [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Tahriri (Gaya Azhari)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian tulis Tajwid gaya Azhar untuk bab [SEBUTKAN]:
1. Tipe khas: 'arrif, istakhrij al-ahkam min al-ayah, udzkur al-huruf, ma hukm... ma'a at-tamtsil.
2. 5-6 soal bobot bervariasi.
3. JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih + skor & catatan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Imtihan Syafawi (+ Tilawah)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan syafawi.

Berperanlah sebagai mumtahin syafawi tajwid:
1. Tanya definisi & hukum, atau minta aku sebutkan hukum pada potongan ayat.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik, naikkan kesulitan.
4. Penilaian akhir + area lemah.
(Untuk latihan tilawah suara, sarankan aku pakai aplikasi seperti Tarteel.)

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab yang kupelajari ([SEBUTKAN]): bab tersering jadi soal (biasanya istikhraj hukum dari ayat), cara jawab lengkap, prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi Tajwid",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (di bawah). Rapikan jadi: hukum → syarat → contoh, lengkapi harakat, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
        {
          title: "Verifikasi Pemahaman Pasca-Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Setelah talaqqi bab [SEBUTKAN], aku jelaskan ulang (di bawah). Periksa keakuratan, koreksi, ajukan 3 pertanyaan penguji.

[METODE]

[LEVEL_BAHASA]

Penjelasanku: [TEMPEL]`,
        },
      ],
      eksplorasi: [
        {
          title: "Tajwid & Keindahan Tilawah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan:
1. Hubungan tajwid dengan tahsin (memperindah bacaan).
2. Konsep maqamat tilawah secara umum.
3. Cara melatih bacaan agar fasih & indah (sarankan praktik dengan talaqqi/aplikasi).

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Tajwid Tingkat Lanjut (Gharaib & Waqf)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan topik tajwid lanjutan:
1. Gharaib al-Qur'an (bacaan khusus seperti saktah, imalah, tashil, naql) — sebut yang kamu yakin.
2. Hukum waqf & ibtida + tanda-tandanya.
3. Pentingnya talaqqi untuk bacaan khusus ini.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pentingnya Talaqqi & Sanad dalam Tajwid",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan:
1. Kenapa tajwid harus dipelajari lewat talaqqi (musyafahah), bukan hanya teori.
2. Konsep sanad bacaan & ijazah Qur'an.
3. Batasan belajar tajwid lewat teks/AI vs praktik langsung dengan guru.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  {
    id: "tafsir-maudhui",
    name: "Tafsir Maudhu'i",
    nameArabic: "التفسير الموضوعي",
    category: "qurani",
    fakultas: ["ushuluddin", "dirasat"],
    jurusan: ["dirasat_ushuluddin"],
    tingkat: ["3", "4", "pasca"],
    description: "Tafsir tematik — mengumpulkan semua ayat tentang satu tema, mengurutkan, dan menafsirkan secara komprehensif. Berbeda dari tafsir tahlili yang per-ayat.",
    descriptionArabic: "تفسير الآيات حسب الموضوعات الجامعة",
    kitabUtama: [
      { nama: "Al-Bidayah fit Tafsir Al-Maudhu'i", arabic: "البداية في التفسير الموضوعي", penulis: "Abdul Hayy Al-Farmawi" },
      { nama: "At-Tafsir Al-Maudhu'i",             arabic: "التفسير الموضوعي",           penulis: "Mushthafa Muslim" },
    ],
    recommendedAI: [
      { tool: "claude",      rank: 1, strength: "Kumpulkan & analisis ayat tematik lintas surah",  why: "Tafsir maudhu'i butuh AI yang bisa pegang banyak ayat sekaligus dan menganalisis perkembangan tema. Claude kuat di sintetis informasi lintas teks." },
      { tool: "perplexity",  rank: 2, strength: "Verifikasi ayat terkait tema yang mungkin terlewat", why: "Perplexity bisa membantu mencari ayat-ayat terkait tema yang mungkin belum terpikirkan, dengan referensi ke kitab tafsir." },
    ],
    tutorial: {
      overview: "Tafsir Maudhu'i berbeda dari Tahlili — ini lintas surah, bukan per ayat.",
      steps: [
        { title: "Tentukan tema dengan tepat",        body: "Pilih tema yang jelas batasannya (mis. 'Konsep Taqwa dalam Qur'an'). Tema yang terlalu luas akan menghasilkan analisis dangkal." },
        { title: "Kumpulkan semua ayat terkait",      body: "Minta AI bantu kumpulkan ayat-ayat yang membahas tema dari berbagai surah. Verifikasi ke Mu'jam Al-Mufahras." },
        { title: "Urutkan secara kronologis",         body: "Urutkan ayat berdasarkan makki-madani untuk melihat perkembangan konsep. AI bisa bantu identifikasi urutan nuzul." },
        { title: "Analisis & simpulkan",              body: "Setelah semua ayat terkumpul, analisis: apa yang dikatakan Qur'an tentang tema ini secara komprehensif?" },
      ],
    },
    prompts: {
      pahami: [
        {
          title: "Pahami Metode Tafsir Maudhu'i (Tematik)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan apa itu tafsir maudhu'i & cara kerjanya:
1. Definisi tafsir maudhu'i + bedanya dengan tafsir tahlili.
2. Dua jenis: maudhu'i per-tema (lintas surat) & maudhu'i per-surat.
3. Langkah metode tematik: tentukan tema → kumpulkan ayat terkait → susun sesuai nuzul/munasabah → analisis → simpulkan.
4. Outline langkah agar bisa kuikuti.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kajian Tematik Satu Tema (Demonstrasi)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Lakukan kajian tafsir maudhu'i untuk tema [SEBUTKAN TEMA, mis. sabar, syukur, riba]:
1. Kumpulkan ayat-ayat utama terkait tema (sebut surat & nomor; jangan mengarang ayat).
2. Kelompokkan ayat berdasarkan aspek tema.
3. Simpulkan pandangan Al-Qur'an secara utuh tentang tema itu.
4. Faedah praktis dari kajian ini.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Cara Mengumpulkan Ayat Setema",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Ajari aku teknik istiqra' (penelusuran) ayat untuk tema tertentu:
1. Cara mencari ayat lewat kata kunci (mu'jam mufahras) & turunannya.
2. Cara memastikan ayat benar-benar relevan dengan tema (bukan sekadar ada katanya).
3. Cara menangani ayat yang tampak bertentangan dalam satu tema.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Manfaat & Tokoh Tafsir Maudhu'i",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan:
1. Keunggulan metode maudhu'i untuk memahami pandangan Qur'an secara menyeluruh.
2. Tokoh & karya tafsir maudhu'i modern (bila kamu tahu; jika ragu, katakan).
3. Kaitan tafsir maudhu'i dengan dakwah & isu kontemporer.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Langkah Metode Tematik",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal langkah metode tafsir maudhu'i sebagai checklist:
1. Urutkan langkah berurutan.
2. Mnemonic untuk mengingatnya.
3. Kata kunci tiap langkah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Hafal Ayat Kunci per Tema",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk tema [SEBUTKAN], buatkan daftar ayat kunci untuk dihafal lokasinya:
1. Ayat + surat & nomor + inti makna.
2. Kelompokkan per aspek tema.
PENTING: sebut rujukan ayat dengan benar; jika ragu, katakan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Tafsir Maudhu'i",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Tema yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah H+1, H+3, H+7, mingguan + cara uji (sebut ayat kunci + kesimpulan tema). Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Kajian Tematik Mandiri (Aku Coba, AI Koreksi)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Aku akan mengkaji tema [SEBUTKAN] secara maudhu'i dengan kemampuanku (kutulis di bawah).
1. Koreksi: apakah ayat yang kukumpulkan tepat & lengkap, pengelompokanku logis, kesimpulanku akurat.
2. Tunjukkan ayat penting yang terlewat.
3. Lengkapi (jika ragu rujukan, katakan).

[METODE]

[LEVEL_BAHASA]

Kajianku: [TEMPEL]`,
        },
        {
          title: "Drill Hubungkan Ayat dengan Tema",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 6 ayat (sebut surat & nomor). Tugasku: tentukan tema utama tiap ayat & aspek apa yang ditekankan.
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Simpulkan Pandangan Qur'an",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku kumpulan ayat setema [SEBUTKAN]. Tugasku: susun kesimpulan menyeluruh pandangan Qur'an.
1. JANGAN beri kesimpulan dulu.
2. Koreksi kesimpulanku + tunjukkan aspek yang terlewat.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Tahriri (Gaya Azhari)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian tulis Tafsir Maudhu'i gaya Azhar untuk tema [SEBUTKAN]:
1. Tipe khas: ijma' al-ayat fi..., bayyin manhaj al-qur'an fi..., istanbith, qarin baina at-tahlili wal-maudhu'i.
2. 5-6 soal bobot bervariasi.
3. JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih + skor & catatan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Imtihan Syafawi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan syafawi.

Berperanlah sebagai mumtahin syafawi:
1. Minta aku jelaskan langkah maudhu'i, sebut ayat tema, simpulkan secara lisan.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik, naikkan kesulitan.
4. Penilaian akhir + area lemah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari tema yang kupelajari ([SEBUTKAN]): tema yang sering jadi soal, cara jawab lengkap (langkah + ayat + kesimpulan), prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (di bawah). Rapikan jadi: tema → ayat → kesimpulan, lengkapi rujukan ayat, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
        {
          title: "Verifikasi Pemahaman Pasca-Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Setelah talaqqi tema [SEBUTKAN], aku jelaskan ulang (di bawah). Periksa keakuratan rujukan ayat & kesimpulan, koreksi, ajukan 3 pertanyaan penguji.

[METODE]

[LEVEL_BAHASA]

Penjelasanku: [TEMPEL]`,
        },
      ],
      eksplorasi: [
        {
          title: "Tafsir Maudhu'i untuk Isu Kontemporer",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk isu kontemporer [SEBUTKAN, mis. lingkungan, ekonomi, sosial]:
1. Tema Qur'ani apa yang relevan.
2. Ayat-ayat yang bisa jadi landasan (sebut rujukan; jangan mengarang).
3. Bagaimana pandangan Qur'an menjawab isu itu.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Maudhu'i Per-Surat (Kajian Satu Surat Utuh)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk surat [SEBUTKAN], lakukan kajian maudhu'i per-surat:
1. Tema sentral (mihwar) surat.
2. Bagaimana bagian-bagian surat berputar di sekitar tema itu.
3. Tujuan & pesan utama surat.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Bandingkan dengan Tafsir Tahlili",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk tema/ayat [SEBUTKAN], bandingkan pendekatan maudhu'i vs tahlili:
1. Apa yang dihasilkan tiap metode.
2. Kelebihan & keterbatasan masing-masing.
3. Kapan sebaiknya pakai yang mana.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  {
    id: "ulum-quran",
    name: "'Ulum Al-Qur'an",
    nameArabic: "علوم القرآن",
    category: "qurani",
    fakultas: ["ushuluddin", "dirasat", "dirasat-banin", "quran"],
    jurusan: ["dirasat_ushuluddin"],
    tingkat: ["2", "3", "4", "pasca"],
    description: "Ilmu-ilmu yang berkaitan dengan Al-Qur'an — asbabun nuzul, makki-madani, nasikh-mansukh, mutasyabih, qiraat, i'jazul Qur'an, dan lainnya.",
    descriptionArabic: "العلوم المتعلقة بالقرآن الكريم",
    kitabUtama: [
      { nama: "Al-Itqan fi 'Ulumil Qur'an",    arabic: "الإتقان في علوم القرآن",    penulis: "As-Suyuthi" },
      { nama: "Manahilul 'Irfan",               arabic: "مناهل العرفان",             penulis: "Az-Zarqani" },
      { nama: "Mabahits fi 'Ulumil Qur'an",    arabic: "مباحث في علوم القرآن",     penulis: "Manna' Al-Qaththan" },
    ],
    recommendedAI: [
      { tool: "claude",      rank: 1, strength: "Navigasi topik-topik ulumul Qur'an, komparasi pendapat", why: "'Ulum Al-Qur'an mencakup banyak cabang ilmu. Claude bisa membantu menjelaskan setiap cabang dengan mendalam dan membandingkan pendapat ulama." },
      { tool: "notebooklm",  rank: 2, strength: "Drill definisi, klasifikasi, dan hafal poin kunci",       why: "Upload Al-Itqan atau Mabahits untuk drill definisi istilah dan klasifikasi dengan source yang akurat." },
    ],
    tutorial: {
      overview: "'Ulum Al-Qur'an adalah ilmu-ilmu yang mengelilingi Al-Qur'an — bukan isi tafsirnya langsung.",
      steps: [
        { title: "Pahami peta cabang ilmu",   body: "As-Suyuthi dalam Al-Itqan mencantumkan 80 jenis ulumul Qur'an. Pahami dulu yang pokok: asbabun nuzul, makki-madani, nasikh-mansukh, qiraat, i'jaz." },
        { title: "Pelajari per cabang",       body: "Jangan coba pelajari semuanya sekaligus. Fokus ke 1 cabang per sesi, pahami definisi, klasifikasi, contoh, dan manfaatnya untuk tafsir." },
        { title: "Hubungkan ke tafsir",       body: "Setiap cabang 'ulum Al-Qur'an punya fungsi dalam tafsir. Minta AI jelaskan: 'Apa manfaat memahami asbabun nuzul untuk memahami ayat X?'" },
        { title: "Hafalkan istilah kunci",    body: "Banyak istilah teknis dalam ulumul Qur'an. Gunakan NotebookLM untuk drill definisi dan klasifikasi dengan source kitab." },
      ],
    },
    prompts: {
      pahami: [
        {
          title: "Peta Besar 'Ulum Al-Qur'an",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri kerangka utuh 'Ulum Al-Qur'an sebelum masuk detail:
1. Cabang-cabang besar: nuzul Qur'an, makki-madani, asbab nuzul, jam' & tartib, rasm 'utsmani, muhkam-mutasyabih, nasikh-mansukh, qira'at, i'jaz.
2. Tujuan ilmu ini dan kaitannya dengan tafsir.
3. Tampilkan sebagai outline bercabang.
4. Urutan belajar yang ideal.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Makki & Madani secara Tuntas",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan bab Makki-Madani:
1. Definisi makki & madani (3 cara ulama mendefinisikan) + teks Arab istilah berharakat.
2. Ciri-ciri (dhawabith & khasha'ish) surat makki vs madani.
3. Faedah mengetahui makki-madani untuk tafsir & istinbath.
4. Contoh penerapan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Nasikh-Mansukh & Muhkam-Mutasyabih",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan dua bab yang sering membingungkan:
1. Nasikh-Mansukh: definisi, syarat naskh, jenis-jenisnya, contoh dari Al-Qur'an (sebut ayat, jangan mengarang).
2. Muhkam-Mutasyabih: definisi, sikap ulama terhadap mutasyabih, contoh.
Sertakan teks Arab istilah berharakat + arti.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Asbab An-Nuzul & Kaidahnya",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan asbab an-nuzul:
1. Definisi + cara mengetahuinya (harus dengan riwayat sahih, bukan ijtihad).
2. Kaidah "al-'ibrah bi 'umum al-lafzh la bi khusus as-sabab" — maksud & penerapan.
3. Faedah asbab nuzul untuk memahami ayat dengan benar.
4. Contoh kasus (sebut ayat & riwayatnya bila kamu tahu; jika ragu, katakan).

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Klasifikasi & Istilah 'Ulum Quran",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal istilah kunci bab [SEBUTKAN]:
1. Daftar istilah (teks Arab berharakat + arti).
2. Mnemonic/asosiasi tiap istilah.
3. Kelompokkan istilah yang berkaitan agar mudah diingat.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Tabel Ciri Makki-Madani untuk Dihafal",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Buatkan tabel hafalan ciri surat makki vs madani:
1. Kolom: aspek | ciri makki | ciri madani.
2. Sertakan contoh tema & gaya ayat.
3. Tandai ciri yang sering jadi soal.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah 'Ulum Quran",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah H+1, H+3, H+7, mingguan, dengan cara uji tiap sesi. Sajikan sebagai tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Drill Soal Definisi & Klasifikasi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal campuran (definisi, klasifikasi, faedah) dari bab [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Setelah aku jawab, koreksi + jelaskan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Analisis Ayat ('Ulum Quran Tatbiqi)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 5 ayat (teks Arab berharakat, sebut surat & nomor; jangan mengarang). Tugasku: analisis dari sisi 'ulum quran (makki/madani, ada asbab nuzul/tidak, dll).
1. JANGAN beri jawaban dulu.
2. Setelah aku jawab, koreksi analisisku.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Bandingkan Jawabanku dengan 'Ibarah Kitab",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Aku menulis jawaban untuk topik [SEBUTKAN] (di bawah). Bandingkan dengan redaksi baku kitab 'ulum quran:
1. Apakah tepat?
2. Istilah/redaksi yang seharusnya kupakai.
3. Yang kurang/keliru.

[METODE]

[LEVEL_BAHASA]

Jawabanku: [TEMPEL]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Tahriri (Gaya Azhari)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian tulis 'Ulum Quran gaya Azhar untuk bab [SEBUTKAN]:
1. Tipe khas: 'arrif, udzkur al-faedah, ma al-farq baina, matsil li.
2. 5-6 soal bobot bervariasi.
3. JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih + skor & catatan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Imtihan Syafawi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan syafawi.

Berperanlah sebagai mumtahin syafawi:
1. Tanya definisi, faedah, perbedaan istilah.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik, naikkan kesulitan.
4. Penilaian akhir + area lemah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab yang kupelajari ([SEBUTKAN]): bab tersering jadi soal, tipe soal yang mungkin keluar, cara jawab dapat nilai penuh, prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (di bawah). Rapikan jadi poin terstruktur, lengkapi harakat istilah, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
        {
          title: "Verifikasi Pemahaman Pasca-Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Setelah talaqqi bab [SEBUTKAN], aku jelaskan ulang (di bawah). Periksa keakuratan, koreksi, ajukan 3 pertanyaan penguji.

[METODE]

[LEVEL_BAHASA]

Penjelasanku: [TEMPEL]`,
        },
      ],
      eksplorasi: [
        {
          title: "I'jaz Al-Qur'an & Sisi Kemukjizatannya",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan i'jaz Al-Qur'an:
1. Macam-macam i'jaz (bayani/lughawi, 'ilmi, tasyri'i, ghaibi) — ringkas + contoh.
2. Pandangan ulama tentang wajh i'jaz utama.
3. Kaitan i'jaz bayani dengan balaghah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Hubungkan 'Ulum Quran dengan Tafsir Nyata",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Ambil ayat [SEBUTKAN], tunjukkan bagaimana 'ulum quran membantu menafsirkannya:
1. Aspek makki/madani, asbab nuzul, qira'at, atau nasikh yang relevan.
2. Bagaimana tiap aspek mengubah/memperjelas makna.
PENTING: jangan mengarang riwayat/qira'at; jika ragu, katakan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Telaah Jam' Al-Qur'an & Rasm 'Utsmani",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan sejarah jam' (pengumpulan) Al-Qur'an:
1. Tahap di masa Nabi, Abu Bakr, dan 'Utsman — apa yang terjadi tiap tahap.
2. Apa itu rasm 'utsmani & kenapa kaidah penulisannya khas.
3. Hikmah & bantahan syubhat seputar pengumpulan mushaf.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  {
    id: "manahij-mufassirin",
    name: "Manahij Al-Mufassirin",
    nameArabic: "مناهج المفسرين",
    category: "qurani",
    fakultas: ["ushuluddin", "dirasat"],
    jurusan: ["dirasat_ushuluddin"],
    tingkat: ["3", "4", "pasca"],
    description: "Metodologi para mufassir — mengenali dan membandingkan manhaj tafsir bil ma'tsur, bir ra'yi, fiqhi, sufi, 'ilmi, adabi-ijtima'i.",
    descriptionArabic: "مناهج العلماء في تفسير القرآن",
    kitabUtama: [
      { nama: "At-Tafsir wal Mufassirun",   arabic: "التفسير والمفسرون",         penulis: "Adz-Dzahabi" },
      { nama: "Manahijul Mufassirin",        arabic: "مناهج المفسرين",           penulis: "Manna' Al-Qaththan" },
    ],
    recommendedAI: [
      { tool: "claude",      rank: 1, strength: "Analisis mendalam ciri-ciri manhaj dari kutipan tafsir", why: "Membandingkan manhaj butuh kemampuan membaca ciri-ciri dari teks. Claude kuat untuk analisis komparatif gaya penulisan dan pendekatan tafsir." },
      { tool: "perplexity",  rank: 2, strength: "Verifikasi karakteristik spesifik mufassir",             why: "Perplexity bisa membantu verifikasi klaim tentang ciri khas suatu mufassir dengan referensi ke studi akademik." },
    ],
    tutorial: {
      overview: "Memahami manhaj mufassir membantu membaca kitab tafsir dengan lebih kritis dan terukur.",
      steps: [
        { title: "Pelajari pembagian utama manhaj",    body: "Ada 2 kategori besar: tafsir bil ma'tsur (berdasar riwayat) dan tafsir bir ra'yi (berdasar akal/ijtihad). Dalam setiap kategori ada varian lebih spesifik." },
        { title: "Kenali ciri-ciri tiap manhaj",       body: "Setiap manhaj punya ciri khas. Minta AI jelaskan tanda-tanda yang bisa dikenali dari kutipan tafsir — ini skill penting untuk ujian identifikasi." },
        { title: "Baca dari berbagai manhaj",          body: "Saat mempelajari satu ayat, coba baca dari 2-3 mufassir berbeda manhaj. Ini membuka wawasan luas tentang kekayaan interpretasi." },
        { title: "Timbang kelebihan dan kelemahan",   body: "Setiap manhaj ada plus-minusnya. Manhaj tafsir bir ra'yi madzmum (yang dicela) berbeda dari yang mahmud." },
      ],
    },
    prompts: {
      pahami: [
        {
          title: "Peta Besar Manahij Al-Mufassirin",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri kerangka utuh ilmu Manahij al-Mufassirin (metode para mufassir):
1. Pembagian besar: tafsir bil ma'tsur vs bir ra'yi, lalu corak (lughawi, fiqhi, 'ilmi, isyari, ijtima'i, dst).
2. Apa tujuan mempelajari manhaj mufassir (menilai & memanfaatkan kitab tafsir dengan tepat).
3. Outline bercabang.
4. Kenapa penting tahu manhaj sebelum membaca tafsir.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Tafsir bil Ma'tsur & Tokohnya",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan manhaj tafsir bil ma'tsur:
1. Definisi & sumbernya (Qur'an, Sunnah, qaul sahabat-tabi'in).
2. Kitab utama (mis. Tafsir at-Thabari, Ibn Katsir) + ciri metode masing-masing.
3. Kelebihan & hal yang perlu diwaspadai (israiliyyat, riwayat lemah).
PENTING: kalau tidak yakin isi/ciri kitab tertentu, katakan; jangan mengarang.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Tafsir bir Ra'yi & Coraknya",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan tafsir bir ra'yi:
1. Definisi + syarat ra'yi yang terpuji vs tercela.
2. Corak-coraknya: lughawi (Zamakhsyari), fiqhi (Qurthubi), 'ilmi, falsafi (Razi), dll.
3. Ciri tiap corak + contoh kitabnya.
PENTING: sebut yang kamu yakin; jika ragu, katakan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Cara Menilai Sebuah Kitab Tafsir",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Ajari aku menilai manhaj sebuah kitab tafsir:
1. Aspek yang diperhatikan: sumber, corak, manhaj penulis, kecenderungan madzhab/aliran.
2. Cara mengenali bias atau penyimpangan dalam tafsir.
3. Langkah membaca kritis sebuah tafsir.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Klasifikasi Mufassir & Coraknya",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal pemetaan mufassir:
1. Tabel: kitab | penulis | manhaj (ma'tsur/ra'yi) | corak | ciri khas.
2. Mnemonic untuk mengelompokkannya.
PENTING: hanya yang kamu yakin; jika ragu, tandai.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Hafal Istilah Manhaj Tafsir",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk bab [SEBUTKAN], buatkan daftar istilah untuk dihafal (Arab berharakat + arti + contoh penggunaan).
Tandai yang sering jadi soal.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Manahij Mufassirin",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah H+1, H+3, H+7, mingguan + cara uji (sebut kitab + manhaj + ciri). Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Drill Identifikasi Manhaj dari Contoh Tafsir",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 6 potongan/deskripsi gaya penafsiran. Tugasku: tentukan manhaj & coraknya.
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab + jelaskan penandanya.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Bandingkan Dua Kitab Tafsir",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 2 kitab tafsir untuk kubandingkan manhajnya. Tugasku: jelaskan beda pendekatannya.
1. JANGAN beri jawaban dulu.
2. Koreksi perbandinganku.
PENTING: kalau aku/ kamu tidak yakin isi kitab, katakan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Soal Definisi & Klasifikasi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal campuran (definisi manhaj/corak, ciri kitab, tokoh) dari bab [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Tahriri (Gaya Azhari)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian tulis Manahij Mufassirin gaya Azhar untuk bab [SEBUTKAN]:
1. Tipe khas: tahaddats 'an manhaj..., qarin baina tafsirain, bayyin khasha'is..., ma al-farq baina al-ma'tsur war-ra'yi.
2. 5-6 soal bobot bervariasi.
3. JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih + skor & catatan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Imtihan Syafawi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan syafawi.

Berperanlah sebagai mumtahin syafawi:
1. Tanya manhaj kitab, corak, ciri tokoh.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik, naikkan kesulitan.
4. Penilaian akhir + area lemah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab yang kupelajari ([SEBUTKAN]): topik tersering jadi soal, cara jawab analitis, prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (di bawah). Rapikan jadi: kitab → manhaj → ciri → tokoh, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
        {
          title: "Verifikasi Pemahaman Pasca-Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Setelah talaqqi bab [SEBUTKAN], aku jelaskan ulang (di bawah). Periksa keakuratan, koreksi, ajukan 3 pertanyaan penguji.

[METODE]

[LEVEL_BAHASA]

Penjelasanku: [TEMPEL]`,
        },
      ],
      eksplorasi: [
        {
          title: "Telaah Manhaj Tafsir Kontemporer",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan corak tafsir modern/kontemporer (mis. ijtima'i seperti al-Manar, 'ilmi):
1. Ciri & tujuannya.
2. Tokoh & kitabnya (sebut yang kamu yakin; jika ragu, katakan).
3. Kritik & catatan terhadap corak ini.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Israiliyyat dalam Tafsir",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan masalah israiliyyat:
1. Apa itu israiliyyat & dari mana masuknya ke tafsir.
2. Klasifikasi (yang diterima, ditolak, didiamkan).
3. Sikap mufassir terhadapnya & cara menyikapinya.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Hubungkan Manhaj dengan Kualitas Tafsir",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan bagaimana manhaj memengaruhi kualitas tafsir:
1. Kenapa tafsir dengan manhaj kuat lebih bisa dipercaya.
2. Tanda tafsir yang menyimpang dari manhaj sahih.
3. Cara memilih tafsir yang tepat sesuai kebutuhan.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  {
    id: "qiraat",
    name: "Qira'at",
    nameArabic: "القراءات",
    category: "qurani",
    fakultas: ["ushuluddin", "dirasat", "quran"],
    jurusan: ["dirasat_ushuluddin"],
    tingkat: ["3", "4", "pasca"],
    description: "Ilmu variasi bacaan Al-Qur'an dari 7 atau 10 imam qira'at yang mutawatir. Qira'at praktis wajib dengan guru bersanad; AI bantu sisi teori.",
    descriptionArabic: "علم اختلافات القراءات القرآنية المتواترة",
    kitabUtama: [
      { nama: "Asy-Syathibiyyah (Hirzul Amani)", arabic: "الشاطبية (حرز الأماني)",      penulis: "Imam Asy-Syathibi" },
      { nama: "An-Nasyr fil Qira'atil 'Asyr",   arabic: "النشر في القراءات العشر",     penulis: "Ibnul Jazari" },
    ],
    recommendedAI: [
      { tool: "notebooklm", rank: 1, strength: "Drill matan Syathibiyyah, pahami ushul qira'at",   why: "Upload matan Syathibiyyah ke NotebookLM untuk drill hafalan nazham dengan source akurat." },
      { tool: "claude",     rank: 2, strength: "Penjelasan konsep ushul dan farsy qira'at sab'ah", why: "Claude bisa menjelaskan perbedaan qira'at antar imam dengan sistematis dan cara membaca masing-masing secara teori." },
    ],
    tutorial: {
      overview: "Qira'at adalah cabang ilmu yang butuh sanad. AI hanya membantu sisi teori.",
      steps: [
        { title: "Pahami 7 imam qira'at dulu",       body: "Hafal nama 7 imam qira'at sab'ah beserta 2 perawi masing-masing (14 riwayat). Ini dasar sebelum belajar perbedaan qira'at." },
        { title: "Bedakan ushul dan farsy",           body: "Ushul = kaidah umum (berlaku di banyak tempat). Farsy = perbedaan khusus di kata-kata tertentu. Pahami ushul dulu, baru farsy." },
        { title: "Praktik WAJIB dengan sanad",       body: "Qira'at adalah ibadah yang harus ditransmisikan dengan sanad. Tidak boleh mengambil qira'at dari buku atau AI saja." },
        { title: "Matan Syathibiyyah untuk teori",   body: "Untuk memahami teori, hafal matan Syathibiyyah. Gunakan NotebookLM dengan file matan untuk drill." },
      ],
    },
    prompts: {
      pahami: [
        {
          title: "Peta Besar Ilmu Qira'at",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri kerangka utuh ilmu Qira'at:
1. Definisi qira'at + bedanya dengan tajwid.
2. Qira'at sab' (tujuh) & 'asyr (sepuluh) — para imam qira'at & perawinya.
3. Syarat qira'at yang sahih (sanad mutawatir, sesuai rasm 'utsmani, sesuai kaidah Arab).
4. Outline bercabang + pentingnya ilmu ini.
PENTING: sebut imam/perawi yang kamu yakin; jika ragu, katakan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Klasifikasi Qira'at (Mutawatir-Syadz)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan klasifikasi qira'at dari sisi sanad:
1. Mutawatir, masyhur, ahad, syadz, maudhu', mudraj — definisi tiap (Arab berharakat).
2. Mana yang boleh dibaca dalam shalat & yang tidak.
3. Hubungannya dengan 3 syarat keabsahan qira'at.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Al-Ahruf As-Sab'ah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan konsep al-ahruf as-sab'ah (tujuh huruf):
1. Makna hadits "unzila al-Qur'an 'ala sab'ati ahruf".
2. Pendapat ulama tentang maksud tujuh huruf.
3. Hubungan ahruf sab'ah dengan qira'at (apakah sama atau beda).
PENTING: sajikan pendapat ulama secara berimbang.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Faedah Perbedaan Qira'at",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan faedah ikhtilaf qira'at:
1. Bagaimana perbedaan qira'at memperkaya makna (tanawwu' bukan tadhadd).
2. Pengaruh qira'at terhadap tafsir & hukum fiqh.
3. Contoh ayat yang qira'at-nya membawa faedah makna (sebut yang kamu yakin; jika ragu, katakan).

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Imam Qira'at & Perawinya",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal para imam qira'at:
1. Tabel: imam | dua perawi utamanya | wilayah/kota.
2. Mnemonic untuk mengingat sepuluh imam.
PENTING: hanya yang kamu yakin; jika ragu, tandai.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Hafal Klasifikasi & Istilah Qira'at",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Daftar istilah (mutawatir, syadz, ahruf, dll) — Arab berharakat + arti. Kelompokkan agar mudah diingat.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Qira'at",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Yang sudah kupelajari: [SEBUTKAN]. Jadwal muraja'ah H+1, H+3, H+7, mingguan + cara uji. Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Drill Klasifikasi Qira'at",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 8 deskripsi keadaan sanad/qira'at. Tugasku: klasifikasikan (mutawatir/syadz/dll) + apakah boleh dibaca dalam shalat.
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Soal Definisi & Imam",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal campuran (definisi, imam-perawi, syarat keabsahan, klasifikasi) dari bab [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Analisis Faedah Qira'at pada Ayat",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku ayat yang punya variasi qira'at. Tugasku: jelaskan bagaimana perbedaan qira'at memengaruhi makna.
1. JANGAN beri jawaban dulu.
2. Koreksi analisisku.
PENTING: sebut qira'at yang kamu yakin; jika ragu, katakan; jangan mengarang.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Tahriri (Gaya Azhari)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian tulis Qira'at gaya Azhar untuk bab [SEBUTKAN]:
1. Tipe khas: 'arrif, udzkur syuruth shihhah al-qira'ah, ma al-farq baina..., bayyin faedah ikhtilaf.
2. 5-6 soal bobot bervariasi.
3. JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih + skor & catatan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Imtihan Syafawi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan syafawi.

Berperanlah sebagai mumtahin syafawi:
1. Tanya syarat keabsahan, imam-perawi, klasifikasi, faedah qira'at.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik, naikkan kesulitan.
4. Penilaian akhir + area lemah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab yang kupelajari ([SEBUTKAN]): topik tersering jadi soal, cara jawab lengkap, prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (di bawah). Rapikan jadi: konsep → imam → klasifikasi → faedah, lengkapi harakat, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
        {
          title: "Verifikasi Pemahaman Pasca-Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Setelah talaqqi bab [SEBUTKAN], aku jelaskan ulang (di bawah). Periksa keakuratan, koreksi, ajukan 3 pertanyaan penguji.

[METODE]

[LEVEL_BAHASA]

Penjelasanku: [TEMPEL]`,
        },
      ],
      eksplorasi: [
        {
          title: "Qira'at & Pengaruhnya pada Tafsir & Fiqh",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk ayat [SEBUTKAN] yang punya variasi qira'at:
1. Bagaimana perbedaan qira'at melahirkan makna/hukum berbeda.
2. Contoh ayat ahkam yang qira'at-nya berdampak fiqh.
PENTING: sebut qira'at & sumber yang kamu yakin; jika ragu, katakan; jangan mengarang.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Telaah Kitab & Tokoh Qira'at",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan kitab/tokoh penting ilmu qira'at (mis. asy-Syatibiyyah, ad-Durrah, Ibn al-Jazari):
1. Apa isi & kedudukan kitab itu.
2. Kontribusi tokohnya.
PENTING: kalau tidak yakin, katakan; jangan mengarang.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Bantah Syubhat seputar Qira'at",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan secara ilmiah:
1. Syubhat bahwa "perbedaan qira'at = perbedaan/kerusakan Al-Qur'an".
2. Jawaban ilmiah: tawatur qira'at & maknanya sebagai kekayaan, bukan pertentangan.
3. Bagaimana qira'at justru bukti penjagaan Al-Qur'an.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  {
    id: "hadits-tahlili",
    name: "Hadits Tahlili",
    nameArabic: "الحديث التحليلي",
    category: "haditsi",
    fakultas: ["ushuluddin", "dirasat", "dirasat-banin"],
    jurusan: ["dirasat_ushuluddin"],
    tingkat: ["3", "4", "pasca"],
    description: "Analisis hadits per hadits — sanad, rijal, matan, syarah, dan istinbat hukum. Berbeda dari Tafsir: fokus pada sanad/matan bukan ayat/munasabah.",
    descriptionArabic: "تحليل أحاديث النبي ﷺ سنداً ومتناً",
    kitabUtama: [
      { nama: "Fathul Bari",          arabic: "فتح الباري",        penulis: "Ibnu Hajar Al-'Asqalani" },
      { nama: "Syarh Shahih Muslim",  arabic: "شرح صحيح مسلم",    penulis: "Imam Nawawi" },
      { nama: "Subulus Salam",        arabic: "سبل السلام",        penulis: "Ash-Shan'ani" },
    ],
    recommendedAI: [
      { tool: "claude",      rank: 1, strength: "Analisis sanad & matan, syarah hadits, komparasi syurrah", why: "Hadits Tahlili butuh AI yang bisa analisis teks Arab panjang dan membandingkan pendapat syurrah. Claude sangat kuat di komparasi tekstual." },
      { tool: "perplexity",  rank: 2, strength: "Verifikasi takhrij dan derajat hadits",                    why: "Perplexity bisa membantu verifikasi di mana hadits diriwayatkan dan derajatnya dengan referensi ke kitab hadits." },
    ],
    tutorial: {
      overview: "Analisis hadits punya langkah berbeda dari tafsir — sanad dulu, baru matan, baru syarah.",
      steps: [
        { title: "Identifikasi komponen hadits", body: "Setiap hadits punya: sanad (rantai perawi) dan matan (teks). Analisis keduanya terpisah tapi saling kait." },
        { title: "Analisis sanad & rijal",       body: "Minta AI jelaskan perawi-perawi dalam sanad dan statusnya (tsiqah/dha'if). Tapi verifikasi ke kitab rijal (Mizan Al-I'tidal, Tahdzib) — AI bisa salah." },
        { title: "Syarah dengan kitab syurrah",  body: "Untuk memahami hadits, bandingkan pendapat Ibnu Hajar (Fathul Bari) dan Imam Nawawi (Syarh Muslim). Claude bisa bantu bandingkan keduanya." },
        { title: "Istinbat hukum dari hadits",   body: "Langkah terakhir: hukum apa yang bisa diambil dari hadits? Minta AI jelaskan pendapat para fuqaha yang menggunakan hadits ini." },
      ],
    },
    prompts: {
      pahami: [
        {
          title: "Pahami Metode Syarah Hadits (Tahlili)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan cara menganalisis hadits secara tahlili:
1. Langkah: takhrij ringkas → derajat hadits → makna mufradat → syarah matan → istinbath fiqh/akhlak → munasabah dgn hadits lain.
2. Kitab syarah hadits rujukan (mis. Fath al-Bari, Syarh Nawawi 'ala Muslim) + karakternya.
3. Outline langkah agar bisa kuikuti tiap menganalisis hadits.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Analisis Tahlili Satu Hadits (Demonstrasi)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Analisis hadits berikut secara tahlili lengkap (kutempel di bawah / sebut sumbernya):
1. Makna mufradat (kata sulit) + arti.
2. Syarah/makna global matan.
3. Faedah & hukum yang diambil (istinbath).
4. Munasabah dgn hadits/ayat lain bila ada.
PENTING: kalau tidak yakin derajat/sumber hadits, katakan; jangan mengarang.

[METODE]

[LEVEL_BAHASA]

Hadits: [TEMPEL TEKS HADITS]`,
        },
        {
          title: "Pahami Gharib al-Hadits (Kata-kata Sulit)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan ilmu gharib al-hadits:
1. Apa itu gharib al-hadits & kenapa penting.
2. Dari hadits [SEBUTKAN/tempel], jelaskan kata-kata gharib + maknanya.
3. Cara mencari makna kata gharib di kitab rujukan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Mukhtalif & Musykil al-Hadits",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan ilmu mukhtalif al-hadits:
1. Apa itu hadits yang tampak bertentangan (mukhtalif) & musykil.
2. Cara penyelesaian: al-jam', naskh, tarjih, tawaqquf.
3. Contoh kasus (sebut hadits & sumbernya; jika ragu, katakan).

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Matan Hadits dengan Pemahaman",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu aku menghafal matan hadits [SEBUTKAN/tempel]:
1. Pecah matan jadi makna per potong (agar hafalan berbasis paham).
2. Mnemonic/asosiasi untuk bagian yang panjang.
3. Tandai lafazh yang sering keliru saat hafalan.
PENTING: pakai teks hadits yang kutempel; jangan mengarang lafazh.

[METODE]

[LEVEL_BAHASA]

Hadits: [TEMPEL]`,
        },
        {
          title: "Tabel Faedah Hadits untuk Dihafal",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari hadits-hadits bab [SEBUTKAN], buatkan tabel hafalan:
1. Kolom: inti hadits | faedah/hukum utama | kata kunci.
2. Tandai faedah yang sering jadi soal.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Hadits",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Hadits yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah H+1, H+3, H+7, mingguan + cara uji (sebut matan, makna, faedah). Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Syarah Mandiri (Aku Coba, AI Koreksi)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Aku akan mensyarah hadits [tempel di bawah] dengan kemampuanku.
1. Koreksi syarah-ku: tepat/keliru/kurang.
2. Tunjukkan langkah tahlili yang terlewat (mufradat/faedah/munasabah).
3. Lengkapi dgn rujukan mu'tabar (jika ragu, katakan).

[METODE]

[LEVEL_BAHASA]

Hadits + syarahku: [TEMPEL]`,
        },
        {
          title: "Drill Istinbath Faedah dari Hadits",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 5 hadits (tempel/sebut sumber). Tugasku: sebutkan faedah/hukum tiap hadits.
1. JANGAN beri jawaban dulu.
2. Koreksi + tambahkan faedah yang terlewat.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Makna Mufradat Hadits",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari hadits [tempel], tugasku menjelaskan makna kata-kata sulitnya.
1. JANGAN beri jawaban dulu.
2. Koreksi makna-ku.

[METODE]

[LEVEL_BAHASA]

Hadits: [TEMPEL]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Tahriri Hadits (Gaya Azhari)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian tulis Hadits Tahlili gaya Azhar untuk bab [SEBUTKAN]:
1. Tipe khas: isyrah al-hadits, istanbith al-ahkam, ma ma'na..., udzkur faedah.
2. 5-6 soal bobot bervariasi.
3. JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih + skor & catatan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Imtihan Syafawi Hadits",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan syafawi.

Berperanlah sebagai mumtahin syafawi:
1. Minta aku jelaskan makna hadits, faedah, hukum secara lisan.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik, naikkan kesulitan.
4. Penilaian akhir + area lemah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian Hadits",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab yang kupelajari ([SEBUTKAN]): hadits yang sering jadi soal syarah & istinbath, cara menulis jawaban lengkap (makna + faedah + hukum), prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi Hadits",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi hadits-ku berantakan (di bawah). Rapikan jadi: matan → makna → faedah, lengkapi harakat, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
        {
          title: "Verifikasi Pemahaman Pasca-Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Setelah talaqqi hadits [SEBUTKAN], aku jelaskan ulang (di bawah). Periksa keakuratan, koreksi, ajukan 3 pertanyaan penguji.

[METODE]

[LEVEL_BAHASA]

Penjelasanku: [TEMPEL]`,
        },
      ],
      eksplorasi: [
        {
          title: "Bandingkan Syarah antar Ulama",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk hadits [SEBUTKAN/tempel], bandingkan pendekatan beberapa pensyarah (mis. Ibn Hajar dlm Fath al-Bari, Nawawi dlm Syarh Muslim):
1. Penekanan masing-masing.
2. Perbedaan pemahaman bila ada.
PENTING: kalau tidak yakin isi syarah, katakan; jangan mengarang nukilan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Hadits & Penerapan dalam Kehidupan",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari hadits [SEBUTKAN], gali penerapan praktisnya:
1. Pelajaran akhlak/tarbawi.
2. Penerapan dalam kehidupan sehari-hari.
3. Cara menyampaikannya dalam dakwah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Hadits Ahkam: Istinbath Fiqh dari Hadits",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk hadits ahkam [SEBUTKAN/tempel]:
1. Hukum fiqh yang diistinbath.
2. Cara dilalah hadits menunjukkan hukum.
3. Khilaf ulama dalam memahaminya bila ada.
PENTING: sebut sumber; jangan mengarang.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  {
    id: "hadits-maudhui",
    name: "Hadits Maudhu'i",
    nameArabic: "الحديث الموضوعي",
    category: "haditsi",
    fakultas: ["ushuluddin", "dirasat"],
    jurusan: ["dirasat_ushuluddin"],
    tingkat: ["3", "4", "pasca"],
    description: "Hadits tematik — mengumpulkan dan menganalisis hadits berdasarkan tema tertentu, termasuk menyelesaikan hadits yang tampak bertentangan.",
    descriptionArabic: "جمع الأحاديث وتحليلها حسب الموضوعات",
    kitabUtama: [
      { nama: "Riyadhus Shalihin",       arabic: "رياض الصالحين",       penulis: "Imam Nawawi" },
      { nama: "At-Targhib wat Tarhib",   arabic: "الترغيب والترهيب",   penulis: "Al-Mundziri" },
    ],
    recommendedAI: [
      { tool: "claude",      rank: 1, strength: "Kumpulkan, sintesis, dan analisis hadits tematik", why: "Hadits maudhu'i butuh AI yang bisa mengelola banyak hadits sekaligus dan menganalisis konsistensi atau kontradiksi antar hadits dalam satu tema." },
      { tool: "notebooklm",  rank: 2, strength: "Navigasi kitab hadits tematik yang di-upload",    why: "Upload Riyadhus Shalihin atau kitab tematik lain untuk drill dan navigasi hadits berdasarkan bab." },
    ],
    tutorial: {
      overview: "Hadits maudhu'i mirip tafsir maudhu'i tapi berbasis hadits — kumpulkan, klasifikasi, analisis tema.",
      steps: [
        { title: "Tentukan tema dengan batas jelas",  body: "Pilih tema yang spesifik (mis. 'Keutamaan Sabar' bukan 'Akhlak'). Tema terlalu luas akan sulit dikelola." },
        { title: "Kumpulkan hadits terkait",          body: "Minta AI bantu kumpulkan hadits dengan berbagai redaksi yang membahas tema. Verifikasi ke Mu'jam Al-Mufahras lil Alfazh Al-Hadits." },
        { title: "Nilai derajat setiap hadits",       body: "Untuk tiap hadits, pastikan derajatnya (shahih/hasan/dha'if). Jangan pakai hadits dha'if sebagai hujjah hukum." },
        { title: "Analisis mukhtaliful hadits",       body: "Kalau ada hadits yang tampak bertentangan dalam tema yang sama, pakai metode jam'u, naskh, atau tarjih." },
      ],
    },
    prompts: {
      pahami: [
        {
          title: "Pahami Metode Hadits Maudhu'i (Tematik)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan apa itu kajian hadits maudhu'i (tematik):
1. Definisi + bedanya dengan hadits tahlili.
2. Langkah: tentukan tema → kumpulkan hadits terkait → periksa derajatnya → susun → simpulkan.
3. CATATAN PENTING: istilah "maudhu'i" (tematik) di sini BERBEDA dari "hadits maudhu'" (palsu) — jelaskan perbedaan dua istilah ini agar tidak keliru.
4. Outline langkah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kajian Tematik Satu Tema Hadits (Demonstrasi)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Lakukan kajian hadits maudhu'i untuk tema [SEBUTKAN, mis. birrul walidain, niat, kebersihan]:
1. Kumpulkan hadits-hadits terkait (sebut sumber; jika ragu derajat/sumber, katakan — jangan mengarang).
2. Kelompokkan per aspek tema.
3. Simpulkan tuntunan hadits secara utuh.
4. Faedah praktis.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Pentingnya Memeriksa Derajat Hadits Setema",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan kenapa dalam kajian tematik hadits, derajat hadits harus diperiksa:
1. Bahaya memakai hadits dha'if/palsu sebagai landasan tema.
2. Cara memilah hadits maqbul dari yang lemah dalam satu tema.
3. Sikap terhadap hadits dha'if dalam fadha'il a'mal.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Cara Mengumpulkan Hadits Setema",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Ajari teknik mengumpulkan hadits untuk tema:
1. Sumber pencarian (kutub sittah, kitab tematik seperti Riyadhus Shalihin, mu'jam).
2. Cara memastikan relevansi hadits dengan tema.
3. Menangani hadits yang tampak bertentangan dalam satu tema.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Langkah Metode Tematik Hadits",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal langkah hadits maudhu'i sebagai checklist:
1. Urutkan langkah.
2. Mnemonic.
3. Kata kunci tiap langkah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Hafal Hadits Kunci per Tema",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk tema [SEBUTKAN], buatkan daftar hadits kunci untuk dihafal:
1. Inti hadits + sumber + faedah.
2. Kelompokkan per aspek.
PENTING: sebut sumber dengan benar; jika ragu, katakan; jangan mengarang lafazh.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Hadits Maudhu'i",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Tema yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah H+1, H+3, H+7, mingguan + cara uji. Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Kajian Tematik Mandiri (Aku Coba, AI Koreksi)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Aku akan mengkaji tema [SEBUTKAN] dari hadits dengan kemampuanku (di bawah).
1. Koreksi: relevansi hadits, perhatian pada derajat, kesimpulan.
2. Tunjukkan hadits penting yang terlewat (jika ragu rujukan, katakan).

[METODE]

[LEVEL_BAHASA]

Kajianku: [TEMPEL]`,
        },
        {
          title: "Drill Tentukan Tema dari Hadits",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 6 hadits (sebut sumber). Tugasku: tentukan tema & faedah tiap hadits.
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Simpulkan Tuntunan Tematik",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri kumpulan hadits setema [SEBUTKAN]. Tugasku: simpulkan tuntunan menyeluruhnya.
1. JANGAN beri kesimpulan dulu.
2. Koreksi kesimpulanku.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Tahriri (Gaya Azhari)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian tulis Hadits Maudhu'i gaya Azhar untuk tema [SEBUTKAN]:
1. Tipe khas: ijma' al-ahadits fi..., bayyin tawjih as-sunnah fi..., istanbith al-fawa'id.
2. 5-6 soal bobot bervariasi.
3. JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih + skor & catatan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Imtihan Syafawi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan syafawi.

Berperanlah sebagai mumtahin syafawi:
1. Minta aku sebut hadits tema, jelaskan tuntunan, simpulkan secara lisan.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik, naikkan kesulitan.
4. Penilaian akhir + area lemah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari tema yang kupelajari ([SEBUTKAN]): tema yang sering jadi soal, cara jawab lengkap, prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (di bawah). Rapikan jadi: tema → hadits → tuntunan, lengkapi rujukan, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
        {
          title: "Verifikasi Pemahaman Pasca-Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Setelah talaqqi tema [SEBUTKAN], aku jelaskan ulang (di bawah). Periksa keakuratan, koreksi, ajukan 3 pertanyaan penguji.

[METODE]

[LEVEL_BAHASA]

Penjelasanku: [TEMPEL]`,
        },
      ],
      eksplorasi: [
        {
          title: "Hadits Maudhu'i untuk Tema Akhlak/Dakwah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk tema akhlak [SEBUTKAN]:
1. Kumpulkan tuntunan hadits tentang tema itu (sebut sumber; jika ragu, katakan).
2. Susun jadi panduan praktis.
3. Cara menyampaikannya dalam dakwah/ceramah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Padukan Tema Qur'an & Hadits",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk tema [SEBUTKAN], padukan dalil Qur'an & hadits:
1. Ayat utama + hadits utama tentang tema.
2. Bagaimana hadits menjelaskan/merinci ayat.
3. Kesimpulan terpadu.
PENTING: sebut rujukan; jangan mengarang.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Bandingkan dengan Hadits Tahlili",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk tema/hadits [SEBUTKAN], bandingkan pendekatan maudhu'i vs tahlili:
1. Hasil tiap metode.
2. Kelebihan & keterbatasan.
3. Kapan pakai yang mana.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  {
    id: "mustholah-hadits",
    name: "Mustholah Hadits",
    nameArabic: "مصطلح الحديث",
    category: "haditsi",
    fakultas: ["ushuluddin", "dirasat", "dirasat-banin", "syariah"],
    jurusan: ["dirasat_ushuluddin"],
    tingkat: ["2", "3", "4", "pasca"],
    description: "Ilmu klasifikasi hadits — shahih, hasan, dha'if, mawdhu', kaidah-kaidah ilmu rijal, dan terminologi muhadditsin.",
    descriptionArabic: "علم قواعد تصنيف الأحاديث وأحوال الرواة",
    kitabUtama: [
      { nama: "Nukhbatul Fikar",             arabic: "نخبة الفكر",              penulis: "Ibnu Hajar Al-'Asqalani" },
      { nama: "Taysir Mustholahil Hadits",   arabic: "تيسير مصطلح الحديث",    penulis: "Mahmud Ath-Thahhan" },
      { nama: "Al-Baiquniyyah",              arabic: "المنظومة البيقونية",     penulis: "Al-Baiquni" },
    ],
    recommendedAI: [
      { tool: "notebooklm", rank: 1, strength: "Drill definisi, matan Baiquniyyah, klasifikasi hadits", why: "Mustholah butuh banyak hafalan definisi dan klasifikasi. NotebookLM dengan source kitab bisa drill akurat tanpa memperoleh definisi yang salah." },
      { tool: "claude",     rank: 2, strength: "Penjelasan istilah dan perbedaan antar kategori hadits", why: "Claude bagus untuk menjelaskan nuansa perbedaan antar istilah yang mirip (mis. mursal vs munqathi') dengan contoh konkret." },
    ],
    tutorial: {
      overview: "Mustholah adalah kamus bahasa para muhadditsin — hafal istilah dan klasifikasi adalah fondasi.",
      steps: [
        { title: "Hafal klasifikasi utama dulu",    body: "Mulai dari 3 kategori besar: shahih, hasan, dha'if. Setelah itu pelajari sub-kategori dari masing-masing." },
        { title: "Bedakan istilah yang mirip",      body: "Banyak istilah yang mirip tapi beda makna: mursal vs munqathi', mawdhu' vs mathruk, mashhur vs mustafidh. Minta AI jelaskan perbedaannya." },
        { title: "Hafal matan Baiquniyyah",         body: "Matan Baiquniyyah adalah nazham 34 bait yang merangkum mustholah secara komprehensif. Gunakan NotebookLM untuk drill." },
        { title: "Aplikasi ke hadits nyata",        body: "Latih mengklasifikasikan hadits nyata berdasarkan kaidah mustholah. Ini skill yang diuji di Azhar." },
      ],
    },
    prompts: {
      pahami: [
        {
          title: "Peta Besar 'Ulum / Mustholah Hadits",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri kerangka utuh mustholah hadits:
1. Pembagian hadits dari sisi: jumlah perawi (mutawatir-ahad), diterima/ditolak (maqbul-mardud), sandaran (marfu'-mauquf-maqthu').
2. Istilah inti: sanad, matan, rawi, isnad, 'adalah, dhabt.
3. Outline bercabang agar utuh.
4. Urutan belajar ideal.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Hadits Shahih, Hasan, Dha'if",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan klasifikasi hadits maqbul-mardud:
1. Syarat hadits shahih (5 syarat) — teks Arab berharakat + arti tiap syarat.
2. Hadits hasan (lidzatihi & lighairihi) — bedanya dengan shahih.
3. Hadits dha'if — sebab-sebab kelemahan (terkait sanad & matan).
4. Contoh tiap jenis (deskriptif, tidak perlu mengarang sanad spesifik).

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Jenis Dha'if (Mursal, Munqathi', Mu'allaq, dst)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan jenis-jenis hadits dha'if karena cacat sanad:
1. Mursal, munqathi', mu'dhal, mu'allaq — definisi + letak keterputusan (teks Arab berharakat).
2. Mudallas & tadlis.
3. Beda tiap jenis dengan diagram sanad sederhana (teks).

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Jarh wa Ta'dil",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan ilmu jarh wa ta'dil:
1. Definisi jarh & ta'dil + kenapa penting untuk menilai perawi.
2. Maratib (tingkatan) ta'dil dan jarh — sebutkan ungkapan Arab tiap tingkat berharakat.
3. Kaidah saat jarh & ta'dil bertentangan pada satu perawi.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Maratib Jarh wa Ta'dil dengan Mnemonic",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal tingkatan (maratib) ta'dil & jarh:
1. Urutkan dari tertinggi ke terendah (ungkapan Arab berharakat + arti).
2. Mnemonic Indonesia untuk mengingat urutannya.
3. Tandai tingkat yang sering jadi soal.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Tabel Klasifikasi Hadits untuk Dihafal",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Buatkan tabel hafalan jenis hadits:
1. Kolom: nama jenis (Arab berharakat) | definisi ringkas | letak cacat/ciri.
2. Kelompokkan (sisi jumlah perawi, sisi diterima/ditolak, sisi keterputusan).
3. Tandai yang sering tertukar (mis. mursal vs munqathi').

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Mustholah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah H+1, H+3, H+7, mingguan + cara uji tiap sesi. Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Drill Klasifikasi Hadits dari Deskripsi Sanad",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 8 deskripsi keadaan sanad (mis. "perawi terakhir gugur di awal sanad", "terputus satu perawi di tengah"). Tugasku: tentukan jenis haditsnya.
1. JANGAN beri jawaban dulu.
2. Setelah aku jawab, koreksi + jelaskan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Soal Definisi & Perbedaan Istilah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal campuran (definisi, beda dua istilah, contoh) dari bab [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Menilai Hadits (Tathbiq)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku contoh kasus penilaian hadits (deskriptif). Tugasku: terapkan kaidah mustholah untuk menilai diterima/ditolak.
1. JANGAN beri jawaban dulu.
2. Koreksi penalaran-ku + tunjukkan kaidah yang dipakai.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Tahriri Mustholah (Gaya Azhari)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian tulis Mustholah gaya Azhar untuk bab [SEBUTKAN]:
1. Tipe khas: 'arrif + matsil, ma al-farq baina, udzkur asy-syurut, bayyin hukm.
2. 5-6 soal bobot bervariasi.
3. JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih + skor & catatan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Imtihan Syafawi Mustholah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan syafawi.

Berperanlah sebagai mumtahin syafawi:
1. Tanya definisi, syarat, perbedaan istilah, klasifikasi.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik, naikkan kesulitan.
4. Penilaian akhir + area lemah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian Mustholah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab yang kupelajari ([SEBUTKAN]): bab tersering jadi soal, tipe soal mungkin keluar, cara jawab dapat nilai penuh (definisi + contoh), prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi Mustholah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (di bawah). Rapikan jadi poin definisi+ciri, lengkapi harakat, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
        {
          title: "Verifikasi Pemahaman Pasca-Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Setelah talaqqi bab [SEBUTKAN], aku jelaskan ulang (di bawah). Periksa keakuratan, koreksi, ajukan 3 pertanyaan penguji.

[METODE]

[LEVEL_BAHASA]

Penjelasanku: [TEMPEL]`,
        },
      ],
      eksplorasi: [
        {
          title: "Telaah Kitab-Kitab Hadits Induk",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan kitab-kitab hadits utama (kutub sittah & lainnya):
1. Karakter tiap kitab (Bukhari, Muslim, Sunan Arba'ah) + syarat penulisnya.
2. Istilah seperti muttafaq 'alaih, syaikhani.
3. Cara memanfaatkan kitab-kitab ini untuk takhrij sederhana.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Hubungkan Mustholah dengan Penilaian Hadits Nyata",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Ambil satu hadits [SEBUTKAN, atau aku tempel]:
1. Bagaimana ulama menilai derajatnya & apa pertimbangannya.
2. Kaidah mustholah apa yang berperan.
PENTING: kalau tidak yakin status/sanad, katakan; jangan mengarang penilaian.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Syubhat seputar Hadits & Jawabannya",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan secara ilmiah:
1. Syubhat umum terhadap otentisitas hadits (mis. "hadits ditulis terlambat").
2. Bagaimana sistem isnad & ilmu rijal menjawabnya.
3. Sajikan berimbang & berbasis ilmu mustholah.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  {
    id: "manahij-muhadditsin",
    name: "Manahij Al-Muhadditsin",
    nameArabic: "مناهج المحدثين",
    category: "haditsi",
    fakultas: ["ushuluddin", "dirasat"],
    jurusan: ["dirasat_ushuluddin"],
    tingkat: ["3", "4", "pasca"],
    description: "Metodologi para muhadditsin — manhaj Bukhari, Muslim, Tirmidzi, Abu Dawud, Nasa'i, Ibnu Majah dalam menyusun kitab-kitab hadits.",
    descriptionArabic: "مناهج العلماء في رواية وتدوين الحديث",
    kitabUtama: [
      { nama: "Manhaj An-Naqd fi 'Ulumil Hadits", arabic: "منهج النقد في علوم الحديث", penulis: "Nuruddin 'Itr" },
    ],
    recommendedAI: [
      { tool: "claude",      rank: 1, strength: "Komparasi mendalam manhaj antar imam hadits",    why: "Membandingkan manhaj 6 imam membutuhkan kemampuan menyintesis banyak informasi. Claude kuat dalam analisis komparatif tekstual." },
      { tool: "perplexity",  rank: 2, strength: "Verifikasi syarat dan karakteristik spesifik imam", why: "Perplexity bisa membantu verifikasi klaim spesifik tentang syarat seorang imam dengan referensi ke kitab muqaddimah atau studi akademik." },
    ],
    tutorial: {
      overview: "Memahami manhaj setiap imam membantu kita membaca kitab hadits mereka dengan lebih tepat.",
      steps: [
        { title: "Baca muqaddimah tiap kitab",    body: "Setiap imam hadits menjelaskan manhajnya di muqaddimah. Ini primer — baca muqaddimah Shahih Bukhari, muqaddimah Muslim, dan pengantar Tirmidzi di akhir kitabnya." },
        { title: "Pahami syarat shahih tiap imam", body: "Bukhari dan Muslim punya syarat berbeda. Memahami ini menjelaskan kenapa hadits yang ada di Bukhari tidak ada di Muslim dan sebaliknya." },
        { title: "Kenali ciri-ciri unik tiap kitab", body: "Tirmidzi selalu menyebutkan derajat hadits dan pendapat fuqaha. Abu Dawud fokus ke hadits hukum. Kenali karakter masing-masing." },
        { title: "Banding untuk memahami lebih dalam", body: "Saat mempelajari satu hadits, lihat bagaimana kitab berbeda meriiwayatkan. Ini buka perspektif tentang transmisi hadits." },
      ],
    },
    prompts: {
      pahami: [
        {
          title: "Peta Besar Manahij Al-Muhadditsin",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri kerangka utuh Manahij al-Muhadditsin (metode para ahli hadits):
1. Jenis karya hadits: jami', sunan, musnad, mu'jam, mustadrak, mustakhraj — definisi tiap.
2. Manhaj penyusunan (berdasarkan bab fiqh, berdasarkan sahabat, dll).
3. Outline bercabang.
4. Tujuan: memahami cara muhaddits menyusun & menyaring hadits.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Manhaj Bukhari & Muslim",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan manhaj dua kitab shahih:
1. Syarat Bukhari & Muslim dalam menerima hadits (beda keduanya).
2. Metode penyusunan & sistematika masing-masing.
3. Kenapa keduanya jadi kitab paling sahih + makna "muttafaq 'alaih".
PENTING: sebut yang kamu yakin; jika ragu, katakan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Manhaj Sunan & Musnad",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan jenis karya lain:
1. Sunan Arba'ah (Abu Dawud, Tirmidzi, Nasa'i, Ibn Majah) — ciri & manhaj masing-masing.
2. Musnad (mis. Musnad Ahmad) — cara penyusunan.
3. Perbedaan tingkat keketatan tiap kitab.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Istilah Penilaian Hadits di Tiap Kitab",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan istilah khas penilaian:
1. Istilah Tirmidzi (hasan shahih, dll) & maknanya.
2. Isyarat penulis sunan tentang derajat hadits.
3. Cara membaca komentar muhaddits dalam kitab.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Karakter Kutub Hadits Induk",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal:
1. Tabel: kitab | penulis | jenis | manhaj/syarat | ciri khas.
2. Mnemonic untuk urutan kutub sittah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Hafal Istilah Jenis Karya Hadits",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Daftar istilah (jami', sunan, musnad, mu'jam, dll) — Arab berharakat + definisi + contoh kitab. Tandai yang sering tertukar.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Manahij Muhadditsin",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Yang sudah kupelajari: [SEBUTKAN]. Jadwal muraja'ah H+1, H+3, H+7, mingguan + cara uji. Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Drill Identifikasi Jenis Karya dari Ciri",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 8 deskripsi ciri/sistematika kitab hadits. Tugasku: tentukan jenis karyanya (jami'/sunan/musnad/dll).
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Bandingkan Manhaj Dua Kitab",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 2 kitab hadits. Tugasku: bandingkan manhaj & tingkat keketatannya.
1. JANGAN beri jawaban dulu.
2. Koreksi perbandinganku.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Soal Definisi & Tokoh",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal campuran (definisi, ciri kitab, tokoh, istilah) dari bab [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Tahriri (Gaya Azhari)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian tulis Manahij Muhadditsin gaya Azhar untuk bab [SEBUTKAN]:
1. Tipe khas: tahaddats 'an manhaj..., qarin baina kitabain, bayyin syuruth..., 'arrif al-mushthalah.
2. 5-6 soal bobot bervariasi.
3. JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih + skor & catatan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Imtihan Syafawi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan syafawi.

Berperanlah sebagai mumtahin syafawi:
1. Tanya manhaj kitab, syarat penulis, ciri jenis karya.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik, naikkan kesulitan.
4. Penilaian akhir + area lemah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab yang kupelajari ([SEBUTKAN]): topik tersering jadi soal, cara jawab lengkap, prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (di bawah). Rapikan jadi: kitab → manhaj → syarat → ciri, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
        {
          title: "Verifikasi Pemahaman Pasca-Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Setelah talaqqi bab [SEBUTKAN], aku jelaskan ulang (di bawah). Periksa keakuratan, koreksi, ajukan 3 pertanyaan penguji.

[METODE]

[LEVEL_BAHASA]

Penjelasanku: [TEMPEL]`,
        },
      ],
      eksplorasi: [
        {
          title: "Sejarah Pembukuan (Tadwin) Hadits",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan sejarah tadwin hadits:
1. Tahap penulisan hadits dari masa Nabi sampai pembukuan resmi.
2. Peran Umar bin Abdul Aziz & az-Zuhri.
3. Perkembangan metode penyusunan kitab dari masa ke masa.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Telaah Tokoh Muhaddits Mendalam",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk muhaddits [SEBUTKAN, mis. Bukhari, Muslim, Ahmad]:
1. Biografi & perjalanan ilmiahnya.
2. Manhaj & kontribusinya.
3. Karya utamanya.
PENTING: kalau tidak yakin fakta, katakan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Hubungkan Manhaj dengan Penilaian Hadits",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan bagaimana mengetahui manhaj kitab membantu:
1. Menilai derajat hadits berdasarkan kitab sumbernya.
2. Memahami kenapa hadits diterima/ditolak penyusun.
3. Memanfaatkan kitab hadits secara tepat.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  {
    id: "takhrij-hadits",
    name: "Takhrij Hadits",
    nameArabic: "تخريج الحديث",
    category: "haditsi",
    fakultas: ["ushuluddin", "dirasat"],
    jurusan: ["dirasat_ushuluddin"],
    tingkat: ["3", "4", "pasca"],
    description: "Praktikum mencari sumber hadits dari kitab-kitab utama dan menilai derajatnya. AI bisa membantu penelusuran, tapi verifikasi ke kitab asli wajib.",
    descriptionArabic: "إخراج الأحاديث من مصادرها الأصلية",
    kitabUtama: [
      { nama: "Ushul At-Takhrij wa Dirasatil Asanid", arabic: "أصول التخريج ودراسة الأسانيد", penulis: "Mahmud Ath-Thahhan" },
      { nama: "Tuhfatul Asyraf",                       arabic: "تحفة الأشراف",                 penulis: "Al-Mizzi" },
    ],
    recommendedAI: [
      { tool: "perplexity",  rank: 1, strength: "Cari sumber hadits di web dengan referensi kitab", why: "Perplexity bisa membantu menemukan di mana hadits diriwayatkan dengan mengacu ke sumber online terpercaya." },
      { tool: "claude",      rank: 2, strength: "Analisis jalur sanad dan evaluasi derajat",        why: "Setelah menemukan sumber, Claude bisa membantu menganalisis struktur sanad dan penilaian ulama terhadap jalur hadits." },
    ],
    tutorial: {
      overview: "Takhrij adalah ilmu praktis — prosesnya bertahap dan WAJIB diverifikasi ke sumber primer.",
      steps: [
        { title: "Pahami metode takhrij",           body: "Ada 5 metode: via lafal pertama, via kata-kata langka dalam matan, via perawi atas (sahabat), via tema, via status hadits. Pilih metode yang paling efisien." },
        { title: "Gunakan alat bantu digital",      body: "Dorar.net, sunnah.com, dan aplikasi hadits digital adalah alat takhrij. AI bisa bantu menelusuri, tapi bukan pengganti verifikasi manual." },
        { title: "WAJIB verifikasi ke kitab asli",  body: "AI bisa halusinasi tentang sanad hadits. Selalu konfirmasi dengan membuka langsung kitab hadits aslinya atau platform terpercaya (Dorar.net, Al-Maktabah Asy-Syamilah)." },
        { title: "Nilai derajat setelah takhrij",   body: "Setelah menemukan sumber, nilai derajat berdasarkan rijal dan komentar ulama. Ini langkah terpisah dari menemukan sumber." },
      ],
    },
    prompts: {
      pahami: [
        {
          title: "Pahami Apa Itu Takhrij Hadits",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan ilmu takhrij hadits:
1. Definisi takhrij + tujuannya (melacak hadits ke sumber asli & menilai derajatnya).
2. Manfaat takhrij bagi penuntut ilmu.
3. Outline langkah-langkah takhrij secara umum.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami 5 Metode Takhrij",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan lima metode takhrij hadits:
1. Lewat lafazh awal matan.
2. Lewat lafazh yang masyhur dalam matan (pakai mu'jam mufahras).
3. Lewat perawi pertama (sahabat) — pakai kitab musnad/athraf.
4. Lewat tema hadits.
5. Lewat ciri khusus matan/sanad.
Untuk tiap metode: cara kerja + kitab/alat bantunya.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Cara Menilai Sanad Setelah Takhrij",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan tahap setelah menemukan hadits:
1. Mengumpulkan jalur (turuq) hadits.
2. Memeriksa perawi tiap sanad (pakai kitab rijal).
3. Menentukan derajat (shahih/hasan/dha'if) berdasar gabungan jalur (i'tibar, syahid, mutaba'ah).

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Alat & Kitab Bantu Takhrij",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan perangkat takhrij:
1. Kitab cetak (al-Mu'jam al-Mufahras, Tuhfah al-Asyraf, kitab athraf).
2. Aplikasi/perangkat digital modern untuk takhrij.
3. Kitab rijal untuk menilai perawi (mis. Tahdzib at-Tahdzib).
PENTING: sebut yang kamu yakin; jika ragu, katakan.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal 5 Metode Takhrij + Alatnya",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal 5 metode takhrij:
1. Tabel: metode | kapan dipakai | alat/kitab bantu.
2. Mnemonic untuk mengingat kelimanya.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Hafal Istilah Takhrij & Kitab Rijal",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Daftar istilah (i'tibar, mutaba'ah, syahid, athraf, dll) — Arab berharakat + arti + fungsi. Tandai yang sering jadi soal.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Takhrij",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Yang sudah kupelajari: [SEBUTKAN]. Jadwal muraja'ah H+1, H+3, H+7, mingguan + cara uji. Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Takhrij Mandiri (Aku Coba, AI Koreksi)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Aku akan men-takhrij hadits [tempel] dengan langkah yang kupahami (kutulis di bawah).
1. Koreksi: apakah metode yang kupilih tepat, langkahku benar, kesimpulan derajatnya beralasan.
2. Tunjukkan langkah yang terlewat.
PENTING: kalau tidak yakin status/sumber hadits, katakan; jangan mengarang.

[METODE]

[LEVEL_BAHASA]

Hadits + takhrij-ku: [TEMPEL]`,
        },
        {
          title: "Drill Pilih Metode Takhrij yang Tepat",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 6 situasi (mis. "aku hanya tahu lafazh akhir hadits", "aku tahu sahabat perawinya"). Tugasku: tentukan metode takhrij paling tepat.
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Soal Definisi & Langkah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal campuran (definisi, metode, alat, istilah) dari bab [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Tahriri (Gaya Azhari)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian tulis Takhrij gaya Azhar untuk bab [SEBUTKAN]:
1. Tipe khas: 'arrif, udzkur thuruq at-takhrij, kayfa tukharrij..., bayyin khutuwat.
2. 5-6 soal bobot bervariasi.
3. JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih + skor & catatan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Imtihan Syafawi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan syafawi.

Berperanlah sebagai mumtahin syafawi:
1. Tanya metode takhrij, langkah, alat, istilah.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik, naikkan kesulitan.
4. Penilaian akhir + area lemah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab yang kupelajari ([SEBUTKAN]): topik tersering jadi soal, cara jawab lengkap (langkah takhrij berurutan), prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (di bawah). Rapikan jadi: metode → langkah → alat, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
        {
          title: "Verifikasi Pemahaman Pasca-Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Setelah talaqqi bab [SEBUTKAN], aku jelaskan ulang (di bawah). Periksa keakuratan, koreksi, ajukan 3 pertanyaan penguji.

[METODE]

[LEVEL_BAHASA]

Penjelasanku: [TEMPEL]`,
        },
      ],
      eksplorasi: [
        {
          title: "Takhrij dengan Perangkat Digital Modern",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan takhrij di era digital:
1. Bagaimana perangkat digital mempercepat takhrij.
2. Kelebihan & keterbatasannya dibanding metode klasik.
3. Kenapa pemahaman metode klasik tetap penting meski ada alat digital.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Studi Kasus Takhrij Hadits Lengkap",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Ambil hadits [tempel/sebut]. Demonstrasikan takhrij lengkap:
1. Metode yang dipilih + alasannya.
2. Langkah pelacakan ke sumber.
3. Pengumpulan jalur & penilaian derajat.
PENTING: kalau tidak yakin sumber/status, katakan; jangan mengarang sanad/penilaian.

[METODE]

[LEVEL_BAHASA]

Hadits: [TEMPEL]`,
        },
        {
          title: "Takhrij sebagai Benteng dari Hadits Palsu",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan peran takhrij melawan penyebaran hadits lemah/palsu:
1. Bagaimana takhrij membantu memverifikasi hadits yang beredar.
2. Pentingnya keterampilan ini di era media sosial.
3. Adab menyebarkan hadits.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  /* ============================================================
     BATCH 2 — FIQHI & AQDI (9 Maddah)
     ============================================================ */

  {
    id: "fiqh-madzhabi",
    name: "Fiqh (Madzhabi)",
    nameArabic: "الفقه المذهبي",
    category: "fiqhi",
    fakultas: ["syariah", "dirasat", "dirasat-banin", "ushuluddin"],
    jurusan: ["dirasat_syariah"],
    tingkat: ["1", "2", "3", "4", "5", "pasca"],
    description: "Fiqh berdasarkan satu madzhab (Syafi'i/Hanafi/Maliki/Hanbali) — thaharah, shalat, zakat, puasa, haji, muamalat. Fondasi hukum ibadah dan muamalah Masisir.",
    descriptionArabic: "الفقه على مذهب من المذاهب الأربعة",
    kitabUtama: [
      { nama: "Al-Yaqut An-Nafis / Fathul Qarib", arabic: "الياقوت النفيس / فتح القريب", penulis: "Syafi'i: Ibnu Hajar Al-Haitsami / Ibnu Qasim Al-Ghazi" },
      { nama: "Nurul Idhah",                       arabic: "نور الإيضاح",                 penulis: "Hanafi: Asy-Shurunbulali" },
      { nama: "Mukhtashar Al-Khalil",              arabic: "مختصر خليل",                  penulis: "Maliki: Khalil ibn Ishaq" },
      { nama: "Akhshar Al-Mukhtasharat",           arabic: "أخصر المختصرات",              penulis: "Hanbali: Ibnu Balban" },
    ],
    recommendedAI: [
      { tool: "notebooklm", rank: 1, strength: "Drill matan fiqh madzhab, navigasi kitab yang di-upload", why: "Upload matan kitab madzhab yang dipelajari — NotebookLM bisa drill dan menjawab pertanyaan spesifik berdasarkan teks." },
      { tool: "claude",     rank: 2, strength: "Penjelasan furu' fiqh, dalil, dan pendapat dalam madzhab", why: "Claude bagus untuk menjelaskan detail masalah fiqh dengan dalilnya dan variasi pendapat dalam satu madzhab." },
    ],
    tutorial: {
      overview: "Fiqh madzhabi adalah pondasi — pelajari madzhab yang sesuai dengan kurikulummu.",
      steps: [
        { title: "Kenali madzhab yang dipelajari",    body: "Di Al-Azhar, Fakultas Syariah biasanya pelajari fiqh Syafi'i dan Hanafi. Pastikan kamu tahu madzhab mana yang jadi fokus per matakuliah." },
        { title: "Upload matan kitab ke NotebookLM",  body: "Upload PDF kitab fiqh madzhab (Fathul Qarib, dll) ke NotebookLM untuk drill berbasis teks asli — hindari halusinasi." },
        { title: "Pahami struktur bab fiqh",          body: "Fiqh terstruktur: thaharah → shalat → zakat → puasa → haji → muamalat → munakahat → jinayat. Pelajari per bab, jangan loncat-loncat." },
        { title: "Tanya dalil setiap masalah",        body: "Saat belajar furu' fiqh, selalu tanya: 'Dalil apa yang dipakai madzhab ini?' Ini penting untuk ujian dan pemahaman mendalam." },
      ],
    },
    prompts: {
      pahami: [
        {
          title: "Peta Kitab Fiqh & Sistematika Bab",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH] (madzhab [SEBUTKAN MADZHAB, mis. Syafi'i]).

Beri aku peta besar fiqh madzhab ini:
1. Sistematika bab fiqh klasik (thaharah → shalat → zakat → shaum → haji → muamalah → munakahat → jinayat → dst).
2. Kitab rujukan utama madzhab ini di Azhar + posisinya (matan, syarah, hasyiyah).
3. Tampilkan sebagai outline agar aku punya gambaran utuh.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Satu Mas'alah Fiqh secara Tuntas",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH] (madzhab [SEBUTKAN]).

Jelaskan mas'alah [SEBUTKAN MAS'ALAH] secara tuntas dalam madzhab ini:
1. Hukumnya + dalil (ayat/hadits dengan teks Arab berharakat — jangan mengarang dalil).
2. Syarat, rukun, dan hal yang membatalkan (bila relevan).
3. Khilaf di dalam madzhab (qaul qadim/jadid, atau antar ashhab) bila ada.
4. Istilah teknis fiqh yang muncul + artinya.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Istilah & Kategori Hukum (Ahkam Taklifi)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan fondasi yang sering muncul di kitab fiqh:
1. Al-Ahkam at-Taklifiyah (wajib, mandub, mubah, makruh, haram) + al-Ahkam al-Wadh'iyah (sabab, syarat, mani') — teks Arab berharakat + arti + contoh.
2. Istilah seperti fardh 'ain/kifayah, sunnah muakkadah/ghairu muakkadah, sah/batal/fasid.
3. Kapan tiap istilah dipakai.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Bandingkan Pendapat dalam Madzhab (Tarjih)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH] (madzhab [SEBUTKAN]).

Untuk mas'alah [SEBUTKAN], di dalam madzhab ini ada beberapa pendapat:
1. Sebutkan pendapat-pendapat (mis. mu'tamad vs marjuh) + siapa yang memegangnya bila kamu tahu.
2. Dalil/alasan tiap pendapat.
3. Pendapat mu'tamad (yang difatwakan) dalam madzhab.
PENTING: kalau tidak yakin rujukan/penisbatan, katakan terus terang.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Syarat & Rukun dengan Mnemonic",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu aku menghafal syarat/rukun [SEBUTKAN, mis. rukun shalat, syarat wudhu]:
1. Daftar lengkap (teks Arab berharakat + arti).
2. Mnemonic/jembatan keledai Indonesia agar mudah diingat.
3. Urutan yang benar bila urutan penting.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Tabel Perbandingan Hukum untuk Dihafal",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Buatkan tabel hafalan untuk bab [SEBUTKAN]:
1. Kolom: kasus / hukum / syarat / dalil ringkas.
2. Isi ringkas tapi akurat (istilah Arab berharakat).
3. Tandai poin yang sering tertukar.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Bab Fiqh",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah:
1. Kelompokkan bab yang berkaitan.
2. Jadwal H+1, H+3, H+7, mingguan.
3. Cara menguji (sebutkan hukum+dalil, selesaikan kasus).
4. Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Kasus Fiqh (Tathbiq)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH] (madzhab [SEBUTKAN]).

Beri aku 8 kasus (nazilah) fiqh dari bab [SEBUTKAN]. Tugasku: tentukan hukumnya menurut madzhab + alasannya.
1. Tulis kasusnya.
2. JANGAN beri jawaban dulu.
3. Setelah aku jawab, koreksi: hukum yang benar + dalil/ta'lil-nya.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Soal Pilihan & Ta'lil",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal campuran (definisi, hukum, ta'lil) dari bab [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Setelah aku jawab, koreksi + jelaskan illat tiap hukum.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Bandingkan Jawabanku dengan 'Ibarah Kitab",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Aku menulis jawaban untuk mas'alah [SEBUTKAN] (di bawah). Bandingkan dengan 'ibarah/redaksi kitab madzhab yang baku:
1. Apakah jawabanku tepat secara madzhab?
2. Istilah/redaksi yang seharusnya kupakai.
3. Yang kurang/keliru.

[METODE]

[LEVEL_BAHASA]

Jawabanku: [TEMPEL]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Tahriri Fiqh (Gaya Azhari)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian tulis Fiqh gaya Azhar untuk bab [SEBUTKAN]:
1. Tipe khas: 'arrif (definisikan), udzkur al-hukm wad-dalil, ma hukm... ma'a at-ta'lil, qaranat baina.
2. 5-6 soal bobot bervariasi.
3. JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih Azhar + skor & catatan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Imtihan Syafawi Fiqh",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan syafawi.

Berperanlah sebagai mumtahin syafawi Fiqh:
1. Tanya definisi, hukum + dalil, penyelesaian kasus.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik, naikkan kesulitan.
4. Penilaian akhir + area lemah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian Fiqh",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab yang kupelajari ([SEBUTKAN]):
1. Bab yang paling sering jadi soal ta'lil & kasus.
2. Tipe soal paling mungkin keluar.
3. Cara menulis jawaban fiqh yang dapat nilai penuh (sebut hukum + dalil + ta'lil).
4. Prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi Fiqh",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku (di bawah) berantakan. Bantu:
1. Rapikan jadi poin hukum + dalil + ta'lil.
2. Lengkapi harakat istilah Arab.
3. Tandai yang perlu ditanyakan lagi.
4. Ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
        {
          title: "Verifikasi Pemahaman Pasca-Talaqqi Fiqh",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Setelah talaqqi bab [SEBUTKAN], aku jelaskan ulang (di bawah):
1. Periksa keakuratan secara madzhab, koreksi + dalil berharakat.
2. Ajukan 3 pertanyaan penguji.

[METODE]

[LEVEL_BAHASA]

Penjelasanku: [TEMPEL]`,
        },
      ],
      eksplorasi: [
        {
          title: "Telusuri Dalil & Wajh Istidlal",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk hukum [SEBUTKAN] dalam madzhab [SEBUTKAN]:
1. Dalil utamanya (ayat/hadits — teks Arab berharakat, sebut sumber; jangan mengarang).
2. Wajh istidlal (bagaimana dalil menunjukkan hukum).
3. Apakah ada dalil yang tampak bertentangan & bagaimana madzhab menyelesaikannya.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Fiqh Kontemporer & Tatbiq Nyata",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk bab [SEBUTKAN], bantu aku melihat penerapan nyata:
1. Bagaimana kaidah klasik diterapkan ke kasus kontemporer (mis. muamalah modern, ibadah dalam kondisi khusus).
2. Hal yang perlu hati-hati saat mengqiyaskan.
3. Mengapa pemahaman ushul penting agar tidak salah terap.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Bandingkan Lintas Madzhab (Pengantar Muqaran)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk mas'alah [SEBUTKAN], bandingkan 4 madzhab secara ringkas:
1. Tabel: Madzhab | Hukum | Dalil utama | Wajh istidlal.
2. Sumber pendapat bila kamu tahu (jika ragu, katakan).
3. Catatan: ini untuk memahami, bukan rukhshah shopping.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    }
  },

  {
    id: "fiqh-muqaran",
    name: "Fiqh Muqaran",
    nameArabic: "الفقه المقارن",
    category: "fiqhi",
    fakultas: ["syariah", "dirasat"],
    jurusan: ["dirasat_syariah"],
    tingkat: ["3", "4", "5", "pasca"],
    description: "Perbandingan fiqh antar 4 madzhab — dalil, wajh istidlal, tarjih ulama. Ilmu inti di Fakultas Syariah. Cocok juga dipadukan dengan fitur Muqaranah di Talqeeh.",
    descriptionArabic: "مقارنة الفقه بين المذاهب",
    kitabUtama: [
      { nama: "Bidayatul Mujtahid",            arabic: "بداية المجتهد",              penulis: "Ibnu Rusyd Al-Hafid" },
      { nama: "Al-Fiqh Al-Islami wa Adillatuh", arabic: "الفقه الإسلامي وأدلته",    penulis: "Wahbah Az-Zuhaili" },
      { nama: "Al-Mughni",                     arabic: "المغني",                    penulis: "Ibnu Qudamah Al-Maqdisi" },
    ],
    recommendedAI: [
      { tool: "claude",      rank: 1, strength: "Komparasi madzhab, analisis dalil, identifikasi sebab khilaf", why: "Fiqh Muqaran butuh AI yang bisa menyintesis pendapat 4 madzhab sekaligus beserta dalilnya. Claude kuat dalam analisis multi-perspektif." },
      { tool: "perplexity",  rank: 2, strength: "Verifikasi pendapat dan referensi kitab madzhab",              why: "Perplexity membantu verifikasi apakah pendapat yang disebut akurat dengan referensi ke kitab madzhab yang dapat diakses." },
    ],
    tutorial: {
      overview: "Fiqh Muqaran butuh pemahaman fiqh madzhabi dulu — ini level lanjut setelah dasar madzhab.",
      steps: [
        { title: "Rumuskan masalah dengan jelas",      body: "Tentukan masalah yang diperbandingkan dengan spesifik (mis. 'Hukum isbal sarung dalam shalat' bukan 'Pakaian dalam Islam')." },
        { title: "Kumpulkan pendapat 4 madzhab",       body: "Untuk tiap madzhab: apa pendapatnya, dalil apa yang digunakan, cara istidlal bagaimana. Claude bisa bantu ini, tapi verifikasi ke Bidayatul Mujtahid atau kitab muqaranah." },
        { title: "Identifikasi sebab khilaf",          body: "Kebanyakan khilaf bersumber dari: perbedaan riwayat hadits, perbedaan pemahaman lafal, atau perbedaan kaidah ushul. Identifikasi akar perbedaan." },
        { title: "Manfaatkan fitur Muqaranah Talqeeh",  body: "Untuk menyusun muqaranah terstruktur, gunakan fitur Muqaranah di Talqeeh. AI membantu draft, kamu verify dan lengkapi." },
      ],
    },
    prompts: {
      pahami: [
        {
          title: "Pahami Metode Fiqh Muqaran (Perbandingan)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan apa itu fiqh muqaran & cara kerjanya:
1. Definisi fiqh muqaran + bedanya dengan fiqh madzhabi.
2. Langkah muqaranah: tahrir mahall an-niza' → paparan pendapat + dalil → munaqasyah dalil → tarjih.
3. Adab & syarat muqaranah yang ilmiah (bukan sekadar cari yang mudah).
4. Kitab rujukan (mis. Bidayatul Mujtahid Ibn Rusyd, Al-Fiqh 'ala al-Madzahib al-Arba'ah) + karakternya.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Muqaranah Satu Mas'alah (Demonstrasi Lengkap)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Lakukan muqaranah lengkap untuk mas'alah [SEBUTKAN]:
1. Tahrir mahall an-niza' (di mana titik perbedaannya).
2. Pendapat tiap madzhab (Hanafi, Maliki, Syafi'i, Hanbali) + dalil masing-masing (teks Arab berharakat untuk dalil; jangan mengarang).
3. Munaqasyah (diskusi kekuatan tiap dalil).
4. Tarjih + alasannya, dengan adab (tanpa merendahkan madzhab lain).

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Sebab Ikhtilaf Fuqaha",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan asbab ikhtilaf al-fuqaha (sebab perbedaan ulama):
1. Sebab terkait dalil (perbedaan riwayat, keabsahan hadits, lafazh musytarak).
2. Sebab terkait kaidah ushul (mafhum mukhalafah, 'am-khas, qiyas).
3. Sebab terkait metode istinbath.
Beri contoh tiap sebab + kenapa memahami ini penting agar tidak fanatik.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Adab Ikhtilaf & Sikap Bermadzhab",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan adab dalam menyikapi perbedaan madzhab:
1. Sikap ilmiah terhadap khilaf yang mu'tabar.
2. Beda ikhtilaf tanawwu' vs ikhtilaf tadhadd.
3. Bahaya talfiq & tatabbu' rukhash (cari-cari yang mudah).
4. Sikap pertengahan: menghormati madzhab tanpa fanatik buta.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Tabel Perbandingan 4 Madzhab untuk Dihafal",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk mas'alah [SEBUTKAN], buatkan tabel hafalan:
1. Kolom: Madzhab | Hukum | Dalil utama (ringkas).
2. Tandai titik perbedaan inti.
3. Sebutkan pendapat rajih bila ada.
PENTING: sebut dalil dengan benar; jika ragu, katakan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Hafal Sebab-Sebab Ikhtilaf",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal kategori asbab ikhtilaf:
1. Daftar sebab (Arab berharakat + arti) dikelompokkan.
2. Mnemonic untuk mengingatnya.
3. Satu contoh mas'alah untuk tiap sebab.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Fiqh Muqaran",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Mas'alah yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah H+1, H+3, H+7, mingguan + cara uji (sebut pendapat madzhab + dalil + tarjih). Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Muqaranah Mandiri (Aku Coba, AI Koreksi)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Aku akan melakukan muqaranah untuk mas'alah [SEBUTKAN] dengan kemampuanku (kutulis di bawah).
1. Koreksi: apakah tahrir mahall niza'-ku tepat, pendapat & dalil akurat, tarjih beralasan.
2. Tunjukkan langkah yang terlewat.
3. Lengkapi dgn rujukan mu'tabar (jika ragu, katakan).

[METODE]

[LEVEL_BAHASA]

Muqaranah-ku: [TEMPEL]`,
        },
        {
          title: "Drill Munaqasyah Dalil",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 5 mas'alah khilafiyah beserta dalil tiap pendapat. Tugasku: lakukan munaqasyah (kritik kekuatan tiap dalil).
1. JANGAN beri jawaban dulu.
2. Setelah aku jawab, koreksi penalaran munaqasyah-ku.
PENTING: dalil yang benar; jika ragu, katakan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Identifikasi Sebab Ikhtilaf",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 6 mas'alah khilafiyah. Tugasku: tentukan apa sebab ikhtilaf di tiap mas'alah.
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab + jelaskan.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Tahriri Fiqh Muqaran (Gaya Azhari)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian tulis Fiqh Muqaran gaya Azhar untuk mas'alah [SEBUTKAN]:
1. Tipe khas: qarin baina al-madzahib fi..., udzkur al-adillah ma'a al-munaqasyah, rajjih ma'a bayan as-sabab, ma sabab al-ikhtilaf.
2. 5-6 soal bobot bervariasi.
3. JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih + skor & catatan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Imtihan Syafawi Fiqh Muqaran",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan syafawi.

Berperanlah sebagai mumtahin syafawi:
1. Minta aku paparkan khilaf, dalil, munaqasyah, & tarjih secara lisan.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik, naikkan kesulitan.
4. Penilaian akhir + area lemah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian Fiqh Muqaran",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari mas'alah yang kupelajari ([SEBUTKAN]): mas'alah yang sering jadi soal muqaranah, cara menulis jawaban lengkap (tahrir niza' + dalil + munaqasyah + tarjih), prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi Fiqh Muqaran",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (di bawah). Rapikan jadi: mas'alah → pendapat tiap madzhab + dalil → tarjih, lengkapi harakat, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
        {
          title: "Verifikasi Pemahaman Pasca-Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Setelah talaqqi mas'alah [SEBUTKAN], aku jelaskan ulang muqaranah-nya (di bawah). Periksa keakuratan pendapat & dalil, koreksi, ajukan 3 pertanyaan penguji.

[METODE]

[LEVEL_BAHASA]

Penjelasanku: [TEMPEL]`,
        },
      ],
      eksplorasi: [
        {
          title: "Fiqh Muqaran untuk Masalah Kontemporer",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk masalah kontemporer [SEBUTKAN, mis. transaksi digital, isu medis]:
1. Bagaimana pendekatan madzhab/ulama berbeda menyikapinya.
2. Dalil & qiyas yang dipakai tiap pendapat.
3. Pendapat lembaga fatwa kontemporer bila kamu tahu (jika ragu, katakan).
PENTING: jangan mengarang fatwa/dalil.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Telaah Manhaj Tarjih Ulama",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan cara ulama melakukan tarjih:
1. Murajjihat (faktor penguat) dari sisi sanad, matan, dilalah.
2. Bagaimana menimbang saat dalil tampak sama kuat.
3. Contoh penerapan tarjih pada satu mas'alah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Hubungkan Fiqh Muqaran dengan Ushul & Maqashid",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk mas'alah [SEBUTKAN]:
1. Tunjukkan bagaimana perbedaan kaidah ushul tiap madzhab menghasilkan hukum berbeda.
2. Bagaimana pertimbangan maqashid syariah berperan dalam tarjih.
3. Kenapa penguasaan ushul penting untuk fiqh muqaran yang benar.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  {
    id: "qawaid-fiqhiyyah",
    name: "Qawa'id Fiqhiyyah",
    nameArabic: "القواعد الفقهية",
    category: "fiqhi",
    fakultas: ["syariah", "dirasat"],
    jurusan: ["dirasat_syariah"],
    tingkat: ["3", "4", "5", "pasca"],
    description: "Kaidah-kaidah umum fiqh yang menghimpun furu' — al-umuru bi maqashidiha, al-yaqinu la yazulu bisy syakk, al-masyaqqatu tajlibut taysir, dan lainnya.",
    descriptionArabic: "القواعد العامة التي تجمع فروع الفقه",
    kitabUtama: [
      { nama: "Al-Asybah wan Nazha'ir",       arabic: "الأشباه والنظائر",           penulis: "As-Suyuthi" },
      { nama: "Al-Wajiz fi Idhah Qawa'idil Fiqh", arabic: "الوجيز في إيضاح قواعد الفقه", penulis: "Muhammad Shidqi Al-Burnu" },
    ],
    recommendedAI: [
      { tool: "notebooklm", rank: 1, strength: "Drill hafal kaidah dan turunannya",             why: "Upload Al-Asybah atau kitab manzhumah kaidah untuk drill hafalan dan aplikasi kaidah dengan source yang akurat." },
      { tool: "claude",     rank: 2, strength: "Aplikasi kaidah ke furu' fiqh dan kasus baru",  why: "Claude bagus untuk membantu mengaplikasikan kaidah ke kasus-kasus fiqh konkret dan menjelaskan hubungan kaidah induk dengan turunannya." },
    ],
    tutorial: {
      overview: "Qawa'id Fiqhiyyah adalah abstraksi dari furu' — hafal kaidah, lalu latih aplikasinya.",
      steps: [
        { title: "Hafal 5 kaidah asasiyah dulu", body: "5 kaidah utama: al-umuru bi maqashidiha, al-yaqin la yazulu bisy syakk, al-masyaqqatu tajlibut taysir, ad-dhararu yuzal, al-'adatu muhakkamah. Ini fondasi." },
        { title: "Pahami kaidah turunan",        body: "Dari setiap kaidah asasiyyah lahir banyak kaidah turunan (furu'). Pelajari perlahan — jangan coba hafal semua sekaligus." },
        { title: "Latihan aplikasi ke furu'",    body: "Kaidah baru 'hidup' saat diaplikasikan ke kasus fiqh. Selalu latih: 'Kaidah mana yang berlaku di kasus X?'" },
        { title: "Perhatikan pengecualian",      body: "Setiap kaidah ada pengecualian (mustatsna). Hafal pengecualian yang paling penting — ini yang sering muncul di ujian." },
      ],
    },
    prompts: {
      pahami: [
        {
          title: "Peta Besar Qawa'id Fiqhiyyah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri kerangka utuh Qawa'id Fiqhiyyah:
1. Definisi qaidah fiqhiyyah + bedanya dengan ushul fiqh & dhabit fiqhi.
2. Lima kaidah induk (al-qawa'id al-kubra al-khams) — sebutkan teks Arab berharakat + arti.
3. Kitab rujukan (mis. Al-Asybah wan Nazhair As-Suyuthi) + karakternya.
4. Outline agar utuh.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami 5 Kaidah Induk secara Tuntas",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan al-qawa'id al-khams al-kubra satu per satu:
1. الأمور بمقاصدها (al-umur bi maqashidiha)
2. اليقين لا يزول بالشك (al-yaqin la yazul bisy-syakk)
3. المشقة تجلب التيسير (al-masyaqqah tajlib at-taisir)
4. الضرر يزال (adh-dharar yuzal)
5. العادة محكمة (al-'adah muhakkamah)
Untuk tiap kaidah: makna (Arab berharakat + arti), dalil, contoh penerapan, kaidah cabang di bawahnya.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Kaidah Cabang & Furu'-nya",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk kaidah induk [SEBUTKAN], jelaskan kaidah-kaidah cabangnya:
1. Kaidah cabang (Arab berharakat + arti).
2. Contoh furu' fiqhiyyah tiap cabang.
3. Pengecualian (mustatsnayat) bila ada.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Beda Qaidah, Dhabit, Nazhariyyah Fiqhiyyah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan perbedaan istilah yang sering tertukar:
1. Qaidah fiqhiyyah vs dhabit fiqhi (cakupan).
2. Qaidah fiqhiyyah vs nazhariyyah fiqhiyyah.
3. Qaidah fiqhiyyah vs qaidah ushuliyyah.
Sertakan contoh tiap untuk memperjelas.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal 5 Kaidah Induk + Dalilnya",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal 5 kaidah induk:
1. Teks Arab berharakat + arti tiap kaidah.
2. Dalil ringkas tiap kaidah.
3. Mnemonic untuk mengingat kelimanya berurutan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Tabel Kaidah + Contoh Furu' untuk Dihafal",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Buatkan tabel hafalan kaidah bab [SEBUTKAN]:
1. Kolom: kaidah (Arab berharakat) | arti | 1 contoh furu'.
2. Tandai kaidah yang sering jadi soal.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Qawa'id",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Kaidah yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah H+1, H+3, H+7, mingguan + cara uji (sebut kaidah + terapkan ke furu'). Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Drill Terapkan Kaidah ke Kasus (Tathbiq)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 8 kasus fiqh. Tugasku: tentukan kaidah fiqhiyyah mana yang berlaku + alasannya.
1. Tulis kasusnya.
2. JANGAN beri jawaban dulu.
3. Setelah aku jawab, koreksi: kaidah yang benar + cara penerapannya.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Identifikasi Kaidah dari Furu'",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 8 furu' fiqhiyyah (hukum kasus tertentu). Tugasku: tebak kaidah induk/cabang di baliknya.
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab + jelaskan kaitannya.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Soal Definisi & Perbedaan Kaidah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal campuran (definisi kaidah, beda dua kaidah, contoh furu') dari bab [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Tahriri Qawa'id (Gaya Azhari)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian tulis Qawa'id Fiqhiyyah gaya Azhar untuk bab [SEBUTKAN]:
1. Tipe khas: 'arrif al-qaidah + matsil, thabbiq al-qaidah 'ala..., ma al-farq baina qa'idatain, udzkur al-mustatsnayat.
2. 5-6 soal bobot bervariasi.
3. JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih + skor & catatan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Imtihan Syafawi Qawa'id",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan syafawi.

Berperanlah sebagai mumtahin syafawi:
1. Minta aku sebut kaidah + dalil, lalu terapkan ke kasus secara lisan.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik, naikkan kesulitan.
4. Penilaian akhir + area lemah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian Qawa'id",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab yang kupelajari ([SEBUTKAN]): kaidah yang sering jadi soal tathbiq, cara jawab dapat nilai penuh (sebut kaidah + dalil + contoh furu'), prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi Qawa'id",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (di bawah). Rapikan jadi: kaidah → makna → contoh furu', lengkapi harakat, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
        {
          title: "Verifikasi Pemahaman Pasca-Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Setelah talaqqi kaidah [SEBUTKAN], aku jelaskan ulang + beri contoh furu' buatanku (di bawah). Periksa keakuratan, koreksi contoh yang keliru, ajukan 3 pertanyaan penguji.

[METODE]

[LEVEL_BAHASA]

Penjelasanku: [TEMPEL]`,
        },
      ],
      eksplorasi: [
        {
          title: "Sejarah & Perkembangan Qawa'id Fiqhiyyah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan perkembangan ilmu qawa'id fiqhiyyah:
1. Asal-usul & tahap perkembangannya.
2. Ulama & kitab penting tiap tahap (mis. Al-Asybah wan Nazhair).
3. Posisi qawa'id dalam tradisi madzhab.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Qawa'id untuk Masalah Kontemporer",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Tunjukkan bagaimana kaidah fiqhiyyah dipakai untuk masalah kontemporer:
1. Ambil kaidah [SEBUTKAN, mis. adh-dharar yuzal].
2. Terapkan ke kasus modern (mis. muamalah, medis, teknologi).
3. Hal yang perlu hati-hati saat menerapkannya.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Hubungkan Qawa'id dengan Maqashid Syariah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan kaitan qawa'id fiqhiyyah dengan maqashid syariah:
1. Bagaimana kaidah mencerminkan maqashid (hifzh ad-din, nafs, 'aql, nasl, mal).
2. Contoh kaidah yang berakar pada maqashid tertentu.
3. Kenapa memahami maqashid memperkuat penerapan kaidah.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  {
    id: "ahwal-syakhsiyah",
    name: "Ahwal Syakhshiyah",
    nameArabic: "الأحوال الشخصية",
    category: "fiqhi",
    fakultas: ["syariah", "dirasat"],
    jurusan: ["dirasat_syariah"],
    tingkat: ["3", "4", "5", "pasca"],
    description: "Hukum keluarga Islam — nikah, talaq, 'iddah, ruju', nafaqah, hadhanah, dan faraidh (pembagian warisan).",
    descriptionArabic: "أحكام الأسرة والميراث",
    kitabUtama: [
      { nama: "Al-Ahwal Asy-Syakhshiyyah", arabic: "الأحوال الشخصية",     penulis: "Muhammad Abu Zahrah" },
      { nama: "Fiqhus Sunnah",             arabic: "فقه السنة",            penulis: "Sayyid Sabiq (bab munakahat-mawarits)" },
    ],
    recommendedAI: [
      { tool: "claude",      rank: 1, strength: "Analisis kasus keluarga, hitung faraidh, khilaf munakahat", why: "Ahwal Syakhshiyah punya banyak kasus dengan variabel kompleks. Claude kuat menangani kasus berlapis dan menjelaskan jalur hukumnya." },
      { tool: "notebooklm",  rank: 2, strength: "Drill kaidah mawarits dan tabel ashabah",                  why: "Upload tabel ahli waris dan kaidah faraidh ke NotebookLM untuk drill langkah-langkah hitung warisan secara sistematis." },
    ],
    tutorial: {
      overview: "Ahwal Syakhshiyah mencakup dua besar: munakahat (keluarga) dan mawarits (warisan).",
      steps: [
        { title: "Pahami bab munakahat dulu",        body: "Mulai dari: syarat & rukun nikah → wali → mahar → larangan nikah → hak & kewajiban suami-istri → talaq-fasakh → 'iddah → ruju'." },
        { title: "Mawarits butuh metode tersendiri",  body: "Faraidh/mawarits adalah hitungan — ada langkah: siapa ahli waris, siapa yang dapat, berapa bagian, siapa yang terhijab. Pelajari bertahap." },
        { title: "Latihan hitung warisan berulang",  body: "Satu-satunya cara mahir faraidh adalah latihan kasus berulang. Minta AI beri kasus dari mudah ke kompleks." },
        { title: "Perhatikan perbedaan madzhab",     body: "Masalah nikah dan warisan adalah area dengan banyak khilaf antar madzhab. Pastikan tahu yang berlaku sesuai kurikulummu." },
      ],
    },
    prompts: {
      pahami: [
        {
          title: "Peta Besar Ahwal Syakhshiyah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri kerangka utuh fiqh Ahwal Syakhshiyah (hukum keluarga):
1. Cakupan: nikah (zawaj), talak, 'iddah, nafkah, hadhanah (pengasuhan), waris (mawarits/faraidh).
2. Posisinya dalam fiqh & kaitannya dengan UU keluarga di negara muslim.
3. Outline bab bercabang.
4. Kenapa maddah ini sangat aplikatif dalam kehidupan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Bab Nikah (Zawaj) Tuntas",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan bab nikah:
1. Definisi, hukum, & hikmah nikah (teks Arab istilah berharakat).
2. Rukun & syarat sah nikah.
3. Mahar, wali, saksi, ijab-kabul.
4. Mahram (yang haram dinikahi) — permanen & sementara.
PENTING: sebut dalil dengan benar; jika ragu, katakan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Talak, 'Iddah & Akibatnya",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan bab perceraian:
1. Jenis talak (raj'i, bain, sunni, bid'i) — definisi + hukum.
2. Khulu', fasakh, li'an, zhihar — bedanya.
3. 'Iddah: jenis & masa tiap kondisi.
4. Akibat hukum (nafkah 'iddah, rujuk, status anak).

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Dasar Ilmu Faraidh (Waris)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan dasar ilmu mawarits/faraidh:
1. Rukun & syarat waris, penghalang (mawani') waris.
2. Ashabul furudh (yang dapat bagian tetap) + besaran bagiannya (1/2, 1/4, 1/8, 2/3, 1/3, 1/6).
3. 'Ashabah (yang dapat sisa) & jenisnya.
4. Konsep hijab (penghalang sebagian/total).

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Ashabul Furudh & Bagiannya",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal ashabul furudh:
1. Tabel: ahli waris | bagian | syarat mendapatkannya.
2. Mnemonic untuk mengingat siapa dapat 1/2, 1/4, 1/6, dst.
3. Tandai yang sering tertukar.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Hafal Rukun & Syarat (Nikah/Talak/Waris)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal rukun & syarat bab [SEBUTKAN]:
1. Daftar lengkap (Arab berharakat + arti).
2. Mnemonic.
3. Urutan bila penting.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Ahwal Syakhshiyah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah H+1, H+3, H+7, mingguan + cara uji (sebut hukum + selesaikan kasus). Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Hitung Pembagian Waris",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 5 kasus pembagian waris (sebut ahli waris yang ada & jumlah harta). Tugasku: hitung bagian tiap ahli waris.
1. Tulis kasusnya.
2. JANGAN beri jawaban dulu.
3. Setelah aku hitung, koreksi: bagian benar + cara perhitungan ('aul/radd bila ada).

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Kasus Nikah/Talak (Tathbiq)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 6 kasus seputar nikah/talak/'iddah. Tugasku: tentukan hukum & solusinya.
1. Tulis kasusnya.
2. JANGAN beri jawaban dulu.
3. Koreksi + sebutkan dalil/kaidahnya.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Soal Definisi & Hukum",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal campuran (definisi, rukun, hukum, beda istilah) dari bab [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Tahriri (Gaya Azhari)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian tulis Ahwal Syakhshiyah gaya Azhar untuk bab [SEBUTKAN]:
1. Tipe khas: 'arrif, udzkur al-hukm wad-dalil, mas'alah hisabiyah (kasus waris), ma hukm ma'a at-ta'lil.
2. 5-6 soal bobot bervariasi (sering ada soal hitung waris).
3. JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih + skor & catatan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Imtihan Syafawi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan syafawi.

Berperanlah sebagai mumtahin syafawi:
1. Tanya definisi, hukum + dalil, selesaikan kasus keluarga/waris.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik, naikkan kesulitan.
4. Penilaian akhir + area lemah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab yang kupelajari ([SEBUTKAN]): bab yang sering jadi soal (terutama waris & kasus), cara jawab dapat nilai penuh, prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (di bawah). Rapikan jadi poin hukum + dalil + contoh kasus, lengkapi harakat, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
        {
          title: "Verifikasi Pemahaman Pasca-Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Setelah talaqqi bab [SEBUTKAN], aku jelaskan ulang (di bawah). Periksa keakuratan hukum, koreksi, ajukan 3 pertanyaan penguji (termasuk kasus).

[METODE]

[LEVEL_BAHASA]

Penjelasanku: [TEMPEL]`,
        },
      ],
      eksplorasi: [
        {
          title: "Ahwal Syakhshiyah & Hukum Keluarga Kontemporer",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk isu [SEBUTKAN, mis. nikah beda agama, hak asuh, waris beda agama]:
1. Hukum dalam fiqh klasik.
2. Bagaimana UU keluarga negara muslim (mis. Mesir, Indonesia) mengaturnya.
3. Pertimbangan kontemporer.
PENTING: sebut sumber; jika ragu, katakan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kasus Waris Kompleks ('Aul, Radd, 'Umariyyatan)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan kasus waris rumit:
1. Mas'alah 'aul (saham melebihi 1) — cara menyelesaikannya.
2. Mas'alah radd (saham kurang dari 1).
3. Al-'Umariyyatan (gharrawain) & mas'alah musytarakah.
Beri contoh perhitungan tiap kasus.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Hikmah Syariah dalam Hukum Keluarga",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk hukum [SEBUTKAN, mis. 'iddah, pembagian waris]:
1. Hikmah & maqashid di balik hukum itu.
2. Bagaimana hukum melindungi maslahat keluarga.
3. Jawaban atas syubhat seputar hukum keluarga Islam.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  {
    id: "tauhid",
    name: "Tauhid",
    nameArabic: "التوحيد",
    category: "aqdi",
    fakultas: ["ushuluddin", "syariah", "dirasat", "dirasat-banin", "quran"],
    jurusan: ["dirasat_ushuluddin"],
    tingkat: ["1", "2", "3", "4", "pasca"],
    description: "Ilmu tentang keesaan Allah — 20 sifat wajib, sifat mustahil dan jaiz bagi Allah, kenabian, dan sam'iyyat. Pendekatan Al-Azhar: Asy'ari-Maturidi.",
    descriptionArabic: "علم التوحيد وأصول الإيمان",
    kitabUtama: [
      { nama: "Jawharatut Tauhid",          arabic: "جوهرة التوحيد",           penulis: "Al-Laqqani" },
      { nama: "Ummul Barahin (Al-Wasithiyyah)", arabic: "أم البراهين",         penulis: "As-Sanusi" },
      { nama: "Kifayatul 'Awam",            arabic: "كفاية العوام",            penulis: "Al-Fudhali" },
      { nama: "Al-'Aqidah Ath-Thahawiyyah", arabic: "العقيدة الطحاوية",       penulis: "Imam Ath-Thahawi" },
    ],
    recommendedAI: [
      { tool: "notebooklm", rank: 1, strength: "Drill matan Jawharatut Tauhid dan Ummul Barahin", why: "Tauhid membutuhkan hafalan matan nazham. NotebookLM dengan upload kitab bisa drill tasmi' dengan akurat tanpa memperoleh definisi sifat yang keliru." },
      { tool: "claude",     rank: 2, strength: "Penjelasan sifat, dalil aqli-naqli, komparasi firaq", why: "Claude bagus menjelaskan argumen logis untuk sifat Allah dan membandingkan pandangan Asy'ariyyah dengan pendekatan lain." },
    ],
    tutorial: {
      overview: "Tauhid di Al-Azhar menggunakan pendekatan Asy'ari-Maturidi — hafal matan, pahami dalil, aplikasikan.",
      steps: [
        { title: "Hafal 20 sifat wajib dulu",          body: "20 sifat wajib bagi Allah adalah pondasi. Hafal nama Arab + makna setiap sifat + lawannya (sifat mustahil). Mulai dengan Ummul Barahin." },
        { title: "Pahami dalil aqli untuk setiap sifat", body: "Setiap sifat wajib bisa dibuktikan secara akal ('aqlan) dan syariat (naqlan). Minta AI jelaskan dalil aqli — ini yang sering diuji." },
        { title: "Belajar sifat rasul secara bersamaan", body: "Sifat wajib/mustahil/jaiz bagi Rasul punya pola sama. Pelajari bersamaan dengan sifat Allah." },
        { title: "Sam'iyyat: berdasar Nash",             body: "Sam'iyyat (alam kubur, hari kiamat, surga-neraka) tidak bisa dibuktikan dengan akal — hanya dengan nash. Fokus pada dalil Al-Qur'an dan hadits shahih." },
      ],
    },
    prompts: {
      pahami: [
        {
          title: "Peta Besar Ilmu Tauhid / Aqidah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri kerangka utuh ilmu Tauhid (manhaj Asy'ari-Maturidi sesuai Azhar):
1. Pembagian: ilahiyat (sifat Allah), nubuwwat (kenabian), sam'iyyat (hal ghaib).
2. Istilah inti: wajib, mustahil, jaiz 'aqli.
3. Outline bercabang.
4. Urutan belajar ideal.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami 20 Sifat Wajib bagi Allah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan sifat wajib bagi Allah (manhaj Asy'ari):
1. 20 sifat wajib — teks Arab berharakat + arti + dalil 'aqli ringkas tiap sifat.
2. Pengelompokan: nafsiyah, salbiyah, ma'ani, ma'nawiyah.
3. Lawan tiap sifat (sifat mustahil).
4. Sifat jaiz bagi Allah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Dalil 'Aqli & Naqli dalam Aqidah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan metode pembuktian dalam ilmu kalam:
1. Dalil naqli (Qur'an-Sunnah) & dalil 'aqli — kapan tiap dipakai.
2. Contoh dalil 'aqli untuk wujud Allah (dalil huduts, imkan).
3. Bagaimana akal & wahyu diposisikan dalam manhaj Asy'ari-Maturidi.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Nubuwwat & Sam'iyyat",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan dua bab:
1. Nubuwwat: sifat wajib/mustahil/jaiz bagi rasul, mukjizat, hikmah pengutusan.
2. Sam'iyyat: hal-hal ghaib yang wajib diimani (hari akhir, mizan, shirath, dll) — yang ditetapkan dengan dalil naqli.
Sertakan teks Arab istilah berharakat + arti.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal 20 Sifat dengan Pengelompokan",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal 20 sifat wajib + mustahil + jaiz:
1. Susun per kelompok (nafsiyah, salbiyah, ma'ani, ma'nawiyah) — Arab berharakat + arti.
2. Mnemonic Indonesia untuk tiap kelompok.
3. Pasangkan tiap sifat wajib dengan lawannya (mustahil).

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Tabel Sifat + Dalil untuk Dihafal",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Buatkan tabel hafalan:
1. Kolom: sifat (Arab berharakat) | arti | kelompok | dalil 'aqli ringkas.
2. Tandai sifat yang dalilnya sering jadi soal.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Aqidah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah H+1, H+3, H+7, mingguan + cara uji. Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Drill Dalil 'Aqli tiap Sifat",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Sebutkan satu per satu sifat, lalu tugasku menyebutkan dalil 'aqli-nya.
1. Sebut sifatnya (8 sifat).
2. JANGAN beri jawaban dulu.
3. Setelah aku jawab, koreksi dalil-ku + perbaiki penalarannya.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Soal Definisi & Klasifikasi Aqidah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal campuran (definisi, kelompok sifat, dalil, hukum) dari bab [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Menjawab Syubhat (Tathbiq)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 4 syubhat/pertanyaan aqidah. Tugasku menjawabnya dengan dalil.
1. Tulis syubhatnya.
2. JANGAN beri jawaban dulu.
3. Koreksi jawabanku, sempurnakan dengan dalil 'aqli/naqli yang benar.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Tahriri Tauhid (Gaya Azhari)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian tulis Tauhid gaya Azhar untuk bab [SEBUTKAN]:
1. Tipe khas: 'arrif, udzkur ad-dalil al-'aqli, ma hukm... ma'a at-ta'lil, raddu asy-syubhah.
2. 5-6 soal bobot bervariasi.
3. JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih + skor & catatan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Imtihan Syafawi Tauhid",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan syafawi.

Berperanlah sebagai mumtahin syafawi:
1. Tanya sifat + dalil, definisi, jawaban atas syubhat.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik, naikkan kesulitan.
4. Penilaian akhir + area lemah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian Tauhid",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab yang kupelajari ([SEBUTKAN]): bab tersering jadi soal (biasanya dalil sifat & radd syubhat), tipe soal, cara jawab dapat nilai penuh, prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi Tauhid",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (di bawah). Rapikan jadi poin sifat+dalil, lengkapi harakat, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
        {
          title: "Verifikasi Pemahaman Pasca-Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Setelah talaqqi bab [SEBUTKAN], aku jelaskan ulang (di bawah). Periksa keakuratan manhaj (Asy'ari/Maturidi), koreksi, ajukan 3 pertanyaan penguji.

[METODE]

[LEVEL_BAHASA]

Penjelasanku: [TEMPEL]`,
        },
      ],
      eksplorasi: [
        {
          title: "Perbedaan Aliran Kalam (Asy'ari, Maturidi, Mu'tazilah)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bandingkan aliran kalam untuk isu [SEBUTKAN, mis. sifat Allah, af'al 'ibad, ru'yatullah]:
1. Pendapat Asy'ariyah, Maturidiyah, Mu'tazilah.
2. Dalil/alasan tiap aliran.
3. Mana yang dipegang Ahlussunnah & manhaj Azhar.
Sajikan berimbang & ilmiah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Aqidah & Kehidupan Nyata",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan buah/tsamarah aqidah yang benar dalam kehidupan:
1. Bagaimana memahami sifat Allah memengaruhi cara seorang muslim memandang takdir, musibah, & usaha.
2. Bahaya akidah yang menyimpang.
3. Kaitan tauhid dengan akhlak & ibadah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Bedah Matan Aqidah (Jauharah / Kharidah / Sanusiyah)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu aku memahami potongan matan aqidah yang kutempel (mis. dari Jauharah at-Tauhid):
1. Beri harakat lengkap bila perlu.
2. Jelaskan maksud tiap bait/kalimat.
3. Istilah kalam yang muncul + artinya.
PENTING: kalau ragu teks matannya, minta aku tempel; jangan mengarang bait.

[METODE]

[LEVEL_BAHASA]

Teks: [TEMPEL]`,
        },
      ],
    },
  },

  {
    id: "firaq",
    name: "'Aqidah & Firaq",
    nameArabic: "العقيدة والفرق",
    category: "aqdi",
    fakultas: ["ushuluddin", "dirasat"],
    jurusan: ["dirasat_ushuluddin"],
    tingkat: ["3", "4", "pasca"],
    description: "Studi aliran-aliran dalam Islam — Asy'ariyyah, Maturidiyyah, Mu'tazilah, Khawarij, Syiah, Murji'ah. Analisis pokok pemikiran dan sejarah kemunculan.",
    descriptionArabic: "دراسة الفرق الإسلامية",
    kitabUtama: [
      { nama: "Al-Milal wan Nihal",         arabic: "الملل والنحل",          penulis: "Asy-Syahrastani" },
      { nama: "Al-Farqu bainal Firaq",       arabic: "الفرق بين الفرق",       penulis: "Al-Baghdadi" },
      { nama: "Maqalatul Islamiyyin",        arabic: "مقالات الإسلاميين",    penulis: "Al-Asy'ari" },
    ],
    recommendedAI: [
      { tool: "claude",      rank: 1, strength: "Analisis pokok pemikiran, sebab kemunculan, dan banding aliran", why: "Firaq membutuhkan analisis pemikiran teologis yang kompleks. Claude kuat dalam menjelaskan perbedaan doktrin antar aliran dengan nuansa." },
      { tool: "perplexity",  rank: 2, strength: "Verifikasi tokoh dan sejarah kemunculan firaq",                  why: "Perplexity bisa membantu verifikasi tanggal, tokoh, dan konteks historis lahirnya aliran-aliran tertentu." },
    ],
    tutorial: {
      overview: "Pelajari firaq dengan pendekatan akademis — pahami, bukan sekadar menyalahkan.",
      steps: [
        { title: "Pahami konteks historis dulu",    body: "Setiap firaq muncul dalam konteks politik-sosial tertentu. Tanpa memahami konteks, akan sulit memahami kenapa orang percaya pada doktrin tertentu." },
        { title: "Pelajari pokok pemikiran per firqah", body: "Setiap firqah punya beberapa masalah pokok. Pahami: apa yang mereka yakini dan mengapa." },
        { title: "Bandingkan dengan Ahlus Sunnah",  body: "Setelah memahami firqah, identifikasi: apa yang berbeda dengan Ahlus Sunnah wal Jama'ah dan mengapa dianggap menyimpang." },
        { title: "Jaga objektivitas akademis",      body: "Ilmu ini mudah disalahgunakan. Studi firaq di Azhar adalah akademis — bukan untuk mencap-cap seseorang tapi untuk memahami sejarah pemikiran." },
      ],
    },
    prompts: {
      pahami: [
        {
          title: "Peta Besar Ilmu Firaq (Aliran-Aliran)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri kerangka utuh ilmu al-firaq wal-madzahib:
1. Apa itu ilmu firaq & tujuan mempelajarinya (mengenali, bukan mengikuti).
2. Aliran-aliran besar dalam sejarah: Khawarij, Syiah, Mu'tazilah, Murji'ah, Jabriyah, Qadariyah, Ahlussunnah (Asy'ariyah-Maturidiyah).
3. Outline bercabang + faktor kemunculan firaq.
4. Pentingnya sikap ilmiah & adil dalam mengkaji.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Khawarij & Syiah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan dua firaq awal secara berimbang & ilmiah:
1. Khawarij: latar kemunculan, prinsip pokok (mis. takfir pelaku dosa besar), sekte-sektenya.
2. Syiah: latar, prinsip pokok, cabang utama (Imamiyah, Zaidiyah, Isma'iliyah).
3. Bantahan Ahlussunnah terhadap penyimpangan masing-masing.
PENTING: sajikan akurat & adil, sebutkan pandangan mereka apa adanya lalu bantahan ilmiahnya.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Mu'tazilah & Ushul Khamsah-nya",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan Mu'tazilah:
1. Latar kemunculan & tokohnya.
2. Al-Ushul al-Khamsah (tauhid, 'adl, al-wa'd wal-wa'id, al-manzilah baina al-manzilatain, al-amr bil-ma'ruf) — jelaskan tiap prinsip.
3. Poin yang menyelisihi Ahlussunnah + bantahannya.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Posisi Ahlussunnah (Asy'ari-Maturidi)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan posisi Ahlussunnah wal Jama'ah:
1. Bagaimana Asy'ariyah & Maturidiyah jadi mainstream Ahlussunnah.
2. Sikap pertengahan (wasathiyah) mereka di antara firaq yang bertentangan.
3. Manhaj mereka dalam memahami sifat Allah, takdir, & iman.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Firaq & Prinsip Pokoknya",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal aliran-aliran:
1. Tabel: firaq | tokoh | prinsip pokok | poin yang diselisihkan.
2. Mnemonic untuk mengingat daftar firaq.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Hafal Istilah & Tokoh Kunci",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk bab [SEBUTKAN], buatkan daftar hafalan istilah & tokoh:
1. Istilah (Arab berharakat + arti) + tokoh + sumbangan/pandangannya.
2. Tandai yang sering jadi soal.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Firaq",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Firaq yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah H+1, H+3, H+7, mingguan + cara uji. Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Drill Identifikasi Firaq dari Prinsip",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 8 deskripsi prinsip/pandangan. Tugasku: tebak ini pandangan firaq mana.
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab + jelaskan penandanya.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Membantah Syubhat (Tathbiq)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 4 argumen/syubhat dari firaq tertentu. Tugasku: bantah dengan dalil & manhaj Ahlussunnah.
1. JANGAN beri bantahan dulu.
2. Koreksi bantahanku + sempurnakan dengan dalil yang benar.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Soal Definisi & Perbandingan",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal campuran (definisi firaq, beda dua aliran, tokoh, prinsip) dari bab [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Tahriri (Gaya Azhari)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian tulis Firaq gaya Azhar untuk bab [SEBUTKAN]:
1. Tipe khas: tahaddats 'an firqah..., qarin baina..., raddu 'ala..., udzkur usus...
2. 5-6 soal bobot bervariasi.
3. JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih + skor & catatan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Imtihan Syafawi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan syafawi.

Berperanlah sebagai mumtahin syafawi:
1. Tanya prinsip firaq, perbedaan, bantahan Ahlussunnah.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik, naikkan kesulitan.
4. Penilaian akhir + area lemah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab yang kupelajari ([SEBUTKAN]): firaq yang sering jadi soal, cara jawab adil & berdalil, prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (di bawah). Rapikan jadi: firaq → prinsip → bantahan, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
        {
          title: "Verifikasi Pemahaman Pasca-Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Setelah talaqqi bab [SEBUTKAN], aku jelaskan ulang (di bawah). Periksa keakuratan & keadilan paparan, koreksi, ajukan 3 pertanyaan penguji.

[METODE]

[LEVEL_BAHASA]

Penjelasanku: [TEMPEL]`,
        },
      ],
      eksplorasi: [
        {
          title: "Firaq Kontemporer & Pemikiran Modern",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan secara ilmiah & berimbang aliran/pemikiran kontemporer [SEBUTKAN]:
1. Akar pemikirannya (kaitan dengan firaq klasik bila ada).
2. Pandangan utamanya.
3. Sikap & tanggapan ilmiah Ahlussunnah.
PENTING: sajikan adil & akurat; jangan mengarang atau menggeneralisasi.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Faktor Kemunculan & Penyebaran Firaq",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Analisis:
1. Faktor politik, sosial, & intelektual munculnya firaq.
2. Peran fitnah & peristiwa sejarah tertentu.
3. Pelajaran agar umat terhindar dari perpecahan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Manhaj Wasathiyah Ahlussunnah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan posisi pertengahan Ahlussunnah untuk isu [SEBUTKAN, mis. iman & amal, takdir, sifat Allah]:
1. Posisi dua firaq yang bertentangan di kutub.
2. Posisi tengah Ahlussunnah & dalilnya.
3. Kenapa manhaj wasathiyah ini paling lurus.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  {
    id: "filsafat-islam",
    name: "Filsafat Islam",
    nameArabic: "الفلسفة الإسلامية",
    category: "aqdi",
    fakultas: ["ushuluddin", "dirasat"],
    jurusan: ["dirasat_ushuluddin"],
    tingkat: ["3", "4", "pasca"],
    description: "Pemikiran filsafat dalam tradisi Islam — Al-Kindi, Al-Farabi, Ibnu Sina, Ibnu Rusyd. Serta kritik Al-Ghazali dalam Tahafutul Falasifah.",
    descriptionArabic: "الفلسفة في التراث الإسلامي",
    kitabUtama: [
      { nama: "Tahafutul Falasifah",    arabic: "تهافت الفلاسفة",    penulis: "Imam Al-Ghazali" },
      { nama: "Tahafutut Tahafut",      arabic: "تهافت التهافت",     penulis: "Ibnu Rusyd" },
    ],
    recommendedAI: [
      { tool: "claude",   rank: 1, strength: "Analisis pemikiran filosofis, argumen kompleks", why: "Filsafat Islam membutuhkan kemampuan memahami dan memformulasikan ulang argumen-argumen abstrak. Claude unggul dalam penalaran filsafat." },
      { tool: "chatgpt",  rank: 2, strength: "Diskusi konsep abstrak dan dialog Socrates",     why: "ChatGPT baik untuk diskusi filosofis interaktif di mana kamu bisa menguji pemikiranmu melalui dialog." },
    ],
    tutorial: {
      overview: "Filsafat Islam adalah ilmu yang butuh teliti dan sabar — tidak bisa di-rush.",
      steps: [
        { title: "Mulai dari Al-Kindi sebagai filsuf pertama",  body: "Al-Kindi adalah filsuf Muslim pertama. Pahami pendekatannya sebelum masuk ke Al-Farabi dan Ibnu Sina yang lebih kompleks." },
        { title: "Pahami argumen sebelum setuju/tidak",         body: "Filsafat mengharuskan kamu memahami argumen dengan baik sebelum menerima atau menolak. Minta AI jelaskan, lalu kritisi." },
        { title: "Pahami kritik Al-Ghazali dengan seimbang",    body: "Al-Ghazali mengkritik 20 masalah filosof dalam Tahafut. Pahami apa yang dikritik dan bagaimana Ibnu Rusyd merespons." },
        { title: "Hubungkan dengan kalam",                      body: "Filsafat Islam tidak bisa dipisah dari kalam. Selalu tanya: bagaimana topik ini berkaitan dengan aqidah?" },
      ],
    },
    prompts: {
      pahami: [
        {
          title: "Peta Besar Filsafat Islam",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri kerangka utuh Filsafat Islam:
1. Definisi & ruang lingkup falsafah islamiyyah + bedanya dengan ilmu kalam & tasawwuf.
2. Cabang: ilahiyat (metafisika), thabi'iyat (fisika), mantiq, akhlaq, siyasah.
3. Aliran besar: Masysya'iyah (peripatetik), Isyraqiyah, dll.
4. Outline bercabang + sikap kritis-ilmiah dalam mempelajarinya.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Tokoh Filsafat Islam & Pemikirannya",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan tokoh-tokoh utama filsafat Islam:
1. Al-Kindi, Al-Farabi, Ibn Sina, Ibn Rusyd — pemikiran khas masing-masing (sebut yang kamu yakin; jika ragu, katakan).
2. Tema yang mereka bahas (akal, jiwa, kenabian, alam).
3. Pengaruh mereka terhadap pemikiran Islam & Barat.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Polemik Filsafat vs Ilmu Kalam",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan perdebatan filsafat & kalam:
1. Kritik al-Ghazali dalam Tahafut al-Falasifah (poin yang dianggap menyimpang).
2. Jawaban Ibn Rusyd dalam Tahafut at-Tahafut.
3. Tiga isu yang al-Ghazali anggap mengkafirkan + duduk perkaranya.
Sajikan berimbang & ilmiah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Konsep Metafisika Filsafat Islam",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan konsep ilahiyat/metafisika dalam filsafat Islam:
1. Wajib al-wujud & mumkin al-wujud (Ibn Sina).
2. Konsep emanasi (faidh/nazhariyyatul fayd) & kritik terhadapnya.
3. Qidam al-'alam (keazalian alam) vs penciptaan — dan sikap Ahlussunnah.
PENTING: jelaskan akurat lalu beri catatan kritis sesuai manhaj Azhar.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Tokoh & Pemikiran Kunci",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal tokoh filsafat Islam:
1. Tabel: tokoh | gelar | pemikiran khas | karya utama.
2. Mnemonic untuk urutan/kelompok tokoh.
PENTING: sebut yang kamu yakin; jika ragu, katakan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Hafal Istilah Filsafat Kunci",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal istilah (wajib al-wujud, jauhar-'aradh, hayula-shurah, 'aql fa''al, dll) bab [SEBUTKAN]:
1. Istilah (Arab berharakat + arti).
2. Mnemonic.
3. Kelompokkan yang berkaitan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Filsafat",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Topik yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah H+1, H+3, H+7, mingguan + cara uji. Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Drill Identifikasi Pemikiran dari Tokoh",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 8 deskripsi pemikiran/pendapat. Tugasku: tebak tokoh/aliran pemiliknya.
1. JANGAN beri jawaban dulu.
2. Koreksi + jelaskan penandanya.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Analisis Kritis Argumen Filsafat",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 4 argumen filsafat. Tugasku: analisis & beri tanggapan kritis sesuai manhaj Ahlussunnah.
1. JANGAN beri tanggapan dulu.
2. Koreksi analisisku + sempurnakan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Soal Definisi & Tokoh",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal campuran (definisi istilah, tokoh, pemikiran, polemik) dari [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Tahriri (Gaya Azhari)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian tulis Filsafat Islam gaya Azhar untuk topik [SEBUTKAN]:
1. Tipe khas: 'arrif, udzkur ra'y..., naqisy nazhariyyah..., qarin baina mufakkirain.
2. 5-6 soal bobot bervariasi.
3. JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih + skor & catatan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Imtihan Syafawi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan syafawi.

Berperanlah sebagai mumtahin syafawi:
1. Tanya pemikiran tokoh, definisi, analisis kritis polemik.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik, naikkan kesulitan.
4. Penilaian akhir + area lemah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari topik yang kupelajari ([SEBUTKAN]): topik tersering jadi soal, cara jawab analitis & seimbang, prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (di bawah). Rapikan jadi: tokoh/konsep → pemikiran → catatan kritis, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
        {
          title: "Verifikasi Pemahaman Pasca-Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Setelah talaqqi topik [SEBUTKAN], aku jelaskan ulang (di bawah). Periksa keakuratan & keseimbangan, koreksi, ajukan 3 pertanyaan penguji.

[METODE]

[LEVEL_BAHASA]

Penjelasanku: [TEMPEL]`,
        },
      ],
      eksplorasi: [
        {
          title: "Pengaruh Filsafat Islam terhadap Peradaban",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan:
1. Bagaimana filsafat Islam menjembatani warisan Yunani ke dunia Islam & Eropa.
2. Kontribusi pemikir muslim terhadap logika, etika, & sains.
3. Warisan yang masih relevan hari ini.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Sikap Ulama terhadap Filsafat",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan secara berimbang:
1. Ulama yang menolak filsafat (& alasannya).
2. Ulama yang memanfaatkannya secara selektif (& batasannya).
3. Sikap pertengahan: mengambil yang benar, menolak yang menyelisihi syariat.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Filsafat & Isu Pemikiran Kontemporer",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk isu [SEBUTKAN, mis. relasi akal-wahyu, sekularisme]:
1. Bagaimana warisan filsafat Islam menanggapinya.
2. Relevansi pemikiran klasik untuk tantangan modern.
3. Sikap kritis-konstruktif.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  {
    id: "mantiq",
    name: "Mantiq",
    nameArabic: "المنطق",
    category: "aqdi",
    fakultas: ["ushuluddin", "dirasat"],
    jurusan: ["dirasat_ushuluddin"],
    tingkat: ["2", "3", "4", "pasca"],
    description: "Ilmu logika klasik — kulli-juz'i, tasawwur-tashdiq, qadhiyyah, qiyas (silogisme), burhan. Alat berpikir untuk ilmu kalam dan ushul fiqh.",
    descriptionArabic: "علم المنطق وقواعد التفكير الصحيح",
    kitabUtama: [
      { nama: "Matan As-Sullam Al-Munawraq",  arabic: "متن السلم المنورق",      penulis: "Al-Akhdhari" },
      { nama: "Idhahul Mubham fi Ma'ani As-Sullam", arabic: "إيضاح المبهم",    penulis: "Al-Khadhari Bik" },
    ],
    recommendedAI: [
      { tool: "notebooklm", rank: 1, strength: "Drill matan As-Sullam dan terminologi mantiq",      why: "Mantiq membutuhkan hafalan matan dan terminologi. NotebookLM dengan source kitab bisa drill definisi istilah secara akurat." },
      { tool: "claude",     rank: 2, strength: "Penjelasan qiyas dan susun argumen logis",           why: "Claude kuat dalam menjelaskan struktur argumen logis dan membantu menyusun qiyas mantiqi yang valid." },
    ],
    tutorial: {
      overview: "Mantiq adalah ilmu alat (ala) — dipelajari bukan untuk tujuan sendiri tapi untuk membantu ilmu-ilmu lain.",
      steps: [
        { title: "Mulai dari konsep dasar",           body: "Tasawwur vs tashdiq, kulli vs juz'i, kulliyatul khams. Ini fondasi sebelum masuk qiyas." },
        { title: "Pahami qadhiyyah (proposisi)",      body: "Qadhiyyah adalah pernyataan yang bisa benar atau salah. Pahami jenisnya sebelum masuk ke silogisme." },
        { title: "Kuasai qiyas (silogisme) Aristoteles", body: "Qiyas mantiqi berbeda dari qiyas ushuli. Qiyas mantiqi = premis mayor + minor + kesimpulan. Latih susun qiyas yang valid." },
        { title: "Kenali mughalathah (sesat pikir)", body: "Mantiq tidak lengkap tanpa mengenal mughalathah (fallacies). Ini berguna untuk menilai argumen orang lain." },
      ],
    },
    prompts: {
      pahami: [
        {
          title: "Peta Besar Ilmu Mantiq",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri kerangka utuh ilmu Mantiq sebelum masuk detail:
1. Definisi mantiq + tujuannya (menjaga akal dari kesalahan berpikir, seperti nahwu menjaga lisan).
2. Dua bagian besar: tashawwurat (konsep/al-mufrad) & tashdiqat (proposisi & penalaran/al-murakkab).
3. Sub-topik: kulliyat khams, ta'rif, qadhiyah, qiyas, hujjah.
4. Tampilkan sebagai pohon/outline bercabang + urutan belajar ideal.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Al-Kulliyat Al-Khams (5 Universal)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan al-kulliyat al-khams (lima universal) secara tuntas:
1. Jins, naw', fashl, 'aradh 'amm, khashshah — definisi tiap satu (teks Arab berharakat + arti).
2. Contoh tiap kulli (mis. "manusia" sebagai naw', "hewan" sebagai jins, "berpikir" sebagai fashl).
3. Bagaimana kelima ini dipakai untuk menyusun ta'rif (definisi).
4. Kesalahan umum thalib membedakannya.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Ta'rif (Definisi) & Syaratnya",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan bab ta'rif:
1. Jenis ta'rif: hadd tamm, hadd naqish, rasm tamm, rasm naqish — definisi + contoh.
2. Syarat ta'rif yang sahih (jami' mani', tidak daur, tidak khafi, dll).
3. Kesalahan dalam mendefinisikan + contoh ta'rif yang rusak.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Qiyas (Silogisme) secara Tuntas",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan qiyas mantiqi (silogisme):
1. Definisi qiyas + rukunnya (muqaddimah kubra, sughra, natijah, hadd asghar/akbar/awsath) — teks Arab berharakat.
2. Asykal al-qiyas (4 bentuk silogisme) + syarat produktivitas tiap bentuk.
3. Satu contoh qiyas lengkap dengan analisisnya.
4. Beda qiyas mantiqi dengan qiyas ushuli (fiqh).

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Definisi Istilah Mantiq Kunci",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal istilah inti mantiq bab [SEBUTKAN]:
1. Daftar istilah (Arab berharakat + arti ringkas).
2. Mnemonic/asosiasi tiap istilah.
3. Kelompokkan istilah yang berkaitan (mis. jenis dilalah, jenis qadhiyah).

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Tabel Asykal Qiyas untuk Dihafal",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Buatkan tabel hafalan 4 asykal qiyas:
1. Kolom: syakl | posisi hadd awsath | syarat produktif | contoh ringkas.
2. Tandai syakl yang paling sering dipakai & yang sering jadi soal.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Mantiq",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah:
1. Urutkan dari fondasi (tashawwurat) ke lanjutan (tashdiqat/qiyas).
2. Jadwal H+1, H+3, H+7, mingguan.
3. Cara uji tiap sesi (definisikan istilah, susun qiyas, deteksi galat).
4. Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Drill Susun Qiyas yang Sahih",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 6 pasang muqaddimah (premis). Tugasku: susun jadi qiyas yang sahih + tentukan natijah & syakl-nya.
1. Tulis premisnya.
2. JANGAN beri jawaban dulu.
3. Setelah aku jawab, koreksi: natijah benar, syakl, dan apakah produktif.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Deteksi Mughalathah (Sesat Pikir)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 6 argumen yang mengandung mughalathah (kesalahan logika). Tugasku: temukan letak kesalahannya.
1. Tulis argumennya.
2. JANGAN beri jawaban dulu.
3. Setelah aku jawab, tunjukkan jenis mughalathah-nya + kenapa keliru.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Klasifikasi Kulliyat & Ta'rif",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 8 contoh (kata/definisi). Tugasku: tentukan jenis kulli-nya atau jenis ta'rif-nya.
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab + jelaskan.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Tahriri Mantiq (Gaya Azhari)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian tulis Mantiq gaya Azhar untuk bab [SEBUTKAN]:
1. Tipe khas: 'arrif + matsil, rakkib qiyasan, bayyin nau' al-kulli, istakhrij al-khata' al-mantiqi.
2. 5-6 soal bobot bervariasi.
3. JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih + skor & catatan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Imtihan Syafawi Mantiq",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan syafawi.

Berperanlah sebagai mumtahin syafawi Mantiq:
1. Minta aku definisikan istilah, susun qiyas lisan, atau bedakan dua konsep.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik, naikkan kesulitan.
4. Penilaian akhir + area lemah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian Mantiq",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab yang kupelajari ([SEBUTKAN]): bab tersering jadi soal (biasanya kulliyat, ta'rif, qiyas), tipe soal yang mungkin keluar, cara jawab dapat nilai penuh, prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi Mantiq",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (di bawah). Rapikan jadi poin definisi + contoh, lengkapi harakat istilah, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
        {
          title: "Verifikasi Pemahaman Pasca-Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Setelah talaqqi bab [SEBUTKAN], aku jelaskan ulang + beri contoh buatanku (di bawah). Periksa keakuratan, koreksi contoh yang keliru, ajukan 3 pertanyaan penguji.

[METODE]

[LEVEL_BAHASA]

Penjelasanku: [TEMPEL]`,
        },
      ],
      eksplorasi: [
        {
          title: "Mantiq sebagai Alat Berpikir di Maddah Lain",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Tunjukkan bagaimana mantiq dipakai sebagai alat di ilmu lain:
1. Peran ta'rif & qiyas dalam ushul fiqh & ilmu kalam.
2. Contoh nyata penalaran mantiqi dalam istinbath hukum atau pembuktian akidah.
3. Kenapa ulama menyebut mantiq "khadim al-'ulum" (pelayan ilmu).

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Polemik Hukum Belajar Mantiq",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan secara ilmiah & berimbang:
1. Pandangan ulama tentang hukum mempelajari mantiq (yang membolehkan, melarang, merinci).
2. Alasan tiap pandangan.
3. Sikap Al-Azhar & posisi mu'tadil (pertengahan).
PENTING: sajikan berimbang, sebut alasan tiap pihak tanpa memihak berlebihan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Bedah Matan Sullam al-Munawraq",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu aku memahami potongan matan mantiq yang kutempel (mis. dari Sullam al-Munawraq / Idhah al-Mubham):
1. Beri harakat lengkap bila perlu.
2. Jelaskan maksud tiap bait/kalimat dengan bahasa sederhana.
3. Istilah mantiq yang muncul + artinya.
PENTING: kalau ragu teks matannya, minta aku tempel; jangan mengarang bait.

[METODE]

[LEVEL_BAHASA]

Teks: [TEMPEL]`,
        },
      ],
    },
  },

  {
    id: "tasawwuf",
    name: "Tasawwuf",
    nameArabic: "التصوف",
    category: "aqdi",
    fakultas: ["ushuluddin", "dirasat"],
    jurusan: ["dirasat_ushuluddin"],
    tingkat: ["3", "4", "pasca"],
    description: "Ilmu tazkiyatun nafs dan thariqah para sufi — maqamat, ahwal, muraqabah. Tasawwuf amali butuh mursyid; AI bantu sisi ilmu.",
    descriptionArabic: "علم تزكية النفس وسلوك السائرين",
    kitabUtama: [
      { nama: "Ihya 'Ulumiddin",          arabic: "إحياء علوم الدين",         penulis: "Imam Al-Ghazali" },
      { nama: "Al-Hikam",                  arabic: "الحِكَم",                   penulis: "Ibnu 'Atha'illah As-Sakandari" },
      { nama: "Ar-Risalah Al-Qusyairiyyah", arabic: "الرسالة القشيرية",        penulis: "Imam Al-Qusyairi" },
    ],
    recommendedAI: [
      { tool: "claude",   rank: 1, strength: "Analisis konsep tasawwuf, syarah Al-Hikam, komparasi maqamat", why: "Tasawwuf punya teks-teks klasik yang kaya dan padat makna. Claude kuat dalam interpretasi teks klasik dan penjelasan konsep spiritual dengan nuansa." },
      { tool: "chatgpt",  rank: 2, strength: "Refleksi tazkiyah dan diskusi spiritual",                      why: "ChatGPT baik untuk diskusi reflektif tentang tazkiyatun nafs dan mengaitkan ajaran tasawwuf dengan kehidupan praktis." },
    ],
    tutorial: {
      overview: "Tasawwuf ada dua dimensi: ilmu (bisa dipelajari) dan amali (butuh mursyid). AI bantu yang pertama.",
      steps: [
        { title: "Bedakan tasawwuf ilmi dan amali",   body: "Tasawwuf ilmi (teori: maqamat, ahwal, tazkiyah) bisa dipelajari dari kitab dan AI. Tasawwuf amali (suluk, wirid, thariqah) butuh bimbingan mursyid." },
        { title: "Mulai dari Ihya 'Ulumiddin",        body: "Al-Ghazali menulis Ihya dengan pendekatan seimbang. Ini titik masuk yang aman dan direkomendasikan Azhar." },
        { title: "Syarah Al-Hikam dengan teliti",     body: "Al-Hikam (Ibnu 'Atha'illah) padat dan sering disalahpahami. Selalu minta syarah dari mufassir yang mu'tamad." },
        { title: "Tasawwuf amali tetap butuh mursyid", body: "Untuk suluk, wirid hizib, dan thariqah tertentu, AI tidak bisa menggantikan bimbingan mursyid yang bersanad." },
      ],
    },
    prompts: {
      pahami: [
        {
          title: "Peta Besar Ilmu Tasawwuf",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri kerangka utuh ilmu Tasawwuf (manhaj sunni sesuai Azhar):
1. Definisi tasawwuf & tujuannya (tazkiyatun nafs, ihsan).
2. Cakupan: maqamat, ahwal, akhlak batin, penyakit hati & obatnya.
3. Beda tasawwuf sunni (mu'tabar) dgn praktik menyimpang.
4. Outline bercabang + posisinya dalam agama (ihsan dalam hadits Jibril).

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Maqamat & Ahwal",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan maqamat & ahwal:
1. Beda maqam (hasil usaha, menetap) vs hal (anugerah, sementara) — teks Arab berharakat.
2. Contoh maqamat: taubah, shabr, zuhd, tawakkul, ridha.
3. Contoh ahwal: khauf, raja', mahabbah, muraqabah.
4. Urutan perjalanan ruhani (suluk).

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Penyakit Hati & Pengobatannya",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan amradh al-qulub (penyakit hati):
1. Penyakit utama: riya', 'ujub, kibr, hasad, hubbud dunya, ghadhab.
2. Tanda & bahaya tiap penyakit.
3. Cara pengobatannya (mu'alajah) menurut ulama tasawwuf.
PENTING: sebut dalil dengan benar; jika ragu, katakan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Tasawwuf Sunni vs Falsafi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan secara berimbang:
1. Tasawwuf sunni (akhlaqi/'amali) — berpegang pada Qur'an-Sunnah (mis. al-Ghazali, al-Junaid).
2. Tasawwuf falsafi & konsep yang diperdebatkan (mis. wahdatul wujud).
3. Sikap ulama Ahlussunnah & Azhar terhadap keduanya.
Sajikan berimbang & ilmiah.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Maqamat & Ahwal Berurutan",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal maqamat & ahwal:
1. Daftar (Arab berharakat + arti) dikelompokkan.
2. Mnemonic untuk urutannya.
3. Beda singkat tiap istilah agar tidak tertukar.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Tabel Penyakit Hati & Obatnya",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Buatkan tabel hafalan:
1. Kolom: penyakit hati (Arab berharakat) | tanda | obat.
2. Tandai yang sering jadi soal.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Tasawwuf",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah H+1, H+3, H+7, mingguan + cara uji. Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Drill Definisi & Beda Istilah Tasawwuf",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal campuran (definisi maqam/hal, beda dua istilah, penyakit hati & obat) dari bab [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Diagnosa Penyakit Hati (Tathbiq)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 5 deskripsi perilaku/keadaan hati. Tugasku: identifikasi penyakit hatinya & obat yang tepat.
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Klasifikasi Maqam vs Hal",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 8 istilah tasawwuf. Tugasku: klasifikasikan maqam atau hal + alasannya.
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Tahriri (Gaya Azhari)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian tulis Tasawwuf gaya Azhar untuk bab [SEBUTKAN]:
1. Tipe khas: 'arrif, ma al-farq baina al-maqam wal-hal, udzkur 'ilaj..., bayyin manhaj at-tasawwuf as-sunni.
2. 5-6 soal bobot bervariasi.
3. JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih + skor & catatan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Imtihan Syafawi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan syafawi.

Berperanlah sebagai mumtahin syafawi:
1. Tanya definisi, beda istilah, penyakit hati & obat.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik, naikkan kesulitan.
4. Penilaian akhir + area lemah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab yang kupelajari ([SEBUTKAN]): bab tersering jadi soal, cara jawab dapat nilai penuh, prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (di bawah). Rapikan jadi poin terstruktur, lengkapi harakat istilah, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
        {
          title: "Verifikasi Pemahaman Pasca-Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Setelah talaqqi bab [SEBUTKAN], aku jelaskan ulang (di bawah). Periksa keakuratan manhaj sunni, koreksi, ajukan 3 pertanyaan penguji.

[METODE]

[LEVEL_BAHASA]

Penjelasanku: [TEMPEL]`,
        },
      ],
      eksplorasi: [
        {
          title: "Tasawwuf & Pembentukan Akhlak Praktis",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk maqam/sifat [SEBUTKAN, mis. shabr, ikhlas, tawakkul]:
1. Cara melatih & membentuknya dalam kehidupan nyata.
2. Tanda seseorang sudah mencapainya.
3. Hubungannya dengan ibadah harian.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Telaah Tokoh & Karya Tasawwuf",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk tokoh [SEBUTKAN, mis. al-Ghazali, al-Junaid, al-Muhasibi]:
1. Kontribusinya dalam tasawwuf sunni.
2. Karya utamanya (mis. Ihya' Ulumuddin).
3. Pemikiran khasnya.
PENTING: kalau tidak yakin fakta, katakan; jangan mengarang.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Tasawwuf, Akhlak & Hubungannya dengan Fiqh",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan integrasi:
1. Bagaimana tasawwuf melengkapi fiqh (fiqh = lahir, tasawwuf = batin).
2. Ucapan ulama "man tafaqqaha wa lam yatasawwaf..." & maknanya.
3. Keseimbangan syariat & hakikat.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  /* ============================================================
     BATCH 3 — LUGHAWI (6 Maddah)
     ============================================================ */

  {
    id: "sharaf",
    name: "Sharaf",
    nameArabic: "الصرف",
    category: "lughawi",
    fakultas: ["ushuluddin", "syariah", "lughah", "dirasat", "dirasat-banin", "quran"],
    jurusan: ["dirasat_lughah"],
    tingkat: ["mustawa", "1", "2", "3"],
    description: "Ilmu morfologi Arab — tashrif istilahi, tashrif lughawi, wazn fi'il, isim musytaq, i'lal, ibdal. Beda dari nahwu: fokus bentuk kata, bukan i'rab kalimat.",
    descriptionArabic: "علم بنية الكلمة العربية وتصاريفها",
    kitabUtama: [
      { nama: "Al-Amtsilah At-Tashrifiyyah", arabic: "الأمثلة التصريفية",    penulis: "Syaikh Muhammad Ma'shum" },
      { nama: "Matan Al-Bina wal Asas",       arabic: "البناء والأساس",       penulis: "Al-Birjindi" },
      { nama: "Syadzal 'Arf",                 arabic: "شذا العرف",            penulis: "Ahmad Al-Hamlawi" },
    ],
    recommendedAI: [
      { tool: "notebooklm", rank: 1, strength: "Drill wazn, tashrif, dan matan sharaf",               why: "Sharaf butuh banyak latihan hafalan wazn dan tashrif. NotebookLM dengan upload Al-Amtsilah bisa drill dengan source akurat." },
      { tool: "claude",     rank: 2, strength: "Analisis i'lal, ibdal, dan identifikasi wazn kata",   why: "Claude kuat dalam analisis morfologis kata Arab dan menjelaskan proses i'lal secara bertahap." },
    ],
    tutorial: {
      overview: "Sharaf beda dari Nahwu: Nahwu soal posisi kata di kalimat, Sharaf soal bentuk kata itu sendiri.",
      steps: [
        { title: "Hafal 14 wazn tashrif istilahi", body: "14 wazn fi'il (madhi, mudhari', amr, dll) adalah inti sharaf. Hafal tabel tashrif dengan drill berulang." },
        { title: "Pahami wazn untuk identifikasi", body: "Kamu harus bisa melihat kata Arab dan mengenali wazn-nya. Ini skill yang dibangun perlahan dengan latihan identifikasi." },
        { title: "I'lal adalah bagian penting",    body: "I'lal (perubahan huruf 'illah: waw, ya', alif) adalah topik yang sering membingungkan. Pelajari kaidah i'lal secara bertahap." },
        { title: "Beda tashrif istilahi dan lughawi", body: "Tashrif istilahi = konjugasi formal. Tashrif lughawi = semua turunan kata dari satu akar. Bedakan keduanya." },
      ],
    },
    prompts: {
      pahami: [
        {
          title: "Peta Besar Ilmu Sharaf",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku kerangka utuh ilmu Sharaf sebelum masuk detail:
1. Apa ruang lingkup Sharaf dan bedanya dengan Nahwu (Sharaf = bentuk kata, Nahwu = posisi kata).
2. Cabang besar: tashrif istilahi, tashrif lughawi, mizan sharfi (wazan), isim musytaq, i'lal-ibdal-idgham.
3. Tampilkan sebagai pohon/outline bercabang agar mudah kuhafal.
4. Urutan belajar yang ideal dari fondasi ke lanjutan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami 14 Wazan Tashrif Istilahi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan tashrif istilahi secara tuntas:
1. Definisi tashrif istilahi (teks Arab berharakat + arti).
2. Tabel 14 shighah (madhi, mudhari', amr, isim fa'il, isim maf'ul, dst) — dengan teks Arab berharakat tiap baris.
3. Pakai fi'il contoh نَصَرَ dan ضَرَبَ.
4. Beda tashrif istilahi vs lughawi, dengan contoh.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Sistem Wazan & Fi'il Mazid",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan sistem wazan (mizan sharfi):
1. Konsep fa-'ain-lam (ف ع ل) sebagai timbangan kata.
2. Tsulatsi mujarrad (6 bab) + tsulatsi mazid (bab taf'il, mufa'alah, if'al, tafa'ul, ifti'al, dst) — wazan + makna khas tiap bab + contoh.
3. Ruba'i mujarrad & mazid singkat.
4. Cara menentukan wazan dari kata yang ditemukan di kitab.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Bedah I'lal, Ibdal, dan Idgham",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Tiga topik tersulit Sharaf — jelaskan satu per satu dengan contoh berharakat:
1. I'lal (perubahan huruf 'illah و ي ا): jenis i'lal bil qalb, bil hadzf, bil iskan + kaidah utamanya.
2. Ibdal (penggantian huruf): contoh ta' iftial jadi tha'/dal, dll.
3. Idgham: syarat dan cara, idgham wajib vs jaiz.
Untuk tiap: kaidah inti, 2 contoh proses bertahap, kesalahan umum thalib.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Tashrif Istilahi dengan Lagu/Irama",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu aku menghafal tashrif istilahi (نَصَرَ يَنْصُرُ...) seperti metode pesantren:
1. Susun urutannya dalam pola berirama agar mudah dilafalkan berulang.
2. Pecah per kelompok (madhi-mudhari'-mashdar-amr-nahi-dst).
3. Beri tips melafalkan cepat tanpa tersendat.
4. Tandai shighah yang sering terlupa.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Tabel Tashrif Lughawi untuk Dihafal",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Buatkan tabel tashrif lughawi fi'il madhi (14 dhamir: هو هما هم... أنت... أنا نحن) untuk fi'il [SEBUTKAN FI'IL, mis. كَتَبَ]:
1. Teks Arab berharakat tiap dhamir.
2. Tandai perubahan akhir fi'il per dhamir.
3. Beri tips menghafal pola perubahannya.
Lalu ulang untuk fi'il mudhari'.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Wazan & Tashrif",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Aku sudah belajar: [SEBUTKAN: mis. tsulatsi mujarrad, bab taf'il, i'lal ajwaf]. Buatkan jadwal muraja'ah:
1. Urutkan dari fondasi (tsulatsi) ke lanjutan (mazid, i'lal).
2. Jadwal H+1, H+3, H+7, mingguan.
3. Cara menguji tiap sesi (tashrif lisan, identifikasi wazan, dll).
4. Sajikan sebagai tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Drill Identifikasi Wazan",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 12 kata Arab berharakat (campuran mujarrad & mazid). Tugasku: tentukan wazan tiap kata.
1. Nomori, beri harakat penuh.
2. JANGAN beri jawaban dulu.
3. Setelah aku jawab, koreksi: sebutkan wazan benar, akar kata, dan bab-nya.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Tashrif dari Akar Kata",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 8 akar kata (3 huruf). Tugasku: tashrif istilahi lengkap tiap akar.
1. Sebutkan akarnya saja (mis. ف ت ح).
2. Aku tashrif sendiri (madhi → mudhari → mashdar → ...).
3. Koreksi hasilku, tunjukkan yang salah + kenapa (terutama kalau ada i'lal).

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Proses I'lal Bertahap",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 6 kata yang mengalami i'lal (mis. قَالَ dari قَوَلَ, رَمَى, دَعَا). Tugasku: jelaskan proses i'lal-nya.
1. Tampilkan bentuk asli (sebelum i'lal).
2. Aku uraikan proses perubahannya.
3. Koreksi: sebutkan jenis i'lal + kaidah yang berlaku.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Tahriri Sharaf (Gaya Azhari)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian tulis Sharaf gaya Azhar untuk bab [SEBUTKAN / "semester ini"]:
1. Tipe khas: shil (tashrif kata ini), 'ayyin al-wazn (tentukan wazan), 'allil (jelaskan i'lal), hawwil (ubah ke shighah lain).
2. 5-6 soal bobot bervariasi.
3. JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih + skor & catatan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Imtihan Syafawi Sharaf",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan syafawi.

Berperanlah sebagai mumtahin syafawi Sharaf:
1. Minta aku tashrif kata tertentu secara lisan, tentukan wazan, jelaskan i'lal.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Beri umpan balik, naikkan kesulitan bertahap.
4. Akhiri dengan penilaian kesiapan + area lemah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Prioritas Belajar Sharaf",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab yang kupelajari ([SEBUTKAN]), bantu strategi ujian:
1. Bab mana paling sering jadi soal (biasanya i'lal & identifikasi wazan).
2. Tipe soal yang paling mungkin keluar.
3. Kesalahan yang sering menurunkan nilai.
4. Prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi Sharaf",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (kutempel di bawah). Bantu:
1. Rapikan jadi poin kaidah terstruktur.
2. Lengkapi harakat istilah Arab.
3. Tandai yang perlu kutanyakan lagi.
4. Ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
        {
          title: "Verifikasi Pemahaman Pasca-Talaqqi Sharaf",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Setelah talaqqi bab [SEBUTKAN], aku jelaskan ulang dengan bahasaku (di bawah):
1. Periksa keakuratan pemahamanku, koreksi dengan teks Arab berharakat.
2. Ajukan 3 pertanyaan penguji.

[METODE]

[LEVEL_BAHASA]

Penjelasanku: [TEMPEL]`,
        },
      ],
      eksplorasi: [
        {
          title: "Sharaf untuk Membaca Kitab Gundul",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari teks gundul yang kutempel, latih aku pakai sharaf untuk membacanya:
1. Tentukan wazan & shighah kata-kata kunci.
2. Tunjukkan bagaimana mengenali bentuk kata membantu menentukan harakat & makna.
3. Tandai pola sharfi yang sering muncul di turats.

[METODE]

[LEVEL_BAHASA]

Teks: [TEMPEL]`,
        },
        {
          title: "Hubungan Sharaf dengan Makna & Mufradat",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan bagaimana wazan memengaruhi makna untuk akar [SEBUTKAN AKAR]:
1. Turunkan beberapa kata dari akar itu lewat wazan berbeda.
2. Jelaskan pergeseran makna tiap wazan (mis. fa''ala = taktsir, faa'ala = musyarakah).
3. Bagaimana ini membantu menebak makna kata baru di teks.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Studi Kasus Kata Sulit (Mu'tal & Mahmuz)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Aku bingung dengan fi'il mu'tal/mahmuz. Untuk kata [SEBUTKAN, mis. وَعَدَ، رَأَى، وَفَى]:
1. Klasifikasikan (mitsal, ajwaf, naqish, lafif, mahmuz).
2. Tashrif lengkapnya + jelaskan tiap perubahan akibat huruf 'illah/hamzah.
3. Kenapa kata jenis ini sering jadi jebakan ujian.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    }
  },

  {
    id: "qiraah-dl",
    name: "Qira'ah (DL)",
    nameArabic: "القراءة",
    category: "lughawi",
    fakultas: [],
    jurusan: [],
    tingkat: ["mustawa"],
    description: "Keterampilan membaca teks Arab fusha dengan pemahaman — dari teks sederhana sampai teks akademik. Fokus: kelancaran baca, pemahaman konteks, dan analisis kosakata baru.",
    descriptionArabic: "مهارة القراءة والفهم في اللغة العربية الفصحى",
    kitabUtama: [
      { nama: "Al-Qira'ah Ar-Rasyidah",  arabic: "القراءة الرشيدة",       penulis: "Abdul Aziz Al-Bisyri" },
      { nama: "Silsilah Ta'lim Al-Lughah Al-Arabiyyah", arabic: "سلسلة تعليم اللغة العربية", penulis: "Markaz Al-Malik Abdullah" },
      { nama: "Al-Arabiyyah Bayna Yadayk", arabic: "العربية بين يديك",    penulis: "Abdul Rahman Ibrahim Al-Fauzan" },
    ],
    recommendedAI: [
      { tool: "chatgpt",    rank: 1, strength: "Analisis teks, kosakata, dan latihan pemahaman", why: "ChatGPT sangat baik untuk mendampingi bacaan teks Arab — bisa jelaskan kosakata sulit, bantu analisis struktur kalimat, dan buat soal pemahaman dari teks yang kamu baca." },
      { tool: "claude",     rank: 2, strength: "Penjelasan mendalam teks sastra dan akademik",   why: "Claude cocok untuk teks Arab yang lebih kompleks dan butuh penjelasan kontekstual yang panjang dan terstruktur." },
      { tool: "notebooklm", rank: 3, strength: "Drill kosakata dari teks yang diupload",         why: "Upload teks bacaan ke NotebookLM, lalu drill kosakata dan pertanyaan pemahaman langsung dari sumber yang sama." },
    ],
    tutorial: {
      overview: "Qira'ah di DL melatih tiga hal: membaca lancar, memahami isi, dan memperkaya mufradat. Gunakan AI untuk mengolah teks yang sudah kamu baca — bukan menggantikan proses membaca itu sendiri.",
      steps: [
        { title: "Baca dulu, baru tanya AI",      body: "Baca paragraf sampai akhir terlebih dahulu. Tandai kata yang belum kamu pahami. Baru kemudian tanya AI untuk penjelasan — bukan langsung minta terjemah." },
        { title: "Analisis per paragraf",          body: "Gunakan AI untuk menganalisis satu paragraf: tema, kosakata kunci, struktur kalimat utama. Ini lebih efektif dari membaca sekilas satu teks panjang." },
        { title: "Buat glosarium pribadi",         body: "Setiap sesi baca, kumpulkan 5-10 kosakata baru. Minta AI buat contoh kalimat dari tiap kata. Simpan ke Kurasah sebagai glosarium kamu." },
        { title: "Latihan baca keras",             body: "Qira'ah bukan hanya membaca dalam hati. Latih membaca keras dengan memperhatikan harakat dan makhraj — rekam dirimu, evaluasi sendiri." },
      ],
    },
    prompts: {
      tabs: [
        {
          kind: "Pahami Konsep",
          prompts: [
            {
              title: "Analisis Teks Qira'ah",
              targetAI: "chatgpt",
              template: `Aku [TINGKATAN] di program bahasa Arab (DL). [GAYA_BELAJAR]. Bantu aku menganalisis teks Arab berikut:

[TEMPEL TEKS ARAB DI SINI]

Tolong:
1. Terjemahkan ke Bahasa Indonesia (natural, bukan harfiyyah)
2. Jelaskan 5 kosakata paling penting beserta bentuk dasarnya (fi'il madhi / isim mufrad)
3. Identifikasi struktur kalimat utama (jumlah ismiyyah / fi'liyyah)
4. Apa tema dan pesan utama teks ini?

[LEVEL_BAHASA]`,
            },
            {
              title: "Drill Pemahaman Teks",
              targetAI: "chatgpt",
              template: `Aku [TINGKATAN] di program bahasa Arab (DL). [GAYA_BELAJAR]. Bantu aku latihan pemahaman teks.

Ini teks yang sudah aku baca:
[TEMPEL TEKS ARAB DI SINI]

Buatkan 5 pertanyaan pemahaman (asmilah al-fahm) dalam Bahasa Arab, dari yang mudah ke yang membutuhkan analisis. Setelah aku jawab, koreksi dan berikan umpan balik.

[LEVEL_BAHASA]`,
            },
            {
              title: "Kosakata dari Teks",
              targetAI: "notebooklm",
              template: `Aku [TINGKATAN] di program bahasa Arab (DL). [GAYA_BELAJAR]. Dari teks yang sudah aku upload, bantu aku:

1. Buat daftar 10 kosakata paling penting dan frekuensinya dalam teks
2. Berikan contoh kalimat baru (bukan dari teks) untuk tiap kosakata
3. Tandai mana yang termasuk kosakata akademik (al-mufradat al-ilmiyyah)

[LEVEL_BAHASA]`,
            },
          ],
        },
        {
          kind: "Hafalan",
          prompts: [
            {
              title: "Hafal Mufradat Tematik",
              targetAI: "chatgpt",
              template: `Aku [TINGKATAN] di program bahasa Arab (DL). [GAYA_BELAJAR]. Aku sedang belajar [MADDAH].

Bantu aku hafal kosakata dengan metode kontekstual. Tema hari ini: [TULIS TEMA, mis: alam, kegiatan kampus, ibadah].

Caranya:
1. Berikan 8 kosakata tematik (Arab — Indonesia — contoh kalimat pendek)
2. Setelah aku hafal, uji aku: tampilkan kalimat dengan kata dikosongkan, aku yang isi
3. Koreksi dan beri skor

[LEVEL_BAHASA]`,
            },
            {
              title: "Rangkuman Isi Teks (Talkhish)",
              targetAI: "claude",
              template: `Aku [TINGKATAN] di program bahasa Arab (DL). [GAYA_BELAJAR]. Bantu aku berlatih merangkum teks (talkhish).

Ini teks aslinya:
[TEMPEL TEKS ARAB DI SINI]

Setelah aku tulis rangkumanku sendiri dalam Bahasa Arab (3-4 kalimat), tolong:
1. Koreksi struktur kalimat dan pilihan kata
2. Tunjukkan bagian mana yang penting tapi terlewat
3. Beri versi rangkuman idealnya sebagai referensi

[LEVEL_BAHASA]`,
            },
          ],
        },
        {
          kind: "Latihan & Drill",
          prompts: [
            {
              title: "Latihan Kelancaran Baca (Tartil)",
              targetAI: "chatgpt",
              template: `Aku [TINGKATAN] di program bahasa Arab (DL). [GAYA_BELAJAR]. Aku sedang berlatih kelancaran membaca teks Arab fusha.

Berikan aku teks Arab pendek (6-8 baris) sesuai level pemula-menengah, tentang tema kehidupan sehari-hari atau akademik. Sertakan:
1. Teks berharakat lengkap
2. Daftar kosakata sulit (5 kata) dengan maknanya
3. 3 pertanyaan pemahaman singkat

Setelah aku jawab, evaluasi kemampuan pemahamanku.

[LEVEL_BAHASA]`,
            },
            {
              title: "Identifikasi Struktur Kalimat",
              targetAI: "claude",
              template: `Aku [TINGKATAN] di program bahasa Arab (DL). [GAYA_BELAJAR]. Latihan analisis struktur kalimat Arab.

Ini kalimat-kalimat dari teks yang aku baca:
[TEMPEL 3-5 KALIMAT ARAB]

Untuk setiap kalimat:
1. Tentukan: jumlah ismiyyah atau fi'liyyah?
2. Identifikasi: mubtada-khabar / fi'il-fa'il-maf'ul
3. Tandai kata sambung (huruf ataf/jar) dan fungsinya

[LEVEL_BAHASA]`,
            },
          ],
        },
      ],
    },
  },

  {
    id: "insya-dl",
    name: "Insya' (DL)",
    nameArabic: "الإنشاء",
    category: "lughawi",
    fakultas: [],
    jurusan: [],
    tingkat: ["mustawa"],
    description: "Keterampilan menulis Arab fusha — dari kalimat sederhana sampai paragraf dan esai pendek. Fokus: kohesi kalimat, pilihan kosakata tepat, dan ekspresi ide secara terstruktur.",
    descriptionArabic: "مهارة الكتابة والتعبير بالعربية الفصحى",
    kitabUtama: [
      { nama: "Al-Mu'jam Al-Wasith",        arabic: "المعجم الوسيط",           penulis: "Majma' Al-Lughah Al-Arabiyyah" },
      { nama: "Jami' Ad-Durus Al-Arabiyyah", arabic: "جامع الدروس العربية",    penulis: "Musthafa Al-Ghalayini" },
      { nama: "Al-Arabiyyah Bayna Yadayk",   arabic: "العربية بين يديك",       penulis: "Abdul Rahman Ibrahim Al-Fauzan" },
    ],
    recommendedAI: [
      { tool: "claude",     rank: 1, strength: "Koreksi tulisan Arab dan saran peningkatan gaya", why: "Claude sangat teliti dalam koreksi tata bahasa dan gaya penulisan Arab — bisa berikan umpan balik spesifik per kalimat tanpa mengubah maksud tulisanmu." },
      { tool: "chatgpt",    rank: 2, strength: "Brainstorm ide dan kerangka tulisan",              why: "ChatGPT bagus untuk tahap awal: bantu kamu buat kerangka (takhtith), cari ide, dan menyusun alur paragraf sebelum mulai menulis." },
      { tool: "perplexity", rank: 3, strength: "Cari referensi ungkapan baku bahasa Arab",        why: "Kalau ragu apakah ungkapan tertentu lazim dipakai dalam bahasa Arab baku, Perplexity bisa cari referensi dari sumber Arab asli." },
    ],
    tutorial: {
      overview: "Insya' yang baik dimulai dari takhtith (kerangka), bukan langsung menulis. Gunakan AI sebagai mitra koreksi dan pemberi umpan balik — bukan mesin penulis otomatis.",
      steps: [
        { title: "Tulis dulu, koreksi kemudian",   body: "Jangan langsung minta AI tulis esai untukmu. Tulis draftmu sendiri dulu (walau belepotan), baru minta AI koreksi. Proses inilah yang membuatmu berkembang." },
        { title: "Mulai dari 1 paragraf",           body: "Latih insya' satu paragraf dahulu: 1 kalimat topik + 3-4 kalimat penjelas + 1 kalimat penutup. Ini struktur dasar yang perlu dikuasai sebelum esai panjang." },
        { title: "Perhatikan kata penghubung",      body: "Gunakan kata penghubung Arab (اذ، بينما، ومع ذلك، علاوة على ذلك) untuk membuat tulisan mengalir. Minta AI beri daftar kata penghubung sesuai konteks paragrafmu." },
        { title: "Buat glosarium ungkapan baku",    body: "Kumpulkan ungkapan baku Arab (al-ibarah al-muqarrarah) yang sering muncul dalam tulisan akademik. Simpan ke Kurasah — ini aset berharga untuk ujian." },
      ],
    },
    prompts: {
      tabs: [
        {
          kind: "Pahami Konsep",
          prompts: [
            {
              title: "Koreksi Tulisan Arab",
              targetAI: "claude",
              template: `Aku [TINGKATAN] di program bahasa Arab (DL). [GAYA_BELAJAR]. Tolong koreksi tulisan Arab berikut:

[TEMPEL TULISAN ARABMU DI SINI]

Tolong:
1. Koreksi kesalahan nahwu dan sharaf (sebutkan rule-nya)
2. Perbaiki pilihan kosakata yang kurang tepat atau tidak baku
3. Saran untuk membuat tulisan lebih mengalir (wasl antar kalimat)
4. Nilai keseluruhan (1-10) dan apa prioritas latihan selanjutnya

Jangan tulis ulang seluruh teks — cukup tunjukkan bagian yang perlu diperbaiki dengan alasannya.

[LEVEL_BAHASA]`,
            },
            {
              title: "Struktur Paragraf Arab",
              targetAI: "chatgpt",
              template: `Aku [TINGKATAN] di program bahasa Arab (DL). [GAYA_BELAJAR]. Ajari aku cara membuat paragraf Arab yang baik.

Tema yang ingin aku tulis: [TULIS TEMA]

Bantu aku:
1. Buat kerangka paragraf (jumlah ismiyyah pembuka, 3 poin penjelas, penutup)
2. Saran kosakata dan ungkapan yang cocok untuk tema ini
3. Contoh kalimat topik (jumlah ra'isiyyah) yang kuat

Aku yang akan menulis isi paragrafnya sendiri.

[LEVEL_BAHASA]`,
            },
          ],
        },
        {
          kind: "Hafalan",
          prompts: [
            {
              title: "Hafal Ungkapan Baku (Ibarah Muqarrarah)",
              targetAI: "chatgpt",
              template: `Aku [TINGKATAN] di program bahasa Arab (DL). [GAYA_BELAJAR]. Bantu aku hafal ungkapan baku Arab untuk [MADDAH].

Berikan 10 ungkapan baku yang sering dipakai dalam tulisan Arab akademik/formal, dengan:
1. Ungkapan Arab (berharakat)
2. Arti dalam Bahasa Indonesia
3. Contoh pemakaian dalam kalimat
4. Situasi/konteks penggunaannya

Setelah aku pelajari, uji aku: tampilkan artinya, aku yang tulis ungkapan Arabnya.

[LEVEL_BAHASA]`,
            },
            {
              title: "Template Insya' Berbagai Tema",
              targetAI: "claude",
              template: `Aku [TINGKATAN] di program bahasa Arab (DL). [GAYA_BELAJAR]. Aku butuh template kerangka insya' untuk tema:

[TULIS TEMA INSYA']

Berikan:
1. Kerangka (takhtith): muqaddimah, 2-3 poin isi, khatimah
2. Kosakata kunci yang wajib ada untuk tema ini (8-10 kata)
3. Kata penghubung yang cocok untuk masing-masing bagian
4. Kalimat pembuka (muqaddimah) sebagai contoh — sisanya aku tulis sendiri

[LEVEL_BAHASA]`,
            },
          ],
        },
        {
          kind: "Latihan & Drill",
          prompts: [
            {
              title: "Latihan Insya' Terbimbing",
              targetAI: "chatgpt",
              template: `Aku [TINGKATAN] di program bahasa Arab (DL). [GAYA_BELAJAR]. Aku mau latihan insya' terbimbing (al-kitabah al-muwajjahah).

Berikan aku:
1. Satu tema sederhana untuk ditulis (1 paragraf, 5-7 kalimat)
2. 5 kata kunci yang harus aku pakai
3. Kata penghubung yang disarankan

Aku akan tulis paragrafnya, lalu kamu koreksi.

[LEVEL_BAHASA]`,
            },
            {
              title: "Transformasi Kalimat",
              targetAI: "claude",
              template: `Aku [TINGKATAN] di program bahasa Arab (DL). [GAYA_BELAJAR]. Latihan transformasi kalimat Arab.

Untuk setiap kalimat berikut, minta aku transformasikan sesuai instruksi:
[ATAU: berikan aku 5 kalimat sederhana, aku yang transformasikan]

Jenis transformasi: [pilih: aktif→pasif / mufrad→jamak / kalimat positif→negatif / jumlah ismiyyah→fi'liyyah]

Setelah aku jawab, koreksi dan jelaskan rule nahwu/sharaf yang berlaku.

[LEVEL_BAHASA]`,
            },
          ],
        },
      ],
    },
  },

  {
    id: "istima-dl",
    name: "Istima' (DL)",
    nameArabic: "الاستماع",
    category: "lughawi",
    fakultas: [],
    jurusan: [],
    tingkat: ["mustawa"],
    description: "Keterampilan menyimak Arab fusha — melatih pemahaman audio dari ceramah, dialog, dan konten Arab. Karena AI berbasis teks, pendekatan: simak audio sendiri → olah transkripnya bersama AI.",
    descriptionArabic: "مهارة الاستماع والفهم من المصادر الصوتية العربية",
    kitabUtama: [
      { nama: "Silsilah Ta'lim Al-Lughah Al-Arabiyyah", arabic: "سلسلة تعليم اللغة العربية", penulis: "Markaz Al-Malik Abdullah" },
      { nama: "Al-Arabiyyah Bayna Yadayk",   arabic: "العربية بين يديك",       penulis: "Abdul Rahman Ibrahim Al-Fauzan" },
      { nama: "Al-Qira'ah Ar-Rasyidah",     arabic: "القراءة الرشيدة",         penulis: "Abdul Aziz Al-Bisyri" },
    ],
    recommendedAI: [
      { tool: "chatgpt",    rank: 1, strength: "Analisis transkripsi dan latihan pemahaman audio", why: "Setelah kamu transkripsi atau tempel teks dari audio Arab, ChatGPT bisa bantu analisis isi, terjemahkan, dan buat soal pemahaman dari materi yang sudah kamu simak." },
      { tool: "claude",     rank: 2, strength: "Penjelasan mendalam konten ceramah/khutbah Arab",  why: "Claude bagus untuk mengolah transkripsi ceramah atau teks panjang — bisa jelaskan konteks, kosakata, dan pokok-pokok isi dengan sistematis." },
      { tool: "perplexity", rank: 3, strength: "Cari sumber audio Arab dan konteks topiknya",      why: "Perplexity bisa bantu kamu temukan ceramah, podcast, atau konten audio Arab berkualitas sesuai level, sekaligus cari konteks topik yang kamu dengarkan." },
    ],
    tutorial: {
      overview: "Istima' butuh sumber audio — AI teks tidak bisa 'mendengarkan' bersamamu. Alurnya: (1) simak audio Arab sendiri, (2) transkripsi atau tempel teksnya, (3) olah bersama AI untuk pemahaman dan analisis.",
      steps: [
        { title: "Pilih sumber audio yang tepat",   body: "Mulai dari audio lambat dan jelas: berita Al-Jazeera versi lambat, ceramah pendek ulama, atau dialog dari buku paket bahasa Arab. Hindari percakapan native speed di awal." },
        { title: "Simak aktif, bukan pasif",         body: "Saat menyimak, coba tangkap: tema utama, kata yang diulang, dan kata yang belum kamu kenal. Tulis catatan singkat sebelum tanya AI." },
        { title: "Tempel transkripsi ke AI",         body: "Kalau tersedia, tempel transkripsi audio ke ChatGPT atau Claude. Minta analisis kosakata, struktur kalimat, dan pertanyaan pemahaman dari teks tersebut." },
        { title: "Latihan shadowing",               body: "Putar audio, lalu tirukan pengucapan dengan jeda (shadowing). Fokus pada intonasi dan ritme, bukan hanya lafal. Ini salah satu cara terbaik melatih 'telinga' bahasa Arab." },
      ],
    },
    prompts: {
      tabs: [
        {
          kind: "Pahami Konsep",
          prompts: [
            {
              title: "Analisis Transkripsi Audio Arab",
              targetAI: "chatgpt",
              template: `Aku [TINGKATAN] di program bahasa Arab (DL). [GAYA_BELAJAR]. Aku baru mendengarkan audio Arab dan ingin mengolah isinya.

Ini transkripsi / teks dari audio yang aku dengar:
[TEMPEL TRANSKRIPSI ATAU TEKS ARAB DI SINI]

Tolong:
1. Terjemahkan ke Bahasa Indonesia
2. Jelaskan 5 kosakata penting yang mungkin sulit didengar oleh pelajar
3. Apa tema dan poin utama dari audio ini?
4. Buat 3 pertanyaan pemahaman tentang isi audio

[LEVEL_BAHASA]`,
            },
            {
              title: "Kosakata dari Konten Audio",
              targetAI: "chatgpt",
              template: `Aku [TINGKATAN] di program bahasa Arab (DL). [GAYA_BELAJAR]. Aku sedang belajar [MADDAH] dari konten audio Arab.

Tema audio yang aku dengarkan: [TULIS TEMA]

Berikan aku:
1. 10 kosakata yang kemungkinan sering muncul dalam audio bertema ini
2. Frasa/ungkapan baku yang biasa dipakai dalam konteks ini
3. Tips cara membedakan kata yang mirip bunyinya (al-alfaz al-mutasyabiha)

Ini akan aku pakai untuk menyimak lebih efektif.

[LEVEL_BAHASA]`,
            },
          ],
        },
        {
          kind: "Hafalan",
          prompts: [
            {
              title: "Hafal Frasa dari Audio",
              targetAI: "claude",
              template: `Aku [TINGKATAN] di program bahasa Arab (DL). [GAYA_BELAJAR]. Dari audio yang aku dengar, aku menemukan frasa/ungkapan berikut yang ingin aku hafal:

[TULIS FRASA/KALIMAT ARAB YANG INGIN DIHAFAL]

Bantu aku:
1. Pastikan tulisan dan harakat sudah benar
2. Jelaskan arti dan konteks pemakaian tiap frasa
3. Buat 2 kalimat baru yang menggunakan frasa yang sama
4. Buat kartu hafalan digital: Arab | Arti | Contoh Kalimat

[LEVEL_BAHASA]`,
            },
            {
              title: "Latihan Dikte (Imla') dari Teks",
              targetAI: "chatgpt",
              template: `Aku [TINGKATAN] di program bahasa Arab (DL). [GAYA_BELAJAR]. Aku mau latihan imla' (dikte) untuk melatih kemampuan menyimak dan menulis.

Berikan aku teks Arab pendek (4-5 kalimat) sesuai level pemula-menengah.
Baca teksnya kalimat per kalimat (tuliskan satu per satu dengan jeda).
Aku akan menuliskan apa yang aku "dengar" (baca dari layar).
Setelah aku selesai, koreksi tulisanku — apakah kosakata dan harakat sudah tepat?

[LEVEL_BAHASA]`,
            },
          ],
        },
        {
          kind: "Latihan & Drill",
          prompts: [
            {
              title: "Drill Pemahaman dari Transkripsi",
              targetAI: "chatgpt",
              template: `Aku [TINGKATAN] di program bahasa Arab (DL). [GAYA_BELAJAR]. Latihan pemahaman istima' dari transkripsi.

Ini teks dari audio yang aku dengarkan:
[TEMPEL TRANSKRIPSI ARAB]

Buatkan 5 soal pemahaman bergaya pilihan ganda (4 pilihan) tentang isi teks ini.
Setelah aku jawab semua, koreksi, jelaskan yang salah, dan beri skor.

[LEVEL_BAHASA]`,
            },
            {
              title: "Identifikasi Kosakata Sulit dari Audio",
              targetAI: "claude",
              template: `Aku [TINGKATAN] di program bahasa Arab (DL). [GAYA_BELAJAR]. Aku baru menyimak audio Arab dan ada beberapa kata yang belum aku pahami.

Kata/frasa yang aku dengar (mungkin penulisannya belum tepat):
[TULIS KATA-KATA YANG KAMU DENGAR TAPI BELUM YAKIN ARTINYA]

Untuk setiap kata:
1. Koreksi penulisan jika perlu (berharakat)
2. Arti dan bentuk dasar (fi'il madhi / isim mufrad)
3. Contoh pemakaian dalam kalimat
4. Apakah ini kata umum atau kosakata khusus (teknis/formal)?

[LEVEL_BAHASA]`,
            },
          ],
        },
      ],
    },
  },

  {
    id: "balaghah",
    name: "Balaghah",
    nameArabic: "البلاغة",
    category: "lughawi",
    fakultas: ["ushuluddin", "lughah", "dirasat", "dirasat-banin"],
    jurusan: ["dirasat_lughah"],
    tingkat: ["2", "3", "4", "pasca"],
    description: "Ilmu retorika Arab — 'ilmu ma'ani (kalimat efektif), bayan (gaya ungkap), badi' (keindahan). Fondasi untuk memahami i'jaz Al-Qur'an.",
    descriptionArabic: "علم البلاغة بأقسامه الثلاثة",
    kitabUtama: [
      { nama: "Al-Balaghah Al-Wadhihah", arabic: "البلاغة الواضحة",     penulis: "'Ali Al-Jarim & Mushthafa Amin" },
      { nama: "Jawahirul Balaghah",       arabic: "جواهر البلاغة",       penulis: "Ahmad Al-Hasyimi" },
      { nama: "'Uqud Al-Juman",           arabic: "عقود الجمان",         penulis: "As-Suyuthi" },
    ],
    recommendedAI: [
      { tool: "claude",     rank: 1, strength: "Analisis uslub balaghi dari teks Arab, identifikasi figur retorika", why: "Claude kuat dalam mengidentifikasi dan menganalisis figur-figur retorika dari teks Arab, termasuk nuansa halus antara isti'arah dan majaz." },
      { tool: "notebooklm", rank: 2, strength: "Drill istilah balaghah dan contoh-contoh dari kitab",               why: "Upload Al-Balaghah Al-Wadhihah untuk drill definisi istilah dengan contoh yang akurat dari kitab." },
    ],
    tutorial: {
      overview: "Balaghah terbagi tiga: ma'ani (kefektifan), bayan (gaya), badi' (keindahan). Pelajari berurutan.",
      steps: [
        { title: "Mulai dari 'ilmu ma'ani",         body: "Ma'ani adalah fondasi: kalimat khabariyyah vs insya'iyyah, musnad dan musnad ilaih, qasr, fashl-washl, ijaz-ithnab. Pahami ini dulu." },
        { title: "Lanjut ke 'ilmu bayan",            body: "Bayan: tasybih, majaz, isti'arah, kinayah. Ini yang paling sering muncul di tafsir Qur'an." },
        { title: "Pelajari badi' sebagai pelengkap", body: "Badi' adalah keindahan tambahan: jinas, tibaq, muqabalah. Lebih mudah dari ma'ani dan bayan." },
        { title: "Praktik di teks Qur'an",           body: "Balaghah baru bermakna saat diaplikasikan ke teks Al-Qur'an. Minta AI analisis ayat dari sudut balaghah." },
      ],
    },
    prompts: {
      pahami: [
        {
          title: "Peta Besar Ilmu Balaghah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri kerangka utuh Balaghah:
1. Tiga cabang: 'Ilmu al-Ma'ani, 'Ilmu al-Bayan, 'Ilmu al-Badi' — fokus tiap cabang.
2. Apa itu fashahah & balaghah (definisi + syarat).
3. Outline bercabang dengan sub-topik tiap cabang.
4. Urutan belajar ideal.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami 'Ilmu al-Bayan (Tasybih, Majaz, Kinayah)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan 'ilmu al-bayan:
1. Tasybih: rukun (musyabbah, musyabbah bih, adat, wajh) + jenis (mursal, mu'akkad, baligh) — teks Arab berharakat + contoh.
2. Majaz (lughawi: isti'arah & majaz mursal) + 'alaqah-nya.
3. Kinayah + jenisnya.
Beri contoh tiap konsep (dari syair/Qur'an bila ada — jangan mengarang ayat).

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami 'Ilmu al-Ma'ani",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan 'ilmu al-ma'ani:
1. Khabar & insya' (+ tujuan keluar dari makna asli).
2. Taqdim-ta'khir, qashr, washl-fashl, ijaz-ithnab-musawah.
3. Untuk tiap: definisi (Arab berharakat) + faedah balaghi + contoh.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami 'Ilmu al-Badi'",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan 'ilmu al-badi':
1. Muhassinat ma'nawiyah (tibaq, muqabalah, tauriyah, husn ta'lil) — definisi + contoh.
2. Muhassinat lafzhiyah (jinas, saja', radd 'ajuz 'ala shadr) — definisi + contoh.
3. Beda muhassinat ma'nawi & lafzhi.
Sertakan teks Arab berharakat.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Klasifikasi Tasybih & Majaz",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal pembagian tasybih & majaz:
1. Skema bercabang jenis tasybih + jenis isti'arah + majaz mursal ('alaqah-nya).
2. Mnemonic untuk tiap cabang.
3. Tandai yang sering tertukar (mis. isti'arah vs tasybih baligh).

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Tabel Muhassinat Badi' untuk Dihafal",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Buatkan tabel hafalan muhassinat:
1. Kolom: nama (Arab berharakat) | jenis (ma'nawi/lafzhi) | definisi ringkas | contoh.
2. Tandai yang sering jadi soal istikhraj.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Balaghah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah H+1, H+3, H+7, mingguan + cara uji (istikhraj dari teks). Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Drill Istikhraj (Temukan Gaya Balaghah dari Teks)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 6 potongan teks Arab berharakat (syair/prosa; sebut sumber bila ayat/hadits, jangan mengarang). Tugasku: temukan & jelaskan gaya balaghah-nya (tasybih/isti'arah/kinayah/dst).
1. JANGAN beri jawaban dulu.
2. Setelah aku jawab, koreksi + jelaskan jenis & wajh-nya.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Analisis Tasybih (Tentukan Rukun)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 8 contoh tasybih. Tugasku: tentukan rukun (musyabbah, musyabbah bih, adat, wajh) & jenisnya.
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Menyusun Kalimat Balaghi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Minta aku menyusun kalimat yang mengandung gaya tertentu (mis. "buat kalimat dengan isti'arah makniyah").
1. Beri 6 instruksi.
2. Aku susun kalimatnya berharakat.
3. Koreksi: apakah gayanya tepat, perbaiki bila keliru.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Tahriri Balaghah (Gaya Azhari)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian tulis Balaghah gaya Azhar untuk bab [SEBUTKAN]:
1. Tipe khas: 'arrif + matsil, istakhrij ... wa bayyin nau'ahu, ma al-farq baina, 'allil al-balaghah.
2. 5-6 soal bobot bervariasi (sering ada potongan teks untuk dianalisis).
3. JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih + skor & catatan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Imtihan Syafawi Balaghah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan syafawi.

Berperanlah sebagai mumtahin syafawi:
1. Beri potongan teks, minta aku temukan & jelaskan gaya balaghah-nya secara lisan.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik, naikkan kesulitan.
4. Penilaian akhir + area lemah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian Balaghah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab yang kupelajari ([SEBUTKAN]): bab tersering jadi soal istikhraj, tipe soal mungkin keluar, cara jawab dapat nilai penuh (sebut jenis + rukun + wajh), prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi Balaghah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (di bawah). Rapikan jadi poin (definisi + contoh tiap gaya), lengkapi harakat, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
        {
          title: "Verifikasi Pemahaman Pasca-Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Setelah talaqqi bab [SEBUTKAN], aku jelaskan ulang + beri contoh buatanku (di bawah). Periksa keakuratan, koreksi contoh yang keliru, ajukan 3 pertanyaan penguji.

[METODE]

[LEVEL_BAHASA]

Penjelasanku: [TEMPEL]`,
        },
      ],
      eksplorasi: [
        {
          title: "Balaghah & I'jaz Al-Qur'an",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Tunjukkan keindahan balaghi satu ayat [SEBUTKAN, sebut surat & nomor]:
1. Gaya balaghah yang ada (ma'ani/bayan/badi').
2. Bagaimana gaya itu memperkaya makna (wajh i'jaz bayani).
3. Kenapa pilihan kata/struktur itu tak tergantikan.
PENTING: kutip ayat dengan benar; jika ragu, minta aku tempel.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Apresiasi Balaghah Syair & Prosa Arab",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari potongan syair/prosa yang kutempel:
1. Bedah gaya balaghah-nya satu per satu.
2. Jelaskan kenapa ungkapan itu dianggap indah (sirr al-balaghah).
3. Bandingkan dengan cara ungkap biasa untuk melihat kelebihannya.

[METODE]

[LEVEL_BAHASA]

Teks: [TEMPEL]`,
        },
        {
          title: "Hubungkan Balaghah dengan Nahwu & Makna",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan kaitan ma'ani dengan nahwu untuk fenomena [SEBUTKAN, mis. taqdim-ta'khir, hadzf, ta'rif-tankir]:
1. Aspek nahwunya.
2. Faedah balaghi dari pilihan itu.
3. Contoh dari Al-Qur'an/syair (jangan mengarang).

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  {
    id: "adab",
    name: "Adab (Sastra Arab)",
    nameArabic: "الأدب العربي",
    category: "lughawi",
    fakultas: ["lughah", "dirasat"],
    jurusan: ["dirasat_lughah"],
    tingkat: ["1", "2", "3", "4", "pasca"],
    description: "Sastra Arab — Jahiliyah, Shadr Islam, Umawi, Abbasi, Andalusi, Hadits. Puisi (syi'r) dan prosa (nathr) klasik. Analisis tema, uslub, dan periode.",
    descriptionArabic: "تاريخ الأدب العربي ونصوصه",
    kitabUtama: [
      { nama: "Al-Mu'allaqat",                       arabic: "المعلقات",                         penulis: "Penyair Jahiliyah" },
      { nama: "Tarikhul Adabil 'Arabi",              arabic: "تاريخ الأدب العربي",              penulis: "Ahmad Hasan Az-Zayyat" },
      { nama: "Al-Wasith fil Adabi wal Tarikhi",     arabic: "الوسيط في الأدب",                 penulis: "Ahmad Al-Iskandar & Mushthafa 'Inani" },
    ],
    recommendedAI: [
      { tool: "claude",      rank: 1, strength: "Analisis dan syarah teks sastra Arab klasik", why: "Teks sastra Arab klasik butuh interpretasi yang mendalam. Claude kuat dalam memahami konteks historis dan menganalisis gaya sastra." },
      { tool: "notebooklm",  rank: 2, strength: "Navigasi diwan dan teks yang di-upload",      why: "Upload diwan penyair tertentu ke NotebookLM untuk drill bait-bait dan navigasi karya dengan akurat." },
    ],
    tutorial: {
      overview: "Adab dipelajari dalam dua dimensi: sejarah (tarikh adabi) dan analisis teks (naqd adabi).",
      steps: [
        { title: "Pelajari periode secara kronologis", body: "Mulai dari Jahiliyah → Islam awal → Umawi → Abbasi → Andalusi → Mamluk/Utsmani → Modern. Setiap periode punya ciri khas." },
        { title: "Kenali penyair utama per periode", body: "Setiap periode punya penyair ikonik (Imrul Qais untuk Jahiliyah, Al-Mutanabbi untuk Abbasi). Pahami mereka dulu." },
        { title: "Latihan syarah bait",              body: "Skill inti dalam ujian adab adalah mensyarah bait. Minta AI syarah bertahap — jangan langsung minta penjelasan utuh." },
        { title: "Analisis uslub penyair",           body: "Setiap penyair punya uslub (gaya) khas. Identifikasi: diksi, tema dominan, figur balaghah yang sering dipakai." },
      ],
    },
    prompts: {
      pahami: [
        {
          title: "Peta Besar Sejarah Sastra Arab",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri kerangka utuh tarikh adab 'arabi:
1. Periodisasi: Jahili → Shadr Islam → Umawi → 'Abbasi → masa kemunduran → Nahdhah (modern).
2. Ciri sastra (syi'r & natsr) tiap masa.
3. Outline kronologis bercabang.
4. Kenapa memahami konteks zaman penting untuk apresiasi sastra.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Sastra Masa Jahili",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan sastra Jahili:
1. Ciri syi'r jahili (tema, struktur qasidah, bahasa).
2. Mu'allaqat & penyair masyhur (mis. Imru' al-Qais) — sebut yang kamu yakin; jika ragu, katakan.
3. Natsr jahili (khutbah, hikmah, amtsal).
4. Kenapa sastra jahili jadi rujukan kebahasaan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Sastra Masa 'Abbasi (Puncak)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan sastra masa 'Abbasi:
1. Faktor kemajuan sastra (percampuran budaya, dukungan khalifah).
2. Perkembangan tema & gaya baru (badi', tema filosofis).
3. Penyair & penulis masyhur (mis. al-Mutanabbi, al-Jahizh) — sebut yang kamu yakin.
4. Perkembangan natsr (risalah, maqamah).

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Unsur Analisis Teks Sastra",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Ajari aku menganalisis teks sastra (syi'r/natsr):
1. Unsur yang dianalisis: tema (gharadh), makna, 'athifah (emosi), khayal (imaji), uslub (gaya), musiqa.
2. Cara mengaitkan teks dengan konteks zaman & penyairnya.
3. Langkah analisis sistematis.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Periodisasi & Ciri Tiap Masa",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal periodisasi sastra Arab:
1. Timeline tiap masa + ciri syi'r & natsr-nya.
2. Mnemonic untuk urutan masa.
3. Penyair/penulis kunci tiap masa.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Hafal Bait/Kutipan Sastra Penting",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk masa/penyair [SEBUTKAN], bantu hafal kutipan penting:
1. Bait/kutipan + makna + konteksnya.
PENTING: hanya kutip bait yang kamu yakin keasliannya; jika ragu, minta aku tempel. Jangan mengarang bait.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Adab",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Masa/topik yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah H+1, H+3, H+7, mingguan + cara uji (sebut ciri masa, penyair, analisis teks). Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Analisis Teks Sastra (Aku Coba, AI Koreksi)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Aku akan menganalisis teks sastra yang kutempel dengan kemampuanku.
1. Koreksi analisisku (tema, makna, gaya, imaji, kaitan konteks).
2. Tunjukkan aspek yang terlewat.
3. Perkaya dengan istilah naqd yang tepat.

[METODE]

[LEVEL_BAHASA]

Teks + analisisku: [TEMPEL]`,
        },
        {
          title: "Drill Identifikasi Masa dari Ciri Teks",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 6 potongan teks/deskripsi ciri sastra. Tugasku: tebak dari masa mana & alasannya.
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab + jelaskan penanda khas tiap masa.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Soal Sejarah & Tokoh Sastra",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal campuran (ciri masa, tokoh, karya, istilah sastra) dari [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Tahriri Adab (Gaya Azhari)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian tulis Adab gaya Azhar untuk masa/topik [SEBUTKAN]:
1. Tipe khas: tahaddats 'an khasha'is..., hallil an-nashsh al-ati, tarjim li... (biografi tokoh), ma 'awamil...
2. 5-6 soal bobot bervariasi (sering ada teks untuk dianalisis).
3. JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih + skor & catatan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Imtihan Syafawi Adab",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan syafawi.

Berperanlah sebagai mumtahin syafawi:
1. Tanya ciri masa, biografi tokoh, atau minta aku analisis teks pendek secara lisan.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik, naikkan kesulitan.
4. Penilaian akhir + area lemah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian Adab",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari masa/topik yang kupelajari ([SEBUTKAN]): topik yang sering jadi soal (biasanya analisis teks & ciri masa), cara menulis jawaban analitis, prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi Adab",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (di bawah). Rapikan jadi: masa → ciri → tokoh → contoh teks, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
        {
          title: "Verifikasi Pemahaman Pasca-Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Setelah talaqqi masa/topik [SEBUTKAN], aku jelaskan ulang (di bawah). Periksa keakuratan fakta sastra, koreksi, ajukan 3 pertanyaan penguji.

[METODE]

[LEVEL_BAHASA]

Penjelasanku: [TEMPEL]`,
        },
      ],
      eksplorasi: [
        {
          title: "Hubungkan Sastra dengan Balaghah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari teks sastra yang kutempel:
1. Tunjukkan gaya balaghah yang dipakai (tasybih, isti'arah, kinayah, badi').
2. Bagaimana gaya itu membangun keindahan & makna.
3. Kaitkan dengan ciri sastra masanya.

[METODE]

[LEVEL_BAHASA]

Teks: [TEMPEL]`,
        },
        {
          title: "Telaah Madrasah Sastra Modern (Nahdhah)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan kebangkitan sastra Arab modern:
1. Faktor nahdhah adabiyyah.
2. Aliran/madrasah sastra modern (mis. Diwan, Apollo, Mahjar) — sebut yang kamu yakin.
3. Tokoh & pembaruan yang mereka bawa.
PENTING: jika tidak yakin fakta, katakan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Apresiasi & Pengaruh Sastra terhadap Bahasa",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan:
1. Bagaimana sastra (terutama syi'r) menjaga & memperkaya bahasa Arab.
2. Peran sastra sebagai syahid kebahasaan dalam nahwu & lughah.
3. Kenapa thalib Azhar perlu mengapresiasi sastra, bukan sekadar menghafal sejarahnya.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  {
    id: "arudh",
    name: "'Arudh wal Qawafi",
    nameArabic: "العروض والقوافي",
    category: "lughawi",
    fakultas: ["lughah", "dirasat"],
    jurusan: ["dirasat_lughah"],
    tingkat: ["2", "3", "4"],
    description: "Ilmu prosodi puisi Arab — taqthi' (memotong menjadi taf'ilah), identifikasi bahr (irama), dan qafiyah (sajak). Alat untuk menganalisis syi'r Arab.",
    descriptionArabic: "علم أوزان الشعر العربي وقوافيه",
    kitabUtama: [
      { nama: "Matnul Kafi fi 'Ilmayil 'Arudh wal Qawafi", arabic: "متن الكافي",         penulis: "Al-Khaththib At-Tibrizi" },
      { nama: "Mizanudz Dzahab",                            arabic: "ميزان الذهب",        penulis: "Ahmad Al-Hasyimi" },
    ],
    recommendedAI: [
      { tool: "claude",     rank: 1, strength: "Analisis taqthi' bait dan identifikasi bahr",    why: "Claude bisa membantu menganalisis taf'ilah dari bait syi'r step by step dan mengidentifikasi bahr berdasarkan pola taf'ilah." },
      { tool: "notebooklm", rank: 2, strength: "Drill nama bahr, wazn, dan taf'ilah dari kitab", why: "Upload kitab 'arudh untuk drill nama-nama bahr dan pola taf'ilah dengan akurat." },
    ],
    tutorial: {
      overview: "'Arudh adalah ilmu teknis — pelajari langkah demi langkah, mulai dari taqthi'.",
      steps: [
        { title: "Hafal 10 bahr utama dahulu",        body: "Ada 16 bahr dalam syi'r Arab, tapi 10 yang paling sering dipakai. Hafal nama dan pola taf'ilah masing-masing." },
        { title: "Pelajari taqthi' bertahap",         body: "Taqthi' = memotong bait menjadi taf'ilah. Mulai dengan bahr mudah: Thawil, Basith, Kamil. Latih berulang." },
        { title: "Kenali zihaf dan 'illah",           body: "Zihaf = perubahan yang dibolehkan dalam taf'ilah. 'Illah = perubahan di 'arudh dan dharb. Ini sering membingungkan." },
        { title: "Latihan identifikasi qafiyah",      body: "Qafiyah adalah sajak di akhir setiap bait. Pelajari istilahnya: huruf rawiy, waishl, khuruj, dll." },
      ],
    },
    prompts: {
      pahami: [
        {
          title: "Peta Besar Ilmu 'Arudh",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri kerangka utuh ilmu 'arudh wal qawafi:
1. Definisi 'arudh (ilmu timbangan syair) & qafiyah + tujuannya (menjaga syair dari cacat wazan).
2. Konsep dasar: taf'ilat, bahr, dha'irah.
3. Konsep qafiyah & huruf-hurufnya.
4. Outline + kenapa penting untuk apresiasi & penulisan syair.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Kitabah 'Arudhiyyah & Taqthi'",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan cara menulis 'arudh & memotong bait (taqthi'):
1. Kaidah kitabah 'arudhiyyah (yang ditulis = yang diucapkan).
2. Lambang harakat & sukun (/ dan ه atau o).
3. Langkah taqthi' satu bait jadi taf'ilat.
4. Contoh taqthi' bertahap satu bait.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Bahr-Bahr Syair Utama",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan bahr (lautan/wazan) syair yang sering muncul:
1. Bahr thawil, basith, kamil, wafir, rajaz — taf'ilat-nya + ciri khasnya.
2. Cara mengenali bahr dari pola taf'ilat.
3. Mnemonic taf'ilat tiap bahr (mis. "thawilun lahu...").

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Zihaf & 'Illah (Perubahan Taf'ilat)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan perubahan pada taf'ilat:
1. Zihaf (perubahan ringan, tidak tetap) — jenis & contoh.
2. 'Illah (perubahan tetap di 'arudh/dharb) — jenis & contoh.
3. Bagaimana ini memengaruhi penulisan taf'ilat.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Taf'ilat Tiap Bahr",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal taf'ilat bahr-bahr utama:
1. Tabel: bahr | taf'ilat (penuh) | mnemonic.
2. Cara cepat mengingat urutan taf'ilat.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Hafal Lambang & Istilah 'Arudh",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal:
1. Istilah (taf'ilah, bahr, 'arudh, dharb, hasywu, qafiyah, rawi) + arti.
2. Lambang taqthi'.
3. Mnemonic.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah 'Arudh",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bahr/topik yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah H+1, H+3, H+7, mingguan + cara uji (taqthi' bait, kenali bahr). Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Taqthi' Bait (Aku Coba, AI Koreksi)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Aku akan men-taqthi' bait yang kutempel.
1. Koreksi taqthi'-ku (pemotongan taf'ilat, lambang).
2. Tunjukkan bahr-nya & zihaf/'illah bila ada.
PENTING: pakai bait yang kutempel; jangan mengarang bait.

[METODE]

[LEVEL_BAHASA]

Bait: [TEMPEL]`,
        },
        {
          title: "Drill Kenali Bahr dari Pola",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 6 pola taf'ilat. Tugasku: tentukan bahr-nya.
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Soal Definisi & Bahr",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal campuran (definisi, taf'ilat, bahr, zihaf/'illah, qafiyah) dari [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Tahriri (Gaya Azhari)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian tulis 'Arudh gaya Azhar untuk topik [SEBUTKAN]:
1. Tipe khas: qaththi' al-bait wa sammi al-bahr, 'arrif, udzkur taf'ilat bahr..., istakhrij az-zihaf.
2. 5-6 soal bobot bervariasi.
3. JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih + skor & catatan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Imtihan Syafawi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan syafawi.

Berperanlah sebagai mumtahin syafawi:
1. Tanya taf'ilat bahr, definisi, atau minta taqthi' lisan.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik, naikkan kesulitan.
4. Penilaian akhir + area lemah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari topik yang kupelajari ([SEBUTKAN]): yang sering jadi soal (biasanya taqthi' & kenali bahr), cara jawab agar tidak salah potong, prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (di bawah). Rapikan jadi: bahr → taf'ilat → contoh taqthi', tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
        {
          title: "Verifikasi Pemahaman Pasca-Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Setelah talaqqi bahr/topik [SEBUTKAN], aku jelaskan ulang + taqthi' contoh (di bawah). Periksa keakuratan, koreksi, ajukan 3 pertanyaan penguji.

[METODE]

[LEVEL_BAHASA]

Penjelasanku: [TEMPEL]`,
        },
      ],
      eksplorasi: [
        {
          title: "'Arudh & Apresiasi Musik Syair",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan:
1. Bagaimana wazan & irama membangun musik (musiqa) syair.
2. Hubungan pemilihan bahr dengan suasana/tema syair.
3. Kenapa memahami 'arudh memperdalam apresiasi syair.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Ilmu Qafiyah Mendalam",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan ilmu qafiyah:
1. Definisi qafiyah & huruf-hurufnya (rawi, washl, ridf, dll).
2. Harakat qafiyah (majra, hadzw, dll).
3. Cacat qafiyah ('uyub al-qafiyah) yang harus dihindari.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "'Arudh untuk Menulis Syair Sendiri",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu aku mencoba menulis bait sederhana sesuai wazan:
1. Pilih satu bahr mudah (mis. rajaz) + taf'ilat-nya.
2. Bimbing aku menyusun bait yang sesuai wazan.
3. Koreksi bait buatanku & tunjukkan letak yang perlu diperbaiki.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  {
    id: "fiqh-lughah",
    name: "Fiqh Al-Lughah",
    nameArabic: "فقه اللغة",
    category: "lughawi",
    fakultas: ["lughah", "dirasat"],
    jurusan: ["dirasat_lughah"],
    tingkat: ["3", "4", "pasca"],
    description: "Filologi Arab — isytiqaq, taraduf, addhad, perkembangan makna kata, hubungan antar lahjat. Ilmu tentang karakter khas bahasa Arab.",
    descriptionArabic: "علم فقه اللغة العربية",
    kitabUtama: [
      { nama: "Fiqhul Lughah wa Sirrul 'Arabiyyah", arabic: "فقه اللغة وسر العربية", penulis: "Ats-Tsa'alibi" },
      { nama: "Al-Khasha'ish",                       arabic: "الخصائص",               penulis: "Ibnu Jinni" },
    ],
    recommendedAI: [
      { tool: "claude",      rank: 1, strength: "Analisis isytiqaq, perkembangan makna, dan perbandingan lahjat", why: "Fiqh Lughah butuh kemampuan analisis linguistik historis. Claude kuat dalam melacak perkembangan kata dan makna lintas waktu." },
      { tool: "perplexity",  rank: 2, strength: "Verifikasi etimologi kata Arab dari berbagai sumber",            why: "Perplexity membantu verifikasi klaim etimologis dengan referensi ke kamus dan studi linguistik." },
    ],
    tutorial: {
      overview: "Fiqh Lughah adalah linguistik historis bahasa Arab — pertanyaannya: bagaimana bahasa Arab bekerja dan berkembang?",
      steps: [
        { title: "Pahami isytiqaq dulu",              body: "Isytiqaq adalah derivasi kata dari akar. Ada isytiqaq shaghir (turunan langsung), kabir (kata dari akar yang sama dengan perubahan urutan huruf), dan akbar." },
        { title: "Pelajari fenomena taraduf dan addhad", body: "Taraduf = sinonim dalam bahasa Arab. Addhad = kata yang bermakna berlawanan. Keduanya adalah keunikan bahasa Arab." },
        { title: "Pahami perkembangan makna",         body: "Makna kata bisa menyempit, meluas, berpindah, atau melemah/menguat seiring waktu. Ini penting untuk memahami makna kata dalam teks klasik." },
        { title: "Hubungkan dengan lahjat Arab",      body: "Lahjat (dialek) Arab berpengaruh pada kosakata. Memahami ini membantu memahami variasi dalam teks-teks klasik." },
      ],
    },
    prompts: {
      pahami: [
        {
          title: "Peta Besar Fiqh Al-Lughah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri kerangka utuh fiqh al-lughah:
1. Definisi fiqh al-lughah + bedanya dengan 'ilm al-lughah (linguistik) & nahwu.
2. Topik utama: asal bahasa, fashilah bahasa Arab, isytiqaq, ta'rib, taraduf-isytirak-tadhad, dilalah.
3. Outline bercabang.
4. Kenapa penting untuk memahami kekayaan bahasa Arab.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Isytiqaq (Derivasi Kata)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan isytiqaq:
1. Definisi & jenisnya (shaghir, kabir, akbar, kubbar).
2. Bagaimana kata-kata Arab terhubung lewat akar yang sama.
3. Contoh tiap jenis isytiqaq (teks Arab berharakat).
4. Faedah isytiqaq untuk memahami & menebak makna.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Taraduf, Isytirak & Tadhad",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan fenomena makna kata:
1. Taraduf (sinonim) — definisi, contoh, perdebatan apakah benar-benar ada.
2. Isytirak lafzhi (homonim) — satu kata banyak makna.
3. Tadhad (antonim dalam satu kata) — contoh.
Sertakan teks Arab berharakat + contoh tiap fenomena.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Ta'rib & Dakhil (Kata Serapan)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan:
1. Ta'rib (arabisasi kata asing) & kaidahnya.
2. Beda mu'arrab vs dakhil.
3. Tanda kata bukan asli Arab ('alamat al-a'jamiyyah).
4. Sikap ulama bahasa terhadap kata serapan.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Istilah Fiqh Lughah Kunci",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal istilah (isytiqaq, taraduf, isytirak, tadhad, ta'rib, dilalah, dll):
1. Daftar (Arab berharakat + arti + contoh singkat).
2. Mnemonic.
3. Kelompokkan yang berkaitan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Hafal Jenis Isytiqaq & Cirinya",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Buatkan tabel hafalan jenis isytiqaq:
1. Kolom: jenis | definisi | contoh.
2. Tandai yang sering tertukar.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Fiqh Lughah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Topik yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah H+1, H+3, H+7, mingguan + cara uji. Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Drill Identifikasi Fenomena Makna",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 8 contoh kata/pasangan kata. Tugasku: tentukan fenomenanya (taraduf/isytirak/tadhad) + jelaskan.
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Lacak Akar & Isytiqaq",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 6 kata. Tugasku: lacak akar katanya & sebutkan kata-kata lain seakar (isytiqaq).
1. JANGAN beri jawaban dulu.
2. Koreksi + tunjukkan benang merah makna akar.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Soal Definisi & Fenomena",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal campuran (definisi, jenis isytiqaq, fenomena makna, ta'rib) dari [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Tahriri (Gaya Azhari)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian tulis Fiqh Lughah gaya Azhar untuk topik [SEBUTKAN]:
1. Tipe khas: 'arrif + matsil, ma al-farq baina..., istakhrij..., 'allil.
2. 5-6 soal bobot bervariasi.
3. JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih + skor & catatan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Imtihan Syafawi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan syafawi.

Berperanlah sebagai mumtahin syafawi:
1. Tanya definisi, fenomena makna, isytiqaq, ta'rib.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik, naikkan kesulitan.
4. Penilaian akhir + area lemah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari topik yang kupelajari ([SEBUTKAN]): topik tersering jadi soal, cara jawab lengkap (definisi + contoh), prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (di bawah). Rapikan jadi: konsep → definisi → contoh, lengkapi harakat, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
        {
          title: "Verifikasi Pemahaman Pasca-Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Setelah talaqqi topik [SEBUTKAN], aku jelaskan ulang + contoh (di bawah). Periksa keakuratan, koreksi, ajukan 3 pertanyaan penguji.

[METODE]

[LEVEL_BAHASA]

Penjelasanku: [TEMPEL]`,
        },
      ],
      eksplorasi: [
        {
          title: "Keistimewaan & Kekayaan Bahasa Arab",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan keistimewaan (khasha'is) bahasa Arab:
1. Sistem isytiqaq yang produktif.
2. Kekayaan kosakata & ketepatan makna.
3. Kaitan keistimewaan ini dengan i'jaz Al-Qur'an.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Ilmu Dilalah (Semantik) Mendalam",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan ilmu dilalah:
1. Jenis dilalah (mutabaqah, tadhammun, iltizam).
2. Perubahan makna kata sepanjang waktu (tathawwur dilali).
3. Faktor yang memengaruhi pergeseran makna.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Fiqh Lughah & Penjagaan Bahasa Arab",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan:
1. Tantangan bahasa Arab di era modern (kata asing, 'ammiyah/dialek).
2. Upaya lembaga bahasa (majma' al-lughah) menjaga & mengembangkan bahasa.
3. Peran thalib Azhar dalam menjaga kefasihan bahasa Arab.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  {
    id: "naqd-adabi",
    name: "Naqd Adabi",
    nameArabic: "النقد الأدبي",
    category: "lughawi",
    fakultas: ["lughah", "dirasat"],
    jurusan: ["dirasat_lughah"],
    tingkat: ["3", "4", "pasca"],
    description: "Kritik sastra Arab — manhaj naqd klasik dan modern, kriteria evaluasi karya sastra, analisis kritis bait/teks.",
    descriptionArabic: "علم نقد الأدب العربي",
    kitabUtama: [
      { nama: "An-Naqd Al-Adabi",     arabic: "النقد الأدبي",      penulis: "Ahmad Asy-Syayib" },
      { nama: "'Iyarusy Syi'r",       arabic: "عيار الشعر",        penulis: "Ibnu Thabathaba Al-'Alawi" },
      { nama: "Naqdusy Syi'r",        arabic: "نقد الشعر",         penulis: "Qudamah bin Ja'far" },
    ],
    recommendedAI: [
      { tool: "claude",   rank: 1, strength: "Kritik dan evaluasi karya sastra dengan standar naqd",  why: "Naqd adabi butuh kemampuan menganalisis teks dari berbagai sudut. Claude kuat dalam analisis sastra multi-aspek." },
      { tool: "chatgpt",  rank: 2, strength: "Diskusi manhaj naqd dan komparasi pendekatan",          why: "ChatGPT baik untuk mendiskusikan perbedaan manhaj naqd dan argumen masing-masing pendekatan secara dialogis." },
    ],
    tutorial: {
      overview: "Naqd Adabi adalah tentang menilai kualitas sastra dengan standar yang terukur.",
      steps: [
        { title: "Pahami kriteria naqd klasik dulu",       body: "Naqd klasik (Qudamah, Ibnu Thabathaba) menggunakan kriteria: keindahan lafal, kejelasan makna, kebenaran tasybih, dll." },
        { title: "Pelajari manhaj naqd modern",            body: "Naqd modern lebih beragam: naqd naffsi, ijtima'i, struktural. Pahami perbedaan pendekatannya." },
        { title: "Praktik kritik dengan contoh teks",      body: "Naqd tidak bisa hanya teori. Latih mengevaluasi bait/teks nyata menggunakan standar yang dipelajari." },
        { title: "Jaga objektivitas",                      body: "Naqd yang baik berdasarkan standar, bukan selera. Minta AI bantu mengidentifikasi standar yang kamu gunakan saat mengkritik." },
      ],
    },
    prompts: {
      pahami: [
        {
          title: "Peta Besar Naqd Adabi (Kritik Sastra)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri kerangka utuh ilmu naqd adabi:
1. Definisi kritik sastra + tujuannya (menilai & mengapresiasi karya).
2. Jenis: naqd qadim (klasik) vs naqd hadits (modern).
3. Manahij naqd (pendekatan): tarikhi, nafsi, ijtima'i, fanni/jamali.
4. Outline bercabang.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Kriteria Penilaian Karya Sastra",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan unsur yang dinilai dalam kritik sastra:
1. Unsur ma'nawi: fikrah (ide), 'athifah (emosi), khayal (imajinasi).
2. Unsur lafzhi: uslub (gaya), shuwar (citraan), musiqa (irama).
3. Wahdah 'udhwiyyah (kesatuan organik) karya.
4. Cara menilai keseimbangan unsur-unsur ini.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Naqd Klasik & Tokohnya",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan naqd adabi klasik:
1. Perkembangan kritik dari masa Jahili sampai 'Abbasi.
2. Tokoh & karya (mis. al-Jurjani & nazhariyyatun nazhm, Qudamah, al-Amidi) — sebut yang kamu yakin.
3. Konsep penting (mis. al-lafzh wal-ma'na, 'amud asy-syi'r).

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Manahij Naqd Modern",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan pendekatan kritik modern:
1. Manhaj tarikhi, nafsi (psikologis), ijtima'i (sosiologis), fanni (estetis/struktural).
2. Ciri & fokus tiap pendekatan.
3. Kelebihan & keterbatasan masing-masing.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Manahij Naqd & Cirinya",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal pendekatan kritik:
1. Tabel: manhaj | fokus | tokoh | kelebihan.
2. Mnemonic.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Hafal Istilah Naqd Kunci",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal istilah (wahdah 'udhwiyyah, 'amud asy-syi'r, shidq fanni, nazhm, dll):
1. Istilah (Arab berharakat + arti).
2. Mnemonic.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Naqd Adabi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Topik yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah H+1, H+3, H+7, mingguan + cara uji. Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Kritik Teks Sastra (Aku Coba, AI Koreksi)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Aku akan mengkritik teks sastra yang kutempel dengan kemampuanku.
1. Koreksi kritikku (unsur ma'nawi & lafzhi, kesatuan, penilaian).
2. Tunjukkan aspek yang terlewat.
3. Perkaya dengan istilah naqd yang tepat.

[METODE]

[LEVEL_BAHASA]

Teks + kritikku: [TEMPEL]`,
        },
        {
          title: "Drill Identifikasi Manhaj Naqd",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 6 contoh kritik/analisis. Tugasku: tebak pendekatan (manhaj) yang dipakai kritikus.
1. JANGAN beri jawaban dulu.
2. Koreksi + jelaskan penandanya.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Soal Definisi & Tokoh Naqd",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal campuran (definisi, manhaj, tokoh, konsep) dari [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Tahriri (Gaya Azhari)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian tulis Naqd Adabi gaya Azhar untuk topik [SEBUTKAN]:
1. Tipe khas: 'arrif, hallil an-nashsh naqdiyyan, qarin baina manhajain, udzkur ra'y...
2. 5-6 soal bobot bervariasi (sering ada teks untuk dikritik).
3. JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih + skor & catatan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Imtihan Syafawi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan syafawi.

Berperanlah sebagai mumtahin syafawi:
1. Tanya konsep naqd, atau minta aku kritik teks pendek secara lisan.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik, naikkan kesulitan.
4. Penilaian akhir + area lemah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari topik yang kupelajari ([SEBUTKAN]): topik tersering jadi soal (analisis teks & manhaj), cara jawab analitis, prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (di bawah). Rapikan jadi: konsep/manhaj → ciri → tokoh → contoh, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
        {
          title: "Verifikasi Pemahaman Pasca-Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Setelah talaqqi topik [SEBUTKAN], aku jelaskan ulang (di bawah). Periksa keakuratan, koreksi, ajukan 3 pertanyaan penguji.

[METODE]

[LEVEL_BAHASA]

Penjelasanku: [TEMPEL]`,
        },
      ],
      eksplorasi: [
        {
          title: "Hubungkan Naqd dengan Balaghah & Adab",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan keterkaitan:
1. Bagaimana naqd memakai balaghah sebagai alat menilai keindahan teks.
2. Bagaimana pengetahuan adab (sejarah sastra) memperkaya kritik.
3. Integrasi ketiganya dalam mengapresiasi karya.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Telaah Pertikaian Kritik Klasik",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan perdebatan kritik klasik:
1. Polemik al-lafzh vs al-ma'na (mana lebih utama).
2. Perdebatan seputar 'amud asy-syi'r & pembaruan.
3. Posisi tokoh-tokoh dalam perdebatan ini (sebut yang kamu yakin).

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kritik Sastra Modern & Aliran Barat",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan secara ilmiah:
1. Pengaruh teori kritik Barat (strukturalisme, dll) pada naqd Arab modern.
2. Bagaimana kritikus Arab menyikapinya (mengadopsi/menolak/menyaring).
3. Sikap kritis terhadap teori asing.
PENTING: jika tidak yakin fakta, katakan.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  /* ============================================================
     BATCH 4 — TARIKHI & DAKWAH (6 Maddah)
     ============================================================ */

  {
    id: "sirah-nabawiyah",
    name: "Sirah Nabawiyah",
    nameArabic: "السيرة النبوية",
    category: "tarikhi",
    fakultas: ["ushuluddin", "syariah", "dirasat", "dirasat-banin", "quran"],
    jurusan: [],
    tingkat: ["1", "2", "3", "4"],
    description: "Sejarah hidup Rasulullah ﷺ dari sebelum kelahiran sampai wafat, dengan analisis pelajaran dakwah, syariat, dan hikmah setiap peristiwa.",
    descriptionArabic: "سيرة النبي محمد ﷺ",
    kitabUtama: [
      { nama: "Ar-Rahiqul Makhtum",    arabic: "الرحيق المختوم",     penulis: "Shafiyurrahman Al-Mubarakfuri" },
      { nama: "Sirah Ibnu Hisyam",     arabic: "سيرة ابن هشام",     penulis: "Ibnu Hisyam" },
      { nama: "Fiqhus Sirah",          arabic: "فقه السيرة",         penulis: "Muhammad Said Al-Buthi" },
    ],
    recommendedAI: [
      { tool: "claude",      rank: 1, strength: "Analisis peristiwa, hikmah, dan istinbat pelajaran dakwah", why: "Sirah butuh AI yang bisa menganalisis konteks historis dan menarik pelajaran. Claude kuat dalam analisis sebab-akibat historis dan istinbat hikmah." },
      { tool: "notebooklm",  rank: 2, strength: "Navigasi kronologi dan detail peristiwa dari kitab",       why: "Upload Ar-Rahiqul Makhtum untuk navigasi detail kronologi peristiwa dengan akurat." },
    ],
    tutorial: {
      overview: "Sirah bukan sekedar sejarah — ia sumber hukum, akhlak, dan manhaj dakwah.",
      steps: [
        { title: "Pahami kronologi dasar dulu",          body: "Fase Makkah (13 tahun) dan fase Madinah (10 tahun) adalah kerangka. Pahami urutan peristiwa besar sebelum masuk detail." },
        { title: "Belajar dari sudut fiqhus sirah",      body: "Al-Buthi dalam Fiqhus Sirah mengajarkan cara mengambil pelajaran dari setiap peristiwa. Jangan baca sirah seperti novel sejarah biasa." },
        { title: "Hafal kronologi ghazwah",              body: "Ghazwah (peperangan) bersama Rasul ada 27. Minta AI bantu tabel kronologi dengan hikmah singkat masing-masing." },
        { title: "Hubungkan sirah dengan Al-Qur'an",     body: "Banyak ayat Al-Qur'an turun berkaitan dengan peristiwa sirah. Pahami asbabun nuzul akan lebih hidup dengan latar sirah." },
      ],
    },
    prompts: {
      pahami: [
        {
          title: "Peta Besar Sirah Nabawiyah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri kerangka utuh Sirah Nabawiyah:
1. Fase besar: sebelum bi'tsah → periode Makkah → hijrah → periode Madinah → wafat.
2. Peristiwa kunci tiap fase.
3. Timeline bercabang.
4. Tujuan belajar sirah: teladan & pelajaran (bukan sekadar cerita).

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Periode Makkah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan periode dakwah Makkah:
1. Permulaan wahyu & dakwah sirriyah lalu jahriyah.
2. Tahapan & tantangan (boikot, penyiksaan, hijrah Habasyah).
3. Tahun kesedihan & Isra' Mi'raj.
4. Pelajaran dakwah dari fase ini.
PENTING: sebut peristiwa yang kamu yakin; jika ragu, katakan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Periode Madinah & Pembangunan Negara",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan periode Madinah:
1. Hijrah & peristiwa di sekitarnya.
2. Pembangunan masyarakat: masjid, ukhuwah Muhajirin-Anshar, Piagam Madinah.
3. Fase peperangan besar (Badr, Uhud, Khandaq) & maknanya.
4. Fathu Makkah & haji wada'.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Cara Mengambil Pelajaran dari Sirah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan metode mengambil 'ibrah dari sirah:
1. Beda riwayat sirah dengan hadits (sisi keabsahan).
2. Cara menarik pelajaran dakwah, kepemimpinan, & akhlak dari peristiwa.
3. Sikap kritis terhadap riwayat sirah yang lemah.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Kronologi Peristiwa Penting",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal timeline sirah:
1. Urutan peristiwa kunci + tahun (Hijriah/sebelum hijrah).
2. Mnemonic untuk urutan peperangan & peristiwa besar.
PENTING: sebut yang kamu yakin; jika ragu, katakan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Tabel Peperangan (Ghazawat) untuk Dihafal",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Buatkan tabel hafalan ghazawat utama:
1. Kolom: perang | tahun | sebab | hasil | pelajaran.
2. Tandai yang sering jadi soal.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Sirah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Periode/peristiwa yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah H+1, H+3, H+7, mingguan + cara uji. Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Drill Kronologi & Peristiwa",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal campuran (urutan peristiwa, tokoh, sebab-akibat) dari periode [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Analisis Pelajaran (Ibrah)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 5 peristiwa sirah. Tugasku: ambil pelajaran (ibrah) dari tiap peristiwa.
1. JANGAN beri jawaban dulu.
2. Koreksi + tambahkan pelajaran yang terlewat.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Esai Sirah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 1 topik esai (mis. "strategi dakwah Nabi di Makkah"). Aku tulis esainya, lalu:
1. Koreksi keakuratan fakta & logika.
2. Tunjukkan poin penting yang terlewat.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Tahriri (Gaya Azhari)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian tulis Sirah gaya Azhar untuk periode [SEBUTKAN]:
1. Tipe khas: tahaddats 'an..., ma al-'ibar al-mustafadah min..., 'allil, udzkur ahdats...
2. 5-6 soal bobot bervariasi.
3. JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih + skor & catatan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Imtihan Syafawi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan syafawi.

Berperanlah sebagai mumtahin syafawi:
1. Tanya peristiwa, tokoh, sebab-akibat, pelajaran.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik, naikkan kesulitan.
4. Penilaian akhir + area lemah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari periode yang kupelajari ([SEBUTKAN]): topik tersering jadi soal, cara menulis jawaban (fakta + ibrah), prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (di bawah). Rapikan jadi timeline peristiwa → sebab → akibat → ibrah, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
        {
          title: "Verifikasi Pemahaman Pasca-Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Setelah talaqqi periode [SEBUTKAN], aku jelaskan ulang (di bawah). Periksa keakuratan fakta, koreksi, ajukan 3 pertanyaan penguji.

[METODE]

[LEVEL_BAHASA]

Penjelasanku: [TEMPEL]`,
        },
      ],
      eksplorasi: [
        {
          title: "Sirah sebagai Teladan Kepemimpinan",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk peristiwa/aspek [SEBUTKAN]:
1. Pelajaran kepemimpinan & manajemen dari Nabi ﷺ.
2. Bagaimana diterapkan dalam konteks organisasi/dakwah modern.
3. Keseimbangan ketegasan & kelembutan beliau.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Fiqh Sirah (Pelajaran Hukum & Dakwah)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk peristiwa [SEBUTKAN]:
1. Pelajaran fiqh/syar'i yang bisa diambil.
2. Kaitan peristiwa dengan turunnya ayat/hukum bila ada (sebut yang kamu yakin).
3. Relevansi untuk kehidupan muslim hari ini.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Akhlak & Kepribadian Nabi ﷺ",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan aspek akhlak Nabi ﷺ:
1. Sifat & akhlak mulia beliau (dengan contoh peristiwa).
2. Bagaimana akhlak beliau jadi teladan praktis.
3. Cara meneladani dalam kehidupan sehari-hari.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  {
    id: "tarikh-tasyri",
    name: "Tarikh Tasyri'",
    nameArabic: "تاريخ التشريع",
    category: "tarikhi",
    fakultas: ["syariah", "dirasat", "dirasat-banin", "ushuluddin"],
    jurusan: [],
    tingkat: ["2", "3", "4", "5", "pasca"],
    description: "Sejarah legislasi Islam — fase Nabi, Sahabat, Tabi'in, kodifikasi madzhab, dan fiqh modern. Memahami bagaimana hukum Islam berkembang.",
    descriptionArabic: "تاريخ التشريع الإسلامي عبر العصور",
    kitabUtama: [
      { nama: "Tarikhut Tasyri' Al-Islami",  arabic: "تاريخ التشريع الإسلامي", penulis: "Manna' Al-Qaththan" },
      { nama: "Tarikhul Fiqhil Islami",      arabic: "تاريخ الفقه الإسلامي",  penulis: "Muhammad Ali As-Sayis" },
    ],
    recommendedAI: [
      { tool: "claude",      rank: 1, strength: "Analisis fase-fase tasyri', perbandingan metode istinbat", why: "Tarikh tasyri' butuh AI yang bisa menjelaskan perkembangan historis dan membandingkan pendekatan di berbagai fase. Claude kuat dalam analisis historis." },
      { tool: "perplexity",  rank: 2, strength: "Verifikasi tanggal, tokoh, dan konteks historis",          why: "Perplexity membantu verifikasi detail historis dengan referensi ke sumber akademik." },
    ],
    tutorial: {
      overview: "Tarikh Tasyri' adalah sejarah bagaimana hukum Islam terbentuk dan berkembang.",
      steps: [
        { title: "Pahami 5 fase tasyri' secara urut",      body: "Fase Nabi → Sahabat → Tabi'in → Kodifikasi madzhab → Era kontemporer. Masing-masing punya ciri istinbat berbeda." },
        { title: "Pahami ciri istinbat tiap fase",         body: "Sahabat berijtihad lebih bebas karena faham konteks wahyu. Tabi'in mulai ada khilaf lebih banyak. Pahami kenapa." },
        { title: "Pelajari sejarah kodifikasi madzhab",    body: "Bagaimana dan mengapa 4 madzhab terbentuk? Ini penting untuk memahami struktur fiqh sampai hari ini." },
        { title: "Hubungkan dengan fiqh muqaran",         body: "Memahami sejarah madzhab membuat fiqh muqaran lebih bermakna — kamu tahu dari mana setiap pendapat berasal." },
      ],
    },
    prompts: {
      pahami: [
        {
          title: "Peta Besar Tarikh Tasyri'",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri kerangka utuh Tarikh Tasyri' (sejarah perundangan Islam):
1. Fase-fase besar: masa Nabi → Khulafa Rasyidin → sahabat → tabi'in → imam madzhab → taqlid → kodifikasi modern.
2. Ciri & perkembangan fiqh tiap fase.
3. Outline kronologis bercabang.
4. Kenapa penting memahami sejarah ini.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Tasyri' Masa Nabi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan tasyri' di masa Nabi ﷺ:
1. Dua periode: Makkah (penekanan akidah) vs Madinah (tasyri' amali).
2. Sumber hukum saat itu: wahyu (Qur'an) & sunnah.
3. Ciri tasyri' masa Nabi (tadarruj/bertahap, menjawab kebutuhan).
4. Contoh perkembangan hukum bertahap (mis. khamr).

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Tasyri' Masa Sahabat & Ijtihad",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan tasyri' masa Khulafa Rasyidin & sahabat:
1. Munculnya ijtihad jama'i & fardi.
2. Sumber yang berkembang: ijma', qiyas, mashlahah.
3. Contoh ijtihad sahabat yang masyhur (mis. ijtihad Umar).
4. Bibit perbedaan pendapat mulai muncul.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Masa Imam Madzhab & Kodifikasi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan masa keemasan fiqh & madzhab:
1. Munculnya madzhab fiqh (Hanafi, Maliki, Syafi'i, Hanbali) & faktor pendukungnya.
2. Pembukuan (tadwin) fiqh, hadits, & ushul.
3. Masa taqlid & kemunduran ijtihad.
4. Kodifikasi modern (mis. Majallah al-Ahkam al-'Adliyyah).

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Kronologi Fase Tasyri'",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal urutan fase tarikh tasyri':
1. Timeline berurutan tiap fase + ciri singkatnya.
2. Mnemonic untuk mengingat urutan.
3. Tokoh kunci tiap fase.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Tabel Ciri Tiap Fase untuk Dihafal",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Buatkan tabel hafalan:
1. Kolom: fase | rentang waktu | sumber hukum | ciri | tokoh.
2. Tandai fase yang sering jadi soal.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Tarikh Tasyri'",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Fase yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah H+1, H+3, H+7, mingguan + cara uji (sebut ciri & tokoh tiap fase). Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Drill Soal Kronologi & Ciri Fase",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal campuran (urutan fase, ciri, tokoh, peristiwa) dari [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Hubungkan Peristiwa dengan Fase",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 8 peristiwa/fenomena tasyri'. Tugasku: tentukan terjadi di fase mana & maknanya.
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Esai Analisis Sejarah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 1 topik esai (mis. "sebab berkembangnya madzhab fiqh"). Aku tulis esainya, lalu:
1. Koreksi keakuratan fakta sejarah & logika argumen.
2. Tunjukkan poin penting yang terlewat.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Tahriri (Gaya Azhari)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian tulis Tarikh Tasyri' gaya Azhar untuk fase [SEBUTKAN]:
1. Tipe khas: tahaddats 'an..., ma khasha'is at-tasyri' fi..., 'allil, qarin baina marhalatain.
2. 5-6 soal bobot bervariasi.
3. JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih + skor & catatan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Imtihan Syafawi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan syafawi.

Berperanlah sebagai mumtahin syafawi:
1. Tanya ciri fase, tokoh, peristiwa, sebab perkembangan.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik, naikkan kesulitan.
4. Penilaian akhir + area lemah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari fase yang kupelajari ([SEBUTKAN]): topik yang sering jadi soal, cara menulis jawaban analitis (bukan sekadar hafalan tanggal), prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (di bawah). Rapikan jadi timeline fase → ciri → tokoh, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
        {
          title: "Verifikasi Pemahaman Pasca-Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Setelah talaqqi fase [SEBUTKAN], aku jelaskan ulang (di bawah). Periksa keakuratan fakta sejarah, koreksi, ajukan 3 pertanyaan penguji.

[METODE]

[LEVEL_BAHASA]

Penjelasanku: [TEMPEL]`,
        },
      ],
      eksplorasi: [
        {
          title: "Pelajaran dari Sejarah untuk Fiqh Kontemporer",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Tunjukkan relevansi tarikh tasyri' untuk masa kini:
1. Pelajaran dari cara ulama dulu merespons perubahan zaman.
2. Bagaimana sejarah ijtihad menginspirasi ijtihad kontemporer.
3. Bahaya memahami fiqh tanpa konteks sejarahnya.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Telaah Tokoh Tasyri' Mendalam",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk tokoh [SEBUTKAN, mis. Imam Syafi'i, Umar bin Khattab]:
1. Kontribusinya dalam perkembangan tasyri'.
2. Metode/manhaj khasnya.
3. Karya & warisan pemikirannya.
PENTING: kalau tidak yakin fakta, katakan; jangan mengarang.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Sebab Kemajuan & Kemunduran Ijtihad",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Analisis:
1. Faktor yang membuat fiqh berkembang pesat di masa keemasan.
2. Sebab munculnya masa taqlid & "tertutupnya pintu ijtihad".
3. Upaya kebangkitan ijtihad di era modern.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  {
    id: "tarikh-islam",
    name: "Tarikh Islam",
    nameArabic: "التاريخ الإسلامي",
    category: "tarikhi",
    fakultas: ["lughah", "dirasat", "dirasat-banin", "ushuluddin"],
    jurusan: [],
    tingkat: ["1", "2", "3", "4", "pasca"],
    description: "Sejarah Islam dari Khulafa Ar-Rasyidun sampai Daulah Utsmaniyyah dan masa modern. Analisis sebab kemajuan dan kemunduran.",
    descriptionArabic: "تاريخ الإسلام عبر الدول والعصور",
    kitabUtama: [
      { nama: "Al-Bidayah wan Nihayah",      arabic: "البداية والنهاية",          penulis: "Ibnu Katsir" },
      { nama: "Tarikhul Umam wal Muluk",     arabic: "تاريخ الأمم والملوك",      penulis: "Imam Ath-Thabari" },
      { nama: "Tarikhul Islam",              arabic: "تاريخ الإسلام",            penulis: "Imam Adz-Dzahabi" },
    ],
    recommendedAI: [
      { tool: "claude",      rank: 1, strength: "Analisis sebab-akibat historis dan evaluasi daulah",  why: "Tarikh Islam butuh kemampuan menganalisis faktor-faktor kompleks yang mempengaruhi kemajuan dan kemunduran daulah. Claude kuat dalam analisis historis multi-faktor." },
      { tool: "perplexity",  rank: 2, strength: "Verifikasi tanggal, nama tokoh, dan peristiwa sejarah", why: "Perplexity membantu verifikasi detail historis dengan referensi ke sumber akademik." },
    ],
    tutorial: {
      overview: "Pelajari tarikh Islam bukan sebagai hafalan nama-tanggal, tapi sebagai pelajaran sebab-akibat.",
      steps: [
        { title: "Pahami kerangka daulah secara urut",  body: "Khulafa → Umawi → Abbasi → Fatimiyyah/Saljuq → Mamluk → Utsmani → Modern. Pahami urutan ini sebagai tulang punggung." },
        { title: "Analisis setiap daulah secara mendalam", body: "Untuk setiap daulah: kapan berdiri, puncak kejayaan, tokoh penting, dan sebab kemunduran." },
        { title: "Cari pola sebab-akibat",              body: "Tarikh Islam punya pola berulang: masuknya 'ashabiyyah baru, kemunduran moral, tekanan eksternal. Identifikasi pola ini." },
        { title: "Hubungkan dengan kondisi hari ini",   body: "Tarikh bukan hafalan mati. Tanya: apa yang bisa dipelajari dari kemajuan/kemunduran daulah X untuk umat hari ini?" },
      ],
    },
    prompts: {
      pahami: [
        {
          title: "Peta Besar Sejarah Peradaban Islam",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri kerangka utuh tarikh Islam:
1. Periode besar: Sirah Nabi → Khulafa Rasyidin → Umayyah → Abbasiyah → masa kekhalifahan lain (Andalus, Fathimiyah, Utsmaniyah) → modern.
2. Ciri & pencapaian tiap periode.
3. Timeline kronologis bercabang.
4. Kenapa belajar sejarah penting (i'tibar/pelajaran).

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Masa Khulafa Rasyidin",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan masa Khulafa Rasyidin:
1. Empat khalifah & ciri kepemimpinan masing-masing.
2. Pencapaian utama (futuhat, pengumpulan mushaf, sistem administrasi).
3. Tantangan & fitnah yang muncul.
4. Pelajaran kepemimpinan dari masa ini.
PENTING: sebut fakta yang kamu yakin; jika ragu, katakan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Dinasti Umayyah & Abbasiyah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan dua dinasti besar:
1. Umayyah: ciri, perluasan wilayah, pencapaian & kritik.
2. Abbasiyah: masa keemasan ilmu, Baitul Hikmah, penerjemahan.
3. Faktor kemajuan & kemunduran masing-masing.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Peradaban & Kontribusi Ilmu Islam",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan kontribusi peradaban Islam:
1. Bidang ilmu yang berkembang (kedokteran, astronomi, matematika, filsafat, dll).
2. Tokoh ilmuwan muslim & karyanya (sebut yang kamu yakin; jika ragu, katakan).
3. Pengaruhnya terhadap peradaban dunia.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Kronologi & Tokoh Tiap Periode",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal timeline tarikh Islam:
1. Urutan periode + rentang waktu + ciri singkat.
2. Mnemonic untuk urutan dinasti.
3. Tokoh kunci tiap periode.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Tabel Pencapaian Tiap Periode",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Buatkan tabel hafalan:
1. Kolom: periode | pemimpin penting | pencapaian | tantangan.
2. Tandai yang sering jadi soal.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Tarikh Islam",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Periode yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah H+1, H+3, H+7, mingguan + cara uji. Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Drill Soal Kronologi & Peristiwa",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal campuran (urutan peristiwa, tokoh, sebab-akibat) dari periode [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Analisis Sebab-Akibat",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 5 peristiwa sejarah. Tugasku: jelaskan sebab & akibatnya.
1. JANGAN beri jawaban dulu.
2. Koreksi analisisku + tambahkan faktor yang terlewat.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Esai Sejarah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 1 topik esai (mis. "faktor kemajuan ilmu di masa Abbasiyah"). Aku tulis esainya, lalu:
1. Koreksi keakuratan fakta & logika argumen.
2. Tunjukkan poin penting yang terlewat.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Tahriri (Gaya Azhari)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian tulis Tarikh Islam gaya Azhar untuk periode [SEBUTKAN]:
1. Tipe khas: tahaddats 'an..., ma asbab..., 'allil, qarin baina 'ashrain.
2. 5-6 soal bobot bervariasi.
3. JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih + skor & catatan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Imtihan Syafawi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan syafawi.

Berperanlah sebagai mumtahin syafawi:
1. Tanya peristiwa, tokoh, sebab-akibat, pencapaian.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik, naikkan kesulitan.
4. Penilaian akhir + area lemah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari periode yang kupelajari ([SEBUTKAN]): topik yang sering jadi soal, cara menulis jawaban analitis (bukan sekadar hafal tanggal), prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (di bawah). Rapikan jadi timeline periode → tokoh → peristiwa → pelajaran, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
        {
          title: "Verifikasi Pemahaman Pasca-Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Setelah talaqqi periode [SEBUTKAN], aku jelaskan ulang (di bawah). Periksa keakuratan fakta sejarah, koreksi, ajukan 3 pertanyaan penguji.

[METODE]

[LEVEL_BAHASA]

Penjelasanku: [TEMPEL]`,
        },
      ],
      eksplorasi: [
        {
          title: "Pelajaran (I'tibar) dari Sejarah Islam",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk peristiwa/periode [SEBUTKAN]:
1. Pelajaran (i'tibar) yang bisa diambil.
2. Relevansinya dengan kondisi umat masa kini.
3. Bagaimana sejarah membentuk identitas umat.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Telaah Tokoh Sejarah Mendalam",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk tokoh [SEBUTKAN, mis. Umar bin Abdul Aziz, Shalahuddin, Harun ar-Rasyid]:
1. Peran & kontribusinya.
2. Kebijakan/pencapaian penting.
3. Pelajaran kepemimpinan darinya.
PENTING: kalau tidak yakin fakta, katakan; jangan mengarang.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Sebab Kemajuan & Kemunduran Peradaban",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Analisis untuk periode [SEBUTKAN]:
1. Faktor yang membuat peradaban Islam maju.
2. Faktor yang menyebabkan kemundurannya.
3. Pelajaran untuk kebangkitan umat.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  {
    id: "hadharah",
    name: "Hadharah Islamiyyah",
    nameArabic: "الحضارة الإسلامية",
    category: "tarikhi",
    fakultas: ["lughah", "dirasat"],
    jurusan: [],
    tingkat: ["3", "4", "pasca"],
    description: "Peradaban Islam — institusi keilmuan, seni, arsitektur, sains, dan kontribusi ke peradaban global. Kajian tentang warisan intelektual dan budaya Islam.",
    descriptionArabic: "الحضارة الإسلامية في مختلف جوانبها",
    kitabUtama: [
      { nama: "Madzahirul Hadharatis Islamiyyah", arabic: "مظاهر الحضارة الإسلامية", penulis: "Ahmad Shalabi" },
    ],
    recommendedAI: [
      { tool: "claude",      rank: 1, strength: "Analisis mendalam aspek-aspek peradaban Islam",     why: "Hadharah mencakup banyak aspek (ilmu, seni, institusi). Claude kuat dalam sintesis informasi multi-disiplin." },
      { tool: "perplexity",  rank: 2, strength: "Verifikasi kontribusi ilmiah dan referensi modern", why: "Perplexity membantu verifikasi klaim tentang kontribusi ilmuwan Muslim dengan referensi ke sumber akademik dan sejarah sains." },
    ],
    tutorial: {
      overview: "Hadharah Islam bukan nostalgia — ini memahami warisan yang masih relevan.",
      steps: [
        { title: "Pahami dimensi-dimensi peradaban",      body: "Hadharah mencakup: ilmu pengetahuan, institusi sosial, seni dan arsitektur, hukum, ekonomi. Pelajari tiap dimensi." },
        { title: "Fokus pada institusi keilmuan",         body: "Bayt Al-Hikmah, madrasah, ribath, dan observatorium adalah institusi kunci. Pahami fungsi dan kontribusinya." },
        { title: "Kenali ilmuwan Muslim besar",           body: "Al-Kindi, Al-Farabi, Ibnu Sina, Al-Biruni, Al-Khwarizmi, Ibnu Rusyd — kenali kontribusi spesifik masing-masing." },
        { title: "Hubungkan dengan masa kini",            body: "Peradaban Islam punya kontribusi langsung ke Renaisans Eropa. Memahami ini memberikan perspektif tentang sumbangan Islam untuk dunia." },
      ],
    },
    prompts: {
      pahami: [
        {
          title: "Peta Besar Hadharah Islamiyyah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri kerangka utuh Hadharah Islamiyyah (peradaban Islam):
1. Definisi hadharah & madaniyyah + bedanya.
2. Bidang peradaban: ilmu, seni, arsitektur, ekonomi, sistem sosial-politik.
3. Outline bercabang.
4. Beda kajian hadharah dengan tarikh (sejarah peristiwa).

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Kontribusi Ilmu Peradaban Islam",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan kemajuan ilmu di peradaban Islam:
1. Bidang yang berkembang (kedokteran, matematika, astronomi, kimia, geografi).
2. Tokoh & karya (sebut yang kamu yakin; jika ragu, katakan).
3. Institusi ilmu (Baitul Hikmah, perpustakaan, madrasah).
4. Pengaruhnya pada peradaban dunia.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Sistem Sosial & Pemerintahan",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan sistem dalam peradaban Islam:
1. Sistem pemerintahan (khilafah, wizarah, dawawin).
2. Sistem ekonomi (baitul mal, zakat, perdagangan).
3. Sistem sosial (toleransi, ahlu dzimmah, kota multikultural).

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Seni & Arsitektur Islam",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan warisan seni Islam:
1. Arsitektur (masjid, istana, ciri khas seperti kubah, mihrab, muqarnas).
2. Seni khat (kaligrafi) & ornamen (arabesque).
3. Filosofi seni Islam (menghindari penggambaran makhluk bernyawa di tempat tertentu).

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Tokoh & Kontribusi Peradaban",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal kontribusi peradaban:
1. Tabel: bidang | tokoh | kontribusi/karya.
2. Mnemonic.
PENTING: sebut yang kamu yakin; jika ragu, katakan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Hafal Istilah & Institusi Peradaban",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal istilah (baitul hikmah, diwan, wizarah, baitul mal, dll):
1. Daftar (Arab berharakat + arti + fungsi).
2. Mnemonic.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Hadharah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Topik yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah H+1, H+3, H+7, mingguan + cara uji. Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Drill Soal Bidang & Tokoh Peradaban",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal campuran (bidang ilmu, tokoh, institusi, kontribusi) dari [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Analisis Faktor Kemajuan",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 5 fenomena peradaban. Tugasku: jelaskan faktor di baliknya & dampaknya.
1. JANGAN beri jawaban dulu.
2. Koreksi analisisku.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Esai Peradaban",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 1 topik esai (mis. "kontribusi peradaban Islam pada kebangkitan Eropa"). Aku tulis esainya, lalu koreksi fakta & argumen + tunjukkan poin yang terlewat.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Tahriri (Gaya Azhari)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian tulis Hadharah gaya Azhar untuk topik [SEBUTKAN]:
1. Tipe khas: tahaddats 'an ishamat..., ma 'awamil..., udzkur, 'allil.
2. 5-6 soal bobot bervariasi.
3. JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih + skor & catatan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Imtihan Syafawi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan syafawi.

Berperanlah sebagai mumtahin syafawi:
1. Tanya kontribusi, tokoh, institusi, faktor kemajuan/kemunduran.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik, naikkan kesulitan.
4. Penilaian akhir + area lemah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari topik yang kupelajari ([SEBUTKAN]): topik tersering jadi soal, cara menulis jawaban analitis, prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (di bawah). Rapikan jadi: bidang → tokoh → kontribusi, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
        {
          title: "Verifikasi Pemahaman Pasca-Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Setelah talaqqi topik [SEBUTKAN], aku jelaskan ulang (di bawah). Periksa keakuratan fakta, koreksi, ajukan 3 pertanyaan penguji.

[METODE]

[LEVEL_BAHASA]

Penjelasanku: [TEMPEL]`,
        },
      ],
      eksplorasi: [
        {
          title: "Pelajaran Peradaban untuk Kebangkitan Umat",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Analisis:
1. Faktor yang membuat peradaban Islam mencapai puncak.
2. Sebab kemunduran peradaban.
3. Pelajaran untuk kebangkitan umat masa kini.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Dialog Peradaban Islam & Barat",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan secara berimbang:
1. Bagaimana peradaban Islam mentransfer ilmu ke Eropa.
2. Interaksi & saling pengaruh antar peradaban.
3. Sikap menghadapi klaim sepihak tentang sumber kemajuan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Warisan Peradaban yang Masih Hidup",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk bidang [SEBUTKAN, mis. ilmu, arsitektur, tata kota]:
1. Warisan peradaban Islam yang masih dipakai/terlihat hari ini.
2. Bagaimana warisan itu berkembang.
3. Kebanggaan & tanggung jawab umat terhadap warisan ini.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  {
    id: "dakwah",
    name: "Dakwah & I'lam",
    nameArabic: "الدعوة والإعلام",
    category: "tarikhi",
    fakultas: ["dirasat", "ushuluddin"],
    jurusan: [],
    tingkat: ["2", "3", "4", "pasca"],
    description: "Ilmu dan skill dakwah — ushul & manhaj dakwah, komunikasi Islam, media dakwah modern, dakwah para rasul sebagai model.",
    descriptionArabic: "علم الدعوة وأصولها",
    kitabUtama: [
      { nama: "Ushulud Da'wah",   arabic: "أصول الدعوة",    penulis: "Abdul Karim Zaidan" },
      { nama: "Fiqhud Da'wah",    arabic: "فقه الدعوة",     penulis: "Mushthafa Masyhur" },
    ],
    recommendedAI: [
      { tool: "chatgpt",  rank: 1, strength: "Susun materi dakwah, konten kreatif, strategi komunikasi",  why: "Dakwah butuh skill komunikasi dan konten. ChatGPT bagus untuk membantu draft materi khutbah, ceramah, atau konten dakwah digital." },
      { tool: "claude",   rank: 2, strength: "Analisis manhaj dakwah dan istinbat dari sirah",             why: "Claude kuat dalam menganalisis manhaj dakwah para nabi dan rasul dari teks Al-Qur'an dan sirah." },
    ],
    tutorial: {
      overview: "Dakwah adalah ilmu dan seni — pelajari prinsipnya, lalu latih penyampaiannya.",
      steps: [
        { title: "Pahami ushul dakwah dulu",           body: "Sebelum bicara teknik, pahami fondasi: niat, target sasaran, pesan yang disampaikan, dan sarana yang tepat." },
        { title: "Pelajari manhaj dakwah para nabi",   body: "Al-Qur'an menceritakan manhaj dakwah Nabi Ibrahim, Musa, Isa, dan Nabi Muhammad ﷺ. Pelajari pola umumnya." },
        { title: "Kenali karakteristik sasaran",       body: "Dakwah yang efektif dimulai dari memahami siapa yang diajak. Apa kebutuhan, pertanyaan, dan tantangan mereka?" },
        { title: "Adaptasi ke media modern",           body: "Prinsip dakwah klasik berlaku untuk media apapun. Minta AI bantu adaptasi prinsip dakwah ke platform digital." },
      ],
    },
    prompts: {
      pahami: [
        {
          title: "Peta Besar Ilmu Dakwah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri kerangka utuh ilmu dakwah:
1. Definisi dakwah + rukunnya (da'i, mad'u, maudhu', uslub).
2. Landasan dakwah dari Qur'an-Sunnah.
3. Cakupan modern: dakwah & i'lam (media).
4. Outline bercabang.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Metode & Uslub Dakwah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan metode dakwah:
1. Tiga uslub dalam ayat "ud'u ila sabili rabbika bil-hikmah..." (hikmah, mau'izhah hasanah, jidal ahsan).
2. Kapan tiap uslub dipakai sesuai kondisi mad'u.
3. Contoh penerapan tiap metode.
PENTING: sebut dalil dengan benar; jika ragu, katakan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Karakteristik Da'i & Mad'u",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan:
1. Sifat & bekal yang harus dimiliki da'i (ilmu, akhlak, keteladanan).
2. Cara memahami & mengklasifikasi mad'u (sesuai latar, tingkat ilmu, kondisi).
3. Menyesuaikan pesan dengan sasaran dakwah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Dakwah di Era Media (I'lam)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan dakwah & i'lam modern:
1. Peran media (medsos, video, tulisan) dalam dakwah kontemporer.
2. Prinsip menjaga pesan tetap autentik di media.
3. Tantangan & adab dakwah digital.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Rukun & Metode Dakwah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal:
1. Rukun dakwah + tiga uslub (Arab berharakat + arti).
2. Mnemonic.
3. Dalil ringkas tiap metode.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Tabel Sifat Da'i & Klasifikasi Mad'u",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Buatkan tabel hafalan: sifat-sifat da'i + jenis-jenis mad'u + pendekatan yang cocok. Tandai yang sering jadi soal.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Dakwah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Topik yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah H+1, H+3, H+7, mingguan + cara uji. Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Rancang Strategi Dakwah (Tathbiq)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 4 skenario mad'u (mis. remaja, non-muslim, awam). Tugasku: rancang pendekatan dakwah yang tepat.
1. JANGAN beri jawaban dulu.
2. Koreksi rancanganku + sarankan perbaikan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Soal Definisi & Metode",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal campuran (definisi, rukun, metode, dalil) dari [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Susun Materi Ceramah Singkat",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Aku akan menyusun kerangka ceramah tentang [SEBUTKAN TEMA].
1. Aku tulis kerangkanya.
2. Koreksi struktur & isinya (pembuka, isi berdalil, penutup).
3. Sarankan cara penyampaian yang mengena.
PENTING: pastikan dalil yang kupakai benar; koreksi jika keliru.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Tahriri (Gaya Azhari)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian tulis Dakwah gaya Azhar untuk topik [SEBUTKAN]:
1. Tipe khas: 'arrif, udzkur asalib ad-da'wah, bayyin shifat ad-da'iyah, ma hukm...
2. 5-6 soal bobot bervariasi.
3. JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih + skor & catatan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Imtihan Syafawi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan syafawi.

Berperanlah sebagai mumtahin syafawi:
1. Tanya metode, rukun, sifat da'i, atau minta aku rancang dakwah untuk kasus.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik, naikkan kesulitan.
4. Penilaian akhir + area lemah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari topik yang kupelajari ([SEBUTKAN]): topik tersering jadi soal, cara jawab lengkap (teori + dalil + contoh), prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (di bawah). Rapikan jadi: konsep → metode → contoh, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
        {
          title: "Verifikasi Pemahaman Pasca-Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Setelah talaqqi topik [SEBUTKAN], aku jelaskan ulang (di bawah). Periksa keakuratan, koreksi, ajukan 3 pertanyaan penguji.

[METODE]

[LEVEL_BAHASA]

Penjelasanku: [TEMPEL]`,
        },
      ],
      eksplorasi: [
        {
          title: "Dakwah Nabi & Para Sahabat sebagai Teladan",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk fase/peristiwa [SEBUTKAN]:
1. Metode dakwah Nabi ﷺ yang bisa diteladani.
2. Hikmah strategi dakwah beliau.
3. Penerapan dalam dakwah kontemporer.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Tantangan Dakwah Kontemporer",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk tantangan [SEBUTKAN, mis. sekularisme, ekstremisme, syubhat di medsos]:
1. Bagaimana dakwah yang bijak menanggapinya.
2. Pendekatan yang sesuai sasaran.
3. Menjaga wasathiyah (moderasi) dalam dakwah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Dakwah Digital yang Efektif",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu aku memahami dakwah lewat media:
1. Prinsip konten dakwah yang efektif & autentik.
2. Adab & etika dakwah digital.
3. Menghindari kesalahan umum (sensasi, dalil lemah, provokasi).

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  {
    id: "adyan",
    name: "Adyan (Perbandingan Agama)",
    nameArabic: "الأديان والمذاهب",
    category: "tarikhi",
    fakultas: ["ushuluddin", "dirasat"],
    jurusan: [],
    tingkat: ["3", "4", "pasca"],
    description: "Studi perbandingan agama dari perspektif Islam — Yahudi, Nasrani, Hindu, Buddha. Akademis, objektif, dan dengan adab dialog yang benar.",
    descriptionArabic: "دراسة مقارنة الأديان",
    kitabUtama: [
      { nama: "Izharul Haq",         arabic: "إظهار الحق",        penulis: "Rahmatullah Al-Hindi" },
      { nama: "Al-Jawabus Shahih",   arabic: "الجواب الصحيح",    penulis: "Ibnu Taimiyyah" },
    ],
    recommendedAI: [
      { tool: "claude",      rank: 1, strength: "Analisis komparatif teologis dan adab dialog antaragama", why: "Adyan butuh kemampuan memahami perspektif agama lain dengan akurat dan akademis. Claude kuat dalam presentasi multi-perspektif yang seimbang." },
      { tool: "perplexity",  rank: 2, strength: "Verifikasi data tentang ajaran agama dari sumber terpercaya", why: "Perplexity membantu memverifikasi klaim tentang ajaran agama tertentu dengan referensi ke sumber akademik." },
    ],
    tutorial: {
      overview: "Adyan dipelajari untuk memahami, bukan untuk menyerang. Objektivitas dan adab adalah kunci.",
      steps: [
        { title: "Pahami dari sumber primer agama itu sendiri", body: "Belajar tentang agama lain dari sumber mereka sendiri (Taurat, Injil, Veda), bukan hanya dari kritik Muslim. Ini membangun pemahaman yang adil." },
        { title: "Gunakan pendekatan akademis",                 body: "Pisahkan antara: (1) apa yang diyakini penganut agama itu, (2) apa yang kita yakini tentang agama itu, (3) apa yang kata akademisi." },
        { title: "Adab dalam dialog adalah fardu",             body: "Dialog antaragama wajib dengan hikmah, jujur, dan hormat. Al-Qur'an sendiri memerintahkan mujadalah billatii hiya ahsan." },
        { title: "Bedakan antara polemik dan akademik",        body: "Polemik (menyerang) berbeda dari kajian akademis. Di Azhar, kita belajar untuk memahami, bukan untuk debat yang tidak produktif." },
      ],
    },
    prompts: {
      pahami: [
        {
          title: "Peta Besar Ilmu Muqaranat al-Adyan",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri kerangka utuh ilmu perbandingan agama:
1. Definisi & tujuan (memahami agama lain secara objektif + meneguhkan Islam, bukan sinkretisme).
2. Klasifikasi agama: samawi (Yahudi, Nasrani) & wadh'i (agama buatan/filosofis).
3. Metode kajian yang ilmiah & adil.
4. Outline bercabang + adab mengkaji agama lain.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Agama Yahudi (Pokok Ajaran)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan agama Yahudi secara objektif & ilmiah:
1. Pokok keyakinan & kitab sucinya.
2. Sejarah singkat & sekte-sektenya.
3. Pandangan Islam terhadap Yahudi (sebagai ahli kitab) + poin penyimpangan menurut Al-Qur'an.
PENTING: paparkan akurat & adil; sebut dalil Qur'an dengan benar (jangan mengarang).

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Agama Nasrani (Pokok Ajaran)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan agama Nasrani secara objektif & ilmiah:
1. Pokok keyakinan (mis. trinitas, penyaliban) & kitab sucinya.
2. Sekte/denominasi utama.
3. Pandangan Islam: poin kesamaan & poin perbedaan mendasar (tauhid vs trinitas) menurut Al-Qur'an.
PENTING: paparkan akurat & adil; sebut dalil dengan benar.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Metode Dialog & Hiwar Antaragama",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan adab & metode hiwar (dialog) antaragama dalam Islam:
1. Landasan Qur'ani untuk dialog (mis. "wa jadilhum billati hiya ahsan").
2. Adab: ilmiah, hormat, fokus argumen bukan menghina.
3. Tujuan dialog: menyampaikan kebenaran dengan hikmah, bukan menang-menangan.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Klasifikasi & Pokok Tiap Agama",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal:
1. Tabel: agama | klasifikasi | kitab | pokok keyakinan | poin perbedaan dgn Islam.
2. Mnemonic.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Hafal Istilah Kunci Muqaranat Adyan",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal istilah (samawi, wadh'i, ahli kitab, tahrif, hiwar, dll):
1. Daftar (Arab berharakat + arti).
2. Mnemonic.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Adyan",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Topik yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah H+1, H+3, H+7, mingguan + cara uji. Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Drill Bandingkan Pokok Ajaran",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 6 soal perbandingan (mis. konsep tuhan, kenabian, kitab dalam Islam vs agama lain). Tugasku: jelaskan persamaan & perbedaannya.
1. JANGAN beri jawaban dulu.
2. Koreksi + sempurnakan dengan dalil yang benar.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Menjawab Syubhat secara Ilmiah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 4 syubhat/argumen terhadap Islam (yang sering muncul dalam dialog). Tugasku: jawab secara ilmiah & beradab.
1. JANGAN beri jawaban dulu.
2. Koreksi jawabanku + sempurnakan dengan hujjah yang kuat.
PENTING: jawaban harus ilmiah, hormat, tanpa menghina agama lain.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Soal Definisi & Klasifikasi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal campuran (definisi, klasifikasi agama, pokok ajaran, perbedaan) dari [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Tahriri (Gaya Azhari)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian tulis Adyan gaya Azhar untuk topik [SEBUTKAN]:
1. Tipe khas: 'arrif, qarin baina..., bayyin mauqif al-islam min..., raddu 'ala syubhah.
2. 5-6 soal bobot bervariasi.
3. JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih + skor & catatan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Simulasi Imtihan Syafawi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan syafawi.

Berperanlah sebagai mumtahin syafawi:
1. Tanya pokok ajaran agama, perbandingan, sikap Islam, jawaban syubhat.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik, naikkan kesulitan.
4. Penilaian akhir + area lemah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari topik yang kupelajari ([SEBUTKAN]): topik tersering jadi soal, cara jawab adil & berdalil, prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (di bawah). Rapikan jadi: agama → pokok ajaran → sikap Islam, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
        {
          title: "Verifikasi Pemahaman Pasca-Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Setelah talaqqi topik [SEBUTKAN], aku jelaskan ulang (di bawah). Periksa keakuratan & keadilan paparan, koreksi, ajukan 3 pertanyaan penguji.

[METODE]

[LEVEL_BAHASA]

Penjelasanku: [TEMPEL]`,
        },
      ],
      eksplorasi: [
        {
          title: "Konsep Tauhid sebagai Pembeda Utama",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan:
1. Bagaimana tauhid Islam berbeda fundamental dari konsep ketuhanan agama lain.
2. Argumen keunggulan tauhid secara rasional & naqli.
3. Cara menjelaskannya dengan hikmah dalam dialog.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Toleransi & Koeksistensi dalam Islam",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan:
1. Konsep toleransi (tasamuh) dalam Islam terhadap pemeluk agama lain.
2. Contoh historis koeksistensi di peradaban Islam (ahlu dzimmah).
3. Beda toleransi (menghormati) dengan pluralisme akidah (menyamakan kebenaran).

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Studi Konsep Lintas Agama",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk konsep [SEBUTKAN, mis. konsep nabi, wahyu, hari akhir]:
1. Bandingkan pemahaman konsep ini di Islam vs agama lain.
2. Tunjukkan keunikan & kelurusan pandangan Islam.
3. Sajikan secara ilmiah, akurat, & adil.
PENTING: jangan mengarang doktrin agama lain; jika ragu, katakan.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },
  {
    id: "tsaqafah-islamiyah",
    name: "Tsaqafah Islamiyah",
    arabic: "الثقافة الإسلامية",
    desc: "Wawasan peradaban & pemikiran Islam secara menyeluruh",
    category: "aqdi",
    kitabUtama: "Al-Tsaqafah Al-Islamiyah (manhaj Azhar)",
    tingkat: ["1"],
    fakultas: ["dakwah"],
    jurusan: [],
    prompts: {
      pahami: [
        {
          title: "Peta Besar Tsaqafah Islamiyah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri kerangka utuh Tsaqafah Islamiyah:
1. Definisi tsaqafah + bedanya dengan hadharah & madaniyyah.
2. Komponen: aqidah, syariah, akhlak, sejarah, peradaban.
3. Tujuan: membentuk muslim yang memiliki wawasan Islam menyeluruh.
4. Outline bercabang.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Unsur-Unsur Tsaqafah Islamiyah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan unsur pembentuk tsaqafah Islamiyah:
1. Al-'Aqidah sebagai fondasi — bagaimana membentuk worldview.
2. Al-Syariah sebagai sistem hidup.
3. Al-Akhlak sebagai manifestasi.
4. Bagaimana ketiganya membentuk kepribadian muslim.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Tsaqafah Islamiyah vs Ghazwul Fikri",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan:
1. Apa itu ghazwul fikri (perang pemikiran) dan bentuk-bentuknya.
2. Bagaimana tsaqafah Islamiyah yang kuat menjadi tameng.
3. Tantangan pemikiran kontemporer & respons Islam yang bijak.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Komponen & Istilah Tsaqafah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal komponen tsaqafah Islamiyah:
1. Tabel: komponen | definisi | peran.
2. Mnemonic.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Tsaqafah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Topik yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah H+1, H+3, H+7 + cara uji. Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Drill Soal Tsaqafah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal (definisi, komponen, penerapan) dari [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Analisis Tantangan Pemikiran",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 4 tantangan pemikiran kontemporer. Tugasku: analisis dari perspektif tsaqafah Islamiyah.
1. JANGAN beri analisis dulu.
2. Koreksi + sempurnakan.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Tsaqafah (Gaya Azhari)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian Tsaqafah gaya Azhar: 'arrif, bayyin, qarin, 5-6 soal.
JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari topik yang kupelajari ([SEBUTKAN]): topik tersering jadi soal, cara jawab dapat nilai penuh, prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi Tsaqafah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (di bawah). Rapikan, lengkapi, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
      ],
      eksplorasi: [
        {
          title: "Tsaqafah Islamiyah untuk Da'i",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan mengapa tsaqafah Islamiyah yang kuat adalah bekal wajib da'i:
1. Hubungan tsaqafah dengan kualitas dakwah.
2. Bagaimana wawasan luas membuat da'i lebih efektif.
3. Cara membangun tsaqafah secara bertahap.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  {
    id: "khithabah",
    name: "Khithabah (Seni Berpidato)",
    arabic: "الخطابة",
    desc: "Ilmu & seni menyampaikan pidato/khutbah yang efektif",
    category: "tarikhi",
    kitabUtama: "Al-Khithabah (manhaj Azhar)",
    tingkat: ["1", "2"],
    fakultas: ["dakwah"],
    jurusan: [],
    prompts: {
      pahami: [
        {
          title: "Peta Besar Ilmu Khithabah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri kerangka utuh ilmu khithabah:
1. Definisi khithabah + sejarah singkatnya dalam Islam.
2. Jenis-jenis: khutbah Jum'at, khutbah 'Id, pidato dakwah, dll.
3. Rukun/unsur khithabah yang baik (khatib, maudhu', uslub, pendengar).
4. Outline bercabang.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Unsur Khithabah yang Efektif",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan unsur-unsur khithabah yang membuat pidato efektif:
1. Sifat khatib yang ideal (ilmu, akhlak, kewibawaan, suara).
2. Struktur khutbah/pidato (muqaddimah, 'ardh, khatimah).
3. Uslub (gaya bahasa) yang tepat sesuai audiens.
4. Teknik menarik perhatian & memengaruhi pendengar.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Khithabah Nabi & Sahabat",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan teladan khithabah dari Nabi ﷺ & sahabat:
1. Ciri khas pidato Nabi ﷺ (singkat, padat, berkesan).
2. Contoh khatib masyhur di kalangan sahabat.
3. Pelajaran yang bisa diaplikasikan khatib modern.
PENTING: sebut yang kamu yakin; jika ragu, katakan.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Struktur & Rukun Khutbah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal struktur & rukun khutbah Jum'at/dakwah:
1. Tabel: unsur | isi | tips.
2. Mnemonic.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Latihan Khithabah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Buatkan jadwal latihan khithabah: persiapan materi, latihan lisan, evaluasi. Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Susun Kerangka Khutbah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Aku akan menyusun kerangka khutbah/pidato tentang [SEBUTKAN TEMA]:
1. Koreksi struktur (muqaddimah-'ardh-khatimah).
2. Koreksi dalil yang kupakai (jangan mengarang).
3. Sarankan cara pembukaan yang menarik.

[METODE]

[LEVEL_BAHASA]

Kerangkaku: [TEMPEL]`,
        },
        {
          title: "Evaluasi Teks Khutbah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Aku tempel teks khutbah/pidato yang aku tulis. Evaluasi dari sisi:
1. Struktur & kejelasan alur.
2. Kekuatan dalil & argumen.
3. Gaya bahasa & daya tarik.
4. Saran konkret perbaikan.

[METODE]

[LEVEL_BAHASA]

Teks: [TEMPEL]`,
        },
        {
          title: "Drill Soal Teori Khithabah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal (definisi, unsur, jenis, teknik) dari bab [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Khithabah (Gaya Azhari)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian Khithabah gaya Azhar: 'arrif, udzkur syuruth al-khatib, iktub muqaddimah khutbah, qarin. 5-6 soal.
JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari topik yang kupelajari ([SEBUTKAN]): topik tersering jadi soal, cara jawab dapat nilai penuh, prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi Khithabah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (di bawah). Rapikan, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
      ],
      eksplorasi: [
        {
          title: "Khithabah di Era Digital",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan adaptasi khithabah di era media:
1. Bagaimana prinsip khithabah klasik diterapkan di video/podcast.
2. Perbedaan pidato langsung vs digital.
3. Tips menjaga kualitas konten dakwah di media.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  {
    id: "ushul-dakwah",
    name: "Ushul Dakwah wa Manahijuha",
    arabic: "أصول الدعوة ومناهجها",
    desc: "Fondasi, metode, dan strategi dakwah Islam",
    category: "tarikhi",
    kitabUtama: "Ushul Ad-Da'wah (manhaj Azhar)",
    tingkat: ["1"],
    fakultas: ["dakwah"],
    jurusan: [],
    prompts: {
      pahami: [
        {
          title: "Peta Besar Ushul Dakwah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri kerangka utuh Ushul Dakwah:
1. Definisi dakwah + hukumnya (fardhu 'ain/kifayah).
2. Rukun dakwah: da'i, mad'u, maudhu', uslub, wasilah.
3. Sumber & fondasi: Qur'an, Sunnah, sirah.
4. Outline bercabang.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Metode Dakwah Qur'ani",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan tiga metode dakwah dari An-Nahl:
1. Al-Hikmah — definisi + contoh penerapan.
2. Al-Mau'izhah Al-Hasanah — definisi + contoh.
3. Al-Mujadalah billati hiya ahsan — definisi + contoh.
4. Kapan tiap metode paling tepat dipakai.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Maratib Dakwah (Tahapan)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan tahapan dakwah:
1. Dakwah sirriyah ke jahriyah (teladan dari sirah).
2. Prioritas dakwah: tauhid dulu, lalu ibadah, lalu akhlak & muamalah.
3. Kenapa urutan ini penting secara metodologis.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Rukun & Metode Dakwah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal rukun dakwah + tiga metode Qur'ani:
1. Daftar (Arab berharakat + arti).
2. Mnemonic.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Ushul Dakwah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Topik yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah H+1, H+3, H+7 + cara uji. Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Rancang Strategi Dakwah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 4 skenario mad'u berbeda. Tugasku: rancang strategi dakwah yang sesuai.
1. JANGAN beri jawaban dulu.
2. Koreksi + sarankan perbaikan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Soal Ushul Dakwah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal (definisi, metode, dalil, penerapan) dari [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Studi Kasus Dakwah Nabi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk peristiwa dakwah [SEBUTKAN dari sirah]:
1. Identifikasi metode/uslub yang dipakai Nabi.
2. Faktor keberhasilan dakwah di situasi itu.
3. Pelajaran untuk dakwah kontemporer.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Ushul Dakwah (Gaya Azhari)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian Ushul Dakwah gaya Azhar: 'arrif, bayyin al-asalib, thabbiq 'ala, udzkur maratib. 5-6 soal.
JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Dari topik yang kupelajari: topik tersering jadi soal, cara jawab dapat nilai penuh, prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (di bawah). Rapikan, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
      ],
      eksplorasi: [
        {
          title: "Dakwah Kontemporer & Media Sosial",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bagaimana ushul dakwah klasik diterapkan di media sosial:
1. Prinsip hikmah, mau'izhah, jidal dalam konteks digital.
2. Tantangan khusus dakwah online.
3. Menjaga kualitas & integritas da'i di media.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  {
    id: "nizham-islamiyah",
    name: "Nizham Islamiyah (Sistem Islam)",
    arabic: "النظم الإسلامية",
    desc: "Sistem-sistem dalam Islam: politik, sosial, ekonomi, pendidikan",
    category: "tarikhi",
    kitabUtama: "An-Nuzhum Al-Islamiyyah (manhaj Azhar)",
    tingkat: ["2"],
    fakultas: ["dakwah"],
    jurusan: [],
    prompts: {
      pahami: [
        {
          title: "Peta Besar Nizham Islamiyah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri kerangka utuh Nizham Islamiyah:
1. Definisi nizham + mengapa Islam punya sistem yang komprehensif.
2. Jenis nizham: siyasi (khilafah/imamah), ijtima'i (sosial), iqtishadi (ekonomi), tarbawi (pendidikan).
3. Prinsip umum: syura, 'adalah, maslahat.
4. Outline bercabang.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Nizham Siyasi Islam",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan sistem politik Islam:
1. Konsep khilafah/imamah + syarat-syaratnya.
2. Syura sebagai prinsip pemerintahan.
3. Hak & kewajiban pemimpin dan rakyat.
4. Bedanya dengan sistem demokrasi Barat (berimbang & akademis).

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Nizham Iqtishadi & Ijtima'i",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan:
1. Prinsip ekonomi Islam (larangan riba, zakat, keadilan distribusi).
2. Sistem sosial Islam (keluarga, ukhuwwah, solidaritas).
3. Keunikan nizham Islam dibanding sistem lain.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Jenis & Prinsip Nizham",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal jenis nizham + prinsip utama tiap satu:
1. Tabel: nizham | prinsip | dalil ringkas.
2. Mnemonic.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Nizham Islamiyah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Topik yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah + cara uji. Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Drill Soal Nizham Islamiyah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal (definisi, prinsip, perbandingan) dari [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Analisis Penerapan Nizham",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk isu kontemporer [SEBUTKAN, mis. ekonomi, pemerintahan]:
1. Bagaimana nizham Islam merespons.
2. Prinsip yang relevan.
3. Tantangan penerapan di masa kini.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Nizham Islamiyah (Gaya Azhari)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian Nizham gaya Azhar: 'arrif, bayyin, qarin, 5-6 soal.
JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Topik tersering jadi soal, cara jawab dapat nilai penuh, prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (di bawah). Rapikan, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
      ],
      eksplorasi: [
        {
          title: "Nizham Islam & Tantangan Modernitas",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan bagaimana nizham Islam merespons modernitas:
1. Prinsip yang tetap (tsawabit) & yang fleksibel (murunah).
2. Bagaimana ijtihad memperbaharui penerapan tanpa mengubah prinsip.
3. Contoh penerapan nizham Islam di negara modern.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  {
    id: "jughrafiyah-islami",
    name: "Jughrafiyah Alam Islami",
    arabic: "جغرافية العالم الإسلامي",
    desc: "Geografi dunia Islam: persebaran, karakteristik & signifikansi",
    category: "tarikhi",
    kitabUtama: "Jughrafiyyat Al-'Alam Al-Islami (manhaj Azhar)",
    tingkat: ["3"],
    fakultas: ["dakwah"],
    jurusan: [],
    prompts: {
      pahami: [
        {
          title: "Peta Besar Geografi Dunia Islam",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri kerangka utuh Jughrafiyah Alam Islami:
1. Definisi & ruang lingkup dunia Islam (alam Islami).
2. Kawasan-kawasan: Timur Tengah, Asia Tengah, Asia Tenggara, Afrika, dll.
3. Signifikansi geografi Islam untuk dakwah & ukhuwwah.
4. Outline bercabang.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Persebaran & Karakteristik Kawasan Islam",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan karakteristik tiap kawasan Islam:
1. Kawasan Arab (Jazirah, Syam, Mesir, Maghrib).
2. Kawasan non-Arab (Asia Tenggara, Sub-Sahara, Asia Tengah).
3. Ciri khas Islam tiap kawasan + jumlah muslim (perkiraan).
PENTING: sebut data yang kamu yakin; jika ragu, katakan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Peran Geografi dalam Dakwah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan kaitan geografi dengan dakwah:
1. Bagaimana kondisi geografis memengaruhi cara dakwah berkembang.
2. Jalur penyebaran Islam secara historis (perdagangan, dll).
3. Tantangan dakwah di berbagai kawasan.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Kawasan & Data Islam Dunia",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal kawasan Islam:
1. Tabel: kawasan | negara utama | ciri Islam.
2. Mnemonic untuk mengingat kawasan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Jughrafiyah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Kawasan yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah + cara uji. Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Drill Soal Geografi Islam",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal (kawasan, karakteristik, sejarah persebaran) dari [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Analisis Tantangan Dakwah per Kawasan",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk kawasan [SEBUTKAN]:
1. Karakteristik muslim di kawasan ini.
2. Tantangan dakwah yang khas.
3. Pendekatan yang paling efektif.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Jughrafiyah (Gaya Azhari)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian Jughrafiyah gaya Azhar: tahaddats 'an, ma khasha'is, 5-6 soal.
JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Topik tersering jadi soal, cara jawab dapat nilai penuh, prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (di bawah). Rapikan, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
      ],
      eksplorasi: [
        {
          title: "Masa Depan Islam di Kawasan Minoritas",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk kawasan di mana muslim adalah minoritas [SEBUTKAN]:
1. Kondisi & tantangan muslim di sana.
2. Strategi dakwah & penguatan identitas.
3. Peran lembaga Islam internasional.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  {
    id: "tiarat-fikriyyah",
    name: "Tiarat Fikriyyah (Arus Pemikiran)",
    arabic: "التيارات الفكرية",
    desc: "Analisis aliran-aliran pemikiran modern yang mempengaruhi dunia Islam",
    category: "aqdi",
    kitabUtama: "At-Tiarat Al-Fikriyyah (manhaj Azhar)",
    tingkat: ["3", "4"],
    fakultas: ["dakwah"],
    jurusan: [],
    prompts: {
      pahami: [
        {
          title: "Peta Besar Tiarat Fikriyyah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri kerangka utuh ilmu tiarat fikriyyah:
1. Definisi + tujuan mempelajarinya (memahami & merespons, bukan mengikuti).
2. Aliran-aliran utama: sekularisme, liberalisme, nasionalisme, komunisme, fundamentalisme.
3. Mengapa da'i harus memahami arus pemikiran.
4. Outline bercabang.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Sekularisme & Liberalisme",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan secara berimbang & akademis:
1. Akar historis & inti pemikiran sekularisme.
2. Liberalisme: prinsip-prinsip dasarnya.
3. Pengaruh keduanya terhadap dunia Islam.
4. Respons Islam yang ilmiah & konstruktif.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Arus Pemikiran [SEBUTKAN]",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan aliran [SEBUTKAN, mis. nasionalisme, komunisme, post-modernisme]:
1. Latar historis & inti pemikiran.
2. Pengaruhnya di dunia Islam.
3. Titik pertemuan & perbedaan dengan Islam.
4. Respons ilmiah Ahlussunnah.
Sajikan berimbang & akademis.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Aliran & Ciri Pokoknya",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal aliran-aliran fikriyyah:
1. Tabel: aliran | inti pemikiran | dampak di dunia Islam.
2. Mnemonic.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Tiarat Fikriyyah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Aliran yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah + cara uji. Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Drill Identifikasi Aliran dari Pernyataan",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 8 pernyataan/pandangan. Tugasku: identifikasi aliran yang memegangnya.
1. JANGAN beri jawaban dulu.
2. Koreksi + jelaskan penandanya.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Merespons Syubhat Fikriyyah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 4 argumen dari aliran [SEBUTKAN]. Tugasku: respons secara ilmiah & berimbang.
1. JANGAN beri respons dulu.
2. Koreksi + sempurnakan dengan manhaj yang benar.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Soal Tiarat Fikriyyah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal (definisi, aliran, dampak, respons) dari [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Tiarat Fikriyyah (Gaya Azhari)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian Tiarat gaya Azhar: 'arrif, bayyin asbab intisyar, raddu 'ala, 5-6 soal.
JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Topik tersering jadi soal, cara jawab dapat nilai penuh, prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (di bawah). Rapikan, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
      ],
      eksplorasi: [
        {
          title: "Tiarat Fikriyyah di Era Digital",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bagaimana arus pemikiran kontemporer menyebar lewat media digital:
1. Platform & mekanisme penyebaran.
2. Cara da'i mengenali & merespons di ruang digital.
3. Strategi kontra-narasi yang bijak.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  {
    id: "ilmu-ijtima",
    name: "Ilmu Ijtima' (Sosiologi Islam)",
    arabic: "علم الاجتماع الإسلامي",
    desc: "Sosiologi dari perspektif Islam: masyarakat, keluarga, perubahan sosial",
    category: "tarikhi",
    kitabUtama: "Ilm Al-Ijtima' Al-Islami (manhaj Azhar)",
    tingkat: ["3"],
    fakultas: ["dakwah"],
    jurusan: [],
    prompts: {
      pahami: [
        {
          title: "Peta Besar Ilmu Ijtima' Islami",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri kerangka utuh Ilmu Ijtima' dari perspektif Islam:
1. Definisi + bedanya dengan sosiologi Barat.
2. Topik utama: masyarakat, keluarga, perubahan sosial, ukhuwwah.
3. Sumber Islami: Qur'an & Sunnah sebagai fondasi analisis sosial.
4. Outline bercabang.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Masyarakat Islam Ideal",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan konsep masyarakat Islam yang ideal:
1. Karakteristik al-mujtama' al-Islami menurut Qur'an & Sunnah.
2. Peran individu, keluarga, dan negara.
3. Konsep ukhuwwah & takaful ijtima'i (solidaritas sosial).

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Perubahan Sosial dalam Islam",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan pandangan Islam tentang perubahan sosial:
1. Kaidah "innallaha la yughayyiru..." — aplikasinya dalam dinamika sosial.
2. Faktor-faktor yang mendorong perubahan positif.
3. Peran dakwah dalam transformasi sosial.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Konsep & Istilah Sosiologi Islam",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal istilah kunci: mujtama', ta'awun, takaful, ukhuwwah, dll:
1. Tabel: istilah (Arab berharakat) | arti | contoh.
2. Mnemonic.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Ilmu Ijtima'",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Topik yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah + cara uji. Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Drill Soal Ilmu Ijtima'",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal (definisi, konsep, penerapan) dari [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Analisis Fenomena Sosial (Tathbiq)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk fenomena sosial [SEBUTKAN, mis. disintegrasi keluarga, urbanisasi]:
1. Analisis dari perspektif sosiologi Islam.
2. Faktor penyebab & dampaknya.
3. Solusi yang Islam tawarkan.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Ilmu Ijtima' (Gaya Azhari)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian Ilmu Ijtima' gaya Azhar: 'arrif, bayyin, hallil, 5-6 soal.
JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Topik tersering jadi soal, cara jawab dapat nilai penuh, prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (di bawah). Rapikan, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
      ],
      eksplorasi: [
        {
          title: "Dakwah sebagai Transformasi Sosial",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan peran dakwah dalam membangun masyarakat:
1. Bagaimana dakwah mengubah individu → keluarga → masyarakat.
2. Model transformasi sosial dari sirah Nabi.
3. Tantangan & strategi dakwah di masyarakat kontemporer.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  {
    id: "manahij-bahs",
    name: "Manahij Bahts Ilmi",
    arabic: "مناهج البحث العلمي",
    desc: "Metodologi penelitian ilmiah untuk karya akademis Islam",
    category: "tarikhi",
    kitabUtama: "Manahij Al-Bahts Al-Ilmi (manhaj Azhar)",
    tingkat: ["3"],
    fakultas: ["dakwah"],
    jurusan: [],
    prompts: {
      pahami: [
        {
          title: "Peta Besar Manahij Bahts Ilmi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri kerangka utuh metodologi penelitian ilmiah:
1. Definisi bahts ilmi + jenisnya (deskriptif, historis, eksperimen, komparatif).
2. Langkah penelitian: masalah → hipotesis → data → analisis → kesimpulan.
3. Bedanya dengan penelitian umum & penelitian Islam.
4. Outline bercabang.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Cara Menyusun Penelitian",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan langkah menyusun penelitian ilmiah:
1. Memilih & merumuskan masalah (isykaliyah).
2. Menyusun kerangka teori & tinjauan pustaka.
3. Metode pengumpulan & analisis data.
4. Cara menulis kesimpulan & rekomendasi.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Cara Menulis Karya Ilmiah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan teknik penulisan karya ilmiah (bahts/risalah):
1. Struktur: muqaddimah, tamhid, abwab, khatimah.
2. Cara menulis catatan kaki & daftar rujukan (tautsiq).
3. Standar akademis Azhar.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Langkah & Istilah Penelitian",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal istilah & langkah penelitian:
1. Tabel: istilah (Arab berharakat) | arti | contoh.
2. Checklist langkah penelitian.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Persiapan Penelitian",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Aku sedang menyiapkan penelitian tentang [SEBUTKAN]. Bantu buat jadwal riset: tahapan, target per minggu, cara mengukur kemajuan. Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Rumuskan Masalah Penelitian",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Aku punya topik [SEBUTKAN]. Bantu aku merumuskan:
1. Pertanyaan penelitian yang tajam & spesifik.
2. Tujuan & manfaat penelitian.
3. Batasan masalah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Evaluasi Penulisan Ilmiah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Aku tempel bagian dari karya ilmiahku. Evaluasi:
1. Kejelasan argumen & alur logika.
2. Ketepatan tautsiq (referensi).
3. Kesesuaian dengan standar penulisan ilmiah.

[METODE]

[LEVEL_BAHASA]

Teks: [TEMPEL]`,
        },
        {
          title: "Drill Soal Manahij Bahts",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal (definisi, langkah, jenis penelitian) dari [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Manahij Bahts (Gaya Azhari)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian Manahij Bahts gaya Azhar: 'arrif, udzkur khutuwat, bayyin al-farq, 5-6 soal.
JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Topik tersering jadi soal, cara jawab dapat nilai penuh, prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (di bawah). Rapikan, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
      ],
      eksplorasi: [
        {
          title: "Penelitian Dakwah yang Relevan",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu aku menemukan topik penelitian yang relevan untuk Fakultas Dakwah:
1. Isu-isu aktual dalam dakwah yang layak diteliti.
2. Bagaimana menggabungkan metodologi ilmiah dengan sumber Islam.
3. Contoh judul penelitian yang baik.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  {
    id: "maqashid-syariah",
    name: "Maqashid Syariah",
    arabic: "مقاصد الشريعة",
    desc: "Tujuan-tujuan syariat Islam & aplikasinya dalam ijtihad kontemporer",
    category: "fiqhi",
    kitabUtama: "Maqashid Asy-Syariah (manhaj Azhar)",
    tingkat: ["4"],
    fakultas: ["dakwah"],
    jurusan: [],
    prompts: {
      pahami: [
        {
          title: "Peta Besar Maqashid Syariah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri kerangka utuh Maqashid Syariah:
1. Definisi maqashid + siapa yang mengembangkan ilmu ini (Asy-Syathibi dll).
2. Al-Kulliyyat Al-Khams: hifzh ad-din, nafs, 'aql, nasl, mal.
3. Tingkatan: dharuriyyat, hajiyyat, tahsiniyyat.
4. Outline bercabang.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Al-Kulliyyat Al-Khams",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan lima maqashid pokok secara tuntas:
1. Hifzh ad-din, nafs, 'aql, nasl, mal — definisi + dalil + contoh hukum yang melindunginya.
2. Bagaimana tiap maqshad termanifestasi dalam fiqh.
PENTING: sebut dalil dengan benar; jika ragu, katakan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Maqashid untuk Ijtihad Kontemporer",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan peran maqashid dalam ijtihad:
1. Bagaimana maqashid memandu pengambilan hukum isu baru.
2. Metode penimbangan maslahat & mafsadat.
3. Contoh penerapan maqashid pada isu kontemporer (tanpa mengarang fatwa).

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Al-Kulliyyat Al-Khams & Tingkatannya",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal:
1. Lima maqashid (Arab berharakat + arti) + satu contoh hukum tiap satu.
2. Tiga tingkatan (dharuriyyat-hajiyyat-tahsiniyyat) + contoh.
3. Mnemonic.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Maqashid",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Topik yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah + cara uji. Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Terapkan Maqashid ke Kasus",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 6 kasus hukum. Tugasku: identifikasi maqshad yang dilindungi & tingkatannya.
1. JANGAN beri jawaban dulu.
2. Koreksi penalaran-ku.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Soal Maqashid",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal (definisi, tingkatan, penerapan) dari [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Hubungkan Maqashid dengan Qawa'id Fiqhiyyah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Tunjukkan hubungan maqashid dengan kaidah fiqhiyyah:
1. Bagaimana kaidah "adh-dharar yuzal" berakar pada hifzh an-nafs.
2. Kaitan tiap kaidah induk dengan maqshad tertentu.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Maqashid (Gaya Azhari)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian Maqashid gaya Azhar: 'arrif, udzkur al-kulliyyat ma'a al-amtsilah, thabbiq, 5-6 soal.
JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Topik tersering jadi soal, cara jawab dapat nilai penuh, prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (di bawah). Rapikan, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
      ],
      eksplorasi: [
        {
          title: "Maqashid & Isu Kontemporer",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk isu [SEBUTKAN, mis. teknologi, lingkungan, bioetika]:
1. Maqashid mana yang relevan.
2. Bagaimana menimbang maslahat-mafsadat.
3. Prinsip yang bisa jadi pegangan tanpa memaksakan fatwa.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  {
    id: "istisyraq",
    name: "Istisyraq wa Tabsyir",
    arabic: "الاستشراق والتبشير",
    desc: "Kajian orientalisme & misionarisme: sejarah, metode & respons Islam",
    category: "aqdi",
    kitabUtama: "Al-Istisyraq (manhaj Azhar)",
    tingkat: ["4"],
    fakultas: ["dakwah"],
    jurusan: [],
    prompts: {
      pahami: [
        {
          title: "Peta Besar Istisyraq & Tabsyir",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri kerangka utuh:
1. Definisi istisyraq (orientalisme) + tabsyir (misionarisme) + bedanya.
2. Latar historis: kapan & mengapa muncul.
3. Kaitan keduanya dengan kolonialisme.
4. Outline bercabang.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Metode & Tujuan Orientalis",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan secara akademis & berimbang:
1. Metode yang dipakai orientalis dalam mengkaji Islam & Qur'an.
2. Tujuan: akademis murni vs agenda tersembunyi (bedakan adil).
3. Kontribusi positif orientalis yang diakui ulama.
4. Kritik akademis terhadap metodologi yang bermasalah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Respons Ulama terhadap Istisyraq",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan:
1. Bagaimana ulama merespons syubhat orientalis (metode ilmiah, bukan emosional).
2. Tokoh-tokoh yang menulis bantahan akademis.
3. Pentingnya menguasai argumen orientalis untuk berdakwah di Barat.
PENTING: sajikan berimbang; sebut yang kamu yakin.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Definisi, Tokoh & Metode",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal:
1. Tabel: orientalis/misionaris masyhur | metode | karya | respons ulama.
2. Mnemonic.
PENTING: sebut yang kamu yakin; jika ragu, katakan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Istisyraq",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Topik yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah + cara uji. Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Merespons Syubhat Orientalis",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 4 syubhat/klaim orientalis tentang Islam/Qur'an. Tugasku: respons secara ilmiah & berimbang.
1. JANGAN beri respons dulu.
2. Koreksi + sempurnakan dengan argumen yang kuat.
PENTING: respons harus akademis, bukan emosional.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Soal Istisyraq & Tabsyir",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal (definisi, sejarah, metode, respons) dari [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Istisyraq (Gaya Azhari)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian Istisyraq gaya Azhar: 'arrif, bayyin ahdaf, raddu 'ala, 5-6 soal.
JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Topik tersering jadi soal, cara jawab dapat nilai penuh, prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (di bawah). Rapikan, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
      ],
      eksplorasi: [
        {
          title: "Istisyraq Digital & Media Kontemporer",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan:
1. Bagaimana orientalisme & misionarisme berevolusi di era digital.
2. Konten anti-Islam di media: pola & respons yang bijak.
3. Peran da'i dalam melindungi umat dari pengaruh negatif.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  {
    id: "akhlaq-islamiyah",
    name: "Akhlaq Islamiyah",
    arabic: "الأخلاق الإسلامية",
    desc: "Etika & akhlak Islam: fondasi, nilai, dan pembentukan karakter",
    category: "aqdi",
    kitabUtama: "Al-Akhlaq Al-Islamiyyah (manhaj Azhar)",
    tingkat: ["4"],
    fakultas: ["dakwah"],
    jurusan: [],
    prompts: {
      pahami: [
        {
          title: "Peta Besar Akhlaq Islamiyah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri kerangka utuh Akhlaq Islamiyah:
1. Definisi akhlak + sumbernya (Qur'an, Sunnah, akal).
2. Ruang lingkup: akhlak terhadap Allah, diri sendiri, sesama, alam.
3. Hubungan akhlak dengan aqidah & syariah.
4. Outline bercabang.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Fondasi Akhlak Islam",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan fondasi akhlak Islam:
1. Hubungan akhlak dengan tauhid (akhlak lahir dari ma'rifatullah).
2. Akhlak Nabi ﷺ sebagai uswah hasanah.
3. Proses pembentukan akhlak: ilmu → iradah → 'amal → 'adah.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Akhlak Mulia & Cara Membentuknya",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan akhlak mulia yang wajib dimiliki da'i:
1. Sifat-sifat utama: ikhlas, amanah, sabar, tawadhu', 'adl.
2. Penyakit akhlak yang merusak dakwah: riya', kibr, hasad.
3. Cara praktis membentuk akhlak mulia.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Akhlak Mulia & Lawannya",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal pasangan akhlak mulia & tercela:
1. Tabel: akhlak mulia (Arab berharakat) | lawannya | cara membentuk.
2. Mnemonic.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Akhlaq",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Topik yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah + cara uji (praktik, bukan sekadar hafal). Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Diagnosa & Terapi Akhlak",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 5 deskripsi perilaku. Tugasku: identifikasi akhlak yang terlibat & cara memperbaikinya.
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Soal Akhlaq Islamiyah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal (definisi, klasifikasi, cara membentuk) dari [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Akhlaq (Gaya Azhari)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian Akhlaq gaya Azhar: 'arrif, bayyin asasiyyat, 'allij, 5-6 soal.
JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Topik tersering jadi soal, cara jawab dapat nilai penuh, prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (di bawah). Rapikan, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
      ],
      eksplorasi: [
        {
          title: "Akhlak Da'i sebagai Dakwah Bil Hal",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan dakwah bil hal lewat akhlak:
1. Bagaimana kepribadian da'i adalah dakwah paling kuat.
2. Contoh dari sirah: akhlak Nabi memenangkan hati sebelum argumen.
3. Cara membangun reputasi akhlak di komunitas.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  {
    id: "hadhir-alam-islami",
    name: "Hadhir Al-Alam Al-Islami",
    arabic: "حاضر العالم الإسلامي",
    desc: "Kondisi & isu kontemporer dunia Islam: tantangan dan peluang",
    category: "tarikhi",
    kitabUtama: "Hadhir Al-Alam Al-Islami (manhaj Azhar)",
    tingkat: ["4"],
    fakultas: ["dakwah"],
    jurusan: [],
    prompts: {
      pahami: [
        {
          title: "Peta Besar Kondisi Dunia Islam",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri gambaran umum kondisi dunia Islam saat ini:
1. Kekuatan umat Islam (sumber daya, populasi, warisan ilmu).
2. Tantangan internal (perpecahan, kemunduran ilmu, dll).
3. Tantangan eksternal (tekanan global, islamofobia, dll).
4. Peluang kebangkitan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Isu-Isu Utama Dunia Islam",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk isu [SEBUTKAN, mis. konflik, kemiskinan, pendidikan, islamofobia]:
1. Gambaran faktual isu ini di dunia Islam.
2. Akar penyebab dari perspektif Islam.
3. Solusi yang ditawarkan ulama & cendekiawan Muslim.
PENTING: sajikan berimbang & berbasis fakta.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Peran Indonesia di Dunia Islam",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan posisi Indonesia dalam dunia Islam:
1. Negara muslim terbesar + keunikan Islam Nusantara.
2. Kontribusi Indonesia di level OKI & lembaga Islam internasional.
3. Tantangan & potensi Indonesia untuk umat Islam global.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Data & Fakta Kunci Dunia Islam",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal data penting dunia Islam:
1. Jumlah muslim, kawasan, lembaga internasional (OKI, dll).
2. Isu-isu utama + kata kunci.
PENTING: sebut data yang kamu yakin; jika ragu, katakan.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Hadhir Alam Islami",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Topik yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah + cara uji. Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Drill Soal Hadhir Alam Islami",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal (kondisi, isu, solusi, kawasan) dari [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Analisis Isu Kontemporer Dunia Islam",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk isu [SEBUTKAN]:
1. Analisis faktual + akar masalah.
2. Perspektif Islam.
3. Peran da'i dalam merespons.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Hadhir Alam Islami (Gaya Azhari)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian gaya Azhar: tahaddats 'an, ma asbab, iqtarah hulul, 5-6 soal.
JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Topik tersering jadi soal, cara jawab dapat nilai penuh, prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (di bawah). Rapikan, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
      ],
      eksplorasi: [
        {
          title: "Kebangkitan Islam (Shahwah Islamiyah)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan gerakan kebangkitan Islam:
1. Apa itu shahwah islamiyah & ciri-cirinya.
2. Tantangan & peluangnya.
3. Peran da'i dalam mengawal kebangkitan yang sehat.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  {
    id: "fiqh-dakwah",
    name: "Fiqh Dakwah",
    arabic: "فقه الدعوة",
    desc: "Hukum-hukum & kaidah fiqh yang mengatur aktivitas dakwah",
    category: "fiqhi",
    kitabUtama: "Fiqh Ad-Da'wah (manhaj Azhar)",
    tingkat: ["4"],
    fakultas: ["dakwah"],
    jurusan: [],
    prompts: {
      pahami: [
        {
          title: "Peta Besar Fiqh Dakwah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri kerangka utuh Fiqh Dakwah:
1. Definisi + ruang lingkup (hukum-hukum yang mengatur aktivitas dakwah).
2. Perbedaan fiqh dakwah dengan ushul dakwah.
3. Topik utama: amar ma'ruf nahi munkar, hukum dakwah ke non-muslim, adab hiwar.
4. Outline bercabang.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Amar Ma'ruf Nahi Munkar",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan fiqh amar ma'ruf nahi munkar:
1. Dalil kewajiban + syarat-syaratnya.
2. Tiga tingkatan (yad, lisan, qalb) + konteks penerapannya.
3. Syarat orang yang ber-amar ma'ruf.
4. Kapan nahi munkar bisa mendatangkan mafsadat lebih besar.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Hukum Dakwah & Adab Hiwar",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan:
1. Hukum berdakwah kepada non-muslim (fardhu kifayah, syarat, cara).
2. Adab & kaidah fiqh dalam berdialog dengan ahli kitab & lainnya.
3. Batas-batas yang tidak boleh dilanggar da'i.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Kaidah Fiqh dalam Dakwah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal kaidah fiqh yang relevan untuk dakwah:
1. Tabel: kaidah (Arab berharakat) | arti | aplikasi dalam dakwah.
2. Mnemonic.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Muraja'ah Fiqh Dakwah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Topik yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah + cara uji. Tabel.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Kasus Fiqh Dakwah (Tathbiq)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 6 kasus aktivitas dakwah. Tugasku: tentukan hukum & kaidah yang berlaku.
1. JANGAN beri jawaban dulu.
2. Koreksi penalaran-ku + dalil.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Soal Fiqh Dakwah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal (hukum, syarat, adab, kaidah) dari [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Timbang Maslahat-Mafsadat",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 4 skenario dakwah yang melibatkan pertimbangan maslahat-mafsadat. Tugasku: analisis & tentukan sikap.
1. JANGAN beri jawaban dulu.
2. Koreksi penalaran-ku.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Fiqh Dakwah (Gaya Azhari)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian Fiqh Dakwah gaya Azhar: 'arrif, udzkur al-hukm wad-dalil, thabbiq, 5-6 soal.
JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih.

[METODE]

[LEVEL_BAHASA]`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Topik tersering jadi soal, cara jawab dapat nilai penuh, prioritas H-7.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (di bawah). Rapikan, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]`,
        },
      ],
      eksplorasi: [
        {
          title: "Fiqh Dakwah Kontemporer",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di Fakultas Dakwah Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk isu fiqh dakwah kontemporer [SEBUTKAN, mis. dakwah online, dakwah di negara non-muslim]:
1. Kaidah fiqh yang relevan.
2. Pendapat ulama kontemporer.
3. Panduan praktis untuk da'i.
PENTING: jangan mengarang fatwa; kalau tidak yakin, katakan.

[METODE]

[LEVEL_BAHASA]`,
        },
      ],
    },
  },
];

/* ============================================================
   HELPER FUNCTIONS
   ============================================================ */

// Peta eksplisit: maddah id yang muncul di tiap firqah Dakwah Islamiyah
// Sumber: jadwal resmi Kuliyyah Dakwah Islamiyah Al-Azhar
const DAKWAH_MADDAH_MAP = {
  "1": [
    "tauhid", "tasawwuf", "ulum-quran", "firaq", "nahwu",
    "tsaqafah-islamiyah", "mantiq",
    "tajwid", "hadits-tahlili", "fiqh-lughah",
    "khithabah", "fiqh-madzhabi", "ushul-dakwah",
  ],
  "2": [
    "adyan", "sirah-nabawiyah", "tauhid", "nahwu",
    "filsafat-islam", "ulum-quran", "nizham-islamiyah",
    "tajwid", "dakwah", "hadits-tahlili",
    "khithabah", "fiqh-madzhabi", "firaq", "fiqh-lughah",
  ],
  "3": [
    "adyan", "jughrafiyah-islami", "ulum-quran",
    "ushul-fiqh", "balaghah", "tiarat-fikriyyah", "nizham-islamiyah",
    "tajwid", "ahwal-syakhsiyah", "dakwah", "ilmu-ijtima",
    "hadits-tahlili", "manahij-bahs", "hadharah",
  ],
  "4": [
    "maqashid-syariah", "istisyraq", "akhlaq-islamiyah",
    "tiarat-fikriyyah", "hadhir-alam-islami", "qawaid-fiqhiyyah", "ushul-fiqh",
    "tajwid", "adab", "fiqh-dakwah", "ahwal-syakhsiyah",
    "tasawwuf", "manahij-bahs",
  ],
};

const getMaddahsForProfile = (profile) => {
  if (!profile) return MADDAHS;

  if (profile.faculty === "dakwah") {
    const level = profile.level || "1";
    const allowedIds = DAKWAH_MADDAH_MAP[level] || DAKWAH_MADDAH_MAP["1"];
    return MADDAHS.filter(m => allowedIds.includes(m.id));
  }

  return MADDAHS.filter(m => {
    const facultyMatch = !profile.faculty || (m.fakultas || []).includes(profile.faculty);
    const levelMatch   = !profile.level  || (m.tingkat || []).includes(profile.level);

    // Filter qism khusus Banat (Dirasat Islamiyah):
    // - Hanya berlaku kalau user di fakultas "dirasat" DAN punya major (qism).
    // - Maddah dengan jurusan kosong = berlaku semua qism (lolos).
    // - Maddah dengan jurusan terisi = hanya lolos kalau cocok qism user.
    let jurusanMatch = true;
    const isBanatDirasat = profile.faculty === "dirasat" && profile.major;
    if (isBanatDirasat && Array.isArray(m.jurusan) && m.jurusan.length > 0) {
      jurusanMatch = m.jurusan.includes(profile.major);
    }

    return facultyMatch && levelMatch && jurusanMatch;
  });
};

const getMaddahById = (id) => MADDAHS.find(m => m.id === id);

const getMaddahsByCategory = () => {
  const grouped = {};
  MADDAH_CATEGORIES.forEach(cat => {
    grouped[cat.id] = {
      category: cat,
      maddahs: MADDAHS.filter(m => m.category === cat.id),
    };
  });
  return grouped;
};

const getMaddahCompletionCount = () => {
  const total       = MADDAHS.length;
  const withContent = MADDAHS.filter(m => m.prompts && Object.values(m.prompts).some(arr => arr.length > 0)).length;
  return { total, withContent };
};

Object.assign(window, {
  MADDAHS,
  MADDAH_CATEGORIES,
  MADDAH_PROMPT_KINDS,
  getMaddahsForProfile,
  getMaddahById,
  getMaddahsByCategory,
  getMaddahCompletionCount,
});
