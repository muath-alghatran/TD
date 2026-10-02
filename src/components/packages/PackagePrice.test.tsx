import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { PACKAGES, type FaceliftPackage } from "@/lib/packages";
import { PackagePrice } from "./PackagePrice";

// وقت المتصفح — على الخادم useNow يرجع 0 فلا يظهر خصم أبداً
let now = new Date("2026-10-15T12:00:00Z").getTime();
vi.mock("@/lib/local-store", () => ({ useNow: () => now }));

const base = PACKAGES[0];
const discounted: FaceliftPackage = {
  ...base,
  regularPrice: 12500,
  discountPermitNo: "DP-2026-0001",
  discountEndsAt: "2026-10-31T21:00:00Z",
};

describe("PackagePrice", () => {
  it("بلا بيانات خصم: السعر و«سعر شامل ثابت» ولا سطر محجوز", () => {
    const html = renderToStaticMarkup(<PackagePrice pkg={base} />);
    expect(html).toContain("10,000");
    expect(html).toContain("سعر شامل ثابت");
    expect(html).not.toMatch(/<s[\s>]/);
    expect(html).not.toContain("pkg-price-was");
  });

  it("خصم ساري بترخيص: النسبة والسعر السابق مشطوباً ورقم الترخيص", () => {
    const html = renderToStaticMarkup(<PackagePrice pkg={discounted} size="page" />);
    expect(html).toContain("خصم");
    expect(html).toContain("20%");
    expect(html).toMatch(/<s[^>]*>.*12,500.*<\/s>/);
    expect(html).toContain("DP-2026-0001");
    expect(html).not.toContain("سعر شامل ثابت");
  });

  it("بعد انتهاء العرض: لا خصم، ولا سطر فارغ يبقى مكانه", () => {
    now = new Date("2026-11-02T12:00:00Z").getTime();
    const html = renderToStaticMarkup(<PackagePrice pkg={discounted} />);
    expect(html).not.toMatch(/<s[\s>]/);
    expect(html).toContain("سعر شامل ثابت");
    expect(html).not.toContain("pkg-price-was");
  });

  it("وقت غير معروف (الخادم): لا خصم، والسطر محجوز فارغاً حتى لا يزيح ظهوره شيئاً", () => {
    now = 0;
    const html = renderToStaticMarkup(<PackagePrice pkg={discounted} />);
    expect(html).not.toContain("خصم");
    expect(html).not.toMatch(/<s[\s>]/);
    expect(html).toContain('<div class="pkg-price-was"></div>');
  });
});
