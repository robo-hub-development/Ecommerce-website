import { Suspense } from "react";
import { INSTAGRAM_GRID, InstagramSkeleton } from "@/components/content/feed-grids";
import { InstagramCard } from "@/components/content/instagram-card";
import { SectionShell } from "@/components/layout/section-shell";
import { StateMessage } from "@/components/ui/state-message";
import { getInstagramPosts } from "@/lib/api/content";
import { siteConfig } from "@/lib/site";

async function Feed() {
  const posts = await getInstagramPosts().catch(() => null);
  if (posts === null) return <StateMessage variant="error" />;
  if (posts.length === 0) return <StateMessage variant="empty" title="No reels yet" />;

  return (
    <ul className={INSTAGRAM_GRID}>
      {posts.map((post) => (
        <li key={post.id}>
          <InstagramCard post={post} />
        </li>
      ))}
    </ul>
  );
}

export function InstagramSection() {
  return (
    <SectionShell
      id="instagram-title"
      eyebrow="Community"
      title="Follow our builds on Instagram"
      action={{ label: "Follow us", href: siteConfig.social.instagram }}
    >
      <Suspense fallback={<InstagramSkeleton />}>
        <Feed />
      </Suspense>
    </SectionShell>
  );
}
