-- Pengaturan admin (URL Lynk/Mayar, harga AI, WA admin) yang berlaku untuk semua pengunjung.
-- Dibaca lewat /api/config dan ditulis lewat /api/admin-members (service role). Tidak ada akses langsung dari browser.
create table if not exists public.app_settings (
  key        text primary key,
  value      text,
  updated_at timestamptz not null default now()
);
alter table public.app_settings enable row level security;
