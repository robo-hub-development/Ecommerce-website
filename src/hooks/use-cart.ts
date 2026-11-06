import { useQuery } from "@tanstack/react-query";
import { useHydrated } from "@/hooks/use-hydrated";
import { getCart } from "@/lib/api/cart";
import { computeBill, countUnits, getCodEligibility } from "@/lib/cart-rules";
import { useAuthStore } from "@/store/auth";
import type { CartItem } from "@/types/cart";

/** Keyed by user so one account never sees the previous account’s cart. */
export const cartQueryKey = (userId: string | undefined) => ["cart", userId] as const;
export const CART_STALE_MS = 30_000;

const NO_ITEMS: CartItem[] = [];

/**
 * The cart lives on the account (GET /cart); nothing is kept in the browser.
 * `loading` covers hydration and the first fetch; `signedIn` is false for guests, who see a sign-in prompt instead.
 */
export function useCart() {
  const hydrated = useHydrated();
  const userId = useAuthStore((state) => state.user?.id);
  const signedIn = userId !== undefined;
  const query = useQuery({
    queryKey: cartQueryKey(userId),
    queryFn: getCart,
    enabled: hydrated && signedIn,
    staleTime: CART_STALE_MS,
  });
  const items = signedIn ? (query.data?.items ?? NO_ITEMS) : NO_ITEMS;

  return {
    signedIn: hydrated && signedIn,
    loading: !hydrated || (signedIn && query.isPending),
    error: query.isError,
    refetch: query.refetch,
    /** Null until the first item is added; checkout sends it as `cartId`. */
    cartId: query.data?.id ?? null,
    items,
    count: countUnits(items),
    bill: computeBill(items),
    cod: getCodEligibility(items),
  };
}
