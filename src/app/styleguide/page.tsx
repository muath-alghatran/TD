import { KsaPlate } from "@/components/garage/KsaPlate";
import { RoadTrack } from "@/components/orders/RoadTrack";
import { ActButton } from "@/components/ui/ActButton";
import { Corners } from "@/components/ui/Corners";
import { Icon, type IconName } from "@/components/ui/Icon";
import type { OrderStage } from "@/lib/order-progress";
import { Callout } from "@/components/ui/Callout";
import { Field } from "@/components/ui/Field";
import { Ruler } from "@/components/ui/Ruler";
import { Sheet } from "@/components/ui/Sheet";
import { StatusPill, type PromiseStatus } from "@/components/ui/StatusPill";
import { Tag } from "@/components/ui/Tag";

const STATUSES: PromiseStatus[] = ["ok", "wait", "spec"];

const SWATCHES = [
  ["--bg", "الخلفية"],
  ["--surface", "السطح"],
  ["--fg", "النص"],
  ["--accent", "الفولاذي"],
  ["--ink-accent", "نص الهوية"],
  ["--steel-bg", "الحقل الفولاذي"],
  ["--ok", "متوفر"],
  ["--wait", "يحتاج تأكيد"],
  ["--spec", "طلب خاص"],
] as const;

const ICONS: IconName[] = ["cog", "calendarCheck", "truck", "route", "warehouse", "headset", "receipt", "camera", "scrollText", "messageCircle", "phone", "mapPin"];

const SAMPLE_STAGES: OrderStage[] = [
  { key: "requested", label: "استلمنا طلبك", short: "الطلب", note: "", at: null, state: "done" },
  { key: "confirmed", label: "تأكيد التوفر والسعر", short: "التأكيد", note: "", at: null, state: "done" },
  { key: "paid", label: "موافقتك والدفع", short: "الدفع", note: "", at: null, state: "done" },
  { key: "prep", label: "تجهيز القطعة", short: "التجهيز", note: "", at: null, state: "current" },
  { key: "handover", label: "التركيب في المركز", short: "التركيب", note: "", at: null, state: "next" },
  { key: "delivered", label: "التسليم", short: "التسليم", note: "", at: null, state: "next" },
];

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
      <h1 className="t-disp mb-3 text-[32px]">دليل التصميم — Trust Drive</h1>
      <p className="lead-note mb-10">
        نظام Industry: Barlow Condensed للعناوين، Barlow للنص والأرقام اللاتينية، وIBM Plex Sans Arabic للعربي. أزرق
        فولاذي واحد للهوية، والألوان المشبعة لحالة التوفر فقط. المرجع: docs/design/TD_App_Directions.html
      </p>

      <Section title="الألوان — الأدوار">
        <div className="grid grid-cols-3 gap-3">
          {SWATCHES.map(([token, label]) => (
            <div key={token}>
              <div className="blueprint" style={{ height: 56, background: `var(${token})` }} />
              <div className="t-code" style={{ marginTop: 6 }}>
                {token}
              </div>
              <div style={{ fontSize: 12.5 }}>{label}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="الخط — الأدوار">
        <div className="t-disp" style={{ fontSize: 32 }}>
          مركز صيانة وقطع غيار · Trust Drive
        </div>
        <p className="prose" style={{ marginTop: 8 }}>
          نص الجسم بخط Barlow للاتيني وIBM Plex Sans Arabic للعربي — السعر 434.03 ر.س، والموعد خلال ٣ أيام.
        </p>
        <div className="t-code" style={{ marginTop: 8 }}>
          06 SERVICES · SPEC 01—06
        </div>
      </Section>

      <Section title="Blueprint — الإطار وعلامات التسجيل">
        <div className="blueprint" style={{ padding: 16 }}>
          <Corners />
          <div className="t-disp" style={{ fontSize: 16 }}>
            نؤمن بأن الموثوقية تبدأ من الوضوح والشفافية
          </div>
        </div>
      </Section>

      <Section title="الأزرار — btn">
        <div className="flex flex-wrap items-center gap-3">
          <button className="btn btn-primary btn-lg blueprint">
            <Corners />
            <Icon name="messageCircle" size={20} />
            تواصل معنا
          </button>
          <button className="btn btn-secondary btn-lg">
            <Icon name="calendarCheck" size={20} />
            احجز موعد فحص
          </button>
          <button className="btn btn-secondary btn-icon" aria-label="اتصال">
            <Icon name="phone" size={20} />
          </button>
          <button className="btn btn-primary" disabled>
            غير متاح
          </button>
        </div>
      </Section>

      <Section title="الوسوم — tag">
        <div className="flex flex-wrap gap-3">
          <span className="tag tag-accent">قيد التجهيز</span>
          <span className="tag tag-outline">
            <Icon name="badgeCheck" size={13} />
            بإدارة سعودية
          </span>
          <span className="tag tag-neutral">مكتمل</span>
          <span className="tag tag-dashed">غير متوفرة</span>
        </div>
      </Section>

      <Section title="الطريق — تتبع الطلب (1b)">
        <div className="steel" style={{ padding: "4px 16px 16px" }}>
          <RoadTrack stages={SAMPLE_STAGES} currentIndex={3} delivered={false} />
        </div>
      </Section>

      <Section title="اللوحة السعودية">
        <KsaPlate plate="ر ن ح ٤٧٢٩" />
      </Section>

      <Section title="الأيقونات — Lucide">
        <div className="flex flex-wrap gap-4" style={{ color: "var(--accent)" }}>
          {ICONS.map((name) => (
            <Icon key={name} name={name} size={24} label={name} />
          ))}
        </div>
      </Section>

      <Section title="Sheet — لوح الورق (الشاشات القائمة)">
        <Sheet>
          <p className="text-[14.5px] text-[var(--text-2)]">
            لوح الورق بعلامات التسجيل الأربع خارج الزوايا — لبطاقات مسار القطع ولوحة التحكم.
          </p>
        </Sheet>
      </Section>

      <Section title="Field — الحقل الفولاذي">
        <Field eyebrow="مخطط المركبة" meta="PLATE 01 · GENERAL ARRANGEMENT">
          <svg viewBox="0 0 900 120" className="block w-full">
            <Ruler />
          </svg>
          <div className="p-4 text-[13.5px] text-[var(--glint)]">الحقل الفولاذي — خلفية المخططات الهندسية.</div>
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

      <Section title="Callout — الرقم المؤطَّر">
        <div className="flex flex-wrap items-center gap-3">
          <Callout n={1} />
          <Callout n={2} />
          <Callout n={3} gap />
        </div>
      </Section>

      <Section title="ActButton — زر الشاشات القائمة">
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
