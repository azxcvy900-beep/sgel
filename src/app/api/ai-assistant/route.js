import { NextResponse } from 'next/server';

const SYSTEM_INSTRUCTIONS = `
أنت المساعد الصوتي والذكي الحصري لنظام "مركز إدارة وتسعير المنتجات".
مهمتك الوحيدة والصارمة:
1. مساعدة المستخدم في الاستعلام عن أسعار المنتجات للشركات المختلفة.
2. إضافة أو تعديل المنتجات، الأسعار، أو الشركات فقط عند توفر رمز التأكيد الإداري.

قواعد صارمة جداً (STRICT RULES):
- أنت أداة عمل تجارية فقط! لا تجب أبداً عن أي أسئلة خارج نطاق العمل (مثل: مواضيع حياتية، دينية، سياسية، ترفيهية، شخصية، أو سوالف عامة). إذا سُئلت عن أي شيء خارج النظام، رد باقتضاب وحزم: "عذراً، أنا مخصص فقط لإدارة وتسعير منتجات وشركات المركز."
- تحدث باللغة العربية بأسلوب مهني وموجز جداً ومباشر (لأن الرد سيُقرأ صوتياً).
- عند الاستفسار عن سعر: أعطِ السعر المعتمد للشركة المطلوبة بدقة، وإذا لم يكن مسجلاً قل: "السعر غير محدد لهذه الشركة، يرجى مراجعة الإدارة".
- عند طلب (إضافة منتج، تعديل سعر، إضافة شركة): هذه عمليات حساسة. إذا لم يقم المستخدم بتضمين رمز التأكيد الصحيح، اطلب منه الرمز ولا تقم بتنفيذ الأمر.

صيغة الإجابة (JSON Mandatory):
يجب أن ترجع الإجابة دائماً بنص واضح ومباشر بصيغة JSON:
{
  "replyText": "النص الذي سيقال للمستخدم بالصوت",
  "action": null | {
     "type": "UPDATE_PRICE" | "ADD_PRODUCT" | "ADD_COMPANY" | "SEARCH_PRICE",
     "company": "اسم الشركة",
     "productName": "اسم المنتج",
     "productCode": "رمز القطعة إن وجد",
     "price": 120,
     "requiresPin": true | false
  }
}
`;

// Helper delay function
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request) {
  try {
    const body = await request.json();
    const { message, context, pinProvided, apiKey: clientApiKey } = body;

    const apiKey = (clientApiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '').trim();

    if (!apiKey) {
      return NextResponse.json({
        replyText: "لم يتم العثور على مفتاح GEMINI_API_KEY في Vercel. يرجى التأكد من حفظه وعمل Redeploy.",
        isConfigError: true
      });
    }

    const currentContextText = `
البيانات الحالية في النظام:
الشركات المسجلة: ${JSON.stringify(context?.companies || [])}
عينة من المنتجات والأسعار: ${JSON.stringify((context?.products || []).slice(0, 50).map(p => ({
  name: p.name,
  code: p.code,
  prices: p.prices
})))}
رمز الإدارة المعتمد في النظام: "${context?.adminPin || '1234'}"
الرمز الذي قدمه المستخدم في المحادثة الحالية (إن وجد): "${pinProvided || ''}"
`;

    const userPrompt = `
${SYSTEM_INSTRUCTIONS}

${currentContextText}

رسالة المستخدم: "${message}"

رد بصيغة JSON فقط:
{"replyText": "...", "action": null}
`;

    const candidateEndpoints = [
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent`,
      `https://generativelanguage.googleapis.com/v1/models/gemini-3.8-flash:generateContent`,
      `https://generativelanguage.googleapis.com/v1beta/interactions`
    ];

    let lastError = null;

    // Retry loop with multiple endpoints to overcome temporary Google 503 spikes
    for (let attempt = 0; attempt < 3; attempt++) {
      for (const ep of candidateEndpoints) {
        try {
          let res;
          if (ep.includes('/interactions')) {
            res = await fetch(`${ep}?key=${apiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                model: 'gemini-3.8-flash',
                input: userPrompt
              })
            });
          } else {
            res = await fetch(`${ep}?key=${apiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
                generationConfig: { temperature: 0.1 }
              })
            });
          }

          if (res.ok) {
            const data = await res.json();
            let rawText = '';

            if (ep.includes('/interactions')) {
              rawText = data?.outputs?.[0]?.text || data?.text || JSON.stringify(data);
            } else {
              rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            }

            rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

            try {
              return NextResponse.json(JSON.parse(rawText));
            } catch {
              return NextResponse.json({ replyText: rawText, action: null });
            }
          }

          // If 503 (Server busy), wait a little and retry
          if (res.status === 503) {
            console.warn(`Gemini 503 on attempt ${attempt + 1}, retrying...`);
            await wait(600); // 600ms backoff
            continue;
          }

          const detail = await res.text();
          lastError = `[${res.status}]: ${detail}`;

        } catch (err) {
          lastError = err.message;
        }
      }
      await wait(800);
    }

    return NextResponse.json({
      replyText: `سيرفر Google تحت ضغط مؤقت، يرجى إعادة المحاولة بعد ثوانٍ بسيطة. (${lastError})`,
      error: lastError
    });

  } catch (error) {
    console.error("AI route general error:", error);
    return NextResponse.json({
      replyText: `خطأ في الخادم: ${error.message}`,
      error: error.message
    }, { status: 500 });
  }
}
