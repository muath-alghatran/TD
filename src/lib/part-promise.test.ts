import { describe, expect, it } from "vitest";
import { parseHondaInventory } from "../../scripts/honda-inventory-csv";
import { CITIES } from "./city-catalog";
import { DIAGRAM_ZONES, partsInZone, zoneOfPart } from "./diagram-zones";
import { HONDA_INVENTORY } from "./honda-inventory";
import type { StockItem } from "./inventory-schema";
import { offerPricing, offerPromise, partOptions, partStatus, stockFor } from "./part-promise";
import { PART_TYPES } from "./parts-dictionary";
import { CATALOG_MAKES } from "./vehicle-catalog";

const city = (name: string) => CITIES.find((c) => c.n === name)!;
const HAIL = city("حائل");
const RIYADH = city("الرياض");
const ABHA = city("أبها");

/** مخزون تجريبي للاختبار فقط — لا يُرفع كبيانات حقيقية */
const STOCK: StockItem[] = [
  {
    generationCode: "CV",
    model: "أكورد",
    zone: "Z3",
    partKey: "front_pads",
    oemNumber: "TEST-0001",
    name: "قماش أمامي أكورد",
    tier: "وكالة",
    origin: "اليابان",
    price: 240,
    stockQty: 3,
    warrantyMonths: 12,
    laborHours: 1.5,
  },
  { ...base("front_shocks"), stockQty: 0 },
];
function base(partKey: string): StockItem {
  return { generationCode: "CV", model: "أكورد", zone: "Z3", partKey, oemNumber: `TEST-${partKey}`, name: partKey, tier: "أصلي", origin: "", price: 100, stockQty: 2, warrantyMonths: null, laborHours: null };
}

const accordCV = { make: "هوندا", model: "أكورد", generationCode: "CV" };

describe("لا أخضر إلا بمخزون حقيقي (البرومت 0-6، قاعدة 11)", () => {
  it("المخزون الحقيقي فارغ اليوم: لا أخضر لأي ماركة ولا نوع", () => {
    expect(HONDA_INVENTORY).toEqual([]);
    for (const make of CATALOG_MAKES) {
      for (const type of PART_TYPES) {
        expect(partStatus({ make, model: "أي", generationCode: "X" }, type.key), `${make} ${type.key}`).not.toBe("ok");
      }
    }
  });

  it("هوندا أخضر فقط بصف يطابق الجيل والموديل وبكمية > 0", () => {
    expect(partStatus(accordCV, "front_pads", STOCK)).toBe("ok");
    expect(partStatus(accordCV, "front_shocks", STOCK)).toBe("wait"); // كمية صفر
    expect(partStatus({ ...accordCV, generationCode: "CR" }, "front_pads", STOCK)).toBe("wait"); // جيل آخر
    expect(partStatus({ ...accordCV, generationCode: "" }, "front_pads", STOCK)).toBe("wait"); // جيل غير معروف
    expect(partStatus({ ...accordCV, model: "سيفيك" }, "front_pads", STOCK)).toBe("wait"); // موديل آخر
  });

  it("الماركات الأخرى لا تلمس مخزون هوندا ولو تطابق الرمز", () => {
    expect(stockFor({ make: "تويوتا", model: "أكورد", generationCode: "CV" }, "front_pads", STOCK)).toEqual([]);
  });
});

describe("خيارات القطعة", () => {
  it("المخزون أولاً بسعره الحقيقي، ثم القائمة للجودات التي لا يغطيها", () => {
    const options = partOptions(accordCV, "front_pads", STOCK);
    expect(options[0]).toMatchObject({ kind: "stock", tier: "وكالة", price: 240, stockQty: 3, warrantyMonths: 12 });
    expect(options.slice(1).every((o) => o.kind === "list")).toBe(true);
    expect(options.filter((o) => o.tier === "وكالة")).toHaveLength(1);
  });

  it("بلا مخزون: خيارات القائمة فقط", () => {
    expect(partOptions({ make: "تويوتا", model: "كامري", generationCode: "XV50" }, "front_pads", STOCK).every((o) => o.kind === "list")).toBe(true);
  });
});

