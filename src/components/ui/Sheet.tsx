import type { ReactNode } from "react";
import { RegMark } from "./RegMark";

export function Sheet({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`sheet ${className ?? ""}`}>
      <RegMark position="tl" />
      <RegMark position="tr" />
      <RegMark position="bl" />
      <RegMark position="br" />
      {children}
    </div>
  );
}
