-- Akses materi seminar: PIN unik per orang + isi materi yang dikirim dari server.
-- Jalankan sekali di Supabase SQL Editor SEBELUM deploy kode yang memakainya,
-- lalu jalankan exports/seminar-seed.sql (isi materi; sengaja tidak di git).
--
-- Keamanan: RLS aktif TANPA policy dan hak anon/authenticated dicabut, jadi kunci publik tidak bisa
-- membaca apa pun di sini. Hanya server (service role) lewat api/seminar.js.

create table if not exists public.seminar_access (
  id           uuid primary key default gen_random_uuid(),
  label        text not null,                 -- nama peserta
  email        text,
  note         text,
  pin_hash     text not null unique,          -- HMAC-SHA256 dari PIN; PIN asli tidak pernah disimpan
  expires_at   timestamptz,                   -- kosong = tanpa batas
  revoked_at   timestamptz,                   -- terisi = dicabut
  last_used_at timestamptz,
  uses         int not null default 0,
  created_at   timestamptz not null default now()
);
alter table public.seminar_access enable row level security;
revoke all on public.seminar_access from anon, authenticated;

create table if not exists public.seminar_content (
  slug        text primary key,
  content     jsonb not null,
  updated_at  timestamptz not null default now()
);
alter table public.seminar_content enable row level security;
revoke all on public.seminar_content from anon, authenticated;
