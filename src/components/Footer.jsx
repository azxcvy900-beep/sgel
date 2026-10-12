import React from 'react';
import { Mail, ShieldCheck, Sparkles } from 'lucide-react';

export function Footer({ onScrollToCases, onScrollToMiniGame, onOpenSolutionVault }) {
  return (
    <footer className="bg-[#07080b] border-t border-white/[0.06] pt-16 pb-12 text-stone-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">📂</span>
              <span className="text-2xl font-black font-display text-white">سِـجِـلّ</span>
              <span className="text-[10px] bg-white/[0.06] text-amber-300 px-2 py-0.5 rounded border border-white/10 font-mono font-bold">
                DOSSIER
              </span>
            </div>

            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed max-w-md font-light">
              المنصة المتخصصة الأولى في نشر وبيع الكتب الرقمية البوليسية وألغاز التحقيق الجنائي بطابع واقعي عالي الدقة، مع ملفات حلول مختومة أمنياً تحمي متعة التفكير.
            </p>

            <div className="flex items-center gap-3 text-xs text-stone-500 font-mono">
              <span>تشفير أمني 256-Bit</span>
              <span>•</span>
              <span>تحميل فوري PDF</span>
              <span>•</span>
              <span>ألغاز حصرية معتمدة</span>
            </div>
          </div>

          {/* Links Col */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
              أقسام المنصة
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={onScrollToCases} className="hover:text-white transition">
                  كتالوج كتب القضايا
                </button>
              </li>
              <li>
                <button onClick={onOpenSolutionVault} className="hover:text-white transition">
                  خزينة الحلول والشيفرات
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Col */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
              التواصل والدعم
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed font-light">
              هل لديك استفسار حول ملفات القضايا أو ترغب بنشر كتاب ألغاز خاص بك؟
            </p>
            <div className="text-xs text-amber-300 font-mono flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-400" />
              <span>archive@sijill-dossier.com</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
          <p>© {new Date().getFullYear()} سِجِلّ (Sijill Dossier) - جميع الحقوق محفوظة.</p>
          <p>جميع القضايا المطروحة هي ألغاز إبداعية مصممة للتسلية وتنمية التفكير المنطقي.</p>
        </div>

      </div>
    </footer>
  );
}
