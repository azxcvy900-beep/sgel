import { NextResponse } from 'next/server';

// Ultra-realistic Human Studio Voice via ElevenLabs & OpenAI
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
      .replace(/ريال/g, 'ريالاً')
      .replace(/\n+/g, '، ')
      .replace(/\s+/g, ' ')
      .trim();

    // 1. ELEVENLABS (The World's #1 Ultra-Realistic Voice)
    const elevenLabsKey = (process.env.ELEVENLABS_API_KEY || '').trim();
    if (elevenLabsKey) {
      try {
        // High quality Arabic human voice: George / Adam / Sarah
        // Default Voice ID: "JBFqnCBsd6RMkjVDRZzb" (George - warm, natural, human)
        const voiceId = "JBFqnCBsd6RMkjVDRZzb";
        const elRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': elevenLabsKey
          },
          body: JSON.stringify({
            text: cleanText,
            model_id: "eleven_multilingual_v2", // Best Arabic human speech model
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.8,
              style: 0.3,
              use_speaker_boost: true
            }
          })
        });

        if (elRes.ok) {
          const buffer = await elRes.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');
          return NextResponse.json({
            audioBase64: base64,
            engine: 'elevenlabs'
          });
        } else {
          console.error("ElevenLabs error:", await elRes.text());
        }
      } catch (err) {
        console.error("ElevenLabs connection error:", err);
      }
    }

    // 2. OPENAI VOICE (ChatGPT Voice - onyx / alloy)
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
            voice: 'onyx', // Deep natural human male voice
            input: cleanText,
            speed: 1.15
          })
        });

        if (oaiRes.ok) {
          const buffer = await oaiRes.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');
          return NextResponse.json({
            audioBase64: base64,
            engine: 'openai'
          });
        }
      } catch (err) {
        console.error("OpenAI error:", err);
      }
    }

    // Notice to user if no API key is provided
    return NextResponse.json({
      error: "لم يتم العثور على ELEVENLABS_API_KEY أو OPENAI_API_KEY في Vercel"
    }, { status: 400 });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
