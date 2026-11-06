import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ShareButton } from "@/components/product/share-button";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { ApiError } from "@/lib/api/client";
import { getArticle, getArticles } from "@/lib/api/blogs";
import { formatDate } from "@/lib/format";
import { absoluteUrl, articleSchema, breadcrumbSchema, buildMetadata } from "@/lib/seo";

export const revalidate = 600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const articles = await getArticles().catch(() => []);
  return articles.map((article) => ({ slug: article.slug }));
}

async function loadArticle(slug: string) {
  try {
    return await getArticle(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await loadArticle(slug);
  return buildMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/blog/${article.slug}`,
    image: article.image,
  });
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await loadArticle(slug);
  const path = `/blog/${article.slug}`;

  return (
    <>
      <JsonLd data={articleSchema(article)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: article.title, path },
        ])}
      />
      <article className="container-page flex flex-col gap-8 py-8 lg:py-12">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: article.title }]} />
          {article.category && (
            <Badge variant="secondary" className="w-fit">
              {article.category}
            </Badge>
          )}
          <h1 className="text-h1">{article.title}</h1>
          <p className="text-lg text-muted-foreground">{article.excerpt}</p>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
            <p>
              {article.author && <>{article.author} · </>}
              <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time> · {article.readMinutes} min read
            </p>
            <ShareButton title={article.title} url={absoluteUrl(path)} />
          </div>
        </div>

        <div className="relative mx-auto aspect-video w-full max-w-4xl overflow-hidden rounded-2xl bg-surface ring-1 ring-foreground/10">
          <Image
            src={article.image}
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 896px, 100vw"
            className="object-cover"
          />
        </div>

        {/* contentHtml is sanitized on the server (lib/sanitize.ts) before it gets here. */}
        <div
          className="prose mx-auto w-full max-w-3xl"
          dangerouslySetInnerHTML={{ __html: article.contentHtml }}
        />
      </article>
    </>
  );
}
