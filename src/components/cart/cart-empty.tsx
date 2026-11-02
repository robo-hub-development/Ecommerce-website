import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function CartEmpty({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div role="status" className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <ShoppingCart className="size-10 text-muted-foreground" aria-hidden />
      <p className="text-lg font-semibold">Your cart is empty</p>
      <p className="max-w-xs text-sm text-muted-foreground">
        Browse robot kits, drones, boards and sensors to get started.
      </p>
      <Link href="/products" onClick={onNavigate} className={buttonVariants({ className: "mt-2" })}>
        Start shopping
      </Link>
    </div>
  );
}
