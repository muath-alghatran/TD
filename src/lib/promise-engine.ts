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
  /** أدنى أيام التوريد للماركات بلا مخزون لدى المركز (المرحلة 6) */
  supplyMinDays: number;
  /** أقصى أيام التوريد للماركات بلا مخزون لدى المركز */
  supplyMaxDays: number;
  /** ثقة وعد التوريد — داخل الكهرماني */
  supplyConfidence: number;
}

export interface PromiseResult {
  days: number;
  confidence: number;
  status: PromiseStatus;
}

/** أجزاء المدة التي يتكوّن منها الوعد — تُعرض للعميل في «كيف حسبنا الموعد» */
export interface PromiseLegs {
  /** تجهيز القطعة: 0 من المخزون الداخلي، وإلا حسب موثوقية المورد */
  prepDays: number;
  /** الشحن إلى المدينة — صفر عند التركيب في المركز */
  shipDays: number;
  /** يوم التركيب في المركز — صفر عند التوصيل */
  fitDays: number;
}

export function promiseLegs(
  part: PromisePart,
  city: PromiseCity,
  mode: PromiseMode,
  settings: PromiseSettings,
): PromiseLegs {
  const prepDays =
    part.stockInternal > 0
      ? 0
      : part.supplierReliability >= settings.reliableSupplierThreshold
        ? settings.reliablePrepDays
        : settings.specialPrepDays;

  return {
    prepDays,
    shipDays: mode === "fit" ? 0 : city.shipDaysMax,
    fitDays: mode === "fit" ? settings.fitDays : 0,
  };
}

export function calcPromise(
  part: PromisePart,
  city: PromiseCity,
  mode: PromiseMode,
  settings: PromiseSettings,
): PromiseResult {
  const { prepDays, shipDays, fitDays } = promiseLegs(part, city, mode, settings);
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

/**
 * ── وعد المدى (المرحلة 6، برومت أكتوبر ٢٠٢٦) ──
 * للماركات التي لا مخزون لها لدى المركز (وقطع هوندا خارج ملف المخزون): توريد بمدى
 * [أدنى–أقصى] من الإعدادات. قرار المالك: المدى يشمل التركيب في المركز والاستلام في
 * مدينة المركز — فلا يوم تركيب إضافي، والمتصل يمرر shipDaysMax = 0 لمدينة المركز —
 * ويُضاف الشحن فقط للمدن الأخرى. الأيام تُحسب من الدفع (قاعدة 13).
 * لا يغيّر calcPromise ولا سياسة التعويض.
 */
export interface PromiseRangeResult extends PromiseResult {
  /** الحد الأدنى للأيام — و`days` هو الحد الأعلى (الموعد = الدفع + الأعلى) */
  daysMin: number;
}

export interface SupplyRangeLegs {
  supplyMinDays: number;
  supplyMaxDays: number;
  /** الشحن إلى مدينة العميل — صفر للتركيب ولمدينة المركز */
  shipDays: number;
}

export function supplyRangeLegs(city: PromiseCity, mode: PromiseMode, settings: PromiseSettings): SupplyRangeLegs {
  return {
    supplyMinDays: settings.supplyMinDays,
    supplyMaxDays: settings.supplyMaxDays,
    shipDays: mode === "fit" ? 0 : city.shipDaysMax,
  };
}

export function calcSupplyRangePromise(city: PromiseCity, mode: PromiseMode, settings: PromiseSettings): PromiseRangeResult {
  const legs = supplyRangeLegs(city, mode, settings);
  // يوم واحد على الأقل كـcalcPromise، والأعلى لا ينزل عن الأدنى حتى لو أُخطئ في الإعدادات
  const daysMin = Math.max(1, legs.supplyMinDays + legs.shipDays);
  return {
    daysMin,
    days: Math.max(daysMin, legs.supplyMaxDays + legs.shipDays),
    // معامل ثقة المدينة للشحن كالوعد الحالي، والتركيب داخل المركز يلغيه
    confidence: settings.supplyConfidence * (mode === "fit" ? 1 : city.trustFactor),
    // كهرماني دائماً (البرومت): لا أخضر ولا دفع فوري قبل تأكيد المركز (قاعدة 11)
    status: "wait",
  };
}
