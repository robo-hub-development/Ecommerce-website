import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { safeRedirectPath } from "@/lib/auth/redirect";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;
  const target = Array.isArray(next) ? next[0] : next;

  return <AuthForm mode="login" next={target ? safeRedirectPath(target) : undefined} />;
}
