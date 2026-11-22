import { NextResponse } from 'next/server';

const SYSTEM_INSTRUCTIONS = `
أنت المساعد الذكي التعليمي المتخصص لنظام "مركز إدارة وتسعير المنتجات" (Pricing & Inventory Hub).
دورك:
1. الإجابة باللغة العربية بأسلوب عملي، مباشر، واضح، ومحترف.
2. مساعدة المدير والمساعد في كل ما يتعلق بـ:
   - كيفية إعداد ومزامنة قاعدة البيانات السحابية (Firebase Realtime Database & Firestore).
   - إعداد وتنسيق ورفع ملفات الإكسل (.xlsx / .csv) وتحديث أسعار الـ 10 شركات دفعة واحدة.
   - شرح قواعد الأمان والتسعير الفوري (مثل قاعدة: "السعر غير محدد - راجع الإدارة").
   - كيفية تشغيل النظام عن بُعد ومزامنة الأسعار بين جوال المساعد في المركز وجهاز المدير في الخارج.
   - استكشاف الأخطاء وإصلاحها (Troubleshooting).
3. نسق إجاباتك بنقاط واضحة وقوائم مرقمة عند إعطاء خطوات تشغيل.
`;

export async function POST(request) {
  try {
    const body = await request.json();
    const { message, context, apiKey: clientApiKey } = body;

    const apiKey = clientApiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      // Smart offline fallback response when API key is not yet configured
      return NextResponse.json({
        reply: generateOfflineSmartReply(message, context),
        isOfflineMode: true
      });
    }

    // Call live Gemini API (v1beta gemini-2.5-flash or gemini-1.5-flash)
    const promptPayload = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${SYSTEM_INSTRUCTIONS}\n\n[سياق النظام الحالي]:\n- عدد المنتجات الحالية: ${context?.productsCount || 0}\n- عدد الشركات النشطة: ${context?.companiesCount || 10}\n- وضع المزامنة: ${context?.isSynced ? 'متصل سحابياً مع Firebase' : 'وضع محلي'}\n\n[سؤال المستخدم]:\n${message}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1200
      }
    };

    // Try models in order: gemini-2.5-flash -> gemini-1.5-flash
    let res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(promptPayload)
    });

    if (!res.ok) {
      res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promptPayload)
      });
    }

    if (!res.ok) {
      const errText = await res.text();
      console.error('Gemini API Error:', errText);
      return NextResponse.json({
        reply: generateOfflineSmartReply(message, context, 'ملاحظة: مفتاح Gemini المعطى واجه مشكلة في الصلاحية. تم تحويلك للمساعد الذكي المدمج.'),
        isOfflineMode: true
      });
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    return NextResponse.json({
      reply: candidateText || generateOfflineSmartReply(message, context),
      isOfflineMode: false
    });

  } catch (error) {
    console.error('AI assistant route error:', error);
    return NextResponse.json({
      reply: 'أهلاً بك! واجه المساعد مشكلة في الاتصال بالشبكة، ولكن بإمكاني مساعدتك في كل خطوات التشغيل: إعداد الإكسل، وتفعيل Firebase، واستخدام واجهة المساعد.',
      isOfflineMode: true
    });
  }
}

/**
 * Intelligent built-in knowledge base responding to typical questions
 * even before the user inputs their Gemini API key!
 */
