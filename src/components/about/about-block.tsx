import Image from "next/image";
import { cn } from "@/lib/utils";

interface AboutBlockProps {
  id: string;
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
  image?: { src: string; alt: string };
  /** Put the image on the left on desktop. */
  reverse?: boolean;
}

/** Text + optional image, two columns on desktop and stacked on mobile. */
export function AboutBlock({ id, eyebrow, title, children, image, reverse }: AboutBlockProps) {
  return (
    <section aria-labelledby={id} className={cn("grid items-center gap-8 lg:gap-12", image && "lg:grid-cols-2")}>
      <div className={cn("flex flex-col gap-4", reverse && "lg:order-2")}>
        {eyebrow && <p className="text-eyebrow text-primary uppercase">{eyebrow}</p>}
        <h2 id={id} className="text-h2">
          {title}
        </h2>
        <div className="flex flex-col gap-4 text-muted-foreground">{children}</div>
      </div>
      {image && (
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-surface ring-1 ring-foreground/10">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 1280px) 584px, (min-width: 1024px) 45vw, 100vw"
            className="object-cover"
          />
        </div>
      )}
    </section>
  );
}
