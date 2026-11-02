"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HeroSlide } from "@/types/content";

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [plugins] = useState(() => [
    Autoplay({
      delay: 6000,
      stopOnInteraction: true,
      stopOnMouseEnter: true,
      playOnInit:
        typeof window !== "undefined" &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    }),
  ]);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, plugins);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const sync = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", sync).on("reInit", sync);
    return () => {
      emblaApi.off("select", sync).off("reInit", sync);
    };
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured promotions"
      className="relative"
    >
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${slides.length}`}
              className="min-w-0 flex-[0_0_100%]"
            >
              <div className="container-page grid items-center gap-8 py-8 md:grid-cols-2 md:gap-12 md:py-16 lg:py-20">
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl ring-1 ring-foreground/10 md:order-last md:aspect-[4/3]">
                  <Image
                    src={slide.image}
                    alt={slide.imageAlt}
                    fill
                    priority={index === 0}
                    sizes="(min-width: 1280px) 576px, (min-width: 768px) 45vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col items-start gap-4 pb-8 md:pb-0">
                  <p className="text-eyebrow text-cyan uppercase">{slide.eyebrow}</p>
                  <h2 className="text-h1 lg:text-display">{slide.title}</h2>
                  <p className="max-w-md text-lead text-muted-foreground">
                    {slide.description}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-3">
                    <Link
                      href={slide.primaryCta.href}
                      className={buttonVariants({ size: "lg" })}
                      tabIndex={index === selected ? 0 : -1}
                    >
                      {slide.primaryCta.label}
                    </Link>
                    {slide.secondaryCta && (
                      <Link
                        href={slide.secondaryCta.href}
                        className={buttonVariants({ size: "lg", variant: "outline" })}
                        tabIndex={index === selected ? 0 : -1}
                      >
                        {slide.secondaryCta.label}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container-page absolute inset-x-0 bottom-3 flex items-center justify-between md:bottom-6">
        <div className="flex items-center gap-2" role="group" aria-label="Choose slide">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === selected}
              className="flex size-6 items-center justify-center"
            >
              <span
                className={cn(
                  "h-1.5 rounded-full bg-foreground/30 transition-all",
                  index === selected ? "w-8 bg-primary" : "w-3",
                )}
              />
            </button>
          ))}
        </div>
        <div className="hidden gap-2 md:flex">
          <Button
            variant="outline"
            size="icon"
            onClick={() => emblaApi?.scrollPrev()}
            aria-label="Previous slide"
          >
            <ChevronLeft aria-hidden />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => emblaApi?.scrollNext()}
            aria-label="Next slide"
          >
            <ChevronRight aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
