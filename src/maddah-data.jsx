import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from 'react';
/* Talqih — Maddah Data Structure
   35 mata kuliah S1 Al-Azhar + 17 maddah Ma'had.
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
    fakultas: ["ushuluddin", "dirasat", "quran"],
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
          title: "Tafsir Ayat Lengkap (Step by Step)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, [GAYA_BELAJAR].

Aku sedang muthala'ah [MADDAH], dan ingin memahami ayat berikut secara komprehensif:

[TULIS AYAT DENGAN HARAKAT - sertakan surah dan nomor ayat]

Tolong bahas bertahap:
1. Asbabun Nuzul (kalau ada riwayat shahih) — sertakan teks Arab riwayat
2. Mufradat — penjelasan kata kunci, sertakan akar kata Arab
3. I'rab kalimat — i'rab kata-kata yang punya peran kunci
4. Tafsir Tahlili — pendapat 2-3 mufassir (mis. Ibnu Katsir, Az-Zamakhsyari, Az-Zuhaili). Sertakan kutipan ringkas dengan teks Arab.
5. Munasabah — hubungan ayat ini dengan ayat sebelum/sesudahnya
6. Pelajaran utama — istinbat dalam 1-2 kalimat

[LEVEL_BAHASA]

Saat menyebut ayat/hadits, sertakan teks Arab dengan harakat. Saat sebut kitab, pakai nama Arab. Saat sebut ulama, pakai nama Arab transliterasi natural.`,
        },
        {
          title: "Bedah Mufradat Ayat",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Sedang mempelajari [MADDAH].

Aku ingin bedah mufradat dari ayat berikut:

[TULIS AYAT DENGAN HARAKAT]

Untuk setiap kata kunci (3-5 kata yang paling penting):
1. Akar kata Arab (3 huruf)
2. Bentuk asli (madhi, mudhari', isim, dll)
3. Makna literal vs makna kontekstual
4. Kata-kata sinonim/antonim dari akar yang sama atau beda
5. Bagaimana mufassir tertentu memaknainya berbeda (kalau ada)

[LEVEL_BAHASA]

Sertakan teks Arab dengan harakat untuk semua kata kunci.`,
        },
        {
          title: "Pahami Munasabah Ayat",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Aku ingin memahami munasabah (hubungan logis) antar ayat di:

[SEBUTKAN SURAH, AYAT-AYAT YANG MAU DIBAHAS - mis. QS Al-Baqarah ayat 1-5]

Jelaskan:
1. Tema utama yang menghubungkan ayat-ayat ini
2. Munasabah antar ayat — kenapa ayat A diikuti ayat B, bukan urutan lain
3. Munasabah ayat pertama dengan ayat terakhir surah sebelumnya (kalau ini awal surah)
4. Hikmah pengurutan ini menurut ulama munasabah seperti Al-Biqa'i (Nazhmu Ad-Durar)

[LEVEL_BAHASA]

Sertakan teks Arab ayat-ayat yang dibahas. Sebut nama ulama dan kitab dalam Arab.`,
        },
        {
          title: "Hubungkan Ayat dengan Hadits",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS], belajar [MADDAH]. [GAYA_BELAJAR].

Untuk ayat berikut:

[TULIS AYAT DENGAN HARAKAT - surah dan no ayat]

Carikan 2-3 hadits shahih yang menjelaskan, mendetailkan, atau menjadi bayan untuk ayat ini.

Untuk setiap hadits:
1. Teks hadits dalam Arab dengan harakat
2. Terjemah Indonesia
3. Periwayat (Bukhari/Muslim/Tirmidzi/dll) dengan no riwayat kalau ingat
4. Bagaimana hadits ini menjelaskan ayat di atas

[LEVEL_BAHASA]

Pastikan haditsnya shahih — kalau ragu derajat haditsnya, sebutkan secara jujur.`,
        },
      ],
      hafal: [
        {
          title: "Drill Hafalan Ayat dengan Konteks",
          targetAI: "notebooklm",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Sedang menghafal [SURAH/JUZ] dengan target [TARGET HARI/MINGGU].

Bantu aku drill hafalan dengan sesi tasmi':
1. Sebut potongan ayat secara acak (1-2 ayat), tulis dalam Arab dengan harakat
2. Aku akan lanjutkan ayat selanjutnya
3. Kalau aku ragu, beri 3 kata pertama ayat selanjutnya sebagai isyarah
4. Setelah 10 putaran, beri daftar mawadi' yang perlu murajaah
5. Tunjukkan tempat-tempat yang biasanya keliru (mutasyabihat lafzhi)

[LEVEL_BAHASA]`,
        },
        {
          title: "Mnemonic untuk Ayat Sulit",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS], sedang menghafal [MADDAH]. [GAYA_BELAJAR].

Aku kesulitan hafal bagian berikut:

[PASTE AYAT/POTONGAN YANG SULIT]

Bantu aku:
1. Analisis kenapa bagian ini sulit (mutasyabihat? lafal mirip? urutan kata?)
2. Buatkan mnemonic Indonesia yang mudah diingat
3. Buatkan trik visual atau "story" pendek untuk lock-in
4. Sebutkan kalau ada ayat lain yang mirip yang biasa bikin tertukar — dan cara membedakannya

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Tafsir Mufradat Acak",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS], drill [MADDAH]. [GAYA_BELAJAR].

Beri 10 kata Arab dari Al-Qur'an untuk aku tafsirin maknanya. Format tiap kata:
- Tulis dengan harakat
- Sebutkan surah dan ayat asalnya
- Konteks ayat (1 baris)

Aku akan jawab maknanya. Setelah aku jawab semua, koreksi per nomor dengan:
- Makna yang tepat
- Penjelasan kenapa makna lain kurang tepat (kalau ada)
- 1 referensi tafsir untuk konfirmasi

[LEVEL_BAHASA]`,
        },
        {
          title: "Bedah Paragraf Tafsir Klasik",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Ini paragraf dari kitab tafsir klasik:

[PASTE TEKS ARAB DARI KITAB - sebutkan kitab apa]

Tolong analisis:
1. Tarjamah harfiyah
2. Tarjamah ma'nawiyyah (Indonesia akademik mengalir)
3. Penjelasan istilah teknis (tulis Arab + transliterasi + definisi)
4. Maksud inti mufassir dalam 1 kalimat
5. Bandingkan dengan pendapat mufassir lain kalau relevan

[LEVEL_BAHASA]

Kalau ada bagian ambigu, sebut secara jujur.`,
        },
        {
          title: "Identifikasi Manhaj Tafsir",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], belajar [MADDAH]. [GAYA_BELAJAR].

Beri 5 kutipan tafsir dari berbagai mufassir. Aku akan identifikasi manhaj-nya dan mufassirnya.

Format tiap kutipan:
1. Tulis dalam Arab dengan harakat
2. Beri 1 baris konteks ayat yang ditafsirkan

Setelah aku jawab semua, koreksi dengan kunci jawaban + reasoning.

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Tahriri Tafsir Tahlili",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, mau drill persiapan ujian Tahriri untuk maddah [MADDAH].

Beri 5 soal gaya khas imtihan Azhari:
- "Fassir al-ayat al-taliyah tafsiran tahliliyyan"
- "Bayyin asbab nuzul ayat..."
- "Adhkur ra'yu mufassirayni fi..."
- "Wadhdhih al-munasabah bayna..."
- "A'rib al-kalimat al-multawayyah ma'na"

Tulis soal dalam bahasa Arab. Beri 1 baris terjemah Indonesia di bawah tiap soal.

[LEVEL_BAHASA]

Tunggu jawabanku setelah semua soal ditampilkan, lalu koreksi dengan model answer ideal.`,
        },
        {
          title: "Mock Syafawi Tafsir",
          targetAI: "chatgpt",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, mau latihan ujian Syafawi (lisan) untuk [MADDAH]. [GAYA_BELAJAR].

Bertindaklah sebagai dosen Azhar yang menguji aku. Tanyakan 5 pertanyaan bertahap:
1. Definisi konsep dasar tafsir tahlili
2. Sebutkan langkah-langkah tafsir tahlili
3. Beri contoh aplikasi tafsir tahlili pada satu ayat (kasih aku ayat)
4. Bandingkan tafsir tahlili dengan tafsir maudhu'i
5. Sebut 3 mufassir tahlili masyhur dan kitabnya

Tunggu jawabanku setiap pertanyaan. Tantang follow-up kalau kurang lengkap.

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Review Pasca Talaqqi Tafsir",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar. Baru saja talaqqi dengan syaikh tentang tafsir [SURAH/AYAT] dari kitab [NAMA KITAB].

Materi yang dibahas syaikh:

[PASTE CATATAN ATAU POIN-POIN KAJIAN]

Tolong:
1. Susun ulang catatanku jadi struktur sistematis
2. Tambahkan kutipan Arab original (dengan harakat) untuk ayat/hadits/kaidah yang disebut syaikh
3. Beri 2-3 contoh aplikasi tambahan untuk konsep yang dibahas
4. Sebutkan pertanyaan yang sebaiknya aku tanyakan ke syaikh di sesi berikutnya

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Catatan Talaqqi yang Ambigu",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Punya catatan dari talaqqi [MADDAH] yang sebagiannya aku gak ingat konteksnya:

[PASTE CATATAN YANG MEMBINGUNGKAN]

Tolong:
1. Bantu interpretasi maksud catatan berdasarkan konteks tafsir
2. Lengkapi penjelasan yang kurang
3. Beri kemungkinan tafsir kalau catatan ambigu
4. Sebut konsep tafsir apa yang sedang dibahas

[LEVEL_BAHASA]`,
        },
      ],
      eksplorasi: [
        {
          title: "Khilaf Mufassirin Tentang Ayat",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Aku tertarik eksplorasi khilaf mufassirin tentang ayat berikut:

[TULIS AYAT DENGAN HARAKAT]

Tolong jelaskan:
1. Pendapat mufassir klasik utama (mis. Thabari, Ibnu Katsir, Az-Zamakhsyari)
2. Pendapat mufassir kontemporer (mis. Quthb, Az-Zuhaili, Sya'rawi)
3. Dalil masing-masing — sertakan teks Arab kalau dari ayat/hadits
4. Apakah khilafnya lafzhi (semu) atau ma'nawi (substansial)

Jangan men-tarjih. Biarkan aku yang merenungkan.

[LEVEL_BAHASA]`,
        },
        {
          title: "Aplikasi Ayat dalam Kehidupan Masisir",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar. [GAYA_BELAJAR]. Sebagai Masisir, aku ingin renungkan ayat:

[TULIS AYAT DENGAN HARAKAT]

Bantu aku refleksi:
1. Apa makna inti ayat ini (1 paragraf)
2. 3 aplikasi konkret dalam kehidupan thalib di Mesir
3. Pertanyaan refleksi untuk muraqabah diri

Bahasa Indonesia. Empati, bukan ceramah.

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
    fakultas: ["ushuluddin", "syariah", "lughah", "dirasat", "quran"],
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
          title: "Pahami Bab Nahwu",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, [GAYA_BELAJAR]. Sedang muthala'ah [MADDAH].

Aku ingin memahami bab [BAB - mis. Marfu'at, Manshubat, Majrurat, Asma'ul Khamsah, dll].

Tolong jelaskan bertahap:
1. Definisi bab ini secara singkat
2. Kaidah utama — sertakan teks Arab kaidah dengan harakat
3. 3 contoh kalimat Arab dengan harakat dan i'rab masing-masing
4. Hubungan bab ini dengan bab nahwu lain yang sudah dipelajari
5. Bait Alfiyah Ibnu Malik yang relate (kalau ada)

[LEVEL_BAHASA]

Sertakan teks Arab original untuk semua istilah teknis. Sebut sumber dari kitab klasik bila relevan.`,
        },
        {
          title: "Bedakan Istilah Mirip",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Aku sering bingung membedakan: [ISTILAH 1] vs [ISTILAH 2]
(contoh: Mubtada vs Khabar, Fa'il vs Maf'ul bih, Hal vs Tamyiz, Sifat vs Khabar Mufrad)

Tolong jelaskan:
1. Definisi masing-masing dengan teks Arab
2. Tanda pengenal di kalimat (cara membedakan saat baca)
3. 3 contoh kalimat Arab yang menunjukkan perbedaan jelas
4. Trik mengingat perbedaan

[LEVEL_BAHASA]`,
        },
        {
          title: "I'rab Kalimat",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Tolong i'rab kalimat berikut:

[PASTE KALIMAT ARAB DENGAN HARAKAT LENGKAP]

Format jawaban:
1. Tarjamah harfiyah ke Indonesia
2. I'rab setiap kata — sebut: jenis kata, kedudukan (marfu'/manshub/majrur/majzum), tanda i'rab
3. Kaidah nahwu yang berlaku
4. Bait Alfiyah relate (kalau ingat — jangan dipaksa kalau gak yakin)
5. Apakah ada wajh i'rab lain yang mungkin?

[LEVEL_BAHASA]`,
        },
        {
          title: "Peta Hubungan Bab Nahwu",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS], belajar [MADDAH]. [GAYA_BELAJAR].

Aku ingin big picture hubungan antar bab Nahwu. Buatkan peta:
- Mubtada wa Khabar
- Fi'il wa Fa'il & Naib Fa'il
- Manshubat (Maf'ul bih, Hal, Tamyiz, Mustatsna, Munada, dll)
- Majrurat (Idhafah & Jarr bil Harf)
- Naskh ('Awamil yang ubah hukum mubtada-khabar)
- Tawabi' (Na'at, 'Athaf, Taukid, Badal)

Untuk setiap bab: definisi singkat, bab fondasi, bab yang dibangun darinya.

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Drill Matan Alfiyah/Ajurrumiyyah",
          targetAI: "notebooklm",
          template: `Aku [TINGKATAN] di [FAKULTAS]. Sudah upload matan [NAMA KITAB - Ajurrumiyyah/Alfiyah]. Bantu drill hafalan sesi tasmi':

1. Sebut potongan matan acak (1 kalimat atau 1 bait), tulis Arab dengan harakat
2. Aku akan lanjutkan
3. Kalau ragu, beri 3 huruf pertama isyarah
4. Setelah 10 putaran, daftar bagian yang perlu murajaah

Fokus drill: [BAB SPESIFIK kalau ada]

[LEVEL_BAHASA]`,
        },
        {
          title: "Mnemonic Kaidah Sulit",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS], belajar [MADDAH]. [GAYA_BELAJAR].

Kesulitan hafal kaidah:

[TULIS KAIDAH NAHWU YANG SULIT]

Buatkan:
1. Mnemonic Indonesia mudah diingat
2. Mnemonic Arab (qa'idah lafzhiyyah) kalau ada masyhur
3. Trik visual atau cerita pendek
4. Bait Alfiyah yang relate (sertakan harakat)

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "10 Soal I'rab Bertingkat",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Drill [MADDAH].

Beri 10 kalimat Arab berharakat untuk di-i'rab, bertingkat:
- 1-3: Jumlah ismiyyah/fi'liyyah basit
- 4-6: Mengandung shibhul jumlah, hal, tamyiz
- 7-9: Naskh atau idhafah berlapis
- 10: Kalimat panjang multi-kaidah

Tulis semua dengan harakat. JANGAN kasih jawaban dulu. Setelah aku jawab, koreksi per nomor.

[LEVEL_BAHASA]`,
        },
        {
          title: "Tashrif Acak",
          targetAI: "chatgpt",
          template: `Aku [TINGKATAN] di [FAKULTAS], drill [MADDAH]. [GAYA_BELAJAR].

Beri 10 fi'il madhi 3 huruf acak untuk aku tashrif lengkap (madhi, mudhari', amr, fa'il, maf'ul, dll).

Tulis fi'il dengan harakat. Setelah aku jawab semua, koreksi + 1 referensi kitab sharaf untuk latihan lanjut.

[LEVEL_BAHASA]`,
        },
        {
          title: "Bedah Ibarah Kitab Nahwu",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Ini paragraf dari kitab nahwu klasik:

[PASTE TEKS ARAB DARI KITAB]

Analisis bertahap: tarjamah harfiyah, tarjamah ma'nawiyyah, syarah istilah teknis, maksud inti penulis, bab nahwu apa yang dibahas.

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Tahriri Nahwu",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, drill persiapan ujian Tahriri untuk [MADDAH].

Beri 5 soal gaya khas imtihan Azhari. Topik fokus: [BAB - kalau ada]

Tulis dalam Bahasa Arab. Setelah aku jawab, koreksi + model answer ideal.

[LEVEL_BAHASA]`,
        },
        {
          title: "Mock Syafawi Nahwu",
          targetAI: "chatgpt",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, latihan ujian Syafawi [MADDAH]. [GAYA_BELAJAR].

Bertindaklah sebagai dosen Azhar. 5 pertanyaan bertahap: definisi bab, perbedaan istilah, beri contoh kalimat, i'rab kalimat, hubungan dengan bab lain.

Topik: [BAB - kalau ada]. Tunggu jawabanku tiap pertanyaan. Evaluasi di akhir.

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Review Pasca Talaqqi Nahwu",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar. Baru talaqqi tentang bab [BAB] dari kitab [NAMA KITAB].

Materi yang dibahas syaikh:

[PASTE CATATAN ATAU POIN-POIN]

Tolong: susun ulang sistematis, tambahkan kaidah Arab original berharakat, beri 2-3 contoh kalimat tambahan, sebut pertanyaan untuk sesi berikutnya.

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Catatan Talaqqi Nahwu yang Ambigu",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Catatan dari talaqqi [MADDAH] yang sebagiannya ambigu:

[PASTE CATATAN MEMBINGUNGKAN]

Tolong: interpretasi berdasarkan konteks nahwu, lengkapi yang kurang, kemungkinan tafsir kalau ambigu, sebut bab nahwu yang dibahas.

[LEVEL_BAHASA]`,
        },
      ],
      eksplorasi: [
        {
          title: "Khilaf Nahwiyyin",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, [GAYA_BELAJAR]. Eksplorasi khilaf nahwiyyin tentang:

[MASALAH NAHWU - mis. 'amal harf jarr ma'iyyah, status idhafah lafzhiyyah, dll]

Tolong jelaskan:
1. Pendapat Bashriyyin (tokoh: Sibawaih, Khalil)
2. Pendapat Kufiyyin (tokoh: Kisa'i, Farra')
3. Dalil masing-masing — sertakan teks Arab
4. Pendapat ulama mutaakhirin (Ibnu Malik, Ibnu Hisyam) — condong ke mana

Jangan men-tarjih.

[LEVEL_BAHASA]`,
        },
        {
          title: "Aplikasi Nahwu di Tafsir",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS], [GAYA_BELAJAR]. Lihat aplikasi Nahwu dalam Tafsir Qur'an.

Pilih 3 ayat dengan khilaf nahwu yang ubah makna. Untuk setiap ayat: tulis ayat berharakat, jelaskan 2+ kemungkinan i'rab, bagaimana i'rab ubah tafsir/makna.

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  {
    id: "ushul-fiqh",
    name: "Ushul Fiqh",
    nameArabic: "أصول الفقه",
    category: "fiqhi",
    fakultas: ["ushuluddin", "syariah", "dirasat"],
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
          title: "Pahami Kaidah Ushul",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, [GAYA_BELAJAR]. Sedang muthala'ah [MADDAH].

Aku ingin memahami kaidah ushul: [KAIDAH - mis. "Al-amru lil-wujub", "An-nahyu lit-tahrim", "Mafhum Mukhalafah", dll]

Tolong jelaskan:
1. Teks kaidah dalam Arab berharakat
2. Tarjamah & makna inti
3. Dalil kaidah (dari ayat, hadits, ijma', atau qiyas)
4. Aplikasi praktis — beri 2-3 contoh ke masalah fiqh
5. Khilaf ulama tentang kaidah ini (kalau ada)
6. Pengecualian (mustatsnayat)

[LEVEL_BAHASA]

Sertakan teks Arab original untuk semua kaidah dan istilah teknis.`,
        },
        {
          title: "Bedakan Istilah Ushul",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Aku bingung membedakan: [ISTILAH 1] vs [ISTILAH 2]
(mis. 'Illah vs Hikmah, Manthuq vs Mafhum, Mujmal vs Muqayyad, Naskh vs Takhshish)

Tolong jelaskan: definisi masing-masing dengan teks Arab, letak perbedaan substansial, 2-3 contoh konkret, implikasi praktis.

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Dalalat",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan 4 dalalat utama menurut Jumhur: Dalalah 'Ibarat, Isyarah, Nash, Iqtidha'. Untuk tiap dalalah: teks Arab berharakat, definisi, 1 contoh dari ayat/hadits, beda dengan dalalah lain. Lalu jelaskan beda klasifikasi Hanafi.

[LEVEL_BAHASA]`,
        },
        {
          title: "Mashadir Tasyri' Lengkap",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Ringkasan komprehensif Mashadir Tasyri'. Untuk tiap sumber: definisi dengan teks Arab, dalil, posisi madzhab, aplikasi praktis.

Mashadir Muttafaq: Al-Qur'an, As-Sunnah, Al-Ijma', Al-Qiyas. Mashadir Mukhtalaf: Istihsan, Mashalih Mursalah, Sadd Az-Zarai', 'Urf, Madzhab Sahabi, Syar'u Man Qablana, Istishhab.

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Drill Matan Al-Waraqat",
          targetAI: "notebooklm",
          template: `Aku [TINGKATAN] di [FAKULTAS]. Sudah upload matan Al-Waraqat. Drill hafalan sesi tasmi':

1. Sebut potongan acak (1-2 kalimat), tulis berharakat
2. Aku lanjutkan
3. Kalau ragu, beri 3 huruf isyarah
4. Setelah 10 putaran, daftar bagian yang perlu murajaah

Fokus: [BAB SPESIFIK kalau ada]

[LEVEL_BAHASA]`,
        },
        {
          title: "Mnemonic Kaidah Ushul",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS], belajar [MADDAH]. [GAYA_BELAJAR].

Susah hafal kaidah ushul berikut:

[TULIS KAIDAH]

Buatkan: mnemonic Indonesia, mnemonic Arab kalau ada masyhur, trik visual/story pendek, bait nazham kalau ada.

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Soal Aplikasi Kaidah Ushul",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], drill [MADDAH]. [GAYA_BELAJAR].

Beri 10 kasus fiqh, aku akan identifikasi kaidah ushul yang relate. JANGAN kasih jawaban dulu. Setelah aku jawab semua, koreksi + jelaskan reasoning.

[LEVEL_BAHASA]`,
        },
        {
          title: "Bedah Teks Kitab Ushul",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Paragraf dari kitab ushul klasik:

[PASTE TEKS ARAB - sebutkan kitabnya]

Analisis: tarjamah harfiyah, ma'nawiyyah, syarah istilah teknis, maksud inti penulis, madzhab apa yang dianut penulis.

[LEVEL_BAHASA]`,
        },
        {
          title: "Identifikasi 'Illah Hukum",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], drill [MADDAH]. [GAYA_BELAJAR].

Beri 5 ayat/hadits yang punya hukum syar'i jelas. Aku akan: identifikasi hukum, identifikasi 'illah, bedakan 'illah dari hikmah, jelaskan apakah bisa diqiyas-kan.

Tulis ayat/hadits berharakat. Setelah aku jawab, koreksi + analisis ushuli yang benar.

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Tahriri Ushul Fiqh",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, drill ujian Tahriri [MADDAH].

5 soal gaya khas imtihan Azhari. Topik: [BAB - kalau ada]

Tulis Arab. Setelah aku jawab, koreksi + model answer ideal.

[LEVEL_BAHASA]`,
        },
        {
          title: "Mock Syafawi Ushul",
          targetAI: "chatgpt",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, latihan Syafawi [MADDAH]. [GAYA_BELAJAR].

Bertindaklah sebagai dosen Azhar. 5 pertanyaan: definisi, beda istilah, dalil kaidah, aplikasi praktis (kasus), khilaf madzhab.

Topik: [BAB - kalau ada]. Tunggu jawab tiap pertanyaan. Evaluasi di akhir.

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Review Pasca Talaqqi Ushul",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar. Baru talaqqi tentang [BAB USHUL] dari kitab [NAMA KITAB].

Materi syaikh:

[PASTE CATATAN]

Tolong: susun ulang sistematis, tambah kaidah Arab original berharakat, 2-3 contoh aplikasi tambahan, pertanyaan untuk sesi berikutnya.

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Catatan Talaqqi Ushul Ambigu",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Catatan talaqqi [MADDAH] yang ambigu:

[PASTE CATATAN]

Bantu: interpretasi berdasarkan konteks ushul, lengkapi yang kurang, kemungkinan tafsir kalau ambigu, identifikasi bab ushul.

[LEVEL_BAHASA]`,
        },
      ],
      eksplorasi: [
        {
          title: "Khilaf Ushuliyyin",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, [GAYA_BELAJAR]. Eksplorasi khilaf tentang:

[MASALAH USHUL]

Jelaskan: pendapat Jumhur, pendapat madzhab lain, dalil masing-masing (teks Arab dari ayat/hadits/dalil aqli), thamarat al-khilaf (konsekuensi praktis).

Jangan men-tarjih.

[LEVEL_BAHASA]`,
        },
        {
          title: "Aplikasi Ushul di Fiqh Kontemporer",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 3 contoh aplikasi kaidah ushul di nawazil (masalah kontemporer): identifikasi masalah, kaidah ushul yang dipakai, bagaimana ulama kontemporer mengaplikasikan, pendapat lembaga fatwa.

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  /* ============================================================
     BATCH 1 — QURANI & HADITSI (11 Maddah)
     ============================================================ */

  {
    id: "quran-tahfidz",
    name: "Al-Qur'an (Tahfidz & Tilawah)",
    nameArabic: "القرآن الكريم",
    category: "qurani",
    fakultas: ["ushuluddin", "dirasat", "quran"],
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
          title: "Identifikasi Mutasyabihat Lafzhi",
          targetAI: "notebooklm",
          template: `Aku [TINGKATAN] di [FAKULTAS]. Sedang murajaah [SURAH / JUZ].

Bantu aku identifikasi ayat-ayat mutasyabihat lafzhi (lafal sangat mirip tapi berbeda) di dalam surah/juz ini.

Untuk setiap pasangan mutasyabihat:
1. Tulis kedua ayat berharakat
2. Sebutkan surah dan nomor ayat masing-masing
3. Letak perbedaannya (kata apa, posisi mana)
4. Tips mengingat perbedaannya

[LEVEL_BAHASA]

Prioritaskan ayat yang paling sering tertukar berdasarkan pola umum hafizh.`,
        },
        {
          title: "Hikmah dan Kandungan Surah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS], [GAYA_BELAJAR]. Sedang menghafal [NAMA SURAH].

Supaya hafalan lebih hidup, aku ingin tahu kandungan surah ini lebih dalam:
1. Tema utama dan benang merah surah
2. Keutamaan surah ini (dari hadits shahih — sertakan teks Arab hadits)
3. 3 ayat yang paling penting beserta pelajarannya
4. Hubungan nama surah dengan isinya

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Tafsir Ringkas Ayat Hafalan",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS]. Sedang menghafal [SURAH/JUZ], [GAYA_BELAJAR].

Untuk ayat-ayat berikut:

[PASTE AYAT-AYAT YANG SEDANG DIHAFAL]

Beri tafsir ringkas setiap ayat (2-3 baris) — cukup untuk memahami makna tanpa terlalu panjang. Minta format yang mudah dilihat:
- Ayat (berharakat)
- Terjemah singkat
- Makna inti (1 kalimat)

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Sesi Tasmi' Acak",
          targetAI: "notebooklm",
          template: `Aku [TINGKATAN] di [FAKULTAS]. Murajaah [SURAH/JUZ].

Sesi tasmi':
1. Sebut potongan ayat acak (1-3 ayat) dari rentang yang aku tentukan, tulis berharakat
2. Aku lanjutkan sampai akhir ayat
3. Kalau aku ragu, beri 3 kata pertama sebagai isyarah
4. Setelah 10 putaran, buat daftar yang perlu diperkuat

Target review hari ini: [SEBUTKAN SURAH/HALAMAN MUSHAF]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Jadwal Murajaah Spaced Repetition",
          targetAI: "chatgpt",
          template: `Aku [TINGKATAN] di [FAKULTAS]. Total hafalan: [JUMLAH JUZ/SURAH]. Target murajaah: khatam tiap [X HARI].

Buatkan jadwal murajaah harian dalam tabel dengan metode spaced repetition:
- Hafalan lama (sudah kuat): review 1x setiap 7 hari
- Hafalan menengah: review 1x setiap 3 hari
- Hafalan baru (3 bulan terakhir): review harian

Format tabel: Hari | Hafalan yang diulang | Estimasi waktu | Catatan

Tambahkan: tips waktu murajaah terbaik (ba'da Fajr, Tahajjud, dll).

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Mutasyabihat Alfazh",
          targetAI: "notebooklm",
          template: `Aku [TINGKATAN] di [FAKULTAS]. Ingin drill khusus mutasyabihat lafzhi di [SURAH/JUZ].

Format drill:
1. Sebut potongan ayat yang punya pasangan mutasyabihat — berhenti sebelum bagian yang berbeda
2. Aku lengkapi
3. Langsung koreksi kalau salah, beri penjelasan singkat bedanya
4. Ulangi sampai konsisten benar 3x berturut-turut

Fokus pada: [SURAH/KELOMPOK MUTASYABIHAT SPESIFIK kalau ada]

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Simulasi Tasmi' Resmi",
          targetAI: "notebooklm",
          template: `Aku [TINGKATAN] di [FAKULTAS]. Persiapan tasmi' resmi untuk [JUMLAH JUZ/SURAH].

Simulasikan sesi tasmi' seperti ujian:
1. Acak surah/juz dari rentang hafalan yang aku sebutkan
2. Baca potongan awal, aku lanjutkan sampai kamu minta berhenti (1-2 halaman)
3. Tandai kalau aku salah (tulis koreksi)
4. Hitung: berapa kali salah per halaman
5. Beri penilaian akhir: siap tasmi' atau perlu murajaah ulang di bagian mana

Rentang hafalan: [SEBUTKAN JUZ/SURAH]

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Catat Koreksi Talaqqi Hafalan",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS]. Baru selesai tasmi' dengan syaikh/guru. Ini koreksi yang diberikan:

[PASTE CATATAN KOREKSI - mis. "Surah Al-Baqarah ayat 45 harusnya ... bukan ...", dll]

Tolong:
1. Susun koreksi dalam format yang mudah dihapalkan
2. Kelompokkan per surah/juz
3. Untuk tiap koreksi: tulis versi yang benar dengan harakat
4. Buat daftar prioritas: mana yang paling rawan terulang

[LEVEL_BAHASA]`,
        },
      ],
      eksplorasi: [
        {
          title: "Keutamaan dan Fadhilah Surah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS], [GAYA_BELAJAR]. Ingin tahu fadhilah menghafal Al-Qur'an secara umum dan khusus untuk [SURAH/JUZ].

Tolong jelaskan:
1. Dalil keutamaan menghafal Al-Qur'an (ayat + hadits shahih, sertakan teks Arab berharakat)
2. Keutamaan khusus surah [NAMA SURAH] kalau ada hadits shahih
3. Adab hamalatul Qur'an menurut Imam Nawawi dalam At-Tibyan
4. Nasihat ulama untuk menjaga hafalan jangka panjang

[LEVEL_BAHASA]

Kalau ada hadits yang derajatnya diperselisihkan, sebutkan secara jujur.`,
        },
      ],
    },
  },

  {
    id: "tajwid",
    name: "Tajwid",
    nameArabic: "التجويد",
    category: "qurani",
    fakultas: ["ushuluddin", "dirasat", "quran"],
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
          title: "Pahami Hukum Nun Mati & Tanwin",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS], [GAYA_BELAJAR]. Sedang belajar [MADDAH].

