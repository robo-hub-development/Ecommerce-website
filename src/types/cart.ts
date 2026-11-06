export interface CartItem {
  /** Cart line id from the backend; needed to delete the line. */
  lineId?: string;
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

/** The caller's server cart. `id` is null until the first PUT; checkout sends it as `cartId`. */
export interface Cart {
  id: string | null;
  items: CartItem[];
}
