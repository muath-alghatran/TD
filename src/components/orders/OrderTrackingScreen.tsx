"use client";

import Link from "next/link";
import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ActionBar } from "@/components/shell/ActionBar";
import { AppBar } from "@/components/shell/AppBar";
import { Corners } from "@/components/ui/Corners";
import { Icon } from "@/components/ui/Icon";
import { CENTER } from "@/lib/center-info";
import {
  dayWord,
  formatClock,
  formatPrice,
  formatShortDate,
  formatWeekday,
  monthsWord,
  remainingParts,
  toArabicDigits,
} from "@/lib/format";
import { findOrderVehicle, vehicleLabel } from "@/lib/garage";
import { useGaragedVehicles, useHydrated, useLocalOrders, useNow } from "@/lib/local-store";
import { orderProgress, type OrderStage } from "@/lib/order-progress";
import { orderCode, type LocalOrder } from "@/lib/orders";
import { PRICING_SETTINGS } from "@/lib/pricing-settings";
import { useRunWhenVisible } from "@/lib/use-run-when-visible";
import { buildOrderFollowUpMessage, buildWhatsAppLink } from "@/lib/whatsapp-requests";
import { ZONES } from "@/lib/zone-catalog";

function catalogPart(oem: string) {
  return ZONES.flatMap((z) => z.parts).find((p) => p.oem === oem);
}

