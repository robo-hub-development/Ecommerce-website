import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { mapCreateOrderResult, mapOrder, mapPaginated, mapPaymentOutcome } from "@/lib/api/mappers";
import type { Paginated } from "@/types/api";
import type { RawCreateOrderResult, RawOrder, RawPaginated, RawPaymentOutcome } from "@/types/dto";
import type { CreateOrderInput, CreateOrderResult, Order, PaymentOutcome } from "@/types/order";

export async function getOrders(page = 1): Promise<Paginated<Order>> {
  const raw = await api.get<RawPaginated<RawOrder>>(ENDPOINTS.ORDERS, {
    query: { page },
    auth: true,
    cache: "no-store",
  });
  return mapPaginated(raw, mapOrder);
}

export async function getOrder(id: string): Promise<Order> {
  return mapOrder(await api.get<RawOrder>(ENDPOINTS.ORDER_BY_ID(id), { auth: true, cache: "no-store" }));
}

/** COD resolves to an order; online payment resolves to a gateway URL and the order is created after payment. */
export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  return mapCreateOrderResult(await api.post<RawCreateOrderResult>(ENDPOINTS.ORDERS, input, { auth: true }));
}

export async function cancelOrder(id: string): Promise<Order> {
  return mapOrder(await api.post<RawOrder>(ENDPOINTS.ORDER_CANCEL(id), undefined, { auth: true }));
}

/** Read on the payment return page to resolve success, failure or pending. */
export async function getPaymentOutcome(reference: string): Promise<PaymentOutcome> {
  const raw = await api.get<RawPaymentOutcome>(ENDPOINTS.PAYMENT_STATUS(reference), {
    auth: true,
    cache: "no-store",
  });
  return mapPaymentOutcome(raw);
}
