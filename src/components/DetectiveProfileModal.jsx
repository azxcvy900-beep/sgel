import React from 'react';
import { 
  X, 
  Award, 
  DownloadCloud, 
  FolderArchive, 
  Eye, 
  FileText 
} from 'lucide-react';
import { generateCasePdf, downloadCaseFile } from '../utils/pdfGenerator';
import { DETECTIVE_RANKS } from '../data/casesData';

export function DetectiveProfileModal({ 
  isOpen, 
  onClose, 
  userRank, 
  purchasedCases, 
  unlockedSolutions, 
  onInspectCase 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-dark-900 border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-2 sm:my-8 max-h-[95vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 bg-dark-950 border-b border-white/[0.08] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <FolderArchive className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base sm:text-lg font-bold font-display text-white">
              أرشيف المحقق الشخصي
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-stone-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          
          {/* Rank Badge Card */}
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4 text-center sm:text-right">
              <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-3xl shrink-0 shadow-inner">
                {userRank?.badge || '🔍'}
              </div>
              <div>
                <div className="text-xs text-stone-400 font-mono">رتبتك الجنائية الحالية:</div>
                <div className="text-2xl font-bold font-display text-white">
                  {userRank?.name || 'محقق متدرب'}
                </div>
                <div className="text-xs text-stone-400 mt-1">
                  الملفات المقتناة: <strong className="text-white">{purchasedCases.length}</strong> | الحلول المفككة: <strong className="text-white">{unlockedSolutions.length}</strong>
                </div>
              </div>
            </div>

            {/* Ranks Ladder */}
            <div className="text-xs space-y-1.5 text-stone-400 font-mono bg-dark-950 p-3.5 rounded-xl border border-white/[0.06] w-full sm:w-auto">
              <div className="text-amber-400 font-bold mb-1">سلّم الترقيات:</div>
              {DETECTIVE_RANKS.map((r) => (
                <div key={r.id} className="flex items-center gap-2">
                  <span>{r.badge}</span>
                  <span className={userRank?.id === r.id ? "text-amber-300 font-bold" : "text-stone-500"}>
                    {r.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Purchased Dossiers Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>ملفات الكتب في أرشيفك ({purchasedCases.length})</span>
            </h4>

            {purchasedCases.length === 0 ? (
              <div className="text-center py-12 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                <span className="text-3xl block">📁</span>
                <p className="text-stone-300 font-bold text-sm">لم تقتنِ أي كتب ألغاز بعد</p>
                <p className="text-xs text-stone-500">
                  تصفح الكتالوج واختر القضايا التي تود حلها لكشف الجناة.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {purchasedCases.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-amber-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono text-amber-400 font-bold">
                          {c.caseNumber}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-stone-400">
                          {c.difficulty}
                        </span>
                      </div>
                      <h5 className="text-base font-bold text-white leading-snug">
                        {c.title}
                      </h5>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          onClose();
                          onInspectCase(c);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-stone-200 text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>معاينة</span>
                      </button>

                      <button
                        onClick={() => downloadCaseFile(c)}
                        className="px-3.5 py-2 rounded-xl bg-crypta-yellow hover:bg-yellow-400 text-black text-xs font-black transition flex items-center gap-1.5 shadow"
                      >
                        <DownloadCloud className="w-3.5 h-3.5" />
                        <span>{c.fileData?.includes('zip') || c.fileName?.endsWith('.zip') ? 'تحميل ZIP' : 'تحميل الملف'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
