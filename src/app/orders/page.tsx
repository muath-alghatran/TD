import type { Metadata } from "next";
import { CertificateTeaser } from "@/components/orders/CertificateTeaser";
import { OrdersScreen } from "@/components/orders/OrdersScreen";
import { TabBar } from "@/components/shell/TabBar";
import { TabHead } from "@/components/shell/TabHead";

export const metadata: Metadata = { title: "طلباتي" };

export default function OrdersPage() {
  return (
    <>
      <main className="screen has-tabbar">
        <TabHead title="طلباتي" code="ORDERS">
          كل طلب بمراحله من تأكيد التوفر حتى التسليم، وموعده محسوب من لحظة الدفع.
        </TabHead>
        <div className="page">
          <OrdersScreen />
          <CertificateTeaser />
        </div>
      </main>
      <TabBar />
    </>
  );
}
