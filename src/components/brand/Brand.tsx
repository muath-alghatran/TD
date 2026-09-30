import Image from "next/image";

/** درع TD — الشعار المرسوم فيه الطريق. أبعاده الأصلية 257×288. */
export function Shield({ size = 30, className, alt = "" }: { size?: number; className?: string; alt?: string }) {
  return (
    <Image
      src="/brand/td-shield.png"
      alt={alt}
      width={size}
      height={Math.round((size * 288) / 257)}
      className={className}
    />
  );
}

/**
 * كلمة «TRUST DRIVE». النسخة الفاتحة للحقول الفولاذية والداكنة للخلفية الفاتحة.
 * الأبعاد الأصلية: الداكنة 1005×134، والفاتحة 502×76.
 */
const WORDMARKS = {
  light: { src: "/brand/td-wordmark-light.png", w: 502, h: 76 },
  dark: { src: "/brand/td-wordmark.png", w: 1005, h: 134 },
} as const;

export function Wordmark({ tone, height = 13 }: { tone: "light" | "dark"; height?: number }) {
  const mark = WORDMARKS[tone];
  return <Image src={mark.src} alt="Trust Drive" width={Math.round((height * mark.w) / mark.h)} height={height} />;
}
