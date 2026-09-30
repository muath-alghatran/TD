import type { Metadata } from "next";
import Link from "next/link";
import { ActionBar } from "@/components/shell/ActionBar";
import { AppBar } from "@/components/shell/AppBar";
import { Corners } from "@/components/ui/Corners";
import { Icon, type IconName } from "@/components/ui/Icon";
import { CENTER } from "@/lib/center-info";
import { HELLO_MESSAGE, buildWhatsAppLink } from "@/lib/whatsapp-requests";

export const metadata: Metadata = { title: "الدعم والتواصل" };

const QUICK: { href: string; label: string; hint: string; icon: IconName }[] = [
  { href: "/orders", label: "تتبع طلب", hint: "مراحل طلبك وموعده المحسوب", icon: "route" },
  { href: "/booking", label: "حجز موعد فحص", hint: "اختر اليوم والساعة", icon: "calendarCheck" },
  { href: "/tow", label: "طلب سطحة", hint: "مجانية عند موافقتك على السعر", icon: "truck" },
  { href: "/about", label: "هوية ترست درايف", hint: "من نحن والتزاماتنا", icon: "shield" },
];

export default function SupportPage() {
  const whatsapp = buildWhatsAppLink(HELLO_MESSAGE);
  return (
    <>
      <AppBar title="الدعم والتواصل" />
      <main className="screen has-actionbar">
        <div className="page">
          <p className="lead-note" style={{ marginTop: 20 }}>
            نرد عليك على واتساب، أو اتصل بنا مباشرة. رسالتك تصل للفريق في مركز {CENTER.city}.
          </p>

          <section className="blueprint" style={{ marginTop: 18 }} aria-label="طرق التواصل">
            <Corners />
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="contact-row">
              <span className="box-ic">
                <Icon name="messageCircle" size={22} />
              </span>
              <span>
                <span className="t-disp" style={{ display: "block", fontSize: 16 }}>
                  واتساب
                </span>
                <span style={{ fontSize: 12.5, color: "var(--muted)" }}>أسرع طريقة للتواصل وإرسال الصور</span>
              </span>
              <Icon name="chevronLeft" size={18} className="chev" />
            </a>
            <a href={`tel:${CENTER.phoneTel}`} className="contact-row">
              <span className="box-ic">
                <Icon name="phone" size={22} />
              </span>
              <span>
                <span className="t-disp" style={{ display: "block", fontSize: 16 }}>
                  اتصال مباشر
                </span>
                <span className="t-data" style={{ fontSize: 13, color: "var(--muted)" }}>
                  {CENTER.phoneDisplay}
                </span>
              </span>
              <Icon name="chevronLeft" size={18} className="chev" />
            </a>
            {CENTER.mapUrl && (
              <a href={CENTER.mapUrl} target="_blank" rel="noopener noreferrer" className="contact-row">
                <span className="box-ic">
                  <Icon name="mapPin" size={22} />
                </span>
                <span>
                  <span className="t-disp" style={{ display: "block", fontSize: 16 }}>
                    الموقع على الخريطة
                  </span>
                  <span style={{ fontSize: 12.5, color: "var(--muted)" }}>مركز ترست درايف · {CENTER.city}</span>
                </span>
                <Icon name="chevronLeft" size={18} className="chev" />
              </a>
            )}
            {CENTER.hours && (
              <div className="contact-row">
                <span className="box-ic">
                  <Icon name="clock" size={22} />
                </span>
                <span>
                  <span className="t-disp" style={{ display: "block", fontSize: 16 }}>
                    ساعات العمل
                  </span>
                  <span style={{ fontSize: 12.5, color: "var(--muted)" }}>{CENTER.hours}</span>
                </span>
              </div>
            )}
          </section>

          <h2 className="sec-title" style={{ marginTop: 30 }}>
            طلبات سريعة
          </h2>
          <nav className="blueprint" style={{ marginTop: 12 }} aria-label="طلبات سريعة">
            <Corners />
            {QUICK.map((item) => (
              <Link key={item.href} href={item.href} className="contact-row">
                <Icon name={item.icon} size={22} className="car-ic" />
                <span>
                  <span className="t-disp" style={{ display: "block", fontSize: 16 }}>
                    {item.label}
                  </span>
                  <span style={{ fontSize: 12.5, color: "var(--muted)" }}>{item.hint}</span>
                </span>
                <Icon name="chevronLeft" size={18} className="chev" />
              </Link>
            ))}
          </nav>
        </div>
      </main>
      <ActionBar>
        <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg blueprint">
          <Corners />
          <Icon name="messageCircle" size={20} />
          راسلنا على واتساب
        </a>
        <a href={`tel:${CENTER.phoneTel}`} className="btn btn-secondary btn-icon" aria-label="اتصال مباشر">
          <Icon name="phone" size={20} />
        </a>
      </ActionBar>
    </>
  );
}
