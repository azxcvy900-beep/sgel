'use client';

import React, { useState, useEffect } from 'react';
import { AssistantView } from './components/pricing/AssistantView';
import { AdminView } from './components/pricing/AdminView';
import { AiTutorDrawer } from './components/pricing/AiTutorDrawer';
import { subscribeToPricingSystem } from './firebase/pricingDb';
import { Shield, Sparkles, Building2, Layers, Wifi, WifiOff } from 'lucide-react';

export function App() {
  const [data, setData] = useState({
    products: [],
    companies: [],
    settings: { adminPin: '1234', centerName: 'مركز التوريدات والتسعير' },
    isSynced: false,
    source: 'loading'
  });

  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Subscribe to Realtime synchronization engine
  useEffect(() => {
    const unsubscribe = subscribeToPricingSystem((latest) => {
      setData(latest);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans select-none sm:select-auto" dir="rtl">
      
      {/* Global Top Brand & Status Strip */}
      <div className="bg-[#0b0d14] border-b border-slate-800/80 px-4 py-2 text-xs flex items-center justify-between">
        
        {/* Brand / Center Title */}
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
          <span className="font-black text-sm text-white tracking-wide">
            {data.settings?.centerName || 'مركز إدارة وتسعير المنتجات'}
          </span>
          <span className="hidden sm:inline text-slate-500 font-mono text-[10px]">
            v2.0 Realtime Cloud
          </span>
        </div>

        {/* Right Info & Admin Gateway */}
        <div className="flex items-center gap-3">
          
          {/* Cloud Sync Status Pill */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-full text-[11px]">
            {data.isSynced ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="text-emerald-400 font-bold hidden sm:inline">سحابي متصل</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-300 font-medium hidden sm:inline">تخزين محلي مؤقت</span>
              </>
            )}
          </div>

          {/* Admin Gateway Button */}
          <button
            type="button"
            onClick={() => setIsAdminOpen(true)}
            className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700 hover:border-amber-500/40 px-3 py-1 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer"
            title="الدخول للوحة الإدارة وتعديل الأسعار واستيراد الإكسل"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>لوحة الإدارة</span>
          </button>

        </div>
      </div>

      {/* Main View: Assistant View OR Admin View */}
      {isAdminOpen ? (
        <AdminView
          products={data.products}
          companies={data.companies}
          settings={data.settings}
          isSynced={data.isSynced}
          onCloseAdmin={() => setIsAdminOpen(false)}
        />
      ) : (
        <AssistantView
          products={data.products}
          companies={data.companies}
          isSynced={data.isSynced}
          centerName={data.settings?.centerName}
        />
      )}

      {/* Floating Embedded AI Tutor */}
      <AiTutorDrawer
        productsCount={data.products.length}
        companiesCount={data.companies.length}
        isSynced={data.isSynced}
      />

    </div>
  );
}
