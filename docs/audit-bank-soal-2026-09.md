# Audit Bank Soal — 26 Sep 2026

Cakupan: 55 soal berstatus **approved** (dibaca lewat akses publik, read-only). Soal pending/rejected belum diaudit.

## Ringkasan

- Data pengirim (nama, WA) tertutup untuk publik; soal non-approved tidak terlihat publik.
- Semua `maddah_id` valid, nama maddah sesuai katalog, semua soal memakai format `[SOAL_ARAB]`/`[ARTI]`.
- Tidak ada soal dobel (pasangan Fiqh Muqaran Dirasat tkt 3 2024/2025 tsani berbeda isinya — kemungkinan versi Banin & Banat).
- 4 soal punya sisa teks AI/OCR sebelum soal pertama → dibersihkan dengan `migrations/bank_soal_cleanup_2026_09.sql`.
- `jawaban` & `penjelasan` kosong di semua 55 soal → draf AI + review asatidz lewat Admin → Bank Soal (lihat bagian di bawah).

## Wajib dicek manual dari foto asli

Catatan: foto soal otomatis dihapus dari storage saat soal di-approve (`api/bank-soal.js`), jadi foto asli harus diminta lagi ke pengirimnya.

- `a6364d82` Mustholah Hadits · tkt 1 · 2023/2024 awwal — soal no. 27–50 terpotong di tepi foto, satu pilihan jawaban `[...]`.
- `d5fe103c` Ushul Fiqh · tkt 1 · 2023/2024 tsani — satu pilihan jawaban tidak terbaca `[...]`.

## Tingkat maddah di katalog (`src/maddah-data.jsx`)

Soal yang di-approve menunjukkan maddah diujikan di tingkat yang belum tercantum di katalog.

### Sudah diperbarui (bukti ≥2 soal atau kop soal)

| Maddah | Ditambah | Bukti |
|---|---|---|
| Ahwal Syakhshiyah | tingkat 2 | syariah 2024/2025 tsani (`3104f53d`); syariah 2025/2026 tsani (`8140a999`) |
| Fiqh Muqaran | tingkat 1 | syariah 2023/2024 tsani (`2f907c53`); syariah 2024/2025 tsani (`969fd35f`) |
| Mustholah Hadits | tingkat 1 | syariah 2023/2024 awwal (`a6364d82`); ushuluddin 2025/2026 tsani (`83954d47`); syariah 2025/2026 awwal (`4b31c990`); syariah 2024/2025 awwal (`4591db71`) |
| Tarikh Tasyri' | tingkat 1 | syariah 2024/2025 awwal (`70043d0c`); syariah 2025/2026 awwal (`9413dc7a`) |
| Ushul Fiqh | tingkat 1 | syariah 2023/2024 tsani (`d5fe103c`); syariah 2024/2025 tsani (`837cc66b`) |

### Perlu konfirmasi asatidz (bukti baru 1 soal)

Centang kalau benar diujikan di tingkat itu → tambahkan ke `tingkat` maddah tersebut. Kalau salah, perbaiki tingkat/maddah soalnya di admin.

| ✓ | Maddah | Tingkat di soal | Katalog sekarang | Bukti | Catatan |
|---|---|---|---|---|---|
| ☐ | Adyan (Perbandingan Agama) | 1 | 3, 4, pasca | ushuluddin 2025/2026 tsani (`a446327f`) |  |
| ☐ | 'Arudh wal Qawafi | 1 | 2, 3, 4 | lughah 2025/2026 awwal (`300bdcf5`) |  |
| ☐ | Balaghah | 1 | 2, 3, 4, pasca | lughah 2025/2026 tsani (`4d397fe6`) |  |
| ☐ | Fiqh Al-Lughah | 1 | 3, 4, pasca | lughah 2025/2026 awwal (`33051428`) |  |
| ☐ | Hadits Tahlili | 1 | 3, 4, pasca | ushuluddin 2025/2026 tsani (`4469cfd8`) |  |
| ☐ | Mantiq | 1 | 2, 3, 4, pasca | ushuluddin 2024/2025 awwal (`dd516ffc`) |  |
| ☐ | Qaa'at Bahts (Seminar Penelitian) | 1 | 4 | lughah 2025/2026 awwal (`1a8b58b8`) | Mencurigakan: maddah ini biasanya tingkat 4 — cek apakah soal salah maddah |
| ☐ | Qawa'id Fiqhiyyah | 1 | 3, 4, 5, pasca | syariah 2023/2024 tsani (`039db747`) |  |
| ☐ | Syubhat Hawla as-Sunnah | 2 | 3, 4 | ushuluddin 2025/2026 awwal (`34dcccdc`) |  |
| ☐ | Tafsir Tahlili | 1 | 3, 4, pasca | ushuluddin 2024/2025 tsani (`6671b498`) |  |
| ☐ | Tarikh ad-Da'wah al-Islamiyyah | 1 | 3, 4 | ushuluddin 2025/2026 awwal (`182f4749`) |  |
| ☐ | 'Ulum Al-Qur'an | 1 | 2, 3, 4, pasca | ushuluddin 2025/2026 awwal (`b5e79dad`) |  |

## Sebaran soal approved

| Fakultas | Tkt 1 | Tkt 2 | Tkt 3 | Tkt 4 |
|---|---|---|---|---|
| Ushuluddin | 10 | 2 | 9 | 0 |
| Syariah | 16 | 3 | 0 | 0 |
| Dirasat | 0 | 0 | 9 | 0 |
| Lughah | 6 | 0 | 0 | 0 |

Belum ada: tingkat 4 semua fakultas, Syariah tkt 3, Lughah tkt 2–3, Dirasat tkt 1–2. Tahun 2023/2024 baru 5 soal.

## Draf jawaban AI + review asatidz

1. Jalankan `migrations/bank_soal_answer_drafts.sql` di Supabase SQL Editor (sekali).
2. Admin → Bank Soal → buka soal **approved** → panel **Draf Jawaban AI** → **Buat draf AI**. Draf dibuat per blok soal
   dengan model **Penilaian tahriri** di Settings (bawaan Sonnet 5) dan disimpan di kolom draf yang tidak terbaca publik.
3. Pemeriksa membaca & mengedit tiap blok, menghapus semua tanda `[PERLU DIVERIFIKASI: …]`, lalu **Simpan draf**.
4. Isi nama pemeriksa, centang konfirmasi, **Publikasikan ke user**. Server menolak publikasi kalau nama pemeriksa kosong
   atau masih ada tanda `[PERLU DIVERIFIKASI]`. **Sembunyikan dari user** menarik jawaban tanpa menghapus draf.

## Akses audit (hanya baca)

`/api/admin-bank-soal` menerima header `x-audit-token` yang cocok dengan env `BANK_SOAL_AUDIT_TOKEN`
(minimal 32 karakter). Token ini hanya bisa `list` dan `stats`. `submitter_name`, `submitter_wa`, dan
`foto_url` dibuang dari hasilnya, dan semua aksi tulis ditolak (403). Untuk mencabut akses, hapus atau
ganti env tersebut di Vercel.

```
curl -s -X POST https://<domain>/api/admin-bank-soal \
  -H "Content-Type: application/json" -H "x-audit-token: $BANK_SOAL_AUDIT_TOKEN" \
  -d '{"action":"list","status_filter":"pending"}'
```
