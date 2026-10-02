/**
 * شكل قاموس القطع وقائمة الأسعار وقيمهما المسموحة (برومت أكتوبر ٢٠٢٦، المرحلة 5) —
 * منفصل عن البيانات حتى يستعمله سكربت التوليد قبل أن توجد الملفات المولَّدة.
 */

/** الفئات الـ14 بترتيب العرض وأسمائها كما يقولها السوق */
export const PART_CATEGORIES = [
  { key: "engine", name: "المكينة" },
  { key: "cooling", name: "التبريد والرديتر" },
  { key: "ac", name: "المكيف" },
  { key: "electrical", name: "الكهرباء والإشعال" },
  { key: "fuel", name: "الوقود والعادم" },
  { key: "filters", name: "الزيوت والفلاتر" },
  { key: "transmission", name: "القير والكلتش" },
  { key: "brakes", name: "الفرامل" },
  { key: "suspension", name: "العفشة والتعليق" },
  { key: "steering", name: "الدركسون" },
  { key: "body", name: "البودي والصدامات" },
  { key: "lights", name: "الأنوار" },
  { key: "mirrors", name: "المرايات والزجاج" },
  { key: "wheels", name: "الكفرات والجنوط" },
] as const;
export type PartCategory = (typeof PART_CATEGORIES)[number]["key"];

/**
 * مستويات الجودة كما كتبها ملف المركز، بترتيب العرض. «غير محدد» آخرها ويُعرض
 * «الجودة تُحدَّد عند التأكيد». توحيدها في مستويات رسمية مؤجل مع الضمانات.
 */
export const QUALITY_TIERS = ["وكالة", "أصلي", "ياباني", "كوري", "تايواني", "تايلندي", "ماليزي", "تجاري", "غير محدد"] as const;
export type QualityTier = (typeof QUALITY_TIERS)[number];
export const UNSPECIFIED_TIER: QualityTier = "غير محدد";

/** high مؤكد · medium مرجّح · review يراجعه المركز · common شائع من خارج الملف (بلا سعر) */
export const PART_CONFIDENCES = ["high", "medium", "review", "common"] as const;
export type PartConfidence = (typeof PART_CONFIDENCES)[number];

export interface PartType {
  key: string;
  /** الاسم كما يقوله السوق — «قماش أمامي» */
  name: string;
  category: PartCategory;
  synonyms: string[];
  nameEn: string;
  confidence: PartConfidence;
  /** عدد أصناف النوع في ملف المركز — مؤشر شيوعه، يرجّح به البحث */
  sourceRows: number;
}

export interface PartPrice {
  key: string;
  tier: QualityTier;
  /** ريال، كما هو في ملف المركز بلا تعديل */
  price: number;
}
