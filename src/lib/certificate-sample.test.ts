import { describe, expect, it } from "vitest";
import { SAMPLE_CERTIFICATE, SAMPLE_PDF_PATH } from "./certificate-sample";
import { BUILT_FEATURES, visibleFaq } from "./faq";

/* بوابة المراجعة: نموذج توضيحي لا يُقرأ على أنه شهادة حقيقية لعميل */
describe("نموذج شهادة الإصلاح", () => {
  it("موسوم بأنه نموذج، ورقمه ليس رقم شهادة حقيقية", () => {
    expect(SAMPLE_CERTIFICATE.sample).toBe(true);
    expect(SAMPLE_CERTIFICATE.number).toBe("TD-C-SAMPLE");
  });

  it("رقم الهيكل مموّه وموسوم مثالاً — لا رقم هيكل كامل لسيارة حقيقية", () => {
    const { vin, vinIsExample } = SAMPLE_CERTIFICATE.vehicle;
    expect(vinIsExample).toBe(true);
    expect(vin).toContain("•");
    expect(vin.replace(/•/g, "").length).toBeLessThan(17);
  });

  it("أرقام القطع أمثلة XXXXX-XXXXX", () => {
    const numbers = SAMPLE_CERTIFICATE.works.flatMap((w) => w.parts.map((p) => p.number));
    expect(numbers.length).toBeGreaterThan(0);
    expect(numbers.every((n) => n === "XXXXX-XXXXX")).toBe(true);
  });

  it("السمكرة بمراحلها الأربع بالترتيب، وبلا صور حقيقية", () => {
    const bodywork = SAMPLE_CERTIFICATE.works.find((w) => w.kind === "bodywork");
    expect(bodywork?.stages.map((s) => s.stage)).toEqual(["before", "stripped", "filler", "painted"]);
    expect(bodywork?.stages.every((s) => s.photo === null)).toBe(true);
  });

  it("الضمان مثال لا وعد: «حسب نوع العمل»", () => {
    expect(SAMPLE_CERTIFICATE.warranty?.term).toBe("حسب نوع العمل");
    expect(SAMPLE_CERTIFICATE.warranty?.termIsExample).toBe(true);
  });

  it("الرمز يفتح صفحة التحقق التوضيحية، والـPDF في public/samples", () => {
    expect(SAMPLE_CERTIFICATE.verifyUrl.endsWith("/verify/sample")).toBe(true);
    expect(SAMPLE_PDF_PATH).toBe("/samples/td-certificate-sample.pdf");
  });

  it("سؤال الشهادة في الأسئلة الشائعة (١١) يبقى مخفياً حتى تُبنى الشهادة الحقيقية", () => {
    expect(BUILT_FEATURES.certificate).toBe(false);
    expect(visibleFaq().some((item) => item.requires === "certificate")).toBe(false);
  });
});
