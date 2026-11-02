import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { mapCategory } from "@/lib/api/mappers";
import type { Category } from "@/types/content";
import type { RawCategory } from "@/types/dto";

const REVALIDATE_SECONDS = 600;

export async function getCategories(): Promise<Category[]> {
  const raw = await api.get<RawCategory[]>(ENDPOINTS.CATEGORIES, {
    revalidate: REVALIDATE_SECONDS,
    tags: ["categories"],
  });
  return raw.map(mapCategory);
}

export async function getCategory(slug: string): Promise<Category> {
  const raw = await api.get<RawCategory>(ENDPOINTS.CATEGORY_BY_SLUG(slug), {
    revalidate: REVALIDATE_SECONDS,
    tags: ["categories", `category:${slug}`],
  });
  return mapCategory(raw);
}
