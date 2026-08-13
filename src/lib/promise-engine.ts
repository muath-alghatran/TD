/**
 * محرك الوعد — وحدة نقية مطابقة تماماً لدالة calc() في docs/prototype-parts.html
 * ولورقة 06 في docs/parts-master.xlsx.
 *
 * كل الثوابت تُقرأ من جدول Setting (docs/CLAUDE.md قاعدة 4) — لا شيء مكتوب هنا كرقم ثابت.
 * المتصل (Server Action / API route لاحقاً) يقرأ Setting ويبني PromiseSettings ثم يمرّره.
 */

export type PromiseMode = "ship" | "fit";
export type PromiseStatus = "ok" | "wait" | "spec";

export interface PromisePart {
  /** الكمية في مخزون TD الداخلي */
  stockInternal: number;
  /** نسبة التزام المورد (0-1) */
  supplierReliability: number;
}

export interface PromiseCity {
  /** أقصى أيام شحن للمدينة */
  shipDaysMax: number;
  /** معامل ثقة أداء الشحن للمدينة (0-1) */
  trustFactor: number;
}

export interface PromiseSettings {
  /** حد الثقة العالية — أعلى منه أو يساويه = أخضر */
  hiConf: number;
  /** حد الثقة المتوسطة — أعلى منه أو يساويه = أصفر، وإلا رمادي */
  midConf: number;
  /** عتبة موثوقية المورد */
  reliableSupplierThreshold: number;
  /** أيام تجهيز عند مندوب موثوق */
  reliablePrepDays: number;
  /** أيام تجهيز الطلب الخاص */
  specialPrepDays: number;
  /** يوم تركيب إضافي */
  fitDays: number;
  /** ثقة المخزون الداخلي */
  internalStockConfidence: number;
  /** ثقة أساس المورد الضعيف */
  weakSupplierBaseConfidence: number;
}

export interface PromiseResult {
  days: number;
  confidence: number;
  status: PromiseStatus;
}

export function calcPromise(
  part: PromisePart,
  city: PromiseCity,
  mode: PromiseMode,
  settings: PromiseSettings,
): PromiseResult {
  const prepDays =
    part.stockInternal > 0
      ? 0
      : part.supplierReliability >= settings.reliableSupplierThreshold
        ? settings.reliablePrepDays
        : settings.specialPrepDays;

  const shipDays = mode === "fit" ? 0 : city.shipDaysMax;
  const fitDays = mode === "fit" ? settings.fitDays : 0;
  const days = Math.max(1, prepDays + shipDays + fitDays);

  const base =
    part.stockInternal > 0
      ? settings.internalStockConfidence
      : part.supplierReliability >= settings.reliableSupplierThreshold
        ? part.supplierReliability
        : settings.weakSupplierBaseConfidence;

  const confidence = base * (mode === "fit" ? 1 : city.trustFactor);

  const status: PromiseStatus =
    confidence >= settings.hiConf ? "ok" : confidence >= settings.midConf ? "wait" : "spec";

  return { days, confidence, status };
}
