"use client";

import { useLocalOrders } from "@/lib/local-store";
import { activeOrders } from "@/lib/order-progress";
import { ActiveOrder } from "./ActiveOrder";
import { RoadJourney } from "./RoadJourney";

/**
 * خانة واحدة تحت الواجهة: الطلب النشط لا يُعرف على الخادم (بيانات الجهاز)، فيُرسم
 * طريق الزائر أولاً، ثم يتلاشى إلى الطلب النشط إن وُجد — في الخلية نفسها وبارتفاع
 * محجوز للحالتين، فلا يُزاح ما تحتها (CLS = 0).
 */
export function HomeJourneySlot() {
  const orders = useLocalOrders();
  const hasActive = activeOrders(orders).length > 0;

  return (
    <div className={`journey-slot${hasActive ? " has-order" : ""}`}>
      <div className="journey-layer" inert={hasActive} aria-hidden={hasActive || undefined}>
        <RoadJourney hidden={hasActive} />
      </div>
      {hasActive && (
        <div className="journey-layer journey-layer-in">
          <ActiveOrder />
        </div>
      )}
    </div>
  );
}
