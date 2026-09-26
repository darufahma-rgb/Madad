# Mutu Prompt Library — Fase 3

Fase 3 menjaga mutu prompt supaya tidak turun saat prompt bertambah. Prompt baru atau hasil tulis ulang dianggap
**siap terbit** kalau lolos tiga penjaga di bawah. Masukan pengguna dipakai untuk perbaikan bulanan.

Sebelum dipakai, jalankan `migrations/prompt_quality.sql` sekali di Supabase SQL Editor. Migrasi ini membuat tabel
`prompt_feedback` dan `prompt_reviews`, dan mengizinkan tugas `prompt` di `ai_golden_items`.

## 1. Rubrik otomatis

Delapan kriteria "Standar mutu prompt Talqeeh" dari laporan audit. Kriteria yang bisa dicek dari teks dicek oleh
`src/prompt-rubric.jsx`. Tiap kriteria diberi status gagal, saran, atau ok.

| # | Kriteria | Dicek otomatis |
|---|---|---|
| 1 | Konteks lengkap | `[TINGKATAN]`, `[MADDAH]`, dan `[FAKULTAS]` (kecuali Ma'had atau fakultas yang ditulis langsung) |
| 2 | Khas maddah | Template tidak dipakai persis di maddah lain |
| 3 | Manhaj Azhar | Dijaga blok Standar Azhar pusat; isinya dinilai asatidz |
| 4 | Format ujian nyata | Prompt yang memberi soal memuat redaksi soal Arab (gagal di jenis ujian, saran di latihan) |
| 5 | Pengaman akurasi | Prompt yang menyuruh mengutip ayat/hadits/data punya pengaman "hanya kalau yakin" (saran) |
| 6 | Interaktif | Latihan/ujian yang memberi soal menyuruh AI berhenti dan menunggu jawaban |
| 7 | Output jelas | Ada langkah bernomor atau format output, maksimal 5–6 langkah (saran) |
| 8 | Siap pakai | Tidak ada kurung tak dikenal; diakhiri `[METODE]` lalu `[LEVEL_BAHASA]`; isian berlabel |

Prompt **layak terbit** = tidak ada kriteria berstatus gagal.

- Admin: tab **Mutu Prompt → Rubrik otomatis**.
- Terminal: `npm run lint:prompts` (semua maddah), atau `npm run lint:prompts -- nahwu mantiq` (rincian).
- Syarat sebelum commit tulis ulang: `npm run lint:prompts -- --strict <id maddah>`, yang keluar dengan kode 1 kalau
  masih ada prompt yang gagal.

## 2. Uji jawaban AI (Evaluasi AI → tugas "Prompt Library")

1. Di tab **Evaluasi AI**, tekan **Tambah dari prompt library**, lalu pilih maddah dan jenis prompt (bawaannya ujian + latihan).
   Tiap prompt menjadi soal uji draft dengan profil uji bawaan maddah dan isian contoh.
2. Cek isiannya (bab, tempelan hadits/teks bila perlu). Kalau perlu, tambahkan poin yang wajib ada dari asatidz.
3. **Jalankan evaluasi**. Pilih "Hanya Prompt Library" kalau cuma ingin menguji prompt.
   - Prompt dijalankan persis seperti "Jalankan di sini": model tugas `prompt` dan sistem yang sama.
   - Teks prompt selalu diambil dari data terbaru.
   - AI penguji menilai 7 kriteria dengan skala 0–2: patuh instruksi, relevan, format soal Azhar, interaktif, akurasi,
     bahasa Arab, keterbacaan.
   - Poin tambahan dari asatidz ikut dihitung 30%.
4. Hasil diurutkan dari skor terendah. Perbaiki prompt di atas dulu, lalu jalankan ulang.

## 3. Tinjauan asatidz per fakultas

1. Buka **Mutu Prompt → Tinjauan asatidz**, lalu pilih fakultas atau jenjang.
2. Tekan **Unduh paket tinjauan** untuk mendapat file Markdown. Isinya: cara meninjau, blok Standar Azhar yang ditempel
   ke semua prompt, semua prompt per maddah, dan lembar penilaian 8 kriteria.
3. Kirim ke satu ustadz atau senior fakultas itu.
4. Catat keputusannya per maddah: **Disetujui** atau **Perlu revisi**. Perlu revisi wajib diberi catatan. Riwayat
   tinjauan tetap tersimpan.

## Masukan pengguna & perbaikan bulanan

- Setelah prompt disalin, kartu prompt menampilkan **"Prompt ini membantu?"**.
  - 👎 menanyakan alasannya: kurang cocok dengan maddah/bab, tidak mirip soal ujian, jawaban AI salah, bingung
    mengisi, terlalu panjang, atau lainnya. Catatan boleh ditambahkan.
  - Satu penilaian per member per prompt, dan bisa diubah.
  - Akun gratis juga bisa memberi masukan.
- Tiap awal bulan:
  1. Buka **Mutu Prompt → Masukan pengguna** (30 hari).
  2. Perbaiki prompt dengan 👎 terbanyak.
  3. Jalankan `lint:prompts --strict` dan Evaluasi AI.
  4. Minta tinjauan ulang untuk maddah yang berubah banyak.
