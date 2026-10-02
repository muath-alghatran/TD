import { describe, expect, it } from "vitest";
import { formatWholePrice, formatYearRange } from "./format";
import { PACKAGES, activeDiscount, findPackage, packageFaq, type FaceliftPackage } from "./packages";
import { buildBookingMessage, buildPackageQuestionMessage } from "./whatsapp-requests";

const NOW = new Date("2026-10-15T12:00:00Z").getTime();

function withDiscount(over: Partial<FaceliftPackage>): FaceliftPackage {
  return {
    ...PACKAGES[0],
    price: 10000,
    regularPrice: 12500,
    discountPermitNo: "T-123456",
    discountEndsAt: "2026-10-31T23:59:59Z",
    ...over,
  };
}

describe("activeDiscount — السعر المشطوب نظامي فقط", () => {
  it("يظهر حين يكتمل الترخيص والسعر السابق ولم ينتهِ العرض، بنسبة مقرّبة للأسفل", () => {
    const d = activeDiscount(withDiscount({}), NOW);
    expect(d).not.toBeNull();
    expect(d?.percent).toBe(20);
    expect(d?.regularPrice).toBe(12500);
    expect(d?.permitNo).toBe("T-123456");
  });

  it("لا يبالغ في النسبة: 7,000 من 7,999 = ١٢٪ لا ١٣٪", () => {
    expect(activeDiscount(withDiscount({ price: 7000, regularPrice: 7999 }), NOW)?.percent).toBe(12);
  });

  it("لا خصم بلا ترخيص", () => {
    expect(activeDiscount(withDiscount({ discountPermitNo: null }), NOW)).toBeNull();
    expect(activeDiscount(withDiscount({ discountPermitNo: "" }), NOW)).toBeNull();
  });

  it("لا خصم بلا سعر سابق، أو بسعر سابق لا يزيد على المعلن", () => {
    expect(activeDiscount(withDiscount({ regularPrice: null }), NOW)).toBeNull();
    expect(activeDiscount(withDiscount({ regularPrice: 10000 }), NOW)).toBeNull();
    expect(activeDiscount(withDiscount({ regularPrice: 9000 }), NOW)).toBeNull();
  });

  it("لا خصم بعد انتهاء العرض أو بلا تاريخ انتهاء", () => {
    expect(activeDiscount(withDiscount({ discountEndsAt: "2026-10-01T00:00:00Z" }), NOW)).toBeNull();
    expect(activeDiscount(withDiscount({ discountEndsAt: null }), NOW)).toBeNull();
    expect(activeDiscount(withDiscount({ discountEndsAt: "ليس تاريخاً" }), NOW)).toBeNull();
  });

  it("الوقت غير المعروف (الخادم: 0) لا يُظهر خصماً", () => {
    expect(activeDiscount(withDiscount({}), 0)).toBeNull();
  });
});

describe("بيانات الباقات", () => {
  it("أربع باقات بمعرّفات فريدة وسنوات سليمة والبنود الثلاثة", () => {
    expect(PACKAGES).toHaveLength(4);
    expect(new Set(PACKAGES.map((p) => p.slug)).size).toBe(4);
    for (const p of PACKAGES) {
      expect(p.yearFrom).toBeLessThanOrEqual(p.yearTo);
      expect(p.includes).toEqual(["قطع الترهيم كاملة حتى الجنوط", "الرش", "التركيب"]);
      expect(p.price).toBeGreaterThan(0);
    }
  });

  it("الأسعار كما أعلنها المالك", () => {
    expect(PACKAGES.map((p) => [p.slug, p.price])).toEqual([
      ["landcruiser-2008-2015", 10000],
      ["accord-2013-2017", 7000],
      ["lexus-lx-2016-2019", 12000],
      ["patrol-2010-2024", 10000],
    ]);
  });

  it("لا خصم معروض اليوم في أي باقة — لا ترخيص في البيانات", () => {
    for (const p of PACKAGES) expect(activeDiscount(p, NOW)).toBeNull();
  });

  it("لا بيانات مخترعة: المدة والضمان والشكل والصور فارغة حتى يعطيها المركز", () => {
    for (const p of PACKAGES) {
      expect([p.durationDays, p.warranty, p.targetLook, p.regularPrice]).toEqual([null, null, null, null]);
      expect(p.gallery).toEqual([]);
    }
  });

  it("findPackage", () => {
    expect(findPackage("accord-2013-2017")?.title).toBe("ترهيم أكورد");
    expect(findPackage("غير-موجودة")).toBeUndefined();
  });
});

describe("التنسيق والرسائل", () => {
  it("السعر لاتيني بلا كسور، والسنوات سرد بالعربية الهندية", () => {
    expect(formatWholePrice(10000)).toBe("10,000");
    expect(formatWholePrice(7000)).toBe("7,000");
    expect(formatYearRange(2008, 2015)).toBe("٢٠٠٨–٢٠١٥");
  });

  it("رسالة الاستفسار عن الباقة: اسمها وسنواتها وسعرها وسطر سنة السيارة", () => {
    const msg = buildPackageQuestionMessage(PACKAGES[0]);
    expect(msg).toContain("الباقة: ترهيم لاندكروزر ٢٠٠٨–٢٠١٥");
    expect(msg).toContain("السعر المعلن: 10,000 ر.س");
    expect(msg).toContain("سنة سيارتي: ");
  });

  it("رسالة الحجز تحمل الخدمة حين تأتي من باقة، وتبقى كما هي بدونها", () => {
    const base = { vehicle: "تويوتا لاندكروزر ٢٠١٢", dayLabel: "الأحد ١٢ أكتوبر", time: "10:00 صباحاً", notes: "" };
    const withService = buildBookingMessage({ ...base, service: "معاينة باقة ترهيم لاندكروزر ٢٠٠٨–٢٠١٥" });
    expect(withService).toContain("الخدمة: معاينة باقة ترهيم لاندكروزر ٢٠٠٨–٢٠١٥");
    expect(withService.split("\n")[0]).toBe("طلب حجز معاينة — Trust Drive");
    const plain = buildBookingMessage(base);
    expect(plain).not.toContain("الخدمة:");
    expect(plain.split("\n")[0]).toBe("طلب حجز موعد فحص — Trust Drive");
  });
});

describe("أسئلة صفحة الباقة", () => {
  it("بلا مدة ولا ضمان: سؤالا الملاءمة والدفع فقط — لا وعد بلا قيمة", () => {
    const ids = packageFaq(PACKAGES[0]).map((f) => f.id);
    expect(ids).toEqual(["fit", "payment"]);
  });

  it("المدة والضمان يظهران حين يحددهما المركز", () => {
    const faq = packageFaq({ ...PACKAGES[0], durationDays: 3, warranty: "ضمان سنة على القطع والتركيب" });
    expect(faq.map((f) => f.id)).toEqual(["fit", "duration", "warranty", "payment"]);
    expect(faq[1].a).toContain("٣ أيام");
    expect(faq[2].a).toContain("ضمان سنة على القطع والتركيب");
  });

  it("سؤال الملاءمة من بيانات الباقة، والدفع بعد تأكيد المركز", () => {
    const faq = packageFaq(PACKAGES[1]);
    expect(faq[0].a).toContain("هوندا أكورد موديلات ٢٠١٣–٢٠١٧");
    expect(faq.at(-1)?.a).toContain("قبل أن يؤكد لك المركز");
  });
});
