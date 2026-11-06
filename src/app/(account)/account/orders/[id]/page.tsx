import type { Metadata } from "next";
import { OrderDetail } from "@/components/account/order-detail";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

export const metadata: Metadata = { title: "Order details" };

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "My account", href: "/account" },
          { label: "My orders", href: "/account/orders" },
          { label: "Order details" },
        ]}
      />
      <OrderDetail id={id} />
    </div>
  );
}
