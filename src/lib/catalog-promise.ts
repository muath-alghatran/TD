/**
 * أجزاء مدة الوعد لطلبات كامري القديمة فقط (المرحلة 5 سحبت بياناتها من مسار العميل):
 * «كيف حسبنا الموعد» في «تتبع الطلب» لطلب سُجّل قبل المرحلة 6. طلبات القطع الجديدة
 * تحمل أجزاء وعدها كما حُسبت عند الطلب (src/lib/part-promise.ts).
 */
import type { CatalogCity } from "./city-catalog";
import { DEFAULT_PROMISE_SETTINGS } from "./default-promise-settings";
import { promiseLegs, type PromiseLegs, type PromiseMode } from "./promise-engine";
import type { CatalogPart } from "./zone-catalog";

/** أجزاء مدة الوعد لقطعة من الكتالوج — لعرض «كيف حسبنا الموعد» في تتبع الطلب. */
export function catalogPartLegs(part: CatalogPart, city: CatalogCity, mode: PromiseMode): PromiseLegs {
  return promiseLegs(
    { stockInternal: part.stock ?? 0, supplierReliability: part.rel ?? 0 },
    { shipDaysMax: city.d, trustFactor: city.t },
    mode,
    DEFAULT_PROMISE_SETTINGS,
  );
}
