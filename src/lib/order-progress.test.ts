import { describe, expect, it } from "vitest";
import { dayRangeWord } from "./format";
import { orderDaysLabel, orderProgress } from "./order-progress";
import type { LocalOrder } from "./orders";

const base: LocalOrder = {
  id: "o1",
  vehicleVin: "",
  partOem: "",
  partName: "قماش أمامي",
  cityName: "الرياض",
  mode: "ship",
  status: "requested",
  promisedDays: 6,
  confidenceAtOrder: 0.705,
  totalPrice: 64.5,
  requestedAt: "2026-10-02T09:00:00.000Z",
  confirmedAt: null,
  paymentLinkExpiresAt: null,
  paidAt: null,
  actualDays: null,
};

const rangeOrder: LocalOrder = {
  ...base,
  partKey: "front_pads",
  promisedDaysMin: 5,
  promiseStatus: "wait",
  promiseLegs: [
    { label: "التوريد", daysMin: 3, daysMax: 4 },
    { label: "الشحن إلى الرياض", daysMin: 2, daysMax: 2 },
  ],
  priceIndicative: true,
};

describe("مدى الوعد في العرض", () => {
  it("«٣–٤ أيام» للمدى، والقيمة الواحدة كما كانت", () => {
    expect(dayRangeWord(3, 4)).toBe("٣–٤ أيام");
    expect(dayRangeWord(2, 2)).toBe("يومين");
    expect(dayRangeWord(1, 1)).toBe("يوم واحد");
  });

  it("طلب بمدى ← «٥–٦ أيام»، والطلبات القديمة بلا حد أدنى كما هي", () => {
    expect(orderDaysLabel(rangeOrder)).toBe("٥–٦ أيام");
    expect(orderDaysLabel({ promisedDays: 2 })).toBe("يومين");
  });
});

describe("تقدم طلبات المرحلة 6", () => {
  it("أجزاء الوعد كما حُسبت عند الطلب، بمداها", () => {
    expect(orderProgress(rangeOrder).legs).toEqual([
      { label: "التوريد", days: 4, daysMin: 3 },
      { label: "الشحن إلى الرياض", days: 2, daysMin: 2 },
    ]);
  });

  it("الموعد = الدفع + الحد الأعلى (قاعدة 13)", () => {
    const paid = { ...rangeOrder, status: "paid" as const, confirmedAt: "2026-10-02T10:00:00.000Z", paidAt: "2026-10-03T08:00:00.000Z" };
    expect(orderProgress(paid).dueAt?.toISOString()).toBe("2026-10-09T08:00:00.000Z");
  });

  it("التوريد: لا دفع قبل التأكيد ثم رابط ١٢ ساعة · المخزون: رابط الدفع مباشرة (قاعدة 11)", () => {
    const confirmNote = (o: LocalOrder) => orderProgress(o).stages.find((s) => s.key === "confirmed")?.note;
    expect(confirmNote(rangeOrder)).toContain("رابط دفع صالح ١٢ ساعة");
    expect(confirmNote({ ...rangeOrder, promiseStatus: "ok" })).toContain("نرسل لك رابط الدفع مباشرة");
    expect(confirmNote(base)).toContain("نتأكد من المورد");
  });
});
