import { Suspense } from "react";
import { SectionShell } from "@/components/layout/section-shell";
import { ProductCard } from "@/components/product/product-card";
import { ProductGridSkeleton } from "@/components/product/product-card-skeleton";
import { ProductGrid } from "@/components/product/product-grid";
import { StateMessage } from "@/components/ui/state-message";
import { getRelatedProducts } from "@/lib/api/products";

async function RelatedGrid({ slug }: { slug: string }) {
  const products = await getRelatedProducts(slug).catch(() => null);
  if (products === null) return <StateMessage variant="error" />;
  if (products.length === 0) return <StateMessage variant="empty" title="No related products yet" />;

  return (
    <ProductGrid>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </ProductGrid>
  );
}

export function RelatedProducts({ slug }: { slug: string }) {
  return (
    <SectionShell
      id="related-products-title"
      tone="surface"
      eyebrow="You may also like"
      title="Related products"
    >
      <Suspense fallback={<ProductGridSkeleton count={4} />}>
        <RelatedGrid slug={slug} />
      </Suspense>
    </SectionShell>
  );
}
