import type { ReactNode } from "react";
import { RegMark } from "./RegMark";

/** علامات التسجيل الأربع — لأي عنصر يحمل الصنف "sheet" دون المكوّن */
export function RegMarks() {
  return (
    <>
      <RegMark position="tl" />
      <RegMark position="tr" />
      <RegMark position="bl" />
      <RegMark position="br" />
    </>
  );
}

export function Sheet({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`sheet ${className ?? ""}`}>
      <RegMarks />
      {children}
    </div>
  );
}
