-- Pembersihan sisa teks AI/OCR di 4 soal Bank Soal (hasil audit 26 Sep 2026).
-- Jalankan di Supabase SQL Editor. Aman dijalankan ulang: tiap UPDATE hanya mengenai soal yang masih
-- diawali sisa teks tersebut, jadi soal yang sudah bersih tidak berubah ("UPDATE 0").
-- Teks soal tidak ditempel ulang — perbaikan dilakukan langsung pada teks yang ada di database.

-- 8140a999 · Ahwal Syakhshiyah: hapus judul AI sebelum soal pertama.
update public.bank_soal
set soal = substr(soal, strpos(soal, '[SOAL_ARAB]'))
where id = '8140a999-a277-4162-bce6-9cf83030882d' and soal like '## Hasil Ekstraksi Soal Ujian%';

-- a6364d82 · Mustholah Hadits: hapus judul AI, ganti catatan AI jadi peringatan netral.
-- Soal no. 27–50 tetap perlu dicek dari foto asli (minta ke pengirim — foto dihapus saat approve).
update public.bank_soal
set soal = replace(substr(soal, strpos(soal, '[SOAL_ARAB]')),
  '> **Catatan:** Soal nomor 27 ke atas (bagian kanan foto) merupakan lanjutan soal pilihan ganda nomor 27-50, namun sebagian teks terpotong dan kurang terbaca jelas di bagian tepi foto. Berikut yang dapat terbaca:',
  '> ⚠️ Soal no. 27–50 di foto asli sebagian terpotong di tepi foto. Teks di bawah adalah bagian yang terbaca dan mungkin belum lengkap.')
where id = 'a6364d82-71ac-427d-ad12-57c5d4ddd6bd' and soal like '# Ekstraksi Soal Ujian%';

-- 6671b498 · Tafsir Tahlili & 83206630 · Tajwid: pindahkan skor "[٤٠ درجة]" ke awal soal pertama.
update public.bank_soal
set soal = regexp_replace(
             regexp_replace(substr(soal, strpos(soal, '[SOAL_ARAB]')), '^\[SOAL_ARAB\]\n', E'[SOAL_ARAB]\n**(٤٠ درجة)**\n'),
             '\[ARTI\]\n', E'[ARTI]\n**(40 poin)**\n')
where id in ('6671b498-db4d-4ba2-8b40-97fea1da2c9b', '83206630-1ac7-434f-b3b2-b56c74da7ccc') and soal like '[٤٠ درجة]**%';

-- Cek hasil: keempat soal harus diawali "[SOAL_ARAB]".
select left(id::text, 8) as id, maddah_nama, left(soal, 40) as awal_soal
from public.bank_soal
where id in ('8140a999-a277-4162-bce6-9cf83030882d', 'a6364d82-71ac-427d-ad12-57c5d4ddd6bd', '6671b498-db4d-4ba2-8b40-97fea1da2c9b', '83206630-1ac7-434f-b3b2-b56c74da7ccc');
