/* Program Mitra Talqeeh (migrations/mitra.sql).
   Alur: member mengajukan diri di #/mitra → admin menyetujui → mitra membagikan #/gabung?ref=<kode>.
   Pengunjung yang login lewat tautan itu ditandai ke mitranya (tautan pertama yang menang, hanya akun yang belum
   membeli). Saat akun itu membeli Paket Imtihan, harganya dipotong `discount` dan komisi (`percent` dari harga yang
   dibayar) dicatat di tagihannya. Admin mentransfer komisi sendiri lalu menandainya lunas di panel admin. */
import { sbConfig, sbHeaders } from './member.js';
import { readSettings } from './settings.js';

export const AFFILIATE_DEFAULTS = { open: true, percent: 15, discount: 10000 };
const MAX_PERCENT = 40;
const MAX_DISCOUNT = 50000;

export const AFFILIATE_SLUG_RE = /^[a-z0-9][a-z0-9-]{2,23}$/;
// Kode yang bisa disangka resmi Talqeeh tidak boleh dipakai mitra.
const RESERVED_SLUGS = new Set(['admin', 'talqeeh', 'resmi', 'official', 'mitra', 'promo', 'gratis', 'test', 'imtihan']);
export const slugAllowed = (slug) => AFFILIATE_SLUG_RE.test(slug) && !RESERVED_SLUGS.has(slug) && !/--/.test(slug) && !slug.endsWith('-');

// "Ahmad Fauzi" → "ahmad-fauzi" (dipotong 24 huruf). Bisa kosong kalau nama tidak berhuruf latin.
export const slugFromName = (name) => String(name || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 24).replace(/-+$/, '');

const asInt = (v) => (v === '' || v == null ? NaN : Number(v));

// Pengaturan program dari Admin → Mitra. Kosong/rusak → bawaan.
export const validateAffiliateProgram = (raw) => {
  let obj = raw;
  if (typeof raw === 'string') {
    if (!raw.trim()) return { value: { ...AFFILIATE_DEFAULTS } };
    try { obj = JSON.parse(raw); } catch { return { error: 'Format pengaturan mitra tidak valid.' }; }
  }
  if (!obj || typeof obj !== 'object') return { value: { ...AFFILIATE_DEFAULTS } };
  const percent = asInt(obj.percent ?? AFFILIATE_DEFAULTS.percent);
  if (!(Number.isInteger(percent) && percent >= 1 && percent <= MAX_PERCENT)) return { error: `Komisi mitra harus 1 sampai ${MAX_PERCENT} persen.` };
  const discount = asInt(obj.discount ?? 0);
  if (!(Number.isInteger(discount) && discount >= 0 && discount <= MAX_DISCOUNT)) {
    return { error: `Potongan pembeli harus 0 sampai ${MAX_DISCOUNT.toLocaleString('id-ID')} rupiah.` };
  }
  return { value: { open: obj.open !== false, percent, discount: Math.round(discount / 1000) * 1000 } };
};

export const readAffiliateProgram = async () =>
  validateAffiliateProgram((await readSettings(['affiliateProgram']).catch(() => ({}))).affiliateProgram || '').value || { ...AFFILIATE_DEFAULTS };

export const commissionPercent = (affiliate, program) => affiliate?.commission_percent || program.percent;
export const commissionFor = (amount, percent) => Math.max(0, Math.round((Number(amount) || 0) * (Number(percent) || 0) / 100));
// Harga Paket Imtihan untuk pembeli lewat tautan mitra (base = harga normal atau harga event yang berlaku).
export const affiliatePrice = (base, discount) => Math.max(0, base - (discount || 0));

// Akun yang masih calon pembeli: hanya mereka yang boleh ditandai ke mitra.
export const canBeReferred = (member) => !!member && member.status === 'active' && (member.tier === 'free' || member.member_type === 'trial');

// Tanda di akun yang tidak berbentuk normal dianggap tidak ada.
export const cleanSlug = (v) => String(v || '').trim().toLowerCase().slice(0, 24);

/* ── Supabase ── */

const sb = () => {
  const { url, key } = sbConfig();
  return { url, h: (extra) => sbHeaders(key, extra) };
};

export const AFFILIATE_FIELDS = 'member_code,slug,name,whatsapp,payout,channel,status,commission_percent,admin_note,created_at,approved_at';

export async function getAffiliateByMember(code) {
  const { url, h } = sb();
  const r = await fetch(`${url}/rest/v1/affiliates?member_code=eq.${encodeURIComponent(code)}&select=${AFFILIATE_FIELDS}&limit=1`, { headers: h() });
  if (!r.ok) throw new Error(r.status === 404 || r.status === 400 ? 'migration' : `affiliates ${r.status}`);
  return (await r.json())?.[0] || null;
}

// Mitra aktif berdasarkan kode tautan. null kalau tidak dikenal, belum disetujui, atau tabel belum ada.
export async function getApprovedAffiliate(slug) {
  const s = cleanSlug(slug);
  if (!AFFILIATE_SLUG_RE.test(s)) return null;
  const { url, h } = sb();
  const r = await fetch(`${url}/rest/v1/affiliates?slug=eq.${encodeURIComponent(s)}&status=eq.approved&select=${AFFILIATE_FIELDS}&limit=1`, { headers: h() });
  return r.ok ? (await r.json())?.[0] || null : null;
}

