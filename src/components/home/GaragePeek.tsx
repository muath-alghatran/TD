"use client";

import Link from "next/link";
import { KsaPlate } from "@/components/garage/KsaPlate";
import { Corners } from "@/components/ui/Corners";
import { Icon } from "@/components/ui/Icon";
import { toArabicDigits } from "@/lib/format";
import { displayTrim, vehicleLabel } from "@/lib/garage";
import { useGaragedVehicles } from "@/lib/local-store";

export function vehicleCountLabel(n: number): string {
  if (n === 1) return "مركبة واحدة";
  if (n === 2) return "مركبتان";
  if (n <= 10) return `${toArabicDigits(n)} مركبات`;
  return `${toArabicDigits(n)} مركبة`;
}

/** كراجي على الرئيسية (1b): آخر مركبة محفوظة بلوحتها السعودية */
export function GaragePeek() {
  const vehicles = useGaragedVehicles();
  if (vehicles.length === 0) return null;
  const latest = vehicles[vehicles.length - 1];

  return (
    <section className="page" aria-labelledby="garage-peek-title">
      <div className="sec-hd">
        <h2 id="garage-peek-title" className="sec-title">
          كراجي
        </h2>
        <Link href="/garage" className="sec-link">
          {vehicleCountLabel(vehicles.length)}
        </Link>
      </div>
      <Link href="/garage" className="blueprint car-row" style={{ marginTop: 12, display: "flex" }}>
        <Corners />
        <Icon name="car" size={28} className="car-ic" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="car-name">{vehicleLabel(latest)}</div>
          <div className="car-sub">{displayTrim(latest.trim)}</div>
        </div>
        <KsaPlate plate={latest.plate} />
      </Link>
    </section>
  );
}
