import React, { useState, useEffect } from 'react';
/* Talqeeh — Materi Seminar AI (unlisted: tidak ditautkan di mana pun, hanya lewat slug ini).
   Ganti SEMINAR_AI_PATH untuk memutar slug. Jangan tautkan dari navbar/footer/sitemap. */

const SEMINAR_AI_PATH = "/seminar/ai-m1583hmvaq";

const SEMINAR_UPDATED = "Oktober 2026";

const SEMINAR_CHAPTERS = [
  {
    id: "fundamental",
    icon: "brain",
    title: "Fundamental AI",
    summary: "Memahami apa itu AI dan LLM, cara kerjanya, dan kenapa ia bisa salah dengan percaya diri.",
    sections: [
      {
        h: "Peta istilah",
        points: [
          "**AI (kecerdasan buatan)** adalah payung besar: sistem yang meniru kemampuan yang biasanya butuh kecerdasan manusia.",
          "**Machine learning** adalah AI yang belajar pola dari data, bukan dari aturan yang ditulis manual.",
          "**Deep learning** memakai jaringan saraf berlapis-lapis, dan menjadi dasar AI modern.",
          "**LLM (large language model)** adalah model bahasa yang dilatih pada teks dalam jumlah sangat besar. ChatGPT, Claude, dan Gemini termasuk di sini.",
          "**Generative AI** adalah AI yang menghasilkan konten baru: teks, gambar, audio, atau kode.",
        ],
      },
      {
        h: "Cara kerja LLM, versi sederhana",
        points: [
          "Teks dipecah menjadi potongan kecil bernama **token**. Dalam bahasa Arab satu kata bisa menjadi beberapa token.",
          "Model **memprediksi token berikutnya** berdasarkan pola yang ia pelajari. Ia tidak membuka database lalu mengutip jawaban.",
          "**Context window** adalah batas banyaknya teks yang bisa dilihat model dalam satu percakapan. Di luar itu, ia tidak melihatnya.",
          "Model tidak otomatis mengingat percakapan lama. Yang ia tahu hanyalah apa yang ada di konteks saat ini.",
        ],
      },
      {
        h: "Kenapa AI bisa berhalusinasi",
        points: [
          "Model dilatih untuk menghasilkan teks yang **masuk akal**, bukan teks yang **terjamin benar**.",
          "Paling rawan salah: nama kitab dan halaman, nomor hadis, kutipan persis, angka, dan tahun.",
          "Jawabannya sering terdengar sangat meyakinkan, justru saat ia mengarang.",
        ],
      },
      {
        h: "Kuat dan lemahnya",
        points: [
          "**Kuat:** menjelaskan ulang dengan bahasa sederhana, merangkum, menerjemah, brainstorming, membuat latihan soal, dan mengubah format.",
          "**Lemah:** fakta spesifik tanpa sumber, hitungan panjang, kejadian sangat baru, dan konteks lokal yang tidak pernah tertulis.",
        ],
      },
      {
        h: "Peta alat",
        points: [
          "**Chatbot umum** (ChatGPT, Claude, Gemini): serbaguna untuk menjelaskan, menulis, dan berdiskusi.",
          "**Berbasis sumber** (NotebookLM): menjawab dari dokumen yang kamu unggah, sehingga lebih mudah dicek.",
          "**Pencari dengan sitasi** (Perplexity): memberi tautan sumber yang bisa dibuka dan diperiksa.",
          "**Khusus domain** (mis. Talqeeh): dirancang untuk kebutuhan tertentu, seperti muqarrar Al-Azhar.",
          "Aturan praktis: makin berbahaya akibat salahnya, makin penting memakai alat yang bersumber dan memverifikasi hasilnya.",
        ],
      },
    ],
    task: {
      title: "Uji AI dengan materi yang kamu kuasai",
      minutes: 10,
      steps: [
        "Pilih satu bab kitab yang sedang kamu pegang.",
        "Ajukan tiga pertanyaan ke AI: satu definisi, satu detail (misalnya halaman atau nama tokoh), satu contoh.",
        "Cocokkan tiap jawaban dengan kitabmu.",
        "Tandai: benar, meleset, atau terdengar benar tapi tidak ada di kitab.",
      ],
      output: "Catatan Uji AI: tiga pertanyaan, hasil cek, dan satu kesimpulan tentang kapan AI bisa dipercaya.",
      fields: [
        { label: "Pertanyaan 1 (definisi)", hint: "Tulis pertanyaanmu, jawaban AI secara singkat, lalu hasil cek: benar, meleset, atau terdengar benar tapi tidak ada di kitab.", rows: 3 },
        { label: "Pertanyaan 2 (detail)", hint: "Misalnya halaman, nama tokoh, atau nomor hadis. Tulis dengan format yang sama.", rows: 3 },
        { label: "Pertanyaan 3 (contoh)", hint: "Minta satu contoh dari kitab, lalu cek kebenarannya.", rows: 3 },
        { label: "Kesimpulan: kapan AI bisa dipercaya?", hint: "Satu atau dua kalimat dari temuanmu sendiri.", rows: 2 },
      ],
    },
  },
  {
    id: "prompting",
    icon: "sparkles",
    title: "Prompting yang efektif",
    summary: "Cara memberi perintah supaya jawaban AI tepat sasaran, dari pemula sampai terbiasa.",
    sections: [
      {
        h: "Rumus lima bagian",
        points: [
          "**Peran:** siapa AI ini untukmu (tutor nahwu, dosen fiqh).",
          "**Konteks:** siapa kamu dan apa situasinya (mahasiswa tingkat 2, ujian minggu depan).",
          "**Tugas:** apa yang harus dikerjakan, dengan satu kata kerja yang jelas.",
          "**Format:** bentuk keluaran (tabel, poin, Arab + Indonesia).",
          "**Batasan:** apa yang tidak boleh (jangan mengarang referensi, jangan lebih dari 200 kata).",
        ],
      },
      {
        h: "Iterasi, bukan sekali jadi",
        points: [
          "Prompt pertama jarang menjadi hasil akhir. Perbaiki dengan permintaan spesifik: \"lebih singkat\", \"beri contoh dari kitab\", \"pakai bahasa yang lebih sederhana\".",
          "Minta AI **bertanya balik** kalau informasinya kurang, supaya ia tidak menebak.",
          "Pecah tugas besar menjadi langkah-langkah kecil.",
        ],
      },
      {
        h: "Beri contoh (few-shot)",
        points: [
          "Tunjukkan satu atau dua contoh keluaran yang kamu inginkan. AI mengikuti pola contoh dengan sangat baik.",
        ],
      },
      {
        h: "Bahasa Arab dan campuran",
        points: [
          "Sebutkan tujuan bahasa keluaran: \"jelaskan dalam Indonesia, tulis istilahnya dalam Arab berharakat\".",
          "Sebutkan level dan mazhab bila relevan, supaya penjelasannya tidak melompat ke tingkat yang salah.",
        ],
      },
      {
        h: "Kesalahan yang paling sering",
        points: [
          "Terlalu singkat: \"jelaskan nahwu\" tidak memberi arah.",
          "Menumpuk banyak tugas dalam satu prompt.",
          "Tidak memberi sumber, lalu meminta AI \"mengingat\" isi kitab.",
          "Menerima hasil mentah-mentah tanpa mengecek.",
        ],
      },
    ],
    prompts: [
      {
        label: "Kurang baik",
        text: "Jelaskan isim mamnu' minas sharf.",
      },
      {
        label: "Lebih baik",
        text: "Kamu adalah tutor nahwu untuk mahasiswa Al-Azhar tingkat 2. Jelaskan isim mamnu' minas sharf dengan bahasa Indonesia sederhana, tulis istilah dan contoh dalam Arab berharakat. Beri 3 sebab terlarang tanwin beserta satu contoh tiap sebab, dalam bentuk tabel. Jangan mengarang kutipan kitab; kalau tidak yakin, katakan.",
      },
    ],
    task: {
      title: "Tulis prompt andalanmu",
      minutes: 15,
      steps: [
        "Pilih satu mata kuliah yang sedang kamu pelajari.",
        "Tulis prompt singkat, lalu jalankan.",
        "Tulis ulang dengan rumus lima bagian (peran, konteks, tugas, format, batasan), lalu jalankan lagi.",
        "Perbaiki sekali lagi sesuai kekurangan hasilnya.",
      ],
      output: "Prompt Andalan: satu prompt lima bagian yang siap dipakai ulang, plus catatan apa yang kamu perbaiki.",
      fields: [
        { label: "Mata kuliah", hint: "Mata kuliah atau maddah yang kamu pakai.", rows: 1 },
        { label: "Prompt final", hint: "Tulis lengkap: peran, konteks, tugas, format, dan batasan.", rows: 7 },
        { label: "Apa yang kamu perbaiki dari versi pertama?", hint: "Dua atau tiga hal yang membuat hasilnya lebih baik.", rows: 3 },
      ],
    },
  },
  {
    id: "belajar",
    icon: "bookOpen",
    title: "AI untuk belajar (konteks Masisir)",
    summary: "Memakai AI sebagai teman belajar aktif untuk diktat tebal, istilah sulit, dan ujian yang mepet.",
    sections: [
      {
        h: "Meringkas diktat tebal",
        points: [
          "Tempel materi **per bagian**, bukan seluruh diktat sekaligus, supaya detailnya tidak hilang.",
          "Minta ringkasan berlevel: satu kalimat, satu paragraf, lalu poin-poin penting.",
          "Minta daftar istilah sulit beserta artinya, dan bagian yang paling mungkin keluar di ujian.",
        ],
      },
      {
        h: "Peta konsep",
        points: [
          "Minta AI menghubungkan istilah: mana induk, mana cabang, mana yang sering tertukar.",
          "Cocok untuk materi yang banyak pembagian, seperti ushul fiqh, mustalah hadis, atau balaghah.",
        ],
      },
      {
        h: "Mufradat dan i'rab",
        points: [
          "Minta i'rab **kata per kata beserta alasannya**, bukan hanya hasil akhir.",
          "Cek hasilnya dengan kitab nahwu. Gunakan AI untuk melatih, lalu coba i'rab dulu sendiri sebelum bertanya.",
        ],
      },
      {
        h: "AI sebagai tutor yang bertanya balik",
        points: [
          "Alih-alih meminta jawaban, minta ia **menguji kamu**: satu pertanyaan sekali jalan, tunggu jawabanmu, lalu beri koreksi.",
          "Cara ini jauh lebih membekas daripada sekadar membaca penjelasan yang rapi.",
        ],
      },
      {
        h: "Flashcard, kuis, dan pengulangan",
        points: [
          "Ubah ringkasan menjadi flashcard dan soal pilihan ganda atau esai.",
          "Ulangi berjarak: hari 1, hari 3, hari 7, hari 14. Mengingat berulang dengan jeda lebih kuat daripada mengulang sekali panjang.",
        ],
      },
      {
        h: "Dari rekaman kuliah",
        points: [
          "Rekaman bisa ditranskrip, lalu diringkas per topik. Tandai bagian yang terdengar janggal, karena transkrip suara bisa salah menangkap istilah Arab.",
        ],
      },
    ],
    prompts: [
      {
        label: "Tutor yang menguji",
        text: "Kamu adalah penguji. Berdasarkan ringkasan di bawah, ajukan satu pertanyaan saja, tunggu jawabanku, lalu koreksi dan jelaskan. Naikkan tingkat kesulitan kalau jawabanku benar. Jangan beri jawaban sebelum aku menjawab.\n\n[tempel ringkasan]",
      },
    ],
    task: {
      title: "Bikin set belajar satu bab",
      minutes: 20,
      steps: [
        "Tempel satu bab diktatmu per bagian, lalu minta ringkasan tiga level.",
        "Minta lima flashcard dan lima soal beserta kunci jawabannya.",
        "Tutup layar, tulis ulang isi bab dengan kata-katamu sendiri.",
        "Minta AI menguji kamu satu pertanyaan sekali jalan, lalu catat skormu.",
      ],
      output: "Set Belajar: ringkasan, lima flashcard, lima soal berikut kunci, dan skor ujianmu.",
      fields: [
        { label: "Bab yang dipakai", hint: "Nama kitab atau diktat dan babnya.", rows: 1 },
        { label: "Ringkasan", hint: "Satu kalimat, satu paragraf, lalu poin penting.", rows: 5 },
        { label: "Lima flashcard", hint: "Format: pertanyaan | jawaban.", rows: 6 },
        { label: "Lima soal beserta kunci jawaban", hint: "Tulis soal, pilihan, lalu kunci.", rows: 6 },
        { label: "Skor ujianmu", hint: "Berapa dari berapa, dan bagian mana yang masih lemah.", rows: 2 },
      ],
    },
  },
  {
    id: "adab",
    icon: "shield",
    title: "Verifikasi, etika, dan adab",
    summary: "Menjaga ilmu tetap benar dan amanah: cek sumber, jujur secara akademik, dan tetap berguru.",
    sections: [
      {
        h: "Protokol tiga cek",
        points: [
          "**Cek nama:** apakah kitab dan pengarangnya benar-benar ada? Cari di Maktabah Syamilah atau katalog perpustakaan.",
          "**Cek halaman:** buka kitabnya langsung. Apakah teks itu ada di halaman yang disebut?",
          "**Cek matan:** bandingkan kata per kata. AI sering memparafrase tanpa memberi tahu.",
        ],
      },
      {
        h: "Etika akademik",
        points: [
          "Memakai AI untuk memahami, berlatih, dan menyusun kerangka adalah wajar.",
          "Menyerahkan hasil AI sebagai karya sendiri adalah ketidakjujuran, dan bisa melanggar aturan kampus.",
          "Ikuti aturan dosen dan kampus, dan sebutkan penggunaan AI bila diminta.",
        ],
      },
      {
        h: "Perspektif Islam",
        points: [
          "Kaidah *al-umur bi maqashidiha*: AI adalah wasilah, nilainya mengikuti tujuan dan cara pakainya.",
          "Ilmu adalah amanah. Jangan menyandarkan hukum syar'i atau fatwa pada jawaban AI. Rujuklah kepada ulama dan kitab muktabar.",
        ],
      },
      {
        h: "Privasi",
        points: [
          "Jangan mengunggah data pribadi, dokumen rahasia, atau data orang lain ke alat AI.",
          "Periksa pengaturan alatnya: apakah percakapanmu dipakai untuk melatih model.",
        ],
      },
      {
        h: "Guru dan sanad tak tergantikan",
        points: [
          "AI tidak punya sanad, tidak bertanggung jawab atas jawabannya, dan tidak bisa menegur adabmu.",
          "Talaqqi tetap jalan utama. AI membantu persiapan, bukan menggantikan majelis.",
        ],
      },
    ],
    task: {
      title: "Verifikasi tiga referensi",
      minutes: 15,
      steps: [
        "Minta AI menyebut tiga referensi kitab untuk satu masalah fiqh.",
        "Lakukan cek nama, halaman, dan matan pada tiap referensi.",
        "Isi tabel: lolos atau tidak, beserta alasannya.",
        "Tulis satu aturan pribadi dari hasilnya.",
      ],
      output: "Tabel Verifikasi: tiga referensi dengan hasil tiga cek, plus satu aturan pribadi.",
      fields: [
        { label: "Referensi 1", hint: "Nama kitab dan pengarang | halaman | matan. Lolos atau tidak, dan alasannya.", rows: 3 },
        { label: "Referensi 2", hint: "Format yang sama.", rows: 3 },
        { label: "Referensi 3", hint: "Format yang sama.", rows: 3 },
        { label: "Aturan pribadimu", hint: "Satu aturan yang kamu pegang mulai sekarang.", rows: 2 },
      ],
    },
  },
  {
    id: "pendidikan",
    icon: "compass",
    title: "AI untuk pendidikan",
    summary: "Cara memaksimalkan AI untuk belajar, di mana Talqeeh masuk, dan batas peran AI.",
    sections: [
      {
        h: "Belajar yang dipersonalisasi",
        points: [
          "AI bisa menyesuaikan kecepatan, tingkat kesulitan, dan gaya penjelasan untuk tiap pelajar.",
          "Umpan balik instan: pelajar tidak harus menunggu sampai pertemuan berikutnya untuk tahu kesalahannya.",
        ],
      },
      {
        h: "Memaksimalkan AI untuk memudahkan belajar",
        points: [
          "**Pakai sumbermu sendiri.** Beri AI diktat dan kitab yang kamu pegang, supaya jawabannya berpijak pada materi yang benar, bukan ingatan model.",
          "**Belajar aktif.** Minta AI menguji dan mengoreksimu, bukan hanya menjelaskan.",
          "**Sesuaikan level dan gaya.** Sebut tingkat, fakultas, dan cara belajarmu agar penjelasannya pas.",
          "**Putar siklusnya.** Pahami, uji, ulang berjarak, lalu verifikasi. Alat umum jarang menyediakan semuanya sekaligus.",
          "**Kenali konteks Azhar.** Muqarrar, istilah, dan cara ujian Al-Azhar punya kekhasan yang tidak dikenal alat umum.",
        ],
      },
      {
        h: "Di sinilah Talqeeh masuk",
        points: [
          "Masalah: diktat tebal, istilah sulit, waktu ujian terbatas, dan alat AI yang terlalu umum.",
          "Jawaban: Talqeeh merangkai kelima cara tadi dalam satu tempat. Ada library maddah, prompt yang sudah disesuaikan, bank soal, bantuan mufradat dan i'rab, serta AI Study Partner.",
          "Prinsip: AI menyuburkan pemahaman, bukan menggantikan guru, kitab, atau proses belajar.",
        ],
      },
      {
        h: "Siapa mengerjakan apa",
        points: [
          "AI membantu menyiapkan, merangkum, dan melatih. Guru membimbing, menilai, dan memberi sanad.",
          "Kamu yang memahami, mengamalkan, dan bertanggung jawab atas jawabanmu sendiri.",
        ],
      },
      {
        h: "Penilaian dan integritas",
        points: [
          "Pendeteksi tulisan AI tidak andal dan bisa menuduh orang yang salah.",
          "Pendekatan yang lebih sehat: ujian lisan, tugas berproses, portofolio, dan penjelasan langsung atas karya sendiri.",
          "Aturan tiap dosen dan kampus bisa berbeda. Tanyakan, ikuti, dan sebutkan penggunaan AI bila diminta.",
        ],
      },
      {
        h: "Literasi AI dan kesenjangan",
        points: [
          "Memahami cara kerja dan batas AI kini menjadi kemampuan dasar, setara literasi digital.",
          "Akses tidak merata: koneksi, biaya langganan, dan bahasa. Banyak alat lebih kuat di bahasa Inggris dibanding Arab klasik.",
          "Konteks keilmuan Islam bisa kurang terwakili dalam data latih, jadi verifikasi lebih penting lagi.",
        ],
      },
      {
        h: "Arah ke depan",
        points: [
          "Agen AI yang mengerjakan tugas bertahap, interaksi suara dan gambar, serta model yang makin baik di bahasa Arab.",
          "Alatnya akan terus berganti. Kebiasaan memverifikasi, jujur, dan berguru tidak.",
        ],
      },
    ],
    task: {
      title: "Rancang cara belajarmu dengan AI",
      minutes: 15,
      steps: [
        "Tulis satu kesulitan belajar yang paling sering kamu alami.",
        "Tentukan bagian yang kamu serahkan ke AI dan yang tetap ke guru dan kitab.",
        "Coba satu fitur Talqeeh untuk kesulitan itu (template prompt maddahmu atau AI Study Partner).",
        "Tulis tiga aturan pemakaian AI untuk dirimu sendiri.",
      ],
      output: "Peta Peran dan Aturan Pribadi: satu kesulitan, pembagian peran AI dan guru, dan tiga aturan pemakaian.",
      fields: [
        { label: "Kesulitan belajar yang paling sering", hint: "Satu masalah yang nyata di kegiatan belajarmu.", rows: 2 },
        { label: "Yang kuserahkan ke AI", hint: "Bagian yang aman dibantu AI.", rows: 3 },
        { label: "Yang tetap ke guru dan kitab", hint: "Bagian yang tidak boleh diserahkan.", rows: 3 },
        { label: "Fitur Talqeeh yang kucoba", hint: "Fitur apa dan hasilnya bagaimana.", rows: 2 },
        { label: "Tiga aturan pemakaian AI untukku", hint: "Tulis sebagai kalimat tegas.", rows: 4 },
      ],
    },
  },
  {
    id: "praktik",
    icon: "target",
    title: "Rencana dan tindak lanjut",
    summary: "Mengubah hasil seminar menjadi kebiasaan belajar selama seminggu ke depan.",
    sections: [
      {
        h: "Rencana belajar 7 hari",
        points: [
          "Hari 1: ringkas materi. Hari 2: buat kuis dan kerjakan. Hari 3: perbaiki bagian yang salah.",
          "Hari 4 dan 5: tutor penguji. Hari 6: ulang dengan flashcard. Hari 7: simulasi ujian tanpa membuka catatan.",
        ],
      },
      {
        h: "Menjaga kebiasaan",
        points: [
          "**Mulai kecil.** Dua puluh menit tiap hari lebih ringan dijaga daripada maraton satu malam.",
          "**Pakai Paket Belajarmu.** Jadikan Set Belajar dan Prompt Andalan sebagai bahan, jangan mulai dari nol.",
          "**Tetap verifikasi.** Referensi baru dipakai setelah lolos tiga cek.",
          "**Cari teman belajar.** Saling menguji membuat belajar lebih aktif.",
        ],
      },
    ],
    task: {
      title: "Susun rencana 7 hari",
      minutes: 10,
      steps: [
        "Ambil Set Belajar dari Bab 3 sebagai bahan.",
        "Isi hari 1 sampai 7 dengan kegiatan dari rencana, lengkap dengan jam yang realistis.",
        "Tetapkan tanggal mulai dan satu hal yang akan selalu kamu verifikasi.",
      ],
      output: "Rencana 7 Hari: jadwal siap jalan dengan tanggal mulai.",
      fields: [
        { label: "Tanggal mulai", hint: "Hari dan tanggal kamu mulai.", rows: 1 },
        { label: "Hari 1 sampai 7", hint: "Satu baris per hari: kegiatan dan jamnya.", rows: 7 },
        { label: "Satu hal yang selalu kuverifikasi", hint: "Misalnya referensi kitab atau hukum syar'i.", rows: 2 },
      ],
    },
  },
];

