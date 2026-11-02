import type { Paginated } from "@/types/api";
import type { CartItem } from "@/types/cart";
import type { Article, Category, HeroSlide, InstagramPost, YoutubeVideo } from "@/types/content";
import type {
  RawArticle,
  RawAuthSession,
  RawCurrentUser,
  RawCart,
  RawCartItem,
  RawCategory,
  RawCreateOrderResult,
  RawHeroSlide,
  RawInstagramPost,
  RawOrder,
  RawOtpReceipt,
  RawPaginated,
  RawPaymentOutcome,
  RawProduct,
  RawProductDetail,
  RawProductFilters,
  RawProductSuggestion,
  RawUser,
  RawYoutubeVideo,
} from "@/types/dto";
import type {
  CreateOrderResult,
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentOutcome,
  PaymentStatus,
} from "@/types/order";
import type { Product, ProductDetail, ProductFilters, ProductSuggestion } from "@/types/product";
import type { AuthSession, OtpReceipt, User } from "@/types/user";

// The only place that knows the backend's response shapes. If the API differs from src/types/dto.ts, edit here.

const toNumber = (value: number | string | null | undefined, fallback = 0) => {
  const parsed = typeof value === "string" ? Number(value) : value;
  return typeof parsed === "number" && Number.isFinite(parsed) ? parsed : fallback;
};

const pickOne = <T extends string>(value: string, allowed: readonly T[], fallback: T): T =>
  (allowed as readonly string[]).includes(value) ? (value as T) : fallback;

export function mapPaginated<Raw, T>(raw: RawPaginated<Raw>, mapItem: (item: Raw) => T): Paginated<T> {
  const pageSize = raw.pageSize || raw.items.length || 1;
  return {
    items: raw.items.map(mapItem),
    page: raw.page,
    pageSize,
    total: raw.total,
    totalPages: raw.totalPages ?? Math.max(1, Math.ceil(raw.total / pageSize)),
  };
}

export function mapProduct(raw: RawProduct): Product {
  const price = toNumber(raw.price);
  const compareAtPrice = toNumber(raw.compareAtPrice);
  return {
    id: String(raw.id),
    slug: raw.slug,
    name: raw.name,
    summary: raw.summary ?? "",
    categorySlug: raw.categorySlug,
    categoryName: raw.categoryName,
    price,
    compareAtPrice: compareAtPrice > price ? compareAtPrice : undefined,
    image: raw.image,
    rating: toNumber(raw.rating),
    reviewCount: toNumber(raw.reviewCount),
    inStock: raw.inStock ?? true,
    isNew: raw.isNew ?? false,
    soldCount: toNumber(raw.soldCount),
  };
}

const PRICE_STEP = 100;

export function mapProductDetail(raw: RawProductDetail): ProductDetail {
  const base = mapProduct(raw);
  const images = (raw.images ?? [])
    .slice(0, 5)
    .map((image) => ({ url: image.url, alt: image.alt || raw.name }));
  if (images.length === 0) images.push({ url: raw.image, alt: raw.name });

  const variants = (raw.variants ?? []).map((variant) => {
    const price = toNumber(variant.price);
    const compareAtPrice = toNumber(variant.compareAtPrice);
    return {
      id: String(variant.id),
      label: variant.label,
      price,
      compareAtPrice: compareAtPrice > price ? compareAtPrice : undefined,
      inStock: variant.inStock ?? true,
      imageIndex: Math.min(Math.max(toNumber(variant.imageIndex), 0), images.length - 1),
    };
  });

  return {
    ...base,
    description: raw.description ?? "",
    images,
    variantLabel: raw.variantLabel || "Option",
    variants,
  };
}

/** Rounds to the slider step so the handles can reach both ends exactly. */
export function mapProductFilters(raw: RawProductFilters): ProductFilters {
  const min = Math.floor(toNumber(raw.priceRange.min) / PRICE_STEP) * PRICE_STEP;
  const max = Math.ceil(toNumber(raw.priceRange.max) / PRICE_STEP) * PRICE_STEP;
  return { priceRange: { min, max: Math.max(max, min + PRICE_STEP) } };
}

export const mapProductSuggestion = (raw: RawProductSuggestion): ProductSuggestion => ({
  slug: raw.slug,
  name: raw.name,
  categoryName: raw.categoryName,
  price: toNumber(raw.price),
  image: raw.image,
});

