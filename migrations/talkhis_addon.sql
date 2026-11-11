-- Tambahan talkhis untuk pemegang Paket Imtihan (api/_lib/payments.js TALKHIS_ADDONS): tagihan berjenis talkhis_1 / talkhis_3.
-- Jatah tambahannya dihitung dari tagihan lunas itu sendiri, jadi tidak perlu tabel baru.
-- Jalankan sekali di Supabase SQL Editor SEBELUM tombol "Tambah talkhis" dipakai. Aman dijalankan ulang.

alter table public.payment_checkouts drop constraint if exists payment_checkouts_plan_check;
alter table public.payment_checkouts
  add constraint payment_checkouts_plan_check check (plan in ('library', 'library_ai', 'ai', 'imtihan', 'rombongan', 'talkhis_1', 'talkhis_3'));
