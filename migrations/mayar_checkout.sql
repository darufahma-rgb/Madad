-- Log semua webhook Mayar: audit pembayaran, pencegah pemrosesan ganda,
-- dan tempat admin melihat product_id untuk diisi di Settings.
create table if not exists public.payment_events (
  id             uuid primary key default gen_random_uuid(),
  event_key      text not null unique,
  event          text,
  product_id     text,
  product_name   text,
  customer_email text,
  customer_name  text,
  amount         int,
  handled_as     text,
  member_code    text,
  raw            jsonb,
  created_at     timestamptz not null default now()
);
create index if not exists payment_events_created_idx on public.payment_events (created_at desc);
alter table public.payment_events enable row level security;
