import Image from "next/image";
import { Suspense } from "react";
import { Play } from "lucide-react";
import { SectionShell } from "@/components/layout/section-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { StateMessage } from "@/components/ui/state-message";
import { getYoutubeVideos } from "@/lib/api/youtube";
import { formatDate, formatTimeAgo } from "@/lib/format";
import { siteConfig } from "@/lib/site";

const GRID = "grid gap-6 sm:grid-cols-2 lg:grid-cols-4";

function VideosSkeleton() {
  return (
    <div className={GRID} aria-busy="true" aria-label="Loading videos">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <Skeleton className="aspect-video w-full rounded-xl" />
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      ))}
    </div>
  );
}

async function Videos() {
  const videos = await getYoutubeVideos().catch(() => null);
  if (videos === null) return <StateMessage variant="error" />;
  if (videos.length === 0) return <StateMessage variant="empty" title="No videos yet" />;

  return (
    <ul className={GRID}>
      {videos.map((video) => (
        <li key={video.id}>
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col gap-3 rounded-xl"
          >
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
            <time
              dateTime={video.publishedAt}
              title={formatDate(video.publishedAt)}
              className="-mt-2 text-xs text-muted-foreground"
            >
              {formatTimeAgo(video.publishedAt)}
            </time>
          </a>
        </li>
      ))}
    </ul>
  );
}

export function YoutubeSection() {
  return (
    <SectionShell
      id="youtube-title"
      tone="dark"
      eyebrow="Watch"
      title="Latest from our YouTube channel"
      description="Unboxings, builds and tutorials from the Stem Robo Hub lab."
      action={{ label: "Visit channel", href: siteConfig.social.youtube }}
    >
      <Suspense fallback={<VideosSkeleton />}>
        <Videos />
      </Suspense>
    </SectionShell>
  );
}
