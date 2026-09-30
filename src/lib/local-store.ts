/**
 * خطافات قراءة البيانات المحلية (الطلبات، كراجي، الوضع) عبر useSyncExternalStore:
 * لا setState داخل أثر، ولا عدم تطابق عند الترطيب — لقطة الخادم فارغة ثابتة،
 * ثم تُقرأ لقطة المتصفح مباشرة بعد التحميل وتتحدث مع كل كتابة.
 */
import { useSyncExternalStore } from "react";
import { GARAGE_STORAGE_KEY, getGaragedVehicles, type GaragedVehicle } from "./garage";
import { LOCAL_CHANGE_EVENT } from "./local-events";
import { ORDERS_STORAGE_KEY, listLocalOrders, type LocalOrder } from "./orders";
import { THEME_CHANGE_EVENT, currentTheme, type Theme } from "./theme";

const NO_ORDERS: LocalOrder[] = [];
const NO_VEHICLES: GaragedVehicle[] = [];

function subscribeLocal(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(LOCAL_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(LOCAL_CHANGE_EVENT, onChange);
  };
}

/** يحفظ آخر قراءة ولا يعيد تحليل JSON إلا إذا تغيّر النص المخزّن — اللقطة يجب أن تبقى نفس المرجع */
function cachedReader<T>(key: string, read: () => T, empty: T): () => T {
  let lastRaw: string | null | undefined;
  let lastValue = empty;
  return () => {
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(key);
    } catch {
      raw = null;
    }
    if (raw !== lastRaw) {
      lastRaw = raw;
      lastValue = raw ? read() : empty;
    }
    return lastValue;
  };
}

const readOrders = cachedReader(ORDERS_STORAGE_KEY, listLocalOrders, NO_ORDERS);
const readVehicles = cachedReader(GARAGE_STORAGE_KEY, getGaragedVehicles, NO_VEHICLES);

export function useLocalOrders(): LocalOrder[] {
  return useSyncExternalStore(subscribeLocal, readOrders, () => NO_ORDERS);
}

export function useGaragedVehicles(): GaragedVehicle[] {
  return useSyncExternalStore(subscribeLocal, readVehicles, () => NO_VEHICLES);
}

function subscribeNothing(): () => void {
  return () => {};
}

/** false أثناء العرض على الخادم والترطيب، ثم true — لما يحتاج بيانات المتصفح قبل أول تهيئة للحالة */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
}

function subscribeTheme(onChange: () => void): () => void {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onChange);
  window.addEventListener(THEME_CHANGE_EVENT, onChange);
  return () => {
    media.removeEventListener("change", onChange);
    window.removeEventListener(THEME_CHANGE_EVENT, onChange);
  };
}

/** null على الخادم — الزر يعرض أيقونة محايدة حتى يُعرف الوضع الفعلي */
export function useTheme(): Theme | null {
  return useSyncExternalStore(subscribeTheme, currentTheme, () => null);
}

/* — ساعة مشتركة تتحدث كل ٣٠ ثانية، لحساب «المتبقي» دون استدعاء Date.now() أثناء العرض — */
let nowValue = 0;

function subscribeClock(onChange: () => void): () => void {
  nowValue = Date.now();
  const id = window.setInterval(() => {
    nowValue = Date.now();
    onChange();
  }, 30_000);
  return () => window.clearInterval(id);
}

function readNow(): number {
  if (nowValue === 0) nowValue = Date.now();
  return nowValue;
}

/** الوقت الحالي بالمللي ثانية — 0 على الخادم */
export function useNow(): number {
  return useSyncExternalStore(subscribeClock, readNow, () => 0);
}