function generateOfflineSmartReply(message = '', context = {}, prefix = '') {
  const q = message.toLowerCase();

  let body = '';

  if (q.includes('فايربيس') || q.includes('firebase') || q.includes('قواعد') || q.includes('سحابي') || q.includes('مزامنة') || q.includes('permission')) {
    body = `### 🌐 دليل تفعيل المزامنة السحابية الحية (Firebase):
1. **افتح لوحة تحكم Firebase**: توجه إلى [Firebase Console](https://console.firebase.google.com/) واختر مشروعك.
2. **قواعد Realtime Database**:
   - اذهب إلى **Build** ⬅ **Realtime Database** ⬅ تبويب **Rules (القواعد)**.
   - ضع الكود التالي واضغط **Publish (نشر)**:
\`\`\`json
{
  "rules": {
    "pricing_hub": {
      ".read": true,
      ".write": true
    }
  }
}
\`\`\`
3. **النتيجة**: بمجرد نشر القواعد، سيتحول مؤشر الاتصال في التطبيق إلى الأخضر 🟢، وستتم مزامنة أي تعديل على الأسعار بين جهازك في الخارج وجهاز مساعدك في المركز في أجزاء من الثانية!`;
  } else if (q.includes('إكسل') || q.includes('اكسل') || q.includes('excel') || q.includes('استيراد') || q.includes('رفع')) {
    body = `### 📊 خطوات تجهيز واستيراد ملف الإكسل (100 إلى 150 منتج):
1. **ترتيب الأعمدة**: يجب أن يحتوي الصف الأول على العناوين التالية:
   - **العمود A**: \`كود القطعة\` (مثل: BRK-101)
   - **العمود B**: \`اسم المنتج\` (مثل: فحمات فرامل أمامية)
   - **العمود C**: \`التصنيف\` (مثل: فرامل)
   - **العمود D**: \`الوحدة\` (مثل: حبة أو طقم)
   - **الأعمدة من E إلى N**: أسماء الـ 10 شركات وأسعار كل شركة.
2. **قاعدة الأسعار الفارغة**: إذا كانت إحدى الشركات لا تملك سعراً لهذا الصنف، اترك الخلية فارغة وسيقوم النظام تلقائياً بتطبيق قاعدة الأمان: **"السعر غير محدد - راجع الإدارة"**.
3. **طريقة الرفع**:
   - ادخل على **لوحة الإدارة** (رمز القفل) ⬅ تبويب **استيراد وتصدير Excel**.
   - اسحب الملف أو انسخ الجدول والصقه في خانة اللصق المباشر.
   - راجع المعاينة واضغط **"اعتماد وحفظ في قاعدة البيانات"**.`;
  } else if (q.includes('مساعد') || q.includes('تسعير') || q.includes('غير محدد') || q.includes('سلة') || q.includes('تصفير')) {
    body = `### 💼 إرشادات واجهة التسعير الفورية للمساعد:
- **تثبيت الشركة**: يختار المساعد الشركة من القائمة العلوية ويفعل زر **"📌 تثبيت الشركة"** لتبقى ثابتة طوال خدمة نفس العميل.
- **البحث السريع**: يمكن البحث باسم القطعة أو رقم الكود أو مسح الباركود مباشرة.
- **تنبيه الأمان**: إذا كان السعر غير مدخل، يظهر تنبيه أحمر عريض: **"السعر غير محدد - راجع الإدارة"** لمنع بيع أي قطعة بسعر غير معتمد.
- **سلة الحساب**: يضغط المساعد على **(+)** لحساب مجموع قطع العميل، ثم يضغط زر **"تصفير للعميل التالي"** باللون الأحمر عند الانتهاء.`;
  } else if (q.includes('مفتاح') || q.includes('gemini') || q.includes('api')) {
    body = `### 🔑 كيفية الحصول على مفتاح Gemini API وتفعيله:
1. ادخل إلى موقع [Google AI Studio](https://aistudio.google.com/).
2. سجّل الدخول بحساب Google واضغط على **"Get API key"** ثم **"Create API key"**.
3. انسخ المفتاح، ثم في لوحة الإدارة بتطبيقنا اذهب إلى قسم **إعدادات النظام والذكاء الاصطناعي** والصق المفتاح هناك واضغط حفظ.`;
  } else {
    body = `أهلاً بك! أنا مساعدك الذكي المدمج في نظام تسعير المنتجات.

يمكنني مساعدتك في أي من المهام التالية:
1. **شرح إعداد Firebase** لمزامنة الأسعار لحظياً بين الأجهزة.
2. **تجهيز وتنسيق ملف الإكسل** للـ 100+ منتج وقوائم أسعار الـ 10 شركات.
3. **طريقة استخدام واجهة المساعد** والتسعير الفوري وسلة الحسابات السريعة.
4. **تعديل أسماء الشركات والأسعار** عن بُعد وحل أي مشكلة تقنية.

اكتب استفسارك وسأجيبك بخطوات عملية فوراً!`;
  }

  return prefix ? `${prefix}\n\n${body}` : body;
}
