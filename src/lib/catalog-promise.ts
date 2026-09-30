import type { CatalogCity } from "./city-catalog";
import { DEFAULT_PROMISE_SETTINGS } from "./default-promise-settings";
import {
  calcPromise,
  promiseLegs,
  type PromiseLegs,
  type PromiseMode,
  type PromiseResult,
  type PromiseStatus,
} from "./promise-engine";
import type { CatalogPart, CatalogZone } from "./zone-catalog";

/** يهيّئ بيانات الكتالوج (oem/n/g/stock/rel...) لشكل calcPromise (stockInternal/supplierReliability...). */
export function catalogPartPromise(part: CatalogPart, city: CatalogCity, mode: PromiseMode): PromiseResult {
  return calcPromise(
    { stockInternal: part.stock ?? 0, supplierReliability: part.rel ?? 0 },
    { shipDaysMax: city.d, trustFactor: city.t },
    mode,
    DEFAULT_PROMISE_SETTINGS,
  );
}

/** مطابقة zState() في docs/prototype-parts.html: أعلى ثقة بين القطع المغطاة يحدد لون المنطقة. */
export function zoneStatus(zone: Pick<CatalogZone, "parts">, city: CatalogCity): PromiseStatus {
  const covered = zone.parts.filter((p) => p.avail !== false);
  if (covered.length === 0) return "spec";
  const bestConfidence = Math.max(...covered.map((p) => catalogPartPromise(p, city, "ship").confidence));
  if (bestConfidence >= DEFAULT_PROMISE_SETTINGS.hiConf) return "ok";
  if (bestConfidence >= DEFAULT_PROMISE_SETTINGS.midConf) return "wait";
  return "spec";
}

/** أجزاء مدة الوعد لقطعة من الكتالوج — لعرض «كيف حسبنا الموعد» في تتبع الطلب. */
export function catalogPartLegs(part: CatalogPart, city: CatalogCity, mode: PromiseMode): PromiseLegs {
  return promiseLegs(
    { stockInternal: part.stock ?? 0, supplierReliability: part.rel ?? 0 },
    { shipDaysMax: city.d, trustFactor: city.t },
    mode,
    DEFAULT_PROMISE_SETTINGS,
  );
}
