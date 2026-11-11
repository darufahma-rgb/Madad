# Pustaka Rujukan Talqeeh

## Aktivasi

Cek posisi dulu: jalankan `scripts/reference-library-check.sql` di Supabase SQL Editor. Script itu hanya membaca; tiap baris `BELUM` menyebut migrasi yang perlu dijalankan.

1. Di Supabase SQL Editor, jalankan berurutan: `migrations/ilmi_index.sql` (bila Ilmi Index belum terpasang), `migrations/reference_library.sql`, `migrations/reference_library_scale.sql`. Semuanya aman diulang dan tidak mengubah atau membuka dokumen privat lama. Jalankan script cek lagi sampai semua `OK`.
2. Buka `/admin` → **Pustaka Rujukan**. Unggah PDF, tunggu pembacaan/analisis selesai, lalu buka hasilnya.
3. Periksa teks halaman, terutama OCR, serta judul, penulis, dan **bidang ilmu** di Metadata edisi. Isi mazhab hanya bila dinyatakan kitab, serta jilid/cetakan/penerbit/tahun jika tersedia. Metadata ini diisi admin, bukan diverifikasi otomatis.
4. Klik **Aktifkan sebagai rujukan**. Hanya dokumen milik pustaka admin, berstatus `done`, tanpa halaman `unread`/`garbled`, dengan judul, penulis, dan bidang ilmu terisi yang dapat diaktifkan. Analisis gagal atau parsial tidak dapat diterbitkan.
5. Uji di **Tanya AI** dan **Tutor**. Klik kartu rujukan untuk membaca kutipan dan teks halaman. **Nonaktifkan rujukan** menghentikan pemakaian pada pencarian berikutnya. Status aktif di-cache sampai 60 detik per instance server.
6. Setelah hasil uji memuaskan, baru ubah janji di landing: label "Segera hadir" (`src/pages/landing.jsx` di hero dan bagian Pustaka Rujukan), paragraf "Sedang disiapkan…", dan FAQ "Sudah bisa dipakai?".

Begitu ada satu kitab aktif, **setiap** pesan Tanya AI dan Tutor melewati pustaka dulu: lebih lambat beberapa detik dan menambah biaya model, juga saat tidak ada hasil. Pantau `/admin` → AI usage setelah aktivasi. Jatah waktu pustaka 30 detik; bila terlewati, tutor biasa menjawab dengan sisa waktunya.

Tidak ada environment variable atau penyedia berbayar baru. Model penjawab menggunakan setelan Tanya AI/Tutor existing, model penilaian untuk pertanyaan fikih berisiko, dan model Ilmi Index untuk menerjemahkan pencarian serta memeriksa dukungan penjelasan. Jatah pesan existing tetap berlaku. Pencarian, jawaban, dan pemeriksaan menggunakan hingga tiga panggilan model per pesan; biaya aktual tercatat melalui pencatat biaya existing.

## Sumbangan kitab dari pengguna

Jalankan `migrations/reference_submissions.sql` setelah tiga migrasi di atas. Sebelum dijalankan, tombol sumbang tidak muncul dan antrean admin hanya menampilkan pengingat.

1. Pengguna membuka hasil Ilmi Index yang selesai, memilih jenis dokumen (kitab atau muqarrar), menyetujui syaratnya, lalu mengirim. Dokumen yang analisisnya sebagian gagal atau masih punya halaman tak terbaca ditolak. Satu pengguna maksimal 5 sumbangan menunggu.
2. Sumbangan masuk **Sumbangan menunggu diperiksa** di `/admin` → **Pustaka Rujukan**. Admin bisa membaca teks per halaman selama statusnya menunggu, lalu menolak dengan alasan atau menerima.
3. **Terima ke pustaka** menyalin teks, indeks, dan kutipan dalam satu transaksi ke `ADMIN-REFERENCE`. Nama file dan catatan edisi tidak ikut. Salinan penyumbang tetap privat.
4. Salinan itu masih draf. Lengkapi metadata lalu klik **Aktifkan sebagai rujukan** seperti kitab biasa.

File yang sidik jarinya sama ditolak. PDF berbeda dari kitab yang sama tidak terdeteksi otomatis; antrean hanya memberi peringatan bila judulnya sama, jadi admin tetap perlu memeriksa. Persetujuan pengguna bukan bukti izin hak cipta: keputusan menerbitkan tetap di admin. Pengguna yang ingin mencabut sumbangan yang sudah diterima menghubungi admin, lalu admin menonaktifkan dan menghapus salinannya.

## Sumbangan materi AI Partner

Jalankan `migrations/material_submissions.sql`. Sebelum dijalankan, tombol **Sumbangkan materi** tidak muncul di halaman materi dan antrean admin hanya menampilkan pengingat.

1. Di halaman materi AI Partner, pemilik menekan **Sumbangkan materi**, memilih jenis (kitab atau muqarrar), menyetujui syaratnya, lalu mengirim. Hanya materi dari PDF atau foto dengan minimal 1.500 karakter. Satu pengguna maksimal 5 sumbangan menunggu.
2. Antrean **Sumbangan materi AI Partner** ada di `/admin` → **Pustaka Rujukan**. Admin membaca teksnya per potongan 6.000 karakter selama statusnya menunggu, lalu menolak dengan alasan atau menerima.
3. **Terima** menyalin teks materi dan talkhisnya ke `material_submissions` dan memutus tautan ke materi pengguna. Ringkasan, kuis, flashcard, chat, dan nilai tidak disalin. Materi pengguna tetap privat.
4. Salinan ini belum dipakai otomatis untuk pengguna lain. Ia bahan untuk talkhis bersama atau pustaka rujukan nanti.

