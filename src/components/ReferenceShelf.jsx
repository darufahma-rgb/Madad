import React, { useMemo, useState } from 'react';

export const REFERENCE_SUBJECTS = { fiqh: 'Fikih', usul: 'Usul Fikih', nahwu: 'Nahwu', sarf: 'Sharaf', balaghah: 'Balaghah', hadith: 'Hadis', tafsir: 'Tafsir & Ulumul Qur’an', aqidah: 'Akidah', other: 'Lainnya' };
const searchText = text => String(text || '').normalize('NFKC').toLowerCase().replace(/[\u064B-\u065F\u0670\u0640]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي');
const ready = d => d.status === 'done' && d.edition?.title && d.edition?.author && REFERENCE_SUBJECTS[d.edition?.subject] && !['unread','garbled'].some(k => Number(d.page_stats?.[k]) > 0);

export default function ReferenceShelf({ docs, publications, publicationError, onOpen, onRemove }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [subject, setSubject] = useState('');
  const [sort, setSort] = useState('recent');
  const activeIds = new Set((publications || []).filter(p => p.active).map(p => p.document_id));
  const list = useMemo(() => {
    const query = searchText(search.trim());
    return (docs || []).filter(d => (!subject || d.edition?.subject === subject) &&
      (!query || searchText([d.title, ...Object.values(d.edition || {})].join(' ')).includes(query)) &&
      (filter === 'all' || (filter === 'active' ? activeIds.has(d.id) : filter === 'ready' ? ready(d) && !activeIds.has(d.id) : !ready(d))))
      .sort((a, b) => sort === 'title' ? (a.edition?.title || a.title).localeCompare(b.edition?.title || b.title, 'ar') : Date.parse(b.updated_at) - Date.parse(a.updated_at));
  }, [docs, publications, search, filter, subject, sort]);
  const stats = [['Kitab tersimpan', docs?.length || 0], ['Rujukan aktif', publications ? activeIds.size : '—'], ['Perlu diperiksa', (docs || []).filter(d => !ready(d)).length]];
  return <section aria-label="Katalog pustaka rujukan" className="space-y-5">
    <div className="grid grid-cols-3 gap-2 sm:gap-3">{stats.map(([label, value], i) => <div key={label} className="rounded-2xl border border-white/[0.08] p-3 sm:p-5" style={{ background: i === 1 ? 'linear-gradient(135deg,rgba(62,207,142,.12),rgba(62,207,142,.025))' : 'rgba(255,255,255,.025)' }}>
      <div className={`text-2xl sm:text-3xl font-display ${i === 1 ? 'text-emerald-200' : 'text-ink'}`}>{value}</div><div className="text-[11px] sm:text-xs text-ink-soft mt-1">{label}</div>
    </div>)}</div>
    {publicationError && <p role="alert" className="rounded-xl border border-amber-300/20 bg-amber-300/5 p-3 text-xs text-amber-100">{publicationError} Status aktivasi belum dapat ditampilkan.</p>}
    <div className="flex items-end justify-between gap-3"><div><p className="text-[10px] uppercase tracking-[.2em] text-gold-400 mb-1">Koleksi ilmiah</p><h2 className="font-display text-xl text-ink">Rak kitab Talqeeh</h2></div><span className="text-xs text-ink-soft shrink-0">{list.length} kitab</span></div>
    <div className="rounded-2xl border border-white/[0.08] p-3 space-y-3 bg-white/[0.02]">
      <label className="flex items-center gap-2"><span className="text-emerald-300" aria-hidden>⌕</span><input aria-label="Cari kitab, penulis, atau edisi" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari kitab, penulis, atau edisi…" className="min-w-0 w-full bg-transparent text-ink outline-none h-10 text-base" dir="auto"/></label>
      <div className="flex flex-wrap gap-2 border-t border-white/[0.06] pt-3">
        {[['all','Semua'],['active','Aktif'],['ready','Siap diaktifkan'],['review','Perlu diperiksa']].map(([id, label]) => <button key={id} aria-pressed={filter === id} onClick={() => setFilter(id)} className={`px-3 min-h-[36px] rounded-lg text-xs border transition-colors ${filter === id ? 'border-emerald-300/30 bg-emerald-400/10 text-emerald-200' : 'border-transparent text-ink-soft hover:text-ink'}`}>{label}</button>)}
        <div className="flex flex-wrap gap-2 sm:ml-auto w-full sm:w-auto">
          <select aria-label="Filter bidang ilmu" value={subject} onChange={e => setSubject(e.target.value)} className="min-w-0 flex-1 sm:flex-none rounded-lg border border-white/10 bg-[#131a17] px-2 py-2 text-xs text-ink"><option value="">Semua bidang</option>{Object.entries(REFERENCE_SUBJECTS).map(([id,label]) => <option key={id} value={id}>{label}</option>)}</select>
          <select aria-label="Urutan kitab" value={sort} onChange={e => setSort(e.target.value)} className="rounded-lg border border-white/10 bg-[#131a17] px-2 py-2 text-xs text-ink"><option value="recent">Terbaru</option><option value="title">Judul A–Z</option></select>
        </div>
      </div>
    </div>
    {docs === null ? <div className="rounded-2xl border border-white/10 p-8 text-sm text-ink-soft animate-pulse">Memuat koleksi kitab…</div> : !list.length ? <div className="rounded-2xl border border-dashed border-emerald-400/20 px-6 py-12 text-center"><p className="font-display text-lg text-ink">{docs.length ? 'Belum ada kitab yang cocok' : 'Awal dari pustaka yang terpercaya'}</p><p className="text-sm text-ink-soft mt-2">{docs.length ? 'Ubah pencarian atau filter untuk melihat koleksi lainnya.' : 'Unggah kitab pertama, lengkapi edisinya, lalu periksa sebelum diaktifkan.'}</p></div> :
      <div className="grid md:grid-cols-2 gap-4">{list.map((d, i) => {
        const e = d.edition || {}; const active = activeIds.has(d.id); const canActivate = ready(d);
        const state = !publications ? 'Status belum dimuat' : active ? 'Rujukan aktif' : canActivate ? 'Siap diaktifkan' : 'Perlu diperiksa';
        return <article key={d.id} className="relative overflow-hidden rounded-2xl border border-white/[0.08] transition-colors hover:border-emerald-300/30" style={{ background: 'linear-gradient(145deg,#151f1a,#101512)' }}>
          <div className="absolute inset-y-0 left-0 w-1" style={{ background: active ? '#3ECF8E' : '#C9A86A', opacity: .65 }}/>
          <div className="p-5 pl-6 flex items-start gap-4">
            <div aria-hidden className="hidden sm:flex w-16 h-24 shrink-0 rounded-r-lg rounded-l-sm border border-gold-300/20 items-center justify-center relative shadow-lg" style={{ background: i % 2 ? 'linear-gradient(135deg,#303023,#1a241b)' : 'linear-gradient(135deg,#173e2c,#14261d)' }}><div className="absolute inset-y-0 left-1 w-px bg-gold-300/20"/><span className="text-gold-300/80 text-2xl">۞</span></div>
            <div className="min-w-0 flex-1"><span className={`inline-flex text-[10px] rounded-full px-2 py-1 border ${active ? 'text-emerald-200 border-emerald-300/20 bg-emerald-400/10' : 'text-gold-200 border-gold-300/20 bg-gold-400/5'}`}>{state}</span>
              <button onClick={() => onOpen(d)} className="block text-start w-full mt-3 group"><h3 dir="auto" className="font-display text-xl text-ink leading-relaxed break-words group-hover:text-emerald-200">{e.title || d.title}</h3></button>
              <p dir="auto" className="text-sm text-ink-muted mt-1 break-words">{e.author || 'اسم المؤلف — Penulis belum diisi'}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">{[REFERENCE_SUBJECTS[e.subject],e.madhhab && `Mazhab ${e.madhhab}`,e.volume && `Jilid ${e.volume}`].filter(Boolean).map(t => <span key={t} className="text-[10px] px-2 py-1 rounded-md bg-white/[0.04] text-ink-muted border border-white/5" dir="auto">{t}</span>)}</div>
            </div>
          </div>
          <div className="px-5 pl-6 pb-4"><p className="text-xs text-ink-soft break-words min-h-[18px]" dir="auto">{[e.publisher,e.edition,e.year].filter(Boolean).join(' · ') || 'Metadata edisi belum lengkap'}</p><div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/[0.07] pt-3">{[[d.num_pages,'Halaman PDF'],[d.stats?.entries ?? '—','Pembahasan'],[d.stats?.citations ?? '—','Kutipan']].map(([value,label]) => <div key={label}><div className="text-sm text-ink">{value}</div><div className="text-[10px] text-ink-soft mt-0.5">{label}</div></div>)}</div></div>
          <div className="flex items-center justify-between gap-3 px-5 pl-6 py-3 bg-black/15 border-t border-white/5"><button onClick={() => onOpen(d)} className="text-xs text-emerald-200 min-h-[36px]">Buka & periksa <span aria-hidden>↗</span></button><button onClick={() => onRemove(d)} className="text-xs text-ink-soft hover:text-red-300 min-h-[36px]" aria-label={`Hapus ${e.title || d.title}`}>Hapus</button></div>
        </article>;
      })}</div>}
  </section>;
}