/** مراحل الطلب عمودياً: حين تظهر تمتلئ المنجزة متتالية من الأعلى حتى الحالية (CSS فقط) */
function MotionTimeline({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLOListElement>(null);
  const [running, setRunning] = useState(false);
  useRunWhenVisible(ref, "motion", () => setRunning(true));
  return (
    <ol ref={ref} className={`timeline${running ? " is-running" : ""}`}>
      {children}
    </ol>
  );
}

/** عرض السعر المفصّل — يبقى داخل المرحلة التي وافقت فيها (1a) */
function PriceLedger({ order }: { order: LocalOrder }) {
  const hasLines = order.unitPrice !== undefined;
  const part = catalogPart(order.partOem);
  return (
    <div className="ledger">
      {hasLines && (
        <>
          <div className="ledger-row">
            <span>
              {order.partName}
              {order.qualityTier ? ` · ${order.qualityTier}` : ""}
            </span>
            <span>{formatPrice(order.unitPrice ?? 0)}</span>
          </div>
          {order.mode === "fit" ? (
            <>
              <div className="ledger-row">
                <span>
                  أجرة التركيب
                  {part?.hrs
                    ? ` · ${part.hrs === 1 ? "ساعة واحدة" : `${toArabicDigits(part.hrs)} ساعة`} × ${PRICING_SETTINGS.hourRate}`
                    : ""}
                </span>
                <span>{formatPrice(order.laborCost ?? 0)}</span>
              </div>
              {(order.discount ?? 0) > 0 && (
                <div className="ledger-row credit-line">
                  <span>خصم «اطلب وركّب» على أجرة اليد ١٠٪</span>
                  <span>−{formatPrice(order.discount ?? 0)}</span>
                </div>
              )}
            </>
          ) : (
            <div className="ledger-row">
              <span>الشحن إلى {order.cityName}</span>
              <span>{(order.shipCost ?? 0) === 0 ? "مجاني" : formatPrice(order.shipCost ?? 0)}</span>
            </div>
          )}
        </>
      )}
      <div className="ledger-sum">
        <span>{order.status === "requested" ? "الإجمالي التقديري" : "الإجمالي المعتمد"}</span>
        <span>{formatPrice(order.totalPrice)} ر.س</span>
      </div>
    </div>
  );
}

function StageTime({ stage }: { stage: OrderStage }) {
  if (stage.state === "current") return <span className="tl-time now">الآن</span>;
  if (!stage.at) return null;
  if (stage.dateOnly) return <span className="tl-time">{formatShortDate(stage.at)}</span>;
  const clock = formatClock(stage.at);
  // فاصلة عربية لا نقطة وسطى: «·» بجانب «٠» تُقرأ صفراً إضافياً
  return (
    <span className="tl-time">
      {formatShortDate(stage.at)}، <span className="ltr">{clock.time}</span> {clock.period}
    </span>
  );
}

/** تتبع الطلب — الوعد مفصّل مثل السعر (1a)، ومراحل العمل عمودياً بنمط الخط */
export function OrderTrackingScreen({ id }: { id: string }) {
  const hydrated = useHydrated();
  const orders = useLocalOrders();
  const vehicles = useGaragedVehicles();
  const now = useNow();

  const order = orders.find((o) => o.id === id);

  if (!hydrated) {
    return <AppBar title="تتبع الطلب" backHref="/orders" />;
  }

  if (!order) {
    return (
      <>
        <AppBar title="تتبع الطلب" backHref="/orders" />
        <main className="page">
          <div className="blueprint empty" style={{ marginTop: 24 }}>
            <Corners />
            <span className="box-ic">
              <Icon name="route" size={22} />
            </span>
            <div className="t-disp" style={{ fontSize: 19 }}>
              ما وجدنا هذا الطلب على هذا الجهاز
            </div>
            <p>الطلبات تُحفظ في المتصفح الذي طلبت منه. افتح الرابط من نفس الجهاز، أو راسلنا برقم الطلب.</p>
            <Link href="/orders" className="btn btn-secondary">
              طلباتي
            </Link>
          </div>
        </main>
      </>
    );
  }

  const progress = orderProgress(order);
  const vehicle = findOrderVehicle(vehicles, order);
  const part = catalogPart(order.partOem);
  const tier = order.qualityTier ?? part?.tier ?? null;
  const warrantyMonths = order.warrantyMonths ?? part?.war ?? null;
  const requested = new Date(order.requestedAt);
  const requestedClock = formatClock(requested);
  const code = orderCode(order.id);
  const followUp = buildWhatsAppLink(buildOrderFollowUpMessage(order));
  const paid = order.paidAt !== null && order.status === "paid";
  const totalLegDays = progress.legs?.reduce((sum, leg) => sum + leg.days, 0) ?? 0;
  const tagClass = progress.failed ? "tag tag-dashed" : progress.delivered ? "tag tag-neutral" : "tag tag-accent";

  return (
    <>
      <AppBar title="تتبع الطلب" backHref="/orders" trailing={<span className="appbar-meta">{code}</span>} />
      <main className="screen has-actionbar">
        <div className="page">
          <div className="job-head">
            <span className="box-ic">
              <Icon name="car" size={24} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="t-disp" style={{ fontSize: 17, lineHeight: 1.3 }}>
                {vehicle ? vehicleLabel(vehicle) : order.partName}
              </div>
              <div style={{ fontSize: 12.5, color: "var(--muted)" }}>
                {order.partName}
                {tier ? ` · ${tier}` : ""} ·{" "}
                <span className="t-data" style={{ fontSize: 12 }}>
                  {order.partOem}
                </span>
              </div>
            </div>
            <span className={tagClass}>{progress.statusLabel}</span>
          </div>

          {/* الوعد: الطلب · الموعد المحسوب · المتبقي */}
          <section className="blueprint" style={{ marginTop: 18 }} aria-label="الموعد المحسوب">
            <Corners />
            <div className="promise-cells">
              <div>
                <div className="cell-k">الطلب</div>
                <div className="cell-v">{formatShortDate(requested)}</div>
                <div className="cell-sub">
                  <span className="ltr">{requestedClock.time}</span> {requestedClock.period}
                </div>
              </div>
              <div>
                <div className="cell-k">الموعد المحسوب</div>
                {progress.dueAt ? (
                  <>
                    <div className="cell-v big">{formatShortDate(progress.dueAt)}</div>
                    <div className="cell-sub">{formatWeekday(progress.dueAt)}</div>
                  </>
                ) : progress.failed ? (
                  <div className="cell-v big">—</div>
                ) : (
                  <>
                    <div className="cell-v big">{dayWord(order.promisedDays)}</div>
                    <div className="cell-sub">من لحظة الدفع</div>
                  </>
                )}
              </div>
              <div>
                <div className="cell-k">{progress.delivered ? "الفعلي" : "متبقٍ"}</div>
                {progress.delivered ? (
                  <>
                    <div className="cell-v accent">{dayWord(order.actualDays ?? 0)}</div>
                    <div className="cell-sub">الوعد {dayWord(order.promisedDays)}</div>
                  </>
                ) : progress.dueAt && now > 0 ? (
                  (() => {
                    const left = remainingParts(progress.dueAt.getTime() - now);
                    return (
                      <>
                        <div className="cell-v accent">
                          {left.value} <span style={{ fontSize: 13 }}>{left.unit}</span>
                        </div>
                        <div className="cell-sub">حتى الموعد</div>
                      </>
                    );
                  })()
                ) : (
                  <>
                    <div className="cell-v" style={{ color: "var(--muted)" }}>
                      —
                    </div>
                    <div className="cell-sub">{progress.failed ? "لم تتوفر" : "يبدأ بعد الدفع"}</div>
                  </>
                )}
              </div>
            </div>

            {progress.legs && !progress.failed && (
              <div className="calc">
                <div className="calc-hd">
                  <span style={{ fontWeight: 600 }}>كيف حسبنا الموعد</span>
                  <span style={{ color: "var(--muted)" }}>
                    {dayWord(Math.max(1, totalLegDays))} {paid ? "من الدفع" : "بعد الدفع"}
                  </span>
                </div>
                <div className="calc-bar" aria-hidden="true">
                  {progress.legs.map((leg, i) => (
                    <i
                      key={leg.label}
                      style={{ flex: Math.max(leg.days, 0.6) }}
                      className={progress.delivered ? undefined : paid && i === 0 ? "part" : "next"}
                    />
                  ))}
                </div>
                <div className="calc-legend">
                  {progress.legs.map((leg) => (
                    <span key={leg.label} style={{ flex: Math.max(leg.days, 0.6) }}>
                      {leg.label}
                      <br />
                      {leg.days === 0 ? "فوراً" : dayWord(leg.days)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* مراحل الطلب: المكتمل مصمت · الحالي إطار · القادم متقطع */}
          <h2 className="sec-title" style={{ marginTop: 28 }}>
            مراحل الطلب
          </h2>
          <MotionTimeline>
            {progress.stages.map((stage, i) => {
              const nextStage = progress.stages[i + 1];
              const lineSolid = nextStage && nextStage.state !== "next";
              return (
                <li
                  key={stage.key}
                  className={`tl-row ${stage.state === "next" ? "is-next" : ""}`}
                  style={{ "--i": i } as CSSProperties}
                >
                  <div className="tl-rail">
                    <span className={`tl-node ${stage.state}`}>
                      {stage.state === "done" && <Icon name="check" size={13} strokeWidth={2.2} />}
                      {stage.state === "failed" && <Icon name="x" size={13} strokeWidth={2.2} />}
                    </span>
                    {nextStage && <span className={`tl-line ${lineSolid ? "" : "dashed"}`} />}
                  </div>
                  <div className="tl-body">
                    <div className="tl-head">
                      <span className="tl-title">{stage.label}</span>
                      <StageTime stage={stage} />
                    </div>
                    {stage.state !== "next" && <div className="tl-note">{stage.note}</div>}
                    {stage.key === "paid" && stage.state !== "next" && <PriceLedger order={order} />}
                    {stage.key === "confirmed" && stage.state === "current" && (
                      <PriceLedger order={order} />
                    )}
                    {stage.state === "current" && stage.key !== "confirmed" && stage.key !== "paid" && (
                      <div className="media-slot" style={{ marginTop: 10 }}>
                        <Icon name="camera" size={22} />
                        <p>صور وفيديو كل مرحلة تصلك من الفني على واتساب.</p>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </MotionTimeline>

          {warrantyMonths && !progress.failed ? (
            <div className="blueprint warranty">
              <Corners />
              <Icon name="scrollText" size={26} />
              <div style={{ flex: 1 }}>
                <div className="t-disp" style={{ fontSize: 16 }}>
                  ضمان مكتوب {monthsWord(warrantyMonths)}
                </div>
                <div style={{ fontSize: 12.5, color: "var(--muted)" }}>
                  {order.mode === "fit" ? "ضمان واحد يشمل القطعة والتركيب معًا" : "على القطعة"}
                </div>
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-accent)" }}>مع التسليم</span>
            </div>
          ) : null}
        </div>
      </main>

      <ActionBar>
        <a href={followUp} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg blueprint">
          <Corners />
          <Icon name="messageCircle" size={20} />
          تواصل مع الفني
        </a>
        <a href={`tel:${CENTER.phoneTel}`} className="btn btn-secondary btn-icon" aria-label="اتصال مباشر">
          <Icon name="phone" size={20} />
        </a>
      </ActionBar>
    </>
  );
}

