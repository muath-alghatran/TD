import type { PromiseSettings } from "./promise-engine";

/** يطابق docs/data/settings.csv — مصدر واحد للحقيقة، يُستورَد من الاختبارات ومكوّني المخطط معاً. */
export const DEFAULT_PROMISE_SETTINGS: PromiseSettings = {
  hiConf: 0.85,
  midConf: 0.65,
  reliableSupplierThreshold: 0.55,
  reliablePrepDays: 2,
  specialPrepDays: 5,
  fitDays: 1,
  internalStockConfidence: 0.99,
  weakSupplierBaseConfidence: 0.5,
};
