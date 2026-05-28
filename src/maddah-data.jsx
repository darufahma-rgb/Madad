/* Talqih — Maddah Data Structure
   36 mata kuliah Al-Azhar (Adaby + Lughah + Tarbiyah + Syariah).
   Prompt 3A: 3 Maddah lengkap (Tafsir Tahlili, Nahwu, Ushul Fiqh) + 33 skeleton.
   Prompt 3B (next): fill konten 33 Maddah sisanya.
*/

const MADDAH_CATEGORIES = [
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

/* ============================================================
   MADDAHS — 36 TOTAL
   3 lengkap: tafsir-tahlili, nahwu, ushul-fiqh
   33 skeleton: konten akan diisi di Prompt 3B
   ============================================================ */

const MADDAHS = [

  /* ===== QURAN & TAFSIR (7) ===== */

  {
    id: "tafsir-tahlili",
    name: "Tafsir Tahlili",
    nameArabic: "التفسير التحليلي",
    category: "qurani",
    fakultas: ["ushuluddin", "dirasat", "quran"],
    jurusan: ["tafsir"],
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

1. **Asbabun Nuzul** (kalau ada riwayat shahih) — sertakan teks Arab riwayat
2. **Mufradat** — penjelasan kata kunci, sertakan akar kata Arab
3. **I'rab kalimat** — i'rab kata-kata yang punya peran kunci
4. **Tafsir Tahlili** — pendapat 2-3 mufassir (mis. Ibnu Katsir, Az-Zamakhsyari, Az-Zuhaili). Sertakan kutipan ringkas dari kitab tafsir dengan teks Arab.
5. **Munasabah** — hubungan ayat ini dengan ayat sebelum/sesudahnya
6. **Pelajaran utama** — istinbat dalam 1-2 kalimat

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
        {
          title: "Jadwal Murajaah Ayat",
          targetAI: "chatgpt",
          template: `Aku [TINGKATAN] di [FAKULTAS], menghafal [SURAH/JUZ] untuk maddah [MADDAH]. Target khatam: [X HARI].

Buatkan jadwal murajaah dengan pendekatan spaced repetition dalam tabel:

| Hari | Hafalan Baru | Murajaah | Catatan |

Aturan:
- Spaced repetition: hari 1, 3, 7, 14, 21
- Hafalan baru di waktu pagi (ba'da Fajr)
- Murajaah di waktu yang berbeda (ba'da Asar atau sebelum tidur)
- Tambahkan 3 ayat yang biasanya paling bikin ragu di surah/juz ini

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Latihan Tafsir Mufradat Acak",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS], drill [MADDAH]. [GAYA_BELAJAR].

Beri 10 kata Arab dari Al-Qur'an (dari surah-surah yang sering muncul) untuk aku tafsirin:

Format:
- Setiap kata tulis dengan harakat
- Sebutkan surah dan ayat asalnya
- Konteks ayat (1 baris)

Aku akan tafsirin maknanya. Setelah aku jawab semua, koreksi per nomor dengan:
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

Beri 5 kutipan tafsir dari berbagai mufassir. Aku akan identifikasi:
- Manhaj-nya: tafsir bil ma'tsur / bir ra'yi / fiqhi / sufi / 'ilmi / adabi-ijtima'i / dll
- Mufassirnya kira-kira siapa (atau dari kitab apa)

Format setiap kutipan:
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

Beri 5 soal dengan gaya khas imtihan Azhari untuk Tafsir Tahlili:
- "Fassir al-ayat al-taliyah tafsiran tahliliyyan" (tafsirkan ayat secara tahlili)
- "Bayyin asbab nuzul ayat..." (jelaskan asbabun nuzul)
- "Adhkur ra'yu mufassirayni fi..." (sebutkan pendapat 2 mufassir)
- "Wadhdhih al-munasabah bayna..." (jelaskan munasabah)
- "A'rib al-kalimat al-multawayyah ma'na" (i'rab kata bermakna ganda)

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

Tunggu jawabanku setiap pertanyaan. Tantang aku follow-up kalau kurang lengkap. Setelah selesai, beri evaluasi.

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
4. Sebutkan pertanyaan yang sebaiknya aku tanyakan ke syaikh di sesi berikutnya untuk klarifikasi

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
3. Dalil masing-masing — sertakan teks Arab kalau dari ayat/hadits/syair
4. Apakah khilafnya lafzhi (semu) atau ma'nawi (substansial)
5. Implikasi praktis dari masing-masing pendapat

Bahasa Indonesia akademik. Nama mufassir transliterasi natural. Nama kitab Arab.

Jangan men-tarjih. Biarkan aku yang merenungkan.

[LEVEL_BAHASA]`,
        },
        {
          title: "Tafsir 'Ilmi: Ayat & Sains",
          targetAI: "perplexity",
          template: `Aku [TINGKATAN] di [FAKULTAS], tertarik melihat tafsir 'ilmi (saintifik) tentang ayat:

[TULIS AYAT DENGAN HARAKAT]

Tolong:
1. Tafsir klasik ayat ini (1 paragraf ringkas)
2. Bagaimana ayat ini ditafsirkan dari sudut sains modern (kalau memungkinkan)
3. Apakah ada penelitian ilmiah yang relate? Sertakan sumber dan link
4. Kritik terhadap tafsir 'ilmi yang berlebihan — perlu diperhatikan tradisi salaf

Bahasa Indonesia akademik. Sertakan link sumber kalau klaim sains.

[LEVEL_BAHASA]`,
        },
        {
          title: "Aplikasi Ayat dalam Kehidupan Masisir",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar. [GAYA_BELAJAR]. Sebagai Masisir, aku ingin renungkan ayat:

[TULIS AYAT DENGAN HARAKAT]

Tolong bantu aku refleksi:
1. Apa makna inti ayat ini (1 paragraf)
2. 3 aplikasi konkret dalam kehidupan thalib di Mesir
3. Doa yang relate untuk diamalkan
4. Pertanyaan refleksi untuk muraqabah diri

Bahasa Indonesia. Empati, bukan ceramah. Tulis seperti senior Masisir berbagi insight.

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  /* ===== NAHWU (LUGHAWI — LENGKAP) ===== */

  {
    id: "nahwu",
    name: "Nahwu",
    nameArabic: "النحو",
    category: "lughawi",
    fakultas: ["ushuluddin", "syariah", "lughah", "dirasat", "quran"],
    jurusan: [],
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

[LEVEL_BAHASA]

Sertakan teks Arab original untuk istilah teknis.`,
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
5. Apakah ada wajh i'rab lain yang mungkin? Jelaskan keduanya kalau iya

[LEVEL_BAHASA]

Istilah nahwu tetap Arab transliterasi natural (mubtada, fa'il, dll).`,
        },
        {
          title: "Peta Hubungan Bab Nahwu",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS], belajar [MADDAH]. [GAYA_BELAJAR].

Aku ingin big picture hubungan antar bab Nahwu. Buatkan peta:

Bab-bab utama:
- Mubtada wa Khabar
- Fi'il wa Fa'il & Naib Fa'il
- Manshubat (Maf'ul bih, Hal, Tamyiz, Mustatsna, Munada, Maf'ul Mutlaq, Maf'ul li Ajlih, Maf'ul Fih)
- Majrurat (Idhafah & Jarr bil Harf)
- Naskh ('Awamil yang ubah hukum mubtada-khabar)
- Tawabi' (Na'at, 'Athaf, Taukid, Badal)

Untuk setiap bab:
1. Definisi singkat dengan teks Arab
2. Bab apa yang menjadi pondasi
3. Bab apa yang dibangun darinya

[LEVEL_BAHASA]

Format terstruktur, mudah dilihat alurnya.`,
        },
      ],
      hafal: [
        {
          title: "Drill Matan Alfiyah/Ajurrumiyyah",
          targetAI: "notebooklm",
          template: `Aku [TINGKATAN] di [FAKULTAS]. Sudah upload matan [NAMA KITAB - Ajurrumiyyah/Alfiyah]. Bantu aku drill hafalan dengan sesi tasmi':

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
        {
          title: "Jadwal Hafal Matan",
          targetAI: "chatgpt",
          template: `Aku [TINGKATAN] di [FAKULTAS], hafal matan [NAMA KITAB]. Target khatam [X HARI/MINGGU].

Buatkan jadwal murajaah dalam tabel dengan spaced repetition (hari 1, 3, 7, 14, 21).

Tambahan:
- Bait/bagian apa yang biasanya sulit di matan ini
- Saran waktu hafal vs murajaah

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
- 7-9: Naskh (kana wa akhawatuha, inna wa akhawatuha) atau idhafah berlapis
- 10: Kalimat panjang multi-kaidah

Tulis semua dengan harakat. JANGAN kasih jawaban dulu.

Setelah aku jawab, koreksi per nomor: kaidah, bait Alfiyah/Ajurrumiyyah relate, penjelasan ringkas.

[LEVEL_BAHASA]`,
        },
        {
          title: "Tashrif Acak",
          targetAI: "chatgpt",
          template: `Aku [TINGKATAN] di [FAKULTAS], drill [MADDAH]. [GAYA_BELAJAR].

Beri 10 fi'il madhi 3 huruf acak untuk aku tashrif lengkap (madhi, mudhari', amr, fa'il, maf'ul, dll).

Contoh: كَتَبَ → tashrif lengkap.

Tulis fi'il dengan harakat. Setelah aku jawab semua, koreksi + 1 referensi kitab sharaf untuk latihan lanjut.

[LEVEL_BAHASA]`,
        },
        {
          title: "Bedah Ibarah Kitab Nahwu",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Ini paragraf dari kitab nahwu klasik:

[PASTE TEKS ARAB DARI KITAB]

Analisis bertahap:
1. Tarjamah harfiyah
2. Tarjamah ma'nawiyyah (Indonesia mengalir)
3. Syarah istilah teknis (Arab + transliterasi + definisi)
4. Maksud inti penulis dalam 1 kalimat
5. Bab nahwu apa yang dibahas

[LEVEL_BAHASA]

Bila ada bagian ambigu, sebut secara jujur.`,
        },
      ],
      ujian: [
        {
          title: "Mock Tahriri Nahwu",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, drill persiapan ujian Tahriri untuk [MADDAH].

Beri 5 soal gaya khas imtihan Azhari:
- "'Arrif al-... wa adhkur 'amalahu" (definisikan dan sebutkan 'amal-nya)
- "Wadhdhih al-farq bayna..." (jelaskan perbedaan antara)
- "Mathiyl li... bi mithalin" (beri contoh untuk...)
- "A'rib al-jumlah at-taliyah" (i'rab kalimat berikut)
- "Bayyin al-kaidah al-nahwiyyah fi..." (jelaskan kaidah nahwu di...)

Topik fokus: [BAB - kalau ada]

Tulis dalam Bahasa Arab. Setelah aku jawab, koreksi + model answer ideal.

[LEVEL_BAHASA]`,
        },
        {
          title: "Mock Syafawi Nahwu",
          targetAI: "chatgpt",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, latihan ujian Syafawi [MADDAH]. [GAYA_BELAJAR].

Bertindaklah sebagai dosen Azhar. 5 pertanyaan bertahap:
1. Definisi dasar bab tertentu
2. Perbedaan istilah
3. Beri contoh kalimat (aku jawab)
4. I'rab kalimat (kasih aku kalimat)
5. Hubungan dengan bab lain

Topik: [BAB - kalau ada]. Tunggu jawabanku tiap pertanyaan. Tantang follow-up kalau kurang lengkap. Setelah 5, beri evaluasi.

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

Tolong:
1. Susun ulang jadi struktur sistematis
2. Tambahkan kaidah Arab original (dengan harakat) untuk poin-poin penting
3. Beri 2-3 contoh kalimat tambahan untuk memperdalam
4. Sebut pertanyaan yang sebaiknya ditanyakan ke syaikh di sesi berikutnya

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Catatan Talaqqi Nahwu yang Ambigu",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Catatan dari talaqqi [MADDAH] yang sebagiannya ambigu:

[PASTE CATATAN MEMBINGUNGKAN]

Tolong:
1. Interpretasi maksud berdasarkan konteks nahwu
2. Lengkapi penjelasan kurang
3. Kemungkinan tafsir kalau ambigu
4. Sebut bab nahwu yang sedang dibahas

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
3. Dalil masing-masing — sertakan teks Arab dari kalimat/ayat/syi'r yang jadi hujjah
4. Pendapat ulama mutaakhirin (Ibnu Malik, Ibnu Hisyam) — condong ke mana

Nama ulama transliterasi natural. Teks Arab untuk dalil dan istilah.

Jangan men-tarjih.

[LEVEL_BAHASA]`,
        },
        {
          title: "Aplikasi Nahwu di Tafsir",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS], [GAYA_BELAJAR]. Lihat aplikasi Nahwu dalam Tafsir Qur'an.

Pilih 3 ayat dengan khilaf nahwu yang ubah makna. Untuk setiap ayat:
1. Tulis ayat berharakat + surah-ayat
2. Jelaskan 2+ kemungkinan i'rab
3. Bagaimana setiap i'rab ubah tafsir/makna
4. Pendapat mufassir mana condong ke mana

[LEVEL_BAHASA]`,
        },
        {
          title: "Syawahid Syi'r Klasik",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS], belajar [MADDAH]. [GAYA_BELAJAR].

Beri 5 bait syi'r klasik (Jahili / Shadr Islam / Umawi) yang jadi syahid kaidah nahwu.

Untuk setiap bait:
1. Tulis bait berharakat lengkap
2. Sebutkan penyair
3. Kaidah nahwu apa yang dibuktikan
4. Bagian mana yang jadi syahid (highlight)
5. Tarjamah ringkas

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  /* ===== USHUL FIQH (FIQHI — LENGKAP) ===== */

  {
    id: "ushul-fiqh",
    name: "Ushul Fiqh",
    nameArabic: "أصول الفقه",
    category: "fiqhi",
    fakultas: ["ushuluddin", "syariah", "dirasat"],
    jurusan: [],
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
4. Aplikasi praktis — beri 2-3 contoh aplikasi ke masalah fiqh
5. Khilaf ulama tentang kaidah ini (kalau ada)
6. Pengecualian (mustatsnayat) — kapan kaidah ini tidak berlaku

[LEVEL_BAHASA]

Sertakan teks Arab original untuk semua kaidah dan istilah teknis. Nama ulama transliterasi natural. Nama kitab Arab.`,
        },
        {
          title: "Bedakan Istilah Ushul",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Aku bingung membedakan: [ISTILAH 1] vs [ISTILAH 2]
(mis. 'Illah vs Hikmah, Manthuq vs Mafhum, Mujmal vs Muqayyad, Naskh vs Takhshish)

Tolong jelaskan:
1. Definisi masing-masing dengan teks Arab
2. Letak perbedaan substansial
3. 2-3 contoh konkret yang menunjukkan beda
4. Implikasi praktis dari perbedaan ini

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Dalalat",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Aku ingin memahami konsep Dalalat (cara nash menunjukkan hukum).

Tolong jelaskan 4 dalalat utama menurut Jumhur:
1. Dalalah 'Ibarat (penunjukan langsung)
2. Dalalah Isyarah (penunjukan tersirat)
3. Dalalah Nash (penunjukan dari konteks)
4. Dalalah Iqtidha' (penunjukan tuntutan kelengkapan)

Untuk setiap dalalah:
- Teks Arab dengan harakat
- Definisi
- 1 contoh dari ayat/hadits
- Beda dengan dalalah lain

Lalu jelaskan beda klasifikasi Hanafi.

[LEVEL_BAHASA]`,
        },
        {
          title: "Mashadir Tasyri' Lengkap",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Buatkan ringkasan komprehensif tentang Mashadir Tasyri':

Untuk setiap sumber:
1. Definisi dengan teks Arab
2. Dalil bahwa ia jadi sumber syariat
3. Posisi madzhab (Jumhur/Hanafi/Maliki/Syafi'i/Hanbali/Zhahiri)
4. Aplikasi praktis

Sumber:
- Mashadir Muttafaq 'alayha: Al-Qur'an, As-Sunnah, Al-Ijma', Al-Qiyas
- Mashadir Mukhtalaf fiyha: Al-Istihsan, Al-Mashalih Mursalah, Sadd Az-Zarai', 'Urf, Madzhab Sahabi, Syar'u Man Qablana, Al-Istishhab

[LEVEL_BAHASA]

Format terstruktur, bisa jadi referensi.`,
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

Buatkan:
1. Mnemonic Indonesia
2. Mnemonic Arab kalau ada masyhur
3. Trik visual / story pendek
4. Bait nazham kalau ada (mis. dari Nazhm Al-Waraqat)

[LEVEL_BAHASA]`,
        },
      ],
      latihan: [
        {
          title: "Soal Aplikasi Kaidah Ushul",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], drill [MADDAH]. [GAYA_BELAJAR].

Beri 10 kasus fiqh, aku akan identifikasi kaidah ushul yang relate:

Contoh format:
"Hukum membaca Basmalah di Al-Fatihah — kaidah ushul apa yang bermain?"
"Hukum berenang di kolam bersama selama menutup aurat — kaidah ushul apa?"

JANGAN kasih jawaban dulu. Setelah aku jawab semua, koreksi + jelaskan reasoning.

[LEVEL_BAHASA]`,
        },
        {
          title: "Bedah Teks Kitab Ushul",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Paragraf dari kitab ushul klasik:

[PASTE TEKS ARAB - sebutkan kitabnya]

Analisis:
1. Tarjamah harfiyah
2. Tarjamah ma'nawiyyah
3. Syarah istilah teknis (Arab + transliterasi + definisi)
4. Maksud inti penulis
5. Madzhab apa yang dianut penulis di teks ini
6. Pendapat madzhab lain (kalau ada perbedaan)

[LEVEL_BAHASA]`,
        },
        {
          title: "Identifikasi 'Illah Hukum",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], drill [MADDAH]. [GAYA_BELAJAR].

Beri 5 ayat/hadits yang punya hukum syar'i jelas. Aku akan:
1. Identifikasi hukum
2. Identifikasi 'illah (alasan hukum) — kalau ada
3. Bedakan 'illah dari hikmah
4. Jelaskan apakah hukum bisa di-qiyas-kan ke kasus lain berdasar 'illah ini

Tulis ayat/hadits berharakat. Setelah aku jawab, koreksi + jelaskan analisis ushuli yang benar.

[LEVEL_BAHASA]`,
        },
      ],
      ujian: [
        {
          title: "Mock Tahriri Ushul Fiqh",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, drill ujian Tahriri [MADDAH].

5 soal gaya khas imtihan Azhari:
- "'Arrif al-... wa adhkur arkanahu" (definisikan dan sebut rukun-rukunnya)
- "Wadhdhih al-farq bayna..." (jelaskan perbedaan)
- "Adhkur al-khilaf fi... ma'a al-dalil li-kulli ra'y" (sebutkan khilaf dengan dalil)
- "Tatbiq qa'idah... 'ala mas'alah..." (aplikasikan kaidah ke masalah)
- "Bayyin manhaj..." (jelaskan manhaj madzhab)

Topik: [BAB - kalau ada]

Tulis Arab. Setelah aku jawab, koreksi + model answer ideal.

[LEVEL_BAHASA]`,
        },
        {
          title: "Mock Syafawi Ushul",
          targetAI: "chatgpt",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, latihan Syafawi [MADDAH]. [GAYA_BELAJAR].

Bertindaklah sebagai dosen Azhar. 5 pertanyaan bertahap:
1. Definisi kaidah/istilah dasar
2. Beda dengan istilah serupa
3. Dalil kaidah
4. Aplikasi praktis (kasih aku kasus)
5. Khilaf madzhab tentang kaidah ini

Topik: [BAB - kalau ada]. Tunggu jawab tiap pertanyaan. Tantang follow-up. Evaluasi di akhir.

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

Tolong:
1. Susun ulang sistematis
2. Tambah kaidah Arab original berharakat
3. 2-3 contoh aplikasi tambahan
4. Pertanyaan untuk sesi berikutnya

[LEVEL_BAHASA]`,
        },
        {
          title: "Pahami Catatan Talaqqi Ushul Ambigu",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN]. Catatan talaqqi [MADDAH] yang ambigu:

[PASTE CATATAN]

Bantu:
1. Interpretasi berdasarkan konteks ushul
2. Lengkapi yang kurang
3. Kemungkinan tafsir kalau ambigu
4. Identifikasi bab ushul

[LEVEL_BAHASA]`,
        },
      ],
      eksplorasi: [
        {
          title: "Khilaf Ushuliyyin",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] di Al-Azhar, [GAYA_BELAJAR]. Eksplorasi khilaf tentang:

[MASALAH USHUL - mis. hukum mafhum mukhalafah sebagai hujjah, status maslahah mursalah, dll]

Jelaskan:
1. Pendapat Jumhur (Syafi'iyyah, Hanafiyyah, Hanbaliyyah, Malikiyyah — sebut yang relate)
2. Pendapat Zhahiriyyah / Mu'tazilah / madzhab lain
3. Dalil masing-masing — teks Arab dari ayat/hadits/dalil aqli
4. Thamarat al-khilaf (konsekuensi praktis)

Nama ulama transliterasi natural. Kitab dalam Arab.

Jangan men-tarjih.

[LEVEL_BAHASA]`,
        },
        {
          title: "Aplikasi Ushul di Fiqh Kontemporer",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 3 contoh aplikasi kaidah ushul di nawazil (masalah kontemporer):

Contoh nawazil: hukum cryptocurrency, transplant organ, asuransi syariah, dll.

Untuk setiap:
1. Sebut masalah
2. Identifikasi kaidah ushul yang dipakai
3. Bagaimana ulama kontemporer mengaplikasikan kaidah ke masalah
4. Pendapat lembaga fatwa (Al-Azhar, MUI, dll) — sertakan link sumber kalau ada

[LEVEL_BAHASA]`,
        },
        {
          title: "Maqashid Syariah & Hubungan dengan Ushul",
          targetAI: "claude",
          template: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Aku ingin pahami hubungan Ushul Fiqh klasik dengan Maqashid Syariah:

Jelaskan:
1. Definisi Maqashid Syariah dengan teks Arab
2. Hubungannya dengan kaidah ushul (mis. dengan maslahah mursalah)
3. Klasifikasi Maqashid: dharuriyyat, hajiyat, tahsiniyyat
4. Tokoh utama Maqashid: Asy-Syatibi (Al-Muwafaqat), Ibnu 'Asyur (Maqashid Syariah)
5. Bagaimana Maqashid dipakai dalam fatwa kontemporer

[LEVEL_BAHASA]`,
        },
      ],
    },
  },

  /* ===== SISA 33 MADDAH — SKELETON ONLY ===== */

  /* Quran & Tafsir (6 skeleton) */
  { id:"quran-tahfidz",     name:"Al-Qur'an (Tahfidz & Tilawah)", nameArabic:"القرآن الكريم",        category:"qurani",  fakultas:["ushuluddin","dirasat","quran"],           jurusan:[],          tingkat:["mustawa","1","2","3","4","pasca"], description:"Hafalan dan tilawah Al-Qur'an dengan tajwid yang benar.",                                                                                                      descriptionArabic:"حفظ القرآن وتلاوته بالتجويد الصحيح",                       kitabUtama:[], recommendedAI:[], tutorial:{overview:"",steps:[]}, prompts:{pahami:[],hafal:[],latihan:[],ujian:[],talaqqi:[],eksplorasi:[]} },
  { id:"tajwid",            name:"Tajwid",                         nameArabic:"التجويد",              category:"qurani",  fakultas:["ushuluddin","dirasat","quran"],           jurusan:[],          tingkat:["mustawa","1","2","3"],             description:"Ilmu cara membaca Al-Qur'an dengan benar — makhorijul huruf, sifat huruf, hukum nun mati, mad, waqaf.",                                                        descriptionArabic:"علم يبحث في كيفية النطق بكلمات القرآن صحيحاً",            kitabUtama:[], recommendedAI:[], tutorial:{overview:"",steps:[]}, prompts:{pahami:[],hafal:[],latihan:[],ujian:[],talaqqi:[],eksplorasi:[]} },
  { id:"tafsir-maudhui",   name:"Tafsir Maudhu'i",                nameArabic:"التفسير الموضوعي",     category:"qurani",  fakultas:["ushuluddin","dirasat"],                  jurusan:["tafsir"],  tingkat:["3","4","pasca"],                  description:"Tafsir tematik — mengumpulkan semua ayat tentang satu tema dan menafsirkan secara komprehensif.",                                                              descriptionArabic:"تفسير الآيات حسب الموضوعات الجامعة",                       kitabUtama:[], recommendedAI:[], tutorial:{overview:"",steps:[]}, prompts:{pahami:[],hafal:[],latihan:[],ujian:[],talaqqi:[],eksplorasi:[]} },
  { id:"ulum-quran",        name:"'Ulum Al-Qur'an",               nameArabic:"علوم القرآن",          category:"qurani",  fakultas:["ushuluddin","dirasat","quran"],           jurusan:["tafsir"],  tingkat:["2","3","4","pasca"],              description:"Ilmu-ilmu yang berkaitan dengan Al-Qur'an — asbabun nuzul, makki-madani, nasikh-mansukh, qiraat, mutasyabih.",                                                 descriptionArabic:"العلوم المتعلقة بالقرآن الكريم",                           kitabUtama:[], recommendedAI:[], tutorial:{overview:"",steps:[]}, prompts:{pahami:[],hafal:[],latihan:[],ujian:[],talaqqi:[],eksplorasi:[]} },
  { id:"manahij-mufassirin",name:"Manahij Al-Mufassirin",         nameArabic:"مناهج المفسرين",      category:"qurani",  fakultas:["ushuluddin","dirasat"],                  jurusan:["tafsir"],  tingkat:["3","4","pasca"],                  description:"Metodologi para mufassir — manhaj tafsir bil ma'tsur, bir ra'yi, fiqhi, sufi, 'ilmi, adabi-ijtima'i.",                                                       descriptionArabic:"مناهج العلماء في تفسير القرآن",                            kitabUtama:[], recommendedAI:[], tutorial:{overview:"",steps:[]}, prompts:{pahami:[],hafal:[],latihan:[],ujian:[],talaqqi:[],eksplorasi:[]} },
  { id:"qiraat",            name:"Qira'at",                        nameArabic:"القراءات",             category:"qurani",  fakultas:["ushuluddin","dirasat","quran"],           jurusan:[],          tingkat:["3","4","pasca"],                  description:"Ilmu variasi bacaan Al-Qur'an dari 7 atau 10 imam qiraat yang mutawatir.",                                                                                     descriptionArabic:"علم اختلافات القراءات القرآنية المتواترة",                  kitabUtama:[], recommendedAI:[], tutorial:{overview:"",steps:[]}, prompts:{pahami:[],hafal:[],latihan:[],ujian:[],talaqqi:[],eksplorasi:[]} },

  /* Hadits & Mustholah (5 skeleton) */
  { id:"hadits-tahlili",    name:"Hadits Tahlili",                 nameArabic:"الحديث التحليلي",      category:"haditsi", fakultas:["ushuluddin","dirasat"],                  jurusan:["hadits"],  tingkat:["3","4","pasca"],                  description:"Analisis hadits per hadits — sanad, matan, syarah, dan istinbat hukum.",                                                                                       descriptionArabic:"تحليل أحاديث النبي ﷺ سنداً ومتناً",                       kitabUtama:[], recommendedAI:[], tutorial:{overview:"",steps:[]}, prompts:{pahami:[],hafal:[],latihan:[],ujian:[],talaqqi:[],eksplorasi:[]} },
  { id:"hadits-maudhui",    name:"Hadits Maudhu'i",                nameArabic:"الحديث الموضوعي",      category:"haditsi", fakultas:["ushuluddin","dirasat"],                  jurusan:["hadits"],  tingkat:["3","4","pasca"],                  description:"Hadits tematik — mengumpulkan dan menganalisis hadits berdasarkan tema tertentu.",                                                                              descriptionArabic:"جمع الأحاديث وتحليلها حسب الموضوعات",                      kitabUtama:[], recommendedAI:[], tutorial:{overview:"",steps:[]}, prompts:{pahami:[],hafal:[],latihan:[],ujian:[],talaqqi:[],eksplorasi:[]} },
  { id:"mustholah-hadits",  name:"Mustholah Hadits",              nameArabic:"مصطلح الحديث",         category:"haditsi", fakultas:["ushuluddin","dirasat","syariah"],         jurusan:[],          tingkat:["2","3","4","pasca"],              description:"Ilmu klasifikasi hadits — shahih, hasan, dha'if, mawdhu', dan kaidah-kaidah ilmu rijal.",                                                                      descriptionArabic:"علم قواعد تصنيف الأحاديث وأحوال الرواة",                   kitabUtama:[], recommendedAI:[], tutorial:{overview:"",steps:[]}, prompts:{pahami:[],hafal:[],latihan:[],ujian:[],talaqqi:[],eksplorasi:[]} },
  { id:"manahij-muhadditsin",name:"Manahij Al-Muhadditsin",       nameArabic:"مناهج المحدثين",      category:"haditsi", fakultas:["ushuluddin","dirasat"],                  jurusan:["hadits"],  tingkat:["3","4","pasca"],                  description:"Metodologi para muhadditsin — manhaj Bukhari, Muslim, Tirmidzi, Daruquthni.",                                                                                   descriptionArabic:"مناهج العلماء في رواية وتدوين الحديث",                     kitabUtama:[], recommendedAI:[], tutorial:{overview:"",steps:[]}, prompts:{pahami:[],hafal:[],latihan:[],ujian:[],talaqqi:[],eksplorasi:[]} },
  { id:"takhrij-hadits",    name:"Takhrij Hadits",                 nameArabic:"تخريج الحديث",        category:"haditsi", fakultas:["ushuluddin","dirasat"],                  jurusan:["hadits"],  tingkat:["3","4","pasca"],                  description:"Praktikum mencari sumber hadits dari kitab-kitab utama dan menilai derajatnya.",                                                                                descriptionArabic:"إخراج الأحاديث من مصادرها الأصلية",                        kitabUtama:[], recommendedAI:[], tutorial:{overview:"",steps:[]}, prompts:{pahami:[],hafal:[],latihan:[],ujian:[],talaqqi:[],eksplorasi:[]} },

  /* Fiqh & Ushul (3 skeleton — ushul-fiqh sudah lengkap di atas) */
  { id:"fiqh-madzhabi",     name:"Fiqh (Madzhabi)",               nameArabic:"الفقه المذهبي",        category:"fiqhi",   fakultas:["syariah","dirasat","ushuluddin"],         jurusan:[],          tingkat:["1","2","3","4","5","pasca"],       description:"Fiqh berdasarkan satu madzhab (Syafi'i/Hanafi/Maliki/Hanbali) — thaharah, shalat, zakat, puasa, haji, muamalat.",                                           descriptionArabic:"الفقه على مذهب من المذاهب الأربعة",                        kitabUtama:[], recommendedAI:[], tutorial:{overview:"",steps:[]}, prompts:{pahami:[],hafal:[],latihan:[],ujian:[],talaqqi:[],eksplorasi:[]} },
  { id:"fiqh-muqaran",      name:"Fiqh Muqaran",                  nameArabic:"الفقه المقارن",        category:"fiqhi",   fakultas:["syariah","dirasat"],                     jurusan:[],          tingkat:["3","4","5","pasca"],               description:"Perbandingan fiqh antar 4 madzhab dengan dalil masing-masing dan tarjih ulama muqaranah.",                                                                     descriptionArabic:"مقارنة الفقه بين المذاهب",                                  kitabUtama:[], recommendedAI:[], tutorial:{overview:"",steps:[]}, prompts:{pahami:[],hafal:[],latihan:[],ujian:[],talaqqi:[],eksplorasi:[]} },
  { id:"qawaid-fiqhiyyah",  name:"Qawa'id Fiqhiyyah",            nameArabic:"القواعد الفقهية",      category:"fiqhi",   fakultas:["syariah","dirasat"],                     jurusan:[],          tingkat:["3","4","5","pasca"],               description:"Kaidah-kaidah umum fiqh yang menyatukan furu' masalah — al-umuru bi maqashidiha, al-yaqinu la yazulu bisy syakk.",                                           descriptionArabic:"القواعد العامة التي تجمع فروع الفقه",                       kitabUtama:[], recommendedAI:[], tutorial:{overview:"",steps:[]}, prompts:{pahami:[],hafal:[],latihan:[],ujian:[],talaqqi:[],eksplorasi:[]} },
  { id:"ahwal-syakhsiyah",  name:"Ahwal Syakhshiyah",            nameArabic:"الأحوال الشخصية",      category:"fiqhi",   fakultas:["syariah","dirasat"],                     jurusan:[],          tingkat:["3","4","5","pasca"],               description:"Hukum keluarga Islam — nikah, talaq, 'iddah, ruju', mawarits, hadhanah, nafaqah.",                                                                             descriptionArabic:"أحكام الأسرة والميراث",                                     kitabUtama:[], recommendedAI:[], tutorial:{overview:"",steps:[]}, prompts:{pahami:[],hafal:[],latihan:[],ujian:[],talaqqi:[],eksplorasi:[]} },

  /* Aqidah & Pemikiran (5 skeleton) */
  { id:"tauhid",            name:"Tauhid",                         nameArabic:"التوحيد",              category:"aqdi",    fakultas:["ushuluddin","syariah","dirasat","quran"],  jurusan:[],          tingkat:["mustawa","1","2","3","4","pasca"], description:"Ilmu tentang keesaan Allah — sifat-sifat Allah, kenabian, sam'iyyat, dan iman.",                                                                                descriptionArabic:"علم التوحيد وأصول الإيمان",                                 kitabUtama:[], recommendedAI:[], tutorial:{overview:"",steps:[]}, prompts:{pahami:[],hafal:[],latihan:[],ujian:[],talaqqi:[],eksplorasi:[]} },
  { id:"firaq",             name:"'Aqidah & Firaq",               nameArabic:"العقيدة والفرق",       category:"aqdi",    fakultas:["ushuluddin","dirasat"],                  jurusan:["aqidah"],  tingkat:["3","4","pasca"],                  description:"Studi aliran-aliran dalam Islam — Asy'ariyyah, Maturidiyyah, Mu'tazilah, Salafiyyah.",                                                                         descriptionArabic:"دراسة الفرق الإسلامية",                                    kitabUtama:[], recommendedAI:[], tutorial:{overview:"",steps:[]}, prompts:{pahami:[],hafal:[],latihan:[],ujian:[],talaqqi:[],eksplorasi:[]} },
  { id:"filsafat-islam",    name:"Filsafat Islam",                nameArabic:"الفلسفة الإسلامية",    category:"aqdi",    fakultas:["ushuluddin","dirasat"],                  jurusan:["aqidah"],  tingkat:["3","4","pasca"],                  description:"Pemikiran filsafat dalam tradisi Islam — Al-Kindi, Al-Farabi, Ibnu Sina, Ibnu Rusyd, Al-Ghazali.",                                                            descriptionArabic:"الفلسفة في التراث الإسلامي",                               kitabUtama:[], recommendedAI:[], tutorial:{overview:"",steps:[]}, prompts:{pahami:[],hafal:[],latihan:[],ujian:[],talaqqi:[],eksplorasi:[]} },
  { id:"mantiq",            name:"Mantiq",                         nameArabic:"المنطق",               category:"aqdi",    fakultas:["ushuluddin","dirasat"],                  jurusan:[],          tingkat:["2","3","4","pasca"],              description:"Ilmu logika klasik — qadhiyyah, qiyas, burhan, mughalathah.",                                                                                                   descriptionArabic:"علم المنطق وقواعد التفكير الصحيح",                          kitabUtama:[], recommendedAI:[], tutorial:{overview:"",steps:[]}, prompts:{pahami:[],hafal:[],latihan:[],ujian:[],talaqqi:[],eksplorasi:[]} },
  { id:"tasawwuf",          name:"Tasawwuf",                       nameArabic:"التصوف",               category:"aqdi",    fakultas:["ushuluddin","dirasat"],                  jurusan:[],          tingkat:["3","4","pasca"],                  description:"Ilmu tazkiyatun nafs dan thariqah para sufi — Al-Ghazali, Al-Junaid, As-Suhrawardi.",                                                                          descriptionArabic:"علم تزكية النفس وسلوك السائرين",                           kitabUtama:[], recommendedAI:[], tutorial:{overview:"",steps:[]}, prompts:{pahami:[],hafal:[],latihan:[],ujian:[],talaqqi:[],eksplorasi:[]} },

  /* Lughah Arabiyah (6 skeleton — nahwu sudah di atas) */
  { id:"sharaf",            name:"Sharaf",                         nameArabic:"الصرف",                category:"lughawi", fakultas:["ushuluddin","syariah","lughah","dirasat","quran"], jurusan:[],     tingkat:["mustawa","1","2","3"],             description:"Ilmu morfologi Arab — tashrif, wazn fi'il, isim musytaq.",                                                                                                     descriptionArabic:"علم بنية الكلمة العربية وتصاريفها",                        kitabUtama:[], recommendedAI:[], tutorial:{overview:"",steps:[]}, prompts:{pahami:[],hafal:[],latihan:[],ujian:[],talaqqi:[],eksplorasi:[]} },
  { id:"balaghah",          name:"Balaghah",                       nameArabic:"البلاغة",              category:"lughawi", fakultas:["ushuluddin","lughah","dirasat"],          jurusan:[],          tingkat:["2","3","4","pasca"],              description:"Ilmu retorika Arab — 'ilmu ma'ani, 'ilmu bayan, 'ilmu badi'. Pondasi i'jaz Qur'an.",                                                                           descriptionArabic:"علم البلاغة بأقسامه الثلاثة",                              kitabUtama:[], recommendedAI:[], tutorial:{overview:"",steps:[]}, prompts:{pahami:[],hafal:[],latihan:[],ujian:[],talaqqi:[],eksplorasi:[]} },
  { id:"adab",              name:"Adab (Sastra Arab)",            nameArabic:"الأدب العربي",         category:"lughawi", fakultas:["lughah","dirasat"],                      jurusan:[],          tingkat:["1","2","3","4","pasca"],          description:"Sastra Arab — Jahiliyah, Shadr Islam, Umawi, Abbasi, Andalusi, Hadits. Puisi dan prosa klasik.",                                                                descriptionArabic:"تاريخ الأدب العربي ونصوصه",                                kitabUtama:[], recommendedAI:[], tutorial:{overview:"",steps:[]}, prompts:{pahami:[],hafal:[],latihan:[],ujian:[],talaqqi:[],eksplorasi:[]} },
  { id:"arudh",             name:"'Arudh wal Qawafi",            nameArabic:"العروض والقوافي",      category:"lughawi", fakultas:["lughah","dirasat"],                      jurusan:[],          tingkat:["2","3","4"],                      description:"Ilmu prosodi puisi Arab — wazn (Bahr Thawil, Madid, Basith, Wafir, Kamil) dan qafiyah.",                                                                       descriptionArabic:"علم أوزان الشعر العربي وقوافيه",                            kitabUtama:[], recommendedAI:[], tutorial:{overview:"",steps:[]}, prompts:{pahami:[],hafal:[],latihan:[],ujian:[],talaqqi:[],eksplorasi:[]} },
  { id:"fiqh-lughah",       name:"Fiqh Al-Lughah",               nameArabic:"فقه اللغة",            category:"lughawi", fakultas:["lughah","dirasat"],                      jurusan:[],          tingkat:["3","4","pasca"],                  description:"Filologi Arab — asal usul kata, perkembangan makna, hubungan antar lahjat.",                                                                                    descriptionArabic:"علم فقه اللغة العربية",                                    kitabUtama:[], recommendedAI:[], tutorial:{overview:"",steps:[]}, prompts:{pahami:[],hafal:[],latihan:[],ujian:[],talaqqi:[],eksplorasi:[]} },
  { id:"naqd-adabi",        name:"Naqd Adabi",                    nameArabic:"النقد الأدبي",         category:"lughawi", fakultas:["lughah","dirasat"],                      jurusan:[],          tingkat:["3","4","pasca"],                  description:"Kritik sastra Arab — manhaj naqd klasik dan modern, evaluasi karya sastra.",                                                                                    descriptionArabic:"علم نقد الأدب العربي",                                     kitabUtama:[], recommendedAI:[], tutorial:{overview:"",steps:[]}, prompts:{pahami:[],hafal:[],latihan:[],ujian:[],talaqqi:[],eksplorasi:[]} },

  /* Tarikh, Dakwah & Tarbiyah (6 skeleton) */
  { id:"sirah-nabawiyah",   name:"Sirah Nabawiyah",               nameArabic:"السيرة النبوية",       category:"tarikhi", fakultas:["ushuluddin","syariah","dirasat","quran"], jurusan:[],          tingkat:["mustawa","1","2","3","4"],         description:"Sejarah hidup Rasulullah ﷺ dari kelahiran sampai wafat, dengan analisis pelajaran dakwah dan syariat.",                                                        descriptionArabic:"سيرة النبي محمد ﷺ",                                        kitabUtama:[], recommendedAI:[], tutorial:{overview:"",steps:[]}, prompts:{pahami:[],hafal:[],latihan:[],ujian:[],talaqqi:[],eksplorasi:[]} },
  { id:"tarikh-tasyri",     name:"Tarikh Tasyri'",                nameArabic:"تاريخ التشريع",        category:"tarikhi", fakultas:["syariah","dirasat","ushuluddin"],         jurusan:[],          tingkat:["2","3","4","5","pasca"],           description:"Sejarah legislasi Islam — fase Nabi, Sahabat, Tabi'in, masa kodifikasi madzhab, sampai modern.",                                                               descriptionArabic:"تاريخ التشريع الإسلامي عبر العصور",                        kitabUtama:[], recommendedAI:[], tutorial:{overview:"",steps:[]}, prompts:{pahami:[],hafal:[],latihan:[],ujian:[],talaqqi:[],eksplorasi:[]} },
  { id:"tarikh-islam",      name:"Tarikh Islam",                  nameArabic:"التاريخ الإسلامي",     category:"tarikhi", fakultas:["lughah","dirasat","ushuluddin"],          jurusan:["tarikh"],  tingkat:["1","2","3","4","pasca"],          description:"Sejarah Islam dari Khulafa Ar-Rasyidun sampai Daulah Utsmaniyyah dan masa modern.",                                                                            descriptionArabic:"تاريخ الإسلام عبر الدول والعصور",                          kitabUtama:[], recommendedAI:[], tutorial:{overview:"",steps:[]}, prompts:{pahami:[],hafal:[],latihan:[],ujian:[],talaqqi:[],eksplorasi:[]} },
  { id:"hadharah",          name:"Hadharah Islamiyyah",           nameArabic:"الحضارة الإسلامية",    category:"tarikhi", fakultas:["lughah","dirasat"],                      jurusan:["tarikh"],  tingkat:["3","4","pasca"],                  description:"Peradaban Islam — institusi keilmuan, seni, arsitektur, sains, dan kontribusi ke peradaban global.",                                                            descriptionArabic:"الحضارة الإسلامية في مختلف جوانبها",                       kitabUtama:[], recommendedAI:[], tutorial:{overview:"",steps:[]}, prompts:{pahami:[],hafal:[],latihan:[],ujian:[],talaqqi:[],eksplorasi:[]} },
  { id:"dakwah",            name:"Dakwah & I'lam",               nameArabic:"الدعوة والإعلام",      category:"tarikhi", fakultas:["dirasat","ushuluddin"],                  jurusan:[],          tingkat:["2","3","4","pasca"],              description:"Ilmu dan skill dakwah — manhaj dakwah, komunikasi Islam, dakwah para rasul.",                                                                                   descriptionArabic:"علم الدعوة وأصولها",                                       kitabUtama:[], recommendedAI:[], tutorial:{overview:"",steps:[]}, prompts:{pahami:[],hafal:[],latihan:[],ujian:[],talaqqi:[],eksplorasi:[]} },
  { id:"adyan",             name:"Adyan (Perbandingan Agama)",    nameArabic:"الأديان والمذاهب",     category:"tarikhi", fakultas:["ushuluddin","dirasat"],                  jurusan:["aqidah"],  tingkat:["3","4","pasca"],                  description:"Studi perbandingan agama — Yahudi, Nasrani, Hindu, Buddha dari perspektif Islam.",                                                                              descriptionArabic:"دراسة مقارنة الأديان",                                     kitabUtama:[], recommendedAI:[], tutorial:{overview:"",steps:[]}, prompts:{pahami:[],hafal:[],latihan:[],ujian:[],talaqqi:[],eksplorasi:[]} },
];

/* ============ HELPER FUNCTIONS ============ */

const getMaddahsForProfile = (profile) => {
  if (!profile) return MADDAHS;
  return MADDAHS.filter(m => {
    const facultyMatch = !profile.faculty || m.fakultas.includes(profile.faculty);
    const levelMatch   = !profile.level  || m.tingkat.includes(profile.level);
    return facultyMatch && levelMatch;
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
