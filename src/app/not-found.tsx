import Link from "next/link";
import { Sheet } from "@/components/ui/Sheet";

export default function NotFound() {
  return (
    <main className="stage">
      <div className="lede">
        <span className="t-eyebrow">٤٠٤</span>
        <h1>
          هذه الصفحة غير موجودة
          <br />
          <em>ربما تغيّر الرابط</em>
        </h1>
        <p>تحقق من الرابط، أو ابدأ من الصفحة الرئيسية.</p>
      </div>
      <Sheet>
        <Link className="act" href="/">
          الرجوع إلى الرئيسية
        </Link>
      </Sheet>
    </main>
  );
}
