/**
 * كتالوج السيارات — 6 ماركات، موديلات 2008–2027 (برومت أكتوبر ٢٠٢٦، المرحلة 4).
 * مصدر الحقيقة docs/data/vehicle-catalog.csv، ومنه يُولَّد vehicle-catalog.data.ts
 * بالأمر npm run catalog:vehicles. إضافة ماركة (لكزس، كيا…) = صفوف في الملف فقط.
 *
 * قاعدة 7: التوافق يُربط بالجيل. العميل يختار السنة، والكتالوج يحوّلها إلى جيل —
 * وسنة التحول (آخر سنة لجيل = أول سنة للتالي) ترجع جيلين فيُسأل العميل.
 */
import { normalizeArabic } from "./arabic-text";
import { VEHICLE_ROWS } from "./vehicle-catalog.data";
import type { VehicleCatalogEntry } from "./vehicle-catalog-schema";

export * from "./vehicle-catalog-schema";
export { VEHICLE_ROWS };

/** خيار قائمة يُبحث فيها: الاسم المعروض، والكتابات البديلة التي تطابقه أيضاً */
export interface CatalogOption {
  value: string;
  label: string;
  keywords: string[];
}

/** كتابات شائعة لأسماء الماركات نفسها — اختيارية؛ الماركة الجديدة تعمل بدونها */
const MAKE_ALIASES: Record<string, string[]> = {
  هيونداي: ["هونداي", "هيونداى"],
  جمس: ["جي ام سي", "جي إم سي", "جمز"],
};

/** الماركات بترتيب أول ظهور في الملف — ثابت، والملف يتبع ترتيب البرومت */
export const CATALOG_MAKES: string[] = [...new Set(VEHICLE_ROWS.map((r) => r.makeAr))];

function modelRows(make: string, model: string): VehicleCatalogEntry[] {
  return VEHICLE_ROWS.filter((r) => r.makeAr === make && r.modelAr === model);
}

export function makeOptions(): CatalogOption[] {
  return CATALOG_MAKES.map((make) => {
    const row = VEHICLE_ROWS.find((r) => r.makeAr === make);
    return { value: make, label: make, keywords: [row?.makeEn ?? "", ...(MAKE_ALIASES[make] ?? [])].filter(Boolean) };
  });
}

/** موديلات الماركة أبجدياً، مع الاسم الإنجليزي والكتابات البديلة للبحث */
export function modelOptions(make: string): CatalogOption[] {
  const byModel = new Map<string, CatalogOption>();
  for (const r of VEHICLE_ROWS) {
    if (r.makeAr !== make || byModel.has(r.modelAr)) continue;
    byModel.set(r.modelAr, { value: r.modelAr, label: r.modelAr, keywords: [r.modelEn, ...r.aliases] });
  }
  return [...byModel.values()].sort((a, b) => a.label.localeCompare(b.label, "ar"));
}

/** سنوات الموديل من كل أجياله، الأحدث أولاً */
export function catalogYears(make: string, model: string): number[] {
  const years = new Set<number>();
  for (const r of modelRows(make, model)) for (let y = r.yearFrom; y <= r.yearTo; y++) years.add(y);
  return [...years].sort((a, b) => b - a);
}

/** الأجيال التي تطابق السنة — جيل واحد عادةً، وجيلان في سنة التحول (الأقدم أولاً) */
export function generationsFor(make: string, model: string, year: number): VehicleCatalogEntry[] {
  return modelRows(make, model)
    .filter((r) => r.yearFrom <= year && year <= r.yearTo)
    .sort((a, b) => a.yearFrom - b.yearFrom);
}

/** يطابق الموديل المكتوب بأي كتابة شائعة أو بالإنجليزي — لقراءة الاستمارة والأسماء القديمة */
export function resolveModel(make: string, text: string): string | undefined {
  const q = normalizeArabic(text);
  if (!q) return undefined;
  return modelOptions(make).find((o) => [o.label, ...o.keywords].some((name) => normalizeArabic(name) === q))?.value;
}
