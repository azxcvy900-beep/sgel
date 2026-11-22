import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  Plus, 
  Minus, 
  Trash2, 
  RotateCcw, 
  ShoppingCart, 
  CheckCircle2, 
  FileText, 
  Layers, 
  X,
  Sparkles,
  Barcode
} from 'lucide-react';

export function AssistantView({ 
  products = [], 
  companies = [], 
  isSynced = false,
  centerName = 'مركز التوريدات والتسعير'
}) {
  // Selected company state
  const [selectedCompanyId, setSelectedCompanyId] = useState(companies[0]?.id || 'c1');
  const [isCompanyLocked, setIsCompanyLocked] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [filterPriceStatus, setFilterPriceStatus] = useState('ALL'); // 'ALL' | 'PRICED' | 'UNPRICED'

  // Cart / Calculator state
  const [cart, setCart] = useState([]);
  const [isCartOpenOnMobile, setIsCartOpenOnMobile] = useState(false);
  const [lastAddedNotice, setLastAddedNotice] = useState(null);

  // Active company object
  const activeCompany = useMemo(() => {
    return companies.find(c => c.id === selectedCompanyId) || companies[0] || { id: 'c1', name: 'الشركة' };
  }, [companies, selectedCompanyId]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set();
    products.forEach(p => { if (p.category) set.add(p.category); });
    return ['ALL', ...Array.from(set)];
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return products.filter(product => {
      // Search match (name, code, barcode)
      const matchesSearch = !q || 
        product.name.toLowerCase().includes(q) ||
        (product.code && product.code.toLowerCase().includes(q)) ||
        (product.barcode && product.barcode.includes(q)) ||
        (product.category && product.category.toLowerCase().includes(q));

      // Category match
      const matchesCategory = selectedCategory === 'ALL' || product.category === selectedCategory;

      // Price check for active company
      const rawPrice = product.prices ? product.prices[selectedCompanyId] : null;
      const isPriced = rawPrice !== null && rawPrice !== undefined && rawPrice !== '' && !isNaN(Number(rawPrice)) && Number(rawPrice) > 0;

      let matchesStatus = true;
      if (filterPriceStatus === 'PRICED') matchesStatus = isPriced;
      if (filterPriceStatus === 'UNPRICED') matchesStatus = !isPriced;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchQuery, selectedCategory, filterPriceStatus, selectedCompanyId]);

  // Cart Add / Update / Remove / Reset
  const addToCart = (product) => {
    const rawPrice = product.prices ? product.prices[selectedCompanyId] : null;
    const isPriced = rawPrice !== null && rawPrice !== undefined && !isNaN(Number(rawPrice)) && Number(rawPrice) > 0;

    if (!isPriced) {
      alert(`⚠️ لا يمكن إضافة (${product.name}) إلى الفاتورة لأن السعر غير محدد لـ ${activeCompany.name}. يرجى مراجعة الإدارة.`);
      return;
    }

    const price = Number(rawPrice);
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.companyId === selectedCompanyId);
      if (existing) {
        return prev.map(item => 
          item.id === product.id && item.companyId === selectedCompanyId 
            ? { ...item, qty: item.qty + 1 } 
            : item
        );
      }
      return [...prev, {
        id: product.id,
        code: product.code,
        name: product.name,
        unit: product.unit || 'حبة',
        price,
        companyId: selectedCompanyId,
        companyName: activeCompany.name,
        qty: 1
      }];
    });

    setLastAddedNotice(product.name);
    setTimeout(() => setLastAddedNotice(null), 2500);
  };

  const updateCartQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const resetCartForNextCustomer = () => {
    if (cart.length > 0) {
      if (window.confirm('هل تريد بالتأكيد تصفير السلة للعميل التالي؟')) {
        setCart([]);
      }
    }
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  }, [cart]);

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col font-sans">
      
      {/* ================= TOP STICKY BAR: COMPANY SELECTOR ================= */}
      <section className="sticky top-0 z-30 bg-[#0d0f17]/95 backdrop-blur-md border-b border-slate-800 shadow-xl px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Company Selector Unit */}
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-300">
              <Building2 className="w-5 h-5 text-amber-400 shrink-0" />
              <span className="font-bold text-xs uppercase tracking-wider text-slate-400 hidden sm:inline">الشركة المعتمدة:</span>
            </div>

            <div className="relative flex-1 max-w-md">
              <select
                value={selectedCompanyId}
                onChange={(e) => {
                  setSelectedCompanyId(e.target.value);
                }}
                className="w-full appearance-none bg-slate-900 border-2 border-amber-500/50 hover:border-amber-400 focus:border-amber-400 text-white font-bold text-base sm:text-lg rounded-xl px-4 py-2.5 pr-10 focus:outline-none shadow-lg cursor-pointer transition-all"
              >
                {companies.map((comp, idx) => (
                  <option key={comp.id} value={comp.id} className="bg-slate-900 text-white font-medium py-2">
                    {idx + 1}. {comp.name} {comp.code ? `(${comp.code})` : ''}
                  </option>
                ))}
              </select>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-amber-400 font-bold text-xs">
                ▼
              </div>
            </div>

            {/* Lock Company Toggle (Rule 1: Remains pinned for multiple items on same invoice) */}
            <button
              type="button"
              onClick={() => setIsCompanyLocked(!isCompanyLocked)}
              title={isCompanyLocked ? 'الشركة مثبتة لهذه الفاتورة' : 'تثبيت الشركة لمنع التغيير العرضي'}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                isCompanyLocked 
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              {isCompanyLocked ? <Lock className="w-4 h-4 text-amber-400" /> : <Unlock className="w-4 h-4" />}
              <span className="hidden sm:inline">{isCompanyLocked ? 'مثبتة للعميل' : 'تثبيت'}</span>
            </button>
          </div>

          {/* Quick Stats & Mobile Cart Trigger */}
          <div className="flex items-center gap-2 justify-end">
            {/* Live Sync Status Indicator */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border ${
              isSynced 
                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60' 
                : 'bg-slate-800/80 text-slate-400 border-slate-700'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isSynced ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span className="hidden lg:inline">{isSynced ? 'مزامنة سحابية حية' : 'تحديث محلي'}</span>
            </div>

            {/* Mobile Cart Button */}
            <button
              onClick={() => setIsCartOpenOnMobile(true)}
              className="lg:hidden flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-950/40 active:scale-95 transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>الحساب:</span>
              <span className="bg-black/30 px-2 py-0.5 rounded-md font-mono">{cartTotal.toFixed(2)} ر.س</span>
              {cart.length > 0 && (
                <span className="bg-amber-400 text-black text-xs font-extrabold w-5 h-5 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>
          </div>

        </div>
      </section>

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ================= LEFT/MAIN COLUMN: SEARCH & PRODUCTS (Cols 8) ================= */}
        <main className="lg:col-span-8 flex flex-col gap-4">

          {/* Instant Live Search Input */}
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث فورياً باسم المنتج، رقم القطعة، أو الباركود..."
              className="w-full bg-[#121520] border-2 border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-white placeholder-slate-500 text-base sm:text-lg rounded-2xl pr-12 pl-10 py-3.5 shadow-inner transition-all outline-none"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Categories & Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all border ${
                  selectedCategory === cat 
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {cat === 'ALL' ? 'جميع الأقسام' : cat}
              </button>
            ))}
          </div>

          {/* Counter Bar */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              عرض <strong className="text-amber-400">{filteredProducts.length}</strong> منتج لـ: <strong className="text-white">{activeCompany.name}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setFilterPriceStatus(filterPriceStatus === 'UNPRICED' ? 'ALL' : 'UNPRICED')}
                className={`px-2.5 py-1 rounded-lg border transition-all ${
                  filterPriceStatus === 'UNPRICED' 
                    ? 'bg-red-500/20 text-red-400 border-red-500 font-bold' 
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                المفقود سعرها فقط ⚠️
              </button>
            </div>
          </div>

          {/* Floating alert when product is added */}
          {lastAddedNotice && (
            <div className="fixed bottom-6 left-6 z-50 bg-emerald-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
              <CheckCircle2 className="w-5 h-5 text-emerald-200" />
              <span>تمت إضافة ({lastAddedNotice}) إلى سلة الحساب</span>
            </div>
          )}

          {/* ================= PRODUCTS GRID ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {filteredProducts.map(product => {
              const rawPrice = product.prices ? product.prices[selectedCompanyId] : null;
              const hasValidPrice = rawPrice !== null && rawPrice !== undefined && rawPrice !== '' && !isNaN(Number(rawPrice)) && Number(rawPrice) > 0;
              const formattedPrice = hasValidPrice ? Number(rawPrice).toFixed(2) : null;

              return (
                <div 
                  key={product.id}
                  className={`relative rounded-2xl border transition-all p-4 flex flex-col justify-between ${
                    hasValidPrice
                      ? 'bg-[#121522] border-slate-800 hover:border-slate-700 shadow-md hover:shadow-xl'
                      : 'bg-red-950/20 border-red-900/60 shadow-md shadow-red-950/10'
                  }`}
                >
                  {/* Card Header: Code & Category */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-xs font-bold bg-slate-900/90 text-amber-400 border border-slate-800 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <Barcode className="w-3.5 h-3.5 text-slate-500" />
                        {product.code || 'بدون كود'}
                      </span>
                      <span className="text-[11px] text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-md">
                        {product.category || 'عام'}
                      </span>
                    </div>

                    {/* Product Name */}
                    <h3 className="text-base sm:text-lg font-bold text-white leading-snug line-clamp-2 mb-3">
                      {product.name}
                    </h3>
                  </div>

                  {/* Card Bottom: Prominent Price & Safety Alert */}
                  <div className="mt-2 pt-3 border-t border-slate-800/80 flex items-end justify-between gap-2">
                    
                    {/* Price Block */}
                    <div className="flex-1">
                      <div className="text-[10px] text-slate-400 font-medium mb-0.5">
                        السعر المعتمد ({product.unit || 'حبة'}):
                      </div>

                      {hasValidPrice ? (
                        <div className="flex items-baseline gap-1 text-emerald-400">
                          <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight drop-shadow-sm">
                            {formattedPrice}
                          </span>
                          <span className="text-xs font-bold text-emerald-300">ر.س</span>
                        </div>
                      ) : (
                        /* ================= STRICT SAFETY RULE ALERT ================= */
                        <div className="inline-flex items-center gap-1.5 bg-red-600/95 text-white px-3 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold shadow-lg shadow-red-900/30 animate-pulse border border-red-400">
                          <AlertTriangle className="w-4 h-4 text-yellow-300 shrink-0" />
                          <span>السعر غير محدد - راجع الإدارة</span>
                        </div>
                      )}
                    </div>

                    {/* Quick Add to Cart Button */}
                    <button
                      type="button"
                      disabled={!hasValidPrice}
                      onClick={() => addToCart(product)}
                      title={hasValidPrice ? 'إضافة للحساب الفوري' : 'لا يمكن الإضافة، السعر غير محدد'}
                      className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shrink-0 ${
                        hasValidPrice
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95 shadow-emerald-950/40'
                          : 'bg-slate-800/80 text-slate-500 border border-slate-800 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="bg-[#121522] border border-slate-800 rounded-3xl p-12 text-center my-6 space-y-3">
              <Search className="w-12 h-12 text-slate-600 mx-auto" />
              <h4 className="text-lg font-bold text-slate-300">لا توجد نتائج مطابقة</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                لم نجد أي صنف يطابق "{searchQuery}". تحقق من الكود أو اسم القطعة، أو قم بمسح الفلتر.
              </p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); setFilterPriceStatus('ALL'); }}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
              >
                إعادة ضبط البحث
              </button>
            </div>
          )}

        </main>

        {/* ================= RIGHT COLUMN: QUICK CALCULATOR / CART (Cols 4 Desktop) ================= */}
        <aside className="hidden lg:block lg:col-span-4">
          <div className="sticky top-20 bg-[#121522] border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col h-[calc(100vh-6rem)]">
            
            {/* Calculator Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-white">حساب الطلب الحالي</h2>
              </div>
              <span className="text-xs font-bold bg-slate-800 px-2.5 py-1 rounded-full text-slate-300">
                {cart.length} أصناف
              </span>
            </div>

            {/* Active Company in Cart */}
            <div className="py-2.5 px-3 my-3 bg-slate-900/80 border border-slate-800 rounded-xl text-xs flex items-center justify-between">
              <span className="text-slate-400">التسعير بحسب:</span>
              <strong className="text-amber-400 font-bold">{activeCompany.name}</strong>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-2 scrollbar-thin scrollbar-thumb-slate-700">
              {cart.map(item => (
                <div 
                  key={`${item.id}_${item.companyId}`}
                  className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-3 flex flex-col gap-2 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{item.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">{item.code}</span>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                      title="حذف الصنف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                    {/* Stepper */}
                    <div className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded-lg">
                      <button 
                        onClick={() => updateCartQty(item.id, -1)} 
                        className="text-slate-300 hover:text-white"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono text-xs font-bold px-1.5 text-amber-300">{item.qty}</span>
                      <button 
                        onClick={() => updateCartQty(item.id, 1)} 
                        className="text-slate-300 hover:text-white"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-left font-mono">
                      <span className="text-[10px] text-slate-500 block">{(item.price).toFixed(2)} × {item.qty}</span>
                      <strong className="text-sm font-bold text-emerald-400">{(item.price * item.qty).toFixed(2)} ر.س</strong>
                    </div>
                  </div>
                </div>
              ))}

              {cart.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                  <ShoppingCart className="w-10 h-10 stroke-1 text-slate-600" />
                  <p className="text-xs">السلة فارغة حالياً</p>
                  <p className="text-[11px] text-slate-600">اضغط على زر (+) بجانب أي منتج لحسابه للعميل</p>
                </div>
              )}
            </div>

            {/* Cart Total & Action Buttons */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 flex items-baseline justify-between">
                <span className="text-sm font-bold text-slate-300">الإجمالي النهائي:</span>
                <div className="text-left font-mono">
                  <span className="text-2xl sm:text-3xl font-black text-amber-400">
                    {cartTotal.toFixed(2)}
                  </span>
                  <span className="text-xs font-bold text-amber-300 mr-1.5">ر.س</span>
                </div>
              </div>

              {/* Reset For Next Customer Button (RULE 1 Requirement) */}
              <button
                type="button"
                onClick={resetCartForNextCustomer}
                disabled={cart.length === 0}
                className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                  cart.length > 0 
                    ? 'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white shadow-red-950/40 active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                <span>تصفير للعميل التالي</span>
              </button>
            </div>

          </div>
        </aside>

      </div>

      {/* ================= MOBILE CART MODAL / DRAWER ================= */}
      {isCartOpenOnMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#121522] border-t border-slate-800 rounded-t-3xl max-h-[85vh] flex flex-col p-5 shadow-2xl animate-slide-up">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">سلة حساب العميل</h3>
              </div>
              <button 
                onClick={() => setIsCartOpenOnMobile(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="py-2 text-xs text-slate-400 flex justify-between">
              <span>الشركة: <strong className="text-amber-400">{activeCompany.name}</strong></span>
              <span>الأصناف: <strong>{cart.length}</strong></span>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto space-y-2 py-3 max-h-[45vh]">
              {cart.map(item => (
                <div key={item.id} className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <h5 className="text-xs font-bold text-white line-clamp-1">{item.name}</h5>
                    <span className="text-[10px] text-slate-400 font-mono">{item.code}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg">
                      <button onClick={() => updateCartQty(item.id, -1)} className="text-slate-300">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono text-xs font-bold px-1 text-amber-300">{item.qty}</span>
                      <button onClick={() => updateCartQty(item.id, 1)} className="text-slate-300">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <strong className="text-xs font-bold text-emerald-400 font-mono">
                      {(item.price * item.qty).toFixed(2)} ر.س
                    </strong>

                    <button onClick={() => removeFromCart(item.id)} className="text-slate-500 hover:text-red-400 p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {cart.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-xs">
                  لا توجد أصناف في السلة
                </div>
              )}
            </div>

            {/* Total and Reset */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl">
                <span className="text-sm font-bold text-slate-300">الإجمالي:</span>
                <span className="text-2xl font-black font-mono text-amber-400">{cartTotal.toFixed(2)} ر.س</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    resetCartForNextCustomer();
                    setIsCartOpenOnMobile(false);
                  }}
                  disabled={cart.length === 0}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>تصفير للعميل التالي</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCartOpenOnMobile(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl text-xs"
                >
                  متابعة التسعير
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
