-- Pustaka Rujukan untuk kitab besar. Jalankan SETELAH ilmi_index.sql dan reference_library.sql. Aman diulang;
-- tidak menghapus data.
--
-- Sebelumnya setiap pertanyaan memindai seluruh ilmi_pages dengan strpos (tanpa indeks). Sekarang:
-- - Halaman kitab yang diaktifkan sebagai rujukan ditandai is_reference (diatur server saat aktivasi/nonaktif).
-- - Indeks trigram (pg_trgm) PARSIAL hanya untuk halaman rujukan yang terbaca — dokumen pribadi pengguna tidak
--   ikut diindeks, jadi ukurannya sebanding dengan isi pustaka saja.
-- - search_reference_passages mencari kandidat lewat indeks (regex alternatif istilah ≥3 huruf, makna sama dengan
--   strpos), lalu skor dihitung seperti sebelumnya. Istilah 2 huruf tetap menambah skor, tapi tidak dipakai untuk
--   mencari kandidat (tidak bisa diindeks trigram); bila semua istilah hanya 2 huruf, dipakai pemindaian lama.

create extension if not exists pg_trgm;

alter table ilmi_pages add column if not exists is_reference boolean not null default false;

-- Kitab yang sudah aktif sebelum migrasi ini.
update ilmi_pages p set is_reference = true
from talqeeh_reference_books b
where b.document_id = p.document_id and b.active and not p.is_reference;

create index if not exists ilmi_pages_reference_trgm_idx on ilmi_pages
  using gin (norm_text gin_trgm_ops)
  where is_reference and status in ('ok', 'fixed', 'ocr');

-- Pola regex dari istilah ≥3 huruf (karakter khusus di-escape). null bila tidak ada istilah yang bisa diindeks.
create or replace function reference_term_pattern(terms text[])
returns text language sql immutable set search_path = public as $$
  select string_agg(regexp_replace(t, '([.^$*+?()\[\]{}|\\])', '\\\1', 'g'), '|')
  from unnest(terms[1:16]) t
  where length(t) >= 3
$$;

create or replace function search_reference_passages(terms text[], subject text default '')
returns table(document_id uuid, page_no int, text text, title text, edition jsonb,
  printed jsonb, score bigint, before_text text, after_text text, topics jsonb)
language plpgsql stable security invoker set search_path = public as $$
declare
  re text := reference_term_pattern(terms);
  -- Syarat kandidat dipilih di sini (bukan "a or b" di satu query) supaya rencana query selalu bisa memakai indeks.
  match_sql text := case when re is not null then 'p.norm_text ~ $3'
    else 'exists(select 1 from unnest($1[1:16]) t where length(t) >= 2 and strpos(p.norm_text, t) > 0)' end;
begin
  return query execute format($q$
  with candidates as (
    select p.document_id, p.page_no, p.text, d.title, d.edition,
      d.printed_map -> p.page_no::text as printed,
      (select count(*) from unnest($1[1:16]) t where length(t) >= 2 and strpos(p.norm_text, t) > 0)
        + case when $2 <> '' and d.edition->>'subject' = $2 then 3 else 0 end as score
    from ilmi_pages p
    join ilmi_documents d on d.id = p.document_id
    join talqeeh_reference_books b on b.document_id = d.id and b.active
    where p.is_reference and p.status in ('ok', 'fixed', 'ocr')
      and d.member_code = 'ADMIN-REFERENCE' and d.status = 'done'
      and %s
    order by score desc, p.document_id, p.page_no
    limit 8
  )
  select c.document_id, c.page_no, c.text, c.title, c.edition, c.printed, c.score,
    right(prev.text, 700), left(nextp.text, 700),
    coalesce((select jsonb_agg(x.title_ar) from (
      select e.title_ar from ilmi_entries e
      where e.document_id = c.document_id and e.page_start <= c.page_no and e.page_end >= c.page_no
      order by (e.page_end - e.page_start), e.position limit 3
    ) x), '[]'::jsonb)
  from candidates c
  left join ilmi_pages prev on prev.document_id = c.document_id and prev.page_no = c.page_no - 1 and prev.status in ('ok', 'fixed', 'ocr')
  left join ilmi_pages nextp on nextp.document_id = c.document_id and nextp.page_no = c.page_no + 1 and nextp.status in ('ok', 'fixed', 'ocr')
  order by c.score desc, c.document_id, c.page_no
  $q$, match_sql) using terms, coalesce(subject, ''), re;
end;
$$;
revoke all on function search_reference_passages(text[], text) from public, anon, authenticated;
grant execute on function search_reference_passages(text[], text) to service_role;
revoke all on function reference_term_pattern(text[]) from public, anon, authenticated;
grant execute on function reference_term_pattern(text[]) to service_role;
