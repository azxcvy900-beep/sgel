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

    // قائمة نماذج Google الحديثة بالترتيب مع تجنب أخطاء الضغط 503
    const models = [
      'gemini-3.8-flash',
      'gemini-2.5-flash',
      'gemini-2.5-pro',
      'gemini-2.0-flash'
    ];

    let lastError = null;

    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            generationConfig: {
              temperature: 0.1
            }
          })
        });

        if (res.ok) {
          const data = await res.json();
          let rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

          try {
            return NextResponse.json(JSON.parse(rawText));
          } catch {
            return NextResponse.json({ replyText: rawText, action: null });
          }
        }

        // إذا كان هناك ضغط 503 أو غير متوفر 404، جرب النموذج التالي فوراً
        const errDetail = await res.text();
        lastError = `[${model}] HTTP ${res.status}: ${errDetail}`;
        console.warn(`Model ${model} returned ${res.status}, trying next fallback model...`);

      } catch (err) {
        lastError = err.message;
      }
    }

    return NextResponse.json({
      replyText: `سيرفرات الذكاء الاصطناعي تحت ضغط شديد حالياً، يرجى المحاولة بعد قليل.`,
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
