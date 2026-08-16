import { PayOrderClient } from "./PayOrderClient";

export default async function PayPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  return <PayOrderClient orderId={orderId} />;
}
