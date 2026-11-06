import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { mapCart } from "@/lib/api/mappers";
import type { Cart, CartItem } from "@/types/cart";
import type { RawCart } from "@/types/dto";

export async function getCart(): Promise<Cart> {
  return mapCart(await api.get<RawCart>(ENDPOINTS.CART, { auth: true, cache: "no-store" }));
}

/** Removes one line (`DELETE /cart/items/{id}`) and returns the updated cart. */
export async function removeCartItem(lineId: string): Promise<Cart> {
  return mapCart(await api.delete<RawCart>(ENDPOINTS.CART_ITEM(lineId), { auth: true }));
}

/** Replaces the server cart with the given lines; the backend validates stock and the 10-per-product cap. */
export async function saveCart(items: Pick<CartItem, "productId" | "quantity">[]): Promise<Cart> {
  return mapCart(await api.put<RawCart>(ENDPOINTS.CART, { items }, { auth: true }));
}
