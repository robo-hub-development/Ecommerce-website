import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { mapCart } from "@/lib/api/mappers";
import type { CartItem } from "@/types/cart";
import type { RawCart } from "@/types/dto";

export async function getCart(): Promise<CartItem[]> {
  return mapCart(await api.get<RawCart>(ENDPOINTS.CART, { auth: true, cache: "no-store" }));
}

/** Replaces the server cart with the given lines; the backend validates stock and the 10-per-product cap. */
export async function saveCart(items: Pick<CartItem, "productId" | "variantId" | "quantity">[]): Promise<CartItem[]> {
  return mapCart(await api.put<RawCart>(ENDPOINTS.CART, { items }, { auth: true }));
}
