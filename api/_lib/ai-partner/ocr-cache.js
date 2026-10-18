// Cache OCR bersama per muqarrar (tabel ocr_page_cache, lihat migrations/ocr_page_cache.sql).
// Kunci: SHA-256 file PDF (dihitung di browser) + nomor halaman. Halaman yang sudah terbaca tidak memakai jatah baca.
import { sbConfig, sbHeaders } from '../member.js';

const HASH_RE = /^[0-9a-f]{64}$/;
const MAX_LOOKUP = 400;

export const ocrCacheKey = (body) => {
  const page = Number(body?.page);
  return HASH_RE.test(String(body?.file_hash || '')) && Number.isInteger(page) && page > 0 && page < 10000
    ? { hash: body.file_hash, page } : null;
};

/* Kemiripan dua hasil OCR satu halaman: pasangan huruf (tanpa spasi & harakat) yang sama ≥ 80%.
   Hasil OCR yang jujur dari gambar yang sama hampir identik; gambar halaman lain jauh di bawah itu. */
const bigrams = (t) => {
  const s = String(t).replace(/[\sً-ْٰ]+/g, '').slice(0, 8000);
  const set = new Set();
  for (let i = 0; i < s.length - 1; i++) set.add(s.slice(i, i + 2));
  return set;
};
const similar = (a, b) => {
  const A = bigrams(a), B = bigrams(b);
  if (A.size < 20 || B.size < 20) return false;
  let both = 0;
  for (const x of A) if (B.has(x)) both++;
  return both / (A.size + B.size - both) >= 0.8;
};

// Halaman yang bisa dipakai member ini: hasil terverifikasi, atau hasil bacaannya sendiri. → { [page]: teks }
export const lookupOcrPages = async (code, hash, pages) => {
  const list = [...new Set((Array.isArray(pages) ? pages : []).map(Number).filter(n => Number.isInteger(n) && n > 0 && n < 10000))].slice(0, MAX_LOOKUP);
  if (!HASH_RE.test(String(hash || '')) || !list.length) return {};
  try {
    const { url, key } = sbConfig();
    const r = await fetch(
      `${url}/rest/v1/ocr_page_cache?file_hash=eq.${hash}&page=in.(${list.join(',')})` +
      `&or=(verified.eq.true,member_code.eq.${encodeURIComponent(code)})&select=page,teks,verified&order=verified.desc,created_at.asc`,
      { headers: sbHeaders(key) }
    );
    if (!r.ok) return {};
    const out = {};
    for (const row of (await r.json()) || []) if (!(row.page in out)) out[row.page] = row.teks;
    return out;
  } catch {
    return {};
  }
};

// Simpan hasil OCR; kalau sama dengan bacaan member lain untuk halaman itu, keduanya ditandai terverifikasi.
export const storeOcrPage = async (code, { hash, page }, teks) => {
  if (!String(teks || '').trim()) return;
  try {
    const { url, key } = sbConfig();
    const r = await fetch(
      `${url}/rest/v1/ocr_page_cache?file_hash=eq.${hash}&page=eq.${page}&member_code=neq.${encodeURIComponent(code)}&select=member_code,teks,verified&limit=5`,
      { headers: sbHeaders(key) }
    );
    const others = r.ok ? (await r.json()) || [] : [];
    const match = others.filter(o => similar(o.teks, teks));
    const verified = match.length > 0;
    await fetch(`${url}/rest/v1/ocr_page_cache?on_conflict=file_hash,page,member_code`, {
      method: 'POST',
      headers: sbHeaders(key, { Prefer: 'resolution=merge-duplicates,return=minimal' }),
      body: JSON.stringify({ file_hash: hash, page, member_code: code, teks, verified }),
    });
    const toVerify = match.filter(o => !o.verified).map(o => encodeURIComponent(o.member_code));
    if (toVerify.length) {
      await fetch(`${url}/rest/v1/ocr_page_cache?file_hash=eq.${hash}&page=eq.${page}&member_code=in.(${toVerify.join(',')})`, {
        method: 'PATCH',
        headers: sbHeaders(key, { Prefer: 'return=minimal' }),
        body: JSON.stringify({ verified: true }),
      });
    }
  } catch (err) {
    console.warn('[ocr-cache] gagal menyimpan', err.message);
  }
};

// Aksi 'ocr-cache': browser menanyakan halaman mana yang sudah terbaca, sebelum memakai jatah baca.
export const handleOcrCache = async (ctx, body, res) => {
  const texts = await lookupOcrPages(ctx.code, body?.file_hash, body?.pages);
  return res.status(200).json({ ok: true, texts });
};
