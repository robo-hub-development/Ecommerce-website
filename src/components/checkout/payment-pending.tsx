"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CircleAlert, Loader2, Mail, Phone } from "lucide-react";
import { buttonVariants, Button } from "@/components/ui/button";
import { site } from "@/config/site";
import { getPaymentOutcome } from "@/lib/api/payments";
import { pollPaymentOutcome } from "@/lib/payments/poll";

interface PaymentPendingProps {
  /** Our payment reference (`GET /payments/{reference}`). */
  reference: string;
  onConfirmed: (orderId: string) => void;
}

type Phase = "checking" | "failed" | "timeout";

/**
 * Shown when money may have been taken but the order is not confirmed yet (verify failed or timed out, or the shopper
 * returned from the hosted payment page). Polls every 3s for up to 60s. It only says "failed" when the backend does;
 * after the timeout it points to support instead of guessing.
 */
export function PaymentPending({ reference, onConfirmed }: PaymentPendingProps) {
  const [phase, setPhase] = useState<Phase>("checking");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    void pollPaymentOutcome(() => getPaymentOutcome(reference), { signal: controller.signal }).then((result) => {
      if (controller.signal.aborted) return;
      if (result.status === "success" && result.order) onConfirmed(result.order.id);
      else setPhase(result.status === "failed" ? "failed" : "timeout");
    });
    return () => controller.abort();
  }, [reference, attempt, onConfirmed]);

  if (phase === "checking") {
    return (
      <div role="status" aria-live="polite" className="flex flex-col items-center gap-3 rounded-xl bg-card p-8 text-center ring-1 ring-foreground/10">
        <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
        <h2 className="text-h3">Payment received, confirming your order</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          This usually takes a few seconds. Please keep this page open and don&apos;t pay again.
        </p>
      </div>
    );
  }

  if (phase === "failed") {
    return (
      <div role="alert" className="flex flex-col items-center gap-3 rounded-xl bg-card p-8 text-center ring-1 ring-foreground/10">
        <CircleAlert className="size-8 text-destructive" aria-hidden />
        <h2 className="text-h3">Your payment didn&apos;t go through</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          No order was placed. If money was deducted it will be refunded by your bank.
        </p>
        <Link href="/checkout" className={buttonVariants({ size: "lg" })}>
          Back to checkout
        </Link>
      </div>
    );
  }

  return (
    <div role="alert" className="flex flex-col items-center gap-4 rounded-xl bg-card p-8 text-center ring-1 ring-foreground/10">
      <CircleAlert className="size-8 text-primary" aria-hidden />
      <h2 className="text-h3">We&apos;re still confirming your payment</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        We haven&apos;t been able to confirm your order yet. Please don&apos;t pay again. If you were charged, contact us and
        we&apos;ll sort it out straight away.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button type="button" size="lg" onClick={() => { setPhase("checking"); setAttempt((n) => n + 1); }}>
          Check again
        </Button>
        <a href={site.phoneHref} className={buttonVariants({ variant: "outline", size: "lg" })}>
          <Phone aria-hidden /> {site.phone}
        </a>
        <a href={site.emailHref} className={buttonVariants({ variant: "outline", size: "lg" })}>
          <Mail aria-hidden /> Email us
        </a>
      </div>
    </div>
  );
}
