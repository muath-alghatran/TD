import type { ReactNode } from "react";

/** شريط الإجراء الثابت أسفل الشاشات الفرعية — زر أساسي وزر أيقونة بجانبه */
export function ActionBar({ children }: { children: ReactNode }) {
  return (
    <div className="actionbar">
      <div className="actionbar-in">{children}</div>
    </div>
  );
}
