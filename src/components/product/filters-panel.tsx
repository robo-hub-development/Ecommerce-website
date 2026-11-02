import { FilterFields } from "@/components/product/filter-fields";
import { Skeleton } from "@/components/ui/skeleton";
import { StateMessage } from "@/components/ui/state-message";
import { getCategories } from "@/lib/api/categories";
import { getProductFilters } from "@/lib/api/products";
import type { ListingParams } from "@/lib/validations/listing";

export function FiltersPanelSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-label="Loading filters">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-20" />
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}

interface FiltersPanelProps {
  basePath: string;
  params: ListingParams;
  /** Set on category pages: the category is fixed and its filter group is hidden. */
  fixedCategory?: string;
}

export async function FiltersPanel({ basePath, params, fixedCategory }: FiltersPanelProps) {
  const data = await Promise.all([
    fixedCategory ? Promise.resolve(undefined) : getCategories(),
    getProductFilters({ category: fixedCategory ?? params.category, q: params.q }),
  ]).catch(() => null);

  if (data === null) {
    return (
      <StateMessage
        variant="error"
        title="Filters unavailable"
        description="Try reloading the page."
        className="py-8"
      />
    );
  }

  const [categories, filters] = data;
  return (
    <FilterFields
      basePath={basePath}
      params={params}
      categories={categories?.map(({ slug, name, productCount }) => ({ slug, name, count: productCount }))}
      priceBounds={filters.priceRange}
    />
  );
}
