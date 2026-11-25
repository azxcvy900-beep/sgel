import { NextResponse } from 'next/server';

// Generates high quality natural human-like speech via responsive TTS services
export async function POST(request) {
  try {
    const { text } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Clean text from bullets and markdown for clear natural voice
    const cleanText = text
      .replace(/[\*\#\•\-\_]/g, ' ')
      .replace(/⚠️/g, 'تنبيه: ')
      .replace(/🔒/g, '')
      .replace(/\n+/g, '. ')
      .replace(/\s+/g, ' ')
      .trim();

    // Use direct natural TTS audio stream
    const encoded = encodeURIComponent(cleanText);
    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=ar&client=tw-ob`;

    return NextResponse.json({
      audioUrl,
      cleanText
    });

  } catch (err) {
    console.error("TTS Route Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