/* Jadwal seminar 3 jam (180 menit). Menit materi per bab + menit tugas (task.minutes) + blok tetap. */
const SEMINAR_TALK = { fundamental: 12, prompting: 12, belajar: 12, adab: 8, pendidikan: 20, praktik: 5 };
SEMINAR_CHAPTERS.forEach(c => { c.talk = SEMINAR_TALK[c.id]; });

const SEMINAR_SCHEDULE = (() => {
  let t = 0; const blocks = [];
  const add = (key, label, min, kind, ch) => { blocks.push({ key, label, min, kind, ch, start: t, end: t + min }); t += min; };
  add("open", "Pembuka dan hook", 8, "open");
  SEMINAR_CHAPTERS.forEach((c, i) => {
    add("talk:" + c.id, "Bab " + (i + 1) + ": materi", c.talk, "talk", c);
    add("task:" + c.id, "Bab " + (i + 1) + ": tugas", c.task.minutes, "task", c);
    if (i === 1) add("break", "Istirahat", 10, "break");
  });
  add("close", "Penutup, ajakan, tanya jawab", 8, "close");
  return { blocks, total: t };
})();
const seminarClock = (min) => Math.floor(min / 60) + ":" + String(min % 60).padStart(2, "0");

/* Screenshot Talqeeh untuk bahasan "Di sinilah Talqeeh masuk". `hl` = kotak sorot dalam persen.
   `pending: true` = gambar belum tersedia, slide-nya dilewati sampai file ada di /public/seminar. */
