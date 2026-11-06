import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CartError({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <CircleAlert className="size-10 text-destructive" aria-hidden />
      <p className="text-lg font-semibold">We couldn&apos;t load your cart</p>
      <p className="max-w-xs text-sm text-muted-foreground">Check your connection and try again.</p>
      <Button className="mt-2" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
