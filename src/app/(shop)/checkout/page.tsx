import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { CheckoutView } from "@/components/checkout/checkout-view";
import { RazorpayScript } from "@/components/checkout/razorpay-script";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="container-page flex flex-col gap-6 py-8 lg:py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
      <h1 className="text-h1">Checkout</h1>
      <CheckoutView />
      {/* Razorpay's checkout.js is loaded here and on no other page. */}
      <RazorpayScript />
    </div>
  );
}
