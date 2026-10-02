import type { Metadata } from "next";
import { CertificateDocument } from "@/components/certificate/CertificateDocument";
import { ShareSampleButton } from "@/components/certificate/ShareSampleButton";
import { ActionBar } from "@/components/shell/ActionBar";
import { AppBar } from "@/components/shell/AppBar";
import { Corners } from "@/components/ui/Corners";
import { Icon } from "@/components/ui/Icon";
import { SAMPLE_CERTIFICATE, SAMPLE_PDF_PATH, SITE_URL } from "@/lib/certificate-sample";

export async function generateMetadata({ searchParams }: PageProps<"/certificate/sample">): Promise<Metadata> {
  const { print } = await searchParams;
  return {
    title: "نموذج شهادة الإصلاح الرقمية",
    description: "نموذج توضيحي لشهادة الإصلاح الرقمية من ترست درايف: كل قطعة ركّبناها برقمها، وصور مراحل العمل، والضمان — ويتحقق منها المشتري برمز QR.",
    // نسخة الطباعة لتوليد الـPDF فقط
    ...(print === "1" ? { robots: { index: false, follow: false } } : {}),
  };
}

/**
 * نموذج شهادة الإصلاح الرقمية (بوابة المراجعة بعد المرحلة 6) — بيانات ثابتة موسومة بأنها نموذج.
 * ‎?print=1‎ يعرض القالب وحده للطباعة: منه يولّد npm run certificate:sample ملف الـPDF.
 */
export default async function CertificateSamplePage({ searchParams }: PageProps<"/certificate/sample">) {
  const { print } = await searchParams;
  if (print === "1") {
    return (
      <main className="cert-print">
        <CertificateDocument data={SAMPLE_CERTIFICATE} />
      </main>
    );
  }

  return (
    <>
      <AppBar title="شهادة الإصلاح" backHref="/orders" titleAs="div" />
      <main className="screen has-actionbar">
        <div className="page cert-page">
          <p className="lead-note" style={{ marginTop: 20, marginBottom: 16 }}>
            هكذا ستبدو شهادة سيارتك: كل قطعة ركّبناها برقمها، وصور مراحل العمل، والضمان — ويتحقق منها من يشتري سيارتك برمز
            QR.
          </p>
          <CertificateDocument data={SAMPLE_CERTIFICATE} />
        </div>
      </main>
      <ActionBar>
        <a href={SAMPLE_PDF_PATH} download="td-certificate-sample.pdf" className="btn btn-primary btn-lg blueprint">
          <Corners />
          <Icon name="scrollText" size={20} />
          حمّل النموذج PDF
        </a>
        <ShareSampleButton pdfPath={SAMPLE_PDF_PATH} pageUrl={`${SITE_URL}/certificate/sample`} />
      </ActionBar>
    </>
  );
}
