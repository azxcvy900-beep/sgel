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

// Convert spoken Arabic numbers to digits (e.g. "واحد اثنين ثلاثة اربعة" -> "1234")
function parseSpokenPin(text) {
  if (!text) return '';
  let clean = text.trim();
  // If already contains 4 digits together
  const directDigits = clean.match(/\b\d{4,8}\b/);
  if (directDigits) return directDigits[0];

  // Map Arabic word digits
  const wordMap = {
    'صفر': '0', 'واحد': '1', 'اثنين': '2', 'ثنين': '2', 'ثلاثة': '3', 'تلاتة': '3', 'ثلاثه': '3',
    'اربعة': '4', 'اربعه': '4', 'خمسة': '5', 'خمسه': '5', 'ستة': '6', 'سته': '6',
    'سبعة': '7', 'سبعه': '7', 'ثمانية': '8', 'ثمانيه': '8', 'تسعة': '9', 'تسعه': '9'
  };

  let result = '';
  const tokens = clean.split(/[\s,،\-]+/);
  for (const t of tokens) {
    const norm = normalize(t);
    if (wordMap[norm]) {
      result += wordMap[norm];
    } else if (/^\d+$/.test(t)) {
      result += t;
    }
  }

  return result;
}

function processSmartQuery(message, context, pinProvided) {
  const products = context?.products || [];
  const companies = context?.companies || [];
  const adminPin = context?.adminPin || '1234';
  const pendingActionFromClient = context?.pendingAction || null;
  const rawMsg = (message || '').trim();
  const normMsg = normalize(rawMsg);

  // 1. PIN VERIFICATION VIA VOICE:
  // If user is answering with a PIN (either digits or spoken words like "واحد اثنين ثلاثة اربعة" or "1234")
  const extractedPin = parseSpokenPin(rawMsg);
  if (pendingActionFromClient && (extractedPin || pinProvided)) {
    const finalPin = extractedPin || pinProvided;
    if (finalPin === adminPin) {
      return {
        replyText: "عُلِم! تم تأكيد كلمة المرور وحفظ البيانات بنجاح في قاعدة البيانات السحابية.",
        action: {
          ...pendingActionFromClient,
          executeNow: true,
          pinSuccess: true
        }
      };
    } else {
      return {
        replyText: "عذراً، كلمة المرور غير صحيحة. لم يتم الحفظ في قاعدة البيانات.",
        action: {
          pinSuccess: false,
          errorMsg: "رمز التأكيد غير صحيح"
        }
      };
    }
  }

  // 2. VOICE COMMAND: Close / Exit Conversation
  const closeCommands = ['اغلق', 'اقفل', 'قفل', 'انهاء', 'مع السلامه', 'مع السلامة', 'خروج', 'سكر'];
  if (closeCommands.some(w => normMsg.includes(w))) {
    return {
      replyText: "مع السلامة، أنا دائماً في خدمتك.",
      action: { type: 'CLOSE_ASSISTANT' }
    };
  }

  // 3. INQUIRY: List all companies
  if (
    normMsg.includes('شرك') && (normMsg.includes('مسجل') || normMsg.includes('ما هي') || normMsg.includes('ماهي') || normMsg.includes('قائم') || normMsg.includes('عندي') || normMsg.includes('لدي') || normMsg.includes('اعطني') || normMsg.includes('كل') || normMsg.includes('جميع'))
  ) {
    if (companies.length === 0) {
      return { replyText: "لا توجد أي شركات مسجلة في النظام حالياً.", action: null };
    }
    const cList = companies.map((c, i) => `${i + 1}. ${c}`).join('\n');
    return {
      replyText: `الشركات المسجلة في المركز (${companies.length} شركات):\n${cList}`,
      action: null
    };
  }

  // 4. INQUIRY: List all products / Inventory overview
  if (
    normMsg.includes('منتج') && (normMsg.includes('مسجل') || normMsg.includes('ما هي') || normMsg.includes('ماهي') || normMsg.includes('قائم') || normMsg.includes('عندي') || normMsg.includes('لدي') || normMsg.includes('كم') || normMsg.includes('كل'))
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

  // 5. Intelligent Compound Action: ADD / UPDATE PRODUCT & PRICE
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

      // Ask for Voice Password:
      return {
        replyText: `عُلِم! يرجى إعطائي كلمة المرور لتأكيد إضافة "${prodName}" لـ "${finalComp}" بسعر ${finalPrice} ريال.`,
        action: {
          type: 'ADD_PRODUCT',
          productName: prodName,
          company: finalComp,
          price: finalPrice,
          requiresPin: true
        }
      };
    }

    // Company only addition
    if (normMsg.includes('شرك') && !prodName) {
      const cMatch = rawMsg.replace(/اضف|أضف|سجل|شركه|شركة|جديده|جديدة/gi, '').trim();
      if (cMatch) {
        return {
          replyText: `عُلِم! يرجى إعطائي كلمة المرور لتأكيد إضافة شركة "${cMatch}".`,
          action: {
            type: 'ADD_COMPANY',
            company: cMatch,
            requiresPin: true
          }
        };
      }
    }
  }

  // 6. SMART QUERY LOGIC FOR PRODUCTS & COMPANIES
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

  return {
    replyText: "تفضل بسؤالك: يمكنك طلب أسعار أي منتج، أو أمر إضافة مع ذكر السعر والشركة.",
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
