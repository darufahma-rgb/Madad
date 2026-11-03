/* Event penjualan yang diatur dari Admin → Settings (tabel app_settings), tanpa deploy:
   - imtihanEvent:   harga Paket Imtihan selama rentang waktu tertentu.
   - rombonganEvent: Paket Rombongan — satu pembeli membayar Paket Imtihan untuk beberapa orang sekaligus
                     (pembeli + kode untuk teman), dengan harga per ukuran rombongan.
   Disimpan sebagai JSON string. Server yang menentukan harga tagihan; /api/config hanya menampilkan event yang
   sedang berlangsung. */
import { readSettings } from './settings.js';

export const NORMAL_IMTIHAN_PRICE = 199000;   // samakan dengan IMTIHAN_PRICE_IDR di payments.js
const MIN_SEAT_PRICE = 70000;                 // di atas harga Library (63.000) supaya bagian AI tidak nol/negatif
export const ROMBONGAN_SEATS = [2, 3, 4, 5, 6, 8, 10];
const CACHE_MS = 30 * 1000;

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const asInt = (v) => { const n = Number(String(v ?? '').replace(/[^\d]/g, '')); return Number.isInteger(n) ? n : NaN; };
const parseJson = (raw) => {
  if (raw && typeof raw === 'object') return raw;
  try { return JSON.parse(raw || 'null'); } catch { return null; }
};

const parseWindow = (obj) => {
  const startsAt = Date.parse(obj?.startsAt), endsAt = Date.parse(obj?.endsAt);
  if (!Number.isFinite(startsAt) || !Number.isFinite(endsAt)) return { error: 'Isi tanggal mulai dan selesai event.' };
  if (endsAt <= startsAt) return { error: 'Tanggal selesai event harus setelah tanggal mulai.' };
  if (endsAt - startsAt > 120 * 86400000) return { error: 'Event paling lama 120 hari.' };
  return { startsAt: new Date(startsAt).toISOString(), endsAt: new Date(endsAt).toISOString() };
};

/* Validasi + rapikan. Kembalian { value } (null = event dimatikan) atau { error }. */
export const validateImtihanEvent = (raw) => {
  const obj = parseJson(raw);
  if (!obj || obj.enabled === false) return { value: null };
  const name = str(obj.name, 60);
  if (name.length < 3) return { error: 'Nama event Paket Imtihan minimal 3 huruf.' };
  const price = asInt(obj.price);
  if (!(price >= MIN_SEAT_PRICE && price < NORMAL_IMTIHAN_PRICE)) {
    return { error: `Harga event Paket Imtihan harus antara ${MIN_SEAT_PRICE.toLocaleString('id-ID')} dan ${(NORMAL_IMTIHAN_PRICE - 1000).toLocaleString('id-ID')}.` };
  }
  const w = parseWindow(obj);
  if (w.error) return w;
  return { value: { name, price, ...w } };
};

export const validateRombonganEvent = (raw) => {
  const obj = parseJson(raw);
  if (!obj || obj.enabled === false) return { value: null };
  const name = str(obj.name, 60);
  if (name.length < 3) return { error: 'Nama event Paket Rombongan minimal 3 huruf.' };
  const sizes = [];
  for (const s of Array.isArray(obj.sizes) ? obj.sizes : []) {
    const seats = asInt(s?.seats), price = asInt(s?.price);
    if (!ROMBONGAN_SEATS.includes(seats)) return { error: `Jumlah orang rombongan harus salah satu dari ${ROMBONGAN_SEATS.join(', ')}.` };
    if (!(price >= seats * MIN_SEAT_PRICE && price < seats * NORMAL_IMTIHAN_PRICE)) {
      return { error: `Harga rombongan ${seats} orang harus antara ${(seats * MIN_SEAT_PRICE).toLocaleString('id-ID')} dan ${(seats * NORMAL_IMTIHAN_PRICE - 1000).toLocaleString('id-ID')}.` };
    }
    if (sizes.some(x => x.seats === seats)) return { error: `Ukuran rombongan ${seats} orang ditulis dua kali.` };
    sizes.push({ seats, price });
  }
  if (!sizes.length) return { error: 'Isi minimal satu ukuran rombongan (jumlah orang + harga total).' };
  if (sizes.length > 3) return { error: 'Paling banyak 3 ukuran rombongan.' };
  const w = parseWindow(obj);
  if (w.error) return w;
  return { value: { name, sizes: sizes.sort((a, b) => a.seats - b.seats), ...w } };
};

/* Tautan kerja sama (mis. kelas bersama kekeluargaan): harga khusus Paket Imtihan lewat #/gabung?plan=imtihan&kelas=<slug>.
   Tiap tagihan lunas dicatat ke slug-nya, dan kasPercent menjadi dasar hitungan bagian kas di laporan admin. */
