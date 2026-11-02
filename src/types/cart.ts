export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  /** List price before discount, when discounted. */
  compareAtPrice?: number;
  image: string;
  quantity: number;
  variantId?: string;
  variantLabel?: string;
}
