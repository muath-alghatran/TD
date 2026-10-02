import { describe, expect, it } from "vitest";
import { editDistance, highlightRanges, rankParts, searchParts, searchTokens } from "./part-search";

const top3 = (q: string) => rankParts(q).slice(0, 3).map((m) => m.type.key);

describe("البحث عن قطعة — أمثلة البرومت (النوع ضمن أول 3)", () => {
  const cases: [string, string][] = [
    ["قماش قدام", "front_pads"],
    ["فحمات", "front_pads"],
    ["رديتر", "radiator"],
    ["لديتر مكيف", "ac_condenser"],
    ["كمبرسر", "ac_compressor"],
    ["مساعدات", "front_shocks"],
    ["كرسي مكينه", "engine_mount"],
    ["مقص", "front_arm"],
    ["شمعه", "headlamp"],
    ["اسطب", "tail_lamp"],
    ["بواجي", "spark_plugs"],
    ["سلف", "starter"],
    ["دينمو", "alternator"],
    ["صدام امامي", "front_bumper"],
    ["مرايه", "mirror"],
    ["ثلاجة", "ac_evaporator"],
    ["radiator", "radiator"],
    ["جنط", "rims"],
  ];
  for (const [query, key] of cases) {
    it(`«${query}» ← ${key}`, () => {
      expect(top3(query)).toContain(key);
    });
  }
});

describe("اللهجة والأخطاء والإنجليزية", () => {
  it("«قماش قدام» أمامي أولاً لا خلفي، و«قماش ورا» خلفي أولاً", () => {
    expect(rankParts("قماش قدام")[0].type.key).toBe("front_pads");
    expect(rankParts("قماش ورا")[0].type.key).toBe("rear_pads");
  });

  it("كلمة الاتجاه وحدها لا تجعل قطعة أخرى «قريبة»: «قماش قدام» يبقى في الفرامل", () => {
    const { best, near } = searchParts("قماش قدام");
    expect(best?.type.key).toBe("front_pads");
    expect(near.every((m) => m.type.category === "brakes")).toBe(true);
  });

  it("الكلمات الملتصقة: «فيبرصدام» ← فيبر صدام", () => {
    expect(top3("فيبرصدام")).toContain("bumper_retainer");
  });

  it("الإنجليزية: brake pads", () => {
    expect(top3("brake pads")).toContain("front_pads");
  });

  it("الأرقام والتشكيل والتطويل و«ال» لا تمنع التطابق", () => {
    expect(searchTokens("الـمُكيّف")).toEqual(searchTokens("مكيف"));
    expect(rankParts("ثلاجة المكيف")[0].type.key).toBe("ac_evaporator");
  });

  it("نص بلا معنى لا يرجع نتيجة فوق الحد — بحث فاشل", () => {
    const result = searchParts("ززززز قققق");
    expect(result.best).toBeNull();
    expect(result.near).toEqual([]);
    expect(result.failed).toBe(true);
  });

  it("الحقل الفارغ ليس فشلاً", () => {
    expect(searchParts("   ").failed).toBe(false);
  });

  it("أفضل تطابق ثم قريب منه بلا تكرار", () => {
    const { best, near } = searchParts("رديتر");
    expect(best?.type.key).toBe("radiator");
    expect(near.map((m) => m.type.key)).not.toContain("radiator");
    expect(near.length).toBeGreaterThan(0);
    expect(near.length).toBeLessThanOrEqual(7);
  });

  it("مسافة التحرير تعدّ التبديل خطأً واحداً", () => {
    expect(editDistance("كمبرسر", "كمبروسر")).toBe(1);
    expect(editDistance("ab", "ba")).toBe(1);
  });
});

describe("إبراز الجزء المطابق", () => {
  it("يبرز الكلمة المطابقة في النص الأصلي بمواضعه", () => {
    const display = "قماش أمامي";
    const ranges = highlightRanges(display, "قماش قدام");
    expect(ranges.map(([a, b]) => display.slice(a, b))).toEqual(["قماش", "أمامي"]);
  });

  it("يبرز المرادف حين يكون هو المطابق", () => {
    const display = "فحمات أمامية";
    expect(highlightRanges(display, "فحمات").map(([a, b]) => display.slice(a, b))).toEqual(["فحمات"]);
  });
});
