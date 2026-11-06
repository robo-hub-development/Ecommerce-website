"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { OrderStatusBadge } from "@/components/account/order-status";
import { buttonVariants } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { StateMessage } from "@/components/ui/state-message";
import { getOrders } from "@/lib/api/orders";
import { formatDate, formatPrice } from "@/lib/format";

export function OrdersList({ page }: { page: number }) {
  const { data, isPending, isError, refetch } = useQuery({ queryKey: ["orders", page], queryFn: () => getOrders(page) });

  if (isPending) {
    return (
      <div aria-busy="true" aria-label="Loading orders" className="flex flex-col gap-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }
  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3">
        <StateMessage variant="error" title="Couldn't load your orders" className="w-full" />
        <button type="button" onClick={() => refetch()} className="text-sm font-medium text-primary hover:underline">
          Try again
        </button>
      </div>
    );
  }
  if (data.items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4">
        <StateMessage variant="empty" title="No orders yet" description="When you place an order it will show up here." className="w-full" />
        <Link href="/products" className={buttonVariants()}>
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-3">
        {data.items.map((order) => (
          <li key={order.id}>
            <Link
              href={`/account/orders/${order.id}`}
              className="flex items-center justify-between gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10 transition-shadow hover:shadow-card-hover"
            >
              <div className="flex flex-col gap-1">
                <p className="font-semibold">{order.orderNumber}</p>
                <p className="text-sm text-muted-foreground">
                  <time dateTime={order.placedAt}>{formatDate(order.placedAt)}</time> · {order.items.length} item{order.items.length === 1 ? "" : "s"}
                </p>
                <div className="mt-1">
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{formatPrice(order.total)}</span>
                <ChevronRight className="size-5 text-muted-foreground" aria-hidden />
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <Pagination page={data.page} totalPages={data.totalPages} hrefFor={(p) => `/account/orders?page=${p}`} />
    </>
  );
}
