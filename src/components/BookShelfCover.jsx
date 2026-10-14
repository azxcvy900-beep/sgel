import React from 'react';

export function BookShelfCover({ caseItem }) {
  // If custom cover image is uploaded/provided
  if (caseItem.coverImage) {
    return (
      <div className="w-full aspect-[1/1.55] rounded-xl overflow-hidden relative shadow-card-shelf border border-white/10 group-hover:border-crypta-pink/60 transition-all duration-300 bg-stone-950">
        <img 
          src={caseItem.coverImage} 
          alt={caseItem.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2 text-right pointer-events-none">
          <span className="text-[10px] font-bold text-white line-clamp-1">{caseItem.title}</span>
          <span className="text-[9px] font-mono text-crypta-yellow font-bold">
            {Number(caseItem.price) === 0 ? '🎁 مجاناً' : `${Number(caseItem.price).toFixed(Number(caseItem.price) % 1 === 0 ? 0 : 2)} ر.س`}
          </span>
        </div>
      </div>
    );
  }

  if (caseItem.isLocked) {
    // Locked / Upcoming Book (Cases 6 to 10)
    return (
      <div className="w-full aspect-[1/1.55] rounded-xl bg-[#14151a] border border-[#2a2c35] relative overflow-hidden flex flex-col justify-between p-3 select-none group-hover:border-crypta-pink/50 transition">
        {/* Angled White Grid Lines from the mockup */}
        <div className="absolute inset-0 opacity-25 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 150" preserveAspectRatio="none">
            <line x1="10" y1="90" x2="90" y2="90" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="50" y1="90" x2="90" y2="150" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="50" y1="90" x2="10" y2="150" stroke="#ffffff" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Lock Icon */}
        <div className="relative z-10 flex justify-end">
          <span className="text-stone-500 text-xs">🔒</span>
        </div>

        <div className="relative z-10 text-center my-auto">
          <div className="text-stone-500 text-xs font-mono mb-1">{caseItem.caseNumber}</div>
          <div className="text-stone-400 font-bold text-xs line-clamp-1">{caseItem.title}</div>
        </div>

        <div className="relative z-10 text-[9px] text-stone-600 font-mono text-center">
          قريباً
        </div>
      </div>
    );
  }

  // Active Books 1 to 5
  return (
    <div className="w-full aspect-[1/1.55] rounded-xl overflow-hidden relative select-none shadow-card-shelf border border-white/10 group-hover:border-crypta-pink/60 transition-all duration-300">
      
      {/* 1. قضية الحي الهادئ */}
      {caseItem.levelNumber === 1 && (
        <div className="w-full h-full bg-gradient-to-b from-[#2b1b05] via-[#120d06] to-[#040404] p-3 flex flex-col justify-between relative">
          {/* Streetlamp yellow cone glow */}
          <div className="absolute top-0 right-1/4 w-32 h-32 bg-amber-500/30 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex justify-between items-start text-[8px] font-mono text-amber-300/80">
            <span>رقم القضية: 001</span>
            <span className="w-4 h-4 rounded-full border border-amber-400 flex items-center justify-center text-[7px] font-bold">15/1</span>
          </div>

          <div className="relative z-10 text-center my-auto space-y-1">
            <div className="text-3xl filter drop-shadow">🏮</div>
            <div className="bg-red-700 text-white font-bold text-[11px] py-1 px-2 rounded-sm shadow-md uppercase tracking-wider">
              جريمة في الحي الهادئ
            </div>
          </div>

          <div className="relative z-10 text-center text-[8px] text-stone-400 font-mono">
            أرشيف سجل الجنائي
          </div>
        </div>
      )}

      {/* 2. قضية الجوهرة المختفية */}
      {caseItem.levelNumber === 2 && (
        <div className="w-full h-full bg-gradient-to-b from-[#0a192f] via-[#050c18] to-[#020509] p-3 flex flex-col justify-between relative">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-28 h-28 bg-cyan-400/25 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex justify-between items-start text-[8px] font-mono text-cyan-300/80">
            <span>لغز الجوهرة المختفية</span>
            <span className="w-4 h-4 rounded-full border border-amber-400 text-amber-300 flex items-center justify-center text-[7px] font-bold">15/1</span>
          </div>

          <div className="relative z-10 text-center my-auto space-y-2">
            <div className="text-4xl filter drop-shadow-[0_0_15px_rgba(56,189,248,0.8)] animate-pulse">
              💎
            </div>
            <div className="text-white font-black text-xs drop-shadow-md">
              قضية الجوهرة المختفية
            </div>
            <div className="text-stone-400 text-[8px]">
              سرقة من داخل القفص الزجاجي
            </div>
          </div>

          <div className="relative z-10 text-center text-[8px] text-cyan-400 font-mono">
            CLASSIFIED DOSSIER
          </div>
        </div>
      )}

      {/* 3. لغز القتيل في الفندق */}
      {caseItem.levelNumber === 3 && (
        <div className="w-full h-full bg-gradient-to-b from-[#1c1917] via-[#121110] to-[#050505] p-3 flex flex-col justify-between relative">
          <div className="absolute top-1/3 right-1/4 w-28 h-28 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex justify-between items-start text-[8px] font-mono text-stone-400">
            <span>2016/5/20</span>
            <span className="px-1 py-0.2 border border-amber-400/60 text-amber-400 text-[7px]">ROOM 704</span>
          </div>

          <div className="relative z-10 text-center my-auto space-y-2">
            <div className="text-3xl filter drop-shadow">🚪👤</div>
            <div className="text-white font-black text-xs">
              قضية "لغز القتيل في الفندق"
            </div>
            <div className="text-amber-400 text-[8px] font-mono">
              جريمة الغرفة المغلقة
            </div>
          </div>

          <div className="relative z-10 text-center text-[8px] text-stone-500 font-mono">
            ملف تحقيق رسمي
          </div>
        </div>
      )}

      {/* 4. قضية اختفاء المصور */}
      {caseItem.levelNumber === 4 && (
        <div className="w-full h-full bg-gradient-to-b from-[#0e2a38] via-[#091821] to-[#020508] p-3 flex flex-col justify-between relative">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-24 h-24 bg-rose-600/30 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex justify-between items-start text-[8px] font-mono text-stone-300">
            <span className="text-rose-400 font-bold">2016/5/16</span>
            <span className="text-stone-400">X-7 FILE</span>
          </div>

          <div className="relative z-10 text-center my-auto space-y-1">
            <div className="text-3xl filter drop-shadow">📷❓</div>
            <div className="text-cyan-300 font-black text-xs">
              قضية "اختفاء المصور"
            </div>
            <div className="text-rose-400 text-[8px] font-mono font-bold">
              الصورة المتبقية الأخيرة
            </div>
          </div>

          <div className="relative z-10 text-center text-[8px] text-stone-500 font-mono">
            SECRET EVIDENCE
          </div>
        </div>
      )}

      {/* 5. قضية الساعة المفقودة */}
      {caseItem.levelNumber === 5 && (
        <div className="w-full h-full bg-gradient-to-b from-[#2e1d0c] via-[#1a1107] to-[#040301] p-3 flex flex-col justify-between relative">
          <div className="absolute top-1/4 right-1/3 w-28 h-28 bg-amber-500/25 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex justify-between items-start text-[8px] font-mono text-amber-300/80">
            <span>ملف القضية #005</span>
            <span>1924</span>
          </div>

          <div className="relative z-10 text-center my-auto space-y-1.5">
            <div className="text-3xl filter drop-shadow">⏱️📜</div>
            <div className="bg-amber-950/80 border border-amber-600/50 text-amber-200 font-black text-[10px] py-1 px-1.5 rounded">
              قضية "الساعة المفقودة"
            </div>
            <div className="text-stone-400 text-[8px]">
              الشيفرة الميكانيكية العتيقة
            </div>
          </div>

          <div className="relative z-10 text-center text-[8px] text-amber-500 font-mono">
            أرشيف سجل
          </div>
        </div>
      )}

    </div>
  );
}
