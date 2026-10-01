import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaqList } from "@/components/home/FaqSection";
import { BodyDrawing } from "@/components/packages/BodyDrawing";
import { PackagePrice } from "@/components/packages/PackagePrice";
import { ActionBar } from "@/components/shell/ActionBar";
import { AppBar } from "@/components/shell/AppBar";
import { Corners } from "@/components/ui/Corners";
import { Icon } from "@/components/ui/Icon";
import { CENTER } from "@/lib/center-info";
import { formatYearRange } from "@/lib/format";
import { PACKAGES, PACKAGE_STEPS, findPackage, packageFaq } from "@/lib/packages";
import { buildPackageQuestionMessage, buildWhatsAppLink } from "@/lib/whatsapp-requests";

const pad = (n: number) => String(n).padStart(2, "0");
const OG_ALT = `${CENTER.nameAr} (TD) — مركز صيانة وقطع غيار في ${CENTER.city} بإدارة سعودية`;

export function generateStaticParams() {
  return PACKAGES.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/packages/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const pkg = findPackage(slug);
  if (!pkg) return { title: "باقة غير موجودة" };
  // السنوات لاتينية هنا فقط — الناس تبحث بها هكذا («ترهيم لاندكروزر 2008»)
  const title = `${pkg.title} ${pkg.yearFrom}–${pkg.yearTo} في ${CENTER.city}`;
  const description = `${pkg.title} لموديلات ${pkg.yearFrom}–${pkg.yearTo}: قطع الترهيم كاملة حتى الجنوط والرش والتركيب بسعر شامل ثابت ${pkg.price.toLocaleString("en-US")} ر.س — ${CENTER.nameAr}، ${CENTER.city}.`;
  return {
    title,
    description,
    openGraph: {
      type: "website",
      locale: "ar_SA",
      siteName: `${CENTER.nameAr} · ${CENTER.nameEn}`,
      title: `${title} — ${CENTER.nameAr}`,
      description,
      // تعريف openGraph هنا يُسقط صورة الجذر الموروثة — نعيدها صراحةً لمعاينة رابط واتساب
      images: [{ url: "/opengraph-image.jpg", width: 1200, height: 630, alt: OG_ALT }],
    },
  };
}

/**
 * صفحة باقة ترهيم — تُبنى ثابتة لكل باقة وتُفهرس.
 * الرأس حقل فولاذي فيه الرسم (أو صورة «بعد» الحقيقية حين تُضاف) · تشمل الباقة (1a) ·
 * كيف تتم على الطريق (1b) · قبل وبعد بالصور الحقيقية فقط · أسئلة الباقة من بياناتها.
 */
