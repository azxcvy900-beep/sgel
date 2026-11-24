'use client';

import { useState, useEffect, useRef } from 'react';
import { ref, onValue, set, off } from 'firebase/database';
import { rtdb } from '../firebase/config';
import VoiceAssistantModal from './VoiceAssistantModal';

// ============================================================
// PWA INSTALL PROMPT
// ============================================================
function InstallPrompt() {
  const [prompt, setPrompt] = useState(null);
  const [showIos, setShowIos] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (window.navigator.standalone) return;
    if (localStorage.getItem('pwa-dismissed')) return;

    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isSafari = /safari/i.test(navigator.userAgent) && !/chrome/i.test(navigator.userAgent);
    if (isIos && isSafari) {
      setTimeout(() => setShowIos(true), 2500);
    }
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  function dismiss() {
    setPrompt(null);
    setShowIos(false);
    setDismissed(true);
    localStorage.setItem('pwa-dismissed', '1');
  }

  async function install() {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') dismiss();
    else setPrompt(null);
  }

  if (dismissed) return null;

  if (prompt) return (
    <div className="install-banner">
      <img src="/icon-192.png" alt="icon" className="install-icon" />
      <div className="install-text">
        <strong>تثبيت مركز الأسعار</strong>
        <span>تطبيق سريع وخفيف على شاشتك</span>
      </div>
      <div className="install-actions">
        <button className="btn-install" onClick={install}>تثبيت</button>
        <button className="btn-dismiss" onClick={dismiss}>لاحقاً</button>
      </div>
    </div>
  );

  if (showIos) return (
    <div className="install-banner ios">
      <img src="/icon-192.png" alt="icon" className="install-icon" />
      <div className="install-text">
        <strong>تثبيت على iPhone</strong>
        <span>اضغط <strong>مشاركة</strong> ثم <strong>"إضافة إلى الشاشة الرئيسية"</strong></span>
      </div>
      <button className="btn-dismiss" onClick={dismiss}>✕</button>
    </div>
  );

  return null;
}

// ============================================================
// SAMPLE DATA
// ============================================================
const SAMPLE_COMPANIES = [
  'شركة الخليج', 'شركة النجوم', 'شركة المستقبل', 'شركة الأمل',
  'شركة الرياض', 'شركة جدة', 'شركة الدمام', 'شركة المدينة'
];

const SAMPLE_PRODUCTS = Array.from({ length: 15 }, (_, i) => ({
  id: `p${i + 1}`,
  name: `منتج تجريبي ${i + 1}`,
  code: `PRD-${String(i + 1).padStart(4, '0')}`,
  prices: Object.fromEntries(
    SAMPLE_COMPANIES.map((c, ci) => [
      c,
      ci % 3 === 0 && i % 2 === 0 ? null : Math.floor(Math.random() * 400 + 40)
    ])
  )
}));

const DEFAULT_PIN = '1234';

function formatPrice(val) {
  if (val === null || val === undefined || val === '' || val === 0) return null;
  return Number(val).toLocaleString('ar-SA');
}

