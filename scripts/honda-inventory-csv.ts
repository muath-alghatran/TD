/**
 * قراءة docs/data/honda-inventory.csv والتحقق منه (المرحلة 6) — يستعمله سكربت التوليد
 * والاختبارات. يرفض أي عمود زائد (لا تكلفة ولا سعر مورد في مستودع عام)، وكل جيل وموديل
 * ونوع ومنطقة يجب أن يوجد في الكتالوج والقاموس والمخطط.
 */
import { parse } from "csv-parse/sync";
import { DIAGRAM_ZONES } from "../src/lib/diagram-zones";
import { HONDA_INVENTORY_COLUMNS, type StockItem } from "../src/lib/inventory-schema";
import { PART_TYPES } from "../src/lib/parts-dictionary";
import { QUALITY_TIERS, type QualityTier } from "../src/lib/parts-schema";
import { VEHICLE_ROWS } from "../src/lib/vehicle-catalog.data";

const HONDA = "هوندا";

export function parseHondaInventory(text: string): StockItem[] {
  if (!text.trim()) return [];
  const records = parse(text, { bom: true, columns: true, skip_empty_lines: true, trim: true }) as Record<string, string>[];
  const header = text.replace(/^﻿/, "").split(/\r?\n/)[0].split(",").map((h) => h.trim());
  if (header.join(",") !== HONDA_INVENTORY_COLUMNS.join(",")) {
    throw new Error(`honda-inventory.csv: الأعمدة يجب أن تكون حرفياً ${HONDA_INVENTORY_COLUMNS.join(",")} — وجدنا ${header.join(",")}`);
  }

  const generations = new Set(VEHICLE_ROWS.filter((r) => r.makeAr === HONDA && r.generationCode).map((r) => `${r.modelAr}|${r.generationCode}`));
  const keys = new Set(PART_TYPES.map((t) => t.key));
  const zones = new Set(DIAGRAM_ZONES.map((z) => z.id));
  const errors: string[] = [];
  const seen = new Set<string>();

  const items = records.map((r, i): StockItem => {
    const fail = (msg: string) => errors.push(`سطر ${i + 2} (${r.part_key} · ${r.oem_number}): ${msg}`);
    if (!generations.has(`${r.model}|${r.generation_code}`)) fail(`الموديل والجيل غير موجودين في كتالوج هوندا: ${r.model} ${r.generation_code}`);
    if (!keys.has(r.part_key)) fail(`نوع غير موجود في القاموس: ${r.part_key}`);
    if (!zones.has(r.zone)) fail(`منطقة غير معروفة: ${r.zone}`);
    if (!QUALITY_TIERS.includes(r.quality_tier as QualityTier)) fail(`جودة غير مسموحة: ${r.quality_tier}`);
    if (!r.oem_number || !r.name_ar) fail("رقم القطعة أو اسمها ناقص");
    const price = Number(r.price_sar);
    const stockQty = Number(r.stock_qty);
    if (!(price > 0)) fail("سعر غير صالح");
    if (!Number.isInteger(stockQty) || stockQty < 0) fail("الكمية يجب أن تكون عدداً صحيحاً ≥ 0");
    const warrantyMonths = r.warranty_months === "" ? null : Number(r.warranty_months);
    if (warrantyMonths !== null && (!Number.isInteger(warrantyMonths) || warrantyMonths < 0)) fail("الضمان بالأشهر عدد صحيح");
    const laborHours = r.labor_hours === "" ? null : Number(r.labor_hours);
    if (laborHours !== null && !(laborHours >= 0)) fail("ساعات التركيب غير صالحة");
    const pair = `${r.generation_code}|${r.part_key}|${r.oem_number}|${r.quality_tier}`;
    if (seen.has(pair)) fail("صف مكرر");
    seen.add(pair);
    return {
      generationCode: r.generation_code,
      model: r.model,
      zone: r.zone,
      partKey: r.part_key,
      oemNumber: r.oem_number,
      name: r.name_ar,
      tier: r.quality_tier as QualityTier,
      origin: r.origin,
      price,
      stockQty,
      warrantyMonths,
      laborHours,
    };
  });

  if (errors.length > 0) throw new Error(`docs/data/honda-inventory.csv:\n${errors.join("\n")}`);
  return items;
}
