-- Cek kesiapan Pustaka Rujukan. HANYA MEMBACA, aman dijalankan kapan saja di Supabase SQL Editor.
-- Hasilnya satu tabel: tiap baris "OK" atau "BELUM" beserta langkah berikutnya.
-- Lanjutan langkah ada di docs/reference-library.md.

with checks as (
  select 1 as urut, 'Tabel Ilmi Index (ilmi_documents, ilmi_pages)' as cek,
    to_regclass('public.ilmi_documents') is not null and to_regclass('public.ilmi_pages') is not null as lulus,
    'Jalankan migrations/ilmi_index.sql' as langkah, null::text as info
  union all
  select 2, 'Tabel talqeeh_reference_books',
    to_regclass('public.talqeeh_reference_books') is not null,
    'Jalankan migrations/reference_library.sql', null
  union all
  select 3, 'Ekstensi pg_trgm',
    exists(select 1 from pg_extension where extname = 'pg_trgm'),
    'Jalankan migrations/reference_library_scale.sql', null
  union all
  select 4, 'Kolom ilmi_pages.is_reference',
    exists(select 1 from information_schema.columns where table_schema = 'public' and table_name = 'ilmi_pages' and column_name = 'is_reference'),
    'Jalankan migrations/reference_library_scale.sql', null
  union all
  select 5, 'Indeks trigram halaman rujukan',
    to_regclass('public.ilmi_pages_reference_trgm_idx') is not null,
    'Jalankan migrations/reference_library_scale.sql', null
  union all
  select 6, 'Fungsi search_reference_passages versi berindeks',
    exists(select 1 from pg_proc where proname = 'search_reference_passages' and prosrc like '%is_reference%'),
    'Jalankan migrations/reference_library_scale.sql', null
  union all
  select 7, 'Browser tidak bisa memanggil fungsi pencarian',
    to_regprocedure('public.search_reference_passages(text[],text)') is not null
    and not has_function_privilege('anon', to_regprocedure('public.search_reference_passages(text[],text)'), 'execute')
    and not has_function_privilege('authenticated', to_regprocedure('public.search_reference_passages(text[],text)'), 'execute'),
    'Jalankan ulang migrations/reference_library_scale.sql (bagian revoke)', null
)
select urut, cek, case when lulus then 'OK' else 'BELUM' end as status,
  case when lulus then '' else langkah end as langkah
from checks
order by urut;
