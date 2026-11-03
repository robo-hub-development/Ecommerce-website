import { http, HttpResponse } from "msw";
import { env } from "@/lib/env";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { mockPath } from "@/mocks/handlers/paths";
import { mockProducts } from "@/mocks/data/products";
import type { CartItem } from "@/types/cart";
import type { CreateOrderInput, Order } from "@/types/order";

// In-memory state: resets on server restart, which is what a mock needs.
// Cart, orders and payments are not on the backend yet; auth is, so any bearer token counts as signed in here.
const MAX_QTY = 10;

let cart: CartItem[] = [];
let orders: Order[] = [
  {
    id: "ord-1002",
    orderNumber: "SRH-1002",
    status: "confirmed",
    paymentMethod: "online",
    paymentStatus: "paid",
    items: [],
    total: 0,
    placedAt: "2026-10-28T10:15:00Z",
    canCancel: true,
  },
  {
    id: "ord-1001",
    orderNumber: "SRH-1001",
    status: "shipped",
    paymentMethod: "cod",
    paymentStatus: "pending",
    items: [],
    total: 0,
    placedAt: "2026-10-20T16:40:00Z",
    canCancel: false,
  },
].map((order, index): Order => {
  const product = mockProducts[index];
  return {
    ...(order as Order),
    items: [{ productId: product.id, slug: product.slug, name: product.name, image: product.image, price: product.price, quantity: 1 }],
    total: product.price,
  };
});

const isSignedIn = (request: Request) => Boolean(request.headers.get("authorization")?.startsWith("Bearer "));

const unauthorized = () => HttpResponse.json({ message: "Not signed in" }, { status: 401 });
const badRequest = (message: string, errors: Record<string, string> = {}) =>
  HttpResponse.json({ message, errors }, { status: 400 });

function toCartItems(lines: { productId: string; quantity: number }[]) {
  return lines.flatMap(({ productId, quantity }): CartItem[] => {
    const product = mockProducts.find((p) => p.id === productId);
    if (!product) return [];
    return [
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: Math.min(Math.max(quantity, 1), MAX_QTY),
      },
    ];
  });
}

export const accountHandlers = [
  http.get(mockPath(ENDPOINTS.CART), ({ request }) =>
    isSignedIn(request) ? HttpResponse.json({ items: cart }) : unauthorized(),
  ),

  http.put(mockPath(ENDPOINTS.CART), async ({ request }) => {
    if (!isSignedIn(request)) return unauthorized();
    const body = (await request.json()) as { items: { productId: string; quantity: number }[] };
    cart = toCartItems(body.items);
    return HttpResponse.json({ items: cart });
  }),

  http.get(mockPath(ENDPOINTS.ORDERS), ({ request }) => {
    if (!isSignedIn(request)) return unauthorized();
    return HttpResponse.json({ items: orders, page: 1, pageSize: orders.length, total: orders.length, totalPages: 1 });
  }),

  http.post(mockPath(ENDPOINTS.ORDERS), async ({ request }) => {
    if (!isSignedIn(request)) return unauthorized();
    const body = (await request.json()) as CreateOrderInput;
    const items = toCartItems(body.items);
    if (body.paymentMethod === "cod" && !(items.length === 1 && items[0].quantity === 1)) {
      return badRequest("Cash on delivery is available only for a single item.");
    }
    if (body.paymentMethod === "online") {
      return HttpResponse.json({ redirectUrl: `${env.siteUrl}/checkout/payment?reference=mock-payment` });
    }
    const order: Order = {
      id: `ord-${1003 + orders.length}`,
      orderNumber: `SRH-${1003 + orders.length}`,
      status: "confirmed",
      paymentMethod: "cod",
      paymentStatus: "pending",
      items,
      total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      placedAt: new Date().toISOString(),
      canCancel: true,
    };
    orders = [order, ...orders];
    return HttpResponse.json({ order });
  }),

  http.get(mockPath(ENDPOINTS.ORDER_BY_ID(":id")), ({ request, params }) => {
    if (!isSignedIn(request)) return unauthorized();
    const order = orders.find((o) => o.id === params.id);
    return order ? HttpResponse.json(order) : HttpResponse.json({ message: "Not found" }, { status: 404 });
  }),

  http.post(mockPath(ENDPOINTS.ORDER_CANCEL(":id")), ({ request, params }) => {
    if (!isSignedIn(request)) return unauthorized();
    const order = orders.find((o) => o.id === params.id);
    if (!order) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    if (!order.canCancel) return badRequest("This order can no longer be cancelled.");
    const cancelled: Order = { ...order, status: "cancelled", canCancel: false };
    orders = orders.map((o) => (o.id === cancelled.id ? cancelled : o));
    return HttpResponse.json(cancelled);
  }),

  http.get(mockPath(ENDPOINTS.PAYMENT_STATUS(":reference")), ({ request }) => {
    if (!isSignedIn(request)) return unauthorized();
    return HttpResponse.json({ status: "success", order: orders[0] });
  }),
];
