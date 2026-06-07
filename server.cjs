const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;
const ROOT = path.join(__dirname, 'dist');

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.jsx': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.md': 'text/markdown',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

const readBody = (req) => new Promise((resolve) => {
  let d = '';
  req.on('data', c => d += c);
  req.on('end', () => resolve(d));
});

const SECURITY_HEADERS = {
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://*.supabase.co https://api.fonnte.com",
    "frame-ancestors 'self'",
  ].join('; '),
};

// Aset statis (gambar, font) boleh di-cache lama
// File kode (html, jsx, js) JANGAN di-cache — supaya update langsung berlaku
const ASSET_EXTS = new Set(['.png','.jpg','.jpeg','.svg','.ico','.webp','.woff','.woff2','.ttf']);
const getCacheHeader = (ext) => {
  if (ASSET_EXTS.has(ext)) return 'public, max-age=31536000, immutable';
  if (ext === '.css')       return 'public, max-age=3600';
  return 'no-cache, no-store, must-revalidate'; // html, jsx, js — selalu fresh
};

const addSecurityHeaders = (res) => {
  Object.entries(SECURITY_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
};

const json = (res, status, body) => {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(JSON.stringify(body));
};

const parseQuery = (url) => {
  const idx = url.indexOf('?');
  if (idx === -1) return {};
  return Object.fromEntries(new URLSearchParams(url.slice(idx + 1)));
};

const callApiHandler = async (handlerPath, req, res, rawBody) => {
  const absPath = path.resolve(__dirname, handlerPath);
  const mod = await import(`file://${absPath}`);
  const handler = mod.default || mod;
  let parsedBody = {};
  try { parsedBody = JSON.parse(rawBody || '{}'); } catch {}
  const wrappedReq = Object.assign(Object.create(req), {
    method: req.method, headers: req.headers, _rawBody: rawBody,
    body: parsedBody,
    query: parseQuery(req.url),
    on(event, cb) {
      if (event === 'data') { cb(rawBody); return this; }
      if (event === 'end')  { cb();        return this; }
      return req.on(event, cb);
    },
    status() { return this; },
  });
  const wrappedRes = {
    _status: 200, _headers: {},
    status(code) { this._status = code; return this; },
    setHeader(k, v) { this._headers[k] = v; return this; },
    json(body) { json(res, this._status, body); },
    end(body) { res.writeHead(this._status, this._headers); res.end(body || ''); },
  };
  await handler(wrappedReq, wrappedRes);
};

http.createServer(async (req, res) => {
  let urlPath = req.url.split('?')[0];

  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // ── /api/config ──────────────────────────────────────────────────────
  if (urlPath === '/api/config' && req.method === 'GET') {
    json(res, 200, {
      supabaseUrl:     process.env.SUPABASE_URL      || '',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
    });
    return;
  }

  // ── /api/health ───────────────────────────────────────────────────────
  if (urlPath === '/api/health' && req.method === 'GET') {
    json(res, 200, { ok: true, supabase: true });
    return;
  }

  // ── /api/login ────────────────────────────────────────────────────────
  if (urlPath === '/api/login') {
    try {
      const rawBody = await readBody(req);
      await callApiHandler('./api/login.js', req, res, rawBody);
    } catch (err) {
      console.error('[login] Error:', err.message);
      json(res, 500, { ok: false, error: err.message });
    }
    return;
  }

  // ── /api/admin-auth ───────────────────────────────────────────────────
  if (urlPath === '/api/admin-auth') {
    try {
      const rawBody = await readBody(req);
      await callApiHandler('./api/admin-auth.js', req, res, rawBody);
    } catch (err) {
      console.error('[admin-auth] Error:', err.message);
      json(res, 500, { ok: false, error: err.message });
    }
    return;
  }

  // ── /api/admin-members ────────────────────────────────────────────────
  if (urlPath === '/api/admin-members') {
    try {
      const rawBody = await readBody(req);
      await callApiHandler('./api/admin-members.js', req, res, rawBody);
    } catch (err) {
      console.error('[admin-members] Error:', err.message);
      json(res, 500, { ok: false, error: err.message });
    }
    return;
  }

  // ── /api/send-wa ─────────────────────────────────────────────────────
  if (urlPath === '/api/send-wa') {
    try {
      const rawBody = await readBody(req);
      await callApiHandler('./api/send-wa.js', req, res, rawBody);
    } catch (err) {
      console.error('[send-wa] Error:', err.message);
      json(res, 500, { ok: false, error: err.message });
    }
    return;
  }

  // ── /api/bank-soal (submit, approve, update-jawaban, foto) ───────────
  if (urlPath === '/api/bank-soal') {
    try {
      const rawBody = await readBody(req);
      await callApiHandler('./api/bank-soal.js', req, res, rawBody);
    } catch (err) {
      console.error('[bank-soal] Error:', err.message);
      json(res, 500, { ok: false, error: err.message });
    }
    return;
  }

  // ── /api/parse (soal OCR, talkhisan) ──────────────────────────────────
  if (urlPath === '/api/parse') {
    try {
      const rawBody = await readBody(req);
      await callApiHandler('./api/parse.js', req, res, rawBody);
    } catch (err) {
      console.error('[parse] Error:', err.message);
      json(res, 500, { ok: false, error: err.message });
    }
    return;
  }

  // ── /api/admin-bank-soal ──────────────────────────────────────────────
  if (urlPath === '/api/admin-bank-soal') {
    try {
      const rawBody = await readBody(req);
      await callApiHandler('./api/admin-bank-soal.js', req, res, rawBody);
    } catch (err) {
      console.error('[admin-bank-soal] Error:', err.message);
      json(res, 500, { ok: false, error: err.message });
    }
    return;
  }

  // ── Static files ──────────────────────────────────────────────────────
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.join(ROOT, urlPath);

  // Path traversal guard — pastikan resolved path masih di dalam ROOT/dist
  if (!filePath.startsWith(ROOT + path.sep) && filePath !== ROOT) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      const ext = path.extname(urlPath);
      if (!ext) {
        fs.readFile(path.join(ROOT, 'index.html'), (err2, html) => {
          if (err2) { res.writeHead(500); res.end('Server error'); return; }
          addSecurityHeaders(res);
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(html);
        });
        return;
      }
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';
    addSecurityHeaders(res);
    res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': getCacheHeader(ext) });
    res.end(data);
  });
}).listen(PORT, '0.0.0.0', () => {
  console.log(`Talqee server running on port ${PORT}`);
});
