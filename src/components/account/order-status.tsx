import { Badge } from "@/components/ui/badge";
import type { OrderStatus, ReturnStatus } from "@/types/order";

const ORDER_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const RETURN_LABELS: Record<ReturnStatus, string> = {
  requested: "Requested",
  under_review: "Under review",
  approved: "Approved",
  rejected: "Rejected",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const variant = status === "cancelled" ? "destructive" : status === "delivered" ? "default" : "secondary";
  return <Badge variant={variant}>{ORDER_LABELS[status]}</Badge>;
}

export function ReturnStatusBadge({ status }: { status: ReturnStatus }) {
  const variant = status === "rejected" ? "destructive" : status === "approved" ? "default" : "secondary";
  return <Badge variant={variant}>{RETURN_LABELS[status]}</Badge>;
}
