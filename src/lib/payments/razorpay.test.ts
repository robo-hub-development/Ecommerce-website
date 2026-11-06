import { afterEach, describe, expect, it, vi } from "vitest";
import { buildCheckoutOptions, openRazorpayCheckout } from "@/lib/payments/razorpay";
import type { RazorpayCheckoutOptions, RazorpayFailure, RazorpayOrder } from "@/types/payment";

const order: RazorpayOrder = { reference: "ref_1", razorpayOrderId: "order_ABC", amount: 123_450, currency: "INR" };
const prefill = { name: "Aarav", email: "a@example.com", contact: "9876543210" };
const options = buildCheckoutOptions({
  keyId: "rzp_test_key",
  order,
  businessName: "STEM ROBO HUB INDIA",
  description: "Order payment",
  prefill,
  themeColor: "#FE6B03",
});

/** A stand-in for window.Razorpay that lets each test drive the modal. */
function mockRazorpay() {
  const control: {
    options?: RazorpayCheckoutOptions;
    fail?: (response: RazorpayFailure) => void;
    open: ReturnType<typeof vi.fn>;
  } = { open: vi.fn() };
  class FakeRazorpay {
    constructor(opts: RazorpayCheckoutOptions) {
      control.options = opts;
    }
    open = control.open;
    on(_event: "payment.failed", callback: (response: RazorpayFailure) => void) {
      control.fail = callback;
    }
  }
  vi.stubGlobal("window", { Razorpay: FakeRazorpay });
  return { Razorpay: window.Razorpay!, control };
}

const payment = (id: string) => ({ razorpay_payment_id: id, razorpay_order_id: "order_ABC", razorpay_signature: "sig" });

afterEach(() => vi.unstubAllGlobals());

describe("buildCheckoutOptions", () => {
  it("uses exactly the amount, currency and order id the backend returned", () => {
    expect(options).toMatchObject({
      key: "rzp_test_key",
      order_id: "order_ABC",
      amount: 123_450,
      currency: "INR",
      name: "STEM ROBO HUB INDIA",
      prefill,
      theme: { color: "#FE6B03" },
    });
  });

  it("follows the backend amount when it changes", () => {
    const repriced = buildCheckoutOptions({
      keyId: "k",
      order: { ...order, amount: 99_900 },
      businessName: "n",
      description: "d",
      prefill,
      themeColor: "#000",
    });
    expect(repriced.amount).toBe(99_900);
  });
});

describe("openRazorpayCheckout (window.Razorpay mocked)", () => {
  it("opens the modal with the given options", () => {
    const { Razorpay, control } = mockRazorpay();
    void openRazorpayCheckout(Razorpay, options, vi.fn());
    expect(control.open).toHaveBeenCalledOnce();
    expect(control.options).toMatchObject({ key: "rzp_test_key", amount: 123_450, order_id: "order_ABC" });
  });

  it("resolves paid with the three values Razorpay returns", async () => {
    const { Razorpay, control } = mockRazorpay();
    const result = openRazorpayCheckout(Razorpay, options, vi.fn());
    control.options?.handler(payment("pay_1"));
    await expect(result).resolves.toEqual({ kind: "paid", payment: payment("pay_1") });
  });

  it("resolves dismissed, without a failure, when the shopper just closes the modal", async () => {
    const { Razorpay, control } = mockRazorpay();
    const result = openRazorpayCheckout(Razorpay, options, vi.fn());
    control.options?.modal.ondismiss();
    await expect(result).resolves.toEqual({ kind: "dismissed", lastFailure: undefined });
  });

  it("reports payment.failed without settling, then carries the reason into the dismissal", async () => {
    const { Razorpay, control } = mockRazorpay();
    const onFailed = vi.fn();
    const result = openRazorpayCheckout(Razorpay, options, onFailed);

    control.fail?.({ error: { description: "Your bank declined the payment." } });
    expect(onFailed).toHaveBeenCalledWith("Your bank declined the payment.");

    control.options?.modal.ondismiss();
    await expect(result).resolves.toEqual({ kind: "dismissed", lastFailure: "Your bank declined the payment." });
  });

  it("still succeeds when a retry inside the modal works after a failure", async () => {
    const { Razorpay, control } = mockRazorpay();
    const result = openRazorpayCheckout(Razorpay, options, vi.fn());
    control.fail?.({ error: { description: "Declined" } });
    control.options?.handler(payment("pay_2"));
    await expect(result).resolves.toEqual({ kind: "paid", payment: payment("pay_2") });
  });

  it("ignores a dismissal that arrives after a successful payment", async () => {
    const { Razorpay, control } = mockRazorpay();
    const result = openRazorpayCheckout(Razorpay, options, vi.fn());
    control.options?.handler(payment("pay_3"));
    control.options?.modal.ondismiss();
    await expect(result).resolves.toMatchObject({ kind: "paid" });
  });
});
