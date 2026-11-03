import "server-only";
import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { mapProductSuggestion } from "@/lib/api/mappers";
import type { RawProductSuggestion } from "@/types/dto";
import type { ProductSuggestion } from "@/types/product";

// Backend-facing search call. Only app/api/search uses it; the browser goes through lib/api/search.ts.

export async function fetchSearchSuggestions(q: string): Promise<ProductSuggestion[]> {
  const raw = await api.get<RawProductSuggestion[]>(ENDPOINTS.SEARCH_SUGGESTIONS, { query: { q }, cache: "no-store" });
  return raw.map(mapProductSuggestion);
}
