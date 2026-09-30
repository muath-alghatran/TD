/**
 * حدث تغيّر البيانات المحلية داخل نفس التبويب.
 *
 * حدث "storage" الأصلي في المتصفح لا يصل إلا للتبويبات الأخرى، فكل كتابة في
 * orders.ts وgarage.ts تطلق هذا الحدث أيضاً لتتحدث الشاشات المفتوحة فوراً
 * (src/lib/local-store.ts يستمع للاثنين).
 */
export const LOCAL_CHANGE_EVENT = "td-local-change";

export function notifyLocalChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(LOCAL_CHANGE_EVENT));
}
