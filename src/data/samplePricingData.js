/**
 * Initial Companies and Products Dataset (100+ items across 10 companies)
 */

export const INITIAL_COMPANIES = [
  { id: 'c1', name: 'شركة الوفاق المتحدة', code: 'WFK', badgeColor: '#3b82f6' },
  { id: 'c2', name: 'مجموعة النجم الذهبي', code: 'STR', badgeColor: '#eab308' },
  { id: 'c3', name: 'شركة البيرق للتوريدات', code: 'BRQ', badgeColor: '#10b981' },
  { id: 'c4', name: 'مؤسسة الأفق المتقدم', code: 'OFQ', badgeColor: '#8b5cf6' },
  { id: 'c5', name: 'شركة الجزيرة الدولية', code: 'JZR', badgeColor: '#ec4899' },
  { id: 'c6', name: 'شركة مسار الخليج', code: 'MSR', badgeColor: '#06b6d4' },
  { id: 'c7', name: 'مؤسسة الرائد الوطنية', code: 'RAI', badgeColor: '#f97316' },
  { id: 'c8', name: 'شركة القمة للتجارة', code: 'QMA', badgeColor: '#14b8a6' },
  { id: 'c9', name: 'مجموعة الفرسان الفنية', code: 'FRS', badgeColor: '#6366f1' },
  { id: 'c10', name: 'الشركة المركزية العامة', code: 'MRK', badgeColor: '#f43f5e' }
];

