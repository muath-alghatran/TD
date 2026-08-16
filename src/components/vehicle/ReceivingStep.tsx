"use client";

import { useState } from "react";
import { ActButton } from "@/components/ui/ActButton";
import { Sheet } from "@/components/ui/Sheet";
import { catalogPartPromise } from "@/lib/catalog-promise";
import { CITIES } from "@/lib/city-catalog";
import { dayWord, formatPrice, toArabicDigits } from "@/lib/format";
import { PRICING_SETTINGS } from "@/lib/pricing-settings";
import type { PromiseMode } from "@/lib/promise-engine";
import type { CatalogPart } from "@/lib/zone-catalog";

export function ReceivingStep({
  part,
  onBack,
  onIssuePromise,
}: {
  part: CatalogPart;
  onBack: () => void;
  onIssuePromise: (cityName: string, mode: PromiseMode) => void;
}) {
  const [cityName, setCityName] = useState(CITIES[0].n);
  const [mode, setMode] = useState<PromiseMode>("ship");

  const city = CITIES.find((c) => c.n === cityName) ?? CITIES[0];
  const shipResult = catalogPartPromise(part, city, "ship");
  const laborCost = (part.hrs ?? 0) * PRICING_SETTINGS.hourRate;
  const fitDiscountValue = laborCost * PRICING_SETTINGS.fitDiscount;

  return (
    <section>
      <button className="retreat" onClick={onBack}>
        ← رجوع للقطع
      </button>
      <div className="lede">
        <span className="t-eyebrow">المرحلة الخامسة — طريقة الاستلام</span>
        <h1>أين تريدها؟</h1>
        <p>المدة ونسبة الثقة تُحسبان من التزام المورد وأداء الشحن لمدينتك تحديداً.</p>
      </div>

      <Sheet>
        <label className="t-eyebrow" style={{ color: "var(--text-3)", display: "block", marginBottom: 9 }}>
          المدينة
        </label>
        <select value={cityName} onChange={(e) => setCityName(e.target.value)}>
          {CITIES.map((c) => (
            <option key={c.n} value={c.n}>
              {c.n}
            </option>
          ))}
        </select>

        <div style={{ marginTop: 20 }}>
          <div className={`pick ${mode === "ship" ? "on" : ""}`} onClick={() => setMode("ship")}>
            <div className="box" />
            <div>
              <strong>توصيل إلى عنواني</strong>
              <p>
                {city.n} — خلال {dayWord(shipResult.days)} · شحن{" "}
                {city.c === 0 ? "مجاني (داخل حائل)" : `${toArabicDigits(city.c)} ريال`}
              </p>
            </div>
          </div>
          <div className={`pick ${mode === "fit" ? "on" : ""}`} onClick={() => setMode("fit")}>
            <div className="box" />
            <div>
              <strong>تركيب في مركز Trust Drive</strong>
              <p>موعد خلال ٢٤ ساعة من وصول القطعة — وضمان واحد يغطي القطعة والتركيب معاً.</p>
              <span className="credit">
                أجرة اليد {formatPrice(laborCost)} — خصم ١٠٪ يوفّر عليك {formatPrice(fitDiscountValue)} ريال
              </span>
            </div>
          </div>
        </div>

        <ActButton style={{ marginTop: 20 }} onClick={() => onIssuePromise(cityName, mode)}>
          إصدار الوعد
        </ActButton>
      </Sheet>
    </section>
  );
}
