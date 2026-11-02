import { useHydrated } from "@/hooks/use-hydrated";
import { computeBill, countUnits, getCodEligibility } from "@/lib/cart-rules";
import { useCartStore } from "@/store/cart";

/** Cart lines plus derived values. `hydrated` is false until the persisted cart has loaded on the client. */
export function useCart() {
  const hydrated = useHydrated();
  const stored = useCartStore((state) => state.items);
  const items = hydrated ? stored : [];

  return {
    hydrated,
    items,
    count: countUnits(items),
    bill: computeBill(items),
    cod: getCodEligibility(items),
  };
}
