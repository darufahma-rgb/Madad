# Standar Penulisan Ulang Prompt (Fase 2)

Dipakai untuk menulis ulang prompt di `src/maddah-data.jsx`, mulai dari 15 maddah prioritas. Pilotnya Nahwu.

Aturan umum yang sudah otomatis nempel di akhir setiap prompt (Fase 1, `src/adaptive-prompt.jsx`) **tidak
ditulis ulang di template**: manhaj Azhar, madzhab dari profil, aturan dalil, dan format kertas ujian.

## Aturan per prompt

1. **Baris profil tetap**: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].`
2. **Satu kalimat tujuan**, lalu langkah bernomor (maksimal 5).
3. **Format keluaran disebut** (tabel, outline, jumlah soal) bila hasilnya berbentuk tertentu.
4. **Latihan dan ujian interaktif**: jangan beri jawaban sebelum aku menjawab; syafawi satu pertanyaan sekali jalan.
5. **Pola soal dari kertas ujian asli** di Bank Soal untuk maddah itu (redaksi Arab seperti
   `مَثِّلْ لِمَا يَأْتِي`, `صَوِّبِ الْخَطَأَ مَعَ التَّعْلِيلِ`). Jangan mengklaim bab tertentu "pasti keluar".
6. **Istilah kunci berharakat** di template, supaya AI ikut menulis dengan harakat.
7. **Isian jelas**: `[SEBUTKAN BAB, mis. ...]` untuk yang wajib; `[TEMPEL ...]` hanya untuk teks yang memang harus
   dikirim, karena kosong berarti AI diminta menunggu. Jangan pakai kurung siku untuk hal lain.
8. **Rujukan kitab** hanya dari `kitabUtama` maddah itu, dan selalu dengan "kalau kamu yakin".
9. Template selalu diakhiri `[METODE]` dan `[LEVEL_BAHASA]`. Jumlah dan jenis prompt per maddah tetap (6 jenis, 18 prompt).

## Cek sebelum commit

`check.mjs` (scratchpad) memastikan: 18 prompt, jenis sama, semua placeholder profil terisi, tiap isian punya label,
dan `[METODE]`/`[LEVEL_BAHASA]` ada. Diff harus hanya menyentuh blok maddah yang ditulis ulang.
