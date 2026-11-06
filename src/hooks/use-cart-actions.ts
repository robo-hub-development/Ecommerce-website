import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";
import { CART_STALE_MS, cartQueryKey } from "@/hooks/use-cart";
import { ApiError } from "@/lib/api/client";
import { getCart, removeCartItem, saveCart } from "@/lib/api/cart";
import {
  addToLines,
  isSameLine,
  removeLine,
  setLineQuantity,
  toServerLines,
  type CartLineRef,
  type QuantityResult,
} from "@/lib/cart-rules";
import type { Cart, CartItem } from "@/types/cart";

type CartUpdate = (items: CartItem[]) => { items: CartItem[]; result: QuantityResult };
type CartTask = (current: CartItem[]) => Promise<{ saved: Cart; result: QuantityResult }>;

/** Add and quantity changes: edit the latest cart, then replace it with PUT /cart. */
const putUpdate =
  (update: CartUpdate): CartTask =>
  async (current) => {
    const { items, result } = update(current);
    return { saved: await saveCart(toServerLines(items)), result };
  };

/**
 * Add and quantity changes PUT the whole cart; removing a line calls DELETE /cart/items/{id}. Tasks run one at a time
 * (mutation scope) and start from the latest server cart, so two quick clicks can never overwrite each other.
 * Resolves to undefined when the request failed.
 */
export function useCartActions() {
  const queryClient = useQueryClient();
  const queryKey = cartQueryKey(useAuthStore((state) => state.user?.id));
  const mutation = useMutation({
    scope: { id: "cart" },
    mutationFn: async (task: CartTask) => {
      const current = await queryClient.fetchQuery({ queryKey, queryFn: getCart, staleTime: CART_STALE_MS });
      return task(current.items);
    },
    onSuccess: ({ saved }) => queryClient.setQueryData(queryKey, saved),
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Couldn't update your cart. Please try again.");
    },
  });

  const run = (task: CartTask) =>
    mutation.mutateAsync(task).then(
      ({ result }) => result,
      () => undefined,
    );

  return {
    pending: mutation.isPending,
    /** The backend has no variants, so lines are matched by product only. */
    add: (item: Omit<CartItem, "quantity">, quantity = 1) =>
      run(putUpdate((items) => addToLines(items, { ...item, variantId: undefined, variantLabel: undefined }, quantity))),
    setQuantity: (line: CartLineRef, quantity: number) =>
      run(putUpdate((items) => ({ items: setLineQuantity(items, line, quantity), result: "added" }))),
    remove: (line: CartLineRef) =>
      run(async (current) => {
        const lineId = current.find((item) => isSameLine(item, line))?.lineId;
        const saved = lineId
          ? await removeCartItem(lineId)
          : await saveCart(toServerLines(removeLine(current, line)));
        return { saved, result: "added" };
      }),
  };
}
