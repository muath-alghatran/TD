/**
 * رسائل واتساب لطلبات الحجز والسطحة والمتابعة — نفس نهج whatsapp-checkout.ts:
 * رابط wa.me مُعبّأ مسبقاً يراجعه العميل ويرسله بنفسه، ثم يؤكَّد الطلب بشرياً.
 */
import { formatWholePrice, formatYearRange } from "./format";
import { orderCode, type LocalOrder } from "./orders";
import type { FaceliftPackage } from "./packages";
import { buildWhatsAppLink, generationLine } from "./whatsapp-checkout";

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
/** السيارة كما تصل المركز في رسائل القطع */
export interface PartRequestVehicle {
  label: string;
  generationCode?: string;
  /** فارغ حين لم يُدخله العميل */
  vin: string;
}

function vehicleLines(vehicle: PartRequestVehicle): (string | null)[] {
  return [`السيارة: ${vehicle.label}`, generationLine(vehicle.generationCode), vehicle.vin ? `رقم الهيكل: ${vehicle.vin}` : null];
}

/** «ما لقيت قطعتي» — يصل المركز النص كما كتبه العميل */
export function buildPartNotFoundMessage(input: { vehicle: PartRequestVehicle | null; searchText: string }): string {
  return [
    "أبحث عن قطعة — Trust Drive",
    "",
    ...(input.vehicle ? vehicleLines(input.vehicle) : []),
    `القطعة كما أعرفها: «${input.searchText}»`,
    "",
    "ما لقيتها في الموقع — أرجو المساعدة في إيجادها.",
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

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
  // طلب من قائمة الأسعار بلا رقم قطعة بعد — يحدده المركز عند التأكيد
  const part = order.partOem ? `${order.partName} (${order.partOem})` : order.partName;
  return [`استفسار عن طلب ${orderCode(order.id)} — Trust Drive`, `القطعة: ${part}`].join("\n");
}

export const HELLO_MESSAGE = "السلام عليكم، عندي استفسار — Trust Drive";
