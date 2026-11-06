import { Skeleton } from "@/components/ui/skeleton";

export const VIDEO_GRID = "grid gap-6 sm:grid-cols-2 lg:grid-cols-4";
export const INSTAGRAM_GRID = "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6";
export const ARTICLE_GRID = "grid gap-6 sm:grid-cols-2 lg:grid-cols-3";

export function VideosSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={VIDEO_GRID} aria-busy="true" aria-label="Loading videos">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <Skeleton className="aspect-video w-full rounded-xl" />
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      ))}
    </div>
  );
}

export function InstagramSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className={INSTAGRAM_GRID} aria-busy="true" aria-label="Loading Instagram posts">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
      ))}
    </div>
  );
}

export function ArticlesSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className={ARTICLE_GRID} aria-busy="true" aria-label="Loading articles">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
          <Skeleton className="aspect-video w-full rounded-none" />
          <div className="flex flex-col gap-3 p-5">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
