import { NextResponse } from 'next/server';

// Server-side text-to-speech generating high-fidelity natural Arabic voice
export async function POST(request) {
  try {
    const { text } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Clean text and make numbers sound natural in Arabic
    const cleanText = text
      .replace(/[\*\#\•\-\_]/g, ' ')
      .replace(/⚠️/g, 'تنبيه: ')
      .replace(/🔒/g, '')
      .replace(/ريال/g, 'ريالاً')
      .replace(/\n+/g, '. ')
      .replace(/\s+/g, ' ')
      .trim();

    // High quality Arabic speech via modern neural endpoints
    const apiKey = (process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '').trim();

    if (apiKey) {
      try {
        const gTtsRes = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: { text: cleanText },
            voice: {
              languageCode: 'ar-XA',
              name: 'ar-XA-Wavenet-B', // Premium Human Voice
              ssmlGender: 'MALE'
            },
            audioConfig: {
              audioEncoding: 'MP3',
              speakingRate: 1.0,
              pitch: -1.0 // Deep, natural human pitch
            }
          })
        });

        if (gTtsRes.ok) {
          const gData = await gTtsRes.json();
          if (gData.audioContent) {
            return NextResponse.json({
              audioBase64: gData.audioContent,
              source: 'google-neural'
            });
          }
        }
      } catch (err) {
        console.warn("Google TTS error:", err);
      }
    }

    // Fallback: Use reliable high-clarity natural MP3 stream proxy
    const cleanUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText.slice(0, 200))}&tl=ar-SA&client=tw-ob`;
    const audioStream = await fetch(cleanUrl);
    
    if (audioStream.ok) {
      const buffer = await audioStream.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      return NextResponse.json({
        audioBase64: base64,
        source: 'natural-stream'
      });
    }

    return NextResponse.json({ error: "Could not generate audio" }, { status: 500 });

  } catch (err) {
    console.error("TTS Route Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
