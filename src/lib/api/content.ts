import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { mapInstagramPost, mapYoutubeVideo } from "@/lib/api/mappers";
import type { InstagramPost, YoutubeVideo } from "@/types/content";
import type { RawInstagramPost, RawYoutubeVideo } from "@/types/dto";

const REVALIDATE_SECONDS = 1800;

// The backend holds the YouTube / Instagram credentials; they never reach the browser.
export async function getYoutubeVideos(): Promise<YoutubeVideo[]> {
  const raw = await api.get<RawYoutubeVideo[]>(ENDPOINTS.CONTENT_YOUTUBE, {
    revalidate: REVALIDATE_SECONDS,
    tags: ["youtube"],
  });
  return raw.map(mapYoutubeVideo);
}

export async function getInstagramPosts(): Promise<InstagramPost[]> {
  const raw = await api.get<RawInstagramPost[]>(ENDPOINTS.CONTENT_INSTAGRAM, {
    revalidate: REVALIDATE_SECONDS,
    tags: ["instagram"],
  });
  return raw.map(mapInstagramPost);
}

export function subscribeToNewsletter(email: string): Promise<{ subscribed: boolean }> {
  return api.post(ENDPOINTS.NEWSLETTER, { email });
}
