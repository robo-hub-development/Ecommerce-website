import { HeroCarousel } from "@/components/home/hero-carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { StateMessage } from "@/components/ui/state-message";
import { getHeroSlides } from "@/lib/api/home";

export function HeroSkeleton() {
  return (
    <div
      className="container-page grid items-center gap-8 py-8 md:grid-cols-2 md:py-16 lg:py-20"
      aria-busy="true"
    >
      <Skeleton className="aspect-[16/10] w-full rounded-2xl md:order-last md:aspect-[4/3]" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-12 w-full max-w-md" />
        <Skeleton className="h-6 w-full max-w-sm" />
        <Skeleton className="h-12 w-40" />
      </div>
    </div>
  );
}

export async function HeroSection() {
  const slides = await getHeroSlides().catch(() => null);

  return (
    <section aria-label="Featured" className="dark bg-background text-foreground">
      {slides === null ? (
        <div className="container-page py-12">
          <StateMessage variant="error" />
        </div>
      ) : slides.length === 0 ? (
        <div className="container-page py-12">
          <StateMessage variant="empty" title="No promotions right now" />
        </div>
      ) : (
        <HeroCarousel slides={slides} />
      )}
    </section>
  );
}
