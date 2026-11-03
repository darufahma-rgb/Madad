-- Tanda kekeluargaan pada akun: akun yang mendaftar lewat tautan kerja sama (api/_lib/events.js) dicatat ke slug-nya.
-- Jalankan sekali di Supabase SQL Editor SEBELUM membagikan tautan kerja sama. Aman dijalankan ulang.

alter table public.members add column if not exists partner_slug text;
alter table public.members add column if not exists partner_tagged_at timestamptz;
create index if not exists members_partner_idx on public.members (partner_slug) where partner_slug is not null;