// Kolom affiliate_slug belum ada (migrasi belum dijalankan) → null, alur lain tetap berjalan.
export async function readMemberAffiliateSlug(code) {
  const { url, h } = sb();
  const r = await fetch(`${url}/rest/v1/members?code=eq.${encodeURIComponent(code)}&select=affiliate_slug&limit=1`, { headers: h() });
  return r.ok ? (await r.json())?.[0]?.affiliate_slug || null : null;
}

/* Mitra yang berlaku untuk akun ini, sekaligus menandai akun ke `slug` kalau belum bertanda.
   Akun yang sudah membeli, atau mitra yang mengajak dirinya sendiri, tidak ditandai. */
export async function resolveMemberAffiliate(member, slug) {
  if (!member) return null;
  const tagged = await readMemberAffiliateSlug(member.code);
  if (tagged) return getApprovedAffiliate(tagged);
  if (!canBeReferred(member)) return null;
  const affiliate = slug ? await getApprovedAffiliate(slug) : null;
  if (!affiliate || affiliate.member_code === member.code) return null;
  const { url, h } = sb();
  const r = await fetch(`${url}/rest/v1/members?code=eq.${encodeURIComponent(member.code)}&affiliate_slug=is.null`, {
    method: 'PATCH',
    headers: h({ Prefer: 'return=minimal' }),
    body: JSON.stringify({ affiliate_slug: affiliate.slug, affiliate_tagged_at: new Date().toISOString() }),
  });
  return r.ok ? affiliate : null;
}

export const isSlugTaken = async (slug, exceptCode) => {
  const { url, h } = sb();
  const r = await fetch(`${url}/rest/v1/affiliates?slug=eq.${encodeURIComponent(slug)}&select=member_code&limit=1`, { headers: h() });
  const row = r.ok ? (await r.json())?.[0] : null;
  return !!row && row.member_code !== exceptCode;
};

/* Validasi formulir pendaftaran mitra. Mengembalikan { value } atau { error }. */
export const validateApplication = (body) => {
  const name = String(body?.name || '').replace(/\s+/g, ' ').trim().slice(0, 60);
  if (name.length < 3) return { error: 'Nama minimal 3 huruf.' };
  const whatsapp = String(body?.whatsapp || '').replace(/\D/g, '').replace(/^0/, '62');
  if (!/^\d{9,15}$/.test(whatsapp)) return { error: 'Nomor WhatsApp tidak valid (contoh: 6281234567890 atau 201xxxxxxxxx).' };
  const payout = String(body?.payout || '').replace(/\s+/g, ' ').trim().slice(0, 120);
  if (payout.length < 8) return { error: 'Isi rekening atau e-wallet tujuan komisi (contoh: DANA 0812xxxx a.n. Ahmad).' };
  const channel = String(body?.channel || '').replace(/\s+/g, ' ').trim().slice(0, 300);
  if (channel.length < 10) return { error: 'Ceritakan singkat bagaimana kamu akan mengajak teman (minimal 10 huruf).' };
  const slug = cleanSlug(body?.slug) || slugFromName(name);
  if (!slugAllowed(slug)) return { error: 'Kode tautan 3–24 huruf kecil, angka, atau strip (contoh: ahmad-kmm).' };
  return { value: { name, whatsapp, payout, channel, slug } };
};

/* Ringkasan untuk dasbor mitra: akun yang diajak, penjualan, komisi. Pembeli tidak disebut namanya. */
export async function affiliateStats(slug) {
  const { url, h } = sb();
  const [members, sales] = await Promise.all([
    fetch(`${url}/rest/v1/members?affiliate_slug=eq.${encodeURIComponent(slug)}&select=code&limit=5000`, { headers: h() })
      .then(r => (r.ok ? r.json() : [])).catch(() => []),
    fetch(`${url}/rest/v1/payment_checkouts?affiliate_slug=eq.${encodeURIComponent(slug)}&status=eq.paid&select=amount,affiliate_commission,affiliate_paid_at,paid_at&order=paid_at.desc&limit=500`, { headers: h() })
      .then(r => (r.ok ? r.json() : [])).catch(() => []),
  ]);
  return summarizeSales(Array.isArray(members) ? members.length : 0, Array.isArray(sales) ? sales : []);
}

export const summarizeSales = (signups, sales) => {
  let earned = 0, paid = 0;
  for (const s of sales) {
    const c = Number(s.affiliate_commission) || 0;
    earned += c;
    if (s.affiliate_paid_at) paid += c;
  }
  return {
    signups, sold: sales.length, earned, paid, unpaid: earned - paid,
    sales: sales.slice(0, 50).map(s => ({ at: s.paid_at, amount: Number(s.amount) || 0, commission: Number(s.affiliate_commission) || 0, paidOut: !!s.affiliate_paid_at })),
  };
};
