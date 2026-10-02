import { permanentRedirect } from "next/navigation";

/**
 * كانت صفحات قطع كامري التجريبية بأرقامها وأسعارها ومخزونها (zone-catalog.ts). سُحبت من
 * مسار العميل في المرحلة 5 (برومت أكتوبر ٢٠٢٦، البند 0-6)، فالروابط القديمة المفهرسة
 * تتحول إلى صفحة القطع لكل الماركات بدل أن تنكسر.
 */
export default function LegacyPartPage(): never {
  permanentRedirect("/parts");
}
