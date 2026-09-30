import type { ReactNode } from "react";

/** رأس صفحات التبويبات: عنوان كبير ورمز لاتيني مثل «ORDERS» (1a) */
export function TabHead({ title, code, children }: { title: string; code: string; children?: ReactNode }) {
  return (
    <header className="page tab-head">
      <div className="tab-head-row">
        <h1 className="tab-title">{title}</h1>
        <span className="t-code">{code}</span>
      </div>
      {children ? <p className="lead-note">{children}</p> : null}
    </header>
  );
}
