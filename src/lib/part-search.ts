/**
 * البحث عن قطعة (برومت أكتوبر ٢٠٢٦، المرحلة 5) — يعمل في المتصفح، فالبيانات صغيرة.
 * يرجع القطعة المطلوبة أو الأقرب لها بطبقات بالترتيب: تطابق تام ← بادئة ← تقاطع الكلمات
 * ← ثلاثيات الأحرف (للكلمات الملتصقة «فيبرصدام») ← مسافة تحرير (للأخطاء الإملائية).
 * ويفهم لهجة السوق: «قماش قدام» = قماش أمامي، و«ورا» = خلفي.
 */
import { normalizeArabic } from "./arabic-text";
import { PART_TYPES } from "./parts-dictionary";
import type { PartType } from "./parts-schema";

/** كلمات الاتجاه باللهجة ← كلمة القاموس (بعد التطبيع) */
const DIALECT: Record<string, string> = {
  قدام: "امامي",
  ورا: "خلفي",
  وراء: "خلفي",
};

/** الاتجاهان المتعاكسان — «قماش ورا» لا يطابق «قماش أمامي» ولو تطابقت بقية الكلمات */
const OPPOSITE: Record<string, string> = { امامي: "خلفي", خلفي: "امامي" };
/** كلمات الطرف والموضع — تُرجّح الاتجاه ولا تكفي وحدها للتطابق */
const MODIFIER_WORDS = new Set(["امامي", "خلفي", "يمين", "يسار", "فوق", "تحت"]);

/** دون هذا لا تُعدّ النتيجة قريبة — والبحث بلا نتيجة فوقه فاشل (قاعدة 8) */
export const MIN_SCORE = 45;
/** «أفضل تطابق» يحتاج ثقة أعلى من «قريب مما تبحث عنه» */
export const BEST_SCORE = 70;

