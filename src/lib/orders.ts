/**
 * سجل الطلبات المحلي — بنفس نهج garage.ts/demand-gap.ts. الحقول تطابق
 * أسماء نموذج Order في prisma/schema.prisma حرفياً، ليكون الاستبدال
 * بكتابة Prisma فعلية عبر Server Action لاحقاً تغييراً في ملف واحد.
 *
 * قاعدة حرجة (docs/CLAUDE.md، docs/payment-spec.md §4): عدّاد الوعد
 * يبدأ من paidAt لا من requestedAt. كل الطلبات تُنشأ بحالة "requested" وتُسلَّم
 * عبر واتساب (src/lib/whatsapp-checkout.ts) — التأكيد والدفع يحدثان بمحادثة
 * بشرية خارج التطبيق، ثم تُحدَّث الحالة يدوياً من /admin/orders.
 */

const STORAGE_KEY = "td-orders-local";

export type OrderStatus = "requested" | "confirmed" | "unavailable" | "paid";

export interface LocalOrder {
  id: string;
  vehicleVin: string;
  partOem: string;
  partName: string;
  cityName: string;
  mode: "ship" | "fit";
  status: OrderStatus;
  promisedDays: number;
  confidenceAtOrder: number;
  totalPrice: number;
  requestedAt: string;
  confirmedAt: string | null;
  paymentLinkExpiresAt: string | null;
  paidAt: string | null;
  /** أيام التسليم الفعلية — لمقارنة الوعد مقابل الفعل، تُسجَّل يدوياً من لوحة التحكم */
  actualDays: number | null;
}

export function listLocalOrders(): LocalOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LocalOrder[]) : [];
  } catch {
    return [];
  }
}

export function getLocalOrder(id: string): LocalOrder | null {
  return listLocalOrders().find((o) => o.id === id) ?? null;
}

export function createLocalOrder(
  order: Omit<LocalOrder, "id" | "requestedAt" | "confirmedAt" | "paymentLinkExpiresAt" | "actualDays">,
): LocalOrder {
  const record: LocalOrder = {
    ...order,
    id: crypto.randomUUID(),
    requestedAt: new Date().toISOString(),
    confirmedAt: null,
    paymentLinkExpiresAt: null,
    actualDays: null,
  };
  const existing = listLocalOrders();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, record]));
  return record;
}

export function updateLocalOrder(id: string, patch: Partial<LocalOrder>): LocalOrder | null {
  const existing = listLocalOrders();
  let updated: LocalOrder | null = null;
  const next = existing.map((order) => {
    if (order.id !== id) return order;
    updated = { ...order, ...patch };
    return updated;
  });
  if (updated) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  return updated;
}
