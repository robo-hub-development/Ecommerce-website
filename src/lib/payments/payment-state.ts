/** Pure state machine for one online-payment attempt. The UI renders it; `run-payment.ts` drives it. */
export type PaymentState =
  | { status: "idle" }
  | { status: "creating" }
  | { status: "awaiting_payment"; reference: string; lastFailure?: string }
  | { status: "verifying"; reference: string }
  /** Money may have moved but the backend has not confirmed: never tell the shopper it failed. */
  | { status: "pending"; reference: string }
  | { status: "failed"; reason: string }
  | { status: "cancelled" }
  | { status: "success"; orderId: string };

export type PaymentEvent =
  | { type: "start" }
  | { type: "order_created"; reference: string }
  | { type: "create_failed" }
  | { type: "payment_failed"; reason: string }
  | { type: "dismissed" }
  | { type: "paid"; reference: string }
  | { type: "verified"; orderId: string }
  | { type: "verify_uncertain"; reference: string }
  | { type: "settled"; orderId: string }
  | { type: "reset" };

export const initialPaymentState: PaymentState = { status: "idle" };

/** True while a request or the modal is in flight (or the attempt is over): the Pay button must stay disabled. */
export const isPaymentBusy = (state: PaymentState) =>
  state.status === "creating" ||
  state.status === "awaiting_payment" ||
  state.status === "verifying" ||
  state.status === "pending" ||
  state.status === "success";

export function paymentReducer(state: PaymentState, event: PaymentEvent): PaymentState {
  switch (event.type) {
    case "start":
      // A second click while anything is in flight is ignored: this is the duplicate-order guard.
      return isPaymentBusy(state) ? state : { status: "creating" };
    case "order_created":
      return state.status === "creating" ? { status: "awaiting_payment", reference: event.reference } : state;
    case "create_failed":
      return state.status === "creating" ? { status: "idle" } : state;
    case "payment_failed":
      return state.status === "awaiting_payment" ? { ...state, lastFailure: event.reason } : state;
    case "dismissed":
      if (state.status !== "awaiting_payment") return state;
      return state.lastFailure ? { status: "failed", reason: state.lastFailure } : { status: "cancelled" };
    case "paid":
      return state.status === "awaiting_payment" ? { status: "verifying", reference: event.reference } : state;
    case "verified":
      return state.status === "verifying" ? { status: "success", orderId: event.orderId } : state;
    case "verify_uncertain":
      return state.status === "verifying" ? { status: "pending", reference: event.reference } : state;
    case "settled":
      return state.status === "pending" ? { status: "success", orderId: event.orderId } : state;
    case "reset":
      return initialPaymentState;
  }
}
