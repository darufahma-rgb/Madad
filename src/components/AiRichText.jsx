import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { useMemo } from 'react';
import { sourceIndex, quoteScore, verdictOf } from './sourceMatch.js';
import AiChart, { parseChart, chartToMarkdown } from './AiChart.jsx';
/* Talqeeh — tampilan hasil AI yang enak dibaca:
   - teks Arab otomatis pakai huruf Naskh, lebih besar, rata kanan (blok) atau terisolasi (di tengah kalimat)
   - baris "↳ ..." tampil sebagai terjemah di bawah teks Arab
   - ✅ ⚠️ ❌ di awal paragraf jadi label penilaian berwarna
   - tabel dibungkus agar bisa digeser, dan di HP berubah jadi kartu per baris */

const ARABIC_CHAR = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;
const ARABIC_RUN = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿](?:[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿\s،؛؟«»٠-٩]*[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿])?/g;
const BLOCKS = 'p, li, td, th, h1, h2, h3, h4, blockquote';

const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Baris terjemah "↳ ..." → span khusus. Kalau tepat setelah kutipan, terjemahnya ikut masuk kotak kutipan.
const preprocess = (md) => {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(\s*)(?:[-*]\s+)?↳\s?(.*)$/);
    if (m) {
      const prev = out[out.length - 1] || '';
      const span = `<span class="ai-tr">${escapeHtml(m[2])}</span>`;
      out.push(/^\s*>/.test(prev) ? `> ${span}` : `${m[1]}${span}`);
    } else {
      out.push(lines[i]);
    }
  }
  return out.join('\n');
};

const arabicRatio = (text) => {
  // Harakat tidak dihitung sebagai huruf, supaya "الطَّهَارَةُ — Thaharah" tidak dianggap blok Arab.
  const letters = text.replace(/[ً-ٰٟـ]/g, '').replace(/[\s\d.,:;!?()\[\]"'«»،؛؟\-–—→↳•*]/g, '');
  if (!letters.length) return 0;
  return (letters.match(new RegExp(ARABIC_CHAR.source, 'g')) || []).length / letters.length;
};

const textWithoutTranslation = (el) => {
  const clone = el.cloneNode(true);
  clone.querySelectorAll('.ai-tr, ul, ol').forEach(n => n.remove());
  return clone.textContent || '';
};

// Bungkus potongan Arab di tengah kalimat Indonesia supaya arah tulisan & hurufnya benar.
const wrapInlineArabic = (root, doc) => {
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const targets = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!ARABIC_CHAR.test(node.nodeValue)) continue;
    if (node.parentElement?.closest('.ai-ar, .ai-ar-inline, code, pre')) continue;
    targets.push(node);
  }
  targets.forEach(node => {
    const text = node.nodeValue;
    const frag = doc.createDocumentFragment();
    let last = 0;
    text.replace(ARABIC_RUN, (match, offset) => {
      if (offset > last) frag.appendChild(doc.createTextNode(text.slice(last, offset)));
      const span = doc.createElement('span');
      span.className = 'ai-ar-inline';
      span.setAttribute('dir', 'rtl');
      span.textContent = match;
      frag.appendChild(span);
      last = offset + match.length;
      return match;
    });
    if (last < text.length) frag.appendChild(doc.createTextNode(text.slice(last)));
    node.parentNode.replaceChild(frag, node);
  });
};

const VERDICTS = [
  [/^\s*✅/, 'ai-verdict ai-verdict-ok'],
  [/^\s*⚠️?/, 'ai-verdict ai-verdict-warn'],
  [/^\s*❌/, 'ai-verdict ai-verdict-bad'],
];

