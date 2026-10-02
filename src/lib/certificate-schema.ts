/**
 * شكل بيانات شهادة الإصلاح الرقمية — مدخل القالب الوحيد CertificateDocument.
 * النموذج التوضيحي (بوابة المراجعة) يمرر بيانات ثابتة من certificate-sample.ts،
 * والمرحلة 9 ستمرر بيانات حقيقية من القاعدة للقالب نفسه.
 */

export type CertificateWorkKind = "parts" | "bodywork" | "facelift";

export const WORK_KIND_LABEL: Record<CertificateWorkKind, string> = {
  parts: "قطع وتركيب",
  bodywork: "سمكرة ودهان",
  facelift: "ترهيم",
};

export interface CertificatePart {
  name: string;
  /** رقم القطعة — بيانات نظام بأرقام لاتينية (قاعدة 3) */
  number: string;
  tier: string;
  origin: string | null;
  qty: number;
}

/** مراحل السمكرة الأربع بالترتيب */
export type BodyworkStage = "before" | "stripped" | "filler" | "painted";

export interface CertificateStage {
  stage: BodyworkStage;
  label: string;
  /** صورة حقيقية من الورشة (اللوحة مطموسة) — أو رسم توضيحي حين لا صورة */
  photo: { src: string; alt: string } | null;
}

export interface CertificateWork {
  /** ISO */
  date: string;
  kind: CertificateWorkKind;
  title: string;
  parts: CertificatePart[];
  stages: CertificateStage[];
}

export interface CertificateData {
  number: string;
  /** ISO */
  issuedAt: string;
  /** نموذج توضيحي: لافتة وعلامة مائية، ولا شيء يوحي بشهادة حقيقية */
  sample: boolean;
  vehicle: {
    make: string;
    model: string;
    year: number;
    generationCode: string;
    /** كاملاً في الشهادة الحقيقية — ومموّهاً في النموذج */
    vin: string;
    vinIsExample: boolean;
  };
  works: CertificateWork[];
  /** null حين لم يحدد المركز الضمان — يُخفى القسم ولا تُخترع مدة (المرحلة 9) */
  warranty: {
    covers: string;
    term: string;
    termIsExample: boolean;
    status: string;
  } | null;
  /** رابط صفحة التحقق في رمز QR */
  verifyUrl: string;
}
