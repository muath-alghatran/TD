import { describe, expect, it } from "vitest";
import { CENTER } from "./center-info";
import { FAQ, visibleFaq } from "./faq";

describe("أسئلة ممكن تخطر في بالك", () => {
  it("سؤالا الترهيم والشهادة مخفيان حتى تُبنى ميزتاهما", () => {
    const shown = visibleFaq({ packages: false, certificate: false }).map((f) => f.id);
    expect(shown).toHaveLength(9);
    expect(shown).not.toContain("facelift");
    expect(shown).not.toContain("resale");
  });

  it("كل سؤال يظهر حين تُبنى ميزته وحدها", () => {
    expect(visibleFaq({ packages: true, certificate: false }).map((f) => f.id)).toContain("facelift");
    expect(visibleFaq({ packages: true, certificate: false }).map((f) => f.id)).not.toContain("resale");
    expect(visibleFaq({ packages: true, certificate: true })).toHaveLength(11);
  });

  it("الافتراضي اليوم: لا باقات ولا شهادة بعد", () => {
    expect(visibleFaq()).toHaveLength(9);
  });

  it("إجابة السطحة من مصدرها الواحد", () => {
    expect(FAQ.find((f) => f.id === "tow")?.a).toBe(CENTER.towPromise);
  });

  it("المعرّفات فريدة", () => {
    expect(new Set(FAQ.map((f) => f.id)).size).toBe(FAQ.length);
  });
});
