-- Paket Rombongan: satu pembeli membayar Paket Imtihan untuk beberapa orang (lihat api/_lib/events.js & payments.js).
-- Pembeli langsung mendapat Paket Imtihan; untuk teman-temannya dibuat kode yang ditukar setelah login Google.
-- Jalankan sekali di Supabase SQL Editor SEBELUM mengaktifkan event Paket Rombongan. Aman dijalankan ulang.

alter table public.payment_checkouts drop constraint if exists payment_checkouts_plan_check;
alter table public.payment_checkouts
  add constraint payment_checkouts_plan_check check (plan in ('library', 'library_ai', 'ai', 'imtihan', 'rombongan'));
alter table public.payment_checkouts add column if not exists seats int check (seats is null or seats between 2 and 10);

-- Satu baris per kursi teman. Hanya server (service role) yang membaca/menulis.
create table if not exists public.group_codes (
  code            text primary key,
  checkout_id     uuid not null references public.payment_checkouts(id) on delete cascade,
  seat_no         int  not null,
  buyer_email     text not null,
  redeemed_by     text,              -- member code penukar
  redeemed_email  text,
  redeemed_at     timestamptz,
  created_at      timestamptz not null default now(),
  unique (checkout_id, seat_no)
);
create index if not exists group_codes_checkout_idx on public.group_codes (checkout_id);
-- Satu akun hanya bisa menukar satu kode rombongan.
create unique index if not exists group_codes_redeemed_email_idx on public.group_codes (redeemed_email) where redeemed_email is not null;
alter table public.group_codes enable row level security;
