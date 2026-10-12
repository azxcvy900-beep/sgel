import React, { useState } from 'react';
import { 
  ShoppingBag, 
  KeyRound, 
  FolderArchive, 
  PlusCircle,
  FileText,
  Menu,
  X,
  Award,
  Database
} from 'lucide-react';

export function Navbar({ 
  cartCount, 
  onOpenCart, 
  onOpenProfile, 
  onOpenSolutionVault, 
  onOpenAdmin, 
  onScrollToCases,
  userRank,
  purchasedCasesCount,
  isFirebaseConnected = true
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-stone-850 shadow-2xl">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand Identity */}
          <div 
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            {/* Circular Magenta Ring Logo */}
            <div className="relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 border-crypta-pink bg-black shadow-pink-glow group-hover:scale-105 transition-transform shrink-0">
              <span className="font-mono text-[8px] sm:text-[9px] font-black tracking-widest text-white uppercase">
                SIJILL
              </span>
            </div>
            
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black font-sans tracking-wide text-white">
                  سِـجِـلّ
                </span>
                <span className="text-[9px] sm:text-[10px] text-crypta-pink font-bold font-mono">
                  CRYPTA
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] text-stone-400 font-sans line-clamp-1">
                مكتبة ألغاز وقضايا المحققين
              </p>
            </div>
          </div>

          {/* Desktop & iPad Pro Navigation Links */}
          <nav className="hidden lg:flex items-center gap-2 xl:gap-4">
            <button 
              onClick={onScrollToCases}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-stone-300 hover:text-crypta-yellow hover:bg-stone-900 transition flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-crypta-pink" />
              <span>مكتبة القضايا</span>
            </button>

            <button 
              onClick={onOpenSolutionVault}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-stone-300 hover:text-crypta-yellow hover:bg-stone-900 transition flex items-center gap-1.5"
            >
              <KeyRound className="w-4 h-4 text-crypta-pink" />
              <span>خزينة الحلول</span>
            </button>

            <button 
              onClick={onOpenProfile}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-stone-300 hover:text-crypta-yellow hover:bg-stone-900 transition flex items-center gap-1.5"
            >
              <FolderArchive className="w-4 h-4 text-emerald-400" />
              <span>أرشيفي</span>
              {purchasedCasesCount > 0 && (
                <span className="bg-crypta-pink text-white text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold">
                  {purchasedCasesCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Action Icons: Rank, Admin, Cart & Mobile Menu Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Firebase Database Status Indicator */}
            <div 
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-stone-900 border border-stone-800 text-[10px] select-none"
              title={isFirebaseConnected ? "قاعدة بيانات Firebase متصلة وحية" : "جاري الاتصال بـ Firebase أو الوضع المحلي"}
            >
              <span className={`w-2 h-2 rounded-full ${isFirebaseConnected ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400 animate-pulse'}`} />
              <span className="font-mono text-stone-300 font-bold">Firebase</span>
              <span className="text-stone-600">•</span>
              <span className={isFirebaseConnected ? "text-emerald-400 font-medium" : "text-amber-400 font-medium"}>
                {isFirebaseConnected ? "متصل" : "محلي"}
              </span>
            </div>

            {/* Detective Rank Badge (Desktop & iPad) */}
            <button 
              onClick={onOpenProfile}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900 border border-stone-800 hover:border-crypta-yellow/50 transition text-right"
              title="رتبتك الحالية"
            >
              <span className="text-sm">{userRank?.badge || '🔍'}</span>
              <div>
                <div className="text-[9px] text-stone-500 leading-none">رتبة المحقق</div>
                <div className="font-bold text-crypta-yellow text-xs">{userRank?.name || 'متدرب'}</div>
              </div>
            </button>

            {/* Admin Add Case Button (Desktop & iPad) */}
            <button
              onClick={onOpenAdmin}
              title="إضافة قضية جديدة"
              className="hidden sm:flex p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-400 hover:text-white transition"
            >
              <PlusCircle className="w-4 h-4" />
            </button>

            {/* Cart Button */}
            <button 
              onClick={onOpenCart}
              className="relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-crypta-pink to-rose-700 hover:from-rose-500 hover:to-crypta-pink text-white font-bold text-xs shadow-pink-glow transition group"
            >
              <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">السلة</span>
              
              {cartCount > 0 ? (
                <span className="flex items-center justify-center min-w-5 h-5 px-1 bg-crypta-yellow text-black font-black text-xs rounded-full">
                  {cartCount}
                </span>
              ) : (
                <span className="text-xs text-rose-200">0</span>
              )}
            </button>

            {/* Mobile / iPad Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-white transition"
              aria-label="القائمة"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile & Tablet Slide-Down Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-stone-950 border-b border-stone-800 px-4 py-5 space-y-3 animate-fadeIn">
          
          {/* User Rank in Mobile Drawer */}
          <div 
            onClick={() => {
              setIsMobileMenuOpen(false);
              onOpenProfile();
            }}
            className="flex items-center justify-between p-3 rounded-xl bg-stone-900 border border-stone-850 cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xl">{userRank?.badge || '🔍'}</span>
              <div>
                <div className="text-[10px] text-stone-400">رتبتك الجنائية</div>
                <div className="text-sm font-bold text-crypta-yellow">{userRank?.name || 'متدرب'}</div>
              </div>
            </div>
            <span className="text-xs text-crypta-pink font-mono">عرض الأرشيف ←</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onScrollToCases();
              }}
              className="flex items-center gap-2 p-3 rounded-xl bg-stone-900 text-stone-200 text-xs font-bold hover:text-crypta-yellow transition text-right"
            >
              <FileText className="w-4 h-4 text-crypta-pink" />
              <span>مكتبة القضايا</span>
            </button>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenSolutionVault();
              }}
              className="flex items-center gap-2 p-3 rounded-xl bg-stone-900 text-stone-200 text-xs font-bold hover:text-crypta-yellow transition text-right"
            >
              <KeyRound className="w-4 h-4 text-crypta-pink" />
              <span>خزينة الحلول</span>
            </button>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenProfile();
              }}
              className="flex items-center gap-2 p-3 rounded-xl bg-stone-900 text-stone-200 text-xs font-bold hover:text-crypta-yellow transition text-right"
            >
              <FolderArchive className="w-4 h-4 text-emerald-400" />
              <span>أرشيفي الخاص</span>
            </button>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="flex items-center gap-2 p-3 rounded-xl bg-stone-900 text-stone-200 text-xs font-bold hover:text-crypta-yellow transition text-right"
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span>إضافة قضية</span>
            </button>
          </div>

          {/* Firebase Connection Status (Mobile) */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-stone-900/60 border border-stone-850 text-[11px]">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isFirebaseConnected ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400 animate-pulse'}`} />
              <span className="font-mono text-stone-300">Firebase Realtime DB</span>
            </div>
            <span className={isFirebaseConnected ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
              {isFirebaseConnected ? "متصل ومباشر 🟢" : "الوضع المحلي 🟡"}
            </span>
          </div>

        </div>
      )}
    </header>
  );
}
