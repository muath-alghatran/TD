/**
 * نصوص رسائل واتساب — نص جاهز للنسخ، لا إرسال فعلي.
 *
 * TODO(واتساب حقيقي): استبدل بـ WhatsApp Business API حين يتوفر حساب.
 * لا حساب متاح الآن، فهذا Mock موثّق بنفس نهج ocr.ts/payment.ts.
 */
import type { LocalOrder } from "./orders";

/** الرسالة إلى المندوب — تأكيد التوفر قبل الشراء (docs/payment-spec.md §4 خطوة 5) */
export function buildSupplierMessage(order: LocalOrder): string {
  return [
    `طلب تأكيد توفر — Trust Drive`,
    `رقم OEM: ${order.partOem}`,
    `القطعة: ${order.partName}`,
    `الكمية: 1`,
    `المدينة: ${order.cityName}`,
    `يُرجى تأكيد التوفر والسعر خلال 24 ساعة.`,
  ].join("\n");
}

/** رسالة العميل بعد تأكيد التوفر — تتضمن رابط الدفع (docs/payment-spec.md §4 خطوة 6أ) */
export function buildCustomerConfirmedMessage(order: LocalOrder, payUrl: string): string {
  return [
    `أكّدنا التوفر — ${order.partName}`,
    `السعر: ${order.totalPrice.toFixed(2)} ريال`,
    `رابط الدفع صالح 12 ساعة: ${payUrl}`,
  ].join("\n");
}

/** رسالة العميل عند عدم التوفر (docs/payment-spec.md §4 خطوة 6ب) */
export function buildCustomerUnavailableMessage(order: LocalOrder): string {
  return `لم تتوفر ${order.partName} — سجّلناها في قائمة الطلب المفقود وسنبلغك فور توفرها.`;
}
