-- Paket Imtihan (Library + AI Partner 120 hari, Rp 199.000): izinkan plan 'imtihan' di tagihan Mayar.
-- Jalankan sekali di Supabase SQL Editor SEBELUM deploy yang menampilkan paket ini. Aman dijalankan ulang.

alter table public.payment_checkouts drop constraint if exists payment_checkouts_plan_check;
alter table public.payment_checkouts
  add constraint payment_checkouts_plan_check check (plan in ('library', 'library_ai', 'ai', 'imtihan'));
