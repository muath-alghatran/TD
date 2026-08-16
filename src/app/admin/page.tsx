"use client";

import { useEffect, useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { toArabicDigits } from "@/lib/format";
import { listLocalOrders, type LocalOrder, type OrderStatus } from "@/lib/orders";

const STATUS_LABEL: Record<OrderStatus, string> = {
  requested: "بانتظار تأكيد المورد",
  confirmed: "مؤكدة — بانتظار الدفع",
  unavailable: "غير متوفرة",
  paid: "مدفوعة",
};

function countByStatus(orders: LocalOrder[]): Record<OrderStatus, number> {
  const counts: Record<OrderStatus, number> = { requested: 0, confirmed: 0, unavailable: 0, paid: 0 };
  for (const order of orders) counts[order.status]++;
  return counts;
}

export default function AdminHomePage() {
  const [orders, setOrders] = useState<LocalOrder[] | null>(null);

  useEffect(() => {
    // localStorage غير متاح أثناء SSR — القراءة هنا بعد التحميل لتفادي عدم تطابق الترطيب،
    // ومُؤجَّلة عبر microtask لتفادي setState متزامن داخل جسم الأثر مباشرة.
    Promise.resolve().then(() => setOrders(listLocalOrders()));
  }, []);

  if (!orders) return null;

  const counts = countByStatus(orders);
  const withActuals = orders.filter((o) => o.actualDays !== null && o.status === "paid");
  const onTimeCount = withActuals.filter((o) => (o.actualDays ?? 0) <= o.promisedDays).length;

  return (
    <div>
      <div className="lede">
        <span className="t-eyebrow">لوحة التحكم</span>
        <h1>نظرة عامة</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(Object.keys(STATUS_LABEL) as OrderStatus[]).map((status) => (
          <Sheet key={status}>
            <div className="t-data" style={{ fontSize: 11, color: "var(--text-3)" }}>
              {STATUS_LABEL[status]}
            </div>
            <div className="t-disp" style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>
              {toArabicDigits(counts[status])}
            </div>
          </Sheet>
        ))}
      </div>

      <Sheet className="mt-3.5">
        <span className="t-eyebrow" style={{ color: "var(--text-3)" }}>
          الوعد مقابل الفعل
        </span>
        {withActuals.length === 0 ? (
          <p style={{ marginTop: 10, fontSize: 13.5, color: "var(--text-2)" }}>
            لا بيانات كافية بعد — لا طلبات مدفوعة سُجِّل لها تسليم فعلي حتى الآن.
          </p>
        ) : (
          <p style={{ marginTop: 10, fontSize: 13.5 }}>
            نسبة الالتزام بالوعد: <b>{toArabicDigits(Math.round((onTimeCount / withActuals.length) * 100))}%</b> من{" "}
            {toArabicDigits(withActuals.length)} طلباً مكتملاً
          </p>
        )}
      </Sheet>
    </div>
  );
}