/** تطبيع للمقارنة: normalizeArabic + حذف الرموز (يبقى الحروف والأرقام والمسافات) */
function clean(text: string): string {
  return normalizeArabic(text)
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** صيغة الكلمة للمقارنة: بلا «ال» في أولها ولا هاء في آخرها («المكيف» = «مكيف»، «شمعه» = «شمعة»)، واللهجة ← القاموس */
function canonicalWord(word: string): string {
  let w = DIALECT[word] ?? word;
  if (w.length > 3 && w.startsWith("ال")) w = w.slice(2);
  w = DIALECT[w] ?? w;
  if (w.length > 3 && w.endsWith("ه")) w = w.slice(0, -1);
  return w;
}

export function searchTokens(text: string): string[] {
  return clean(text).split(" ").filter(Boolean).map(canonicalWord);
}

/** Damerau-Levenshtein (المحاذاة المثلى) — يلتقط الحرف الناقص والزائد والمبدّل والمتبادل */
export function editDistance(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

function trigrams(text: string): Set<string> {
  const padded = ` ${text} `;
  const set = new Set<string>();
  for (let i = 0; i < padded.length - 2; i++) set.add(padded.slice(i, i + 3));
  return set;
}

/** تشابه ثلاثيات الأحرف (معامل Dice) بين نصين بلا مسافات */
function trigramSimilarity(a: string, b: string): number {
  const ta = trigrams(a);
  const tb = trigrams(b);
  let shared = 0;
  for (const t of ta) if (tb.has(t)) shared++;
  return (2 * shared) / (ta.size + tb.size);
}

/** وزن تطابق كلمة البحث مع كلمة من الاسم: تام 1 · بادئة 0.9 · خطأ إملائي 0.75 أو 0.6 */
function wordMatch(q: string, w: string): number {
  if (q === w) return 1;
  if (q.length >= 3 && (w.startsWith(q) || (w.length >= 3 && q.startsWith(w)))) return 0.9;
  const allowed = Math.max(q.length, w.length) <= 5 ? 1 : 2;
  if (Math.min(q.length, w.length) < 3) return 0;
  const distance = editDistance(q, w);
  if (distance > allowed) return 0;
  return distance === 1 ? 0.75 : 0.6;
}

interface IndexEntry {
  /** النص كما يُعرض: الاسم أو المرادف أو الاسم الإنجليزي */
  text: string;
  isName: boolean;
  words: string[];
  joined: string;
  compact: string;
  /** بلا مسافات ولا كلمات الطرف — لثلاثيات الأحرف */
  core: string;
}

function coreOf(words: string[]): string {
  return words.filter((w) => !MODIFIER_WORDS.has(w)).join("");
}

interface IndexedType {
  type: PartType;
  entries: IndexEntry[];
  /** ترجيح بشيوع النوع في ملف المركز — يحسم التعادل («ثلاجة» ← ثلاجة المكيف قبل ثلاجة الزيت) */
  popularity: number;
}

function entry(text: string, isName: boolean): IndexEntry {
  const words = searchTokens(text);
  const joined = words.join(" ");
  return { text, isName, words, joined, compact: joined.replace(/ /g, ""), core: coreOf(words) };
}

const INDEX: IndexedType[] = PART_TYPES.map((type) => ({
  type,
  entries: [entry(type.name, true), ...type.synonyms.map((s) => entry(s, false)), entry(type.nameEn, false)],
  popularity: Math.min(3, Math.log10(1 + type.sourceRows) * 1.5) + (type.confidence === "review" ? -1 : 0),
}));

/** درجة تطابق البحث مع نص واحد (0 = لا تطابق) */
function scoreEntry(q: { words: string[]; joined: string; compact: string; core: string }, e: IndexEntry): number {
  if (!e.joined) return 0;
  if (q.words.some((w) => OPPOSITE[w] && e.words.includes(OPPOSITE[w]))) return 0;
  if (e.joined === q.joined) return 100;
  if (e.compact === q.compact) return 95;
  if (e.joined.startsWith(q.joined) && q.joined.length >= 2) return 88 + 2 * (q.joined.length / e.joined.length);
  if (q.joined.startsWith(`${e.joined} `)) return 80;

  // تقاطع الكلمات — مع البادئات والأخطاء الإملائية لكل كلمة. كلمة الاتجاه وحدها
  // («أمامي») لا تجعل «شبك أمامي» قريباً من «قماش قدام»: يلزم تطابق كلمة من اسم القطعة
  let sum = 0;
  let matched = 0;
  let matchedContent = 0;
  for (const qw of q.words) {
    const best = Math.max(0, ...e.words.map((w) => wordMatch(qw, w)));
    sum += best;
    if (best > 0) {
      matched++;
      if (!MODIFIER_WORDS.has(qw)) matchedContent++;
    }
  }
  let score = 0;
  if (matchedContent === 0) score = 0;
  else if (matched === q.words.length) score = 55 + 25 * (sum / q.words.length) - 3 * Math.max(0, e.words.length - q.words.length);
  else if (matched / q.words.length >= 0.5) score = 30 + 30 * (sum / q.words.length);

  // ثلاثيات الأحرف — للكلمات الملتصقة والأخطاء في نص طويل، على كلمات القطعة لا الطرف
  if (q.core.length >= 4 && e.core) {
    const similarity = trigramSimilarity(q.core, e.core);
    if (similarity >= 0.45) score = Math.max(score, 25 + 50 * similarity);
  }
  return score;
}

export interface PartMatch {
  type: PartType;
  score: number;
  /** النص الذي طابق: الاسم نفسه أو مرادف («فحمات أمامية») أو الاسم الإنجليزي */
  matchedText: string;
  matchedIsName: boolean;
}

export interface PartSearchResult {
  best: PartMatch | null;
  near: PartMatch[];
  /** لا نتيجة فوق الحد الأدنى — بحث فاشل يُسجَّل (قاعدة 8) */
  failed: boolean;
}

export function rankParts(query: string): PartMatch[] {
  const words = searchTokens(query);
  if (words.length === 0) return [];
  const joined = words.join(" ");
  const q = { words, joined, compact: joined.replace(/ /g, ""), core: coreOf(words) };
  const matches: PartMatch[] = [];
  for (const item of INDEX) {
    let best: { score: number; e: IndexEntry } | null = null;
    for (const e of item.entries) {
      const score = scoreEntry(q, e);
      if (score > 0 && (!best || score > best.score || (score === best.score && e.isName))) best = { score, e };
    }
    if (best) matches.push({ type: item.type, score: best.score + item.popularity, matchedText: best.e.text, matchedIsName: best.e.isName });
  }
  return matches.sort((a, b) => b.score - a.score);
}

/** «أفضل تطابق» ثم «قريب مما تبحث عنه» (حتى 7) */
export function searchParts(query: string, nearLimit = 7): PartSearchResult {
  const ranked = rankParts(query).filter((m) => m.score >= MIN_SCORE);
  if (ranked.length === 0) return { best: null, near: [], failed: searchTokens(query).length > 0 };
  const best = ranked[0].score >= BEST_SCORE ? ranked[0] : null;
  return { best, near: ranked.slice(best ? 1 : 0, (best ? 1 : 0) + nearLimit), failed: false };
}

/**
 * مواضع إبراز الجزء المطابق في نص العرض — كلمات النص التي تطابق كلمة من البحث.
 * يرجع أزواج [بداية، نهاية) بمواضع النص الأصلي.
 */
export function highlightRanges(display: string, query: string): [number, number][] {
  const queryWords = searchTokens(query);
  if (queryWords.length === 0) return [];
  const ranges: [number, number][] = [];
  const wordPattern = /[\p{L}\p{N}ً-ْٰـ]+/gu;
  for (const m of display.matchAll(wordPattern)) {
    const word = canonicalWord(clean(m[0]));
    if (word && queryWords.some((q) => wordMatch(q, word) > 0)) ranges.push([m.index, m.index + m[0].length]);
  }
  return ranges;
}
