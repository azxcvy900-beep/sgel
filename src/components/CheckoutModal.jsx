import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  CreditCard, 
  CheckCircle2, 
  DownloadCloud, 
  ShieldCheck, 
  Lock, 
  ArrowRight,
  FolderArchive
} from 'lucide-react';
import { generateCasePdf, downloadCaseFile } from '../utils/pdfGenerator';

export function CheckoutModal({ 
  isOpen, 
  onClose, 
  cartItems, 
  appliedCoupon, 
  onOrderCompleted 
}) {
  const [step, setStep] = useState('details'); // details, processing, success
  const [paymentMethod, setPaymentMethod] = useState('mada');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [completedOrder, setCompletedOrder] = useState(null);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + (Number(item.price) || 0), 0);
  const discountAmount = appliedCoupon ? (subtotal * (appliedCoupon.percent / 100)) : 0;
  const total = Math.max(0, subtotal - discountAmount);

  const formatPrice = (val) => {
    const num = Number(val) || 0;
    return num.toFixed(num % 1 === 0 ? 0 : 2);
  };

  const isFree = total === 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    setStep('processing');

    setTimeout(() => {
      const orderRef = `SJ-${Math.floor(100000 + Math.random() * 900000)}`;
      const order = {
        orderId: orderRef,
        date: new Date().toLocaleDateString('ar-SA'),
        customerName: formData.name || 'محقق سجل',
        customerEmail: formData.email,
        items: [...cartItems],
        totalPrice: total,
      };

      setCompletedOrder(order);
      setStep('success');

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#f43f5e', '#fbbf24', '#34d399', '#ffffff']
      });

      if (onOrderCompleted) {
        onOrderCompleted(order);
      }
    }, 1500);
  };

  const handleDownloadSinglePdf = (item) => {
    downloadCaseFile(item);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-dark-900 border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-2 sm:my-8 max-h-[95vh] overflow-y-auto">
        
        {/* Top Header */}
        <div className="px-6 py-4 bg-dark-950 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h3 className="text-base sm:text-lg font-bold font-display text-white">
              {step === 'success' 
                ? (isFree ? 'تم استلام طلبك المجاني بنجاح' : 'تم اعتماد الطلب بنجاح')
                : (isFree ? 'إتمام الطلب المجاني والتحميل الفوري' : 'إتمام الشراء والتحميل الفوري')}
            </h3>
          </div>

          {step !== 'processing' && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-stone-300 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8">

          {/* Details & Payment */}
          {step === 'details' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Total Mini Bar */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                <div>
                  <div className="text-xs text-stone-400">إجمالي المطلوب سداده:</div>
                  {isFree ? (
                    <div className="text-xl font-bold font-mono text-emerald-400 flex items-center gap-2">
                      <span>🎁 مجاناً بالكامل</span>
                      <span className="text-xs text-emerald-500/80 font-normal">(0.00 ر.س)</span>
                    </div>
                  ) : (
                    <div className="text-xl font-bold font-mono text-white">
                      {formatPrice(total)} <span className="text-xs font-sans text-amber-400">ر.س</span>
                    </div>
                  )}
                </div>
                <div className="text-xs text-stone-400 font-mono">
                  {cartItems.length} {cartItems.length === 1 ? 'كتاب رقمي' : 'كتب رقمية'}
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-3">
                <label className="block text-xs font-mono text-stone-400 uppercase tracking-wider">
                  بيانات المشتري والبريد
                </label>
                
                <div className="space-y-3">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="الاسم الكامل"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-stone-200 focus:outline-none focus:border-amber-400/60"
                    />
                  </div>

                  <div>
                    <input
                      type="email"
                      required
                      placeholder="البريد الإلكتروني (لاستلام نسخة إضافية من الملفات)"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-stone-200 focus:outline-none focus:border-amber-400/60"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Methods or Free Notification */}
              {isFree ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="text-xs leading-relaxed space-y-1">
                    <div className="font-bold text-sm text-emerald-300">طلب مجاني 100% 🎁</div>
                    <p className="text-stone-300">
                      هذا الطلب مجاني بالكامل ولا يتطلب إدخال أي بطاقة بنكية أو رسوم إضافية. أدخل بريدك الإلكتروني واضغط على الزر أدناه للتحميل الفوري.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="block text-xs font-mono text-stone-400 uppercase tracking-wider">
                    طريقة الدفع المعتمدة
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: 'mada', label: 'مدى (Mada)', badge: '💳' },
                      { id: 'apple_pay', label: 'Apple Pay', badge: '🍏' },
                      { id: 'visa', label: 'بطاقة ائتمان', badge: '🪙' },
                      { id: 'stc_pay', label: 'STC Pay', badge: '📲' },
                    ].map((m) => (
                      <div
                        key={m.id}
                        onClick={() => setPaymentMethod(m.id)}
                        className={`p-3 rounded-xl border cursor-pointer text-center transition ${
                          paymentMethod === m.id
                            ? 'border-amber-400/80 bg-amber-400/10 text-white font-bold'
                            : 'border-white/[0.08] bg-white/[0.02] text-stone-400 hover:border-white/20'
                        }`}
                      >
                        <span className="text-xl block mb-1">{m.badge}</span>
                        <span className="text-xs block">{m.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                className={`w-full py-4 rounded-xl text-white font-bold text-sm shadow-xl transition flex items-center justify-center gap-2 ${
                  isFree
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-950/40'
                    : 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 shadow-rose-950/40'
                }`}
              >
                {isFree ? (
                  <>
                    <DownloadCloud className="w-4 h-4 text-emerald-200" />
                    <span>تأكيد والتحميل المباشر مجاناً 🎁</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-amber-300" />
                    <span>إتمام الشراء والتحميل الفوري ({formatPrice(total)} ر.س)</span>
                  </>
                )}
              </button>

            </form>
          )}

          {/* Processing */}
          {step === 'processing' && (
            <div className="py-16 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full border-3 border-amber-400 border-t-transparent animate-spin" />
              <h4 className="text-base font-bold text-white">
                {isFree ? 'جارٍ تجهيز ملفاتك الرقمية المجانية...' : 'جارٍ معالجة وتجهيز ملفات الكتب الرقمية...'}
              </h4>
              <p className="text-xs text-stone-400 font-mono">
                اعتماد التوقيع الرقمي وإيداع الحلول المختومة
              </p>
            </div>
          )}

          {/* Success */}
          {step === 'success' && completedOrder && (
            <div className="space-y-6 text-center animate-fadeIn">
              
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-bold font-display text-white">
                  {completedOrder.totalPrice === 0 ? 'تم استلام طلبك المجاني بنجاح!' : 'تم الشراء بنجاح!'}
                </h3>
                <p className="text-stone-300 text-xs sm:text-sm mt-1">
                  {completedOrder.totalPrice === 0 
                    ? 'ملفات القضايا جاهزة للتحميل الفوري وتم حفظها في أرشيفك.'
                    : 'تم إصدار ملفات القضايا واعتماد أمر الشراء.'}
                </p>
                <div className="inline-block px-3 py-1 mt-2 rounded-full bg-white/[0.05] border border-white/[0.08] text-amber-300 font-mono text-xs font-bold">
                  رقم الإيصال: {completedOrder.orderId}
                </div>
              </div>

              {/* Downloads List */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-right space-y-3">
                <div className="text-xs font-mono font-bold text-stone-400">
                  ملفاتك الجاهزة للتحميل الفوري:
                </div>

                <div className="space-y-2">
                  {completedOrder.items.map((item) => (
                    <div 
                      key={item.id}
                      className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="text-[10px] font-mono text-amber-400">{item.caseNumber}</div>
                        <div className="text-sm font-bold text-white">{item.title}</div>
                      </div>

                      <button
                        onClick={() => handleDownloadSinglePdf(item)}
                        className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-dark-950 font-black text-xs flex items-center gap-1.5 transition shadow"
                      >
                        <DownloadCloud className="w-3.5 h-3.5" />
                        <span>
                          {item.fileUrl ? 'فتح رابط التحميل' : 
                           item.fileName?.endsWith('.zip') || item.fileData?.includes('zip') ? 'تحميل ZIP' : 'تحميل الملف'}
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-stone-200 text-xs font-bold transition border border-white/10"
              >
                العودة للتصفح
              </button>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
