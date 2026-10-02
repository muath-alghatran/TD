import { describe, expect, it } from "vitest";
import {
  applyVinLetterFixes,
  cleanVinInput,
  decodeVin,
  groupVin,
  isCompleteVin,
  vinLetterFixes,
  vinMakeConflict,
} from "./vin";

describe("cleanVinInput", () => {
  it("يكبّر الأحرف ويحذف المسافات والشرطات والنقاط", () => {
    const r = cleanVinInput(" jtm hv-05j.804 123456 ");
    expect(r.value).toBe("JTMHV05J804123456");
    expect(r.droppedInvalid).toBe(false);
    expect(r.overflow).toBe(false);
  });

  it("يحوّل الأرقام العربية الهندية إلى لاتينية", () => {
    expect(cleanVinInput("1HGCV1F٣٠LA١٢٣٤٥٦").value).toBe("1HGCV1F30LA123456");
  });

  it("يحذف الحروف غير الإنجليزية وينبّه لذلك", () => {
    const r = cleanVinInput("1HGشCV");
    expect(r.value).toBe("1HGCV");
    expect(r.droppedInvalid).toBe(true);
  });

  it("يقصّ ما زاد على 17 خانة وينبّه لذلك", () => {
    const r = cleanVinInput("1HGCV1F30LA123456789");
    expect(r.value).toHaveLength(17);
    expect(r.overflow).toBe(true);
  });

  it("لا يحوّل I/O/Q صامتاً", () => {
    expect(cleanVinInput("1HGCV1F3OLA123456").value).toBe("1HGCV1F3OLA123456");
  });
});

describe("groupVin", () => {
  it("يجمّع الرقم الكامل 3 · 6 · 8", () => {
    expect(groupVin("JTMHV05J804123456")).toBe("JTM HV05J8 04123456");
  });

  it("يجمّع الرقم الناقص بما كُتب منه", () => {
    expect(groupVin("JTMHV")).toBe("JTM HV");
    expect(groupVin("JT")).toBe("JT");
    expect(groupVin("")).toBe("");
  });
});

describe("اقتراح تصحيح I/O/Q", () => {
  it("يقترح 0 بدل O و0 بدل Q و1 بدل I", () => {
    expect(vinLetterFixes("1HGCV1F3OLA12345Q")).toEqual([
      { from: "O", to: "0" },
      { from: "Q", to: "0" },
    ]);
    expect(vinLetterFixes("1HGCVIF30LA123456")).toEqual([{ from: "I", to: "1" }]);
    expect(vinLetterFixes("1HGCV1F30LA123456")).toEqual([]);
  });

  it("يطبّق التصحيح فيصير الرقم صالحاً", () => {
    const fixed = applyVinLetterFixes("1HGCVIF3OLA12345Q");
    expect(fixed).toBe("1HGCV1F30LA123450");
    expect(isCompleteVin(fixed)).toBe(true);
  });
});

describe("vinMakeConflict", () => {
  const HONDA_VIN = "1HGCV1F30LA123456";

  it("ينبّه حين يشير رقم الهيكل إلى ماركة غير المختارة", () => {
    expect(vinMakeConflict(HONDA_VIN, "تويوتا")).toBe("هوندا");
  });

  it("لا ينبّه حين تطابق الماركة", () => {
    expect(vinMakeConflict(HONDA_VIN, "هوندا")).toBeNull();
  });

  it("لا ينبّه لرمز مصنّع غير موجود في الجدول", () => {
    expect(vinMakeConflict("ZZZCV1F30LA123456", "تويوتا")).toBeNull();
  });

  it("لا ينبّه لرقم ناقص", () => {
    expect(vinMakeConflict("1HGCV1F30", "تويوتا")).toBeNull();
  });

  it("لا يقارن السنة — رمز سنة يخالف الاختيار لا يُطلق تنبيهاً", () => {
    // الخانة العاشرة "A" = 2010، والعميل يملك هوندا ٢٠٢٢: لا تنبيه
    expect(vinMakeConflict("1HGCV1F30AA123456", "هوندا")).toBeNull();
  });
});

describe("الماركات الست في جدول WMI", () => {
  it.each([
    ["JTMHV05J804123456", "تويوتا"],
    ["JN8AY2NY5J9123456", "نيسان"],
    ["KMHD841CAMU123456", "هيونداي"],
    ["1HGCV1F30LA123456", "هوندا"],
    ["1FTFW1E50MFA12345", "فورد"],
    ["1GKS2CKJ2LR123456", "جمس"],
  ])("%s ← %s", (vin, make) => {
    expect(decodeVin(vin).make).toBe(make);
  });

  it("لكزس ليست تويوتا (JT6 وJT8 رموز لكزس في vPIC)", () => {
    expect(decodeVin("JT6HF10U3X0123456").make).toBeNull();
    expect(decodeVin("JTHBK1GG5D2123456").make).toBeNull();
  });

  it("لا يرفض رقماً بخانة تحقق (الخانة 9) غير مطابقة", () => {
    const r = decodeVin("1HGCV1F3XLA123456");
    expect(r.valid).toBe(true);
    expect(r.make).toBe("هوندا");
  });
});

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
