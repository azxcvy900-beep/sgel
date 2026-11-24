import { NextResponse } from 'next/server';

const SYSTEM_INSTRUCTIONS = `
أنت المساعد الصوتي والذكي الحصري لنظام "مركز إدارة وتسعير المنتجات".
مهمتك الصارمة:
1. الاستعلام الذكي عن الأسعار والمنتجات والشركات.
2. إضافة أو تعديل المنتجات، الأسعار، أو الشركات فقط عند توفر رمز التأكيد الإداري (1234).

قواعد ذكاء الاستعلام الصارمة:
- إذا ذكر المستخدم منتجاً دون تحديد الشركة: اعرض أسعار هذا المنتج لدى جميع الشركات المسجلة التي لديها تسعيرة معتمدة له.
- إذا ذكر المستخدم شركة دون تحديد المنتج: اعرض أسعار المنتجات المعتمدة لهذه الشركة.
- الفهم الذكي للأسماء المختصرة (مثل: "225/70/17جدة" أو "حلول الطاقة" لشركة "حلول خط الطاقة").
- في حال وجود تشابه أو التباس بين شركتين أو منتجين: توقف ونبه المستخدم فوراً واطلب منه التحديد.

الصيغة:
JSON:
{
  "replyText": "...",
  "action": null | { ... }
}
`;

// Helper: Normalize Arabic string for super-smart fuzzy matching
function normalizeText(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/[ة]/g, 'ه')
    .replace(/[ى]/g, 'ي')
    .replace(/[\u064B-\u065F]/g, '') // remove tashkeel
    .replace(/شركة\s+/g, '') // strip optional 'شركة'
    .replace(/[_\-\/\s]+/g, ' ')
    .trim();
}

// Find matching companies with ambiguity check
function matchCompanies(query, companies) {
  const normQ = normalizeText(query);
  const words = normQ.split(' ').filter(w => w.length > 1);

  const matched = companies.filter(c => {
    const normC = normalizeText(c);
    // Exact or direct inclusion
    if (normC.includes(normQ) || normQ.includes(normC)) return true;
    // Check if key words of company are all in query or vice versa
    const cWords = normC.split(' ').filter(w => w.length > 1);
    const matchesCount = cWords.filter(cw => normQ.includes(cw)).length;
    return matchesCount >= Math.min(cWords.length, 2);
  });

  return matched;
}

// Find matching products
function matchProduct(query, products) {
  const normQ = normalizeText(query);
  const qClean = query.toLowerCase().replace(/[\s\/\-_]/g, '');

  let found = products.find(p => {
    const normP = normalizeText(p.name);
    const codeClean = (p.code || '').toLowerCase().replace(/[\s\/\-_]/g, '');
    const nameClean = (p.name || '').toLowerCase().replace(/[\s\/\-_]/g, '');

    return normQ.includes(normP) ||
           normP.includes(normQ) ||
           qClean.includes(nameClean) ||
           (codeClean && qClean.includes(codeClean));
  });

  // If not found directly, check by tokens (e.g. 225/70/17)
  if (!found) {
    const tokens = query.split(/[\s,،]+/).filter(t => t.length >= 2);
    found = products.find(p => {
      const pFull = `${p.name} ${p.code || ''}`.toLowerCase();
      return tokens.some(t => pFull.includes(t.toLowerCase()));
    });
  }

  return found;
}

