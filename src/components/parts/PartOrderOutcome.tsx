"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Corners } from "@/components/ui/Corners";
import { Icon } from "@/components/ui/Icon";
import { orderDaysLabel } from "@/lib/order-progress";
import { orderCode, type LocalOrder } from "@/lib/orders";

/** الطلب بعد إرساله، ورابط رسالته — ‎opened‎ = هل فتح المتصفح واتساب فعلاً (قد يمنعه مانع النوافذ بعد التحقق) */
export interface PlacedOrder {
  order: LocalOrder;
  whatsappLink: string;
  opened: boolean;
}

/** بعد إرسال الطلب: رقمه، والخطوة التالية بحسب حالته، ورابط تتبعه في «طلباتي» */
export function PartOrderOutcome({ placed, onAnother }: { placed: PlacedOrder; onAnother: () => void }) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
  }, []);
  const { order, whatsappLink, opened } = placed;
  const immediate = order.promiseStatus === "ok";

  const sendLink = (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className={opened ? "btn btn-secondary btn-block" : "btn btn-primary btn-lg btn-block blueprint"}
      style={opened ? { marginTop: 10 } : undefined}
    >
      {!opened && <Corners />}
      <Icon name="messageCircle" size={20} />
      {opened ? "افتح رسالة الطلب مرة أخرى" : "أرسل الطلب على واتساب"}
    </a>
  );

  return (
    <section aria-labelledby="outcome-title">
      <div className="lede">
        <span className="t-eyebrow">
          {opened ? "تم الطلب" : "بقيت خطوة"} · <span className="t-data">{orderCode(order.id)}</span>
        </span>
        <h1 id="outcome-title" ref={titleRef} tabIndex={-1}>
          {opened ? "فتحنا لك واتساب برسالة الطلب" : "أرسل الطلب على واتساب ليصلنا"}
        </h1>
        <p>
          {opened ? "أرسلها كما هي — فيها رقم الطلب وكل التفاصيل." : "الرسالة جاهزة برقم الطلب وكل التفاصيل — لا يصلنا الطلب حتى ترسلها."}{" "}
          {immediate
            ? "القطعة في مخزون المركز، فنرسل لك رابط الدفع مع التأكيد."
            : order.fromStock
              ? "القطعة في مخزون المركز، ونؤكد لك الشحن ثم يصلك رابط دفع صالح ١٢ ساعة."
              : "نؤكد لك التوفر والسعر، ثم يصلك رابط دفع صالح ١٢ ساعة."}{" "}
          الوعد خلال {orderDaysLabel(order)} من الدفع.
        </p>
      </div>

      {!opened && sendLink}
      <Link
        href={`/orders/${order.id}`}
        className={opened ? "btn btn-primary btn-lg btn-block blueprint" : "btn btn-secondary btn-block"}
        style={opened ? undefined : { marginTop: 10 }}
      >
        {opened && <Corners />}
        <Icon name="route" size={20} />
        تتبّع الطلب
      </Link>
      {opened && sendLink}
      <button type="button" className="btn btn-secondary btn-block" style={{ marginTop: 10 }} onClick={onAnother}>
        اطلب قطعة أخرى
      </button>
    </section>
  );
}
