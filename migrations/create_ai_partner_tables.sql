-- AI Partner Belajar Muqarrar
-- Jalankan sekali di Supabase SQL Editor.
-- Semua tabel service-role-only: RLS aktif TANPA policy, jadi hanya bisa diakses dari api/*.js (server).

-- 1. Status langganan add-on (diisi webhook Mayar atau grant manual admin)
create table if not exists ai_subscriptions (
  id            uuid primary key default gen_random_uuid(),
  member_code   text not null,
  product_id    text,
  status        text not null check (status in ('active','expired','unsubscribed')),
  mayar_email   text,
  mayar_mobile  text,
  last_event    text,
  last_event_at timestamptz,
  raw_payload   jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (member_code, product_id)
);
alter table ai_subscriptions enable row level security;

-- 2. Materi + hasil AI per member
create table if not exists study_sets (
  id              uuid primary key default gen_random_uuid(),
  member_code     text not null,
  title           text not null,
  maddah_id       text,
  source_type     text not null default 'teks' check (source_type in ('pdf','foto','teks')),
  content         text not null,
  summary         text,
  flashcards      jsonb,
  quiz            jsonb,
  quiz_best_score int,
  chat            jsonb not null default '[]'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists study_sets_member_code_idx on study_sets (member_code, created_at desc);
alter table study_sets enable row level security;

-- 3. Kuota harian per member per jenis aksi
create table if not exists ai_usage (
  member_code text not null,
  day         date not null default current_date,
  kind        text not null,
  count       int  not null default 0,
  primary key (member_code, day, kind)
);
alter table ai_usage enable row level security;

-- Atomik: menambah 1 dan mengembalikan true jika masih di bawah limit, false jika kuota habis.
create or replace function consume_ai_quota(p_code text, p_kind text, p_limit int)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  ok boolean;
begin
  insert into ai_usage (member_code, day, kind, count)
  values (p_code, current_date, p_kind, 1)
  on conflict (member_code, day, kind)
  do update set count = ai_usage.count + 1
  where ai_usage.count < p_limit
  returning true into ok;
  return coalesce(ok, false);
end;
$$;

-- RPC ini hanya boleh dipanggil server (service role), bukan dari browser.
revoke execute on function consume_ai_quota(text, text, int) from public, anon, authenticated;
grant execute on function consume_ai_quota(text, text, int) to service_role;
