"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { CircleAlert, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BillBreakdown } from "@/components/cart/bill-breakdown";
import { CartEmpty } from "@/components/cart/cart-empty";
import { CartError } from "@/components/cart/cart-states";
import { AddressCard } from "@/components/checkout/address-card";
import { AddressForm } from "@/components/checkout/address-form";
import { LegalLinks } from "@/components/checkout/legal-links";
import { OrderLines } from "@/components/checkout/order-lines";
import { PaymentOptions } from "@/components/checkout/payment-options";
import { PaymentPending } from "@/components/checkout/payment-pending";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { confirmationPath, useOnlinePayment } from "@/hooks/use-online-payment";
import { useCart } from "@/hooks/use-cart";
import { ApiError } from "@/lib/api/client";
import { toCheckoutAddress } from "@/lib/api/mappers";
import { createOrder } from "@/lib/api/orders";
import { formatPrice } from "@/lib/format";
import type { CheckoutAddressValues } from "@/lib/validations/checkout";
import { useAddressStore } from "@/store/address";
import { useAuthStore } from "@/store/auth";
import type { PaymentMethod } from "@/types/order";

const Card = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
  <section aria-labelledby={id} className="rounded-xl bg-card p-4 shadow-card ring-1 ring-foreground/10 sm:p-6">
    <h2 id={id} className="text-h3 mb-4">
      {title}
    </h2>
    {children}
  </section>
);

function CheckoutSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]" aria-busy="true" aria-label="Loading checkout">
      <div className="flex flex-col gap-6">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
      <Skeleton className="h-80 rounded-xl" />
    </div>
  );
}

/** The last 10 digits, so "+91 98765 43210" from the account profile fits the 10-digit field. */
const tenDigits = (value: string) => value.replace(/\D/g, "").slice(-10);

export function CheckoutView() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { signedIn, loading, error, refetch, cartId, items, bill, cod } = useCart();
  const saved = useAddressStore((state) => (user ? state.byUser[user.id] : undefined));
  const saveAddress = useAddressStore((state) => state.save);
  const [editing, setEditing] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>("online");
  const online = useOnlinePayment();

  const goToConfirmation = useCallback((orderId: string) => router.replace(confirmationPath(orderId)), [router]);

  const cashOnDelivery = useMutation({
    mutationFn: (input: Parameters<typeof createOrder>[0]) => createOrder(input),
    onSuccess: (result) => {
      if (result.kind === "order") goToConfirmation(result.order.id);
      else toast.error("Couldn't place your order. Please try again.");
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Couldn't place your order. Please try again."),
  });

  if (loading || !signedIn || !user) return <CheckoutSkeleton />;
  if (error) {
    return (
      <div className="rounded-xl border border-dashed bg-surface">
        <CartError onRetry={() => void refetch()} />
      </div>
    );
  }
  if (items.length === 0 || !cartId) {
    return (
      <div className="rounded-xl border border-dashed bg-surface">
        <CartEmpty />
      </div>
    );
  }
  if (online.state.status === "pending") {
    return <PaymentPending reference={online.state.reference} onConfirmed={online.settle} />;
  }

  const busy = online.busy || cashOnDelivery.isPending;
  const showForm = editing || !saved;
  // COD can become ineligible after a cart change: never submit it then.
  const selected: PaymentMethod = method === "cod" && !cod.eligible ? "online" : method;
  const lineIds = items.flatMap((item) => (item.lineId ? [item.lineId] : []));

  const initialAddress: CheckoutAddressValues = saved ?? {
    fullName: user.name,
    mobile: tenDigits(user.mobile),
    email: user.email,
    line1: "",
    landmark: "",
    pincode: "",
    state: "",
    city: "",
    billingSameAsShipping: true,
  };

  const submit = () => {
    if (!saved || busy) return;
    if (lineIds.length !== items.length) {
      toast.error("Your cart is out of date. Please refresh and try again.");
      void refetch();
      return;
    }
    const address = toCheckoutAddress(saved);
    if (selected === "cod") {
      cashOnDelivery.mutate({ cartId, cartItemIds: lineIds, address, paymentMethod: "cod" });
    } else {
      void online.pay({
        cartId,
        cartItemIds: lineIds,
        address,
        prefill: { name: saved.fullName, email: saved.email, contact: saved.mobile },
      });
    }
  };

  const failedReason = online.state.status === "failed" ? online.state.reason : undefined;
  const ctaLabel = failedReason ? "Retry payment" : selected === "cod" ? "Place order" : `Pay ${formatPrice(bill.grandTotal)}`;

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="flex flex-col gap-6">
        <Card id="address-title" title="Delivery address">
          {showForm ? (
            <AddressForm
              defaultValues={initialAddress}
              submitLabel="Save address"
              disabled={busy}
              onCancel={saved ? () => setEditing(false) : undefined}
              onSubmit={(values) => {
                saveAddress(user.id, values);
                setEditing(false);
              }}
            />
          ) : (
            <AddressCard address={saved} disabled={busy} onEdit={() => setEditing(true)} />
          )}
        </Card>

        <Card id="payment-title" title="Payment">
          <PaymentOptions value={selected} cod={cod} disabled={busy} onChange={setMethod} />
        </Card>
      </div>

      <aside
        aria-labelledby="summary-title"
        className="flex flex-col gap-4 rounded-xl bg-card p-4 shadow-card ring-1 ring-foreground/10 sm:p-6 lg:sticky lg:top-24"
      >
        <h2 id="summary-title" className="text-h3">
          Order summary
        </h2>
        <OrderLines items={items} />
        <div className="border-t pt-4">
          <BillBreakdown bill={bill} />
        </div>

        {failedReason && (
          <p role="alert" className="flex gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>Payment failed: {failedReason} You can try again.</span>
          </p>
        )}

        <Button type="button" size="lg" onClick={submit} disabled={busy || showForm} aria-busy={busy}>
          {busy && <Loader2 className="animate-spin" aria-hidden />}
          {busy ? "Processing…" : ctaLabel}
        </Button>
        {showForm && <p className="text-center text-xs text-muted-foreground">Save your delivery address to continue.</p>}
        <LegalLinks />
      </aside>
    </div>
  );
}
