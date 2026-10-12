import React from 'react';
import { BookShelfCover } from './BookShelfCover';

export function MockupHeroSection({ 
  cases, 
  onSelectCase 
}) {
  return (
    <div className="relative bg-black text-white overflow-hidden pt-6 pb-10 sm:pt-8 sm:pb-12 border-b border-stone-850">
      
      {/* Background Watermark: Giant Outlined Magnifying Glass */}
      <div className="absolute -bottom-10 -left-10 w-72 sm:w-96 h-72 sm:h-96 opacity-10 pointer-events-none">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-stone-400 stroke-current">
          <circle cx="85" cy="85" r="55" strokeWidth="12" />
          <line x1="125" y1="125" x2="185" y2="185" strokeWidth="16" strokeLinecap="round" />
        </svg>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8 sm:space-y-10">
        
        {/* ================= HERO BANNER ROW ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          
          {/* Left Wing: Big Double Magenta Chevrons (Desktop only) */}
          <div className="hidden lg:flex lg:col-span-2 items-center justify-center">
            <div className="flex items-center text-crypta-pink space-x-1 space-x-reverse opacity-90 drop-shadow-[0_0_15px_rgba(236,19,104,0.4)]">
              <svg className="w-16 xl:w-20 h-24 xl:h-28 fill-current" viewBox="0 0 24 24">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
              <svg className="w-16 xl:w-20 h-24 xl:h-28 fill-current -mr-8 xl:-mr-10" viewBox="0 0 24 24">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
            </div>
          </div>

          {/* Center Column: Detective Silhouette Backdrop & Main Headline */}
          <div className="lg:col-span-6 text-center space-y-3 sm:space-y-4 relative">
            
            {/* Detective Silhouette as Subtle Watermark Backdrop */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 sm:w-72 sm:h-72 lg:w-80 lg:h-80 pointer-events-none opacity-20 filter contrast-125 select-none -z-0 flex items-center justify-center">
              <img 
                src="/detective_silhouette.jpg" 
                alt="" 
                className="w-full h-full object-contain filter drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
              />
            </div>

            {/* Headline Overlaid in Front */}
            <div className="relative z-10 pt-2 sm:pt-4">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-sans text-white tracking-tight leading-tight drop-shadow-md">
                أنت في المكان الصحيح أيها
              </h1>
              <div className="text-4xl sm:text-5xl lg:text-6xl font-black font-sans text-crypta-yellow tracking-wide mt-1 drop-shadow-[0_2px_15px_rgba(246,195,36,0.3)]">
                المحقق
              </div>
            </div>

            {/* Description Paragraph */}
            <p className="text-xs sm:text-sm text-stone-200 max-w-xl mx-auto leading-relaxed font-sans px-2">
              اكتشف عالم القضايا الجنائية المثير من خلال كتبنا الإلكترونية المتخصصة. قصص خيالية مشوقة تساعدك على تطوير الحس الأمني والتفكير التحليلي
            </p>
          </div>

          {/* Right Column: Library Title & Single Chevron */}
          <div className="lg:col-span-4 flex items-center justify-center lg:justify-start gap-3 sm:gap-4 text-center lg:text-right">
            
            {/* Single Chevron Arrow */}
            <div className="hidden sm:block text-crypta-pink opacity-90 drop-shadow-[0_0_12px_rgba(236,19,104,0.4)] shrink-0">
              <svg className="w-12 sm:w-16 h-16 sm:h-20 fill-current rotate-180" viewBox="0 0 24 24">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-sans text-white leading-tight">
                مكتبة الكتب <br className="hidden sm:inline" />
                الإلكترونية
              </h2>
              <p className="text-xs sm:text-sm font-bold text-crypta-yellow tracking-wide">
                اكتشف المجرم قبل فوات الأوان
              </p>
            </div>

          </div>

        </div>

        {/* ================= BOOKS SHELF CAROUSEL ================= */}
        <div className="pt-2">
          
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-crypta-pink shadow-pink-glow" />
              <h3 className="text-sm sm:text-base font-bold text-white">أبرز ملفات التحقيق المميزة</h3>
            </div>
            <span className="text-[11px] text-stone-400 font-mono">انقر على أي ملف لمعاينة الأدلة</span>
          </div>

          {/* Books Shelf Container */}
          <div className="flex lg:grid lg:grid-cols-10 gap-3 sm:gap-3.5 overflow-x-auto pb-4 pt-1 snap-x scrollbar-none px-1">
            {cases.slice(0, 10).map((c) => {
              return (
                <div 
                  key={c.id}
                  onClick={() => {
                    if (!c.isLocked) {
                      onSelectCase(c);
                    }
                  }}
                  className="group cursor-pointer flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-2 min-w-[135px] sm:min-w-[155px] lg:min-w-0 flex-1 snap-start shrink-0 lg:shrink"
                >
                  {/* Book Cover */}
                  <div className="rounded-xl transition-all group-hover:ring-2 group-hover:ring-crypta-yellow group-hover:shadow-yellow-glow">
                    <BookShelfCover caseItem={c} />
                  </div>

                  {/* Pink Pill Button Below Each Book */}
                  <div className="mt-2.5">
                    <button
                      type="button"
                      className={`w-full py-1.5 px-2 rounded-full text-[10px] sm:text-xs font-bold text-center transition truncate shadow-md ${
                        c.isLocked
                          ? 'bg-gradient-to-r from-stone-800 to-stone-900 text-stone-400 border border-stone-700'
                          : 'bg-gradient-to-r from-crypta-pink to-rose-700 text-white hover:from-rose-500 hover:to-crypta-pink group-hover:scale-105'
                      }`}
                    >
                      {c.isLocked ? 'قريباً' : c.title.replace('قضية ', '').replace('لغز ', '')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Swipe indicator for Mobile & iPad */}
          <div className="lg:hidden flex items-center justify-center gap-2 text-[11px] text-stone-400 font-mono pt-1">
            <span>اسحب لتصفح باقي القصص على الرف</span>
            <span className="text-crypta-pink animate-pulse text-sm">←</span>
          </div>

        </div>

      </div>
    </div>
  );
}
