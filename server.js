const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;
const ROOT = __dirname;

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

const json = (res, status, body) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
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
    json(res, 200, { ok: true });
    return;
  }

  // ── /api/webhook/trakteer ─────────────────────────────────────────────
  if (urlPath === '/api/webhook/trakteer' && req.method === 'POST') {
    try {
      const handler = require('./api/webhook/trakteer.js');
      const rawBody = await readBody(req);
      // Wrap req so handler can call req.on('data') — provide pre-buffered body
      const wrappedReq = Object.assign(Object.create(req), {
        method: req.method,
        headers: req.headers,
        _rawBody: rawBody,
        on(event, cb) {
          if (event === 'data') { cb(rawBody); return this; }
          if (event === 'end')  { cb();        return this; }
          return req.on(event, cb);
        },
      });
      const wrappedRes = {
        _status: 200,
        _headers: {},
        status(code) { this._status = code; return this; },
        setHeader(k, v) { this._headers[k] = v; return this; },
        json(body) { json(res, this._status, body); },
        end(body) { res.writeHead(this._status, this._headers); res.end(body || ''); },
      };
      await handler(wrappedReq, wrappedRes);
    } catch (err) {
      console.error('[Webhook] Error:', err.message);
      json(res, 500, { ok: false, error: err.message });
    }
    return;
  }

  // ── Static files ──────────────────────────────────────────────────────
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.join(ROOT, urlPath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      const ext = path.extname(urlPath);
      if (!ext) {
        fs.readFile(path.join(ROOT, 'index.html'), (err2, html) => {
          if (err2) { res.writeHead(500); res.end('Server error'); return; }
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
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}).listen(PORT, '0.0.0.0', () => {
  console.log(`Talqee server running on port ${PORT}`);
});
