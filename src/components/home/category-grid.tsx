import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { SectionShell } from "@/components/layout/section-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { StateMessage } from "@/components/ui/state-message";
import { getCategories } from "@/lib/api/categories";

const GRID = "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6";

function CategoryGridSkeleton() {
  return (
    <div className={GRID} aria-busy="true" aria-label="Loading categories">
      {Array.from({ length: 6 }, (_, i) => (
        <Skeleton key={i} className="aspect-square rounded-xl" />
      ))}
    </div>
  );
}

async function Categories() {
  const categories = await getCategories().catch(() => null);
  if (categories === null) return <StateMessage variant="error" />;
  if (categories.length === 0)
    return <StateMessage variant="empty" title="No categories yet" />;

  return (
    <ul className={GRID}>
      {categories.map((category) => (
        <li key={category.slug}>
          <Link
            href={`/category/${category.slug}`}
            className="group relative block aspect-square overflow-hidden rounded-xl shadow-card ring-1 ring-foreground/10 transition duration-300 hover:-translate-y-0.5 hover:shadow-card-hover motion-reduce:transition-none"
          >
            <Image
              src={category.image}
              alt=""
              fill
              sizes="(min-width: 1280px) 192px, (min-width: 1024px) 16vw, (min-width: 768px) 33vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex flex-col p-3 text-white sm:p-4">
              <span className="leading-tight font-semibold">{category.name}</span>
              <span className="text-xs text-white/80">
                {category.productCount} products
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function CategoryGrid() {
  return (
    <SectionShell
      id="categories-title"
      eyebrow="Shop by category"
      title="Everything you need to build"
      action={{ label: "All products", href: "/products" }}
    >
      <Suspense fallback={<CategoryGridSkeleton />}>
        <Categories />
      </Suspense>
    </SectionShell>
  );
}
