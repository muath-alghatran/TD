"use client";

import { formatShortDate, formatWholePrice } from "@/lib/format";
import { useNow } from "@/lib/local-store";
import { activeDiscount, hasDiscountTerms, type FaceliftPackage } from "@/lib/packages";

/**
 * سعر الباقة. الخصم يُفحص بوقت متصفح الزائر لا وقت بناء الصفحة الثابتة؛ والخادم
 * (ومن بلا JavaScript) يرى السعر بلا خصم دائماً — لا يظهر خصم ربما انتهى.
 * الباقة التي عليها بيانات خصم تحجز سطر التفصيل مسبقاً، فلا إزاحة حين يظهر.
 */
export function PackagePrice({ pkg, size = "card" }: { pkg: FaceliftPackage; size?: "card" | "page" }) {
  const now = useNow();
  const discount = activeDiscount(pkg, now);

  return (
    <div className={`pkg-price pkg-price-${size}`}>
      <div className="pkg-price-row">
        <span className="pkg-amount">
          <b className="t-data">{formatWholePrice(pkg.price)}</b> ر.س
        </span>
        {discount ? (
          <span className="tag tag-accent">
            خصم <span className="t-data">{discount.percent}%</span>
          </span>
        ) : (
          <span className="tag tag-outline">سعر شامل ثابت</span>
        )}
      </div>
      {hasDiscountTerms(pkg) && (
        <div className="pkg-price-was">
          {discount && (
            <>
              <s>
                <span className="t-data">{formatWholePrice(discount.regularPrice)}</span> ر.س
              </s>
              {" · "}حتى {formatShortDate(discount.endsAt)}
              {" · "}ترخيص رقم <span className="t-data">{discount.permitNo}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
