"use client";

import { useId } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuantityStepperProps {
  value: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  /** Smaller controls for cart rows; the label stays available to screen readers. */
  compact?: boolean;
  /** Accessible name, e.g. the product name in a cart row. */
  label?: string;
}

export function QuantityStepper({
  value,
  max,
  onChange,
  disabled,
  compact,
  label = "Quantity",
}: QuantityStepperProps) {
  const labelId = useId();
  const atMax = value >= max;
  const size = compact ? "icon-sm" : "icon";

  return (
    <div className="flex flex-col gap-2">
      <p id={labelId} className={cn("text-sm font-semibold", compact && "sr-only")}>
        {label}
      </p>
      <div role="group" aria-labelledby={labelId} className="flex items-center gap-1">
        <Button
          variant="outline"
          size={size}
          onClick={() => onChange(value - 1)}
          disabled={disabled || value <= 1}
        >
          <Minus aria-hidden />
          <span className="sr-only">Decrease quantity</span>
        </Button>
        <output
          className={cn("text-center font-semibold tabular-nums", compact ? "w-9 text-sm" : "w-12")}
          aria-live="polite"
        >
          {value}
        </output>
        <Button
          variant="outline"
          size={size}
          onClick={() => onChange(value + 1)}
          disabled={disabled || atMax}
        >
          <Plus aria-hidden />
          <span className="sr-only">Increase quantity</span>
        </Button>
      </div>
      {atMax && (
        <p role="status" className="rounded-md bg-warning/15 px-2 py-1 text-xs font-medium text-foreground">
          Maximum {max} per product reached
        </p>
      )}
    </div>
  );
}
