import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { mapHeroSlide } from "@/lib/api/mappers";
import type { HeroSlide } from "@/types/content";
import type { RawHeroSlide } from "@/types/dto";

const REVALIDATE_SECONDS = 600;

export async function getHeroSlides(): Promise<HeroSlide[]> {
  const raw = await api.get<RawHeroSlide[]>(ENDPOINTS.HERO_BANNERS, {
    revalidate: REVALIDATE_SECONDS,
    tags: ["banners"],
  });
  return raw.map(mapHeroSlide);
}
