"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cancelOrder } from "@/lib/api/orders";

interface CancelOrderButtonProps {
  orderId: string;
  orderNumber: string;
}

/** Only rendered when the backend says canCancel is true. Asks for confirmation first. */
export function CancelOrderButton({ orderId, orderNumber }: CancelOrderButtonProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () => cancelOrder(orderId),
    onSuccess: (order) => {
      queryClient.setQueryData(["order", orderId], order);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success(`Order ${orderNumber} has been cancelled.`);
      setOpen(false);
    },
    onError: (error) => toast.error(error.message || "Couldn't cancel this order. Please try again."),
  });

  return (
    <Dialog open={open} onOpenChange={(next) => !isPending && setOpen(next)}>
      <DialogTrigger render={<Button variant="destructive" size="lg" />}>Cancel order</DialogTrigger>
      <DialogContent className="items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-pop">
          <DialogTitle className="text-h3">Cancel order {orderNumber}?</DialogTitle>
          <p className="mt-2 text-sm text-muted-foreground">
            This can&apos;t be undone. Any payment made will be refunded as per our refund policy.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Keep order
            </Button>
            <Button variant="destructive" onClick={() => mutate()} disabled={isPending}>
              {isPending ? "Cancelling..." : "Yes, cancel order"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
