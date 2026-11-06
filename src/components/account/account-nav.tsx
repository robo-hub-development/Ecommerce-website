"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, User } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/account", label: "Profile", Icon: User, exact: true },
  { href: "/account/orders", label: "My orders", Icon: Package, exact: false },
];

export function AccountNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Account" className="lg:sticky lg:top-24 lg:self-start">
      <ul className="flex gap-2 overflow-x-auto lg:flex-col">
        {links.map(({ href, label, Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium whitespace-nowrap transition-colors",
                  active ? "bg-primary text-white" : "text-secondary hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4" aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
