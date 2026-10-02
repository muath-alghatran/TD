/**
 * npm run catalog:vehicles — يولّد src/lib/vehicle-catalog.data.ts من docs/data/vehicle-catalog.csv.
 * الـCSV مصدر الحقيقة: عدّله ثم شغّل السكربت، واختبار التطابق يكشف أي ملف مولَّد قديم.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseVehicleCatalogCsv } from "./vehicle-catalog-csv";

const root = fileURLToPath(new URL("..", import.meta.url));
const csvPath = `${root}docs/data/vehicle-catalog.csv`;
const outPath = `${root}src/lib/vehicle-catalog.data.ts`;

const rows = parseVehicleCatalogCsv(readFileSync(csvPath, "utf8"));
// المرجع والحالة للمراجعة والاختبارات فقط (تُقرأ من الـCSV) — لا يحتاجهما المتصفح
const body = rows.map(({ source: _source, status: _status, ...entry }) => `  ${JSON.stringify(entry)},`).join("\n");
const out = `// مولَّد من docs/data/vehicle-catalog.csv بالأمر npm run catalog:vehicles — لا تعدّله يدوياً.
import type { VehicleCatalogEntry } from "./vehicle-catalog-schema";

export const VEHICLE_ROWS: readonly VehicleCatalogEntry[] = [
${body}
];
`;
writeFileSync(outPath, out);

const models = new Set(rows.map((r) => `${r.makeAr}|${r.modelAr}`)).size;
const makes = new Set(rows.map((r) => r.makeAr)).size;
const pending = rows.filter((r) => r.status === "verify").length;
console.log(`vehicle-catalog: ${rows.length} صفاً · ${models} موديلاً · ${makes} ماركات · ${pending} بحالة verify`);
