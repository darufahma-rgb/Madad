-- Biaya AI yang sebenarnya per panggilan (dari usage accounting OpenRouter), dipakai analitik admin.
-- Ditulis hanya oleh server (service role). RLS aktif tanpa policy → anon/authenticated tidak bisa membaca/menulis.
create table if not exists ai_cost_log (
  id          bigserial primary key,
  at          timestamptz not null default now(),
  day         date not null default current_date,
  member_code text not null,
  kind        text not null,
  detail      text,
  model       text,
  cost_usd    numeric(12, 6),
  tokens_in   integer,
  tokens_out  integer,
  estimated   boolean not null default false
);
create index if not exists ai_cost_log_day_idx on ai_cost_log (day);
create index if not exists ai_cost_log_member_idx on ai_cost_log (member_code, day);
alter table ai_cost_log enable row level security;
revoke all on ai_cost_log from anon, authenticated;
