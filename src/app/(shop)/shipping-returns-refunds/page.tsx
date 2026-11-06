import type { Metadata } from "next";
import { PolicyPage } from "@/components/policy/policy-page";
import { getPolicy } from "@/lib/policies";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 86400;

export const metadata: Metadata = buildMetadata({
  title: "Shipping, Returns & Refunds Policy",
  description: "Shipping, delivery, return, replacement, cancellation and refund information for STEM ROBO HUB INDIA orders.",
  path: "/shipping-returns-refunds",
});

export default async function ShippingReturnsPage() {
  return <PolicyPage policy={await getPolicy("shipping-returns-refunds")} />;
}
