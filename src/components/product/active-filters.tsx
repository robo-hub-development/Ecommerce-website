import Link from "next/link";
import { X } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { listingHref, withFilters } from "@/lib/listing";
import type { ListingParams } from "@/lib/validations/listing";

interface ActiveFiltersProps {
  basePath: string;
  params: ListingParams;
  /** Name of the selected category; omitted on category pages where it is fixed. */
  categoryName?: string;
}

function Chip({ label, href, removeLabel }: { label: string; href: string; removeLabel: string }) {
  return (
    <li>
      <Link
        href={href}
        scroll={false}
        aria-label={removeLabel}
        className="inline-flex h-8 items-center gap-1.5 rounded-full bg-primary-soft px-3 text-sm font-medium text-primary transition-colors hover:bg-primary/15"
      >
        {label}
        <X className="size-3.5" aria-hidden />
      </Link>
    </li>
  );
}

function priceLabel({ minPrice, maxPrice }: ListingParams) {
  if (minPrice !== undefined && maxPrice !== undefined) return `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`;
  if (minPrice !== undefined) return `From ${formatPrice(minPrice)}`;
  return `Up to ${formatPrice(maxPrice ?? 0)}`;
}

export function ActiveFilters({ basePath, params, categoryName }: ActiveFiltersProps) {
  const remove = (patch: Partial<ListingParams>) => listingHref(basePath, withFilters(params, patch));
  const hasPrice = params.minPrice !== undefined || params.maxPrice !== undefined;
  const hasCategory = Boolean(params.category && categoryName);
  if (!params.q && !hasCategory && !hasPrice) return null;

  return (
    <ul aria-label="Active filters" className="flex flex-wrap items-center gap-2">
      {params.q && (
        <Chip label={`"${params.q}"`} href={remove({ q: undefined })} removeLabel={`Remove search ${params.q}`} />
      )}
      {hasCategory && (
        <Chip
          label={categoryName!}
          href={remove({ category: undefined })}
          removeLabel={`Remove category ${categoryName}`}
        />
      )}
      {hasPrice && (
        <Chip
          label={priceLabel(params)}
          href={remove({ minPrice: undefined, maxPrice: undefined })}
          removeLabel="Remove price filter"
        />
      )}
      <li>
        <Link
          href={listingHref(basePath, { sort: params.sort })}
          scroll={false}
          className="rounded-sm px-1 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Clear all
        </Link>
      </li>
    </ul>
  );
}