const SEMINAR_SHOTS = {
  landing: {
    src: "/seminar/talqeeh-landing.webp", ar: 1440 / 828, vh: 66, title: "Satu tempat untuk belajar muqarrar",
    tie: "Menjawab: kenali konteks Azhar",
    points: ["Library untuk 88 maddah Al-Azhar", "AI Partner yang mengolah diktat, slide, dan rekamanmu"],
    hl: { x: 29.9, y: 51.3, w: 40.3, h: 15.5, label: "Library dan AI Partner" },
  },
  katalog: {
    src: "/seminar/talqeeh-katalog.webp", ar: 1440 / 1028, vh: 66, title: "Library maddah",
    tie: "Menjawab: sesuaikan level dan gaya",
    points: ["61 maddah S1 dan 27 maddah Ma'had", "Lebih dari 1.200 template prompt, dipilah per maddah"],
    hl: { x: 8.6, y: 9.5, w: 41.2, h: 25.7, label: "88 maddah, 1.200+ prompt" },
  },
  sample: {
    src: "/seminar/talqeeh-sample.webp", ar: 1440 / 1028, vh: 66, title: "Template prompt per maddah",
    tie: "Menjawab: pakai sumbermu sendiri",
    points: ["Kitab utama tiap maddah", "AI yang paling cocok untuk tiap jenis tugas", "Cara pakai empat langkah"],
    hl: { x: 8.6, y: 78.6, w: 82.8, h: 19.5, label: "AI yang paling cocok per maddah" },
  },
  "aipartner-beranda": {
    imgs: [{ src: "/seminar/aipartner-beranda.webp", hl: { x: 4.4, y: 61.6, w: 93, h: 11.2, label: "Disesuaikan untukmu" } }],
    ar: 704 / 1624, vh: 70, title: "AI Partner: mulai dari satu kotak",
    tie: "Menjawab: sesuaikan level dan gaya",
    points: ["Tanya, unggah materi, atau pilih aksi cepat", "Jawabannya disesuaikan dengan profil belajarmu"],
  },
  "aipartner-ringkasan": {
    imgs: [{ src: "/seminar/aipartner-ringkasan.webp", hl: { x: 4.4, y: 26.1, w: 94, h: 4.8, label: "Ringkasan, peta konsep, i'rab" } }],
    ar: 704 / 1624, vh: 70, title: "AI Partner: olah diktatmu",
    tie: "Menjawab: pakai sumbermu sendiri",
    points: ["Unggah PDF atau foto diktatmu", "Hasil: ringkasan, peta konsep, materi dan i'rab", "Pilih bahasa: Indonesia, Arab, atau dwibahasa"],
  },
  "aipartner-latihan": {
    imgs: [
      { src: "/seminar/aipartner-flashcard.webp", hl: { x: 4.4, y: 60, w: 93, h: 28.1, label: "Flashcard dari materimu" } },
      { src: "/seminar/aipartner-kuis.webp", hl: { x: 4.4, y: 56.2, w: 93, h: 32.5, label: "Kuis dari materimu" } },
    ],
    ar: 704 / 1624, vh: 70, title: "AI Partner: flashcard dan kuis",
    tie: "Menjawab: putar siklusnya",
    points: ["Flashcard otomatis dari materimu", "Kuis pilihan ganda dan latihan tahriri", "Kemajuan hafalan tercatat"],
  },
  "aipartner-tutor": {
    imgs: [{ src: "/seminar/aipartner-tutor.webp", hl: { x: 4.4, y: 32, w: 93, h: 40.7, label: "Tutor menjawab dari isi materimu" } }],
    ar: 704 / 1624, vh: 70, title: "AI Partner: tutor dari materimu",
    tie: "Menjawab: belajar aktif",
    points: ["Tanya apa saja, dijawab berdasarkan isi materimu", "Ada simulasi syafawi untuk latihan ujian lisan"],
  },
};

