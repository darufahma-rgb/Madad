-- Cache OCR bersama per muqarrar: halaman PDF scan yang sudah dibaca AI disimpan per sidik jari file (SHA-256)
-- dan nomor halaman, supaya mahasiswa lain yang mengunggah PDF yang sama tidak membayar OCR lagi.
-- Hasil satu member baru dipakai bersama setelah member lain membaca halaman yang sama dengan hasil serupa
-- (verified) — mencegah cache dikotori gambar yang tidak sesuai. Hasil sendiri selalu dipakai ulang untuk diri sendiri.
-- Jalankan sekali di Supabase SQL Editor. Hanya server (service role) yang membaca/menulis.
create table if not exists ocr_page_cache (
  file_hash   text not null check (file_hash ~ '^[0-9a-f]{64}$'),
  page        int  not null check (page > 0),
  member_code text not null,
  teks        text not null,
  verified    boolean not null default false,
  created_at  timestamptz not null default now(),
  primary key (file_hash, page, member_code)
);
create index if not exists ocr_page_cache_lookup_idx on ocr_page_cache (file_hash, page) where verified;
alter table ocr_page_cache enable row level security;
