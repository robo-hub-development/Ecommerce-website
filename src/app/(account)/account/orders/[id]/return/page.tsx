import type { Metadata } from "next";
import { ReturnRequestView } from "@/components/account/return-request-view";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

export const metadata: Metadata = { title: "Request a return" };

export default async function ReturnPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "My account", href: "/account" },
          { label: "My orders", href: "/account/orders" },
          { label: "Order", href: `/account/orders/${id}` },
          { label: "Request return" },
        ]}
      />
      <h1 className="text-h2">Request a return</h1>
      <ReturnRequestView id={id} />
    </div>
  );
}
