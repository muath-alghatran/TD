/**
 * تصفية قوائم الاختيار بالكتابة — منطق SearchSelect، منفصل ليُختبر.
 * يطابق الاسم المعروض والكتابات البديلة (الإنجليزي والشائع)، ويتجاهل الهمزات
 * والمسافات والشرطات: «لاند كروزر» = «لاندكروزر»، «F150» = «F-150».
 */
import { normalizeArabic } from "./arabic-text";

export interface SearchOption {
  value: string;
  label: string;
  /** كتابات أخرى تطابق الخيار دون أن تُعرض — «Land Cruiser» · «بترول» */
  keywords?: string[];
}

function compact(text: string): string {
  return normalizeArabic(text).replace(/[\s\-‐‑]/g, "");
}

/**
 * المطابق تماماً أولاً («Land Cruiser» قبل «Land Cruiser Prado»)، ثم ما يبدأ بالنص في اسمه،
 * ثم في كتاباته البديلة، ثم ما يحتويه — بالترتيب الأصلي داخل كل مجموعة.
 */
export function filterOptions<T extends SearchOption>(options: T[], query: string): T[] {
  const q = compact(query);
  if (!q) return options;
  const exact: T[] = [];
  const byLabel: T[] = [];
  const byKeyword: T[] = [];
  const contains: T[] = [];
  for (const option of options) {
    const label = compact(option.label);
    const keywords = (option.keywords ?? []).map(compact);
    if (label === q || keywords.includes(q)) exact.push(option);
    else if (label.startsWith(q)) byLabel.push(option);
    else if (keywords.some((k) => k.startsWith(q))) byKeyword.push(option);
    else if (label.includes(q) || keywords.some((k) => k.includes(q))) contains.push(option);
  }
  return [...exact, ...byLabel, ...byKeyword, ...contains];
}
