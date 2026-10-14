'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Upload, 
  CheckCircle, 
  Image as ImageIcon, 
  FileArchive, 
  Link as LinkIcon, 
  Save, 
  FileText 
} from 'lucide-react';

export function EditCaseModal({ 
  caseItem, 
  isOpen, 
  onClose, 
  onSave 
}) {
  const [formData, setFormData] = useState({
    title: '',
    synopsis: '',
    coverImage: '',
    category: 'متمرس',
    originalPrice: '',
    price: '',
    fileName: '',
    fileData: '',
    fileSize: '',
    fileUrl: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const imageInputRef = useRef(null);
  const caseFileInputRef = useRef(null);

  // Sync state whenever a new caseItem is passed
  useEffect(() => {
    if (caseItem) {
      setFormData({
        title: caseItem.title || '',
        synopsis: caseItem.synopsis || '',
        coverImage: caseItem.coverImage || '',
        category: caseItem.category || caseItem.difficulty || 'متمرس',
        originalPrice: caseItem.originalPrice !== null && caseItem.originalPrice !== undefined ? String(caseItem.originalPrice) : '',
        price: caseItem.price !== null && caseItem.price !== undefined ? String(caseItem.price) : '',
        fileName: caseItem.fileName || '',
        fileData: caseItem.fileData || '',
        fileSize: caseItem.fileSize || '',
        fileUrl: caseItem.fileUrl || '',
      });
    }
  }, [caseItem]);

  if (!isOpen || !caseItem) return null;

  // Handle local image file upload from device
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({ ...prev, coverImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle local PDF / ZIP case file upload
  const handleCaseFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({
          ...prev,
          fileData: reader.result,
          fileName: file.name,
          fileSize: `${sizeMb} MB`
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('يرجى إدخال اسم القضية.');
      return;
    }
    if (!formData.price) {
      alert('يرجى إدخال سعر البيع (السعر بعد).');
      return;
    }

    setIsSaving(true);

    const updatedCase = {
      ...caseItem,
      title: formData.title.trim(),
      subtitle: formData.category || caseItem.subtitle || 'ملف تحقيق جنائي',
      synopsis: formData.synopsis.trim() || caseItem.synopsis,
      coverImage: formData.coverImage.trim() || caseItem.coverImage || '/detective_silhouette.jpg',
      difficulty: formData.category,
      category: formData.category,
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
      price: Number(formData.price),
      fileName: formData.fileName || '',
      fileData: formData.fileData || '',
      fileSize: formData.fileSize || caseItem.fileSize || '4.8 MB',
      fileUrl: formData.fileUrl?.trim() || '',
      solution: {
        ...(caseItem.solution || {}),
        culprit: caseItem.solution?.culprit || 'مُسجل في تقرير الحل الختامي',
        motive: caseItem.solution?.motive || 'دافع جنائي مشفر',
        method: formData.synopsis.trim() || caseItem.solution?.method,
        deductionSteps: caseItem.solution?.deductionSteps || [
          '1. تحليل مسرح الحادثة بدقة.',
          '2. مطابقة الإفادات وإثبات الإدانة.'
        ]
      },
      tags: [formData.category, 'تحقيق', 'غموض'].filter(Boolean)
    };

    await onSave(updatedCase);
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-white">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-stone-950 border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-sm">
              ✏️
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">تعديل بيانات القضية</h3>
              <span className="text-[11px] font-mono text-crypta-pink font-bold">
                {caseItem.caseNumber}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-stone-800/80 hover:bg-stone-800 text-stone-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* 1. اسم القضية */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-crypta-yellow mb-2">
              1. اسم القضية *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-black border border-stone-700 focus:border-crypta-pink rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition"
            />
          </div>

          {/* 2. وصف مشوق */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-crypta-yellow mb-2">
              2. وصف مشوق *
            </label>
            <textarea
              rows={4}
              required
              value={formData.synopsis}
              onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
              className="w-full bg-black border border-stone-700 focus:border-crypta-pink rounded-xl p-3.5 text-sm text-white focus:outline-none leading-relaxed transition"
            />
          </div>

          {/* 3. صورة الغلاف */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-crypta-yellow mb-2">
              3. صورة الغلاف
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="space-y-2.5">
                <input
                  type="file"
                  ref={imageInputRef}
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                  id="edit-cover-upload"
                />
                <label
                  htmlFor="edit-cover-upload"
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border border-dashed border-stone-700 hover:border-crypta-pink bg-black hover:bg-stone-900 cursor-pointer text-xs font-bold text-stone-300 transition"
                >
                  <Upload className="w-4 h-4 text-crypta-pink" />
                  <span>استبدال الصورة من جهازك</span>
                </label>

                <input
                  type="url"
                  placeholder="أو الصق رابط صورة جديد..."
                  value={formData.coverImage.startsWith('data:') ? '' : formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  className="w-full bg-black border border-stone-700 focus:border-crypta-pink rounded-xl px-4 py-2.5 text-xs text-white placeholder-stone-600 focus:outline-none font-mono transition"
                />
              </div>

              {/* Preview */}
              <div className="flex justify-center">
                {formData.coverImage ? (
                  <div className="relative w-24 h-32 rounded-xl overflow-hidden border-2 border-crypta-pink shadow-md">
                    <img
                      src={formData.coverImage}
                      alt="الغلاف"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-32 rounded-xl border border-stone-800 bg-black flex flex-col items-center justify-center text-stone-600 text-center p-2 text-xs">
                    <ImageIcon className="w-6 h-6 mb-1" />
                    <span>لا توجد صورة</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4. تصنيف أو مستوى القضية */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-crypta-yellow mb-2">
              4. مستوى أو تصنيف القضية
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-black border border-stone-700 focus:border-crypta-pink rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none transition"
              >
                <option value="سهل للمبتدئين">سهل (للمبتدئين)</option>
                <option value="متوسط">متوسط</option>
                <option value="متمرس">متمرس (محقق محترف)</option>
                <option value="معقد جداً">معقد جداً (خبير)</option>
                <option value="جريمة غامضة">جريمة غامضة</option>
                <option value="سرقة محكمة">سرقة محكمة</option>
                <option value="لغز ذكاء ومنطق">لغز ذكاء ومنطق</option>
                <option value="قضية باردة">قضية باردة (Cold Case)</option>
              </select>

              <input
                type="text"
                placeholder="أو اكتب تصنيفاً مخصصاً..."
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-black border border-stone-700 focus:border-crypta-pink rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none transition"
              />
            </div>
          </div>

          {/* 5 & 6: الأسعار */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-stone-300 mb-1.5">
                5. السعر قبل إن وجد (اختياري)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  className="w-full bg-black border border-stone-700 focus:border-stone-500 rounded-xl px-4 py-2.5 text-sm text-stone-300 font-mono focus:outline-none transition"
                />
                <span className="absolute left-3 top-3 text-xs text-stone-500 font-mono">ر.س</span>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-crypta-yellow mb-1.5">
                6. السعر بعد (سعر البيع) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full bg-black border-2 border-crypta-yellow rounded-xl px-4 py-2.5 text-sm text-white font-mono font-bold focus:outline-none transition shadow-[0_0_10px_rgba(246,195,36,0.15)]"
                />
                <span className="absolute left-3 top-3 text-xs text-crypta-yellow font-bold font-mono">ر.س</span>
              </div>
            </div>
          </div>

          {/* 7. ملف القضية الرقمي (PDF أو ZIP) */}
          <div className="p-4 rounded-2xl bg-black/70 border border-crypta-pink/30 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs sm:text-sm font-bold text-crypta-yellow flex items-center gap-1.5">
                <FileArchive className="w-4 h-4 text-crypta-pink" />
                <span>7. ملف القضية الرقمي (PDF أو ZIP)</span>
              </label>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-crypta-pink/20 text-crypta-pink border border-crypta-pink/40 font-bold">
                ملف التنزيل للعميل
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="file"
                  ref={caseFileInputRef}
                  accept=".pdf,.zip,.rar,.epub,.7z,application/pdf,application/zip"
                  onChange={handleCaseFileChange}
                  className="hidden"
                  id="edit-case-file-upload"
                />
                <label
                  htmlFor="edit-case-file-upload"
                  className="flex items-center justify-center gap-2 w-full py-3 px-3 rounded-xl border border-dashed border-stone-700 hover:border-crypta-pink bg-stone-900 cursor-pointer text-xs font-bold text-white transition"
                >
                  <Upload className="w-4 h-4 text-crypta-pink" />
                  <span>رفع ملف جديد من جهازك</span>
                </label>
              </div>

              <div className="relative">
                <input
                  type="url"
                  placeholder="أو رابط سحابي (Drive...)"
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-700 focus:border-crypta-yellow rounded-xl px-4 py-3 text-xs text-white placeholder-stone-500 focus:outline-none font-mono transition"
                />
              </div>
            </div>

            {/* Current File Status Badge */}
            {formData.fileName && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs">
                <div className="flex items-center gap-2 font-mono">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-bold truncate max-w-xs">{formData.fileName}</span>
                  {formData.fileSize && (
                    <span className="text-[10px] bg-emerald-900 px-1.5 py-0.5 rounded text-emerald-200">
                      {formData.fileSize}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, fileName: '', fileData: '', fileSize: '' }));
                    if (caseFileInputRef.current) caseFileInputRef.current.value = '';
                  }}
                  className="text-stone-400 hover:text-rose-400 text-xs font-bold"
                >
                  ✕ إزالة
                </button>
              </div>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs sm:text-sm font-bold transition"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-crypta-pink to-rose-700 hover:from-rose-500 hover:to-crypta-pink text-white font-black text-xs sm:text-sm shadow-pink-glow transition flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'جارٍ حفظ التعديلات...' : 'حفظ التعديلات في السحابة والمتجر ✨'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
