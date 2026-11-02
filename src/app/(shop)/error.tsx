"use client";

import { Button } from "@/components/ui/button";

export default function ShopError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-page flex flex-col items-center gap-4 py-24 text-center">
      <h1 className="text-h1">Something went wrong</h1>
      <p className="max-w-md text-muted-foreground">
        We couldn&apos;t load this page. Please try again.
      </p>
      <Button size="lg" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
