import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { ProductSuggestion } from "@/types/product";

// Browser-facing search call. It hits our own route handler, which talks to the backend.

export function getSearchSuggestions(q: string, signal?: AbortSignal): Promise<ProductSuggestion[]> {
  return api.get<ProductSuggestion[]>(ENDPOINTS.BFF_SEARCH_SUGGESTIONS, { query: { q }, sameOrigin: true, signal });
}
