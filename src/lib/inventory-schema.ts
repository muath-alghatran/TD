/**
 * شكل صف مخزون هوندا (المرحلة 6) — سعر البيع للعميل والكمية فقط، بلا تكلفة ولا سعر مورد
 * (المستودع عام). منفصل عن البيانات حتى يستعمله سكربت التوليد والاختبارات.
 */
import type { QualityTier } from "./parts-schema";

export const HONDA_INVENTORY_COLUMNS = [
  "generation_code",
  "model",
  "zone",
  "part_key",
  "oem_number",
  "name_ar",
  "quality_tier",
  "origin",
  "price_sar",
  "stock_qty",
  "warranty_months",
  "labor_hours",
] as const;

export interface StockItem {
  generationCode: string;
  model: string;
  zone: string;
  partKey: string;
  oemNumber: string;
  name: string;
  tier: QualityTier;
  origin: string;
  /** سعر البيع للعميل كما في الملف — السعر النهائي شاملاً الضريبة */
  price: number;
  stockQty: number;
  warrantyMonths: number | null;
  laborHours: number | null;
}
