import Link from "next/link";
import { BodyDrawing } from "@/components/packages/BodyDrawing";
import { PackagePrice } from "@/components/packages/PackagePrice";
import { Corners } from "@/components/ui/Corners";
import { Icon } from "@/components/ui/Icon";
import { formatYearRange } from "@/lib/format";
import { PACKAGES, PACKAGE_INCLUDES_LINE } from "@/lib/packages";

/** باقات الترهيم في الرئيسية: أربع بطاقات، كل بطاقة رابط واحد إلى صفحة الباقة */
export function FaceliftPackages() {
  return (
    <section id="packages" className="page pkg-sec" aria-labelledby="packages-title">
      <div className="sec-hd">
        <h2 id="packages-title" className="sec-title">
          باقات الترهيم
        </h2>
        <span className="t-code">PACKAGES</span>
      </div>
      <ul className="pkg-grid">
        {PACKAGES.map((pkg) => (
          <li key={pkg.slug}>
            <Link href={`/packages/${pkg.slug}`} className="blueprint pkg-card">
              <Corners />
              <BodyDrawing body={pkg.body} className="pkg-art" />
              <span className="pkg-name">{pkg.title}</span>
              <span className="pkg-years">{formatYearRange(pkg.yearFrom, pkg.yearTo)}</span>
              <PackagePrice pkg={pkg} />
              <span className="pkg-incl">{PACKAGE_INCLUDES_LINE}</span>
              <span className="pkg-go" aria-hidden="true">
                <Icon name="chevronLeft" size={18} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
