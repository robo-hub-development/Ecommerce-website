import Link from "next/link";
import { BadgeCheck, Info } from "lucide-react";
import { BillBreakdown } from "@/components/cart/bill-breakdown";
import { LegalLinks } from "@/components/checkout/legal-links";
import { buttonVariants } from "@/components/ui/button";
import type { Bill, CodEligibility } from "@/lib/cart-rules";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

interface CartSummaryProps {
  bill: Bill;
  cod: CodEligibility;
  /** Hide the COD note and shipping nudge for the compact mini cart. */
  compact?: boolean;
  onNavigate?: () => void;
}

export function CartSummary({ bill, cod, compact, onNavigate }: CartSummaryProps) {
  return (
    <div className="flex flex-col gap-4">
      <BillBreakdown bill={bill} />

      {!compact && bill.amountToFreeShipping > 0 && (
        <p className="flex gap-2 rounded-lg bg-primary-soft p-3 text-sm text-primary">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          Add {formatPrice(bill.amountToFreeShipping)} more to get free shipping.
        </p>
      )}

      {!compact && (
        <p
          role="status"
          className={cn(
            "flex gap-2 rounded-lg p-3 text-sm",
            cod.eligible ? "bg-success/10 text-foreground" : "bg-muted text-muted-foreground",
          )}
        >
          {cod.eligible ? (
            <BadgeCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
          ) : (
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          )}
          {cod.eligible ? "Cash on delivery is available for this order." : `COD unavailable. ${cod.reason}`}
        </p>
      )}

      <Link href="/checkout" onClick={onNavigate} className={buttonVariants({ size: "lg" })}>
        Proceed to checkout
      </Link>
      {!compact && <LegalLinks />}
    </div>
  );
}
