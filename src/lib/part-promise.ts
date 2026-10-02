/**
 * عرض قطعة لسيارة ومدينة (المرحلة 6، برومت أكتوبر ٢٠٢٦) — مصدر واحد للبطاقة ونموذج الطلب
 * والتحقق الخادمي (قاعدة 18):
 *  · هوندا: صف في مخزون المركز يطابق جيل السيارة وموديلها وبكمية > 0 = أخضر ودفع فوري
 *    (قاعدة 11) بسعره الحقيقي من الملف، ووعده من calcPromise (تجهيز صفر).
 *  · غيره (كل الماركات، وقطع هوندا خارج المخزون): أسعار القائمة الاسترشادية ووعد التوريد
 *    بمدى «3–4 أيام» كهرماني — بلا دفع حتى يؤكد المركز (قواعد 11 و14 و15).
 */
import { CENTER } from "./center-info";
import type { CatalogCity } from "./city-catalog";
import { DEFAULT_PROMISE_SETTINGS } from "./default-promise-settings";
import { HONDA_INVENTORY } from "./honda-inventory";
import type { StockItem } from "./inventory-schema";
import { qualityOptions } from "./parts-offer";
import { QUALITY_TIERS, type QualityTier } from "./parts-schema";
import { PRICING_SETTINGS } from "./pricing-settings";
import {
  calcPromise,
  calcSupplyRangePromise,
  supplyRangeLegs,
  type PromiseMode,
  type PromiseRangeResult,
  type PromiseSettings,
  type PromiseStatus,
} from "./promise-engine";

/** الماركة التي يملك المركز مخزونها (قرار المالك) */
export const STOCK_MAKE = "هوندا";

export interface PartVehicle {
  make: string;
  model: string;
  /** فارغ حين لا يُعرف — فلا تطابق مع المخزون ويحدده المركز */
  generationCode: string;
}

export interface PartOption {
  /** معرّف ثابت للاختيار عبر العميل والخادم: «stock:<رقم>:<جودة>» أو «list:<جودة>» */
  id: string;
  kind: "stock" | "list";
  tier: QualityTier;
  /** السعر المعروض: الحقيقي للمخزون، والاسترشادي شاملاً الضريبة للقائمة — أو null حين يُخفى */
  price: number | null;
  stockQty: number;
  oemNumber: string | null;
  name: string | null;
  origin: string | null;
  warrantyMonths: number | null;
  laborHours: number | null;
}

/** صفوف المخزون المتوفرة لنوع وسيارة — هوندا بجيل معروف فقط */
export function stockFor(vehicle: PartVehicle, key: string, inventory: readonly StockItem[] = HONDA_INVENTORY): StockItem[] {
  if (vehicle.make !== STOCK_MAKE || !vehicle.generationCode) return [];
  return inventory.filter(
    (item) => item.partKey === key && item.generationCode === vehicle.generationCode && item.model === vehicle.model && item.stockQty > 0,
  );
}

/** الخيارات بترتيب العرض: المخزون أولاً، ثم أسعار القائمة للجودات التي لا يغطيها المخزون */
export function partOptions(vehicle: PartVehicle, key: string, inventory: readonly StockItem[] = HONDA_INVENTORY): PartOption[] {
  const byTier = (a: { tier: QualityTier }, b: { tier: QualityTier }) => QUALITY_TIERS.indexOf(a.tier) - QUALITY_TIERS.indexOf(b.tier);
  const stock = stockFor(vehicle, key, inventory).sort(byTier);
  const covered = new Set(stock.map((s) => s.tier));
  return [
    ...stock.map(
      (s): PartOption => ({
        id: `stock:${s.oemNumber}:${s.tier}`,
        kind: "stock",
        tier: s.tier,
        price: s.price,
        stockQty: s.stockQty,
        oemNumber: s.oemNumber,
        name: s.name,
        origin: s.origin || null,
        warrantyMonths: s.warrantyMonths,
        laborHours: s.laborHours,
      }),
    ),
    ...qualityOptions(key)
      .filter((o) => !covered.has(o.tier))
      .map(
        (o): PartOption => ({
          id: `list:${o.tier}`,
          kind: "list",
          tier: o.tier,
          price: o.price,
          stockQty: 0,
          oemNumber: null,
          name: null,
          origin: null,
          warrantyMonths: null,
          laborHours: null,
        }),
      ),
  ];
}