// ============================================================
// MAIN APP COMPONENT
// ============================================================
export default function PriceLookup() {
  const [view, setView] = useState('assistant'); // 'assistant' | 'admin' | 'pin'
  const [companies, setCompanies] = useState(SAMPLE_COMPANIES);
  const [products, setProducts] = useState(SAMPLE_PRODUCTS);
  const [firebaseConnected, setFirebaseConnected] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [adminPin, setAdminPin] = useState(DEFAULT_PIN);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  // Quick manual add modal
  const [quickAddModal, setQuickAddModal] = useState(null); // 'product' | 'company' | null
  const [newProdName, setNewProdName] = useState('');
  const [newProdCode, setNewProdCode] = useState('');
  const [newProdCompany, setNewProdCompany] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newCompName, setNewCompName] = useState('');
  const [quickPin, setQuickPin] = useState('');
  const [quickPinErr, setQuickPinErr] = useState(false);

  // Load from Firebase
  useEffect(() => {
    const dbRef = ref(rtdb, 'pricing_hub');
    const unsub = onValue(dbRef, (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        if (data.companies) setCompanies(data.companies);
        if (data.products) {
          const arr = Object.entries(data.products).map(([id, p]) => ({ id, ...p }));
          setProducts(arr);
        }
        if (data.adminPin) setAdminPin(data.adminPin);
        setFirebaseConnected(true);
      }
    }, () => setFirebaseConnected(false));
    return () => off(dbRef);
  }, []);

  function handlePinSubmit(e) {
    e.preventDefault();
    if (pinInput === adminPin) {
      setView('admin');
      setPinInput('');
      setPinError(false);
    } else {
      setPinError(true);
      setPinInput('');
    }
  }

  // Handle Voice Assistant action
  const handleApplyAiAction = async (action) => {
    if (!action) return;
    let updatedCompanies = [...companies];
    let updatedProducts = [...products];

    if (action.type === 'ADD_COMPANY' && action.company) {
      if (!updatedCompanies.includes(action.company)) {
        updatedCompanies.push(action.company);
        setCompanies(updatedCompanies);
      }
    } else if (action.type === 'ADD_PRODUCT' && action.productName) {
      const newId = 'p_' + Date.now();
      const newProduct = {
        id: newId,
        name: action.productName,
        code: action.productCode || ('PRD-' + Date.now().toString().slice(-4)),
        prices: Object.fromEntries(updatedCompanies.map(c => [
          c,
          c === action.company ? Number(action.price) || null : null
        ]))
      };
      updatedProducts = [newProduct, ...updatedProducts];
      setProducts(updatedProducts);
    } else if (action.type === 'UPDATE_PRICE' && action.productName && action.company) {
      const pIdx = updatedProducts.findIndex(p =>
        p.name?.toLowerCase().includes(action.productName.toLowerCase()) ||
        p.code?.toLowerCase() === action.productName.toLowerCase()
      );
      if (pIdx !== -1) {
        updatedProducts[pIdx] = {
          ...updatedProducts[pIdx],
          prices: {
            ...updatedProducts[pIdx].prices,
            [action.company]: Number(action.price) || null
          }
        };
        setProducts(updatedProducts);
      }
    }

    try {
      await saveToFirebase(updatedCompanies, updatedProducts, adminPin);
    } catch (e) {
      console.error('Firebase save error:', e);
    }
  };

  // Quick Add submission
  const handleQuickAddSubmit = async (e) => {
    e.preventDefault();
    if (quickPin !== adminPin) {
      setQuickPinErr(true);
      return;
    }
    setQuickPinErr(false);

    let updatedCompanies = [...companies];
    let updatedProducts = [...products];

    if (quickAddModal === 'product' && newProdName.trim()) {
      const pName = newProdName.trim();
      const pCode = newProdCode.trim() || ('PRD-' + Date.now().toString().slice(-4));
      const targetCompany = newProdCompany || updatedCompanies[0];
      const parsedPrice = Number(newProdPrice) || null;

      // Check if product already exists (so we add/update the price for this specific company)
      const existingIdx = updatedProducts.findIndex(p =>
        p.name?.toLowerCase() === pName.toLowerCase() || (p.code && p.code.toLowerCase() === pCode.toLowerCase())
      );

      if (existingIdx !== -1) {
        // Update existing product with this company's price
        updatedProducts[existingIdx] = {
          ...updatedProducts[existingIdx],
          prices: {
            ...updatedProducts[existingIdx].prices,
            [targetCompany]: parsedPrice
          }
        };
      } else {
        // Create new product with this company's price
        const newProduct = {
          id: 'p_' + Date.now(),
          name: pName,
          code: pCode,
          prices: Object.fromEntries(updatedCompanies.map(c => [
            c,
            c === targetCompany ? parsedPrice : null
          ]))
        };
        updatedProducts = [newProduct, ...updatedProducts];
      }

      setProducts(updatedProducts);
      setNewProdName('');
      setNewProdCode('');
      setNewProdCompany('');
      setNewProdPrice('');
    } else if (quickAddModal === 'company' && newCompName.trim()) {
      if (!updatedCompanies.includes(newCompName.trim())) {
        updatedCompanies.push(newCompName.trim());
        setCompanies(updatedCompanies);
      }
      setNewCompName('');
    }

    try {
      await saveToFirebase(updatedCompanies, updatedProducts, adminPin);
    } catch (err) {
      console.error(err);
    }

    setQuickPin('');
    setQuickAddModal(null);
  };

  return (
    <div className="app-root" dir="rtl">
      <InstallPrompt />

      {/* TOP HEADER */}
      <header className="top-bar">
        <div className="top-bar-inner">
          <div className="top-bar-brand">
            <span className="brand-icon">🏷️</span>
            <div className="brand-text">
              <span className="brand-title">مركز الأسعار</span>
              {firebaseConnected && <span className="live-dot-indicator">● متزامن</span>}
            </div>
          </div>

          <div className="top-bar-actions">
            {/* Quick manual entry in corner */}
            <div className="corner-quick-actions">
              <button
                className="btn-corner-add"
                onClick={() => setQuickAddModal('product')}
                title="إضافة منتج يدوي"
              >
                + منتج
              </button>
              <button
                className="btn-corner-add"
                onClick={() => setQuickAddModal('company')}
                title="إضافة شركة يدوية"
              >
                + شركة
              </button>
            </div>

            {view === 'assistant' ? (
              <button className="btn-admin-pill" onClick={() => setView('pin')}>
                🔐 الإدارة
              </button>
            ) : (
              <button className="btn-back-pill" onClick={() => setView('assistant')}>
                ← التسعير
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN VIEWS */}
      {view === 'assistant' && (
        <AssistantView
          companies={companies}
          products={products}
          onOpenVoice={() => setIsVoiceOpen(true)}
        />
      )}

      {view === 'pin' && (
        <PinView
          pinInput={pinInput}
          setPinInput={setPinInput}
          pinError={pinError}
          onSubmit={handlePinSubmit}
          onCancel={() => { setView('assistant'); setPinInput(''); setPinError(false); }}
        />
      )}

      {view === 'admin' && (
        <AdminView
          companies={companies}
          products={products}
          setCompanies={setCompanies}
          setProducts={setProducts}
          adminPin={adminPin}
          setAdminPin={setAdminPin}
          firebaseConnected={firebaseConnected}
          onSaveToFirebase={saveToFirebase}
        />
      )}

      {/* Voice Assistant Modal with Audio Wave effects */}
      <VoiceAssistantModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        companies={companies}
        products={products}
        adminPin={adminPin}
        onApplyAction={handleApplyAiAction}
      />

      {/* Quick Add Modal (Corner manual insert with PIN) */}
      {quickAddModal && (
        <div className="quick-modal-backdrop" onClick={() => setQuickAddModal(null)}>
          <div className="quick-modal-card" onClick={e => e.stopPropagation()}>
            <div className="quick-modal-header">
              <h3>{quickAddModal === 'product' ? '📦 إضافة منتج جديد' : '🏢 إضافة شركة جديدة'}</h3>
              <button className="btn-close-sm" onClick={() => setQuickAddModal(null)}>✕</button>
            </div>
            <form onSubmit={handleQuickAddSubmit} className="quick-form">
              {quickAddModal === 'product' ? (
                <>
                  <label>اسم المنتج:</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: فحمات كامري أمامية"
                    value={newProdName}
                    onChange={e => setNewProdName(e.target.value)}
                    autoFocus
                  />

                  <div className="quick-form-row">
                    <div className="quick-form-col">
                      <label>الشركة:</label>
                      <select
                        required
                        className="quick-select-company"
                        value={newProdCompany}
                        onChange={e => setNewProdCompany(e.target.value)}
                      >
                        <option value="">-- اختر الشركة --</option>
                        {companies.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="quick-form-col">
                      <label>السعر (ريال):</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="any"
                        placeholder="مثال: 120"
                        value={newProdPrice}
                        onChange={e => setNewProdPrice(e.target.value)}
                      />
                    </div>
                  </div>

                  <label>رقم القطعة / الكود (اختياري):</label>
                  <input
                    type="text"
                    placeholder="مثال: BRK-2024"
                    value={newProdCode}
                    onChange={e => setNewProdCode(e.target.value)}
                  />
                </>
              ) : (
                <>
                  <label>اسم الشركة:</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: شركة الصفا التجارية"
                    value={newCompName}
                    onChange={e => setNewCompName(e.target.value)}
                    autoFocus
                  />
                </>
              )}

              <div className="quick-pin-section">
                <label>رمز التأكيد (1234):</label>
                <input
                  type="password"
                  required
                  maxLength={8}
                  placeholder="رمز الإدارة"
                  value={quickPin}
                  onChange={e => setQuickPin(e.target.value)}
                />
                {quickPinErr && <p className="err-sub">❌ الرمز غير صحيح!</p>}
              </div>

              <div className="quick-form-btns">
                <button type="submit" className="btn-save-sm">حفظ وتأكيد</button>
                <button type="button" className="btn-cancel-sm" onClick={() => setQuickAddModal(null)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// ASSISTANT VIEW (Refined, elegant & mobile first)
// ============================================================
function AssistantView({ companies, products, onOpenVoice }) {
  const [selectedCompany, setSelectedCompany] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const searchRef = useRef(null);

  // Tire & Auto-Parts Pattern Normalizer (e.g. 2257017 or 225 70 17 -> 225/70/17)
  const normalizeTireSize = (text) => {
    if (!text) return '';
    // Match 3 digits, 2 digits, 2 digits (e.g. 2257017, 2656517, 2055516)
    return text.replace(/(\b\d{3})[\s\.\-]?(\d{2})[\s\.\-]?(\d{2}\b)/g, '$1/$2/$3');
  };

  // Search logic with tire pattern & fuzzy code search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedProduct(null);
      return;
    }

    const rawQ = query.trim().toLowerCase();
    const normalizedQ = normalizeTireSize(rawQ).toLowerCase();

    const found = products.filter(p => {
      const pName = (p.name || '').toLowerCase();
      const pCode = (p.code || '').toLowerCase();
      return pName.includes(rawQ) ||
             pCode.includes(rawQ) ||
             pName.includes(normalizedQ) ||
             pCode.includes(normalizedQ);
    });

    setResults(found.slice(0, 6));
    setSelectedProduct(null);
  }, [query, products]);

  function selectProduct(p) {
    setSelectedProduct(p);
    setResults([]);
    setQuery(p.name);
    searchRef.current?.blur();
  }

  function clearSearch() {
    setQuery('');
    setResults([]);
    setSelectedProduct(null);
    setCopySuccess(false);
    searchRef.current?.focus();
  }

  const price = selectedProduct && selectedCompany
    ? selectedProduct.prices?.[selectedCompany]
    : undefined;

  const priceFormatted = price !== undefined ? formatPrice(price) : undefined;
  const priceUndefined = price === null || price === undefined || price === 0 || price === '';

  // Copy or Share to WhatsApp
  const handleCopyQuote = () => {
    if (!selectedProduct || !selectedCompany || priceUndefined) return;
    const textToShare = `سعر ${selectedProduct.name} (${selectedProduct.code || ''}) لدى ${selectedCompany} هو ${priceFormatted} ريال.`;
    navigator.clipboard?.writeText(textToShare);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handleShareWhatsApp = () => {
    if (!selectedProduct || !selectedCompany || priceUndefined) return;
    const textToShare = `السلام عليكم، سعر ${selectedProduct.name} لدى ${selectedCompany} هو ${priceFormatted} ريال.`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(textToShare)}`, '_blank');
  };

  return (
    <main className="assistant-container">

      {/* 1. PRODUCT SEARCH BOX */}
      <div className="compact-card search-card">
        <label className="field-title">🔍 اسم المنتج أو رقم القطعة</label>
        <div className="search-field-wrapper">
          <input
            ref={searchRef}
            type="text"
            className="clean-search-input"
            placeholder="اكتب اسم المنتج للبحث..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoComplete="off"
          />
          {query && (
            <button className="clean-clear-btn" onClick={clearSearch}>✕</button>
          )}
        </div>

        {/* Dropdown Suggestions */}
        {results.length > 0 && (
          <ul className="clean-results-dropdown">
            {results.map(p => (
              <li key={p.id} className="clean-result-item" onClick={() => selectProduct(p)}>
                <span className="clean-res-name">{p.name}</span>
                <span className="clean-res-code">{p.code}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 2. COMPANY SELECTOR (Refined & not oversized) */}
      <div className="compact-card company-card">
        <label className="field-title">🏢 الشركة المعتمدة</label>
        <select
          className="clean-select-input"
          value={selectedCompany}
          onChange={e => setSelectedCompany(e.target.value)}
        >
          <option value="">-- اضغط لاختيار الشركة --</option>
          {companies.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* 3. CENTER VOICE AI BUTTON */}
      <div className="voice-mic-center-area">
        <button
          className="center-mic-glow-btn"
          onClick={onOpenVoice}
          title="تحدث مع المساعد الصوتي الذكي"
        >
          <div className="mic-inner-circle">🎙️</div>
          <span className="mic-ripple-wave"></span>
        </button>
        <span className="mic-hint-text">اضغط للتحدث مع المساعد الذكي</span>
      </div>

      {/* 4. PRICE DISPLAY */}
      {selectedProduct && (
        <div className="clean-price-card">
          <div className="clean-prod-header">
            <h4>{selectedProduct.name}</h4>
            <span className="clean-prod-badge">{selectedProduct.code}</span>
          </div>

          {!selectedCompany ? (
            <p className="clean-select-hint">👈 الرجاء اختيار الشركة بالأعلى لعرض السعر</p>
          ) : priceUndefined ? (
            <div className="clean-price-alert">
              <span className="alert-badge">⚠️ السعر غير محدد</span>
              <p>راجع الإدارة لتحديث التسعيرة لهذه الشركة</p>
            </div>
          ) : (
            <div className="clean-price-tag">
              <span className="price-num">{priceFormatted}</span>
              <span className="price-unit">ريال</span>
              <div className="comp-badge-pill">{selectedCompany}</div>
            </div>
          )}

          {price && !priceUndefined && (
            <div className="share-actions-group">
              <button className="btn-action-copy" onClick={handleCopyQuote}>
                {copySuccess ? '✅ تم النسخ' : '📋 نسخ السعر للعميل'}
              </button>
              <button className="btn-action-wa" onClick={handleShareWhatsApp}>
                💬 واتساب
              </button>
            </div>
          )}

          <button className="btn-clean-reset" onClick={clearSearch}>
            🔄 بحث عن منتج آخر
          </button>
        </div>
      )}
    </main>
  );
}

// ============================================================
// ADMIN & PIN VIEWS
// ============================================================
async function saveToFirebase(companies, products, adminPin) {
  const productsObj = {};
  products.forEach(p => {
    const { id, ...rest } = p;
    productsObj[id || 'p_' + Date.now()] = rest;
  });
  await set(ref(rtdb, 'pricing_hub'), {
    companies,
    products: productsObj,
    adminPin,
    lastUpdated: Date.now()
  });
}

function PinView({ pinInput, setPinInput, pinError, onSubmit, onCancel }) {
  return (
    <div className="centered-view">
      <div className="pin-card">
        <div className="pin-icon">🔐</div>
        <h2>دخول لوحة الإدارة</h2>
        <form onSubmit={onSubmit}>
          <input
            type="password"
            className={`pin-input ${pinError ? 'pin-error' : ''}`}
            placeholder="رمز الدخول (1234)"
            value={pinInput}
            onChange={e => setPinInput(e.target.value)}
            autoFocus
            maxLength={8}
          />
          {pinError && <p className="error-text">❌ رمز غير صحيح، حاول مجدداً</p>}
          <div className="pin-actions">
            <button type="submit" className="btn-primary">دخول</button>
            <button type="button" className="btn-secondary" onClick={onCancel}>رجوع</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminView({ companies, products, setCompanies, setProducts, adminPin, setAdminPin, firebaseConnected, onSaveToFirebase }) {
  const [tab, setTab] = useState('products');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newPin, setNewPin] = useState('');
  const [localProducts, setLocalProducts] = useState(products);
  const [localCompanies, setLocalCompanies] = useState(companies);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchAdmin, setSearchAdmin] = useState('');

  useEffect(() => { setLocalProducts(products); }, [products]);
  useEffect(() => { setLocalCompanies(companies); }, [companies]);

  async function handleSave() {
    setSaving(true);
    setSaveMsg('');
    try {
      await onSaveToFirebase(localCompanies, localProducts, adminPin);
      setCompanies(localCompanies);
      setProducts(localProducts);
      setSaveMsg('✅ تم الحفظ وتحديث الأجهزة فوراً');
    } catch (e) {
      setSaveMsg('❌ فشل الحفظ: ' + e.message);
    }
    setSaving(false);
    setTimeout(() => setSaveMsg(''), 4000);
  }

  function addCompany() {
    if (!newCompany.trim()) return;
    if (localCompanies.includes(newCompany.trim())) return;
    setLocalCompanies([...localCompanies, newCompany.trim()]);
    setNewCompany('');
  }

  function removeCompany(c) {
    if (!window.confirm(`حذف شركة "${c}"؟`)) return;
    setLocalCompanies(localCompanies.filter(x => x !== c));
  }

  function addProduct() {
    const id = 'p_' + Date.now();
    const newP = {
      id,
      name: 'منتج جديد',
      code: 'NEW-' + Date.now().toString().slice(-4),
      prices: Object.fromEntries(localCompanies.map(c => [c, null]))
    };
    setLocalProducts([newP, ...localProducts]);
    setEditingProduct(id);
  }

  function deleteProduct(id) {
    if (!window.confirm('حذف هذا المنتج؟')) return;
    setLocalProducts(localProducts.filter(p => p.id !== id));
    if (editingProduct === id) setEditingProduct(null);
  }

  function updateProduct(id, field, value) {
    setLocalProducts(localProducts.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    ));
  }

  function updatePrice(id, company, value) {
    const num = value === '' ? null : Number(value);
    setLocalProducts(localProducts.map(p =>
      p.id === id ? { ...p, prices: { ...p.prices, [company]: isNaN(num) ? null : num } } : p
    ));
  }

  const filtered = localProducts.filter(p =>
    !searchAdmin || p.name?.toLowerCase().includes(searchAdmin.toLowerCase()) || p.code?.toLowerCase().includes(searchAdmin.toLowerCase())
  );

  return (
    <main className="admin-main">
      <div className="admin-header">
        <div className="admin-tabs">
          <button className={`tab-btn ${tab === 'products' ? 'active' : ''}`} onClick={() => setTab('products')}>📦 المنتجات</button>
          <button className={`tab-btn ${tab === 'companies' ? 'active' : ''}`} onClick={() => setTab('companies')}>🏢 الشركات</button>
          <button className={`tab-btn ${tab === 'settings' ? 'active' : ''}`} onClick={() => setTab('settings')}>⚙️ الإعدادات</button>
        </div>
        <div className="save-area">
          {saveMsg && <span className="save-msg">{saveMsg}</span>}
          <button className="btn-save" onClick={handleSave} disabled={saving}>
            {saving ? 'جارٍ الحفظ...' : '💾 حفظ وتحديث'}
          </button>
        </div>
      </div>

      {tab === 'products' && (
        <div className="tab-content">
          <div className="products-toolbar">
            <input
              type="text"
              placeholder="بحث في المنتجات..."
              value={searchAdmin}
              onChange={e => setSearchAdmin(e.target.value)}
              className="admin-search"
            />
            <button className="btn-add" onClick={addProduct}>+ إضافة منتج</button>
          </div>

          <div className="products-list">
            {filtered.map(p => (
              <div key={p.id} className={`product-row ${editingProduct === p.id ? 'editing' : ''}`}>
                <div className="product-row-header" onClick={() => setEditingProduct(editingProduct === p.id ? null : p.id)}>
                  <div className="product-row-info">
                    {editingProduct === p.id ? (
                      <>
                        <input
                          className="inline-input"
                          value={p.name}
                          onChange={e => updateProduct(p.id, 'name', e.target.value)}
                          onClick={e => e.stopPropagation()}
                          placeholder="اسم المنتج"
                        />
                        <input
                          className="inline-input code-input"
                          value={p.code}
                          onChange={e => updateProduct(p.id, 'code', e.target.value)}
                          onClick={e => e.stopPropagation()}
                          placeholder="الكود"
                        />
                      </>
                    ) : (
                      <>
                        <span className="p-name">{p.name}</span>
                        <span className="p-code">{p.code}</span>
                      </>
                    )}
                  </div>
                  <div className="product-row-actions" onClick={e => e.stopPropagation()}>
                    <button className="btn-edit-toggle" onClick={() => setEditingProduct(editingProduct === p.id ? null : p.id)}>
                      {editingProduct === p.id ? '▲ حفظ وتصغير' : '✏️ تعديل الأسعار'}
                    </button>
                    <button className="btn-delete" onClick={() => deleteProduct(p.id)}>🗑️</button>
                  </div>
                </div>

                {editingProduct === p.id && (
                  <div className="prices-grid">
                    {localCompanies.map(c => (
                      <div key={c} className="price-cell">
                        <label className="company-label">{c}</label>
                        <input
                          type="number"
                          className="price-input-cell"
                          value={p.prices?.[c] ?? ''}
                          onChange={e => updatePrice(p.id, c, e.target.value)}
                          placeholder="غير محدد"
                          min="0"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'companies' && (
        <div className="tab-content">
          <div className="add-company-row">
            <input
              type="text"
              className="company-input"
              placeholder="اسم الشركة الجديدة..."
              value={newCompany}
              onChange={e => setNewCompany(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCompany()}
            />
            <button className="btn-add" onClick={addCompany}>+ إضافة</button>
          </div>
          <div className="companies-list">
            {localCompanies.map((c, i) => (
              <div key={c} className="company-item">
                <span className="company-num">{i + 1}</span>
                <span className="company-name-admin">{c}</span>
                <button className="btn-remove-company" onClick={() => removeCompany(c)}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'settings' && (
        <div className="tab-content settings-content">
          <div className="settings-card">
            <h3>🔐 رمز الإدارة (PIN)</h3>
            <p className="settings-note">الرمز الحالي: {adminPin}</p>
            <input
              type="password"
              className="pin-input"
              placeholder="الرمز الجديد..."
              value={newPin}
              onChange={e => setNewPin(e.target.value)}
              maxLength={8}
            />
            <button className="btn-primary" onClick={() => {
              if (newPin.length >= 4) { setAdminPin(newPin); setNewPin(''); setSaveMsg('تم تغيير الرمز - اضغط حفظ وتحديث'); }
            }}>تحديث الرمز</button>
          </div>
          <div className="settings-card">
            <h3>📡 السحابة (Firebase)</h3>
            <p className={firebaseConnected ? 'status-ok' : 'status-err'}>
              {firebaseConnected ? '✅ المزامنة اللحظية مفعلة بنجاح' : '❌ جارٍ محاولة الاتصال...'}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
