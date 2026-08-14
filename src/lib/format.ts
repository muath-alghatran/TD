/** أدوات تنسيق منقولة من docs/prototype-parts.html (num/ar/dayWord، الأسطر 686-688). */

export function toArabicDigits(value: number | string): string {
  return String(value).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
}

export function formatPrice(value: number): string {
  return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function dayWord(days: number): string {
  if (days === 1) return "يوم واحد";
  if (days === 2) return "يومين";
  return `${toArabicDigits(days)} أيام`;
}
