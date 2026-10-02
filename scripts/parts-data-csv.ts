/**
 * قراءة قاموس القطع وقائمة الأسعار من docs/data والتحقق منهما — يستعمله سكربت التوليد
 * والاختبارات معاً (برومت أكتوبر ٢٠٢٦، المرحلة 5).
 */
import { parse } from "csv-parse/sync";
import {
  PART_CATEGORIES,
  PART_CONFIDENCES,
  QUALITY_TIERS,
  type PartCategory,
  type PartConfidence,
  type PartPrice,
  type PartType,
  type QualityTier,
} from "../src/lib/parts-schema";

const GLOSSARY_COLUMNS = ["key", "name_ar", "category", "synonyms_ar", "name_en", "confidence", "rows_in_kia_source", "example_from_source"];
const PRICE_COLUMNS = [
  "part_type_key",
  "name_ar",
  "category",
  "quality_tier",
  "price_sar",
  "rows_in_source",
  "min_sar",
  "max_sar",
  "price_taken_from_serial",
  "price_taken_from",
];

/** سطر القائمة كما في الملف، مع أعمدة التتبع التي لا تصل المتصفح */
export interface PriceListRow extends PartPrice {
  min: number;
  max: number;
  takenFrom: string;
}

function read(text: string, columns: string[], file: string): Record<string, string>[] {
  const records = parse(text, { bom: true, columns: true, skip_empty_lines: true, trim: true }) as Record<string, string>[];
  const header = Object.keys(records[0] ?? {});
  if (header.join(",") !== columns.join(",")) throw new Error(`${file}: أعمدة غير متوقعة: ${header.join(",")}`);
  return records;
}

export function parsePartsGlossary(text: string): PartType[] {
  const errors: string[] = [];
  const categories = PART_CATEGORIES.map((c) => c.key) as string[];
  const types = read(text, GLOSSARY_COLUMNS, "parts-glossary-seed.csv").map((r, i): PartType => {
    const fail = (msg: string) => errors.push(`سطر ${i + 2} (${r.key}): ${msg}`);
    if (!/^[a-z][a-z0-9_]*$/.test(r.key)) fail("مفتاح غير صالح");
    if (!categories.includes(r.category)) fail(`فئة غير معروفة: ${r.category}`);
    if (!PART_CONFIDENCES.includes(r.confidence as PartConfidence)) fail(`ثقة غير معروفة: ${r.confidence}`);
    if (!r.name_ar) fail("اسم ناقص");
    const sourceRows = Number(r.rows_in_kia_source || 0);
    if (!Number.isInteger(sourceRows) || sourceRows < 0) fail("rows_in_kia_source ليس عدداً");
    return {
      key: r.key,
      name: r.name_ar,
      category: r.category as PartCategory,
      synonyms: r.synonyms_ar ? r.synonyms_ar.split("|").map((s) => s.trim()).filter(Boolean) : [],
      nameEn: r.name_en,
      confidence: r.confidence as PartConfidence,
      sourceRows,
    };
  });
  const keys = types.map((t) => t.key);
  keys.forEach((k, i) => keys.indexOf(k) !== i && errors.push(`مفتاح مكرر: ${k}`));
  if (errors.length > 0) throw new Error(`docs/data/parts-glossary-seed.csv:\n${errors.join("\n")}`);
  return types;
}

export function parsePriceList(text: string, types: PartType[]): PriceListRow[] {
  const errors: string[] = [];
  const known = new Map(types.map((t) => [t.key, t]));
  const seen = new Set<string>();
  const rows = read(text, PRICE_COLUMNS, "parts-price-list.csv").map((r, i): PriceListRow => {
    const fail = (msg: string) => errors.push(`سطر ${i + 2} (${r.part_type_key} · ${r.quality_tier}): ${msg}`);
    const type = known.get(r.part_type_key);
    if (!type) fail("نوع غير موجود في القاموس");
    else if (type.category !== r.category) fail(`الفئة تخالف القاموس (${type.category})`);
    if (!QUALITY_TIERS.includes(r.quality_tier as QualityTier)) fail(`جودة غير مسموحة: ${r.quality_tier}`);
    const price = Number(r.price_sar);
    const min = Number(r.min_sar);
    const max = Number(r.max_sar);
    if (!(price > 0)) fail("سعر غير صالح");
    if (!(min <= price && price <= max)) fail(`السعر ${price} خارج ${min}–${max}`);
    const pair = `${r.part_type_key}|${r.quality_tier}`;
    if (seen.has(pair)) fail("سطران لنفس النوع والجودة");
    seen.add(pair);
    return { key: r.part_type_key, tier: r.quality_tier as QualityTier, price, min, max, takenFrom: r.price_taken_from };
  });
  if (errors.length > 0) throw new Error(`docs/data/parts-price-list.csv:\n${errors.join("\n")}`);
  return rows;
}
