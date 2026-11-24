import { NextResponse } from 'next/server';

const SYSTEM_INSTRUCTIONS = `
أنت المساعد الصوتي والذكي الحصري لنظام "مركز إدارة وتسعير المنتجات".
مهمتك الوحيدة والصارمة:
1. مساعدة المستخدم في الاستعلام عن أسعار المنتجات للشركات المختلفة.
2. إضافة أو تعديل المنتجات، الأسعار، أو الشركات فقط عند توفر رمز التأكيد الإداري (1234).

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

// Helper: Smart Local Search & Rule-based fallback when Google quota is exceeded
function generateSmartFallback(message, context, pinProvided) {
  const q = (message || '').toLowerCase().trim();
  const products = context?.products || [];
  const companies = context?.companies || [];
  const adminPin = context?.adminPin || '1234';

  // 1. General chit-chat filter (strictly business)
  const nonBusiness = ['نكتة', 'قصة', 'طبخ', 'سياسة', 'دين', 'أخبار', 'كيف الحال', 'شخبارك'];
  if (nonBusiness.some(w => q.includes(w))) {
    return {
      replyText: "عذراً، أنا مخصص فقط لإدارة وتسعير منتجات وشركات المركز.",
      action: null
    };
  }

  // 2. Add Company Intent
  if (q.includes('أضف شركة') || q.includes('اضف شركه') || q.includes('إضافة شركة') || q.includes('شركه جديده')) {
    const parts = message.replace(/أضف شركة|اضف شركه|إضافة شركة|شركه جديده/g, '').replace(/اسمها|اسم/g, '').trim();
    if (!parts) {
      return { replyText: "يرجى تحديد اسم الشركة التي ترغب بإضافتها.", action: null };
    }
    if (pinProvided !== adminPin) {
      return {
        replyText: `لإضافة "${parts}" لقائمة الشركات، يرجى تأكيد العملية برمز الإدارة.`,
        action: { type: 'ADD_COMPANY', company: parts, requiresPin: true }
      };
    }
    return {
      replyText: `تمت إضافة شركة ${parts} بنجاح.`,
      action: { type: 'ADD_COMPANY', company: parts, requiresPin: false }
    };
  }

  // 3. Update Price Intent (e.g. "سجل سعر فحمات لشركة الخليج ب 120")
  if (q.includes('سعر') && (q.includes('سجل') || q.includes('عدل') || q.includes('غير') || q.includes('حط') || q.includes('اضف'))) {
    // Extract price number
    const numMatch = q.match(/\d+/);
    const price = numMatch ? Number(numMatch[0]) : null;

    // Detect target company
    const foundCompany = companies.find(c => q.includes(c.toLowerCase()));
    // Detect target product
    const foundProduct = products.find(p => q.includes(p.name.toLowerCase()) || (p.code && q.includes(p.code.toLowerCase())));

    if (foundCompany && foundProduct && price) {
      if (pinProvided !== adminPin) {
        return {
          replyText: `لتعديل سعر ${foundProduct.name} لـ ${foundCompany} إلى ${price} ريال، يرجى تأكيد رمز الإدارة.`,
          action: { type: 'UPDATE_PRICE', productName: foundProduct.name, company: foundCompany, price, requiresPin: true }
        };
      }
      return {
        replyText: `تم تحديث سعر ${foundProduct.name} لـ ${foundCompany} إلى ${price} ريال.`,
        action: { type: 'UPDATE_PRICE', productName: foundProduct.name, company: foundCompany, price, requiresPin: false }
      };
    }
  }

  // 4. Inquire / Search Price Intent (e.g. "كم سعر زيت تويوتا لشركة النجوم؟")
  const targetCompany = companies.find(c => q.includes(c.toLowerCase()));
  const targetProduct = products.find(p => q.includes(p.name.toLowerCase()) || (p.code && q.includes(p.code.toLowerCase())));

  if (targetProduct && targetCompany) {
    const price = targetProduct.prices?.[targetCompany];
    if (price !== null && price !== undefined && price !== '' && price !== 0) {
      return {
        replyText: `سعر ${targetProduct.name} لـ ${targetCompany} هو ${price} ريال.`,
        action: { type: 'SEARCH_PRICE', productName: targetProduct.name, company: targetCompany, price }
      };
    } else {
      return {
        replyText: `السعر غير محدد لمنتج ${targetProduct.name} لدى ${targetCompany}، يرجى مراجعة الإدارة.`,
        action: null
      };
    }
  } else if (targetProduct) {
    return {
      replyText: `وجدنا منتج ${targetProduct.name}. يرجى تحديد الشركة لمعرفة السعر المعتمد.`,
      action: null
    };
  }

  return {
    replyText: "تفضل بذكر اسم المنتج والشركة للاستعلام عن السعر، أو اطلب إضافة أو تعديل منتج أو شركة.",
    action: null
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { message, context, pinProvided, apiKey: clientApiKey } = body;

    const apiKey = (clientApiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '').trim();

    // If no key provided or key exhausted, use smart deterministic fallback immediately
    if (!apiKey) {
      return NextResponse.json(generateSmartFallback(message, context, pinProvided));
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

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: { temperature: 0.1 }
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

      // If Quota Exceeded (429) or Server busy (503) -> Smooth Fallback seamlessly!
      if (res.status === 429 || res.status === 503) {
        console.warn(`Gemini returned ${res.status}, providing smart deterministic fallback.`);
        return NextResponse.json(generateSmartFallback(message, context, pinProvided));
      }

      const errText = await res.text();
      return NextResponse.json(generateSmartFallback(message, context, pinProvided));

    } catch (apiErr) {
      console.warn("API fetch error, fallback:", apiErr);
      return NextResponse.json(generateSmartFallback(message, context, pinProvided));
    }

  } catch (error) {
    console.error("AI route general error:", error);
    return NextResponse.json({
      replyText: `خطأ في الخادم: ${error.message}`,
      error: error.message
    }, { status: 500 });
  }
}
