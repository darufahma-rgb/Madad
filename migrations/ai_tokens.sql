-- Token AI: satu saldo per akun untuk SEMUA fitur AI. Tiap pemakaian memotong token sesuai biaya AI aslinya
-- (1 token = $0,0001). Token didapat dari membeli paket token dan tidak hangus. Lihat api/_lib/tokens.js.
-- Jalankan sekali di Supabase SQL Editor SEBELUM deploy yang memakai token (sesudah migrations/talkhis_addon.sql).
-- Aman dijalankan ulang.

-- Saldo sekarang (boleh sedikit minus: pemakaian terakhir dipotong setelah AI selesai) dan total token yang pernah didapat.
alter table public.members add column if not exists ai_tokens integer not null default 0;
alter table public.members add column if not exists ai_tokens_granted integer not null default 0;

-- Buku catatan: tiap tambah (+) dan pakai (−) token. Hanya server (service role) yang membaca/menulis.
create table if not exists public.ai_token_ledger (
  id          bigserial primary key,
  member_code text not null,
  delta       integer not null,
  reason      text not null,          -- buy | convert | admin | spend:chat | spend:live | …
  ref         text,                   -- penanda unik pemberian (mis. checkout:<id>) supaya tidak dobel
  created_at  timestamptz not null default now()
);
create index if not exists ai_token_ledger_member_idx on public.ai_token_ledger (member_code, created_at desc);
create unique index if not exists ai_token_ledger_ref_idx on public.ai_token_ledger (member_code, ref) where ref is not null;
alter table public.ai_token_ledger enable row level security;

-- Potong token setelah satu pemanggilan AI selesai (atomik, tidak pernah ditolak). p_amount 0 = hanya membaca.
-- Mengembalikan baris { balance, granted }; akun tidak ada → tanpa baris.
create or replace function public.charge_ai_tokens(p_code text, p_amount integer, p_reason text)
returns table (balance integer, granted integer) language plpgsql security definer set search_path = public as $$
begin
  if p_amount is not null and p_amount > 0 then
    update members set ai_tokens = ai_tokens - p_amount where code = p_code;
    if found then
      insert into ai_token_ledger (member_code, delta, reason) values (p_code, -p_amount, left(p_reason, 60));
    end if;
  end if;
  return query select m.ai_tokens, m.ai_tokens_granted from members m where m.code = p_code;
end $$;

-- Tambah token. Dengan p_ref, pemberian yang sama tidak pernah masuk dua kali. Mengembalikan { balance, granted }.
create or replace function public.grant_ai_tokens(p_code text, p_amount integer, p_reason text, p_ref text)
returns table (balance integer, granted integer) language plpgsql security definer set search_path = public as $$
declare v_new bigint;
begin
  if p_amount is not null and p_amount > 0 and exists (select 1 from members where code = p_code) then
    insert into ai_token_ledger (member_code, delta, reason, ref)
      values (p_code, p_amount, left(p_reason, 60), p_ref)
      on conflict (member_code, ref) where ref is not null do nothing
      returning id into v_new;
    if v_new is not null then
      update members set ai_tokens = ai_tokens + p_amount, ai_tokens_granted = ai_tokens_granted + p_amount where code = p_code;
    end if;
  end if;
  return query select m.ai_tokens, m.ai_tokens_granted from members m where m.code = p_code;
end $$;

revoke all on function public.charge_ai_tokens(text, integer, text) from public, anon, authenticated;
revoke all on function public.grant_ai_tokens(text, integer, text, text) from public, anon, authenticated;
grant execute on function public.charge_ai_tokens(text, integer, text) to service_role;
grant execute on function public.grant_ai_tokens(text, integer, text, text) to service_role;

-- Tagihan paket token. Daftar plan mengikuti migrations/talkhis_addon.sql.
alter table public.payment_checkouts drop constraint if exists payment_checkouts_plan_check;
alter table public.payment_checkouts
  add constraint payment_checkouts_plan_check check (plan in ('library', 'library_ai', 'ai', 'imtihan', 'rombongan', 'talkhis_1', 'talkhis_3', 'token'));
alter table public.payment_checkouts add column if not exists tokens integer;

-- Waktu model token mulai berlaku. Pembelian SEBELUM waktu ini dikonversi jadi token (sekali, otomatis).
insert into public.app_settings (key, value)
  values ('aiTokensStart', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'))
  on conflict (key) do nothing;
