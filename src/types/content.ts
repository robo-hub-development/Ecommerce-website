export interface Category {
  slug: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
  children: { slug: string; name: string }[];
  /** Set when this is a sub-category. */
  parent?: { slug: string; name: string };
}

export interface HeroSlide {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  author: string;
  publishedAt: string;
  readMinutes: number;
}

/** Detail page: the body is sanitized HTML. */
export interface ArticleDetail extends Article {
  contentHtml: string;
}

export interface YoutubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  publishedAt: string;
}

export interface InstagramPost {
  id: string;
  caption: string;
  thumbnail: string;
  permalink: string;
}
