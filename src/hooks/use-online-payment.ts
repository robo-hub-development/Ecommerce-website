import { useCallback, useEffect, useReducer, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { site } from "@/config/site";
import { useRazorpay, readThemeColor } from "@/hooks/use-razorpay";
import { ApiError } from "@/lib/api/client";
import { createOrder } from "@/lib/api/orders";
import { createRazorpayOrder, verifyRazorpayPayment } from "@/lib/api/payments";
import { env } from "@/lib/env";
import { initialPaymentState, isPaymentBusy, paymentReducer } from "@/lib/payments/payment-state";
import { buildCheckoutOptions, type CheckoutPrefill } from "@/lib/payments/razorpay";
import { runRazorpayPayment } from "@/lib/payments/run-payment";
import type { CheckoutAddress } from "@/types/order";

interface OnlinePaymentInput {
  cartId: string;
  cartItemIds: string[];
  address: CheckoutAddress;
  prefill: CheckoutPrefill;
}

/** The backend does not serve the Razorpay-order endpoint yet (GAPS.md): use its redirect flow instead. */
const isMissingEndpoint = (error: unknown) => error instanceof ApiError && [404, 405, 501].includes(error.status);

export const confirmationPath = (orderId: string) => `/order/${orderId}/confirmation`;

const messageOf = (error: unknown) =>
  error instanceof ApiError || error instanceof Error ? error.message : "Couldn't start the payment. Please try again.";

/**
 * Pay Online. Standard Checkout modal when the backend exposes the Razorpay order/verify endpoints and a key id is
 * configured; otherwise the backend's hosted payment page (redirect), which is what it supports today.
 */
export function useOnlinePayment() {
  const router = useRouter();
  const { ready, openCheckout } = useRazorpay();
  const [state, dispatch] = useReducer(paymentReducer, initialPaymentState);
  // Synchronous guard: two clicks in the same tick must not both reach the backend.
  const inFlight = useRef(false);

  const redirectToGateway = useCallback(
    async ({ cartId, cartItemIds, address }: OnlinePaymentInput) => {
      dispatch({ type: "start" });
      try {
        const result = await createOrder({ cartId, cartItemIds, address, paymentMethod: "online" });
        if (result.kind !== "redirect") throw new Error("The payment page is unavailable.");
        window.location.assign(result.redirectUrl); // Stays "creating" (buttons disabled) while the browser navigates.
      } catch (error) {
        dispatch({ type: "create_failed" });
        toast.error(messageOf(error));
        inFlight.current = false;
      }
    },
    [],
  );

  const pay = useCallback(
    async (input: OnlinePaymentInput) => {
      if (inFlight.current) return;
      inFlight.current = true;

      if (!env.razorpayKeyId) {
        await redirectToGateway(input);
        return;
      }

      const result = await runRazorpayPayment({
        dispatch,
        createOrder: async () => {
          await ready(); // fail early if checkout.js is blocked, before any order is created
          return createRazorpayOrder({ cartId: input.cartId, cartItemIds: input.cartItemIds, address: input.address });
        },
        openCheckout: (order, onPaymentFailed) =>
          openCheckout(
            buildCheckoutOptions({
              keyId: env.razorpayKeyId,
              order, // the amount is whatever the backend created the order with
              businessName: site.name,
              description: "Order payment",
              prefill: input.prefill,
              themeColor: readThemeColor(),
            }),
            onPaymentFailed,
          ),
        verify: verifyRazorpayPayment,
      });

      if (result.kind === "create_failed") {
        if (isMissingEndpoint(result.error)) {
          await redirectToGateway(input);
          return;
        }
        toast.error(messageOf(result.error));
      }
      inFlight.current = false;
    },
    [openCheckout, ready, redirectToGateway],
  );

  const settle = useCallback((orderId: string) => dispatch({ type: "settled", orderId }), []);

  useEffect(() => {
    if (state.status === "cancelled") {
      toast("Payment cancelled", { description: "You can try again whenever you're ready." });
      dispatch({ type: "reset" });
    } else if (state.status === "success") {
      router.replace(confirmationPath(state.orderId));
    }
  }, [state, router]);

  return {
    state,
    busy: isPaymentBusy(state),
    pay,
    /** A resolved pending payment (polling found the order). */
    settle,
    reset: () => {
      inFlight.current = false;
      dispatch({ type: "reset" });
    },
  };
}
