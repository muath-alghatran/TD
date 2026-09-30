import type { Metadata } from "next";
import { BookingForm } from "@/components/requests/BookingForm";
import { AppBar } from "@/components/shell/AppBar";

export const metadata: Metadata = { title: "حجز موعد فحص" };

export default async function BookingPage({ searchParams }: PageProps<"/booking">) {
  const { vehicle } = await searchParams;
  return (
    <>
      <AppBar title="حجز موعد فحص" />
      <BookingForm vehicleId={typeof vehicle === "string" ? vehicle : undefined} />
    </>
  );
}
