"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { QuantityStepper } from "@/components/product/quantity-stepper";
import { Button } from "@/components/ui/button";
import { MAX_QUANTITY_PER_PRODUCT } from "@/lib/cart-rules";
import { formatPrice } from "@/lib/format";
import { useCartActions } from "@/hooks/use-cart-actions";
import type { CartItem } from "@/types/cart";

interface CartLineProps {
  item: CartItem;
  /** Called when the shopper follows the product link (lets the mini cart close). */
  onNavigate?: () => void;
}

export function CartLine({ item, onNavigate }: CartLineProps) {
  const { pending, add, setQuantity, remove } = useCartActions();

  const line = { productId: item.productId, variantId: item.variantId };
  const { quantity: _quantity, ...product } = item;
  void _quantity;

  const handleRemove = async () => {
    if (!(await remove(line))) return;
    toast(`Removed ${item.name}`, {
      action: { label: "Undo", onClick: () => void add(product, item.quantity) },
    });
  };

  return (
    <li className="flex gap-4 py-5 first:pt-0 last:pb-0">
      <Link
        href={`/products/${item.slug}`}
        onClick={onNavigate}
        className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-surface ring-1 ring-foreground/10 sm:size-24"
      >
        <Image src={item.image} alt="" fill sizes="96px" className="object-cover" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-sm leading-snug font-semibold sm:text-base">
              <Link href={`/products/${item.slug}`} onClick={onNavigate} className="rounded-sm hover:text-primary">
                {item.name}
              </Link>
            </h3>
            {item.variantLabel && <p className="mt-0.5 text-sm text-muted-foreground">{item.variantLabel}</p>}
          </div>
          <Button variant="ghost" size="icon-sm" onClick={handleRemove} disabled={pending}>
            <Trash2 aria-hidden />
            <span className="sr-only">Remove {item.name} from cart</span>
          </Button>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <QuantityStepper
            compact
            label={`Quantity of ${item.name}`}
            value={item.quantity}
            max={MAX_QUANTITY_PER_PRODUCT}
            disabled={pending}
            onChange={(next) => void setQuantity(line, next)}
          />
          <p className="text-right">
            <span className="block font-bold">{formatPrice(item.price * item.quantity)}</span>
            {item.quantity > 1 && (
              <span className="block text-xs text-muted-foreground">{formatPrice(item.price)} each</span>
            )}
          </p>
        </div>
      </div>
    </li>
  );
}
