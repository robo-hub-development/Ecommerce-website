import { useCallback } from "react";
import { openRazorpayCheckout, type BaseCheckoutOptions, type CheckoutResult } from "@/lib/payments/razorpay";
import { waitForRazorpay } from "@/lib/payments/razorpay-script";

/** Razorpay's theme needs a literal colour, so read our primary design token instead of hardcoding a hex. */
export function readThemeColor(): string {
  return getComputedStyle(document.documentElement).getPropertyValue("--primary").trim() || "#FE6B03";
}

/**
 * Standard Checkout on demand. The script itself is loaded by <RazorpayScript> (next/script, lazyOnload) which only the
 * checkout page renders; `openCheckout` waits for it, then opens the modal.
 */
export function useRazorpay() {
  /** Resolves once the script is usable; rejects if it failed to load. Call it before creating a payment order. */
  const ready = useCallback(() => waitForRazorpay(), []);

  const openCheckout = useCallback(
    async (options: BaseCheckoutOptions, onPaymentFailed: (reason: string) => void): Promise<CheckoutResult> =>
      openRazorpayCheckout(await waitForRazorpay(), options, onPaymentFailed),
    [],
  );

  return { ready, openCheckout };
}
