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

## Progres

18 maddah selesai (324 prompt): Nahwu, Fiqh Madzhabi, Tauhid, Ushul Fiqh, Mustholah Hadits, Tarikh Tasyri',
Sharaf, Al-Qur'an (Tahfidz), Sirah Nabawiyah, Fiqh Muqaran, Tarikh Islam, 'Ulum Al-Qur'an, Tajwid, Ahwal Syakhshiyah,
Balaghah, Mantiq, Tafsir Tahlili, Hadits Tahlili. Urutan dipilih dari jangkauan (fakultas × tingkat) dan jumlah kertas di Bank Soal, karena data jumlah buka
maddah hanya ada di Supabase.

Catatan dari kertas asli yang memengaruhi penulisan:
- Fiqh dan Ushul hampir selalu memuat dirasah nashshiyyah (قال المصنف / الشارح) — ada prompt latihan khusus.
- Ujian Tahfidz berbentuk tahriri (menulis ayat dari hafalan). AI hanya menyebut surat, nomor ayat, dan kata pembuka yang
  diyakini, lalu menilai berdasarkan teks mushaf yang ditempel pengguna.
- Tajwid di tingkat kuliah menguji teori mendalam (makharij ra'isah/far'iyyah, perbandingan shifat, syarah bait matan).
- Fiqh Muqaran menguji jumlah pendapat ("بالاتفاق – على قولين – على ثلاثة أقوال").
- Tafsir Tahlili: kertas mengutip "قال تعالى {…} الآيات" lalu 4–6 sub-soal beruntun (munasabah, makna, i'rab, حكمة/سرّ).
  AI menulis ayat hanya kalau yakin redaksinya; kalau ragu, minta pengguna menempel dari mushaf.
- Hadits Tahlili: matan selalu ditempel pengguna (`[TEMPEL HADITS]`), tidak dilengkapi dari ingatan. Pola soal: rawi a'la,
  شكّل، بيّن في سطر، تعارض ظاهر، أقوال الأئمة والراجح، ✓/✗ مع التعليل.
- Mantiq: tidak ada kertas Mantiq di 44 kertas yang ditranskrip; drill mengikuti pola umum semua kertas (ta'rif 40%, 'allil 27%) plus mitsal.
- Kertas "Tarikh Islam" satu-satunya di Bank Soal ternyata Tarikh As-Sunnah; Sirah belum punya kertas.
- Rujukan kitab boleh juga dari kitab yang disebut di kertas asli, selalu dengan "kalau kamu yakin".
