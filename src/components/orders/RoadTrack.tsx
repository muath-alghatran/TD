import Image from "next/image";
import { toArabicDigits } from "@/lib/format";
import type { OrderStage } from "@/lib/order-progress";

/**
 * الطريق (1b): الطريق المرسوم في الشعار صار شريط التتبع. المقطوع مصمت،
 * والقادم متقطع، والدرع يقف عند المرحلة الحالية. يسير من اليمين في العربية.
 */
export function RoadTrack({
  stages,
  currentIndex,
  delivered,
}: {
  stages: OrderStage[];
  currentIndex: number;
  delivered: boolean;
}) {
  const count = stages.length;
  const at = (i: number) => ((i + 0.5) / count) * 100;
  const current = stages[currentIndex];

  return (
    <div>
      <div
        className="road"
        role="img"
        aria-label={`المرحلة ${toArabicDigits(currentIndex + 1)} من ${toArabicDigits(count)}: ${current.label}`}
      >
        <i className="road-dash" />
        <i className="road-done" style={{ width: `${delivered ? 100 : at(currentIndex)}%` }} />
        {stages.map((stage, i) =>
          i === currentIndex ? null : (
            <i
              key={stage.key}
              className={`road-stop ${stage.state === "done" ? "" : stage.state === "failed" ? "failed" : "next"}`}
              style={{ insetInlineStart: `${at(i)}%` }}
            />
          ),
        )}
        <Image
          src="/brand/td-shield.png"
          alt=""
          width={32}
          height={36}
          className="road-mark"
          style={{ insetInlineStart: `${at(currentIndex)}%` }}
        />
      </div>
      <div className="road-labels" style={{ gridTemplateColumns: `repeat(${count}, 1fr)` }}>
        {stages.map((stage, i) => (
          <span key={stage.key} className={i === currentIndex ? "on" : undefined}>
            {stage.short}
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
