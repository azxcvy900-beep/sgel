import { NextResponse } from 'next/server';

// Microsoft Edge Neural Speech API - 100% Free, No Cost, True Human Voice
export async function POST(request) {
  try {
    const { text } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const cleanText = text
      .replace(/[\*\#\•\-\_]/g, ' ')
      .replace(/⚠️/g, 'تنبيه: ')
      .replace(/🔒/g, '')
      .replace(/ريال/g, 'ريال')
      .replace(/\n+/g, '، ')
      .replace(/\s+/g, ' ')
      .trim();

    // Microsoft Edge TTS Trusted Endpoints
    // Voice: ar-SA-HamedNeural (Saudi Male - Natural, human, confident & fast)
    const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='ar-SA'>
      <voice name='ar-SA-HamedNeural'>
        <prosody rate='+15%' pitch='+0Hz'>
          ${cleanText}
        </prosody>
      </voice>
    </speak>`;

    const edgeUrl = "https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4";

    const edgeRes = await fetch(edgeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/ssml+xml",
        "X-RequestId": Math.random().toString(36).substring(2),
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0"
      },
      body: ssml
    });

    if (edgeRes.ok) {
      const audioBuffer = await edgeRes.arrayBuffer();
      const base64 = Buffer.from(audioBuffer).toString('base64');
      return NextResponse.json({
        audioBase64: base64,
        voice: 'ar-SA-HamedNeural'
      });
    }

    // Secondary Free Neural Engine: ResponsiveVoice Arabic Human
    const altUrl = `https://code.responsivevoice.org/getvoice.php?t=${encodeURIComponent(cleanText)}&tl=ar&sv=g1&vn=&pitch=0.5&rate=0.55&vol=1`;
    const altRes = await fetch(altUrl);
    if (altRes.ok) {
      const buffer = await altRes.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      return NextResponse.json({
        audioBase64: base64,
        voice: 'natural-human'
      });
    }

    return NextResponse.json({ error: "Failed to synthesize human speech" }, { status: 500 });

  } catch (err) {
    console.error("TTS Route Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
