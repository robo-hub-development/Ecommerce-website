import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { mapInstagramPost } from "@/lib/api/mappers";
import type { InstagramPost } from "@/types/content";
import type { RawInstagramPost } from "@/types/dto";

const REVALIDATE_SECONDS = 1800;

// The backend holds the Instagram credentials; they never reach the browser.
export async function getInstagramPosts(): Promise<InstagramPost[]> {
  const raw = await api.get<RawInstagramPost[]>(ENDPOINTS.CONTENT_INSTAGRAM, {
    revalidate: REVALIDATE_SECONDS,
    tags: ["instagram"],
  });
  return raw.map(mapInstagramPost);
}
