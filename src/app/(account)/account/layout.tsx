import type { Metadata } from "next";
import { AccountNav } from "@/components/account/account-nav";

// Personal pages: keep them out of search results.
export const metadata: Metadata = {
  title: { default: "My account", template: "%s | My account" },
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-page grid gap-6 py-8 lg:grid-cols-[220px_1fr] lg:gap-10 lg:py-12">
      <AccountNav />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
