-- Paket token bulanan (api/_lib/tokens.js): tagihan menyimpan isi ulang yang dijanjikan saat membeli, supaya mengubah
-- paket di Admin tidak mengubah hak pembeli. tokens = token bulan pertama; token_months = berapa bulan;
-- token_refill = saldo diisi ulang sampai angka ini di tiap bulan berikutnya.
-- Jalankan sekali di Supabase SQL Editor (sesudah migrations/ai_tokens.sql). Aman dijalankan ulang.
alter table public.payment_checkouts add column if not exists token_months integer;
alter table public.payment_checkouts add column if not exists token_refill integer;
