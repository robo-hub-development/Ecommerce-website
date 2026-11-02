"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { listingHref, withFilters } from "@/lib/listing";
import { SORT_OPTIONS, type ListingParams } from "@/lib/validations/listing";

interface ListingToolbarProps {
  basePath: string;
  params: ListingParams;
  activeFilterCount: number;
  /** Server-rendered filter fields, shown in the mobile drawer. */
  children: React.ReactNode;
}

function SearchForm({ basePath, params }: Pick<ListingToolbarProps, "basePath" | "params">) {
  const router = useRouter();
  const [value, setValue] = useState(params.q ?? "");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const q = value.trim();
    router.push(listingHref(basePath, withFilters(params, { q: q || undefined })), { scroll: false });
  };

  return (
    <form role="search" onSubmit={submit} className="relative min-w-0 flex-1">
      <label htmlFor="listing-search" className="sr-only">
        Search products by title
      </label>
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        id="listing-search"
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search products"
        maxLength={100}
        className="h-10 pr-9 pl-9"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            setValue("");
            if (params.q)
              router.push(listingHref(basePath, withFilters(params, { q: undefined })), { scroll: false });
          }}
          className="absolute top-1/2 right-1.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" aria-hidden />
          <span className="sr-only">Clear search</span>
        </button>
      )}
    </form>
  );
}

function SortSelect({ basePath, params }: Pick<ListingToolbarProps, "basePath" | "params">) {
  const router = useRouter();
  const id = useId();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="sr-only text-sm text-muted-foreground sm:not-sr-only">
        Sort by
      </label>
      <select
        id={id}
        value={params.sort ?? "featured"}
        onChange={(event) => {
          const sort = event.target.value === "featured" ? undefined : (event.target.value as ListingParams["sort"]);
          router.push(listingHref(basePath, withFilters(params, { sort })), { scroll: false });
        }}
        className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function ListingToolbar({ basePath, params, activeFilterCount, children }: ListingToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Remount on URL changes made elsewhere (chips, clear all) so the field mirrors the URL. */}
      <SearchForm key={params.q ?? ""} basePath={basePath} params={params} />

      <Sheet>
        <SheetTrigger render={<Button variant="outline" className="lg:hidden" />}>
          <SlidersHorizontal aria-hidden data-icon="inline-start" />
          Filters
          {activeFilterCount > 0 && (
            <Badge className="ml-1">
              {activeFilterCount}
              <span className="sr-only"> active</span>
            </Badge>
          )}
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader className="border-b">
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4">{children}</div>
          <SheetFooter className="border-t">
            <SheetClose render={<Button size="lg" />}>Show results</SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <SortSelect basePath={basePath} params={params} />
    </div>
  );
}
