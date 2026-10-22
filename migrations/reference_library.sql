-- Run after ilmi_index.sql. Admin uploads live under a separate server-only owner.
-- Publishing exposes extracted text, not private member documents or the PDF binary.
create table if not exists talqeeh_reference_books (
  document_id uuid primary key references ilmi_documents(id) on delete cascade,
  active boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table talqeeh_reference_books enable row level security;
revoke all on talqeeh_reference_books from anon, authenticated;

-- Bounded server-side retrieval: no full-library download per question.
create or replace function search_reference_pages(terms text[])
returns table(document_id uuid, page_no int, text text, title text, edition jsonb,
  printed jsonb, score bigint)
language sql stable security invoker set search_path = public as $$
  select p.document_id, p.page_no, p.text, d.title, d.edition,
    d.printed_map -> p.page_no::text,
    (select count(*) from unnest(terms[1:16]) t where length(t) >= 2 and strpos(p.norm_text, t) > 0) as score
  from ilmi_pages p
  join ilmi_documents d on d.id = p.document_id
  join talqeeh_reference_books b on b.document_id = d.id and b.active
  where d.member_code = 'ADMIN-REFERENCE' and d.status = 'done'
    and p.status in ('ok','fixed','ocr')
    and exists(select 1 from unnest(terms[1:16]) t where length(t) >= 2 and strpos(p.norm_text,t) > 0)
  order by score desc, p.document_id, p.page_no
  limit 8;
$$;
revoke all on function search_reference_pages(text[]) from public, anon, authenticated;
grant execute on function search_reference_pages(text[]) to service_role;

-- Context-aware search, additive: retain the earlier RPC for compatibility.
create or replace function search_reference_passages(terms text[], subject text default '')
returns table(document_id uuid, page_no int, text text, title text, edition jsonb,
  printed jsonb, score bigint, before_text text, after_text text, topics jsonb)
language sql stable security invoker set search_path = public as $$
  with candidates as (
    select p.document_id, p.page_no, p.text, d.title, d.edition,
      d.printed_map -> p.page_no::text as printed,
      (select count(*) from unnest(terms[1:16]) t where length(t) >= 2 and strpos(p.norm_text,t) > 0)
        + case when subject <> '' and d.edition->>'subject' = subject then 3 else 0 end as score
    from ilmi_pages p
    join ilmi_documents d on d.id=p.document_id
    join talqeeh_reference_books b on b.document_id=d.id and b.active
    where d.member_code='ADMIN-REFERENCE' and d.status='done'
      and p.status in ('ok','fixed','ocr')
      and exists(select 1 from unnest(terms[1:16]) t where length(t)>=2 and strpos(p.norm_text,t)>0)
    order by score desc, p.document_id, p.page_no limit 8
  )
  select c.document_id,c.page_no,c.text,c.title,c.edition,c.printed,c.score,
    right(prev.text,700),left(nextp.text,700),
    coalesce((select jsonb_agg(x.title_ar) from (
      select e.title_ar from ilmi_entries e
      where e.document_id=c.document_id and e.page_start<=c.page_no and e.page_end>=c.page_no
      order by (e.page_end-e.page_start),e.position limit 3
    ) x),'[]'::jsonb)
  from candidates c
  left join ilmi_pages prev on prev.document_id=c.document_id and prev.page_no=c.page_no-1 and prev.status in ('ok','fixed','ocr')
  left join ilmi_pages nextp on nextp.document_id=c.document_id and nextp.page_no=c.page_no+1 and nextp.status in ('ok','fixed','ocr')
  order by c.score desc,c.document_id,c.page_no;
$$;
revoke all on function search_reference_passages(text[],text) from public,anon,authenticated;
grant execute on function search_reference_passages(text[],text) to service_role;
