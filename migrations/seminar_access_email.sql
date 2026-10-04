-- Akses seminar lewat email: admin mendaftarkan email, pemilik email login Google lalu langsung masuk tanpa PIN.
-- Jalankan sekali di Supabase SQL Editor SETELAH migrations/seminar_access.sql, SEBELUM deploy kode yang memakainya.
-- Aman dijalankan ulang (if not exists). Tidak mengubah baris yang sudah ada.

-- Baris yang hanya berbasis email tidak punya PIN.
alter table public.seminar_access alter column pin_hash drop not null;

-- Kunci pencocokan email (huruf kecil; untuk Gmail titik dan +tag diabaikan) supaya "a.b+x@gmail.com" = "ab@gmail.com".
alter table public.seminar_access add column if not exists email_key text;

-- Satu email hanya boleh punya satu baris akses.
create unique index if not exists seminar_access_email_key_uq
  on public.seminar_access (email_key) where email_key is not null;
