import { Inbox, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface StateMessageProps {
  variant: "empty" | "error";
  title?: string;
  description?: string;
  className?: string;
}

const defaults = {
  empty: { title: "Nothing here yet", description: "Check back soon for new items." },
  error: {
    title: "Something went wrong",
    description: "We couldn't load this section. Please try again shortly.",
  },
};

export function StateMessage({
  variant,
  title,
  description,
  className,
}: StateMessageProps) {
  const Icon = variant === "error" ? TriangleAlert : Inbox;
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "flex flex-col items-center gap-2 rounded-xl border border-dashed bg-surface px-6 py-12 text-center",
        className,
      )}
    >
      <Icon
        className={cn(
          "size-8",
          variant === "error" ? "text-destructive" : "text-muted-foreground",
        )}
        aria-hidden
      />
      <p className="font-semibold">{title ?? defaults[variant].title}</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        {description ?? defaults[variant].description}
      </p>
    </div>
  );
}
