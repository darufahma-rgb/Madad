-- Fase 3 mutu prompt library: masukan pengguna per prompt, tinjauan asatidz per maddah,
-- dan tugas "prompt" (uji prompt library) di Evaluasi AI.
-- Jalankan sekali di Supabase SQL Editor. Hanya server (service role) yang membaca/menulis.

-- 👍/👎 "Prompt ini membantu?" dari kartu prompt. Satu penilaian per member per prompt (bisa diubah).
create table if not exists prompt_feedback (
  id           uuid primary key default gen_random_uuid(),
  member_code  text not null,
  source       text not null check (source in ('kuliah','mahad')),
  maddah_id    text not null,
  prompt_kind  text not null,             -- pahami, hafal, latihan, ujian, talaqqi, eksplorasi, tabs
  prompt_title text not null,
  rating       smallint not null check (rating in (-1, 1)),
  reason       text check (reason in (
                 'tidak_sesuai_maddah','tidak_sesuai_ujian','jawaban_ai_salah','bingung_isian','terlalu_panjang','lainnya')),
  note         text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (member_code, source, maddah_id, prompt_kind, prompt_title)
);
create index if not exists prompt_feedback_updated_idx on prompt_feedback (updated_at desc);
alter table prompt_feedback enable row level security;

-- Tinjauan asatidz: satu baris per keputusan (riwayat tetap tersimpan; yang terbaru dipakai).
create table if not exists prompt_reviews (
  id           uuid primary key default gen_random_uuid(),
  source       text not null check (source in ('kuliah','mahad')),
  maddah_id    text not null,
  fakultas     text,                      -- fakultas/jenjang yang diwakili peninjau
  reviewer     text not null,             -- nama ustadz/senior
  status       text not null check (status in ('disetujui','perlu_revisi')),
  notes        text,
  prompt_count int,
  rubric_score int,                       -- skor rubrik otomatis saat ditinjau (0–100)
  created_at   timestamptz not null default now()
);
create index if not exists prompt_reviews_maddah_idx on prompt_reviews (source, maddah_id, created_at desc);
alter table prompt_reviews enable row level security;

-- Evaluasi AI: izinkan soal uji jenis "prompt" (menjalankan prompt library lalu dinilai dengan rubrik).
alter table ai_golden_items drop constraint if exists ai_golden_items_task_check;
alter table ai_golden_items add constraint ai_golden_items_task_check
  check (task in ('summary','qa','irab','tasykil','grade','prompt'));
