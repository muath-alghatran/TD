"use client";

import { useState } from "react";
import { Sheet } from "@/components/ui/Sheet";

export interface ConfirmRow {
  key: string;
  label: string;
  value: string;
  ok: boolean;
  monospace?: boolean;
}

const TRIM_OPTIONS = [
  "2.5 لتر · فئة GLE · محرك 2AR-FE",
  "2.5 لتر · فئة GLX · محرك 2AR-FE",
  "3.5 لتر · فئة Grande · محرك 2GR-FE",
  "2.5 هايبرد · محرك A25A-FXS",
];

const CheckIcon = () => (
  <svg className="conf-ok" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

export function VehicleConfirmCard({
  rows,
  onApplyTrimFix,
  onConfirm,
  onRetake,
}: {
  rows: ConfirmRow[];
  onApplyTrimFix: (trim: string) => void;
  onConfirm: () => void;
  onRetake: () => void;
}) {
  const [fixOpen, setFixOpen] = useState(false);
  const [fixValue, setFixValue] = useState(TRIM_OPTIONS[0]);

  return (
    <section>
      <button className="retreat" onClick={onRetake}>
        ← إعادة التصوير
      </button>
      <div className="lede">
        <span className="t-eyebrow">المرحلة الثانية — تأكيد القراءة</span>
        <h1>
          هذا ما قرأناه
          <br />
          <em>راجع المبرَز فقط</em>
        </h1>
        <p>الحقول المؤكدة قرأناها بثقة عالية. الحقل المبرَز بالأصفر يحتاج نظرة منك قبل أن نعتمده.</p>
      </div>

      <Sheet>
        <div>
          {rows.map((row) => (
            <div key={row.key} className={`conf-row ${row.ok ? "" : "low"}`}>
              <span className="conf-lbl">{row.label}</span>
              <span className={`conf-val ${row.monospace ? "data" : ""}`}>{row.value}</span>
              {row.ok ? (
                <CheckIcon />
              ) : row.key === "trim" ? (
                <button className="conf-fix" onClick={() => setFixOpen(true)}>
                  تصحيح
                </button>
              ) : (
                <span className="conf-fix" style={{ borderStyle: "dashed", pointerEvents: "none" }}>
                  غير متوفر
                </span>
              )}
            </div>
          ))}
        </div>

        <div className={`conf-edit ${fixOpen ? "show" : ""}`}>
          <select value={fixValue} onChange={(e) => setFixValue(e.target.value)}>
            {TRIM_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <button
            className="act act-2"
            onClick={() => {
              onApplyTrimFix(fixValue);
              setFixOpen(false);
            }}
          >
            اعتماد التصحيح
          </button>
        </div>

        <button className="act" style={{ marginTop: 20 }} onClick={onConfirm}>
          تأكيد وحفظ في كراجي
        </button>
        <div className="memo">
          <b>يُحفظ مرة واحدة.</b> بعد التأكيد لن نسألك عن سيارتك مجدداً — ستجدها في «كراجي» مع سجل قطعها وضماناتها.
        </div>
      </Sheet>
    </section>
  );
}
