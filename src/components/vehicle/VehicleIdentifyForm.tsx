"use client";

import { useRef, useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { extractVehicleForm, type VehicleFormExtraction } from "@/lib/ocr";
import { VEHICLE_CATALOG } from "@/lib/vehicle-catalog";

export type VehicleIdentifyResult =
  | { source: "ocr"; extraction: VehicleFormExtraction }
  | { source: "manual"; make: string; model: string; year: number };

const DOC_DEMO_ROWS: { label: string; value: string; vin?: boolean }[] = [
  { label: "الصانع", value: "تويوتا" },
  { label: "الطراز", value: "كامري" },
  { label: "سنة الصنع", value: "٢٠٢١" },
  { label: "اللون", value: "أبيض لؤلؤي" },
  { label: "رقم الهيكل", value: "JTNBE46K173012345", vin: true },
  { label: "رقم اللوحة", value: "ر ن ح ٤٧٢٩" },
];

export function VehicleIdentifyForm({ onIdentified }: { onIdentified: (result: VehicleIdentifyResult) => void }) {
  const [status, setStatus] = useState<"idle" | "reading" | "done">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");

  async function handleFile(file: File) {
    setStatus("reading");
    const extraction = await extractVehicleForm(file);
    setStatus("done");
    onIdentified({ source: "ocr", extraction });
  }

  const models = make ? Object.keys(VEHICLE_CATALOG[make]) : [];
  const years = make && model ? VEHICLE_CATALOG[make][model] : [];
  const canContinueManually = Boolean(make && model && year);

  return (
    <section>
      <div className="lede">
        <span className="t-eyebrow">المرحلة الأولى — تعريف المركبة</span>
        <h1>
          صوّر الاستمارة
          <br />
          <em>ولا تكتب شيئاً</em>
        </h1>
        <p>نقرأ الماركة والموديل وسنة الصنع ورقم الهيكل من الصورة مباشرة — ثم نعرض عليك ما قرأناه لتؤكده.</p>
      </div>

      <Sheet>
        {status === "idle" && (
          <div
            className="drop"
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
          >
            <div className="ic">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4B565C" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" />
                <rect x="8" y="9.5" width="8" height="5" rx="1" />
              </svg>
            </div>
            <strong>صوّر استمارة المركبة</strong>
            <p>أو ارفع صورة من جهازك — JPG أو PNG</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />

        {status !== "idle" && (
          <div style={{ marginTop: 14 }}>
            <div className={`doc ${status === "reading" ? "reading" : ""}`}>
              {status === "reading" && <div className="scanline" />}
              <div className="doc-hd">
                <b>المملكة العربية السعودية — استمارة مركبة</b>
                <span className="t-data">MOI · FORM</span>
              </div>
              {DOC_DEMO_ROWS.map((row) => (
                <div key={row.label} className={`doc-row ${row.vin ? "vinrow" : ""}`}>
                  <span>{row.label}</span>
                  <span>{row.value}</span>
                </div>
              ))}
            </div>
            <p className="cap">{status === "reading" ? "جارٍ قراءة الاستمارة…" : "اكتملت القراءة — ٥ من ٦ حقول بثقة عالية"}</p>
          </div>
        )}

        <div className="split">أو حدّد يدوياً</div>
        <div className="grid2">
          <select
            value={make}
            onChange={(e) => {
              setMake(e.target.value);
              setModel("");
              setYear("");
            }}
          >
            <option value="">الماركة</option>
            {Object.keys(VEHICLE_CATALOG).map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={model}
            onChange={(e) => {
              setModel(e.target.value);
              setYear("");
            }}
            disabled={!make}
          >
            <option value="">الموديل</option>
            {models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <select value={year} onChange={(e) => setYear(e.target.value)} disabled={!model}>
            <option value="">السنة</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <button
            className="act act-2"
            disabled={!canContinueManually}
            onClick={() => onIdentified({ source: "manual", make, model, year: Number(year) })}
          >
            متابعة يدوياً
          </button>
        </div>

        <div className="memo">
          <b>لماذا لا نطلب منك رقم الهيكل؟</b> لأنه مكتوب في الاستمارة أصلاً. نقرأه ونحفظه بصمت — فهو ما يفرّق بين
          فئتين من نفس الموديل، وسنحتاجه في الضمان وسجل التركيب.
        </div>
      </Sheet>
    </section>
  );
}
