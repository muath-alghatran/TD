"use client";

import { useState } from "react";
import { PromiseVerdict } from "@/components/vehicle/PromiseVerdict";
import { ReceivingStep } from "@/components/vehicle/ReceivingStep";
import { VehicleConfirmCard, type ConfirmRow } from "@/components/vehicle/VehicleConfirmCard";
import { VehicleDiagramLevel1 } from "@/components/vehicle/VehicleDiagramLevel1";
import { VehicleDiagramLevel2 } from "@/components/vehicle/VehicleDiagramLevel2";
import { VehicleIdentifyForm, type VehicleIdentifyResult } from "@/components/vehicle/VehicleIdentifyForm";
import { toArabicDigits } from "@/lib/format";
import { saveVehicleToGarage, type GaragedVehicle } from "@/lib/garage";
import { type LocalOrder } from "@/lib/orders";
import type { PromiseMode } from "@/lib/promise-engine";
import { ZONES, type CatalogPart, type CatalogZone } from "@/lib/zone-catalog";

type Step = "identify" | "confirm" | "diagram1" | "diagram2" | "receiving" | "verdict" | "outcome";

interface PendingVehicle {
  make: string;
  model: string;
  year: number;
  trim: string;
  vin: string;
  plate: string;
  trimConfirmed: boolean;
}

interface ReceivingChoice {
  cityName: string;
  mode: PromiseMode;
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
  const [receivingChoice, setReceivingChoice] = useState<ReceivingChoice | null>(null);
  const [finalOrder, setFinalOrder] = useState<LocalOrder | null>(null);

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
    setReceivingChoice(null);
    setFinalOrder(null);
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
            setStep("receiving");
          }}
        />
      )}

      {step === "receiving" && selectedPart && (
        <ReceivingStep
          part={selectedPart}
          onBack={() => setStep("diagram2")}
          onIssuePromise={(cityName, mode) => {
            setReceivingChoice({ cityName, mode });
            setStep("verdict");
          }}
        />
      )}

      {step === "verdict" && selectedPart && receivingChoice && saved && (
        <PromiseVerdict
          part={selectedPart}
          cityName={receivingChoice.cityName}
          mode={receivingChoice.mode}
          vehicleVin={saved.vin}
          onBack={() => setStep("receiving")}
          onOutcome={(order) => {
            setFinalOrder(order);
            setStep("outcome");
          }}
        />
      )}

      {step === "outcome" && finalOrder && (
        <section>
          <div className="lede">
            <span className="t-eyebrow">{finalOrder.status === "paid" ? "تم الدفع" : "الطلب قيد المراجعة"}</span>
            <h1>
              {finalOrder.status === "paid" ? (
                <>
                  طلبك مؤكد
                  <br />
                  <em>وسيصلك حسب الوعد</em>
                </>
              ) : (
                <>
                  استلمنا طلبك
                  <br />
                  <em>سنؤكد التوفر خلال ٢٤ ساعة</em>
                </>
              )}
            </h1>
            <p>
              {finalOrder.partName} · {finalOrder.partOem}
            </p>
          </div>
          <div className="sheet">
            <div className="memo">
              {finalOrder.status === "paid" ? (
                <>
                  <b>الدفع تم بنجاح.</b> عدّاد الوعد بدأ الآن من لحظة الدفع، لا من لحظة الطلب.
                </>
              ) : (
                <>
                  <b>لم يُخصم أي مبلغ.</b> سنرسل رسالة واتساب عند تأكيد التوفر، ومعها رابط دفع صالح ١٢ ساعة.
                </>
              )}
            </div>
            <button className="act act-2" style={{ marginTop: 14 }} onClick={resetToIdentify}>
              تجربة من البداية
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
