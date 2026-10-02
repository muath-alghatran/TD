/**
 * رقم الهيكل (VIN): تنظيف ما يكتبه العميل، وفك محلي لأول 3 خانات (WMI)
 * والخانة العاشرة (السنة) — فحص فوري بلا شبكة يسبق NHTSA vPIC (src/lib/nhtsa.ts).
 *
 * لا نتحقق من خانة التحقق (الخانة 9): كثير من سيارات الخليج لا تلتزم بها.
 */
import { toLatinDigits } from "./format";

/**
 * رموز المصنّع (WMI) للماركات الست — المصدر: NHTSA vPIC
 * (GetWMIsForManufacturer ثم DecodeWMI لكل رمز، جُلبت في ١ أكتوبر ٢٠٢٦).
 * يدخل الرمز إذا كانت ماركته في vPIC إحدى الست وحدها، أو معها علامة شقيقة
 * يصنّعها المصنّع نفسه (مذكورة بجانب الرمز). الرموز المشتركة مع ماركة مستقلة
 * (كيا، مازدا، بونتياك…) مستبعدة، وكذلك لكزس وإنفينيتي وأكيورا وجينيسيس وحدها.
 *
 * vPIC سجل أمريكي: مصانع تايلند والهند وجنوب أفريقيا التي تورّد للخليج غائبة
 * عنه. الرمز الغائب لا يُطلق أي تنبيه — وهو الافتراض الآمن، فلا يُضاف رمز
 * لم يتأكد مصدره.
 */
