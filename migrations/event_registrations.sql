-- Pendaftaran event/workshop (halaman /event). Jalankan sekali di Supabase SQL Editor SEBELUM deploy kode
-- yang memakainya. Aman dijalankan ulang.
--
-- Satu baris per akun per event. Kursi dipegang oleh pendaftar yang sudah lunas, dan oleh pendaftar yang belum
-- bayar selama 24 jam sejak held_at (lihat api/_lib/workshop.js).
--
-- Keamanan: RLS aktif TANPA policy dan hak anon/authenticated dicabut. Hanya server (service role) yang membaca.

create table if not exists public.event_registrations (
  id            uuid primary key default gen_random_uuid(),
  event_slug    text not null,
  auth_user_id  uuid not null,
  member_code   text,
  email         text not null,
  name          text not null,
  whatsapp      text not null,
  currency      text not null check (currency in ('IDR', 'EGP')),
  amount        int  not null,                 -- nominal dalam mata uang di atas (harga tetap, bukan konversi)
  status        text not null default 'pending' check (status in ('pending', 'paid', 'cancelled')),
  mayar_id      text unique,                   -- hanya untuk pembayaran Rupiah lewat Mayar
  link          text,
  link_at       timestamptz,
  checked_at    timestamptz,
  held_at       timestamptz not null default now(),
  paid_at       timestamptz,
  paid_via      text,                          -- webhook | status_check | admin
  note          text,
  created_at    timestamptz not null default now(),
  unique (event_slug, auth_user_id)
);
create index if not exists event_registrations_event_idx on public.event_registrations (event_slug, created_at);
alter table public.event_registrations enable row level security;
revoke all on public.event_registrations from anon, authenticated;
