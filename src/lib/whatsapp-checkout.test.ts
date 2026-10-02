import { describe, expect, it } from "vitest";
import { buildPartsOrderMessage, buildWhatsAppLink, buildWhatsAppShareLink, type PartsOrderMessageInput } from "./whatsapp-checkout";

const base: PartsOrderMessageInput = {
  orderCode: "TD-30742",
  vehicleLabel: "تويوتا كامري ٢٠١٧",
  vin: "",
  partName: "قماش أمامي",
  details: "",
  oemNumber: null,
  tier: "كوري",
  fromStock: false,
  immediatePay: false,
  cityName: "الرياض",
  mode: "ship",
  daysMin: 5,
  daysMax: 6,
  total: 64.5,
  indicative: true,
  laborPending: false,
  notes: "",
};

describe("رسالة طلب القطعة", () => {
  it("تحمل رقم الطلب وسطر الجيل حين يُعرف — يحتاجه المركز لتأكيد التوافق (قاعدة 7)", () => {
    const msg = buildPartsOrderMessage({ ...base, generationCode: "XV70" });
    expect(msg).toContain("رقم الطلب: TD-30742");
    expect(msg).toContain("الجيل: XV70");
  });

  it("حين لم يحدده العميل يُنبَّه المركز ليحدده من رقم الهيكل", () => {
    expect(buildPartsOrderMessage({ ...base, generationCode: "" })).toContain("الجيل: يُحدَّد عند التأكيد من رقم الهيكل");
  });

  it("بلا سطر جيل حين لا يمرره المتصل", () => {
    expect(buildPartsOrderMessage(base)).not.toContain("الجيل:");
  });

  it("التوريد: المدى من الدفع، والسعر استرشادي، والدفع بعد التأكيد", () => {
    const msg = buildPartsOrderMessage(base);
    expect(msg).toContain("الوعد: خلال ٥–٦ أيام من الدفع");
    expect(msg).toContain("الإجمالي التقديري: 64.50 ريال — سعر استرشادي يُثبَّت عند التأكيد");
    expect(msg).toContain("أرجو تأكيد التوفر والسعر، ثم إرسال رابط الدفع.");
  });

  it("المخزون: رقم القطعة والسعر النهائي ودفع فوري (قاعدة 11)", () => {
    const msg = buildPartsOrderMessage({
      ...base,
      oemNumber: "45022-TVA-A01",
      tier: "وكالة",
      fromStock: true,
      immediatePay: true,
      mode: "fit",
      daysMin: 1,
      daysMax: 1,
      total: 402,
      indicative: false,
      details: "يمين",
    });
    expect(msg).toContain("القطعة: قماش أمامي — يمين (45022-TVA-A01)");
    expect(msg).toContain("الجودة: وكالة — من مخزون المركز");
    expect(msg).toContain("الاستلام: تركيب في المركز");
    expect(msg).toContain("الوعد: خلال يوم واحد من الدفع");
    expect(msg).toContain("الإجمالي: 402.00 ريال");
    expect(msg).toContain("أرسلوا لي رابط الدفع");
  });

  it("مخزون مشحون لأبعد المدن (كهرماني): من المخزون، والدفع بعد تأكيد الشحن", () => {
    const msg = buildPartsOrderMessage({ ...base, tier: "وكالة", fromStock: true, immediatePay: false, cityName: "أبها" });
    expect(msg).toContain("الجودة: وكالة — من مخزون المركز");
    expect(msg).toContain("أرجو تأكيد الشحن إلى مدينتي، ثم إرسال رابط الدفع.");
    expect(msg).not.toContain("أرسلوا لي رابط الدفع");
  });

  it("بلا سعر ولا جودة: «عند التأكيد»، والملاحظات تصل كما كتبها العميل", () => {
    const msg = buildPartsOrderMessage({ ...base, tier: null, total: null, notes: "الصوت من اليمين" });
    expect(msg).toContain("السعر: عند التأكيد");
    expect(msg).toContain("الجودة: أرجو عرض الخيارات");
    expect(msg).toContain("ملاحظات: الصوت من اليمين");
  });
});

describe("روابط واتساب", () => {
  it("الطلب يذهب إلى رقم المركز، والمشاركة بلا رقم فيختار العميل لمن يرسل", () => {
    expect(buildWhatsAppLink("مرحبا").startsWith("https://wa.me/966")).toBe(true);
    const share = buildWhatsAppShareLink("نموذج الشهادة");
    expect(share.startsWith("https://wa.me/?text=")).toBe(true);
    expect(decodeURIComponent(share.split("text=")[1])).toBe("نموذج الشهادة");
  });
});
