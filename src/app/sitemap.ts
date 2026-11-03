import type { MetadataRoute } from "next";
import { getCategories } from "@/lib/api/categories";
import { getProducts } from "@/lib/api/products";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

const PAGE_SIZE = 100;

async function listProductSlugs() {
  const slugs: string[] = [];
  for (let page = 1; ; page++) {
    const { items, totalPages } = await getProducts({ page, pageSize: PAGE_SIZE });
    slugs.push(...items.map((product) => product.slug));
    if (page >= totalPages) return slugs;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["/", "/products"];
  let dynamicRoutes: string[] = [];

  try {
    const [categories, productSlugs] = await Promise.all([getCategories(), listProductSlugs()]);
    const categorySlugs = categories.flatMap((category) => [category.slug, ...category.children.map((child) => child.slug)]);
    dynamicRoutes = [
      ...categorySlugs.map((slug) => `/category/${slug}`),
      ...productSlugs.map((slug) => `/products/${slug}`),
    ];
  } catch {
    // Backend unreachable: still publish the static routes; the sitemap regenerates on the next revalidation.
  }

  return [...staticRoutes, ...dynamicRoutes].map((path) => ({ url: absoluteUrl(path) }));
}
