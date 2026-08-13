import type { ReactNode } from "react";

export function Tag({ children, oe }: { children: ReactNode; oe?: boolean }) {
  return <span className={`tag ${oe ? "oe" : ""}`}>{children}</span>;
}
