"use client";

import Link from "next/link";
import { useState } from "react";
import { PromiseVerdict } from "@/components/vehicle/PromiseVerdict";
import { ReceivingStep } from "@/components/vehicle/ReceivingStep";
import { VehicleDiagramLevel1 } from "@/components/vehicle/VehicleDiagramLevel1";
import { VehicleDiagramLevel2 } from "@/components/vehicle/VehicleDiagramLevel2";
import { VehicleIdentifyForm, type VehicleIdentifyResult } from "@/components/vehicle/VehicleIdentifyForm";
import { RegMarks } from "@/components/ui/Sheet";
import { toArabicDigits } from "@/lib/format";
import { saveVehicleToGarage, type GaragedVehicle } from "@/lib/garage";
import { orderCode, type LocalOrder } from "@/lib/orders";
import type { PromiseMode } from "@/lib/promise-engine";
import { ZONES, type CatalogPart, type CatalogZone } from "@/lib/zone-catalog";

type Step = "identify" | "diagram1" | "diagram2" | "receiving" | "verdict" | "outcome";

interface ReceivingChoice {
  cityName: string;
  mode: PromiseMode;
}

/** الفئة لا تُسأل في التحديد اليدوي — تُحدَّد عند التأكيد، ورقم الهيكل يساعد */
const UNKNOWN_TRIM = "الفئة غير محددة — قد تختلف بعض القطع";

/** تدفق طلب قطع الغيار: تحديد السيارة ← المخطط ← القطعة ← الاستلام ← الوعد. */
export function PartsOrderFlow({
  initialVehicle,
  onHome,
}: {
  /** سيارة محفوظة من "كراجي" — إن مُرِّرت، يبدأ التدفق مباشرة من المخطط العام بدل تعريف مركبة جديدة. */
  initialVehicle?: GaragedVehicle;
  onHome: () => void;
}) {
  const [step, setStep] = useState<Step>(initialVehicle ? "diagram1" : "identify");
  const [saved, setSaved] = useState<GaragedVehicle | null>(initialVehicle ?? null);
  const [selectedZone, setSelectedZone] = useState<CatalogZone | null>(null);
  const [selectedPart, setSelectedPart] = useState<CatalogPart | null>(null);
  const [receivingChoice, setReceivingChoice] = useState<ReceivingChoice | null>(null);
  const [finalOrder, setFinalOrder] = useState<LocalOrder | null>(null);

  function handleIdentified(result: VehicleIdentifyResult) {
    const record = saveVehicleToGarage({
      make: result.make,
      model: result.model,
      year: result.year,
      trim: UNKNOWN_TRIM,
      vin: result.vin,
      plate: "—",
    });
    setSaved(record);
    setStep("diagram1");
  }

  function resetToIdentify() {
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
          vehicle={{ id: saved.id, vin: saved.vin, make: saved.make, model: saved.model, year: saved.year }}
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
            <span className="t-eyebrow">تم إرسال طلبك · {orderCode(finalOrder.id)}</span>
            <h1>
              راجع رسالة واتساب
              <br />
              <em>وأرسلها لتأكيد الطلب</em>
            </h1>
            <p>
              {finalOrder.partName} · {finalOrder.partOem}
            </p>
          </div>
          <div className="sheet">
            <RegMarks />
            <div className="memo" style={{ marginTop: 0 }}>
              <b>لم يُخصم أي مبلغ.</b> فتحنا لك محادثة واتساب برسالة الطلب جاهزة — أرسلها ونؤكد التوفر والسعر
              والدفع معك مباشرة هناك.
            </div>
            <Link className="act" style={{ marginTop: 14 }} href={`/orders/${finalOrder.id}`}>
              تابع طلبك خطوة بخطوة
            </Link>
            <button className="act act-2" style={{ marginTop: 10 }} onClick={onHome}>
              الرئيسية
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
