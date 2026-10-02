/**
 * متى يُعدّ البحث عن قطعة فاشلاً (قاعدة 8، برومت أكتوبر ٢٠٢٦ المرحلة 5) — البحث بالأقرب
 * يجعل «صفر نتائج» نادراً، فالفشل معرّف صراحة:
 *   1. لا نتيجة فوق الحد الأدنى للتشابه.
 *   2. ضغط «ما لقيت قطعتي».
 *   3. ترك العميل الحقل بلا اختيار أي نتيجة.
 * يُسجَّل النص النهائي فقط — عند ترك الحقل أو بعد ثوانٍ من التوقف — لا كل حرف، ومرة واحدة
 * لكل نص. منطق نقي، والمؤقت يُحقن ليُختبر.
 */

export const GAP_IDLE_MS = 3000;

export type SearchGapReason = "لا نتيجة قريبة" | "ما لقيت قطعتي" | "ترك البحث بلا اختيار";

export interface SearchGapTrackerOptions {
  onGap: (text: string, reason: SearchGapReason) => void;
  idleMs?: number;
  setTimer?: (fn: () => void, ms: number) => unknown;
  clearTimer?: (handle: unknown) => void;
}

export interface SearchGapTracker {
  /** كل تغيّر في الحقل، ومعه هل فشل البحث بالنص الحالي */
  input(text: string, failed: boolean): void;
  /** اختار العميل نتيجة — البحث نجح */
  pick(): void;
  /** «ما لقيت قطعتي» */
  notFound(): void;
  /** ترك الحقل أو الصفحة */
  leave(): void;
}

export function createSearchGapTracker({
  onGap,
  idleMs = GAP_IDLE_MS,
  setTimer = (fn, ms) => setTimeout(fn, ms),
  clearTimer = (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>),
}: SearchGapTrackerOptions): SearchGapTracker {
  let text = "";
  let failed = false;
  let picked = false;
  let timer: unknown = null;
  const logged = new Set<string>();

  function stop() {
    if (timer !== null) clearTimer(timer);
    timer = null;
  }

  function commit(reason: SearchGapReason) {
    stop();
    if (!text || logged.has(text)) return;
    logged.add(text);
    onGap(text, reason);
  }

  return {
    input(next, nextFailed) {
      stop();
      text = next.trim();
      failed = nextFailed;
      picked = false;
      if (text && failed) timer = setTimer(() => commit("لا نتيجة قريبة"), idleMs);
    },
    pick() {
      stop();
      picked = true;
    },
    notFound() {
      commit("ما لقيت قطعتي");
    },
    leave() {
      if (picked) return stop();
      commit(failed ? "لا نتيجة قريبة" : "ترك البحث بلا اختيار");
    },
  };
}
