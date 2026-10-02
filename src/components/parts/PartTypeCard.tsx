"use client";

import { useState, type MouseEvent } from "react";
import { Corners } from "@/components/ui/Corners";
import { Icon } from "@/components/ui/Icon";
import { StatusPill } from "@/components/ui/StatusPill";
import { formatListPrice, toArabicDigits } from "@/lib/format";
import { POSITION_OPTIONS, SIDE_OPTIONS, partModifiers } from "@/lib/part-modifiers";
import {
  VISIBLE_TIERS,
  categoryName,
  partAvailability,
  qualityOptions,
  tierLabel,
  type PartType,
  type QualityTier,
} from "@/lib/parts-offer";
import { buildPartRequestMessage, buildWhatsAppLink } from "@/lib/whatsapp-requests";
import type { SearchVehicle } from "./PartSearch";

/**
 * بطاقة الشفافية (المرحلة 5): خيارات الجودة جنباً إلى جنب بأسعار القائمة الاسترشادية،
 * والضمان والتوافق «عند التأكيد»، ثم طلب عبر واتساب يؤكد فيه المركز التوفر والسعر والموعد.
 */
export function PartTypeCard({ type, vehicle, onBack }: { type: PartType; vehicle: SearchVehicle; onBack: () => void }) {
  const options = qualityOptions(type.key);
  const modifiers = partModifiers(type.key);
  const [tier, setTier] = useState<QualityTier | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [side, setSide] = useState<string | null>(null);
  const [position, setPosition] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const shown = showAll ? options : options.slice(0, VISIBLE_TIERS);
  const hidden = options.length - shown.length;
  const chosen = options.find((o) => o.tier === tier) ?? null;
  const needsSide = modifiers.includes("side") && side === null;
  const needsPosition = modifiers.includes("position") && position === null;
  const ready = !needsSide && !needsPosition;

  const message = buildPartRequestMessage({
    vehicle,
    partName: type.name,
    details: [side ?? "", position ?? ""],
    tier: chosen ? tierLabel(chosen.tier) : null,
    price: chosen?.price ?? null,
  });

  function request(e: MouseEvent<HTMLAnchorElement>) {
    if (!ready) {
      e.preventDefault();
      return;
    }
    setSent(true);
  }

  return (
    <section aria-labelledby="part-title">
      <button type="button" className="retreat" onClick={onBack}>
        <Icon name="chevronRight" size={16} />
        كل القطع
      </button>

      <div className="lede" style={{ marginTop: 14 }}>
        <span className="t-eyebrow">{categoryName(type.category)}</span>
        <h1 id="part-title">{type.name}</h1>
        {type.synonyms.length > 0 && <p>يعرفها السوق أيضاً: {type.synonyms.slice(0, 3).join("، ")}</p>}
      </div>

      <StatusPill status={partAvailability(vehicle.make, type.key)} label="التوفر يُؤكَّد عند الطلب" />

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
            <div className="tier-grid">
              {shown.map((o) => (
                <button
                  key={o.tier}
                  type="button"
                  className="tier-cell"
                  aria-pressed={tier === o.tier}
                  onClick={() => setTier(tier === o.tier ? null : o.tier)}
                >
                  <span className="tier-name">{tierLabel(o.tier)}</span>
                  {o.price !== null ? (
                    <>
                      <span className="tier-price">
                        <b className="t-data">{formatListPrice(o.price)}</b> ر.س
                      </span>
                      <span className="tier-note">سعر استرشادي — يُثبَّت عند التأكيد</span>
                    </>
                  ) : (
                    <span className="tier-note">السعر عند التأكيد</span>
                  )}
                </button>
              ))}
            </div>
            {hidden > 0 && (
              <button type="button" className="btn btn-ghost tier-more" onClick={() => setShowAll(true)}>
                المزيد ({toArabicDigits(hidden)})
              </button>
            )}
            <p className="hint">الأسعار شاملة ضريبة القيمة المضافة. اختر جودة، أو اطلب ونعرض عليك المتوفر.</p>
          </>
        ) : (
          <div className="tier-none">السعر عند التأكيد — نعرض عليك الخيارات المتوفرة وأسعارها قبل أي دفع.</div>
        )}
      </fieldset>

      <ul className="blueprint part-terms" aria-label="قبل الطلب">
        <Corners />
        <li>
          <Icon name="scrollText" size={18} />
          <span>
            <b>الضمان</b> يُحدَّد عند التأكيد
          </span>
        </li>
        <li>
          <Icon name="car" size={18} />
          <span>
            <b>التوافق</b> يتأكد مع {vehicle.label} عند التأكيد{vehicle.vin ? "" : "، ورقم الهيكل يساعد"}
          </span>
        </li>
        <li>
          <Icon name="receipt" size={18} />
          <span>
            <b>الدفع</b> لا دفع قبل أن يؤكد المركز التوفر والسعر والموعد
          </span>
        </li>
      </ul>

      <div className="form-block">
        <a
          href={buildWhatsAppLink(message)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary btn-lg btn-block blueprint"
          aria-disabled={!ready}
          onClick={request}
        >
          <Corners />
          <Icon name="messageCircle" size={20} />
          اطلب عبر واتساب
        </a>
        {!ready && <p className="hint">اختر {needsSide ? "الطرف" : "الموضع"} للمتابعة.</p>}
        {sent && (
          <div className="memo" role="status" style={{ marginTop: 12 }}>
            <b>فتحنا لك واتساب برسالة الطلب.</b> أرسلها، ونرد عليك بتأكيد التوفر والسعر والموعد.
          </div>
        )}
      </div>
    </section>
  );
}
