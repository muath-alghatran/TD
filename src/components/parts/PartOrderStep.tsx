"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { verifyPartOffer } from "@/app/actions/verify-price";
import { Shield, Wordmark } from "@/components/brand/Brand";
import { Corners } from "@/components/ui/Corners";
import { Icon } from "@/components/ui/Icon";
import { SearchSelect, type SearchOption } from "@/components/ui/SearchSelect";
import { Sheet } from "@/components/ui/Sheet";
import { StatusPill } from "@/components/ui/StatusPill";
import { CENTER, FACADE_PHOTO } from "@/lib/center-info";
import { CITIES } from "@/lib/city-catalog";
import { dayRangeWord, formatHours, formatListPrice, formatPrice, toArabicDigits } from "@/lib/format";
import { orderCode, createLocalOrder } from "@/lib/orders";
import { offerPricing, offerPromise } from "@/lib/part-promise";
import { tierLabel, type PartType } from "@/lib/parts-offer";
import { PRICING_SETTINGS } from "@/lib/pricing-settings";
import type { PromiseMode } from "@/lib/promise-engine";
import { buildPartsOrderMessage, buildWhatsAppLink } from "@/lib/whatsapp-checkout";
import { ConfidenceGauge } from "./ConfidenceGauge";
import type { PlacedOrder } from "./PartOrderOutcome";
import type { PartChoice } from "./PartTypeCard";
import type { SearchVehicle } from "./PartSearch";

const CENTER_CITY = CITIES.find((c) => c.n === CENTER.city) ?? CITIES[0];
const CITY_OPTIONS: SearchOption[] = CITIES.map((c) => ({ value: c.n, label: c.n }));
/** نقطة تركيز صورة الواجهة في شريط البطاقة العريض — أعلى من الواجهة لتبقى اللافتة في الإطار */
const FACADE_STRIP_FOCUS = "12% 30%";

