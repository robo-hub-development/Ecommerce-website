interface DsSectionProps {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function DsSection({ id, title, description, children }: DsSectionProps) {
  return (
    <section aria-labelledby={`${id}-title`} className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 border-b pb-4">
        <h2 id={`${id}-title`} className="text-h2">
          {title}
        </h2>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}
