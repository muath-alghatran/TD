/**
 * تسليم واتساب — بديل بوابة الدفع الوهمية. لا حساب/مفتاح API مطلوب:
 * رابط wa.me يفتح واتساب العميل برسالة جاهزة، هو يراجعها ويرسلها بنفسه.
 * ليس إرسالاً آلياً نيابة عن أحد — مجرد رابط مُعبّأ مسبقاً، كـ mailto:.
 */
import { dayRangeWord } from "./format";
import type { PromiseMode } from "./promise-engine";

/** بصيغة دولية بلا علامة + (متطلّب wa.me) — الرقم المحلي 0590478098 */
export const BUSINESS_WHATSAPP_NUMBER = "966590478098";

export function buildWhatsAppLink(message: string): string {
  return `https://wa.me/${BUSINESS_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * سطر الجيل في رسائل القطع (قاعدة 7). فارغ = لم يحدده العميل («لا أعرف» أو جيل بلا رمز)
 * فيُنبَّه المركز ليحدده من رقم الهيكل؛ undefined = لا سطر.
 */
export function generationLine(code: string | undefined): string | null {
  if (code === undefined) return null;
  return `الجيل: ${code || "يُحدَّد عند التأكيد من رقم الهيكل"}`;
}

export interface PartsOrderMessageInput {
  /** رمز الطلب للعميل (TD-…) — يربط المحادثة بالطلب في «طلباتي» */
  orderCode: string;
  vehicleLabel: string;
  /** فارغ حين لم يُدخله العميل */
  vin: string;
  /** رمز الجيل (XV70) — يحتاجه المركز لتأكيد التوافق؛ فارغ حين لا يُعرف */
  generationCode?: string;
  partName: string;
  /** الطرف والموضع — «يمين · فوق» */
  details: string;
  /** رقم القطعة حين تكون من مخزون المركز */
  oemNumber: string | null;
  /** اسم الجودة للعرض، أو null حين لم تُختر */
  tier: string | null;
  /** مصدر القطعة: مخزون المركز */
  fromStock: boolean;
  /** دفع فوري (حالة خضراء، قاعدة 11) — وإلا بلا دفع حتى يؤكد المركز */
  immediatePay: boolean;
  cityName: string;
  mode: PromiseMode;
  daysMin: number;
  daysMax: number;
  /** null = السعر عند التأكيد */
  total: number | null;
  /** سعر القائمة الاسترشادي — يُثبَّت عند التأكيد (قاعدة 15) */
  indicative: boolean;
  laborPending: boolean;
  notes: string;
}

/** رسالة طلب القطعة (المرحلة 6): الجيل والطرف والجودة والوعد بالمدى، وصياغة الدفع حسب الحالة */
export function buildPartsOrderMessage(input: PartsOrderMessageInput): string {
  const receiving = input.mode === "fit" ? "تركيب في المركز" : `توصيل إلى ${input.cityName}`;
  const labor = input.laborPending ? "، وأجرة التركيب تُضاف عند التأكيد" : "";
  const price =
    input.total === null
      ? "السعر: عند التأكيد"
      : input.indicative
        ? `الإجمالي التقديري: ${input.total.toFixed(2)} ريال — سعر استرشادي يُثبَّت عند التأكيد${labor}`
        : `الإجمالي: ${input.total.toFixed(2)} ريال${labor}`;
  return [
    "طلب قطعة غيار — Trust Drive",
    `رقم الطلب: ${input.orderCode}`,
    "",
    `السيارة: ${input.vehicleLabel}`,
    generationLine(input.generationCode),
    input.vin ? `رقم الهيكل: ${input.vin}` : null,
    `القطعة: ${input.partName}${input.details ? ` — ${input.details}` : ""}${input.oemNumber ? ` (${input.oemNumber})` : ""}`,
    input.tier ? `الجودة: ${input.tier}${input.fromStock ? " — من مخزون المركز" : ""}` : "الجودة: أرجو عرض الخيارات",
    `الاستلام: ${receiving}`,
    `الوعد: خلال ${dayRangeWord(input.daysMin, input.daysMax)} من الدفع`,
    price,
    input.notes ? `ملاحظات: ${input.notes}` : null,
    "",
    input.immediatePay
      ? "القطعة في مخزون المركز — أرسلوا لي رابط الدفع."
      : input.fromStock
        ? "أرجو تأكيد الشحن إلى مدينتي، ثم إرسال رابط الدفع."
        : "أرجو تأكيد التوفر والسعر، ثم إرسال رابط الدفع.",
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}
