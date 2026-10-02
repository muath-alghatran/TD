import Image from "next/image";
import type { CSSProperties } from "react";
import { toArabicDigits } from "@/lib/format";
import type { OrderStage, StageState } from "@/lib/order-progress";

/** محطة على الطريق — OrderStage يطابقها، ومحطات الرحلة في الرئيسية كذلك */
export interface RoadStop {
  key: string;
  short: string;
  /** الاسم الكامل لقارئ الشاشة، مثل «تجهيز القطعة» */
  label?: string;
  state: StageState;
}

/**
 * journey: رحلة الزائر في الرئيسية — الدرع يقف عند كل محطة حتى التسليم.
 * progress: الطلب النشط — المنجزات تمتلئ متتالية والدرع ينبض مرة عند مرحلته.
 */
export type RoadMotion = "journey" | "progress";

/**
 * الطريق (1b): الطريق المرسوم في الشعار صار شريط التتبع. المقطوع مصمت،
 * والقادم متقطع، والدرع يقف عند المرحلة الحالية. يسير من اليمين في العربية.
 * يُرسم دائماً في حالته النهائية، والحركة (إن وُجدت) CSS فقط فوق هذه الحالة.
 */
export function RoadTrack({
  stages,
  currentIndex,
  delivered,
  motion,
  running = false,
}: {
  stages: RoadStop[];
  currentIndex: number;
  delivered: boolean;
  motion?: RoadMotion;
  running?: boolean;
}) {
  const count = stages.length;
  const at = (i: number) => ((i + 0.5) / count) * 100;
  const current = stages[currentIndex];
  const doneWidth = delivered ? 100 : at(currentIndex);
  // نقطة البداية للحركة: الدرع عند المحطة الأولى، والمقطوع حتى المحطة الأولى
  const motionVars = {
    "--from": `${(currentIndex * 100) / count}%`,
    "--from-scale": at(0) / doneWidth,
    "--c": currentIndex,
  } as CSSProperties;

  return (
    <div>
      <div
        className={`road${running ? " is-running" : ""}`}
        data-motion={motion}
        style={motionVars}
        role="img"
        aria-label={`المرحلة ${toArabicDigits(currentIndex + 1)} من ${toArabicDigits(count)}: ${current.label ?? current.short}`}
      >
        <i className="road-dash" />
        <i className="road-done" style={{ width: `${doneWidth}%` }} />
        {stages.map((stage, i) => {
          if (i === currentIndex) return null;
          const position = { insetInlineStart: `${at(i)}%`, "--i": i } as CSSProperties;
          if (stage.state === "failed") return <i key={stage.key} className="road-stop failed" style={position} />;
          return (
            <span key={stage.key}>
              <i className="road-stop next" style={position} />
              {stage.state === "done" && <i className="road-stop fill" style={position} />}
            </span>
          );
        })}
        <span className="road-car">
          <Image
            src="/brand/td-shield.png"
            alt=""
            width={32}
            height={36}
            className="road-mark"
            style={{ insetInlineStart: `${at(currentIndex)}%` }}
          />
        </span>
      </div>
      <div className="road-labels" style={{ gridTemplateColumns: `repeat(${count}, 1fr)` }}>
        {stages.map((stage, i) => (
          <span
            key={stage.key}
            className={`road-label${i === currentIndex ? " on" : ""}`}
            style={{ "--i": i } as CSSProperties}
          >
            <span className="lbl-off">{stage.short}</span>
            {/* الاسم العريض طبقة فوق العادي — تتلاشى بدل تحريك font-weight */}
            <span className="lbl-on" aria-hidden="true">
              {stage.short}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** شريط المراحل الست المختصر (1c) — لقائمة «طلباتي» */
export function StageBar({ stages }: { stages: OrderStage[] }) {
  return (
    <div className="progress-6" style={{ gridTemplateColumns: `repeat(${stages.length}, 1fr)` }} aria-hidden="true">
      {stages.map((stage) => (
        <i key={stage.key} className={stage.state === "next" ? undefined : stage.state} />
      ))}
    </div>
  );
}
