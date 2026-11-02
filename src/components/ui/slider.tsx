"use client";

import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import { cn } from "@/lib/utils";

interface SliderProps extends Omit<SliderPrimitive.Root.Props<number[]>, "value" | "defaultValue"> {
  value: number[];
  /** One accessible name per thumb, e.g. ["Minimum price", "Maximum price"]. */
  thumbLabels: string[];
}

function Slider({ className, value, thumbLabels, ...props }: SliderProps) {
  return (
    <SliderPrimitive.Root data-slot="slider" value={value} className={cn("w-full", className)} {...props}>
      <SliderPrimitive.Control className="flex h-6 w-full touch-none items-center select-none">
        <SliderPrimitive.Track className="h-1.5 w-full rounded-full bg-muted">
          <SliderPrimitive.Indicator className="rounded-full bg-primary" />
          {value.map((_, index) => (
            <SliderPrimitive.Thumb
              key={index}
              index={index}
              getAriaLabel={() => thumbLabels[index] ?? ""}
              className="size-5 rounded-full border-2 border-primary bg-background shadow-card outline-none transition-shadow focus-within:ring-3 focus-within:ring-ring/50 hover:shadow-card-hover has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50"
            />
          ))}
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { Slider };
