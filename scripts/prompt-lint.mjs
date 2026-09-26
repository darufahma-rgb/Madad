// Cek rubrik mutu prompt library (Fase 3) tanpa membuka aplikasi.
//   npm run lint:prompts                 → ringkasan semua maddah
//   npm run lint:prompts -- nahwu mantiq → rincian maddah tertentu
//   npm run lint:prompts -- --strict nahwu mantiq → keluar dengan kode 1 kalau ada prompt yang belum layak terbit
// Rubrik yang sama dipakai halaman admin "Mutu Prompt" (src/prompt-rubric.jsx).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const src = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');
const read = (f) => fs.readFileSync(path.join(src, f), 'utf8');
// Ambil literal array data dari file JSX (datanya murni literal JS).
const grab = (file, start, end) => {
  const t = read(file);
  const i = t.indexOf(start), j = t.indexOf(end, i);
  if (i < 0 || j < 0) throw new Error(`Penanda data tidak ditemukan di ${file}`);
  return new Function(t.slice(i, j).replace(/^const \w+ =/, 'return'))();
};
const MADDAHS = grab('maddah-data.jsx', 'const MADDAHS = [', 'const DAKWAH_MADDAH_MAP');
const MAHAD = grab('mahad-data.jsx', 'const MAHAD_MADDAH = [', 'const getMahadMaddahByJenjang');
const window = {};
new Function('window', read('prompt-rubric.jsx').replace(/^import .*$/m, ''))(window);
const { rubricReport, RUBRIC_CRITERIA } = window;

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const ids = args.filter(a => !a.startsWith('--'));
const report = rubricReport(MADDAHS, MAHAD);
const chosen = ids.length ? report.filter(r => ids.includes(r.id)) : report;
const missing = ids.filter(id => !report.some(r => r.id === id));
if (missing.length) { console.error(`Maddah tidak ditemukan: ${missing.join(', ')}`); process.exit(2); }

const pad = (s, n) => String(s).padEnd(n);
if (!ids.length) {
  const all = report.flatMap(r => r.prompts);
  console.log(`${all.length} prompt · ${all.filter(p => p.rubric.layak).length} layak terbit · skor rata-rata ${Math.round(all.reduce((s, p) => s + p.rubric.score, 0) / all.length)}\n`);
  console.log(`${pad('maddah', 28)}${pad('sumber', 8)}${pad('layak', 9)}skor  gagal per kriteria`);
  for (const r of [...report].sort((a, b) => a.score - b.score)) {
    const fails = RUBRIC_CRITERIA.filter(c => r.per[c.id].fail).map(c => `${c.no}:${r.per[c.id].fail}`).join(' ');
    console.log(`${pad(r.id, 28)}${pad(r.source, 8)}${pad(`${r.layak}/${r.total}`, 9)}${pad(r.score, 6)}${fails}`);
  }
} else {
  for (const r of chosen) {
    console.log(`\n== ${r.name} (${r.id}) — ${r.layak}/${r.total} layak, skor ${r.score}`);
    for (const p of r.prompts) {
      const issues = RUBRIC_CRITERIA.map(c => ({ c, x: p.rubric.checks[c.id] })).filter(({ x }) => x.status === 'fail' || x.status === 'warn');
      if (!issues.length) continue;
      console.log(`  ${p.rubric.layak ? '·' : '✗'} [${p.kind}] ${p.title}`);
      for (const { c, x } of issues) console.log(`      ${x.status === 'fail' ? 'GAGAL' : 'saran'} ${c.no}. ${c.label}: ${x.note}`);
    }
  }
}
if (strict && chosen.some(r => r.layak < r.total)) process.exit(1);
