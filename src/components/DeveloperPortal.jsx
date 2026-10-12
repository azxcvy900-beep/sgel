import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  BookOpen, 
  ShoppingBag, 
  Trash2, 
  Eye, 
  DollarSign, 
  CheckCircle, 
  TrendingUp, 
  Clock, 
  Sparkles,
  ArrowLeft,
  Database,
  FileText,
  AlertCircle
} from 'lucide-react';
import { subscribeToOrders, deleteCaseFromFirebase } from '../firebase/db';

export function DeveloperPortal({ 
  cases, 
  onAddCase, 
  onDeleteCase, 
  onSwitchToStore,
  isFirebaseConnected 
}) {
  const [activeTab, setActiveTab] = useState('publish'); // 'publish' | 'manage' | 'orders'
  const [orders, setOrders] = useState([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [successToast, setSuccessToast] = useState(null);

  // Form State for publishing a new story
  const [formData, setFormData] = useState({
    title: '',
    subtitle: 'قضية جنائية مشفرة',
    caseNumber: `CASE #${Math.floor(700 + Math.random() * 250)}-س`,
    price: 29,
    originalPrice: 49,
    category: 'جريمة غامضة',
    difficulty: 'متمرس',
    pages: 42,
    estimatedSolveTime: 'ساعتان',
    classification: 'سري للغاية',
    synopsis: '',
    culprit: '',
    motive: '',
    method: '',
    clues: '1. أثر بصمة جزئية على المقبض النحاسي.\n2. فاتورة مقهى في توقيت ارتكاب الجريمة.\n3. تسجيل كاميرا المراقبة المقابل للمبنى.',
    tags: 'غموض, جريمة, تحقيق, ذكاء',
    coverStyle: 'noir-red' // 'noir-red' | 'noir-gold' | 'noir-cyan' | 'noir-purple'
  });

  // Subscribe to live orders from Firebase
  useEffect(() => {
    const unsubscribe = subscribeToOrders((liveOrders) => {
      setOrders(liveOrders);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const notify = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.synopsis.trim()) {
      alert('يرجى كتابة عنوان القصة والملخص التشويقي على الأقل.');
      return;
    }

    setIsPublishing(true);

    const gradientMap = {
      'noir-red': 'from-[#2b0914] via-[#150509] to-[#000000]',
      'noir-gold': 'from-[#2a1e05] via-[#140e02] to-[#000000]',
      'noir-cyan': 'from-[#061e24] via-[#020e12] to-[#000000]',
      'noir-purple': 'from-[#1c0828] via-[#0d0314] to-[#000000]',
    };

    const accentMap = {
      'noir-red': 'text-rose-400',
      'noir-gold': 'text-amber-400',
      'noir-cyan': 'text-cyan-400',
      'noir-purple': 'text-fuchsia-400',
    };

    const newCase = {
      id: `case-${Date.now()}`,
      caseNumber: formData.caseNumber,
      title: formData.title,
      subtitle: formData.subtitle,
      price: Number(formData.price),
      originalPrice: Number(formData.originalPrice),
      difficulty: formData.difficulty,
      pages: Number(formData.pages),
      fileSize: '4.8 MB',
      estimatedSolveTime: formData.estimatedSolveTime,
      classification: formData.classification,
      rating: 5.0,
      reviewsCount: 1,
      isFeatured: true,
      coverTheme: {
        gradient: gradientMap[formData.coverStyle] || gradientMap['noir-red'],
        accent: accentMap[formData.coverStyle] || 'text-rose-400',
        borderAccent: 'border-stone-800',
        goldFoil: true,
        symbol: '🔍',
        categoryBadge: formData.category
      },
      synopsis: formData.synopsis,
      evidenceList: formData.clues.split('\n').filter(Boolean).map((line, idx) => ({
        id: idx + 1,
        title: `حرز جنائي #${idx + 1}`,
        description: line.trim()
      })),
      suspects: [
        {
          name: formData.culprit || 'المشتبه به الرئيسي',
          role: 'المشتبه به الأول',
          alibi: 'ادعى التواجد خارج مكان الحادث، وتوجد ثغرة في شهادته.',
          motive: formData.motive || 'دافع مالي وانتقامي.',
          suspicionScore: 92
        }
      ],
      hints: [
        {
          level: 1,
          title: 'تلميح مبدئي',
          hint: 'دقق جيداً في توقيت الأدلة الجنائية وفارق الدقائق المعدودة.'
        },
        {
          level: 2,
          title: 'تلميح متقدم',
          hint: 'هناك تناقض واضح بين إفادة المتهم والأدلة المحرزة.'
        },
        {
          level: 3,
          title: 'كشف هوية الجاني',
          hint: `الجاني الحقيقي هو: ${formData.culprit || 'المشتبه به الأول'}.`
        }
      ],
      solution: {
        culprit: formData.culprit || 'الجاني',
        motive: formData.motive || 'دافع انتقامي ومادي مدروس',
        method: formData.method || 'تم تنفيذ الجريمة باستغلال ثغرة التوقيت وتشتيت انتباه الشهود.',
        deductionSteps: [
          '1. تحليل توقيت الأحراز واستبعاد الفرضيات الخاطئة.',
          '2. مطابقة خط سير المتهم مع التقرير المرفق بالملف.',
          '3. إثبات الإدانة القاطعة بالدليل المادي القاطع.'
        ]
      },
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    };

    await onAddCase(newCase);
    setIsPublishing(false);
    notify(`تم نشر قصة "${newCase.title}" وحفظها في السحابة بنجاح! 🎉`);

    // Reset Form
    setFormData({
      title: '',
      subtitle: 'قضية جنائية مشفرة',
      caseNumber: `CASE #${Math.floor(700 + Math.random() * 250)}-س`,
      price: 29,
      originalPrice: 49,
      category: 'جريمة غامضة',
      difficulty: 'متمرس',
      pages: 42,
      estimatedSolveTime: 'ساعتان',
      classification: 'سري للغاية',
      synopsis: '',
      culprit: '',
      motive: '',
      method: '',
      clues: '1. أثر بصمة جزئية على المقبض النحاسي.\n2. فاتورة مقهى في توقيت ارتكاب الجريمة.\n3. تسجيل كاميرا المراقبة المقابل للمبنى.',
      tags: 'غموض, جريمة, تحقيق, ذكاء',
      coverStyle: 'noir-red'
    });
  };

  // Calculate quick stats
  const totalRevenue = orders.reduce((sum, ord) => sum + (ord.total || 0), 0);
  const totalBooksSold = orders.reduce((sum, ord) => sum + (ord.items?.length || 0), 0);

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col font-sans">
      
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-stone-900 border-2 border-emerald-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold animate-bounce">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Admin Header */}
      <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-stone-800 shadow-xl px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-crypta-pink to-rose-700 flex items-center justify-center font-black text-white shadow-pink-glow">
              🛠️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-white">لوحة تحكم المطور والمؤلف</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-crypta-pink/20 text-crypta-pink border border-crypta-pink/40 font-mono font-bold">
                  PORTAL
                </span>
              </div>
              <p className="text-xs text-stone-400">إدارة ونشر القصص ومتابعة مبيعات متجر سِـجِـلّ</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {/* Database status */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-900 border border-stone-800 text-xs">
              <span className={`w-2 h-2 rounded-full ${isFirebaseConnected ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400 animate-pulse'}`} />
              <span className="font-mono text-stone-300">Firebase Live</span>
            </div>

            {/* Back to Client Store Button */}
            <button
              onClick={onSwitchToStore}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-crypta-yellow hover:bg-yellow-400 text-black font-black text-xs transition shadow-yellow-glow"
            >
              <Eye className="w-4 h-4" />
              <span>معاينة متجر العميل</span>
              <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
            </button>
          </div>

        </div>
      </header>

      {/* Sub-Nav Tabs */}
      <div className="bg-stone-950 border-b border-stone-850 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-2.5">
          <button
            onClick={() => setActiveTab('publish')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'publish'
                ? 'bg-crypta-pink text-white shadow-pink-glow'
                : 'text-stone-400 hover:text-white hover:bg-stone-900'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>نشر قصة / لغز جديد</span>
          </button>

          <button
            onClick={() => setActiveTab('manage')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'manage'
                ? 'bg-crypta-pink text-white shadow-pink-glow'
                : 'text-stone-400 hover:text-white hover:bg-stone-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>القصص المنشورة ({cases.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-crypta-pink text-white shadow-pink-glow'
                : 'text-stone-400 hover:text-white hover:bg-stone-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>سجل المبيعات والطلبات ({orders.length})</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-8">
        
        {/* ================= TAB 1: PUBLISH NEW STORY ================= */}
        {activeTab === 'publish' && (
          <div className="max-w-4xl mx-auto">
            
            <div className="mb-6">
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-crypta-yellow" />
                <span>نشر رواية / قضية جديدة في المتجر</span>
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 mt-1">
                املأ تفاصيل القضية وسيتم نشرها فوراً في السحابة لجميع زوار المتجر مع إعداد حلها المشفر.
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              
              {/* Card 1: Basic Info */}
              <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-5 sm:p-6 space-y-4">
                <h3 className="text-sm font-bold text-crypta-yellow uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>1. البيانات الأساسية للقصة</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">
                      عنوان القصة / الكتاب *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: لغز غرفة البرج المغلقة"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-black border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-crypta-pink focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">
                      العنوان الفرعي
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: تحقيق مشفر في جريمة غامضة"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      className="w-full bg-black border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-crypta-pink focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">
                      رقم القضية / الكود
                    </label>
                    <input
                      type="text"
                      value={formData.caseNumber}
                      onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
                      className="w-full bg-black border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:border-crypta-pink focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">
                      تصنيف القضية
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-black border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-crypta-pink focus:outline-none"
                    >
                      <option value="جريمة غامضة">جريمة غامضة</option>
                      <option value="سرقة محكمة">سرقة محكمة</option>
                      <option value="لغز منطقي">لغز منطقي</option>
                      <option value="قضية باردة">قضية باردة (Cold Case)</option>
                      <option value="مؤامرة سرية">مؤامرة سرية</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">
                      السعر (ر.س) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full bg-black border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:border-crypta-yellow focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">
                      السعر قبل الخصم
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                      className="w-full bg-black border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-stone-400 font-mono focus:border-crypta-pink focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">
                      مستوى الصعوبة
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      className="w-full bg-black border border-stone-700 rounded-xl px-3 py-2.5 text-sm text-white focus:border-crypta-pink focus:outline-none"
                    >
                      <option value="سهل">سهل (مبتدئ)</option>
                      <option value="متوسط">متوسط</option>
                      <option value="متمرس">متمرس (محقق)</option>
                      <option value="معقد جداً">معقد جداً (خبير)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">
                      عدد الصفحات
                    </label>
                    <input
                      type="number"
                      min="10"
                      value={formData.pages}
                      onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                      className="w-full bg-black border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:border-crypta-pink focus:outline-none"
                    />
                  </div>
                </div>

                {/* Cover Style Selector */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-stone-300 mb-2">
                    نمط تصميم الغلاف (الخلفية والألوان):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { id: 'noir-red', name: 'قرمزي جنائي (Crimson Noir)', border: 'border-rose-500' },
                      { id: 'noir-gold', name: 'ذهبي كلاسيكي (Golden Noir)', border: 'border-amber-500' },
                      { id: 'noir-cyan', name: 'أزرق تحقيقي (Cyan Thriller)', border: 'border-cyan-500' },
                      { id: 'noir-purple', name: 'أرجواني غامض (Mystic Purple)', border: 'border-fuchsia-500' },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, coverStyle: st.id })}
                        className={`p-3 rounded-xl text-xs font-bold text-center border transition ${
                          formData.coverStyle === st.id
                            ? `${st.border} bg-stone-800 text-white shadow-lg`
                            : 'border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700'
                        }`}
                      >
                        {st.name}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Card 2: Synopsis (What customer sees) */}
              <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-5 sm:p-6 space-y-4">
                <h3 className="text-sm font-bold text-crypta-yellow uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>2. الملخص التشويقي (ما يظهر للعميل في المتجر قبل الشراء) *</span>
                </h3>

                <div>
                  <textarea
                    rows={4}
                    required
                    placeholder="اكتب نبذة غامضة ومشوقة عن الجريمة تحفز القارئ على شراء الملف وكشف اللغز..."
                    value={formData.synopsis}
                    onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
                    className="w-full bg-black border border-stone-700 rounded-xl p-4 text-sm text-white focus:border-crypta-pink focus:outline-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    الأدلة الجنائية الأولية (دليل في كل سطر):
                  </label>
                  <textarea
                    rows={3}
                    placeholder="1. دليل أول&#10;2. دليل ثاني&#10;3. دليل ثالث"
                    value={formData.clues}
                    onChange={(e) => setFormData({ ...formData, clues: e.target.value })}
                    className="w-full bg-black border border-stone-700 rounded-xl p-3 text-xs text-stone-300 focus:border-crypta-pink focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Card 3: Secret Official Solution (Sealed until purchased) */}
              <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                    🔒
                    <span>3. الحل السري الرسمي (يُفتح للعميل فقط بعد الشراء في خزينة الحلول)</span>
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono">
                    محمي ومختوم
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">
                      اسم الجاني الحقيقي
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: الخادم الشخصي (سليمان)"
                      value={formData.culprit}
                      onChange={(e) => setFormData({ ...formData, culprit: e.target.value })}
                      className="w-full bg-black border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-rose-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">
                      الدافع الجنائي
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: الحصول على الوصية المخفية"
                      value={formData.motive}
                      onChange={(e) => setFormData({ ...formData, motive: e.target.value })}
                      className="w-full bg-black border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    طريقة تنفيذ الجريمة وكيف يحلها المحقق:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="اشرح بدقة كيفية فك اللغز وما هي الثغرة التي فضحت الجاني..."
                    value={formData.method}
                    onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                    className="w-full bg-black border border-stone-700 rounded-xl p-3 text-sm text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-crypta-pink to-rose-700 hover:from-rose-500 hover:to-crypta-pink text-white font-black text-sm shadow-pink-glow transition transform hover:scale-[1.02] disabled:opacity-50"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>{isPublishing ? 'جارٍ النشر والسحب إلى Firebase...' : 'نشر القصة في المتجر فوراً ✨'}</span>
                </button>
              </div>

            </form>

          </div>
        )}

        {/* ================= TAB 2: MANAGE PUBLISHED STORIES ================= */}
        {activeTab === 'manage' && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white">القصص والكتب المنشورة حالياً</h2>
                <p className="text-xs sm:text-sm text-stone-400">إجمالي {cases.length} قصة في قاعدة بيانات المتجر</p>
              </div>

              <button
                onClick={() => setActiveTab('publish')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-crypta-pink text-white font-bold text-xs shadow-pink-glow self-start sm:self-auto"
              >
                <PlusCircle className="w-4 h-4" />
                <span>إضافة قصة جديدة</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cases.map((item) => (
                <div 
                  key={item.id}
                  className="bg-stone-900/80 border border-stone-800 hover:border-stone-700 rounded-2xl p-5 flex flex-col justify-between transition group space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-crypta-pink">
                        {item.caseNumber}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 font-bold">
                        {item.difficulty}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-white group-hover:text-crypta-yellow transition line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                      {item.synopsis}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-800 flex items-center justify-between">
                    <div>
                      <span className="text-lg font-black text-crypta-yellow font-mono">
                        {item.price} ر.س
                      </span>
                      {item.originalPrice && (
                        <span className="text-xs text-stone-500 line-through mr-1.5 font-mono">
                          {item.originalPrice} ر.س
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من حذف قصة "${item.title}" من المتجر وقاعدة البيانات؟`)) {
                          onDeleteCase(item.id);
                          notify(`تم حذف قصة "${item.title}" بنجاح.`);
                        }
                      }}
                      className="p-2 rounded-xl text-stone-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="حذف القصة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ================= TAB 3: LIVE SALES & ORDERS ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            
            <div>
              <h2 className="text-2xl font-black text-white">سجل المبيعات والطلبات الحية</h2>
              <p className="text-xs sm:text-sm text-stone-400">مزامنة فورية ومباشرة من قاعدة بيانات Firebase (sijill/orders)</p>
            </div>

            {/* Quick KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 space-y-1">
                <div className="flex items-center justify-between text-stone-400 text-xs">
                  <span>إجمالي الدخل</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {totalRevenue} <span className="text-sm font-sans text-stone-400">ر.س</span>
                </div>
              </div>

              <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 space-y-1">
                <div className="flex items-center justify-between text-stone-400 text-xs">
                  <span>إجمالي الطلبات</span>
                  <ShoppingBag className="w-4 h-4 text-crypta-pink" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {orders.length} <span className="text-sm font-sans text-stone-400">طلب</span>
                </div>
              </div>

              <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 space-y-1">
                <div className="flex items-center justify-between text-stone-400 text-xs">
                  <span>الكتب المباعة</span>
                  <BookOpen className="w-4 h-4 text-crypta-yellow" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {totalBooksSold} <span className="text-sm font-sans text-stone-400">نسخة رقمية</span>
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-stone-900/80 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-stone-800 font-bold text-sm text-white flex items-center justify-between">
                <span>الطلبات المسجلة ({orders.length})</span>
                <span className="text-xs text-stone-400 font-mono">تحديث فوري تلقائي</span>
              </div>

              {orders.length === 0 ? (
                <div className="p-12 text-center text-stone-400 space-y-2">
                  <ShoppingBag className="w-10 h-10 mx-auto text-stone-600" />
                  <p className="font-bold text-sm">لم يتم تسجيل أي طلب شراء حتى الآن</p>
                  <p className="text-xs text-stone-500">عندما يقوم أي عميل بشراء قصة من المتجر، ستظهر فورا هنا مع تفاصيل الفاتورة.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-black/60 text-stone-400 border-b border-stone-800 font-mono">
                      <tr>
                        <th className="py-3 px-4">رقم الطلب</th>
                        <th className="py-3 px-4">بيانات العميل</th>
                        <th className="py-3 px-4">الكتب المشتراة</th>
                        <th className="py-3 px-4">المبلغ</th>
                        <th className="py-3 px-4">طريقة الدفع</th>
                        <th className="py-3 px-4">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/60 font-sans">
                      {orders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-stone-850/50 transition">
                          <td className="py-3.5 px-4 font-mono text-crypta-pink font-bold">
                            {ord.orderId || ord.id?.slice(0, 8)}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white">{ord.customerName || 'عميل مجهول'}</div>
                            <div className="text-stone-400 text-[11px] font-mono">{ord.customerEmail || '-'}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              {ord.items?.map((it, idx) => (
                                <div key={idx} className="text-stone-300 font-medium">
                                  • {it.title}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-crypta-yellow">
                            {ord.total} ر.س
                          </td>
                          <td className="py-3.5 px-4 text-stone-300">
                            {ord.paymentMethod === 'apple_pay' ? '🍎 Apple Pay' : 
                             ord.paymentMethod === 'mada' ? '💳 مدى' : 'بطاقة ائتمان'}
                          </td>
                          <td className="py-3.5 px-4 text-stone-400 font-mono text-[11px]">
                            {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('ar-SA') : 'الآن'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

      </main>

    </div>
  );
}
