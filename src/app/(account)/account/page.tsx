import type { Metadata } from "next";
import { ProfileCard } from "@/components/account/profile-card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

export const metadata: Metadata = { title: "Profile" };

export default function AccountPage() {
  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "My account" }]} />
      <h1 className="text-h2">My account</h1>
      <ProfileCard />
    </div>
  );
}
