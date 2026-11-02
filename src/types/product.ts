export interface Product {
  id: string;
  slug: string;
  name: string;
  summary: string;
  categorySlug: string;
  categoryName: string;
  /** Selling price in INR. */
  price: number;
  /** Original price; present only when the product is discounted. */
  compareAtPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  isNew: boolean;
  soldCount: number;
}

export interface ProductImage {
  url: string;
  alt: string;
}

export interface ProductVariant {
  id: string;
  label: string;
  price: number;
  compareAtPrice?: number;
  inStock: boolean;
  /** Index into ProductDetail.images shown when this variant is selected. */
  imageIndex: number;
}

export interface ProductDetail extends Product {
  description: string;
  /** Up to 5 images; the first is the primary image. */
  images: ProductImage[];
  /** Name of what the variants choose between, e.g. "Edition". */
  variantLabel: string;
  variants: ProductVariant[];
}

export type ProductSort = "newest" | "bestselling" | "price-asc" | "price-desc";

export interface ProductListParams {
  page?: number;
  pageSize?: number;
  category?: string;
  sort?: ProductSort;
  /** Title search. */
  q?: string;
  minPrice?: number;
  maxPrice?: number;
}

/** Bounds for the price slider, for the current category / search. */
export interface ProductFilters {
  priceRange: { min: number; max: number };
}

export interface ProductSuggestion {
  slug: string;
  name: string;
  categoryName: string;
  price: number;
  image: string;
}
