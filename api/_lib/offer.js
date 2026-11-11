/* Kupon Paket Imtihan untuk akun gratis: follow Instagram @talqeeh, unggah screenshot profilnya, AI memastikan
   tombolnya sudah "Mengikuti", lalu harga khusus berlaku 24 jam. Sekali per akun.
   Waktu kupon disimpan di members.offer_coupon_at (migrations/offer_coupon.sql). Harga tagihan ditentukan di sini,
   jadi yang tampil di layar dan yang ditagih Mayar selalu sama.
   Penawaran otomatis lama (members.offer_started_at, dimulai saat akun dibuka) tidak dimulai lagi; yang hitung
   mundurnya masih berjalan tetap dihormati sampai habis. */
import crypto from 'crypto';
import { sbConfig, sbHeaders, consumeQuota } from './member.js';

export const WELCOME_OFFER = {
  price: 149000,
  hours: 24,
  instagram: 'talqeeh',
  attemptsPerDay: 5,
};

export const offerEndsAt = (startedAt) => Date.parse(startedAt) + WELCOME_OFFER.hours * 3600e3;

/* Kode kupon acak per klaim, mis. "TQ-7K3M9P". Terikat ke akun yang mengklaim: kode yang disebar tidak berlaku di akun
   lain. Huruf yang mirip (0/O, 1/I/L) tidak dipakai supaya mudah diketik. */
const CODE_CHARS = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
export const newCouponCode = () => `TQ-${Array.from(crypto.randomBytes(6), b => CODE_CHARS[b % CODE_CHARS.length]).join('')}`;
export const normalizeCoupon = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
export const couponMatches = (entered, code) => !!code && normalizeCoupon(entered) === normalizeCoupon(code);
const running = (startedAt, now = Date.now()) => !!startedAt && offerEndsAt(startedAt) > now;

const fetchOfferRow = async (code) => {
  const { url, key } = sbConfig();
  const r = await fetch(`${url}/rest/v1/members?code=eq.${encodeURIComponent(code)}&select=offer_started_at,offer_coupon_at,offer_coupon_code&limit=1`, { headers: sbHeaders(key) });
  if (!r.ok) return null; // kolom belum dibuat → penawaran nonaktif
  return (await r.json())?.[0] || null;
};

const isFreeMember = (member) => !!member?.code && member.status === 'active' && member.tier === 'free';

/* Keadaan penawaran dari satu baris members: { offer: { price, endsAt, code? } | null, couponEligible }.
   code ada kalau penawarannya dari kupon: harga baru berlaku setelah kode itu dimasukkan. */
export const offerFromRow = (row, now = Date.now()) => {
  if (!row) return { offer: null, couponEligible: false };
  const coupon = running(row.offer_coupon_at, now);
  const start = coupon ? row.offer_coupon_at : running(row.offer_started_at, now) ? row.offer_started_at : null;
  const offer = start ? {
    price: WELCOME_OFFER.price, endsAt: new Date(offerEndsAt(start)).toISOString(),
    ...(coupon && row.offer_coupon_code ? { code: row.offer_coupon_code } : {}),
  } : null;
  return { offer, couponEligible: !row.offer_coupon_at && !offer };
};

/* Harga khusus yang berlaku untuk tagihan ini ({ price, endsAt }) atau null. Penawaran dari kupon hanya berlaku kalau
   kode kupon akun ini ikut dikirim. Tidak pernah melempar error. */
export async function getWelcomeOffer(member, { coupon } = {}) {
  const { offer } = await getOfferState(member);
  if (!offer) return null;
  if (offer.code && !couponMatches(coupon, offer.code)) return null;
  return { price: offer.price, endsAt: offer.endsAt };
}

export async function getOfferState(member) {
  try {
    if (!isFreeMember(member)) return { offer: null, couponEligible: false };
    return offerFromRow(await fetchOfferRow(member.code));
  } catch {
    return { offer: null, couponEligible: false };
  }
}

/* ── Pemeriksaan screenshot ── */

