/**
 * رسائل واتساب لطلبات الحجز والسطحة والمتابعة — نفس نهج whatsapp-checkout.ts:
 * رابط wa.me مُعبّأ مسبقاً يراجعه العميل ويرسله بنفسه، ثم يؤكَّد الطلب بشرياً.
 */
import { formatListPrice, formatWholePrice, formatYearRange } from "./format";
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

/**
 * «اطلب عبر واتساب» من بطاقة القطعة (المرحلة 5): النوع وطرفه والجودة المختارة وسعرها
 * الاسترشادي — والمركز يؤكد التوفر والسعر والموعد قبل أي دفع (قواعد 11 و14 و15).
 */
export function buildPartRequestMessage(input: {
  vehicle: PartRequestVehicle;
  partName: string;
  /** «يمين» · «فوق» … */
  details: string[];
  /** اسم الجودة للعرض، أو null حين لم يختر */
  tier: string | null;
  /** السعر المعروض شاملاً الضريبة، أو null */
  price: number | null;
}): string {
  const detail = input.details.filter(Boolean).join(" · ");
  return [
    "طلب قطعة غيار — Trust Drive",
    "",
    ...vehicleLines(input.vehicle),
    `القطعة: ${input.partName}${detail ? ` — ${detail}` : ""}`,
    input.tier ? `الجودة: ${input.tier}` : "الجودة: أرجو عرض الخيارات المتوفرة",
    input.price !== null ? `السعر الاسترشادي: ${formatListPrice(input.price)} ر.س شامل الضريبة` : "السعر: عند التأكيد",
    "",
    "أرجو تأكيد التوفر والسعر والموعد قبل أي دفع.",
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
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
  return [`استفسار عن طلب ${orderCode(order.id)} — Trust Drive`, `القطعة: ${order.partName} (${order.partOem})`].join("\n");
}

export const HELLO_MESSAGE = "السلام عليكم، عندي استفسار — Trust Drive";
