"use client";

import { useEffect, useId, useRef, useState } from "react";
import { verifyPartOffer } from "@/app/actions/verify-price";
import { Corners } from "@/components/ui/Corners";
import { Icon } from "@/components/ui/Icon";
import { StatusPill } from "@/components/ui/StatusPill";
import { CENTER } from "@/lib/center-info";
import { CITIES } from "@/lib/city-catalog";
import { dayRangeWord, formatHours, formatListPrice, formatPrice, toArabicDigits } from "@/lib/format";
import { orderCode, createLocalOrder } from "@/lib/orders";
import { offerPricing, offerPromise } from "@/lib/part-promise";
import { tierLabel, type PartType } from "@/lib/parts-offer";
import { PRICING_SETTINGS } from "@/lib/pricing-settings";
import type { PromiseMode } from "@/lib/promise-engine";
import { buildPartsOrderMessage, buildWhatsAppLink } from "@/lib/whatsapp-checkout";
import type { PlacedOrder } from "./PartOrderOutcome";
import type { PartChoice } from "./PartTypeCard";
import type { SearchVehicle } from "./PartSearch";

const CENTER_CITY = CITIES.find((c) => c.n === CENTER.city) ?? CITIES[0];

/**
 * نموذج طلب القطعة (المرحلة 6): السيارة + النوع + الطرف + الجودة وسعرها + الاستلام + ملاحظات.
 * الوعد يُحسب من الدفع (قاعدة 13)، والسعر يُعاد اشتقاقه في الخادم قبل الطلب (قاعدة 18).
 * مخزون المركز = دفع فوري، والتوريد = بلا دفع حتى يؤكد المركز ثم رابط ١٢ ساعة (قواعد 11 و14 و15).
 */
