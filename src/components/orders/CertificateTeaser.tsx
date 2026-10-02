import Link from "next/link";
import { Corners } from "@/components/ui/Corners";
import { Icon } from "@/components/ui/Icon";

/**
 * بطاقة «قريباً» في «طلباتي» لكل زائر (بوابة المراجعة) — تفتح نموذج الشهادة التوضيحي.
 * في المرحلة 9 تصير قسم «شهادات الإصلاح» الحقيقية.
 */
export function CertificateTeaser() {
  return (
    <section className="blueprint cert-teaser" aria-labelledby="cert-teaser-title">
      <Corners />
      <div className="cert-teaser-hd">
        <Icon name="scrollText" size={22} className="cert-teaser-ic" />
        <span className="tag tag-dashed">قريباً</span>
      </div>
      <h2 id="cert-teaser-title" className="cert-teaser-title">
        شهادة إصلاح رقمية لسيارتك
      </h2>
      <p className="cert-teaser-say">
        فيها كل قطعة ركّبناها برقمها، وصور مراحل العمل، والضمان. يتحقق منها من يشتري سيارتك برمز QR.
      </p>
      <Link href="/certificate/sample" className="btn btn-secondary">
        شاهد نموذج الشهادة
        <Icon name="chevronLeft" size={16} />
      </Link>
    </section>
  );
}
