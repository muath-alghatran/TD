import type { Metadata } from "next";
import { OrderTrackingScreen } from "@/components/orders/OrderTrackingScreen";

export const metadata: Metadata = { title: "تتبع الطلب" };

export default async function OrderTrackingPage({ params }: PageProps<"/orders/[id]">) {
  const { id } = await params;
  return <OrderTrackingScreen id={id} />;
}
