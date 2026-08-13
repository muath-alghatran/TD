import { describe, expect, it } from "vitest";
import { calcPromise, type PromiseSettings } from "./promise-engine";

/** يطابق docs/data/settings.csv بعد إضافة صفوف محرك الوعد */
const SETTINGS: PromiseSettings = {
  hiConf: 0.85,
  midConf: 0.65,
  reliableSupplierThreshold: 0.55,
  reliablePrepDays: 2,
  specialPrepDays: 5,
  fitDays: 1,
  internalStockConfidence: 0.99,
  weakSupplierBaseConfidence: 0.5,
};

const HAIL = { shipDaysMax: 1, trustFactor: 1.0 };
const ABHA = { shipDaysMax: 4, trustFactor: 0.85 };

describe("calcPromise — الحالات المرجعية من docs/build-plan.md المرحلة 2", () => {
  it("مخزون داخلي → حائل = 99% أخضر", () => {
    const r = calcPromise({ stockInternal: 2, supplierReliability: 0.88 }, HAIL, "ship", SETTINGS);
    expect(r.confidence).toBeCloseTo(0.99, 5);
    expect(r.status).toBe("ok");
  });

  it("مندوب موثوق rel=.95 → أبها = 81% أصفر، 6 أيام", () => {
    const r = calcPromise({ stockInternal: 0, supplierReliability: 0.95 }, ABHA, "ship", SETTINGS);
    expect(r.days).toBe(6);
    expect(Math.round(r.confidence * 100)).toBe(81);
    expect(r.status).toBe("wait");
  });

  it("مورد ضعيف rel=.62 → حائل = 62% رمادي", () => {
    const r = calcPromise({ stockInternal: 0, supplierReliability: 0.62 }, HAIL, "ship", SETTINGS);
    expect(r.confidence).toBeCloseTo(0.62, 5);
    expect(r.status).toBe("spec");
  });

  it("نفس القطعة مع mode=fit: الثقة ترتفع لأن معامل ثقة المدينة يُلغى", () => {
    const shipResult = calcPromise({ stockInternal: 0, supplierReliability: 0.95 }, ABHA, "ship", SETTINGS);
    const fitResult = calcPromise({ stockInternal: 0, supplierReliability: 0.95 }, ABHA, "fit", SETTINGS);

    expect(fitResult.days).toBe(3); // 2 (تجهيز) + 0 (شحن) + 1 (تركيب)
    expect(fitResult.confidence).toBeCloseTo(0.95, 5); // base × 1 بدل base × trustFactor
    expect(fitResult.status).toBe("ok");
    expect(fitResult.confidence).toBeGreaterThan(shipResult.confidence);
  });

  it("الحدود الحرجة عند 0.85 و 0.65 بالضبط", () => {
    // تصميم مصطنع: مورد بثقة أساس = 0.85 بالضبط عبر مدينة بمعامل ثقة 1.0
    const atHigh = calcPromise(
      { stockInternal: 0, supplierReliability: 0.85 },
      { shipDaysMax: 1, trustFactor: 1.0 },
      "ship",
      SETTINGS,
    );
    expect(atHigh.confidence).toBeCloseTo(0.85, 5);
    expect(atHigh.status).toBe("ok");

    const atMid = calcPromise(
      { stockInternal: 0, supplierReliability: 0.65 },
      { shipDaysMax: 1, trustFactor: 1.0 },
      "ship",
      SETTINGS,
    );
    expect(atMid.confidence).toBeCloseTo(0.65, 5);
    expect(atMid.status).toBe("wait");

    const justBelowMid = calcPromise(
      { stockInternal: 0, supplierReliability: 0.64 },
      { shipDaysMax: 1, trustFactor: 1.0 },
      "ship",
      SETTINGS,
    );
    expect(justBelowMid.status).toBe("spec");
  });
});
