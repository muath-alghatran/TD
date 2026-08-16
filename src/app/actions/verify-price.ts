"use server";

/**
 * تحقق سعر خادمي — docs/payment-spec.md §8: "السعر يُعاد التحقق منه في
 * الخادم" قبل أي دفع. لا يثق بأي سعر/وعد قادم من العميل — يعيد اشتقاق
 * كل شيء من src/lib/zone-catalog.ts خادمياً.
 */
import { catalogPartPromise } from "@/lib/catalog-promise";
import { CITIES } from "@/lib/city-catalog";
import type { PromiseMode, PromiseStatus } from "@/lib/promise-engine";
import { PRICING_SETTINGS } from "@/lib/pricing-settings";
import { ZONES } from "@/lib/zone-catalog";

export interface VerifiedPrice {
  oem: string;
  partName: string;
  unitPrice: number;
  laborCost: number;
  discount: number;
  shipCost: number;
  total: number;
  days: number;
  confidence: number;
  status: PromiseStatus;
}

export async function verifyPrice(input: {
  oem: string;
  cityName: string;
  mode: PromiseMode;
}): Promise<VerifiedPrice | null> {
  const part = ZONES.flatMap((zone) => zone.parts).find((p) => p.oem === input.oem);
  if (!part || part.avail === false) return null;

  const city = CITIES.find((c) => c.n === input.cityName) ?? CITIES[0];
  const result = catalogPartPromise(part, city, input.mode);

  const laborCost = input.mode === "fit" ? (part.hrs ?? 0) * PRICING_SETTINGS.hourRate : 0;
  const discount = laborCost * PRICING_SETTINGS.fitDiscount;
  const shipCost = input.mode === "fit" ? 0 : city.c;
  const unitPrice = part.price ?? 0;
  const total = unitPrice + shipCost + laborCost - discount;

  return {
    oem: part.oem,
    partName: part.n,
    unitPrice,
    laborCost,
    discount,
    shipCost,
    total,
    days: result.days,
    confidence: result.confidence,
    status: result.status,
  };
}
