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
  const [typedMessage, setTypedMessage] = useState('');
  const [lastSpeech, setLastSpeech] = useState('مرحباً بك! أنا أستمع إليك باستمرار...');
  const [showHistory, setShowHistory] = useState(false);
  const [sessionMessages, setSessionMessages] = useState([]);
  const [pendingAction, setPendingAction] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionSuccessBanner, setActionSuccessBanner] = useState('');

  const recognitionRef = useRef(null);
  const chatBottomRef = useRef(null);
  const shouldKeepListeningRef = useRef(true);

  // Auto scroll
  useEffect(() => {
    if (showHistory) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [sessionMessages, showHistory]);

  // CONTINUOUS LISTENING ENGINE (Always connected like a real person)
  useEffect(() => {
    if (!isOpen) {
      shouldKeepListeningRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    shouldKeepListeningRef.current = true;

    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true; // Stay open continually
        recognition.interimResults = true;
        recognition.lang = 'ar-SA';

        recognition.onstart = () => setIsListening(true);
        recognition.onerror = (e) => {
          console.warn("Speech recognition warning:", e);
        };

        recognition.onend = () => {
          // If modal is still open, automatically restart listening loop!
          if (shouldKeepListeningRef.current && isOpen) {
            try {
              recognition.start();
            } catch (err) {}
          } else {
            setIsListening(false);
          }
        };

        recognition.onresult = (event) => {
          let currentText = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentText += event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              const finalText = currentText.trim();
              if (finalText) {
                setTranscript(finalText);
                handleSendMessage(finalText);
              }
              currentText = '';
            } else {
              setTranscript(currentText);
            }
          }
        };

        recognitionRef.current = recognition;

        // Auto-start listening on modal open
        try {
          recognition.start();
        } catch (e) {}
      }
    }

    return () => {
      shouldKeepListeningRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, [isOpen]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      shouldKeepListeningRef.current = false;
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      shouldKeepListeningRef.current = true;
      setTranscript('');
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSendMessage = async (textToSend, providedPin = '') => {
    const text = (textToSend || transcript || typedMessage).trim();
    if (!text) return;

    setTypedMessage('');
    setTranscript('');
    const userMsg = { sender: 'user', text };
    setSessionMessages((prev) => [...prev, userMsg]);
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
        // Voice Exit Command: "أغلق المحادثة"
        if (data.action.type === 'CLOSE_ASSISTANT') {
          shouldKeepListeningRef.current = false;
          setTimeout(() => {
            onClose();
          }, 1500);
          return;
        }

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
            title="عرض / إخفاء السجل والكتابة اليدوية"
          >
            {showHistory ? '🎙️ الوضع الصوتي النقي' : '💬 المحادثة والكتابة'}
          </button>

          <button
            className="btn-zen-close"
            onClick={() => {
              shouldKeepListeningRef.current = false;
              onClose();
            }}
            title="إغلاق المحادثة"
          >
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

        {/* VIEW 1: ZEN LIVING ORB (Pure Voice Mode) */}
        {!showHistory ? (
          <div className="zen-center-stage">
            <div
              className={`zen-orb-wrapper ${isListening ? 'listening' : ''} ${loading ? 'thinking' : ''}`}
              onClick={toggleListening}
              title={isListening ? 'المايك يعمل باستمرار (اضغط للإيقاف المؤقت)' : 'اضغط لبدء الاستماع'}
            >
              <div className="zen-orb-core">
                <span className="zen-mic-icon">{isListening ? '🎙️' : '🛑'}</span>
              </div>
              <div className="zen-orb-ring ring-1"></div>
              <div className="zen-orb-ring ring-2"></div>
              <div className="zen-orb-ring ring-3"></div>
            </div>

            <div className="zen-captions-box">
              <p className="zen-caption-status">
                {isListening ? '● متصل ومستمع لصوتك دائماً...' : 'موقوف مؤقتاً'}
              </p>
              <h2 className="zen-caption-main" style={{ whiteSpace: 'pre-line' }}>
                {transcript ? `"${transcript}"` : lastSpeech}
              </h2>
            </div>
          </div>
        ) : (
          /* VIEW 2: DUAL HISTORY & TEXT INPUT (For typing manually too) */
          <div className="zen-history-panel">
            <div className="zen-history-header">
              <span>المحادثة المؤقتة والكتابة اليدوية</span>
              <span className="history-count">{sessionMessages.length} رسالة</span>
            </div>

            <div className="zen-history-messages">
              {sessionMessages.length === 0 ? (
                <p className="empty-history-hint">تحدث بالصوت أو اكتب استفسارك في الأسفل مباشرة.</p>
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

            {/* MANUAL TEXT INPUT IN HISTORY VIEW */}
            <form
              className="zen-text-input-bar"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(typedMessage);
              }}
            >
              <input
                type="text"
                placeholder="اكتب استفسارك أو طلبك هنا يدوياً..."
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
              />
              <button type="submit" className="btn-send-text" disabled={loading || !typedMessage.trim()}>
                إرسال
              </button>
            </form>
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

        {/* Bottom Quick Mic Indicator */}
        <div className="zen-bottom-controls">
          <button
            className={`btn-floating-listen ${isListening ? 'listening' : ''}`}
            onClick={toggleListening}
          >
            {isListening ? 'الاستماع مستمر ● (اضغط للإيقاف)' : 'تشغيل الاستماع 🎙️'}
          </button>
        </div>

      </div>
    </div>
  );
}
