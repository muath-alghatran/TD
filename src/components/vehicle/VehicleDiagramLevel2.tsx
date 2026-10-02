"use client";

import { Icon } from "@/components/ui/Icon";
import { DEFAULT_PROMISE_SETTINGS } from "@/lib/default-promise-settings";
import { DIAGRAM_ZONES, partsInZone } from "@/lib/diagram-zones";
import { dayRangeWord, dayWord, formatListPrice, toArabicDigits } from "@/lib/format";
import { partStatus, stockFitDays, stockFor, type PartVehicle } from "@/lib/part-promise";
import { findPartType, fromPrice } from "@/lib/parts-offer";

const SUPPLY = dayRangeWord(DEFAULT_PROMISE_SETTINGS.supplyMinDays, DEFAULT_PROMISE_SETTINGS.supplyMaxDays);

/**
 * مخطط المركبة — المستوى الثاني (المرحلة 6): أنواع القطع في المنطقة المختارة لسيارة هوندا،
 * كل نوع بحالته (مخزون المركز أو التوريد) وسعره، ويفتح بطاقة القطعة نفسها.
 */
export function VehicleDiagramLevel2({ zoneId, vehicle, onPick }: { zoneId: string; vehicle: PartVehicle; onPick: (key: string) => void }) {
  const zone = DIAGRAM_ZONES.find((z) => z.id === zoneId);
  if (!zone) return null;
  const keys = partsInZone(zone.id);

  return (
    <section className="zone-parts" aria-labelledby="zone-parts-title">
      <div className="sec-hd">
        <h2 id="zone-parts-title" className="sec-title">
          {zone.name}
        </h2>
        <span className="t-code">
          {zone.ref} · {keys.length} TYPES
        </span>
      </div>
      <ul className="zone-list">
        {keys.map((key) => {
          const type = findPartType(key);
          if (!type) return null;
          const stock = stockFor(vehicle, key);
          const status = partStatus(vehicle, key);
          const stockPrice = stock.length > 0 ? Math.min(...stock.map((s) => s.price)) : null;
          const from = fromPrice(key);
          return (
            <li key={key}>
              <button type="button" className="pcat-type" data-key={key} onClick={() => onPick(key)}>
                <i className={`zone-dot ${status}`} aria-hidden="true" />
                <span className="pcat-type-name">
                  {type.name}
                  <span className="zone-say">
                    {status === "ok" ? `في مخزون المركز: ${toArabicDigits(stock.reduce((n, s) => n + s.stockQty, 0))} — تركيب خلال ${dayWord(stockFitDays())}` : `توريد ${SUPPLY}`}
                  </span>
                </span>
                <span className="pcat-type-price">
                  {stockPrice !== null ? (
                    <>
                      <span className="t-data">{formatListPrice(stockPrice)}</span> ر.س
                    </>
                  ) : from !== null ? (
                    <>
                      من <span className="t-data">{formatListPrice(from)}</span> ر.س
                    </>
                  ) : (
                    "السعر عند التأكيد"
                  )}
                </span>
                <Icon name="chevronLeft" size={16} className="pcat-go" />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
