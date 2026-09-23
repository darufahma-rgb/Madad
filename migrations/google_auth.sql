-- Login member via Google (Supabase Auth)
-- Jalankan di Supabase SQL Editor SETELAH kode baru ter-deploy
-- (policy RLS baru membuat versi lama aplikasi gagal menyimpan data).
-- Butuh create_ai_partner_tables.sql sudah dijalankan (untuk seed ai_subscriptions).

-- 1. Hubungkan member ke akun Google
alter table public.members add column if not exists email text;
alter table public.members add column if not exists auth_user_id uuid references auth.users(id) on delete set null;
update public.members set email = lower(trim(email)) where email is not null;
create unique index if not exists members_auth_user_id_key on public.members (auth_user_id) where auth_user_id is not null;
create unique index if not exists members_email_key on public.members (lower(email)) where email is not null;

-- 2. Kode member milik user yang sedang login (dipakai policy RLS)
create or replace function public.current_member_code()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select code from public.members
  where auth_user_id = auth.uid() and status = 'active'
  limit 1
$$;
revoke all on function public.current_member_code() from public, anon;
grant execute on function public.current_member_code() to authenticated;

-- 3. Tabel data pribadi: hanya pemiliknya (login Google) yang boleh baca/tulis
do $$
declare
  t text;
  r record;
begin
  foreach t in array array[
    'user_notes', 'user_progress', 'user_intentions', 'user_presence',
    'user_profiles', 'user_maddah_activity', 'user_muqaranah', 'user_soal_progress'
  ] loop
    if to_regclass('public.' || t) is not null then
      for r in select policyname from pg_policies where schemaname = 'public' and tablename = t loop
        execute format('drop policy %I on public.%I', r.policyname, t);
      end loop;
      execute format('alter table public.%I enable row level security', t);
      execute format(
        'create policy member_own_rows on public.%I for all to authenticated
           using (member_code = public.current_member_code())
           with check (member_code = public.current_member_code())', t);
    end if;
  end loop;
end $$;

-- 4. members hanya boleh disentuh server (service role)
do $$
declare r record;
begin
  for r in select policyname from pg_policies where schemaname = 'public' and tablename = 'members' loop
    execute format('drop policy %I on public.members', r.policyname);
  end loop;
end $$;
alter table public.members enable row level security;

-- 5. Tutup jalur insert langsung ke bank_soal (submit wajib lewat /api/bank-soal)
drop policy if exists public_insert_soal on public.bank_soal;

-- 6. Seed: pemilik Talqeeh sebagai member + akses AI Partner
insert into public.members (code, name, whatsapp, duration, status, expires_at, email)
select 'MSR-DARU-ADMN', 'Daru Fahma', '', 36500, 'active', '2099-12-31', 'daru.fahma@gmail.com'
where not exists (
  select 1 from public.members
  where lower(email) = 'daru.fahma@gmail.com' or code = 'MSR-DARU-ADMN'
);

insert into public.ai_subscriptions (member_code, product_id, status, last_event, last_event_at)
select code, 'manual', 'active', 'seed', now()
from public.members where lower(email) = 'daru.fahma@gmail.com'
on conflict (member_code, product_id)
do update set status = 'active', last_event = 'seed', last_event_at = now(), updated_at = now();
