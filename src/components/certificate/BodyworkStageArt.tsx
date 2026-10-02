import type { BodyworkStage } from "@/lib/certificate-schema";

/**
 * رسم توضيحي خطي لصدام أمامي في مراحل السمكرة الأربع — حين لا صورة حقيقية من الورشة.
 * من صنعنا بأسلوب المخطط وبلون النص (currentColor)، ومكتوب عليه «صورة توضيحية» في الشهادة.
 * لا صور من الإنترنت ولا من ورش أخرى (بوابة المراجعة).
 */
const BUMPER = "M10 42Q12 24 40 20H160Q188 24 190 42V64Q188 82 168 84H32Q12 82 10 64Z";
const GRILLE = "M62 52H138Q142 52 142 56V68Q142 72 138 72H62Q58 72 58 68V56Q58 52 62 52Z";
/** موضع الضرر في الجهة اليمنى من الصدام */
const PATCH = "M128 30Q150 24 172 32Q180 44 170 54Q150 60 132 52Q124 42 128 30Z";

export function BodyworkStageArt({ stage, className }: { stage: BodyworkStage; className?: string }) {
  return (
    <svg
      viewBox="0 0 200 100"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={BUMPER} />
      <path d="M18 36H182" strokeOpacity={0.45} />
      <path d={GRILLE} strokeOpacity={0.7} />
      <path d="M70 58V66M85 58V66M100 58V66M115 58V66M130 58V66" strokeOpacity={0.45} />
      <circle cx={34} cy={64} r={6} strokeOpacity={0.7} />
      <circle cx={166} cy={64} r={6} strokeOpacity={0.7} />

      {stage === "before" && (
        <>
          {/* انبعاج وخدوش */}
          <path d="M136 38Q150 46 166 40" strokeWidth={1.8} />
          <path d="M140 46Q152 52 162 48" strokeWidth={1.4} />
          <path d="M124 28l14 5M127 33l12 4M150 30l9 3" strokeOpacity={0.8} />
        </>
      )}

      {stage === "stripped" && (
        <>
          {/* البوية والمعجون مقشورة حتى الأصل: حدود متقطعة وتظليل */}
          <path d={PATCH} strokeDasharray="3 3" />
          <path d="M134 34l8 -6M136 42l16 -12M140 49l20 -16M150 53l18 -15M162 52l10 -9" strokeOpacity={0.55} />
        </>
      )}

      {stage === "filler" && (
        <>
          {/* معجون مملوء وآثار صنفرة دائرية */}
          <path d={PATCH} fill="currentColor" fillOpacity={0.14} />
          <path d="M140 40a6 4 0 1 1 9 3M152 36a7 4 0 1 1 10 4M146 48a6 3 0 1 1 9 2" strokeOpacity={0.6} />
        </>
      )}

      {stage === "painted" && (
        <>
          {/* رش نظيف ولمعة */}
          <path d="M40 27Q100 23 160 27" strokeOpacity={0.5} />
          <path d="M146 34l12 3M150 40l8 2" strokeOpacity={0.4} />
        </>
      )}
    </svg>
  );
}
