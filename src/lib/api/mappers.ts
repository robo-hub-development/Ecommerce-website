import type { Paginated } from "@/types/api";
import type { Cart, CartItem } from "@/types/cart";
import type { Article, ArticleDetail, Category, HeroSlide, InstagramPost } from "@/types/content";
import type {
  RawArticle,
  RawArticleDetail,
  RawAuthSession,
  RawCurrentUser,
  RawAddress,
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
  RawRazorpayOrder,
  RawReturnRequest,
  RawUser,
  RawVerifyPayment,
} from "@/types/dto";
import type {
  CheckoutAddress,
  CreateOrderInput,
  CreateOrderResult,
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentOutcome,
  PaymentStatus,
  ReturnReason,
  ReturnRequest,
  ReturnStatus,
} from "@/types/order";
import type { CheckoutAddressValues } from "@/lib/validations/checkout";
import type { RazorpayOrder } from "@/types/payment";
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

export const mapArticleDetail = (raw: RawArticleDetail, contentHtml: string): ArticleDetail => ({
  ...mapArticle(raw),
  contentHtml,
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
  lineId: raw.id ?? undefined,
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

export const mapCart = (raw: RawCart): Cart => ({ id: raw.id ?? null, items: raw.items.map(mapCartItem) });

const ORDER_STATUSES: readonly OrderStatus[] = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const PAYMENT_METHODS: readonly PaymentMethod[] = ["cod", "online"];
const PAYMENT_STATUSES: readonly PaymentStatus[] = ["pending", "paid", "failed", "refunded"];
const PAYMENT_OUTCOMES: readonly PaymentOutcome["status"][] = ["success", "failed", "pending"];

const RETURN_STATUSES: readonly ReturnStatus[] = ["requested", "under_review", "approved", "rejected"];
const RETURN_REASON_VALUES: readonly ReturnReason[] = ["damaged", "defective", "wrong_item", "missing_parts", "other"];

export const mapReturnRequest = (raw: RawReturnRequest): ReturnRequest => ({
  id: String(raw.id),
  status: pickOne(raw.status, RETURN_STATUSES, "requested"),
  reason: pickOne(raw.reason, RETURN_REASON_VALUES, "other"),
  description: raw.description ?? "",
  attachmentCount: toNumber(raw.attachmentCount),
  createdAt: raw.createdAt,
});

const mapAddress = (raw: RawAddress): CheckoutAddress => ({
  fullName: raw.fullName,
  mobile: raw.mobile,
  line1: raw.line1,
  line2: raw.line2 || undefined,
  city: raw.city,
  state: raw.state,
  pincode: raw.pincode,
});

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
  canReturn: raw.canReturn === true,
  address: raw.address ? mapAddress(raw.address) : undefined,
  estimatedDelivery: raw.estimatedDelivery ?? undefined,
  returnRequest: raw.returnRequest ? mapReturnRequest(raw.returnRequest) : undefined,
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

/** Request body for `POST /orders` (and the Razorpay-order gap endpoint, which takes the same cart + address). */
export const toCreateOrderBody = (input: CreateOrderInput) => ({
  cartId: input.cartId,
  cartItems: input.cartItemIds,
  address: { ...input.address, line2: input.address.line2 ?? "" },
  paymentMethod: input.paymentMethod,
});

/** The amount is whatever the backend created the Razorpay order with, in paise. It is never recomputed on the client. */
export const mapRazorpayOrder = (raw: RawRazorpayOrder): RazorpayOrder => ({
  reference: raw.reference,
  razorpayOrderId: raw.razorpayOrderId,
  amount: toNumber(raw.amount),
  currency: raw.currency || "INR",
});

export const mapVerifiedPayment = (raw: RawVerifyPayment): Order => mapOrder(raw.order);

/** Form values -> the backend's address. The landmark goes in `line2`; email and billing have no backend field (GAPS.md). */
export const toCheckoutAddress = (values: CheckoutAddressValues): CheckoutAddress => ({
  fullName: values.fullName,
  mobile: values.mobile,
  line1: values.line1,
  line2: values.landmark || undefined,
  city: values.city,
  state: values.state,
  pincode: values.pincode,
});