export default async function PackagePage({ params }: PageProps<"/packages/[slug]">) {
  const { slug } = await params;
  const pkg = findPackage(slug);
  if (!pkg) notFound();

  const index = PACKAGES.indexOf(pkg);
  const years = formatYearRange(pkg.yearFrom, pkg.yearTo);
  const cover = pkg.gallery[0];
  const whatsapp = buildWhatsAppLink(buildPackageQuestionMessage(pkg));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${pkg.title} ${pkg.yearFrom}–${pkg.yearTo}`,
    serviceType: "ترهيم",
    areaServed: { "@type": "City", name: CENTER.city },
    provider: { "@type": "AutoRepair", name: CENTER.nameAr, telephone: CENTER.phoneTel },
    offers: { "@type": "Offer", price: pkg.price, priceCurrency: "SAR" },
  };

  return (
    <>
      <AppBar title="باقات الترهيم" backHref="/#packages" titleAs="div" />
      <main className="screen has-actionbar">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        <section className="steel pkg-hero" aria-labelledby="pkg-title">
          <div className="page">
            <span className="t-code">
              FACELIFT {pad(index + 1)} / {pad(PACKAGES.length)}
            </span>
            {cover ? (
              <figure className="pkg-hero-photo duotone">
                <Image
                  src={cover.after}
                  alt={cover.caption}
                  fill
                  sizes="(max-width: 720px) 100vw, 680px"
                  loading="eager"
                  fetchPriority="high"
                  style={{ objectFit: "cover" }}
                />
              </figure>
            ) : (
              <BodyDrawing body={pkg.body} className="pkg-hero-art" />
            )}
            <h1 id="pkg-title" className="pkg-title">
              {pkg.title}
            </h1>
            <p className="pkg-hero-sub">
              {pkg.make} {pkg.model} · موديلات {years}
            </p>
            <PackagePrice pkg={pkg} size="page" />
          </div>
        </section>

        <div className="page">
          {/* تشمل الباقة (1a) */}
          <section className="blueprint" style={{ marginTop: 26 }} aria-labelledby="incl-title">
            <Corners />
            <div className="spec-list-hd">
              <h2 id="incl-title" className="t-disp" style={{ fontSize: 17 }}>
                تشمل الباقة
              </h2>
              <span className="t-code">INCLUDED 01—{pad(pkg.includes.length)}</span>
            </div>
            <ul>
              {pkg.includes.map((item, i) => (
                <li key={item} className="spec-line">
                  <span className="n ltr">{pad(i + 1)}</span>
                  <span>{item}</span>
                  <Icon name="check" size={20} />
                </li>
              ))}
            </ul>
            {pkg.targetLook && <p className="pkg-target">إلى شكل {pkg.targetLook}</p>}
          </section>

          {/* كيف تتم (1b): محطات على الطريق نفسه في صفحة الهوية */}
          <h2 className="sec-title" style={{ marginTop: 34 }}>
            كيف تتم
          </h2>
          <div className="route">
            <i className="route-lane" aria-hidden="true" />
            <i className="route-center" aria-hidden="true" />
            <ol>
              {PACKAGE_STEPS.map((step, i) => (
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
          </div>

          {/* قبل وبعد — بالصور الحقيقية فقط، وبلا صبغة فولاذية (duotone) عمداً: لون الرش هنا هو الدليل */}
          {pkg.gallery.length > 0 && (
            <section style={{ marginTop: 34 }} aria-labelledby="gallery-title">
              <h2 id="gallery-title" className="sec-title">
                قبل وبعد
              </h2>
              {pkg.gallery.map((shot) => (
                <figure key={shot.after} className="pkg-ba">
                  <div className="pkg-ba-pair">
                    {[
                      { src: shot.before, label: "قبل" },
                      { src: shot.after, label: "بعد" },
                    ].map((side) => (
                      <div key={side.label} className="pkg-ba-img">
                        <Image src={side.src} alt={`${side.label} — ${shot.caption}`} fill sizes="(max-width: 720px) 50vw, 340px" style={{ objectFit: "cover" }} />
                        <span className="tag tag-neutral">{side.label}</span>
                      </div>
                    ))}
                  </div>
                  <figcaption className="hint">{shot.caption}</figcaption>
                </figure>
              ))}
            </section>
          )}

          <section style={{ marginTop: 34 }} aria-labelledby="pkg-faq-title">
            <h2 id="pkg-faq-title" className="sec-title">
              أسئلة عن الباقة
            </h2>
            <FaqList items={packageFaq(pkg)} />
          </section>

          <Link href="/#packages" className="sec-link" style={{ marginTop: 22 }}>
            كل باقات الترهيم
            <Icon name="chevronLeft" size={15} />
          </Link>
        </div>
      </main>

      <ActionBar>
        <Link href={`/booking?package=${pkg.slug}`} className="btn btn-primary btn-lg blueprint">
          <Corners />
          <Icon name="calendarCheck" size={20} />
          احجز معاينة
        </Link>
        <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-lg">
          <Icon name="messageCircle" size={20} />
          اسأل على واتساب
        </a>
      </ActionBar>
    </>
  );
}
