import { bypass, http, HttpResponse, passthrough } from "msw";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { env } from "@/lib/env";
import { mockPath } from "@/mocks/handlers/paths";
import type { RawCartItem, RawOrder, RawReturnRequest } from "@/types/dto";

// MSW fallbacks for the account endpoints the backend does NOT have (see src/lib/api/GAPS.md):
//   POST /payments/razorpay/order, POST /payments/razorpay/verify, POST /orders/{id}/returns.
// Cart, orders and payment status are real: requests for them pass through to the backend, except the orders and
// payment references these fallbacks created themselves. State is in memory and resets on server restart.

const mockOrders = new Map<string, RawOrder>();
const mockPayments = new Map<string, { orderId?: string; lines: RawCartItem[] }>();

const bearer = (request: Request) => request.headers.get("authorization");
const unauthorized = () => HttpResponse.json({ message: "Not signed in" }, { status: 401 });
const badRequest = (message: string) => HttpResponse.json({ message, errors: {} }, { status: 400 });

/** Reads the real cart so the mocked Razorpay order is priced from real products. */
async function fetchRealCartLines(authorization: string, lineIds: string[]): Promise<RawCartItem[]> {
  const response = await fetch(
    bypass(`${env.apiBaseUrl}${ENDPOINTS.CART}`, { headers: { authorization, accept: "application/json" } }),
  );
  if (!response.ok) return [];
  const payload = (await response.json()) as { data?: { items?: RawCartItem[] } };
  return (payload.data?.items ?? []).filter((line) => line.id && lineIds.includes(line.id));
}

export const accountHandlers = [
  http.post(mockPath(ENDPOINTS.PAYMENT_RAZORPAY_ORDER), async ({ request }) => {
    const authorization = bearer(request);
    if (!authorization) return unauthorized();
    const body = (await request.json()) as { cartItems?: string[] };
    const lines = await fetchRealCartLines(authorization, body.cartItems ?? []);
    if (lines.length === 0) return badRequest("Your cart is empty.");

    const rupees = lines.reduce((sum, line) => sum + Number(line.price) * line.quantity, 0);
    const reference = `mock-ref-${crypto.randomUUID()}`;
    mockPayments.set(reference, { lines });
    return HttpResponse.json({
      reference,
      razorpayOrderId: `order_mock${reference.slice(-8)}`,
      amount: Math.round(rupees * 100),
      currency: "INR",
    });
  }),

  http.post(mockPath(ENDPOINTS.PAYMENT_RAZORPAY_VERIFY), async ({ request }) => {
    if (!bearer(request)) return unauthorized();
    const body = (await request.json()) as { reference: string; razorpaySignature?: string };
    const payment = mockPayments.get(body.reference);
    if (!payment) return HttpResponse.json({ message: "Unknown payment" }, { status: 404 });
    if (!body.razorpaySignature || body.razorpaySignature === "invalid") return badRequest("Payment signature mismatch.");

    const id = payment.orderId ?? crypto.randomUUID();
    const order: RawOrder = {
      id,
      orderNumber: `SRH-MOCK-${mockOrders.size + 1}`,
      status: "confirmed",
      paymentMethod: "online",
      paymentStatus: "paid",
      items: payment.lines,
      total: payment.lines.reduce((sum, line) => sum + Number(line.price) * line.quantity, 0),
      placedAt: new Date().toISOString(),
      canCancel: true,
    };
    payment.orderId = id;
    mockOrders.set(id, order);
    return HttpResponse.json({ order });
  }),

  http.get(mockPath(ENDPOINTS.ORDER_BY_ID(":id")), ({ params }) => {
    const order = mockOrders.get(String(params.id));
    return order ? HttpResponse.json(order) : passthrough();
  }),

  http.get(mockPath(ENDPOINTS.PAYMENT_STATUS(":reference")), ({ params }) => {
    const payment = mockPayments.get(String(params.reference));
    if (!payment) return passthrough();
    const order = payment.orderId ? mockOrders.get(payment.orderId) : undefined;
    return HttpResponse.json(order ? { status: "success", order } : { status: "pending" });
  }),

  http.post(mockPath(ENDPOINTS.ORDER_RETURN(":id")), async ({ request }) => {
    if (!bearer(request)) return unauthorized();
    const form = await request.formData();
    const description = String(form.get("description") ?? "");
    if (description.trim().length < 10) return badRequest("Describe the problem in a few words.");
    const returnRequest: RawReturnRequest = {
      id: crypto.randomUUID(),
      status: "requested",
      reason: String(form.get("reason") ?? "other"),
      description,
      attachmentCount: form.getAll("files").length,
      createdAt: new Date().toISOString(),
    };
    return HttpResponse.json(returnRequest);
  }),
];
