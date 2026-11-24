'use client';

import { useState, useEffect, useRef } from 'react';
import { ref, onValue, set, off } from 'firebase/database';
import { rtdb } from '../firebase/config';
import VoiceAssistantModal from './VoiceAssistantModal';

// ============================================================
// PWA INSTALL PROMPT COMPONENT
// ============================================================
function InstallPrompt() {
  const [prompt, setPrompt] = useState(null);  // Android/Chrome
  const [showIos, setShowIos] = useState(false); // iOS
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (window.navigator.standalone) return; // iOS standalone
    if (localStorage.getItem('pwa-dismissed')) return;

    // Android/Chrome: catch beforeinstallprompt
    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // iOS detection
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isSafari = /safari/i.test(navigator.userAgent) && !/chrome/i.test(navigator.userAgent);
    if (isIos && isSafari) {
      // Show iOS tip after 2 seconds
      setTimeout(() => setShowIos(true), 2000);
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

  // Android/Chrome install banner
  if (prompt) return (
    <div className="install-banner">
      <img src="/icon-192.png" alt="icon" className="install-icon" />
      <div className="install-text">
        <strong>ثبّت التطبيق</strong>
        <span>وصول سريع من شاشتك الرئيسية</span>
      </div>
      <div className="install-actions">
        <button className="btn-install" onClick={install}>تثبيت</button>
        <button className="btn-dismiss" onClick={dismiss}>لاحقاً</button>
      </div>
    </div>
  );

  // iOS tip banner
  if (showIos) return (
    <div className="install-banner ios">
      <img src="/icon-192.png" alt="icon" className="install-icon" />
      <div className="install-text">
        <strong>ثبّت كتطبيق على iPhone</strong>
        <span>اضغط <strong>مشاركة</strong> ثم <strong>"إضافة إلى الشاشة الرئيسية"</strong></span>
      </div>
      <button className="btn-dismiss" onClick={dismiss}>✕</button>
    </div>
  );

  return null;
}

// ============================================================
// SAMPLE DATA - will be replaced by Firebase data
// ============================================================
const SAMPLE_COMPANIES = [
  'شركة الخليج', 'شركة النجوم', 'شركة المستقبل', 'شركة الأمل',
  'شركة الرياض', 'شركة جدة', 'شركة الدمام', 'شركة المدينة',
  'شركة القصيم', 'شركة تبوك'
];

const SAMPLE_PRODUCTS = Array.from({ length: 20 }, (_, i) => ({
  id: `p${i + 1}`,
  name: `منتج تجريبي ${i + 1}`,
  code: `PRD-${String(i + 1).padStart(4, '0')}`,
  prices: Object.fromEntries(
    SAMPLE_COMPANIES.map((c, ci) => [
      c,
      ci % 3 === 0 && i % 2 === 0 ? null : Math.floor(Math.random() * 500 + 50)
    ])
  )
}));

// ============================================================
// ADMIN PIN
// ============================================================
const DEFAULT_PIN = '1234';

// ============================================================
// HELPER: format price
// ============================================================
function formatPrice(val) {
  if (val === null || val === undefined || val === '' || val === 0) return null;
  return Number(val).toLocaleString('ar-SA');
}

// ============================================================
// MAIN APP
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

  // Apply AI Action (Update price, add product, add company)
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

    // Save to Firebase immediately
    try {
      await saveToFirebase(updatedCompanies, updatedProducts, adminPin);
    } catch (e) {
      console.error('Firebase save error from AI action:', e);
    }
  };

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

  return (
    <div className="app-root" dir="rtl">
      <InstallPrompt />
      {/* TOP BAR */}
      <header className="top-bar">
        <div className="top-bar-inner">
          <div className="app-title">
            <span className="app-icon">🏪</span>
            <span>مركز الأسعار</span>
            {firebaseConnected && <span className="live-badge">● مباشر</span>}
          </div>
          <div className="nav-actions">
            <button className="btn-voice-nav" onClick={() => setIsVoiceOpen(true)} title="المساعد الصوتي">
              🎙️ صوتي
            </button>
            {view === 'assistant' ? (
              <button className="btn-admin" onClick={() => setView('pin')}>
                🔐 الإدارة
              </button>
            ) : (
              <button className="btn-back" onClick={() => setView('assistant')}>
                ← واجهة التسعير
              </button>
            )}
          </div>
        </div>
      </header>

      {/* VIEWS */}
      {view === 'assistant' && (
        <AssistantView companies={companies} products={products} />
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

      {/* Floating Mic Button */}
      <button
        className="floating-mic-btn"
        onClick={() => setIsVoiceOpen(true)}
        aria-label="تحدث مع المساعد الصوتي"
      >
        🎙️
      </button>

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        companies={companies}
        products={products}
        adminPin={adminPin}
        onApplyAction={handleApplyAiAction}
      />
    </div>
  );
}

// ============================================================
// SAVE TO FIREBASE
// ============================================================
async function saveToFirebase(companies, products, adminPin) {
  const productsObj = {};
  products.forEach(p => {
    const { id, ...rest } = p;
    productsObj[id || push(ref(rtdb, 'pricing_hub/products')).key] = rest;
  });
  await set(ref(rtdb, 'pricing_hub'), {
    companies,
    products: productsObj,
    adminPin,
    lastUpdated: Date.now()
  });
}

// ============================================================
// PIN VIEW
// ============================================================
function PinView({ pinInput, setPinInput, pinError, onSubmit, onCancel }) {
  return (
    <div className="centered-view">
      <div className="pin-card">
        <div className="pin-icon">🔐</div>
        <h2>دخول الإدارة</h2>
        <form onSubmit={onSubmit}>
          <input
            type="password"
            className={`pin-input ${pinError ? 'pin-error' : ''}`}
            placeholder="أدخل رمز الدخول"
            value={pinInput}
            onChange={e => { setPinInput(e.target.value); }}
            autoFocus
            maxLength={8}
          />
          {pinError && <p className="error-text">❌ رمز خاطئ، حاول مجدداً</p>}
          <div className="pin-actions">
            <button type="submit" className="btn-primary">دخول</button>
            <button type="button" className="btn-secondary" onClick={onCancel}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// ASSISTANT VIEW
// ============================================================
function AssistantView({ companies, products }) {
  const [selectedCompany, setSelectedCompany] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const searchRef = useRef(null);

  // Search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedProduct(null);
      return;
    }
    const q = query.trim().toLowerCase();
    const found = products.filter(p =>
      p.name?.toLowerCase().includes(q) || p.code?.toLowerCase().includes(q)
    );
    setResults(found.slice(0, 8));
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
    searchRef.current?.focus();
  }

  const price = selectedProduct && selectedCompany
    ? selectedProduct.prices?.[selectedCompany]
    : undefined;

  const priceFormatted = price !== undefined ? formatPrice(price) : undefined;
  const priceUndefined = price === null || price === undefined || price === 0 || price === '';

  return (
    <main className="assistant-main">

      {/* COMPANY SELECTOR */}
      <section className="section-card company-section">
        <label className="section-label">📋 اختر الشركة</label>
        <select
          className="company-select"
          value={selectedCompany}
          onChange={e => setSelectedCompany(e.target.value)}
        >
          <option value="">-- اختر الشركة --</option>
          {companies.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </section>

      {/* SEARCH */}
      <section className="section-card search-section">
        <label className="section-label">🔍 ابحث عن المنتج</label>
        <div className="search-wrapper">
          <input
            ref={searchRef}
            type="text"
            className="search-input"
            placeholder="اسم المنتج أو رقم القطعة..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoComplete="off"
          />
          {query && (
            <button className="clear-btn" onClick={clearSearch}>✕</button>
          )}
        </div>

        {/* DROPDOWN RESULTS */}
        {results.length > 0 && (
          <ul className="results-dropdown">
            {results.map(p => (
              <li key={p.id} className="result-item" onClick={() => selectProduct(p)}>
                <span className="result-name">{p.name}</span>
                <span className="result-code">{p.code}</span>
              </li>
            ))}
          </ul>
        )}

        {query && results.length === 0 && !selectedProduct && (
          <p className="no-results">لا توجد نتائج</p>
        )}
      </section>

      {/* PRICE DISPLAY */}
      {selectedProduct && (
        <section className="price-section">
          <div className="product-info">
            <span className="product-name-display">{selectedProduct.name}</span>
            <span className="product-code-display">{selectedProduct.code}</span>
          </div>

          {!selectedCompany ? (
            <div className="price-hint">
              👆 اختر الشركة أولاً لعرض السعر
            </div>
          ) : priceUndefined ? (
            <div className="price-undefined">
              <span className="warn-icon">⚠️</span>
              <span>السعر غير محدد</span>
              <span className="warn-sub">راجع الإدارة</span>
            </div>
          ) : (
            <div className="price-display">
              <span className="price-amount">{priceFormatted}</span>
              <span className="price-currency">ريال</span>
            </div>
          )}

          {selectedCompany && !priceUndefined && (
            <div className="company-tag">
              {selectedCompany}
            </div>
          )}

          <button className="btn-new-search" onClick={clearSearch}>
            🔄 بحث جديد
          </button>
        </section>
      )}

      {/* PLACEHOLDER when nothing selected */}
      {!selectedProduct && !query && (
        <div className="placeholder-hint">
          <div className="placeholder-icon">💰</div>
          <p>اختر الشركة ثم ابحث عن المنتج لعرض السعر</p>
        </div>
      )}
    </main>
  );
}

// ============================================================
// ADMIN VIEW
// ============================================================
function AdminView({ companies, products, setCompanies, setProducts, adminPin, setAdminPin, firebaseConnected, onSaveToFirebase }) {
  const [tab, setTab] = useState('products'); // 'products' | 'companies' | 'settings'
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
      setSaveMsg('✅ تم الحفظ وسيظهر للمساعد فوراً');
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

  const filteredProducts = localProducts.filter(p =>
    !searchAdmin || p.name?.toLowerCase().includes(searchAdmin.toLowerCase()) || p.code?.toLowerCase().includes(searchAdmin.toLowerCase())
  );

  return (
    <main className="admin-main">
      {/* ADMIN HEADER */}
      <div className="admin-header">
        <div className="admin-tabs">
          <button className={`tab-btn ${tab === 'products' ? 'active' : ''}`} onClick={() => setTab('products')}>📦 المنتجات</button>
          <button className={`tab-btn ${tab === 'companies' ? 'active' : ''}`} onClick={() => setTab('companies')}>🏢 الشركات</button>
          <button className={`tab-btn ${tab === 'settings' ? 'active' : ''}`} onClick={() => setTab('settings')}>⚙️ الإعدادات</button>
        </div>
        <div className="save-area">
          {saveMsg && <span className="save-msg">{saveMsg}</span>}
          <button className="btn-save" onClick={handleSave} disabled={saving}>
            {saving ? '⏳ جارٍ الحفظ...' : '💾 حفظ وإرسال للمساعد'}
          </button>
        </div>
      </div>

      {/* PRODUCTS TAB */}
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
            {filteredProducts.map(p => (
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
                          placeholder="رقم القطعة"
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
                      {editingProduct === p.id ? '▲ طي' : '✏️ تعديل'}
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

      {/* COMPANIES TAB */}
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
          <p className="companies-note">⚠️ حذف شركة سيؤثر على جميع المنتجات المرتبطة بها. اضغط "حفظ" بعد التعديل.</p>
        </div>
      )}

      {/* SETTINGS TAB */}
      {tab === 'settings' && (
        <div className="tab-content settings-content">
          <div className="settings-card">
            <h3>🔐 تغيير رمز الدخول</h3>
            <input
              type="password"
              className="pin-input"
              placeholder="الرمز الجديد"
              value={newPin}
              onChange={e => setNewPin(e.target.value)}
              maxLength={8}
            />
            <button className="btn-primary" onClick={() => {
              if (newPin.length >= 4) { setAdminPin(newPin); setNewPin(''); setSaveMsg('تم تغيير الرمز - اضغط حفظ'); }
            }}>تغيير الرمز</button>
            <p className="settings-note">الرمز الحالي: {adminPin.replace(/./g, '●')}</p>
          </div>

          <div className="settings-card">
            <h3>📡 حالة Firebase</h3>
            <p className={firebaseConnected ? 'status-ok' : 'status-err'}>
              {firebaseConnected ? '✅ متصل - البيانات تُزامَن لحظياً' : '❌ غير متصل - تعمل محلياً فقط'}
            </p>
            {!firebaseConnected && (
              <p className="settings-note">تأكد من إعداد قواعد Firebase وإضافة مسار pricing_hub</p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
