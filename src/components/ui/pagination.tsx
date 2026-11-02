import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  /** Builds the crawlable URL for a page. */
  hrefFor: (page: number) => string;
}

/** Page numbers to show: first, last, and a window around the current page, with null for gaps. */
function pageWindow(page: number, totalPages: number) {
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? [null, p] : [p]));
}

const itemClass = "min-w-10";

export function Pagination({ page, totalPages, hrefFor }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="mt-10 flex justify-center">
      <ul className="flex flex-wrap items-center justify-center gap-1.5">
        <li>
          {page > 1 ? (
            <Link
              href={hrefFor(page - 1)}
              rel="prev"
              className={cn(buttonVariants({ variant: "outline" }), itemClass)}
            >
              <ChevronLeft aria-hidden className="size-4" />
              <span className="sr-only sm:not-sr-only">Previous</span>
            </Link>
          ) : null}
        </li>
        {pageWindow(page, totalPages).map((item, index) =>
          item === null ? (
            <li key={`gap-${index}`} aria-hidden className="px-1 text-muted-foreground">
              …
            </li>
          ) : (
            <li key={item}>
              <Link
                href={hrefFor(item)}
                aria-current={item === page ? "page" : undefined}
                aria-label={`Page ${item}`}
                className={cn(
                  buttonVariants({ variant: item === page ? "default" : "outline" }),
                  itemClass,
                )}
              >
                {item}
              </Link>
            </li>
          ),
        )}
        <li>
          {page < totalPages ? (
            <Link
              href={hrefFor(page + 1)}
              rel="next"
              className={cn(buttonVariants({ variant: "outline" }), itemClass)}
            >
              <span className="sr-only sm:not-sr-only">Next</span>
              <ChevronRight aria-hidden className="size-4" />
            </Link>
          ) : null}
        </li>
      </ul>
    </nav>
  );
}
