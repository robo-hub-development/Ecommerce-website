import type { Bill } from "@/lib/cart-rules";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

function Row({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

/** Items total, discount, shipping and grand total. Shared by the cart and checkout summaries. */
export function BillBreakdown({ bill }: { bill: Bill }) {
  return (
    <dl className="flex flex-col gap-3 text-sm">
      <Row label="Items total" value={formatPrice(bill.itemsTotal)} />
      <Row
        label="Discount"
        value={bill.discount > 0 ? `− ${formatPrice(bill.discount)}` : formatPrice(0)}
        className={bill.discount > 0 ? "[&_dd]:text-success" : undefined}
      />
      <Row
        label="Shipping"
        value={bill.shipping === 0 ? <span className="text-success">Free</span> : formatPrice(bill.shipping)}
      />
      <div className="flex items-center justify-between gap-4 border-t pt-3 text-base">
        <dt className="font-semibold">Grand total</dt>
        <dd className="text-lg font-bold">{formatPrice(bill.grandTotal)}</dd>
      </div>
    </dl>
  );
}
