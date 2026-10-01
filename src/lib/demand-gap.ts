/**
 * تسجيل الطلب المفقود — أصل استراتيجي، من اليوم الأول (docs/CLAUDE.md قاعدة 8).
 *
 * TODO(قاعدة بيانات حقيقية): يُستبدل بكتابة Prisma فعلية إلى جدول DemandGap
 * عبر Server Action حين يتوفر DATABASE_URL — الشكل (DemandGapEntry) لن يتغير.
 * حتى ذلك الحين: تخزين محلي بنفس نهج src/lib/garage.ts، حتى لا تُفقد نية
 * التسجيل بلا اتصال قاعدة بيانات.
 */

const STORAGE_KEY = "td-demand-gap-local";

export interface DemandGapEntry {
  oemNumber: string;
  partName: string;
  make: string;
  model: string;
  year: number;
  cityName: string;
  /** نص العميل كما كتبه — مثل سيارة غير موجودة في القائمة (DemandGap.searchText) */
  searchText?: string;
  reason: string;
  createdAt: string;
}

export function logDemandGap(entry: Omit<DemandGapEntry, "createdAt">): void {
  if (typeof window === "undefined") return;
  const record: DemandGapEntry = { ...entry, createdAt: new Date().toISOString() };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const existing: DemandGapEntry[] = raw ? JSON.parse(raw) : [];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, record]));
  } catch {
    // تخزين محلي غير حرج — فشله لا يوقف تجربة المستخدم
  }
}

export function listDemandGaps(): DemandGapEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DemandGapEntry[]) : [];
  } catch {
    return [];
  }
}
