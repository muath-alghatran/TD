/**
 * npm run catalog:honda — يولّد src/lib/honda-inventory.ts من docs/data/honda-inventory.csv
 * (يعبئه المركز من القالب honda-inventory.template.csv — انظر honda-inventory.README.md).
 * بلا ملف = مخزون فارغ: لا أخضر في أي مكان حتى يصل مخزون حقيقي.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseHondaInventory } from "./honda-inventory-csv";

const root = fileURLToPath(new URL("..", import.meta.url));
const csvPath = `${root}docs/data/honda-inventory.csv`;
const items = existsSync(csvPath) ? parseHondaInventory(readFileSync(csvPath, "utf8")) : [];

writeFileSync(
  `${root}src/lib/honda-inventory.ts`,
  `// مولَّد من docs/data/honda-inventory.csv بالأمر npm run catalog:honda — لا تعدّله يدوياً.
// ${items.length === 0 ? "لا ملف مخزون بعد — لا أخضر حتى يعبئه المركز من القالب." : `${items.length} صفاً من مخزون المركز.`}
import type { StockItem } from "./inventory-schema";

export const HONDA_INVENTORY: readonly StockItem[] = ${
    items.length === 0 ? "[]" : `[\n${items.map((item) => `  ${JSON.stringify(item)},`).join("\n")}\n]`
  };
`,
);

const inStock = items.filter((i) => i.stockQty > 0).length;
console.log(`honda-inventory: ${items.length} صفاً · ${inStock} متوفرة في المخزون`);
