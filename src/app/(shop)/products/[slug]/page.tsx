import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductView } from "@/components/product/product-view";
import { RelatedProducts } from "@/components/product/related-products";
import { JsonLd } from "@/components/seo/json-ld";
import { ApiError } from "@/lib/api/client";
import { getProduct, getProducts } from "@/lib/api/products";
import { absoluteUrl, breadcrumbSchema, buildMetadata, productSchema } from "@/lib/seo";

export const revalidate = 300;
// Slugs not generated at build time render on first request, then are cached like the rest.
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

const STATIC_PARAMS_LIMIT = 100;

const loadProduct = cache(async (slug: string) => {
  try {
    return await getProduct(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
});

export async function generateStaticParams() {
  try {
    const { items } = await getProducts({ pageSize: STATIC_PARAMS_LIMIT });
    return items.map((product) => ({ slug: product.slug }));
  } catch {
    // Backend unreachable at build time: fall back to rendering on demand.
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await loadProduct((await params).slug);
  return buildMetadata({
    title: product.name,
    description:
      product.summary || `Buy ${product.name} online at Stem Robo Hub. Genuine product with fast shipping across India.`,
    path: `/products/${product.slug}`,
    image: product.images[0]?.url,
  });
}

export default async function ProductPage({ params }: Props) {
  const product = await loadProduct((await params).slug);
  const path = `/products/${product.slug}`;

  const trail = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: product.categoryName, href: `/category/${product.categorySlug}` },
    { label: product.name },
  ];

  return (
    <>
      <div className="container-page flex flex-col gap-8 py-8 lg:gap-12 lg:py-12">
        <Breadcrumbs items={trail} />
        <ProductView product={product} shareUrl={absoluteUrl(path)} />

        <section aria-labelledby="description-title" className="max-w-3xl">
          <h2 id="description-title" className="text-h3 mb-4">
            About this product
          </h2>
          <div className="flex flex-col gap-4 text-muted-foreground">
            {product.description.split(/\n{2,}/).map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </section>
      </div>

      <RelatedProducts slug={product.slug} />

      <JsonLd data={productSchema(product)} />
      <JsonLd
        data={breadcrumbSchema(trail.map((crumb) => ({ name: crumb.label, path: crumb.href ?? path })))}
      />
    </>
  );
}
