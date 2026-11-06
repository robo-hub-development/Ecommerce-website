import Image from "next/image";
import { Play } from "lucide-react";
import { formatDate, formatTimeAgo } from "@/lib/format";
import type { YoutubeVideo } from "@/types/content";

export function VideoCard({ video }: { video: YoutubeVideo }) {
  return (
    <a href={video.url} target="_blank" rel="noopener noreferrer" className="group flex flex-col gap-3 rounded-xl">
      <span className="relative block aspect-video overflow-hidden rounded-xl ring-1 ring-foreground/10">
        <Image
          src={video.thumbnail}
          alt=""
          fill
          sizes="(min-width: 1280px) 296px, (min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/40">
          <span className="flex size-12 items-center justify-center rounded-full bg-white text-black shadow-pop">
            <Play className="size-5 translate-x-px fill-current" aria-hidden />
          </span>
        </span>
      </span>
      <span className="leading-snug font-semibold group-hover:text-primary">
        {video.title}
        <span className="sr-only"> (opens YouTube in a new tab)</span>
      </span>
      <time dateTime={video.publishedAt} title={formatDate(video.publishedAt)} className="-mt-2 text-xs text-muted-foreground">
        {formatTimeAgo(video.publishedAt)}
      </time>
    </a>
  );
}
