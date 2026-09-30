"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getGaragedVehicles } from "@/lib/garage";
import { useHydrated } from "@/lib/local-store";
import { PartsOrderFlow } from "./PartsOrderFlow";

/**
 * يختار السيارة التي يبدأ بها تدفق القطع مرة واحدة عند التحميل:
 * المطلوبة بالرابط (?vehicle=) أو آخر سيارة في «كراجي»، أو تعريف سيارة جديدة (?new=1).
 */
function Flow({ vehicleId, fresh }: { vehicleId?: string; fresh: boolean }) {
  const router = useRouter();
  const [initialVehicle] = useState(() => {
    if (fresh) return undefined;
    const saved = getGaragedVehicles();
    return saved.find((v) => v.id === vehicleId) ?? saved[saved.length - 1];
  });
  return <PartsOrderFlow initialVehicle={initialVehicle} onHome={() => router.push("/")} />;
}

export function PartsScreen({ vehicleId, fresh }: { vehicleId?: string; fresh: boolean }) {
  const hydrated = useHydrated();
  if (!hydrated) {
    return (
      <main className="stage">
        <span className="idle">جارٍ التحميل…</span>
      </main>
    );
  }
  return <Flow vehicleId={vehicleId} fresh={fresh} />;
}
