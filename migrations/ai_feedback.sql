-- Masukan kualitas AI Partner: 👍/👎 dan laporan kesalahan per hasil AI.
-- Jalankan sekali di Supabase SQL Editor. Hanya server (service role) yang membaca/menulis.

create table if not exists ai_feedback (
  id          uuid primary key default gen_random_uuid(),
  member_code text not null,
  set_id      uuid not null,           -- tanpa foreign key: masukan tetap tersimpan walau materinya dihapus
  kind        text not null check (kind in (
                'summary','mindmap','flashcards','quiz','glossary','essays',
                'grade','irab','tasykil','tutor','syafawi')),
  ref         text not null default '', -- penanda hasil yang dinilai (hash isi / nomor soal)
  rating      smallint not null check (rating in (-1, 1)),
  category    text check (category in (
                'salah_fakta','salah_arab','salah_harakat','tidak_sesuai_materi','kurang_jelas','terpotong','lainnya')),
  note        text,
  snippet     text,                     -- potongan hasil AI yang dinilai (maks 1500 karakter)
  model       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (member_code, set_id, kind, ref)
);

create index if not exists ai_feedback_created_idx on ai_feedback (created_at desc);
alter table ai_feedback enable row level security;
