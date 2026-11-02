"use client";

import { cn } from "@/lib/utils";
import type { ProductVariant } from "@/types/product";

interface VariantSelectorProps {
  label: string;
  variants: ProductVariant[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function VariantSelector({ label, variants, selectedId, onSelect }: VariantSelectorProps) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-col gap-2">
      <p className="text-sm font-semibold">{label}</p>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const selected = variant.id === selectedId;
          return (
            <button
              key={variant.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onSelect(variant.id)}
              className={cn(
                "flex min-h-10 flex-col items-start rounded-lg border px-3 py-2 text-left text-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                selected
                  ? "border-primary bg-primary-soft font-semibold text-primary"
                  : "border-border bg-background hover:bg-muted",
                !variant.inStock && "text-muted-foreground",
              )}
            >
              {variant.label}
              {!variant.inStock && <span className="text-xs font-normal">Out of stock</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
