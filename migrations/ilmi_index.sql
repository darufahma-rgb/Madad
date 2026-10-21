-- Talqeeh Ilmi Index (الفهرس العلمي الذكي): peta pembahasan per halaman PDF muqarrar + penelusuran kutipan.
-- Jalankan sekali di Supabase SQL Editor. Aman diulang (if not exists) dan tidak menyentuh tabel lama.
-- Semua tabel service-role-only: RLS aktif TANPA policy, jadi browser (anon/authenticated) tidak bisa membaca
-- apa pun. Server (api/ai-partner.js → api/_lib/ai-partner/ilmi-index.js) selalu memfilter member_code pemilik,
-- jadi dokumen privat tidak bisa dibuka member lain.

-- 1. Dokumen: satu baris per (member, sidik jari file, parameter analisis). Kunci ini yang mencegah analisis ulang.
create table if not exists ilmi_documents (
  id             uuid primary key default gen_random_uuid(),
  member_code    text not null,
  file_hash      text not null check (file_hash ~ '^[0-9a-f]{64}$'),
  params_key     text not null,
  title          text not null,
  file_name      text,
  file_size      bigint check (file_size is null or file_size >= 0),
  num_pages      int  not null check (num_pages > 0 and num_pages <= 1000),
  pdf_kind       text check (pdf_kind in ('text','scan','mixed')),
  page_stats     jsonb not null default '{}'::jsonb,  -- {text, fixed, ocr, empty, garbled, unread}
  printed_map    jsonb not null default '{}'::jsonb,  -- {"12": {"p": 10, "s": "detected"|"inferred"}} — hanya yang andal
  printed_segments jsonb not null default '[]'::jsonb,
  edition        jsonb not null default '{}'::jsonb,  -- metadata edisi yang diisi pengguna (judul, penulis, tahun, cetakan, penerbit)
  status         text not null default 'uploading'
                 check (status in ('uploading','ready','analyzing','finalizing','done','partial','failed')),
  model          text,
  stats          jsonb not null default '{}'::jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (member_code, file_hash, params_key)
);
create index if not exists ilmi_documents_member_idx on ilmi_documents (member_code, updated_at desc);
alter table ilmi_documents enable row level security;

-- 2. Teks asli per halaman PDF (evidence divalidasi terhadap teks ini). page_no = urutan fisik halaman di PDF (1 = sampul).
create table if not exists ilmi_pages (
  document_id       uuid not null references ilmi_documents(id) on delete cascade,
  page_no           int  not null check (page_no > 0),
  text              text not null default '',
  norm_text         text not null default '',          -- huruf Arab dinormalkan, untuk pencarian
  char_count        int  not null default 0,
  status           text not null check (status in ('ok','fixed','ocr','empty','garbled','unread')),
  printed_candidate int check (printed_candidate is null or printed_candidate > 0),
  created_at        timestamptz not null default now(),
  primary key (document_id, page_no)
);
alter table ilmi_pages enable row level security;

-- 3. Job analisis + progres. Satu job aktif per dokumen.
create table if not exists ilmi_jobs (
  id           uuid primary key default gen_random_uuid(),
  document_id  uuid not null references ilmi_documents(id) on delete cascade,
  member_code  text not null,
  status       text not null default 'running' check (status in ('running','done','partial','failed')),
  total_chunks int  not null check (total_chunks >= 0),
  plan         jsonb not null default '[]'::jsonb,     -- [{from, to}] halaman PDF per chunk
  model        text,
  error        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  finished_at  timestamptz
);
create unique index if not exists ilmi_jobs_document_idx on ilmi_jobs (document_id);
alter table ilmi_jobs enable row level security;

-- 4. Hasil per chunk (disimpan bertahap). Primary key (job, chunk) → mengulang chunk yang gagal menimpa, tidak menggandakan.
create table if not exists ilmi_chunks (
  job_id       uuid not null references ilmi_jobs(id) on delete cascade,
  chunk_index  int  not null check (chunk_index >= 0),
  page_from    int  not null,
  page_to      int  not null,
  status       text not null default 'pending' check (status in ('pending','done','failed','skipped')),
  attempts     int  not null default 0,
  result       jsonb,
  stats        jsonb not null default '{}'::jsonb,
  tokens_in    int,
  tokens_out   int,
  cost_usd     numeric(12,6),
  error        text,
  updated_at   timestamptz not null default now(),
  primary key (job_id, chunk_index)
);
alter table ilmi_chunks enable row level security;

