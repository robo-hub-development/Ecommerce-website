import type { ListingParams } from "@/lib/validations/listing";

/** Builds a listing URL from params; defaults (page 1, no filters) are omitted to keep URLs canonical. */
export function listingHref(basePath: string, params: Partial<ListingParams>) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.category) search.set("category", params.category);
  if (params.sort) search.set("sort", params.sort);
  if (params.minPrice !== undefined) search.set("minPrice", String(params.minPrice));
  if (params.maxPrice !== undefined) search.set("maxPrice", String(params.maxPrice));
  if (params.page && params.page > 1) search.set("page", String(params.page));
  const query = search.toString();
  return query ? `${basePath}?${query}` : basePath;
}

/** Applies a filter change: always returns to page 1. */
export const withFilters = (current: ListingParams, patch: Partial<ListingParams>): ListingParams => ({
  ...current,
  ...patch,
  page: 1,
});
