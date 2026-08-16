/**
 * سجل الطلبات المحلي — بنفس نهج garage.ts/demand-gap.ts. الحقول تطابق
 * أسماء نموذج Order في prisma/schema.prisma حرفياً، ليكون الاستبدال
 * بكتابة Prisma فعلية عبر Server Action لاحقاً تغييراً في ملف واحد.
 *
 * قاعدة حرجة (docs/CLAUDE.md، docs/payment-spec.md §4): عدّاد الوعد
 * يبدأ من paidAt لا من requestedAt. paidAt يُضبط فقط لمسار الأخضر —
 * الأصفر والرمادي ينتهيان بـ status:"requested" بلا paidAt إطلاقاً.
 */

const STORAGE_KEY = "td-orders-local";

export type OrderStatus = "requested" | "paid";

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
  paidAt: string | null;
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

export function createLocalOrder(order: Omit<LocalOrder, "id" | "requestedAt">): LocalOrder {
  const record: LocalOrder = {
    ...order,
    id: crypto.randomUUID(),
    requestedAt: new Date().toISOString(),
  };
  const existing = listLocalOrders();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, record]));
  return record;
}
