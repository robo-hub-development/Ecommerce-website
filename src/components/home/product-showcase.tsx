import { Suspense } from "react";
import { SectionShell } from "@/components/layout/section-shell";
import { ProductCard } from "@/components/product/product-card";
import { ProductGridSkeleton } from "@/components/product/product-card-skeleton";
import { ProductGrid } from "@/components/product/product-grid";
import { StateMessage } from "@/components/ui/state-message";
import { getProducts } from "@/lib/api/products";
import type { ProductListParams } from "@/types/product";

interface ProductShowcaseProps {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  viewAllHref: string;
  query: ProductListParams;
  tone?: "default" | "surface";
}

async function ShowcaseProducts({ query }: { query: ProductListParams }) {
  const result = await getProducts(query).catch(() => null);
  if (result === null) return <StateMessage variant="error" />;
  if (result.items.length === 0)
    return <StateMessage variant="empty" title="No products found" />;

  return (
    <ProductGrid>
      {result.items.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </ProductGrid>
  );
}

export function ProductShowcase({ viewAllHref, query, ...header }: ProductShowcaseProps) {
  return (
    <SectionShell {...header} action={{ label: "View all", href: viewAllHref }}>
      <Suspense fallback={<ProductGridSkeleton count={query.pageSize ?? 4} />}>
        <ShowcaseProducts query={query} />
      </Suspense>
    </SectionShell>
  );
}
