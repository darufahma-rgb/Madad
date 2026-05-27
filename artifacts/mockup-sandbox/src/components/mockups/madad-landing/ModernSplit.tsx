import React, { useEffect, useState } from "react";
import {
  Check,
  ChevronRight,
  Target,
  Scale,
  BookMarked,
  Clock,
  GraduationCap,
  Lock,
  ArrowRight,
  Sparkles,
  Zap,
  BrainCircuit,
  LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function ModernSplit() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-white font-['Inter'] text-gray-900 selection:bg-[#B8860B] selection:text-white">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-up {
          animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .stagger-1 { animation-delay: 150ms; }
        .stagger-2 { animation-delay: 300ms; }
        .stagger-3 { animation-delay: 450ms; }
        .stagger-4 { animation-delay: 600ms; }
      `}</style>

      {/* 1. HERO — Split Panel */}
      <section className="relative min-h-[90vh] flex flex-col lg:flex-row">
        {/* Left Panel - Dark */}
        <div className="w-full lg:w-[55%] bg-[#111827] flex items-center justify-center p-8 lg:p-20 relative overflow-hidden">
          {/* Subtle gradient orb for depth */}
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#B8860B]/10 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="max-w-xl w-full relative z-10">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#B8860B]/20 text-[#C9A86C] border border-[#B8860B]/30 text-sm font-medium mb-8 animate-fade-up`}>
              <Sparkles className="w-4 h-4" />
              <span>Platform AI untuk Masisir</span>
            </div>
            
            <h1 className={`text-5xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-6 animate-fade-up stagger-1`}>
              Materi Azhar, <br />
              <span className="text-gray-300">lebih gampang dipahami.</span>
            </h1>
            
            <p className={`text-lg lg:text-xl text-gray-400 leading-relaxed mb-10 animate-fade-up stagger-2`}>
              Dari Nahwu sampai Mustholah — MADAD tahu AI mana yang cocok untuk caramu belajar.
            </p>
            
            <div className={`flex flex-col sm:flex-row gap-4 mb-12 animate-fade-up stagger-3`}>
              <Button size="lg" className="bg-[#B8860B] hover:bg-[#9c7209] text-white font-bold h-14 px-8 text-base">
                Gabung — Rp49.000
              </Button>
              <Button size="lg" variant="ghost" className="text-white hover:bg-white/10 h-14 px-8 text-base">
                Pelajari lebih lanjut
              </Button>
            </div>
            
            <div className={`flex items-center gap-4 animate-fade-up stagger-4 pt-8 border-t border-white/10`}>
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gray-700 border-2 border-[#111827] flex items-center justify-center text-[10px] text-white font-bold">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-400">
                Dipakai thalib dari berbagai fakultas Al-Azhar
              </p>
            </div>
          </div>
        </div>
        
        {/* Right Panel - Light */}
        <div className="w-full lg:w-[45%] bg-gray-50 flex items-center justify-center p-8 lg:p-12 relative overflow-hidden">
          {/* Dashboard Mockup */}
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-float">
            {/* Window controls */}
            <div className="bg-[#111827] px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="mx-auto text-xs font-medium text-gray-400 flex items-center gap-2">
                <LayoutDashboard className="w-3 h-3" /> Dashboard Personal
              </div>
              <div className="w-10" /> {/* Spacer */}
            </div>
            
            {/* Mockup Content */}
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-900 mb-1">AI Rekomendasi</h3>
                <p className="text-xs text-gray-500">Berdasarkan gaya belajar visual</p>
              </div>
              
              <div className="space-y-3 mb-6">
                {[
                  { name: 'Claude 3.5 Sonnet', score: '98%', desc: 'Terbaik untuk Mustholah', icon: <BrainCircuit className="w-4 h-4 text-purple-600" /> },
                  { name: 'ChatGPT-4o', score: '94%', desc: 'Bagus untuk terjemah', icon: <Zap className="w-4 h-4 text-green-600" /> },
                ].map((ai, i) => (
                  <div key={i} className="flex items-center p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                      {ai.icon}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="text-sm font-semibold text-gray-900">{ai.name}</span>
                        <span className="text-xs font-bold text-emerald-600">{ai.score}</span>
                      </div>
                      <p className="text-xs text-gray-500">{ai.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="rounded-xl bg-[#111827] p-4 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#B8860B]/20 rounded-bl-full" />
                <h4 className="text-sm font-bold mb-1 relative z-10">Guide: Nahwu Wadhih</h4>
                <p className="text-xs text-gray-400 mb-3 relative z-10">Prompt template untuk analisis I'rab</p>
                <button className="text-xs font-semibold text-[#C9A86C] flex items-center gap-1 relative z-10 hover:text-white transition-colors">
                  Buka Guide <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST BAR */}
      <section className="py-8 border-b border-gray-100 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 lg:gap-8 flex-wrap">
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Mendukung studi di:</span>
            <div className="flex gap-2 lg:gap-4 flex-wrap justify-center">
              {['Ushuluddin', 'Syariah', 'Lughah', 'Dirasat Islamiyah', "Al-Qur'an Al-Karim"].map((faculty) => (
                <span key={faculty} className="px-4 py-1.5 rounded-full border border-gray-200 text-sm font-medium text-gray-600 bg-gray-50">
                  {faculty}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURES GRID */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-[#111827] tracking-tight">Apa yang kamu dapat</h2>
            <div className="w-20 h-1 bg-[#B8860B] mx-auto mt-6" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Target className="w-6 h-6 text-[#B8860B]" />, title: 'Panduan per gaya belajar', desc: 'Tiap AI, tiap matpel, cara pakainya beda' },
              { icon: <Scale className="w-6 h-6 text-[#B8860B]" />, title: 'Muqaranah Qoul Ulama', desc: '4 madzhab side by side' },
              { icon: <BookMarked className="w-6 h-6 text-[#B8860B]" />, title: 'Kurasah Digital', desc: 'Catatan markdown + teks Arab' },
              { icon: <Clock className="w-6 h-6 text-[#B8860B]" />, title: 'Companion Harian', desc: 'Niat pagi, ritme belajar, refleksi malam' },
              { icon: <GraduationCap className="w-6 h-6 text-[#B8860B]" />, title: 'Per Fakultas Al-Azhar', desc: 'Guide yang sesuai kuliah kamu' },
              { icon: <Lock className="w-6 h-6 text-[#B8860B]" />, title: 'Akses Seumur Hidup', desc: 'Sekali bayar, tidak ada langganan' },
            ].map((feat, i) => (
              <div 
                key={i} 
                className="group relative bg-[#F9FAFB] p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#B8860B] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-6 text-[#B8860B]">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feat.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="py-24 bg-[#F9FAFB] overflow-hidden">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-[#111827] tracking-tight">Tiga menit sampai siap.</h2>
          </div>

          <div className="relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gray-200" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
              {[
                { step: '01', title: 'Isi profil singkat', desc: 'Fakultas, tingkat, dan gaya belajar' },
                { step: '02', title: 'Dapat rekomendasi AI', desc: 'Personal, sesuai kuliah dan caramu' },
                { step: '03', title: 'Buka dashboard', desc: 'Guide, muqaranah, kurasah — siap pakai' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full bg-white shadow-sm flex items-center justify-center mb-6 relative group">
                    <span className="text-3xl font-black text-[#B8860B] relative z-10">{item.step}</span>
                    <div className="absolute inset-0 border-2 border-[#B8860B] rounded-full scale-110 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRICING */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-[#111827] tracking-tight">Satu harga, semua fitur.</h2>
          </div>

          <div className="max-w-[480px] mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-8 md:p-10">
              <div className="inline-block px-3 py-1 bg-[#B8860B]/10 text-[#B8860B] font-bold text-xs uppercase tracking-wider rounded-full mb-6">
                Bayar sekali
              </div>
              
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-black text-gray-900 tracking-tight">Rp 49.000</span>
              </div>
              <div className="text-sm text-gray-500 mb-8 line-through decoration-gray-300">
                Nilai aslinya: Rp 150.000
              </div>

              <div className="space-y-4 mb-10">
                {[
                  'Akses penuh semua guide AI',
                  'Kurasah digital (Markdown + Arab)',
                  'Update materi berkala',
                  'Komunitas & support'
                ].map((feat, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-emerald-600" />
                    </div>
                    <span className="text-gray-600 font-medium">{feat}</span>
                  </div>
                ))}
              </div>

              <Button className="w-full h-14 bg-[#B8860B] hover:bg-[#9c7209] text-white text-lg font-bold shadow-lg shadow-[#B8860B]/20">
                Gabung Sekarang
              </Button>
              <p className="text-center text-xs text-gray-400 mt-4 font-medium">
                Kode akses dikirim instan via WhatsApp
              </p>
            </div>
            <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
              <p className="text-sm text-gray-600 font-medium flex items-center justify-center gap-2">
                💡 Lebih murah dari satu buku referensi di toko.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FINAL CTA */}
      <section className="py-24 bg-[#111827] text-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#B8860B]/5 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#B8860B]/5 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2" />
        
        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center">
          <div className="text-4xl md:text-6xl text-[#C9A86C] font-arabic mb-6" dir="rtl" style={{ fontFamily: 'sans-serif' }}>
            قَيِّدُوا الْعِلْمَ بِالْكِتَابَةِ
          </div>
          <p className="text-2xl text-white font-medium mb-10">
            "Ikatlah ilmu dengan tulisan."
          </p>
          
          <Button size="lg" className="bg-white text-[#111827] hover:bg-gray-100 font-bold h-14 px-10 text-lg group">
            Mulai Sekarang 
            <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#111827] py-6 border-t border-white/10 text-center">
        <p className="text-gray-500 text-sm">MADAD © 2026. All rights reserved.</p>
      </footer>
    </div>
  );
}