export const mapCategory = (raw: RawCategory): Category => ({
  slug: raw.slug,
  name: raw.name,
  description: raw.description ?? "",
  image: raw.image,
  productCount: toNumber(raw.productCount),
  children: raw.children ?? [],
  parent: raw.parent ?? undefined,
});

export const mapHeroSlide = (raw: RawHeroSlide): HeroSlide => ({
  id: String(raw.id),
  eyebrow: raw.eyebrow ?? "",
  title: raw.title,
  description: raw.description ?? "",
  image: raw.image,
  imageAlt: raw.imageAlt ?? "",
  primaryCta: raw.primaryCta,
  secondaryCta: raw.secondaryCta ?? undefined,
});

export const mapArticle = (raw: RawArticle): Article => ({
  slug: raw.slug,
  title: raw.title,
  excerpt: raw.excerpt ?? "",
  image: raw.image,
  category: raw.category ?? "",
  author: raw.author ?? "",
  publishedAt: raw.publishedAt,
  readMinutes: toNumber(raw.readMinutes, 1),
});

export const mapYoutubeVideo = (raw: RawYoutubeVideo): YoutubeVideo => ({
  id: raw.id,
  title: raw.title,
  thumbnail: raw.thumbnail,
  url: raw.url,
  publishedAt: raw.publishedAt,
});

export const mapInstagramPost = (raw: RawInstagramPost): InstagramPost => ({
  id: raw.id,
  caption: raw.caption?.split("\n")[0]?.slice(0, 120) || "Reel by Stem Robo Hub",
  thumbnail: raw.thumbnail,
  permalink: raw.permalink,
});

export const mapUser = (raw: RawUser): User => ({
  id: String(raw.id),
  name: raw.name,
  email: raw.email,
  mobile: raw.mobile,
});

const DEFAULT_SESSION_SECONDS = 60 * 60 * 24 * 7;

export const mapCurrentUser = (raw: RawCurrentUser): User => mapUser(raw.user);

export const mapAuthSession = (raw: RawAuthSession): AuthSession => ({
  user: mapUser(raw.user),
  token: raw.token,
  maxAgeSeconds: toNumber(raw.expiresInSeconds, DEFAULT_SESSION_SECONDS),
});

export const mapOtpReceipt = (raw: RawOtpReceipt): OtpReceipt => ({
  expiresInSeconds: toNumber(raw.expiresInSeconds),
});

export const mapCartItem = (raw: RawCartItem): CartItem => ({
  productId: String(raw.productId),
  slug: raw.slug,
  name: raw.name,
  price: toNumber(raw.price),
  compareAtPrice: toNumber(raw.compareAtPrice) > toNumber(raw.price) ? toNumber(raw.compareAtPrice) : undefined,
  image: raw.image,
  quantity: toNumber(raw.quantity, 1),
  variantId: raw.variantId ?? undefined,
  variantLabel: raw.variantLabel ?? undefined,
});

export const mapCart = (raw: RawCart): CartItem[] => raw.items.map(mapCartItem);

const ORDER_STATUSES: readonly OrderStatus[] = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const PAYMENT_METHODS: readonly PaymentMethod[] = ["cod", "online"];
const PAYMENT_STATUSES: readonly PaymentStatus[] = ["pending", "paid", "failed", "refunded"];
const PAYMENT_OUTCOMES: readonly PaymentOutcome["status"][] = ["success", "failed", "pending"];

export const mapOrder = (raw: RawOrder): Order => ({
  id: String(raw.id),
  orderNumber: raw.orderNumber,
  status: pickOne(raw.status, ORDER_STATUSES, "pending"),
  paymentMethod: pickOne(raw.paymentMethod, PAYMENT_METHODS, "online"),
  paymentStatus: pickOne(raw.paymentStatus, PAYMENT_STATUSES, "pending"),
  items: raw.items.map(mapCartItem),
  total: toNumber(raw.total),
  placedAt: raw.placedAt,
  // Never infer: cancellation is allowed only when the backend says so.
  canCancel: raw.canCancel === true,
});

export function mapCreateOrderResult(raw: RawCreateOrderResult): CreateOrderResult {
  if (raw.redirectUrl) return { kind: "redirect", redirectUrl: raw.redirectUrl };
  if (raw.order) return { kind: "order", order: mapOrder(raw.order) };
  throw new Error("Order response had neither an order nor a payment redirect");
}

export const mapPaymentOutcome = (raw: RawPaymentOutcome): PaymentOutcome => ({
  status: pickOne(raw.status, PAYMENT_OUTCOMES, "pending"),
  order: raw.order ? mapOrder(raw.order) : undefined,
});