const RAW_ITEMS = [
  { code: 'BRK-1001', name: 'فحمات فرامل أمامية سيراميك', category: 'فرامل', base: 140 },
  { code: 'BRK-1002', name: 'فحمات فرامل خلفية سيراميك', category: 'فرامل', base: 110 },
  { code: 'BRK-1003', name: 'هوبات أمامية رياضية مهواة', category: 'فرامل', base: 320 },
  { code: 'BRK-1004', name: 'هوبات خلفية مخرمة', category: 'فرامل', base: 260 },
  { code: 'BRK-1005', name: 'زيت فرامل أصلي DOT 4 (500 مل)', category: 'فرامل', base: 35 },
  { code: 'BRK-1006', name: 'قماشات جلنط هاند بريك', category: 'فرامل', base: 85 },
  { code: 'BRK-1007', name: 'طقم كليبر فرامل أمامي يمين', category: 'فرامل', base: 450 },
  { code: 'BRK-1008', name: 'طقم كليبر فرامل أمامي يسار', category: 'فرامل', base: 450 },
  { code: 'BRK-1009', name: 'ليات فرامل ضغط عالي أمامية', category: 'فرامل', base: 95 },
  { code: 'BRK-1010', name: 'علبة زيت فرامل مع الحساس', category: 'فرامل', base: 190 },

  { code: 'ENG-2001', name: 'زيت محرك تخليقي بالكامل 5W-30 (1 لتر)', category: 'محرك وفلاتر', base: 48 },
  { code: 'ENG-2002', name: 'كرتون زيت محرك 5W-30 (12 لتر)', category: 'محرك وفلاتر', base: 510 },
  { code: 'ENG-2003', name: 'فلتر زيت محرك أصلي ياباني', category: 'محرك وفلاتر', base: 32 },
  { code: 'ENG-2004', name: 'فلتر هواء محرك متعدد الطبقات', category: 'محرك وفلاتر', base: 65 },
  { code: 'ENG-2005', name: 'فلتر مكيف هواء كربوني مضاد للبكتيريا', category: 'محرك وفلاتر', base: 55 },
  { code: 'ENG-2006', name: 'طقم بواجي ليزر إيريديوم (4 حبات)', category: 'محرك وفلاتر', base: 180 },
  { code: 'ENG-2007', name: 'طقم بواجي بلاتينيوم (6 حبات)', category: 'محرك وفلاتر', base: 240 },
  { code: 'ENG-2008', name: 'كويل إشعال أصلي للمحرك', category: 'محرك وفلاتر', base: 135 },
  { code: 'ENG-2009', name: 'سير محرك خارجي 7PK', category: 'محرك وفلاتر', base: 90 },
  { code: 'ENG-2010', name: 'بكرة شداد سير المحرك أوتوماتيك', category: 'محرك وفلاتر', base: 175 },
  { code: 'ENG-2011', name: 'طرمبة زيت محرك عالية الضغط', category: 'محرك وفلاتر', base: 380 },
  { code: 'ENG-2012', name: 'طقم وجيه محرك كامل مع صوف', category: 'محرك وفلاتr', base: 420 },
  { code: 'ENG-2013', name: 'صوفة مكينة أمامية أصلية', category: 'محرك وفلاتر', base: 45 },
  { code: 'ENG-2014', name: 'صوفة مكينة خلفية مانعة للتهريب', category: 'محرك وفلاتر', base: 60 },
  { code: 'ENG-2015', name: 'بلف تبخير زيت المحرك PCV', category: 'محرك وفلاتر', base: 50 },

  { code: 'COL-3001', name: 'رديتر ماء ألمنيوم صيني نخب أول', category: 'نظام التبريد', base: 390 },
  { code: 'COL-3002', name: 'طرمبة ماء تبريد محرك مع الوجة', category: 'نظام التبريد', base: 160 },
  { code: 'COL-3003', name: 'بلف حرارة ثرموستات 82 درجة', category: 'نظام التبريد', base: 75 },
  { code: 'COL-3004', name: 'ماء رديتر أحمر أصلي 4 لتر', category: 'نظام التبريد', base: 55 },
  { code: 'COL-3005', name: 'ماء رديتر أزرق طويل الأمد 4 لتر', category: 'نظام التبريد', base: 60 },
  { code: 'COL-3006', name: 'غطاء رديتر ضغط 1.1 بار أصلي', category: 'نظام التبريد', base: 35 },
  { code: 'COL-3007', name: 'مروحة تبريد رديتر كهربائية كاملة', category: 'نظام التبريد', base: 310 },
  { code: 'COL-3008', name: 'دينمو مروحة رديتر ياباني', category: 'نظام التبريد', base: 195 },
  { code: 'COL-3009', name: 'لي رديتر علوي مع القفزان', category: 'نظام التبريد', base: 40 },
  { code: 'COL-3010', name: 'لي رديتر سفلي معزز حرارياً', category: 'نظام التبريد', base: 45 },
  { code: 'COL-3011', name: 'قربة ماء مساحات مع الدينمو', category: 'نظام التبريد', base: 85 },
  { code: 'COL-3012', name: 'قربة ماء تبريد رديتر إضافية', category: 'نظام التبريد', base: 90 },

  { code: 'SUS-4001', name: 'مساعد أمامي يمين غاز/زيت', category: 'عضلات ومساعدات', base: 220 },
  { code: 'SUS-4002', name: 'مساعد أمامي يسار غاز/زيت', category: 'عضلات ومساعدات', base: 220 },
  { code: 'SUS-4003', name: 'مساعد خلفي يمين ألماني', category: 'عضلات ومساعدات', base: 170 },
  { code: 'SUS-4004', name: 'مساعد خلفي يسار ألماني', category: 'عضلات ومساعدات', base: 170 },
  { code: 'SUS-4005', name: 'مقص أمامي سفلي يمين مع الجلب', category: 'عضلات ومساعدات', base: 290 },
  { code: 'SUS-4006', name: 'مقص أمامي سفلي يسار مع الجلب', category: 'عضلات ومساعدات', base: 290 },
  { code: 'SUS-4007', name: 'ركبة مقص سفلية 555 أصلية', category: 'عضلات ومساعدات', base: 75 },
  { code: 'SUS-4008', name: 'ذراع دركسون داخلي يمين/يسار', category: 'عضلات ومساعدات', base: 65 },
  { code: 'SUS-4009', name: 'ذراع دركسون خارجي تايواني درجة أولى', category: 'عضلات ومساعدات', base: 55 },
  { code: 'SUS-4010', name: 'مسمار توازن أمامي طقم حبتين', category: 'عضلات ومساعدات', base: 80 },
  { code: 'SUS-4011', name: 'جلد عمود توازن أمامي طقم', category: 'عضلات ومساعدات', base: 35 },
  { code: 'SUS-4012', name: 'كرسي مساعد أمامي مع الرمان', category: 'عضلات ومساعدات', base: 115 },
  { code: 'SUS-4013', name: 'يايات أمامية رياضية منخفضة 2 سم', category: 'عضلات ومساعدات', base: 340 },
  { code: 'SUS-4014', name: 'كرسي مكينة أمامي هيدروليك', category: 'عضلات ومساعدات', base: 210 },
  { code: 'SUS-4015', name: 'كرسي جيربكس خلفي مقوى', category: 'عضلات ومساعدات', base: 140 },

  { code: 'ELC-5001', name: 'بطارية سيارة 70 أمبير جافة صيانة مجانية', category: 'كهرباء وإلكترونيات', base: 320 },
  { code: 'ELC-5002', name: 'دينمو كهرباء محرك 130 أمبير', category: 'كهرباء وإلكترونيات', base: 580 },
  { code: 'ELC-5003', name: 'سلف تشغيل محرك ستارتار أصلي', category: 'كهرباء وإلكترونيات', base: 460 },
  { code: 'ELC-5004', name: 'حساس أكسجين شكمان علوي (Bank 1)', category: 'كهرباء وإلكترونيات', base: 230 },
  { code: 'ELC-5005', name: 'حساس كرنك إلكتروني حساس سرعة', category: 'كهرباء وإلكترونيات', base: 125 },
  { code: 'ELC-5006', name: 'حساس هواء MAF مع القربة', category: 'كهرباء وإلكترونيات', base: 210 },
  { code: 'ELC-5007', name: 'حساس ضغط إطارات TPMS 433MHz', category: 'كهرباء وإلكترونيات', base: 95 },
  { code: 'ELC-5008', name: 'طقم لمبات ليد LED H7 قوة 12000 لومن', category: 'كهرباء وإلكترونيات', base: 160 },
  { code: 'ELC-5009', name: 'طقم لمبات ليد LED H4 للواطي والعالي', category: 'كهرباء وإلكترونيات', base: 180 },
  { code: 'ELC-5010', name: 'شمعة زينون أصلية D4S كوري', category: 'كهرباء وإلكترونيات', base: 140 },
  { code: 'ELC-5011', name: 'محول زينون بالاست كوري 35 واط', category: 'كهرباء وإلكترونيات', base: 190 },
  { code: 'ELC-5012', name: 'علبة فيوزات داخلية مع الكتاوت', category: 'كهرباء وإلكترونيات', base: 260 },
  { code: 'ELC-5013', name: 'طقم كتاوت مروحة ودينمو 4 خطوط', category: 'كهرباء وإلكترونيات', base: 45 },
  { code: 'ELC-5014', name: 'بوري سيارة نغمة لكزس أصلي', category: 'كهرباء وإلكترونيات', base: 85 },
  { code: 'ELC-5015', name: 'أسلاك اشتراك بطارية 1000A نحاس صافي', category: 'كهرباء وإلكترونيات', base: 75 },

  { code: 'AIR-6001', name: 'كمبروسر مكيف دينسو Denso أصلي', category: 'تكييف وتبريد المقصورة', base: 1150 },
  { code: 'AIR-6002', name: 'رديتر مكيف مع الفلتر المجفف', category: 'تكييف وتبريد المقصورة', base: 360 },
  { code: 'AIR-6003', name: 'ثلاجة مكيف داخلية ألمنيوم ياباني', category: 'تكييف وتبريد المقصورة', base: 410 },
  { code: 'AIR-6004', name: 'بلف مكيف تمدد إكسبانشن فالف', category: 'تكييف وتبريد المقصورة', base: 95 },
  { code: 'AIR-6005', name: 'حساس ضغط فريون التكييف', category: 'تكييف وتبريد المقصورة', base: 110 },
  { code: 'AIR-6006', name: 'دينمو مروحة مكيف داخلية بلور موتور', category: 'تكييف وتبريد المقصورة', base: 220 },
  { code: 'AIR-6007', name: 'علبة فريون أمريكي R134a أصلي 13.6 كجم', category: 'تكييف وتبريد المقصورة', base: 490 },
  { code: 'AIR-6008', name: 'زيت كمبروسر PAG 46 أمريكي (250 مل)', category: 'تكييف وتبريد المقصورة', base: 65 },

  { code: 'FUL-7001', name: 'طرمبة بنزين كاملة مع العوامة والفلتر', category: 'نظام الوقود', base: 480 },
  { code: 'FUL-7002', name: 'قلب طرمبة بنزين كوري جودة عالية', category: 'نظام الوقود', base: 120 },
  { code: 'FUL-7003', name: 'فلتر بنزين خارجي ضغط عالي', category: 'نظام الوقود', base: 55 },
  { code: 'FUL-7004', name: 'طقم بخاخات بنزين إلكترونية (4 حبات)', category: 'نظام الوقود', base: 520 },
  { code: 'FUL-7005', name: 'منظف بخاخات ونظام الوقود لوكاس أمريكي', category: 'نظام الوقود', base: 38 },
  { code: 'FUL-7006', name: 'حساس عوامة تانكي البنزين', category: 'نظام الوقود', base: 90 },
  { code: 'FUL-7007', name: 'غطاء تانكي بنزين مزود بصمام تفريغ', category: 'نظام الوقود', base: 40 },

  { code: 'DRV-8001', name: 'عكس أمامي يمين كامل بالرؤوس', category: 'نظام الدفع والحركة', base: 380 },
  { code: 'DRV-8002', name: 'عكس أمامي يسار كامل بالرؤوس', category: 'نظام الدفع والحركة', base: 380 },
  { code: 'DRV-8003', name: 'رأس عكس خارجي يمين/يسار مع الشحم', category: 'نظام الدفع والحركة', base: 110 },
  { code: 'DRV-8004', name: 'رأس عكس داخلي مع الجلب', category: 'نظام الدفع والحركة', base: 130 },
  { code: 'DRV-8005', name: 'جلد عكس طقم كامل مع القفزان وشحم سيليكون', category: 'نظام الدفع والحركة', base: 45 },
  { code: 'DRV-8006', name: 'فلنجة كفر أمامي مع الرمان كامل', category: 'نظام الدفع والحركة', base: 195 },
  { code: 'DRV-8007', name: 'رمان كفر خلفي ABS مدمج', category: 'نظام الدفع والحركة', base: 165 },
  { code: 'DRV-8008', name: 'صليب عمود كردان ياباني مزيت', category: 'نظام الدفع والحركة', base: 85 },
  { code: 'DRV-8009', name: 'شيال عمود دبل مع الرمان', category: 'نظام الدفع والحركة', base: 145 },
  { code: 'DRV-8010', name: 'ديسك وصحن كلتش أصلي مع الفحمة', category: 'نظام الدفع والحركة', base: 620 },

  { code: 'OIL-9001', name: 'زيت جيربكس أوتوماتيك WS أصلي (4 لتر)', category: 'زيوت وسوائل تخصصية', base: 185 },
  { code: 'OIL-9002', name: 'زيت دفرنس وجير عادي 75W-90 تخليقي', category: 'زيوت وسوائل تخصصية', base: 55 },
  { code: 'OIL-9003', name: 'زيت دركسون هيدروليك ديكسرون 3', category: 'زيوت وسوائل تخصصية', base: 30 },
  { code: 'OIL-9004', name: 'سائل تنظيف المحرك قبل الغيار Engine Flush', category: 'زيوت وسوائل تخصصية', base: 35 },
  { code: 'OIL-9005', name: 'معالج احتكاك المحرك سيراميك نانو', category: 'زيوت وسوائل تخصصية', base: 95 },
  { code: 'OIL-9006', name: 'شحم كليبرات ومكابح مقاوم للحرارة 1200C', category: 'زيوت وسوائل تخصصية', base: 28 },
  { code: 'OIL-9007', name: 'معجون جوان سيليكون أصلي أسود ريكو', category: 'زيوت وسوائل تخصصية', base: 35 },
  { code: 'OIL-9008', name: 'بخاخ مزيل صدأ وصيانة عامة WD-40 330ml', category: 'زيوت وسوائل تخصصية', base: 25 },
  { code: 'OIL-9009', name: 'بخاخ تنظيف بوابات هواء وفرامل سريع التطاير', category: 'زيوت وسوائل تخصصية', base: 22 },
  { code: 'OIL-9010', name: 'ماء مساحات مركز مانع للتجمد والشوائب', category: 'زيوت وسوائل تخصصية', base: 18 },

  { code: 'TLS-1001', name: 'طقم مساحات زجاج سيليكون هجينة (24+18 إنش)', category: 'ملحقات وعناية', base: 65 },
  { code: 'TLS-1002', name: 'عفريتة هيدروليك 3 طن مع شنطة حمل', category: 'ملحقات وعناية', base: 210 },
  { code: 'TLS-1003', name: 'جهاز فحص كمبيوتر السيارة بلوتوث OBD2', category: 'ملحقات وعناية', base: 110 },
  { code: 'TLS-1004', name: 'منفاخ إطارات رقمي بستمين سريع النفخ', category: 'ملحقات وعناية', base: 145 },
  { code: 'TLS-1005', name: 'طقم روتشيت ومفاتيح حبات كروم 46 قطعة', category: 'ملحقات وعناية', base: 95 },
  { code: 'TLS-1006', name: 'مقياس ضغط هواء إطارات إلكتروني شاشة مضيئة', category: 'ملحقات وعناية', base: 45 },
  { code: 'TLS-1007', name: 'طقم رقع بنشر تيوبلس سريع مع الغراء والمخرز', category: 'ملحقات وعناية', base: 30 },
  { code: 'TLS-1008', name: 'شاحن بطارية سيارة ذكي أوتوماتيك 12V 8A', category: 'ملحقات وعناية', base: 130 },
  { code: 'TLS-1009', name: 'ستارة عازلة للحرارة للزجاج الأمامي قابلة للطي', category: 'ملحقات وعناية', base: 40 },
  { code: 'TLS-1010', name: 'مضخة شفط زيت المحرك اليدوية 9 لتر', category: 'ملحقات وعناية', base: 175 }
];

