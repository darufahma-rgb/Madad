# Pustaka Rujukan Talqeeh

## Aktivasi

1. Jalankan `migrations/ilmi_index.sql` bila Ilmi Index belum terpasang, kemudian `migrations/reference_library.sql` di Supabase SQL Editor. Migrasi baru tidak mengubah atau membuka dokumen privat lama.
2. Buka `/admin` → **Pustaka Rujukan**. Unggah PDF, tunggu pembacaan/analisis selesai, lalu buka hasilnya.
3. Periksa teks halaman, terutama OCR, serta judul, penulis, dan **bidang ilmu** di Metadata edisi. Isi mazhab hanya bila dinyatakan kitab, serta jilid/cetakan/penerbit/tahun jika tersedia. Metadata ini diisi admin, bukan diverifikasi otomatis.
4. Klik **Aktifkan sebagai rujukan**. Hanya dokumen milik pustaka admin, berstatus `done`, tanpa halaman `unread`/`garbled`, dengan judul, penulis, dan bidang ilmu terisi yang dapat diaktifkan. Analisis gagal atau parsial tidak dapat diterbitkan.
5. Uji di **Tanya AI** dan **Tutor**. Klik kartu rujukan untuk membaca kutipan dan teks halaman. **Nonaktifkan rujukan** menghentikan pemakaian pada pencarian berikutnya.

Tidak ada environment variable atau penyedia berbayar baru. Model penjawab menggunakan setelan Tanya AI/Tutor existing, model penilaian untuk pertanyaan fikih berisiko, dan model Ilmi Index untuk menerjemahkan pencarian serta memeriksa dukungan penjelasan. Jatah pesan existing tetap berlaku. Pencarian, jawaban, dan pemeriksaan menggunakan hingga tiga panggilan model per pesan; biaya aktual tercatat melalui pencatat biaya existing.

## Batas integrasi

- Tanya AI dan Tutor memakai pustaka rujukan bersama. Tutor juga mencari materi pribadi yang dimiliki pengguna tersebut dan melabelinya sebagai **materi pribadi**, tanpa nomor halaman PDF buatan.
- Simulasi syafawi, ringkasan, kuis, Live Caption, dan Tanya Muqarrar personal tetap memakai alur sumber masing-masing. Pustaka belum otomatis ditambahkan ke semua generator.
- Kitab admin disimpan terpisah dengan pemilik server `ADMIN-REFERENCE`; buku pengguna tidak otomatis dipublikasikan. Endpoint pengelolaan memerlukan token admin; RLS tabel baru tidak memberi akses browser langsung.
- Yang disimpan di server ialah teks per halaman dan indeks. Berkas PDF asli mengikuti cache perangkat Ilmi Index. Pembaca bukti bersama menampilkan **teks halaman**, bukan PDF asli yang diunduh dari server.
- Kutipan di jawaban dicocokkan dengan teks asli tersimpan. Penjelasan menjalani pemeriksaan model kedua. Kecocokan teks bukan jaminan kebenaran tafsir, fatwa, atribusi sekunder, atau kesahihan hadis. Hasil OCR dan isi kitab tetap perlu tinjauan ilmiah.
- Pencarian berupa perluasan istilah Arab/Indonesia dan pencarian leksikal, maksimal delapan halaman kitab per pesan. Ia bisa melewatkan pembahasan; pesan “belum ditemukan” tidak berarti kitab tidak membahasnya. Pustaka besar belum diuji bebannya.
- Pencarian mempertimbangkan riwayat empat pesan, bidang ilmu, mazhab yang diminta, serta judul pembahasan dan ekor/awal halaman tetangga. Bidang ilmu memberi bobot pencarian, bukan jaminan relevansi. Kutipan tetap wajib cocok dengan petikan halaman utama; konteks halaman tetangga tidak dapat dipakai untuk mengarang nomor halaman.
- Istilah ambigu dapat memicu pertanyaan klarifikasi; model juga dapat menjelaskan beberapa konteks secara terpisah bila masing-masing memiliki bukti. Riwayat percakapan bukan sumber bukti baru.
- Katalog admin memiliki pencarian judul/penulis/edisi, filter status dan bidang ilmu, urutan judul atau terbaru, metadata edisi, serta daftar syarat sebelum aktivasi. Semua angka berasal dari dokumen tersimpan; status aktivasi tidak ditampilkan sebagai draf jika gagal dimuat.
- Jawaban lama dilabeli belum diperiksa. Kutipan yang pernah diterima pengguna tetap ada pada riwayat mereka meskipun buku dinonaktifkan; halaman bersama tidak lagi dapat dimuat setelah nonaktif.
- Jawaban baru ditampilkan setelah validasi selesai, sehingga tidak dikirim token demi token. Jika migrasi belum dijalankan, layanan pustaka akan gagal tertutup dan tidak kembali ke jawaban tanpa sumber.

## Verifikasi

`npm test` mencakup pencocokan kutipan, sumber/halaman palsu, JSON rusak, jawaban terpotong, penolakan pemeriksa, penggunaan materi privat tanpa halaman buatan, syarat penerbitan, akses halaman, dan autentikasi admin. Tes database memakai respons tiruan; ini tidak menggantikan uji migrasi dan alur lengkap di Supabase.

Jalankan `npm run build` dan `npm run lint:prompts`. Tidak ada perintah typecheck atau lint JavaScript umum pada repository saat ini.

Tambahan uji manual: respons API tiruan dipakai untuk memeriksa katalog/filter, formulir metadata, aktivasi, dan lebar layar 390px/1440px. Model OpenRouter sungguhan diuji dengan dua petikan buatan bertema **amr** di nahwu dan usul: jawaban khusus nahwu mengambil kutipan nahwu; pertanyaan umum memisahkan dua bidang. Ini uji terbatas, bukan jaminan semua konteks benar. Migrasi RPC baru `search_reference_passages` masih harus dijalankan dan diuji di Supabase sebelum produksi.
