import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";

/** شريط عنوان الشاشات الفرعية: رجوع (يمين في RTL) · العنوان · رمز أو زر */
export function AppBar({
  title,
  backHref = "/",
  trailing,
  titleAs: Title = "h1",
}: {
  title: string;
  backHref?: string;
  trailing?: ReactNode;
  /** "div" حين تحمل الشاشة نفسها عنوانها الرئيسي (مسار القطع) — عنوان h1 واحد لكل صفحة */
  titleAs?: "h1" | "div";
}) {
  return (
    <header className="appbar">
      <div className="appbar-in">
        <Link href={backHref} className="appbar-btn" aria-label="رجوع">
          <Icon name="chevronRight" size={22} />
        </Link>
        <Title className="appbar-title">{title}</Title>
        <div style={{ justifySelf: "center" }}>{trailing}</div>
      </div>
    </header>
  );
}
