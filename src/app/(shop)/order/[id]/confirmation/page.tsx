import type { Metadata } from "next";
import { OrderConfirmation } from "@/components/checkout/order-confirmation";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false, follow: false },
};

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="container-page flex max-w-3xl flex-col gap-6 py-8 lg:py-12">
      <OrderConfirmation id={id} />
    </div>
  );
}
