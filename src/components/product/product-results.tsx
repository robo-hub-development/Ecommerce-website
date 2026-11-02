import Link from "next/link";
import { ActiveFilters } from "@/components/product/active-filters";
import { ProductCard } from "@/components/product/product-card";
import { ProductGridSkeleton } from "@/components/product/product-card-skeleton";
import { ProductGrid } from "@/components/product/product-grid";
import { buttonVariants } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { StateMessage } from "@/components/ui/state-message";
import { getCategories } from "@/lib/api/categories";
import { getProducts } from "@/lib/api/products";
import { listingHref } from "@/lib/listing";
import { LISTING_PAGE_SIZE, type ListingParams } from "@/lib/validations/listing";
import type { Category } from "@/types/content";

export function ProductResultsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-5 w-32" />
      <ProductGridSkeleton count={LISTING_PAGE_SIZE} />
    </div>
  );
}

function findCategoryName(categories: Category[], slug?: string) {
  if (!slug) return undefined;
  for (const category of categories) {
    if (category.slug === slug) return category.name;
    const child = category.children.find((c) => c.slug === slug);
    if (child) return child.name;
  }
  return undefined;
}

interface ProductResultsProps {
  basePath: string;
  params: ListingParams;
  fixedCategory?: string;
}

export async function ProductResults({ basePath, params, fixedCategory }: ProductResultsProps) {
  const data = await Promise.all([
    getProducts({
      page: params.page,
      pageSize: LISTING_PAGE_SIZE,
      category: fixedCategory ?? params.category,
      sort: params.sort,
      q: params.q,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
    }),
    fixedCategory ? Promise.resolve([]) : getCategories().catch(() => []),
  ]).catch(() => null);

  if (data === null) {
    return (
      <StateMessage
        variant="error"
        title="Couldn't load products"
        description="Please refresh the page or try again shortly."
      />
    );
  }

  const [result, categories] = data;
  const hasFilters = Boolean(
    params.q || params.category || params.minPrice !== undefined || params.maxPrice !== undefined,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <p role="status" className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{result.total}</span>{" "}
          {result.total === 1 ? "product" : "products"}
        </p>
        <ActiveFilters
          basePath={basePath}
          params={params}
          categoryName={findCategoryName(categories, params.category)}
        />
      </div>

      {result.items.length === 0 ? (
        <div className="flex flex-col items-center gap-4">
          <StateMessage
            variant="empty"
            title="No products match your filters"
            description={
              hasFilters ? "Try removing a filter or searching for something else." : "Check back soon for new items."
            }
            className="w-full"
          />
          {hasFilters && (
            <Link href={basePath} className={buttonVariants({ variant: "outline" })}>
              Clear all filters
            </Link>
          )}
        </div>
      ) : (
        <>
          <ProductGrid className="lg:grid-cols-3 xl:grid-cols-4">
            {result.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ProductGrid>
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            hrefFor={(page) => listingHref(basePath, { ...params, page })}
          />
        </>
      )}
    </div>
  );
}
