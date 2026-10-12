import React from 'react';
import { 
  FileSearch, 
  HelpCircle, 
  ShieldCheck, 
  DownloadCloud, 
  Lock, 
  Sparkles,
  ArrowLeft,
  Star
} from 'lucide-react';
import { BookCover } from './BookCover';
import { INITIAL_CASES } from '../data/casesData';

export function HeroSection({ onExploreCases, onPlayMiniGame }) {
  const featuredBook = INITIAL_CASES[0];

  return (
    <div className="relative overflow-hidden bg-[#07080b] border-b border-white/[0.06] pt-12 pb-20 lg:pt-20 lg:pb-28">
      {/* Background Soft Atmospheric Glows (No muddy textures) */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-rose-600/[0.07] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-amber-500/[0.06] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Right Column: Hero Content & Typography */}
          <div className="lg:col-span-7 space-y-6 text-right">
            
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.1] text-xs font-mono text-stone-300 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>إصدارات التحقيق الرقمية المعتمدة</span>
              <span className="text-stone-600">•</span>
              <span className="text-amber-400 font-bold">كتب ألغاز تفاعلية</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-white leading-tight">
              ألغاز بوليسية مشفرة... <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500">
                بذكاء المحقق الجنائي
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-stone-300 max-w-xl leading-relaxed font-sans font-light">
              مكتبة رقمية لألغاز التحقيق المعقدة: اقرأ محاضر الاستجواب، افحص الأدلة المادية وتقارير الطب الشرعي، واستنتج هوية الجاني قبل كسر الختم الأمني للحل!
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-2">
              <button
                onClick={onExploreCases}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-sm shadow-xl shadow-rose-950/40 transform hover:-translate-y-0.5 transition flex items-center justify-center gap-2"
              >
                <FileSearch className="w-4 h-4 text-amber-300" />
                <span>استكشف كتب القضايا المفتوحة</span>
              </button>

              <button
                onClick={onPlayMiniGame}
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-stone-200 hover:text-white border border-white/[0.1] font-bold text-sm transition flex items-center justify-center gap-2"
              >
                <HelpCircle className="w-4 h-4 text-rose-400" />
                <span>لغز تجريبي (خصم 15%)</span>
              </button>
            </div>

            {/* Trust Highlights */}
            <div className="pt-6 border-t border-white/[0.06] grid grid-cols-3 gap-4 text-right">
              <div>
                <div className="text-xl font-bold font-mono text-white">100%</div>
                <div className="text-xs text-stone-400">تحميل PDF فوري</div>
              </div>
              <div>
                <div className="text-xl font-bold font-mono text-amber-400">3 مستويات</div>
                <div className="text-xs text-stone-400">تلميحات متدرجة</div>
              </div>
              <div>
                <div className="text-xl font-bold font-mono text-rose-400">مختومة</div>
                <div className="text-xs text-stone-400">حلول مشفرة بلا حرق</div>
              </div>
            </div>

          </div>

          {/* Left Column: 3D Realistic Book Showcase */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative">
              
              {/* Radial ambient glow behind book */}
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-rose-600/20 rounded-full blur-3xl transform -rotate-6 scale-90 pointer-events-none" />

              {/* 3D Book Showcase */}
              <div className="relative cursor-pointer" onClick={onExploreCases}>
                <BookCover caseItem={featuredBook} size="lg" />

                {/* Floating Rating Pill */}
                <div className="absolute -bottom-4 -right-4 glass-panel px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-xl border border-white/10">
                  <span className="text-amber-400 font-bold font-mono text-sm flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400" />
                    4.9
                  </span>
                  <span className="text-[11px] text-stone-300">الأكثر مبيعاً هذا الأسبوع</span>
                </div>

                {/* Floating Seal Pill */}
                <div className="absolute -top-3 -left-3 bg-rose-600/90 text-white text-[10px] font-mono font-bold px-3 py-1 rounded-full border border-rose-400/30 shadow-lg uppercase tracking-wider">
                  الأكثر غموضاً 🔥
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
