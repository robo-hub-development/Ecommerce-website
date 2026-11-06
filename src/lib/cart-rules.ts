import type { CartItem } from "@/types/cart";

// Pure cart business rules: no React, no store, no I/O. Everything here is unit tested.

export const MAX_QUANTITY_PER_PRODUCT = 10;
/** Orders at or above this discounted subtotal ship free (INR). */
export const FREE_SHIPPING_THRESHOLD = 999;
/** Flat shipping fee below the free-shipping threshold (INR). */
export const SHIPPING_FEE = 79;

export interface CartLineRef {
  productId: string;
  variantId?: string;
}

/**
 * "added": the full quantity went in.
 * "capped": the line was topped up to the limit and part of the request was dropped.
 * "maxed": the line was already at the limit, so nothing changed.
 */
export type QuantityResult = "added" | "capped" | "maxed";

export const isSameLine = (a: CartLineRef, b: CartLineRef) =>
  a.productId === b.productId && a.variantId === b.variantId;

/** Whole number between 1 and the per-product limit. Invalid input becomes 1. */
export function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return 1;
  return Math.min(MAX_QUANTITY_PER_PRODUCT, Math.max(1, Math.floor(quantity)));
}

export function addToLines(
  items: CartItem[],
  item: Omit<CartItem, "quantity">,
  quantity = 1,
): { items: CartItem[]; result: QuantityResult } {
  const requested = clampQuantity(quantity);
  const existing = items.find((line) => isSameLine(line, item));

  if (!existing) {
    return {
      items: [...items, { ...item, quantity: requested }],
      result: quantity > MAX_QUANTITY_PER_PRODUCT ? "capped" : "added",
    };
  }
  if (existing.quantity >= MAX_QUANTITY_PER_PRODUCT) return { items, result: "maxed" };

  const total = existing.quantity + requested;
  return {
    items: items.map((line) =>
      isSameLine(line, item) ? { ...line, quantity: clampQuantity(total) } : line,
    ),
    result: total > MAX_QUANTITY_PER_PRODUCT ? "capped" : "added",
  };
}

export function setLineQuantity(items: CartItem[], line: CartLineRef, quantity: number): CartItem[] {
  return items.map((item) => (isSameLine(item, line) ? { ...item, quantity: clampQuantity(quantity) } : item));
}

export const removeLine = (items: CartItem[], line: CartLineRef): CartItem[] =>
  items.filter((item) => !isSameLine(item, line));

/** Lines in the shape `PUT /cart` accepts. The backend keys the cart by product, so variants are not sent. */
export const toServerLines = (items: CartItem[]) =>
  items.map(({ productId, quantity }) => ({ productId, quantity: clampQuantity(quantity) }));

export const countUnits = (items: CartItem[]) => items.reduce((sum, item) => sum + item.quantity, 0);

export type CodEligibility = { eligible: true } | { eligible: false; reason: string };

/** Cash on delivery is allowed only for a cart with exactly one item at quantity one. */
export function getCodEligibility(items: Pick<CartItem, "quantity">[]): CodEligibility {
  if (items.length === 0) return { eligible: false, reason: "Your cart is empty." };
  if (items.length > 1) {
    return { eligible: false, reason: "Cash on delivery is available only when your cart has a single item." };
  }
  if (items[0].quantity !== 1) {
    return { eligible: false, reason: "Cash on delivery is available only for a quantity of 1." };
  }
  return { eligible: true };
}

export interface Bill {
  /** Sum of list prices (before discounts). */
  itemsTotal: number;
  /** Savings from discounted prices; never negative. */
  discount: number;
  shipping: number;
  grandTotal: number;
  /** Amount still needed for free shipping; 0 when already free or the cart is empty. */
  amountToFreeShipping: number;
}

export function computeBill(items: Pick<CartItem, "price" | "compareAtPrice" | "quantity">[]): Bill {
  let itemsTotal = 0;
  let subtotal = 0;
  for (const item of items) {
    const listPrice = Math.max(item.compareAtPrice ?? item.price, item.price);
    itemsTotal += listPrice * item.quantity;
    subtotal += item.price * item.quantity;
  }

  const isEmpty = items.length === 0;
  const shipping = isEmpty || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  return {
    itemsTotal,
    discount: itemsTotal - subtotal,
    shipping,
    grandTotal: subtotal + shipping,
    amountToFreeShipping: isEmpty ? 0 : Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal),
  };
}
