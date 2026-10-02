"use client";

import Link from "next/link";
import { Corners } from "@/components/ui/Corners";
import { Icon } from "@/components/ui/Icon";
import { dayWord, formatDayDate, formatPrice } from "@/lib/format";
import { findOrderVehicle, vehicleLabel } from "@/lib/garage";
import { useGaragedVehicles, useHydrated, useLocalOrders } from "@/lib/local-store";
import { orderDaysLabel, orderProgress } from "@/lib/order-progress";
import { orderCode } from "@/lib/orders";
import { StageBar } from "./RoadTrack";

/** طلباتي — كل طلب بمراحله الست (1c) وموعده المحسوب */
export function OrdersScreen() {
  const hydrated = useHydrated();
  const orders = useLocalOrders();
  const vehicles = useGaragedVehicles();

  if (!hydrated) return null;

  if (orders.length === 0) {
    return (
      <div className="blueprint empty" style={{ marginTop: 20 }}>
        <Corners />
        <span className="box-ic">
          <Icon name="package" size={22} />
        </span>
        <div className="t-disp" style={{ fontSize: 19 }}>
          لا طلبات بعد
        </div>
        <p>اطلب قطعة غيار، وتابع طلبك هنا خطوة بخطوة من تأكيد التوفر حتى التسليم.</p>
        <Link href="/parts" className="btn btn-primary">
          <Icon name="cog" size={18} />
          اطلب قطعة غيار
        </Link>
      </div>
    );
  }

  const sorted = [...orders].sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));

  return (
    <div className="blueprint" style={{ marginTop: 20 }}>
      <Corners />
      {sorted.map((order) => {
        const progress = orderProgress(order);
        const vehicle = findOrderVehicle(vehicles, order);
        const tagClass = progress.failed ? "tag tag-dashed" : progress.delivered ? "tag tag-neutral" : "tag tag-accent";
        return (
          <Link key={order.id} href={`/orders/${order.id}`} className="order-row">
            <div className="order-top">
              <div style={{ minWidth: 0 }}>
                <div className="order-name">{order.partName}</div>
                <div className="order-sub">
                  <span className="t-data" style={{ fontSize: 12 }}>
                    {orderCode(order.id)}
                  </span>
                  {" · "}
                  {vehicle ? vehicleLabel(vehicle) : order.mode === "fit" ? "تركيب في المركز" : `توصيل إلى ${order.cityName}`}
                </div>
              </div>
              <span className={tagClass}>{progress.statusLabel}</span>
            </div>
            <StageBar stages={progress.stages} />
            <div className="flex items-center justify-between gap-3" style={{ marginTop: 10, fontSize: 12.5 }}>
              <span style={{ color: "var(--muted)" }}>
                {progress.failed
                  ? "سجّلناها ونبلغك فور توفرها"
                  : progress.delivered
                    ? `سُلّم في ${dayWord(order.actualDays ?? 0)} — الوعد ${orderDaysLabel(order)}`
                    : progress.dueAt
                      ? `الموعد المحسوب: ${formatDayDate(progress.dueAt)}`
                      : `خلال ${orderDaysLabel(order)} من الدفع`}
              </span>
              {order.pricePending ? (
                <span style={{ color: "var(--muted)" }}>السعر عند التأكيد</span>
              ) : (
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  {order.priceIndicative && <span style={{ fontWeight: 400, color: "var(--muted)" }}>استرشادي </span>}
                  <span className="t-data">{formatPrice(order.totalPrice)}</span> ر.س
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
