import { toast } from "sonner";
import { MAX_QUANTITY_PER_PRODUCT } from "@/lib/cart-rules";
import { useCartStore } from "@/store/cart";
import type { CartItem } from "@/types/cart";

/** Adds to the cart and tells the shopper when the per-product limit stops them. */
export function useAddToCart() {
  const addItem = useCartStore((state) => state.addItem);

  return (item: Omit<CartItem, "quantity">, quantity = 1, { announceSuccess = true } = {}) => {
    const result = addItem(item, quantity);

    if (result === "maxed") {
      toast.warning("Maximum quantity reached", {
        description: `You already have ${MAX_QUANTITY_PER_PRODUCT} of ${item.name} in your cart. That's the limit per product.`,
      });
    } else if (result === "capped") {
      toast.warning(`Limited to ${MAX_QUANTITY_PER_PRODUCT} per product`, {
        description: `We added only what fits: ${item.name} is now at ${MAX_QUANTITY_PER_PRODUCT}.`,
      });
    } else if (announceSuccess) {
      toast.success("Added to cart", { description: item.name });
    }
    return result;
  };
}
