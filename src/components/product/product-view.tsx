"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ShoppingCart, Star } from "lucide-react";
import { ProductGallery } from "@/components/product/product-gallery";
import { QuantityStepper } from "@/components/product/quantity-stepper";
import { ShareButton } from "@/components/product/share-button";
import { VariantSelector } from "@/components/product/variant-selector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { discountPercent, formatPrice } from "@/lib/format";
import { useAddToCart } from "@/hooks/use-add-to-cart";
import { MAX_QUANTITY_PER_PRODUCT } from "@/lib/cart-rules";
import type { ProductDetail } from "@/types/product";

interface ProductViewProps {
  product: ProductDetail;
  shareUrl: string;
}

/** Gallery plus buy box. They share state so picking a variant swaps the price, stock and image together. */
export function ProductView({ product, shareUrl }: ProductViewProps) {
  const router = useRouter();
  const addToCart = useAddToCart();

  const initialVariant = product.variants.find((v) => v.inStock) ?? product.variants[0];
  const [variantId, setVariantId] = useState(initialVariant?.id);
  const [imageIndex, setImageIndex] = useState(initialVariant?.imageIndex ?? 0);
  const [quantity, setQuantity] = useState(1);

  const variant = product.variants.find((v) => v.id === variantId);
  const price = variant?.price ?? product.price;
  const compareAtPrice = variant ? variant.compareAtPrice : product.compareAtPrice;
  const inStock = variant ? variant.inStock : product.inStock;
  const discount = discountPercent(price, compareAtPrice);

  const selectVariant = (id: string) => {
    setVariantId(id);
    const next = product.variants.find((v) => v.id === id);
    if (next) setImageIndex(next.imageIndex);
  };

  const cartItem = () => ({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price,
        compareAtPrice,
        image: product.images[imageIndex]?.url ?? product.image,
        variantId: variant?.id,
        variantLabel: variant?.label,
  });

  const handleAdd = () => addToCart(cartItem(), quantity);

  const handleBuyNow = async () => {
    if (await addToCart(cartItem(), quantity, { announceSuccess: false })) router.push("/checkout");
  };

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
      <ProductGallery
        images={product.images}
        activeIndex={imageIndex}
        onSelect={setImageIndex}
        title={product.name}
      />

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-muted-foreground">{product.categoryName}</p>
            {product.isNew && <Badge variant="secondary">New</Badge>}
          </div>
          <h1 className="text-h1">{product.name}</h1>
            <span style={{display:'flex', gap:'10px'}}>
            {product.reviewCount > 0 && (
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Star className="size-4 fill-warning text-warning" aria-hidden />
                <span className="font-medium text-foreground">{product.rating.toFixed(1)}</span>
                <span>({product.reviewCount} reviews)</span>
              </p>
            )}
            <ShareButton title={product.name} url={shareUrl} />
          </span>
          {product.summary && <p className="text-muted-foreground">{product.summary}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-3xl font-bold">{formatPrice(price)}</span>
            {discount > 0 && compareAtPrice && (
              <>
                <span className="sr-only">Original price</span>
                <s className="text-lg text-muted-foreground">{formatPrice(compareAtPrice)}</s>
                <Badge className="bg-destructive text-white">Save {discount}%</Badge>
              </>
            )}
          </p>
          <p className="text-xs text-muted-foreground">Inclusive of all taxes.</p>
          <p
            aria-live="polite"
            className={`flex items-center gap-1.5 text-sm font-medium ${inStock ? "text-success" : "text-destructive"}`}
          >
            {inStock && <Check className="size-4" aria-hidden />}
            {inStock ? "In stock" : "Out of stock"}
          </p>
        </div>

        {product.variants.length > 0 && variantId && (
          <VariantSelector
            label={product.variantLabel}
            variants={product.variants}
            selectedId={variantId}
            onSelect={selectVariant}
          />
        )}

        <QuantityStepper
          value={quantity}
          max={MAX_QUANTITY_PER_PRODUCT}
          onChange={setQuantity}
          disabled={!inStock}
        />

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" variant="outline" className="flex-1" onClick={handleAdd} disabled={!inStock}>
            <ShoppingCart data-icon="inline-start" aria-hidden />
            Add to cart
          </Button>
          <Button size="lg" className="flex-1" onClick={handleBuyNow} disabled={!inStock}>
            Buy now
          </Button>
        </div>
      </div>
    </div>
  );
}
