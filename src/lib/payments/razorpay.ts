import type {
  RazorpayCheckoutOptions,
  RazorpayConstructor,
  RazorpayOrder,
  RazorpayPaymentResult,
} from "@/types/payment";

export interface CheckoutPrefill {
  name: string;
  email: string;
  contact: string;
}

interface BuildOptionsInput {
  keyId: string;
  /** Created by the backend. Its `amount` (paise) is used as-is: the client never computes a payable amount. */
  order: RazorpayOrder;
  businessName: string;
  description: string;
  prefill: CheckoutPrefill;
  themeColor: string;
}

export type BaseCheckoutOptions = Omit<RazorpayCheckoutOptions, "handler" | "modal">;

export function buildCheckoutOptions(input: BuildOptionsInput): BaseCheckoutOptions {
  return {
    key: input.keyId,
    order_id: input.order.razorpayOrderId,
    amount: input.order.amount,
    currency: input.order.currency,
    name: input.businessName,
    description: input.description,
    prefill: input.prefill,
    theme: { color: input.themeColor },
  };
}

export type CheckoutResult =
  | { kind: "paid"; payment: RazorpayPaymentResult }
  /** The shopper closed the modal. `lastFailure` is the last failed attempt's reason, if any. */
  | { kind: "dismissed"; lastFailure?: string };

/**
 * Opens Standard Checkout and settles once: on a successful payment, or when the modal closes without one.
 * `payment.failed` is not final (Razorpay lets the shopper retry inside the modal), so it is only reported through
 * `onPaymentFailed`; if the shopper then leaves, the dismissal carries the last failure reason.
 * Payment details are passed straight to the caller and never logged or stored here.
 */
export function openRazorpayCheckout(
  Razorpay: RazorpayConstructor,
  options: BaseCheckoutOptions,
  onPaymentFailed: (reason: string) => void,
): Promise<CheckoutResult> {
  return new Promise((resolve) => {
    let settled = false;
    let lastFailure: string | undefined;
    const settle = (result: CheckoutResult) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    const instance = new Razorpay({
      ...options,
      handler: (payment) => settle({ kind: "paid", payment }),
      modal: { ondismiss: () => settle({ kind: "dismissed", lastFailure }) },
    });
    instance.on("payment.failed", ({ error }) => {
      lastFailure = error.description || "The payment could not be completed.";
      onPaymentFailed(lastFailure);
    });
    instance.open();
  });
}
