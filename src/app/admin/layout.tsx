import Link from "next/link";
import type { ReactNode } from "react";

const NAV_ITEMS = [
  { href: "/admin", label: "الرئيسية" },
  { href: "/admin/orders", label: "الطلبات" },
  { href: "/admin/demand-gap", label: "الطلب المفقود" },
  { href: "/admin/settings", label: "الإعدادات" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="stage">
      <div
        className="mb-4 rounded-[2px] border px-4 py-3 text-[12.5px]"
        style={{ borderColor: "var(--wait)", background: "var(--wait-film)", color: "var(--wait)" }}
      >
        <b>بلا نظام دخول حقيقي.</b> هذه لوحة تحكم تطويرية — لا يُنشر مسار <code className="t-data">/admin</code> للإنتاج
        قبل بناء المصادقة (راجع docs/auth-spec.md).
      </div>

      <nav className="mb-5 flex flex-wrap gap-2">
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className="lay">
            {item.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  );
}
