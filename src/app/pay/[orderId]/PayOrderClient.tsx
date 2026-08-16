"use client";

import { useEffect, useState } from "react";
import { ActButton } from "@/components/ui/ActButton";
import { Sheet } from "@/components/ui/Sheet";
import { dayWord, formatPrice } from "@/lib/format";
import { getLocalOrder, updateLocalOrder, type LocalOrder } from "@/lib/orders";
import { capturePaymentMock } from "@/lib/payment";

export function PayOrderClient({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<LocalOrder | null | undefined>(undefined);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => setOrder(getLocalOrder(orderId)));
  }, [orderId]);

  async function handlePay() {
    if (!order) return;
    setPaying(true);
    const payment = await capturePaymentMock(order.totalPrice);
    const updated = updateLocalOrder(order.id, { status: "paid", paidAt: payment.capturedAt });
    setOrder(updated);
    setPaying(false);
  }

  if (order === undefined) return null;

  if (!order) {
    return (
      <main className="stage">
        <Sheet>
          <p>الطلب غير موجود.</p>
        </Sheet>
      </main>
    );
  }

  const expired = order.paymentLinkExpiresAt ? new Date(order.paymentLinkExpiresAt) < new Date() : false;

  return (
    <main className="stage">
      <div className="lede">
        <span className="t-eyebrow">رابط الدفع</span>
        <h1>{order.partName}</h1>
        <p className="t-data" style={{ color: "var(--text-3)" }}>
          {order.partOem}
        </p>
      </div>

      <Sheet>
        {order.status === "paid" ? (
          <div className="memo">
            <b>تم الدفع بالفعل.</b> هذا الطلب مكتمل، والوعد بدأ من لحظة الدفع.
          </div>
        ) : order.status === "unavailable" ? (
          <div className="memo">
            <b>لم تتوفر هذه القطعة.</b> سُجِّلت في الطلب المفقود وسنبلغك عند توفرها.
          </div>
        ) : order.status !== "confirmed" ? (
          <div className="memo">لم يُؤكَّد توفر هذا الطلب بعد — لا يمكن الدفع الآن.</div>
        ) : expired ? (
          <div className="memo">
            <b>انتهت صلاحية رابط الدفع (12 ساعة).</b> تواصل معنا لإعادة تأكيد التوفر والسعر.
          </div>
        ) : (
          <>
            <div className="tally">
              <div className="ln-i sum">
                <span>الإجمالي</span>
                <span>{formatPrice(order.totalPrice)}</span>
              </div>
            </div>
            <ActButton style={{ marginTop: 20 }} onClick={handlePay} disabled={paying}>
              {paying ? "جارٍ الدفع…" : "الدفع الآن"}
            </ActButton>
            <div className="memo">
              <b>هذا وعد ملزم بعد الدفع.</b> إن تأخر الطلب عن {dayWord(order.promisedDays)}، يُضاف رصيد تعويض
              تلقائياً.
            </div>
          </>
        )}
      </Sheet>
    </main>
  );
}
