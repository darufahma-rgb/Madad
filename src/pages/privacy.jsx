import React from 'react';
/* Talqeeh — Kebijakan Privasi (publik; juga dipakai sebagai privacy policy link di Google OAuth) */

const PRIVACY_UPDATED = "24 September 2026";
const ADMIN_WA = "https://wa.me/6281311506025";

const PRIVACY_SECTIONS = [
  {
    title: "Data dari akun Google",
    body: [
      "Saat kamu masuk dengan Google, Talqeeh hanya menerima nama, alamat email, dan foto profil dasar akunmu. Data ini dipakai untuk mengenali akunmu dan menghubungkannya ke keanggotaan Talqeeh.",
      "Talqeeh tidak mengakses Gmail, Drive, kontak, atau data Google lainnya.",
    ],
  },
  {
    title: "Data keanggotaan",
    body: [
      "Kode member, nama, nomor WhatsApp yang kamu berikan saat mendaftar, status dan masa berlaku keanggotaan, serta waktu login terakhir. Data ini dipakai untuk mengelola akses dan menghubungimu soal keanggotaan.",
    ],
  },
  {
    title: "Data belajar",
    body: [
      "Profil belajar dari onboarding (fakultas, tingkat, gaya belajar), catatan Kurasah, progress, niat dan presensi harian, aktivitas maddah, muqaranah buatanmu, dan tanda \"paham/belum\" di Bank Soal. Data ini disinkronkan supaya kamu bisa melanjutkan belajar di perangkat lain.",
    ],
  },
  {
    title: "AI Partner Belajar",
    body: [
      "Kalau kamu memakai AI Partner, teks materi yang kamu unggah (hasil ekstraksi dari PDF, foto, atau teks yang kamu tempel) disimpan bersama ringkasan, flashcard, kuis, dan riwayat chat tutor. File asli PDF/foto tidak disimpan.",
      "Untuk menghasilkan jawaban, teks tersebut dikirim ke penyedia model AI pihak ketiga (OpenRouter, yang meneruskan ke model Claude dari Anthropic). Jangan mengunggah data pribadi atau rahasia ke dalam materi.",
    ],
  },
  {
    title: "Bank Soal",
    body: [
      "Saat kamu mengirim soal imtihan, kami menyimpan nama, nomor WhatsApp, dan foto soal untuk verifikasi dan pengiriman reward. Foto soal dihapus setelah soal diproses atau ditolak; hanya teks soal yang disetujui yang ditampilkan.",
    ],
  },
  {
    title: "Pembayaran",
    body: [
      "Pembayaran diproses oleh Lynk.id atau Mayar. Talqeeh tidak menyimpan data kartu, rekening, atau dompet digitalmu — kami hanya menerima konfirmasi status pembayaran.",
    ],
  },
  {
    title: "Penyimpanan dan pihak ketiga",
    body: [
      "Data disimpan di Supabase (database dan autentikasi) dan aplikasi dijalankan di Vercel. Sebagian data juga disimpan di browsermu (localStorage) supaya aplikasi tetap cepat.",
      "Kami tidak menjual datamu dan tidak memakainya untuk iklan.",
      "Penggunaan informasi yang diterima dari Google API mematuhi Google API Services User Data Policy, termasuk ketentuan Limited Use.",
    ],
  },
  {
    title: "Hak kamu",
    body: [
      "Kamu bisa meminta salinan, perbaikan, atau penghapusan seluruh datamu kapan saja dengan menghubungi admin Talqeeh lewat WhatsApp. Setelah akun dihapus, akses keanggotaan ikut berakhir.",
    ],
  },
];

const PrivacyPage = () => (
  <div className="page-enter">
    <PageHeader
      kicker="Kebijakan Privasi"
      title="Data apa yang kami simpan, dan untuk apa."
      subtitle={`Berlaku sejak ${PRIVACY_UPDATED}.`}
    />
    <section className="pb-24">
      <div className="container-x max-w-3xl space-y-4">
        {PRIVACY_SECTIONS.map(s => (
          <div key={s.title} className="card-glass p-6 md:p-8">
            <h2 className="font-display text-xl font-semibold text-ink mb-3">{s.title}</h2>
            {s.body.map((p, i) => (
              <p key={i} className="text-ink-muted leading-relaxed mb-3 last:mb-0">{p}</p>
            ))}
          </div>
        ))}
        <div className="card-glass p-6 md:p-8">
          <h2 className="font-display text-xl font-semibold text-ink mb-3">Kontak</h2>
          <p className="text-ink-muted leading-relaxed">
            Pertanyaan atau permintaan soal data:{" "}
            <a href={ADMIN_WA} target="_blank" rel="noopener noreferrer" className="text-emerald-300 hover:text-emerald-200 underline underline-offset-2">
              WhatsApp admin Talqeeh
            </a>{" "}
            · Instagram @ai.gypt
          </p>
        </div>
      </div>
    </section>
  </div>
);

Object.assign(window, { PrivacyPage });
