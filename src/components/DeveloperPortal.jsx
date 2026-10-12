import React, { useState, useEffect, useRef } from 'react';
import { 
  PlusCircle, 
  BookOpen, 
  ShoppingBag, 
  Trash2, 
  Eye, 
  DollarSign, 
  CheckCircle, 
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Tag,
  FileText
} from 'lucide-react';
import { subscribeToOrders } from '../firebase/db';

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
  const fileInputRef = useRef(null);

  // Form State: Exactly the 6 fields requested
  const [formData, setFormData] = useState({
    title: '',          // 1. اسم القضية
    synopsis: '',       // 2. وصف مشوق
    coverImage: '',     // 3. صورة للغلاف
    category: 'متمرس',  // 4. مستوى أو تصنيف القضية
    originalPrice: '',  // 5. السعر قبل إن وجد
    price: '',          // 6. السعر بعد
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

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('يرجى إدخال اسم القضية.');
      return;
    }
    if (!formData.price) {
      alert('يرجى إدخال سعر البيع (السعر بعد).');
      return;
    }

    setIsPublishing(true);

    const newCase = {
      id: `case-${Date.now()}`,
      caseNumber: `CASE #${Math.floor(700 + Math.random() * 250)}-س`,
      title: formData.title.trim(),
      subtitle: formData.category || 'ملف تحقيق جنائي',
      synopsis: formData.synopsis.trim() || 'ملف قضية جنائية غامضة بانتظار فك طلاسمها.',
      coverImage: formData.coverImage.trim() || '/detective_silhouette.jpg',
      difficulty: formData.category,
      category: formData.category,
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
      price: Number(formData.price),
      rating: 5.0,
      reviewsCount: 1,
      isFeatured: true,
      fileSize: '4.8 MB',
      pages: 38,
      classification: 'سري للغاية',
      hints: [
        { level: 1, title: 'تلميح المحقق', hint: 'دقق في تسلسل الأحداث والأدلة المادية في ملف القضية.' }
      ],
      solution: {
        culprit: 'مُسجل في تقرير الحل الختامي',
        motive: 'دافع جنائي مشفر',
        method: formData.synopsis.trim(),
        deductionSteps: [
          '1. تحليل مسرح الحادثة بدقة.',
          '2. مطابقة الإفادات وإثبات الإدانة.'
        ]
      },
      tags: [formData.category, 'تحقيق', 'غموض'].filter(Boolean)
    };

    await onAddCase(newCase);
    setIsPublishing(false);
    notify(`تم نشر قضية "${newCase.title}" وحفظها في السحابة بنجاح! 🎉`);

    // Reset Form
    setFormData({
      title: '',
      synopsis: '',
      coverImage: '',
      category: 'متمرس',
      originalPrice: '',
      price: '',
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Stats
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
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-crypta-pink to-rose-700 flex items-center justify-center font-black text-white shadow-pink-glow">
              🛠️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-white">لوحة تحكم المطور والمؤلف</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-crypta-pink/20 text-crypta-pink border border-crypta-pink/40 font-mono font-bold">
                  سِـجِـلّ
                </span>
              </div>
              <p className="text-xs text-stone-400">إدارة ونشر القصص ومتابعة مبيعات المتجر</p>
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
        <div className="max-w-6xl mx-auto flex items-center gap-2 overflow-x-auto py-2.5">
          <button
            onClick={() => setActiveTab('publish')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'publish'
                ? 'bg-crypta-pink text-white shadow-pink-glow'
                : 'text-stone-400 hover:text-white hover:bg-stone-900'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>رفع قضية جديدة (6 حقول)</span>
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-8 py-8">
        
        {/* ================= TAB 1: PUBLISH CASE (EXACT 6 FIELDS) ================= */}
        {activeTab === 'publish' && (
          <div className="max-w-3xl mx-auto">
            
            <div className="mb-6 text-right">
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <PlusCircle className="w-6 h-6 text-crypta-pink" />
                <span>صفحة رفع قضية جديدة</span>
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 mt-1">
                املأ الحقول التالية لنشر القضية مباشرة في المتجر وحفظها في قاعدة البيانات السحابية.
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5 bg-stone-900/80 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
              
              {/* 1. اسم القضية */}
              <div>
                <label className="block text-sm font-bold text-crypta-yellow mb-2">
                  1. اسم القضية *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: لغز غرفة البرج المغلقة"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-black border border-stone-700 focus:border-crypta-pink rounded-xl px-4 py-3 text-sm text-white placeholder-stone-600 focus:outline-none transition"
                />
              </div>

              {/* 2. وصف مشوق */}
              <div>
                <label className="block text-sm font-bold text-crypta-yellow mb-2">
                  2. وصف مشوق *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="اكتب نبذة غامضة ومشوقة تشجع القارئ على خوض التحقيق وشراء القضية..."
                  value={formData.synopsis}
                  onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
                  className="w-full bg-black border border-stone-700 focus:border-crypta-pink rounded-xl p-4 text-sm text-white placeholder-stone-600 focus:outline-none leading-relaxed transition"
                />
              </div>

              {/* 3. صورة للغلاف */}
              <div>
                <label className="block text-sm font-bold text-crypta-yellow mb-2">
                  3. صورة للغلاف
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  {/* File Upload & URL Inputs */}
                  <div className="space-y-3">
                    {/* Device Upload */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                      id="cover-file-upload"
                    />
                    <label
                      htmlFor="cover-file-upload"
                      className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border border-dashed border-stone-700 hover:border-crypta-pink bg-black hover:bg-stone-900 cursor-pointer text-xs font-bold text-stone-300 transition"
                    >
                      <Upload className="w-4 h-4 text-crypta-pink" />
                      <span>اختر صورة من جهازك</span>
                    </label>

                    {/* OR Direct URL */}
                    <div className="relative">
                      <input
                        type="url"
                        placeholder="أو الصق رابط صورة مباشر (URL)..."
                        value={formData.coverImage.startsWith('data:') ? '' : formData.coverImage}
                        onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                        className="w-full bg-black border border-stone-700 focus:border-crypta-pink rounded-xl px-4 py-2.5 text-xs text-white placeholder-stone-600 focus:outline-none font-mono transition"
                      />
                    </div>
                  </div>

                  {/* Image Preview Box */}
                  <div className="flex items-center justify-center">
                    {formData.coverImage ? (
                      <div className="relative w-28 h-36 rounded-xl overflow-hidden border-2 border-crypta-pink shadow-pink-glow">
                        <img
                          src={formData.coverImage}
                          alt="معاينة الغلاف"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, coverImage: '' });
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="absolute top-1 right-1 bg-black/80 text-rose-400 p-1 rounded-full text-[10px] hover:bg-black"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="w-28 h-36 rounded-xl border border-stone-800 bg-black flex flex-col items-center justify-center text-stone-600 text-center p-2">
                        <ImageIcon className="w-6 h-6 mb-1" />
                        <span className="text-[10px]">معاينة الغلاف</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 4. مستوى أو تصنيف القضية */}
              <div>
                <label className="block text-sm font-bold text-crypta-yellow mb-2">
                  4. مستوى أو تصنيف القضية
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-black border border-stone-700 focus:border-crypta-pink rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition"
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
                    placeholder="أو اكتب تصنيفاً مخصصاً هنا..."
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-black border border-stone-700 focus:border-crypta-pink rounded-xl px-4 py-3 text-sm text-white placeholder-stone-600 focus:outline-none transition"
                  />
                </div>
              </div>

              {/* 5 & 6: الأسعار */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* 5. السعر قبل إن وجد */}
                <div>
                  <label className="block text-sm font-bold text-stone-300 mb-2">
                    5. السعر قبل إن وجد (اختياري)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      placeholder="مثال: 50"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                      className="w-full bg-black border border-stone-700 focus:border-stone-500 rounded-xl px-4 py-3 text-sm text-stone-400 font-mono focus:outline-none transition"
                    />
                    <span className="absolute left-3 top-3.5 text-xs text-stone-500 font-mono">ر.س</span>
                  </div>
                  <span className="text-[11px] text-stone-500 mt-1 block">يظهر مشطوباً لإبراز الخصم للعميل</span>
                </div>

                {/* 6. السعر بعد */}
                <div>
                  <label className="block text-sm font-bold text-crypta-yellow mb-2">
                    6. السعر بعد (سعر البيع) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="مثال: 29"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full bg-black border-2 border-crypta-yellow/80 focus:border-crypta-yellow rounded-xl px-4 py-3 text-base text-white font-mono font-bold focus:outline-none transition shadow-[0_0_15px_rgba(246,195,36,0.15)]"
                    />
                    <span className="absolute left-3 top-3.5 text-xs text-crypta-yellow font-bold font-mono">ر.س</span>
                  </div>
                  <span className="text-[11px] text-stone-500 mt-1 block">المبلغ الفعلي الذي يدفعه العميل عند الشراء</span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-crypta-pink to-rose-700 hover:from-rose-500 hover:to-crypta-pink text-white font-black text-base shadow-pink-glow transition transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>{isPublishing ? 'جارٍ النشر والحفظ السحابي...' : 'نشر القضية في المتجر فوراً ✨'}</span>
                </button>
              </div>

            </form>

          </div>
        )}

        {/* ================= TAB 2: MANAGE STORIES ================= */}
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
                <span>رفع قضية جديدة</span>
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
                        {item.difficulty || item.category || 'قضية'}
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
                  <p className="text-xs text-stone-500">عندما يقوم أي عميل بشراء قصة من المتجر، ستظهر فوراً هنا مع تفاصيل الفاتورة.</p>
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
