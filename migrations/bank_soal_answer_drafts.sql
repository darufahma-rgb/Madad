-- Draf jawaban & penjelasan Bank Soal dari AI, diperiksa asatidz sebelum tampil ke user.
-- Jalankan sekali di Supabase SQL Editor. Aman dijalankan ulang.
--
-- Alur: Admin → Bank Soal → buka soal approved → "Buat draf AI" (tersimpan di kolom *_draft, TIDAK terlihat
-- publik) → pemeriksa mengedit & mengisi namanya → "Publikasikan" menyalin draf ke kolom jawaban/penjelasan
-- yang tampil di halaman soal.

alter table public.bank_soal
  add column if not exists jawaban_draft    jsonb,        -- array teks, satu per blok [SOAL_ARAB]
  add column if not exists penjelasan_draft jsonb,        -- array teks, satu per blok
  add column if not exists draft_status     text,         -- 'draft' | 'published'
  add column if not exists draft_model      text,         -- model AI yang membuat draf
  add column if not exists draft_at         timestamptz,
  add column if not exists reviewed_by      text,         -- nama pemeriksa (asatidz/senior)
  add column if not exists reviewed_at      timestamptz;

-- Kolom draf hanya untuk server (service role). security_bank_soal.sql sudah mencabut akses tabel untuk
-- anon/authenticated dan hanya memberi kolom tertentu, jadi kolom baru ini otomatis tidak terbaca publik.
-- Cabut sekali lagi secara eksplisit untuk berjaga-jaga.
revoke select (jawaban_draft, penjelasan_draft, draft_status, draft_model, draft_at, reviewed_by, reviewed_at)
  on public.bank_soal from anon, authenticated;

-- Cek (harus gagal "permission denied" kalau dijalankan sebagai anon lewat API):
--   GET /rest/v1/bank_soal?select=jawaban_draft&limit=1