-- 5. Entri indeks hierarkis (kitab/bab/fasl/mabhath/matlab/masalah/subtopic).
create table if not exists ilmi_entries (
  id            uuid primary key,
  document_id   uuid not null references ilmi_documents(id) on delete cascade,
  parent_id     uuid references ilmi_entries(id) on delete cascade,
  position      int  not null,
  level         text not null check (level in ('kitab','muqaddimah','bab','fasl','mabhath','matlab','masalah','subtopic')),
  title_ar      text not null,
  title_source  text not null check (title_source in ('original','generated')),
  summary_id    text,
  page_start    int  not null check (page_start > 0),
  page_end      int  not null check (page_end >= page_start),
  printed_start int,
  printed_end   int,
  confidence    real not null default 0.5 check (confidence >= 0 and confidence <= 1),
  verification  text not null check (verification in ('verified','needs_review'))
);
create index if not exists ilmi_entries_document_idx on ilmi_entries (document_id, position);
create index if not exists ilmi_entries_parent_idx on ilmi_entries (parent_id);
alter table ilmi_entries enable row level security;

-- 6. Kitab sumber yang disebut muqarrar. Halaman/jilid sumber hanya bila tertulis di muqarrar; selalu "belum diverifikasi"
--    sampai ada dokumen sumber untuk dibandingkan secara tekstual.
create table if not exists ilmi_source_refs (
  id                  uuid primary key,
  document_id         uuid not null references ilmi_documents(id) on delete cascade,
  book_title          text not null,           -- persis seperti tertulis di muqarrar
  author              text,                     -- hanya bila tertulis di muqarrar
  mention_count       int  not null default 1,
  first_page          int  not null,
  pages               int[] not null default '{}',
  source_verification text not null default 'unverified' check (source_verification in ('unverified','verified','not_found'))
);
create index if not exists ilmi_source_refs_document_idx on ilmi_source_refs (document_id);
alter table ilmi_source_refs enable row level security;

-- 7. Kutipan: pendapat ulama, mazhab, ayat, hadis, rujukan kitab, ijma', qiyas. quote_ar = potongan teks ASLI dokumen.
create table if not exists ilmi_citations (
  id                  uuid primary key,
  document_id         uuid not null references ilmi_documents(id) on delete cascade,
  entry_id            uuid references ilmi_entries(id) on delete set null,
  source_ref_id       uuid references ilmi_source_refs(id) on delete set null,
  position            int  not null,
  kind                text not null check (kind in ('scholar_quote','madhhab_opinion','ayah','hadith','book_ref','ijma','qiyas')),
  quote_ar            text not null,
  scholar             text,                     -- hanya bila tertulis di dokumen
  madhhab             text,
  book                text,                     -- hanya bila tertulis di dokumen
  source_volume       text,                     -- jilid kitab sumber, hanya bila tertulis
  source_page         text,                     -- halaman kitab sumber, hanya bila tertulis (BUKAN halaman muqarrar)
  page_no             int  not null check (page_no > 0),   -- halaman PDF
  printed_page        int,                      -- halaman cetak muqarrar, hanya bila andal
  attribution         text not null check (attribution in ('explicit','inferred','unknown')),
  verification        text not null check (verification in ('verified','needs_review')),
  source_verification text not null default 'unverified' check (source_verification in ('unverified','verified','not_found')),
  confidence          real not null default 0.5 check (confidence >= 0 and confidence <= 1),
  occurrences         int  not null default 1
);
create index if not exists ilmi_citations_document_idx on ilmi_citations (document_id, position);
create index if not exists ilmi_citations_entry_idx on ilmi_citations (entry_id);
alter table ilmi_citations enable row level security;

-- 8. Evidence: lokasi bukti di teks asli halaman (offset karakter di ilmi_pages.text).
create table if not exists ilmi_evidence (
  id           bigint generated always as identity primary key,
  document_id  uuid not null references ilmi_documents(id) on delete cascade,
  owner_type   text not null check (owner_type in ('entry','citation','source_ref')),
  owner_id     uuid not null,
  page_no      int  not null check (page_no > 0),
  snippet      text not null,
  char_start   int,
  char_end     int,
  match_score  real,
  method       text
);
create index if not exists ilmi_evidence_document_idx on ilmi_evidence (document_id, owner_type);
create index if not exists ilmi_evidence_owner_idx on ilmi_evidence (owner_id);
alter table ilmi_evidence enable row level security;
