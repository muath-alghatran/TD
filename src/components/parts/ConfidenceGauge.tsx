"use client";

import { useEffect, useRef, useState } from "react";
import { toArabicDigits } from "@/lib/format";
import type { PromiseStatus } from "@/lib/promise-engine";

/** طول قوس العدّاد (٢٧٠° من دائرة نصف قطرها ٤٦) — كما في PromiseVerdict قبل المرحلة 5 */
const ARC = 216.8;
const FULL = 289;

const TICKS = Array.from({ length: 11 }, (_, i) => {
  const angle = ((135 + (i * (ARC / FULL) * 360) / 10) * Math.PI) / 180;
  return {
    x1: (60 + Math.cos(angle) * 53).toFixed(1),
    y1: (60 + Math.sin(angle) * 53).toFixed(1),
    x2: (60 + Math.cos(angle) * 57).toFixed(1),
    y2: (60 + Math.sin(angle) * 57).toFixed(1),
  };
});

function reducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * عدّاد الثقة الدائري — مثل عدّاد السيارة: القوس يمتلئ والنسبة تعدّ حتى قيمتها، ويتحرك من قيمته
 * السابقة حين تتغير المدينة أو طريقة الاستلام. لونه لحالة التوفر وحدها (قاعدة 1) من رموز الحقل
 * المضاءة، ومع prefers-reduced-motion يظهر بقيمته النهائية فوراً بلا عدّ (قاعدة 6).
 */
export function ConfidenceGauge({ confidence, status }: { confidence: number; status: PromiseStatus }) {
  const target = Math.round(confidence * 100);
  // الخطوة لا تُرسم على الخادم (تظهر بعد ضغطة)، فقراءة تفضيل الحركة في البداية آمنة
  const [percent, setPercent] = useState(() => (reducedMotion() ? target : 0));
  const [fill, setFill] = useState(() => (reducedMotion() ? confidence : 0));
  const shownRef = useRef(percent);

  useEffect(() => {
    const reduce = reducedMotion();
    let counter: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(
      () => {
        setFill(confidence);
        if (reduce) {
          shownRef.current = target;
          setPercent(target);
          return;
        }
        counter = setInterval(() => {
          const current = shownRef.current;
          const step = Math.max(1, Math.ceil(Math.abs(target - current) / 6));
          const next = current < target ? Math.min(target, current + step) : Math.max(target, current - step);
          shownRef.current = next;
          setPercent(next);
          if (next === target) clearInterval(counter);
        }, 28);
      },
      reduce ? 0 : 90,
    );
    return () => {
      clearTimeout(start);
      if (counter) clearInterval(counter);
    };
  }, [confidence, target]);

  return (
    <div className="gauge">
      <span className="sr-only">نسبة الثقة في الوعد {toArabicDigits(target)}٪</span>
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <g>
          {TICKS.map((t, i) => (
            <line key={i} className="g-tick" x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} />
          ))}
        </g>
        <circle className="g-track" cx={60} cy={60} r={46} strokeDasharray={`${ARC} ${FULL}`} transform="rotate(135 60 60)" />
        <circle
          className={`g-fill ${status}`}
          cx={60}
          cy={60}
          r={46}
          strokeDasharray={`${ARC} ${FULL}`}
          strokeDashoffset={ARC * (1 - fill)}
          transform="rotate(135 60 60)"
        />
        <text className={`g-val ${status}`} x={60} y={57}>
          {percent}%
        </text>
        <text className="g-cap" x={60} y={78}>
          CONFIDENCE
        </text>
      </svg>
    </div>
  );
}
