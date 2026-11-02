import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import {
  mapPaginated,
  mapProduct,
  mapProductDetail,
  mapProductFilters,
  mapProductSuggestion,
} from "@/lib/api/mappers";
import type { Paginated } from "@/types/api";
import type {
  RawPaginated,
  RawProduct,
  RawProductDetail,
  RawProductFilters,
  RawProductSuggestion,
} from "@/types/dto";
import type {
  Product,
  ProductDetail,
  ProductFilters,
  ProductListParams,
  ProductSuggestion,
} from "@/types/product";

const REVALIDATE_SECONDS = 300;

export async function getProducts(params: ProductListParams = {}): Promise<Paginated<Product>> {
  const raw = await api.get<RawPaginated<RawProduct>>(ENDPOINTS.PRODUCTS, {
    query: { ...params },
    revalidate: REVALIDATE_SECONDS,
    tags: ["products"],
  });
  return mapPaginated(raw, mapProduct);
}

/** Price bounds for the current category / search, ignoring any price filter. */
export async function getProductFilters(
  params: Pick<ProductListParams, "category" | "q"> = {},
): Promise<ProductFilters> {
  const raw = await api.get<RawProductFilters>(ENDPOINTS.PRODUCT_FILTERS, {
    query: { ...params },
    revalidate: REVALIDATE_SECONDS,
    tags: ["products"],
  });
  return mapProductFilters(raw);
}

export async function getProduct(slug: string): Promise<ProductDetail> {
  const raw = await api.get<RawProductDetail>(ENDPOINTS.PRODUCT_BY_SLUG(slug), {
    revalidate: REVALIDATE_SECONDS,
    tags: ["products", `product:${slug}`],
  });
  return mapProductDetail(raw);
}

export async function getRelatedProducts(slug: string): Promise<Product[]> {
  const raw = await api.get<RawProduct[]>(ENDPOINTS.PRODUCT_RELATED(slug), {
    revalidate: REVALIDATE_SECONDS,
    tags: ["products", `product:${slug}`],
  });
  return raw.map(mapProduct);
}

export async function getSearchSuggestions(q: string, signal?: AbortSignal): Promise<ProductSuggestion[]> {
  const raw = await api.get<RawProductSuggestion[]>(ENDPOINTS.SEARCH_SUGGESTIONS, { query: { q }, signal });
  return raw.map(mapProductSuggestion);
}