const WMI_TABLE: Record<string, { make: string; country: string | null }> = {
  // تويوتا
  "2T1": { make: "تويوتا", country: "كندا" },
  "2T3": { make: "تويوتا", country: "كندا" },
  "3TM": { make: "تويوتا", country: "المكسيك" },
  "3TY": { make: "تويوتا", country: "المكسيك" },
  "4T1": { make: "تويوتا", country: "أمريكا" },
  "4T3": { make: "تويوتا", country: "أمريكا" },
  "4T4": { make: "تويوتا", country: "أمريكا" },
  "5TB": { make: "تويوتا", country: "أمريكا" },
  "5TD": { make: "تويوتا", country: "أمريكا" }, // ومعها لكزس
  "5TE": { make: "تويوتا", country: "أمريكا" },
  "5TF": { make: "تويوتا", country: "أمريكا" },
  "5YF": { make: "تويوتا", country: "أمريكا" },
  "7MU": { make: "تويوتا", country: "أمريكا" },
  "7SV": { make: "تويوتا", country: "أمريكا" },
  JT2: { make: "تويوتا", country: "اليابان" },
  JT3: { make: "تويوتا", country: "اليابان" },
  JT4: { make: "تويوتا", country: "اليابان" },
  JT5: { make: "تويوتا", country: "اليابان" },
  JTD: { make: "تويوتا", country: "اليابان" },
  JTE: { make: "تويوتا", country: "اليابان" }, // ومعها لكزس، وسوبارو التي تصنّعها تويوتا
  JTK: { make: "تويوتا", country: "اليابان" },
  JTL: { make: "تويوتا", country: "اليابان" },
  JTM: { make: "تويوتا", country: "اليابان" }, // ومعها سوبارو التي تصنّعها تويوتا
  JTN: { make: "تويوتا", country: "اليابان" },
  NMT: { make: "تويوتا", country: "تركيا" },
  SB1: { make: "تويوتا", country: "بريطانيا" },
  VNK: { make: "تويوتا", country: "فرنسا" },
  // نيسان
  "1N4": { make: "نيسان", country: "أمريكا" }, // ومعها إنفينيتي
  "1N6": { make: "نيسان", country: "أمريكا" }, // ومعها إنفينيتي
  "3N1": { make: "نيسان", country: "المكسيك" }, // ومعها إنفينيتي
  "3N6": { make: "نيسان", country: "المكسيك" }, // ومعها إنفينيتي، وشفروليه التي تصنّعها نيسان
  "3N8": { make: "نيسان", country: "المكسيك" },
  "3PC": { make: "نيسان", country: "المكسيك" }, // ومعها إنفينيتي
  "4N2": { make: "نيسان", country: "أمريكا" },
  "4N3": { make: "نيسان", country: "أمريكا" },
  "4N4": { make: "نيسان", country: "أمريكا" },
  "5BZ": { make: "نيسان", country: "أمريكا" },
  "5N1": { make: "نيسان", country: "أمريكا" }, // ومعها إنفينيتي
  JN1: { make: "نيسان", country: "اليابان" }, // ومعها إنفينيتي وداتسون
  JN3: { make: "نيسان", country: "اليابان" }, // ومعها إنفينيتي
  JN6: { make: "نيسان", country: "اليابان" }, // ومعها شفروليه التي تصنّعها نيسان
  JN8: { make: "نيسان", country: "اليابان" }, // ومعها إنفينيتي
  SJK: { make: "نيسان", country: "بريطانيا" }, // ومعها إنفينيتي
  // هيونداي
  "5NM": { make: "هيونداي", country: "أمريكا" }, // ومعها جينيسيس
  "5NP": { make: "هيونداي", country: "أمريكا" },
  "5NT": { make: "هيونداي", country: "أمريكا" },
  KM8: { make: "هيونداي", country: "كوريا الجنوبية" },
  KME: { make: "هيونداي", country: null },
  KMH: { make: "هيونداي", country: "كوريا الجنوبية" }, // ومعها جينيسيس
  KMU: { make: "هيونداي", country: "كوريا الجنوبية" }, // ومعها جينيسيس
  PFD: { make: "هيونداي", country: "سنغافورة" },
  // هوندا
  "19X": { make: "هوندا", country: "أمريكا" },
  "1HG": { make: "هوندا", country: "أمريكا" },
  "2HG": { make: "هوندا", country: "كندا" },
  "2HJ": { make: "هوندا", country: "كندا" },
  "2HK": { make: "هوندا", country: "كندا" },
  "3CZ": { make: "هوندا", country: "المكسيك" },
  "3DH": { make: "هوندا", country: "المكسيك" },
  "3GP": { make: "هوندا", country: "المكسيك" },
  "3HD": { make: "هوندا", country: "المكسيك" }, // ومعها أكيورا
  "3HG": { make: "هوندا", country: "المكسيك" },
  "5FN": { make: "هوندا", country: "أمريكا" },
  "5FP": { make: "هوندا", country: "أمريكا" },
  "5J6": { make: "هوندا", country: "أمريكا" },
  "5J7": { make: "هوندا", country: "أمريكا" },
  "5KB": { make: "هوندا", country: "أمريكا" },
  "7FA": { make: "هوندا", country: "أمريكا" },
  JH1: { make: "هوندا", country: null },
  JHL: { make: "هوندا", country: null },
  JHM: { make: "هوندا", country: null },
  SHH: { make: "هوندا", country: "بريطانيا" },
  SHS: { make: "هوندا", country: "بريطانيا" },
  // فورد
  "1F1": { make: "فورد", country: "أمريكا" },
  "1F7": { make: "فورد", country: "أمريكا" },
  "1FA": { make: "فورد", country: "أمريكا" },
  "1FB": { make: "فورد", country: "أمريكا" },
  "1FC": { make: "فورد", country: "أمريكا" },
  "1FD": { make: "فورد", country: "أمريكا" },
  "1FM": { make: "فورد", country: "أمريكا" },
  "1FT": { make: "فورد", country: "أمريكا" },
  "2FA": { make: "فورد", country: "كندا" },
  "2FB": { make: "فورد", country: "أمريكا" },
  "2FC": { make: "فورد", country: "كندا" },
  "2FD": { make: "فورد", country: "كندا" },
  "2FM": { make: "فورد", country: "كندا" },
  "2FT": { make: "فورد", country: "كندا" },
  "3FA": { make: "فورد", country: "المكسيك" },
  "3FB": { make: "فورد", country: "المكسيك" },
  "3FC": { make: "فورد", country: "المكسيك" },
  "3FD": { make: "فورد", country: "المكسيك" },
  "3FE": { make: "فورد", country: "المكسيك" },
  "3FM": { make: "فورد", country: "المكسيك" },
  "3FT": { make: "فورد", country: "المكسيك" },
  "5LD": { make: "فورد", country: "أمريكا" },
  "9BF": { make: "فورد", country: "البرازيل" },
  KNJ: { make: "فورد", country: "كوريا الجنوبية" },
  MAJ: { make: "فورد", country: "الهند" },
  NM0: { make: "فورد", country: "تركيا" },
  WF0: { make: "فورد", country: "ألمانيا" },
  // جمس
  "1GD": { make: "جمس", country: "أمريكا" },
  "1GJ": { make: "جمس", country: "أمريكا" },
  "1GK": { make: "جمس", country: "أمريكا" },
  "1GT": { make: "جمس", country: "أمريكا" },
  "2CT": { make: "جمس", country: "أمريكا" },
  "2G0": { make: "جمس", country: "كندا" },
  "2GD": { make: "جمس", country: "كندا" },
  "2GH": { make: "جمس", country: "كندا" },
  "2GJ": { make: "جمس", country: "كندا" },
  "2GK": { make: "جمس", country: "كندا" },
  "2GT": { make: "جمس", country: "أمريكا" },
  "3GK": { make: "جمس", country: "أمريكا" },
  "3GT": { make: "جمس", country: "المكسيك" },
  "4G5": { make: "جمس", country: "أمريكا" },
  "4KD": { make: "جمس", country: "أمريكا" },
  "5G3": { make: "جمس", country: "أمريكا" },
};

/** الماركات التي يعرفها جدول الرمز — أسماء كتالوج السيارات تطابقها (اختبار في vehicle-catalog.test.ts) */
export const WMI_MAKES: ReadonlySet<string> = new Set(Object.values(WMI_TABLE).map((entry) => entry.make));

export const VIN_LENGTH = 17;

