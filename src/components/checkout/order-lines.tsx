import Image from "next/image";
import { formatPrice } from "@/lib/format";
import type { CartItem } from "@/types/cart";

/** Read-only item list used by the checkout summary and the order confirmation. */
export function OrderLines({ items }: { items: Pick<CartItem, "productId" | "name" | "image" | "price" | "quantity">[] }) {
  return (
    <ul className="divide-y">
      {items.map((item) => (
        <li key={item.productId} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
          <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-surface ring-1 ring-foreground/10">
            <Image src={item.image} alt="" fill sizes="56px" className="object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-sm font-medium">{item.name}</p>
            <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
          </div>
          <p className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
        </li>
      ))}
    </ul>
  );
}
