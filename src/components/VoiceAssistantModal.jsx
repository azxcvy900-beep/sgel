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
  const [loading, setLoading] = useState(false);
  const [statusBanner, setStatusBanner] = useState({ type: '', text: '' });

  const recognitionRef = useRef(null);
  const chatBottomRef = useRef(null);
  const shouldKeepListeningRef = useRef(true);
  const pendingActionRef = useRef(null);

  // Keep ref synced
  useEffect(() => {
    pendingActionRef.current = pendingAction;
  }, [pendingAction]);

  // Auto scroll
  useEffect(() => {
    if (showHistory) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [sessionMessages, showHistory]);

  // Speech Recognition Setup (Continuous Loop)
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
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'ar-SA';

        recognition.onstart = () => setIsListening(true);
        recognition.onerror = () => {};

        recognition.onend = () => {
          if (shouldKeepListeningRef.current && isOpen) {
            try { recognition.start(); } catch (err) {}
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
        try { recognition.start(); } catch (e) {}
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
      } catch (err) {}
    }
  };

  const handleSendMessage = async (textToSend, manualPin = '') => {
    const text = (textToSend || transcript || typedMessage).trim();
    if (!text && !manualPin) return;

    setTypedMessage('');
    setTranscript('');
    const userMsg = { sender: 'user', text: text || `[رمز التأكيد: ${manualPin}]` };
    setSessionMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setLastSpeech('جارٍ الفهم والتحليل...');

    try {
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: {
            companies,
            products,
            adminPin,
            pendingAction: pendingActionRef.current
          },
          pinProvided: manualPin,
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
        // Close conversation command
        if (data.action.type === 'CLOSE_ASSISTANT') {
          shouldKeepListeningRef.current = false;
          setTimeout(() => onClose(), 1500);
          return;
        }

        // Action requires PIN confirmation
        if (data.action.requiresPin && !data.action.executeNow) {
          setPendingAction(data.action);
          showBanner('warning', '🔒 مطلوب كلمة المرور (1234) لإتمام العملية');
          return;
        }

        // Successful PIN verification & Save Execution
        if (data.action.executeNow && data.action.pinSuccess) {
          onApplyAction(data.action);
          setPendingAction(null);
          showBanner('success', '✅ تم حفظ البيانات بنجاح في قاعدة البيانات السحابية!');
          return;
        }

        // Failed PIN
        if (data.action.pinSuccess === false) {
          showBanner('error', `❌ فشل الحفظ: ${data.action.errorMsg || 'كلمة المرور غير صحيحة'}`);
          return;
        }
      }
    } catch (err) {
      setLoading(false);
      const errMsg = 'عذراً، حدث خطأ أثناء الاتصال.';
      setLastSpeech(errMsg);
      setSessionMessages((prev) => [...prev, { sender: 'ai', text: errMsg }]);
      showBanner('error', '❌ تعذر الاتصال بالسيرفر');
    }
  };

  const showBanner = (type, text) => {
    setStatusBanner({ type, text });
    setTimeout(() => setStatusBanner({ type: '', text: '' }), 4500);
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
            {showHistory ? '🎙️ الوضع الصوتي' : '💬 المحادثة والكتابة'}
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

        {/* Dynamic Status / Success / Error Banner */}
        {statusBanner.text && (
          <div className={`zen-notification-banner ${statusBanner.type}`}>
            <span>{statusBanner.text}</span>
          </div>
        )}

        {/* VIEW 1: LIVING ORB (Pure Voice Mode) */}
        {!showHistory ? (
          <div className="zen-center-stage">
            <div
              className={`zen-orb-wrapper ${isListening ? 'listening' : ''} ${loading ? 'thinking' : ''}`}
              onClick={toggleListening}
              title={isListening ? 'المايك يستمع لصوتك باستمرار' : 'اضغط لبدء الاستماع'}
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
                {pendingAction
                  ? '🔒 بانتظار كلمة المرور بالصوت أو الكتابة...'
                  : isListening
                  ? '● متصل ومستمع لصوتك دائماً...'
                  : 'موقوف مؤقتاً'}
              </p>
              <h2 className="zen-caption-main" style={{ whiteSpace: 'pre-line' }}>
                {transcript ? `"${transcript}"` : lastSpeech}
              </h2>
            </div>
          </div>
        ) : (
          /* VIEW 2: DUAL HISTORY & MANUAL TEXT INPUT */
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

            <form
              className="zen-text-input-bar"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(typedMessage);
              }}
            >
              <input
                type="text"
                placeholder={pendingAction ? "اكتب كلمة المرور هنا أو انطقها..." : "اكتب استفسارك أو طلبك هنا..."}
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
              />
              <button type="submit" className="btn-send-text" disabled={loading || !typedMessage.trim()}>
                إرسال
              </button>
            </form>
          </div>
        )}

        {/* Bottom Quick Mic Indicator */}
        <div className="zen-bottom-controls">
          <button
            className={`btn-floating-listen ${isListening ? 'listening' : ''}`}
            onClick={toggleListening}
          >
            {isListening ? 'الاستماع مستمر ● (تكلم في أي وقت)' : 'تشغيل الاستماع 🎙️'}
          </button>
        </div>

      </div>
    </div>
  );
}
