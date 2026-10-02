import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(path.join(__dirname, "..", "app", "globals.css"), "utf8");

function stack(name: string): string {
  const match = css.match(new RegExp(`--${name}:\\s*([^;]+);`));
  if (!match) throw new Error(`--${name} غير موجود`);
  return match[1].replace(/\s+/g, " ").trim();
}

/*
 * قاعدة 2: العربي بـIBM Plex Sans Arabic. متغير next/font لخطّي Barlow يحمل وجهاً بديلاً من Arial
 * يغطي كل الحروف — فلو سبق IBM Plex لرُسم العربي كله بـArial (حدث هذا قبل بوابة المراجعة).
 */
describe("ترتيب مجموعات الخطوط", () => {
  it.each(["font-heading", "font-body", "font-data"])("--%s: IBM Plex قبل متغير Barlow الكامل", (name) => {
    const value = stack(name);
    const plex = value.indexOf("var(--font-ibm-plex-sans-arabic)");
    const barlowVar = value.search(/var\(--font-barlow(-condensed)?\)/);
    expect(plex).toBeGreaterThan(0);
    expect(barlowVar === -1 || barlowVar > plex).toBe(true);
    expect(value.startsWith('"Barlow')).toBe(true);
  });
});
