"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Corners } from "@/components/ui/Corners";
import { Icon } from "@/components/ui/Icon";
import { orderDaysLabel } from "@/lib/order-progress";
import { orderCode, type LocalOrder } from "@/lib/orders";

/** بعد إرسال الطلب: رقمه، والخطوة التالية بحسب حالته، ورابط تتبعه في «طلباتي» */
export function PartOrderOutcome({ order, onAnother }: { order: LocalOrder; onAnother: () => void }) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
  }, []);
  const fromStock = order.promiseStatus === "ok";

  return (
    <section aria-labelledby="outcome-title">
      <div className="lede">
        <span className="t-eyebrow">
          تم الطلب · <span className="t-data">{orderCode(order.id)}</span>
        </span>
        <h1 id="outcome-title" ref={titleRef} tabIndex={-1}>
          فتحنا لك واتساب برسالة الطلب
        </h1>
        <p>
          أرسلها كما هي — فيها رقم الطلب وكل التفاصيل.{" "}
          {fromStock
            ? "القطعة في مخزون المركز، فنرسل لك رابط الدفع مع التأكيد."
            : "نؤكد لك التوفر والسعر، ثم يصلك رابط دفع صالح ١٢ ساعة."}{" "}
          الوعد خلال {orderDaysLabel(order)} من الدفع.
        </p>
      </div>

      <Link href={`/orders/${order.id}`} className="btn btn-primary btn-lg btn-block blueprint">
        <Corners />
        <Icon name="route" size={20} />
        تتبّع الطلب
      </Link>
      <button type="button" className="btn btn-secondary btn-block" style={{ marginTop: 10 }} onClick={onAnother}>
        اطلب قطعة أخرى
      </button>
    </section>
  );
}
