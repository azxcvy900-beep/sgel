import React from 'react';
import { ShoppingBag, Check, Star, Eye } from 'lucide-react';
import { BookShelfCover } from './BookShelfCover';

export function CaseCard({ caseItem, onSelectCase, onAddToCart, isInCart, isPurchased }) {
  if (caseItem.isLocked) {
    return (
      <div className="bg-[#121318] border border-[#22242a] rounded-2xl p-4 flex flex-col justify-between opacity-80 select-none">
        <BookShelfCover caseItem={caseItem} />
        <div className="mt-4 pt-3 border-t border-[#22242a] flex items-center justify-between">
          <span className="text-xs text-stone-500 font-mono">قضية مغلقة</span>
          <span className="pill-btn-pink text-[10px] py-1 px-3">قريباً</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0e0f14] border border-[#22242a] hover:border-crypta-pink/50 rounded-2xl p-4 sm:p-5 flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1 shadow-lg">
      
      {/* Book Cover Showcase */}
      <div 
        onClick={() => onSelectCase(caseItem)}
        className="cursor-pointer mb-4"
      >
        <BookShelfCover caseItem={caseItem} />
      </div>

      {/* Book Info */}
      <div className="space-y-3">
        
        {/* Level Tag & Rating */}
        <div className="flex items-center justify-between text-xs">
          <span className="px-2.5 py-0.5 rounded-full bg-crypta-pink/20 text-crypta-pink border border-crypta-pink/30 text-[10px] font-bold">
            المستوى {caseItem.levelNumber}
          </span>

          <div className="flex items-center gap-1 text-crypta-yellow font-mono text-xs">
            <Star className="w-3.5 h-3.5 fill-crypta-yellow text-crypta-yellow" />
            <span className="font-bold">{caseItem.rating}</span>
            <span className="text-stone-500 text-[10px]">({caseItem.reviewsCount})</span>
          </div>
        </div>

        {/* Title & Subtitle */}
        <div>
          <h3 
            onClick={() => onSelectCase(caseItem)}
            className="text-base sm:text-lg font-black text-white group-hover:text-crypta-yellow transition cursor-pointer leading-snug line-clamp-1"
          >
            {caseItem.title}
          </h3>

          <p className="text-xs text-stone-400 line-clamp-2 mt-1 leading-relaxed">
            {caseItem.subtitle}
          </p>
        </div>

        {/* Specs Bar */}
        <div className="grid grid-cols-3 gap-2 py-2 px-2.5 rounded-xl bg-black border border-stone-850 text-[10px] font-mono text-stone-400 text-center">
          <div>
            <span className="text-crypta-yellow font-bold block">{caseItem.evidenceList.length}</span>
            <span>أحراز</span>
          </div>
          <div>
            <span className="text-white font-bold block">{caseItem.pages} ص</span>
            <span>كتاب PDF</span>
          </div>
          <div>
            <span className="text-crypta-pink font-bold block">{caseItem.difficulty}</span>
            <span>الصعوبة</span>
          </div>
        </div>

        {/* Price & Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-850">
          
          {/* Price */}
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black font-mono text-crypta-yellow">
                {caseItem.price} <span className="text-xs text-white font-sans">ر.س</span>
              </span>
              {caseItem.originalPrice && (
                <span className="text-xs text-stone-500 line-through font-mono">
                  {caseItem.originalPrice}
                </span>
              )}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSelectCase(caseItem)}
              className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 transition"
              title="معاينة القضية"
            >
              <Eye className="w-4 h-4" />
            </button>

            {isPurchased ? (
              <button
                type="button"
                onClick={() => onSelectCase(caseItem)}
                className="px-3.5 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>تم الشراء</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onAddToCart(caseItem)}
                className={`px-3.5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition ${
                  isInCart
                    ? 'bg-crypta-yellow text-black font-black'
                    : 'bg-gradient-to-r from-crypta-pink to-rose-700 hover:from-rose-500 hover:to-crypta-pink text-white shadow-pink-glow'
                }`}
              >
                {isInCart ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>في السلة</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>ضم للسلة</span>
                  </>
                )}
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
