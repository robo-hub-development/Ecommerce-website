import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { BackToTop } from "@/components/policy/back-to-top";
import { PolicyArticle } from "@/components/policy/policy-article";
import { PolicyToc } from "@/components/policy/policy-toc";
import type { Policy } from "@/lib/policies";

/** Shared legal-page layout: header, sticky/collapsible TOC, readable article column. */
export function PolicyPage({ policy }: { policy: Policy }) {
  return (
    <div className="container-page flex flex-col gap-8 py-8 lg:py-12">
      <div data-print-hide>
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: policy.title }]} />
      </div>
      <header className="flex flex-col gap-2 border-b pb-6">
        <h1 className="text-h1">{policy.title}</h1>
        <p className="text-sm text-muted-foreground">
          Last Updated:{" "}
          {policy.lastUpdated.startsWith("[") ? (
            <mark className="policy-todo">{policy.lastUpdated}</mark>
          ) : (
            policy.lastUpdated
          )}
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,760px)] lg:gap-12">
        <aside>
          <PolicyToc headings={policy.headings} />
        </aside>
        <article>
          <PolicyArticle body={policy.body} />
        </article>
      </div>
      <BackToTop />
    </div>
  );
}
