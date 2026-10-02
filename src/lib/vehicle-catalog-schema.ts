/**
 * شكل صف الكتالوج وقيمه المسموحة — منفصل عن البيانات حتى يستعمله سكربت التوليد
 * قبل أن يوجد الملف المولَّد.
 */

export const CATALOG_YEAR_MIN = 2008;
export const CATALOG_YEAR_MAX = 2027;

export const VEHICLE_BODIES = ["sedan", "hatchback", "coupe", "suv", "pickup", "van", "mpv"] as const;
export type VehicleBody = (typeof VEHICLE_BODIES)[number];

/** verified مؤكد من المرجع · verify يحتاج مراجعة (الرمز فارغ حين لا نعرفه) · provisional جيل حالي سنواته المقبلة متوقعة */
export const VEHICLE_CATALOG_STATUSES = ["verified", "verify", "provisional"] as const;
export type VehicleCatalogStatus = (typeof VEHICLE_CATALOG_STATUSES)[number];

export interface VehicleCatalogRow {
  makeAr: string;
  makeEn: string;
  modelAr: string;
  modelEn: string;
  /** الكتابات الشائعة — «لاند كروزر» · «بترول» · «شاص» */
  aliases: string[];
  /** قاعدة 7: التوافق يُربط بالجيل لا بالسنة. فارغ حين لم يتأكد */
  generationCode: string;
  yearFrom: number;
  yearTo: number;
  body: VehicleBody;
  source: string;
  status: VehicleCatalogStatus;
}

/** ما يصل المتصفح: الصف بلا المرجع والحالة (للمراجعة والاختبارات فقط) — ملف أخف */
export type VehicleCatalogEntry = Omit<VehicleCatalogRow, "source" | "status">;
