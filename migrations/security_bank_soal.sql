-- Keamanan bank_soal: publik hanya boleh membaca SOAL yang sudah di-approve, tanpa data pengirim.
-- Sebelumnya kunci publik (anon key) bisa membaca nama & nomor WhatsApp pengirim (submitter_name, submitter_wa)
-- di semua soal approved. Jalankan sekali di Supabase SQL Editor. Aman dijalankan ulang.
-- Server (api/*.js, service role) tidak terpengaruh: service role melewati RLS & hak kolom.

-- 1. Baris: hanya soal approved yang terlihat publik. Kebijakan lain untuk anon/authenticated dihapus —
--    submit & approve lewat /api/bank-soal (service role), bukan langsung dari browser.
do $$
declare r record;
begin
  for r in select policyname from pg_policies where schemaname = 'public' and tablename = 'bank_soal' loop
    execute format('drop policy %I on public.bank_soal', r.policyname);
  end loop;
end $$;
alter table public.bank_soal enable row level security;
create policy public_read_approved on public.bank_soal
  for select to anon, authenticated
  using (status = 'approved');

-- 2. Kolom: cabut akses baca semua kolom, lalu izinkan hanya kolom yang dipakai halaman publik
--    (bank soal, detail soal, Siap Imtihan, checklist, landing, cek soal di Submit Soal).
revoke all on public.bank_soal from anon, authenticated;
grant select (
  id, maddah_id, maddah_nama, fakultas, tingkat, tahun, fashl,
  soal, arti_soal, jawaban, penjelasan, status, approved_at
) on public.bank_soal to anon, authenticated;

-- Cek setelah dijalankan (harus error "permission denied for table bank_soal" / kolom tidak bisa dibaca):
--   select submitter_wa from bank_soal limit 1;   -- jalankan sebagai role anon di API, bukan di SQL Editor
