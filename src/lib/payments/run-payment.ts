import type { PaymentEvent } from "@/lib/payments/payment-state";
import type { CheckoutResult } from "@/lib/payments/razorpay";
import type { Order } from "@/types/order";
import type { RazorpayOrder, VerifyPaymentInput } from "@/types/payment";

export interface PaymentDeps {
  /** Backend call that creates the Razorpay order (the amount comes from the server). */
  createOrder: () => Promise<RazorpayOrder>;
  /** Opens the modal; resolves when it is paid or dismissed. */
  openCheckout: (order: RazorpayOrder, onPaymentFailed: (reason: string) => void) => Promise<CheckoutResult>;
  /** Backend call that verifies the signature. */
  verify: (input: VerifyPaymentInput) => Promise<Order>;
  dispatch: (event: PaymentEvent) => void;
}

export type RunResult = { kind: "finished" } | { kind: "create_failed"; error: unknown };

/**
 * One modal payment attempt: create order -> modal -> verify. Any verify problem (error or timeout) becomes
 * `verify_uncertain`, never "failed", because the shopper may already have been charged.
 */
export async function runRazorpayPayment({ createOrder, openCheckout, verify, dispatch }: PaymentDeps): Promise<RunResult> {
  dispatch({ type: "start" });

  let order: RazorpayOrder;
  try {
    order = await createOrder();
  } catch (error) {
    dispatch({ type: "create_failed" });
    return { kind: "create_failed", error };
  }
  dispatch({ type: "order_created", reference: order.reference });

  const result = await openCheckout(order, (reason) => dispatch({ type: "payment_failed", reason }));
  if (result.kind === "dismissed") {
    dispatch({ type: "dismissed" });
    return { kind: "finished" };
  }

  dispatch({ type: "paid", reference: order.reference });
  try {
    const confirmed = await verify({
      reference: order.reference,
      razorpayPaymentId: result.payment.razorpay_payment_id,
      razorpayOrderId: result.payment.razorpay_order_id,
      razorpaySignature: result.payment.razorpay_signature,
    });
    dispatch({ type: "verified", orderId: confirmed.id });
  } catch {
    dispatch({ type: "verify_uncertain", reference: order.reference });
  }
  return { kind: "finished" };
}
