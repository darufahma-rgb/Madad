/* Catatan pemateri untuk seminar 3 jam (peserta S1 Masisir), ditulis sebagai kalimat yang bisa diucapkan langsung.
   Register: profesional dan hangat (saya, kita, Anda, teman-teman).
   Kunci mengikuti `key` slide di seminar-slides.jsx: title, hook-*, agenda, ch:<bab>, sec:<bab>:<urutan>,
   viz:<id>, shot:<id>, prompts:<bab>, task:<bab>, outputs, worksheet, cta, closing.
   say = yang diucapkan. cue = isyarat tindakan untuk pemateri. */
const SEMINAR_NOTES = {
  title: {
    say: "Assalamu'alaikum warahmatullahi wabarakatuh, teman-teman. Saya Daru Fahmaa Muliawan, mahasiswa S2 Universitas Al-Azhar, dan sudah hampir sepuluh tahun menjalani kehidupan di Mesir. Seminar hari ini bersifat praktik. Setiap bab ditutup dengan tugas, dan pada akhirnya Anda pulang membawa hasil kerja Anda sendiri.",
    cue: "Pastikan HP atau laptop peserta sudah terbuka. 1 menit.",
  },
  "hook-poll": {
    say: "Sebelum mulai, saya ingin bertanya. Siapa di sini yang pernah memakai AI untuk belajar? Hampir setiap hari? Kadang-kadang? Belum pernah? Baik. Pertanyaan kedua: siapa yang pernah menerima jawaban AI yang keliru, tetapi ditulis dengan sangat meyakinkan? Itu hal yang wajar, dan itulah yang akan kita bahas hari ini.",
    cue: "Hitung kasar lalu sebut hasilnya dengan jelas ('hampir separuh'). 2 menit.",
  },
  "hook-demo": {
    say: "Sekarang saya buktikan secara langsung. Saya akan meminta AI menyebutkan tiga kitab tafsir ayat ahkam yang membahas ayat riba, lengkap dengan pengarang, jilid, halaman, dan kutipan matannya. Kita lihat jawabannya, lalu kita periksa bersama. Apakah nama kitabnya ada? Apakah halamannya sesuai? Apakah matannya sama? Setelah itu kita hitung berapa yang lolos.",
    cue: "DEMO LANGSUNG. Coba dahulu di rumah dengan alat yang sama. Siapkan kitab aslinya (mis. Ahkam al-Qur'an dan Al-Jami' li Ahkam al-Qur'an) agar pengecekan cepat. Jika internet bermasalah, ceritakan hasil percobaan Anda. 3 menit.",
  },
  "hook-goals": {
    say: "Target saya hari ini sederhana. Setelah tiga jam, Anda mengetahui kapan AI boleh dipercaya dan kapan harus diperiksa. Anda mampu menulis prompt yang tepat sasaran. Dan Anda memiliki cara belajar aktif dengan bantuan AI. Semua itu akan menjadi enam hasil kerja yang Anda susun sendiri, yaitu Paket Belajar AI Pribadi. Mohon pastikan HP atau laptop, satu bab diktat, dan satu akun AI sudah siap.",
    cue: "Periksa siapa yang belum punya akun, minta bergabung dengan teman di sebelahnya. 1 menit.",
  },
  agenda: {
    say: "Ini peta kita hari ini. Ada enam bab, dan setiap bab terdiri dari materi singkat lalu tugas. Ada istirahat sepuluh menit setelah bab dua. Waktu akan saya jaga ketat agar semua tugas dapat diselesaikan.",
    cue: "Tidak perlu dibahas panjang. 1 menit.",
  },

  "ch:fundamental": { say: "Bab satu. Sebelum memakai AI, kita pahami dahulu apa itu AI dan mengapa ia bisa keliru. Targetnya satu: Anda tahu kapan AI dapat dipercaya.", cue: "12 menit materi lalu 10 menit tugas." },
  "sec:fundamental:0": { say: "Pertama, peta istilah dari yang paling luas. AI adalah payungnya. Di dalamnya ada machine learning, di dalamnya lagi deep learning, dan di dalamnya lagi LLM. Saya tidak meminta Anda menghafal definisi teknis. Cukup mampu membedakan keempatnya.", cue: "Lanjut ke visual lingkaran." },
  "viz:nesting": { say: "Perhatikan, setiap lapisan berada di dalam lapisan sebelumnya. ChatGPT, Claude, dan Gemini berada di lingkaran paling dalam, yaitu LLM.", cue: "Tunggu animasi selesai sebelum bicara." },
  "sec:fundamental:1": { say: "Cara kerja LLM, versi sederhana. Teks dipecah menjadi potongan kecil yang disebut token. Kemudian model menebak token berikutnya berdasarkan pola yang telah dipelajarinya. Ia tidak membuka database lalu mengutip. Inilah akar dari seluruh masalah yang akan kita bahas.", cue: "Lanjut ke visual prediksi kata." },
  "viz:nexttoken": { say: "Silakan coba tebak kata berikutnya. Sekarang perhatikan batang paling atas. Model memilih kata yang paling mungkin, bukan yang paling benar. Angka di sini hanya contoh, bukan keluaran model tertentu.", cue: "Ajak peserta menebak sebelum batang muncul." },
  "sec:fundamental:2": { say: "Inilah sebabnya ada halusinasi. Model dilatih agar tulisannya masuk akal, bukan agar pasti benar. Yang paling rawan adalah nama kitab, halaman, nomor hadis, dan kutipan persis. Anda ingat demo tadi? Itulah contohnya.", cue: "Kaitkan dengan hasil demo." },
  "sec:fundamental:3": { say: "Namun jangan salah paham. AI sangat kuat untuk menjelaskan ulang, merangkum, menerjemah, dan membuat latihan soal. Ia lemah pada fakta spesifik yang tidak memiliki sumber. Jadi persoalannya bukan takut memakai AI, melainkan memilih tugas yang tepat.", cue: null },
  "sec:fundamental:4": { say: "Alat AI terbagi menjadi empat jenis: chatbot umum, alat berbasis sumber seperti NotebookLM, pencari yang menyertakan sitasi, dan alat khusus bidang. Aturan praktisnya: semakin berbahaya akibat kekeliruannya, semakin perlu alat yang bersumber.", cue: "Tanyakan: alat apa yang paling sering Anda pakai?" },
  "task:fundamental": { say: "Waktunya tugas, sepuluh menit. Pilih satu bab kitab yang sedang Anda pegang. Ajukan tiga pertanyaan kepada AI: satu definisi, satu detail, dan satu contoh. Cocokkan dengan kitab Anda, lalu tandai: benar, meleset, atau terdengar benar tetapi tidak ada di kitab. Saya akan berkeliling.", cue: "Timer 10 menit (tekan T). Setelah selesai, minta 2 orang menceritakan temuannya." },

  "ch:prompting": { say: "Bab dua. Kualitas jawaban AI sangat ditentukan oleh kualitas perintah kita. Kita akan memakai satu rumus sederhana yang terdiri dari lima bagian.", cue: "12 menit materi lalu 15 menit tugas." },
  "sec:prompting:0": { say: "Lima bagiannya: peran, konteks, tugas, format, dan batasan. Saya beri contoh dari ilmu nahwu agar dekat dengan Anda.", cue: "Lanjut ke visual rumus." },
  "viz:formula": { say: "Perhatikan, contohnya tersusun bertahap. Lihat bagian terakhir, yaitu batasan: jangan mengarang kutipan kitab. Bagian itu langsung terhubung dengan persoalan halusinasi tadi.", cue: null },
  "sec:prompting:1": { say: "Prompt pertama jarang menjadi hasil akhir, dan itu wajar. Kebiasaan yang baik adalah memperbaikinya bertahap dengan permintaan yang spesifik. Bila informasinya kurang, minta AI bertanya balik, jangan biarkan ia menebak.", cue: null },
  "sec:prompting:2": { say: "Trik berikutnya: berikan satu atau dua contoh hasil yang Anda inginkan. AI sangat baik dalam mengikuti pola dari contoh.", cue: null },
  "sec:prompting:3": { say: "Mengenai bahasa Arab. Sebutkan dengan jelas bahasa keluarannya, misalnya penjelasan berbahasa Indonesia dengan istilah Arab berharakat. Sebutkan juga levelnya, dan mazhabnya bila relevan.", cue: null },
  "sec:prompting:4": { say: "Ada empat kesalahan yang paling sering terjadi. Silakan jujur pada diri sendiri: yang mana paling sering Anda lakukan?", cue: "Angkat tangan per poin, cukup cepat." },
  "prompts:prompting": { say: "Bandingkan dua prompt ini, topiknya sama. Menurut Anda, apa bedanya? Benar, prompt kedua mengikuti lima bagian tadi.", cue: "Tanyakan dahulu sebelum menjelaskan." },
  "task:prompting": { say: "Tugas lima belas menit. Tulis prompt singkat dan jalankan. Lalu tulis ulang dengan lima bagian dan jalankan lagi. Perbaiki sekali lagi sesuai kekurangan hasilnya. Hasil akhirnya adalah satu prompt andalan yang dapat Anda pakai berulang kali.", cue: "Timer 15 menit. Berkeliling dan bantu yang kesulitan." },

  "ch:belajar": { say: "Bab tiga, ini inti bagi Anda sebagai mahasiswa. Kita memakai AI untuk belajar aktif, bukan sekadar membaca ringkasan yang rapi.", cue: "12 menit materi lalu 20 menit tugas (tugas terpanjang)." },
  "sec:belajar:0": { say: "Merangkum diktat yang tebal. Tempel materi per bagian, bukan seluruh diktat sekaligus. Minta ringkasan tiga level dan daftar istilah yang sulit.", cue: null },
  "sec:belajar:1": { say: "Peta konsep. Sangat cocok untuk materi yang banyak pembagiannya, seperti ushul fiqh, mustalah hadis, atau balaghah.", cue: null },
  "sec:belajar:2": { say: "Mufradat dan i'rab. Minta i'rab beserta alasannya, lalu periksa ke kitab nahwu. Dan cobalah mengi'rab sendiri terlebih dahulu sebelum bertanya.", cue: null },
  "sec:belajar:3": { say: "Ini yang menurut saya paling penting: jadikan AI sebagai penguji. Satu pertanyaan setiap kali, tunggu jawaban Anda, baru dikoreksi. Cara ini jauh lebih membekas daripada membaca penjelasan yang rapi.", cue: "Prompt-nya ada di slide berikutnya." },
  "sec:belajar:4": { say: "Kemudian ulangi secara berjarak: hari pertama, ketiga, ketujuh, dan keempat belas. Mengulang dengan jeda lebih kuat daripada mengulang sekali panjang.", cue: "Lanjut ke visual kurva lupa." },
  "viz:forgetting": { say: "Garis emas turun, lalu naik kembali setiap kali kita mengulang, dan penurunannya makin landai. Ini ilustrasi konsep, bukan data pengukuran.", cue: "Tunjuk catatan 'ilustrasi' di bagian bawah." },
  "sec:belajar:5": { say: "Rekaman kuliah juga dapat ditranskrip lalu diringkas. Namun berhati-hatilah, istilah Arab sering salah tertangkap, jadi tandai bagian yang janggal.", cue: null },
  "prompts:belajar": { say: "Ini prompt penguji yang akan Anda pakai. Perhatikan kalimat 'jangan beri jawaban sebelum aku menjawab'. Silakan salin sekarang.", cue: "Minta peserta menyalinnya." },
  "task:belajar": { say: "Ini tugas terpanjang, dua puluh menit. Satu bab diktat menjadi satu set belajar: ringkasan, lima flashcard, lima soal, dan skor ujian Anda. Jangan lupa, tutup layar lalu tulis ulang dengan kata-kata Anda sendiri. Bagian yang tidak dapat Anda tulis adalah bagian yang belum Anda pahami.", cue: "Timer 20 menit. Berkeliling, tugas ini yang paling banyak membutuhkan bantuan." },

  "ch:adab": { say: "Bab empat. Ilmu adalah amanah. Setelah mampu memakai AI, kita pastikan hasilnya benar dan cara memakainya beradab.", cue: "8 menit materi lalu 15 menit tugas." },
  "sec:adab:0": { say: "Tiga cek: nama, halaman, dan matan. Inilah yang kita lakukan pada demo tadi. Periksa di Maktabah Syamilah atau perpustakaan.", cue: "Lanjut ke visual tiga cek." },
  "viz:threechecks": { say: "Satu referensi baru boleh dipakai bila lolos ketiganya. Menurut saya, inilah yang membedakan penuntut ilmu dari sekadar pengguna AI.", cue: null },
  "sec:adab:1": { say: "Memakai AI untuk memahami, berlatih, dan menyusun kerangka adalah hal yang wajar. Tetapi menyerahkan hasil AI sebagai karya sendiri adalah ketidakjujuran. Ikutilah aturan dosen dan kampus.", cue: null },
  "sec:adab:2": { say: "Ada kaidah al-umur bi maqashidiha: AI adalah wasilah, nilainya mengikuti tujuan dan cara pemakaiannya. Namun hukum syar'i dan fatwa tidak disandarkan pada jawaban AI. Rujuklah ulama dan kitab muktabar.", cue: "Poin sensitif, sampaikan dengan tenang." },
  "sec:adab:3": { say: "Soal privasi, jangan mengunggah data pribadi atau dokumen rahasia. Periksa juga pengaturannya: apakah percakapan Anda digunakan untuk melatih model.", cue: null },
  "sec:adab:4": { say: "Yang paling penting, AI tidak memiliki sanad dan tidak bertanggung jawab atas jawabannya. Talaqqi tetap menjadi jalan utama. AI hanya membantu persiapan.", cue: "Beri jeda sejenak." },
  "task:adab": { say: "Tugas lima belas menit. Minta AI menyebutkan tiga referensi, lakukan tiga cek, isi tabel lolos atau tidak, dan tulis satu aturan pribadi. Nanti kita bandingkan dengan demo di awal.", cue: "Timer 15 menit. Setelah selesai tanyakan: berapa yang lolos?" },

  "ch:pendidikan": { say: "Bab lima. Kita naik satu tingkat: bagaimana memaksimalkan AI untuk memudahkan belajar, dan di mana Talqeeh berperan.", cue: "20 menit materi lalu 15 menit tugas." },
  "sec:pendidikan:0": { say: "AI dapat menyesuaikan kecepatan, tingkat kesulitan, dan gaya penjelasan untuk setiap orang. Umpan baliknya pun langsung, tanpa menunggu pertemuan berikutnya.", cue: null },
  "sec:pendidikan:1": { say: "Ada lima cara memaksimalkan: pakai sumber sendiri, belajar aktif, sesuaikan level dan gaya, putar siklusnya, dan kenali konteks Azhar. Mohon diingat kelimanya, sebentar lagi kita cocokkan.", cue: "Minta peserta mengingat kelimanya." },
  "sec:pendidikan:2": { say: "Di sinilah Talqeeh berperan. Saya mengalaminya sendiri selama sepuluh tahun di sini: diktat Arab yang tebal, istilah yang sulit, dan waktu ujian yang kadang sudah mepet. Sementara itu, kebanyakan alat AI terlalu umum. Dari situ saya terpikir membangun satu tempat yang merangkum lima cara tadi. Prinsipnya: AI menyuburkan pemahaman, bukan menggantikan guru atau kitab.", cue: "Ceritakan dengan pengalaman Anda sendiri. Lanjut ke screenshot." },
  "shot:landing": { say: "Ini beranda Talqeeh. Satu tempat untuk belajar muqarrar, dengan library dan AI Partner.", cue: "Tunggu sorotan emas muncul." },
  "shot:katalog": { say: "Library berisi enam puluh satu maddah S1 dan dua puluh tujuh maddah Ma'had, dengan lebih dari seribu template prompt. Ini terhubung dengan cara 'sesuaikan level dan gaya'.", cue: null },
  "shot:sample": { say: "Contoh satu maddah: ada kitab utamanya, AI yang paling cocok, dan cara pakainya. Sample ini gratis dan tanpa login. Nanti ada QR-nya di akhir.", cue: null },
  "shot:aipartner-beranda": { say: "Ini beranda AI Partner. Satu kotak untuk bertanya atau mengunggah materi, ada aksi cepat, dan jawabannya disesuaikan dengan profil belajar Anda.", cue: null },
  "shot:aipartner-ringkasan": { say: "Dari diktat PDF atau foto, menjadi ringkasan, peta konsep, serta materi dan i'rab. Dapat dalam bahasa Indonesia, Arab, atau dwibahasa. Inilah yang dimaksud dengan memakai sumber sendiri.", cue: null },
  "shot:aipartner-latihan": { say: "Flashcard dan kuis dibuat dari materi yang sama. Ini wujud dari 'putar siklusnya': paham, hafal, uji.", cue: null },
  "shot:aipartner-tutor": { say: "Dan ini tutor. Ia menjawab berdasarkan isi materi Anda, serta ada simulasi syafawi untuk latihan ujian lisan. Namun saya tegaskan, Talqeeh adalah alat bantu, bukan pengganti guru.", cue: "Jujur soal batas alatnya." },
  "sec:pendidikan:3": { say: "Jadi siapa mengerjakan apa? AI menyiapkan, merangkum, dan melatih. Guru membimbing, menilai, dan memberi sanad. Anda yang memahami dan bertanggung jawab.", cue: "Lanjut ke visual pembagian peran." },
  "viz:spectrum": { say: "Makin ke kanan, makin harus dipegang manusia, guru, dan kitab. Ini ilustrasi pembagian peran. Bila ada yang tidak setuju dengan posisi suatu titik, itu bagus, dan menjadi bahan diskusi.", cue: "Ajak 1 peserta membantah satu titik." },
  "sec:pendidikan:4": { say: "Soal penilaian: pendeteksi tulisan AI tidak andal. Pendekatan yang lebih sehat adalah ujian lisan, tugas berproses, dan kemampuan menjelaskan karya sendiri. Aturan tiap dosen bisa berbeda, jadi tanyakan, ikuti, dan sebutkan penggunaan AI bila diminta.", cue: null },
  "sec:pendidikan:5": { say: "Memahami batas AI kini menjadi kemampuan dasar. Aksesnya belum merata, dan keilmuan Islam dapat kurang terwakili dalam data latihnya, sehingga verifikasi menjadi makin penting.", cue: null },
  "sec:pendidikan:6": { say: "Terakhir, alatnya akan terus berganti. Tetapi kebiasaan memverifikasi, jujur, dan berguru tidak akan berganti.", cue: "Singkat saja, 1 menit." },
  "task:pendidikan": { say: "Tugas lima belas menit. Tulis satu kesulitan belajar Anda, bagi peran AI dan guru, coba satu fitur Talqeeh, lalu tulis tiga aturan pemakaian AI untuk diri sendiri. Silakan buka sample gratis atau AI Partner.", cue: "Timer 15 menit. Bantu yang belum punya akun lewat sample gratis." },

  "ch:praktik": { say: "Bab terakhir. Kita ubah seluruh hasil tadi menjadi rencana tujuh hari.", cue: "5 menit materi lalu 10 menit tugas." },
  "sec:praktik:0": { say: "Rencananya: hari pertama ringkas, hari kedua kuis, hari ketiga perbaiki, hari keempat dan kelima tutor penguji, hari keenam flashcard, dan hari ketujuh simulasi ujian tanpa catatan.", cue: "Lanjut ke visual timeline." },
  "viz:sevenday": { say: "Hari ketujuh ditandai penuh karena itulah tujuannya: simulasi ujian.", cue: null },
  "sec:praktik:1": { say: "Ada empat kebiasaan: mulai kecil, pakai paket belajar Anda, tetap verifikasi, dan cari teman belajar.", cue: null },
  "task:praktik": { say: "Tugas terakhir, sepuluh menit. Isi jadwal hari pertama sampai ketujuh dengan jam yang realistis, dan tentukan tanggal mulainya.", cue: "Timer 10 menit. Minta beberapa orang menyebutkan tanggal mulainya." },

  outputs: { say: "Inilah enam hasil kerja Anda. Selamat, semuanya Anda susun sendiri dalam tiga jam.", cue: "Waktu penutup total 8 menit." },
  worksheet: { say: "Silakan scan QR ini untuk membuka lembar kerja Anda. Isiannya tersimpan di HP, dan dapat disalin, diunduh, atau dikirim ke WhatsApp. Saya beri waktu satu menit untuk scan.", cue: "Tunggu sampai kamera peserta terarah. QR ini berisi tautan materi." },
  cta: { say: "Bagi yang ingin melanjutkan, ada dua pilihan. Coba sample gratis tanpa login, atau bergabung untuk memperoleh library lengkap dan AI Study Partner. Silakan scan.", cue: "Bila ada penawaran khusus peserta, sebutkan di sini (isi SEMINAR_CTA_OFFER). Tawarkan dengan jujur, tanpa menekan." },
  closing: { say: "Saya tutup dengan satu kalimat: teknologi terbaik bukanlah yang menggantikan kita belajar, tetapi yang membuat kita dapat belajar lebih baik. Terima kasih, teman-teman. Sekarang kita buka sesi tanya jawab, dan kabar selanjutnya dapat diikuti di @ai.gypt.", cue: "Sisa waktu untuk tanya jawab." },
};

Object.assign(window, { SEMINAR_NOTES });
