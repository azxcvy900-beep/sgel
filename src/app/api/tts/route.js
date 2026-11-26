import { NextResponse } from 'next/server';

// Generates true human-grade studio voice (matching ChatGPT conversational audio)
export async function POST(request) {
  try {
    const { text } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Prepare conversational script - remove formatting, smooth transitions
    const cleanText = text
      .replace(/[\*\#\•\-\_]/g, ' ')
      .replace(/⚠️/g, 'تنبيه ')
      .replace(/🔒/g, '')
      .replace(/ريال/g, 'ريال')
      .replace(/\n+/g, '، ')
      .replace(/\s+/g, ' ')
      .trim();

    // Check for OpenAI API key if available for direct ChatGPT Voice (alloy/echo/shimmer)
    const openAiKey = (process.env.OPENAI_API_KEY || '').trim();
    if (openAiKey) {
      try {
        const oaiRes = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'tts-1',
            voice: 'onyx', // Deep, warm, ultra-realistic human voice
            input: cleanText,
            speed: 1.15
          })
        });

        if (oaiRes.ok) {
          const buffer = await oaiRes.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');
          return NextResponse.json({
            audioBase64: base64,
            source: 'openai-studio'
          });
        }
      } catch (err) {
        console.warn("OpenAI TTS error:", err);
      }
    }

    // Google Cloud Studio/Journey/Neural Voice endpoint
    const apiKey = (process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '').trim();
    if (apiKey) {
      const gVoices = ['ar-XA-Journey-D', 'ar-XA-Neural2-B', 'ar-XA-Wavenet-B'];
      for (const vName of gVoices) {
        try {
          const gRes = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              input: { text: cleanText },
              voice: {
                languageCode: 'ar-XA',
                name: vName,
                ssmlGender: 'MALE'
              },
              audioConfig: {
                audioEncoding: 'MP3',
                speakingRate: 1.18, // Natural fast cadence
                pitch: 0.0
              }
            })
          });

          if (gRes.ok) {
            const gData = await gRes.json();
            if (gData.audioContent) {
              return NextResponse.json({
                audioBase64: gData.audioContent,
                source: vName
              });
            }
          }
        } catch (e) {
          console.warn("Voice attempt failed:", vName, e);
        }
      }
    }

    // Fallback: Enhanced High-Pace Arabic voice stream
    const encoded = encodeURIComponent(cleanText.slice(0, 300));
    const streamUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=ar-SA&client=tw-ob`;
    const sRes = await fetch(streamUrl);
    if (sRes.ok) {
      const buffer = await sRes.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      return NextResponse.json({
        audioBase64: base64,
        source: 'neural-stream'
      });
    }

    return NextResponse.json({ error: "Failed to generate voice" }, { status: 500 });

  } catch (err) {
    console.error("TTS Route Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
