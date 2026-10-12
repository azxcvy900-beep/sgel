import React, { useState } from 'react';
import { 
  X, 
  KeyRound, 
  Lock, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

export function SolutionVaultModal({ 
  isOpen, 
  onClose, 
  cases, 
  unlockedSolutions, 
  onUnlockSolution 
}) {
  const [selectedCaseId, setSelectedCaseId] = useState(cases[0]?.id || '');
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isOpen) return null;

  const currentCase = cases.find(c => c.id === selectedCaseId);
  const isUnlocked = currentCase && unlockedSolutions.includes(currentCase.id);

  const handleBreakSeal = () => {
    if (!currentCase) return;
    onUnlockSolution(currentCase.id);
    setShowConfirm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-dark-900 border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-2 sm:my-8 max-h-[95vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 bg-dark-950 border-b border-white/[0.08] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <KeyRound className="w-5 h-5 text-amber-400" />
            <h3 className="text-base sm:text-lg font-bold font-display text-white">
              خزينة الحلول والشيفرات
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-stone-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          
          {/* Select Case Dropdown */}
          <div>
            <label className="block text-xs font-mono text-stone-400 mb-2">
              اختر القضية لعرض ملف حلها المعتمد:
            </label>
            <select
              value={selectedCaseId}
              onChange={(e) => {
                setSelectedCaseId(e.target.value);
                setShowConfirm(false);
              }}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-stone-200 focus:outline-none focus:border-amber-400/60 font-sans cursor-pointer"
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id} className="bg-dark-950 text-white">
                  {c.caseNumber} - {c.title} ({c.difficulty})
                </option>
              ))}
            </select>
          </div>

          {currentCase && (
            <div className="space-y-6">
              
              {/* Selected Case Summary */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-amber-400 font-bold">{currentCase.caseNumber}</span>
                  <h4 className="text-base font-bold text-white font-display">{currentCase.title}</h4>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-white/[0.06] text-stone-300 font-mono">
                  {currentCase.difficulty}
                </span>
              </div>

              {/* Locked vs Unlocked */}
              {!isUnlocked ? (
                <div className="p-8 rounded-3xl bg-rose-950/20 border border-rose-500/30 text-center space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                    <Lock className="w-7 h-7" />
                  </div>

                  <div>
                    <h4 className="text-xl font-bold font-display text-white">
                      ملف الحل مشفر ومختوم أمنياً
                    </h4>
                    <p className="text-stone-300 text-xs sm:text-sm max-w-md mx-auto mt-2 leading-relaxed">
                      هل تأكدت من تحليل جميع الأدلة وإفادات الشهود؟ كسر هذا الختم سيكشف الجاني الحقيقي.
                    </p>
                  </div>

                  {!showConfirm ? (
                    <button
                      onClick={() => setShowConfirm(true)}
                      className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-rose-950/40 transition"
                    >
                      فك تشفير الحل وكسر الختم
                    </button>
                  ) : (
                    <div className="p-4 rounded-2xl bg-amber-400/10 border border-amber-400/30 max-w-md mx-auto space-y-3">
                      <div className="flex items-center justify-center gap-2 text-amber-300 font-bold text-xs">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <span>تأكيد نهائي: هل تريد معرفة الحل الآن؟</span>
                      </div>
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={handleBreakSeal}
                          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition"
                        >
                          نعم، افتح الحل
                        </button>
                        <button
                          onClick={() => setShowConfirm(false)}
                          className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.1] text-stone-200 text-xs transition"
                        >
                          تراجع
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-6 rounded-2xl bg-white/[0.03] border border-emerald-500/30 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>تقرير الحل النهائي المعتمد</span>
                      </div>
                      <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                        مفكك الشفرة
                      </span>
                    </div>

                    <div>
                      <div className="text-xs text-stone-400 mb-1">الجاني المدان:</div>
                      <div className="text-xl font-bold text-rose-400 font-display">
                        {currentCase.solution.culprit}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-stone-400 mb-1">الدافع الجنائي:</div>
                      <div className="text-sm text-stone-200">
                        {currentCase.solution.motive}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-stone-400 mb-1">طريقة التنفيذ:</div>
                      <div className="text-xs sm:text-sm text-stone-300 leading-relaxed bg-white/[0.02] p-4 rounded-xl border border-white/[0.04]">
                        {currentCase.solution.method}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-stone-400 mb-2">سلسلة الاستنتاج:</div>
                      <div className="space-y-2">
                        {currentCase.solution.deductionSteps.map((step, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-white/[0.02] text-xs text-stone-300 border border-white/[0.04]">
                            {step}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
