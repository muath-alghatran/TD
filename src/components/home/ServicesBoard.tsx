import Link from "next/link";
import { Corners } from "@/components/ui/Corners";
import { Icon, type IconName } from "@/components/ui/Icon";

const SERVICES: { no: string; href: string; name: string; hint: string; icon: IconName }[] = [
  { no: "01", href: "/parts", name: "قطع الغيار", hint: "لكل الماركات · بالاسم الذي تعرفه", icon: "cog" },
  { no: "02", href: "/booking", name: "حجز موعد فحص", hint: "اختر اليوم والساعة", icon: "calendarCheck" },
  { no: "03", href: "/tow", name: "طلب سطحة", hint: "مجانية عند موافقتك على السعر", icon: "truck" },
  { no: "04", href: "/orders", name: "تتبع الطلب", hint: "خطوة بخطوة بالصور والفيديو", icon: "route" },
  { no: "05", href: "/garage", name: "كراجي", hint: "مركباتك المحفوظة", icon: "warehouse" },
  { no: "06", href: "/support", name: "الدعم والتواصل", hint: "واتساب · اتصال مباشر", icon: "headset" },
];

/** لوح الخدمات الست (1a): شبكة خلايا متساوية مرقّمة بخطوط شعرية */
export function ServicesBoard() {
  return (
    <section className="page" aria-labelledby="services-title">
      <div className="sec-hd">
        <h2 id="services-title" className="sec-title">
          ماذا تحتاج اليوم؟
        </h2>
        <span className="t-code">06 SERVICES</span>
      </div>
      <nav className="blueprint" style={{ marginTop: 12 }} aria-label="الخدمات">
        <Corners />
        <div className="svc-board">
          {SERVICES.map((svc) => (
            <Link key={svc.no} href={svc.href} className="svc-cell">
              <span className="svc-cell-top">
                <Icon name={svc.icon} size={24} />
                <span className="t-code" style={{ fontSize: 12, letterSpacing: "0.06em" }}>
                  {svc.no}
                </span>
              </span>
              <span>
                <span className="svc-name" style={{ display: "block" }}>
                  {svc.name}
                </span>
                <span className="svc-hint" style={{ display: "block" }}>
                  {svc.hint}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </nav>
      <p className="note-line">
        <Icon name="truck" size={15} />
        إن تعذّر عليك الحضور نرسل لك سطحة، وتكون مجانية عند موافقتك على السعر.
      </p>
    </section>
  );
}
