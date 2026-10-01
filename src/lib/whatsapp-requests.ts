/**
 * رسائل واتساب لطلبات الحجز والسطحة والمتابعة — نفس نهج whatsapp-checkout.ts:
 * رابط wa.me مُعبّأ مسبقاً يراجعه العميل ويرسله بنفسه، ثم يؤكَّد الطلب بشرياً.
 */
import { formatWholePrice, formatYearRange } from "./format";
import { orderCode, type LocalOrder } from "./orders";
import type { FaceliftPackage } from "./packages";
import { buildWhatsAppLink } from "./whatsapp-checkout";

export { buildWhatsAppLink };

/** «ترهيم لاندكروزر ٢٠٠٨–٢٠١٥» — اسم الباقة بسنواتها للرسائل والحجز */
export function packageLabel(pkg: FaceliftPackage): string {
  return `${pkg.title} ${formatYearRange(pkg.yearFrom, pkg.yearTo)}`;
}

export function buildBookingMessage(input: {
  vehicle: string;
  dayLabel: string;
  time: string;
  notes: string;
  /** مثل «معاينة باقة ترهيم لاندكروزر ٢٠٠٨–٢٠١٥» — حين يأتي الحجز من صفحة باقة */
  service?: string;
}): string {
  return [
    input.service ? "طلب حجز معاينة — Trust Drive" : "طلب حجز موعد فحص — Trust Drive",
    "",
    input.service ? `الخدمة: ${input.service}` : null,
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

/** «اسأل على واتساب» من صفحة الباقة: اسمها وسعرها، ويكمل العميل سنة سيارته */
export function buildPackageQuestionMessage(pkg: FaceliftPackage): string {
  return [
    "استفسار عن باقة ترهيم — Trust Drive",
    "",
    `الباقة: ${packageLabel(pkg)}`,
    `السعر المعلن: ${formatWholePrice(pkg.price)} ر.س`,
    "سنة سيارتي: ",
  ].join("\n");
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

/** سيارة ليست في قائمة الموقع — يكمل العميل طلبه على واتساب ويكتب القطعة بنفسه */
export function buildVehicleNotListedMessage(vehicleText: string): string {
  return [
    "طلب قطعة غيار — Trust Drive",
    "",
    `السيارة: ${vehicleText}`,
    "(سيارتي غير موجودة في قائمة الموقع)",
    "القطعة المطلوبة: ",
  ].join("\n");
}

export function buildOrderFollowUpMessage(order: LocalOrder): string {
  return [`استفسار عن طلب ${orderCode(order.id)} — Trust Drive`, `القطعة: ${order.partName} (${order.partOem})`].join("\n");
}

export const HELLO_MESSAGE = "السلام عليكم، عندي استفسار — Trust Drive";
