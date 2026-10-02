import { describe, expect, it } from "vitest";
import { DEMO_OCR_VIN, cleanupGarage, findOrderVehicle, mergeIntoGarage, type GaragedVehicle } from "./garage";

function car(id: string, vin: string, overrides: Partial<GaragedVehicle> = {}): GaragedVehicle {
  return {
    id,
    make: "هوندا",
    model: "أكورد",
    year: 2022,
    trim: "الفئة غير محددة — قد تختلف بعض القطع",
    vin,
    plate: "—",
    savedAt: "2026-10-01T09:00:00.000Z",
    ...overrides,
  };
}

const REAL_VIN = "1HGCV1F30LA123456";

describe("mergeIntoGarage", () => {
  it("سيارتان بلا رقم هيكل تبقيان معاً", () => {
    const first = car("a", "");
    const second = car("b", "", { make: "تويوتا", model: "كامري" });
    const garage = mergeIntoGarage([first], second);
    expect(garage.map((v) => v.id)).toEqual(["a", "b"]);
  });

  it("السيارة نفسها برقم حقيقي تحل محل القديمة", () => {
    const garage = mergeIntoGarage([car("a", REAL_VIN), car("b", "")], car("c", REAL_VIN));
    expect(garage.map((v) => v.id)).toEqual(["b", "c"]);
  });

  it("رقم ناقص لا يُعامل كرقم حقيقي", () => {
    const garage = mergeIntoGarage([car("a", "1HGCV1F3")], car("b", "1HGCV1F3"));
    expect(garage).toHaveLength(2);
  });
});

describe("cleanupGarage — تنظيف لمرة واحدة", () => {
  it("يحذف سيارات القراءة التجريبية برقمها الوهمي", () => {
    const { vehicles, changed } = cleanupGarage([car("demo", DEMO_OCR_VIN), car("real", REAL_VIN)]);
    expect(vehicles.map((v) => v.id)).toEqual(["real"]);
    expect(changed).toBe(true);
  });

  it("يحوّل الغياب المخزّن نصاً إلى قيمة فارغة", () => {
    const { vehicles } = cleanupGarage([car("old", "بلا رقم هيكل")]);
    expect(vehicles[0].vin).toBe("");
  });

  it("تشغيله مرة ثانية لا يغيّر شيئاً", () => {
    const once = cleanupGarage([car("demo", DEMO_OCR_VIN), car("old", "بلا رقم هيكل"), car("real", REAL_VIN)]);
    const twice = cleanupGarage(once.vehicles);
    expect(twice.changed).toBe(false);
    expect(twice.vehicles).toEqual(once.vehicles);
  });

  it("لا يلمس كراجي سليمة", () => {
    const garage = [car("a", ""), car("b", REAL_VIN)];
    expect(cleanupGarage(garage)).toEqual({ vehicles: garage, changed: false });
  });
});

describe("findOrderVehicle", () => {
  const noVinA = car("a", "");
  const noVinB = car("b", "", { model: "سيفيك" });
  const withVin = car("c", REAL_VIN);
  const garage = [noVinA, noVinB, withVin];

  it("يطابق بمعرّف السيارة أولاً", () => {
    expect(findOrderVehicle(garage, { vehicleId: "b", vehicleVin: "" })).toBe(noVinB);
  });

  it("يطابق برقم الهيكل الحقيقي للطلبات الأقدم بلا معرّف", () => {
    expect(findOrderVehicle(garage, { vehicleVin: REAL_VIN })).toBe(withVin);
  });

  it("لا يطابق برقم فارغ — يتكرر بين السيارات", () => {
    expect(findOrderVehicle(garage, { vehicleVin: "" })).toBeUndefined();
    expect(findOrderVehicle(garage, { vehicleVin: "بلا رقم هيكل" })).toBeUndefined();
  });

  it("يرجع إلى رقم الهيكل إن حُذفت السيارة صاحبة المعرّف", () => {
    expect(findOrderVehicle(garage, { vehicleId: "gone", vehicleVin: REAL_VIN })).toBe(withVin);
  });
});

describe("رمز الجيل في كراجي (المرحلة 4)", () => {
  it("السجلات الأقدم بلا جيل تبقى صالحة ويحفظ التنظيف الجيل كما هو", () => {
    const legacy = car("old", "");
    const withGeneration = car("new", "", { generationCode: "CV" });
    const { vehicles, changed } = cleanupGarage([legacy, withGeneration]);
    expect(changed).toBe(false);
    expect(vehicles[0].generationCode).toBeUndefined();
    expect(vehicles[1].generationCode).toBe("CV");
  });
});
