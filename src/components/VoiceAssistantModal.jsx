'use client';

import { useState, useEffect, useRef } from 'react';

export default function VoiceAssistantModal({
  isOpen,
  onClose,
  companies,
  products,
  adminPin,
  onApplyAction,
  clientApiKey
}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastSpeech, setLastSpeech] = useState('مرحباً بك! أنا مستمع إليك...');
  const [showHistory, setShowHistory] = useState(false);
  const [sessionMessages, setSessionMessages] = useState([]);
  const [pendingAction, setPendingAction] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionSuccessBanner, setActionSuccessBanner] = useState('');

  const recognitionRef = useRef(null);
  const chatBottomRef = useRef(null);

  // Auto scroll in history
  useEffect(() => {
    if (showHistory) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [sessionMessages, showHistory]);

  // Speech Recognition Setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'ar-SA';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);
        recognition.onresult = (event) => {
          let currentText = '';
          for (let i = 0; i < event.results.length; i++) {
            currentText += event.results[i][0].transcript;
          }
          setTranscript(currentText);
          if (event.results[0].isFinal) {
            handleSendMessage(currentText);
          }
        };

        recognitionRef.current = recognition;
      }
    }
  }, [companies, products, adminPin, pendingAction]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('المتصفح الحالي لا يدعم الاستماع الصوتي المباشر.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript('');
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSendMessage = async (textToSend, providedPin = '') => {
    const text = textToSend || transcript;
    if (!text.trim()) return;

    // Save in session in-memory history
    const userMsg = { sender: 'user', text };
    setSessionMessages((prev) => [...prev, userMsg]);
    setTranscript('');
    setLoading(true);
    setLastSpeech('جارٍ الفهم والتحليل...');

    try {
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: { companies, products, adminPin },
          pinProvided: providedPin,
          apiKey: clientApiKey
        })
      });

      const data = await res.json();
      setLoading(false);

      if (data.replyText) {
        setLastSpeech(data.replyText);
        setSessionMessages((prev) => [...prev, { sender: 'ai', text: data.replyText }]);
      }

      if (data.action) {
        if (data.action.requiresPin && providedPin !== adminPin) {
          setPendingAction(data.action);
        } else {
          onApplyAction(data.action);
          setPendingAction(null);
          triggerSuccessAnimation('تم حفظ وتحديث البيانات في السحابة بنجاح!');
        }
      }
    } catch {
      setLoading(false);
      const errMsg = 'عذراً، حدث خطأ أثناء الاتصال.';
      setLastSpeech(errMsg);
      setSessionMessages((prev) => [...prev, { sender: 'ai', text: errMsg }]);
    }
  };

  const triggerSuccessAnimation = (text) => {
    setActionSuccessBanner(text);
    setTimeout(() => setActionSuccessBanner(''), 4000);
  };

  const handleConfirmPin = (e) => {
    e.preventDefault();
    if (pinInput === adminPin) {
      if (pendingAction) {
        onApplyAction(pendingAction);
        const successText = '✅ تم تأكيد الرمز 1234 وحفظ البيانات في السحابة بنجاح!';
        setLastSpeech(successText);
        setSessionMessages((prev) => [...prev, { sender: 'ai', text: successText }]);
        triggerSuccessAnimation('تم التحديث والمزامنة في Firebase فوراً!');
        setPendingAction(null);
        setPinInput('');
      }
    } else {
      const failText = '❌ رمز التأكيد غير صحيح!';
      setLastSpeech(failText);
      setPinInput('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="zen-voice-overlay">
      <div className="zen-voice-canvas">

        {/* Top Minimal Bar */}
        <div className="zen-top-bar">
          <button
            className={`btn-history-toggle ${showHistory ? 'active' : ''}`}
            onClick={() => setShowHistory(!showHistory)}
            title="عرض / إخفاء السجل الكتابي"
          >
            {showHistory ? '🎙️ إخفاء السجل' : '💬 السجل الكتابي'}
          </button>

          <button className="btn-zen-close" onClick={onClose} title="إغلاق">
            ✕
          </button>
        </div>

        {/* Persistent Success Banner for Cloud Saves */}
        {actionSuccessBanner && (
          <div className="zen-success-pill">
            <span className="pill-dot">●</span>
            <span>{actionSuccessBanner}</span>
          </div>
        )}

        {/* MAIN VISUAL: The Intelligent Living Orb */}
        {!showHistory ? (
          <div className="zen-center-stage">
            <div
              className={`zen-orb-wrapper ${isListening ? 'listening' : ''} ${loading ? 'thinking' : ''}`}
              onClick={toggleListening}
              title={isListening ? 'اضغط لإيقاف الاستماع' : 'اضغط للتحدث بصوتك'}
            >
              <div className="zen-orb-core">
                <span className="zen-mic-icon">{isListening ? '🛑' : '🎙️'}</span>
              </div>
              <div className="zen-orb-ring ring-1"></div>
              <div className="zen-orb-ring ring-2"></div>
              <div className="zen-orb-ring ring-3"></div>
            </div>

            {/* Dynamic Status / Spoken Output */}
            <div className="zen-captions-box">
              <p className="zen-caption-status">
                {isListening ? 'أنا أستمع إليك الآن...' : loading ? 'جارٍ التفكير...' : 'جاهز للاستماع'}
              </p>
              <h2 className="zen-caption-main" style={{ whiteSpace: 'pre-line' }}>
                {transcript ? `"${transcript}"` : lastSpeech}
              </h2>
            </div>
          </div>
        ) : (
          /* OPTIONAL: Slide-in Clean Minimal Chat History */
          <div className="zen-history-panel">
            <div className="zen-history-header">
              <span>سجل المحادثة الحالية (مؤقت)</span>
              <span className="history-count">{sessionMessages.length} رسالة</span>
            </div>
            <div className="zen-history-messages">
              {sessionMessages.length === 0 ? (
                <p className="empty-history-hint">لم يتم تسجيل أي محادثة بعد، تحدث لتبدأ.</p>
              ) : (
                sessionMessages.map((m, idx) => (
                  <div key={idx} className={`zen-msg-bubble ${m.sender}`}>
                    <span className="msg-tag">{m.sender === 'user' ? 'أنت' : 'المساعد'}</span>
                    <p style={{ whiteSpace: 'pre-line' }}>{m.text}</p>
                  </div>
                ))
              )}
              <div ref={chatBottomRef} />
            </div>
          </div>
        )}

        {/* PIN Authorization Drawer (Only opens when adding/updating price or company) */}
        {pendingAction && (
          <div className="zen-pin-bar">
            <div className="zen-pin-inner">
              <div className="pin-hint-text">
                <span className="lock-icon">🔒</span>
                <span>تأكيد العملية برمز الإدارة (1234):</span>
              </div>
              <form onSubmit={handleConfirmPin} className="pin-input-row">
                <input
                  type="password"
                  placeholder="أدخل الرمز..."
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  autoFocus
                  maxLength={8}
                />
                <button type="submit" className="btn-confirm-action">تأكيد وحفظ</button>
              </form>
            </div>
          </div>
        )}

        {/* Bottom Quick Mic Control */}
        <div className="zen-bottom-controls">
          <button
            className={`btn-floating-listen ${isListening ? 'listening' : ''}`}
            onClick={toggleListening}
          >
            {isListening ? 'إيقاف الاستماع 🛑' : 'اضغط للتحدث 🎙️'}
          </button>
        </div>

      </div>
    </div>
  );
}
