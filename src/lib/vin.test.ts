import { describe, expect, it } from "vitest";
import { decodeVin } from "./vin";

const NOW = new Date("2026-08-14");

describe("decodeVin", () => {
  it("يرفض VIN بطول غير 17", () => {
    const r = decodeVin("SHORTVIN123", NOW);
    expect(r.valid).toBe(false);
    expect(r.make).toBeNull();
  });

  it("يرفض VIN يحتوي حرفاً محظوراً (I/O/Q)", () => {
    const r = decodeVin("4T1BF1FK5CU1234O6", NOW);
    expect(r.valid).toBe(false);
  });

  it("يفك WMI لتويوتا أمريكا (4T1) ويقترح سنة قريبة من الآن", () => {
    // 4T1 BF1FK5 C U123456 — 17 خانة، الخانة العاشرة "C"
    const r = decodeVin("4T1BF1FK5CU123456", NOW);
    expect(r.valid).toBe(true);
    expect(r.make).toBe("تويوتا");
    expect(r.country).toBe("أمريكا");
    // رمز "C" = إزاحة 2 في دورة 30 سنة → 1982 أو 2012 أو 2042؛ الأقرب لـ2026 هو 2012
    expect(r.candidateYear).toBe(2012);
  });

  it("يفك WMI لهيونداي كوريا (KMH)", () => {
    const r = decodeVin("KMHL14JA5MA123456", NOW);
    expect(r.valid).toBe(true);
    expect(r.make).toBe("هيونداي");
    expect(r.country).toBe("كوريا الجنوبية");
  });

  it("يرجع valid=true مع make=null لرمز WMI غير موجود في الجدول", () => {
    const r = decodeVin("ZZZBF1FK5CU123456", NOW);
    expect(r.valid).toBe(true);
    expect(r.make).toBeNull();
    expect(r.reason).toBeTruthy();
  });

  it("يختار الدورة الأقرب للحاضر ولا يتجاوز السنة القادمة", () => {
    // رمز "Y" = إزاحة 20 → 2000 أو 2030؛ بالنسبة لعام 2026 يجب اختيار 2030 لا 2000
    // لأنها ضمن (السنة الحالية+1) ... تحقق: 2030 > 2027 فهي مرفوضة، يبقى 2000 هو الوحيد المؤهل
    const r = decodeVin("4T1BF1FK5YU123456", NOW);
    expect(r.candidateYear).toBe(2000);
  });
});
