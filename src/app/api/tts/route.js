import { NextResponse } from 'next/server';

// Ultra-realistic Human Arabic Voice powered by Munsit API & ElevenLabs
export async function POST(request) {
  try {
    const { text } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const cleanText = text
      .replace(/[\*\#\•\-\_]/g, '')
      .replace(/⚠️/g, 'تنبيه: ')
      .replace(/🔒/g, '')
      .replace(/ريال/g, 'ريال')
      .replace(/\n+/g, '، ')
      .replace(/\s+/g, ' ')
      .trim();

    // 1. MUNSIT API (منصة مُنصت لأرقى الأصوات العربية البشرية)
    const munsitKey = (process.env.MUNSIT_API_KEY || '').trim();
    if (munsitKey) {
      try {
        const munsitRes = await fetch('https://api.munsit.com/v1/tts', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${munsitKey}`,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg'
          },
          body: JSON.stringify({
            text: cleanText,
            voice_id: 'sa_male_1', // الصوت السعودي الطبيعي
            speed: 1.15
          })
        });

        if (munsitRes.ok) {
          const buffer = await munsitRes.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');
          return NextResponse.json({
            audioBase64: base64,
            engine: 'munsit'
          });
        }
      } catch (err) {
        console.warn("Munsit error, trying direct fallback:", err);
      }
    }

    // 2. ElevenLabs fallback if configured
    const elevenLabsKey = (process.env.ELEVENLABS_API_KEY || '').trim();
    if (elevenLabsKey) {
      try {
        const elRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb`, {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': elevenLabsKey
          },
          body: JSON.stringify({
            text: cleanText,
            model_id: "eleven_multilingual_v2"
          })
        });

        if (elRes.ok) {
          const buffer = await elRes.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');
          return NextResponse.json({
            audioBase64: base64,
            engine: 'elevenlabs'
          });
        }
      } catch (e) {}
    }

    // Secondary fallback
    return NextResponse.json({
      error: "يرجى التأكد من إضافة مفتاح MUNSIT_API_KEY في Vercel"
    }, { status: 400 });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
