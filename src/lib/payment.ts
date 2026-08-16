/**
 * الدفع — واجهة نظيفة خلف تنفيذ Mock حالياً.
 *
 * TODO(بوابة دفع حقيقية): استبدل بمزوّد فعلي (Moyasar/HyperPay/Tap) حين
 * يتوفر حساب تجاري ومفتاح API — راجع docs/payment-spec.md §7. الشكل
 * (PaymentResult) لن يتغير، فالمكوّنات المستهلكة لن تحتاج تعديلاً.
 *
 * لا حجز/Authorization هنا إطلاقاً — يُستدعى فقط للحالة الخضراء (دفع
 * فوري كامل). الأصفر والرمادي لا يصلان لهذه الدالة إطلاقاً، حسب
 * docs/payment-spec.md v3.0 و docs/CLAUDE.md قواعد الدفع 10-20.
 */

export interface PaymentResult {
  success: true;
  capturedAt: string;
  /** مفتاح تفرّد لمنع الخصم المزدوج — docs/CLAUDE.md قاعدة 20 */
  idempotencyKey: string;
}

export async function capturePaymentMock(_amount: number): Promise<PaymentResult> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return {
    success: true,
    capturedAt: new Date().toISOString(),
    idempotencyKey: crypto.randomUUID(),
  };
}
