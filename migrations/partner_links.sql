-- Tautan kerja sama (api/_lib/events.js): tiap tagihan lewat tautan dicatat ke slug-nya untuk laporan kas kekeluargaan.
-- Jalankan sekali di Supabase SQL Editor SEBELUM membagikan tautan kerja sama. Aman dijalankan ulang.

alter table public.payment_checkouts add column if not exists partner_slug text;
create index if not exists payment_checkouts_partner_idx on public.payment_checkouts (partner_slug) where partner_slug is not null;
