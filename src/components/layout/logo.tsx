import Link from "next/link";
import { Cpu } from "lucide-react";
import { siteConfig } from "@/lib/site";

export function Logo() {
  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name} home`}
      className="flex items-center gap-2 rounded-md text-lg font-bold tracking-tight"
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Cpu className="size-5" aria-hidden />
      </span>
      <span>{siteConfig.name}</span>
    </Link>
  );
}
