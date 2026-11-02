import { Suspense } from "react";
import { ArticleCard } from "@/components/home/article-card";
import { SectionShell } from "@/components/layout/section-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { StateMessage } from "@/components/ui/state-message";
import { getArticles } from "@/lib/api/blogs";

const GRID = "grid gap-6 md:grid-cols-3";

function ArticlesSkeleton() {
  return (
    <div className={GRID} aria-busy="true" aria-label="Loading articles">
      {Array.from({ length: 3 }, (_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10"
        >
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

async function Articles() {
  const articles = await getArticles().catch(() => null);
  if (articles === null) return <StateMessage variant="error" />;
  if (articles.length === 0)
    return <StateMessage variant="empty" title="No articles yet" />;

  return (
    <div className={GRID}>
      {articles.map((article) => (
        <ArticleCard key={article.slug} article={article} />
      ))}
    </div>
  );
}

export function FeaturedArticles() {
  return (
    <SectionShell
      id="articles-title"
      tone="surface"
      eyebrow="From the blog"
      title="Guides, tutorials and comparisons"
      action={{ label: "Read the blog", href: "/blog" }}
    >
      <Suspense fallback={<ArticlesSkeleton />}>
        <Articles />
      </Suspense>
    </SectionShell>
  );
}
