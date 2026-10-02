import { afterEach, describe, expect, it } from "vitest";
import { JOURNEY_SESSION_KEY, MOTION_INIT_SCRIPT } from "./motion";

/** يشغّل السكربت كما يشغّله المتصفح قبل أول رسم، على كائنات وهمية */
function runInitScript({
  reduceMotion = false,
  played = false,
  storageThrows = false,
}: { reduceMotion?: boolean; played?: boolean; storageThrows?: boolean }) {
  const attributes: Record<string, string> = {};
  const g = globalThis as Record<string, unknown>;
  g.window = {
    matchMedia: () => ({ matches: reduceMotion }),
    sessionStorage: {
      getItem: (key: string) => {
        if (storageThrows) throw new Error("storage blocked");
        return played && key === JOURNEY_SESSION_KEY ? "1" : null;
      },
    },
  };
  g.document = { documentElement: { setAttribute: (name: string, value: string) => (attributes[name] = value) } };
  new Function(MOTION_INIT_SCRIPT)();
  return attributes;
}

afterEach(() => {
  const g = globalThis as Record<string, unknown>;
  delete g.window;
  delete g.document;
});

describe("MOTION_INIT_SCRIPT", () => {
  it("أول زيارة في الجلسة: الحركة مسموحة والرحلة تُعرض", () => {
    expect(runInitScript({})).toEqual({ "data-motion": "ok", "data-journey": "play" });
  });

  it("الرحلة عُرضت في الجلسة: الحركة مسموحة بلا رحلة", () => {
    expect(runInitScript({ played: true })).toEqual({ "data-motion": "ok" });
  });

  it("تقليل الحركة: لا سمات — الحالة النهائية الثابتة", () => {
    expect(runInitScript({ reduceMotion: true })).toEqual({});
  });

  it("تخزين الجلسة محجوب: لا انهيار، والرحلة تُعرض", () => {
    expect(runInitScript({ storageThrows: true })).toEqual({ "data-motion": "ok", "data-journey": "play" });
  });
});
