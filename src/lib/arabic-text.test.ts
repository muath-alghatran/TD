import { describe, expect, it } from "vitest";
import { normalizeArabic } from "./arabic-text";

describe("normalizeArabic", () => {
  it("يوحّد أشكال الألف", () => {
    expect(normalizeArabic("أكورد")).toBe(normalizeArabic("اكورد"));
    expect(normalizeArabic("إلنترا")).toBe(normalizeArabic("النترا"));
  });

  it("يوحّد التاء المربوطة والألف المقصورة والهمزات", () => {
    expect(normalizeArabic("سيارة")).toBe("سياره");
    expect(normalizeArabic("مصطفى")).toBe("مصطفي");
    expect(normalizeArabic("ئ ؤ")).toBe("ي و");
  });

  it("يحذف التشكيل والتطويل", () => {
    expect(normalizeArabic("كَامْرِي")).toBe("كامري");
    expect(normalizeArabic("كـــامري")).toBe("كامري");
  });

  it("يحوّل الأرقام العربية الهندية ويصغّر اللاتيني ويضغط المسافات", () => {
    expect(normalizeArabic("٢٠٢٢")).toBe("2022");
    expect(normalizeArabic("  CR-V   Hybrid ")).toBe("cr-v hybrid");
  });
});
