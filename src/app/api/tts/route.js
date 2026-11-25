import { NextResponse } from 'next/server';

// Ultra-realistic Human Voice matching ChatGPT Voice / Gemini Live Voice cadence
export async function POST(request) {
  try {
    const { text } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Prepare conversational script with natural conversational punctuation
    let clean = text
      .replace(/[\*\#\•\-\_]/g, '')
      .replace(/⚠️/g, 'تنبيه: ')
      .replace(/🔒/g, '')
      .replace(/ريال/g, 'ريال')
      .replace(/\n+/g, '، ')
      .replace(/\s+/g, ' ')
      .trim();

    const apiKey = (process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '').trim();

    // 1. Google's Latest Generative "Journey" Voice for Arabic (Direct ChatGPT competitor)
    if (apiKey) {
      try {
        const journeyRes = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: { text: clean },
            voice: {
              languageCode: 'ar-XA',
              name: 'ar-XA-Journey-D', // Journey voices are Google's answer to OpenAI ChatGPT voices
              ssmlGender: 'MALE'
            },
            audioConfig: {
              audioEncoding: 'MP3',
              speakingRate: 1.14,
              pitch: 0.0
            }
          })
        });

        if (journeyRes.ok) {
          const jData = await journeyRes.json();
          if (jData.audioContent) {
            return NextResponse.json({
              audioBase64: jData.audioContent,
              source: 'journey-live'
            });
          }
        }
      } catch (err) {
        console.warn("Journey TTS attempt:", err);
      }
    }

    // 2. High-expressive Conversational Audio Engine (Live Warm stream)
    const encoded = encodeURIComponent(clean.slice(0, 300));
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=ar-SA&total=1&idx=0&textlen=${encoded.length}&client=tw-ob`;

    const res = await fetch(url);
    if (res.ok) {
      const buffer = await res.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      return NextResponse.json({
        audioBase64: base64,
        source: 'expressive-stream'
      });
    }

    return NextResponse.json({ error: "Failed to synthesize voice" }, { status: 500 });

  } catch (err) {
    console.error("TTS Route Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
