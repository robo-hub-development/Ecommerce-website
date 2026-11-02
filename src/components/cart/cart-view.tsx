"use client";

import { CartEmpty } from "@/components/cart/cart-empty";
import { CartLine } from "@/components/cart/cart-line";
import { CartSummary } from "@/components/cart/cart-summary";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/use-cart";

function CartSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]" aria-busy="true" aria-label="Loading your cart">
      <div className="flex flex-col gap-5">
        {Array.from({ length: 2 }, (_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="size-24 rounded-lg" />
            <div className="flex flex-1 flex-col gap-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
        ))}
      </div>
      <Skeleton className="h-72 rounded-xl" />
    </div>
  );
}

export function CartView() {
  const { hydrated, items, count, bill, cod } = useCart();

  if (!hydrated) return <CartSkeleton />;
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-surface">
        <CartEmpty />
      </div>
    );
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <section aria-labelledby="cart-items-title" className="rounded-xl bg-card p-4 shadow-card ring-1 ring-foreground/10 sm:p-6">
        <h2 id="cart-items-title" className="sr-only">
          Cart items ({count})
        </h2>
        <ul className="divide-y">
          {items.map((item) => (
            <CartLine key={`${item.productId}:${item.variantId ?? ""}`} item={item} />
          ))}
        </ul>
      </section>

      <aside
        aria-labelledby="bill-title"
        className="rounded-xl bg-card p-4 shadow-card ring-1 ring-foreground/10 sm:p-6 lg:sticky lg:top-24"
      >
        <h2 id="bill-title" className="text-h3 mb-4">
          Bill summary
        </h2>
        <CartSummary bill={bill} cod={cod} />
      </aside>
    </div>
  );
}
