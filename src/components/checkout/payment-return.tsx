"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PaymentPending } from "@/components/checkout/payment-pending";
import { StateMessage } from "@/components/ui/state-message";
import { confirmationPath } from "@/hooks/use-online-payment";

/** Where the backend's hosted payment page sends the shopper back: resolves the outcome by payment reference. */
export function PaymentReturn({ reference }: { reference?: string }) {
  const router = useRouter();
  const onConfirmed = useCallback((orderId: string) => router.replace(confirmationPath(orderId)), [router]);

  if (!reference) {
    return (
      <div className="flex flex-col items-center gap-3">
        <StateMessage variant="error" title="We couldn't find your payment" description="This link is missing its payment reference." className="w-full" />
        <Link href="/account/orders" className="text-sm font-medium text-primary hover:underline">
          Check My orders
        </Link>
      </div>
    );
  }
  return <PaymentPending reference={reference} onConfirmed={onConfirmed} />;
}
