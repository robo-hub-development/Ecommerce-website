import type { Metadata } from "next";
import { OrdersList } from "@/components/account/orders-list";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

export const metadata: Metadata = { title: "My orders" };

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = Math.max(1, Number.parseInt((await searchParams).page ?? "1", 10) || 1);
  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "My account", href: "/account" }, { label: "My orders" }]} />
      <h1 className="text-h2">My orders</h1>
      <OrdersList page={page} />
    </div>
  );
}