Materi yang teksnya sama (setelah harakat dan spasi dinormalisasi) hanya bisa mengantre atau diterima sekali. Teks OCR yang sedikit berbeda tidak terdeteksi sebagai sama. Persetujuan pengguna bukan bukti izin hak cipta.

## Batas integrasi

- Tanya AI dan Tutor memakai pustaka rujukan bersama. Tutor juga mencari materi pribadi yang dimiliki pengguna tersebut dan melabelinya sebagai **materi pribadi**, tanpa nomor halaman PDF buatan.
- Simulasi syafawi, ringkasan, kuis, Live Caption, dan Tanya Muqarrar personal tetap memakai alur sumber masing-masing. Pustaka belum otomatis ditambahkan ke semua generator.
- Kitab admin disimpan terpisah dengan pemilik server `ADMIN-REFERENCE`; buku pengguna hanya masuk lewat sumbangan yang disetujui pemiliknya dan diperiksa admin. Endpoint pengelolaan memerlukan token admin; RLS tabel baru tidak memberi akses browser langsung.
- Yang disimpan di server ialah teks per halaman dan indeks. Berkas PDF asli mengikuti cache perangkat Ilmi Index. Pembaca bukti bersama menampilkan **teks halaman**, bukan PDF asli yang diunduh dari server.
- Kutipan di jawaban dicocokkan dengan teks asli tersimpan. Penjelasan menjalani pemeriksaan model kedua. Kecocokan teks bukan jaminan kebenaran tafsir, fatwa, atribusi sekunder, atau kesahihan hadis. Hasil OCR dan isi kitab tetap perlu tinjauan ilmiah.
- Pencarian berupa perluasan istilah Arab/Indonesia dan pencarian leksikal, maksimal delapan halaman kitab per pesan. Ia bisa melewatkan pembahasan; pesan “belum ditemukan” tidak berarti kitab tidak membahasnya. Pustaka besar belum diuji bebannya.
- Pencarian mempertimbangkan riwayat empat pesan, bidang ilmu, mazhab yang diminta, serta judul pembahasan dan ekor/awal halaman tetangga. Bidang ilmu memberi bobot pencarian, bukan jaminan relevansi. Kutipan tetap wajib cocok dengan petikan halaman utama; konteks halaman tetangga tidak dapat dipakai untuk mengarang nomor halaman.
- Istilah ambigu dapat memicu pertanyaan klarifikasi; model juga dapat menjelaskan beberapa konteks secara terpisah bila masing-masing memiliki bukti. Riwayat percakapan bukan sumber bukti baru.
- Katalog admin memiliki pencarian judul/penulis/edisi, filter status dan bidang ilmu, urutan judul atau terbaru, metadata edisi, serta daftar syarat sebelum aktivasi. Semua angka berasal dari dokumen tersimpan; status aktivasi tidak ditampilkan sebagai draf jika gagal dimuat.
- Jawaban lama dilabeli belum diperiksa. Kutipan yang pernah diterima pengguna tetap ada pada riwayat mereka meskipun buku dinonaktifkan; halaman bersama tidak lagi dapat dimuat setelah nonaktif.
- Jawaban baru ditampilkan setelah validasi selesai, sehingga tidak dikirim token demi token. Jika migrasi belum dijalankan, pustaka gagal, atau tidak ada dasar di kitab, Tanya AI dan Tutor kembali ke jawaban biasa tanpa kartu rujukan (Tanya AI melabelinya jawaban umum), jadi keduanya tidak mati karena pustaka. Aktivasi kitab tetap ditolak selama indeks belum siap.

## Verifikasi

`npm test` mencakup pencocokan kutipan, sumber/halaman palsu, JSON rusak, jawaban terpotong, penolakan pemeriksa, penggunaan materi privat tanpa halaman buatan, syarat penerbitan, akses halaman, dan autentikasi admin. Tes database memakai respons tiruan; ini tidak menggantikan uji migrasi dan alur lengkap di Supabase.

Jalankan `npm run build` dan `npm run lint:prompts`. Tidak ada perintah typecheck atau lint JavaScript umum pada repository saat ini.

Tambahan uji manual: respons API tiruan dipakai untuk memeriksa katalog/filter, formulir metadata, aktivasi, dan lebar layar 390px/1440px. Model OpenRouter sungguhan diuji dengan dua petikan buatan bertema **amr** di nahwu dan usul: jawaban khusus nahwu mengambil kutipan nahwu; pertanyaan umum memisahkan dua bidang. Ini uji terbatas, bukan jaminan semua konteks benar.

Ketiga migrasi dan `search_reference_passages` sudah dijalankan di Postgres 16 lokal (PGlite, 2026-11): urutan dan pengulangan migrasi, buku nonaktif tidak muncul, istilah berkarakter regex, istilah 2 huruf, dan 3.000 halaman uji memakai indeks trigram untuk teks Arab. Ini bukan Supabase: locale, ukuran server, dan isi kitab sungguhan bisa berbeda, jadi langkah uji di atas tetap wajib.
