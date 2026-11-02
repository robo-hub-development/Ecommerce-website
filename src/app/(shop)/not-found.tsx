import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center gap-4 py-24 text-center">
      <p className="text-eyebrow text-primary uppercase">404</p>
      <h1 className="text-h1">Page not found</h1>
      <p className="max-w-md text-muted-foreground">
        The page you are looking for has moved or no longer exists.
      </p>
      <Link href="/products" className={buttonVariants({ size: "lg" })}>
        Browse products
      </Link>
    </div>
  );
}
