import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  addToLines,
  removeLine,
  sanitizeLines,
  setLineQuantity,
  type CartLineRef,
  type QuantityResult,
} from "@/lib/cart-rules";
import type { CartItem } from "@/types/cart";

interface CartState {
  items: CartItem[];
  /** Tells the caller whether the per-product limit trimmed or blocked the request. */
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => QuantityResult;
  setQuantity: (line: CartLineRef, quantity: number) => void;
  removeItem: (line: CartLineRef) => void;
  clear: () => void;
}

// All quantity logic lives in lib/cart-rules (pure and tested); the store only holds state.
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, quantity = 1) => {
        const { items, result } = addToLines(get().items, item, quantity);
        set({ items });
        return result;
      },
      setQuantity: (line, quantity) => set((state) => ({ items: setLineQuantity(state.items, line, quantity) })),
      removeItem: (line) => set((state) => ({ items: removeLine(state.items, line) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "robohub-cart",
      version: 1,
      // localStorage can be edited or stale: re-apply the rules on load.
      merge: (persisted, current) => ({
        ...current,
        items: sanitizeLines((persisted as Partial<CartState> | undefined)?.items),
      }),
    },
  ),
);
