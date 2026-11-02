import type { Metadata } from "next";
import { env } from "@/lib/env";
import { siteConfig } from "@/lib/site";
import type { ProductDetail } from "@/types/product";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: env.siteUrl,
    description: siteConfig.tagline,
    email: siteConfig.email,
    telephone: siteConfig.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address,
      addressCountry: "IN",
    },
    sameAs: Object.values(siteConfig.social).filter(Boolean),
  };
}

export const absoluteUrl = (pathOrUrl: string) =>
  /^https?:\/\//.test(pathOrUrl) ? pathOrUrl : `${env.siteUrl}${pathOrUrl}`;

interface MetadataInput {
  title: string;
  description: string;
  /** Canonical path, relative to the site origin. */
  path: string;
  image?: string;
  noindex?: boolean;
}

/** Title, description, canonical, Open Graph and Twitter in one place. */
export function buildMetadata({ title, description, path, image, noindex }: MetadataInput): Metadata {
  const images = image ? [{ url: absoluteUrl(image) }] : undefined;
  return {
    title,
    description,
    alternates: { canonical: path },
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: { title, description, url: path, siteName: siteConfig.name, type: "website", images },
    twitter: { card: "summary_large_image", title, description, images: images?.map((i) => i.url) },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function productSchema(product: ProductDetail) {
  const url = absoluteUrl(`/products/${product.slug}`);
  const offer = (price: number, inStock: boolean, name?: string) => ({
    "@type": "Offer",
    ...(name ? { name } : {}),
    url,
    price,
    priceCurrency: "INR",
    availability: `https://schema.org/${inStock ? "InStock" : "OutOfStock"}`,
    itemCondition: "https://schema.org/NewCondition",
  });

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.summary || product.description.split("\n")[0],
    sku: product.id,
    category: product.categoryName,
    image: product.images.map((image) => absoluteUrl(image.url)),
    url,
    brand: { "@type": "Brand", name: siteConfig.name },
    offers:
      product.variants.length > 0
        ? product.variants.map((variant) => offer(variant.price, variant.inStock, variant.label))
        : offer(product.price, product.inStock),
    ...(product.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          },
        }
      : {}),
  };
}
