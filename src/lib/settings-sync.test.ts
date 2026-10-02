import { readFileSync } from "node:fs";
import { parse } from "csv-parse/sync";
import { describe, expect, it } from "vitest";
import { DEFAULT_PROMISE_SETTINGS } from "./default-promise-settings";
import { PRICING_SETTINGS } from "./pricing-settings";

/** docs/data/settings.csv مصدر الحقيقة (قاعدة 4) — الثوابت في الكود يجب أن تطابقه حتى ينتقل إلى جدول Setting */
const rows = parse(readFileSync(new URL("../../docs/data/settings.csv", import.meta.url), "utf8"), {
  bom: true,
  columns: true,
  skip_empty_lines: true,
}) as Record<string, string>[];
const value = (name: string) => rows.find((r) => r["المتغير"] === name)?.["القيمة"];

describe("الإعدادات في الكود تطابق settings.csv", () => {
  it("محرك الوعد", () => {
    const pairs: [string, number][] = [
      ["حد الثقة العالية", DEFAULT_PROMISE_SETTINGS.hiConf],
      ["حد الثقة المتوسطة", DEFAULT_PROMISE_SETTINGS.midConf],
      ["عتبة موثوقية المورد", DEFAULT_PROMISE_SETTINGS.reliableSupplierThreshold],
      ["أيام تجهيز عند مندوب موثوق", DEFAULT_PROMISE_SETTINGS.reliablePrepDays],
      ["أيام تجهيز الطلب الخاص", DEFAULT_PROMISE_SETTINGS.specialPrepDays],
      ["يوم تركيب إضافي", DEFAULT_PROMISE_SETTINGS.fitDays],
      ["ثقة المخزون الداخلي", DEFAULT_PROMISE_SETTINGS.internalStockConfidence],
      ["ثقة أساس المورد الضعيف", DEFAULT_PROMISE_SETTINGS.weakSupplierBaseConfidence],
      ["أدنى أيام التوريد للماركات بلا مخزون", DEFAULT_PROMISE_SETTINGS.supplyMinDays],
      ["أقصى أيام التوريد للماركات بلا مخزون", DEFAULT_PROMISE_SETTINGS.supplyMaxDays],
      ["ثقة وعد التوريد", DEFAULT_PROMISE_SETTINGS.supplyConfidence],
    ];
    for (const [name, code] of pairs) expect(Number(value(name)), name).toBe(code);
  });

  it("التسعير وعرض الأسعار", () => {
    expect(Number(value("سعر ساعة العمل (ريال)"))).toBe(PRICING_SETTINGS.hourRate);
    expect(Number(value("خصم التركيب عبر الموقع"))).toBe(PRICING_SETTINGS.fitDiscount);
    expect(Number(value("قيمة تعويض تأخر الوعد (ريال)"))).toBe(PRICING_SETTINGS.lateCredit);
    expect(Number(value("نسبة ضريبة القيمة المضافة"))).toBe(PRICING_SETTINGS.vatRate);
    expect(value("عرض الأسعار الاسترشادية") === "نعم").toBe(PRICING_SETTINGS.showListPrices);
    expect(value("أسعار القائمة شاملة الضريبة") === "نعم").toBe(PRICING_SETTINGS.listPricesIncludeVat);
  });
});