/** جدول ISO 3779 لرمز السنة في الخانة العاشرة — دورة 30 عاماً، بلا I/O/Q/U/Z */
const YEAR_CODES = "ABCDEFGHJKLMNPRSTVWXY123456789".split("");

const INVALID_VIN_CHARS = /[IOQ]/;

export interface VinDecodeResult {
  valid: boolean;
  make: string | null;
  country: string | null;
  /** أقرب سنة محتملة لرمز الخانة العاشرة — تقريبية، ليست يقينية بلا NHTSA */
  candidateYear: number | null;
  reason?: string;
}

function resolveYearFromCode(code: string, now = new Date()): number | null {
  const offset = YEAR_CODES.indexOf(code);
  if (offset === -1) return null;

  const currentYear = now.getFullYear();
  // الرمز يتكرر كل 30 سنة (1980-2009، 2010-2039، ...)؛ نختار الدورة التي تعطي
  // أقرب سنة لا تتجاوز السنة القادمة (تسمح بسيارات موديل العام القادم المطروحة مبكراً).
  const candidates: number[] = [];
  for (let cycleStart = 1980; cycleStart <= currentYear + 30; cycleStart += 30) {
    candidates.push(cycleStart + offset);
  }
  const valid = candidates.filter((y) => y <= currentYear + 1);
  const pool = valid.length > 0 ? valid : candidates;
  return pool.reduce((closest, y) => (Math.abs(y - currentYear) < Math.abs(closest - currentYear) ? y : closest));
}

export function decodeVin(rawVin: string, now = new Date()): VinDecodeResult {
  const vin = rawVin.trim().toUpperCase();

  if (vin.length !== VIN_LENGTH) {
    return { valid: false, make: null, country: null, candidateYear: null, reason: "الطول ليس 17 خانة" };
  }
  if (INVALID_VIN_CHARS.test(vin)) {
    return { valid: false, make: null, country: null, candidateYear: null, reason: "يحتوي حرفاً غير مسموح (I/O/Q)" };
  }

  const entry = WMI_TABLE[vin.slice(0, 3)];
  const candidateYear = resolveYearFromCode(vin[9], now);

  return {
    valid: true,
    make: entry?.make ?? null,
    country: entry?.country ?? null,
    candidateYear,
    reason: entry ? undefined : "رمز مصنّع (WMI) غير موجود في الجدول المحلي",
  };
}

export interface CleanedVin {
  value: string;
  /** حُذف حرف ليس إنجليزياً ولا رقماً (مثل حرف عربي من لوحة المفاتيح) */
  droppedInvalid: boolean;
  /** كان المكتوب أطول من 17 خانة فقُصّ */
  overflow: boolean;
}

/** أحرف كبيرة، بلا مسافات أو شرطات أو نقاط، والأرقام العربية الهندية لاتينية. I/O/Q تبقى ليُقترح تصحيحها. */
export function cleanVinInput(raw: string): CleanedVin {
  const stripped = toLatinDigits(raw).toUpperCase().replace(/[\s\-.]/g, "");
  const allowed = stripped.replace(/[^A-Z0-9]/g, "");
  return {
    value: allowed.slice(0, VIN_LENGTH),
    droppedInvalid: allowed.length !== stripped.length,
    overflow: allowed.length > VIN_LENGTH,
  };
}

/** عرض مجمّع للمراجعة: «XXX XXXXXX XXXXXXXX» (3 · 6 · 8) */
export function groupVin(vin: string): string {
  return [vin.slice(0, 3), vin.slice(3, 9), vin.slice(9, VIN_LENGTH)].filter(Boolean).join(" ");
}

export function isCompleteVin(vin: string): boolean {
  return /^[A-HJ-NPR-Z0-9]{17}$/.test(vin);
}

const LETTER_FIXES = { O: "0", Q: "0", I: "1" } as const;
export type VinLetterFix = { from: keyof typeof LETTER_FIXES; to: (typeof LETTER_FIXES)[keyof typeof LETTER_FIXES] };

/** الأحرف I وO وQ لا توجد في رقم الهيكل — نقترح بدلها رقماً بدل الرفض الصامت */
export function vinLetterFixes(vin: string): VinLetterFix[] {
  return (Object.keys(LETTER_FIXES) as VinLetterFix["from"][])
    .filter((letter) => vin.includes(letter))
    .map((letter) => ({ from: letter, to: LETTER_FIXES[letter] }));
}

export function applyVinLetterFixes(vin: string): string {
  return vin.replace(/[IOQ]/g, (ch) => LETTER_FIXES[ch as VinLetterFix["from"]]);
}

/**
 * الماركة التي يشير إليها رقم هيكل مكتمل إن خالفت اختيار العميل، وإلا null.
 * الماركة فقط: ترميز السنة في الخانة 10 غير ملزم خارج أمريكا الشمالية.
 */
export function vinMakeConflict(vin: string, selectedMake: string): string | null {
  if (!isCompleteVin(vin)) return null;
  const { make } = decodeVin(vin);
  return make && make !== selectedMake ? make : null;
}
