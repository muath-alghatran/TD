/**
 * باقات الترهيم — مصدر واحد لقسم الرئيسية وصفحات الباقات (مثل center-info.ts).
 * الأسعار من صاحب المركز (أكتوبر ٢٠٢٦). ما لم يُعطَ بعد يبقى فارغاً، والشاشات تُخفي
 * ما يعتمد عليه: الشكل المستهدف، والمدة، والضمان، والسعر قبل الخصم، والصور.
 *
 * الخصم (السعر المشطوب ونسبته) نظامياً يحتاج ترخيص تخفيض من وزارة التجارة
 * وسعراً سابقاً حقيقياً، ويختفي بانتهاء مدته — activeDiscount تفرض الشروط كلها.
 */

import type { IconName } from "@/components/ui/Icon";
import { dayWord, formatYearRange } from "./format";

export interface FaceliftPackage {
  slug: string;
  title: string;
  make: string;
  model: string;
  yearFrom: number;
  yearTo: number;
  /** لاختيار الرسم */
  body: "suv" | "sedan";
  /** السعر المعلن — شامل الضريبة */
  price: number;
  /** السعر قبل الخصم — حقيقي فقط */
  regularPrice: number | null;
  /** رقم ترخيص التخفيض من وزارة التجارة */
  discountPermitNo: string | null;
  /** ISO */
  discountEndsAt: string | null;
  includes: string[];
  /** «إلى شكل …» — يُخفى إن كان فارغاً */
  targetLook: string | null;
  durationDays: number | null;
  warranty: string | null;
  /** صور حقيقية فقط */
  gallery: { before: string; after: string; caption: string }[];
}

const INCLUDES = ["قطع الترهيم كاملة حتى الجنوط", "الرش", "التركيب"];

/** سطر البطاقة المختصر لما تشمله كل باقة */
export const PACKAGE_INCLUDES_LINE = "قطع كاملة حتى الجنوط + رش + تركيب";

function pkg(base: Pick<FaceliftPackage, "slug" | "title" | "make" | "model" | "yearFrom" | "yearTo" | "body" | "price">): FaceliftPackage {
  return {
    ...base,
    regularPrice: null,
    discountPermitNo: null,
    discountEndsAt: null,
    includes: [...INCLUDES],
    targetLook: null,
    durationDays: null,
    warranty: null,
    gallery: [],
  };
}

export const PACKAGES: FaceliftPackage[] = [
  pkg({ slug: "landcruiser-2008-2015", title: "ترهيم لاندكروزر", make: "تويوتا", model: "لاندكروزر", yearFrom: 2008, yearTo: 2015, body: "suv", price: 10000 }),
  pkg({ slug: "accord-2013-2017", title: "ترهيم أكورد", make: "هوندا", model: "أكورد", yearFrom: 2013, yearTo: 2017, body: "sedan", price: 7000 }),
  pkg({ slug: "lexus-lx-2016-2019", title: "ترهيم لكزس LX", make: "لكزس", model: "LX", yearFrom: 2016, yearTo: 2019, body: "suv", price: 12000 }),
  pkg({ slug: "patrol-2010-2024", title: "ترهيم باترول", make: "نيسان", model: "باترول", yearFrom: 2010, yearTo: 2024, body: "suv", price: 10000 }),
];

export function findPackage(slug: string): FaceliftPackage | undefined {
  return PACKAGES.find((p) => p.slug === slug);
}

export interface ActiveDiscount {
  /** مقرّبة للأسفل — لا نبالغ في نسبة الخصم */
  percent: number;
  regularPrice: number;
  permitNo: string;
  endsAt: Date;
}

/** بيانات الخصم مكتملة في الملف (بغض النظر عن انتهائه) — لحجز سطر التفصيل مسبقاً */
export function hasDiscountTerms(p: FaceliftPackage): boolean {
  return p.regularPrice !== null && p.regularPrice > p.price && Boolean(p.discountPermitNo) && Boolean(p.discountEndsAt);
}

/**
 * الخصم الساري الآن، أو null. now بالمللي ثانية — 0 (أو أقل) يعني «الوقت غير معروف»
 * كما على الخادم، فلا يظهر خصم: الأسلم ألا يُعرض خصم ربما انتهى.
 */
export function activeDiscount(p: FaceliftPackage, now: number): ActiveDiscount | null {
  if (now <= 0 || !hasDiscountTerms(p)) return null;
  const endsAt = new Date(p.discountEndsAt as string);
  if (Number.isNaN(endsAt.getTime()) || endsAt.getTime() <= now) return null;
  const regularPrice = p.regularPrice as number;
  return {
    percent: Math.floor(((regularPrice - p.price) / regularPrice) * 100),
    regularPrice,
    permitNo: p.discountPermitNo as string,
    endsAt,
  };
}

/** «كيف تتم» — محطات الباقة على الطريق نفسه في صفحة الهوية (1b) */
export const PACKAGE_STEPS: { text: string; icon: IconName }[] = [
  { text: "معاينة السيارة في المركز", icon: "car" },
  { text: "تأكيد السعر والموعد معك", icon: "calendarCheck" },
  { text: "التنفيذ، مع صور كل مرحلة من الورشة", icon: "camera" },
  { text: "التسليم مع الضمان المكتوب", icon: "scrollText" },
];

/**
 * أسئلة صفحة الباقة — من بياناتها فقط: المدة والضمان يظهران حين يحددهما المركز.
 * سؤال الدفع ظاهر دائماً لأنه سياسة لا وعد (القواعد 11 و14 و15).
 */
export function packageFaq(p: FaceliftPackage): { id: string; q: string; a: string }[] {
  const items = [
    {
      id: "fit",
      q: "هل تناسب سيارتي؟",
      a: `تناسب ${p.make} ${p.model} موديلات ${formatYearRange(p.yearFrom, p.yearTo)}. أرسل لنا سنة سيارتك على واتساب، أو احجز معاينة ونتأكد معك قبل أي التزام.`,
    },
  ];
  if (p.durationDays !== null && p.durationDays > 0) {
    items.push({ id: "duration", q: "كم يستغرق التنفيذ؟", a: `نحو ${dayWord(p.durationDays)}، ونؤكد لك الموعد بعد المعاينة.` });
  }
  if (p.warranty) {
    items.push({ id: "warranty", q: "هل عليها ضمان؟", a: `نعم: ${p.warranty}، ويُسلَّم لك مكتوباً مع السيارة.` });
  }
  items.push({
    id: "payment",
    q: "متى أدفع؟",
    a: "لا تدفع شيئاً قبل أن يؤكد لك المركز توفر القطع والموعد. والسعر يُثبَّت عند التأكيد ولا يتغير بعده.",
  });
  return items;
}
