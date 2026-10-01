/** أدوات تنسيق منقولة من docs/prototype-parts.html (num/ar/dayWord، الأسطر 686-688). */

export function toArabicDigits(value: number | string): string {
  return String(value).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
}

/** «٢٠٢٢» → «2022» — لما يكتبه العميل بلوحة مفاتيح عربية */
export function toLatinDigits(value: string): string {
  return value.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}

export function formatPrice(value: number): string {
  return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** مبلغ صحيح بلا كسور: «10,000» — لأسعار الباقات */
export function formatWholePrice(value: number): string {
  return Math.round(value).toLocaleString("en-US", { maximumFractionDigits: 0 });
}

/** مدى سنوات الموديل سرداً بشرياً: «٢٠٠٨–٢٠١٥» */
export function formatYearRange(from: number, to: number): string {
  return toArabicDigits(`${from}–${to}`);
}

export function dayWord(days: number): string {
  if (days === 1) return "يوم واحد";
  if (days === 2) return "يومين";
  return `${toArabicDigits(days)} أيام`;
}

/*── تواريخ وأوقات «تتبع الطلب» ──
   التقويم ميلادي صراحةً (ar-SA يفترض الهجري)، والأرقام عربية لأن التاريخ سرد بشري.
   الساعة بيانات نظام، فتُكتب بأرقام لاتينية مثل 09:05. */

const DAY_DATE = new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-arab", {
  weekday: "long",
  day: "numeric",
  month: "long",
});
const SHORT_DATE = new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-arab", { day: "numeric", month: "long" });
const WEEKDAY = new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-arab", { weekday: "long" });
const MONTH = new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-arab", { month: "long" });
const DAY_NUMBER = new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-arab", { day: "numeric" });

/** «الأحد ١٢ أكتوبر» */
export function formatDayDate(date: Date): string {
  return DAY_DATE.format(date);
}

/** «١٢ أكتوبر» */
export function formatShortDate(date: Date): string {
  return SHORT_DATE.format(date);
}

export function formatWeekday(date: Date): string {
  return WEEKDAY.format(date);
}

export function formatMonth(date: Date): string {
  return MONTH.format(date);
}

/** رقم اليوم من الشهر بالأرقام العربية: «١٢» */
export function formatDayNumber(date: Date): string {
  return DAY_NUMBER.format(date);
}

/** «١٢ شهراً» · «٦ أشهر» — لمدة الضمان */
export function monthsWord(months: number): string {
  if (months === 1) return "شهر واحد";
  if (months === 2) return "شهران";
  if (months <= 10) return `${toArabicDigits(months)} أشهر`;
  return `${toArabicDigits(months)} شهراً`;
}

/** «09:05» + «ص» — ساعة 12 بأرقام لاتينية */
export function formatClock(date: Date): { time: string; period: "ص" | "م" } {
  const h24 = date.getHours();
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const time = `${String(h12).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  return { time, period: h24 < 12 ? "ص" : "م" };
}

function hourWord(hours: number): string {
  if (hours === 1) return "ساعة";
  if (hours === 2) return "ساعتان";
  if (hours <= 10) return `${toArabicDigits(hours)} ساعات`;
  return `${toArabicDigits(hours)} ساعة`;
}

/** المتبقي حتى الموعد بصيغة سرد: «يومين و٤ ساعات» · «٥ ساعات» · «أقل من ساعة» */
export function formatRemaining(ms: number): string {
  if (ms <= 0) return "حان الموعد";
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  if (days >= 1) return hours > 0 ? `${dayWord(days)} و${hourWord(hours)}` : dayWord(days);
  if (hours >= 1) return hourWord(hours);
  return "أقل من ساعة";
}

/** المتبقي كرقم لاتيني ووحدة — للخلية الكبيرة: {value: "2", unit: "يوم"} */
export function remainingParts(ms: number): { value: string; unit: string } {
  if (ms <= 0) return { value: "0", unit: "ساعة" };
  const days = Math.floor(ms / 86_400_000);
  if (days >= 1) return { value: String(days), unit: days >= 3 && days <= 10 ? "أيام" : "يوم" };
  const hours = Math.floor(ms / 3_600_000);
  if (hours >= 1) return { value: String(hours), unit: hours >= 3 && hours <= 10 ? "ساعات" : "ساعة" };
  return { value: String(Math.max(1, Math.floor(ms / 60_000))), unit: "دقيقة" };
}
