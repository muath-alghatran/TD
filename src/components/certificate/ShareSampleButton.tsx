"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@/components/ui/Icon";
import { buildWhatsAppShareLink } from "@/lib/whatsapp-checkout";

/**
 * «أرسل النموذج»: Web Share API بالملف حيث يدعمه الجوال، أو بالرابط، وإلا رابط الصفحة عبر
 * واتساب بلا رقم — يختار العميل لمن يرسله (wa.me لا يرفق ملفات). نفس السلوك الذي ستتبعه الشهادة
 * الحقيقية في المرحلة 9.
 */
export function ShareSampleButton({ pdfPath, pageUrl }: { pdfPath: string; pageUrl: string }) {
  const title = "نموذج شهادة الإصلاح الرقمية — ترست درايف";
  const text = "هكذا تبدو شهادة الإصلاح الرقمية من ترست درايف (نموذج توضيحي)";
  // الملف يُجلب مسبقاً: سفاري iOS يُسقط إذن المشاركة إن انتظرت الضغطة تحميله
  const fileRef = useRef<File | null>(null);

  useEffect(() => {
    if (typeof navigator.share !== "function") return;
    let alive = true;
    fetch(pdfPath)
      .then((response) => response.blob())
      .then((blob) => {
        if (alive) fileRef.current = new File([blob], "td-certificate-sample.pdf", { type: "application/pdf" });
      })
      .catch(() => {
        // بلا ملف تُشارَك الصفحة برابطها
      });
    return () => {
      alive = false;
    };
  }, [pdfPath]);

  function openWhatsApp() {
    window.open(buildWhatsAppShareLink(`${text}:\n${pageUrl}`), "_blank", "noopener,noreferrer");
  }

  async function share() {
    if (typeof navigator.share !== "function") {
      openWhatsApp();
      return;
    }
    const file = fileRef.current;
    try {
      if (file && navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title, text });
      else await navigator.share({ title, text, url: pageUrl });
    } catch (error) {
      // ألغى العميل المشاركة — لا شيء نفعله؛ وأي تعذّر آخر يرجع إلى واتساب
      if (!(error instanceof DOMException && error.name === "AbortError")) openWhatsApp();
    }
  }

  return (
    <button type="button" className="btn btn-secondary btn-lg" onClick={share}>
      <Icon name="messageCircle" size={20} />
      أرسل النموذج
    </button>
  );
}
