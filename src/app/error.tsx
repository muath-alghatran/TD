"use client";

import { Sheet } from "@/components/ui/Sheet";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="stage">
      <div className="lede">
        <span className="t-eyebrow">خطأ غير متوقع</span>
        <h1>
          حدث خطأ ما
          <br />
          <em>لسنا متأكدين لماذا</em>
        </h1>
        <p>حاول مرة أخرى، أو ابدأ من جديد إن استمرت المشكلة.</p>
      </div>
      <Sheet>
        <button className="act" onClick={reset}>
          حاول مرة أخرى
        </button>
      </Sheet>
    </main>
  );
}
