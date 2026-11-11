-- Sumbangan materi AI Partner (study_sets) dari pengguna. Aman diulang; tidak mengubah materi yang sudah ada.
--
-- Alur: pengguna menyetujui -> baris pending (menunjuk materinya) -> admin membaca teksnya -> diterima: teks materi dan
-- talkhisnya disalin ke baris ini, lalu tautan ke materi pengguna dikosongkan. Materi pengguna tetap privat dan terpisah.
-- Menerima sumbangan belum memakainya untuk pengguna lain; salinan ini bahan untuk talkhis/rujukan bersama nanti.

create table if not exists material_submissions (
  id              uuid primary key default gen_random_uuid(),
  -- Hanya diisi selama belum diterima: bila pengguna menghapus materinya, sumbangan yang belum diterima ikut hilang.
  study_set_id    uuid references study_sets(id) on delete cascade,
  member_code     text not null,
  -- Sidik jari teks yang dinormalisasi (harakat dibuang): materi yang sama tidak mengantre dua kali.
  content_hash    text not null check (content_hash ~ '^[0-9a-f]{64}$'),
  title           text not null,
  maddah_id       text,
  source_type     text not null,
  source_kind     text not null check (source_kind in ('kitab','muqarrar')),
  status          text not null default 'pending' check (status in ('pending','approved','rejected')),
  consent_version text not null,
  consent_at      timestamptz not null default now(),
  review_note     text,
  reviewed_at     timestamptz,
  -- Salinan yang diterima. Kosong selama menunggu, jadi admin membaca langsung dari materi pengguna.
  content         text,
  talkhis         jsonb,
  created_at      timestamptz not null default now()
);
create unique index if not exists material_submissions_active_hash_idx
  on material_submissions (content_hash) where status in ('pending','approved');
create index if not exists material_submissions_status_idx on material_submissions (status, created_at);
create index if not exists material_submissions_member_idx on material_submissions (member_code, study_set_id);
create index if not exists material_submissions_set_idx on material_submissions (study_set_id);
alter table material_submissions enable row level security;
revoke all on material_submissions from anon, authenticated;
