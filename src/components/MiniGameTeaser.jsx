import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  HelpCircle, 
  CheckCircle, 
  XCircle, 
  Lightbulb, 
  Gift, 
  Copy, 
  Check, 
  ShieldAlert, 
  Award,
  Sparkles 
} from 'lucide-react';
import { MINI_GAME_PUZZLE } from '../data/casesData';

export function MiniGameTeaser({ onSolveSuccess, isAlreadySolved }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(isAlreadySolved);
  const [showClue, setShowClue] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  const handleSelect = (optionId) => {
    if (isSubmitted) return;
    setSelectedOption(optionId);
  };

  const handleSubmit = () => {
    if (!selectedOption) return;
    setIsSubmitted(true);
    const chosen = MINI_GAME_PUZZLE.options.find(o => o.id === selectedOption);
    
    if (chosen?.isCorrect) {
      confetti({
        particleCount: 110,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#fbbf24', '#34d399', '#ffffff']
      });
      if (onSolveSuccess) {
        onSolveSuccess(MINI_GAME_PUZZLE.discountCoupon);
      }
    }
  };

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText(MINI_GAME_PUZZLE.discountCoupon);
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2500);
  };

  const handleRetry = () => {
    setSelectedOption(null);
    setIsSubmitted(false);
    setShowClue(false);
  };

  const currentOption = MINI_GAME_PUZZLE.options.find(o => o.id === selectedOption);

  return (
    <section id="mini-game-section" className="py-20 bg-[#07080b] border-b border-white/[0.06] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-bold font-mono">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>تحدي استنتاج فوري</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
            {MINI_GAME_PUZZLE.title}
          </h2>
          <p className="text-stone-400 text-sm max-w-lg mx-auto">
            اثبت مهاراتك الاستنتاجية قبل الشراء واحصل فوراً على كوبون خصم 15% على أي كتاب رقمي!
          </p>
        </div>

        {/* Console Box */}
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-white/10 relative overflow-hidden">
          
          {/* Top Status */}
          <div className="flex items-center justify-between pb-5 border-b border-white/[0.08] mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-stone-300 font-bold uppercase tracking-wider">
                اختبار الذكاء الجنائي // مفتوح للجميع
              </span>
            </div>
            <span className="text-xs text-amber-400/90 font-mono bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
              مكافأة: خصم 15%
            </span>
          </div>

          {/* Crime Synopsis */}
          <div className="bg-white/[0.03] p-5 sm:p-6 rounded-2xl border border-white/[0.06] mb-6 space-y-3">
            <p className="text-stone-200 text-sm sm:text-base leading-relaxed font-sans">
              {MINI_GAME_PUZZLE.synopsis}
            </p>

            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-3">
              <span className="text-amber-300 font-bold text-sm sm:text-base flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                {MINI_GAME_PUZZLE.question}
              </span>

              <button
                type="button"
                onClick={() => setShowClue(!showClue)}
                className="text-xs text-stone-400 hover:text-amber-300 flex items-center gap-1 transition"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>{showClue ? "إخفاء التلميح" : "تلميح"}</span>
              </button>
            </div>

            {showClue && (
              <div className="mt-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>تلميح:</strong> {MINI_GAME_PUZZLE.clueHint}</span>
              </div>
            )}
          </div>

          {/* Suspect Options Lineup */}
          <div className="space-y-3 mb-6">
            {MINI_GAME_PUZZLE.options.map((opt) => {
              const isSelected = selectedOption === opt.id;
              let style = "bg-white/[0.02] border-white/[0.08] hover:border-amber-400/40 hover:bg-white/[0.04]";

              if (isSelected) {
                style = "bg-amber-400/10 border-amber-400/60 text-white shadow-lg shadow-amber-950/20";
              }
              if (isSubmitted) {
                if (opt.isCorrect) {
                  style = "bg-emerald-500/20 border-emerald-500 text-emerald-100";
                } else if (isSelected && !opt.isCorrect) {
                  style = "bg-rose-500/20 border-rose-500 text-rose-100";
                }
              }

              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  className={`p-4 rounded-xl border text-sm cursor-pointer transition flex items-start gap-3.5 ${style}`}
                >
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                    isSelected ? 'bg-amber-400 text-dark-950 font-black' : 'bg-white/[0.08] text-stone-300'
                  }`}>
                    {opt.id.toUpperCase()}
                  </span>
                  <span className="text-stone-200 leading-relaxed font-sans">
                    {opt.text}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Action CTAs & Results */}
          {!isSubmitted ? (
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={!selectedOption}
                className={`px-7 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition ${
                  selectedOption
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-dark-950 hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-950/30 cursor-pointer font-black'
                    : 'bg-white/[0.05] text-stone-500 cursor-not-allowed border border-white/[0.05]'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>تأكيد الاستنتاج الجنائي</span>
              </button>
            </div>
          ) : (
            <div>
              {currentOption?.isCorrect ? (
                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 space-y-4 animate-fadeIn">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
                    <Award className="w-5 h-5" />
                    <span>استنتاج عبقري! إجابتك صحيحة تماماً</span>
                  </div>
                  <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
                    {currentOption.explanation}
                  </p>

                  {/* Coupon Card */}
                  <div className="p-4 rounded-xl bg-dark-950 border border-amber-400/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                        <Gift className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[11px] text-stone-400">كوبون الخصم الخاص بك (15%):</div>
                        <div className="text-lg font-mono font-black text-amber-300 tracking-wider">
                          {MINI_GAME_PUZZLE.discountCoupon}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleCopyCoupon}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold flex items-center justify-center gap-2 transition"
                    >
                      {copiedCoupon ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>تم النسخ بنجاح!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>نسخ الكود</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/40 space-y-3">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
                    <XCircle className="w-5 h-5" />
                    <span>استنتاج غير دقيق! الجاني استطاع تضليلك هذه المرة</span>
                  </div>
                  <p className="text-stone-300 text-xs sm:text-sm">
                    ركز في الأدلة وأعد التفكير: ما الذي لم يكن مشتركاً بين كؤوس الجميع؟
                  </p>
                  <button
                    onClick={handleRetry}
                    className="px-5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-amber-300 border border-white/10 text-xs font-bold transition"
                  >
                    إعادة المحاولة
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
