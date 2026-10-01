/**
 * حركة بلا وميض: سكربت صغير يعمل قبل أول رسم (يُحقن في <head> من layout.tsx مثل
 * THEME_INIT_SCRIPT) فيضع على <html> سمتين يرسم منهما CSS حالة البداية مباشرة:
 *   data-motion="ok"     — الحركة مسموحة (JavaScript يعمل، ولا تقليل حركة)
 *   data-journey="play"  — رحلة الطريق في الرئيسية لم تُعرض في هذه الجلسة
 * بلا السمتين — بلا JavaScript، أو مع تقليل الحركة، أو بعد عرض الرحلة — يبقى الشكل
 * الحالة النهائية الثابتة التي يرسمها الخادم.
 */
export const JOURNEY_SESSION_KEY = "td-journey-played";

export const MOTION_INIT_SCRIPT = `(function(){try{if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;var d=document.documentElement;d.setAttribute("data-motion","ok");var p=null;try{p=window.sessionStorage.getItem("${JOURNEY_SESSION_KEY}")}catch(e){}if(!p)d.setAttribute("data-journey","play")}catch(e){}})();`;

/** journey: الرحلة لم تُعرض في هذه الجلسة · motion: الحركة مسموحة فقط */
export type MotionGate = "journey" | "motion";

export function motionAllowed(gate: MotionGate): boolean {
  const root = document.documentElement;
  return gate === "journey" ? root.getAttribute("data-journey") === "play" : root.getAttribute("data-motion") === "ok";
}

/** تُعرض الرحلة مرة واحدة في الجلسة: أي تركيب لاحق للطريق يأتي في حالته النهائية */
export function markJourneyPlayed(): void {
  document.documentElement.setAttribute("data-journey", "played");
  try {
    window.sessionStorage.setItem(JOURNEY_SESSION_KEY, "1");
  } catch {
    // التخزين غير متاح — تُعاد الرحلة عند إعادة التحميل فقط
  }
}
