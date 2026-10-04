-- Email ke member (Admin → Email), dikirim lewat Resend. Jalankan sekali di Supabase SQL Editor. Aman dijalankan ulang.
-- Hanya server (service role) yang membaca/menulis.

-- 1. Satu baris per email yang dikirim admin.
create table if not exists public.email_campaigns (
  id          uuid primary key default gen_random_uuid(),
  subject     text not null,
  body        text not null,
  cta_label   text,
  cta_url     text,
  audience    text not null,
  total       int  not null default 0,
  created_at  timestamptz not null default now()
);

-- 2. Penerima per kampanye. Dikirim bertahap (kuota harian Resend); status per orang mencegah kiriman ganda.
create table if not exists public.email_sends (
  id          bigint generated always as identity primary key,
  campaign_id uuid not null references public.email_campaigns(id) on delete cascade,
  email       text not null,
  name        text,
  member_code text,
  status      text not null default 'pending' check (status in ('pending', 'sent', 'failed', 'skipped')),
  error       text,
  provider_id text,
  sent_at     timestamptz,
  unique (campaign_id, email)
);
create index if not exists email_sends_pending_idx on public.email_sends (campaign_id, status, id);

-- 3. Yang memilih berhenti menerima email (lewat link di tiap email). Tidak pernah dikirimi lagi.
create table if not exists public.email_optouts (
  email      text primary key,
  created_at timestamptz not null default now()
);

alter table public.email_campaigns enable row level security;
alter table public.email_sends     enable row level security;
alter table public.email_optouts   enable row level security;
