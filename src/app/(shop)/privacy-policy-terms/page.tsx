import type { Metadata } from "next";
import { PolicyPage } from "@/components/policy/policy-page";
import { getPolicy } from "@/lib/policies";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 86400;

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy & Terms of Service",
  description: "How STEM ROBO HUB INDIA collects and protects your information, and the terms for using our store.",
  path: "/privacy-policy-terms",
});

export default async function PrivacyTermsPage() {
  return <PolicyPage policy={await getPolicy("privacy-terms")} />;
}
