import type { Metadata } from "next";
import { BookingForm } from "@/components/requests/BookingForm";
import { AppBar } from "@/components/shell/AppBar";
import { findPackage } from "@/lib/packages";

export const metadata: Metadata = { title: "حجز موعد فحص" };

export default async function BookingPage({ searchParams }: PageProps<"/booking">) {
  const { vehicle, package: packageSlug } = await searchParams;
  // ‎?package=‎ من صفحة باقة ترهيم: الحجز يصبح «معاينة» لتلك الباقة
  const pkg = typeof packageSlug === "string" ? findPackage(packageSlug) : undefined;
  return (
    <>
      <AppBar title={pkg ? "حجز معاينة" : "حجز موعد فحص"} backHref={pkg ? `/packages/${pkg.slug}` : "/"} />
      <BookingForm vehicleId={typeof vehicle === "string" ? vehicle : undefined} pkg={pkg} />
    </>
  );
}
