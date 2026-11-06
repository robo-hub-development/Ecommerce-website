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
  /** Backend decides; the UI only shows Request Return when true. */
  canReturn: boolean;
  /** Not in the current backend contract (see src/lib/api/GAPS.md); shown only when the API sends it. */
  address?: CheckoutAddress;
  /** ISO date; not in the current backend contract (see GAPS.md). */
  estimatedDelivery?: string;
  returnRequest?: ReturnRequest;
}

export type ReturnStatus = "requested" | "under_review" | "approved" | "rejected";

export const RETURN_REASONS = [
  { value: "damaged", label: "Item arrived damaged" },
  { value: "defective", label: "Item is defective or not working" },
  { value: "wrong_item", label: "Wrong item received" },
  { value: "missing_parts", label: "Parts or accessories missing" },
  { value: "other", label: "Other" },
] as const;

export type ReturnReason = (typeof RETURN_REASONS)[number]["value"];

export interface ReturnRequest {
  id: string;
  status: ReturnStatus;
  reason: ReturnReason;
  description: string;
  attachmentCount: number;
  createdAt: string;
}

export interface CreateReturnInput {
  reason: ReturnReason;
  description: string;
  /** Up to 4 photos or videos. */
  files: File[];
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

/** The server prices the order from the cart lines named here; quantities and prices never come from the client. */
export interface CreateOrderInput {
  cartId: string;
  /** Cart line ids (`CartItem.lineId`) to order. */
  cartItemIds: string[];
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
