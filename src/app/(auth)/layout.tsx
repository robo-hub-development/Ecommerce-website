import type { Metadata } from "next";
import { Logo } from "@/components/layout/logo";

// Auth pages are never indexed.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <header className="container-page py-5">
        <Logo />
      </header>
      <main id="main-content" className="container-page flex flex-1 items-start justify-center pb-16 sm:items-center">
        <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-card ring-1 ring-foreground/10 sm:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
