export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
export type PaymentMethod = "cod" | "online";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface OrderItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  items: OrderItem[];
  total: number;
  placedAt: string;
  /** Backend decides; the UI only shows Cancel when true. */
  canCancel: boolean;
}

export interface CheckoutAddress {
  fullName: string;
  mobile: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface CreateOrderInput {
  items: { productId: string; quantity: number }[];
  address: CheckoutAddress;
  paymentMethod: PaymentMethod;
}

/** COD creates the order immediately; online payment returns a gateway URL to redirect to. */
export type CreateOrderResult =
  | { kind: "order"; order: Order }
  | { kind: "redirect"; redirectUrl: string };

export interface PaymentOutcome {
  status: "success" | "failed" | "pending";
  /** Present once the order has been created after a successful payment. */
  order?: Order;
}
