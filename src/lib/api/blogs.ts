import "server-only";
import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { sanitizeArticleHtml } from "@/lib/sanitize";
import { mapArticle, mapArticleDetail } from "@/lib/api/mappers";
import type { Article, ArticleDetail } from "@/types/content";
import type { RawArticle, RawArticleDetail } from "@/types/dto";

const REVALIDATE_SECONDS = 600;

export async function getArticles(): Promise<Article[]> {
  const raw = await api.get<RawArticle[]>(ENDPOINTS.BLOG_POSTS, {
    revalidate: REVALIDATE_SECONDS,
    tags: ["articles"],
  });
  return raw.map(mapArticle);
}

export async function getArticle(slug: string): Promise<ArticleDetail> {
  const raw = await api.get<RawArticleDetail>(ENDPOINTS.BLOG_POST_BY_SLUG(slug), {
    revalidate: REVALIDATE_SECONDS,
    tags: ["articles", `article:${slug}`],
  });
  return mapArticleDetail(raw, sanitizeArticleHtml(raw.content));
}
