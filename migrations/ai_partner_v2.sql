-- AI Partner v2: format materi baru, fitur bahasa Arab, dan jatah coba gratis.
-- Jalankan sekali di Supabase SQL Editor setelah create_ai_partner_tables.sql.

-- 1. Sumber materi baru (dokumen Office, TXT, audio, video, gabungan beberapa file)
alter table study_sets drop constraint if exists study_sets_source_type_check;
alter table study_sets add constraint study_sets_source_type_check
  check (source_type in ('pdf','foto','teks','docx','pptx','xlsx','txt','audio','video','campuran'));

-- 2. Hasil fitur baru per materi
-- analyses menyimpan cache terjemah & i'rab serta harakat per paragraf (maks 40 entri terbaru).
alter table study_sets
  add column if not exists summary_lang    text,
  add column if not exists glossary        jsonb,
  add column if not exists mindmap         jsonb,
  add column if not exists essays          jsonb,
  add column if not exists essay_attempts  jsonb not null default '[]'::jsonb,
  add column if not exists analyses        jsonb not null default '[]'::jsonb,
  add column if not exists progress        jsonb not null default '{}'::jsonb;

-- 3. Coba gratis: member Library tanpa langganan boleh membuat SATU materi.
--    Terisi = jatah sudah dipakai (diisi atomik oleh server, tidak pernah dikosongkan lagi).
alter table members add column if not exists ai_trial_set_id uuid;
