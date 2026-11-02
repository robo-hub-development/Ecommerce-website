"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Slider } from "@/components/ui/slider";
import { formatPrice } from "@/lib/format";
import { listingHref, withFilters } from "@/lib/listing";
import type { ListingParams } from "@/lib/validations/listing";
import { cn } from "@/lib/utils";

const PRICE_STEP = 100;

export interface FilterCategory {
  slug: string;
  name: string;
  count: number;
}

interface FilterFieldsProps {
  basePath: string;
  params: ListingParams;
  /** Omitted on a category page, where the category is fixed. */
  categories?: FilterCategory[];
  priceBounds: { min: number; max: number };
}

function PriceFilter({
  basePath,
  params,
  bounds,
}: {
  basePath: string;
  params: ListingParams;
  bounds: { min: number; max: number };
}) {
  const router = useRouter();
  const clamp = (value: number) => Math.min(bounds.max, Math.max(bounds.min, value));
  const [range, setRange] = useState<[number, number]>([
    clamp(params.minPrice ?? bounds.min),
    clamp(params.maxPrice ?? bounds.max),
  ]);

  const commit = ([min, max]: readonly number[]) => {
    router.push(
      listingHref(
        basePath,
        withFilters(params, {
          minPrice: min > bounds.min ? min : undefined,
          maxPrice: max < bounds.max ? max : undefined,
        }),
      ),
      { scroll: false },
    );
  };

  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="mb-3 text-sm font-semibold">Price</legend>
      <div className="px-2.5">
        <Slider
          value={range}
          min={bounds.min}
          max={bounds.max}
          step={PRICE_STEP}
          minStepsBetweenValues={1}
          thumbLabels={["Minimum price", "Maximum price"]}
          onValueChange={(value) => setRange([value[0], value[1]])}
          onValueCommitted={commit}
        />
      </div>
      <p className="flex items-center justify-between text-sm" aria-live="polite">
        <span className="rounded-md bg-muted px-2 py-1 font-medium">{formatPrice(range[0])}</span>
        <span aria-hidden className="text-muted-foreground">
          to
        </span>
        <span className="rounded-md bg-muted px-2 py-1 font-medium">{formatPrice(range[1])}</span>
      </p>
    </fieldset>
  );
}

function CategoryFilter({
  basePath,
  params,
  categories,
}: {
  basePath: string;
  params: ListingParams;
  categories: FilterCategory[];
}) {
  const itemClass = (active: boolean) =>
    cn(
      "flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted",
      active && "bg-primary-soft font-semibold text-primary hover:bg-primary-soft",
    );

  return (
    <nav aria-label="Categories">
      <h3 className="mb-3 text-sm font-semibold">Category</h3>
      <ul className="-mx-3 flex flex-col gap-0.5">
        <li>
          <Link
            href={listingHref(basePath, withFilters(params, { category: undefined }))}
            scroll={false}
            aria-current={!params.category ? "true" : undefined}
            className={itemClass(!params.category)}
          >
            All categories
          </Link>
        </li>
        {categories.map((category) => {
          const active = params.category === category.slug;
          return (
            <li key={category.slug}>
              <Link
                href={listingHref(basePath, withFilters(params, { category: category.slug }))}
                scroll={false}
                aria-current={active ? "true" : undefined}
                className={itemClass(active)}
              >
                <span>{category.name}</span>
                <span className="text-xs text-muted-foreground">{category.count}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function FilterFields({ basePath, params, categories, priceBounds }: FilterFieldsProps) {
  return (
    <div className="flex flex-col gap-8">
      {categories && <CategoryFilter basePath={basePath} params={params} categories={categories} />}
      {/* Remount when the URL range changes (chip removed, clear all) so the handles follow it. */}
      <PriceFilter
        key={`${params.minPrice}-${params.maxPrice}-${priceBounds.min}-${priceBounds.max}`}
        basePath={basePath}
        params={params}
        bounds={priceBounds}
      />
    </div>
  );
}
