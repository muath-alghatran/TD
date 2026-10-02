import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parsePartsGlossary, parsePriceList } from "../../scripts/parts-data-csv";
import { partModifiers } from "./part-modifiers";
import { PART_PRICES } from "./parts-prices";
import {
  PART_CATEGORIES,
  PART_TYPES,
  QUALITY_TIERS,
  displayPrice,
  findPartType,
  fromPrice,
  partAvailability,
  qualityOptions,
  tierLabel,
} from "./parts-offer";
import { CATALOG_MAKES } from "./vehicle-catalog";
import { buildPartNotFoundMessage, buildPartRequestMessage } from "./whatsapp-requests";

const read = (name: string) => readFileSync(new URL(`../../docs/data/${name}`, import.meta.url), "utf8");
const GLOSSARY = parsePartsGlossary(read("parts-glossary-seed.csv"));
const PRICE_LIST = parsePriceList(read("parts-price-list.csv"), GLOSSARY);

describe("سلامة القاموس وقائمة الأسعار", () => {
  it("127 نوعاً في 14 فئة، ولكل فئة أنواع", () => {
    expect(GLOSSARY).toHaveLength(127);
    expect(PART_CATEGORIES).toHaveLength(14);
    for (const c of PART_CATEGORIES) expect(GLOSSARY.some((t) => t.category === c.key), c.key).toBe(true);
  });

  it("كل part_type_key في القائمة موجود في القاموس", () => {
    const keys = new Set(GLOSSARY.map((t) => t.key));
    for (const row of PRICE_LIST) expect(keys.has(row.key), row.key).toBe(true);
  });

  it("كل سعر بين min_sar وmax_sar", () => {
    for (const row of PRICE_LIST) {
      expect(row.price, `${row.key} ${row.tier}`).toBeGreaterThanOrEqual(row.min);
      expect(row.price, `${row.key} ${row.tier}`).toBeLessThanOrEqual(row.max);
    }
  });

  it("مستويات الجودة من القائمة المسموحة فقط، ولا سطرين لنفس النوع والجودة", () => {
    const pairs = PRICE_LIST.map((r) => `${r.key}|${r.tier}`);
    expect(new Set(pairs).size).toBe(pairs.length);
    for (const r of PRICE_LIST) expect(QUALITY_TIERS).toContain(r.tier);
  });

  it("الأنواع الشائعة من خارج الملف (17) بلا سعر — والباقي له سعر", () => {
    const priced = new Set(PRICE_LIST.map((r) => r.key));
    const unpriced = GLOSSARY.filter((t) => !priced.has(t.key));
    expect(unpriced).toHaveLength(17);
    expect(unpriced.every((t) => t.confidence === "common")).toBe(true);
  });

  it("الملفان المولَّدان مطابقان للـCSV — شغّل npm run catalog:parts بعد أي تعديل", () => {
    expect(PART_TYPES).toEqual(GLOSSARY);
    expect(PART_PRICES).toEqual(PRICE_LIST.map(({ key, tier, price }) => ({ key, tier, price })));
  });

  it("المُعدِّلات لأنواع موجودة فقط", () => {
    expect(partModifiers("headlamp")).toEqual(["side"]);
    expect(partModifiers("front_arm")).toEqual(["side", "position"]);
    expect(partModifiers("oil_filter")).toEqual([]);
  });
});

describe("لا أخضر قبل مخزون حقيقي (البرومت 0-6)", () => {
  it("لكل ماركة في الكتالوج ولكل نوع: التوفر ليس «متوفر»", () => {
    for (const make of CATALOG_MAKES) {
      for (const type of PART_TYPES) expect(partAvailability(make, type.key), `${make} ${type.key}`).not.toBe("ok");
    }
  });
});

describe("عرض الأسعار الاسترشادية", () => {
  const base = { showListPrices: true, listPricesIncludeVat: false, vatRate: 0.15 };

  it("القائمة غير شاملة: تُضاف الضريبة عند العرض", () => {
    expect(displayPrice(100, base)).toBe(115);
    expect(displayPrice(199, base)).toBe(228.85);
  });

  it("القائمة شاملة: تُعرض كما هي", () => {
    expect(displayPrice(199, { ...base, listPricesIncludeVat: true })).toBe(199);
  });

  it("المفتاح مطفأ: لا سعر في أي مكان", () => {
    const off = { ...base, showListPrices: false };
    expect(displayPrice(199, off)).toBeNull();
    expect(fromPrice("ac_condenser", off)).toBeNull();
    expect(qualityOptions("ac_condenser", off).every((o) => o.price === null)).toBe(true);
  });

  it("الجودة بترتيب العرض: وكالة · أصلي · ياباني · كوري …", () => {
    for (const type of PART_TYPES) {
      const tiers = qualityOptions(type.key, base).map((o) => o.tier);
      expect(tiers).toEqual([...tiers].sort((a, b) => QUALITY_TIERS.indexOf(a) - QUALITY_TIERS.indexOf(b)));
    }
  });

  it("«من» أقل سعر معروض، والنوع بلا سعر لا «من» له", () => {
    const prices = qualityOptions("ac_condenser", base).map((o) => o.price as number);
    expect(fromPrice("ac_condenser", base)).toBe(Math.min(...prices));
    expect(fromPrice("battery", base)).toBeNull();
    expect(findPartType("battery")?.confidence).toBe("common");
  });

  it("«غير محدد» يقول ما سيحدث", () => {
    expect(tierLabel("غير محدد")).toBe("الجودة تُحدَّد عند التأكيد");
    expect(tierLabel("كوري")).toBe("كوري");
  });
});

describe("رسائل القطع على واتساب", () => {
  const vehicle = { label: "تويوتا كامري ٢٠١٧", generationCode: "XV50", vin: "" };

  it("الطلب يحمل السيارة وجيلها والقطعة وطرفها والجودة والسعر شاملاً", () => {
    const msg = buildPartRequestMessage({ vehicle, partName: "شمعة أمامية", details: ["يمين"], tier: "كوري", price: 228.85 });
    expect(msg).toContain("الجيل: XV50");
    expect(msg).toContain("القطعة: شمعة أمامية — يمين");
    expect(msg).toContain("الجودة: كوري");
    expect(msg).toContain("السعر الاسترشادي: 228.85 ر.س شامل الضريبة");
    expect(msg).toContain("قبل أي دفع");
  });

  it("بلا سعر ولا جودة: «عند التأكيد» وعرض الخيارات", () => {
    const msg = buildPartRequestMessage({ vehicle: { ...vehicle, generationCode: "" }, partName: "بطارية", details: [], tier: null, price: null });
    expect(msg).toContain("السعر: عند التأكيد");
    expect(msg).toContain("أرجو عرض الخيارات المتوفرة");
    expect(msg).toContain("الجيل: يُحدَّد عند التأكيد من رقم الهيكل");
  });

  it("«ما لقيت قطعتي» ينقل النص كما كتبه العميل", () => {
    expect(buildPartNotFoundMessage({ vehicle, searchText: "لمبة خلفية" })).toContain("«لمبة خلفية»");
    expect(buildPartNotFoundMessage({ vehicle: null, searchText: "x" })).not.toContain("السيارة:");
  });
});
