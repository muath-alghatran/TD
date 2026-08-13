import type { ReactNode } from "react";

export function Field({
  eyebrow,
  meta,
  children,
  className,
}: {
  eyebrow: string;
  meta?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`field ${className ?? ""}`}>
      <div className="field-hd">
        <span className="t-eyebrow">{eyebrow}</span>
        {meta ? <span className="t-data">{meta}</span> : null}
      </div>
      {children}
    </div>
  );
}
