import { describe, expect, it } from "vitest";
import { createSearchGapTracker, type SearchGapReason } from "./part-search-gap";

/** مؤقت يدوي: نتحكم بمرور الوقت بدل الانتظار */
function setup() {
  const logs: [string, SearchGapReason][] = [];
  let pending: (() => void) | null = null;
  const tracker = createSearchGapTracker({
    onGap: (text, reason) => logs.push([text, reason]),
    setTimer: (fn) => {
      pending = fn;
      return 1;
    },
    clearTimer: () => {
      pending = null;
    },
  });
  const elapse = () => {
    const fn = pending;
    pending = null;
    fn?.();
  };
  return { tracker, logs, elapse };
}

describe("تسجيل البحث الفاشل (قاعدة 8)", () => {
  it("نص بلا تطابق يُسجَّل مرة واحدة بنصه النهائي — والكتابة المتتابعة لا تُسجّل أجزاءها", () => {
    const { tracker, logs, elapse } = setup();
    for (const partial of ["ل", "لم", "لمب", "لمبه"]) tracker.input(partial, true);
    elapse();
    tracker.leave();
    expect(logs).toEqual([["لمبه", "لا نتيجة قريبة"]]);
  });

  it("مواصلة الكتابة قبل مرور المهلة تلغي تسجيل الجزء", () => {
    const { tracker, logs, elapse } = setup();
    tracker.input("لمب", true);
    tracker.input("لمبة خلفية", true);
    elapse();
    expect(logs).toEqual([["لمبة خلفية", "لا نتيجة قريبة"]]);
  });

  it("اختيار نتيجة يلغي التسجيل حتى عند ترك الحقل", () => {
    const { tracker, logs, elapse } = setup();
    tracker.input("قماش", false);
    tracker.pick();
    tracker.leave();
    elapse();
    expect(logs).toEqual([]);
  });

  it("ترك الحقل بنتائج بلا اختيار يُسجَّل بسببه", () => {
    const { tracker, logs } = setup();
    tracker.input("قماش", false);
    tracker.leave();
    expect(logs).toEqual([["قماش", "ترك البحث بلا اختيار"]]);
  });

  it("«ما لقيت قطعتي» يُسجَّل، ولا يتكرر النص نفسه", () => {
    const { tracker, logs } = setup();
    tracker.input("قطعة نادرة", false);
    tracker.notFound();
    tracker.notFound();
    tracker.leave();
    expect(logs).toEqual([["قطعة نادرة", "ما لقيت قطعتي"]]);
  });

  it("الحقل الفارغ لا يُسجَّل", () => {
    const { tracker, logs, elapse } = setup();
    tracker.input("   ", false);
    elapse();
    tracker.leave();
    tracker.notFound();
    expect(logs).toEqual([]);
  });
});