/**
 * حالة النوع لسيارة. لا أخضر قبل مخزون وسعر حقيقيين (البرومت 0-6): أخضر فقط بمخزون هوندا
 * المطابق، وإلا كهرماني بوعد التوريد.
 */
export function partStatus(vehicle: PartVehicle, key: string, inventory: readonly StockItem[] = HONDA_INVENTORY): PromiseStatus {
  return stockFor(vehicle, key, inventory).length > 0 ? "ok" : "wait";
}

/** مدينة المركز: الاستلام أو التوصيل فيها داخل مدى «3–4 أيام» (قرار المالك) */
export function isCenterCity(city: CatalogCity): boolean {
  return city.n === CENTER.city;
}

export interface PromiseLegView {
  label: string;
  daysMin: number;
  daysMax: number;
}

export interface OfferPromise extends PromiseRangeResult {
  legs: PromiseLegView[];
}

/** الوعد لخيار ومدينة وطريقة استلام — من المخزون أو بمدى التوريد */
export function offerPromise(
  option: Pick<PartOption, "kind" | "stockQty"> | null,
  city: CatalogCity,
  mode: PromiseMode,
  settings: PromiseSettings = DEFAULT_PROMISE_SETTINGS,
): OfferPromise {
  if (option?.kind === "stock") {
    const r = calcPromise({ stockInternal: option.stockQty, supplierReliability: 0 }, { shipDaysMax: city.d, trustFactor: city.t }, mode, settings);
    const handover = mode === "fit" ? { label: "التركيب في المركز", days: settings.fitDays } : { label: `الشحن إلى ${city.n}`, days: city.d };
    return {
      ...r,
      daysMin: r.days,
      legs: [
        { label: "من مخزون المركز", daysMin: 0, daysMax: 0 },
        { label: handover.label, daysMin: handover.days, daysMax: handover.days },
      ],
    };
  }
  const promiseCity = { shipDaysMax: isCenterCity(city) ? 0 : city.d, trustFactor: city.t };
  const r = calcSupplyRangePromise(promiseCity, mode, settings);
  const legs = supplyRangeLegs(promiseCity, mode, settings);
  const supplyLabel = mode === "fit" ? "التوريد والتركيب في المركز" : isCenterCity(city) ? `التوريد إلى ${CENTER.city}` : "التوريد";
  return {
    ...r,
    legs: [
      { label: supplyLabel, daysMin: legs.supplyMinDays, daysMax: legs.supplyMaxDays },
      ...(legs.shipDays > 0 ? [{ label: `الشحن إلى ${city.n}`, daysMin: legs.shipDays, daysMax: legs.shipDays }] : []),
    ],
  };
}

export interface OfferPricing {
  /** null حين لا سعر بعد (نوع بلا سعر، أو الأسعار مخفية، أو لم تُختر جودة) */
  unitPrice: number | null;
  /** null = أجرة التركيب تُحدَّد عند التأكيد */
  laborCost: number | null;
  discount: number;
  shipCost: number;
  /** القطعة + الشحن + التركيب − الخصم، بما هو معروف منها — أو null بلا سعر للقطعة */
  total: number | null;
  /** سعر القائمة الاسترشادي — يُثبَّت عند التأكيد (قاعدة 15) */
  indicative: boolean;
}

const round = (v: number) => Math.round(v * 100) / 100;

export function offerPricing(
  option: Pick<PartOption, "kind" | "price" | "laborHours"> | null,
  city: CatalogCity,
  mode: PromiseMode,
  settings = PRICING_SETTINGS,
): OfferPricing {
  const unitPrice = option?.price ?? null;
  const shipCost = mode === "ship" ? city.c : 0;
  const laborCost = mode === "fit" ? (option?.laborHours != null ? round(option.laborHours * settings.hourRate) : null) : 0;
  const discount = laborCost ? round(laborCost * settings.fitDiscount) : 0;
  const total = unitPrice === null ? null : round(unitPrice + shipCost + (laborCost ?? 0) - discount);
  return { unitPrice, laborCost, discount, shipCost, total, indicative: option?.kind !== "stock" };
}
