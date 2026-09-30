/**
 * رسائل واتساب لطلبات الحجز والسطحة والمتابعة — نفس نهج whatsapp-checkout.ts:
 * رابط wa.me مُعبّأ مسبقاً يراجعه العميل ويرسله بنفسه، ثم يؤكَّد الطلب بشرياً.
 */
import { orderCode, type LocalOrder } from "./orders";
import { buildWhatsAppLink } from "./whatsapp-checkout";

export { buildWhatsAppLink };

export function buildBookingMessage(input: {
  vehicle: string;
  dayLabel: string;
  time: string;
  notes: string;
}): string {
  return [
    "طلب حجز موعد فحص — Trust Drive",
    "",
    `السيارة: ${input.vehicle || "—"}`,
    `اليوم: ${input.dayLabel}`,
    `الساعة المقترحة: ${input.time}`,
    input.notes ? `الملاحظات: ${input.notes}` : null,
    "",
    "أرجو تأكيد الموعد.",
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

export function buildTowMessage(input: {
  vehicle: string;
  locationText: string;
  mapLink: string | null;
  notes: string;
}): string {
  return [
    "طلب سطحة — Trust Drive",
    "",
    `السيارة: ${input.vehicle || "—"}`,
    `الموقع: ${input.locationText || "—"}`,
    input.mapLink ? `الموقع على الخريطة: ${input.mapLink}` : null,
    input.notes ? `المشكلة: ${input.notes}` : null,
    "",
    "أفهم أن السطحة مجانية عند موافقتي على السعر بعد الفحص.",
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

export function buildOrderFollowUpMessage(order: LocalOrder): string {
  return [`استفسار عن طلب ${orderCode(order.id)} — Trust Drive`, `القطعة: ${order.partName} (${order.partOem})`].join("\n");
}

export const HELLO_MESSAGE = "السلام عليكم، عندي استفسار — Trust Drive";