Aku ingin memahami hukum nun mati (نْ) dan tanwin bertemu huruf hijaiyah:

Tolong jelaskan 4 hukum dengan lengkap:
1. Izhhar — definisi, huruf-hurufnya (tulis Arab berharakat), contoh dari Qur'an
2. Idgham — klasifikasi (ma'al ghunnah & bila ghunnah), huruf-hurufnya, contoh dari Qur'an
3. Iqlab — definisi, huruf pemicunya, contoh dari Qur'an
4. Ikhfa' — definisi, huruf-hurufnya, perbedaan dengan ikhfa' syafawi, contoh

Untuk setiap hukum, sertakan:
- Teks Arab matan Tuhfatul Athfal yang berkaitan (berharakat) kalau ingat
- 2-3 contoh kata dari Al-Qur'an

[LEVEL_BAHASA]

CATATAN: AI bantu teori. Untuk cara baca yang benar, talaqqi langsung dengan guru.`,
        },
        {
          title: "Pahami Hukum Mad",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan klasifikasi Mad secara lengkap:

Mad Asli (Thabi'i) — definisi dan ukuran (harakat)
Mad Far'i — klasifikasi dan ukuran masing-masing:
- Mad Wajib Muttashil & Jaiz Munfashil
- Mad 'Aridh lil Sukun & Mad Lin
- Mad Lazim (Kilmi & Harfi — Mutsaqqal & Mukhaffaf)
- Mad Badal, Mad Tamkin, Mad Shilah

Untuk tiap mad: definisi singkat, ukuran harakat, 1-2 contoh dari Qur'an (tulis kata berharakat).

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Sifat Huruf (Teori)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan sifat-sifat huruf hijaiyah secara teori:

1. Sifat yang punya lawan (7 pasang): Jahr-Hams, Syiddah-Rakhawah, Isti'la'-Istifal, Itbaq-Infitah, Idzlaq-Ishmat, Qalqalah, Lin
2. Sifat yang tidak punya lawan: Shafir, Tafasysyi, Istithalah, Inhiraf, Takrir, dll

Untuk setiap sifat:
- Definisi singkat
- Huruf-huruf yang memiliki sifat ini
- Pengaruh sifat terhadap cara baca

[LEVEL_BAHASA]

CATATAN: Teori ini perlu dipraktikkan langsung dengan guru yang bersanad.`,
        },
      ],
      hafal: [
        {
          title: "Drill Matan Tuhfatul Athfal",
          targetAI: "notebooklm",
          template: `Aku [TINGKATAN] di [FAKULTAS]. Sedang menghafal matan Tuhfatul Athfal karya Sulaiman Al-Jamzuri.

Sesi drill hafalan:
1. Sebut potongan nazham acak (1-2 bait), tulis Arab berharakat
2. Aku lanjutkan
3. Beri isyarah 3 huruf pertama kalau ragu
4. Setelah 10 putaran, daftar bait yang perlu diperkuat

Fokus bab: [NAMA BAB kalau ada — mis. Bab Nun Mati, Bab Mad]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Identifikasi Hukum Tajwid dari Teks",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS], drill [MADDAH]. [GAYA_BELAJAR].

Ini potongan ayat Al-Qur'an:

[PASTE AYAT DENGAN HARAKAT]

Tolong:
1. Identifikasi semua hukum tajwid yang ada dalam ayat ini
2. Tandai posisi hukum dalam teks (mis. "kata ke-3: hukum ikhfa' karena...")
3. Sebutkan kategori dan alasan setiap hukum
4. Hukum mana yang paling sering salah dibaca orang

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Analisis Mad",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS], drill [MADDAH]. [GAYA_BELAJAR].

Beri 10 kata dari Al-Qur'an yang mengandung hukum mad. Aku akan identifikasi jenis mad dan ukurannya.

Format tiap kata: tulis berharakat, sebutkan surah-ayat asal. JANGAN kasih jawaban dulu.

Setelah aku jawab semua, koreksi per nomor + jelaskan reasoning.

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Soal Tajwid Teori",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS] di Al-Azhar, persiapan ujian teori [MADDAH].

Beri 10 soal teori tajwid gaya Azhari:
- Definisi istilah (mis. "Apa yang dimaksud Qalqalah?")
- Sebutkan huruf-huruf (mis. "Sebutkan huruf-huruf Ikhfa'!")
- Identifikasi hukum dari contoh kata
- Lengkapi bait nazham (dari Tuhfatul Athfal)
- Bandingkan dua hukum (mis. "Beda Idgham ma'al Ghunnah dan Bila Ghunnah!")

Tulis soal dalam bahasa Arab. Setelah aku jawab, koreksi + model answer.

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Review Catatan Talaqqi Tajwid",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS]. Baru talaqqi tajwid dengan guru tentang [BAB/HUKUM].

Catatan dari sesi:

[PASTE CATATAN]

Tolong:
1. Susun ulang jadi sistematik
2. Tambahkan teks Arab nazham yang berkaitan (berharakat)
3. Beri 3-4 contoh kata tambahan dari Qur'an untuk memperjelas
4. Tandai bagian mana yang perlu konfirmasi langsung ke guru

[LEVEL_BAHASA]

CATATAN: tajwid praktis (cara baca) tetap butuh koreksi langsung dari guru.`,
        },
      ],
      eksplorasi: [
        {
          title: "Kaitan Tajwid dengan I'jaz Qur'an",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS], [GAYA_BELAJAR]. Belajar [MADDAH].

Aku ingin memahami hubungan antara tajwid dan i'jaz Al-Qur'an dari sisi sawti (fonologi):

1. Bagaimana kaidah tajwid mencerminkan keindahan bunyi Al-Qur'an
2. Peran qalqalah, ghunnah, dan mad dalam estetika tilawah
3. Pendapat ulama tentang hukum membaca Al-Qur'an tanpa tajwid
4. Perbedaan tajwid sebagai fardhu 'ain vs fardhu kifayah

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
          title: "Kumpulkan Ayat Satu Tema",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, [GAYA_BELAJAR]. Sedang muthala'ah [MADDAH].

Aku ingin mengerjakan tafsir maudhu'i tentang tema:

[SEBUTKAN TEMA - mis. "Konsep Taqwa", "Orang-orang yang beruntung", "Alam semesta sebagai tanda Allah", dll]

Langkah 1 — Kumpulkan ayat:
1. Sebutkan 10-15 ayat utama yang membahas tema ini dari berbagai surah
2. Tulis setiap ayat berharakat dengan surah dan nomor
3. Kelompokkan berdasarkan aspek tema (mis. definisi, ciri-ciri, ganjaran, dll)
4. Identifikasi mana yang makki dan mana yang madani

[LEVEL_BAHASA]

Sebagai panduan awal — verifikasi mandiri ke Mu'jam Al-Mufahras.`,
        },
        {
          title: "Susun Outline Tafsir Tematik",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Aku ingin menyusun outline tafsir maudhu'i tentang: [TEMA]

Berdasarkan ayat-ayat yang sudah dikumpulkan:

[PASTE DAFTAR AYAT YANG SUDAH DIKUMPULKAN]

Bantu susun outline:
1. Pembagian bab/aspek tema yang logis
2. Urutan pembahasan yang tepat (dari umum ke khusus, atau kronologis)
3. Poin-poin yang harus ada di setiap bab
4. Kesimpulan apa yang bisa ditarik dari kumpulan ayat ini

[LEVEL_BAHASA]`,
        },
        {
          title: "Beda Tafsir Maudhu'i vs Tahlili",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan perbedaan substansial antara tafsir maudhu'i dan tafsir tahlili:

1. Definisi masing-masing dengan teks Arab istilahnya
2. Langkah-langkah (manhaj) masing-masing
3. Kelebihan dan kekurangan masing-masing
4. Kapan sebaiknya pakai tahlili, kapan pakai maudhu'i
5. Contoh konkret: bagaimana ayat "innama ya'ksyallaha min 'ibadihil 'ulama'" ditafsirkan dengan cara tahlili vs cara maudhu'i

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Langkah-Langkah Tafsir Maudhu'i",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Perlu hafal metodologi tafsir maudhu'i menurut Al-Farmawi.

Al-Farmawi menetapkan 7 langkah tafsir maudhu'i. Jelaskan setiap langkah dengan:
1. Teks Arab istilah langkah tersebut
2. Penjelasan singkat dalam Indonesia
3. Contoh aplikasi singkat

Lalu buatkan mnemonic atau akronim Indonesia untuk membantu hafal urutan 7 langkah ini.

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Ayat-Ayat Kunci Per Tema",
          targetAI: "notebooklm",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Sudah upload kumpulan ayat-ayat tematik.

Drill hafalan ayat-ayat kunci untuk tema [TEMA]:
1. Sebut nama tema atau aspek tertentu
2. Aku sebutkan ayat yang paling relevan (teks + surah-nomor)
3. Kalau ada yang terlewat, ingatkan
4. Setelah 10 putaran tema, beri ringkasan distribusi ayat per aspek

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Analisis Perkembangan Tema dalam Qur'an",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Ini kumpulan ayat tentang tema [TEMA], sudah dibedakan makki-madani:

Makki: [DAFTAR AYAT]
Madani: [DAFTAR AYAT]

Analisis perkembangan tema:
1. Bagaimana tema diperkenalkan di fase Makkah
2. Bagaimana tema berkembang di fase Madinah
3. Apakah ada pergeseran penekanan atau dimensi baru
4. Apa yang bisa disimpulkan tentang hikmah perkembangan bertahap ini

[LEVEL_BAHASA]`,
        },
        {
          title: "Bandingkan Tafsir Tematik Dua Ulama",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], drill [MADDAH]. [GAYA_BELAJAR].

