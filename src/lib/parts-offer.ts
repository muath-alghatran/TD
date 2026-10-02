/**
 * عرض القطعة للعميل (المرحلة 5): خيارات الجودة بأسعار القائمة الاسترشادية، والضريبة،
 * وحالة التوفر، ورسالة الطلب. القطع لكل الماركات بالأسعار نفسها (قرار المالك)،
 * والتوافق الدقيق مع السيارة يتأكد عند التأكيد.
 */
import { PART_TYPES } from "./parts-dictionary";
import { PART_PRICES } from "./parts-prices";
import { PART_CATEGORIES, QUALITY_TIERS, UNSPECIFIED_TIER, type PartType, type QualityTier } from "./parts-schema";
import type { PromiseStatus } from "./promise-engine";
import { PRICING_SETTINGS } from "./pricing-settings";

export * from "./parts-schema";
export { PART_TYPES };

/** كم خياراً يظهر جنباً إلى جنب قبل «المزيد» */
export const VISIBLE_TIERS = 3;

export interface QualityOption {
  tier: QualityTier;
  /** السعر المعروض شاملاً الضريبة، أو null حين تُخفى الأسعار */
  price: number | null;
}

interface PriceSettings {
  showListPrices: boolean;
  listPricesIncludeVat: boolean;
  vatRate: number;
}

const byKey = new Map(PART_TYPES.map((t) => [t.key, t]));

export function findPartType(key: string): PartType | undefined {
  return byKey.get(key);
}

export function categoryName(key: PartType["category"]): string {
  return PART_CATEGORIES.find((c) => c.key === key)?.name ?? key;
}

/**
 * السعر كما يُعرض للمستهلك: شامل الضريبة إلزاماً. أسعار القائمة غير شاملة حتى يؤكد
 * المركز العكس، فتُضاف النسبة من الإعدادات. null حين يُطفأ «عرض الأسعار الاسترشادية».
 */
export function displayPrice(listPrice: number, settings: PriceSettings = PRICING_SETTINGS): number | null {
  if (!settings.showListPrices) return null;
  const withVat = settings.listPricesIncludeVat ? listPrice : listPrice * (1 + settings.vatRate);
  return Math.round(withVat * 100) / 100;
}

/** خيارات الجودة المتوفرة للنوع بترتيب العرض — فارغة للأنواع الشائعة بلا سعر */
export function qualityOptions(key: string, settings: PriceSettings = PRICING_SETTINGS): QualityOption[] {
  return PART_PRICES.filter((p) => p.key === key)
    .sort((a, b) => QUALITY_TIERS.indexOf(a.tier) - QUALITY_TIERS.indexOf(b.tier))
    .map((p) => ({ tier: p.tier, price: displayPrice(p.price, settings) }));
}

/** أقل سعر معروض للنوع — «من 30 ر.س» — أو null */
export function fromPrice(key: string, settings: PriceSettings = PRICING_SETTINGS): number | null {
  const prices = qualityOptions(key, settings)
    .map((o) => o.price)
    .filter((p): p is number => p !== null);
  return prices.length > 0 ? Math.min(...prices) : null;
}

/** اسم الجودة للعرض — «غير محدد» يقول ما سيحدث بدل ما لا نعرفه */
export function tierLabel(tier: QualityTier): string {
  return tier === UNSPECIFIED_TIER ? "الجودة تُحدَّد عند التأكيد" : tier;
}

/**
 * حالة التوفر في مسار القطع. لا أخضر قبل مخزون وسعر حقيقيين (البرومت 0-6): كل نوع
 * لكل ماركة «بانتظار التأكيد» — بلا دفع حتى يؤكد المركز (قاعدة 11). مخزون هوندا في المرحلة 6.
 */
export function partAvailability(_make: string, _key: string): PromiseStatus {
  return "spec";
}

