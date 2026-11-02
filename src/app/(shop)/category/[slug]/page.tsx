import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { JsonLd } from "@/components/seo/json-ld";
import { ProductListing } from "@/components/product/product-listing";
import { getCategory } from "@/lib/api/categories";
import { ApiError } from "@/lib/api/client";
import { listingHref } from "@/lib/listing";
import { breadcrumbSchema, buildMetadata } from "@/lib/seo";
import { parseListingParams } from "@/lib/validations/listing";

export const revalidate = 600;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const loadCategory = cache(async (slug: string) => {
  try {
    return await getCategory(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
});

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ slug }, raw] = await Promise.all([params, searchParams]);
  const category = await loadCategory(slug);
  const listing = parseListingParams(raw);
  const basePath = `/category/${category.slug}`;
  const isFilteredView = Boolean(
    listing.q || listing.sort || listing.minPrice !== undefined || listing.maxPrice !== undefined,
  );

  return buildMetadata({
    title: listing.page > 1 ? `${category.name}, page ${listing.page}` : category.name,
    description:
      category.description ||
      `Shop ${category.name} at Stem Robo Hub. Genuine products with fast shipping across India.`,
    path: isFilteredView ? basePath : listingHref(basePath, { page: listing.page }),
    image: category.image,
    noindex: isFilteredView,
  });
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ slug }, raw] = await Promise.all([params, searchParams]);
  const category = await loadCategory(slug);
  const listing = parseListingParams(raw);
  const basePath = `/category/${category.slug}`;

  const trail = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    ...(category.parent ? [{ label: category.parent.name, href: `/category/${category.parent.slug}` }] : []),
    { label: category.name },
  ];

  return (
    <>
      <ProductListing
        basePath={basePath}
        // The category is part of the path, so it is never a query param here.
        params={{ ...listing, category: undefined }}
        fixedCategory={category.slug}
        title={category.name}
        description={category.description}
        breadcrumbs={trail}
      />
      <JsonLd
        data={breadcrumbSchema(
          trail.map((crumb) => ({
            name: crumb.label,
            path: crumb.href ?? basePath,
          })),
        )}
      />
    </>
  );
}
