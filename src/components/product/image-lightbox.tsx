"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { ProductImage } from "@/types/product";

interface ImageLightboxProps {
  images: ProductImage[];
  index: number;
  onIndexChange: (index: number) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
}

const CENTER = "50% 50%";

export function ImageLightbox({ images, index, onIndexChange, open, onOpenChange, title }: ImageLightboxProps) {
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState(CENTER);
  const image = images[index];

  const go = (next: number) => {
    setZoomed(false);
    setOrigin(CENTER);
    onIndexChange((next + images.length) % images.length);
  };

  const followPointer = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!zoomed) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setZoomed(false);
        onOpenChange(next);
      }}
    >
      <DialogContent
        onKeyDown={(event) => {
          if (images.length < 2) return;
          if (event.key === "ArrowLeft") go(index - 1);
          if (event.key === "ArrowRight") go(index + 1);
        }}
      >
        <DialogTitle className="sr-only">{title} image gallery</DialogTitle>

        <button
          type="button"
          onClick={() => setZoomed((value) => !value)}
          onPointerMove={followPointer}
          aria-label={zoomed ? "Zoom out" : "Zoom in"}
          className={`relative min-h-0 flex-1 overflow-hidden outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${zoomed ? "cursor-zoom-out" : "cursor-zoom-in"}`}
        >
          <Image
            src={image.url}
            alt={image.alt}
            fill
            sizes="100vw"
            className="object-contain transition-transform duration-200 motion-reduce:transition-none"
            style={{ transform: zoomed ? "scale(2.2)" : "none", transformOrigin: origin }}
          />
        </button>

        <div className="flex items-center justify-center gap-3 bg-black/60 p-3 text-white">
          {images.length > 1 && (
            <Button variant="secondary" size="icon" onClick={() => go(index - 1)}>
              <ChevronLeft aria-hidden />
              <span className="sr-only">Previous image</span>
            </Button>
          )}
          <p className="min-w-16 text-center text-sm" aria-live="polite">
            {index + 1} / {images.length}
          </p>
          {images.length > 1 && (
            <Button variant="secondary" size="icon" onClick={() => go(index + 1)}>
              <ChevronRight aria-hidden />
              <span className="sr-only">Next image</span>
            </Button>
          )}
          <Button variant="secondary" size="icon" onClick={() => setZoomed((value) => !value)}>
            {zoomed ? <ZoomOut aria-hidden /> : <ZoomIn aria-hidden />}
            <span className="sr-only">{zoomed ? "Zoom out" : "Zoom in"}</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
