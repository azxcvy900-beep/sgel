import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowLeft, 
  Check, 
  AlertCircle,
  DownloadCloud,
  CheckCircle2,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { downloadCaseFile } from '../utils/pdfGenerator';

export function CartDrawer({ 
  isOpen, 
  onClose, 
  cartItems, 
  onRemoveItem, 
  appliedCoupon, 
  onApplyCoupon, 
  onProceedToCheckout,
  onOrderCompleted
}) {
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadSuccessOrder, setDownloadSuccessOrder] = useState(null);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + (Number(item.price) || 0), 0);
  const discountAmount = appliedCoupon ? (subtotal * (appliedCoupon.percent / 100)) : 0;
  const total = Math.max(0, subtotal - discountAmount);

  const formatPrice = (val) => {
    const num = Number(val) || 0;
    return num.toFixed(num % 1 === 0 ? 0 : 2);
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    if (!couponInput.trim()) return;

    if (couponInput.trim().toUpperCase() === 'DETECTIVE15') {
      onApplyCoupon({ code: 'DETECTIVE15', percent: 15 });
      setCouponInput('');
    } else {
      setCouponError('كود الخصم غير صحيح');
    }
  };

  const handleInstantOneStepDownload = async () => {
    if (cartItems.length === 0 || isProcessing) return;
    setIsProcessing(true);

    const orderRef = `SJ-${Math.floor(100000 + Math.random() * 900000)}`;
    const currentItems = [...cartItems];
    const order = {
      orderId: orderRef,
      date: new Date().toLocaleDateString('ar-SA'),
      customerName: 'محقق سجل',
      customerEmail: customerEmail.trim() || 'عميل سجل',
      items: currentItems,
      totalPrice: total,
    };

    // Stagger downloads to prevent browser blocking simultaneous downloads
    currentItems.forEach((item, index) => {
      setTimeout(() => {
        downloadCaseFile(item);
      }, index * 350);
    });

    confetti({
      particleCount: 100,
      spread: 75,
      origin: { y: 0.5 },
      colors: ['#f43f5e', '#fbbf24', '#34d399', '#ffffff']
    });

    if (onOrderCompleted) {
      await onOrderCompleted(order);
    }

    setDownloadSuccessOrder(order);
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-md">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 left-0 max-w-full flex sm:pl-10">
        <div className="w-screen max-w-md bg-dark-900 border-r border-white/10 shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-6 border-b border-white/[0.08] bg-dark-950 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-rose-500" />
              <h3 className="text-lg font-bold font-display text-white">
                سلة الكتب الرقمية
              </h3>
              <span className="text-xs bg-amber-400/10 text-amber-300 px-2.5 py-0.5 rounded-full font-mono font-bold">
                {cartItems.length}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/[0.05] text-stone-300 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-3">
            {downloadSuccessOrder ? (
              <div className="py-6 text-center space-y-5 animate-fadeIn">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-950/40">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold font-display text-white">
                    تم التحميل بنجاح بخطوة واحدة! 🚀
                  </h3>
                  <p className="text-xs text-stone-300">
                    تم إيداع ملفات القضايا في جهازك وحفظها دائماً في أرشيفك الشخصي.
                  </p>
                  <div className="inline-block px-3 py-1 mt-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-amber-300 font-mono text-xs font-bold">
                    رقم الطلب: {downloadSuccessOrder.orderId}
                  </div>
                </div>

                {/* Individual Re-Download list */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-right space-y-2">
                  <div className="text-[11px] font-mono font-bold text-stone-400">
                    روابط التحميل المباشرة:
                  </div>
                  {downloadSuccessOrder.items.map((item) => (
                    <div 
                      key={item.id}
                      className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-between gap-2"
                    >
                      <div className="text-right truncate max-w-[190px]">
                        <div className="text-[10px] font-mono text-amber-400">{item.caseNumber}</div>
                        <div className="text-xs font-bold text-white truncate">{item.title}</div>
                      </div>
                      <button
                        onClick={() => downloadCaseFile(item)}
                        className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-dark-950 font-bold text-xs flex items-center gap-1.5 transition shadow"
                      >
                        <DownloadCloud className="w-3.5 h-3.5" />
                        <span>تحميل</span>
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setDownloadSuccessOrder(null);
                    onClose();
                  }}
                  className="w-full py-3.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-stone-200 text-xs font-bold transition border border-white/10"
                >
                  تم - إغلاق ومتابعة التصفح
                </button>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-20 space-y-3">
                <span className="text-4xl block">🔍</span>
                <p className="text-stone-300 font-bold text-base">السلة فارغة حالياً</p>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  اختر كتب التحقيق التي تود حلها لكشف الجناة.
                </p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div 
                  key={item.id}
                  className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-start justify-between gap-3 hover:border-amber-400/20 transition"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-amber-400 font-bold">
                      {item.caseNumber}
                    </span>
                    <h4 className="text-sm font-bold text-white leading-snug">
                      {item.title}
                    </h4>
                    <div className="text-xs text-stone-400 font-mono">
                      {item.pages} ص • {item.difficulty}
                    </div>
                    <div className="text-sm font-bold font-mono pt-1">
                      {Number(item.price) === 0 ? (
                        <span className="text-emerald-400 font-bold">🎁 مجاناً</span>
                      ) : (
                        <span className="text-white">
                          {formatPrice(item.price)} <span className="text-xs text-amber-400 font-sans">ر.س</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-2 rounded-xl text-stone-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {!downloadSuccessOrder && cartItems.length > 0 && (
            <div className="p-6 bg-dark-950 border-t border-white/[0.08] space-y-4">
              
              {/* Coupon Form */}
              <div>
                {appliedCoupon ? (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>كود الخصم نشط: <strong>{appliedCoupon.code}</strong> (-{appliedCoupon.percent}%)</span>
                    </div>
                    <button
                      onClick={() => onApplyCoupon(null)}
                      className="text-stone-400 hover:text-white text-xs underline"
                    >
                      إلغاء
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="كود الخصم (مثل DETECTIVE15)"
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-stone-200 uppercase placeholder-stone-500 focus:outline-none focus:border-amber-400/60"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-amber-300 text-xs font-bold transition border border-white/10"
                    >
                      تطبيق
                    </button>
                  </form>
                )}
                {couponError && (
                  <div className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{couponError}</span>
                  </div>
                )}
              </div>

              {/* Subtotal & Total */}
              <div className="space-y-2 text-xs font-mono pt-2 border-t border-white/[0.06]">
                <div className="flex justify-between text-stone-400">
                  <span>المجموع:</span>
                  <span>{formatPrice(subtotal)} ر.س</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-400">
                    <span>الخصم ({appliedCoupon.percent}%):</span>
                    <span>-{formatPrice(discountAmount)} ر.س</span>
                  </div>
                )}

                <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-white/[0.08]">
                  <span>الإجمالي النهائي:</span>
                  {total === 0 ? (
                    <span className="text-emerald-400 font-black flex items-center gap-1.5">
                      <span>🎁 مجاناً</span>
                      <span className="text-xs font-mono font-normal text-emerald-500/80">(0.00 ر.س)</span>
                    </span>
                  ) : (
                    <span className="text-amber-300 font-black">{formatPrice(total)} ر.س</span>
                  )}
                </div>
              </div>

              {/* Optional Email & Notice */}
              <div className="space-y-2 pt-1">
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="بريدك الإلكتروني (اختياري - لحفظ نسخة برقم الطلب)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-400/60"
                />
                
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-400/10 border border-amber-400/20 text-[11px] text-amber-300/90 font-sans">
                  <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>التحميل متاح فوراً ومجاناً (بوابة الدفع قيد الربط قريباً)</span>
                </div>
              </div>

              {/* Instant 1-Step Checkout CTA */}
              <button
                onClick={handleInstantOneStepDownload}
                disabled={isProcessing}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-950/40 transition flex items-center justify-center gap-2 group cursor-pointer"
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <DownloadCloud className="w-5 h-5 text-emerald-200 group-hover:-translate-y-0.5 transition" />
                    <span>تحميل الملفات فوراً (بخطوة واحدة ⚡)</span>
                  </>
                )}
              </button>

              {onProceedToCheckout && (
                <button
                  type="button"
                  onClick={onProceedToCheckout}
                  className="w-full text-center text-[11px] text-stone-500 hover:text-stone-300 underline transition"
                >
                  أو فتح نافذة الدفع التقليدية
                </button>
              )}

              <p className="text-[10px] text-center text-stone-500">
                تسليم فوري ومباشر لملفات القضايا والحلول
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
