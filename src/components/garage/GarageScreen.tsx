"use client";

import Link from "next/link";
import { Corners } from "@/components/ui/Corners";
import { Icon } from "@/components/ui/Icon";
import { toArabicDigits } from "@/lib/format";
import { displayTrim, vehicleLabel } from "@/lib/garage";
import { useGaragedVehicles, useHydrated, useLocalOrders } from "@/lib/local-store";
import { KsaPlate } from "./KsaPlate";

function ordersWord(n: number): string {
  if (n === 0) return "لا طلبات بعد";
  if (n === 1) return "طلب واحد";
  if (n === 2) return "طلبان";
  if (n <= 10) return `${toArabicDigits(n)} طلبات`;
  return `${toArabicDigits(n)} طلباً`;
}

/** كراجي — مركباتك المحفوظة بلوحاتها، ومنها تبدأ أي طلب أو حجز */
export function GarageScreen() {
  const hydrated = useHydrated();
  const vehicles = useGaragedVehicles();
  const orders = useLocalOrders();

  if (!hydrated) return null;

  if (vehicles.length === 0) {
    return (
      <div className="blueprint empty" style={{ marginTop: 20 }}>
        <Corners />
        <span className="box-ic">
          <Icon name="car" size={24} />
        </span>
        <div className="t-disp" style={{ fontSize: 19 }}>
          لا مركبات بعد
        </div>
        <p>صوّر استمارة سيارتك مرة واحدة، ونحفظها هنا لكل طلب وحجز بعدها.</p>
        <Link href="/parts?new=1" className="btn btn-primary">
          <Icon name="plus" size={18} />
          أضف مركبتك
        </Link>
      </div>
    );
  }

  const newestFirst = [...vehicles].reverse();

  return (
    <>
      <div className="blueprint" style={{ marginTop: 20 }}>
        <Corners />
        {newestFirst.map((v) => {
          const count = orders.filter((o) => o.vehicleVin === v.vin).length;
          const hasVin = /[A-Z0-9]{8,}/i.test(v.vin);
          return (
            <article key={v.id} className="garage-item">
              <div className="flex items-center gap-3">
                <Icon name="car" size={28} className="car-ic" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 className="car-name">{vehicleLabel(v)}</h2>
                  <div className="car-sub">{displayTrim(v.trim)}</div>
                </div>
                <KsaPlate plate={v.plate} />
              </div>
              <div className="garage-meta">
                {hasVin ? <span className="t-data">VIN {v.vin}</span> : <span>بلا رقم هيكل</span>}
                <span>{ordersWord(count)}</span>
              </div>
              <div className="garage-actions">
                <Link href={`/parts?vehicle=${v.id}`} className="btn btn-secondary">
                  <Icon name="cog" size={18} />
                  اطلب قطعة لها
                </Link>
                <Link href={`/booking?vehicle=${v.id}`} className="btn btn-secondary">
                  <Icon name="calendarCheck" size={18} />
                  احجز فحص
                </Link>
              </div>
            </article>
          );
        })}
      </div>
      <Link href="/parts?new=1" className="btn btn-secondary btn-block" style={{ marginTop: 16 }}>
        <Icon name="plus" size={18} />
        أضف مركبة أخرى
      </Link>
    </>
  );
}
