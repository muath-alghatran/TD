import type { FaceliftPackage } from "@/lib/packages";

/**
 * رسم جانبي عام للهيكل بخط المخططات — جيب أو سيدان، لا نسخة من تصميم موديل بعينه
 * ولا شعارات. يرسم بلون النص الحالي (currentColor) فيتبع الرموز في الوضعين.
 * المقدمة يساراً: السيارة تسير في اتجاه الطريق العربي (من اليمين إلى اليسار).
 * الجيب: سقف أعلى وقضبان سقف وثلاث نوافذ وخلفية قائمة؛ السيدان: سقف منخفض وصندوق.
 */
export function BodyDrawing({ body, className }: { body: FaceliftPackage["body"]; className?: string }) {
  return (
    <svg
      viewBox="0 0 160 72"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M2 63h156" strokeOpacity={0.35} />
      {body === "suv" ? (
        <>
          {/* الهيكل بأقواس العجلات */}
          <path d="M8 53V40q0-4 4-5l26-2 12-16q2-2 5-2h82q3 0 4 3l4 15q5 1 5 6v14h-17a13 13 0 0 0-26 0h-54a13 13 0 0 0-26 0z" />
          {/* قضبان السقف */}
          <path d="M60 15v-3h70v3" strokeOpacity={0.6} />
          {/* النوافذ الثلاث */}
          <path d="M42 31l9-12h35v12z" fill="currentColor" fillOpacity={0.12} />
          <path d="M90 19h26v12H90z" fill="currentColor" fillOpacity={0.12} />
          <path d="M120 19h13l3 12h-16z" fill="currentColor" fillOpacity={0.12} />
          <path d="M88 17v36M12 42h8M143 40h6" strokeOpacity={0.6} />
          <circle cx={40} cy={53} r={10} />
          <circle cx={40} cy={53} r={4} />
          <circle cx={120} cy={53} r={10} />
          <circle cx={120} cy={53} r={4} />
        </>
      ) : (
        <>
          <path d="M6 53v-8q0-5 5-6l24-3 16-12q3-2 7-2h40q4 0 7 2l16 11 17 1q5 1 5 6v11h-12a13 13 0 0 0-26 0h-54a13 13 0 0 0-26 0z" />
          <path d="M42 34l12-9h22v9z" fill="currentColor" fillOpacity={0.12} />
          <path d="M80 25h20q2 0 4 1l10 8H80z" fill="currentColor" fillOpacity={0.12} />
          <path d="M78 24v29M10 45h8M137 43h6" strokeOpacity={0.6} />
          <circle cx={38} cy={53} r={10} />
          <circle cx={38} cy={53} r={4} />
          <circle cx={118} cy={53} r={10} />
          <circle cx={118} cy={53} r={4} />
        </>
      )}
    </svg>
  );
}
