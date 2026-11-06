import Image from "next/image";
import { InstagramIcon } from "@/components/ui/social-icons";
import type { InstagramPost } from "@/types/content";

export function InstagramCard({ post }: { post: InstagramPost }) {
  return (
    <a
      href={post.permalink}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block aspect-[3/4] overflow-hidden rounded-xl ring-1 ring-foreground/10"
    >
      <Image
        src={post.thumbnail}
        alt={post.caption}
        fill
        sizes="(min-width: 1280px) 192px, (min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
      />
      <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition group-hover:bg-black/45 group-hover:opacity-100 group-focus-visible:bg-black/45 group-focus-visible:opacity-100">
        <InstagramIcon className="size-7" />
        <span className="sr-only">View on Instagram (opens in a new tab)</span>
      </span>
    </a>
  );
}
