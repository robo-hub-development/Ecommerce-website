import { z } from "zod";
import type { ProductSort } from "@/types/product";

export const LISTING_PAGE_SIZE = 8;

export const SORT_OPTIONS: { value: ProductSort | "featured"; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "bestselling", label: "Best selling" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

// Anything invalid in a hand-edited URL is dropped instead of erroring.
const price = z.coerce.number().int().min(0).max(10_000_000).optional().catch(undefined);

export const listingParamsSchema = z.object({
  q: z.string().trim().max(100).optional().catch(undefined),
  category: z.string().trim().max(80).optional().catch(undefined),
  sort: z.enum(["newest", "bestselling", "price-asc", "price-desc"]).optional().catch(undefined),
  minPrice: price,
  maxPrice: price,
  page: z.coerce.number().int().min(1).max(1000).catch(1).default(1),
});

export type ListingParams = z.infer<typeof listingParamsSchema>;

type RawSearchParams = Record<string, string | string[] | undefined>;

export function parseListingParams(raw: RawSearchParams): ListingParams {
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
  return listingParamsSchema.parse({
    q: first(raw.q) || undefined,
    category: first(raw.category) || undefined,
    sort: first(raw.sort),
    minPrice: first(raw.minPrice) || undefined,
    maxPrice: first(raw.maxPrice) || undefined,
    page: first(raw.page),
  });
}
