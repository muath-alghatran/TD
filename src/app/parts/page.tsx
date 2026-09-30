import type { Metadata } from "next";
import { AppBar } from "@/components/shell/AppBar";
import { PartsScreen } from "@/components/vehicle/PartsScreen";

export const metadata: Metadata = {
  title: "قطع الغيار",
  description: "اطلب قطعة غيار لسيارتك بوعد تسليم محسوب — تعرف السعر مفصّلًا قبل أي عمل.",
};

export default async function PartsPage({ searchParams }: PageProps<"/parts">) {
  const { vehicle, new: fresh } = await searchParams;
  return (
    <>
      <AppBar title="قطع الغيار" titleAs="div" />
      <PartsScreen vehicleId={typeof vehicle === "string" ? vehicle : undefined} fresh={fresh === "1"} />
    </>
  );
}
