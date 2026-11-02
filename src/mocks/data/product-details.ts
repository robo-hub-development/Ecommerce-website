import { mockProducts } from "@/mocks/data/products";
import type { ProductDetail, ProductVariant } from "@/types/product";

// Only placeholder artwork exists locally, so extra gallery angles reuse the generic wide images.
const GALLERY_EXTRAS = ["/images/wide-1.svg", "/images/wide-2.svg", "/images/wide-3.svg", "/images/wide-4.svg"];

interface VariantSpec {
  label: string;
  options: { label: string; priceFactor: number; inStock?: boolean }[];
}

const variantsByCategory: Record<string, VariantSpec> = {
  "robot-kits": {
    label: "Edition",
    options: [
      { label: "Standard", priceFactor: 1 },
      { label: "Pro (extra sensors)", priceFactor: 1.3 },
      { label: "Classroom pack of 5", priceFactor: 4.2, inStock: false },
    ],
  },
  drones: {
    label: "Bundle",
    options: [
      { label: "Single battery", priceFactor: 1 },
      { label: "Fly More combo", priceFactor: 1.25 },
    ],
  },
  "arduino-boards": {
    label: "Pack",
    options: [
      { label: "Single board", priceFactor: 1 },
      { label: "Pack of 3", priceFactor: 2.7 },
    ],
  },
};

const roundPrice = (value: number) => Math.round(value / 10) * 10 - 1;

function buildVariants(price: number, compareAtPrice: number | undefined, categorySlug: string) {
  const spec = variantsByCategory[categorySlug];
  if (!spec) return { variantLabel: "Option", variants: [] as ProductVariant[] };
  const variants = spec.options.map<ProductVariant>((option, index) => ({
    id: `v${index + 1}`,
    label: option.label,
    price: index === 0 ? price : roundPrice(price * option.priceFactor),
    compareAtPrice:
      compareAtPrice === undefined
        ? undefined
        : index === 0
          ? compareAtPrice
          : roundPrice(compareAtPrice * option.priceFactor),
    inStock: option.inStock ?? true,
    imageIndex: Math.min(index, GALLERY_EXTRAS.length),
  }));
  return { variantLabel: spec.label, variants };
}

export const mockProductDetails: ProductDetail[] = mockProducts.map((product, index) => ({
  ...product,
  description: [
    `${product.summary} The ${product.name} is built for makers, students and engineers who want reliable hardware and clear documentation.`,
    "Every unit is tested before dispatch and ships with wiring diagrams, example code and access to our build guides.",
    "Covered by a 12-month replacement warranty. GST invoice provided on request.",
  ].join("\n\n"),
  // Vary the gallery size (2 to 5 images) so every layout gets exercised.
  images: [product.image, ...GALLERY_EXTRAS.slice(0, 1 + (index % 4))].map((url, position) => ({
    url,
    alt: `${product.name}, view ${position + 1}`,
  })),
  ...buildVariants(product.price, product.compareAtPrice, product.categorySlug),
}));
