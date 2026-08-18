"use client";

import { useEffect, useRef, useState } from "react";
import { verifyPrice, type VerifiedPrice } from "@/app/actions/verify-price";
import { ActButton } from "@/components/ui/ActButton";
import { Sheet } from "@/components/ui/Sheet";
import { dayWord, formatPrice, toArabicDigits } from "@/lib/format";
import { createLocalOrder, type LocalOrder } from "@/lib/orders";
import { capturePaymentMock } from "@/lib/payment";
import { PRICING_SETTINGS } from "@/lib/pricing-settings";
import type { PromiseMode } from "@/lib/promise-engine";
import type { CatalogPart } from "@/lib/zone-catalog";

const CIRCUMFERENCE = 216.8;

const GAUGE_TICKS = Array.from({ length: 11 }, (_, i) => {
  const angle = ((135 + (i * (CIRCUMFERENCE / 289) * 360) / 10) * Math.PI) / 180;
  return {
    x1: 60 + Math.cos(angle) * 53,
    y1: 60 + Math.sin(angle) * 53,
    x2: 60 + Math.cos(angle) * 57,
    y2: 60 + Math.sin(angle) * 57,
  };
});

const EYE_LABEL: Record<VerifiedPrice["status"], string> = {
  ok: "وعد ملزم",
  wait: "تقدير محسوب",
  spec: "بانتظار التأكيد",
};
const HEAD_LABEL: Record<VerifiedPrice["status"], string> = {
  ok: "مضمون الوصول",
  wait: "متوقع الوصول",
  spec: "طلب خاص",
};
const LIT: Record<VerifiedPrice["status"], string> = {
  ok: "#3FD9A0",
  wait: "#F2B33C",
  spec: "#9FB2BD",
};

