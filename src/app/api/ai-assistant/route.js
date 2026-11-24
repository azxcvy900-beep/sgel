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

صيغة الإجابة (JSON Mandatory when performing actions):
يجب أن ترجع الإجابة دائماً بنص واضح ومباشر، وإذا كان هناك إجراء مطلوب تنفيذه، قم بتضمين كائن JSON مخصص للأمر:
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

    const apiKey = clientApiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        replyText: "لم يتم ضبط مفتاح Gemini API في المتغيرات البيئية أو الإعدادات.",
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
{"replyText": "...", "action": ...}
`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      // Fallback to gemini-1.5-flash if 2.5 is not accessible
      const fallbackRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json"
          }
        })
      });

      if (!fallbackRes.ok) {
        const errText = await fallbackRes.text();
        return NextResponse.json({
          replyText: "حدث خطأ في الاتصال بـ Gemini API، يرجى التأكد من صلاحية المفتاح.",
          error: errText
        }, { status: 500 });
      }

      const fbData = await fallbackRes.json();
      const rawText = fbData?.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = JSON.parse(rawText || '{}');
      return NextResponse.json(parsed);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(rawText || '{}');
    return NextResponse.json(parsed);

  } catch (error) {
    console.error("AI route error:", error);
    return NextResponse.json({
      replyText: "تعذر معالجة الطلب حالياً، الرجاء المحاولة مجدداً.",
      error: error.message
    }, { status: 500 });
  }
}
