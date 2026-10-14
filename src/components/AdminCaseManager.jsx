import React, { useState } from 'react';
import { 
  X, 
  PlusCircle, 
  Check 
} from 'lucide-react';

export function AdminCaseManager({ isOpen, onClose, onAddCase }) {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    caseNumber: `CASE #${Math.floor(700 + Math.random() * 200)}-س`,
    price: 35,
    originalPrice: 50,
    difficulty: 'متمرس',
    pages: 45,
    estimatedSolveTime: 'ساعتان ونصف',
    classification: 'سري للغاية',
    synopsis: '',
    culprit: '',
    motive: '',
    method: '',
    tags: 'غموض, تشفير, تحقيق',
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.synopsis) return;

    const newCase = {
      id: `case-${Date.now()}`,
      caseNumber: formData.caseNumber,
      title: formData.title,
      subtitle: formData.subtitle || 'قضية جنائية مشفرة',
      price: Number(formData.price),
      originalPrice: Number(formData.originalPrice),
      difficulty: formData.difficulty,
      pages: Number(formData.pages),
      fileSize: '4.5 MB',
      estimatedSolveTime: formData.estimatedSolveTime,
      classification: formData.classification,
      rating: 5.0,
      reviewsCount: 1,
      isFeatured: false,
      coverTheme: {
        gradient: 'from-[#1c1917] via-[#141210] to-[#09090b]',
        accent: 'text-amber-400',
        borderAccent: 'border-amber-500/30',
        goldFoil: true,
        symbol: '🔍',
        categoryBadge: 'قضية حديثة'
      },
      synopsis: formData.synopsis,
      evidenceList: [
        { id: 1, title: 'الدليل الأول', description: 'حرز مادي تم تحريزه في مسرح الحادثة.' }
      ],
      suspects: [
        {
          name: formData.culprit || 'المشتبه به الأول',
          role: 'المتهم الأول',
          alibi: 'حجة غياب غير مثبتة.',
          motive: formData.motive || 'دافع مالي وانتقامي.',
          suspicionScore: 90
        }
      ],
      hints: [
        {
          level: 1,
          title: 'تلميح مبدئي',
          hint: 'دقق في التوقيت والأدلة المادية.'
        },
        {
          level: 2,
          title: 'تلميح متقدم',
          hint: 'هناك تناقض صريح في إفادة المتهم.'
        },
        {
          level: 3,
          title: 'كشف الحل',
          hint: `الجاني هو ${formData.culprit || 'المشتبه به'}.`
        }
      ],
      solution: {
        culprit: formData.culprit || 'الجاني',
        motive: formData.motive || 'دافع انتقامي',
        method: formData.method || 'تم ارتكاب الجريمة وفق المعطيات الجنائية المحرزة.',
        deductionSteps: [
          '1. تحليل توقيت الأحراز واستبعاد الفرضيات.',
          '2. مطابقة الإفادات مع تقرير الطب الشرعي.',
          '3. إثبات الإدانة القاطعة.'
        ]
      },
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    };

    onAddCase(newCase);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-dark-900 border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-2 sm:my-8 max-h-[95vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 bg-dark-950 border-b border-white/[0.08] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-amber-400" />
            <h3 className="text-base sm:text-lg font-bold font-display text-white">
              إضافة كتاب / ملف قضية جديد
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-stone-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-stone-400 mb-1">عنوان الكتاب</label>
              <input
                type="text"
                required
                placeholder="مثال: سرقة متحف اللوفر"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-stone-200 focus:outline-none focus:border-amber-400/60"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-stone-400 mb-1">العنوان الفرعي</label>
              <input
                type="text"
                placeholder="مثال: لغز اختفاء الموناليزا"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-stone-200 focus:outline-none focus:border-amber-400/60"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-mono text-stone-400 mb-1">رقم القضية</label>
              <input
                type="text"
                value={formData.caseNumber}
                onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-amber-300 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-stone-400 mb-1">السعر (ر.س - 0 للمجاني)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0 (مجانية) أو 19.50"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-stone-200 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-stone-400 mb-1">المستوى</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-white/[0.08] text-xs text-stone-200"
              >
                <option value="مبتدئ">مبتدئ</option>
                <option value="متمرس">متمرس</option>
                <option value="خبير جنائي">خبير جنائي</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-stone-400 mb-1">عدد الصفحات</label>
              <input
                type="number"
                value={formData.pages}
                onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-stone-200 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-stone-400 mb-1">نص اللغز ومسرح الحادثة</label>
            <textarea
              required
              rows={3}
              placeholder="اكتب ملابسات الواقعة..."
              value={formData.synopsis}
              onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-stone-200 focus:outline-none focus:border-amber-400/60"
            />
          </div>

          {/* Solution details */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-rose-500/30 space-y-3">
            <div className="text-xs font-mono font-bold text-rose-400 uppercase">
              ملف الحل وهوية الجاني
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  placeholder="اسم الجاني"
                  value={formData.culprit}
                  onChange={(e) => setFormData({ ...formData, culprit: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-stone-200"
                />
              </div>

              <div>
                <input
                  type="text"
                  placeholder="الدافع"
                  value={formData.motive}
                  onChange={(e) => setFormData({ ...formData, motive: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-stone-200"
                />
              </div>
            </div>

            <div>
              <textarea
                rows={2}
                placeholder="طريقة التنفيذ والاستنتاج..."
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-stone-200"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-dark-950 font-black text-sm shadow-lg transition flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>نشر الكتاب في المتجر فوراً</span>
          </button>

        </form>

      </div>
    </div>
  );
}
