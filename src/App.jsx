'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MockupHeroSection } from './components/MockupHeroSection';
import { EvidenceFilter } from './components/EvidenceFilter';
import { CaseCard } from './components/CaseCard';
import { CaseDetailModal } from './components/CaseDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { SolutionVaultModal } from './components/SolutionVaultModal';
import { DetectiveProfileModal } from './components/DetectiveProfileModal';
import { AdminCaseManager } from './components/AdminCaseManager';
import { DeveloperPortal } from './components/DeveloperPortal';
import { BackgroundMagnifier } from './components/BackgroundMagnifier';
import { Footer } from './components/Footer';
import { INITIAL_CASES, DETECTIVE_RANKS } from './data/casesData';
import { subscribeToCases, addCaseToFirebase, deleteCaseFromFirebase, saveOrderToFirebase } from './firebase/db';
import confetti from 'canvas-confetti';
import { downloadCaseFile } from './utils/pdfGenerator';

const DEMO_CASE_IDS = [
  'case-01', 'case-02', 'case-03', 'case-04', 'case-05',
  'case-06', 'case-07', 'case-08', 'case-09', 'case-10',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
];

function normalizeCase(c) {
  if (!c || typeof c !== 'object') return null;
  // Automatically filter out and discard previous test/demo cases
  if (DEMO_CASE_IDS.includes(String(c.id))) return null;
  return {
    ...c,
    id: c.id || `case-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: c.title || 'قضية جنائية',
    caseNumber: c.caseNumber || `CASE #${String(c.id || '001').slice(0, 5)}-س`,
    subtitle: c.subtitle || c.category || 'ملف تحقيق جنائي',
    synopsis: c.synopsis || 'ملف قضية جنائية غامضة بانتظار فك طلاسمها.',
    difficulty: c.difficulty || c.category || 'متمرس',
    category: c.category || c.difficulty || 'متمرس',
    coverImage: c.coverImage || '/detective_silhouette.jpg',
    originalPrice: c.originalPrice !== undefined && c.originalPrice !== null && c.originalPrice !== '' ? Number(c.originalPrice) : null,
    price: (c.price !== undefined && c.price !== null && !isNaN(Number(c.price))) ? Number(c.price) : 0,
    rating: c.rating || 5.0,
    reviewsCount: c.reviewsCount || 1,
    pages: c.pages || 38,
    fileSize: c.fileSize || '4.8 MB',
    classification: c.classification || 'سري للغاية',
    estimatedSolveTime: c.estimatedSolveTime || '45-60 دقيقة',
    evidenceList: Array.isArray(c.evidenceList) && c.evidenceList.length > 0 
      ? c.evidenceList 
      : [{ id: 'ev-1', title: 'مسرح الواقعة', description: 'الأدلة والقرائن الجنائية المرفقة في ملف القضية.' }],
    suspects: Array.isArray(c.suspects) && c.suspects.length > 0 
      ? c.suspects 
      : [{ name: 'المشتبه به الرئيسي', role: 'طرف في الواقعة', suspicionScore: 70, alibi: 'قيد التحري', motive: 'دافع جنائي غامض' }],
    hints: Array.isArray(c.hints) && c.hints.length > 0 
      ? c.hints 
      : [{ level: 1, title: 'تلميح المحقق', hint: 'دقق في تسلسل الأحداث والأدلة المادية في ملف القضية.' }],
    tags: Array.isArray(c.tags) ? c.tags : [c.category || 'تحقيق', 'غموض'].filter(Boolean),
    solution: c.solution && typeof c.solution === 'object' ? c.solution : {
      culprit: 'مُسجل في تقرير الحل الختامي',
      motive: 'دافع جنائي مشفر',
      method: c.synopsis || 'تحليل جنائي متعمق',
      deductionSteps: ['1. فحص مسرح الحادثة بدقة', '2. مطابقة الإفادات وإثبات الإدانة']
    },
    payhipUrl: c.payhipUrl || ''
  };
}

