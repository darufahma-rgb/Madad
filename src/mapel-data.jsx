/* Madad — Panduan Mata Pelajaran Al-Azhar
   Panduan cara pakai AI untuk setiap mata pelajaran.
   Konteks: Masisir (mahasiswa Indonesia di Al-Azhar, Kairo).
*/

const MAPEL_GUIDES = [

  /* ══════════════════════════════════════════════
     SYARIAH
  ══════════════════════════════════════════════ */

  {
    id: "fiqh",
    subject: "Fiqh",
    arabic: "الفِقْهُ",
    faculty: "syariah",
    icon: "layers",
    aiId: "claude",
    aiName: "Claude",
    aiBy: "Anthropic",
    aiColor: "#D97757",
    aiLogo: "/assets/logo-claude.png",
    tagline: "Pahami qoul, tarjih mazhab, bedah dalil maqarrar",
    description: "Maqarrar Fiqh Al-Azhar padat dan penuh perbandingan mazhab. Claude bantu kamu bedah satu per satu sampai benar-benar paham.",
    whyThisAI: "Claude sangat kuat dalam memahami teks panjang dan penalaran bertingkat — persis yang dibutuhkan di Fiqh yang sering meminta kamu membandingkan pendapat ulama sekaligus mempertimbangkan dalil dan konteks. Claude juga tidak menyederhanakan isi secara berlebihan, cocok untuk level akademis Al-Azhar.",
    useCases: [
      "Pecah isi maqarrar yang susah dipahami dalam bahasa Arab",
      "Bandingkan qoul 4 mazhab lengkap dengan dalil dan wajh istidlal",
      "Siapkan jawaban untuk ujian syafahi: simulasi tanya-jawab dengan dosen",
      "Minta penjelasan istilah teknis yang lewat begitu saat kuliah",
      "Bantu susun outline atau draft makalah Fiqh bergaya Azhari",
    ],
    steps: [
      { n: 1, title: "Buka claude.ai", desc: "Gunakan model Claude 3.5 Sonnet (gratis). Buka tab baru supaya tidak tercampur dengan sesi lain." },
      { n: 2, title: "Ceritakan konteks Azhari", desc: "Mulai dengan: 'Aku mahasiswa Al-Azhar Syariah. Aku lagi belajar [topik] dari maqarrar [nama kitab]. Bantu aku pahami bagian berikut.' Ini penting agar Claude tidak ngomong terlalu umum." },
      { n: 3, title: "Paste teks maqarrar kalau perlu", desc: "Kalau ada paragraf dari maqarrar yang membingungkan, langsung paste ke Claude dan minta: 'Jelaskan paragraf ini dengan bahasa yang lebih mudah, tapi jangan hilangkan istilah teknisnya.'" },
      { n: 4, title: "Minta perbandingan mazhab", desc: "Gunakan prompt perbandingan di bawah. Paksa dirimu tanya juga 'mengapa mereka berbeda?' bukan hanya 'apa perbedaannya?' — ini yang diuji di syafahi." },
      { n: 5, title: "Simulasi syafahi sebelum ujian", desc: "Minta Claude jadi 'dosen penguji Azhari yang kritis'. Jawab pertanyaannya satu per satu. Ini persiapan syafahi yang efektif." },
    ],
    prompts: [
      {
        label: "Bedah Maqarrar",
        text: "Aku mahasiswa Al-Azhar Syariah. Bantu aku pahami bagian maqarrar berikut:\n\n[PASTE TEKS ARAB/TERJEMAHAN DARI MAQARRAR]\n\nJelaskan: 1) Inti masalah yang dibahas, 2) Posisi ulama yang disebutkan, 3) Dalil dan wajh istidlal masing-masing, 4) Kesimpulan yang perlu aku ingat untuk ujian. Pertahankan istilah Arab yang penting.",
      },
      {
        label: "Perbandingan 4 Mazhab",
        text: "Jelaskan perbedaan 4 mazhab tentang [MASALAH FIQH]. Format:\n1) Pendapat tiap mazhab (1-2 kalimat)\n2) Dalil utama yang dipakai\n3) Wajh istidlal singkat\n4) Pendapat rajih menurut jumhur\n\nGunakan istilah Arab yang sesuai standar Al-Azhar.",
      },
      {
        label: "Simulasi Ujian Syafahi",
        text: "Aku akan ujian syafahi tentang [TOPIK FIQH] di Al-Azhar. Berperankan sebagai dosen penguji Azhari yang ketat. Ajukan pertanyaan satu per satu mulai dari definisi, lalu ke dalil, lalu ke perbandingan mazhab. Tunggu jawabanku sebelum lanjut ke pertanyaan berikutnya. Koreksi jika ada yang salah.",
      },
    ],
    tips: [
      "Minta Claude selalu sebut nama kitab dan pengarang — bukan sekadar 'ulama Syafi'iyyah'. Ini kebiasaan ilmiah yang baik.",
      "Kalau jawaban Claude meragukan, tanyakan: 'Ini dari kitab mana tepatnya?' — Claude akan lebih hati-hati.",
      "Buat sesi Claude sebagai 'warm up' sebelum baca maqarrar aslinya. Setelah paham konteks, teks Arab jadi lebih mudah dicerna.",
    ],
  },

  {
    id: "ushul",
    subject: "Ushul Fiqh",
    arabic: "أُصُولُ الفِقْهِ",
    faculty: "syariah",
    icon: "bookOpen",
    aiId: "chatgpt",
    aiName: "ChatGPT",
    aiBy: "OpenAI",
    aiColor: "#10A37F",
    aiLogo: "/assets/logo-chatgpt.png",
    tagline: "Drill kaidah, latihan tathbiq, hafal definisi",
    description: "Ushul Fiqh penuh kaidah dan definisi yang harus dikuasai. ChatGPT cocok untuk drill interaktif dan latihan tathbiq (aplikasi) kaidah.",
    whyThisAI: "ChatGPT unggul dalam gaya tutor interaktif — bisa generate soal, mengoreksi jawaban kamu, dan menjelaskan kaidah yang dilanggar secara real-time. Untuk Ushul Fiqh yang butuh banyak latihan, bukan sekadar baca, ChatGPT adalah partner drill yang sabar.",
    useCases: [
      "Drill soal kaidah Ushuliyyah sampai benar-benar hafal dan paham",
      "Minta contoh tathbiq kaidah ke kasus Fiqh nyata (bukan teori)",
      "Bedah perbedaan mazhab dalam Ushul (kehujjahan hadith ahad, qiyas, dll)",
      "Latihan identifikasi dilalah lafadz (nash, zhahir, mujmal, dll)",
      "Bikin rangkuman bab yang rapi untuk belajar malam sebelum ujian",
    ],
    steps: [
      { n: 1, title: "Buka chat.openai.com", desc: "Model GPT-4o (gratis dengan batasan) sudah sangat baik untuk drill Ushul Fiqh." },
      { n: 2, title: "Aktifkan mode tutor", desc: "Mulai dengan: 'Aku mahasiswa Ushul Fiqh Al-Azhar. Bantu aku kuasai [bab] dengan cara drill interaktif. Berikan soal dulu, aku jawab, baru kamu koreksi.'" },
      { n: 3, title: "Drill kaidah satu per satu", desc: "Jangan minta semua kaidah sekaligus. Fokus satu kaidah per sesi. Jawab soal, terima koreksi, lalu minta contoh tathbiq." },
      { n: 4, title: "Tathbiq ke kasus nyata", desc: "Setelah paham teori, tanya: 'Berikan 3 contoh tathbiq kaidah ini dalam Fiqh Ibadah dan 2 dalam Fiqh Muamalat.' Ini yang sering keluar di ujian Azhari." },
      { n: 5, title: "Minta kartu rangkuman", desc: "Di akhir sesi: 'Buat tabel ringkasan: Kaidah | Definisi | Tathbiq | Catatan Penting.' Simpan ke Kurasah dengan tag Ushul." },
    ],
    prompts: [
      {
        label: "Drill Kaidah Interaktif",
        text: "Aku belajar Ushul Fiqh Al-Azhar, fokus pada [NAMA KAIDAH/BAB]. Buat 8 soal latihan dengan tingkat kesulitan bertahap (mudah → sedang → susah). Tampilkan soal saja dulu — aku jawab satu per satu, kamu koreksi dan jelaskan kaidah yang relevan. Mulai dari soal pertama.",
      },
      {
        label: "Tathbiq Kaidah ke Kasus",
        text: "Jelaskan kaidah [KAIDAH USHULIYYAH] dengan cara ini:\n1) Definisi dalam bahasa yang mudah\n2) Contoh tathbiq di Fiqh Ibadah (shalat/zakat/puasa)\n3) Contoh tathbiq di Fiqh Muamalat\n4) Apakah ada mustathnayat (pengecualian) yang wajib diketahui?\n5) Bagaimana kaidah ini muncul di khilaf ulama?",
      },
      {
        label: "Rangkuman Bab untuk Ujian",
        text: "Aku mau ujian Ushul Fiqh besok tentang [BAB/TOPIK]. Buat rangkuman yang mencakup:\n1) Definisi-definisi kunci yang wajib hafal\n2) Pembagian/taqsim utama dalam bab ini\n3) Kaidah-kaidah yang relevan dengan contoh\n4) Poin-poin yang biasanya keluar di ujian Azhari\n\nFormat ringkas dan mudah diingat.",
      },
    ],
    tips: [
      "Gunakan ChatGPT sebagai 'partner drill', bukan sekadar sumber penjelasan — jawab soal dulu, jangan langsung minta jawaban.",
      "Untuk definisi yang harus dihafal persis, minta ChatGPT berikan versi Arab dan terjemahannya sekaligus.",
      "Setelah sesi, catat kaidah yang paling sering kamu salah — itu prioritas murajaah malam sebelum ujian.",
    ],
  },

  {
    id: "qawaid",
    subject: "Qawaid Fiqhiyyah",
    arabic: "القَوَاعِدُ الفِقْهِيَّةُ",
    faculty: "syariah",
    icon: "grid",
    aiId: "claude",
    aiName: "Claude",
    aiBy: "Anthropic",
    aiColor: "#D97757",
    aiLogo: "/assets/logo-claude.png",
    tagline: "Pahami qawaid kubra, latihan tamtsil, aplikasi ke kasus",
    description: "Qawaid Fiqhiyyah butuh dua kemampuan: hafal kaidah dan bisa aplikasikan. Claude bantu kamu kuasai keduanya.",
    whyThisAI: "Claude sangat baik untuk menjelaskan kaidah secara kontekstual dan mendalam — tidak sekadar memberikan definisi, tapi menjelaskan mengapa kaidah itu ada, bagaimana ulama menggunakannya, dan di mana batas penerapannya. Ini level pemahaman yang diharapkan di Al-Azhar.",
    useCases: [
      "Pahami 5 qawaid kubra beserta cabang-cabangnya",
      "Minta tamtsil (contoh) yang relevan dengan kehidupan nyata Masisir di Mesir",
      "Identifikasi kaidah yang berlaku dalam suatu kasus Fiqh",
      "Latihan menghubungkan qawaid ke masalah kontemporer",
      "Bandingkan qawaid yang mirip dan terlihat bertentangan",
    ],
    steps: [
      { n: 1, title: "Buka claude.ai", desc: "Beri konteks: 'Aku belajar Qawaid Fiqhiyyah di Al-Azhar. Bantu aku memahami kaidah [NAMA KAIDAH] dari al-qawaid al-khams al-kubra secara mendalam.'" },
      { n: 2, title: "Pahami asal-usul kaidah", desc: "Tanya: 'Dari mana kaidah ini berasal? Dalil apa yang mendukungnya? Siapa ulama pertama yang merumuskannya?' — ini membantu kamu mengingat kaidah dengan konteks, bukan hafalan buta." },
      { n: 3, title: "Minta tamtsil yang kontekstual", desc: "Minta contoh yang relevan: 'Berikan tamtsil kaidah ini dalam kehidupan sehari-hari mahasiswa di Mesir atau dalam ibadah yang sering dilakukan.'" },
      { n: 4, title: "Latihan identifikasi", desc: "Gunakan prompt identifikasi kaidah di bawah: berikan kasus, minta kamu identifikasi kaidah yang berlaku, baru Claude koreksi." },
      { n: 5, title: "Bedah mustathnayyat", desc: "Setiap kaidah punya pengecualian. Tanya: 'Apa saja mustathnayyat dari kaidah ini dan mengapa pengecualian itu ada?' — ini yang sering ditanyakan di syafahi." },
    ],
    prompts: [
      {
        label: "Pahami Kaidah secara Mendalam",
        text: "Jelaskan kaidah فقهية: [TEKS KAIDAH]\n\nSertakan:\n1) Makna kaidah dalam bahasa yang mudah\n2) Dasar/dalil kaidah ini dari Quran atau Sunnah\n3) Siapa ulama yang merumuskan dan kapan\n4) 3-5 tamtsil (contoh) dari Fiqh Ibadah, Muamalat, dan Ahwal Syakhsiyyah\n5) Mustathnayyat (pengecualian) yang penting\n6) Qawaid lain yang berkaitan",
      },
      {
        label: "Drill Identifikasi Kaidah",
        text: "Aku mau latihan mengidentifikasi kaidah Fiqhiyyah yang berlaku dalam sebuah kasus. Berikan 5 kasus Fiqh (dari yang mudah ke susah), aku akan sebutkan kaidah yang berlaku. Setelah aku jawab tiap kasus, koreksi dan tambahkan penjelasan. Mulai dari kasus pertama sekarang.",
      },
      {
        label: "Bandingkan Qawaid yang Mirip",
        text: "Bandingkan dua kaidah berikut yang tampak mirip:\n[KAIDAH 1] vs [KAIDAH 2]\n\nJelaskan:\n1) Persamaan kedua kaidah\n2) Perbedaan fokus dan ruang lingkupnya\n3) Kasus di mana kaidah 1 berlaku tapi kaidah 2 tidak, dan sebaliknya\n4) Bagaimana ulama menggunakan keduanya secara bersamaan",
      },
    ],
    tips: [
      "Hafal kaidah itu penting, tapi Al-Azhar menguji aplikasi — pastikan kamu bisa memberikan tamtsil sendiri, bukan hanya mengulang yang ada di maqarrar.",
      "Minta Claude menjelaskan dengan 'cerita kasus' — ini membantu otak mengingat kaidah jauh lebih lama daripada hafalan definitif.",
      "Catat tamtsil-tamtsil baru yang kamu dapat dari Claude ke Kurasah — ini bank soal pribadi kamu untuk ujian.",
    ],
  },

  {
    id: "muamalat",
    subject: "Muamalat & Fiqh Kontemporer",
    arabic: "المُعَامَلَاتُ وَالفِقْهُ المُعَاصِرُ",
    faculty: "syariah",
    icon: "refresh",
    aiId: "claude",
    aiName: "Claude",
    aiBy: "Anthropic",
    aiColor: "#D97757",
    aiLogo: "/assets/logo-claude.png",
    tagline: "Fiqh perbankan, kontrak digital, masalah kontemporer",
    description: "Muamalat kontemporer — dari fintech syariah hingga kontrak digital — butuh pemahaman Fiqh klasik yang diterapkan ke realita modern.",
    whyThisAI: "Claude sangat baik dalam menghubungkan kaidah Fiqh klasik ke masalah kontemporer — persis yang dibutuhkan Muamalat Maliyyah dan Fiqh kontemporer. Claude bisa menjelaskan posisi ulama modern (seperti MUI, DSN, OIC Fiqh Academy) dengan cara yang terstruktur.",
    useCases: [
      "Analisis transaksi digital dari perspektif Fiqh (dompet digital, pinjol, kripto)",
      "Pahami produk keuangan syariah (mudharabah, musyarakah, murabahah) dan bedanya",
      "Telusur fatwa kontemporer dari DSN-MUI, Darul Ifta' Mesir, atau OIC Fiqh Academy",
      "Buat analisis Fiqh untuk makalah tentang isu muamalat modern",
      "Latihan mengidentifikasi 'illat dan maqashid dalam masalah baru",
    ],
    steps: [
      { n: 1, title: "Buka claude.ai", desc: "Beri konteks lengkap: 'Aku mahasiswa Syariah Al-Azhar, belajar Fiqh Muamalat Kontemporer. Bantu aku memahami [masalah] dari sudut pandang Fiqh klasik dan kontemporer.'" },
      { n: 2, title: "Mulai dari landasan Fiqh klasik", desc: "Sebelum masuk ke isu kontemporer, minta Claude jelaskan akad atau konsep Fiqh klasik yang relevan. Dasar ini yang membuat analisis kamu kuat." },
      { n: 3, title: "Terapkan ke kasus modern", desc: "Setelah paham landasan, tanya: 'Bagaimana ulama kontemporer menganalisis [kasus modern] berdasarkan kaidah-kaidah tadi? Ada khilaf tidak di antara lembaga fatwa?'" },
      { n: 4, title: "Cek fatwa lembaga", desc: "Minta Claude ringkaskan posisi lembaga-lembaga fatwa: 'Apa posisi DSN-MUI, Darul Ifta' Mesir, dan OIC Fiqh Academy tentang masalah ini?'" },
      { n: 5, title: "Tulis analisis kamu", desc: "Gunakan hasil diskusi untuk menulis analisis Fiqh dengan struktur: Muqaddimah → Latar belakang klasik → Analisis kontemporer → Kesimpulan." },
    ],
    prompts: [
      {
        label: "Analisis Fiqh Muamalat Modern",
        text: "Aku mahasiswa Syariah Al-Azhar. Analisis dari perspektif Fiqh Muamalat:\n\n[PRODUK/TRANSAKSI MODERN, contoh: pinjaman online dengan bunga X% / dompet digital / asuransi syariah]\n\nSertakan: 1) Akad apa yang berlaku secara Fiqh, 2) Apakah ada unsur riba/gharar/maysir, 3) Posisi ulama dan lembaga fatwa kontemporer, 4) Alternatif yang sesuai syariah jika ada masalah.",
      },
      {
        label: "Bedah Produk Keuangan Syariah",
        text: "Jelaskan perbedaan antara [AKAD 1] dan [AKAD 2] dalam Fiqh Muamalat. Format:\n1) Definisi teknis masing-masing\n2) Rukun dan syarat yang berbeda\n3) Contoh produk perbankan/keuangan nyata yang menggunakan akad ini\n4) Khilaf ulama dalam penerapannya\n5) Bagaimana bank syariah kontemporer mengimplementasikan keduanya",
      },
      {
        label: "Persiapan Makalah Muamalat",
        text: "Bantu aku susun kerangka makalah tentang [TOPIK MUAMALAT KONTEMPORER].\n\nMakalah untuk kuliah Muamalat di Al-Azhar, panjang sekitar [X halaman].\n\nBuat: 1) Judul yang akademis, 2) Outline dengan bab dan sub-bab, 3) Sumber referensi yang relevan (kitab klasik + fatwa kontemporer + penelitian modern), 4) Argumen utama yang bisa dikembangkan.",
      },
    ],
    tips: [
      "Untuk fatwa-fatwa spesifik, verifikasi ke situs resmi Darul Ifta' Mesir (dar-alifta.org.eg) atau DSN-MUI.",
      "Ketika Claude menyebut 'ulama kontemporer', tanya siapa nama dan afiliasi mereka — ini untuk daftar pustaka makalah.",
      "Kombinasikan Claude (analisis) dengan Perplexity (cari sumber dan fatwa terbaru) untuk makalah Muamalat yang kuat.",
    ],
  },

  {
    id: "tarikh-tasyri",
    subject: "Tarikh Tasyri'",
    arabic: "تَارِيخُ التَّشْرِيعِ",
    faculty: "syariah",
    icon: "timer",
    aiId: "chatgpt",
    aiName: "ChatGPT",
    aiBy: "OpenAI",
    aiColor: "#10A37F",
    aiLogo: "/assets/logo-chatgpt.png",
    tagline: "Sejarah perkembangan hukum Islam per periode",
    description: "Tarikh Tasyri' butuh pemahaman alur sejarah yang panjang. ChatGPT baik untuk membuat garis waktu, meringkas periode, dan drill soal sejarah.",
    whyThisAI: "ChatGPT unggul dalam menyajikan informasi historis secara terstruktur dan kronologis — sangat membantu untuk Tarikh Tasyri' yang sering diuji dengan pertanyaan 'jelaskan perkembangan Fiqh pada periode X'. ChatGPT juga baik untuk membuat timeline dan perbandingan antar periode.",
    useCases: [
      "Pahami karakteristik Fiqh di setiap periode (ashr Rasul, sahabat, tabi'in, tadwin, dll)",
      "Identifikasi faktor-faktor yang mempengaruhi perkembangan Fiqh tiap era",
      "Hafal tokoh-tokoh kunci per periode beserta kontribusinya",
      "Buat timeline Tarikh Tasyri' dari masa Rasul hingga kontemporer",
      "Latihan soal periode dan perbandingan antar era",
    ],
    steps: [
      { n: 1, title: "Buka ChatGPT", desc: "Beri konteks: 'Aku belajar Tarikh Tasyri' di Al-Azhar. Bantu aku memahami [periode/topik] secara sistematis.'" },
      { n: 2, title: "Pelajari per periode", desc: "Jangan langsung minta semua periode. Fokus satu periode per sesi: karakteristik, tokoh utama, faktor pendukung, dan perbedaan dengan periode sebelumnya." },
      { n: 3, title: "Buat timeline sendiri", desc: "Minta ChatGPT bantu buat timeline dalam format tabel: Periode | Rentang Waktu | Tokoh Kunci | Ciri Utama | Karya Penting. Ini alat belajar yang sangat efektif." },
      { n: 4, title: "Drill soal sejarah", desc: "Minta soal: 'Berikan 5 pertanyaan tentang periode ini seperti yang biasanya keluar di ujian Azhari.' Jawab dan minta koreksi." },
      { n: 5, title: "Bandingkan antar periode", desc: "Setelah hafal per periode, latihan perbandingan: 'Apa perbedaan utama antara periode tadwin dan periode kemunduran Fiqh?'" },
    ],
    prompts: [
      {
        label: "Ringkasan Periode",
        text: "Aku belajar Tarikh Tasyri' Al-Azhar. Jelaskan secara sistematis periode [NAMA PERIODE, contoh: 'Ashr at-Tabi'in / Ashr at-Tadwin / dll]:\n\n1) Rentang waktu dan konteks sejarah\n2) Ciri-ciri Fiqh pada periode ini\n3) Tokoh-tokoh utama dan kontribusi masing-masing\n4) Karya/kitab penting yang muncul\n5) Faktor yang mempengaruhi perkembangan Fiqh di era ini\n6) Perbedaan dengan periode sebelum dan sesudahnya",
      },
      {
        label: "Timeline Tarikh Tasyri'",
        text: "Buat tabel timeline Tarikh Tasyri' Islam dari masa Rasulullah hingga era kontemporer. Kolom: No | Periode | Rentang Tahun | Nama Arab Periode | Ciri Utama | Tokoh Kunci. Buat ringkas tapi informatif untuk belajar sebelum ujian.",
      },
      {
        label: "Latihan Soal Ujian",
        text: "Aku akan ujian Tarikh Tasyri' tentang [PERIODE/TOPIK]. Buat 7 pertanyaan dengan tingkat: 3 soal hafalan faktual, 3 soal analisis sebab-akibat, 1 soal perbandingan. Berikan soal dulu, aku jawab satu per satu, lalu koreksi.",
      },
    ],
    tips: [
      "Buat 'peta mental' (mind map) untuk setiap periode — ChatGPT bisa bantu strukturnya, kamu yang gambar.",
      "Kaitkan Tarikh Tasyri' dengan Ushul Fiqh yang kamu pelajari: bagaimana perkembangan metodologi ushul mempengaruhi produksi Fiqh per periode.",
      "Untuk detail biografi ulama, gabungkan dengan Perplexity yang bisa cari sumber terverifikasi.",
    ],
  },

  /* ══════════════════════════════════════════════
     USHULUDDIN
  ══════════════════════════════════════════════ */

  {
    id: "hadith",
    subject: "Hadith & Musthalah",
    arabic: "الحَدِيثُ وَمُصْطَلَحُهُ",
    faculty: "ushuluddin",
    icon: "search",
    aiId: "perplexity",
    aiName: "Perplexity",
    aiBy: "Perplexity AI",
    aiColor: "#1FB6B6",
    aiLogo: "/assets/logo-perplexity.png",
    tagline: "Takhrij, analisis sanad, klasifikasi hadith",
    description: "Takhrij dan cek sanad butuh pencarian sumber yang bisa diverifikasi. Perplexity memberikan sumber nyata yang bisa diklik.",
    whyThisAI: "Perplexity adalah AI berbasis pencarian web yang selalu menyertakan sumber terverifikasi — penting sekali di Hadith di mana tidak boleh asal klaim. Untuk analisis Musthalah yang lebih konseptual dan mendalam, lanjutkan ke Claude.",
    useCases: [
      "Takhrij hadith: di kitab mana saja dan dengan sanad apa",
      "Cek klasifikasi hadith (shahih/hasan/dhaif) beserta alasan ulama",
      "Cari informasi rawi: biografi dan penilaian ulama Jarh wa Ta'dil",
      "Pahami istilah Musthalah beserta contoh dari kitab hadith",
      "Cari perbedaan pendapat ulama tentang status sanad tertentu",
    ],
    steps: [
      { n: 1, title: "Buka perplexity.ai", desc: "Gunakan filter 'Academic' untuk hasil yang lebih terpercaya. Mode gratis sudah cukup untuk penelusuran hadith." },
      { n: 2, title: "Tulis teks hadith selengkap mungkin", desc: "Semakin lengkap teks hadith yang kamu masukkan, semakin akurat hasil takhrij-nya. Kalau hanya ingat sebagian, tulis dengan [...]." },
      { n: 3, title: "Verifikasi sumber yang diberikan", desc: "Perplexity selalu kasih link — klik dan cek. Ini kebiasaan ilmiah penting. Jangan langsung percaya begitu saja." },
      { n: 4, title: "Analisis Musthalah pakai Claude", desc: "Setelah dapat info takhrij dari Perplexity, buka Claude untuk analisis konseptual: 'Aku dapat informasi bahwa hadith ini [status]. Bantu aku pahami implikasinya dalam Musthalah.'" },
      { n: 5, title: "Catat ke Kurasah", desc: "Catat hasil takhrij dengan tag 'Hadith'. Tulis: teks hadith — status — sumber — catatan penting." },
    ],
    prompts: [
      {
        label: "Takhrij Hadith",
        text: "Lakukan takhrij untuk hadith berikut:\n\n[TEKS HADITH]\n\nCari:\n1) Kitab-kitab hadith yang memuat hadith ini\n2) Jalur sanad utamanya\n3) Status hadith menurut ulama hadith terkemuka (Al-Albani, Ibnu Hajar, dll)\n4) Kalau ada ikhtilaf dalam penilaian, sebutkan\n\nSertakan sumber yang bisa diverifikasi.",
      },
      {
        label: "Analisis Rawi (Jarh wa Ta'dil)",
        text: "Cari informasi tentang rawi bernama [NAMA RAWI LENGKAP] dalam ilmu Jarh wa Ta'dil:\n\n1) Biografi singkat (generasi/thabaqah, wafat)\n2) Penilaian ulama: siapa yang memuji (ta'dil) dan mencela (jarh)\n3) Tingkatan penilaian menurut skala ulama hadith\n4) Implikasinya terhadap hadith yang dia riwayatkan\n\nSertakan sumber primer jika ada.",
      },
      {
        label: "Istilah Musthalah Hadith",
        text: "Jelaskan istilah Musthalah Hadith: [ISTILAH, contoh: hadith muallaq / mursal / mudallas / syadz / mu'allal]\n\n1) Definisi teknis ulama hadith\n2) Perbedaannya dengan istilah yang serupa\n3) Contoh konkret hadith yang masuk kategori ini\n4) Hukum pengamalan hadith berkategori ini menurut jumhur\n5) Referensi dari kitab Musthalah klasik",
      },
    ],
    tips: [
      "Perplexity untuk takhrij = pintu masuk, bukan kesimpulan. Verifikasi ke Maktabah Syamilah atau sumber primer.",
      "Untuk analisis sanad yang serius, Perplexity bantu cari informasi rawi, tapi keputusan akhir tetap di tangan kamu setelah baca kitab Rijal.",
      "Kalau butuh penjelasan mendalam tentang konsep Musthalah (bukan pencarian), Claude lebih baik.",
    ],
  },

  {
    id: "tafsir",
    subject: "Tafsir & Ulum Al-Quran",
    arabic: "التَّفْسِيرُ وَعُلُومُ القُرْآنِ",
    faculty: "ushuluddin",
    icon: "quote",
    aiId: "claude",
    aiName: "Claude",
    aiBy: "Anthropic",
    aiColor: "#D97757",
    aiLogo: "/assets/logo-claude.png",
    tagline: "Bandingkan mufassir, pahami ulum, analisis ayat",
    description: "Tafsir Al-Azhar mengharapkan kamu tidak hanya tahu tafsir satu mufassir — tapi bisa membandingkan pendekatan berbeda. Claude cocok untuk ini.",
    whyThisAI: "Claude sangat baik dalam membandingkan pendekatan tafsir dari berbagai mufassir — Thabari, Ibn Katsir, Zamakhsyari, Ibn Asyur — sambil menjelaskan metodologi masing-masing. Ini level analisis yang diharapkan di Ushuluddin Al-Azhar.",
    useCases: [
      "Bandingkan tafsir beberapa mufassir untuk ayat yang sama",
      "Analisis asbab nuzul dan pengaruhnya terhadap makna ayat",
      "Pahami konsep Ulum Al-Quran: nasikh-mansukh, muhkam-mutasyabih, dll",
      "Diskusi pendekatan tafsir bil-ma'tsur vs bil-ra'yi beserta contoh",
      "Analisis I'jaz Quran dari aspek balaghah atau tasyri'",
    ],
    steps: [
      { n: 1, title: "Buka claude.ai", desc: "Sebutkan ayat lengkap dan surahnya. Beri konteks: 'Aku mahasiswa Tafsir Ushuluddin Al-Azhar. Bantu aku mengkaji [QS X:Y] dari berbagai perspektif mufassir.'" },
      { n: 2, title: "Mulai dari asbab nuzul", desc: "Tanya asbab nuzul dulu jika ada — ini memberi konteks yang membantu memahami ragam tafsir." },
      { n: 3, title: "Minta perbandingan metodologi", desc: "Jangan hanya minta 'apa tafsirnya' — minta juga 'bagaimana pendekatan mufassir ini berbeda dari yang lain dan mengapa?'" },
      { n: 4, title: "Eksplorasi Ulum Al-Quran terkait", desc: "Setelah tafsir, tanya: 'Ulum Al-Quran apa yang relevan dengan ayat ini? Apakah masuk muhkam atau mutasyabih? Ada nasikh-mansukh?'" },
      { n: 5, title: "Hubungkan ke maqarrar", desc: "Paste paragraf dari maqarrar Tafsir yang susah dipahami dan minta Claude jelaskan dengan bahasa yang lebih mudah tanpa menghilangkan substansi." },
    ],
    prompts: [
      {
        label: "Perbandingan Mufassir",
        text: "Aku mahasiswa Tafsir Ushuluddin Al-Azhar. Bandingkan tafsir ayat ini:\n\n[QS SURAH:AYAT — tulis teks ayatnya]\n\nDari: 1) Al-Thabari (pendekatan riwayah), 2) Ibn Katsir (atsar + isnad), 3) Al-Zamakhsyari (balaghah), 4) Ibn Asyur (maqashid). Jelaskan perbedaan pendekatan dan apa yang membuat tiap tafsir unik.",
      },
      {
        label: "Ulum Al-Quran: Konsep & Contoh",
        text: "Jelaskan konsep [KONSEP ULUM QURAN: nasikh mansukh / muhkam mutasyabih / asbab nuzul / I'jaz / dll]:\n\n1) Definisi ulama klasik\n2) Contoh ayat konkret dari Al-Quran\n3) Implikasi konsep ini dalam penafsiran\n4) Perbedaan pendapat ulama (jika ada) tentang definisi atau contohnya\n5) Bagaimana konsep ini muncul di kurikulum Al-Azhar",
      },
      {
        label: "Bantu Baca Maqarrar Tafsir",
        text: "Aku punya paragraf dari maqarrar Tafsir Al-Azhar yang susah aku pahami:\n\n[PASTE TEKS ARAB ATAU TERJEMAHAN]\n\nBantu aku:\n1) Pahami inti yang sedang dibahas\n2) Siapa mufassir/ulama yang dikutip\n3) Apa argumen atau kesimpulan utamanya\n4) Istilah teknis apa yang harus aku hafalkan dari paragraf ini",
      },
    ],
    tips: [
      "Gunakan Claude untuk 'pre-baca' maqarrar — setelah paham konteks, teks Arab jadi lebih mudah masuk.",
      "Untuk asbab nuzul yang spesifik, verifikasi ke Perplexity yang bisa cari sumber terverifikasi.",
      "Kumpulkan perbandingan mufassir yang Claude berikan ke Kurasah — ini jadi bank materi untuk ujian.",
    ],
  },

  {
    id: "aqidah",
    subject: "Aqidah & Ilmu Kalam",
    arabic: "العَقِيدَةُ وَعِلْمُ الكَلَامِ",
    faculty: "ushuluddin",
    icon: "shield",
    aiId: "claude",
    aiName: "Claude",
    aiBy: "Anthropic",
    aiColor: "#D97757",
    aiLogo: "/assets/logo-claude.png",
    tagline: "Bedah argumen Kalam, klasifikasi aliran, dalil aqidah",
    description: "Ilmu Kalam = bedah argumen logis tentang aqidah. Claude sangat baik untuk analisis argumen dan perbandingan aliran.",
    whyThisAI: "Claude unggul dalam analisis argumen logis dan perbandingan aliran pemikiran — dua inti Ilmu Kalam. Claude bisa menjelaskan perbedaan Asy'ariyyah, Maturidiyyah, dan Mu'tazilah dengan nuansa dan konteks yang tepat untuk level Ushuluddin Al-Azhar.",
    useCases: [
      "Bandingkan argumen aliran Asy'ariyyah, Maturidiyyah, dan Mu'tazilah",
      "Analisis hujjah untuk sifat-sifat Allah (sifat khabariyyah, fi'liyyah, dll)",
      "Bedah argumen-argumen Kalam klasik (kosmologis, ontologis, dll)",
      "Pahami perbedaan Asy'ari-Maturidi yang sering disamakan orang",
      "Latihan menjawab syubhat tentang aqidah secara ilmiah",
    ],
    steps: [
      { n: 1, title: "Buka claude.ai", desc: "Beri konteks: 'Aku mahasiswa Aqidah/Kalam Ushuluddin Al-Azhar. Bantu aku memahami [topik] dengan pendekatan ilmu Kalam Sunni.'" },
      { n: 2, title: "Minta peta besar dulu", desc: "Sebelum detail, minta: 'Berikan peta besar topik [TOPIK KALAM]: aliran utama, isu yang diperdebatkan, dan tokoh kunci.' Ini orientasi yang membantu." },
      { n: 3, title: "Gali argumen per aliran", desc: "Setelah dapat peta, gali per aliran: 'Apa argumen utama Asy'ariyyah? Dalil aqli dan naqli apa yang digunakan?'" },
      { n: 4, title: "Tantang dengan counter-argumen", desc: "Untuk persiapan ujian: 'Apa keberatan terkuat terhadap argumen ini? Bagaimana Asy'ariyyah merespons?' — ini melatih kemampuan jawab syubhat." },
      { n: 5, title: "Sintesis akhir", desc: "Minta: 'Rangkum perbedaan posisi ini dalam 3 poin kunci yang mudah diingat.' Catat ke Kurasah." },
    ],
    prompts: [
      {
        label: "Perbandingan Aliran Kalam",
        text: "Aku mahasiswa Kalam Ushuluddin Al-Azhar. Bandingkan posisi aliran-aliran tentang:\n\n[MASALAH KALAM: sifat Allah / af'al al-ibad / ru'yatullah / dll]\n\nAliran: 1) Asy'ariyyah, 2) Maturidiyyah, 3) Mu'tazilah. Untuk tiap aliran: posisi, dalil aqli, dalil naqli, argumen utama. Khusus Asy'ari-Maturidi: jelaskan perbedaannya yang sering disamakan orang.",
      },
      {
        label: "Analisis Sifat Allah",
        text: "Jelaskan sifat [NAMA SIFAT ALLAH] menurut aqidah Asy'ariyyah:\n\n1) Klasifikasi sifat ini (dzatiyyah/ma'nawiyyah/fi'liyyah/khabariyyah)\n2) Dalil aqli untuk menetapkan sifat ini\n3) Dalil naqli (Quran/Sunnah)\n4) Bagaimana menghindari ta'thil dan tasybiih dalam memahami sifat ini\n5) Posisi Maturidiyyah jika ada perbedaan dengan Asy'ariyyah",
      },
      {
        label: "Jawab Syubhat secara Ilmiah",
        text: "Aku perlu belajar menjawab syubhat (keberatan) ini secara ilmiah:\n\n[SYUBHAT ATAU KEBERATAN TENTANG AQIDAH]\n\nBantu aku:\n1) Pahami asal-usul dan logika syubhat ini\n2) Cara ulama Asy'ariyyah meresponsnya\n3) Argumen-argumen yang bisa digunakan\n4) Dalil dari Quran, Sunnah, atau Kalam yang relevan\n\nFokus pada pendekatan ilmiah, bukan emosional.",
      },
    ],
    tips: [
      "Gunakan Claude untuk membangun 'peta argumen' sebelum baca matan Aqidah — ini buat orientasi yang membantu.",
      "Selalu tanya juga kelemahan pandangan yang Claude jelaskan — ini melatih pemikiran kritis yang diharapkan di Ushuluddin.",
      "Perbedaan Asy'ari-Maturidi itu halus tapi penting di Al-Azhar — minta Claude fokuskan pada perbedaan ini.",
    ],
  },

  {
    id: "sirah",
    subject: "Sirah Nabawiyyah",
    arabic: "السِّيرَةُ النَّبَوِيَّةُ",
    faculty: "ushuluddin",
    icon: "star",
    aiId: "chatgpt",
    aiName: "ChatGPT",
    aiBy: "OpenAI",
    aiColor: "#10A37F",
    aiLogo: "/assets/logo-chatgpt.png",
    tagline: "Hafal urutan peristiwa, analisis hikmah, persiapan ujian",
    description: "Sirah Nabawiyyah butuh hafalan kronologi yang kuat dan kemampuan menganalisis hikmah dari setiap peristiwa. ChatGPT baik untuk keduanya.",
    whyThisAI: "ChatGPT sangat baik untuk menyajikan Sirah secara kronologis yang mudah dihafal, sekaligus membantu analisis hikmah dari setiap peristiwa. Gaya dialog ChatGPT juga efektif untuk drill ujian Sirah.",
    useCases: [
      "Buat timeline peristiwa Sirah yang mudah dihafal",
      "Analisis hikmah (pelajaran) dari peristiwa-peristiwa penting",
      "Hafal detail ghazawat (peperangan) beserta konteks dan hasilnya",
      "Drill soal Sirah seperti format ujian Al-Azhar",
      "Pahami konteks sosial-politik Arab pra-Islam untuk memahami Sirah lebih dalam",
    ],
    steps: [
      { n: 1, title: "Buka ChatGPT", desc: "Beri konteks: 'Aku mahasiswa Ushuluddin Al-Azhar, belajar Sirah Nabawiyyah. Bantu aku [tujuan belajar hari ini].'" },
      { n: 2, title: "Pilih fokus yang spesifik", desc: "Sirah sangat luas — jangan minta semua sekaligus. Pilih satu periode atau peristiwa per sesi: masa Makkah, fase Hijrah, ghazawat Badar, Uhud, dst." },
      { n: 3, title: "Buat timeline periode", desc: "Minta format tabel: Tahun Hijriyah | Peristiwa | Tokoh Terlibat | Hasil/Dampak. Ini alat belajar yang efektif." },
      { n: 4, title: "Gali hikmah", desc: "Setelah hafal fakta: 'Apa hikmah yang bisa diambil dari peristiwa ini, terutama untuk konteks dakwah dan kepemimpinan?' — ini yang sering keluar di soal analisis ujian Azhari." },
      { n: 5, title: "Drill soal", desc: "Minta 5-7 soal Sirah tentang periode ini, jawab, minta koreksi. Ini mempersiapkan untuk ujian tahriri maupun syafahi." },
    ],
    prompts: [
      {
        label: "Timeline Sirah",
        text: "Aku belajar Sirah Nabawiyyah Al-Azhar. Buat timeline peristiwa penting dalam periode [PERIODE: Makkah / Persiapan Hijrah / Madinah Awal / dst].\n\nFormat tabel: Tahun (pra-Hijriyyah atau Hijriyyah) | Peristiwa | Tokoh Utama | Dampak/Hikmah. Urutkan kronologis dan fokus pada peristiwa yang paling penting untuk ujian.",
      },
      {
        label: "Analisis Ghazwah",
        text: "Jelaskan ghazwah [NAMA PERANG: Badar / Uhud / Khandaq / Fath Makkah / dll] secara komprehensif:\n\n1) Latar belakang dan sebab\n2) Kekuatan dua belah pihak\n3) Kronologi peristiwa penting dalam pertempuran\n4) Hasil dan dampaknya\n5) Hikmah yang bisa diambil (minimal 3 hikmah)\n6) Pelajaran dakwah/qiyadah dari ghazwah ini",
      },
      {
        label: "Drill Soal Sirah",
        text: "Aku mau persiapan ujian Sirah tentang [PERIODE/TOPIK]. Buat 8 soal: 3 soal hafalan kronologi, 3 soal identifikasi tokoh/tempat, 2 soal analisis hikmah. Berikan soal dulu tanpa jawaban. Aku jawab satu per satu, kamu koreksi.",
      },
    ],
    tips: [
      "Hubungkan peristiwa Sirah dengan konteks geografis Jazirah Arab — ChatGPT bisa bantu jelaskan lokasinya.",
      "Untuk soal analisis ujian Azhari, kuncinya bukan hafalan fakta tapi bisa menjelaskan 'mengapa' dan 'apa hikmahnya'.",
      "Buat kartu hafalan peristiwa kunci (nama, tahun, tokoh, hasil) dan simpan ke Kurasah sebagai cheat sheet murajaah.",
    ],
  },

  {
    id: "mantiq",
    subject: "Mantiq & Falsafah Islamiyyah",
    arabic: "المَنْطِقُ وَالفَلْسَفَةُ الإِسْلَامِيَّةُ",
    faculty: "ushuluddin",
    icon: "spark",
    aiId: "claude",
    aiName: "Claude",
    aiBy: "Anthropic",
    aiColor: "#D97757",
    aiLogo: "/assets/logo-claude.png",
    tagline: "Logika formal, drill qiyas mantiq, bedah argumen filosofis",
    description: "Mantiq = logika formal Islam. Claude sangat baik untuk menjelaskan struktur argumen dan menguji penalaran logis.",
    whyThisAI: "Claude sangat kuat dalam analisis logis dan struktural — persis yang dibutuhkan di Mantiq. Claude bisa menjelaskan struktur qiyas mantiq (silogisme), mengidentifikasi fallacy dalam argumen, dan menjelaskan konsep Falsafah Islamiyyah dengan cara yang terstruktur.",
    useCases: [
      "Pahami konsep Mantiq: hadd, taqsim, qiyas, istiqra'",
      "Latihan membuat qiyas mantiq (silogisme) yang valid",
      "Identifikasi fallacy (mughalathah) dalam argumen",
      "Pahami pemikiran filsuf Muslim: Al-Farabi, Ibn Sina, Al-Ghazali",
      "Analisis argumen filosofis tentang keberadaan Tuhan",
    ],
    steps: [
      { n: 1, title: "Buka claude.ai", desc: "Beri konteks: 'Aku belajar Mantiq/Falsafah Islamiyyah di Al-Azhar. Bantu aku memahami [konsep/topik] dengan cara yang sistematis.'" },
      { n: 2, title: "Pahami konsep dasar dulu", desc: "Pastikan paham definisi dasar: tasawwur vs tashdiq, hadd vs rasm, qadiyyah, qiyas, dll. Tanpa ini, Mantiq akan terasa sangat abstrak." },
      { n: 3, title: "Latihan qiyas mantiq", desc: "Minta Claude berikan contoh qiyas iqtirani dan istitsna'i, lalu minta kamu membuat sendiri. Claude koreksi validitasnya." },
      { n: 4, title: "Aplikasi ke argumen Kalam", desc: "Hubungkan Mantiq ke Kalam: 'Bagaimana ulama Kalam menggunakan qiyas mantiq untuk membuktikan eksistensi Allah?'" },
      { n: 5, title: "Eksplorasi Falsafah Islamiyyah", desc: "Untuk tokoh-tokoh falsafah: 'Jelaskan posisi Ibn Sina tentang [topik] dan bagaimana Al-Ghazali mengkritiknya dalam Tahafut al-Falasifah.'" },
    ],
    prompts: [
      {
        label: "Konsep Mantiq Dasar",
        text: "Aku belajar Mantiq di Al-Azhar Ushuluddin. Jelaskan [KONSEP MANTIQ: tasawwur/tashdiq / hadd/rasm / qadiyyah / qiyas iqtirani / dll]:\n\n1) Definisi teknis dalam Mantiq Islam\n2) Unsur-unsur yang membentuknya\n3) Contoh yang konkret dan mudah dipahami\n4) Perbedaan dengan konsep yang mirip\n5) Bagaimana konsep ini digunakan dalam argumen Kalam",
      },
      {
        label: "Latihan Qiyas Mantiq",
        text: "Aku mau latihan membuat qiyas mantiq (silogisme) yang valid. Berikan:\n1) Contoh 3 qiyas iqtirani yang valid beserta penjelasan strukturnya\n2) Contoh 2 qiyas yang tidak valid (fasid) dan identifikasi kesalahannya\n3) Setelah itu, beri aku 5 tema untuk aku buat qiyas sendiri. Koreksi satu per satu.",
      },
      {
        label: "Perdebatan Falsafah: Ibn Sina vs Al-Ghazali",
        text: "Jelaskan perdebatan antara Ibn Sina dan Al-Ghazali tentang [TOPIK: qidam al-'alam / 'ilm Allah / ma'ad jismani / dll]:\n\n1) Posisi Ibn Sina dan argumennya\n2) Kritik Al-Ghazali dalam Tahafut al-Falasifah\n3) Apakah Ibn Rushd merespons kritik ini dalam Tahafut al-Tahafut?\n4) Apa implikasi perdebatan ini untuk Aqidah Islamiyyah?",
      },
    ],
    tips: [
      "Mantiq itu seperti matematika — butuh banyak latihan soal, bukan sekadar baca definisi.",
      "Hubungkan terus ke Kalam: Mantiq bukan tujuan, tapi alat untuk membela aqidah secara ilmiah.",
      "Untuk hafalan istilah Mantiq, buat glossary kamu sendiri di Kurasah: Istilah | Definisi | Contoh.",
    ],
  },

  /* ══════════════════════════════════════════════
     BAHASA ARAB
  ══════════════════════════════════════════════ */

  {
    id: "nahwu",
    subject: "Nahwu & Sharaf",
    arabic: "النَّحْوُ وَالصَّرْفُ",
    faculty: "bahasa",
    icon: "pen",
    aiId: "chatgpt",
    aiName: "ChatGPT",
    aiBy: "OpenAI",
    aiColor: "#10A37F",
    aiLogo: "/assets/logo-chatgpt.png",
    tagline: "Drill i'rab, tashrif, koreksi kalimat Arab",
    description: "Nahwu dan Sharaf butuh ribuan latihan. ChatGPT bisa jadi partner drill yang tak pernah lelah — tersedia jam 3 pagi sebelum ujian.",
    whyThisAI: "ChatGPT sangat responsif untuk drill latihan — generate soal i'rab, koreksi jawaban, jelaskan kaidah yang dilanggar. Gaya dialognya cocok untuk sesi latihan berulang yang butuh feedback cepat.",
    useCases: [
      "Drill latihan i'rab kalimat dari teks maqarrar atau Quran",
      "Latihan tashrif fi'il (shahih, mu'tall, mudha'af) sampai lancar",
      "Koreksi tulisan atau kalimat Arab yang kamu buat sendiri",
      "Tanya kaidah yang membingungkan dengan contoh konkret",
      "Bedah kalimat Arab panjang dari maqarrar kata per kata",
    ],
    steps: [
      { n: 1, title: "Buka ChatGPT", desc: "Beri konteks: 'Aku mahasiswa Bahasa Arab Al-Azhar. Bantu aku latihan i'rab. Kita drill: kamu kasih kalimat, aku i'rab, kamu koreksi.'" },
      { n: 2, title: "Satu kalimat per giliran", desc: "Jangan minta 10 kalimat sekaligus. Satu kalimat, i'rab lengkap (tiap kata: posisi, tanda, kaidah), baru minta koreksi." },
      { n: 3, title: "Jawab lengkap", desc: "Untuk tiap kata: sebutkan (1) posisi i'rab, (2) tanda i'rab, (3) mengapa — sebutkan kaidah. Ini yang melatih pemahaman, bukan hafalan." },
      { n: 4, title: "Naik level ke teks nyata", desc: "Setelah drill kalimat buatan, paste 1-2 ayat Quran atau kalimat dari maqarrar dan minta i'rab lengkap. Ini lebih real dari kalimat buatan." },
      { n: 5, title: "Catat kaidah yang sering salah", desc: "Di akhir sesi: 'Kaidah apa yang paling sering aku salah hari ini?' Minta rangkuman. Catat ke Kurasah." },
    ],
    prompts: [
      {
        label: "Drill I'rab Interaktif",
        text: "Aku mahasiswa Bahasa Arab Al-Azhar, latihan i'rab. Berikan satu kalimat Arab tingkat menengah. Aku akan i'rab tiap kata dengan format: [Kata] — [Posisi i'rab] — [Tanda i'rab] — [Kaidah yang berlaku]. Koreksi setelah aku jawab, jelaskan yang salah, beri kalimat berikutnya. Mulai sekarang.",
      },
      {
        label: "Latihan Tashrif Lengkap",
        text: "Bantu aku latihan tashrif fi'il: [FI'IL MUJARRAD, contoh: كَتَبَ / ذَهَبَ / قَالَ]. Minta aku tashrif untuk:\n1) Fi'il Madhi (mukadzdzar)\n2) Fi'il Mudhari' (marfu', mansub, majzum)\n3) Fi'il Amr\n4) Isim Fa'il dan Maf'ul\n\nKoreksi per bagian dan jelaskan pola yang berlaku.",
      },
      {
        label: "I'rab Teks dari Maqarrar",
        text: "Bantu aku i'rab kalimat-kalimat dari maqarrar ini:\n\n[PASTE KALIMAT ARAB DARI MAQARRAR]\n\nBerikan i'rab kata per kata dengan format: Kata | Posisi I'rab | Tanda I'rab | Kaidah. Untuk kata yang memiliki beberapa kemungkinan i'rab, sebutkan semua dan jelaskan mana yang lebih tepat dalam konteks.",
      },
    ],
    tips: [
      "Jangan hanya minta penjelasan — minta soal dulu, jawab, baru koreksi. Ini 10x lebih efektif.",
      "Untuk teks Quran atau hadith, paste langsung ke ChatGPT dan minta i'rab — ini melatih untuk teks nyata.",
      "Catat kaidah yang sering kamu salah — ini jadi prioritas murajaah malam sebelum ujian.",
    ],
  },

  {
    id: "balaghah",
    subject: "Balaghah",
    arabic: "البَلَاغَةُ",
    faculty: "bahasa",
    icon: "sparkles",
    aiId: "claude",
    aiName: "Claude",
    aiBy: "Anthropic",
    aiColor: "#D97757",
    aiLogo: "/assets/logo-claude.png",
    tagline: "Analisis uslub, identifikasi majas, kembangkan dhauq",
    description: "Balaghah = rasa + analisis teknis. Claude sangat baik untuk membantu kamu mengembangkan keduanya sekaligus.",
    whyThisAI: "Claude unggul dalam analisis sastra dan linguistik — bisa mengidentifikasi majas, menjelaskan efek retoris, dan membantu kamu memahami mengapa suatu uslub lebih efektif dari yang lain. Ini yang membuat Claude tepat untuk Balaghah.",
    useCases: [
      "Analisis aspek Balaghah dari ayat Quran atau bait syi'r Arab",
      "Identifikasi macam tasybiih, isti'arah, majaz mursal, kinayah",
      "Pahami konsep Balaghah yang abstrak dengan contoh konkret",
      "Latihan menulis kalimat Arab dengan unsur Balaghah",
      "Analisis I'jaz Quran dari sudut Balaghah",
    ],
    steps: [
      { n: 1, title: "Buka claude.ai", desc: "Claude adalah pilihan terbaik untuk Balaghah. Paste teks Arab yang akan dianalisis dan beri konteks: 'Aku mahasiswa Balaghah Al-Azhar, bantu aku menganalisis teks ini.'" },
      { n: 2, title: "Identifikasi dulu, analisis kemudian", desc: "Minta Claude untuk pertama-tama mengidentifikasi semua majas yang ada, baru kemudian analisis efek balaghiy masing-masing." },
      { n: 3, title: "Tanya 'mengapa' bukan hanya 'apa'", desc: "Setelah identifikasi: 'Mengapa penulis/Allah memilih uslub ini? Apa yang hilang jika diganti dengan ungkapan langsung?' — ini yang melatih dhauq (rasa sastra)." },
      { n: 4, title: "Latihan sendiri", desc: "Minta Claude berikan kalimat Arab sederhana, lalu kamu sendiri yang identifikasi unsur Balaghah-nya. Ini lebih efektif dari sekadar membaca analisis Claude." },
      { n: 5, title: "Hubungkan ke maqarrar", desc: "Paste contoh-contoh dari maqarrar Balaghah dan minta Claude analisis lebih dalam. Ini memperdalam apa yang sudah diajarkan dosen." },
    ],
    prompts: [
      {
        label: "Analisis Balaghah Teks",
        text: "Analisis aspek Balaghah dari teks Arab berikut:\n\n[TEKS ARAB]\n\nIdentifikasi:\n1) Uslub khabar/insya' dan tujuannya\n2) Semua majas: tasybiih, isti'arah, majaz mursal, kinayah — sebutkan jenis, unsur-unsur, dan efeknya\n3) Aspek fashaahah al-kalimat dan al-uslub\n4) Secara keseluruhan: efek balaghiy apa yang ingin dicapai teks ini?",
      },
      {
        label: "Penjelasan Konsep Balaghah",
        text: "Jelaskan konsep Balaghah: [KONSEP: tasybiih baligh / isti'arah makniyyah / majaz mursal / asaaliib al-qasr / dll]\n\n1) Definisi teknis\n2) Unsur-unsur (arkaan/syuruth)\n3) Contoh dari Al-Quran\n4) Contoh dari syi'r Arab klasik\n5) Perbedaannya dengan konsep yang mirip",
      },
      {
        label: "I'jaz Balaghiy Al-Quran",
        text: "Jelaskan aspek I'jaz Balaghiy dalam ayat:\n\n[AYAT QURAN]\n\nAnalisis:\n1) Keistimewaan pemilihan mufradat (kosakata)\n2) Struktur kalimat dan efeknya\n3) Majas yang digunakan dan mengapa lebih kuat dari ungkapan biasa\n4) Bagaimana ulama Balaghah (Al-Jurjani, Zamakhsyari) menganalisis ini",
      },
    ],
    tips: [
      "Dhauq (rasa sastra) dibangun dengan banyak membaca dan menganalisis — bukan hanya hafal definisi majas.",
      "Setelah Claude analisis, coba tulis ulang teks tanpa majas — ini memperlihatkan betapa majas mengubah makna dan efek.",
      "Buat bank contoh Balaghah di Kurasah: tiap majas ada 3-5 contoh dari Quran/syi'r yang sudah dianalisis.",
    ],
  },

  {
    id: "adab",
    subject: "Adab & Nusus",
    arabic: "الأَدَبُ وَالنُّصُوصُ",
    faculty: "bahasa",
    icon: "book",
    aiId: "claude",
    aiName: "Claude",
    aiBy: "Anthropic",
    aiColor: "#D97757",
    aiLogo: "/assets/logo-claude.png",
    tagline: "Analisis sastra Arab klasik, pahami konteks, baca nushus",
    description: "Sastra Arab klasik punya keindahan yang dalam — tapi juga konteks sejarah yang harus dipahami untuk bisa mengapresiasinya. Claude bantu kamu masuk ke dua sisi ini.",
    whyThisAI: "Claude sangat baik dalam analisis sastra — bisa menjelaskan makna tersembunyi dalam syi'r Arab, memberikan konteks sejarah penulis, dan menganalisis gaya bahasa. Ini yang dibutuhkan untuk Adab dan Nusus di Al-Azhar.",
    useCases: [
      "Pahami dan terjemahkan syi'r Arab klasik dengan konteksnya",
      "Analisis gaya sastra seorang syair atau penulis Arab",
      "Identifikasi periode sastra Arab dan ciri-cirinya",
      "Analisis nushus (teks) dari maqarrar Adab",
      "Persiapan untuk syarh (komentar) teks dalam ujian",
    ],
    steps: [
      { n: 1, title: "Buka claude.ai", desc: "Paste bait syi'r atau prosa Arab dan beri konteks: 'Aku belajar Adab Arab Al-Azhar. Bantu aku memahami dan menganalisis teks ini.'" },
      { n: 2, title: "Pahami makna literal dulu", desc: "Minta terjemahan literal dulu — pastikan kamu paham setiap kata sebelum masuk ke analisis sastra." },
      { n: 3, title: "Konteks penulis dan zaman", desc: "Tanya: 'Siapa penulis ini? Apa konteks sejarah dan kehidupannya? Bagaimana latar belakangnya mempengaruhi karya ini?'" },
      { n: 4, title: "Analisis sastra", desc: "Baru setelah paham konteks, minta analisis sastra: gaya, tema, simbolisme, unsur Balaghah yang digunakan." },
      { n: 5, title: "Syarh untuk ujian", desc: "Latihan syarh (komentar/penjelasan) teks: 'Bagaimana aku harus men-syarh bait ini jika keluar di ujian Azhari?'" },
    ],
    prompts: [
      {
        label: "Analisis Syi'r Arab",
        text: "Aku belajar Adab Arab Al-Azhar. Bantu aku menganalisis bait/qasidah berikut:\n\n[BAIT/TEKS SYIR]\n\n1) Terjemahan literal kata per kata\n2) Makna keseluruhan dalam bahasa yang mudah\n3) Konteks: siapa penulisnya, kapan, situasi apa\n4) Analisis sastra: tema, gaya, unsur Balaghah\n5) Apa yang membuat teks ini dianggap penting dalam khazanah sastra Arab",
      },
      {
        label: "Periode Sastra Arab",
        text: "Jelaskan ciri-ciri sastra Arab pada periode [PERIODE: Jahiliyyah / Shadr Islam / Umawi / Abbasi / Andalusi / Mamluki / dll]:\n\n1) Rentang waktu dan konteks sejarah\n2) Tema-tema dominan dalam syi'r dan prosa\n3) Tokoh-tokoh sastrawan utama\n4) Ciri khas gaya bahasa\n5) Karya-karya penting yang wajib diketahui",
      },
      {
        label: "Syarh Nushus untuk Ujian",
        text: "Aku akan ujian Adab tentang nushus berikut:\n\n[TEKS ARAB]\n\nBantu aku buat syarh (komentar) yang lengkap:\n1) Penjelasan makna setiap bagian\n2) Konteks dan latar belakang\n3) Analisis gaya bahasa\n4) Nilai sastra dan historikal teks ini\n\nGunakan gaya penulisan yang sesuai standar ujian Al-Azhar.",
      },
    ],
    tips: [
      "Untuk syi'r Arab, pahami makna literal dulu sebelum analisis sastra — jangan lompat ke analisis tanpa paham kata-katanya.",
      "Hubungkan Adab dengan Balaghah yang kamu pelajari — analisis sastra dan Balaghah saling memperkuat.",
      "Minta Claude rekomendasikan syi'r atau prosa sejenis yang bisa kamu baca untuk memperluas pemahaman periode.",
    ],
  },

  {
    id: "insya",
    subject: "Ta'bir & Insya' Arab",
    arabic: "التَّعْبِيرُ وَالإِنْشَاءُ",
    faculty: "bahasa",
    icon: "pen",
    aiId: "chatgpt",
    aiName: "ChatGPT",
    aiBy: "OpenAI",
    aiColor: "#10A37F",
    aiLogo: "/assets/logo-chatgpt.png",
    tagline: "Tulis Arab dengan benar, perbaiki gaya, latihan ta'bir",
    description: "Kemampuan menulis Arab (insya') dan berbicara Arab (ta'bir syafahi) adalah dua skill paling praktis di Al-Azhar. ChatGPT bisa melatih keduanya.",
    whyThisAI: "ChatGPT sangat baik untuk writing practice — bisa mengoreksi tulisan Arab, memberikan feedback gaya bahasa, dan membantu kamu meningkatkan kosakata dan struktur kalimat secara bertahap.",
    useCases: [
      "Koreksi insya' (tulisan) Arab yang kamu buat",
      "Latihan menulis paragraf Arab tentang topik tertentu",
      "Perbesar kosakata dengan mempelajari sinonim dan idiom",
      "Persiapan ta'bir syafahi (presentasi lisan dalam bahasa Arab)",
      "Perbaiki kesalahan Nahwu dan Sharaf dalam tulisan",
    ],
    steps: [
      { n: 1, title: "Buka ChatGPT", desc: "Beri konteks: 'Aku mahasiswa Bahasa Arab Al-Azhar. Aku mau meningkatkan kemampuan insya' dan ta'bir. Bantu aku dengan [tugas spesifik].'" },
      { n: 2, title: "Tulis dulu, koreksi kemudian", desc: "Jangan minta ChatGPT menulis untuk kamu — tulis sendiri dulu, baru minta koreksi. Ini cara yang benar untuk belajar." },
      { n: 3, title: "Minta feedback bertingkat", desc: "Minta feedback dalam urutan: (1) Nahwu & Sharaf, (2) pilihan kosakata, (3) gaya dan uslub, (4) struktur paragraf. Ini lebih mudah dicerna dari feedback campuran." },
      { n: 4, title: "Perbaiki dan tulis ulang", desc: "Setelah dapat koreksi, tulis ulang paragraf tersebut dengan perbaikan. Kirim lagi ke ChatGPT untuk feedback lanjutan." },
      { n: 5, title: "Persiapan ta'bir syafahi", desc: "Untuk ta'bir: 'Bantu aku membuat outline dan poin-poin penting untuk ta'bir syafahi tentang [topik]. Aku akan latihan bicara dari outline ini.'" },
    ],
    prompts: [
      {
        label: "Koreksi Insya' Arab",
        text: "Koreksi insya' Arab berikut yang aku tulis:\n\n[TULISAN ARABMU]\n\nBerikan feedback dalam urutan:\n1) Kesalahan Nahwu & Sharaf (format: [Salah] → [Benar] + alasan kaidah)\n2) Pilihan kosakata yang bisa diperbaiki (alternatif yang lebih tepat/lebih fasih)\n3) Gaya uslub (apakah terdengar natural? apa yang perlu diperbaiki?)\n4) Struktur dan alur paragraf\n\nAkhiri dengan versi yang sudah diperbaiki secara keseluruhan.",
      },
      {
        label: "Latihan Insya' Bertopik",
        text: "Aku mau latihan insya' tentang topik: [TOPIK, contoh: kehidupan mahasiswa di Kairo / teknologi dan generasi muda / pentingnya membaca]\n\nBerikan:\n1) Kosakata penting yang sebaiknya aku gunakan dalam topik ini (10-15 kata)\n2) Struktur paragraf yang disarankan\n3) Kalimat pembuka yang bisa aku adaptasi\n\nSetelah itu aku akan tulis sendiri, lalu kamu koreksi.",
      },
      {
        label: "Persiapan Ta'bir Syafahi",
        text: "Bantu aku persiapan ta'bir syafahi tentang [TOPIK] dalam bahasa Arab.\n\nBuat:\n1) Outline poin-poin utama yang harus dibahas (3-5 poin)\n2) Kosakata dan ungkapan Arab yang berguna untuk topik ini\n3) Kalimat transisi (روابط) untuk menghubungkan antar poin\n4) Kalimat penutup yang kuat\n\nAku akan latihan bicara dari outline ini.",
      },
    ],
    tips: [
      "Aturan emas: tulis sendiri dulu, koreksi kemudian. Bukan minta ChatGPT tulis untuk kamu.",
      "Buat 'jurnal insya' di Kurasah — tulis satu paragraf Arab per hari tentang apapun. Minta koreksi ChatGPT.",
      "Untuk kosakata, minta ChatGPT berikan 10 kata baru per hari dengan contoh kalimatnya — ini cara terbaik perbesar vocab.",
    ],
  },

  /* ══════════════════════════════════════════════
     UMUM (lintas fakultas)
  ══════════════════════════════════════════════ */

  {
    id: "makalah",
    subject: "Makalah Azhari",
    arabic: "البَحْثُ العِلْمِيُّ الأَزْهَرِيُّ",
    faculty: "umum",
    icon: "clipboard",
    aiId: "chatgpt",
    aiName: "ChatGPT",
    aiBy: "OpenAI",
    aiColor: "#10A37F",
    aiLogo: "/assets/logo-chatgpt.png",
    tagline: "Outline, drafting, editing gaya akademis Azhari",
    description: "Makalah Al-Azhar punya standar tersendiri — dari format muqaddimah sampai cara sitasi. ChatGPT bantu kamu mulai dari outline sampai draft akhir.",
    whyThisAI: "ChatGPT sangat baik untuk writing assistance — membantu susun outline yang logis, draft paragraf awal, dan perbaiki gaya tulisan. Untuk makalah Arab dengan gaya Azhari, ChatGPT bisa diarahkan ke tone dan format yang sesuai.",
    useCases: [
      "Susun outline dari topik yang diberikan dosen",
      "Draft muqaddimah dengan gaya ilmiah Arab Azhari",
      "Perbaiki gaya bahasa Arab makalah yang sudah kamu tulis",
      "Buat abstrak (mulakhkhas) dari makalah yang selesai",
      "Cek konsistensi argumen dan alur tulisan",
    ],
    steps: [
      { n: 1, title: "Buka ChatGPT", desc: "Jelaskan dulu: topik, mata kuliah, panjang yang diminta, bahasa (Arab/Indonesia), dan deadline. Semakin jelas konteksnya, semakin relevan bantuannya." },
      { n: 2, title: "Outline dulu, draft kemudian", desc: "Minta outline dulu. Review dan diskusikan — jangan setuju begitu saja. Pastikan outline sudah logis sebelum mulai draft." },
      { n: 3, title: "Draft satu bab per sesi", desc: "Minta satu bagian/bab sekaligus, bukan seluruh makalah. Ini memberi kamu kontrol atas arah tulisan." },
      { n: 4, title: "Edit, jangan pakai mentah-mentah", desc: "Selalu edit output ChatGPT dengan tangan sendiri — tambahkan perspektifmu, verifikasi fakta, sesuaikan gaya." },
      { n: 5, title: "Cari referensi sendiri", desc: "Untuk sitasi dan referensi, gunakan Perplexity atau buka langsung Maktabah Syamilah. Jangan andalkan ChatGPT untuk referensi." },
    ],
    prompts: [
      {
        label: "Outline Makalah",
        text: "Bantu aku susun outline makalah ilmiah tentang [TOPIK].\n\nKonteks: untuk mata kuliah [MAPEL] di Al-Azhar, panjang [X] halaman, bahasa [Arab/Indonesia].\n\nOutline harus:\n1) Muqaddimah: urgensi, tujuan, manhaj, haikal al-buhuts\n2) Minimal 3 bab/fashl utama dengan sub-bab yang logis\n3) Khatimah dengan kesimpulan dan rekomendasi\n\nSertakan poin-poin yang akan dibahas di tiap bagian.",
      },
      {
        label: "Draft Muqaddimah Arab",
        text: "Tulis draft muqaddimah makalah tentang [TOPIK] dalam bahasa Arab ilmiah Azhari.\n\nMuqaddimah harus mencakup:\n1) Pembuka yang menarik (baik ayat/hadith/quote relevan)\n2) Ahamiyyah al-mawdhu' (urgensi topik)\n3) Ahdaaf al-buhuts (tujuan penelitian)\n4) Manhaj al-buhuts (metode: istiqra'i/tathbiqi/muqaran)\n5) Haikal al-buhuts (struktur makalah)\n\nGaya: akademis Azhari, hindari kosakata amiyah.",
      },
      {
        label: "Perbaiki Tulisan Arab",
        text: "Perbaiki tulisan Arab berikut untuk makalah ilmiah:\n\n[TEKS ARABMU]\n\nPerbaiki:\n1) Kesalahan Nahwu & Sharaf\n2) Gaya bahasa (dari sehari-hari → akademis/ilmiah)\n3) Pilihan kosakata yang lebih tepat\n4) Struktur kalimat yang kurang jelas\n\nTampilkan: perubahan utama + versi final yang sudah diperbaiki.",
      },
    ],
    tips: [
      "ChatGPT = asisten penulis, bukan ghostwriter. Argumen dan perspektif harus dari kamu, ChatGPT hanya bantu ekspresinya.",
      "Untuk referensi dan sitasi: gunakan Perplexity atau Maktabah Syamilah. ChatGPT sering salah dalam detail bibliografi.",
      "Proofread akhir secara manual — ChatGPT kadang hasilkan kalimat Arab yang secara Nahwu benar tapi terdengar aneh.",
    ],
  },

  {
    id: "riset",
    subject: "Riset & Referensi",
    arabic: "البَحْثُ وَالمَصَادِرُ",
    faculty: "umum",
    icon: "compass",
    aiId: "perplexity",
    aiName: "Perplexity",
    aiBy: "Perplexity AI",
    aiColor: "#1FB6B6",
    aiLogo: "/assets/logo-perplexity.png",
    tagline: "Cari sumber tertelusur, buku, artikel akademik",
    description: "Riset akademis butuh sumber yang bisa diverifikasi. Perplexity satu-satunya AI yang selalu sertakan sumber nyata yang bisa diklik.",
    whyThisAI: "Perplexity adalah AI berbasis pencarian real-time yang selalu memberikan link sumber. Untuk riset, ini yang paling krusial — kamu tidak perlu tebak-tebak apakah sumber itu ada.",
    useCases: [
      "Temukan kitab klasik yang relevan dengan topik penelitian",
      "Cari artikel akademik tentang isu keislaman kontemporer",
      "Susun 'Dirasat Sabiqah' (kajian penelitian terdahulu)",
      "Verifikasi fakta sebelum dimasukkan ke makalah",
      "Cari posisi ulama kontemporer tentang masalah tertentu",
    ],
    steps: [
      { n: 1, title: "Buka perplexity.ai", desc: "Aktifkan filter 'Academic' untuk pencarian akademis, 'All' untuk pencarian umum sumber Islam." },
      { n: 2, title: "Pertanyaan spesifik = hasil lebih relevan", desc: "Bukan: 'buku Fiqh' — tapi: 'kitab Fiqh Muqaran tentang zakat kontemporer karya ulama abad 20'. Spesifisitas menentukan kualitas hasil." },
      { n: 3, title: "Verifikasi semua sumber", desc: "Klik link yang diberikan Perplexity dan cek kontennya. Ini kewajiban akademis, bukan opsional." },
      { n: 4, title: "Gunakan untuk Dirasat Sabiqah", desc: "Minta: 'Siapa saja yang sudah menulis penelitian tentang [TOPIK]? Sebutkan judul, penulis, tahun, dan fokusnya.' Ini fondasi bab dirasat sabiqah." },
      { n: 5, title: "Kombinasikan dengan NotebookLM", desc: "Setelah dapat sumber dari Perplexity, upload PDF ke NotebookLM untuk tanya-jawab mendalam dari isi dokumen spesifik itu." },
    ],
    prompts: [
      {
        label: "Cari Sumber Akademik",
        text: "Cari sumber akademik untuk penelitian tentang [TOPIK]. Prioritas:\n1) Kitab/buku karya ulama Al-Azhar atau ulama Muslim terkemuka\n2) Jurnal akademik yang bereputasi\n3) Sumber dalam bahasa Arab diutamakan, Indonesia juga diterima\n\nUntuk tiap sumber: judul, penulis, penerbit, tahun, dan mengapa relevan. Sertakan link jika ada.",
      },
      {
        label: "Susun Dirasat Sabiqah",
        text: "Bantu aku susun 'Dirasat Sabiqah' untuk penelitian tentang [TOPIK MAKALAHKU].\n\nCari:\n1) Minimal 4-5 penelitian terdahulu yang relevan\n2) Untuk tiap penelitian: judul, penulis, tahun, fokus, dan metode\n3) Apa yang membedakan penelitianku dari yang sudah ada?\n\nSertakan sumber yang bisa diverifikasi.",
      },
      {
        label: "Verifikasi Fakta/Kutipan",
        text: "Verifikasi informasi berikut yang akan aku masukkan ke makalah:\n\n[FAKTA ATAU KUTIPAN]\n\nKonfirmasi:\n1) Apakah informasi ini akurat?\n2) Dari sumber mana asalnya?\n3) Apakah ada data/informasi terbaru yang lebih tepat?\n\nSertakan sumber yang bisa diklik.",
      },
    ],
    tips: [
      "Perplexity = titik awal riset, bukan kesimpulan. Temukan sumber → baca sumbernya langsung.",
      "Untuk kitab klasik Islam, Perplexity sering kasih link ke archive.org atau al-maktaba.org — ini akses teks aslinya.",
      "Kombinasikan: Perplexity untuk temukan sumber, NotebookLM untuk analisis mendalam isi sumber yang sudah kamu dapat.",
    ],
  },

  {
    id: "hafalan",
    subject: "Hafalan Matan & Quran",
    arabic: "التَّحْفِيظُ وَالمُرَاجَعَةُ",
    faculty: "umum",
    icon: "refresh",
    aiId: "chatgpt",
    aiName: "ChatGPT",
    aiBy: "OpenAI",
    aiColor: "#10A37F",
    aiLogo: "/assets/logo-chatgpt.png",
    tagline: "Sesi tasmi' interaktif, murajaah, jadwal hafalan",
    description: "AI tidak menghafal untukmu — tapi bisa jadi partner tasmi' yang sabar dan tersedia jam 2 pagi di mahad.",
    whyThisAI: "ChatGPT sangat baik untuk sesi tasmi' interaktif — memberikan potongan ayat/matan, menunggu jawabanmu, memberi petunjuk halus jika stuck, dan mencatat yang perlu dimurajaah. Lebih fleksibel dari tasmi' ke teman karena tersedia kapan saja.",
    useCases: [
      "Sesi tasmi' murajaah Quran sebelum tidur atau setelah shalat subuh",
      "Hafalan matan Ushul Fiqh (Waraqat, Al-Jurumiyyah, dll) dengan drill",
      "Latihan hafalan hadith Arba'in atau Bulugh al-Maram",
      "Buat jadwal murajaah mingguan berdasarkan jumlah hafalan",
      "Identifikasi ayat/matan yang paling sering lupa untuk prioritas murajaah",
    ],
    steps: [
      { n: 1, title: "Buka ChatGPT", desc: "Mulai dengan memberi tahu: apa yang mau dimurajaah, berapa banyak, dan moda tasmi' yang diinginkan (awal ayat atau akhir)." },
      { n: 2, title: "Pilih moda tasmi'", desc: "Moda 1: ChatGPT sebut awal ayat/matan → kamu lanjutkan. Moda 2: kamu sebutkan nomor ayat/bagian matan → kamu lafalkan → ChatGPT koreksi." },
      { n: 3, title: "Satu per satu, jangan skip", desc: "Jangan minta banyak sekaligus — satu ayat/kalimat, jawab, baru lanjut. Ini yang memaksa otak benar-benar mengambil dari memori." },
      { n: 4, title: "Catat yang ragu", desc: "Minta ChatGPT catat setiap kali kamu ragu atau perlu petunjuk. Di akhir sesi, minta daftar untuk prioritas murajaah besok." },
      { n: 5, title: "Jadwal murajaah rutin", desc: "Minta ChatGPT buatkan jadwal murajaah mingguan yang realistis. Simpan ke Kurasah sebagai reminder." },
    ],
    prompts: [
      {
        label: "Sesi Tasmi' Quran",
        text: "Aku mau murajaah hafalan Quran, mulai dari [SURAT/JUZ]. Moda: kamu sebut 3-5 kata pertama ayat secara acak dalam rentang yang aku minta, aku lanjutkan sampai akhir ayat. Kalau aku ragu, beri 2 kata petunjuk saja, jangan langsung kasih jawabannya. Di akhir sesi, beri daftar ayat yang perlu aku prioritaskan murajaah.",
      },
      {
        label: "Sesi Tasmi' Matan",
        text: "Aku menghafal matan [NAMA MATAN: Waraqat / Al-Jurumiyyah / Arba'in Nawawiyah / dll]. Lakukan sesi tasmi': sebutkan potongan pertama suatu bagian/bab, aku lanjutkan sampai akhir. Kalau aku salah atau terputus, koreksi dan catat. Di akhir sesi, beri laporan: mana yang sudah lancar dan mana yang perlu murajaah.",
      },
      {
        label: "Jadwal Murajaah",
        text: "Buat jadwal murajaah hafalan untukku:\n- Total hafalan: [JUMLAH JUZ/HALAMAN/BAB MATAN]\n- Waktu tersedia per hari: [WAKTU, contoh: 30 menit setelah subuh]\n- Target: seluruh hafalan dimurajaah dalam [PERIODE: 1 minggu/2 minggu]\n\nBuat jadwal harian yang realistis dengan rotasi yang memastikan semua bagian mendapat giliran.",
      },
    ],
    tips: [
      "ChatGPT adalah partner tasmi' mandiri — tetap prioritaskan tasmi' ke guru atau hafidz untuk validasi final.",
      "Gunakan sesi ChatGPT sebagai 'pre-tasmi'' sebelum tasmi' ke guru — ini menghemat waktu guru dan meningkatkan kualitas.",
      "Untuk matan yang panjang, mulai dari bagian yang paling lemah, bukan dari awal — ini lebih efisien.",
    ],
  },

  {
    id: "syafahi",
    subject: "Ujian Syafahi",
    arabic: "الامْتِحَانُ الشَّفَهِيُّ",
    faculty: "umum",
    icon: "messageSquare",
    aiId: "chatgpt",
    aiName: "ChatGPT",
    aiBy: "OpenAI",
    aiColor: "#10A37F",
    aiLogo: "/assets/logo-chatgpt.png",
    tagline: "Simulasi ujian syafahi, latihan jawab, kuasai terminologi",
    description: "Ujian syafahi Al-Azhar punya tekanan tersendiri — dosen bertanya langsung, kamu harus jawab dalam bahasa Arab akademis. Latihan simulasi adalah kunci.",
    whyThisAI: "ChatGPT sangat baik untuk roleplay simulasi ujian — bisa berperan sebagai dosen Azhari yang ketat, mengajukan pertanyaan bertahap, mengoreksi jawaban, dan memberikan feedback tentang cara penyampaian. Ini persiapan syafahi yang bisa dilakukan sendiri jam berapa pun.",
    useCases: [
      "Simulasi syafahi dengan dosen penguji virtual yang ketat",
      "Latihan menjawab pertanyaan definisi, dalil, dan perbandingan",
      "Kuasai cara menyampaikan jawaban dalam bahasa Arab akademis",
      "Latihan menjawab pertanyaan mendadak di luar maqarrar",
      "Persiapan mental: biasakan diri dengan tekanan ujian syafahi",
    ],
    steps: [
      { n: 1, title: "Buka ChatGPT", desc: "Mulai dengan: 'Aku mau persiapan ujian syafahi [MATA PELAJARAN] tentang [TOPIK] di Al-Azhar. Berperankan sebagai dosen penguji Azhari yang serius.'" },
      { n: 2, title: "Tetapkan aturan simulasi", desc: "Katakan: 'Ajukan pertanyaan satu per satu. Tunggu jawabanku sebelum lanjut. Koreksi cara penyampaian, bukan hanya isi. Gunakan bahasa Arab untuk bertanya jika bisa.'" },
      { n: 3, title: "Jawab dalam bahasa Arab", desc: "Usahakan jawab dalam bahasa Arab — bahkan jika ragu-ragu. ChatGPT akan koreksi. Ini melatih kamu berbicara Arab akademis yang dipakai di syafahi." },
      { n: 4, title: "Minta evaluasi menyeluruh", desc: "Setelah 10-15 pertanyaan: 'Evaluasi persiapan syafahi ku: apa yang sudah baik, apa yang perlu diperbaiki, dan mana topik yang paling lemah?' Ini roadmap belajar lanjutan." },
      { n: 5, title: "Ulangi dengan topik berbeda", desc: "Buat sesi simulasi terpisah untuk setiap bab yang mungkin keluar di syafahi. Jangan hanya satu sesi — repetisi adalah kunci." },
    ],
    prompts: [
      {
        label: "Simulasi Ujian Syafahi",
        text: "Aku mau persiapan ujian syafahi [MATA PELAJARAN] di Al-Azhar tentang topik [TOPIK/BAB].\n\nBerperankan sebagai dosen penguji Azhari yang tegas. Aturan:\n1) Ajukan pertanyaan satu per satu\n2) Mulai dari pertanyaan definisi dasar, naik ke analisis dan perbandingan\n3) Tunggu jawabanku sebelum lanjut\n4) Koreksi isi DAN cara penyampaian\n5) Gunakan bahasa Arab untuk bertanya\n\nMulai dengan pertanyaan pertama.",
      },
      {
        label: "Latihan Jawab Pertanyaan Sulit",
        text: "Berikan 5 pertanyaan syafahi yang paling sulit tentang [TOPIK] — jenis pertanyaan yang biasanya membuat mahasiswa tidak bisa menjawab atau salah. Setelah aku jawab tiap pertanyaan, berikan: 1) Penilaian jawaban aku, 2) Jawaban yang lebih lengkap dan tepat, 3) Cara penyampaian yang lebih baik dalam bahasa Arab akademis.",
      },
      {
        label: "Terminologi Arab untuk Syafahi",
        text: "Aku perlu menguasai terminologi bahasa Arab akademis untuk syafahi [MATA PELAJARAN].\n\nBerikan:\n1) 20 istilah teknis paling penting dalam [MAPEL] beserta definisi dalam bahasa Arab\n2) Kalimat-kalimat pembuka yang formal untuk menjawab pertanyaan syafahi: cara memulai jawaban, cara menyatakan ketidaksetujuan dengan sopan, cara meminta klarifikasi\n3) Ungkapan transisi antar argumen dalam bahasa Arab akademis",
      },
    ],
    tips: [
      "Lakukan simulasi syafahi minimal 3 hari sebelum ujian — jangan malam sebelumnya saja.",
      "Rekam jawaban simulasimu (audio/video) dan dengarkan kembali — kamu akan dengar kesalahan yang tidak terasa saat berbicara.",
      "Latihan bicara Arab akademis setiap hari — satu paragraf pun cukup. Konsistensi lebih penting dari intensitas sesekali.",
    ],
  },

  {
    id: "kuliah-arab",
    subject: "Ikut Kuliah dalam Bahasa Arab",
    arabic: "فَهْمُ المُحَاضَرَاتِ بِالعَرَبِيَّةِ",
    faculty: "umum",
    icon: "headphones",
    aiId: "chatgpt",
    aiName: "ChatGPT",
    aiBy: "OpenAI",
    aiColor: "#10A37F",
    aiLogo: "/assets/logo-chatgpt.png",
    tagline: "Pahami penjelasan dosen, catatan kuliah Arab, isi gap",
    description: "Kuliah Al-Azhar full dalam bahasa Arab — dosen ngomong cepat, pakai istilah teknis, kadang pakai amiyah. AI bisa bantu isi gap yang terlewat.",
    whyThisAI: "ChatGPT sangat baik untuk menjelaskan konsep dengan bahasa yang lebih mudah dipahami, mengisi gap catatan yang tidak lengkap, dan menerjemahkan serta menjelaskan istilah teknis yang lewat begitu saat kuliah. Untuk Masisir, ini adalah panduan paling praktis.",
    useCases: [
      "Tanya ulang penjelasan dosen yang tidak kamu pahami sepenuhnya",
      "Lengkapi catatan kuliah yang tidak sempat dicatat",
      "Pahami istilah teknis Arab yang baru pertama kali dengar",
      "Buat ringkasan dari catatan kuliah yang kamu punya",
      "Persiapan sebelum kuliah: baca materi lebih dulu supaya lebih siap ikut diskusi",
    ],
    steps: [
      { n: 1, title: "Setelah kuliah, buka ChatGPT", desc: "Segera setelah kuliah — jangan tunggu. Ingatan masih segar. Tuliskan: 'Dosen tadi menjelaskan [topik]. Ada bagian yang tidak aku pahami: [bagian yang bingung].'" },
      { n: 2, title: "Tanya istilah yang tidak familiar", desc: "Setiap istilah Arab teknis yang pertama kali dengar, langsung tanya: 'Apa arti [istilah] dalam konteks [mata pelajaran]?' — jangan biarkan istilah menumpuk." },
      { n: 3, title: "Minta penjelasan ulang dengan bahasa berbeda", desc: "Kalau penjelasan ChatGPT masih sulit: 'Jelaskan dengan cara lain' atau 'Berikan analogi yang lebih mudah dipahami untuk mahasiswa Indonesia.'" },
      { n: 4, title: "Lengkapi catatan", desc: "Paste catatan kuliah yang tidak lengkap: 'Ini catatan kuliahku tentang [topik], ada beberapa bagian yang kosong dengan [...]. Bantu aku lengkapi berdasarkan topik ini.'" },
      { n: 5, title: "Persiapan sebelum kuliah", desc: "Sehari sebelum jadwal kuliah: 'Besok aku kuliah [mata pelajaran] tentang [topik berdasarkan silabus]. Berikan pengantar singkat supaya aku lebih siap mengikutinya.'" },
    ],
    prompts: [
      {
        label: "Tanya Ulang Penjelasan Kuliah",
        text: "Aku baru selesai kuliah [MATA PELAJARAN] di Al-Azhar. Dosen tadi menjelaskan tentang [TOPIK] tapi ada bagian yang tidak aku pahami sepenuhnya:\n\n[JELASKAN BAGIAN YANG MEMBINGUNGKAN]\n\nBantu aku pahami dengan:\n1) Penjelasan yang lebih sederhana\n2) Contoh konkret yang relevan\n3) Hubungannya dengan apa yang sudah aku pelajari sebelumnya",
      },
      {
        label: "Lengkapi Catatan Kuliah",
        text: "Ini catatan kuliahku tentang [TOPIK], ada beberapa bagian yang tidak sempat aku catat (ditandai dengan [...]):\n\n[PASTE CATATANMU DENGAN [...] DI BAGIAN YANG KOSONG]\n\nBantu aku lengkapi bagian yang kosong berdasarkan konteks topik. Pertahankan istilah Arab yang sudah ada di catatanku.",
      },
      {
        label: "Pre-Baca Materi Kuliah",
        text: "Besok aku kuliah [MATA PELAJARAN] tentang [TOPIK SESUAI SILABUS] di Al-Azhar.\n\nBerikan pengantar supaya aku lebih siap:\n1) Konsep-konsep utama yang akan dibahas\n2) Istilah-istilah teknis penting yang kemungkinan akan muncul\n3) Pertanyaan-pertanyaan kritis yang bisa aku ajukan ke dosen\n4) Hubungannya dengan materi sebelumnya yang sudah dipelajari",
      },
    ],
    tips: [
      "Langsung tanya setelah kuliah — jangan tunggu sampai malam. Ingatan masih segar dan lebih mudah mendeskripsikan yang bingung.",
      "Buat kebiasaan 'review 15 menit' setelah setiap kuliah dengan ChatGPT. Ini kebiasaan yang mengubah pemahaman.",
      "Untuk istilah amiyah Mesir yang dipakai dosen, ChatGPT juga bisa bantu — tanya: 'Apa arti [kata amiyah] dan padanannya dalam fusha?'",
    ],
  },

];

