import { NextResponse } from 'next/server';

const SYSTEM_INSTRUCTIONS = `
أنت المساعد الصوتي والذكي الحصري لنظام "مركز إدارة وتسعير المنتجات".
مهمتك:
1. الاستعلام الذكي عن أسعار المنتجات والشركات.
2. إضافة أو تعديل المنتجات، الأسعار، أو الشركات فقط عند توفر رمز التأكيد الإداري (1234).

قواعد استخراج الأوامر بذكاء تام:
- إذا قال المستخدم: "اضف منتج [اسم المنتج] شركة [اسم الشركة] سعر [السعر]":
  قم باستخراج اسم المنتج، واسم الشركة، والسعر فوراً.
  واطلب منه رمز التأكيد 1234 لتنفيذ العملية.

- إذا ذكر المستخدم منتجاً فقط: اعرض أسعاره لجميع الشركات.
- إذا ذكر شركة فقط: اعرض أسعار منتجاتها.
`;

function normalize(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/[ة]/g, 'ه')
    .replace(/[ى]/g, 'ي')
    .replace(/[\u064B-\u065F]/g, '')
    .trim();
}

function processSmartQuery(message, context, pinProvided) {
  const products = context?.products || [];
  const companies = context?.companies || [];
  const adminPin = context?.adminPin || '1234';
  const rawMsg = (message || '').trim();
  const normMsg = normalize(rawMsg);

  // 1. FILTER GENERAL CHAT
  const nonBusiness = ['نكتة', 'قصة', 'طبخ', 'سياسة', 'دين', 'اخبار', 'شخبارك', 'كيفك'];
  if (nonBusiness.some(w => normMsg.includes(w))) {
    return {
      replyText: "عذراً، أنا مخصص فقط لإدارة وتسعير منتجات وشركات المركز.",
      action: null
    };
  }

  // 2. DETECT COMPOUND "ADD / UPDATE PRODUCT + COMPANY + PRICE"
  // Example: "اضف المنتج و الشركة برجستون 225/70/17 شركة صباح ستور 990 قبل الضريبة"
  const isAddOrUpdate = normMsg.includes('اضف') || normMsg.includes('سجل') || normMsg.includes('عدل') || normMsg.includes('غير') || normMsg.includes('حط');

  if (isAddOrUpdate) {
    // Extract Price Number
    const priceMatch = rawMsg.match(/\b\d+(\.\d+)?\b/);
    const price = priceMatch ? Number(priceMatch[0]) : null;

    // Extract Company (Check if message contains "شركة ..." or an existing company)
    let companyName = null;
    const compRegex = /(?:شركة|شركه)\s+([\u0621-\u064A\w\s]+?)(?=\s+\d|\s+سعر|\s+بـ|\s+بسعر|\s+قبل|$)/i;
    const compMatch = rawMsg.match(compRegex);

    if (compMatch && compMatch[1]) {
      companyName = compMatch[1].trim();
    } else {
      // Check existing companies
      const foundComp = companies.find(c => normMsg.includes(normalize(c)));
      if (foundComp) companyName = foundComp;
    }

    // Extract Product Name
    let prodName = rawMsg
      .replace(/اضف|أضف|سجل|عدل|غير|حط|المنتج|منتج|و\s*الشركة|و\s*الشركه/gi, '')
      .replace(new RegExp(`(?:شركة|شركه)\\s+${companyName || ''}`, 'gi'), '')
      .replace(new RegExp(`${companyName || ''}`, 'gi'), '')
      .replace(/\b\d+(\.\d+)?\b/g, '')
      .replace(/قبل الضريبة|شامل الضريبة|ريال|بسعر|بـ|سعر/gi, '')
      .trim();

    // Clean extra punctuation
    prodName = prodName.replace(/^[\s,،\-]+|[\s,،\-]+$/g, '');

    // Case A: Full Add / Update request
    if (prodName && (companyName || price)) {
      const finalComp = companyName || companies[0] || 'الشركة العامة';
      const finalPrice = price || 0;

      if (pinProvided !== adminPin) {
        return {
          replyText: `لتأكيد إضافة منتج "${prodName}" لشركة "${finalComp}" بسعر ${finalPrice} ريال، يرجى إدخال رمز الإدارة 1234.`,
          action: {
            type: 'ADD_PRODUCT',
            productName: prodName,
            company: finalComp,
            price: finalPrice,
            requiresPin: true
          }
        };
      } else {
        return {
          replyText: `تم بنجاح تسجيل "${prodName}" لشركة "${finalComp}" بسعر ${finalPrice} ريال وتحديث النظام.`,
          action: {
            type: 'ADD_PRODUCT',
            productName: prodName,
            company: finalComp,
            price: finalPrice,
            requiresPin: false
          }
        };
      }
    }

    // Case B: Only Add Company request (e.g. "أضف شركة صباح ستور")
    if (normMsg.includes('شرك') && !prodName) {
      const cMatch = rawMsg.replace(/اضف|أضف|سجل|شركه|شركة|جديده|جديدة/gi, '').trim();
      if (cMatch) {
        if (pinProvided !== adminPin) {
          return {
            replyText: `لإضافة شركة "${cMatch}"، يرجى تأكيد العملية برمز الإدارة 1234.`,
            action: { type: 'ADD_COMPANY', company: cMatch, requiresPin: true }
          };
        }
        return {
          replyText: `تمت إضافة شركة "${cMatch}" بنجاح إلى النظام.`,
          action: { type: 'ADD_COMPANY', company: cMatch, requiresPin: false }
        };
      }
    }
  }

  // 3. SEARCH / QUERY LOGIC
  // A. Check if query matches a known company
  const matchedCompany = companies.find(c => normMsg.includes(normalize(c)));

  // B. Check if query matches a product (Direct or tire size e.g. 225/70/17)
  const matchedProduct = products.find(p => {
    const pNorm = normalize(p.name);
    const pCode = (p.code || '').toLowerCase();
    const cleanTokens = normMsg.split(/[\s,،]+/);
    return normMsg.includes(pNorm) || (pCode && normMsg.includes(pCode)) || cleanTokens.some(t => t.length > 3 && pNorm.includes(t));
  });

  // Query: Both Product and Company
  if (matchedProduct && matchedCompany) {
    const price = matchedProduct.prices?.[matchedCompany];
    if (price !== null && price !== undefined && price !== '' && price !== 0) {
      return {
        replyText: `سعر ${matchedProduct.name} لدى "${matchedCompany}" هو ${price} ريال.`,
        action: { type: 'SEARCH_PRICE', productName: matchedProduct.name, company: matchedCompany, price }
      };
    } else {
      return {
        replyText: `السعر غير محدد لـ ${matchedProduct.name} لدى "${matchedCompany}"، يرجى مراجعة الإدارة.`,
        action: null
      };
    }
  }

  // Query: Only Product -> Return all companies prices
  if (matchedProduct && !matchedCompany) {
    const list = companies.map(c => {
      const p = matchedProduct.prices?.[c];
      return p ? `• ${c}: ${p} ريال` : `• ${c}: (غير محدد)`;
    });
    return {
      replyText: `أسعار ${matchedProduct.name} لجميع الشركات:\n${list.join('\n')}`,
      action: null
    };
  }

  // Query: Only Company -> Return all products for that company
  if (matchedCompany && !matchedProduct) {
    const list = products
      .filter(p => p.prices?.[matchedCompany])
      .map(p => `• ${p.name}: ${p.prices[matchedCompany]} ريال`);

    if (list.length === 0) {
      return {
        replyText: `لا توجد أسعار مسجلة لشركة "${matchedCompany}" حتى الآن.`,
        action: null
      };
    }
    return {
      replyText: `منتجات وأسعار "${matchedCompany}":\n${list.slice(0, 10).join('\n')}`,
      action: null
    };
  }

  // Default Guidance
  return {
    replyText: "تفضل بسؤالك: يمكنك طلب سعر مقاس معين (مثل: برجستون 225/70/17)، أو اطلب إضافة منتج مع الشركة والسعر وسأطلب منك الرمز 1234 لتأكيده فوراً.",
    action: null
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { message, context, pinProvided } = body;
    return NextResponse.json(processSmartQuery(message, context, pinProvided));
  } catch (error) {
    return NextResponse.json({
      replyText: `حدث خطأ: ${error.message}`,
      error: error.message
    }, { status: 500 });
  }
}
