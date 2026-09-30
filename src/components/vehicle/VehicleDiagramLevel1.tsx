"use client";

import { useState } from "react";
import { Ruler } from "@/components/ui/Ruler";
import { STATUS_LABEL } from "@/components/ui/StatusPill";
import { CITIES } from "@/lib/city-catalog";
import { zoneStatus } from "@/lib/catalog-promise";
import { toArabicDigits } from "@/lib/format";
import { LAYERS, ZONES, type CatalogZone } from "@/lib/zone-catalog";

const LIT: Record<string, string> = {
  ok: "var(--ok-lit)",
  wait: "var(--wait-lit)",
  spec: "var(--spec-lit)",
};

const DEFAULT_CITY = CITIES[0]; // حائل — قبل بناء شاشة اختيار المدينة (المرحلة 5)

function covered(zone: CatalogZone) {
  return zone.parts.filter((p) => p.avail !== false).length;
}

export function VehicleDiagramLevel1({
  vehicleLabel,
  vehicleTrim,
  vehicleVin,
  onSelectZone,
  onChangeVehicle,
}: {
  vehicleLabel: string;
  vehicleTrim: string;
  vehicleVin: string;
  onSelectZone: (zoneId: string) => void;
  onChangeVehicle: () => void;
}) {
  const [layer, setLayer] = useState<string>(LAYERS[0]);
  const [readout, setReadout] = useState<{ zone: CatalogZone; status: string } | null>(null);

  function peek(zone: CatalogZone) {
    setReadout({ zone, status: zoneStatus(zone, DEFAULT_CITY) });
  }

  return (
    <section>
      <div className="vplate">
        <div className="ic">
          <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
            <path d="M3 13.5l1.7-4.8A2.2 2.2 0 0 1 6.8 7h10.4a2.2 2.2 0 0 1 2.1 1.7L21 13.5V18h-2.4M3 18v-4.5M3 18h2.4m13.2 0H5.4" />
            <circle cx="7.4" cy="18" r="1.8" />
            <circle cx="16.6" cy="18" r="1.8" />
          </svg>
        </div>
        <div>
          <strong>{vehicleLabel}</strong>
          <small>{vehicleTrim}</small>
          <div className="t-data">{vehicleVin}</div>
        </div>
        <button className="chg" onClick={onChangeVehicle}>
          تغيير
        </button>
      </div>

      <div className="layers">
        {LAYERS.map((l) => (
          <button key={l} className="lay" aria-pressed={l === layer} onClick={() => setLayer(l)}>
            {l}
          </button>
        ))}
      </div>

      <div className="field">
        <div className="field-hd">
          <span className="t-eyebrow">مخطط المركبة — المستوى الأول</span>
          <span className="t-data">PLATE 01 · GENERAL ARRANGEMENT</span>
        </div>
        <div className="plate">
          <svg viewBox="0 0 900 400" role="img" aria-label="مخطط جانبي للمركبة بمناطق تفاعلية">
            <Ruler />
            <line className="ln ln-fine" x1={40} y1={359} x2={862} y2={359} strokeDasharray="6 7" />
            <g>
              <path
                className="ln ln-hi drawn"
                pathLength={1}
                style={{ animationDelay: ".1s" }}
                d="M66 300 L66 246 C68 214 84 204 108 200 L286 176 L372 100 C380 92 392 88 404 88 L566 88 C580 88 592 93 600 102 L664 178 L792 196 C826 202 838 216 838 244 L838 300 Z"
              />
              <path className="glass drawn" pathLength={1} style={{ animationDelay: ".5s" }} d="M388 104 L470 104 L470 172 L322 172 Z" />
              <path className="glass drawn" pathLength={1} style={{ animationDelay: ".6s" }} d="M486 104 L562 104 L640 172 L486 172 Z" />
              <path className="ln ln-fine drawn" pathLength={1} style={{ animationDelay: ".7s" }} d="M286 176 L838 205" />
              <path className="ln ln-fine drawn" pathLength={1} style={{ animationDelay: ".75s" }} d="M478 178 L478 297" />
              <path className="ln ln-fine drawn" pathLength={1} style={{ animationDelay: ".8s" }} d="M240 300 L664 300" />
              <path className="ln ln-fine drawn" pathLength={1} style={{ animationDelay: ".85s" }} d="M424 194 L456 196" />
              <path className="ln ln-fine drawn" pathLength={1} style={{ animationDelay: ".88s" }} d="M516 198 L548 200" />
              <path className="ln ln-fine drawn" pathLength={1} style={{ animationDelay: ".9s" }} d="M372 150 L344 142 L342 156 Z" />
              <path className="ln ln-fine drawn" pathLength={1} style={{ animationDelay: ".95s" }} d="M66 230 L106 224 L108 244 L66 248" />
              <path className="ln ln-fine drawn" pathLength={1} style={{ animationDelay: ".98s" }} d="M800 212 L836 219 L838 240 L802 234" />
              <circle className="tyre drawn" pathLength={1} style={{ animationDelay: "1s" }} cx={240} cy={300} r={58} />
              <circle className="ln ln-fine drawn" pathLength={1} style={{ animationDelay: "1.1s" }} cx={240} cy={300} r={33} />
              <circle className="tyre drawn" pathLength={1} style={{ animationDelay: "1.05s" }} cx={664} cy={300} r={58} />
              <circle className="ln ln-fine drawn" pathLength={1} style={{ animationDelay: "1.15s" }} cx={664} cy={300} r={33} />
            </g>
            <g>
              {ZONES.map((zone, i) => {
                const status = zoneStatus(zone, DEFAULT_CITY);
                const color = LIT[status];
                const off = layer !== LAYERS[0] && zone.layer !== layer;
                return (
                  <g
                    key={zone.id}
                    className={`node ${off ? "off" : ""}`}
                    style={{ animationDelay: `${1200 + i * 55}ms` }}
                    tabIndex={0}
                    role="button"
                    aria-label={`${zone.name} — ${covered(zone)} قطعة مغطاة — ${STATUS_LABEL[status]}`}
                    onClick={() => onSelectZone(zone.id)}
                    onMouseEnter={() => peek(zone)}
                    onFocus={() => peek(zone)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelectZone(zone.id);
                      }
                    }}
                  >
                    <circle className="aura" cx={zone.x} cy={zone.y} r={33} fill={color} />
                    <circle className="ring" cx={zone.x} cy={zone.y} r={24} stroke={color} />
                    <circle className="core" cx={zone.x} cy={zone.y} r={16} fill={color} />
                    <text className="idx" x={zone.x} y={zone.y}>
                      {i + 1}
                    </text>
                    <text className="cov" x={zone.x} y={zone.y + 38}>
                      {covered(zone)}/{zone.total}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
        <div className="readout">
          {readout ? (
            <>
              <span className="t-data">{readout.zone.ref}</span>
              <span>
                <b>{readout.zone.name}</b> · {toArabicDigits(covered(readout.zone))} من{" "}
                {toArabicDigits(readout.zone.total)} قطعة مغطاة
              </span>
              <span className={`stat ${readout.status}`} style={{ marginInlineStart: "auto" }}>
                <i />
                {STATUS_LABEL[readout.status as "ok" | "wait" | "spec"]}
              </span>
            </>
          ) : (
            <span className="idle">مرّر على أي موضع — الرقم أسفل النقطة هو عدد القطع المغطاة فيه</span>
          )}
        </div>
      </div>

      <div className="key">
        <span>
          <i style={{ background: "var(--ok-lit)" }} /> متوفر ومؤكد
        </span>
        <span>
          <i style={{ background: "var(--wait-lit)" }} /> يحتاج تأكيد المورد
        </span>
        <span>
          <i style={{ background: "var(--spec-lit)" }} /> طلب خاص
        </span>
      </div>
    </section>
  );
}