Tema: [TEMA TAFSIR MAUDHU'I]

Bandingkan bagaimana dua mufassir yang menggunakan pendekatan maudhu'i membahas tema ini:
- Ulama 1: [mis. Sayyid Quthb dalam Fi Zhilalil Qur'an]
- Ulama 2: [mis. Wahbah Az-Zuhaili dalam At-Tafsir Al-Munir]

Sertakan kutipan Arab dari masing-masing (bila memungkinkan). Apa kesamaan dan perbedaan kesimpulan mereka?

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Tahriri Tafsir Maudhu'i",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, persiapan ujian Tahriri [MADDAH].

Beri 5 soal gaya Azhari:
- "Bayan manhaj at-tafsir al-maudhu'i wa khuthuatuh" (jelaskan manhaj)
- "Qarin bayna at-tafsir at-tahlili wal-maudhu'i" (komparasi)
- "Tatbiq manhaj at-tafsir al-maudhu'i 'ala maudhu'..." (aplikasi tema)
- "Adhkur aqsam at-tafsir al-maudhu'i" (sebutkan jenis tafsir maudhu'i)
- "Ma ahamm mu'allafat al-tafsir al-maudhu'i?" (kitab-kitab penting)

Tulis Arab. Setelah aku jawab, koreksi + model answer.

[LEVEL_BAHASA]`,
        },
        {
          title: "Mock Syafawi Tafsir Maudhu'i",
          targetAI: "chatgpt",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, latihan Syafawi [MADDAH]. [GAYA_BELAJAR].

Bertindaklah sebagai dosen Azhar. 5 pertanyaan bertahap tentang tafsir maudhu'i: definisi & sejarah, langkah-langkah Al-Farmawi, beda dengan tahlili, contoh aplikasi (aku diminta terapkan ke satu tema), tokoh dan kitab penting.

Evaluasi di akhir.

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Review Pasca Talaqqi Tafsir Maudhu'i",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar. Baru talaqqi tentang metodologi [MADDAH] dari kitab [NAMA KITAB].

Catatan:

[PASTE CATATAN]

Tolong: susun ulang sistematis, tambahkan teks Arab definisi/langkah berharakat, beri contoh tema tambahan yang bisa diterapkan metodenya, pertanyaan untuk sesi berikutnya.

[LEVEL_BAHASA]`,
        },
      ],
      eksplorasi: [
        {
          title: "Jenis-Jenis Tafsir Maudhu'i",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Ulama membagi tafsir maudhu'i menjadi dua jenis:
1. Tafsir maudhu'i surah (tafsir satu surah secara tematik)
2. Tafsir maudhu'i lintas-Qur'an (kumpulkan ayat satu tema dari seluruh Qur'an)

Jelaskan:
- Karakteristik dan langkah masing-masing jenis
- Tokoh ulama dan kitab contoh masing-masing
- Kelebihan dan kelemahan masing-masing
- Perkembangan metode ini di era kontemporer

[LEVEL_BAHASA]`,
        },
        {
          title: "Kritis: Batasan dan Kritik Tafsir Maudhu'i",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, [GAYA_BELAJAR]. Eksplorasi kritis terhadap [MADDAH].

Ada beberapa kritik terhadap pendekatan tafsir maudhu'i. Jelaskan:
1. Apa kritik utama yang diarahkan kepada metode ini (mis. memaksakan tema pada teks)
2. Bagaimana para pembelanya merespons kritik tersebut
3. Bagaimana memastikan tafsir maudhu'i tidak keluar dari kaidah tafsir yang benar

Jangan men-tarjih. Sajikan berbagai perspektif.

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
    fakultas: ["ushuluddin", "dirasat", "quran"],
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
          title: "Pahami Asbabun Nuzul",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Aku ingin memahami ilmu Asbabun Nuzul secara komprehensif:

1. Definisi Asbabun Nuzul dengan teks Arab berharakat
2. Perbedaan antara Sabab Nuzul dan I'lam Mujjarrad (turun ayat bukan karena sebab)
3. Kaidah: "al-'ibrah bi 'umumil lafdhi la bi khushushis sabab" — jelaskan dan beri contoh
4. Faedah mempelajari Asbabun Nuzul dalam tafsir (minimal 4 faedah)
5. Cara mengetahui Asbabun Nuzul yang shahih — kaidah ulama hadits
6. Contoh: ayat yang punya 1 sabab nuzul, dan ayat yang punya beberapa riwayat sabab

[LEVEL_BAHASA]

Sertakan teks Arab untuk definisi dan kaidah utama.`,
        },
        {
          title: "Pahami Nasikh-Mansukh",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan ilmu Nasikh wal Mansukh secara komprehensif:
1. Definisi naskh, nasikh, mansukh (teks Arab berharakat)
2. Rukun naskh
3. Jenis-jenis naskh: naskh Al-Qur'an dengan Al-Qur'an, Qur'an dengan Sunnah, dan sebaliknya
4. Khilaf ulama: apakah naskh ada dalam Qur'an? Pendapat yang menolak (As-Suyuthi dan lainnya) vs yang mengakui
5. Contoh konkret: 1 ayat yang dinaskh beserta dalil nasikh-nya

[LEVEL_BAHASA]

Jangan men-tarjih dalam masalah khilafnya.`,
        },
        {
          title: "Pahami Makki dan Madani",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan ilmu Makki wal Madani:
1. Definisi — khilaf ulama tentang cara mendefinisikan (tempat vs waktu nuzul)
2. Ciri-ciri umum surah/ayat Makkiyah (tema, uslub, panjang ayat, dll)
3. Ciri-ciri umum surah/ayat Madaniyah
4. Cara mengetahui Makki-Madani (sima'i vs qiyasi)
5. Manfaat ilmu ini dalam tafsir — beri 2 contoh konkret
6. Surah yang masih diperdebatkan Makki atau Madani — beri 1 contoh

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami I'jazul Qur'an",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan konsep I'jazul Qur'an:
1. Definisi i'jaz dan tahhaddi (tantangan) — teks Arab berharakat
2. Aspek-aspek i'jaz: i'jaz balaghiy, 'ilmi, tasyri'i, ghaibi
3. Pendapat ulama tentang wajh i'jaz yang paling kuat
4. Dalil tentang tantangan (tahhaddi) kepada manusia — ayat-ayat terkait berharakat
5. Hubungan i'jaz dengan keyakinan kita pada kesahihan Al-Qur'an

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Drill Definisi Istilah 'Ulum Al-Qur'an",
          targetAI: "notebooklm",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Upload materi 'Ulum Al-Qur'an dari kitab [NAMA KITAB].

Drill definisi istilah:
1. Sebut nama istilah dalam Arab
2. Aku jelaskan definisinya
3. Koreksi kalau kurang tepat, sertakan definisi akurat dari kitab
4. Setelah 10 istilah, beri yang perlu diperkuat

Fokus: [BAB/CABANG ULUMUL QUR'AN - mis. asbabun nuzul, nasikh-mansukh]

[LEVEL_BAHASA]`,
        },
        {
          title: "Mnemonic Jenis-Jenis Ilmu dalam 'Ulum Al-Qur'an",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Perlu hafal cabang-cabang utama 'Ulum Al-Qur'an.

As-Suyuthi dalam Al-Itqan menyebutkan banyak cabang. Tolong:
1. Daftar 10-12 cabang paling penting dengan nama Arab berharakat
2. Fungsi singkat masing-masing dalam tafsir (1 kalimat)
3. Buatkan mnemonic atau peta visual pengelompokan cabang-cabang ini

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Identifikasi Unsur 'Ulum Al-Qur'an dalam Tafsir",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], drill [MADDAH]. [GAYA_BELAJAR].

Ini kutipan dari kitab tafsir:

[PASTE KUTIPAN TAFSIR]

Identifikasi:
1. Cabang 'ulumul Qur'an apa yang digunakan mufassir di sini
2. Istilah teknis 'ulum Al-Qur'an yang muncul
3. Bagaimana pemahaman tentang cabang ilmu ini mempengaruhi tafsir

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Bedah Isnad Riwayat Tafsir",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], belajar [MADDAH]. [GAYA_BELAJAR].

Ini riwayat tentang asbabun nuzul atau tafsir:

[PASTE RIWAYAT DALAM ARAB]

Analisis dari sudut 'ulumul Qur'an:
1. Apa jenis riwayat ini? (asbabun nuzul / tafsir bil ma'tsur / israiliyyat / dll)
2. Bagaimana cara menilai keshahihannya?
3. Bagaimana pengaruh riwayat ini pada pemahaman ayat

[LEVEL_BAHASA]`,
        },
        {
          title: "Analisis Muhkam dan Mutasyabih",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], belajar [MADDAH]. [GAYA_BELAJAR].

Jelaskan ilmu Muhkam wal Mutasyabih:
1. Definisi keduanya (teks Arab berharakat)
2. Perbedaan dengan mutasyabih lafzhi (dalam tahfizh)
3. Ayat Al-Imran:7 tentang muhkam-mutasyabih — dua tafsiran "ar-rasikhun fil 'ilm" (waqf atau washol)
4. Contoh 3 ayat mutasyabih dan bagaimana ulama memahaminya
5. Manhaj Asy'ariyyah dalam menghadapi ayat-ayat mutasyabihat sifat

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Tahriri 'Ulum Al-Qur'an",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, persiapan ujian Tahriri [MADDAH].

Beri 5 soal gaya Azhari: definisi cabang ilmu, jelaskan faedah praktisnya, contoh penerapan, khilaf ulama, identifikasi jenis riwayat.

Topik: [CABANG ULUMUL QUR'AN - kalau ada]

Tulis Arab. Koreksi setelah aku jawab.

[LEVEL_BAHASA]`,
        },
        {
          title: "Mock Syafawi 'Ulum Al-Qur'an",
          targetAI: "chatgpt",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, latihan Syafawi [MADDAH]. [GAYA_BELAJAR].

Bertindaklah sebagai dosen Azhar. 5 pertanyaan: definisi cabang ilmu, contoh, manfaat dalam tafsir, khilaf ulama, aplikasi ke teks Qur'an.

Topik: [CABANG ULUMUL QUR'AN]. Evaluasi di akhir.

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Review Pasca Talaqqi 'Ulum Al-Qur'an",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Baru talaqqi tentang [TOPIK] dari kitab [NAMA KITAB].

Catatan:

[PASTE CATATAN]

Tolong: susun sistematis, tambahkan definisi Arab berharakat, beri 2-3 contoh aplikasi tambahan, pertanyaan untuk sesi berikutnya.

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Catatan Talaqqi yang Ambigu",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Catatan talaqqi [MADDAH] yang ambigu:

[PASTE CATATAN]

Interpretasi berdasarkan konteks 'ulumul Qur'an, lengkapi yang kurang, identifikasi cabang ilmu yang dibahas.

[LEVEL_BAHASA]`,
        },
      ],
      eksplorasi: [
        {
          title: "Khilaf tentang Naskh dalam Qur'an",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, [GAYA_BELAJAR]. Eksplorasi khilaf tentang keberadaan nasikh-mansukh dalam Al-Qur'an.

Jelaskan:
1. Pendapat jumhur yang menerima keberadaan naskh — dalil-dalil mereka
2. Pendapat yang mengecilkan jumlah kasus naskh (mis. As-Suyuthi)
3. Pendapat kontemporer yang skeptis terhadap naskh — argumen dan dalilnya
4. Dampak khilaf ini terhadap tafsir ayat-ayat yang diklaim mansukh

Jangan men-tarjih.

[LEVEL_BAHASA]`,
        },
        {
          title: "I'jaz Al-Qur'an dari Sudut Balaghah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Eksplorasi i'jaz balaghi Qur'an.

Pilih 2-3 ayat yang ulama anggap sebagai puncak keindahan balaghah. Untuk setiap ayat:
1. Tulis ayat berharakat
2. Jelaskan uslub balaghah yang ada (isti'arah, kinayah, asalub khabar-insya', dll)
3. Bagaimana keindahan ini melampaui kemampuan manusia menurut ulama balaghah

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
          title: "Pahami Pembagian Manhaj Tafsir",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan pembagian manhaj tafsir secara komprehensif:

1. Tafsir bil Ma'tsur — definisi, sumber-sumbernya, tokoh & kitab representatif, kelebihan & kelemahan
2. Tafsir bir Ra'yi Al-Mahmud — definisi, ciri, contoh
3. Tafsir bir Ra'yi Al-Madzmum — definisi, kenapa dicela, contoh
4. Sub-manhaj: fiqhi, sufi (isyari), 'ilmi, adabi-ijtima'i — masing-masing: ciri, tokoh, kitab

Sertakan teks Arab untuk definisi utama.

[LEVEL_BAHASA]`,
        },
        {
          title: "Ciri Khas Mufassir Tertentu",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan manhaj dan ciri khas mufassir berikut:

[PILIH MUFASSIR - mis. Imam Ath-Thabari / Ibnu Katsir / Az-Zamakhsyari / Fakhruddin Ar-Razi / Sayyid Quthb / Az-Zuhaili]

Untuk mufassir yang dipilih:
1. Nama lengkap, masa hidup, madzhab aqidah dan fiqh
2. Kitab tafsirnya
3. Manhaj yang digunakan — bukti dari ciri-ciri kitabnya
4. Keunggulan dan kelemahan kritik ulama terhadap tafsirnya
5. Contoh 1 tafsir ayat yang mencerminkan manhajnya

[LEVEL_BAHASA]`,
        },
        {
          title: "Tafsir bil Ma'tsur: Sumber dan Klasifikasi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan sumber-sumber tafsir bil ma'tsur secara bertingkat:
1. Tafsir Al-Qur'an dengan Al-Qur'an — contoh konkret
2. Tafsir Al-Qur'an dengan As-Sunnah — contoh
3. Tafsir Al-Qur'an dengan Aqwal Sahabah — status hukumnya (khilaf ulama)
4. Tafsir Al-Qur'an dengan Aqwal Tabi'in — status hukumnya
5. Israiliyyat — definisi, klasifikasi (yang diterima/ditolak/didiamkan), kaidah menanggapinya

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Drill Tokoh dan Kitab per Manhaj",
          targetAI: "notebooklm",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Perlu hafal tokoh-tokoh mufassir dan manhajnya.

Drill:
1. Sebut nama mufassir
2. Aku jawab: manhaj, kitab, ciri khas
3. Koreksi kalau ada yang salah
4. Setelah 10 putaran, beri ringkasan mana yang perlu diperkuat

[LEVEL_BAHASA]`,
        },
        {
          title: "Mnemonic Pembagian Manhaj Tafsir",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Perlu hafal pembagian-pembagian manhaj tafsir.

Buatkan:
1. Diagram/peta pembagian manhaj tafsir yang mudah diingat
2. Akronim atau mnemonic Indonesia untuk hafal pembagian utama
3. Kunci membedakan antar manhaj dalam 1-2 kata kunci per manhaj

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Identifikasi Manhaj dari Kutipan Tafsir",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], drill [MADDAH]. [GAYA_BELAJAR].

Beri 5 kutipan tafsir dari berbagai mufassir. Aku akan identifikasi:
- Manhaj tafsir yang digunakan
- Mufassir atau kitab yang mungkin (kalau bisa ditebak)
- Ciri-ciri apa yang menunjukkan manhaj tersebut

Format: tulis Arab berharakat + konteks ayat. JANGAN kasih jawaban dulu.

[LEVEL_BAHASA]`,
        },
        {
          title: "Bandingkan Tafsir Satu Ayat dari 3 Manhaj",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], belajar [MADDAH]. [GAYA_BELAJAR].

Ayat: [TULIS AYAT BERHARAKAT]

Analisis bagaimana ayat ini ditafsirkan oleh 3 manhaj berbeda:
1. Mufassir bil ma'tsur (mis. Ibnu Katsir)
2. Mufassir fiqhi (mis. Al-Qurthubi)
3. Mufassir adabi-ijtima'i (mis. Sayyid Quthb)

Sertakan kutipan Arab dari tiap kitab. Apa perbedaan penekanan masing-masing?

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Tahriri Manahij Al-Mufassirin",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, persiapan ujian Tahriri [MADDAH].

Beri 5 soal Azhari: definisi manhaj, sebut ciri-ciri manhaj tertentu, identifikasi manhaj dari kutipan, banding 2 manhaj, kritik tafsir bir ra'yi madzmum.

Tulis Arab. Koreksi setelah aku jawab.

[LEVEL_BAHASA]`,
        },
        {
          title: "Mock Syafawi Manahij Al-Mufassirin",
          targetAI: "chatgpt",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, latihan Syafawi [MADDAH]. [GAYA_BELAJAR].

Bertindaklah sebagai dosen Azhar. 5 pertanyaan: definisi & klasifikasi manhaj, ciri mufassir tertentu, beda bil ma'tsur dan bir ra'yi, identifikasi manhaj dari kutipan (kasih aku kutipan), kritik konstruktif terhadap salah satu manhaj.

Evaluasi di akhir.

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Review Pasca Talaqqi Manahij Al-Mufassirin",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Baru talaqqi tentang [TOPIK MANHAJ] dari kitab [NAMA KITAB].

Catatan:

[PASTE CATATAN]

Tolong: susun sistematis, tambahkan definisi Arab berharakat, contoh kutipan tafsir tambahan yang mencerminkan manhaj, pertanyaan untuk sesi berikutnya.

[LEVEL_BAHASA]`,
        },
      ],
      eksplorasi: [
        {
          title: "Tafsir 'Ilmi: Pendapat dan Kontroversi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Eksplorasi manhaj tafsir 'ilmi.

Jelaskan:
1. Definisi tafsir 'ilmi dan tokoh-tokohnya
2. Argumen pendukung: kenapa pendekatan ini valid
3. Kritik ulama: kenapa sebagian menolak atau membatasinya
4. Contoh: 1 ayat yang ditafsirkan secara 'ilmi — analisis apakah penafsirannya solid atau berlebihan

Jangan men-tarjih.

[LEVEL_BAHASA]`,
        },
        {
          title: "Tafsir Sufi Isyari: Antara Ilham dan Penafsiran",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Eksplorasi tafsir sufi isyari.

Jelaskan:
1. Definisi tafsir isyari dan bedanya dengan makna zahir
2. Syarat diterimanya tafsir isyari menurut para ulama
3. Tokoh: Ibnu 'Arabi, Abdul Qadir Al-Jailani — contoh tafsir isyari mereka
4. Khilaf ulama: mana batas antara ilham dan pemaksaan makna

Jangan men-tarjih.

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
          title: "Pahami 7 Imam Qira'at dan Perawinya",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri tabel lengkap 7 imam qira'at sab'ah:
- Nama imam (Arab berharakat + transliterasi)
- Kota/negeri
- 2 perawi masing-masing
- Ciri khas umum qira'at imam tersebut (1 baris)

Lalu jelaskan: apa bedanya qira'at sab'ah, 'asyr, dan qira'at syadzdzah? Apa kriteria qira'at diterima sebagai mutawatir?

[LEVEL_BAHASA]

CATATAN: qira'at praktis wajib dengan guru bersanad — AI bantu teori.`,
        },
        {
          title: "Pahami Perbedaan Ushul Qira'at",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan beberapa ushul qira'at yang paling penting — perbedaan kaidah umum antar qira'at sab'ah:

1. Perbedaan dalam hukum nun mati (mis. idgham, izhhar antar imam)
2. Perbedaan dalam mad (mis. qadr mad munfashil)
3. Perbedaan dalam hamzah (tahqiq, tashil, ibdal)
4. Perbedaan dalam imalah

Untuk setiap ushul: sebutkan imam mana yang menggunakannya, contoh kata dari Qur'an.

[LEVEL_BAHASA]`,
        },
        {
          title: "Hikmah Adanya Perbedaan Qira'at",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan hikmah dan faedah keberadaan perbedaan qira'at:
1. Perspektif ulama tentang mengapa Allah izinkan berbagai qira'at
2. Bagaimana perbedaan qira'at kadang memperluas makna (beri 2 contoh konkret dari Qur'an)
3. Hadits tentang tujuh huruf (sab'atu ahruf) — kaitannya dengan qira'at
4. Peran qira'at dalam khazanah balaghah dan tafsir

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Drill Matan Syathibiyyah",
          targetAI: "notebooklm",
          template: `Aku [TINGKATAN] di [FAKULTAS]. Sedang menghafal matan Syathibiyyah (Hirzul Amani).

Sesi drill:
1. Sebut potongan nazham acak (1-2 bait), tulis Arab berharakat
2. Aku lanjutkan
3. Beri isyarah 3 huruf pertama kalau aku ragu
4. Setelah 10 putaran, daftar yang perlu diperkuat

Fokus bab: [NAMA BAB kalau ada]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Identifikasi Qira'at dari Contoh",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS], drill [MADDAH]. [GAYA_BELAJAR].

Beri 5 contoh kata dari Al-Qur'an yang berbeda bacaannya antar qira'at sab'ah. Aku akan identifikasi:
- Imam mana yang membaca dengan cara apa
- Termasuk ushul atau farsy

JANGAN kasih jawaban dulu. Format tiap soal: tulis kata berharakat + surah-ayat.

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Memahami Beit Syathibiyyah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS], belajar [MADDAH]. [GAYA_BELAJAR].

Ini bait-bait dari matan Syathibiyyah:

[PASTE BAIT-BAIT SYATHIBIYYAH - tulis berharakat]

Tolong:
1. Tarjamah bait ke Indonesia
2. Istilah-istilah teknis yang ada (ramuz/isyarat untuk imam/perawi)
3. Kaidah qira'at yang sedang dijelaskan bait ini
4. Contoh kata dari Qur'an yang termasuk kaidah ini

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Soal Teori Qira'at",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS] di Al-Azhar, persiapan ujian teori [MADDAH].

Beri 8 soal teori: sebutkan 7 imam qira'at, definisi ushul vs farsy, sebutkan perawi imam tertentu, identifikasi qira'at dari ciri, kaidah perbedaan qira'at tertentu, hubungan qira'at dengan tafsir.

Tulis Arab. Koreksi setelah aku jawab.

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Review Pasca Talaqqi Qira'at",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS]. Baru talaqqi qira'at dengan guru tentang [USHUL/SURAH/BAB].

Catatan:

[PASTE CATATAN]

Tolong: susun ulang sistematis, tambahkan bait nazham Syathibiyyah yang berkaitan berharakat, contoh kata Qur'an tambahan, pertanyaan untuk sesi berikutnya.

CATATAN: qira'at praktis tetap ambil dari guru bersanad.

[LEVEL_BAHASA]`,
        },
      ],
      eksplorasi: [
        {
          title: "Qira'at dan Pengaruhnya pada Tafsir",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS], [GAYA_BELAJAR]. Eksplorasi hubungan qira'at dengan tafsir.

Cari 3 ayat yang perbedaan qira'at antar imam berpengaruh pada makna/tafsir. Untuk setiap ayat:
1. Tulis ayat berharakat
2. Sebutkan 2 qira'at yang berbeda dengan pelaksana masing-masing
3. Bagaimana setiap qira'at memberikan nuansa makna berbeda
4. Bagaimana mufassir membahas keduanya

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
    fakultas: ["ushuluddin", "dirasat"],
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
          title: "Analisis Sanad Hadits",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, [GAYA_BELAJAR]. Sedang muthala'ah [MADDAH].

Ini sanad hadits:

[PASTE SANAD - mis. "حدثنا فلان عن فلان عن فلان عن النبي ﷺ"]

Tolong analisis:
1. Identifikasi setiap perawi dalam sanad (nama lengkap, tabaqat)
2. Status setiap perawi (tsiqah/dha'if/maqbul/dll) berdasarkan ilmu rijal
3. Jenis sanad: muttashil / mursal / munqathi' / mu'dhal / dll
4. Apakah ada 'illah (cacat tersembunyi) yang mungkin
5. Kesimpulan: derajat hadits ini

PENTING: Verifikasi ke kitab rijal (Mizan Al-I'tidal, Tahdzib At-Tahdzib) — AI bisa salah untuk perawi kurang terkenal.

[LEVEL_BAHASA]`,
        },
        {
          title: "Syarah Hadits dari Dua Syurrah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Ini matan hadits:

[PASTE MATAN HADITS BERHARAKAT]

Bandingkan syarah dua syurrah:
1. Syarah Ibnu Hajar dalam Fathul Bari — penekanan apa, poin apa yang disorot
2. Syarah Imam Nawawi dalam Syarh Muslim — penekanan apa
3. Istinbat hukum dari masing-masing
4. Di mana ada perbedaan pendapat antara keduanya
5. Kata-kata teknis hadits yang perlu dijelaskan (isnad, matan, gharib, dll)

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Istinbat Hukum dari Hadits",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Hadits ini:

[PASTE HADITS BERHARAKAT]

Jelaskan istinbat hukum:
1. Hukum-hukum apa yang bisa diambil dari hadits ini (fiqh hadits)
2. Apakah ada khilaf fuqaha dalam memahami hadits ini — pendapat masing-masing
3. Hubungan hadits ini dengan ayat Al-Qur'an yang terkait
4. Posisi hadits ini dalam bab fiqh tertentu

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Gharibul Hadits",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Ini matan hadits dengan kata-kata yang kurang familiar:

[PASTE MATAN HADITS BERHARAKAT]

Untuk setiap kata yang mungkin gharib (asing):
1. Akar kata Arab
2. Makna literal
3. Makna yang dimaksud dalam konteks hadits
4. Bagaimana syurrah menjelaskan kata ini (mis. Ibnu Hajar, Nawawi, Ibnu Atsir dalam An-Nihayah)

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Drill Matan Hadits Arba'in",
          targetAI: "notebooklm",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Sedang menghafal Arba'in Nawawi.

Sesi drill:
1. Sebut nomor hadits acak
2. Aku recite matan hadits tersebut dari awal
3. Beri koreksi kalau ada yang salah
4. Setelah 10 putaran, beri daftar hadits yang perlu diperkuat

Tambahan: kalau aku minta, jelaskan pelajaran utama dari hadits tersebut.

[LEVEL_BAHASA]`,
        },
        {
          title: "Jadwal Hafalan & Murajaah Hadits",
          targetAI: "chatgpt",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Target hafal [JUMLAH] hadits dari kitab [NAMA KITAB] dalam [WAKTU].

Buatkan jadwal hafalan dengan spaced repetition:
- Hafalan baru per hari: [JUMLAH]
- Murajaah dengan interval: 1, 3, 7, 14, 21 hari

Format tabel. Tambahkan tips efektif menghafal matan hadits Arab.

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Analisis Hadits Lengkap",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], drill [MADDAH]. [GAYA_BELAJAR].

Ini hadits dengan sanad dan matan:

[PASTE HADITS LENGKAP DENGAN SANAD]

Latihan analisis tahlili lengkap:
1. Struktur sanad (riwayah 'an mani riwayah)
2. Status perawi kunci
3. Derajat hadits
4. Syarah matan
5. Istinbat hukum

Koreksi analisisku setelah aku jawab. Sertakan rujukan ke kitab syarah.

[LEVEL_BAHASA]`,
        },
        {
          title: "Bedah Paragraf Kitab Syarah Hadits",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Ini paragraf dari kitab syarah hadits (sebutkan kitabnya):

[PASTE TEKS ARAB]

Analisis:
1. Tarjamah harfiyah
2. Tarjamah ma'nawiyyah
3. Istilah teknis (sanad/matan/illah/dll) — Arab + transliterasi + definisi
4. Manhaj syarih dalam paragraf ini
5. Kesimpulan yang diambil syarih

[LEVEL_BAHASA]`,
        },
        {
          title: "Mukhtaliful Hadits: Hadits yang Tampak Bertentangan",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], belajar [MADDAH]. [GAYA_BELAJAR].

Dua hadits ini tampak bertentangan:

Hadits 1: [PASTE HADITS 1 BERHARAKAT]
Hadits 2: [PASTE HADITS 2 BERHARAKAT]

Jelaskan cara ulama menyelesaikan kontradiksi ini:
1. Metode jam'u wat taufiq (menggabungkan keduanya)
2. Metode naskh (kalau ada bukti kronologi)
3. Tarjih (mana yang lebih kuat — berdasar apa)
4. Pendapat ulama muhadditsin tentang dua hadits ini

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Tahriri Hadits Tahlili",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, persiapan ujian Tahriri [MADDAH].

Beri 5 soal Azhari: analisis sanad, syarah matan, identifikasi istilah hadits, istinbat hukum, mukhtaliful hadits.

Tulis Arab. Koreksi setelah aku jawab.

[LEVEL_BAHASA]`,
        },
        {
          title: "Mock Syafawi Hadits Tahlili",
          targetAI: "chatgpt",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, latihan Syafawi [MADDAH]. [GAYA_BELAJAR].

Bertindaklah sebagai dosen Azhar. 5 pertanyaan bertahap: komponen hadits, analisis sanad (kasih aku sanad), syarah matan (kasih aku hadits), istinbat hukum, mukhtaliful hadits.

Tunggu jawab tiap pertanyaan. Evaluasi di akhir.

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Review Pasca Talaqqi Hadits Tahlili",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar. Baru talaqqi tentang hadits [NOMOR/TEMA] dari kitab [NAMA KITAB].

Catatan:

[PASTE CATATAN]

Tolong: susun ulang sistematis (sanad → matan → syarah → istinbat), tambahkan teks Arab berharakat, pertanyaan untuk sesi berikutnya.

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Catatan Talaqqi yang Ambigu",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Catatan talaqqi [MADDAH] yang ambigu:

[PASTE CATATAN]

Interpretasi berdasarkan konteks ilmu hadits, lengkapi yang kurang, identifikasi istilah teknis.

[LEVEL_BAHASA]`,
        },
      ],
      eksplorasi: [
        {
          title: "Kritik Matan Hadits: Standar dan Metodologi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, [GAYA_BELAJAR]. Eksplorasi kritik matan hadits.

Jelaskan metodologi ulama dalam kritik matan:
1. Kaidah-kaidah kritik matan menurut muhaddits klasik (Ibnu Al-Jawzi, Ibnu Hibban)
2. Kriteria hadits yang matannya bermasalah (munkar, mawdhu', dll)
3. Perbedaan pendekatan muhaddits dengan pendekatan orientalis dalam kritik matan
4. Contoh: 1 hadits yang diperdebatkan dari sudut matan

Jangan men-tarjih untuk hadits yang masih diperdebatkan.

[LEVEL_BAHASA]`,
        },
        {
          title: "Perkembangan Metodologi Syarah Hadits",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Eksplorasi perkembangan syarah hadits.

Bandingkan metodologi syarah hadits dari era ke era:
1. Syarah era mutaqaddimin (Ibnu Bathal, Al-Khaththabi)
2. Syarah era mutaakhirin (Ibnu Hajar, Imam Nawawi, Az-Zurqani)
3. Syarah era kontemporer (Albani, Ibn Baz — dalam syarah berbeda)
4. Tren dan perkembangan baru dalam ulumul hadits

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
          title: "Kumpulkan Hadits Satu Tema",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Aku ingin mengerjakan hadits maudhu'i tentang tema:

[SEBUTKAN TEMA - mis. "Keutamaan Ilmu", "Adab Bertetangga", "Tanda-tanda Hari Kiamat", dll]

Langkah 1:
1. Kumpulkan 8-12 hadits yang membahas tema ini
2. Tulis tiap hadits: teks Arab berharakat + terjemah + periwayat + derajat
3. Kelompokkan berdasarkan sub-aspek tema
4. Tandai mana yang paling sering dikutip ulama

PENTING: Verifikasi mandiri ke kitab hadits — sertakan keterangan kalau ada hadits yang derajatnya perlu dikonfirmasi.

[LEVEL_BAHASA]`,
        },
        {
          title: "Analisis Mukhtaliful Hadits dalam Satu Tema",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Tema: [TEMA]

Dua hadits ini dalam tema yang sama tapi tampak bertentangan:

Hadits 1: [PASTE HADITS 1]
Hadits 2: [PASTE HADITS 2]

Jelaskan metode penyelesaian khilaf hadits:
1. Jam'u wa taufiq (gabungkan keduanya — mana yang memungkinkan)
2. Naskh (mana yang lebih awal/akhir — kalau bisa diketahui)
3. Tarjih (mana yang lebih kuat dari sudut sanad/konteks)
4. Pendapat ulama hadits dan fiqh yang membahas ini

[LEVEL_BAHASA]`,
        },
        {
          title: "Susun Outline Hadits Maudhu'i",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Aku sudah kumpulkan hadits-hadits tentang tema [TEMA]:

[PASTE DAFTAR HADITS]

Bantu susun outline pembahasan tematik:
1. Pembagian sub-bab yang logis
2. Urutan pembahasan (dari pondasi ke detail)
3. Hadits mana yang paling tepat untuk tiap sub-bab
4. Kesimpulan apa yang bisa ditarik dari kumpulan hadits ini

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Drill Hadits Pilihan per Tema",
          targetAI: "notebooklm",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Menghafal hadits-hadits pilihan tema [TEMA] dari kitab [NAMA KITAB].

Sesi drill:
1. Sebut sub-tema atau nomor bab
2. Aku recite hadits representatif untuk tema tersebut
3. Koreksi kalau ada yang salah
4. Setelah 10 putaran, beri ringkasan yang perlu diperkuat

[LEVEL_BAHASA]`,
        },
        {
          title: "Mnemonic untuk Mengelompokkan Hadits Tema",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Perlu hafal pengelompokan hadits dalam tema [TEMA].

Ada [X] hadits yang perlu aku kelompokkan dalam sub-bab:

[PASTE DAFTAR HADITS ATAU SUB-BAB]

Buatkan cara mengingat pengelompokan ini — akronim, peta visual, atau urutan logis yang mudah diingat.

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Klasifikasi Hadits ke Sub-Tema",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], drill [MADDAH]. [GAYA_BELAJAR].

Tema besar: [TEMA]

Beri 8 hadits acak yang berkaitan. Aku akan klasifikasikan ke sub-tema yang tepat.

Sub-tema yang ada: [DAFTAR SUB-TEMA]

Format tiap hadits: teks Arab berharakat + terjemah. JANGAN kasih jawaban dulu. Koreksi setelah aku jawab.

[LEVEL_BAHASA]`,
        },
        {
          title: "Bedah Kitab Hadits Tematik",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], belajar [MADDAH]. [GAYA_BELAJAR].

Paragraf dari kitab hadits tematik (mis. Riyadhus Shalihin):

[PASTE TEKS - sebutkan kitab & bab]

Analisis:
1. Tema dan sub-tema yang dibahas
2. Hadits-hadits yang dikumpulkan — apakah ada pola?
3. Bagaimana penulis memilih dan menyusun hadits-hadits ini
4. Istinbat pelajaran dari kumpulan hadits ini

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Tahriri Hadits Maudhu'i",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, persiapan ujian Tahriri [MADDAH].

Beri 5 soal Azhari tentang metodologi hadits maudhu'i: langkah-langkah, cara menangani mukhtaliful hadits, contoh penerapan tema, perbedaan dengan hadits tahlili, tokoh dan kitab.

Tulis Arab. Koreksi setelah aku jawab.

[LEVEL_BAHASA]`,
        },
        {
          title: "Mock Syafawi Hadits Maudhu'i",
          targetAI: "chatgpt",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, latihan Syafawi [MADDAH]. [GAYA_BELAJAR].

Bertindaklah sebagai dosen Azhar. 5 pertanyaan: definisi & langkah hadits maudhu'i, cara tangani mukhtaliful hadits, kasih tema (aku sebutkan hadits-haditsnya), perbedaan dengan tahlili, contoh kitab tematik klasik.

Evaluasi di akhir.

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Review Pasca Talaqqi Hadits Maudhu'i",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Baru talaqqi tentang tema [TEMA HADITS] dari kitab [NAMA KITAB].

Catatan:

[PASTE CATATAN]

Tolong: susun ulang sistematis, tambahkan teks Arab hadits berharakat, beri hadits tambahan yang relevan untuk memperdalam, pertanyaan untuk sesi berikutnya.

[LEVEL_BAHASA]`,
        },
      ],
      eksplorasi: [
        {
          title: "Riyadhus Shalihin sebagai Model Hadits Maudhu'i",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Eksplorasi Riyadhus Shalihin sebagai model kitab hadits tematik.

Analisis:
1. Manhaj Imam Nawawi dalam menyusun Riyadhus Shalihin — prinsip penyeleksian dan pengelompokan
2. Kenapa beliau kadang mencantumkan ayat Al-Qur'an sebelum hadits-hadits
3. Posisi kitab ini dibanding kitab hadits tematik lain (At-Targhib wal Tarhib, Al-Adabul Mufrad)
4. Bagaimana kitab ini bisa dipakai dalam kajian hadits maudhu'i

[LEVEL_BAHASA]`,
        },
        {
          title: "Hadits tentang Akhir Zaman: Metodologi Pemahaman",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Eksplorasi hadits maudhu'i tema akhir zaman.

Tema: hadits-hadits tentang [PILIH SATU: "Dajjal" / "Turunnya Nabi Isa" / "Imam Mahdi" / dll]

Metodologi yang benar dalam memahami hadits tema ini:
1. Kumpulkan hadits shahih yang berkaitan — sebutkan sumbernya
2. Bagaimana cara memahami hadits-hadits ini (tekstual vs kontekstual)
3. Khilaf ulama dalam menafsirkan hadits ini
4. Sikap yang benar: antara mengimani dan tidak berlebihan dalam detail

Jangan men-tarjih penafsiran.

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
    fakultas: ["ushuluddin", "dirasat", "syariah"],
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
          title: "Pahami Klasifikasi Hadits Shahih",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan hadits shahih secara komprehensif:
1. Definisi dengan teks Arab berharakat (dari Nukhbatul Fikar atau Taysir Mustholah)
2. 5 syarat hadits shahih — jelaskan masing-masing
3. Perbedaan shahih lidzatihi dan shahih lighairihi
4. Perbedaan shahih Bukhari vs shahih Muslim
5. Contoh 2 hadits shahih dari koleksi berbeda

[LEVEL_BAHASA]`,
        },
        {
          title: "Bedakan Klasifikasi Hadits Dha'if",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, [GAYA_BELAJAR]. Sedang muthala'ah [MADDAH].

Aku sering bingung membedakan jenis-jenis hadits dha'if:

[SEBUTKAN JENIS YANG MAU DIBEDAKAN - mis. Mursal vs Munqathi' vs Mu'dhal vs Mu'allaq]

Tolong jelaskan:
1. Definisi masing-masing dengan teks Arab istilahnya (berharakat)
2. Letak terputusnya sanad untuk tiap jenis (gambarkan posisinya)
3. Contoh konkret untuk tiap jenis
4. Apakah ada perbedaan hukum mengamalkannya
5. Pendapat ulama tentang kehujjahan masing-masing

[LEVEL_BAHASA]

Sertakan teks Arab untuk istilah teknis. Sebut rujukan dari Nukhbatul Fikar atau Taysir Mustholah kalau relevan.`,
        },
        {
          title: "Pahami Ilmu Rijal dan Jarh Ta'dil",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan ilmu Rijal wal Jarh wat Ta'dil:
1. Definisi ilmu rijal — mengapa penting
2. Tingkatan ta'dil (ta'dif) dan jarh — dari yang tertinggi ke terendah (sertakan ungkapan Arab tiap tingkat)
3. Kaidah: kalau ada ta'dil dan jarh pada seorang perawi, mana yang didahulukan dan kapan?
4. Kitab-kitab rijal utama: Mizan Al-I'tidal (Adz-Dzahabi), Tahdzib At-Tahdzib (Ibnu Hajar)
5. Contoh: cara membaca biografi perawi dari kitab rijal

[LEVEL_BAHASA]`,
        },
        {
          title: "Istilah-Istilah Khusus dalam Mustholah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan istilah-istilah mustholah yang sering membingungkan:

Kelompok 1 — tentang sanad: Muttashil, Musnad, Marfu', Mawquf, Maqthu'
Kelompok 2 — tentang perawi: Tsiqah, Shaduq, Layyinul Hadits, Dha'if, Mathruk, Kadzdzab
Kelompok 3 — tentang jumlah perawi: Mutawatir, Ahad, Aziz, Gharib, Masyhur

Untuk setiap istilah: teks Arab berharakat, definisi singkat, contoh.

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Drill Matan Al-Baiquniyyah",
          targetAI: "notebooklm",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Menghafal matan Al-Baiquniyyah (34 bait).

Sesi drill tasmi':
1. Sebut nomor bait atau nama jenis hadits
2. Aku recite bait terkait berharakat
3. Koreksi kalau salah
4. Setelah 10 putaran, daftar yang perlu diperkuat

Fokus: [BAB/JENIS HADITS kalau ada]

[LEVEL_BAHASA]`,
        },
        {
          title: "Mnemonic Klasifikasi Hadits",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Perlu hafal klasifikasi lengkap hadits dalam [MADDAH].

Buatkan:
1. Peta/pohon klasifikasi hadits dari shahih sampai mawdhu'
2. Mnemonic atau akronim Indonesia untuk hafal tingkatan-tingkatan kualitas
3. Trik membedakan 5 istilah yang paling sering tertukar

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Klasifikasi Hadits Nyata",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], drill [MADDAH]. [GAYA_BELAJAR].

Beri 8 hadits dengan sanad-nya (hadits nyata dari kitab hadits). Aku akan klasifikasikan:
- Jenis hadits berdasarkan sanad
- Alasan pengklasifikasian

Format: tulis hadits berharakat + sanadnya. JANGAN kasih jawaban dulu.

Setelah aku jawab, koreksi dengan kunci + referensi kitab rijal.

[LEVEL_BAHASA]

CATATAN: verifikasi ke kitab asli selalu penting.`,
        },
        {
          title: "Bedah Muqaddimah Kitab Hadits",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], belajar [MADDAH]. [GAYA_BELAJAR].

Ini kutipan dari muqaddimah kitab hadits:

[PASTE KUTIPAN - sebutkan kitab]

Identifikasi:
1. Istilah-istilah mustholah yang muncul (Arab berharakat + definisi)
2. Manhaj muhadditsin dalam muqaddimah ini (syarat shahih, cara rijal, dll)
3. Bagaimana muqaddimah ini membantu memahami manhaj seluruh kitab

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Membaca Biografi Perawi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], drill [MADDAH]. [GAYA_BELAJAR].

Ini biografi perawi dari kitab rijal (mis. Tahdzib At-Tahdzib):

[PASTE BIOGRAFI PERAWI]

Analisis:
1. Nama lengkap dan kunyah perawi
2. Tabaqat (generasi: sahabat/tabi'in/dll)
3. Status jarh ta'dil — apa yang disebut ulama, dan tingkat keyakinannya
4. Bagaimana status perawi ini mempengaruhi nilai sanad yang ia ada di dalamnya

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Tahriri Mustholah Hadits",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, persiapan ujian Tahriri [MADDAH].

Beri 5 soal gaya Azhari: definisi istilah, klasifikasi jenis hadits, penjelasan syarat hadits shahih, beda dua istilah mirip, identifikasi jenis sanad.

Tulis Arab. Koreksi setelah aku jawab.

[LEVEL_BAHASA]`,
        },
        {
          title: "Mock Syafawi Mustholah Hadits",
          targetAI: "chatgpt",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, latihan Syafawi [MADDAH]. [GAYA_BELAJAR].

Bertindaklah sebagai dosen Azhar. 5 pertanyaan bertahap: definisi & klasifikasi hadits, syarat shahih, beda dua istilah (kasih aku dua istilah), cara baca kitab rijal, kehujjahan hadits dha'if dalam fadhail.

Evaluasi di akhir.

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Review Pasca Talaqqi Mustholah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Baru talaqqi tentang [BAB MUSTHOLAH] dari kitab [NAMA KITAB].

Catatan:

[PASTE CATATAN]

Tolong: susun ulang sistematis, tambahkan definisi Arab berharakat, beri 2-3 contoh hadits tambahan yang mencerminkan istilah/kaidah yang dipelajari, pertanyaan untuk sesi berikutnya.

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Catatan Talaqqi Mustholah yang Ambigu",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Catatan talaqqi [MADDAH] yang ambigu:

[PASTE CATATAN]

Interpretasi berdasarkan konteks mustholah hadits, lengkapi yang kurang, identifikasi istilah teknis, pertanyaan untuk klarifikasi dengan guru.

[LEVEL_BAHASA]`,
        },
      ],
      eksplorasi: [
        {
          title: "Kehujjahan Hadits Dha'if: Khilaf Ulama",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Eksplorasi khilaf tentang kehujjahan hadits dha'if.

Jelaskan:
1. Pendapat yang melarang mengamalkan hadits dha'if sama sekali
2. Pendapat yang membolehkan untuk fadhail 'amal dengan syarat-syarat tertentu
3. Syarat-syarat bolehnya mengamalkan hadits dha'if menurut yang membolehkan
4. Contoh konkret: hadits dha'if yang diamalkan sebagian ulama dan ditinggalkan yang lain

Jangan men-tarjih.

[LEVEL_BAHASA]`,
        },
        {
          title: "Perkembangan Ilmu Mustholah dari Masa ke Masa",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Eksplorasi sejarah perkembangan [MADDAH].

Jelaskan perkembangan ilmu mustholah hadits:
1. Fase Nabi dan Sahabat — bagaimana mereka menilai riwayat
2. Fase Tabi'in — awal terbentuknya kaidah
3. Fase kodifikasi (Imam Syafi'i, Ahmad, Ibnu Al-Madini)
4. Fase pematangan (Ibnu Shalah, Nawawi, Ibnu Hajar)
5. Perkembangan kontemporer — kajian ilmiah modern tentang mustholah

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
          title: "Komparasi Manhaj Bukhari dan Muslim",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Bandingkan manhaj Imam Bukhari (Shahih Al-Bukhari) dan Imam Muslim (Shahih Muslim):

1. Syarat shahih masing-masing — apa bedanya dalam hal mu'asyarah/liqa'?
2. Cara penyusunan bab (tarjamah bab Bukhari yang terkenal rumit vs Muslim)
3. Apakah keduanya menyertakan hadits yang sama? Berapa banyak?
4. Ciri khas cara keduanya menulis sanad
5. Mana yang lebih masyhur lebih shahih — dan kenapa ada debat ini?

[LEVEL_BAHASA]`,
        },
        {
          title: "Ciri Khas Manhaj Imam Hadits Tertentu",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan manhaj dan ciri khas:

[PILIH IMAM - mis. Imam Tirmidzi / Abu Dawud / Nasa'i / Ibnu Majah / Imam Ahmad dalam Al-Musnad]

Untuk imam yang dipilih:
1. Nama lengkap, masa, madzhab
2. Kitab utamanya
3. Syarat dalam memilih hadits
4. Ciri khusus kitabnya yang berbeda dari imam lain
5. Kritik ulama terhadap kitab ini (kalau ada)

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Muqaddimah Shahih Muslim",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Imam Muslim menulis muqaddimah penting di Shahih-nya. Jelaskan poin-poin utama muqaddimah ini:
1. Pembagian hadits menjadi 3 tingkat menurut Muslim
2. Kritik Muslim terhadap muhaddits tertentu — metodologi kritiknya
3. Pentingnya mu'asyarah (pertemuan) dalam sanad menurut Muslim
4. Bagaimana muqaddimah ini mencerminkan manhaj seluruh kitab

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Drill Ciri Khas 6 Imam Hadits",
          targetAI: "notebooklm",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Perlu hafal ciri khas manhaj 6 imam hadits (Kutub Sittah).

Sesi drill:
1. Sebut nama imam
2. Aku sebutkan: kitabnya, syarat utama, ciri khas manhaj
3. Koreksi kalau kurang tepat
4. Setelah 6 imam, beri ringkasan poin yang perlu diperkuat

[LEVEL_BAHASA]`,
        },
        {
          title: "Mnemonic Perbedaan Manhaj Imam Hadits",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Perlu hafal dan bedakan manhaj 6 imam hadits.

Buatkan tabel atau peta perbandingan yang mudah diingat:
- Kolom: nama imam, kitab, syarat, ciri khas, kelebihan
- Mnemonic untuk mengingat urutan Kutub Sittah

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Identifikasi Manhaj dari Kutipan Kitab Hadits",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], drill [MADDAH]. [GAYA_BELAJAR].

Beri 5 kutipan dari berbagai kitab hadits. Aku akan identifikasi:
- Dari kitab apa (imam siapa)
- Ciri-ciri manhaj apa yang terlihat dalam kutipan

Format: kutipan Arab berharakat + konteks. JANGAN kasih jawaban dulu.

[LEVEL_BAHASA]`,
        },
        {
          title: "Analisis Tarjamah Bab dalam Shahih Bukhari",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], belajar [MADDAH]. [GAYA_BELAJAR].

Imam Bukhari terkenal dengan "fiqh al-Bukhari fi tarajimih" (fiqh Bukhari tersembunyi dalam judul bab).

Ini tarjamah bab (judul bab):

[PASTE TARJAMAH BAB BUKHARI + HADITS DI BAWAHNYA]

Analisis:
1. Apa yang dimaksud Bukhari dengan judul bab ini
2. Bagaimana hadits yang dipilih berkaitan dengan judul bab
3. Fiqh apa yang Bukhari simpulkan dari hubungan judul dan hadits
4. Bagaimana Ibnu Hajar menjelaskan hal ini dalam Fathul Bari

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Tahriri Manahij Al-Muhadditsin",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, persiapan ujian Tahriri [MADDAH].

Beri 5 soal Azhari: beda manhaj Bukhari-Muslim, syarat shahih imam tertentu, identifikasi kitab dari ciri, ciri khas manhaj tematik vs sanad, tokoh dan karya mustholah.

Tulis Arab. Koreksi setelah aku jawab.

[LEVEL_BAHASA]`,
        },
        {
          title: "Mock Syafawi Manahij Al-Muhadditsin",
          targetAI: "chatgpt",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, latihan Syafawi [MADDAH]. [GAYA_BELAJAR].

Bertindaklah sebagai dosen Azhar. 5 pertanyaan: ciri khas imam tertentu, beda manhaj dua imam, kasih kutipan aku identifikasi, pengaruh manhaj terhadap derajat hadits.

Evaluasi di akhir.

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Review Pasca Talaqqi Manahij Al-Muhadditsin",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Baru talaqqi tentang manhaj [NAMA IMAM] dari kitab [NAMA KITAB].

Catatan:

[PASTE CATATAN]

Tolong: susun sistematis, tambahkan teks Arab dari muqaddimah/pernyataan imam berharakat, contoh konkret yang mencerminkan manhajnya, pertanyaan untuk sesi berikutnya.

[LEVEL_BAHASA]`,
        },
      ],
      eksplorasi: [
        {
          title: "Kritik Sanad: Perbedaan Metodologi Imam",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Eksplorasi perbedaan metodologi kritik sanad.

Imam Ahmad lebih keras dalam jarh; Tirmidzi lebih permisif. Jelaskan:
1. Apa yang menyebabkan perbedaan ketatnya kriteria antar imam
2. Contoh: perawi yang diterima satu imam tapi ditolak imam lain
3. Bagaimana perbedaan ini mempengaruhi corpus hadits masing-masing
4. Implikasi praktis: hadits yang shahih menurut Tirmidzi tapi dha'if menurut Bukhari

Jangan men-tarjih.

[LEVEL_BAHASA]`,
        },
        {
          title: "Hadits Ahad sebagai Hujjah: Debat Metodologis",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Eksplorasi khilaf kehujjahan hadits ahad.

Jelaskan:
1. Pendapat jumhur: hadits ahad bisa jadi hujjah dalam fiqh dan aqidah (dengan syarat shahih)
2. Pendapat sebagian mutakallimin: hadits ahad hanya untuk fiqh, tidak untuk aqidah
3. Dalil masing-masing pihak
4. Bagaimana imam-imam hadits berbeda dengan teolog dalam memandang isu ini

Jangan men-tarjih.

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
          title: "Pahami Metode-Metode Takhrij",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan 5 metode takhrij hadits dari kitab Mahmud Ath-Thahhan:
1. Via lafal pertama — contoh penggunaannya
2. Via kata-kata langka dalam matan
3. Via perawi atas (sahabat yang meriwayatkan)
4. Via tema/bab (maudhu')
5. Via sifat/status zahir hadits

Untuk tiap metode: kapan digunakan, alat bantu apa yang dipakai, contoh singkat.

[LEVEL_BAHASA]

CATATAN: Takhrij hasil AI wajib diverifikasi ke sumber primer.`,
        },
        {
          title: "Cara Membaca Kitab Takhrij",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan cara membaca kitab-kitab takhrij berikut:
1. Majma' Az-Zawaid (Al-Haitsami) — bagaimana strukturnya, cara baca penilaiannya
2. Tuhfatul Asyraf (Al-Mizzi) — cara mencari hadits di dalamnya
3. Nashbur Rayah (Az-Zailai) — fokus hadits fiqh Hanafi

Untuk tiap kitab: struktur umum, cara mencari hadits, kode/singkatan yang digunakan.

[LEVEL_BAHASA]`,
        },
        {
          title: "Evaluasi Derajat Hadits Setelah Takhrij",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Setelah menemukan hadits di sumbernya, bagaimana cara mengevaluasi derajatnya?

Jelaskan langkah-langkah:
1. Identifikasi semua jalur sanad
2. Periksa status setiap perawi (kembali ke kitab rijal)
3. Cari komentar ulama mutaqaddimin tentang hadits ini
4. Cari komentar ulama mutaakhirin (Ibnu Hajar, Nawawi, Albani)
5. Bagaimana menyimpulkan derajat ketika ada perbedaan penilaian

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Singkatan dan Rasm Kitab Takhrij",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Perlu hafal singkatan-singkatan yang digunakan dalam kitab-kitab takhrij dan rijal.

Buat daftar singkatan umum:
- Singkatan nama kitab (mis. خ untuk Bukhari, م untuk Muslim)
- Singkatan komentar rijal (mis. ث untuk tsiqah)
- Simbol khusus dalam Tuhfatul Asyraf dan Mizan

Buatkan tabel ringkas yang bisa dijadikan referensi cepat.

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Takhrij Hadits Tertentu",
          targetAI: "perplexity",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], latihan [MADDAH]. [GAYA_BELAJAR].

Aku ingin mentakhrij hadits berikut:

[PASTE MATAN HADITS BERHARAKAT]

Bantu aku:
1. Di kitab mana saja hadits ini diriwayatkan? (dengan nomor hadits kalau ada)
2. Siapa sahabat yang meriwayatkannya?
3. Apakah ada penilaian ulama tentang derajatnya?
4. Sertakan link sumber online terpercaya (dorar.net, sunnah.com) kalau ada

PENTING: Sebutkan kalau ada ketidakpastian — aku akan verifikasi manual ke kitab asli.

[LEVEL_BAHASA]`,
        },
        {
          title: "Analisis Jalur Sanad dari Hasil Takhrij",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], latihan [MADDAH]. [GAYA_BELAJAR].

Ini hadits yang sudah aku takhrij dan menemukan beberapa jalur sanad:

Jalur 1: [PASTE SANAD 1]
Jalur 2: [PASTE SANAD 2]
Jalur 3: [PASTE SANAD 3 kalau ada]

Analisis:
1. Apakah ada jalur yang saling menguatkan (syahid/mutabi')
2. Jalur mana yang paling kuat dari sisi rijal
3. Apakah ada di antara jalur yang membuat hadits dha'if naik ke shahih lighairihi

[LEVEL_BAHASA]

CATATAN: Verifikasi status perawi ke kitab rijal asli.`,
        },
      ],
      ujian: [
        {
          title: "Mock Soal Praktikum Takhrij",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, persiapan ujian praktikum [MADDAH].

Beri 5 soal latihan takhrij: sebutkan metode takhrij, identifikasi kitab yang tepat untuk mencari jenis hadits tertentu, jelaskan cara evaluasi derajat, baca singkatan dalam kutipan kitab rijal.

Tulis Arab. Koreksi setelah aku jawab.

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Review Pasca Talaqqi Takhrij",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Baru talaqqi tentang metode takhrij atau analisis sanad tertentu.

Catatan:

[PASTE CATATAN]

Tolong: susun ulang sistematis (metode → langkah → contoh), tambahkan istilah teknis Arab berharakat, pertanyaan untuk sesi berikutnya.

CATATAN: takhrij dan analisis sanad tetap perlu verifikasi ke sumber primer.

[LEVEL_BAHASA]`,
        },
      ],
      eksplorasi: [
        {
          title: "Otomatisasi Takhrij: Potensi dan Batasan",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Eksplorasi potensi dan batasan tools digital dalam [MADDAH].

Jelaskan:
1. Alat-alat digital takhrij yang ada (aplikasi, website) dan cara kerjanya
2. Apa yang bisa dilakukan dengan tools digital
3. Batasan yang tidak bisa diatasi tools digital (kenapa tetap perlu ahli)
4. Bagaimana ulama kontemporer memandang penggunaan teknologi dalam takhrij

[LEVEL_BAHASA]`,
        },
        {
          title: "Takhrij sebagai Disiplin Ilmu: Sejarah dan Perkembangan",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Eksplorasi sejarah ilmu [MADDAH].

Jelaskan perkembangan ilmu takhrij:
1. Kapan dan bagaimana ilmu takhrij mulai berkembang sebagai disiplin tersendiri
2. Kitab-kitab takhrij klasik — periode awal dan perkembangannya
3. Perbedaan gaya takhrij mutaqaddimin vs mutaakhirin
4. Kontribusi ulama modern dalam ilmu takhrij

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
    fakultas: ["syariah", "dirasat", "ushuluddin"],
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
          title: "Pahami Bab Fiqh",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, [GAYA_BELAJAR]. Belajar Fiqh [MADZHAB - Syafi'i/Hanafi/Maliki/Hanbali].

Aku ingin memahami bab [BAB FIQH - mis. Thaharah, Shalat, Zakat, Puasa, Haji].

Tolong jelaskan:
1. Definisi bab dengan teks Arab berharakat
2. Rukun-rukun (kalau ada) dengan penjelasan masing-masing
3. Syarat-syarat
4. Hal-hal yang membatalkan (kalau relevan)
5. Dalil utama dari Al-Qur'an/Hadits yang digunakan madzhab [MADZHAB]
6. Khilaf dalam madzhab ini (kalau ada)

[LEVEL_BAHASA]

Sesuaikan semua penjelasan dengan madzhab [MADZHAB] yang aku pelajari.`,
        },
        {
          title: "Bedakan Istilah Fiqh yang Mirip",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar Fiqh [MADZHAB].

Aku bingung membedakan: [ISTILAH 1] vs [ISTILAH 2]
(mis. Rukun vs Syarat, Fardhu vs Wajib, Sunnah vs Mandub, Hajat vs Dharurah)

Tolong jelaskan: definisi masing-masing dengan teks Arab, beda substansial, implikasi hukum perbedaan itu, contoh dari masalah fiqh nyata.

[LEVEL_BAHASA]`,
        },
        {
          title: "Dalil dan Hujjah Masalah Fiqh",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar Fiqh [MADZHAB].

Masalah fiqh: [SEBUTKAN MASALAH - mis. "Hukum basmalah dalam shalat", "Hukum talqin mayit", dll]

Jelaskan pendapat madzhab [MADZHAB]:
1. Pendapat resmi madzhab (qawl rajih)
2. Dalil utama yang digunakan — sertakan teks Arab berharakat
3. Cara istidlal (bagaimana dalil dipakai untuk sampai ke hukum ini)
4. Apakah ada qawl lain dalam madzhab yang sama

[LEVEL_BAHASA]`,
        },
        {
          title: "Fiqh Praktis Sehari-hari Masisir",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS], [GAYA_BELAJAR]. Belajar Fiqh [MADZHAB].

Aku butuh panduan fiqh praktis untuk kehidupan sehari-hari di Mesir, khususnya tentang:

[SEBUTKAN TOPIK - mis. "shalat di masjid Al-Azhar", "thaharah dengan air Nil", "hukum makanan di Mesir", dll]

Jelaskan:
1. Hukum menurut madzhab [MADZHAB]
2. Dalil
3. Kondisi atau pengecualian yang perlu diperhatikan
4. Apakah ada perbedaan kondisi Mesir yang perlu diperhatikan

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Drill Matan Kitab Fiqh",
          targetAI: "notebooklm",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Menghafal matan [NAMA KITAB - Fathul Qarib/Nurul Idhah/dll].

Sesi drill:
1. Sebut bab atau masalah tertentu
2. Aku recite teks matan terkait
3. Koreksi kalau ada yang salah
4. Setelah 10 putaran, daftar yang perlu diperkuat

Fokus: [BAB kalau ada]

[LEVEL_BAHASA]`,
        },
        {
          title: "Mnemonic Rukun dan Syarat",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Perlu hafal rukun dan syarat [BAB FIQH] dalam madzhab [MADZHAB].

Buatkan:
1. Daftar lengkap rukun/syarat dengan teks Arab berharakat
2. Mnemonic Indonesia untuk hafal urutan
3. Cara membedakan rukun dan syarat secara cepat

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Kasus Fiqh Bertingkat",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], drill Fiqh [MADZHAB]. [GAYA_BELAJAR].

Beri 8 kasus fiqh yang harus aku tentukan hukumnya menurut madzhab [MADZHAB]:

Format tiap kasus: deskripsi situasi (1 kalimat). Mulai dari kasus mudah ke sulit. JANGAN kasih jawaban dulu.

Setelah aku jawab, koreksi + dalil dari kitab madzhab.

[LEVEL_BAHASA]`,
        },
        {
          title: "Bedah Ibarah Kitab Fiqh Klasik",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar Fiqh [MADZHAB].

Ini paragraf dari kitab fiqh klasik:

[PASTE TEKS ARAB - sebutkan kitab & bab]

Analisis:
1. Tarjamah harfiyah dan ma'nawiyyah
2. Masalah fiqh yang dibahas
3. Istilah teknis fiqh — Arab + transliterasi + definisi
4. Dalil yang dirujuk (walau tidak disebutkan eksplisit)
5. Bagaimana syarih (komentar kitab) menjelaskan paragraf ini

[LEVEL_BAHASA]`,
        },
        {
          title: "Mock Kasus Ujian Fiqh Azhari",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar. Drill kasus fiqh gaya soal Azhari.

Beri 5 kasus fiqh dengan gaya soal: "Fulan melakukan X, bagaimana hukumnya menurut madzhab [MADZHAB]?" — dengan detail yang relevan dan sedikit kerancuan untuk menguji.

JANGAN kasih jawaban dulu. Koreksi setelah aku jawab, sertakan dalil.

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Tahriri Fiqh Madzhabi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, persiapan ujian Tahriri Fiqh [MADZHAB].

Beri 5 soal gaya Azhari: definisi bab, rukun/syarat, hukum kasus tertentu, dalil, khilaf dalam madzhab.

Tulis Arab. Koreksi setelah aku jawab.

[LEVEL_BAHASA]`,
        },
        {
          title: "Mock Syafawi Fiqh Madzhabi",
          targetAI: "chatgpt",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, latihan Syafawi Fiqh [MADZHAB]. [GAYA_BELAJAR].

Bertindaklah sebagai dosen Azhar. 5 pertanyaan: definisi istilah, hukum kasus, dalil, beda dua masalah, aplikasi kaidah fiqh ke kasus.

Evaluasi di akhir.

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Review Pasca Talaqqi Fiqh",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Baru talaqqi fiqh [MADZHAB] tentang [BAB] dari kitab [NAMA KITAB].

Catatan:

[PASTE CATATAN]

Tolong: susun ulang sistematis (definisi → rukun/syarat → furu' → dalil), tambahkan teks Arab berharakat, pertanyaan untuk sesi berikutnya.

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Catatan Talaqqi Fiqh yang Ambigu",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Catatan talaqqi Fiqh [MADZHAB] yang ambigu:

[PASTE CATATAN]

Interpretasi berdasarkan konteks fiqh madzhab, identifikasi masalah yang dibahas, lengkapi yang kurang.

[LEVEL_BAHASA]`,
        },
      ],
      eksplorasi: [
        {
          title: "Khilaf dalam Satu Madzhab",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Eksplorasi khilaf internal madzhab [MADZHAB].

Masalah: [SEBUTKAN MASALAH FIQH]

Jelaskan:
1. Qawl rajih (pendapat yang difatwakan) dalam madzhab
2. Qawl marjuh (pendapat yang ada tapi tidak difatwakan)
3. Siapa yang memegang masing-masing pendapat dalam madzhab
4. Mengapa ada perbedaan internal dalam satu madzhab

Jangan men-tarjih antar pendapat.

[LEVEL_BAHASA]`,
        },
        {
          title: "Fiqh Madzhab dan Adaptasi Kontekstual",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar Fiqh [MADZHAB].

Bagaimana fiqh madzhabi beradaptasi dengan kondisi kontemporer?

Contoh kasus: [SEBUTKAN MASALAH KONTEMPORER - mis. transaksi digital, perbankan, hukum zakat penghasilan]

Jelaskan:
1. Kaidah pokok madzhab yang relevan dengan kasus ini
2. Bagaimana fuqaha kontemporer madzhab ini memandang masalah tersebut
3. Apakah perlu ijtihad baru atau cukup dengan qiyas?

[LEVEL_BAHASA]`,
        },
      ],
    },
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
          title: "Banding Pendapat 4 Madzhab dalam Satu Masalah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Masalah fiqh: [SEBUTKAN MASALAH]

Tolong bandingkan pendapat 4 madzhab secara sistematis:

Untuk setiap madzhab (Syafi'i, Hanafi, Maliki, Hanbali):
1. Pendapat madzhab (qawl)
2. Dalil utama — sertakan teks Arab berharakat
3. Wajh istidlal (cara mengambil hukum dari dalil)

Lalu:
- Apa sebab utama khilaf antar madzhab ini?
- Apakah ada khilaf tambahan dari madzhab Zhahiriyyah?

[LEVEL_BAHASA]

Nama kitab dalam Arab. Nama ulama transliterasi natural.`,
        },
        {
          title: "Identifikasi Sebab Khilaf Fiqhi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Ibnu Rusyd dalam Bidayatul Mujtahid mengidentifikasi beberapa sebab utama khilaf fiqhi.

Jelaskan sebab-sebab tersebut:
1. Perbedaan dalam menerima atau menolak riwayat hadits
2. Perbedaan dalam memahami lafal Arab (ihtimal/musytarak)
3. Perbedaan kaidah ushul antar madzhab
4. Perbedaan dalam menanggapi 'urf dan tradisi

Untuk setiap sebab, beri 1 contoh masalah fiqh konkret dimana sebab tersebut yang berperan.

[LEVEL_BAHASA]`,
        },
        {
          title: "Baca dan Analisis Bidayatul Mujtahid",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Ibnu Rusyd dalam Bidayatul Mujtahid membahas masalah [MASALAH] di bab [BAB].

Ini kutipan:

[PASTE KUTIPAN ARAB DARI BIDAYAH]

Analisis:
1. Masalah fiqh yang dibahas
2. Cara Ibnu Rusyd menyajikan pendapat antar madzhab
3. Sebab khilaf yang diidentifikasi Ibnu Rusyd
4. Apakah Ibnu Rusyd men-tarjih di sini? Kalau ya, dengan alasan apa?

[LEVEL_BAHASA]`,
        },
        {
          title: "Metode Muqaranah: Dari Khilaf ke Pemahaman",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan metodologi fiqh muqaran yang benar menurut Ibnu Rusyd dan ulama muqaranah modern:

1. Langkah-langkah muqaranah (rumus masalah → kumpulkan pendapat → analisis dalil → identifikasi sebab → tarjih kalau perlu)
2. Adab dalam muqaranah: tidak memihak madzhab tertentu sebelum analisis
3. Kapan boleh dan perlu melakukan tarjih
4. Perbedaan muqaranah akademis dan fatwa praktis

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Ciri Khas Madzhab dalam Pendapat Fiqh",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Perlu hafal kecenderungan umum 4 madzhab dalam bab [BAB FIQH].

Buatkan tabel ringkas:
- Madzhab vs kecenderungan pendapat di bab ini
- Satu ciri khas metodologis yang membedakan setiap madzhab

Lalu buatkan mnemonic untuk hafal karakter masing-masing madzhab.

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill Pendapat Madzhab per Masalah",
          targetAI: "notebooklm",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Menghafal pendapat 4 madzhab dalam masalah-masalah bab [BAB].

Sesi drill:
1. Sebut nama masalah fiqh
2. Aku sebutkan pendapat keempat madzhab
3. Koreksi yang salah
4. Setelah 10 putaran, beri daftar yang perlu diperkuat

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Analisis Sebab Khilaf",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], drill [MADDAH]. [GAYA_BELAJAR].

Beri 5 kasus khilaf fiqh. Aku akan analisis:
1. Pendapat masing-masing madzhab
2. Sebab utama khilaf (dari 4 sebab yang dipelajari)
3. Kategori khilaf: apakah substantif atau lafzhi

Format: sebutkan masalah + pendapat singkat madzhab. JANGAN analisis sebabnya dulu.

[LEVEL_BAHASA]`,
        },
        {
          title: "Susun Draft Muqaranah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], latihan [MADDAH]. [GAYA_BELAJAR].

Aku ingin menyusun muqaranah fiqhiyyah untuk masalah: [SEBUTKAN MASALAH]

Bantu aku menyusun draft dengan format:
1. Tahrir mahallil khilaf (rumusan masalah yang dipersengketakan)
2. Pendapat setiap madzhab (qawl + dalil + wajh istidlal)
3. Naqd wa maqaranah (evaluasi dan perbandingan)
4. Rajih (kalau diminta tarjih) — dengan alasan ushuli

[LEVEL_BAHASA]

TIP: Setelah draft ini, gunakan fitur Muqaranah di Talqeeh untuk menyimpan dan melengkapi.`,
        },
        {
          title: "Bedah Masalah dari Al-Mughni",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], belajar [MADDAH]. [GAYA_BELAJAR].

Ini kutipan Ibnu Qudamah dalam Al-Mughni tentang masalah [MASALAH]:

[PASTE KUTIPAN ARAB]

Analisis:
1. Bagaimana Ibnu Qudamah menyajikan dan menyusun khilaf
2. Teknik istidlal yang digunakan Ibnu Qudamah
3. Apakah dan bagaimana Ibnu Qudamah melakukan tarjih
4. Keunggulan metodologis Al-Mughni sebagai kitab muqaranah

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Tahriri Fiqh Muqaran",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, persiapan ujian Tahriri [MADDAH].

Beri 5 soal Azhari: banding pendapat madzhab dalam masalah tertentu, analisis sebab khilaf, identifikasi madzhab dari pendapat, susun muqaranah mini, tarjih dengan alasan.

Tulis Arab. Koreksi setelah aku jawab.

[LEVEL_BAHASA]`,
        },
        {
          title: "Mock Syafawi Fiqh Muqaran",
          targetAI: "chatgpt",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, latihan Syafawi [MADDAH]. [GAYA_BELAJAR].

Bertindaklah sebagai dosen Azhar. 5 pertanyaan: metodologi muqaranah, sebab khilaf, banding 2 madzhab dalam masalah tertentu (kasih aku masalah), identifikasi sebab khilaf, tarjih dengan syarat.

Evaluasi di akhir.

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Review Pasca Talaqqi Fiqh Muqaran",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Baru talaqqi tentang masalah muqaranah [MASALAH] dari kitab [NAMA KITAB].

Catatan:

[PASTE CATATAN]

Tolong: susun ulang (tahrir → pendapat → dalil → sebab → rajih), tambahkan teks Arab berharakat, pertanyaan untuk sesi berikutnya.

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Catatan Talaqqi yang Ambigu",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Catatan talaqqi [MADDAH] yang ambigu:

[PASTE CATATAN]

Interpretasi berdasarkan konteks fiqh muqaran, identifikasi madzhab dan masalah yang dibahas.

[LEVEL_BAHASA]`,
        },
      ],
      eksplorasi: [
        {
          title: "Muqaranah dalam Masalah Kontemporer",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Eksplorasi [MADDAH] dalam masalah kontemporer.

Masalah kontemporer: [SEBUTKAN - mis. "Hukum zakat saham dan investasi"]

Jelaskan bagaimana fuqaha kontemporer dari berbagai madzhab memandang masalah ini:
1. Pendapat yang ada (dan dari madzhab/lembaga mana)
2. Dalil dan kaidah ushul yang digunakan
3. Perbedaan pendapat dan sebabnya
4. Keputusan lembaga fatwa internasional (OKI, Al-Azhar, dll) kalau ada

Jangan men-tarjih.

[LEVEL_BAHASA]`,
        },
        {
          title: "Ibnu Rusyd dan Revolusi Fiqh Muqaran",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Eksplorasi kontribusi Ibnu Rusyd dalam [MADDAH].

Jelaskan kontribusi Ibnu Rusyd Al-Hafid dalam Bidayatul Mujtahid:
1. Apa yang revolusioner dari pendekatan Ibnu Rusyd dibanding ulama sebelumnya
2. Bagaimana cara Ibnu Rusyd mengidentifikasi dan menjelaskan sebab khilaf
3. Kritik ulama terhadap Bidayatul Mujtahid
4. Pengaruh Bidayatul Mujtahid terhadap perkembangan fiqh muqaran

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
          title: "Pahami Kaidah Fiqhiyyah Lengkap",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Aku ingin memahami kaidah: [TULIS KAIDAH DALAM ARAB BERHARAKAT]

Tolong jelaskan:
1. Teks kaidah Arab berharakat + transliterasi
2. Makna kaidah dalam Indonesia
3. Kaidah mana ini termasuk (asasiyyah atau furu'iyyah, dan induknya apa)
4. Aplikasi kaidah — 3-4 furu' fiqh yang dibangun di atas kaidah ini
5. Pengecualian (mustatsnayat) — kondisi kaidah tidak berlaku
6. Khilaf ulama tentang kaidah ini (kalau ada)

[LEVEL_BAHASA]

Sertakan teks Arab untuk kaidah turunan yang disebutkan.`,
        },
        {
          title: "Hubungan 5 Kaidah Asasiyyah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan 5 kaidah asasiyyah (al-qawa'id al-kulliyyah al-khams) secara komprehensif:

Untuk setiap kaidah:
1. Teks Arab berharakat
2. Makna dan cakupannya
3. 3 furu' fiqh yang termasuk kaidah ini
4. 1 pengecualian penting
5. Kaidah turunan (furu'iyyah) yang lahir dari kaidah ini

Lalu: apakah ada hubungan atau tumpang-tindih antar 5 kaidah ini?

[LEVEL_BAHASA]`,
        },
        {
          title: "Beda Qawa'id Fiqhiyyah dan Dhawabith Fiqhiyyah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan perbedaan antara:
1. Qawa'id Fiqhiyyah (kaidah umum lintas madzhab/bab)
2. Dhawabith Fiqhiyyah (kaidah khusus satu bab atau madzhab)

Beri definisi Arab berharakat untuk keduanya, ciri pembeda, dan 2 contoh untuk masing-masing.

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Drill Kaidah Fiqhiyyah",
          targetAI: "notebooklm",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Menghafal kaidah-kaidah fiqhiyyah dari kitab [NAMA KITAB].

Sesi drill:
1. Sebut nomor atau tema kaidah
2. Aku recite teks kaidah Arab berharakat
3. Koreksi kalau ada yang salah
4. Setelah 10 putaran, daftar yang perlu diperkuat

Fokus: [KAIDAH ASASIYYAH / BAB kalau ada]

[LEVEL_BAHASA]`,
        },
        {
          title: "Mnemonic 5 Kaidah Asasiyyah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Perlu hafal 5 kaidah asasiyyah dan kaidah-kaidah turunannya.

Buatkan:
1. Tabel: kaidah asasiyyah → arti singkat → 3 furu' utama → 1 pengecualian utama
2. Akronim atau mnemonic Indonesia untuk hafal urutan 5 kaidah
3. Hook (kalimat kunci) untuk setiap kaidah agar mudah diingat

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Aplikasi Kaidah ke Kasus Fiqh",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], drill [MADDAH]. [GAYA_BELAJAR].

Beri 10 kasus fiqh. Aku akan identifikasi kaidah fiqhiyyah yang berlaku di setiap kasus.

Format kasus: deskripsi singkat situasi (1-2 kalimat). JANGAN kasih jawaban dulu.

Setelah aku jawab semua, koreksi + jelaskan reasoning + kaidah Arab berharakat.

[LEVEL_BAHASA]`,
        },
        {
          title: "Latihan Identifikasi Pengecualian",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], belajar [MADDAH]. [GAYA_BELAJAR].

Kaidah: [TULIS KAIDAH BERHARAKAT]

Beri 5 kasus yang tampak seharusnya masuk kaidah ini, tapi sebenarnya termasuk pengecualian. Aku akan tentukan: masuk kaidah atau pengecualian? Dan alasannya.

JANGAN kasih jawaban dulu.

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Tahriri Qawa'id Fiqhiyyah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, persiapan ujian Tahriri [MADDAH].

Beri 5 soal Azhari: tulis kaidah dan jelaskan, sebutkan furu', identifikasi kaidah dari kasus, pengecualian, beda qawa'id dan dhawabith.

Tulis Arab. Koreksi setelah aku jawab.

[LEVEL_BAHASA]`,
        },
        {
          title: "Mock Syafawi Qawa'id Fiqhiyyah",
          targetAI: "chatgpt",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, latihan Syafawi [MADDAH]. [GAYA_BELAJAR].

Bertindaklah sebagai dosen Azhar. 5 pertanyaan: tulis & jelaskan kaidah, sebutkan furu', kasih kasus (aku identifikasi kaidah), pengecualian, beda dua kaidah.

Evaluasi di akhir.

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Review Pasca Talaqqi Qawa'id Fiqhiyyah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Baru talaqqi tentang kaidah [NAMA KAIDAH] dari kitab [NAMA KITAB].

Catatan:

[PASTE CATATAN]

Tolong: susun (kaidah → makna → furu' → mustatsnayat → kaidah turunan), tambah teks Arab berharakat, contoh aplikasi tambahan.

[LEVEL_BAHASA]`,
        },
      ],
      eksplorasi: [
        {
          title: "Qawa'id Fiqhiyyah dalam Fatwa Kontemporer",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Eksplorasi aplikasi [MADDAH] dalam fatwa kontemporer.

Beri 3 contoh fatwa kontemporer dari lembaga resmi (Al-Azhar, MUI, OKI) yang menggunakan kaidah fiqhiyyah dalam argumentasinya.

Untuk setiap fatwa:
1. Masalah yang difatwakan
2. Kaidah fiqhiyyah yang digunakan
3. Bagaimana kaidah menjadi dasar hukum
4. Apakah ada kaidah lain yang bisa digunakan?

[LEVEL_BAHASA]`,
        },
        {
          title: "Khilaf dalam Lingkup Kaidah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Eksplorasi khilaf tentang kaidah: [TULIS KAIDAH BERHARAKAT]

Jelaskan:
1. Apakah semua madzhab menerima kaidah ini?
2. Bagaimana masing-masing madzhab merumuskan kaidah ini (ada perbedaan lafal?)
3. Kasus di mana madzhab berbeda dalam mengaplikasikan kaidah ini
4. Pandangan ulama ushul fiqh tentang kaidah ini

Jangan men-tarjih.

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
          title: "Pahami Rukun dan Syarat Nikah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan rukun dan syarat nikah menurut madzhab [MADZHAB kalau ada, atau 4 madzhab]:
1. Rukun nikah (tulis Arab berharakat + penjelasan)
2. Syarat untuk setiap rukun
3. Perbedaan rukun-syarat antar madzhab (terutama tentang wali dan saksi)
4. Nikah yang batil vs fasid — beda dan contohnya

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Talaq, 'Iddah, dan Ruju'",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan alur talaq secara sistematis:
1. Jenis-jenis talaq (raj'i, ba'in sughra, ba'in kubra) — teks Arab + definisi
2. 'Iddah — kenapa wajib, berapa lama untuk masing-masing kondisi
3. Ruju' — kapan boleh, caranya, dalil
4. Khilaf madzhab dalam jumlah talaq tiga sekaligus (talaq tiga dalam satu waktu)

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Sistem Mawarits",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan sistem mawarits (faraidh) secara komprehensif:
1. Siapa saja yang termasuk ahli waris (ashhabul furudh, ashabah, dhawil arham)
2. Syarat-syarat mewarisi (dan yang menghalangi/hajb)
3. Bagian masing-masing ahli waris (dengan dalil ayat berharakat)
4. Konsep hijab (hirman dan nuqshan)
5. Langkah-langkah menghitung warisan

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Drill Tabel Bagian Ahli Waris",
          targetAI: "notebooklm",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Menghafal tabel bagian ahli waris dalam mawarits.

Sesi drill:
1. Sebut nama ahli waris
2. Aku sebutkan: bagian-bagiannya (kapan dapat setengah, seperempat, dst) dan kondisi masing-masing
3. Koreksi kalau salah
4. Setelah 10 putaran, beri daftar yang perlu diperkuat

[LEVEL_BAHASA]`,
        },
        {
          title: "Mnemonic Bagian Ahli Waris",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Perlu hafal bagian-bagian ahli waris dalam faraidh.

Buatkan tabel ringkas:
- Ahli waris → bagiannya → kondisi mendapat bagian itu → kondisi hijab

Lalu buatkan mnemonic atau cara mudah mengingat siapa yang mendapat setengah, seperempat, dst.

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Hitung Pembagian Warisan",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], drill [MADDAH]. [GAYA_BELAJAR].

Beri 6 kasus pembagian warisan bertingkat:

Kasus 1 (mudah): mayit meninggalkan [AHLI WARIS], harta: Rp [JUMLAH]
Kasus 2-4 (menengah): ada aul atau radd
Kasus 5-6 (sulit): ada hajb, atau kasus musytarakah/akdariyyah

Format tiap kasus: deskripsi ahli waris yang ada. JANGAN kasih jawaban dulu.

Setelah aku jawab, koreksi per kasus dengan langkah perhitungan.

[LEVEL_BAHASA]`,
        },
        {
          title: "Kasus Ahwal Syakhshiyah Kompleks",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], drill [MADDAH]. [GAYA_BELAJAR].

Beri 5 kasus hukum keluarga yang memerlukan analisis berlapis (mis. kasus nikah dengan kondisi tertentu, talaq yang dipermasalahkan, warisan yang ada perselisihan).

Format kasus: deskripsi detail situasi. JANGAN kasih jawaban dulu.

Setelah aku jawab, koreksi + penjelasan jalur hukum + khilaf madzhab kalau ada.

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Tahriri Ahwal Syakhshiyah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, persiapan ujian Tahriri [MADDAH].

Beri 5 soal Azhari: hukum kasus munakahat/talaq/'iddah, hitung warisan, identifikasi hajb, khilaf madzhab dalam munakahat.

Tulis Arab. Koreksi setelah aku jawab.

[LEVEL_BAHASA]`,
        },
        {
          title: "Mock Syafawi Ahwal Syakhshiyah",
          targetAI: "chatgpt",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, latihan Syafawi [MADDAH]. [GAYA_BELAJAR].

Bertindaklah sebagai dosen Azhar. 5 pertanyaan: rukun/syarat nikah, hukum kasus talaq, hitung warisan sederhana (kasih kasus), hajb dan jenisnya, perbedaan madzhab dalam munakahat.

Evaluasi di akhir.

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Review Pasca Talaqqi Ahwal Syakhshiyah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Baru talaqqi tentang [BAB - mis. nikah / talaq / mawarits] dari kitab [NAMA KITAB].

Catatan:

[PASTE CATATAN]

Tolong: susun sistematis, tambahkan ayat/dalil Arab berharakat yang relevan, beri contoh kasus tambahan, pertanyaan untuk sesi berikutnya.

[LEVEL_BAHASA]`,
        },
      ],
      eksplorasi: [
        {
          title: "Khilaf Madzhab dalam Munakahat",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Eksplorasi khilaf dalam [MADDAH].

Masalah: [SEBUTKAN - mis. "Hukum nikah mut'ah" / "Nikah tanpa wali" / "Talaq tiga dalam satu majlis"]

Jelaskan:
1. Pendapat setiap madzhab dengan dalilnya
2. Sebab utama perbedaan pendapat
3. Bagaimana undang-undang keluarga Muslim modern memutuskan masalah ini

Jangan men-tarjih.

[LEVEL_BAHASA]`,
        },
        {
          title: "'Aul dan Radd dalam Mawarits: Khilaf Historis",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Eksplorasi khilaf historis dalam mawarits.

Jelaskan:
1. Masalah 'aul (bagian melebihi harta) — bagaimana masing-masing madzhab menyelesaikannya
2. Masalah radd (sisa harta) — khilaf siapa yang berhak menerima sisa
3. Peristiwa historis: 'Umar bin Khattab dan masalah 'aul — bagaimana beliau memutuskan
4. Sikap madzhab terhadap keputusan 'Umar tentang 'aul

Jangan men-tarjih antar madzhab.

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
    fakultas: ["ushuluddin", "syariah", "dirasat", "quran"],
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
          title: "Pahami Sifat Wajib Allah dengan Dalil",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Aku ingin memahami sifat: [NAMA SIFAT - mis. Wujud, Qidam, Baqa', Mukhalafatu lil Hawadits, dll]

Tolong jelaskan:
1. Nama sifat dalam Arab berharakat + transliterasi + makna
2. Sifat mustahil lawannya: nama + makna
3. Dalil naqli (ayat Al-Qur'an berharakat)
4. Dalil aqli (argumen logis)
5. Hubungan sifat ini dengan sifat-sifat lain dalam 20 sifat wajib

Pendekatan Asy'ari-Maturidi (manhaj Al-Azhar).

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Sifat Ma'ani dan Ma'nawiyyah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan pembagian sifat menurut Asy'ariyyah:
1. Sifat Nafsiyyah: Wujud — mengapa hanya 1?
2. Sifat Salbiyyah (5): Qidam, Baqa', Mukhalafah, Qiyam, Wahdaniyyah — makna masing-masing
3. Sifat Ma'ani (7): Qudrah, Iradah, Ilmu, Hayat, Sam', Bashar, Kalam — makna + dalil aqli
4. Sifat Ma'nawiyyah (7): lawannya dari sifat ma'ani dalam wujud khabariyyah

Sertakan teks Arab berharakat untuk setiap sifat.

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Sifat Wajib-Mustahil-Jaiz bagi Rasul",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan sifat-sifat Rasulullah ﷺ:
1. Sifat wajib (4): As-Shidq, Al-Amanah, At-Tabligh, Al-Fathanah — makna + dalil
2. Sifat mustahil lawannya
3. Sifat jaiz
4. Hubungan sifat ini dengan tugas kenabian dan kebenaran Al-Qur'an

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Dalil Wujudullah (Keberadaan Allah)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan dalil-dalil Wujudullah secara mendalam:
1. Dalil alam (kosmologis): huduts al-'alam — teks Arab definisi + argumen
2. Dalil Inni (teleologis): keteraturan alam menunjuk pada Pencipta
3. Dalil naqli: ayat-ayat Al-Qur'an tentang keberadaan Allah (berharakat)
4. Bagaimana ulama kalam (Al-Ghazali, As-Sanusi) merumuskan argumen ini

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Drill Matan Jawharatut Tauhid",
          targetAI: "notebooklm",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Menghafal matan Jawharatut Tauhid karya Al-Laqqani.

Sesi drill:
1. Sebut tema/bab atau nomor bait
2. Aku recite bait berharakat
3. Koreksi kalau ada yang salah
4. Setelah 10 putaran, daftar yang perlu diperkuat

Fokus bab: [NAMA BAB kalau ada]

[LEVEL_BAHASA]`,
        },
        {
          title: "Drill 20 Sifat dengan Dalil",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Perlu hafal 20 sifat wajib, mustahil, dan dalil naqliyahnya.

Drill format:
1. Sebut nomor (1-20)
2. Aku sebutkan: nama sifat Arab, makna, lawannya, 1 ayat dalil
3. Koreksi kalau ada yang salah
4. Beri mnemonic untuk 20 sifat secara urut

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Menyusun Argumen Tauhid",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], drill [MADDAH]. [GAYA_BELAJAR].

Beri 5 pertanyaan/keberatan tentang tauhid (gaya seseorang yang ragu atau bertanya). Aku akan menjawab dengan dalil aqli dan naqli.

Contoh pertanyaan: "Kalau Allah Maha Kuasa, kenapa ada keburukan?" atau "Apa bukti Allah itu ada?"

JANGAN kasih jawaban dulu. Koreksi setelah aku menjawab.

[LEVEL_BAHASA]`,
        },
        {
          title: "Identifikasi Sifat dari Deskripsi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], drill [MADDAH]. [GAYA_BELAJAR].

Beri 10 deskripsi tentang Allah. Aku akan identifikasi: nama sifat (Arab berharakat), kategori sifat (nafsiyyah/salbiyyah/ma'ani/ma'nawiyyah).

Format: deskripsi dalam Indonesia atau Arab. JANGAN kasih jawaban dulu.

[LEVEL_BAHASA]`,
        },
        {
          title: "Bedah Ibarah Kitab Tauhid",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], belajar [MADDAH]. [GAYA_BELAJAR].

Ini paragraf dari kitab tauhid:

[PASTE TEKS ARAB - sebutkan kitab & bab]

Analisis:
1. Sifat atau konsep tauhid yang dibahas
2. Istilah teknis kalam (Arab + transliterasi + definisi)
3. Dalil aqli yang digunakan
4. Dalil naqli yang disebut
5. Manhaj mutakallimin dalam paragraf ini

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Tahriri Tauhid",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, persiapan ujian Tahriri [MADDAH].

Beri 5 soal Azhari: definisi & dalil sifat tertentu, bedakan sifat wajib-mustahil-jaiz, argumen aqli untuk sifat Allah, bait Jawharatut Tauhid.

Tulis Arab. Koreksi setelah aku jawab.

[LEVEL_BAHASA]`,
        },
        {
          title: "Mock Syafawi Tauhid",
          targetAI: "chatgpt",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, latihan Syafawi [MADDAH]. [GAYA_BELAJAR].

Bertindaklah sebagai dosen Azhar. 5 pertanyaan: 20 sifat (sebutkan beberapa), dalil aqli sifat tertentu, beda sifat ma'ani-ma'nawiyyah, sifat rasul, sam'iyyat.

Evaluasi di akhir.

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Review Pasca Talaqqi Tauhid",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Baru talaqqi tentang [BAB TAUHID] dari kitab [NAMA KITAB].

Catatan:

[PASTE CATATAN]

Tolong: susun sistematis, tambahkan teks Arab berharakat (sifat, dalil, bait nazham), argumen aqli yang lebih lengkap, pertanyaan untuk sesi berikutnya.

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Catatan Talaqqi Tauhid yang Ambigu",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Catatan talaqqi [MADDAH] yang ambigu:

[PASTE CATATAN]

Interpretasi berdasarkan konteks ilmu kalam Asy'ari, identifikasi sifat dan konsep yang dibahas.

[LEVEL_BAHASA]`,
        },
      ],
      eksplorasi: [
        {
          title: "Khilaf tentang Sifat Khabariyyah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, [GAYA_BELAJAR]. Eksplorasi khilaf tentang sifat khabariyyah (tangan, wajah, istiwa') dalam Al-Qur'an.

Jelaskan 3 pendekatan:
1. Tafwidh (manhaj salaf mutaqaddimin) — serahkan maknanya kepada Allah
2. Ta'wil (manhaj Asy'ariyyah) — tafsirkan secara majazi
3. Isbat (sebagian manhaj) — tetapkan sifat tanpa tasybih

Dalil dan argumentasi masing-masing. Siapa tokoh di setiap pendekatan?

Jangan men-tarjih.

[LEVEL_BAHASA]`,
        },
        {
          title: "Tauhid Asma' wa Sifat: Antara Mutakallimin dan Salafiyyah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Eksplorasi perbedaan metodologi dalam [MADDAH].

Jelaskan perbedaan pendekatan antara:
1. Mutakallimin (Asy'ariyyah, Maturidiyyah) dalam membahas asma wa sifat
2. Salafiyyah (Ibnu Taimiyyah, murid-muridnya) dalam hal yang sama
3. Titik persamaan yang sering diabaikan
4. Titik perbedaan yang fundamental

Jangan memihak — sajikan dengan adil.

[LEVEL_BAHASA]`,
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
          title: "Pahami Pokok Pemikiran Satu Firqah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Aku ingin memahami: [NAMA FIRQAH - mis. Mu'tazilah, Khawarij, Syiah Imamiyyah, Murji'ah, dll]

Tolong jelaskan:
1. Nama dan asal-usul nama (Arab berharakat)
2. Konteks historis kemunculan (kapan, dimana, pemicu apa)
3. Tokoh pendiri dan tokoh utama
4. 3-5 pokok pemikiran yang membedakan firqah ini dari Ahlus Sunnah
5. Bagaimana Ahlus Sunnah merespons doktrin-doktrin ini

Pendekatan akademis-historis. Jangan men-takfir.

[LEVEL_BAHASA]`,
        },
        {
          title: "Bandingkan Dua Firqah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bandingkan dua firqah: [FIRQAH 1] vs [FIRQAH 2]

Aspek perbandingan:
1. Konteks historis masing-masing
2. Pokok pemikiran masing-masing
3. Kesamaan (kalau ada)
4. Perbedaan mendasar
5. Bagaimana keduanya berinteraksi secara historis

[LEVEL_BAHASA]`,
        },
        {
          title: "Asy'ariyyah dan Maturidiyyah: Dua Sayap Ahlus Sunnah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan kedua aliran Ahlus Sunnah ini:
1. Asy'ariyyah: pendiri, pokok, tersebar di mana
2. Maturidiyyah: pendiri, pokok, tersebar di mana
3. Persamaan keduanya (yang membuat keduanya masuk Ahlus Sunnah)
4. Perbedaan keduanya (dalam beberapa masalah kalam)
5. Posisi Al-Azhar secara resmi

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Drill Nama dan Pokok Pemikiran Firaq Utama",
          targetAI: "notebooklm",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Menghafal firaq-firaq Islam dan pokok pemikirannya.

Sesi drill:
1. Sebut nama firqah
2. Aku sebutkan: pendiri, periode, 2-3 pokok pemikiran utama
3. Koreksi kalau salah
4. Setelah 10 putaran, beri daftar yang perlu diperkuat

[LEVEL_BAHASA]`,
        },
        {
          title: "Mnemonic Klasifikasi Firaq",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Perlu hafal klasifikasi firaq Islam.

Buatkan peta pengelompokan:
- Firaq yang berkaitan dengan iman & kufr: Khawarij, Murji'ah
- Firaq yang berkaitan dengan kalam & sifat: Mu'tazilah, Jabariyyah, Qadariyyah
- Firaq yang berkaitan dengan imamah: Syiah berbagai aliran

Buatkan mnemonic atau cara mudah mengingat pengelompokan ini.

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Identifikasi Firqah dari Pernyataan",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], drill [MADDAH]. [GAYA_BELAJAR].

Beri 8 pernyataan doktrin teologis. Aku akan identifikasi firqah mana yang memegang pernyataan ini.

Format tiap pernyataan: 1 kalimat (Indonesia atau Arab). JANGAN kasih jawaban dulu.

Setelah aku jawab, koreksi + jelaskan kenapa pernyataan itu khas firqah tersebut.

[LEVEL_BAHASA]`,
        },
        {
          title: "Analisis Kritik Ahlus Sunnah terhadap Firqah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], belajar [MADDAH]. [GAYA_BELAJAR].

Firqah: [NAMA FIRQAH]
Pokok pemikiran mereka yang dikritik: [SEBUTKAN POKOK PEMIKIRAN]

Analisis kritik Ahlus Sunnah:
1. Dalil naqli yang menjadi sanggahan
2. Dalil aqli yang digunakan
3. Bagaimana ulama Asy'ariyyah merespons (mis. Al-Baqillani, Al-Ghazali, Ar-Razi)
4. Apakah ada sisi yang bisa dipahami dari alasan firqah tersebut berpegang pada pemikiran itu?

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Tahriri 'Aqidah & Firaq",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, persiapan ujian Tahriri [MADDAH].

Beri 5 soal Azhari: definisi firqah dan pendiri, pokok pemikiran, banding dua firqah, identifikasi firqah dari doktrin, respons Ahlus Sunnah.

Tulis Arab. Koreksi setelah aku jawab.

[LEVEL_BAHASA]`,
        },
        {
          title: "Mock Syafawi 'Aqidah & Firaq",
          targetAI: "chatgpt",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, latihan Syafawi [MADDAH]. [GAYA_BELAJAR].

Bertindaklah sebagai dosen Azhar. 5 pertanyaan: identifikasi firqah dari deskripsi, pokok pemikiran firqah tertentu, banding Asy'ariyyah-Mu'tazilah, konteks historis, respons Ahlus Sunnah.

Evaluasi di akhir.

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Review Pasca Talaqqi 'Aqidah & Firaq",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Baru talaqqi tentang firqah [NAMA] dari kitab [NAMA KITAB].

Catatan:

[PASTE CATATAN]

Tolong: susun sistematis (latar → pendiri → pokok → kritik), tambahkan teks Arab berharakat untuk doktrin kunci, pertanyaan untuk sesi berikutnya.

[LEVEL_BAHASA]`,
        },
      ],
      eksplorasi: [
        {
          title: "Mu'tazilah: Antara Rasionalisme dan Penyimpangan",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Eksplorasi Mu'tazilah secara kritis.

Jelaskan:
1. Sisi positif rasionalisme Mu'tazilah yang diakui ulama (mis. kontribusi dalam ilmu kalam)
2. Pokok pemikiran Mu'tazilah yang ditolak Ahlus Sunnah — dan alasannya
3. Khilaf: apakah semua Mu'tazilah sama? Apakah ada tokoh Mu'tazilah yang dekat Ahlus Sunnah?
4. Bagaimana ulama Asy'ariyyah menggunakan metodologi rasional untuk melawan Mu'tazilah

Pendekatan akademis-kritis. Jangan men-takfir.

[LEVEL_BAHASA]`,
        },
        {
          title: "Syiah: Keragaman Internal dan Konteks Historis",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Eksplorasi firqah Syiah.

Jelaskan:
1. Keragaman internal Syiah — Imamiyyah, Zaidiyyah, Isma'iliyyah: apa bedanya
2. Doktrin Imamah: apa yang diyakini dan mengapa berbeda dari Ahlus Sunnah
3. Perbedaan Syiah Zaidiyyah — mengapa sebagian ulama Sunni lebih dekat dengan mereka
4. Pendekatan dialog Al-Azhar dengan dunia Syiah

Pendekatan akademis. Jangan men-takfir.

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
          title: "Pahami Pemikiran Filosof Muslim Tertentu",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Aku ingin memahami pemikiran: [NAMA FILOSOF - mis. Al-Kindi, Al-Farabi, Ibnu Sina, Ibnu Rusyd]

Tolong jelaskan:
1. Biografi singkat dan karya utama
2. Kontribusi unik filosof ini dalam filsafat Islam
3. 2-3 ide filsafat terpenting — jelaskan dengan bahasa yang bisa dipahami
4. Hubungan pemikirannya dengan filsafat Yunani (Plato/Aristoteles)
5. Respons ulama kalam terhadap pemikirannya

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Kritik Al-Ghazali dalam Tahafut",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Al-Ghazali dalam Tahafutul Falasifah mengkritik 20 masalah para filosof. Jelaskan:

1. Mengapa Al-Ghazali menulis Tahafut — konteks dan tujuannya
2. 3 masalah yang Al-Ghazali anggap kafir (qidam al-'alam, 'ilmullah bil juz'iyyat, ba'tsul ajsad)
3. Argumen Al-Ghazali untuk setiap masalah
4. Bagaimana Ibnu Rusyd merespons dalam Tahafutut Tahafut

[LEVEL_BAHASA]`,
        },
        {
          title: "Falsafah vs Kalam: Metode dan Objek",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan perbedaan antara falsafah dan ilmu kalam:
1. Objek kajian masing-masing
2. Metode masing-masing
3. Hubungan (saling mempengaruhi atau saling bertentangan?)
4. Pandangan ulama tentang mempelajari filsafat

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Tokoh dan Karya Filsafat Islam",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Perlu hafal tokoh-tokoh filsafat Islam dan karyanya.

Buatkan tabel:
- Nama filosof (Arab berharakat + transliterasi)
- Masa hidup
- Karya utama (Arab)
- Ide terpenting (1 kalimat)

Urutan kronologis: Al-Kindi → Al-Farabi → Ibnu Sina → Ibnu Rusyd.

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Analisis Argumen Filosofis",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], belajar [MADDAH]. [GAYA_BELAJAR].

Ini argumen filosofis dari [FILOSOF]:

[PASTE TEKS ARGUMEN]

Analisis:
1. Premis-premis argumen (apa yang diasumsikan benar)
2. Kesimpulan yang dicapai
3. Apakah argumen ini valid secara logis?
4. Keberatan apa yang bisa diajukan dari perspektif kalam?

[LEVEL_BAHASA]`,
        },
        {
          title: "Dialog Filsafat: Uji Pemahaman",
          targetAI: "chatgpt",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], latihan [MADDAH]. [GAYA_BELAJAR].

Bertindaklah sebagai Ibnu Sina (atau [FILOSOF LAIN]). Aku akan berdialog tentang pemikiran [TOPIK].

Aku akan mengajukan pertanyaan dan keberatan. Kamu jawab dengan gaya pemikiran filosof tersebut. Koreksi aku kalau ada kesalahpahaman tentang pemikirannya.

Mulai dengan ringkasan posisi [FILOSOF] tentang [TOPIK].

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Soal Filsafat Islam",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, persiapan ujian [MADDAH].

Beri 6 soal: pokok pemikiran filosof tertentu, kritik Al-Ghazali, respons Ibnu Rusyd, beda falsafah-kalam, identifikasi filosof dari pemikiran.

Tulis Arab. Koreksi setelah aku jawab.

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Review Pasca Talaqqi Filsafat Islam",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Baru talaqqi tentang [TOPIK FILSAFAT] dari kitab [NAMA KITAB].

Catatan:

[PASTE CATATAN]

Tolong: susun sistematis (filosof → pemikiran → kritik → respons), tambahkan istilah teknis filsafat (Arab + transliterasi), pertanyaan untuk sesi berikutnya.

[LEVEL_BAHASA]`,
        },
      ],
      eksplorasi: [
        {
          title: "Relevansi Filsafat Islam untuk Aqidah Kontemporer",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Eksplorasi relevansi [MADDAH].

Jelaskan bagaimana argumen-argumen filsafat klasik (kosmologi, ontologi, epistemologi Ibnu Sina) masih relevan dalam:
1. Merespons ateisme modern (argumen keberadaan Allah)
2. Dialog dengan filsafat Barat kontemporer
3. Pendekatan Al-Azhar dalam dakwah intelektual

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
          title: "Pahami Konsep Dasar Mantiq",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan konsep-konsep dasar mantiq:
1. Tasawwur vs Tashdiq (teks Arab berharakat + definisi)
2. Kulliyatul Khams — 5 predikat universal: jins, naw', fashl, khasshah, 'ardh 'amm — masing-masing: teks Arab + definisi + contoh
3. Kulli vs Juz'i — beda dan contoh
4. Hadd (definisi) — jenis-jenis hadd yang sempurna (tam) dan tidak sempurna

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Qadhiyyah dan Jenisnya",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan qadhiyyah (proposisi) dalam mantiq:
1. Definisi qadhiyyah (teks Arab berharakat)
2. Jenis qadhiyyah: hamliyyah vs syarthiyyah — definisi + contoh
3. Qadhiyyah hamliyyah: muwajibah vs salibah, kulliyyah vs juz'iyyah
4. Jadwal murabba' (square of opposition) — 4 jenis qadhiyyah dan hubungan kontradiksi/kontrarisnya
5. Kebenaran dan kepalsuan qadhiyyah — contoh

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Qiyas Mantiqi (Silogisme)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan qiyas mantiqi (silogisme kategoris):
1. Struktur: muqaddimah kubra, muqaddimah sughra, natijah
2. Syarat validitas qiyas (intaj)
3. 4 shakl (figur silogisme) — masing-masing: posisi hudud, syarat, contoh
4. Beda qiyas mantiqi dari qiyas ushuli (keduanya menggunakan kata qiyas tapi berbeda)
5. Contoh susun 1 qiyas mantiqi yang valid tentang masalah syariat

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Drill Matan As-Sullam",
          targetAI: "notebooklm",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Menghafal matan As-Sullam Al-Munawraq.

Sesi drill:
1. Sebut tema/bab atau nomor bait
2. Aku recite bait berharakat
3. Koreksi kalau salah
4. Setelah 10 putaran, daftar yang perlu diperkuat

Fokus bab: [NAMA BAB kalau ada]

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Susun Qiyas Mantiqi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], drill [MADDAH]. [GAYA_BELAJAR].

Beri 5 pernyataan yang harus aku ubah menjadi qiyas mantiqi yang valid:

Format tiap soal: pernyataan dalam Indonesia (2-3 kalimat). Aku susun jadi muqaddimah kubra + sughra + natijah dalam bahasa Arab atau Indonesia.

JANGAN kasih jawaban dulu. Koreksi setelah aku menyusun.

[LEVEL_BAHASA]`,
        },
        {
          title: "Identifikasi Mughalathah (Sesat Pikir)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], belajar [MADDAH]. [GAYA_BELAJAR].

Beri 6 contoh argumen yang mengandung mughalathah (sesat pikir). Aku akan identifikasi jenis mughalathah-nya.

Jenis mughalathah yang mungkin: tasydid al-muqaddimah, mughalathah al-mushtarak, al-insidal (lingkaran setan), post hoc ergo propter hoc, dll.

Format tiap argumen: 1 paragraf singkat. JANGAN kasih jawaban dulu.

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Soal Mantiq",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, persiapan ujian [MADDAH].

Beri 6 soal: definisi istilah, susun hadd (definisi), identifikasi jenis qadhiyyah, validasi qiyas, identifikasi mughalathah, bait As-Sullam.

Tulis Arab. Koreksi setelah aku jawab.

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Review Pasca Talaqqi Mantiq",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Baru talaqqi tentang [BAB MANTIQ] dari kitab [NAMA KITAB].

Catatan:

[PASTE CATATAN]

Tolong: susun sistematis, tambahkan teks Arab berharakat untuk istilah dan definisi, contoh tambahan, pertanyaan untuk sesi berikutnya.

[LEVEL_BAHASA]`,
        },
      ],
      eksplorasi: [
        {
          title: "Mantiq Aristotelian vs Logika Modern",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Eksplorasi relevansi [MADDAH].

Bandingkan mantiq klasik (Aristotelian) yang dipelajari di Azhar dengan logika modern:
1. Apa yang dipelajari di logika modern yang tidak ada di mantiq klasik
2. Apa kelebihan mantiq klasik sebagai sistem
3. Bagaimana mantiq klasik masih berguna dalam ilmu kalam dan ushul fiqh
4. Pandangan ulama tentang mempelajari mantiq

[LEVEL_BAHASA]`,
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
          title: "Pahami Maqamat dan Ahwal",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan konsep maqamat dan ahwal:
1. Definisi maqam dan hal (teks Arab berharakat)
2. Beda maqam (usaha manusia) dan hal (anugerah Allah)
3. Maqamat utama dalam tasawwuf: Taubah, Zuhud, Sabr, Syukr, Khauf, Raja', Tawakkal, Ridha, Mahabbah, Ma'rifah — makna & urutan
4. Pandangan Al-Ghazali dalam Ihya tentang maqamat
5. Bagaimana maqamat ini berkaitan dengan tazkiyatun nafs

[LEVEL_BAHASA]

CATATAN: tasawwuf amali butuh bimbingan mursyid — AI bantu sisi ilmu.`,
        },
        {
          title: "Syarah Al-Hikam",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Ini hikam dari kitab Al-Hikam karya Ibnu 'Atha'illah:

[PASTE HIKAM DALAM ARAB BERHARAKAT]

Tolong syarah:
1. Tarjamah harfiyah
2. Makna esoterik yang dimaksud
3. Kaitannya dengan konsep maqamat atau ahwal
4. Bagaimana para syurrah terkenal menafsirkan hikam ini (mis. Al-Munawi, Ibnu 'Ibad)
5. Aplikasi praktis dalam kehidupan Masisir

[LEVEL_BAHASA]`,
        },
        {
          title: "Tasawwuf dalam Perspektif Syariat",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bagaimana hubungan tasawwuf dengan syariat?

Jelaskan:
1. Pandangan Al-Ghazali: tasawwuf adalah hakikat dari syariat, bukan di luar syariat
2. Tasawwuf yang mu'tabar (diterima) vs yang menyimpang (hulul, ittihad)
3. Bagaimana ulama membedakan tasawwuf yang benar dari yang menyimpang
4. Posisi Al-Azhar tentang tasawwuf

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Maqamat dan Urutannya",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Perlu hafal maqamat-maqamat tasawwuf menurut tokoh-tokoh berbeda.

Buatkan tabel perbandingan urutan maqamat menurut:
- Al-Ghazali (Ihya 'Ulumiddin)
- Al-Qusyairi (Ar-Risalah)
- Sarraj (Al-Luma')

Lalu buatkan mnemonic untuk hafal 10 maqamat Al-Ghazali.

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Analisis Teks Tasawwuf Klasik",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], belajar [MADDAH]. [GAYA_BELAJAR].

Ini paragraf dari kitab tasawwuf klasik (sebutkan kitab):

[PASTE TEKS ARAB]

Analisis:
1. Tarjamah harfiyah dan ma'nawiyyah
2. Istilah teknis tasawwuf yang muncul (Arab + transliterasi + definisi)
3. Maqam atau hal apa yang sedang dibahas
4. Apakah ada sisi yang perlu dikonfirmasi dengan ulama? (mis. kalimat yang bisa disalahpahami)

[LEVEL_BAHASA]`,
        },
        {
          title: "Refleksi Tazkiyatun Nafs",
          targetAI: "chatgpt",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, [GAYA_BELAJAR]. Sedang belajar [MADDAH].

Aku ingin merenungkan kondisi ruhani berdasarkan ajaran Al-Ghazali tentang [MAQAM/TEMA - mis. riya', kibr, hasad, dll].

Tolong bantu aku:
1. Penjelasan singkat tentang [MAQAM/TEMA] menurut Al-Ghazali
2. Tanda-tanda (alamat) seseorang terkena [PENYAKIT HATI INI]
3. Cara Al-Ghazali menyembuhkannya
4. Refleksi pertanyaan untuk muraqabah diri (bukan ceramah)

[LEVEL_BAHASA]

CATATAN: untuk praktik suluk yang lebih mendalam, konsultasi dengan mursyid.`,
        },
      ],
      ujian: [
        {
          title: "Mock Soal Tasawwuf",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, persiapan ujian [MADDAH].

Beri 6 soal: definisi maqam/hal, beda maqam-hal, urutan maqamat, identifikasi tokoh dari pemikiran, syarah hikam, hubungan tasawwuf-syariat.

Tulis Arab. Koreksi setelah aku jawab.

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Review Pasca Talaqqi Tasawwuf",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Baru talaqqi tentang [TOPIK TASAWWUF] dari kitab [NAMA KITAB].

Catatan:

[PASTE CATATAN]

Tolong: susun sistematis, tambahkan teks Arab berharakat (istilah dan kutipan), pertanyaan untuk sesi berikutnya.

CATATAN: amalan yang disebut syaikh, konsultasikan kembali langsung — tidak via AI.

[LEVEL_BAHASA]`,
        },
      ],
      eksplorasi: [
        {
          title: "Kritik dan Pembelaan Tasawwuf",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Eksplorasi debat seputar [MADDAH].

Jelaskan:
1. Kritik yang diajukan terhadap tasawwuf (dari ulama fiqh, ulama hadits, dan orientalis)
2. Pembelaan para sufi dan ulama yang mendukung tasawwuf
3. Al-Ghazali sebagai jembatan antara fiqh/kalam dan tasawwuf
4. Posisi Al-Azhar yang menerima tasawwuf mu'tabar

Jangan memihak. Sajikan dengan adil akademis.

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
    fakultas: ["ushuluddin", "syariah", "lughah", "dirasat", "quran"],
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
          title: "Pahami Tashrif Istilahi Lengkap",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan tashrif istilahi:
1. Definisi tashrif dengan teks Arab berharakat
2. Tabel 14 wazn tashrif fi'il — sertakan teks Arab berharakat untuk setiap baris
3. Perbedaan antara tashrif istilahi dan tashrif lughawi
4. Kenapa tashrif istilahi penting untuk memahami teks Arab

Gunakan fi'il contoh: كَتَبَ (kataba)

[LEVEL_BAHASA]

Fokus pada tashrif, bukan i'rab — keduanya berbeda (sharaf vs nahwu).`,
        },
        {
          title: "Pahami Wazn Fi'il dan Isim",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan sistem wazn dalam sharaf:
1. Apa yang dimaksud wazn (pola morfologis) — contoh: فَعَلَ, فَاعَلَ, أَفْعَلَ
2. Wazn fi'il mazid (dengan ziyadah): bab taf'il, mufa'alah, if'al, dll — makna masing-masing + contoh kata
3. Isim musytaq: fa'il, maf'ul, sifat musyabbahah, isim tafdil, isim zaman/makan, masdar — wazn masing-masing
4. Cara mengidentifikasi wazn dari kata Arab yang ditemukan di kitab

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami I'lal dan Ibdal",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan i'lal (perubahan huruf 'illah):
1. Huruf 'illah: waw, ya', alif — dan kenapa sering berubah
2. Jenis-jenis i'lal: i'lal bil qalb, bil hadf, bil iskan
3. Kaidah-kaidah i'lal yang paling sering berlaku
4. Contoh: waw → alif dalam مَاضٍ (dari وَضَى), alif → waw dalam قَالَ (dari قَوَلَ)

Lalu jelaskan ibdal (penggantian huruf): contoh ta' marbuthah dalam Fi'il → nun, dll.

[LEVEL_BAHASA]`,
        },
        {
          title: "Beda Sharaf dan Nahwu dalam Analisis Kata",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan perbedaan peran sharaf dan nahwu dalam analisis kata Arab:

Kata: [BERIKAN KATA ARAB BERHARAKAT]

Jelaskan:
1. Analisis dari sudut SHARAF: akar kata, wazn, kategori (fi'il/isim/huruf), tashrif, apakah ada i'lal
2. Analisis dari sudut NAHWU: kedudukannya dalam kalimat (marfu'/manshub/majrur), 'amil yang mempengaruhi

Ini akan memperlihatkan bahwa sharaf dan nahwu menganalisis kata dari sudut berbeda.

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Drill Tabel Tashrif Istilahi",
          targetAI: "notebooklm",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Menghafal tabel tashrif istilahi dari Al-Amtsilah At-Tashrifiyyah.

Sesi drill:
1. Sebut fi'il dan bab-nya
2. Aku recite tashrif istilahi lengkap (14 baris)
3. Koreksi kalau ada yang salah
4. Setelah 5 fi'il, beri daftar yang perlu diperkuat

Fi'il target: [SEBUTKAN FI'IL]

[LEVEL_BAHASA]`,
        },
        {
          title: "Mnemonic Wazn Isim Musytaq",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Perlu hafal wazn-wazn isim musytaq dalam sharaf.

Buatkan:
1. Tabel: nama isim musytaq → wazn (Arab berharakat) → contoh kata
2. Mnemonic atau akronim untuk hafal 7 jenis isim musytaq
3. Cara cepat membedakan isim fa'il dari sifat musyabbahah

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Identifikasi Wazn dari Kata",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], drill [MADDAH]. [GAYA_BELAJAR].

Beri 10 kata Arab berharakat (campuran fi'il, isim musytaq, isim jenis). Aku akan:
1. Sebutkan wazn-nya
2. Sebutkan jenis kata (fi'il madhi/mudhari', isim fa'il, masdar, dll)
3. Sebutkan akar kata (3 huruf)

JANGAN kasih jawaban dulu. Koreksi setelah aku jawab.

[LEVEL_BAHASA]`,
        },
        {
          title: "Analisis I'lal Kata",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], belajar [MADDAH]. [GAYA_BELAJAR].

Beri 8 kata Arab yang mengalami i'lal. Aku akan:
1. Identifikasi jenis i'lal (qalb/hadf/iskan)
2. Bentuk aslinya sebelum i'lal (asl)
3. Kaidah i'lal yang berlaku

Format tiap kata: tulis bentuk setelah i'lal berharakat. JANGAN kasih jawaban dulu.

[LEVEL_BAHASA]`,
        },
        {
          title: "Tashrif Fi'il Mazid",
          targetAI: "chatgpt",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], drill [MADDAH]. [GAYA_BELAJAR].

Beri 8 fi'il mujarrad. Aku akan:
1. Dermawy bab-bab fi'il mazid yang bisa dibentuk dari fi'il tersebut
2. Masdar setiap bab
3. Makna yang ditambahkan oleh ziyadah

Contoh: كَتَبَ → كَاتَبَ (mukata'ah), تَكَاتَبَ (mutawa'ah), dll.

JANGAN kasih jawaban dulu.

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Tahriri Sharaf",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, persiapan ujian Tahriri [MADDAH].

Beri 5 soal Azhari: tashrif fi'il tertentu, identifikasi wazn dari kata, penjelasan i'lal, perbedaan 2 jenis isim musytaq, identifikasi musytaq dari kata.

Tulis Arab. Koreksi setelah aku jawab.

[LEVEL_BAHASA]`,
        },
        {
          title: "Mock Syafawi Sharaf",
          targetAI: "chatgpt",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, latihan Syafawi [MADDAH]. [GAYA_BELAJAR].

Bertindaklah sebagai dosen Azhar. 5 pertanyaan: tashrif fi'il (kasih fi'il), identifikasi wazn, asal kata setelah i'lal, jenis isim musytaq, beda tashrif istilahi-lughawi.

Evaluasi di akhir.

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Review Pasca Talaqqi Sharaf",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Baru talaqqi tentang bab [BAB] dari kitab [NAMA KITAB].

Catatan:

[PASTE CATATAN]

Tolong: susun ulang (definisi → wazn → tashrif → i'lal kalau ada), tambahkan teks Arab berharakat, contoh kata tambahan, pertanyaan untuk sesi berikutnya.

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Catatan Talaqqi Sharaf yang Ambigu",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Catatan talaqqi [MADDAH] yang ambigu:

[PASTE CATATAN]

Interpretasi berdasarkan konteks ilmu sharaf, identifikasi konsep yang dibahas (wazn/tashrif/i'lal).

[LEVEL_BAHASA]`,
        },
      ],
      eksplorasi: [
        {
          title: "Sharaf dalam Al-Qur'an: Analisis Morfologis",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Eksplorasi aplikasi [MADDAH] dalam Al-Qur'an.

Pilih 1 paragraf ayat Al-Qur'an (3-5 ayat). Untuk setiap kata yang penting:
1. Wazn-nya
2. Jenis: fi'il (bab apa) atau isim (jenis apa)
3. Apakah ada i'lal? Apa jenis dan kaidahnya?
4. Bagaimana analisis sharaf ini membantu memahami makna ayat lebih dalam

[LEVEL_BAHASA]`,
        },
        {
          title: "Khilaf tentang Wazn Kata Tertentu",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Eksplorasi khilaf dalam [MADDAH].

Beberapa kata Arab mengalami khilaf para nahwiyyin/sharafiyyin tentang wazn atau tashrif-nya. Beri 3 contoh kata yang diperdebatkan wazn-nya.

Untuk setiap kata:
1. Kata (berharakat)
2. Pendapat pertama: wazn apa, dari siapa
3. Pendapat kedua: wazn apa, dari siapa
4. Dalil masing-masing
5. Implikasi perbedaan wazn terhadap makna (kalau ada)

[LEVEL_BAHASA]`,
        },
      ],
    },
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
    fakultas: ["ushuluddin", "lughah", "dirasat"],
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
          title: "Pahami Figur Balaghah Tertentu",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Aku ingin memahami: [NAMA FIGUR - mis. Isti'arah, Kinayah, Tasybih, Majaz Mursal, Tibaq, Jinas, dll]

Tolong jelaskan:
1. Definisi dengan teks Arab berharakat
2. Jenis-jenisnya (kalau ada)
3. Cara mengenali dalam teks (ciri-cirinya)
4. 3 contoh dari Al-Qur'an atau syi'r Arab klasik — tulis Arab berharakat
5. Beda dengan figur yang mirip (mis. isti'arah vs majaz mursal)

[LEVEL_BAHASA]`,
        },
        {
          title: "Analisis Balaghah Ayat Qur'an",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Analisis uslub balaghi dari ayat berikut:

[TULIS AYAT DENGAN HARAKAT - surah dan nomor ayat]

Tolong identifikasi:
1. Figur-figur balaghah yang ada (dari 'ilmu ma'ani, bayan, badi')
2. Untuk setiap figur: nama Arab, definisi singkat, bagaimana ayat ini menggunakannya
3. Keindahan atau efektivitas retorika yang dihasilkan
4. Bagaimana balaghah ayat ini berkontribusi pada i'jaz Qur'an

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Tasybih dan Jenisnya",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan tasybih (perumpamaan) secara komprehensif:
1. Definisi dan rukun-rukun tasybih (teks Arab berharakat)
2. Tasybih mufasshal vs mujmal vs muakkad (baligh)
3. Tasybih tamtsili — definisi + contoh dari Qur'an
4. Wajhus syabah: kenapa pemilihan wajh syabah mempengaruhi keindahan tasybih
5. 3 contoh tasybih dari Al-Qur'an dengan analisis

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Perbedaan Isti'arah, Majaz, Kinayah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Tiga figur balaghah yang sering tertukar: Isti'arah, Majaz Mursal, Kinayah.

Jelaskan:
1. Definisi masing-masing (teks Arab berharakat)
2. Perbedaan substansial ketiganya
3. Trik membedakannya saat membaca teks
4. 2 contoh setiap figur dari Al-Qur'an atau syi'r klasik

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Drill Istilah Balaghah",
          targetAI: "notebooklm",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Menghafal istilah-istilah balaghah dari kitab Al-Balaghah Al-Wadhihah.

Sesi drill:
1. Sebut nama figur balaghah
2. Aku jelaskan: definisi + jenis + 1 contoh
3. Koreksi kalau kurang tepat
4. Setelah 10 putaran, beri daftar yang perlu diperkuat

[LEVEL_BAHASA]`,
        },
        {
          title: "Mnemonic Pembagian Balaghah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Perlu hafal klasifikasi ilmu balaghah.

Buatkan peta klasifikasi:
- 'Ilmu Ma'ani: sub-bab utama dan istilah kunci
- 'Ilmu Bayan: sub-bab utama dan figur utama
- 'Ilmu Badi': pembagian muhassinat lafdiyah dan ma'nawiyah

Buatkan mnemonic untuk hafal isi masing-masing cabang.

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Identifikasi Figur Balaghah dari Teks",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], drill [MADDAH]. [GAYA_BELAJAR].

Beri 8 bait syi'r atau ayat Qur'an. Aku akan identifikasi figur balaghah yang ada.

Format tiap contoh: teks Arab berharakat + konteks (siapa penyair / surah apa). JANGAN kasih jawaban dulu.

Setelah aku jawab, koreksi + penjelasan kenapa figur tersebut benar.

[LEVEL_BAHASA]`,
        },
        {
          title: "Analisis Ma'ani dalam Kalimat",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], belajar [MADDAH]. [GAYA_BELAJAR].

Analisis kalimat-kalimat Arab ini dari sudut 'ilmu ma'ani:

[PASTE KALIMAT ARAB BERHARAKAT - bisa dari Qur'an atau syi'r]

Identifikasi:
1. Jenis kalimat: khabariyyah atau insya'iyyah — dan jenisnya
2. Apakah ada qasr (pembatasan)? Metode apa?
3. Apakah ada fashl, washl, atau ijaz?
4. Bagaimana pilihan struktur kalimat mempertegas makna

[LEVEL_BAHASA]`,
        },
        {
          title: "Tulis Kalimat dengan Figur Balaghah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], latihan kreatif [MADDAH]. [GAYA_BELAJAR].

Buatkan contoh kalimat Arab untuk setiap figur balaghah berikut (dengan topik yang sama, mis. "pelajar yang tekun"):
1. Tasybih mufasshal
2. Tasybih baligh
3. Isti'arah tashrihiyyah
4. Isti'arah makniyyah
5. Kinayah

Tulis semua berharakat + terjemah + penjelasan figur yang dipakai.

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Tahriri Balaghah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, persiapan ujian Tahriri [MADDAH].

Beri 5 soal Azhari: definisi figur, identifikasi figur dari teks, beda dua figur mirip, analisis balaghah ayat, badi' (jinas/tibaq).

Tulis Arab. Koreksi setelah aku jawab.

[LEVEL_BAHASA]`,
        },
        {
          title: "Mock Syafawi Balaghah",
          targetAI: "chatgpt",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, latihan Syafawi [MADDAH]. [GAYA_BELAJAR].

Bertindaklah sebagai dosen Azhar. 5 pertanyaan: definisi figur balaghah, identifikasi figur dari teks (kasih aku teks), beda isti'arah-majaz, analisis balaghah ayat Qur'an, cabang balaghah mana yang paling erat dengan i'jaz.

Evaluasi di akhir.

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Review Pasca Talaqqi Balaghah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Baru talaqqi tentang [BAB BALAGHAH] dari kitab [NAMA KITAB].

Catatan:

[PASTE CATATAN]

Tolong: susun (definisi → jenis → contoh → beda dengan figur mirip), tambahkan teks Arab berharakat, contoh ayat Qur'an tambahan, pertanyaan untuk sesi berikutnya.

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Catatan Talaqqi Balaghah yang Ambigu",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Catatan talaqqi [MADDAH] yang ambigu:

[PASTE CATATAN]

Interpretasi berdasarkan konteks ilmu balaghah, identifikasi figur yang dibahas.

[LEVEL_BAHASA]`,
        },
      ],
      eksplorasi: [
        {
          title: "I'jaz Balaghiy Al-Qur'an",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Eksplorasi i'jaz balaghi Al-Qur'an melalui [MADDAH].

Pilih 3 ayat yang ulama balaghah anggap sebagai puncak keindahan:
1. Tulis ayat berharakat
2. Jelaskan figur balaghah utama yang ada
3. Mengapa keindahan ini tidak bisa ditiru manusia?
4. Pandangan tokoh balaghah klasik: Al-Jurjani (Asrarul Balaghah), Zamakhsyari

[LEVEL_BAHASA]`,
        },
        {
          title: "Balaghah dalam Syi'r Arab Jahili",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Eksplorasi [MADDAH] dalam sastra pra-Islam.

Pilih 2 bait dari syi'r Jahili (dari Al-Mu'allaqat atau diwan terkenal). Untuk tiap bait:
1. Tulis berharakat
2. Nama penyair
3. Figur balaghah yang ada dan analisis keindahannya
4. Mengapa syi'r Jahili menjadi salah satu standar balaghah Arab

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
          title: "Ciri Khas Sastra Satu Periode",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan karakteristik sastra Arab periode: [PERIODE - mis. Jahiliyah / Shadr Islam / Umawi / Abbasi]

1. Latar historis-sosial periode ini (1 paragraf)
2. Tema-tema dominan dalam syi'r periode ini
3. Uslub (gaya bahasa) yang khas
4. Penyair-penyair terpenting (3-4 nama dengan Arab berharakat)
5. Contoh 2 bait representatif — tulis berharakat + tarjamah + nama penyair

[LEVEL_BAHASA]`,
        },
        {
          title: "Analisis Penyair Tertentu",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan penyair: [NAMA PENYAIR - mis. Imrul Qais, Jarir, Al-Farazdaq, Al-Mutanabbi, Abi Tammam]

1. Biografi singkat (masa, madzhab, latar)
2. Tema-tema dominan dalam diwannya
3. Uslub khas — figur balaghah yang sering dipakai
4. Karya/qasidah terpenting — sebutkan nama + tema
5. 4-6 bait representatif berharakat + terjemah
6. Posisinya dalam sejarah sastra Arab

[LEVEL_BAHASA]`,
        },
        {
          title: "Syarah Bait Syi'r",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Ini bait syi'r Arab:

[PASTE BAIT BERHARAKAT - sebutkan penyair dan qasidah]

Tolong syarah:
1. Tarjamah harfiyah
2. Tarjamah ma'nawiyyah (mengalir)
3. Gharib (kata-kata langka/sulit) — akar + makna
4. Uslub balaghi yang ada
5. Bahr (wazn/irama) bait ini
6. Konteks bait dalam qasidah/kehidupan penyair
7. Pelajaran atau keindahan sastra yang bisa diambil

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Bait-Bait Terkenal per Periode",
          targetAI: "notebooklm",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Menghafal bait-bait ikonik sastra Arab periode [PERIODE].

Sesi drill:
1. Sebut nama penyair
2. Aku recite 1 bait ikoniknya berharakat
3. Koreksi kalau ada yang salah
4. Setelah 10 putaran, daftar yang perlu diperkuat

Target penyair: [DAFTAR PENYAIR]

[LEVEL_BAHASA]`,
        },
        {
          title: "Mnemonic Penyair per Periode",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Perlu hafal penyair-penyair utama per periode sastra Arab.

Buatkan tabel: Periode → Penyair Utama → 1 tema/ciri khas penyair

Buatkan juga mnemonic untuk hafal minimal 2 penyair per periode.

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Identifikasi Periode dari Teks Sastra",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], drill [MADDAH]. [GAYA_BELAJAR].

Beri 5 kutipan syi'r Arab dari berbagai periode. Aku akan identifikasi:
- Periode sastra
- Petunjuk/ciri yang mengarah ke periode tersebut
- Kemungkinan penyairnya (kalau bisa ditebak)

Format tiap kutipan: bait berharakat + konteks minimal. JANGAN kasih jawaban dulu.

[LEVEL_BAHASA]`,
        },
        {
          title: "Bandingkan Dua Penyair",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], belajar [MADDAH]. [GAYA_BELAJAR].

Bandingkan dua penyair: [PENYAIR 1] vs [PENYAIR 2]

Aspek:
1. Tema dominan masing-masing
2. Uslub/gaya bahasa
3. Penggunaan figur balaghah
4. Kekuatan masing-masing
5. Kontroversi yang pernah terjadi antara keduanya (kalau ada)
6. Mana yang lebih berpengaruh — dan mengapa

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Tahriri Adab",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, persiapan ujian Tahriri [MADDAH].

Beri 5 soal Azhari: ciri sastra periode tertentu, syarah bait, identifikasi penyair dari uslub, banding dua penyair, tokoh prosa Arab.

Tulis Arab. Koreksi setelah aku jawab.

[LEVEL_BAHASA]`,
        },
        {
          title: "Mock Syafawi Adab",
          targetAI: "chatgpt",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, latihan Syafawi [MADDAH]. [GAYA_BELAJAR].

Bertindaklah sebagai dosen Azhar. 5 pertanyaan: ciri periode sastra, syarah bait (kasih aku bait), identifikasi penyair, banding dua penyair, tema tertentu dalam sastra Abbasi.

Evaluasi di akhir.

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Review Pasca Talaqqi Adab",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Baru talaqqi tentang [PERIODE/PENYAIR] dari kitab [NAMA KITAB].

Catatan:

[PASTE CATATAN]

Tolong: susun (latar historis → penyair/ciri → teks representatif), tambahkan bait Arab berharakat, contoh tambahan dari penyair lain, pertanyaan untuk sesi berikutnya.

[LEVEL_BAHASA]`,
        },
      ],
      eksplorasi: [
        {
          title: "Al-Mutanabbi: Penyair Kontroversial",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Eksplorasi Al-Mutanabbi dalam konteks [MADDAH].

Jelaskan:
1. Mengapa Al-Mutanabbi dianggap salah satu penyair terbesar Arab
2. Kontroversi seputar hidupnya (klaim kenabian, hubungan dengan penguasa)
3. Kritik ulama terhadap puisinya
4. Penilaian para kritikus sastra Arab terhadap diwannya
5. 2-3 bait yang mencerminkan keistimewaan (dan kontroversi) Al-Mutanabbi

[LEVEL_BAHASA]`,
        },
        {
          title: "Perbandingan Sastra Arab Klasik dan Modern",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Eksplorasi perkembangan [MADDAH] ke era modern.

Bandingkan syi'r Arab klasik (pra-abad 19) dengan syi'r Arab modern:
1. Apa yang berubah dalam tema, uslub, dan bentuk
2. Tokoh pelopor syir Arab modern (Ahmad Syauqi, Hafizh Ibrahim)
3. Kontroversi syi'r hurr (puisi bebas) — pendukung dan penolaknya
4. Bagaimana ulama dan akademisi Al-Azhar memandang perkembangan ini

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
          title: "Pahami Bahr Tertentu",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Aku ingin memahami bahr: [NAMA BAHR - mis. Thawil, Basith, Wafir, Kamil, Hazaj, dll]

Tolong jelaskan:
1. Pola taf'ilah bahr ini (tulis dalam taf'ilah Arab berharakat)
2. Cara mengingat pola ini
3. Zihaf yang sering terjadi di bahr ini
4. 2 bait contoh dari syi'r terkenal — tulis berharakat + taqthi' (dengan simbol | untuk pemisah)
5. Penyair dan qasidah yang sering memakai bahr ini

[LEVEL_BAHASA]`,
        },
        {
          title: "Cara Melakukan Taqthi' Bait",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Ajarkan aku langkah-langkah taqthi' (memotong bait) secara praktis:

1. Langkah 1: Tulis bait dengan harakat
2. Langkah 2: Tentukan suku kata (harakat = bergerak, sukun = mati)
3. Langkah 3: Tandai dengan simbol / (bergerak) dan 0 (mati)
4. Langkah 4: Kelompokkan menjadi taf'ilah
5. Langkah 5: Identifikasi bahr dari pola taf'ilah

Praktikkan dengan bait contoh: [PASTE BAIT BERHARAKAT]

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Istilah Qafiyah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan istilah-istilah dalam ilmu qafiyah:
1. Definisi qafiyah
2. Huruf-huruf qafiyah: rawiy, waishl, khuruj, ridif, ta'sis (Arab berharakat + definisi)
3. Jenis-jenis qafiyah: mutawatir, mutadarik, mutaraddif, mutawakis
4. 'Ayb qafiyah: iqwa', iqa', sinna' — definisi dan contoh
5. Cara mengidentifikasi qafiyah dari akhir bait

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Drill Nama dan Pola Bahr",
          targetAI: "notebooklm",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Menghafal nama-nama bahr dan pola taf'ilahnya.

Sesi drill:
1. Sebut nama bahr
2. Aku sebutkan pola taf'ilahnya (Arab berharakat)
3. Koreksi kalau salah
4. Setelah 10 bahr, beri daftar yang perlu diperkuat

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Taqthi' Bait",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], drill [MADDAH]. [GAYA_BELAJAR].

Beri 5 bait syi'r dari berbagai bahr. Aku akan:
1. Lakukan taqthi' (potong menjadi taf'ilah)
2. Identifikasi bahr-nya

Format tiap bait: tulis berharakat saja. JANGAN kasih bahr-nya dulu.

Setelah aku jawab, koreksi taqthi'ku per bait.

[LEVEL_BAHASA]`,
        },
        {
          title: "Identifikasi Zihaf dalam Bait",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], belajar [MADDAH]. [GAYA_BELAJAR].

Beri 4 bait yang mengandung zihaf atau 'illah. Aku akan:
1. Tandai di mana zihaf/illah-nya
2. Identifikasi jenis zihaf/illah (mis. khabn, thayyiy, 'ilal, dll)

Format tiap bait: tulis berharakat + bahr-nya. JANGAN kasih jawaban dulu.

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Soal 'Arudh",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, persiapan ujian [MADDAH].

Beri 6 soal: taqthi' bait, identifikasi bahr, sebutkan zihaf, istilah qafiyah, pola taf'ilah bahr tertentu, 'ayb qafiyah.

Tulis Arab. Koreksi setelah aku jawab.

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Review Pasca Talaqqi 'Arudh",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Baru talaqqi tentang bahr [NAMA BAHR] atau qafiyah dari kitab [NAMA KITAB].

Catatan:

[PASTE CATATAN]

Tolong: susun (bahr → pola → zihaf → contoh bait), tambahkan taf'ilah Arab berharakat, contoh bait tambahan, pertanyaan untuk sesi berikutnya.

[LEVEL_BAHASA]`,
        },
      ],
      eksplorasi: [
        {
          title: "Hubungan 'Arudh dengan Musik Arab",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Eksplorasi [MADDAH].

Jelaskan hubungan ilmu 'arudh dengan musik Arab:
1. Bagaimana bahr syi'r berkaitan dengan irama (maqam) musik Arab
2. Bagaimana syi'r berbeda dari nathr (prosa) secara irama
3. Bagaimana bahr yang berbeda menciptakan nuansa emosi yang berbeda
4. Apakah ada ulama yang menolak syi'r didengarkan — dan argumennya

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
          title: "Pahami Isytiqaq (Derivasi Kata)",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan isytiqaq (derivasi kata) dalam bahasa Arab:
1. Definisi isytiqaq (teks Arab berharakat)
2. Isytiqaq Shaghir — turunan langsung dari akar, contoh: ك-ت-ب → كتب، كاتب، مكتوب، كتابة
3. Isytiqaq Kabir — kata dari huruf-huruf akar yang sama tapi urutan berbeda (Ibnu Jinni)
4. Isytiqaq Akbar — hubungan kata berdasarkan persamaan makhraj
5. Manfaat memahami isytiqaq untuk membaca teks Arab dan Al-Qur'an

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Taraduf dan Addhad",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan dua fenomena khas bahasa Arab:

1. Taraduf (sinonim):
   - Definisi
   - Apakah taraduf hakiki ada dalam bahasa Arab? Khilaf ulama.
   - Contoh: beberapa kata untuk "singa", "pedang", "unta"
   - Dampak taraduf pada tafsir Qur'an

2. Addhad (antonim dari satu kata yang sama):
   - Definisi dan contoh terkenal: جَوْن (hitam dan putih), قَرْء (suci dan haid)
   - Penyebab terjadinya addhad
   - Dampak pada pemahaman teks

[LEVEL_BAHASA]`,
        },
        {
          title: "Perkembangan Makna Kata Arab",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan fenomena perkembangan makna (tatawwur ad-dalalah) dalam bahasa Arab:
1. Tawassu' ad-dalalah (perluasan makna) — definisi + contoh
2. Takhshish ad-dalalah (penyempitan makna) — definisi + contoh
3. Intiqal ad-dalalah (perpindahan makna) — definisi + contoh
4. Inkifaf ad-dalalah (pelemahan makna) dan Irtifa' (penguatan)
5. Dampak perkembangan makna pada pemahaman teks Qur'an dan hadits klasik

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Fenomena-Fenomena Fiqh Lughah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Perlu hafal istilah-istilah dan fenomena kunci dalam fiqh lughah.

Buatkan tabel: istilah (Arab berharakat) → definisi singkat → contoh

Istilah: isytiqaq, taraduf, addhad, musytarak lafdhi, ghara'ibul lughah, tahawwulud dalalah.

Lalu buatkan mnemonic untuk hafal fenomena utama.

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Analisis Isytiqaq Kata Al-Qur'an",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], drill [MADDAH]. [GAYA_BELAJAR].

Beri 6 kata dari Al-Qur'an. Aku akan analisis:
1. Akar kata (3 huruf)
2. Semua turunan penting dari akar ini yang muncul dalam Qur'an
3. Apakah ada perubahan makna antar turunan

Format tiap kata: tulis berharakat + surah-ayat. JANGAN kasih analisis dulu.

[LEVEL_BAHASA]`,
        },
        {
          title: "Identifikasi Taraduf dan Beda Nuansanya",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], belajar [MADDAH]. [GAYA_BELAJAR].

Beri 4 kelompok kata yang tampak sinonim dalam bahasa Arab. Aku akan:
1. Identifikasi apakah ini taraduf hakiki atau ada perbedaan nuansa
2. Jelaskan nuansa perbedaan masing-masing

Contoh: خَوْف vs رَهْبَة vs خَشْيَة vs رُعْب (semua bermakna "takut")

Format: berikan kelompok kata berharakat saja. JANGAN kasih penjelasan dulu.

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Soal Fiqh Lughah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, persiapan ujian [MADDAH].

Beri 6 soal: definisi isytiqaq, contoh taraduf + nuansa, contoh addhad, jenis perkembangan makna, analisis kata dari sudut fiqh lughah, khilaf tentang taraduf.

Tulis Arab. Koreksi setelah aku jawab.

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Review Pasca Talaqqi Fiqh Lughah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Baru talaqqi tentang [TOPIK FIQH LUGHAH] dari kitab [NAMA KITAB].

Catatan:

[PASTE CATATAN]

Tolong: susun sistematis, tambahkan definisi Arab berharakat, contoh kata tambahan, pertanyaan untuk sesi berikutnya.

[LEVEL_BAHASA]`,
        },
      ],
      eksplorasi: [
        {
          title: "Keunikan Bahasa Arab: Perspektif Al-Qur'an",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Eksplorasi keunikan bahasa Arab melalui [MADDAH].

Jelaskan keistimewaan bahasa Arab yang relevan dengan Al-Qur'an:
1. Kekayaan derivasi kata (isytiqaq) — bagaimana satu akar bisa melahirkan ratusan kata
2. Ketersediaan untuk pengucapan istilah agama yang tepat
3. Al-Jurjani dan konsep i'jaz balaghiy — hubungan dengan fiqh lughah
4. Ibnu Jinni dalam Al-Khasha'ish tentang keistimewaan bahasa Arab

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
          title: "Pahami Manhaj Naqd Klasik",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan manhaj naqd adabi klasik:
1. Kriteria naqd menurut Qudamah bin Ja'far dalam Naqdusy Syi'r
2. Kriteria naqd menurut Ibnu Thabathaba dalam 'Iyarusy Syi'r
3. Unsur-unsur yang dinilai dalam naqd klasik: lafal, makna, tasybih, ghira', dll
4. Tokoh-tokoh naqqad Arab klasik (selain Qudamah): Al-Asma'i, Ibnu Sallam, Ibnu Qutaybah

[LEVEL_BAHASA]`,
        },
        {
          title: "Kritik bait: Praktik Naqd",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Ini bait syi'r:

[PASTE BAIT BERHARAKAT - nama penyair]

Lakukan naqd adabi menggunakan pendekatan klasik:
1. Analisis lafal: keindahan, kefasihan, kelancaran
2. Analisis makna: kejelasan, kedalaman, kebenaran
3. Analisis tasybih/balaghah: apakah uslubnya tepat
4. Penilaian keseluruhan
5. Bandingkan dengan penilaian naqqad klasik tentang penyair ini (kalau ada)

[LEVEL_BAHASA]`,
        },
        {
          title: "Beda Manhaj Naqd Klasik dan Modern",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bandingkan naqd klasik dengan naqd modern:
1. Fokus dan kriteria yang berbeda
2. Manhaj naqd naffsi (psikologis) — ciri dan contoh
3. Manhaj naqd ijtima'i (sosiologis) — ciri dan contoh
4. Kelebihan dan kelemahan masing-masing pendekatan
5. Apakah ada jembatan antara keduanya?

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Kriteria dan Istilah Naqd",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Perlu hafal istilah dan kriteria dalam naqd adabi.

Buatkan tabel: istilah Arab berharakat → definisi → relevansi dalam naqd

Istilah: jaudah al-lafz, sihhatul ma'na, husnut tasybih, tanahur, sa'alah, tahrik al-'athifah, dll.

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Naqd Bait Syi'r",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], drill [MADDAH]. [GAYA_BELAJAR].

Beri 3 bait syi'r dari penyair berbeda. Aku akan melakukan naqd singkat untuk setiap bait:
- Kelebihan dari sisi lafal
- Kelebihan dari sisi makna
- Kelemahan (kalau ada)
- Nilai keseluruhan

Format: bait berharakat + nama penyair. JANGAN beri penilaian dulu.

[LEVEL_BAHASA]`,
        },
        {
          title: "Bandingkan Naqd Dua Naqqad",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], belajar [MADDAH]. [GAYA_BELAJAR].

Penyair: [NAMA PENYAIR]

Bandingkan penilaian dua naqqad berbeda terhadap penyair ini:
- Naqqad 1: siapa, apa pendapatnya, argumennya
- Naqqad 2: siapa, apa pendapatnya, argumennya
- Siapa yang lebih convincing — dan mengapa

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Soal Naqd Adabi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, persiapan ujian [MADDAH].

Beri 6 soal: definisi naqd adabi, kriteria naqd klasik, beda naqd klasik-modern, naqd bait (aku lakukan), identifikasi manhaj naqqad dari kutipan, naqqad tertentu dan karyanya.

Tulis Arab. Koreksi setelah aku jawab.

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Review Pasca Talaqqi Naqd Adabi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Baru talaqqi tentang [TOPIK NAQD] dari kitab [NAMA KITAB].

Catatan:

[PASTE CATATAN]

Tolong: susun sistematis, tambahkan definisi istilah Arab berharakat, contoh aplikasi ke teks, pertanyaan untuk sesi berikutnya.

[LEVEL_BAHASA]`,
        },
      ],
      eksplorasi: [
        {
          title: "Naqd Adabi di Era Digital",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Eksplorasi perkembangan [MADDAH].

Bagaimana naqd adabi berkembang di era digital?
1. Platform-platform naqd adabi Arab modern
2. Apakah standar naqd masih relevan untuk konten digital
3. Bagaimana AI (seperti yang aku gunakan sekarang) bisa dan tidak bisa menggantikan naqqad
4. Posisi akademisi Al-Azhar dalam debat sastra modern

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
    fakultas: ["ushuluddin", "syariah", "dirasat", "quran"],
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
          title: "Pahami Fase Sirah secara Mendalam",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan fase sirah: [FASE - mis. "Makkah awal" / "Ba'da Isra' Mi'raj" / "Periode Madinah" / "Fathul Makkah" / dll]

1. Latar historis dan kondisi umat Islam di fase ini
2. Peristiwa-peristiwa kunci — sebutkan minimal 4 dengan tanggal hijriyah
3. Wahyu Al-Qur'an yang turun di fase ini — sebutkan 2-3 surah relevan
4. Pelajaran dakwah dan aqidah yang bisa diambil dari fase ini

[LEVEL_BAHASA]`,
        },
        {
          title: "Analisis Peristiwa Sirah dan Hikmahnya",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Peristiwa: [SEBUTKAN - mis. "Perang Badar", "Hijrah ke Madinah", "Fathu Makkah", "Perjanjian Hudaibiyah"]

Analisis:
1. Latar belakang (konteks sebelum peristiwa)
2. Kronologi peristiwa
3. Hikmah dan pelajaran (minimal 3) — dari sudut fiqhus sirah
4. Relevansi pelajaran ini untuk kehidupan Muslim hari ini

[LEVEL_BAHASA]`,
        },
        {
          title: "Kronologi Ghazwah Nabi ﷺ",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Buatkan tabel kronologi ghazwah (perang yang Rasulullah ﷺ ikut langsung):

Kolom: Nama ghazwah | Tahun hijriyah | Lawan | Hasil | 1 hikmah utama

Urutan dari ghazwah pertama (Abwa'/Waddan) sampai ghazwah terakhir (Tabuk).

[LEVEL_BAHASA]`,
        },
        {
          title: "Akhlak dan Kepribadian Rasulullah ﷺ",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan akhlak Rasulullah ﷺ dalam berbagai dimensi:
1. Akhlak dalam rumah tangga — dalil dari sirah/hadits
2. Akhlak dengan Sahabat dan umat
3. Akhlak dengan musuh dan non-Muslim
4. Sifat fisik (hilye) — hadits tentang gambaran fisik Rasul
5. Bagaimana meneladani akhlak Rasul sebagai Masisir di Mesir

[LEVEL_BAHASA]

Sertakan hadits-hadits shahih berharakat untuk poin-poin penting.`,
        },
      ],
      hafal: [
        {
          title: "Drill Kronologi Sirah",
          targetAI: "notebooklm",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Menghafal kronologi peristiwa sirah dari kitab [NAMA KITAB].

Sesi drill:
1. Sebut tahun hijriyah
2. Aku sebutkan peristiwa-peristiwa di tahun itu
3. Koreksi kalau salah atau kurang lengkap
4. Setelah 10 putaran, beri daftar yang perlu diperkuat

Fokus: [FASE - Makkah / Madinah / keduanya]

[LEVEL_BAHASA]`,
        },
        {
          title: "Mnemonic Nama-Nama Ghazwah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Perlu hafal 27 ghazwah Rasulullah ﷺ secara urut.

Buatkan:
1. Daftar 27 ghazwah dengan tahun hijriyah dan hasil (menang/pelajaran)
2. Akronim atau mnemonic Indonesia untuk hafal 5-7 ghazwah terpenting
3. Cara membedakan ghazwah dari sariyyah (ekspedisi tanpa Rasul langsung)

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Istinbat Pelajaran dari Sirah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], drill [MADDAH]. [GAYA_BELAJAR].

Beri 5 peristiwa sirah. Aku akan istinbat pelajaran dakwah/fiqh dari setiap peristiwa.

Format tiap peristiwa: nama + deskripsi singkat (2 kalimat). JANGAN kasih istinbat dulu.

Setelah aku jawab, bandingkan dengan pelajaran yang diambil Al-Buthi dalam Fiqhus Sirah.

[LEVEL_BAHASA]`,
        },
        {
          title: "Sirah dan Konteks Al-Qur'an",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], belajar [MADDAH]. [GAYA_BELAJAR].

Peristiwa sirah: [SEBUTKAN PERISTIWA]

Hubungkan dengan Al-Qur'an:
1. Ayat-ayat yang turun berkaitan dengan peristiwa ini — sertakan berharakat
2. Bagaimana sirah membantu memahami ayat-ayat tersebut (asbabun nuzul)
3. Bagaimana ayat-ayat tersebut memperkuat pemahaman kita tentang peristiwa sirah

[LEVEL_BAHASA]`,
        },
        {
          title: "Analisis Strategi Dakwah Rasulullah ﷺ",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], belajar [MADDAH]. [GAYA_BELAJAR].

Analisis strategi dakwah Rasulullah ﷺ di fase: [FASE - mis. Makkah / Madinah awal]

1. Sasaran dakwah prioritas di fase ini
2. Metode dakwah yang digunakan (personal, publik, melalui surat, dll)
3. Bagaimana beliau menghadapi hambatan
4. Pelajaran manhaj dakwah yang bisa diambil dari fase ini

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Tahriri Sirah Nabawiyah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, persiapan ujian Tahriri [MADDAH].

Beri 5 soal Azhari: kronologi fase sirah, analisis peristiwa dan hikmah, ghazwah tertentu, akhlak Rasul, hubungan sirah dengan Qur'an.

Tulis Arab. Koreksi setelah aku jawab.

[LEVEL_BAHASA]`,
        },
        {
          title: "Mock Syafawi Sirah Nabawiyah",
          targetAI: "chatgpt",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, latihan Syafawi [MADDAH]. [GAYA_BELAJAR].

Bertindaklah sebagai dosen Azhar. 5 pertanyaan: kronologi fase sirah, peristiwa tertentu (kasih nama, aku jelaskan), hikmah ghazwah, akhlak Rasul, pelajaran dakwah untuk hari ini.

Evaluasi di akhir.

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Review Pasca Talaqqi Sirah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Baru talaqqi tentang [PERISTIWA/FASE] dari kitab [NAMA KITAB].

Catatan:

[PASTE CATATAN]

Tolong: susun kronologis (latar → peristiwa → pelajaran), tambahkan teks Arab hadits/ayat berharakat yang relevan, pertanyaan untuk sesi berikutnya.

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Catatan Talaqqi Sirah yang Ambigu",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Catatan talaqqi [MADDAH] yang ambigu:

[PASTE CATATAN]

Interpretasi berdasarkan konteks sirah, identifikasi peristiwa yang dimaksud, lengkapi yang kurang.

[LEVEL_BAHASA]`,
        },
      ],
      eksplorasi: [
        {
          title: "Perjanjian Hudaibiyah: Teladan Diplomasi",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Eksplorasi Perjanjian Hudaibiyah dalam konteks [MADDAH].

Jelaskan:
1. Latar dan kronologi peristiwa Hudaibiyah
2. Isi perjanjian dan apa yang tampak merugikan di permukaan
3. Bagaimana Al-Qur'an menyebut ini "fathun mubin" (kemenangan nyata) — ayat berharakat
4. Hikmah jangka panjang yang terbukti
5. Pelajaran diplomatik dan strategis yang bisa diambil

[LEVEL_BAHASA]`,
        },
        {
          title: "Sirah dan Pertanyaan Orientalis",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Eksplorasi [MADDAH] dalam menghadapi tantangan intelektual.

Beberapa orientalis mengajukan pertanyaan atau kritik terhadap aspek tertentu sirah Nabi. Jelaskan:
1. Contoh 2-3 pertanyaan/kritik yang sering diajukan
2. Respons ulama terhadap masing-masing
3. Metodologi yang benar dalam membaca sirah secara akademis
4. Panduan Al-Azhar dalam merespons kritik terhadap sirah

Pendekatan akademis-apologetik yang seimbang.

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
    fakultas: ["syariah", "dirasat", "ushuluddin"],
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
          title: "Pahami Fase Tasyri' Tertentu",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan fase tasyri': [FASE - mis. "Fase Rasulullah" / "Fase Sahabat" / "Fase Tabi'in" / "Fase Kodifikasi Madzhab"]

1. Ciri umum fase ini
2. Metode istinbat yang digunakan
3. Tokoh-tokoh utama dan perannya
4. Peristiwa hukum penting di fase ini
5. Warisan yang ditinggalkan untuk fase berikutnya

[LEVEL_BAHASA]`,
        },
        {
          title: "Sejarah Kodifikasi Madzhab Empat",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan bagaimana 4 madzhab fiqh terbentuk dan dikodifikasi:
1. Imam Abu Hanifah — latar belakang, metode, murid-murid penyebar madzhab
2. Imam Malik — Al-Muwaththa' sebagai kodifikasi pertama
3. Imam Syafi'i — peran dalam sistemisasi ushul fiqh, kitab Al-Umm
4. Imam Ahmad — Al-Musnad, karakteristik madzhab
5. Mengapa madzhab ini survive sampai hari ini, sementara banyak madzhab lain hilang?

[LEVEL_BAHASA]`,
        },
        {
          title: "Metode Istinbat Sahabat Besar",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bandingkan metode istinbat 3-4 Sahabat besar:

Pilih dari: 'Umar bin Khattab, 'Ali bin Abi Thalib, Ibnu Mas'ud, Ibnu Abbas, Aisyah, Zaid bin Tsabit

Untuk setiap Sahabat yang dipilih:
1. Kecenderungan metodologis (lebih literal atau lebih kontekstual?)
2. Contoh keputusan hukum yang mencerminkan metodologinya
3. Pengaruhnya pada madzhab fiqh yang muncul setelahnya

[LEVEL_BAHASA]`,
        },
        {
          title: "Tasyri' Modern: Lembaga Fatwa dan Undang-Undang",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan fase tasyri' modern:
1. Transisi dari fiqh madzhabi ke kodifikasi hukum — kapan dan bagaimana
2. Majallatul Ahkam Al-'Adliyyah (Utsmani) — perannya dalam sejarah kodifikasi
3. Lembaga fatwa modern: Al-Azhar, OKI, MUI — bagaimana mereka berfungsi
4. Tantangan tasyri' kontemporer: globalisasi, teknologi, hukum internasional

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Drill Fase Tasyri' dan Cirinya",
          targetAI: "notebooklm",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Menghafal 5 fase tarikh tasyri' dan ciri-cirinya.

Sesi drill:
1. Sebut nama fase
2. Aku sebutkan: periode, ciri utama, tokoh kunci, metode istinbat
3. Koreksi kalau salah atau kurang
4. Setelah 5 fase, beri ringkasan yang perlu diperkuat

[LEVEL_BAHASA]`,
        },
        {
          title: "Mnemonic Sejarah Madzhab",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Perlu hafal urutan kronologis terbentuknya 4 madzhab.

Buatkan tabel: Madzhab → Imam → Masa hidup → Wilayah → 1 ciri khas metodologis

Buatkan juga mnemonic untuk hafal urutan kronologis 4 imam madzhab.

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Analisis Perkembangan Hukum satu Masalah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], drill [MADDAH]. [GAYA_BELAJAR].

Masalah fiqh: [SEBUTKAN MASALAH - mis. "hukum riba", "talaq bid'i", "jual beli salam"]

Trace perkembangan hukum masalah ini:
1. Di fase Rasulullah — wahyu atau hadits yang berkaitan
2. Ijtihad Sahabat tentang masalah ini
3. Perkembangan di fase tabi'in dan tabi'ut tabi'in
4. Pendapat akhir madzhab empat
5. Perkembangan di era modern

[LEVEL_BAHASA]`,
        },
        {
          title: "Identifikasi Fase dari Kutipan Sumber Fiqh",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], belajar [MADDAH]. [GAYA_BELAJAR].

Beri 4 kutipan dari sumber fiqh yang berbeda. Aku akan identifikasi:
- Dari fase tasyri' mana kutipan ini berasal
- Ciri-ciri yang menunjukkan fase tersebut

Format: kutipan Arab berharakat + konteks minimal. JANGAN kasih jawaban dulu.

[LEVEL_BAHASA]`,
        },
        {
          title: "Peran 'Umar bin Khattab dalam Tasyri'",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], belajar [MADDAH]. [GAYA_BELAJAR].

Jelaskan peran 'Umar bin Khattab dalam tarikh tasyri':
1. Ijtihad 'Umar yang kontroversial — berikan 3 contoh dengan analisis
2. Prinsip maslahat dalam keputusan 'Umar
3. Pengaruh metode 'Umar pada madzhab fiqh (khususnya Maliki dan Hanbali)
4. Respons ulama hadits dan ushul terhadap ijtihad 'Umar

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Tahriri Tarikh Tasyri'",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, persiapan ujian Tahriri [MADDAH].

Beri 5 soal Azhari: fase tasyri' dan cirinya, tokoh dan kontribusinya, sejarah madzhab, metode istinbat sahabat, fiqh modern.

Tulis Arab. Koreksi setelah aku jawab.

[LEVEL_BAHASA]`,
        },
        {
          title: "Mock Syafawi Tarikh Tasyri'",
          targetAI: "chatgpt",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, latihan Syafawi [MADDAH]. [GAYA_BELAJAR].

Bertindaklah sebagai dosen Azhar. 5 pertanyaan: sebutkan fase tasyri', ciri fase tertentu, tokoh dan metodenya, sejarah madzhab, tantangan tasyri' kontemporer.

Evaluasi di akhir.

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Review Pasca Talaqqi Tarikh Tasyri'",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Baru talaqqi tentang [FASE/TOPIK] dari kitab [NAMA KITAB].

Catatan:

[PASTE CATATAN]

Tolong: susun kronologis, tambahkan nama Arab berharakat untuk tokoh dan karya, pertanyaan untuk sesi berikutnya.

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Catatan Talaqqi yang Ambigu",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Catatan talaqqi [MADDAH] yang ambigu:

[PASTE CATATAN]

Interpretasi berdasarkan konteks tarikh tasyri', identifikasi fase dan tokoh yang dimaksud.

[LEVEL_BAHASA]`,
        },
      ],
      eksplorasi: [
        {
          title: "Imam Syafi'i dan Revolusi Ushul Fiqh",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Eksplorasi kontribusi Imam Syafi'i dalam [MADDAH].

Jelaskan:
1. Kondisi ijtihad sebelum Imam Syafi'i — fragmentasi dan ketidakkonsistenan
2. Kontribusi Imam Syafi'i: Al-Risalah sebagai kitab ushul fiqh pertama yang sistematis
3. Bagaimana Imam Syafi'i menyatukan ahlul hadits dan ahlur ra'yi
4. Kritik terhadap Imam Syafi'i dari perspektif historis
5. Pengaruh metodologinya terhadap perkembangan fiqh sampai hari ini

[LEVEL_BAHASA]`,
        },
        {
          title: "Fiqh Aqalliyat: Tasyri' di Era Global",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Eksplorasi perkembangan tasyri' terbaru.

Jelaskan konsep fiqh aqalliyat (fiqh minoritas Muslim):
1. Apa yang dimaksud dan mengapa ia muncul sebagai disiplin
2. Tokoh-tokoh yang mengembangkannya (Yusuf Al-Qaradhawi, Taha Jabir Al-'Alwani)
3. Argumen pendukung dan kritik terhadap pendekatan ini
4. Bagaimana Al-Azhar memandang fiqh aqalliyat

Jangan men-tarjih.

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
    fakultas: ["lughah", "dirasat", "ushuluddin"],
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
          title: "Pahami Satu Periode Daulah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan periode: [DAULAH - mis. "Daulah Umawiyyah", "Daulah Abbasiyyah", "Khulafa Ar-Rasyidun"]

1. Pendiri dan tahun berdiri
2. Puncak kejayaan dan tokoh terpenting
3. Kontribusi pada peradaban Islam (keilmuan, pemerintahan, militer)
4. Sebab-sebab kemunduran dan akhir daulah
5. Warisan yang ditinggalkan

[LEVEL_BAHASA]`,
        },
        {
          title: "Analisis Sebab Kemajuan dan Kemunduran",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Analisis faktor-faktor kemajuan dan kemunduran dalam [DAULAH/PERIODE]:

Faktor kemajuan: internal (aqidah, kepemimpinan, ilmu) dan eksternal (geopolitik)
Faktor kemunduran: internal (konflik saudara, kelalaian, kemerosotan moral) dan eksternal (serangan, kompetisi)

Berikan bukti historis konkret untuk setiap faktor. Apa pelajaran yang bisa diambil?

[LEVEL_BAHASA]`,
        },
        {
          title: "Tokoh Penting dalam Sejarah Islam",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan tokoh: [NAMA TOKOH - mis. Shalahuddin Al-Ayyubi, Harun Ar-Rasyid, Ibnu Khaldun, Muhammad Al-Fatih]

1. Biografi singkat: masa, latar, pendidikan
2. Kontribusi terpenting dalam sejarah Islam
3. Tantangan yang dihadapi dan bagaimana diatasi
4. Warisan historis — bagaimana dunia berbeda tanpanya?

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Drill Kronologi Daulah Islam",
          targetAI: "notebooklm",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Menghafal kronologi daulah-daulah Islam.

Sesi drill:
1. Sebut nama daulah
2. Aku sebutkan: pendiri, tahun, ibukota, puncak, akhir
3. Koreksi kalau salah
4. Setelah 10 putaran, beri daftar yang perlu diperkuat

[LEVEL_BAHASA]`,
        },
        {
          title: "Mnemonic Urutan Khulafa dan Daulah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Perlu hafal urutan kronologis sejarah Islam.

Buatkan garis waktu visual (timeline) dengan:
- Nama daulah
- Rentang tahun hijriyah
- 1-2 tokoh utama
- 1 peristiwa terpenting

Buatkan juga mnemonic untuk hafal urutan utama.

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Analisis Komparatif Dua Daulah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], drill [MADDAH]. [GAYA_BELAJAR].

Bandingkan dua daulah: [DAULAH 1] vs [DAULAH 2]

Aspek perbandingan:
1. Model pemerintahan dan suksesi
2. Pendekatan terhadap ilmu dan ulama
3. Ekspansi wilayah dan hubungan dengan non-Muslim
4. Sebab kemunduran — apakah ada pola yang sama?

[LEVEL_BAHASA]`,
        },
        {
          title: "Analisis Peristiwa Bersejarah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], belajar [MADDAH]. [GAYA_BELAJAR].

Peristiwa: [SEBUTKAN - mis. "Jatuhnya Baghdad 656H", "Perang Salib", "Fathul Qustanthiniyyah"]

Analisis:
1. Konteks sebelum peristiwa
2. Kronologi peristiwa
3. Dampak jangka pendek dan jangka panjang
4. Pelajaran yang bisa diambil

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Tahriri Tarikh Islam",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, persiapan ujian Tahriri [MADDAH].

Beri 5 soal Azhari: deskripsi daulah tertentu, analisis sebab kemunduran, tokoh penting, peristiwa bersejarah, perbandingan dua periode.

Tulis Arab. Koreksi setelah aku jawab.

[LEVEL_BAHASA]`,
        },
        {
          title: "Mock Syafawi Tarikh Islam",
          targetAI: "chatgpt",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, latihan Syafawi [MADDAH]. [GAYA_BELAJAR].

Bertindaklah sebagai dosen Azhar. 5 pertanyaan: identifikasi daulah dari ciri, tokoh tertentu (kasih nama, aku jelaskan), sebab kemunduran daulah tertentu, pelajaran sejarah, peristiwa besar.

Evaluasi di akhir.

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Review Pasca Talaqqi Tarikh Islam",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Baru talaqqi tentang [PERIODE/DAULAH] dari kitab [NAMA KITAB].

Catatan:

[PASTE CATATAN]

Tolong: susun kronologis, tambahkan nama Arab berharakat untuk tokoh dan peristiwa penting, pertanyaan untuk sesi berikutnya.

[LEVEL_BAHASA]`,
        },
      ],
      eksplorasi: [
        {
          title: "Ibn Khaldun dan Teori Kemajuan-Kemunduran",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Eksplorasi teori Ibnu Khaldun dalam [MADDAH].

Jelaskan teori ashabiyyah dan siklus sejarah Ibnu Khaldun:
1. Konsep 'ashabiyyah — definisi dan perannya
2. Siklus 4 generasi daulah menurut Ibnu Khaldun
3. Bukti historis dari sejarah Islam yang mendukung teorinya
4. Kritik terhadap teorinya — apakah semua daulah mengikuti siklus ini?
5. Relevansi teori Ibnu Khaldun untuk memahami kondisi umat Islam hari ini

[LEVEL_BAHASA]`,
        },
        {
          title: "Mesir dalam Sejarah Islam",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Eksplorasi peran Mesir dalam [MADDAH].

Sebagai Masisir di Mesir, aku ingin pahami peran Mesir dalam sejarah Islam:
1. Mesir di era Sahabat — penaklukan dan tokoh (Amr bin Al-'Ash)
2. Mesir di era Tuluniyyah dan Ikhsyidiyyah
3. Mesir di era Fatimiyyah — peran Al-Azhar
4. Mesir di era Mamluk — benteng terakhir Islam dari Mongol
5. Mesir Ottoman dan era modern

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
          title: "Pahami Aspek Peradaban Islam",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan aspek peradaban Islam: [ASPEK - mis. "Institusi Keilmuan", "Arsitektur Islam", "Kontribusi Sains", "Hukum dan Administrasi"]

1. Gambaran umum aspek ini dalam peradaban Islam
2. Periode kejayaan dan daulah yang paling berkontribusi
3. Tokoh-tokoh utama (nama Arab berharakat)
4. Warisan yang masih tersisa sampai hari ini
5. Pengaruh ke peradaban Barat atau dunia

[LEVEL_BAHASA]`,
        },
        {
          title: "Kontribusi Ilmuwan Muslim dalam Sains",
          targetAI: "perplexity",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan kontribusi ilmuwan Muslim dalam bidang: [BIDANG - mis. matematika, astronomi, kedokteran, kimia, geografi]

1. Ilmuwan utama di bidang ini (nama Arab berharakat)
2. Kontribusi spesifik masing-masing
3. Karya/kitab utama mereka
4. Bagaimana kontribusi ini sampai ke Eropa dan mempengaruhi Renaissance
5. Sertakan sumber/referensi terpercaya kalau ada

[LEVEL_BAHASA]`,
        },
        {
          title: "Bayt Al-Hikmah dan Tradisi Keilmuan Islam",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan Bayt Al-Hikmah di Baghdad era Abbasi:
1. Sejarah pendirian dan perkembangannya
2. Fungsi dan kegiatan di dalamnya
3. Proyek terjemahan — apa yang diterjemahkan dan dampaknya
4. Tokoh-tokoh yang berkarya di sana
5. Akhir Bayt Al-Hikmah — dampak penghancurannya pada peradaban Islam

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Ilmuwan Muslim dan Kontribusinya",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Perlu hafal ilmuwan Muslim utama dan kontribusinya.

Buatkan tabel: Nama (Arab berharakat + transliterasi) | Bidang | Kontribusi utama | Karya terpenting | Era/Daulah

Minimal 10 ilmuwan dari berbagai bidang.

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Analisis Faktor Kemajuan Peradaban Islam",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], belajar [MADDAH]. [GAYA_BELAJAR].

Analisis faktor-faktor yang menyebabkan kemajuan peradaban Islam di era Abbasi:
1. Faktor aqidah dan epistemologis — bagaimana Islam mendorong keilmuan
2. Faktor institusional — madrasah, perpustakaan, patronase khalifah
3. Faktor sintesis — bagaimana Muslim mengintegrasikan keilmuan Yunani, Persia, India
4. Faktor apa yang hilang saat peradaban mulai menurun

[LEVEL_BAHASA]`,
        },
        {
          title: "Warisan Peradaban Islam di Dunia Modern",
          targetAI: "perplexity",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], belajar [MADDAH]. [GAYA_BELAJAR].

Sebutkan 5-7 warisan konkret peradaban Islam yang masih digunakan di dunia modern:
1. Kata-kata serapan dari bahasa Arab dalam bahasa ilmiah/modern
2. Konsep matematika/sains yang berasal dari ilmuwan Muslim
3. Metode/institusi yang menginspirasi Barat
4. Sertakan referensi/sumber yang bisa diverifikasi

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Soal Hadharah Islamiyyah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, persiapan ujian [MADDAH].

Beri 6 soal: aspek peradaban Islam, ilmuwan dan kontribusinya, institusi keilmuan, sebab kemajuan, pengaruh ke Barat, warisan peradaban.

Tulis Arab. Koreksi setelah aku jawab.

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Review Pasca Talaqqi Hadharah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Baru talaqqi tentang [ASPEK HADHARAH] dari kitab [NAMA KITAB].

Catatan:

[PASTE CATATAN]

Tolong: susun sistematis, tambahkan nama Arab berharakat untuk tokoh dan institusi, pertanyaan untuk sesi berikutnya.

[LEVEL_BAHASA]`,
        },
      ],
      eksplorasi: [
        {
          title: "Mengapa Peradaban Islam Berhenti?",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Eksplorasi kemunduran [MADDAH].

Pertanyaan besar: mengapa peradaban Islam yang pernah memimpin dunia mengalami kemunduran?

Jelaskan berbagai teori:
1. Teori internal: perpecahan politik, melemahnya semangat keilmuan, kemerosotan
2. Teori eksternal: Perang Salib, invasi Mongol, penjajahan Eropa
3. Teori kultural: pengaruh taklid, menutupnya pintu ijtihad
4. Siapa yang setuju dengan masing-masing teori dan mengapa

Jangan mengambil satu posisi — sajikan debat intelektual ini.

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
          title: "Pahami Ushul dan Rukun Dakwah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan ushul (prinsip-prinsip dasar) dakwah:
1. Definisi dakwah (teks Arab berharakat)
2. Rukun dakwah: da'i, mad'u, pesan (materi), sarana, tujuan
3. Syarat-syarat da'i yang efektif
4. Dalil kewajiban dakwah dari Al-Qur'an (sertakan ayat berharakat)
5. Bagaimana ushul ini diterapkan dalam dakwah kontemporer

[LEVEL_BAHASA]`,
        },
        {
          title: "Manhaj Dakwah Para Nabi dalam Al-Qur'an",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Analisis manhaj dakwah dari kisah nabi berikut dalam Al-Qur'an:

[PILIH NABI - mis. Nabi Ibrahim / Nabi Musa / Nabi Nuh]

1. Bagaimana beliau memulai dakwah
2. Sasaran dakwahnya
3. Metode yang digunakan (hikmah/mau'izhah/mujadalah)
4. Rintangan yang dihadapi dan cara mengatasinya
5. Pelajaran manhaj dakwah untuk da'i modern

Sertakan ayat-ayat Al-Qur'an berharakat yang relevan.

[LEVEL_BAHASA]`,
        },
        {
          title: "Hikmah, Mau'izhah, Mujadalah: 3 Metode Dakwah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan 3 metode dakwah berdasarkan An-Nahl:125:

"ادعُ إلى سبيل ربك بالحكمة والموعظة الحسنة وجادلهم بالتي هي أحسن"

1. Al-Hikmah: definisi, kapan digunakan, contoh dari sirah
2. Al-Mau'izhah Al-Hasanah: definisi, kapan digunakan, contoh
3. Al-Mujadalah bil-Lati Hiya Ahsan: definisi, kapan digunakan, contoh
4. Bagaimana memilih metode yang tepat untuk sasaran tertentu

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Ushul dan Kaidah Dakwah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Perlu hafal ushul dan kaidah-kaidah dakwah dari Abdul Karim Zaidan.

Buatkan:
1. Daftar 10 kaidah dakwah terpenting (Arab berharakat + makna Indonesia)
2. Mnemonic atau cara mudah mengingat urutan ushul dakwah

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Susun Materi Dakwah",
          targetAI: "chatgpt",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], latihan [MADDAH]. [GAYA_BELAJAR].

Aku ingin menyusun materi dakwah untuk:

Topik: [TOPIK DAKWAH]
Sasaran: [TARGET MAD'U - mis. pemuda Muslim, mahasiswa baru, mualaf, dll]
Sarana: [SARANA - mis. khutbah Jumat, ceramah 15 menit, konten media sosial]

Bantu susun outline materi:
1. Pembukaan yang relevan dengan sasaran
2. Poin utama (3-4 poin dengan dalil Al-Qur'an/hadits berharakat)
3. Cerita/qisshah pendek yang relevan
4. Penutup dengan ajakan konkret

[LEVEL_BAHASA]`,
        },
        {
          title: "Analisis Hambatan Dakwah dan Solusinya",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], belajar [MADDAH]. [GAYA_BELAJAR].

Aku menghadapi hambatan dalam dakwah: [DESKRIPSIKAN SITUASI - mis. mad'u tidak mau mendengar, suasana tidak kondusif, konten tidak sampai ke target]

Jelaskan dari perspektif fiqhud dakwah:
1. Apakah hambatan ini termasuk jenis apa (mad'u, da'i, pesan, sarana)
2. Bagaimana para nabi menghadapi hambatan serupa
3. Solusi praktis berdasarkan manhaj dakwah
4. Kapan boleh "meninggalkan" dakwah kepada seseorang (tanpa makna menyerah)

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Soal Dakwah & I'lam",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, persiapan ujian [MADDAH].

Beri 6 soal: definisi dakwah, rukun dakwah, 3 metode dakwah (hikmah/mau'izhah/mujadalah), manhaj dakwah nabi tertentu, hambatan dakwah, adaptasi ke media modern.

Tulis Arab. Koreksi setelah aku jawab.

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Review Pasca Talaqqi Dakwah",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Baru talaqqi tentang [TOPIK DAKWAH] dari kitab [NAMA KITAB].

Catatan:

[PASTE CATATAN]

Tolong: susun sistematis (ushul → manhaj → aplikasi), tambahkan ayat/hadits Arab berharakat, pertanyaan untuk sesi berikutnya.

[LEVEL_BAHASA]`,
        },
      ],
      eksplorasi: [
        {
          title: "Dakwah Digital: Peluang dan Tantangan",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Eksplorasi dakwah di era digital.

Analisis:
1. Peluang yang dibuka dakwah digital (jangkauan luas, konten multimedia, interaktif)
2. Tantangan unik dakwah digital (konten instan, misinterpretasi, hoax, konteks hilang)
3. Bagaimana ushul dakwah klasik bisa diterapkan di media sosial
4. Contoh best practice dari da'i yang efektif di media digital
5. Panduan dari ulama Al-Azhar tentang etika dakwah digital

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
          title: "Pahami Ajaran Agama Tertentu",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Aku ingin memahami: [AGAMA - mis. Yahudi (Yudaisme), Nasrani (Kristen), Hindu, Buddha]

Jelaskan dengan pendekatan akademis-objektif:
1. Sejarah singkat dan sumber kitab sucinya
2. Konsep ketuhanan dalam agama ini
3. Ajaran pokok dan rukun/syariat utama
4. Perpecahan internal (denominasi/sekte utama)
5. Pandangan Islam tentang agama ini — dari perspektif Al-Qur'an dan ulama

Pendekatan objektif akademis. Sertakan perspektif internal agama itu sendiri dengan akurat.

[LEVEL_BAHASA]`,
        },
        {
          title: "Komparasi Konsep Tertentu Antar Agama",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bandingkan konsep: [KONSEP - mis. "Konsep Tuhan", "Konsep Akhirat", "Konsep Kenabian/Keselamatan"] dalam 3 agama:

1. Islam
2. Yahudi (Yudaisme)
3. Nasrani (Kristen)

Untuk setiap agama:
- Bagaimana konsep ini dipahami dalam ajaran dan teksnya
- Kutipan dari teks kitab suci (bila memungkinkan)

Pendekatan komparatif akademis, bukan polemik.

[LEVEL_BAHASA]`,
        },
        {
          title: "Adab Dialog Antaragama dalam Islam",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan prinsip-prinsip dialog antaragama dalam Islam:
1. Perintah Al-Qur'an tentang dialog: QS An-Nahl:125, QS Al-'Ankabut:46 — sertakan berharakat
2. Prinsip-prinsip dialog yang benar menurut ulama
3. Perbedaan antara dialog akademis dan penyerahan prinsip aqidah
4. Model dialog yang baik dari sirah Nabi ﷺ dan Sahabat
5. Pandangan Al-Azhar tentang dialog lintas agama

[LEVEL_BAHASA]`,
        },
      ],
      hafal: [
        {
          title: "Hafal Konsep Utama Per Agama",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Perlu hafal konsep-konsep utama dari agama-agama besar untuk keperluan perbandingan.

Buatkan tabel: Agama → Kitab suci → Konsep Tuhan → Konsep Keselamatan → Tokoh utama

Agama: Islam, Yahudi, Kristen, Hindu, Buddha.

[LEVEL_BAHASA]

CATATAN: informasi tentang agama lain disajikan dari sudut akademis untuk keperluan studi komparatif.`,
        },
      ],
      latihan: [
        {
          title: "Latihan Dialog Antaragama",
          targetAI: "chatgpt",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], latihan [MADDAH]. [GAYA_BELAJAR].

Aku ingin berlatih dialog antaragama yang beradab. Bertindaklah sebagai penganut agama [AGAMA] yang mengajukan pertanyaan atau keberatan tentang Islam berkaitan dengan:

[TOPIK - mis. "Konsep Trinitas vs Tauhid", "Keaslian Al-Qur'an", "Sosok Nabi Muhammad ﷺ"]

Aku akan merespons dengan cara yang hikmah dan akademis. Koreksi aku kalau ada cara yang kurang tepat (terlalu menyerang atau kurang akurat secara fakta).

[LEVEL_BAHASA]`,
        },
        {
          title: "Identifikasi Titik Persamaan dan Perbedaan",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], belajar [MADDAH]. [GAYA_BELAJAR].

Topik: hubungan Islam dengan [AGAMA]

Beri peta yang jelas:
1. Titik persamaan yang fundamental (nilai, ajaran moral, tauhid vs syirik)
2. Titik perbedaan yang fundamental (konsep teologis, ritual)
3. Titik yang sering disalahpahami oleh masing-masing pihak
4. Bagaimana memulai dialog dari titik persamaan

Pendekatan objektif. Bukan untuk mencari kalah-menang.

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Soal Adyan",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, persiapan ujian [MADDAH].

Beri 6 soal: konsep pokok agama tertentu, perbandingan konsep antar agama, adab dialog antaragama, pandangan Al-Qur'an tentang agama samawi, tanggapan Islam terhadap klaim tertentu, perpecahan internal agama tertentu.

Tulis Arab. Koreksi setelah aku jawab.

[LEVEL_BAHASA]`,
        },
      ],
      talaqqi: [
        {
          title: "Review Pasca Talaqqi Adyan",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Baru talaqqi tentang [AGAMA/TOPIK] dari kitab [NAMA KITAB].

Catatan:

[PASTE CATATAN]

Tolong: susun sistematis, tambahkan dalil Al-Qur'an berharakat yang relevan, pertanyaan untuk sesi berikutnya.

CATATAN: pendekatan akademis-objektif selalu dijaga.

[LEVEL_BAHASA]`,
        },
      ],
      eksplorasi: [
        {
          title: "Teks Izharul Haq: Metodologi Pembuktian",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Eksplorasi metodologi dalam [MADDAH].

Kitab Izharul Haq karya Rahmatullah Al-Hindi adalah respons ilmiah terhadap missionary Kristen.

Jelaskan:
1. Konteks penulisan dan latar historis
2. Metodologi yang digunakan Rahmatullah dalam berargumen
3. Kontribusi unik kitab ini dalam apologetika Islam
4. Bagaimana pendekatan Rahmatullah bisa diterapkan dalam dialog kontemporer
5. Kritik akademik terhadap kitab ini (kalau ada)

[LEVEL_BAHASA]`,
        },
        {
          title: "Islam dan Pluralisme Agama",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Eksplorasi isu pluralisme dalam [MADDAH].

Jelaskan posisi Islam terhadap pluralisme agama:
1. Pandangan Islam tentang ahl al-kitab — toleransi dalam muamalah
2. Konsep "la ikraha fid din" — konteks dan maknanya
3. Perbedaan antara toleransi beragama dan relativisme kebenaran
4. Bagaimana Al-Azhar memposisikan diri dalam dialog antaragama global

Pendekatan akademis yang seimbang.

[LEVEL_BAHASA]`,
        },
      ],
    },
  },
];

/* ============================================================
   HELPER FUNCTIONS
   ============================================================ */

const getMaddahsForProfile = (profile) => {
  if (!profile) return MADDAHS;
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
