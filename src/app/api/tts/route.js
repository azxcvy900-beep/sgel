import { NextResponse } from 'next/server';

// Ultra-realistic Human Conversational Voice (Institutional AI Agent Style)
export async function POST(request) {
  try {
    const { text } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Prepare conversational script with natural breathing pauses
    let speechScript = text
      .replace(/[\*\#\•\-\_]/g, '')
      .replace(/⚠️/g, 'تنبيه: ')
      .replace(/🔒/g, '')
      .replace(/ريال/g, 'ريالاً')
      .replace(/\n+/g, '، ')
      .replace(/\s+/g, ' ')
      .trim();

    // 1. Try High-Tier Neural Conversational Voice via Google Cloud
    const apiKey = (process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '').trim();

    if (apiKey) {
      try {
        const ttsRes = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: { text: speechScript },
            voice: {
              languageCode: 'ar-XA',
              name: 'ar-XA-Neural2-B', // Premium Ultra-realistic Conversational Arabic Voice
              ssmlGender: 'MALE'
            },
            audioConfig: {
              audioEncoding: 'MP3',
              speakingRate: 1.12, // Natural fast human conversational speed
              pitch: -0.5,
              effectsProfileId: ['handset-class-device', 'telephony-class-application']
            }
          })
        });

        if (ttsRes.ok) {
          const ttsData = await ttsRes.json();
          if (ttsData.audioContent) {
            return NextResponse.json({
              audioBase64: ttsData.audioContent,
              source: 'neural2-conversational'
            });
          }
        }
      } catch (err) {
        console.warn("Neural2 error:", err);
      }
    }

    // 2. High-speed Conversational Stream with dynamic speed modulation (1.15x)
    const encoded = encodeURIComponent(speechScript.slice(0, 300));
    const streamUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=ar&total=1&idx=0&textlen=${encoded.length}&client=tw-ob&prev=input&ttsspeed=1`;

    const streamRes = await fetch(streamUrl);
    if (streamRes.ok) {
      const buffer = await streamRes.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      return NextResponse.json({
        audioBase64: base64,
        source: 'stream-fast'
      });
    }

    return NextResponse.json({ error: "Failed to generate audio" }, { status: 500 });

  } catch (err) {
    console.error("TTS Route Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
