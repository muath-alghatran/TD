import { Sheet } from "@/components/ui/Sheet";
import { DEFAULT_PROMISE_SETTINGS } from "@/lib/default-promise-settings";
import { PRICING_SETTINGS } from "@/lib/pricing-settings";

const PROMISE_ROWS: { label: string; value: string | number }[] = [
  { label: "حد الثقة العالية (أخضر)", value: DEFAULT_PROMISE_SETTINGS.hiConf },
  { label: "حد الثقة المتوسطة (أصفر)", value: DEFAULT_PROMISE_SETTINGS.midConf },
  { label: "عتبة موثوقية المورد", value: DEFAULT_PROMISE_SETTINGS.reliableSupplierThreshold },
  { label: "أيام تجهيز عند مندوب موثوق", value: DEFAULT_PROMISE_SETTINGS.reliablePrepDays },
  { label: "أيام تجهيز الطلب الخاص", value: DEFAULT_PROMISE_SETTINGS.specialPrepDays },
  { label: "يوم تركيب إضافي", value: DEFAULT_PROMISE_SETTINGS.fitDays },
  { label: "ثقة المخزون الداخلي", value: DEFAULT_PROMISE_SETTINGS.internalStockConfidence },
  { label: "ثقة أساس المورد الضعيف", value: DEFAULT_PROMISE_SETTINGS.weakSupplierBaseConfidence },
  { label: "أدنى أيام التوريد للماركات بلا مخزون", value: DEFAULT_PROMISE_SETTINGS.supplyMinDays },
  { label: "أقصى أيام التوريد للماركات بلا مخزون", value: DEFAULT_PROMISE_SETTINGS.supplyMaxDays },
  { label: "ثقة وعد التوريد", value: DEFAULT_PROMISE_SETTINGS.supplyConfidence },
];

const PRICING_ROWS: { label: string; value: string | number }[] = [
  { label: "سعر ساعة العمل (ريال)", value: PRICING_SETTINGS.hourRate },
  { label: "خصم التركيب عبر الموقع", value: PRICING_SETTINGS.fitDiscount },
  { label: "قيمة تعويض تأخر الوعد (ريال)", value: PRICING_SETTINGS.lateCredit },
];

export default function AdminSettingsPage() {
  return (
    <div>
      <div className="lede">
        <span className="t-eyebrow">لوحة التحكم</span>
        <h1>الإعدادات</h1>
      </div>

      <div
        className="mb-3.5 rounded-[2px] border px-4 py-3 text-[12.5px]"
        style={{ borderColor: "var(--wait)", background: "var(--wait-film)", color: "var(--wait)" }}
      >
        <b>معاينة للقراءة فقط حالياً.</b> هذه القيم مصدرها <code className="t-data">docs/data/settings.csv</code> —
        محرك الوعد على الخادم (<code className="t-data">verify-price</code>) عديم الحالة ولا يقرأ أي تعديل من هذه
        الشاشة، لأن ذلك يتطلب جدول <code className="t-data">Setting</code> في قاعدة بيانات حقيقية (docs/CLAUDE.md
        قاعدة 4). التعديل الفعلي القابل للنشر دون إعادة نشر الكود سيصبح ممكناً بعد ربط قاعدة بيانات حية.
      </div>

      <Sheet>
        <span className="t-eyebrow" style={{ color: "var(--text-3)" }}>
          محرك الوعد
        </span>
        <div className="tally">
          {PROMISE_ROWS.map((row) => (
            <div className="ln-i" key={row.label}>
              <span>{row.label}</span>
              <span>{row.value}</span>
            </div>
          ))}
        </div>
      </Sheet>

      <Sheet className="mt-3.5">
        <span className="t-eyebrow" style={{ color: "var(--text-3)" }}>
          التسعير
        </span>
        <div className="tally">
          {PRICING_ROWS.map((row) => (
            <div className="ln-i" key={row.label}>
              <span>{row.label}</span>
              <span>{row.value}</span>
            </div>
          ))}
        </div>
      </Sheet>
    </div>
  );
}
