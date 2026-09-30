import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Sheet } from "@/components/ui/Sheet";
import { StatusPill } from "@/components/ui/StatusPill";
import { Tag } from "@/components/ui/Tag";
import { catalogPartPromise } from "@/lib/catalog-promise";
import { CITIES } from "@/lib/city-catalog";
import { dayWord, formatPrice, toArabicDigits } from "@/lib/format";
import { ZONES } from "@/lib/zone-catalog";

const DEFAULT_CITY = CITIES[0]; // حائل — لعرض حالة افتراضية قابلة للأرشفة

function findPart(oem: string) {
  for (const zone of ZONES) {
    const part = zone.parts.find((p) => p.oem === oem && p.avail !== false);
    if (part) return { part, zone };
  }
  return null;
}

export function generateStaticParams() {
  return ZONES.flatMap((zone) => zone.parts)
    .filter((p) => p.avail !== false)
    .map((p) => ({ oem: p.oem }));
}

export async function generateMetadata({ params }: { params: Promise<{ oem: string }> }): Promise<Metadata> {
  const { oem } = await params;
  const found = findPart(oem);
  if (!found) return { title: "قطعة غير موجودة" };
  const { part } = found;
  return {
    title: `${part.n} · ${part.oem}`,
    description: `${part.n} (${part.oem}) — ${part.tier ?? ""} — قطع غيار بوعد محسوب من Trust Drive.`,
  };
}

export default async function PartPage({ params }: { params: Promise<{ oem: string }> }) {
  const { oem } = await params;
  const found = findPart(oem);
  if (!found) notFound();
  const { part, zone } = found;

  const result = catalogPartPromise(part, DEFAULT_CITY, "ship");
  const availability =
    result.status === "ok"
      ? "https://schema.org/InStock"
      : result.status === "wait"
        ? "https://schema.org/LimitedAvailability"
        : "https://schema.org/PreOrder";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: part.n,
    sku: part.oem,
    category: part.g,
    ...(part.tier ? { brand: { "@type": "Brand", name: part.tier } } : {}),
    offers: {
      "@type": "Offer",
      priceCurrency: "SAR",
      price: part.price ?? 0,
      availability,
    },
  };

  return (
    <main className="stage">
      <Link href="/parts" className="retreat">
        ← قطع الغيار
      </Link>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="lede">
        <span className="t-eyebrow">
          {zone.layer} · {zone.name}
        </span>
        <h1>{part.n}</h1>
        <p className="t-data" style={{ color: "var(--text-3)" }}>
          {part.oem}
        </p>
      </div>

      <Sheet>
        <div className="flex flex-wrap items-center gap-2">
          {part.tier && <Tag oe={part.tier === "وكالة"}>{part.tier}</Tag>}
          {part.war !== undefined && <Tag>ضمان {toArabicDigits(part.war)} شهر</Tag>}
          <StatusPill status={result.status} label={`${dayWord(result.days)} — ${DEFAULT_CITY.n}`} />
        </div>
        <div className="t-disp mt-3" style={{ fontSize: 24, fontWeight: 700 }}>
          {formatPrice(part.price ?? 0)} ريال <small style={{ fontSize: 12, fontWeight: 300, color: "var(--text-3)" }}>شامل الضريبة</small>
        </div>
        <Link className="act mt-5" href="/parts">
          ابدأ الطلب
        </Link>
        <div className="memo">
          السعر والوعد هنا تقديريان لمدينة {DEFAULT_CITY.n} — الرقم المعتمد يُحسب فعلياً بعد اختيار سيارتك ومدينتك في
          تدفق الطلب.
        </div>
      </Sheet>
    </main>
  );
}
