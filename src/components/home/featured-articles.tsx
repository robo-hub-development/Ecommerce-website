import { Suspense } from "react";
import { ArticleCard } from "@/components/home/article-card";
import { ARTICLE_GRID, ArticlesSkeleton } from "@/components/content/feed-grids";
import { SectionShell } from "@/components/layout/section-shell";
import { StateMessage } from "@/components/ui/state-message";
import { getArticles } from "@/lib/api/blogs";

async function Articles() {
  const articles = await getArticles().catch(() => null);
  if (articles === null) return <StateMessage variant="error" />;
  if (articles.length === 0)
    return <StateMessage variant="empty" title="No articles yet" />;

  return (
    <div className={ARTICLE_GRID}>
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
