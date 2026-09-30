"use client";

import { Icon } from "@/components/ui/Icon";
import { useTheme } from "@/lib/local-store";
import { applyTheme } from "@/lib/theme";

/** زر الوضع الفاتح/الداكن — يعرض الوضع الذي سينتقل إليه */
export function ThemeToggle({ className = "icon-btn" }: { className?: string }) {
  const theme = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      className={className}
      onClick={() => applyTheme(next)}
      aria-label={next === "dark" ? "الوضع الداكن" : "الوضع الفاتح"}
      title={next === "dark" ? "الوضع الداكن" : "الوضع الفاتح"}
    >
      <Icon name={theme === "dark" ? "sun" : "moon"} size={20} />
    </button>
  );
}
