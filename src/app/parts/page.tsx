import type { Metadata } from "next";
import { AppBar } from "@/components/shell/AppBar";
import { PartsScreen } from "@/components/vehicle/PartsScreen";
import { PRICING_SETTINGS } from "@/lib/pricing-settings";

export const metadata: Metadata = {
  title: "قطع الغيار",
  description: PRICING_SETTINGS.showListPrices
    ? "قطع غيار لكل الماركات: ابحث بالاسم الذي تعرفه (قماش، رديتر، كمبروسر) واعرف الأسعار الاسترشادية لكل جودة قبل الطلب — ونؤكد التوفر والسعر قبل أي دفع."
    : "قطع غيار لكل الماركات: ابحث بالاسم الذي تعرفه (قماش، رديتر، كمبروسر) واطلب قطعتك — ونؤكد التوفر والسعر قبل أي دفع.",
};

export default async function PartsPage({ searchParams }: PageProps<"/parts">) {
  const { vehicle, new: fresh, q } = await searchParams;
  return (
    <>
      <AppBar title="قطع الغيار" titleAs="div" />
      <PartsScreen
        vehicleId={typeof vehicle === "string" ? vehicle : undefined}
        fresh={fresh === "1"}
        query={typeof q === "string" ? q.slice(0, 80) : ""}
      />
    </>
  );
}
