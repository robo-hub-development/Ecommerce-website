import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { safeRedirectPath } from "@/lib/auth/redirect";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;
  const target = Array.isArray(next) ? next[0] : next;

  return <AuthForm mode="register" next={target ? safeRedirectPath(target) : undefined} />;
}
