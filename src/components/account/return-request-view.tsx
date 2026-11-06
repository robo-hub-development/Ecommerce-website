"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ReturnForm } from "@/components/account/return-form";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StateMessage } from "@/components/ui/state-message";
import { getOrder } from "@/lib/api/orders";

/** Loads the order and shows the form only when the backend says it can be returned. */
export function ReturnRequestView({ id }: { id: string }) {
  const { data: order, isPending, isError } = useQuery({ queryKey: ["order", id], queryFn: () => getOrder(id) });

  if (isPending) return <Skeleton aria-busy="true" aria-label="Loading" className="h-80 w-full rounded-xl" />;
  if (isError) return <StateMessage variant="error" title="Couldn't load this order" />;
  if (!order.canReturn) {
    return (
      <div className="flex flex-col items-center gap-4">
        <StateMessage
          variant="empty"
          title={order.returnRequest ? "A return was already requested" : "This order isn't eligible for a return"}
          description="You can check the status or contact us from the order page."
          className="w-full"
        />
        <Link href={`/account/orders/${id}`} className={buttonVariants({ variant: "outline" })}>
          Back to order
        </Link>
      </div>
    );
  }
  return <ReturnForm orderId={order.id} orderNumber={order.orderNumber} />;
}