export function PartOrderStep({
  type,
  vehicle,
  vehicleId,
  choice,
  onBack,
  onPlaced,
}: {
  type: PartType;
  vehicle: SearchVehicle;
  vehicleId: string;
  choice: PartChoice;
  onBack: () => void;
  onPlaced: (placed: PlacedOrder) => void;
}) {
  const [cityName, setCityName] = useState(CENTER_CITY.n);
  const [mode, setMode] = useState<PromiseMode>("fit");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [failed, setFailed] = useState(false);
  const cityId = useId();
  const notesId = useId();
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
  }, []);

  const city = CITIES.find((c) => c.n === cityName) ?? CENTER_CITY;
  const option = choice.option;
  const fromStock = option?.kind === "stock";
  const details = choice.details.join(" · ");
  const promise = offerPromise(option, city, mode);
  const pricing = offerPricing(option, city, mode);
  const shipPromise = offerPromise(option, city, "ship");
  const fitPromise = offerPromise(option, city, "fit");

  async function submit() {
    if (submitting) return;
    setSubmitting(true);
    setFailed(false);
    // لا نثق بما حُسب هنا: الخادم يعيد اشتقاق الخيار والسعر والوعد (قاعدة 18)
    const verified = await verifyPartOffer({
      vehicle: { make: vehicle.make, model: vehicle.model, generationCode: vehicle.generationCode ?? "" },
      partKey: type.key,
      optionId: option?.id ?? null,
      cityName,
      mode,
    }).catch(() => null);
    if (!verified) {
      setSubmitting(false);
      setFailed(true);
      return;
    }
    const v = verified;
    const stock = v.option?.kind === "stock";
    const order = createLocalOrder({
      vehicleId,
      vehicleVin: vehicle.vin,
      partOem: v.option?.oemNumber ?? "",
      partName: details ? `${v.partName} — ${details}` : v.partName,
      cityName: v.cityName,
      mode: v.mode,
      status: "requested",
      promisedDays: v.promise.days,
      confidenceAtOrder: v.promise.confidence,
      totalPrice: v.pricing.total ?? 0,
      paidAt: null,
      ...(v.pricing.unitPrice !== null ? { unitPrice: v.pricing.unitPrice } : {}),
      ...(v.pricing.laborCost !== null ? { laborCost: v.pricing.laborCost } : {}),
      discount: v.pricing.discount,
      shipCost: v.pricing.shipCost,
      warrantyMonths: v.option?.warrantyMonths ?? null,
      qualityTier: v.option ? tierLabel(v.option.tier) : null,
      partKey: v.partKey,
      promisedDaysMin: v.promise.daysMin,
      promiseStatus: v.promise.status,
      fromStock: stock,
      promiseLegs: v.promise.legs,
      priceIndicative: v.pricing.indicative,
      pricePending: v.pricing.unitPrice === null,
      laborPending: v.mode === "fit" && v.pricing.laborCost === null,
      laborHours: v.option?.laborHours ?? null,
      details,
      notes: notes.trim(),
    });
    const message = buildPartsOrderMessage({
      orderCode: orderCode(order.id),
      vehicleLabel: vehicle.label,
      vin: vehicle.vin,
      generationCode: vehicle.generationCode ?? "",
      partName: v.partName,
      details,
      oemNumber: stock ? (v.option?.oemNumber ?? null) : null,
      tier: v.option ? tierLabel(v.option.tier) : null,
      fromStock: stock,
      immediatePay: v.promise.status === "ok",
      cityName: v.cityName,
      mode: v.mode,
      daysMin: v.promise.daysMin,
      daysMax: v.promise.days,
      total: v.pricing.total,
      indicative: v.pricing.indicative,
      laborPending: v.mode === "fit" && v.pricing.laborCost === null,
      notes: notes.trim(),
    });
    // يُفتح بعد التحقق الخادمي، فقد يمنعه مانع النوافذ (سفاري خاصة) — شاشة النتيجة تعرض الرابط حينها
    const whatsappLink = buildWhatsAppLink(message);
    const win = window.open(whatsappLink, "_blank");
    if (win) win.opener = null;
    onPlaced({ order, whatsappLink, opened: win !== null });
  }

  return (
    <section aria-labelledby="order-title">
      <button type="button" className="retreat" onClick={onBack}>
        <Icon name="chevronRight" size={16} />
        تعديل القطعة
      </button>

      <div className="lede" style={{ marginTop: 14 }}>
        <span className="t-eyebrow">طلب القطعة</span>
        <h1 id="order-title" ref={titleRef} tabIndex={-1}>
          أين تريدها؟
        </h1>
        <p>
          {type.name}
          {details ? ` — ${details}` : ""} · {option ? tierLabel(option.tier) : "الجودة تُعرض عليك عند التأكيد"} · {vehicle.label}
        </p>
      </div>

      <div className="form-block">
        <label className="label" htmlFor={cityId}>
          المدينة
        </label>
        <select id={cityId} value={cityName} onChange={(e) => setCityName(e.target.value)}>
          {CITIES.map((c) => (
            <option key={c.n} value={c.n}>
              {c.n}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="form-block">
        <legend className="label">طريقة الاستلام</legend>
        <button type="button" className="choice" aria-pressed={mode === "fit"} onClick={() => setMode("fit")}>
          <span className="dot" />
          <span className="gen-say">
            <span className="gen-name">تركيب في مركز {CENTER.city}</span>
            <span className="gen-sub">
              خلال {dayRangeWord(fitPromise.daysMin, fitPromise.days)} من الدفع · ضمان واحد يغطي القطعة والتركيب معاً
            </span>
          </span>
        </button>
        <button type="button" className="choice" aria-pressed={mode === "ship"} onClick={() => setMode("ship")}>
          <span className="dot" />
          <span className="gen-say">
            <span className="gen-name">{city.n === CENTER.city ? `استلام أو توصيل في ${city.n}` : `توصيل إلى ${city.n}`}</span>
            <span className="gen-sub">
              خلال {dayRangeWord(shipPromise.daysMin, shipPromise.days)} من الدفع · الشحن{" "}
              {city.c === 0 ? (
                "مجاني"
              ) : (
                <>
                  <span className="t-data">{formatListPrice(city.c)}</span> ر.س
                </>
              )}
            </span>
          </span>
        </button>
      </fieldset>

      <div className="form-block">
        <label className="label" htmlFor={notesId}>
          ملاحظات <span style={{ fontWeight: 400, color: "var(--muted)" }}>(اختياري)</span>
        </label>
        <textarea
          id={notesId}
          className="textarea"
          value={notes}
          maxLength={300}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="مثل: الصوت من الجهة اليمنى عند الفرملة"
        />
      </div>

      <div className="blueprint order-sum">
        <Corners />
        <div className="order-promise">
          <StatusPill
            status={promise.status}
            label={
              promise.status === "ok" ? "في مخزون المركز · دفع فوري" : fromStock ? "من مخزون المركز · يؤكده المركز" : "متوقع — يؤكده المركز"
            }
          />
          <div className="order-days">
            خلال <b>{dayRangeWord(promise.daysMin, promise.days)}</b> من الدفع
          </div>
          <ul className="order-legs">
            {promise.legs.map((leg) => (
              <li key={leg.label}>
                <span>{leg.label}</span>
                <span>{leg.daysMax === 0 ? "فوراً" : dayRangeWord(leg.daysMin, leg.daysMax)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="ledger">
          <div className="ledger-row">
            <span>
              {type.name}
              {option ? ` · ${tierLabel(option.tier)}` : ""}
            </span>
            <span>{pricing.unitPrice === null ? "عند التأكيد" : formatPrice(pricing.unitPrice)}</span>
          </div>
          {mode === "fit" ? (
            <>
              <div className="ledger-row">
                <span>
                  أجرة التركيب
                  {option?.laborHours ? (
                    <>
                      {" "}
                      ({formatHours(option.laborHours)} × <span className="t-data">{PRICING_SETTINGS.hourRate}</span> ر.س)
                    </>
                  ) : null}
                </span>
                <span>{pricing.laborCost === null ? "تُحدَّد عند التأكيد" : formatPrice(pricing.laborCost)}</span>
              </div>
              {pricing.discount > 0 && (
                <div className="ledger-row credit-line">
                  <span>خصم «اطلب وركّب» على أجرة اليد {toArabicDigits(Math.round(PRICING_SETTINGS.fitDiscount * 100))}٪</span>
                  <span>−{formatPrice(pricing.discount)}</span>
                </div>
              )}
            </>
          ) : (
            <div className="ledger-row">
              <span>الشحن إلى {city.n}</span>
              <span>{pricing.shipCost === 0 ? "مجاني" : formatPrice(pricing.shipCost)}</span>
            </div>
          )}
          <div className="ledger-sum">
            <span>{pricing.indicative ? "الإجمالي التقديري" : "الإجمالي"}</span>
            <span>{pricing.total === null ? "يُحدَّد عند التأكيد" : `${formatPrice(pricing.total)} ر.س`}</span>
          </div>
        </div>
      </div>

      <div className="memo" style={{ marginTop: 14 }}>
        {promise.status === "ok" ? (
          <>
            <b>القطعة في مخزون المركز.</b> نرسل لك رابط الدفع مع تأكيد الطلب، ويبدأ عدّاد الوعد من لحظة الدفع.
          </>
        ) : fromStock ? (
          <>
            <b>لا دفع الآن.</b> القطعة في مخزون المركز، ونؤكد لك الشحن إلى {city.n} على واتساب، ثم يصلك رابط دفع صالح
            ١٢ ساعة.
          </>
        ) : (
          <>
            <b>لا دفع الآن.</b> نؤكد لك التوفر والسعر على واتساب، ثم يصلك رابط دفع صالح ١٢ ساعة — والسعر يُثبَّت عند
            التأكيد ولا يتغير بعده.
          </>
        )}
      </div>

      <div className="form-block">
        <button type="button" className="btn btn-primary btn-lg btn-block blueprint" aria-disabled={submitting} onClick={submit}>
          <Corners />
          <Icon name="messageCircle" size={20} />
          {submitting ? "جارٍ التحقق من السعر…" : "أرسل الطلب عبر واتساب"}
        </button>
        {failed && (
          <p className="hint" role="alert">
            تعذّر التحقق من السعر الآن. حاول مرة أخرى، أو راسلنا على واتساب مباشرة.
          </p>
        )}
      </div>
    </section>
  );
}
