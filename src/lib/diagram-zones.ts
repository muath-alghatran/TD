/**
 * مناطق مخطط المركبة الثماني (المرحلة 6): هندسة النموذج المرجعي (docs/prototype-parts.html)
 * منفصلة عن بيانات كامري التجريبية، ومعها ربط كل نوع قطعة من القاموس بمنطقة. المخطط
 * يظهر لهوندا فقط، ومناطقه تعرض أنواع القطع بأسعار القائمة أو بمخزون المركز الحقيقي.
 */
import { PART_TYPES } from "./parts-dictionary";
import type { PartCategory } from "./parts-schema";

export interface DiagramZone {
  id: string;
  /** إحداثي ورقة المخطط — B2 … */
  ref: string;
  layer: string;
  name: string;
  x: number;
  y: number;
}

export const DIAGRAM_LAYERS = ["الكل", "بدي", "ميكانيكا", "كهرباء", "عضلات السيارة"];

export const DIAGRAM_ZONES: DiagramZone[] = [
  { id: "Z1", ref: "B2", layer: "ميكانيكا", name: "المحرك والتبريد", x: 150, y: 232 },
  { id: "Z2", ref: "A3", layer: "بدي", name: "البدي الأمامي والصدام", x: 84, y: 270 },
  { id: "Z3", ref: "C4", layer: "عضلات السيارة", name: "الفرامل والعفشة الأمامية", x: 240, y: 300 },
  { id: "Z4", ref: "C2", layer: "كهرباء", name: "الكهرباء والبطارية", x: 302, y: 200 },
  { id: "Z5", ref: "E1", layer: "كهرباء", name: "المقصورة والتكييف", x: 480, y: 140 },
  { id: "Z6", ref: "E4", layer: "ميكانيكا", name: "العادم والوقود", x: 530, y: 286 },
  { id: "Z7", ref: "G4", layer: "عضلات السيارة", name: "الفرامل والعفشة الخلفية", x: 664, y: 300 },
  { id: "Z8", ref: "H3", layer: "بدي", name: "البدي الخلفي والشنطة", x: 822, y: 238 },
];

/** المنطقة الافتراضية لكل فئة من القاموس */
const CATEGORY_ZONE: Record<PartCategory, string> = {
  engine: "Z1",
  cooling: "Z1",
  filters: "Z1",
  electrical: "Z4",
  ac: "Z5",
  mirrors: "Z5",
  fuel: "Z6",
  transmission: "Z6",
  brakes: "Z3",
  suspension: "Z3",
  steering: "Z3",
  wheels: "Z3",
  body: "Z2",
  lights: "Z2",
};

/** استثناءات: الخلفي في منطقتيه، والأبواب ومنظم الزجاج في المقصورة — للمراجعة مع المركز */
const KEY_ZONE: Record<string, string> = {
  rear_pads: "Z7",
  rear_shocks: "Z7",
  rear_arm: "Z7",
  rear_bumper: "Z8",
  trunk: "Z8",
  tail_lamp: "Z8",
  door: "Z5",
  door_handle: "Z5",
  window_regulator: "Z5",
  airbag: "Z5",
  clock_spring: "Z5",
  cabin_filter: "Z5",
};

export function zoneOfPart(key: string): string | undefined {
  const type = PART_TYPES.find((t) => t.key === key);
  if (!type) return undefined;
  return KEY_ZONE[key] ?? CATEGORY_ZONE[type.category];
}

/** أنواع القطع في منطقة — بترتيب القاموس */
export function partsInZone(zoneId: string): string[] {
  return PART_TYPES.filter((t) => zoneOfPart(t.key) === zoneId).map((t) => t.key);
}
