import type { Metadata } from "next";
import { Suspense } from "react";
import { VIDEO_GRID, VideosSkeleton } from "@/components/content/feed-grids";
import { PageIntro } from "@/components/content/page-intro";
import { VideoCard } from "@/components/content/video-card";
import { buttonVariants } from "@/components/ui/button";
import { StateMessage } from "@/components/ui/state-message";
import { getYoutubeVideos } from "@/lib/api/youtube";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const revalidate = 1800;

const FEED_LIMIT = 15;

export const metadata: Metadata = buildMetadata({
  title: "Videos: builds, unboxings and tutorials",
  description: "Watch the latest robotics builds, unboxings and tutorials from the Stem Robo Hub YouTube channel.",
  path: "/videos",
});

async function Videos() {
  const videos = await getYoutubeVideos(FEED_LIMIT).catch(() => null);
  if (videos === null) return <StateMessage variant="error" description="We couldn't load our videos right now. You can watch them on YouTube." />;
  if (videos.length === 0) return <StateMessage variant="empty" title="No videos yet" />;

  return (
    <ul className={VIDEO_GRID}>
      {videos.map((video) => (
        <li key={video.id}>
          <VideoCard video={video} />
        </li>
      ))}
    </ul>
  );
}

export default function VideosPage() {
  return (
    <div className="container-page flex flex-col gap-8 py-8 lg:py-12">
      <PageIntro
        crumbs={[{ label: "Home", href: "/" }, { label: "Videos" }]}
        title="Videos"
        description="Unboxings, builds and tutorials from the Stem Robo Hub lab."
      />
      <Suspense fallback={<VideosSkeleton count={8} />}>
        <Videos />
      </Suspense>
      <div>
        <a
          href={siteConfig.social.youtube}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          Visit our YouTube channel
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </div>
  );
}
