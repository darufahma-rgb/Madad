-- Golden set & evaluasi AI Partner: soal uji yang diperiksa asatidz, dan hasil setiap kali evaluasi dijalankan.
-- Jalankan sekali di Supabase SQL Editor. Hanya server (service role) yang membaca/menulis.

create table if not exists ai_golden_items (
  id          uuid primary key default gen_random_uuid(),
  task        text not null check (task in ('summary','qa','irab','tasykil','grade')),
  title       text not null,
  maddah      text,
  input       jsonb not null,           -- bentuk tergantung task (lihat api/_lib/ai-partner/eval.js)
  expected    jsonb not null,           -- kunci jawaban dari asatidz
  status      text not null default 'draft' check (status in ('draft','verified','archived')),
  reviewer    text,                     -- nama pemeriksa (ustadz/senior)
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists ai_eval_runs (
  id           uuid primary key default gen_random_uuid(),
  label        text,
  model        text,                    -- null = model per tugas sesuai Settings (konfigurasi produksi)
  judge_model  text not null,
  include_drafts boolean not null default false,
  status       text not null default 'running' check (status in ('running','done')),
  item_count   int not null default 0,
  avg_score    numeric,
  scores       jsonb,                   -- rata-rata per task
  models_used  jsonb,                   -- model sebenarnya per task
  created_at   timestamptz not null default now(),
  finished_at  timestamptz
);

create table if not exists ai_eval_results (
  id          uuid primary key default gen_random_uuid(),
  run_id      uuid not null references ai_eval_runs(id) on delete cascade,
  item_id     uuid not null,
  task        text not null,
  model       text,
  score       numeric,                  -- 0–100; null = menunggu penilaian AI penguji
  detail      jsonb,
  output      text,
  ms          int,
  error       text,
  created_at  timestamptz not null default now(),
  unique (run_id, item_id)
);

create index if not exists ai_eval_results_run_idx on ai_eval_results (run_id);
alter table ai_golden_items enable row level security;
alter table ai_eval_runs    enable row level security;
alter table ai_eval_results enable row level security;
