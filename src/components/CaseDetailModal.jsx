import React, { useState } from 'react';
import { 
  X, 
  DownloadCloud, 
  ShoppingBag, 
  Check, 
  Lock, 
  Unlock, 
  Lightbulb, 
  AlertTriangle, 
  ShieldAlert, 
  Eye, 
  FileText,
  UserCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { generateCasePdf, downloadCaseFile } from '../utils/pdfGenerator';
import { BookCover } from './BookCover';
import { openPayhipCheckout } from '../utils/payhip';

export function CaseDetailModal({ 
  caseItem, 
  onClose, 
  onAddToCart, 
  isInCart, 
  isPurchased,
  onUnlockSolution,
  onDirectDownload
}) {
  const [activeTab, setActiveTab] = useState('overview'); // overview, suspects, hints, solution
  const [unlockedHints, setUnlockedHints] = useState({});
  const [isSolutionRevealed, setIsSolutionRevealed] = useState(false);
  const [confirmRevealSolution, setConfirmRevealSolution] = useState(false);

  if (!caseItem) return null;

  const handleToggleHint = (level) => {
    setUnlockedHints(prev => ({
      ...prev,
      [level]: !prev[level]
    }));
  };

  const handleDownloadPdf = () => {
    if (onDirectDownload) {
      onDirectDownload(caseItem);
    } else {
      downloadCaseFile(caseItem);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-black/85 backdrop-blur-md">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-dark-900 border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-2 sm:my-8 max-h-[95vh] flex flex-col">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-dark-950 border-b border-white/[0.08] shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-amber-400">
              {caseItem.caseNumber}
            </span>
            <span className="text-stone-600 text-xs">•</span>
            <span className="text-xs text-stone-300">
              {caseItem.classification}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-stone-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          
          {/* Top Section: 3D Book Cover & Book Meta */}
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start pb-6 border-b border-white/[0.08]">
            
            {/* 3D Cover */}
            <div className="shrink-0">
              <BookCover caseItem={caseItem} size="sm" />
            </div>

            {/* Book Info */}
            <div className="space-y-3 flex-1 text-center sm:text-right">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  مستوى: {caseItem.difficulty}
                </span>
                <span className="text-xs text-stone-400 font-mono">
                  ⏳ {caseItem.estimatedSolveTime}
                </span>
                <span className="text-xs text-stone-400 font-mono">
                  📄 {caseItem.pages} صفحة
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black font-display text-white">
                {caseItem.title}
              </h2>

              <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
                {caseItem.subtitle}
              </p>
            </div>

          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-white/[0.08] overflow-x-auto gap-3 text-xs sm:text-sm font-semibold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 px-2 transition shrink-0 flex items-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'border-b-2 border-amber-400 text-amber-300'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>الأدلة ومسرح الحادثة</span>
            </button>

            <button
              onClick={() => setActiveTab('suspects')}
              className={`pb-3 px-2 transition shrink-0 flex items-center gap-1.5 ${
                activeTab === 'suspects'
                  ? 'border-b-2 border-amber-400 text-amber-300'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>المشتبه بهم ({caseItem.suspects?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('hints')}
              className={`pb-3 px-2 transition shrink-0 flex items-center gap-1.5 ${
                activeTab === 'hints'
                  ? 'border-b-2 border-amber-400 text-amber-300'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>نظام التلميحات ({caseItem.hints?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('solution')}
              className={`pb-3 px-2 transition shrink-0 flex items-center gap-1.5 ${
                activeTab === 'solution'
                  ? 'border-b-2 border-rose-500 text-rose-400'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Lock className="w-4 h-4 text-rose-400" />
              <span>الحل المختوم</span>
            </button>
          </div>

          {/* Tab 1: Crime Scene & Evidence */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                <div className="text-xs font-mono font-bold text-amber-400 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>ملابسات الواقعة وظروف الجريمة</span>
                </div>
                <p className="text-stone-200 text-sm sm:text-base leading-relaxed font-sans font-light">
                  {caseItem.synopsis}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-3">
                  الأحراز والأدلة الجنائية المادية ({caseItem.evidenceList?.length || 0})
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(caseItem.evidenceList || []).map((ev, idx) => (
                    <div 
                      key={ev.id || idx}
                      className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-amber-400/30 transition"
                    >
                      <div className="flex items-center gap-2 text-amber-300 font-bold text-xs sm:text-sm mb-1.5">
                        <span className="w-5 h-5 rounded-md bg-amber-400/10 text-amber-400 flex items-center justify-center text-xs font-mono">
                          {idx + 1}
                        </span>
                        <span>{ev.title}</span>
                      </div>
                      <p className="text-stone-300 text-xs leading-relaxed">
                        {ev.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Tab 2: Suspects */}
          {activeTab === 'suspects' && (
            <div className="space-y-3 animate-fadeIn">
              {(caseItem.suspects || []).map((s, idx) => (
                <div 
                  key={idx}
                  className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <h4 className="font-bold text-white text-base flex items-center gap-2">
                      <span>{s.name}</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/[0.06] text-stone-300 font-normal">
                        {s.role}
                      </span>
                    </h4>

                    {/* Suspicion Meter */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-400 font-mono">مؤشر الشبهة:</span>
                      <div className="w-24 bg-white/[0.08] h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-amber-400 to-rose-500 h-full rounded-full"
                          style={{ width: `${s.suspicionScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono font-bold text-rose-400">
                        {s.suspicionScore}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs sm:text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-stone-400 shrink-0 font-bold">حجة الغياب:</span>
                      <span className="text-stone-300">{s.alibi}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-rose-400 shrink-0 font-bold">الدافع:</span>
                      <span className="text-stone-300">{s.motive}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Tiered Hints */}
          {activeTab === 'hints' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-amber-400/10 border border-amber-400/20 text-xs text-amber-200">
                <strong>نظام التلميحات المتدرجة:</strong> اقرأ المستوى الأول أولاً، وتدرج تدريجياً لتحافظ على متعة الاستنتاج بنفسك.
              </div>

              <div className="space-y-3">
                {(caseItem.hints || []).map((h) => {
                  const isRevealed = unlockedHints[h.level];

                  return (
                    <div 
                      key={h.level}
                      className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono font-bold text-amber-300">
                          المستوى {h.level}: {h.title}
                        </span>

                        <button
                          onClick={() => handleToggleHint(h.level)}
                          className="px-3.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-stone-200 text-xs font-bold transition flex items-center gap-1.5"
                        >
                          {isRevealed ? (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>إخفاء</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3.5 h-3.5 text-amber-400" />
                              <span>إظهار التلميح</span>
                            </>
                          )}
                        </button>
                      </div>

                      {isRevealed ? (
                        <p className="text-sm text-stone-200 mt-3 pt-3 border-t border-white/[0.06] leading-relaxed animate-fadeIn">
                          {h.hint}
                        </p>
                      ) : (
                        <p className="text-xs text-stone-500 italic mt-2">
                          [التلميح مشفّر - اضغط إظهار التلميح للقراءة]
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 4: Sealed Solution */}
          {activeTab === 'solution' && (
            <div className="space-y-6 animate-fadeIn">
              {!isSolutionRevealed && !confirmRevealSolution && (
                <div className="p-8 rounded-3xl bg-rose-950/20 border border-rose-500/30 text-center space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                    <Lock className="w-7 h-7" />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold font-display text-white">
                      ختم الحل السري المعتمد
                    </h3>
                    <p className="text-stone-300 text-xs sm:text-sm max-w-md mx-auto mt-2 leading-relaxed">
                      هذا القسم يحتوي على كشف الجاني الحقيقي والحل الكامل. كسر الختم سيكشف القاتل نهائياً.
                    </p>
                  </div>

                  <button
                    onClick={() => setConfirmRevealSolution(true)}
                    className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-rose-950/40 transition"
                  >
                    كسر الختم وفك تشفير الحل
                  </button>
                </div>
              )}

              {confirmRevealSolution && !isSolutionRevealed && (
                <div className="p-6 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-center space-y-4">
                  <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
                  <h4 className="text-base font-bold text-amber-200">
                    هل أنت متأكد من رغبتك في كشف الحل الآن؟
                  </h4>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        setIsSolutionRevealed(true);
                        setConfirmRevealSolution(false);
                        if (onUnlockSolution) onUnlockSolution(caseItem.id);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-500 transition"
                    >
                      نعم، اكشف الجاني والحل
                    </button>
                    <button
                      onClick={() => setConfirmRevealSolution(false)}
                      className="px-4 py-2.5 rounded-xl bg-white/[0.08] text-stone-200 text-xs transition"
                    >
                      تراجع
                    </button>
                  </div>
                </div>
              )}

              {isSolutionRevealed && (
                <div className="p-6 rounded-2xl bg-white/[0.03] border border-emerald-500/30 space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>الحل الرسمي المعتمد</span>
                    </span>
                    <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                      تم فك التشفير
                    </span>
                  </div>

                  <div>
                    <div className="text-xs text-stone-400 mb-1">الجاني المدان:</div>
                    <div className="text-xl font-bold text-rose-400 font-display">
                      {caseItem.solution?.culprit || 'مُسجل في تقرير الحل'}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-stone-400 mb-1">الدافع:</div>
                    <div className="text-sm text-stone-200">
                      {caseItem.solution?.motive || 'دافع جنائي مشفر'}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-stone-400 mb-1">طريقة التنفيذ:</div>
                    <div className="text-xs sm:text-sm text-stone-200 leading-relaxed bg-white/[0.02] p-4 rounded-xl border border-white/[0.05]">
                      {caseItem.solution?.method || caseItem.synopsis || 'تحليل جنائي'}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-stone-400 mb-2">سلسلة الاستنتاج:</div>
                    <div className="space-y-2">
                      {(caseItem.solution?.deductionSteps || ['1. فحص مسرح الحادثة', '2. مطابقة الإفادات']).map((step, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-white/[0.02] text-xs text-stone-300 border border-white/[0.04]">
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-dark-950 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          
          {/* Price */}
          <div className="flex items-baseline gap-2">
            {Number(caseItem.price) === 0 ? (
              <span className="text-2xl font-black font-mono text-emerald-400 flex items-center gap-1.5">
                <span>🎁</span>
                <span>مجاناً</span>
                <span className="text-xs font-sans text-emerald-500/80 font-normal">(0.00 ر.س)</span>
              </span>
            ) : (
              <span className="text-2xl font-black font-mono text-white">
                {Number(caseItem.price).toFixed(Number(caseItem.price) % 1 === 0 ? 0 : 2)} <span className="text-xs font-sans text-amber-400">ر.س</span>
              </span>
            )}
            {caseItem.originalPrice && Number(caseItem.originalPrice) > Number(caseItem.price) && (
              <span className="text-xs text-stone-500 line-through font-mono">
                {Number(caseItem.originalPrice).toFixed(Number(caseItem.originalPrice) % 1 === 0 ? 0 : 2)} ر.س
              </span>
            )}
          </div>

          {/* Action CTA - Exactly ONE unified action */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isPurchased ? (
              <button
                onClick={handleDownloadPdf}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition shadow-lg shadow-emerald-950/30"
              >
                <DownloadCloud className="w-4 h-4 text-emerald-400" />
                <span>تحميل ملف القضية (ضمن أرشيفك)</span>
              </button>
            ) : Number(caseItem.price) === 0 ? (
              <button
                onClick={handleDownloadPdf}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xl shadow-emerald-950/40 text-xs font-bold transition"
              >
                <DownloadCloud className="w-4 h-4 text-emerald-200" />
                <span>احصل عليها مجاناً (تحميل فوري)</span>
              </button>
            ) : caseItem.payhipUrl ? (
              <button
                onClick={() => openPayhipCheckout(caseItem.payhipUrl)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-dark-950 font-black shadow-xl shadow-amber-950/40 text-xs transition"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>شراء الآن عبر Payhip ({Number(caseItem.price).toFixed(Number(caseItem.price) % 1 === 0 ? 0 : 2)} ر.س)</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onAddToCart(caseItem);
                  onClose();
                }}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition ${
                  isInCart
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                    : 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-xl shadow-rose-950/40'
                }`}
              >
                {isInCart ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>تمت الإضافة للسلة</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>ضم القضية للسلة</span>
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
