/**
 * الوضع الفاتح/الداكن. الافتراضي يتبع إعداد الجهاز (prefers-color-scheme في globals.css)،
 * واختيار المستخدم الصريح يُحفظ محلياً ويُطبَّق كسمة data-theme على <html>.
 */
export const THEME_STORAGE_KEY = "td-theme";
export const THEME_CHANGE_EVENT = "td-theme-change";

export type Theme = "light" | "dark";

/** يعمل قبل أول رسم (يُحقن في <head> من layout.tsx) لتفادي وميض الوضع الخاطئ */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="dark"||t==="light"){document.documentElement.setAttribute("data-theme",t)}}catch(e){}})();`;

export function currentTheme(): Theme {
  const explicit = document.documentElement.getAttribute("data-theme");
  if (explicit === "dark" || explicit === "light") return explicit;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // التخزين غير متاح (تصفح خاص) — يبقى الاختيار لهذه الجلسة فقط
  }
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}
