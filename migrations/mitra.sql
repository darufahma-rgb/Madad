-- Program Mitra Talqeeh (api/_lib/affiliates.js): mitra perorangan dapat tautan ajakan (#/gabung?ref=<kode>),
-- pembeli lewat tautannya dapat potongan, mitra dapat komisi per Paket Imtihan yang lunas.
-- Jalankan sekali di Supabase SQL Editor SEBELUM membuka halaman #/mitra. Aman dijalankan ulang.

create table if not exists public.affiliates (
  member_code        text primary key,
  slug               text not null unique,
  name               text not null,
  whatsapp           text not null,
  payout             text not null,               -- rekening / e-wallet tujuan komisi
  channel            text,                        -- cara mitra akan mengajak (grup, konten, dll.)
  status             text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'suspended')),
  commission_percent integer check (commission_percent is null or (commission_percent between 1 and 50)),  -- kosong = bawaan program
  admin_note         text,
  created_at         timestamptz not null default now(),
  approved_at        timestamptz
);
-- Hanya server (service role) yang membaca/menulis: RLS aktif tanpa policy.
alter table public.affiliates enable row level security;

-- Akun yang diajak mitra (tautan pertama yang menang).
alter table public.members add column if not exists affiliate_slug text;
alter table public.members add column if not exists affiliate_tagged_at timestamptz;
create index if not exists members_affiliate_idx on public.members (affiliate_slug) where affiliate_slug is not null;

-- Komisi dicatat per tagihan saat tagihan dibuat (persen bisa berubah, komisi yang sudah tercatat tidak).
alter table public.payment_checkouts add column if not exists affiliate_slug text;
alter table public.payment_checkouts add column if not exists affiliate_commission integer;
alter table public.payment_checkouts add column if not exists affiliate_paid_at timestamptz;
create index if not exists payment_checkouts_affiliate_idx on public.payment_checkouts (affiliate_slug) where affiliate_slug is not null;
