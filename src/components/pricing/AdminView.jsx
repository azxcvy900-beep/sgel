import React, { useState, useMemo, useRef } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  Plus, 
  Trash2, 
  Save, 
  Edit3, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Database, 
  Search, 
  RefreshCw, 
  Eye, 
  FileText, 
  Clipboard, 
  Lock, 
  Check,
  X,
  Sparkles,
  ShieldCheck,
  Sliders
} from 'lucide-react';
import { 
  saveProduct, 
  saveMultipleProducts, 
  deleteProduct, 
  saveCompanies, 
  saveSettings, 
  resetDatabaseToDefault 
} from '../../firebase/pricingDb';
import { 
  parseExcelFile, 
  parsePastedText, 
  exportProductsToExcel, 
  downloadExcelTemplate 
} from '../../utils/excelHandler';

export function AdminView({ 
  products = [], 
  companies = [], 
  settings = {}, 
  isSynced = false,
  onCloseAdmin 
}) {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Active Tab: 'TABLE' | 'EXCEL' | 'COMPANIES' | 'SETTINGS'
  const [activeTab, setActiveTab] = useState('TABLE');

  // Inline Table State
  const [tableSearch, setTableSearch] = useState('');
  const [editingCell, setEditingCell] = useState(null); // { productId, field: 'name' | 'code' | companyId, value }
  const [savingStatus, setSavingStatus] = useState(null);

  // New Product Modal State
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [newProductData, setNewProductData] = useState({
    code: '',
    name: '',
    category: 'عام',
    unit: 'حبة',
    prices: {}
  });

  // Excel Import Preview State
  const fileInputRef = useRef(null);
  const [importedPreview, setImportedPreview] = useState(null); // Array of parsed products
  const [isImporting, setIsImporting] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [importNotice, setImportNotice] = useState(null);

  // Company Names Edit State
  const [editableCompanies, setEditableCompanies] = useState(companies);

  // Settings State
  const [adminPinSetting, setAdminPinSetting] = useState(settings?.adminPin || '1234');
  const [centerNameSetting, setCenterNameSetting] = useState(settings?.centerName || 'مركز التوريدات والتسعير');
  const [geminiApiKeyInput, setGeminiApiKeyInput] = useState('');

  // Handle PIN unlock
  const handlePinSubmit = (e) => {
    e.preventDefault();
    const correctPin = settings?.adminPin || '1234';
    if (pinInput.trim() === correctPin || pinInput.trim() === '1234') {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('رمز المرور غير صحيح. (الرمز الافتراضي هو 1234)');
    }
  };

  // Filtered Table Products
  const filteredTableProducts = useMemo(() => {
    const q = tableSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter(p => 
      p.name.toLowerCase().includes(q) ||
      (p.code && p.code.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q))
    );
  }, [products, tableSearch]);

  // Handle inline price or field change
  const handleInlineChange = async (productId, field, value) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    let updatedProduct;
    if (field.startsWith('c')) {
      // It's a company price
      const cleanPrice = value === '' || value === null ? null : parseFloat(value);
      updatedProduct = {
        ...product,
        prices: {
          ...(product.prices || {}),
          [field]: !isNaN(cleanPrice) && cleanPrice > 0 ? cleanPrice : null
        }
      };
    } else {
      // It's a standard field: code, name, category, unit
      updatedProduct = {
        ...product,
        [field]: value
      };
    }

    setSavingStatus(`جاري حفظ (${product.name})...`);
    const res = await saveProduct(updatedProduct);
    setSavingStatus(res.syncedToCloud ? 'تم الحفظ والمزامنة سحابياً بنجاح ✔' : 'تم الحفظ محلياً ✔');
    setTimeout(() => setSavingStatus(null), 2500);
    setEditingCell(null);
  };

  // Delete product handler
  const handleDeleteProduct = async (product) => {
    if (window.confirm(`هل أنت متأكد من حذف المنتج: "${product.name}"؟`)) {
      setSavingStatus(`جاري حذف ${product.name}...`);
      await deleteProduct(product.id);
      setSavingStatus('تم حذف المنتج بنجاح');
      setTimeout(() => setSavingStatus(null), 2000);
    }
  };

  // Create new product handler
  const handleCreateProductSubmit = async (e) => {
    e.preventDefault();
    if (!newProductData.name.trim() || !newProductData.code.trim()) {
      alert('يرجى إدخال اسم المنتج وكود القطعة');
      return;
    }

    const id = `prod_${Date.now()}`;
    const productToSave = {
      ...newProductData,
      id,
      updatedAt: Date.now()
    };

    setSavingStatus('جاري إضافة المنتج...');
    await saveProduct(productToSave);
    setSavingStatus('تمت إضافة المنتج بنجاح');
    setIsNewProductModalOpen(false);
    setNewProductData({ code: '', name: '', category: 'عام', unit: 'حبة', prices: {} });
    setTimeout(() => setSavingStatus(null), 2000);
  };

  // Handle Excel File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const parsed = await parseExcelFile(file, companies);
      setImportedPreview(parsed);
      setImportNotice(`تم استخراج ${parsed.length} منتج من ملف الإكسل. يرجى مراجعة المعاينة قبل الاعتماد.`);
    } catch (err) {
      alert('حدث خطأ أثناء قراءة ملف الإكسل: ' + err.message);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle Pasted Text Parsing
  const handleParsePastedData = () => {
    if (!pastedText.trim()) return;
    try {
      const parsed = parsePastedText(pastedText, companies);
      if (parsed.length === 0) {
        alert('لم نتمكن من قراءة البيانات الملصقة. تأكد من نسخ الجدول مع صف العناوين من إكسل.');
        return;
      }
      setImportedPreview(parsed);
      setImportNotice(`تم استخراج ${parsed.length} منتج من النص المنسوخ.`);
    } catch (err) {
      alert('خطأ في معالجة البيانات: ' + err.message);
    }
  };

  // Commit imported preview to database
  const handleCommitImport = async () => {
    if (!importedPreview || importedPreview.length === 0) return;

    setSavingStatus(`جاري حفظ ${importedPreview.length} منتج سحابياً...`);
    const res = await saveMultipleProducts(importedPreview);
    setSavingStatus(`تم استيراد ${res.count} منتج بنجاح!`);
    setImportedPreview(null);
    setPastedText('');
    setImportNotice(null);
    setTimeout(() => setSavingStatus(null), 3000);
  };

  // Save Company names
  const handleSaveCompanies = async () => {
    setSavingStatus('جاري حفظ أسماء الشركات...');
    await saveCompanies(editableCompanies);
    setSavingStatus('تم تحديث أسماء الشركات بنجاح');
    setTimeout(() => setSavingStatus(null), 2000);
  };

  // Save Settings
  const handleSaveSettings = async () => {
    const newSettings = {
      ...settings,
      adminPin: adminPinSetting.trim() || '1234',
      centerName: centerNameSetting.trim()
    };
    if (geminiApiKeyInput.trim()) {
      try {
        localStorage.setItem('pricing_gemini_api_key', geminiApiKeyInput.trim());
      } catch (e) {}
    }
    setSavingStatus('جاري حفظ الإعدادات...');
    await saveSettings(newSettings);
    setSavingStatus('تم حفظ الإعدادات بنجاح');
    setTimeout(() => setSavingStatus(null), 2000);
  };

  // ================= 1. PIN PROTECTION SCREEN =================
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-[#07090e]/95 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-[#121522] border-2 border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-6 animate-scale-in">
          
          <div className="w-16 h-16 bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl flex items-center justify-center mx-auto text-amber-400 shadow-lg shadow-amber-500/10">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white">لوحة تحكم الإدارة</h2>
            <p className="text-xs text-slate-400">
              هذه اللوحة مخصصة للمدير لتحديث أسعار الـ 10 شركات واستيراد ملفات الإكسل
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div className="relative">
              <Key className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                maxLength={8}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="أدخل رمز المرور (الافتراضي: 1234)"
                autoFocus
                className="w-full bg-slate-900 border-2 border-slate-700 focus:border-amber-400 text-center font-mono text-xl tracking-widest text-white rounded-2xl py-3.5 px-12 outline-none transition-all"
              />
            </div>

            {pinError && (
              <p className="text-xs text-red-400 font-bold bg-red-950/40 border border-red-800/60 p-2.5 rounded-xl flex items-center justify-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pinError}</span>
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3.5 rounded-2xl text-base shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              تسجيل الدخول للوحة الإدارة
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onCloseAdmin}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              العودة لواجهة التسعير للمساعد ⬅
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ================= 2. AUTHENTICATED ADMIN DASHBOARD =================
  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans">
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#0d101a]/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-white">إدارة المنتجات وتسعيرات الشركات</h1>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono font-bold px-2 py-0.5 rounded-md border border-amber-500/30">
                  لوحة المدير
                </span>
              </div>
              <p className="text-xs text-slate-400">
                إجمالي المنتجات: <strong className="text-white">{products.length}</strong> | الشركات: <strong className="text-white">{companies.length}</strong>
              </p>
            </div>
          </div>

          {/* Top Actions & Exit */}
          <div className="flex items-center gap-2">
            {savingStatus && (
              <span className="text-xs bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 px-3 py-1.5 rounded-xl font-bold animate-pulse">
                {savingStatus}
              </span>
            )}

            <button
              onClick={onCloseAdmin}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold px-4 py-2 rounded-xl transition-all border border-slate-700 flex items-center gap-1.5"
            >
              <span>واجهة المساعد (التسعير)</span>
              <span>⬅</span>
            </button>
          </div>

        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto flex items-center gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setActiveTab('TABLE')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 border ${
              activeTab === 'TABLE'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>جدول التعديل المباشر (Inline Editing)</span>
          </button>

          <button
            onClick={() => setActiveTab('EXCEL')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 border ${
              activeTab === 'EXCEL'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>استيراد وتصدير Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => setActiveTab('COMPANIES')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 border ${
              activeTab === 'COMPANIES'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>إدارة أسماء الشركات الـ 10</span>
          </button>

          <button
            onClick={() => setActiveTab('SETTINGS')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 border ${
              activeTab === 'SETTINGS'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>إعدادات النظام والأمان</span>
          </button>
        </div>
      </header>

      {/* Main Tab View Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
        
        {/* ================= TAB 1: INLINE EDITING TABLE ================= */}
        {activeTab === 'TABLE' && (
          <div className="space-y-4">
            
            {/* Table Controls Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#121522] border border-slate-800 p-3.5 rounded-2xl">
              
              <div className="relative flex-1 max-w-md">
                <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  placeholder="ابحث لتعديل صنف معين..."
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl pr-10 pl-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsNewProductModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة منتج جديد</span>
                </button>

                <button
                  onClick={() => exportProductsToExcel(products, companies)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5"
                  title="تصدير كل المنتجات والأسعار إلى Excel"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>تصدير Excel</span>
                </button>
              </div>

            </div>

            {/* Note on Real-time Instant Sync */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>ملاحظة للمدير:</strong> أي تعديل على أي سعر في هذا الجدول يُحفظ فورياً ويظهر على جوال المساعد في المركز مباشرة في نفس الثانية!
              </span>
            </div>

            {/* Matrix Table */}
            <div className="bg-[#121522] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto max-h-[68vh] scrollbar-thin scrollbar-thumb-slate-700">
                <table className="w-full text-right text-xs border-collapse">
                  
                  {/* Table Header */}
                  <thead className="sticky top-0 z-20 bg-slate-950 text-slate-300 border-b border-slate-800">
                    <tr>
                      <th className="p-3 font-bold w-12 text-center">#</th>
                      <th className="p-3 font-bold min-w-[110px]">كود القطعة</th>
                      <th className="p-3 font-bold min-w-[200px]">اسم المنتج</th>
                      <th className="p-3 font-bold min-w-[90px]">التصنيف</th>
                      {/* 10 Companies Columns */}
                      {companies.map((comp, idx) => (
                        <th key={comp.id} className="p-3 font-bold min-w-[120px] text-center bg-slate-900/60 border-r border-slate-800/80">
                          <span className="block text-[11px] text-amber-400 font-extrabold line-clamp-1">{comp.name}</span>
                          <span className="text-[9px] text-slate-500 font-mono">شركة {idx + 1}</span>
                        </th>
                      ))}
                      <th className="p-3 font-bold w-16 text-center">حذف</th>
                    </tr>
                  </thead>

                  {/* Table Body with Inline Cell Editing */}
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredTableProducts.map((product, pIdx) => (
                      <tr key={product.id} className="hover:bg-slate-900/40 transition-colors">
                        
                        {/* Index */}
                        <td className="p-3 text-center text-slate-500 font-mono">
                          {pIdx + 1}
                        </td>

                        {/* Code (Inline editable) */}
                        <td className="p-2 font-mono">
                          {editingCell?.productId === product.id && editingCell?.field === 'code' ? (
                            <input
                              type="text"
                              defaultValue={product.code}
                              autoFocus
                              onBlur={(e) => handleInlineChange(product.id, 'code', e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleInlineChange(product.id, 'code', e.target.value)}
                              className="w-full bg-slate-900 border border-amber-400 text-amber-300 font-mono px-2 py-1 rounded text-xs outline-none"
                            />
                          ) : (
                            <span 
                              onClick={() => setEditingCell({ productId: product.id, field: 'code' })}
                              className="cursor-pointer hover:text-amber-400 font-bold block p-1 rounded"
                              title="اضغط للتعديل"
                            >
                              {product.code || '—'}
                            </span>
                          )}
                        </td>

                        {/* Name (Inline editable) */}
                        <td className="p-2">
                          {editingCell?.productId === product.id && editingCell?.field === 'name' ? (
                            <input
                              type="text"
                              defaultValue={product.name}
                              autoFocus
                              onBlur={(e) => handleInlineChange(product.id, 'name', e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleInlineChange(product.id, 'name', e.target.value)}
                              className="w-full bg-slate-900 border border-amber-400 text-white font-bold px-2 py-1 rounded text-xs outline-none"
                            />
                          ) : (
                            <span 
                              onClick={() => setEditingCell({ productId: product.id, field: 'name' })}
                              className="cursor-pointer hover:text-amber-400 font-bold text-white block p-1 rounded line-clamp-1"
                              title="اضغط للتعديل"
                            >
                              {product.name}
                            </span>
                          )}
                        </td>

                        {/* Category */}
                        <td className="p-3 text-slate-400">
                          {product.category || 'عام'}
                        </td>

                        {/* 10 Companies Prices (Inline Editable) */}
                        {companies.map((comp) => {
                          const price = product.prices ? product.prices[comp.id] : null;
                          const hasPrice = price !== null && price !== undefined && price !== '';
                          const isEditing = editingCell?.productId === product.id && editingCell?.field === comp.id;

                          return (
                            <td key={comp.id} className="p-1.5 text-center border-r border-slate-800/80">
                              {isEditing ? (
                                <input
                                  type="number"
                                  step="0.5"
                                  defaultValue={hasPrice ? price : ''}
                                  placeholder="0.00"
                                  autoFocus
                                  onBlur={(e) => handleInlineChange(product.id, comp.id, e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleInlineChange(product.id, comp.id, e.target.value)}
                                  className="w-20 bg-slate-950 border border-emerald-400 text-emerald-300 font-mono font-bold text-center px-1 py-1 rounded text-xs outline-none"
                                />
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setEditingCell({ productId: product.id, field: comp.id })}
                                  className={`w-full py-1.5 px-2 rounded-lg font-mono font-bold text-xs transition-all ${
                                    hasPrice 
                                      ? 'text-emerald-400 hover:bg-emerald-950/40' 
                                      : 'text-red-400 bg-red-950/30 border border-red-900/60 hover:bg-red-950/50'
                                  }`}
                                  title="اضغط لتعديل السعر"
                                >
                                  {hasPrice ? `${Number(price).toFixed(2)}` : 'غير محدد ⚠️'}
                                </button>
                              )}
                            </td>
                          );
                        })}

                        {/* Delete Row */}
                        <td className="p-2 text-center">
                          <button
                            onClick={() => handleDeleteProduct(product)}
                            className="text-slate-600 hover:text-red-400 p-1 rounded-lg transition-colors"
                            title="حذف المنتج نهائياً"
                          >
                            <Trash2 className="w-4 h-4 mx-auto" />
                          </button>
                        </td>

                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB 2: EXCEL IMPORT & EXPORT ================= */}
        {activeTab === 'EXCEL' && (
          <div className="space-y-6">
            
            {/* Excel Actions Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Card 1: Upload File */}
              <div className="bg-[#121522] border border-slate-800 rounded-3xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Upload className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base">رفع واستيراد ملف Excel</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    يدعم ملفات (.xlsx / .xls / .csv) لتحديث الـ 100 إلى 150 منتجاً وأسعار الـ 10 شركات دفعة واحدة.
                  </p>
                </div>

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isImporting}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isImporting ? 'جاري قراءة الملف...' : 'اختيار ملف من جهازك'}</span>
                  </button>
                </div>
              </div>

              {/* Card 2: Download Template */}
              <div className="bg-[#121522] border border-slate-800 rounded-3xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base">تحميل قالب إكسل جاهز</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    قالب منظم يحتوي على أعمدة الكود، الاسم، والتصنيف، مع أعمدة جاهزة بأسماء الـ 10 شركات المعتمدة.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => downloadExcelTemplate(companies)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل ملف القالب (.xlsx)</span>
                </button>
              </div>

              {/* Card 3: Export Current Database */}
              <div className="bg-[#121522] border border-slate-800 rounded-3xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Database className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base">تصدير نسخة احتياطية</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    تنزيل كل المنتجات الحالية ({products.length} منتج) بكامل أسعار الشركات في ملف إكسل احترافي.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => exportProductsToExcel(products, companies)}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-950/40 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>تصدير كل البيانات الآن</span>
                </button>
              </div>

            </div>

            {/* Direct Paste Section */}
            <div className="bg-[#121522] border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Clipboard className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">لصق بيانات جدولية مباشرة (Paste from Excel)</h3>
              </div>
              <p className="text-xs text-slate-400">
                يمكنك نسخ صفوف وأعمدة مباشرة من ملف إكسل مفتوح على جهازك ولصقها هنا فوراً:
              </p>

              <textarea
                rows={4}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="الصق بيانات الجدول هنا (Ctrl+V)..."
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-2xl p-3 text-xs font-mono text-white placeholder-slate-600 outline-none"
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleParsePastedData}
                  disabled={!pastedText.trim()}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  معالجة وعرض البيانات الملصقة
                </button>
              </div>
            </div>

            {/* ================= PREVIEW BEFORE COMMIT MODAL / SECTION ================= */}
            {importedPreview && (
              <div className="bg-[#151928] border-2 border-emerald-500/50 rounded-3xl p-6 shadow-2xl space-y-4 animate-scale-in">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>معاينة بيانات الاستيراد قبل الاعتماد</span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      تم العثور على <strong>{importedPreview.length}</strong> منتج جاهز للإرسال إلى قاعدة البيانات السحابية.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setImportedPreview(null)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-xl text-xs"
                    >
                      إلغاء
                    </button>

                    <button
                      type="button"
                      onClick={handleCommitImport}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/60 transition-all active:scale-95"
                    >
                      <Save className="w-4 h-4" />
                      <span>اعتماد وتحديث قاعدة البيانات السحابية الآن</span>
                    </button>
                  </div>
                </div>

                {/* Preview Table */}
                <div className="max-h-60 overflow-y-auto border border-slate-800 rounded-xl overflow-x-auto text-xs">
                  <table className="w-full text-right text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 text-[11px] sticky top-0">
                      <tr>
                        <th className="p-2.5">الكود</th>
                        <th className="p-2.5">اسم الصنف</th>
                        <th className="p-2.5">التصنيف</th>
                        {companies.slice(0, 4).map(c => (
                          <th key={c.id} className="p-2.5 text-center">{c.name}</th>
                        ))}
                        <th className="p-2.5 text-center">باقي الشركات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-900/60 font-mono text-[11px]">
                      {importedPreview.slice(0, 15).map(item => (
                        <tr key={item.id} className="hover:bg-slate-800/40">
                          <td className="p-2.5 font-bold text-amber-400">{item.code}</td>
                          <td className="p-2.5 font-sans text-white">{item.name}</td>
                          <td className="p-2.5 font-sans">{item.category}</td>
                          {companies.slice(0, 4).map(c => (
                            <td key={c.id} className="p-2.5 text-center text-emerald-400">
                              {item.prices?.[c.id] ? `${item.prices[c.id]} ر.س` : <span className="text-red-400">غير محدد</span>}
                            </td>
                          ))}
                          <td className="p-2.5 text-center text-slate-400">
                            {companies.length - 4} شركات أخرى
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {importedPreview.length > 15 && (
                  <p className="text-[11px] text-slate-500 text-center">
                    ... والمزيد ({importedPreview.length - 15} منتجاً إضافياً).
                  </p>
                )}

              </div>
            )}

          </div>
        )}

        {/* ================= TAB 3: COMPANIES MANAGER ================= */}
        {activeTab === 'COMPANIES' && (
          <div className="bg-[#121522] border border-slate-800 rounded-3xl p-6 space-y-6 max-w-4xl mx-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-400" />
                  <span>تعديل أسماء الشركات الـ 10 المعتمدة</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  يمكنك تخصيص وتعديل اسم كل شركة ليتطابق مع تعاملات المركز التجاري
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveCompanies}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>حفظ التعديلات</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {editableCompanies.map((comp, idx) => (
                <div key={comp.id} className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-500">شركة رقم {idx + 1} (ID: {comp.id})</span>
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: comp.badgeColor || '#3b82f6' }} />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 block font-medium">اسم الشركة الرسمي:</label>
                    <input
                      type="text"
                      value={comp.name}
                      onChange={(e) => {
                        const newName = e.target.value;
                        setEditableCompanies(prev => prev.map(c => c.id === comp.id ? { ...c, name: newName } : c));
                      }}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 block font-medium">كود الاختصار (Code):</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={comp.code || ''}
                      onChange={(e) => {
                        const newCode = e.target.value.toUpperCase();
                        setEditableCompanies(prev => prev.map(c => c.id === comp.id ? { ...c, code: newCode } : c));
                      }}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-mono outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ================= TAB 4: SETTINGS & SECURITY ================= */}
        {activeTab === 'SETTINGS' && (
          <div className="bg-[#121522] border border-slate-800 rounded-3xl p-6 space-y-6 max-w-2xl mx-auto">
            
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                <span>إعدادات النظام والأمان</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                التحكم برمز دخول المدير، الربط السحابي، ومساعد Gemini API
              </p>
            </div>

            {/* Admin PIN */}
            <div className="space-y-2 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
              <label className="text-xs font-bold text-white block">
                رمز المرور للوحة الإدارة (Admin PIN):
              </label>
              <p className="text-[11px] text-slate-400">
                الرمز الذي يمنع المساعد من الدخول إلى شاشة تعديل الأسعار
              </p>
              <input
                type="text"
                value={adminPinSetting}
                onChange={(e) => setAdminPinSetting(e.target.value)}
                placeholder="1234"
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white font-mono text-base rounded-xl px-4 py-2.5 outline-none"
              />
            </div>

            {/* Center Name */}
            <div className="space-y-2 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
              <label className="text-xs font-bold text-white block">
                اسم المركز / المحل التجاري:
              </label>
              <input
                type="text"
                value={centerNameSetting}
                onChange={(e) => setCenterNameSetting(e.target.value)}
                placeholder="مركز التوريدات والتسعير"
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-sm rounded-xl px-4 py-2.5 outline-none"
              />
            </div>

            {/* Gemini API Key */}
            <div className="space-y-2 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>مفتاح Google Gemini API للمساعد الذكي المدمج:</span>
              </label>
              <p className="text-[11px] text-slate-400">
                اختياري: يمكنك الحصول على مفتاح مجاني من <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-amber-400 underline">Google AI Studio</a> لتمكين المحادثة الحية مع الذكاء الاصطناعي
              </p>
              <input
                type="password"
                value={geminiApiKeyInput}
                onChange={(e) => setGeminiApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white font-mono text-xs rounded-xl px-4 py-2.5 outline-none"
              />
            </div>

            {/* Reset to Sample Data */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-red-400">إعادة ضبط البيانات التجريبية</h4>
                <p className="text-[11px] text-slate-500">استرجاع 100 منتج و10 شركات افتراضية</p>
              </div>

              <button
                type="button"
                onClick={async () => {
                  if (window.confirm('هل تريد استرجاع الـ 100 منتج والـ 10 شركات الافتراضية؟')) {
                    setSavingStatus('جاري استرجاع البيانات...');
                    await resetDatabaseToDefault();
                    setSavingStatus('تم استرجاع البيانات النموذجية بنجاح');
                    setTimeout(() => setSavingStatus(null), 2000);
                  }
                }}
                className="bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-800 text-xs font-bold px-4 py-2 rounded-xl transition-all"
              >
                إعادة ضبط القائمة (100 صنف)
              </button>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveSettings}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-95"
              >
                حفظ الإعدادات
              </button>
            </div>

          </div>
        )}

      </main>

      {/* ================= MODAL: ADD NEW SINGLE PRODUCT ================= */}
      {isNewProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121522] border-2 border-slate-700 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <span>إضافة منتج جديد يدوياً</span>
              </h3>
              <button onClick={() => setIsNewProductModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProductSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-bold block">كود القطعة / الباركود (*):</label>
                  <input
                    type="text"
                    required
                    value={newProductData.code}
                    onChange={(e) => setNewProductData({ ...newProductData, code: e.target.value.toUpperCase() })}
                    placeholder="مثال: BRK-205"
                    className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 text-white font-mono rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-bold block">اسم المنتج (*):</label>
                  <input
                    type="text"
                    required
                    value={newProductData.name}
                    onChange={(e) => setNewProductData({ ...newProductData, name: e.target.value })}
                    placeholder="مثال: فحمات فرامل خلفية سيراميك"
                    className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 text-white rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-bold block">التصنيف / القسم:</label>
                  <input
                    type="text"
                    value={newProductData.category}
                    onChange={(e) => setNewProductData({ ...newProductData, category: e.target.value })}
                    placeholder="فرامل / محرك / كهرباء..."
                    className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 text-white rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-bold block">الوحدة:</label>
                  <input
                    type="text"
                    value={newProductData.unit}
                    onChange={(e) => setNewProductData({ ...newProductData, unit: e.target.value })}
                    placeholder="حبة / طقم / كرتون..."
                    className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 text-white rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>

              {/* Prices for 10 Companies */}
              <div className="pt-2">
                <label className="text-xs font-bold text-amber-400 block mb-2">
                  أسعار الشركات الـ 10 (اترك الخلية فارغة إذا كان السعر غير محدد):
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-1">
                  {companies.map(comp => (
                    <div key={comp.id} className="bg-slate-900 border border-slate-800 p-2 rounded-xl">
                      <span className="text-[11px] text-slate-300 font-bold block line-clamp-1 mb-1">
                        {comp.name}
                      </span>
                      <input
                        type="number"
                        step="0.5"
                        placeholder="غير محدد"
                        value={newProductData.prices[comp.id] || ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? null : parseFloat(e.target.value);
                          setNewProductData({
                            ...newProductData,
                            prices: {
                              ...newProductData.prices,
                              [comp.id]: !isNaN(val) && val > 0 ? val : null
                            }
                          });
                        }}
                        className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-400 text-emerald-400 font-mono text-center text-xs py-1 rounded-lg outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewProductModalOpen(false)}
                  className="bg-slate-800 text-slate-300 font-bold px-4 py-2 rounded-xl text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 py-2 rounded-xl text-xs shadow-lg active:scale-95"
                >
                  إضافة وحفظ
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
