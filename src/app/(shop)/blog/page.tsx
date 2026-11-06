import type { Metadata } from "next";
import { Suspense } from "react";
import { ArticleCard } from "@/components/home/article-card";
import { ARTICLE_GRID, ArticlesSkeleton } from "@/components/content/feed-grids";
import { PageIntro } from "@/components/content/page-intro";
import { StateMessage } from "@/components/ui/state-message";
import { getArticles } from "@/lib/api/blogs";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 600;

export const metadata: Metadata = buildMetadata({
  title: "Blog: robotics guides, tutorials and comparisons",
  description: "Build guides, buying advice and tutorials for robot kits, Arduino, ESP32, sensors and drones.",
  path: "/blog",
});

async function Articles() {
  const articles = await getArticles().catch(() => null);
  if (articles === null) return <StateMessage variant="error" />;
  if (articles.length === 0) return <StateMessage variant="empty" title="No articles yet" description="New guides are on the way." />;

  return (
    <div className={ARTICLE_GRID}>
      {articles.map((article) => (
        <ArticleCard key={article.slug} article={article} />
      ))}
    </div>
  );
}

export default function BlogPage() {
  return (
    <div className="container-page flex flex-col gap-8 py-8 lg:py-12">
      <PageIntro
        crumbs={[{ label: "Home", href: "/" }, { label: "Blog" }]}
        title="Blog"
        description="Guides, tutorials and comparisons to help you choose and build."
      />
      <Suspense fallback={<ArticlesSkeleton />}>
        <Articles />
      </Suspense>
    </div>
  );
}
