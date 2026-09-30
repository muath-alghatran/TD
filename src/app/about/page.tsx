import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Shield } from "@/components/brand/Brand";
import { TabBar } from "@/components/shell/TabBar";
import { Corners } from "@/components/ui/Corners";
import { Icon } from "@/components/ui/Icon";
import { CENTER, COMMITMENTS, FACADE_FOCUS, FACADE_PHOTO, HOW_WE_WORK, TEAM, WORKSHOP_PHOTOS } from "@/lib/center-info";
import { HELLO_MESSAGE, buildWhatsAppLink } from "@/lib/whatsapp-requests";

export const metadata: Metadata = {
  title: "هوية ترست درايف",
  description: CENTER.identity,
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * هوية ترست درايف — تجمع الاتجاهات الثلاثة:
 * واجهة المركز الحقيقية بصبغة فولاذية (1b) · نص الهوية كما اعتمده المركز ·
 * التزاماتنا SPEC 01—06 (1a) · كيف نعمل على الطريق والسطحة تحويلة جانبية (1b) ·
 * ورقة تماس لصور الورشة وختم «بإدارة سعودية» (1c).
 */
export default function AboutPage() {
  const showSheet = WORKSHOP_PHOTOS.length >= 3;

  return (
    <>
      <main className="screen has-tabbar">
        <section className="about-hero hero steel" aria-label="ترست درايف">
          <div className="hero-media duotone">
            <Image
              src={FACADE_PHOTO}
              alt="واجهة مركز ترست درايف في حائل"
              fill
              sizes="(max-width: 720px) 100vw, 720px"
              loading="eager"
              fetchPriority="high"
              style={{ objectFit: "cover", objectPosition: FACADE_FOCUS }}
            />
          </div>
          <div className="hero-shade" />
          <div className="hero-body">
            <div className="page">
              <Shield size={56} alt="TD" />
              <h1 className="about-title">{CENTER.nameAr}</h1>
              <div className="flex flex-wrap items-center gap-2.5" style={{ marginTop: 10 }}>
                <span className="t-code" style={{ color: "var(--fg)", fontSize: 11 }}>
                  TRUST DRIVE · HAIL
                </span>
                <span className="tag" style={{ color: "var(--fg)", fontWeight: 600 }}>
                  <Icon name="badgeCheck" size={13} />
                  بإدارة سعودية
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="page">
          <p className="kicker" style={{ marginTop: 26 }}>
            من نحن
          </p>
          <p className="prose" style={{ marginTop: 12 }}>
            {CENTER.identity}
          </p>

          {/* التزاماتنا (1a) */}
          <section className="blueprint" style={{ marginTop: 28 }} aria-labelledby="commitments-title">
            <Corners />
            <div className="spec-list-hd">
              <h2 id="commitments-title" className="t-disp" style={{ fontSize: 17 }}>
                التزاماتنا
              </h2>
              <span className="t-code">SPEC 01—06</span>
            </div>
            <ul>
              {COMMITMENTS.map((c, i) => (
                <li key={c.text} className="spec-line">
                  <span className="n ltr">{pad(i + 1)}</span>
                  <span>{c.text}</span>
                  <Icon name={c.icon} size={20} />
                </li>
              ))}
            </ul>
          </section>

          {/* كيف نعمل (1b): محطات على الطريق، والسطحة تحويلة جانبية */}
          <h2 className="sec-title" style={{ marginTop: 34 }}>
            كيف نعمل
          </h2>
          <div className="route">
            <i className="route-lane" aria-hidden="true" />
            <i className="route-center" aria-hidden="true" />
            <ol>
              {HOW_WE_WORK.map((step, i) => (
                <li key={step.text} className="route-stop">
                  <i aria-hidden="true" />
                  <div className="route-stop-hd">
                    <span className="t-code" style={{ fontSize: 12, letterSpacing: "0.08em" }}>
                      {pad(i + 1)}
                    </span>
                    <Icon name={step.icon} size={18} />
                  </div>
                  <div className="route-stop-say">{step.text}</div>
                </li>
              ))}
            </ol>
            <div className="detour">
              <i aria-hidden="true" />
              <Icon name="truck" size={22} />
              <div>
                <div className="t-code">تحويلة · DETOUR</div>
                <p style={{ fontSize: 14.5, lineHeight: 1.7, marginTop: 6 }}>{CENTER.towPromise}</p>
                <Link href="/tow" className="sec-link" style={{ marginTop: 6 }}>
                  اطلب سطحة
                  <Icon name="chevronLeft" size={15} />
                </Link>
              </div>
            </div>
          </div>

          {/* ورقة تماس لصور الورشة (1c) — تظهر حين تتوفر صور حقيقية كافية */}
          {showSheet && (
            <section style={{ marginTop: 34 }} aria-labelledby="sheet-title">
              <div className="flex items-baseline justify-between" style={{ marginBottom: 12 }}>
                <h2 id="sheet-title" className="sec-title">
                  من الورشة
                </h2>
                <span className="t-code">CONTACT SHEET 01—{pad(WORKSHOP_PHOTOS.length)}</span>
              </div>
              <div className="contact-sheet">
                {WORKSHOP_PHOTOS.map((photo, i) => (
                  <figure key={photo.src} className="duotone">
                    <Image src={photo.src} alt={photo.caption} fill sizes="240px" style={{ objectFit: "cover" }} />
                    <span className="frame-no ltr">{pad(i + 1)}</span>
                  </figure>
                ))}
              </div>
            </section>
          )}

          {/* الفريق — يظهر حين تُضاف الأسماء في src/lib/center-info.ts */}
          {TEAM.length > 0 && (
            <section style={{ marginTop: 34 }} aria-labelledby="team-title">
              <div className="flex items-baseline justify-between">
                <h2 id="team-title" className="sec-title">
                  الفريق
                </h2>
                <span style={{ fontSize: 12.5, color: "var(--muted)" }}>فريق سعودي في {CENTER.city}</span>
              </div>
              <div className="team">
                {TEAM.map((member) => (
                  <div key={member.role}>
                    <div className="photo duotone">
                      {member.photo ? (
                        <Image src={member.photo} alt={member.name} width={240} height={264} />
                      ) : (
                        <span className="grid h-full place-items-center" style={{ color: "var(--muted)" }}>
                          <Icon name="shield" size={28} />
                        </span>
                      )}
                    </div>
                    <div className="t-disp" style={{ fontSize: 14.5, marginTop: 8 }}>
                      {member.role}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>{member.name}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ختم «بإدارة سعودية» (1c) */}
          <div className="blueprint stamp">
            <Corners />
            <Shield size={46} />
            <div>
              <div className="stamp-title">بإدارة سعودية</div>
              <div className="t-code" style={{ marginTop: 6 }}>
                SAUDI-MANAGED · HAIL · KSA
              </div>
            </div>
          </div>

          <div className="flex gap-2.5" style={{ marginTop: 24 }}>
            <a
              href={buildWhatsAppLink(HELLO_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-lg blueprint"
              style={{ flex: 1 }}
            >
              <Corners />
              <Icon name="messageCircle" size={20} />
              تواصل معنا
            </a>
            <a href={`tel:${CENTER.phoneTel}`} className="btn btn-secondary btn-icon" aria-label="اتصال مباشر">
              <Icon name="phone" size={20} />
            </a>
            {CENTER.mapUrl && (
              <a
                href={CENTER.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-icon"
                aria-label="الموقع على الخريطة"
              >
                <Icon name="mapPin" size={20} />
              </a>
            )}
          </div>
          <Link href="/booking" className="btn btn-secondary btn-lg btn-block" style={{ marginTop: 10 }}>
            <Icon name="calendarCheck" size={20} />
            احجز موعد فحص
          </Link>
        </div>
      </main>
      <TabBar />
    </>
  );
}
