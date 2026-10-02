"use client";

import { useState } from "react";
import { Ruler } from "@/components/ui/Ruler";
import { dayRangeWord, toArabicDigits, typesWord } from "@/lib/format";
import { DEFAULT_PROMISE_SETTINGS } from "@/lib/default-promise-settings";
import { DIAGRAM_LAYERS, DIAGRAM_ZONES, partsInZone, type DiagramZone } from "@/lib/diagram-zones";
import { partStatus, type PartVehicle } from "@/lib/part-promise";
import type { PromiseStatus } from "@/lib/promise-engine";

const LIT: Record<PromiseStatus, string> = {
  ok: "var(--ok-lit)",
  wait: "var(--wait-lit)",
  spec: "var(--spec-lit)",
};

const SUPPLY = dayRangeWord(DEFAULT_PROMISE_SETTINGS.supplyMinDays, DEFAULT_PROMISE_SETTINGS.supplyMaxDays);

interface ZoneState {
  zone: DiagramZone;
  types: number;
  inStock: number;
  status: PromiseStatus;
}

/** حالة المنطقة لسيارة: خضراء إن كان فيها نوع في مخزون المركز، وإلا كهرمانية (توريد) */
function zoneState(zone: DiagramZone, vehicle: PartVehicle): ZoneState {
  const keys = partsInZone(zone.id);
  const inStock = keys.filter((key) => partStatus(vehicle, key) === "ok").length;
  return { zone, types: keys.length, inStock, status: inStock > 0 ? "ok" : "wait" };
}

function statusText(state: ZoneState): string {
  return state.status === "ok" ? `${toArabicDigits(state.inStock)} في مخزون المركز` : `توريد ${SUPPLY}`;
}

/**
 * مخطط المركبة — المستوى الأول (المرحلة 6): لهوندا فقط. المناطق الثماني بأنواع القطع من
 * القاموس — خضراء بمخزون المركز الحقيقي لجيل السيارة، وكهرمانية بوعد التوريد.
 */
export function VehicleDiagramLevel1({
  vehicle,
  selectedZone,
  onSelectZone,
}: {
  vehicle: PartVehicle;
  selectedZone: string | null;
  onSelectZone: (zoneId: string) => void;
}) {
  const [layer, setLayer] = useState<string>(DIAGRAM_LAYERS[0]);
  const states = DIAGRAM_ZONES.map((zone) => zoneState(zone, vehicle));
  const [readout, setReadout] = useState<ZoneState | null>(null);
  const shown = readout ?? states.find((s) => s.zone.id === selectedZone) ?? null;

  return (
    <section aria-label="مخطط المركبة">
      <div className="layers">
        {DIAGRAM_LAYERS.map((l) => (
          <button key={l} type="button" className="lay" aria-pressed={l === layer} onClick={() => setLayer(l)}>
            {l}
          </button>
        ))}
      </div>

      <div className="field">
        <div className="field-hd">
          <span className="t-eyebrow">مخطط المركبة — اختر منطقة</span>
          <span className="t-data">PLATE 01 · GENERAL ARRANGEMENT</span>
        </div>
        <div className="plate">
          <svg viewBox="0 0 900 400" role="group" aria-label="مخطط جانبي للمركبة بمناطق تفاعلية">
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
              {states.map((state, i) => {
                const { zone, status } = state;
                const color = LIT[status];
                const off = layer !== DIAGRAM_LAYERS[0] && zone.layer !== layer;
                return (
                  <g
                    key={zone.id}
                    className={`node ${off ? "off" : ""}`}
                    style={{ animationDelay: `${1200 + i * 55}ms` }}
                    tabIndex={0}
                    role="button"
                    aria-pressed={selectedZone === zone.id}
                    aria-label={`${zone.name} — ${typesWord(state.types)} — ${statusText(state)}`}
                    onClick={() => onSelectZone(zone.id)}
                    onMouseEnter={() => setReadout(state)}
                    onMouseLeave={() => setReadout(null)}
                    onFocus={() => setReadout(state)}
                    onBlur={() => setReadout(null)}
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
                      {state.types}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
        <div className="readout">
          {shown ? (
            <>
              <span className="t-data">{shown.zone.ref}</span>
              <span>
                <b>{shown.zone.name}</b> — {typesWord(shown.types)}
              </span>
              <span className={`stat ${shown.status}`} style={{ marginInlineStart: "auto" }}>
                <i />
                {statusText(shown)}
              </span>
            </>
          ) : (
            <span className="idle">اختر موضعاً — الرقم أسفل النقطة عدد أنواع القطع فيه</span>
          )}
        </div>
      </div>

      <div className="key">
        <span>
          <i style={{ background: "var(--ok-lit)" }} /> في مخزون المركز · دفع فوري
        </span>
        <span>
          <i style={{ background: "var(--wait-lit)" }} /> توريد {SUPPLY} · بعد تأكيد المركز
        </span>
      </div>
    </section>
  );
}
