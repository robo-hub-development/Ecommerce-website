"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { primaryNav } from "@/lib/site";
import type { Category } from "@/types/content";

const linkClass = "flex h-11 items-center rounded-md px-3 font-medium hover:bg-muted";

export function MobileMenu({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Open menu"
        className={buttonVariants({
          variant: "ghost",
          size: "icon",
          className: "lg:hidden",
        })}
      >
        <Menu aria-hidden />
      </SheetTrigger>
      <SheetContent side="left" className="gap-0 overflow-y-auto">
        <SheetHeader className="border-b">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <Logo />
        </SheetHeader>
        <nav aria-label="Mobile" className="flex flex-col gap-1 p-3">
          <p className="px-3 pt-2 pb-1 text-eyebrow text-muted-foreground uppercase">
            Shop
          </p>
          {categories.map((category) => (
            <details key={category.slug} className="group">
              <summary className="flex h-11 cursor-pointer list-none items-center justify-between rounded-md px-3 font-medium hover:bg-muted [&::-webkit-details-marker]:hidden">
                {category.name}
                <ChevronDown
                  className="size-4 transition-transform group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <ul className="ml-3 flex flex-col border-l pl-2">
                <li>
                  <Link
                    href={`/category/${category.slug}`}
                    onClick={close}
                    className={linkClass}
                  >
                    All {category.name}
                  </Link>
                </li>
                {category.children.map((child) => (
                  <li key={child.slug}>
                    <Link
                      href={`/category/${child.slug}`}
                      onClick={close}
                      className={`${linkClass} font-normal text-muted-foreground`}
                    >
                      {child.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          ))}
          <Link href="/products" onClick={close} className={linkClass}>
            All products
          </Link>
          <p className="px-3 pt-4 pb-1 text-eyebrow text-muted-foreground uppercase">
            Company
          </p>
          {primaryNav.map((item) => (
            <Link key={item.href} href={item.href} onClick={close} className={linkClass}>
              {item.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
