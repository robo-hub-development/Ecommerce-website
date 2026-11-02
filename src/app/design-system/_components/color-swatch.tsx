import { cn } from "@/lib/utils";

interface ColorSwatchProps {
  name: string;
  className: string;
}

export function ColorSwatch({ name, className }: ColorSwatchProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className={cn("h-16 rounded-lg border", className)} />
      <p className="font-mono text-xs text-muted-foreground">{name}</p>
    </div>
  );
}
