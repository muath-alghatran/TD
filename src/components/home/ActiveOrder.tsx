"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { RoadTrack } from "@/components/orders/RoadTrack";
import { Icon } from "@/components/ui/Icon";
import { formatDayNumber, formatMonth, formatRemaining, formatWeekday, toArabicDigits } from "@/lib/format";
import { useGaragedVehicles, useLocalOrders, useNow } from "@/lib/local-store";
import { markJourneyPlayed } from "@/lib/motion";
import { activeOrders, orderProgress } from "@/lib/order-progress";
import { findOrderVehicle } from "@/lib/garage";
import { orderCode } from "@/lib/orders";
import { useRunWhenVisible } from "@/lib/use-run-when-visible";

/**
 * الطلب النشط على الطريق (1b) — حقل فولاذي يكمل واجهة الرئيسية ويحمل ما يحدث الآن.
 * لا يظهر إن لم يكن على هذا الجهاز طلب قائم. يأخذ حركة رحلة الزائر نفسها مرة في الجلسة:
 * المنجزات تمتلئ متتالية، والدرع يتوقف عند مرحلته بنبضة واحدة.
 */
export function ActiveOrder() {
  const orders = useLocalOrders();
  const vehicles = useGaragedVehicles();
  const now = useNow();
  const ref = useRef<HTMLElement>(null);
  const [running, setRunning] = useState(false);

  const active = activeOrders(orders);

  useRunWhenVisible(ref, "journey", () => setRunning(true), active.length > 0);

  // بعد أن يُرسم .is-running لا قبله — وإلا ظهر إطار بالحالة النهائية بين التغييرين
  useEffect(() => {
    if (running) markJourneyPlayed();
  }, [running]);

  if (active.length === 0) return null;

  const order = active[0];
  const progress = orderProgress(order);
  const vehicle = findOrderVehicle(vehicles, order);
  const others = active.length - 1;

  return (
    <section ref={ref} className="steel" aria-label="طلبك النشط">
      <div className="page run">
        <div className="flex items-center justify-between gap-3" style={{ fontSize: 13, color: "var(--muted)" }}>
          <span>
            طلب نشط · {vehicle ? `${vehicle.model} ${toArabicDigits(vehicle.year)}` : order.partName}
          </span>
          <span className="t-data" style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.06em" }}>
            {orderCode(order.id)}
          </span>
        </div>

        {progress.dueAt ? (
          <>
            <div className="run-when">
              <span className="t-disp" style={{ fontSize: 19 }}>
                جاهزة
              </span>
              <span className="big">{formatDayNumber(progress.dueAt)}</span>
              <span style={{ fontSize: 15 }}>
                {formatMonth(progress.dueAt)} · {formatWeekday(progress.dueAt)}
              </span>
            </div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>
              {now > 0 && `متبقٍ ${formatRemaining(progress.dueAt.getTime() - now)} · `}
              {progress.statusLabel}
            </div>
          </>
        ) : (
          <>
            <div className="run-when">
              <span className="t-disp" style={{ fontSize: 19 }}>
                خلال
              </span>
              <span className="big">
                {order.promisedDaysMin !== undefined && order.promisedDaysMin < order.promisedDays
                  ? `${toArabicDigits(order.promisedDaysMin)}–${toArabicDigits(order.promisedDays)}`
                  : toArabicDigits(order.promisedDays)}
              </span>
              <span style={{ fontSize: 15 }}>{order.promisedDays >= 3 && order.promisedDays <= 10 ? "أيام" : "يوم"} من الدفع</span>
            </div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>
              {progress.statusLabel} · يبدأ عدّاد الوعد بعد موافقتك والدفع
            </div>
          </>
        )}

        <RoadTrack
          stages={progress.stages}
          currentIndex={progress.currentIndex}
          delivered={progress.delivered}
          motion="progress"
          running={running}
        />

        <div className="run-foot">
          <span style={{ color: "var(--muted)" }}>
            {order.partName}
            {others === 1 && " · وطلب آخر"}
            {others === 2 && " · وطلبان آخران"}
            {others > 2 && ` · و${toArabicDigits(others)} طلبات أخرى`}
          </span>
          <Link href={`/orders/${order.id}`} className="sec-link">
            تابع
            <Icon name="chevronLeft" size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
