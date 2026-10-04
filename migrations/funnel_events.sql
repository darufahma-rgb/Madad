-- Corong konversi: kunjungan & tahapan yang tidak tercatat di tabel lain (buka halaman Gabung, kena batas gratis).
-- Daftar, isi profil, coba AI, checkout, dan bayar dihitung dari tabel yang sudah ada (members, user_profiles,
-- payment_checkouts). Satu baris per pengunjung per event per hari; pengunjung = ID acak dari browser (bukan data pribadi).
-- Jalankan sekali di Supabase SQL Editor. Aman dijalankan ulang. Hanya server (service role) yang membaca/menulis.

create table if not exists public.funnel_events (
  id          bigint generated always as identity primary key,
  day         date not null default current_date,
  event       text not null check (event in ('visit', 'view_gabung', 'view_join', 'view_ai_partner', 'paywall', 'click_pay')),
  detail      text not null default '',
  visitor     text not null,
  member_code text,
  created_at  timestamptz not null default now(),
  unique (day, event, detail, visitor)
);

create index if not exists funnel_events_day_idx on public.funnel_events (day);
alter table public.funnel_events enable row level security;
