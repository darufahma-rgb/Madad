-- PIN aktivasi sekali pakai untuk menghubungkan member lama (atau member manual) ke akun Google.
-- Dibuat admin, dikirim via WA, berlaku 14 hari, dihapus setelah dipakai.
alter table public.members add column if not exists activation_pin text;
alter table public.members add column if not exists activation_pin_expires_at timestamptz;
create unique index if not exists members_activation_pin_key
  on public.members (activation_pin) where activation_pin is not null;
