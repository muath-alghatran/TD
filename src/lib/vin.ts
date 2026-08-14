/**
 * فك محلي لرقم الهيكل (VIN) — أول 3 خانات (WMI) والخانة العاشرة (السنة)،
 * حسب docs/build-plan.md المرحلة 3 خطوة 2. لا يستبدل NHTSA vPIC (src/lib/nhtsa.ts)
 * بل يسبقه كفحص فوري بلا شبكة.
 *
 * جدول WMI أدناه بذرة أولية (تويوتا بعدة رموز + هيونداي وهوندا لتوافق بيانات
 * docs/prototype-parts.html) — يُوسَّع بأرقام مؤكدة أثناء "المرحلة 0 · التحضير"
 * الحقيقية، لا يُفترض اكتماله.
 */

const WMI_TABLE: Record<string, { make: string; country: string }> = {
  JTN: { make: "تويوتا", country: "اليابان" },
  JTD: { make: "تويوتا", country: "اليابان" },
  JTE: { make: "تويوتا", country: "اليابان" },
  JTM: { make: "تويوتا", country: "اليابان" },
  JT2: { make: "تويوتا", country: "اليابان" },
  JT3: { make: "تويوتا", country: "اليابان" },
  JT4: { make: "تويوتا", country: "اليابان" },
  JT6: { make: "تويوتا", country: "اليابان" },
  JT8: { make: "تويوتا", country: "اليابان" },
  "4T1": { make: "تويوتا", country: "أمريكا" },
  "4T3": { make: "تويوتا", country: "أمريكا" },
  "5TD": { make: "تويوتا", country: "أمريكا" },
  "2T1": { make: "تويوتا", country: "كندا" },
  "2T2": { make: "تويوتا", country: "كندا" },
  KMH: { make: "هيونداي", country: "كوريا الجنوبية" },
  KM8: { make: "هيونداي", country: "كوريا الجنوبية" },
  JHM: { make: "هوندا", country: "اليابان" },
  "1HG": { make: "هوندا", country: "أمريكا" },
};

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

  if (vin.length !== 17) {
    return { valid: false, make: null, country: null, candidateYear: null, reason: "الطول ليس 17 خانة" };
  }
  if (INVALID_VIN_CHARS.test(vin)) {
    return { valid: false, make: null, country: null, candidateYear: null, reason: "يحتوي حرفاً غير مسموح (I/O/Q)" };
  }

  const wmi3 = vin.slice(0, 3);
  const entry = WMI_TABLE[wmi3];

  const yearCode = vin[9];
  const candidateYear = resolveYearFromCode(yearCode, now);

  return {
    valid: true,
    make: entry?.make ?? null,
    country: entry?.country ?? null,
    candidateYear,
    reason: entry ? undefined : "رمز مصنّع (WMI) غير موجود في الجدول المحلي",
  };
}
