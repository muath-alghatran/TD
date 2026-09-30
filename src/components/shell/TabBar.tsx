"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/Icon";

const TABS: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "الرئيسية", icon: "house" },
  { href: "/orders", label: "طلباتي", icon: "route" },
  { href: "/garage", label: "كراجي", icon: "warehouse" },
  { href: "/about", label: "عن TD", icon: "shield" },
];

/** شريط التبويبات الأربعة (1a): خط فولاذي فوق التبويب الحالي */
export function TabBar() {
  const pathname = usePathname();
  return (
    <nav className="tabbar" aria-label="التنقل الرئيسي">
      <div className="tabbar-in">
        {TABS.map((tab) => {
          const active = tab.href === "/" ? pathname === "/" : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <Link key={tab.href} href={tab.href} className="tab" aria-current={active ? "page" : undefined}>
              <Icon name={tab.icon} size={22} />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
