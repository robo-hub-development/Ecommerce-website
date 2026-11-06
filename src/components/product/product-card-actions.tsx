"use client";

import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAddToCart } from "@/hooks/use-add-to-cart";
import type { Product } from "@/types/product";

export function ProductCardActions({ product }: { product: Product }) {
  const router = useRouter();
  const addToCart = useAddToCart();

  const item = {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    image: product.image,
  };

  const handleAdd = () => addToCart(item);

  const handleBuyNow = async () => {
    if (await addToCart(item, 1, { announceSuccess: false })) router.push("/checkout");
  };

  return (
    <div className="relative z-10 flex flex-col gap-2 @[16rem]:flex-row">
      <Button
        variant="outline"
        className="flex-1 py-1"
        onClick={handleAdd}
        disabled={!product.inStock}
        aria-label={`Add ${product.name} to cart`}
      >
        <ShoppingCart data-icon="inline-start" aria-hidden />
        Add to cart
      </Button>
      <Button
        className="flex-1 py-1"
        onClick={handleBuyNow}
        disabled={!product.inStock}
        aria-label={`Buy ${product.name} now`}
      >
        Buy now
      </Button>
    </div>
  );
}