export function App() {
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(true);
  const [currentPortal, setCurrentPortal] = useState('store'); // 'store' | 'developer'
  const [cases, setCases] = useState(() => INITIAL_CASES.map(normalizeCase).filter(Boolean));
  const [cart, setCart] = useState([]);
  const [purchasedCases, setPurchasedCases] = useState([]);
  const [unlockedSolutions, setUnlockedSolutions] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isMiniGameSolved, setIsMiniGameSolved] = useState(false);
  const [hasLoadedLocal, setHasLoadedLocal] = useState(false);

  // Modal States
  const [selectedCase, setSelectedCase] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSolutionVaultOpen, setIsSolutionVaultOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');

  // Toast Notification
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Safe SSR hydration: Load saved data from localStorage on client mount
  useEffect(() => {
    try {
      const savedCases = localStorage.getItem('sijill_cases_v3');
      if (savedCases) {
        const parsed = JSON.parse(savedCases);
        if (Array.isArray(parsed)) {
          setCases(parsed.map(normalizeCase).filter(Boolean));
        }
      }

      const savedCart = localStorage.getItem('sijill_cart_v3');
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedPurchased = localStorage.getItem('sijill_purchased_v3');
      if (savedPurchased) setPurchasedCases(JSON.parse(savedPurchased));

      const savedSolutions = localStorage.getItem('sijill_unlocked_solutions_v3');
      if (savedSolutions) setUnlockedSolutions(JSON.parse(savedSolutions));

      const savedMiniGame = localStorage.getItem('sijill_minigame_solved_v3');
      if (savedMiniGame === 'true') setIsMiniGameSolved(true);
    } catch (e) {
      console.warn("Could not load from localStorage:", e);
    }
    setHasLoadedLocal(true);
  }, []);

  // Subscribe to Firebase Realtime Database for Cases
  useEffect(() => {
    const unsubscribe = subscribeToCases(
      (remoteCases) => {
        if (remoteCases && remoteCases.length > 0) {
          setCases(remoteCases.map(normalizeCase).filter(Boolean));
          setIsFirebaseConnected(true);
        }
      },
      (error) => {
        console.warn("Firebase sync error, using local fallback:", error);
        setIsFirebaseConnected(false);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Sync to local storage only after initial client mount
  useEffect(() => {
    if (!hasLoadedLocal) return;
    try {
      localStorage.setItem('sijill_cases_v3', JSON.stringify(cases));
    } catch (e) {}
  }, [cases, hasLoadedLocal]);

  useEffect(() => {
    if (!hasLoadedLocal) return;
    try {
      localStorage.setItem('sijill_cart_v3', JSON.stringify(cart));
    } catch (e) {}
  }, [cart, hasLoadedLocal]);

  useEffect(() => {
    if (!hasLoadedLocal) return;
    try {
      localStorage.setItem('sijill_purchased_v3', JSON.stringify(purchasedCases));
    } catch (e) {}
  }, [purchasedCases, hasLoadedLocal]);

  useEffect(() => {
    if (!hasLoadedLocal) return;
    try {
      localStorage.setItem('sijill_unlocked_solutions_v3', JSON.stringify(unlockedSolutions));
    } catch (e) {}
  }, [unlockedSolutions, hasLoadedLocal]);

  // Determine User Detective Rank
  const calculateRank = () => {
    const score = purchasedCases.length + (isMiniGameSolved ? 1 : 0);
    if (score >= 10) return DETECTIVE_RANKS[4];
    if (score >= 5) return DETECTIVE_RANKS[3];
    if (score >= 3) return DETECTIVE_RANKS[2];
    if (score >= 1) return DETECTIVE_RANKS[1];
    return DETECTIVE_RANKS[0];
  };

  const currentRank = calculateRank();

  // Cart operations
  const handleAddToCart = (caseItem) => {
    if (cart.some(item => item.id === caseItem.id)) {
      setCart(cart.filter(item => item.id !== caseItem.id));
      showToast(`تم حذف "${caseItem.title}" من السلة`);
    } else {
      setCart([...cart, caseItem]);
      showToast(`تمت إضافة "${caseItem.title}" إلى السلة 📚`);
      setIsCartOpen(true); // Open cart drawer immediately
    }
  };

  const handleDirectDownloadCase = (caseItem) => {
    downloadCaseFile(caseItem);
    if (!purchasedCases.some(item => item.id === caseItem.id)) {
      setPurchasedCases(prev => [caseItem, ...prev]);
    }
    showToast(`بدأ تحميل "${caseItem.title}" وتم إيداعها في أرشيفك 📥`);
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#fbbf24', '#34d399', '#ffffff']
    });
  };

  const handleRemoveFromCart = (caseId) => {
    setCart(cart.filter(item => item.id !== caseId));
  };

  // Mini-Game completion
  const handleMiniGameSolved = (couponCode) => {
    setIsMiniGameSolved(true);
    localStorage.setItem('sijill_minigame_solved_v3', 'true');
    setAppliedCoupon({ code: couponCode, percent: 15 });
    showToast('مبروك! تم تفعيل كود الخصم 15% وترقية رتبتك الجنائية 🎖️');
  };

  // Order completed (with Firebase sync)
  const handleOrderCompleted = async (order) => {
    const newPurchased = [...purchasedCases];
    order.items.forEach(item => {
      if (!newPurchased.some(p => p.id === item.id)) {
        newPurchased.push(item);
      }
    });

    setPurchasedCases(newPurchased);
    setCart([]);

    // Save order in Firebase
    try {
      await saveOrderToFirebase(order);
    } catch (err) {
      console.warn("Could not save order to Firebase:", err);
    }

    showToast(`تم إتمام الشراء بنجاح! تم إيداع ${order.items.length} كتب في أرشيفك.`);
  };

  // Solution unlock handler
  const handleUnlockSolution = (caseId) => {
    if (!unlockedSolutions.includes(caseId)) {
      setUnlockedSolutions([...unlockedSolutions, caseId]);
      showToast('تم كسر ختم الحل وإيداعه في خزينة الحلول 🔓');
    }
  };

  // Admin add case handler (with Firebase sync)
  const handleAddCase = async (newCase) => {
    const safeCase = normalizeCase(newCase);
    setCases(prev => [safeCase, ...prev]);
    try {
      await addCaseToFirebase(safeCase);
    } catch (err) {
      console.warn("Could not save case to Firebase:", err);
    }
    showToast(`تم نشر كتاب "${safeCase.title}" في المتجر بنجاح ✨`);
  };

  // Admin update case handler (with Firebase sync)
  const handleUpdateCase = async (updatedCase) => {
    const safeCase = normalizeCase(updatedCase);
    setCases(prev => prev.map(c => c && c.id === safeCase.id ? safeCase : c));
    try {
      await addCaseToFirebase(safeCase);
    } catch (err) {
      console.warn("Could not update case in Firebase:", err);
    }
    showToast(`تم حفظ تعديلات "${safeCase.title}" في السحابة والمتجر بنجاح ✨`);
  };

  // Admin delete case handler (with Firebase sync)
  const handleDeleteCase = async (caseId) => {
    setCases(cases.filter(c => c && c.id !== caseId));
    try {
      await deleteCaseFromFirebase(caseId);
      showToast('تم حذف القضية من المتجر وقاعدة البيانات بنجاح 🗑️');
    } catch (err) {
      console.warn("Could not delete case from Firebase:", err);
    }
  };

  // Available tags collection
  const allTags = Array.from(
    new Set(cases.flatMap(c => (c && Array.isArray(c.tags)) ? c.tags : []))
  );

  // Filtered cases list
  const filteredCases = cases.filter(item => {
    if (!item) return false;
    const itemTitle = item.title ? String(item.title).toLowerCase() : '';
    const itemNumber = item.caseNumber ? String(item.caseNumber).toLowerCase() : '';
    const itemSynopsis = item.synopsis ? String(item.synopsis).toLowerCase() : '';
    const query = (searchQuery || '').toLowerCase().trim();

    const matchesSearch = 
      !query ||
      itemTitle.includes(query) ||
      itemNumber.includes(query) ||
      itemSynopsis.includes(query);

    const matchesDifficulty = 
      selectedDifficulty === 'all' || item.difficulty === selectedDifficulty;

    const matchesTag = 
      selectedTag === 'all' || (Array.isArray(item.tags) && item.tags.includes(selectedTag));

    return matchesSearch && matchesDifficulty && matchesTag;
  });

  // If in Developer / Author Portal Mode
  if (currentPortal === 'developer') {
    return (
      <DeveloperPortal
        cases={cases}
        onAddCase={handleAddCase}
        onUpdateCase={handleUpdateCase}
        onDeleteCase={handleDeleteCase}
        onSwitchToStore={() => setCurrentPortal('store')}
        isFirebaseConnected={isFirebaseConnected}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-crypta-pink selection:text-white relative">
      
      {/* Roaming Detective Magnifying Glass Background Animation */}
      <BackgroundMagnifier />

      {/* Ambient Detective Silhouette Background Watermark with subtle contrast */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden">
        <img
          src="/detective_silhouette.jpg"
          alt=""
          className="w-[800px] h-[800px] max-w-none object-contain opacity-[0.05] filter contrast-125 select-none"
        />
      </div>
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 border border-crypta-yellow text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm font-bold animate-bounce">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        cartCount={cart.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenSolutionVault={() => setIsSolutionVaultOpen(true)}
        onOpenDeveloperPortal={() => setCurrentPortal('developer')}
        onScrollToCases={() => {
          document.getElementById('cases-catalog')?.scrollIntoView({ behavior: 'smooth' });
        }}
        onScrollToMiniGame={() => {
          document.getElementById('mini-game-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
        userRank={currentRank}
        purchasedCasesCount={purchasedCases.length}
        isFirebaseConnected={isFirebaseConnected}
      />

      {/* Mockup Hero Banner Section (Clean shelf without level numbers) */}
      <MockupHeroSection
        cases={cases}
        onSelectCase={(item) => setSelectedCase(item)}
      />


      {/* Detailed Cases Catalog Section */}
      <main id="cases-catalog" className="flex-1 py-16 relative z-10 bg-transparent">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-stone-850 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">📂</span>
                <span className="font-mono text-xs font-bold text-crypta-yellow uppercase tracking-widest">
                  أرشيف القضايا الجنائية المفتوحة
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white">
                تفاصيل ملفات التحقيق والكتب
              </h2>
            </div>
            
            <p className="text-xs sm:text-sm text-stone-400 max-w-md font-light">
              اضغط على أي قضية لمعاينة الأحراز والمشتبه بهم، تنزيل العينة بصيغة PDF، أو ضمها لسلة التحقيق.
            </p>
          </div>

          {/* Filters Bar */}
          <EvidenceFilter
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedDifficulty={selectedDifficulty}
            setSelectedDifficulty={setSelectedDifficulty}
            selectedTag={selectedTag}
            setSelectedTag={setSelectedTag}
            availableTags={allTags}
          />

          {/* Cases Grid */}
          {filteredCases.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-stone-900/20 border border-stone-850 rounded-2xl p-8">
              <span className="text-4xl">📂</span>
              <p className="text-stone-300 font-bold text-base">لا توجد قضايا معروضة حالياً</p>
              <p className="text-xs text-stone-500">قم برفع ونشر قضاياك من لوحة تحكم المطور لتظهر في الكتالوج.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
              {filteredCases.map((caseItem) => (
                <CaseCard
                  key={caseItem.id}
                  caseItem={caseItem}
                  onSelectCase={(item) => setSelectedCase(item)}
                  onAddToCart={handleAddToCart}
                  isInCart={cart.some(item => item.id === caseItem.id)}
                  isPurchased={purchasedCases.some(item => item.id === caseItem.id)}
                  onDirectDownload={handleDirectDownloadCase}
                />
              ))}
            </div>
          )}

        </div>
      </main>

      {/* Case Details Modal */}
      {selectedCase && (
        <CaseDetailModal
          caseItem={selectedCase}
          onClose={() => setSelectedCase(null)}
          onAddToCart={handleAddToCart}
          isInCart={cart.some(item => item.id === selectedCase.id)}
          isPurchased={purchasedCases.some(item => item.id === selectedCase.id)}
          onUnlockSolution={handleUnlockSolution}
          onDirectDownload={handleDirectDownloadCase}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onRemoveItem={handleRemoveFromCart}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={setAppliedCoupon}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        onOrderCompleted={handleOrderCompleted}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cart}
        appliedCoupon={appliedCoupon}
        onOrderCompleted={handleOrderCompleted}
      />

      {/* Solution Vault Modal */}
      <SolutionVaultModal
        isOpen={isSolutionVaultOpen}
        onClose={() => setIsSolutionVaultOpen(false)}
        cases={cases.filter(c => !c.isLocked)}
        unlockedSolutions={unlockedSolutions}
        onUnlockSolution={handleUnlockSolution}
      />

      {/* Detective Profile Modal */}
      <DetectiveProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userRank={currentRank}
        purchasedCases={purchasedCases}
        unlockedSolutions={unlockedSolutions}
        onInspectCase={(item) => setSelectedCase(item)}
      />

      {/* Admin Add Case Modal */}
      <AdminCaseManager
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onAddCase={handleAddCase}
      />

      {/* Footer */}
      <Footer
        onScrollToCases={() => {
          document.getElementById('cases-catalog')?.scrollIntoView({ behavior: 'smooth' });
        }}
        onScrollToMiniGame={() => {
          document.getElementById('mini-game-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenSolutionVault={() => setIsSolutionVaultOpen(true)}
      />

    </div>
  );
}
export default App;
