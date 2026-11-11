-- Kupon Paket Imtihan Rp149.000 dari follow Instagram @talqeeh (api/_lib/offer.js).
-- offer_coupon_at: kapan kupon didapat (hitung mundur 24 jam mulai dari sini). Satu akun sekali.
-- offer_coupon_hash: sidik screenshot yang diterima, supaya file screenshot yang sama tidak dipakai akun lain.
-- offer_coupon_code: kode kupon acak yang diberikan (mis. TQ-7K3M9P); harga baru berlaku kalau kode ini dimasukkan saat bayar.
alter table members add column if not exists offer_coupon_at timestamptz;
alter table members add column if not exists offer_coupon_hash text;
alter table members add column if not exists offer_coupon_code text;
create unique index if not exists members_offer_coupon_hash_idx on members (offer_coupon_hash) where offer_coupon_hash is not null;
