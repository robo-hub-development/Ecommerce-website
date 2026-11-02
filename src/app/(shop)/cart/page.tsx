import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { CartView } from "@/components/cart/cart-view";

// The cart is personal and lives in the browser: keep it out of search results.
export const metadata: Metadata = {
  title: "Your cart",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <div className="container-page flex flex-col gap-6 py-8 lg:py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cart" }]} />
      <h1 className="text-h1">Your cart</h1>
      <CartView />
    </div>
  );
}