/* ============================================================
   STYLE GUIDES — prompt & strategi per gaya belajar × mapel
   6 gaya belajar: discussion | summary | visual | practice | memorization | reading
   ============================================================ */
const STYLE_GUIDES = {

  fiqh: {
    discussion: {
      tip: "Jangan minta jawaban langsung — adu pendapat dulu. Minta Claude mainkan peran ulama yang berbeda mazhab, lalu kamu yang tentukan mana yang lebih kuat. Ini cara diskusi yang melatih nalar Fiqh.",
      prompts: [
        {
          label: "Diskusi Khilaf Mazhab (Gaya Diskusi)",
          text: "Aku mau diskusi tentang [MASALAH FIQH]. Mainkan peran 4 ulama dari 4 mazhab yang berbeda pendapat. Masing-masing sampaikan argumennya singkat. Setelah itu, aku akan tanggapi dengan memilih pendapat yang menurut aku paling kuat — dan kamu koreksi nalarku. Mulai dengan masing-masing ulama bicara bergantian.",
        },
        {
          label: "Debat Dalil: Aku vs Claude",
          text: "Aku mahasiswa Syariah Al-Azhar. Aku punya pendapat bahwa [PENDAPATKU TENTANG MASALAH FIQH]. Tentang [masalah yang sama]. Kamu perankan ulama yang berbeda pendapat denganku dan tantang argumenku dengan dalil yang lebih kuat. Setelah aku merespons, beri feedback apakah jawabanku sudah cukup kuat secara ilmiah.",
        },
      ],
    },
    summary: {
      tip: "Setelah tiap bab atau topik, minta Claude buat rangkuman terstruktur yang siap untuk murajaah — bukan penjelasan panjang, tapi poin-poin yang langsung bisa kamu simpan dan baca ulang.",
      prompts: [
        {
          label: "Rangkuman Terstruktur Bab Fiqh",
          text: "Aku baru selesai belajar [BAB/TOPIK FIQH] dari maqarrar Al-Azhar. Buat rangkuman yang SANGAT terstruktur:\n\n1) Definisi utama yang wajib hafal\n2) Pembagian/taqsim (jika ada)\n3) Perbedaan 4 mazhab dalam 1 tabel ringkas: Mazhab | Pendapat | Dalil Utama\n4) Kesimpulan rajih\n5) 3 poin yang paling sering keluar di ujian\n\nFormat ringkas, padat, bisa dibaca dalam 3 menit.",
        },
        {
          label: "Kartu Rangkuman Per Masalah",
          text: "Buat 'kartu belajar' untuk [MASALAH FIQH]. Format:\n\nMASALAH: [nama masalah]\nHUKUM DASAR: [hukum menurut jumhur]\nDALIL: [dalil utama dalam 1 kalimat]\nKHILAF: [perbedaan mazhab dalam 1-2 kalimat]\nCATATAN: [hal penting yang sering terlupakan]\n\nBuat 5 kartu sekaligus untuk 5 masalah yang berbeda dalam [bab ini].",
        },
      ],
    },
    visual: {
      tip: "Minta tabel dan diagram — bukan paragraf. Perbandingan mazhab jauh lebih mudah diserap dalam format tabel daripada teks naratif. Buat Claude selalu menyajikan dalam format yang bisa langsung kamu screenshot.",
      prompts: [
        {
          label: "Tabel Perbandingan 4 Mazhab",
          text: "Buat TABEL perbandingan 4 mazhab tentang [MASALAH FIQH].\n\nKolom: Mazhab | Pendapat/Hukum | Dalil Utama | Wajh Istidlal | Catatan\nBaris: Hanafi, Maliki, Syafi'i, Hanbali\n\nSetelah tabel, tambahkan:\n- Mazhab yang dipilih jumhur\n- Illat yang menjadi titik perbedaan",
        },
        {
          label: "Bagan Taqsim Visual",
          text: "Buat struktur taqsim (pembagian) dari [BAB/KONSEP FIQH] dalam format yang bisa divisualisasikan:\n\nMulai dari konsep utama, lalu cabang-cabangnya, sub-cabang, dan definisi tiap ujung cabang. Format seperti outline berhirarki (pakai indentasi atau angka bertingkat). Tambahkan contoh di tiap ujung cabang.",
        },
      ],
    },
    practice: {
      tip: "Kamu belajar paling efektif dengan menjawab soal dulu, bukan membaca dulu. Langsung minta Claude buat soal kasus Fiqh dan jawab satu per satu — ini melatih nalar yang diuji di syafahi.",
      prompts: [
        {
          label: "Drill Kasus Fiqh Bertahap",
          text: "Aku mau latihan Fiqh dengan kasus nyata. Berikan kasus satu per satu:\n\n1. Mulai dari kasus sederhana (hukum jelas)\n2. Naik ke kasus yang ada khilaf mazhab\n3. Kasus kontemporer yang butuh analogi\n\nTopik: [BAB/TOPIK FIQH]. Format: ceritakan kasus → aku jawab (hukum + dalil singkat) → kamu koreksi dan tambahkan. Mulai dari kasus pertama.",
        },
        {
          label: "Simulasi Soal Ujian Tahriri",
          text: "Buat 5 soal ujian tahriri Fiqh tentang [TOPIK] persis seperti format ujian Al-Azhar:\n\n1) Soal definisi (Apa yang dimaksud dengan...)\n2) Soal dalil (Sebutkan dalil dari...)\n3) Soal perbandingan mazhab\n4) Soal tathbiq/kasus\n5) Soal analisis (Bandingkan antara...)\n\nBerikan soal dulu tanpa jawaban. Aku kerjakan, lalu kamu koreksi.",
        },
      ],
    },
    memorization: {
      tip: "Ubah setiap perbedaan mazhab jadi poin hafalan yang super ringkas. Bukan penjelasan panjang — tapi formula pendek yang mudah diingat: MAZHAB → HUKUM → KATA KUNCI DALIL.",
      prompts: [
        {
          label: "Poin Hafalan Mazhab (Super Ringkas)",
          text: "Konversikan perbedaan 4 mazhab tentang [MASALAH FIQH] ke format hafalan ultra-ringkas:\n\nFormat tiap mazhab: [NAMA] → [HUKUM 1-3 kata] → [KATA KUNCI DALIL] → [PENGECUALIAN jika ada]\n\nBuat semua 4 mazhab, lalu urutkan dari pendapat paling ketat ke paling longgar. Tambahkan mnemonic (cara ingat) jika memungkinkan.",
        },
        {
          label: "Hafalan Definisi Teknis Fiqh",
          text: "Buat daftar definisi teknis yang WAJIB hafal dari [BAB FIQH]. Format untuk tiap istilah:\n\nISTILAH: [nama Arab]\nDEFINISI SINGKAT: [maksimal 1 kalimat]\nCONTOH: [satu contoh konkret]\n\nBuat 10 istilah, urutkan dari yang paling sering muncul di ujian.",
        },
      ],
    },
    reading: {
      tip: "Sebelum buka maqarrar, minta Claude beri 'pre-reading' — pengantar singkat topik dan pertanyaan kritis yang harus kamu temukan jawabannya saat baca. Ini bikin bacaan lebih fokus dan tujuan.",
      prompts: [
        {
          label: "Pre-Reading Maqarrar Fiqh",
          text: "Aku akan baca bagian maqarrar Fiqh tentang [TOPIK]. Sebelum aku mulai baca, berikan:\n\n1) Konteks: mengapa topik ini penting dalam sistem Fiqh Islam\n2) Pertanyaan kunci yang harus aku temukan jawabannya saat baca\n3) Istilah teknis yang harus aku pahami terlebih dahulu\n4) Hubungannya dengan materi yang sudah aku pelajari sebelumnya\n\nSetelah baca, aku akan kembali dan diskusikan apa yang aku temukan.",
        },
        {
          label: "Telaah Mendalam Teks Fiqh",
          text: "Aku mau telaah mendalam teks Fiqh berikut:\n\n[PASTE TEKS ARAB ATAU TERJEMAHAN]\n\nBantu aku:\n1) Identifikasi setiap klaim yang dibuat penulis\n2) Dalil yang digunakan untuk tiap klaim\n3) Apakah ada asumsi yang tidak disebutkan eksplisit?\n4) Apa yang akan dikatakan ulama mazhab lain tentang argumen ini?\n5) Kesimpulan apa yang bisa aku tarik sendiri?",
        },
      ],
    },
  },

  ushul: {
    discussion: {
      tip: "Debatkan kehujjahan kaidah — bukan hanya terima begitu saja. Minta Claude mainkan peran ulama yang menolak suatu kaidah ushuliyyah, lalu kamu bela kaidah itu. Ini persis cara ulama membangun pemahaman Ushul.",
      prompts: [
        {
          label: "Debat Kehujjahan Kaidah",
          text: "Aku mau berdebat tentang [KAIDAH USHULIYYAH, contoh: kehujjahan hadith ahad / mafhum mukhalafah / istishab]. Kamu mainkan peran ulama yang MENOLAK atau memperlemah kehujjahan kaidah ini. Aku yang akan membela kaidah ini dengan dalil. Setelah adu argumen 3 putaran, beri evaluasi: mana argumen yang paling kuat dari kedua sisi.",
        },
        {
          label: "Diskusi Metodologi: Kenapa Berbeda?",
          text: "Jelaskan mengapa ulama Ushul berbeda pendapat tentang [MASALAH USHULIYYAH: contoh qiyas / istihsan / maslahah mursalah]. Format diskusi:\n\n1) Posisi kelompok A (yang menerima) + argumen utama\n2) Posisi kelompok B (yang menolak) + argumen balasan\n3) Titik perbedaan asasi yang membuat keduanya berbeda\n4) Pertanyaan untuk aku renungkan sendiri\n\nJangan langsung kasih kesimpulan — biarkan aku yang simpulkan.",
        },
      ],
    },
    summary: {
      tip: "Setiap kaidah Ushul harus ada kartu rangkumannya: definisi, pembagian, tathbiq, dan catatan penting. Buat ini secara konsisten dan kamu akan punya perpustakaan kaidah yang siap ujian.",
      prompts: [
        {
          label: "Kartu Rangkuman Kaidah Ushuliyyah",
          text: "Buat kartu rangkuman untuk kaidah Ushuliyyah: [NAMA KAIDAH]\n\nFormat:\nNAMA: [Arab + transliterasi]\nDEFINISI: [1-2 kalimat]\nPEMBAGIAN: [jika ada]\nTATHBIQ IBADAH: [1 contoh]\nTATHBIQ MUAMALAT: [1 contoh]\nMUSTATHNAYYAT: [pengecualian utama]\nMAZHAB YANG BERBEDA: [jika ada khilaf]\nPOIN UJIAN: [apa yang sering ditanya]\n\nBuat 5 kartu sekaligus untuk [5 kaidah dalam bab yang sama].",
        },
        {
          label: "Rangkuman Bab Ushul Sistematis",
          text: "Aku selesai belajar bab [NAMA BAB USHUL FIQH]. Buat RANGKUMAN SISTEMATIS:\n\n1) Definisi pokok bab ini dalam 2-3 kalimat\n2) Taqsim/pembagian utama (dalam format hierarki/bagan)\n3) Kaidah-kaidah kunci yang muncul di bab ini\n4) Contoh tathbiq untuk tiap kaidah\n5) Hubungan bab ini dengan bab yang sudah aku pelajari sebelumnya\n6) 5 pertanyaan yang paling mungkin keluar di ujian",
        },
      ],
    },
    visual: {
      tip: "Minta tabel taqsim dan bagan hierarki — bukan penjelasan teks. Ushul Fiqh penuh dengan pembagian bertingkat yang jauh lebih mudah dipahami dalam bentuk visual.",
      prompts: [
        {
          label: "Bagan Taqsim Ushuliyyah",
          text: "Buat BAGAN HIERARKI (format outline bertingkat) untuk taqsim/pembagian dari [KONSEP USHUL: dilalah lafadz / amar / nahi / 'am / khas / dll].\n\nMulai dari konsep utama → cabang pertama → sub-cabang → definisi + contoh di tiap ujung.\n\nSetelah bagan, buat tabel perbandingan untuk konsep-konsep yang sering dicampur aduk.",
        },
        {
          label: "Tabel Perbandingan Istilah Ushul",
          text: "Buat TABEL PERBANDINGAN untuk istilah-istilah Ushul yang mirip:\n\n[PASANGAN ISTILAH, contoh: 'am vs khas / mutlaq vs muqayyad / nash vs zhahir]\n\nKolom: Istilah | Definisi | Ciri Khas | Contoh Teks | Hukum Pengamalan | Perbedaan Utama dengan Pasangannya",
        },
      ],
    },
    practice: {
      tip: "Kamu tidak akan paham Ushul tanpa banyak latihan tathbiq. Setiap kali belajar kaidah baru, langsung minta soal aplikasi — bukan penjelasan tambahan.",
      prompts: [
        {
          label: "Drill Tathbiq Kaidah",
          text: "Aku baru belajar kaidah [KAIDAH USHULIYYAH]. Beri aku 6 kasus Fiqh untuk aku praktikkan kaidah ini:\n\n- 2 kasus ibadah\n- 2 kasus muamalat\n- 2 kasus yang agak ambigu (bisa apply atau tidak apply)\n\nBerikan kasus satu per satu. Aku jawab apakah kaidah ini berlaku + alasannya. Kamu koreksi dan jelaskan apabila aku salah.",
        },
        {
          label: "Identifikasi Dilalah Lafadz",
          text: "Latihan identifikasi dilalah lafadz. Berikan 5 penggalan teks Arab (dari Quran, Hadith, atau Fiqh). Untuk tiap teks, aku akan:\n\n1) Identifikasi jenis lafadz (nash/zhahir/mujmal/mutasyabih atau 'am/khas/mutlaq/muqayyad atau amar/nahi)\n2) Tentukan hukum pengamalannya\n\nBerikan teks satu per satu. Koreksi setelah aku jawab tiap teks.",
        },
      ],
    },
    memorization: {
      tip: "Hafal definisi-definisi Ushul dengan cara 'formula pendek' — bukan kalimat panjang. Definisi dalam 5-8 kata Arab yang bisa kamu lafalkan dengan lancar jauh lebih berguna dari paragraf.",
      prompts: [
        {
          label: "Formula Hafalan Definisi Ushul",
          text: "Ubah definisi-definisi berikut menjadi 'formula hafalan' yang sangat ringkas (maksimal 8 kata Arab) untuk [KUMPULAN ISTILAH USHUL DALAM SATU BAB].\n\nFormat tiap istilah:\nISTILAH: [nama Arab]\nFORMULA: [definisi ultra-ringkas dalam bahasa Arab]\nCONTOH KILAT: [1 contoh yang langsung bisa diucapkan]\nCATATAN: [apa yang sering keliru]\n\nBuat 8-10 istilah sekaligus.",
        },
        {
          label: "Hafalan Kaidah Ushul dengan Mnemonic",
          text: "Aku perlu hafal [DAFTAR KAIDAH USHULIYYAH DALAM SATU BAB]. Untuk tiap kaidah:\n\n1) Teks kaidah dalam bahasa Arab\n2) Arti singkat dalam Bahasa Indonesia (satu kalimat)\n3) Mnemonic atau cara ingat yang kreatif\n4) Satu contoh yang paling mudah diingat\n\nUrut dari kaidah yang paling fundamental ke yang lebih spesifik.",
        },
      ],
    },
    reading: {
      tip: "Sebelum baca bab Ushul baru, minta Claude jelaskan 'big picture' dulu — mengapa bab ini ada, apa masalah yang ingin ia selesaikan. Pemahaman konteks ini bikin bacaan jauh lebih bermakna.",
      prompts: [
        {
          label: "Konteks Sebelum Baca Bab Ushul",
          text: "Aku akan membaca bab [NAMA BAB USHUL FIQH] dari maqarrar Al-Azhar. Sebelum baca, jelaskan:\n\n1) Mengapa bab ini penting — masalah apa yang ia selesaikan dalam metodologi Fiqh?\n2) Bagaimana bab ini terhubung dengan bab-bab sebelumnya?\n3) Apa perbedaan pendapat ulama yang akan aku temukan di bab ini?\n4) Pertanyaan-pertanyaan kunci yang harus aku temukan jawabannya saat baca.\n\nSetelah baca, aku kembali untuk diskusi.",
        },
        {
          label: "Telaah Matan Ushuliyyah",
          text: "Aku mau telaah matan [NAMA KITAB: Waraqat / Jam'ul Jawami' / dll], bagian tentang [TOPIK]:\n\n[PASTE TEKS MATAN]\n\nBantu aku:\n1) Terjemahkan kata per kata yang penting\n2) Identifikasi klaim utama penulis\n3) Dalil yang dipakai (eksplisit dan implisit)\n4) Bagian mana yang masih ada khilaf di kalangan ulama Ushul\n5) Pertanyaan yang aku harus ajukan ke dosen",
        },
      ],
    },
  },

  qawaid: {
    discussion: {
      tip: "Diskusikan penerapan kaidah ke kasus nyata — bukan hanya terima tamtsil dari buku. Kasuskan situasi kehidupan Masisir di Kairo dan diskusikan bersama Claude kaidah mana yang berlaku.",
      prompts: [
        {
          label: "Diskusi Kasus Masisir: Kaidah Mana?",
          text: "Aku mau diskusi penerapan Qawaid Fiqhiyyah ke situasi nyata Masisir di Kairo:\n\n[SITUASI, contoh: makan di restoran yang menyajikan makanan halal dan haram / beribadah di lingkungan non-Muslim / muamalah di bank Mesir]\n\nKita diskusikan bersama: kaidah fiqhiyyah mana yang berlaku, bagaimana ia diterapkan, dan apa yang terjadi kalau ada dua kaidah yang tampak bertentangan? Aku mulai dulu dengan pendapatku, kamu respons.",
        },
        {
          label: "Debat: Dua Kaidah yang Bertentangan",
          text: "Aku temukan kasus di mana dua kaidah seperti bertentangan:\n\nKaidah 1: [KAIDAH PERTAMA]\nKaidah 2: [KAIDAH KEDUA]\nKasus: [SITUASI KONKRET]\n\nKamu argumenkan bahwa kaidah 1 yang berlaku. Aku argumenkan kaidah 2. Setelah 3 putaran diskusi, kita cari titik temu bagaimana ulama menyelesaikan kontradiksi semacam ini.",
        },
      ],
    },
    summary: {
      tip: "Buat satu kartu per kaidah kubra beserta seluruh furu' (cabang) dan mustathnayyat-nya. Ini yang jadi 'cheat sheet' murajaahmu saat ujian sudah dekat.",
      prompts: [
        {
          label: "Peta Lengkap Satu Kaidah Kubra",
          text: "Buat PETA LENGKAP untuk qaidah kubra: [TEKS KAIDAH]\n\nSertakan:\n1) Teks kaidah Arab + arti\n2) Dalil/asal kaidah\n3) Qawaid Fiqhiyyah turunan (far'iyyah) dari kaidah ini\n4) 5-7 tamtsil dari berbagai bab Fiqh\n5) Mustathnayyat (pengecualian) + alasan tiap pengecualian\n6) Qawaid lain yang berkaitan dan cara membedakannya\n\nFormat: bisa dalam poin-poin atau tabel, yang penting mudah dipindai.",
        },
        {
          label: "Tabel 5 Qawaid Kubra Sekaligus",
          text: "Buat TABEL RINGKASAN untuk kelima qawaid kubra sekaligus:\n\nKolom: No | Kaidah (Arab) | Arti | Dalil Singkat | Contoh Ibadah | Contoh Muamalat | Pengecualian Utama\n\nSetelah tabel, tambahkan: cara membedakan kaidah-kaidah yang tampak mirip, dan kaidah mana yang paling sering diuji di Al-Azhar.",
        },
      ],
    },
    visual: {
      tip: "Qawaid Fiqhiyyah sangat cocok untuk peta konsep. Minta Claude buat hierarki dari qawaid kubra → qawaid furu'iyyah → tamtsil dalam format yang bisa kamu gambar di kertas.",
      prompts: [
        {
          label: "Hierarki Visual Qawaid",
          text: "Buat STRUKTUR HIERARKI VISUAL (format indentasi bertingkat) untuk keseluruhan Qawaid Fiqhiyyah:\n\nLevel 1: 5 qawaid kubra\nLevel 2: Qawaid furu'iyyah dari tiap kaidah kubra\nLevel 3: Contoh kasus untuk tiap qaidah furu'iyyah\n\nFormat agar mudah dijadikan mind map di kertas. Mulai dari [qaidah kubra tertentu] jika terlalu banyak sekaligus.",
        },
        {
          label: "Tabel Tamtsil dari Berbagai Bab",
          text: "Buat TABEL TAMTSIL untuk kaidah [KAIDAH FIQHIYYAH]:\n\nKolom: Bab Fiqh | Kasus | Bagaimana Kaidah Berlaku | Kaidah Lain yang Juga Berlaku\n\nBuat minimal 8 tamtsil dari bab-bab yang berbeda: thaharah, shalat, zakat, shaum, nikah, thalaq, muamalat, jinayat.",
        },
      ],
    },
    practice: {
      tip: "Latihan identifikasi adalah kunci — diberi kasus, tunjuk kaidahnya. Ini yang persis diuji di ujian Qawaid Al-Azhar.",
      prompts: [
        {
          label: "Drill Identifikasi: Kaidah Apa yang Berlaku?",
          text: "Aku mau latihan identifikasi qawaid fiqhiyyah. Berikan kasus satu per satu:\n\nLevel 1: 3 kasus sederhana (kaidah jelas)\nLevel 2: 3 kasus menengah (bisa jadi 2 kaidah)\nLevel 3: 2 kasus sulit (kaidah tampak berkonflik)\n\nTopik: [BATAS KASUS, misal: semua dari Fiqh Ibadah]. Format: ceritakan kasus → aku jawab kaidah yang berlaku + alasannya → kamu koreksi.",
        },
        {
          label: "Latihan Soal Ujian Qawaid",
          text: "Buat soal ujian Qawaid Fiqhiyyah seperti format Al-Azhar tentang [KAIDAH/BAB]:\n\n1) Sebutkan dan jelaskan kaidah + dalilnya\n2) Berikan 3 tamtsil dari bab yang berbeda\n3) Sebutkan mustathnayyat dan jelaskan mengapa dikecualikan\n4) Kasus: [kasus spesifik] — kaidah mana yang berlaku dan mengapa?\n5) Bandingkan dengan kaidah [kaidah yang mirip]\n\nBerikan soal dulu tanpa jawaban. Aku kerjakan, lalu kamu nilai.",
        },
      ],
    },
    memorization: {
      tip: "Hafal kaidah dengan cara tiga lapis: teks Arab → arti → satu tamtsil yang paling mudah diingat. Tiga lapis ini yang membuat hafalan tidak mudah lupa.",
      prompts: [
        {
          label: "Hafalan 3 Lapis per Kaidah",
          text: "Bantu aku hafal [DAFTAR QAWAID FIQHIYYAH] dengan sistem 3 lapis:\n\nLapis 1: TEKS ARAB kaidah (persis seperti yang dihafal)\nLapis 2: ARTI dalam 5-7 kata Bahasa Indonesia\nLapis 3: TAMTSIL KILAT — satu contoh yang sangat mudah diingat (bisa dari kehidupan sehari-hari Masisir)\n\nBuat untuk tiap kaidah dalam daftar. Setelah itu, minta aku hafal dan quiz aku.",
        },
        {
          label: "Quiz Hafalan Qawaid",
          text: "Aku mau quiz hafalan Qawaid Fiqhiyyah. Kamu sebutkan arti/tamtsil sebuah kaidah — aku harus menyebutkan teks Arab-nya.\n\nScope: [KAIDAH YANG SUDAH AKU HAFAL, atau: 5 qawaid kubra]\n\nAturan: kalau aku salah, jangan langsung kasih jawaban — beri petunjuk saja. Di akhir quiz, beri laporan: kaidah mana yang masih lemah.",
        },
      ],
    },
    reading: {
      tip: "Baca maqarrar Qawaid dengan pertanyaan ini selalu di kepala: 'Mengapa kaidah ini ada? Masalah apa yang ingin diselesaikan ulama dengan merumuskan kaidah ini?' Claude bisa bantu menjawab ini sebelum kamu mulai baca.",
      prompts: [
        {
          label: "Konteks Historis Kaidah Sebelum Baca",
          text: "Sebelum aku baca tentang kaidah [NAMA KAIDAH] dari maqarrar, jelaskan:\n\n1) Mengapa ulama merumuskan kaidah ini — masalah konkret apa yang diselesaikan?\n2) Siapa ulama yang pertama merumuskan dan kapan konteks historisnya\n3) Bagaimana kaidah ini berkembang setelah dirumuskan\n4) Pertanyaan analitis yang perlu aku temukan jawabannya saat baca maqarrar\n\nSetelah itu aku akan baca dan kembali dengan temuan.",
        },
        {
          label: "Analisis Mendalam Mustathnayyat",
          text: "Aku mau telaah mendalam pengecualian (mustathnayyat) dari kaidah [KAIDAH FIQHIYYAH].\n\nUntuk tiap mustathna:\n1) Apa kasus pengecualiannya persis?\n2) Mengapa dikecualikan — apa illat atau hikmahnya?\n3) Ulama mana yang menetapkan pengecualian ini?\n4) Apakah ada ulama yang tidak mengakui pengecualian ini?\n5) Implikasi: kalau pengecualian ini tidak ada, apa hukumnya?\n\nAnalisis mendalam, bukan sekadar daftar.",
        },
      ],
    },
  },

  muamalat: {
    discussion: {
      tip: "Diskusikan kasus nyata ekonomi digital yang kamu temui sehari-hari di Kairo. Bayangkan skenario, lalu debatkan bersama Claude apakah transaksi itu sah menurut Fiqh.",
      prompts: [
        {
          label: "Diskusi Kasus Transaksi Digital Hari Ini",
          text: "Aku mau diskusi Fiqh Muamalat untuk kasus berikut dari kehidupan nyata:\n\n[KASUS, contoh: bayar dengan kartu debit/kredit di Mesir / transfer uang via WhatsApp / jual beli di OLX Mesir / langganan Netflix]\n\nAku mulai dengan analisis ringan dulu — hukum, akad, dan potensi masalahnya. Kamu respons dengan dalil Fiqh yang lebih kuat, atau tantang analisisku kalau ada yang kurang tepat. Kita diskusikan 3-4 putaran.",
        },
        {
          label: "Debat: Halal atau Tidak?",
          text: "Kita debat tentang [PRODUK/TRANSAKSI KONTEMPORER]. Aku akan argumentasikan bahwa ini TIDAK bermasalah secara Fiqh. Kamu argumentasikan bahwa ada masalah Fiqh serius di dalamnya. Setelah 3 putaran debat, kita lihat posisi lembaga fatwa resmi sebagai hakim.",
        },
      ],
    },
    summary: {
      tip: "Setelah tiap akad dipelajari, buat kartu ringkasan: nama akad, definisi, rukun dan syarat, perbedaan dengan akad yang mirip, dan contoh produk nyata.",
      prompts: [
        {
          label: "Kartu Akad Muamalat",
          text: "Buat KARTU RINGKASAN AKAD untuk [NAMA AKAD: mudharabah / musyarakah / murabahah / ijarah / dll]:\n\nNAMA: [Arab + arti]\nDEFINISI: [1-2 kalimat]\nRUKUN: [daftar rukun]\nSYARAT UTAMA: [syarat-syarat kunci]\nPRODUK NYATA: [contoh di perbankan/keuangan syariah]\nPERBEDAAN dengan [akad yang mirip]:\nKHILAF ULAMA: [jika ada]\n\nBuat kartu untuk 3 akad sekaligus.",
        },
        {
          label: "Tabel Perbandingan Akad Kontemporer",
          text: "Buat TABEL PERBANDINGAN akad-akad keuangan syariah kontemporer:\n\nAkad yang dibandingkan: [DAFTAR AKAD]\nKolom: Nama | Definisi Singkat | Siapa yang Untung/Rugi | Risiko yang Dibagi | Contoh Produk Bank | Status Fatwa DSN-MUI\n\nSetelah tabel, jelaskan dalam satu paragraf: bagaimana membedakannya saat dihadapkan kasus nyata.",
        },
      ],
    },
    visual: {
      tip: "Minta diagram alur transaksi — bukan hanya definisi akad. Melihat siapa pihak A, siapa pihak B, dan apa yang mengalir di antara keduanya jauh lebih mudah dipahami secara visual.",
      prompts: [
        {
          label: "Diagram Alur Akad",
          text: "Buat DIAGRAM ALUR (format teks dengan panah) untuk akad [NAMA AKAD]:\n\n- Tampilkan semua pihak yang terlibat\n- Tunjukkan apa yang mengalir dari siapa ke siapa (uang, barang, jasa, manfaat)\n- Tunjukkan di mana risiko berada\n- Tunjukkan di mana keuntungan dibagi\n\nBuat untuk dua skenario: (1) transaksi berjalan normal, (2) ada satu pihak yang gagal bayar/deliver.",
        },
        {
          label: "Bagan Klasifikasi Masalah Muamalat",
          text: "Buat BAGAN KLASIFIKASI untuk jenis-jenis masalah dalam [TOPIK MUAMALAT: riba / gharar / maysir / dll]:\n\nLevel 1: Definisi dan kategori besar\nLevel 2: Sub-kategori (jenis-jenisnya)\nLevel 3: Contoh kontemporer untuk tiap sub-kategori\n\nFormat: hierarki bertingkat yang bisa aku jadikan mind map.",
        },
      ],
    },
    practice: {
      tip: "Kerjakan kasus analisis Fiqh Muamalat dari awal sampai akhir — bukan hanya jawab pertanyaan. Ini melatih kemampuan yang dibutuhkan untuk makalah dan ujian.",
      prompts: [
        {
          label: "Latihan Analisis Fiqh Lengkap",
          text: "Berikan satu kasus Fiqh Muamalat untuk aku analisis secara lengkap:\n\nTopik: [AREA MUAMALAT: perbankan syariah / asuransi / perdagangan digital / dll]\n\nAku akan tulis analisis singkat (3-5 poin): akad yang berlaku, unsur masalah (riba/gharar/dll jika ada), posisi ulama, dan kesimpulan. Kamu nilai: seberapa tepat analisisku? Di mana yang kurang? Beri kasus berikutnya setelah itu.",
        },
        {
          label: "Soal Kasus Ujian Muamalat",
          text: "Buat 4 soal kasus Fiqh Muamalat tingkat Al-Azhar:\n\n1) Kasus perbankan syariah (akad mudharabah/musyarakah)\n2) Kasus asuransi atau investasi\n3) Kasus e-commerce atau transaksi digital\n4) Kasus yang melibatkan unsur riba yang tidak jelas\n\nTiap soal: ceritakan kasusnya → aku analisis hukumnya → kamu evaluasi analisisku.",
        },
      ],
    },
    memorization: {
      tip: "Hafal definisi riba, gharar, dan maysir dengan contoh yang sangat konkret dan mudah dikenali. Ini fondasi yang kalau hafal, mudah aplikasikan ke kasus baru.",
      prompts: [
        {
          label: "Hafalan Definisi + Contoh Konkret",
          text: "Buat daftar DEFINISI HAFALAN dengan contoh super konkret untuk:\n\n[DAFTAR ISTILAH: riba / gharar / maysir / dll]\n\nFormat tiap istilah:\nDEFINISI SINGKAT: [maksimal 10 kata Indonesia]\nCONTOH NYATA: [satu contoh yang bisa dilihat di kehidupan sehari-hari]\nCARA KENALI: [ciri khas yang membedakan dari yang halal]\n\nSesederhana mungkin — buat bisa dijelaskan ke orang yang tidak belajar Fiqh.",
        },
        {
          label: "Poin Hafalan Rukun dan Syarat Akad",
          text: "Buat DAFTAR HAFALAN rukun dan syarat untuk akad-akad berikut: [DAFTAR AKAD].\n\nFormat:\nAKAD: [nama]\nRUKUN: [R1, R2, R3...]\nSYARAT MASING-MASING RUKUN: [singkat, poin-poin]\nYANG SERING DILANGGAR: [kesalahan paling umum di zaman modern]\n\nBuat sependek mungkin agar mudah dihafal.",
        },
      ],
    },
    reading: {
      tip: "Sebelum baca fatwa atau analisis ulama tentang isu muamalat, pahami dulu konteks ekonomi masalahnya. Claude bisa bantu jelaskan 'bagaimana produk ini bekerja' sebelum kamu baca analisis Fiqh-nya.",
      prompts: [
        {
          label: "Konteks Ekonomi Sebelum Analisis Fiqh",
          text: "Sebelum aku baca analisis Fiqh tentang [PRODUK/TRANSAKSI], jelaskan dulu:\n\n1) Bagaimana [produk/transaksi] ini bekerja secara mekanisme ekonomi\n2) Siapa saja pihak yang terlibat dan peran masing-masing\n3) Di mana potensi masalah Fiqh secara umum (sebelum analisis detail)\n4) Ulama atau lembaga mana yang sudah mengeluarkan fatwa tentang ini\n\nSetelah aku baca fatwa/analisis Fiqh-nya, aku akan kembali untuk diskusi.",
        },
        {
          label: "Telaah Fatwa Kontemporer",
          text: "Aku mau telaah mendalam fatwa/keputusan tentang [MASALAH MUAMALAT] dari [DSN-MUI / Darul Ifta' Mesir / OIC Fiqh Academy].\n\nBantu aku memahami:\n1) Apa masalah yang difatwakan persis?\n2) Dalil Fiqh apa yang digunakan?\n3) Apakah ada lembaga fatwa lain yang berbeda pendapat?\n4) Apakah fatwa ini masih relevan dengan kondisi pasar saat ini?\n5) Apa yang masih menjadi perdebatan meski fatwa sudah keluar?",
        },
      ],
    },
  },

  "tarikh-tasyri": {
    discussion: {
      tip: "Diskusikan 'mengapa' di balik perkembangan Fiqh per periode — bukan hanya 'apa'. Apa yang terjadi di politik, sosial, dan keilmuan yang mendorong perubahan cara berpikir Fiqh?",
      prompts: [
        {
          label: "Diskusi Faktor Perkembangan Fiqh",
          text: "Aku mau diskusi tentang faktor-faktor yang mendorong perkembangan Fiqh pada [PERIODE]. Aku mulai dengan pendapatku: [PENDAPATKU]. Kamu respons — setuju atau tambahkan faktor yang aku lewatkan, atau tantang kalau ada yang kurang tepat. Kita diskusikan sampai mendapat gambaran yang komprehensif.",
        },
        {
          label: "Debat: Apakah Masa Tadwin itu Puncak atau Titik Awal Kemunduran?",
          text: "Kita debat pertanyaan historis: apakah masa tadwin Fiqh [periode Imam 4 mazhab] itu 'puncak kematangan Fiqh' atau justru 'awal dari taqlid yang menghambat ijtihad'?\n\nKamu pegang posisi [A: tadwin = puncak]. Aku pegang posisi [B: tadwin = awal masalah taqlid buta]. Setelah debat, kita simpulkan bagaimana sejarawan Fiqh modern melihat ini.",
        },
      ],
    },
    summary: {
      tip: "Rangkum satu periode per satu sesi — jangan coba semua sekaligus. Satu periode = satu kartu dengan: rentang waktu, ciri utama, tokoh, karya penting, faktor pendorong.",
      prompts: [
        {
          label: "Kartu Rangkuman Satu Periode",
          text: "Buat KARTU RANGKUMAN komprehensif untuk periode [NAMA PERIODE TARIKH TASYRI']:\n\nNAMA PERIODE: [Arab + Indonesia]\nRENTANG WAKTU: [tahun/era]\nCIRI UTAMA FIQH: [3-4 poin karakteristik]\nTOKOH KUNCI: [nama + kontribusi singkat]\nKARYA PENTING: [kitab + pengarang]\nFAKTOR PENDORONG: [politik, sosial, keilmuan]\nPERBEDAAN dengan periode sebelum dan sesudahnya:\n\nFormat padat, bisa dibaca dalam 2 menit.",
        },
        {
          label: "Tabel Timeline Semua Periode",
          text: "Buat TABEL TIMELINE komprehensif Tarikh Tasyri' dari masa Rasulullah hingga kontemporer:\n\nKolom: No | Nama Periode | Rentang Waktu | Ciri Khas | Tokoh Terpenting | Karya Monumental | Catatan Penting\n\nUrut kronologis. Buat ringkas tapi informatif — ini akan jadi cheat sheet murajaahku.",
        },
      ],
    },
    visual: {
      tip: "Tarikh Tasyri' adalah sejarah — visualisasinya adalah timeline dan tabel perbandingan antar periode. Minta Claude buat ini, bukan narasi.",
      prompts: [
        {
          label: "Timeline Visual Tarikh Tasyri'",
          text: "Buat TIMELINE VISUAL (format teks/ascii art) perkembangan Fiqh Islam:\n\n- Mulai dari masa Rasulullah sampai kontemporer\n- Tandai titik-titik penting: kodifikasi mazhab, masa kemunduran, kebangkitan\n- Tandai tokoh-tokoh kunci di timeline ini\n- Tandai karya-karya monumental\n\nFormat: garis waktu horizontal dengan penanda penting di atas dan bawahnya.",
        },
        {
          label: "Tabel Perbandingan Antar Periode",
          text: "Buat TABEL PERBANDINGAN antara periode-periode Tarikh Tasyri':\n\nPeriode yang dibandingkan: [PILIH 3-4 PERIODE]\nKolom: Periode | Ijtihad vs Taqlid | Kodifikasi | Pengaruh Politik | Hubungan Keilmuan | Tokoh Dominan\n\nSetelah tabel, berikan analisis: apa tren besar yang terlihat dari perbandingan ini?",
        },
      ],
    },
    practice: {
      tip: "Latihan soal Tarikh Tasyri' harus mencakup dua jenis: hafalan fakta (siapa, kapan, apa) DAN analisis (mengapa, bagaimana dampaknya). Minta keduanya.",
      prompts: [
        {
          label: "Drill Soal: Fakta + Analisis",
          text: "Buat 8 soal latihan Tarikh Tasyri' tentang [PERIODE/TOPIK]:\n\n- 3 soal hafalan: identifikasi tokoh, tahun, kitab\n- 3 soal sebab-akibat: mengapa X terjadi, apa dampak Y\n- 2 soal perbandingan: bedakan periode A dengan B\n\nBerikan soal tanpa jawaban. Aku jawab satu per satu. Koreksi dan tambahkan poin yang aku lewatkan.",
        },
        {
          label: "Simulasi Soal Ujian Tarikh Tasyri'",
          text: "Buat soal esai Tarikh Tasyri' seperti format ujian Al-Azhar:\n\n'Jelaskan perkembangan Fiqh pada [PERIODE] meliputi: karakteristik, tokoh utama, faktor pendorong, dan perbedaannya dengan periode [SEBELUM/SESUDAH].'\n\nAku tulis jawaban singkat (5-7 poin). Kamu evaluasi: apa yang sudah benar, apa yang kurang, dan apa yang seharusnya ditambahkan.",
        },
      ],
    },
    memorization: {
      tip: "Hafal urutan periode dulu sebelum detail. Kalau urutan sudah masuk, mengaitkan detail (tokoh, karya, ciri) ke posisi yang tepat dalam timeline jadi jauh lebih mudah.",
      prompts: [
        {
          label: "Hafalan Urutan Periode + Ciri Kilat",
          text: "Buat DAFTAR HAFALAN periode Tarikh Tasyri' berurutan:\n\nFormat tiap periode:\n[NOMOR]. [NAMA PERIODE] | [TAHUN] | [CIRI UTAMA 3 KATA] | [SATU TOKOH PALING IKONIK]\n\nBuat semua periode dari awal sampai kontemporer. Sesederhana mungkin — ini untuk hafalan urutan dan ciri kilat, bukan penjelasan mendalam.",
        },
        {
          label: "Kartu Tokoh Tarikh Tasyri'",
          text: "Buat KARTU TOKOH untuk 10 tokoh terpenting Tarikh Tasyri' yang paling sering muncul di ujian:\n\nFormat tiap tokoh:\nNAMA: [lengkap]\nHIDUP: [tahun lahir-wafat]\nPERIODE: [nama periode]\nKONTRIBUSI UTAMA: [satu kalimat]\nKARYA MONUMENTAL: [judul kitab]\nFAKTA PENTING: [sesuatu yang sering ditanya di ujian]\n\nUrut kronologis.",
        },
      ],
    },
    reading: {
      tip: "Sebelum baca tentang suatu periode, minta Claude gambaran konteks sejarah Islam saat itu — apa yang sedang terjadi secara politik dan sosial. Konteks ini bikin bacaan jauh lebih hidup.",
      prompts: [
        {
          label: "Konteks Historis Sebelum Baca",
          text: "Sebelum aku baca tentang [PERIODE TARIKH TASYRI'], berikan konteks:\n\n1) Apa yang sedang terjadi di dunia Islam saat itu (politik, wilayah, kekuatan)\n2) Kondisi keilmuan Islam dan pusat-pusat pembelajaran\n3) Tantangan eksternal (pergolakan politik, kontak dengan budaya lain)\n4) Mengapa kondisi ini mempengaruhi perkembangan Fiqh\n\nSetelah baca maqarrar tentang periode ini, aku akan kembali untuk diskusi.",
        },
        {
          label: "Telaah Kritis Perkembangan Ijtihad",
          text: "Aku mau telaah kritis tentang perdebatan ini dalam Tarikh Tasyri': benarkah ada 'pintu ijtihad ditutup' setelah masa tadwin?\n\nBantu aku memahami:\n1) Apa argumen yang mengatakan ijtihad 'ditutup'\n2) Bagaimana ulama modern mengkritik pandangan ini\n3) Bukti historis dari kedua sisi\n4) Apa implikasinya untuk Fiqh Islam kontemporer\n5) Bagaimana Al-Azhar sendiri memposisikan diri dalam perdebatan ini",
        },
      ],
    },
  },

  hadith: {
    discussion: {
      tip: "Diskusikan implikasi status hadith — bukan hanya statusnya. Kalau hadith ini dhaif, lalu apa? Apakah tetap ada amalan yang berdasarkan hadith dhaif? Ini diskusi Musthalah yang tajam.",
      prompts: [
        {
          label: "Diskusi Implikasi Status Hadith",
          text: "Aku menemukan bahwa hadith [TEKS HADITH SINGKAT] statusnya [DHAIF/HASAN/SHAHIH menurut ulama tertentu]. Aku mau diskusi:\n\n1) Aku ajukan pendapatku tentang implikasi status ini\n2) Kamu respons — apakah ada ulama yang berbeda penilaian?\n3) Bagaimana praktik amalan berdasarkan hadith ini di kalangan ulama?\n\nKita diskusikan 3-4 putaran.",
        },
        {
          label: "Debat Metodologi Jarh wa Ta'dil",
          text: "Diskusikan perdebatan metodologis dalam Jarh wa Ta'dil tentang [MASALAH: takhrij suatu rawi / perbedaan ulama dalam menilai / dll].\n\nAku pegang posisi bahwa [PENDAPATKU]. Kamu berikan perspektif yang berbeda dengan bukti dari kitab Rijal. Kita cari titik temu di akhir.",
        },
      ],
    },
    summary: {
      tip: "Setelah memahami suatu istilah Musthalah, buat kartu ringkas: nama, definisi, contoh, dan hukum pengamalan. Ini yang jadi bank kartu murajaahmu.",
      prompts: [
        {
          label: "Kartu Istilah Musthalah Hadith",
          text: "Buat KARTU ISTILAH untuk [DAFTAR ISTILAH MUSTHALAH] yang perlu aku kuasai:\n\nFormat tiap istilah:\nNAMA: [Arab + transliterasi]\nDEFINISI: [1-2 kalimat]\nCONTOH: [nama kitab/hadith konkret]\nHUKUM PENGAMALAN: [bisa diamalkan atau tidak, menurut jumhur]\nPERBEDAAN dengan istilah yang serupa:\n\nBuat untuk semua istilah dalam daftar.",
        },
        {
          label: "Rangkuman Bab Musthalah",
          text: "Aku selesai belajar bab [BAB MUSTHALAH HADITH]. Buat RANGKUMAN SISTEMATIS:\n\n1) Konsep utama bab ini\n2) Pembagian/taqsim dalam bab ini (format hierarki)\n3) Semua istilah yang muncul beserta definisi singkatnya\n4) Hubungan antar istilah (mana yang sering dikacaukan)\n5) 5 pertanyaan yang paling mungkin keluar di ujian\n\nFormat yang mudah dibaca sekilas.",
        },
      ],
    },
    visual: {
      tip: "Minta bagan hierarki klasifikasi hadith — dari shahih ke dhaif, semua cabangnya. Melihat gambaran besar klasifikasi ini secara visual jauh lebih membantu daripada membaca daftarnya.",
      prompts: [
        {
          label: "Bagan Hierarki Klasifikasi Hadith",
          text: "Buat BAGAN HIERARKI lengkap klasifikasi hadith dari sudut pandang Musthalah:\n\nLevel 1: Pembagian berdasarkan kekuatan (Shahih, Hasan, Dhaif, Mawdhu')\nLevel 2: Sub-klasifikasi tiap level\nLevel 3: Istilah-istilah spesifik di tiap sub-klasifikasi\n\nFormat: indentasi bertingkat yang bisa dijadikan mind map. Setelah bagan, buat tabel perbandingan: Jenis | Definisi | Hukum Pengamalan.",
        },
        {
          label: "Diagram Alur Takhrij Hadith",
          text: "Buat DIAGRAM ALUR (format teks dengan panah/step) untuk proses takhrij hadith secara sistematis:\n\nStep 1 → Step 2 → ... → Kesimpulan\n\nSertakan: cara mulai pencarian, alat yang digunakan (kitab/digital), cara menilai sanad, cara menilai matan, cara menyimpulkan status. Buat praktis untuk Masisir yang punya akses Maktabah Syamilah.",
        },
      ],
    },
    practice: {
      tip: "Latihan takhrij langsung dari teks — paste hadith, coba analisis sendiri dulu, baru cek dengan Perplexity/Claude. Kemampuan takhrij hanya terbentuk dari praktik berulang.",
      prompts: [
        {
          label: "Latihan Analisis Sanad",
          text: "Aku mau latihan analisis sanad. Berikan sanad fiktif atau nyata yang bisa dianalisis:\n\nSANAD: [Claude yang berikan]\n\nAku akan:\n1) Identifikasi tiap rawi dalam sanad\n2) Nilai tingkat kualitas sanad berdasarkan apa yang aku tahu\n3) Identifikasi potensi masalah dalam sanad\n\nKoreksi analisisku dan jelaskan bagaimana cara menilai sanad yang tepat.",
        },
        {
          label: "Drill Istilah Musthalah: Soal Identifikasi",
          text: "Drill identifikasi istilah Musthalah Hadith. Berikan deskripsi karakteristik suatu hadith — aku sebutkan nama istilahnya.\n\nContoh format pertanyaan: 'Hadith yang sanadnya terputus antara tabi'in dan Nabi, tanpa menyebut sahabat. Istilah apa ini?'\n\nBuat 10 pertanyaan identifikasi dengan tingkat kesulitan bertahap. Berikan satu per satu, aku jawab, kamu koreksi.",
        },
      ],
    },
    memorization: {
      tip: "Hafal istilah Musthalah dengan pasangan: nama istilah + definisi kilat + satu contoh hadith yang konkret. Tiga elemen ini yang paling sering muncul di soal ujian.",
      prompts: [
        {
          label: "Hafalan Paket: Istilah + Definisi + Contoh",
          text: "Buat DAFTAR HAFALAN paket untuk [KUMPULAN ISTILAH MUSTHALAH HADITH] yang wajib kuasai:\n\nFormat tiap istilah:\n[ISTILAH ARAB]: [Definisi dalam 8-10 kata Indonesia] | Contoh: [nama hadith/kitab konkret]\n\nUrutkan dari yang paling fundamental ke yang lebih spesifik. Buat semua dalam satu daftar yang bisa aku scan dalam 5 menit.",
        },
        {
          label: "Quiz Hafalan Musthalah",
          text: "Quiz hafalan Musthalah Hadith — kamu berikan definisi, aku jawab nama istilahnya.\n\nScope: [BAGIAN MUSTHALAH YANG SUDAH AKU PELAJARI]\n\nAturan: kalau aku ragu-ragu, berikan petunjuk pertama saja (jangan langsung kasih jawaban). Di akhir 10 pertanyaan, beri laporan mana yang masih lemah untuk aku prioritaskan murajaah.",
        },
      ],
    },
    reading: {
      tip: "Baca kitab Musthalah dengan pertanyaan: 'Mengapa perbedaan istilah ini penting secara praktis?' Claude bisa bantu menjawab ini dan menjaga bacaanmu tetap relevan.",
      prompts: [
        {
          label: "Relevansi Praktis Istilah Musthalah",
          text: "Aku sedang baca tentang istilah Musthalah [NAMA ISTILAH]. Setelah aku baca definisinya, bantu aku memahami:\n\n1) Mengapa perbedaan antara istilah ini dengan istilah yang mirip itu PENTING secara praktis — apa yang berubah di level hukum Fiqh?\n2) Siapa ulama yang paling ketat dalam menerapkan definisi ini?\n3) Bagaimana ulama modern (seperti Al-Albani) berbeda pendapat tentang istilah ini?\n4) Contoh kasus nyata di mana definisi ini menentukan perbedaan hukum",
        },
        {
          label: "Telaah Kitab Musthalah Klasik",
          text: "Aku mau telaah teks dari [KITAB MUSTHALAH: Muqaddimah Ibn Salah / Nukhbah al-Fikr / dll], bagian tentang [TOPIK]:\n\n[PASTE TEKS]\n\nBantu aku:\n1) Terjemahkan dan jelaskan setiap klaim utama\n2) Bandingkan definisi penulis ini dengan ulama Musthalah lainnya\n3) Istilah teknis mana yang wajib aku hafalkan dari teks ini\n4) Pertanyaan diskusi yang bisa aku bawa ke kelas",
        },
      ],
    },
  },

  tafsir: {
    discussion: {
      tip: "Diskusikan mengapa mufassir berbeda pendapat — bukan hanya apa perbedaannya. Metodologi yang berbeda (bil-ma'tsur vs bil-ra'yi, pendekatan linguistik vs maqashid) menghasilkan tafsir yang berbeda.",
      prompts: [
        {
          label: "Diskusi Metodologi Mufassir",
          text: "Aku mau diskusi mengapa [MUFASSIR A] dan [MUFASSIR B] berbeda dalam menafsirkan [QS SURAH:AYAT].\n\nAku mulai dengan analisis metodologiku. Kamu tambahkan faktor yang mungkin aku lewatkan — terutama dari sisi latar belakang keilmuan mufassir. Kita diskusikan sampai mendapat gambaran yang lebih dalam dari sekadar 'mereka berbeda pendapat'.",
        },
        {
          label: "Debat: Tafsir bil-Ma'tsur vs bil-Ra'yi",
          text: "Kita debat pertanyaan klasik Ulum Al-Quran: manakah yang lebih otoritatif — tafsir bil-ma'tsur atau tafsir bil-ra'yi?\n\nAku pegang posisi bahwa [PILIHANKU]. Kamu pegang posisi yang berlawanan. Setelah debat 3 putaran, kita lihat bagaimana ulama Azhari memposisikan perdebatan ini.",
        },
      ],
    },
    summary: {
      tip: "Setelah mengkaji suatu ayat dari beberapa mufassir, buat tabel perbandingan yang ringkas. Ini format yang paling mudah untuk murajaah tafsir.",
      prompts: [
        {
          label: "Tabel Perbandingan Tafsir Ayat",
          text: "Buat TABEL PERBANDINGAN tafsir untuk ayat [QS SURAH:AYAT]:\n\nKolom: Mufassir | Pendekatan | Tafsir Utama | Dalil/Argumen | Catatan Khusus\nBaris: Al-Thabari, Ibn Katsir, Al-Zamakhsyari, Ibn Asyur\n\nSetelah tabel, ringkaskan: apa inti perbedaan di antara mereka, dan tafsir mana yang paling kuat menurut jumhur ulama.",
        },
        {
          label: "Rangkuman Konsep Ulum Al-Quran",
          text: "Buat RANGKUMAN SISTEMATIS untuk konsep Ulum Al-Quran: [KONSEP]\n\n1) Definisi dan pembagian/taqsim\n2) Dalil dari Al-Quran atau Sunnah yang menjadi dasar\n3) Contoh ayat-ayat yang masuk kategori ini\n4) Implikasi untuk praktik penafsiran\n5) Perbedaan pendapat ulama tentang definisi atau penerapan\n6) Poin yang paling sering keluar di ujian",
        },
      ],
    },
    visual: {
      tip: "Visualisasikan perbedaan metodologi mufassir dalam bentuk bagan — siapa menggunakan pendekatan apa, dan apa hasilnya. Ini membantu kamu 'melihat' lanskap Tafsir secara menyeluruh.",
      prompts: [
        {
          label: "Bagan Metodologi Para Mufassir",
          text: "Buat BAGAN yang menempatkan mufassir-mufassir utama berdasarkan metodologi mereka:\n\nDimensi 1: Bil-ma'tsur ←→ Bil-ra'yi\nDimensi 2: Linguistik/Balaghah ←→ Maqashid/Kontekstual\n\nLetakkan: Al-Thabari, Ibn Katsir, Al-Zamakhsyari, Al-Razi, Ibn Asyur, Al-Qurtubi, Sayyid Qutb di posisi yang tepat. Jelaskan mengapa kamu menempatkan mereka di situ.",
        },
        {
          label: "Bagan Ulum Al-Quran Komprehensif",
          text: "Buat BAGAN HIERARKI lengkap cabang-cabang Ulum Al-Quran:\n\nLevel 1: Kategori besar Ulum Al-Quran\nLevel 2: Sub-bidang tiap kategori\nLevel 3: Contoh/istilah kunci di tiap sub-bidang\n\nFormat: indentasi bertingkat yang komprehensif namun tetap bisa dipindai dalam 5 menit.",
        },
      ],
    },
    practice: {
      tip: "Latihan terbaik untuk Tafsir adalah: ambil satu ayat, tafsirkan sendiri dulu dari sudut Balaghah dan konteks, baru bandingkan dengan mufassir. Ini melatih kemampuan analitis yang diuji di Ushuluddin.",
      prompts: [
        {
          label: "Latihan Analisis Ayat Mandiri",
          text: "Berikan satu ayat Al-Quran yang menarik untuk dianalisis dari perspektif Tafsir Azhari. Aku akan:\n\n1) Terjemahkan dan pahami makna literal\n2) Identifikasi unsur Balaghah yang menarik\n3) Sebutkan asbab nuzul jika aku tahu\n4) Tunjukkan aspek Ulum Al-Quran yang relevan\n5) Berikan tafsir singkatku sendiri\n\nBaru setelah aku selesai, kamu bandingkan dengan tafsir mufassir yang relevan dan evaluasi analisisku.",
        },
        {
          label: "Soal Ujian Tafsir Azhari",
          text: "Buat 4 soal ujian Tafsir seperti format ujian Al-Azhar tentang [TOPIK/SURAH]:\n\n1) 'Tafsirkan ayat [X] dan bandingkan pendekatan Ibn Katsir dengan Al-Zamakhsyari'\n2) 'Jelaskan konsep [Ulum Al-Quran] beserta contohnya'\n3) 'Apa asbab nuzul ayat ini dan bagaimana pengaruhnya pada makna'\n4) 'Identifikasi aspek I'jaz dalam ayat ini'\n\nAku tulis jawaban singkat, kamu evaluasi.",
        },
      ],
    },
    memorization: {
      tip: "Hafal nama mufassir + pendekatan + karya utama sebagai satu paket. Ini yang paling sering ditanya — bukan penjelasan panjang tafsir mereka.",
      prompts: [
        {
          label: "Hafalan Profil Mufassir Utama",
          text: "Buat KARTU PROFIL untuk mufassir-mufassir yang wajib dikuasai di Tafsir Azhari:\n\nAl-Thabari, Ibn Katsir, Al-Zamakhsyari, Al-Razi, Ibn Asyur, Al-Qurtubi, Sayyid Qutb\n\nFormat tiap mufassir:\nNAMA: | WAFAT: | MAZHAB: | KITAB: | PENDEKATAN: [1-3 kata] | KEISTIMEWAAN: [satu kalimat]\n\nBuat dalam format yang mudah dihafal dan dibandingkan.",
        },
        {
          label: "Hafalan Konsep Ulum Al-Quran Kilat",
          text: "Buat DAFTAR HAFALAN untuk istilah-istilah Ulum Al-Quran yang paling sering muncul di ujian:\n\n[DAFTAR ISTILAH]\n\nFormat: ISTILAH (Arab): DEFINISI KILAT (5-8 kata) | CONTOH AYAT\n\nUrut dari yang paling sering keluar di ujian Al-Azhar. Buat dalam satu daftar yang bisa dipindai cepat.",
        },
      ],
    },
    reading: {
      tip: "Baca tafsir dengan pertanyaan aktif: 'Dalil apa yang dipakai mufassir ini? Mengapa ia memilih makna ini dan bukan yang lain?' Claude bisa bantu merumuskan pertanyaan sebelum kamu baca.",
      prompts: [
        {
          label: "Pertanyaan Aktif Sebelum Baca Tafsir",
          text: "Aku akan membaca tafsir [KITAB: Al-Jami' Al-Bayan / Tafsir Ibn Katsir / dll] untuk surah/ayat [QS SURAH:AYAT].\n\nSebelum aku baca, berikan:\n1) Konteks ayat ini dalam satu paragraf\n2) 3-4 pertanyaan kritis yang harus aku cari jawabannya saat baca\n3) Hal-hal yang perlu aku perhatikan khusus dari metode [mufassir ini]\n4) Poin perbedaan yang mungkin aku temukan dengan mufassir lain",
        },
        {
          label: "Telaah Teks Tafsir Mendalam",
          text: "Aku punya paragraf dari [KITAB TAFSIR] yang susah aku pahami:\n\n[PASTE TEKS ARAB]\n\nBantu aku:\n1) Terjemahkan dengan mempertahankan istilah teknis\n2) Identifikasi argumen utama mufassir di sini\n3) Dalil apa yang ia gunakan (eksplisit dan tersirat)\n4) Apakah ada mufassir lain yang berbeda pendapat tentang ini?\n5) Apa kesimpulan yang harus aku catat?",
        },
      ],
    },
  },

  aqidah: {
    discussion: {
      tip: "Diskusikan argumen Kalam secara aktif — bukan hanya menerima penjelasan. Tantang Claude untuk berikan keberatan terhadap argumen Asy'ariyyah, lalu kamu yang menjawab. Ini cara ulama Kalam berdebat.",
      prompts: [
        {
          label: "Simulasi Debat Kalam: Aku vs Mu'tazilah",
          text: "Aku mahasiswa Kalam Asy'ari. Kamu mainkan peran mutakallim Mu'tazilah yang mengajukan keberatan terhadap posisi Asy'ariyyah tentang [MASALAH KALAM: sifat Allah / af'al al-ibad / dll].\n\nAku yang akan merespons dan membela posisi Asy'ariyyah. Setelah 3-4 putaran debat, berikan evaluasi: seberapa kuat argumenku secara ilmiah Kalam?",
        },
        {
          label: "Diskusi Syubhat dan Respons Ilmiah",
          text: "Aku mau latihan menjawab syubhat secara ilmiah.\n\nSyubhat: [KEBERATAN TENTANG AQIDAH]\n\nAku akan menjawab syubhat ini dengan cara Asy'ariyyah. Kamu berikan counter-argument yang lebih kuat dari pihak yang berkeberatan. Kita 3 putaran — aku terus perkuat jawabanku. Di akhir, evaluasi: apakah jawabanku sudah cukup kuat secara akademis Kalam?",
        },
      ],
    },
    summary: {
      tip: "Buat peta argumen untuk setiap masalah Kalam yang dipelajari: posisi tiap aliran + dalil utama + respons terhadap aliran lain. Ini format rangkuman terbaik untuk Aqidah.",
      prompts: [
        {
          label: "Peta Argumen Kalam",
          text: "Buat PETA ARGUMEN untuk masalah Kalam: [MASALAH]\n\nFormat:\n1) ASY'ARIYYAH: posisi → dalil aqli → dalil naqli → respons terhadap Mu'tazilah\n2) MATURIDIYYAH: posisi → di mana berbeda dengan Asy'ariyyah\n3) MU'TAZILAH: posisi → argumen mereka → kelemahan argumen (menurut Asy'ari)\n\nBuat ringkas tapi komprehensif — bisa dibaca dalam 3 menit.",
        },
        {
          label: "Kartu Sifat Allah: Satu Sifat Satu Kartu",
          text: "Buat KARTU SIFAT untuk tiap sifat dalam [DAFTAR SIFAT ALLAH]:\n\nFormat tiap kartu:\nSIFAT: [Arab + arti]\nKLASIFIKASI: [dzatiyyah/ma'nawiyyah/fi'liyyah/khabariyyah]\nDALIL AQLI: [argumen akal dalam 1-2 kalimat]\nDALIL NAQLI: [ayat/hadith utama]\nTA'WIL: [bagaimana Asy'ariyyah memahaminya, jika sifat khabariyyah]\nBEDA MATURIDIYYAH: [jika ada perbedaan]\n\nBuat 5 kartu sekaligus.",
        },
      ],
    },
    visual: {
      tip: "Buat bagan posisi aliran Kalam — ini visual yang sangat membantu untuk memahami lanskap perdebatan. Siapa berada di mana dalam spektrum isu-isu utama Kalam.",
      prompts: [
        {
          label: "Bagan Posisi Aliran Kalam",
          text: "Buat BAGAN PERBANDINGAN aliran-aliran Kalam dalam format tabel:\n\nBaris: Isu-isu utama Kalam [sifat Allah / af'al al-ibad / kehendak manusia / ru'yatullah / dll]\nKolom: Asy'ariyyah | Maturidiyyah | Mu'tazilah | (Salafiyyah jika relevan)\n\nIsi tiap sel dengan posisi singkat (1-3 kata). Tandai sel yang merupakan perbedaan paling signifikan.",
        },
        {
          label: "Hierarki Sifat Allah",
          text: "Buat BAGAN HIERARKI klasifikasi sifat Allah menurut ulama Asy'ariyyah:\n\nLevel 1: Kategori besar sifat (dzatiyyah, ma'nawiyyah, fi'liyyah, khabariyyah)\nLevel 2: Sifat-sifat yang termasuk di tiap kategori\nLevel 3: Dalil utama + lawan sifat (mustahil)\n\nFormat: indentasi bertingkat yang komprehensif.",
        },
      ],
    },
    practice: {
      tip: "Latihan jawab syubhat adalah latihan terbaik untuk Kalam. Minta Claude berikan syubhat, kamu jawab, baru evaluasi. Ini yang diuji di ujian Ushuluddin.",
      prompts: [
        {
          label: "Drill Jawab Syubhat Kalam",
          text: "Latihan menjawab syubhat Aqidah. Berikan 4 syubhat yang berbeda tentang [TOPIK AQIDAH: eksistensi Allah / sifat Allah / takdir / dll] — dari yang mudah ke yang sulit.\n\nAku jawab setiap syubhat dengan respons Asy'ariyyah. Kamu evaluasi: apakah dalil yang aku gunakan tepat? Apakah ada argumen yang lebih kuat yang aku lewatkan?",
        },
        {
          label: "Soal Ujian Kalam Al-Azhar",
          text: "Buat 4 soal ujian Kalam/Aqidah seperti format ujian Al-Azhar Ushuluddin:\n\n1) Definisi dan pembagian [konsep]\n2) Dalil aqli dan naqli untuk [masalah]\n3) Bandingkan posisi Asy'ariyyah dan Mu'tazilah tentang [masalah]\n4) Jawab syubhat: 'Kalau Allah Maha Kuasa, mengapa ada kejahatan di dunia?'\n\nAku tulis jawaban, kamu evaluasi dan tambahkan yang kurang.",
        },
      ],
    },
    memorization: {
      tip: "Hafal nama sifat + klasifikasinya + dalil kilat dalam satu paket. Ujian Aqidah sangat sering meminta tiga hal ini sekaligus.",
      prompts: [
        {
          label: "Hafalan Sifat Allah: Paket Lengkap",
          text: "Buat DAFTAR HAFALAN sifat-sifat Allah menurut Asy'ariyyah dalam format paket:\n\nSIFAT (Arab) | ARTI | KLASIFIKASI | DALIL KILAT (3-5 kata dari ayat/hadith) | LAWANNYA (mustahil)\n\nBuat semua sifat yang wajib dikuasai untuk ujian Al-Azhar Aqidah. Urutkan berdasarkan klasifikasi.",
        },
        {
          label: "Hafalan Poin Perbedaan Asy'ari-Maturidi",
          text: "Buat DAFTAR HAFALAN poin-poin perbedaan Asy'ariyyah dan Maturidiyyah yang paling sering keluar di ujian:\n\nFormat: MASALAH → ASY'ARI: [posisi singkat] ↔ MATURIDI: [posisi singkat]\n\nFokus pada perbedaan, bukan persamaan. Buat sesederhana mungkin — 8-10 poin yang sering ditanya.",
        },
      ],
    },
    reading: {
      tip: "Baca teks Aqidah dengan pertanyaan: 'Argumen apa yang sedang dibangun, dan keberatan apa yang sedang dijawab?' Kalam adalah respons terhadap tantangan — memahami tantangannya bikin teksnya jauh lebih hidup.",
      prompts: [
        {
          label: "Konteks Polemik Sebelum Baca Kalam",
          text: "Aku akan membaca teks Kalam/Aqidah tentang [TOPIK]. Sebelum baca, jelaskan:\n\n1) Keberatan atau tantangan apa yang sedang coba dijawab teks ini?\n2) Dari aliran mana tantangan itu datang?\n3) Argumen apa yang akan dibangun oleh Asy'ariyyah dalam merespons?\n4) Istilah-istilah teknis yang harus aku pahami sebelum baca\n\nSetelah baca, aku kembali untuk evaluasi apakah aku berhasil menangkap argumen utamanya.",
        },
        {
          label: "Telaah Mendalam Teks Matan Aqidah",
          text: "Aku mau telaah teks dari [KITAB: Umm Al-Barahin / Al-Sanusiyyah / dll]:\n\n[PASTE TEKS]\n\nBantu aku:\n1) Identifikasi klaim utama yang dibuat penulis\n2) Argumen logis yang digunakan (aqli dan naqli)\n3) Istilah teknis Kalam yang muncul dan artinya\n4) Apakah ada aliran lain yang menolak argumen ini?\n5) Apa yang perlu aku hafalkan dari teks ini untuk ujian",
        },
      ],
    },
  },

  sirah: {
    discussion: {
      tip: "Diskusikan hikmah dari peristiwa Sirah — bukan hanya kronologinya. 'Mengapa Nabi memilih strategi ini?' lebih menarik dan lebih sering diuji daripada 'kapan peristiwa ini terjadi?'",
      prompts: [
        {
          label: "Diskusi Hikmah Strategis Sirah",
          text: "Aku mau diskusi hikmah strategis dari peristiwa [PERISTIWA SIRAH]. Aku mulai dengan analisisku tentang mengapa Nabi membuat keputusan tertentu. Kamu respons — apakah ada faktor lain yang aku lewatkan? Atau perspektif ulama Sirah yang berbeda? Kita diskusikan 3-4 putaran.",
        },
        {
          label: "Debat: Apakah Keputusan di [Peristiwa] Sudah Optimal?",
          text: "Kita diskusikan keputusan Nabi di [PERISTIWA SIRAH]. Aku akan berargumen bahwa keputusan itu mengandung wisdom yang sangat mendalam. Kamu berikan perspektif kritis — bagaimana pandangan ulama tentang ijtihad Nabi di sini dan apa yang bisa dipelajari darinya?\n\nFokus pada bagaimana ulama memahami 'ijtihad Nabi' dalam Sirah.",
        },
      ],
    },
    summary: {
      tip: "Buat kartu satu halaman per peristiwa besar: latar belakang, kronologi singkat, hasil, hikmah. Ini format murajaah Sirah yang paling efisien.",
      prompts: [
        {
          label: "Kartu Peristiwa Sirah",
          text: "Buat KARTU PERISTIWA untuk [PERISTIWA/GHAZWAH]:\n\nNAMA: [Arab + Indonesia]\nWAKTU: [tahun Hijriyyah + konteks]\nLATAR BELAKANG: [2-3 kalimat]\nKRONOLOGI KILAT: [5-7 poin urutan penting]\nTOKOH KUNCI: [nama + peran singkat]\nHASIL: [apa yang terjadi akhirnya]\nHIKMAH: [3 pelajaran terpenting]\n\nBuat kartu yang bisa dibaca dalam 2 menit.",
        },
        {
          label: "Rangkuman Satu Periode Sirah",
          text: "Buat RANGKUMAN KOMPREHENSIF periode Sirah: [NAMA PERIODE, misal: Fase Makkah / Fase Awal Madinah]\n\n1) Rentang waktu dan kondisi umum\n2) Peristiwa-peristiwa kunci dalam urutan kronologis\n3) Tokoh-tokoh penting yang muncul di periode ini\n4) Perubahan strategi dakwah/kepemimpinan Nabi di periode ini\n5) Hikmah besar dari keseluruhan periode",
        },
      ],
    },
    visual: {
      tip: "Timeline Sirah dengan penanda peristiwa adalah alat belajar visual yang paling efektif. Minta Claude buat ini, lalu kamu gambar ulang di kertas dengan tangan.",
      prompts: [
        {
          label: "Timeline Sirah Visual",
          text: "Buat TIMELINE VISUAL (format teks dengan penanda) untuk periode Sirah [PERIODE]:\n\n- Tandai setiap peristiwa penting dengan tahun\n- Kelompokkan per fase (Makkah / Madinah / dst)\n- Tandai 'turning point' yang mengubah arah dakwah\n- Sertakan nama tokoh kunci di tiap periode\n\nFormat: garis waktu horizontal dengan event di atas dan bawah.",
        },
        {
          label: "Peta Tokoh Sirah dan Perannya",
          text: "Buat PETA TOKOH untuk Sirah Nabawiyyah yang terdiri dari:\n\n1) Tabel: Nama | Kategori (sahabat/musuh/munafik) | Peran Utama | Peristiwa Paling Terkait\n2) Khusus 10 sahabat utama (Asharatu al-Mubasysyarun): nama → karakteristik utama → peristiwa paling dikenal\n\nFormat: mudah dipindai dan dibandingkan.",
        },
      ],
    },
    practice: {
      tip: "Drill hafalan fakta Sirah dengan format cepat — kamu jawab, bukan kamu baca. Ini yang mempersiapkan kamu untuk ujian syafahi maupun tahriri.",
      prompts: [
        {
          label: "Drill Fakta Sirah: Quiz Cepat",
          text: "Quiz cepat fakta Sirah: kamu berikan pertanyaan singkat, aku jawab dalam 1-2 kalimat.\n\nScope: [PERIODE/TOPIK]\nFormat pertanyaan: 'Kapan X terjadi?' / 'Siapa yang memimpin Y?' / 'Apa hasil dari Z?'\n\nBerikan 12 pertanyaan berturut-turut. Di akhir, beri laporan: fakta mana yang paling lemah untuk aku fokuskan murajaah.",
        },
        {
          label: "Soal Analisis Hikmah Sirah",
          text: "Buat 4 soal analisis hikmah Sirah tentang [TOPIK]:\n\n1) 'Apa hikmah di balik keputusan Nabi di [peristiwa]?'\n2) 'Bagaimana perkembangan strategi dakwah Nabi dari Makkah ke Madinah?'\n3) 'Apa yang bisa dipelajari dari kepemimpinan Nabi di [ghazwah/situasi]?'\n4) 'Bagaimana respons Nabi terhadap [ujian/tantangan] mengajarkan kita tentang [nilai]?'\n\nAku tulis jawaban, kamu evaluasi.",
        },
      ],
    },
    memorization: {
      tip: "Hafal peristiwa dengan sistem 'anchor' — satu fakta kunci per peristiwa yang kalau kamu ingat, semua detail lain ikut menyusul. ChatGPT bisa bantu kamu menemukan 'anchor' yang tepat.",
      prompts: [
        {
          label: "Sistem Anchor Hafalan Sirah",
          text: "Bantu aku buat sistem hafalan 'anchor' untuk peristiwa-peristiwa Sirah:\n\n[DAFTAR PERISTIWA]\n\nUntuk tiap peristiwa, berikan:\n1) ANCHOR: satu fakta paling mudah diingat dan paling distinctive\n2) RANTAI: 3 detail penting yang terhubung dari anchor ini\n3) CARA INGAT: mnemonic atau asosiasi yang membantu\n\nPrinsip: satu anchor yang kuat lebih baik dari 10 fakta yang tidak saling terhubung.",
        },
        {
          label: "Hafalan Urutan Ghazawat",
          text: "Buat DAFTAR HAFALAN urutan ghazawat Nabi yang paling penting:\n\nFormat: NO. | NAMA | TAHUN HIJRIYYAH | SATU FAKTA KUNCI\n\nUrutkan kronologis. Fokus pada ghazawat yang paling sering muncul di ujian Al-Azhar. Tambahkan cara mengingat urutan ini (mnemonic atau pola).",
        },
      ],
    },
    reading: {
      tip: "Baca Sirah dengan pertanyaan: 'Apa yang sedang dihadapi Nabi saat ini, dan bagaimana keputusannya mencerminkan kecerdasan kepemimpinan?' Claude bisa bantu menyiapkan pertanyaan ini sebelum kamu baca.",
      prompts: [
        {
          label: "Pertanyaan Kepemimpinan Sebelum Baca Sirah",
          text: "Aku akan membaca tentang [PERISTIWA SIRAH] dari maqarrar. Sebelum baca, berikan:\n\n1) Konteks: kondisi umat Islam saat peristiwa ini terjadi\n2) Tantangan utama yang dihadapi Nabi\n3) Pertanyaan kepemimpinan yang harus aku cari jawabannya saat baca\n4) Tokoh-tokoh yang berperan dan latar belakangnya\n\nSetelah baca, aku kembali untuk diskusi analisis.",
        },
        {
          label: "Telaah Hikmah Mendalam dari Peristiwa",
          text: "Aku mau telaah mendalam hikmah dari [PERISTIWA SIRAH].\n\nBukan sekadar 'apa yang terjadi' — tapi:\n1) Mengapa situasi ini terjadi (faktor internal dan eksternal)\n2) Pilihan-pilihan yang ada dan mengapa Nabi memilih jalan tertentu\n3) Dampak jangka pendek dan jangka panjang dari keputusan ini\n4) Hikmah untuk kepemimpinan dan dakwah yang bisa diambil\n5) Bagaimana ulama Sirah modern memandang peristiwa ini",
        },
      ],
    },
  },

  mantiq: {
    discussion: {
      tip: "Debatkan validitas argumen — berikan argumen dan minta Claude cari 'lubang' logikanya. Ini cara belajar Mantiq yang paling efektif dan menyenangkan.",
      prompts: [
        {
          label: "Cari Kelemahan Argumenku",
          text: "Aku punya argumen tentang [TOPIK]:\n\n[ARGUMEN DALAM BENTUK QIYAS MANTIQ]\n\nCari KELEMAHAN dalam argumenku — apakah muqaddamatnya valid? Apakah natijahnya benar-benar mengikuti? Apakah ada mughalathah (fallacy) yang aku lakukan? Aku akan perbaiki argumenku setelah kamu tunjukkan kelemahannya.",
        },
        {
          label: "Diskusi Aplikasi Mantiq ke Kalam",
          text: "Kita diskusikan bagaimana ulama Kalam menggunakan qiyas mantiq dalam argumen tentang [MASALAH AQIDAH].\n\nAku mulai dengan menunjukkan struktur qiyas yang aku kenali. Kamu tambahkan qiyas-qiyas lain yang digunakan ulama dan jelaskan mengapa Mantiq Aristotelian cocok digunakan dalam Kalam Islam.",
        },
      ],
    },
    summary: {
      tip: "Buat glossary Mantiq kamu sendiri — tiap istilah dengan definisi dan contoh. Ini fondasi yang kalau sudah solid, seluruh bab Mantiq jadi jauh lebih mudah.",
      prompts: [
        {
          label: "Glossary Istilah Mantiq",
          text: "Buat GLOSSARY TERSTRUKTUR untuk istilah-istilah Mantiq yang sudah aku pelajari dalam [BAB/TOPIK]:\n\nFormat tiap istilah:\nISTILAH (Arab): [definisi teknis singkat] | Contoh: [contoh konkret dan mudah dipahami]\n\nUrut dari yang paling fundamental (tasawwur, tashdiq, hadd...) ke yang lebih spesifik. Tandai istilah yang paling sering dikacaukan.",
        },
        {
          label: "Rangkuman Bab Mantiq Sistematis",
          text: "Aku selesai belajar bab [NAMA BAB MANTIQ]. Buat RANGKUMAN HIERARKI:\n\n1) Konsep utama bab ini\n2) Pembagian/taqsim (format bertingkat)\n3) Semua istilah teknis + definisi singkat\n4) Hubungan antar konsep dalam bab ini\n5) Contoh aplikasi ke argumen Kalam\n6) Poin yang paling sering keluar di ujian",
        },
      ],
    },
    visual: {
      tip: "Bagan struktur qiyas mantiq — muqaddimah kubra, muqaddimah shughra, natijah — jauh lebih mudah dipahami secara visual daripada deskripsi teks.",
      prompts: [
        {
          label: "Diagram Struktur Qiyas Mantiq",
          text: "Buat DIAGRAM STRUKTUR untuk jenis-jenis qiyas mantiq:\n\n1) Qiyas Iqtirani: diagram muqaddimah kubra → muqaddimah shughra → natijah\n2) Qiyas Istitsna'i: diagram dan cara kerjanya\n3) Contoh untuk tiap jenis — satu dari logika umum, satu dari Kalam Islam\n\nFormat visual yang bisa aku gambar ulang di kertas.",
        },
        {
          label: "Bagan Taqsim Konsep Mantiq",
          text: "Buat BAGAN TAQSIM untuk [KONSEP MANTIQ: dilalah / lafadz / hadd / qiyas dll]:\n\nFormat hierarki bertingkat:\nLevel 1: Konsep utama\nLevel 2: Pembagian pertama\nLevel 3: Sub-pembagian\nLevel 4: Definisi + contoh di tiap ujung\n\nSetelah bagan, buat tabel perbandingan untuk konsep di level yang sama.",
        },
      ],
    },
    practice: {
      tip: "Mantiq = matematika — kamu harus mengerjakan soal, bukan membaca penjelasan. Minta soal, jawab, koreksi. Ulangi sampai polanya terasa natural.",
      prompts: [
        {
          label: "Drill Membuat Qiyas Valid",
          text: "Latihan membuat qiyas mantiq. Berikan 3 'tema' — aku buat qiyas iqtirani yang valid untuk tiap tema:\n\nTema 1: [tentang alam/sains]\nTema 2: [tentang manusia/etika]\nTema 3: [tentang Kalam/aqidah]\n\nKoreksi tiap qiyas yang aku buat: apakah muqaddamat-nya valid? Apakah natijah benar-benar mengikuti? Identifikasi jika ada fasad (kecacatan logis).",
        },
        {
          label: "Identifikasi Mughalathah (Fallacy)",
          text: "Aku mau latihan mengidentifikasi mughalathah (fallacy). Berikan 6 argumen yang mengandung fallacy berbeda:\n\nAku identifikasi jenis mughalathah dan jelaskan letak kesalahannya. Berikan satu per satu — koreksi setelah aku jawab. Di akhir, beri rangkuman: jenis fallacy yang paling sering aku lewatkan.",
        },
      ],
    },
    memorization: {
      tip: "Hafal istilah Mantiq dengan pasangan Arab-Indonesia dan contoh langsung. Definisi yang bisa kamu ucapkan sambil menutup mata adalah definisi yang sudah masuk.",
      prompts: [
        {
          label: "Hafalan Formula Istilah Mantiq",
          text: "Buat DAFTAR HAFALAN formula untuk istilah-istilah Mantiq:\n\n[DAFTAR ISTILAH DALAM BAB YANG SAMA]\n\nFormat tiap istilah:\nARAB: [nama istilah] → INDONESIA: [terjemahan] → FORMULA: [definisi 5-7 kata] → CONTOH KILAT: [satu contoh]\n\nBuat dalam format yang bisa dihafalkan per baris.",
        },
        {
          label: "Quiz Mantiq: Istilah ↔ Definisi",
          text: "Quiz hafalan Mantiq: kamu berikan definisi atau ciri, aku jawab nama istilahnya.\n\nScope: [BAB MANTIQ]\n\nFormula pertanyaan: 'Ini adalah pernyataan yang mengandung hukm (penilaian) terhadap sesuatu. Apa namanya dalam Mantiq?'\n\nBuat 10 soal, berikan satu per satu. Di akhir, beri laporan: istilah mana yang paling lemah.",
        },
      ],
    },
    reading: {
      tip: "Baca teks Mantiq dengan pensil di tangan — garis bawahi setiap istilah teknis. Sebelum baca, minta Claude jelaskan istilah-istilah yang akan kamu temui.",
      prompts: [
        {
          label: "Persiapan Istilah Sebelum Baca Mantiq",
          text: "Aku akan membaca bagian [KITAB MANTIQ] tentang [TOPIK]. Sebelum baca, berikan:\n\n1) Istilah-istilah teknis Mantiq yang akan aku temui di bagian ini beserta definisinya\n2) Konsep-konsep yang harus aku kuasai sebagai prasyarat membaca bagian ini\n3) Pertanyaan analitis yang harus aku jawab saat baca\n4) Apa yang akan membedakan teks ini dari definisi standar yang umum diajarkan?",
        },
        {
          label: "Telaah Teks Mantiq: Analisis Argumen",
          text: "Bantu aku menganalisis teks Mantiq berikut:\n\n[PASTE TEKS ARAB ATAU TERJEMAHAN]\n\n1) Identifikasi struktur argumen: apa muqaddamat-nya dan apa natijah-nya?\n2) Apakah qiyas yang digunakan valid?\n3) Istilah teknis Mantiq yang muncul beserta fungsinya dalam argumen\n4) Apakah ada mughalathah (fallacy) dalam teks ini?\n5) Bandingkan dengan cara ulama Mantiq lain membangun argumen yang sama",
        },
      ],
    },
  },

  nahwu: {
    discussion: {
      tip: "Diskusikan kaidah yang kamu bingung — bukan hanya minta penjelasan ulang. Berikan contoh kalimat, klaim i'rab-mu, lalu minta Claude debat apakah ada kemungkinan i'rab lain.",
      prompts: [
        {
          label: "Diskusi Kaidah yang Membingungkan",
          text: "Aku bingung dengan kaidah Nahwu: [KAIDAH]. Aku coba pahami dengan cara ini: [PENJELASANKU]. Apakah pemahamanku sudah benar? Kalau ada yang salah, jangan langsung koreksi — berikan contoh kalimat yang menguji pemahamanku dulu. Biarkan aku yang temukan sendiri di mana kelirunya.",
        },
        {
          label: "Debat I'rab: Satu Kalimat Banyak Kemungkinan",
          text: "Aku punya kalimat Arab: [KALIMAT ARAB]. Aku i'rab kata [KATA] sebagai [POSISI I'RAB] karena [ALASANKU].\n\nApakah ada kemungkinan i'rab lain untuk kata ini? Kalau ya, jelaskan kaidah yang memungkinkan bacaan itu — dan mana yang lebih kuat dalam konteks kalimat ini.",
        },
      ],
    },
    summary: {
      tip: "Setelah belajar setiap bab Nahwu, buat tabel kaidah: nama konstruksi, cirinya, tanda i'rab, dan dua contoh. Ini yang jadi cheat sheet murajaahmu sebelum ujian.",
      prompts: [
        {
          label: "Tabel Kaidah per Bab Nahwu",
          text: "Aku selesai belajar bab [NAMA BAB NAHWU]. Buat TABEL KAIDAH:\n\nKolom: Nama Konstruksi | Pengertian | Tanda I'rab | Contoh 1 | Contoh 2 | Catatan/Pengecualian\n\nTambahkan di bawah: 3 kesalahan i'rab yang paling sering dilakukan mahasiswa dalam bab ini.",
        },
        {
          label: "Rangkuman Bab Nahwu dengan Contoh",
          text: "Buat RANGKUMAN TERSTRUKTUR bab [NAMA BAB NAHWU] yang mencakup:\n\n1) Definisi dan pengertian utama\n2) Semua kasus/jenis dalam bab ini (format hierarki)\n3) Tanda i'rab untuk tiap kasus\n4) Minimal 2 contoh kalimat per kasus\n5) Kaidah yang sering salah dan cara menghindarinya\n6) Hubungan bab ini dengan bab-bab yang sudah dipelajari",
        },
      ],
    },
    visual: {
      tip: "Minta diagram pohon i'rab untuk kalimat panjang. Melihat struktur kalimat secara visual (subjek, predikat, objek, keterangan, hubungan antar kata) jauh lebih membantu daripada deskripsi teks.",
      prompts: [
        {
          label: "Pohon I'rab Kalimat Panjang",
          text: "Buat POHON I'RAB (diagram struktur) untuk kalimat berikut:\n\n[KALIMAT ARAB]\n\nTunjukkan:\n- Jumlah fi'liyyah atau ismiyyah (inti kalimat)\n- Maf'ul, hal, tamyiz, dan elemen lain\n- Hubungan i'rab tiap kata ke kata yang me-'amal-inya\n\nFormat: pohon/hierarki bertingkat yang menunjukkan ketergantungan antar kata.",
        },
        {
          label: "Tabel Visual Tanda I'rab",
          text: "Buat TABEL VISUAL komprehensif semua tanda i'rab dalam bahasa Arab:\n\nKolom: Keadaan I'rab | Tanda Asli | Tanda Pengganti (Kata Benda Tak Tertentu) | Tanda Pengganti (Asma' Sittah) | Tanda Pengganti (Jamak Mudzakkar Salim) | Tanda Pengganti (Mutsanna)\n\nBuat selengkap mungkin dalam format yang bisa jadi referensi cepat.",
        },
      ],
    },
    practice: {
      tip: "Satu kalimat, satu giliran — jangan minta 10 kalimat sekaligus. Jawab i'rab lengkap (posisi, tanda, kaidah), baru minta koreksi. Repetisi ini yang membangun kemampuan.",
      prompts: [
        {
          label: "Drill I'rab Interaktif Bertahap",
          text: "Aku mau drill i'rab. Berikan kalimat Arab SATU PER SATU dengan tingkat kesulitan bertahap:\n\nKalimat 1-3: Sederhana (jumlah fi'liyyah/ismiyyah dasar)\nKalimat 4-6: Menengah (ada hal, tamyiz, atau 'athf)\nKalimat 7-8: Sulit (teks dari Quran atau maqarrar)\n\nAku i'rab setiap kata dengan format: [Kata] — [Jenis] — [Posisi I'rab] — [Tanda] — [Kaidah]. Koreksi setelah aku jawab. Mulai dari kalimat 1.",
        },
        {
          label: "Drill Tashrif Interaktif",
          text: "Latihan tashrif interaktif. Berikan fi'il satu per satu — aku tashrif lengkap:\n\n[Fi'il yang diberikan Claude]\n\nAku tashrif: Fi'il Madhi (semua dhamir) → Fi'il Mudhari' (marfu') → Fi'il Amr. Koreksi setelah aku selesai tiap fi'il. Mulai dengan fi'il [JENIS: shahih / mu'tall / mudha'af] — berikan fi'ilnya.",
        },
      ],
    },
    memorization: {
      tip: "Hafal kaidah Nahwu dalam kalimat singkat dan langsung hubungkan ke tanda i'rab-nya. Kaidah yang bisa kamu ucapkan dalam 5 detik + langsung ingat contohnya adalah kaidah yang sudah masuk.",
      prompts: [
        {
          label: "Hafalan Kaidah + Tanda + Contoh Kilat",
          text: "Buat DAFTAR HAFALAN kaidah i'rab untuk [BAB NAHWU] dalam format ultra-ringkas:\n\nKONSTRUKSI → TANDA I'RAB → KALIMAT CONTOH (5-7 kata)\n\nBuat untuk semua kasus dalam bab ini. Sesederhana dan sepadat mungkin. Ini untuk hafalan, bukan pemahaman mendalam.",
        },
        {
          label: "Quiz: Kaidah ↔ Tanda I'rab",
          text: "Quiz hafalan Nahwu: kamu sebutkan konstruksi atau posisi, aku jawab tanda i'rab-nya.\n\nContoh pertanyaan: 'Apa tanda rafa' isim mufrad?' / 'Apa tanda nashb mutsanna?'\n\nBuat 12 pertanyaan dengan scope [BAB/TINGKAT YANG SUDAH DIPELAJARI]. Berikan satu per satu. Kalau aku salah, jangan langsung beri jawaban — kasih petunjuk dari kaidah asal.",
        },
      ],
    },
    reading: {
      tip: "Baca maqarrar Nahwu perlahan dan tandai setiap kaidah yang ada. Sebelum baca, minta Claude jelaskan gambaran besar bab — ini bikin teks yang padat jadi lebih mudah dipetakan.",
      prompts: [
        {
          label: "Orientasi Bab Nahwu Sebelum Baca",
          text: "Aku akan membaca bab [NAMA BAB NAHWU] dari maqarrar. Sebelum baca, berikan:\n\n1) Mengapa bab ini ada — masalah tata bahasa apa yang ia atasi?\n2) Hubungannya dengan bab-bab yang sudah aku pelajari\n3) Konsep-konsep yang wajib dipahami sebagai prasyarat\n4) Hal-hal teknis yang paling penting untuk diperhatikan saat baca",
        },
        {
          label: "I'rab Teks Maqarrar atau Quran",
          text: "Bantu aku i'rab dan pahami teks Arab berikut kata per kata:\n\n[PASTE KALIMAT/AYAT]\n\nUntuk tiap kata:\n1) Jenis kata (isim/fi'il/harf)\n2) Posisi i'rab + tanda i'rab\n3) Kaidah Nahwu yang berlaku\n4) Fungsi kata ini dalam kalimat\n\nKalau ada kata yang bisa dii'rab dua cara, tunjukkan keduanya.",
        },
      ],
    },
  },

  balaghah: {
    discussion: {
      tip: "Diskusikan mengapa suatu uslub lebih efektif dari yang lain — bukan hanya identifikasi majas. 'Mengapa Allah menggunakan isti'arah di sini, bukan ungkapan langsung?' adalah pertanyaan yang membangun dhauq.",
      prompts: [
        {
          label: "Diskusi: Mengapa Uslub Ini?",
          text: "Aku mau diskusikan pilihan uslub dalam teks ini:\n\n[TEKS ARAB]\n\nAku punya pendapat mengapa penulis/Allah memilih ungkapan ini: [PENDAPATKU]. Kamu respons — apakah ada dimensi Balaghah yang aku lewatkan? Atau perspektif ulama Balaghah yang berbeda dengan interpretasiku?",
        },
        {
          label: "Debat: Mana yang Lebih Indah?",
          text: "Kita diskusikan dua ungkapan Arab yang menyampaikan makna serupa:\n\nUngkapan A: [TEKS A]\nUngkapan B: [TEKS B]\n\nAku berpendapat bahwa A lebih tinggi nilai Balaghah-nya karena [ALASANKU]. Kamu berikan perspektif yang berbeda. Kita cari: apa kriteria objektif dalam Balaghah Arab untuk menilai keindahan?",
        },
      ],
    },
    summary: {
      tip: "Buat bank contoh Balaghah — tiap majas dengan 3 contoh dari Quran dan 1 dari syi'r Arab. Ini yang jadi referensi murajaah paling efektif untuk Balaghah.",
      prompts: [
        {
          label: "Bank Contoh Majas per Jenis",
          text: "Buat BANK CONTOH BALAGHAH untuk majas [JENIS MAJAS: tasybiih / isti'arah / majaz mursal / kinayah / dll] dan sub-jenisnya:\n\nFormat tiap contoh:\nTEKS: [Arab]\nJENIS: [nama majas spesifik]\nUNSUR-UNSUR: [musyabbah, musyabbah bih, wajh syabah — jika tasybiih]\nEFEK BALAGHIY: [mengapa ini lebih efektif dari ungkapan biasa?]\nSUMBER: [nama surah atau nama syair]\n\nBuat 3 contoh dari Quran dan 2 dari syi'r Arab.",
        },
        {
          label: "Rangkuman Konsep Balaghah Sistematik",
          text: "Buat RANGKUMAN SISTEMATIS untuk cabang Balaghah: [MA'ANI / BAYAN / BADI']\n\n1) Definisi cabang ini dan pokok pembahasannya\n2) Pembagian/taqsim (format hierarki) dengan semua sub-jenis\n3) Definisi + contoh untuk tiap sub-jenis\n4) Cara membedakan antara jenis-jenis yang sering dikacaukan\n5) Contoh dari Quran untuk tiap sub-jenis utama",
        },
      ],
    },
    visual: {
      tip: "Minta bagan hierarki tiga cabang Balaghah (Ma'ani, Bayan, Badi') lengkap. Melihat peta Balaghah secara visual membantu kamu selalu tahu 'di mana kamu berada' saat belajar.",
      prompts: [
        {
          label: "Peta Besar Ilmu Balaghah",
          text: "Buat PETA BESAR Ilmu Balaghah dalam format hierarki bertingkat:\n\nLevel 1: 3 cabang utama (Ma'ani, Bayan, Badi')\nLevel 2: Pokok pembahasan tiap cabang\nLevel 3: Sub-jenis (semua majas, semua asalib, semua muhassinat)\nLevel 4: Definisi kilat + contoh kunci\n\nBuat komprehensif — ini akan jadi peta referensi utamaku untuk Balaghah.",
        },
        {
          label: "Diagram Jenis-Jenis Tasybiih",
          text: "Buat DIAGRAM KLASIFIKASI lengkap untuk Tasybiih:\n\n- Berdasarkan unsur yang disebutkan: tasybiih murassyl vs muakkad vs baligh vs tamtsil\n- Berdasarkan wajh syabah: tasybiih mufasshal vs mujmal\n- Format: hierarki yang menunjukkan hubungan antar jenis\n- Sertakan definisi singkat + contoh dari Quran di tiap ujung cabang",
        },
      ],
    },
    practice: {
      tip: "Latihan terbaik Balaghah: diberikan teks, identifikasi semua majas tanpa bantuan. Baru bandingkan dengan analisis Claude. Ini yang melatih 'mata Balaghah'.",
      prompts: [
        {
          label: "Drill Identifikasi Mandiri",
          text: "Berikan teks Arab (dari Quran atau syi'r Arab) yang kaya unsur Balaghah, TANPA memberitahu dulu majas apa yang ada di dalamnya.\n\nAku akan:\n1) Identifikasi semua majas yang aku temukan\n2) Sebutkan jenis majas dan unsur-unsurnya\n3) Jelaskan efek Balaghiy yang aku rasakan\n\nBaru setelah aku selesai, kamu berikan analisis lengkap dan tunjukkan apa yang aku lewatkan.",
        },
        {
          label: "Soal Ujian Balaghah Al-Azhar",
          text: "Buat 4 soal ujian Balaghah seperti format ujian Al-Azhar tentang [MAJAS/KONSEP]:\n\n1) 'Jelaskan definisi [majas] dan sebutkan unsur-unsurnya'\n2) 'Analisis teks berikut dari sisi Balaghah: [teks]'\n3) 'Identifikasi jenis tasybiih/isti'arah dalam contoh berikut'\n4) 'Apa perbedaan antara [majas A] dan [majas B]? Berikan contoh'\n\nAku jawab, kamu evaluasi dan tambahkan analisis yang lebih lengkap.",
        },
      ],
    },
    memorization: {
      tip: "Hafal definisi majas dengan 'rumus pendek': Nama → Ciri Khas (1 kata) → Contoh paling ikonik dari Quran. Tiga elemen ini yang paling sering diuji.",
      prompts: [
        {
          label: "Hafalan Rumus Majas",
          text: "Buat DAFTAR HAFALAN rumus untuk semua majas dalam [BAB BAYAN/MA'ANI/BADI']:\n\nNAMA MAJAS → CIRI KHAS (5 kata) → CONTOH QURAN (nama surah + 2-3 kata ayat)\n\nUrut dari yang paling sering muncul di ujian. Buat seringkas mungkin — ini untuk hafalan bukan pemahaman mendalam.",
        },
        {
          label: "Quiz: Identifikasi Majas dari Deskripsi",
          text: "Quiz hafalan Balaghah: kamu deskripsikan ciri majas, aku jawab namanya.\n\nContoh: 'Tasybiih yang dihilangkan wajh syabah-nya.' → Aku jawab: Tasybiih Mujmal.\n\nBuat 10 soal identifikasi dari berbagai jenis majas. Berikan satu per satu. Di akhir, tandai jenis majas yang paling lemah untuk aku fokuskan murajaah.",
        },
      ],
    },
    reading: {
      tip: "Baca teks sastra Arab atau tafsir Balaghiy dengan 'mode analisis aktif' — setiap ayat atau bait, tanya dirimu: 'Apa yang spesial dari pilihan kata ini?' Claude bisa bantu melatih pertanyaan ini.",
      prompts: [
        {
          label: "Analisis Balaghiy Mendalam Teks",
          text: "Aku mau telaah mendalam aspek Balaghah dalam teks ini:\n\n[TEKS ARAB]\n\nBukan sekadar identifikasi majas — tapi telaah mengapa setiap pilihan uslub itu dibuat:\n1) Apa yang akan hilang kalau teks ini ditulis dengan ungkapan biasa?\n2) Bagaimana setiap majas berkontribusi pada keseluruhan efek teks?\n3) Bagaimana ulama Balaghah besar (Al-Jurjani, Zamakhsyari, Ibn Asyur) akan menganalisis teks ini?\n4) Apa yang membuat teks ini mencapai tingkat Balaghah tinggi?",
        },
        {
          label: "Telaah I'jaz Balaghiy Al-Quran",
          text: "Aku mau telaah mendalam I'jaz Balaghiy untuk [QS SURAH:AYAT-AYAT]:\n\n1) Apa keistimewaan pilihan mufradat (kosakata) dibanding sinonim yang ada?\n2) Bagaimana struktur kalimat berkontribusi pada makna dan efek?\n3) Majas apa yang digunakan dan mengapa itu lebih kuat dari ungkapan langsung?\n4) Bagaimana ayat-ayat ini berinteraksi satu sama lain dalam satu unit makna?\n5) Apa yang telah ditulis ulama tentang I'jaz dalam ayat ini?",
        },
      ],
    },
  },

  makalah: {
    discussion: {
      tip: "Diskusikan outline makalah dulu, bukan langsung minta ditulis. Argumen dan struktur yang kamu sepakati bersama Claude akan menghasilkan makalah yang benar-benar punya alur logis.",
      prompts: [
        {
          label: "Diskusi Argumen Utama Makalah",
          text: "Aku mau diskusikan argumen utama makalahku tentang [TOPIK].\n\nAku punya tesis awal: [TESIS/ARGUMEN UTAMAMU]. Kamu respons — seberapa kuat argumen ini? Apa kelemahannya? Apa counter-argument yang mungkin muncul dari pembaca? Bagaimana aku bisa memperkuat tesis ini?\n\nKita diskusikan 3-4 putaran sebelum aku mulai menulis.",
        },
        {
          label: "Review Outline Sebelum Mulai Menulis",
          text: "Aku sudah punya outline kasar untuk makalah tentang [TOPIK]:\n\n[PASTE OUTLINE-MU]\n\nKritik outline ini dari sisi:\n1) Apakah alurnya logis?\n2) Apakah ada bagian yang terlalu panjang atau terlalu pendek?\n3) Apakah ada argumen penting yang hilang?\n4) Apakah muqaddimah sudah menjawab 'mengapa topik ini penting'?\n\nBerdebatlah — jangan hanya setuju.",
        },
      ],
    },
    summary: {
      tip: "Buat outline makalah yang sangat terstruktur sebelum menulis — ini yang akan jadi 'peta' yang memastikan makalahmu tidak kehilangan arah.",
      prompts: [
        {
          label: "Outline Terstruktur Makalah Azhari",
          text: "Bantu aku buat outline SANGAT TERSTRUKTUR untuk makalah [TOPIK]:\n\nKonteks: Mapel [NAMA MAPEL], Al-Azhar, panjang [X halaman], bahasa [Arab/Indonesia]\n\nOutline harus mencakup:\n- Muqaddimah: semua unsur yang wajib ada\n- Fashl 1, 2, 3 (dst): judul + sub-judul + poin-poin yang akan dibahas di tiap bagian\n- Khatimah: jenis kesimpulan dan rekomendasi\n- Daftar referensi: jenis sumber yang akan aku cari\n\nBuat sedetail mungkin agar aku bisa langsung mulai menulis.",
        },
        {
          label: "Template Muqaddimah Azhari",
          text: "Buat TEMPLATE muqaddimah makalah Azhari tentang [TOPIK] yang mencakup semua unsur wajib:\n\n1) Pembuka: ayat/hadith/quote yang relevan\n2) Ahamiyyah al-mawdhu': 2-3 alasan mengapa topik ini penting\n3) Isykaliyyah al-buhuts: pertanyaan penelitian yang dijawab makalah ini\n4) Ahdaaf al-buhuts: 2-3 tujuan\n5) Manhaj al-buhuts: metode yang digunakan\n6) Haikal al-buhuts: struktur bab-bab\n\nBuat versi dalam bahasa Arab ilmiah Azhari.",
        },
      ],
    },
    visual: {
      tip: "Buat mind map argumen makalahmu — hubungan antar bab dan hubungan argumen ke tesis utama. Kalau kamu bisa melihat ini secara visual, makalahmu akan lebih koheren.",
      prompts: [
        {
          label: "Mind Map Argumen Makalah",
          text: "Aku mau buat mind map argumen untuk makalah tentang [TOPIK] dengan tesis: [TESIS]\n\nBuat STRUKTUR HIERARKI yang menunjukkan:\n- Tesis utama di tengah\n- Argumen-argumen pendukung (tiap bab = satu argumen)\n- Sub-argumen untuk tiap argumen utama\n- Sumber/evidensi yang mendukung tiap sub-argumen\n\nFormat: outline bertingkat yang bisa aku gambar sebagai mind map di kertas.",
        },
        {
          label: "Diagram Alur Bab Makalah",
          text: "Buat DIAGRAM ALUR yang menunjukkan bagaimana bab-bab makalahku terhubung:\n\nOutline makalahku: [PASTE OUTLINE]\n\nTunjukkan:\n- Bagaimana tiap bab membangun argumen dari bab sebelumnya\n- Di mana 'pivot point' (titik belokan) argumen terjadi\n- Bagaimana khatimah menjawab pertanyaan yang diajukan muqaddimah\n\nFormat: diagram linear dengan panah yang menunjukkan alur argumen.",
        },
      ],
    },
    practice: {
      tip: "Latihan menulis 1 paragraf Arab akademis per hari dan minta Claude koreksi — bukan menunggu makalah selesai dulu. Konsistensi harian ini yang membangun kemampuan menulis akademis.",
      prompts: [
        {
          label: "Koreksi Paragraf Arab Akademisku",
          text: "Koreksi paragraf Arab akademisku untuk makalah Azhari:\n\n[PARAGRAF ARABMU]\n\nKoreksi:\n1) Kesalahan Nahwu dan Sharaf\n2) Pilihan kosakata (dari sehari-hari → akademis)\n3) Alur argumen dalam paragraf\n4) Cara mengutip dalil atau sumber\n5) Apakah paragraf ini berkontribusi jelas pada argumen makalah?\n\nTampilkan: daftar perubahan + versi yang sudah diperbaiki.",
        },
        {
          label: "Latihan Tulis Satu Bab",
          text: "Bantu aku menulis [BAB/FASHL] dari makalah tentang [TOPIK].\n\nOutline bab ini: [PASTE OUTLINE BAB]\n\nProses:\n1) Aku tulis draft sendiri dulu\n2) Kamu koreksi: alur argumen, gaya bahasa, kelengkapan dalil\n3) Kita revisi bersama sebelum lanjut ke bab berikutnya\n\nMulai: aku akan kirimkan paragraf pertama dulu untuk dicek.",
        },
      ],
    },
    memorization: {
      tip: "Hafal format dan struktur makalah Azhari sebagai 'template mental' — muqaddimah punya X unsur, fashl punya Y unsur. Template ini yang kamu butuhkan saat ujian meminta buat makalah.",
      prompts: [
        {
          label: "Hafalan Format Makalah Azhari",
          text: "Buat DAFTAR HAFALAN format makalah ilmiah Azhari:\n\n1) Unsur wajib muqaddimah (dalam urutan)\n2) Ciri-ciri fashl yang baik dalam makalah Azhari\n3) Unsur wajib khatimah\n4) Cara format sitasi dalam gaya Azhari\n5) Frasa-frasa transisi yang sering dipakai dalam makalah Arab akademis\n\nBuat dalam format yang mudah dihafal — ini 'template mental' yang perlu aku miliki.",
        },
        {
          label: "Kalimat Pembuka Akademis: Daftar Hafalan",
          text: "Buat DAFTAR KALIMAT PEMBUKA akademis dalam bahasa Arab yang wajib aku hafal untuk makalah Azhari:\n\n1) Kalimat pembuka muqaddimah (berbagai pilihan)\n2) Cara menyatakan tujuan penelitian\n3) Frasa transisi antar bab\n4) Cara menyimpulkan (al-khatimah)\n5) Frasa untuk menyebutkan pandangan ulama\n\nBuat 3-5 pilihan untuk tiap kategori.",
        },
      ],
    },
    reading: {
      tip: "Baca makalah-makalah Azhari yang sudah ada sebagai referensi gaya. Claude bisa bantu kamu analisis: apa yang membuat makalah itu berkualitas Azhari.",
      prompts: [
        {
          label: "Analisis Makalah Referensi",
          text: "Aku mau analisis makalah yang sudah ada sebagai referensi untuk makalahku:\n\n[PASTE BAGIAN MAKALAH REFERENSI]\n\nBantu aku pahami:\n1) Bagaimana penulis menyusun argumen di bagian ini?\n2) Apa ciri gaya bahasa Arab akademis Azhari yang terlihat?\n3) Bagaimana sumber dikutip dalam gaya ini?\n4) Apa yang bisa aku tiru (gaya, bukan isi) dari makalah ini untuk makalahku sendiri?",
        },
        {
          label: "Review Literatur Sebelum Menulis",
          text: "Sebelum aku menulis makalah tentang [TOPIK], bantu aku memahami lanskap penelitian yang sudah ada:\n\n1) Apa sudut pandang utama yang sudah ada tentang topik ini?\n2) Di mana titik perdebatan yang masih terbuka?\n3) Bagaimana makalahku bisa berkontribusi — apa sudut pandang atau argumen yang belum banyak dibahas?\n4) Sumber-sumber kunci apa yang wajib aku baca sebelum mulai menulis?",
        },
      ],
    },
  },

  hafalan: {
    discussion: {
      tip: "Diskusikan strategi hafalanmu dengan ChatGPT — bukan langsung minta tasmi'. Temukan dulu metode yang paling cocok untuk jenis hafalan dan kondisimu sekarang.",
      prompts: [
        {
          label: "Diskusi Strategi Hafalan",
          text: "Aku mau diskusikan strategi hafalan [Quran/matan] yang paling efektif untukku.\n\nKondisiku: [JELASKAN: seberapa banyak sudah hafal, berapa waktu tersedia per hari, di mana titik lemahnya, dll]\n\nKamu berikan beberapa opsi strategi. Aku pilih dan diskusikan mana yang paling realistis untuk kondisiku. Kita buat plan bersama.",
        },
        {
          label: "Evaluasi Sesi Tasmi' yang Baru Selesai",
          text: "Aku baru selesai sesi tasmi' dan ada beberapa bagian yang terasa lemah:\n\n[JELASKAN: bagian mana yang sering lupa, pola kelemahannya, dll]\n\nBantu aku analisis: mengapa bagian-bagian ini lebih sulit? Apakah ada faktor tertentu (panjang ayat, kemiripan dengan ayat lain, dll)? Apa strategi paling efektif untuk menguatkan bagian yang lemah ini?",
        },
      ],
    },
    summary: {
      tip: "Setelah setiap sesi hafalan, buat catatan singkat: apa yang sudah lancar, apa yang masih lemah, dan jadwal murajaah ke depan. Ini dokumentasi progres yang sangat penting.",
      prompts: [
        {
          label: "Jadwal Murajaah Terstruktur",
          text: "Buat JADWAL MURAJAAH yang terstruktur untuk hafalanku:\n\nTotal hafalan: [JUMLAH]\nWaktu tersedia: [WAKTU PER HARI]\nTarget rotasi: semua hafalan dimurajaah dalam [PERIODE]\n\nBuat jadwal harian/mingguan yang:\n1) Memastikan rotasi merata\n2) Memberikan porsi lebih ke bagian yang lemah\n3) Tidak terlalu ambisius sehingga tidak realistis\n\nFormat: tabel per hari/minggu yang bisa langsung aku ikuti.",
        },
        {
          label: "Laporan Progres Hafalan",
          text: "Bantu aku buat SISTEM PELACAKAN HAFALAN:\n\nBuat template untuk aku isi setelah setiap sesi tasmi':\n\nTANGGAL:\nBAGIAN YANG DIMURAJAAH:\nBagian yang lancar:\nBagian yang perlu murajaah ulang:\nTotal waktu:\nRencana besok:\n\nSetelah aku isi template ini, bantu aku analisis pola kelemahan dari beberapa sesi sekaligus.",
        },
      ],
    },
    visual: {
      tip: "Buat peta visual hafalanmu — surah apa sudah kuat, surah apa yang masih lemah, dalam format yang bisa kamu lihat setiap hari sebagai reminder.",
      prompts: [
        {
          label: "Peta Visual Status Hafalan",
          text: "Bantu aku buat PETA STATUS HAFALAN dalam format teks:\n\nUntuk [RUANG LINGKUP: juz tertentu / matan tertentu], buat tabel:\nBAGIAN | STATUS (Kuat/Sedang/Lemah/Belum) | TERAKHIR DIMURAJAAH | PRIORITAS\n\nAku akan isi status-nya. Setelah itu, bantu aku tentukan urutan prioritas murajaah berdasarkan data ini.",
        },
        {
          label: "Diagram Jadwal Murajaah Visual",
          text: "Buat JADWAL MURAJAAH dalam format kalender/tabel mingguan:\n\nHafalan total: [BAGIAN-BAGIAN YANG PERLU DIMURAJAAH]\nWaktu per hari: [WAKTU]\n\nBuat jadwal visual (tabel Senin-Minggu) dengan distribusi hafalan yang logis:\n- Bagian berat di waktu terbaik (setelah subuh?)\n- Distribusi merata tidak ada hari yang overload\n- Penanda hari review menyeluruh",
        },
      ],
    },
    practice: {
      tip: "Langsung tasmi' — itu satu-satunya cara latihan yang efektif untuk hafalan. Satu per satu, tanpa skip, tanpa minta jawaban dulu.",
      prompts: [
        {
          label: "Sesi Tasmi' Quran Interaktif",
          text: "Aku mau sesi tasmi' Quran dari [SURAH/JUZ/AYAT].\n\nModa: kamu sebutkan 3-5 kata pertama tiap ayat secara berurutan — aku lanjutkan sampai akhir ayat. Kalau aku ragu atau berhenti lebih dari 5 detik, berikan 2 kata petunjuk saja — JANGAN langsung kasih jawabannya.\n\nCatat setiap ayat yang aku perlu petunjuk. Di akhir sesi, beri laporan: ayat mana yang perlu diprioritaskan murajaah.",
        },
        {
          label: "Sesi Tasmi' Matan Interaktif",
          text: "Sesi tasmi' matan [NAMA MATAN: Waraqat / Jurumiyyah / Arba'in / dll].\n\nModa: kamu sebutkan awal setiap baris/bagian — aku lanjutkan sampai selesai. Kalau aku terputus, berikan petunjuk pertama saja.\n\nSetelah selesai tiap bab/bagian, berikan brief summary: apa isi yang baru aku lafalkan — ini memastikan aku hafal dengan makna, bukan sekadar suara.",
        },
      ],
    },
    memorization: {
      tip: "Teknik hafalan paling efektif: pecah jadi potongan kecil, hafalkan tiap potongan sampai 100%, baru sambung. ChatGPT bisa bantu drill tiap potongan satu per satu.",
      prompts: [
        {
          label: "Drill Hafalan Potongan Kecil",
          text: "Aku mau drill hafalan [AYAT/BARIS MATAN] potongan demi potongan.\n\nCaranya: kamu sebutkan kata-kata pertama dari potongan — aku lanjutkan. Kalau aku lupa, kamu ulangi dari awal potongan itu (bukan langsung kasih jawaban).\n\nPotongan hari ini: [BAGIAN YANG MAU DIHAFALKAN]\n\nMulai dari potongan pertama. Ulang 3x tiap potongan sebelum lanjut ke potongan berikutnya.",
        },
        {
          label: "Identifikasi 'Ayat Saudara' yang Mirip",
          text: "Aku sering keliru antara ayat/baris ini:\n\n[AYAT/BARIS YANG SERING TERTUKAR]\n\nBantu aku:\n1) Identifikasi PERSIS di mana kedua ayat/baris ini mulai berbeda\n2) Apa cara terbaik untuk mengingat perbedaannya?\n3) Drill khusus: quiz aku dengan pertanyaan yang sengaja memaksa aku membedakan keduanya\n\nIni 'titik konflik hafalan' yang harus diselesaikan.",
        },
      ],
    },
    reading: {
      tip: "Sebelum sesi hafalan baru, baca terjemahan dan tafsir singkat dari yang akan kamu hafal. Hafalan yang disertai pemahaman makna akan bertahan jauh lebih lama.",
      prompts: [
        {
          label: "Pemahaman Makna Sebelum Hafalan",
          text: "Aku mau hafal [SURAH/BAGIAN] tapi aku ingin hafal dengan memahami maknanya.\n\nSebelum aku mulai menghafal, berikan:\n1) Terjemahan tiap ayat/bagian dengan penjelasan singkat\n2) Tema utama bagian ini — apa yang sedang disampaikan?\n3) Kata-kata kunci yang paling bermakna untuk diperhatikan\n4) Hubungan antar ayat/bagian — bagaimana mereka saling terkait?\n\nPemahaman ini yang akan jadi 'jangkar' hafalanku.",
        },
        {
          label: "Telaah Tafsir untuk Hafalan yang Lebih Dalam",
          text: "Aku menghafal [SURAH/BAGIAN MATAN] tapi ingin memahaminya lebih dalam untuk memperkuat hafalan.\n\nBantu aku dengan:\n1) Makna kata-kata yang kurang familiar\n2) Konteks mengapa bagian ini diturunkan/diucapkan\n3) Keindahan gaya bahasa yang ada di dalamnya (jika Quran)\n4) Hubungan makna yang membuat urutan ini logis — mengapa urutan ini, bukan yang lain?\n\nPemahaman ini yang akan membuat hafalan tidak mudah lepas.",
        },
      ],
    },
  },

  syafahi: {
    discussion: {
      tip: "Simulasikan ujian syafahi yang sesungguhnya — jawab dalam bahasa Arab, satu pertanyaan per giliran, tanpa melihat catatan. Ini persiapan yang benar-benar mempersiapkan.",
      prompts: [
        {
          label: "Simulasi Syafahi Full Bahasa Arab",
          text: "Aku mau simulasi ujian syafahi [MATA PELAJARAN] tentang [TOPIK].\n\nBerperankan sebagai dosen penguji Al-Azhar yang ketat. Aturan ketat:\n1) Ajukan pertanyaan DALAM BAHASA ARAB\n2) Aku menjawab DALAM BAHASA ARAB — koreksi jika jawaban mengandung kesalahan bahasa\n3) Satu pertanyaan per giliran — tunggu jawabanku sebelum lanjut\n4) Mulai dari definisi, naik ke dalil, naik ke perbandingan\n5) Kalau jawabanku kurang, dorong aku dengan: 'هل من مزيد؟' atau 'وما دليلك؟'\n\nMulai dengan pertanyaan pertama.",
        },
        {
          label: "Debat: Kamu Dosen, Aku Mahasiswa",
          text: "Aku mau latihan menjawab pertanyaan yang biasanya membuat mahasiswa kaget di syafahi.\n\nBerperankan dosen yang mengajukan pertanyaan 'jebakan' — pertanyaan yang jawabannya tidak ada di maqarrar persis, tapi menguji apakah mahasiswa benar-benar mengerti bukan sekadar hafal.\n\nTopik: [MATA PELAJARAN/BAB]. Berikan 3 pertanyaan 'jebakan' seperti ini satu per satu.",
        },
      ],
    },
    summary: {
      tip: "Buat 'cheat sheet syafahi' — per mata pelajaran, per bab: definisi yang wajib, dalil utama, dan cara membuka jawaban dalam bahasa Arab akademis. Ini yang paling berguna menjelang ujian.",
      prompts: [
        {
          label: "Cheat Sheet Syafahi per Bab",
          text: "Buat CHEAT SHEET SYAFAHI untuk bab [TOPIK MATA PELAJARAN]:\n\n1) DEFINISI WAJIB: 3-5 definisi yang paling mungkin ditanya\n2) DALIL UTAMA: ayat/hadith yang relevan + cara menyebutnya\n3) POIN PERBANDINGAN: jika ada khilaf, apa bedanya dalam 1 kalimat tiap mazhab\n4) PEMBUKA JAWABAN: frasa-frasa Arab akademis untuk membuka jawaban\n5) YANG SERING DIKOCOK: pertanyaan sulit yang sering membuat mahasiswa gagal\n\nBuat dalam format yang bisa dibaca 5 menit sebelum masuk ruang ujian.",
        },
        {
          label: "Rangkuman Terminologi Arab Syafahi",
          text: "Buat DAFTAR TERMINOLOGI ARAB yang wajib dikuasai untuk syafahi [MATA PELAJARAN]:\n\n1) Cara membuka jawaban: 'أعرّف [X] بأنه...' / 'الدليل على ذلك قوله تعالى...' / dll\n2) Cara menyebutkan perbedaan mazhab: frasa yang tepat\n3) Cara meminta klarifikasi dengan sopan\n4) Cara menyatakan ketidaktahuan dengan anggun (bukan diam saja)\n5) Cara menutup jawaban dan menyimpulkan\n\nBuat 3-5 pilihan frasa untuk tiap kategori.",
        },
      ],
    },
    visual: {
      tip: "Buat 'roadmap pertanyaan syafahi' — urutan pertanyaan yang biasanya diajukan dosen per topik. Melihat pola ini secara visual membantu kamu bersiap secara sistematis.",
      prompts: [
        {
          label: "Roadmap Pertanyaan Syafahi",
          text: "Buat ROADMAP pertanyaan syafahi untuk topik [MATA PELAJARAN/BAB]:\n\nPola pertanyaan dosen Azhari biasanya:\nLevel 1 → Level 2 → Level 3\nDefinisi → Dalil → Perbandingan/Analisis\n\nBuat roadmap untuk topik ini:\n- Pertanyaan Level 1 (definisi dasar)\n- Pertanyaan Level 2 (dalil dan tathbiq)\n- Pertanyaan Level 3 (perbandingan, analisis, aplikasi)\n\nIni peta yang aku gunakan untuk persiapan sistematis.",
        },
        {
          label: "Tabel: Pertanyaan → Poin Jawaban Utama",
          text: "Buat TABEL PERSIAPAN SYAFAHI untuk topik [MATA PELAJARAN/BAB]:\n\nKolom: Pertanyaan yang Mungkin | Poin Jawaban Utama (3-4 bullet) | Dalil Kunci | Catatan\n\nBuat untuk 8-10 pertanyaan yang paling mungkin keluar. Format yang bisa aku pindai cepat sebelum ujian.",
        },
      ],
    },
    practice: {
      tip: "Latihan syafahi harus dalam bahasa Arab — bahkan jika terbata-bata. Keterampilan menjawab dalam bahasa Arab akademis hanya terbentuk dari latihan, bukan membaca tentangnya.",
      prompts: [
        {
          label: "Drill Jawaban Arab dalam 30 Detik",
          text: "Drill jawaban syafahi cepat: kamu kasih pertanyaan, aku jawab dalam BAHASA ARAB dalam 30 detik tanpa melihat catatan.\n\nMata pelajaran: [MAPEL], topik: [TOPIK]\n\nFormula: satu pertanyaan → aku jawab → kamu evaluasi (konten + bahasa Arab) → langsung pertanyaan berikutnya. Tidak ada jedah diskusi panjang — ini simulasi kecepatan berpikir di syafahi.\n\nBerikan pertanyaan pertama.",
        },
        {
          label: "Latihan Jawab Pertanyaan Sulit",
          text: "Berikan 5 pertanyaan syafahi yang paling SULIT tentang [TOPIK] — jenis yang biasanya membuat mahasiswa tidak bisa menjawab atau menjawab salah.\n\nAku jawab setiap pertanyaan. Untuk tiap jawaban, evaluasi:\n1) Konten: apakah substantif dan tepat?\n2) Bahasa Arab: apakah sudah akademis dan benar?\n3) Cara penyampaian: apakah ada yang perlu diperbaiki?\n4) Versi jawaban yang lebih baik (jika ada)",
        },
      ],
    },
    memorization: {
      tip: "Hafal 'pembuka jawaban' dalam bahasa Arab — frasa standar untuk membuka definisi, untuk menyebutkan dalil, untuk membandingkan mazhab. Ini yang membuat penampilan syafahi terlihat jauh lebih kompeten.",
      prompts: [
        {
          label: "Hafalan Frasa Pembuka Syafahi",
          text: "Aku perlu hafal frasa-frasa standar bahasa Arab akademis untuk syafahi [MATA PELAJARAN].\n\nBuat DAFTAR HAFALAN untuk:\n1) Membuka definisi: berbagai cara (minimal 3 pilihan)\n2) Menyebutkan dalil: cara formal mengutip Quran/hadith\n3) Menyebut khilaf/perbedaan mazhab\n4) Menyimpulkan jawaban\n5) Meminta klarifikasi pertanyaan dengan sopan\n\nBuat dalam bahasa Arab, dengan transliterasi dan arti. Aku akan hafalkan dan gunakan di latihan.",
        },
        {
          label: "Hafalan Definisi: Format Syafahi",
          text: "Buat DAFTAR DEFINISI dalam format yang siap diucapkan di syafahi untuk [TOPIK]:\n\nFormat tiap definisi:\nISTILAH (Arab) | DEFINISI SYAFAHI: [dalam bahasa Arab akademis, 1-2 kalimat] | CATATAN: [kata kunci yang wajib ada dalam definisi]\n\nBuat definisi-definisi yang paling sering ditanya. Format: langsung bisa aku hafalkan dan ucapkan.",
        },
      ],
    },
    reading: {
      tip: "Baca maqarrar dengan 'mata dosen' — baca seolah kamu yang akan bertanya tentang teks ini. Pertanyaan apa yang muncul? Ini yang akan kamu jawab di syafahi.",
      prompts: [
        {
          label: "Baca Maqarrar dengan Mata Dosen",
          text: "Aku mau baca bagian maqarrar [MATA PELAJARAN/BAB] dengan 'mata dosen syafahi'.\n\nSebelum aku baca, berikan:\n1) 5 pertanyaan syafahi yang paling mungkin muncul dari bagian ini\n2) Poin-poin yang akan ditekankan dosen penguji\n3) 'Jebakan' yang sering dibuat mahasiswa saat menjawab topik ini\n\nSetelah baca, aku jawab pertanyaan-pertanyaan yang kamu berikan.",
        },
        {
          label: "Review Materi: Aku yang Ajarkan Balik",
          text: "Setelah aku baca dan pelajari [TOPIK], aku mau latihan menerangkan ulang materi ini seolah aku yang mengajar.\n\nAku akan tulis/ceritakan isi materi dengan kata-kataku sendiri.\nKamu berperan sebagai mahasiswa yang bertanya: 'Jelaskan lebih lanjut tentang bagian X' atau 'Apa dalilnya?' setelah aku selesai.\n\nIni adalah teknik 'feynman' — belajar dengan mengajarkan.",
        },
      ],
    },
  },

  "kuliah-arab": {
    discussion: {
      tip: "Rekonstruksi penjelasan dosen bersama ChatGPT — kamu ceritakan apa yang kamu pahami, ChatGPT isi gap dan koreksi pemahaman yang kurang tepat.",
      prompts: [
        {
          label: "Rekonstruksi Penjelasan Kuliah",
          text: "Aku baru selesai kuliah [MATA PELAJARAN]. Aku mau rekonstruksi penjelasan dosen bersama kamu.\n\nIni yang aku tangkap: [CERITAKAN VERSIMU DARI KULIAH TADI]\n\nKamu respons:\n1) Apa yang sudah tepat dari pemahamanku?\n2) Di mana ada gap atau kesalahan pemahaman?\n3) Apa yang kamu tambahkan yang mungkin terlewat?\n\nKita diskusikan sampai versi rekonstruksi ini solid.",
        },
        {
          label: "Diskusi: Apa yang Baru Dipelajari Tadi",
          text: "Aku baru selesai kuliah tentang [TOPIK]. Ada beberapa hal yang masih bingung:\n\n[TULISKAN 2-3 HAL YANG MASIH BINGUNG]\n\nAku mau diskusikan satu per satu — aku ceritakan pemahamanku dulu, kamu respons dan klarifikasi. Jangan langsung berikan penjelasan lengkap — biarkan aku yang coba dulu, kamu yang koreksi.",
        },
      ],
    },
    summary: {
      tip: "Setelah tiap kuliah, buat ringkasan 5-10 poin dalam bahasa Indonesia. Ini membantu kamu memastikan apa yang sudah dipahami dan mengidentifikasi apa yang masih bingung.",
      prompts: [
        {
          label: "Ringkasan Kuliah 10 Poin",
          text: "Ini catatanku dari kuliah [MATA PELAJARAN] tadi tentang [TOPIK]:\n\n[PASTE ATAU CERITAKAN CATATAN KULIAH]\n\nBantu aku buat RINGKASAN 10 POIN:\n1) Isi poin-poin utama yang dibahas dosen\n2) Istilah teknis kunci yang muncul\n3) Poin yang mungkin penting untuk ujian\n4) Pertanyaan yang belum terjawab dari kuliah ini\n\nFormat ringkas, langsung bisa disimpan sebagai catatan murajaah.",
        },
        {
          label: "Lengkapi Catatan yang Tidak Sempurna",
          text: "Catatanku dari kuliah [MATA PELAJARAN] ada bagian yang tidak sempat aku catat (ditandai [...]):\n\n[PASTE CATATANMU DENGAN [...] DI BAGIAN KOSONG]\n\nBantu aku lengkapi bagian yang kosong berdasarkan konteks topik. Pertahankan istilah Arab yang sudah ada. Untuk bagian yang tidak bisa dipastikan, tandai dengan [PERLU KONFIRMASI KE DOSEN].",
        },
      ],
    },
    visual: {
      tip: "Minta ChatGPT buat diagram atau peta konsep dari isi kuliah — ini jauh lebih mudah diingat daripada catatan teks biasa.",
      prompts: [
        {
          label: "Peta Konsep dari Isi Kuliah",
          text: "Aku baru selesai kuliah tentang [TOPIK]. Buat PETA KONSEP dari isi kuliah ini:\n\nInformasi yang aku punya: [CERITAKAN ISI KULIAH]\n\nBuat dalam format:\n- Konsep utama di tengah\n- Sub-konsep yang terhubung\n- Hubungan antar sub-konsep\n- Istilah kunci di tiap node\n\nFormat: hierarki atau outline bertingkat yang bisa aku gambar sebagai peta konsep.",
        },
        {
          label: "Diagram Hubungan Konsep",
          text: "Kuliah tadi membahas [KONSEP A], [KONSEP B], dan [KONSEP C]. Aku bingung bagaimana ketiganya saling berhubungan.\n\nBuat DIAGRAM HUBUNGAN dalam format teks:\n- Tunjukkan bagaimana tiap konsep terhubung ke yang lain\n- Mana yang lebih umum (ruang lingkup lebih luas) dan mana yang lebih spesifik\n- Di mana ada overlap antara konsep-konsep ini\n\nSetelah diagram, jelaskan dalam satu paragraf.",
        },
      ],
    },
    practice: {
      tip: "Segera setelah kuliah, coba jawab pertanyaan: 'Kalau dosen tanya ini di ujian, apa jawabanku?' — ChatGPT bisa jadi 'dosen virtual' yang menguji pemahamanmu saat itu juga.",
      prompts: [
        {
          label: "Tes Pemahaman Segera Setelah Kuliah",
          text: "Aku baru selesai kuliah [MATA PELAJARAN] tentang [TOPIK]. Tes pemahamanku dengan 5 pertanyaan tentang materi kuliah tadi:\n\n- 2 pertanyaan fakta/definisi\n- 2 pertanyaan aplikasi/contoh\n- 1 pertanyaan 'mengapa/bagaimana'\n\nBerikan pertanyaan satu per satu. Aku jawab sebelum kamu kasih berikutnya. Koreksi dan berikan penjelasan tambahan jika perlu.",
        },
        {
          label: "Latihan Istilah yang Baru Dengar",
          text: "Dalam kuliah tadi, aku dengar istilah-istilah baru:\n\n[DAFTAR ISTILAH YANG BARU DIDENGAR]\n\nUntuk tiap istilah:\n1) Jelaskan arti dalam bahasa Arab dan Indonesia\n2) Berikan contoh penggunaan dalam kalimat\n3) Hubungannya dengan istilah lain yang sudah aku pelajari\n\nSetelah itu, quiz aku: kamu berikan contoh kalimat, aku tebak istilah yang tepat.",
        },
      ],
    },
    memorization: {
      tip: "Buat daftar istilah baru dari setiap kuliah — maksimal 10 kata baru per kuliah. Hafalkan sebelum kuliah berikutnya. Ini cara paling efisien membesarkan kosakata Arab akademis.",
      prompts: [
        {
          label: "Daftar 10 Istilah Baru dari Kuliah Ini",
          text: "Dari kuliah [MATA PELAJARAN] tadi, bantu aku buat daftar 10 istilah teknis yang paling penting untuk aku hafal:\n\nBerdasarkan: [CERITAKAN TOPIK KULIAH]\n\nFormat tiap istilah:\nARAB: [kata Arab] | ARTI: [terjemahan] | CONTOH: [kalimat singkat] | CATATAN: [hal penting tentang penggunaan]\n\nUrutkan dari yang paling fundamental ke yang paling teknis.",
        },
        {
          label: "Hafalan Istilah: Quiz Setelah 24 Jam",
          text: "Kemarin aku belajar istilah-istilah berikut dari kuliah [MATA PELAJARAN]:\n\n[DAFTAR ISTILAH YANG KEMARIN DIPELAJARI]\n\nQuiz aku sekarang — kamu berikan arti dalam bahasa Indonesia, aku jawab istilah Arabnya. Atau sebaliknya — kamu berikan istilah Arab, aku berikan artinya.\n\nBuat 10 pertanyaan. Berikan satu per satu. Lacak mana yang aku masih lupa.",
        },
      ],
    },
    reading: {
      tip: "Baca materi kuliah SEHARI SEBELUM kuliah — bukan setelahnya. Pre-reading ini bikin kamu jauh lebih siap mengikuti penjelasan dosen dan bisa bertanya dengan pertanyaan yang lebih tajam.",
      prompts: [
        {
          label: "Pre-Baca Sebelum Kuliah Besok",
          text: "Besok aku kuliah [MATA PELAJARAN] tentang [TOPIK sesuai silabus]. Berikan pengantar agar aku lebih siap:\n\n1) Konsep-konsep utama yang akan dibahas\n2) Istilah teknis Arab yang kemungkinan muncul besok\n3) Pertanyaan kritis yang bisa aku ajukan ke dosen\n4) Hubungan topik ini dengan yang sudah dipelajari sebelumnya\n5) Jika ada, baca apa dulu yang paling berguna sebelum kuliah?",
        },
        {
          label: "Telaah Catatan Kuliah: Cari yang Terlewat",
          text: "Ini catatanku dari kuliah [MATA PELAJARAN] tentang [TOPIK]:\n\n[PASTE CATATAN LENGKAP]\n\nBaca catatan ini dan bantu aku:\n1) Apa yang mungkin terlewat — konsep yang biasanya dibahas di topik ini tapi tidak ada di catatanku\n2) Istilah yang aku catat tapi kemungkinan tidak tepat\n3) Apakah ada inkonsistensi atau kekeliruan pemahaman dalam catatan\n4) Pertanyaan yang perlu aku ajukan ke dosen untuk klarifikasi",
        },
      ],
    },
  },

};

/* Merge styleGuide ke setiap MAPEL_GUIDE */
MAPEL_GUIDES.forEach(g => {
  if (STYLE_GUIDES[g.id]) g.styleGuide = STYLE_GUIDES[g.id];
});

window.MAPEL_GUIDES = MAPEL_GUIDES;
