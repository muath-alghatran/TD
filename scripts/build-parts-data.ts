/**
 * npm run catalog:parts — يولّد src/lib/parts-dictionary.ts وsrc/lib/parts-prices.ts من
 * docs/data/parts-glossary-seed.csv وdocs/data/parts-price-list.csv. الملفان مصدر الحقيقة:
 * عدّلهما ثم شغّل السكربت، واختبار التطابق يكشف أي ملف مولَّد قديم.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parsePartsGlossary, parsePriceList } from "./parts-data-csv";

const root = fileURLToPath(new URL("..", import.meta.url));
const types = parsePartsGlossary(readFileSync(`${root}docs/data/parts-glossary-seed.csv`, "utf8"));
const prices = parsePriceList(readFileSync(`${root}docs/data/parts-price-list.csv`, "utf8"), types);

const header = (source: string) =>
  `// مولَّد من ${source} بالأمر npm run catalog:parts — لا تعدّله يدوياً.`;

writeFileSync(
  `${root}src/lib/parts-dictionary.ts`,
  `${header("docs/data/parts-glossary-seed.csv")}
import type { PartType } from "./parts-schema";

export const PART_TYPES: readonly PartType[] = [
${types.map((t) => `  ${JSON.stringify(t)},`).join("\n")}
];
`,
);

// أعمدة التتبع (الأدنى والأعلى ومصدر السعر) للتحقق فقط — لا يحتاجها المتصفح
writeFileSync(
  `${root}src/lib/parts-prices.ts`,
  `${header("docs/data/parts-price-list.csv")}
import type { PartPrice } from "./parts-schema";

export const PART_PRICES: readonly PartPrice[] = [
${prices.map(({ key, tier, price }) => `  ${JSON.stringify({ key, tier, price })},`).join("\n")}
];
`,
);

const priced = new Set(prices.map((p) => p.key)).size;
console.log(`parts: ${types.length} نوعاً · ${prices.length} سعراً · ${types.length - priced} بلا سعر`);