export function PromiseVerdict({
  part,
  cityName,
  mode,
  vehicleVin,
  onBack,
  onOutcome,
}: {
  part: CatalogPart;
  cityName: string;
  mode: PromiseMode;
  vehicleVin: string;
  onBack: () => void;
  onOutcome: (order: LocalOrder) => void;
}) {
  const [verified, setVerified] = useState<VerifiedPrice | null>(null);
  const [dashOffset, setDashOffset] = useState(CIRCUMFERENCE);
  const [displayPercent, setDisplayPercent] = useState<string>("—");
  const [submitting, setSubmitting] = useState(false);
  const requestedRef = useRef(false);

  useEffect(() => {
    // تحقق سعر خادمي حقيقي — لا نثق بأي رقم محسوب محلياً قبل هذا (docs/payment-spec.md §8)
    verifyPrice({ oem: part.oem, cityName, mode }).then(setVerified);
  }, [part.oem, cityName, mode]);

  useEffect(() => {
    if (!verified) return;
    const target = Math.round(verified.confidence * 100);
    // النموذج (docs/prototype-parts.html) لا يراعي prefers-reduced-motion في عدّاده الرقمي —
    // فجوة موروثة نُصلحها هنا: نقفز للقيمة النهائية فوراً بدل setInterval.
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const startTimer = setTimeout(() => {
      setDashOffset(CIRCUMFERENCE * (1 - verified.confidence));
      if (reduceMotion) {
        setDisplayPercent(`${target}%`);
        return;
      }
      let current = 0;
      intervalId = setInterval(() => {
        current += Math.max(1, Math.ceil((target - current) / 6));
        if (current >= target) {
          current = target;
          clearInterval(intervalId);
        }
        setDisplayPercent(`${current}%`);
      }, 28);
    }, 90);

    return () => {
      clearTimeout(startTimer);
      if (intervalId) clearInterval(intervalId);
    };
  }, [verified]);

  async function handleAction() {
    if (!verified || submitting || requestedRef.current) return;
    requestedRef.current = true;
    setSubmitting(true);

    const baseOrder = {
      vehicleVin,
      partOem: verified.oem,
      partName: verified.partName,
      cityName,
      mode,
      promisedDays: verified.days,
      confidenceAtOrder: verified.confidence,
      totalPrice: verified.total,
    };

    if (verified.status === "ok") {
      const payment = await capturePaymentMock(verified.total);
      const order = createLocalOrder({ ...baseOrder, status: "paid", paidAt: payment.capturedAt });
      onOutcome(order);
    } else {
      const order = createLocalOrder({ ...baseOrder, status: "requested", paidAt: null });
      onOutcome(order);
    }
  }

  if (!verified) {
    return (
      <section>
        <button className="retreat" onClick={onBack}>
          ← تعديل الاستلام
        </button>
        <Sheet>
          <span className="idle">جارٍ التحقق من السعر والتوفر…</span>
        </Sheet>
      </section>
    );
  }

  const color = LIT[verified.status];
  const sayText =
    verified.status === "spec" ? "نؤكد لك التوفر خلال ٢٤ ساعة" : `${HEAD_LABEL[verified.status]} خلال ${dayWord(verified.days)}`;
  const whyText =
    `محسوبة من التزام المورد وأداء الشحن إلى ${cityName}` + (mode === "fit" ? " — التركيب داخل المركز يلغي مخاطرة الشحن." : ".");

  return (
    <section>
      <button className="retreat" onClick={onBack}>
        ← تعديل الاستلام
      </button>

      <div className="verdict">
        <span className="t-eyebrow" style={{ color }}>
          {EYE_LABEL[verified.status]}
        </span>
        <div className="gauge-wrap">
          <div className="gauge">
            {/* المقياس زخرفي — نفس المعلومة (الحالة والأيام) متاحة نصياً في say/why بجانبه */}
            <svg viewBox="0 0 120 120" aria-hidden="true">
              <g>
                {GAUGE_TICKS.map((t, i) => (
                  <line key={i} className="g-tick" x1={t.x1.toFixed(1)} y1={t.y1.toFixed(1)} x2={t.x2.toFixed(1)} y2={t.y2.toFixed(1)} />
                ))}
              </g>
              <circle className="g-track" cx={60} cy={60} r={46} strokeDasharray={`${CIRCUMFERENCE} 289`} transform="rotate(135 60 60)" />
              <circle
                className="g-fill"
                cx={60}
                cy={60}
                r={46}
                strokeDasharray={`${CIRCUMFERENCE} 289`}
                strokeDashoffset={dashOffset}
                stroke={color}
                transform="rotate(135 60 60)"
              />
              <text className="g-val" x={60} y={57} fill={color}>
                {displayPercent}
              </text>
              <text className="g-cap" x={60} y={78}>
                CONFIDENCE
              </text>
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 210 }}>
            <div className="say">{sayText}</div>
            <p className="why">{whyText}</p>
          </div>
        </div>
      </div>

      <Sheet className="mt-3.5">
        <span className="t-eyebrow" style={{ color: "var(--text-3)" }}>
          تفصيل الحساب
        </span>
        <div className="tally">
          <div className="ln-i">
            <span>
              {verified.partName} · {verified.oem}
            </span>
            <span>{formatPrice(verified.unitPrice)}</span>
          </div>
          {mode === "fit" ? (
            <>
              <div className="ln-i">
                <span>
                  أجرة التركيب · {part.hrs} ساعة × {PRICING_SETTINGS.hourRate}
                </span>
                <span>{formatPrice(verified.laborCost)}</span>
              </div>
              <div className="ln-i cr">
                <span>خصم شراء القطعة من الموقع ١٠٪</span>
                <span>−{formatPrice(verified.discount)}</span>
              </div>
            </>
          ) : (
            <div className="ln-i">
              <span>الشحن إلى {cityName}</span>
              <span>{verified.shipCost === 0 ? "مجاني" : formatPrice(verified.shipCost)}</span>
            </div>
          )}
          <div className="ln-i sum">
            <span>الإجمالي</span>
            <span>{formatPrice(verified.total)}</span>
          </div>
        </div>

        <ActButton style={{ marginTop: 20 }} onClick={handleAction} disabled={submitting}>
          {submitting ? "جارٍ التنفيذ…" : verified.status === "ok" ? "إتمام الطلب والدفع" : "اطلب تأكيد التوفر"}
        </ActButton>
        <div className="memo">
          {verified.status === "ok" ? (
            <>
              <b>هذا وعد ملزم.</b> إن تأخر الطلب عن {dayWord(verified.days)}، يُضاف إلى حسابك رصيد{" "}
              {toArabicDigits(PRICING_SETTINGS.lateCredit)} ريال تلقائياً ودون مطالبة منك.
            </>
          ) : (
            <>
              <b>لا تدفع الآن — بلا بيانات بطاقة وبلا حجز.</b> نؤكد لك التوفر خلال ٢٤ ساعة عبر واتساب، وعندها يصلك
              رابط دفع صالح ١٢ ساعة.
            </>
          )}
        </div>
      </Sheet>
    </section>
  );
}
