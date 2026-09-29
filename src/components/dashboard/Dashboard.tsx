"use client";

import { useEffect, useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { StatusPill, type PromiseStatus } from "@/components/ui/StatusPill";
import { toArabicDigits } from "@/lib/format";
import { listLocalOrders, type LocalOrder, type OrderStatus } from "@/lib/orders";

const ORDER_STATUS_META: Record<OrderStatus, { label: string; pill: PromiseStatus }> = {
  requested: { label: "بانتظار التأكيد", pill: "wait" },
  confirmed: { label: "مؤكد — تابع بواتساب", pill: "wait" },
  unavailable: { label: "غير متوفرة", pill: "spec" },
  paid: { label: "مكتمل", pill: "ok" },
};

function IcGear() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="6.1" />
      <circle cx="12" cy="12" r="2.2" />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x="10.9" y="2" width="2.2" height="4.2" rx="0.6" transform={`rotate(${i * 45} 12 12)`} />
      ))}
    </svg>
  );
}

function IcCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="5" width="17" height="15.5" rx="1.5" />
      <path d="M3.5 9.5h17M8 3v3.6M16 3v3.6" />
      <path d="M8.3 14.2l2 2 4-4" />
    </svg>
  );
}

function IcTow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 16.5V9h9.5v7.5" />
      <path d="M12 11.5h4.6l3.4 3v2" />
      <circle cx="6.5" cy="18" r="1.8" />
      <circle cx="16.5" cy="18" r="1.8" />
      <path d="M2.5 12.5H7" />
    </svg>
  );
}

function IcSupport() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12.5a8 8 0 0 1 16 0" />
      <rect x="2.8" y="12.5" width="4" height="5.5" rx="1.4" />
      <rect x="17.2" y="12.5" width="4" height="5.5" rx="1.4" />
      <path d="M19.2 18v.8a3 3 0 0 1-3 3h-3.4" />
    </svg>
  );
}

interface ServiceTile {
  key: string;
  accent: "parts" | "booking" | "tow" | "support";
  label: string;
  hint: string;
  icon: () => React.ReactElement;
  onSelect?: () => void;
}

export function Dashboard({ onOpenParts }: { onOpenParts: () => void }) {
  const [orders, setOrders] = useState<LocalOrder[]>([]);

  useEffect(() => {
    Promise.resolve().then(() => setOrders(listLocalOrders()));
  }, []);

  const tiles: ServiceTile[] = [
    { key: "parts", accent: "parts", label: "قطع الغيار", hint: "مخطط مركبتك بوعد محسوب", icon: IcGear, onSelect: onOpenParts },
    { key: "booking", accent: "booking", label: "حجز موعد فحص", hint: "قريباً", icon: IcCalendar },
    { key: "tow", accent: "tow", label: "سطحة", hint: "قريباً", icon: IcTow },
    { key: "support", accent: "support", label: "دعم", hint: "قريباً", icon: IcSupport },
  ];

  const recent = [...orders].sort((a, b) => b.requestedAt.localeCompare(a.requestedAt)).slice(0, 5);

  return (
    <main className="stage">
      <div className="lede td-lede">
        <span className="td-mark" aria-hidden="true">
          TD
        </span>
        <div>
          <span className="t-eyebrow">Trust Drive · حائل</span>
          <h1>
            مرحباً بك
            <br />
            <em>ماذا تحتاج اليوم؟</em>
          </h1>
          <p className="td-blurb">
            <b>TD</b> — مركز صيانة وقطع غيار بإدارة سعودية بالكامل، حيث كل وعد تسليم رقم محسوب لا تخمين فيه.
          </p>
        </div>
      </div>

      <div className="svc-grid">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          const disabled = !tile.onSelect;
          return (
            <button
              key={tile.key}
              className={`svc-tile ${tile.accent}`}
              disabled={disabled}
              onClick={tile.onSelect}
              aria-disabled={disabled}
            >
              {disabled && <span className="soon">قريباً</span>}
              <span className={`ic ${tile.accent}`}>
                <Icon />
              </span>
              <strong>{tile.label}</strong>
              {!disabled && <span className="d">{tile.hint}</span>}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <span className="t-eyebrow" style={{ color: "var(--text-3)" }}>
          طلباتي الأخيرة
        </span>

        {recent.length === 0 ? (
          <Sheet className="mt-3">
            <p style={{ color: "var(--text-2)", fontSize: 13.5 }}>لا طلبات بعد — ابدأ بطلب قطعة غيار من الأعلى.</p>
          </Sheet>
        ) : (
          <div className="mt-3 flex flex-col gap-2.5">
            {recent.map((order) => {
              const meta = ORDER_STATUS_META[order.status];
              return (
                <Sheet key={order.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="t-disp" style={{ fontWeight: 500, fontSize: 14.5 }}>
                        {order.partName}
                      </div>
                      <div className="t-data" style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>
                        {toArabicDigits(order.totalPrice.toFixed(2))} ريال ·{" "}
                        {new Date(order.requestedAt).toLocaleDateString("ar-SA", { day: "numeric", month: "short" })}
                      </div>
                    </div>
                    <StatusPill status={meta.pill} label={meta.label} />
                  </div>
                </Sheet>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