function processSmartQuery(message, context, pinProvided) {
  const products = context?.products || [];
  const companies = context?.companies || [];
  const adminPin = context?.adminPin || '1234';
  const q = (message || '').trim();

  // 1. Check for Chit-chat (Strictly business)
  const nonBusiness = ['نكتة', 'قصة', 'طبخ', 'سياسة', 'دين', 'اخبار', 'شخبارك', 'كيفك'];
  if (nonBusiness.some(w => normalizeText(q).includes(normalizeText(w)))) {
    return {
      replyText: "عذراً، أنا مخصص فقط لإدارة وتسعير منتجات وشركات المركز.",
      action: null
    };
  }

  // 2. Add Company Intent
  if (q.includes('أضف شركة') || q.includes('اضف شركه') || q.includes('إضافة شركة') || q.includes('شركه جديده')) {
    const cName = q.replace(/أضف شركة|اضف شركه|إضافة شركة|شركه جديده/g, '').replace(/اسمها|اسم/g, '').trim();
    if (!cName) return { replyText: "يرجى تحديد اسم الشركة التي ترغب بإضافتها.", action: null };

    if (pinProvided !== adminPin) {
      return {
        replyText: `لإضافة شركة "${cName}"، يرجى تأكيد العملية برمز الإدارة (1234).`,
        action: { type: 'ADD_COMPANY', company: cName, requiresPin: true }
      };
    }
    return {
      replyText: `تمت إضافة شركة "${cName}" بنجاح إلى النظام.`,
      action: { type: 'ADD_COMPANY', company: cName, requiresPin: false }
    };
  }

  // 3. Add / Update Product Price Intent (Requires PIN)
  if (q.includes('سعر') && (q.includes('سجل') || q.includes('عدل') || q.includes('غير') || q.includes('حط') || q.includes('اضف'))) {
    const numMatch = q.match(/\d+(\.\d+)?/);
    const price = numMatch ? Number(numMatch[0]) : null;
    const targetProduct = matchProduct(q, products);
    const matchedCompanies = matchCompanies(q, companies);

    if (matchedCompanies.length > 1) {
      return {
        replyText: `⚠️ يوجد تشابه بين الشركات التالية: (${matchedCompanies.join('، ')}). يرجى توضيح اسم الشركة بدقة لتحديد السعر.`,
        action: null
      };
    }

    const targetCompany = matchedCompanies[0];

    if (targetProduct && targetCompany && price) {
      if (pinProvided !== adminPin) {
        return {
          replyText: `لتسجيل سعر ${targetProduct.name} لـ "${targetCompany}" بـ ${price} ريال، يرجى تأكيد رمز الإدارة (1234).`,
          action: { type: 'UPDATE_PRICE', productName: targetProduct.name, company: targetCompany, price, requiresPin: true }
        };
      }
      return {
        replyText: `تم تحديث سعر ${targetProduct.name} لـ "${targetCompany}" إلى ${price} ريال وحفظه في النظام.`,
        action: { type: 'UPDATE_PRICE', productName: targetProduct.name, company: targetCompany, price, requiresPin: false }
      };
    }
  }

  // 4. SMART QUERY LOGIC
  const matchedCompanies = matchCompanies(q, companies);
  const targetProduct = matchProduct(q, products);

  // Case A: Ambiguity in company name!
  if (matchedCompanies.length > 1) {
    return {
      replyText: `⚠️ تنبيه: الاسم الذي ذكرته ينطبق على أكثر من شركة: (${matchedCompanies.join(' - ')}). يرجى التحديد لتجنب الخطأ في التسعير.`,
      action: null
    };
  }

  const singleCompany = matchedCompanies[0];

  // Case B: Both Product AND Company are specified (even if concatenated like "225/70/17جدة")
  if (targetProduct && singleCompany) {
    const price = targetProduct.prices?.[singleCompany];
    if (price !== null && price !== undefined && price !== '' && price !== 0) {
      return {
        replyText: `سعر ${targetProduct.name} لدى "${singleCompany}" هو ${price} ريال.`,
        action: { type: 'SEARCH_PRICE', productName: targetProduct.name, company: singleCompany, price }
      };
    } else {
      return {
        replyText: `⚠️ السعر غير محدد لـ ${targetProduct.name} لدى "${singleCompany}"، يرجى مراجعة الإدارة.`,
        action: null
      };
    }
  }

  // Case C: ONLY Product is mentioned -> Return prices for ALL companies
  if (targetProduct && !singleCompany) {
    const priceList = [];
    companies.forEach(c => {
      const p = targetProduct.prices?.[c];
      if (p !== null && p !== undefined && p !== '' && p !== 0) {
        priceList.push(`• ${c}: ${p} ريال`);
      } else {
        priceList.push(`• ${c}: (غير محدد)`);
      }
    });

    return {
      replyText: `أسعار ${targetProduct.name} لجميع الشركات:\n${priceList.join('\n')}`,
      action: null
    };
  }

  // Case D: ONLY Company is mentioned -> Return all priced products for this company
  if (singleCompany && !targetProduct) {
    const companyProducts = [];
    products.forEach(p => {
      const pr = p.prices?.[singleCompany];
      if (pr !== null && pr !== undefined && pr !== '' && pr !== 0) {
        companyProducts.push(`• ${p.name}: ${pr} ريال`);
      }
    });

    if (companyProducts.length === 0) {
      return {
        replyText: `لم يتم تسجيل أي أسعار معتمدة بعد لشركة "${singleCompany}".`,
        action: null
      };
    }

    return {
      replyText: `قائمة المنتجات المسجلة لـ "${singleCompany}":\n${companyProducts.slice(0, 8).join('\n')}${companyProducts.length > 8 ? `\n(و ${companyProducts.length - 8} منتجات أخرى)` : ''}`,
      action: null
    };
  }

  return {
    replyText: "تفضل بسؤالك: يمكنك طلب سعر منتج معين، أو اسم منتج لترى أسعاره لكل الشركات، أو اسم شركة لترى جميع منتجاتها.",
    action: null
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { message, context, pinProvided, apiKey: clientApiKey } = body;

    const apiKey = (clientApiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '').trim();

    // If quota exceeded or direct smart logic, process through our advanced rule engine
    return NextResponse.json(processSmartQuery(message, context, pinProvided));

  } catch (error) {
    console.error("AI route general error:", error);
    return NextResponse.json({
      replyText: `خطأ في المعالجة: ${error.message}`,
      error: error.message
    }, { status: 500 });
  }
}
