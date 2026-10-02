"use client";

import { useEffect, useState } from "react";
import { ActButton } from "@/components/ui/ActButton";
import { Sheet } from "@/components/ui/Sheet";
import { StatusPill } from "@/components/ui/StatusPill";
import { Tag } from "@/components/ui/Tag";
import { logDemandGap } from "@/lib/demand-gap";
import { DEFAULT_PROMISE_SETTINGS } from "@/lib/default-promise-settings";
import { formatClock, formatPrice, formatShortDate, toArabicDigits } from "@/lib/format";
import { orderDaysLabel } from "@/lib/order-progress";
import { findOrderVehicle, getGaragedVehicles } from "@/lib/garage";
import { listLocalOrders, orderCode, updateLocalOrder, type LocalOrder, type OrderStatus } from "@/lib/orders";
import type { PromiseStatus } from "@/lib/promise-engine";
import { buildSupplierMessage } from "@/lib/whatsapp-message";

const STATUS_LABEL: Record<OrderStatus, string> = {
  requested: "بانتظار التأكيد",
  confirmed: "مؤكدة — بانتظار الدفع",
  unavailable: "غير متوفرة",
  paid: "مدفوعة",
};

const PROMISE_PILL: Record<PromiseStatus, string> = {
  ok: "من المخزون · دفع فوري",
  wait: "يحتاج تأكيد",
  spec: "طلب خاص",
};

/** اللون للتوفر وحده (قاعدة 1): حالة الوعد عند الطلب، أو من ثقته للطلبات الأقدم من المرحلة 6 */
function promiseStatusOf(order: LocalOrder): PromiseStatus {
  if (order.promiseStatus) return order.promiseStatus;
  const { hiConf, midConf } = DEFAULT_PROMISE_SETTINGS;
  return order.confidenceAtOrder >= hiConf ? "ok" : order.confidenceAtOrder >= midConf ? "wait" : "spec";
}

function followUpLabel(iso: string): string {
  const date = new Date(iso);
  const { time, period } = formatClock(date);
  return `${formatShortDate(date)} · ${time} ${period}`;
}

const FILTERS: (OrderStatus | "all")[] = ["all", "requested", "confirmed", "paid", "unavailable"];

function vehicleLabelFor(order: LocalOrder): string {
  const vehicle = findOrderVehicle(getGaragedVehicles(), order);
  return vehicle ? `${vehicle.make} ${vehicle.model}` : order.vehicleVin || "سيارة غير محددة";
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<LocalOrder[]>([]);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    refresh();
  }, []);

  function refresh() {
    Promise.resolve().then(() => setOrders(listLocalOrders()));
  }

  function handleConfirm(order: LocalOrder) {
    const now = new Date();
    const expires = new Date(now.getTime() + 12 * 60 * 60 * 1000);
    updateLocalOrder(order.id, {
      status: "confirmed",
      confirmedAt: now.toISOString(),
      paymentLinkExpiresAt: expires.toISOString(),
    });
    refresh();
  }

  function handleUnavailable(order: LocalOrder) {
    updateLocalOrder(order.id, { status: "unavailable" });
    const vehicle = findOrderVehicle(getGaragedVehicles(), order);
    logDemandGap({
      oemNumber: order.partOem,
      partName: order.partName,
      make: vehicle?.make ?? "",
      model: vehicle?.model ?? "",
      year: vehicle?.year ?? 0,
      cityName: order.cityName,
      reason: "لم يتوفر عند المورد بعد الطلب",
    });
    refresh();
  }

  function handleMarkPaid(order: LocalOrder) {
    updateLocalOrder(order.id, { status: "paid", paidAt: new Date().toISOString() });
    refresh();
  }

  function handleRecordDelivery(order: LocalOrder) {
    if (!order.paidAt) return;
    const days = Math.max(1, Math.round((Date.now() - new Date(order.paidAt).getTime()) / 86400000));
    updateLocalOrder(order.id, { actualDays: days });
    refresh();
  }

  function copyText(id: string, text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 2000);
    });
  }

  const visibleOrders = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <div className="lede">
        <span className="t-eyebrow">لوحة التحكم</span>
        <h1>الطلبات</h1>
      </div>

      <div className="layers">
        {FILTERS.map((f) => (
          <button key={f} className="lay" aria-pressed={filter === f} onClick={() => setFilter(f)}>
            {f === "all" ? "الكل" : STATUS_LABEL[f]}
          </button>
        ))}
      </div>

      {visibleOrders.length === 0 && (
        <Sheet className="mt-3.5">
          <p style={{ color: "var(--text-2)", fontSize: 13.5 }}>لا طلبات في هذه الحالة.</p>
        </Sheet>
      )}

      <div className="mt-3.5 flex flex-col gap-2.5">
        {visibleOrders.map((order) => {
          const promise = promiseStatusOf(order);
          return (
            <Sheet key={order.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="t-disp" style={{ fontWeight: 500, fontSize: 15.5 }}>
                    {order.partName}
                  </div>
                  <div className="t-data" style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 2 }}>
                    {orderCode(order.id)}
                    {order.partOem ? ` · ${order.partOem}` : ""} · {vehicleLabelFor(order)}
                  </div>
                </div>
                <StatusPill status={promise} label={PROMISE_PILL[promise]} />
              </div>

              <div className="mt-2.5 flex flex-wrap gap-2">
                <Tag>{STATUS_LABEL[order.status]}</Tag>
                <Tag>{order.cityName}</Tag>
                <Tag>{order.mode === "fit" ? "تركيب" : "توصيل"}</Tag>
                <Tag>
                  {order.pricePending ? (
                    "السعر عند التأكيد"
                  ) : (
                    <>
                      <span className="t-data">{formatPrice(order.totalPrice)}</span> ر.س{order.priceIndicative ? " (استرشادي)" : ""}
                    </>
                  )}
                </Tag>
                {order.fromStock && <Tag>من المخزون</Tag>}
                <Tag>ثقة {toArabicDigits(Math.round(order.confidenceAtOrder * 100))}٪</Tag>
                {order.actualDays !== null && (
                  <Tag>
                    الوعد {orderDaysLabel(order)} · الفعلي {toArabicDigits(order.actualDays)}
                  </Tag>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2 border-t pt-3" style={{ borderColor: "var(--rule-2)", borderStyle: "dashed" }}>
                {order.status === "requested" && (
                  <>
                    <ActButton variant="secondary" onClick={() => copyText(order.id, buildSupplierMessage(order))}>
                      {copiedId === order.id ? "نُسخت" : "نسخ رسالة المندوب"}
                    </ActButton>
                    <ActButton onClick={() => handleConfirm(order)}>تأكيد التوفر</ActButton>
                    <button className="notify" onClick={() => handleUnavailable(order)}>
                      غير متوفر
                    </button>
                  </>
                )}
                {order.status === "confirmed" && (
                  <>
                    <ActButton onClick={() => handleMarkPaid(order)}>تحديد كمدفوع</ActButton>
                    {order.paymentLinkExpiresAt && (
                      <span style={{ fontSize: 11.5, color: "var(--text-3)", alignSelf: "center" }}>
                        موعد المتابعة: {followUpLabel(order.paymentLinkExpiresAt)}
                      </span>
                    )}
                  </>
                )}
                {order.status === "paid" && order.actualDays === null && (
                  <ActButton variant="secondary" onClick={() => handleRecordDelivery(order)}>
                    سجّل التسليم الفعلي اليوم
                  </ActButton>
                )}
              </div>
            </Sheet>
          );
        })}
      </div>
    </div>
  );
}
