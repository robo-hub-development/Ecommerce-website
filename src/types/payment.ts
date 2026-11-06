/** Razorpay Standard Checkout. Only the parts this app uses; see https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/ */

/** Created by the backend; the client never computes the amount. */
export interface RazorpayOrder {
  /** Our payment reference (what `GET /payments/{reference}` takes). */
  reference: string;
  razorpayOrderId: string;
  /** Paise. */
  amount: number;
  currency: string;
}

/** Passed to the backend, which verifies the signature with key_secret. */
export interface RazorpayPaymentResult {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentInput {
  reference: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
}

export interface RazorpayCheckoutOptions {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  handler: (response: RazorpayPaymentResult) => void;
  modal: { ondismiss: () => void };
}

export interface RazorpayFailure {
  error: { code?: string; description?: string; reason?: string };
}

export interface RazorpayInstance {
  open: () => void;
  on: (event: "payment.failed", callback: (response: RazorpayFailure) => void) => void;
}

export type RazorpayConstructor = new (options: RazorpayCheckoutOptions) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}
