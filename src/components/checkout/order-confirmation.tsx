"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleAlert, CircleCheck, Clock } from "lucide-react";
import { OrderLines } from "@/components/checkout/order-lines";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StateMessage } from "@/components/ui/state-message";
import { ApiError } from "@/lib/api/client";
import { getOrder } from "@/lib/api/orders";
import { formatDate, formatPrice } from "@/lib/format";
import type { Order } from "@/types/order";

type PaymentView = { label: "Paid" | "Pending" | "Failed"; note: string; variant: "default" | "secondary" | "destructive" };

function paymentView(order: Order): PaymentView {
  if (order.paymentStatus === "paid") return { label: "Paid", note: "Payment received. Thank you!", variant: "default" };
  if (order.paymentStatus === "failed") {
    return { label: "Failed", note: "Your payment didn't go through. Please contact us to complete this order.", variant: "destructive" };
  }
  const note = order.paymentMethod === "cod" ? "Please pay in cash when your order arrives." : "We're confirming your payment.";
  return { label: "Pending", note, variant: "secondary" };
}

function ConfirmationSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading your order" className="flex flex-col gap-4">
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-56 w-full rounded-xl" />
    </div>
  );
}

const Panel = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
  <section aria-labelledby={id} className="rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-6">
    <h2 id={id} className="mb-4 text-h3">
      {title}
    </h2>
    {children}
  </section>
);

/** Loads by order id, so it works on refresh and from a bookmarked link. */
export function OrderConfirmation({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const { data: order, isPending, error, refetch } = useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrder(id),
    retry: (count, err) => !(err instanceof ApiError && err.status === 404) && count < 1,
  });

  // The order consumed the cart lines: make every cart view refetch.
  useEffect(() => {
    if (order) void queryClient.invalidateQueries({ queryKey: ["cart"] });
  }, [order, queryClient]);

  if (isPending) return <ConfirmationSkeleton />;
  if (error) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <div className="flex flex-col items-center gap-3">
        <StateMessage
          variant="error"
          title={notFound ? "Order not found" : "Couldn't load your order"}
          description={
            notFound
              ? "We couldn't find that order on your account."
              : "Your order is safe. Please try again, or check My orders."
          }
          className="w-full"
        />
        <div className="flex gap-3">
          {!notFound && (
            <button type="button" onClick={() => refetch()} className="text-sm font-medium text-primary hover:underline">
              Try again
            </button>
          )}
          <Link href="/account/orders" className="text-sm font-medium text-primary hover:underline">
            My orders
          </Link>
        </div>
      </div>
    );
  }

  const payment = paymentView(order);
  const StatusIcon = payment.label === "Paid" ? CircleCheck : payment.label === "Failed" ? CircleAlert : Clock;
  const itemsTotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // The API returns only the order total; whatever is above the item prices is shipping and other charges.
  const otherCharges = Math.max(0, order.total - itemsTotal);
  const address = order.address;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-4 rounded-xl bg-primary-soft p-4 sm:p-6">
        <StatusIcon className="mt-1 size-8 shrink-0 text-primary" aria-hidden />
        <div>
          <h1 className="text-h2">Thank you, your order is placed</h1>
          <p className="text-sm text-muted-foreground">
            Order <span className="font-semibold text-foreground">{order.orderNumber}</span> · placed on{" "}
            <time dateTime={order.placedAt}>{formatDate(order.placedAt)}</time>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">We&apos;ll email and text you updates as it ships.</p>
        </div>
      </div>

      <Panel id="items-heading" title="Items">
        <OrderLines items={order.items} />
      </Panel>

      <div className="grid gap-6 md:grid-cols-2">
        <Panel id="payment-heading" title="Payment">
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Method</dt>
              <dd>{order.paymentMethod === "cod" ? "Cash on delivery" : "Online payment"}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Status</dt>
              <dd>
                <Badge variant={payment.variant}>{payment.label}</Badge>
              </dd>
            </div>
          </dl>
          <p role="status" className="mt-3 text-sm text-muted-foreground">
            {payment.note}
          </p>
        </Panel>

        <Panel id="billing-heading" title="Billing summary">
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Items total</dt>
              <dd>{formatPrice(itemsTotal)}</dd>
            </div>
            {otherCharges > 0 && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Shipping &amp; charges</dt>
                <dd>{formatPrice(otherCharges)}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4 border-t pt-2 text-base font-semibold">
              <dt>Total</dt>
              <dd>{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </Panel>
      </div>

      {(address || order.estimatedDelivery) && (
        <Panel id="delivery-heading" title="Delivery">
          {address && (
            <address className="text-sm not-italic leading-relaxed">
              <p className="font-semibold">{address.fullName}</p>
              <p className="text-muted-foreground">{address.mobile}</p>
              <p>
                {address.line1}
                {address.line2 && `, ${address.line2}`}
              </p>
              <p>
                {address.city}, {address.state} {address.pincode}
              </p>
            </address>
          )}
          {order.estimatedDelivery && (
            <p className="mt-3 text-sm">
              Estimated delivery: <time dateTime={order.estimatedDelivery}>{formatDate(order.estimatedDelivery)}</time>
            </p>
          )}
        </Panel>
      )}

      <div className="flex flex-wrap gap-3">
        <Link href={`/account/orders/${order.id}`} className={buttonVariants({ size: "lg" })}>
          View order
        </Link>
        <Link href="/products" className={buttonVariants({ variant: "outline", size: "lg" })}>
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
