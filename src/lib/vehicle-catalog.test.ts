import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseVehicleCatalogCsv } from "../../scripts/vehicle-catalog-csv";
import { normalizeArabic } from "./arabic-text";
import { filterOptions } from "./search-options";
import {
  CATALOG_MAKES,
  CATALOG_YEAR_MAX,
  CATALOG_YEAR_MIN,
  VEHICLE_ROWS,
  catalogYears,
  generationsFor,
  makeOptions,
  modelOptions,
  resolveModel,
} from "./vehicle-catalog";
import { WMI_MAKES } from "./vin";

// مصدر الحقيقة نفسه — المرجع والحالة لا يصلان المتصفح فيُختبران من الملف
const CSV_ROWS = parseVehicleCatalogCsv(readFileSync(new URL("../../docs/data/vehicle-catalog.csv", import.meta.url), "utf8"));

describe("ملف الكتالوج (docs/data/vehicle-catalog.csv)", () => {
  it("كل صف year_from ≤ year_to وضمن 2008–2027", () => {
    for (const r of CSV_ROWS) {
      expect(r.yearFrom, `${r.modelAr} ${r.generationCode}`).toBeLessThanOrEqual(r.yearTo);
      expect(r.yearFrom).toBeGreaterThanOrEqual(CATALOG_YEAR_MIN);
      expect(r.yearTo).toBeLessThanOrEqual(CATALOG_YEAR_MAX);
    }
  });

  it("لا تكرار لـ(ماركة، موديل، جيل، year_from) — وجيلان برمز فارغ لنفس الموديل مقبولان", () => {
    const keys = CSV_ROWS.map((r) => `${r.makeAr}|${r.modelAr}|${r.generationCode}|${r.yearFrom}`);
    expect(new Set(keys).size).toBe(keys.length);
    const taurusUnknown = CSV_ROWS.filter((r) => r.modelEn === "Taurus" && r.generationCode === "");
    expect(taurusUnknown.length).toBeGreaterThanOrEqual(2);
  });

  it("الماركات الست موجودة بترتيب البرومت", () => {
    expect(CATALOG_MAKES).toEqual(["تويوتا", "نيسان", "هيونداي", "هوندا", "فورد", "جمس"]);
  });

  it("الأسماء البديلة لا تتعارض بين موديلين", () => {
    const owner = new Map<string, string>();
    for (const r of CSV_ROWS) {
      const model = `${r.makeAr} ${r.modelAr}`;
      for (const name of [r.modelAr, r.modelEn, ...r.aliases]) {
        const key = normalizeArabic(name);
        const prev = owner.get(key);
        expect(prev === undefined || prev === model, `«${name}» لـ${prev} و${model}`).toBe(true);
        owner.set(key, model);
      }
    }
  });

  it("الحالات: verified برمز، provisional ينتهي في 2027، ولكل صف مرجع", () => {
    for (const r of CSV_ROWS) {
      if (r.status === "verified") expect(r.generationCode, `${r.modelAr} ${r.yearFrom}`).not.toBe("");
      if (r.status === "provisional") expect(r.yearTo).toBe(CATALOG_YEAR_MAX);
      expect(r.source).toMatch(/^https:\/\//);
    }
  });

  it("كل ماركة يعرفها جدول رقم الهيكل — فيبقى تنبيه «رقم الهيكل لماركة أخرى» يعمل", () => {
    for (const make of CATALOG_MAKES) expect(WMI_MAKES.has(make), make).toBe(true);
  });

  it("الملف المولَّد مطابق للـCSV — شغّل npm run catalog:vehicles بعد أي تعديل", () => {
    const expected = CSV_ROWS.map(({ source: _source, status: _status, ...entry }) => entry);
    expect(VEHICLE_ROWS).toEqual(expected);
  });
});

describe("من السنة إلى الجيل (قاعدة 7)", () => {
  it("سنة عادية ترجع جيلاً واحداً", () => {
    expect(generationsFor("تويوتا", "كامري", 2015).map((g) => g.generationCode)).toEqual(["XV50"]);
  });

  it("سنة التحول ترجع جيلين، الأقدم أولاً", () => {
    expect(generationsFor("تويوتا", "كامري", 2017).map((g) => g.generationCode)).toEqual(["XV50", "XV70"]);
    expect(generationsFor("نيسان", "باترول", 2010).map((g) => g.generationCode)).toEqual(["Y61", "Y62"]);
  });

  it("كل موديل له أجيال متصلة: لا سنة في مداه بلا جيل", () => {
    for (const make of CATALOG_MAKES) {
      for (const { value: model } of modelOptions(make)) {
        for (const year of catalogYears(make, model)) {
          expect(generationsFor(make, model, year).length, `${make} ${model} ${year}`).toBeGreaterThan(0);
        }
      }
    }
  });

  it("السنوات الأحدث أولاً وبلا تكرار", () => {
    const years = catalogYears("هوندا", "أكورد");
    expect(years[0]).toBe(2027);
    expect(years.at(-1)).toBe(2008);
    expect(new Set(years).size).toBe(years.length);
  });
});

describe("البحث بالكتابات الشائعة", () => {
  const find = (make: string, q: string) => filterOptions(modelOptions(make), q).map((o) => o.value);

  it("العربي بكتاباته والإنجليزي", () => {
    expect(find("تويوتا", "لاند كروزر")[0]).toBe("لاندكروزر");
    expect(find("تويوتا", "Land Cruiser")[0]).toBe("لاندكروزر");
    expect(find("تويوتا", "شاص")).toEqual(["لاندكروزر 70"]);
    expect(find("هوندا", "اكورد")[0]).toBe("أكورد");
    expect(find("نيسان", "بترول")[0]).toBe("باترول");
    expect(find("جمس", "يوكون")[0]).toBe("يوكن");
    expect(find("فورد", "F150")[0]).toBe("F-150");
  });

  it("الماركة بالإنجليزي وبكتابة شائعة", () => {
    expect(filterOptions(makeOptions(), "GMC").map((o) => o.value)).toEqual(["جمس"]);
    expect(filterOptions(makeOptions(), "هونداي").map((o) => o.value)).toEqual(["هيونداي"]);
  });

  it("الموديلات أبجدياً", () => {
    const labels = modelOptions("هيونداي").map((o) => o.label);
    expect(labels).toEqual([...labels].sort((a, b) => a.localeCompare(b, "ar")));
  });

  it("resolveModel يطابق الأسماء القديمة في كراجي والإنجليزي", () => {
    expect(resolveModel("هيونداي", "النترا")).toBe("إلنترا");
    expect(resolveModel("تويوتا", "Camry")).toBe("كامري");
    expect(resolveModel("تويوتا", "سيارة غير موجودة")).toBeUndefined();
  });
});
