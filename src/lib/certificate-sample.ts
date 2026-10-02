/**
 * بيانات نموذج شهادة الإصلاح التوضيحي (بوابة المراجعة بعد المرحلة 6) — ثابتة، بلا قاعدة بيانات
 * ولا إصدار حقيقي. كل ما فيها موسوم بأنه مثال: رقم هيكل مموّه، وأرقام قطع XXXXX-XXXXX،
 * والضمان «حسب نوع العمل» لأن المركز لم يحدد سياسته بعد. الشهادة الحقيقية في المرحلة 9.
 */
import type { CertificateData } from "./certificate-schema";

/** النطاق العام للموقع — يُضبط بـ NEXT_PUBLIC_SITE_URL حين يُربط نطاق حقيقي */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://td-xi-six.vercel.app").replace(/\/$/, "");

export const SAMPLE_PDF_PATH = "/samples/td-certificate-sample.pdf";

export const SAMPLE_CERTIFICATE: CertificateData = {
  number: "TD-C-SAMPLE",
  issuedAt: "2026-10-01",
  sample: true,
  vehicle: {
    make: "هوندا",
    model: "أكورد",
    year: 2019,
    generationCode: "CV",
    vin: "1HGCV1F3•••••••••",
    vinIsExample: true,
  },
  works: [
    {
      date: "2026-09-14",
      kind: "parts",
      title: "قماش ومساعدات أمامية وفلتر زيت",
      parts: [
        { name: "قماش أمامي", number: "XXXXX-XXXXX", tier: "وكالة", origin: "اليابان", qty: 1 },
        { name: "مساعدات أمامية", number: "XXXXX-XXXXX", tier: "أصلي", origin: "اليابان", qty: 2 },
        { name: "فلتر زيت", number: "XXXXX-XXXXX", tier: "وكالة", origin: "اليابان", qty: 1 },
      ],
      stages: [],
    },
    {
      date: "2026-09-20",
      kind: "bodywork",
      title: "الصدام الأمامي",
      parts: [],
      stages: [
        { stage: "before", label: "قبل الإصلاح", photo: null },
        { stage: "stripped", label: "بعد تقشير البوية والمعجون", photo: null },
        { stage: "filler", label: "المعالجة بالمعجون والصنفرة", photo: null },
        { stage: "painted", label: "بعد الرش", photo: null },
      ],
    },
  ],
  warranty: {
    covers: "القطع والتركيب",
    term: "حسب نوع العمل",
    termIsExample: true,
    status: "ساري",
  },
  verifyUrl: `${SITE_URL}/verify/sample`,
};
