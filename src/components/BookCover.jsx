import React from 'react';
import { Star, ShieldAlert, Sparkles, FileText } from 'lucide-react';

export function BookCover({ caseItem, size = 'md', className = '' }) {
  const theme = caseItem.coverTheme || {
    gradient: 'from-[#1e1022] via-[#120914] to-[#070508]',
    accent: 'text-amber-400',
    borderAccent: 'border-amber-500/30',
    symbol: '🔍',
    categoryBadge: 'ملف تحقيق'
  };

  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  return (
    <div className={`relative group/book select-none ${className}`}>
      
      {/* 3D Book Container with Shadow */}
      <div 
        className={`relative rounded-r-lg rounded-l-sm overflow-hidden bg-gradient-to-br ${theme.gradient} shadow-book group-hover/book:shadow-book-hover transition-all duration-500 transform group-hover/book:-translate-y-1.5 border border-white/10 ${
          isSmall ? 'w-28 h-40' : isLarge ? 'w-64 h-96' : 'w-full aspect-[1/1.45]'
        }`}
      >
        
        {/* Book Spine (Right edge for Arabic book binding) */}
        <div className="book-spine" />
        <div className="book-shadow-edge" />

        {/* Diagonal Lighting Sheen */}
        <div className="book-cover-sheen" />

        {/* Outer Embossed Gold/Foil Border */}
        <div className="absolute inset-2.5 rounded border border-amber-400/25 pointer-events-none flex flex-col justify-between p-3">
          
          {/* Inner hairline border */}
          <div className="absolute inset-1 rounded-sm border border-amber-400/15 pointer-events-none" />

          {/* Top Header of Cover: Dossier stamp & Category */}
          <div className="relative z-10 flex items-center justify-between text-[9px] font-mono tracking-wider">
            <span className="text-amber-300/80 font-bold uppercase tracking-widest pl-2">
              {caseItem.caseNumber}
            </span>
            <span className="text-[8px] bg-white/10 text-stone-300 px-1.5 py-0.5 rounded backdrop-blur-sm border border-white/10">
              {theme.categoryBadge}
            </span>
          </div>

          {/* Center Title & Mystery Emblem */}
          <div className="relative z-10 my-auto text-center py-2 px-1">
            
            {/* Mystery Emblem */}
            <div className="w-11 h-11 mx-auto mb-2 rounded-full bg-gradient-to-br from-amber-400/20 to-black/60 border border-amber-400/40 flex items-center justify-center text-xl shadow-inner backdrop-blur-md">
              <span>{theme.symbol || '🔍'}</span>
            </div>

            {/* Embossed Title */}
            <h3 className={`font-black font-display text-white tracking-wide leading-tight mb-1 drop-shadow-md ${
              isSmall ? 'text-xs' : isLarge ? 'text-2xl' : 'text-lg sm:text-xl'
            }`}>
              {caseItem.title}
            </h3>

            {/* Subtitle / Teaser */}
            <p className={`text-stone-300/80 font-sans line-clamp-2 leading-relaxed ${
              isSmall ? 'text-[8px]' : 'text-[11px]'
            }`}>
              {caseItem.subtitle}
            </p>
          </div>

          {/* Bottom Cover Footer: Seal & Page count */}
          <div className="relative z-10 pt-2 border-t border-amber-400/20 flex items-center justify-between text-[9px] font-mono text-stone-400">
            <span className="text-amber-300 font-bold">سِـجِـلّ | DOSSIER</span>
            <span className="text-stone-300">{caseItem.pages} ص</span>
          </div>

        </div>

        {/* Decorative Luxury Ribbon Bookmark hanging from bottom */}
        <div className="absolute top-0 left-6 w-3.5 h-10 bg-gradient-to-b from-rose-700 to-rose-900 shadow-md border-x border-rose-500/30 rounded-b-sm pointer-events-none" />

      </div>

    </div>
  );
}
