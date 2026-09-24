-- Akun gratis terbatas: login Google tanpa bayar dapat akses contoh (tier 'free').
-- Jalankan sekali di Supabase SQL Editor SEBELUM deploy kode yang memakainya.

-- Semua member yang sudah ada otomatis 'library' (tidak ada yang berubah untuk mereka).
alter table members add column if not exists tier text not null default 'library';
alter table members drop constraint if exists members_tier_check;
alter table members add constraint members_tier_check check (tier in ('free', 'library'));

-- Kapan akun gratis dibuat. Tetap terisi setelah upgrade → dipakai menghitung konversi gratis → berbayar.
alter table members add column if not exists free_started_at timestamptz;