/**
 * نموذج طلب القطعة (المرحلة 6): السيارة + النوع + الطرف + الجودة وسعرها + الاستلام + ملاحظات.
 * الوعد يُحسب من الدفع (قاعدة 13)، والسعر يُعاد اشتقاقه في الخادم قبل الطلب (قاعدة 18).
 * مخزون المركز = دفع فوري، والتوريد = بلا دفع حتى يؤكد المركز ثم رابط ١٢ ساعة (قواعد 11 و14 و15).
 * التصميم (ملاحظات المالك، الجولة 1): بطاقة التركيب الفاخرة بشعار المركز وصورة واجهته، وبطاقة التوصيل
 * الأبسط — مجموعة اختيار واحدة — ثم مشهد الوعد بعدّاد الثقة، والفاتورة في ورقة.
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
  const recvLabelId = useId();
  const notesId = useId();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const fitRef = useRef<HTMLButtonElement>(null);
  const shipRef = useRef<HTMLButtonElement>(null);
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

  const statusHead = promise.status === "ok" ? "مضمون الوصول" : "متوقع الوصول";
  const pillLabel =
    promise.status === "ok" ? "في مخزون المركز · دفع فوري" : fromStock ? "من مخزون المركز · يؤكده المركز" : "متوقع — يؤكده المركز";

  /** مجموعة اختيار حقيقية: الأسهم تنقل بين البطاقتين وتختار، والمختارة وحدها في ترتيب Tab */
  function onRadioKey(e: KeyboardEvent<HTMLButtonElement>) {
    if (!["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
    e.preventDefault();
    const next: PromiseMode = mode === "fit" ? "ship" : "fit";
    setMode(next);
    (next === "fit" ? fitRef : shipRef).current?.focus();
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
        <SearchSelect label="المدينة" options={CITY_OPTIONS} value={cityName} onChange={setCityName} placeholder="اكتب أو اختر مدينتك" />
      </div>

      <div className="form-block">
        <span className="label" id={recvLabelId}>
          طريقة الاستلام
        </span>
        <div className="recv" role="radiogroup" aria-labelledby={recvLabelId}>
          <button
            ref={fitRef}
            type="button"
            role="radio"
            aria-checked={mode === "fit"}
            aria-labelledby={`${recvLabelId}-fit`}
            aria-describedby={`${recvLabelId}-fit-badge ${recvLabelId}-fit-perks`}
            tabIndex={mode === "fit" ? 0 : -1}
            className="recv-card recv-fit steel blueprint"
            onClick={() => setMode("fit")}
            onKeyDown={onRadioKey}
          >
            <Corners />
            <span className="recv-media duotone">
              <Image
                src={FACADE_PHOTO}
                alt=""
                fill
                sizes="(max-width: 720px) 100vw, 680px"
                style={{ objectPosition: FACADE_STRIP_FOCUS }}
              />
            </span>
            <span className="recv-shade" aria-hidden="true" />
            <span className="recv-badge" id={`${recvLabelId}-fit-badge`}>
              الأنسب لك
            </span>
            <span className="recv-check" aria-hidden="true">
              <Icon name="check" size={14} />
            </span>
            <span className="recv-brand" aria-hidden="true">
              <Shield size={30} />
              <Wordmark tone="light" height={12} />
            </span>
            <span className="recv-body">
              <span className="recv-center">مركز ترست درايف · {CENTER.city}</span>
              <span className="recv-title" id={`${recvLabelId}-fit`}>
                تركيب في مركز {CENTER.city}
              </span>
              <span className="recv-perks" id={`${recvLabelId}-fit-perks`}>
                <span className="recv-perk">
                  <Icon name="scrollText" size={17} />
                  ضمان واحد يغطي القطعة والتركيب معاً
                </span>
                <span className="recv-perk">
                  <Icon name="clock" size={17} />
                  خلال {dayRangeWord(fitPromise.daysMin, fitPromise.days)} من الدفع
                </span>
                {PRICING_SETTINGS.fitDiscount > 0 && (
                  <span className="recv-perk">
                    <Icon name="receipt" size={17} />
                    خصم «اطلب وركّب» على أجرة اليد {toArabicDigits(Math.round(PRICING_SETTINGS.fitDiscount * 100))}٪
                  </span>
                )}
                <span className="recv-perk">
                  <Icon name="camera" size={17} />
                  صور كل مرحلة على واتساب
                </span>
              </span>
            </span>
          </button>

          <button
            ref={shipRef}
            type="button"
            role="radio"
            aria-checked={mode === "ship"}
            tabIndex={mode === "ship" ? 0 : -1}
            className="recv-card recv-ship"
            onClick={() => setMode("ship")}
            onKeyDown={onRadioKey}
          >
            <span className="recv-check" aria-hidden="true">
              <Icon name="check" size={14} />
            </span>
            <Icon name="truck" size={24} className="recv-ship-ic" />
            <span>
              <span className="recv-title">{city.n === CENTER.city ? `استلام أو توصيل في ${city.n}` : `توصيل إلى ${city.n}`}</span>
              <span className="recv-sub">
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
        </div>
      </div>

      <div className="form-block">
        <label className="label" htmlFor={notesId}>
          ملاحظات <span style={{ fontWeight: 400, color: "var(--muted)" }}>(اختياري)</span>
        </label>
        <textarea
          id={notesId}
          className="textarea"
          rows={3}
          value={notes}
          maxLength={300}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="مثل: الصوت من الجهة اليمنى عند الفرملة"
        />
      </div>

      {/* مشهد الوعد: حقل فولاذي بعدّاد الثقة — روح PromiseVerdict قبل المرحلة 5 */}
      <section className="verdict order-verdict" aria-labelledby="order-verdict-head">
        <StatusPill status={promise.status} label={pillLabel} />
        <div className="gauge-wrap">
          <ConfidenceGauge confidence={promise.confidence} status={promise.status} />
          <div className="order-verdict-say">
            <div className="say" id="order-verdict-head">
              {statusHead}
            </div>
            <div className="order-days">
              خلال <b>{dayRangeWord(promise.daysMin, promise.days)}</b> <span className="nowrap">من الدفع</span>
            </div>
          </div>
        </div>
        <ul className="order-legs">
          {promise.legs.map((leg) => (
            <li key={leg.label}>
              <span>{leg.label}</span>
              <span>{leg.daysMax === 0 ? "فوراً" : dayRangeWord(leg.daysMin, leg.daysMax)}</span>
            </li>
          ))}
        </ul>
      </section>

      <Sheet className="order-bill">
        <span className="t-eyebrow">تفصيل الحساب</span>
        <div className="ledger">
          <div className="ledger-row">
            <span>
              {type.name}
              {option ? ` · ${tierLabel(option.tier)}` : ""}
            </span>
            {pricing.unitPrice === null ? <span className="pending">عند التأكيد</span> : <span>{formatPrice(pricing.unitPrice)}</span>}
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
                {pricing.laborCost === null ? (
                  <span className="pending">تُحدَّد عند التأكيد</span>
                ) : (
                  <span>{formatPrice(pricing.laborCost)}</span>
                )}
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
            {pricing.total === null ? (
              <span className="pending">يُحدَّد عند التأكيد</span>
            ) : (
              <span>{`${formatPrice(pricing.total)} ر.س`}</span>
            )}
          </div>
        </div>
      </Sheet>

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
