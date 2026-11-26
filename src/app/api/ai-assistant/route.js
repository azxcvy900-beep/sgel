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

// Extract tire sizes like 225/70/17 or 225 70 17 or 2257017
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

  // 1. Filter Chit-chat (Business focused)
  const nonBusiness = ['نكتة', 'قصة', 'طبخ', 'سياسة', 'دين', 'اخبار', 'شخبارك', 'كيفك'];
  if (nonBusiness.some(w => normMsg.includes(w))) {
    return {
      replyText: "عذراً، أنا مخصص فقط لإدارة وتسعير منتجات وشركات المركز.",
      action: null
    };
  }

  // 2. Intelligent Compound Action: ADD / UPDATE PRODUCT & PRICE
  const isAddOrUpdate = normMsg.includes('اضف') || normMsg.includes('سجل') || normMsg.includes('عدل') || normMsg.includes('غير') || normMsg.includes('حط');

  if (isAddOrUpdate) {
    // Extract Price Number
    const priceMatch = rawMsg.match(/\b\d+(\.\d+)?\b/);
    const price = priceMatch ? Number(priceMatch[0]) : null;

    // Detect Company
    let companyName = null;
    const compRegex = /(?:شركة|شركه)\s+([\u0621-\u064A\w\s]+?)(?=\s+\d|\s+سعر|\s+بـ|\s+بسعر|\s+قبل|$)/i;
    const compMatch = rawMsg.match(compRegex);

    if (compMatch && compMatch[1]) {
      companyName = compMatch[1].trim();
    } else {
      const foundComp = companies.find(c => normMsg.includes(normalize(c)));
      if (foundComp) companyName = foundComp;
    }

    // Detect or Extract Product Name
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

  // 3. SMART QUERY LOGIC
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
    replyText: "تفضل، أنا أستمع إليك. يمكنك طلب سعر أي منتج أو مقاس، أو أمر إضافة منتج مع سعره وشركته.",
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
