import { NextResponse } from 'next/server';

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

function extractTirePattern(str) {
  if (!str) return null;
  const match = str.match(/(\b\d{3})[\s\.\-\/]?(\d{2})[\s\.\-\/]?(\d{2}\b)/);
  if (match) {
    return `${match[1]}/${match[2]}/${match[3]}`;
  }
  return null;
}

function processSmartQuery(message, context, pinProvided) {
  const products = context?.products || [];
  const companies = context?.companies || [];
  const adminPin = context?.adminPin || '1234';
  const rawMsg = (message || '').trim();
  const normMsg = normalize(rawMsg);

  // 1. INQUIRY: List all companies (e.g. "ما الشركات المسجلة لدي؟" / "اعطني قائمة الشركات")
  if (
    (normMsg.includes('شرك') && (normMsg.includes('مسجل') || normMsg.includes('ما هي') || normMsg.includes('ماهي') || normMsg.includes('قائم') || normMsg.includes('عندي') || normMsg.includes('لدي') || normMsg.includes('اعطني') || normMsg.includes('كل') || normMsg.includes('جميع')))
  ) {
    if (companies.length === 0) {
      return { replyText: "لا توجد أي شركات مسجلة في النظام حالياً.", action: null };
    }
    const cList = companies.map((c, i) => `${i + 1}. ${c}`).join('\n');
    return {
      replyText: `الشركات المسجلة لديك (${companies.length} شركات):\n${cList}`,
      action: null
    };
  }

  // 2. INQUIRY: List all products / Inventory overview (e.g. "ما هي المنتجات المسجلة؟")
  if (
    (normMsg.includes('منتج') && (normMsg.includes('مسجل') || normMsg.includes('ما هي') || normMsg.includes('ماهي') || normMsg.includes('قائم') || normMsg.includes('عندي') || normMsg.includes('لدي') || normMsg.includes('كم') || normMsg.includes('كل')))
  ) {
    if (products.length === 0) {
      return { replyText: "لا توجد أي منتجات مسجلة في النظام حالياً.", action: null };
    }
    const pSample = products.slice(0, 8).map(p => `• ${p.name} (${p.code || ''})`).join('\n');
    return {
      replyText: `لديك ${products.length} منتج مسجل في النظام. عينة منها:\n${pSample}${products.length > 8 ? `\n...و ${products.length - 8} منتجات أخرى.` : ''}`,
      action: null
    };
  }

  // 3. Filter strictly out-of-scope chit chat (Cooking, politics, jokes)
  const strictlyNonBusiness = ['نكتة', 'نكت', 'قصة', 'طبخ', 'اكل', 'سياسة', 'دين', 'كورة', 'شخبارك'];
  if (strictlyNonBusiness.some(w => normMsg.includes(w))) {
    return {
      replyText: "عذراً، أنا مخصص فقط لإدارة وتسعير منتجات وشركات المركز.",
      action: null
    };
  }

  // 4. Intelligent Compound Action: ADD / UPDATE PRODUCT & PRICE
  const isAddOrUpdate = normMsg.includes('اضف') || normMsg.includes('سجل') || normMsg.includes('عدل') || normMsg.includes('غير') || normMsg.includes('حط');

  if (isAddOrUpdate) {
    const priceMatch = rawMsg.match(/\b\d+(\.\d+)?\b/);
    const price = priceMatch ? Number(priceMatch[0]) : null;

    let companyName = null;
    const compRegex = /(?:شركة|شركه)\s+([\u0621-\u064A\w\s]+?)(?=\s+\d|\s+سعر|\s+بـ|\s+بسعر|\s+قبل|$)/i;
    const compMatch = rawMsg.match(compRegex);

    if (compMatch && compMatch[1]) {
      companyName = compMatch[1].trim();
    } else {
      const foundComp = companies.find(c => normMsg.includes(normalize(c)));
      if (foundComp) companyName = foundComp;
    }

    const tirePattern = extractTirePattern(rawMsg);
    let prodName = rawMsg
      .replace(/اضف|أضف|سجل|عدل|غير|حط|المنتج|منتج|و\s*الشركة|و\s*الشركه/gi, '')
      .replace(new RegExp(`(?:شركة|شركه)\\s+${companyName || ''}`, 'gi'), '')
      .replace(new RegExp(`${companyName || ''}`, 'gi'), '')
      .replace(/\b\d+(\.\d+)?\b/g, '')
      .replace(/قبل الضريبة|شامل الضريبة|ريال|بسعر|بـ|سعر/gi, '')
      .trim();

    prodName = prodName.replace(/^[\s,،\-]+|[\s,،\-]+$/g, '');
    if (tirePattern && !prodName.includes(tirePattern)) {
      prodName = `${prodName} ${tirePattern}`.trim();
    }

    if (prodName && (companyName || price !== null)) {
      const finalComp = companyName || companies[0] || 'الشركة العامة';
      const finalPrice = price || 0;

      if (pinProvided !== adminPin) {
        return {
          replyText: `لتأكيد إضافة "${prodName}" لشركة "${finalComp}" بسعر ${finalPrice} ريال، يرجى إدخال رمز الإدارة 1234.`,
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
          replyText: `تم بنجاح تسجيل "${prodName}" لشركة "${finalComp}" بسعر ${finalPrice} ريال وتحديث النظام سحابياً.`,
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

    // Company only addition
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

  // 5. SMART QUERY LOGIC FOR PRODUCTS & COMPANIES
  const tirePattern = extractTirePattern(rawMsg);
  const matchedCompany = companies.find(c => normMsg.includes(normalize(c)));

  const matchedProduct = products.find(p => {
    const pNorm = normalize(p.name);
    const pCode = (p.code || '').toLowerCase();
    const cleanTokens = normMsg.split(/[\s,،]+/);
    const hasTire = tirePattern && (p.name.includes(tirePattern) || (p.code && p.code.includes(tirePattern)));

    return hasTire || normMsg.includes(pNorm) || (pCode && normMsg.includes(pCode)) || cleanTokens.some(t => t.length > 3 && pNorm.includes(t));
  });

  // Query: Product AND Company
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

  // Query: Product Only -> Show all companies
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

  // Query: Company Only -> Show company's products
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

  // Default intelligent assistant response
  return {
    replyText: "تفضل بسؤالك: يمكنك الاستفسار عن الشركات المسجلة، أو أسعار أي مقاس أو منتج، أو طلب إضافة وتعديل برمز الإدارة.",
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
      replyText: `حدث خطأ في النظام: ${error.message}`,
      error: error.message
    }, { status: 500 });
  }
}
