/**
 * «كراجي» الزائر — تخزين محلي في المتصفح قبل الدخول.
 * docs/auth-spec.md §3: سيارة الزائر المؤكدة تُحفظ محلياً في المتصفح،
 * وتُنقل لاحقاً إلى حسابه تلقائياً عند الدخول (غير مُنفَّذ في هذه المرحلة).
 */
import { notifyLocalChange } from "./local-events";
import type { LocalOrder } from "./orders";
import { isCompleteVin } from "./vin";

export const GARAGE_STORAGE_KEY = "td-garage-guest";

export interface GaragedVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  trim: string;
  /** رقم الهيكل — اختياري للعميل، فيُخزَّن غيابه قيمةً فارغة */
  vin: string;
  /** رمز الجيل من كتالوج السيارات (قاعدة 7). غائب في السجلات الأقدم، وفارغ حين لا يُعرف */
  generationCode?: string;
  plate: string;
  savedAt: string;
}

/** رقم الهيكل الوهمي الذي كانت قراءة الاستمارة التجريبية تحفظه لكل صورة */
export const DEMO_OCR_VIN = "JTNBE46K173012345";
/** كيف كان غياب الرقم يُخزَّن قبل جعله قيمة فارغة */
const LEGACY_NO_VIN_TEXT = "بلا رقم هيكل";

export function getGaragedVehicles(): GaragedVehicle[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GARAGE_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GaragedVehicle[]) : [];
  } catch {
    return [];
  }
}

function writeGarage(vehicles: GaragedVehicle[]): void {
  window.localStorage.setItem(GARAGE_STORAGE_KEY, JSON.stringify(vehicles));
  notifyLocalChange();
}

/**
 * يضيف السيارة إلى كراجي. المكرر يُحذف فقط حين يكون رقم الهيكل حقيقياً —
 * سيارتان بلا رقم لا يمكن الجزم بأنهما سيارة واحدة، فتبقيان معاً.
 */
export function mergeIntoGarage(existing: GaragedVehicle[], record: GaragedVehicle): GaragedVehicle[] {
  const kept = isCompleteVin(record.vin) ? existing.filter((v) => v.vin !== record.vin) : existing;
  return [...kept, record];
}

export function saveVehicleToGarage(vehicle: Omit<GaragedVehicle, "id" | "savedAt">): GaragedVehicle {
  const record: GaragedVehicle = {
    ...vehicle,
    id: crypto.randomUUID(),
    savedAt: new Date().toISOString(),
  };
  writeGarage(mergeIntoGarage(getGaragedVehicles(), record));
  return record;
}

/**
 * تنظيف لمرة واحدة: يحذف سيارات القراءة التجريبية (رقمها الوهمي معروف)،
 * ويحوّل الغياب المخزّن نصاً إلى قيمة فارغة. متساوي الأثر — تشغيله ثانيةً لا يغيّر شيئاً.
 */
export function cleanupGarage(vehicles: GaragedVehicle[]): { vehicles: GaragedVehicle[]; changed: boolean } {
  let changed = false;
  const next: GaragedVehicle[] = [];
  for (const v of vehicles) {
    if (v.vin === DEMO_OCR_VIN) {
      changed = true;
    } else if (v.vin === LEGACY_NO_VIN_TEXT) {
      next.push({ ...v, vin: "" });
      changed = true;
    } else {
      next.push(v);
    }
  }
  return { vehicles: next, changed };
}

export function runGarageCleanup(): void {
  if (typeof window === "undefined") return;
  const { vehicles, changed } = cleanupGarage(getGaragedVehicles());
  if (!changed) return;
  try {
    writeGarage(vehicles);
  } catch {
    // تخزين محلي غير حرج — يُعاد المحاولة في التحميل التالي
  }
}

/**
 * سيارة الطلب: بمعرّفها في كراجي، أو برقم هيكلها إن كان حقيقياً —
 * الرقم الفارغ يتكرر بين السيارات فلا يصلح للمطابقة.
 */
export function findOrderVehicle(
  vehicles: GaragedVehicle[],
  order: Pick<LocalOrder, "vehicleId" | "vehicleVin">,
): GaragedVehicle | undefined {
  const byId = order.vehicleId ? vehicles.find((v) => v.id === order.vehicleId) : undefined;
  if (byId) return byId;
  if (!isCompleteVin(order.vehicleVin)) return undefined;
  return vehicles.find((v) => v.vin === order.vehicleVin);
}

/** اسم المركبة للعرض: «تويوتا كامري ٢٠٢٢» — السنة سرد بشري فتُكتب بالأرقام العربية. */
export function vehicleLabel(vehicle: Pick<GaragedVehicle, "make" | "model" | "year">): string {
  const year = String(vehicle.year).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
  return `${vehicle.make} ${vehicle.model} ${year}`;
}

/** الفئة للعرض: شرطة غير قابلة للكسر حتى لا ينقسم رمز المحرك «2AR‑FE» على سطرين */
export function displayTrim(trim: string): string {
  return trim.replace(/-/g, "\u2011");
}
