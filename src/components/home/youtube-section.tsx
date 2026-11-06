import { Suspense } from "react";
import { VIDEO_GRID, VideosSkeleton } from "@/components/content/feed-grids";
import { VideoCard } from "@/components/content/video-card";
import { SectionShell } from "@/components/layout/section-shell";
import { StateMessage } from "@/components/ui/state-message";
import { getYoutubeVideos } from "@/lib/api/youtube";

async function Videos() {
  const videos = await getYoutubeVideos().catch(() => null);
  if (videos === null) return <StateMessage variant="error" />;
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

export function YoutubeSection() {
  return (
    <SectionShell
      id="youtube-title"
      tone="dark"
      eyebrow="Watch"
      title="Latest from our YouTube channel"
      description="Unboxings, builds and tutorials from the Stem Robo Hub lab."
      action={{ label: "View all", href: '/videos' }}
    >
      <Suspense fallback={<VideosSkeleton />}>
        <Videos />
      </Suspense>
    </SectionShell>
  );
}
