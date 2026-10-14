import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowLeft, 
  Check, 
  AlertCircle 
} from 'lucide-react';

export function CartDrawer({ 
  isOpen, 
  onClose, 
  cartItems, 
  onRemoveItem, 
  appliedCoupon, 
  onApplyCoupon, 
  onProceedToCheckout 
}) {
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

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

          {/* Cart Items List */}
          <div className="p-6 overflow-y-auto flex-1 space-y-3">
            {cartItems.length === 0 ? (
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
          {cartItems.length > 0 && (
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

              {/* Checkout CTA */}
              <button
                onClick={onProceedToCheckout}
                className={`w-full py-4 rounded-xl text-white font-bold text-sm shadow-xl transition flex items-center justify-center gap-2 ${
                  total === 0
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-950/40'
                    : 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 shadow-rose-950/40'
                }`}
              >
                <span>{total === 0 ? 'المتابعة للتحميل المباشر مجاناً 🎁' : 'المتابعة وإتمام الشراء'}</span>
                <ArrowLeft className="w-4 h-4" />
              </button>

              <p className="text-[10px] text-center text-stone-500">
                تسليم فوري لملف الكتاب والحل بصيغة PDF
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
