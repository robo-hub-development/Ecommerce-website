"use client";

import { useState } from "react";
import Image from "next/image";
import { Maximize2 } from "lucide-react";
import { ImageLightbox } from "@/components/product/image-lightbox";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types/product";

interface ProductGalleryProps {
  images: ProductImage[];
  activeIndex: number;
  onSelect: (index: number) => void;
  title: string;
}

export function ProductGallery({ images, activeIndex, onSelect, title }: ProductGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const active = images[activeIndex];

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className="group relative aspect-square overflow-hidden rounded-xl bg-surface ring-1 ring-foreground/10 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Image
          src={active.url}
          alt={active.alt}
          fill
          priority
          sizes="(min-width: 1280px) 600px, (min-width: 768px) 50vw, 100vw"
          className="cursor-zoom-in object-cover"
        />
        <span className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium shadow-card">
          <Maximize2 className="size-3.5" aria-hidden />
          Zoom
        </span>
        <span className="sr-only">Open {title} image gallery</span>
      </button>

      {images.length > 1 && (
        <ul className="flex gap-2 overflow-x-auto pb-1" aria-label="Product images">
          {images.map((image, index) => (
            <li key={image.url + index} className="shrink-0">
              <button
                type="button"
                onClick={() => onSelect(index)}
                aria-pressed={index === activeIndex}
                aria-label={`Show image ${index + 1} of ${images.length}`}
                className={cn(
                  "relative block size-16 overflow-hidden rounded-lg bg-surface ring-1 ring-foreground/10 outline-none transition focus-visible:ring-3 focus-visible:ring-ring/50 sm:size-20",
                  index === activeIndex ? "ring-2 ring-primary" : "opacity-70 hover:opacity-100",
                )}
              >
                <Image src={image.url} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <ImageLightbox
        images={images}
        index={activeIndex}
        onIndexChange={onSelect}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        title={title}
      />
    </div>
  );
}
