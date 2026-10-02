/**
 * قراءة docs/data/vehicle-catalog.csv والتحقق منه — يستعمله سكربت التوليد والاختبارات معاً،
 * فلا يدخل ملف مولَّد يخالف قواعد البيانات (برومت أكتوبر ٢٠٢٦، المرحلة 4).
 */
import { parse } from "csv-parse/sync";
import {
  CATALOG_YEAR_MAX,
  CATALOG_YEAR_MIN,
  VEHICLE_BODIES,
  VEHICLE_CATALOG_STATUSES,
  type VehicleBody,
  type VehicleCatalogRow,
  type VehicleCatalogStatus,
} from "../src/lib/vehicle-catalog-schema";

export const VEHICLE_CATALOG_COLUMNS = [
  "make_ar",
  "make_en",
  "model_ar",
  "model_en",
  "aliases_ar",
  "generation_code",
  "year_from",
  "year_to",
  "body",
  "source",
  "status",
] as const;

type CsvRecord = Record<(typeof VEHICLE_CATALOG_COLUMNS)[number], string>;

/** يحوّل نص الـCSV إلى صفوف، ويرمي خطأً يسمّي السطر عند أي مخالفة */
export function parseVehicleCatalogCsv(text: string): VehicleCatalogRow[] {
  const records = parse(text, { bom: true, columns: true, skip_empty_lines: true, trim: true }) as CsvRecord[];
  const header = Object.keys(records[0] ?? {});
  if (header.join(",") !== VEHICLE_CATALOG_COLUMNS.join(",")) {
    throw new Error(`أعمدة الملف لا تطابق المطلوب: ${header.join(",")}`);
  }

  const errors: string[] = [];
  const rows = records.map((r, i): VehicleCatalogRow => {
    const line = i + 2;
    const fail = (msg: string) => errors.push(`سطر ${line} (${r.make_ar} ${r.model_ar}): ${msg}`);
    const yearFrom = Number(r.year_from);
    const yearTo = Number(r.year_to);
    if (!Number.isInteger(yearFrom) || !Number.isInteger(yearTo)) fail("السنوات ليست أعداداً صحيحة");
    if (yearFrom > yearTo) fail("year_from أكبر من year_to");
    if (yearFrom < CATALOG_YEAR_MIN || yearTo > CATALOG_YEAR_MAX) fail(`السنوات خارج ${CATALOG_YEAR_MIN}–${CATALOG_YEAR_MAX}`);
    if (!VEHICLE_BODIES.includes(r.body as VehicleBody)) fail(`body غير معروف: ${r.body}`);
    if (!VEHICLE_CATALOG_STATUSES.includes(r.status as VehicleCatalogStatus)) fail(`status غير معروف: ${r.status}`);
    if (r.status === "verified" && !r.generation_code) fail("verified بلا رمز جيل");
    if (r.status === "provisional" && yearTo !== CATALOG_YEAR_MAX) fail(`provisional لا ينتهي في ${CATALOG_YEAR_MAX}`);
    if (!/^https:\/\//.test(r.source)) fail("source ليس رابطاً");
    if (!r.make_ar || !r.make_en || !r.model_ar || !r.model_en) fail("اسم ناقص");
    return {
      makeAr: r.make_ar,
      makeEn: r.make_en,
      modelAr: r.model_ar,
      modelEn: r.model_en,
      aliases: r.aliases_ar ? r.aliases_ar.split("|").map((a) => a.trim()).filter(Boolean) : [],
      generationCode: r.generation_code,
      yearFrom,
      yearTo,
      body: r.body as VehicleBody,
      source: r.source,
      status: r.status as VehicleCatalogStatus,
    };
  });

  // الاسم الإنجليزي للماركة والموديل والأسماء البديلة واحدة في كل صفوف الموديل
  const seen = new Map<string, VehicleCatalogRow>();
  const keys = new Set<string>();
  rows.forEach((row, i) => {
    const model = `${row.makeAr}|${row.modelAr}`;
    const first = seen.get(model);
    if (!first) seen.set(model, row);
    else if (first.makeEn !== row.makeEn || first.modelEn !== row.modelEn || first.aliases.join("|") !== row.aliases.join("|")) {
      errors.push(`سطر ${i + 2} (${row.makeAr} ${row.modelAr}): الاسم الإنجليزي أو الأسماء البديلة تختلف عن أول صف للموديل`);
    }
    const key = `${model}|${row.generationCode}|${row.yearFrom}`;
    if (keys.has(key)) errors.push(`سطر ${i + 2}: تكرار (ماركة، موديل، جيل، سنة البداية)`);
    keys.add(key);
  });

  if (errors.length > 0) throw new Error(`docs/data/vehicle-catalog.csv:\n${errors.join("\n")}`);
  return rows;
}
