/**
 * تسليم واتساب — بديل بوابة الدفع الوهمية. لا حساب/مفتاح API مطلوب:
 * رابط wa.me يفتح واتساب العميل برسالة جاهزة، هو يراجعها ويرسلها بنفسه.
 * ليس إرسالاً آلياً نيابة عن أحد — مجرد رابط مُعبّأ مسبقاً، كـ mailto:.
 */
import { toArabicDigits } from "./format";
import type { PromiseMode } from "./promise-engine";

/** بصيغة دولية بلا علامة + (متطلّب wa.me) — الرقم المحلي 0590478098 */
export const BUSINESS_WHATSAPP_NUMBER = "966590478098";

export function buildWhatsAppLink(message: string): string {
  return `https://wa.me/${BUSINESS_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export interface PartsOrderMessageInput {
  vehicleLabel: string;
  partName: string;
  partOem: string;
  cityName: string;
  mode: PromiseMode;
  days: number;
  confidence: number;
  total: number;
}

export function buildPartsOrderMessage(input: PartsOrderMessageInput): string {
  const receiving = input.mode === "fit" ? "تركيب في المركز" : `توصيل إلى ${input.cityName}`;
  const confidencePercent = toArabicDigits(Math.round(input.confidence * 100));
  return [
    "طلب قطعة غيار — Trust Drive",
    "",
    `السيارة: ${input.vehicleLabel}`,
    `القطعة: ${input.partName} (${input.partOem})`,
    `الاستلام: ${receiving}`,
    `الوعد: خلال ${toArabicDigits(input.days)} يوم — ${confidencePercent}٪ ثقة`,
    `الإجمالي: ${input.total.toFixed(2)} ريال`,
    "",
    "أرغب بتأكيد هذا الطلب.",
  ].join("\n");
}
