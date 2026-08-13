import { ActButton } from "@/components/ui/ActButton";
import { Callout } from "@/components/ui/Callout";
import { Field } from "@/components/ui/Field";
import { Ruler } from "@/components/ui/Ruler";
import { Sheet } from "@/components/ui/Sheet";
import { StatusPill, type PromiseStatus } from "@/components/ui/StatusPill";
import { Tag } from "@/components/ui/Tag";

const STATUSES: PromiseStatus[] = ["ok", "wait", "spec"];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-14">
      <h2 className="t-eyebrow mb-4 block text-[var(--text-3)]">{title}</h2>
      {children}
    </section>
  );
}

export default function StyleguidePage() {
  return (
    <main className="mx-auto max-w-[900px] px-5 py-10">
      <h1 className="t-disp mb-10 text-[32px]">دليل التصميم — Trust Drive</h1>

      <Section title="Sheet — لوح الورق">
        <Sheet>
          <p className="text-[14.5px] text-[var(--text-2)]">
            لوح الورق الأساسي بعلامات التسجيل الأربع في الزوايا — يستخدم لكل بطاقة محتوى في الموقع.
          </p>
        </Sheet>
      </Section>

      <Section title="Field — حقل الحبر">
        <Field eyebrow="مخطط المركبة" meta="PLATE 01 · GENERAL ARRANGEMENT">
          <svg viewBox="0 0 900 120" className="block w-full">
            <Ruler />
          </svg>
          <div className="p-4 text-[13.5px] text-[var(--glint)]">حقل الحبر الداكن — خلفية المخططات الهندسية.</div>
        </Field>
      </Section>

      <Section title="Ruler — مسطرة الإحداثيات">
        <Field eyebrow="A–H × 1–4">
          <svg viewBox="0 0 900 400" className="block w-full">
            <Ruler />
          </svg>
        </Field>
      </Section>

      <Section title="StatusPill — حالات الوعد الثلاث">
        <div className="flex flex-wrap gap-3">
          {STATUSES.map((s) => (
            <StatusPill key={s} status={s} />
          ))}
        </div>
      </Section>

      <Section title="Tag — وسوم الجودة">
        <div className="flex flex-wrap gap-3">
          <Tag oe>وكالة</Tag>
          <Tag>بديل معتمد</Tag>
          <Tag>تجاري</Tag>
        </div>
      </Section>

      <Section title="Callout — الدائرة المرقّمة">
        <div className="flex flex-wrap items-center gap-3">
          <Callout n={1} />
          <Callout n={2} />
          <Callout n={3} gap />
        </div>
      </Section>

      <Section title="ActButton — الأزرار">
        <div className="flex max-w-xs flex-col gap-3">
          <ActButton variant="primary">إتمام الطلب والدفع</ActButton>
          <ActButton variant="secondary">تجربة من البداية</ActButton>
          <ActButton variant="primary" disabled>
            غير متاح
          </ActButton>
        </div>
      </Section>

      <Section title="مزيج — بطاقة قطعة">
        <Sheet>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <Callout n={1} />
              <div>
                <div className="t-disp text-[15.5px] font-medium">فحمات فرامل أمامية</div>
                <div className="t-data mt-1 text-[11.5px] text-[var(--text-3)]">04465-33471</div>
              </div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-dashed border-[var(--rule-2)] pt-3">
            <Tag oe>وكالة</Tag>
            <Tag>ضمان ١٢ شهر</Tag>
            <StatusPill status="ok" label="متوفر ومؤكد · يوم واحد" />
          </div>
        </Sheet>
      </Section>
    </main>
  );
}
