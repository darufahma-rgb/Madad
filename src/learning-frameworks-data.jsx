import React from 'react';
/* Talqeeh — Data 6 Framework Belajar (dengan sumber ilmiah terverifikasi) */

const LEARNING_FRAMEWORKS = [
  {
    id: "spaced-repetition",
    name: "Spaced Repetition",
    nameId: "Muraja'ah Berjadwal",
    icon: "📅",
    tagline: "Belajar yang dijeda mengalahkan SKS semalaman.",
    summary: "Otak mengingat lebih kuat ketika pengulangan dijeda dengan interval waktu (H+1, H+3, H+7, dst), bukan dijejalkan sekaligus. Ini disebut spacing effect.",
    evidence: "Pertama diteliti Hermann Ebbinghaus (1885). Studi modern oleh Cepeda dkk. menemukan ada interval optimal antara sesi belajar untuk retensi jangka panjang maksimal.",
    sources: [
      "Ebbinghaus, H. (1885). Über das Gedächtnis (Memory: A Contribution to Experimental Psychology).",
      "Cepeda, N. J., Vul, E., Rohrer, D., Wixted, J. T., & Pashler, H. (2008). Spacing Effects in Learning: A Temporal Ridgeline of Optimal Retention. Psychological Science, 19(11), 1095–1102.",
    ],
    tips: [
      "Jadwalkan muraja'ah matan: ulang H+1, H+3, H+7, lalu mingguan menjelang imtihan.",
      "Pakai aplikasi seperti Anki untuk hafalan mufradat & matan dengan interval otomatis.",
      "Hindari menumpuk semua hafalan di malam sebelum ujian — pecah ke beberapa hari.",
    ],
  },
  {
    id: "retrieval-practice",
    name: "Retrieval Practice",
    nameId: "Uji Diri (Testing Effect)",
    icon: "🧠",
    tagline: "Mengingat dari kepala jauh lebih kuat daripada membaca ulang.",
    summary: "Tindakan menarik informasi dari memori (mengetes diri) memperkuat ingatan itu sendiri — jauh lebih efektif daripada sekadar membaca ulang kitab berkali-kali.",
    evidence: "Roediger & Karpicke (2006) menemukan kelompok yang mengetes diri mengungguli kelompok yang membaca ulang pada tes setelah 2 hari & 1 minggu, walau kelompok membaca-ulang merasa lebih percaya diri (illusion of competence).",
    sources: [
      "Roediger, H. L., & Karpicke, J. D. (2006). Test-Enhanced Learning: Taking Memory Tests Improves Long-Term Retention. Psychological Science, 17(3), 249–255.",
    ],
    tips: [
      "Setelah baca satu bab kitab, tutup buku dan tulis ulang poin-poinnya dari ingatan.",
      "Buat soal sendiri dari matan, lalu jawab tanpa melihat — cocok untuk persiapan syafawi.",
      "Gunakan fitur Siap Imtihan (Drill Soal Azhari) sebagai retrieval practice rutin.",
    ],
  },
  {
    id: "interleaving",
    name: "Interleaving",
    nameId: "Belajar Selang-seling",
    icon: "🔀",
    tagline: "Campur topik/soal, jangan satu jenis terus-menerus.",
    summary: "Mencampur beberapa jenis soal atau topik dalam satu sesi (selang-seling) menghasilkan pemahaman lebih dalam daripada mengerjakan satu blok jenis yang sama (blocked).",
    evidence: "Rohrer & Taylor (2007) menemukan praktik selang-seling memperburuk performa saat latihan tapi menggandakan skor pada tes seminggu kemudian, karena melatih kemampuan membedakan jenis masalah.",
    sources: [
      "Rohrer, D., & Taylor, K. (2007). The Shuffling of Mathematics Problems Improves Learning. Instructional Science, 35, 481–498.",
      "Taylor, K., & Rohrer, D. (2010). The Effects of Interleaved Practice. Applied Cognitive Psychology, 24(6), 837–848.",
    ],
    tips: [
      "Selang-seling maddah dalam satu sesi: 30 menit Nahwu, 30 menit Fiqh, balik lagi.",
      "Campur jenis i'rab yang berbeda saat latihan, jangan satu pola terus.",
      "Saat muraja'ah, acak urutan bab agar otak melatih diskriminasi konsep.",
    ],
  },
  {
    id: "elaborative-interrogation",
    name: "Elaborative Interrogation",
    nameId: "Bertanya 'Mengapa'",
    icon: "❓",
    tagline: "Paksa diri menjawab 'kenapa kaidah ini begini'.",
    summary: "Secara aktif bertanya 'mengapa' dan 'bagaimana' sebuah fakta benar, lalu menjawabnya, mengaitkan informasi baru dengan pengetahuan lama dan memperkuat pemahaman.",
    evidence: "Tinjauan Dunlosky dkk. (2013) menilai elaborative interrogation sebagai teknik dengan utilitas sedang yang terbukti meningkatkan pemahaman lintas materi.",
    sources: [
      "Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., & Willingham, D. T. (2013). Improving Students' Learning With Effective Learning Techniques. Psychological Science in the Public Interest, 14(1), 4–58.",
    ],
    tips: [
      "Setiap ketemu kaidah Nahwu/Ushul, tanya: 'kenapa illat-nya begini?' lalu cari jawabnya.",
      "Hubungkan masalah Fiqh baru dengan qa'idah fiqhiyyah yang sudah dikuasai.",
      "Saat baca syarah, tanyakan kenapa pensyarah memilih penjelasan itu.",
    ],
  },
  {
    id: "feynman-technique",
    name: "Feynman Technique",
    nameId: "Ajarkan Ulang (Self-Explanation)",
    icon: "🎤",
    tagline: "Kalau belum bisa menjelaskan sederhana, berarti belum paham.",
    summary: "Menjelaskan materi dengan bahasa sendiri yang sederhana (seolah mengajar orang awam) akan langsung mengungkap bagian mana yang sebenarnya belum kamu pahami.",
    evidence: "Didukung riset self-explanation effect oleh Chi dkk. (1994): siswa yang menjelaskan materi pada diri sendiri memahami lebih dalam daripada yang hanya membaca.",
    sources: [
      "Chi, M. T. H., de Leeuw, N., Chiu, M.-H., & LaVancher, C. (1994). Eliciting Self-Explanations Improves Understanding. Cognitive Science, 18(3), 439–477.",
    ],
    tips: [
      "Setelah belajar satu bab, jelaskan ke teman (atau ke AI) pakai bahasa paling sederhana.",
      "Bagian yang kamu 'tersendat' menjelaskannya = bagian yang perlu dipelajari ulang.",
      "Gunakan AI sebagai 'murid': minta ia bertanya balik untuk menguji penjelasanmu.",
    ],
  },
  {
    id: "dual-coding",
    name: "Dual Coding",
    nameId: "Gabung Teks + Visual",
    icon: "🗺️",
    tagline: "Kata + gambar/skema diingat lebih kuat daripada teks saja.",
    summary: "Otak memproses informasi verbal dan visual lewat dua jalur berbeda. Menggabungkan teks dengan diagram/peta konsep memberi dua jalur pengambilan ingatan.",
    evidence: "Berakar pada Dual Coding Theory (Paivio, 1971) dan riset multimedia learning Mayer yang menunjukkan kombinasi kata + visual relevan meningkatkan pemahaman.",
    sources: [
      "Paivio, A. (1971). Imagery and Verbal Processes. Holt, Rinehart and Winston.",
      "Mayer, R. E. (2009). Multimedia Learning (2nd ed.). Cambridge University Press.",
    ],
    tips: [
      "Buat peta konsep (kharitah dzihniyyah) untuk bab Ushul Fiqh yang bercabang.",
      "Gambar pohon i'rab atau skema pembagian hukum untuk Fiqh.",
      "Pasangkan tiap kaidah dengan satu simbol/diagram sederhana saat membuat Kurasah.",
    ],
  },
];

Object.assign(window, { LEARNING_FRAMEWORKS });