const MAX_PARTNER_LINKS = 30;
export const validatePartnerLinks = (raw) => {
  const list = parseJson(raw);
  if (list == null || list === '') return { value: [] };
  if (!Array.isArray(list)) return { error: 'Format tautan kerja sama tidak valid.' };
  if (list.length > MAX_PARTNER_LINKS) return { error: `Tautan kerja sama paling banyak ${MAX_PARTNER_LINKS}.` };
  const value = [];
  for (const item of list) {
    const slug = str(item?.slug, 40).toLowerCase();
    if (!/^[a-z0-9][a-z0-9-]{2,39}$/.test(slug)) return { error: 'Kode tautan kerja sama minimal 3 huruf kecil/angka/strip (contoh: kelas-kmm).' };
    if (value.some(x => x.slug === slug)) return { error: `Kode tautan "${slug}" ditulis dua kali.` };
    const name = str(item?.name, 60);
    if (name.length < 3) return { error: `Nama kekeluargaan untuk "${slug}" minimal 3 huruf.` };
    const price = asInt(item?.price);
    if (!(price >= MIN_SEAT_PRICE && price < NORMAL_IMTIHAN_PRICE)) {
      return { error: `Harga tautan "${slug}" harus antara ${MIN_SEAT_PRICE.toLocaleString('id-ID')} dan ${(NORMAL_IMTIHAN_PRICE - 1000).toLocaleString('id-ID')}.` };
    }
    const kasPercent = item?.kasPercent === '' || item?.kasPercent == null ? 0 : asInt(item.kasPercent);
    if (!(kasPercent >= 0 && kasPercent <= 50)) return { error: `Bagian kas tautan "${slug}" harus 0 sampai 50 persen.` };
    const w = parseWindow(item);
    if (w.error) return { error: `Tautan "${slug}": ${w.error}` };
    // Akun trial peserta: opsional, hanya kalau jam kelasnya diisi.
    const classAt = Date.parse(item?.classStartsAt || '');
    if (item?.classStartsAt && !Number.isFinite(classAt)) return { error: `Jam kelas tautan "${slug}" tidak valid.` };
    const trialMax = item?.trialMax === '' || item?.trialMax == null ? CLASS_TRIAL_DEFAULT_MAX : asInt(item.trialMax);
    if (!(trialMax >= 0 && trialMax <= 500)) return { error: `Kuota trial tautan "${slug}" harus 0 sampai 500.` };
    value.push({ slug, name, price, kasPercent, ...w, ...(Number.isFinite(classAt) ? { classStartsAt: new Date(classAt).toISOString(), trialMax } : {}) });
  }
  return { value };
};

/* Akun trial peserta kelas: selama kelas berlangsung, peserta mengaktifkan AI Partner sendiri lewat tautan kelasnya.
   Masa aktif dihitung dari saat diaktifkan, satu kali per akun, dengan batas harian trial sebagai pengaman biaya. */
export const CLASS_TRIAL_PRODUCT = 'talqeeh-kelas-trial';
export const CLASS_TRIAL_HOURS = 4;
export const CLASS_TRIAL_DEFAULT_MAX = 50;
const CLASS_TRIAL_OPEN_BEFORE_MS = 30 * 60 * 1000;
const CLASS_TRIAL_OPEN_AFTER_MS = 2 * 3600 * 1000;
export const classTrialOpen = (link, now = Date.now()) => {
  const at = Date.parse(link?.classStartsAt || '');
  return Number.isFinite(at) && (link.trialMax ?? CLASS_TRIAL_DEFAULT_MAX) > 0
    && now >= at - CLASS_TRIAL_OPEN_BEFORE_MS && now <= at + CLASS_TRIAL_OPEN_AFTER_MS;
};

export const readPartnerLinks = async () =>
  validatePartnerLinks((await readSettings(['partnerLinks']).catch(() => ({}))).partnerLinks || null).value || [];

// Tautan yang sedang berlaku. null kalau kodenya tidak dikenal atau di luar rentang waktunya.
export const getLivePartnerLink = async (slug, now = Date.now()) => {
  const code = str(slug, 40).toLowerCase();
  if (!code) return null;
  const link = (await readPartnerLinks()).find(l => l.slug === code);
  return link && isLive(link, now) ? link : null;
};

/* Tautan masih bisa dipakai mendaftar selama belum berakhir, termasuk sebelum harga khususnya dibuka: poster disebar
   jauh sebelum hari kelas. Harga khusus sendiri tetap hanya di dalam rentang waktu (getLivePartnerLink). */
export const getOpenPartnerLink = async (slug, now = Date.now()) => {
  const code = str(slug, 40).toLowerCase();
  if (!code) return null;
  const link = (await readPartnerLinks()).find(l => l.slug === code);
  return link && now <= Date.parse(link.endsAt) ? link : null;
};

export const isLive = (ev, now = Date.now()) => !!ev && now >= Date.parse(ev.startsAt) && now <= Date.parse(ev.endsAt);

let cache = { at: 0, value: null };
// Semua event yang tersimpan (belum disaring waktu). Gagal membaca → tanpa event (harga normal).
export async function getSalesEvents() {
  if (cache.value && Date.now() - cache.at < CACHE_MS) return cache.value;
  const raw = await readSettings(['imtihanEvent', 'rombonganEvent']).catch(() => ({}));
  const value = {
    imtihan: validateImtihanEvent(raw.imtihanEvent).value || null,
    rombongan: validateRombonganEvent(raw.rombonganEvent).value || null,
  };
  cache = { at: Date.now(), value };
  return value;
}
export const clearSalesEventsCache = () => { cache = { at: 0, value: null }; };

// Event yang sedang berlangsung saja (untuk /api/config dan harga tagihan).
export async function getLiveEvents(now = Date.now()) {
  const ev = await getSalesEvents();
  return { imtihan: isLive(ev.imtihan, now) ? ev.imtihan : null, rombongan: isLive(ev.rombongan, now) ? ev.rombongan : null };
}
