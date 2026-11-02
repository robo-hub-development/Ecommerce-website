import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProductCardActions } from "@/components/product/product-card-actions";
import { discountPercent, formatPrice } from "@/lib/format";
import type { Product } from "@/types/product";

const IMAGE_SIZES =
  "(min-width: 1280px) 296px, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw";

export function ProductCard({ product }: { product: Product }) {
  const discount = discountPercent(product.price, product.compareAtPrice);

  return (
    <article className="group @container relative flex h-full flex-col overflow-hidden rounded-xl bg-card shadow-card ring-1 ring-foreground/10 transition duration-300 hover:-translate-y-0.5 hover:shadow-card-hover motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="relative aspect-square overflow-hidden bg-surface">
        <Image
          src={product.image}
          alt=""
          fill
          sizes={IMAGE_SIZES}
          className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
        />
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
          {discount > 0 && (
            <Badge className="bg-destructive text-white">-{discount}%</Badge>
          )}
          {product.isNew && <Badge variant="secondary">New</Badge>}
        </div>
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <Badge variant="outline" className="bg-background">
              Out of stock
            </Badge>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-3 @[16rem]:p-4">
        <div className="flex flex-1 flex-col gap-1.5">
          <p className="text-xs text-muted-foreground">{product.categoryName}</p>
          <h3 className="line-clamp-2 text-sm leading-snug font-semibold @[16rem]:text-base">
            <Link
              href={`/products/${product.slug}`}
              className="rounded-sm after:absolute after:inset-0 after:content-['']"
            >
              {product.name}
            </Link>
          </h3>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="size-3.5 fill-warning text-warning" aria-hidden />
            <span className="font-medium text-foreground">
              {product.rating.toFixed(1)}
            </span>
            <span>({product.reviewCount})</span>
            <span className="sr-only">rating from {product.reviewCount} reviews</span>
          </p>
        </div>

        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-base font-bold @[16rem]:text-lg">
            {formatPrice(product.price)}
          </span>
          {discount > 0 && product.compareAtPrice && (
            <>
              <span className="sr-only">Original price</span>
              <s className="text-sm text-muted-foreground">
                {formatPrice(product.compareAtPrice)}
              </s>
            </>
          )}
        </p>

        <ProductCardActions product={product} />
      </div>
    </article>
  );
}
