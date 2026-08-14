"use client";

import { useState } from "react";
import { VehicleConfirmCard, type ConfirmRow } from "@/components/vehicle/VehicleConfirmCard";
import { VehicleIdentifyForm, type VehicleIdentifyResult } from "@/components/vehicle/VehicleIdentifyForm";
import { saveVehicleToGarage, type GaragedVehicle } from "@/lib/garage";

interface PendingVehicle {
  make: string;
  model: string;
  year: number;
  trim: string;
  vin: string;
  plate: string;
  trimConfirmed: boolean;
}

function fromIdentifyResult(result: VehicleIdentifyResult): PendingVehicle {
  if (result.source === "ocr") {
    const { extraction } = result;
    return {
      make: extraction.make.value,
      model: extraction.model.value,
      year: extraction.year.value,
      trim: extraction.trim.value,
      vin: extraction.vin.value,
      plate: extraction.plate.value,
      trimConfirmed: false,
    };
  }
  return {
    make: result.make,
    model: result.model,
    year: result.year,
    trim: "الفئة غير محددة — قد تختلف بعض القطع",
    vin: "",
    plate: "",
    trimConfirmed: false,
  };
}

function toArabicDigits(n: number): string {
  return String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
}

function buildRows(car: PendingVehicle): ConfirmRow[] {
  return [
    { key: "make", label: "الصانع", value: car.make, ok: true },
    { key: "model", label: "الطراز", value: car.model, ok: true },
    { key: "year", label: "سنة الصنع", value: toArabicDigits(car.year), ok: true },
    { key: "vin", label: "رقم الهيكل", value: car.vin || "لم يُقرأ", ok: car.vin.length > 0, monospace: true },
    { key: "plate", label: "رقم اللوحة", value: car.plate || "—", ok: car.plate.length > 0 },
    { key: "trim", label: "الفئة والمحرك", value: car.trim, ok: car.trimConfirmed },
  ];
}

export default function Home() {
  const [step, setStep] = useState<"identify" | "confirm" | "saved">("identify");
  const [pending, setPending] = useState<PendingVehicle | null>(null);
  const [saved, setSaved] = useState<GaragedVehicle | null>(null);

  function handleIdentified(result: VehicleIdentifyResult) {
    setPending(fromIdentifyResult(result));
    setStep("confirm");
  }

  function handleApplyTrimFix(trim: string) {
    setPending((prev) => (prev ? { ...prev, trim, trimConfirmed: true } : prev));
  }

  function handleConfirm() {
    if (!pending) return;
    const record = saveVehicleToGarage({
      make: pending.make,
      model: pending.model,
      year: pending.year,
      trim: pending.trim,
      vin: pending.vin || "بلا رقم هيكل",
      plate: pending.plate || "—",
    });
    setSaved(record);
    setStep("saved");
  }

  return (
    <main className="stage">
      {step === "identify" && <VehicleIdentifyForm onIdentified={handleIdentified} />}

      {step === "confirm" && pending && (
        <VehicleConfirmCard
          rows={buildRows(pending)}
          onApplyTrimFix={handleApplyTrimFix}
          onConfirm={handleConfirm}
          onRetake={() => {
            setPending(null);
            setStep("identify");
          }}
        />
      )}

      {step === "saved" && saved && (
        <section>
          <div className="lede">
            <span className="t-eyebrow">تم الحفظ</span>
            <h1>
              سيارتك في كراجي
              <br />
              <em>جاهزة الآن</em>
            </h1>
          </div>
          <div className="vplate">
            <div className="ic">
              <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#8FA6B4" strokeWidth="1.5" strokeLinecap="round">
                <path d="M3 13.5l1.7-4.8A2.2 2.2 0 0 1 6.8 7h10.4a2.2 2.2 0 0 1 2.1 1.7L21 13.5V18h-2.4M3 18v-4.5M3 18h2.4m13.2 0H5.4" />
                <circle cx="7.4" cy="18" r="1.8" />
                <circle cx="16.6" cy="18" r="1.8" />
              </svg>
            </div>
            <div>
              <strong>
                {saved.make} {saved.model} {toArabicDigits(saved.year)}
              </strong>
              <small>{saved.trim}</small>
              <div className="t-data">{saved.vin}</div>
            </div>
            <button
              className="chg"
              onClick={() => {
                setSaved(null);
                setPending(null);
                setStep("identify");
              }}
            >
              تغيير
            </button>
          </div>
          <div className="memo">
            المخطط التفاعلي (مناطق المركبة الثماني) ومسار اختيار القطع لم يُبنَ بعد — المرحلة 4 القادمة.
          </div>
        </section>
      )}
    </main>
  );
}
