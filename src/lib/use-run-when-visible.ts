import { useEffect, useRef, type RefObject } from "react";
import { motionAllowed, type MotionGate } from "./motion";

/**
 * يستدعي onStart مرة واحدة حين يدخل العنصر مجال الرؤية — إن سمحت البوابة بالحركة
 * عند التركيب وعند الظهور معاً (طبقة أخرى قد تكون عرضت الرحلة في الأثناء).
 */
export function useRunWhenVisible(
  ref: RefObject<Element | null>,
  gate: MotionGate,
  onStart: () => void,
  enabled = true,
): void {
  const onStartRef = useRef(onStart);
  useEffect(() => {
    onStartRef.current = onStart;
  });

  useEffect(() => {
    const element = ref.current;
    if (!enabled || !element || !motionAllowed(gate)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        if (motionAllowed(gate)) onStartRef.current();
      },
      // يبدأ حين يتجاوز أعلى العنصر خُمس الشاشة السفلي — لا نسبة من ارتفاعه، فالعنصر
      // الأطول من الشاشة (خط تتبع طويل على جوال أفقي) يبدأ كذلك ولا يبقى في حالة البداية
      { threshold: 0, rootMargin: "0px 0px -20% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, gate, enabled]);
}
