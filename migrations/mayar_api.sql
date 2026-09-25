-- Pembayaran lewat Mayar API (tanpa produk di dashboard Mayar).
-- Jalankan sekali di Supabase SQL Editor SEBELUM deploy. Aman dijalankan ulang.

-- 1. Satu baris per tagihan yang dibuat lewat API (POST /hl/v2/payments/create).
create table if not exists public.payment_checkouts (
  id             uuid primary key default gen_random_uuid(),
  mayar_id       text unique,               -- id payment request dari Mayar
  transaction_id text,
  link           text,
  plan           text not null check (plan in ('library', 'library_ai', 'ai')),
  amount         int  not null,
  library_amount int  not null default 0,   -- pembagian untuk analitik pemasukan
  ai_amount      int  not null default 0,
  email          text not null,
  name           text,
  auth_user_id   uuid,
  member_code    text,
  status         text not null default 'pending' check (status in ('pending', 'paid', 'expired')),
  paid_via       text,                      -- webhook | status_check
  checked_at     timestamptz,
  paid_at        timestamptz,
  created_at     timestamptz not null default now()
);
create index if not exists payment_checkouts_user_idx  on public.payment_checkouts (auth_user_id, created_at desc);
create index if not exists payment_checkouts_email_idx on public.payment_checkouts (email, created_at desc);
create index if not exists payment_checkouts_paid_idx  on public.payment_checkouts (paid_at desc) where status = 'paid';
alter table public.payment_checkouts enable row level security;

-- 2. AI Partner dibayar per 30 hari: akses aktif selama expires_at belum lewat.
--    Kosong = tanpa batas (akses manual dari admin / langganan Membership lama).
alter table public.ai_subscriptions add column if not exists expires_at timestamptz;
