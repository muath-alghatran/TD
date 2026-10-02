"use server";

/**
 * تحقق خادمي من عرض القطعة قبل إنشاء الطلب — قاعدة 18 وdocs/payment-spec.md §8: «السعر
 * يُعاد التحقق منه في الخادم». لا يثق بأي سعر أو وعد قادم من العميل: يعيد اشتقاق الخيار
 * (مخزون هوندا أو قائمة الأسعار) والسعر والوعد من بيانات الخادم (المرحلة 6).
 */
import { CITIES } from "@/lib/city-catalog";
import { offerPricing, offerPromise, partOptions, type OfferPricing, type OfferPromise, type PartOption, type PartVehicle } from "@/lib/part-promise";
import { findPartType } from "@/lib/parts-offer";
import type { PromiseMode } from "@/lib/promise-engine";

export interface VerifiedOffer {
  partKey: string;
  partName: string;
  /** null حين لم تُختر جودة — يعرض المركز الخيارات عند التأكيد */
  option: PartOption | null;
  cityName: string;
  mode: PromiseMode;
  pricing: OfferPricing;
  promise: OfferPromise;
}

export async function verifyPartOffer(input: {
  vehicle: PartVehicle;
  partKey: string;
  optionId: string | null;
  cityName: string;
  mode: PromiseMode;
}): Promise<VerifiedOffer | null> {
  const type = findPartType(input.partKey);
  if (!type) return null;
  const city = CITIES.find((c) => c.n === input.cityName) ?? CITIES[0];
  const mode: PromiseMode = input.mode === "fit" ? "fit" : "ship";
  const option = input.optionId ? (partOptions(input.vehicle, type.key).find((o) => o.id === input.optionId) ?? null) : null;
  return {
    partKey: type.key,
    partName: type.name,
    option,
    cityName: city.n,
    mode,
    pricing: offerPricing(option, city, mode),
    promise: offerPromise(option, city, mode),
  };
}
