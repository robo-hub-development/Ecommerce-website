import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { mapOrder, mapPaymentOutcome, mapRazorpayOrder, toCreateOrderBody } from "@/lib/api/mappers";
import type { RawPaymentOutcome, RawRazorpayOrder, RawVerifyPayment } from "@/types/dto";
import type { CreateOrderInput, Order, PaymentOutcome } from "@/types/order";
import type { RazorpayOrder, VerifyPaymentInput } from "@/types/payment";

/** Read on the payment return page and while confirming a payment, to resolve success, failure or pending. */
export async function getPaymentOutcome(reference: string): Promise<PaymentOutcome> {
  const raw = await api.get<RawPaymentOutcome>(ENDPOINTS.PAYMENT_STATUS(reference), {
    auth: true,
    cache: "no-store",
  });
  return mapPaymentOutcome(raw);
}

/**
 * GAP endpoint (see GAPS.md). The backend prices the cart and creates the Razorpay order; the returned amount (paise)
 * is the only amount the checkout modal may use.
 */
export async function createRazorpayOrder(input: Omit<CreateOrderInput, "paymentMethod">): Promise<RazorpayOrder> {
  const body = toCreateOrderBody({ ...input, paymentMethod: "online" });
  return mapRazorpayOrder(await api.post<RawRazorpayOrder>(ENDPOINTS.PAYMENT_RAZORPAY_ORDER, body, { auth: true }));
}

/** GAP endpoint. The backend verifies the signature with key_secret; the order exists once this resolves. */
export async function verifyRazorpayPayment(input: VerifyPaymentInput): Promise<Order> {
  const raw = await api.post<RawVerifyPayment>(ENDPOINTS.PAYMENT_RAZORPAY_VERIFY, input, { auth: true });
  return mapOrder(raw.order);
}
