import { describe, expect, it } from "vitest";
import {
  initialPaymentState,
  isPaymentBusy,
  paymentReducer,
  type PaymentEvent,
  type PaymentState,
} from "@/lib/payments/payment-state";

const run = (events: PaymentEvent[], from: PaymentState = initialPaymentState) => events.reduce(paymentReducer, from);

describe("paymentReducer", () => {
  it("goes idle -> creating -> awaiting_payment -> verifying -> success", () => {
    expect(
      run([
        { type: "start" },
        { type: "order_created", reference: "r1" },
        { type: "paid", reference: "r1" },
        { type: "verified", orderId: "o1" },
      ]),
    ).toEqual({ status: "success", orderId: "o1" });
  });

  it("treats closing the modal without a failure as cancelled", () => {
    const state = run([{ type: "start" }, { type: "order_created", reference: "r1" }, { type: "dismissed" }]);
    expect(state).toEqual({ status: "cancelled" });
    expect(isPaymentBusy(state)).toBe(false);
  });

  it("shows the failure reason when the modal closes after payment.failed, and allows a retry", () => {
    const failed = run([
      { type: "start" },
      { type: "order_created", reference: "r1" },
      { type: "payment_failed", reason: "Card declined" },
      { type: "dismissed" },
    ]);
    expect(failed).toEqual({ status: "failed", reason: "Card declined" });
    expect(run([{ type: "start" }], failed)).toEqual({ status: "creating" });
  });

  it("keeps the modal busy after payment.failed (the shopper may retry inside it)", () => {
    const state = run([
      { type: "start" },
      { type: "order_created", reference: "r1" },
      { type: "payment_failed", reason: "Declined" },
    ]);
    expect(state.status).toBe("awaiting_payment");
    expect(isPaymentBusy(state)).toBe(true);
  });

  it("goes to pending, not failed, when verification is uncertain", () => {
    const state = run([
      { type: "start" },
      { type: "order_created", reference: "r1" },
      { type: "paid", reference: "r1" },
      { type: "verify_uncertain", reference: "r1" },
    ]);
    expect(state).toEqual({ status: "pending", reference: "r1" });
    expect(run([{ type: "settled", orderId: "o9" }], state)).toEqual({ status: "success", orderId: "o9" });
  });

  it("returns to idle when creating the order fails so the shopper can retry", () => {
    expect(run([{ type: "start" }, { type: "create_failed" }])).toEqual({ status: "idle" });
  });

  it.each<PaymentState>([
    { status: "creating" },
    { status: "awaiting_payment", reference: "r1" },
    { status: "verifying", reference: "r1" },
    { status: "pending", reference: "r1" },
    { status: "success", orderId: "o1" },
  ])("ignores a second start while $status (no duplicate orders)", (state) => {
    expect(paymentReducer(state, { type: "start" })).toBe(state);
  });
});