export const COUPON_PROMPT = `Kamu memeriksa screenshot dari Instagram (aplikasi atau web). Balas HANYA JSON:
{"instagram_profile": true/false, "username": "...", "following": true/false, "reason": "..."}

- instagram_profile: true hanya jika gambar menampilkan halaman PROFIL satu akun Instagram (nama akun di atas, jumlah postingan/pengikut, tombol di bawah bio).
- username: nama akun profil yang dibuka, persis seperti tertulis (tanpa @). Kosong kalau tidak terbaca.
- following: true hanya jika tombol utama di profil itu menunjukkan yang membuka SUDAH mengikuti akun tersebut, mis. "Following", "Mengikuti", "متابَع", "Abonné(e)". Tombol "Follow", "Ikuti", "Follow Back", "Ikuti Balik", "Requested", "Diminta", atau "Edit profile"/"Edit profil" (profil sendiri) → false. Kalau ragu atau gambar tampak diedit, false.
- reason: satu kalimat pendek bahasa Indonesia tentang yang kamu lihat.`;

export const couponVerdict = (r, account = WELCOME_OFFER.instagram) => {
  const username = String(r?.username || '').trim().replace(/^@/, '').toLowerCase();
  if (r?.instagram_profile !== true) return 'not_profile';
  if (username !== account) return 'wrong_account';
  if (r?.following !== true) return 'not_following';
  return 'ok';
};

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BASE64 = 3_500_000;

/* Klaim kupon. deps.verify(image, mime) → JSON hasil AI (disuntik dari login.js; dites tanpa jaringan).
   Kembalian { ok: true, offer } atau { ok: false, status, message? }. */
export async function claimInstagramCoupon(member, { image, mime }, deps) {
  if (!isFreeMember(member)) return { ok: false, status: 'not_eligible' };
  const base64 = String(image || '').replace(/^data:[^,]*,/, '');
  if (!IMAGE_TYPES.includes(mime) || !base64 || base64.length > MAX_BASE64) return { ok: false, status: 'bad_image' };
  const row = await fetchOfferRow(member.code);
  if (!row) return { ok: false, status: 'unavailable' };
  const state = offerFromRow(row);
  if (state.offer) return { ok: true, offer: state.offer };
  if (!state.couponEligible) return { ok: false, status: 'coupon_used' };
  const hash = crypto.createHash('sha256').update(base64).digest('hex');
  const { url, key } = sbConfig();
  const taken = await fetch(`${url}/rest/v1/members?offer_coupon_hash=eq.${hash}&select=code&limit=1`, { headers: sbHeaders(key) });
  if (taken.ok && (await taken.json())?.length) return { ok: false, status: 'screenshot_used' };
  if (!(await consumeQuota(member.code, 'ig_coupon', WELCOME_OFFER.attemptsPerDay))) return { ok: false, status: 'rate_limited' };

  const verdict = couponVerdict(await deps.verify(base64, mime));
  if (verdict !== 'ok') return { ok: false, status: verdict };

  const now = new Date().toISOString();
  // Hanya mengisi kalau belum pernah dapat kupon, supaya dua klaim bersamaan tidak saling menimpa.
  const r = await fetch(`${url}/rest/v1/members?code=eq.${encodeURIComponent(member.code)}&offer_coupon_at=is.null&select=offer_coupon_at,offer_coupon_code`, {
    method: 'PATCH',
    headers: sbHeaders(key, { Prefer: 'return=representation' }),
    body: JSON.stringify({ offer_coupon_at: now, offer_coupon_hash: hash, offer_coupon_code: newCouponCode() }),
  });
  if (r.status === 409) return { ok: false, status: 'screenshot_used' };
  if (!r.ok) return { ok: false, status: 'error' };
  const saved = (await r.json())?.[0];
  if (!saved) return { ok: false, status: 'coupon_used' };
  return { ok: true, offer: { price: WELCOME_OFFER.price, endsAt: new Date(offerEndsAt(saved.offer_coupon_at)).toISOString(), code: saved.offer_coupon_code } };
}
