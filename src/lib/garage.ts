/**
 * «كراجي» الزائر — تخزين محلي في المتصفح قبل الدخول.
 * docs/auth-spec.md §3: "سيارته المؤكدة من الاستمارة → تُحفظ محلياً في المتصفح"،
 * وتُنقل لاحقاً إلى حسابه تلقائياً عند الدخول (غير مُنفَّذ في هذه المرحلة).
 */

const STORAGE_KEY = "td-garage-guest";

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
    const raw = window.localStorage.getItem(STORAGE_KEY);
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

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return record;
}