describe("الوعد لخيار ومدينة", () => {
  const listOption = { kind: "list" as const, stockQty: 0 };
  const stockOption = { kind: "stock" as const, stockQty: 3 };

  it("القائمة: التركيب أو حائل ٣–٤، الرياض ٥–٦، أبها ٧–٨ — كهرماني", () => {
    const fit = offerPromise(listOption, ABHA, "fit");
    expect([fit.daysMin, fit.days, fit.status]).toEqual([3, 4, "wait"]);
    const hail = offerPromise(listOption, HAIL, "ship");
    expect([hail.daysMin, hail.days]).toEqual([3, 4]);
    expect([offerPromise(listOption, RIYADH, "ship").daysMin, offerPromise(listOption, RIYADH, "ship").days]).toEqual([5, 6]);
    expect(offerPromise(listOption, ABHA, "ship").days).toBe(8);
  });

  it("المخزون: تجهيز صفر وأخضر — يوم التركيب أو أيام الشحن", () => {
    const fit = offerPromise(stockOption, HAIL, "fit");
    expect([fit.daysMin, fit.days, fit.status]).toEqual([1, 1, "ok"]);
    const riyadh = offerPromise(stockOption, RIYADH, "ship");
    expect([riyadh.days, riyadh.status]).toEqual([2, "ok"]);
  });

  it("المخزون المشحون لأبعد المدن يتبع المحرك: الثقة دون الأخضر فكهرماني (قاعدة 11)", () => {
    expect(offerPromise(stockOption, ABHA, "ship").status).toBe("wait");
    expect(offerPromise(stockOption, city("جازان"), "ship").status).toBe("wait");
    expect(offerPromise(stockOption, ABHA, "fit").status).toBe("ok");
  });

  it("أجزاء الوعد تساوي حدّيه", () => {
    for (const option of [listOption, stockOption, null]) {
      for (const c of [HAIL, RIYADH, ABHA]) {
        for (const mode of ["ship", "fit"] as const) {
          const p = offerPromise(option, c, mode);
          const sumMin = p.legs.reduce((s, l) => s + l.daysMin, 0);
          const sumMax = p.legs.reduce((s, l) => s + l.daysMax, 0);
          expect(Math.max(1, sumMin)).toBe(p.daysMin);
          expect(Math.max(1, sumMax)).toBe(p.days);
        }
      }
    }
  });
});

describe("تفصيل السعر", () => {
  it("المخزون مع التركيب: أجرة الساعات وخصم الموقع", () => {
    const p = offerPricing({ kind: "stock", price: 240, laborHours: 1.5 }, HAIL, "fit");
    expect(p).toMatchObject({ unitPrice: 240, laborCost: 180, discount: 18, shipCost: 0, total: 402, indicative: false });
  });

  it("القائمة مع التركيب: الأجرة تُحدَّد عند التأكيد، والإجمالي بما هو معروف", () => {
    const p = offerPricing({ kind: "list", price: 34.5, laborHours: null }, HAIL, "fit");
    expect(p).toMatchObject({ laborCost: null, total: 34.5, indicative: true });
  });

  it("الشحن من تكلفة المدينة، وبلا سعر للقطعة لا إجمالي", () => {
    expect(offerPricing({ kind: "list", price: 100, laborHours: null }, RIYADH, "ship").total).toBe(100 + RIYADH.c);
    expect(offerPricing(null, RIYADH, "ship").total).toBeNull();
  });
});

describe("مناطق المخطط", () => {
  it("كل نوع في القاموس له منطقة من الثماني، وكل منطقة فيها أنواع", () => {
    const ids = new Set(DIAGRAM_ZONES.map((z) => z.id));
    for (const t of PART_TYPES) expect(ids.has(zoneOfPart(t.key) ?? ""), t.key).toBe(true);
    for (const z of DIAGRAM_ZONES) expect(partsInZone(z.id).length, z.name).toBeGreaterThan(0);
  });

  it("الخلفي في المناطق الخلفية", () => {
    expect(zoneOfPart("front_pads")).toBe("Z3");
    expect(zoneOfPart("rear_pads")).toBe("Z7");
    expect(zoneOfPart("tail_lamp")).toBe("Z8");
  });
});

describe("ملف مخزون هوندا", () => {
  const header = "generation_code,model,zone,part_key,oem_number,name_ar,quality_tier,origin,price_sar,stock_qty,warranty_months,labor_hours";
  const row = "CV,أكورد,Z3,front_pads,45022-TVA-A01,قماش أمامي أكورد,وكالة,اليابان,240,3,12,1.5";

  it("صف صحيح يُقرأ بأنواعه", () => {
    expect(parseHondaInventory(`${header}\n${row}\n`)).toEqual([
      expect.objectContaining({ generationCode: "CV", partKey: "front_pads", price: 240, stockQty: 3, warrantyMonths: 12, laborHours: 1.5 }),
    ]);
  });

  it("القالب الفارغ والملف الفارغ مخزون فارغ", () => {
    expect(parseHondaInventory(`${header}\n`)).toEqual([]);
    expect(parseHondaInventory("")).toEqual([]);
  });

  it("يرفض أي عمود زائد — لا تكلفة ولا سعر مورد في مستودع عام", () => {
    expect(() => parseHondaInventory(`${header},cost_sar\n${row},150\n`)).toThrow(/الأعمدة/);
  });

  it("يرفض جيلاً أو نوعاً أو منطقة أو كمية غير صالحة", () => {
    expect(() => parseHondaInventory(`${header}\n${row.replace("CV,", "XX,")}\n`)).toThrow(/كتالوج هوندا/);
    expect(() => parseHondaInventory(`${header}\n${row.replace("front_pads", "flux")}\n`)).toThrow(/القاموس/);
    expect(() => parseHondaInventory(`${header}\n${row.replace("Z3", "Z9")}\n`)).toThrow(/منطقة/);
    expect(() => parseHondaInventory(`${header}\n${row.replace(",3,12,", ",2.5,12,")}\n`)).toThrow(/الكمية/);
  });
});
