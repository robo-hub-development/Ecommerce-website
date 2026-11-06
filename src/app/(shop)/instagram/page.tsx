import type { Metadata } from "next";
import { Suspense } from "react";
import { INSTAGRAM_GRID, InstagramSkeleton } from "@/components/content/feed-grids";
import { InstagramCard } from "@/components/content/instagram-card";
import { PageIntro } from "@/components/content/page-intro";
import { buttonVariants } from "@/components/ui/button";
import { StateMessage } from "@/components/ui/state-message";
import { getInstagramPosts } from "@/lib/api/content";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const revalidate = 1800;

export const metadata: Metadata = buildMetadata({
  title: "Instagram: follow our builds",
  description: "Reels and posts from the Stem Robo Hub community: robot builds, unboxings and project ideas.",
  path: "/instagram",
});

async function Feed() {
  const posts = await getInstagramPosts().catch(() => null);
  if (posts === null) return <StateMessage variant="error" description="We couldn't load our Instagram feed right now. You can view it on Instagram." />;
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

export default function InstagramPage() {
  return (
    <div className="container-page flex flex-col gap-8 py-8 lg:py-12">
      <PageIntro
        crumbs={[{ label: "Home", href: "/" }, { label: "Instagram" }]}
        title="Instagram"
        description="Follow our builds, reels and project ideas."
      />
      <Suspense fallback={<InstagramSkeleton count={12} />}>
        <Feed />
      </Suspense>
      <div>
        <a
          href={siteConfig.social.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          Follow us on Instagram
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </div>
  );
}
