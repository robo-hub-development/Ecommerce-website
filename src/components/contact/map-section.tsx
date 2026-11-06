import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";

export function MapSection() {
  return (
    <section aria-labelledby="map-title" className="flex flex-col gap-4">
      <h2 id="map-title" className="text-h2">
        Find us on the map
      </h2>
      <div className="overflow-hidden rounded-2xl bg-surface shadow-card ring-1 ring-foreground/10">
        <iframe
          src={site.mapsEmbed}
          title={`Map showing the location of ${site.name}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          className="aspect-4/3 w-full border-0 sm:aspect-video lg:aspect-21/9"
        />
      </div>
      <Button
        variant="outline"
        size="lg"
        className="w-fit"
        nativeButton={false}
        render={<a href={site.mapsLink} target="_blank" rel="noopener noreferrer" />}
      >
        Open in Google Maps
        <ExternalLink aria-hidden />
        <span className="sr-only"> (opens in a new tab)</span>
      </Button>
    </section>
  );
}
