-- Talkhis otomatis per materi AI Partner: peta mabahits + talkhis Arab tiap judul + hasil cek kelengkapan.
-- Ditulis hanya oleh server (service role); RLS study_sets tetap tanpa policy untuk anon.
alter table study_sets add column if not exists talkhis jsonb;
