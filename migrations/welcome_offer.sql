-- Penawaran 48 jam untuk akun gratis (api/_lib/offer.js). Jalankan sekali di Supabase SQL Editor. Aman dijalankan ulang.
-- Waktu mulai hitung mundur per akun; kosong = belum pernah dimulai.
alter table public.members add column if not exists offer_started_at timestamptz;
