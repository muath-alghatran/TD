"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PartTypeCard } from "@/components/parts/PartTypeCard";
import { PartsBrowser } from "@/components/parts/PartsBrowser";
import type { SearchVehicle } from "@/components/parts/PartSearch";
import { VehicleIdentifyForm, type VehicleIdentifyResult } from "@/components/vehicle/VehicleIdentifyForm";
import { saveVehicleToGarage, vehicleLabel, type GaragedVehicle } from "@/lib/garage";
import { findPartType } from "@/lib/parts-offer";

/** الفئة لا تُسأل في التحديد اليدوي — تُحدَّد عند التأكيد، ورقم الهيكل يساعد */
const UNKNOWN_TRIM = "الفئة غير محددة — قد تختلف بعض القطع";

function toSearchVehicle(v: GaragedVehicle): SearchVehicle {
  return { make: v.make, model: v.model, year: v.year, label: vehicleLabel(v), generationCode: v.generationCode ?? "", vin: v.vin };
}

/** يضيف ‎?part=‎ للرابط أو يحذفه — مع بقية المعاملات كما هي */
function partUrl(key: string | null): string {
  const params = new URLSearchParams(window.location.search);
  if (key) params.set("part", key);
  else params.delete("part");
  const qs = params.toString();
  return qs ? `?${qs}` : window.location.pathname;
}

/**
 * تدفق قطع الغيار لكل الماركات (المرحلة 5): تحديد السيارة ← البحث أو «كل القطع» ← بطاقة
 * الشفافية ← طلب عبر واتساب. البطاقة المفتوحة في الرابط (‎?part=‎)، فزر الرجوع يعود للقائمة.
 * المخطط والوعد (VehicleDiagramLevel1/2، ReceivingStep، PromiseVerdict) يعودان لهوندا في المرحلة 6.
 */
export function PartsOrderFlow({ initialVehicle, initialQuery = "" }: { initialVehicle?: GaragedVehicle; initialQuery?: string }) {
  const searchParams = useSearchParams();
  const [saved, setSaved] = useState<GaragedVehicle | null>(initialVehicle ?? null);
  const [query, setQuery] = useState(initialQuery);
  const pushedCard = useRef(false);

  const partKey = searchParams.get("part");
  const type = partKey ? findPartType(partKey) : undefined;
  const step = !saved ? "identify" : type ? "card" : "browse";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step, partKey]);

  function handleIdentified(result: VehicleIdentifyResult) {
    const record = saveVehicleToGarage({
      make: result.make,
      model: result.model,
      year: result.year,
      generationCode: result.generationCode,
      trim: UNKNOWN_TRIM,
      vin: result.vin,
      plate: "—",
    });
    setSaved(record);
  }

  function openPart(key: string) {
    pushedCard.current = true;
    window.history.pushState(null, "", partUrl(key));
  }

  function closePart() {
    // رجعنا من بطاقة فتحناها نحن ← خطوة للخلف؛ ومن رابط مباشر ← نحذف المعامل فقط
    if (pushedCard.current) {
      pushedCard.current = false;
      window.history.back();
    } else {
      window.history.replaceState(null, "", partUrl(null));
    }
  }

  function changeVehicle() {
    if (partKey) window.history.replaceState(null, "", partUrl(null));
    setSaved(null);
  }

  return (
    <main className="stage">
      {step === "identify" && (
        <>
          {query.trim() && (
            <div className="memo" role="status" style={{ marginBottom: 18 }}>
              <b>حدّد سيارتك أولاً</b> — ثم نعرض لك نتائج «{query.trim()}».
            </div>
          )}
          <VehicleIdentifyForm onIdentified={handleIdentified} />
        </>
      )}

      {step === "browse" && saved && (
        <PartsBrowser
          vehicle={toSearchVehicle(saved)}
          initialQuery={query}
          onQueryChange={setQuery}
          onPick={openPart}
          onChangeVehicle={changeVehicle}
        />
      )}

      {step === "card" && saved && type && (
        <PartTypeCard key={type.key} type={type} vehicle={toSearchVehicle(saved)} onBack={closePart} />
      )}
    </main>
  );
}