/* Slide screenshot disisipkan SETELAH subtopik ini, berurutan. */
const SEMINAR_SHOT_AFTER = {
  pendidikan: { "Di sinilah Talqeeh masuk": ["landing", "katalog", "sample", "aipartner-beranda", "aipartner-ringkasan", "aipartner-latihan", "aipartner-tutor"] },
};

/* **tebal** dan *miring* sederhana, tanpa library */
const renderInline = (text) => {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**")) return <strong key={i} className="text-ink font-semibold">{p.slice(2, -2)}</strong>;
    if (p.startsWith("*")) return <em key={i}>{p.slice(1, -1)}</em>;
    return <React.Fragment key={i}>{p}</React.Fragment>;
  });
};

const SeminarPromptBox = ({ label, text }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch {}
  };
  return (
    <div className="rounded-xl border border-gold-500/25 bg-gold-500/5 p-4">
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-xs uppercase tracking-[0.18em] text-gold-400">{label}</span>
        <button onClick={copy} className="btn-subtle !py-1 !px-2.5 !text-xs">
          <Icon name={copied ? "check" : "copy"} className="w-3.5 h-3.5"/>{copied ? "Tersalin" : "Salin"}
        </button>
      </div>
      <p className="text-sm text-ink-muted leading-relaxed whitespace-pre-line">{text}</p>
    </div>
  );
};

