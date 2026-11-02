import { Suspense } from "react";
import { Breadcrumbs, type Crumb } from "@/components/layout/breadcrumbs";
import { FiltersPanel, FiltersPanelSkeleton } from "@/components/product/filters-panel";
import { ListingToolbar } from "@/components/product/listing-toolbar";
import { ProductResults, ProductResultsSkeleton } from "@/components/product/product-results";
import { listingHref } from "@/lib/listing";
import type { ListingParams } from "@/lib/validations/listing";

interface ProductListingProps {
  /** Path the filters and pagination links point at, e.g. /products or /category/drones. */
  basePath: string;
  params: ListingParams;
  title: string;
  description?: string;
  breadcrumbs: Crumb[];
  /** Set on category pages: pins the category and hides its filter group. */
  fixedCategory?: string;
}

/** Shared by /products and /category/[slug]. All state lives in the URL query string. */
export function ProductListing({
  basePath,
  params,
  title,
  description,
  breadcrumbs,
  fixedCategory,
}: ProductListingProps) {
  const filterCount =
    (!fixedCategory && params.category ? 1 : 0) +
    (params.minPrice !== undefined || params.maxPrice !== undefined ? 1 : 0);

  return (
    <div className="container-page flex flex-col gap-6 py-8 lg:py-12">
      <Breadcrumbs items={breadcrumbs} />

      <header className="flex max-w-2xl flex-col gap-2">
        <h1 className="text-h1">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </header>

      <ListingToolbar basePath={basePath} params={params} activeFilterCount={filterCount}>
        <Suspense fallback={<FiltersPanelSkeleton />}>
          <FiltersPanel basePath={basePath} params={params} fixedCategory={fixedCategory} />
        </Suspense>
      </ListingToolbar>

      <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
        <aside aria-label="Filters" className="hidden lg:block">
          <div className="sticky top-24">
            <Suspense fallback={<FiltersPanelSkeleton />}>
              <FiltersPanel basePath={basePath} params={params} fixedCategory={fixedCategory} />
            </Suspense>
          </div>
        </aside>

        {/* Keyed by URL so every filter change shows the skeleton instead of stale results. */}
        <Suspense key={listingHref(basePath, params)} fallback={<ProductResultsSkeleton />}>
          <ProductResults basePath={basePath} params={params} fixedCategory={fixedCategory} />
        </Suspense>
      </div>
    </div>
  );
}
