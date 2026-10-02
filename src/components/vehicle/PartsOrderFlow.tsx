"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PartOrderOutcome } from "@/components/parts/PartOrderOutcome";
import { PartOrderStep } from "@/components/parts/PartOrderStep";
import { PartTypeCard, type PartChoice } from "@/components/parts/PartTypeCard";
import { PartsBrowser } from "@/components/parts/PartsBrowser";
import type { SearchVehicle } from "@/components/parts/PartSearch";
import { VehicleIdentifyForm, type VehicleIdentifyResult } from "@/components/vehicle/VehicleIdentifyForm";
import { saveVehicleToGarage, vehicleLabel, type GaragedVehicle } from "@/lib/garage";
import type { LocalOrder } from "@/lib/orders";
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
 * تدفق قطع الغيار (المرحلتان 5 و6): تحديد السيارة ← البحث أو «كل القطع» (وهوندا: المخطط) ←
 * بطاقة الشفافية ← نموذج الطلب (الاستلام والوعد والسعر) ← طلب في «طلباتي» ورسالة واتساب.
 * البطاقة المفتوحة في الرابط (‎?part=‎)، فزر الرجوع يعود للقائمة.
 */
export function PartsOrderFlow({ initialVehicle, initialQuery = "" }: { initialVehicle?: GaragedVehicle; initialQuery?: string }) {
  const searchParams = useSearchParams();
  const [saved, setSaved] = useState<GaragedVehicle | null>(initialVehicle ?? null);
  const [query, setQuery] = useState(initialQuery);
  const pushedCard = useRef(false);
  // الرجوع من بطاقة يعيد القائمة كما تُركت: الفئات المفتوحة، وموضع التمرير، والتركيز على ما فتحها
  const [openCategories, setOpenCategories] = useState<ReadonlySet<string>>(() => new Set());
  const [returnFocusTo, setReturnFocusTo] = useState<string | null>(null);
  const browseScroll = useRef(0);
  const lastStep = useRef<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  // اختيار البطاقة (الجودة والطرف) يبقى عند الرجوع من نموذج الطلب، والنموذج مربوط بقطعته
  const [draft, setDraft] = useState<{ key: string; choice: PartChoice } | null>(null);
  const [orderFor, setOrderFor] = useState<string | null>(null);
  const [placed, setPlaced] = useState<LocalOrder | null>(null);

  const partKey = searchParams.get("part");
  const type = partKey ? findPartType(partKey) : undefined;
  const ordering = partKey !== null && orderFor === partKey && draft?.key === partKey;
  const step = !saved ? "identify" : placed ? "done" : type ? (ordering ? "order" : "card") : "browse";

  useEffect(() => {
    const backToBrowse = step === "browse" && lastStep.current === "card";
    window.scrollTo(0, backToBrowse ? browseScroll.current : 0);
    lastStep.current = step;
  }, [step, partKey]);

  function toggleCategory(key: string, open: boolean) {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (open) next.add(key);
      else next.delete(key);
      return next;
    });
  }

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
    setOrderFor(null);
    browseScroll.current = window.scrollY;
    setReturnFocusTo(key);
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
    setSelectedZone(null);
    setSaved(null);
  }

  function another() {
    setPlaced(null);
    setDraft(null);
    setOrderFor(null);
    closePart();
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
          openCategories={openCategories}
          onToggleCategory={toggleCategory}
          returnFocusTo={returnFocusTo}
          selectedZone={selectedZone}
          onSelectZone={(zoneId) => setSelectedZone((current) => (current === zoneId ? null : zoneId))}
        />
      )}

      {step === "card" && saved && type && (
        <PartTypeCard
          key={type.key}
          type={type}
          vehicle={toSearchVehicle(saved)}
          initialChoice={draft?.key === type.key ? draft.choice : null}
          onBack={closePart}
          onOrder={(choice) => {
            setDraft({ key: type.key, choice });
            setOrderFor(type.key);
          }}
        />
      )}

      {step === "order" && saved && type && draft && (
        <PartOrderStep
          type={type}
          vehicle={toSearchVehicle(saved)}
          vehicleId={saved.id}
          choice={draft.choice}
          onBack={() => setOrderFor(null)}
          onPlaced={setPlaced}
        />
      )}

      {step === "done" && placed && <PartOrderOutcome order={placed} onAnother={another} />}
    </main>
  );
}
