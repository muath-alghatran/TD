"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Corners } from "@/components/ui/Corners";
import { Icon } from "@/components/ui/Icon";
import { StatusPill } from "@/components/ui/StatusPill";
import { DEFAULT_PROMISE_SETTINGS } from "@/lib/default-promise-settings";
import { dayRangeWord, formatListPrice, monthsWord, toArabicDigits } from "@/lib/format";
import { POSITION_OPTIONS, SIDE_OPTIONS, partModifiers } from "@/lib/part-modifiers";
import { partOptions, partStatus, type PartOption } from "@/lib/part-promise";
import { VISIBLE_TIERS, categoryName, tierLabel, type PartType } from "@/lib/parts-offer";
import { PRICING_SETTINGS } from "@/lib/pricing-settings";
import type { SearchVehicle } from "./PartSearch";

const SUPPLY = dayRangeWord(DEFAULT_PROMISE_SETTINGS.supplyMinDays, DEFAULT_PROMISE_SETTINGS.supplyMaxDays);

export interface PartChoice {
  option: PartOption | null;
  /** الطرف والموضع — «يمين» · «فوق» */
  details: string[];
}

/**
 * بطاقة الشفافية (المرحلتان 5 و6): خيارات الجودة جنباً إلى جنب — مخزون المركز أولاً بسعره
 * الحقيقي وضمانه (أخضر، دفع فوري)، ثم أسعار القائمة الاسترشادية بوعد التوريد (كهرماني، بلا
 * دفع حتى التأكيد) — ثم «اطلب القطعة» إلى نموذج الطلب.
 */
