"use client";

import { useEffect } from "react";
import { runGarageCleanup } from "@/lib/garage";

/** تنظيف البيانات المحلية عند التحميل (src/lib/garage.ts cleanupGarage) — لا يرسم شيئاً */
export function LocalDataCleanup() {
  useEffect(() => {
    runGarageCleanup();
  }, []);
  return null;
}
