-- Sumbangan kitab dari pengguna ke Pustaka Rujukan. Jalankan SETELAH ilmi_index.sql, reference_library.sql, dan
-- reference_library_scale.sql. Aman diulang; tidak mengubah dokumen yang sudah ada.
--
-- Alur: pengguna menyetujui -> baris pending -> admin memeriksa -> approve_reference_submission menyalin dokumen ke
-- pemilik ADMIN-REFERENCE. Salinan pengguna tetap privat dan terpisah. Kitab baru dipakai menjawab setelah admin
-- melengkapi metadata dan menekan "Aktifkan sebagai rujukan". Menerima sumbangan tidak langsung menerbitkannya.

create table if not exists reference_submissions (
  id                  uuid primary key default gen_random_uuid(),
  -- Salinan pengguna. Hanya diisi selama belum diterima: bila pengguna menghapus dokumennya, sumbangan yang belum
  -- diterima ikut hilang. Setelah diterima dikosongkan, jadi riwayatnya bertahan.
  document_id         uuid references ilmi_documents(id) on delete cascade,
  member_code         text not null,
  file_hash           text not null check (file_hash ~ '^[0-9a-f]{64}$'),
  title               text not null,
  source_kind         text not null check (source_kind in ('kitab','muqarrar')),
  status              text not null default 'pending' check (status in ('pending','approved','rejected')),
  consent_version     text not null,
  consent_at          timestamptz not null default now(),
  review_note         text,
  -- Bila salinan pustaka dihapus admin, catatannya ikut hilang supaya file itu bisa disumbangkan lagi.
  library_document_id uuid references ilmi_documents(id) on delete cascade,
  reviewed_at         timestamptz,
  created_at          timestamptz not null default now()
);
-- Satu file hanya boleh sekali mengantre atau diterima.
create unique index if not exists reference_submissions_active_hash_idx
  on reference_submissions (file_hash) where status in ('pending','approved');
create index if not exists reference_submissions_status_idx on reference_submissions (status, created_at);
create index if not exists reference_submissions_member_idx on reference_submissions (member_code, file_hash);
create index if not exists reference_submissions_document_idx on reference_submissions (document_id);
create index if not exists reference_submissions_library_idx on reference_submissions (library_document_id);
alter table reference_submissions enable row level security;
revoke all on reference_submissions from anon, authenticated;

-- Menyalin seluruh dokumen dalam satu transaksi: gagal di tengah berarti tidak ada yang tersalin.
-- Id baru diturunkan dari id lama, jadi hubungan antar-baris tetap utuh tanpa tabel pemetaan.
-- Yang sengaja tidak disalin: nama file dan catatan edisi, karena bisa memuat data pribadi penyumbang.
create or replace function approve_reference_submission(p_id uuid)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare
  s reference_submissions%rowtype;
  d ilmi_documents%rowtype;
  new_doc uuid := gen_random_uuid();
begin
  select * into s from reference_submissions where id = p_id for update;
  if not found or s.status <> 'pending' then return jsonb_build_object('status', 'not_pending'); end if;

  select * into d from ilmi_documents where id = s.document_id and member_code = s.member_code for update;
  if not found then return jsonb_build_object('status', 'source_missing'); end if;
  if d.status <> 'done'
     or coalesce((d.page_stats->>'unread')::int, 0) > 0
     or coalesce((d.page_stats->>'garbled')::int, 0) > 0 then
    return jsonb_build_object('status', 'not_ready');
  end if;
  if exists (select 1 from ilmi_documents where member_code = 'ADMIN-REFERENCE' and file_hash = d.file_hash) then
    return jsonb_build_object('status', 'duplicate');
  end if;

  insert into ilmi_documents (id, member_code, file_hash, params_key, title, file_name, file_size, num_pages, pdf_kind,
    page_stats, printed_map, printed_segments, edition, status, model, stats)
  values (new_doc, 'ADMIN-REFERENCE', d.file_hash, d.params_key, coalesce(nullif(s.title, ''), d.title), 'kitab-sumbangan.pdf',
    d.file_size, d.num_pages, d.pdf_kind, d.page_stats, d.printed_map, d.printed_segments, d.edition - 'note', 'done', d.model, d.stats);

  insert into ilmi_pages (document_id, page_no, text, norm_text, char_count, status, printed_candidate)
  select new_doc, page_no, text, norm_text, char_count, status, printed_candidate
  from ilmi_pages where document_id = d.id;

  insert into ilmi_entries (id, document_id, parent_id, position, level, title_ar, title_source, summary_id, page_start,
    page_end, printed_start, printed_end, confidence, verification)
  select md5(new_doc::text || e.id::text)::uuid, new_doc,
    case when e.parent_id is null then null else md5(new_doc::text || e.parent_id::text)::uuid end,
    e.position, e.level, e.title_ar, e.title_source, e.summary_id, e.page_start, e.page_end, e.printed_start,
    e.printed_end, e.confidence, e.verification
  from ilmi_entries e where e.document_id = d.id;

  insert into ilmi_source_refs (id, document_id, book_title, author, mention_count, first_page, pages, source_verification)
  select md5(new_doc::text || r.id::text)::uuid, new_doc, r.book_title, r.author, r.mention_count, r.first_page, r.pages, r.source_verification
  from ilmi_source_refs r where r.document_id = d.id;

  insert into ilmi_citations (id, document_id, entry_id, source_ref_id, position, kind, quote_ar, scholar, madhhab, book,
    source_volume, source_page, page_no, printed_page, attribution, verification, source_verification, confidence, occurrences)
  select md5(new_doc::text || c.id::text)::uuid, new_doc,
    case when c.entry_id is null then null else md5(new_doc::text || c.entry_id::text)::uuid end,
    case when c.source_ref_id is null then null else md5(new_doc::text || c.source_ref_id::text)::uuid end,
    c.position, c.kind, c.quote_ar, c.scholar, c.madhhab, c.book, c.source_volume, c.source_page, c.page_no,
    c.printed_page, c.attribution, c.verification, c.source_verification, c.confidence, c.occurrences
  from ilmi_citations c where c.document_id = d.id;

  insert into ilmi_evidence (document_id, owner_type, owner_id, page_no, snippet, char_start, char_end, match_score, method)
  select new_doc, v.owner_type, md5(new_doc::text || v.owner_id::text)::uuid, v.page_no, v.snippet, v.char_start,
    v.char_end, v.match_score, v.method
  from ilmi_evidence v where v.document_id = d.id;

  update reference_submissions
  set status = 'approved', library_document_id = new_doc, document_id = null, reviewed_at = now()
  where id = s.id;

  return jsonb_build_object('status', 'ok', 'document_id', new_doc);
end;
$$;
revoke all on function approve_reference_submission(uuid) from public, anon, authenticated;
grant execute on function approve_reference_submission(uuid) to service_role;
