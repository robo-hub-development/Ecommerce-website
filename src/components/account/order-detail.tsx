"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Phone, Undo2 } from "lucide-react";
import { CancelOrderButton } from "@/components/account/cancel-order-button";
import { OrderStatusBadge, ReturnStatusBadge } from "@/components/account/order-status";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StateMessage } from "@/components/ui/state-message";
import { site } from "@/config/site";
import { ApiError } from "@/lib/api/client";
import { getOrder } from "@/lib/api/orders";
import { formatDate, formatPrice } from "@/lib/format";
import { RETURN_REASONS } from "@/types/order";

export function OrderDetail({ id }: { id: string }) {
  const { data: order, isPending, error, refetch } = useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrder(id),
    retry: (count, err) => !(err instanceof ApiError && err.status === 404) && count < 1,
  });

  if (isPending) {
    return (
      <div aria-busy="true" aria-label="Loading order" className="flex flex-col gap-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }
  if (error) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <div className="flex flex-col items-center gap-3">
        <StateMessage
          variant="error"
          title={notFound ? "Order not found" : "Couldn't load this order"}
          description={notFound ? "We couldn't find an order with that number on your account." : undefined}
          className="w-full"
        />
        {!notFound && (
          <button type="button" onClick={() => refetch()} className="text-sm font-medium text-primary hover:underline">
            Try again
          </button>
        )}
      </div>
    );
  }

  const returnRequest = order.returnRequest;
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-h2">Order {order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">
            Placed on <time dateTime={order.placedAt}>{formatDate(order.placedAt)}</time>
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <section aria-labelledby="items-heading" className="rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-6">
        <h2 id="items-heading" className="mb-4 text-h3">
          Items
        </h2>
        <ul className="divide-y">
          {order.items.map((item) => (
            <li key={item.productId} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-surface">
                <Image src={item.image} alt="" fill sizes="64px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/products/${item.slug}`} className="line-clamp-2 font-medium hover:text-primary">
                  {item.name}
                </Link>
                <p className="text-sm text-muted-foreground">Qty {item.quantity}</p>
              </div>
              <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-4 flex flex-col gap-2 border-t pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Payment method</dt>
            <dd>{order.paymentMethod === "cod" ? "Cash on delivery" : "Online payment"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Payment status</dt>
            <dd className="capitalize">{order.paymentStatus}</dd>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <dt>Total</dt>
            <dd>{formatPrice(order.total)}</dd>
          </div>
        </dl>
      </section>

      {returnRequest && (
        <section aria-labelledby="return-heading" className="rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 id="return-heading" className="text-h3">
              Return request
            </h2>
            <ReturnStatusBadge status={returnRequest.status} />
          </div>
          <dl className="grid gap-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Reason</dt>
              <dd>{RETURN_REASONS.find((r) => r.value === returnRequest.reason)?.label}</dd>
            </div>
            {returnRequest.description && (
              <div>
                <dt className="text-muted-foreground">Details</dt>
                <dd className="whitespace-pre-line">{returnRequest.description}</dd>
              </div>
            )}
            <div>
              <dt className="text-muted-foreground">Requested on</dt>
              <dd>
                <time dateTime={returnRequest.createdAt}>{formatDate(returnRequest.createdAt)}</time>
                {returnRequest.attachmentCount > 0 &&
                  ` · ${returnRequest.attachmentCount} attachment${returnRequest.attachmentCount === 1 ? "" : "s"}`}
              </dd>
            </div>
          </dl>
        </section>
      )}

      <div className="flex flex-wrap gap-3">
        <a href={site.phoneHref} className={buttonVariants({ variant: "outline", size: "lg" })}>
          <Phone aria-hidden /> Call us
        </a>
        {order.canReturn && (
          <Link href={`/account/orders/${order.id}/return`} className={buttonVariants({ variant: "outline", size: "lg" })}>
            <Undo2 aria-hidden /> Request return
          </Link>
        )}
        {order.canCancel && <CancelOrderButton orderId={order.id} orderNumber={order.orderNumber} />}
      </div>
    </div>
  );
}
