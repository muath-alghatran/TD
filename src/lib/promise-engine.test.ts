import { describe, expect, it } from "vitest";
import { DEFAULT_PROMISE_SETTINGS as SETTINGS } from "./default-promise-settings";
import { calcPromise, promiseLegs } from "./promise-engine";

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

describe("promiseLegs — أجزاء المدة المعروضة في «كيف حسبنا الموعد»", () => {
  it("مجموع الأجزاء يساوي أيام الوعد في كل الحالات المرجعية", () => {
    const cases = [
      { part: { stockInternal: 2, supplierReliability: 0.88 }, city: HAIL },
      { part: { stockInternal: 0, supplierReliability: 0.95 }, city: ABHA },
      { part: { stockInternal: 0, supplierReliability: 0.4 }, city: ABHA },
    ];
    for (const { part, city } of cases) {
      for (const mode of ["ship", "fit"] as const) {
        const legs = promiseLegs(part, city, mode, SETTINGS);
        const r = calcPromise(part, city, mode, SETTINGS);
        expect(Math.max(1, legs.prepDays + legs.shipDays + legs.fitDays)).toBe(r.days);
      }
    }
  });

  it("مندوب موثوق → أبها: تجهيز 2 + شحن 4، والتركيب يستبدل الشحن بيوم واحد", () => {
    const part = { stockInternal: 0, supplierReliability: 0.95 };
    expect(promiseLegs(part, ABHA, "ship", SETTINGS)).toEqual({ prepDays: 2, shipDays: 4, fitDays: 0 });
    expect(promiseLegs(part, ABHA, "fit", SETTINGS)).toEqual({ prepDays: 2, shipDays: 0, fitDays: 1 });
  });

  it("مخزون داخلي → لا أيام تجهيز", () => {
    const legs = promiseLegs({ stockInternal: 3, supplierReliability: 0.2 }, HAIL, "ship", SETTINGS);
    expect(legs.prepDays).toBe(0);
  });
});
