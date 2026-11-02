import { SectionHeader } from "@/components/layout/section-header";
import { cn } from "@/lib/utils";

type Tone = "default" | "surface" | "dark";

const toneClasses: Record<Tone, string> = {
  default: "bg-background",
  surface: "bg-surface",
  dark: "dark bg-background text-foreground",
};

interface SectionShellProps extends React.ComponentProps<typeof SectionHeader> {
  tone?: Tone;
  children: React.ReactNode;
}

export function SectionShell({
  tone = "default",
  children,
  className,
  ...header
}: SectionShellProps) {
  return (
    <section
      aria-labelledby={header.id}
      className={cn("section-y", toneClasses[tone], className)}
    >
      <div className="container-page">
        <SectionHeader {...header} className="" />
        {children}
      </div>
    </section>
  );
}
