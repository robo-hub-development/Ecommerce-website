import "server-only";
import { env } from "@/lib/env";
import type { YoutubeVideo } from "@/types/content";

// Latest uploads come from the channel's public Atom feed: no API key, nothing secret, fetched on the server and cached with ISR.
const FEED_URL = "https://www.youtube.com/feeds/videos.xml";
const REVALIDATE_SECONDS = 1800;
const TIMEOUT_MS = 10_000;
const DEFAULT_VIDEO_LIMIT = 4;

const XML_ENTITIES: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&apos;": "'", "&#39;": "'" };

const decodeXml = (value: string) => value.replace(/&(?:amp|lt|gt|quot|apos|#39);/g, (entity) => XML_ENTITIES[entity]);

const field = (entry: string, pattern: RegExp) => {
  const match = entry.match(pattern)?.[1];
  return match ? decodeXml(match.trim()) : undefined;
};

function parseEntry(entry: string): YoutubeVideo | null {
  const id = field(entry, /<yt:videoId>([^<]+)<\/yt:videoId>/);
  const title = field(entry, /<title>([^<]+)<\/title>/);
  const url = field(entry, /<link rel="alternate" href="([^"]+)"/);
  const publishedAt = field(entry, /<published>([^<]+)<\/published>/);
  if (!id || !title || !url || !publishedAt) return null;
  // hqdefault is 4:3 with letterbox bars; the card's 16:9 object-cover crop trims exactly those bars.
  return { id, title, url, publishedAt, thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg` };
}

function channelId() {
  const id = env.youtubeChannelUrl.match(/\/channel\/(UC[\w-]+)/)?.[1];
  if (!id) throw new Error("NEXT_PUBLIC_YOUTUBE_CHANNEL_URL must look like https://www.youtube.com/channel/UC...");
  return id;
}

export async function getYoutubeVideos(limit = DEFAULT_VIDEO_LIMIT): Promise<YoutubeVideo[]> {
  const response = await fetch(`${FEED_URL}?channel_id=${channelId()}`, {
    next: { revalidate: REVALIDATE_SECONDS, tags: ["youtube"] },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`YouTube feed responded ${response.status}`);

  return (await response.text())
    .split("<entry>")
    .slice(1)
    .map(parseEntry)
    .filter((video): video is YoutubeVideo => video !== null)
    .slice(0, limit);
}
