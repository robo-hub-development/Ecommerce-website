"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/content";

export function MegaMenu({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const close = () => {
    clearTimeout(timer.current);
    setOpen(false);
  };
  const openNow = () => {
    clearTimeout(timer.current);
    setOpen(true);
  };
  const closeSoon = () => {
    timer.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
      onKeyDown={(event) => event.key === "Escape" && close()}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) close();
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mega-menu-panel"
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 items-center gap-1 rounded-md px-3 text-sm font-medium hover:bg-muted"
      >
        Shop
        <ChevronDown
          className={cn("size-4 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      <div
        id="mega-menu-panel"
        hidden={!open}
        className="absolute inset-x-0 top-full border-b bg-background shadow-pop"
      >
        <div className="container-page grid grid-cols-4 gap-x-8 gap-y-6 py-8">
          {categories.length === 0 && (
            <p className="col-span-4 text-sm text-muted-foreground">
              Categories are unavailable right now.
            </p>
          )}
          {categories.map((category) => (
            <div key={category.slug} className="flex flex-col gap-2">
              <Link
                href={`/category/${category.slug}`}
                onClick={close}
                className="rounded-sm font-semibold hover:text-primary"
              >
                {category.name}
              </Link>
              <ul className="flex flex-col gap-1.5">
                {category.children.map((child) => (
                  <li key={child.slug}>
                    <Link
                      href={`/category/${child.slug}`}
                      onClick={close}
                      className="rounded-sm text-sm text-muted-foreground hover:text-foreground"
                    >
                      {child.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="col-span-4 border-t pt-4">
            <Link
              href="/products"
              onClick={close}
              className="text-sm font-medium text-primary hover:underline"
            >
              View all products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
