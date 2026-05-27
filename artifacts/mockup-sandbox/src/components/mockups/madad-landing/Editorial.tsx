import React from 'react';
import { Sparkles, ArrowRight, CheckCircle2, BookOpen, FileText, Layers } from 'lucide-react';
import './Editorial.css';

export function Editorial() {
  return (
    <div className="madad-editorial min-h-screen selection:bg-[#C9A86C]/30">
      {/* 1. HERO (dark bg: #0E0C1A) */}
      <section className="relative min-h-[90vh] bg-[#0E0C1A] overflow-hidden flex flex-col">
        {/* Navbar */}
        <nav className="relative z-20 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-sm bg-[#C9A86C] flex items-center justify-center text-[#0E0C1A] font-serif font-bold text-xl">
              M
            </div>
            <span className="font-serif text-2xl tracking-widest text-[#FAF7F0]">MADAD</span>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-[#EDE8DC]/80 hover:text-[#FAF7F0] transition-colors text-sm font-medium">
              Login
            </button>
            <button className="bg-[#C9A86C] hover:bg-[#b8955b] text-[#0E0C1A] px-5 py-2.5 rounded-sm font-medium text-sm transition-colors">
              Gabung Member
            </button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center px-8 max-w-7xl mx-auto w-full py-12">
          <div className="max-w-2xl animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A1625] border border-[#C9A86C]/20 mb-8">
              <Sparkles className="w-4 h-4 text-[#C9A86C]" />
              <span className="text-xs font-medium tracking-wide text-[#C9A86C] uppercase">AI untuk Penuntut Ilmu</span>
            </div>
            <h1 className="font-serif text-[5rem] leading-[0.95] text-[#FAF7F0] mb-8 tracking-tight">
              Belajar lebih dalam.<br />Lebih mudah.<br />
              <span className="text-[#C9A86C] italic">Lebih bermakna.</span>
            </h1>
            <p className="text-xl text-[#EDE8DC]/60 mb-10 max-w-lg leading-relaxed">
              Panduan AI yang tahu kamu belajar Ushuluddin, bukan coding.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button className="w-full sm:w-auto bg-[#C9A86C] hover:bg-[#b8955b] text-[#0E0C1A] px-8 py-4 rounded-sm font-medium transition-colors flex items-center justify-center gap-2">
                Gabung Sekarang — Rp49.000
                <ArrowRight className="w-4 h-4" />
              </button>
              <button className="w-full sm:w-auto px-8 py-4 rounded-sm font-medium transition-colors border border-[#EDE8DC]/20 hover:bg-[#EDE8DC]/5 text-[#FAF7F0]">
                Lihat cara kerjanya
              </button>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center justify-center animate-scale-fade">
            <div className="font-arabic text-[18rem] leading-none arabic-glow select-none pointer-events-none">
              العلم
            </div>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute top-1/4 right-0 w-[800px] h-[800px] bg-[#6B4E8E]/10 rounded-full blur-[120px] pointer-events-none" />
      </section>

      {/* 2. STATS BAR (cream bg: #FAF7F0) */}
      <section className="bg-[#FAF7F0] text-[#1A1625] py-16 border-y border-[#1A1625]/10">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#1A1625]/10 text-center">
            <div className="py-4 md:py-0 px-6">
              <div className="font-serif text-5xl font-medium mb-2">6</div>
              <div className="text-sm tracking-widest uppercase text-[#1A1625]/60 font-medium">Alat AI</div>
            </div>
            <div className="py-4 md:py-0 px-6">
              <div className="font-serif text-5xl font-medium mb-2">6</div>
              <div className="text-sm tracking-widest uppercase text-[#1A1625]/60 font-medium">Gaya Belajar</div>
            </div>
            <div className="py-4 md:py-0 px-6">
              <div className="font-serif text-5xl font-medium mb-2">5</div>
              <div className="text-sm tracking-widest uppercase text-[#1A1625]/60 font-medium">Fakultas Al-Azhar</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURES (dark bg: #0E0C1A) */}
      <section className="bg-[#0E0C1A] py-32">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-20">
            <span className="text-[#C9A86C] text-sm tracking-[0.2em] uppercase font-semibold">Fitur Utama</span>
            <h2 className="font-serif text-5xl text-[#FAF7F0] mt-6">Dirancang untuk Tholibul Ilmi</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-[#1A1625]/50 border border-[#FAF7F0]/5 p-10 rounded-sm hover-lift relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 text-[4rem] font-serif font-light text-[#FAF7F0]/5 leading-none transition-transform group-hover:scale-110">01</div>
              <BookOpen className="w-8 h-8 text-[#C9A86C] mb-8" />
              <h3 className="font-serif text-2xl text-[#FAF7F0] mb-4">Adaptive AI Guide</h3>
              <p className="text-[#EDE8DC]/60 leading-relaxed">
                Satu panduan beda untuk setiap gaya belajar dan matkulmu. Disesuaikan dengan kurikulum Al-Azhar.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-[#1A1625]/50 border border-[#FAF7F0]/5 p-10 rounded-sm hover-lift relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 text-[4rem] font-serif font-light text-[#FAF7F0]/5 leading-none transition-transform group-hover:scale-110">02</div>
              <Layers className="w-8 h-8 text-[#C9A86C] mb-8" />
              <h3 className="font-serif text-2xl text-[#FAF7F0] mb-4">Muqaranah Qoul</h3>
              <p className="text-[#EDE8DC]/60 leading-relaxed">
                Pendapat 4 madzhab berdampingan, bukan scroll panjang. Komparasi visual yang memudahkan pemahaman.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-[#1A1625]/50 border border-[#FAF7F0]/5 p-10 rounded-sm hover-lift relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 text-[4rem] font-serif font-light text-[#FAF7F0]/5 leading-none transition-transform group-hover:scale-110">03</div>
              <FileText className="w-8 h-8 text-[#C9A86C] mb-8" />
              <h3 className="font-serif text-2xl text-[#FAF7F0] mb-4">Kurasah Digital</h3>
              <p className="text-[#EDE8DC]/60 leading-relaxed">
                Catatan markdown dengan dukungan teks Arab penuh yang bisa kamu bawa dan akses ke mana saja.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS (cream bg: #FAF7F0) */}
      <section className="bg-[#FAF7F0] text-[#1A1625] py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <h2 className="font-serif text-5xl mb-24">Tiga langkah, dan kamu siap.</h2>
          
          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-px border-t-2 border-dashed border-[#1A1625]/10" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-[#0E0C1A] text-[#FAF7F0] flex items-center justify-center font-serif text-3xl mb-8 shadow-xl">01</div>
                <h3 className="font-serif text-2xl mb-3">Onboarding</h3>
                <p className="text-[#1A1625]/70 max-w-xs mx-auto">Pilih fakultas dan tentukan gaya belajarmu</p>
              </div>
              <div className="flex flex-col items-center mt-12 md:mt-0">
                <div className="w-24 h-24 rounded-full bg-[#0E0C1A] text-[#FAF7F0] flex items-center justify-center font-serif text-3xl mb-8 shadow-xl">02</div>
                <h3 className="font-serif text-2xl mb-3">Rekomendasi AI</h3>
                <p className="text-[#1A1625]/70 max-w-xs mx-auto">Sistem menyusun materi sesuai profilmu</p>
              </div>
              <div className="flex flex-col items-center mt-12 md:mt-0">
                <div className="w-24 h-24 rounded-full bg-[#C9A86C] text-[#0E0C1A] flex items-center justify-center font-serif text-3xl mb-8 shadow-xl">03</div>
                <h3 className="font-serif text-2xl mb-3">Mulai Belajar</h3>
                <p className="text-[#1A1625]/70 max-w-xs mx-auto">Akses kurikulum dan alat bantu AI kapan saja</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRICING (dark bg: #0E0C1A) */}
      <section className="bg-[#0E0C1A] py-32">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-5xl text-[#FAF7F0]">Investasi terbaik yang pernah kamu buat.</h2>
          </div>
          
          <div className="max-w-lg mx-auto">
            <div className="bg-[#1A1625] border border-[#C9A86C]/30 p-12 rounded-sm relative shadow-[0_0_50px_rgba(201,168,108,0.1)] hover-lift">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#C9A86C] text-[#0E0C1A] px-6 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase">
                Member MADAD
              </div>
              
              <div className="text-center mb-10">
                <div className="flex items-start justify-center gap-2 mb-2">
                  <span className="text-2xl text-[#C9A86C] mt-2 font-medium">Rp</span>
                  <span className="font-serif text-[4.5rem] leading-none text-[#C9A86C]">49.000</span>
                </div>
                <div className="text-[#EDE8DC]/60 text-sm">Sekali bayar, akses seumur hidup</div>
              </div>
              
              <ul className="space-y-5 mb-10">
                {['Semua alat AI', 'Akses Kurasah Digital', 'Panduan 5 Fakultas', 'Update fitur gratis'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-4 text-[#EDE8DC]">
                    <CheckCircle2 className="w-5 h-5 text-[#C9A86C] shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button className="w-full bg-[#C9A86C] hover:bg-[#b8955b] text-[#0E0C1A] py-4 rounded-sm font-medium transition-colors mb-4 text-lg">
                Bayar via Lynk.id
              </button>
              <p className="text-center text-xs text-[#EDE8DC]/40">
                Kode dikirim via WhatsApp setelah pembayaran
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FINAL CTA (cream bg: #FAF7F0) */}
      <section className="bg-[#FAF7F0] text-[#1A1625] py-32 text-center border-b-[12px] border-[#0E0C1A]">
        <div className="max-w-4xl mx-auto px-8">
          <div className="font-arabic text-6xl md:text-8xl mb-8 leading-tight text-[#1A1625]">
            قَيِّدُوا الْعِلْمَ بِالْكِتَابَةِ
          </div>
          <p className="font-serif text-2xl md:text-3xl italic text-[#1A1625]/70 mb-16">
            "Ikatlah ilmu dengan tulisan" <span className="text-[#1A1625]/40 not-italic text-lg ml-2">— Atsar</span>
          </p>
          
          <button className="bg-[#0E0C1A] hover:bg-[#1A1625] text-[#FAF7F0] px-10 py-5 rounded-sm font-medium text-lg transition-colors inline-flex items-center gap-3">
            Mulai belajar hari ini
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#FAF7F0] text-[#1A1625]/40 py-8 text-center text-sm">
        MADAD · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
