"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { CartEmpty } from "@/components/cart/cart-empty";
import { CartLine } from "@/components/cart/cart-line";
import { CartError } from "@/components/cart/cart-states";
import { CartSummary } from "@/components/cart/cart-summary";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCart } from "@/hooks/use-cart";

/**
 * Header cart slot. The slot is always 40px wide so the header never shifts; the icon itself exists only for
 * signed-in shoppers (nothing is rendered for guests, or before the saved sign-in state is read after hydration).
 */
export function CartButton() {
  const { signedIn } = useCart();
  return <div className="size-10 shrink-0">{signedIn && <MiniCart />}</div>;
}

/** Cart icon with the live count; opens the mini cart. The full page lives at /cart. */
function MiniCart() {
  const [open, setOpen] = useState(false);
  const { loading, error, refetch, items, count, bill, cod } = useCart();
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" className="relative" />}
        aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}
      >
        <ShoppingCart aria-hidden />
        {count > 0 && (
          <span className="absolute top-0.5 right-0.5 flex min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[0.6875rem] leading-5 font-semibold text-white">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </SheetTrigger>

      <SheetContent side="right" className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle>Your cart ({count})</SheetTitle>
          <SheetDescription className="sr-only">Review the items in your cart and check out.</SheetDescription>
        </SheetHeader>

        {loading || error || items.length === 0 ? (
          <div className="flex-1 overflow-y-auto" aria-busy={loading}>
            {loading ? (
              <div className="flex flex-col gap-4 p-4" aria-label="Loading your cart">
                {Array.from({ length: 2 }, (_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
              </div>
            ) : error ? (
              <CartError onRetry={() => void refetch()} />
            ) : (
              <CartEmpty onNavigate={close} />
            )}
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y overflow-y-auto p-4">
              {items.map((item) => (
                <CartLine key={`${item.productId}:${item.variantId ?? ""}`} item={item} onNavigate={close} />
              ))}
            </ul>
            <SheetFooter className="border-t bg-surface">
              <CartSummary bill={bill} cod={cod} compact onNavigate={close} />
              <Link href="/cart" onClick={close} className={buttonVariants({ variant: "outline" })}>
                View full cart
              </Link>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
