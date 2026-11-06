import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { mapCreateOrderResult, mapOrder, mapPaginated, mapReturnRequest, toCreateOrderBody } from "@/lib/api/mappers";
import type { Paginated } from "@/types/api";
import type { RawCreateOrderResult, RawOrder, RawPaginated, RawReturnRequest } from "@/types/dto";
import type { CreateOrderInput, CreateOrderResult, CreateReturnInput, Order, ReturnRequest } from "@/types/order";

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
  return mapCreateOrderResult(await api.post<RawCreateOrderResult>(ENDPOINTS.ORDERS, toCreateOrderBody(input), { auth: true }));
}

export async function cancelOrder(id: string): Promise<Order> {
  return mapOrder(await api.post<RawOrder>(ENDPOINTS.ORDER_CANCEL(id), undefined, { auth: true }));
}

/** Multipart: the BFF proxy forwards the files to the backend as-is. */
export async function requestReturn(orderId: string, input: CreateReturnInput): Promise<ReturnRequest> {
  const form = new FormData();
  form.set("reason", input.reason);
  form.set("description", input.description);
  for (const file of input.files) form.append("files", file);
  return mapReturnRequest(await api.post<RawReturnRequest>(ENDPOINTS.ORDER_RETURN(orderId), form, { auth: true }));
}
