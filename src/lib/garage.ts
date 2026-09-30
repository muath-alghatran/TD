/**
 * «كراجي» الزائر — تخزين محلي في المتصفح قبل الدخول.
 * docs/auth-spec.md §3: "سيارته المؤكدة من الاستمارة → تُحفظ محلياً في المتصفح"،
 * وتُنقل لاحقاً إلى حسابه تلقائياً عند الدخول (غير مُنفَّذ في هذه المرحلة).
 */
import { notifyLocalChange } from "./local-events";

export const GARAGE_STORAGE_KEY = "td-garage-guest";

export interface GaragedVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  trim: string;
  vin: string;
  plate: string;
  savedAt: string;
}

export function getGaragedVehicles(): GaragedVehicle[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GARAGE_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GaragedVehicle[]) : [];
  } catch {
    return [];
  }
}

export function saveVehicleToGarage(vehicle: Omit<GaragedVehicle, "id" | "savedAt">): GaragedVehicle {
  const record: GaragedVehicle = {
    ...vehicle,
    id: crypto.randomUUID(),
    savedAt: new Date().toISOString(),
  };

  const existing = getGaragedVehicles();
  const withoutDuplicateVin = existing.filter((v) => v.vin !== record.vin);
  const next = [...withoutDuplicateVin, record];

  window.localStorage.setItem(GARAGE_STORAGE_KEY, JSON.stringify(next));
  notifyLocalChange();
  return record;
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
