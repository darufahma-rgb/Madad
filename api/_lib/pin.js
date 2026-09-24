import crypto from 'crypto';

// Tanpa karakter yang mirip (I/1, O/0) supaya gampang diketik dari WA.
const PIN_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const PIN_TTL_DAYS = 14;

const segment = (n) => Array.from(crypto.randomBytes(n), b => PIN_CHARS[b % PIN_CHARS.length]).join('');

export const newActivationPin = () => `${segment(4)}-${segment(4)}`;

// "abcd efgh" / "ABCDEFGH" / "abcd-efgh" → "ABCD-EFGH"; selain itu null.
export const normalizePin = (raw) => {
  const clean = (typeof raw === 'string' ? raw : '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  return clean.length === 8 ? `${clean.slice(0, 4)}-${clean.slice(4)}` : null;
};
