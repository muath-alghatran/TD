import { describe, expect, it } from "vitest";
import { buildPartsOrderMessage, type PartsOrderMessageInput } from "./whatsapp-checkout";

const base: PartsOrderMessageInput = {
  vehicleLabel: "تويوتا كامري ٢٠١٧",
  vin: "",
  partName: "فلتر زيت",
  partOem: "90915-YZZD4",
  cityName: "حائل",
  mode: "fit",
  days: 2,
  confidence: 0.9,
  total: 120,
};

describe("رسالة طلب القطعة", () => {
  it("تحمل سطر الجيل حين يُعرف — يحتاجه المركز لتأكيد التوافق (قاعدة 7)", () => {
    const msg = buildPartsOrderMessage({ ...base, generationCode: "XV70" });
    expect(msg).toContain("الجيل: XV70");
  });

  it("بلا سطر جيل حين لا يُعرف", () => {
    expect(buildPartsOrderMessage({ ...base, generationCode: "" })).not.toContain("الجيل:");
    expect(buildPartsOrderMessage(base)).not.toContain("الجيل:");
  });
});
