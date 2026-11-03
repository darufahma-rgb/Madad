// Penawaran untuk akun gratis: Paket Imtihan dengan harga khusus, berlaku 24 jam per akun, sekali seumur akun.
// Akun baru mulai dihitung sejak daftar; akun gratis lama mulai dihitung saat pertama membuka Talqeeh setelah fitur ini aktif.
// Waktu mulai disimpan di members.offer_started_at (migrations/welcome_offer.sql). Harga tagihan ditentukan di sini,
// jadi yang tampil di layar dan yang ditagih Mayar selalu sama.
import { sbConfig, sbHeaders } from './member.js';

export const WELCOME_OFFER = {
  price: 149000,
  // Hitung mundur yang berjalan sebelum harga naik tetap memakai harga yang sudah dilihat penggunanya.
  previousPrice: 139000,
  priceChangedAt: '2026-11-05T00:00:00Z',
  hours: 24,
  launchedAt: '2026-10-11T16:00:00Z', // akun yang dibuat sebelum ini = akun lama
  // Hitung mundur yang sudah berjalan sebelum ini tetap 48 jam: jam yang sudah dilihat pengguna tidak boleh tiba-tiba terpotong.
  shortenedAt: '2026-11-04T00:00:00Z',
  previousHours: 48,
};

export const offerEndsAt = (startedAt) => {
  const start = Date.parse(startedAt);
  const hours = start < Date.parse(WELCOME_OFFER.shortenedAt) ? WELCOME_OFFER.previousHours : WELCOME_OFFER.hours;
  return start + hours * 3600e3;
};

const fetchOfferRow = async (code) => {
  const { url, key } = sbConfig();
  const r = await fetch(`${url}/rest/v1/members?code=eq.${encodeURIComponent(code)}&select=created_at,offer_started_at&limit=1`, { headers: sbHeaders(key) });
  if (!r.ok) return null; // kolom belum dibuat → penawaran nonaktif
  return (await r.json())?.[0] || null;
};

export const offerPriceFor = (startedAt) =>
  (Date.parse(startedAt) < Date.parse(WELCOME_OFFER.priceChangedAt) ? WELCOME_OFFER.previousPrice : WELCOME_OFFER.price);

/* member: hasil resolveMember. start = boleh memulai hitung mundur kalau belum pernah (dipanggil saat pengguna membuka app).
   Kembalian { price, endsAt } selama penawaran berlaku, selain itu null. Tidak pernah melempar error. */
export async function getWelcomeOffer(member, { start = false } = {}) {
  try {
    if (!member?.code || member.status !== 'active' || member.tier !== 'free') return null;
    const row = await fetchOfferRow(member.code);
    if (!row) return null;
    let startedAt = row.offer_started_at;
    if (!startedAt) {
      if (!start) return null;
      const created = Date.parse(row.created_at || '');
      const begin = Number.isFinite(created) && created >= Date.parse(WELCOME_OFFER.launchedAt) ? created : Date.now();
      startedAt = new Date(begin).toISOString();
      const { url, key } = sbConfig();
      // Hanya mengisi kalau masih kosong, supaya dua tab yang terbuka bersamaan tidak saling menimpa.
      const r = await fetch(`${url}/rest/v1/members?code=eq.${encodeURIComponent(member.code)}&offer_started_at=is.null&select=offer_started_at`, {
        method: 'PATCH',
        headers: sbHeaders(key, { Prefer: 'return=representation' }),
        body: JSON.stringify({ offer_started_at: startedAt }),
      });
      const saved = r.ok ? (await r.json())?.[0] : null;
      if (!saved) { const again = await fetchOfferRow(member.code); startedAt = again?.offer_started_at || null; }
      if (!startedAt) return null;
    }
    const endsAt = offerEndsAt(startedAt);
    if (!(endsAt > Date.now())) return null;
    return { price: offerPriceFor(startedAt), endsAt: new Date(endsAt).toISOString() };
  } catch {
    return null;
  }
}
