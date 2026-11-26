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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'مرحباً بك! أنا مساعد التسعير الصوتي. اسألني عن أي سعر أو منتج أو شركة، أو اطلب التعديل برمز الإدارة (1234).'
    }
  ]);
  const [pendingAction, setPendingAction] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [loading, setLoading] = useState(false);

  const recognitionRef = useRef(null);
  const chatBottomRef = useRef(null);
  const availableVoicesRef = useRef([]);

  // Auto scroll
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Load natural voices from browser
  useEffect(() => {
    const updateVoices = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        availableVoicesRef.current = window.speechSynthesis.getVoices();
      }
    };
    updateVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

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

  // 100% Reliable Human Natural Speech
  const speakNatural = (text) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const cleanText = text
      .replace(/[\*\#\•\-\_]/g, ' ')
      .replace(/⚠️/g, 'تنبيه: ')
      .replace(/🔒/g, '')
      .replace(/ريال/g, 'ريال')
      .replace(/\n+/g, '، ')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ar-SA';
    utterance.rate = 1.15; // Natural human pace (fast & confident)
    utterance.pitch = 1.0;

    const voices = availableVoicesRef.current.length > 0 
      ? availableVoicesRef.current 
      : window.speechSynthesis.getVoices();

    // Priority filter for modern natural human Arabic voices
    const humanVoice = voices.find(v => 
      v.lang.startsWith('ar') && 
      (v.name.includes('Natural') || v.name.includes('Hamed') || v.name.includes('Google') || v.name.includes('Online') || v.name.includes('Maged'))
    ) || voices.find(v => v.lang.startsWith('ar') && !v.name.includes('Desktop')) 
      || voices.find(v => v.lang.startsWith('ar'));

    if (humanVoice) {
      utterance.voice = humanVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('المتصفح الحالي لا يدعم التسجيل الصوتي المباشر، يمكنك الكتابة في الأسفل.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
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

    const userMsg = { sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setTranscript('');
    setLoading(true);

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
        setMessages((prev) => [...prev, { sender: 'ai', text: data.replyText }]);
        speakNatural(data.replyText);
      }

      if (data.action) {
        if (data.action.requiresPin && providedPin !== adminPin) {
          setPendingAction(data.action);
        } else {
          onApplyAction(data.action);
          setPendingAction(null);
        }
      }
    } catch {
      setLoading(false);
      const errMsg = 'عذراً، حدث خطأ أثناء معالجة الطلب.';
      setMessages((prev) => [...prev, { sender: 'ai', text: errMsg }]);
      speakNatural(errMsg);
    }
  };

  const handleConfirmPin = (e) => {
    e.preventDefault();
    if (pinInput === adminPin) {
      if (pendingAction) {
        onApplyAction(pendingAction);
        const successText = 'تم تأكيد الرمز 1234 وتنفيذ العملية بنجاح وتحديث الأسعار!';
        setMessages((prev) => [...prev, { sender: 'ai', text: successText }]);
        speakNatural(successText);
        setPendingAction(null);
        setPinInput('');
      }
    } else {
      const failText = 'رمز التأكيد غير صحيح!';
      setMessages((prev) => [...prev, { sender: 'ai', text: failText }]);
      speakNatural(failText);
      setPinInput('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="voice-modal-overlay">
      <div className="voice-modal-content">
        {/* Header */}
        <div className="voice-modal-header">
          <div className="voice-header-title">
            <span className={`voice-pulse-indicator ${isSpeaking ? 'speaking' : ''}`}></span>
            <h3>المساعد الصوتي الذكي</h3>
            {isSpeaking && <span className="speaking-tag">🔊 يتحدث...</span>}
          </div>
          <button className="btn-close-modal" onClick={onClose}>✕</button>
        </div>

        {/* Dynamic Voice Visualizer Wave when listening or speaking */}
        {(isListening || isSpeaking) && (
          <div className={`voice-wave-container ${isSpeaking ? 'speaking-wave' : ''}`}>
            <span className="wave-bar"></span>
            <span className="wave-bar"></span>
            <span className="wave-bar"></span>
            <span className="wave-bar"></span>
            <span className="wave-bar"></span>
            <span className="wave-bar"></span>
            <span className="wave-bar"></span>
            <p className="wave-status">
              {isListening ? 'جارٍ الاستماع لصوتك...' : 'المساعد الصوتي يجيبك الآن...'}
            </p>
          </div>
        )}

        {/* Chat Messages */}
        <div className="voice-chat-box">
          {messages.map((m, idx) => (
            <div key={idx} className={`voice-bubble ${m.sender}`}>
              <div className="bubble-content" style={{ whiteSpace: 'pre-line' }}>{m.text}</div>
            </div>
          ))}
          {loading && (
            <div className="voice-bubble ai loading">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* PIN Authorization prompt */}
        {pendingAction && (
          <form className="voice-pin-container" onSubmit={handleConfirmPin}>
            <p>🔒 عملية حساسة تتطلب رمز التأكيد (1234):</p>
            <div className="pin-input-group">
              <input
                type="password"
                placeholder="أدخل رمز الإدارة..."
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                autoFocus
                maxLength={8}
              />
              <button type="submit" className="btn-confirm-pin">تأكيد وتنفيذ</button>
            </div>
          </form>
        )}

        {/* Controls Bar */}
        <div className="voice-controls">
          <button
            type="button"
            className={`btn-mic-action ${isListening ? 'active-listening' : ''}`}
            onClick={toggleListening}
          >
            {isListening ? '🛑' : '🎙️'}
          </button>

          <input
            type="text"
            className="voice-text-input"
            placeholder={isListening ? 'جارٍ الاستماع...' : 'اكتب أو تحدث بالميكروفون...'}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(transcript)}
          />

          <button
            type="button"
            className="btn-voice-send"
            onClick={() => handleSendMessage(transcript)}
            disabled={loading}
          >
            إرسال
          </button>
        </div>
      </div>
    </div>
  );
}
