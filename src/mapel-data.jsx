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

window.MAPEL_GUIDES = MAPEL_GUIDES;
