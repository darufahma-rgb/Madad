/* Catatan pemateri untuk seminar 3 jam (peserta S1 Masisir).
   Kunci mengikuti `key` slide di seminar-slides.jsx: title, hook-*, agenda, ch:<bab>, sec:<bab>:<urutan>,
   viz:<id>, shot:<id>, prompts:<bab>, task:<bab>, outputs, worksheet, cta, closing.
   say = yang disampaikan. cue = isyarat tindakan (tanya, demo, timer). */
const SEMINAR_NOTES = {
  title: {
    say: "Sapa peserta, perkenalkan diri singkat: mahasiswa S2 Al-Azhar yang hampir sepuluh tahun di Mesir dan pendiri AIGYPT. Sampaikan bahwa seminar ini praktik, bukan ceramah: tiap bab ditutup tugas.",
    cue: "Pastikan peserta sudah punya HP atau laptop terbuka. Waktu: 1 menit.",
  },
  "hook-poll": {
    say: "Mulai dengan angkat tangan. Hitung kira-kira berapa yang memakai AI tiap hari, kadang-kadang, belum pernah. Lalu tanya yang kedua: siapa yang pernah dapat jawaban salah tapi terdengar yakin? Biasanya banyak yang angkat tangan.",
    cue: "Tanya audiens. Sebut hasilnya keras-keras ('hampir separuh'). Waktu: 2 menit.",
  },
  "hook-demo": {
    say: "Jalankan prompt di layar langsung ke AI. Minta tiga kitab, pengarang, jilid, halaman, dan kutipan matan. Lalu ajak peserta mengecek satu per satu di Maktabah Syamilah atau kitab yang kamu bawa. Biarkan temuan salahnya muncul dari peserta sendiri.",
    cue: "DEMO LIVE. Coba dulu di rumah dengan alat yang sama. Siapkan kitab aslinya (mis. Ahkam al-Qur'an dan Al-Jami' li Ahkam al-Qur'an) supaya cek cepat. Kalau internet mati, ceritakan hasil percobaanmu. Waktu: 3 menit.",
  },
  "hook-goals": {
    say: "Sebutkan tiga kemampuan yang akan mereka bawa pulang, lalu janjikan Paket Belajar AI Pribadi: enam output yang dibuat sendiri hari ini. Pastikan semua sudah menyiapkan HP atau laptop, satu bab diktat, dan akun salah satu alat AI.",
    cue: "Cek siapa yang belum punya akun AI, minta berbagi dengan teman sebelah. Waktu: 1 menit.",
  },
  agenda: {
    say: "Tunjukkan peta waktunya: enam bab, tiap bab ada materi singkat lalu tugas, dengan istirahat sepuluh menit setelah Bab 2. Tegaskan bahwa jam akan dijaga ketat supaya semua tugas sempat dikerjakan.",
    cue: "Jangan dibahas panjang. Waktu: 1 menit.",
  },

  "ch:fundamental": { say: "Bab 1: sebelum memakai AI, kita pahami dulu apa itu dan kenapa ia bisa salah. Targetnya satu hal: tahu kapan AI bisa dipercaya.", cue: "12 menit materi lalu 10 menit tugas." },
  "sec:fundamental:0": { say: "Ceritakan peta istilah dari yang paling luas ke yang paling spesifik. Jangan mengejar definisi teknis, cukup agar peserta bisa membedakan AI, machine learning, deep learning, dan LLM.", cue: "Diikuti visual lingkaran bersarang." },
  "viz:nesting": { say: "Tunjukkan bahwa tiap lapisan ada di dalam yang sebelumnya. ChatGPT, Claude, dan Gemini berada di lapisan paling dalam, yaitu LLM.", cue: "Biarkan animasi selesai sebelum bicara." },
  "sec:fundamental:1": { say: "LLM memecah teks jadi token dan memprediksi token berikutnya. Ia tidak membuka database lalu mengutip. Inilah akar dari semua masalah yang akan kita bahas.", cue: "Diikuti visual prediksi kata." },
  "viz:nexttoken": { say: "Tunjuk batang teratas: model memilih kata yang paling mungkin, bukan yang paling benar. Catatan di bawah menegaskan angkanya hanya contoh.", cue: "Ajak peserta menebak kata berikutnya sebelum batang muncul." },
  "sec:fundamental:2": { say: "Hubungkan dengan demo di awal: halusinasi terjadi karena model dilatih menghasilkan teks yang masuk akal, bukan yang terjamin benar. Paling rawan: nama kitab, halaman, nomor hadis, dan kutipan persis.", cue: "Ingatkan hasil demo tadi." },
  "sec:fundamental:3": { say: "Seimbangkan: AI sangat kuat untuk menjelaskan ulang, merangkum, menerjemah, dan membuat latihan. Lemah untuk fakta spesifik tanpa sumber. Jangan menakut-nakuti, ajarkan memilih tugas yang tepat.", cue: null },
  "sec:fundamental:4": { say: "Empat jenis alat: chatbot umum, berbasis sumber (NotebookLM), pencari dengan sitasi, dan alat khusus domain. Aturan praktisnya: makin berbahaya akibat salahnya, makin perlu alat yang bersumber.", cue: "Tanya: alat apa yang paling sering mereka pakai?" },
  "task:fundamental": { say: "Beri aba-aba tugas: tiga pertanyaan dari bab kitab yang mereka pegang, cocokkan dengan kitab, tandai benar, meleset, atau terdengar benar tapi tidak ada. Keliling dan lihat apakah ada yang menemukan halusinasi.", cue: "Mulai timer 10 menit (tekan T). Setelah selesai, minta 2 orang menyebut temuan." },

  "ch:prompting": { say: "Bab 2: kualitas jawaban sangat ditentukan kualitas perintah. Kita pakai satu rumus sederhana lima bagian.", cue: "12 menit materi lalu 15 menit tugas." },
  "sec:prompting:0": { say: "Jelaskan lima bagian: peran, konteks, tugas, format, batasan. Beri contoh singkat dari mata kuliah yang dekat dengan mereka.", cue: "Diikuti visual rumus." },
  "viz:formula": { say: "Tunjukkan contoh nahwu yang tersusun bertahap. Tekankan bagian batasan: 'jangan mengarang kutipan kitab' langsung menyambung ke bab halusinasi.", cue: null },
  "sec:prompting:1": { say: "Prompt pertama jarang jadi hasil akhir. Ajarkan kebiasaan memperbaiki dengan permintaan spesifik, dan meminta AI bertanya balik bila informasinya kurang.", cue: null },
  "sec:prompting:2": { say: "Beri satu atau dua contoh hasil yang diinginkan, AI mengikuti polanya dengan sangat baik.", cue: null },
  "sec:prompting:3": { say: "Sebutkan bahasa keluaran dengan jelas, misalnya Indonesia dengan istilah Arab berharakat. Sebut juga level dan mazhab bila relevan.", cue: null },
  "sec:prompting:4": { say: "Empat kesalahan umum. Minta peserta jujur: yang mana paling sering mereka lakukan?", cue: "Angkat tangan per kesalahan, cepat saja." },
  "prompts:prompting": { say: "Bandingkan dua prompt dengan topik yang sama. Minta peserta menyebut apa yang membedakan, lalu cocokkan dengan lima bagian tadi.", cue: "Tanya audiens sebelum menjelaskan." },
  "task:prompting": { say: "Tugas: tulis versi singkat, jalankan, tulis ulang dengan lima bagian, jalankan lagi, perbaiki sekali. Tekankan output berupa satu prompt andalan yang siap dipakai ulang.", cue: "Timer 15 menit. Keliling dan bantu yang macet." },

  "ch:belajar": { say: "Bab 3: ini inti bagi mahasiswa. Kita pakai AI untuk belajar aktif, bukan hanya membaca ringkasan yang rapi.", cue: "12 menit materi lalu 20 menit tugas (tugas terpanjang)." },
  "sec:belajar:0": { say: "Tempel materi per bagian, bukan seluruh diktat sekaligus. Minta ringkasan tiga level dan daftar istilah sulit.", cue: null },
  "sec:belajar:1": { say: "Peta konsep cocok untuk materi yang banyak pembagian, seperti ushul fiqh, mustalah hadis, atau balaghah.", cue: null },
  "sec:belajar:2": { say: "Minta i'rab beserta alasannya, lalu cek ke kitab nahwu. Anjurkan mencoba i'rab sendiri dulu sebelum bertanya.", cue: null },
  "sec:belajar:3": { say: "Ubah AI jadi penguji: satu pertanyaan sekali jalan, tunggu jawaban, baru koreksi. Ini jauh lebih membekas daripada membaca penjelasan.", cue: "Tunjukkan prompt tutor yang menguji di slide berikutnya." },
  "sec:belajar:4": { say: "Ulangi berjarak: hari 1, 3, 7, 14. Mengingat berulang dengan jeda lebih kuat daripada mengulang sekali panjang.", cue: "Diikuti visual kurva lupa." },
  "viz:forgetting": { say: "Garis emas turun lalu dinaikkan lagi tiap sesi mengulang, dan turunnya makin landai. Tegaskan ini ilustrasi konsep, bukan data pengukuran.", cue: "Tunjuk catatan 'ilustrasi' di bawah." },
  "sec:belajar:5": { say: "Rekaman kuliah bisa ditranskrip lalu diringkas. Ingatkan: istilah Arab sering salah tertangkap, jadi tandai bagian yang janggal.", cue: null },
  "prompts:belajar": { say: "Salin prompt penguji ini untuk tugas. Tekankan frasa 'jangan beri jawaban sebelum aku menjawab'.", cue: "Minta peserta menyalinnya sekarang." },
  "task:belajar": { say: "Tugas terbesar: satu bab diktat menjadi set belajar berisi ringkasan, lima flashcard, lima soal, dan skor ujian. Ingatkan untuk menutup layar dan menulis ulang dengan kata sendiri.", cue: "Timer 20 menit. Keliling, ini yang paling banyak butuh bantuan." },

  "ch:adab": { say: "Bab 4: ilmu itu amanah. Setelah bisa memakai AI, kita pastikan hasilnya benar dan cara memakainya beradab.", cue: "8 menit materi lalu 15 menit tugas." },
  "sec:adab:0": { say: "Tiga cek: nama, halaman, matan. Hubungkan dengan demo di awal dan cara mengeceknya di Maktabah Syamilah atau perpustakaan.", cue: "Diikuti visual tiga cek." },
  "viz:threechecks": { say: "Satu referensi baru boleh dipakai setelah lolos ketiganya. Tekankan: ini yang membedakan penuntut ilmu dari sekadar pengguna AI.", cue: null },
  "sec:adab:1": { say: "Memakai AI untuk memahami, berlatih, dan menyusun kerangka itu wajar. Menyerahkan hasil AI sebagai karya sendiri tidak jujur. Ikuti aturan dosen dan kampus.", cue: null },
  "sec:adab:2": { say: "Gunakan kaidah al-umur bi maqashidiha: AI itu wasilah, nilainya mengikuti tujuan dan cara pakai. Hukum syar'i dan fatwa tidak disandarkan pada jawaban AI, rujuklah ulama dan kitab muktabar.", cue: "Poin ini sensitif, sampaikan dengan tenang." },
  "sec:adab:3": { say: "Jangan mengunggah data pribadi atau dokumen rahasia. Ajak peserta mengecek pengaturan: apakah percakapan dipakai melatih model.", cue: null },
  "sec:adab:4": { say: "AI tidak punya sanad dan tidak bertanggung jawab atas jawabannya. Talaqqi tetap jalan utama, AI membantu persiapan.", cue: "Ini penutup yang menyentuh, beri jeda sejenak." },
  "task:adab": { say: "Tugas: minta tiga referensi, lakukan tiga cek, isi tabel lolos atau tidak, tulis satu aturan pribadi. Bandingkan dengan demo di awal.", cue: "Timer 15 menit. Setelah selesai, tanya: berapa yang lolos?" },

  "ch:pendidikan": { say: "Bab 5: kita naik satu tingkat. Bagaimana memaksimalkan AI untuk memudahkan belajar, dan di mana Talqeeh masuk.", cue: "20 menit materi lalu 15 menit tugas." },
  "sec:pendidikan:0": { say: "AI bisa menyesuaikan kecepatan, tingkat kesulitan, dan gaya penjelasan, serta memberi umpan balik instan.", cue: null },
  "sec:pendidikan:1": { say: "Lima cara memaksimalkan: pakai sumber sendiri, belajar aktif, sesuaikan level, putar siklus, dan kenali konteks Azhar. Lima ini akan kita cocokkan dengan Talqeeh.", cue: "Minta peserta mengingat kelima cara itu." },
  "sec:pendidikan:2": { say: "Inilah titik masuk Talqeeh. Ceritakan masalahnya, lalu tunjukkan bahwa Talqeeh merangkai kelima cara tadi dalam satu tempat. Pertegas prinsipnya: AI menyuburkan pemahaman, bukan menggantikan guru dan kitab.", cue: "Ceritakan dengan pengalaman pribadi singkat. Lanjut ke screenshot." },
  "shot:landing": { say: "Perkenalkan Talqeeh lewat beranda: satu tempat untuk muqarrar Al-Azhar, dengan library dan AI Partner.", cue: "Tunggu sorotan emas muncul." },
  "shot:katalog": { say: "Library berisi 61 maddah S1 dan 27 maddah Ma'had dengan lebih dari seribu template prompt. Hubungkan dengan 'sesuaikan level dan gaya'.", cue: null },
  "shot:sample": { say: "Contoh satu maddah: kitab utama, AI yang paling cocok, dan cara pakai. Sebutkan bahwa sample ini gratis tanpa login, nanti ada QR-nya di akhir.", cue: null },
  "shot:aipartner-beranda": { say: "Beranda AI Partner: satu kotak untuk bertanya atau unggah materi, dengan aksi cepat dan penyesuaian ke profil belajar.", cue: null },
  "shot:aipartner-ringkasan": { say: "Dari diktat PDF atau foto jadi ringkasan, peta konsep, materi dan i'rab, dalam bahasa Indonesia, Arab, atau dwibahasa. Ini cara 'pakai sumbermu sendiri'.", cue: null },
  "shot:aipartner-latihan": { say: "Flashcard dan kuis dibuat dari materi yang sama. Ini wujud 'putar siklusnya': pahami, hafalkan, uji.", cue: null },
  "shot:aipartner-tutor": { say: "Tutor menjawab berdasarkan isi materimu, dan ada simulasi syafawi untuk latihan ujian lisan. Ini 'belajar aktif'.", cue: "Jujur: jelaskan Talqeeh adalah alat bantu, tidak mengganti guru." },
  "sec:pendidikan:3": { say: "AI menyiapkan, merangkum, melatih. Guru membimbing, menilai, dan memberi sanad. Kamu yang memahami dan bertanggung jawab.", cue: "Diikuti visual pembagian peran." },
  "viz:spectrum": { say: "Makin ke kanan makin harus dipegang manusia, guru, dan kitab. Tegaskan ini ilustrasi pembagian peran.", cue: "Ajak peserta menggeser satu titik jika mereka tidak setuju, itu bahan diskusi." },
  "sec:pendidikan:4": { say: "Pendeteksi tulisan AI tidak andal. Pendekatan sehat: ujian lisan, tugas berproses, dan menjelaskan karya sendiri. Aturan dosen berbeda-beda, tanyakan dan ikuti.", cue: null },
  "sec:pendidikan:5": { say: "Memahami batas AI kini kemampuan dasar. Akses dan bahasa tidak merata, dan konteks keilmuan Islam bisa kurang terwakili sehingga verifikasi makin penting.", cue: null },
  "sec:pendidikan:6": { say: "Alatnya akan terus berganti, tetapi kebiasaan memverifikasi, jujur, dan berguru tidak.", cue: "Singkat saja, 1 menit." },
  "task:pendidikan": { say: "Tugas: satu kesulitan belajar, bagi peran AI dan guru, coba satu fitur Talqeeh, tulis tiga aturan pribadi. Sarankan membuka sample gratis atau AI Partner untuk mencoba langsung.", cue: "Timer 15 menit. Bantu yang belum punya akun dengan sample gratis." },

  "ch:praktik": { say: "Bab 6: kita ubah semua hasil tadi menjadi rencana tujuh hari.", cue: "5 menit materi lalu 10 menit tugas." },
  "sec:praktik:0": { say: "Rencana baku: ringkas, kuis, perbaiki, tutor penguji dua hari, flashcard, lalu simulasi ujian tanpa catatan.", cue: "Diikuti visual timeline." },
  "viz:sevenday": { say: "Hari ketujuh bertanda penuh karena itu tujuannya: simulasi ujian.", cue: null },
  "sec:praktik:1": { say: "Empat kebiasaan: mulai kecil, pakai paket belajarmu, tetap verifikasi, cari teman belajar.", cue: null },
  "task:praktik": { say: "Tugas terakhir: isi jadwal hari 1 sampai 7 dengan jam yang realistis dan tentukan tanggal mulai.", cue: "Timer 10 menit. Minta beberapa peserta menyebut tanggal mulainya." },

  outputs: { say: "Tunjukkan enam output yang kini sudah mereka punya. Ucapkan selamat, ini hasil kerja mereka sendiri dalam tiga jam.", cue: "Waktu penutup total 8 menit." },
  worksheet: { say: "Minta semua scan QR untuk membuka lembar kerja. Isianmu tersimpan di HP, lalu bisa disalin, diunduh, atau dikirim ke WhatsApp. Beri waktu satu menit untuk scan.", cue: "Tunggu sampai kamera terarah. QR ini berisi tautan rahasia materi." },
  cta: { say: "Ajakan lanjut: coba sample gratis tanpa login, atau gabung untuk library lengkap dan AI Study Partner. Sebutkan penawaran khusus peserta jika ada (isi SEMINAR_CTA_OFFER).", cue: "Beri waktu scan. Jangan menekan, tawarkan dengan jujur." },
  closing: { say: "Tutup dengan kalimat penutup: teknologi terbaik adalah yang membuat manusia belajar lebih baik. Buka tanya jawab dan arahkan ke @ai.gypt untuk kabar berikutnya.", cue: "Sisa waktu untuk tanya jawab." },
};

Object.assign(window, { SEMINAR_NOTES });
