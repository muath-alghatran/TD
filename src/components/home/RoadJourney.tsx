"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { RoadTrack, type RoadStop } from "@/components/orders/RoadTrack";
import { Corners } from "@/components/ui/Corners";
import { Icon } from "@/components/ui/Icon";
import { JOURNEY_STOPS } from "@/lib/center-info";
import { markJourneyPlayed } from "@/lib/motion";
import { useRunWhenVisible } from "@/lib/use-run-when-visible";

const LAST = JOURNEY_STOPS.length - 1;
const STOPS: RoadStop[] = JOURNEY_STOPS.map((stop, i) => ({
  key: stop.key,
  short: stop.short,
  state: i === LAST ? "current" : "done",
}));

/**
 * «من طلبك إلى التسليم» — أول ما يراه الزائر بلا طلب نشط: الدرع يسير على طريق الشعار
 * محطة بعد محطة، فيفهم طريقة العمل كلها قبل أن يقرأ.
 *
 * الخادم يرسم الحالة النهائية والوعود الستة قائمة. الحركة CSS فقط، تبدأ مرة في الجلسة
 * حين يظهر الطريق (src/lib/motion.ts). القائمة المرتبة هي ما يقرؤه قارئ الشاشة،
 * والطبقة المتحركة مخفية عنه.
 */
export function RoadJourney({ hidden = false }: { hidden?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  // 0 = لم تبدأ؛ وكل إعادة تزيده فيُعاد تركيب الطبقة المتحركة وتبدأ حركتها من أولها
  const [run, setRun] = useState(0);

  useRunWhenVisible(ref, "journey", () => setRun(1), !hidden);

  const running = run > 0;

  // بعد أن يُرسم .is-running لا قبله — وإلا ظهر إطار بالحالة النهائية بين التغييرين
  useEffect(() => {
    if (running) markJourneyPlayed();
  }, [running]);

  return (
    <section
      ref={ref}
      className={`steel journey${running ? " is-running" : ""}`}
      aria-labelledby="journey-title"
    >
      <div className="page journey-in">
        <div className="journey-hd">
          <h2 id="journey-title" className="journey-title">
            من طلبك إلى التسليم — طريق واحد واضح
          </h2>
          <button
            type="button"
            className="icon-btn journey-replay"
            aria-label="أعد الرحلة"
            onClick={() => setRun((n) => n + 1)}
          >
            <Icon name="rotateCcw" size={18} />
          </button>
        </div>

        <div key={run} className="journey-anim">
          <div aria-hidden="true">
            <RoadTrack stages={STOPS} currentIndex={LAST} delivered={false} motion="journey" running={running} />
            <p className="journey-say">
              {JOURNEY_STOPS.map((stop, i) => (
                <span key={stop.key} style={{ "--i": i } as CSSProperties}>
                  {stop.promise}
                </span>
              ))}
            </p>
          </div>

          <ol className="journey-list">
            {JOURNEY_STOPS.map((stop) => (
              <li key={stop.key}>
                <b>
                  {stop.short}
                  <span className="sr-only">: </span>
                </b>
                <span>{stop.promise}</span>
              </li>
            ))}
          </ol>

          <div className="journey-cta">
            <Link href="/parts" className="btn btn-primary blueprint">
              <Corners />
              ابدأ طلبك
            </Link>
            <Link href="/about#how" className="btn btn-secondary">
              كيف نعمل
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
