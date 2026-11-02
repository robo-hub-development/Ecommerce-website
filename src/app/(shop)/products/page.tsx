import type { Metadata } from "next";
import { ProductListing } from "@/components/product/product-listing";
import { listingHref } from "@/lib/listing";
import { buildMetadata } from "@/lib/seo";
import { parseListingParams } from "@/lib/validations/listing";

export const revalidate = 300;

const BASE_PATH = "/products";
const DESCRIPTION =
  "Browse robot kits, drones, Arduino and ESP32 boards, sensors, robotic arms and motors. Filter by category and price, with fast shipping across India.";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const params = parseListingParams(await searchParams);
  // Filtered and sorted views duplicate the main listing; only the plain paginated pages are indexed.
  const isFilteredView = Boolean(
    params.q || params.category || params.sort || params.minPrice !== undefined || params.maxPrice !== undefined,
  );
  const title = params.page > 1 ? `All products, page ${params.page}` : "All products";

  return buildMetadata({
    title,
    description: DESCRIPTION,
    path: isFilteredView ? BASE_PATH : listingHref(BASE_PATH, { page: params.page }),
    noindex: isFilteredView,
  });
}

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = parseListingParams(await searchParams);

  return (
    <ProductListing
      basePath={BASE_PATH}
      params={params}
      title={params.q ? `Results for "${params.q}"` : "All products"}
      description={params.q ? undefined : "Robotics kits, drones, boards, sensors and more."}
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Products" }]}
    />
  );
}
