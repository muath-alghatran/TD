"use client";

import { useState } from "react";
import { StatusPill } from "@/components/ui/StatusPill";
import { VehicleConfirmCard, type ConfirmRow } from "@/components/vehicle/VehicleConfirmCard";
import { VehicleDiagramLevel1 } from "@/components/vehicle/VehicleDiagramLevel1";
import { VehicleDiagramLevel2 } from "@/components/vehicle/VehicleDiagramLevel2";
import { VehicleIdentifyForm, type VehicleIdentifyResult } from "@/components/vehicle/VehicleIdentifyForm";
import { catalogPartPromise } from "@/lib/catalog-promise";
import { CITIES } from "@/lib/city-catalog";
import { dayWord, formatPrice, toArabicDigits } from "@/lib/format";
import { saveVehicleToGarage, type GaragedVehicle } from "@/lib/garage";
import { ZONES, type CatalogPart, type CatalogZone } from "@/lib/zone-catalog";

type Step = "identify" | "confirm" | "diagram1" | "diagram2" | "partSelected";

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
  const [step, setStep] = useState<Step>("identify");
  const [pending, setPending] = useState<PendingVehicle | null>(null);
  const [saved, setSaved] = useState<GaragedVehicle | null>(null);
  const [selectedZone, setSelectedZone] = useState<CatalogZone | null>(null);
  const [selectedPart, setSelectedPart] = useState<CatalogPart | null>(null);

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
    setStep("diagram1");
  }

  function resetToIdentify() {
    setPending(null);
    setSaved(null);
    setSelectedZone(null);
    setSelectedPart(null);
    setStep("identify");
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

      {step === "diagram1" && saved && (
        <VehicleDiagramLevel1
          vehicleLabel={`${saved.make} ${saved.model} ${toArabicDigits(saved.year)}`}
          vehicleTrim={saved.trim}
          vehicleVin={saved.vin}
          onSelectZone={(zoneId) => {
            const zone = ZONES.find((z) => z.id === zoneId) ?? null;
            setSelectedZone(zone);
            setStep("diagram2");
          }}
          onChangeVehicle={resetToIdentify}
        />
      )}

      {step === "diagram2" && saved && selectedZone && (
        <VehicleDiagramLevel2
          zone={selectedZone}
          vehicle={{ make: saved.make, model: saved.model, year: saved.year }}
          onBack={() => setStep("diagram1")}
          onPickPart={(part) => {
            setSelectedPart(part);
            setStep("partSelected");
          }}
        />
      )}

      {step === "partSelected" && selectedPart && (
        <section>
          <button className="retreat" onClick={() => setStep("diagram2")}>
            ← رجوع للقطع
          </button>
          <div className="lede">
            <span className="t-eyebrow">القطعة المختارة</span>
            <h1>{selectedPart.n}</h1>
            <p className="t-data" style={{ color: "var(--text-3)" }}>
              {selectedPart.oem}
            </p>
          </div>
          <div className="sheet">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14 }}>
              <div>
                <div className="t-disp" style={{ fontSize: 22, fontWeight: 600 }}>
                  {formatPrice(selectedPart.price ?? 0)} ريال
                </div>
                <div style={{ fontSize: 12.5, color: "var(--text-2)", marginTop: 4 }}>شامل الضريبة</div>
              </div>
              {(() => {
                const result = catalogPartPromise(selectedPart, CITIES[0], "ship");
                return <StatusPill status={result.status} label={`${dayWord(result.days)}`} />;
              })()}
            </div>
            <div className="memo">
              شاشتا الاستلام والوعد والدفع لم تُبنيا بعد — المرحلة 5 القادمة. هذا ملخص عرضي فقط.
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
