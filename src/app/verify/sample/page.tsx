import type { Metadata } from "next";
import { VerifyView } from "@/components/certificate/VerifyView";
import { AppBar } from "@/components/shell/AppBar";
import { SAMPLE_CERTIFICATE } from "@/lib/certificate-sample";

export const metadata: Metadata = {
  title: "التحقق من شهادة الإصلاح — نموذج",
  robots: { index: false, follow: false },
};

/** صفحة التحقق التوضيحية — ما يفتحه رمز QR في نموذج الشهادة. الحقيقية ‎/verify/[token]‎ في المرحلة 9 */
export default function VerifySamplePage() {
  return (
    <>
      <AppBar title="التحقق من الشهادة" titleAs="div" />
      <main className="screen">
        <div className="page verify-page">
          <VerifyView data={SAMPLE_CERTIFICATE} status="valid" />
        </div>
      </main>
    </>
  );
}