export const renderAiHtml = (content, index = null) => {
  if (!content) return '';
  let html;
  try {
    html = DOMPurify.sanitize(marked.parse(preprocess(content), { gfm: true, breaks: true }));
  } catch {
    return escapeHtml(content);
  }
  const doc = new DOMParser().parseFromString(`<div id="ai-root">${html}</div>`, 'text/html');
  const root = doc.getElementById('ai-root');

  // Blok yang dominan Arab → rata kanan, huruf Naskh.
  root.querySelectorAll(BLOCKS).forEach(el => {
    if (el.querySelector(BLOCKS.split(', ').map(t => `:scope > ${t}`).join(', '))) return;
    if (arabicRatio(textWithoutTranslation(el)) >= 0.75) {
      el.classList.add('ai-ar');
      el.setAttribute('dir', 'rtl');
      el.querySelectorAll(':scope > .ai-tr').forEach(t => t.setAttribute('dir', 'ltr'));
    }
  });
  root.querySelectorAll('.ai-tr').forEach(t => {
    t.setAttribute('dir', 'ltr');
    // Terjemah tampil sebagai blok sendiri; <br> sebelumnya hanya menambah baris kosong.
    let prev = t.previousSibling;
    while (prev && prev.nodeType === 3 && !prev.nodeValue.trim()) prev = prev.previousSibling;
    if (prev && prev.nodeName === 'BR') prev.remove();
  });

  wrapInlineArabic(root, doc);

  // Label penilaian (✅ tepat / ⚠️ kurang / ❌ keliru) di awal paragraf.
  root.querySelectorAll('p, li').forEach(el => {
    const hit = VERDICTS.find(([re]) => re.test(el.textContent || ''));
    if (hit) el.className = `${el.className} ${hit[1]}`.trim();
  });

  // Tabel: bisa digeser, dan tiap sel diberi label kolom untuk tampilan kartu di HP.
  root.querySelectorAll('table').forEach(table => {
    const heads = [...table.querySelectorAll('thead th')].map(th => (th.textContent || '').trim());
    table.querySelectorAll('tbody tr').forEach(tr => {
      [...tr.children].forEach((td, i) => { if (heads[i]) td.setAttribute('data-label', heads[i]); });
    });
    const wrap = doc.createElement('div');
    wrap.className = 'ai-table-wrap';
    table.parentNode.insertBefore(wrap, table);
    wrap.appendChild(table);
  });

  // Tautan dari AI dibuka di tab baru.
  root.querySelectorAll('a[href]').forEach(a => { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener noreferrer'); });

  if (index) markCitations(root, doc, index);

  return root.innerHTML;
};

/* ── Verifikasi kutipan terhadap materi ── */
const CITE_LABELS = {
  ok:   '✓ Ada di materimu',
  near: '≈ Mirip dengan materimu',
  miss: '⚠ Tidak ditemukan di materimu',
};
const CITE_TITLES = {
  ok:   'Kutipan ini cocok dengan materimu — ketuk untuk melihat konteksnya.',
  near: 'Sebagian kutipan cocok; mungkin disalin tidak persis. Ketuk untuk membandingkan.',
  miss: 'AI mungkin mengutip dari luar materi atau keliru menyalin. Cek ke kitab/mushaf sebelum dipakai.',
};

const markCitations = (root, doc, index) => {
  const targets = [];
  root.querySelectorAll('blockquote').forEach(el => targets.push({ el, text: textWithoutTranslation(el), block: true }));
  root.querySelectorAll('td[data-label]').forEach(el => {
    if (/dalil|nash|الدليل|الأدلة/i.test(el.getAttribute('data-label')) && arabicRatio(el.textContent || '') >= 0.6) {
      targets.push({ el, text: el.textContent || '' });
    }
  });
  root.querySelectorAll('p, li').forEach(el => {
    const t = el.textContent || '';
    if (!/^\s*📍/.test(t)) return;
    el.classList.add('ai-source');
    const quoted = t.match(/[“"«]([^”"»]{8,})[”"»]/);
    targets.push({ el, text: quoted ? quoted[1] : t.replace(/^\s*📍[^:]*:\s*/, '') });
  });

  targets.forEach(({ el, text, block }) => {
    const verdict = verdictOf(quoteScore(text, index));
    if (!verdict) return;
    el.classList.add(`ai-quote-${verdict}`);
    const badge = doc.createElement('button');
    badge.setAttribute('type', 'button');
    badge.className = `ai-cite ai-cite-${verdict}${block ? ' ai-cite-block' : ''}`;
    badge.setAttribute('data-cite', text.trim().slice(0, 600));
    badge.setAttribute('data-verdict', verdict);
    badge.setAttribute('title', CITE_TITLES[verdict]);
    badge.setAttribute('dir', 'ltr');
    badge.textContent = CITE_LABELS[verdict];
    el.appendChild(badge);
  });
};

// Teks pendek (bukan markdown): potongan Arab diberi huruf & arah yang benar, sisanya apa adanya.
export function AiInline({ text }) {
  if (!text || typeof text !== 'string') return null;
  const parts = [];
  let last = 0;
  text.replace(ARABIC_RUN, (match, offset) => {
    if (offset > last) parts.push(text.slice(last, offset));
    parts.push(<span key={offset} className="ai-ar-inline" dir="rtl">{match}</span>);
    last = offset + match.length;
    return match;
  });
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

/* source: teks materi → kutipan dicocokkan & diberi label. onCite(teks, verdict): label diketuk. */
// Blok ```grafik … ``` dipisah dari teks supaya bisa digambar sebagai komponen. Blok yang belum ditutup
// (jawaban masih mengalir) ditandai pending.
const CHART_BLOCK = /```grafik[^\n]*\n([\s\S]*?)(```|$)/g;
const splitCharts = (content) => {
  const parts = [];
  let last = 0;
  for (const m of (content || '').matchAll(CHART_BLOCK)) {
    if (m.index > last) parts.push({ text: content.slice(last, m.index) });
    parts.push({ chart: m[1], pending: m[2] !== '```' });
    last = m.index + m[0].length;
  }
  if (last < (content || '').length) parts.push({ text: content.slice(last) });
  return parts;
};

// Teks untuk Salin / Kurasah: blok grafik diganti versi daftar yang bisa dibaca.
export const aiTextForCopy = (content) =>
  (content || '').replace(CHART_BLOCK, (_, raw) => chartToMarkdown(parseChart(raw)));

export default function AiRichText({ content, rtl = false, size = 'md', className = '', style, source, onCite }) {
  const parts = useMemo(() => {
    const index = source ? sourceIndex(source) : null;
    return splitCharts(content).map(p => (p.text != null ? { html: renderAiHtml(p.text, index) } : p));
  }, [content, source]);
  const handleClick = (e) => {
    const btn = e.target.closest?.('[data-cite]');
    if (btn && onCite) { e.preventDefault(); onCite(btn.getAttribute('data-cite'), btn.getAttribute('data-verdict')); }
  };
  const cls = `ai-rich ai-rich-${size} ${rtl ? 'ai-rich-rtl' : ''} ${className}`;
  if (parts.length <= 1 && parts[0]?.html != null) {
    return <div className={cls} dir={rtl ? 'rtl' : 'ltr'} style={style} onClick={handleClick} dangerouslySetInnerHTML={{ __html: parts[0].html }}/>;
  }
  return (
    <div className={cls} dir={rtl ? 'rtl' : 'ltr'} style={style} onClick={handleClick}>
      {parts.map((p, i) => p.html != null
        ? <div key={i} className="ai-rich-part" dangerouslySetInnerHTML={{ __html: p.html }}/>
        : <AiChart key={i} raw={p.chart} pending={p.pending}/>)}
    </div>
  );
}
