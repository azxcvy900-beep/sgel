import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  X, 
  Minimize2, 
  Maximize2, 
  HelpCircle, 
  Lightbulb, 
  Copy, 
  Check, 
  RotateCcw,
  MessageSquare
} from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  'كيف أربط Firebase لمزامنة الأسعار بين الأجهزة لحظياً؟',
  'كيف أجهز ملف الإكسل لاستيراد 100 إلى 150 منتجاً؟',
  'ما هي قاعدة "السعر غير محدد - راجع الإدارة" وكيف تعمل؟',
  'كيف أعدل أسماء الشركات الـ 10 من لوحة الإدارة؟'
];

export function AiTutorDrawer({ 
  productsCount = 0, 
  companiesCount = 10, 
  isSynced = false 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `مرحباً بك! أنا **المساعد الذكي التعليمي** لنظام تسعير وإدارة المنتجات 🤖.
      
أنا هنا لمساعدتك خطوة بخطوة في:
1. **ربط وتفعيل المزامنة السحابية الحية (Firebase)**.
2. **تجهيز ورفع ملفات الإكسل** وتحديث أسعار الـ 10 شركات دفعة واحدة.
3. **شرح قواعد الأمان والتسعير الفوري للمساعد**.
4. **حل أي مشكلة تقنية** تواجهك أثناء العمل.

اضغط على أحد الأسئلة المقترحة أدناه أو اكتب استفسارك مباشرة!`
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMsg = { role: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      let clientApiKey = '';
      try {
        clientApiKey = localStorage.getItem('pricing_gemini_api_key') || '';
      } catch (e) {}

      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          apiKey: clientApiKey,
          context: {
            productsCount,
            companiesCount,
            isSynced
          }
        })
      });

      const data = await res.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: data.reply || 'تم استلام استفسارك! هل ترغب في توضيح إضافي؟',
        isOfflineMode: data.isOfflineMode
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: 'عذراً، حدث خطأ في الاتصال بالشبكة. يمكنك مراجعة لوحة الإدارة لقواعد الربط.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-black p-3.5 sm:px-5 sm:py-3.5 rounded-2xl shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 border-2 border-white/20 group"
      >
        <div className="relative">
          <Bot className="w-6 h-6 text-slate-950" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse" />
        </div>
        <span className="hidden sm:inline text-xs sm:text-sm font-extrabold tracking-wide">
          المساعد التعليمي الذكي (AI)
        </span>
      </button>

      {/* Drawer / Slide-Over Window */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#10131f] border-r sm:border-l border-slate-800 w-full sm:max-w-md md:max-w-lg h-full flex flex-col shadow-2xl animate-slide-left">
            
            {/* Header */}
            <div className="bg-[#151928] border-b border-slate-800 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">المساعد الذكي لإدارة المركز</h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Gemini AI Tutor المدمج</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Suggested Prompt Chips */}
            <div className="p-3 bg-slate-950/80 border-b border-slate-800/80 overflow-x-auto scrollbar-none flex gap-2">
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-slate-300 hover:text-amber-300 text-[11px] font-medium px-3 py-1.5 rounded-xl whitespace-nowrap transition-all text-right shrink-0"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs scrollbar-thin scrollbar-thumb-slate-700">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl p-3.5 space-y-2 leading-relaxed shadow-md ${
                      msg.role === 'user'
                        ? 'bg-amber-500 text-slate-950 font-bold rounded-tl-sm'
                        : 'bg-[#181d2e] text-slate-200 border border-slate-700/60 rounded-tr-sm'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans text-xs sm:text-[13px]">
                      {msg.text}
                    </div>

                    {msg.isOfflineMode && (
                      <div className="text-[10px] text-amber-400/80 border-t border-slate-700/60 pt-1 mt-1">
                        💡 نصيحة: يمكنك إدخال مفتاح Gemini API في لوحة الإدارة لمحادثة حرة غير محدودة.
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#181d2e] border border-slate-700/60 rounded-2xl p-3 text-slate-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[11px] mr-1">المساعد الذكي يكتب الإجابة...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-[#151928] border-t border-slate-800">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="اسأل المساعد عن الإكسل، الفايربيس، أو الأسعار..."
                  className="flex-1 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim() || isLoading}
                  className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 p-2.5 rounded-xl transition-all shadow-md active:scale-95"
                >
                  <Send className="w-4 h-4 rotate-180" />
                </button>
              </form>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
