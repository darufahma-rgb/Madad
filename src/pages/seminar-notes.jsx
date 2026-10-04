/* Catatan pemateri untuk seminar 3 jam (peserta S1 Masisir), ditulis sebagai kalimat yang bisa diucapkan langsung.
   Kunci mengikuti `key` slide di seminar-slides.jsx: title, hook-*, agenda, ch:<bab>, sec:<bab>:<urutan>,
   viz:<id>, shot:<id>, prompts:<bab>, task:<bab>, outputs, worksheet, cta, closing.
   say = yang diucapkan (gaya: gue, kita, kalian). cue = isyarat tindakan untuk diri sendiri. */
const SEMINAR_NOTES = {
  title: {
    say: "Assalamu'alaikum, teman-teman. Gue Daru, mahasiswa S2 Al-Azhar, dan udah hampir sepuluh tahun hidup di Mesir. Hari ini kita nggak cuma dengerin gue ngomong. Tiap bab ada tugas, dan di akhir kalian pulang bawa hasil kerja kalian sendiri.",
    cue: "Pastikan HP atau laptop peserta sudah terbuka. 1 menit.",
  },
  "hook-poll": {
    say: "Sebelum mulai, gue mau tanya dulu. Siapa di sini yang pernah pakai AI buat belajar? Hampir tiap hari? Kadang-kadang? Belum pernah? Oke. Terus yang kedua: siapa yang pernah dapet jawaban AI yang salah, tapi nulisnya meyakinkan banget? Nah, itu normal. Dan itu persis yang bakal kita bahas hari ini.",
    cue: "Hitung kasar lalu sebut hasilnya keras-keras ('hampir separuh'). 2 menit.",
  },
  "hook-demo": {
    say: "Sekarang gue buktiin langsung. Gue tanya AI soal tiga kitab tafsir ayat ahkam yang bahas ayat riba, lengkap sama pengarang, jilid, halaman, dan kutipan matannya. Kita lihat jawabannya, terus kita cek bareng-bareng. Nama kitabnya ada nggak? Halamannya cocok nggak? Matannya sama nggak? Nanti kita hitung berapa yang lolos.",
    cue: "DEMO LIVE. Coba dulu di rumah dengan alat yang sama. Siapkan kitab aslinya (mis. Ahkam al-Qur'an dan Al-Jami' li Ahkam al-Qur'an) supaya cek cepat. Kalau internet mati, ceritakan hasil percobaanmu. 3 menit.",
  },
  "hook-goals": {
    say: "Target gue hari ini sederhana. Setelah tiga jam, kalian tahu kapan AI boleh dipercaya dan kapan harus dicek. Kalian bisa nulis prompt yang tepat sasaran. Dan kalian punya cara belajar aktif pakai AI. Semua itu bakal jadi enam hasil kerja yang kalian bikin sendiri, namanya Paket Belajar AI Pribadi. Pastiin HP atau laptop, satu bab diktat, dan satu akun AI udah siap ya.",
    cue: "Cek siapa yang belum punya akun, suruh gabung ke teman sebelah. 1 menit.",
  },
  agenda: {
    say: "Ini peta kita hari ini. Enam bab, tiap bab ada materi singkat terus tugas. Ada istirahat sepuluh menit setelah bab dua. Jam-nya gue jaga ketat biar semua tugas sempat dikerjain.",
    cue: "Jangan dibahas panjang. 1 menit.",
  },

  "ch:fundamental": { say: "Bab satu. Sebelum pakai AI, kita pahami dulu dia itu apa dan kenapa bisa salah. Targetnya satu: kalian tahu kapan AI bisa dipercaya.", cue: "12 menit materi lalu 10 menit tugas." },
  "sec:fundamental:0": { say: "Pertama, peta istilahnya, dari yang paling luas. AI itu payungnya. Di dalamnya ada machine learning, di dalamnya lagi deep learning, dan di dalamnya lagi LLM. Gue nggak minta kalian hafal definisi teknis. Cukup bisa bedain keempatnya.", cue: "Lanjut ke visual lingkaran." },
  "viz:nesting": { say: "Lihat, tiap lapisan ada di dalam lapisan sebelumnya. ChatGPT, Claude, Gemini, semuanya ada di lingkaran paling dalam, yaitu LLM.", cue: "Tunggu animasi selesai sebelum bicara." },
  "sec:fundamental:1": { say: "Cara kerja LLM, versi sederhana. Teks dipecah jadi potongan kecil namanya token. Terus model nebak token berikutnya berdasarkan pola yang dia pelajari. Dia nggak buka database terus ngutip. Ini akar dari semua masalah yang bakal kita bahas.", cue: "Lanjut ke visual prediksi kata." },
  "viz:nexttoken": { say: "Coba tebak dulu kata berikutnya. Nah, lihat batang paling atas. Model milih kata yang paling mungkin, bukan yang paling benar. Angka di sini cuma contoh ya, bukan keluaran model tertentu.", cue: "Ajak peserta menebak sebelum batang muncul." },
  "sec:fundamental:2": { say: "Makanya ada halusinasi. Model dilatih biar tulisannya masuk akal, bukan biar pasti benar. Yang paling rawan itu nama kitab, halaman, nomor hadis, dan kutipan persis. Inget demo tadi? Itu contohnya.", cue: "Sambungkan ke hasil demo." },
  "sec:fundamental:3": { say: "Tapi jangan salah paham, AI itu kuat banget buat jelasin ulang, ngerangkum, nerjemah, dan bikin latihan soal. Dia lemah di fakta spesifik yang nggak ada sumbernya. Jadi bukan soal takut pakai AI, tapi soal milih tugas yang cocok.", cue: null },
  "sec:fundamental:4": { say: "Alatnya ada empat jenis. Chatbot umum, alat berbasis sumber kayak NotebookLM, pencari yang kasih sitasi, dan alat khusus domain. Aturan gampangnya: makin bahaya kalau salah, makin perlu alat yang ada sumbernya.", cue: "Tanya: alat apa yang paling sering kalian pakai?" },
  "task:fundamental": { say: "Waktunya tugas, sepuluh menit. Pilih satu bab kitab yang lagi kalian pegang. Ajukan tiga pertanyaan ke AI: satu definisi, satu detail, satu contoh. Cocokin sama kitab kalian, terus tandai: benar, meleset, atau terdengar benar tapi nggak ada di kitab. Gue keliling ya.", cue: "Timer 10 menit (tekan T). Setelah selesai, minta 2 orang cerita temuannya." },

  "ch:prompting": { say: "Bab dua. Kualitas jawaban AI itu sangat ditentuin sama kualitas perintah kita. Kita pakai satu rumus sederhana, lima bagian.", cue: "12 menit materi lalu 15 menit tugas." },
  "sec:prompting:0": { say: "Lima bagiannya: peran, konteks, tugas, format, dan batasan. Gue kasih contoh dari nahwu biar dekat sama kalian.", cue: "Lanjut ke visual rumus." },
  "viz:formula": { say: "Lihat, contohnya tersusun pelan-pelan. Perhatiin yang terakhir, batasan: jangan mengarang kutipan kitab. Itu yang langsung nyambung ke halusinasi tadi.", cue: null },
  "sec:prompting:1": { say: "Prompt pertama jarang jadi hasil akhir, dan itu normal. Kebiasaan yang bagus itu memperbaiki pelan-pelan dengan permintaan yang spesifik. Kalau informasinya kurang, minta AI nanya balik, jangan biarin dia nebak.", cue: null },
  "sec:prompting:2": { say: "Trik berikutnya: kasih satu atau dua contoh hasil yang kalian mau. AI jago banget ngikutin pola dari contoh.", cue: null },
  "sec:prompting:3": { say: "Soal bahasa Arab. Sebutin dengan jelas bahasa keluarannya, misalnya penjelasan Indonesia tapi istilahnya Arab berharakat. Sebutin juga levelnya, dan mazhabnya kalau relevan.", cue: null },
  "sec:prompting:4": { say: "Ada empat kesalahan yang paling sering. Coba jujur, yang mana yang paling sering kalian lakuin?", cue: "Angkat tangan per poin, cepat saja." },
  "prompts:prompting": { say: "Bandingin dua prompt ini, topiknya sama. Menurut kalian apa bedanya? Betul, yang kedua ngikutin lima bagian tadi.", cue: "Tanya dulu sebelum menjelaskan." },
  "task:prompting": { say: "Tugas lima belas menit. Tulis prompt singkat, jalanin. Terus tulis ulang pakai lima bagian, jalanin lagi. Perbaiki sekali lagi sesuai kekurangan hasilnya. Hasil akhirnya satu prompt andalan yang bisa kalian pakai berkali-kali.", cue: "Timer 15 menit. Keliling dan bantu yang macet." },

  "ch:belajar": { say: "Bab tiga, ini inti buat kalian sebagai mahasiswa. Kita pakai AI buat belajar aktif, bukan cuma baca ringkasan yang rapi.", cue: "12 menit materi lalu 20 menit tugas (tugas terpanjang)." },
  "sec:belajar:0": { say: "Ngerangkum diktat tebal. Tempel materinya per bagian, jangan seluruh diktat sekaligus. Minta ringkasan tiga level dan daftar istilah yang sulit.", cue: null },
  "sec:belajar:1": { say: "Peta konsep. Cocok banget buat materi yang banyak pembagiannya, kayak ushul fiqh, mustalah hadis, atau balaghah.", cue: null },
  "sec:belajar:2": { say: "Mufradat dan i'rab. Minta i'rab beserta alasannya, terus cek ke kitab nahwu. Dan coba i'rab sendiri dulu sebelum nanya.", cue: null },
  "sec:belajar:3": { say: "Ini yang menurut gue paling penting: jadiin AI itu penguji. Satu pertanyaan sekali jalan, tunggu jawaban kalian, baru dikoreksi. Ini jauh lebih nempel daripada baca penjelasan yang rapi.", cue: "Prompt-nya ada di slide berikutnya." },
  "sec:belajar:4": { say: "Terus ulangi berjarak: hari pertama, ketiga, ketujuh, keempat belas. Ngulang dengan jeda lebih kuat daripada ngulang sekali panjang.", cue: "Lanjut ke visual kurva lupa." },
  "viz:forgetting": { say: "Garis emas turun, terus naik lagi tiap kali kita ngulang, dan turunnya makin landai. Ini ilustrasi konsep, bukan data pengukuran ya.", cue: "Tunjuk catatan 'ilustrasi' di bawah." },
  "sec:belajar:5": { say: "Rekaman kuliah juga bisa ditranskrip terus diringkas. Tapi hati-hati, istilah Arab sering salah ketangkap, jadi tandai bagian yang janggal.", cue: null },
  "prompts:belajar": { say: "Ini prompt penguji yang bakal kalian pakai. Perhatiin kalimat 'jangan beri jawaban sebelum aku menjawab'. Salin sekarang.", cue: "Minta peserta menyalinnya." },
  "task:belajar": { say: "Ini tugas terpanjang, dua puluh menit. Satu bab diktat jadi satu set belajar: ringkasan, lima flashcard, lima soal, dan skor ujian kalian. Jangan lupa, tutup layar dan tulis ulang dengan kata-kata kalian sendiri. Bagian yang nggak bisa kalian tulis, itu yang belum kalian pahami.", cue: "Timer 20 menit. Keliling, ini yang paling banyak butuh bantuan." },

  "ch:adab": { say: "Bab empat. Ilmu itu amanah. Setelah bisa pakai AI, kita pastikan hasilnya benar dan cara kita memakainya beradab.", cue: "8 menit materi lalu 15 menit tugas." },
  "sec:adab:0": { say: "Tiga cek: nama, halaman, matan. Ini yang kita lakuin di demo tadi. Cek di Maktabah Syamilah atau perpustakaan.", cue: "Lanjut ke visual tiga cek." },
  "viz:threechecks": { say: "Satu referensi baru boleh dipakai kalau lolos ketiganya. Buat gue, ini yang membedakan penuntut ilmu dari sekadar pengguna AI.", cue: null },
  "sec:adab:1": { say: "Pakai AI buat paham, latihan, dan nyusun kerangka itu wajar. Tapi nyerahin hasil AI sebagai karya sendiri itu nggak jujur. Ikutin aturan dosen dan kampus.", cue: null },
  "sec:adab:2": { say: "Ada kaidah al-umur bi maqashidiha: AI itu wasilah, nilainya ngikut tujuan dan cara pakainya. Tapi hukum syar'i dan fatwa jangan disandarkan ke jawaban AI. Rujuk ulama dan kitab muktabar.", cue: "Poin sensitif, sampaikan dengan tenang." },
  "sec:adab:3": { say: "Soal privasi, jangan unggah data pribadi atau dokumen rahasia. Cek juga pengaturannya, percakapan kalian dipakai buat melatih model atau nggak.", cue: null },
  "sec:adab:4": { say: "Dan yang paling penting, AI nggak punya sanad dan nggak bertanggung jawab atas jawabannya. Talaqqi tetap jalan utama. AI cuma bantu persiapan.", cue: "Beri jeda sejenak." },
  "task:adab": { say: "Tugas lima belas menit. Minta AI nyebutin tiga referensi, lakuin tiga cek, isi tabel lolos atau nggak, dan tulis satu aturan pribadi. Nanti kita bandingin sama demo di awal.", cue: "Timer 15 menit. Setelah selesai tanya: berapa yang lolos?" },

  "ch:pendidikan": { say: "Bab lima. Kita naik satu tingkat: gimana caranya memaksimalkan AI buat memudahkan belajar, dan di mana Talqeeh masuk.", cue: "20 menit materi lalu 15 menit tugas." },
  "sec:pendidikan:0": { say: "AI bisa nyesuain kecepatan, tingkat kesulitan, dan gaya penjelasan buat tiap orang. Umpan baliknya juga langsung, nggak harus nunggu pertemuan berikutnya.", cue: null },
  "sec:pendidikan:1": { say: "Ada lima cara memaksimalkan: pakai sumber sendiri, belajar aktif, sesuaikan level dan gaya, putar siklusnya, dan kenali konteks Azhar. Inget lima ini ya, sebentar lagi kita cocokin.", cue: "Minta peserta mengingat kelimanya." },
  "sec:pendidikan:2": { say: "Nah, di sinilah Talqeeh masuk. Gue ngalamin sendiri sepuluh tahun di sini: diktat Arab yang tebal, istilah yang sulit, waktu ujian yang kadang udah mepet. Sementara alat AI kebanyakan terlalu umum. Dari situ gue kepikiran bikin satu tempat yang ngerangkum lima cara tadi. Prinsipnya: AI itu menyuburkan pemahaman, bukan menggantikan guru atau kitab.", cue: "Ceritakan dengan pengalamanmu sendiri. Lanjut ke screenshot." },
  "shot:landing": { say: "Ini berandanya. Satu tempat buat belajar muqarrar, ada library dan AI Partner.", cue: "Tunggu sorotan emas muncul." },
  "shot:katalog": { say: "Library-nya isinya enam puluh satu maddah S1 dan dua puluh tujuh maddah Ma'had, dengan lebih dari seribu template prompt. Ini yang nyambung ke 'sesuaikan level dan gaya'.", cue: null },
  "shot:sample": { say: "Contoh satu maddah: ada kitab utamanya, AI yang paling cocok, sama cara pakainya. Sample ini gratis dan nggak perlu login. Nanti ada QR-nya di akhir.", cue: null },
  "shot:aipartner-beranda": { say: "Ini beranda AI Partner. Satu kotak buat nanya atau unggah materi, ada aksi cepat, dan jawabannya disesuaikan sama profil belajar kalian.", cue: null },
  "shot:aipartner-ringkasan": { say: "Dari diktat PDF atau foto, jadi ringkasan, peta konsep, materi dan i'rab. Bisa bahasa Indonesia, Arab, atau dwibahasa. Ini yang namanya pakai sumber sendiri.", cue: null },
  "shot:aipartner-latihan": { say: "Flashcard dan kuis dibuat dari materi yang sama. Ini wujud dari 'putar siklusnya': paham, hafal, uji.", cue: null },
  "shot:aipartner-tutor": { say: "Dan ini tutor. Dia jawab berdasarkan isi materi kalian, dan ada simulasi syafawi buat latihan ujian lisan. Tapi gue tegasin, Talqeeh itu alat bantu, bukan pengganti guru.", cue: "Jujur soal batas alatnya." },
  "sec:pendidikan:3": { say: "Jadi siapa ngerjain apa? AI nyiapin, ngerangkum, ngelatih. Guru ngebimbing, menilai, dan ngasih sanad. Kalian yang paham dan bertanggung jawab.", cue: "Lanjut ke visual pembagian peran." },
  "viz:spectrum": { say: "Makin ke kanan, makin harus dipegang manusia, guru, dan kitab. Ini ilustrasi pembagian peran. Kalau ada yang nggak setuju sama posisi satu titik, bagus, itu bahan diskusi.", cue: "Ajak 1 peserta bantah satu titik." },
  "sec:pendidikan:4": { say: "Soal penilaian: pendeteksi tulisan AI itu nggak andal. Pendekatan yang lebih sehat itu ujian lisan, tugas berproses, dan kemampuan jelasin karya sendiri. Aturan tiap dosen bisa beda, jadi tanya, ikutin, dan sebutin kalau kalian pakai AI.", cue: null },
  "sec:pendidikan:5": { say: "Memahami batas AI sekarang jadi kemampuan dasar. Aksesnya belum merata, dan keilmuan Islam bisa kurang terwakili di data latihnya, makanya verifikasi makin penting.", cue: null },
  "sec:pendidikan:6": { say: "Terakhir, alatnya bakal terus ganti. Tapi kebiasaan memverifikasi, jujur, dan berguru nggak akan ganti.", cue: "Singkat saja, 1 menit." },
  "task:pendidikan": { say: "Tugas lima belas menit. Tulis satu kesulitan belajar kalian, bagi peran AI dan guru, coba satu fitur Talqeeh, terus tulis tiga aturan pemakaian AI buat diri sendiri. Silakan buka sample gratis atau AI Partner.", cue: "Timer 15 menit. Bantu yang belum punya akun lewat sample gratis." },

  "ch:praktik": { say: "Bab terakhir. Kita ubah semua hasil tadi jadi rencana tujuh hari.", cue: "5 menit materi lalu 10 menit tugas." },
  "sec:praktik:0": { say: "Rencananya: hari satu ringkas, hari dua kuis, hari tiga perbaiki, hari empat dan lima tutor penguji, hari enam flashcard, hari tujuh simulasi ujian tanpa catatan.", cue: "Lanjut ke visual timeline." },
  "viz:sevenday": { say: "Hari ketujuh ditandai penuh karena itu tujuannya: simulasi ujian.", cue: null },
  "sec:praktik:1": { say: "Ada empat kebiasaan: mulai kecil, pakai paket belajar kalian, tetap verifikasi, dan cari teman belajar.", cue: null },
  "task:praktik": { say: "Tugas terakhir, sepuluh menit. Isi jadwal hari satu sampai tujuh dengan jam yang realistis, dan tentuin tanggal mulainya.", cue: "Timer 10 menit. Minta beberapa orang menyebut tanggal mulainya." },

  outputs: { say: "Lihat, ini enam hasil kerja kalian. Selamat, ini kalian bikin sendiri dalam tiga jam.", cue: "Waktu penutup total 8 menit." },
  worksheet: { say: "Scan QR ini buat buka lembar kerja kalian. Isiannya tersimpan di HP, dan bisa disalin, diunduh, atau dikirim ke WhatsApp. Gue kasih satu menit buat scan.", cue: "Tunggu sampai kamera terarah. QR ini berisi tautan materi." },
  cta: { say: "Kalau mau lanjut, ada dua. Coba sample gratis tanpa login, atau gabung buat library lengkap dan AI Study Partner. Silakan scan.", cue: "Kalau ada penawaran khusus peserta, sebut di sini (isi SEMINAR_CTA_OFFER). Jangan menekan, tawarkan dengan jujur." },
  closing: { say: "Gue tutup dengan satu kalimat: teknologi terbaik itu bukan yang menggantikan kita belajar, tapi yang bikin kita bisa belajar lebih baik. Terima kasih, teman-teman. Sekarang kita buka tanya jawab, dan kabar berikutnya bisa dipantau di @ai.gypt.", cue: "Sisa waktu untuk tanya jawab." },
};

Object.assign(window, { SEMINAR_NOTES });
