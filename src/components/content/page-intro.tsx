import { Breadcrumbs, type Crumb } from "@/components/layout/breadcrumbs";

interface PageIntroProps {
  crumbs: Crumb[];
  title: string;
  description?: string;
}

/** Breadcrumbs + h1 + lead paragraph shared by the content pages. */
export function PageIntro({ crumbs, title, description }: PageIntroProps) {
  return (
    <header className="flex flex-col gap-4">
      <Breadcrumbs items={crumbs} />
      <h1 className="text-h1">{title}</h1>
      {description && <p className="max-w-2xl text-lg text-muted-foreground">{description}</p>}
    </header>
  );
}
