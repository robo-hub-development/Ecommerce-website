"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PolicyHeading } from "@/lib/policies";

function useActiveHeading(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? "");
  useEffect(() => {
    const elements = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -70% 0px" },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

function TocLinks({ headings, active, onSelect }: { headings: PolicyHeading[]; active: string; onSelect?: () => void }) {
  return (
    <ol className="flex flex-col gap-1 text-sm">
      {headings.map((heading) => (
        <li key={heading.id}>
          <a
            href={`#${heading.id}`}
            onClick={onSelect}
            aria-current={active === heading.id ? "location" : undefined}
            className={cn(
              "block rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground",
              active === heading.id && "bg-primary-soft font-medium text-primary",
            )}
          >
            {heading.text}
          </a>
        </li>
      ))}
    </ol>
  );
}

export function PolicyToc({ headings }: { headings: PolicyHeading[] }) {
  const ids = headings.map((h) => h.id);
  const active = useActiveHeading(ids);
  const [open, setOpen] = useState(false);

  return (
    <nav aria-label="Table of contents" data-print-hide>
      {/* Mobile: collapsible */}
      <div className="rounded-xl border bg-card lg:hidden">
        <button
          type="button"
          aria-expanded={open}
          aria-controls="policy-toc-list"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-2 px-4 py-3 text-sm font-semibold"
        >
          On this page
          <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} aria-hidden />
        </button>
        <div id="policy-toc-list" hidden={!open} className="border-t p-2">
          <TocLinks headings={headings} active={active} onSelect={() => setOpen(false)} />
        </div>
      </div>

      {/* Desktop: sticky */}
      <div className="sticky top-28 hidden max-h-[calc(100dvh-8rem)] overflow-y-auto lg:block">
        <p className="mb-2 px-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">On this page</p>
        <TocLinks headings={headings} active={active} />
      </div>
    </nav>
  );
}
