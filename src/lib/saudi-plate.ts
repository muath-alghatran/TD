/**
 * اللوحة السعودية: الحروف والأرقام بالعربي في الصف العلوي، ومقابلها اللاتيني تحته.
 * «كراجي» يحفظ اللوحة نصاً واحداً كما قرأته الاستمارة («ر ن ح ٤٧٢٩»)، فنستخرج
 * منها الصفّين. كل حرف لاتيني يقع تحت حرفه العربي، فترتيب العرض من اليسار
 * هو عكس ترتيب قراءة الحروف العربية.
 */

const LETTER_MAP: Record<string, string> = {
  ا: "A",
  أ: "A",
  ب: "B",
  ح: "J",
  د: "D",
  ر: "R",
  س: "S",
  ص: "X",
  ط: "T",
  ع: "E",
  ق: "G",
  ك: "K",
  ل: "L",
  م: "Z",
  ن: "N",
  ه: "H",
  هـ: "H",
  و: "U",
  ى: "V",
  ي: "V",
};

const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export interface SaudiPlate {
  /** الحروف بترتيب العرض من اليسار إلى اليمين */
  lettersAr: string[];
  lettersEn: string[];
  digitsAr: string;
  digitsEn: string;
}

export function parseSaudiPlate(raw: string | null | undefined): SaudiPlate | null {
  if (!raw) return null;
  const readingOrder = [...raw.replace(/ـ/g, "")].filter((ch) => ch in LETTER_MAP);
  const digitsEn = [...raw]
    .map((ch) => {
      const idx = AR_DIGITS.indexOf(ch);
      if (idx >= 0) return String(idx);
      return /[0-9]/.test(ch) ? ch : "";
    })
    .join("");
  if (readingOrder.length === 0 || readingOrder.length > 3 || digitsEn.length === 0 || digitsEn.length > 4) return null;

  const lettersAr = [...readingOrder].reverse();
  return {
    lettersAr,
    lettersEn: lettersAr.map((ch) => LETTER_MAP[ch]),
    digitsAr: digitsEn.replace(/\d/g, (d) => AR_DIGITS[Number(d)]),
    digitsEn,
  };
}