const SeminarChapter = ({ ch, index, open, onToggle, done, onDone, sheet, onField }) => (
  <article id={"bab-" + ch.id} className="card-glass overflow-hidden scroll-mt-24">
    <button onClick={onToggle} aria-expanded={open}
            className="w-full flex items-center gap-4 p-4 md:p-6 text-left">
      <span className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-gold-500/15 text-gold-400 flex items-center justify-center shrink-0">
        <Icon name={ch.icon} className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.6}/>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] uppercase tracking-[0.22em] text-gold-400 mb-0.5">Bab {index + 1}</span>
        <span className="block font-display text-lg md:text-2xl font-semibold text-ink leading-snug">{ch.title}</span>
        {!open && <span className="block text-sm text-ink-muted mt-1 leading-relaxed">{ch.summary}</span>}
      </span>
      <Icon name="chevronDown" className={"w-5 h-5 text-ink-soft shrink-0 transition-transform " + (open ? "rotate-180" : "")}/>
    </button>
    {open && (
      <div className="px-4 md:px-6 pb-5 md:pb-7 border-t border-line">
        <p className="text-ink-muted text-base md:text-lg leading-relaxed pt-5 mb-6">{ch.summary}</p>
        <div className="space-y-6">
          {ch.sections.map(s => (
            <div key={s.h}>
              <h3 className="font-display text-lg md:text-xl font-semibold text-ink mb-2.5">{s.h}</h3>
              <ul className="space-y-2">
                {s.points.map((p, i) => (
                  <li key={i} className="flex gap-3 text-ink-muted leading-relaxed">
                    <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-gold-500/70 shrink-0"/>
                    <span className="min-w-0">{renderInline(p)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {ch.prompts && (
          <div className="mt-6 space-y-3">
            <div className="text-xs uppercase tracking-[0.22em] text-gold-400">Contoh prompt</div>
            {ch.prompts.map(p => <SeminarPromptBox key={p.label} {...p}/>)}
          </div>
        )}
        {ch.id === "pendidikan" && (
          <div className="mt-6">
            <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-3">Tampilan Talqeeh</div>
            <div className="grid sm:grid-cols-3 gap-3">
              {Object.values(SEMINAR_SHOTS).filter(s => !s.pending).map(s => (
                <figure key={s.title} className="rounded-xl overflow-hidden border border-white/10 bg-white/[0.02]">
                  <img src={s.imgs ? s.imgs[0].src : s.src} alt={s.title} loading="lazy" className="w-full aspect-[16/10] object-cover object-top"/>
                  <figcaption className="p-3 text-sm text-ink-muted"><span className="block text-ink font-medium">{s.title}</span>{s.tie}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        )}
        <div className={"mt-6 rounded-xl border p-4 md:p-5 " + (done ? "border-gold-500/50 bg-gold-500/[0.07]" : "border-gold-500/25 bg-gold-500/[0.04]")}>
          <div className="flex items-start gap-3">
            <Icon name="lightbulb" className="w-5 h-5 text-gold-300 shrink-0 mt-1" strokeWidth={1.6}/>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-3">
                <span className="text-xs uppercase tracking-[0.18em] text-gold-300">Tugas</span>
                <span className="text-xs text-ink-muted">{ch.task.minutes} menit</span>
              </div>
              <div className="font-display text-lg md:text-xl font-semibold text-ink mt-1 mb-3">{ch.task.title}</div>
              <ol className="space-y-1.5 mb-4">
                {ch.task.steps.map((st, i) => (
                  <li key={i} className="flex gap-3 text-sm md:text-base text-ink-muted leading-relaxed">
                    <span className="num text-gold-400 w-5 shrink-0">{i + 1}</span><span className="min-w-0">{st}</span>
                  </li>
                ))}
              </ol>
              <div className="rounded-lg bg-black/25 border border-white/10 p-3 text-sm md:text-base">
                <span className="text-gold-300 font-medium">Output: </span><span className="text-ink">{ch.task.output}</span>
              </div>
              <details className="mt-4 rounded-lg border border-white/10 bg-black/20 open:bg-black/30">
                <summary className="cursor-pointer select-none list-none px-3.5 py-3 flex items-center justify-between gap-3 text-sm md:text-base text-gold-300 font-medium">
                  <span>Isi lembar kerja <span className="text-ink-muted font-normal">({ch.task.fields.filter((_, k) => (sheet.f[ch.id + "." + k] || "").trim()).length} dari {ch.task.fields.length} terisi)</span></span>
                  <Icon name="chevronDown" className="w-4 h-4 shrink-0"/>
                </summary>
                <div className="px-3.5 pb-4 pt-1 grid gap-4">
                  {ch.task.fields.map((f, k) => {
                    const id = "ws-" + ch.id + "-" + k;
                    return (
                      <div key={id}>
                        <label htmlFor={id} className="block text-sm font-medium text-ink mb-0.5">{f.label}</label>
                        <p className="text-xs text-ink-muted mb-1.5 leading-snug">{f.hint}</p>
                        <textarea id={id} rows={f.rows} value={sheet.f[ch.id + "." + k] || ""}
                                  onChange={(e) => onField(ch.id + "." + k, e.target.value)}
                                  className="w-full rounded-lg bg-black/30 border border-white/15 focus:border-gold-500 focus:outline-none px-3 py-2 text-ink leading-relaxed resize-y"
                                  style={{ fontSize: 16 }}/>
                      </div>
                    );
                  })}
                </div>
              </details>
              <label className="mt-3 inline-flex items-center gap-2.5 cursor-pointer select-none text-sm text-ink-muted">
                <input type="checkbox" checked={!!done} onChange={() => onDone(ch.id)} className="w-4 h-4 accent-[#C9A86A]"/>
                Tugas ini sudah selesai
              </label>
            </div>
          </div>
        </div>
      </div>
    )}
  </article>
);

const TASKS_KEY = "talqeeh_seminar_tasks";
const SHEET_KEY = "talqeeh_seminar_sheet";
const seminarOutputName = (ch) => ch.task.output.split(":")[0];

/* Gabungkan semua isian jadi satu teks yang rapi untuk disalin, diunduh, atau dikirim. */
const seminarCompile = (sheet) => {
  const L = [];
  L.push("PAKET BELAJAR AI PRIBADI");
  L.push("Seminar AIGYPT x Talqeeh");
  L.push("Nama: " + (sheet.name.trim() || "-"));
  L.push("Tanggal: " + new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }));
  SEMINAR_CHAPTERS.forEach((ch, i) => {
    L.push("", "== " + (i + 1) + ". " + seminarOutputName(ch).toUpperCase() + " ==");
    ch.task.fields.forEach((f, k) => {
      const v = (sheet.f[ch.id + "." + k] || "").trim();
      L.push("", f.label + (/[?:.]$/.test(f.label) ? "" : ":"), v || "(belum diisi)");
    });
  });
  L.push("", "Dibuat dengan materi seminar Talqeeh. Instagram @ai.gypt");
  return L.join("\n");
};

const SeminarAiPage = () => {
  const [openSet, setOpenSet] = useState(() => new Set([SEMINAR_CHAPTERS[0].id]));
  const [sheet, setSheet] = useState(() => {
    try { const s = JSON.parse(localStorage.getItem(SHEET_KEY) || "null"); if (s && s.f) return { name: s.name || "", f: s.f }; } catch {}
    return { name: "", f: {} };
  });
  const [exportMsg, setExportMsg] = useState("");
  const saveSheet = (n) => { setSheet(n); try { localStorage.setItem(SHEET_KEY, JSON.stringify(n)); } catch {} };
  const setField = (key, v) => saveSheet({ ...sheet, f: { ...sheet.f, [key]: v } });
  const setName = (v) => saveSheet({ ...sheet, name: v });
  const flash = (m) => { setExportMsg(m); setTimeout(() => setExportMsg(""), 3200); };
  const copyAll = async () => {
    try { await navigator.clipboard.writeText(seminarCompile(sheet)); flash("Tersalin. Tempel di catatan atau WhatsApp."); }
    catch { flash("Gagal menyalin. Coba tombol Unduh."); }
  };
  const downloadAll = () => {
    try {
      const blob = new Blob([seminarCompile(sheet)], { type: "text/plain;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "paket-belajar-ai-" + ((sheet.name.trim() || "peserta").toLowerCase().replace(/[^a-z0-9]+/g, "-")) + ".txt";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      flash("File diunduh.");
    } catch { flash("Gagal mengunduh. Coba tombol Salin."); }
  };
  const shareWa = async () => {
    const text = seminarCompile(sheet);
    if (text.length > 3500) {
      try { await navigator.clipboard.writeText(text); flash("Teks panjang, sudah disalin. Tempel di WhatsApp."); } catch { flash("Teks terlalu panjang. Pakai tombol Unduh."); }
      window.open("https://wa.me/", "_blank", "noopener");
    } else {
      window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank", "noopener");
    }
  };
  const filledCount = SEMINAR_CHAPTERS.reduce((n, c) => n + c.task.fields.filter((_, k) => (sheet.f[c.id + "." + k] || "").trim()).length, 0);
  const fieldTotal = SEMINAR_CHAPTERS.reduce((n, c) => n + c.task.fields.length, 0);
  const [doneMap, setDoneMap] = useState(() => {
    try { return JSON.parse(localStorage.getItem(TASKS_KEY) || "{}") || {}; } catch { return {}; }
  });
  const toggleDone = (id) => setDoneMap(prev => {
    const n = { ...prev, [id]: !prev[id] };
    try { localStorage.setItem(TASKS_KEY, JSON.stringify(n)); } catch {}
    return n;
  });
  const doneCount = SEMINAR_CHAPTERS.filter(c => doneMap[c.id]).length;

  // Halaman ini tidak untuk diindeks mesin pencari.
  useEffect(() => {
    const m = document.createElement("meta");
    m.name = "robots"; m.content = "noindex, nofollow";
    document.head.appendChild(m);
    return () => { m.remove(); };
  }, []);

  const toggle = (id) => setOpenSet(prev => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });
  const allOpen = openSet.size === SEMINAR_CHAPTERS.length;
  const goTo = (id) => {
    setOpenSet(prev => new Set(prev).add(id));
    setTimeout(() => {
      const el = document.getElementById("bab-" + id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  return (
    <div className="page-enter">
      <PageHeader
        kicker="Materi Seminar"
        arabic="الذكاء الاصطناعي في التعليم"
        title="Dari fundamental sampai AI untuk pendidikan."
        subtitle={`Pegangan peserta seminar AIGYPT × Talqeeh. Diperbarui ${SEMINAR_UPDATED}.`}
      />

      <section className="pb-16">
        <div className="container-x">
          <div className="grid lg:grid-cols-12 gap-6 lg:gap-10 items-start">
            {/* Daftar isi */}
            <aside className="lg:col-span-4 lg:sticky lg:top-24">
              <div className="card-glass p-4 md:p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-3">Daftar isi</div>
                <ol className="space-y-1">
                  {SEMINAR_CHAPTERS.map((ch, i) => (
                    <li key={ch.id}>
                      <button onClick={() => goTo(ch.id)}
                              className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left text-ink-muted hover:text-ink hover:bg-white/5 transition-colors">
                        <span className="num text-sm text-gold-400 w-5 shrink-0">{i + 1}</span>
                        <span className="text-sm leading-snug">{ch.title}</span>
                      </button>
                    </li>
                  ))}
                </ol>
                <button onClick={() => navigate(SEMINAR_AI_PATH + "/slides")} className="btn btn-gold w-full justify-center mt-4 text-sm py-2.5">
                  <Icon name="play" className="w-4 h-4"/> Mode slide
                </button>
                <button
                  onClick={() => setOpenSet(allOpen ? new Set() : new Set(SEMINAR_CHAPTERS.map(c => c.id)))}
                  className="btn-subtle w-full justify-center mt-2">
                  {allOpen ? "Tutup semua bab" : "Buka semua bab"}
                </button>
              </div>
            </aside>

            {/* Bab */}
            <div className="lg:col-span-8 space-y-3 md:space-y-4 min-w-0">
              {SEMINAR_CHAPTERS.map((ch, i) => (
                <SeminarChapter key={ch.id} ch={ch} index={i} open={openSet.has(ch.id)} onToggle={() => toggle(ch.id)}
                                done={!!doneMap[ch.id]} onDone={toggleDone} sheet={sheet} onField={setField}/>
              ))}
              <section className="card-glass-strong p-5 md:p-8">
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                  <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink">Paket Belajar AI Pribadi</h2>
                  <span className="num text-gold-300 text-sm">{doneCount} dari {SEMINAR_CHAPTERS.length} output selesai</span>
                </div>
                <p className="text-ink-muted mb-5">Enam tugas di atas menghasilkan satu paket yang kamu bawa pulang dan langsung bisa dipakai.</p>
                <div className="h-[3px] rounded-full bg-white/10 overflow-hidden mb-5">
                  <div className="h-full bg-gold-500 transition-[width] duration-500" style={{ width: (doneCount / SEMINAR_CHAPTERS.length * 100) + "%" }}/>
                </div>
                <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
                  {SEMINAR_CHAPTERS.map((ch, i) => (
                    <li key={ch.id} className="flex items-start gap-3">
                      <span className={"mt-0.5 w-6 h-6 rounded-full shrink-0 flex items-center justify-center border " + (doneMap[ch.id] ? "bg-gold-500 border-gold-500 text-night-950" : "border-white/25 text-transparent")}>
                        <Icon name="check" className="w-3.5 h-3.5" strokeWidth={2.6}/>
                      </span>
                      <span className="min-w-0">
                        <span className="block text-ink font-medium leading-snug">{seminarOutputName(ch)}</span>
                        <span className="block text-xs text-ink-muted">Bab {i + 1}, {ch.task.minutes} menit</span>
                      </span>
                    </li>
                  ))}
                </ol>
                <div className="mt-6 pt-5 border-t border-white/10">
                  <label htmlFor="ws-name" className="block text-sm font-medium text-ink mb-1.5">Namamu</label>
                  <input id="ws-name" value={sheet.name} onChange={(e) => setName(e.target.value)} autoComplete="name"
                         className="w-full sm:max-w-sm rounded-lg bg-black/30 border border-white/15 focus:border-gold-500 focus:outline-none px-3 py-2 text-ink"
                         style={{ fontSize: 16 }}/>
                  <p className="text-xs text-ink-muted mt-2">Lembar kerja tersimpan otomatis di perangkat ini, {filledCount} dari {fieldTotal} kolom terisi.</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <button onClick={copyAll} className="btn btn-gold text-sm py-2.5"><Icon name="copy" className="w-4 h-4"/> Salin semua</button>
                    <button onClick={downloadAll} className="btn btn-ghost text-sm py-2.5"><Icon name="download" className="w-4 h-4"/> Unduh .txt</button>
                    <button onClick={shareWa} className="btn btn-ghost text-sm py-2.5"><Icon name="messageSquare" className="w-4 h-4"/> Kirim ke WhatsApp</button>
                  </div>
                  <p role="status" className="text-sm text-gold-300 mt-3 min-h-[1.25rem]">{exportMsg}</p>
                </div>
              </section>
              <section className="card-glass p-5 md:p-8">
                <h2 className="font-display text-2xl font-semibold text-ink mb-2">Lanjutkan belajar bersama Talqeeh</h2>
                <p className="text-ink-muted leading-relaxed mb-5">Coba template prompt untuk satu maddah tanpa login, atau gabung untuk memakai library lengkap dan AI Study Partner.</p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => navigate("/sample/nahwu")} className="btn btn-gold text-sm py-2.5">Coba sample gratis</button>
                  <button onClick={() => navigate("/gabung")} className="btn btn-ghost text-sm py-2.5">Lihat pilihan paket</button>
                </div>
                <p className="text-sm text-ink-muted mt-5">Pertanyaan atau masukan? Kabari kami lewat Instagram <strong className="text-ink">@ai.gypt</strong>.</p>
              </section>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

Object.assign(window, {
  SeminarAiPage, SEMINAR_AI_PATH,
  SEMINAR_AI_SLIDES_PATH: SEMINAR_AI_PATH + "/slides",
  SEMINAR_AI_GUIDE_PATH: SEMINAR_AI_PATH + "/pemateri",
  SEMINAR_CHAPTERS, seminarRenderInline: renderInline,
  SEMINAR_SHOTS, SEMINAR_SHOT_AFTER, seminarOutputName, seminarCompile, SEMINAR_SCHEDULE, seminarClock,
});
