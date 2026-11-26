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
  const audioPlayerRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

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

  // Human-like Natural Voice Synthesis (Instant Studio Sound, No Browser Synth)
  const speakNatural = async (text) => {
    try {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.currentTime = 0;
      }

      setIsSpeaking(true);

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          const audio = new Audio(`data:audio/mp3;base64,${data.audioBase64}`);
          audio.playbackRate = 1.25; // Lively human conversational speed
          audioPlayerRef.current = audio;
          audio.onended = () => setIsSpeaking(false);
          audio.onerror = () => setIsSpeaking(false);
          await audio.play();
          return;
        }
      }
    } catch (e) {
      console.warn("Studio audio error:", e);
    }

    setIsSpeaking(false);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('المتصفح الحالي لا يدعم التسجيل الصوتي المباشر، يمكنك الكتابة في الأسفل.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        setIsSpeaking(false);
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
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
        const successText = 'تم تأكيد الرمز وتنفيذ العملية بنجاح وتحديث الأسعار!';
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
            <h3>المساعد الصوتي البشري</h3>
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
