"use client";

import { Icon } from "@/components/ui/Icon";
import { formatListPrice, toArabicDigits } from "@/lib/format";
import { PART_CATEGORIES, PART_TYPES, fromPrice } from "@/lib/parts-offer";
import { groupVin } from "@/lib/vin";
import { PartSearch, type SearchVehicle } from "./PartSearch";

const TYPES_BY_CATEGORY = PART_CATEGORIES.map((c) => ({
  ...c,
  types: PART_TYPES.filter((t) => t.category === c.key),
}));

function typesWord(n: number): string {
  if (n === 1) return "نوع واحد";
  if (n === 2) return "نوعان";
  if (n <= 10) return `${toArabicDigits(n)} أنواع`;
  return `${toArabicDigits(n)} نوعاً`;
}

/**
 * مسار القطع لكل الماركات (المرحلة 5): السيارة · البحث · «كل القطع» بالفئات الـ14.
 * المخطط يعود لهوندا في المرحلة 6.
 */
export function PartsBrowser({
  vehicle,
  initialQuery,
  onQueryChange,
  onPick,
  onChangeVehicle,
}: {
  vehicle: SearchVehicle;
  initialQuery: string;
  onQueryChange: (query: string) => void;
  onPick: (key: string) => void;
  onChangeVehicle: () => void;
}) {
  return (
    <section aria-label="قطع الغيار">
      <div className="vplate">
        <div className="ic">
          <Icon name="car" size={23} />
        </div>
        <div>
          <strong>{vehicle.label}</strong>
          <small>{vehicle.generationCode ? `الجيل ${vehicle.generationCode}` : "الجيل يُحدَّد عند التأكيد"}</small>
          {vehicle.vin && <div className="t-data">{groupVin(vehicle.vin)}</div>}
        </div>
        <button type="button" className="chg" onClick={onChangeVehicle}>
          تغيير
        </button>
      </div>

      <div className="form-block">
        <PartSearch vehicle={vehicle} initialQuery={initialQuery} onQueryChange={onQueryChange} onPick={onPick} />
      </div>

      <div className="sec-hd">
        <h2 className="sec-title">كل القطع</h2>
        <span className="t-code">
          {PART_TYPES.length} TYPES · {PART_CATEGORIES.length} GROUPS
        </span>
      </div>
      <p className="hint" style={{ marginTop: 6 }}>
        أسعار استرشادية شاملة الضريبة، تُثبَّت عند التأكيد. والتوافق مع سيارتك يتأكد عند الطلب.
      </p>

      <div className="pcat-list">
        {TYPES_BY_CATEGORY.map((category) => (
          <details key={category.key} className="pcat">
            <summary>
              <span className="pcat-name">{category.name}</span>
              <span className="pcat-count">{typesWord(category.types.length)}</span>
              <Icon name="chevronDown" size={18} className="pcat-chev" />
            </summary>
            <ul>
              {category.types.map((type) => {
                const from = fromPrice(type.key);
                return (
                  <li key={type.key}>
                    <button type="button" className="pcat-type" onClick={() => onPick(type.key)}>
                      <span className="pcat-type-name">{type.name}</span>
                      <span className="pcat-type-price">
                        {from !== null ? (
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
          </details>
        ))}
      </div>
    </section>
  );
}
