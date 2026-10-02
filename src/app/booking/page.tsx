import type { Metadata } from "next";
import { BookingForm } from "@/components/requests/BookingForm";
import { AppBar } from "@/components/shell/AppBar";
import { findPackage } from "@/lib/packages";
import { packageLabel } from "@/lib/whatsapp-requests";

/** ‎?package=‎ من صفحة باقة ترهيم: الحجز يصبح «معاينة» لتلك الباقة */
function packageFrom(slug: string | string[] | undefined) {
  return typeof slug === "string" ? findPackage(slug) : undefined;
}

export async function generateMetadata({ searchParams }: PageProps<"/booking">): Promise<Metadata> {
  const pkg = packageFrom((await searchParams).package);
  return { title: pkg ? `حجز معاينة — ${packageLabel(pkg)}` : "حجز موعد فحص" };
}

export default async function BookingPage({ searchParams }: PageProps<"/booking">) {
  const { vehicle, package: packageSlug } = await searchParams;
  const pkg = packageFrom(packageSlug);
  return (
    <>
      <AppBar title={pkg ? "حجز معاينة" : "حجز موعد فحص"} backHref={pkg ? `/packages/${pkg.slug}` : "/"} />
      <BookingForm vehicleId={typeof vehicle === "string" ? vehicle : undefined} pkg={pkg} />
    </>
  );
}
