import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCartActions } from "@/hooks/use-cart-actions";
import { MAX_QUANTITY_PER_PRODUCT } from "@/lib/cart-rules";
import { useAuthStore } from "@/store/auth";
import type { CartItem } from "@/types/cart";

/**
 * Adds to the account cart and tells the shopper when the per-product limit stops them.
 * Guests are sent to sign in first (the cart lives on the account). Resolves to true when the item is in the cart.
 */
export function useAddToCart() {
  const router = useRouter();
  const pathname = usePathname();
  const signedIn = useAuthStore((state) => state.user !== null);
  const { add } = useCartActions();

  return async (item: Omit<CartItem, "quantity">, quantity = 1, { announceSuccess = true } = {}) => {
    if (!signedIn) {
      toast.info("Sign in to add items to your cart");
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return false;
    }

    const result = await add(item, quantity);
    if (!result) return false;

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
    return true;
  };
}
