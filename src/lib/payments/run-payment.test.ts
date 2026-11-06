import { describe, expect, it, vi } from "vitest";
import { initialPaymentState, paymentReducer, type PaymentEvent, type PaymentState } from "@/lib/payments/payment-state";
import type { CheckoutResult } from "@/lib/payments/razorpay";
import { runRazorpayPayment } from "@/lib/payments/run-payment";
import type { Order } from "@/types/order";
import type { RazorpayOrder } from "@/types/payment";

const razorpayOrder: RazorpayOrder = { reference: "ref_1", razorpayOrderId: "order_ABC", amount: 59_900, currency: "INR" };
const payment = { razorpay_payment_id: "pay_1", razorpay_order_id: "order_ABC", razorpay_signature: "sig_1" };
const confirmed = { id: "ord_1" } as Order;

function setup(
  checkout: CheckoutResult,
  verify = vi.fn().mockResolvedValue(confirmed),
  createOrder = vi.fn().mockResolvedValue(razorpayOrder),
) {
  let state: PaymentState = initialPaymentState;
  const seen: PaymentState["status"][] = [];
  const dispatch = (event: PaymentEvent) => {
    state = paymentReducer(state, event);
    seen.push(state.status);
  };
  const openCheckout = vi.fn(async () => checkout);
  const run = () => runRazorpayPayment({ createOrder, openCheckout, verify, dispatch });
  return { run, verify, openCheckout, seen, getState: () => state };
}

describe("runRazorpayPayment", () => {
  it("opens the modal with the order the backend created, then verifies the three Razorpay values", async () => {
    const t = setup({ kind: "paid", payment });
    await t.run();
    expect(t.openCheckout).toHaveBeenCalledWith(razorpayOrder, expect.any(Function));
    expect(t.verify).toHaveBeenCalledWith({
      reference: "ref_1",
      razorpayPaymentId: "pay_1",
      razorpayOrderId: "order_ABC",
      razorpaySignature: "sig_1",
    });
    expect(t.getState()).toEqual({ status: "success", orderId: "ord_1" });
  });

  it("does not call verify when the modal is dismissed", async () => {
    const t = setup({ kind: "dismissed" });
    await t.run();
    expect(t.verify).not.toHaveBeenCalled();
    expect(t.getState()).toEqual({ status: "cancelled" });
  });

  it("ends failed with the reason when the shopper leaves after payment.failed", async () => {
    let state: PaymentState = initialPaymentState;
    await runRazorpayPayment({
      createOrder: async () => razorpayOrder,
      openCheckout: async (_order, onFailed) => {
        onFailed("Your bank declined the payment.");
        return { kind: "dismissed", lastFailure: "Your bank declined the payment." };
      },
      verify: vi.fn(),
      dispatch: (event) => {
        state = paymentReducer(state, event);
      },
    });
    expect(state).toEqual({ status: "failed", reason: "Your bank declined the payment." });
  });

  it("goes to pending (never failed) when verification errors out", async () => {
    const t = setup({ kind: "paid", payment }, vi.fn().mockRejectedValue(new Error("timeout")));
    await t.run();
    expect(t.getState()).toEqual({ status: "pending", reference: "ref_1" });
    expect(t.seen).not.toContain("failed");
  });

  it("returns create_failed and stays retryable when the order cannot be created", async () => {
    const boom = new Error("network");
    const t = setup({ kind: "dismissed" }, undefined, vi.fn().mockRejectedValue(boom));
    await expect(t.run()).resolves.toEqual({ kind: "create_failed", error: boom });
    expect(t.openCheckout).not.toHaveBeenCalled();
    expect(t.getState()).toEqual({ status: "idle" });
  });
});
