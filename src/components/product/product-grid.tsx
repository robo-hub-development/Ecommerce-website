import { cn } from "@/lib/utils";

export function ProductGrid({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4",
        className,
      )}
      {...props}
    />
  );
}
