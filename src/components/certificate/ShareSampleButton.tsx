"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { buildWhatsAppLink } from "@/lib/whatsapp-checkout";

/**
 * «أرسل النموذج»: Web Share API بالملف حيث يدعمه الجوال، أو بالرابط، وإلا رابط الصفحة عبر
 * واتساب (wa.me لا يرفق ملفات). نفس السلوك الذي ستتبعه الشهادة الحقيقية في المرحلة 9.
 */
export function ShareSampleButton({ pdfPath, pageUrl }: { pdfPath: string; pageUrl: string }) {
  const [busy, setBusy] = useState(false);
  const title = "نموذج شهادة الإصلاح الرقمية — ترست درايف";
  const text = "هكذا تبدو شهادة الإصلاح الرقمية من ترست درايف (نموذج توضيحي)";

  async function share() {
    if (busy) return;
    setBusy(true);
    try {
      if (typeof navigator.share === "function") {
        try {
          const blob = await (await fetch(pdfPath)).blob();
          const file = new File([blob], "td-certificate-sample.pdf", { type: "application/pdf" });
          if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({ files: [file], title, text });
            return;
          }
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") return;
        }
        await navigator.share({ title, text, url: pageUrl });
        return;
      }
      window.open(buildWhatsAppLink(`${text}:\n${pageUrl}`), "_blank", "noopener,noreferrer");
    } catch (error) {
      // ألغى العميل المشاركة — لا شيء نفعله؛ وأي تعذّر آخر يرجع إلى واتساب
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        window.open(buildWhatsAppLink(`${text}:\n${pageUrl}`), "_blank", "noopener,noreferrer");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" className="btn btn-secondary btn-lg" onClick={share} disabled={busy}>
      <Icon name="messageCircle" size={20} />
      أرسل النموذج
    </button>
  );
}