export function PartTypeCard({
  type,
  vehicle,
  initialChoice,
  onBack,
  onOrder,
}: {
  type: PartType;
  vehicle: SearchVehicle;
  initialChoice?: PartChoice | null;
  onBack: () => void;
  onOrder: (choice: PartChoice) => void;
}) {
  const partVehicle = { make: vehicle.make, model: vehicle.model, generationCode: vehicle.generationCode ?? "" };
  const options = partOptions(partVehicle, type.key);
  const status = partStatus(partVehicle, type.key);
  const modifiers = partModifiers(type.key);
  // مخزون المركز يُختار تلقائياً — هو الأسرع والأوضح سعراً
  const [optionId, setOptionId] = useState<string | null>(
    initialChoice?.option?.id ?? options.find((o) => o.kind === "stock")?.id ?? null,
  );
  const [showAll, setShowAll] = useState(false);
  const [side, setSide] = useState<string | null>(initialChoice?.details.find((d) => (SIDE_OPTIONS as readonly string[]).includes(d)) ?? null);
  const [position, setPosition] = useState<string | null>(
    initialChoice?.details.find((d) => (POSITION_OPTIONS as readonly string[]).includes(d)) ?? null,
  );
  const titleRef = useRef<HTMLHeadingElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const hintId = useId();

  // فتح البطاقة ينقل التركيز إلى عنوانها — قارئ الشاشة يعلن القطعة ولوحة المفاتيح تبدأ منها
  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
  }, []);

  const shown = showAll ? options : options.slice(0, VISIBLE_TIERS);
  const hidden = options.length - shown.length;
  const chosen = options.find((o) => o.id === optionId) ?? null;
  const needsSide = modifiers.includes("side") && side === null;
  const needsPosition = modifiers.includes("position") && position === null;
  const ready = !needsSide && !needsPosition;
  const fromStock = chosen?.kind === "stock";

  function showMore() {
    setShowAll(true);
    // التركيز على أول خيار ظهر بدل أن يضيع مع زر «المزيد»
    requestAnimationFrame(() => gridRef.current?.querySelectorAll<HTMLButtonElement>(".tier-cell")[VISIBLE_TIERS]?.focus());
  }

  function order() {
    if (!ready) return;
    onOrder({ option: chosen, details: [side ?? "", position ?? ""].filter(Boolean) });
  }

  return (
    <section aria-labelledby="part-title">
      <button type="button" className="retreat" onClick={onBack}>
        <Icon name="chevronRight" size={16} />
        كل القطع
      </button>

      <div className="lede" style={{ marginTop: 14 }}>
        <span className="t-eyebrow">{categoryName(type.category)}</span>
        <h1 id="part-title" ref={titleRef} tabIndex={-1}>
          {type.name}
        </h1>
        {type.synonyms.length > 0 && <p>يعرفها السوق أيضاً: {type.synonyms.slice(0, 3).join("، ")}</p>}
      </div>

      <StatusPill
        status={status}
        label={status === "ok" ? "في مخزون المركز" : `توريد ${SUPPLY} · بعد تأكيد المركز`}
      />

      {modifiers.includes("side") && (
        <fieldset className="form-block">
          <legend className="label">الطرف</legend>
          <div className="chips">
            {SIDE_OPTIONS.map((o) => (
              <button key={o} type="button" className="chip" aria-pressed={side === o} onClick={() => setSide(o)}>
                {o}
              </button>
            ))}
          </div>
        </fieldset>
      )}
      {modifiers.includes("position") && (
        <fieldset className="form-block">
          <legend className="label">الموضع</legend>
          <div className="chips">
            {POSITION_OPTIONS.map((o) => (
              <button key={o} type="button" className="chip" aria-pressed={position === o} onClick={() => setPosition(o)}>
                {o}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset className="form-block">
        <legend className="label">الجودة</legend>
        {options.length > 0 ? (
          <>
            <div className="tier-grid" ref={gridRef}>
              {shown.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className={`tier-cell${o.kind === "stock" ? " is-stock" : ""}`}
                  aria-pressed={optionId === o.id}
                  onClick={() => setOptionId(optionId === o.id ? null : o.id)}
                >
                  <span className="tier-name">{tierLabel(o.tier)}</span>
                  {o.kind === "stock" && (
                    <span className="stat ok tier-stock">
                      <i />
                      في المخزون: {toArabicDigits(o.stockQty)}
                    </span>
                  )}
                  {o.price !== null ? (
                    <>
                      <span className="tier-price">
                        <b className="t-data">{formatListPrice(o.price)}</b> ر.س
                      </span>
                      <span className="tier-note">
                        {o.kind === "stock" ? "السعر النهائي شامل الضريبة" : "سعر استرشادي — يُثبَّت عند التأكيد"}
                      </span>
                    </>
                  ) : (
                    <span className="tier-note">السعر عند التأكيد</span>
                  )}
                </button>
              ))}
            </div>
            {hidden > 0 && (
              <button type="button" className="btn btn-ghost tier-more" onClick={showMore}>
                المزيد ({toArabicDigits(hidden)})
              </button>
            )}
            <p className="hint">
              {PRICING_SETTINGS.showListPrices ? "الأسعار شاملة ضريبة القيمة المضافة. " : "الأسعار عند التأكيد. "}
              اختر جودة، أو اطلب ونعرض عليك ما نؤكده من خيارات.
            </p>
          </>
        ) : (
          <div className="tier-none">السعر عند التأكيد — نعرض عليك ما نؤكده من خيارات وأسعارها قبل أي دفع.</div>
        )}
      </fieldset>

      <div className="blueprint part-terms">
        <Corners />
        <ul aria-label="قبل الطلب">
          <li>
            <Icon name="scrollText" size={18} />
            <span>
              <b>الضمان</b>{" "}
              {fromStock && chosen?.warrantyMonths ? `ضمان مكتوب ${monthsWord(chosen.warrantyMonths)}` : "يُحدَّد عند التأكيد"}
            </span>
          </li>
          <li>
            <Icon name="car" size={18} />
            <span>
              <b>التوافق</b>{" "}
              {fromStock
                ? `من مخزون المركز لجيل ${vehicle.generationCode} من ${vehicle.model}`
                : `يتأكد مع ${vehicle.label} عند التأكيد${vehicle.vin ? "" : "، ورقم الهيكل يساعد"}`}
            </span>
          </li>
          <li>
            <Icon name="receipt" size={18} />
            <span>
              <b>الدفع</b>{" "}
              {fromStock
                ? "فوري مع تأكيد الطلب — والشحن لأبعد المدن بعد تأكيد المركز"
                : "بعد أن يؤكد المركز التوفر والسعر، برابط صالح ١٢ ساعة"}
            </span>
          </li>
        </ul>
      </div>

      <div className="form-block">
        <button
          type="button"
          className="btn btn-primary btn-lg btn-block blueprint"
          aria-disabled={!ready}
          aria-describedby={ready ? undefined : hintId}
          onClick={order}
        >
          <Corners />
          اطلب القطعة
        </button>
        {!ready && (
          <p id={hintId} className="hint">
            اختر {needsSide ? "الطرف" : "الموضع"} للمتابعة.
          </p>
        )}
      </div>
    </section>
  );
}
