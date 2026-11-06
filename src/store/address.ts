import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CheckoutAddressValues } from "@/lib/validations/checkout";

interface AddressState {
  /**
   * The backend has no saved-address endpoint (see src/lib/api/GAPS.md), so the last checkout address is kept on this
   * device, per account. Replace this store with an address service when the endpoint exists.
   */
  byUser: Record<string, CheckoutAddressValues>;
  save: (userId: string, address: CheckoutAddressValues) => void;
}

export const useAddressStore = create<AddressState>()(
  persist(
    (set) => ({
      byUser: {},
      save: (userId, address) => set((state) => ({ byUser: { ...state.byUser, [userId]: address } })),
    }),
    { name: "robohub-address" },
  ),
);
