import { NextResponse } from 'next/server';

// Generates high quality natural human-like Arabic speech using Google Cloud TTS
export async function POST(request) {
  try {
    const { text } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const apiKey = (process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '').trim();

    // Clean text from bullets and markdown symbols for natural speech flow
    const cleanText = text
      .replace(/[\*\#\•\-\_]/g, ' ')
      .replace(/⚠️/g, 'تنبيه: ')
      .replace(/🔒/g, '')
      .replace(/\n+/g, '. ')
      .trim();

    if (apiKey) {
      // Use Google Cloud Text-to-Speech API with Neural2/Wavenet Arabic natural voices
      const ttsUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
      const ttsRes = await fetch(ttsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text: cleanText },
          voice: {
            languageCode: 'ar-XA',
            name: 'ar-XA-Wavenet-B', // Premium natural male Arabic voice
            ssmlGender: 'MALE'
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 1.05,
            pitch: 0.0
          }
        })
      });

      if (ttsRes.ok) {
        const data = await ttsRes.json();
        if (data.audioContent) {
          return NextResponse.json({
            audioBase64: data.audioContent,
            isNeural: true
          });
        }
      }
    }

    // Fallback: return clean text for enhanced browser voice selection
    return NextResponse.json({
      cleanText,
      isNeural: false
    });

  } catch (err) {
    console.error("TTS Route Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
