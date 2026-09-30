/**
 * مراحل الطلب للعرض في «طلباتي» و«تتبع الطلب» — مشتقة من حقول LocalOrder فقط.
 *
 * لا نخترع تقدماً لا تسجّله البيانات: بعد الدفع تبقى «تجهيز القطعة» هي
 * المرحلة الحالية حتى تسجّل لوحة التحكم التسليم الفعلي (actualDays).
 * الموعد المحسوب يبدأ من paidAt لا من requestedAt (docs/CLAUDE.md قاعدة 13).
 */
import { catalogPartLegs } from "./catalog-promise";
import { CITIES } from "./city-catalog";
import type { LocalOrder } from "./orders";
import { ZONES } from "./zone-catalog";

export type StageState = "done" | "current" | "next" | "failed";

export interface OrderStage {
  key: "requested" | "confirmed" | "paid" | "prep" | "handover" | "delivered";
  label: string;
  /** اسم قصير لمحطة الطريق */
  short: string;
  note: string;
  at: Date | null;
  /** التاريخ فقط بلا ساعة — حين لا تُسجَّل الساعة الفعلية */
  dateOnly?: boolean;
  state: StageState;
}

export interface PromiseLeg {
  label: string;
  days: number;
}

export interface OrderProgress {
  stages: OrderStage[];
  /** موضع الدرع على الطريق: المرحلة الحالية، أو الأخيرة إن اكتمل الطلب */
  currentIndex: number;
  delivered: boolean;
  failed: boolean;
  statusLabel: string;
  /** الموعد المحسوب = paidAt + أيام الوعد. null قبل الدفع */
  dueAt: Date | null;
  /** أجزاء المدة كما حسبها محرك الوعد، أو null إن تعذّر إعادة اشتقاقها */
  legs: PromiseLeg[] | null;
}

const DAY_MS = 86_400_000;

function toDate(value: string | null): Date | null {
  return value ? new Date(value) : null;
}

function legsFor(order: LocalOrder): PromiseLeg[] | null {
  const part = ZONES.flatMap((z) => z.parts).find((p) => p.oem === order.partOem && p.avail !== false);
  const city = CITIES.find((c) => c.n === order.cityName);
  if (!part || !city) return null;
  const legs = catalogPartLegs(part, city, order.mode);
  const total = Math.max(1, legs.prepDays + legs.shipDays + legs.fitDays);
  // إن تغيّر الكتالوج بعد الطلب فلا نعرض تفصيلاً يناقض الوعد المسجَّل
  if (total !== order.promisedDays) return null;
  const list: PromiseLeg[] = [
    { label: legs.prepDays === 0 ? "من المخزون" : "تجهيز", days: legs.prepDays },
    { label: `شحن إلى ${order.cityName}`, days: legs.shipDays },
    { label: "تركيب", days: legs.fitDays },
  ];
  return list.filter((leg) => leg.days > 0 || leg.label === "من المخزون");
}

export function orderProgress(order: LocalOrder): OrderProgress {
  const failed = order.status === "unavailable";
  const paid = order.status === "paid" && order.paidAt !== null;
  const delivered = paid && order.actualDays !== null;
  const confirmedDone = order.confirmedAt !== null && !failed;
  const paidAt = toDate(order.paidAt);
  const fit = order.mode === "fit";

  const stages: OrderStage[] = [
    {
      key: "requested",
      label: "استلمنا طلبك",
      short: "الطلب",
      note: `${order.partName} · ${fit ? "تركيب في المركز" : `توصيل إلى ${order.cityName}`}`,
      at: toDate(order.requestedAt),
      state: "done",
    },
    {
      key: "confirmed",
      label: failed ? "لم تتوفر القطعة" : "تأكيد التوفر والسعر",
      short: "التأكيد",
      note: failed
        ? "سجّلناها في قائمة الطلب المفقود، ونبلغك فور توفرها."
        : confirmedDone
          ? "أكّدنا التوفر، والسعر مثبّت ولا يتغير بعد التأكيد."
          : "نتأكد من المورد، ونرسل لك السعر المفصّل على واتساب.",
      at: toDate(order.confirmedAt),
      state: failed ? "failed" : confirmedDone || paid ? "done" : "current",
    },
    {
      key: "paid",
      label: "موافقتك والدفع",
      short: "الدفع",
      note: paid
        ? "وافقت على السعر — ومن هنا بدأ عدّاد الوعد."
        : "لا يُخصم أي مبلغ قبل موافقتك، ويبدأ عدّاد الوعد من لحظة الدفع.",
      at: paidAt,
      state: paid ? "done" : order.status === "confirmed" ? "current" : "next",
    },
    {
      key: "prep",
      label: "تجهيز القطعة",
      short: "التجهيز",
      note: "من المورد إلى مركز حائل، وصور كل مرحلة تصلك على واتساب.",
      at: null,
      state: delivered ? "done" : paid ? "current" : "next",
    },
    {
      key: "handover",
      label: fit ? "التركيب في المركز" : `الشحن إلى ${order.cityName}`,
      short: fit ? "التركيب" : "الشحن",
      note: fit ? "موعد تركيب خلال ٢٤ ساعة من وصول القطعة." : "من مركز حائل إلى مدينتك.",
      at: null,
      state: delivered ? "done" : "next",
    },
    {
      key: "delivered",
      label: "التسليم",
      short: "التسليم",
      note: fit ? "تستلم سيارتك مع وثيقة الضمان المكتوبة." : "تستلم القطعة مع وثيقة الضمان المكتوبة.",
      at: delivered && paidAt ? new Date(paidAt.getTime() + (order.actualDays ?? 0) * DAY_MS) : null,
      dateOnly: true,
      state: delivered ? "done" : "next",
    },
  ];

  const activeIndex = stages.findIndex((s) => s.state === "current" || s.state === "failed");
  const currentIndex = activeIndex >= 0 ? activeIndex : stages.length - 1;

  const statusLabel = failed
    ? "غير متوفرة"
    : delivered
      ? "مكتمل"
      : paid
        ? "قيد التجهيز"
        : order.status === "confirmed"
          ? "بانتظار موافقتك"
          : "بانتظار تأكيد التوفر";

  return {
    stages,
    currentIndex,
    delivered,
    failed,
    statusLabel,
    dueAt: paidAt ? new Date(paidAt.getTime() + order.promisedDays * DAY_MS) : null,
    legs: legsFor(order),
  };
}

/** الطلب «النشط»: لم يكتمل ولم يتعذّر — الأحدث أولاً */
export function activeOrders(orders: LocalOrder[]): LocalOrder[] {
  return orders
    .filter((o) => o.status !== "unavailable" && !(o.status === "paid" && o.actualDays !== null))
    .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
}
