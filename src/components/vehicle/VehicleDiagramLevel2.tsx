"use client";

import { useState } from "react";
import { Callout } from "@/components/ui/Callout";
import { STATUS_LABEL, type PromiseStatus } from "@/components/ui/StatusPill";
import { Tag } from "@/components/ui/Tag";
import { catalogPartPromise } from "@/lib/catalog-promise";
import { CITIES } from "@/lib/city-catalog";
import { logDemandGap } from "@/lib/demand-gap";
import { dayWord, formatPrice, toArabicDigits } from "@/lib/format";
import { PartGlyph } from "@/lib/part-glyphs";
import type { CatalogPart, CatalogZone } from "@/lib/zone-catalog";

const LIT: Record<string, string> = {
  ok: "var(--ok-lit)",
  wait: "var(--wait-lit)",
  spec: "var(--spec-lit)",
  gap: "#3A4C57",
};

const DEFAULT_CITY = CITIES[0];

const W = 900;
const H = 340;
const X0 = 760;
const X1 = 140;
const Y0 = 96;
const Y1 = 250;

interface VehicleContext {
  make: string;
  model: string;
  year: number;
}

export function VehicleDiagramLevel2({
  zone,
  vehicle,
  onBack,
  onPickPart,
}: {
  zone: CatalogZone;
  vehicle: VehicleContext;
  onBack: () => void;
  onPickPart: (part: CatalogPart) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [notified, setNotified] = useState<Set<number>>(new Set());

  const N = zone.parts.length;
  const positions = zone.parts.map((_, i) => {
    const t = N === 1 ? 0.5 : i / (N - 1);
    return { cx: X0 + (X1 - X0) * t, cy: Y0 + (Y1 - Y0) * t };
  });

  function statusFor(part: CatalogPart): PromiseStatus {
    return catalogPartPromise(part, DEFAULT_CITY, "ship").status;
  }

  function handleNotify(i: number) {
    const part = zone.parts[i];
    logDemandGap({
      oemNumber: part.oem,
      partName: part.n,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      cityName: DEFAULT_CITY.n,
      reason: "قطعة غير مغطاة في الكتالوج",
    });
    setNotified((prev) => new Set(prev).add(i));
  }

  const coveredCount = zone.parts.filter((p) => p.avail !== false).length;

  return (
    <section>
      <button className="retreat" onClick={onBack}>
        ← رجوع للمخطط العام
      </button>
      <div className="lede">
        <span className="t-eyebrow">الموضع {zone.ref} — {zone.layer}</span>
        <h1 style={{ fontSize: "clamp(23px,5.4vw,31px)" }}>{zone.name}</h1>
        <p>
          {vehicle.make} {vehicle.model} {toArabicDigits(vehicle.year)} — نغطي {toArabicDigits(coveredCount)} من{" "}
          {toArabicDigits(zone.total)} قطعة في هذا الموضع. القطع غير المغطاة معروضة بالخط المتقطع.
        </p>
      </div>

      <div className="field">
        <div className="field-hd">
          <span className="t-eyebrow">مخطط متفكك — المستوى الثاني</span>
          <span className="t-data">PLATE 02 · {zone.ref} EXPLODED</span>
        </div>
        <div className="plate">
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="مخطط متفكك لقطع المنطقة">
            <line className="axis" x1={X0 + 40} y1={Y0 - 26} x2={X1 - 40} y2={Y1 + 26} />
            {zone.parts.map((part, i) => {
              const gap = part.avail === false;
              const status = gap ? "gap" : statusFor(part);
              const color = LIT[status];
              const { cx, cy } = positions[i];
              const ly = cy - 58;
              const action = () => (gap ? handleNotify(i) : onPickPart(part));
              return (
                <g
                  key={part.oem}
                  className={`pc ${gap ? "gap" : ""} ${selected === i ? "sel" : ""}`}
                  style={{ animationDelay: `${120 + i * 90}ms` }}
                  tabIndex={0}
                  role="button"
                  aria-label={part.n}
                  onClick={action}
                  onMouseEnter={() => setSelected(i)}
                  onFocus={() => setSelected(i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      action();
                    }
                  }}
                >
                  <PartGlyph type={part.g} x={cx} y={cy} />
                  <line className="lead" x1={cx} y1={cy - 34} x2={cx} y2={ly + 13} />
                  <circle className="cno" cx={cx} cy={ly} r={13} stroke={color} />
                  <text className="cnt" x={cx} y={ly} fill={color}>
                    {i + 1}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="readout">
          {selected !== null ? (
            (() => {
              const part = zone.parts[selected];
              const gap = part.avail === false;
              const status = gap ? null : statusFor(part);
              return (
                <>
                  <span className="t-data">{part.oem}</span>
                  <span>
                    <b>{part.n}</b>
                  </span>
                  <span className={`stat ${gap ? "wait" : status}`} style={{ marginInlineStart: "auto" }}>
                    <i />
                    {gap ? "غير مغطاة بعد" : STATUS_LABEL[status as PromiseStatus]}
                  </span>
                </>
              );
            })()
          ) : (
            <span className="idle">مرّر على أي قطعة في المخطط لتمييزها في القائمة</span>
          )}
        </div>
      </div>

      <div className="key">
        <span>
          <i style={{ background: "var(--ok-lit)" }} /> متوفر
        </span>
        <span>
          <i style={{ background: "var(--wait-lit)" }} /> يحتاج تأكيد
        </span>
        <span>
          <i style={{ background: "var(--spec-lit)" }} /> طلب خاص
        </span>
        <span>
          <i className="dash" /> غير مغطاة — أبلغني عند التوفر
        </span>
      </div>

      <div style={{ marginTop: 16 }}>
        {zone.parts.map((part, i) => {
          const gap = part.avail === false;
          if (gap) {
            const done = notified.has(i);
            return (
              <button
                key={part.oem}
                className={`spec gap ${selected === i ? "sel" : ""}`}
                onMouseEnter={() => setSelected(i)}
                onClick={() => handleNotify(i)}
              >
                <div className="spec-hd">
                  <div className="spec-id">
                    <Callout n={i + 1} gap />
                    <div>
                      <div className="spec-nm">{part.n}</div>
                      <div className="spec-oem">{part.oem}</div>
                    </div>
                  </div>
                </div>
                <div className="spec-ft">
                  <Tag>غير مغطاة في كتالوجنا بعد</Tag>
                  <span className={`notify ${done ? "done" : ""}`} style={{ marginInlineStart: "auto" }}>
                    {done ? "سُجّل طلبك — سنبلغك" : "أبلغني عند التوفر"}
                  </span>
                </div>
              </button>
            );
          }

          const result = catalogPartPromise(part, DEFAULT_CITY, "ship");
          return (
            <button
              key={part.oem}
              className={`spec ${selected === i ? "sel" : ""}`}
              onMouseEnter={() => setSelected(i)}
              onClick={() => onPickPart(part)}
            >
              <div className="spec-hd">
                <div className="spec-id">
                  <Callout n={i + 1} />
                  <div>
                    <div className="spec-nm">{part.n}</div>
                    <div className="spec-oem">{part.oem}</div>
                  </div>
                </div>
                <div className="spec-pr">
                  <b>{formatPrice(part.price ?? 0)}</b>
                  <small>شامل الضريبة</small>
                </div>
              </div>
              <div className="spec-ft">
                <Tag oe={part.tier === "وكالة"}>{part.tier}</Tag>
                <Tag>ضمان {toArabicDigits(part.war ?? 0)} شهر</Tag>
                <span className={`stat ${result.status}`}>
                  <i />
                  {STATUS_LABEL[result.status]} · {dayWord(result.days)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