/**
 * Generate 100+ fully-fleshed products with multi-company dynamic pricing.
 * Deliberately leaves some items without price for certain companies to test the safety alert rule.
 */
export function generateInitialProducts() {
  const companies = INITIAL_COMPANIES;

  return RAW_ITEMS.map((item, idx) => {
    const prices = {};

    companies.forEach((comp, cIdx) => {
      // Deterministic multiplier based on company and item
      const multiplier = 1 + (cIdx * 0.05) + ((idx % 7) * 0.02) - 0.04;
      let calculatedPrice = Math.round(item.base * multiplier);

      // SAFETY TEST: Deliberately set some products as NULL / UNPRICED
      // for certain companies to trigger the "السعر غير محدد - راجع الإدارة" alert!
      // (e.g. company 7 or 9 for every 6th item, or company 4 for items divisible by 9)
      const shouldBeUnset = 
        (cIdx === 6 && idx % 5 === 0) ||
        (cIdx === 8 && idx % 4 === 0) ||
        (cIdx === 3 && idx % 9 === 0) ||
        (cIdx === 9 && idx % 11 === 0);

      if (shouldBeUnset) {
        prices[comp.id] = null; // Undefined / unapproved price
      } else {
        prices[comp.id] = calculatedPrice;
      }
    });

    return {
      id: `prod_${idx + 1}`,
      code: item.code,
      name: item.name,
      category: item.category,
      unit: item.name.includes('كرتون') ? 'كرتون' : (item.name.includes('طقم') ? 'طقم' : (item.name.includes('لتر') ? 'لتر' : 'حبة')),
      barcode: `628${(1000000000 + idx * 7919).toString().slice(0, 10)}`,
      prices,
      notes: idx % 8 === 0 ? 'يتطلب طلبية مسبقة عند الكميات الكبيرة' : '',
      updatedAt: Date.now() - (idx * 3600000)
    };
  });
}
