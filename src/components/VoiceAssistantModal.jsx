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
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'مرحباً بك! أنا مساعد التسعير الصوتي. يمكنك أن تسألني عن أي سعر أو تطلب إضافة/تعديل منتج أو شركة (يتطلب رمز التأكيد).'
    }
  ]);
  const [pendingAction, setPendingAction] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'ar-SA';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (e) => {
          console.error("Speech error:", e);
          setIsListening(false);
        };
        recognition.onresult = (event) => {
          const text = event.results[0][0].transcript;
          setTranscript(text);
          handleSendMessage(text);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [companies, products, adminPin, pendingAction]);

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('المتصفح الحالي لا يدعم التعرف على الصوت المباشر، يمكنك الكتابة في الأسفل.');
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
        speak(data.replyText);
      }

      // If an action was returned
      if (data.action) {
        if (data.action.requiresPin && providedPin !== adminPin) {
          setPendingAction(data.action);
        } else {
          // Authorized or no pin required
          onApplyAction(data.action);
          setPendingAction(null);
        }
      }
    } catch (err) {
      setLoading(false);
      const errMsg = 'عذراً، حدث خطأ أثناء الاتصال بمساعد الذكاء الاصطناعي.';
      setMessages((prev) => [...prev, { sender: 'ai', text: errMsg }]);
      speak(errMsg);
    }
  };

  const handleConfirmPin = (e) => {
    e.preventDefault();
    if (pinInput === adminPin) {
      if (pendingAction) {
        onApplyAction(pendingAction);
        const successText = 'تم تأكيد الرمز وتنفيذ العملية بنجاح!';
        setMessages((prev) => [...prev, { sender: 'ai', text: successText }]);
        speak(successText);
        setPendingAction(null);
        setPinInput('');
      }
    } else {
      const failText = 'رمز التأكيد غير صحيح!';
      setMessages((prev) => [...prev, { sender: 'ai', text: failText }]);
      speak(failText);
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
            <span className="voice-ai-badge">Gemini AI</span>
            <h3>المساعد الصوتي للتسعير</h3>
          </div>
          <button className="btn-close-modal" onClick={onClose}>✕</button>
        </div>

        {/* Messages Body */}
        <div className="voice-chat-box">
          {messages.map((m, idx) => (
            <div key={idx} className={`voice-bubble ${m.sender}`}>
              {m.text}
            </div>
          ))}
          {loading && (
            <div className="voice-bubble ai loading">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          )}
        </div>

        {/* Pin Prompt if Action requires authorization */}
        {pendingAction && (
          <form className="voice-pin-container" onSubmit={handleConfirmPin}>
            <p>🔒 هذه العملية تتطلب رمز التأكيد (PIN):</p>
            <div className="pin-input-group">
              <input
                type="password"
                placeholder="أدخل رمز الإدارة (1234)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                autoFocus
              />
              <button type="submit" className="btn-confirm-pin">تأكيد</button>
            </div>
          </form>
        )}

        {/* Input Bar & Mic Button */}
        <div className="voice-controls">
          <button
            type="button"
            className={`btn-mic ${isListening ? 'listening' : ''}`}
            onClick={toggleListening}
            title={isListening ? 'جارٍ الاستماع... اضغط للإيقاف' : 'اضغط للتحدث بصوتك'}
          >
            {isListening ? '🛑' : '🎙️'}
          </button>

          <input
            type="text"
            className="voice-text-input"
            placeholder={isListening ? 'جارٍ الاستماع لصوتك...' : 'أو اكتب استفسارك أو طلبك هنا...'}
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
