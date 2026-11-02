import Image from "next/image";
import { Suspense } from "react";
import { SectionShell } from "@/components/layout/section-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { InstagramIcon } from "@/components/ui/social-icons";
import { StateMessage } from "@/components/ui/state-message";
import { getInstagramPosts } from "@/lib/api/content";
import { siteConfig } from "@/lib/site";

const GRID = "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6";

function FeedSkeleton() {
  return (
    <div className={GRID} aria-busy="true" aria-label="Loading Instagram posts">
      {Array.from({ length: 6 }, (_, i) => (
        <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
      ))}
    </div>
  );
}

async function Feed() {
  const posts = await getInstagramPosts().catch(() => null);
  if (posts === null) return <StateMessage variant="error" />;
  if (posts.length === 0) return <StateMessage variant="empty" title="No reels yet" />;

  return (
    <ul className={GRID}>
      {posts.map((post) => (
        <li key={post.id}>
          <a
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block aspect-[3/4] overflow-hidden rounded-xl ring-1 ring-foreground/10"
          >
            <Image
              src={post.thumbnail}
              alt={post.caption}
              fill
              sizes="(min-width: 1280px) 192px, (min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition group-hover:bg-black/45 group-hover:opacity-100 group-focus-visible:bg-black/45 group-focus-visible:opacity-100">
              <InstagramIcon className="size-7" />
              <span className="sr-only">View on Instagram (opens in a new tab)</span>
            </span>
          </a>
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
      <Suspense fallback={<FeedSkeleton />}>
        <Feed />
      </Suspense>
    </SectionShell>
  );
}
