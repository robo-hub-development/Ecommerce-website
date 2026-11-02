import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import type { Article } from "@/types/content";

export function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-card shadow-card ring-1 ring-foreground/10 transition duration-300 hover:-translate-y-0.5 hover:shadow-card-hover motion-reduce:transition-none">
      <div className="relative aspect-video overflow-hidden bg-surface">
        <Image
          src={article.image}
          alt=""
          fill
          sizes="(min-width: 1280px) 394px, (min-width: 768px) 33vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <Badge variant="secondary" className="w-fit">
          {article.category}
        </Badge>
        <h3 className="text-h3">
          <Link
            href={`/blog/${article.slug}`}
            className="rounded-sm after:absolute after:inset-0 after:content-['']"
          >
            {article.title}
          </Link>
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{article.excerpt}</p>
        <p className="mt-auto text-xs text-muted-foreground">
          {article.author} ·{" "}
          <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time> ·{" "}
          {article.readMinutes} min read
        </p>
      </div>
    </article>
  );
}
