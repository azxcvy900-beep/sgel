import { NextResponse } from 'next/server';

// Ultra-realistic Human Arabic Voice powered by Munsit API
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

    const munsitKey = (process.env.MUNSIT_API_KEY || '').trim();

    if (!munsitKey) {
      return NextResponse.json({
        error: "لم يتم العثور على MUNSIT_API_KEY في Vercel. يرجى التأكد من حفظه وعمل Redeploy."
      }, { status: 400 });
    }

    // Munsit endpoints to try:
    const endpoints = [
      'https://api.munsit.com/v1/text-to-speech',
      'https://api.munsit.com/api/v1/tts',
      'https://api.munsit.com/v1/tts'
    ];

    let lastError = null;

    for (const ep of endpoints) {
      try {
        const res = await fetch(ep, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${munsitKey}`,
            'x-api-key': munsitKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: cleanText,
            speed: 1.1
          })
        });

        if (res.ok) {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('audio') || contentType.includes('mpeg')) {
            const buffer = await res.arrayBuffer();
            const base64 = Buffer.from(buffer).toString('base64');
            return NextResponse.json({ audioBase64: base64 });
          } else {
            const data = await res.json();
            if (data.audio || data.audio_base64 || data.audioBase64) {
              return NextResponse.json({ audioBase64: data.audio || data.audio_base64 || data.audioBase64 });
            } else if (data.url || data.audio_url) {
              const audioFetch = await fetch(data.url || data.audio_url);
              const buffer = await audioFetch.arrayBuffer();
              return NextResponse.json({ audioBase64: Buffer.from(buffer).toString('base64') });
            }
          }
        } else {
          lastError = `[${res.status}]: ${await res.text()}`;
        }
      } catch (err) {
        lastError = err.message;
      }
    }

    return NextResponse.json({
      error: `تنبيه من سيرفر منصت: ${lastError}`
    }, { status: 500 });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
