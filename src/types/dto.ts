/**
 * Raw API response shapes, exactly as the backend sends them.
 * Only lib/api/mappers.ts may consume these; the rest of the app uses the types in this folder.
 */
type Numeric = number | string;

export interface RawPaginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages?: number;
}

export interface RawProduct {
  id: string | number;
  slug: string;
  name: string;
  summary?: string | null;
  categorySlug: string;
  categoryName: string;
  price: Numeric;
  compareAtPrice?: Numeric | null;
  image: string;
  rating?: Numeric | null;
  reviewCount?: number | null;
  inStock?: boolean;
  isNew?: boolean;
  soldCount?: number | null;
}

export interface RawProductVariant {
  id: string | number;
  label: string;
  price: Numeric;
  compareAtPrice?: Numeric | null;
  inStock?: boolean;
  imageIndex?: number | null;
}

export interface RawProductDetail extends RawProduct {
  description?: string | null;
  images?: { url: string; alt?: string | null }[] | null;
  variantLabel?: string | null;
  variants?: RawProductVariant[] | null;
}

export interface RawProductFilters {
  priceRange: { min: Numeric; max: Numeric };
}

export interface RawProductSuggestion {
  slug: string;
  name: string;
  categoryName: string;
  price: Numeric;
  image: string;
}

export interface RawCategory {
  slug: string;
  name: string;
  description?: string | null;
  image: string;
  productCount?: number | null;
  children?: { slug: string; name: string }[] | null;
  parent?: { slug: string; name: string } | null;
}

export interface RawHeroSlide {
  id: string | number;
  eyebrow?: string | null;
  title: string;
  description?: string | null;
  image: string;
  imageAlt?: string | null;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string } | null;
}

export interface RawArticle {
  slug: string;
  title: string;
  excerpt?: string | null;
  image: string;
  category?: string | null;
  author?: string | null;
  publishedAt: string;
  readMinutes?: number | null;
}

export interface RawYoutubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  publishedAt: string;
}

export interface RawInstagramPost {
  id: string;
  caption?: string | null;
  thumbnail: string;
  permalink: string;
}

export interface RawUser {
  id: string | number;
  name: string;
  email: string;
  mobile: string;
}

export interface RawCurrentUser {
  user: RawUser;
}

export interface RawAuthSession extends RawCurrentUser {
  token: string;
  expiresInSeconds?: Numeric | null;
}

export interface RawOtpReceipt {
  expiresInSeconds: number;
}

export interface RawCartItem {
  productId: string | number;
  slug: string;
  name: string;
  price: Numeric;
  compareAtPrice?: Numeric | null;
  image: string;
  quantity: number;
  variantId?: string | null;
  variantLabel?: string | null;
}

export interface RawCart {
  items: RawCartItem[];
}

export type RawOrderItem = RawCartItem;

export interface RawOrder {
  id: string | number;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  items: RawOrderItem[];
  total: Numeric;
  placedAt: string;
  canCancel?: boolean;
}

export interface RawCreateOrderResult {
  order?: RawOrder | null;
  /** Payment gateway URL, present for online payments. */
  redirectUrl?: string | null;
}

export interface RawPaymentOutcome {
  status: string;
  order?: RawOrder | null;
}
